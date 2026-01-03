# ADR-003: Monorepo Structure and Package Management

> **Scope**: Document decision clusters, not individual technology choices. Group related decisions that work together (e.g., "Frontend Stack" not separate ADRs for framework, styling, deployment).

- **Status:** Accepted
- **Date:** 2026-01-03
- **Feature:** 001-phase2-chunk1 (Phase 2 Core Infrastructure)
- **Context:** Phase 2 introduces a full-stack web application with separate frontend (Next.js) and backend (FastAPI) codebases. We need a repository structure that enables code sharing (shared TypeScript types), independent deployment (Vercel for frontend, Render for backend), and efficient dependency management. The solution must support future expansion (chatbot app in Phase 3, habits/analytics packages in later chunks) without major restructuring.

<!-- Significance checklist (ALL must be true to justify this ADR)
     1) Impact: Long-term consequence for architecture/platform/security? YES - Affects development workflow, deployment, team collaboration
     2) Alternatives: Multiple viable options considered with tradeoffs? YES - Monorepo vs polyrepo, pnpm vs npm/yarn, workspace structure
     3) Scope: Cross-cutting concern (not an isolated detail)? YES - All developers interact with this structure daily
-->

## Decision

We adopt a **pnpm workspace monorepo** with the following structure:

- **Package Manager:** pnpm (fast, efficient, strict dependency resolution)
- **Workspace Layout:**
  ```
  /
  ├── apps/
  │   ├── web/          # Next.js 16+ frontend (Vercel deployment)
  │   ├── api/          # FastAPI backend (Render deployment)
  │   └── chatbot/      # Phase 3: Conversational UI (future)
  ├── packages/
  │   ├── core/         # Shared TypeScript types, constants
  │   ├── habits/       # Chunks 3-5: Habits module (future)
  │   └── analytics/    # Future: Analytics module
  ├── specs/            # Feature specifications
  ├── history/          # ADRs, PHRs
  ├── pnpm-workspace.yaml
  └── package.json      # Root workspace config
  ```

- **Dependency Management:**
  - Shared dev dependencies at root (TypeScript, ESLint, Prettier)
  - App-specific dependencies in each app's package.json
  - Cross-app imports via `packages/core` (no direct app-to-app imports)

- **Build/Deploy:**
  - Each app independently deployable
  - Vercel auto-detects apps/web (Next.js)
  - Render deploys apps/api (Python, separate from pnpm)

- **Scripts:**
  - `pnpm --filter web dev` (run frontend)
  - `pnpm --filter api dev` (run backend, if Node script exists)
  - `pnpm -r build` (build all apps)
  - `pnpm -r test` (test all apps)

## Consequences

### Positive

1. **Development Velocity:**
   - Single `pnpm install` for all JavaScript dependencies
   - Shared types in `packages/core` prevent frontend/backend drift
   - Cross-app refactoring in single commit (atomic changes)

2. **pnpm Efficiency:**
   - **3x faster installs** than npm/yarn (symlinks instead of copying)
   - **Disk space savings:** Content-addressable store (one copy of each package version)
   - **Strict dependencies:** Phantom dependencies prevented (only declared deps accessible)

3. **Clear Separation:**
   - Apps are independently deployable (no coupling)
   - Each app has own package.json (explicit dependencies)
   - Frontend and backend can use different Node versions if needed

4. **Future Scalability:**
   - Easy to add apps/chatbot (Phase 3) without restructuring
   - Packages for modular features (habits, analytics) fit naturally
   - CI/CD can build/test apps in parallel

5. **Type Safety Across Stack:**
   - `packages/core` exports shared types (User, Session, Event schemas)
   - Frontend imports backend types → no API contract drift
   - OpenAPI schema + shared types = double validation

6. **Simplified CI/CD:**
   - Single Git repository (easier branch management)
   - Vercel + Render detect changes automatically
   - No need for multi-repo orchestration (subtree, submodules)

### Negative

1. **Monorepo Complexity:**
   - New developers must understand workspace structure
   - `pnpm --filter` syntax required for app-specific commands
   - Build times grow as more apps added (mitigated by caching in Phase 4+)

2. **Deployment Coordination:**
   - Frontend and backend deploy separately (potential version skew)
   - API contract changes require coordinated frontend/backend updates
   - Mitigated by OpenAPI contract tests and shared types

3. **pnpm Adoption:**
   - Less familiar than npm/yarn (learning curve)
   - Some tools may have npm-specific instructions (need translation)
   - Mitigated by pnpm's npm compatibility (most scripts work)

4. **Large Repo Size:**
   - All apps in single repo (clone time increases)
   - Git history includes all apps (unrelated commits mixed)
   - Mitigated by shallow clones and sparse checkout (if needed)

5. **Workspace Misconfiguration Risk:**
   - Incorrect `pnpm-workspace.yaml` breaks dependency resolution
   - Must maintain root package.json + app package.json consistency
   - Requires discipline and code review

## Alternatives Considered

### Alternative 1: Polyrepo (Separate Repositories)
- **Components:**
  - `atomic-habits-web` repository (Next.js frontend)
  - `atomic-habits-api` repository (FastAPI backend)
  - `atomic-habits-types` repository (shared types as npm package)

- **Why Rejected:**
  - **Coordination Overhead:** API changes require 3-repo pull requests (types → backend → frontend)
  - **Version Management:** Shared types package needs semantic versioning and npm publishing
  - **Developer Experience:** Must clone 3 repos, run 3 `npm install`, manage 3 sets of dependencies
  - **Atomic Changes Impossible:** Cannot update backend API + frontend consumers in single commit
  - **Monorepo Simplicity:** pnpm workspaces provide separation without polyrepo overhead

### Alternative 2: npm Workspaces
- **Components:**
  - Same monorepo structure
  - npm workspaces instead of pnpm

- **Why Rejected:**
  - **Performance:** npm is 3x slower than pnpm for installs (copies vs symlinks)
  - **Disk Usage:** npm duplicates packages across workspaces (wastes disk space)
  - **Phantom Dependencies:** npm allows importing undeclared dependencies (runtime bugs)
  - **pnpm Advantages:** Strict mode prevents errors, faster CI/CD, better disk efficiency

### Alternative 3: Turborepo / Nx (Monorepo Orchestration)
- **Components:**
  - pnpm workspaces + Turborepo (task caching, parallel builds)
  - OR pnpm workspaces + Nx (code generation, dependency graph)

- **Why Rejected:**
  - **Overkill for Phase 2:** Only 2 apps (web + api), caching not critical yet
  - **Added Complexity:** Turborepo/Nx configuration, task pipelines, cache invalidation
  - **Future Option:** Can add Turborepo in Phase 4+ if build times become bottleneck
  - **Start Simple:** pnpm workspaces sufficient for current scale (2 apps, <10 packages)

## References

- Feature Spec: [specs/001-phase2-chunk1/spec.md](../../specs/001-phase2-chunk1/spec.md) (FR-021 to FR-027: Monorepo requirements)
- Implementation Plan: [specs/001-phase2-chunk1/plan.md](../../specs/001-phase2-chunk1/plan.md) (Project Structure section)
- Research: [specs/001-phase2-chunk1/research.md](../../specs/001-phase2-chunk1/research.md) (Section 3: Monorepo)
- Constitution: [.specify/memory/constitution.md](../../.specify/memory/constitution.md) (Principle III: Modular Architecture)
- Related ADRs: None (foundational structure decision)
- Evaluator Evidence: Post-design constitution check (plan.md) - Principle III (Modular Architecture) PASS
