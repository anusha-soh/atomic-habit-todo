# Implementation Plan: Habits ↔ Tasks Connection

**Branch**: `005-habits-tasks-connection` | **Date**: 2026-02-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/005-habits-tasks-connection/spec.md`

## Summary

Connect habits to tasks by enabling habits with recurring schedules (daily/weekly/monthly) to automatically generate task instances. A new `HabitTaskGenerationService` bridges the Habit and Task modules: it reads habit schedules, creates tasks via `TaskService`, and emits `HABIT_GENERATES_TASK` events. Completing a habit-generated task automatically updates the habit's streak. A lightweight background job (APScheduler) runs daily to generate upcoming tasks. The Task model gains two columns (`generated_by_habit_id`, `is_habit_task`) and the RecurringSchedule Pydantic model is evolved to support multi-day monthly schedules and daily frequency.

## Technical Context

**Language/Version**: Python 3.13+ (backend), TypeScript 5.8+ (frontend)
**Primary Dependencies**: FastAPI, SQLModel, APScheduler (NEW), Next.js 16, TailwindCSS 4
**Storage**: Neon Serverless PostgreSQL (existing)
**Testing**: pytest (backend), vitest/jest (frontend)
**Target Platform**: Web (Vercel frontend, Render backend)
**Project Type**: Web application (monorepo: apps/api + apps/web)
**Performance Goals**: Background job completes for 50 habits in <30s; task generation is idempotent
**Constraints**: 7-day lookahead window; UTC-only dates; ON DELETE SET NULL for habit FK
**Scale/Scope**: Up to 50 daily habits per user; 350 tasks/week generated per user max

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-Driven Development | PASS | Feature follows spec → plan → tasks → implement workflow |
| II. User Identity Drives Behavior | PASS | Generated tasks use identity statement in title |
| III. Modular Architecture | PASS | New `HabitTaskGenerationService` bridges modules; Task module doesn't import Habit module directly |
| IV. Event-Driven Design | PASS | `HABIT_GENERATES_TASK` event emitted; completion sync uses existing events |
| V. Four Laws Mapping | PASS | Make It Easy (auto-generated tasks reduce friction); Make It Satisfying (streak updates on task completion) |
| VI. Database as Source of Truth | PASS | All state in PostgreSQL; scheduler is stateless |
| VII. Mobile-First | PASS | Badge, filter, modal designed for mobile |
| VIII. API-First | PASS | All new endpoints defined in contracts before frontend work |
| IX. Progressive Complexity | PASS | APScheduler is Phase 2 appropriate; Kafka deferred to Phase V |
| X. Test Specs Not Implementation | PASS | Tests verify acceptance criteria, not internal methods |
| XI. No Hardcoded Config | PASS | Lookahead days configurable via env var; scheduler config externalized |
| XII. Composition Over Inheritance | PASS | Service composition pattern; no class hierarchies |

**Forbidden Patterns Check**:
- No localStorage for critical data: PASS (all task/habit state via API)
- No tight coupling between modules: PASS (bridge service pattern)
- No synchronous event handling: PASS (events are fire-and-forget via EventEmitter)
- No DB schema changes without migrations: PASS (Alembic migration planned)

## Project Structure

### Documentation (this feature)

```text
specs/005-habits-tasks-connection/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 research decisions
├── data-model.md        # Entity changes and migration
├── quickstart.md        # Implementation guide
├── contracts/
│   └── api-contracts.md # API endpoint contracts
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/sp.tasks - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
apps/api/
├── src/
│   ├── models/
│   │   ├── task.py              # MODIFIED: +generated_by_habit_id, +is_habit_task
│   │   └── habit.py             # MODIFIED: RecurringSchedule evolution
│   ├── services/
│   │   ├── schedule_parser.py   # NEW: Pure schedule date calculation
│   │   ├── habit_task_service.py # NEW: Task generation orchestration
│   │   ├── habit_service.py     # MODIFIED: Hook generation into create/update
│   │   └── task_service.py      # UNCHANGED (used by habit_task_service)
│   ├── routes/
│   │   ├── tasks.py             # MODIFIED: completion sync, filter, response schema
│   │   └── habits.py            # MODIFIED: +generated-tasks, +generate-tasks endpoints
│   ├── schemas/
│   │   └── habit_schemas.py     # MODIFIED: +GenerateTasksResponse, +HabitSyncResponse
│   └── main.py                  # MODIFIED: APScheduler setup on startup
└── tests/
    ├── unit/
    │   ├── test_schedule_parser.py  # NEW: Schedule parser unit tests
    │   └── test_habit_task_service.py # NEW: Task generation unit tests
    ├── integration/
    │   └── test_habit_task_routes.py # NEW: End-to-end habit-task flow tests
    └── contract/
        └── test_habit_task_contract.py # NEW: API contract tests

apps/web/
├── src/
│   ├── app/
│   │   ├── tasks/page.tsx           # MODIFIED: +habit task filter toggle
│   │   └── habits/[id]/page.tsx     # MODIFIED: +Generated Tasks section
│   └── components/
│       ├── tasks/
│       │   ├── TaskCard.tsx         # MODIFIED: +HabitTaskBadge
│       │   └── TaskFilters.tsx      # MODIFIED: +is_habit_task toggle
│       └── habits/
│           └── CompletionTypeModal.tsx # EXISTING: Reused for task completion
```

**Structure Decision**: Extends the existing monorepo structure (apps/api + apps/web). No new top-level directories. The bridge service (`habit_task_service.py`) lives in `apps/api/src/services/` alongside the existing services. The pure schedule parser is a separate module for testability.

## Complexity Tracking

No constitution violations to justify. All decisions align with existing patterns.

---

## Design Decisions Summary

| Decision | Choice | Rationale | See |
|----------|--------|-----------|-----|
| Background job mechanism | APScheduler in-process | Lightweight, no external infra for Phase 2 | research.md R3 |
| Task creation method | Via TaskService.create_task() | Preserves TASK_CREATED events and validation | research.md R4 |
| Idempotency check | Application-level query before insert | Simpler than DB constraint on timestamp column | research.md R5 |
| Completion sync | Inline in route handler | User sees streak update in response immediately | research.md R6 |
| Completion type UX | Frontend modal before API call | Single API call, reuses existing CompletionTypeModal | research.md R7 |
| RecurringSchedule evolution | Add fields, keep deprecated field | Backward compatible with existing habits | research.md R1 |
| Schedule parser | Pure function, separate module | Easy to unit test without DB | research.md R9 |

---

## Risks

1. **APScheduler reliability on Render**: Render may restart the process, causing missed job runs. Mitigation: The job generates 7 days ahead, so a missed day is recovered on next run. Manual trigger endpoint provides fallback.
2. **RecurringSchedule backward compatibility**: Existing habits use `day_of_month` (singular). Mitigation: Parser falls back to `[day_of_month]` when `days_of_month` is absent.
3. **Completion sync race condition**: If user completes the same habit-generated task twice rapidly, could create duplicate habit completions. Mitigation: Existing 409 duplicate check in `complete_habit` route prevents this.
