'use client';

import { useEffect } from 'react';
import { initNavigationTracking } from '@/utils/navigation-safe';

/**
 * Client component to initialize navigation tracking
 * Must be used in a client component context
 */
export default function NavigationInitializer() {
  useEffect(() => {
    initNavigationTracking();
  }, []);

  return null;
}

