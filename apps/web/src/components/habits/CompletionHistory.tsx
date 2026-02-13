'use client';

import { useEffect, useState, useCallback } from 'react';
import { getCompletionHistory, undoCompletion } from '@/lib/habits-api';
import type { HabitCompletion } from '@/types/habit';

interface CompletionHistoryProps {
  habitId: string;
  userId: string;
  /** Called when a completion is undone (so parent can refresh streak) */
  onUndo?: (newStreak: number) => void;
}

/**
 * Shows paginated list of completions for a habit.
 * Includes "Undo" button per entry to remove accidental completions.
 */
export function CompletionHistory({ habitId, userId, onUndo }: CompletionHistoryProps) {
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [undoingId, setUndoingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await getCompletionHistory(userId, habitId);
      setCompletions(resp.completions);
      setTotal(resp.total);
    } catch {
      // Non-critical — silently fail; user sees empty list
    } finally {
      setLoading(false);
    }
  }, [userId, habitId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleUndo = async (completionId: string) => {
    setUndoingId(completionId);
    try {
      const result = await undoCompletion(userId, habitId, completionId);
      setCompletions((prev) => prev.filter((c) => c.id !== completionId));
      setTotal((prev) => prev - 1);
      onUndo?.(result.recalculated_streak);
    } catch {
      // Fail silently; completion remains in list
    } finally {
      setUndoingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <span className="w-6 h-6 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (completions.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-6">No completions yet.</p>
    );
  }

  return (
    <div>
      <p className="text-xs text-gray-400 mb-3">{total} completion{total !== 1 ? 's' : ''} total</p>
      <ul className="divide-y divide-gray-100">
        {completions.map((c) => (
          <li key={c.id} className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-gray-900">
                {new Date(c.completed_at).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {c.completion_type === 'two_minute' ? '⚡ 2-minute version' : '🏆 Full habit'}
              </p>
            </div>
            <button
              type="button"
              disabled={undoingId === c.id}
              onClick={() => handleUndo(c.id)}
              className="text-xs text-red-400 hover:text-red-600 disabled:opacity-40 transition-colors px-2 py-1"
              aria-label="Undo this completion"
            >
              {undoingId === c.id ? 'Undoing…' : 'Undo'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
