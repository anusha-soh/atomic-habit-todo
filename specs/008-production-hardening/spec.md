# Feature Specification: Production Hardening & Quality Fixes

**Feature Branch**: `007-landing-page-update` (working in current branch)
**Created**: 2026-02-21
**Status**: Draft
**Input**: Fix all critical, high, and medium issues identified in PROJECT_ANALYSIS.md to achieve a fully working, production-ready site with all features and edge cases handled.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reliable Task-Habit Sync (Priority: P1)

As a user who completes a habit-generated task, I expect the habit streak to update reliably. If the sync fails, I should see a clear error message and my task completion should still be saved. Today, sync failures are silently swallowed, potentially leaving habit streaks out of sync with no feedback.

**Why this priority**: Data integrity issue. Silent failures mean users lose trust when streaks don't update. This is the most critical bug in the system.

**Independent Test**: Complete a habit-generated task, verify streak updates. Simulate a sync failure, verify error is shown and task completion is preserved.

**Acceptance Scenarios**:

1. **Given** a habit-generated task exists, **When** the user completes it, **Then** the habit streak increments and the user sees a success confirmation
2. **Given** a habit-generated task exists, **When** the user completes it but habit sync fails, **Then** the task is still marked complete AND the user sees a warning that streak sync failed
3. **Given** a habit-generated task exists, **When** the user completes it but habit sync fails, **Then** the failure is logged with sufficient detail for debugging

---

### User Story 2 - Consistent API Communication (Priority: P1)

As a user navigating the app, all pages should load data reliably without API errors caused by inconsistent URL construction. Today, different API client files use different base URL conventions, which could cause intermittent failures depending on environment configuration.

**Why this priority**: Foundational reliability. If API calls fail due to URL mismatches, no feature works correctly.

**Independent Test**: Navigate to tasks page, habits page, and dashboard. All data loads correctly. Change `NEXT_PUBLIC_API_URL` to a custom domain, verify all endpoints still resolve correctly.

**Acceptance Scenarios**:

1. **Given** the app is running, **When** a user navigates to any page, **Then** all API calls use a single, consistent base URL pattern
2. **Given** `NEXT_PUBLIC_API_URL` is set to `https://api.example.com`, **When** any API call is made, **Then** the URL is constructed correctly without duplicate or missing path segments
3. **Given** the API client files, **When** a developer reviews them, **Then** all files import and use the same base URL constant

---

### User Story 3 - Authenticated User Experience (Priority: P1)

As an authenticated user, my identity should persist across pages without redundant API calls, and I should never see hardcoded test data. Today, each protected page independently fetches user data, and a `test-user-id` fallback exists in production code.

**Why this priority**: Security and UX. Hardcoded test IDs could expose wrong data. Redundant API calls slow navigation.

**Independent Test**: Log in, navigate between dashboard/tasks/habits pages. User identity is consistent across all pages without re-fetching. Verify no hardcoded user IDs in shipped code.

**Acceptance Scenarios**:

1. **Given** a user is logged in, **When** they navigate between protected pages, **Then** their identity is available immediately without a loading flash
2. **Given** the codebase, **When** searching for hardcoded user IDs, **Then** zero results are found in production code
3. **Given** an unauthenticated user, **When** they access a protected route, **Then** they are redirected to login immediately

---

### User Story 4 - Graceful Error Recovery (Priority: P2)

As a user, when something goes wrong (network error, server error, invalid data), I should see a helpful error message with the option to retry, not a blank screen or cryptic error. Today, there are no error boundaries and error messages are generic.

**Why this priority**: User experience during failures determines if users come back. Blank screens cause user abandonment.

**Independent Test**: Disconnect network, try to load tasks page. Verify error message appears with retry button. Simulate a 500 error on habit creation, verify specific error feedback.

**Acceptance Scenarios**:

1. **Given** any page in the app, **When** an unhandled error occurs in a component, **Then** an error boundary catches it and displays a user-friendly recovery screen
2. **Given** an API call fails, **When** the user sees the error, **Then** the message includes what went wrong and a way to retry
3. **Given** a form submission fails, **When** the backend returns validation errors, **Then** field-level errors are displayed next to the relevant inputs

---

### User Story 5 - Secure Authentication Endpoints (Priority: P2)

As a system administrator, I expect authentication endpoints to be protected against brute-force attacks. Today, there is no rate limiting, meaning an attacker could attempt unlimited login attempts.

**Why this priority**: Security baseline for any production application.

**Independent Test**: Send 20 rapid login requests with wrong credentials. After a threshold, subsequent requests should be rejected with a 429 status.

**Acceptance Scenarios**:

1. **Given** the login endpoint, **When** more than 10 failed attempts are made from the same source within 1 minute, **Then** subsequent requests are rejected with a 429 Too Many Requests response
2. **Given** the registration endpoint, **When** more than 5 registration attempts are made from the same source within 5 minutes, **Then** subsequent requests are rejected with 429
3. **Given** a rate-limited user, **When** the rate limit window expires, **Then** they can attempt login again normally

---

### User Story 6 - Real Health Monitoring (Priority: P2)

As a DevOps engineer, when I call the health endpoint, I need to know if the database is actually reachable. Today, the health endpoint returns a hardcoded "connected" status regardless of actual database state.

**Why this priority**: Without real health checks, monitoring tools cannot detect outages. Critical for production operations.

**Independent Test**: Call `/health` with database running, verify "connected". Stop database, call `/health`, verify "disconnected" or error status.

**Acceptance Scenarios**:

1. **Given** the database is reachable, **When** `/health` is called, **Then** it returns status "healthy" with database status "connected"
2. **Given** the database is unreachable, **When** `/health` is called, **Then** it returns status "unhealthy" with database status "disconnected" and appropriate HTTP status code
3. **Given** the health endpoint, **When** called under normal conditions, **Then** the response includes application version and uptime information

---

### User Story 7 - Complete Task Search & Discovery (Priority: P2)

As a user with many tasks, I want to search my tasks by keyword and get tag suggestions when creating tasks. Today, the search backend exists but has no UI, and the tags autocomplete endpoint is unused.

**Why this priority**: Feature completeness. Users with 50+ tasks need search to be productive. Tag autocomplete reduces friction.

**Independent Test**: Create 10 tasks with various titles. Type a search keyword, verify matching tasks appear. Create a task, start typing a tag, verify suggestions from existing tags appear.

**Acceptance Scenarios**:

1. **Given** the tasks page, **When** a user types in the search field, **Then** results are filtered to show tasks matching the keyword in title or description
2. **Given** the task creation form, **When** a user starts typing in the tags field, **Then** existing tags are suggested as autocomplete options
3. **Given** a search query with no matches, **When** results are displayed, **Then** an empty state shows "No tasks found" with the search term

---

### User Story 8 - Input Validation Consistency (Priority: P3)

As a user, when I update a task or habit, the same validation rules should apply as when I create them. Today, some update endpoints skip enum validation for status and category fields, potentially allowing invalid data.

**Why this priority**: Data integrity. Inconsistent validation allows corrupt data that could crash the UI.

**Independent Test**: Send a PATCH request to update a task with an invalid status value. Verify 400 error with clear message. Same for habit category.

**Acceptance Scenarios**:

1. **Given** a task update request, **When** the status field contains an invalid value, **Then** the system rejects it with a 400 error listing valid options
2. **Given** a habit update request, **When** the category field contains an invalid value, **Then** the system rejects it with a 400 error listing valid options
3. **Given** a task update request, **When** the description exceeds 5000 characters, **Then** the system rejects it with a 400 error

---

### User Story 9 - Performance & Responsiveness (Priority: P3)

As a user, I expect filters and actions to feel responsive without unnecessary page reloads. Today, filter changes trigger immediate API calls (no debouncing), and task actions cause full page re-renders.

**Why this priority**: Polish and user experience. Fast interactions make the app feel professional.

**Independent Test**: Toggle habit filters rapidly 10 times. Verify only 1-2 API calls are made (debounced). Complete a task, verify the page updates without full reload.

**Acceptance Scenarios**:

1. **Given** the habits filter panel, **When** a user changes filters rapidly, **Then** API calls are debounced (max 1 call per 300ms)
2. **Given** a task card, **When** the user completes or deletes it, **Then** the UI updates optimistically without a full page reload
3. **Given** the habit creation form, **When** loading anchor habits, **Then** results are cached and not re-fetched on every form mount

---

### User Story 10 - Robust Event Logging (Priority: P3)

As a system operator, I need the event logging system to report failures instead of silently swallowing them. Today, the EventEmitter catches all exceptions and prints to console, masking real issues in production.

**Why this priority**: Observability. Silent logging failures mean audit trail gaps go undetected.

**Independent Test**: Simulate a file write failure in EventEmitter. Verify the error is logged via Python logging (not just print). Verify the original operation still succeeds.

**Acceptance Scenarios**:

1. **Given** an event is emitted, **When** the file write fails, **Then** the error is logged using the Python logging framework at WARNING level
2. **Given** an event emission failure, **When** it occurs, **Then** the original operation (task create, habit complete, etc.) still succeeds
3. **Given** repeated event emission failures, **When** the failure count exceeds a threshold within a time window, **Then** an ERROR-level log is emitted to alert operators

---

### Edge Cases

- What happens when the database goes down mid-request? (Error boundary catches, retry option shown)
- What happens when a user's session expires while they're filling out a long form? (Form data preserved, redirect to login, form restored after re-auth)
- What happens when two tabs complete the same habit simultaneously? (409 Conflict returned on second, first succeeds)
- What happens when rate limiting kicks in during a legitimate login attempt? (Clear message with retry-after time)
- What happens when API URL has a trailing slash in env var? (Normalized, no double-slash)
- What happens when EventEmitter log directory doesn't exist? (Created automatically, failure logged)
- What happens when search query contains special characters? (Escaped properly, no SQL injection, meaningful results)
- What happens when a user rapidly clicks the "Complete" button? (Debounced, only one request sent)

## Requirements *(mandatory)*

### Functional Requirements

#### Critical Fixes (Phase 1)
- **FR-001**: System MUST log habit sync failures with error details when task completion sync fails, and return sync status in the response
- **FR-002**: System MUST use a single, centralized API base URL constant across all frontend API client modules
- **FR-003**: System MUST NOT contain hardcoded test user IDs or development fallbacks in production code paths
- **FR-004**: System MUST perform an actual database connectivity check in the health endpoint

#### Reliability & Security (Phase 2)
- **FR-005**: System MUST provide React error boundaries that catch rendering errors and display recovery UI
- **FR-006**: System MUST provide a shared user session context so protected pages don't independently re-fetch user data
- **FR-007**: System MUST show loading skeletons on all pages that fetch data
- **FR-008**: System MUST enforce rate limiting on authentication endpoints (login, register)
- **FR-009**: System MUST validate all enum fields (status, priority, category) on both create and update operations
- **FR-010**: System MUST validate description length on update operations (max 5000 characters)
- **FR-011**: System MUST restrict CORS headers to explicitly allowed values instead of wildcard
- **FR-012**: System MUST log EventEmitter failures using Python logging framework instead of print statements

#### Feature Completeness (Phase 3)
- **FR-013**: System MUST provide a search input on the tasks page that filters tasks by keyword
- **FR-014**: System MUST provide tag autocomplete suggestions in the task creation/edit form using the existing tags endpoint
- **FR-015**: System MUST debounce filter changes on list pages (300ms minimum)
- **FR-016**: System MUST cache habit list data in the habit form to avoid re-fetching on every mount
- **FR-017**: System MUST provide a password confirmation field on the registration form

#### Quality Assurance (Phase 4)
- **FR-018**: System MUST have end-to-end tests covering login, task CRUD, and habit completion flows
- **FR-019**: System MUST pass WCAG AA accessibility audit on all pages
- **FR-020**: System MUST standardize timezone handling to UTC across all backend services

### Key Entities

- **UserContext**: Authenticated user session data shared across the frontend (user ID, email, loading state)
- **ErrorBoundary**: Component that catches React rendering errors and provides fallback UI with retry capability
- **RateLimiter**: Configuration for request throttle per endpoint (window size, max attempts, lockout duration)
- **HealthStatus**: Response object with database connectivity, application version, and uptime

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Zero silent failures in task-to-habit sync - all sync errors produce visible user feedback and log entries
- **SC-002**: All API calls from the frontend resolve correctly regardless of `NEXT_PUBLIC_API_URL` configuration (with or without trailing slash, with or without `/api` prefix)
- **SC-003**: Authenticated users see their data within 200ms of page navigation (no redundant auth API calls)
- **SC-004**: 100% of pages display a user-friendly error screen when a component crashes (no blank white screens)
- **SC-005**: Authentication endpoints reject excessive requests after 10 failed attempts within 1 minute
- **SC-006**: Health endpoint accurately reflects database connectivity status (true positive and true negative)
- **SC-007**: Users can search tasks by keyword and see results within 500ms
- **SC-008**: Tag autocomplete provides suggestions within 300ms of user input
- **SC-009**: All existing 44 test files continue to pass after all changes (zero regressions)
- **SC-010**: WCAG AA compliance achieved on all public-facing pages (Lighthouse accessibility score >= 90)
- **SC-011**: All enum fields reject invalid values on both create and update operations with clear error messages

## Assumptions

- Working on current branch `007-landing-page-update` - no new branch creation
- PostgreSQL (Neon) remains the production database
- No changes to the existing database schema or migrations needed
- Rate limiting will be in-memory (acceptable for single-instance deployment)
- Error boundaries use React's built-in ErrorBoundary pattern
- Password confirmation is frontend-only validation (backend already validates length)
- E2E tests will use Playwright (consistent with outstanding T026 task)
- All fixes maintain backward compatibility with existing API contracts
- Frontend debouncing uses simple setTimeout/useEffect pattern (no new dependencies required)

## Scope Boundaries

### In Scope
- All Critical (C1-C4), High (H1-H10), and Medium (M1-M12) issues from PROJECT_ANALYSIS.md
- Selected Low issues (L5 password confirmation)
- E2E test setup and critical flow coverage
- Accessibility audit and fixes

### Out of Scope
- Dark mode (deferred per ADR)
- Soft delete for tasks (L1 - architectural change, not a fix)
- Storybook/component documentation (L7 - nice-to-have)
- Visual regression testing (L8 - requires external service)
- Shared types sync validation (L9 - separate effort)
- Performance profiling beyond FCP (T029 - separate optimization sprint)
- SSR hydration refactoring (L6 - requires architectural review)

## Dependencies

- Existing test suite must be green before starting
- `PROJECT_ANALYSIS.md` serves as the authoritative issue list
- Playwright must be installable in the project for E2E tests
- No external services required (rate limiting is in-memory)

## Risks

- **Regression risk**: Fixing API URL patterns could break existing working pages if not careful - mitigated by running full test suite after each change
- **Rate limiting false positives**: Aggressive rate limiting could lock out legitimate users behind shared IPs - mitigated by reasonable thresholds and clear retry-after messaging
- **Scope creep**: Fixing one issue may reveal related issues - mitigated by strict phase boundaries and tracking in PROJECT_ANALYSIS.md
