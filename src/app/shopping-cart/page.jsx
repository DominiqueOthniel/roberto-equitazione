'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getCart, updateCartItemQuantity, removeFromCart, subscribeToCartChanges } from '@/utils/cart-supabase';

export default function ShoppingCartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [mounted, setMounted] = useState(false);

  // Load cart from Supabase on mount
  useEffect(() => {
    setMounted(true);
    
    if (typeof window === 'undefined') return;

    const loadCart = async () => {
      try {
        const cart = await getCart();
        setCartItems(cart);
      } catch (error) {
        console.error('Erreur lors du chargement du panier:', error);
        setCartItems([]);
      }
    };

    loadCart();

    // Subscribe to real-time cart changes
    let subscription = null;
    subscribeToCartChanges((items) => {
      setCartItems(items);
    }).then((channel) => {
      subscription = channel;
    });

    // Listen for cart updates from other components (fallback)
    const handleCartUpdate = () => {
      loadCart();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('storage', handleCartUpdate);

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('storage', handleCartUpdate);
    };
  }, []);


  const updateQuantity = async (index, delta) => {
    const updatedCart = await updateCartItemQuantity(index, delta);
    setCartItems(updatedCart);
  };

  const removeItem = async (index) => {
    const updatedCart = await removeFromCart(index);
    setCartItems(updatedCart);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-6 py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary mb-6 sm:mb-8">
          Carrello
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Panel - Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-6">
                {cartItems.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-text-secondary mb-4">Il tuo carrello è vuoto</p>
                    <Link href="/product-catalog" className="text-primary font-body hover:underline">
                      Continua lo shopping
                    </Link>
                  </div>
                ) : (
                  cartItems.map((item, index) => {
                    // Create unique key combining id and specs
                    const uniqueKey = `${item.id}-${item.specs?.size || ''}-${index}`;
                    return (
                      <div key={uniqueKey} className="border-b border-border pb-4 sm:pb-6 last:border-0 last:pb-0">
                    {/* First Item - Partially visible in design */}
                    <div className="flex gap-3 sm:gap-4">
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-surface rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-xs text-text-secondary uppercase font-semibold mb-1">
                              {item.brand}
                            </p>
                            <h3 className="font-body font-bold text-text-primary mb-2">
                              {item.name}
                            </h3>
                          </div>
                          <button
                            onClick={() => removeItem(index)}
                            className="p-2 hover:bg-muted rounded-md transition-fast"
                            aria-label="Rimuovi articolo"
                          >
                            <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>

                        {/* Specifications */}
                        <div className="space-y-1 mb-2 sm:mb-3">
                          <p className="text-xs sm:text-sm text-text-secondary">
                            Taglia: {item.specs.size}"
                          </p>
                          <p className="text-xs sm:text-sm text-text-secondary">
                            Colore: {item.specs.color}
                          </p>
                          {item.specs.type && (
                            <p className="text-xs sm:text-sm text-text-secondary">
                              {item.specs.type}
                            </p>
                          )}
                        </div>

                        <Link
                          href={`/product/${item.id}/edit-specs`}
                          className="text-primary text-xs sm:text-sm font-body hover:underline mb-3 sm:mb-4 inline-block"
                        >
                          Modifica specifiche
                        </Link>

                        {/* Quantity Selector */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mt-3 sm:mt-4">
                          <div className="flex items-center border border-border rounded-md">
                            <button
                              onClick={() => updateQuantity(index, -1)}
                              className="p-2 hover:bg-muted transition-fast"
                              aria-label="Diminuisci quantità"
                            >
                              <svg className="w-4 h-4 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            <span className="px-4 py-2 font-body font-semibold text-text-primary min-w-[3rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(index, 1)}
                              className="p-2 hover:bg-muted transition-fast"
                              aria-label="Aumenta quantità"
                            >
                              <svg className="w-4 h-4 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>

                          {/* Price */}
                          <div className="flex-1 sm:text-right w-full sm:w-auto">
                            <p className="text-xs sm:text-sm text-text-secondary mb-1">
                              €{item.price.toLocaleString('it-IT')} cad.
                            </p>
                            <p className="font-heading font-bold text-base sm:text-lg text-text-primary">
                              €{(item.price * item.quantity).toLocaleString('it-IT')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Order Summary & Checkout */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-4 sm:p-6 lg:sticky lg:top-24">
              {/* Order Summary */}
              <div className="mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-heading font-bold text-text-primary mb-4">
                  Riepilogo Ordine
                </h2>
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <span className="font-heading font-bold text-text-primary">Totale</span>
                  <span className="font-heading font-bold text-primary text-xl">
                    €{total.toLocaleString('it-IT')}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <Link 
                href="/checkout"
                className="w-full bg-primary text-primary-foreground py-2.5 sm:py-3 px-4 sm:px-6 rounded-md font-body font-semibold hover:opacity-90 transition-fast flex items-center justify-center gap-2 mb-3 sm:mb-4 text-sm sm:text-base"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Procedi al Checkout
              </Link>

              {/* Security Indicators */}
              <div className="flex items-center justify-center gap-4 text-xs text-text-secondary">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Pagamento Sicuro</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-text-secondary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  <span>Certificato IT</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assistance Section */}
        <div className="mt-8 sm:mt-12 bg-card border border-border rounded-lg p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-text-primary mb-3 sm:mb-4">
            Hai Bisogno di Assistenza?
          </h2>
          <p className="text-sm sm:text-base text-text-secondary mb-4 sm:mb-6 max-w-3xl">
            Il nostro team di esperti è disponibile per aiutarti con domande su taglie, specifiche o consigli personalizzati. Usa la chat per inviare foto o fare domande.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <button 
              onClick={() => {
                window.dispatchEvent(new CustomEvent('openChat'));
              }}
              className="bg-primary text-primary-foreground px-4 sm:px-6 py-2.5 sm:py-3 rounded-md font-body font-semibold hover:opacity-90 transition-fast flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Apri Chat
            </button>
            <a
              href="tel:+390123456789"
              className="bg-surface text-text-primary border border-border px-4 sm:px-6 py-2.5 sm:py-3 rounded-md font-body font-semibold hover:bg-muted transition-fast flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-xs sm:text-base">+39 012 345 6789</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

