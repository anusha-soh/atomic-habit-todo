/**
 * TaskCard Component
 * Phase 2 Chunk 2 - User Story 1
 *
 * Displays individual task card with title, description, and created_at timestamp
 */
import { Task } from '@/types/task';
import { formatDistanceToNow } from 'date-fns';

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const createdAt = formatDistanceToNow(new Date(task.created_at), { addSuffix: true });

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
      <div className="flex flex-col space-y-2">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900">
          {task.title}
        </h3>

        {/* Description */}
        {task.description && (
          <p className="text-gray-600 text-sm line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
          <span>Created {createdAt}</span>
          <span className="capitalize">{task.status}</span>
        </div>
      </div>
    </div>
  );
}
