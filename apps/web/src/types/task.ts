/**
 * Task Type Definitions
 * Phase 2 Chunk 2 - Tasks Full Feature Set
 */

/**
 * Task lifecycle status
 */
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

/**
 * Task priority levels
 */
export type TaskPriority = 'high' | 'medium' | 'low' | null;

/**
 * Task entity - represents a user's to-do item
 */
export interface Task {
  id: string;  // UUID
  user_id: string;  // UUID
  title: string;  // Required, max 500 chars
  description: string | null;  // Optional, max 5000 chars
  status: TaskStatus;
  priority: TaskPriority;
  tags: string[];  // Array of user-defined tags
  due_date: string | null;  // ISO 8601 timestamp or null
  completed: boolean;
  created_at: string;  // ISO 8601 timestamp
  updated_at: string;  // ISO 8601 timestamp
}

/**
 * Task creation request payload
 */
export interface TaskCreateRequest {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  tags?: string[];
  due_date?: string;  // ISO 8601 timestamp
}

/**
 * Task update request payload (partial update)
 */
export interface TaskUpdateRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  tags?: string[];
  due_date?: string;  // ISO 8601 timestamp
}

/**
 * Task list filters for querying tasks
 */
export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  tags?: string;  // Comma-separated string
  search?: string;
  sort?: TaskSortOption;
  page?: number;
  limit?: number;
}

/**
 * Sort options for task lists
 */
export type TaskSortOption =
  | 'created_desc'
  | 'created_asc'
  | 'due_date_asc'
  | 'due_date_desc'
  | 'priority_asc'
  | 'priority_desc';

/**
 * Paginated task list response
 */
export interface TaskListResponse {
  tasks: Task[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Task form validation errors
 */
export interface TaskValidationErrors {
  title?: string;
  description?: string;
  priority?: string;
  tags?: string;
  due_date?: string;
}

/**
 * Validate task title
 */
export function validateTitle(title: string): string | null {
  if (!title || !title.trim()) {
    return 'Title cannot be empty';
  }
  if (title.length > 500) {
    return 'Title must be 500 characters or less';
  }
  return null;
}

/**
 * Validate task description
 */
export function validateDescription(description: string): string | null {
  if (description && description.length > 5000) {
    return 'Description must be 5000 characters or less';
  }
  return null;
}

/**
 * Validate task priority
 */
export function validatePriority(priority: string | null): string | null {
  if (priority && !['high', 'medium', 'low'].includes(priority)) {
    return 'Priority must be high, medium, or low';
  }
  return null;
}

/**
 * Validate entire task form
 */
export function validateTaskForm(
  data: TaskCreateRequest | TaskUpdateRequest
): TaskValidationErrors {
  const errors: TaskValidationErrors = {};

  if ('title' in data && data.title !== undefined) {
    const titleError = validateTitle(data.title);
    if (titleError) errors.title = titleError;
  }

  if (data.description) {
    const descError = validateDescription(data.description);
    if (descError) errors.description = descError;
  }

  if (data.priority) {
    const priorityError = validatePriority(data.priority);
    if (priorityError) errors.priority = priorityError;
  }

  return errors;
}
