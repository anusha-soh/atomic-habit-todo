/**
 * TaskSkeleton Component
 * Phase 2 Chunk 2 - Polish (T146)
 * Restyled T041 — Notebook design system (US7)
 *
 * Provides a loading state for TaskCard using NotebookSkeleton
 */
import { NotebookSkeleton } from '@/components/ui/notebook-skeleton';

export function TaskSkeleton() {
  return (
    <div className="space-y-4">
      <NotebookSkeleton variant="sticky-note" />
      <NotebookSkeleton variant="sticky-note" />
      <NotebookSkeleton variant="sticky-note" />
    </div>
  );
}
