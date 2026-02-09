/**
 * Unit Tests for Tasks Loading Page
 * Phase 2 Chunk 2 - Polish (T161)
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TasksLoading from '@/app/tasks/loading';

// Mock TaskSkeleton
vi.mock('@/components/tasks/TaskSkeleton', () => ({
  TaskSkeleton: () => <div data-testid="skeleton">Skeleton</div>,
}));

describe('TasksLoading', () => {
  it('should render multiple skeletons', () => {
    render(<TasksLoading />);
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons.length).toBeGreaterThan(1);
  });
});
