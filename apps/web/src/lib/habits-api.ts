/**
 * Habit API Client
 * Phase 2 Chunk 3 - Habits MVP
 */

import type {
  Habit,
  HabitCreateRequest,
  HabitUpdateRequest,
  HabitFilters,
  HabitListResponse,
} from '@/types/habit';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

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

  // Handle 200 OK with no body (DELETE responses)
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
  const url = `${API_URL}/${userId}/habits${queryString ? `?${queryString}` : ''}`;

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
  const response = await fetch(`${API_URL}/${userId}/habits/${habitId}`, {
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
  data: HabitCreateRequest
): Promise<Habit> {
  const response = await fetch(`${API_URL}/${userId}/habits`, {
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
  data: HabitUpdateRequest
): Promise<Habit> {
  const response = await fetch(`${API_URL}/${userId}/habits/${habitId}`, {
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
  const response = await fetch(`${API_URL}/${userId}/habits/${habitId}${queryString}`, {
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
  return updateHabit(userId, habitId, { status: 'archived' });
}

/**
 * Restore a habit (set status to active)
 */
export async function restoreHabit(
  userId: string,
  habitId: string
): Promise<Habit> {
  return updateHabit(userId, habitId, { status: 'active' });
}
