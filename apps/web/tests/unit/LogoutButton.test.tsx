/**
 * Unit Tests for LogoutButton Component
 * Phase 2 Chunk 2 - Polish (T161)
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LogoutButton } from '@/components/LogoutButton';
import { authAPI } from '@/lib/api';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock auth API
vi.mock('@/lib/api', () => ({
  authAPI: {
    logout: vi.fn(),
  },
}));

// Mock toast context
vi.mock('@/lib/toast-context', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

describe('LogoutButton Component', () => {
  it('should render logout button', () => {
    render(<LogoutButton />);
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
  });

  it('should call logout API when clicked', async () => {
    const user = userEvent.setup();
    render(<LogoutButton />);
    
    await user.click(screen.getByRole('button', { name: /sign out/i }));
    expect(authAPI.logout).toHaveBeenCalled();
  });
});
