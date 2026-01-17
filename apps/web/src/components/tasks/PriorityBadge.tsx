/**
 * Priority Badge Component
 * Phase 2 Chunk 2 - User Story 4
 * Displays color-coded priority indicators
 */

import { TaskPriority } from '@/types/task';

interface PriorityBadgeProps {
  priority: TaskPriority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  if (!priority) {
    return null; // Don't show badge if no priority set
  }

  const priorityStyles = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-blue-100 text-blue-800 border-blue-200',
  };

  const priorityLabels = {
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${priorityStyles[priority]}`}>
      {priorityLabels[priority]} Priority
    </span>
  );
}