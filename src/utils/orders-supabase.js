/**
 * Order utility functions with Supabase synchronization
 */

import { supabase, assertSupabaseConfigured } from '@/lib/supabase';

/**
 * Get user ID from localStorage or Supabase session
 * Returns a string identifier (UUID for authenticated users, email for guests)
 */
async function getUserId() {
  if (typeof window === 'undefined') return null;
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      console.log('✅ [Orders] Utilisateur authentifié via Supabase:', session.user.id);
      return session.user.id;
    }
  } catch (error) {
    console.warn('⚠️ [Orders] Erreur getSession:', error);
  }
  
  // Fallback: utiliser localStorage user (utilisateurs non authentifiés)
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      const email = userData.email;
      if (email) {
        console.log('📧 [Orders] Utilisation email pour synchronisation:', email);
        return email; // Retourner l'email directement pour les ordres
      }
    } catch (error) {
      console.warn('⚠️ [Orders] Erreur parsing user:', error);
    }
  }
  
  // Utiliser l'email de synchronisation si disponible
  const syncEmail = localStorage.getItem('sync_email');
  if (syncEmail && syncEmail.trim()) {
    console.log('📧 [Orders] Utilisation email de synchronisation:', syncEmail);
    return syncEmail.trim().toLowerCase();
  }
  
  // Si aucun utilisateur, créer un ID temporaire basé sur le navigateur
  let guestId = localStorage.getItem('guest_id');
  if (!guestId) {
    guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('guest_id', guestId);
  }
  console.warn('⚠️ [Orders] Utilisateur invité, ID:', guestId);
  console.warn('⚠️ [Orders] Les ordres ne seront PAS synchronisés entre appareils');
  return guestId;
}

/**
 * Get all orders
 */
export async function getOrders() {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Cache local
    if (typeof window !== 'undefined') {
      localStorage.setItem('orders', JSON.stringify(data || []));
    }

    return data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    return getOrdersLocalStorage();
  }
}

/**
 * Get orders by customer email
 */
export async function getOrdersByCustomer(email) {
  try {
    console.log('📥 Récupération commandes pour email:', email);
    
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('email', email) // Utiliser 'email' au lieu de 'customer_email'
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erreur Supabase:', error);
      throw error;
    }
    
    console.log('✅ Commandes récupérées:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des commandes:', error);
    return getOrdersByCustomerLocalStorage(email);
  }
}

/**
 * Get order by ID
 */
export async function getOrderById(id) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération de la commande:', error);
    return getOrderByIdLocalStorage(id);
  }
}

/**
 * Create a new order
 */
export async function createOrder(orderData) {
  assertSupabaseConfigured('create orders');

  try {
    const userId = await getUserId();
    
    // Mapper les données au format de la table Supabase
    const customerEmail = orderData.customer_email || orderData.email || '';
    
    const order = {
      // user_id peut être UUID (authentifié) ou email (non authentifié)
      user_id: typeof userId === 'string' && userId.includes('@') ? null : userId,
      email: customerEmail, // Toujours utiliser email pour la synchronisation
      nome: orderData.customer_name?.split(' ')[0] || orderData.nome || '',
      cognome: orderData.customer_name?.split(' ').slice(1).join(' ') || orderData.cognome || '',
      telefono: orderData.customer_phone || orderData.telefono || '',
      total: parseFloat(orderData.total) || 0,
      subtotal: orderData.subtotal ? parseFloat(orderData.subtotal) : parseFloat(orderData.total) || 0,
      status: orderData.status || 'pending',
      shipping_address: orderData.shipping_address || orderData.shippingAddress || {},
      items: orderData.items || [],
      order_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    console.log('📦 [Orders] Création commande avec:', {
      user_id: order.user_id,
      email: order.email,
      total: order.total
    });

    console.log('Création commande dans Supabase:', order);

    const { data, error } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single();

    if (error) {
      console.error('Erreur Supabase lors de la création de la commande:', error);
      console.error('Détails:', error.message, error.details, error.hint);
      throw error;
    }

    console.log('Commande créée avec succès:', data);

    // Mettre à jour le cache
    if (typeof window !== 'undefined') {
      const orders = await getOrders();
      localStorage.setItem('orders', JSON.stringify(orders));
      window.dispatchEvent(new CustomEvent('ordersUpdated'));
      window.dispatchEvent(new CustomEvent('newOrder', { detail: data }));
    }

    return data;
  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error);
    console.error('Stack:', error.stack);
    throw error;
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(id, status) {
  assertSupabaseConfigured('update orders');

  try {
    const { data, error } = await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Mettre à jour le cache
    if (typeof window !== 'undefined') {
      const orders = await getOrders();
      localStorage.setItem('orders', JSON.stringify(orders));
      window.dispatchEvent(new CustomEvent('ordersUpdated'));
    }

    return data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la commande:', error);
    throw error;
  }
}

// Fallback functions (localStorage)
function getOrdersLocalStorage() {
  if (typeof window === 'undefined') return [];
  
  try {
    const storedOrders = localStorage.getItem('orders');
    return storedOrders ? JSON.parse(storedOrders) : [];
  } catch (error) {
    console.error('Erreur lors de la lecture des commandes:', error);
    return [];
  }
}

function getOrdersByCustomerLocalStorage(email) {
  const orders = getOrdersLocalStorage();
  return orders.filter(o => o.customer_email === email);
}

function getOrderByIdLocalStorage(id) {
  const orders = getOrdersLocalStorage();
  return orders.find(o => o.id === parseInt(id) || o.id === id) || null;
}

function createOrderLocalStorage(orderData) {
  if (typeof window === 'undefined') return null;
  
  try {
    const orders = getOrdersLocalStorage();
    const newOrder = {
      ...orderData,
      id: orders.length > 0 ? Math.max(...orders.map(o => o.id || 0)) + 1 : 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    orders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ordersUpdated'));
      window.dispatchEvent(new CustomEvent('newOrder', { detail: newOrder }));
    }
    
    return newOrder;
  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error);
    return null;
  }
}

function updateOrderStatusLocalStorage(id, status) {
  if (typeof window === 'undefined') return null;
  
  try {
    const orders = getOrdersLocalStorage();
    const index = orders.findIndex(o => o.id === parseInt(id) || o.id === id);
    
    if (index >= 0) {
      orders[index] = {
        ...orders[index],
        status,
        updated_at: new Date().toISOString(),
      };
      localStorage.setItem('orders', JSON.stringify(orders));
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('ordersUpdated'));
      }
      
      return orders[index];
    }
    
    return null;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la commande:', error);
    return null;
  }
}

