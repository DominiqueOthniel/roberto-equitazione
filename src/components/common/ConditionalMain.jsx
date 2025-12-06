'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ConditionalMain({ children }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Pendant le SSR, utiliser le style par défaut pour éviter les erreurs d'hydratation
  if (!mounted) {
    return <main className="flex-1 pt-16">{children}</main>;
  }
  
  // Dans l'admin, pas de padding-top car pas de header
  if (pathname?.startsWith('/admin')) {
    return <main className="flex-1">{children}</main>;
  }
  
  // Sur le site normal, padding-top pour le header fixe et flex pour le footer en bas
  return <main className="flex-1 pt-16">{children}</main>;
}


