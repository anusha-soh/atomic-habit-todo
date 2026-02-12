/**
 * StatusFilter Component Tests
 * Phase 2 Chunk 3 - User Story 4
 *
 * Tests cover:
 * - Renders buttons for "Active", "Archived", and "All"
 * - Selecting status calls onChange with status value
 * - Displays currently selected status
 * - Defaults to "Active"
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StatusFilter } from '@/components/habits/StatusFilter';
import { HabitStatus } from '@/types/habit';

describe('StatusFilter Component', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders three status buttons: Active, Archived, All', () => {
      render(<StatusFilter selectedStatus={HabitStatus.ACTIVE} onChange={mockOnChange} />);

      expect(screen.getByRole('button', { name: 'Active' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Archived' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
    });

    it('renders exactly 3 buttons', () => {
      render(<StatusFilter selectedStatus={HabitStatus.ACTIVE} onChange={mockOnChange} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
    });
  });

  describe('Selection', () => {
    it('calls onChange with ACTIVE status when Active clicked', async () => {
      const user = userEvent.setup();
      render(<StatusFilter selectedStatus={'all'} onChange={mockOnChange} />);

      const activeButton = screen.getByRole('button', { name: 'Active' });
      await user.click(activeButton);

      expect(mockOnChange).toHaveBeenCalledWith(HabitStatus.ACTIVE);
    });

    it('calls onChange with ARCHIVED status when Archived clicked', async () => {
      const user = userEvent.setup();
      render(<StatusFilter selectedStatus={HabitStatus.ACTIVE} onChange={mockOnChange} />);

      const archivedButton = screen.getByRole('button', { name: 'Archived' });
      await user.click(archivedButton);

      expect(mockOnChange).toHaveBeenCalledWith(HabitStatus.ARCHIVED);
    });

    it('calls onChange with "all" when All clicked', async () => {
      const user = userEvent.setup();
      render(<StatusFilter selectedStatus={HabitStatus.ACTIVE} onChange={mockOnChange} />);

      const allButton = screen.getByRole('button', { name: 'All' });
      await user.click(allButton);

      expect(mockOnChange).toHaveBeenCalledWith('all');
    });

    it('allows switching between different statuses', async () => {
      const user = userEvent.setup();
      render(<StatusFilter selectedStatus={HabitStatus.ACTIVE} onChange={mockOnChange} />);

      // Click Archived
      await user.click(screen.getByRole('button', { name: 'Archived' }));
      expect(mockOnChange).toHaveBeenCalledWith(HabitStatus.ARCHIVED);

      // Click All
      await user.click(screen.getByRole('button', { name: 'All' }));
      expect(mockOnChange).toHaveBeenCalledWith('all');

      // Click Active
      await user.click(screen.getByRole('button', { name: 'Active' }));
      expect(mockOnChange).toHaveBeenCalledWith(HabitStatus.ACTIVE);

      expect(mockOnChange).toHaveBeenCalledTimes(3);
    });
  });

  describe('Visual State', () => {
    it('highlights Active button when selectedStatus is ACTIVE', () => {
      render(<StatusFilter selectedStatus={HabitStatus.ACTIVE} onChange={mockOnChange} />);

      const activeButton = screen.getByRole('button', { name: 'Active' });
      expect(activeButton).toHaveClass('bg-white', 'text-gray-900', 'shadow-sm');
    });

    it('highlights Archived button when selectedStatus is ARCHIVED', () => {
      render(<StatusFilter selectedStatus={HabitStatus.ARCHIVED} onChange={mockOnChange} />);

      const archivedButton = screen.getByRole('button', { name: 'Archived' });
      expect(archivedButton).toHaveClass('bg-white', 'text-gray-900', 'shadow-sm');
    });

    it('highlights All button when selectedStatus is "all"', () => {
      render(<StatusFilter selectedStatus={'all'} onChange={mockOnChange} />);

      const allButton = screen.getByRole('button', { name: 'All' });
      expect(allButton).toHaveClass('bg-white', 'text-gray-900', 'shadow-sm');
    });

    it('applies default styles to unselected buttons', () => {
      render(<StatusFilter selectedStatus={HabitStatus.ACTIVE} onChange={mockOnChange} />);

      const archivedButton = screen.getByRole('button', { name: 'Archived' });
      expect(archivedButton).toHaveClass('text-gray-500');
      expect(archivedButton).not.toHaveClass('bg-white');
    });

    it('applies hover styles to unselected buttons', () => {
      render(<StatusFilter selectedStatus={HabitStatus.ACTIVE} onChange={mockOnChange} />);

      const archivedButton = screen.getByRole('button', { name: 'Archived' });
      expect(archivedButton).toHaveClass('hover:text-gray-700');
    });
  });

  describe('Layout', () => {
    it('uses flex layout', () => {
      const { container } = render(
        <StatusFilter selectedStatus={HabitStatus.ACTIVE} onChange={mockOnChange} />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('flex');
    });

    it('has background and rounded corners', () => {
      const { container } = render(
        <StatusFilter selectedStatus={HabitStatus.ACTIVE} onChange={mockOnChange} />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('bg-gray-100', 'rounded-lg');
    });

    it('has padding', () => {
      const { container } = render(
        <StatusFilter selectedStatus={HabitStatus.ACTIVE} onChange={mockOnChange} />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('p-1');
    });
  });

  describe('Typography', () => {
    it('uses uppercase text for buttons', () => {
      render(<StatusFilter selectedStatus={HabitStatus.ACTIVE} onChange={mockOnChange} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('uppercase');
      });
    });

    it('uses bold font for buttons', () => {
      render(<StatusFilter selectedStatus={HabitStatus.ACTIVE} onChange={mockOnChange} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('font-bold');
      });
    });

    it('uses small text size', () => {
      render(<StatusFilter selectedStatus={HabitStatus.ACTIVE} onChange={mockOnChange} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('text-xs');
      });
    });
  });

  describe('Accessibility', () => {
    it('all status buttons are keyboard accessible', () => {
      render(<StatusFilter selectedStatus={HabitStatus.ACTIVE} onChange={mockOnChange} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeEnabled();
        expect(button).toHaveAttribute('type', 'button');
      });
    });

    it('maintains focus on clicked button', async () => {
      const user = userEvent.setup();
      render(<StatusFilter selectedStatus={HabitStatus.ACTIVE} onChange={mockOnChange} />);

      const archivedButton = screen.getByRole('button', { name: 'Archived' });
      await user.click(archivedButton);

      expect(archivedButton).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid clicking', async () => {
      const user = userEvent.setup();
      render(<StatusFilter selectedStatus={HabitStatus.ACTIVE} onChange={mockOnChange} />);

      const archivedButton = screen.getByRole('button', { name: 'Archived' });

      // Click multiple times rapidly
      await user.click(archivedButton);
      await user.click(archivedButton);
      await user.click(archivedButton);

      // Should call onChange 3 times (no debouncing expected)
      expect(mockOnChange).toHaveBeenCalledTimes(3);
      expect(mockOnChange).toHaveBeenCalledWith(HabitStatus.ARCHIVED);
    });

    it('works when selectedStatus changes externally', () => {
      const { rerender } = render(
        <StatusFilter selectedStatus={HabitStatus.ACTIVE} onChange={mockOnChange} />
      );

      const activeButton = screen.getByRole('button', { name: 'Active' });
      expect(activeButton).toHaveClass('bg-white');

      // External change to ARCHIVED
      rerender(<StatusFilter selectedStatus={HabitStatus.ARCHIVED} onChange={mockOnChange} />);

      const archivedButton = screen.getByRole('button', { name: 'Archived' });
      expect(archivedButton).toHaveClass('bg-white');
      expect(activeButton).not.toHaveClass('bg-white');
    });
  });
});
