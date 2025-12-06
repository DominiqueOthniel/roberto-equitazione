/**
 * Cart utility functions with Supabase synchronization
 * Synchronise le panier entre tous les appareils de l'utilisateur
 */

import { supabase } from '@/lib/supabase';

/**
 * Get user ID from localStorage or Supabase session
 * Returns a string identifier (UUID for authenticated users, email for guests)
 */
async function getUserId() {
  if (typeof window === 'undefined') return null;
  
  // Essayer d'abord Supabase Auth
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      console.log('Utilisateur authentifié via Supabase:', session.user.id);
      return session.user.id;
    }
  } catch (error) {
    console.warn('Erreur getSession:', error);
  }
  
  // Fallback: utiliser localStorage user (utilisateurs non authentifiés)
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      // Pour les utilisateurs non authentifiés, utiliser l'email comme identifiant
      const userId = userData.id || userData.email;
      if (userId) {
        console.log('Utilisateur non authentifié, ID:', userId);
        return userId;
      }
    } catch (error) {
      console.warn('Erreur parsing user:', error);
    }
  }
  
  // Si aucun utilisateur, créer un ID temporaire basé sur le navigateur
  let guestId = localStorage.getItem('guest_id');
  if (!guestId) {
    guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('guest_id', guestId);
  }
  console.log('Utilisateur invité, ID:', guestId);
  return guestId;
}

/**
 * Get cart from Supabase (synchronisé entre appareils)
 */
export async function getCartFromSupabase() {
  const userId = await getUserId();
  if (!userId) {
    // Si pas d'utilisateur, retourner localStorage comme fallback
    return getCartFromLocalStorage();
  }

  try {
    const { data, error } = await supabase
      .from('user_carts')
      .select('items')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Erreur lors de la récupération du panier:', error);
      return getCartFromLocalStorage(); // Fallback
    }

    return data?.items || [];
  } catch (error) {
    console.error('Erreur getCartFromSupabase:', error);
    return getCartFromLocalStorage(); // Fallback
  }
}

/**
 * Get cart from localStorage (cache local)
 */
function getCartFromLocalStorage() {
  if (typeof window === 'undefined') return [];
  
  try {
    const storedCart = localStorage.getItem('cart');
    return storedCart ? JSON.parse(storedCart) : [];
  } catch (error) {
    console.error('Erreur lors de la lecture du panier:', error);
    return [];
  }
}

/**
 * Save cart to Supabase (synchronise entre appareils)
 */
export async function saveCartToSupabase(cart) {
  const userId = await getUserId();
  if (!userId) {
    console.log('Pas d\'utilisateur, sauvegarde dans localStorage uniquement');
    // Si pas d'utilisateur, sauvegarder seulement dans localStorage
    saveCartToLocalStorage(cart);
    return;
  }

  try {
    console.log('Sauvegarde panier dans Supabase pour user:', userId, 'items:', cart.length);
    
    const { data, error } = await supabase
      .from('user_carts')
      .upsert({
        user_id: userId,
        items: cart,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      })
      .select();

    if (error) {
      console.error('Erreur lors de la sauvegarde du panier:', error);
      console.error('Détails:', error.message, error.details, error.hint);
      // Fallback: sauvegarder dans localStorage
      saveCartToLocalStorage(cart);
    } else {
      console.log('Panier sauvegardé avec succès dans Supabase:', data);
      // Sauvegarder aussi dans localStorage comme cache
      saveCartToLocalStorage(cart);
    }
  } catch (error) {
    console.error('Erreur saveCartToSupabase:', error);
    console.error('Stack:', error.stack);
    saveCartToLocalStorage(cart); // Fallback
  }
}

/**
 * Save cart to localStorage (cache local)
 */
function saveCartToLocalStorage(cart) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
    // Trigger cart update event
    const totalQuantity = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    window.dispatchEvent(new CustomEvent('cartUpdated', {
      detail: { count: totalQuantity }
    }));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du panier:', error);
  }
}

/**
 * Get cart (avec synchronisation Supabase)
 */
export async function getCart() {
  // Essayer Supabase d'abord
  const supabaseCart = await getCartFromSupabase();
  if (supabaseCart.length > 0) {
    return supabaseCart;
  }
  
  // Fallback: localStorage
  return getCartFromLocalStorage();
}

/**
 * Save cart (avec synchronisation Supabase)
 */
export async function saveCart(cart) {
  await saveCartToSupabase(cart);
}

/**
 * Add item to cart (avec synchronisation)
 */
export async function addToCart(item) {
  const cart = await getCart();
  
  // Check if item with same id and specs already exists
  const existingItemIndex = cart.findIndex(
    cartItem => 
      cartItem.id === item.id && 
      JSON.stringify(cartItem.specs || {}) === JSON.stringify(item.specs || {})
  );
  
  if (existingItemIndex >= 0) {
    // If exists, increase quantity
    cart[existingItemIndex].quantity += (item.quantity || 1);
  } else {
    // If doesn't exist, add new item
    cart.push({
      ...item,
      quantity: item.quantity || 1
    });
  }
  
  await saveCart(cart);
  return cart;
}

/**
 * Update item quantity in cart
 */
export async function updateCartItemQuantity(index, delta) {
  const cart = await getCart();
  if (cart[index]) {
    cart[index].quantity = Math.max(1, cart[index].quantity + delta);
    await saveCart(cart);
  }
  return cart;
}

/**
 * Remove item from cart
 */
export async function removeFromCart(index) {
  const cart = await getCart();
  cart.splice(index, 1);
  await saveCart(cart);
  return cart;
}

/**
 * Get total quantity of items in cart
 */
export async function getCartTotalQuantity() {
  const cart = await getCart();
  return cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
}

/**
 * Get cart total price
 */
export async function getCartTotal() {
  const cart = await getCart();
  return cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
}

/**
 * Subscribe to cart changes (Realtime Supabase)
 */
export async function subscribeToCartChanges(callback) {
  const userId = await getUserId();
  if (!userId) return null;

  const channel = supabase
    .channel('cart-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_carts',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        console.log('Cart changed:', payload);
        if (payload.new?.items) {
          callback(payload.new.items);
          // Mettre à jour localStorage aussi
          saveCartToLocalStorage(payload.new.items);
        }
      }
    )
    .subscribe();

  return channel;
}

