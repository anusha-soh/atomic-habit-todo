---
name: atomic-habit-todo-architect
description: Architectural guardrails and patterns for the Atomic Habit Todo project. Use when adding new features (like Habits in Phase 2 Chunk 3) to ensure consistency in UUID schemas, user isolation, API design, and frontend hydration safety.
---

# Atomic Habit Todo Architect

This skill provides the authoritative architectural patterns for the Atomic Habit Todo project. It ensures that any new agent or session maintains the specific technical decisions made during Phases 1 and 2.

## Core Mandates

1.  **Strict Isolation:** NEVER fetch or modify data without filtering by the logged-in `user_id`.
2.  **Schema Consistency:** All entities MUST use UUID primary keys and standard UTC timestamps.
3.  **Unified API:** Use the centralized `@/lib/api` client for all frontend data fetching.
4.  **Mobile-First UX:** Adhere to touch-target standards and mobile-optimized layouts (e.g., Bottom Sheets).

## Reference Guides

To maintain consistency, consult these specific guides before implementation:

- **[Backend Patterns](references/backend-patterns.md)**: SQLModel schemas, User ID isolation, and route conventions.
- **[Frontend Patterns](references/frontend-patterns.md)**: Next.js App Router, Hydration safety, and Tailwind standards.
- **[Testing Patterns](references/testing-patterns.md)**: Pytest fixtures for remote DB and Vitest coverage requirements.

## Boilerplate Templates

When starting a new feature, use these as starting points:

- **Data Model**: Copy the structure from `apps/api/src/models/task.py`.
- **API Client**: Add new endpoints to `apps/web/src/lib/api.ts` following the `tasksAPI` pattern.
- **Layouts**: Wrap pages in the existing `RootLayout` and use the `Navbar` component.

## Workflow for New Features (e.g., Habits)

1.  **Analyze Schema**: Check `backend-patterns.md` to define the `Habit` model with UUIDs.
2.  **Verify Isolation**: Ensure every route in `apps/api/src/routes/habits.py` depends on `get_current_user_id`.
3.  **Sync Frontend**: Update `lib/api.ts` before building UI components.
4.  **Handle Hydration**: Ensure all date-based habit UI uses the `mounted` check to prevent mismatches.
5.  **Test Security**: Add cross-user access tests as the first integration tests.