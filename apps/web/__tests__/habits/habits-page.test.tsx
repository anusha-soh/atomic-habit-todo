/**
 * Habits List Page Tests
 * Phase 2 Chunk 3 - User Story 4
 *
 * Tests cover:
 * - Fetches habits on mount
 * - Displays HabitCard for each habit
 * - CategoryFilter change triggers refetch with category param
 * - StatusFilter change triggers refetch with status param
 * - Empty state shows "No habits yet. Create your first habit!"
 * - Loading state shows skeletons
 * - Navigation to create/edit pages
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HabitsPage from '@/app/habits/page';
import * as habitsApi from '@/lib/habits-api';
import * as apiLib from '@/lib/api';
import { Habit, HabitCategory, HabitStatus } from '@/types/habit';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
  }),
  usePathname: () => '/habits',
}));

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href }: any) => (
    <a href={href} data-testid={`link-${href}`}>
      {children}
    </a>
  ),
}));

// Mock API functions
vi.mock('@/lib/habits-api', () => ({
  getHabits: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
  authAPI: {
    me: vi.fn(),
  },
  APIError: class APIError extends Error {
    constructor(message: string, public status: number) {
      super(message);
    }
  },
}));

// Mock HabitCard component
vi.mock('@/components/habits/HabitCard', () => ({
  HabitCard: ({ habit }: { habit: Habit }) => (
    <div data-testid={`habit-card-${habit.id}`}>
      <h3>{habit.identity_statement}</h3>
      <p>{habit.two_minute_version}</p>
    </div>
  ),
}));

// Mock Filter components
vi.mock('@/components/habits/CategoryFilter', () => ({
  CategoryFilter: ({ selectedCategory, onChange }: any) => (
    <select
      aria-label="Category filter"
      value={selectedCategory || 'all'}
      onChange={(e) => onChange(e.target.value === 'all' ? null : e.target.value)}
      data-testid="category-filter"
    >
      <option value="all">All</option>
      {Object.values(HabitCategory).map(cat => (
        <option key={cat} value={cat}>{cat}</option>
      ))}
    </select>
  ),
}));

vi.mock('@/components/habits/StatusFilter', () => ({
  StatusFilter: ({ selectedStatus, onChange }: any) => (
    <select
      aria-label="Status filter"
      value={selectedStatus}
      onChange={(e) => onChange(e.target.value)}
      data-testid="status-filter"
    >
      <option value={HabitStatus.ACTIVE}>Active</option>
      <option value={HabitStatus.ARCHIVED}>Archived</option>
      <option value="all">All</option>
    </select>
  ),
}));

describe('Habits List Page', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };

  const mockHabits: Habit[] = [
    {
      id: 'habit-1',
      user_id: mockUser.id,
      identity_statement: 'I am a person who exercises daily',
      full_description: 'Run 5km',
      two_minute_version: 'Put on running shoes',
      habit_stacking_cue: null,
      anchor_habit_id: null,
      motivation: null,
      category: HabitCategory.HEALTH_FITNESS,
      recurring_schedule: { type: 'daily' },
      status: HabitStatus.ACTIVE,
      current_streak: 5,
      last_completed_at: null,
      consecutive_misses: 0,
      created_at: '2026-02-10T10:00:00Z',
      updated_at: '2026-02-10T10:00:00Z',
    },
    {
      id: 'habit-2',
      user_id: mockUser.id,
      identity_statement: 'I am a person who reads daily',
      full_description: 'Read 30 pages',
      two_minute_version: 'Read one page',
      habit_stacking_cue: null,
      anchor_habit_id: null,
      motivation: null,
      category: HabitCategory.LEARNING,
      recurring_schedule: { type: 'daily' },
      status: HabitStatus.ACTIVE,
      current_streak: 0,
      last_completed_at: null,
      consecutive_misses: 0,
      created_at: '2026-02-10T10:00:00Z',
      updated_at: '2026-02-10T10:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mocks
    vi.mocked(apiLib.authAPI.me).mockResolvedValue({ user: mockUser });
    vi.mocked(habitsApi.getHabits).mockResolvedValue({
      habits: mockHabits,
      total: mockHabits.length,
      page: 1,
      limit: 100,
    });
  });

  describe('Authentication', () => {
    it('fetches user on mount', async () => {
      render(<HabitsPage />);

      await waitFor(() => {
        expect(apiLib.authAPI.me).toHaveBeenCalled();
      });
    });

    it('redirects to /login if user is unauthenticated', async () => {
      vi.mocked(apiLib.authAPI.me).mockRejectedValue(new apiLib.APIError('Unauthorized', 401));

      render(<HabitsPage />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });
  });

  describe('Data Fetching', () => {
    it('fetches habits on mount after user loads', async () => {
      render(<HabitsPage />);

      await waitFor(() => {
        expect(habitsApi.getHabits).toHaveBeenCalledWith(
          mockUser.id,
          expect.objectContaining({
            limit: 100,
          })
        );
      });
    });

    it('fetches active habits by default', async () => {
      render(<HabitsPage />);

      await waitFor(() => {
        expect(habitsApi.getHabits).toHaveBeenCalledWith(
          mockUser.id,
          expect.objectContaining({
            status: HabitStatus.ACTIVE,
          })
        );
      });
    });
  });

  describe('Habit Display', () => {
    it('displays HabitCard for each habit', async () => {
      render(<HabitsPage />);

      await waitFor(() => {
        expect(screen.getByTestId('habit-card-habit-1')).toBeInTheDocument();
        expect(screen.getByTestId('habit-card-habit-2')).toBeInTheDocument();
      });
    });

    it('displays habit identity statements', async () => {
      render(<HabitsPage />);

      await waitFor(() => {
        expect(screen.getByText('I am a person who exercises daily')).toBeInTheDocument();
        expect(screen.getByText('I am a person who reads daily')).toBeInTheDocument();
      });
    });

    it('renders habits in grid layout', async () => {
      const { container } = render(<HabitsPage />);

      await waitFor(() => {
        const grid = container.querySelector('.grid');
        expect(grid).toBeInTheDocument();
      });
    });
  });

  describe('Filter Interactions', () => {
    it('renders CategoryFilter component', async () => {
      render(<HabitsPage />);

      await waitFor(() => {
        expect(screen.getByTestId('category-filter')).toBeInTheDocument();
      });
    });

    it('renders StatusFilter component', async () => {
      render(<HabitsPage />);

      await waitFor(() => {
        expect(screen.getByTestId('status-filter')).toBeInTheDocument();
      });
    });

    it('refetches habits when category filter changes', async () => {
      const user = userEvent.setup();
      render(<HabitsPage />);

      // Wait for initial load
      await waitFor(() => {
        expect(habitsApi.getHabits).toHaveBeenCalled();
      });

      vi.clearAllMocks();

      // Change category filter
      const categoryFilter = screen.getByTestId('category-filter');
      await user.selectOptions(categoryFilter, HabitCategory.LEARNING);

      await waitFor(() => {
        expect(habitsApi.getHabits).toHaveBeenCalledWith(
          mockUser.id,
          expect.objectContaining({
            category: HabitCategory.LEARNING,
          })
        );
      });
    });

    it('refetches habits when status filter changes', async () => {
      const user = userEvent.setup();
      render(<HabitsPage />);

      // Wait for initial load
      await waitFor(() => {
        expect(habitsApi.getHabits).toHaveBeenCalled();
      });

      vi.clearAllMocks();

      // Change status filter
      const statusFilter = screen.getByTestId('status-filter');
      await user.selectOptions(statusFilter, HabitStatus.ARCHIVED);

      await waitFor(() => {
        expect(habitsApi.getHabits).toHaveBeenCalledWith(
          mockUser.id,
          expect.objectContaining({
            status: HabitStatus.ARCHIVED,
            include_archived: true,
          })
        );
      });
    });

    it('includes archived habits when status is "all"', async () => {
      const user = userEvent.setup();
      render(<HabitsPage />);

      await waitFor(() => {
        expect(habitsApi.getHabits).toHaveBeenCalled();
      });

      vi.clearAllMocks();

      const statusFilter = screen.getByTestId('status-filter');
      await user.selectOptions(statusFilter, 'all');

      await waitFor(() => {
        expect(habitsApi.getHabits).toHaveBeenCalledWith(
          mockUser.id,
          expect.objectContaining({
            include_archived: true,
          })
        );
      });
    });
  });

  describe('Empty State', () => {
    it('displays "No habits found" message when habits array is empty', async () => {
      vi.mocked(habitsApi.getHabits).mockResolvedValue({
        habits: [],
        total: 0,
        page: 1,
        limit: 100,
      });

      render(<HabitsPage />);

      await waitFor(() => {
        expect(screen.getByText(/no habits found/i)).toBeInTheDocument();
      });
    });

    it('shows "You haven\'t started building any habits yet" call to action in empty state', async () => {
      vi.mocked(habitsApi.getHabits).mockResolvedValue({
        habits: [],
        total: 0,
        page: 1,
        limit: 100,
      });

      render(<HabitsPage />);

      await waitFor(() => {
        expect(screen.getByText(/you haven't started building any habits yet/i)).toBeInTheDocument();
      });
    });

    it('provides button to create new habit in empty state', async () => {
      vi.mocked(habitsApi.getHabits).mockResolvedValue({
        habits: [],
        total: 0,
        page: 1,
        limit: 100,
      });

      render(<HabitsPage />);

      await waitFor(() => {
        const newHabitLinks = screen.getAllByTestId('link-/habits/new');
        expect(newHabitLinks.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Loading State', () => {
    it('shows loading skeleton while fetching initial habits', () => {
      vi.mocked(habitsApi.getHabits).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );

      const { container } = render(<HabitsPage />);

      // Should show loading spinner first (auth check)
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('shows skeleton cards while fetching habits', async () => {
      let resolveGetHabits: any;
      const getHabitsPromise = new Promise(resolve => {
        resolveGetHabits = resolve;
      });

      vi.mocked(habitsApi.getHabits).mockImplementation(() => getHabitsPromise as any);

      render(<HabitsPage />);

      // Wait for auth to complete
      await waitFor(() => {
        expect(apiLib.authAPI.me).toHaveBeenCalled();
      });

      // Check for skeleton cards (should be 3 pulse animations)
      await waitFor(() => {
        const skeletons = document.querySelectorAll('.animate-pulse');
        expect(skeletons.length).toBeGreaterThan(0);
      });

      // Cleanup: resolve the promise
      resolveGetHabits({
        habits: mockHabits,
        total: mockHabits.length,
        page: 1,
        limit: 100,
      });
    });

    it('hides loading skeleton after habits load', async () => {
      render(<HabitsPage />);

      await waitFor(() => {
        expect(screen.getByTestId('habit-card-habit-1')).toBeInTheDocument();
      });

      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons).toHaveLength(0);
    });
  });

  describe('Navigation', () => {
    it('provides link to create new habit', async () => {
      render(<HabitsPage />);

      await waitFor(() => {
        const newHabitLinks = screen.getAllByTestId('link-/habits/new');
        expect(newHabitLinks.length).toBeGreaterThan(0);
        expect(newHabitLinks[0]).toHaveTextContent(/new habit/i);
      });
    });

    it('displays page title', async () => {
      render(<HabitsPage />);

      await waitFor(() => {
        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading).toHaveTextContent(/your habits/i);
      });
    });
  });

  describe('Error Handling', () => {
    it('handles API error gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(habitsApi.getHabits).mockRejectedValue(new Error('API Error'));

      render(<HabitsPage />);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Failed to fetch habits:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Responsive Layout', () => {
    it('uses responsive grid columns', async () => {
      const { container } = render(<HabitsPage />);

      await waitFor(() => {
        const grid = container.querySelector('.grid');
        expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3');
      });
    });
  });
});
