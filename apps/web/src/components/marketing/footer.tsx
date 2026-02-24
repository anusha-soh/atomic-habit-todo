/**
 * Footer — notebook-themed with essential links.
 * All informational links open in a new tab (_blank) per FR-009.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      data-testid="footer"
      className="bg-notebook-paper-alt border-t border-notebook-line py-10 px-6"
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">📓</span>
          <span className="font-caveat text-xl text-notebook-ink">Atomic Habits</span>
        </div>

        {/* Links */}
        <nav aria-label="Footer navigation">
          <ul className="flex flex-wrap justify-center gap-6">
            {[
              { label: 'About',   href: '/about' },
              { label: 'Privacy', href: '/privacy' },
              { label: 'Terms',   href: '/terms' },
            ].map(({ label, href }) => (
              <li key={label}>
                <a
                  href={href}
                  className="font-patrick-hand text-notebook-ink-medium hover:text-notebook-ink-blue transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-notebook-ink-blue rounded"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Copyright */}
        <p className="font-patrick-hand text-notebook-ink-light text-sm">
          &copy; {year} Atomic Habits
        </p>
      </div>
    </footer>
  );
}
