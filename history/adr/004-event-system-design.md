# ADR-004: Event System Design and Logging Strategy

> **Scope**: Document decision clusters, not individual technology choices. Group related decisions that work together (e.g., "Frontend Stack" not separate ADRs for framework, styling, deployment).

- **Status:** Accepted
- **Date:** 2026-01-03
- **Feature:** 001-phase2-chunk1 (Phase 2 Core Infrastructure)
- **Context:** Phase 2 establishes the foundation for an event-driven architecture required in later phases. The core module (authentication, tasks) must emit events (USER_REGISTERED, TASK_COMPLETED) that future modules (habits, analytics) will consume. The event system must be fire-and-forget (non-blocking), support schema evolution, and provide a migration path to Kafka in Phase 5. For Phase 2, the system needs simple, debuggable event capture without external dependencies.

<!-- Significance checklist (ALL must be true to justify this ADR)
     1) Impact: Long-term consequence for architecture/platform/security? YES - Foundation for event-driven architecture, Phase 5 Kafka migration
     2) Alternatives: Multiple viable options considered with tradeoffs? YES - File-based vs database vs Redis, Kafka now vs later
     3) Scope: Cross-cutting concern (not an isolated detail)? YES - All modules emit/consume events
-->

## Decision

We adopt a **file-based event logging system** with migration path to Kafka:

- **Phase 2-4 Implementation:**
  - **Storage:** Newline-delimited JSON (JSONL) files in `logs/` directory
  - **Rotation:** Daily rotation (logs/events-YYYY-MM-DD.jsonl)
  - **Schema:** `{event_type, user_id, timestamp, payload}`
  - **Emission:** Fire-and-forget (async, non-blocking)
  - **Consumers:** Minimal in Phase 2 (event logging only), more in Chunks 3-5

- **Phase 5 Migration:**
  - Replace file writes with Kafka producers
  - Event schema remains identical (no consumer changes)
  - File-based logging retained for local development

- **Event Emitter API:**
  ```python
  emitter.emit("USER_REGISTERED", user_id=user.id, payload={"email": user.email})
  emitter.emit("TASK_COMPLETED", user_id=user.id, payload={"task_id": task.id})
  ```

- **Event Schema:**
  ```json
  {
    "event_type": "USER_REGISTERED",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2026-01-03T10:30:00Z",
    "payload": {"email": "user@example.com"}
  }
  ```

## Consequences

### Positive

1. **Simplicity:**
   - No external dependencies (no Kafka, Redis, RabbitMQ in Phase 2)
   - File append is fast (< 1ms, non-blocking I/O)
   - Easy to inspect events: `cat logs/events-*.jsonl | jq`

2. **Debuggability:**
   - Events persisted to disk (survive app restarts)
   - Human-readable JSON (grep, jq, text editors work)
   - Daily rotation prevents unbounded file growth

3. **Fire-and-Forget:**
   - Event emission never blocks critical paths (registration, login)
   - Async file writes (Python asyncio, FastAPI background tasks)
   - Failed writes logged but don't crash app

4. **Migration Path to Kafka:**
   - Event schema designed for Kafka (event_type, user_id, timestamp, payload)
   - Consumers written to expect same schema
   - Phase 5 migration: Replace file write with Kafka producer (1-line change)

5. **Development Velocity:**
   - Start emitting events immediately (no Kafka setup)
   - Test event flows locally (inspect files)
   - Add consumers incrementally (Chunks 3-5)

6. **Log Aggregation Ready:**
   - JSONL format compatible with ELK stack, Splunk, Datadog
   - Can ship logs to aggregation service in production
   - Structured logs enable filtering, aggregation, alerting

### Negative

1. **No Real-Time Consumers:**
   - File-based logging doesn't support real-time event consumption
   - Consumers must poll/tail files (inefficient)
   - Mitigated by Phase 5 Kafka migration (real-time pub/sub)

2. **No Delivery Guarantees:**
   - File write failures silently drop events (no retries)
   - Disk full → events lost
   - Mitigated by monitoring disk space, graceful degradation

3. **Single-Machine Only:**
   - Events written to local disk (not distributed)
   - Horizontal scaling requires shared filesystem or log aggregation
   - Acceptable for Phase 2 (single backend instance)

4. **Manual Cleanup Required:**
   - Old log files accumulate (logs/events-2026-01-*.jsonl)
   - Requires log rotation policy (delete logs > 30 days)
   - Mitigated by adding to .gitignore, cron job for cleanup

5. **Limited Query Capabilities:**
   - No indexing (grep/jq only)
   - Cannot efficiently query "all USER_REGISTERED events in last 7 days"
   - Mitigated by log aggregation tools (future) or Kafka (Phase 5)

## Alternatives Considered

### Alternative 1: Kafka Event Streaming (Phase 2)
- **Components:**
  - Kafka broker (local or cloud-hosted)
  - Kafka producers in backend
  - Kafka consumers in modules
  - Schema registry for event schemas

- **Why Rejected:**
  - **Overkill for Phase 2:** No real-time consumers yet (minimal event consumption)
  - **Operational Complexity:** Kafka setup, ZooKeeper, broker maintenance, monitoring
  - **Infrastructure Cost:** Kafka hosting fees (Confluent, AWS MSK) or self-hosting overhead
  - **Development Velocity:** Slows Phase 2 implementation (Kafka learning curve, debugging)
  - **Deferred to Phase 5:** File-based now, Kafka when real-time consumers critical

### Alternative 2: Database Event Table
- **Components:**
  - `events` table (id, event_type, user_id, timestamp, payload JSONB)
  - INSERT INTO events on every event
  - Consumers query database for new events

- **Why Rejected:**
  - **Write Overhead:** Every event adds database write (100-200ms latency)
  - **Table Growth:** Events table grows unbounded (millions of rows → query slowdown)
  - **Scalability:** Database becomes bottleneck for high event volume
  - **Not Event-Driven:** Polling database for events is anti-pattern (use message queue)
  - **File Append Faster:** File I/O < 1ms vs database write 100ms+

### Alternative 3: Redis Pub/Sub
- **Components:**
  - Redis server for pub/sub
  - Backend publishes events to Redis channels
  - Consumers subscribe to Redis channels

- **Why Rejected:**
  - **No Persistence:** Redis pub/sub doesn't persist messages (subscribers must be online)
  - **Lost Events:** If no consumer subscribed, event lost (fire-and-forget but no audit)
  - **External Dependency:** Adds Redis to infrastructure (hosting, monitoring, failover)
  - **Phase 5 Kafka Superior:** Kafka provides persistence + pub/sub (better long-term choice)
  - **File-Based Simpler:** No external dependencies, events persisted for audit

### Alternative 4: In-Memory Event Bus (EventEmitter)
- **Components:**
  - Python EventEmitter or FastAPI events
  - Events emitted to in-memory subscribers
  - No persistence

- **Why Rejected:**
  - **Lost on Restart:** Events lost when app restarts (no audit trail)
  - **No Debugging:** Cannot inspect historical events
  - **Constitutional Violation:** Principle VI (Database as single source of truth) - events must be persisted
  - **File-Based Provides Audit:** Events survive restarts, debuggable, compliant

## References

- Feature Spec: [specs/001-phase2-chunk1/spec.md](../../specs/001-phase2-chunk1/spec.md) (FR-028 to FR-037: Event system requirements)
- Implementation Plan: [specs/001-phase2-chunk1/plan.md](../../specs/001-phase2-chunk1/plan.md) (Technical Context: Event Logs)
- Research: [specs/001-phase2-chunk1/research.md](../../specs/001-phase2-chunk1/research.md) (Section 4: Event System)
- Constitution: [.specify/memory/constitution.md](../../.specify/memory/constitution.md) (Principle IV: Event-Driven Design, Event-Driven Design section)
- Related ADRs: None (foundational event system decision)
- Evaluator Evidence: Post-design constitution check (plan.md) - Principle IV (Event-Driven Design) PASS
