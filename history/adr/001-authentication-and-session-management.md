# ADR-001: Authentication and Session Management Strategy

> **Scope**: Document decision clusters, not individual technology choices. Group related decisions that work together (e.g., "Frontend Stack" not separate ADRs for framework, styling, deployment).

- **Status:** Accepted
- **Date:** 2026-01-03
- **Feature:** 001-phase2-chunk1 (Phase 2 Core Infrastructure)
- **Context:** Phase 2 requires multi-user authentication with secure session management. The system must support registration, login, logout, and protected routes. Security is paramount (XSS/CSRF protection), and the solution must enable server-side session invalidation for logout functionality. The authentication strategy must integrate seamlessly with the Next.js frontend and FastAPI backend while supporting future horizontal scaling.

<!-- Significance checklist (ALL must be true to justify this ADR)
     1) Impact: Long-term consequence for architecture/platform/security? YES - Security foundation for entire application
     2) Alternatives: Multiple viable options considered with tradeoffs? YES - Better Auth vs Auth0/Clerk, httpOnly cookies vs localStorage
     3) Scope: Cross-cutting concern (not an isolated detail)? YES - Affects all protected endpoints, frontend/backend integration
-->

## Decision

We adopt an **integrated authentication strategy** consisting of:

- **Authentication Library:** Better Auth (modern auth library for Next.js/FastAPI)
- **Token Strategy:** JWT tokens with 7-day expiration
- **Token Storage:** httpOnly cookies (NOT localStorage)
- **Session Tracking:** Database-backed sessions table (users can be logged out server-side)
- **Security Features:**
  - CSRF protection via SameSite=Strict cookies
  - XSS protection via httpOnly flag (JavaScript cannot access tokens)
  - Secure flag for HTTPS-only transmission in production
- **Password Hashing:** bcrypt (Better Auth default)
- **Session Lifecycle:**
  - Created on login (is_active=true, expires_at=now()+7 days)
  - Invalidated on logout (is_active=false)
  - Expired tokens rejected even if is_active=true

## Consequences

### Positive

1. **Strong Security Posture:**
   - httpOnly cookies prevent XSS token theft
   - SameSite=Strict prevents CSRF attacks
   - Database-backed sessions enable server-side invalidation (critical for security incidents)

2. **Developer Experience:**
   - Better Auth provides out-of-the-box JWT + session management
   - Auto-handles cookie setting/clearing
   - Built-in CSRF protection reduces attack surface

3. **Scalability:**
   - JWT enables stateless validation (backend doesn't need to query database for every request)
   - Database fallback for session invalidation (logout, security events)
   - Horizontal scaling possible (stateless backend services)

4. **Auditability:**
   - Sessions table provides login history and audit trail
   - Can track active sessions per user
   - Forensic analysis after security incidents

5. **Self-Hosted:**
   - No external dependencies (Auth0, Clerk)
   - No recurring costs
   - Full control over authentication logic

### Negative

1. **Database Dependency for Logout:**
   - Logout requires database write (set is_active=false)
   - Cannot logout if database is unavailable (rare but possible)
   - Mitigated by JWT expiration (tokens expire after 7 days regardless)

2. **Session Cleanup Required:**
   - Expired sessions accumulate in database over time
   - Requires periodic cleanup job (delete sessions where expires_at < now() - 30 days)
   - Adds operational overhead

3. **Better Auth Learning Curve:**
   - Newer library compared to Auth0/Clerk (smaller community)
   - Less third-party integrations/documentation
   - Team must learn Better Auth API

4. **Cookie Limitations:**
   - Cookies don't work for non-browser clients (mobile apps in future)
   - Requires CORS configuration (credentials: true)
   - SameSite=Strict may break cross-domain scenarios (not applicable for Phase 2)

## Alternatives Considered

### Alternative 1: Third-Party Auth Services (Auth0 / Clerk)
- **Components:**
  - Managed authentication service
  - OAuth/OIDC flows
  - Pre-built UI components
  - Social login support

- **Why Rejected:**
  - **Cost:** Recurring monthly fees scale with user count
  - **External Dependency:** Adds network latency and single point of failure
  - **Lock-In:** Migrating away from Auth0/Clerk is complex and risky
  - **Overkill:** Social login and advanced features not needed in Phase 2
  - **Better Auth Provides Equivalent Security:** httpOnly cookies, bcrypt, session management

### Alternative 2: localStorage for JWT (No Database Sessions)
- **Components:**
  - JWT stored in browser localStorage
  - Pure stateless authentication (no session table)
  - Frontend manually adds Authorization header

- **Why Rejected:**
  - **XSS Vulnerability:** JavaScript can access localStorage, enabling token theft via XSS attacks
  - **No Server-Side Logout:** Cannot invalidate tokens server-side (must wait for expiration)
  - **Security Risk:** OWASP Top 10 explicitly warns against storing sensitive tokens in localStorage
  - **Constitutional Violation:** Principle VI (Database as single source of truth) - sessions must be tracked

### Alternative 3: Session-Only (No JWT)
- **Components:**
  - Traditional session cookies (session ID only)
  - Every request queries database to validate session
  - No JWT payload (stateful server)

- **Why Rejected:**
  - **Performance:** Every request requires database lookup (100-200ms latency)
  - **Scalability:** Stateful sessions complicate horizontal scaling (sticky sessions or shared session store)
  - **JWT Benefits Lost:** Cannot decode user_id from token (must always query database)
  - **Hybrid Approach Superior:** JWT for stateless validation + database for invalidation combines best of both

## References

- Feature Spec: [specs/001-phase2-chunk1/spec.md](../../specs/001-phase2-chunk1/spec.md)
- Implementation Plan: [specs/001-phase2-chunk1/plan.md](../../specs/001-phase2-chunk1/plan.md)
- Research: [specs/001-phase2-chunk1/research.md](../../specs/001-phase2-chunk1/research.md) (Section 1: Authentication)
- Data Model: [specs/001-phase2-chunk1/data-model.md](../../specs/001-phase2-chunk1/data-model.md) (User and Session entities)
- Related ADRs: None (this is the foundational auth decision)
- Evaluator Evidence: Post-design constitution check (plan.md) - all security principles PASS
