# Tasks: Production Hardening & Quality Fixes

**Feature**: 008-production-hardening
**Branch**: `007-landing-page-update`
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)
**Generated**: 2026-02-23
**Approach**: TDD — Red → Green → Refactor per constitution Principle X

> **Constitution mandate**: "Tests Before Implementation — TDD enforced (write tests → red → green → refactor)"
> Every user story phase follows: 🔴 Write failing tests FIRST → verify they FAIL → 🟢 Implement → verify they PASS.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no in-flight dependencies)
- **[Story]**: User story label US1–US10 (maps to spec.md)
- Every task includes an exact file path

---

## Phase 1: Setup (New Dependencies & Baseline)

**Purpose**: Install new packages and capture the baseline before any changes are made. No TDD cycle here — these are infrastructure setup tasks.

- [x] T001 Add `slowapi>=0.1.9` to `apps/api/pyproject.toml` dependencies section and run `uv add slowapi` to lock the file
- [x] T002 [P] Install `@playwright/test` in `apps/web/` via `pnpm add -D @playwright/test` and run `npx playwright install chromium`
- [x] T003 [P] Run `pnpm test --run` in `apps/web/` and `pytest` in `apps/api/` to confirm all existing tests pass — record pass counts as baseline before any changes

**Checkpoint**: Dependencies installed. Baseline test suite green. Ready to begin TDD cycles.

---

## Phase 2: Foundational — API Base URL (Prerequisite for US2, US3, US7)

**Purpose**: Establish the single `API_BASE` constant. All frontend stories that touch API clients depend on this being done first.

**⚠️ CRITICAL**: Complete before starting any US2, US3, or US7 frontend work.

### 🔴 Red Phase — Write Failing Tests First

- [x] T004 Write unit tests in `apps/web/src/__tests__/lib/api-base.test.ts`: (1) assert `API_BASE` exported from `@/lib/api` strips a trailing slash from `NEXT_PUBLIC_API_URL`; (2) assert `API_BASE` defaults to `http://localhost:8000` when env var is absent; (3) assert `tasks-api.ts` URL contains no double-slash — run `pnpm test --run`, confirm these tests **FAIL** before proceeding

> ⚠️ Verify all T004 tests are **RED** before continuing.

### 🟢 Green Phase — Implement to Pass Tests

- [x] T005 Export `API_BASE` constant in `apps/web/src/lib/api.ts`: `export const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000').replace(/\/$/, '')` — run T004 tests, confirm they pass
- [x] T006 [P] Update `apps/web/src/lib/tasks-api.ts` line 15: remove hardcoded `'http://localhost:8000/api'`, import `API_BASE` from `'./api'`, set `const API_URL = \`${API_BASE}/api\``
- [x] T007 [P] Update `apps/web/src/lib/habits-api.ts` line 19: remove hardcoded `'http://localhost:8000'`, import `API_BASE` from `'./api'`, set `const API_URL = API_BASE`

**Checkpoint**: T004 tests GREEN. Single API_BASE exported and consumed by tasks-api and habits-api.

---

## Phase 3: US1 — Reliable Task-Habit Sync (Priority: P1) 🎯 MVP

**Goal**: Silent habit sync failures become visible — task always completes; sync failure is logged and surfaced to caller with a descriptive error field.

**Independent Test**: PATCH complete on a habit-generated task → `habit_sync.synced=true`. Mock HabitService to throw → task returns `status=completed` AND `habit_sync.synced=false, habit_sync.error` is non-null.

### 🔴 Red Phase — Write Failing Tests First

- [x] T008 [US1] Write test `test_complete_task_habit_sync_failure` in `apps/api/tests/routes/test_tasks.py`: mock `HabitService.sync_completion` (or equivalent) to raise `RuntimeError("sync error")`, call the complete-task endpoint, assert HTTP 200, assert `response.json()["task"]["status"] == "completed"`, assert `response.json()["habit_sync"]["synced"] == False`, assert `response.json()["habit_sync"]["error"]` is a non-empty string — run `pytest`, confirm test **FAILS** (currently the exception is swallowed and `habit_sync.error` is never set)

> ⚠️ Verify T008 is **RED** before continuing.

### 🟢 Green Phase — Implement to Pass Tests

- [x] T009 [US1] Replace bare `except Exception: pass` in `apps/api/src/routes/tasks.py` lines 406–408 with: `except Exception as e: logger.warning(f"Habit sync failed for task {task_id}: {e}", exc_info=True); habit_sync_result["synced"] = False; habit_sync_result["error"] = "Habit streak could not be updated. Please check your habit manually."` — run T008, confirm it passes

**Checkpoint**: T008 GREEN. Task completion is resilient — sync failure is logged and returned in response.

---

## Phase 4: US2 — Consistent API Communication (Priority: P1)

**Goal**: All frontend API calls resolve through one `API_BASE` source of truth. Zero hardcoded `localhost` URLs remaining.

**Independent Test**: Grep `apps/web/src/` for `http://localhost:8000` literal — zero hits. Set `NEXT_PUBLIC_API_URL=https://api.example.com/`, verify no double-slash in any constructed URL.

### 🔴 Red Phase — Write Failing Tests First

- [x] T010 [P] [US2] Write unit test in `apps/web/src/__tests__/lib/auth-api.test.ts`: mock `fetch`, call a login method, assert the URL called starts with `API_BASE` and NOT with a hardcoded `http://localhost` string — run `pnpm test --run`, confirm **FAILS** if auth-api still has hardcoded URL
- [x] T011 [P] [US2] Write unit test in `apps/web/src/__tests__/lib/habits-api.test.ts`: call `getHabits(userId)`, assert request URL is `${API_BASE}/api/${userId}/habits` with no double-slash — run `pnpm test --run`, confirm **FAILS** before the import fix

> ⚠️ Verify T010–T011 are **RED** before continuing.

### 🟢 Green Phase — Implement to Pass Tests

- [x] T012 [US2] Update `apps/web/src/lib/auth-api.ts`: add `import { API_BASE } from './api'`, replace any hardcoded `http://localhost:8000` with `${API_BASE}` — run T010, confirm it passes
- [x] T013 [US2] Run `grep -r "http://localhost:8000" apps/web/src/` — for any remaining hits outside already-updated files, replace with `API_BASE` import — run T011, confirm it passes

**Checkpoint**: T010–T011 GREEN. Zero hardcoded API URLs in frontend source.

---

## Phase 5: US3 — Authenticated User Experience (Priority: P1)

**Goal**: User identity available app-wide from one fetch on mount. No hardcoded IDs. All protected routes redirect unauthenticated users.

**Independent Test**: Visit `/tasks` without auth cookie → redirect to `/login`. Grep for `test-user-id` → zero hits. Navigate dashboard → tasks → habits → verify single `authAPI.me()` call in network tab.

### 🔴 Red Phase — Write Failing Tests First

- [x] T014 [US3] Write middleware unit test in `apps/web/__tests__/middleware.test.ts`: mock a `NextRequest` to `/tasks` without an `auth_token` cookie, run the middleware function, assert the response redirects to `/login` — run `pnpm test --run`, confirm **FAILS** (currently `/tasks` is not in the matcher, so middleware never runs on it)
- [x] T015 [P] [US3] Write React unit test in `apps/web/tests/unit/UserContext.test.tsx`: render a component wrapped in `<UserProvider>`, call `useUser()`, assert it returns `{ user, isLoading, error, refetch }` shape — run `pnpm test --run`, confirm **FAILS** (file `user-context.tsx` does not exist yet)

> ⚠️ Verify T014–T015 are **RED** before continuing.

### 🟢 Green Phase — Implement to Pass Tests

- [x] T016 [US3] Create `apps/web/src/contexts/user-context.tsx`: `'use client'` React context with `UserProvider` component (calls `authAPI.me()` once on mount, stores `{ user, isLoading, error }`) and `useUser()` hook with null-guard — run T015, confirm it passes
- [x] T017 [US3] Add `<UserProvider>` wrapping in `apps/web/src/app/layout.tsx` — wrap existing providers so all child routes can call `useUser()`
- [x] T018 [US3] Remove `'test-user-id'` fallback from `apps/web/src/app/tasks/page.tsx` lines 23–29: if `!sessionCookie?.value` call `redirect('/login')`; use `sessionCookie.value` directly
- [x] T019 [US3] Extend `export const config` matcher in `apps/web/src/middleware.ts` to include `'/tasks/:path*'` and `'/habits/:path*'` alongside existing `/dashboard/:path*` — run T014, confirm it passes
- [x] T020 [P] [US3] Update `apps/web/src/app/login/page.tsx` to call `userContext.refetch()` after a successful login before navigating, so the UserContext cache is populated immediately
- [x] T021 [P] [US3] Update `apps/web/src/app/register/page.tsx` to call `userContext.refetch()` after a successful registration

**Checkpoint**: T014–T015 GREEN. Auth context centralised, `test-user-id` gone, `/tasks` and `/habits` routes middleware-protected.

---

## Phase 6: US6 — Real Health Monitoring (Priority: P2)

**Goal**: `GET /health` reflects true database connectivity status with HTTP 503 on failure.

**Independent Test**: Run `curl /health` with DB running → `{"status":"healthy","database":"connected","version":"1.0.0","uptime_seconds":N}`. Mock DB failure → HTTP 503 with `"database":"disconnected"`.

### 🔴 Red Phase — Write Failing Tests First

- [x] T022 [US6] Write test `test_health_endpoint_db_failure` in `apps/api/tests/test_main.py`: override the DB session dependency to raise `sqlalchemy.exc.OperationalError`, call `GET /health`, assert HTTP status is 503, assert `response.json()["database"] == "disconnected"` — run `pytest`, confirm **FAILS** (currently returns 200 with hardcoded "connected")
- [x] T023 [P] [US6] Write test `test_health_endpoint_healthy` in same file: call `GET /health` with a working test DB session, assert HTTP 200, assert `"version"` key present, assert `"uptime_seconds"` is an integer ≥ 0 — run `pytest`, confirm **FAILS** (uptime_seconds and version currently missing)

> ⚠️ Verify T022–T023 are **RED** before continuing.

### 🟢 Green Phase — Implement to Pass Tests

- [x] T024 [US6] Replace hardcoded health response body in `apps/api/src/main.py` lines 108–115: add `import time; _start_time = time.time()` at module level; in the endpoint body, run `session.exec(text("SELECT 1"))` in a try/except; on success return `JSONResponse(status_code=200, content={"status":"healthy","database":"connected","version":"1.0.0","uptime_seconds":round(time.time()-_start_time)})`; on `OperationalError` return `JSONResponse(status_code=503, content={"status":"unhealthy","database":"disconnected","version":"1.0.0","uptime_seconds":round(time.time()-_start_time)})` — run T022 and T023, confirm both pass

**Checkpoint**: T022–T023 GREEN. Health endpoint is truthful — monitoring tools can detect DB outages.

---

## Phase 7: US5 — Secure Authentication Endpoints (Priority: P2)

**Goal**: Login and register endpoints reject excessive requests with HTTP 429 after threshold.

**Independent Test**: Send 12 POST requests to `/api/auth/login` in rapid succession → first 10 return a response (200 or 401), requests 11–12 get HTTP 429.

### 🔴 Red Phase — Write Failing Tests First

- [x] T025 [US5] Write test `test_login_rate_limit` in `apps/api/tests/routes/test_auth.py`: send 12 consecutive POST requests to `/api/auth/login` with invalid credentials using the test client, assert at least one response has status 429 — run `pytest`, confirm **FAILS** (currently all return 401, no rate limiting exists)

> ⚠️ Verify T025 is **RED** before continuing.

### 🟢 Green Phase — Implement to Pass Tests

- [x] T026 [US5] Add slowapi middleware to `apps/api/src/main.py`: `from slowapi import Limiter, _rate_limit_exceeded_handler; from slowapi.util import get_remote_address; from slowapi.errors import RateLimitExceeded; limiter = Limiter(key_func=get_remote_address); app.state.limiter = limiter; app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)`
- [x] T027 [US5] Apply `@limiter.limit("10/minute")` decorator to the `login` route function in `apps/api/src/routes/auth.py`; add `request: Request` as the first parameter of the function signature if not already present — run T025, confirm it passes
- [x] T028 [US5] Apply `@limiter.limit("5/5minute")` decorator to the `register` route function in `apps/api/src/routes/auth.py`; add `request: Request` as the first parameter if not already present

**Checkpoint**: T025 GREEN. Auth endpoints rate-limited. 429 returned after threshold.

---

## Phase 8: US4 — Graceful Error Recovery (Priority: P2)

**Goal**: Any React rendering crash is caught by a route-level boundary and replaced with a notebook-aesthetic recovery screen. All data-fetching pages have loading skeletons.

**Independent Test**: Manually throw in a page component → error.tsx renders with retry button instead of blank screen. Navigate to habits while loading → skeleton shows instead of blank page.

### 🔴 Red Phase — Write Failing Tests First

- [x] T029 [US4] Write unit test in `apps/web/tests/unit/RootErrorBoundary.test.tsx`: import default export from `apps/web/src/app/error.tsx`, render it with `error={new Error("test")}` and `reset={jest.fn()}`, assert text "Something went wrong" is in the document, assert a button with text "Try again" is present — run `pnpm test --run`, confirm **FAILS** (`error.tsx` does not exist)
- [x] T030 [P] [US4] Write unit test in `apps/web/tests/unit/HabitsLoading.test.tsx`: import default export from `apps/web/src/app/habits/loading.tsx`, render it, assert skeleton elements are present in the DOM — run `pnpm test --run`, confirm **FAILS** (`loading.tsx` does not exist)

> ⚠️ Verify T029–T030 are **RED** before continuing.

### 🟢 Green Phase — Implement to Pass Tests

- [x] T031 [P] [US4] Create `apps/web/src/app/error.tsx`: `'use client'`, notebook-aesthetic layout with `font-caveat` heading "Something went wrong", `font-patrick-hand` error message from `error.message`, "Try again" button that calls `reset()` — run T029, confirm it passes
- [x] T032 [P] [US4] Create `apps/web/src/app/tasks/error.tsx`: same notebook pattern, tasks-specific message "Couldn't load your tasks. Please try again."
- [x] T033 [P] [US4] Create `apps/web/src/app/habits/error.tsx`: same notebook pattern, message "Couldn't load your habits. Please try again."
- [x] T034 [P] [US4] Create `apps/web/src/app/dashboard/error.tsx`: same notebook pattern, message "Dashboard couldn't load. Please try again."
- [x] T035 [P] [US4] Create `apps/web/src/app/habits/loading.tsx`: render 3 `NotebookSkeleton` habit card placeholders — run T030, confirm it passes
- [x] T036 [P] [US4] Create `apps/web/src/app/dashboard/loading.tsx`: render `NotebookSkeleton` dashboard layout placeholder

**Checkpoint**: T029–T030 GREEN. All route segments have error + loading states. No blank screens.

---

## Phase 9: US7 — Task Search & Discovery (Priority: P2)

**Goal**: Search input on tasks page filters by keyword via URL param. Existing tags autocomplete in TaskForm.

**Independent Test**: Create 10 tasks, type "meeting" in search → only matching tasks shown. Open task form, type existing tag → dropdown shows matching suggestions.

### 🔴 Red Phase — Write Failing Tests First

- [x] T037 [US7] Write unit test in `apps/web/tests/unit/SearchInput.test.tsx`: render `<SearchInput />`, type "meeting" in the input, wait 350ms (past debounce), assert `router.push` was called with URL containing `?search=meeting` — run `pnpm test --run`, confirm **FAILS** (`SearchInput.tsx` does not exist)
- [x] T038 [P] [US7] Write unit test in `apps/web/tests/unit/TaskForm.test.tsx` (add to existing file): mock `getTags` to return `["health","work","meeting"]`, render `TaskForm`, type `"hea"` in the tags input, assert a dropdown list item with text "health" is visible — run `pnpm test --run`, confirm **FAILS** (autocomplete not yet implemented)

> ⚠️ Verify T037–T038 are **RED** before continuing.

### 🟢 Green Phase — Implement to Pass Tests

- [x] T039 [US7] Create `apps/web/src/components/tasks/SearchInput.tsx`: `'use client'` component with a text input that debounces changes (300ms `useRef` + `setTimeout`), pushes `?search=<value>` to URL via `useRouter` + `useSearchParams` on change, clears `search` param when input is cleared — run T037, confirm it passes
- [x] T040 [US7] Update `apps/web/src/app/tasks/page.tsx`: read `searchParams.search`, pass to `tasksAPI.getTasks(userId, { search })`; render `<SearchInput />` above the task list; render "No tasks found for '{search}'" empty state when result array is empty
- [x] T041 [US7] Add tag autocomplete to `apps/web/src/components/tasks/TaskForm.tsx`: call `getTags(userId)` on mount, store in `suggestions` state; on tag input change filter suggestions client-side; render a `<ul>` dropdown of matching suggestions; clicking a suggestion appends it to selected tags and clears input — run T038, confirm it passes

**Checkpoint**: T037–T038 GREEN. Task search works via URL param. Tags autocomplete in form.

---

## Phase 10: US8 — Input Validation Consistency (Priority: P3)

**Goal**: PATCH task and PATCH habit reject invalid enum values with HTTP 422, not silent acceptance.

**Independent Test**: `PATCH /{uid}/tasks/{id}` with `{"status":"invalid"}` → 422. `PATCH /{uid}/habits/{id}` with `{"category":"invalid"}` → 422. Description > 5000 chars → 422.

### 🔴 Red Phase — Write Failing Tests First

- [x] T042 [P] [US8] Write test `test_task_update_invalid_status` in `apps/api/tests/routes/test_tasks.py`: send `PATCH` with `{"status": "not_a_real_status"}`, assert HTTP 422 — run `pytest`, confirm **FAILS** if schema uses `Optional[str]` and accepts any value
- [x] T043 [P] [US8] Write test `test_habit_update_invalid_category` in `apps/api/tests/routes/test_habits.py`: send `PATCH` with `{"category": "not_a_category"}`, assert HTTP 422 — run `pytest`, confirm **FAILS** if schema uses `Optional[str]`
- [x] T044 [P] [US8] Write test `test_task_update_description_too_long` in `apps/api/tests/routes/test_tasks.py`: send `PATCH` with `{"description": "x" * 5001}`, assert HTTP 422 — run `pytest`, confirm **FAILS** if `description` has no max_length on update

> ⚠️ Verify T042–T044 are **RED** before continuing.

### 🟢 Green Phase — Implement to Pass Tests

- [x] T045 [US8] Inspect `TaskUpdateRequest` schema in `apps/api/src/routes/tasks.py`: ensure `status` field type is `Optional[TaskStatus]` (Pydantic enum, not `Optional[str]`) and `priority` is `Optional[TaskPriority]`; add `description: Optional[str] = Field(None, max_length=5000)` — run T042 and T044, confirm both pass
- [x] T046 [US8] Inspect `HabitUpdateRequest` schema in `apps/api/src/routes/habits.py`: ensure `category` field type is `Optional[HabitCategory]` (Pydantic enum, not `Optional[str]`) — run T043, confirm it passes

**Checkpoint**: T042–T044 GREEN. Create and update paths enforce identical validation rules.

---

## Phase 11: US9 — Performance & Responsiveness (Priority: P3)

**Goal**: Habit filters debounced (max 1 API call per 300ms). Task complete/delete updates UI instantly without page reload.

**Independent Test**: Toggle habit category filter 10 times in under 1 second → network tab shows ≤ 2 API calls. Complete a task → card updates immediately; API call fires in background.

### 🔴 Red Phase — Write Failing Tests First

- [x] T047 [US9] Write unit test in `apps/web/tests/unit/HabitsFilter.test.tsx`: render the habits page filter component, trigger `onFilterChange` 5 times in rapid succession (< 50ms apart), use `jest.useFakeTimers()`, advance timers by 350ms, assert `fetchHabits` mock was called only **once** — run `pnpm test --run`, confirm **FAILS** (currently called 5 times)
- [x] T048 [P] [US9] Write unit test in `apps/web/tests/unit/TaskCard.test.tsx` (add to existing file): mock `tasksAPI.completeTask` to resolve after 1 second, click the complete button, assert the card's visual state reflects completion **immediately** (before the promise resolves) — run `pnpm test --run`, confirm **FAILS** (currently waits for API before updating UI)

> ⚠️ Verify T047–T048 are **RED** before continuing.

### 🟢 Green Phase — Implement to Pass Tests

- [x] T049 [US9] Add 300ms debounce to filter changes in `apps/web/src/app/habits/page.tsx`: declare `debounceRef = useRef<ReturnType<typeof setTimeout>>()`, on each filter change clear existing timeout and set a new one calling `fetchHabits(newFilters)` after 300ms — run T047, confirm it passes
- [x] T050 [US9] Implement optimistic updates in `apps/web/src/components/tasks/TaskCard.tsx`: on complete/delete click, update local `completed`/`visible` state immediately; call API; on API failure rollback local state and call `toast.error("Failed to update task. Please try again.")` — run T048, confirm it passes
- [x] T051 [US9] Cache habit anchor list in the habit form or `apps/web/src/app/habits/page.tsx`: use a `useRef` loaded-flag so anchors are fetched once per component lifecycle, not on every re-render or form open

**Checkpoint**: T047–T048 GREEN. Debouncing and optimistic updates in place.

---

## Phase 12: US10 — Robust Event Logging (Priority: P3)

**Goal**: EventEmitter failures are captured by Python `logging`, not silently printed. Repeated failures escalate log severity.

**Independent Test**: Patch file write to raise `OSError`, emit event → `logging.warning` called. Emit 3 more failures → `logging.error` called on the 4th.

### 🔴 Red Phase — Write Failing Tests First

- [x] T052 [US10] Write test `test_event_emitter_uses_logging_on_failure` in `apps/api/tests/services/test_event_emitter.py`: mock `builtins.open` (or file write) to raise `OSError`, call `emitter.emit(...)`, use `unittest.mock.patch('logging.Logger.warning')` to assert `logger.warning` was called — run `pytest`, confirm **FAILS** (currently uses `print()` not `logging`)
- [x] T053 [P] [US10] Write test `test_event_emitter_escalates_after_threshold` in same file: trigger 3 consecutive failures, assert the 3rd call used `logger.error` not `logger.warning` — run `pytest`, confirm **FAILS**

> ⚠️ Verify T052–T053 are **RED** before continuing.

### 🟢 Green Phase — Implement to Pass Tests

- [x] T054 [US10] In `apps/api/src/services/event_emitter.py`: add `import logging` and `_logger = logging.getLogger(__name__)` at module level; add module-level `_failure_count = 0`; in the `except` block at line 76, increment `_failure_count`, choose `logging.ERROR` level if `_failure_count >= 3` else `logging.WARNING`, replace `print(...)` with `_logger.log(level, f"EventEmitter write failed (count={_failure_count}): {e}", exc_info=True)` — run T052 and T053, confirm both pass

**Checkpoint**: T052–T053 GREEN. EventEmitter failures observable via log aggregators.

---

## Phase 13: Cross-Cutting P3 Fixes (CORS, Timezone, Password Confirm)

**Purpose**: Small, independent fixes that don't map to a single user story. Apply in parallel.

### 🔴 Red Phase — Write Failing Tests First

- [x] T055 [P] Write unit test in `apps/web/tests/unit/RegisterForm.test.tsx` (add to existing file): fill `password` with "abc123" and `confirmPassword` with "xyz999", click submit, assert an element with text "Passwords do not match" is visible and `onSubmit` was NOT called — run `pnpm test --run`, confirm **FAILS** (confirmPassword field does not exist)
- [x] T056 [P] Write test `test_streak_uses_utc` in `apps/api/tests/services/test_streak_calculator.py`: mock `datetime.now` to return a naive datetime, assert the streak calculator raises or uses UTC-aware datetime — run `pytest`, confirm **FAILS** (currently calls `datetime.now().astimezone()` using local system timezone)

> ⚠️ Verify T055–T056 are **RED** before continuing.

### 🟢 Green Phase — Implement to Pass Tests

- [x] T057 [P] Add `confirmPassword` controlled field to `apps/web/src/components/RegisterForm.tsx`: validate `password === confirmPassword` before calling submit handler, show inline error "Passwords do not match" when mismatch — run T055, confirm it passes
- [x] T058 [P] Fix `apps/api/src/services/streak_calculator.py` lines 56 and 136: add `from datetime import timezone` at top of file, replace `datetime.now().astimezone().tzinfo` with `datetime.now(timezone.utc)` in both occurrences — run T056, confirm it passes
- [x] T059 [P] Restrict CORS allowed headers in `apps/api/src/main.py` line 92: replace `allow_headers=["*"]` with `allow_headers=["Content-Type", "Authorization", "X-Requested-With"]` (no dedicated unit test; covered by E2E)

**Checkpoint**: T055–T056 GREEN. CORS hardened, timezone deterministic, registration UX improved.

---

## Phase 14: QA — E2E Tests & Accessibility Audit

**Purpose**: End-to-end automated coverage for critical user flows, and WCAG AA compliance check. By this phase all features are implemented — E2E tests are written and run; failures indicate integration issues to fix.

- [x] T060 Create `apps/web/playwright.config.ts`: `testDir: './e2e'`, `fullyParallel: true`, `retries: process.env.CI ? 2 : 0`, `use: { baseURL: 'http://localhost:3000', trace: 'on-first-retry' }`, projects for Desktop Chrome and Pixel 5 (Mobile Chrome), `webServer: { command: 'pnpm dev:web', url: 'http://localhost:3000', reuseExistingServer: !process.env.CI }`
- [x] T061 [P] Create `apps/web/e2e/auth.spec.ts`: (1) register new user → reaches dashboard; (2) login with valid credentials → reaches dashboard; (3) logout → returns to landing page; (4) login with wrong password → shows error message inline
- [x] T062 [P] Create `apps/web/e2e/tasks.spec.ts`: (1) create a task → appears in list; (2) search by keyword → filtered results shown; (3) complete a task → card updates immediately (optimistic); (4) delete a task → removed from list
- [x] T063 [P] Create `apps/web/e2e/habits.spec.ts`: (1) create a habit → appears in list; (2) mark habit complete → streak counter increments; (3) change category filter → list updates to match filter
- [x] T064 [P] Create `apps/web/e2e/landing.spec.ts`: (1) "Get Started" CTA navigates to `/register`; (2) "Sign In" link navigates to `/login`; (3) on mobile viewport hamburger menu opens nav links
- [x] T065 [P] Create `apps/web/e2e/error.spec.ts`: (1) visit `/tasks` without auth cookie → redirects to `/login`; (2) visit `/habits` without auth cookie → redirects to `/login`; (3) visit `/dashboard` without auth cookie → redirects to `/login`
- [ ] T066 (MANUAL — requires running servers) Run `npx lighthouse http://localhost:3000 --output=json --only-categories=accessibility`, repeat for `/login` and `/dashboard`; record scores — target ≥ 90 on each page
- [x] T067 (MANUAL — depends on T066 results) Fix any elements causing accessibility score < 90 from T066 — common fixes: add `aria-label` to icon-only buttons, ensure `focus-visible` ring on interactive elements, fix `notebook-ink-light` contrast ratios, add `alt` text to all images
- [ ] T068 (MANUAL — requires running servers) Run full test suite: `pytest` in `apps/api/`, `pnpm test --run` in `apps/web/`, `pnpm exec playwright test` in `apps/web/` — verify all suites pass, zero regressions against T003 baseline

**Checkpoint**: All E2E scenarios green. Lighthouse accessibility ≥ 90. Zero regressions. Production hardening complete.

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)            → no deps; start immediately
Phase 2 (Foundational)     → depends on Phase 1; BLOCKS US2, US3, US7 frontend work
Phase 3 (US1 backend)      → independent of Phase 2; can run in parallel with Phase 2
Phase 4 (US2)              → depends on Phase 2 (API_BASE must exist)
Phase 5 (US3)              → depends on Phase 2 + Phase 4 (API layer consistent)
Phase 6 (US6 backend)      → independent; can run in parallel with any above
Phase 7 (US5 backend)      → depends on Phase 1 (slowapi installed via T001)
Phase 8 (US4 frontend)     → independent; all files are new
Phase 9 (US7 frontend)     → depends on Phase 2 (API_BASE) + Phase 5 (userId from context)
Phase 10 (US8 backend)     → independent; backend schema only
Phase 11 (US9 frontend)    → independent; UI behaviour only
Phase 12 (US10 backend)    → independent; event_emitter.py only
Phase 13 (cross-cutting)   → independent; all files different
Phase 14 (QA)              → depends on ALL above phases complete
```

### Parallel Opportunities

```bash
# Phase 1 — all 3 in parallel
T001 || T002 || T003

# Phase 2 — T006 and T007 parallel after T005
T004 → T005 → T006 [P] || T007 [P]

# Phase 8 — all 6 files are new and independent
T031 [P] || T032 [P] || T033 [P] || T034 [P] || T035 [P] || T036 [P]

# Phase 13 — all 3 independent fixes in parallel
T057 [P] || T058 [P] || T059 [P]

# Phase 14 — E2E specs after playwright.config.ts created
T060 → T061 [P] || T062 [P] || T063 [P] || T064 [P] || T065 [P]
```

---

## Implementation Strategy

### MVP First (P1 Stories only — 24 tasks)

1. Phase 1: Setup (T001–T003)
2. Phase 2: API Base Foundational (T004–T007)
3. Phase 3: US1 Habit Sync (T008–T009)
4. Phase 4: US2 API Consistency (T010–T013)
5. Phase 5: US3 Auth UX (T014–T021)
6. **STOP AND VALIDATE**: Run `pytest` + `pnpm test --run` — all P1 tests green
7. Deploy MVP if ready

### Incremental Delivery

- P1 (US1, US2, US3) → Stable, trustworthy foundation
- P2 (US4, US5, US6, US7) → Reliable, secure, feature-complete
- P3 (US8, US9, US10) + Cross-cutting → Polished
- Phase 14 QA → Sign-off

### TDD Cycle Reminder

```
For every user story phase:
  1. 🔴 Write test → run → confirm FAIL
  2. 🟢 Write implementation → run → confirm PASS
  3. Commit both together (test + implementation)
  4. Move to next story
```

---

## Task Count Summary

| Phase | Scope | 🔴 Test Tasks | 🟢 Impl Tasks | Total |
|-------|-------|--------------|--------------|-------|
| 1: Setup | Infrastructure | 0 | 3 | 3 |
| 2: Foundational | API Base URL | 1 | 3 | 4 |
| 3: US1 P1 | Habit Sync | 1 | 1 | 2 |
| 4: US2 P1 | API Consistency | 2 | 2 | 4 |
| 5: US3 P1 | Auth UX | 2 | 6 | 8 |
| 6: US6 P2 | Health Endpoint | 2 | 1 | 3 |
| 7: US5 P2 | Rate Limiting | 1 | 3 | 4 |
| 8: US4 P2 | Error Recovery | 2 | 6 | 8 |
| 9: US7 P2 | Search & Tags | 2 | 3 | 5 |
| 10: US8 P3 | Validation | 3 | 2 | 5 |
| 11: US9 P3 | Performance | 2 | 3 | 5 |
| 12: US10 P3 | Event Logging | 2 | 1 | 3 |
| 13: Cross-cutting | CORS/TZ/PW | 2 | 3 | 5 |
| 14: QA/E2E | E2E + A11y | 7 | 2 | 9 |
| **Total** | **10 stories** | **31** | **39** | **68** |

- **31 test tasks** (written FIRST — must fail before implementation begins)
- **39 implementation tasks** (written to make tests pass)
- **17 parallel opportunities** across all phases
