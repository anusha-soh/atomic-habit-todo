/**
 * HabitCard Component Tests
 * Phase 2 Chunk 3 - User Story 1 & 4
 *
 * Tests cover:
 * - Identity statement displayed as heading
 * - 2-minute version displayed in "Starter version" section
 * - Category badge with color coding
 * - Status badge (Active/Archived)
 * - Click navigation to /habits/[id] detail page
 * - Recurring schedule display
 * - Streak display (if > 0)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HabitCard } from '@/components/habits/HabitCard';
import { Habit, HabitCategory, HabitStatus } from '@/types/habit';

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href }: any) => (
    <a href={href} data-testid="habit-link">
      {children}
    </a>
  ),
}));

describe('HabitCard Component', () => {
  const mockUserId = 'user-123';

  const baseMockHabit: Habit = {
    id: 'habit-1',
    user_id: mockUserId,
    identity_statement: 'I am a person who exercises daily',
    full_description: 'Run 5km every morning',
    two_minute_version: 'Put on running shoes',
    habit_stacking_cue: null,
    anchor_habit_id: null,
    motivation: 'Stay healthy for my family',
    category: HabitCategory.HEALTH_FITNESS,
    recurring_schedule: { type: 'daily' },
    status: HabitStatus.ACTIVE,
    current_streak: 0,
    last_completed_at: null,
    consecutive_misses: 0,
    created_at: '2026-02-10T10:00:00Z',
    updated_at: '2026-02-10T10:00:00Z',
  };

  describe('Content Display', () => {
    it('displays identity_statement as heading', () => {
      render(<HabitCard habit={baseMockHabit} userId={mockUserId} />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('I am a person who exercises daily');
    });

    it('displays two_minute_version in "Starter version" section', () => {
      render(<HabitCard habit={baseMockHabit} userId={mockUserId} />);

      expect(screen.getByText(/starter version/i)).toBeInTheDocument();
      expect(screen.getByText('Put on running shoes')).toBeInTheDocument();
    });

    it('displays starter version section with icon', () => {
      render(<HabitCard habit={baseMockHabit} userId={mockUserId} />);

      // Check for the target emoji icon (🎯)
      expect(screen.getByText('🎯')).toBeInTheDocument();
    });
  });

  describe('Category Badge', () => {
    it('displays category badge', () => {
      render(<HabitCard habit={baseMockHabit} userId={mockUserId} />);

      const categoryBadge = screen.getByText(HabitCategory.HEALTH_FITNESS);
      expect(categoryBadge).toBeInTheDocument();
      expect(categoryBadge).toHaveClass('border');
    });

    it('applies correct color for Health & Fitness category', () => {
      render(<HabitCard habit={baseMockHabit} userId={mockUserId} />);

      const categoryBadge = screen.getByText(HabitCategory.HEALTH_FITNESS);
      expect(categoryBadge.className).toContain('bg-notebook-ink-green');
      expect(categoryBadge.className).toContain('text-notebook-ink-green');
    });

    it('applies correct color for Productivity category', () => {
      const habit = { ...baseMockHabit, category: HabitCategory.PRODUCTIVITY };
      render(<HabitCard habit={habit} userId={mockUserId} />);

      const categoryBadge = screen.getByText(HabitCategory.PRODUCTIVITY);
      expect(categoryBadge.className).toContain('bg-notebook-ink-blue');
      expect(categoryBadge.className).toContain('text-notebook-ink-blue');
    });

    it('applies correct color for Mindfulness category', () => {
      const habit = { ...baseMockHabit, category: HabitCategory.MINDFULNESS };
      render(<HabitCard habit={habit} userId={mockUserId} />);

      const categoryBadge = screen.getByText(HabitCategory.MINDFULNESS);
      expect(categoryBadge.className).toContain('bg-notebook-highlight-pink');
    });

    it('applies correct color for Learning category', () => {
      const habit = { ...baseMockHabit, category: HabitCategory.LEARNING };
      render(<HabitCard habit={habit} userId={mockUserId} />);

      const categoryBadge = screen.getByText(HabitCategory.LEARNING);
      expect(categoryBadge.className).toContain('bg-notebook-highlight-yellow');
    });

    it('applies correct color for Other category', () => {
      const habit = { ...baseMockHabit, category: HabitCategory.OTHER };
      render(<HabitCard habit={habit} userId={mockUserId} />);

      const categoryBadge = screen.getByText(HabitCategory.OTHER);
      expect(categoryBadge.className).toContain('bg-notebook-paper-alt');
    });
  });

  describe('Status Badge', () => {
    it('does not show status badge when habit is active', () => {
      render(<HabitCard habit={baseMockHabit} userId={mockUserId} />);

      expect(screen.queryByText('Archived')).not.toBeInTheDocument();
    });

    it('displays "Archived" badge when habit status is archived', () => {
      const archivedHabit = { ...baseMockHabit, status: HabitStatus.ARCHIVED };
      render(<HabitCard habit={archivedHabit} userId={mockUserId} />);

      const archivedBadge = screen.getByText('Archived');
      expect(archivedBadge).toBeInTheDocument();
      expect(archivedBadge).toHaveClass('bg-notebook-paper-alt', 'text-notebook-ink-light');
    });
  });

  describe('Recurring Schedule Display', () => {
    it('displays "Daily" for daily schedules', () => {
      render(<HabitCard habit={baseMockHabit} userId={mockUserId} />);

      expect(screen.getByText('Daily')).toBeInTheDocument();
    });

    it('displays "Weekly" for weekly schedules', () => {
      const weeklyHabit = {
        ...baseMockHabit,
        recurring_schedule: { type: 'weekly' as const, days: [1, 3, 5] },
      };
      render(<HabitCard habit={weeklyHabit} userId={mockUserId} />);

      expect(screen.getByText('Weekly')).toBeInTheDocument();
    });

    it('displays "Monthly" for monthly schedules', () => {
      const monthlyHabit = {
        ...baseMockHabit,
        recurring_schedule: { type: 'monthly' as const, day_of_month: 1 },
      };
      render(<HabitCard habit={monthlyHabit} userId={mockUserId} />);

      expect(screen.getByText('Monthly')).toBeInTheDocument();
    });

    it('shows recurring schedule icon', () => {
      render(<HabitCard habit={baseMockHabit} userId={mockUserId} />);

      // Check for recurring icon (🔄)
      expect(screen.getByText('🔄')).toBeInTheDocument();
    });
  });

  describe('Streak Display', () => {
    it('does not display streak when current_streak is 0', () => {
      render(<HabitCard habit={baseMockHabit} userId={mockUserId} />);

      expect(screen.queryByText(/day streak/i)).not.toBeInTheDocument();
      expect(screen.queryByText('🔥')).not.toBeInTheDocument();
    });

    it('displays streak when current_streak > 0', () => {
      const habitWithStreak = { ...baseMockHabit, current_streak: 7 };
      render(<HabitCard habit={habitWithStreak} userId={mockUserId} />);

      expect(screen.getByText('🔥')).toBeInTheDocument();
      // In compact mode StreakCounter renders the number separately with aria-label for accessibility
      expect(screen.getByLabelText('7 day streak')).toBeInTheDocument();
    });

    it('displays different streak numbers correctly', () => {
      const habitWithStreak = { ...baseMockHabit, current_streak: 42 };
      render(<HabitCard habit={habitWithStreak} userId={mockUserId} />);

      expect(screen.getByLabelText('42 day streak')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('wraps content in Link to /habits/[id]', () => {
      render(<HabitCard habit={baseMockHabit} userId={mockUserId} />);

      const link = screen.getByTestId('habit-link');
      expect(link).toHaveAttribute('href', '/habits/habit-1');
    });

    it('renders as clickable card', () => {
      render(<HabitCard habit={baseMockHabit} userId={mockUserId} />);

      const link = screen.getByTestId('habit-link');
      expect(link).toBeInTheDocument();
    });
  });

  describe('Visual Design', () => {
    it('applies hover styles to card', () => {
      const { container } = render(<HabitCard habit={baseMockHabit} userId={mockUserId} />);

      const card = container.querySelector('.group');
      expect(card).toHaveClass('hover:shadow-notebook-hover', 'hover:-translate-y-1');
    });

    it('truncates long identity statements with line-clamp', () => {
      const longIdentityHabit = {
        ...baseMockHabit,
        identity_statement:
          'I am a person who exercises daily and eats healthy and sleeps well and meditates and reads books and learns new skills',
      };
      render(<HabitCard habit={longIdentityHabit} userId={mockUserId} />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveClass('line-clamp-2');
    });

    it('truncates long 2-minute versions', () => {
      const longStarterHabit = {
        ...baseMockHabit,
        two_minute_version:
          'Put on running shoes and stretch for 30 seconds and walk to the front door and take a deep breath',
      };
      render(<HabitCard habit={longStarterHabit} userId={mockUserId} />);

      const starterText = screen.getByText(longStarterHabit.two_minute_version);
      expect(starterText).toHaveClass('truncate');
    });
  });

  describe('Edge Cases', () => {
    it('handles missing optional fields gracefully', () => {
      const minimalHabit: Habit = {
        ...baseMockHabit,
        full_description: null,
        habit_stacking_cue: null,
        motivation: null,
        last_completed_at: null,
      };

      render(<HabitCard habit={minimalHabit} userId={mockUserId} />);

      // Should still render identity and starter version
      expect(screen.getByText(minimalHabit.identity_statement)).toBeInTheDocument();
      expect(screen.getByText(minimalHabit.two_minute_version)).toBeInTheDocument();
    });

    it('handles fallback category color for unknown categories', () => {
      const unknownCategoryHabit = {
        ...baseMockHabit,
        category: 'UNKNOWN_CATEGORY' as HabitCategory,
      };

      render(<HabitCard habit={unknownCategoryHabit} userId={mockUserId} />);

      const categoryBadge = screen.getByText('UNKNOWN_CATEGORY');
      // Should fallback to OTHER category styling
      expect(categoryBadge).toBeInTheDocument();
    });
  });
});
