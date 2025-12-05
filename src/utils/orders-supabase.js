/**
 * Order utility functions with Supabase synchronization
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
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_email', email)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
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
  try {
    const userId = await getUserId();
    
    const order = {
      ...orderData,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single();

    if (error) throw error;

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
    return createOrderLocalStorage(orderData);
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(id, status) {
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
    return updateOrderStatusLocalStorage(id, status);
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

