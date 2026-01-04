'use client';

import { useState, useEffect } from 'react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Charger les commandes depuis localStorage
    if (typeof window !== 'undefined') {
      const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      setOrders(storedOrders);
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Gestion des Commandes</h1>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Total Commandes</h3>
            <p className="text-3xl font-bold text-primary">{totalOrders}</p>
          </div>
          <div className="bg-card p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Commandes en Attente</h3>
            <p className="text-3xl font-bold text-warning">{pendingOrders}</p>
          </div>
          <div className="bg-card p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Revenus Totaux</h3>
            <p className="text-3xl font-bold text-success">€{totalRevenue.toLocaleString('it-IT')}</p>
          </div>
        </div>

        {/* Liste des commandes */}
        <div className="bg-card rounded-lg">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Toutes les Commandes</h2>
          </div>
          <div className="divide-y">
            {orders.length === 0 ? (
              <div className="p-6 text-center text-text-secondary">
                Aucune commande trouvée
              </div>
            ) : (
              orders.slice(0, 10).map((order, index) => (
                <div key={order.id || index} className="p-6 hover:bg-muted/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold">Commande #{order.id || `ORD-${index + 1}`}</div>
                      <div className="text-sm text-text-secondary mt-1">
                        {order.customer || 'Client inconnu'} • {order.email || ''}
                      </div>
                      <div className="text-sm text-text-secondary">
                        {order.date ? new Date(order.date).toLocaleDateString('fr-FR') : 'Date inconnue'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">€{order.total ? order.total.toLocaleString('it-IT') : '0'}</div>
                      <div className={`text-xs px-2 py-1 rounded-full mt-1 ${
                        order.status === 'pending' ? 'bg-warning/20 text-warning' :
                        order.status === 'delivered' ? 'bg-success/20 text-success' :
                        'bg-muted text-text-secondary'
                      }`}>
                        {order.status || 'Statut inconnu'}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}