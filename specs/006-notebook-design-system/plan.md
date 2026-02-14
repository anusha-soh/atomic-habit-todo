# Implementation Plan: Cozy Handwritten Notebook Design System

**Feature Branch**: `006-notebook-design-system`
**Created**: 2026-02-14
**Spec**: [spec.md](./spec.md)
**Status**: Draft

---

## 1. Scope & Dependencies

### In Scope

- Design token system (CSS custom properties + Tailwind extension)
- Font loading (Caveat, Patrick Hand, Inter) via `next/font/google`
- Restyle all existing components to notebook aesthetic
- Sketchy SVG borders via `roughjs` library
- Completion animations (checkmark draw, card highlight)
- Staggered page load animations
- Notebook-style forms (underline inputs, handwritten labels)
- Empty/loading/error states with notebook personality
- Toast notifications as sticky notes
- Streak milestone inline text (FR-029)
- Accessibility (WCAG AA, reduced-motion, focus indicators, keyboard nav)
- Responsive layout (320px–1920px)

### Out of Scope

- No backend changes or new API endpoints
- No dark mode
- No custom illustrations (simple SVG doodles only)
- No confetti/firework animations
- No 3D effects or heavy animations

### External Dependencies

| Dependency | Purpose | Size Impact |
|---|---|---|
| `roughjs` | Sketchy SVG border generation | ~8-12kb gzipped |
| `next/font/google` (Caveat) | Handwritten heading font | Self-hosted at build, ~15kb |
| `next/font/google` (Patrick Hand) | Handwritten label/button font | Self-hosted at build, ~12kb |
| `next/font/google` (Inter) | Clean sans-serif body font | Self-hosted at build, ~20kb |

No new backend or infrastructure dependencies.

---

## 2. Key Decisions & Rationale

### D1: Design Token Strategy — CSS Custom Properties + Tailwind Extension

**Options Considered**:
1. CSS custom properties only (manual usage)
2. Tailwind theme extension only
3. CSS custom properties as source of truth, exposed through Tailwind (hybrid)

**Decision**: Option 3 — Hybrid approach

**Rationale**: CSS custom properties in `globals.css` serve as the single source of truth for the design system. Tailwind config references these variables, allowing both `var(--notebook-paper)` in custom CSS and `bg-notebook-paper` in JSX. This keeps tokens centralized while preserving Tailwind's utility-first ergonomics.

### D2: Font Loading — `next/font/google` Self-Hosting

**Decision**: Use Next.js built-in `next/font/google` for all three fonts.

**Rationale**: Self-hosts fonts at build time (no Google CDN runtime dependency), automatic `font-display: swap` for fallback, prevents layout shift via CSS size-adjust, and is the Next.js recommended approach. Fonts are declared in `layout.tsx` and exposed as CSS variables.

### D3: Sketchy Borders — `roughjs` Library

**Options Considered**:
1. CSS-only (border-radius tricks, box-shadow hacks)
2. Static SVG paths (hand-drawn once, reused)
3. `roughjs` dynamic generation
4. `rough-notation` (annotation-style only)

**Decision**: Option 3 — `roughjs` for border generation

**Rationale**: `roughjs` generates naturally varied SVG paths that look authentically hand-drawn. Each render produces slightly different paths, adding organic feel. The library is well-maintained, ~8-12kb gzipped, and supports canvas and SVG output. We'll create a React wrapper component (`SketchyBorder`) that generates SVG borders on mount and caches them to avoid re-renders.

### D4: Component Restyling Strategy — In-Place Modification

**Decision**: Restyle existing components rather than creating parallel "notebook" versions.

**Rationale**: Avoids component duplication and ensures the notebook aesthetic is the only visual style. Components already have correct props, state management, and accessibility attributes — we only need to change their visual presentation. The existing CVA (class-variance-authority) pattern in Button makes variant updates straightforward.

### D5: Animation Approach — CSS Animations + `prefers-reduced-motion`

**Decision**: Use CSS `@keyframes` and Tailwind `animate-*` utilities. Wrap all animations in `@media (prefers-reduced-motion: no-preference)`.

**Rationale**: CSS animations are performant (GPU-composited for transform/opacity), don't require additional JS libraries, and are trivially disabled via media query. The checkmark stroke animation uses SVG `stroke-dasharray` + `stroke-dashoffset` technique.

---

## 3. Architecture & Layer Structure

### Layer 1: Design Tokens (Foundation)
```
globals.css → CSS custom properties (colors, shadows, fonts, spacing)
tailwind.config.ts → References CSS vars, adds notebook-* utilities
layout.tsx → Font declarations via next/font/google
```

### Layer 2: Utility Components (Building Blocks)
```
components/ui/sketchy-border.tsx → roughjs SVG border wrapper
components/ui/notebook-skeleton.tsx → Cream-colored skeleton loader
components/ui/notebook-empty-state.tsx → Encouraging empty state with doodles
components/ui/notebook-toast.tsx → Sticky-note toast notifications
```

### Layer 3: Base Component Restyling (Existing Components)
```
components/ui/button.tsx → Notebook button variants (ink fill, sketchy border)
components/ui/input.tsx → Underline-only inputs, handwritten labels
components/ui/label.tsx → Handwritten font styling
components/Navbar.tsx → Notebook tabs, ink underlines, handwritten labels
```

### Layer 4: Domain Component Restyling
```
components/tasks/TaskCard.tsx → Sticky note style
components/habits/HabitCard.tsx → Index card with ruled lines
components/tasks/TaskForm.tsx → Notebook page form
components/habits/HabitForm.tsx → Notebook page form
components/tasks/EmptyState.tsx → Friendly notebook empty state
components/habits/StreakCounter.tsx → Milestone text (FR-029)
```

### Layer 5: Page-Level Polish
```
All page.tsx files → Consistent cream backgrounds, max-w-1200px, staggered animations
Login/Register pages → Notebook aesthetic
```

---

## 4. Implementation Phases

### Phase 1: Foundation — Design Tokens & Fonts (FR-001 to FR-005)

**Goal**: Establish the visual foundation so all subsequent work builds on real tokens.

**Files Modified**:
- `apps/web/package.json` — Add `roughjs` dependency
- `apps/web/src/app/globals.css` — Define all CSS custom properties
- `apps/web/tailwind.config.ts` — Extend with notebook theme
- `apps/web/src/app/layout.tsx` — Load fonts, apply CSS variables, change body bg

**Design Tokens to Define**:
```css
/* Paper Colors */
--notebook-paper: #FDF6E3;         /* Warm cream */
--notebook-paper-alt: #FAF0D7;     /* Slightly warmer for cards */
--notebook-paper-white: #FFFEF9;   /* Near-white paper */
--notebook-line: #E8DCC8;          /* Ruled line color */
--notebook-shadow: rgba(139, 119, 90, 0.15); /* Warm shadow */

/* Ink Colors */
--notebook-ink: #2C2416;           /* Dark ink (primary text) */
--notebook-ink-medium: #5C4F3A;    /* Medium ink (secondary text) */
--notebook-ink-light: #8B775A;     /* Light ink (tertiary/placeholder) */
--notebook-ink-red: #C23B22;       /* Red ink (errors, high priority) */
--notebook-ink-blue: #2B5EA7;      /* Blue ink (links, focus, primary) */
--notebook-ink-green: #3D7A4A;     /* Green ink (success, completion) */

/* Highlight Colors */
--notebook-highlight-yellow: #FFF3BF; /* Yellow highlight */
--notebook-highlight-pink: #FFE0E6;   /* Pink highlight */
--notebook-highlight-mint: #D4EDDA;   /* Mint highlight (completion) */

/* Shadows */
--notebook-shadow-sm: 0 1px 3px var(--notebook-shadow);
--notebook-shadow-md: 0 4px 8px var(--notebook-shadow);
--notebook-shadow-lg: 0 8px 16px var(--notebook-shadow);
--notebook-shadow-hover: 0 8px 20px rgba(139, 119, 90, 0.25);
```

**Font Setup in `layout.tsx`**:
```tsx
import { Caveat, Patrick_Hand, Inter } from 'next/font/google'

const caveat = Caveat({ subsets: ['latin'], variable: '--font-caveat' })
const patrickHand = Patrick_Hand({ weight: '400', subsets: ['latin'], variable: '--font-patrick-hand' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
```

**Acceptance**: All CSS variables resolve correctly. Fonts load without layout shift. Body background is cream. Tailwind utilities (`bg-notebook-paper`, `font-caveat`, etc.) work in JSX.

---

### Phase 2: Sketchy Border Utility (FR-028)

**Goal**: Create a reusable React component that wraps elements with roughjs-generated SVG borders.

**Files Created**:
- `apps/web/src/components/ui/sketchy-border.tsx`

**Design**:
```tsx
interface SketchyBorderProps {
  children: React.ReactNode
  className?: string
  roughness?: number    // 0.5-2.0, default 1.0
  stroke?: string       // Border color, default --notebook-ink-light
  strokeWidth?: number  // Default 1.5
  fill?: string         // Optional fill color
  seed?: number         // For consistent rendering (prevents re-draw on re-render)
}
```

The component uses a `ResizeObserver` to track dimensions, renders a `<svg>` overlay with roughjs rectangle path, and uses `pointer-events: none` so the SVG doesn't intercept clicks. The `seed` prop ensures borders don't redraw on every re-render (important for list stability).

**Fallback**: If roughjs fails to load, renders standard CSS `border-radius: 4px` border.

**Acceptance**: Component renders sketchy borders at correct dimensions. Resizes correctly. Doesn't intercept pointer events. Falls back gracefully.

---

### Phase 3: Base UI Components (FR-008 to FR-012)

**Goal**: Restyle Button, Input, Label to notebook aesthetic.

**Files Modified**:
- `apps/web/src/components/ui/button.tsx` — Notebook variants
- `apps/web/src/components/ui/input.tsx` — Underline-only border
- `apps/web/src/components/ui/label.tsx` — Handwritten font

**Button Changes**:
- Base: `font-patrick-hand text-base` (handwritten font)
- Default variant: `bg-notebook-ink-blue text-notebook-paper-white` (blue ink fill)
- Outline variant: border with sketchy appearance, ink-blue text
- Ghost/Link: adapted to ink colors
- Focus: sketchy border outline

**Input Changes**:
- Remove: `rounded-md border border-gray-300 bg-white`
- Add: `border-0 border-b-2 border-notebook-line bg-transparent rounded-none font-inter`
- Focus: `border-b-notebook-ink-blue` (thickens to 3px, turns blue)
- Placeholder: `text-notebook-ink-light`

**Label Changes**:
- Font: `font-patrick-hand text-base text-notebook-ink-medium`

**Acceptance**: All form elements render with notebook styling. Focus states are visible and accessible. Touch targets remain 44px+.

---

### Phase 4: Navigation (FR-012)

**Goal**: Restyle Navbar to notebook tabs aesthetic.

**Files Modified**:
- `apps/web/src/components/Navbar.tsx`

**Changes**:
- Background: `bg-notebook-paper` (cream) with warm bottom border
- Logo text: `font-caveat text-2xl`
- Nav links: `font-patrick-hand text-lg`
- Active state: thick ink-blue underline (3px) instead of bg highlight
- Hover: ink underline animation (width grows from center)
- Mobile bottom nav: cream background, notebook tab appearance
- Mobile active: ink-blue text + bottom border accent

**Acceptance**: Navigation uses handwritten fonts. Active page has ink underline. Hover effect is smooth. Mobile bottom nav matches theme.

---

### Phase 5: Card Components (FR-006, FR-007, FR-014)

**Goal**: Transform TaskCard into sticky notes and HabitCard into index cards.

**Files Modified**:
- `apps/web/src/components/tasks/TaskCard.tsx` — Sticky note style
- `apps/web/src/components/habits/HabitCard.tsx` — Index card style
- `apps/web/src/components/tasks/PriorityBadge.tsx` — Ink-color badges
- `apps/web/src/components/tasks/DueDateBadge.tsx` — Warm-toned badges

**TaskCard (Sticky Note)**:
- Background: `bg-notebook-highlight-yellow` (warm yellow tint) or rotating warm colors
- Border: SketchyBorder wrapper with subtle roughness
- Shadow: `shadow-notebook-md`
- Hover: `translateY(-4px)` + shadow grows to `shadow-notebook-hover`
- Title: `font-caveat text-xl`
- Description/meta: `font-inter text-sm text-notebook-ink-medium`
- Priority/status badges: ink-colored with handwritten font

**HabitCard (Index Card)**:
- Background: `bg-notebook-paper-alt` (cream)
- Top accent: 4px colored border (category-based color)
- Ruled lines: repeating-linear-gradient for faint horizontal lines
- Border: SketchyBorder with thicker stroke
- Title (identity statement): `font-caveat text-xl`
- Category badge: ink-colored with handwritten font
- Hover: same lift effect as TaskCard

**Acceptance**: Task cards look like sticky notes. Habit cards look like index cards with ruled lines. Hover lift effect works on desktop. Touch targets maintained.

---

### Phase 6: Completion Animations (FR-013, FR-016)

**Goal**: Add satisfying checkmark draw animation and card highlight on task/habit completion.

**Files Modified/Created**:
- `apps/web/src/components/ui/checkmark-animation.tsx` — SVG checkmark with stroke animation
- `apps/web/src/components/habits/CompletionCheckbox.tsx` — Integrate checkmark animation
- `apps/web/src/app/globals.css` — Add keyframes

**Checkmark Animation**:
```css
@keyframes draw-checkmark {
  from { stroke-dashoffset: 24; }
  to   { stroke-dashoffset: 0; }
}

@keyframes highlight-flash {
  0%   { background-color: var(--notebook-highlight-mint); }
  100% { background-color: transparent; }
}
```

- SVG checkmark path with `stroke-dasharray: 24` and animation
- Card briefly flashes mint background (0.5s)
- `@media (prefers-reduced-motion: reduce)` → skip all animations, instant state change

**Acceptance**: Completing a task/habit plays checkmark + highlight. Animation is <1s total. Disabled when reduced-motion preferred.

---

### Phase 7: Page Load Animations (FR-015, FR-016)

**Goal**: Staggered fade-in for page content.

**Files Modified**:
- `apps/web/src/app/globals.css` — Add stagger keyframes
- Cards on list pages — Add animation delay classes

**Approach**:
```css
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.animate-fade-in-up {
  animation: fade-in-up 0.4s ease-out forwards;
  opacity: 0; /* Start hidden, animation fills forward */
}
```

Cards receive `style={{ animationDelay: `${index * 100}ms` }}` for staggered effect.

All wrapped in `@media (prefers-reduced-motion: no-preference)`.

**Acceptance**: Page content fades in with stagger. Cards appear top-to-bottom. Animation respects reduced-motion.

---

### Phase 8: Forms (FR-009 to FR-011)

**Goal**: Restyle task and habit forms to notebook page aesthetic.

**Files Modified**:
- `apps/web/src/components/tasks/TaskForm.tsx`
- `apps/web/src/components/habits/HabitForm.tsx`
- `apps/web/src/components/tasks/TaskFilters.tsx`

**Changes**:
- All inputs use the updated Input component (underline-only)
- Labels use Label component (handwritten font)
- Form container: cream background, optional ruled-line pattern
- Textareas: sketchy border + faint ruled lines (background gradient)
- Select elements: styled to match input aesthetic
- Validation errors: sticky-note style (warm background, handwritten font, not red banners)
- Character counters: `font-inter text-xs text-notebook-ink-light`

**Acceptance**: Forms feel like writing in a notebook. Validation is friendly, not harsh. All inputs maintain accessibility.

---

### Phase 9: Empty, Loading, & Error States (FR-021 to FR-024)

**Goal**: Add personality to empty/loading/error states.

**Files Modified/Created**:
- `apps/web/src/components/tasks/EmptyState.tsx` — Notebook personality
- `apps/web/src/components/ui/notebook-skeleton.tsx` — Cream skeleton loader
- `apps/web/src/lib/toast-context.tsx` — Sticky-note toast styling (or toast component)

**Empty States**:
- Encouraging handwritten messages: "Your habit garden is empty — plant your first seed!"
- Simple SVG doodle (notebook/pencil/sprout — inline SVG, not external assets)
- Prominent CTA button styled as notebook button

**Loading Skeletons**:
- Cream-colored placeholder shapes (not gray)
- Subtle pulse animation on warm tones
- Match card dimensions (sticky note / index card shapes)

**Toast Notifications**:
- Sticky-note appearance with SketchyBorder
- Color-coded: blue (info), green (success), yellow (warning), red (error)
- Handwritten font for message text
- Slight rotation (-1deg to 2deg) for organic feel

**Error/Validation States**:
- Warm background (not harsh red banner)
- Handwritten font
- Friendly language: "Oops, we need a title!" vs "Error: title is required"

**Acceptance**: Empty states encourage action. Skeletons are cream-colored. Toasts look like sticky notes. Errors are friendly.

---

### Phase 10: Streak Milestones (FR-029)

**Goal**: Display inline congratulatory text at streak milestones.

**Files Modified**:
- `apps/web/src/components/habits/StreakCounter.tsx`

**Changes**:
- When streak is 7, 21, or 30: render inline text in `font-caveat`
- Messages: "Amazing — 7 day streak!", "Incredible — 21 day streak!", "Unstoppable — 30 day streak!"
- Fire emoji alongside
- No confetti or complex animation

**Acceptance**: Milestone text appears at correct thresholds. Text uses handwritten font. No animation beyond text display.

---

### Phase 11: Page-Level Consistency & Polish (FR-017 to FR-020, SC-004)

**Goal**: Ensure every page uses the notebook design consistently.

**Files Modified**:
- `apps/web/src/app/layout.tsx` — Global background, max-width
- `apps/web/src/app/dashboard/page.tsx` — Notebook styling
- `apps/web/src/app/tasks/page.tsx` — Notebook styling
- `apps/web/src/app/tasks/[id]/page.tsx` — Detail page styling
- `apps/web/src/app/tasks/new/page.tsx` — Create page styling
- `apps/web/src/app/habits/page.tsx` — Notebook styling
- `apps/web/src/app/habits/[id]/page.tsx` — Detail page styling
- `apps/web/src/app/habits/new/page.tsx` — Create page styling
- `apps/web/src/app/login/page.tsx` — Auth page styling
- `apps/web/src/app/register/page.tsx` — Auth page styling

**Changes per page**:
- Max content width: 1200px centered
- Cream background (inherited from layout)
- Headings: `font-caveat`
- Body text: `font-inter`
- Consistent spacing using design token scale
- Responsive grid: 1-col → 2-col (768px) → 3-col (1024px) where applicable

**Acceptance**: All 10+ distinct views use notebook tokens consistently. No page breaks the aesthetic. Responsive from 320px to 1920px.

---

## 5. Accessibility Checklist (FR-025 to FR-027)

Applied across ALL phases (not a separate phase):

- [ ] All text/background combinations meet WCAG AA 4.5:1 ratio
  - Verify: `--notebook-ink` on `--notebook-paper` → must be ≥ 4.5:1
  - Verify: `--notebook-ink-blue` on `--notebook-paper` → must be ≥ 4.5:1
  - Verify: `--notebook-ink-medium` on `--notebook-paper` → must be ≥ 3:1 (large text only)
- [ ] Focus indicators: sketchy-style visible outline on all interactive elements
- [ ] Keyboard navigation: logical tab order preserved through all changes
- [ ] Touch targets: minimum 44×44px on all interactive elements (already enforced by `.touch-target` utility)
- [ ] `prefers-reduced-motion`: all animations disabled, instant state changes
- [ ] Font fallbacks: sans-serif stack if Google Fonts fail to load

---

## 6. Performance Budget (SC-007)

| Metric | Budget | Strategy |
|---|---|---|
| Font loading | <100ms perceived | `next/font/google` self-hosts; `font-display: swap` |
| roughjs bundle | <15kb gzipped | Tree-shake; only import `RoughSVG` |
| CSS custom properties | ~0ms | Native browser feature, no runtime cost |
| Animations | 60fps | Only `transform` and `opacity` (GPU-composited) |
| SVG borders | Generated once | Cache per component instance via `seed` prop |
| Total page load impact | <500ms vs baseline | Fonts are largest cost; everything else is CSS/SVG |

---

## 7. Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| roughjs adds >500ms to page load | Low | Medium | Lazy-load roughjs; generate borders after first paint; use seed for caching |
| Handwritten fonts hurt readability | Medium | High | Use handwritten fonts ONLY for headings/labels/buttons; body text always Inter |
| Color palette fails WCAG AA | Medium | High | Verify every combination during Phase 1 with contrast checker before committing |
| Existing component tests break | Low | Medium | Visual changes shouldn't affect behavior; run existing test suite after each phase |

---

## 8. File Impact Summary

### New Files (4)
- `apps/web/src/components/ui/sketchy-border.tsx`
- `apps/web/src/components/ui/checkmark-animation.tsx`
- `apps/web/src/components/ui/notebook-skeleton.tsx`
- `apps/web/src/components/ui/notebook-toast.tsx`

### Modified Files (~20)
- `apps/web/package.json` (add roughjs)
- `apps/web/tailwind.config.ts` (notebook theme)
- `apps/web/src/app/globals.css` (design tokens, keyframes)
- `apps/web/src/app/layout.tsx` (fonts, body classes)
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/input.tsx`
- `apps/web/src/components/ui/label.tsx`
- `apps/web/src/components/Navbar.tsx`
- `apps/web/src/components/tasks/TaskCard.tsx`
- `apps/web/src/components/tasks/TaskForm.tsx`
- `apps/web/src/components/tasks/TaskFilters.tsx`
- `apps/web/src/components/tasks/EmptyState.tsx`
- `apps/web/src/components/tasks/PriorityBadge.tsx`
- `apps/web/src/components/tasks/DueDateBadge.tsx`
- `apps/web/src/components/habits/HabitCard.tsx`
- `apps/web/src/components/habits/HabitForm.tsx`
- `apps/web/src/components/habits/CompletionCheckbox.tsx`
- `apps/web/src/components/habits/StreakCounter.tsx`
- `apps/web/src/lib/toast-context.tsx`
- All page.tsx files (dashboard, tasks/*, habits/*, login, register)

### No Backend Changes
Zero files modified in `apps/api/`.

---

## 9. Implementation Order & Dependencies

```
Phase 1 (Foundation) ← Everything depends on this
  ↓
Phase 2 (Sketchy Border) ← Cards, buttons, toasts depend on this
  ↓
Phase 3 (Base UI) + Phase 4 (Navbar) ← Can run in parallel
  ↓
Phase 5 (Cards) ← Depends on Phase 2 + Phase 3
  ↓
Phase 6 (Completion Animations) + Phase 7 (Page Animations) ← Can run in parallel
  ↓
Phase 8 (Forms) ← Depends on Phase 3 (Input/Label restyled)
  ↓
Phase 9 (Empty/Loading/Error) + Phase 10 (Streak Milestones) ← Can run in parallel
  ↓
Phase 11 (Page-Level Polish) ← Final consistency pass, depends on everything above
```

---

## 10. Validation Strategy

After each phase:
1. **Visual**: Load affected pages and verify notebook aesthetic
2. **Accessibility**: Run contrast check on new color combinations
3. **Responsiveness**: Test at 320px, 768px, 1024px, 1920px
4. **Reduced Motion**: Enable `prefers-reduced-motion` and verify animations disabled
5. **Build**: Run `npm run build` to catch TypeScript/import errors
6. **Tests**: Run existing test suite to ensure no behavioral regressions

After Phase 11 (final):
- Walk through all 10+ distinct views end-to-end
- Verify SC-001 through SC-010 pass
- Performance comparison vs baseline (SC-007: <500ms degradation)
