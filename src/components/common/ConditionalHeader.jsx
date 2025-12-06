'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import SimpleHeader from './SimpleHeader';

export default function ConditionalHeader() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Pendant le SSR, toujours afficher le header pour éviter les erreurs d'hydratation
  if (!mounted) {
    return <SimpleHeader />;
  }
  
  // Ne pas afficher le header dans l'admin
  if (pathname?.startsWith('/admin')) {
    return null;
  }
  
  return <SimpleHeader />;
}












