/**
 * Due Date Badge Component
 * Phase 2 Chunk 2 - User Story 5
 * Displays formatted due dates with visual indicators for overdue tasks
 */

import { formatDueDate, isOverdue } from '@/lib/date-utils';

interface DueDateBadgeProps {
  dueDate: string | null;
  status: string;
}

export function DueDateBadge({ dueDate, status }: DueDateBadgeProps) {
  if (!dueDate) {
    return null; // Don't show badge if no due date
  }

  const formatted = formatDueDate(dueDate, status);
  const isOverdueDate = isOverdue(dueDate, status);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border font-patrick-hand ${
      isOverdueDate
        ? 'bg-notebook-ink-red/10 text-notebook-ink-red border-notebook-ink-red/20'
        : 'bg-notebook-paper-alt text-notebook-ink-medium border-notebook-line'
    }`}>
      {isOverdueDate && (
        <svg
          className="w-3 h-3 mr-1 text-notebook-ink-red"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {formatted}
    </span>
  );
}