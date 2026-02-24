/**
 * StickyNote — unit tests
 * Verify children rendering and color class application.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StickyNote } from './sticky-note';

describe('StickyNote', () => {
  it('renders its children', () => {
    render(<StickyNote>Sticky content</StickyNote>);
    expect(screen.getByText('Sticky content')).toBeDefined();
  });

  it('applies yellow background by default', () => {
    const { container } = render(<StickyNote>Yellow note</StickyNote>);
    const roughBorder = container.querySelector('[data-testid="rough-border"]');
    expect(roughBorder?.className).toContain('bg-notebook-highlight-yellow');
  });

  it('applies pink background when color="pink"', () => {
    const { container } = render(<StickyNote color="pink">Pink note</StickyNote>);
    const roughBorder = container.querySelector('[data-testid="rough-border"]');
    expect(roughBorder?.className).toContain('bg-notebook-highlight-pink');
  });

  it('applies mint background when color="mint"', () => {
    const { container } = render(<StickyNote color="mint">Mint note</StickyNote>);
    const roughBorder = container.querySelector('[data-testid="rough-border"]');
    expect(roughBorder?.className).toContain('bg-notebook-highlight-mint');
  });

  it('applies hover transition classes', () => {
    const { container } = render(<StickyNote>Test</StickyNote>);
    const roughBorder = container.querySelector('[data-testid="rough-border"]');
    expect(roughBorder?.className).toContain('transition-all');
  });
});
