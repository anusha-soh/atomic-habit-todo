---
name: notebook-frontend
description: |
  Enforce the Atomic Habits "cozy handwritten notebook" design system across
  all frontend work. Covers Tailwind v4 PostCSS setup, design tokens, component
  patterns (StickyNote, cards, nav), accessibility rules, and routing patterns.

  Use when: building any UI for this project, adding components or pages, fixing
  "class not generated", "md:hidden not working", layout unstyled, or Playwright
  visibility failures. Self-updates after each session — trim stale content as patterns evolve.
---

# Notebook Frontend — Atomic Habits

**Last verified**: 2026-02-23 | **Stack**: Next.js 16, Tailwind v4, Turbopack, TypeScript

The design language is a **cozy handwritten bullet journal** — warm cream, organic shapes, handwritten fonts, gentle imperfection. Never corporate, never sterile.

---

## ⚠️ CRITICAL: Tailwind v4 Setup Checklist

If any CSS class is not rendering, check these three files **first**:

### 1. `@tailwindcss/postcss` must be installed
```json
// apps/web/package.json
"devDependencies": {
  "@tailwindcss/postcss": "^4.x"
}
```
Install: `npm install -D @tailwindcss/postcss`

### 2. `postcss.config.mjs` must exist
```js
// apps/web/postcss.config.mjs
const config = { plugins: { '@tailwindcss/postcss': {} } };
export default config;
```

### 3. `globals.css` must start with
```css
@import "tailwindcss";
@theme inline { /* tokens */ }
```

**Without all three, `@import "tailwindcss"` generates zero utility classes. Only raw CSS rules render. No build error is thrown.**

---

## ⚠️ CRITICAL: Tailwind v4 / Turbopack Scanning Rules

Turbopack statically scans for class names. It **cannot** detect classes inside JS ternaries or template literals.

```tsx
// ❌ BAD — classes are never generated
className={open ? 'max-h-72' : 'max-h-0'}
className={`${condition ? 'md:hidden' : ''}`}

// ✅ FIX 1 — explicit CSS class in globals.css
// Add to globals.css: @media (min-width: 768px) { .hamburger-mobile-only { display: none !important; } }
className="hamburger-mobile-only flex ..."

// ✅ FIX 2 — inline style for animated values
style={{ maxHeight: open ? '18rem' : '0', opacity: open ? 1 : 0, visibility: open ? 'visible' : 'hidden' }}
```

**Playwright note**: `page.isVisible()` returns `true` for `overflow:hidden + max-height:0`. Always add `visibility: hidden` to collapsed elements.

---

## Design Tokens

Defined in `apps/web/src/app/globals.css` under `@theme inline`. No `tailwind.config.ts` — Tailwind v4 is CSS-first.

### Colors

| Tailwind class | Value | Use |
|---|---|---|
| `bg-notebook-paper` | `#FDF6E3` | Primary page/section background |
| `bg-notebook-paper-alt` | `#FAF0D7` | Alternate section (Features, FinalCta, Footer) |
| `bg-notebook-paper-white` | `#FFFEF9` | Near-white surfaces |
| `border-notebook-line` | `#E8DCC8` | Ruled lines, dividers, input underlines |
| `text-notebook-ink` | `#2C2416` | Primary body text |
| `text-notebook-ink-medium` | `#5C4F3A` | Secondary text, labels |
| `text-notebook-ink-light` | `#8B775A` | Placeholders, tertiary |
| `text-notebook-ink-blue` | `#2B5EA7` | Links, focus rings, primary buttons |
| `text-notebook-ink-red` | `#C23B22` | Errors, decorative margin line |
| `text-notebook-ink-green` | `#3D7A4A` | Success, completion |
| `bg-notebook-highlight-yellow` | `#FFF3BF` | Yellow sticky note |
| `bg-notebook-highlight-pink` | `#FFE0E6` | Pink sticky note |
| `bg-notebook-highlight-mint` | `#D4EDDA` | Mint sticky note |

Section backgrounds alternate: `notebook-paper` (Hero, Testimonials) → `notebook-paper-alt` (Features, FinalCta, Footer).

### Fonts

| Class | Font | Use |
|---|---|---|
| `font-caveat` | Caveat | H1, H2, section headings, streak numbers |
| `font-patrick-hand` | Patrick Hand | Buttons, labels, nav links, eyebrow text, badges |
| `font-inter` | Inter | Body paragraphs, descriptions — anything >1 sentence |

**Rule**: Never use handwritten fonts (`caveat`, `patrick-hand`) for multi-sentence body text.

### Shadows

| Class | Use |
|---|---|
| `shadow-notebook-sm` | Subtle, nav elements |
| `shadow-notebook-md` | Default card shadow |
| `shadow-notebook-lg` | Floating/elevated elements |
| `shadow-notebook-hover` | Card hover lift state |

Shadow base: `rgba(139, 119, 90, 0.15)` — always warm brown, never gray.

---

## Component Patterns

### StickyNote (UI Primitive)
`apps/web/src/components/ui/sticky-note.tsx`

```tsx
import { StickyNote } from '@/components/ui/sticky-note';

// color: 'yellow' | 'pink' | 'mint' — supply seed for deterministic SSR
<StickyNote color="yellow" seed={42} className="h-full">
  <div className="p-6 space-y-3">
    <h3 className="font-caveat text-2xl text-notebook-ink">Title</h3>
    <p className="font-inter text-notebook-ink-medium text-base leading-relaxed">Body.</p>
  </div>
</StickyNote>
```

`StickyNote` wraps `RoughBorder` (roughjs sketchy SVG overlay). Do NOT add duplicate shadow/translate to `StickyNote` — it already applies them.

### Card Tilt Pattern (FeatureCard, Testimonial)

```tsx
// tilt: '-rotate-1' | 'rotate-0' | 'rotate-1'
<div className={`h-full transition-all duration-300 hover:rotate-0 hover:-translate-y-1.5 ${tilt}`}>
  <StickyNote color={color} seed={seed} className="h-full">
    <div className="p-6 sm:p-8 space-y-3">
      <span className="text-4xl block" role="img" aria-hidden="true">{icon}</span>
      <h3 className="font-caveat text-2xl text-notebook-ink">{title}</h3>
      <p className="font-inter text-notebook-ink-medium text-base leading-relaxed">{description}</p>
    </div>
  </StickyNote>
</div>
```

### CTA Buttons

```tsx
// Primary
<Link href="/register" className="inline-flex items-center justify-center gap-2 min-h-[44px] min-w-[44px] px-8 py-3 bg-notebook-ink-blue text-notebook-paper-white font-patrick-hand text-lg rounded-lg shadow-notebook-md hover:shadow-notebook-hover hover:-translate-y-1 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-notebook-ink-blue focus-visible:ring-offset-2">
  Get Started — It&apos;s Free
</Link>

// Secondary (outline)
<Link href="/login" className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-8 py-3 border-2 border-notebook-ink-blue text-notebook-ink-blue font-patrick-hand text-lg rounded-lg hover:bg-notebook-paper-alt/60 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-notebook-ink-blue focus-visible:ring-offset-2">
  Sign In
</Link>
```

### NotebookNav (Marketing)
`apps/web/src/components/marketing/notebook-nav.tsx`

- Height: `h-16` (64px) — `html { scroll-padding-top: 4.5rem }` in globals.css offsets anchor jumps
- Scroll effect: `bg-notebook-paper/95 backdrop-blur-sm shadow-notebook-md border-b border-notebook-line` when `scrolled || mobileOpen`
- Hamburger: uses `.hamburger-mobile-only` CSS class (NOT `md:hidden` — Turbopack scanning issue)
- Mobile menu: inline `style={{ maxHeight, opacity, visibility }}` (NOT Tailwind classes)

### Section Structure (Marketing)

```tsx
<section id="section-id" className="bg-notebook-paper[-alt] py-16 px-6">
  <div className="max-w-5xl mx-auto">
    <div className="text-center mb-10 space-y-2">
      <p className="font-patrick-hand text-notebook-ink-medium uppercase tracking-widest text-sm">Eyebrow</p>
      <h2 className="font-caveat text-5xl sm:text-6xl text-notebook-ink">Section Heading</h2>
      <p className="font-inter text-notebook-ink-medium text-lg max-w-md mx-auto">Sub-head.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
      {/* cards */}
    </div>
  </div>
</section>
```

### Hero Section
`apps/web/src/components/marketing/hero.tsx`

- Padding: `pt-28 pb-20` — no `min-h` (avoids viewport-height whitespace below content)
- Floating sticky notes: `hidden lg:block absolute ... pointer-events-none select-none aria-hidden="true"`
- Ruled lines: inline `style` with `repeating-linear-gradient` referencing `var(--notebook-line)`
- Wavy SVG underline: inline `<svg>` with `preserveAspectRatio="none"`, `aria-hidden="true"`
- Entry animations: `.animate-fade-in-up` with staggered `style={{ animationDelay: '0.Xs' }}`

### App Inputs (Notebook Lines)

```tsx
// Underline-only input — no box border
<input className="border-0 border-b-2 border-notebook-line bg-transparent font-inter focus:border-notebook-ink-blue focus:border-b-[3px] placeholder:text-notebook-ink-light" />
```

### Testimonials Semantic HTML

```tsx
<figure className="p-6 space-y-4">
  <div aria-hidden="true">{avatar}</div>
  <blockquote>
    <p className="font-patrick-hand text-notebook-ink text-base leading-relaxed">&ldquo;{quote}&rdquo;</p>
  </blockquote>
  <figcaption className="font-caveat text-notebook-ink-medium text-lg">— {name}</figcaption>
</figure>
```

---

## Accessibility (Non-Negotiable)

| Rule | Implementation |
|---|---|
| Touch targets | `min-h-[44px] min-w-[44px]` on all interactive elements |
| Focus rings | `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-notebook-ink-blue focus-visible:ring-offset-2` |
| Decorative emoji | `<span role="img" aria-hidden="true">` |
| Decorative SVG | `aria-hidden="true"` on svg element |
| Reduced motion | Add new animations to `@media (prefers-reduced-motion: reduce)` block in globals.css |
| Collapsed menus | `visibility: hidden` — not just `overflow: hidden` |
| Keyboard | Logical tab order; no focus trap in collapsed mobile menu |

---

## Routing Patterns

### ClientMain (Marketing vs App Padding)
`apps/web/src/components/ClientMain.tsx`

Marketing routes skip the `pb-20 md:pb-8` bottom padding (no mobile bottom nav on landing page):

```tsx
const MARKETING_ROUTES = ['/'];
// Add new marketing routes here: '/about', '/pricing', etc.
```

### Marketing Route Group
`apps/web/src/app/(marketing)/` — has its own `layout.tsx` (no app Navbar). After adding this route group, delete `.next/types/` if TypeScript throws stale validator errors:
```bash
rm -rf apps/web/.next/types
```

---

## Pre-flight Checklist (New Components / Pages)

- [ ] `postcss.config.mjs` exists with `@tailwindcss/postcss`
- [ ] No responsive/state classes inside JS ternaries or template literals
- [ ] Dynamic collapse uses `visibility: hidden` (not just `overflow: hidden`)
- [ ] Section padding: `py-16 px-6`, inner container: `max-w-5xl mx-auto`
- [ ] Section background alternates correctly (`notebook-paper` ↔ `notebook-paper-alt`)
- [ ] All touch targets `min-h-[44px] min-w-[44px]`
- [ ] All interactive elements have focus ring classes
- [ ] Decorative emoji/SVG marked `aria-hidden="true"`
- [ ] `seed` prop on `StickyNote`/`RoughBorder` for deterministic SSR
- [ ] New marketing route added to `MARKETING_ROUTES` in `ClientMain.tsx`
- [ ] New animations added to `prefers-reduced-motion: reduce` block

---

## Self-Maintenance Protocol

This skill must stay accurate and lean. After any frontend session:

**Add** a pattern if:
- A new design token, component, or utility was created and verified working
- A new gotcha/bug was found and fixed
- A new page/route was added

**Update** if:
- A file path, class name, or token value changed
- A pattern was refactored (update the code example)

**Remove** if:
- A component was deleted or renamed
- An instruction refers to a pattern no longer used
- Content duplicates something Claude already knows

**Edit this file directly** (`apps/web/.claude/skills/notebook-frontend/SKILL.md`). Keep it under 5 000 words. Update the `Last verified` date at the top.
