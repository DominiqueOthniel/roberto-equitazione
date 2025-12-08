'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Icon from '@/components/ui/AppIcon';

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Vérifier l'authentification
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }

    try {
      const userObj = JSON.parse(userData);
      setUser(userObj);

      // Charger la commande spécifique
      const orderId = params.id;
      if (orderId) {
        loadOrder(orderId, userObj.email);
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setLoading(false);
    }
  }, [params.id, router]);

  const loadOrder = (orderId, userEmail) => {
    try {
      const storedOrders = localStorage.getItem('orders');
      let allOrders = storedOrders ? JSON.parse(storedOrders) : [];

      // Vérifier aussi currentOrder
      const currentOrder = localStorage.getItem('currentOrder');
      if (currentOrder) {
        try {
          const orderData = JSON.parse(currentOrder);
          if (orderData.id === orderId && orderData.email?.toLowerCase() === userEmail?.toLowerCase()) {
            allOrders.unshift(orderData);
          }
        } catch (error) {
          // Ignorer les erreurs de parsing
        }
      }

      // Trouver la commande
      const foundOrder = allOrders.find(
        o => o.id === orderId && o.email?.toLowerCase() === userEmail?.toLowerCase()
      );

      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        // Commande non trouvée
        setOrder(null);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la commande:', error);
      setOrder(null);
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
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'pending': { label: 'In attesa', color: 'text-yellow-600 bg-yellow-50', icon: 'ClockIcon' },
      'processing': { label: 'In elaborazione', color: 'text-blue-600 bg-blue-50', icon: 'CogIcon' },
      'shipped': { label: 'Spedito', color: 'text-purple-600 bg-purple-50', icon: 'TruckIcon' },
      'delivered': { label: 'Consegnato', color: 'text-success bg-green-50', icon: 'CheckCircleIcon' },
      'cancelled': { label: 'Annullato', color: 'text-error bg-red-50', icon: 'XCircleIcon' }
    };
    return statusMap[status] || { label: status, color: 'text-text-secondary bg-muted', icon: 'InformationCircleIcon' };
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

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-6 py-6 sm:py-8">
          <div className="bg-card border border-border rounded-lg p-8 sm:p-12 text-center">
            <Icon name="ExclamationTriangleIcon" size={64} variant="outline" className="mx-auto mb-4 text-text-secondary" />
            <h2 className="text-xl font-heading font-bold text-text-primary mb-2">
              Commande non trouvée
            </h2>
            <p className="text-text-secondary mb-6">
              La commande que vous recherchez n'existe pas ou vous n'avez pas l'autorisation de la voir.
            </p>
            <Link
              href="/order-history"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md font-body font-semibold hover:opacity-90 transition-fast"
            >
              <Icon name="ArrowLeftIcon" size={20} variant="outline" />
              <span>Retour à l'historique</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusLabel(order.status);
  const orderDate = formatDate(order.orderDate || order.date);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link
            href="/order-history"
            className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-fast mb-4"
          >
            <Icon name="ArrowLeftIcon" size={20} variant="outline" />
            <span className="font-body">Torna all'historique</span>
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary">
                Dettagli Ordine
              </h1>
              <p className="text-sm sm:text-base text-text-secondary mt-2">
                {order.id}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
              <h2 className="text-xl font-heading font-bold text-text-primary mb-4">
                Articoli ({order.items?.length || 0})
              </h2>
              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 border border-border rounded-lg">
                    <div className="relative w-24 h-24 bg-surface rounded-lg overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name || 'Prodotto'}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icon name="PhotoIcon" size={32} variant="outline" className="text-text-secondary" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <Link href={`/product/${item.id}`}>
                            <h3 className="font-body font-bold text-text-primary mb-1 hover:text-primary transition-fast">
                              {item.brand && <span className="text-xs text-text-secondary uppercase mr-2">{item.brand}</span>}
                              {item.name || 'Prodotto'}
                            </h3>
                          </Link>
                          {item.specs && (
                            <div className="text-sm text-text-secondary space-y-1 mt-2">
                              {item.specs.size && <p>Taille: {item.specs.size}</p>}
                              {item.specs.color && <p>Couleur: {item.specs.color}</p>}
                              {item.specs.type && <p>Type: {item.specs.type}</p>}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-heading font-bold text-text-primary">
                            €{(item.price * (item.quantity || 1)).toLocaleString('it-IT', {
                              style: 'currency',
                              currency: 'EUR'
                            })}
                          </p>
                          <p className="text-sm text-text-secondary">
                            {item.quantity || 1} x €{(item.price || 0).toLocaleString('it-IT', {
                              style: 'currency',
                              currency: 'EUR'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
                <h2 className="text-xl font-heading font-bold text-text-primary mb-4">
                  Indirizzo di Spedizione
                </h2>
                <div className="text-sm text-text-secondary bg-muted p-4 rounded-md space-y-2">
                  <p className="font-semibold text-text-primary">
                    {order.shippingAddress.nome} {order.shippingAddress.cognome}
                  </p>
                  <p>{order.shippingAddress.via} {order.shippingAddress.numeroCivico}</p>
                  <p>
                    {order.shippingAddress.cap} {order.shippingAddress.citta} ({order.shippingAddress.provincia})
                  </p>
                  <p>{order.shippingAddress.paese}</p>
                  {order.shippingAddress.telefono && (
                    <p className="mt-2">
                      <span className="font-semibold">Telefono:</span> {order.shippingAddress.telefono}
                    </p>
                  )}
                  {order.email && (
                    <p>
                      <span className="font-semibold">Email:</span> {order.email}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-4 sm:p-6 sticky top-24">
              <h2 className="text-xl font-heading font-bold text-text-primary mb-4">
                Riepilogo Ordine
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Data ordine:</span>
                  <span className="text-text-primary font-semibold">{orderDate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Numero ordine:</span>
                  <span className="text-text-primary font-semibold font-mono text-xs">{order.id}</span>
                </div>
                {order.status && (
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Stato:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Subtotale:</span>
                  <span className="text-text-primary">
                    {order.subtotal?.toLocaleString('it-IT', {
                      style: 'currency',
                      currency: 'EUR'
                    }) || 'N/A'}
                  </span>
                </div>
                {order.shipping !== undefined && order.shipping > 0 && (
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
                {order.vat !== undefined && order.vat > 0 && (
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
                <div className="flex justify-between text-lg font-heading font-bold pt-3 border-t border-border">
                  <span className="text-text-primary">Totale:</span>
                  <span className="text-primary">
                    {order.total?.toLocaleString('it-IT', {
                      style: 'currency',
                      currency: 'EUR'
                    }) || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <Link
                  href="/order-history"
                  className="block w-full text-center bg-primary text-primary-foreground px-4 py-3 rounded-md font-body font-semibold hover:opacity-90 transition-fast"
                >
                  Torna all'historique
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}











