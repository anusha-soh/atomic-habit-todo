/**
 * Task Filters Component
 * Phase 2 Chunk 2 - User Story 4
 * Provides filtering controls for tasks
 */

'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { TaskFilters as TaskFiltersType, TaskStatus, TaskPriority, TaskSortOption } from '@/types/task';

interface TaskFiltersProps {
  currentFilters?: TaskFiltersType;
}

export function TaskFilters({ currentFilters }: TaskFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<TaskStatus | ''>(currentFilters?.status || '');
  const [priority, setPriority] = useState<TaskPriority | ''>(currentFilters?.priority || '');
  const [tags, setTags] = useState(currentFilters?.tags || '');
  const [search, setSearch] = useState(currentFilters?.search || '');
  const [sort, setSort] = useState<TaskSortOption>(currentFilters?.sort || 'created_desc');

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (status) params.set('status', status);
    if (priority) params.set('priority', priority);
    if (tags) params.set('tags', tags);
    if (search) params.set('search', search);
    if (sort && sort !== 'created_desc') params.set('sort', sort); // Only add if not default

    router.push(`/tasks?${params.toString()}`);
  }, [status, priority, tags, search, sort, router]);

  const clearFilters = () => {
    setStatus('');
    setPriority('');
    setTags('');
    setSearch('');
    setSort('created_desc');
    router.push('/tasks');
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Status filter */}
        <div>
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status-filter"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus | '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Priority filter */}
        <div>
          <label htmlFor="priority-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            id="priority-filter"
            value={priority || ''}
            onChange={(e) => setPriority(e.target.value as TaskPriority | '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Search filter */}
        <div>
          <label htmlFor="search-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            id="search-filter"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Tags filter */}
        <div>
          <label htmlFor="tags-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <input
            type="text"
            id="tags-filter"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="work, urgent, client"
          />
        </div>

        {/* Sort dropdown */}
        <div>
          <label htmlFor="sort-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <select
            id="sort-filter"
            value={sort}
            onChange={(e) => setSort(e.target.value as TaskSortOption)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="created_desc">Created (Newest First)</option>
            <option value="created_asc">Created (Oldest First)</option>
            <option value="due_date_asc">Due Date (Soonest First)</option>
            <option value="due_date_desc">Due Date (Latest First)</option>
            <option value="priority_asc">Priority (High to Low)</option>
          </select>
        </div>

        {/* Clear filters button */}
        <div className="flex items-end">
          <button
            onClick={clearFilters}
            className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Active filters display */}
      {(status || priority || tags || search) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {status && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Status: {status.replace('_', ' ')}
              <button
                onClick={() => setStatus('')}
                className="ml-1.5 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
          {priority && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Priority: {priority.charAt(0).toUpperCase() + priority.slice(1)}
              <button
                onClick={() => setPriority('')}
                className="ml-1.5 text-purple-600 hover:text-purple-800"
              >
                ×
              </button>
            </span>
          )}
          {tags && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              Tags: {tags}
              <button
                onClick={() => setTags('')}
                className="ml-1.5 text-indigo-600 hover:text-indigo-800"
              >
                ×
              </button>
            </span>
          )}
          {search && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Search: "{search}"
              <button
                onClick={() => setSearch('')}
                className="ml-1.5 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}