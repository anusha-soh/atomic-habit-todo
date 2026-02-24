/**
 * FeatureCard — unit tests (US2)
 * Verify props render correctly inside a StickyNote wrapper.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeatureCard } from './feature-card';

describe('FeatureCard', () => {
  const defaultProps = {
    icon: '📋',
    title: 'Smart Tasks',
    description: 'Organise your day with ease.',
  };

  it('renders the icon', () => {
    render(<FeatureCard {...defaultProps} />);
    expect(screen.getByText('📋')).toBeDefined();
  });

  it('renders the title with Caveat font', () => {
    render(<FeatureCard {...defaultProps} />);
    const title = screen.getByText('Smart Tasks');
    expect(title.className).toContain('font-caveat');
  });

  it('renders the description', () => {
    render(<FeatureCard {...defaultProps} />);
    expect(screen.getByText('Organise your day with ease.')).toBeDefined();
  });

  it('has data-testid="feature-card"', () => {
    render(<FeatureCard {...defaultProps} />);
    expect(screen.getByTestId('feature-card')).toBeDefined();
  });

  it('passes color prop to StickyNote (mint background)', () => {
    const { container } = render(<FeatureCard {...defaultProps} color="mint" />);
    const roughBorder = container.querySelector('[data-testid="rough-border"]');
    expect(roughBorder?.className).toContain('bg-notebook-highlight-mint');
  });
});
