---
id: 002
title: Habits Tasks Connection Plan
stage: plan
date: 2026-02-13
surface: agent
model: claude-opus-4-6
feature: 005-habits-tasks-connection
branch: 005-habits-tasks-connection
user: architect
command: /sp.plan
labels: ["plan","habits","tasks","recurring-schedule","background-job","apscheduler","bridge-service"]
links:
  spec: specs/005-habits-tasks-connection/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/005-habits-tasks-connection/plan.md
  - specs/005-habits-tasks-connection/research.md
  - specs/005-habits-tasks-connection/data-model.md
  - specs/005-habits-tasks-connection/contracts/api-contracts.md
  - specs/005-habits-tasks-connection/quickstart.md
tests:
  - null
---

## Prompt

/sp.plan (no additional arguments — executed against 005-habits-tasks-connection spec)

## Response snapshot

Generated complete implementation plan for Phase 2 Chunk 5: Habits ↔ Tasks Connection.

**Artifacts produced:**
- `plan.md` — Technical context, constitution check (all 12 principles PASS), project structure, design decisions summary, risks
- `research.md` — 9 research decisions (R1-R9) covering: RecurringSchedule model alignment, Task model extension, APScheduler for background jobs, HabitTaskGenerationService architecture, idempotent generation, completion sync strategy, frontend modal UX, schedule update regeneration, and schedule parser design
- `data-model.md` — Task model gains 2 columns (generated_by_habit_id FK, is_habit_task bool); RecurringSchedule evolved with frequency and days_of_month fields; Alembic migration spec
- `contracts/api-contracts.md` — Extended PATCH complete (habit_sync response), extended GET tasks (is_habit_task filter), new GET generated-tasks, new POST generate-tasks; event contract for HABIT_GENERATES_TASK
- `quickstart.md` — 8-phase implementation order with 25 steps; key files to modify; testing commands; env vars

**Key architectural decisions:**
1. APScheduler in-process (not Celery/Redis) for background job — lightweight for Phase 2
2. Bridge service pattern (HabitTaskGenerationService) — preserves module independence
3. TaskService.create_task() for generation — preserves events and validation
4. Application-level idempotency check — simpler than DB constraint on timestamp column
5. Inline completion sync (not async event) — user sees streak update immediately
6. Frontend-first modal (completion type selected before API call) — single API call

## Outcome

- Impact: Complete architecture for habits-tasks connection; all 12 constitution principles pass; ready for /sp.tasks
- Tests: No tests run (plan phase)
- Files: plan.md, research.md, data-model.md, contracts/api-contracts.md, quickstart.md
- Next prompts: /sp.tasks to generate task breakdown, then /sp.implement
- Reflection: The bridge service pattern (HabitTaskGenerationService) is the most important decision — it keeps Habit and Task modules decoupled while the spec requires tight integration. APScheduler is a pragmatic choice that can be swapped for Kafka workers in Phase V.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Constitution check — all 12 PASS; forbidden patterns — all PASS
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): Monitor APScheduler reliability on Render; may need to add a startup-time catch-up mechanism if jobs are missed
