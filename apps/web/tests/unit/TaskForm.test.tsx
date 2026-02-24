/**
 * Unit Tests for TaskForm Component
 * Phase 2 Chunk 2 - User Story 1 (T022)
 * Tests form validation and submission
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskForm } from '@/components/tasks/TaskForm';
import * as tasksApi from '@/lib/tasks-api';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    push: vi.fn(),
    back: vi.fn(),
  }),
}));

// Mock toast context
vi.mock('@/lib/toast-context', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

// Mock API calls
vi.mock('@/lib/tasks-api', () => ({
  createTask: vi.fn(() => Promise.resolve({ id: 'task-1', title: 'Test' })),
  updateTask: vi.fn(() => Promise.resolve({ id: 'task-1', title: 'Test' })),
  getTags: vi.fn(() => Promise.resolve([])),
}));

describe('TaskForm Component - T022', () => {
  it('should render title input field', () => {
    render(<TaskForm userId="test-user" />);

    const titleInput = screen.getByLabelText(/title/i);
    expect(titleInput).toBeInTheDocument();
    expect(titleInput).toHaveAttribute('required');
  });

  it('should render description input field', () => {
    render(<TaskForm userId="test-user" />);

    const descriptionInput = screen.getByLabelText(/description/i);
    expect(descriptionInput).toBeInTheDocument();
    expect(descriptionInput).not.toHaveAttribute('required');
  });

  it('should validate title max length (500 chars)', async () => {
    const user = userEvent.setup();
    render(<TaskForm userId="test-user" />);

    const titleInput = screen.getByLabelText(/title/i);
    const longTitle = 'x'.repeat(501);

    // Use fireEvent to bypass maxLength restriction for testing validation
    const { fireEvent } = await import('@testing-library/react');
    fireEvent.change(titleInput, { target: { value: longTitle } });
    
    const submitButton = screen.getByRole('button', { name: /create task/i });
    await user.click(submitButton);

    expect(screen.getByText(/title must be 500 characters or less/i)).toBeInTheDocument();
    expect(tasksApi.createTask).not.toHaveBeenCalled();
  });

  it('should submit valid form data', async () => {
    const user = userEvent.setup();
    render(<TaskForm userId="test-user" />);

    const titleInput = screen.getByLabelText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i);

    await user.type(titleInput, 'Write project proposal');
    await user.type(descriptionInput, 'Complete the Q1 project proposal document');

    const submitButton = screen.getByRole('button', { name: /create task/i });
    await user.click(submitButton);

    expect(tasksApi.createTask).toHaveBeenCalledWith(
      'test-user',
      expect.objectContaining({
        title: 'Write project proposal',
        description: 'Complete the Q1 project proposal document',
      })
    );
  });

  it('should allow description to be optional', async () => {
    const user = userEvent.setup();
    render(<TaskForm userId="test-user" />);

    const titleInput = screen.getByLabelText(/title/i);
    await user.type(titleInput, 'Test task');

    const submitButton = screen.getByRole('button', { name: /create task/i });
    await user.click(submitButton);

    expect(tasksApi.createTask).toHaveBeenCalled();
  });
});
