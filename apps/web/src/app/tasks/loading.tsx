/**
 * Tasks Loading Page
 * Phase 2 Chunk 2 - Polish (T146)
 *
 * Displays skeleton states while tasks are loading
 */
import { TaskSkeleton } from '@/components/tasks/TaskSkeleton';

export default function TasksLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
      </div>

      {/* Filters Skeleton */}
      <div className="h-24 bg-gray-100 rounded-lg mb-6 animate-pulse"></div>

      {/* Task List Skeleton */}
      <div className="space-y-4">
        <TaskSkeleton />
        <TaskSkeleton />
        <TaskSkeleton />
        <TaskSkeleton />
        <TaskSkeleton />
      </div>
    </div>
  );
}
