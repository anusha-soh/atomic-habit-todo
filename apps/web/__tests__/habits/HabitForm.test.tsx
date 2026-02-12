/**
 * HabitForm Component Tests
 * Phase 2 Chunk 3 - User Story 1 & 3
 *
 * Tests cover:
 * - Identity statement input rendering and validation
 * - 2-minute version input rendering and validation
 * - Category dropdown with all 8 categories
 * - Recurring schedule builder (daily/weekly/monthly)
 * - Form submission with correct data structure
 * - Successful submit redirects to /habits
 * - Anchor habit selector for stacking
 * - Stacking cue auto-generation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HabitForm } from '@/components/habits/HabitForm';
import * as habitsApi from '@/lib/habits-api';
import { HabitCategory } from '@/types/habit';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/habits/new',
}));

// Mock toast context
const mockShowToast = vi.fn();
vi.mock('@/lib/toast-context', () => ({
  useToast: () => ({
    showToast: mockShowToast,
  }),
}));

// Mock API functions
vi.mock('@/lib/habits-api', () => ({
  createHabit: vi.fn(),
  updateHabit: vi.fn(),
  getHabits: vi.fn(),
}));

describe('HabitForm Component', () => {
  const mockUserId = 'user-123';

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock for getHabits (empty list)
    vi.mocked(habitsApi.getHabits).mockResolvedValue({
      habits: [],
      total: 0,
      page: 1,
      limit: 100,
    });
  });

  describe('Identity Statement Input', () => {
    it('renders identity statement input with "I am a person who..." placeholder', () => {
      render(<HabitForm userId={mockUserId} />);

      const input = screen.getByLabelText(/identity statement/i);
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue('I am a person who '); // Pre-filled
    });

    it('shows validation error when identity statement is empty', async () => {
      const user = userEvent.setup();
      render(<HabitForm userId={mockUserId} />);

      const input = screen.getByLabelText(/identity statement/i);
      const submitButton = screen.getByRole('button', { name: /build habit/i });

      // Clear the pre-filled text
      await user.clear(input);
      await user.click(submitButton);

      // Check for validation error (browser validation or custom)
      await waitFor(() => {
        expect(input).toBeInvalid();
      });
    });

    it('accepts valid identity statement', async () => {
      const user = userEvent.setup();
      vi.mocked(habitsApi.createHabit).mockResolvedValue({
        id: 'habit-1',
        identity_statement: 'I am a person who exercises daily',
      } as any);

      render(<HabitForm userId={mockUserId} />);

      const input = screen.getByLabelText(/identity statement/i);
      await user.clear(input);
      await user.type(input, 'I am a person who exercises daily');

      expect(input).toHaveValue('I am a person who exercises daily');
    });
  });

  describe('2-Minute Version Input', () => {
    it('renders 2-minute version input with helper text', () => {
      render(<HabitForm userId={mockUserId} />);

      const input = screen.getByLabelText(/2-minute version/i);
      expect(input).toBeInTheDocument();

      // Check for helper text
      expect(screen.getByText(/make it easy/i)).toBeInTheDocument();
    });

    it('shows validation error when 2-minute version is empty', async () => {
      const user = userEvent.setup();
      render(<HabitForm userId={mockUserId} />);

      const input = screen.getByLabelText(/2-minute version/i);
      const submitButton = screen.getByRole('button', { name: /build habit/i });

      await user.click(submitButton);

      // Input should be invalid (required field)
      await waitFor(() => {
        expect(input).toBeInvalid();
      });
    });

    it('accepts valid 2-minute version', async () => {
      const user = userEvent.setup();
      render(<HabitForm userId={mockUserId} />);

      const input = screen.getByLabelText(/2-minute version/i);
      await user.type(input, 'Put on running shoes');

      expect(input).toHaveValue('Put on running shoes');
    });
  });

  describe('Category Dropdown', () => {
    it('renders category select with all 8 categories', () => {
      render(<HabitForm userId={mockUserId} />);

      const select = screen.getByLabelText(/category/i);
      expect(select).toBeInTheDocument();

      // Check options
      const options = screen.getAllByRole('option');
      const categoryLabels = options.map(opt => opt.textContent);

      expect(categoryLabels).toContain('Health & Fitness');
      expect(categoryLabels).toContain('Productivity');
      expect(categoryLabels).toContain('Mindfulness');
      expect(categoryLabels).toContain('Learning');
      expect(categoryLabels).toContain('Social');
      expect(categoryLabels).toContain('Finance');
      expect(categoryLabels).toContain('Creative');
      expect(categoryLabels).toContain('Other');
    });

    it('allows category selection', async () => {
      const user = userEvent.setup();
      render(<HabitForm userId={mockUserId} />);

      const select = screen.getByLabelText(/category/i);
      await user.selectOptions(select, HabitCategory.PRODUCTIVITY);

      expect(select).toHaveValue(HabitCategory.PRODUCTIVITY);
    });
  });

  describe('Recurring Schedule Builder', () => {
    it('renders schedule type radio buttons (daily/weekly/monthly)', () => {
      render(<HabitForm userId={mockUserId} />);

      expect(screen.getByRole('radio', { name: /daily/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /weekly/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /monthly/i })).toBeInTheDocument();
    });

    it('shows weekly days buttons when weekly is selected', async () => {
      const user = userEvent.setup();
      render(<HabitForm userId={mockUserId} />);

      const weeklyRadio = screen.getByRole('radio', { name: /weekly/i });
      await user.click(weeklyRadio);

      // Check for day buttons (0-6 for Sun-Sat)
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /mon/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /fri/i })).toBeInTheDocument();
      });
    });

    it('shows day of month input when monthly is selected', async () => {
      const user = userEvent.setup();
      render(<HabitForm userId={mockUserId} />);

      const monthlyRadio = screen.getByRole('radio', { name: /monthly/i });
      await user.click(monthlyRadio);

      await waitFor(() => {
        const dayInput = screen.getByLabelText(/day of month/i);
        expect(dayInput).toBeInTheDocument();
        expect(dayInput).toHaveAttribute('min', '1');
        expect(dayInput).toHaveAttribute('max', '31');
      });
    });
  });

  describe('Form Submission', () => {
    it('calls createHabit API with correct data structure', async () => {
      const user = userEvent.setup();
      vi.mocked(habitsApi.createHabit).mockResolvedValue({
        id: 'habit-1',
        identity_statement: 'I am a person who reads daily',
        two_minute_version: 'Read one page',
        category: HabitCategory.LEARNING,
        recurring_schedule: { type: 'daily' },
      } as any);

      render(<HabitForm userId={mockUserId} />);

      // Fill form
      const identityInput = screen.getByLabelText(/identity statement/i);
      await user.clear(identityInput);
      await user.type(identityInput, 'I am a person who reads daily');

      const twoMinInput = screen.getByLabelText(/2-minute version/i);
      await user.type(twoMinInput, 'Read one page');

      const categorySelect = screen.getByLabelText(/category/i);
      await user.selectOptions(categorySelect, HabitCategory.LEARNING);

      // Submit
      const submitButton = screen.getByRole('button', { name: /build habit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(habitsApi.createHabit).toHaveBeenCalledWith(
          mockUserId,
          expect.objectContaining({
            identity_statement: 'I am a person who reads daily',
            two_minute_version: 'Read one page',
            category: HabitCategory.LEARNING,
            recurring_schedule: expect.objectContaining({
              type: 'daily',
            }),
          })
        );
      });
    });

    it('redirects to /habits on successful submit', async () => {
      const user = userEvent.setup();
      vi.mocked(habitsApi.createHabit).mockResolvedValue({
        id: 'habit-1',
      } as any);

      render(<HabitForm userId={mockUserId} />);

      // Fill minimal required fields
      const twoMinInput = screen.getByLabelText(/2-minute version/i);
      await user.type(twoMinInput, 'Start small');

      const submitButton = screen.getByRole('button', { name: /build habit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/habits');
      });
    });

    it('shows error toast on API failure', async () => {
      const user = userEvent.setup();
      vi.mocked(habitsApi.createHabit).mockRejectedValue(new Error('API Error'));

      render(<HabitForm userId={mockUserId} />);

      const twoMinInput = screen.getByLabelText(/2-minute version/i);
      await user.type(twoMinInput, 'Start small');

      const submitButton = screen.getByRole('button', { name: /build habit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          'API Error',
          'error'
        );
      });
    });
  });

  describe('Anchor Habit Selector (Habit Stacking)', () => {
    it('fetches existing habits on mount for stacking options', async () => {
      render(<HabitForm userId={mockUserId} />);

      await waitFor(() => {
        expect(habitsApi.getHabits).toHaveBeenCalledWith(
          mockUserId,
          expect.objectContaining({ limit: 100 })
        );
      });
    });

    it('renders anchor habit select when existing habits available', async () => {
      vi.mocked(habitsApi.getHabits).mockResolvedValue({
        habits: [
          {
            id: 'habit-1',
            identity_statement: 'I am a person who drinks coffee',
          } as any,
        ],
        total: 1,
        page: 1,
        limit: 100,
      });

      render(<HabitForm userId={mockUserId} />);

      await waitFor(() => {
        const select = screen.getByLabelText(/habit stacking/i);
        expect(select).toBeInTheDocument();
      });
    });

    it('shows message when no existing habits available', async () => {
      vi.mocked(habitsApi.getHabits).mockResolvedValue({
        habits: [],
        total: 0,
        page: 1,
        limit: 100,
      });

      render(<HabitForm userId={mockUserId} />);

      await waitFor(() => {
        expect(screen.getByText(/create more habits to enable stacking/i)).toBeInTheDocument();
      });
    });

    it('auto-generates stacking cue preview when anchor selected', async () => {
      const user = userEvent.setup();
      vi.mocked(habitsApi.getHabits).mockResolvedValue({
        habits: [
          {
            id: 'habit-1',
            identity_statement: 'I am a person who drinks coffee',
          } as any,
        ],
        total: 1,
        page: 1,
        limit: 100,
      });

      render(<HabitForm userId={mockUserId} />);

      // Wait for habits to load and select to be enabled
      await waitFor(() => {
        const anchorSelect = screen.getByLabelText(/habit stacking/i);
        expect(anchorSelect).not.toBeDisabled();
      });

      // Set identity for current habit
      const identityInput = screen.getByLabelText(/identity statement/i);
      await user.clear(identityInput);
      await user.type(identityInput, 'I am a person who meditates');

      // Select anchor using fireEvent for more reliable state update
      const anchorSelect = screen.getByLabelText(/habit stacking/i) as HTMLSelectElement;
      fireEvent.change(anchorSelect, { target: { value: 'habit-1' } });

      // Check that stacking cue input appears and has auto-generated content
      await waitFor(() => {
        const cueInput = screen.getByLabelText(/stacking cue/i) as HTMLInputElement;
        expect(cueInput.value).toContain('After I drinks coffee');
      }, { timeout: 3000 });
    });

    it('allows manual editing of stacking cue', async () => {
      const user = userEvent.setup();
      vi.mocked(habitsApi.getHabits).mockResolvedValue({
        habits: [
          {
            id: 'habit-1',
            identity_statement: 'I am a person who drinks coffee',
          } as any,
        ],
        total: 1,
        page: 1,
        limit: 100,
      });

      render(<HabitForm userId={mockUserId} />);

      // Wait for habits to load and select to be enabled
      await waitFor(() => {
        const anchorSelect = screen.getByLabelText(/habit stacking/i);
        expect(anchorSelect).not.toBeDisabled();
      });

      // Select an anchor habit to reveal the stacking cue input
      const anchorSelect = screen.getByLabelText(/habit stacking/i);
      await user.selectOptions(anchorSelect, 'habit-1');

      // Now the stacking cue input should be visible
      await waitFor(() => {
        expect(screen.getByLabelText(/stacking cue/i)).toBeInTheDocument();
      });

      const cueInput = screen.getByLabelText(/stacking cue/i);
      await user.clear(cueInput);
      await user.type(cueInput, 'After I wake up, I will stretch');

      expect(cueInput).toHaveValue('After I wake up, I will stretch');
    });
  });

  describe('Loading and Error States', () => {
    it('disables submit button while submitting', async () => {
      const user = userEvent.setup();
      vi.mocked(habitsApi.createHabit).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      render(<HabitForm userId={mockUserId} />);

      const twoMinInput = screen.getByLabelText(/2-minute version/i);
      await user.type(twoMinInput, 'Start small');

      const submitButton = screen.getByRole('button', { name: /build habit/i });
      await user.click(submitButton);

      expect(submitButton).toBeDisabled();
    });
  });
});
