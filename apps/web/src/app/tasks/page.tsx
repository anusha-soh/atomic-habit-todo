/**
 * Tasks Page (Server Component)
 * Phase 2 Chunk 2 - User Story 1
 *
 * Fetches tasks server-side with searchParams for filtering/pagination
 */
import Link from 'next/link';
import { cookies } from 'next/headers';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { EmptyState } from '@/components/tasks/EmptyState';
import { Pagination } from '@/components/tasks/Pagination';
import { getTasks } from '@/lib/tasks-api';
import { Task, TaskStatus, TaskPriority, TaskFilters as TaskFiltersType, TaskSortOption } from '@/types/task';

interface TasksPageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const params = await searchParams;

  // Get user ID from session cookie (simplified - in production use proper auth)
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session_token');

  // For development, use a test user ID if no session
  // In production, redirect to login if no session
  const userId = sessionCookie?.value || 'test-user-id';

  // Extract filter params
  const filters: TaskFiltersType = {
    status: params.status as TaskStatus | undefined,
    priority: params.priority as TaskPriority | undefined,
    tags: params.tags,
    search: params.search,
    sort: (params.sort || 'created_desc') as TaskSortOption,
    page: parseInt(params.page || '1'),
    limit: parseInt(params.limit || '50'),
  };

  const hasFilters = !!(filters.status || filters.priority || filters.tags || filters.search);

  let tasks: Task[] = [];
  let total = 0;
  let error: string | null = null;

  try {
    const result = await getTasks(userId, filters);
    tasks = result.tasks;
    total = result.total;
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load tasks';
  }

  const limit = filters.limit || 50;
  const page = filters.page || 1;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
        <Link
          href="/tasks/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          + New Task
        </Link>
      </div>

      {/* Filters */}
      <TaskFilters currentFilters={filters} />

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Task list */}
      {tasks.length === 0 && !error ? (
        <EmptyState hasFilters={hasFilters} />
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} userId={userId} />
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination total={total} limit={limit} currentPage={page} />
    </div>
  );
}
