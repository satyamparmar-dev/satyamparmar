export default {
  "conceptual": [
    {
      "question": "What is a **Saga** **pattern**?",
      "answer": "A **Saga** **splits** a **business** **transaction** into **local** **transactions** with **compensating** **actions** **instead** of **two-phase** **commit** **across** **databases**. For **gateway** and **service** stacks, emphasize **timeout** ordering (**outer > inner**), **bulkheads** per **tenant**, and **JWT** **cache** **TTL** during **issuer** rotations. Communicate **executive**-friendly **impact**: **customer** **minutes** degraded, **error** **budget** burn, **mitigation** **ETA**, and **post-incident** **themes** mapped to **roadmap** work."
    },
    {
      "question": "**Choreography** **Saga** vs **orchestration** **Saga**?",
      "answer": "**Choreography** **uses** **events** **between** **services**; **orchestration** **uses** **central** **coordinator** **issuing** **commands**. For **gateway** and **service** stacks, emphasize **timeout** ordering (**outer > inner**), **bulkheads** per **tenant**, and **JWT** **cache** **TTL** during **issuer** rotations. Communicate **executive**-friendly **impact**: **customer** **minutes** degraded, **error** **budget** burn, **mitigation** **ETA**, and **post-incident** **themes** mapped to **roadmap** work."
    },
    {
      "question": "What is a **compensating** **transaction**?",
      "answer": "A **business** **operation** **that** **semantically** **undoes** **effects** **of** **a** **prior** **forward** **step**—not always **SQL** **ROLLBACK**. When **Kubernetes** is involved, cite **readiness**, **HPA**, **NetworkPolicy**, and **Service** **DNS** as factors that change **latency** independent of **Java** **code**. For **gateway** and **service** stacks, emphasize **timeout** ordering (**outer > inner**), **bulkheads** per **tenant**, and **JWT** **cache** **TTL** during **issuer** rotations."
    },
    {
      "question": "Why not **2PC** **everywhere**?",
      "answer": "**Two-phase** **commit** **locks** **resources** **long** **time**, **hurts** **availability**, **hard** **across** **heterogeneous** **systems**. Tie answers to **Spring** reality: **Feign** + **LoadBalancer**, **WebClient** + **`ExchangeFilterFunction`**, **Resilience4j** registries, and **Micrometer** tags that make **on-call** searches fast. Explain **second-order** effects: **retry** amplification, **queue** growth, **thread** **pool** exhaustion, and **cost** of extra **hops** when **edge** dependencies like **Redis** rate-limit stores fail."
    },
    {
      "question": "What is **pivot** **transaction** in **Saga** **terms**?",
      "answer": "The **step** **after** **which** **the** **workflow** **commits** **forward** **unless** **compensation** **runs**—defines **business** **commit** **point**. Interviewers reward naming **metrics** (`http_client_requests_seconds`, `resilience4j_circuitbreaker_state`), **trace** correlation IDs, and **rollback** criteria rather than hand-wavy resilience claims. Tie answers to **Spring** reality: **Feign** + **LoadBalancer**, **WebClient** + **`ExchangeFilterFunction`**, **Resilience4j** registries, and **Micrometer** tags that make **on-call** searches fast."
    },
    {
      "question": "How handle **compensation** **failure**?",
      "answer": "**Retry** **with** **idempotency**, **manual** **intervention** **queue**, **audit** **trail** **for** **finance** **reconciliation**. Explain **second-order** effects: **retry** amplification, **queue** growth, **thread** **pool** exhaustion, and **cost** of extra **hops** when **edge** dependencies like **Redis** rate-limit stores fail. Close with **prevention**: **contract** tests for **clients**, **SLO** alerts on **client-side** **error** rates, **game** days that **kill** **pods** during **business** hours in **staging**, and **lint** rules banning **blocking** calls on **reactor** threads."
    },
    {
      "question": "What **idempotency** **means** for **compensate** **refund**?",
      "answer": "Calling **refund** **twice** **must** **not** **double** **credit**—**provider** **keys** **help**. Contrast **happy** **path** docs with **partition** behavior: **split** **retries**, **half-open** **probes**, **degraded** **read** modes, and **idempotency** keys that prevent **duplicate** **writes**. Mention **verification**: **`curl -v`** through **gateway**, **`kubectl logs`**, **APM** **waterfall** **spans**, and **dashboards** that slice **p99** by **downstream** **service** **name**."
    },
    {
      "question": "What is **Saga** **log** / **state** **table**?",
      "answer": "**Orchestrator** **persists** **current** **step** **and** **last** **completed** **actions** **for** **crash** **recovery**. Senior answers separate **symptom** from **root** **cause**: **502** at **edge** can be **empty** **Endpoints**, **stale** **pool**, or **upstream** **panic**—each needs different **first** **commands**. Call out **ownership**: **platform** **SRE** for **mesh**/**certs**, **service** teams for **timeout** policy, **SRE** for **SLO** **burn** **alerts**—and how those teams **coordinate** during **sev-1** calls."
    },
    {
      "question": "How **timeouts** interact with **Saga**?",
      "answer": "Each **step** **needs** **deadline**; **on** **timeout** **decide** **retry** **vs** **compensate** **based** **on** **known** **state**. Mention **verification**: **`curl -v`** through **gateway**, **`kubectl logs`**, **APM** **waterfall** **spans**, and **dashboards** that slice **p99** by **downstream** **service** **name**. Senior answers separate **symptom** from **root** **cause**: **502** at **edge** can be **empty** **Endpoints**, **stale** **pool**, or **upstream** **panic**—each needs different **first** **commands**."
    },
    {
      "question": "What **event** **naming** **helps** **Sagas**?",
      "answer": "Past-tense **facts** **like** **PaymentCaptured** **vs** **imperative** **ChargeCard** **commands**—clarity **for** **consumers**. Mention **verification**: **`curl -v`** through **gateway**, **`kubectl logs`**, **APM** **waterfall** **spans**, and **dashboards** that slice **p99** by **downstream** **service** **name**. Senior answers separate **symptom** from **root** **cause**: **502** at **edge** can be **empty** **Endpoints**, **stale** **pool**, or **upstream** **panic**—each needs different **first** **commands**."
    },
    {
      "question": "What **anti-pattern** in **distributed** **transactions**?",
      "answer": "**Distributed** **database** **joins** **across** **services** **pretending** **ACID** **globally**. Reference **security**: **mTLS** **service** identity, **OAuth2** **scopes**, **audit** logs at **edge**, and why **secrets** never belong in **Feign** **URL** query strings. Contrast **happy** **path** docs with **partition** behavior: **split** **retries**, **half-open** **probes**, **degraded** **read** modes, and **idempotency** keys that prevent **duplicate** **writes**."
    },
    {
      "question": "How **Saga** **relates** to **outbox**?",
      "answer": "**Outbox** **ensures** **events** **emit** **reliably** **after** **local** **commit**—**feeds** **Saga** **steps**. When **Kubernetes** is involved, cite **readiness**, **HPA**, **NetworkPolicy**, and **Service** **DNS** as factors that change **latency** independent of **Java** **code**. For **gateway** and **service** stacks, emphasize **timeout** ordering (**outer > inner**), **bulkheads** per **tenant**, and **JWT** **cache** **TTL** during **issuer** rotations."
    },
    {
      "question": "What **testing** **strategy** for **Sagas**?",
      "answer": "**State** **machine** **tests** **with** **injected** **failures** **per** **transition**. Senior answers separate **symptom** from **root** **cause**: **502** at **edge** can be **empty** **Endpoints**, **stale** **pool**, or **upstream** **panic**—each needs different **first** **commands**. Call out **ownership**: **platform** **SRE** for **mesh**/**certs**, **service** teams for **timeout** policy, **SRE** for **SLO** **burn** **alerts**—and how those teams **coordinate** during **sev-1** calls."
    },
    {
      "question": "What **observability** for **Sagas**?",
      "answer": "**Correlation** **id** **per** **saga** **instance**, **metrics** **on** **stuck** **states** **> SLA**. Mention **verification**: **`curl -v`** through **gateway**, **`kubectl logs`**, **APM** **waterfall** **spans**, and **dashboards** that slice **p99** by **downstream** **service** **name**. Senior answers separate **symptom** from **root** **cause**: **502** at **edge** can be **empty** **Endpoints**, **stale** **pool**, or **upstream** **panic**—each needs different **first** **commands**."
    },
    {
      "question": "What **business** **risk** **without** **Saga** **audit**?",
      "answer": "**Finance** **cannot** **reconcile** **partial** **shipments** **with** **failed** **payments**. Call out **ownership**: **platform** **SRE** for **mesh**/**certs**, **service** teams for **timeout** policy, **SRE** for **SLO** **burn** **alerts**—and how those teams **coordinate** during **sev-1** calls. Interviewers reward naming **metrics** (`http_client_requests_seconds`, `resilience4j_circuitbreaker_state`), **trace** correlation IDs, and **rollback** criteria rather than hand-wavy resilience claims."
    },
    {
      "question": "Contrast **2PC** vs **Saga** for distributed transactions.",
      "answer": "**2PC** blocks for global commit — latency and coordinator failure modes hurt availability. **Saga** uses **local transactions + compensations**; no global lock. Choose saga/choreography or orchestration when **long-running** flows cross services and you accept eventual consistency."
    },
    {
      "question": "What is a **compensating transaction**, with an example?",
      "answer": "A business action that **undoes** a prior step in a saga. Example: if **payment** succeeded but **reserve inventory** failed, run **refund payment** compensation. Compensations are domain-specific — not always literal deletes; may be status reversal or credit."
    }
  ],
  "codeBased": [
    {
      "question": "**State** **enum** for **orchestrator**",
      "answer": "// enum Step { RESERVED, PAID, SHIPPED, COMPENSATING }"
    },
    {
      "question": "**Spring** **@Transactional** **local** **step**",
      "answer": "// void reserveInventory() { jdbc.update(...); }"
    },
    {
      "question": "**Compensate** **method** **signature**",
      "answer": "// void releaseInventory(String reservationId);"
    },
    {
      "question": "**Kafka** **command** **topic** pattern",
      "answer": "// saga.commands OrderSaga.CompensatePayment"
    },
    {
      "question": "**Idempotent** **refund** **pseudo**",
      "answer": "// if (!refunds.exists(key)) provider.refund(key);"
    },
    {
      "question": "**Temporal** **workflow** mention",
      "answer": "// Workflow.sleep + signals for long-running saga"
    },
    {
      "question": "**Axon** **@SagaEventHandler** comment",
      "answer": "// reacts to domain events, persists association values"
    },
    {
      "question": "**Database** **row** **lock** **for** **saga** **instance**",
      "answer": "// SELECT ... FOR UPDATE on saga_instance row"
    },
    {
      "question": "**MapStruct** irrelevant—skip",
      "answer": "// compensation DTO mapping from legacy monolith"
    },
    {
      "question": "**Dead** **letter** for **failed** **compensation**",
      "answer": "// publish CompensationFailed event to ops topic"
    },
    {
      "question": "In **choreography**, how do you avoid **lost events** breaking the saga?",
      "answer": "Use **durable broker**, **consumer idempotency**, **retry + DLQ**, and **correlation id** on every message. Observability: trace saga instance across topics. Some teams add a **saga timeout sweeper** that emits compensations for stuck states."
    },
    {
      "question": "When prefer **orchestrated saga** (central coordinator) over **choreography**?",
      "answer": "Complex flows with many branches, human approval steps, or strict ordering visibility — orchestrator (or workflow engine) centralizes state and policies. Choreography scales with loose coupling but can be harder to reason about globally."
    }
  ],
  "seniorScenario": [
    {
      "question": "**Incident:** **inventory** **reserved** but **payment** **failed**—**shipment** **started**.",
      "answer": "**(1) Immediate response** **Stop** **fulfillment**; **freeze** **SKU**.\n\n**(2) Root cause** **Missing** **gate** **between** **steps** **or** **race** **in** **choreography**.\n\n**(3) Fix** **Run** **compensating** **shipment** **cancel** **+** **inventory** **release** **with** **audit**.\n\n**(4) Prevention** **Saga** **state** **table** **with** **explicit** **invariants**. Mention **verification**: **`curl -v`** through **gateway**, **`kubectl logs`**, **APM** **waterfall** **spans**, and **dashboards** that slice **p99** by **downstream** **service** **name**. Senior answers separate **symptom** from **root** **cause**: **502** at **edge** can be **empty** **Endpoints**, **stale** **pool**, or **upstream** **panic**—each needs different **first** **commands**. Call out **ownership**: **platform** **SRE** for **mesh**/**certs**, **service** teams for **timeout** policy, **SRE** for **SLO** **burn** **alerts**—and how those teams **coordinate** during **sev-1** calls. Interviewers reward naming **metrics** (`http_client_requests_seconds`, `resilience4j_circuitbreaker_state`), **trace** correlation IDs, and **rollback** criteria rather than hand-wavy resilience claims. Tie answers to **Spring** reality: **Feign** + **LoadBalancer**, **WebClient** + **`ExchangeFilterFunction`**, **Resilience4j** registries, and **Micrometer** tags that make **on-call** searches fast. Explain **second-order** effects: **retry** amplification, **queue** growth, **thread** **pool** exhaustion, and **cost** of extra **hops** when **edge** dependencies like **Redis** rate-limit stores fail."
    },
    {
      "question": "**Design:** **hotel** **booking** **across** **three** **services**.",
      "answer": "**(1) Immediate response** Pick **orchestrator** **with** **timeouts**.\n\n**(2) Root cause** **Choreography** **hard** **for** **customer** **support** **to** **trace**.\n\n**(3) Fix** **Orchestrated** **Saga** **+** **support** **dashboard**.\n\n**(4) Prevention** **E2E** **tests** **for** **each** **failure** **branch**. Communicate **executive**-friendly **impact**: **customer** **minutes** degraded, **error** **budget** burn, **mitigation** **ETA**, and **post-incident** **themes** mapped to **roadmap** work. Reference **security**: **mTLS** **service** identity, **OAuth2** **scopes**, **audit** logs at **edge**, and why **secrets** never belong in **Feign** **URL** query strings. Contrast **happy** **path** docs with **partition** behavior: **split** **retries**, **half-open** **probes**, **degraded** **read** modes, and **idempotency** keys that prevent **duplicate** **writes**. Mention **verification**: **`curl -v`** through **gateway**, **`kubectl logs`**, **APM** **waterfall** **spans**, and **dashboards** that slice **p99** by **downstream** **service** **name**. Senior answers separate **symptom** from **root** **cause**: **502** at **edge** can be **empty** **Endpoints**, **stale** **pool**, or **upstream** **panic**—each needs different **first** **commands**. Call out **ownership**: **platform** **SRE** for **mesh**/**certs**, **service** teams for **timeout** policy, **SRE** for **SLO** **burn** **alerts**—and how those teams **coordinate** during **sev-1** calls."
    },
    {
      "question": "**Compensation** **fails** **with** **provider** **timeout**.",
      "answer": "**(1) Immediate response** **Retry** **exponential**; **open** **sev** **2**.\n\n**(2) Root cause** **External** **API** **flaky** **during** **peak**.\n\n**(3) Fix** **Persist** **compensation** **job** **with** **next** **run** **time**.\n\n**(4) Prevention** **Partner** **SLA** **playbook**. Call out **ownership**: **platform** **SRE** for **mesh**/**certs**, **service** teams for **timeout** policy, **SRE** for **SLO** **burn** **alerts**—and how those teams **coordinate** during **sev-1** calls. Interviewers reward naming **metrics** (`http_client_requests_seconds`, `resilience4j_circuitbreaker_state`), **trace** correlation IDs, and **rollback** criteria rather than hand-wavy resilience claims. Tie answers to **Spring** reality: **Feign** + **LoadBalancer**, **WebClient** + **`ExchangeFilterFunction`**, **Resilience4j** registries, and **Micrometer** tags that make **on-call** searches fast. Explain **second-order** effects: **retry** amplification, **queue** growth, **thread** **pool** exhaustion, and **cost** of extra **hops** when **edge** dependencies like **Redis** rate-limit stores fail. Close with **prevention**: **contract** tests for **clients**, **SLO** alerts on **client-side** **error** rates, **game** days that **kill** **pods** during **business** hours in **staging**, and **lint** rules banning **blocking** calls on **reactor** threads. When **Kubernetes** is involved, cite **readiness**, **HPA**, **NetworkPolicy**, and **Service** **DNS** as factors that change **latency** independent of **Java** **code**."
    },
    {
      "question": "**Audit:** **finance** **needs** **proof** **of** **refund** **attempts**.",
      "answer": "**(1) Immediate response** Export **immutable** **log**.\n\n**(2) Root cause** **Saga** **logs** **in** **mutable** **tables** **only**.\n\n**(3) Fix** **Append-only** **event** **store** **for** **money** **steps**.\n\n**(4) Prevention** **Quarterly** **reconciliation** **jobs**. Reference **security**: **mTLS** **service** identity, **OAuth2** **scopes**, **audit** logs at **edge**, and why **secrets** never belong in **Feign** **URL** query strings. Contrast **happy** **path** docs with **partition** behavior: **split** **retries**, **half-open** **probes**, **degraded** **read** modes, and **idempotency** keys that prevent **duplicate** **writes**. Mention **verification**: **`curl -v`** through **gateway**, **`kubectl logs`**, **APM** **waterfall** **spans**, and **dashboards** that slice **p99** by **downstream** **service** **name**. Senior answers separate **symptom** from **root** **cause**: **502** at **edge** can be **empty** **Endpoints**, **stale** **pool**, or **upstream** **panic**—each needs different **first** **commands**. Call out **ownership**: **platform** **SRE** for **mesh**/**certs**, **service** teams for **timeout** policy, **SRE** for **SLO** **burn** **alerts**—and how those teams **coordinate** during **sev-1** calls. Interviewers reward naming **metrics** (`http_client_requests_seconds`, `resilience4j_circuitbreaker_state`), **trace** correlation IDs, and **rollback** criteria rather than hand-wavy resilience claims."
    },
    {
      "question": "**Scale:** **10k** **Sagas** **per** **minute** **on** **single** **DB** **orchestrator**.",
      "answer": "**(1) Immediate response** **Shard** **saga** **instances**.\n\n**(2) Root cause** **Lock** **contention** **on** **coordinator** **row**.\n\n**(3) Fix** **Partition** **by** **tenant** **or** **hash**.\n\n**(4) Prevention** **Benchmark** **before** **black** **Friday**. Mention **verification**: **`curl -v`** through **gateway**, **`kubectl logs`**, **APM** **waterfall** **spans**, and **dashboards** that slice **p99** by **downstream** **service** **name**. Senior answers separate **symptom** from **root** **cause**: **502** at **edge** can be **empty** **Endpoints**, **stale** **pool**, or **upstream** **panic**—each needs different **first** **commands**. Call out **ownership**: **platform** **SRE** for **mesh**/**certs**, **service** teams for **timeout** policy, **SRE** for **SLO** **burn** **alerts**—and how those teams **coordinate** during **sev-1** calls. Interviewers reward naming **metrics** (`http_client_requests_seconds`, `resilience4j_circuitbreaker_state`), **trace** correlation IDs, and **rollback** criteria rather than hand-wavy resilience claims. Tie answers to **Spring** reality: **Feign** + **LoadBalancer**, **WebClient** + **`ExchangeFilterFunction`**, **Resilience4j** registries, and **Micrometer** tags that make **on-call** searches fast. Explain **second-order** effects: **retry** amplification, **queue** growth, **thread** **pool** exhaustion, and **cost** of extra **hops** when **edge** dependencies like **Redis** rate-limit stores fail."
    },
    {
      "question": "**Legal:** **compensation** **cannot** **delete** **PII** **already** **shipped** **to** **warehouse**.",
      "answer": "**(1) Immediate response** **Legal** **review**.\n\n**(2) Root cause** **GDPR** **vs** **operational** **data** **retention**.\n\n**(3) Fix** **Anonymize** **where** **possible**; **document** **holds**.\n\n**(4) Prevention** **Policy** **as** **code** **on** **compensation** **paths**. Tie answers to **Spring** reality: **Feign** + **LoadBalancer**, **WebClient** + **`ExchangeFilterFunction`**, **Resilience4j** registries, and **Micrometer** tags that make **on-call** searches fast. Explain **second-order** effects: **retry** amplification, **queue** growth, **thread** **pool** exhaustion, and **cost** of extra **hops** when **edge** dependencies like **Redis** rate-limit stores fail. Close with **prevention**: **contract** tests for **clients**, **SLO** alerts on **client-side** **error** rates, **game** days that **kill** **pods** during **business** hours in **staging**, and **lint** rules banning **blocking** calls on **reactor** threads. When **Kubernetes** is involved, cite **readiness**, **HPA**, **NetworkPolicy**, and **Service** **DNS** as factors that change **latency** independent of **Java** **code**. For **gateway** and **service** stacks, emphasize **timeout** ordering (**outer > inner**), **bulkheads** per **tenant**, and **JWT** **cache** **TTL** during **issuer** rotations. Communicate **executive**-friendly **impact**: **customer** **minutes** degraded, **error** **budget** burn, **mitigation** **ETA**, and **post-incident** **themes** mapped to **roadmap** work."
    }
  ],
  "wrongAnswers": [
    "**Saga** **equals** **2PC** — **Correction:** **Saga** **avoids** **global** **locks** **with** **compensations**.",
    "**Compensating** **always** **means** **SQL** **ROLLBACK** — **Correction:** **Business** **undo** **may** **call** **APIs**.",
    "**Choreography** **needs** **no** **correlation** **id** — **Correction:** **Tracing** **requires** **shared** **ids**.",
    "**Saga** **guarantees** **strong** **consistency** — **Correction:** **Eventual** **consistency** **with** **business** **rules**.",
    "**Orchestrator** **cannot** **fail** — **Correction:** **Must** **persist** **state** **and** **recover**.",
    "**Compensation** **order** **irrelevant** — **Correction:** **Depends** **on** **business** **dependencies**.",
    "**Events** **remove** **need** for **timeouts** — **Correction:** **Each** **step** **still** **bounded**.",
    "**Saga** **only** **for** **payments** — **Correction:** **Any** **multi-step** **cross-service** **workflow**."
  ]
};
