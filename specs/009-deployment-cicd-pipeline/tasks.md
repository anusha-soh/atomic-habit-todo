# Tasks: Deployment, CI/CD Pipeline & Test Infrastructure

**Input**: Design documents from `/specs/009-deployment-cicd-pipeline/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, quickstart.md

**Tests**: Not explicitly requested in spec — test tasks omitted. The feature itself IS test infrastructure.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Fix missing dependencies and prepare shared configuration files

- [x] T001 Add `apscheduler>=3.10.0` to runtime dependencies in `apps/api/pyproject.toml` (FR-022)
- [x] T002 [P] Create `docker-compose.yml` at repo root with `test-db` (PostgreSQL 16, port 5433), `db` (PostgreSQL 16, port 5432), and `api` (build from `apps/api/Dockerfile`, port 8000→7860) services per plan D3/R7

**Checkpoint**: Missing dependency fixed, Docker Compose available for all subsequent phases.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Refactor the test infrastructure so unit tests run without any database — this BLOCKS User Stories 1 and 2

**CRITICAL**: No CI pipeline or deployment work can begin until tests are decoupled from the remote database.

- [x] T003 Refactor root `apps/api/tests/conftest.py`: remove `engine` and `session` fixtures from root scope; keep only non-DB fixtures (`user_id`, `mock_event_emitter`, `event_emitter`, factory functions `create_task_data`, `create_user_data`). Remove all model imports that trigger DB connections at import time. Remove `load_dotenv()` call from root conftest (unit tests must not load `.env`).
- [x] T004 Create `apps/api/tests/integration/conftest.py` with DB-dependent fixtures: `engine` (module-scoped, reads `TEST_DATABASE_URL` or `DATABASE_URL`, skips per-test if missing), `session` (function-scoped with rollback + cleanup for `habit_completions`, `habits`, `tasks`, `users` tables per plan D7), `test_user`, `another_user`, `sample_task`, `completed_task`, `multiple_tasks`, `sample_habit`, `sample_habits_multiple`, `sample_habit_with_anchor`, `ensure_test_user_exists`, `client` fixtures — all moved from root conftest.
- [x] T005 Update all existing unit test files in `apps/api/tests/unit/` to remove any `session`, `engine`, `test_user`, `sample_task`, or other DB-dependent fixture usage. Replace with `unittest.mock.MagicMock`/`Mock` or plain object construction. Files to audit: `test_event_emitter.py`, `test_streak_calculator.py`, and any other `tests/unit/test_*.py` files. Each unit test must pass with zero DB fixtures.
- [x] T006 Verify unit tests run without DB: execute `pytest tests/unit/ -v` in `apps/api/` with no `DATABASE_URL` or `TEST_DATABASE_URL` set — all tests must pass in under 5 seconds with zero network calls (SC-001)

**Checkpoint**: Foundation ready — unit tests decoupled from DB, integration tests have their own conftest. CI and deployment work can begin.

---

## Phase 3: User Story 1 — Fast Local Test Feedback (Priority: P1) MVP

**Goal**: Backend unit tests complete in <5s with no network; integration tests complete in <30s using Docker PostgreSQL on port 5433.

**Independent Test**: Run `pytest tests/unit/` with no network — all pass in <5s. Run `docker compose up test-db -d` then `TEST_DATABASE_URL=postgresql://test:test@localhost:5433/test_db pytest tests/integration/ -v` — all pass in <30s.

### Implementation for User Story 1

- [x] T007 [US1] Verify integration tests pass against Docker `test-db`: start `docker compose up test-db -d`, run `TEST_DATABASE_URL=postgresql://test:test@localhost:5433/test_db pytest tests/integration/ -v` from `apps/api/`, confirm all integration tests pass and complete in under 30 seconds (SC-002)
- [x] T008 [US1] Fix any integration test failures caused by the conftest split (T003/T004) — ensure fixture references resolve correctly, table cleanup order handles foreign keys (habit_completions → habits → tasks → users)
- [x] T009 [US1] Validate no remote Neon database connections during unit or integration test runs — ensure `conftest.py` does NOT call `load_dotenv()` for unit tests and integration conftest uses only `TEST_DATABASE_URL` or explicit `DATABASE_URL` (FR-001, FR-003, FR-021)

**Checkpoint**: US1 complete — developers get fast local test feedback. Unit tests <5s (no DB), integration tests <30s (Docker PostgreSQL).

---

## Phase 4: User Story 2 — Automated Quality Gates (Priority: P1)

**Goal**: Every push triggers GitHub Actions CI that runs backend unit + integration tests, frontend tests, frontend build, and E2E tests within 15 minutes.

**Independent Test**: Push a commit to a feature branch, observe GitHub Actions workflow, verify pass/fail status on the PR.

### Implementation for User Story 2

- [x] T010 [US2] Create `.github/workflows/ci.yml` with workflow trigger on push (any branch) and pull_request (to `main`). Define 5 jobs per plan D4:
  1. `backend-unit-tests`: Python 3.13, `pip install -e ".[dev]"`, `pytest tests/unit/ -v` — no DB service
  2. `backend-integration-tests`: Python 3.13, PostgreSQL 16 service container (user: test, pass: test, db: test_db, health-cmd: pg_isready), `TEST_DATABASE_URL` env var, `pytest tests/integration/ -v`
  3. `frontend-tests`: Node 20, pnpm, `pnpm --filter web test`
  4. `frontend-build`: Node 20, pnpm, `pnpm --filter web build`
  5. `e2e-tests`: depends on all 4 above; installs Playwright browsers, starts backend (uvicorn background) + frontend (`pnpm build && pnpm start` background), runs `npx playwright test` with `--retries=2` per risk R1
- [x] T011 [US2] Configure CI environment variables: `DATABASE_URL`/`TEST_DATABASE_URL` pointing to service container `postgresql://test:test@localhost:5432/test_db`, `BETTER_AUTH_SECRET` (test value), `ALLOWED_ORIGINS=http://localhost:3000`, `NEXT_PUBLIC_API_URL=http://localhost:8000` for E2E job
- [x] T012 [US2] Add pnpm caching (`actions/cache` or `pnpm/action-setup` with cache) and pip caching (`actions/cache` for pip) to CI jobs to keep total runtime under 15 minutes (FR-011-A, SC-003)
- [x] T013 [US2] Verify CI pipeline by pushing the workflow file to the feature branch and confirming all 5 jobs pass (or identifying failures to fix). Ensure no job uses the production Neon database (FR-021).

**Checkpoint**: US2 complete — every push runs automated quality gates. PR merges are gated by CI status.

---

## Phase 5: User Story 3 — One-Command Frontend Deployment (Priority: P2)

**Goal**: Frontend auto-deploys to Vercel when code merges to `main`. Preview deployments for PRs.

**Independent Test**: Merge a PR to `main`, verify Vercel builds and deploys `apps/web/`.

### Implementation for User Story 3

- [x] T014 [US3] Create `vercel.json` at repo root with monorepo configuration per plan D5: `buildCommand` targeting `apps/web`, `outputDirectory` as `apps/web/.next`, `installCommand` as `pnpm install`, `framework` as `nextjs`
- [x] T015 [US3] Document Vercel project setup steps in `specs/009-deployment-cicd-pipeline/quickstart.md` (update existing file): connect GitHub repo to Vercel, set root directory to `apps/web` in dashboard, add `NEXT_PUBLIC_API_URL` environment variable pointing to HF Spaces backend URL (FR-011, FR-012, FR-013)

**Checkpoint**: US3 complete — Vercel auto-deploys frontend on merge to `main`, preview URLs on PRs.

---

## Phase 6: User Story 4 — Backend Deployment to HF Spaces (Priority: P2)

**Goal**: Backend auto-deploys to HF Spaces after CI passes on `main` via GitHub Actions.

**Independent Test**: Merge to `main`, verify GitHub Actions syncs `apps/api/` to HF Spaces, `/health` returns `{"status":"healthy","database":"connected"}`.

### Implementation for User Story 4

- [x] T016 [US4] Add `deploy-hf` job to `.github/workflows/ci.yml`: runs only on `main` branch (`if: github.ref == 'refs/heads/main'`), depends on all test jobs passing, uses `git subtree split --prefix=apps/api -b hf-deploy` then force-pushes to HF Spaces git repo using `HF_TOKEN` secret per plan D6/R5 (FR-014, FR-017, FR-018-A)
- [x] T017 [US4] Document HF Spaces secrets configuration in `specs/009-deployment-cicd-pipeline/quickstart.md` (update): `DATABASE_URL` (Neon), `BETTER_AUTH_SECRET`, `ALLOWED_ORIGINS` (include Vercel URL) must be set in HF Spaces Secrets UI (FR-015, FR-016). Document `HF_TOKEN` must be set in GitHub repo secrets.
- [x] T018 [US4] Document rollback procedure in quickstart.md: revert commit on GitHub → CI passes → auto-syncs previous version to HF Spaces (FR-019-A)

**Checkpoint**: US4 complete — backend deploys automatically after CI passes on `main`. Rollback via git revert.

---

## Phase 7: User Story 5 — Local Full-Stack Development (Priority: P3)

**Goal**: New developer can `docker compose up` and have the full stack running locally.

**Independent Test**: Clone repo, run `docker compose up`, verify API at `localhost:8000` and DB at `localhost:5432`.

### Implementation for User Story 5

- [x] T019 [US5] Enhance `docker-compose.yml` (created in T002): add `api` service environment variables (`DATABASE_URL=postgresql://postgres:postgres@db:5432/atomichabits`, `BETTER_AUTH_SECRET`, `ALLOWED_ORIGINS=http://localhost:3000`), add `depends_on: db` with health check condition, expose port 8000
- [x] T020 [US5] Add `.env.docker` example file at repo root with local development defaults (non-secret values) for Docker Compose, referenced via `env_file` in docker-compose.yml. Ensure `.env.docker` is committed (contains no real secrets — only localhost defaults) (FR-020)
- [x] T021 [US5] Validate full-stack local dev: run `docker compose up db api`, verify API responds at `http://localhost:8000/health`, verify DB is accessible at `localhost:5432` (SC-007)

**Checkpoint**: US5 complete — new developers run `docker compose up` for instant local environment.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, security verification, and final validation

- [x] T022 [P] Verify no production credentials in any committed file — scan repo for hardcoded database URLs, API keys, tokens using `grep -r` for patterns like `neon.tech`, `postgresql://` (excluding `.env.example`, docs), `BETTER_AUTH_SECRET=` with actual values (FR-020, SC-008)
- [x] T023 [P] Update `specs/009-deployment-cicd-pipeline/quickstart.md` with complete local dev guide: prerequisites, unit test commands, integration test commands, full-stack docker compose, E2E test commands — verify all commands work end-to-end
- [x] T024 Validate all success criteria: SC-001 (unit <5s), SC-002 (integration <30s), SC-003 (CI <15min), SC-004 (auto-trigger), SC-005 (Vercel deploy), SC-006 (HF deploy guide), SC-007 (docker compose up), SC-008 (no secrets committed)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on T001 (apscheduler) — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 (conftest split) + T002 (docker-compose for test-db)
- **US2 (Phase 4)**: Depends on Phase 2 (working unit tests) + US1 (working integration tests)
- **US3 (Phase 5)**: Depends on Phase 1 only — can run in parallel with US1/US2
- **US4 (Phase 6)**: Depends on US2 (CI workflow exists to add deploy job to)
- **US5 (Phase 7)**: Depends on T002 (docker-compose exists)
- **Polish (Phase 8)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)**: Requires Phase 2 complete. No dependencies on other stories.
- **US2 (P1)**: Requires US1 complete (tests must work before CI can run them).
- **US3 (P2)**: Independent of US1/US2 — can start after Phase 1.
- **US4 (P2)**: Requires US2 complete (deploy job added to CI workflow).
- **US5 (P3)**: Requires T002 (docker-compose) — can start after Phase 1.

### Within Each User Story

- Infrastructure before configuration
- Configuration before validation
- Validation is always the last task in each story

### Parallel Opportunities

- T001 and T002 can run in parallel (Phase 1)
- T003, T004, T005 are sequential (conftest refactor is ordered)
- US3 (Vercel) can run in parallel with US1+US2 (test infrastructure + CI)
- US5 (Docker local dev) can start in parallel with US2 after T002 is done
- T022, T023 can run in parallel (Phase 8)

---

## Parallel Example: Phase 1

```bash
# These can run simultaneously (different files):
Task T001: "Add apscheduler to pyproject.toml"
Task T002: "Create docker-compose.yml"
```

## Parallel Example: After Phase 2

```bash
# US3 can run in parallel with US1 (different concerns):
Task T014: "Create vercel.json" (US3)
Task T007: "Verify integration tests against Docker test-db" (US1)
```

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Complete Phase 1: Setup (T001–T002)
2. Complete Phase 2: Foundational conftest refactor (T003–T006)
3. Complete Phase 3: US1 — Fast local tests (T007–T009)
4. Complete Phase 4: US2 — CI pipeline (T010–T013)
5. **STOP and VALIDATE**: Push to branch, verify CI runs all checks
6. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Fast unit tests work locally (immediate developer value)
2. Add US1 → Integration tests work with Docker (full local test story)
3. Add US2 → CI pipeline on every push (quality gates)
4. Add US3 → Vercel auto-deploy (frontend live)
5. Add US4 → HF Spaces auto-deploy (backend live)
6. Add US5 → Docker Compose full stack (onboarding)
7. Polish → Documentation, security scan, final validation

---

## Summary

| Metric | Value |
|--------|-------|
| **Total tasks** | 24 |
| **Phase 1 (Setup)** | 2 tasks |
| **Phase 2 (Foundational)** | 4 tasks |
| **US1 (Fast Tests)** | 3 tasks |
| **US2 (CI Pipeline)** | 4 tasks |
| **US3 (Vercel Deploy)** | 2 tasks |
| **US4 (HF Deploy)** | 3 tasks |
| **US5 (Local Dev)** | 3 tasks |
| **Polish** | 3 tasks |
| **Parallel opportunities** | 5 identified |
| **Suggested MVP scope** | US1 + US2 (Phases 1–4, 13 tasks) |

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- US3 (Vercel) requires manual Vercel dashboard setup — documented in quickstart.md
- US4 (HF Spaces) requires `HF_TOKEN` in GitHub secrets — documented in quickstart.md
