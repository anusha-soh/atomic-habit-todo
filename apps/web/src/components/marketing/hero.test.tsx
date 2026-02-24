/**
 * Hero Section — unit tests (US1)
 * Verify headline font class, background, and CTA links.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Hero } from './hero';

describe('Hero', () => {
  it('renders the section with cream background class', () => {
    render(<Hero />);
    const section = screen.getByTestId('hero-section');
    expect(section.className).toContain('bg-notebook-paper');
  });

  it('renders the handwritten headline with Caveat font class', () => {
    render(<Hero />);
    const h1 = screen.getByTestId('hero-headline');
    expect(h1.className).toContain('font-caveat');
  });

  it('renders a link to /register for the primary CTA', () => {
    render(<Hero />);
    const primaryCta = screen.getByTestId('hero-cta-primary');
    expect(primaryCta.getAttribute('href')).toBe('/register');
  });

  it('renders a link to /login for the secondary CTA', () => {
    render(<Hero />);
    const secondaryCta = screen.getByTestId('hero-cta-secondary');
    expect(secondaryCta.getAttribute('href')).toBe('/login');
  });

  it('renders the eyebrow text', () => {
    render(<Hero />);
    expect(screen.getByText(/Build better habits/i)).toBeDefined();
  });
});
