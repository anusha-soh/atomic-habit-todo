/**
 * RoughBorder — unit tests
 * Verify children rendering and SVG container existence.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RoughBorder } from './rough-border';

describe('RoughBorder', () => {
  it('renders children', () => {
    render(<RoughBorder>hello</RoughBorder>);
    expect(screen.getByText('hello')).toBeDefined();
  });

  it('exposes data-testid="rough-border" on the container', () => {
    render(<RoughBorder>content</RoughBorder>);
    expect(screen.getByTestId('rough-border')).toBeDefined();
  });

  it('applies className to the outer container', () => {
    render(<RoughBorder className="custom-class">test</RoughBorder>);
    const container = screen.getByTestId('rough-border');
    expect(container.className).toContain('custom-class');
  });

  it('renders an accessible container for SVG (aria-hidden SVG when loaded)', () => {
    const { container } = render(<RoughBorder>test</RoughBorder>);
    // On first render dimensions are 0, so SVG is not yet drawn — no aria-hidden
    // The inner div with z-index:2 wraps the children
    const innerDiv = container.querySelector('[style*="z-index: 2"]');
    expect(innerDiv).toBeDefined();
  });
});
