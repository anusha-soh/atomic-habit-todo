/**
 * Unit Tests for EmptyState Component
 * Phase 2 Chunk 2 - Polish (T161)
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '@/components/tasks/EmptyState';

describe('EmptyState Component', () => {
  it('should render default empty state', () => {
    render(<EmptyState hasFilters={false} />);
    // Component renders "Your task list is a blank page" as heading
    expect(screen.getByRole('heading')).toBeInTheDocument();
    expect(screen.getByText(/create task/i)).toBeInTheDocument();
  });

  it('should render filtered empty state', () => {
    render(<EmptyState hasFilters={true} />);
    // Both h3 and p contain "No tasks match your filters" — query by heading role
    expect(screen.getByRole('heading', { name: /no tasks match your filters/i })).toBeInTheDocument();
    expect(screen.getByText(/clear all filters/i)).toBeInTheDocument();
  });

  it('should call onClearFilters when button clicked', async () => {
    const mockClear = vi.fn();
    const { getByText } = render(<EmptyState hasFilters={true} onClearFilters={mockClear} />);
    
    getByText(/clear all filters/i).click();
    expect(mockClear).toHaveBeenCalled();
  });
});
