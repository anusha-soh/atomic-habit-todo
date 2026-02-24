/**
 * Final CTA Section (US3)
 * Warm notebook-themed call-to-action — feels like the last page
 * of a journal inviting you to start writing.
 */
import Link from 'next/link';

export function FinalCta() {
  return (
    <section
      id="cta"
      data-testid="final-cta-section"
      className="relative bg-notebook-paper-alt py-16 px-6 text-center overflow-hidden"
    >
      {/* Ruled-line paper texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'repeating-linear-gradient(transparent, transparent 27px, var(--notebook-line) 27px, var(--notebook-line) 28px)',
          backgroundPosition: '0 20px',
        }}
        aria-hidden="true"
      />

      {/* Decorative top border — like a divider line drawn in ink */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background:
            'repeating-linear-gradient(90deg, var(--color-notebook-ink-blue) 0px, var(--color-notebook-ink-blue) 16px, transparent 16px, transparent 24px)',
          opacity: 0.2,
        }}
        aria-hidden="true"
      />

      {/* Red margin line */}
      <div
        className="pointer-events-none absolute inset-y-0 left-[72px] hidden sm:block border-l border-notebook-ink-red/15"
        aria-hidden="true"
      />

      {/* Corner doodle – top right */}
      <div
        className="hidden sm:block absolute top-6 right-8 font-patrick-hand text-notebook-ink-light text-sm opacity-50 rotate-12 select-none pointer-events-none"
        aria-hidden="true"
      >
        ← start here
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto space-y-7">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-notebook-highlight-yellow border border-notebook-ink-light/40 rounded-full font-patrick-hand text-notebook-ink-medium text-sm shadow-notebook-sm">
          ✨ Your journey starts now
        </div>

        {/* Headline */}
        <div>
          <h2 className="font-caveat text-5xl sm:text-6xl text-notebook-ink leading-tight">
            Ready to start your{' '}
            <span className="text-notebook-ink-blue relative inline-block">
              first habit?
              {/* hand-drawn underline */}
              <svg
                className="absolute -bottom-1 left-0 w-full"
                viewBox="0 0 200 10"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M0,5 C40,1 80,9 120,5 C160,1 185,8 200,5"
                  stroke="var(--color-notebook-ink-blue)"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  opacity="0.4"
                />
              </svg>
            </span>
          </h2>
        </div>

        {/* Body copy */}
        <p className="font-inter text-notebook-ink-medium text-lg max-w-md mx-auto">
          Your future self will thank you. One habit, one day, one check-mark at a time.
        </p>

        {/* CTA button */}
        <Link
          href="/register"
          className="inline-flex items-center justify-center gap-2 min-h-[44px] min-w-[44px] px-10 py-4 bg-notebook-ink-blue text-notebook-paper-white font-patrick-hand text-xl rounded-lg shadow-notebook-md hover:shadow-notebook-hover hover:-translate-y-1 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-notebook-ink-blue focus-visible:ring-offset-2"
          data-testid="final-cta-button"
        >
          Open My Notebook — Free
          <span aria-hidden="true">📓</span>
        </Link>

        {/* Trust note */}
        <p className="font-patrick-hand text-notebook-ink-light text-sm">
          No credit card required · Cancel anytime
        </p>
      </div>
    </section>
  );
}
