---
id: 038
title: Performance Optimizations and Password Confirm
stage: green
date: 2026-02-23
surface: agent
model: claude-sonnet-4-6
feature: 008-production-hardening
branch: 007-landing-page-update
user: HP
command: implement T049 T050 T051 T057
labels: ["performance","optimistic-updates","debounce","cache","auth","register-form"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - apps/web/src/app/habits/page.tsx
  - apps/web/src/components/tasks/TaskCard.tsx
  - apps/web/src/components/habits/HabitForm.tsx
  - apps/web/src/components/RegisterForm.tsx
tests:
  - "none — test creation explicitly excluded per task instructions"
---

## Prompt

You are implementing Phase 11 (US9 — Performance) and Phase 13 frontend (password confirm) for the Atomic Habits notebook app.

T049: Add 300ms debounce to filter changes in apps/web/src/app/habits/page.tsx
T050: Implement optimistic updates in apps/web/src/components/tasks/TaskCard.tsx
T051: Cache habit anchor list in apps/web/src/components/habits/HabitForm.tsx
T057: Add confirmPassword to RegisterForm in apps/web/src/components/RegisterForm.tsx

## Response snapshot

Implemented all four tasks:

**T049 (habits/page.tsx):** Added `useRef` to imports. Introduced `debounceRef = useRef<ReturnType<typeof setTimeout>>()`. Replaced the immediate `fetchHabits()` call inside the filter `useEffect` with a `setTimeout(..., 300)` wrapper, clearing on re-run and returning a cleanup that clears on unmount.

**T050 (TaskCard.tsx):** Added `optimisticCompleted` state initialised from `task.completed` and `optimisticDeleted` state (false). `handleMarkComplete` now sets `optimisticCompleted(true)` and shows the flash before the API call; rolls back on error. `handleDelete` sets `optimisticDeleted(true)` before the API call; rolls back on error. Added `if (optimisticDeleted) return null;` early return. All JSX references to `task.completed` (class strings + Complete button guard) replaced with `optimisticCompleted`.

**T051 (HabitForm.tsx):** Added `useRef` to imports. Introduced `habitsLoadedRef = useRef(false)`. The anchor habits `useEffect` now bails early (`return`) if `habitsLoadedRef.current` is true. Sets the flag to `true` after a successful fetch.

**T057 (RegisterForm.tsx):** Added `confirmPassword` and `confirmPasswordError` state. Added `validateConfirmPassword()` helper. `validatePassword()` now also re-validates `confirmPassword` on every password change. Submit handler validates `password !== confirmPassword` before calling the API. Added the Confirm Password `<Input>` field (after the password field, matching its styling and ARIA pattern). Submit button disabled also on `!!confirmPasswordError`.

## Outcome

- Impact: Filter changes in the habits page now debounce at 300ms, reducing unnecessary API calls during rapid filter toggling. TaskCard actions (complete/delete) give instant visual feedback with rollback on failure. HabitForm no longer re-fetches the anchor list on every re-render. RegisterForm prevents mismatched passwords at both real-time and submission validation layers.
- Tests: none (explicitly excluded per task instructions)
- Files: 4 files modified, 0 created
- Next prompts: run existing test suite to confirm no regressions; implement remaining T05x tasks; E2E test for register flow
- Reflection: The Tailwind v4 scanning quirk was respected — all dynamic class switching uses the same existing ternary pattern (variables swap, not new class names). The `if (optimisticDeleted) return null` pattern is the cleanest approach for instant card removal without CSS display toggling.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): none run
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): verify debounce eliminates redundant network requests in browser devtools network tab
