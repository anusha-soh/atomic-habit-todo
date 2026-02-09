/**
 * Unit Tests for Dashboard Page
 * Phase 2 Chunk 2 - Polish (T161)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import DashboardPage from '@/app/dashboard/page';
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
    me: vi.fn(),
  },
  APIError: class extends Error {
    constructor(public message: string, public status: number) {
      super(message);
    }
  }
}));

// Mock LogoutButton
vi.mock('@/components/LogoutButton', () => ({
  LogoutButton: () => <button>Logout</button>,
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    (authAPI.me as any).mockReturnValue(new Promise(() => {}));
    render(<DashboardPage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should render user data after successful fetch', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      created_at: '2026-01-01T00:00:00Z',
    };
    (authAPI.me as any).mockResolvedValue({ user: mockUser });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getAllByText('test@example.com').length).toBeGreaterThan(0);
    });
    expect(screen.getByText(/successfully authenticated/i)).toBeInTheDocument();
  });
});
