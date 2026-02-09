/**
 * Unit Tests for Task Detail Page
 * Phase 2 Chunk 2 - Polish (T161)
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TaskDetailPage from '@/app/tasks/[id]/page';
import { getTask } from '@/lib/tasks-api';

// Mock cookies
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: vi.fn().mockReturnValue({ value: 'test-session' }),
  }),
}));

// Mock API
vi.mock('@/lib/tasks-api', () => ({
  getTask: vi.fn(),
}));

// Mock TaskCard to avoid useRouter issues
vi.mock('@/components/tasks/TaskCard', () => ({
  TaskCard: ({ task }: { task: any }) => (
    <div data-testid="task-card">
      <h3>{task.title}</h3>
      <p>{task.description}</p>
    </div>
  ),
}));

describe('TaskDetailPage', () => {
  it('should render task details', async () => {
    const mockTask = {
      id: '1',
      title: 'Task 1',
      description: 'Desc 1',
      status: 'pending',
      priority: 'high',
      tags: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed: false,
    };
    vi.mocked(getTask).mockResolvedValue(mockTask);

    const Page = await TaskDetailPage({ params: Promise.resolve({ id: '1' }) });
    render(Page);
    
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Desc 1')).toBeInTheDocument();
  });
});
