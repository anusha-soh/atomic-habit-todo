/**
 * Date Utility Functions
 * Phase 2 Chunk 2 - User Story 5
 * Utilities for formatting due dates in human-readable formats
 */

import { format, isToday, isTomorrow, isPast } from 'date-fns';

/**
 * Format due date in human-readable format
 * @param dueDate - Due date string or null
 * @param status - Current task status
 * @returns Formatted date string
 */
export function formatDueDate(dueDate: string | null, status: string): string {
  if (!dueDate) return 'No due date';

  const date = new Date(dueDate);
  const overdue = isPast(date) && status !== 'completed';

  if (isToday(date)) {
    return overdue ? 'Overdue (Today)' : 'Due Today';
  }
  if (isTomorrow(date)) {
    return 'Due Tomorrow';
  }
  if (overdue) {
    return `Overdue (${format(date, 'MMM d, yyyy')})`;
  }

  // Future dates
  return `Due ${format(date, 'MMM d, yyyy')}`;
}

/**
 * Check if a due date is overdue
 * @param dueDate - Due date string or null
 * @param status - Current task status
 * @returns True if overdue, false otherwise
 */
export function isOverdue(dueDate: string | null, status: string): boolean {
  if (!dueDate) return false;

  const date = new Date(dueDate);
  return isPast(date) && status !== 'completed';
}

/**
 * Get relative time string for due date
 * @param dueDate - Due date string or null
 * @returns Relative time string
 */
export function getRelativeDueDateString(dueDate: string | null): string {
  if (!dueDate) return '';

  const date = new Date(dueDate);
  const now = new Date();
  const diffDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'today';
  } else if (diffDays === 1) {
    return 'tomorrow';
  } else if (diffDays === -1) {
    return 'yesterday';
  } else if (diffDays > 0) {
    return `in ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  } else {
    return `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} ago`;
  }
}