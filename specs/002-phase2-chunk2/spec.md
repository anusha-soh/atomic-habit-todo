# Feature Specification: Phase 2 Chunk 2 - Tasks Full Feature Set

**Feature Branch**: `002-phase2-chunk2`
**Created**: 2026-01-04
**Status**: Draft
**Input**: User description: "Write a comprehensive specification for Phase 2 Chunk 2: Tasks Full Feature Set. Build complete task management system with: 1. Basic features (5): Add Task, Delete Task, Update Task, View Task List, Mark as Complete 2. Intermediate features (4): Priorities (High/Medium/Low), Tags/Categories, Search & Filter, Sort Tasks 3. Advanced features (1): Due Dates & Deadlines"

## Overview

This specification defines the complete task management system for Phase 2 Chunk 2, building upon the authentication and database infrastructure completed in Chunk 1. This chunk delivers all 9 task features required by the constitution, enabling users to manage tasks with full CRUD operations, priorities, tags, search, filtering, sorting, and due dates.

**Context**:
- Chunk 1 (Core Infrastructure) provided: user authentication, database persistence, monorepo structure, event emitter skeleton
- Chunk 2 focuses exclusively on task management features
- Habits module will be built in Chunk 3
- This is part of the 7-chunk Phase 2 delivery plan

**Scope Boundaries**:
- **In Scope**: Task CRUD, priorities, tags, search, filter, sort, due dates, task events, mobile-responsive UI
- **Out of Scope**: Habits module, habit-task connection, recurring tasks, task dependencies/subtasks, file attachments

## User Scenarios & Testing

### User Story 1 - Create and View Tasks (Priority: P1)

A user wants to capture tasks as they think of them and see their full task list to understand what needs to be done.

**Why this priority**: Core value proposition of a task manager. Without the ability to create and view tasks, no other features matter. This is the minimum viable product.

**Independent Test**: User can create a task with a title, view it in their task list, and verify it persists across sessions. Delivers immediate value: task capture and retrieval.

**Acceptance Scenarios**:

1. **Given** user is authenticated and on the tasks page, **When** user clicks "Add Task" button and enters title "Write project proposal", **Then** task is created and appears in the task list
2. **Given** user has created tasks, **When** user refreshes the page or logs out and back in, **Then** all tasks are still visible (persistence verified)
3. **Given** user creates a task with title and description, **When** viewing task list, **Then** both title and description are displayed
4. **Given** user A creates tasks, **When** user B logs in, **Then** user B only sees their own tasks (user isolation verified)

---

### User Story 2 - Update and Complete Tasks (Priority: P1)

A user wants to update task details as requirements change and mark tasks as completed when finished to track progress.

**Why this priority**: Essential for task lifecycle management. Users need to modify tasks and track completion to feel productive and maintain an accurate task list.

**Independent Test**: User can edit an existing task's title/description, mark it as complete, and verify status changes persist. Delivers value: task lifecycle management.

**Acceptance Scenarios**:

1. **Given** user has a task "Write proposal", **When** user clicks edit and changes title to "Write project proposal for client", **Then** task title is updated in the list
2. **Given** user has a pending task, **When** user clicks "Mark as Complete", **Then** task status changes to completed and UI reflects this (strikethrough, moved to completed section, etc.)
3. **Given** user marks a task as complete, **When** user refreshes the page, **Then** task remains in completed status
4. **Given** user has a completed task, **When** user wants to reopen it, **Then** task can be marked as pending/in-progress again

---

### User Story 3 - Delete Tasks (Priority: P2)

A user wants to remove tasks that are no longer relevant or were created by mistake to keep their task list clean and focused.

**Why this priority**: Important for task list hygiene but not critical for initial value. Users can work around this by marking tasks complete or ignoring them temporarily.

**Independent Test**: User can delete a task and verify it no longer appears in any filtered view. Delivers value: task list maintenance.

**Acceptance Scenarios**:

1. **Given** user has a task "Call dentist", **When** user clicks delete and confirms, **Then** task is removed from the task list permanently
2. **Given** user attempts to delete a task, **When** confirmation dialog appears, **Then** user can cancel to keep the task
3. **Given** user deletes a task, **When** user refreshes the page, **Then** task does not reappear
4. **Given** user deletes a task with ID 123, **When** user tries to access /tasks/123, **Then** system returns 404 or appropriate error

---

### User Story 4 - Prioritize Tasks (Priority: P2)

A user wants to assign priority levels (High, Medium, Low) to tasks to focus on what matters most and work more effectively.

**Why this priority**: Enhances task management effectiveness but basic task creation/completion provides core value. Users can manually order tasks without priorities if needed.

**Independent Test**: User can set priority on tasks, filter by priority, and verify high-priority tasks are visually distinct. Delivers value: focus and time management.

**Acceptance Scenarios**:

1. **Given** user creates or edits a task, **When** user selects priority "High", **Then** task is saved with high priority and displays with high priority indicator (color, icon, badge)
2. **Given** user has tasks with different priorities, **When** viewing task list, **Then** each task displays its priority level clearly
3. **Given** user has not set a priority on a task, **When** viewing the task, **Then** task shows "No Priority" or default priority indicator
4. **Given** user wants to change priority, **When** user edits task and selects different priority, **Then** priority is updated immediately

---

### User Story 5 - Add Due Dates to Tasks (Priority: P2)

A user wants to set deadlines on tasks to ensure time-sensitive work gets completed on time and to plan their schedule.

**Why this priority**: Critical for deadline-driven work but not essential for basic task capture. Users can track deadlines manually in task descriptions if needed.

**Independent Test**: User can set a due date, view upcoming tasks sorted by due date, and see overdue tasks highlighted. Delivers value: deadline awareness and planning.

**Acceptance Scenarios**:

1. **Given** user creates or edits a task, **When** user selects due date "January 10, 2026", **Then** task is saved with due date and displays in human-readable format
2. **Given** user has tasks with different due dates, **When** sorting by due date ascending, **Then** tasks with nearest due dates appear first
3. **Given** a task has no due date, **When** viewing the task, **Then** system shows "No due date" instead of a date
4. **Given** current date is after task due date, **When** viewing task list, **Then** overdue tasks are visually highlighted (red text, warning icon, etc.)
5. **Given** user sets due date with time component, **When** viewing due date, **Then** system displays date in user-friendly format (e.g., "Tomorrow", "In 3 days", "Jan 10, 2026")

---

### User Story 6 - Tag and Categorize Tasks (Priority: P2)

A user wants to organize tasks with tags/categories (e.g., "work", "personal", "fitness") to group related tasks and filter by context.

**Why this priority**: Improves organization for users with many tasks, but basic task management works without categories. Users can use naming conventions if needed.

**Independent Test**: User can add multiple tags to a task, filter by tag, and see only tasks with selected tags. Delivers value: task organization and context filtering.

**Acceptance Scenarios**:

1. **Given** user creates or edits a task, **When** user adds tags "work, urgent, client", **Then** task is saved with all three tags
2. **Given** user wants to add a new tag, **When** typing tag name, **Then** system suggests existing tags for consistency
3. **Given** user has tasks with various tags, **When** user filters by tag "work", **Then** only tasks containing "work" tag are displayed
4. **Given** user wants to remove a tag from a task, **When** user deletes tag, **Then** tag is removed without deleting the task
5. **Given** user has many tasks, **When** viewing task list, **Then** system displays all unique tags as filter options

---

### User Story 7 - Search Tasks (Priority: P3)

A user wants to quickly find specific tasks by searching in titles and descriptions without scrolling through the entire list.

**Why this priority**: Nice to have for large task lists but users can scroll/filter without search. Most valuable when task volume is high.

**Independent Test**: User can type search query and see filtered results matching title or description. Delivers value: quick task lookup.

**Acceptance Scenarios**:

1. **Given** user has tasks "Write proposal" and "Review proposal", **When** user searches for "proposal", **Then** both tasks appear in results
2. **Given** user has task with description containing "client meeting", **When** user searches for "meeting", **Then** task appears even if title doesn't contain "meeting"
3. **Given** user searches with mixed case "PROJECT", **When** search executes, **Then** results match case-insensitively (matches "project", "Project", "PROJECT")
4. **Given** user has no tasks matching search term, **When** search executes, **Then** system displays "No tasks found" message
5. **Given** user clears search box, **When** search is cleared, **Then** all tasks are displayed again

---

### User Story 8 - Filter Tasks by Status and Priority (Priority: P3)

A user wants to filter tasks by status (pending, in-progress, completed) and priority to focus on specific subsets of work.

**Why this priority**: Enhances productivity but users can visually scan for priorities/statuses. Most useful with many tasks.

**Independent Test**: User can apply multiple filters simultaneously (e.g., status=pending AND priority=high) and see only matching tasks. Delivers value: focused work sessions.

**Acceptance Scenarios**:

1. **Given** user has tasks with different statuses, **When** user filters by status "pending", **Then** only pending tasks are displayed
2. **Given** user has tasks with different priorities, **When** user filters by priority "high", **Then** only high-priority tasks are displayed
3. **Given** user wants to combine filters, **When** user selects status "pending" AND priority "high", **Then** only pending high-priority tasks are displayed
4. **Given** user has applied filters, **When** user clears all filters, **Then** all tasks are displayed again
5. **Given** user filters by "completed", **When** viewing results, **Then** completed tasks show completion timestamp

---

### User Story 9 - Sort Tasks (Priority: P3)

A user wants to sort tasks by different criteria (due date, creation date, priority) to organize their view based on current needs.

**Why this priority**: Useful for different workflows but users can mentally organize without sorting. Complements filtering for power users.

**Independent Test**: User can change sort order and verify task list reorders correctly. Delivers value: customizable task organization.

**Acceptance Scenarios**:

1. **Given** user has tasks with different due dates, **When** user selects sort "Due date (ascending)", **Then** tasks with earliest due dates appear first, tasks without due dates appear last
2. **Given** user wants to see newest tasks first, **When** user selects sort "Created (newest first)", **Then** tasks are ordered by creation timestamp descending
3. **Given** user wants to prioritize urgent work, **When** user selects sort "Priority (high to low)", **Then** high-priority tasks appear first, followed by medium, then low, then no priority
4. **Given** user has applied a sort order, **When** creating a new task, **Then** new task appears in correct position according to active sort
5. **Given** user combines sort with filters, **When** viewing results, **Then** filtered tasks are sorted according to selected sort order

---

### Edge Cases

- What happens when user creates a task with only whitespace in the title? (Validation: title must contain at least one non-whitespace character)
- What happens when user sets a due date in the past? (Allow it - users may need to track overdue tasks)
- What happens when user searches for special characters (e.g., quotes, backslashes)? (Search should escape special characters properly)
- What happens when user tries to delete a task that doesn't exist or belongs to another user? (Return 404 with appropriate error message)
- What happens when user applies filters that return zero results? (Display "No tasks match your filters" with option to clear filters)
- What happens when user has 1000+ tasks? (Pagination activates, default 50 tasks per page with page navigation)
- What happens when user tries to update a task with invalid priority value (e.g., "critical")? (Validation error: priority must be "high", "medium", or "low")
- What happens when two users modify the same task simultaneously? (Last write wins - no conflict resolution in Phase 2, document as known limitation)
- What happens when user tries to access task detail page for non-existent task? (404 page with link back to task list)
- What happens when network request fails during task creation? (Display error message, allow retry, don't leave UI in inconsistent state)
- What happens when user enters very long title (1000+ characters)? (Truncate display in list view, show full title in detail view, enforce max length of 500 characters)
- What happens when user has no tasks at all? (Display empty state with prompt to create first task)

## Requirements

### Functional Requirements

- **FR-001**: System MUST allow authenticated users to create tasks with title (required), description (optional), priority (optional: high/medium/low), tags (optional array), due date (optional timestamp), and status (defaults to "pending")
- **FR-002**: System MUST validate task title is not empty or only whitespace before saving
- **FR-003**: System MUST enforce maximum title length of 500 characters and description length of 5000 characters
- **FR-004**: System MUST allow users to view a list of all their own tasks with pagination (50 tasks per page default)
- **FR-005**: System MUST isolate tasks by user - users can only view, update, or delete their own tasks
- **FR-006**: System MUST allow users to update task title, description, priority, tags, due date, and status
- **FR-007**: System MUST allow users to mark tasks as completed, which sets status to "completed" and completed flag to true
- **FR-008**: System MUST allow users to transition tasks between statuses: pending → in-progress → completed (or directly pending → completed)
- **FR-009**: System MUST allow users to delete tasks permanently (hard delete with CASCADE on user deletion)
- **FR-010**: System MUST support filtering tasks by priority (exact match: high, medium, low, or no priority)
- **FR-011**: System MUST support filtering tasks by status (exact match: pending, in_progress, completed)
- **FR-012**: System MUST support filtering tasks by tags (match any of comma-separated tags)
- **FR-013**: System MUST support searching tasks by case-insensitive substring match in title or description
- **FR-014**: System MUST support sorting tasks by due date (ascending/descending, nulls last), creation date (ascending/descending), or priority (high→medium→low→null)
- **FR-015**: System MUST allow combining multiple filters and search simultaneously (e.g., status=pending AND priority=high AND search="proposal")
- **FR-016**: System MUST display due dates in human-readable format (e.g., "Today", "Tomorrow", "Jan 10, 2026", "Overdue")
- **FR-017**: System MUST visually highlight overdue tasks (tasks with due date before current date and status not completed)
- **FR-018**: System MUST emit event TASK_CREATED with task details when task is successfully created
- **FR-019**: System MUST emit event TASK_UPDATED with task details when task is successfully updated
- **FR-020**: System MUST emit event TASK_COMPLETED with task details when task is marked as complete
- **FR-021**: System MUST emit event TASK_DELETED with task ID when task is successfully deleted
- **FR-022**: System MUST persist all task data to database with user_id foreign key constraint
- **FR-023**: System MUST return 404 error when user attempts to access task that doesn't exist or belongs to another user
- **FR-024**: System MUST validate priority values are one of: "high", "medium", "low", or null
- **FR-025**: System MUST validate status values are one of: "pending", "in_progress", "completed"
- **FR-026**: System MUST automatically set created_at timestamp when task is created
- **FR-027**: System MUST automatically update updated_at timestamp when task is modified
- **FR-028**: System MUST display task list on mobile devices with touch-friendly controls (minimum 44×44px touch targets)
- **FR-029**: System MUST show loading states during API calls to provide feedback
- **FR-030**: System MUST handle network errors gracefully with user-friendly error messages

### Key Entities

- **Task**: Represents a single to-do item with attributes: unique identifier, owning user reference, title, optional description, status (pending/in_progress/completed), optional priority (high/medium/low), optional tags array, optional due date, completion flag, creation timestamp, last update timestamp. Relationships: belongs to exactly one User (via user_id foreign key). Constraints: cannot exist without owning user, title cannot be empty, status and priority must be from predefined sets.

- **User**: Represents an authenticated user (defined in Chunk 1). Relationships: has many Tasks. Constraints: when user is deleted, all associated tasks are cascade deleted.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can create a new task and see it in their task list within 3 seconds (including network latency)
- **SC-002**: Users can mark a task as complete with a single click/tap
- **SC-003**: Search returns results within 1 second for task lists up to 1000 tasks
- **SC-004**: Filter controls are accessible within thumb reach zone on mobile devices (bottom 50% of screen)
- **SC-005**: 95% of users successfully complete their primary task (create task, filter tasks, mark complete) on first attempt without errors
- **SC-006**: Task list remains responsive with up to 1000 tasks per user
- **SC-007**: All task CRUD operations maintain data integrity (no orphaned records, no data loss)
- **SC-008**: Zero cross-user data leakage (User A never sees User B's tasks under any filtering/search combination)
- **SC-009**: Overdue tasks are immediately visible to users (highlighted within 1 second of page load)
- **SC-010**: Users can combine 3+ filters simultaneously without performance degradation
- **SC-011**: Mobile task forms use optimized input types (date picker for due dates, appropriate keyboards)
- **SC-012**: All task events are successfully emitted and logged within 500ms of operation completion

## Assumptions

1. **Database Schema**: Tasks table already exists from infrastructure setup or will be created via Alembic migration with specified schema (id, user_id, title, description, status, priority, tags array, due_date, completed boolean, created_at, updated_at)

2. **Authentication**: User authentication is fully functional from Chunk 1, providing user_id for all task operations

3. **Event Emitter**: Event emitter infrastructure from Chunk 1 is operational and can handle task events

4. **Frontend Framework**: Next.js 16 with App Router is configured and ready for task UI components

5. **API Framework**: FastAPI backend from Chunk 1 is operational and ready for task endpoints

6. **Time Zone Handling**: Due dates stored in UTC, displayed in user's local time zone (browser handles conversion)

7. **Pagination**: Default page size is 50 tasks, configurable via query parameter

8. **Tag Input**: Users can enter tags as comma-separated values or select from autocomplete suggestions based on existing tags

9. **Concurrency**: Last write wins for simultaneous updates (no optimistic locking in Phase 2)

10. **Soft Delete vs Hard Delete**: Tasks are hard deleted (permanently removed from database) for simplicity, with CASCADE delete when user is deleted

## Dependencies

- **Chunk 1 (Core Infrastructure)**: MUST be complete with working authentication, database connection, event emitter, and monorepo structure
- **Database Migrations Tool**: Alembic must be configured for creating/modifying tasks table schema
- **User Session Management**: Active user session must provide user_id for all task API requests

## Out of Scope

- Habits module (Chunk 3)
- Connection between habits and tasks (Chunk 5)
- Recurring tasks (Phase V only)
- Task dependencies or subtasks (not in Phase 2 scope)
- File attachments to tasks (future enhancement)
- Task sharing or collaboration (future enhancement)
- Task templates or duplication (future enhancement)
- Advanced analytics or reporting (future enhancement)
- Email notifications for due dates (future enhancement)
- Integration with external calendars (future enhancement)

## Risks & Mitigations

1. **Risk**: Performance degradation with large task lists (1000+ tasks)
   - **Mitigation**: Implement pagination from the start, default 50 tasks per page, lazy loading for scroll

2. **Risk**: Complex filter/sort/search combinations causing slow queries
   - **Mitigation**: Database indexes on user_id, status, priority, due_date, created_at columns

3. **Risk**: Event emitter failure causing events to be lost
   - **Mitigation**: Document as known limitation in Phase 2, log errors, plan for durable event queue in Phase V

4. **Risk**: User enters malicious input in task fields (XSS, SQL injection)
   - **Mitigation**: Sanitize all inputs, use parameterized queries, validate on both frontend and backend

5. **Risk**: Mobile UI becomes cluttered with filters/sort controls
   - **Mitigation**: Collapsible filter panel, bottom sheet for mobile, show active filters as removable chips

## Mobile-First Requirements

- Task list cards must be touch-friendly with minimum 44×44px tap targets
- Filter and sort controls positioned in thumb-reachable zone (bottom 50% of screen on mobile)
- Task creation form uses mobile-optimized inputs:
  - `type="text"` with appropriate `autocomplete` for title
  - Date picker for due dates (native mobile date picker)
  - Tag input with autocomplete dropdown
- Loading states must be visible during API calls (spinners, skeleton screens)
- Error messages displayed as toast notifications or inline alerts
- Swipe gestures for quick actions (optional enhancement: swipe to complete, swipe to delete)
- Bottom navigation or floating action button for "Add Task" on mobile
- Responsive breakpoints: mobile (default) → tablet (768px+) → desktop (1024px+)

## Event Schema

All task events follow the constitution's event contract:

```json
{
  "user_id": "uuid",
  "timestamp": "ISO 8601 timestamp",
  "event_type": "TASK_CREATED | TASK_UPDATED | TASK_COMPLETED | TASK_DELETED",
  "payload": {
    "task_id": "uuid",
    "title": "string",
    "description": "string (optional)",
    "status": "pending | in_progress | completed",
    "priority": "high | medium | low | null",
    "tags": ["array", "of", "strings"],
    "due_date": "ISO 8601 timestamp or null",
    "completed": "boolean"
  }
}
```

**Event Emission Points**:
- TASK_CREATED: After successful POST /api/{user_id}/tasks
- TASK_UPDATED: After successful PATCH /api/{user_id}/tasks/{id}
- TASK_COMPLETED: After successful PATCH /api/{user_id}/tasks/{id}/complete
- TASK_DELETED: After successful DELETE /api/{user_id}/tasks/{id}

## Acceptance Criteria Summary

This feature is considered complete and ready for deployment when:

1. All 9 user stories have passing acceptance tests
2. Users can perform full CRUD operations on tasks (create, read, update, delete)
3. All filtering options work independently and in combination
4. Search matches both title and description case-insensitively
5. Sorting works correctly for all sort options
6. Task list is fully responsive on mobile, tablet, and desktop
7. All task events are emitted with correct schema
8. User isolation is verified (cross-user data leakage tests pass)
9. Performance benchmarks met (search <1s, operations <3s)
10. Edge cases handled gracefully with user-friendly error messages
11. Database migrations successfully create/modify tasks table
12. API endpoints return correct HTTP status codes and error messages
