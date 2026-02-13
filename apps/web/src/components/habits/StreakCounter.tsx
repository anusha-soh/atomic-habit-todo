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
      <span className="text-xs text-gray-400">No streak yet</span>
    );
  }

  return (
    <span
      ref={spanRef}
      className="inline-flex items-center gap-1 font-semibold text-orange-500"
      aria-label={`${streak} day streak`}
    >
      🔥
      <span className="tabular-nums">{streak}</span>
      {!compact && (
        <span className="text-sm font-normal text-gray-600">
          {streak === 1 ? 'day' : 'days'}
        </span>
      )}
    </span>
  );
}
