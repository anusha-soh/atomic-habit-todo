/**
 * EmptyState Component
 * Phase 2 Chunk 2 - Polish (T151)
 * Restyled T039 — Notebook design system (US7)
 *
 * Provides an empty state UI for the task list with notebook aesthetic
 */
import Link from 'next/link';

interface EmptyStateProps {
  hasFilters: boolean;
  onClearFilters?: () => void;
}

export function EmptyState({ hasFilters, onClearFilters }: EmptyStateProps) {
  if (hasFilters) {
    return (
      <div className="bg-notebook-paper-white border-2 border-dashed border-notebook-line rounded-2xl p-12 text-center">
        <svg className="mx-auto mb-4 w-16 h-16 text-notebook-ink-light" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M20 44L44 20l-4-4L16 40l4 4z" />
          <path d="M40 16l4 4" />
          <path d="M16 40l-2 6 6-2" />
          <line x1="12" y1="52" x2="52" y2="52" strokeDasharray="4 4" />
        </svg>
        <h3 className="font-caveat text-2xl text-notebook-ink">No tasks match your filters</h3>
        <p className="font-inter text-notebook-ink-medium mt-1 mb-6">No tasks match your filters. Try a different view!</p>
        <button
          onClick={onClearFilters}
          className="inline-flex items-center px-5 py-2.5 font-patrick-hand text-base rounded-lg text-notebook-ink-blue bg-notebook-highlight-blue/20 hover:bg-notebook-highlight-blue/40 border border-notebook-ink-blue/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-notebook-ink-blue transition-colors"
        >
          Clear all filters
        </button>
      </div>
    );
  }

  return (
    <div className="bg-notebook-paper-white border-2 border-dashed border-notebook-line rounded-2xl p-12 text-center">
      <svg className="mx-auto mb-4 w-16 h-16 text-notebook-ink-light" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M20 44L44 20l-4-4L16 40l4 4z" />
        <path d="M40 16l4 4" />
        <path d="M16 40l-2 6 6-2" />
        <line x1="12" y1="52" x2="52" y2="52" strokeDasharray="4 4" />
      </svg>
      <h3 className="font-caveat text-2xl text-notebook-ink">Your task list is a blank page</h3>
      <p className="font-inter text-notebook-ink-medium mt-1 mb-6">Your task list is a blank page — time to write your story!</p>
      <Link
        href="/tasks/new"
        className="inline-flex items-center px-5 py-2.5 font-patrick-hand text-base rounded-lg shadow-notebook-sm text-white bg-notebook-ink-blue hover:bg-notebook-ink-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-notebook-ink-blue transition-colors"
      >
        + Create Task
      </Link>
    </div>
  );
}
