'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
  });

  useEffect(() => {
    // Charger les statistiques
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');

    const revenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);

    setStats({
      totalProducts: products.length,
      totalOrders: orders.length,
      totalRevenue: revenue,
      totalCustomers: customers.length,
    });
  }, []);

  const statCards = [
    {
      title: 'Prodotti',
      value: stats.totalProducts,
      icon: 'CubeIcon',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      href: '/admin/products',
    },
    {
      title: 'Ordini',
      value: stats.totalOrders,
      icon: 'ClipboardDocumentListIcon',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      href: '/admin/orders',
    },
    {
      title: 'Ricavi',
      value: `€${stats.totalRevenue.toLocaleString('it-IT')}`,
      icon: 'BanknotesIcon',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      href: '/admin/orders',
    },
    {
      title: 'Clienti',
      value: stats.totalCustomers,
      icon: 'UsersIcon',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      href: '/admin/customers',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'order',
      message: 'Nuovo ordine #ORD-001',
      time: '5 minuti fa',
    },
    {
      id: 2,
      type: 'product',
      message: 'Prodotto "Sella Dressage" modificato',
      time: '1 ora fa',
    },
    {
      id: 3,
      type: 'customer',
      message: 'Nuovo cliente registrato',
      time: '2 ore fa',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-heading font-bold text-text-primary mb-2">
          Panoramica
        </h2>
        <p className="text-text-secondary">
          Benvenuto nella dashboard di amministrazione
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {statCards.map((stat) => (
          <Link
            key={stat.title}
            href={stat.href}
            className="bg-card border border-border rounded-lg p-4 lg:p-6 hover:shadow-lg transition-base"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm text-text-secondary mb-1">{stat.title}</p>
                <p className="text-xl lg:text-2xl font-heading font-bold text-text-primary">
                  {stat.value}
                </p>
              </div>
              <div
                className={`w-10 h-10 lg:w-12 lg:h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}
              >
                <Icon name={stat.icon} size={20} className={stat.color} variant="outline" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="bg-card border border-border rounded-lg p-4 lg:p-6">
        <h3 className="text-base lg:text-lg font-heading font-bold text-text-primary mb-3 lg:mb-4">
          Attività recenti
        </h3>
        <div className="space-y-3 lg:space-y-4">
          {recentActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center gap-4 p-3 rounded-md hover:bg-muted transition-fast"
            >
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                <Icon
                  name={
                    activity.type === 'order'
                      ? 'ClipboardDocumentListIcon'
                      : activity.type === 'product'
                      ? 'CubeIcon'
                      : 'UsersIcon'
                  }
                  size={20}
                  variant="outline"
                />
              </div>
              <div className="flex-1">
                <p className="font-body text-text-primary">{activity.message}</p>
                <p className="text-sm text-text-secondary">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-lg p-4 lg:p-6">
        <h3 className="text-base lg:text-lg font-heading font-bold text-text-primary mb-3 lg:mb-4">
          Azioni rapide
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          <Link
            href="/admin/products/new"
            className="flex items-center gap-3 p-4 border border-border rounded-lg hover:bg-muted transition-fast"
          >
            <Icon name="PlusIcon" size={20} variant="outline" />
            <span className="font-body">Aggiungi un prodotto</span>
          </Link>
          <Link
            href="/admin/orders"
            className="flex items-center gap-3 p-4 border border-border rounded-lg hover:bg-muted transition-fast"
          >
            <Icon name="ClipboardDocumentListIcon" size={20} variant="outline" />
            <span className="font-body">Vedi gli ordini</span>
          </Link>
          <Link
            href="/admin/customers"
            className="flex items-center gap-3 p-4 border border-border rounded-lg hover:bg-muted transition-fast"
          >
            <Icon name="UsersIcon" size={20} variant="outline" />
            <span className="font-body">Gestisci i clienti</span>
          </Link>
          <Link
            href="/admin/storage"
            className="flex items-center gap-3 p-4 border border-border rounded-lg hover:bg-muted transition-fast"
          >
            <Icon name="PhotoIcon" size={20} variant="outline" />
            <span className="font-body">Gestion du stockage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

