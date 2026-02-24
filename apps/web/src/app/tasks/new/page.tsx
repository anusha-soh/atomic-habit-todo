/**
 * New Task Page
 * Phase 2 Chunk 2 - User Story 1
 *
 * Page for creating new tasks with TaskForm component
 */
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { API_BASE } from '@/lib/api';
import { TaskForm } from '@/components/tasks/TaskForm';

export default async function NewTaskPage() {
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-caveat text-notebook-ink">Create New Task</h1>
        <p className="mt-2 font-inter text-notebook-ink-medium">
          Add a new task to your list. Fill in the title and optionally add a description.
        </p>
      </div>

      {/* Form */}
      <div className="bg-notebook-paper-white shadow-notebook-sm rounded-lg border border-notebook-line p-6">
        <TaskForm userId={userId} />
      </div>
    </div>
  );
}
