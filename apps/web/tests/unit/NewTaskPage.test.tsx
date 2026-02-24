/**
 * Unit Tests for New Task Page
 * Phase 2 Chunk 2 - Polish (T161)
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import NewTaskPage from '@/app/tasks/new/page';

// Mock next/navigation redirect to not throw
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

// Mock cookies — return auth_token for get('auth_token')
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: vi.fn().mockImplementation((name: string) => {
      if (name === 'auth_token') return { value: 'test-jwt-token' };
      return null;
    }),
  }),
}));

// Mock global fetch for /api/auth/me
vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ user: { id: 'test-user-id' } }),
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
