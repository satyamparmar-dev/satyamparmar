/** Phase 9 — Architecture & System Design (Days 77–84) */
export default {
  77: `**Requirements first:** functional vs non-functional (scale, latency, consistency); clarify read/write ratio and peak QPS before boxes.

**Back-of-envelope:** round numbers, powers of ten; latency budgets across hops — sanity check designs in 20 minutes.

**Constraints drive tradeoffs:** strong consistency costs availability (CAP intuition); partition tolerance is not optional in distributed systems.

**Document assumptions** explicitly in interviews — interviewers probe when you hide them.`,

  78: `**C4 model** — context, container, component, code — communicate at the right zoom level.

**Bounded contexts (DDD)** — align microservices with domain seams; avoid anemic service per entity.

**Anti-corruption layer** — translate legacy models at boundaries; prevents domain pollution.

**Evolution:** start modular monolith if domain unclear; extract services when seams stabilize.`,

  79: `**Load balancing** — L4 vs L7; sticky sessions vs shared session store; health-aware routing.

**Caching layers:** browser, CDN, app, DB — stampede mitigation (probabilistic early refresh, locks).

**Database scaling:** read replicas, partitioning, CQRS read models — not all writes can scale horizontally easily.

**CDN** for static and cacheable APIs — cache keys and TTL discipline.`,

  80: `**CAP / PACELC:** choose CP vs AP per operation — not one global switch; payment auth vs social feed differ.

**BASE** — basically available, soft state, eventual consistency — explain with real user impact.

**Distributed transactions** — 2PC rare at scale; sagas + outbox + idempotency standard pattern.

**Clocks:** wall clock untrustworthy; use logical clocks / version vectors where ordering matters.`,

  81: `**Idempotency keys** and dedupe stores — at-least-once delivery safe retries.

**Leader election** — consensus (Raft) for control plane; avoid homegrown locks on weak storage.

**Gossip protocols** — membership and failure detection; scalability vs convergence delay.

**Quorum reads/writes** — tune R+W > N for desired consistency; understand sloppy quorum in Dynamo-style.`,

  82: `**Threat modeling** — STRIDE per component; trust boundaries at ingress and data stores.

**AuthZ models:** RBAC, ABAC, ReBAC — OAuth scopes vs fine policy engines (OPA).

**Data protection:** classify PII; minimize retention; encryption + key rotation; audit access.

**Supply chain:** signed artifacts, provenance (SLSA), dependency pinning — executive-level topic now.`,

  83: `**Observability-driven design** — expose metrics hooks early; trace propagation across sync/async boundaries.

**SLO examples:** p99 < 300ms, availability 99.9% — translate to monthly error budget minutes.

**Load testing:** realistic workloads + chaos — peak multiplier and soak tests find leaks.

**Capacity:** autoscaling signals (CPU vs custom lag) — avoid flapping with cooldowns.`,

  84: `**Architecture decision records (ADRs)** — capture context, decision, consequences; living history beats wiki essays.

**Tradeoff tables** in reviews — latency vs cost vs complexity scored for options A/B/C.

**Progressive disclosure** in interviews — start high level, drill into bottleneck the interviewer chooses.

**Ethics & compliance:** regional data residency, right to erasure — architecture must encode legal constraints.`,
};
