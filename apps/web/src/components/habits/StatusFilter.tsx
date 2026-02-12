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
    <div className="flex bg-gray-100 p-1 rounded-lg">
      {statuses.map((s) => (
        <button
          key={s.label}
          type="button"
          onClick={() => onChange(s.value)}
          className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
            selectedStatus === s.value
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
