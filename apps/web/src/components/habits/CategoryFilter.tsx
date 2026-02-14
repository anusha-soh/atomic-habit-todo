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
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            selectedCategory === cat.value
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-400'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
