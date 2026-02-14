/**
 * CategoryFilter Component
 * Phase 2 Chunk 3 - Habits MVP
 */
'use client';

import { HabitCategory } from '@/types/habit';

interface CategoryFilterProps {
  selectedCategory: string | null;
  onChange: (category: string | null) => void;
}

export function CategoryFilter({ selectedCategory, onChange }: CategoryFilterProps) {
  const categories = [
    { label: 'All', value: null },
    ...Object.values(HabitCategory).map(cat => ({ label: cat, value: cat }))
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <button
          key={cat.label}
          onClick={() => onChange(cat.value)}
          className={`px-4 py-2 rounded-full text-sm font-patrick-hand font-medium transition-all ${
            selectedCategory === cat.value
              ? 'bg-notebook-ink-blue text-notebook-paper-white shadow-md'
              : 'text-notebook-ink-medium bg-notebook-paper-white border border-notebook-line hover:border-notebook-ink-blue/40'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
