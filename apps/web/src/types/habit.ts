export enum HabitStatus {
  ACTIVE = "active",
  ARCHIVED = "archived",
}

export enum HabitCategory {
  HEALTH_FITNESS = "Health & Fitness",
  PRODUCTIVITY = "Productivity",
  MINDFULNESS = "Mindfulness",
  LEARNING = "Learning",
  SOCIAL = "Social",
  FINANCE = "Finance",
  CREATIVE = "Creative",
  OTHER = "Other",
}

export interface RecurringSchedule {
  type: "daily" | "weekly" | "monthly";
  until?: string;
  days?: number[];
  day_of_month?: number;
}

export interface Habit {
  id: string;
  user_id: string;
  identity_statement: string;
  full_description?: string;
  two_minute_version: string;
  habit_stacking_cue?: string;
  anchor_habit_id?: string;
  motivation?: string;
  category: HabitCategory;
  recurring_schedule: RecurringSchedule;
  status: HabitStatus;
  current_streak: number;
  last_completed_at?: string;
  consecutive_misses: number;
  created_at: string;
  updated_at: string;
}

export interface HabitCreate {
  identity_statement: string;
  full_description?: string;
  two_minute_version: string;
  habit_stacking_cue?: string;
  anchor_habit_id?: string;
  motivation?: string;
  category: HabitCategory;
  recurring_schedule: RecurringSchedule;
}

export interface HabitUpdate {
  identity_statement?: string;
  full_description?: string;
  two_minute_version?: string;
  habit_stacking_cue?: string;
  anchor_habit_id?: string;
  motivation?: string;
  category?: HabitCategory;
  recurring_schedule?: RecurringSchedule;
  status?: HabitStatus;
}

export interface HabitListResponse {
  habits: Habit[];
  total: number;
  page: number;
  limit: number;
}

export interface HabitFilters {
  status?: HabitStatus;
  category?: HabitCategory;
  page?: number;
  limit?: number;
  include_archived?: boolean;
}

// ── Phase 3 / Chunk 4: Completion tracking types ─────────────────────────────

export type CompletionType = 'full' | 'two_minute';

export interface HabitCompletion {
  id: string;
  habit_id: string;
  user_id: string;
  completed_at: string;
  completion_type: CompletionType;
  created_at: string;
}

export interface CompleteHabitRequest {
  completion_type: CompletionType;
}

export interface CompleteHabitResponse {
  habit_id: string;
  current_streak: number;
  completion: HabitCompletion;
  message: string;
}

export interface StreakInfo {
  habit_id: string;
  current_streak: number;
  last_completed_at?: string;
  consecutive_misses: number;
}

export interface CompletionHistoryResponse {
  completions: HabitCompletion[];
  total: number;
}

export interface UndoCompletionResponse {
  deleted: boolean;
  recalculated_streak: number;
  message: string;
}