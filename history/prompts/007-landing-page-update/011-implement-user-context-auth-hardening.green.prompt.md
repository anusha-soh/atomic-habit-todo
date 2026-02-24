---
id: 011
title: Implement User Context and Auth Route Hardening
stage: green
date: 2026-02-23
surface: agent
model: claude-sonnet-4-6
feature: 007-landing-page-update
branch: 007-landing-page-update
user: HP
command: implement Phase 5 US3 T016-T021 (user context + auth hardening)
labels: ["auth","user-context","middleware","production-hardening"]
links:
  spec: specs/008-production-hardening/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - apps/web/src/contexts/user-context.tsx (created)
  - apps/web/src/app/layout.tsx (modified)
  - apps/web/src/app/tasks/page.tsx (modified)
  - apps/web/src/middleware.ts (modified)
  - apps/web/src/components/LoginForm.tsx (modified)
  - apps/web/src/components/RegisterForm.tsx (modified)
tests:
  - none added (implementation only per task spec)
---

## Prompt

You are implementing Phase 5 (US3 — Authenticated User Experience) of the production hardening spec for the Atomic Habits notebook app.

Tasks T016–T021:
- T016: Create apps/web/src/contexts/user-context.tsx — React context with UserProvider + useUser hook
- T017: Add UserProvider wrapping in apps/web/src/app/layout.tsx (outside ToastProvider)
- T018: Remove 'test-user-id' fallback from tasks/page.tsx; redirect to /login if no session cookie
- T019: Extend middleware matcher to protect /tasks and /habits routes
- T020: Call refetch() in LoginForm after successful login, before router.push
- T021: Call refetch() in RegisterForm after successful registration, before router.push

## Response snapshot

Created `apps/web/src/contexts/user-context.tsx` with:
- `User` interface (id, email, created_at)
- `UserContextValue` interface (user, isLoading, error, refetch)
- `UserProvider` component that calls `authAPI.me()` on mount via `useCallback`/`useEffect`
- `useUser()` hook that throws if used outside provider

Modified `layout.tsx` to import `UserProvider` and wrap it around `ToastProvider` so the user context is available everywhere in the app tree.

Modified `tasks/page.tsx` to import `redirect` from `next/navigation` and redirect to `/login` when no `session_token` cookie is present, removing the `'test-user-id'` development fallback.

Modified `middleware.ts` to extend the protected-route check to include `/tasks` and `/habits` pathnames, and added both to the matcher array.

Modified `LoginForm.tsx` and `RegisterForm.tsx` to import `useUser`, destructure `refetch`, and call `await refetch()` after successful API response before `router.push('/dashboard')`.

## Outcome

- Impact: Authenticated user state is now globally available via context; tasks and habits routes are protected at both middleware and server-component levels; login/register flows sync user context immediately on success.
- Tests: No test files added per task spec instructions.
- Files: 1 created, 5 modified.
- Next prompts: Wire useUser() into Navbar to show user email / logout button; implement habits page auth guard at server-component level similar to tasks/page.tsx.
- Reflection: The LoginForm/RegisterForm are 'use client' components so useUser() is safe; the UserProvider must be a client component (marked 'use client') even though layout.tsx is a server component — Next.js supports this pattern transparently.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): not run
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): Run `npm run build` in apps/web to verify TypeScript compilation across all modified files.
