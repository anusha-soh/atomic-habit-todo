/**
 * Unit Tests for Register Page
 * Phase 2 Chunk 2 - Polish (T161)
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RegisterPage from '@/app/register/page';

// Mock RegisterForm
vi.mock('@/components/RegisterForm', () => ({
  RegisterForm: () => <div>Mock Register Form</div>,
}));

describe('RegisterPage', () => {
  it('should render register page title', () => {
    render(<RegisterPage />);
    expect(screen.getByText(/create your account/i)).toBeInTheDocument();
    expect(screen.getByText(/mock register form/i)).toBeInTheDocument();
  });
});
