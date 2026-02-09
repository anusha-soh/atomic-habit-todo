/**
 * Unit Tests for Login Page
 * Phase 2 Chunk 2 - Polish (T161)
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoginPage from '@/app/login/page';

// Mock LoginForm
vi.mock('@/components/LoginForm', () => ({
  LoginForm: () => <div>Mock Login Form</div>,
}));

describe('LoginPage', () => {
  it('should render login page title', () => {
    render(<LoginPage />);
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    expect(screen.getByText(/mock login form/i)).toBeInTheDocument();
  });
});
