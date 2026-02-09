/**
 * Unit Tests for New Task Page
 * Phase 2 Chunk 2 - Polish (T161)
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import NewTaskPage from '@/app/tasks/new/page';

// Mock cookies
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: vi.fn().mockReturnValue({ value: 'test-session' }),
  }),
}));

// Mock TaskForm
vi.mock('@/components/tasks/TaskForm', () => ({
  TaskForm: () => <div>Mock Task Form</div>,
}));

describe('NewTaskPage', () => {
  it('should render page title and form', async () => {
    const Page = await NewTaskPage();
    render(Page);
    expect(screen.getByText(/create new task/i)).toBeInTheDocument();
    expect(screen.getByText(/mock task form/i)).toBeInTheDocument();
  });
});
