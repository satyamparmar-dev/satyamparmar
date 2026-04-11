/** Two conceptual + two code-based Q&A per day (15+2=17, 10+2=12). */

export function extraInterviewForDay(n) {
  const map = {
    49: {
      conceptual: [
        {
          question: "When would you return **422 Unprocessable Entity** instead of **400 Bad Request**?",
          answer:
            "**400** signals malformed syntax or invalid types (bad JSON, wrong content-type). **422** signals syntactically valid input that fails business or validation rules (insufficient stock, illegal state transition). Consistency matters: pick one convention per API and document it so clients and gateways interpret failures uniformly.",
        },
        {
          question: "What does it mean for a pagination **cursor** to be **opaque**, and why enforce it?",
          answer:
            "Clients must treat the cursor as an encoded bookmark, not parse or construct it. That lets the server change sort keys, shard layout, or encoding without breaking clients. Document that only the server issues cursors and clients pass them back unchanged on `next` requests.",
        },
      ],
      codeBased: [
        {
          question:
            "A client retries **POST /payments** with the same **Idempotency-Key** but a **different JSON body**. What HTTP outcome do you design?",
          answer:
            "Return **409 Conflict** (often with Problem Details) because the key is bound to a specific request fingerprint. Replaying the same key must return the same response; a body mismatch indicates client misuse or a bug. Log correlation ids for support.",
        },
        {
          question:
            "You expose **GET /orders/{id}** with **ETag**. How should **If-Match** on **PATCH** behave when the ETag does not match?",
          answer:
            "Return **412 Precondition Failed** — the resource changed since the client read it. This enables optimistic concurrency without locks. The client should refetch, merge, and retry. Spring can map this via `If-Match` handling and `ResponseEntity.status(412)`.",
        },
      ],
    },
    50: {
      conceptual: [
        {
          question: "What makes an OpenAPI change **breaking** vs **additive** for JSON responses?",
          answer:
            "**Breaking**: removing fields, renaming fields, tightening required arrays, changing a field's type, or narrowing enum values. **Additive**: new optional fields, new endpoints, loosening validation (careful with security). CI should diff OpenAPI and fail on breaking changes unless the major version bumps.",
        },
        {
          question: "Why store an **OpenAPI baseline artifact per release** instead of only generating docs in Swagger UI?",
          answer:
            "Partner and internal clients compile against a **frozen** contract. Baseline JSON/YAML in artifact storage lets pipelines diff PRs against `main`, run Spectral, and gate merges. Swagger UI is helpful but not a durable contract artifact.",
        },
      ],
      codeBased: [
        {
          question:
            "In OpenAPI 3, how do you model **pagination** so both **offset** and **cursor** styles stay documented?",
          answer:
            "Use **parameters** on the list operation: `limit`, `offset` or `cursor`, `page_size`. Document defaults, max limits, and stability guarantees (offset can skip/duplicate under concurrent writes; cursor is preferred at scale). Add examples in `examples` for each style your API supports.",
        },
        {
          question:
            "Your CI runs **Spectral**. Give one rule that catches a common OpenAPI footgun.",
          answer:
            "Example: **`operation-operationId-unique`** — duplicate `operationId` values break code generators and gateway routing. Another: flag **unused schemas** so dead components do not mislead consumers. Tie rules to team style guide.",
        },
      ],
    },
    51: {
      conceptual: [
        {
          question: "What is a **bounded context** in DDD, and why does it matter for microservices?",
          answer:
            "A bounded context is a **linguistic and model boundary** where terms have one consistent meaning. Aligning one service per context reduces ambiguous shared models. **Anti-pattern**: one giant “Customer” entity shared everywhere — contexts should exchange DTOs or events, not one shared table model.",
        },
        {
          question: "When is **two services** worse than **one modular monolith**?",
          answer:
            "When teams, deployment cadence, and data ownership are not independent — distributed boundaries add **network, consistency, and ops** cost without autonomy benefits. Start modular inside one deployable unit; extract when **SLO, scale, or org** boundaries justify the split.",
        },
      ],
      codeBased: [
        {
          question:
            "How does **aggregate root** rule affect what you expose on a REST resource?",
          answer:
            "External updates should target the **aggregate root** URI; nested entities mutate **through** the root to enforce invariants. Exposing direct CRUD on every child table invites invariant violations. Document commands as sub-resources or domain actions when needed.",
        },
        {
          question:
            "Name a **domain event** you might publish when an order is **paid**, and one consumer.",
          answer:
            "Event: `OrderPaid` with order id, amount, timestamp. Consumer: **shipping** service reserves courier, **analytics** updates funnel metrics, **search** projection updates status. Keep payload minimal and versioned; avoid leaking internal entity graphs.",
        },
      ],
    },
    52: {
      conceptual: [
        {
          question: "What problem does **service discovery** solve in Kubernetes vs a static config file?",
          answer:
            "Pods are ephemeral — IPs change on reschedule. Discovery (DNS, K8s Services, Consul) maps **logical names** to current instances. Static files cause stale routes and failed calls after rollouts. Health-aware discovery avoids routing to not-ready pods.",
        },
        {
          question: "What belongs in an **API gateway** vs inside each microservice?",
          answer:
            "**Gateway**: TLS termination, authn at edge, rate limits, WAF, request routing, some A/B and canary splits. **Service**: business rules, authz on resources, domain validation. Avoid putting domain logic in the gateway — it becomes a distributed monolith.",
        },
      ],
      codeBased: [
        {
          question:
            "How would you configure **retries** at the gateway for **GET** vs **POST** to a downstream?",
          answer:
            "**GET** (idempotent): retry on connect timeout or 503 with backoff and **Retry-After** respect. **POST**: default **no retry** to the body unless you know the downstream is idempotent or you carry **Idempotency-Key** end-to-end. Prefer client or service-level retry policies with budgets.",
        },
        {
          question:
            "Give a **health check** pattern that avoids lying **Ready** when dependencies are down.",
          answer:
            "**Liveness** = process up. **Readiness** = can serve traffic (DB reachable, critical deps OK). If Redis is required for login, failing readiness pulls the pod from Service endpoints. Do not put slow checks on liveness — you will get restart loops.",
        },
      ],
    },
    53: {
      conceptual: [
        {
          question: "When pick **WebClient** over **RestTemplate** in new Spring code?",
          answer:
            "**WebClient** is non-blocking, fits reactive stacks, and composes filters for metrics and resilience. **RestTemplate** is maintenance mode. For blocking apps, WebClient in `block()` is still acceptable short term — but prefer async end-to-end when load is I/O bound.",
        },
        {
          question: "What does **bulkhead** isolation mean for Feign/WebClient calls?",
          answer:
            "Separate thread pools or concurrency limits per downstream so one slow service does not exhaust all worker threads (**cascading failure**). Resilience4j bulkheads + timeouts + circuit breakers work together: fail fast and preserve capacity for healthy deps.",
        },
      ],
      codeBased: [
        {
          question:
            "A **circuit breaker** opens after failures. What should happen on the **half-open** state?",
          answer:
            "Allow a **small probe** of calls through. Successes close the breaker; failures re-open immediately. Half-open prevents thundering herd while testing recovery. Log half-open transitions and expose metrics (Micrometer) for dashboards.",
        },
        {
          question:
            "How do you propagate **trace context** across a Feign call?",
          answer:
            "Register a **RequestInterceptor** that copies **traceparent** / **b3** headers from the current span (Micrometer Tracing, Brave, OTel). Without this, downstream logs break the trace chain. Verify in integration tests with a test tracer.",
        },
      ],
    },
    54: {
      conceptual: [
        {
          question: "When is **gRPC** a better default than REST between internal services?",
          answer:
            "Strong **typing** with Protobuf, **efficient** binary framing, **streaming** (client/server/bidi), and good code generation for many languages. Trade-offs: harder browser consumption, need for **proto evolution** discipline, and L7 proxies must understand HTTP/2 features.",
        },
        {
          question: "What is the **N+1** problem in GraphQL, and how do teams mitigate it?",
          answer:
            "One GraphQL query can trigger many resolver round-trips to the DB. Mitigate with **DataLoader** batching, **query cost** limits, **persisted queries** for public APIs, and depth/complexity analysis. Monitor field-level resolver latency.",
        },
      ],
      codeBased: [
        {
          question:
            "How do you evolve a **protobuf** field without breaking old clients?",
          answer:
            "Add new fields with **new field numbers**; never reuse numbers. Optional new fields are backward compatible if unknown fields are ignored. Avoid changing wire types. Use **oneof** carefully; deprecate with `reserved` when removing fields after a migration window.",
        },
        {
          question:
            "Name one **GraphQL** risk specific to **public** APIs vs internal.",
          answer:
            "**Query complexity attacks** — arbitrary deep queries can DoS your server. Use max depth, pagination on lists, timeouts, and authenticated persisted queries. Internal APIs still need batching but trust boundaries differ.",
        },
      ],
    },
    55: {
      conceptual: [
        {
          question: "Compare **sync HTTP** vs **async messaging** for **checkout → inventory** notification.",
          answer:
            "**Sync**: simpler mental model, immediate failure visible to user, couples availability and latency. **Async**: decouples peaks, enables retries and dead-letter handling, but needs **idempotent consumers** and UX for eventual consistency. Many systems use sync for the user-facing commit and async for downstream fan-out.",
        },
        {
          question: "What is **message deduplication** and where is state stored?",
          answer:
            "Consumers may see duplicates (at-least-once delivery). Store **processed message ids** (DB unique constraint or Redis SET with TTL) to skip replays. Design handlers **idempotent** so duplicates are harmless even if the dedup layer fails.",
        },
      ],
      codeBased: [
        {
          question:
            "Why use **dead-letter queue (DLQ)** with a message broker?",
          answer:
            "Poison messages that always fail would block processing or infinite-retry. After N attempts, move to DLQ for **manual inspection**, fix, and replay. Alert on DLQ depth. Include original headers and error reason in DLQ metadata.",
        },
        {
          question:
            "How does **outbox pattern** relate DB transaction and event publish?",
          answer:
            "Write business row and **outbox row** in the **same** DB transaction. A separate **publisher** reads outbox and pushes to broker, then marks published. This avoids “DB committed but message lost” or “message sent but DB rolled back”.",
        },
      ],
    },
    56: {
      conceptual: [
        {
          question: "Contrast **2PC** vs **Saga** for distributed transactions.",
          answer:
            "**2PC** blocks for global commit — latency and coordinator failure modes hurt availability. **Saga** uses **local transactions + compensations**; no global lock. Choose saga/choreography or orchestration when **long-running** flows cross services and you accept eventual consistency.",
        },
        {
          question: "What is a **compensating transaction**, with an example?",
          answer:
            "A business action that **undoes** a prior step in a saga. Example: if **payment** succeeded but **reserve inventory** failed, run **refund payment** compensation. Compensations are domain-specific — not always literal deletes; may be status reversal or credit.",
        },
      ],
      codeBased: [
        {
          question:
            "In **choreography**, how do you avoid **lost events** breaking the saga?",
          answer:
            "Use **durable broker**, **consumer idempotency**, **retry + DLQ**, and **correlation id** on every message. Observability: trace saga instance across topics. Some teams add a **saga timeout sweeper** that emits compensations for stuck states.",
        },
        {
          question:
            "When prefer **orchestrated saga** (central coordinator) over **choreography**?",
          answer:
            "Complex flows with many branches, human approval steps, or strict ordering visibility — orchestrator (or workflow engine) centralizes state and policies. Choreography scales with loose coupling but can be harder to reason about globally.",
        },
      ],
    },
    57: {
      conceptual: [
        {
          question: "What problem does **CQRS** solve, and what cost do you accept?",
          answer:
            "Separates **write model** (commands, invariants) from **read model** (denormalized projections). Improves read scaling and shapes data for UIs. Cost: **eventual consistency** between write and read sides, more moving parts, and careful projection versioning.",
        },
        {
          question: "How does **event sourcing** differ from “store latest row only”?",
          answer:
            "**Event sourcing** stores the **append-only event stream** as source of truth; current state is a **fold** of events (optionally cached via snapshots). Enables audit, time travel, and rebuilding projections. Not every CRUD service needs it — use when history and audit are first-class.",
        },
      ],
      codeBased: [
        {
          question:
            "A projection is **behind** the write side. What SLO might you publish to users?",
          answer:
            "Example: “search index **< 30s** behind writes p99.” Measure **lag** per partition (event position vs projection cursor). Alert when lag exceeds threshold; scale consumers or optimize handlers before UX suffers.",
        },
        {
          question:
            "Why must event handlers be **idempotent** when consuming from Kafka?",
          answer:
            "**At-least-once** delivery can redeliver after crashes or consumer rebalance. Reprocessing the same offset must not double-apply effects (duplicate charges, duplicate emails). Use idempotency keys or natural keys in the projection store.",
        },
      ],
    },
    58: {
      conceptual: [
        {
          question: "What is the **Strangler Fig** pattern when retiring a legacy system?",
          answer:
            "Incrementally route slices of traffic (by path, tenant, or feature flag) from legacy to new implementation behind a **facade**. Measure parity on errors and latency. Expand the slice as confidence grows until legacy can be decommissioned.",
        },
        {
          question: "What is an **Anti-Corruption Layer (ACL)**?",
          answer:
            "A boundary that **translates** foreign/legacy models into your domain model so outdated terminology and shapes do not leak inward. Keeps core domain clean while integrating with ERP, SOAP, or partner APIs.",
        },
      ],
      codeBased: [
        {
          question:
            "How can **feature flags** reduce risk during a strangler migration?",
          answer:
            "Flags control **percentage rollout**, **per-tenant** enablement, and instant **rollback** without redeploy. Pair with metrics: compare error rate legacy vs new path. Kill switch if new path violates SLO.",
        },
        {
          question:
            "Give one test you would run for **ACL** correctness.",
          answer:
            "**Contract tests** mapping legacy samples to domain objects: table-driven tests with representative legacy payloads (including weird enums and nulls). Assert no unmapped codes leak as raw strings into domain services.",
        },
      ],
    },
  };
  const x = map[n];
  if (!x) throw new Error(`No extra interview for day ${n}`);
  return x;
}
