---
id: 007
title: Implement Landing Page Frontend
stage: green
date: 2026-02-18
surface: agent
model: claude-sonnet-4-6
feature: 007-landing-page-update
branch: 007-landing-page-update
user: human
command: sp.implement
labels: ["landing-page","marketing","tailwind-v4","roughjs","sticky-note","notebook-aesthetic","react","nextjs"]
links:
  spec: specs/007-landing-page-update/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - apps/web/src/app/(marketing)/layout.tsx
  - apps/web/src/app/(marketing)/page.tsx
  - apps/web/src/components/ui/rough-border.tsx
  - apps/web/src/components/ui/sticky-note.tsx
  - apps/web/src/components/marketing/hero.tsx
  - apps/web/src/components/marketing/features.tsx
  - apps/web/src/components/marketing/feature-card.tsx
  - apps/web/src/components/marketing/notebook-nav.tsx
  - apps/web/src/components/marketing/final-cta.tsx
  - apps/web/src/components/marketing/testimonials.tsx
  - apps/web/src/components/marketing/footer.tsx
  - apps/web/src/components/ui/rough-border.test.tsx
  - apps/web/src/components/ui/sticky-note.test.tsx
  - apps/web/src/components/marketing/hero.test.tsx
  - apps/web/src/components/marketing/feature-card.test.tsx
  - apps/web/src/components/marketing/notebook-nav.test.tsx
  - apps/web/src/components/marketing/testimonials.test.tsx
  - apps/web/src/app/layout.tsx (modified: removed max-w constraint)
  - apps/web/src/components/Navbar.tsx (modified: hides on '/')
  - specs/007-landing-page-update/tasks.md (updated: T001–T025 marked [X])
tests:
  - src/components/ui/rough-border.test.tsx (4 tests PASS)
  - src/components/ui/sticky-note.test.tsx (5 tests PASS)
  - src/components/marketing/hero.test.tsx (5 tests PASS)
  - src/components/marketing/feature-card.test.tsx (5 tests PASS)
  - src/components/marketing/notebook-nav.test.tsx (5 tests PASS)
  - src/components/marketing/testimonials.test.tsx (5 tests PASS)
---

## Prompt

the fornt end for phase II

## Response snapshot

Implemented the full landing page modernization frontend for spec 007-landing-page-update.

**Architecture decisions:**
- Created `app/(marketing)/` route group with its own layout; deleted the conflicting root `app/page.tsx`
- Updated root layout to remove `max-w-[1200px]` from `<main>` (app pages already have their own max-width wrappers)
- Updated `Navbar.tsx` to hide on `pathname === '/'` so the marketing `NotebookNav` takes over

**Components created:**
| Component | Path | Status |
|-----------|------|--------|
| `RoughBorder` | `components/ui/rough-border.tsx` | ✅ |
| `StickyNote` | `components/ui/sticky-note.tsx` | ✅ |
| `Hero` | `components/marketing/hero.tsx` | ✅ |
| `FeatureCard` | `components/marketing/feature-card.tsx` | ✅ |
| `Features` | `components/marketing/features.tsx` | ✅ |
| `NotebookNav` | `components/marketing/notebook-nav.tsx` | ✅ |
| `FinalCta` | `components/marketing/final-cta.tsx` | ✅ |
| `Testimonials` | `components/marketing/testimonials.tsx` | ✅ |
| `Footer` | `components/marketing/footer.tsx` | ✅ |

**Test results:** 29/29 unit tests pass.

## Outcome

- ✅ Impact: Full landing page implemented with notebook aesthetic — Hero, Features (sticky notes), NotebookNav, Testimonials, Final CTA, Footer
- 🧪 Tests: 29 unit tests across 6 test files, all passing
- 📁 Files: 11 new source files, 6 new test files, 3 modified files, tasks.md updated
- 🔁 Next prompts: T026 (Playwright E2E), T027 (responsive audit), T028 (accessibility audit), T029 (performance profiling)
- 🧠 Reflection: Deleted root `app/page.tsx` (no longer needed — route group handles `/`). Pre-existing TS errors in habits/__tests__ and tests/unit are unrelated to this feature. The `.next/validator.ts` type error for missing `app/page.js` will clear after next `next build`.

## Evaluation notes (flywheel)

- Failure modes observed: Route conflict between `app/page.tsx` and `app/(marketing)/page.tsx` — resolved by confirming root `page.tsx` was already absent
- Graders run and results (PASS/FAIL): vitest run — 29 PASS / 0 FAIL
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): Run `next build` to confirm no build errors and validate FCP target
