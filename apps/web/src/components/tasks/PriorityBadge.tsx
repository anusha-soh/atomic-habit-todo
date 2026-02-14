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
    high: 'bg-notebook-ink-red/10 text-notebook-ink-red border-notebook-ink-red/20',
    medium: 'bg-notebook-highlight-yellow text-notebook-ink-medium border-notebook-line',
    low: 'bg-notebook-ink-blue/10 text-notebook-ink-blue border-notebook-ink-blue/20',
  };

  const priorityLabels = {
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border font-patrick-hand ${priorityStyles[priority]}`}>
      {priorityLabels[priority]} Priority
    </span>
  );
}