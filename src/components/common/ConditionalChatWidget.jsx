'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import ChatWidget from './ChatWidget';

export default function ConditionalChatWidget() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Vérifier l'authentification
  const checkAuth = () => {
    if (typeof window === 'undefined') return false;
    const user = localStorage.getItem('user');
    return !!user;
  };

  useEffect(() => {
    setMounted(true);
    setIsAuthenticated(checkAuth());

    // Écouter les changements d'authentification
    const handleAuthChange = () => {
      setIsAuthenticated(checkAuth());
    };

    window.addEventListener('userLoggedIn', handleAuthChange);
    window.addEventListener('userLoggedOut', handleAuthChange);

    // Écouter les changements dans localStorage
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === null) {
        setIsAuthenticated(checkAuth());
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('userLoggedIn', handleAuthChange);
      window.removeEventListener('userLoggedOut', handleAuthChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Pendant le SSR, ne pas afficher le chat pour éviter les erreurs d'hydratation
  if (!mounted) {
    return null;
  }
  
  // Ne pas afficher le ChatWidget dans l'admin
  if (pathname?.startsWith('/admin')) {
    return null;
  }
  
  // Ne pas afficher le ChatWidget si l'utilisateur n'est pas connecté
  if (!isAuthenticated) {
    return null;
  }
  
  return <ChatWidget />;
}












