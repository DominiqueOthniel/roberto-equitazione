'use client';

import { usePathname } from 'next/navigation';
import SimpleHeader from './SimpleHeader';

export default function ConditionalHeader() {
  const pathname = usePathname();
  
  // Ne pas afficher le header dans l'admin
  if (pathname?.startsWith('/admin')) {
    return null;
  }
  
  return <SimpleHeader />;
}











