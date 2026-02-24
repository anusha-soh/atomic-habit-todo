/**
 * Edit Task Page (Server Component)
 * Phase 2 Chunk 2 - User Story 2
 *
 * Fetches task data server-side and renders edit form
 */
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import { API_BASE } from '@/lib/api';
import { TaskForm } from '@/components/tasks/TaskForm';
import { getTask } from '@/lib/tasks-api';

interface EditTaskPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTaskPage({ params }: EditTaskPageProps) {
  const { id: taskId } = await params;

  // Get user UUID via /api/auth/me (auth_token cookie holds JWT, not user ID)
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token')?.value;
  if (!authToken) redirect('/login');

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

  let task;
  let error: string | null = null;

  try {
    task = await getTask(userId, taskId);
  } catch (e) {
    if (e instanceof Error && e.message.includes('404')) {
      notFound();
    }
    error = e instanceof Error ? e.message : 'Failed to load task';
  }

  if (!task && !error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/tasks"
          className="text-notebook-ink-blue hover:text-notebook-ink-blue/80 font-patrick-hand text-sm mb-4 inline-block"
        >
          &larr; Back to Tasks
        </Link>
        <h1 className="text-4xl font-caveat text-notebook-ink">Edit Task</h1>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-notebook-highlight-pink/50 border border-notebook-ink-red/20 text-notebook-ink-red font-patrick-hand px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Edit form */}
      {task && (
        <div className="bg-notebook-paper-white rounded-lg shadow-notebook-sm border border-notebook-line p-6">
          <TaskForm
            userId={userId}
            taskId={taskId}
            initialData={{
              title: task.title,
              description: task.description,
              status: task.status,
              priority: task.priority,
              tags: task.tags,
            }}
          />
        </div>
      )}
    </div>
  );
}
