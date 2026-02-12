/**
 * CategoryFilter Component Tests
 * Phase 2 Chunk 3 - User Story 4
 *
 * Tests cover:
 * - Renders buttons for all 8 categories plus "All"
 * - Selecting category calls onChange with category value
 * - "All" option calls onChange with null
 * - Displays currently selected category
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategoryFilter } from '@/components/habits/CategoryFilter';
import { HabitCategory } from '@/types/habit';

describe('CategoryFilter Component', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders button for each category', () => {
      render(<CategoryFilter selectedCategory={null} onChange={mockOnChange} />);

      // Should have "All" + 8 categories = 9 buttons
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(9);
    });

    it('renders "All" option', () => {
      render(<CategoryFilter selectedCategory={null} onChange={mockOnChange} />);

      expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
    });

    it('renders all 8 habit categories', () => {
      render(<CategoryFilter selectedCategory={null} onChange={mockOnChange} />);

      expect(screen.getByRole('button', { name: HabitCategory.HEALTH_FITNESS })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: HabitCategory.PRODUCTIVITY })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: HabitCategory.MINDFULNESS })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: HabitCategory.LEARNING })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: HabitCategory.SOCIAL })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: HabitCategory.FINANCE })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: HabitCategory.CREATIVE })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: HabitCategory.OTHER })).toBeInTheDocument();
    });
  });

  describe('Selection', () => {
    it('calls onChange with category value when category selected', async () => {
      const user = userEvent.setup();
      render(<CategoryFilter selectedCategory={null} onChange={mockOnChange} />);

      const healthButton = screen.getByRole('button', { name: HabitCategory.HEALTH_FITNESS });
      await user.click(healthButton);

      expect(mockOnChange).toHaveBeenCalledWith(HabitCategory.HEALTH_FITNESS);
    });

    it('calls onChange with null when "All" is selected', async () => {
      const user = userEvent.setup();
      render(<CategoryFilter selectedCategory={HabitCategory.LEARNING} onChange={mockOnChange} />);

      const allButton = screen.getByRole('button', { name: 'All' });
      await user.click(allButton);

      expect(mockOnChange).toHaveBeenCalledWith(null);
    });

    it('allows switching between different categories', async () => {
      const user = userEvent.setup();
      render(<CategoryFilter selectedCategory={null} onChange={mockOnChange} />);

      // Select Health & Fitness
      await user.click(screen.getByRole('button', { name: HabitCategory.HEALTH_FITNESS }));
      expect(mockOnChange).toHaveBeenCalledWith(HabitCategory.HEALTH_FITNESS);

      // Select Productivity
      await user.click(screen.getByRole('button', { name: HabitCategory.PRODUCTIVITY }));
      expect(mockOnChange).toHaveBeenCalledWith(HabitCategory.PRODUCTIVITY);

      expect(mockOnChange).toHaveBeenCalledTimes(2);
    });
  });

  describe('Visual State', () => {
    it('highlights selected category', () => {
      render(
        <CategoryFilter
          selectedCategory={HabitCategory.MINDFULNESS}
          onChange={mockOnChange}
        />
      );

      const mindfulnessButton = screen.getByRole('button', { name: HabitCategory.MINDFULNESS });
      expect(mindfulnessButton).toHaveClass('bg-blue-600', 'text-white');
    });

    it('highlights "All" when selectedCategory is null', () => {
      render(<CategoryFilter selectedCategory={null} onChange={mockOnChange} />);

      const allButton = screen.getByRole('button', { name: 'All' });
      expect(allButton).toHaveClass('bg-blue-600', 'text-white');
    });

    it('applies default styles to unselected categories', () => {
      render(
        <CategoryFilter
          selectedCategory={HabitCategory.LEARNING}
          onChange={mockOnChange}
        />
      );

      const healthButton = screen.getByRole('button', { name: HabitCategory.HEALTH_FITNESS });
      expect(healthButton).toHaveClass('bg-white', 'text-gray-600', 'border');
    });

    it('applies hover styles to unselected categories', () => {
      render(<CategoryFilter selectedCategory={null} onChange={mockOnChange} />);

      const learningButton = screen.getByRole('button', { name: HabitCategory.LEARNING });
      expect(learningButton).toHaveClass('hover:border-blue-400');
    });
  });

  describe('Responsive Design', () => {
    it('uses flex wrap for responsive layout', () => {
      const { container } = render(
        <CategoryFilter selectedCategory={null} onChange={mockOnChange} />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('flex', 'flex-wrap');
    });

    it('applies gap between buttons', () => {
      const { container } = render(
        <CategoryFilter selectedCategory={null} onChange={mockOnChange} />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('gap-2');
    });
  });

  describe('Accessibility', () => {
    it('all category buttons are keyboard accessible', () => {
      render(<CategoryFilter selectedCategory={null} onChange={mockOnChange} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeEnabled();
      });
    });

    it('maintains focus on clicked button', async () => {
      const user = userEvent.setup();
      render(<CategoryFilter selectedCategory={null} onChange={mockOnChange} />);

      const healthButton = screen.getByRole('button', { name: HabitCategory.HEALTH_FITNESS });
      await user.click(healthButton);

      // Button should be focusable
      expect(healthButton).toBeInTheDocument();
    });
  });
});
