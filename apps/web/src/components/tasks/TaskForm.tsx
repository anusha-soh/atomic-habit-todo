/**
 * TaskForm Component
 * Phase 2 Chunk 2 - User Story 1 & 2
 *
 * Form for creating and editing tasks with title, description, status, and priority
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createTask, updateTask, getTags } from '@/lib/tasks-api';
import { validateTitle, validateDescription, Task, TaskStatus, TaskPriority } from '@/types/task';
import { useToast } from '@/lib/toast-context';

interface TaskFormProps {
  userId: string;
  taskId?: string; // If provided, form is in edit mode
  initialData?: {
    title?: string;
    description?: string | null;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: string | null;
    tags?: string[];
  };
  onSuccess?: () => void;
}

export function TaskForm({ userId, taskId, initialData, onSuccess }: TaskFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const isEditMode = !!taskId;

  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [status, setStatus] = useState<TaskStatus>(initialData?.status || 'pending');
  const [priority, setPriority] = useState<TaskPriority>(initialData?.priority || null);
  const [dueDate, setDueDate] = useState<string>(initialData?.dueDate || '');
  const [tags, setTags] = useState<string>(initialData?.tags?.join(', ') || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  // Tag autocomplete state
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (userId) {
      getTags(userId).then(setTagSuggestions).catch(() => {});
    }
  }, [userId]);

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTagInput(val);
    if (val.length > 0) {
      // Derive the current list of already-added tags to exclude them from suggestions
      const currentTags = tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);
      setFilteredSuggestions(
        tagSuggestions.filter(
          t => t.toLowerCase().includes(val.toLowerCase()) && !currentTags.includes(t)
        )
      );
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (tag: string) => {
    // Append the selected tag to the comma-separated tags string
    const currentTags = tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);
    if (!currentTags.includes(tag)) {
      currentTags.push(tag);
    }
    setTags(currentTags.join(', '));
    setShowSuggestions(false);
    setTagInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate inputs
    const titleError = validateTitle(title);
    const descriptionError = description ? validateDescription(description) : null;

    if (titleError || descriptionError) {
      setErrors({
        title: titleError || undefined,
        description: descriptionError || undefined,
      });
      return;
    }

    // Process tags: split by comma and trim whitespace
    const processedTags = tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    setIsSubmitting(true);

    try {
      if (isEditMode && taskId) {
        // Update existing task
        await updateTask(userId, taskId, {
          title: title.trim(),
          description: description.trim() || undefined,
          status,
          priority,
          due_date: dueDate || undefined,
          tags: processedTags,
        });
        showToast('Task updated successfully', 'success');
      } else {
        // Create new task
        await createTask(userId, {
          title: title.trim(),
          description: description.trim() || undefined,
          status,
          priority,
          due_date: dueDate || undefined,
          tags: processedTags,
        });
        showToast('Task created successfully', 'success');
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/tasks');
        router.refresh();
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : `Failed to ${isEditMode ? 'update' : 'create'} task`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-notebook-paper-white rounded-xl p-6 shadow-notebook-md">
      {/* Loading overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-notebook-paper-white p-6 rounded-lg shadow-xl">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-notebook-ink-blue mr-3"></div>
              <span className="font-inter text-notebook-ink">{isEditMode ? 'Updating task...' : 'Creating task...'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Title field */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium font-caveat text-notebook-ink mb-1">
          Title <span className="text-notebook-ink-red">*</span>
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`w-full px-3 py-2 border-0 border-b-2 bg-transparent rounded-none font-inter text-notebook-ink focus:outline-none focus:border-notebook-ink-blue focus:border-b-[3px] ${
            errors.title ? 'border-notebook-ink-red' : 'border-notebook-line'
          } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          placeholder="Enter task title"
          maxLength={500}
          disabled={isSubmitting}
          required
        />
        {errors.title && (
          <p className="mt-1 text-notebook-ink-red font-patrick-hand text-sm">{errors.title}</p>
        )}
        <p className="mt-1 text-notebook-ink-light font-inter text-xs">{title.length}/500 characters</p>
      </div>

      {/* Description field */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium font-caveat text-notebook-ink mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className={`w-full px-3 py-2 border-0 border-b-2 bg-transparent rounded-none font-inter text-notebook-ink focus:outline-none focus:border-notebook-ink-blue focus:border-b-[3px] ${
            errors.description ? 'border-notebook-ink-red' : 'border-notebook-line'
          } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          placeholder="Enter task description (optional)"
          maxLength={5000}
          disabled={isSubmitting}
        />
        {errors.description && (
          <p className="mt-1 text-notebook-ink-red font-patrick-hand text-sm">{errors.description}</p>
        )}
        <p className="mt-1 text-notebook-ink-light font-inter text-xs">{description.length}/5000 characters</p>
      </div>

      {/* Status field (only in edit mode) */}
      {isEditMode && (
        <div>
          <label htmlFor="status" className="block text-sm font-medium font-caveat text-notebook-ink mb-1">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            className={`w-full px-3 py-2 border-0 border-b-2 border-notebook-line bg-transparent rounded-none font-inter text-notebook-ink focus:outline-none focus:border-notebook-ink-blue focus:border-b-[3px] ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isSubmitting}
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      )}

      {/* Priority field */}
      <div>
        <label htmlFor="priority" className="block text-sm font-medium font-caveat text-notebook-ink mb-1">
          Priority
        </label>
        <select
          id="priority"
          value={priority || ''}
          onChange={(e) => setPriority(e.target.value as TaskPriority || null)}
          className={`w-full px-3 py-2 border-0 border-b-2 border-notebook-line bg-transparent rounded-none font-inter text-notebook-ink focus:outline-none focus:border-notebook-ink-blue focus:border-b-[3px] ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={isSubmitting}
        >
          <option value="">No priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {/* Due Date field */}
      <div>
        <label htmlFor="dueDate" className="block text-sm font-medium font-caveat text-notebook-ink mb-1">
          Due Date
        </label>
        <input
          type="datetime-local"
          id="dueDate"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className={`w-full px-3 py-2 border-0 border-b-2 border-notebook-line bg-transparent rounded-none font-inter text-notebook-ink focus:outline-none focus:border-notebook-ink-blue focus:border-b-[3px] ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={isSubmitting}
        />
      </div>

      {/* Tags field */}
      <div>
        <label htmlFor="tags" className="block text-sm font-medium font-caveat text-notebook-ink mb-1">
          Tags
        </label>
        {/* Existing tags (comma-separated) — direct edit field */}
        <input
          type="text"
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className={`w-full px-3 py-2 border-0 border-b-2 border-notebook-line bg-transparent rounded-none font-inter text-notebook-ink focus:outline-none focus:border-notebook-ink-blue focus:border-b-[3px] ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          placeholder="Enter tags separated by commas (e.g., work, urgent, client)"
          disabled={isSubmitting}
        />
        {/* Autocomplete input for adding tags from suggestions */}
        <div className="relative mt-2">
          <input
            type="text"
            value={tagInput}
            onChange={handleTagInputChange}
            onBlur={() => {
              // Delay hide so clicks on suggestions register first
              setTimeout(() => setShowSuggestions(false), 150);
            }}
            onFocus={() => {
              if (tagInput.length > 0 && filteredSuggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            placeholder="Or type to search existing tags..."
            className={`w-full px-3 py-2 border-0 border-b border-notebook-line bg-transparent rounded-none font-inter text-notebook-ink-medium text-sm focus:outline-none focus:border-notebook-ink-blue ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isSubmitting}
            aria-label="Search for tag suggestions"
            aria-autocomplete="list"
            aria-expanded={showSuggestions}
          />
          {showSuggestions && filteredSuggestions.length > 0 && (
            <ul
              className="absolute z-10 w-full bg-notebook-paper-white border border-notebook-line rounded-lg mt-1 shadow-notebook-sm max-h-40 overflow-y-auto"
              role="listbox"
            >
              {filteredSuggestions.map(suggestion => (
                <li
                  key={suggestion}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className="px-3 py-2 font-patrick-hand text-notebook-ink hover:bg-notebook-paper-alt cursor-pointer"
                  role="option"
                  aria-selected={false}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="mt-1 text-notebook-ink-light font-inter text-xs">Separate tags with commas, or pick from suggestions above</p>
      </div>

      {/* Submit button */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-notebook-line rounded-md text-notebook-ink-medium hover:bg-notebook-paper-alt focus:outline-none focus:ring-2 focus:ring-notebook-ink-blue disabled:opacity-50 disabled:cursor-not-allowed font-patrick-hand"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-notebook-ink-blue text-notebook-paper-white rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-notebook-ink-blue focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative font-patrick-hand"
        >
          {isSubmitting
            ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-notebook-paper-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isEditMode ? 'Updating...' : 'Creating...'}
              </span>
            )
            : (isEditMode ? 'Update Task' : 'Create Task')}
        </button>
      </div>
    </form>
  );
}
