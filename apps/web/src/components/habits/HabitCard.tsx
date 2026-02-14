/**
 * HabitCard Component
 * Phase 2 Chunk 3 - Habits MVP
 *
 * Displays a summary of a habit with its identity statement, 2-minute version,
 * category, and status.
 */
import Link from 'next/link';
import { Habit, HabitCategory, HabitStatus } from '@/types/habit';
import { StreakCounter } from './StreakCounter';

interface HabitCardProps {
  habit: Habit;
  userId: string;
}

export function HabitCard({ habit, userId }: HabitCardProps) {
  // Map categories to colors
  // Badge colors for category text
  const categoryColors: Record<string, string> = {
    [HabitCategory.HEALTH_FITNESS]: 'bg-notebook-ink-green/10 text-notebook-ink-green border-notebook-ink-green/20',
    [HabitCategory.PRODUCTIVITY]: 'bg-notebook-ink-blue/10 text-notebook-ink-blue border-notebook-ink-blue/20',
    [HabitCategory.MINDFULNESS]: 'bg-notebook-highlight-pink/30 text-notebook-ink-medium border-notebook-highlight-pink/40',
    [HabitCategory.LEARNING]: 'bg-notebook-highlight-yellow text-notebook-ink-medium border-notebook-line',
    [HabitCategory.SOCIAL]: 'bg-notebook-ink-red/10 text-notebook-ink-red border-notebook-ink-red/20',
    [HabitCategory.FINANCE]: 'bg-notebook-ink-green/10 text-notebook-ink-green/80 border-notebook-ink-green/20',
    [HabitCategory.CREATIVE]: 'bg-notebook-ink-blue/10 text-notebook-ink-blue/80 border-notebook-ink-blue/20',
    [HabitCategory.OTHER]: 'bg-notebook-paper-alt text-notebook-ink-medium border-notebook-line',
  };

  // Top accent bar colors by category
  const categoryAccentColors: Record<string, string> = {
    [HabitCategory.HEALTH_FITNESS]: 'bg-notebook-ink-green',
    [HabitCategory.PRODUCTIVITY]: 'bg-notebook-ink-blue',
    [HabitCategory.MINDFULNESS]: 'bg-notebook-highlight-pink',
    [HabitCategory.LEARNING]: 'bg-notebook-highlight-yellow',
    [HabitCategory.SOCIAL]: 'bg-notebook-ink-red/60',
    [HabitCategory.FINANCE]: 'bg-notebook-ink-green/60',
    [HabitCategory.CREATIVE]: 'bg-notebook-ink-blue/60',
    [HabitCategory.OTHER]: 'bg-notebook-line',
  };

  const scheduleLabels = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
  };

  return (
    <Link href={`/habits/${habit.id}`} className="block">
      <div
        className="group bg-notebook-paper-alt rounded-xl shadow-notebook-md hover:shadow-notebook-hover hover:-translate-y-1 transition-all duration-200 overflow-hidden"
        style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, var(--notebook-line) 28px)' }}
      >
        {/* Top accent border by category */}
        <div className={`h-1 ${categoryAccentColors[habit.category] || categoryAccentColors[HabitCategory.OTHER]}`} />

        <div className="p-5">
          {/* Category Tag */}
          <div className="flex justify-between items-start mb-3">
            <span className={`font-patrick-hand text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${categoryColors[habit.category] || categoryColors[HabitCategory.OTHER]}`}>
              {habit.category}
            </span>
            {habit.status === HabitStatus.ARCHIVED && (
              <span className="font-patrick-hand text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-notebook-paper-alt text-notebook-ink-light border-notebook-line">
                Archived
              </span>
            )}
          </div>

          {/* Identity Statement */}
          <h3 className="font-caveat text-xl text-notebook-ink mb-2 group-hover:text-notebook-ink-blue transition-colors line-clamp-2">
            {habit.identity_statement}
          </h3>

          {/* 2-Minute Version (Starter) */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-shrink-0 w-8 h-8 bg-notebook-ink-blue/10 rounded-full flex items-center justify-center">
              <span className="text-notebook-ink-blue text-sm">🎯</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-notebook-ink-light font-patrick-hand uppercase tracking-tight">Starter Version</p>
              <p className="text-sm text-notebook-ink-medium font-inter font-medium truncate">{habit.two_minute_version}</p>
            </div>
          </div>

          {/* Footer info */}
          <div className="flex items-center justify-between pt-4 border-t border-notebook-line/50 text-xs text-notebook-ink-light font-inter">
            <div className="flex items-center gap-1">
              <span className="opacity-70">🔄</span>
              <span>{scheduleLabels[habit.recurring_schedule.type]}</span>
            </div>
            <StreakCounter streak={habit.current_streak} compact />
          </div>
        </div>
      </div>
    </Link>
  );
}
