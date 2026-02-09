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
  
  // Don't show navbar on login/register pages
  const isAuthPage = pathname === '/login' || pathname === '/register';
  if (isAuthPage) return null;

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Tasks', href: '/tasks' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo & Desktop Links */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <span className="font-bold text-xl hidden sm:block">Atomic Habits</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname.startsWith(link.href)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
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
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-around items-center z-40">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center gap-1 ${
              pathname.startsWith(link.href) ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <span className="text-xs font-medium">{link.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
