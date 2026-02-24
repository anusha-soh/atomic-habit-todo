/**
 * Unit Tests for TaskCard Component
 * Phase 2 Chunk 2 - User Story 1 (T021)
 * Tests component rendering in isolation
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Task } from '@/types/task';
import { TaskCard } from '@/components/tasks/TaskCard';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    push: vi.fn(),
  }),
}));

// Mock toast context
vi.mock('@/lib/toast-context', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

describe('TaskCard Component - T021', () => {
  const mockTask: Task = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    user_id: '650e8400-e29b-41d4-a716-446655440000',
    title: 'Write project proposal',
    description: 'Complete the Q1 project proposal document',
    status: 'pending',
    priority: 'high',
    tags: ['work', 'urgent'],
    due_date: '2026-01-10T00:00:00Z',
    completed: false,
    is_habit_task: false,
    generated_by_habit_id: null,
    created_at: '2026-01-04T10:00:00Z',
    updated_at: '2026-01-04T10:00:00Z',
  };

  it('should render task title', () => {
    render(<TaskCard task={mockTask} userId="test-user" />);
    const title = screen.getByText('Write project proposal');
    expect(title).toBeInTheDocument();
  });

  it('should render task description', () => {
    render(<TaskCard task={mockTask} userId="test-user" />);
    const description = screen.getByText('Complete the Q1 project proposal document');
    expect(description).toBeInTheDocument();
  });

  it('should render tags', () => {
    render(<TaskCard task={mockTask} userId="test-user" />);
    expect(screen.getByText('work')).toBeInTheDocument();
    expect(screen.getByText('urgent')).toBeInTheDocument();
  });

  it('should not display description if null', () => {
    const taskWithoutDescription = { ...mockTask, description: null };
    render(<TaskCard task={taskWithoutDescription} userId="test-user" />);
    
    const description = screen.queryByText(/Complete the Q1/);
    expect(description).not.toBeInTheDocument();
  });

  it('should render status badge', () => {
    render(<TaskCard task={mockTask} userId="test-user" />);
    expect(screen.getByText('pending')).toBeInTheDocument();
  });
});
