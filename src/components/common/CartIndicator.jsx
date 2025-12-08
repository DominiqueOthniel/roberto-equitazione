'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { getCartTotalQuantity } from '@/utils/cart-supabase';

export default function CartIndicator() {
  const [cartCount, setCartCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isMountedRef = useRef(false);

  const updateCartCount = async () => {
    if (typeof window === 'undefined' || !mounted || !isMountedRef.current) return;
    
    try {
      const totalQuantity = await getCartTotalQuantity();
      if (!isMountedRef.current) return;
      setCartCount(totalQuantity);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du compteur:', error);
      if (!isMountedRef.current) return;
      setCartCount(0);
    }
  };

  useEffect(() => {
    setMounted(true);
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    updateCartCount();

    const handleCartUpdate = async () => {
      // Utiliser setTimeout pour éviter les mises à jour d'état pendant le démontage
      setTimeout(async () => {
        if (!mounted || !isMountedRef.current) return;
        await updateCartCount();
        if (!mounted || !isMountedRef.current) return;
        setIsAnimating(true);
        setTimeout(() => {
          if (mounted && isMountedRef.current) {
            setIsAnimating(false);
          }
        }, 300);
      }, 0);
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    
    // Écouter aussi les changements de localStorage (au cas où d'autres onglets modifient le panier)
    window.addEventListener('storage', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('storage', handleCartUpdate);
    };
  }, [mounted]);

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