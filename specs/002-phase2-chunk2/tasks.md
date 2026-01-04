# Tasks: Phase 2 Chunk 2 - Tasks Full Feature Set

**Input**: Design documents from `/specs/002-phase2-chunk2/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/tasks-api.yaml

**Tests**: This feature does not explicitly request TDD, so tests are included as integration verification tasks after implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Monorepo structure**: `apps/api/src/` (backend), `apps/web/src/` (frontend)
- **Backend**: Python 3.13+, FastAPI, SQLModel, Neon PostgreSQL
- **Frontend**: TypeScript 5.8+, Next.js 16+, TailwindCSS 4+, Radix UI

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and database schema preparation

- [ ] T001 Create database migration for tasks table using Alembic in apps/api/alembic/versions/002_create_tasks_table.py
- [ ] T002 [P] Install frontend dependencies (date-fns) in apps/web/package.json
- [ ] T003 Run database migration to create tasks table with all indexes and triggers

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core task infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Create Task SQLModel model in apps/api/src/models/task.py with all attributes (id, user_id, title, description, status, priority, tags, due_date, completed, timestamps)
- [ ] T005 [P] Create TaskService class skeleton in apps/api/src/services/task_service.py with EventEmitter dependency injection
- [ ] T006 [P] Create task API routes skeleton in apps/api/src/routes/tasks.py with FastAPI router
- [ ] T007 Register task routes in apps/api/src/main.py by importing and including tasks router
- [ ] T008 [P] Create Task TypeScript types in apps/web/src/types/task.ts (Task, TaskStatus, TaskPriority, TaskFilters)
- [ ] T009 [P] Create task API client functions in apps/web/src/lib/tasks-api.ts (getTasks, createTask, updateTask, completeTask, deleteTask)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create and View Tasks (Priority: P1) 🎯 MVP

**Goal**: Users can create tasks with title/description and view their task list with pagination

**Independent Test**: User can create a task titled "Write project proposal", see it in the task list, refresh the page, and verify the task persists. User B cannot see User A's tasks.

### Implementation for User Story 1

- [ ] T010 [P] [US1] Implement TaskService.create_task() method in apps/api/src/services/task_service.py with title validation, user_id assignment, and TASK_CREATED event emission
- [ ] T011 [P] [US1] Implement TaskService.get_tasks() method in apps/api/src/services/task_service.py with pagination (page, limit), user_id filtering, and basic sorting by created_at DESC
- [ ] T012 [US1] Implement POST /{user_id}/tasks endpoint in apps/api/src/routes/tasks.py with TaskCreate Pydantic model validation
- [ ] T013 [US1] Implement GET /{user_id}/tasks endpoint in apps/api/src/routes/tasks.py returning paginated task list with total count
- [ ] T014 [US1] Create TaskList Server Component in apps/web/src/app/tasks/page.tsx fetching tasks server-side with searchParams
- [ ] T015 [P] [US1] Create TaskCard component in apps/web/src/components/tasks/TaskCard.tsx displaying title, description, created_at
- [ ] T016 [US1] Create TaskForm component in apps/web/src/components/tasks/TaskForm.tsx with title (required) and description (optional) inputs
- [ ] T017 [US1] Create task creation page in apps/web/src/app/tasks/new/page.tsx with TaskForm and createTask API call

**Integration Verification**:
- [ ] T018 [US1] Verify user can create task via POST /api/{user_id}/tasks and receive 201 with task object
- [ ] T019 [US1] Verify user can view tasks via GET /api/{user_id}/tasks and see paginated results
- [ ] T020 [US1] Verify user isolation: User A cannot see User B's tasks (403 Forbidden test)
- [ ] T021 [US1] Verify task persistence: Create task, refresh browser, verify task still appears

**Checkpoint**: At this point, User Story 1 should be fully functional - users can create and view tasks with pagination

---

## Phase 4: User Story 2 - Update and Complete Tasks (Priority: P1)

**Goal**: Users can edit task details and mark tasks as completed to track progress

**Independent Test**: User edits task title from "Write proposal" to "Write comprehensive proposal", marks it complete, refreshes page, and verifies changes persisted. User can reopen completed tasks.

### Implementation for User Story 2

- [ ] T022 [P] [US2] Implement TaskService.update_task() method in apps/api/src/services/task_service.py with partial updates, updated_at timestamp, and TASK_UPDATED event emission
- [ ] T023 [P] [US2] Implement TaskService.mark_complete() method in apps/api/src/services/task_service.py setting status='completed', completed=true, and TASK_COMPLETED event emission
- [ ] T024 [US2] Implement PATCH /{user_id}/tasks/{task_id} endpoint in apps/api/src/routes/tasks.py with TaskUpdate Pydantic model
- [ ] T025 [US2] Implement PATCH /{user_id}/tasks/{task_id}/complete endpoint in apps/api/src/routes/tasks.py
- [ ] T026 [US2] Implement GET /{user_id}/tasks/{task_id} endpoint in apps/api/src/routes/tasks.py for task detail view
- [ ] T027 [US2] Create task detail/edit page in apps/web/src/app/tasks/[id]/page.tsx with TaskForm pre-filled for editing
- [ ] T028 [US2] Add "Mark Complete" button to TaskCard component in apps/web/src/components/tasks/TaskCard.tsx calling completeTask API
- [ ] T029 [US2] Add visual completed state to TaskCard in apps/web/src/components/tasks/TaskCard.tsx (strikethrough, badge, moved section)

**Integration Verification**:
- [ ] T030 [US2] Verify user can update task via PATCH /api/{user_id}/tasks/{task_id} and receive updated task object
- [ ] T031 [US2] Verify user can mark task complete via PATCH /api/{user_id}/tasks/{task_id}/complete and status changes to 'completed'
- [ ] T032 [US2] Verify user can reopen task by updating status back to 'pending' or 'in_progress'
- [ ] T033 [US2] Verify updates persist across page refreshes

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - users can create, view, edit, and complete tasks

---

## Phase 5: User Story 3 - Delete Tasks (Priority: P2)

**Goal**: Users can permanently remove tasks to keep their task list clean

**Independent Test**: User creates task "Call dentist", deletes it with confirmation, verifies it no longer appears in any view, and receives 404 when trying to access deleted task by ID.

### Implementation for User Story 3

- [ ] T034 [US3] Implement TaskService.delete_task() method in apps/api/src/services/task_service.py with hard delete and TASK_DELETED event emission
- [ ] T035 [US3] Implement DELETE /{user_id}/tasks/{task_id} endpoint in apps/api/src/routes/tasks.py returning 204 No Content
- [ ] T036 [US3] Add delete button with confirmation dialog to TaskCard component in apps/web/src/components/tasks/TaskCard.tsx
- [ ] T037 [US3] Implement deleteTask API call and optimistic UI update in TaskCard component

**Integration Verification**:
- [ ] T038 [US3] Verify user can delete task via DELETE /api/{user_id}/tasks/{task_id} and receive 204
- [ ] T039 [US3] Verify deleted task returns 404 when accessed via GET /api/{user_id}/tasks/{task_id}
- [ ] T040 [US3] Verify deleted task does not appear in task list

**Checkpoint**: At this point, full CRUD operations (Create, Read, Update, Delete) are complete

---

## Phase 6: User Story 4 - Prioritize Tasks (Priority: P2)

**Goal**: Users can assign priority levels (High, Medium, Low) to focus on important work

**Independent Test**: User sets task priority to "high", filters by priority "high", and sees only high-priority tasks. High-priority tasks have distinct visual indicator.

### Implementation for User Story 4

- [ ] T041 [US4] Add priority parameter to TaskService.create_task() and update_task() methods in apps/api/src/services/task_service.py with validation
- [ ] T042 [US4] Add priority filtering to TaskService.get_tasks() query in apps/api/src/services/task_service.py (WHERE priority = $priority)
- [ ] T043 [US4] Add priority query parameter to GET /{user_id}/tasks endpoint in apps/api/src/routes/tasks.py
- [ ] T044 [US4] Add priority select dropdown to TaskForm component in apps/web/src/components/tasks/TaskForm.tsx (options: High, Medium, Low, None)
- [ ] T045 [P] [US4] Create PriorityBadge component in apps/web/src/components/tasks/PriorityBadge.tsx with color-coded badges (red=high, yellow=medium, blue=low)
- [ ] T046 [US4] Add PriorityBadge to TaskCard component in apps/web/src/components/tasks/TaskCard.tsx
- [ ] T047 [US4] Create TaskFilters component in apps/web/src/components/tasks/TaskFilters.tsx with priority filter dropdown updating URL searchParams

**Integration Verification**:
- [ ] T048 [US4] Verify user can create task with priority via POST with priority field
- [ ] T049 [US4] Verify user can filter tasks by priority via GET /api/{user_id}/tasks?priority=high
- [ ] T050 [US4] Verify priority badge displays correct color and label for each priority level

**Checkpoint**: At this point, users can prioritize tasks and filter by priority

---

## Phase 7: User Story 5 - Add Due Dates to Tasks (Priority: P2)

**Goal**: Users can set deadlines on tasks and see overdue tasks highlighted

**Independent Test**: User sets due date to "January 10, 2026", views task list sorted by due date ascending, and sees overdue tasks (due date < today) highlighted in red with warning icon.

### Implementation for User Story 5

- [ ] T051 [US5] Add due_date parameter to TaskService.create_task() and update_task() methods in apps/api/src/services/task_service.py
- [ ] T052 [US5] Add due_date sorting to TaskService.get_tasks() query in apps/api/src/services/task_service.py (ORDER BY due_date ASC NULLS LAST)
- [ ] T053 [US5] Add sort query parameter to GET /{user_id}/tasks endpoint in apps/api/src/routes/tasks.py (created_desc, due_date_asc, due_date_desc, priority_asc)
- [ ] T054 [P] [US5] Install and configure date-fns library in apps/web for date formatting
- [ ] T055 [P] [US5] Create date utility functions in apps/web/src/lib/date-utils.ts (formatDueDate with "Today", "Tomorrow", "Overdue", "Due in X days" logic)
- [ ] T056 [US5] Add due_date date picker input to TaskForm component in apps/web/src/components/tasks/TaskForm.tsx (type="datetime-local")
- [ ] T057 [P] [US5] Create DueDateBadge component in apps/web/src/components/tasks/DueDateBadge.tsx with formatDueDate and overdue styling
- [ ] T058 [US5] Add DueDateBadge to TaskCard component in apps/web/src/components/tasks/TaskCard.tsx
- [ ] T059 [US5] Add sort dropdown to TaskFilters component in apps/web/src/components/tasks/TaskFilters.tsx (Created, Due Date, Priority options)

**Integration Verification**:
- [ ] T060 [US5] Verify user can create task with due_date via POST with ISO 8601 timestamp
- [ ] T061 [US5] Verify user can sort tasks by due date via GET /api/{user_id}/tasks?sort=due_date_asc
- [ ] T062 [US5] Verify overdue tasks (due_date < NOW() AND status != completed) are visually highlighted
- [ ] T063 [US5] Verify due dates display in human-readable format ("Today", "Tomorrow", "Due in 3 days", "Overdue")

**Checkpoint**: At this point, users can set due dates and see deadline awareness features

---

## Phase 8: User Story 6 - Tag and Categorize Tasks (Priority: P2)

**Goal**: Users can organize tasks with tags and filter by tag context

**Independent Test**: User adds tags "work, urgent, client" to a task, filters by tag "work", and sees only tasks with "work" tag. User gets autocomplete suggestions from existing tags.

### Implementation for User Story 6

- [ ] T064 [US6] Add tags parameter to TaskService.create_task() and update_task() methods in apps/api/src/services/task_service.py with validation (max 20 tags, trim whitespace)
- [ ] T065 [US6] Add tags filtering to TaskService.get_tasks() query in apps/api/src/services/task_service.py using PostgreSQL array overlap operator (tags && $tags::TEXT[])
- [ ] T066 [US6] Add tags query parameter to GET /{user_id}/tasks endpoint in apps/api/src/routes/tasks.py (comma-separated string converted to array)
- [ ] T067 [US6] Create GET /{user_id}/tasks/tags endpoint in apps/api/src/routes/tasks.py returning unique tags for autocomplete (SELECT DISTINCT unnest(tags))
- [ ] T068 [US6] Add tags input with autocomplete to TaskForm component in apps/web/src/components/tasks/TaskForm.tsx (comma-separated or multi-select)
- [ ] T069 [US6] Add tags display to TaskCard component in apps/web/src/components/tasks/TaskCard.tsx as colored badges
- [ ] T070 [US6] Add tag filter multi-select to TaskFilters component in apps/web/src/components/tasks/TaskFilters.tsx

**Integration Verification**:
- [ ] T071 [US6] Verify user can create task with tags array via POST
- [ ] T072 [US6] Verify user can filter tasks by tags via GET /api/{user_id}/tasks?tags=work,urgent (ANY match)
- [ ] T073 [US6] Verify autocomplete endpoint returns unique tags for user via GET /api/{user_id}/tasks/tags
- [ ] T074 [US6] Verify user can add/remove tags from task via PATCH

**Checkpoint**: At this point, users can organize tasks with tags and filter by context

---

## Phase 9: User Story 7 - Search Tasks (Priority: P3)

**Goal**: Users can quickly find tasks by searching titles and descriptions

**Independent Test**: User searches for "proposal" and sees both "Write proposal" and "Review proposal" tasks. Search matches case-insensitively in both title and description. Clear search shows all tasks again.

### Implementation for User Story 7

- [ ] T075 [US7] Add search filtering to TaskService.get_tasks() query in apps/api/src/services/task_service.py using PostgreSQL ILIKE operator (title ILIKE '%search%' OR description ILIKE '%search%')
- [ ] T076 [US7] Add search query parameter to GET /{user_id}/tasks endpoint in apps/api/src/routes/tasks.py
- [ ] T077 [P] [US7] Create TaskSearch component in apps/web/src/components/tasks/TaskSearch.tsx with debounced search input updating URL searchParams
- [ ] T078 [US7] Add TaskSearch component to tasks list page in apps/web/src/app/tasks/page.tsx
- [ ] T079 [US7] Add "No tasks found" empty state to TaskList component when search returns zero results

**Integration Verification**:
- [ ] T080 [US7] Verify user can search tasks via GET /api/{user_id}/tasks?search=proposal
- [ ] T081 [US7] Verify search matches case-insensitively in both title and description fields
- [ ] T082 [US7] Verify clearing search shows all tasks again
- [ ] T083 [US7] Verify search with special characters (quotes, backslashes) escapes properly

**Checkpoint**: At this point, users can search their task list

---

## Phase 10: User Story 8 - Filter Tasks by Status and Priority (Priority: P3)

**Goal**: Users can filter tasks by status and priority to focus on specific work

**Independent Test**: User filters by status="pending" AND priority="high", sees only pending high-priority tasks. User clears filters and sees all tasks. Completed tasks show completion timestamp.

### Implementation for User Story 8

- [ ] T084 [US8] Add status filtering to TaskService.get_tasks() query in apps/api/src/services/task_service.py (WHERE status = $status)
- [ ] T085 [US8] Add status query parameter to GET /{user_id}/tasks endpoint in apps/api/src/routes/tasks.py
- [ ] T086 [US8] Add status filter dropdown to TaskFilters component in apps/web/src/components/tasks/TaskFilters.tsx (Pending, In Progress, Completed, All)
- [ ] T087 [US8] Add "Clear All Filters" button to TaskFilters component in apps/web/src/components/tasks/TaskFilters.tsx
- [ ] T088 [US8] Display active filters as removable chips in TaskFilters component
- [ ] T089 [US8] Add completion timestamp display to TaskCard for completed tasks in apps/web/src/components/tasks/TaskCard.tsx

**Integration Verification**:
- [ ] T090 [US8] Verify user can filter by status via GET /api/{user_id}/tasks?status=pending
- [ ] T091 [US8] Verify user can combine filters via GET /api/{user_id}/tasks?status=pending&priority=high
- [ ] T092 [US8] Verify user can clear all filters and see all tasks
- [ ] T093 [US8] Verify completed tasks display completion timestamp (updated_at when status=completed)

**Checkpoint**: At this point, users can filter tasks by multiple criteria simultaneously

---

## Phase 11: User Story 9 - Sort Tasks (Priority: P3)

**Goal**: Users can sort tasks by different criteria to organize their view

**Independent Test**: User sorts by "Due date (ascending)" and sees tasks with earliest due dates first, tasks without due dates last. User sorts by "Priority (high to low)" and sees high, medium, low, no priority order.

### Implementation for User Story 9

- [ ] T094 [US9] Add priority sorting to TaskService.get_tasks() using PostgreSQL CASE expression in apps/api/src/services/task_service.py (high=1, medium=2, low=3, null=4)
- [ ] T095 [US9] Update sort query parameter to support all sort options in GET /{user_id}/tasks endpoint (created_desc, created_asc, due_date_asc, due_date_desc, priority_asc, priority_desc)
- [ ] T096 [US9] Verify sort dropdown in TaskFilters component includes all sort options
- [ ] T097 [US9] Add sort indicator to task list showing current sort order in apps/web/src/app/tasks/page.tsx

**Integration Verification**:
- [ ] T098 [US9] Verify sorting by due_date_asc places nearest due dates first, nulls last via GET /api/{user_id}/tasks?sort=due_date_asc
- [ ] T099 [US9] Verify sorting by created_desc (newest first) via GET /api/{user_id}/tasks?sort=created_desc
- [ ] T100 [US9] Verify sorting by priority_asc orders high, medium, low, null via GET /api/{user_id}/tasks?sort=priority_asc
- [ ] T101 [US9] Verify combining sort with filters works correctly (e.g., ?status=pending&sort=due_date_asc)

**Checkpoint**: At this point, all 9 user stories are complete - full task management system delivered

---

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and production readiness

- [ ] T102 [P] Add loading states (skeletons, spinners) to all async operations in apps/web/src/components/tasks/
- [ ] T103 [P] Add error handling and toast notifications for API failures in apps/web/src/components/tasks/
- [ ] T104 [P] Implement mobile-responsive layout with 44×44px touch targets in TaskCard and TaskFilters components
- [ ] T105 [P] Add bottom sheet for mobile filters in apps/web/src/components/tasks/TaskFilters.tsx
- [ ] T106 [P] Optimize TaskList component for 1000+ tasks with virtual scrolling or pagination UI
- [ ] T107 Add comprehensive API error messages with validation details in apps/api/src/routes/tasks.py
- [ ] T108 [P] Add backend logging for all task service operations in apps/api/src/services/task_service.py
- [ ] T109 Verify all database indexes exist and are used by queries via EXPLAIN ANALYZE
- [ ] T110 Run performance benchmarks: search <1s for 1000 tasks, API <200ms p95
- [ ] T111 [P] Create empty state UI for new users with no tasks in apps/web/src/app/tasks/page.tsx
- [ ] T112 [P] Add pagination UI controls (prev/next, page numbers) to TaskList component
- [ ] T113 Run security audit: SQL injection prevention (parameterized queries), XSS prevention (sanitized inputs), user isolation tests
- [ ] T114 Run quickstart.md validation: Verify all code examples work end-to-end
- [ ] T115 Update API documentation (OpenAPI schema) and generate client code if needed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-11)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 12)**: Depends on all user stories being complete

### User Story Dependencies

All user stories are designed to be independent after Foundational phase:

- **US1 (Create and View)**: Can start after Foundational - No dependencies on other stories
- **US2 (Update and Complete)**: Can start after Foundational - Builds on US1 but independently testable
- **US3 (Delete)**: Can start after Foundational - Independent of US1/US2
- **US4 (Priorities)**: Can start after Foundational - Independent, adds priority field
- **US5 (Due Dates)**: Can start after Foundational - Independent, adds due_date field
- **US6 (Tags)**: Can start after Foundational - Independent, adds tags field
- **US7 (Search)**: Can start after Foundational - Independent query enhancement
- **US8 (Filter)**: Can start after Foundational - Independent query enhancement
- **US9 (Sort)**: Can start after Foundational - Independent query enhancement

### Within Each User Story

- Backend implementation (service methods) before API endpoints
- API endpoints before frontend components
- Core components before UI enhancements
- Implementation before integration verification
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1 (Setup)**: T002 can run in parallel with T001
- **Phase 2 (Foundational)**: T005, T006, T008, T009 can all run in parallel after T004
- **Within User Stories**: Tasks marked [P] can run in parallel (different files, no dependencies)
- **Across User Stories**: After Foundational phase, multiple user stories can be worked on simultaneously by different team members

---

## Parallel Example: User Story 1

```bash
# After completing foundation, these tasks can run in parallel:
Task T010: "Implement TaskService.create_task() in apps/api/src/services/task_service.py"
Task T011: "Implement TaskService.get_tasks() in apps/api/src/services/task_service.py"

# After backend services, these can run in parallel:
Task T015: "Create TaskCard component in apps/web/src/components/tasks/TaskCard.tsx"
Task T016: "Create TaskForm component in apps/web/src/components/tasks/TaskForm.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only - Core CRUD)

1. ✅ Complete Phase 1: Setup (database migration)
2. ✅ Complete Phase 2: Foundational (models, services skeleton, routes skeleton)
3. ✅ Complete Phase 3: User Story 1 (Create and View)
4. ✅ Complete Phase 4: User Story 2 (Update and Complete)
5. **STOP and VALIDATE**: Test full CRUD independently
6. Deploy/demo MVP

### Incremental Delivery (P1 → P2 → P3)

1. Complete Setup + Foundational → Foundation ready
2. Add US1 + US2 → Test CRUD independently → Deploy (MVP!)
3. Add US3 (Delete) → Test full CRUD → Deploy
4. Add US4 + US5 (Priorities + Due Dates) → Test organization features → Deploy
5. Add US6 (Tags) → Test categorization → Deploy
6. Add US7 + US8 + US9 (Search + Filter + Sort) → Test discovery features → Deploy
7. Polish → Production ready

### Parallel Team Strategy

With 3 developers after Foundational phase:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - **Developer A**: US1 + US2 (CRUD - highest priority)
   - **Developer B**: US4 + US5 (Priorities + Due Dates)
   - **Developer C**: US6 (Tags)
3. Then:
   - **Developer A**: US7 (Search)
   - **Developer B**: US8 (Filter)
   - **Developer C**: US9 (Sort)
4. **Developer A**: US3 (Delete - can be done last)
5. All developers: Polish phase together

---

## Task Summary

**Total Tasks**: 115 tasks across 12 phases

**Breakdown by Phase**:
- Phase 1 (Setup): 3 tasks
- Phase 2 (Foundational): 6 tasks
- Phase 3 (US1 - Create/View): 12 tasks
- Phase 4 (US2 - Update/Complete): 12 tasks
- Phase 5 (US3 - Delete): 7 tasks
- Phase 6 (US4 - Priorities): 10 tasks
- Phase 7 (US5 - Due Dates): 13 tasks
- Phase 8 (US6 - Tags): 11 tasks
- Phase 9 (US7 - Search): 9 tasks
- Phase 10 (US8 - Filter): 10 tasks
- Phase 11 (US9 - Sort): 8 tasks
- Phase 12 (Polish): 14 tasks

**Breakdown by User Story**:
- US1 (Create/View - P1): 12 tasks
- US2 (Update/Complete - P1): 12 tasks
- US3 (Delete - P2): 7 tasks
- US4 (Priorities - P2): 10 tasks
- US5 (Due Dates - P2): 13 tasks
- US6 (Tags - P2): 11 tasks
- US7 (Search - P3): 9 tasks
- US8 (Filter - P3): 10 tasks
- US9 (Sort - P3): 8 tasks

**Parallel Opportunities Identified**: 28 tasks marked [P] can run in parallel within their phases

**Independent Test Criteria**:
- ✅ US1: User can create and view tasks with pagination
- ✅ US2: User can edit and complete tasks
- ✅ US3: User can delete tasks permanently
- ✅ US4: User can set priorities and filter by priority
- ✅ US5: User can set due dates and see overdue highlights
- ✅ US6: User can add tags and filter by tags
- ✅ US7: User can search tasks by keyword
- ✅ US8: User can filter by status and priority simultaneously
- ✅ US9: User can sort tasks by multiple criteria

**Suggested MVP Scope**: Phase 1 + Phase 2 + Phase 3 (US1) + Phase 4 (US2) = Full CRUD (24 tasks)

**Format Validation**: ✅ All tasks follow checklist format with checkbox, ID, optional [P] and [Story] labels, and file paths

---

## Notes

- [P] tasks = different files, no dependencies - safe to parallelize
- [Story] label maps task to specific user story for traceability (US1-US9)
- Each user story should be independently completable and testable
- Integration verification tasks ensure acceptance criteria from spec.md are met
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Mobile-first responsive design enforced in Phase 12 polish tasks
- Event emission (TASK_CREATED, TASK_UPDATED, TASK_COMPLETED, TASK_DELETED) implemented in service methods
- User isolation enforced via user_id filtering and authentication middleware
- Performance targets: <1s search, <200ms API p95, 1000 tasks per user scalability
