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
      // Ne pas réagir si une navigation est en cours
      if (window.__isNavigating) return;
      // Utiliser setTimeout pour éviter les mises à jour d'état pendant le démontage
      setTimeout(() => {
        if (window.__isNavigating) return;
        setIsAuthenticated(checkAuth());
      }, 0);
    };

    window.addEventListener('userLoggedIn', handleAuthChange);
    window.addEventListener('userLoggedOut', handleAuthChange);

    // Écouter les changements dans localStorage
    const handleStorageChange = (e) => {
      // Ne pas réagir si une navigation est en cours
      if (window.__isNavigating) return;
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












