/**
 * TaskCard Component
 * Phase 2 Chunk 2 - User Story 1 & 2
 *
 * Displays individual task card with title, description, status, and actions
 */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Task } from '@/types/task';
import { completeTask, deleteTask } from '@/lib/tasks-api';
import { formatDistanceToNow } from 'date-fns';
import { PriorityBadge } from './PriorityBadge';
import { DueDateBadge } from './DueDateBadge';
import { HabitTaskBadge } from './HabitTaskBadge';
import { useToast } from '@/lib/toast-context';
import { SketchyBorder } from '@/components/ui/sketchy-border';

interface TaskCardProps {
  task: Task;
  userId: string;
}

export function TaskCard({ task, userId }: TaskCardProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isCompleting, setIsCompleting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showCompletionFlash, setShowCompletionFlash] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const createdAt = mounted 
    ? formatDistanceToNow(new Date(task.created_at), { addSuffix: true })
    : '';

  const handleMarkComplete = async () => {
    setIsCompleting(true);

    try {
      await completeTask(userId, task.id);
      showToast('Task marked as completed', 'success');
      setShowCompletionFlash(true);
      setTimeout(() => setShowCompletionFlash(false), 500);
      router.refresh(); // Refresh server component data
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to complete task', 'error');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteTask(userId, task.id);
      showToast('Task deleted successfully', 'success');
      router.refresh(); // Refresh server component data
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to delete task', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const statusColors = {
    pending: 'bg-notebook-highlight-yellow text-notebook-ink-medium',
    in_progress: 'bg-notebook-ink-blue/10 text-notebook-ink-blue',
    completed: 'bg-notebook-highlight-mint text-notebook-ink-green',
  };

  return (
    <div className={`rounded-lg p-4 transition-all duration-200 ${
      task.completed ? 'bg-notebook-paper-alt shadow-notebook-sm opacity-75' : 'bg-notebook-highlight-yellow shadow-notebook-md hover:shadow-notebook-hover hover:-translate-y-1'
    } ${showCompletionFlash ? 'animate-highlight-flash' : ''}`}>
      <div className="flex flex-col space-y-3">
        {/* Header with title and actions */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {/* Title */}
            <h3 className={`font-caveat text-xl ${
              task.completed ? 'text-notebook-ink-light line-through' : 'text-notebook-ink'
            }`}>
              {task.title}
            </h3>

            {/* Priority badge, Due Date badge, and Habit badge */}
            <div className="flex flex-wrap gap-2 mt-1">
              {task.is_habit_task && <HabitTaskBadge />}
              {task.priority && <PriorityBadge priority={task.priority} />}
              {task.due_date && <DueDateBadge dueDate={task.due_date} status={task.status} />}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Link
              href={`/tasks/${task.id}/edit`}
              className="px-3 py-1 text-sm text-notebook-ink-medium border border-notebook-line rounded hover:bg-notebook-paper-alt focus:outline-none focus:ring-2 focus:ring-notebook-ink-blue font-patrick-hand"
            >
              Edit
            </Link>
            {!task.completed && (
              <button
                onClick={handleMarkComplete}
                disabled={isCompleting}
                className="px-3 py-1 text-sm bg-notebook-ink-green text-notebook-paper-white rounded hover:bg-notebook-ink-green/90 focus:outline-none focus:ring-2 focus:ring-notebook-ink-green font-patrick-hand disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCompleting ? 'Completing...' : 'Complete'}
              </button>
            )}
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-3 py-1 text-sm bg-notebook-ink-red text-notebook-paper-white rounded hover:bg-notebook-ink-red/90 focus:outline-none focus:ring-2 focus:ring-notebook-ink-red font-patrick-hand disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className={`line-clamp-2 ${
            task.completed ? 'text-notebook-ink-light font-inter text-sm' : 'text-notebook-ink-medium font-inter text-sm'
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
                className="px-2 py-0.5 text-xs bg-notebook-paper-white text-notebook-ink-medium font-inter rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Metadata footer */}
        <div className="flex items-center justify-between text-xs text-notebook-ink-light font-inter pt-2 border-t border-notebook-line/50">
          <span>Created {createdAt}</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
            {task.status.replace('_', ' ')}
          </span>
        </div>
      </div>
    </div>
  );
}
