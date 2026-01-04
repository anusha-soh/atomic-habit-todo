# Tasks: Phase 2 Chunk 2 - Tasks Full Feature Set

**Input**: Design documents from `/specs/002-phase2-chunk2/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/tasks-api.yaml

**Tests**: Full TDD (Test-Driven Development) approach following Constitution Principle X. Tests are written BEFORE implementation and must FAIL before code is written.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Monorepo structure**: `apps/api/src/` (backend), `apps/web/src/` (frontend)
- **Backend**: Python 3.13+, FastAPI, SQLModel, Neon PostgreSQL
- **Frontend**: TypeScript 5.8+, Next.js 16+, TailwindCSS 4+, Radix UI
- **Backend Tests**: `apps/api/tests/` (unit/, contract/, integration/)
- **Frontend Tests**: `apps/web/tests/` (unit/, integration/)

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

### Core Models and Services

- [ ] T004 Create Task SQLModel model in apps/api/src/models/task.py with all attributes (id, user_id, title, description, status, priority, tags, due_date, completed, timestamps)
- [ ] T005 [P] Create TaskService class skeleton in apps/api/src/services/task_service.py with EventEmitter dependency injection
- [ ] T006 [P] Create task API routes skeleton in apps/api/src/routes/tasks.py with FastAPI router
- [ ] T007 Register task routes in apps/api/src/main.py by importing and including tasks router
- [ ] T008 [P] Create Task TypeScript types in apps/web/src/types/task.ts (Task, TaskStatus, TaskPriority, TaskFilters)
- [ ] T009 [P] Create task API client functions in apps/web/src/lib/tasks-api.ts (getTasks, createTask, updateTask, completeTask, deleteTask)

### Test Infrastructure Setup

- [ ] T010 Create pytest configuration in apps/api/pytest.ini with coverage settings and test markers
- [ ] T011 Create test fixtures in apps/api/tests/conftest.py (database session, event emitter mock, authenticated user)
- [ ] T012 [P] Create Vitest configuration in apps/web/vitest.config.ts for frontend unit tests
- [ ] T013 [P] Create React Testing Library setup in apps/web/tests/setup.ts with custom render utilities
- [ ] T014 [P] Install testing dependencies (pytest, pytest-cov, pytest-asyncio, httpx) in apps/api/pyproject.toml
- [ ] T015 [P] Install frontend testing dependencies (vitest, @testing-library/react, @testing-library/user-event) in apps/web/package.json

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create and View Tasks (Priority: P1) 🎯 MVP

**Goal**: Users can create tasks with title/description and view their task list with pagination

**Independent Test**: User can create a task titled "Write project proposal", see it in the task list, refresh the page, and verify the task persists. User B cannot see User A's tasks.

### Tests for User Story 1 (TDD - Write First, Ensure FAIL) ⚠️

**Contract Tests** (API schema validation):
- [ ] T016 [P] [US1] Write contract test for POST /api/{user_id}/tasks in apps/api/tests/contract/test_tasks_contract.py verifying request/response match OpenAPI schema (should FAIL)
- [ ] T017 [P] [US1] Write contract test for GET /api/{user_id}/tasks in apps/api/tests/contract/test_tasks_contract.py verifying pagination response schema (should FAIL)

**Unit Tests** (business logic):
- [ ] T018 [P] [US1] Write unit test for TaskService.create_task() in apps/api/tests/unit/test_task_service.py testing title validation, event emission (should FAIL)
- [ ] T019 [P] [US1] Write unit test for TaskService.get_tasks() in apps/api/tests/unit/test_task_service.py testing pagination logic (should FAIL)
- [ ] T020 [P] [US1] Write unit test for Task model validation in apps/api/tests/unit/test_task_model.py testing title not empty, max length constraints (should FAIL)
- [ ] T021 [P] [US1] Write unit test for TaskCard component in apps/web/tests/unit/TaskCard.test.tsx testing rendering of title, description (should FAIL)
- [ ] T022 [P] [US1] Write unit test for TaskForm component in apps/web/tests/unit/TaskForm.test.tsx testing title validation, submission (should FAIL)

**Integration Tests** (end-to-end workflows):
- [ ] T023 [US1] Write integration test for task creation workflow in apps/api/tests/integration/test_tasks_api.py testing POST creates task in DB and emits event (should FAIL)
- [ ] T024 [US1] Write integration test for user isolation in apps/api/tests/integration/test_tasks_api.py verifying User A cannot access User B's tasks (should FAIL)

### Implementation for User Story 1 (Make Tests PASS - GREEN)

- [ ] T025 [P] [US1] Implement TaskService.create_task() method in apps/api/src/services/task_service.py with title validation, user_id assignment, and TASK_CREATED event emission
- [ ] T026 [P] [US1] Implement TaskService.get_tasks() method in apps/api/src/services/task_service.py with pagination (page, limit), user_id filtering, and basic sorting by created_at DESC
- [ ] T027 [US1] Implement POST /{user_id}/tasks endpoint in apps/api/src/routes/tasks.py with TaskCreate Pydantic model validation
- [ ] T028 [US1] Implement GET /{user_id}/tasks endpoint in apps/api/src/routes/tasks.py returning paginated task list with total count
- [ ] T029 [US1] Create TaskList Server Component in apps/web/src/app/tasks/page.tsx fetching tasks server-side with searchParams
- [ ] T030 [P] [US1] Create TaskCard component in apps/web/src/components/tasks/TaskCard.tsx displaying title, description, created_at
- [ ] T031 [US1] Create TaskForm component in apps/web/src/components/tasks/TaskForm.tsx with title (required) and description (optional) inputs
- [ ] T032 [US1] Create task creation page in apps/web/src/app/tasks/new/page.tsx with TaskForm and createTask API call

### Verification for User Story 1 (Manual/Integration Checks)

- [ ] T033 [US1] Run all US1 tests and verify they PASS (pytest apps/api/tests/ -k US1)
- [ ] T034 [US1] Verify user can create task via POST /api/{user_id}/tasks and receive 201 with task object
- [ ] T035 [US1] Verify user can view tasks via GET /api/{user_id}/tasks and see paginated results
- [ ] T036 [US1] Verify task persistence: Create task, refresh browser, verify task still appears

**Checkpoint**: At this point, User Story 1 should be fully functional with all tests passing

---

## Phase 4: User Story 2 - Update and Complete Tasks (Priority: P1)

**Goal**: Users can edit task details and mark tasks as completed to track progress

**Independent Test**: User edits task title from "Write proposal" to "Write comprehensive proposal", marks it complete, refreshes page, and verifies changes persisted. User can reopen completed tasks.

### Tests for User Story 2 (TDD - Write First, Ensure FAIL) ⚠️

**Contract Tests**:
- [ ] T037 [P] [US2] Write contract test for PATCH /api/{user_id}/tasks/{task_id} in apps/api/tests/contract/test_tasks_contract.py verifying partial update schema (should FAIL)
- [ ] T038 [P] [US2] Write contract test for PATCH /api/{user_id}/tasks/{task_id}/complete in apps/api/tests/contract/test_tasks_contract.py (should FAIL)
- [ ] T039 [P] [US2] Write contract test for GET /api/{user_id}/tasks/{task_id} in apps/api/tests/contract/test_tasks_contract.py verifying task detail schema (should FAIL)

**Unit Tests**:
- [ ] T040 [P] [US2] Write unit test for TaskService.update_task() in apps/api/tests/unit/test_task_service.py testing partial updates, updated_at timestamp (should FAIL)
- [ ] T041 [P] [US2] Write unit test for TaskService.mark_complete() in apps/api/tests/unit/test_task_service.py testing status change, TASK_COMPLETED event (should FAIL)
- [ ] T042 [P] [US2] Write unit test for task status transitions in apps/api/tests/unit/test_task_model.py testing pending→completed, completed→pending (should FAIL)

**Integration Tests**:
- [ ] T043 [US2] Write integration test for task update workflow in apps/api/tests/integration/test_tasks_api.py testing PATCH updates DB and emits event (should FAIL)
- [ ] T044 [US2] Write integration test for task completion in apps/api/tests/integration/test_tasks_api.py testing mark complete and reopen (should FAIL)

### Implementation for User Story 2 (Make Tests PASS - GREEN)

- [ ] T045 [P] [US2] Implement TaskService.update_task() method in apps/api/src/services/task_service.py with partial updates, updated_at timestamp, and TASK_UPDATED event emission
- [ ] T046 [P] [US2] Implement TaskService.mark_complete() method in apps/api/src/services/task_service.py setting status='completed', completed=true, and TASK_COMPLETED event emission
- [ ] T047 [US2] Implement PATCH /{user_id}/tasks/{task_id} endpoint in apps/api/src/routes/tasks.py with TaskUpdate Pydantic model
- [ ] T048 [US2] Implement PATCH /{user_id}/tasks/{task_id}/complete endpoint in apps/api/src/routes/tasks.py
- [ ] T049 [US2] Implement GET /{user_id}/tasks/{task_id} endpoint in apps/api/src/routes/tasks.py for task detail view
- [ ] T050 [US2] Create task detail/edit page in apps/web/src/app/tasks/[id]/page.tsx with TaskForm pre-filled for editing
- [ ] T051 [US2] Add "Mark Complete" button to TaskCard component in apps/web/src/components/tasks/TaskCard.tsx calling completeTask API
- [ ] T052 [US2] Add visual completed state to TaskCard in apps/web/src/components/tasks/TaskCard.tsx (strikethrough, badge, moved section)

### Verification for User Story 2

- [ ] T053 [US2] Run all US2 tests and verify they PASS (pytest apps/api/tests/ -k US2)
- [ ] T054 [US2] Verify user can update task and changes persist across page refreshes
- [ ] T055 [US2] Verify user can reopen task by updating status back to 'pending' or 'in_progress'

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - users can create, view, edit, and complete tasks

---

## Phase 5: User Story 3 - Delete Tasks (Priority: P2)

**Goal**: Users can permanently remove tasks to keep their task list clean

**Independent Test**: User creates task "Call dentist", deletes it with confirmation, verifies it no longer appears in any view, and receives 404 when trying to access deleted task by ID.

### Tests for User Story 3 (TDD - Write First, Ensure FAIL) ⚠️

**Contract Tests**:
- [ ] T056 [P] [US3] Write contract test for DELETE /api/{user_id}/tasks/{task_id} in apps/api/tests/contract/test_tasks_contract.py verifying 204 response (should FAIL)

**Unit Tests**:
- [ ] T057 [P] [US3] Write unit test for TaskService.delete_task() in apps/api/tests/unit/test_task_service.py testing hard delete and TASK_DELETED event (should FAIL)

**Integration Tests**:
- [ ] T058 [US3] Write integration test for task deletion in apps/api/tests/integration/test_tasks_api.py testing DELETE removes from DB and emits event (should FAIL)
- [ ] T059 [US3] Write integration test for deleted task 404 in apps/api/tests/integration/test_tasks_api.py testing GET after DELETE returns 404 (should FAIL)

### Implementation for User Story 3 (Make Tests PASS - GREEN)

- [ ] T060 [US3] Implement TaskService.delete_task() method in apps/api/src/services/task_service.py with hard delete and TASK_DELETED event emission
- [ ] T061 [US3] Implement DELETE /{user_id}/tasks/{task_id} endpoint in apps/api/src/routes/tasks.py returning 204 No Content
- [ ] T062 [US3] Add delete button with confirmation dialog to TaskCard component in apps/web/src/components/tasks/TaskCard.tsx
- [ ] T063 [US3] Implement deleteTask API call and optimistic UI update in TaskCard component

### Verification for User Story 3

- [ ] T064 [US3] Run all US3 tests and verify they PASS (pytest apps/api/tests/ -k US3)
- [ ] T065 [US3] Verify deleted task does not appear in task list and returns 404 when accessed

**Checkpoint**: At this point, full CRUD operations (Create, Read, Update, Delete) are complete with all tests passing

---

## Phase 6: User Story 4 - Prioritize Tasks (Priority: P2)

**Goal**: Users can assign priority levels (High, Medium, Low) to focus on important work

**Independent Test**: User sets task priority to "high", filters by priority "high", and sees only high-priority tasks. High-priority tasks have distinct visual indicator.

### Tests for User Story 4 (TDD - Write First, Ensure FAIL) ⚠️

**Unit Tests**:
- [ ] T066 [P] [US4] Write unit test for Task model priority validation in apps/api/tests/unit/test_task_model.py testing enum values (high/medium/low/null) (should FAIL)
- [ ] T067 [P] [US4] Write unit test for TaskService priority filtering in apps/api/tests/unit/test_task_service.py testing WHERE priority = X (should FAIL)
- [ ] T068 [P] [US4] Write unit test for PriorityBadge component in apps/web/tests/unit/PriorityBadge.test.tsx testing color-coded rendering (should FAIL)

**Integration Tests**:
- [ ] T069 [US4] Write integration test for priority filtering in apps/api/tests/integration/test_tasks_api.py testing GET ?priority=high returns only high-priority tasks (should FAIL)

### Implementation for User Story 4 (Make Tests PASS - GREEN)

- [ ] T070 [US4] Add priority parameter to TaskService.create_task() and update_task() methods in apps/api/src/services/task_service.py with validation
- [ ] T071 [US4] Add priority filtering to TaskService.get_tasks() query in apps/api/src/services/task_service.py (WHERE priority = $priority)
- [ ] T072 [US4] Add priority query parameter to GET /{user_id}/tasks endpoint in apps/api/src/routes/tasks.py
- [ ] T073 [US4] Add priority select dropdown to TaskForm component in apps/web/src/components/tasks/TaskForm.tsx (options: High, Medium, Low, None)
- [ ] T074 [P] [US4] Create PriorityBadge component in apps/web/src/components/tasks/PriorityBadge.tsx with color-coded badges (red=high, yellow=medium, blue=low)
- [ ] T075 [US4] Add PriorityBadge to TaskCard component in apps/web/src/components/tasks/TaskCard.tsx
- [ ] T076 [US4] Create TaskFilters component in apps/web/src/components/tasks/TaskFilters.tsx with priority filter dropdown updating URL searchParams

### Verification for User Story 4

- [ ] T077 [US4] Run all US4 tests and verify they PASS (pytest apps/api/tests/ -k US4)
- [ ] T078 [US4] Verify priority badge displays correct color and label for each priority level

**Checkpoint**: At this point, users can prioritize tasks and filter by priority

---

## Phase 7: User Story 5 - Add Due Dates to Tasks (Priority: P2)

**Goal**: Users can set deadlines on tasks and see overdue tasks highlighted

**Independent Test**: User sets due date to "January 10, 2026", views task list sorted by due date ascending, and sees overdue tasks (due date < today) highlighted in red with warning icon.

### Tests for User Story 5 (TDD - Write First, Ensure FAIL) ⚠️

**Unit Tests**:
- [ ] T079 [P] [US5] Write unit test for due_date sorting in apps/api/tests/unit/test_task_service.py testing ORDER BY due_date ASC NULLS LAST (should FAIL)
- [ ] T080 [P] [US5] Write unit test for formatDueDate utility in apps/web/tests/unit/date-utils.test.ts testing "Today", "Tomorrow", "Overdue" logic (should FAIL)
- [ ] T081 [P] [US5] Write unit test for overdue detection in apps/web/tests/unit/date-utils.test.ts testing isPast && status != completed (should FAIL)
- [ ] T082 [P] [US5] Write unit test for DueDateBadge component in apps/web/tests/unit/DueDateBadge.test.tsx testing overdue styling (should FAIL)

**Integration Tests**:
- [ ] T083 [US5] Write integration test for due_date sorting in apps/api/tests/integration/test_tasks_api.py testing GET ?sort=due_date_asc (should FAIL)

### Implementation for User Story 5 (Make Tests PASS - GREEN)

- [ ] T084 [US5] Add due_date parameter to TaskService.create_task() and update_task() methods in apps/api/src/services/task_service.py
- [ ] T085 [US5] Add due_date sorting to TaskService.get_tasks() query in apps/api/src/services/task_service.py (ORDER BY due_date ASC NULLS LAST)
- [ ] T086 [US5] Add sort query parameter to GET /{user_id}/tasks endpoint in apps/api/src/routes/tasks.py (created_desc, due_date_asc, due_date_desc, priority_asc)
- [ ] T087 [P] [US5] Install and configure date-fns library in apps/web for date formatting
- [ ] T088 [P] [US5] Create date utility functions in apps/web/src/lib/date-utils.ts (formatDueDate with "Today", "Tomorrow", "Overdue", "Due in X days" logic)
- [ ] T089 [US5] Add due_date date picker input to TaskForm component in apps/web/src/components/tasks/TaskForm.tsx (type="datetime-local")
- [ ] T090 [P] [US5] Create DueDateBadge component in apps/web/src/components/tasks/DueDateBadge.tsx with formatDueDate and overdue styling
- [ ] T091 [US5] Add DueDateBadge to TaskCard component in apps/web/src/components/tasks/TaskCard.tsx
- [ ] T092 [US5] Add sort dropdown to TaskFilters component in apps/web/src/components/tasks/TaskFilters.tsx (Created, Due Date, Priority options)

### Verification for User Story 5

- [ ] T093 [US5] Run all US5 tests and verify they PASS (pytest apps/api/tests/ -k US5)
- [ ] T094 [US5] Verify overdue tasks are visually highlighted with red text and warning icon
- [ ] T095 [US5] Verify due dates display in human-readable format ("Today", "Tomorrow", "Due in 3 days", "Overdue")

**Checkpoint**: At this point, users can set due dates and see deadline awareness features

---

## Phase 8: User Story 6 - Tag and Categorize Tasks (Priority: P2)

**Goal**: Users can organize tasks with tags and filter by tag context

**Independent Test**: User adds tags "work, urgent, client" to a task, filters by tag "work", and sees only tasks with "work" tag. User gets autocomplete suggestions from existing tags.

### Tests for User Story 6 (TDD - Write First, Ensure FAIL) ⚠️

**Unit Tests**:
- [ ] T096 [P] [US6] Write unit test for Task model tags validation in apps/api/tests/unit/test_task_model.py testing max 20 tags, trim whitespace (should FAIL)
- [ ] T097 [P] [US6] Write unit test for TaskService tags filtering in apps/api/tests/unit/test_task_service.py testing PostgreSQL && operator (should FAIL)
- [ ] T098 [P] [US6] Write unit test for tags autocomplete query in apps/api/tests/unit/test_task_service.py testing DISTINCT unnest(tags) (should FAIL)

**Integration Tests**:
- [ ] T099 [US6] Write integration test for tag filtering in apps/api/tests/integration/test_tasks_api.py testing GET ?tags=work,urgent matches ANY (should FAIL)
- [ ] T100 [US6] Write integration test for tags autocomplete endpoint in apps/api/tests/integration/test_tasks_api.py testing GET /tasks/tags returns unique tags (should FAIL)

### Implementation for User Story 6 (Make Tests PASS - GREEN)

- [ ] T101 [US6] Add tags parameter to TaskService.create_task() and update_task() methods in apps/api/src/services/task_service.py with validation (max 20 tags, trim whitespace)
- [ ] T102 [US6] Add tags filtering to TaskService.get_tasks() query in apps/api/src/services/task_service.py using PostgreSQL array overlap operator (tags && $tags::TEXT[])
- [ ] T103 [US6] Add tags query parameter to GET /{user_id}/tasks endpoint in apps/api/src/routes/tasks.py (comma-separated string converted to array)
- [ ] T104 [US6] Create GET /{user_id}/tasks/tags endpoint in apps/api/src/routes/tasks.py returning unique tags for autocomplete (SELECT DISTINCT unnest(tags))
- [ ] T105 [US6] Add tags input with autocomplete to TaskForm component in apps/web/src/components/tasks/TaskForm.tsx (comma-separated or multi-select)
- [ ] T106 [US6] Add tags display to TaskCard component in apps/web/src/components/tasks/TaskCard.tsx as colored badges
- [ ] T107 [US6] Add tag filter multi-select to TaskFilters component in apps/web/src/components/tasks/TaskFilters.tsx

### Verification for User Story 6

- [ ] T108 [US6] Run all US6 tests and verify they PASS (pytest apps/api/tests/ -k US6)
- [ ] T109 [US6] Verify autocomplete endpoint returns unique tags for user via GET /api/{user_id}/tasks/tags
- [ ] T110 [US6] Verify user can add/remove tags from task via PATCH

**Checkpoint**: At this point, users can organize tasks with tags and filter by context

---

## Phase 9: User Story 7 - Search Tasks (Priority: P3)

**Goal**: Users can quickly find tasks by searching titles and descriptions

**Independent Test**: User searches for "proposal" and sees both "Write proposal" and "Review proposal" tasks. Search matches case-insensitively in both title and description. Clear search shows all tasks again.

### Tests for User Story 7 (TDD - Write First, Ensure FAIL) ⚠️

**Unit Tests**:
- [ ] T111 [P] [US7] Write unit test for search query in apps/api/tests/unit/test_task_service.py testing ILIKE with title OR description (should FAIL)
- [ ] T112 [P] [US7] Write unit test for search special characters in apps/api/tests/unit/test_task_service.py testing proper escaping of quotes, backslashes (should FAIL)

**Integration Tests**:
- [ ] T113 [US7] Write integration test for search in apps/api/tests/integration/test_tasks_api.py testing GET ?search=proposal matches both title and description (should FAIL)
- [ ] T114 [US7] Write integration test for case-insensitive search in apps/api/tests/integration/test_tasks_api.py testing uppercase/lowercase/mixed case (should FAIL)

### Implementation for User Story 7 (Make Tests PASS - GREEN)

- [ ] T115 [US7] Add search filtering to TaskService.get_tasks() query in apps/api/src/services/task_service.py using PostgreSQL ILIKE operator (title ILIKE '%search%' OR description ILIKE '%search%')
- [ ] T116 [US7] Add search query parameter to GET /{user_id}/tasks endpoint in apps/api/src/routes/tasks.py
- [ ] T117 [P] [US7] Create TaskSearch component in apps/web/src/components/tasks/TaskSearch.tsx with debounced search input updating URL searchParams
- [ ] T118 [US7] Add TaskSearch component to tasks list page in apps/web/src/app/tasks/page.tsx
- [ ] T119 [US7] Add "No tasks found" empty state to TaskList component when search returns zero results

### Verification for User Story 7

- [ ] T120 [US7] Run all US7 tests and verify they PASS (pytest apps/api/tests/ -k US7)
- [ ] T121 [US7] Verify clearing search shows all tasks again
- [ ] T122 [US7] Verify search with special characters escapes properly

**Checkpoint**: At this point, users can search their task list

---

## Phase 10: User Story 8 - Filter Tasks by Status and Priority (Priority: P3)

**Goal**: Users can filter tasks by status and priority to focus on specific work

**Independent Test**: User filters by status="pending" AND priority="high", sees only pending high-priority tasks. User clears filters and sees all tasks. Completed tasks show completion timestamp.

### Tests for User Story 8 (TDD - Write First, Ensure FAIL) ⚠️

**Unit Tests**:
- [ ] T123 [P] [US8] Write unit test for status filtering in apps/api/tests/unit/test_task_service.py testing WHERE status = X (should FAIL)
- [ ] T124 [P] [US8] Write unit test for combined filters in apps/api/tests/unit/test_task_service.py testing status AND priority simultaneously (should FAIL)

**Integration Tests**:
- [ ] T125 [US8] Write integration test for status filtering in apps/api/tests/integration/test_tasks_api.py testing GET ?status=pending (should FAIL)
- [ ] T126 [US8] Write integration test for combined filters in apps/api/tests/integration/test_tasks_api.py testing GET ?status=pending&priority=high (should FAIL)

### Implementation for User Story 8 (Make Tests PASS - GREEN)

- [ ] T127 [US8] Add status filtering to TaskService.get_tasks() query in apps/api/src/services/task_service.py (WHERE status = $status)
- [ ] T128 [US8] Add status query parameter to GET /{user_id}/tasks endpoint in apps/api/src/routes/tasks.py
- [ ] T129 [US8] Add status filter dropdown to TaskFilters component in apps/web/src/components/tasks/TaskFilters.tsx (Pending, In Progress, Completed, All)
- [ ] T130 [US8] Add "Clear All Filters" button to TaskFilters component in apps/web/src/components/tasks/TaskFilters.tsx
- [ ] T131 [US8] Display active filters as removable chips in TaskFilters component
- [ ] T132 [US8] Add completion timestamp display to TaskCard for completed tasks in apps/web/src/components/tasks/TaskCard.tsx

### Verification for User Story 8

- [ ] T133 [US8] Run all US8 tests and verify they PASS (pytest apps/api/tests/ -k US8)
- [ ] T134 [US8] Verify user can clear all filters and see all tasks
- [ ] T135 [US8] Verify completed tasks display completion timestamp

**Checkpoint**: At this point, users can filter tasks by multiple criteria simultaneously

---

## Phase 11: User Story 9 - Sort Tasks (Priority: P3)

**Goal**: Users can sort tasks by different criteria to organize their view

**Independent Test**: User sorts by "Due date (ascending)" and sees tasks with earliest due dates first, tasks without due dates last. User sorts by "Priority (high to low)" and sees high, medium, low, no priority order.

### Tests for User Story 9 (TDD - Write First, Ensure FAIL) ⚠️

**Unit Tests**:
- [ ] T136 [P] [US9] Write unit test for priority sorting in apps/api/tests/unit/test_task_service.py testing CASE expression (high=1, medium=2, low=3, null=4) (should FAIL)
- [ ] T137 [P] [US9] Write unit test for combined sort with filters in apps/api/tests/unit/test_task_service.py testing ?status=pending&sort=due_date_asc (should FAIL)

**Integration Tests**:
- [ ] T138 [US9] Write integration test for priority sorting in apps/api/tests/integration/test_tasks_api.py testing GET ?sort=priority_asc returns high, medium, low, null order (should FAIL)
- [ ] T139 [US9] Write integration test for created_at sorting in apps/api/tests/integration/test_tasks_api.py testing GET ?sort=created_desc returns newest first (should FAIL)

### Implementation for User Story 9 (Make Tests PASS - GREEN)

- [ ] T140 [US9] Add priority sorting to TaskService.get_tasks() using PostgreSQL CASE expression in apps/api/src/services/task_service.py (high=1, medium=2, low=3, null=4)
- [ ] T141 [US9] Update sort query parameter to support all sort options in GET /{user_id}/tasks endpoint (created_desc, created_asc, due_date_asc, due_date_desc, priority_asc, priority_desc)
- [ ] T142 [US9] Verify sort dropdown in TaskFilters component includes all sort options
- [ ] T143 [US9] Add sort indicator to task list showing current sort order in apps/web/src/app/tasks/page.tsx

### Verification for User Story 9

- [ ] T144 [US9] Run all US9 tests and verify they PASS (pytest apps/api/tests/ -k US9)
- [ ] T145 [US9] Verify combining sort with filters works correctly (e.g., ?status=pending&sort=due_date_asc)

**Checkpoint**: At this point, all 9 user stories are complete with comprehensive test coverage - full task management system delivered

---

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and production readiness

### UI/UX Enhancements

- [ ] T146 [P] Add loading states (skeletons, spinners) to all async operations in apps/web/src/components/tasks/
- [ ] T147 [P] Add error handling and toast notifications for API failures in apps/web/src/components/tasks/
- [ ] T148 [P] Implement mobile-responsive layout with 44×44px touch targets in TaskCard and TaskFilters components
- [ ] T149 [P] Add bottom sheet for mobile filters in apps/web/src/components/tasks/TaskFilters.tsx
- [ ] T150 [P] Optimize TaskList component for 1000+ tasks with virtual scrolling or pagination UI
- [ ] T151 [P] Create empty state UI for new users with no tasks in apps/web/src/app/tasks/page.tsx
- [ ] T152 [P] Add pagination UI controls (prev/next, page numbers) to TaskList component

### Backend Hardening

- [ ] T153 Add comprehensive API error messages with validation details in apps/api/src/routes/tasks.py
- [ ] T154 [P] Add backend logging for all task service operations in apps/api/src/services/task_service.py
- [ ] T155 Verify all database indexes exist and are used by queries via EXPLAIN ANALYZE

### Security & Performance

- [ ] T156 Write security test for SQL injection prevention in apps/api/tests/security/test_sql_injection.py using parameterized queries
- [ ] T157 [P] Write security test for XSS prevention in apps/api/tests/security/test_xss.py testing input sanitization
- [ ] T158 [P] Write security test for user isolation in apps/api/tests/security/test_authorization.py testing cross-user access attempts
- [ ] T159 Run performance benchmarks: search <1s for 1000 tasks, API <200ms p95, document results in specs/002-phase2-chunk2/performance-results.md

### Test Coverage & Documentation

- [ ] T160 Run full test suite and verify ≥80% code coverage (pytest --cov=apps/api/src apps/api/tests/)
- [ ] T161 [P] Run frontend test suite and verify coverage (vitest run --coverage)
- [ ] T162 Generate and review test coverage report, identify gaps
- [ ] T163 Run quickstart.md validation: Verify all code examples work end-to-end
- [ ] T164 Update API documentation (OpenAPI schema) and generate client code if needed
- [ ] T165 Create test execution summary report in specs/002-phase2-chunk2/test-report.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-11)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
  - **TDD Rule**: Tests MUST be written and FAIL before implementation
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

### Within Each User Story (TDD Workflow)

1. **Contract Tests** FIRST (API schema validation)
2. **Unit Tests** SECOND (business logic, models, components)
3. **Integration Tests** THIRD (end-to-end workflows)
4. **Verify All Tests FAIL** (RED phase)
5. **Implementation** FOURTH (make tests pass - GREEN phase)
6. **Verify All Tests PASS**
7. **Manual Verification** FIFTH (user acceptance)
8. **Refactor** (optional - improve code while keeping tests green)

### Parallel Opportunities

- **Phase 1 (Setup)**: T002 can run in parallel with T001
- **Phase 2 (Foundational)**: T005-T009, T012-T015 can all run in parallel after T004, T010-T011
- **Within User Stories**:
  - All contract tests marked [P] can run in parallel
  - All unit tests marked [P] can run in parallel
  - Implementation tasks marked [P] can run in parallel after tests pass
- **Across User Stories**: After Foundational phase, multiple user stories can be worked on simultaneously by different team members

---

## Parallel Example: User Story 1 (TDD Workflow)

```bash
# Step 1: Write all tests in parallel (these will FAIL - that's expected!)
Task T016: "[P] [US1] Write contract test for POST /api/{user_id}/tasks"
Task T017: "[P] [US1] Write contract test for GET /api/{user_id}/tasks"
Task T018: "[P] [US1] Write unit test for TaskService.create_task()"
Task T019: "[P] [US1] Write unit test for TaskService.get_tasks()"
Task T020: "[P] [US1] Write unit test for Task model validation"
Task T021: "[P] [US1] Write unit test for TaskCard component"
Task T022: "[P] [US1] Write unit test for TaskForm component"

# Step 2: Verify all tests FAIL (RED)
pytest apps/api/tests/ -k US1  # Should show failures

# Step 3: Implement in parallel (make tests GREEN)
Task T025: "[P] [US1] Implement TaskService.create_task()"
Task T026: "[P] [US1] Implement TaskService.get_tasks()"
Task T030: "[P] [US1] Create TaskCard component"
Task T031: "[US1] Create TaskForm component"

# Step 4: Verify all tests PASS (GREEN)
pytest apps/api/tests/ -k US1  # Should show all passing
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only - Core CRUD)

1. ✅ Complete Phase 1: Setup (database migration)
2. ✅ Complete Phase 2: Foundational (models, services, test infrastructure)
3. ✅ Complete Phase 3: User Story 1 (Create and View with full TDD)
4. ✅ Complete Phase 4: User Story 2 (Update and Complete with full TDD)
5. **STOP and VALIDATE**: Run full test suite, verify ≥80% coverage
6. Deploy/demo MVP

### Incremental Delivery (P1 → P2 → P3)

1. Complete Setup + Foundational → Foundation ready
2. Add US1 + US2 (TDD) → Run tests → Deploy (MVP!)
3. Add US3 (Delete - TDD) → Run tests → Deploy
4. Add US4 + US5 (Priorities + Due Dates - TDD) → Run tests → Deploy
5. Add US6 (Tags - TDD) → Run tests → Deploy
6. Add US7 + US8 + US9 (Search + Filter + Sort - TDD) → Run tests → Deploy
7. Polish → Run security tests → Production ready

### Parallel Team Strategy

With 3 developers after Foundational phase:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - **Developer A**: US1 + US2 (CRUD - highest priority) with TDD
   - **Developer B**: US4 + US5 (Priorities + Due Dates) with TDD
   - **Developer C**: US6 (Tags) with TDD
3. Then:
   - **Developer A**: US7 (Search) with TDD
   - **Developer B**: US8 (Filter) with TDD
   - **Developer C**: US9 (Sort) with TDD
4. **Developer A**: US3 (Delete - can be done last) with TDD
5. All developers: Polish phase together

---

## Task Summary

**Total Tasks**: 165 tasks across 12 phases

**Breakdown by Phase**:
- Phase 1 (Setup): 3 tasks
- Phase 2 (Foundational): 12 tasks (6 core + 6 test infrastructure)
- Phase 3 (US1 - Create/View): 21 tasks (9 tests + 8 implementation + 4 verification)
- Phase 4 (US2 - Update/Complete): 19 tasks (8 tests + 8 implementation + 3 verification)
- Phase 5 (US3 - Delete): 10 tasks (4 tests + 4 implementation + 2 verification)
- Phase 6 (US4 - Priorities): 13 tasks (4 tests + 7 implementation + 2 verification)
- Phase 7 (US5 - Due Dates): 17 tasks (5 tests + 9 implementation + 3 verification)
- Phase 8 (US6 - Tags): 15 tasks (5 tests + 7 implementation + 3 verification)
- Phase 9 (US7 - Search): 12 tasks (4 tests + 5 implementation + 3 verification)
- Phase 10 (US8 - Filter): 13 tasks (4 tests + 6 implementation + 3 verification)
- Phase 11 (US9 - Sort): 10 tasks (4 tests + 4 implementation + 2 verification)
- Phase 12 (Polish): 20 tasks (7 UI/UX + 3 backend + 4 security + 6 test/docs)

**Test Task Breakdown**:
- Contract Tests: 10 tasks
- Unit Tests (Backend): 23 tasks
- Unit Tests (Frontend): 6 tasks
- Integration Tests: 20 tasks
- Security Tests: 3 tasks
- **Total Test Tasks**: 62 tasks (38% of total)

**Breakdown by User Story**:
- US1 (Create/View - P1): 21 tasks (9 tests, 8 implementation, 4 verification)
- US2 (Update/Complete - P1): 19 tasks (8 tests, 8 implementation, 3 verification)
- US3 (Delete - P2): 10 tasks (4 tests, 4 implementation, 2 verification)
- US4 (Priorities - P2): 13 tasks (4 tests, 7 implementation, 2 verification)
- US5 (Due Dates - P2): 17 tasks (5 tests, 9 implementation, 3 verification)
- US6 (Tags - P2): 15 tasks (5 tests, 7 implementation, 3 verification)
- US7 (Search - P3): 12 tasks (4 tests, 5 implementation, 3 verification)
- US8 (Filter - P3): 13 tasks (4 tests, 6 implementation, 3 verification)
- US9 (Sort - P3): 10 tasks (4 tests, 4 implementation, 2 verification)

**Parallel Opportunities Identified**: 45 tasks marked [P] can run in parallel within their phases

**Test Coverage Goals**:
- ✅ Backend: ≥80% code coverage (pytest --cov)
- ✅ Frontend: ≥80% code coverage (vitest --coverage)
- ✅ Contract Tests: All 6 API endpoints covered
- ✅ Integration Tests: All 9 user stories covered
- ✅ Security Tests: SQL injection, XSS, authorization

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

**Suggested MVP Scope**: Phase 1 + Phase 2 + Phase 3 (US1) + Phase 4 (US2) = Full CRUD with TDD (42 tasks)

**Format Validation**: ✅ All tasks follow checklist format with checkbox, ID, optional [P] and [Story] labels, and file paths

**Constitution Compliance**: ✅ FULLY COMPLIANT
- ✅ Principle X (Testing Requirements): Unit, API, Integration, Habit Logic tests included
- ✅ TDD Enforced: Tests written BEFORE implementation for all user stories
- ✅ Spec-Based Testing: Tests verify acceptance criteria from spec.md
- ✅ Coverage: ≥80% target with automated reporting

---

## Notes

- **TDD Workflow**: Tests MUST be written first and FAIL before implementation begins
- **Test Markers**: Use pytest markers (-k US1, -k US2) to run tests for specific user stories
- [P] tasks = different files, no dependencies - safe to parallelize
- [Story] label maps task to specific user story for traceability (US1-US9)
- Each user story should be independently completable and testable
- All tests must PASS before moving to next user story
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently with test suite
- Mobile-first responsive design enforced in Phase 12 polish tasks
- Event emission (TASK_CREATED, TASK_UPDATED, TASK_COMPLETED, TASK_DELETED) implemented in service methods
- User isolation enforced via user_id filtering and authentication middleware
- Performance targets: <1s search, <200ms API p95, 1000 tasks per user scalability
- Security: SQL injection prevention (parameterized queries), XSS prevention (input sanitization), user isolation (authorization tests)
