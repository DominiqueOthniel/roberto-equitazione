'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();
  
  // Ne pas afficher le footer dans l'admin
  if (pathname?.startsWith('/admin')) {
    return null;
  }
  
  return <Footer />;
}










