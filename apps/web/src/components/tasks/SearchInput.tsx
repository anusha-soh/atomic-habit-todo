'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get('search') || '');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    // Sync from URL on mount
    setValue(searchParams.get('search') || '');
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (newValue) {
        params.set('search', newValue);
      } else {
        params.delete('search');
      }
      router.push(`/tasks?${params.toString()}`);
    }, 300);
  };

  return (
    <div className="mb-6">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Search tasks..."
        className="w-full px-4 py-2 border border-notebook-line rounded-lg bg-notebook-paper-white font-patrick-hand text-notebook-ink placeholder:text-notebook-ink-light focus:outline-none focus:ring-2 focus:ring-notebook-ink-blue focus:border-notebook-ink-blue"
        aria-label="Search tasks"
      />
    </div>
  );
}
