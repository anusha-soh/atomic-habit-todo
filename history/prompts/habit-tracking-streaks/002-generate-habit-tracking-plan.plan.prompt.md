---
id: 002
title: Generate Habit Tracking Plan
stage: plan
date: 2026-02-12
surface: agent
model: claude-sonnet-4-5-20250929
feature: habit-tracking-streaks
branch: 004-habit-tracking-streaks
user: HP
command: /sp.plan
labels: ["plan", "habits", "streaks", "architecture", "phase2-chunk4"]
links:
  spec: specs/004-habit-tracking-streaks/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/004-habit-tracking-streaks/plan.md
 - specs/004-habit-tracking-streaks/research.md
 - specs/004-habit-tracking-streaks/data-model.md
 - specs/004-habit-tracking-streaks/quickstart.md
 - specs/004-habit-tracking-streaks/contracts/complete-habit.yaml
 - specs/004-habit-tracking-streaks/contracts/get-completions.yaml
 - specs/004-habit-tracking-streaks/contracts/get-streak.yaml
 - specs/004-habit-tracking-streaks/contracts/undo-completion.yaml
tests:
 - Constitution check: All 12 principles PASS
 - Research: 5 questions resolved
 - Data model: Schema validated
 - Contracts: 4 OpenAPI specs generated
---

## Prompt

User ran `/sp.plan` command with no additional arguments.

## Response snapshot

Generated comprehensive implementation plan for Habit Tracking & Streaks feature:

**Phase 0 - Research Complete**:
- Resolved 5 technology research questions
- Streak calculation: O(n log n) sort + linear scan algorithm
- Sound effects: Web Audio API with HTML5 audio fallback
- Background jobs: APScheduler in-process (upgradeable to Celery/Dapr)
- Notifications: React Query polling (30s interval)
- Timezones: UTC storage, local display with date-fns

**Phase 1 - Design & Contracts Complete**:
- Database schema: `habit_completions` table (new) + `habits` table extensions
- 4 OpenAPI 3.1 contracts: complete-habit, get-completions, get-streak, undo-completion
- SQLModel definitions with validation rules
- State machine diagrams for streak transitions
- Developer quickstart guide with setup instructions and troubleshooting

**Technical Architecture**:
- Web app (monorepo): apps/api (FastAPI) + apps/web (Next.js)
- Database: PostgreSQL with TIMESTAMPTZ, unique constraint (one completion/habit/day)
- Performance: <500ms completion endpoint, <100ms streak update, 60fps animations
- Events: HABIT_COMPLETED, HABIT_STREAK_RESET, HABIT_MISS_DETECTED
- Mobile-first: 44×44px tap targets, Web Audio API, smooth animations

**Constitution Compliance**: All 12 principles PASS
- Spec-driven development maintained
- Event-driven architecture (3 new events)
- Modular design (Habits module extends cleanly)
- API-first (contracts before implementation)
- No hardcoded config (externalized to env vars)

**Key Design Decisions**:
1. Streak calculation in-memory (not SQL window functions) for simplicity and testability
2. APScheduler for Phase 2 (simple, no external dependencies), upgradeable to Celery/Dapr later
3. Database polling for notifications (simple, reliable), upgradeable to SSE/WebSockets later
4. UTC day boundaries for consistency (acceptable edge case: timezone travel)
5. One completion per day enforced by database unique constraint

**Artifacts Generated**:
- plan.md (13 sections, 378 lines): Technical context, constitution check, project structure, phases 0-2
- research.md (5 questions, detailed findings): Algorithms, Web Audio API, background jobs, notifications, timezones
- data-model.md (complete DDL): habit_completions table, habits extensions, SQLModel definitions, state machines
- contracts/ (4 OpenAPI specs): Complete request/response schemas, examples, error handling
- quickstart.md (developer guide): Setup, testing, key files, troubleshooting

**Status**: Planning phase complete. Ready for `/sp.tasks` to generate task breakdown.

## Outcome

- ✅ Impact: Complete implementation plan for habit tracking and streaks feature. Resolved all technical unknowns through research. Defined data model, API contracts, and architecture. Ready for task breakdown and implementation.
- 🧪 Tests: Constitution check validated (12/12 principles PASS). Data model validated (unique constraints, foreign keys, indexes). OpenAPI contracts validated (request/response schemas).
- 📁 Files: Created 8 files (plan.md, research.md, data-model.md, quickstart.md, 4 OpenAPI contracts)
- 🔁 Next prompts: /sp.tasks to generate task breakdown from plan, then /sp.implement to execute tasks
- 🧠 Reflection: Strong technical foundation established. All research questions resolved with concrete recommendations. Constitution compliance ensures consistency with project principles. API-first approach with OpenAPI contracts enables frontend/backend parallel development.

## Evaluation notes (flywheel)

- Failure modes observed: None. Planning workflow executed smoothly. PowerShell script successfully setup context.
- Graders run and results (PASS/FAIL): Constitution check PASS (12/12 principles). Research completeness PASS (5/5 questions resolved). Data model validation PASS (schema + constraints defined). Contract validation PASS (4 OpenAPI specs generated).
- Prompt variant (if applicable): Standard sp.plan workflow with comprehensive Phase 0 research and Phase 1 design
- Next experiment (smallest change to try): Consider generating task estimates during planning phase to provide implementation timeline visibility upfront
