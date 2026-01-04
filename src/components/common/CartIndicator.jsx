'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

export default function CartIndicator() {
  const [cartCount, setCartCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        const cart = JSON.parse(storedCart);
        setCartCount(cart?.length || 0);
      } catch (error) {
        setCartCount(0);
      }
    }

    const handleCartUpdate = (event) => {
      setCartCount(event?.detail?.count);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    };

    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
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
      {cartCount > 0 && (
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