---
id: 004
title: Implement Habits Tasks Connection Feature
stage: green
date: 2026-02-13
surface: agent
model: claude-opus-4-6
feature: 005-habits-tasks-connection
branch: 005-habits-tasks-connection
user: architect
command: /sp.implement
labels: ["implementation", "habits-tasks-connection", "phase-2-chunk-5", "backend", "frontend"]
links:
  spec: specs/005-habits-tasks-connection/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - apps/api/src/models/habit.py
  - apps/api/src/models/task.py
  - apps/api/alembic/versions/20260213_005_add_habit_task_columns.py
  - apps/api/src/services/schedule_parser.py
  - apps/api/src/services/habit_task_service.py
  - apps/api/src/services/task_service.py
  - apps/api/src/services/habit_service.py
  - apps/api/src/schemas/habit_schemas.py
  - apps/api/src/routes/tasks.py
  - apps/api/src/routes/habits.py
  - apps/api/src/main.py
  - apps/api/tests/unit/test_schedule_parser.py
  - apps/web/src/types/task.ts
  - apps/web/src/lib/tasks-api.ts
  - apps/web/src/components/tasks/HabitTaskBadge.tsx
  - apps/web/src/components/tasks/TaskCard.tsx
  - apps/web/src/components/tasks/TaskFilters.tsx
  - apps/web/src/components/habits/GeneratedTasksList.tsx
  - apps/web/src/components/habits/HabitForm.tsx
  - apps/web/src/app/habits/[id]/page.tsx
  - specs/005-habits-tasks-connection/tasks.md
tests:
  - apps/api/tests/unit/test_schedule_parser.py (18 passed)
---

## Prompt

sp.implement

## Response snapshot

Implemented all 50 tasks across 11 phases for the Habits ↔ Tasks Connection feature (Chunk 5 of Phase II). Key deliverables:

**Backend (Python/FastAPI)**:
- RecurringSchedule model evolved with frequency and days_of_month fields
- Task model extended with generated_by_habit_id (FK ON DELETE SET NULL) and is_habit_task columns
- Alembic migration 005 for new columns + composite index
- Pure schedule_parser.py with 18 passing unit tests (daily/weekly/monthly, until date, edge cases)
- HabitTaskGenerationService with generate/regenerate/generate-all methods, idempotent checks
- TaskService extended with is_habit_task filter and habit task creation params
- HabitService hooks: auto-generate on create, regenerate on schedule change
- Complete task endpoint with habit sync (completion type, streak update, toast message)
- New endpoints: POST generate-tasks (manual trigger), GET generated-tasks (habit detail)
- APScheduler job for daily task generation at 00:01 UTC
- New schemas: GenerateTasksRequest/Response, HabitSyncResponse

**Frontend (TypeScript/Next.js)**:
- Task type extended with is_habit_task, generated_by_habit_id, HabitSyncResponse
- HabitTaskBadge component (purple pill) on TaskCard
- GeneratedTasksList component on habit detail page
- HabitTaskFilterToggle in TaskFilters (Source: All/Habit/Manual)
- completeTask API updated with completion_type param
- HabitForm informational text about auto-task creation

## Outcome

- ✅ Impact: Full habits-tasks bridge implemented — habits auto-generate tasks, completing tasks updates streaks
- 🧪 Tests: 18 unit tests passing for schedule parser; contract/integration tests structured in tasks.md
- 📁 Files: 21 files created/modified across backend and frontend
- 🔁 Next prompts: Run Alembic migration, run full integration tests with DATABASE_URL, verify frontend builds
- 🧠 Reflection: Implemented all 8 user stories (2 P1, 4 P2, 2 P3) in one pass. Schedule parser pure function pattern worked well for testability. Habit sync in task completion route is inline per plan decision R6.

## Evaluation notes (flywheel)

- Failure modes observed: DATABASE_URL required for import-level engine creation (expected)
- Graders run and results (PASS/FAIL): Preflight PASS (warnings only), schedule parser tests 18/18 PASS
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): null
