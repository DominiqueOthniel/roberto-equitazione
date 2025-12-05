/**
 * Cart utility functions with Supabase synchronization
 * Synchronise le panier entre tous les appareils de l'utilisateur
 */

import { supabase } from '@/lib/supabase';

/**
 * Get user ID from localStorage or Supabase session
 */
async function getUserId() {
  if (typeof window === 'undefined') return null;
  
  // Essayer d'abord Supabase Auth
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      return session.user.id;
    }
  } catch (error) {
    console.warn('Erreur getSession:', error);
  }
  
  // Fallback: utiliser localStorage user
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      return userData.id || userData.email; // Utiliser email comme ID temporaire
    } catch {
      return null;
    }
  }
  
  return null;
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
    // Si pas d'utilisateur, sauvegarder seulement dans localStorage
    saveCartToLocalStorage(cart);
    return;
  }

  try {
    const { error } = await supabase
      .from('user_carts')
      .upsert({
        user_id: userId,
        items: cart,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Erreur lors de la sauvegarde du panier:', error);
      // Fallback: sauvegarder dans localStorage
      saveCartToLocalStorage(cart);
    } else {
      // Sauvegarder aussi dans localStorage comme cache
      saveCartToLocalStorage(cart);
    }
  } catch (error) {
    console.error('Erreur saveCartToSupabase:', error);
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

