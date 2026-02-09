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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    setIsMobileMenuOpen(false);
  };

  const FilterInputs = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5'}`}>
      {/* Status filter */}
      <div>
        <label htmlFor={`${isMobile ? 'mobile-' : ''}status-filter`} className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          id={`${isMobile ? 'mobile-' : ''}status-filter`}
          value={status}
          onChange={(e) => setStatus(e.target.value as TaskStatus | '')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-target"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Priority filter */}
      <div>
        <label htmlFor={`${isMobile ? 'mobile-' : ''}priority-filter`} className="block text-sm font-medium text-gray-700 mb-1">
          Priority
        </label>
        <select
          id={`${isMobile ? 'mobile-' : ''}priority-filter`}
          value={priority || ''}
          onChange={(e) => setPriority(e.target.value as TaskPriority | '')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-target"
        >
          <option value="">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Search filter */}
      <div>
        <label htmlFor={`${isMobile ? 'mobile-' : ''}search-filter`} className="block text-sm font-medium text-gray-700 mb-1">
          Search
        </label>
        <input
          type="text"
          id={`${isMobile ? 'mobile-' : ''}search-filter`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-target"
        />
      </div>

      {/* Tags filter */}
      <div>
        <label htmlFor={`${isMobile ? 'mobile-' : ''}tags-filter`} className="block text-sm font-medium text-gray-700 mb-1">
          Tags
        </label>
        <input
          type="text"
          id={`${isMobile ? 'mobile-' : ''}tags-filter`}
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-target"
          placeholder="work, urgent..."
        />
      </div>

      {/* Sort dropdown */}
      <div>
        <label htmlFor={`${isMobile ? 'mobile-' : ''}sort-filter`} className="block text-sm font-medium text-gray-700 mb-1">
          Sort By
        </label>
        <select
          id={`${isMobile ? 'mobile-' : ''}sort-filter`}
          value={sort}
          onChange={(e) => setSort(e.target.value as TaskSortOption)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-target"
        >
          <option value="created_desc">Created (Newest)</option>
          <option value="created_asc">Created (Oldest)</option>
          <option value="due_date_asc">Due Date (Soonest)</option>
          <option value="due_date_desc">Due Date (Latest)</option>
          <option value="priority_asc">Priority (High-Low)</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="mb-6">
      {/* Mobile Toggle */}
      <div className="lg:hidden flex gap-2 mb-4">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 touch-target"
        >
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h18a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters & Sort
        </button>
        {(status || priority || tags || search) && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-200 touch-target"
          >
            Clear
          </button>
        )}
      </div>

      {/* Desktop Filters */}
      <div className="hidden lg:block bg-white p-4 rounded-lg border border-gray-200">
        <FilterInputs />
        <div className="flex justify-end mt-4">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 touch-target"
          >
            Clear All Filters
          </button>
        </div>
      </div>

      {/* Mobile Bottom Sheet Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-xl shadow-xl p-6 animate-in slide-in-from-bottom-full duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Filters & Sorting</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 -mr-2 text-gray-400 hover:text-gray-500 touch-target"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <FilterInputs isMobile={true} />
            
            <div className="mt-8 grid grid-cols-2 gap-4">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 touch-target"
              >
                Clear All
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 touch-target"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active filters display */}
      {(status || priority || tags || search) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {status && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 touch-target">
              Status: {status.replace('_', ' ')}
              <button onClick={() => setStatus('')} className="ml-2 text-blue-600 hover:text-blue-800 text-lg">×</button>
            </span>
          )}
          {priority && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 touch-target">
              Priority: {priority.charAt(0).toUpperCase() + priority.slice(1)}
              <button onClick={() => setPriority('')} className="ml-2 text-purple-600 hover:text-purple-800 text-lg">×</button>
            </span>
          )}
          {tags && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 touch-target">
              Tags: {tags}
              <button onClick={() => setTags('')} className="ml-2 text-indigo-600 hover:text-indigo-800 text-lg">×</button>
            </span>
          )}
          {search && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 touch-target">
              Search: "{search}"
              <button onClick={() => setSearch('')} className="ml-2 text-green-600 hover:text-green-800 text-lg">×</button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}