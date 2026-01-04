'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Icon from '@/components/ui/AppIcon';
import { getCart, saveCart, removeFromCart, updateCartItemQuantity } from '@/utils/cart';
import { getProductById } from '@/utils/products-supabase';

export default function ShoppingCartPage() {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const cartItems = getCart();
      setCart(cartItems);

      // Charger les détails des produits
      const productsData = {};
      for (const item of cartItems) {
        try {
          const product = await getProductById(item.id);
          if (product) {
            productsData[item.id] = product;
          }
        } catch (error) {
          console.error(`Erreur lors du chargement du produit ${item.id}:`, error);
        }
      }
      setProducts(productsData);
    } catch (error) {
      console.error('Erreur lors du chargement du panier:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = (index, delta) => {
    const newCart = updateCartItemQuantity(index, delta);
    setCart(newCart);
  };

  const handleRemove = (index) => {
    const newCart = removeFromCart(index);
    setCart(newCart);
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const product = products[item.id];
      const price = product ? parseFloat(product.price || 0) : 0;
      return total + price * (item.quantity || 1);
    }, 0);
  };

  const formatPrice = (price) => {
    return `€${parseFloat(price || 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-text-secondary">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Icon name="ShoppingCartIcon" size={64} className="mx-auto text-text-secondary mb-4" variant="outline" />
          <h1 className="text-2xl font-heading font-bold text-text-primary mb-2">
            Il tuo carrello è vuoto
          </h1>
          <p className="text-text-secondary mb-6">
            Aggiungi alcuni prodotti al tuo carrello per iniziare.
          </p>
          <Link
            href="/product-catalog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-fast"
          >
            <Icon name="ArrowLeftIcon" size={20} variant="outline" />
            <span>Continua lo shopping</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl lg:text-3xl font-heading font-bold text-text-primary mb-6">
          Carrello
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => {
              const product = products[item.id];
              const mainImage =
                product?.images && Array.isArray(product.images) && product.images.length > 0
                  ? product.images[0]
                  : product?.image || '/placeholder-product.jpg';
              const price = product ? parseFloat(product.price || 0) : 0;
              const itemTotal = price * (item.quantity || 1);

              return (
                <div key={index} className="bg-card border border-border rounded-lg p-4 lg:p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative w-full sm:w-24 h-48 sm:h-24 bg-surface rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={mainImage}
                        alt={product?.name || 'Prodotto'}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 96px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading font-semibold text-text-primary mb-2 truncate">
                        {product?.name || 'Prodotto'}
                      </h3>
                      {product?.brand && (
                        <p className="text-sm text-text-secondary mb-2">{product.brand}</p>
                      )}
                      <p className="text-lg font-semibold text-text-primary mb-4">
                        {formatPrice(price)}
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 border border-border rounded-lg">
                          <button
                            onClick={() => handleUpdateQuantity(index, -1)}
                            className="p-2 hover:bg-muted transition-fast"
                            disabled={item.quantity <= 1}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="px-4 py-2 font-semibold text-text-primary">
                            {item.quantity || 1}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(index, 1)}
                            className="p-2 hover:bg-muted transition-fast"
                          >
                            <Icon name="PlusIcon" size={16} variant="outline" />
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemove(index)}
                          className="p-2 text-error hover:bg-error/10 rounded-lg transition-fast"
                          title="Rimuovi"
                        >
                          <Icon name="TrashIcon" size={18} variant="outline" />
                        </button>
                      </div>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-lg font-heading font-bold text-text-primary">
                        {formatPrice(itemTotal)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-4 lg:p-6 sticky top-4">
              <h2 className="text-xl font-heading font-bold text-text-primary mb-4">
                Riepilogo ordine
              </h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-text-secondary">
                  <span>Subtotale</span>
                  <span>{formatPrice(calculateTotal())}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Spedizione</span>
                  <span>Gratuita</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between text-lg font-heading font-bold text-text-primary">
                  <span>Totale</span>
                  <span>{formatPrice(calculateTotal())}</span>
                </div>
              </div>
              <Link
                href="/checkout"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-fast font-semibold"
              >
                <span>Procedi al checkout</span>
                <Icon name="ArrowRightIcon" size={20} variant="outline" />
              </Link>
              <Link
                href="/product-catalog"
                className="mt-4 w-full inline-flex items-center justify-center gap-2 px-6 py-3 border border-border rounded-lg hover:bg-muted transition-fast"
              >
                <Icon name="ArrowLeftIcon" size={20} variant="outline" />
                <span>Continua lo shopping</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
