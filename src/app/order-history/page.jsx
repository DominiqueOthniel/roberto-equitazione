'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Icon from '@/components/ui/AppIcon';

export default function OrderHistoryPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    // Vérifier l'authentification
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (!userData) {
        router.push('/login');
        return;
      }
      
      try {
        const userObj = JSON.parse(userData);
        setUser(userObj);
        
        // Charger les commandes
        loadOrders(userObj.email);
      } catch (error) {
        console.error('Erreur lors du chargement des données utilisateur:', error);
        router.push('/login');
      }
    }

    // Écouter les nouveaux ordres
    const handleNewOrder = () => {
      if (user?.email) {
        loadOrders(user.email);
      }
    };

    const handleStorageChange = () => {
      if (user?.email) {
        loadOrders(user.email);
      }
    };

    window.addEventListener('newOrder', handleNewOrder);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('newOrder', handleNewOrder);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [router, user]);

  const loadOrders = (userEmail) => {
    if (typeof window === 'undefined') return;
    
    try {
      const storedOrders = localStorage.getItem('orders');
      let allOrders = storedOrders ? JSON.parse(storedOrders) : [];
      
      // Vérifier aussi currentOrder (commande récente depuis checkout) si elle n'a pas encore été ajoutée
      const currentOrder = localStorage.getItem('currentOrder');
      if (currentOrder) {
        try {
          const orderData = JSON.parse(currentOrder);
          if (orderData.id && orderData.email?.toLowerCase() === userEmail?.toLowerCase()) {
            const exists = allOrders.some(o => o.id === orderData.id);
            if (!exists) {
              allOrders.unshift(orderData);
            }
          }
        } catch (error) {
          // Ignorer les erreurs de parsing
        }
      }
      
      // Filtrer les commandes pour l'utilisateur connecté
      const userOrders = allOrders.filter(order => 
        order.email?.toLowerCase() === userEmail?.toLowerCase()
      );
      
      // Trier par date (plus récentes en premier)
      userOrders.sort((a, b) => {
        const dateA = new Date(a.orderDate || a.date);
        const dateB = new Date(b.orderDate || b.date);
        return dateB - dateA;
      });
      
      setOrders(userOrders);
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'pending': { label: 'In attesa', color: 'text-yellow-600 bg-yellow-50' },
      'processing': { label: 'In elaborazione', color: 'text-blue-600 bg-blue-50' },
      'shipped': { label: 'Spedito', color: 'text-purple-600 bg-purple-50' },
      'delivered': { label: 'Consegnato', color: 'text-success bg-green-50' },
      'cancelled': { label: 'Annullato', color: 'text-error bg-red-50' }
    };
    return statusMap[status] || { label: status, color: 'text-text-secondary bg-muted' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link 
            href="/user-dashboard" 
            className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-fast mb-4"
          >
            <Icon name="ArrowLeftIcon" size={20} variant="outline" />
            <span className="font-body">Torna al dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary">
            Cronologia Ordini
          </h1>
          <p className="text-sm sm:text-base text-text-secondary mt-2">
            Visualizza tutte le tue ordini passati e in corso
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-8 sm:p-12 text-center">
            <Icon name="ClipboardListIcon" size={64} variant="outline" className="mx-auto mb-4 text-text-secondary" />
            <h2 className="text-xl font-heading font-bold text-text-primary mb-2">
              Nessun ordine trovato
            </h2>
            <p className="text-text-secondary mb-6">
              Non hai ancora effettuato nessun ordine.
            </p>
            <Link 
              href="/product-catalog"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md font-body font-semibold hover:opacity-90 transition-fast"
            >
              <Icon name="ShoppingBagIcon" size={20} variant="outline" />
              <span>Inizia lo shopping</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {orders.map((order) => {
              const statusInfo = getStatusLabel(order.status);
              const orderDate = formatDate(order.orderDate || order.date);
              
              return (
                <div
                  key={order.id}
                  className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-base"
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg sm:text-xl font-heading font-bold text-text-primary">
                            {order.id}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        <p className="text-sm text-text-secondary">
                          Ordinato il {orderDate}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg sm:text-xl font-heading font-bold text-text-primary">
                          {order.total?.toLocaleString('it-IT', {
                            style: 'currency',
                            currency: 'EUR'
                          }) || 'N/A'}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {order.items?.length || 0} {order.items?.length === 1 ? 'articolo' : 'articoli'}
                        </p>
                      </div>
                    </div>

                    {/* Items Preview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      {order.items?.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="relative w-16 h-16 bg-surface rounded-lg overflow-hidden flex-shrink-0">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.name || 'Prodotto'}
                                fill
                                className="object-cover"
                                sizes="64px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Icon name="PhotoIcon" size={24} variant="outline" className="text-text-secondary" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-body font-semibold text-text-primary truncate">
                              {item.name || 'Prodotto'}
                            </p>
                            <p className="text-xs text-text-secondary">
                              Quantità: {item.quantity || 1}
                            </p>
                            <p className="text-xs font-semibold text-text-primary">
                              {(item.price * (item.quantity || 1))?.toLocaleString('it-IT', {
                                style: 'currency',
                                currency: 'EUR'
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                      {order.items?.length > 3 && (
                        <div className="flex items-center justify-center text-sm text-text-secondary">
                          +{order.items.length - 3} altri articoli
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-4 border-t border-border">
                      <button
                        onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                        className="flex items-center gap-2 text-primary font-body font-semibold hover:underline transition-fast"
                      >
                        <Icon 
                          name={selectedOrder?.id === order.id ? 'ChevronUpIcon' : 'ChevronDownIcon'} 
                          size={18} 
                          variant="outline" 
                        />
                        <span>{selectedOrder?.id === order.id ? 'Nascondi dettagli' : 'Mostra dettagli'}</span>
                      </button>
                    </div>

                    {/* Expanded Details */}
                    {selectedOrder?.id === order.id && (
                      <div className="mt-4 pt-4 border-t border-border space-y-4">
                        {/* Shipping Address */}
                        {order.shippingAddress && (
                          <div>
                            <h4 className="text-sm font-body font-semibold text-text-primary mb-2">
                              Indirizzo di spedizione
                            </h4>
                            <div className="text-sm text-text-secondary bg-muted p-3 rounded-md">
                              <p>{order.shippingAddress.nome} {order.shippingAddress.cognome}</p>
                              <p>{order.shippingAddress.via} {order.shippingAddress.numeroCivico}</p>
                              <p>
                                {order.shippingAddress.cap} {order.shippingAddress.citta} ({order.shippingAddress.provincia})
                              </p>
                              <p>{order.shippingAddress.paese}</p>
                            </div>
                          </div>
                        )}

                        {/* All Items */}
                        <div>
                          <h4 className="text-sm font-body font-semibold text-text-primary mb-3">
                            Articoli ({order.items?.length || 0})
                          </h4>
                          <div className="space-y-3">
                            {order.items?.map((item, index) => (
                              <div key={index} className="flex items-start gap-4 bg-muted p-3 rounded-md">
                                <div className="relative w-20 h-20 bg-surface rounded-lg overflow-hidden flex-shrink-0">
                                  {item.image ? (
                                    <Image
                                      src={item.image}
                                      alt={item.name || 'Prodotto'}
                                      fill
                                      className="object-cover"
                                      sizes="80px"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Icon name="PhotoIcon" size={24} variant="outline" className="text-text-secondary" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-body font-semibold text-text-primary mb-1">
                                    {item.brand && <span className="text-xs text-text-secondary uppercase mr-2">{item.brand}</span>}
                                    {item.name || 'Prodotto'}
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm text-text-secondary">
                                      Quantità: {item.quantity || 1}
                                    </p>
                                    <p className="text-sm font-semibold text-text-primary">
                                      {(item.price * (item.quantity || 1))?.toLocaleString('it-IT', {
                                        style: 'currency',
                                        currency: 'EUR'
                                      })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Order Summary */}
                        <div className="bg-muted p-4 rounded-md">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-text-secondary">Subtotale:</span>
                              <span className="text-text-primary">
                                {order.subtotal?.toLocaleString('it-IT', {
                                  style: 'currency',
                                  currency: 'EUR'
                                }) || 'N/A'}
                              </span>
                            </div>
                            {order.shipping && (
                              <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">Spedizione:</span>
                                <span className="text-text-primary">
                                  {order.shipping.toLocaleString('it-IT', {
                                    style: 'currency',
                                    currency: 'EUR'
                                  })}
                                </span>
                              </div>
                            )}
                            {order.vat && (
                              <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">IVA:</span>
                                <span className="text-text-primary">
                                  {order.vat.toLocaleString('it-IT', {
                                    style: 'currency',
                                    currency: 'EUR'
                                  })}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between text-lg font-heading font-bold pt-2 border-t border-border">
                              <span className="text-text-primary">Totale:</span>
                              <span className="text-text-primary">
                                {order.total?.toLocaleString('it-IT', {
                                  style: 'currency',
                                  currency: 'EUR'
                                }) || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

