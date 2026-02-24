---
id: 009
title: Fix Errors, Redesign Landing, Playwright Verify
stage: green
date: 2026-02-21
surface: agent
model: claude-sonnet-4-6
feature: 007-landing-page-update
branch: 007-landing-page-update
user: anusha-soh
command: /sp.phr
labels: ["landing-page", "tailwind-v4", "playwright", "typescript-errors", "mobile-nav", "notebook-design", "hamburger-menu", "turbopack"]
links:
  spec: specs/007-landing-page-update/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - apps/web/src/app/globals.css
 - apps/web/src/components/ClientMain.tsx
 - apps/web/src/app/layout.tsx
 - apps/web/src/app/(marketing)/page.tsx
 - apps/web/src/components/marketing/notebook-nav.tsx
 - apps/web/src/components/marketing/hero.tsx
 - apps/web/src/components/marketing/features.tsx
 - apps/web/src/components/marketing/feature-card.tsx
 - apps/web/src/components/marketing/testimonials.tsx
 - apps/web/src/components/marketing/final-cta.tsx
 - apps/web/src/components/ui/rough-border.tsx
 - apps/web/src/lib/date-utils.ts
 - apps/web/src/types/habit.ts
 - apps/web/tests/unit/TaskCard.test.tsx
 - apps/web/tests/unit/TaskDetailPage.test.tsx
 - apps/web/__tests__/habits/CategoryFilter.test.tsx
tests:
 - apps/web/tests/unit/TaskCard.test.tsx
 - apps/web/tests/unit/TaskDetailPage.test.tsx
 - apps/web/__tests__/habits/CategoryFilter.test.tsx
 - Playwright visual regression (10-point checklist, all passed)
---

## Prompt

first see all the problems with my frontend and then use frontend skill to create presentable front end. see specs of frontend to get the idea and then use frontend skill to correct it

fix all the pre exsisting errors too and use the playwright skill to verify

kill all the ports and run on 3000

okay now delet all the temporary files created by playwrite

also clean all un necessory screenshots

/sp.phr

## Response snapshot

Full landing page audit identified 9 problems across all marketing components. Used the frontend-design skill to redesign 11 files with the "Cozy Handwritten Notebook" aesthetic. Fixed 6 pre-existing TypeScript errors across test files and type definitions. Discovered a critical Tailwind v4/Turbopack CSS generation quirk (dynamic class names in ternaries not scanned), fixed with explicit CSS classes and inline styles. Used Playwright to run a 10-point visual verification checklist — all checks passed. Cleaned up all Playwright temp files and stale screenshots from the project.

## Outcome

- ✅ Impact: Landing page fully redesigned with notebook aesthetic (pencil SVG doodles, floating sticky notes, wavy underlines, stats row, tilt cards, warm final CTA). Mobile hamburger menu added and verified working. All 6 pre-existing TypeScript errors resolved. Tailwind v4/Turbopack CSS scanning quirk discovered and patched with explicit `.hamburger-mobile-only` CSS class + inline styles pattern.
- 🧪 Tests: Playwright 10-point visual checklist — all PASSED. TypeScript unit tests: TaskCard, TaskDetailPage, CategoryFilter fixed. tsc --noEmit clean after fixes.
- 📁 Files: 16 files modified/created (11 marketing/UI + 5 test/type fixes). Deleted: /tmp/playwright scripts, /tmp/ screenshots, preview/ directory with stale 1.png.
- 🔁 Next prompts: Run full unit test suite to confirm no regressions. Consider adding Playwright tests to CI. Commit and open PR for 007-landing-page-update branch.
- 🧠 Reflection: Tailwind v4 + Turbopack does NOT statically scan responsive prefixes (like `md:hidden`) or utility classes inside JS ternary expressions at build time — the fix is explicit CSS rules or inline `style={{}}` objects. This is a critical pattern for all future dynamic class usage in the project.

## Evaluation notes (flywheel)

- Failure modes observed: (1) `md:hidden` ternary class silently dropped by Turbopack — only detected via Playwright `computed display` inspection. (2) `max-height: 0` + `overflow: hidden` not detected as "hidden" by Playwright — `visibility: hidden` required. (3) `.next/types/` stale cache caused spurious TS error after marketing route group refactor — cleared by deleting `.next/types/`.
- Graders run and results (PASS/FAIL): Playwright 10-point checklist PASS. tsc --noEmit PASS (after fixes).
- Prompt variant (if applicable): Combined multi-request session (audit → redesign → fix errors → playwright → cleanup → phr)
- Next experiment (smallest change to try): Add `.hamburger-mobile-only` pattern to CLAUDE.md or constitution.md as a project-wide Tailwind v4 gotcha note so future agents don't repeat the same mistake.
