/**
 * StatusFilter Component
 * Phase 2 Chunk 3 - Habits MVP
 */
'use client';

import { HabitStatus } from '@/types/habit';

interface StatusFilterProps {
  selectedStatus: HabitStatus | 'all';
  onChange: (status: HabitStatus | 'all') => void;
}

export function StatusFilter({ selectedStatus, onChange }: StatusFilterProps) {
  const statuses = [
    { label: 'Active', value: HabitStatus.ACTIVE },
    { label: 'Archived', value: HabitStatus.ARCHIVED },
    { label: 'All', value: 'all' as const },
  ];

  return (
    <div className="flex bg-notebook-paper-alt p-1 rounded-lg border border-notebook-line/50">
      {statuses.map((s) => (
        <button
          key={s.label}
          type="button"
          onClick={() => onChange(s.value)}
          className={`px-4 py-1.5 rounded-md text-xs font-patrick-hand font-bold uppercase tracking-wider transition-all ${
            selectedStatus === s.value
              ? 'bg-notebook-ink-blue text-notebook-paper-white border border-notebook-ink-blue shadow-sm'
              : 'text-notebook-ink-medium bg-notebook-paper-white border border-notebook-line hover:text-notebook-ink'
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
