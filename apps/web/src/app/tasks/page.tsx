/**
 * Tasks Page (Server Component)
 * Phase 2 Chunk 2 - User Story 1
 *
 * Fetches tasks server-side with searchParams for filtering/pagination
 */
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { API_BASE } from '@/lib/api';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { SearchInput } from '@/components/tasks/SearchInput';
import { EmptyState } from '@/components/tasks/EmptyState';
import { Pagination } from '@/components/tasks/Pagination';
import { getTasks } from '@/lib/tasks-api';
import { Task, TaskStatus, TaskPriority, TaskFilters as TaskFiltersType, TaskSortOption } from '@/types/task';

interface TasksPageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const params = await searchParams;

  // Get user UUID via /api/auth/me (auth_token cookie holds JWT, not user ID)
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token')?.value;
  if (!authToken) {
    redirect('/login');
  }

  let userId: string;
  try {
    const meRes = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { Cookie: `auth_token=${authToken}` },
      cache: 'no-store',
    });
    if (!meRes.ok) redirect('/login');
    const meData = await meRes.json();
    userId = meData.user.id;
  } catch {
    redirect('/login');
  }

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
        <h1 className="text-4xl font-caveat text-notebook-ink">Tasks</h1>
        <Link
          href="/tasks/new"
          className="px-4 py-2 bg-notebook-ink-blue text-notebook-paper-white font-patrick-hand hover:bg-notebook-ink-blue/90 rounded-lg shadow-notebook-sm focus:outline-none focus:ring-2 focus:ring-notebook-ink-blue focus:ring-offset-2"
        >
          + New Task
        </Link>
      </div>

      {/* Search */}
      <SearchInput />

      {/* Filters */}
      <TaskFilters currentFilters={filters} />

      {/* Error state */}
      {error && (
        <div className="bg-notebook-highlight-pink/50 border border-notebook-ink-red/20 text-notebook-ink-red font-patrick-hand px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Task list */}
      {tasks.length === 0 && !error ? (
        filters.search ? (
          <div className="bg-notebook-paper-white border-2 border-dashed border-notebook-line rounded-xl p-12 text-center">
            <p className="font-patrick-hand text-notebook-ink-medium text-lg">
              No tasks found for &apos;{filters.search}&apos;
            </p>
          </div>
        ) : (
          <EmptyState hasFilters={hasFilters} />
        )
      ) : (
        <div className="space-y-4">
          {tasks.map((task, index) => (
            <div key={task.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
              <TaskCard task={task} userId={userId} />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination total={total} limit={limit} currentPage={page} />
    </div>
  );
}
