/**
 * Habit Detail Page
 * Phase 2 Chunk 3 - Habits MVP
 *
 * Page displaying detailed information about a single habit.
 */
'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI, APIError } from '@/lib/api';
import { getHabit, deleteHabit, archiveHabit, restoreHabit } from '@/lib/habits-api';
import { Habit, HabitCategory, HabitStatus } from '@/types/habit';
import { CompletionCheckbox } from '@/components/habits/CompletionCheckbox';
import { CompletionHistory } from '@/components/habits/CompletionHistory';
import { GeneratedTasksList } from '@/components/habits/GeneratedTasksList';
import { StreakCounter } from '@/components/habits/StreakCounter';
import { useToast } from '@/lib/toast-context';

export default function HabitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { showToast } = useToast();

  const [user, setUser] = useState<any>(null);
  const [habit, setHabit] = useState<Habit | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [currentStreak, setCurrentStreak] = useState<number>(0);

  // Auth and Habit Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const authResponse = await authAPI.me() as { user: any };
        setUser(authResponse.user);

        const habitResponse = await getHabit(authResponse.user.id, id);
        setHabit(habitResponse);
        setCurrentStreak(habitResponse.current_streak ?? 0);
      } catch (err) {
        if (err instanceof APIError && err.status === 401) {
          router.push('/login');
        } else {
          showToast('Failed to load habit details', 'error');
          router.push('/habits');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router, showToast]);

  const handleDelete = async () => {
    if (!user || !habit) return;

    const confirmed = window.confirm(
      'Are you sure you want to delete this habit? All progress data will be permanently removed.'
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await deleteHabit(user.id, habit.id);
      showToast('Habit deleted successfully', 'success');
      router.push('/habits');
    } catch (error) {
      // Handle dependency warning (400) if implemented
      showToast(error instanceof Error ? error.message : 'Failed to delete habit', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!user || !habit) return;

    setIsArchiving(true);
    try {
      if (habit.status === HabitStatus.ACTIVE) {
        const updated = await archiveHabit(user.id, habit.id);
        setHabit(updated);
        showToast('Habit archived', 'success');
      } else {
        const updated = await restoreHabit(user.id, habit.id);
        setHabit(updated);
        showToast('Habit restored', 'success');
      }
    } catch (error) {
      showToast('Failed to change status', 'error');
    } finally {
      setIsArchiving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-notebook-ink-blue"></div>
      </div>
    );
  }

  if (!habit || !user) return null;

  const categoryColors: Record<string, string> = {
    [HabitCategory.HEALTH_FITNESS]: 'bg-notebook-highlight-mint/50 text-notebook-ink-green',
    [HabitCategory.PRODUCTIVITY]: 'bg-notebook-highlight-blue/50 text-notebook-ink-blue',
    [HabitCategory.MINDFULNESS]: 'bg-notebook-highlight-pink/50 text-notebook-ink-red',
    [HabitCategory.LEARNING]: 'bg-notebook-highlight-yellow/50 text-notebook-ink',
    [HabitCategory.SOCIAL]: 'bg-notebook-highlight-pink/50 text-notebook-ink-red',
    [HabitCategory.FINANCE]: 'bg-notebook-highlight-mint/50 text-notebook-ink-green',
    [HabitCategory.CREATIVE]: 'bg-notebook-highlight-yellow/50 text-notebook-ink',
    [HabitCategory.OTHER]: 'bg-notebook-paper-alt text-notebook-ink-medium',
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/habits" className="text-sm font-patrick-hand text-notebook-ink-blue hover:text-notebook-ink-blue/80 flex items-center gap-1">
          ← Back to Habits
        </Link>
        <div className="flex gap-2">
          <button
            onClick={handleToggleStatus}
            disabled={isArchiving}
            className="px-4 py-2 border border-notebook-line rounded-lg text-sm font-patrick-hand text-notebook-ink-medium hover:bg-notebook-paper-alt disabled:opacity-50 transition-colors"
          >
            {habit.status === HabitStatus.ACTIVE ? 'Archive' : 'Restore'}
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-notebook-highlight-pink/50 text-notebook-ink-red border border-notebook-ink-red/20 rounded-lg text-sm font-patrick-hand hover:bg-notebook-highlight-pink disabled:opacity-50 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="bg-notebook-paper-white rounded-3xl border border-notebook-line shadow-notebook-md overflow-hidden">
        {/* Header Section */}
        <div className="p-8 md:p-12 border-b border-notebook-line">
          <div className="flex items-center gap-3 mb-6">
            <span className={`text-xs font-patrick-hand uppercase tracking-widest px-3 py-1 rounded-full ${categoryColors[habit.category]}`}>
              {habit.category}
            </span>
            {habit.status === HabitStatus.ARCHIVED && (
              <span className="text-xs font-patrick-hand uppercase tracking-widest px-3 py-1 rounded-full bg-notebook-paper-alt text-notebook-ink-light">
                Archived
              </span>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-caveat text-notebook-ink mb-6 leading-tight">
            {habit.identity_statement}
          </h1>
          {habit.motivation && (
            <p className="text-lg font-inter text-notebook-ink-light italic">&ldquo; {habit.motivation} &rdquo;</p>
          )}
        </div>

        {/* 2-Minute Version (Law 3 Highlight) */}
        <div className="bg-notebook-ink-blue p-8 md:p-12 text-notebook-paper-white">
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            <div className="flex-shrink-0 w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center text-4xl">
              🎯
            </div>
            <div>
              <p className="text-notebook-paper-white/70 text-sm font-patrick-hand uppercase tracking-widest mb-1">Law 3: Make It Easy</p>
              <h2 className="text-2xl md:text-3xl font-caveat mb-2">The 2-Minute Version</h2>
              <p className="text-xl font-inter text-notebook-paper-white opacity-90">{habit.two_minute_version}</p>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Schedule */}
          <div>
            <h3 className="text-sm font-patrick-hand text-notebook-ink-light uppercase tracking-widest mb-4">Frequency</h3>
            <div className="flex items-center gap-3 text-notebook-ink font-inter font-bold text-xl">
              <span className="text-2xl">🔄</span>
              <span className="capitalize">{habit.recurring_schedule.type}</span>
              {habit.recurring_schedule.type === 'weekly' && habit.recurring_schedule.days && (
                 <span className="text-sm font-normal text-notebook-ink-light ml-2">
                   ({habit.recurring_schedule.days.map(d => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(', ')})
                 </span>
              )}
            </div>
          </div>

          {/* Stacking */}
          <div>
            <h3 className="text-sm font-patrick-hand text-notebook-ink-light uppercase tracking-widest mb-4">Habit Stacking (Law 1)</h3>
            {habit.habit_stacking_cue ? (
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-1">🔗</span>
                <p className="text-notebook-ink font-inter font-bold text-lg leading-snug">
                  {habit.habit_stacking_cue}
                </p>
              </div>
            ) : (
              <p className="text-notebook-ink-light font-inter italic">No stacking cue defined.</p>
            )}
          </div>

          {/* Full Description */}
          {habit.full_description && (
            <div className="md:col-span-2">
              <h3 className="text-sm font-patrick-hand text-notebook-ink-light uppercase tracking-widest mb-4">Full Description</h3>
              <p className="text-notebook-ink-medium font-inter leading-relaxed text-lg">
                {habit.full_description}
              </p>
            </div>
          )}
        </div>

        {/* Tracking Stats + Complete Button */}
        <div className="bg-notebook-paper-alt p-8 border-t border-notebook-line">
          <div className="flex flex-wrap gap-8 justify-center md:justify-start items-center mb-8">
            <div className="text-center md:text-left">
              <p className="text-xs font-patrick-hand text-notebook-ink-light uppercase tracking-widest mb-1">Current Streak</p>
              <StreakCounter streak={currentStreak} />
            </div>
            <div className="text-center md:text-left">
              <p className="text-xs font-patrick-hand text-notebook-ink-light uppercase tracking-widest mb-1">Misses</p>
              <p className="text-3xl font-caveat text-notebook-ink">{habit.consecutive_misses}</p>
            </div>
            <div className="text-center md:text-left ml-auto">
              <p className="text-xs font-patrick-hand text-notebook-ink-light uppercase tracking-widest mb-1">Member Since</p>
              <p className="text-lg font-inter font-bold text-notebook-ink">{new Date(habit.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Complete today button */}
          {habit.status === HabitStatus.ACTIVE && (
            <div className="flex items-center gap-3 mb-8">
              <CompletionCheckbox
                habitId={habit.id}
                userId={user.id}
                onComplete={(newStreak) => setCurrentStreak(newStreak)}
              />
              <span className="text-sm font-inter text-notebook-ink-medium font-medium">Mark as complete today</span>
            </div>
          )}

          {/* Generated Tasks (Chunk 5) */}
          <GeneratedTasksList habitId={habit.id} userId={user.id} />

          {/* Completion History */}
          <div>
            <h3 className="text-sm font-patrick-hand text-notebook-ink-light uppercase tracking-widest mb-4">Completion History</h3>
            <CompletionHistory
              habitId={habit.id}
              userId={user.id}
              onUndo={(newStreak) => setCurrentStreak(newStreak)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
