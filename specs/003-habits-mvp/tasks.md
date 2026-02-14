# Tasks: Phase 2 Chunk 3: Habits MVP

**Input**: Design documents from `/specs/003-habits-mvp/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/habits-api.yaml, ADR-006

**Tests**: Full TDD (Test-Driven Development) approach following Constitution Principle X. Tests are written BEFORE implementation and must FAIL before code is written.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Monorepo structure**: `apps/api/src/` (backend), `apps/web/src/` (frontend)
- **Backend**: Python 3.13+, FastAPI, SQLModel, Neon PostgreSQL
- **Frontend**: TypeScript 5.8+, Next.js 16+, TailwindCSS 4+, Radix UI
- **Backend Tests**: `apps/api/tests/` (unit/, contract/, integration/)
- **Frontend Tests**: `apps/web/__tests__/habits/`
- **Database**: PostgreSQL required (JSONB for recurring_schedule, no SQLite support)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and database schema preparation

- [X] T001 Create database migration for habits table in apps/api/alembic/versions/003_create_habits_table.py with all fields (id, user_id, identity_statement, full_description, two_minute_version, habit_stacking_cue, anchor_habit_id, motivation, category, recurring_schedule JSONB, status, current_streak, last_completed_at, consecutive_misses, timestamps), indexes (user_id, user_status, user_category, anchor_habit_id, GIN on recurring_schedule), constraints (identity/two_minute not empty, status enum, category enum), triggers (updated_at auto-update), and foreign keys (user_id CASCADE, anchor_habit_id SET NULL per ADR-006)
- [X] T002 [P] Create database migration for habit_completions table in apps/api/alembic/versions/003_create_habits_table.py with fields (id, habit_id, user_id, completed_at, completion_type) and indexes (habit+date DESC, user+date DESC) for Phase 2 Chunk 4 preparation
- [X] T003 Update apps/api/src/config.py to include ENABLE_HABITS_MODULE feature flag (default: true for Phase 2+)
- [X] T004 Run Alembic migration to create habits and habit_completions tables: `cd apps/api && alembic upgrade head`
- [X] T005 [P] Verify database schema in PostgreSQL: `psql $DATABASE_URL -c "\d habits"` and confirm all indexes/constraints created

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core habit infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Core Models and Schemas

- [X] T006 Create Habit SQLModel in apps/api/src/models/habit.py with all fields (id, user_id, identity_statement TEXT, full_description TEXT, two_minute_version TEXT, habit_stacking_cue TEXT, anchor_habit_id UUID FK, motivation TEXT, category VARCHAR(50), recurring_schedule JSONB, status VARCHAR(20) default 'active', current_streak INT default 0, last_completed_at TIMESTAMPTZ, consecutive_misses INT default 0, created_at, updated_at) and validators (@field_validator for identity_statement: not empty/trim/max 2000, two_minute_version: not empty/trim/max 500, status: active|archived, category: enum validation per ADR-006)
- [X] T007 [P] Create RecurringSchedule Pydantic validation model in apps/api/src/models/habit.py with schema (type: Literal["daily"|"weekly"|"monthly"], until: Optional[str] ISO date, days: Optional[list[int]] for weekly 0-6, day_of_month: Optional[int] for monthly 1-31) and validators (type-specific: weekly requires days array, monthly requires day_of_month, days values 0-6, day_of_month 1-31 per ADR-006 JSONB decision)
- [X] T008 [P] Create HabitCreate schema in apps/api/src/schemas/habit_schemas.py with fields (identity_statement: str required 1-2000 chars, full_description: Optional[str] max 5000, two_minute_version: str required 1-500 chars, habit_stacking_cue: Optional[str] max 500, anchor_habit_id: Optional[UUID], motivation: Optional[str] max 2000, category: str enum, recurring_schedule: dict RecurringSchedule validated)
- [X] T009 [P] Create HabitUpdate schema in apps/api/src/schemas/habit_schemas.py with all fields optional for partial updates (identity_statement, full_description, two_minute_version, habit_stacking_cue, anchor_habit_id, motivation, category, recurring_schedule, status)
- [X] T010 [P] Create HabitResponse schema in apps/api/src/schemas/habit_schemas.py with all Habit fields (id, user_id, identity_statement, full_description, two_minute_version, habit_stacking_cue, anchor_habit_id, motivation, category, recurring_schedule, status, current_streak, last_completed_at, consecutive_misses, created_at, updated_at) and HabitListResponse with pagination (habits: list[HabitResponse], total: int, page: int, limit: int)

### Core Services and Routes

- [X] T011 Create HabitService class in apps/api/src/services/habit_service.py with EventEmitter dependency injection (__init__(session: Session, event_emitter: EventEmitter)), method stubs (create_habit, get_habits, get_habit, update_habit, delete_habit, validate_no_circular_dependency), and user isolation enforcement (all queries include WHERE user_id = authenticated_user_id)
- [X] T012 [P] Create habits API routes in apps/api/src/routes/habits.py with FastAPI router and endpoint stubs (POST /api/{user_id}/habits, GET /api/{user_id}/habits, GET /api/{user_id}/habits/{habit_id}, PATCH /api/{user_id}/habits/{habit_id}, DELETE /api/{user_id}/habits/{habit_id}) and authentication middleware (validate user_id matches JWT claims)
- [X] T013 Register habits router in apps/api/src/main.py by importing and including router: `from src.routes import habits; app.include_router(habits.router, prefix="/api", tags=["habits"])`
- [X] T014 [P] Create Habit TypeScript types in apps/web/src/types/habit.ts (Habit interface matching HabitResponse, RecurringSchedule type, HabitStatus enum: active|archived, HabitCategory enum: 8 categories, HabitFilters for query params)
- [X] T015 [P] Create habit API client functions in apps/web/src/lib/api/habits.ts (getHabits(filters?: HabitFilters): Promise<HabitListResponse>, createHabit(data: HabitCreate): Promise<Habit>, getHabit(id: string): Promise<Habit>, updateHabit(id: string, data: HabitUpdate): Promise<Habit>, deleteHabit(id: string): Promise<void>) with error handling and authentication headers

### Test Infrastructure Setup

- [X] T016 Create test fixtures in apps/api/tests/conftest.py: sample_habit fixture (returns Habit with identity_statement="I am a person who reads daily", two_minute_version="Read one page", category="Learning", recurring_schedule={"type":"daily"}, status="active"), sample_habits_multiple fixture (returns 3 habits in different categories), sample_habit_with_anchor fixture (returns 2 habits with stacking relationship)
- [X] T017 [P] Update pytest configuration in apps/api/pytest.ini to include habit test markers: markers = "unit, contract, integration, US1, US2, US3, US4, habits"
- [X] T018 [P] Create test helpers in apps/api/tests/helpers/habit_helpers.py: create_test_habit(session, user_id, overrides={}), assert_habit_equals(habit1, habit2, exclude_fields=[]), mock_event_emitter() returning Mock with emit method
- [X] T019 [P] Update Vitest configuration in apps/web/vitest.config.ts to include habit test paths: test.include = ["**/__tests__/habits/**/*.test.{ts,tsx}"]

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create Identity-Driven Habit (Priority: P1) 🎯 MVP

**Goal**: Users can create habits starting with "I am a person who..." identity statements and mandatory 2-minute versions

**Independent Test**: Navigate to /habits/new, enter identity statement "I am a person who exercises daily" with 2-minute version "Put on running shoes", save, and verify redirection to habit list with the new habit visible showing both identity and starter version.

**Acceptance Criteria (from spec.md US1)**:
- AC1: Identity statement + required fields → habit saved, redirect to list
- AC2: Empty identity statement → validation error, submission prevented

### Tests for User Story 1 (TDD - Write First, Ensure FAIL) ⚠️

**Contract Tests** (API schema validation):
- [X] T020 [P] [US1] Write contract test for POST /api/{user_id}/habits in apps/api/tests/contract/test_habits_contract.py verifying request body matches HabitCreate schema (identity_statement required, two_minute_version required, category enum, recurring_schedule JSONB structure) and response matches HabitResponse schema (all fields present, status=active, streak=0, timestamps UTC) per contracts/habits-api.yaml (should FAIL)
- [X] T021 [P] [US1] Write contract test for GET /api/{user_id}/habits in apps/api/tests/contract/test_habits_contract.py verifying response matches HabitListResponse schema (habits array, total count, pagination fields) per contracts/habits-api.yaml (should FAIL)

**Unit Tests** (business logic):
- [X] T022 [P] [US1] Write unit test for Habit model identity_statement validator in apps/api/tests/unit/test_habit_model.py testing: empty string raises ValueError("Identity statement cannot be empty"), whitespace-only raises ValueError, string > 2000 chars raises ValueError, valid string trims whitespace and accepts (should FAIL)
- [X] T023 [P] [US1] Write unit test for Habit model two_minute_version validator in apps/api/tests/unit/test_habit_model.py testing: empty string raises ValueError("2-minute version cannot be empty"), string > 500 chars raises ValueError, valid string trims whitespace and accepts (should FAIL)
- [X] T024 [P] [US1] Write unit test for Habit model category validator in apps/api/tests/unit/test_habit_model.py testing: invalid category raises ValueError with list of valid categories, each valid category (Health & Fitness, Productivity, Mindfulness, Learning, Social, Finance, Creative, Other) accepts per ADR-006 fixed categories decision (should FAIL)
- [X] T025 [P] [US1] Write unit test for Habit model status validator in apps/api/tests/unit/test_habit_model.py testing: invalid status raises ValueError, active/archived accepts, default is active per ADR-006 two-state enum decision (should FAIL)
- [X] T026 [P] [US1] Write unit test for RecurringSchedule validation in apps/api/tests/unit/test_habit_model.py testing: daily type with until date accepts, weekly type without days array raises ValueError, weekly with days=[1,3,5] accepts, weekly with days=[7] raises ValueError("Days must be 0-6"), monthly without day_of_month raises ValueError, monthly with day_of_month=1 accepts, monthly with day_of_month=32 raises ValueError per ADR-006 JSONB schedule decision (should FAIL)
- [X] T027 [P] [US1] Write unit test for HabitService.create_habit() in apps/api/tests/unit/test_habit_service.py testing: valid data creates habit, identity_statement validation enforced, HABIT_CREATED event emitted with correct payload (event_type, user_id, timestamp, payload with habit_id/identity_statement/category/recurring_schedule per ADR-004 event schema), user_id isolation enforced (should FAIL)
- [X] T028 [P] [US1] Write unit test for HabitService.get_habits() in apps/api/tests/unit/test_habit_service.py testing: returns only user's habits (user isolation), default filters status=active (archived excluded per ADR-006), pagination works (page=1 limit=50), empty list for new user (should FAIL)

**Integration Tests** (end-to-end API):
- [X] T029 [US1] Write integration test for POST /api/{user_id}/habits in apps/api/tests/integration/test_habit_routes.py testing: authenticated user creates habit with valid data returns 201 with habit object, database INSERT verified, HABIT_CREATED event logged to logs/events-*.jsonl, unauthenticated request returns 401, user_id mismatch returns 403, invalid data returns 400 with field-level errors (should FAIL)
- [X] T030 [US1] Write integration test for GET /api/{user_id}/habits in apps/api/tests/integration/test_habit_routes.py testing: authenticated user gets their habits (200), other user's habits excluded (user isolation verified), pagination query params work (?page=2&limit=10), filter by category works (?category=Learning), filter by status works (?status=active vs ?include_archived=true) (should FAIL)
- [X] T031 [US1] Write integration test for user isolation in apps/api/tests/integration/test_habit_routes.py testing: User A creates habit, User B cannot GET/PATCH/DELETE User A's habit (returns 404 or 403), User B can only see their own habits in list (should FAIL)

**Frontend Tests** (component behavior):
- [X] T032 [P] [US1] Write unit test for HabitForm component in apps/web/__tests__/habits/HabitForm.test.tsx testing: identity statement input renders with "I am a person who..." placeholder, identity statement required validation shows error message, two_minute_version input renders with "Make It Easy" helper text, two_minute_version required validation shows error, category dropdown shows all 8 categories, recurring schedule builder renders (daily/weekly/monthly radio buttons), form submit calls createHabit API with correct data structure, successful submit redirects to /habits (should FAIL)
- [X] T033 [P] [US1] Write unit test for HabitCard component in apps/web/__tests__/habits/HabitCard.test.tsx testing: displays identity_statement as heading, displays two_minute_version in "Starter version" section, displays category badge with color coding, displays status badge (Active/Archived), click navigates to /habits/[id] detail page (should FAIL)

### Implementation for User Story 1

**Backend Implementation**:
- [X] T034 [US1] Implement identity_statement validator in apps/api/src/models/habit.py: @field_validator("identity_statement") checks not empty after trim, max 2000 chars, returns trimmed string (GREEN - makes T022 pass)
- [X] T035 [US1] Implement two_minute_version validator in apps/api/src/models/habit.py: @field_validator("two_minute_version") checks not empty after trim, max 500 chars, returns trimmed string (GREEN - makes T023 pass)
- [X] T036 [US1] Implement category validator in apps/api/src/models/habit.py: @field_validator("category") checks value in HABIT_CATEGORIES list, raises ValueError with available categories message (GREEN - makes T024 pass)
- [X] T037 [US1] Implement status validator in apps/api/src/models/habit.py: @field_validator("status") checks value in ["active", "archived"], defaults to "active" (GREEN - makes T025 pass)
- [X] T038 [US1] Implement RecurringSchedule validation in apps/api/src/models/habit.py: @field_validator for type-specific rules (weekly requires days, monthly requires day_of_month, validate ranges) (GREEN - makes T026 pass)
- [X] T039 [US1] Implement HabitService.create_habit() in apps/api/src/services/habit_service.py: validate data, create Habit instance, session.add(), session.commit(), session.refresh(), emit HABIT_CREATED event with payload {habit_id, identity_statement, category, recurring_schedule}, return habit (GREEN - makes T027, T029 pass)
- [X] T040 [US1] Implement HabitService.get_habits() in apps/api/src/services/habit_service.py: query with user_id filter, default status=active filter (unless include_archived=true), apply category filter if provided, apply pagination (offset/limit), return {habits, total, page, limit} (GREEN - makes T028, T030 pass)
- [X] T041 [US1] Implement POST /api/{user_id}/habits endpoint in apps/api/src/routes/habits.py: authenticate user, validate user_id matches JWT, call HabitService.create_habit(), return 201 with habit, handle validation errors (400), handle auth errors (401/403) per contracts/habits-api.yaml (GREEN - makes T020, T029 pass)
- [X] T042 [US1] Implement GET /api/{user_id}/habits endpoint in apps/api/src/routes/habits.py: authenticate user, parse query params (status, category, page, limit), call HabitService.get_habits(), return 200 with paginated response per contracts/habits-api.yaml (GREEN - makes T021, T030 pass)
- [X] T043 [US1] Implement user isolation checks in apps/api/src/routes/habits.py middleware: verify authenticated user_id matches path parameter user_id, return 403 if mismatch (GREEN - makes T031 pass)

**Frontend Implementation**:
- [X] T044 [US1] Create HabitForm component in apps/web/src/components/habits/HabitForm.tsx: identity_statement textarea with placeholder "I am a person who...", two_minute_version input with "Make It Easy (2-minute version)" label, full_description textarea (optional), motivation textarea (optional), category Select with 8 options, recurring schedule builder (radio: daily/weekly/monthly, conditional fields: weekly days checkboxes 0-6, monthly day_of_month 1-31, until date picker), form validation (Zod schema matching HabitCreate), submit handler calling createHabit API, loading/error states, success redirect to /habits (GREEN - makes T032 pass)
- [X] T045 [US1] Create HabitCard component in apps/web/src/components/habits/HabitCard.tsx: Card layout with identity_statement as h3 heading, two_minute_version in "Starter version" section with icon, category Badge with color mapping (Health→green, Productivity→blue, etc.), status Badge (Active→success, Archived→neutral), recurring schedule display (e.g., "Daily" or "Mon, Wed, Fri"), onClick navigate to /habits/[id], hover state with shadow (GREEN - makes T033 pass)
- [X] T046 [US1] Create new habit page in apps/web/src/app/(authenticated)/habits/new/page.tsx: render page with "Create New Habit" heading, render HabitForm component, breadcrumb navigation (Home > Habits > New), mobile-responsive layout with 44x44px touch targets per Constitution Principle VII

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Users can create identity-driven habits with 2-minute versions, view their habit list with category filtering, and the system enforces user isolation. Run `pytest apps/api/tests/ -m US1` to verify all US1 tests pass (contract, unit, integration). Run `npm test -- __tests__/habits` to verify frontend tests pass.

---

## Phase 4: User Story 2 - Implement the 2-Minute Rule (Priority: P1)

**Goal**: Every habit displays its mandatory 2-minute starter version on the detail page to reinforce "Make It Easy" principle

**Independent Test**: Navigate to existing habit detail page (/habits/[id]) and verify both the full habit description and the 2-minute starter version are clearly displayed with visual distinction (e.g., "Starter version: Put on running shoes").

**Acceptance Criteria (from spec.md US2)**:
- AC1: 2-minute version provided → store alongside full description
- AC2: 2-minute version empty → submission prevented (already tested in US1)

### Tests for User Story 2 (TDD - Write First, Ensure FAIL) ⚠️

**Integration Tests**:
- [X] T047 [US2] Write integration test for GET /api/{user_id}/habits/{habit_id} in apps/api/tests/integration/test_habit_routes.py testing: authenticated user gets single habit (200) with all fields including two_minute_version, non-existent habit returns 404, other user's habit returns 404 (user isolation) (should FAIL)

**Frontend Tests**:
- [X] T048 [P] [US2] Write unit test for HabitDetailPage in apps/web/__tests__/habits/HabitDetailPage.test.tsx testing: fetches habit on mount, displays identity_statement as page heading, displays full_description in main section, displays two_minute_version in highlighted "Starter version" card with icon, displays motivation in separate section, loading state shows skeleton, error state shows error message (should FAIL)

### Implementation for User Story 2

- [X] T049 [US2] Implement HabitService.get_habit() in apps/api/src/services/habit_service.py: query habit by id and user_id (user isolation), return habit or raise ValueError("Habit not found"), no event emission (read operation) (GREEN - makes T047 pass)
- [X] T050 [US2] Implement GET /api/{user_id}/habits/{habit_id} endpoint in apps/api/src/routes/habits.py: authenticate user, call HabitService.get_habit(), return 200 with habit, handle not found (404) per contracts/habits-api.yaml (GREEN - makes T047 pass)
- [X] T051 [US2] Create habit detail page in apps/web/src/app/(authenticated)/habits/[id]/page.tsx: fetch habit using getHabit(id) on mount, display identity_statement as h1, display full_description in paragraph, display two_minute_version in highlighted Card with "🎯 Starter version" heading and different background color (e.g., blue-50), display motivation in "Why this habit?" section, display recurring schedule in "Schedule" section, display category and status badges, breadcrumb navigation (Home > Habits > [Habit name]), Edit button navigating to /habits/[id]/edit, mobile-responsive layout (GREEN - makes T048 pass)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Users can create habits (US1) and view habit details with 2-minute versions clearly displayed (US2). The "Make It Easy" principle is visually reinforced. Run `pytest apps/api/tests/ -m "US1 or US2"` to verify.

---

## Phase 5: User Story 3 - Habit Stacking (Priority: P2)

**Goal**: Users can link new habits to existing habits as triggers (Law 1: Make It Obvious), with circular dependency prevention enforced per ADR-006 foreign key strategy

**Independent Test**: Create Habit A "I am a person who drinks coffee". Create Habit B "I am a person who meditates" and select Habit A as anchor. Verify stacking cue auto-generates: "After I drink coffee, I will meditate". Attempt to edit Habit A to select Habit B as anchor and verify the system blocks with error "Circular dependency detected".

**Acceptance Criteria (from spec.md US3)**:
- AC1: Existing habits available → select anchor → stacking cue recorded and linked
- AC2: No existing habits → system indicates no anchor habits available

### Tests for User Story 3 (TDD - Write First, Ensure FAIL) ⚠️

**Unit Tests**:
- [X] T052 [P] [US3] Write unit test for validate_no_circular_dependency() in apps/api/tests/unit/test_habit_service.py testing: A→B→C returns True (valid chain), A→B→A returns False (circular), A→A returns False (self-reference), A→B→C→D→A returns False (deep circular), orphan habit (no anchor) returns True (should FAIL)
- [X] T053 [P] [US3] Write unit test for HabitService.delete_habit() dependency checking in apps/api/tests/unit/test_habit_service.py testing: habit with no dependents deletes successfully, habit with 2 dependents raises ValueError with list of dependent identity statements, HABIT_DELETED event payload includes had_dependencies=true/false flag (should FAIL)

**Integration Tests**:
- [ ] T054 [US3] Write integration test for habit stacking in apps/api/tests/integration/test_habit_routes.py testing: create Habit A, create Habit B with anchor_habit_id=A.id succeeds (201), create Habit C with anchor_habit_id=B.id succeeds (chain A→B→C), attempt to PATCH Habit A with anchor_habit_id=C.id fails with 400 "Circular dependency detected" (should FAIL)
- [ ] T055 [US3] Write integration test for DELETE with dependencies in apps/api/tests/integration/test_habit_routes.py testing: create Habit A, create Habit B with anchor=A, attempt DELETE Habit A returns 400 with error message listing Habit B identity statement and warning "Deleting will break stacking cue", force delete (query param ?force=true) succeeds and sets Habit B anchor_habit_id=NULL while preserving habit_stacking_cue text per ADR-006 ON DELETE SET NULL decision (should FAIL)

**Frontend Tests**:
- [ ] T056 [P] [US3] Write unit test for HabitForm anchor selector in apps/web/__tests__/habits/HabitForm.test.tsx testing: when existing habits present, anchor_habit_id Select renders with options, selecting anchor auto-generates stacking_cue preview "After I [anchor identity], I will [current identity]", when no existing habits, shows message "Create a habit first to enable stacking", stacking_cue textarea allows manual editing (should FAIL)

### Implementation for User Story 3

**Backend Implementation**:
- [X] T057 [US3] Implement validate_no_circular_dependency() in apps/api/src/services/habit_service.py: recursive traversal algorithm (start at anchor_id, follow anchor_habit_id chain, track visited set, return False if target habit_id found in chain or self-reference, return True if chain ends without cycle), max depth limit 10 to prevent infinite loops (GREEN - makes T052 pass)
- [X] T058 [US3] Implement anchor_habit_id and habit_stacking_cue fields in apps/api/src/models/habit.py: anchor_habit_id UUID nullable with foreign_key="habits.id", habit_stacking_cue TEXT nullable, @field_validator for habit_stacking_cue max 500 chars (GREEN - enables stacking)
- [X] T059 [US3] Update HabitService.create_habit() in apps/api/src/services/habit_service.py: if anchor_habit_id provided, validate it exists and belongs to same user, call validate_no_circular_dependency(habit.id, anchor_habit_id), raise ValueError if circular, proceed with creation (GREEN - makes T054 pass)
- [X] T060 [US3] Update HabitService.update_habit() in apps/api/src/services/habit_service.py: if anchor_habit_id changed, validate exists/user ownership/no circular dependency, emit HABIT_UPDATED event with updated_fields array in payload, return updated habit (GREEN - makes T054 pass)
- [X] T061 [US3] Implement HabitService.delete_habit() in apps/api/src/services/habit_service.py: query for dependent habits (WHERE anchor_habit_id = habit_id), if dependents found and not force mode, raise ValueError("This habit is used as anchor by N habits: [identity statements list]"), if force mode or no dependents, delete habit, emit HABIT_DELETED event with had_dependencies flag and dependent_count, database CASCADE sets anchor_habit_id=NULL for dependents per ADR-006 (GREEN - makes T053, T055 pass)
- [X] T062 [US3] Implement PATCH /api/{user_id}/habits/{habit_id} endpoint in apps/api/src/routes/habits.py: authenticate user, parse HabitUpdate body, call HabitService.update_habit(), return 200 with updated habit, handle circular dependency error (400 with message), handle not found (404) per contracts/habits-api.yaml (GREEN - makes T054 pass)
- [X] T063 [US3] Implement DELETE /api/{user_id}/habits/{habit_id} endpoint in apps/api/src/routes/habits.py: authenticate user, parse ?force=true query param, call HabitService.delete_habit(force=force), return 200 with success message, handle dependencies error (400 with dependent_habits array in response body), handle not found (404) per contracts/habits-api.yaml (GREEN - makes T055 pass)

**Frontend Implementation**:
- [X] T064 [US3] Add anchor habit selector to HabitForm in apps/web/src/components/habits/HabitForm.tsx: fetch existing user habits on mount using getHabits(), render Select for anchor_habit_id with options (habit.id as value, habit.identity_statement as label), if no habits available show InfoMessage "Create your first habit to enable stacking", on anchor selection, auto-generate habit_stacking_cue preview "After I [anchor identity], I will [current identity]" (extract from identity_statement), render habit_stacking_cue textarea allowing manual override, validation: anchor_habit_id must be valid UUID from available habits (GREEN - makes T056 pass)
- [X] T065 [US3] Add delete confirmation modal to habit detail page in apps/web/src/app/(authenticated)/habits/[id]/page.tsx: Delete button opens ConfirmDialog, on delete attempt, call deleteHabit(id), if 400 response with dependent_habits array, show warning dialog "This habit is an anchor for: [list dependent identity statements]. Deleting will break their stacking cues. Continue?", force delete button calls deleteHabit(id, force=true), success redirects to /habits with toast "Habit deleted", error shows toast with message

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently. Users can create identity-driven habits (US1), view 2-minute versions (US2), and link habits with stacking cues while the system prevents circular dependencies (US3). The "Make It Obvious" principle is implemented through anchoring. Run `pytest apps/api/tests/ -m "US1 or US2 or US3"` to verify.

---

## Phase 6: User Story 4 - Categorized Habit List (Priority: P2)

**Goal**: Users can organize habits into life domains (Health, Productivity, etc.) and view them filtered by category for better overview

**Independent Test**: Create Habit X in "Health & Fitness" and Habit Y in "Productivity". Navigate to /habits, verify category badges display on habit cards. Use category filter dropdown, select "Health & Fitness", verify only Habit X displays. Clear filter, verify both habits display.

**Acceptance Criteria (from spec.md US4)**:
- AC1: Multiple habits created → list page displays with categories prominently shown
- AC2: Filter by category → only habits in that category displayed

### Tests for User Story 4 (TDD - Write First, Ensure FAIL) ⚠️

**Integration Tests**:
- [X] T066 [US4] Write integration test for category filtering in apps/api/tests/integration/test_habit_routes.py testing: create 3 habits (Health, Productivity, Learning), GET /api/{user_id}/habits?category=Health returns 1 habit, GET without filter returns all 3, GET with invalid category returns 400 validation error (should FAIL)

**Frontend Tests**:
- [X] T067 [P] [US4] Write unit test for CategoryFilter component in apps/web/__tests__/habits/CategoryFilter.test.tsx testing: renders Select with all 8 categories plus "All categories" option, selecting category calls onChange with category value, "All categories" calls onChange with null, displays current selected category (should FAIL)
- [X] T068 [P] [US4] Write unit test for StatusFilter component in apps/web/__tests__/habits/StatusFilter.test.tsx testing: renders Select with "Active" and "Archived" options, selecting status calls onChange, defaults to "Active" (should FAIL)
- [X] T069 [P] [US4] Write unit test for habits list page in apps/web/__tests__/habits/habits-page.test.tsx testing: fetches habits on mount, displays HabitCard for each habit, CategoryFilter change triggers refetch with category param, StatusFilter change triggers refetch with status param, empty state shows "No habits yet. Create your first habit!", loading state shows skeletons (should FAIL)

### Implementation for User Story 4

**Backend Implementation** (already implemented in US1 T040, T042):
- [X] T070 [US4] Verify HabitService.get_habits() category filtering in apps/api/src/services/habit_service.py: if category param provided, add WHERE category = category filter, validate category against HABIT_CATEGORIES enum, raise ValueError if invalid (GREEN - makes T066 pass)

**Frontend Implementation**:
- [X] T071 [P] [US4] Create CategoryFilter component in apps/web/src/components/habits/CategoryFilter.tsx: Select component with options for all 8 categories ("Health & Fitness", "Productivity", "Mindfulness", "Learning", "Social", "Finance", "Creative", "Other") plus "All categories" default, onChange handler passing selected category or null, current value displayed, mobile-responsive (GREEN - makes T067 pass)
- [X] T072 [P] [US4] Create StatusFilter component in apps/web/src/components/habits/StatusFilter.tsx: Select component with options "Active" (default), "Archived", onChange handler passing selected status, displays current status (GREEN - makes T068 pass)
- [X] T073 [P] [US4] Update HabitCard component in apps/web/src/components/habits/HabitCard.tsx: render category Badge with color mapping (Health & Fitness→green-500, Productivity→blue-500, Mindfulness→purple-500, Learning→orange-500, Social→pink-500, Finance→emerald-500, Creative→yellow-500, Other→gray-500), render status Badge (Active→green, Archived→gray) (GREEN - visual enhancement)
- [X] T074 [US4] Implement habits list page in apps/web/src/app/(authenticated)/habits/page.tsx: useState for filters (category, status), fetch habits using getHabits({category, status, page, limit}) on mount and filter change, render CategoryFilter and StatusFilter in filter bar, map habits to HabitCard components in grid layout (3 columns desktop, 2 columns tablet, 1 column mobile per Constitution mobile-first), render pagination controls if total > limit, empty state: "No habits yet. Create your first habit!" with button to /habits/new, loading state: skeleton cards, error state: error message with retry button (GREEN - makes T069 pass)

**Checkpoint**: At this point, all User Stories 1-4 should work independently and integrated. Users can create identity-driven habits with 2-minute versions (US1+US2), link habits with stacking (US3), and organize/filter habits by category and status (US4). The full MVP is functional. Run `pytest apps/api/tests/ -m habits` to verify all habit tests pass.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Production readiness, mobile-first optimization, event integration, and accessibility

- [X] T075 Implement archive/restore logic in apps/api/src/services/habit_service.py: add archive_habit(user_id, habit_id) method setting status='archived', add restore_habit(user_id, habit_id) method setting status='active', emit HABIT_ARCHIVED and HABIT_RESTORED events with payload {habit_id, identity_statement}
- [X] T076 Add archive/restore endpoints in apps/api/src/routes/habits.py: POST /api/{user_id}/habits/{habit_id}/archive (calls archive_habit, returns 200), POST /api/{user_id}/habits/{habit_id}/restore (calls restore_habit, returns 200), both require authentication and user ownership
- [X] T077 [P] Implement event emission for all CRUD operations in apps/api/src/services/habit_service.py: verify HABIT_CREATED emits on create_habit (T039 already implemented), add HABIT_UPDATED emission in update_habit with updated_fields array in payload (e.g., ["identity_statement", "recurring_schedule"]), verify HABIT_DELETED emission in delete_habit (T061 already implemented), validate event payloads match ADR-004 schema {event_type, user_id, timestamp, payload}
- [X] T078 [P] Add archive/restore actions to habit detail page in apps/web/src/app/(authenticated)/habits/[id]/page.tsx: if status=active show "Archive" button, if status=archived show "Restore" button, archive button calls POST /archive with confirmation "Archive this habit? It will be hidden from your active list but data preserved", restore button calls POST /restore with toast "Habit restored", both refetch habit data after success
- [ ] T079 [P] Add loading skeletons to all habit pages in apps/web/src/app/(authenticated)/habits/: HabitCardSkeleton component (gray rectangles with animate-pulse), render 6 skeletons in list page during loading, render form skeleton in new/edit pages during initial data fetch
- [X] T080 [P] Add error handling and toast notifications in apps/web/src/app/(authenticated)/habits/: create useToast hook using Radix Toast, wrap API calls in try-catch, show error toasts for API failures with retry button, show success toasts for create/update/delete operations ("Habit created!", "Changes saved", "Habit deleted"), auto-dismiss after 5 seconds
- [X] T081 [P] Verify mobile-first layouts and touch targets in apps/web/src/components/habits/: audit all components for min 44x44px touch targets (buttons, links, checkboxes per Constitution Principle VII), verify mobile breakpoints work (320px, 375px, 768px, 1024px), test scrolling and overflow on small screens, verify forms use mobile-optimized input types (inputmode="numeric" for day_of_month, type="date" for until), verify bottom-space for virtual keyboard
- [X] T082 [P] Add accessibility enhancements in apps/web/src/components/habits/: add aria-labels to all interactive elements, verify keyboard navigation works (Tab order logical, Enter submits forms, Escape closes modals), add screen reader announcements for filter changes ("Filtered by Health & Fitness, showing 3 habits"), ensure color contrast ratios meet WCAG AA (4.5:1 for text), add focus indicators (ring-2 ring-offset-2) to all focusable elements
- [ ] T083 Run full test suite and generate coverage report: `cd apps/api && pytest --cov=src --cov-report=html --cov-report=term-missing` verify 90%+ backend coverage for habits module (models, services, routes), `cd apps/web && npm test -- --coverage` verify 80%+ frontend coverage for habit components, fix any failing tests, document coverage gaps in test report
- [X] T084 [P] Create habit edit page in apps/web/src/app/(authenticated)/habits/[id]/edit/page.tsx: fetch habit using getHabit(id), render HabitForm with initialData=habit, submit calls updateHabit(id, data), success redirects to /habits/[id] with toast "Changes saved", breadcrumb navigation (Home > Habits > [Habit name] > Edit), loading/error states
- [ ] T085 [P] Add habit count and summary stats to habits list page in apps/web/src/app/(authenticated)/habits/page.tsx: display "X Active Habits, Y Archived" at top of page, show category distribution chart (optional: pie chart or bar chart showing habit count per category), show "Most common category" insight
- [X] T086 [P] Validate quickstart.md against implementation in specs/003-habits-mvp/quickstart.md: follow "Files to Create" checklist and verify all files exist at specified paths, follow "Implementation Sequence" and verify all tasks completed in correct order, run manual testing section and verify all API examples work, update quickstart.md if any paths or steps changed during implementation
- [ ] T087 [P] Performance Benchmark (SC-001): Manually verify that a habit can be created with all required fields in under 60 seconds using the live UI; document any friction points in the UX.
- [ ] T088 [P] Performance Benchmark (SC-003): Use Chrome DevTools Network/Lighthouse to verify that the habit list page with 20 habits loads and renders in under 500ms; verify API response times meet < 200ms p95 targets.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately (T001-T005)
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories (T006-T019)
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User Story 1 (Phase 3): Can start after Foundational (T020-T046)
  - User Story 2 (Phase 4): Can start after Foundational, integrates with US1 (T047-T051)
  - User Story 3 (Phase 5): Depends on US1 (needs existing habits), can run after US1 complete (T052-T065)
  - User Story 4 (Phase 6): Can start after Foundational, integrates with all previous stories (T066-T074)
- **Polish (Phase 7)**: Depends on all desired user stories being complete (T075-T086)

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies after Foundational - can start first
- **User Story 2 (P1)**: No dependencies after Foundational - can run in parallel with US1 (shares GET endpoint)
- **User Story 3 (P2)**: Requires US1 complete (needs existing habits to anchor to)
- **User Story 4 (P2)**: Can start after Foundational - integrates with US1/US2/US3 but independently testable

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD)
- Contract tests → Unit tests → Integration tests → Frontend tests (all in parallel within category)
- Backend models → Backend services → Backend routes (sequential)
- Frontend API client → Frontend components → Frontend pages (sequential)
- All tests passing before moving to next user story

### Parallel Opportunities

**Phase 2 (Foundational)**: Can run in parallel
- T006-T010 (Models and Schemas)
- T011-T015 (Services, Routes, API Client)
- T016-T019 (Test Infrastructure)

**User Story 1 Tests**: Can run in parallel
- T020-T021 (Contract tests)
- T022-T028 (Unit tests)
- T032-T033 (Frontend tests)
- T029-T031 (Integration tests run sequentially after backend implementation)

**User Story 1 Implementation**: Parallel backend + frontend tracks
- Backend: T034-T043 (Models → Services → Routes)
- Frontend: T044-T046 (Components → Pages) - can start after T015 (API client)

**Phase 7 (Polish)**: Can run in parallel
- T075-T077 (Backend events and archive)
- T078-T082 (Frontend polish and accessibility)
- T084-T086 (Additional features)

**Cross-Team Parallelization**:
- Once Foundational (Phase 2) complete, Backend Team can work on US1 backend (T034-T043) while Frontend Team works on US1 frontend (T044-T046)
- Once US1 complete, Team A can work on US3 (Stacking) while Team B works on US4 (Categories)

---

## Parallel Execution Examples

### Launch all Phase 2 foundational tasks together:
```bash
# Models and Schemas (parallel)
Task: T006 "Create Habit SQLModel"
Task: T007 "Create RecurringSchedule validation"
Task: T008 "Create HabitCreate schema"
Task: T009 "Create HabitUpdate schema"
Task: T010 "Create HabitResponse schema"

# Services and Routes (parallel)
Task: T011 "Create HabitService skeleton"
Task: T012 "Create habits API routes"
Task: T014 "Create Habit TypeScript types"
Task: T015 "Create habit API client"
```

### Launch all US1 tests together (TDD):
```bash
# All US1 tests can start in parallel (write before implementation)
Task: T020-T021 "Contract tests"
Task: T022-T028 "Unit tests"
Task: T032-T033 "Frontend tests"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete **Phase 1: Setup** (T001-T005) - Database foundation
2. Complete **Phase 2: Foundational** (T006-T019) - Core infrastructure
3. Complete **Phase 3: User Story 1** (T020-T046) - Identity-driven habits
4. Complete **Phase 4: User Story 2** (T047-T051) - 2-minute versions display
5. **STOP and VALIDATE**: Test US1+US2 independently, deploy to staging
6. Demo MVP to stakeholders: "Create identity-driven habits with 2-minute versions"

**MVP Delivers**: Core Atomic Habits principles (Laws 2 and 3) with full CRUD and user isolation

### Incremental Delivery (Full Feature Set)

1. Foundation (Phase 1 + Phase 2) → Database and infrastructure ready
2. Add **User Story 1** → Test independently → Deploy (MVP!)
3. Add **User Story 2** → Test independently → Deploy (2-minute rule reinforced)
4. Add **User Story 3** → Test independently → Deploy (Habit stacking with Law 1)
5. Add **User Story 4** → Test independently → Deploy (Category organization)
6. Add **Phase 7 Polish** → Final testing → Production deployment

**Each increment adds value without breaking previous functionality**

### Parallel Team Strategy (2-3 Developers)

**Setup Phase** (Together):
- Complete Phase 1 and Phase 2 together (foundational work benefits from collaboration)

**Once Foundation Ready** (Split):
- **Developer A**: User Story 1 backend (T034-T043)
- **Developer B**: User Story 1 frontend (T044-T046) - waits for T015 API client
- **Developer C**: User Story 2 implementation (T049-T051) - smaller story, can start after US1 tests

**Mid-Sprint Pivot**:
- After US1 complete, Developer A moves to US3 (Stacking - complex circular dependency logic)
- Developer B moves to US4 (Categories - simpler frontend-heavy work)
- Developer C handles Polish (Phase 7) tasks

---

## Test-Driven Development (TDD) Workflow

### Red-Green-Refactor Cycle

**RED Phase** (Write failing tests):
```bash
# Example: User Story 1 identity validation
1. Write T022: test_identity_statement_validator()
   - Test: empty string raises ValueError
   - Test: whitespace-only raises ValueError
   - Test: > 2000 chars raises ValueError
   - Test: valid string trims and accepts

2. Run test: pytest apps/api/tests/unit/test_habit_model.py::test_identity_statement_validator
   - Expected: FAIL (validator not implemented yet)
   - Output: AttributeError: 'Habit' has no attribute 'identity_statement' validator
```

**GREEN Phase** (Implement minimal code to pass):
```bash
3. Implement T034: identity_statement validator in habit.py
   - Add @field_validator("identity_statement")
   - Check not empty, trim, max 2000 chars

4. Run test again: pytest apps/api/tests/unit/test_habit_model.py::test_identity_statement_validator
   - Expected: PASS (all assertions pass)
   - Output: . (green dot)
```

**REFACTOR Phase** (Improve code quality):
```bash
5. Refactor validator:
   - Extract max length constant (IDENTITY_MAX_LENGTH = 2000)
   - Extract validation message to constant
   - Add docstring

6. Run test again to ensure refactor didn't break:
   - Expected: PASS (still green)
```

### TDD Benefits for This Feature

- **Confidence**: 90%+ test coverage ensures habits module is production-ready
- **Regression Prevention**: Refactoring circular dependency logic won't break existing tests
- **Documentation**: Tests serve as executable specification (e.g., T052 documents circular dependency algorithm)
- **Parallel Work**: Frontend team can read backend tests (T020-T031) to understand API contract before backend complete

---

## Notes

- [P] tasks = different files, no dependencies = can run in parallel
- [Story] label (US1, US2, US3, US4) maps task to specific user story for traceability
- Each user story should be independently completable and testable (checkpoint after each phase)
- TDD enforced: Write tests FIRST, ensure they FAIL, then implement to make them PASS
- Commit after each task or logical group (e.g., all US1 tests, all US1 backend implementation)
- Follow Common Pitfalls in CLAUDE.md: SQLModel sa_column pattern, src. imports, PostgreSQL requirement, no mixing Field() params with sa_column
- ADR-006 reference: All data model decisions (JSONB schedules, foreign key stacking, fixed categories, two-state status) are architecturally significant and documented
- Constitution compliance: All tasks align with 12 immutable principles (spec-driven, identity-driven, modular, event-driven, Four Laws mapping, database as truth, mobile-first, API-first, progressive, test specs, no hardcoded config, composition)
- Event schema per ADR-004: All events follow {event_type, user_id, timestamp, payload} structure
- User isolation enforced at database query level: All queries include WHERE user_id = authenticated_user_id
- Mobile-first: All UI components designed for 375px mobile screens first, then progressively enhanced for tablet (768px+) and desktop (1024px+)
- Accessibility: WCAG AA compliance (4.5:1 contrast, keyboard navigation, screen reader support, focus indicators)

---

**Total Tasks**: 86
**Estimated Duration**: 5-7 days (2 days backend, 2 days frontend, 1 day testing, 1-2 days polish)
**Test Coverage Goal**: 90%+ backend, 80%+ frontend
**MVP Milestone**: After T051 (User Stories 1 + 2 complete)
**Full Feature Milestone**: After T086 (All stories + polish complete)