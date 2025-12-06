'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getCustomers } from '@/utils/customers-supabase';

export default function CustomersPage() {
  const [customersData, setCustomersData] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    if (typeof window === 'undefined') return;

    // Charger les clients depuis Supabase
    const loadCustomers = async () => {
      try {
        const customers = await getCustomers();
        if (customers.length > 0) {
          setCustomersData(customers);
        } else {
          // Dati di esempio se nessun cliente esiste - créer 5 clients
          const exampleCustomers = [
          {
            id: 1,
            name: 'Marco Rossi',
            email: 'marco.rossi@email.it',
            phone: '+39 333 1234567',
            memberSince: '15/03/2023',
            totalOrders: 5,
            totalSpent: 12500,
            status: 'Actif',
            lastOrder: '22/11/2024',
            address: {
              street: 'Via Roma 123',
              city: 'Milano',
              province: 'MI',
              cap: '20100',
              country: 'Italia'
            },
            isVerified: true
          },
          {
            id: 2,
            name: 'Laura Bianchi',
            email: 'laura.bianchi@email.it',
            phone: '+39 334 2345678',
            memberSince: '20/05/2023',
            totalOrders: 3,
            totalSpent: 8900,
            status: 'Actif',
            lastOrder: '18/11/2024',
            address: {
              street: 'Via Garibaldi 45',
              city: 'Torino',
              province: 'TO',
              cap: '10100',
              country: 'Italia'
            },
            isVerified: true
          },
          {
            id: 3,
            name: 'Giuseppe Verdi',
            email: 'giuseppe.verdi@email.it',
            phone: '+39 335 3456789',
            memberSince: '10/01/2024',
            totalOrders: 8,
            totalSpent: 15200,
            status: 'VIP',
            lastOrder: '25/11/2024',
            address: {
              street: 'Via Dante 78',
              city: 'Roma',
              province: 'RM',
              cap: '00100',
              country: 'Italia'
            },
            isVerified: true
          },
          {
            id: 4,
            name: 'Sofia Neri',
            email: 'sofia.neri@email.it',
            phone: '+39 336 4567890',
            memberSince: '05/07/2023',
            totalOrders: 2,
            totalSpent: 4200,
            status: 'Actif',
            lastOrder: '12/11/2024',
            address: {
              street: 'Via Manzoni 34',
              city: 'Firenze',
              province: 'FI',
              cap: '50100',
              country: 'Italia'
            },
            isVerified: false
          },
          {
            id: 5,
            name: 'Alessandro Romano',
            email: 'alessandro.romano@email.it',
            phone: '+39 337 5678901',
            memberSince: '28/02/2024',
            totalOrders: 1,
            totalSpent: 1450,
            status: 'Inactif',
            lastOrder: '15/09/2024',
            address: {
              street: 'Via Mazzini 56',
              city: 'Napoli',
              province: 'NA',
              cap: '80100',
              country: 'Italia'
            },
            isVerified: true
          }
        ];
          setCustomersData(exampleCustomers);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des clients:', error);
        setCustomersData([]);
      }
    };

    loadCustomers();
    
    // Écouter les changements de localStorage et les événements de mise à jour
    const handleStorageChange = () => {
      loadCustomers();
    };
    
    const handleCustomersUpdated = (event) => {
      loadCustomers();
      
      // Se è un nuovo cliente, scorri verso l'alto per vederlo
      if (event?.detail?.isNew && customersData.length > 0) {
        // Petit délai pour laisser le temps à la liste de se mettre à jour
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 100);
      }
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('customersUpdated', handleCustomersUpdated);
      
      // Vérifier périodiquement pour les mises à jour (synchronisation)
      const interval = setInterval(loadCustomers, 3000);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('customersUpdated', handleCustomersUpdated);
        clearInterval(interval);
      };
    }
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const filteredCustomers = useMemo(() => {
    let filtered = customersData.filter(customer => {
      // Filter by search term (only if search term is provided)
      const matchesSearch = !searchTerm || searchTerm.trim() === '' ||
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.phone && customer.phone.includes(searchTerm));

      // Filter by status
      const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Sort customers
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'totalOrders':
          return (b.totalOrders || 0) - (a.totalOrders || 0);
        case 'totalSpent':
          return (b.totalSpent || 0) - (a.totalSpent || 0);
        case 'memberSince':
          if (!a.memberSince && !b.memberSince) return 0;
          if (!a.memberSince) return 1;
          if (!b.memberSince) return -1;
          try {
            return new Date(b.memberSince.split('/').reverse().join('-')) - 
                   new Date(a.memberSince.split('/').reverse().join('-'));
          } catch {
            return 0;
          }
        case 'lastOrder':
          if (!a.lastOrder && !b.lastOrder) return 0;
          if (!a.lastOrder) return 1;
          if (!b.lastOrder) return -1;
          try {
            return new Date(b.lastOrder.split('/').reverse().join('-')) - 
                   new Date(a.lastOrder.split('/').reverse().join('-'));
          } catch {
            return 0;
          }
        default:
          return 0;
      }
    });

    return filtered;
  }, [customersData, searchTerm, statusFilter, sortBy]);

  const stats = useMemo(() => {
    const total = customersData.length;
    const active = customersData.filter(c => c.status === 'Actif' || c.status === 'VIP').length;
    const totalRevenue = customersData.reduce((sum, c) => sum + (parseFloat(c.totalSpent) || 0), 0);
    const totalOrders = customersData.reduce((sum, c) => sum + (parseInt(c.totalOrders) || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      total: total || 0,
      active: active || 0,
      totalRevenue: totalRevenue || 0,
      avgOrderValue: avgOrderValue || 0
    };
  }, [customersData]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Actif':
        return 'bg-success/10 text-success';
      case 'VIP':
        return 'bg-primary/10 text-primary';
      case 'Inactif':
        return 'bg-muted text-text-secondary';
      default:
        return 'bg-muted text-text-secondary';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-text-primary mb-2">
                Gestione Clienti
              </h1>
              <p className="text-sm sm:text-base text-text-secondary">
                Gestisci tutti i tuoi clienti e le loro informazioni
              </p>
            </div>
            <button className="bg-primary text-primary-foreground px-4 sm:px-6 py-2 sm:py-3 rounded-md font-body font-semibold hover:opacity-90 transition-fast flex items-center gap-2 text-sm sm:text-base">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuovo Cliente
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs sm:text-sm text-text-secondary mb-1">Totale Clienti</p>
              <p className="text-xl sm:text-2xl font-heading font-bold text-text-primary">{stats.total}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs sm:text-sm text-text-secondary mb-1">Clienti Attivi</p>
              <p className="text-xl sm:text-2xl font-heading font-bold text-success">{stats.active}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs sm:text-sm text-text-secondary mb-1">Ricavi Totali</p>
              <p className="text-xl sm:text-2xl font-heading font-bold text-text-primary">
                €{(stats?.totalRevenue || 0).toLocaleString('it-IT')}
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs sm:text-sm text-text-secondary mb-1">Carrello Medio</p>
              <p className="text-xl sm:text-2xl font-heading font-bold text-text-primary">
                €{Math.round(stats?.avgOrderValue || 0).toLocaleString('it-IT')}
              </p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Cerca per nome, email o telefono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
              >
                <option value="all">Tutti gli stati</option>
                <option value="Actif">Actif</option>
                <option value="VIP">VIP</option>
                <option value="Inactif">Inactif</option>
              </select>
            </div>

            {/* Sort */}
            <div className="sm:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
              >
                <option value="name">Ordina per nome</option>
                <option value="totalOrders">Ordina per ordini</option>
                <option value="totalSpent">Ordina per spese</option>
                <option value="memberSince">Ordina per data di iscrizione</option>
                <option value="lastOrder">Ordina per ultimo ordine</option>
              </select>
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-xs sm:text-sm font-body font-semibold text-text-primary">
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-left text-xs sm:text-sm font-body font-semibold text-text-primary hidden sm:table-cell">
                    Contatto
                  </th>
                  <th className="px-4 py-3 text-left text-xs sm:text-sm font-body font-semibold text-text-primary">
                    Ordini
                  </th>
                  <th className="px-4 py-3 text-left text-xs sm:text-sm font-body font-semibold text-text-primary hidden lg:table-cell">
                    Totale Speso
                  </th>
                  <th className="px-4 py-3 text-left text-xs sm:text-sm font-body font-semibold text-text-primary hidden md:table-cell">
                    Stato
                  </th>
                  <th className="px-4 py-3 text-right text-xs sm:text-sm font-body font-semibold text-text-primary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCustomers.filter(customer => customer).map((customer) => (
                  <tr key={customer?.id || Math.random()} className="hover:bg-muted/50 transition-fast">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary font-heading font-bold text-sm">
                            {customer.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-body font-semibold text-text-primary text-sm sm:text-base">
                              {customer.name}
                            </p>
                            {customer.isVerified && (
                              <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <p className="text-xs text-text-secondary sm:hidden">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <div>
                        <p className="text-sm text-text-primary">{customer.email}</p>
                        <p className="text-xs text-text-secondary">{customer.phone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm font-body font-semibold text-text-primary">
                          {customer.totalOrders}
                        </p>
                        {customer.lastOrder && (
                          <p className="text-xs text-text-secondary">
                            Ultimo: {customer.lastOrder}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <p className="text-sm font-body font-semibold text-text-primary">
                        €{(customer?.totalSpent || 0).toLocaleString('it-IT')}
                      </p>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-body font-semibold ${getStatusColor(customer.status)}`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedCustomer(customer)}
                          className="p-2 hover:bg-muted rounded-md transition-fast"
                          aria-label="Vedi dettagli"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <Link
                          href={`/admin/customers/${customer.id}`}
                          className="p-2 hover:bg-muted rounded-md transition-fast"
                          aria-label="Modifier"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCustomers.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-text-secondary">Nessun cliente trovato</p>
            </div>
          )}
        </div>

        {/* Customer Details Modal */}
        {selectedCustomer && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-[110]"
              onClick={() => setSelectedCustomer(null)}
            />
            <div className="fixed inset-0 flex items-center justify-center z-[120] p-4">
              <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-card border-b border-border p-4 sm:p-6 flex items-center justify-between">
                  <h2 className="text-xl sm:text-2xl font-heading font-bold text-text-primary">
                    Dettagli del Cliente
                  </h2>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="p-2 hover:bg-muted rounded-md transition-fast"
                    aria-label="Chiudi"
                  >
                    <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-4 sm:p-6 space-y-6">
                  {/* Customer Info */}
                  <div>
                    <h3 className="text-lg font-heading font-bold text-text-primary mb-4">Informazioni Personali</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-text-secondary mb-1">Nome completo</p>
                        <p className="text-sm font-body text-text-primary">{selectedCustomer.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary mb-1">Email</p>
                        <p className="text-sm font-body text-text-primary">{selectedCustomer.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary mb-1">Telefono</p>
                        <p className="text-sm font-body text-text-primary">{selectedCustomer.phone}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary mb-1">Membro dal</p>
                        <p className="text-sm font-body text-text-primary">{selectedCustomer.memberSince}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary mb-1">Stato</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-body font-semibold ${getStatusColor(selectedCustomer.status)}`}>
                          {selectedCustomer.status}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary mb-1">Account verificato</p>
                        <p className="text-sm font-body text-text-primary">
                          {selectedCustomer.isVerified ? 'Sì' : 'No'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  {selectedCustomer.address && (
                    <div>
                      <h3 className="text-lg font-heading font-bold text-text-primary mb-4">Indirizzo</h3>
                      <div className="bg-muted rounded-lg p-4">
                        <p className="text-sm font-body text-text-primary">
                          {selectedCustomer.address.street}<br />
                          {selectedCustomer.address.cap} {selectedCustomer.address.city} ({selectedCustomer.address.province})<br />
                          {selectedCustomer.address.country}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Statistics */}
                  <div>
                    <h3 className="text-lg font-heading font-bold text-text-primary mb-4">Statistiques</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div className="bg-muted rounded-lg p-4">
                        <p className="text-xs text-text-secondary mb-1">Ordini totali</p>
                        <p className="text-xl font-heading font-bold text-text-primary">{selectedCustomer.totalOrders}</p>
                      </div>
                      <div className="bg-muted rounded-lg p-4">
                        <p className="text-xs text-text-secondary mb-1">Totale speso</p>
                        <p className="text-xl font-heading font-bold text-text-primary">
                          €{(selectedCustomer?.totalSpent || 0).toLocaleString('it-IT')}
                        </p>
                      </div>
                      <div className="bg-muted rounded-lg p-4">
                        <p className="text-xs text-text-secondary mb-1">Ultimo ordine</p>
                        <p className="text-sm font-body text-text-primary">
                          {selectedCustomer.lastOrder || 'Nessuno'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
                    <Link
                      href={`/admin/customers/${selectedCustomer.id}`}
                      className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-md font-body font-semibold hover:opacity-90 transition-fast text-center text-sm sm:text-base"
                    >
                      Modifica cliente
                    </Link>
                    <Link
                      href={`/admin/orders?customer=${selectedCustomer.id}`}
                      className="flex-1 bg-surface text-text-primary border border-border px-4 py-2 rounded-md font-body font-semibold hover:bg-muted transition-fast text-center text-sm sm:text-base"
                    >
                      Vedi gli ordini
                    </Link>
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
