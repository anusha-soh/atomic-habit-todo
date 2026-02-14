# Implementation Plan: Habit Tracking & Streaks

**Branch**: `004-habit-tracking-streaks` | **Date**: 2026-02-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-habit-tracking-streaks/spec.md`

## Summary

This feature implements Phase 2 Chunk 4: Habit completion tracking, streak calculation, and "never miss twice" accountability system. It directly implements the 4th Law of Atomic Habits (Make It Satisfying) through immediate feedback (sound + animation), visible progress (streak counters), and gentle accountability (notifications). The system tracks completions, calculates consecutive-day streaks, and applies the "never miss twice" rule where 1 miss triggers a reminder and 2 consecutive misses reset the streak.

**Technical Approach**: Add `habit_completions` table with unique constraint (one per habit per day), extend `habits` table with streak metadata (`last_completed_at`, `consecutive_misses`), implement streak calculation logic in backend service, add completion API endpoints, emit events (HABIT_COMPLETED, HABIT_STREAK_RESET, HABIT_MISS_DETECTED), build frontend completion UI with Web Audio API for sound effects, and create background job for miss detection.

## Technical Context

**Language/Version**: Python 3.13+ (backend), TypeScript 5.8+ (frontend)
**Primary Dependencies**:
- Backend: FastAPI, SQLModel, Alembic, Pydantic
- Frontend: Next.js 16, React 19, TailwindCSS 4, Web Audio API
- Shared: PostgreSQL (Neon Serverless)

**Storage**: Neon Serverless PostgreSQL with two tables:
- `habit_completions` - completion records (one per habit per day)
- `habits` - extended with streak fields (`last_completed_at TIMESTAMPTZ`, `consecutive_misses INT`)

**Testing**:
- Backend: pytest with contract tests, integration tests, unit tests
- Frontend: Vitest for streak calculation logic, Playwright for UI interactions
- Test categories: Contract (API schema), Integration (habit completion flow), Unit (streak logic)

**Target Platform**:
- Frontend: Modern web browsers (desktop + mobile), Web Audio API support
- Backend: Linux server (Render deployment)
- Database: Cloud-hosted PostgreSQL (Neon)

**Project Type**: Web application (monorepo with apps/api and apps/web)

**Performance Goals**:
- Completion endpoint response < 500ms (P95)
- Real-time streak updates (< 100ms UI update)
- Sound effect playback < 50ms latency
- Notification delivery within 1 hour of miss detection
- Database query for streak calculation < 100ms

**Deferred Monitoring (Phase V)**: Automated measurement of SC-003 (95% sound success rate), SC-004 (99% notification delivery rate), and SC-008 (60fps mobile animation) requires an observability stack (metrics collection, dashboards). In this MVP chunk, these are validated via the manual testing checklist in tasks.md.

**Constraints**:
- One completion per habit per day (database unique constraint)
- Streak calculation idempotent (same input → same output)
- Sound failure must not block completion (graceful degradation)
- Miss detection must handle bulk offline periods (week+ gap)
- UTC storage, local timezone display

**Scale/Scope**:
- Supports 10k users with daily habit completions
- Streak calculation for 100+ habits per user
- Miss detection batch job processes all active habits daily
- Event emission rate: ~1000 events/minute peak

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ I. Spec-Driven Development is Mandatory
**Status**: PASS
- Feature begins with approved spec (spec.md)
- Plan generated before implementation
- Tasks will be created from plan before coding
- All code will be generated via Claude Code

### ✅ II. User Identity Drives Behavior
**Status**: PASS
- Builds on Chunk 3 which established identity-based habits ("I am a person who...")
- Reinforces identity through visible progress (streaks)
- Celebration of consistency supports identity transformation

### ✅ III. Modular Architecture with Feature Flags
**Status**: PASS
- Habits module remains independent (already established in Chunk 3)
- Completion tracking extends habits module without modifying core
- No new feature flags required (Habits module already toggled by `ENABLE_HABITS_MODULE`)

### ✅ IV. Event-Driven Design from Phase II Onwards
**Status**: PASS
- Emits 3 new events: HABIT_COMPLETED, HABIT_STREAK_RESET, HABIT_MISS_DETECTED
- Events follow schema: `{user_id, timestamp, event_type, payload}`
- Fire-and-forget (non-blocking)
- No direct table modifications across module boundaries

### ✅ V. Every Habit Feature Maps to the Four Laws
**Status**: PASS
- **Law 4: Make It Satisfying** - ENTIRE FEATURE implements this law
  - Immediate reward: Sound effect + visual feedback (checkmark animation)
  - Progress tracking: Streak counter shows consistency
  - Accountability: "Never miss twice" prevents abandonment

### ✅ VI. Database as Single Source of Truth
**Status**: PASS
- All completions persisted to `habit_completions` table
- Streak metadata stored in `habits` table
- No in-memory caching of critical data
- Backend services stateless (can be killed/restarted)

### ✅ VII. Mobile-First Responsive Design
**Status**: PASS
- Checkbox tap targets minimum 44×44px
- Touch-friendly completion type buttons (large, not tiny radio buttons)
- Streak counter visible without scrolling
- Animations optimized for mobile (60fps target)

### ✅ VIII. API-First Architecture
**Status**: PASS
- Backend completion endpoints implemented before frontend
- OpenAPI contracts generated from FastAPI decorators
- Contract tests verify request/response schemas
- Frontend mocks API during development

### ✅ IX. Progressive Complexity Across Phases
**Status**: PASS
- Builds on Phase 2 Chunk 3 (Habits CRUD)
- No Phase III features (AI, MCP) included
- Stays within Phase 2 scope (web app, database, basic events)

### ✅ X. Test Specs, Not Implementation
**Status**: PASS
- Tests verify acceptance criteria from spec
- Streak calculation tests verify consecutive day logic (not SQL queries)
- API tests verify OpenAPI contract (not internal service calls)
- Integration tests exercise user journeys (not module boundaries)

### ✅ XI. No Hardcoded Configuration
**Status**: PASS
- Sound file path configurable (environment variable)
- Notification messages configurable (database or config file)
- Miss detection schedule configurable (cron expression)
- All timeouts/thresholds externalized

### ✅ XII. Composition Over Inheritance
**Status**: PASS
- Streak calculation implemented as utility functions (not class hierarchy)
- React components use hooks (not class inheritance)
- Backend services use dependency injection

**Gate Result**: ✅ ALL CHECKS PASS - Proceed to Phase 0 Research

## Project Structure

### Documentation (this feature)

```text
specs/004-habit-tracking-streaks/
├── spec.md                     # Feature specification (user stories, requirements, success criteria)
├── plan.md                     # This file (technical design, architecture)
├── research.md                 # Phase 0: Technology research and decisions
├── data-model.md               # Phase 1: Database schema and entity design
├── quickstart.md               # Phase 1: Developer getting started guide
├── contracts/                  # Phase 1: API contracts (OpenAPI specs)
│   ├── complete-habit.yaml     # POST /api/{user_id}/habits/{id}/complete
│   ├── get-completions.yaml    # GET /api/{user_id}/habits/{id}/completions
│   ├── get-streak.yaml         # GET /api/{user_id}/habits/{id}/streak
│   └── undo-completion.yaml    # DELETE /api/{user_id}/habits/{id}/completions/{completion_id}
└── checklists/                 # Validation checklists
    └── requirements.md         # Spec quality checklist (already created)
```

### Source Code (repository root)

```text
apps/
├── api/                        # FastAPI backend
│   ├── src/
│   │   ├── models/
│   │   │   ├── habit_completion.py       # HabitCompletion SQLModel
│   │   │   └── habit.py                   # Extended with streak fields
│   │   ├── routes/
│   │   │   └── habits.py                  # Completion endpoints
│   │   ├── services/
│   │   │   ├── streak_calculator.py       # Streak calculation logic
│   │   │   ├── miss_detector.py           # Background job for miss detection
│   │   │   └── notification_service.py    # In-app notification sender
│   │   └── schemas/
│   │       └── habit_schemas.py           # Pydantic request/response models
│   └── tests/
│       ├── contract/
│       │   └── test_completion_contract.py  # OpenAPI schema validation
│       ├── integration/
│       │   └── test_completion_flow.py      # End-to-end completion + streak
│       └── unit/
│           ├── test_streak_calculator.py    # Streak logic unit tests
│           └── test_miss_detector.py        # Miss detection logic tests
│
└── web/                        # Next.js frontend
    ├── src/
    │   ├── app/
    │   │   └── habits/
    │   │       └── [id]/
    │   │           └── page.tsx           # Habit detail page with completions
    │   ├── components/
    │   │   └── habits/
    │   │       ├── CompletionCheckbox.tsx # Checkbox with sound + animation
    │   │       ├── CompletionTypeModal.tsx # Full vs 2-minute choice
    │   │       ├── StreakCounter.tsx      # Streak display component
    │   │       └── CompletionHistory.tsx  # Completion history list
    │   ├── lib/
    │   │   ├── sound-player.ts            # Web Audio API wrapper
    │   │   └── habits-api.ts              # API client functions
    │   └── public/
    │       └── sounds/
    │           └── sparkle.mp3            # Completion sound effect
    └── tests/
        └── habits/
            └── completion.test.tsx         # Component tests
```

**Structure Decision**: Web application (Option 2) using existing monorepo structure from Phase 2 Chunk 1. Backend extends `apps/api/src/routes/habits.py` and adds new models. Frontend adds completion components to `apps/web/src/components/habits/`. No new top-level directories required.

**Event Architecture Note**: Events (`HABIT_COMPLETED`, `HABIT_MISS_DETECTED`, `HABIT_STREAK_RESET`) are emitted inline via the shared `EventEmitter` service — from `routes/habits.py` (completion events) and `services/miss_detector.py` (miss/reset events). A dedicated `events/habit_events.py` module is not used; this is consistent with the fire-and-forget pattern in the constitution and keeps event emission co-located with the business logic that triggers it.

**Notification Architecture Note (MVP)**: Notifications are **ephemeral** in this chunk. The `notification_service.py` generates in-memory payloads (dicts) returned by `detect_missed_habits()`. These are passed to the frontend `NotificationBanner` component via page-load state (not persisted to a database table). No `GET /notifications` API endpoint exists in this MVP. Persistent notification storage with a dedicated endpoint is deferred to a future chunk if user research shows demand.

## Complexity Tracking

No constitution violations detected. No complexity justification required.

## Phase 0: Research

*Research findings documented in [research.md](./research.md)*

### Research Questions

1. **Streak Calculation Algorithm**: What's the most efficient algorithm for calculating consecutive-day streaks given a set of completion timestamps?
   - Investigate: Sort timestamps, iterate with day delta comparison
   - Alternative: Database window functions (ROW_NUMBER with date partitions)
   - Goal: Find O(n log n) or better solution

2. **Web Audio API Best Practices**: How to reliably play sound effects across desktop and mobile browsers?
   - Investigate: Web Audio API vs HTML5 `<audio>` element
   - Mobile considerations: User gesture requirement, autoplay policies
   - Fallback strategies for unsupported browsers

3. **Background Job Implementation**: What's the best pattern for daily miss detection in FastAPI?
   - Options: Cron job (system level), APScheduler (in-process), Celery (external worker)
   - Evaluate: Simplicity vs scalability, Phase 2 constraints
   - Goal: Simple solution for Phase 2, scalable for Phase V (Dapr/Kafka)

4. **Notification System**: How to implement in-app banner notifications without email/SMS?
   - Investigate: State management (React Context vs database polling)
   - Consider: Real-time updates (SSE, WebSockets) vs polling
   - Goal: Simple polling solution for Phase 2

5. **UTC vs Local Timezone Handling**: Best practices for storing UTC and displaying local times?
   - Investigate: JavaScript Date API, timezone libraries (date-fns, Luxon)
   - Database: PostgreSQL TIMESTAMPTZ handling
   - Goal: Consistent approach across backend and frontend

### Research Deliverables

- Algorithm selection for streak calculation with complexity analysis
- Web Audio API implementation guide with mobile considerations
- Background job pattern recommendation for FastAPI
- Notification architecture for in-app banners
- Timezone handling strategy with code examples

*See [research.md](./research.md) for detailed findings*

## Phase 1: Design & Contracts

*Design artifacts documented in [data-model.md](./data-model.md), [contracts/](./contracts/), and [quickstart.md](./quickstart.md)*

### Data Model

**New Entity: HabitCompletion**
- `id` (UUID, primary key)
- `habit_id` (UUID, foreign key to habits.id)
- `user_id` (UUID, foreign key to users.id)
- `completed_at` (TIMESTAMPTZ) - completion timestamp (UTC)
- `completion_type` (VARCHAR(20)) - 'full' or 'two_minute'
- `created_at` (TIMESTAMPTZ, default NOW())
- **Unique Constraint**: `(habit_id, DATE(completed_at))` - one completion per habit per day

**Extended Entity: Habit** (add to existing table)
- `last_completed_at` (TIMESTAMPTZ) - timestamp of most recent completion
- `consecutive_misses` (INT, default 0) - count of consecutive missed days

**Validation Rules**:
- `completion_type` must be one of: 'full', 'two_minute'
- `completed_at` must not be in the future
- Cannot create completion if one already exists for same habit + day

**State Transitions**:
```
Habit State Machine (Streak):
- Initial: current_streak = 0, consecutive_misses = 0
- On completion:
  - If last_completed_at was yesterday → current_streak += 1, consecutive_misses = 0
  - If last_completed_at was today → no change (idempotent)
  - If last_completed_at was 2+ days ago → current_streak = 1, consecutive_misses = 0
- On miss detection:
  - First miss: consecutive_misses = 1 → emit HABIT_MISS_DETECTED
  - Second consecutive miss: current_streak = 0, consecutive_misses = 0 → emit HABIT_STREAK_RESET
```

*See [data-model.md](./data-model.md) for complete schema*

### API Contracts

**Endpoint 1: Complete Habit**
```
POST /api/{user_id}/habits/{id}/complete
Request Body: { "completion_type": "full" | "two_minute" }
Response 201: { "habit_id": "uuid", "current_streak": 5, "completion": {...} }
Response 409: { "error": "Completion already exists for today" }
```

**Endpoint 2: Get Completion History**
```
GET /api/{user_id}/habits/{id}/completions?start_date=2026-01-01&end_date=2026-01-31
Response 200: { "completions": [{...}], "total": 15 }
```

**Endpoint 3: Get Streak Info**
```
GET /api/{user_id}/habits/{id}/streak
Response 200: { "current_streak": 5, "last_completed_at": "2026-01-10T07:30:00Z", "consecutive_misses": 0 }
```

**Endpoint 4: Undo Completion**
```
DELETE /api/{user_id}/habits/{id}/completions/{completion_id}
Response 200: { "deleted": true, "recalculated_streak": 4 }
```

*See [contracts/](./contracts/) for OpenAPI 3.1 specs*

### Quickstart for Developers

*See [quickstart.md](./quickstart.md) for full guide*

**Prerequisites**: Node.js 20+, Python 3.13+, PostgreSQL (Neon account)

**Setup Steps**:
1. Apply database migrations: `cd apps/api && alembic upgrade head`
2. Install dependencies: `npm install` (root), `uv sync` (apps/api)
3. Start backend: `cd apps/api && uv run uvicorn src.main:app --reload`
4. Start frontend: `cd apps/web && npm run dev`
5. Test completion: Create habit → Mark complete → Verify streak

**Key Files to Understand**:
- `apps/api/src/services/streak_calculator.py` - Streak calculation logic
- `apps/web/src/components/habits/CompletionCheckbox.tsx` - Completion UI
- `apps/web/src/lib/sound-player.ts` - Web Audio API wrapper

*See [quickstart.md](./quickstart.md) for complete developer guide*

## Phase 2: Task Breakdown

*Tasks will be generated by `/sp.tasks` command based on this plan*

Tasks will cover:
1. Database migration (add habit_completions table, extend habits table)
2. Backend completion endpoints (4 endpoints)
3. Streak calculation service (unit tests first)
4. Miss detection background job
5. Event emission (3 event types)
6. Frontend completion checkbox component
7. Sound player utility (Web Audio API)
8. Streak counter component
9. Completion history component
10. Notification banner component
11. Integration tests (completion flow end-to-end)
12. Contract tests (OpenAPI validation)
13. Mobile responsiveness testing

*Run `/sp.tasks` to generate [tasks.md](./tasks.md)*

## Next Steps

1. ✅ **Phase 0 Complete**: Run research on unknowns → Generate [research.md](./research.md)
2. ✅ **Phase 1 Complete**: Design data model and contracts → Generate [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)
3. ✅ **Phase 2 Complete**: Run `/sp.tasks` to generate task breakdown → [tasks.md](./tasks.md)
4. ✅ **Implementation Complete**: All 47 tasks executed via Claude Code (Phases 1-11)
5. ⏭️ **Verification**: Run tests, verify acceptance criteria from spec

**Status**: Implementation complete. Pending final verification pass.
