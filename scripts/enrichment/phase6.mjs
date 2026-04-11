/** Phase 6 — REST & Microservices (Days 49–58) */
export default {
  49: `**REST constraints** (stateless, cacheable, uniform interface) vs pragmatic JSON APIs — hypermedia (HATEOAS) rare except public platforms.

**Resource naming:** nouns, plural collections; \`POST /orders\` creates subordinate resources — avoid verbs in URLs unless RPC-style is explicit.

**Status codes:** 201 + Location for create; 409 conflict; 422 validation — consistent error envelope (\`code\`, \`message\`, \`details\`).

**Idempotency-Key** header for safe retries on POST — payment and order APIs standard pattern.`,

  50: `**Versioning:** URL (\`/v1\`) vs header vs content negotiation — pick one org-wide; deprecate with sunset headers.

**Breaking vs non-breaking:** additive fields usually safe; removing/renaming breaks clients — schema registries for events.

**OpenAPI** as contract — generate server stubs or client SDKs; diff in CI for breaking changes.

**Pagination:** cursor for large/unstable sets; offset for admin UIs — document limits and defaults.`,

  51: `**API Gateway** handles auth, rate limit, routing, TLS termination — keep domain services simple behind it.

**Service discovery:** DNS/K8s services vs Eureka — health-aware load balancing.

**Circuit breaker** (Resilience4j) — fail fast when dependency sick; bulkhead isolates thread pools.

**Timeouts everywhere** — client connect/read; default infinite hangs cascade failures.`,

  52: `**Saga pattern** coordinates distributed transactions — choreographed (events) vs orchestrated (central coordinator); compensating actions required.

**Outbox pattern** ensures atomic DB + message publish — debounce duplicate consumers with idempotent handlers.

**Exactly-once illusion:** at-least-once + idempotent consumers is practical; know dual-write problem.

**Event schema evolution:** backward/forward compatible readers — optional fields, never reuse field meaning.`,

  53: `**gRPC** for internal high-performance RPC — protobuf contracts, streaming; browser needs grpc-web gateway.

**REST vs gRPC:** human debugging vs efficiency — often REST at edge, gRPC mesh-internal.

**Deadlines/cancellation** propagate contexts — cancel work when client disconnects.

**Error model:** rich \`Status\` with details — map to domain errors consistently.`,

  54: `**GraphQL** single endpoint, client-shaped queries — N+1 solved with DataLoader batching.

**Complexity limits** and depth caps — prevent expensive queries; persisted queries for public APIs.

**Authorization** at resolver level — field-level rules harder than REST path security.

**Caching** harder than REST — HTTP cache semantics do not apply; use CDN sparingly.`,

  55: `**Twelve-factor app:** config in env, stateless processes, logs as streams — checklist for cloud-native readiness.

**Health checks:** liveness vs readiness — K8s uses both; readiness should include DB dependency.

**Graceful shutdown:** drain connections, complete in-flight requests — \`SIGTERM\` handling in Spring Boot 2.3+.

**Resource limits:** set requests/limits in K8s — JVM container awareness (\`-XX:MaxRAMPercentage\`).`,

  56: `**Service mesh (e.g. Istio)** — mTLS, traffic split, retries with budgets — operational cost vs library-level resilience.

**Canary / blue-green** releases — metric-driven promotion; automatic rollback on SLO breach.

**Feature flags** decouple deploy from release — targeting and kill switches without redeploy.

**Chaos engineering** in non-prod — validate timeouts and fallbacks actually work.`,

  57: `**OAuth2 / OIDC:** authorization code + PKCE for SPAs; client credentials for machine-to-machine.

**JWT validation:** signature, issuer, audience, expiry — never trust claims without crypto verify.

**Scopes vs roles:** coarse OAuth scopes; fine roles inside resource server — map clearly.

**Secrets rotation** — short-lived tokens preferred over long-lived API keys where possible.`,

  58: `**API product mindset:** SLAs, developer portal, changelog — internal APIs deserve same discipline as public.

**Rate limiting** fairness — per user + global; burst vs steady; return \`Retry-After\`.

**Deprecation policy:** timeline, migration guide, dual-run period — communicate in headers and docs.

**Review checklist:** authz, pagination, errors, idempotency, observability — repeat for every new endpoint.`,
};
