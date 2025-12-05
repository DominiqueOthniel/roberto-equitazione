/**
 * Wishlist utility functions with Supabase synchronization
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
 * Get wishlist items
 */
export async function getWishlist() {
  const userId = await getUserId();
  if (!userId) {
    return getWishlistLocalStorage();
  }

  try {
    // Note: Si vous avez une table wishlist dans Supabase, utilisez-la ici
    // Pour l'instant, on utilise localStorage comme fallback
    return getWishlistLocalStorage();
  } catch (error) {
    console.error('Erreur lors de la récupération de la wishlist:', error);
    return getWishlistLocalStorage();
  }
}

/**
 * Add item to wishlist
 */
export async function addToWishlist(productId) {
  const userId = await getUserId();
  if (!userId) {
    return addToWishlistLocalStorage(productId);
  }

  try {
    // Note: Si vous avez une table wishlist dans Supabase, utilisez-la ici
    // Pour l'instant, on utilise localStorage comme fallback
    return addToWishlistLocalStorage(productId);
  } catch (error) {
    console.error('Erreur lors de l\'ajout à la wishlist:', error);
    return addToWishlistLocalStorage(productId);
  }
}

/**
 * Remove item from wishlist
 */
export async function removeFromWishlist(productId) {
  const userId = await getUserId();
  if (!userId) {
    return removeFromWishlistLocalStorage(productId);
  }

  try {
    // Note: Si vous avez une table wishlist dans Supabase, utilisez-la ici
    // Pour l'instant, on utilise localStorage comme fallback
    return removeFromWishlistLocalStorage(productId);
  } catch (error) {
    console.error('Erreur lors de la suppression de la wishlist:', error);
    return removeFromWishlistLocalStorage(productId);
  }
}

/**
 * Check if product is in wishlist
 */
export async function isInWishlist(productId) {
  const wishlist = await getWishlist();
  return wishlist.includes(productId);
}

// Fallback functions (localStorage)
function getWishlistLocalStorage() {
  if (typeof window === 'undefined') return [];
  
  try {
    const storedWishlist = localStorage.getItem('wishlist');
    return storedWishlist ? JSON.parse(storedWishlist) : [];
  } catch (error) {
    console.error('Erreur lors de la lecture de la wishlist:', error);
    return [];
  }
}

function addToWishlistLocalStorage(productId) {
  if (typeof window === 'undefined') return [];
  
  try {
    const wishlist = getWishlistLocalStorage();
    if (!wishlist.includes(productId)) {
      wishlist.push(productId);
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('wishlistUpdated'));
      }
    }
    return wishlist;
  } catch (error) {
    console.error('Erreur lors de l\'ajout à la wishlist:', error);
    return [];
  }
}

function removeFromWishlistLocalStorage(productId) {
  if (typeof window === 'undefined') return [];
  
  try {
    const wishlist = getWishlistLocalStorage();
    const filtered = wishlist.filter(id => id !== productId);
    localStorage.setItem('wishlist', JSON.stringify(filtered));
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('wishlistUpdated'));
    }
    
    return filtered;
  } catch (error) {
    console.error('Erreur lors de la suppression de la wishlist:', error);
    return [];
  }
}

