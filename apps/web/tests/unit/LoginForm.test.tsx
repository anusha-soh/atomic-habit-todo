/**
 * Unit Tests for LoginForm Component
 * Phase 2 Chunk 2 - Polish (T161)
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/components/LoginForm';
import { authAPI } from '@/lib/api';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock auth API
vi.mock('@/lib/api', () => ({
  authAPI: {
    login: vi.fn(),
  },
  APIError: class extends Error {
    constructor(public message: string, public status: number) {
      super(message);
    }
  }
}));

describe('LoginForm Component', () => {
  it('should render email and password fields', () => {
    render(<LoginForm />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should call login API with correct credentials', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    expect(authAPI.login).toHaveBeenCalledWith('test@example.com', 'password123');
  });
});
