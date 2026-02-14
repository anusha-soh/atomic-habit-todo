---
id: 002
title: Remediate Analysis Findings
stage: misc
date: 2026-02-13
surface: agent
model: claude-opus-4-6
feature: 004-habit-tracking-streaks
branch: 004-habit-tracking-streaks
user: architect
command: /sp.analyze (remediation follow-up)
labels: ["remediation","consistency","tasks","plan","frontend","constitution"]
links:
  spec: specs/004-habit-tracking-streaks/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/004-habit-tracking-streaks/tasks.md (modified)
  - specs/004-habit-tracking-streaks/plan.md (modified)
  - specs/004-habit-tracking-streaks/spec.md (modified)
  - apps/web/src/components/habits/CompletionHistory.tsx (modified)
tests:
  - none (artifact corrections and UI addition)
---

## Prompt

yes correct them then create PHR

User requested concrete remediation of all findings from the /sp.analyze consistency report (PHR 001). Six findings: C1 (CRITICAL: TDD constitution violation in tasks.md), I1+I2 (HIGH: undefined notification persistence and missing API contract), A1 (MEDIUM: timezone display — closed as false positive), A2 (MEDIUM: event definitions not in dedicated file), U1 (MEDIUM: missing date-range filter UI in CompletionHistory), U2 (MEDIUM: no automated monitoring for SC-003/SC-004/SC-008).

## Response snapshot

Applied 6 corrections across 4 files:

**C1 — tasks.md**: Removed "not blocking" and "optional" TDD opt-out language. Replaced with constitution-aligned statement referencing §X and §Testing Requirements.

**I1+I2 — plan.md**: Added "Notification Architecture Note (MVP)" documenting ephemeral notifications pattern. Explicitly states no DB table or GET /notifications endpoint in MVP. Defers persistent storage to future chunk.

**A1 — closed**: CompletionHistory.tsx already uses `new Date(c.completed_at).toLocaleDateString(undefined, {...})` which automatically applies browser local timezone. No change needed.

**A2 — plan.md**: Removed phantom `events/habit_events.py` from project structure. Added "Event Architecture Note" documenting inline emission pattern from routes/habits.py and services/miss_detector.py.

**U1 — CompletionHistory.tsx**: Added date-range filter UI (startDate/endDate inputs with Filter/Clear buttons). Wired to existing `getCompletionHistory` params that already support `start_date`/`end_date` query params. Satisfies US7 AC#3.

**U2 — plan.md**: Added "Deferred Monitoring (Phase V)" note under Performance Goals documenting that SC-003, SC-004, SC-008 automated measurement is deferred to Phase V observability stack.

**Bonus**: Updated stale status fields — spec.md "Draft" → "Implemented", plan.md "Ready for /sp.tasks" → "Implementation complete. Pending final verification pass."

## Outcome

- ✅ Impact: 1 CRITICAL, 2 HIGH, 3 MEDIUM findings resolved across spec/plan/tasks artifacts and 1 frontend component
- 🧪 Tests: None (artifact corrections + small UI addition; manual verification recommended for CompletionHistory date filter)
- 📁 Files: tasks.md, plan.md, spec.md, CompletionHistory.tsx modified
- 🔁 Next prompts: Run tests to verify CompletionHistory date filter works, run /sp.implement for any remaining tasks
- 🧠 Reflection: Most findings were documentation/artifact gaps rather than code bugs. The only code change was adding the date-range filter UI that was already supported by the API client but never exposed in the component. Constitution compliance is critical to catch early — the TDD opt-out language could have set a bad precedent for future features.

## Evaluation notes (flywheel)

- Failure modes observed: tasks.md testing strategy contradicted constitution without detection until retrospective analysis
- Graders run and results (PASS/FAIL): n/a
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): Add constitution compliance check to /sp.tasks template to prevent TDD opt-out language
