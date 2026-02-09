/**
 * Unit Tests for Tasks API Client
 * Phase 2 Chunk 2 - Polish (T161)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTasks, createTask, updateTask, deleteTask, completeTask } from '@/lib/tasks-api';

describe('Tasks API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get tasks with filters', async () => {
    const mockTasks = { tasks: [], total: 0, page: 1, limit: 50 };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTasks,
    });

    const result = await getTasks('user-1', { status: 'pending' });
    expect(result).toEqual(mockTasks);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('status=pending'),
      expect.any(Object)
    );
  });

  it('should create a task', async () => {
    const mockTask = { id: 'task-1', title: 'New Task' };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTask,
    });

    const result = await createTask('user-1', { title: 'New Task' });
    expect(result).toEqual(mockTask);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/user-1/tasks'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('should complete a task', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    await completeTask('user-1', 'task-1');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/user-1/tasks/task-1/complete'),
      expect.objectContaining({ method: 'PATCH' })
    );
  });

  it('should delete a task', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 204,
    });

    await deleteTask('user-1', 'task-1');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/user-1/tasks/task-1'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});
