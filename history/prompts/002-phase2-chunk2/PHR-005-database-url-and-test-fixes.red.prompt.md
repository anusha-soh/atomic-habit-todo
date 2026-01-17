---
id: PHR-005
title: Database URL and test fixes
stage: red
date: 2026-01-06
surface: agent
model: claude-sonnet-4-5-20250929
feature: 002-phase2-chunk2
branch: 002-phase2-chunk2
user: anusha-soh
command: conversation
labels: ["database", "postgresql", "testing", "fixtures", "debugging", "test-isolation"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - apps/api/.env
  - apps/api/tests/conftest.py
  - apps/api/tests/unit/test_task_service.py
tests:
  - Contract tests: 8/8 PASSED
  - Unit tests: 16/16 PASSED
  - Integration tests: 1/11 PASSED (10 failures due to fixture issues)
---

## Prompt

i want to fix DATA_BASE URL. and typescript issue, se that testing go smothly

## Response snapshot

Fixed DATABASE_URL configuration by adding TEST_DATABASE_URL to .env file and loading it via python-dotenv in conftest.py. Fixed test fixture issues where create_task fixture was trying to create tasks for non-existent users, causing foreign key violations. Updated conftest.py with table truncation between tests for proper isolation. Fixed 3 unit tests that were using raw UUID instead of user fixtures. All US2 contract tests (8/8) and unit tests (16/16) now pass with PostgreSQL.

## Outcome

- ✅ Impact: DATABASE_URL properly configured for tests, all US2 contract and unit tests passing with PostgreSQL, test isolation working
- 🧪 Tests: Contract: 8/8 PASS, Unit: 16/16 PASS, Integration: 1/11 PASS (backend verified, fixture issues remain)
- 📁 Files: 3 files modified (.env, conftest.py, test_task_service.py)
- 🔁 Next prompts: Fix integration test fixtures for remaining 10 failures, install npm dependencies and run TypeScript checks, run full test suite
- 🧠 Reflection: Test isolation with PostgreSQL requires explicit table truncation since transactions can't rollback committed data. Foreign key constraints in tests require proper fixture dependencies (test_user, another_user) rather than raw UUIDs.

## Evaluation notes (flywheel)

- Failure modes observed: Initial approach using transaction rollback failed because service methods commit data. Tests were leaving data in database causing duplicate key errors. Foreign key violations when creating tasks for non-existent users.
- Graders run and results (PASS/FAIL): Contract tests: 8/8 PASS. Unit tests: 16/16 PASS (after fixes). Integration tests: 1/11 PASS (10 failures due to fixture setup, not backend issues).
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Use pytest-postgresql plugin for automatic test database management, or implement database factory pattern for integration tests to properly set up related entities.
