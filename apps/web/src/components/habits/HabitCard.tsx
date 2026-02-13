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
  const categoryColors: Record<string, string> = {
    [HabitCategory.HEALTH_FITNESS]: 'bg-green-100 text-green-800 border-green-200',
    [HabitCategory.PRODUCTIVITY]: 'bg-blue-100 text-blue-800 border-blue-200',
    [HabitCategory.MINDFULNESS]: 'bg-purple-100 text-purple-800 border-purple-200',
    [HabitCategory.LEARNING]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    [HabitCategory.SOCIAL]: 'bg-pink-100 text-pink-800 border-pink-200',
    [HabitCategory.FINANCE]: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    [HabitCategory.CREATIVE]: 'bg-orange-100 text-orange-800 border-orange-200',
    [HabitCategory.OTHER]: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const scheduleLabels = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
  };

  return (
    <Link href={`/habits/${habit.id}`} className="block">
      <div className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all duration-200 relative overflow-hidden">
        {/* Category Tag */}
        <div className="flex justify-between items-start mb-3">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${categoryColors[habit.category] || categoryColors[HabitCategory.OTHER]}`}>
            {habit.category}
          </span>
          {habit.status === HabitStatus.ARCHIVED && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-gray-100 text-gray-500 border-gray-200">
              Archived
            </span>
          )}
        </div>

        {/* Identity Statement */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
          {habit.identity_statement}
        </h3>

        {/* 2-Minute Version (Starter) */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
            <span className="text-blue-600 text-sm">🎯</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-tight">Starter Version</p>
            <p className="text-sm text-gray-700 font-medium truncate">{habit.two_minute_version}</p>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <span className="opacity-70">🔄</span>
            <span>{scheduleLabels[habit.recurring_schedule.type]}</span>
          </div>
          <StreakCounter streak={habit.current_streak} compact />
        </div>

        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-16 h-16 -mr-8 -mt-8 bg-blue-500 opacity-0 group-hover:opacity-5 rounded-full transition-opacity" />
      </div>
    </Link>
  );
}
