'use client';

/**
 * StickyNote
 * A sticky-note-style card that wraps content in a RoughBorder
 * with a warm highlight background and soft shadow.
 */
import { type ReactNode } from 'react';
import { RoughBorder } from './rough-border';

export type StickyNoteColor = 'yellow' | 'pink' | 'mint';

const colorMap: Record<StickyNoteColor, { bg: string; stroke: string }> = {
  yellow: { bg: 'bg-notebook-highlight-yellow', stroke: 'var(--notebook-ink-light)' },
  pink:   { bg: 'bg-notebook-highlight-pink',   stroke: '#C06080' },
  mint:   { bg: 'bg-notebook-highlight-mint',   stroke: 'var(--notebook-ink-green)' },
};

export interface StickyNoteProps {
  children: ReactNode;
  color?: StickyNoteColor;
  className?: string;
  seed?: number;
}

export function StickyNote({ children, color = 'yellow', className = '', seed }: StickyNoteProps) {
  const { bg, stroke } = colorMap[color];

  return (
    <RoughBorder
      stroke={stroke}
      strokeWidth={1.5}
      roughness={1.4}
      seed={seed}
      className={`${bg} shadow-notebook-md hover:shadow-notebook-hover hover:-translate-y-1 transition-all duration-200 ${className}`}
    >
      {children}
    </RoughBorder>
  );
}
