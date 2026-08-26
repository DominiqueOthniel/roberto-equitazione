/**
 * Cart utility functions for managing shopping cart
 */

/**
 * Get cart from localStorage
 */
export function getCart() {
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
 * Save cart to localStorage
 */
export function saveCart(cart) {
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
 * Add item to cart
 */
export function addToCart(item) {
  const cart = getCart();
  
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
  
  saveCart(cart);
  return cart;
}

/**
 * Update item quantity in cart
 */
export function updateCartItemQuantity(index, delta) {
  const cart = getCart();
  if (cart[index]) {
    cart[index].quantity = Math.max(1, cart[index].quantity + delta);
    saveCart(cart);
  }
  return cart;
}

/**
 * Remove item from cart
 */
export function removeFromCart(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  return cart;
}

/**
 * Get total quantity of items in cart
 */
export function getCartTotalQuantity() {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
}

/**
 * Get cart total price
 */
export function getCartTotal() {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
}

