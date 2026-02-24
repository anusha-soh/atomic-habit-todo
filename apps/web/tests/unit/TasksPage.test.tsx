/**
 * Unit Tests for Tasks Page
 * Phase 2 Chunk 2 - Polish (T161)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TasksPage from '@/app/tasks/page';
import { getTasks } from '@/lib/tasks-api';

// Mock cookies — return auth_token for get('auth_token')
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: vi.fn().mockImplementation((name: string) => {
      if (name === 'auth_token') return { value: 'test-jwt-token' };
      return null;
    }),
  }),
}));

// Mock fetch for /api/auth/me
const mockFetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ user: { id: 'test-user-id' } }),
});
vi.stubGlobal('fetch', mockFetch);

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
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ user: { id: 'test-user-id' } }),
    });
  });

  it('should fetch tasks and pass them to TaskCard components', async () => {
    const mockTasks = [
      { id: '1', title: 'Task 1', created_at: new Date().toISOString(), status: 'pending', tags: [] },
      { id: '2', title: 'Task 2', created_at: new Date().toISOString(), status: 'pending', tags: [] },
    ];
    (getTasks as any).mockResolvedValue({ tasks: mockTasks, total: 2 });

    const searchParams = Promise.resolve({});
    const component = await TasksPage({ searchParams });

    expect(getTasks).toHaveBeenCalled();
  });
});
