'use client';

/**
 * Testimonials Section (US4 - Social Proof & Encouragement)
 * 3 friendly handwritten-style quotes styled as sticky notes.
 * Slight tilts make them feel like notes pinned to a board.
 */
import { StickyNote } from '@/components/ui/sticky-note';

const TESTIMONIALS = [
  {
    quote:
      "I finally stopped breaking my morning routine streak. Three months in and counting! The notebook vibe keeps me motivated.",
    name: 'Priya M.',
    avatar: '🌸',
    color: 'yellow' as const,
    seed: 17,
    tilt: '-rotate-1',
  },
  {
    quote:
      "Tasks + habits in the same app? Yes please. It's like having a bullet journal that actually talks back.",
    name: 'James T.',
    avatar: '🎨',
    color: 'pink' as const,
    seed: 55,
    tilt: 'rotate-0',
  },
  {
    quote:
      "The streak counter is addictive in the best way. I haven't missed a reading session in 6 weeks. Thank you!",
    name: 'Anika R.',
    avatar: '📚',
    color: 'mint' as const,
    seed: 91,
    tilt: 'rotate-1',
  },
];

export function Testimonials() {
  return (
    <section
      id="testimonials"
      data-testid="testimonials-section"
      className="bg-notebook-paper py-16 px-6"
    >
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-10 space-y-2">
          <p className="font-patrick-hand text-notebook-ink-medium uppercase tracking-widest text-sm">
            Community notes
          </p>
          <h2 className="font-caveat text-5xl sm:text-6xl text-notebook-ink">
            Notes from our community
          </h2>
          <p className="font-inter text-notebook-ink-medium text-lg">
            Real words from real habit-builders.
          </p>
        </div>

        {/* Testimonial cards */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch"
          aria-label="User testimonials"
        >
          {TESTIMONIALS.map(({ quote, name, avatar, color, seed, tilt }) => (
            <div
              key={name}
              className={`transition-all duration-300 hover:rotate-0 hover:-translate-y-1.5 ${tilt}`}
            >
              <StickyNote color={color} seed={seed} className="h-full">
                <figure className="p-6 space-y-4">
                  {/* Avatar doodle */}
                  <div
                    className="w-12 h-12 rounded-full bg-notebook-paper flex items-center justify-center text-2xl shadow-notebook-sm"
                    aria-hidden="true"
                  >
                    {avatar}
                  </div>

                  {/* Quote */}
                  <blockquote>
                    <p className="font-patrick-hand text-notebook-ink text-base leading-relaxed">
                      &ldquo;{quote}&rdquo;
                    </p>
                  </blockquote>

                  {/* Attribution */}
                  <figcaption className="font-caveat text-notebook-ink-medium text-lg">
                    — {name}
                  </figcaption>
                </figure>
              </StickyNote>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
