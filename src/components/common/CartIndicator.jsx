'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

export default function CartIndicator() {
  const [cartCount, setCartCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);

  const updateCartCount = () => {
    if (typeof window === 'undefined') return;
    
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        const cart = JSON.parse(storedCart);
        // Calculer le total des quantités plutôt que le nombre d'items
        const totalQuantity = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        setCartCount(totalQuantity);
      } catch (error) {
        setCartCount(0);
      }
    } else {
      setCartCount(0);
    }
  };

  useEffect(() => {
    setMounted(true);
    updateCartCount();

    const handleCartUpdate = (event) => {
      // Si l'événement contient un count, l'utiliser, sinon recalculer
      if (event?.detail?.count !== undefined) {
        // Recalculer depuis localStorage pour obtenir le total des quantités
        updateCartCount();
      } else {
        updateCartCount();
      }
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    
    // Écouter aussi les changements de localStorage (au cas où d'autres onglets modifient le panier)
    window.addEventListener('storage', updateCartCount);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('storage', updateCartCount);
    };
  }, []);

  return (
    <Link
      href="/shopping-cart"
      className="relative p-2 rounded-md transition-fast hover:bg-muted group"
      aria-label="Carrello"
    >
      <Icon
        name="ShoppingCartIcon"
        size={24}
        variant="outline"
        className="text-text-primary group-hover:text-primary transition-fast"
      />
      {mounted && cartCount > 0 && (
        <span
          className={`absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-accent text-accent-foreground text-xs font-mono font-medium rounded-full transition-base ${
            isAnimating ? 'scale-125' : 'scale-100'
          }`}
        >
          {cartCount > 99 ? '99+' : cartCount}
        </span>
      )}
    </Link>
  );
}