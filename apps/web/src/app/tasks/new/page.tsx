/**
 * New Task Page
 * Phase 2 Chunk 2 - User Story 1
 *
 * Page for creating new tasks with TaskForm component
 */
import { cookies } from 'next/headers';
import { TaskForm } from '@/components/tasks/TaskForm';

export default async function NewTaskPage() {
  // Get user ID from session cookie (simplified - in production use proper auth)
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session_token');

  // For development, use a test user ID if no session
  // In production, redirect to login if no session
  const userId = sessionCookie?.value || 'test-user-id';

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Task</h1>
        <p className="mt-2 text-gray-600">
          Add a new task to your list. Fill in the title and optionally add a description.
        </p>
      </div>

      {/* Form */}
      <div className="bg-white shadow rounded-lg p-6">
        <TaskForm userId={userId} />
      </div>
    </div>
  );
}
