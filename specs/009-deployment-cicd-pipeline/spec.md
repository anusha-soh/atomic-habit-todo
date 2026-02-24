# Feature Specification: Deployment, CI/CD Pipeline & Test Infrastructure

**Feature Branch**: `009-deployment-cicd-pipeline`
**Created**: 2026-02-24
**Status**: Draft
**Input**: User description: "Configure deployment for Vercel (frontend) + Hugging Face Spaces (backend), add GitHub Actions CI/CD pipeline, and fix slow test infrastructure (tests currently hit remote Neon PostgreSQL for every test run)"

## Context & Scope

The application is feature-complete (008-production-hardening done) but has **no automated deployment pipeline** and **no CI/CD**. Additionally, the backend test suite is unusably slow (~60s+ for 182 tests) because every test — including pure unit tests — connects to a remote Neon PostgreSQL instance over the internet.

This spec covers three concerns that are tightly related:
1. **Test infrastructure** — fast, isolated test execution (prerequisite for CI)
2. **CI pipeline** — automated quality gates on every push (prerequisite for safe deployment)
3. **Deployment configuration** — ship frontend to Vercel, backend to Hugging Face Spaces

### What Already Exists
- `apps/api/Dockerfile` targeting HF Spaces (port 7860)
- `apps/api/HF_README.md` with HF Space metadata
- `apps/api/DEPLOY_HUGGINGFACE.md` manual deployment guide
- `.env.example` documenting all required environment variables
- Alembic migrations (5 files) run automatically in Dockerfile CMD
- `apps/web/package.json` with `build` and `start` scripts (Vercel-compatible)
- No `vercel.json`, no GitHub Actions, no `docker-compose.yml`

### What's Out of Scope
- Kubernetes / Helm / Dapr (Phase IV-V per constitution)
- Staging environment (single production environment for hackathon)
- Custom domain configuration
- CDN or edge caching setup
- Monitoring / alerting infrastructure (future spec)

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Fast Local Test Feedback (Priority: P1)

As a developer, I want backend tests to complete in under 10 seconds locally, so I get fast feedback on every change without waiting for remote database round-trips.

**Why this priority**: Slow tests block everything — developers skip running them, CI pipelines take forever, and deployment confidence drops. This is the foundation all other stories depend on.

**Independent Test**: Run `pytest tests/unit/` locally with no network connection and verify all unit tests pass in under 5 seconds. Run `pytest tests/integration/` with a local Docker PostgreSQL and verify completion in under 30 seconds.

**Acceptance Scenarios**:

1. **Given** a developer with no network access, **When** they run `pytest tests/unit/`, **Then** all unit tests pass using an in-memory or local database in under 5 seconds
2. **Given** a developer with Docker installed, **When** they run `docker compose up test-db` and then `pytest tests/integration/`, **Then** integration tests run against a local PostgreSQL container and complete in under 30 seconds
3. **Given** the existing `conftest.py` with `autouse=True` on `ensure_test_user_exists`, **When** unit tests are collected, **Then** no remote database connection is attempted for tests that don't need the database
4. **Given** the `conftest.py` engine fixture, **When** no `DATABASE_URL` is set, **Then** unit tests still run (they don't skip) using a local SQLite or mocked database

---

### User Story 2 — Automated Quality Gates (Priority: P1)

As a team lead, I want every push to the repository to automatically run tests and build checks, so broken code never reaches the main branch without being caught.

**Why this priority**: Without CI, deployments are manual and error-prone. A single broken merge can take down the live app. This is the safety net that enables confident deployment.

**Independent Test**: Push a commit to a feature branch, observe the GitHub Actions workflow run, and verify it reports pass/fail status on the pull request.

**Acceptance Scenarios**:

1. **Given** a push to any branch, **When** the CI workflow triggers, **Then** it runs backend unit + integration tests, frontend unit tests, frontend build, and E2E tests within 15 minutes
2. **Given** a pull request to `main`, **When** any CI check fails, **Then** the PR is blocked from merging (via branch protection rules)
3. **Given** a CI run, **When** backend tests execute, **Then** they use a CI-provisioned PostgreSQL service (not the production Neon database)
4. **Given** a CI run, **When** frontend tests execute, **Then** `pnpm test` and `pnpm build` both succeed with zero errors
5. **Given** a CI run, **When** E2E tests execute, **Then** Playwright runs against the backend API + frontend dev server spun up in CI, validating critical user flows (auth, tasks, habits)

---

### User Story 3 — One-Command Frontend Deployment (Priority: P2)

As a developer, I want the frontend to auto-deploy to Vercel when code is merged to `main`, so users immediately get the latest version without manual steps.

**Why this priority**: The frontend is the user-facing layer. Vercel's Git integration makes this near-zero-effort once configured, and it provides preview deployments for PRs.

**Independent Test**: Merge a PR to `main`, wait for Vercel build, and verify the live URL serves the updated application.

**Acceptance Scenarios**:

1. **Given** the Vercel project is connected to the GitHub repository, **When** code is merged to `main`, **Then** Vercel automatically builds and deploys `apps/web/`
2. **Given** a Vercel deployment, **When** the build runs, **Then** it uses the correct `NEXT_PUBLIC_API_URL` pointing to the Hugging Face Spaces backend
3. **Given** a pull request, **When** Vercel creates a preview deployment, **Then** the preview URL is posted as a comment on the PR
4. **Given** a `vercel.json` in the repository, **When** Vercel reads it, **Then** it correctly identifies `apps/web` as the root directory for the monorepo build

---

### User Story 4 — Backend Deployment to Hugging Face Spaces (Priority: P2)

As a developer, I want the backend API to auto-deploy to Hugging Face Spaces when code is merged to `main` (after CI passes), so production deployments are automated, consistent, and gated by quality checks.

**Why this priority**: The Dockerfile and deployment guide already exist but the process is manual. Automating via GitHub Actions eliminates tribal knowledge, ensures only CI-passing code reaches production, and enables rollback via simple git revert.

**Independent Test**: Follow the deployment steps to push to HF Spaces and verify the `/health` endpoint returns `{"status":"healthy","database":"connected"}`.

**Acceptance Scenarios**:

1. **Given** code is merged to `main` and CI passes, **When** the GitHub Actions deploy job runs, **Then** it syncs `apps/api/` (including Dockerfile) to the HF Spaces git repo, triggering an automatic rebuild
2. **Given** the HF Space has `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `ALLOWED_ORIGINS` set as secrets, **When** the container starts, **Then** the API connects to Neon PostgreSQL and serves requests
3. **Given** the `ALLOWED_ORIGINS` secret includes the Vercel frontend URL, **When** the frontend makes API calls, **Then** CORS allows the requests
4. **Given** a failed production deployment, **When** the developer reverts the commit on GitHub, **Then** CI passes on the revert commit and auto-syncs the previous working version to HF Spaces
5. **Given** GitHub is the single source of truth, **When** any team member wants to deploy, **Then** they merge to `main` — no direct pushes to HF Spaces repo are needed

---

### User Story 5 — Local Full-Stack Development (Priority: P3)

As a new developer joining the project, I want to run the entire stack locally with a single command, so I can start contributing without complex setup.

**Why this priority**: Reduces onboarding friction. Docker Compose provides a deterministic local environment that matches production topology.

**Independent Test**: Clone the repo, run `docker compose up`, and verify both frontend and backend are accessible at their respective ports.

**Acceptance Scenarios**:

1. **Given** a fresh clone of the repository, **When** the developer runs `docker compose up`, **Then** a PostgreSQL database, the API server, and optionally the web server start together
2. **Given** the `docker-compose.yml`, **When** it is running, **Then** the API is reachable at `localhost:8000` and the database at `localhost:5432`
3. **Given** the developer wants to run only the test database, **When** they run `docker compose up test-db`, **Then** only the PostgreSQL container starts (for running integration tests locally)

---

### Edge Cases

- What happens when Vercel build fails due to type errors? CI should catch this first; Vercel build is a secondary gate
- What happens when HF Spaces container crashes on startup? The `/health` endpoint returns 503; logs are visible in HF Spaces UI
- What happens when the Neon database is unreachable during CI? CI uses its own PostgreSQL service container — Neon is never used in CI
- What happens when a developer has no Docker installed? Unit tests still run (no Docker needed); integration tests skip gracefully with a clear message
- What happens when `DATABASE_URL` environment variable is missing in CI? The CI workflow explicitly provisions it pointing to the service container
- What happens when Alembic migrations fail in production? The Dockerfile CMD uses `|| true` — the app starts but may have schema issues; health endpoint reports database status

## Requirements *(mandatory)*

### Functional Requirements

**Test Infrastructure**
- **FR-001**: Backend unit tests MUST run without any external database connection
- **FR-002**: Backend integration tests MUST support running against a local PostgreSQL instance via Docker
- **FR-003**: The `conftest.py` `autouse` fixture MUST NOT force a database connection for tests that don't request database fixtures
- **FR-004**: A `docker-compose.yml` MUST provide a PostgreSQL service for local integration testing
- **FR-005**: Frontend tests MUST continue to run via `pnpm test` with no additional infrastructure

**CI/CD Pipeline**
- **FR-006**: A GitHub Actions workflow MUST trigger on every push and pull request to `main`
- **FR-007**: The CI workflow MUST run backend unit tests (no DB required) and integration tests (using a PostgreSQL service container)
- **FR-008**: The CI workflow MUST run frontend unit tests via `pnpm test`
- **FR-009**: The CI workflow MUST verify the frontend builds successfully via `pnpm build`
- **FR-010**: The CI workflow MUST run E2E tests via Playwright against the built application (requires both backend and frontend running in CI)
- **FR-011-A**: The CI workflow MUST complete all checks within 15 minutes (expanded from 10 to accommodate E2E)

**Frontend Deployment**
- **FR-011**: A `vercel.json` MUST configure the monorepo root directory for Vercel
- **FR-012**: The Vercel project MUST auto-deploy `apps/web/` on merge to `main`
- **FR-013**: Environment variable `NEXT_PUBLIC_API_URL` MUST be set in Vercel project settings pointing to the HF Spaces backend URL

**Backend Deployment**
- **FR-014**: The existing `Dockerfile` MUST remain the deployment artifact for HF Spaces
- **FR-015**: All production secrets MUST be configured via HF Spaces Secrets UI (never in code)
- **FR-016**: The `ALLOWED_ORIGINS` value in production MUST include the Vercel deployment URL
- **FR-017**: GitHub Actions MUST auto-sync `apps/api/` to the HF Spaces git repository after CI passes on `main`
- **FR-018-A**: A `HF_TOKEN` secret MUST be stored in GitHub repository secrets to authenticate the push to HF Spaces
- **FR-019-A**: Rollback MUST be achievable by reverting the commit on GitHub — the auto-sync pipeline redeploys the previous version

**Cross-Cutting**
- **FR-020**: No production database credentials MUST appear in any committed file (`.env` files gitignored)
- **FR-021**: The CI pipeline MUST NOT use the production Neon database for any test execution
- **FR-022**: The `apscheduler` dependency MUST be added to `pyproject.toml` (currently imported but missing from deps)

### Key Entities

- **CI Workflow**: A GitHub Actions YAML definition specifying trigger events, jobs, steps, and service containers
- **Docker Compose Service**: Container definitions for local PostgreSQL, optionally the API and web servers
- **Vercel Project Configuration**: JSON configuration mapping the monorepo structure to Vercel's build system
- **Environment Configuration**: The set of environment variables required per deployment target (local, CI, Vercel, HF Spaces)

## Clarifications

### Session 2026-02-24

- Q: What test levels should the CI pipeline execute? → A: Unit tests + integration tests + E2E via Playwright (full test pyramid)
- Q: What is the rollback strategy for failed backend deployment? → A: Git revert on GitHub triggers CI → auto-syncs to HF Spaces repo → HF rebuilds previous version. GitHub is the single source of truth; GitHub Actions auto-pushes apps/api/ to HF Spaces after CI passes.

## Assumptions

- The GitHub repository is hosted on GitHub (not GitLab/Bitbucket) — GitHub Actions is the CI platform
- The team has access to create Vercel projects and connect them to the GitHub repo
- The team has access to create Hugging Face Spaces and configure secrets
- Docker Desktop is available for local development (not required for unit tests)
- The free tiers of Vercel, HF Spaces, and Neon are sufficient for the hackathon
- Branch protection rules on `main` will be configured manually in GitHub settings (not automated by this spec)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Backend unit tests complete locally in under 5 seconds with no network dependency
- **SC-002**: Backend integration tests complete locally in under 30 seconds using a Docker PostgreSQL container
- **SC-003**: The full CI pipeline (backend unit + integration tests, frontend tests, build, and E2E) completes in under 15 minutes
- **SC-004**: Every push to any branch triggers CI automatically with zero manual intervention
- **SC-005**: Merging to `main` triggers a frontend deployment to Vercel within 5 minutes
- **SC-006**: The backend can be deployed to HF Spaces by any team member following the documented steps in under 15 minutes
- **SC-007**: A new developer can run the full local stack via `docker compose up` within 5 minutes of cloning the repo
- **SC-008**: Zero production credentials appear in any committed file across the repository
