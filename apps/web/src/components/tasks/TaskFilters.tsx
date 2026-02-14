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
  const [habitTaskFilter, setHabitTaskFilter] = useState<string>(
    currentFilters?.is_habit_task === true ? 'true' : currentFilters?.is_habit_task === false ? 'false' : ''
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (status) params.set('status', status);
    if (priority) params.set('priority', priority);
    if (tags) params.set('tags', tags);
    if (search) params.set('search', search);
    if (sort && sort !== 'created_desc') params.set('sort', sort);
    if (habitTaskFilter) params.set('is_habit_task', habitTaskFilter);

    router.push(`/tasks?${params.toString()}`);
  }, [status, priority, tags, search, sort, router]);

  const clearFilters = () => {
    setStatus('');
    setPriority('');
    setTags('');
    setSearch('');
    setSort('created_desc');
    setHabitTaskFilter('');
    router.push('/tasks');
    setIsMobileMenuOpen(false);
  };

  const FilterInputs = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-6'}`}>
      {/* Habit task filter */}
      <div>
        <label htmlFor={`${isMobile ? 'mobile-' : ''}habit-filter`} className="block text-sm font-patrick-hand font-medium text-notebook-ink-medium mb-1">
          Source
        </label>
        <select
          id={`${isMobile ? 'mobile-' : ''}habit-filter`}
          value={habitTaskFilter}
          onChange={(e) => setHabitTaskFilter(e.target.value)}
          className="w-full px-3 py-2 border-0 border-b-2 border-notebook-line bg-transparent rounded-none font-inter text-notebook-ink focus:outline-none focus:border-notebook-ink-blue focus:border-b-[3px] touch-target"
        >
          <option value="">All Tasks</option>
          <option value="true">Habit Tasks Only</option>
          <option value="false">Manual Tasks Only</option>
        </select>
      </div>

      {/* Status filter */}
      <div>
        <label htmlFor={`${isMobile ? 'mobile-' : ''}status-filter`} className="block text-sm font-patrick-hand font-medium text-notebook-ink-medium mb-1">
          Status
        </label>
        <select
          id={`${isMobile ? 'mobile-' : ''}status-filter`}
          value={status}
          onChange={(e) => setStatus(e.target.value as TaskStatus | '')}
          className="w-full px-3 py-2 border-0 border-b-2 border-notebook-line bg-transparent rounded-none font-inter text-notebook-ink focus:outline-none focus:border-notebook-ink-blue focus:border-b-[3px] touch-target"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Priority filter */}
      <div>
        <label htmlFor={`${isMobile ? 'mobile-' : ''}priority-filter`} className="block text-sm font-patrick-hand font-medium text-notebook-ink-medium mb-1">
          Priority
        </label>
        <select
          id={`${isMobile ? 'mobile-' : ''}priority-filter`}
          value={priority || ''}
          onChange={(e) => setPriority(e.target.value as TaskPriority | '')}
          className="w-full px-3 py-2 border-0 border-b-2 border-notebook-line bg-transparent rounded-none font-inter text-notebook-ink focus:outline-none focus:border-notebook-ink-blue focus:border-b-[3px] touch-target"
        >
          <option value="">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Search filter */}
      <div>
        <label htmlFor={`${isMobile ? 'mobile-' : ''}search-filter`} className="block text-sm font-patrick-hand font-medium text-notebook-ink-medium mb-1">
          Search
        </label>
        <input
          type="text"
          id={`${isMobile ? 'mobile-' : ''}search-filter`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks..."
          className="w-full px-3 py-2 border-0 border-b-2 border-notebook-line bg-transparent rounded-none font-inter text-notebook-ink placeholder:text-notebook-ink-light focus:outline-none focus:border-notebook-ink-blue focus:border-b-[3px] touch-target"
        />
      </div>

      {/* Tags filter */}
      <div>
        <label htmlFor={`${isMobile ? 'mobile-' : ''}tags-filter`} className="block text-sm font-patrick-hand font-medium text-notebook-ink-medium mb-1">
          Tags
        </label>
        <input
          type="text"
          id={`${isMobile ? 'mobile-' : ''}tags-filter`}
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full px-3 py-2 border-0 border-b-2 border-notebook-line bg-transparent rounded-none font-inter text-notebook-ink placeholder:text-notebook-ink-light focus:outline-none focus:border-notebook-ink-blue focus:border-b-[3px] touch-target"
          placeholder="work, urgent..."
        />
      </div>

      {/* Sort dropdown */}
      <div>
        <label htmlFor={`${isMobile ? 'mobile-' : ''}sort-filter`} className="block text-sm font-patrick-hand font-medium text-notebook-ink-medium mb-1">
          Sort By
        </label>
        <select
          id={`${isMobile ? 'mobile-' : ''}sort-filter`}
          value={sort}
          onChange={(e) => setSort(e.target.value as TaskSortOption)}
          className="w-full px-3 py-2 border-0 border-b-2 border-notebook-line bg-transparent rounded-none font-inter text-notebook-ink focus:outline-none focus:border-notebook-ink-blue focus:border-b-[3px] touch-target"
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
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-notebook-paper-white border border-notebook-line rounded-md shadow-sm text-sm font-patrick-hand font-medium text-notebook-ink-medium hover:bg-notebook-paper-alt touch-target"
        >
          <svg className="h-5 w-5 text-notebook-ink-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h18a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters & Sort
        </button>
        {(status || priority || tags || search) && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-notebook-paper-alt border border-notebook-line rounded-md shadow-sm text-sm font-patrick-hand font-medium text-notebook-ink-medium hover:bg-notebook-paper touch-target"
          >
            Clear
          </button>
        )}
      </div>

      {/* Desktop Filters */}
      <div className="hidden lg:block bg-notebook-paper-white p-4 rounded-lg border border-notebook-line">
        <FilterInputs />
        <div className="flex justify-end mt-4">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm font-patrick-hand font-medium text-notebook-ink-medium hover:text-notebook-ink touch-target"
          >
            Clear All Filters
          </button>
        </div>
      </div>

      {/* Mobile Bottom Sheet Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="fixed inset-x-0 bottom-0 bg-notebook-paper rounded-t-xl shadow-xl p-6 animate-in slide-in-from-bottom-full duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold font-caveat text-notebook-ink">Filters & Sorting</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 -mr-2 text-notebook-ink-light hover:text-notebook-ink-medium touch-target"
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
                className="w-full px-4 py-3 bg-notebook-paper-alt text-notebook-ink-medium font-patrick-hand font-medium rounded-md hover:bg-notebook-paper touch-target"
              >
                Clear All
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full px-4 py-3 bg-notebook-ink-blue text-notebook-paper-white font-patrick-hand font-medium rounded-md hover:opacity-90 touch-target"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active filters display */}
      {(status || priority || tags || search || habitTaskFilter) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {status && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-patrick-hand font-medium bg-notebook-ink-blue bg-opacity-10 text-notebook-ink-blue touch-target">
              Status: {status.replace('_', ' ')}
              <button onClick={() => setStatus('')} className="ml-2 text-notebook-ink-blue hover:opacity-70 text-lg">&times;</button>
            </span>
          )}
          {priority && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-patrick-hand font-medium bg-notebook-ink-blue bg-opacity-10 text-notebook-ink-blue touch-target">
              Priority: {priority.charAt(0).toUpperCase() + priority.slice(1)}
              <button onClick={() => setPriority('')} className="ml-2 text-notebook-ink-blue hover:opacity-70 text-lg">&times;</button>
            </span>
          )}
          {tags && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-patrick-hand font-medium bg-notebook-ink-blue bg-opacity-10 text-notebook-ink-blue touch-target">
              Tags: {tags}
              <button onClick={() => setTags('')} className="ml-2 text-notebook-ink-blue hover:opacity-70 text-lg">&times;</button>
            </span>
          )}
          {search && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-patrick-hand font-medium bg-notebook-ink-green bg-opacity-10 text-notebook-ink-green touch-target">
              Search: &quot;{search}&quot;
              <button onClick={() => setSearch('')} className="ml-2 text-notebook-ink-green hover:opacity-70 text-lg">&times;</button>
            </span>
          )}
          {habitTaskFilter && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-patrick-hand font-medium bg-notebook-ink-blue bg-opacity-10 text-notebook-ink-blue touch-target">
              {habitTaskFilter === 'true' ? 'Habit Tasks' : 'Manual Tasks'}
              <button onClick={() => setHabitTaskFilter('')} className="ml-2 text-notebook-ink-blue hover:opacity-70 text-lg">&times;</button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
