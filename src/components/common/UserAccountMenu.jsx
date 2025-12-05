'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { registerCustomer } from '@/utils/customers';

export default function UserAccountMenu() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const isRegisteringRef = useRef(false);

  const checkAuth = (skipRegister = false) => {
    if (typeof window === 'undefined') return;
    
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        setIsAuthenticated(true);
        setUserName(userData?.name || 'Utente');
        
        // Enregistrer automatiquement le client dans l'admin seulement si nécessaire
        if (!skipRegister && !isRegisteringRef.current) {
          isRegisteringRef.current = true;
          
          // Vérifier si le client existe déjà avant d'enregistrer
          const storedCustomers = localStorage.getItem('customers');
          const customers = storedCustomers ? JSON.parse(storedCustomers) : [];
          const customerExists = customers.some(c => c.email === userData.email);
          
          if (!customerExists) {
            registerCustomer(userData);
          }
          
          // Réinitialiser le flag après un court délai
          setTimeout(() => {
            isRegisteringRef.current = false;
          }, 1000);
        }
      } catch (error) {
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
      setUserName('');
    }
  };

  useEffect(() => {
    // Marquer comme monté pour éviter les erreurs d'hydratation
    setIsMounted(true);
    checkAuth();
    
    // Écouter les événements de connexion/déconnexion
    const handleAuthChange = () => {
      checkAuth(true); // Skip register lors des changements d'auth
    };
    
    // Écouter les événements personnalisés
    window.addEventListener('userLoggedOut', handleAuthChange);
    window.addEventListener('userLoggedIn', handleAuthChange);
    
    // Écouter les changements dans localStorage pour détecter les connexions
    const handleStorageChange = (e) => {
      // Seulement si c'est la clé 'user' qui change
      if (e.key === 'user' || e.key === null) {
        checkAuth(true);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Vérifier périodiquement (toutes les 2 secondes) pour détecter les changements dans le même onglet
    const intervalId = setInterval(() => {
      checkAuth(true);
    }, 2000);
    
    return () => {
      window.removeEventListener('userLoggedOut', handleAuthChange);
      window.removeEventListener('userLoggedIn', handleAuthChange);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

  // Gérer les clics extérieurs seulement quand le menu est ouvert
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      // Vérifier que le clic n'est pas sur le bouton ou dans le menu
      const target = event?.target;
      if (
        menuRef?.current && 
        !menuRef?.current.contains(target) &&
        buttonRef?.current &&
        !buttonRef?.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    // Utiliser un délai plus long pour permettre l'ouverture complète
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }, 200);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const toggleMenu = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    // Vérifier l'authentification à chaque ouverture du menu
    checkAuth(true);
    // Utiliser une fonction de callback pour s'assurer que l'état est mis à jour
    setIsOpen(prev => !prev);
  };

  const handleLogout = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Supprimer les données utilisateur
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setIsOpen(false);
    
    // Vider aussi le panier
    localStorage.removeItem('cart');
    
    // Notifier les autres composants de la déconnexion
    window.dispatchEvent(new CustomEvent('userLoggedOut'));
    window.dispatchEvent(new CustomEvent('cartUpdated'));
    window.dispatchEvent(new CustomEvent('storage'));
    
    // Rediriger vers la page d'accueil
    router.push('/');
  };

  const menuItems = [
    {
      label: 'Dashboard',
      href: '/user-dashboard',
      icon: 'HomeIcon',
    },
    {
      label: 'Cronologia Ordini',
      href: '/order-history',
      icon: 'ClipboardListIcon',
    },
  ];

  // Éviter les erreurs d'hydratation en ne rendant le contenu dynamique qu'après le montage
  if (!isMounted) {
    return (
      <div className="relative z-[100]">
        <button
          type="button"
          className="flex items-center gap-2 p-2 rounded-md transition-fast hover:bg-muted group cursor-pointer"
          aria-label="Account menu"
          disabled
        >
          <Icon
            name="UserCircleIcon"
            size={24}
            variant="outline"
            className="text-text-primary group-hover:text-primary transition-fast"
          />
          <span className="hidden md:inline text-text-primary group-hover:text-primary font-body text-sm transition-fast">
            Account
          </span>
          <Icon
            name="ChevronDownIcon"
            size={16}
            variant="outline"
            className="hidden md:inline text-text-secondary transition-base"
          />
        </button>
      </div>
    );
  }

  return (
    <div className="relative z-[100]" ref={menuRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleMenu}
        className="flex items-center gap-2 p-2 rounded-md transition-fast hover:bg-muted group cursor-pointer"
        aria-label="Account menu"
        aria-expanded={isOpen}
      >
        <Icon
          name="UserCircleIcon"
          size={24}
          variant="outline"
          className="text-text-primary group-hover:text-primary transition-fast"
        />
        <span className="hidden md:inline text-text-primary group-hover:text-primary font-body text-sm transition-fast">
          {isAuthenticated ? userName : 'Account'}
        </span>
        <Icon
          name="ChevronDownIcon"
          size={16}
          variant="outline"
          className={`hidden md:inline text-text-secondary transition-base ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
        />
      </button>
        {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-64 bg-popover border border-border rounded-md shadow-dropdown overflow-hidden z-[10000]"
          onClick={(e) => e.stopPropagation()}
        >
          {isAuthenticated ? (
            <>
              <div className="px-4 py-3 border-b border-border bg-muted">
                <p className="text-sm font-body font-semibold text-text-primary">
                  {userName}
                </p>
                <p className="text-xs font-caption text-text-secondary mt-0.5">
                  Benvenuto
                </p>
              </div>
              <nav className="py-2">
                {menuItems?.map((item) => (
                  <Link
                    key={item?.href}
                    href={item?.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-text-primary font-body text-sm transition-fast hover:bg-muted hover:text-primary"
                  >
                    <Icon name={item?.icon} size={18} variant="outline" />
                    <span>{item?.label}</span>
                  </Link>
                ))}
              </nav>
              <div className="border-t border-border py-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-error font-body text-sm transition-fast hover:bg-muted cursor-pointer"
                >
                  <Icon name="ArrowRightOnRectangleIcon" size={18} variant="outline" />
                  <span>Esci</span>
                </button>
              </div>
            </>
            ) : (
              <div className="py-2">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-text-primary font-body text-sm transition-fast hover:bg-muted hover:text-primary"
                >
                  <Icon name="ArrowLeftOnRectangleIcon" size={18} variant="outline" />
                  <span>Accedi</span>
                </Link>
              </div>
            )}
        </div>
      )}
    </div>
  );
}