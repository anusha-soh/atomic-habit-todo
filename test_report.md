# Test Execution Report

**Date:** Wednesday, February 11, 2026
**Environment:** win32
**Project:** Atomic Habits Todo Application (Phase 2)

## Executive Summary

| Suite | Status | Passed | Failed | Warnings |
|-------|--------|--------|--------|----------|
| **Backend (API)** | ✅ PASS | 139 | 0 | 23 |
| **Frontend (Web)** | ❌ FAIL | 138 | 17 | - |
| **Total** | **FAIL** | **277** | **17** | **23** |

---

## Backend (API) Details

- **Framework:** Pytest
- **Location:** `apps/api/`
- **Result:** 139 passed, 0 failed, 23 warnings.
- **Notes:** 
  - Tests utilize SQLite for database persistence during testing (`DATABASE_URL=sqlite:///./test.db`).
  - Warnings are primarily related to Pydantic deprecations (moving to `ConfigDict`) and `pytest-asyncio` configuration.
  - Execution time: ~606 seconds.

### Warning Summary
- `PydanticDeprecatedSince20`: Support for class-based `config` is deprecated.
- `DeprecationWarning`: `datetime.datetime.utcnow()` is deprecated.
- `PytestDeprecationWarning`: `asyncio_default_fixture_loop_scope` is unset.

---

## Frontend (Web) Details

- **Framework:** Vitest
- **Location:** `apps/web/`
- **Result:** 138 passed, 17 failed.
- **Total Tests:** 155.

### Failure Breakdown

#### 1. Suite Execution Failure
- **File:** `__tests__/habits/CategoryFilter.test.tsx`
- **Error:** `Failed to resolve import "@testing-library/user Event"`. 
- **Cause:** Typo in import statement (space in "user Event").

#### 2. Component Mismatches (`HabitForm.test.tsx`)
- **Button Name Mismatch:** Tests look for button with name "Create Habit", but the component renders "Build Habit".
- **Role Mismatch:** Tests expect "checkbox" roles for day selection, but the component uses "button" elements.
- **Label Mismatch:** Tests look for label "Anchor Habit", but the component uses "Habit Stacking (Law 1: Make It Obvious)".
- **Missing Elements:** Tests look for "Stacking Cue" label which seems missing or differently named in the component.

#### 3. Page Level Mismatches (`habits-page.test.tsx`)
- **Text Mismatch:** Test expects "No habits yet", component renders "No habits found".
- **Duplicate Test IDs:** `link-/habits/new` data-testid found multiple times on the page, causing `getByTestId` to fail.
- **Loading State:** Multiple "generic" roles found during loading state checks.
- **Skeleton Animation:** `animate-pulse` elements not found as expected.

#### 4. Accessibility Failures (`StatusFilter.test.tsx`)
- **Attribute Missing:** Expected `type="button"` on status buttons but it was null.

---

## Conclusion & Recommendations

The backend infrastructure is robust with all tests passing. The frontend has significant test-to-code drift, likely due to recent UI refinements where component text and roles were updated but the corresponding tests were not synchronized.

**Recommendations:**
1. Fix the import typo in `CategoryFilter.test.tsx`.
2. Update frontend tests to match the current UI text ("Build Habit", "No habits found", etc.).
3. Update `HabitForm` tests to expect buttons instead of checkboxes for day selection, or update the component to use accessible checkboxes.
4. Resolve duplicate test IDs on the Habits page.
5. Add `type="button"` to status filter buttons to improve accessibility and pass existing tests.
