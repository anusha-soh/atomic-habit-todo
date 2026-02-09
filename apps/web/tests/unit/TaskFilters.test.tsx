/**
 * Unit Tests for TaskFilters Component
 * Phase 2 Chunk 2 - Polish (T161)
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskFilters } from '@/components/tasks/TaskFilters';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

describe('TaskFilters Component', () => {
  it('should render all filter options', () => {
    render(<TaskFilters />);
    
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/search/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tags/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sort by/i)).toBeInTheDocument();
  });

  it('should display initial filter values', () => {
    const initialFilters = {
      status: 'pending' as const,
      search: 'test query',
    };
    
    render(<TaskFilters currentFilters={initialFilters} />);
    
    expect(screen.getByLabelText(/status/i)).toHaveValue('pending');
    expect(screen.getByLabelText(/search/i)).toHaveValue('test query');
  });

  it('should show active filter chips', () => {
    const initialFilters = {
      status: 'pending' as const,
      priority: 'high' as const,
    };
    
    render(<TaskFilters currentFilters={initialFilters} />);
    
    expect(screen.getByText(/status: pending/i)).toBeInTheDocument();
    expect(screen.getByText(/priority: high/i)).toBeInTheDocument();
  });
});
