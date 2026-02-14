/**
 * HabitForm Component
 * Phase 2 Chunk 3 - Habits MVP
 *
 * Form for creating and editing habits with identity statement, 2-minute version,
 * category, and recurring schedule.
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createHabit, updateHabit, getHabits } from '@/lib/habits-api';
import {
  Habit,
  HabitCategory,
  HabitStatus,
  RecurringSchedule
} from '@/types/habit';
import { useToast } from '@/lib/toast-context';

interface HabitFormProps {
  userId: string;
  habitId?: string; // If provided, form is in edit mode
  initialData?: Partial<Habit>;
  onSuccess?: () => void;
}

export function HabitForm({ userId, habitId, initialData, onSuccess }: HabitFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const isEditMode = !!habitId;

  // Form State
  const [identityStatement, setIdentityStatement] = useState(initialData?.identity_statement || 'I am a person who ');
  const [fullDescription, setFullDescription] = useState(initialData?.full_description || '');
  const [twoMinuteVersion, setTwoMinuteVersion] = useState(initialData?.two_minute_version || '');
  const [habitStackingCue, setHabitStackingCue] = useState(initialData?.habit_stacking_cue || '');
  const [anchorHabitId, setAnchorHabitId] = useState(initialData?.anchor_habit_id || '');
  const [motivation, setMotivation] = useState(initialData?.motivation || '');
  const [category, setCategory] = useState<HabitCategory>(initialData?.category || HabitCategory.HEALTH_FITNESS);
  const [status, setStatus] = useState<HabitStatus>(initialData?.status || HabitStatus.ACTIVE);

  // Recurring Schedule State
  const [scheduleType, setScheduleType] = useState<RecurringSchedule['type']>(initialData?.recurring_schedule?.type || 'daily');
  const [scheduleDays, setScheduleDays] = useState<number[]>(initialData?.recurring_schedule?.days || []);
  const [scheduleDayOfMonth, setScheduleDayOfMonth] = useState<number>(initialData?.recurring_schedule?.day_of_month || 1);
  const [scheduleUntil, setScheduleUntil] = useState<string>(initialData?.recurring_schedule?.until || '');

  // Meta State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingHabits, setExistingHabits] = useState<Habit[]>([]);
  const [isLoadingHabits, setIsLoadingHabits] = useState(false);

  // Fetch habits for stacking options
  useEffect(() => {
    async function fetchHabits() {
      setIsLoadingHabits(true);
      try {
        const response = await getHabits(userId, { limit: 100 });
        // Filter out current habit to avoid self-anchoring
        setExistingHabits(response.habits.filter(h => h.id !== habitId));
      } catch (error) {
        console.error('Failed to fetch habits for stacking:', error);
      } finally {
        setIsLoadingHabits(false);
      }
    }
    fetchHabits();
  }, [userId, habitId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const schedule: RecurringSchedule = {
      type: scheduleType,
      until: scheduleUntil || undefined,
    };

    if (scheduleType === 'weekly') {
      if (scheduleDays.length === 0) {
        showToast('Please select at least one day for weekly habits', 'error');
        setIsSubmitting(false);
        return;
      }
      schedule.days = scheduleDays;
    } else if (scheduleType === 'monthly') {
      schedule.day_of_month = scheduleDayOfMonth;
    }

    const habitData = {
      identity_statement: identityStatement.trim(),
      full_description: fullDescription.trim() || undefined,
      two_minute_version: twoMinuteVersion.trim(),
      habit_stacking_cue: habitStackingCue.trim() || undefined,
      anchor_habit_id: anchorHabitId || undefined,
      motivation: motivation.trim() || undefined,
      category,
      recurring_schedule: schedule,
      status: isEditMode ? status : undefined,
    };

    try {
      if (isEditMode && habitId) {
        await updateHabit(userId, habitId, habitData);
        showToast('Habit updated successfully', 'success');
      } else {
        await createHabit(userId, habitData);
        showToast('Habit created successfully', 'success');
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/habits');
        router.refresh();
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : `Failed to ${isEditMode ? 'update' : 'create'} habit`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDay = (day: number) => {
    setScheduleDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const daysOfWeek = [
    { label: 'Sun', value: 0 },
    { label: 'Mon', value: 1 },
    { label: 'Tue', value: 2 },
    { label: 'Wed', value: 3 },
    { label: 'Thu', value: 4 },
    { label: 'Fri', value: 5 },
    { label: 'Sat', value: 6 },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-notebook-paper-white p-6 rounded-xl shadow-notebook-md border border-notebook-line">
      {/* Identity Statement */}
      <div>
        <label htmlFor="identity" className="block text-sm font-semibold font-caveat text-notebook-ink mb-1">
          Identity Statement <span className="text-notebook-ink-red">*</span>
        </label>
        <p className="text-xs text-notebook-ink-light font-inter mb-2">Focus on who you are becoming (e.g., "I am a person who exercises daily")</p>
        <textarea
          id="identity"
          value={identityStatement}
          onChange={(e) => setIdentityStatement(e.target.value)}
          className="w-full px-4 py-3 border-0 border-b-2 border-notebook-line bg-transparent rounded-none font-inter text-notebook-ink focus:outline-none focus:border-notebook-ink-blue focus:border-b-[3px] transition-all"
          placeholder="I am a person who..."
          required
          rows={2}
        />
      </div>

      {/* 2-Minute Version */}
      <div>
        <label htmlFor="twoMinute" className="block text-sm font-semibold font-caveat text-notebook-ink mb-1">
          2-Minute Version <span className="text-notebook-ink-red">*</span>
        </label>
        <p className="text-xs text-notebook-ink-light font-inter mb-2">Law 3: Make It Easy. A version of this habit that takes less than 2 minutes.</p>
        <input
          type="text"
          id="twoMinute"
          value={twoMinuteVersion}
          onChange={(e) => setTwoMinuteVersion(e.target.value)}
          className="w-full px-4 py-3 border-0 border-b-2 border-notebook-line bg-transparent rounded-none font-inter text-notebook-ink focus:outline-none focus:border-notebook-ink-blue focus:border-b-[3px] transition-all"
          placeholder="e.g., Put on my running shoes"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-semibold font-caveat text-notebook-ink mb-2">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as HabitCategory)}
            className="w-full px-4 py-3 border-0 border-b-2 border-notebook-line bg-transparent rounded-none font-inter text-notebook-ink focus:outline-none focus:border-notebook-ink-blue focus:border-b-[3px]"
          >
            {Object.values(HabitCategory).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Status (Edit Mode Only) */}
        {isEditMode && (
          <div>
            <label htmlFor="status" className="block text-sm font-semibold font-caveat text-notebook-ink mb-2">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as HabitStatus)}
              className="w-full px-4 py-3 border-0 border-b-2 border-notebook-line bg-transparent rounded-none font-inter text-notebook-ink focus:outline-none focus:border-notebook-ink-blue focus:border-b-[3px]"
            >
              <option value={HabitStatus.ACTIVE}>Active</option>
              <option value={HabitStatus.ARCHIVED}>Archived</option>
            </select>
          </div>
        )}
      </div>

      {/* Habit Stacking */}
      <div className="bg-notebook-paper-alt p-4 rounded-lg border border-notebook-line">
        <label htmlFor="anchor" className="block text-sm font-semibold font-caveat text-notebook-ink-blue mb-2">
          Habit Stacking (Law 1: Make It Obvious)
        </label>
        <select
          id="anchor"
          value={anchorHabitId}
          onChange={(e) => {
            const id = e.target.value;
            setAnchorHabitId(id);
            if (id) {
              const anchor = existingHabits.find(h => h.id === id);
              if (anchor) {
                // Auto-generate stacking cue
                const anchorPart = anchor.identity_statement.replace(/^I am a person who /i, '').replace(/\.$/, '');
                setHabitStackingCue(`After I ${anchorPart}, I will ${twoMinuteVersion || '...'}`);
              }
            } else {
              setHabitStackingCue('');
            }
          }}
          className="w-full px-4 py-2 border-0 border-b-2 border-notebook-line bg-transparent rounded-none font-inter text-notebook-ink focus:outline-none focus:border-notebook-ink-blue focus:border-b-[3px] mb-3"
          disabled={isLoadingHabits || existingHabits.length === 0}
        >
          <option value="">Select an anchor habit...</option>
          {existingHabits.map((h) => (
            <option key={h.id} value={h.id}>{h.identity_statement}</option>
          ))}
        </select>

        {existingHabits.length === 0 && !isLoadingHabits && (
          <p className="text-xs text-notebook-ink-blue mb-3 italic font-inter">Create more habits to enable stacking!</p>
        )}

        {anchorHabitId && (
          <div>
            <label htmlFor="cue" className="block text-xs font-semibold text-notebook-ink-medium mb-1 uppercase tracking-wider font-inter">
              Stacking Cue
            </label>
            <input
              type="text"
              id="cue"
              value={habitStackingCue}
              onChange={(e) => setHabitStackingCue(e.target.value)}
              className="w-full px-3 py-2 border-0 border-b-2 border-notebook-line bg-transparent rounded-none font-inter text-notebook-ink focus:outline-none focus:border-notebook-ink-blue focus:border-b-[3px]"
              placeholder="After I [X], I will [Y]"
            />
          </div>
        )}
      </div>

      {/* Recurring Schedule */}
      <div className="border-t border-notebook-line pt-6">
        <label className="block text-sm font-semibold font-caveat text-notebook-ink mb-3">
          How often will you do this?
        </label>
        <p className="text-sm text-notebook-ink-blue font-inter mb-3">
          Tasks will be automatically created based on this schedule for the next 7 days.
        </p>

        <div className="flex gap-4 mb-4">
          {(['daily', 'weekly', 'monthly'] as const).map((type) => (
            <label key={type} className="flex items-center cursor-pointer group">
              <input
                type="radio"
                name="scheduleType"
                value={type}
                checked={scheduleType === type}
                onChange={() => setScheduleType(type)}
                className="hidden"
              />
              <span className={`px-4 py-2 rounded-full text-sm font-patrick-hand font-medium border transition-all ${
                scheduleType === type
                  ? 'bg-notebook-ink-blue border-notebook-ink-blue text-notebook-paper-white'
                  : 'bg-notebook-paper-white border-notebook-line text-notebook-ink-medium group-hover:border-notebook-ink-blue'
              }`}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </span>
            </label>
          ))}
        </div>

        {scheduleType === 'weekly' && (
          <div className="mb-4">
            <p className="text-xs text-notebook-ink-light font-inter mb-2">Select days of the week:</p>
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={`w-10 h-10 rounded-full text-xs font-patrick-hand font-bold border transition-all ${
                    scheduleDays.includes(day.value)
                      ? 'bg-notebook-ink-blue border-notebook-ink-blue text-notebook-paper-white'
                      : 'bg-notebook-paper-alt border-notebook-line text-notebook-ink-light'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {scheduleType === 'monthly' && (
          <div className="mb-4 flex items-center gap-3">
            <label htmlFor="dayOfMonth" className="text-sm text-notebook-ink-medium font-inter">Day of month:</label>
            <input
              type="number"
              id="dayOfMonth"
              min="1"
              max="31"
              value={scheduleDayOfMonth}
              onChange={(e) => setScheduleDayOfMonth(parseInt(e.target.value))}
              className="w-20 px-3 py-2 border-0 border-b-2 border-notebook-line bg-transparent rounded-none font-inter text-notebook-ink focus:outline-none focus:border-notebook-ink-blue"
            />
          </div>
        )}

        <div>
          <label htmlFor="until" className="block text-xs font-semibold text-notebook-ink-light font-inter mb-1 uppercase tracking-wider">
            Repeat until (optional)
          </label>
          <input
            type="date"
            id="until"
            value={scheduleUntil}
            onChange={(e) => setScheduleUntil(e.target.value)}
            className="px-3 py-2 border-0 border-b-2 border-notebook-line bg-transparent rounded-none font-inter text-notebook-ink text-sm focus:outline-none focus:border-notebook-ink-blue"
          />
        </div>
      </div>

      {/* Motivation & Description */}
      <div className="border-t border-notebook-line pt-6">
        <details className="group">
          <summary className="list-none cursor-pointer flex items-center text-sm font-semibold font-caveat text-notebook-ink-medium hover:text-notebook-ink transition-colors">
            <span className="mr-2 transform group-open:rotate-90 transition-transform">&#9654;</span>
            Advanced: Motivation & Description
          </summary>
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="motivation" className="block text-xs font-semibold text-notebook-ink-light font-inter mb-1 uppercase tracking-wider">
                What is your motivation? (Law 2: Make It Attractive)
              </label>
              <textarea
                id="motivation"
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                className="w-full px-4 py-2 border-0 border-b-2 border-notebook-line bg-transparent rounded-none font-inter text-notebook-ink text-sm focus:outline-none focus:border-notebook-ink-blue focus:border-b-[3px]"
                rows={2}
                placeholder="Why do you want to build this habit?"
              />
            </div>
            <div>
              <label htmlFor="fullDesc" className="block text-xs font-semibold text-notebook-ink-light font-inter mb-1 uppercase tracking-wider">
                Full Description
              </label>
              <textarea
                id="fullDesc"
                value={fullDescription}
                onChange={(e) => setFullDescription(e.target.value)}
                className="w-full px-4 py-2 border-0 border-b-2 border-notebook-line bg-transparent rounded-none font-inter text-notebook-ink text-sm focus:outline-none focus:border-notebook-ink-blue focus:border-b-[3px]"
                rows={3}
                placeholder="Detailed explanation of the habit..."
              />
            </div>
          </div>
        </details>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-notebook-line">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 border border-notebook-line rounded-lg text-notebook-ink-medium font-patrick-hand font-medium hover:bg-notebook-paper-alt transition-colors"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-notebook-ink-blue text-notebook-paper-white rounded-lg font-patrick-hand font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-notebook-md hover:shadow-notebook-lg flex items-center gap-2"
        >
          {isSubmitting && (
            <svg className="animate-spin h-4 w-4 text-notebook-paper-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          {isEditMode ? 'Save Changes' : 'Build Habit'}
        </button>
      </div>
    </form>
  );
}
