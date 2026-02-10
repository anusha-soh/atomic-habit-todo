/**
 * Habit Type Definitions
 * Phase 2 Chunk 3 - Habits MVP
 */

/**
 * Habit status
 */
export type HabitStatus = 'active' | 'archived';

/**
 * Habit categories (predefined per ADR-006)
 */
export type HabitCategory =
  | 'Health & Fitness'
  | 'Productivity'
  | 'Mindfulness'
  | 'Learning'
  | 'Social'
  | 'Finance'
  | 'Creative'
  | 'Other';

/**
 * Recurring schedule type
 */
export type RecurringScheduleType = 'daily' | 'weekly' | 'monthly';

/**
 * Recurring schedule structure (stored as JSONB)
 */
export interface RecurringSchedule {
  type: RecurringScheduleType;
  until?: string;  // ISO 8601 date
  days?: number[];  // For weekly: 0=Sunday, 6=Saturday
  day_of_month?: number;  // For monthly: 1-31
}

/**
 * Habit entity - represents a recurring behavior and identity focus
 */
export interface Habit {
  id: string;  // UUID
  user_id: string;  // UUID
  identity_statement: string;  // Required, max 2000 chars
  full_description: string | null;  // Optional, max 5000 chars
  two_minute_version: string;  // Required, max 500 chars
  habit_stacking_cue: string | null;  // Optional, max 500 chars
  anchor_habit_id: string | null;  // UUID or null
  motivation: string | null;  // Optional, max 2000 chars
  category: HabitCategory;
  recurring_schedule: RecurringSchedule;
  status: HabitStatus;
  current_streak: number;
  last_completed_at: string | null;  // ISO 8601 timestamp or null
  consecutive_misses: number;
  created_at: string;  // ISO 8601 timestamp
  updated_at: string;  // ISO 8601 timestamp
}

/**
 * Habit creation request payload
 */
export interface HabitCreateRequest {
  identity_statement: string;
  two_minute_version: string;
  category: HabitCategory;
  recurring_schedule: RecurringSchedule;
  full_description?: string;
  habit_stacking_cue?: string;
  anchor_habit_id?: string;  // UUID
  motivation?: string;
}

/**
 * Habit update request payload (partial update)
 */
export interface HabitUpdateRequest {
  identity_statement?: string;
  full_description?: string;
  two_minute_version?: string;
  habit_stacking_cue?: string;
  anchor_habit_id?: string;  // UUID
  motivation?: string;
  category?: HabitCategory;
  recurring_schedule?: RecurringSchedule;
  status?: HabitStatus;
}

/**
 * Habit list filters for querying habits
 */
export interface HabitFilters {
  status?: HabitStatus;
  category?: HabitCategory;
  include_archived?: boolean;
  page?: number;
  limit?: number;
}

/**
 * Paginated habit list response
 */
export interface HabitListResponse {
  habits: Habit[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Habit form validation errors
 */
export interface HabitValidationErrors {
  identity_statement?: string;
  two_minute_version?: string;
  category?: string;
  recurring_schedule?: string;
  full_description?: string;
  habit_stacking_cue?: string;
  motivation?: string;
}

/**
 * All predefined habit categories
 */
export const HABIT_CATEGORIES: HabitCategory[] = [
  'Health & Fitness',
  'Productivity',
  'Mindfulness',
  'Learning',
  'Social',
  'Finance',
  'Creative',
  'Other',
];

/**
 * Validate identity statement
 */
export function validateIdentityStatement(statement: string): string | null {
  if (!statement || !statement.trim()) {
    return 'Identity statement cannot be empty';
  }
  if (statement.length > 2000) {
    return 'Identity statement must be 2000 characters or less';
  }
  return null;
}

/**
 * Validate two-minute version
 */
export function validateTwoMinuteVersion(version: string): string | null {
  if (!version || !version.trim()) {
    return '2-minute version cannot be empty';
  }
  if (version.length > 500) {
    return '2-minute version must be 500 characters or less';
  }
  return null;
}

/**
 * Validate category
 */
export function validateCategory(category: string): string | null {
  if (!HABIT_CATEGORIES.includes(category as HabitCategory)) {
    return `Category must be one of: ${HABIT_CATEGORIES.join(', ')}`;
  }
  return null;
}

/**
 * Validate recurring schedule
 */
export function validateRecurringSchedule(schedule: RecurringSchedule): string | null {
  if (!schedule.type) {
    return 'Schedule type is required';
  }

  if (schedule.type === 'weekly') {
    if (!schedule.days || schedule.days.length === 0) {
      return 'Weekly habits must specify at least one day';
    }
    if (!schedule.days.every(day => day >= 0 && day <= 6)) {
      return 'Days must be between 0 (Sunday) and 6 (Saturday)';
    }
  }

  if (schedule.type === 'monthly') {
    if (!schedule.day_of_month) {
      return 'Monthly habits must specify day_of_month';
    }
    if (schedule.day_of_month < 1 || schedule.day_of_month > 31) {
      return 'day_of_month must be between 1 and 31';
    }
  }

  return null;
}

/**
 * Validate full description
 */
export function validateFullDescription(description: string): string | null {
  if (description && description.length > 5000) {
    return 'Full description must be 5000 characters or less';
  }
  return null;
}

/**
 * Validate habit stacking cue
 */
export function validateStackingCue(cue: string): string | null {
  if (cue && cue.length > 500) {
    return 'Habit stacking cue must be 500 characters or less';
  }
  return null;
}

/**
 * Validate motivation
 */
export function validateMotivation(motivation: string): string | null {
  if (motivation && motivation.length > 2000) {
    return 'Motivation must be 2000 characters or less';
  }
  return null;
}

/**
 * Validate entire habit form
 */
export function validateHabitForm(
  data: HabitCreateRequest | HabitUpdateRequest
): HabitValidationErrors {
  const errors: HabitValidationErrors = {};

  if ('identity_statement' in data && data.identity_statement !== undefined) {
    const error = validateIdentityStatement(data.identity_statement);
    if (error) errors.identity_statement = error;
  }

  if ('two_minute_version' in data && data.two_minute_version !== undefined) {
    const error = validateTwoMinuteVersion(data.two_minute_version);
    if (error) errors.two_minute_version = error;
  }

  if ('category' in data && data.category !== undefined) {
    const error = validateCategory(data.category);
    if (error) errors.category = error;
  }

  if ('recurring_schedule' in data && data.recurring_schedule !== undefined) {
    const error = validateRecurringSchedule(data.recurring_schedule);
    if (error) errors.recurring_schedule = error;
  }

  if (data.full_description) {
    const error = validateFullDescription(data.full_description);
    if (error) errors.full_description = error;
  }

  if (data.habit_stacking_cue) {
    const error = validateStackingCue(data.habit_stacking_cue);
    if (error) errors.habit_stacking_cue = error;
  }

  if (data.motivation) {
    const error = validateMotivation(data.motivation);
    if (error) errors.motivation = error;
  }

  return errors;
}

/**
 * Format recurring schedule for display
 */
export function formatRecurringSchedule(schedule: RecurringSchedule): string {
  if (schedule.type === 'daily') {
    return 'Daily';
  }

  if (schedule.type === 'weekly') {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const days = schedule.days?.map(d => dayNames[d]).join(', ') || '';
    return `Weekly: ${days}`;
  }

  if (schedule.type === 'monthly') {
    const day = schedule.day_of_month;
    const suffix =
      day === 1 || day === 21 || day === 31
        ? 'st'
        : day === 2 || day === 22
        ? 'nd'
        : day === 3 || day === 23
        ? 'rd'
        : 'th';
    return `Monthly: ${day}${suffix}`;
  }

  return 'Unknown schedule';
}

/**
 * Format habit identity for display (truncate if too long)
 */
export function formatIdentityStatement(statement: string, maxLength: number = 50): string {
  if (statement.length <= maxLength) {
    return statement;
  }
  return statement.substring(0, maxLength - 3) + '...';
}
