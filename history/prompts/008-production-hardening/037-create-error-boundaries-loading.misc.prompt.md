---
id: 037
title: Create error boundaries and loading skeletons
stage: misc
date: 2026-02-23
surface: agent
model: claude-haiku-4-5-20251001
feature: 008-production-hardening
branch: 007-landing-page-update
user: user
command: Phase 8 implementation (US4 — Error Boundaries and Loading Skeletons)
labels: ["error-handling", "ui-components", "loading-states", "next.js"]
links:
  spec: specs/008-production-hardening/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - C:/my-drive/spec-kit/hackathon_2_phases/phase-2-webapp/apps/web/src/app/error.tsx
  - C:/my-drive/spec-kit/hackathon_2_phases/phase-2-webapp/apps/web/src/app/tasks/error.tsx
  - C:/my-drive/spec-kit/hackathon_2_phases/phase-2-webapp/apps/web/src/app/habits/error.tsx
  - C:/my-drive/spec-kit/hackathon_2_phases/phase-2-webapp/apps/web/src/app/dashboard/error.tsx
  - C:/my-drive/spec-kit/hackathon_2_phases/phase-2-webapp/apps/web/src/app/habits/loading.tsx
  - C:/my-drive/spec-kit/hackathon_2_phases/phase-2-webapp/apps/web/src/app/dashboard/loading.tsx
tests:
  - Manual verification of file structure and content
---

## Prompt

Create error.tsx and loading.tsx files for Phase 8 (US4 — Error Boundaries and Loading Skeletons) implementation with tasks T031–T036:

**T031**: Create `apps/web/src/app/error.tsx` (root error boundary)
**T032**: Create `apps/web/src/app/tasks/error.tsx` with fallback message "Couldn't load your tasks. Please try again."
**T033**: Create `apps/web/src/app/habits/error.tsx` with fallback message "Couldn't load your habits. Please try again."
**T034**: Create `apps/web/src/app/dashboard/error.tsx` with fallback message "Dashboard couldn't load. Please try again."
**T035**: Create `apps/web/src/app/habits/loading.tsx` with 3-column grid skeleton
**T036**: Create `apps/web/src/app/dashboard/loading.tsx` with grid skeleton

All files must use the "Cozy Handwritten Notebook" design system with appropriate Tailwind CSS classes, fonts (font-caveat, font-patrick-hand, font-inter), and colors (notebook-paper, notebook-ink, etc.). Error components must be 'use client' components with reset button functionality.

## Response snapshot

Successfully created all 6 files with proper Next.js App Router conventions:

1. **apps/web/src/app/error.tsx** - Root error boundary with generic error message
2. **apps/web/src/app/tasks/error.tsx** - Tasks-specific error with fallback message
3. **apps/web/src/app/habits/error.tsx** - Habits-specific error with fallback message
4. **apps/web/src/app/dashboard/error.tsx** - Dashboard-specific error with fallback message
5. **apps/web/src/app/habits/loading.tsx** - Habits loading skeleton with 3-column responsive grid
6. **apps/web/src/app/dashboard/loading.tsx** - Dashboard loading skeleton with responsive grid

All error components:
- Are marked as 'use client' for interactivity
- Display error.message as primary message, with route-specific fallback
- Include centered card layout with notebook design styling
- Feature "Try again" reset button with hover effects
- Use consistent Tailwind utility classes for spacing and borders

All loading components:
- Use animate-pulse for skeleton animation
- Implement responsive grids (sm:, md:, lg: breakpoints)
- Use placeholder divs with notebook-paper-alt background color
- Maintain consistent spacing and card layouts

## Outcome

- ✅ Impact: Complete error boundary and loading state coverage for critical routes (tasks, habits, dashboard) plus root fallback
- 🧪 Tests: Manual verification confirmed all 6 files created with correct content
- 📁 Files: 6 new files created (error.tsx and loading.tsx components)
- 🔁 Next prompts: Test error boundary triggering and loading state visibility during data fetching
- 🧠 Reflection: Implementation follows Next.js App Router patterns; all components use design system tokens correctly

## Evaluation notes (flywheel)

- Failure modes observed: None; file creation successful with verified content structure
- Graders run and results (PASS/FAIL): Manual verification PASS - all files present and contain expected code
- Prompt variant (if applicable): null
- Next experiment: E2E testing with Playwright to verify error boundary behavior and loading skeleton animation
