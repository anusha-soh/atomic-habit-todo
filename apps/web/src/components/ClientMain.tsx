'use client';

/**
 * ClientMain
 * Conditionally applies mobile-nav bottom padding only on app pages.
 * Marketing pages have no mobile bottom nav, so they skip pb-20.
 */
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

const MARKETING_ROUTES = ['/'];

export function ClientMain({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isMarketing = MARKETING_ROUTES.includes(pathname);

  return (
    <main className={`${isMarketing ? '' : 'pb-20 md:pb-8'} w-full`}>
      {children}
    </main>
  );
}
