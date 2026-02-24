'use client';

/**
 * NotebookNav (US3 - Seamless Navigation and CTA)
 * Marketing-specific navbar. Fixed at top, transitions to
 * semi-transparent cream + shadow when the user scrolls.
 * Includes responsive hamburger menu for mobile.
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Stories', href: '#testimonials' },
];

export function NotebookNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const solidBg = scrolled || mobileOpen;

  return (
    <nav
      data-testid="notebook-nav"
      data-scrolled={scrolled}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        solidBg
          ? 'bg-notebook-paper/95 backdrop-blur-sm shadow-notebook-md border-b border-notebook-line'
          : 'bg-transparent'
      }`}
      aria-label="Main navigation"
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 group"
          aria-label="Atomic Habits home"
        >
          <span className="text-2xl" aria-hidden="true">📓</span>
          <span className="font-caveat text-2xl text-notebook-ink group-hover:text-notebook-ink-blue transition-colors">
            Atomic Habits
          </span>
        </Link>

        {/* Desktop navigation links */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="font-patrick-hand text-lg text-notebook-ink-medium hover:text-notebook-ink-blue transition-colors"
            >
              {label}
            </a>
          ))}
        </div>

        {/* Desktop CTA buttons + Mobile hamburger */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center justify-center min-h-[44px] px-5 py-2 font-patrick-hand text-notebook-ink-blue border border-notebook-ink-blue rounded-lg hover:bg-notebook-paper-alt/60 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-notebook-ink-blue focus-visible:ring-offset-2"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="hidden sm:inline-flex items-center justify-center min-h-[44px] px-5 py-2 bg-notebook-ink-blue text-notebook-paper-white font-patrick-hand rounded-lg shadow-notebook-sm hover:shadow-notebook-hover hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-notebook-ink-blue focus-visible:ring-offset-2"
          >
            Get Started
          </Link>

          {/* Hamburger — mobile only (uses explicit CSS class, not md:hidden,
              because Tailwind v4/Turbopack may not scan responsive prefixes
              in complex className strings at build time) */}
          <button
            className="hamburger-mobile-only flex flex-col justify-center items-center gap-[5px] w-10 h-10 rounded-lg hover:bg-notebook-paper-alt/60 transition-colors"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
          >
            <span
              className="block w-6 h-[2px] bg-notebook-ink rounded-full transition-all duration-300"
              style={{
                transform: mobileOpen ? 'translateY(7px) rotate(45deg)' : 'none',
              }}
            />
            <span
              className="block w-6 h-[2px] bg-notebook-ink rounded-full transition-all duration-300"
              style={{
                opacity: mobileOpen ? 0 : 1,
                transform: mobileOpen ? 'scaleX(0)' : 'none',
              }}
            />
            <span
              className="block w-6 h-[2px] bg-notebook-ink rounded-full transition-all duration-300"
              style={{
                transform: mobileOpen ? 'translateY(-7px) rotate(-45deg)' : 'none',
              }}
            />
          </button>
        </div>
      </div>

      {/* Mobile slide-down menu — inline style used for animated
          max-height/opacity because Tailwind v4 won't scan dynamic
          class names inside ternaries at build time */}
      <div
        className="hamburger-mobile-only overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: mobileOpen ? '18rem' : '0',
          opacity: mobileOpen ? 1 : 0,
          // visibility: hidden also prevents focus-trap on hidden links
          // and allows Playwright/screen readers to correctly detect collapsed state
          visibility: mobileOpen ? 'visible' : 'hidden',
        }}
      >
        <div className="px-6 pb-5 pt-3 flex flex-col gap-1 border-t border-notebook-line/50">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="font-patrick-hand text-xl text-notebook-ink-medium hover:text-notebook-ink-blue transition-colors py-2.5 border-b border-notebook-line/40 last:border-none"
            >
              {label}
            </a>
          ))}
          <div className="flex gap-3 pt-3">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="flex-1 text-center py-2.5 font-patrick-hand text-notebook-ink-blue border border-notebook-ink-blue rounded-lg hover:bg-notebook-paper-alt/60 transition-colors min-h-[44px] flex items-center justify-center"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileOpen(false)}
              className="flex-1 text-center py-2.5 bg-notebook-ink-blue text-notebook-paper-white font-patrick-hand rounded-lg shadow-notebook-sm hover:shadow-notebook-hover transition-all min-h-[44px] flex items-center justify-center"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
