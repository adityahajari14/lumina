'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initializeStoreSession } from '@/lib/store-session';

export default function StoreSession() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  useEffect(() => { initializeStoreSession(); }, [pathname, search]);
  return null;
}
