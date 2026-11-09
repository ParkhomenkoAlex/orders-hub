# Orders Hub scalability architecture proposal

> **Proposal only.** This document describes a possible evolution path for the
> stated Middle+ design exercise of 100,000 users and 1,000,000 messages in 24
> hours. It is not deployed infrastructure and does not claim that the current
> Orders Hub application has been benchmarked or supports these figures.

## Scope and capacity assumptions

The assignment supplies two headline figures but no workload profile. The
following assumptions make them actionable and must be validated with product
telemetry before provisioning capacity:

| Dimension                   | Planning assumption                                                                                                                                                                                                                                                                     |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Users                       | 100,000 registered or active users in a rolling 24-hour period; this is not 100,000 simultaneous connections.                                                                                                                                                                           |
| Concurrent browser sessions | Illustrative average of 5% (5,000) and peak of 15% (15,000) concurrent tabs. A tab is a realtime session, so this can exceed the number of people.                                                                                                                                      |
| Durable business events     | 1,000,000 events accepted in 24 hours: `1,000,000 / 86,400 = 11.6` events/s average. A 20x burst allowance is about 232 events/s.                                                                                                                                                       |
| Event payload and retention | Illustrative 2 KiB serialized event payload and 30-day broker retention. That is about 1.9 GiB/day and 58 GiB raw for 30 days before replication, indexes, compression, or overhead.                                                                                                    |
| Fan-out                     | Business events are delivered only to their subscribed workers. Realtime notifications are targeted to a user, tenant, or room; they are not broadcast to every connected tab. At a notional average of three recipients, a 232 events/s peak produces about 696 realtime deliveries/s. |
| User-facing targets         | Set and measure explicit SLOs before scale-out: for example, a low-latency API/SSR target and a separate realtime-delivery target. No latency or throughput benchmark is claimed here.                                                                                                  |

`messages` must remain an explicit metric: durable domain events, Socket.IO
packets, retries, and client reconnects have different volume, retention, and
delivery requirements. A global active-tab count is ephemeral presence data,
not a durable business event.

## Verified current architecture

Today, Orders Hub has the following implementation boundaries:

- Next.js App Router serves the dashboard, request-time `/orders` rendering,
  REST handlers, the read-only GraphQL endpoint, and JWT demonstration route.
  RTK Query calls the REST API from the browser.
- Server-only repository helpers use Drizzle and mysql2. `getDb()` lazily
  creates a process-local MySQL pool; local Docker MySQL and Aiven Preview
  MySQL are separate environments.
- The separately runnable Render Socket.IO process tracks socket IDs in one
  in-memory `Set` and broadcasts `sessions:update` on every connection change.
  It is intentionally a single-instance service.
- `POST /api/orders` persists an Order and then synchronously publishes an
  in-process `order.created` event. Its audit-log and telemetry consumers are
  isolated with `Promise.allSettled`, but there is no durable queue, retry, or
  delivery across application instances.
- JWTs are signed and verified server-side and stored in HTTP-only cookies for
  a single configured demonstration account. Orders and Products remain public
  by deliberate scope.
- Observability is currently limited to structured audit output and safe API
  error metadata. Existing automated tests cover unit, database-backed
  integration, and local browser workflows; there is no production metrics,
  tracing, alerting, load test, or disaster-recovery exercise.

### Current constraints at the target scale

| Area               | Current limitation                                                                                                  | Consequence when horizontally scaled                                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Socket.IO presence | Socket IDs exist only in one process.                                                                               | Each instance reports a partial count; a process restart loses all local presence.                                                  |
| Realtime fan-out   | Every connect/disconnect broadcasts to every client of one server.                                                  | Global broadcasts and reconnect storms grow with the number of tabs.                                                                |
| Domain events      | Dispatcher and consumers share one Next.js process after the write.                                                 | Events can be lost between commit and publish, are duplicated by retries without idempotency, and are invisible to other instances. |
| MySQL access       | Each application process owns a mysql2 pool; reads use the primary.                                                 | Unbounded replica pools can exhaust database connections, and read load cannot be isolated.                                         |
| Runtime scaling    | Vercel/Render Preview deployment is appropriate for demonstration, not a measured multi-region production topology. | There are no configured autoscaling limits, shared state, or production SLOs.                                                       |
| Authentication     | A single demonstration credential and stateless JWT logout.                                                         | It is not a multi-user identity, authorization, revocation, or credential-rotation solution.                                        |

## Proposed target architecture

```mermaid
flowchart LR
    Browser[Browser / PWA]
    Edge[CDN + WAF + rate limiting]
    LB[Load balancer]

    subgraph App[Stateless application tier]
        NextA[Next.js API + SSR replica]
        NextB[Next.js API + SSR replica]
    end

    subgraph Realtime[Realtime tier]
        RT1[Socket.IO node]
        RT2[Socket.IO node]
    end

    Redis[(Redis: presence, adapter, rate-limit state)]
    DBPrimary[(MySQL primary)]
    DBRead[(MySQL read replica(s))]
    Outbox[(Transactional outbox)]
    Publisher[Outbox publisher]
    Broker[(Durable event broker)]
    WorkerA[Audit / telemetry worker]
    WorkerB[Notification worker]
    DLQ[(Dead-letter queue)]
    Obs[Metrics, logs, traces, alerts]
    Backup[Backups + restore verification]

    Browser --> Edge --> LB
    LB --> NextA
    LB --> NextB
    Browser <-->|WSS| RT1
    Browser <-->|WSS| RT2
    RT1 <--> Redis
    RT2 <--> Redis
    NextA --> DBPrimary
    NextB --> DBPrimary
    NextA -. read .-> DBRead
    NextB -. read .-> DBRead
    DBPrimary --> Outbox
    Outbox --> Publisher --> Broker
    Broker --> WorkerA
    Broker --> WorkerB
    WorkerA -. terminal failures .-> DLQ
    WorkerB -. terminal failures .-> DLQ
    WorkerB --> Redis
    WorkerB --> RT1
    WorkerB --> RT2
    NextA -. telemetry .-> Obs
    NextB -. telemetry .-> Obs
    RT1 -. telemetry .-> Obs
    RT2 -. telemetry .-> Obs
    DBPrimary --> Backup
```

### Stateless application tier

Run multiple stateless Next.js application instances behind a CDN/WAF and load
balancer. Keep server-side configuration in a managed secret store and inject
it into instances rather than committing it. Request-time `/orders` rendering,
REST, and GraphQL remain server-side consumers of the repository layer.

Use a connection proxy or deliberately bounded per-instance MySQL pools. Pool
limits must be calculated from the database connection budget and maximum
application replicas, not chosen independently per pod/function. Read replicas
are appropriate only after measuring read pressure and confirming replica-lag
semantics are acceptable; writes, authoritative read-after-write flows, and the
outbox stay on the primary.

### Realtime tier and ephemeral presence

Replace the single Socket.IO process with multiple Socket.IO nodes behind a
WebSocket-capable load balancer. Use a Redis-compatible Socket.IO adapter for
cross-node room delivery. Depending on the connection transport and load
balancer, configure sticky sessions; the current service restricts itself to
WebSocket transport, but an explicit affinity policy makes future transport
changes safer.

Store presence in shared Redis with TTL/heartbeat-based cleanup or derive it
through the adapter, rather than retaining it only in a node-local `Set`.
Treat reconnects and disconnects as eventually consistent. To avoid an
O(connections) broadcast on every presence change, publish active-count updates
at a bounded cadence or to explicitly interested subscribers, while retaining a
fresh count on connection. The product must decide the acceptable freshness
window before choosing the cadence.

Redis is justified here for transient shared coordination: Socket.IO adapter
pub/sub, presence, and distributed rate-limit counters. It is not the durable
record of Orders or business events.

### Durable domain-event pipeline

For durable `order.created` processing, write the Order and an outbox row in
one MySQL transaction. A separately deployed publisher reads unprocessed
outbox rows, publishes typed events to a durable broker, and marks them
delivered only after broker acknowledgement. This closes the current
commit-then-in-process-publish loss window.

Independent workers subscribe to the broker for audit/telemetry and
notifications. They use an event ID plus an idempotency/inbox record before
performing side effects, exponential backoff for transient failures, bounded
retries, and a dead-letter queue for operator review. Delivery is normally
at-least-once; consumers—not the broker alone—make repeated delivery safe.
The durable broker can be a managed Kafka-compatible service, RabbitMQ, or a
cloud queue selected for required ordering, retention, throughput, operations,
and cost. It is deliberately not prescribed here without measured needs.

Realtime socket messages remain ephemeral notifications. A failed client
delivery does not roll back an Order and must not be represented as proof of
durable business-event processing.

### Persistence, security, and resilience

- Add indexes only from measured query plans and slow-query evidence; the
  existing schema indexes are a starting point. Consider partitioning only when
  table growth, retention, and access patterns justify its operational cost.
- Use managed MySQL backups, point-in-time recovery where available, regular
  restore drills, replica health checks, and tested failover runbooks. Backups
  without a restore test are not a recovery guarantee.
- Separate database credentials by runtime role, rotate secrets, retain Aiven
  TLS verification or equivalent, and keep all secrets server-only.
- Replace the demonstration account with a real identity and authorization
  boundary before protecting multi-user data. Keep JWT issuer/audience/expiry
  validation, add key rotation and revocation policy only when the product
  needs them.
- Apply edge and API rate limits, request-size limits, schema validation,
  CORS/origin policies, and least-privilege service identities. Rate-limit
  state must be shared once API instances scale.

### Observability and operations

Emit structured logs with correlation/request IDs and without secrets, tokens,
or raw connection strings. Capture metrics for request rate, latency, error
rate, MySQL pool saturation and query latency, outbox age, broker lag, retries,
DLQ depth, Socket.IO connections/reconnects, and Redis health. Propagate traces
from an API write through the outbox, broker, worker, and realtime notification
where sampling and cost permit. Alert on SLO burn, failing health checks,
outbox backlog, consumer lag, elevated reconnects, database saturation, backup
failure, and DLQ growth.

## Failure handling

| Failure                      | Expected behaviour                                                                                    | Operator response                                                                                  |
| ---------------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| One Next.js instance fails   | Load balancer routes new requests elsewhere; in-flight requests may fail.                             | Replace instance and inspect error/trace correlation.                                              |
| One Socket.IO node fails     | Its tabs reconnect; shared presence expires stale IDs and subsequent counts converge.                 | Autoscale/replace node; monitor reconnect spike and Redis health.                                  |
| Redis unavailable            | Realtime fan-out/presence and distributed limits degrade; Orders persistence remains a MySQL concern. | Fail realtime honestly, trip health checks as appropriate, and restore Redis before scaling nodes. |
| Broker or worker unavailable | Orders and outbox writes still commit; outbox and broker backlog grows.                               | Alert on backlog/lag, restore consumers, replay idempotently, inspect DLQ.                         |
| MySQL primary unavailable    | Writes fail closed; read strategy depends on freshness policy.                                        | Fail over using the managed-database runbook and validate consistency/replication.                 |
| Duplicate event              | Consumer sees an existing event ID.                                                                   | Skip repeated side effect and retain audit evidence.                                               |

## Phased evolution

### 1. Establish baselines and observability

Add production-safe metrics, structured correlation IDs, traces where useful,
health checks, dashboard/alert definitions, and representative load tests.
Measure request mix, query plans, active connections, event sizes, fan-out, and
actual peak patterns. Set SLOs and database connection budgets.

**Risk/trade-off:** telemetry adds cost and operational work; it prevents
guessing about the capacity assumptions in this proposal.

### 2. Remove process-local scaling limits

Make Next.js API/SSR instances stateless behind a load balancer, bound database
pools, and move Socket.IO presence/adapter state to Redis. Deploy multiple
realtime nodes only after validating shared-count convergence, reconnect
behaviour, load-balancer WebSocket support, and affinity policy.

**Risk/trade-off:** Redis and a load balancer add operational dependencies; a
single realtime instance remains simpler until measured connection demand needs
horizontal scale.

### 3. Introduce durable events and workers

Add the transactional outbox to business writes, publish from a recoverable
publisher, select a managed durable broker, and move audit/telemetry and
notification consumers into independently scalable workers. Add idempotency,
retry, DLQ, and replay procedures.

**Risk/trade-off:** at-least-once delivery requires idempotent consumers and
operational tooling, but avoids treating an in-process callback as a durable
event guarantee.

### 4. Scale data and infrastructure from measurements

Tune indexes and queries from production evidence, add read replicas only for
measured read pressure, set autoscaling limits from SLOs, and rehearse backup,
restore, regional failure, broker replay, and load-shedding runbooks.

**Risk/trade-off:** replicas, partitioning, and multi-region designs can
increase consistency and recovery complexity. Adopt each only when its measured
benefit exceeds that cost.

## Review criteria and non-goals

Before adopting any phase, review measured demand, failure modes, data
classification, cost, operational ownership, and rollback procedure. This
proposal does not implement a broker, Redis, horizontal scaling, multi-user
authorization, replication, partitioning, or microfrontend/WebAssembly
deliverables. Those remain separate roadmap decisions.
