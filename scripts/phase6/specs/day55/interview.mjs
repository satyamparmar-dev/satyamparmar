export default {
  "conceptual": [
    {
      "question": "What is **sync** **request/response** **chaining** between services?",
      "answer": "**Sync** chains **block** the **caller** until **downstream** **finishes**, multiplying **latency** **variance** and **failure** **probability** along the **path**. Close with **prevention**: **contract** tests for **clients**, **SLO** alerts on **client-side** **error** rates, **game** days that **kill** **pods** during **business** hours in **staging**, and **lint** rules banning **blocking** calls on **reactor** threads."
    },
    {
      "question": "What is **async** **choreography** with **events**?",
      "answer": "Services **publish** **facts** to a **broker**; **consumers** **react** **without** **central** **orchestrator**. **Ordering** and **idempotency** **requirements** **dominate** **design**. Interviewers reward naming **metrics** (`http_client_requests_seconds`, `resilience4j_circuitbreaker_state`), **trace** correlation IDs, and **rollback** criteria rather than hand-wavy resilience claims. Tie answers to **Spring** reality: **Feign** + **LoadBalancer**, **WebClient** + **`ExchangeFilterFunction`**, **Resilience4j** registries, and **Micrometer** tags that make **on-call** searches fast."
    },
    {
      "question": "When pick **orchestrated** **Saga** vs **choreography**?",
      "answer": "**Orchestration** gives **clear** **central** **state** **machine**; **choreography** **scales** **ownership** but **debugging** **cross-service** **flows** is **harder**. Close with **prevention**: **contract** tests for **clients**, **SLO** alerts on **client-side** **error** rates, **game** days that **kill** **pods** during **business** hours in **staging**, and **lint** rules banning **blocking** calls on **reactor** threads."
    },
    {
      "question": "What is **outbox** **pattern**?",
      "answer": "Write **business** **data** and **outbox** **event** **row** in **one** **DB** **transaction**, then **relay** **to** **broker** **reliably**. Senior answers separate **symptom** from **root** **cause**: **502** at **edge** can be **empty** **Endpoints**, **stale** **pool**, or **upstream** **panic**—each needs different **first** **commands**. Call out **ownership**: **platform** **SRE** for **mesh**/**certs**, **service** teams for **timeout** policy, **SRE** for **SLO** **burn** **alerts**—and how those teams **coordinate** during **sev-1** calls."
    },
    {
      "question": "How does **message** **broker** **choice** affect **patterns**?",
      "answer": "**Kafka** **log** **semantics** differ from **Rabbit** **queues**—**ordering**, **replay**, and **consumer** **groups** **change** **design**. Reference **security**: **mTLS** **service** identity, **OAuth2** **scopes**, **audit** logs at **edge**, and why **secrets** never belong in **Feign** **URL** query strings. Contrast **happy** **path** docs with **partition** behavior: **split** **retries**, **half-open** **probes**, **degraded** **read** modes, and **idempotency** keys that prevent **duplicate** **writes**."
    },
    {
      "question": "What is **temporal** **coupling**?",
      "answer": "Services **must** **be** **up** **together** for **sync** **flow** **to** **complete**—**async** **decouples** **availability** **windows**. Mention **verification**: **`curl -v`** through **gateway**, **`kubectl logs`**, **APM** **waterfall** **spans**, and **dashboards** that slice **p99** by **downstream** **service** **name**. Senior answers separate **symptom** from **root** **cause**: **502** at **edge** can be **empty** **Endpoints**, **stale** **pool**, or **upstream** **panic**—each needs different **first** **commands**."
    },
    {
      "question": "Explain **event** **envelope** **basics**.",
      "answer": "Include **event** **id**, **type**, **schema** **version**, **timestamp**, **correlation** **id**, and **payload** **hash** **for** **dedup**. Close with **prevention**: **contract** tests for **clients**, **SLO** alerts on **client-side** **error** rates, **game** days that **kill** **pods** during **business** hours in **staging**, and **lint** rules banning **blocking** calls on **reactor** threads."
    },
    {
      "question": "What is **idempotent** **consumer**?",
      "answer": "Processing **same** **event** **twice** **must** **not** **double** **apply** **effects**—use **natural** **keys** or **store** **processed** **ids**. Contrast **happy** **path** docs with **partition** behavior: **split** **retries**, **half-open** **probes**, **degraded** **read** modes, and **idempotency** keys that prevent **duplicate** **writes**. Mention **verification**: **`curl -v`** through **gateway**, **`kubectl logs`**, **APM** **waterfall** **spans**, and **dashboards** that slice **p99** by **downstream** **service** **name**."
    },
    {
      "question": "How do **timeouts** differ in **async** **world**?",
      "answer": "**Consumers** **still** **need** **processing** **deadlines**; **DLQ** **policies** **handle** **poison** **messages**. Call out **ownership**: **platform** **SRE** for **mesh**/**certs**, **service** teams for **timeout** policy, **SRE** for **SLO** **burn** **alerts**—and how those teams **coordinate** during **sev-1** calls. Interviewers reward naming **metrics** (`http_client_requests_seconds`, `resilience4j_circuitbreaker_state`), **trace** correlation IDs, and **rollback** criteria rather than hand-wavy resilience claims."
    },
    {
      "question": "What is **BFF** role in **communication** **topology**?",
      "answer": "**BFF** **aggregates** **sync** **calls** **for** **UI**, **hiding** **chattiness** **from** **mobile** **clients**. Explain **second-order** effects: **retry** amplification, **queue** growth, **thread** **pool** exhaustion, and **cost** of extra **hops** when **edge** dependencies like **Redis** rate-limit stores fail. Close with **prevention**: **contract** tests for **clients**, **SLO** alerts on **client-side** **error** rates, **game** days that **kill** **pods** during **business** hours in **staging**, and **lint** rules banning **blocking** calls on **reactor** threads."
    },
    {
      "question": "What is **dead** **letter** **queue** **for**?",
      "answer": "**Isolate** **messages** **that** **fail** **after** **retries** for **manual** **replay** or **bug** **fixes**. When **Kubernetes** is involved, cite **readiness**, **HPA**, **NetworkPolicy**, and **Service** **DNS** as factors that change **latency** independent of **Java** **code**. For **gateway** and **service** stacks, emphasize **timeout** ordering (**outer > inner**), **bulkheads** per **tenant**, and **JWT** **cache** **TTL** during **issuer** rotations."
    },
    {
      "question": "Compare **at-least-once** vs **exactly-once** **processing**.",
      "answer": "**At-least-once** **needs** **idempotency**; **exactly-once** **is** **expensive** and **often** **approximated** **with** **transactions** **+** **offsets**. Contrast **happy** **path** docs with **partition** behavior: **split** **retries**, **half-open** **probes**, **degraded** **read** modes, and **idempotency** keys that prevent **duplicate** **writes**. Mention **verification**: **`curl -v`** through **gateway**, **`kubectl logs`**, **APM** **waterfall** **spans**, and **dashboards** that slice **p99** by **downstream** **service** **name**."
    },
    {
      "question": "What is **API** **composition** **vs** **event** **composition**?",
      "answer": "**API** **composition** **happens** **in** **process** **request** **path**; **event** **composition** **materializes** **read** **models** **over** **time**. Tie answers to **Spring** reality: **Feign** + **LoadBalancer**, **WebClient** + **`ExchangeFilterFunction`**, **Resilience4j** registries, and **Micrometer** tags that make **on-call** searches fast. Explain **second-order** effects: **retry** amplification, **queue** growth, **thread** **pool** exhaustion, and **cost** of extra **hops** when **edge** dependencies like **Redis** rate-limit stores fail."
    },
    {
      "question": "How does **backpressure** appear in **Kafka** **consumers**?",
      "answer": "**Poll** **loop** **pause**/**resume** or **reduce** **max.poll.records** so **downstream** **keeps** **up**. Contrast **happy** **path** docs with **partition** behavior: **split** **retries**, **half-open** **probes**, **degraded** **read** modes, and **idempotency** keys that prevent **duplicate** **writes**. Mention **verification**: **`curl -v`** through **gateway**, **`kubectl logs`**, **APM** **waterfall** **spans**, and **dashboards** that slice **p99** by **downstream** **service** **name**."
    },
    {
      "question": "What **smell** indicates **sync** **overuse**?",
      "answer": "**Deep** **call** **graphs** **with** **identical** **timeout** **budget** **spent** **multiple** **times** **per** **user** **click**. Interviewers reward naming **metrics** (`http_client_requests_seconds`, `resilience4j_circuitbreaker_state`), **trace** correlation IDs, and **rollback** criteria rather than hand-wavy resilience claims. Tie answers to **Spring** reality: **Feign** + **LoadBalancer**, **WebClient** + **`ExchangeFilterFunction`**, **Resilience4j** registries, and **Micrometer** tags that make **on-call** searches fast."
    },
    {
      "question": "Compare **sync HTTP** vs **async messaging** for **checkout → inventory** notification.",
      "answer": "**Sync**: simpler mental model, immediate failure visible to user, couples availability and latency. **Async**: decouples peaks, enables retries and dead-letter handling, but needs **idempotent consumers** and UX for eventual consistency. Many systems use sync for the user-facing commit and async for downstream fan-out."
    },
    {
      "question": "What is **message deduplication** and where is state stored?",
      "answer": "Consumers may see duplicates (at-least-once delivery). Store **processed message ids** (DB unique constraint or Redis SET with TTL) to skip replays. Design handlers **idempotent** so duplicates are harmless even if the dedup layer fails."
    }
  ],
  "codeBased": [
    {
      "question": "Spring **`@KafkaListener`** sketch",
      "answer": "// @KafkaListener(topics = \"orders\", groupId = \"payments\")\n// void onMessage(String payload, @Header(KafkaHeaders.RECEIVED_KEY) String key)"
    },
    {
      "question": "**RabbitTemplate** send",
      "answer": "// rabbitTemplate.convertAndSend(\"orders.exchange\", \"order.placed\", event);"
    },
    {
      "question": "**Transactional** **outbox** **entity** fields",
      "answer": "// UUID id; String aggregateId; String type; String payload; Instant created; boolean published;"
    },
    {
      "question": "**WebClient** **chain** **flatMap** (reactive)",
      "answer": "// a.then(b).then(c) // still couples latency—prefer events for side paths"
    },
    {
      "question": "**Saga** **orchestrator** pseudo-interface",
      "answer": "// void onInventoryReserved(); void onPaymentFailedCompensate();"
    },
    {
      "question": "**CloudEvents** **type** attribute",
      "answer": "// ce-type: com.example.order.placed.v1"
    },
    {
      "question": "**Kafka** **consumer** **idempotent** **store**",
      "answer": "// INSERT processed_event_id ... ON CONFLICT DO NOTHING"
    },
    {
      "question": "**RestTemplate** **callback** **URL** anti-pattern note",
      "answer": "// Callbacks tie services—prefer events or polling contracts"
    },
    {
      "question": "**SQS** **visibility** **timeout** comment",
      "answer": "// Must exceed max processing time or duplicate delivery risk"
    },
    {
      "question": "**Partition** **key** choice",
      "answer": "// Use orderId so related events stay ordered per aggregate"
    },
    {
      "question": "Why use **dead-letter queue (DLQ)** with a message broker?",
      "answer": "Poison messages that always fail would block processing or infinite-retry. After N attempts, move to DLQ for **manual inspection**, fix, and replay. Alert on DLQ depth. Include original headers and error reason in DLQ metadata."
    },
    {
      "question": "How does **outbox pattern** relate DB transaction and event publish?",
      "answer": "Write business row and **outbox row** in the **same** DB transaction. A separate **publisher** reads outbox and pushes to broker, then marks published. This avoids “DB committed but message lost” or “message sent but DB rolled back”."
    }
  ],
  "seniorScenario": [
    {
      "question": "**Incident:** **Kafka** **consumer** **lag** **hours** after **deploy**.",
      "answer": "**(1) Immediate response** Pause **traffic** **canary**; **scale** **consumers**.\n\n**(2) Root cause** **Slow** **DB** **migration** **or** **poison** **batch**.\n\n**(3) Fix** **Fix** **query**; **skip** **bad** **offsets** **to** **DLQ**; **replay**.\n\n**(4) Prevention** **SLO** on **lag** **with** **burn** **alerts**. When **Kubernetes** is involved, cite **readiness**, **HPA**, **NetworkPolicy**, and **Service** **DNS** as factors that change **latency** independent of **Java** **code**. For **gateway** and **service** stacks, emphasize **timeout** ordering (**outer > inner**), **bulkheads** per **tenant**, and **JWT** **cache** **TTL** during **issuer** rotations. Communicate **executive**-friendly **impact**: **customer** **minutes** degraded, **error** **budget** burn, **mitigation** **ETA**, and **post-incident** **themes** mapped to **roadmap** work. Reference **security**: **mTLS** **service** identity, **OAuth2** **scopes**, **audit** logs at **edge**, and why **secrets** never belong in **Feign** **URL** query strings. Contrast **happy** **path** docs with **partition** behavior: **split** **retries**, **half-open** **probes**, **degraded** **read** modes, and **idempotency** keys that prevent **duplicate** **writes**. Mention **verification**: **`curl -v`** through **gateway**, **`kubectl logs`**, **APM** **waterfall** **spans**, and **dashboards** that slice **p99** by **downstream** **service** **name**."
    },
    {
      "question": "**Design:** **Checkout** **must** **reserve** **inventory** **and** **charge** **card**.",
      "answer": "**(1) Immediate response** Compare **sync** **REST** **chain** vs **Saga**.\n\n**(2) Root cause** **Tight** **coupling** **risk** **vs** **complex** **compensation**.\n\n**(3) Fix** Use **outbox** **events** **+** **orchestrator** **or** **choreography** **with** **clear** **state** **table**.\n\n**(4) Prevention** **E2E** **tests** **for** **failure** **injections**. Mention **verification**: **`curl -v`** through **gateway**, **`kubectl logs`**, **APM** **waterfall** **spans**, and **dashboards** that slice **p99** by **downstream** **service** **name**. Senior answers separate **symptom** from **root** **cause**: **502** at **edge** can be **empty** **Endpoints**, **stale** **pool**, or **upstream** **panic**—each needs different **first** **commands**. Call out **ownership**: **platform** **SRE** for **mesh**/**certs**, **service** teams for **timeout** policy, **SRE** for **SLO** **burn** **alerts**—and how those teams **coordinate** during **sev-1** calls. Interviewers reward naming **metrics** (`http_client_requests_seconds`, `resilience4j_circuitbreaker_state`), **trace** correlation IDs, and **rollback** criteria rather than hand-wavy resilience claims. Tie answers to **Spring** reality: **Feign** + **LoadBalancer**, **WebClient** + **`ExchangeFilterFunction`**, **Resilience4j** registries, and **Micrometer** tags that make **on-call** searches fast. Explain **second-order** effects: **retry** amplification, **queue** growth, **thread** **pool** exhaustion, and **cost** of extra **hops** when **edge** dependencies like **Redis** rate-limit stores fail."
    },
    {
      "question": "**Migration:** **RPC** **storm** **between** **fifty** **services**.",
      "answer": "**(1) Immediate response** Introduce **event** **bus** **golden** **path**.\n\n**(2) Root cause** **Mesh** **traffic** **cost** **and** **retry** **storms**.\n\n**(3) Fix** **Strangler** **per** **domain**; **publish** **domain** **events**.\n\n**(4) Prevention** **Dashboards** **per** **topic** **throughput**. Explain **second-order** effects: **retry** amplification, **queue** growth, **thread** **pool** exhaustion, and **cost** of extra **hops** when **edge** dependencies like **Redis** rate-limit stores fail. Close with **prevention**: **contract** tests for **clients**, **SLO** alerts on **client-side** **error** rates, **game** days that **kill** **pods** during **business** hours in **staging**, and **lint** rules banning **blocking** calls on **reactor** threads. When **Kubernetes** is involved, cite **readiness**, **HPA**, **NetworkPolicy**, and **Service** **DNS** as factors that change **latency** independent of **Java** **code**. For **gateway** and **service** stacks, emphasize **timeout** ordering (**outer > inner**), **bulkheads** per **tenant**, and **JWT** **cache** **TTL** during **issuer** rotations. Communicate **executive**-friendly **impact**: **customer** **minutes** degraded, **error** **budget** burn, **mitigation** **ETA**, and **post-incident** **themes** mapped to **roadmap** work. Reference **security**: **mTLS** **service** identity, **OAuth2** **scopes**, **audit** logs at **edge**, and why **secrets** never belong in **Feign** **URL** query strings."
    },
    {
      "question": "**Bug:** **Duplicate** **shipments** from **at-least-once** **Kafka**.",
      "answer": "**(1) Immediate response** Stop **consumer** **group**; **audit** **ids**.\n\n**(2) Root cause** **Missing** **idempotent** **consumer** **guard**.\n\n**(3) Fix** Add **unique** **constraint** **on** **shipment** **key**.\n\n**(4) Prevention** **Replay** **tests** **with** **duplicate** **delivery**. Reference **security**: **mTLS** **service** identity, **OAuth2** **scopes**, **audit** logs at **edge**, and why **secrets** never belong in **Feign** **URL** query strings. Contrast **happy** **path** docs with **partition** behavior: **split** **retries**, **half-open** **probes**, **degraded** **read** modes, and **idempotency** keys that prevent **duplicate** **writes**. Mention **verification**: **`curl -v`** through **gateway**, **`kubectl logs`**, **APM** **waterfall** **spans**, and **dashboards** that slice **p99** by **downstream** **service** **name**. Senior answers separate **symptom** from **root** **cause**: **502** at **edge** can be **empty** **Endpoints**, **stale** **pool**, or **upstream** **panic**—each needs different **first** **commands**. Call out **ownership**: **platform** **SRE** for **mesh**/**certs**, **service** teams for **timeout** policy, **SRE** for **SLO** **burn** **alerts**—and how those teams **coordinate** during **sev-1** calls. Interviewers reward naming **metrics** (`http_client_requests_seconds`, `resilience4j_circuitbreaker_state`), **trace** correlation IDs, and **rollback** criteria rather than hand-wavy resilience claims."
    },
    {
      "question": "**Ops:** **DLQ** **depth** **growing** **silently**.",
      "answer": "**(1) Immediate response** Page **on-call**; **dashboard** **red**.\n\n**(2) Root cause** **Alert** **missing** **on** **DLQ** **age**.\n\n**(3) Fix** Add **SLO** **on** **oldest** **message** **age**.\n\n**(4) Prevention** **Weekly** **DLQ** **triage** **ritual**. Contrast **happy** **path** docs with **partition** behavior: **split** **retries**, **half-open** **probes**, **degraded** **read** modes, and **idempotency** keys that prevent **duplicate** **writes**. Mention **verification**: **`curl -v`** through **gateway**, **`kubectl logs`**, **APM** **waterfall** **spans**, and **dashboards** that slice **p99** by **downstream** **service** **name**. Senior answers separate **symptom** from **root** **cause**: **502** at **edge** can be **empty** **Endpoints**, **stale** **pool**, or **upstream** **panic**—each needs different **first** **commands**. Call out **ownership**: **platform** **SRE** for **mesh**/**certs**, **service** teams for **timeout** policy, **SRE** for **SLO** **burn** **alerts**—and how those teams **coordinate** during **sev-1** calls. Interviewers reward naming **metrics** (`http_client_requests_seconds`, `resilience4j_circuitbreaker_state`), **trace** correlation IDs, and **rollback** criteria rather than hand-wavy resilience claims. Tie answers to **Spring** reality: **Feign** + **LoadBalancer**, **WebClient** + **`ExchangeFilterFunction`**, **Resilience4j** registries, and **Micrometer** tags that make **on-call** searches fast."
    },
    {
      "question": "**Security:** **event** **payload** **contains** **PII** **cleartext**.",
      "answer": "**(1) Immediate response** **Encrypt** **fields**; **rotate** **keys**.\n\n**(2) Root cause** **Broker** **compromise** **exposes** **data**.\n\n**(3) Fix** **Field-level** **encryption** **+** **topic** **ACLs**.\n\n**(4) Prevention** **Data** **classification** **tags** **on** **schemas**. Close with **prevention**: **contract** tests for **clients**, **SLO** alerts on **client-side** **error** rates, **game** days that **kill** **pods** during **business** hours in **staging**, and **lint** rules banning **blocking** calls on **reactor** threads. When **Kubernetes** is involved, cite **readiness**, **HPA**, **NetworkPolicy**, and **Service** **DNS** as factors that change **latency** independent of **Java** **code**. For **gateway** and **service** stacks, emphasize **timeout** ordering (**outer > inner**), **bulkheads** per **tenant**, and **JWT** **cache** **TTL** during **issuer** rotations. Communicate **executive**-friendly **impact**: **customer** **minutes** degraded, **error** **budget** burn, **mitigation** **ETA**, and **post-incident** **themes** mapped to **roadmap** work. Reference **security**: **mTLS** **service** identity, **OAuth2** **scopes**, **audit** logs at **edge**, and why **secrets** never belong in **Feign** **URL** query strings. Contrast **happy** **path** docs with **partition** behavior: **split** **retries**, **half-open** **probes**, **degraded** **read** modes, and **idempotency** keys that prevent **duplicate** **writes**."
    }
  ],
  "wrongAnswers": [
    "**Async** **means** **no** **timeouts** **needed** — **Correction:** **Consumers** **still** **bound** **work**.",
    "**Kafka** **guarantees** **exactly-once** **everywhere** — **Correction:** **End-to-end** **needs** **app** **design**.",
    "**Outbox** **replaces** **need** for **idempotent** **consumers** — **Correction:** **Relay** **can** **duplicate** **delivery**.",
    "**Choreography** **always** **simpler** than **orchestration** — **Correction:** **Debugging** **cost** **often** **higher**.",
    "**BFF** **should** **call** **twenty** **microservices** **sync** **per** **request** — **Correction:** **Aggregate** **or** **cache** **or** **event** **projections**.",
    "**Events** **never** **need** **versioning** — **Correction:** **Schema** **registry** **and** **compat** **rules** **apply**.",
    "**Sync** **is** **always** **wrong** — **Correction:** **Simple** **reads** **often** **fine** **with** **timeouts**.",
    "**DLQ** **messages** **safe** **to** **delete** **when** **queue** **shrinks** — **Correction:** **Root** **cause** **analysis** **first**."
  ]
};
