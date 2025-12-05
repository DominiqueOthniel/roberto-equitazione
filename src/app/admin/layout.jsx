'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import Icon from '@/components/ui/AppIcon';
import NotificationBell from '@/components/admin/NotificationBell';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Ouvert par défaut
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  
  // Exclure le layout pour la page de login - vérifier après tous les hooks
  const isLoginPage = pathname === '/admin/login';

  // Vérifier l'authentification
  useEffect(() => {
    if (typeof window !== 'undefined' && !isLoginPage) {
      const adminAuth = localStorage.getItem('adminAuth');
      if (adminAuth) {
        try {
          const authData = JSON.parse(adminAuth);
          setIsAuthenticated(true);
        } catch (error) {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setIsChecking(false);
    } else if (isLoginPage) {
      setIsChecking(false);
    }
  }, [isLoginPage]);

  // Rediriger vers login si non authentifié
  useEffect(() => {
    if (!isChecking && !isAuthenticated && !isLoginPage) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, isChecking, isLoginPage, router]);

  // Garder l'état de la sidebar lors du redimensionnement (mais permettre la fermeture manuelle)
  useEffect(() => {
    if (!isLoginPage && typeof window !== 'undefined') {
      const initialValue = localStorage.getItem('sidebarOpen');
      if (initialValue !== null) {
        setIsSidebarOpen(initialValue === 'true');
      } else {
        // Par défaut, ouvrir sur desktop, fermer sur mobile
        setIsSidebarOpen(window.innerWidth >= 1024);
      }
    }
  }, [isLoginPage]);
  
  // Sauvegarder l'état dans localStorage
  useEffect(() => {
    if (!isLoginPage && typeof window !== 'undefined') {
      localStorage.setItem('sidebarOpen', isSidebarOpen.toString());
    }
  }, [isSidebarOpen, isLoginPage]);

  // Exclure le layout pour la page de login
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Afficher un loader pendant la vérification
  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-text-secondary">Verifica dell'autenticazione...</p>
        </div>
      </div>
    );
  }

  // Ne rien afficher si non authentifié (redirection en cours)
  if (!isAuthenticated) {
    return null;
  }

  const menuItems = [
    {
      label: 'Dashboard',
      href: '/admin',
      icon: 'HomeIcon',
    },
    {
      label: 'Prodotti',
      href: '/admin/products',
      icon: 'CubeIcon',
    },
    {
      label: 'Ordini',
      href: '/admin/orders',
      icon: 'ClipboardDocumentListIcon',
    },
    {
      label: 'Clienti',
      href: '/admin/customers',
      icon: 'UsersIcon',
    },
    {
      label: 'Messaggi',
      href: '/admin/messages',
      icon: 'ChatBubbleLeftRightIcon',
    },
    {
      label: 'Recensioni',
      href: '/admin/reviews',
      icon: 'StarIcon',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Overlay mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-card border-r border-border transition-all duration-300 z-50 ${
          isSidebarOpen 
            ? 'w-64 translate-x-0' 
            : '-translate-x-full lg:-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            {isSidebarOpen && (
              <Link href="/admin" className="flex items-center gap-2">
                <Image
                  src="/assets/images/roberto.jpg"
                  alt="Roberto Equitazione"
                  width={120}
                  height={30}
                  className="h-8 w-auto"
                />
                <span className="text-sm font-semibold text-text-secondary">Admin</span>
              </Link>
            )}
            {isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-md hover:bg-muted transition-fast"
              >
                <Icon
                  name="XMarkIcon"
                  size={20}
                  variant="outline"
                />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-fast ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-text-primary hover:bg-muted'
                  }`}
                >
                  <Icon name={item.icon} size={20} variant="outline" />
                  {isSidebarOpen && (
                    <span className="font-body font-medium">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer - Retiré le lien vers le catalogue */}
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-card border-b border-border">
          <div className="flex items-center justify-between px-4 lg:px-6 py-3 lg:py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-md hover:bg-muted transition-fast"
              >
                <Icon name={isSidebarOpen ? 'XMarkIcon' : 'Bars3Icon'} size={20} variant="outline" />
              </button>
              <h1 className="text-xl lg:text-2xl font-heading font-bold text-text-primary">
                Amministrazione
              </h1>
            </div>
            <div className="flex items-center gap-2 lg:gap-4">
              <NotificationBell />
              <div className="hidden sm:flex items-center gap-2 px-2 lg:px-3 py-2 rounded-md bg-muted">
                <Icon name="UserCircleIcon" size={20} variant="outline" />
                <span className="font-body text-sm">Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}

