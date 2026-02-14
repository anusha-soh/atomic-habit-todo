import { cn } from '@/lib/utils';

interface NotebookSkeletonProps {
  variant?: 'sticky-note' | 'index-card' | 'line';
  className?: string;
}

export function NotebookSkeleton({ variant = 'sticky-note', className }: NotebookSkeletonProps) {
  const baseClasses = 'animate-pulse rounded-lg';

  if (variant === 'line') {
    return <div className={cn(baseClasses, 'h-4 bg-notebook-line/40', className)} />;
  }

  if (variant === 'index-card') {
    return (
      <div className={cn(baseClasses, 'bg-notebook-paper-alt border border-notebook-line/30 p-5 space-y-3', className)}>
        <div className="h-1 w-full bg-notebook-ink-blue/10 rounded" />
        <div className="h-5 w-3/4 bg-notebook-line/40 rounded" />
        <div className="h-4 w-1/2 bg-notebook-line/30 rounded" />
        <div className="flex items-center gap-2 pt-2">
          <div className="h-8 w-8 bg-notebook-line/30 rounded-full" />
          <div className="h-4 w-2/3 bg-notebook-line/20 rounded" />
        </div>
        <div className="h-3 w-1/3 bg-notebook-line/20 rounded mt-2" />
      </div>
    );
  }

  // sticky-note variant (default)
  return (
    <div className={cn(baseClasses, 'bg-notebook-highlight-yellow/50 border border-notebook-line/20 p-4 space-y-3', className)}>
      <div className="h-5 w-3/4 bg-notebook-line/40 rounded" />
      <div className="h-4 w-full bg-notebook-line/30 rounded" />
      <div className="h-4 w-2/3 bg-notebook-line/20 rounded" />
      <div className="flex gap-2 pt-2">
        <div className="h-5 w-16 bg-notebook-line/30 rounded-full" />
        <div className="h-5 w-20 bg-notebook-line/30 rounded-full" />
      </div>
    </div>
  );
}
