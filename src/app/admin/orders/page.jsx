'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Icon from '@/components/ui/AppIcon';
import { getOrders, updateOrderStatus } from '@/utils/orders-supabase';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  const stats = useMemo(() => {
    const stats = {
      total: orders.length,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      totalRevenue: 0,
    };

    orders.forEach((order) => {
      if (order.status === 'pending') stats.pending++;
      else if (order.status === 'processing') stats.processing++;
      else if (order.status === 'shipped') stats.shipped++;
      else if (order.status === 'delivered') stats.delivered++;
      else if (order.status === 'cancelled') stats.cancelled++;
      
      if (order.status !== 'cancelled') {
        stats.totalRevenue += order.total || 0;
      }
    });

    return stats;
  }, [orders]);

  useEffect(() => {
    loadOrders();
    
    // Écouter les mises à jour
    const handleOrdersUpdated = () => {
      loadOrders();
    };
    
    window.addEventListener('ordersUpdated', handleOrdersUpdated);
    window.addEventListener('newOrder', handleOrdersUpdated);
    
    return () => {
      window.removeEventListener('ordersUpdated', handleOrdersUpdated);
      window.removeEventListener('newOrder', handleOrdersUpdated);
    };
  }, []);

  const loadOrders = async () => {
    if (typeof window === 'undefined') return;
    
    try {
      // Charger depuis Supabase
      const allOrders = await getOrders();
      
      // Convertir les dates string en objets Date si nécessaire
      const formattedOrders = allOrders.map(order => ({
        ...order,
        date: order.date instanceof Date ? order.date : new Date(order.created_at || order.date || order.orderDate),
      }));
      
      setOrders(formattedOrders);
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
      setOrders([]);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    
    // Recharger les commandes depuis Supabase
    await loadOrders();
    
    // Mettre à jour la dernière synchronisation
    const now = new Date();
    setLastSync(now);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lastOrderSync', now.toISOString());
    }
    
    setIsSyncing(false);
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      await loadOrders(); // Recharger depuis Supabase
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'processing':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'shipped':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'delivered':
        return 'bg-success/10 text-success border-success/20';
      case 'cancelled':
        return 'bg-error/10 text-error border-error/20';
      default:
        return 'bg-muted text-text-secondary border-border';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'In attesa';
      case 'processing':
        return 'In elaborazione';
      case 'shipped':
        return 'Spedito';
      case 'delivered':
        return 'Consegnato';
      case 'cancelled':
        return 'Annullato';
      default:
        return status;
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = filterStatus === 'all' ? true : order.status === filterStatus;
      const matchesSearch = 
        !searchQuery ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.email?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [orders, filterStatus, searchQuery]);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTimeAgo = (date) => {
    if (!date) return '';
    const now = new Date();
    const orderDate = date instanceof Date ? date : new Date(date);
    const diffInMinutes = Math.floor((now - orderDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Adesso';
    if (diffInMinutes < 60) return `${diffInMinutes} min fa`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h fa`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} giorni fa`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-text-primary mb-2">
                Gestione Ordini
              </h1>
              <p className="text-sm sm:text-base text-text-secondary">
                Gestisci tutti gli ordini ({filteredOrders.length} {filteredOrders.length !== 1 ? 'ordini' : 'ordine'})
              </p>
            </div>
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="bg-primary text-primary-foreground px-4 sm:px-6 py-2 sm:py-3 rounded-md font-body font-semibold hover:opacity-90 transition-fast disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm sm:text-base"
            >
              {isSyncing ? (
                <>
                  <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Sincronizzazione...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Sincronizza</span>
                </>
              )}
            </button>
          </div>

          {lastSync && (
            <p className="text-xs text-text-secondary">
              Ultima sincronizzazione: {formatDate(lastSync)}
            </p>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4 mt-6">
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs sm:text-sm text-text-secondary mb-1">Total</p>
              <p className="text-xl sm:text-2xl font-heading font-bold text-text-primary">{stats.total}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs sm:text-sm text-text-secondary mb-1">In attesa</p>
              <p className="text-xl sm:text-2xl font-heading font-bold text-warning">{stats.pending}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs sm:text-sm text-text-secondary mb-1">In elaborazione</p>
              <p className="text-xl sm:text-2xl font-heading font-bold text-primary">{stats.processing}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs sm:text-sm text-text-secondary mb-1">Spediti</p>
              <p className="text-xl sm:text-2xl font-heading font-bold text-accent">{stats.shipped}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs sm:text-sm text-text-secondary mb-1">Consegnati</p>
              <p className="text-xl sm:text-2xl font-heading font-bold text-success">{stats.delivered}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs sm:text-sm text-text-secondary mb-1">Annullati</p>
              <p className="text-xl sm:text-2xl font-heading font-bold text-error">{stats.cancelled}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs sm:text-sm text-text-secondary mb-1">Ricavi</p>
              <p className="text-xl sm:text-2xl font-heading font-bold text-text-primary">
                €{stats.totalRevenue.toLocaleString('it-IT')}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Cerca per ID, cliente o email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 sm:py-3 border border-border rounded-md bg-background text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 sm:py-3 border border-border rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
              >
                <option value="all">Tutti gli stati</option>
                <option value="pending">In attesa</option>
                <option value="processing">In elaborazione</option>
                <option value="shipped">Spedito</option>
                <option value="delivered">Consegnato</option>
                <option value="cancelled">Annullato</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table - Desktop */}
        <div className="hidden lg:block bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-body font-semibold text-text-primary uppercase">
                    Ordine
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-body font-semibold text-text-primary uppercase">
                    Cliente
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-body font-semibold text-text-primary uppercase">
                    Data
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-body font-semibold text-text-primary uppercase">
                    Articoli
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-body font-semibold text-text-primary uppercase">
                    Totale
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-body font-semibold text-text-primary uppercase">
                    Stato
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs sm:text-sm font-body font-semibold text-text-primary uppercase">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-text-secondary">
                      Nessun ordine trovato
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/50 transition-fast">
                      <td className="px-4 sm:px-6 py-4">
                        <span className="font-body font-semibold text-text-primary text-sm sm:text-base">
                          {order.id}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div>
                          <p className="font-body text-text-primary text-sm sm:text-base">{order.customer || 'N/A'}</p>
                          <p className="text-xs text-text-secondary">{order.email || ''}</p>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div>
                          <p className="text-sm text-text-primary">{formatDate(order.date)}</p>
                          <p className="text-xs text-text-secondary">{formatTimeAgo(order.date)}</p>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-text-secondary text-sm">
                        {order.items?.length || 0} articol{order.items?.length !== 1 ? 'i' : 'o'}
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className="font-body font-semibold text-text-primary text-sm sm:text-base">
                          €{(order.total || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-body font-semibold border ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-border rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="pending">In attesa</option>
                            <option value="processing">In elaborazione</option>
                            <option value="shipped">Spedito</option>
                            <option value="delivered">Consegnato</option>
                            <option value="cancelled">Annullato</option>
                          </select>
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 rounded-md hover:bg-muted transition-fast"
                            aria-label="Vedi dettagli"
                          >
                            <Icon name="EyeIcon" size={18} variant="outline" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Orders Cards - Mobile */}
        <div className="lg:hidden space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-12 text-center text-text-secondary">
              Nessun ordine trovato
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-card border border-border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-body font-semibold text-text-primary">{order.id}</p>
                    <p className="text-xs text-text-secondary mt-1">
                      {formatDate(order.date)} • {formatTimeAgo(order.date)}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-body font-semibold border ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="font-body text-text-primary">{order.customer || 'N/A'}</p>
                  <p className="text-xs text-text-secondary">{order.email || ''}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div>
                    <p className="text-xs text-text-secondary">Articoli</p>
                    <p className="font-body font-semibold text-text-primary">
                      {order.items?.length || 0} articol{order.items?.length !== 1 ? 'i' : 'o'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-text-secondary">Total</p>
                    <p className="font-body font-semibold text-text-primary">
                      €{(order.total || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-border">
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="pending">In attesa</option>
                    <option value="processing">In elaborazione</option>
                    <option value="shipped">Spedito</option>
                    <option value="delivered">Consegnato</option>
                    <option value="cancelled">Annullato</option>
                  </select>
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-border rounded-md hover:bg-muted transition-fast"
                  >
                    <Icon name="EyeIcon" size={16} variant="outline" />
                    <span className="text-sm">Vedi dettagli</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-[110]"
              onClick={() => setSelectedOrder(null)}
            />
            <div className="fixed inset-0 flex items-center justify-center z-[120] p-4">
              <div className="bg-card border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-card border-b border-border px-4 sm:px-6 py-4 flex items-center justify-between">
                  <h3 className="text-xl sm:text-2xl font-heading font-bold text-text-primary">
                    Dettagli dell'Ordine {selectedOrder.id}
                  </h3>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 rounded-md hover:bg-muted transition-fast"
                    aria-label="Chiudi"
                  >
                    <Icon name="XMarkIcon" size={20} variant="outline" />
                  </button>
                </div>
                
                <div className="p-4 sm:p-6 space-y-6">
                  {/* Order Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-body font-semibold text-text-primary mb-3">Informazioni Cliente</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-text-secondary">Nom:</span> {selectedOrder.customer || 'N/A'}</p>
                        <p><span className="text-text-secondary">Email:</span> {selectedOrder.email || 'N/A'}</p>
                        {selectedOrder.phone && (
                          <p><span className="text-text-secondary">Telefono:</span> {selectedOrder.phone}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-body font-semibold text-text-primary mb-3">Indirizzo di Spedizione</h4>
                      {selectedOrder.shippingAddress ? (
                        <div className="space-y-2 text-sm">
                          <p>{selectedOrder.shippingAddress.via} {selectedOrder.shippingAddress.numeroCivico}</p>
                          <p>{selectedOrder.shippingAddress.cap} {selectedOrder.shippingAddress.citta}</p>
                          <p>{selectedOrder.shippingAddress.provincia}, {selectedOrder.shippingAddress.paese}</p>
                        </div>
                      ) : (
                        <p className="text-text-secondary text-sm">N/A</p>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h4 className="font-body font-semibold text-text-primary mb-3">Articoli</h4>
                    <div className="space-y-4">
                      {selectedOrder.items?.map((item, index) => (
                        <div key={index} className="flex gap-4 p-4 border border-border rounded-lg">
                          <div className="relative w-20 h-20 bg-surface rounded-lg overflow-hidden flex-shrink-0">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                                sizes="80px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-text-secondary">
                                <Icon name="PhotoIcon" size={24} variant="outline" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-text-secondary uppercase font-semibold mb-1">
                              {item.brand}
                            </p>
                            <h5 className="font-body font-semibold text-text-primary mb-2">
                              {item.name}
                            </h5>
                            {item.specs && (
                              <div className="text-sm text-text-secondary mb-2">
                                {item.specs.size && <p>Taglia: {item.specs.size}"</p>}
                                {item.specs.type && <p>Tipo: {item.specs.type}</p>}
                              </div>
                            )}
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-text-secondary">
                                Quantità: {item.quantity || 1}
                              </p>
                              <p className="font-body font-semibold text-text-primary">
                                €{((item.price || 0) * (item.quantity || 1)).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="border-t border-border pt-4">
                    <h4 className="font-body font-semibold text-text-primary mb-3">Riepilogo</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between border-t border-border pt-2 font-heading font-bold text-text-primary">
                        <span>Total:</span>
                        <span>€{(selectedOrder.total || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <p className="text-xs text-text-secondary mt-2">
                        Prezzo tutto incluso (spedizione compresa)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
