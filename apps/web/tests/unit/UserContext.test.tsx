/**
 * Unit Tests for UserProvider and useUser hook
 * 008-production-hardening (T015)
 * Tests context shape, API call on mount, and error when used outside provider
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { UserProvider, useUser } from '@/contexts/user-context';

// Mock the auth API
const mockMe = vi.fn(() =>
  Promise.resolve({ user: { id: '1', email: 'test@example.com', created_at: '2026-01-01' } })
);

vi.mock('@/lib/api', () => ({
  authAPI: {
    me: (...args: any[]) => mockMe(...args),
  },
}));

// Test consumer component
function TestConsumer() {
  const { user, isLoading, error } = useUser();
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  return <div>User: {user?.email}</div>;
}

describe('UserContext - T015', () => {
  beforeEach(() => {
    mockMe.mockClear();
    mockMe.mockImplementation(() =>
      Promise.resolve({ user: { id: '1', email: 'test@example.com', created_at: '2026-01-01' } })
    );
  });

  it('should return user, isLoading, error, and refetch from useUser', async () => {
    let contextValue: any;

    function Inspector() {
      contextValue = useUser();
      return null;
    }

    render(
      <UserProvider>
        <Inspector />
      </UserProvider>
    );

    await waitFor(() => {
      expect(contextValue).toBeDefined();
      expect(contextValue).toHaveProperty('user');
      expect(contextValue).toHaveProperty('isLoading');
      expect(contextValue).toHaveProperty('error');
      expect(contextValue).toHaveProperty('refetch');
      expect(typeof contextValue.refetch).toBe('function');
    });
  });

  it('should call authAPI.me() on mount and display user email', async () => {
    render(
      <UserProvider>
        <TestConsumer />
      </UserProvider>
    );

    // Initially shows loading
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // After fetch resolves, shows user email
    await waitFor(() => {
      expect(screen.getByText('User: test@example.com')).toBeInTheDocument();
    });

    expect(mockMe).toHaveBeenCalledTimes(1);
  });

  it('should display error when authAPI.me() fails', async () => {
    mockMe.mockImplementation(() => Promise.reject(new Error('Network failure')));

    render(
      <UserProvider>
        <TestConsumer />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Error: Authentication failed')).toBeInTheDocument();
    });
  });

  it('should throw error when useUser() is used outside UserProvider', () => {
    // Suppress React error boundary console output
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestConsumer />);
    }).toThrow('useUser must be used within UserProvider');

    consoleSpy.mockRestore();
  });
});
