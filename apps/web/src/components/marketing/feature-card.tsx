'use client';

/**
 * FeatureCard (US2 - Feature Discovery via Sticky Notes)
 * Each feature is a sticky-note-style card with a sketchy border,
 * icon, title, and description.
 * Optional tilt gives each card a slightly-pinned-to-board feel.
 */
import { StickyNote, type StickyNoteColor } from '@/components/ui/sticky-note';

export interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  color?: StickyNoteColor;
  seed?: number;
  /** Tailwind rotate class e.g. "-rotate-1", "rotate-0", "rotate-1" */
  tilt?: string;
}

export function FeatureCard({
  icon,
  title,
  description,
  color = 'yellow',
  seed,
  tilt = '',
}: FeatureCardProps) {
  return (
    <div
      className={`h-full transition-all duration-300 hover:rotate-0 hover:-translate-y-1.5 ${tilt}`}
    >
      <StickyNote color={color} seed={seed} className="h-full">
        <div className="p-6 sm:p-8 space-y-3" data-testid="feature-card">
          <span className="text-4xl block" role="img" aria-hidden="true">
            {icon}
          </span>
          <h3 className="font-caveat text-2xl text-notebook-ink">{title}</h3>
          <p className="font-inter text-notebook-ink-medium text-base leading-relaxed">
            {description}
          </p>
        </div>
      </StickyNote>
    </div>
  );
}
