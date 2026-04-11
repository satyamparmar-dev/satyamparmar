export default {
  "conceptual": [
    {
      "question": "What is **CQRS**?",
      "answer": "**Command** **Query** **Responsibility** **Segregation** **splits** **write** **models** **from** **read** **models** so each **can** **scale** **and** **evolve** **independently**. Tie answers to **Spring** reality: **Feign** + **LoadBalancer**, **WebClient** + **`ExchangeFilterFunction`**, **Resilience4j** registries, and **Micrometer** tags that make **on-call** searches fast. Explain **second-order** effects: **retry** amplification, **queue** growth, **thread** **pool** exhaustion, and **cost** of extra **hops** when **edge** dependencies like **Redis** rate-limit stores fail."
    },
    {
      "question": "What is **event** **sourcing**?",
      "answer": "Store **state** **as** **append-only** **events** **instead** **of** **only** **current** **row** **snapshot**—**replay** **rebuilds** **state**. Senior answers separate **symptom** from **root** **cause**: **502** at **edge** can be **empty** **Endpoints**, **stale** **pool**, or **upstream** **panic**—each needs different **first** **commands**. Call out **ownership**: **platform** **SRE** for **mesh**/**certs**, **service** teams for **timeout** policy, **SRE** for **SLO** **burn** **alerts**—and how those teams **coordinate** during **sev-1** calls."
    },
    {
      "question": "What is a **projection** **read** **model**?",
      "answer": "A **denormalized** **view** **built** **by** **consuming** **events**—**optimized** **for** **queries**. For **gateway** and **service** stacks, emphasize **timeout** ordering (**outer > inner**), **bulkheads** per **tenant**, and **JWT** **cache** **TTL** during **issuer** rotations. Communicate **executive**-friendly **impact**: **customer** **minutes** degraded, **error** **budget** burn, **mitigation** **ETA**, and **post-incident** **themes** mapped to **roadmap** work."
    },
    {
      "question": "How **CQRS** **without** **event** **sourcing** **looks**?",
      "answer": "Separate **write** **DB** **schema** **from** **read** **DB** **or** **cache** **updated** **synchronously** **or** **async**. Explain **second-order** effects: **retry** amplification, **queue** growth, **thread** **pool** exhaustion, and **cost** of extra **hops** when **edge** dependencies like **Redis** rate-limit stores fail. Close with **prevention**: **contract** tests for **clients**, **SLO** alerts on **client-side** **error** rates, **game** days that **kill** **pods** during **business** hours in **staging**, and **lint** rules banning **blocking** calls on **reactor** threads."
    },
    {
      "question": "What **event** **store** **requirements**?",
      "answer": "**Total** **ordering** **per** **stream**, **immutability**, **versioning**, **snapshot** **support** **optional**. When **Kubernetes** is involved, cite **readiness**, **HPA**, **NetworkPolicy**, and **Service** **DNS** as factors that change **latency** independent of **Java** **code**. For **gateway** and **service** stacks, emphasize **timeout** ordering (**outer > inner**), **bulkheads** per **tenant**, and **JWT** **cache** **TTL** during **issuer** rotations."
    },
    {
      "question": "Explain **optimistic** **concurrency** **on** **aggregates**.",
      "answer": "**Expected** **version** **on** **write** **detects** **conflicts** **when** **two** **commands** **race**. Interviewers reward naming **metrics** (`http_client_requests_seconds`, `resilience4j_circuitbreaker_state`), **trace** correlation IDs, and **rollback** criteria rather than hand-wavy resilience claims. Tie answers to **Spring** reality: **Feign** + **LoadBalancer**, **WebClient** + **`ExchangeFilterFunction`**, **Resilience4j** registries, and **Micrometer** tags that make **on-call** searches fast."
    },
    {
      "question": "What **snapshotting** **solves**?",
      "answer": "**Long** **event** **streams** **slow** **replay**—**snapshots** **truncate** **history** **with** **pointer** **to** **last** **included** **event**. Senior answers separate **symptom** from **root** **cause**: **502** at **edge** can be **empty** **Endpoints**, **stale** **pool**, or **upstream** **panic**—each needs different **first** **commands**. Call out **ownership**: **platform** **SRE** for **mesh**/**certs**, **service** teams for **timeout** policy, **SRE** for **SLO** **burn** **alerts**—and how those teams **coordinate** during **sev-1** calls."
    },
    {
      "question": "What **is** **event** **upcasting**?",
      "answer": "Transform **old** **event** **payloads** **during** **replay** **to** **new** **schema** **versions**. For **gateway** and **service** stacks, emphasize **timeout** ordering (**outer > inner**), **bulkheads** per **tenant**, and **JWT** **cache** **TTL** during **issuer** rotations. Communicate **executive**-friendly **impact**: **customer** **minutes** degraded, **error** **budget** burn, **mitigation** **ETA**, and **post-incident** **themes** mapped to **roadmap** work."
    },
    {
      "question": "CQRS **complexity** **cost**?",
      "answer": "**Eventual** **consistency** **on** **reads**, **more** **moving** **parts**, **operational** **burden** **for** **projections**. Explain **second-order** effects: **retry** amplification, **queue** growth, **thread** **pool** exhaustion, and **cost** of extra **hops** when **edge** dependencies like **Redis** rate-limit stores fail. Close with **prevention**: **contract** tests for **clients**, **SLO** alerts on **client-side** **error** rates, **game** days that **kill** **pods** during **business** hours in **staging**, and **lint** rules banning **blocking** calls on **reactor** threads."
    },
    {
      "question": "How **handle** **personal** **data** **in** **event** **log**?",
      "answer": "**Encryption**, **redaction** **strategies**, **legal** **holds**—**immutable** **log** **complicates** **GDPR** **deletion**. Call out **ownership**: **platform** **SRE** for **mesh**/**certs**, **service** teams for **timeout** policy, **SRE** for **SLO** **burn** **alerts**—and how those teams **coordinate** during **sev-1** calls. Interviewers reward naming **metrics** (`http_client_requests_seconds`, `resilience4j_circuitbreaker_state`), **trace** correlation IDs, and **rollback** criteria rather than hand-wavy resilience claims."
    },
    {
      "question": "What **read** **side** **failure** **modes**?",
      "answer": "**Stale** **projection** **lag**, **wrong** **handler** **ordering**, **duplicate** **processing**. Tie answers to **Spring** reality: **Feign** + **LoadBalancer**, **WebClient** + **`ExchangeFilterFunction`**, **Resilience4j** registries, and **Micrometer** tags that make **on-call** searches fast. Explain **second-order** effects: **retry** amplification, **queue** growth, **thread** **pool** exhaustion, and **cost** of extra **hops** when **edge** dependencies like **Redis** rate-limit stores fail."
    },
    {
      "question": "Difference **between** **domain** **event** **and** **integration** **event**?",
      "answer": "**Domain** **events** **internal** **to** **BC**; **integration** **events** **cross** **service** **boundary** **with** **public** **contract**. Interviewers reward naming **metrics** (`http_client_requests_seconds`, `resilience4j_circuitbreaker_state`), **trace** correlation IDs, and **rollback** criteria rather than hand-wavy resilience claims. Tie answers to **Spring** reality: **Feign** + **LoadBalancer**, **WebClient** + **`ExchangeFilterFunction`**, **Resilience4j** registries, and **Micrometer** tags that make **on-call** searches fast."
    },
    {
      "question": "What **testing** **replay**?",
      "answer": "**Given** **event** **list**, **assert** **final** **projection** **state**—**golden** **fixtures**. Explain **second-order** effects: **retry** amplification, **queue** growth, **thread** **pool** exhaustion, and **cost** of extra **hops** when **edge** dependencies like **Redis** rate-limit stores fail. Close with **prevention**: **contract** tests for **clients**, **SLO** alerts on **client-side** **error** rates, **game** days that **kill** **pods** during **business** hours in **staging**, and **lint** rules banning **blocking** calls on **reactor** threads."
    },
    {
      "question": "How **Axon** /**EventStore** **fit**?",
      "answer": "**Frameworks** **provide** **aggregates**, **event** **bus**, **projection** **processors**—still **need** **domain** **discipline**. Communicate **executive**-friendly **impact**: **customer** **minutes** degraded, **error** **budget** burn, **mitigation** **ETA**, and **post-incident** **themes** mapped to **roadmap** work. Reference **security**: **mTLS** **service** identity, **OAuth2** **scopes**, **audit** logs at **edge**, and why **secrets** never belong in **Feign** **URL** query strings."
    },
    {
      "question": "When **avoid** **event** **sourcing**?",
      "answer": "**Simple** **CRUD** **with** **no** **audit** **or** **time-travel** **requirements** **rarely** **justify** **cost**. Close with **prevention**: **contract** tests for **clients**, **SLO** alerts on **client-side** **error** rates, **game** days that **kill** **pods** during **business** hours in **staging**, and **lint** rules banning **blocking** calls on **reactor** threads. When **Kubernetes** is involved, cite **readiness**, **HPA**, **NetworkPolicy**, and **Service** **DNS** as factors that change **latency** independent of **Java** **code**."
    },
    {
      "question": "What problem does **CQRS** solve, and what cost do you accept?",
      "answer": "Separates **write model** (commands, invariants) from **read model** (denormalized projections). Improves read scaling and shapes data for UIs. Cost: **eventual consistency** between write and read sides, more moving parts, and careful projection versioning."
    },
    {
      "question": "How does **event sourcing** differ from “store latest row only”?",
      "answer": "**Event sourcing** stores the **append-only event stream** as source of truth; current state is a **fold** of events (optionally cached via snapshots). Enables audit, time travel, and rebuilding projections. Not every CRUD service needs it — use when history and audit are first-class."
    }
  ],
  "codeBased": [
    {
      "question": "**Aggregate** **apply** **method** sketch",
      "answer": "// void apply(OrderPlaced e) { this.total += e.amount; }"
    },
    {
      "question": "**Command** **handler** loads aggregate",
      "answer": "// Order agg = repo.load(id, expectedVersion); agg.ship(); repo.save(agg);"
    },
    {
      "question": "**Projection** **@EventHandler** pseudo",
      "answer": "// on(OrderPlaced e) { jdbc.update(\"insert into order_view ...\"); }"
    },
    {
      "question": "**Kafka** **as** **event** **log** caveat",
      "answer": "// partitions give per-key order, not global total order"
    },
    {
      "question": "**Snapshot** **table** columns",
      "answer": "// aggregate_id, version, payload_bytes, created_at"
    },
    {
      "question": "**Upcaster** **interface** comment",
      "answer": "// EventUpcast from v1 payload to v2 structure"
    },
    {
      "question": "**Spring** **@Transactional** **on** **projection**",
      "answer": "// risk: long TX — prefer idempotent upsert per event"
    },
    {
      "question": "**Debezium** **CDC** **to** **projection**",
      "answer": "// alternative to domain events for read models"
    },
    {
      "question": "**Query** **side** **cache** **invalidation**",
      "answer": "// versioned keys or TTL with lag acceptance"
    },
    {
      "question": "**CloudEvents** **wrap** **domain** **event**",
      "answer": "// attributes + data map to integration boundary"
    },
    {
      "question": "A projection is **behind** the write side. What SLO might you publish to users?",
      "answer": "Example: “search index **< 30s** behind writes p99.” Measure **lag** per partition (event position vs projection cursor). Alert when lag exceeds threshold; scale consumers or optimize handlers before UX suffers."
    },
    {
      "question": "Why must event handlers be **idempotent** when consuming from Kafka?",
      "answer": "**At-least-once** delivery can redeliver after crashes or consumer rebalance. Reprocessing the same offset must not double-apply effects (duplicate charges, duplicate emails). Use idempotency keys or natural keys in the projection store."
    }
  ],
  "seniorScenario": [
    {
      "question": "**Incident:** **read** **model** **shows** **paid** **orders** **as** **pending**.",
      "answer": "**(1) Immediate response** **Freeze** **deploys**; **check** **lag**.\n\n**(2) Root cause** **Projection** **consumer** **stuck** **or** **buggy** **handler**.\n\n**(3) Fix** **Replay** **from** **checkpoint** **or** **rebuild** **view**.\n\n**(4) Prevention** **SLO** on **projection** **freshness**. For **gateway** and **service** stacks, emphasize **timeout** ordering (**outer > inner**), **bulkheads** per **tenant**, and **JWT** **cache** **TTL** during **issuer** rotations. Communicate **executive**-friendly **impact**: **customer** **minutes** degraded, **error** **budget** burn, **mitigation** **ETA**, and **post-incident** **themes** mapped to **roadmap** work. Reference **security**: **mTLS** **service** identity, **OAuth2** **scopes**, **audit** logs at **edge**, and why **secrets** never belong in **Feign** **URL** query strings. Contrast **happy** **path** docs with **partition** behavior: **split** **retries**, **half-open** **probes**, **degraded** **read** modes, and **idempotency** keys that prevent **duplicate** **writes**. Mention **verification**: **`curl -v`** through **gateway**, **`kubectl logs`**, **APM** **waterfall** **spans**, and **dashboards** that slice **p99** by **downstream** **service** **name**. Senior answers separate **symptom** from **root** **cause**: **502** at **edge** can be **empty** **Endpoints**, **stale** **pool**, or **upstream** **panic**—each needs different **first** **commands**."
    },
    {
      "question": "**Design:** **legal** **requires** **10-year** **audit** **trail** **of** **pricing** **changes**.",
      "answer": "**(1) Immediate response** Prefer **event** **sourcing** **for** **price** **aggregate**.\n\n**(2) Root cause** **Mutable** **rows** **overwrite** **history**.\n\n**(3) Fix** **Append-only** **events** **+** **archival** **policy**.\n\n**(4) Prevention** **Compliance** **sign-off** **on** **schema** **changes**. For **gateway** and **service** stacks, emphasize **timeout** ordering (**outer > inner**), **bulkheads** per **tenant**, and **JWT** **cache** **TTL** during **issuer** rotations. Communicate **executive**-friendly **impact**: **customer** **minutes** degraded, **error** **budget** burn, **mitigation** **ETA**, and **post-incident** **themes** mapped to **roadmap** work. Reference **security**: **mTLS** **service** identity, **OAuth2** **scopes**, **audit** logs at **edge**, and why **secrets** never belong in **Feign** **URL** query strings. Contrast **happy** **path** docs with **partition** behavior: **split** **retries**, **half-open** **probes**, **degraded** **read** modes, and **idempotency** keys that prevent **duplicate** **writes**. Mention **verification**: **`curl -v`** through **gateway**, **`kubectl logs`**, **APM** **waterfall** **spans**, and **dashboards** that slice **p99** by **downstream** **service** **name**. Senior answers separate **symptom** from **root** **cause**: **502** at **edge** can be **empty** **Endpoints**, **stale** **pool**, or **upstream** **panic**—each needs different **first** **commands**."
    },
    {
      "question": "**Migration:** **CRUD** **to** **ES** **without** **big** **bang**.",
      "answer": "**(1) Immediate response** **Strangler** **new** **aggregates**.\n\n**(2) Root cause** **Dual** **write** **complexity**.\n\n**(3) Fix** **Capture** **changes** **via** **CDC** **initially**.\n\n**(4) Prevention** **Feature** **flag** **read** **paths**. Reference **security**: **mTLS** **service** identity, **OAuth2** **scopes**, **audit** logs at **edge**, and why **secrets** never belong in **Feign** **URL** query strings. Contrast **happy** **path** docs with **partition** behavior: **split** **retries**, **half-open** **probes**, **degraded** **read** modes, and **idempotency** keys that prevent **duplicate** **writes**. Mention **verification**: **`curl -v`** through **gateway**, **`kubectl logs`**, **APM** **waterfall** **spans**, and **dashboards** that slice **p99** by **downstream** **service** **name**. Senior answers separate **symptom** from **root** **cause**: **502** at **edge** can be **empty** **Endpoints**, **stale** **pool**, or **upstream** **panic**—each needs different **first** **commands**. Call out **ownership**: **platform** **SRE** for **mesh**/**certs**, **service** teams for **timeout** policy, **SRE** for **SLO** **burn** **alerts**—and how those teams **coordinate** during **sev-1** calls. Interviewers reward naming **metrics** (`http_client_requests_seconds`, `resilience4j_circuitbreaker_state`), **trace** correlation IDs, and **rollback** criteria rather than hand-wavy resilience claims."
    },
    {
      "question": "**Performance:** **replay** **takes** **hours** **after** **schema** **change**.",
      "answer": "**(1) Immediate response** **Snapshot** **more** **frequently**.\n\n**(2) Root cause** **Millions** **events** **per** **aggregate** **rare** **but** **deadly**.\n\n**(3) Fix** **Partition** **aggregate** **design**.\n\n**(4) Prevention** **Benchmark** **replay** **in** **CI**. When **Kubernetes** is involved, cite **readiness**, **HPA**, **NetworkPolicy**, and **Service** **DNS** as factors that change **latency** independent of **Java** **code**. For **gateway** and **service** stacks, emphasize **timeout** ordering (**outer > inner**), **bulkheads** per **tenant**, and **JWT** **cache** **TTL** during **issuer** rotations. Communicate **executive**-friendly **impact**: **customer** **minutes** degraded, **error** **budget** burn, **mitigation** **ETA**, and **post-incident** **themes** mapped to **roadmap** work. Reference **security**: **mTLS** **service** identity, **OAuth2** **scopes**, **audit** logs at **edge**, and why **secrets** never belong in **Feign** **URL** query strings. Contrast **happy** **path** docs with **partition** behavior: **split** **retries**, **half-open** **probes**, **degraded** **read** modes, and **idempotency** keys that prevent **duplicate** **writes**. Mention **verification**: **`curl -v`** through **gateway**, **`kubectl logs`**, **APM** **waterfall** **spans**, and **dashboards** that slice **p99** by **downstream** **service** **name**. Senior answers separate **symptom** from **root** **cause**: **502** at **edge** can be **empty** **Endpoints**, **stale** **pool**, or **upstream** **panic**—each needs different **first** **commands**."
    },
    {
      "question": "**Security:** **projection** **exposes** **PII** **from** **events**.",
      "answer": "**(1) Immediate response** **Mask** **fields** **at** **projection** **time**.\n\n**(2) Root cause** **Event** **payload** **too** **rich**.\n\n**(3) Fix** **Field-level** **encryption** **keys** **rotated**.\n\n**(4) Prevention** **Data** **classification** **per** **event** **type**. Communicate **executive**-friendly **impact**: **customer** **minutes** degraded, **error** **budget** burn, **mitigation** **ETA**, and **post-incident** **themes** mapped to **roadmap** work. Reference **security**: **mTLS** **service** identity, **OAuth2** **scopes**, **audit** logs at **edge**, and why **secrets** never belong in **Feign** **URL** query strings. Contrast **happy** **path** docs with **partition** behavior: **split** **retries**, **half-open** **probes**, **degraded** **read** modes, and **idempotency** keys that prevent **duplicate** **writes**. Mention **verification**: **`curl -v`** through **gateway**, **`kubectl logs`**, **APM** **waterfall** **spans**, and **dashboards** that slice **p99** by **downstream** **service** **name**. Senior answers separate **symptom** from **root** **cause**: **502** at **edge** can be **empty** **Endpoints**, **stale** **pool**, or **upstream** **panic**—each needs different **first** **commands**. Call out **ownership**: **platform** **SRE** for **mesh**/**certs**, **service** teams for **timeout** policy, **SRE** for **SLO** **burn** **alerts**—and how those teams **coordinate** during **sev-1** calls."
    },
    {
      "question": "**Conflict:** **two** **commands** **same** **version** **accepted**.",
      "answer": "**(1) Immediate response** **Alert** **data** **team**.\n\n**(2) Root cause** **Lost** **update** **without** **optimistic** **lock**.\n\n**(3) Fix** **Enforce** **expectedVersion** **in** **repository**.\n\n**(4) Prevention** **Property-based** **tests** **for** **concurrency**. Mention **verification**: **`curl -v`** through **gateway**, **`kubectl logs`**, **APM** **waterfall** **spans**, and **dashboards** that slice **p99** by **downstream** **service** **name**. Senior answers separate **symptom** from **root** **cause**: **502** at **edge** can be **empty** **Endpoints**, **stale** **pool**, or **upstream** **panic**—each needs different **first** **commands**. Call out **ownership**: **platform** **SRE** for **mesh**/**certs**, **service** teams for **timeout** policy, **SRE** for **SLO** **burn** **alerts**—and how those teams **coordinate** during **sev-1** calls. Interviewers reward naming **metrics** (`http_client_requests_seconds`, `resilience4j_circuitbreaker_state`), **trace** correlation IDs, and **rollback** criteria rather than hand-wavy resilience claims. Tie answers to **Spring** reality: **Feign** + **LoadBalancer**, **WebClient** + **`ExchangeFilterFunction`**, **Resilience4j** registries, and **Micrometer** tags that make **on-call** searches fast. Explain **second-order** effects: **retry** amplification, **queue** growth, **thread** **pool** exhaustion, and **cost** of extra **hops** when **edge** dependencies like **Redis** rate-limit stores fail."
    }
  ],
  "wrongAnswers": [
    "**CQRS** **requires** **event** **sourcing** — **Correction:** **They** **are** **often** **paired** **but** **not** **mandatory**.",
    "**Projections** **always** **strongly** **consistent** — **Correction:** **Usually** **eventual** **unless** **same** **TX** **rare**.",
    "**Event** **log** **easy** **to** **delete** **user** **data** — **Correction:** **GDPR** **needs** **compensating** **events** **or** **crypto** **shredding**.",
    "**Replay** **always** **free** — **Correction:** **CPU** **and** **time** **cost** **grows** **with** **history**.",
    "**Kafka** **is** **an** **event** **store** **drop-in** — **Correction:** **Different** **guarantees** **than** **ES** **databases**.",
    "**Snapshots** **replace** **events** — **Correction:** **Snapshots** **optimize** **replay** **events** **remain** **source** **of** **truth**.",
    "**One** **projection** **table** **per** **service** **always** — **Correction:** **Many** **read** **models** **possible**.",
    "**Commands** **should** **embed** **full** **read** **DTO** — **Correction:** **Commands** **carry** **intent** **minimal** **data**."
  ]
};
