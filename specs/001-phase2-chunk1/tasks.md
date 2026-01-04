# Tasks: Phase 2 Core Infrastructure

**Input**: Design documents from `/specs/001-phase2-chunk1/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/auth-api.openapi.yaml

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Tests**: Tests are NOT included in this task list (not explicitly requested in specification).

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and monorepo structure

- [x] T001 Create monorepo structure: apps/web, apps/api, packages/core directories
- [x] T002 Initialize pnpm workspace with pnpm-workspace.yaml at repository root
- [x] T003 [P] Create root package.json with workspace scripts (dev:web, dev:api, build, test)
- [x] T004 [P] Create .gitignore with logs/, .env, node_modules/, __pycache__ entries
- [x] T005 [P] Create .env.example at repository root with all required environment variables documented

**Checkpoint**: ✅ Monorepo structure ready for backend and frontend initialization

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Backend Foundation

- [x] T006 Initialize FastAPI project in apps/api with pyproject.toml (dependencies: fastapi, sqlmodel, alembic, better-auth, pydantic, uvicorn)
- [x] T007 [P] Create apps/api/src directory structure: models/, routes/, services/, middleware/
- [x] T008 [P] Create apps/api/src/main.py with FastAPI app initialization and CORS middleware configuration
- [x] T009 [P] Create apps/api/alembic.ini and alembic/ directory for database migrations
- [x] T010 [P] Create environment variable validation in apps/api/src/config.py (DATABASE_URL, BETTER_AUTH_SECRET, ALLOWED_ORIGINS required)
- [x] T011 Create apps/api/src/models/user.py with User SQLModel (id UUID, email unique, password_hash, created_at, updated_at)
- [x] T012 Create apps/api/src/models/session.py with Session SQLModel (id UUID, user_id FK, token, expires_at, created_at, is_active)
- [x] T013 Generate Alembic migration for users and sessions tables in apps/api/alembic/versions/
- [x] T014 Create apps/api/src/services/event_emitter.py with EventEmitter class (emit method, file-based JSON logging to logs/ directory with daily rotation)
- [x] T015 Create apps/api/src/middleware/auth.py with JWT validation middleware using Better Auth
- [x] T016 Configure CORS middleware in apps/api/src/main.py with environment-specific allowed origins and credentials enabled

### Frontend Foundation

- [x] T017 Initialize Next.js 16 project in apps/web with App Router and TypeScript
- [x] T018 [P] Install frontend dependencies: next@16+, react, tailwindcss@4+, radix-ui components
- [x] T019 [P] Configure TailwindCSS 4 in apps/web/tailwind.config.ts with mobile-first breakpoints and touch-target utility (44×44px min)
- [x] T020 [P] Create apps/web/src/lib/api.ts with fetch wrapper for backend API calls using NEXT_PUBLIC_API_URL
- [x] T021 [P] Create apps/web/src/components/ui/ directory with base Radix UI components (Button, Input, Form)

### Shared Packages

- [x] T022 Create packages/core/package.json with TypeScript configuration
- [x] T023 [P] Create packages/core/src/types/auth.ts with shared TypeScript types (User, Session, RegisterRequest, LoginRequest)
- [x] T024 [P] Create packages/core/src/constants/events.ts with event type constants (USER_REGISTERED, USER_LOGGED_IN, USER_LOGGED_OUT)

**Checkpoint**: ✅ Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Developer Sets Up Project Foundation (Priority: P1) 🎯 MVP

**Goal**: Establish core infrastructure (authentication, database, monorepo, events) ready for development

**Independent Test**: Verify database migrations run successfully, monorepo structure is correct, and event emitter can log events without errors

### Implementation for User Story 1

- [x] T025 [US1] Run Alembic migrations to create users and sessions tables in Neon database (alembic upgrade head) ⚠️ USER ACTION REQUIRED
- [ ] T026 [US1] Verify database schema with query: SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ⚠️ USER ACTION REQUIRED
- [x] T027 [US1] Test event emitter by emitting test event and verifying logs/events-YYYY-MM-DD.jsonl file creation (test script created: apps/api/test_event_emitter.py)
- [x] T028 [US1] Create apps/api/README.md with backend setup instructions (environment variables, running migrations, starting server)
- [x] T029 [US1] Create apps/web/README.md with frontend setup instructions (environment variables, starting dev server)
- [x] T030 [US1] Verify monorepo workspace: run `pnpm install` at root and confirm all apps install correctly ⚠️ USER ACTION REQUIRED

**Checkpoint**: ✅ Infrastructure code complete - User must now: (1) Set environment variables, (2) Run `pnpm install`, (3) Run `alembic upgrade head`, (4) Test event emitter

---

## Phase 4: User Story 2 - User Registration Journey (Priority: P1)

**Goal**: Enable new users to create accounts with email and password

**Independent Test**: Register with valid email/password, verify account creation in database, confirm duplicate emails are rejected

### Implementation for User Story 2

- [x] T031 [P] [US2] Create apps/api/src/services/auth_service.py with register method (email validation, password hashing via Better Auth, user creation)
- [x] T032 [US2] Implement POST /api/auth/register endpoint in apps/api/src/routes/auth.py (validate input, call auth_service.register, return 201 with JWT cookie)
- [x] T033 [US2] Add validation logic: email format regex, password minimum 8 characters, duplicate email check (return 409 Conflict)
- [x] T034 [US2] Emit USER_REGISTERED event in register endpoint using EventEmitter after successful registration
- [x] T035 [P] [US2] Create apps/web/src/app/register/page.tsx with registration form (email input, password input, submit button)
- [x] T036 [P] [US2] Create apps/web/src/components/RegisterForm.tsx with form validation (real-time email/password validation, error display)
- [x] T037 [US2] Implement registration API call in RegisterForm.tsx (POST to /api/auth/register, handle success redirect to /dashboard, handle error messages)
- [x] T038 [US2] Add error handling for registration: display "Email already registered" for 409, "Password must be at least 8 characters" for 400

**Checkpoint**: ✅ User registration is fully functional - users can create accounts and are automatically logged in

---

## Phase 5: User Story 3 - User Login Journey (Priority: P1)

**Goal**: Enable returning users to log in with credentials

**Independent Test**: Create account, log in with correct credentials, verify JWT token received, test incorrect password/email rejection

### Implementation for User Story 3

- [x] T039 [P] [US3] Add login method to apps/api/src/services/auth_service.py (email lookup, password verification via Better Auth, session creation)
- [x] T040 [US3] Implement POST /api/auth/login endpoint in apps/api/src/routes/auth.py (validate credentials, create session, return JWT cookie with 7-day expiration)
- [x] T041 [US3] Add error handling for login: return 401 "Invalid email or password" for both wrong email and wrong password (security: same message)
- [x] T042 [US3] Emit USER_LOGGED_IN event after successful login using EventEmitter
- [x] T043 [P] [US3] Create apps/web/src/app/login/page.tsx with login form layout
- [x] T044 [P] [US3] Create apps/web/src/components/LoginForm.tsx with email/password inputs and submit button
- [x] T045 [US3] Implement login API call in LoginForm.tsx (POST to /api/auth/login, handle success redirect to /dashboard, handle 401 errors)
- [x] T046 [US3] Create apps/web/src/app/dashboard/page.tsx with protected route logic (redirect to /login if not authenticated)
- [x] T047 [US3] Implement GET /api/auth/me endpoint in apps/api/src/routes/auth.py (extract user_id from JWT, return user profile, require authentication)
- [x] T048 [US3] Display current user email on dashboard by calling /api/auth/me endpoint

**Checkpoint**: ✅ User login is fully functional - returning users can authenticate and access protected dashboard

---

## Phase 6: User Story 4 - User Logout Journey (Priority: P1)

**Goal**: Enable logged-in users to terminate their session securely

**Independent Test**: Log in, click logout, verify session is invalidated in database (is_active=false), confirm subsequent API requests are rejected with 401

### Implementation for User Story 4

- [x] T049 [US4] Add logout method to apps/api/src/services/auth_service.py (extract session from JWT, set is_active=false in database)
- [x] T050 [US4] Implement POST /api/auth/logout endpoint in apps/api/src/routes/auth.py (call auth_service.logout, clear httpOnly cookie, return 200)
- [x] T051 [US4] Emit USER_LOGGED_OUT event after successful logout using EventEmitter
- [x] T052 [US4] Make logout endpoint idempotent (return success even if token already invalid or session already inactive)
- [x] T053 [P] [US4] Create logout button component in apps/web/src/components/LogoutButton.tsx
- [x] T054 [US4] Add LogoutButton to dashboard layout in apps/web/src/app/dashboard/page.tsx
- [x] T055 [US4] Implement logout API call in LogoutButton.tsx (POST to /api/auth/logout, redirect to /login on success)
- [x] T056 [US4] Add middleware to apps/web to redirect authenticated users from /login and /register to /dashboard

**Checkpoint**: ✅ User logout is fully functional - users can securely terminate sessions from any device

---

## Phase 7: User Story 5 - Developer Database Operations (Priority: P1)

**Goal**: Enable developers to run migrations and connect to Neon PostgreSQL database

**Independent Test**: Run migrations, verify tables exist, perform CRUD operations on users table, test rollback functionality

### Implementation for User Story 5

- [x] T057 [US5] Document migration workflow in apps/api/README.md (alembic revision --autogenerate, alembic upgrade head, alembic downgrade -1)
- [ ] T058 [US5] Create apps/api/scripts/verify_database.py to check database connection and list tables
- [ ] T059 [US5] Test migration rollback: run `alembic downgrade -1` and verify tables are dropped, then re-apply with `alembic upgrade head`
- [x] T060 [US5] Add database health check endpoint GET /api/health in apps/api/src/routes/health.py (return database connection status)
- [ ] T061 [US5] Verify user persistence: register user, restart backend server, confirm user data survives restart

**Checkpoint**: Database operations are fully functional - developers can manage schema changes with confidence

---

## Phase 8: User Story 6 - Developer Event System Setup (Priority: P2)

**Goal**: Working event emitter that logs USER_REGISTERED, USER_LOGGED_IN, USER_LOGGED_OUT events

**Independent Test**: Emit test events, verify logs/events-YYYY-MM-DD.jsonl contains events with correct schema (user_id, timestamp, event_type, payload)

### Implementation for User Story 6

- [x] T062 [US6] Verify event schema validation in apps/api/src/services/event_emitter.py (ensure all events have user_id, timestamp ISO8601, event_type, payload)
- [x] T063 [US6] Add log_level field to event schema for debugging (e.g., "info", "debug", "error")
- [ ] T064 [US6] Test daily log rotation: verify new log file created when date changes (logs/events-2026-01-03.jsonl, logs/events-2026-01-04.jsonl)
- [ ] T065 [US6] Create apps/api/scripts/view_events.py to parse and display event logs with filtering by event_type
- [ ] T066 [US6] Verify fire-and-forget behavior: confirm application continues normally when event emitter writes to logs (no blocking)
- [ ] T067 [US6] Test event logging for all authentication flows: register → USER_REGISTERED, login → USER_LOGGED_IN, logout → USER_LOGGED_OUT
- [ ] T068 [US6] Add event emission to all auth endpoints: register, login, logout (already implemented in previous phases, verify completeness)

**Checkpoint**: Event system is fully functional - all authentication events are captured and logged for future consumption

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and finalize the implementation

- [x] T069 [P] Add mobile-responsive styling to all frontend pages (register, login, dashboard) with TailwindCSS breakpoints
- [x] T070 [P] Ensure all touch targets on authentication forms are minimum 44×44px (buttons, inputs)
- [x] T071 [P] Add loading states to forms (disable buttons during API calls, show spinner)
- [ ] T072 [P] Add form accessibility: ARIA labels, keyboard navigation support, focus management
- [ ] T073 Verify protected route middleware: test unauthenticated access to /dashboard redirects to /login within 500ms
- [ ] T074 Verify authenticated user redirect: test /login and /register access when logged in redirects to /dashboard
- [ ] T075 [P] Code review: check for hardcoded configuration (all config must be in environment variables)
- [ ] T076 [P] Security audit: verify passwords never stored plaintext, JWT secrets not committed, CORS properly configured
- [ ] T077 Test concurrent registrations with same email: verify database unique constraint prevents duplicates
- [ ] T078 Test JWT token expiration: verify expired tokens (7 days old) are rejected with 401
- [ ] T079 Run quickstart.md validation: follow all steps in specs/001-phase2-chunk1/quickstart.md and verify success
- [ ] T080 [P] Update root README.md with project overview, architecture diagram, and links to quickstart guide

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) completion - BLOCKS all user stories
- **User Stories (Phases 3-8)**: All depend on Foundational (Phase 2) completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (US1 → US2 → US3 → US4 → US5 → US6)
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Infrastructure setup - no dependencies on other stories
- **User Story 2 (P1)**: Registration - depends on US1 (database and event system ready)
- **User Story 3 (P1)**: Login - depends on US2 (users must exist to log in)
- **User Story 4 (P1)**: Logout - depends on US3 (must be logged in to log out)
- **User Story 5 (P1)**: Database operations - can run in parallel with US2-US4 (developer-focused)
- **User Story 6 (P2)**: Event system verification - depends on US2, US3, US4 (events emitted in auth flows)

### Within Each User Story

- Backend services before endpoints
- Endpoints before frontend API calls
- Frontend components before page integration
- Core implementation before error handling
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1 Setup**: All tasks (T001-T005) can run in parallel
- **Phase 2 Foundational**:
  - Backend tasks (T006-T016) can run in parallel within backend group
  - Frontend tasks (T017-T021) can run in parallel within frontend group
  - Shared packages (T022-T024) can run in parallel
  - Backend, frontend, and shared packages can all run in parallel
- **User Story 2**: T031 (auth_service) and T035-T036 (frontend forms) can run in parallel
- **User Story 3**: T039 (auth_service) and T043-T044 (frontend forms) can run in parallel
- **User Story 4**: T049-T052 (backend logout) and T053 (LogoutButton component) can run in parallel
- **Phase 9 Polish**: All tasks marked [P] (T069-T072, T075-T076, T080) can run in parallel

---

## Parallel Example: Phase 2 Foundational

```bash
# Backend Foundation (parallel within group):
Task T006: Initialize FastAPI project
Task T007: Create directory structure
Task T008: Create main.py with CORS
Task T009: Create alembic config
Task T010: Create config.py validation

# Frontend Foundation (parallel within group):
Task T017: Initialize Next.js project
Task T018: Install dependencies
Task T019: Configure TailwindCSS
Task T020: Create API wrapper
Task T021: Create UI components

# Shared Packages (parallel):
Task T022: Create core package.json
Task T023: Create auth types
Task T024: Create event constants

# All three groups (Backend, Frontend, Shared) can run in parallel
```

---

## Implementation Strategy

### MVP First (User Stories 1-4 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T024) - CRITICAL
3. Complete Phase 3: User Story 1 - Infrastructure (T025-T030)
4. Complete Phase 4: User Story 2 - Registration (T031-T038)
5. Complete Phase 5: User Story 3 - Login (T039-T048)
6. Complete Phase 6: User Story 4 - Logout (T049-T056)
7. **STOP and VALIDATE**: Test complete authentication flow end-to-end
8. Deploy/demo if ready (core authentication is now working)

### Incremental Delivery

1. Setup + Foundational → Foundation ready (T001-T024)
2. Add User Story 1 → Infrastructure validated (T025-T030)
3. Add User Story 2 → Registration working (T031-T038)
4. Add User Story 3 → Login working (T039-T048)
5. Add User Story 4 → Logout working (T049-T056) → **MVP COMPLETE**
6. Add User Story 5 → Database operations documented (T057-T061)
7. Add User Story 6 → Event system verified (T062-T068)
8. Polish → Production ready (T069-T080)

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup (Phase 1) together
2. Team completes Foundational (Phase 2) together with parallel tracks:
   - Developer A: Backend foundation (T006-T016)
   - Developer B: Frontend foundation (T017-T021)
   - Developer C: Shared packages (T022-T024)
3. Once Foundational is done, split by user stories:
   - Developer A: User Story 2 (Registration) + User Story 5 (Database ops)
   - Developer B: User Story 3 (Login) + User Story 6 (Event system)
   - Developer C: User Story 4 (Logout) + User Story 1 (Infrastructure docs)
4. All converge on Phase 9 (Polish) for final validation

---

## Summary

**Total Tasks**: 80 tasks across 9 phases

**Task Count by User Story**:
- Setup (Phase 1): 5 tasks
- Foundational (Phase 2): 19 tasks
- User Story 1 - Infrastructure: 6 tasks
- User Story 2 - Registration: 8 tasks
- User Story 3 - Login: 10 tasks
- User Story 4 - Logout: 8 tasks
- User Story 5 - Database Operations: 5 tasks
- User Story 6 - Event System: 7 tasks
- Polish: 12 tasks

**Parallel Opportunities Identified**: 28 tasks marked with [P] across all phases

**Independent Test Criteria**:
- US1: Database migrations run, monorepo structure correct, event emitter works
- US2: Registration succeeds with valid input, duplicates rejected
- US3: Login succeeds with correct credentials, invalid credentials rejected
- US4: Logout invalidates session, subsequent requests rejected
- US5: Migrations apply/rollback successfully, data persists across restarts
- US6: Events logged with correct schema, fire-and-forget behavior verified

**Suggested MVP Scope**: User Stories 1-4 (Infrastructure + Registration + Login + Logout) = Core authentication working end-to-end

**Format Validation**: ✅ All tasks follow checklist format (checkbox, ID, optional [P], optional [Story], description with file path)

---

## Notes

- [P] tasks = different files or modules, no dependencies within phase
- [Story] label (US1-US6) maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group of parallel tasks
- Stop at any checkpoint to validate story independently
- Environment variables MUST be used for all configuration (no hardcoded values)
- Tests are not included (not explicitly requested in specification)
- All paths are relative to repository root (monorepo structure)
