/**
 * Unit Tests for RegisterForm Component
 * Phase 2 Chunk 2 - Polish (T161)
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterForm } from '@/components/RegisterForm';
import { authAPI } from '@/lib/api';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock user context (RegisterForm calls useUser internally)
vi.mock('@/contexts/user-context', () => ({
  useUser: () => ({ refetch: vi.fn(), user: null, isLoading: false, error: null }),
}));

// Mock auth API
vi.mock('@/lib/api', () => ({
  authAPI: {
    register: vi.fn(),
  },
  APIError: class extends Error {
    constructor(public message: string, public status: number) {
      super(message);
    }
  }
}));

describe('RegisterForm Component', () => {
  it('should render email and password input fields', () => {
    render(<RegisterForm />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('should validate password length', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);
    
    const passwordInput = screen.getByLabelText(/^password$/i);
    await user.type(passwordInput, 'short');
    await user.tab(); // Trigger blur
    
    expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
  });

  it('should call register API with correct data', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');

    await user.click(screen.getByRole('button', { name: /register/i }));

    expect(authAPI.register).toHaveBeenCalledWith('test@example.com', 'password123');
  });
});
