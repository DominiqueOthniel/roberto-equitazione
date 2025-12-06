/**
 * Customer utility functions with Supabase synchronization
 */

import { supabase } from '@/lib/supabase';

/**
 * Get user ID from localStorage or Supabase session
 */
async function getUserId() {
  if (typeof window === 'undefined') return null;
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      return session.user.id;
    }
  } catch (error) {
    console.warn('Erreur getSession:', error);
  }
  
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      return userData.id || userData.email;
    } catch {
      return null;
    }
  }
  
  return null;
}

/**
 * Register a new customer or update existing one
 */
export async function registerCustomer(userData) {
  try {
    // Formater l'adresse si elle existe
    let formattedAddress = null;
    if (userData.address) {
      formattedAddress = {
        street: userData.address.street || userData.address.via || '',
        numeroCivico: userData.address.numeroCivico || '',
        city: userData.address.city || userData.address.citta || '',
        province: userData.address.province || userData.address.provincia || '',
        cap: userData.address.cap || '',
        country: userData.address.country || userData.address.paese || 'Italia'
      };
    } else if (userData.shippingAddress) {
      formattedAddress = {
        street: userData.shippingAddress.via || '',
        numeroCivico: userData.shippingAddress.numeroCivico || '',
        city: userData.shippingAddress.citta || '',
        province: userData.shippingAddress.provincia || '',
        cap: userData.shippingAddress.cap || '',
        country: userData.shippingAddress.paese || 'Italia'
      };
    }

    const customerData = {
      name: userData.name || `${userData.nome || ''} ${userData.cognome || ''}`.trim() || 'Cliente',
      email: userData.email || '',
      phone: userData.phone || userData.telefono || '',
      address: formattedAddress,
      is_verified: userData.isVerified || false,
    };

    console.log('Enregistrement client dans Supabase:', customerData);

    // Vérifier si le client existe déjà
    const { data: existing, error: checkError } = await supabase
      .from('customers')
      .select('*')
      .eq('email', customerData.email)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Erreur lors de la vérification du client:', checkError);
      throw checkError;
    }

    let result;
    if (existing) {
      console.log('Client existant trouvé, mise à jour...');
      // Mettre à jour
      const { data, error } = await supabase
        .from('customers')
        .update({
          ...customerData,
          updated_at: new Date().toISOString(),
        })
        .eq('email', customerData.email)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour du client:', error);
        console.error('Détails:', error.message, error.details, error.hint);
        throw error;
      }
      result = data;
      console.log('Client mis à jour avec succès:', result);
    } else {
      console.log('Nouveau client, création...');
      // Créer nouveau
      const { data, error } = await supabase
        .from('customers')
        .insert(customerData)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création du client:', error);
        console.error('Détails:', error.message, error.details, error.hint);
        throw error;
      }
      result = data;
      console.log('Client créé avec succès:', result);
    }

    // Cache local
    if (typeof window !== 'undefined') {
      const customers = await getCustomers();
      const updated = existing 
        ? customers.map(c => c.email === customerData.email ? result : c)
        : [...customers, result];
      localStorage.setItem('customers', JSON.stringify(updated));
      
      window.dispatchEvent(new CustomEvent('customersUpdated', { 
        detail: { 
          customer: result,
          isNew: !existing
        } 
      }));
    }

    return result;
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du client:', error);
    // Fallback localStorage
    return registerCustomerLocalStorage(userData);
  }
}

/**
 * Get all customers
 */
export async function getCustomers() {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Cache local
    if (typeof window !== 'undefined') {
      localStorage.setItem('customers', JSON.stringify(data || []));
    }

    return data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des clients:', error);
    // Fallback localStorage
    return getCustomersLocalStorage();
  }
}

/**
 * Update customer order statistics
 */
export async function updateCustomerOrderStats(email, orderTotal) {
  try {
    const { data: customer } = await supabase
      .from('customers')
      .select('*')
      .eq('email', email)
      .single();

    if (!customer) return;

    const { error } = await supabase
      .from('customers')
      .update({
        total_orders: (customer.total_orders || 0) + 1,
        total_spent: (customer.total_spent || 0) + orderTotal,
        last_order_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('email', email);

    if (error) throw error;

    // Mettre à jour le cache
    if (typeof window !== 'undefined') {
      const customers = await getCustomers();
      localStorage.setItem('customers', JSON.stringify(customers));
      window.dispatchEvent(new CustomEvent('customersUpdated'));
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour des statistiques:', error);
    updateCustomerOrderStatsLocalStorage(email, orderTotal);
  }
}

// Fallback functions (localStorage)
function registerCustomerLocalStorage(userData) {
  if (typeof window === 'undefined') return null;
  
  try {
    const storedCustomers = localStorage.getItem('customers');
    const customers = storedCustomers ? JSON.parse(storedCustomers) : [];
    
    const existingCustomerIndex = customers.findIndex(
      c => c.email === userData.email
    );
    
    const customerData = {
      id: existingCustomerIndex >= 0 
        ? customers[existingCustomerIndex].id 
        : (customers.length > 0 ? Math.max(...customers.map(c => c.id || 0)) + 1 : 1),
      name: userData.name || `${userData.nome || ''} ${userData.cognome || ''}`.trim() || 'Cliente',
      email: userData.email || '',
      phone: userData.phone || userData.telefono || '',
      memberSince: userData.memberSince || new Date().toLocaleDateString('it-IT'),
      totalOrders: existingCustomerIndex >= 0 ? (customers[existingCustomerIndex].totalOrders || 0) : 0,
      totalSpent: existingCustomerIndex >= 0 ? (customers[existingCustomerIndex].totalSpent || 0) : 0,
      status: existingCustomerIndex >= 0 ? (customers[existingCustomerIndex].status || 'Actif') : 'Actif',
      lastOrder: existingCustomerIndex >= 0 ? (customers[existingCustomerIndex].lastOrder || null) : null,
      address: userData.address,
      isVerified: userData.isVerified || false,
    };
    
    if (existingCustomerIndex >= 0) {
      customers[existingCustomerIndex] = { ...customers[existingCustomerIndex], ...customerData };
    } else {
      customers.push(customerData);
    }
    
    localStorage.setItem('customers', JSON.stringify(customers));
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('customersUpdated', { 
        detail: { 
          customer: customerData,
          isNew: existingCustomerIndex < 0
        } 
      }));
    }
    
    return customerData;
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du client:', error);
    return null;
  }
}

function getCustomersLocalStorage() {
  if (typeof window === 'undefined') return [];
  
  try {
    const storedCustomers = localStorage.getItem('customers');
    return storedCustomers ? JSON.parse(storedCustomers) : [];
  } catch (error) {
    console.error('Erreur lors de la lecture des clients:', error);
    return [];
  }
}

function updateCustomerOrderStatsLocalStorage(email, orderTotal) {
  if (typeof window === 'undefined') return;
  
  try {
    const customers = getCustomersLocalStorage();
    const customerIndex = customers.findIndex(c => c.email === email);
    
    if (customerIndex >= 0) {
      customers[customerIndex].totalOrders = (customers[customerIndex].totalOrders || 0) + 1;
      customers[customerIndex].totalSpent = (customers[customerIndex].totalSpent || 0) + orderTotal;
      customers[customerIndex].lastOrder = new Date().toLocaleDateString('it-IT');
      
      localStorage.setItem('customers', JSON.stringify(customers));
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('customersUpdated'));
      }
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour des statistiques:', error);
  }
}

