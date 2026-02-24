---
id: 014
title: Fix Failing Unit Tests Across Web App
stage: green
date: 2026-02-23
surface: agent
model: claude-sonnet-4-6
feature: 007-landing-page-update
branch: 007-landing-page-update
user: HP
command: Fix all failing unit tests in the web app
labels: ["unit-tests","test-fixes","notebook-design-system","vitest"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - apps/web/tests/unit/LoginForm.test.tsx
  - apps/web/tests/unit/RegisterForm.test.tsx
  - apps/web/tests/unit/TaskForm.test.tsx
  - apps/web/src/components/marketing/notebook-nav.test.tsx
  - apps/web/__tests__/habits/CategoryFilter.test.tsx
  - apps/web/__tests__/habits/StatusFilter.test.tsx
  - apps/web/__tests__/habits/HabitCard.test.tsx
  - apps/web/tests/unit/EmptyState.test.tsx
  - apps/web/tests/unit/Pagination.test.tsx
tests:
  - apps/web/tests/unit/LoginForm.test.tsx
  - apps/web/tests/unit/RegisterForm.test.tsx
  - apps/web/tests/unit/TaskForm.test.tsx
  - apps/web/src/components/marketing/notebook-nav.test.tsx
  - apps/web/__tests__/habits/CategoryFilter.test.tsx
  - apps/web/__tests__/habits/StatusFilter.test.tsx
  - apps/web/__tests__/habits/HabitCard.test.tsx
  - apps/web/tests/unit/EmptyState.test.tsx
  - apps/web/tests/unit/Pagination.test.tsx
---

## Prompt

Fix all failing unit tests in the web app. Here is a summary of each failure and what needs to be fixed:

**Project root**: `C:\my-drive\spec-kit\hackathon_2_phases\phase-2-webapp`
**Web app dir**: `apps/web`

## Failures to fix:

### 1. LoginForm.test.tsx - `useUser must be used within UserProvider`
### 2. RegisterForm.test.tsx - Same `useUser` issue + missing confirmPassword fill
### 3. TaskForm.test.tsx - Missing `getTags` export on tasks-api mock
### 4. notebook-nav.test.tsx - Multiple elements with same text (desktop + mobile nav)
### 5. CategoryFilter.test.tsx - CSS class assertions use old Tailwind classes
### 6. StatusFilter.test.tsx - CSS class assertions use old classes
### 7. HabitCard.test.tsx - Category colors, status badge, hover styles, streak display
### 8. EmptyState.test.tsx - Wrong text content queries
### 9. Pagination.test.tsx - CSS class mismatch for active page

## Response snapshot

Fixed 9 failing test files by updating test assertions to match the current notebook design system implementation:

1. **LoginForm.test.tsx**: Added `vi.mock('@/contexts/user-context', ...)` to provide `useUser` mock.

2. **RegisterForm.test.tsx**: Added same `useUser` mock. Updated "should call register API" test to fill `confirmPassword` field with `'password123'` to pass the `password !== confirmPassword` validation guard.

3. **TaskForm.test.tsx**: Added `getTags: vi.fn().mockResolvedValue([])` to the `vi.mock('@/lib/tasks-api', ...)` call. TaskForm imports `getTags` and calls it in a `useEffect`.

4. **notebook-nav.test.tsx**: Changed `getByText('Features')` to `getAllByText('Features')[0]` and same for `'Get Started'`. Both appear in desktop AND mobile nav sections, causing `getByText` to throw "Found multiple elements".

5. **CategoryFilter.test.tsx**: Updated Visual State assertions:
   - Selected: `bg-blue-600 text-white` → `bg-notebook-ink-blue text-notebook-paper-white`
   - Unselected: `bg-white text-gray-600 border` → `bg-notebook-paper-white text-notebook-ink-medium border`
   - Hover: `toHaveClass('hover:border-blue-400')` → `toContain('hover:border-notebook-ink-blue')` (using `.className` to handle the `/40` opacity modifier)

6. **StatusFilter.test.tsx**: Updated all class assertions:
   - Selected: `bg-white text-gray-900 shadow-sm` → `bg-notebook-ink-blue text-notebook-paper-white shadow-sm`
   - Unselected: `text-gray-500` → `text-notebook-ink-medium`; `not.toHaveClass('bg-white')` → `not.toHaveClass('bg-notebook-ink-blue')`
   - Hover: `hover:text-gray-700` → `hover:text-notebook-ink`
   - Layout wrapper: `bg-gray-100 rounded-lg` → `bg-notebook-paper-alt rounded-lg`
   - Edge case rerender test: `bg-white` → `bg-notebook-ink-blue`

7. **HabitCard.test.tsx**:
   - Category colors: Changed `toHaveClass('bg-green-100', 'text-green-800')` etc. to `toContain('bg-notebook-ink-green')` etc. using `.className` string checks (handles Tailwind opacity modifiers like `/10`)
   - Archived badge: `bg-gray-100 text-gray-500` → `bg-notebook-paper-alt text-notebook-ink-light`
   - Hover styles: `hover:border-blue-300 hover:shadow-md` → `hover:shadow-notebook-hover hover:-translate-y-1`
   - Streak: In compact mode StreakCounter only shows `🔥` and a number; the "7 day streak" text is only in `aria-label`. Changed `getByText('7 day streak')` → `getByLabelText('7 day streak')`

8. **EmptyState.test.tsx**:
   - Default state: Component renders "Your task list is a blank page" not "no tasks yet". Changed to `getByRole('heading')` check.
   - Filter state: Both `h3` and `p` contain "No tasks match your filters" — changed to `getByRole('heading', { name: /no tasks match your filters/i })`.

9. **Pagination.test.tsx**: Active page class `bg-blue-50` → `bg-notebook-ink-blue`.

## Outcome

- Impact: All 9 failing test files have been updated to match current notebook design system implementation. No component logic was changed.
- Tests: 9 test files modified, no new tests added
- Files: 9 test files edited
- Next prompts: Run the full test suite to confirm all tests now pass
- Reflection: The notebook design system migration replaced standard Tailwind color utilities (bg-green-100, bg-blue-600, etc.) with notebook-prefixed custom tokens. Tests written against the old classes all needed to be updated. The key patterns were: using `.className.toContain()` for classes with opacity modifiers (e.g. `bg-notebook-ink-green/10`), `getByRole` over `getByText` for ambiguous text queries, and `getByLabelText` for aria-label accessible names.

## Evaluation notes (flywheel)

- Failure modes observed: Tests written against old Tailwind utility classes that were replaced by notebook design system custom tokens; missing mock exports causing import errors; duplicate DOM elements causing `getByText` to throw
- Graders run and results (PASS/FAIL): Not run (no bash commands per instructions)
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): Run `npx vitest run` to confirm all 9 test files now pass
