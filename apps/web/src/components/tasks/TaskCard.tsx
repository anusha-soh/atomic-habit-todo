/**
 * TaskCard Component
 * Phase 2 Chunk 2 - User Story 1 & 2
 *
 * Displays individual task card with title, description, status, and actions
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Task } from '@/types/task';
import { completeTask, deleteTask } from '@/lib/tasks-api';
import { formatDistanceToNow } from 'date-fns';
import { PriorityBadge } from './PriorityBadge';
import { DueDateBadge } from './DueDateBadge';

interface TaskCardProps {
  task: Task;
  userId: string;
}

export function TaskCard({ task, userId }: TaskCardProps) {
  const router = useRouter();
  const [isCompleting, setIsCompleting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createdAt = formatDistanceToNow(new Date(task.created_at), { addSuffix: true });

  const handleMarkComplete = async () => {
    setIsCompleting(true);
    setError(null);

    try {
      await completeTask(userId, task.id);
      router.refresh(); // Refresh server component data
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to complete task');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await deleteTask(userId, task.id);
      router.refresh(); // Refresh server component data
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
  };

  return (
    <div className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
      task.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
    }`}>
      <div className="flex flex-col space-y-3">
        {/* Header with title and actions */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {/* Title */}
            <h3 className={`text-lg font-semibold ${
              task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
            }`}>
              {task.title}
            </h3>

            {/* Priority badge and Due Date badge */}
            <div className="flex flex-wrap gap-2 mt-1">
              {task.priority && <PriorityBadge priority={task.priority} />}
              {task.due_date && <DueDateBadge dueDate={task.due_date} status={task.status} />}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Link
              href={`/tasks/${task.id}/edit`}
              className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Edit
            </Link>
            {!task.completed && (
              <button
                onClick={handleMarkComplete}
                disabled={isCompleting}
                className="px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCompleting ? 'Completing...' : 'Complete'}
              </button>
            )}
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className={`text-sm line-clamp-2 ${
            task.completed ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {task.description}
          </p>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Error message */}
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {/* Metadata footer */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
          <span>Created {createdAt}</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
            {task.status.replace('_', ' ')}
          </span>
        </div>
      </div>
    </div>
  );
}
