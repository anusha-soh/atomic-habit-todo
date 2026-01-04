# Implementation Plan: Phase 2 Chunk 2 - Tasks Full Feature Set

**Branch**: `002-phase2-chunk2` | **Date**: 2026-01-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-phase2-chunk2/spec.md`

**Note**: This plan implements the complete task management system with all 9 features (CRUD, priorities, tags, search, filter, sort, due dates) as defined in the specification.

## Summary

Build a complete task management system for Phase 2 Chunk 2, delivering all 9 task features required by the constitution. This chunk focuses exclusively on tasks (habits come in Chunk 3) and includes: full CRUD operations, priority levels (high/medium/low), tags/categories, search & filter capabilities, sorting options, and due date management. The system builds on Chunk 1's authentication and database infrastructure, implements event-driven architecture for task lifecycle events, and follows mobile-first responsive design principles.

**Technical Approach**: Extend existing FastAPI backend with task routes and SQLModel task models, implement PostgreSQL full-text search for case-insensitive title/description matching, create Next.js frontend task pages with React Server Components for list/detail/edit views, emit task events (CREATED/UPDATED/COMPLETED/DELETED) using the event emitter from Chunk 1, and deploy database migrations via Alembic for tasks table schema.

## Technical Context

**Language/Version**: Python 3.13+ (backend), TypeScript 5.8+ (frontend)
**Primary Dependencies**: FastAPI 0.115+, SQLModel 0.0.22+, Neon Serverless PostgreSQL, Next.js 16+, TailwindCSS 4+, Radix UI
**Storage**: Neon Serverless PostgreSQL (from Chunk 1), tasks table with user_id foreign key
**Testing**: pytest (backend), Vitest + React Testing Library (frontend), Postman/curl for API contract tests
**Target Platform**: Linux server (Render backend), Vercel (frontend), browser (Chrome/Safari/Firefox latest)
**Project Type**: Web application (monorepo: apps/api + apps/web)
**Performance Goals**: <3s task creation end-to-end, <1s search for 1000 tasks, <1s page load, API <200ms p95
**Constraints**: <200ms p95 API latency, 1000 tasks per user scalability, mobile-first (44×44px touch targets), zero cross-user data leakage
**Scale/Scope**: 10k users, 1M tasks total, 6 API endpoints, 3 frontend pages, ~1500 LOC backend + ~1200 LOC frontend

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Spec-Driven Development is Mandatory
**Status**: ✅ PASS
- Feature began with approved spec in `specs/002-phase2-chunk2/spec.md`
- This plan generated from spec via `/sp.plan` command
- Code generation will occur only after tasks approval via `/sp.tasks`

### Principle III: Modular Architecture with Feature Flags
**Status**: ✅ PASS
- Tasks are part of Core module (auth, tasks, events)
- Core module works standalone without Habits module (Chunk 3)
- No feature flags needed for tasks (core functionality)

### Principle IV: Event-Driven Design from Phase II Onwards
**Status**: ✅ PASS
- Task events emit to event bus: TASK_CREATED, TASK_UPDATED, TASK_COMPLETED, TASK_DELETED
- Events follow schema: `{ user_id, timestamp, event_type, payload }`
- Events are fire-and-forget (non-blocking)
- Habits module (Chunk 3) will subscribe to task events without modifying tasks table

### Principle VI: Database as Single Source of Truth
**Status**: ✅ PASS
- All task data persists in PostgreSQL tasks table
- Backend services stateless (no in-memory task storage)
- Frontend React state ephemeral (fetches from API)
- Session tokens in httpOnly cookies validated against database

### Principle VII: Mobile-First Responsive Design
**Status**: ✅ PASS
- All task UI components designed for mobile first
- Touch targets 44×44px minimum per spec
- Responsive breakpoints: mobile (default) → tablet (768px+) → desktop (1024px+)
- Filter/sort controls in thumb-reachable zone

### Principle VIII: API-First Architecture
**Status**: ✅ PASS
- Backend API endpoints defined before frontend
- OpenAPI 3.1 schema auto-generated from FastAPI decorators
- API contracts documented in `/contracts/` directory
- Frontend will use API contract for mocking during development

### Principle IX: Progressive Complexity Across Phases
**Status**: ✅ PASS
- Only Phase 2 Chunk 2 features in scope (tasks)
- No Habits features (Chunk 3), no habit-task connection (Chunk 5)
- No recurring tasks (Phase V), no dependencies/subtasks (out of scope)
- Chunk 1 completed before starting Chunk 2

### Principle X: Test Specs, Not Implementation
**Status**: ✅ PASS
- Tests will verify acceptance criteria from spec (36 scenarios)
- API tests verify OpenAPI contract, not DB queries
- Integration tests exercise user journeys (create → filter → complete)
- No mocking of internal modules

### Principle XI: No Hardcoded Configuration
**Status**: ✅ PASS
- Database connection from environment variables (DATABASE_URL)
- Feature behavior controlled by env vars (pagination size, etc.)
- `.env.example` documents required variables
- No hardcoded API URLs or secrets

**Overall**: ✅ ALL GATES PASS - Proceed to Phase 0 Research

## Project Structure

### Documentation (this feature)

```text
specs/002-phase2-chunk2/
├── plan.md              # This file (/sp.plan command output)
├── spec.md              # Feature specification (completed)
├── research.md          # Phase 0 output (generated below)
├── data-model.md        # Phase 1 output (generated below)
├── quickstart.md        # Phase 1 output (generated below)
├── contracts/           # Phase 1 output (OpenAPI schemas)
│   └── tasks-api.yaml
├── checklists/          # Quality validation
│   └── requirements.md  # Spec quality checklist (completed)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
apps/
├── api/                 # FastAPI backend
│   ├── src/
│   │   ├── models/
│   │   │   ├── user.py             # Existing from Chunk 1
│   │   │   ├── session.py          # Existing from Chunk 1
│   │   │   └── task.py             # NEW: Task SQLModel
│   │   ├── services/
│   │   │   ├── auth_service.py     # Existing from Chunk 1
│   │   │   ├── event_emitter.py    # Existing from Chunk 1
│   │   │   └── task_service.py     # NEW: Task business logic
│   │   ├── routes/
│   │   │   ├── auth.py             # Existing from Chunk 1
│   │   │   └── tasks.py            # NEW: Task API endpoints
│   │   ├── middleware/
│   │   │   └── auth.py             # Existing from Chunk 1
│   │   ├── database.py             # Existing from Chunk 1
│   │   ├── config.py               # Existing from Chunk 1
│   │   └── main.py                 # Update: register tasks routes
│   └── tests/
│       ├── unit/
│       │   └── test_task_service.py    # NEW: Task logic tests
│       ├── integration/
│       │   └── test_tasks_api.py       # NEW: API integration tests
│       └── contract/
│           └── test_tasks_contract.py  # NEW: OpenAPI contract tests
│
└── web/                 # Next.js 16 frontend
    ├── src/
    │   ├── app/
    │   │   ├── (auth)/
    │   │   │   ├── login/          # Existing from Chunk 1
    │   │   │   ├── register/       # Existing from Chunk 1
    │   │   │   └── dashboard/      # Existing from Chunk 1
    │   │   ├── tasks/              # NEW: Task management pages
    │   │   │   ├── page.tsx        # Task list with filters/search/sort
    │   │   │   ├── new/
    │   │   │   │   └── page.tsx    # Create task form
    │   │   │   └── [id]/
    │   │   │       ├── page.tsx    # Task detail/edit
    │   │   │       └── loading.tsx # Loading state
    │   │   ├── layout.tsx          # Existing from Chunk 1
    │   │   └── page.tsx            # Existing from Chunk 1
    │   ├── components/
    │   │   ├── auth/               # Existing from Chunk 1
    │   │   └── tasks/              # NEW: Task components
    │   │       ├── TaskList.tsx    # Task list with pagination
    │   │       ├── TaskCard.tsx    # Individual task card
    │   │       ├── TaskForm.tsx    # Create/edit task form
    │   │       ├── TaskFilters.tsx # Filter/sort controls
    │   │       ├── TaskSearch.tsx  # Search input
    │   │       └── PriorityBadge.tsx # Priority indicator
    │   ├── lib/
    │   │   ├── api.ts              # Existing from Chunk 1
    │   │   └── tasks-api.ts        # NEW: Task API client
    │   └── types/
    │       └── task.ts             # NEW: Task TypeScript types
    └── tests/
        └── tasks/
            ├── TaskList.test.tsx
            ├── TaskForm.test.tsx
            └── TaskFilters.test.tsx
```

**Structure Decision**: Using existing monorepo structure from Chunk 1 (web application pattern with apps/api + apps/web). This chunk extends the Core module with task features. Backend adds task model, service, and routes. Frontend adds task pages and components. All changes are additive (no modifications to existing auth/session code except registering new routes in main.py).

## Complexity Tracking

> **No violations detected** - all constitution principles satisfied without exceptions.

---

## Phase 0: Research & Technology Decisions

### Research Questions

Based on Technical Context analysis, the following areas require research to resolve implementation approaches:

1. **PostgreSQL Full-Text Search**: How to implement case-insensitive search across title and description fields for 1000+ tasks while meeting <1s performance target?

2. **Tag Array Storage & Filtering**: What's the best way to store tags (PostgreSQL array vs. separate tags table) for filtering by multiple tags with good query performance?

3. **Pagination Strategy**: What pagination approach (offset-based vs. cursor-based) works best for task lists with dynamic filtering and sorting?

4. **Event Emission Integration**: How to hook task service methods into existing event emitter from Chunk 1 without tight coupling?

5. **Frontend State Management**: How to manage task list state (filters, sort, search) with Next.js App Router and Server Components while keeping URL shareable?

6. **Due Date Display**: What library/approach for human-readable date formatting ("Today", "Tomorrow", "Overdue") that works client-side and server-side?

### Research Execution

I'll now generate `research.md` with findings for each question.

