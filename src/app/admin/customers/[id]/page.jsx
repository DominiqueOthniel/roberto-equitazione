'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCustomers } from '@/utils/customers-supabase';

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params?.id;
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    
    if (!customerId) {
      router.push('/admin/customers');
      return;
    }

    const loadCustomer = async () => {
      try {
        const customers = await getCustomers();
        const foundCustomer = customers.find(c => c.id === parseInt(customerId) || c.id === customerId);
        
        if (foundCustomer) {
          setCustomer(foundCustomer);
          setLoading(false);
        } else {
          // Si pas trouvé, rediriger
          router.push('/admin/customers');
        }
      } catch (error) {
        console.error('Erreur lors du chargement du client:', error);
        setLoading(false);
      }
    };

    loadCustomer();

    // Écouter les changements
    const handleStorageChange = () => {
      loadCustomer();
    };

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(loadCustomer, 3000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [customerId, router, mounted]);

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

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary mb-4">Cliente non trovato</p>
          <Link href="/admin/customers" className="text-primary hover:underline">
            Torna alla lista clienti
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/admin/customers"
              className="p-2 hover:bg-muted rounded-md transition-fast"
              aria-label="Torna indietro"
            >
              <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-text-primary mb-2">
                {customer.name}
              </h1>
              <p className="text-sm sm:text-base text-text-secondary">
                Dettagli e informazioni del cliente
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informazioni Personali */}
            <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
              <h2 className="text-xl font-heading font-bold text-text-primary mb-4">
                Informazioni Personali
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-text-secondary mb-1">Nome completo</p>
                  <p className="text-sm font-body text-text-primary">{customer.name}</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary mb-1">Email</p>
                  <p className="text-sm font-body text-text-primary">{customer.email}</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary mb-1">Telefono</p>
                  <p className="text-sm font-body text-text-primary">{customer.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary mb-1">Membro dal</p>
                  <p className="text-sm font-body text-text-primary">{customer.memberSince || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary mb-1">Stato</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-body font-semibold ${getStatusColor(customer.status)}`}>
                    {customer.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-text-secondary mb-1">Account verificato</p>
                  <p className="text-sm font-body text-text-primary">
                    {customer.isVerified ? (
                      <span className="flex items-center gap-1 text-success">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Sì
                      </span>
                    ) : (
                      'No'
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Indirizzo */}
            {customer.address && (
              <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
                <h2 className="text-xl font-heading font-bold text-text-primary mb-4">
                  Indirizzo
                </h2>
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm font-body text-text-primary">
                    {customer.address.street}<br />
                    {customer.address.cap} {customer.address.city} ({customer.address.province})<br />
                    {customer.address.country}
                  </p>
                </div>
              </div>
            )}

            {/* Statistiche */}
            <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
              <h2 className="text-xl font-heading font-bold text-text-primary mb-4">
                Statistiche
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-xs text-text-secondary mb-1">Ordini totali</p>
                  <p className="text-2xl font-heading font-bold text-text-primary">{customer.totalOrders || 0}</p>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-xs text-text-secondary mb-1">Totale speso</p>
                  <p className="text-2xl font-heading font-bold text-text-primary">
                    €{(customer.totalSpent || 0).toLocaleString('it-IT')}
                  </p>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-xs text-text-secondary mb-1">Ultimo ordine</p>
                  <p className="text-sm font-body text-text-primary">
                    {customer.lastOrder || 'Nessuno'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
              <h3 className="text-lg font-heading font-bold text-text-primary mb-4">
                Azioni
              </h3>
              <div className="space-y-3">
                <button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md font-body font-semibold hover:opacity-90 transition-fast text-sm sm:text-base">
                  Modifica cliente
                </button>
                <Link
                  href={`/admin/orders?customer=${customer.id}`}
                  className="block w-full bg-surface text-text-primary border border-border px-4 py-2 rounded-md font-body font-semibold hover:bg-muted transition-fast text-center text-sm sm:text-base"
                >
                  Vedi gli ordini
                </Link>
                <button className="w-full bg-error/10 text-error border border-error/20 px-4 py-2 rounded-md font-body font-semibold hover:bg-error/20 transition-fast text-sm sm:text-base">
                  Elimina cliente
                </button>
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
              <h3 className="text-lg font-heading font-bold text-text-primary mb-4">
                Informazioni Rapide
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">ID Cliente</span>
                  <span className="text-sm font-body font-semibold text-text-primary">#{customer.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Valore medio ordine</span>
                  <span className="text-sm font-body font-semibold text-text-primary">
                    €{customer.totalOrders > 0 
                      ? Math.round((customer.totalSpent || 0) / customer.totalOrders).toLocaleString('it-IT')
                      : '0'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


