/**
 * Unit Tests for Edit Task Page
 * Phase 2 Chunk 2 - Polish (T161)
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import EditTaskPage from '@/app/tasks/[id]/edit/page';
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

// Mock TaskForm
vi.mock('@/components/tasks/TaskForm', () => ({
  TaskForm: () => <div>Mock Task Form</div>,
}));

describe('EditTaskPage', () => {
  it('should render edit page', async () => {
    const mockTask = {
      id: '1',
      title: 'Task 1',
      status: 'pending',
      priority: 'high',
      tags: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed: false,
    };
    (getTask as any).mockResolvedValue(mockTask);

    const Page = await EditTaskPage({ params: Promise.resolve({ id: '1' }) });
    render(Page);
    
    expect(screen.getByText(/edit task/i)).toBeInTheDocument();
    expect(screen.getByText(/mock task form/i)).toBeInTheDocument();
  });
});
