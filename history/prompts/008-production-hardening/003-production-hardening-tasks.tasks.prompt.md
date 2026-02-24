---
id: 003
title: Production Hardening Tasks TDD Generation
stage: tasks
date: 2026-02-23
surface: agent
model: claude-sonnet-4-6
feature: 008-production-hardening
branch: 007-landing-page-update
user: HP
command: /sp.tasks
labels: ["tasks","tdd","red-green-refactor","production-hardening","constitution"]
links:
  spec: specs/008-production-hardening/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/008-production-hardening/tasks.md
tests:
  - null
---

## Prompt

/sp.tasks

(Followed by explicit user confirmation to apply full TDD ordering — constitution Principle X mandates "Tests Before Implementation: TDD enforced (write tests → red → green → refactor)". Tasks regenerated with 🔴 Red / 🟢 Green structure per user story.)

## Response snapshot

Regenerated `specs/008-production-hardening/tasks.md` with full TDD ordering: 68 tasks across 14 phases, organized by all 10 user stories from spec.md.

**Structure per user story phase**:
1. 🔴 Red Phase — numbered test tasks written FIRST; explicit checkpoint "verify FAIL before continuing"
2. 🟢 Green Phase — implementation tasks to make tests pass

**Key test tasks added (previously missing or out of order)**:
- T004: api-base URL construction tests (written before API_BASE constant exists)
- T008: test_complete_task_habit_sync_failure (written before except-block fix)
- T010–T011: auth-api and habits-api URL assertion tests
- T014–T015: middleware redirect test + UserContext render test
- T022–T023: health endpoint DB failure tests (written before SELECT 1 probe)
- T025: login rate limit test (written before slowapi installed)
- T029–T030: error.tsx and loading.tsx render tests
- T037–T038: SearchInput and tag autocomplete tests
- T042–T044: enum validation 422 response tests
- T047–T048: debounce count test + optimistic update timing test
- T052–T053: EventEmitter logging.warning/error assertion tests
- T055–T056: password mismatch UI test + UTC timezone test

**Totals**: 31 test tasks (🔴) + 39 implementation tasks (🟢) + 17 parallel opportunities

## Outcome

- ✅ Impact: tasks.md now fully TDD-compliant per constitution Principle X; each user story has explicit red-phase tests that must fail before implementation begins
- 🧪 Tests: 31 failing-first test tasks distributed across all 10 user stories
- 📁 Files: specs/008-production-hardening/tasks.md (updated)
- 🔁 Next prompts: `/sp.implement` to execute tasks in TDD order, or `/sp.preflight` to validate first
- 🧠 Reflection: Original tasks.md omitted TDD ordering despite constitution mandate — corrected after user prompt. Constitution check in plan.md listed Principle X as PASS but tasks generation template treats tests as "optional"; the template's optional stance is overridden by the constitution for this project.

## Evaluation notes (flywheel)

- Failure modes observed: First generation missed TDD ordering despite constitution mandate (template says tests optional; constitution says TDD required — constitution wins)
- Graders run and results (PASS/FAIL): Not run
- Prompt variant (if applicable): null
- Next experiment: Add explicit "TDD enforced per constitution" reminder at top of tasks-template.md to prevent recurrence
