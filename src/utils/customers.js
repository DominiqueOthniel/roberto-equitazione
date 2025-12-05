/**
 * Customer utility functions for managing customers in admin
 */

/**
 * Register a new customer or update existing one
 */
export function registerCustomer(userData) {
  if (typeof window === 'undefined') return;
  
  try {
    const storedCustomers = localStorage.getItem('customers');
    const customers = storedCustomers ? JSON.parse(storedCustomers) : [];
    
    // Vérifier si le client existe déjà par email
    const existingCustomerIndex = customers.findIndex(
      c => c.email === userData.email
    );
    
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
    } else if (existingCustomerIndex >= 0) {
      formattedAddress = customers[existingCustomerIndex].address || null;
    }

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
      status: existingCustomerIndex >= 0 ? (customers[existingCustomerIndex].status || 'Attivo') : 'Attivo',
      lastOrder: existingCustomerIndex >= 0 ? (customers[existingCustomerIndex].lastOrder || null) : null,
      address: formattedAddress,
      isVerified: userData.isVerified || false,
      createdAt: existingCustomerIndex >= 0 
        ? (customers[existingCustomerIndex].createdAt || new Date().toISOString())
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    if (existingCustomerIndex >= 0) {
      // Mettre à jour le client existant
      customers[existingCustomerIndex] = {
        ...customers[existingCustomerIndex],
        ...customerData,
        totalOrders: customers[existingCustomerIndex].totalOrders || 0,
        totalSpent: customers[existingCustomerIndex].totalSpent || 0,
      };
    } else {
      // Ajouter un nouveau client
      customers.push(customerData);
    }
    
    localStorage.setItem('customers', JSON.stringify(customers));
    
    // Déclencher des événements pour mettre à jour les composants qui écoutent
    if (typeof window !== 'undefined') {
      // Événement personnalisé pour les composants React
      window.dispatchEvent(new CustomEvent('customersUpdated', { 
        detail: { 
          customer: customerData,
          isNew: existingCustomerIndex < 0
        } 
      }));
      
      // Ne pas déclencher l'événement 'storage' pour éviter les boucles infinies
      // Les composants qui ont besoin de synchronisation entre onglets peuvent écouter 'customersUpdated'
    }
    
    return customerData;
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du client:', error);
    return null;
  }
}

/**
 * Get all customers
 */
export function getCustomers() {
  if (typeof window === 'undefined') return [];
  
  try {
    const storedCustomers = localStorage.getItem('customers');
    return storedCustomers ? JSON.parse(storedCustomers) : [];
  } catch (error) {
    console.error('Erreur lors de la lecture des clients:', error);
    return [];
  }
}

/**
 * Update customer order statistics
 */
export function updateCustomerOrderStats(email, orderTotal) {
  if (typeof window === 'undefined') return;
  
  try {
    const customers = getCustomers();
    const customerIndex = customers.findIndex(c => c.email === email);
    
    if (customerIndex >= 0) {
      customers[customerIndex].totalOrders = (customers[customerIndex].totalOrders || 0) + 1;
      customers[customerIndex].totalSpent = (customers[customerIndex].totalSpent || 0) + orderTotal;
      customers[customerIndex].lastOrder = new Date().toLocaleDateString('it-IT');
      customers[customerIndex].updatedAt = new Date().toISOString();
      
      localStorage.setItem('customers', JSON.stringify(customers));
      
      // Déclencher un événement pour mettre à jour les composants qui écoutent
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('customersUpdated'));
      }
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour des statistiques:', error);
  }
}

