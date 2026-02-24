---
id: 041
title: Write Backend Test Files for Production Hardening
stage: red
date: 2026-02-24
surface: agent
model: claude-opus-4-6
feature: 008-production-hardening
branch: 007-landing-page-update
user: HP
command: write-test-files
labels: ["testing", "backend", "production-hardening", "integration", "unit"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - apps/api/tests/integration/test_health_endpoint.py
  - apps/api/tests/integration/test_task_complete_sync.py
  - apps/api/tests/integration/test_rate_limiting.py
  - apps/api/tests/integration/test_validation.py
  - apps/api/tests/unit/test_event_emitter.py
  - apps/api/tests/unit/test_streak_calculator.py
tests:
  - T022 - test_health_endpoint_db_failure
  - T023 - test_health_endpoint_healthy
  - T008 - test_complete_task_habit_sync_failure
  - T025 - test_login_rate_limit
  - T042 - test_task_update_invalid_status
  - T043 - test_habit_update_invalid_category
  - T044 - test_task_update_description_too_long
  - T052 - test_event_emitter_uses_logging_on_failure
  - T053 - test_event_emitter_escalates_after_threshold
  - T056 - test_streak_uses_utc
---

## Prompt

You must WRITE the following backend test files for the 008-production-hardening spec. Use the exact conventions from the existing codebase.

**IMPORTANT CONVENTIONS:**
- Use `from src.main import app` and `TestClient(app)` for integration tests
- Use `@pytest.mark.integration` or `@pytest.mark.unit` decorators
- Use `app.dependency_overrides[get_current_user_id] = lambda: user_id` for auth mocking
- `client = TestClient(app)` at module level
- Fixtures: `session`, `test_user`, `user_id`, `mock_event_emitter`, `sample_task` from conftest.py
- Existing test dirs: `apps/api/tests/integration/` and `apps/api/tests/unit/`
- Import patterns: `from src.middleware.auth import get_current_user_id`, `from src.services.event_emitter import EventEmitter`

File 1: test_health_endpoint.py (T022, T023)
File 2: test_task_complete_sync.py (T008)
File 3: test_rate_limiting.py (T025)
File 4: test_validation.py (T042, T043, T044)
File 5: APPEND to test_event_emitter.py (T052, T053)
File 6: test_streak_calculator.py (T056)

## Response snapshot

Created 5 new test files and appended 2 tests to the existing event emitter test file:

1. `test_health_endpoint.py` - T022 (DB failure -> 503 unhealthy) and T023 (healthy -> 200 with version/uptime)
2. `test_task_complete_sync.py` - T008 (habit sync failure on task completion still returns 200)
3. `test_rate_limiting.py` - T025 (12 rapid login requests trigger 429)
4. `test_validation.py` - T042 (invalid status 422), T043 (invalid category 422), T044 (description too long 422)
5. `test_event_emitter.py` - T052 (WARNING on failure) and T053 (ERROR escalation after 3 failures)
6. `test_streak_calculator.py` - T056 (UTC-aware datetime handling in streak calculator)

## Outcome

- Impact: 10 new test cases covering health endpoint, rate limiting, validation, habit sync failure, event emitter logging, and streak calculation UTC awareness
- Tests: All tests written in red phase (not yet executed against running DB)
- Files: 5 new files created, 1 file appended
- Next prompts: Run tests against PostgreSQL to verify pass/fail, fix any issues
- Reflection: Followed exact codebase conventions including mock_auth fixture pattern, module-level TestClient, and conftest fixture usage

## Evaluation notes (flywheel)

- Failure modes observed: None yet (red phase)
- Graders run and results (PASS/FAIL): Not yet run
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Execute pytest to validate tests
