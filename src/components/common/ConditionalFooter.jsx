'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Footer from './Footer';
import WhatsAppButton from './WhatsAppButton';

export default function ConditionalFooter() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Pendant le SSR, toujours afficher le footer pour éviter les erreurs d'hydratation
  if (!mounted) {
    return (
      <>
        <Footer />
        <WhatsAppButton />
      </>
    );
  }

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <Footer />
      <WhatsAppButton />
    </>
  );
}











