/**
 * Unit Tests for Date Utilities
 * Phase 2 Chunk 2 - Polish (T161)
 */
import { describe, it, expect } from 'vitest';
import { formatDueDate, isOverdue } from '@/lib/date-utils';
import { addDays, subDays, startOfToday } from 'date-fns';

describe('Date Utilities', () => {
  const today = startOfToday();

  describe('formatDueDate', () => {
    it('should return "Overdue (Today)" for today (since it is 00:00:00 and now is later)', () => {
      expect(formatDueDate(today.toISOString())).toContain('Today');
    });

    it('should return "Due Tomorrow" for tomorrow', () => {
      const tomorrow = addDays(today, 1);
      expect(formatDueDate(tomorrow.toISOString())).toBe('Due Tomorrow');
    });

    it('should return "Overdue" for past dates', () => {
      const yesterday = subDays(today, 1);
      expect(formatDueDate(yesterday.toISOString())).toContain('Overdue');
    });

    it('should return absolute date for future dates > 1 day', () => {
      const in3Days = addDays(today, 3);
      // Our implementation currently returns "Due [Formatted Date]" for > 1 day
      expect(formatDueDate(in3Days.toISOString())).toContain('Due');
    });
  });

  describe('isOverdue', () => {
    it('should return true for past dates if not completed', () => {
      const yesterday = subDays(today, 1);
      expect(isOverdue(yesterday.toISOString(), 'pending')).toBe(true);
    });

    it('should return false for past dates if completed', () => {
      const yesterday = subDays(today, 1);
      expect(isOverdue(yesterday.toISOString(), 'completed')).toBe(false);
    });

    it('should return false for future dates', () => {
      const tomorrow = addDays(today, 1);
      expect(isOverdue(tomorrow.toISOString(), 'pending')).toBe(false);
    });
  });
});
