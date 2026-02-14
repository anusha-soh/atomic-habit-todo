---
name: notebook-design-system
description: |
  Project-specific design system reference for the Atomic Habits notebook aesthetic.
  Covers design tokens (colors, fonts, spacing, shadows), component styling patterns
  (sticky-note cards, index cards, underline inputs, sketchy borders), animations,
  accessibility rules, and Four Laws mapping.

  Use when: styling components, restyling pages to notebook aesthetic, checking
  design token names, verifying WCAG contrast, implementing animations, or
  troubleshooting "which font/color/shadow to use" questions.
---

# Notebook Design System Reference

This project uses a cozy handwritten notebook aesthetic — bullet journal meets coffee shop. Every component should feel warm, personal, and encouraging (not corporate or sterile).

## Core Design Principles

1. **Warmth over sterility** — Cream paper, soft shadows, organic shapes
2. **Personal over digital** — Handwritten fonts, sketchy borders, imperfect alignment
3. **Encouraging over clinical** — Playful micro-interactions, friendly language
4. **Focused over cluttered** — Clean layouts with breathing room

## Four Laws Mapping

- **Law 2 (Attractive)**: Warm notebook aesthetic makes app inviting. Identity statements in handwritten typography reinforce desired identity.
- **Law 4 (Satisfying)**: Completion animations provide immediate visual reward. Streak counters in large handwritten numbers make progress feel personal.

---

## Design Tokens

All tokens are CSS custom properties defined in `apps/web/src/app/globals.css` and exposed through Tailwind in `apps/web/tailwind.config.ts`.

### Colors

| Token | Value | Tailwind Class | Usage |
|---|---|---|---|
| `--notebook-paper` | `#FDF6E3` | `bg-notebook-paper` | Page background |
| `--notebook-paper-alt` | `#FAF0D7` | `bg-notebook-paper-alt` | Card backgrounds (index cards) |
| `--notebook-paper-white` | `#FFFEF9` | `bg-notebook-paper-white` | Near-white surfaces |
| `--notebook-line` | `#E8DCC8` | `border-notebook-line` | Ruled lines, input underlines |
| `--notebook-ink` | `#2C2416` | `text-notebook-ink` | Primary text (dark ink) |
| `--notebook-ink-medium` | `#5C4F3A` | `text-notebook-ink-medium` | Secondary text |
| `--notebook-ink-light` | `#8B775A` | `text-notebook-ink-light` | Placeholder, tertiary text |
| `--notebook-ink-red` | `#C23B22` | `text-notebook-ink-red` | Errors, high priority |
| `--notebook-ink-blue` | `#2B5EA7` | `text-notebook-ink-blue` | Links, focus, primary buttons |
| `--notebook-ink-green` | `#3D7A4A` | `text-notebook-ink-green` | Success, completion |
| `--notebook-highlight-yellow` | `#FFF3BF` | `bg-notebook-highlight-yellow` | Task card (sticky note) bg |
| `--notebook-highlight-pink` | `#FFE0E6` | `bg-notebook-highlight-pink` | Pink highlight accent |
| `--notebook-highlight-mint` | `#D4EDDA` | `bg-notebook-highlight-mint` | Completion flash color |

### Shadows

| Token | Tailwind Class | Usage |
|---|---|---|
| `--notebook-shadow-sm` | `shadow-notebook-sm` | Subtle card shadow |
| `--notebook-shadow-md` | `shadow-notebook-md` | Default card shadow |
| `--notebook-shadow-lg` | `shadow-notebook-lg` | Elevated elements |
| `--notebook-shadow-hover` | `shadow-notebook-hover` | Card hover lift |

Shadow color base: `rgba(139, 119, 90, 0.15)` (warm brown, not gray).

### Fonts

| Font | CSS Variable | Tailwind Class | Usage |
|---|---|---|---|
| Caveat | `--font-caveat` | `font-caveat` | Headings, large display text |
| Patrick Hand | `--font-patrick-hand` | `font-patrick-hand` | Labels, buttons, nav links, badges |
| Inter | `--font-inter` | `font-inter` | Body text, descriptions, timestamps |

**Rule**: Handwritten fonts (Caveat, Patrick Hand) for headings/labels/buttons ONLY. Body text, descriptions, and anything >1 sentence MUST use Inter for readability.

Fonts loaded via `next/font/google` in `apps/web/src/app/layout.tsx` (self-hosted at build time, no CDN).

### Spacing Scale

4px, 8px, 16px, 24px, 32px, 48px — use standard Tailwind spacing (p-1, p-2, p-4, p-6, p-8, p-12).

---

## Component Patterns

### Task Cards (Sticky Notes)

```
Location: apps/web/src/components/tasks/TaskCard.tsx
```

- Background: `bg-notebook-highlight-yellow` (warm yellow tint)
- Border: `<SketchyBorder>` wrapper with subtle roughness
- Shadow: `shadow-notebook-md`
- Hover: `translateY(-4px)` + `shadow-notebook-hover` (paper lifting)
- Title: `font-caveat text-xl text-notebook-ink`
- Description/meta: `font-inter text-sm text-notebook-ink-medium`
- Badges (priority, status): ink-colored with `font-patrick-hand`

### Habit Cards (Index Cards)

```
Location: apps/web/src/components/habits/HabitCard.tsx
```

- Background: `bg-notebook-paper-alt` (cream)
- Top accent: 4px colored border (category-based)
- Ruled lines: `repeating-linear-gradient` for faint horizontal lines
- Border: `<SketchyBorder>` with thicker stroke
- Identity statement: `font-caveat text-xl`
- Hover: same lift as TaskCard

### Buttons

```
Location: apps/web/src/components/ui/button.tsx
```

- Font: `font-patrick-hand text-base`
- Primary: `bg-notebook-ink-blue text-notebook-paper-white`
- Outline: border with `text-notebook-ink-blue`
- Ghost/Link: adapted to ink colors
- Focus: sketchy border outline indicator

### Inputs (Notebook Lines)

```
Location: apps/web/src/components/ui/input.tsx
```

- No box border — underline only: `border-0 border-b-2 border-notebook-line`
- Background: `bg-transparent`
- Focus: `border-b-notebook-ink-blue` (thickens to 3px, turns blue)
- Placeholder: `text-notebook-ink-light`
- Font: `font-inter` (readable body font for input text)

### Labels

```
Location: apps/web/src/components/ui/label.tsx
```

- Font: `font-patrick-hand text-base text-notebook-ink-medium`

### Navigation

```
Location: apps/web/src/components/Navbar.tsx
```

- Background: `bg-notebook-paper` with warm bottom border
- Logo: `font-caveat text-2xl`
- Links: `font-patrick-hand text-lg`
- Active: thick ink-blue underline (3px)
- Hover: ink underline animation (width grows from center)
- Mobile bottom nav: cream background, notebook tab style

### Sketchy Borders

```
Location: apps/web/src/components/ui/sketchy-border.tsx
Library: roughjs
```

- Wraps children with roughjs-generated SVG rectangle
- Props: `roughness` (0.5-2.0), `stroke`, `strokeWidth`, `fill`, `seed`
- `seed` prop = stable rendering (no redraw on re-render)
- Uses `ResizeObserver` for correct dimensions
- SVG overlay with `pointer-events: none`
- Fallback: standard CSS `border-radius: 4px` if roughjs fails

### Empty States

```
Location: apps/web/src/components/tasks/EmptyState.tsx
```

- Encouraging handwritten message: `font-caveat`
- Simple inline SVG doodle (notebook/pencil/sprout)
- Prominent CTA button (notebook-styled)
- Friendly tone: "Your habit garden is empty — plant your first seed!"

### Loading Skeletons

```
Location: apps/web/src/components/ui/notebook-skeleton.tsx
```

- Cream-colored placeholder shapes (NOT gray)
- Subtle pulse animation on warm tones
- Card-shaped variants (sticky-note, index-card)

### Toast Notifications (Sticky Notes)

```
Location: apps/web/src/lib/toast-context.tsx
```

- `<SketchyBorder>` wrapper
- Handwritten font for message
- Color-coded: blue (info), green (success), yellow (warning), red (error)
- Slight rotation (-1deg to 2deg) for organic feel

### Validation Errors

- Warm background (NOT harsh red banner)
- `font-patrick-hand` for error text
- Friendly language: "Oops, we need a title!" not "Error: title is required"

---

## Animations

All animations defined in `apps/web/src/app/globals.css`. ALL must be wrapped in `@media (prefers-reduced-motion: no-preference)`.

| Animation | Duration | Usage |
|---|---|---|
| `draw-checkmark` | 0.3s | SVG checkmark stroke on completion |
| `highlight-flash` | 0.5s | Card bg flashes mint on completion |
| `fade-in-up` | 0.4s | Staggered page load (cards top-to-bottom, 100ms delay) |
| Card hover lift | transition | `translateY(-4px)` + shadow grow on desktop hover |

**Reduced motion**: All animations skip. State changes instant. No visible motion.

---

## Accessibility Rules (Non-Negotiable)

- **Contrast**: All text/bg combos MUST pass WCAG AA (4.5:1 normal, 3:1 large text)
- **Touch targets**: Minimum 44×44px on all interactive elements (`.touch-target` utility)
- **Focus**: Sketchy-style visible outline on all interactive elements
- **Keyboard**: Logical tab order preserved through all components
- **Font fallback**: Sans-serif stack if Google Fonts fail (`font-display: swap`)

---

## Layout Rules

- **Background**: `bg-notebook-paper` (cream) on body
- **Max width**: 1200px centered on larger screens
- **Responsive grid**: 1-col (<768px) → 2-col (768px+) → 3-col (1024px+)
- **Responsive**: No horizontal scrolling 320px–1920px

---

## Page Inventory

All pages in `apps/web/src/app/`:

| Page | Path | Key Components |
|---|---|---|
| Root | `page.tsx` | Landing |
| Dashboard | `dashboard/page.tsx` | Quick actions, summary cards |
| Tasks List | `tasks/page.tsx` | TaskCard, TaskFilters, EmptyState, Pagination |
| Task Detail | `tasks/[id]/page.tsx` | TaskCard expanded |
| Task New | `tasks/new/page.tsx` | TaskForm |
| Task Edit | `tasks/[id]/edit/page.tsx` | TaskForm (prefilled) |
| Habits List | `habits/page.tsx` | HabitCard, CategoryFilter, StatusFilter |
| Habit Detail | `habits/[id]/page.tsx` | HabitCard, CompletionHistory, StreakCounter |
| Habit New | `habits/new/page.tsx` | HabitForm |
| Habit Edit | `habits/[id]/edit/page.tsx` | HabitForm (prefilled) |
| Login | `login/page.tsx` | LoginForm |
| Register | `register/page.tsx` | RegisterForm |

All pages MUST use the same notebook tokens consistently.

---

## Streak Milestones (FR-029)

In `apps/web/src/components/habits/StreakCounter.tsx`:

| Streak | Message |
|---|---|
| 7 days | "Amazing — 7 day streak!" |
| 21 days | "Incredible — 21 day streak!" |
| 30 days | "Unstoppable — 30 day streak!" |

Display as inline text in `font-caveat` adjacent to streak counter. No confetti or complex animation.

---

## Quick Decision Guide

| Question | Answer |
|---|---|
| Which font for this heading? | `font-caveat` |
| Which font for this button/label? | `font-patrick-hand` |
| Which font for body text? | `font-inter` |
| What background for the page? | `bg-notebook-paper` (#FDF6E3) |
| What background for a task card? | `bg-notebook-highlight-yellow` |
| What background for a habit card? | `bg-notebook-paper-alt` |
| What shadow for cards? | `shadow-notebook-md` |
| What color for primary actions? | `notebook-ink-blue` |
| What color for success/completion? | `notebook-ink-green` |
| What color for errors? | `notebook-ink-red` (friendly tone!) |
| How to show an error? | Warm bg sticky-note, not red banner |
| Hover effect on cards? | `translateY(-4px)` + `shadow-notebook-hover` |
| How to handle reduced motion? | Skip all animations, instant state change |
