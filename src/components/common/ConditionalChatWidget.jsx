'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import ChatWidget from './ChatWidget';

export default function ConditionalChatWidget() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Pendant le SSR, ne pas afficher le chat pour éviter les erreurs d'hydratation
  if (!mounted) {
    return null;
  }
  
  // Ne pas afficher le ChatWidget dans l'admin
  if (pathname?.startsWith('/admin')) {
    return null;
  }
  
  return <ChatWidget />;
}












