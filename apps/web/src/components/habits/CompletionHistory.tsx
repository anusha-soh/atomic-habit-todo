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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await getCompletionHistory(
        userId,
        habitId,
        startDate || undefined,
        endDate || undefined,
      );
      setCompletions(resp.completions);
      setTotal(resp.total);
    } catch {
      // Non-critical — silently fail; user sees empty list
    } finally {
      setLoading(false);
    }
  }, [userId, habitId, startDate, endDate]);

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
        <span className="w-6 h-6 border-2 border-notebook-line border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (completions.length === 0) {
    return (
      <p className="text-sm font-inter text-notebook-ink-light text-center py-6">No completions yet.</p>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-end gap-2 mb-4">
        <label className="flex flex-col text-xs font-patrick-hand text-notebook-ink-light">
          From
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-0.5 text-sm font-inter border border-notebook-line rounded px-2 py-1 bg-notebook-paper-white text-notebook-ink"
            aria-label="Start date"
          />
        </label>
        <label className="flex flex-col text-xs font-patrick-hand text-notebook-ink-light">
          To
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-0.5 text-sm font-inter border border-notebook-line rounded px-2 py-1 bg-notebook-paper-white text-notebook-ink"
            aria-label="End date"
          />
        </label>
        <button
          type="button"
          onClick={load}
          className="text-xs font-patrick-hand px-3 py-1.5 bg-notebook-paper-alt hover:bg-notebook-paper-alt/80 text-notebook-ink-medium rounded transition-colors"
        >
          Filter
        </button>
        {(startDate || endDate) && (
          <button
            type="button"
            onClick={() => { setStartDate(''); setEndDate(''); }}
            className="text-xs font-patrick-hand text-notebook-ink-light hover:text-notebook-ink-medium px-2 py-1.5 transition-colors"
          >
            Clear
          </button>
        )}
      </div>
      <p className="text-xs font-inter text-notebook-ink-light mb-3">{total} completion{total !== 1 ? 's' : ''} total</p>
      <ul className="divide-y divide-notebook-line">
        {completions.map((c) => (
          <li key={c.id} className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-inter font-medium text-notebook-ink">
                {new Date(c.completed_at).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
              <p className="text-xs font-inter text-notebook-ink-light mt-0.5">
                {c.completion_type === 'two_minute' ? '⚡ 2-minute version' : '🏆 Full habit'}
              </p>
            </div>
            <button
              type="button"
              disabled={undoingId === c.id}
              onClick={() => handleUndo(c.id)}
              className="text-xs font-patrick-hand text-notebook-ink-red hover:text-notebook-ink-red/80 disabled:opacity-40 transition-colors px-2 py-1"
              aria-label="Undo this completion"
            >
              {undoingId === c.id ? 'Undoing...' : 'Undo'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
