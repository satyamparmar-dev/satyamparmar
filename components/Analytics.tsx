'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { pageview } from '@/lib/analytics';

/**
 * Client-side Analytics component
 * Tracks page views for client-side navigation in Next.js
 */
export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    // Track page view when pathname changes
    if (!pathname) return;
    if (pathname.startsWith('/admin')) return;
    pageview(pathname);
  }, [pathname]);

  return null; // This component doesn't render anything
}
