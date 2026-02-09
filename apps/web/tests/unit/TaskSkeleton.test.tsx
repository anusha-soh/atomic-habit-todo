/**
 * Unit Tests for TaskSkeleton Component
 * Phase 2 Chunk 2 - Polish (T161)
 */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { TaskSkeleton } from '@/components/tasks/TaskSkeleton';

describe('TaskSkeleton Component', () => {
  it('should render skeleton pulses', () => {
    const { container } = render(<TaskSkeleton />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });
});
