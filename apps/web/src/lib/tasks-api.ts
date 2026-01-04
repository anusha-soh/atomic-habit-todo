/**
 * Task API Client
 * Phase 2 Chunk 2 - Tasks Full Feature Set
 */

import type {
  Task,
  TaskCreateRequest,
  TaskUpdateRequest,
  TaskFilters,
  TaskListResponse,
} from '@/types/task';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * API Error class for structured error handling
 */
export class TaskAPIError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string
  ) {
    super(message);
    this.name = 'TaskAPIError';
  }
}

/**
 * Handle API response and throw TaskAPIError if not OK
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    throw new TaskAPIError(
      response.status,
      response.statusText,
      errorText || `HTTP ${response.status}: ${response.statusText}`
    );
  }

  // Handle 204 No Content (DELETE responses)
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

/**
 * Build query string from filters object
 */
function buildQueryString(filters: TaskFilters): string {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });

  return params.toString();
}

/**
 * Get paginated list of tasks with optional filters
 */
export async function getTasks(
  userId: string,
  filters: TaskFilters = {}
): Promise<TaskListResponse> {
  const queryString = buildQueryString(filters);
  const url = `${API_URL}/${userId}/tasks${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',  // Send httpOnly cookies
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return handleResponse<TaskListResponse>(response);
}

/**
 * Get a single task by ID
 */
export async function getTask(userId: string, taskId: string): Promise<Task> {
  const response = await fetch(`${API_URL}/${userId}/tasks/${taskId}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return handleResponse<Task>(response);
}

/**
 * Create a new task
 */
export async function createTask(
  userId: string,
  data: TaskCreateRequest
): Promise<Task> {
  const response = await fetch(`${API_URL}/${userId}/tasks`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return handleResponse<Task>(response);
}

/**
 * Update an existing task (partial update)
 */
export async function updateTask(
  userId: string,
  taskId: string,
  data: TaskUpdateRequest
): Promise<Task> {
  const response = await fetch(`${API_URL}/${userId}/tasks/${taskId}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return handleResponse<Task>(response);
}

/**
 * Mark a task as completed
 */
export async function completeTask(
  userId: string,
  taskId: string
): Promise<Task> {
  const response = await fetch(`${API_URL}/${userId}/tasks/${taskId}/complete`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return handleResponse<Task>(response);
}

/**
 * Delete a task permanently
 */
export async function deleteTask(
  userId: string,
  taskId: string
): Promise<void> {
  const response = await fetch(`${API_URL}/${userId}/tasks/${taskId}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return handleResponse<void>(response);
}

/**
 * Get unique tags for autocomplete (implementation in US6)
 */
export async function getTags(userId: string): Promise<string[]> {
  const response = await fetch(`${API_URL}/${userId}/tasks/tags`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return handleResponse<string[]>(response);
}
