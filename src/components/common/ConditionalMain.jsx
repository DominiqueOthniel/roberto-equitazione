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
    return <main className="flex-1 pt-20">{children}</main>;
  }

  if (pathname?.startsWith('/admin')) {
    return <main className="flex-1">{children}</main>;
  }

  return <main className="flex-1 pt-20">{children}</main>;
}


