'use client';

import { usePathname } from 'next/navigation';

export default function ConditionalMain({ children }) {
  const pathname = usePathname();
  
  // Dans l'admin, pas de padding-top car pas de header
  if (pathname?.startsWith('/admin')) {
    return <main className="flex-1">{children}</main>;
  }
  
  // Sur le site normal, padding-top pour le header fixe et flex pour le footer en bas
  return <main className="flex-1 pt-16">{children}</main>;
}


