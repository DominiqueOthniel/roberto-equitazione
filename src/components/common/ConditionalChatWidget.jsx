'use client';

import { usePathname } from 'next/navigation';
import ChatWidget from './ChatWidget';

export default function ConditionalChatWidget() {
  const pathname = usePathname();
  
  // Ne pas afficher le ChatWidget dans l'admin
  if (pathname?.startsWith('/admin')) {
    return null;
  }
  
  return <ChatWidget />;
}











