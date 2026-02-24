/**
 * Unit Tests for Habits Loading Skeleton
 * 008-production-hardening (T030)
 * Tests skeleton rendering and pulse animation elements
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HabitsLoading from '@/app/habits/loading';

describe('HabitsLoading Component - T030', () => {
  it('should render without crashing', () => {
    const { container } = render(<HabitsLoading />);
    expect(container).toBeTruthy();
  });

  it('should contain skeleton elements with animate-pulse class', () => {
    const { container } = render(<HabitsLoading />);

    const pulseElements = container.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  it('should render multiple skeleton cards (at least 2)', () => {
    const { container } = render(<HabitsLoading />);

    // The component renders 3 skeleton cards in the grid + 2 header skeletons = 5 total
    const pulseElements = container.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThanOrEqual(2);
  });

  it('should render skeleton cards in a grid layout', () => {
    const { container } = render(<HabitsLoading />);

    const grid = container.querySelector('.grid');
    expect(grid).toBeTruthy();
    expect(grid?.children.length).toBe(3);
  });
});
