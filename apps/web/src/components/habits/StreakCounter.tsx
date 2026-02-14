'use client';

import { useEffect, useRef } from 'react';

interface StreakCounterProps {
  streak: number;
  /** Show compact variant (number only, no label) */
  compact?: boolean;
}

/**
 * Displays the current habit streak with a fire emoji.
 * Animates (bounce) when the streak value changes.
 * Shows milestone text at 7, 21, and 30 day streaks.
 */
export function StreakCounter({ streak, compact = false }: StreakCounterProps) {
  const prevRef = useRef(streak);
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (streak > prevRef.current && spanRef.current) {
      const el = spanRef.current;
      el.classList.remove('animate-bounce-once');
      // Force reflow so re-adding the class triggers the animation again
      void el.offsetWidth;
      el.classList.add('animate-bounce-once');
    }
    prevRef.current = streak;
  }, [streak]);

  if (streak === 0) {
    return compact ? null : (
      <span className="text-xs font-inter text-notebook-ink-light">No streak yet</span>
    );
  }

  const milestoneText =
    streak >= 30 ? 'Unstoppable — 30 day streak!' :
    streak >= 21 ? 'Incredible — 21 day streak!' :
    streak >= 7 ? 'Amazing — 7 day streak!' :
    null;

  return (
    <span className="inline-flex items-center gap-1">
      <span
        ref={spanRef}
        className="inline-flex items-center gap-1 font-semibold text-notebook-ink-red"
        aria-label={`${streak} day streak`}
      >
        🔥
        <span className="tabular-nums">{streak}</span>
        {!compact && (
          <span className="text-sm font-normal font-inter text-notebook-ink-medium">
            {streak === 1 ? 'day' : 'days'}
          </span>
        )}
      </span>
      {milestoneText && (
        <span className="ml-2 font-caveat text-notebook-ink-green text-sm">
          {milestoneText}
        </span>
      )}
    </span>
  );
}
