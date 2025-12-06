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
      const email = userData.email;
      if (email) {
        // Sauvegarder l'email pour la synchronisation
        localStorage.setItem('sync_email', email);
        const userId = `email_${email.toLowerCase().trim()}`;
        if (!sessionStorage.getItem('email_sync_info_shown')) {
          console.log('📧 Synchronisation via email:', email);
          console.log('✅ Le panier sera synchronisé entre tous les appareils utilisant cet email');
          sessionStorage.setItem('email_sync_info_shown', 'true');
        }
        return userId;
      }
      // Si pas d'email mais un ID, l'utiliser
      const userId = userData.id;
      if (userId) {
        return userId;
      }
    } catch (error) {
      console.warn('⚠️ Erreur parsing user:', error);
    }
  }
  
  // Si aucun utilisateur, essayer d'utiliser un email de synchronisation
  const syncEmail = localStorage.getItem('sync_email');
  if (syncEmail && syncEmail.trim()) {
    console.log('📧 Utilisation de l\'email de synchronisation:', syncEmail);
    console.log('✅ Le panier sera synchronisé entre tous les appareils utilisant cet email');
    return `email_${syncEmail.trim().toLowerCase()}`;
  }
  
  // Si aucun utilisateur, créer un ID temporaire basé sur le navigateur
  // ⚠️ PROBLÈME: Cet ID sera différent sur chaque appareil !
  let guestId = localStorage.getItem('guest_id');
  if (!guestId) {
    guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('guest_id', guestId);
  }
  
  // Afficher le warning seulement une fois par session
  if (!sessionStorage.getItem('guest_warning_shown')) {
    console.warn('⚠️ Utilisateur invité - Panier non synchronisé entre appareils');
    console.warn('💡 Astuce: Utilisez le même email dans "Mon Compte" sur tous vos appareils pour synchroniser');
    sessionStorage.setItem('guest_warning_shown', 'true');
  }
  
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

  // Désactiver temporairement Supabase si erreur 406 persistante
  const disableSupabase = localStorage.getItem('disable_supabase_cart') === 'true';
  if (disableSupabase) {
    console.warn('⚠️ Supabase désactivé pour le panier (erreur 406)');
    return getCartFromLocalStorage();
  }

  try {
    console.log('📥 Récupération panier depuis Supabase, user_id:', userId);
    
    const { data, error } = await supabase
      .from('user_carts')
      .select('items')
      .eq('user_id', userId)
      .maybeSingle(); // Utiliser maybeSingle au lieu de single pour éviter l'erreur si pas trouvé

    if (error) {
      console.error('❌ Erreur lors de la récupération du panier:', error);
      console.error('  Code:', error.code);
      console.error('  Message:', error.message);
      console.error('  Détails:', error.details);
      console.error('  Hint:', error.hint);
      
      // Si erreur 406, désactiver Supabase pour le panier et utiliser localStorage uniquement
      if (error.code === 'PGRST301' || error.message?.includes('406') || error.code === '406') {
        console.error('⚠️ Erreur 406 détectée: Les politiques RLS bloquent l\'accès');
        console.error('⚠️ Désactivation de Supabase pour le panier - utilisation de localStorage uniquement');
        console.error('⚠️ Pour corriger: Exécutez supabase-disable-rls-temporarily.sql dans Supabase SQL Editor');
        
        // Désactiver Supabase pour éviter les requêtes répétées
        localStorage.setItem('disable_supabase_cart', 'true');
        
        // Afficher une alerte à l'utilisateur (optionnel)
        if (typeof window !== 'undefined' && !localStorage.getItem('supabase_error_shown')) {
          console.warn('💡 Le panier fonctionne maintenant avec localStorage uniquement');
          localStorage.setItem('supabase_error_shown', 'true');
        }
      }
      
      return getCartFromLocalStorage(); // Fallback
    }

    if (!data) {
      console.log('ℹ️ Aucun panier trouvé dans Supabase pour cet utilisateur');
      return [];
    }

    console.log('✅ Panier récupéré depuis Supabase, items:', data.items?.length || 0);
    
    // Réactiver Supabase si ça fonctionne
    localStorage.removeItem('disable_supabase_cart');
    
    return data.items || [];
  } catch (error) {
    console.error('❌ Erreur getCartFromSupabase:', error);
    console.error('  Type:', error.constructor.name);
    console.error('  Message:', error.message);
    
    // Si erreur réseau ou 406, désactiver Supabase
    if (error.message?.includes('406') || error.message?.includes('Not Acceptable')) {
      localStorage.setItem('disable_supabase_cart', 'true');
    }
    
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

  // Vérifier si Supabase est désactivé (erreur 406)
  const disableSupabase = localStorage.getItem('disable_supabase_cart') === 'true';
  if (disableSupabase) {
    console.warn('⚠️ Supabase désactivé pour le panier (erreur 406), sauvegarde localStorage uniquement');
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
      
      // Si erreur 406, désactiver Supabase pour éviter les requêtes répétées
      if (error.code === 'PGRST301' || error.message?.includes('406') || error.code === '406') {
        console.error('⚠️ Erreur 406 détectée: Désactivation de Supabase pour le panier');
        localStorage.setItem('disable_supabase_cart', 'true');
        console.error('⚠️ Le panier fonctionnera maintenant avec localStorage uniquement');
        console.error('⚠️ Pour corriger: Exécutez supabase-disable-rls-temporarily.sql dans Supabase SQL Editor');
      } else {
        console.error('\n⚠️  Vérifiez que:');
        console.error('  1. Le script SQL supabase-schema-fix-anonymous-users.sql a été exécuté');
        console.error('  2. Les politiques RLS permettent les INSERT/UPDATE');
        console.error('  3. La colonne user_id est de type TEXT');
        console.error('  4. La table user_carts existe');
      }
      
      console.warn('⚠️ Fallback: Sauvegarde dans localStorage uniquement');
      // Fallback: sauvegarder dans localStorage (IMPORTANT: toujours sauvegarder localement)
      saveCartToLocalStorage(cart);
    } else {
      console.log('✅ Panier sauvegardé avec succès dans Supabase !');
      console.log('  Data:', data);
      // Sauvegarder aussi dans localStorage comme cache (TOUJOURS sauvegarder localement)
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
 * FONCTION CRITIQUE - DOIT TOUJOURS FONCTIONNER
 */
function saveCartToLocalStorage(cart) {
  if (typeof window === 'undefined') {
    console.warn('⚠️ window is undefined, impossible de sauvegarder dans localStorage');
    return false;
  }
  
  try {
    console.log('💾 [saveCartToLocalStorage] Début sauvegarde, items:', cart.length);
    
    // Vérifier que cart est un array
    if (!Array.isArray(cart)) {
      console.error('❌ [saveCartToLocalStorage] cart n\'est pas un array:', typeof cart);
      return false;
    }
    
    const cartJson = JSON.stringify(cart);
    console.log('💾 [saveCartToLocalStorage] JSON généré, taille:', cartJson.length, 'caractères');
    
    localStorage.setItem('cart', cartJson);
    console.log('✅ [saveCartToLocalStorage] Panier sauvegardé dans localStorage');
    
    // Vérifier que la sauvegarde a fonctionné
    const verification = localStorage.getItem('cart');
    if (verification === cartJson) {
      console.log('✅ [saveCartToLocalStorage] Vérification: Sauvegarde confirmée');
    } else {
      console.error('❌ [saveCartToLocalStorage] Vérification échouée: Les données ne correspondent pas');
      return false;
    }
    
    // Trigger cart update event
    const totalQuantity = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    console.log('📢 [saveCartToLocalStorage] Déclenchement événement cartUpdated, quantité totale:', totalQuantity);
    
    const event = new CustomEvent('cartUpdated', {
      detail: { count: totalQuantity, cart }
    });
    window.dispatchEvent(event);
    console.log('✅ [saveCartToLocalStorage] Événement cartUpdated déclenché');
    
    return true;
  } catch (error) {
    console.error('❌ [saveCartToLocalStorage] ERREUR lors de la sauvegarde:', error);
    console.error('  Type:', error.constructor.name);
    console.error('  Message:', error.message);
    console.error('  Stack:', error.stack);
    
    // Essayer de sauvegarder avec une méthode alternative
    try {
      console.log('🔄 [saveCartToLocalStorage] Tentative de sauvegarde alternative...');
      const simpleCart = cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity || 1
      }));
      localStorage.setItem('cart', JSON.stringify(simpleCart));
      console.log('✅ [saveCartToLocalStorage] Sauvegarde alternative réussie');
      return true;
    } catch (fallbackError) {
      console.error('❌ [saveCartToLocalStorage] Sauvegarde alternative échouée:', fallbackError);
      return false;
    }
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
 * IMPORTANT: Sauvegarde toujours dans localStorage même si Supabase échoue
 */
export async function saveCart(cart) {
  console.log('💾 saveCart appelé avec', cart.length, 'items');
  
  // TOUJOURS sauvegarder dans localStorage d'abord (pour garantir la persistance)
  saveCartToLocalStorage(cart);
  
  // Ensuite, essayer de sauvegarder dans Supabase (pour la synchronisation)
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
    
    // Sauvegarder dans Supabase (qui sauvegarde aussi dans localStorage en fallback)
    console.log('💾 Début sauvegarde panier...');
    await saveCart(cart);
    console.log('✅ Sauvegarde panier terminée');
    
    // Vérifier que le panier est bien dans localStorage
    if (typeof window !== 'undefined') {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        console.log('✅ Vérification: Panier présent dans localStorage, items:', parsedCart.length);
      } else {
        console.warn('⚠️ ATTENTION: Panier non trouvé dans localStorage après sauvegarde !');
        // Réessayer la sauvegarde
        saveCartToLocalStorage(cart);
      }
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

