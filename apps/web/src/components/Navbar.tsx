/**
 * Navbar Component
 * Provides consistent navigation across the application
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoutButton } from './LogoutButton';

export function Navbar() {
  const pathname = usePathname();
  
  // Don't show navbar on marketing or auth pages
  const isHiddenPage = pathname === '/' || pathname === '/login' || pathname === '/register';
  if (isHiddenPage) return null;

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Tasks', href: '/tasks' },
  ];

  return (
    <nav className="bg-notebook-paper border-b border-notebook-line sticky top-0 z-30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo & Desktop Links */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-notebook-ink-blue focus-visible:ring-offset-2 rounded" aria-label="Atomic Habits home">
              <span className="text-2xl" aria-hidden="true">🎯</span>
              <span className="font-caveat text-2xl text-notebook-ink hidden sm:block">Atomic Habits</span>
            </Link>

            <div className="hidden md:flex items-center gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 py-2 font-patrick-hand text-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-notebook-ink-blue focus-visible:ring-offset-2 rounded ${
                    pathname.startsWith(link.href)
                      ? 'text-notebook-ink-blue border-b-[3px] border-notebook-ink-blue pb-1'
                      : 'text-notebook-ink-medium hover:text-notebook-ink-blue'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            <LogoutButton />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation (Principle VII: Mobile-First) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-notebook-paper border-t border-notebook-line px-6 py-3 flex justify-around items-center z-40">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center gap-1 font-patrick-hand text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-notebook-ink-blue focus-visible:ring-offset-2 rounded ${
              pathname.startsWith(link.href) ? 'text-notebook-ink-blue font-bold' : 'text-notebook-ink-light'
            }`}
          >
            <span className="text-xs font-medium">{link.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
