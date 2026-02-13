/**
 * Habit API Client
 * Phase 2 Chunk 3 - Habits MVP
 */

import type {
  Habit,
  HabitCreate,
  HabitUpdate,
  HabitFilters,
  HabitListResponse,
  CompleteHabitRequest,
  CompleteHabitResponse,
  StreakInfo,
  CompletionHistoryResponse,
  UndoCompletionResponse,
} from '@/types/habit';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * API Error class for structured error handling
 */
export class HabitAPIError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string
  ) {
    super(message);
    this.name = 'HabitAPIError';
  }
}

/**
 * Handle API response and throw HabitAPIError if not OK
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    throw new HabitAPIError(
      response.status,
      response.statusText,
      errorText || `HTTP ${response.status}: ${response.statusText}`
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  // Handle responses with no body
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return undefined as T;
  }

  return response.json();
}

/**
 * Build query string from filters object
 */
function buildQueryString(filters: HabitFilters): string {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });

  return params.toString();
}

/**
 * Get paginated list of habits with optional filters
 */
export async function getHabits(
  userId: string,
  filters: HabitFilters = {}
): Promise<HabitListResponse> {
  const queryString = buildQueryString(filters);
  const url = `${API_URL}/api/${userId}/habits${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',  // Send httpOnly cookies
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return handleResponse<HabitListResponse>(response);
}

/**
 * Get a single habit by ID
 */
export async function getHabit(userId: string, habitId: string): Promise<Habit> {
  const response = await fetch(`${API_URL}/api/${userId}/habits/${habitId}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return handleResponse<Habit>(response);
}

/**
 * Create a new habit
 */
export async function createHabit(
  userId: string,
  data: HabitCreate
): Promise<Habit> {
  const response = await fetch(`${API_URL}/api/${userId}/habits`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return handleResponse<Habit>(response);
}

/**
 * Update a habit (partial update)
 */
export async function updateHabit(
  userId: string,
  habitId: string,
  data: HabitUpdate
): Promise<Habit> {
  const response = await fetch(`${API_URL}/api/${userId}/habits/${habitId}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return handleResponse<Habit>(response);
}

/**
 * Delete a habit
 */
export async function deleteHabit(
  userId: string,
  habitId: string,
  force: boolean = false
): Promise<void> {
  const queryString = force ? '?force=true' : '';
  const response = await fetch(`${API_URL}/api/${userId}/habits/${habitId}${queryString}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return handleResponse<void>(response);
}

/**
 * Archive a habit (set status to archived)
 */
export async function archiveHabit(
  userId: string,
  habitId: string
): Promise<Habit> {
  const response = await fetch(`${API_URL}/api/${userId}/habits/${habitId}/archive`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return handleResponse<Habit>(response);
}

/**
 * Restore a habit (set status to active)
 */
export async function restoreHabit(
  userId: string,
  habitId: string
): Promise<Habit> {
  const response = await fetch(`${API_URL}/api/${userId}/habits/${habitId}/restore`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return handleResponse<Habit>(response);
}

// ── Phase 3 / Chunk 4: Completion tracking API ───────────────────────────────

/**
 * Mark a habit as completed today.
 * Returns 409 if already completed today.
 */
export async function completeHabit(
  userId: string,
  habitId: string,
  data: CompleteHabitRequest
): Promise<CompleteHabitResponse> {
  const response = await fetch(`${API_URL}/api/${userId}/habits/${habitId}/complete`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return handleResponse<CompleteHabitResponse>(response);
}

/**
 * Get current streak info for a habit
 */
export async function getHabitStreak(
  userId: string,
  habitId: string
): Promise<StreakInfo> {
  const response = await fetch(`${API_URL}/api/${userId}/habits/${habitId}/streak`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  return handleResponse<StreakInfo>(response);
}

/**
 * Get completion history for a habit
 */
export async function getCompletionHistory(
  userId: string,
  habitId: string,
  startDate?: string,
  endDate?: string
): Promise<CompletionHistoryResponse> {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);

  const qs = params.toString();
  const response = await fetch(
    `${API_URL}/api/${userId}/habits/${habitId}/completions${qs ? `?${qs}` : ''}`,
    {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    }
  );

  return handleResponse<CompletionHistoryResponse>(response);
}

/**
 * Undo (delete) a specific completion and recalculate streak
 */
export async function undoCompletion(
  userId: string,
  habitId: string,
  completionId: string
): Promise<UndoCompletionResponse> {
  const response = await fetch(
    `${API_URL}/api/${userId}/habits/${habitId}/completions/${completionId}`,
    {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    }
  );

  return handleResponse<UndoCompletionResponse>(response);
}