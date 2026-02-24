---
id: 002
title: Production Hardening Implementation Plan
stage: plan
date: 2026-02-21
surface: agent
model: claude-opus-4-6
feature: 008-production-hardening
branch: 007-landing-page-update
user: developer
command: /sp.plan
labels: ["production-hardening", "planning", "architecture", "fastapi", "nextjs"]
links:
  spec: specs/008-production-hardening/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/008-production-hardening/plan.md
  - specs/008-production-hardening/research.md
  - specs/008-production-hardening/data-model.md
  - specs/008-production-hardening/quickstart.md
  - specs/008-production-hardening/contracts/health-api.yaml
  - specs/008-production-hardening/contracts/complete-task-enhanced.yaml
tests:
  - null
---

## Prompt

continue (/sp.plan)

Context: Continuing /sp.plan execution for 008-production-hardening feature after research agent completed analysis of all affected files (tasks.py:406-408, main.py:113, event_emitter.py:76, api.ts:6, tasks-api.ts:15, habits-api.ts:19, tasks/page.tsx:29, middleware.ts:37).

## Response snapshot

Generated complete implementation plan for 008-production-hardening with 4 phases:

**Phase 1 - Critical Fixes** (4 items):
- 1.1 Habit sync error handling: tasks.py:406 bare except → logger.warning + synced=False in response
- 1.2 Real health endpoint: SELECT 1 query, returns 503 on DB failure
- 1.3 API base URL standardization: export API_BASE from api.ts, import in tasks-api.ts and habits-api.ts
- 1.4 Remove test-user-id: redirect('/login') when no session + extend middleware matcher to /tasks/:path* and /habits/:path*

**Phase 2 - Reliability & Security** (7 items):
- EventEmitter: logger.warning with failure counter
- Rate limiting: slowapi 10/min login, 5/5min register
- CORS: restrict allow_headers to specific list
- Enum validation: Pydantic enum types on update schemas
- UserProvider context: shared auth state
- Error boundaries: Next.js error.tsx per route segment
- Loading states: habits/loading.tsx, dashboard/loading.tsx

**Phase 3 - Feature Completeness** (6 items):
- Task search UI: search input → ?search= URL param → server component
- Tag autocomplete: getTags() on mount, filter client-side
- Filter debouncing: 300ms setTimeout in habits page
- Optimistic updates: TaskCard local state first, rollback on failure
- Password confirmation: RegisterForm.tsx field + validation
- Timezone fix: datetime.now(timezone.utc) in streak_calculator.py

**Phase 4 - QA** (3 items):
- Playwright setup: playwright.config.ts + install
- E2E tests: auth, tasks, habits, landing, error flows
- Accessibility audit: Lighthouse ≥ 90 on all pages

**Artifacts Created**: 6 files (plan.md, research.md, data-model.md, quickstart.md, 2 contracts)
**No DB migrations needed.**
**No breaking API changes.**

## Outcome

- Impact: Complete implementation blueprint ready for /sp.tasks task generation
- Tests: No tests created (plan phase)
- Files: 6 plan artifacts created across specs/008-production-hardening/
- Next prompts: /sp.tasks to generate actionable task list with TDD approach
- Reflection: Research agent confirmed all exact line numbers — plan is grounded in real code, not assumptions

## Evaluation notes (flywheel)

- Failure modes observed: setup-plan.ps1 detected wrong feature (007 not 008) — worked around by manually pointing to 008 spec
- Graders run and results (PASS/FAIL): Constitution check PASS (all 9 principles verified)
- Prompt variant (if applicable): N/A
- Next experiment: Run /sp.tasks to generate dependency-ordered task list
