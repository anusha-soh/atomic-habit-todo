# ADR-005: Frontend Technology Stack

> **Scope**: Document decision clusters, not individual technology choices. Group related decisions that work together (e.g., "Frontend Stack" not separate ADRs for framework, styling, deployment).

- **Status:** Accepted
- **Date:** 2026-01-03
- **Feature:** 001-phase2-chunk1 (Phase 2 Core Infrastructure)
- **Context:** Phase 2 requires a mobile-first, responsive web frontend for user registration, login, and dashboard. The solution must support server-side rendering for performance, enable rapid UI development, and align with the constitutional mandate for mobile-first design (Principle VII). The stack must integrate seamlessly with FastAPI backend, support future feature expansion (tasks, habits, analytics), and deploy to Vercel with zero configuration.

<!-- Significance checklist (ALL must be true to justify this ADR)
     1) Impact: Long-term consequence for architecture/platform/security? YES - Affects developer experience, performance, mobile UX
     2) Alternatives: Multiple viable options considered with tradeoffs? YES - Next.js vs Remix, TailwindCSS vs CSS-in-JS, Radix UI vs Material UI
     3) Scope: Cross-cutting concern (not an isolated detail)? YES - All UI development uses this stack
-->

## Decision

We adopt an **integrated frontend stack** consisting of:

- **Framework:** Next.js 16+ with App Router (React Server Components)
- **Styling:** TailwindCSS 4+ (utility-first, mobile-first breakpoints)
- **Component Library:** Radix UI (unstyled, accessible primitives)
- **Language:** TypeScript 5.8+ (strict mode enabled)
- **Deployment:** Vercel (zero-config, automatic Next.js optimization)
- **State Management:** React Context + hooks (start simple, Redux if needed later)
- **API Client:** fetch (native, Next.js server components for data fetching)
- **Testing:** Jest + React Testing Library

**Mobile-First Design Principles:**
- Default styles for mobile (320px+ screens)
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch targets: minimum 44×44px (`.touch-target` utility)
- Bottom navigation on mobile, sidebar on desktop

## Consequences

### Positive

1. **Performance:**
   - React Server Components (RSC) reduce client-side JavaScript bundle
   - Automatic code splitting (Next.js App Router)
   - Vercel edge caching and CDN (fast global delivery)
   - Server-side rendering (SSR) for SEO and initial page load

2. **Developer Experience:**
   - File-system routing (app/register/page.tsx → /register)
   - Hot module replacement (instant feedback)
   - TailwindCSS IntelliSense (autocomplete in VS Code)
   - TypeScript strict mode catches errors at compile-time

3. **Mobile-First by Default:**
   - TailwindCSS mobile-first breakpoints (`sm:`, `md:`, `lg:`)
   - Responsive utilities (hidden, flex-col → flex-row)
   - Touch-friendly defaults (min-h-[44px], min-w-[44px])
   - Constitutional alignment (Principle VII)

4. **Accessibility:**
   - Radix UI primitives have ARIA attributes built-in
   - Keyboard navigation automatically supported
   - Screen reader compatibility
   - Focus management (modals, dropdowns)

5. **Vercel Integration:**
   - Zero-config deployment (git push → auto-deploy)
   - Preview URLs for pull requests
   - Automatic HTTPS and CDN
   - Environment variable management

6. **Type Safety:**
   - TypeScript 5.8+ with strict mode
   - Shared types from `packages/core` (User, Session, Event)
   - OpenAPI-generated types for backend API (future)

7. **Composition Over Inheritance:**
   - React hooks (useAuth, useTasks) vs class components
   - Radix UI primitives composable (align with Principle XII)
   - No deep component hierarchies

### Negative

1. **Vendor Lock-In:**
   - Vercel-specific features (edge middleware, ISR)
   - Migration to another host (AWS Amplify, Cloudflare) requires config changes
   - Mitigated by Next.js portability (can deploy anywhere Node.js runs)

2. **Framework Coupling:**
   - Next.js App Router is opinionated (file-system routing, server components)
   - Migration to Remix/Vite requires rewrite
   - Acceptable trade-off for developer experience and performance

3. **TailwindCSS Verbosity:**
   - Long className strings (className="flex min-h-[44px] items-center justify-center px-4 py-2")
   - No style colocation (styles in className, not CSS files)
   - Mitigated by reusable components and @apply directive

4. **Learning Curve:**
   - Next.js App Router is new (different from Pages Router)
   - React Server Components (RSC) paradigm shift
   - Team must learn TailwindCSS utility classes
   - Radix UI requires understanding composition patterns

5. **Build Complexity:**
   - Next.js build step required (cannot serve raw files)
   - Vercel deployment takes 2-3 minutes
   - Mitigated by fast local dev server (pnpm dev)

## Alternatives Considered

### Alternative 1: Remix + styled-components + Cloudflare Pages
- **Components:**
  - Remix (full-stack React framework)
  - styled-components (CSS-in-JS)
  - Cloudflare Pages (edge deployment)

- **Why Rejected:**
  - **Less Mature Deployment:** Cloudflare Pages has fewer integrations than Vercel
  - **styled-components Runtime:** CSS-in-JS adds runtime overhead (TailwindCSS is compile-time)
  - **Smaller Ecosystem:** Remix community smaller than Next.js (fewer examples, plugins)
  - **Vercel + Next.js Integration:** Zero-config deployment, automatic optimizations
  - **TailwindCSS Mobile-First:** Built-in breakpoints align with constitutional mandate

### Alternative 2: Vite + React + vanilla CSS + AWS Amplify
- **Components:**
  - Vite (fast build tool)
  - React (library, not framework)
  - Vanilla CSS or CSS Modules
  - AWS Amplify (deployment)

- **Why Rejected:**
  - **No SSR:** Vite + React is client-side only (slower initial load, bad SEO)
  - **Manual Routing:** React Router setup, no file-system routing
  - **More Configuration:** Vite + React requires manual setup (Next.js is batteries-included)
  - **AWS Amplify Complexity:** More config than Vercel (build settings, environment vars)
  - **Next.js Superior DX:** File-system routing, SSR, automatic code splitting

### Alternative 3: Material UI or Chakra UI (Instead of Radix UI)
- **Components:**
  - Material UI (Google Material Design) or Chakra UI (opinionated component library)
  - Pre-styled components (buttons, forms, modals)

- **Why Rejected:**
  - **Opinionated Styling:** Material UI enforces Material Design (conflicts with custom brand)
  - **Bundle Size:** Pre-styled components larger than Radix UI primitives
  - **Less Flexibility:** Harder to customize compared to Radix UI + TailwindCSS
  - **Composition Fit:** Radix UI primitives align better with Principle XII (Composition over inheritance)
  - **TailwindCSS Integration:** Radix UI unstyled → easy to style with TailwindCSS

### Alternative 4: CSS-in-JS (styled-components, Emotion)
- **Components:**
  - styled-components or Emotion
  - CSS written in JavaScript template literals

- **Why Rejected:**
  - **Runtime Overhead:** CSS-in-JS adds JavaScript execution at runtime (slower)
  - **Bundle Size:** CSS-in-JS libraries add 10-20KB to bundle
  - **TailwindCSS Compile-Time:** Zero runtime overhead, smaller bundles
  - **Mobile-First Built-In:** TailwindCSS breakpoints designed for mobile-first
  - **Better Performance:** TailwindCSS purges unused styles (tiny production CSS)

## References

- Feature Spec: [specs/001-phase2-chunk1/spec.md](../../specs/001-phase2-chunk1/spec.md) (FR-055 to FR-064: Frontend requirements, Mobile-First design)
- Implementation Plan: [specs/001-phase2-chunk1/plan.md](../../specs/001-phase2-chunk1/plan.md) (Technical Context: Frontend)
- Research: [specs/001-phase2-chunk1/research.md](../../specs/001-phase2-chunk1/research.md) (Section 5: Frontend, Section 9: Mobile-First)
- Constitution: [.specify/memory/constitution.md](../../.specify/memory/constitution.md) (Principle VII: Mobile-First, Principle XII: Composition over inheritance)
- Related ADRs: ADR-003 (Monorepo structure enables apps/web)
- Evaluator Evidence: Post-design constitution check (plan.md) - Principles VII and XII PASS
