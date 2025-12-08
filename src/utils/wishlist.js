/**
 * Wishlist utility functions for managing wishlist items
 */

/**
 * Get wishlist from localStorage
 */
export function getWishlist() {
  if (typeof window === 'undefined') return [];
  
  try {
    const storedWishlist = localStorage.getItem('wishlist');
    return storedWishlist ? JSON.parse(storedWishlist) : [];
  } catch (error) {
    console.error('Erreur lors de la lecture de la wishlist:', error);
    return [];
  }
}

/**
 * Save wishlist to localStorage
 */
export function saveWishlist(wishlist) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    // Trigger wishlist update event
    window.dispatchEvent(new CustomEvent('wishlistUpdated', {
      detail: { count: wishlist.length }
    }));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la wishlist:', error);
  }
}

/**
 * Add item to wishlist
 */
export function addToWishlist(item) {
  const wishlist = getWishlist();
  
  // Check if item already exists
  const exists = wishlist.some(wishlistItem => wishlistItem.id === item.id);
  
  if (!exists) {
    wishlist.push(item);
    saveWishlist(wishlist);
  }
  
  return wishlist;
}

/**
 * Remove item from wishlist
 */
export function removeFromWishlist(itemId) {
  const wishlist = getWishlist();
  const updatedWishlist = wishlist.filter(item => item.id !== itemId);
  saveWishlist(updatedWishlist);
  return updatedWishlist;
}

/**
 * Check if item is in wishlist
 */
export function isInWishlist(itemId) {
  const wishlist = getWishlist();
  return wishlist.some(item => item.id === itemId);
}

/**
 * Get wishlist count
 */
export function getWishlistCount() {
  const wishlist = getWishlist();
  return wishlist.length;
}











