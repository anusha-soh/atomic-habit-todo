# Tasks: Habits ↔ Tasks Connection

**Feature**: 005-habits-tasks-connection
**Branch**: `005-habits-tasks-connection`
**Spec**: [spec.md](./spec.md)
**Plan**: [plan.md](./plan.md)

## Overview

This document breaks down the Habits ↔ Tasks Connection feature into actionable tasks organized by user story. Each user story represents an independently deliverable increment that can be tested and validated separately.

**Total User Stories**: 8 (2 P1, 4 P2, 2 P3)
**Suggested MVP**: User Stories 1-2 (P1 stories) for minimum viable habit-task generation + completion sync

## Task Format Legend

```
- [ ] [TaskID] [P?] [Story?] Description with file path
```

- **TaskID**: Sequential number (T001, T002, ...)
- **[P]**: Parallelizable task (different files, no blocking dependencies)
- **[Story]**: User story label (US1, US2, etc.) - only in story phases
- **Description**: Clear action with exact file path

## Implementation Strategy

**MVP-First Approach**: Implement P1 user stories (US1-US2) first for core task generation and completion sync. Then add P2 stories (US3-US6) for visibility, schedule updates, deletion behavior, and background job. Finally, P3 stories (US7-US8) for isolation and filtering.

**Parallel Execution**: Tasks marked [P] can be executed in parallel within the same phase. Tasks without [P] must wait for preceding tasks in their phase.

## Task Count Summary

- **Phase 1 (Setup)**: 3 tasks
- **Phase 2 (Foundational)**: 5 tasks
- **Phase 3 (US1 - Habit Creates Daily Tasks)**: 10 tasks
- **Phase 4 (US2 - Completing Task Updates Streak)**: 7 tasks
- **Phase 5 (US3 - Habit Detail Shows Generated Tasks)**: 4 tasks
- **Phase 6 (US4 - Schedule Update Regenerates)**: 4 tasks
- **Phase 7 (US5 - Habit Deletion Orphans Tasks)**: 3 tasks
- **Phase 8 (US6 - Daily Background Job)**: 4 tasks
- **Phase 9 (US7 - Manual Completion Isolation)**: 2 tasks
- **Phase 10 (US8 - Filter Task List by Habit)**: 4 tasks
- **Phase 11 (Polish)**: 4 tasks

**Total Tasks**: 50

---

## Phase 1: Setup & Database Migration

**Goal**: Add the two new columns to the tasks table and evolve RecurringSchedule.

**Dependencies**: None (starts immediately; chunks 1-4 must already be complete)

**Tasks**:

- [X] T001 Evolve RecurringSchedule Pydantic model in apps/api/src/models/habit.py — add `frequency: int = 1`, `days_of_month: Optional[List[int]]`, keep deprecated `day_of_month`, add validators for new fields
- [X] T002 [P] Add `generated_by_habit_id` (UUID FK to habits.id ON DELETE SET NULL, nullable) and `is_habit_task` (boolean, default false) columns to Task model in apps/api/src/models/task.py — follow sa_column=Column(...) pattern per CLAUDE.md pitfall #1
- [X] T003 Create and apply Alembic migration `add_habit_task_columns` in apps/api/alembic/versions/ — adds both columns + composite index `idx_tasks_habit_generated(generated_by_habit_id, due_date, is_habit_task)`

**Acceptance**: RecurringSchedule supports frequency and days_of_month; Task model has both new columns; migration applied; existing tasks unaffected (defaults: NULL, false)

---

## Phase 2: Foundational Services (Blocking Prerequisites)

**Goal**: Create the pure schedule parser and the task generation service that multiple user stories depend on.

**Dependencies**: Phase 1 complete

**Blocking Prerequisites** (must complete before user stories):

- [X] T004 [P] Create schedule parser pure function in apps/api/src/services/schedule_parser.py — `get_scheduled_dates(schedule: RecurringSchedule, start_date: date, end_date: date, habit_created_at: date) -> list[date]` — handles daily (with frequency), weekly (days 0=Sun..6=Sat → Python weekdays), monthly (days_of_month with fallback to [day_of_month]), respects `until` date
- [X] T005 [P] Write unit tests for schedule parser in apps/api/tests/unit/test_schedule_parser.py — daily every 1/2/3 days, weekly Mon/Wed/Fri, monthly 1st+15th, until date respected, until in past → empty, monthly day 31 in Feb → skip, empty schedule → empty
- [X] T006 Create HabitTaskGenerationService in apps/api/src/services/habit_task_service.py — `generate_tasks_for_habit(session, habit_id, user_id, lookahead_days=7) -> GenerationResult`, `generate_tasks_for_all_habits(session, lookahead_days=7) -> list[GenerationResult]`, `regenerate_future_tasks(session, habit_id, user_id) -> GenerationResult` — uses TaskService.create_task() for task creation, idempotent check by (habit_id, due_date), emits HABIT_GENERATES_TASK event per task
- [X] T007 [P] Create GenerationResult dataclass/model in apps/api/src/services/habit_task_service.py — fields: generated (int), skipped (int), habit_id (str), dates_generated (list[str]), dates_skipped (list[str])
- [X] T008 [P] Write integration tests for task generation service in apps/api/tests/integration/test_habit_task_service.py — correct count of tasks created, idempotent (run twice = same result), respects until date, skips archived habits, emits events

**Acceptance**: Schedule parser returns correct dates for all schedule types; HabitTaskGenerationService creates tasks via TaskService, is idempotent, and emits events

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 — Habit Creates Daily Tasks Automatically (Priority: P1)

**Story Goal**: When a user creates a habit with a recurring schedule, 7 days of tasks are automatically generated.

**Why P1**: Foundational value — automating task creation from habits eliminates manual effort.

**Independent Test**: Create habit with `type: daily, frequency: 1` → verify 7 tasks appear in task list with `is_habit_task=true` and correct due dates.

**Dependencies**: Phase 2 complete

**Tasks**:

### Backend — Schemas & Contracts

- [X] T009 [P] [US1] Create GenerateTasksRequest and GenerateTasksResponse schemas in apps/api/src/schemas/habit_schemas.py — GenerateTasksRequest: `lookahead_days: int = Field(default=7, ge=1, le=30)`; GenerateTasksResponse: `generated, skipped, habit_id, dates_generated, dates_skipped, message`
- [X] T010 [P] [US1] Extend TaskResponse in apps/api/src/routes/tasks.py (or schemas) to include `is_habit_task: bool = False` and `generated_by_habit_id: Optional[UUID] = None` fields

### Backend — Lifecycle Hook

- [X] T011 [US1] Hook task generation into habit creation in apps/api/src/services/habit_service.py — after `create_habit()` commits, if `recurring_schedule` is not None, call `HabitTaskGenerationService.generate_tasks_for_habit()`

### Backend — Manual Trigger Endpoint

- [X] T012 [US1] Add POST /{user_id}/habits/{habit_id}/generate-tasks endpoint in apps/api/src/routes/habits.py — accepts optional GenerateTasksRequest body, calls HabitTaskGenerationService.generate_tasks_for_habit(), returns GenerateTasksResponse — 400 if no recurring_schedule or until in past, 404 if habit not found, 403 if user doesn't own habit

### Backend — Event

- [X] T013 [P] [US1] Register HABIT_GENERATES_TASK event type in apps/api/src/services/event_emitter.py (or events module) — payload: habit_id, task_id, task_title, due_date, recurring_schedule type/frequency

### Frontend — Badge

- [X] T014 [P] [US1] Create HabitTaskBadge component in apps/web/src/components/tasks/HabitTaskBadge.tsx — small visual badge/pill showing "Habit" on task cards when `is_habit_task=true`

- [X] T015 [US1] Integrate HabitTaskBadge into existing TaskCard component in apps/web/src/components/tasks/TaskCard.tsx (or equivalent task list item) — conditionally render badge when task.is_habit_task is true

### Frontend — Form

- [X] T016 [US1] Add informational text to habit creation form in apps/web/src/app/habits/new/page.tsx (or HabitForm.tsx) — when recurring_schedule is configured, show message: "Tasks will be automatically created based on this schedule"

### Tests

- [X] T017 [P] [US1] Write contract test for POST /{user_id}/habits/{habit_id}/generate-tasks in apps/api/tests/contract/test_habit_task_contract.py — verify 200 response shape matches GenerateTasksResponse, 400 for no schedule, 404 for missing habit
- [X] T018 [US1] Write integration test for habit creation → task generation flow in apps/api/tests/integration/test_habit_task_routes.py — create habit with daily schedule → verify 7 tasks created with correct due_dates, is_habit_task=true, generated_by_habit_id set, tags include "habit-generated" and category

**Acceptance**: Creating a habit with recurring_schedule generates 7 tasks; manual trigger endpoint works; badge visible on habit-generated tasks; form shows informational text; no duplicates on re-trigger

**Parallel Opportunities**: T009, T010, T013, T014, T017 can run in parallel (different files)

---

## Phase 4: User Story 2 — Completing Habit Task Updates Streak Automatically (Priority: P1)

**Story Goal**: Marking a habit-generated task as complete automatically creates a habit completion record and updates the streak.

**Why P1**: Core synchronization — removes double-entry burden and ensures streak integrity.

**Independent Test**: Complete a habit-generated task → verify linked habit's streak increments by 1.

**Dependencies**: Phase 3 complete (tasks exist, completion endpoint exists)

**Tasks**:

### Backend — Completion Sync

- [X] T019 [US2] Create HabitSyncResponse schema in apps/api/src/schemas/habit_schemas.py — `synced: bool`, `habit_id: Optional[str]`, `new_streak: Optional[int]`, `completion_type: Optional[str]`, `message: str`
- [X] T020 [US2] Extend PATCH /{user_id}/tasks/{task_id}/complete in apps/api/src/routes/tasks.py — add `completion_type` query param (default "full"); after marking task complete, check `generated_by_habit_id`; if present and habit exists, call habit completion logic; return `habit_sync` object in response; if habit deleted or not habit task, `habit_sync` is null
- [X] T021 [US2] Handle edge cases in completion sync — orphaned task (habit deleted): complete task normally, habit_sync=null; already completed today (409 from habit): habit_sync.synced=false with message; default completion_type to "full" if not provided

### Frontend — Completion Type Modal

- [X] T022 [P] [US2] Wire CompletionTypeModal (existing from chunk 4) to task completion flow — when completing a task where `is_habit_task=true` and description contains "2-min:", show modal before API call; pass selected completion_type to PATCH endpoint
- [X] T023 [US2] Show streak update toast/confirmation after completing a habit task — parse habit_sync from response; if synced=true, show message like "Your habit streak for '[name]' is now X days"

### Tests

- [X] T024 [P] [US2] Write contract test for extended PATCH /{user_id}/tasks/{task_id}/complete in apps/api/tests/contract/test_habit_task_contract.py — verify response includes habit_sync when completing habit task, habit_sync is null for regular tasks, verify completion_type param accepted
- [X] T025 [US2] Write integration test for task completion → habit sync flow in apps/api/tests/integration/test_habit_task_routes.py — complete habit task → verify habit completion created, streak incremented; complete orphaned task → verify no error; complete regular task → verify no habit_sync

**Acceptance**: Completing a habit-generated task updates the linked habit's streak; completion type modal appears for tasks with 2-minute version; orphaned tasks complete without error; streak confirmation toast shown

**Parallel Opportunities**: T022, T024 can run in parallel with backend work (different files)

---

## Phase 5: User Story 3 — Habit Detail Shows Generated Tasks (Priority: P2)

**Story Goal**: Habit detail page displays a "Generated Tasks" section listing all upcoming tasks.

**Why P2**: Provides transparency into the habit-task relationship.

**Independent Test**: Navigate to habit detail → verify "Generated Tasks" section shows correct upcoming tasks.

**Dependencies**: Phase 3 complete (generated tasks exist)

**Tasks**:

- [X] T026 [P] [US3] Add GET /{user_id}/habits/{habit_id}/generated-tasks endpoint in apps/api/src/routes/habits.py — query params: status (pending/completed/all), page, limit; returns paginated task list filtered by generated_by_habit_id; 403 if user doesn't own habit, 404 if habit not found
- [X] T027 [P] [US3] Create GeneratedTasksList component in apps/web/src/components/habits/GeneratedTasksList.tsx — fetches from generated-tasks endpoint; shows task title, due_date, status; empty state message when no tasks
- [X] T028 [US3] Integrate GeneratedTasksList into habit detail page at apps/web/src/app/habits/[id]/page.tsx — add "Generated Tasks" section below existing content
- [X] T029 [P] [US3] Write contract test for GET /{user_id}/habits/{habit_id}/generated-tasks in apps/api/tests/contract/test_habit_task_contract.py — verify paginated response shape, status filter works, 404 for missing habit

**Acceptance**: Habit detail page shows "Generated Tasks" section with upcoming tasks; empty state shown when no tasks exist; pagination works

**Parallel Opportunities**: T026, T027, T029 can run in parallel (backend vs frontend vs tests)

---

## Phase 6: User Story 4 — Recurring Schedule Update Regenerates Future Tasks (Priority: P2)

**Story Goal**: Changing a habit's recurring schedule deletes future pending tasks and regenerates.

**Why P2**: Keeps task queue accurate when habits evolve.

**Independent Test**: Change daily habit to weekly → verify old pending tasks deleted, new tasks reflect new schedule, completed tasks unchanged.

**Dependencies**: Phase 3 complete (generated tasks exist)

**Tasks**:

- [X] T030 [US4] Hook regeneration into habit update in apps/api/src/services/habit_service.py — detect when `recurring_schedule` changes in `update_habit()`; if changed, call `HabitTaskGenerationService.regenerate_future_tasks()`
- [X] T031 [US4] Implement regenerate_future_tasks logic in apps/api/src/services/habit_task_service.py — delete future pending tasks (status="pending" AND due_date >= today) for this habit; then call generate_tasks_for_habit() with new schedule; preserve completed tasks
- [X] T032 [P] [US4] Write integration test for schedule update → regeneration in apps/api/tests/integration/test_habit_task_routes.py — update daily→weekly, verify old pending tasks deleted, new tasks match new schedule, completed tasks preserved
- [X] T033 [P] [US4] Write unit test for regenerate logic in apps/api/tests/unit/test_habit_task_service.py — verify only future pending tasks are deleted, completed tasks untouched

**Acceptance**: Schedule change triggers deletion of future pending tasks + regeneration; completed tasks never modified; correct new tasks appear

**Parallel Opportunities**: T032, T033 can run in parallel (different test files)

---

## Phase 7: User Story 5 — Habit Deletion Orphans Tasks (Priority: P2)

**Story Goal**: Deleting a habit sets generated_by_habit_id to NULL on all linked tasks (ON DELETE SET NULL).

**Why P2**: Prevents data loss — tasks remain accessible after habit removal.

**Independent Test**: Delete habit with generated tasks → verify tasks remain with generated_by_habit_id=null.

**Dependencies**: Phase 1 complete (FK constraint handles this at DB level)

**Tasks**:

- [X] T034 [US5] Verify ON DELETE SET NULL behavior with integration test in apps/api/tests/integration/test_habit_task_routes.py — create habit, generate tasks, delete habit, verify tasks still exist with generated_by_habit_id=null and is_habit_task=true
- [X] T035 [US5] Verify completing an orphaned task produces no error in apps/api/tests/integration/test_habit_task_routes.py — delete habit, then complete its former task, verify task completes normally, habit_sync is null
- [X] T036 [P] [US5] Verify orphaned tasks are excluded from regeneration — ensure HabitTaskGenerationService.generate_tasks_for_all_habits() skips deleted habits (no orphaned task gets regenerated)

**Acceptance**: Habit deletion orphans tasks via FK constraint; orphaned tasks complete without error; no regeneration for deleted habits

---

## Phase 8: User Story 6 — Daily Background Job Generates Today's Tasks (Priority: P2)

**Story Goal**: APScheduler runs daily at 00:01 UTC, generating tasks for all active habits.

**Why P2**: Ensures new tasks appear automatically each day without user action.

**Independent Test**: Trigger background job manually → verify tasks created for today's date for all active habits.

**Dependencies**: Phase 2 complete (HabitTaskGenerationService exists)

**Tasks**:

- [X] T037 Add APScheduler dependency in apps/api/ — run `uv add apscheduler` (if not already present from chunk 4)
- [X] T038 [US6] Configure daily task generation job in apps/api/src/main.py — add to existing APScheduler setup (lifespan startup); schedule `generate_tasks_for_all_habits()` daily at 00:01 UTC; add DISABLE_BACKGROUND_JOBS env var check; log job execution start/end with duration
- [X] T039 [US6] Write integration test for background job logic in apps/api/tests/integration/test_habit_task_routes.py — call generate_tasks_for_all_habits() directly; verify tasks created for today for each active habit, no duplicates, archived habits skipped, habits past `until` date skipped
- [X] T040 [P] [US6] Add HABIT_TASK_LOOKAHEAD_DAYS and DISABLE_BACKGROUND_JOBS to apps/api/.env.example with defaults (7 and false)

**Acceptance**: Background job runs daily at 00:01 UTC; generates tasks for 7-day window; idempotent; skips archived habits and past-until habits; configurable via env vars

---

## Phase 9: User Story 7 — Manual Habit Completion Does Not Affect Tasks (Priority: P3)

**Story Goal**: Marking a habit complete directly (via habit checkbox) doesn't change any generated task statuses.

**Why P3**: Preserves independence between completion paths.

**Independent Test**: Mark habit complete directly → verify pending generated tasks remain pending.

**Dependencies**: Phase 3 complete (completion flows exist)

**Tasks**:

- [X] T041 [US7] Verify existing POST /{user_id}/habits/{habit_id}/complete endpoint does NOT modify any tasks in apps/api/tests/integration/test_habit_task_routes.py — create habit, generate tasks, complete habit directly, verify all tasks still have status="pending"
- [X] T042 [US7] Verify double-completion prevention — complete habit directly AND complete its task for today → verify habit_completion endpoint returns 409 on second attempt (existing behavior)

**Acceptance**: Direct habit completion has zero effect on generated tasks; double-completion prevented by existing 409 check

---

## Phase 10: User Story 8 — Filter Task List by Habit Tasks (Priority: P3)

**Story Goal**: Users can filter the task list to show only habit-generated tasks.

**Why P3**: Improves focus — users can separate habit work from project work.

**Independent Test**: Enable "Show habit tasks only" → verify only habit-generated tasks displayed.

**Dependencies**: Phase 3 complete (is_habit_task field exists)

**Tasks**:

- [X] T043 [US8] Add `is_habit_task` query parameter to GET /{user_id}/tasks endpoint in apps/api/src/routes/tasks.py — true = only habit tasks, false = only manual tasks, absent = all tasks; filter by Task.is_habit_task column
- [X] T044 [US8] Update TaskService.get_tasks() in apps/api/src/services/task_service.py to accept optional `is_habit_task: Optional[bool]` filter parameter
- [X] T045 [P] [US8] Create HabitTaskFilterToggle component in apps/web/src/components/tasks/TaskFilters.tsx (or new file) — toggle button/switch that sets is_habit_task query param on task list fetch
- [X] T046 [P] [US8] Write contract test for GET /{user_id}/tasks?is_habit_task=true in apps/api/tests/contract/test_habit_task_contract.py — verify filtering returns only habit tasks / only manual tasks / all tasks

**Acceptance**: Task list API supports is_habit_task filter; frontend toggle works; filter returns correct subset

**Parallel Opportunities**: T045, T046 can run in parallel with backend work (different files)

---

## Phase 11: Polish & Cross-Cutting Concerns

**Goal**: Final integration, edge cases, documentation, and cleanup.

**Dependencies**: All user story phases complete

**Tasks**:

- [X] T047 [P] Update habit creation/update form to show RecurringSchedule frequency/days_of_month fields in apps/web/src/components/habits/HabitForm.tsx — ensure new schedule fields are exposed in the UI
- [X] T048 [P] Verify mobile responsiveness for HabitTaskBadge, GeneratedTasksList, HabitTaskFilterToggle — 44x44px tap targets, readable on small screens
- [X] T049 Run end-to-end integration test: create habit with daily schedule → verify 7 tasks generated → complete a task → verify streak updates → update schedule → verify regeneration → delete habit → verify orphaned tasks → complete orphaned task → verify no error
- [X] T050 Run quickstart.md validation — execute all testing commands from quickstart.md, verify all pass

**Acceptance**: All configuration externalized, mobile experience smooth, end-to-end flow passes, quickstart validation complete

**Parallel Opportunities**: T047, T048 can run in parallel (different concerns)

---

## Dependencies & Execution Order

### Critical Path (Must Complete Sequentially)

1. **Phase 1** (Setup) → **Phase 2** (Foundational) → Must complete before any user stories
2. **Phase 3** (US1) → Blocks **Phase 4** (US2), **Phase 5** (US3), **Phase 6** (US4)
3. **Phase 7** (US5) only needs Phase 1 (FK constraint is DB-level)
4. **Phase 8** (US6) only needs Phase 2 (service exists)

### Independent Story Branches (Can Execute in Parallel After Phase 3)

- **US1 → US2** (Generation → Completion sync — sequential, US2 needs tasks to exist)
- **US1 → US3** (Generation → Habit detail tasks — parallel after US1)
- **US1 → US4** (Generation → Schedule update — parallel after US1)
- **Phase 1 → US5** (FK constraint → Deletion behavior — independent)
- **Phase 2 → US6** (Service → Background job — independent)
- **US1 → US7** (Generation → Isolation verification — parallel after US1)
- **US1 → US8** (Generation → Filter — parallel after US1)

### Suggested Execution Phases

**Sprint 1 (MVP)**: Phases 1-4 (Setup + Foundational + US1 + US2) = Core generation + completion sync
**Sprint 2 (Enhanced)**: Phases 5-8 (US3 + US4 + US5 + US6) = Visibility + lifecycle + background job
**Sprint 3 (Complete)**: Phases 9-11 (US7 + US8 + Polish) = Isolation + filter + finalization

---

## Parallel Execution Examples

### Phase 2 (Foundational) Parallelization

**Can run simultaneously**:
- T004 (Schedule parser) + T005 (Parser tests) + T007 (GenerationResult model) + T008 (Service tests)

**Must run sequentially**:
- T004 → T006 (Parser must exist before service uses it)
- T007 → T006 (GenerationResult must exist before service returns it)

### Phase 3 (US1) Parallelization

**Can run simultaneously**:
- T009 (Schemas) + T010 (TaskResponse) + T013 (Event) + T014 (Badge) + T017 (Contract test)

**Must run sequentially**:
- T011 → T012 (Lifecycle hook before manual trigger makes sense)
- T014 → T015 (Badge before integrating into TaskCard)

### Phase 4 (US2) Parallelization

**Can run simultaneously**:
- T022 (Modal wiring) + T024 (Contract test)

**Must run sequentially**:
- T019 → T020 → T021 (Schema → Route → Edge cases)
- T022 → T023 (Modal → Toast)

---

## Testing Strategy

Tests verify acceptance criteria from the spec (Constitution §X: "Test Specs, Not Implementation").

**Required Test Coverage**:
- Unit tests: Schedule parser logic (`test_schedule_parser.py`)
- Unit tests: Regeneration logic (`test_habit_task_service.py`)
- Contract tests: All new/modified API endpoints (`test_habit_task_contract.py`)
- Integration tests: Full habit→task→completion flow (`test_habit_task_routes.py`)

**Manual Testing Checklist** (required):
- [ ] Create daily habit → Verify 7 tasks generated with correct dates
- [ ] Create weekly habit (Mon/Wed/Fri) → Verify only matching dates have tasks
- [ ] Trigger manual generation → Verify idempotent (no duplicates)
- [ ] Complete habit-generated task → Verify streak updates
- [ ] Complete orphaned task → Verify no error, no streak update
- [ ] Update schedule daily→weekly → Verify pending tasks regenerated, completed preserved
- [ ] Delete habit → Verify tasks remain with null habit reference
- [ ] Toggle habit task filter → Verify correct task subset shown
- [ ] View habit detail → Verify "Generated Tasks" section appears
- [ ] Mark habit complete directly → Verify no tasks affected

---

## Implementation Notes

### File Creation Order

**Backend**:
1. Models (T001, T002) — SQLModel field definitions
2. Migration (T003) — Alembic
3. Services (T004, T006, T007) — Schedule parser + generation service
4. Schemas (T009, T010, T019) — Request/response Pydantic models
5. Routes (T012, T020, T026, T043) — API endpoints
6. Lifecycle hooks (T011, T030) — Service integration
7. Background job (T038) — APScheduler config

**Frontend**:
1. Components (T014, T027, T045) — Badge, generated tasks list, filter toggle
2. Page integration (T015, T016, T028) — Wire into existing pages
3. Completion flow (T022, T023) — Modal + toast

### Key Integration Points

- `HabitTaskGenerationService` uses `TaskService.create_task()` — preserves TASK_CREATED events
- Completion sync calls existing `complete_habit` logic — preserves HABIT_COMPLETED events
- Schedule parser is pure function — no DB, no side effects, easy to unit test
- ON DELETE SET NULL handled at DB level — no application code needed for orphaning

---

**Status**: Tasks ready for implementation. Run `/sp.implement` to begin execution.
