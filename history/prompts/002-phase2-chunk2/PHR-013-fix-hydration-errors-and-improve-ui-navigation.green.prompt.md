---
id: 013
title: Fix hydration errors and improve UI navigation
stage: green
date: 2026-02-09
surface: agent
model: gemini-2.0-flash-thinking-exp
feature: 002-phase2-chunk2
branch: 002-phase2-chunk2
user: anusha-soh
command: /sp.phr
labels: ["hydration", "ui-polish", "navigation", "nextjs"]
links:
  spec: specs/002-phase2-chunk2/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - apps/web/src/app/layout.tsx
  - apps/web/src/components/tasks/TaskCard.tsx
  - apps/web/src/app/dashboard/page.tsx
  - apps/web/src/components/Navbar.tsx
tests:
  - none
---

## Prompt

i wanna see it manually run ports
[User also provided Next.js hydration error logs]
okay now what should i be able to do in it how. tell me ways to manually check it
the ui is not formated yet so its hard to test it. we can improvr along the line

## Response snapshot

Successfully started backend (8000) and frontend (3000) servers. Resolved React hydration mismatches caused by browser extensions and dynamic dates by adding suppressHydrationWarning and mounting checks. Improved UI by adding a global Navbar, linking the dashboard to tasks, and unifying layouts for better manual testing.

## Outcome

- ✅ Impact: Resolved critical hydration errors and improved navigation for manual testing.
- 🧪 Tests: Manual verification of ports and page rendering.
- 📁 Files: Modified layout.tsx, TaskCard.tsx, page.tsx; Created Navbar.tsx.
- 🔁 Next prompts: Proceed to Phase 2 Chunk 3 (Habits) or finalize deployment.
- 🧠 Reflection: Suppressing hydration warnings for root layout is a best practice when browser extensions are expected to modify the DOM.

## Evaluation notes (flywheel)

- Failure modes observed: Initial attempts to run servers in background failed due to session closure.
- Graders run and results (PASS/FAIL): PASS (UI rendered, navigation working).
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): Use Start-Process with -NoExit to keep dev servers alive in separate windows.
