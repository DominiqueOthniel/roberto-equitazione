'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Pendant le SSR, toujours afficher le footer pour éviter les erreurs d'hydratation
  if (!mounted) {
    return <Footer />;
  }
  
  // Ne pas afficher le footer dans l'admin
  if (pathname?.startsWith('/admin')) {
    return null;
  }
  
  return <Footer />;
}











