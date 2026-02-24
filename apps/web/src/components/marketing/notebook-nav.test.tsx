/**
 * NotebookNav — unit tests (US3)
 * Verify initial render and scrolled state toggle.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { NotebookNav } from './notebook-nav';

describe('NotebookNav', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders with data-testid="notebook-nav"', () => {
    render(<NotebookNav />);
    expect(screen.getByTestId('notebook-nav')).toBeDefined();
  });

  it('has data-scrolled="false" on initial render', () => {
    render(<NotebookNav />);
    const nav = screen.getByTestId('notebook-nav');
    expect(nav.getAttribute('data-scrolled')).toBe('false');
  });

  it('contains a link to #features', () => {
    render(<NotebookNav />);
    // Both desktop and mobile nav render "Features" — use the first (desktop) occurrence
    const featuresLinks = screen.getAllByText('Features');
    expect(featuresLinks[0].getAttribute('href')).toBe('#features');
  });

  it('contains a Get Started link to /register', () => {
    render(<NotebookNav />);
    // Both desktop and mobile nav render "Get Started" — use the first (desktop) occurrence
    const getStartedLinks = screen.getAllByText('Get Started');
    expect(getStartedLinks[0].getAttribute('href')).toBe('/register');
  });

  it('updates data-scrolled to "true" when window scrolls past 20px', async () => {
    // Mock window.scrollY
    Object.defineProperty(window, 'scrollY', { value: 100, writable: true, configurable: true });
    render(<NotebookNav />);
    await act(async () => {
      window.dispatchEvent(new Event('scroll'));
    });
    const nav = screen.getByTestId('notebook-nav');
    expect(nav.getAttribute('data-scrolled')).toBe('true');
  });
});
