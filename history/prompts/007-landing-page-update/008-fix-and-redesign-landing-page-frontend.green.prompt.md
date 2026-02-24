---
id: 008
title: Fix and Redesign Landing Page Frontend
stage: green
date: 2026-02-21
surface: agent
model: claude-sonnet-4-6
feature: 007-landing-page-update
branch: 007-landing-page-update
user: HP
command: "first see all the problems with my frontend and then use frontend skill to create presentable front end. see specs of frontend to get the idea and then use frontend skill to correct it"
labels: ["frontend","redesign","landing-page","notebook-aesthetic","ux","fix"]
links:
  spec: specs/007-landing-page-update/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - apps/web/src/app/globals.css
  - apps/web/src/app/layout.tsx
  - apps/web/src/app/(marketing)/page.tsx
  - apps/web/src/components/ClientMain.tsx
  - apps/web/src/components/marketing/notebook-nav.tsx
  - apps/web/src/components/marketing/hero.tsx
  - apps/web/src/components/marketing/features.tsx
  - apps/web/src/components/marketing/feature-card.tsx
  - apps/web/src/components/marketing/testimonials.tsx
  - apps/web/src/components/marketing/final-cta.tsx
  - apps/web/src/components/ui/rough-border.tsx
tests:
  - "No new TypeScript errors in marketing/* or ui/rough-border.tsx (verified via tsc --noEmit)"
---

## Prompt

first see all the problems with my frontend and then use frontend skill to create presentable front end. see specs of frontend to get the idea and then use frontend skill to correct it

## Response snapshot

Analyzed all marketing component files and identified 9 problems. Used frontend-design skill to fix them:

**Problems found:**
1. Root layout `<main>` had `pb-20 md:pb-8` on marketing page (no mobile nav on marketing = dead space)
2. No `scroll-padding-top` — fixed 64px nav covered anchor jump targets
3. No mobile hamburger menu in NotebookNav
4. Generic placeholder metadata ("Atomic Habits - Phase 2", "Core Infrastructure")
5. Final CTA was a flat blue block (broke notebook aesthetic)
6. Hero was plain — no visual depth, doodles, or stats
7. roughjs async flash: CSS fallback looked like a default browser border
8. Feature cards had no tilt (didn't feel like pinned sticky notes)
9. Testimonial cards same issue as feature cards

**Fixes applied:**
- `globals.css`: Added `html { scroll-padding-top: 4.5rem }`
- New `ClientMain.tsx`: Client component that conditionally skips `pb-20` on `/`
- `layout.tsx`: Uses ClientMain instead of plain `<main>`, updated metadata
- `(marketing)/page.tsx`: Added proper OpenGraph metadata
- `notebook-nav.tsx`: Added animated hamburger menu with slide-down mobile panel
- `hero.tsx`: Pencil SVG doodle, wavy SVG underline, 2 floating sticky notes (lg), staggered fade-in animations, stats row (10k+ habits, 500+ streaks, 50k+ tasks)
- `features.tsx` + `feature-card.tsx`: Added `tilt` prop (-rotate-1, rotate-0, rotate-1), straightens on hover
- `testimonials.tsx`: Same tilt pattern; added eyebrow label
- `rough-border.tsx`: Organic fallback border-radius (3px 9px 4px 7px) + box-shadow
- `final-cta.tsx`: bg-notebook-paper-alt + ruled lines + dashed top border + badge + wavy underline; removed flat blue background

## Outcome

- ✅ Impact: Landing page now feels authentically notebook-themed with visual depth, mobile navigation, and proper metadata
- 🧪 Tests: tsc --noEmit — zero new errors in modified marketing files
- 📁 Files: 11 files modified/created
- 🔁 Next prompts: Add Playwright visual regression tests; implement logged-in user CTA redirect
- 🧠 Reflection: The frontend-design skill helped structure the redesign approach. The ClientMain pattern for conditional padding is a clean solution that avoids prop-drilling the route into the root layout.

## Evaluation notes (flywheel)

- Failure modes observed: roughjs async flash is mitigated but not eliminated — would require SSR-compatible sketchy borders to fully solve
- Graders run and results (PASS/FAIL): TypeScript type check — PASS (0 errors in modified files)
- Prompt variant (if applicable): null
- Next experiment: Add a CSS-only sketchy border fallback using clip-path or border-image for zero-flash rough border
