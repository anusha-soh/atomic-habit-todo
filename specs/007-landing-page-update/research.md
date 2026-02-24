# Research: Landing Page Modernization

## Decision: Tailwind CSS v4 Migration
**Rationale**: The user explicitly requested Tailwind CSS v4. V4 introduces a CSS-first configuration engine which simplifies theme definition via CSS variables rather than a complex `tailwind.config.js`. This aligns perfectly with defining "Notebook" design tokens (cream, ink-blue, etc.) as native CSS variables that can be shared across the app.
**Alternatives considered**: Tailwind v3.4 (existing), but v4 is the future and specifically requested.

## Decision: shadcn/ui with Custom "Notebook" Variants
**Rationale**: shadcn/ui provides high-quality accessible primitives. By creating custom "notebook" variants (e.g., `<Button variant="ink">`), we can wrap standard shadcn components with the handwritten fonts and sketchy borders required by Spec 006.
**Alternatives considered**: Building components from scratch, but shadcn saves significant time on accessibility (Aria labels, keyboard nav).

## Decision: roughjs for Sketchy Borders
**Rationale**: As decided in Spec 006, `roughjs` is the industry standard for hand-drawn SVG effects. It allows for natural variation in borders, making cards look like actual paper/sticky notes. It is lightweight and integrates well with React.
**Alternatives considered**: Custom SVG paths (too brittle), Border images (not responsive/resizable).

## Decision: Next.js 16 App Router (Marketing Group)
**Rationale**: Use a Route Group `(marketing)` in the `app/` directory. This allows for a clean separation of the landing page layout (with its custom Nav/Footer) from the application dashboard layout.
**Alternatives considered**: Pages router (deprecated), but the project already uses App Router.

## Decision: next/font/google for Handwritten Typeface
**Rationale**: Self-hosting fonts via `next/font` eliminates CLS (Cumulative Layout Shift) and privacy concerns with external CDNs. We will use `Caveat` and `Patrick Hand` as specified.
**Alternatives considered**: Standard system fonts (not cozy enough), local TTF files (harder to manage).
