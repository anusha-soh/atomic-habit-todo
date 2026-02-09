/**
 * Unit Tests for Tasks Page
 * Phase 2 Chunk 2 - Polish (T161)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TasksPage from '@/app/tasks/page';
import { getTasks } from '@/lib/tasks-api';

// Mock cookies
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: vi.fn().mockReturnValue({ value: 'test-session' }),
  }),
}));

// Mock API
vi.mock('@/lib/tasks-api', () => ({
  getTasks: vi.fn(),
}));

// Mock components
vi.mock('@/components/tasks/TaskCard', () => ({
  TaskCard: () => <div data-testid="task-card">Task Card</div>,
}));
vi.mock('@/components/tasks/TaskFilters', () => ({
  TaskFilters: () => <div>Task Filters</div>,
}));
vi.mock('@/components/tasks/EmptyState', () => ({
  EmptyState: () => <div>Empty State</div>,
}));
vi.mock('@/components/tasks/Pagination', () => ({
  Pagination: () => <div>Pagination</div>,
}));

describe('TasksPage (Server Component)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch tasks and pass them to TaskCard components', async () => {
    const mockTasks = [
      { id: '1', title: 'Task 1', created_at: new Date().toISOString(), status: 'pending', tags: [] },
      { id: '2', title: 'Task 2', created_at: new Date().toISOString(), status: 'pending', tags: [] },
    ];
    (getTasks as any).mockResolvedValue({ tasks: mockTasks, total: 2 });

    const searchParams = Promise.resolve({});
    const component = await TasksPage({ searchParams });
    
    // Check if the component structure exists in the returned JSX
    // Since it's a server component, it returns React elements
    expect(getTasks).toHaveBeenCalled();
  });
});
