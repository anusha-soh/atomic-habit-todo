/**
 * Task Detail Page
 * Phase 2 Chunk 2 - User Story 2 & 3
 */

import { notFound } from 'next/navigation';
import { getTask } from '@/lib/tasks-api';
import { TaskCard } from '@/components/tasks/TaskCard';

interface TaskDetailPageProps {
  params: {
    id: string;
  };
}

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const userId = 'current-user-id'; // This would come from session in real implementation
  let task;

  try {
    task = await getTask(userId, params.id);
  } catch (error) {
    // If the API returns 404 or similar error, show not found page
    notFound();
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-4xl font-caveat text-notebook-ink mb-6">Task Details</h1>

      <div className="max-w-2xl bg-notebook-paper-white rounded-lg border border-notebook-line shadow-notebook-sm p-6">
        <TaskCard task={task} userId={userId} />
      </div>
    </div>
  );
}
