/**
 * Features Section (US2 - Feature Discovery via "Sticky Notes")
 * Grid of FeatureCard sticky-note cards, each with a subtle tilt
 * so they look naturally pinned to a cork board.
 */
import { FeatureCard } from './feature-card';

const FEATURES = [
  {
    icon: '📋',
    title: 'Smart Tasks',
    description:
      'Create, prioritise, and organise your to-dos with rich filters, due dates, and tags — all presented like neat notebook entries.',
    color: 'yellow' as const,
    seed: 42,
    tilt: '-rotate-1',
  },
  {
    icon: '🔥',
    title: 'Habit Streaks',
    description:
      'Build momentum with daily habit tracking and visual streak counters. Miss a day? No guilt — just pick up where you left off.',
    color: 'pink' as const,
    seed: 73,
    tilt: 'rotate-0',
  },
  {
    icon: '✅',
    title: 'Atomic Progress',
    description:
      'Tiny habits compound into big results. Track completions, review history, and celebrate every small win along the way.',
    color: 'mint' as const,
    seed: 108,
    tilt: 'rotate-1',
  },
];

export function Features() {
  return (
    <section
      id="features"
      data-testid="features-section"
      className="bg-notebook-paper-alt py-16 px-6"
    >
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-10 space-y-2">
          <p className="font-patrick-hand text-notebook-ink-medium uppercase tracking-widest text-sm">
            What you get
          </p>
          <h2 className="font-caveat text-5xl sm:text-6xl text-notebook-ink">
            Everything in one notebook
          </h2>
          <p className="font-inter text-notebook-ink-medium text-lg max-w-md mx-auto">
            Three core features, thoughtfully designed to work together.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
