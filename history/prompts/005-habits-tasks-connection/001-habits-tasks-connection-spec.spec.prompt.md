---
id: 001
title: Habits Tasks Connection Spec
stage: spec
date: 2026-02-13
surface: agent
model: claude-sonnet-4-5-20250929
feature: 005-habits-tasks-connection
branch: 005-habits-tasks-connection
user: architect
command: /sp.specify
labels: ["spec","habits","tasks","recurring-schedule","background-job","chunk-5"]
links:
  spec: specs/005-habits-tasks-connection/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/005-habits-tasks-connection/spec.md
  - specs/005-habits-tasks-connection/checklists/requirements.md
tests:
  - null
---

## Prompt

we have completed chunk 4 of phaseII, now here is the prompt for chunk 5 [
  Write a comprehensive specification for Phase 2 Chunk 5: Habits ↔ Tasks Connection.

  **Context:**
  - This is Chunk 5 of 7-chunk Phase 2 delivery plan
  - Chunk 1 (Core Infrastructure), Chunk 2 (Tasks), Chunk 3 (Habits CRUD), and Chunk 4 (Habit Tracking) are complete
  - Now connecting habits to tasks: habits generate daily task instances based on recurring schedule
  - This implements the core relationship: "A habit can generate daily task instances"

  **Scope:**
  Build the connection between habits and tasks:
  1. Recurring schedule parser (daily/weekly/monthly)
  2. Automatic task generation from habits (based on schedule)
  3. Background job to generate tasks at scheduled times
  4. Task-to-habit linking (tasks know which habit generated them)
  5. Habit completion synchronization (completing habit-generated task updates habit streak)
  6. Event integration (HABIT_GENERATES_TASK event)

  [... full prompt as provided by user ...]
]

## Response snapshot

Created comprehensive specification for Phase 2 Chunk 5: Habits ↔ Tasks Connection.

- Branch: `005-habits-tasks-connection`
- Spec: `specs/005-habits-tasks-connection/spec.md`
- Checklist: `specs/005-habits-tasks-connection/checklists/requirements.md`

Spec includes:
- 8 user stories (P1-P3) covering: automatic task generation, streak sync on completion, habit detail generated tasks view, schedule update regeneration, habit deletion orphaning, background job, manual completion isolation, and task filter
- 26 functional requirements (FR-001 to FR-026) across task generation, linking, completion sync, recurring schedule, events, and frontend
- 10 measurable success criteria (SC-001 to SC-010)
- Full edge case coverage (orphaned tasks, timezone, duplicate prevention, schedule updates)
- Assumptions section documenting UTC, active habit definition, 7-day lookahead, and description format conventions
- Clear out-of-scope boundaries

All checklist items pass. Spec is ready for `/sp.plan`.

## Outcome

- ✅ Impact: Complete specification for habits-tasks connection feature; enables planning phase to begin
- 🧪 Tests: No tests run (spec phase)
- 📁 Files: specs/005-habits-tasks-connection/spec.md, specs/005-habits-tasks-connection/checklists/requirements.md
- 🔁 Next prompts: /sp.plan or /sp.clarify for 005-habits-tasks-connection
- 🧠 Reflection: Feature has clear boundaries with existing chunks (2, 3, 4). Key design decisions (idempotency, orphaning on deletion, UTC-only dates) are encoded as explicit requirements.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Spec quality checklist — all PASS
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): Add performance NFR for background job batch size limits if needed during planning
