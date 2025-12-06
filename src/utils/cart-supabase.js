/**
 * Cart utility functions with Supabase synchronization
 * Synchronise le panier entre tous les appareils de l'utilisateur
 */

import { supabase } from '@/lib/supabase';

/**
 * Get user ID from localStorage or Supabase session
 * Returns a string identifier (UUID for authenticated users, email for guests)
 * 
 * IMPORTANT: Pour synchroniser entre appareils, utilisez le même email ou connectez-vous via Supabase Auth
 */
async function getUserId() {
  if (typeof window === 'undefined') return null;
  
  // Essayer d'abord Supabase Auth
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      console.log('✅ Utilisateur authentifié via Supabase Auth:', session.user.id);
      console.log('✅ Les données seront synchronisées entre tous vos appareils');
      return session.user.id;
    }
  } catch (error) {
    console.warn('⚠️ Erreur getSession:', error);
  }
  
  // Fallback: utiliser localStorage user (utilisateurs non authentifiés)
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      // Pour les utilisateurs non authentifiés, utiliser l'email comme identifiant
      const userId = userData.id || userData.email;
      if (userId) {
        console.log('⚠️ Utilisateur non authentifié, ID basé sur email:', userId);
        console.log('⚠️ Pour synchroniser entre appareils, utilisez le même email ou connectez-vous');
        return userId;
      }
    } catch (error) {
      console.warn('⚠️ Erreur parsing user:', error);
    }
  }
  
  // Si aucun utilisateur, créer un ID temporaire basé sur le navigateur
  // ⚠️ PROBLÈME: Cet ID sera différent sur chaque appareil !
  let guestId = localStorage.getItem('guest_id');
  if (!guestId) {
    guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('guest_id', guestId);
  }
  console.warn('⚠️ Utilisateur invité, ID temporaire:', guestId);
  console.warn('⚠️ ATTENTION: Cet ID est différent sur chaque appareil !');
  console.warn('⚠️ Les données ne seront PAS synchronisées entre PC et téléphone');
  console.warn('⚠️ Solution: Créez un compte ou utilisez le même email sur tous les appareils');
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
    console.warn('⚠️ Pas d\'utilisateur, sauvegarde dans localStorage uniquement');
    console.warn('⚠️ Les données ne seront PAS synchronisées entre appareils');
    // Si pas d'utilisateur, sauvegarder seulement dans localStorage
    saveCartToLocalStorage(cart);
    return;
  }

  // Vérifier la connexion Supabase
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('❌ Variables d\'environnement Supabase manquantes !');
    console.error('  NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌');
    console.error('  NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅' : '❌');
    saveCartToLocalStorage(cart);
    return;
  }

  try {
    console.log('🔄 Sauvegarde panier dans Supabase...');
    console.log('  User ID:', userId);
    console.log('  Items:', cart.length);
    console.log('  URL Supabase:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    
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
      console.error('❌ ERREUR lors de la sauvegarde du panier dans Supabase:');
      console.error('  Code:', error.code);
      console.error('  Message:', error.message);
      console.error('  Détails:', error.details);
      console.error('  Hint:', error.hint);
      console.error('\n⚠️  Vérifiez que:');
      console.error('  1. Le script SQL supabase-schema-fix-anonymous-users.sql a été exécuté');
      console.error('  2. Les politiques RLS permettent les INSERT/UPDATE');
      console.error('  3. La colonne user_id est de type TEXT');
      console.error('  4. La table user_carts existe');
      // Fallback: sauvegarder dans localStorage
      saveCartToLocalStorage(cart);
    } else {
      console.log('✅ Panier sauvegardé avec succès dans Supabase !');
      console.log('  Data:', data);
      // Sauvegarder aussi dans localStorage comme cache
      saveCartToLocalStorage(cart);
    }
  } catch (error) {
    console.error('❌ ERREUR EXCEPTION lors de la sauvegarde:', error);
    console.error('  Type:', error.constructor.name);
    console.error('  Message:', error.message);
    console.error('  Stack:', error.stack);
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
  console.log('🛒 Ajout au panier:', item);
  
  try {
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
      console.log('✅ Quantité mise à jour:', cart[existingItemIndex]);
    } else {
      // If doesn't exist, add new item
      cart.push({
        ...item,
        quantity: item.quantity || 1
      });
      console.log('✅ Produit ajouté au panier');
    }
    
    // Sauvegarder dans Supabase
    await saveCart(cart);
    
    // Déclencher l'événement pour mettre à jour l'UI
    if (typeof window !== 'undefined') {
      const totalQuantity = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
      window.dispatchEvent(new CustomEvent('cartUpdated', {
        detail: { count: totalQuantity, cart }
      }));
    }
    
    console.log('✅ Panier mis à jour, total items:', cart.length);
    return cart;
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout au panier:', error);
    throw error;
  }
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

