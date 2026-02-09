/**
 * Unit Tests for Pagination Component
 * Phase 2 Chunk 2 - Polish (T161)
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Pagination } from '@/components/tasks/Pagination';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));

describe('Pagination Component', () => {
  it('should render nothing if total tasks <= limit', () => {
    const { container } = render(<Pagination total={10} limit={50} currentPage={1} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should render pagination info correctly', () => {
    render(<Pagination total={100} limit={10} currentPage={1} />);
    expect(screen.getByText(/showing/i)).toBeInTheDocument();
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('10').length).toBeGreaterThan(0);
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('should render page numbers', () => {
    render(<Pagination total={50} limit={10} currentPage={1} />);
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should highlight current page', () => {
    render(<Pagination total={50} limit={10} currentPage={3} />);
    const activePage = screen.getByText('3');
    expect(activePage).toHaveClass('bg-blue-50');
  });
});
