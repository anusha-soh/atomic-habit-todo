/**
 * Hero Section (US1 - Warm Welcome & Brand Identity)
 * Cream background, Caveat handwritten headline, ink-styled CTA.
 * Includes floating sticky note doodles, wavy underline, and stats row.
 */
import Link from 'next/link';

/* ── Decorative pencil SVG ──────────────────────────────────────────────── */
function PencilDoodle() {
  return (
    <svg
      width="130"
      height="30"
      viewBox="0 0 130 30"
      fill="none"
      aria-hidden="true"
      className="mx-auto opacity-70"
    >
      {/* Eraser */}
      <rect x="2" y="9" width="12" height="12" rx="2" fill="#FFE0E6" stroke="#C06080" strokeWidth="1.5" />
      {/* Band */}
      <rect x="14" y="9" width="4" height="12" fill="#E8DCC8" stroke="#8B775A" strokeWidth="1" />
      {/* Body */}
      <rect x="18" y="9" width="88" height="12" rx="1" fill="#FFF3BF" stroke="#8B775A" strokeWidth="1.5" />
      {/* Wood grain lines */}
      {[35, 55, 75, 95].map((x) => (
        <line key={x} x1={x} y1="10" x2={x} y2="20" stroke="#E8DCC8" strokeWidth="0.8" />
      ))}
      {/* Tip cone */}
      <path d="M106 9 L126 15 L106 21 Z" fill="#FAF0D7" stroke="#8B775A" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Graphite tip */}
      <path d="M124 14 L128 15 L124 16 Z" fill="#5C4F3A" />
    </svg>
  );
}

/* ── Floating sticky note — right side (lg only) ───────────────────────── */
function FloatingStickyRight() {
  return (
    <div
      className="hidden lg:block absolute right-10 top-36 rotate-6 w-48 select-none pointer-events-none"
      aria-hidden="true"
    >
      <div
        className="bg-notebook-highlight-yellow p-4 shadow-notebook-lg"
        style={{ border: '1.5px solid #8B775A', borderRadius: '2px 10px 3px 8px' }}
      >
        <p className="font-caveat text-lg text-notebook-ink mb-2">Today's goals:</p>
        <p className="font-patrick-hand text-sm text-notebook-ink">☐ Morning walk</p>
        <p className="font-patrick-hand text-sm text-notebook-ink">☑ Read 10 pages</p>
        <p className="font-patrick-hand text-sm text-notebook-ink">☐ Drink water</p>
        <p className="font-patrick-hand text-xs text-notebook-ink-light mt-2">Day 42 🔥</p>
      </div>
    </div>
  );
}

/* ── Floating sticky note — left side (lg only) ────────────────────────── */
function FloatingStickyLeft() {
  return (
    <div
      className="hidden lg:block absolute left-10 bottom-28 -rotate-3 w-44 select-none pointer-events-none"
      aria-hidden="true"
    >
      <div
        className="bg-notebook-highlight-mint p-4 shadow-notebook-md"
        style={{ border: '1.5px solid #3D7A4A', borderRadius: '4px 2px 8px 3px' }}
      >
        <p className="font-caveat text-base text-notebook-ink mb-1">💪 Week 6</p>
        <p className="font-patrick-hand text-xs text-notebook-ink">Exercise: 42-day streak</p>
        <p className="font-patrick-hand text-xs text-notebook-ink mt-1">Reading: 18-day streak</p>
        <p className="font-patrick-hand text-xs text-notebook-ink-light mt-2">Keep going! ✨</p>
      </div>
    </div>
  );
}

/* ── Stats row ──────────────────────────────────────────────────────────── */
const STATS = [
  { icon: '✅', value: '10k+', label: 'habits tracked' },
  { icon: '🔥', value: '500+', label: 'day streaks' },
  { icon: '📋', value: '50k+', label: 'tasks done' },
] as const;

/* ── Hero ───────────────────────────────────────────────────────────────── */
export function Hero() {
  return (
    <section
      data-testid="hero-section"
      className="relative bg-notebook-paper flex flex-col items-center justify-center px-6 pt-28 pb-20 text-center overflow-hidden"
    >
      {/* Ruled-line paper texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            'repeating-linear-gradient(transparent, transparent 27px, var(--notebook-line) 27px, var(--notebook-line) 28px)',
          backgroundPosition: '0 40px',
        }}
        aria-hidden="true"
      />

      {/* Red margin line */}
      <div
        className="pointer-events-none absolute inset-y-0 left-[72px] hidden sm:block border-l-2 border-notebook-ink-red/20"
        aria-hidden="true"
      />

      {/* Corner fold decoration (top-left) */}
      <div
        className="pointer-events-none absolute top-0 left-0 w-0 h-0 hidden sm:block"
        style={{ borderTop: '48px solid #FAF0D7', borderRight: '48px solid transparent' }}
        aria-hidden="true"
      />

      {/* Floating notebook doodles */}
      <FloatingStickyRight />
      <FloatingStickyLeft />

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto space-y-6">
        {/* Pencil doodle */}
        <div className="animate-fade-in-up">
          <PencilDoodle />
        </div>

        {/* Eyebrow label */}
        <p
          className="font-patrick-hand text-notebook-ink-medium text-lg tracking-wide uppercase animate-fade-in-up"
          style={{ animationDelay: '0.05s' }}
        >
          ✏️ Build better habits, one day at a time
        </p>

        {/* Main headline */}
        <h1
          className="font-caveat text-6xl sm:text-7xl lg:text-8xl text-notebook-ink leading-tight animate-fade-in-up"
          style={{ animationDelay: '0.1s' }}
          data-testid="hero-headline"
        >
          Your Atomic Habits,{' '}
          <span className="relative inline-block text-notebook-ink-blue">
            Beautifully Tracked
            {/* Wavy underline */}
            <svg
              className="absolute -bottom-2 left-0 w-full"
              viewBox="0 0 300 14"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M0,7 C30,1 60,13 90,7 C120,1 150,13 180,7 C210,1 240,13 270,7 C285,4 295,10 300,7"
                stroke="var(--color-notebook-ink-blue)"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                opacity="0.45"
              />
            </svg>
          </span>
        </h1>

        {/* Sub-headline */}
        <p
          className="font-inter text-notebook-ink-medium text-lg sm:text-xl max-w-xl mx-auto animate-fade-in-up"
          style={{ animationDelay: '0.18s' }}
        >
          A cozy notebook-inspired app for building habits and ticking off tasks —
          no spreadsheet required.
        </p>

        {/* CTA buttons */}
        <div
          className="flex flex-col sm:flex-row gap-4 justify-center pt-2 animate-fade-in-up"
          style={{ animationDelay: '0.26s' }}
        >
          <Link
            href="/register"
            className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-8 py-3 bg-notebook-ink-blue text-notebook-paper-white font-patrick-hand text-lg rounded-lg shadow-notebook-md hover:shadow-notebook-hover hover:-translate-y-1 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-notebook-ink-blue focus-visible:ring-offset-2"
            data-testid="hero-cta-primary"
          >
            Get Started — It&apos;s Free
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-8 py-3 border-2 border-notebook-ink-blue text-notebook-ink-blue font-patrick-hand text-lg rounded-lg hover:bg-notebook-paper-alt/60 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-notebook-ink-blue focus-visible:ring-offset-2"
            data-testid="hero-cta-secondary"
          >
            Sign In
          </Link>
        </div>

        {/* Stats row */}
        <div
          className="flex flex-wrap justify-center gap-x-6 gap-y-2 pt-3 animate-fade-in-up"
          style={{ animationDelay: '0.34s' }}
        >
          {STATS.map(({ icon, value, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="text-base" aria-hidden="true">{icon}</span>
              <span className="font-caveat text-xl text-notebook-ink">{value}</span>
              <span className="font-patrick-hand text-sm text-notebook-ink-medium">{label}</span>
            </div>
          ))}
        </div>

        {/* Social proof nudge */}
        <p
          className="font-patrick-hand text-notebook-ink-light text-sm pt-1 animate-fade-in-up"
          style={{ animationDelay: '0.42s' }}
        >
          Join others building better habits, one small step at a time.
        </p>
      </div>
    </section>
  );
}
