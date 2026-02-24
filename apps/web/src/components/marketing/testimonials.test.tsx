/**
 * Testimonials — unit tests (US4)
 * Verify 3 quotes render in Patrick Hand font with doodle avatars.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Testimonials } from './testimonials';

describe('Testimonials', () => {
  it('renders 3 testimonial figures', () => {
    const { container } = render(<Testimonials />);
    const figures = container.querySelectorAll('figure');
    expect(figures).toHaveLength(3);
  });

  it('renders the section with testid="testimonials-section"', () => {
    render(<Testimonials />);
    expect(screen.getByTestId('testimonials-section')).toBeDefined();
  });

  it('renders quote text using Patrick Hand font', () => {
    const { container } = render(<Testimonials />);
    const quotes = container.querySelectorAll('blockquote p');
    expect(quotes.length).toBeGreaterThanOrEqual(1);
    quotes.forEach((q) => {
      expect(q.className).toContain('font-patrick-hand');
    });
  });

  it('renders avatar/doodle elements for each testimonial', () => {
    const { container } = render(<Testimonials />);
    // Each testimonial has an avatar div with text-2xl
    const avatars = container.querySelectorAll('[aria-hidden="true"]');
    // At least 3 avatar divs (plus decorative divs in sticky notes)
    expect(avatars.length).toBeGreaterThanOrEqual(3);
  });

  it('renders section heading in Caveat font', () => {
    render(<Testimonials />);
    const heading = screen.getByText('Notes from our community');
    expect(heading.className).toContain('font-caveat');
  });
});
