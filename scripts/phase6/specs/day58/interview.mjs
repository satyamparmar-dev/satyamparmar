export default {
  "conceptual": [
    {
      "question": "What is the **Strangler** **Fig** **pattern**?",
      "answer": "Incrementally **route** **traffic** **from** **legacy** **to** **new** **services** until **the** **old** **system** **can** **be** **retired**—**like** **vines** **replacing** **a** **tree**. Explain **second-order** effects: **retry** amplification, **queue** growth, **thread** **pool** exhaustion, and **cost** of extra **hops** when **edge** dependencies like **Redis** rate-limit stores fail. Close with **prevention**: **contract** tests for **clients**, **SLO** alerts on **client-side** **error** rates, **game** days that **kill** **pods** during **business** hours in **staging**, and **lint** rules banning **blocking** calls on **reactor** threads."
    },
    {
      "question": "What is an **Anti-Corruption** **Layer** **(ACL)**?",
      "answer": "A **translation** **boundary** **that** **maps** **foreign** **models** **to** **your** **domain** **so** **legacy** **concepts** **do** **not** **leak** **in**. Communicate **executive**-friendly **impact**: **customer** **minutes** degraded, **error** **budget** burn, **mitigation** **ETA**, and **post-incident** **themes** mapped to **roadmap** work. Reference **security**: **mTLS** **service** identity, **OAuth2** **scopes**, **audit** logs at **edge**, and why **secrets** never belong in **Feign** **URL** query strings."
    },
    {
      "question": "How **route** **traffic** **in** **Strangler**?",
      "answer": "**Feature** **flags**, **proxy** **rules**, **API** **gateway** **percentage** **splits**, **URL** **prefix** **migrations**. Close with **prevention**: **contract** tests for **clients**, **SLO** alerts on **client-side** **error** rates, **game** days that **kill** **pods** during **business** hours in **staging**, and **lint** rules banning **blocking** calls on **reactor** threads. When **Kubernetes** is involved, cite **readiness**, **HPA**, **NetworkPolicy**, and **Service** **DNS** as factors that change **latency** independent of **Java** **code**."
    },
    {
      "question": "What **data** **sync** **strategies** **during** **strangle**?",
      "answer": "**Dual** **write**, **CDC**, **batch** **ETL**, **event** **carried** **state** **transfer**—each **has** **consistency** **trade-offs**. Contrast **happy** **path** docs with **partition** behavior: **split** **retries**, **half-open** **probes**, **degraded** **read** modes, and **idempotency** keys that prevent **duplicate** **writes**. Mention **verification**: **`curl -v`** through **gateway**, **`kubectl logs`**, **APM** **waterfall** **spans**, and **dashboards** that slice **p99** by **downstream** **service** **name**."
    },
    {
      "question": "When **ACL** **vs** **shared** **database** **integration**?",
      "answer": "**ACL** **preferred** **when** **models** **diverge**; **shared** **DB** **creates** **tight** **coupling** **hard** **to** **cut**. Call out **ownership**: **platform** **SRE** for **mesh**/**certs**, **service** teams for **timeout** policy, **SRE** for **SLO** **burn** **alerts**—and how those teams **coordinate** during **sev-1** calls. Interviewers reward naming **metrics** (`http_client_requests_seconds`, `resilience4j_circuitbreaker_state`), **trace** correlation IDs, and **rollback** criteria rather than hand-wavy resilience claims."
    },
    {
      "question": "What **metrics** **prove** **strangler** **progress**?",
      "answer": "**Percentage** **requests** **served** **by** **new** **stack**, **error** **rate** **parity**, **latency** **SLO** **match**. Senior answers separate **symptom** from **root** **cause**: **502** at **edge** can be **empty** **Endpoints**, **stale** **pool**, or **upstream** **panic**—each needs different **first** **commands**. Call out **ownership**: **platform** **SRE** for **mesh**/**certs**, **service** teams for **timeout** policy, **SRE** for **SLO** **burn** **alerts**—and how those teams **coordinate** during **sev-1** calls."
    },
    {
      "question": "What **risk** **cutover** **weekend** **big** **bang**?",
      "answer": "**Unknown** **integration** **surprises** **with** **no** **rollback** **ramp**. Tie answers to **Spring** reality: **Feign** + **LoadBalancer**, **WebClient** + **`ExchangeFilterFunction`**, **Resilience4j** registries, and **Micrometer** tags that make **on-call** searches fast. Explain **second-order** effects: **retry** amplification, **queue** growth, **thread** **pool** exhaustion, and **cost** of extra **hops** when **edge** dependencies like **Redis** rate-limit stores fail."
    },
    {
      "question": "How **test** **ACL** **translations**?",
      "answer": "**Contract** **tests** **with** **golden** **fixtures** **from** **legacy** **payloads**. Interviewers reward naming **metrics** (`http_client_requests_seconds`, `resilience4j_circuitbreaker_state`), **trace** correlation IDs, and **rollback** criteria rather than hand-wavy resilience claims. Tie answers to **Spring** reality: **Feign** + **LoadBalancer**, **WebClient** + **`ExchangeFilterFunction`**, **Resilience4j** registries, and **Micrometer** tags that make **on-call** searches fast."
    },
    {
      "question": "What **organizational** **challenge**?",
      "answer": "**Two** **teams** **maintaining** **dual** **systems** **during** **long** **migration**. Senior answers separate **symptom** from **root** **cause**: **502** at **edge** can be **empty** **Endpoints**, **stale** **pool**, or **upstream** **panic**—each needs different **first** **commands**. Call out **ownership**: **platform** **SRE** for **mesh**/**certs**, **service** teams for **timeout** policy, **SRE** for **SLO** **burn** **alerts**—and how those teams **coordinate** during **sev-1** calls."
    },
    {
      "question": "What **security** **during** **strangle**?",
      "answer": "**Consistent** **auth** **at** **edge**; **do** **not** **duplicate** **authz** **logic** **differently** **per** **route** **slice**. Senior answers separate **symptom** from **root** **cause**: **502** at **edge** can be **empty** **Endpoints**, **stale** **pool**, or **upstream** **panic**—each needs different **first** **commands**. Call out **ownership**: **platform** **SRE** for **mesh**/**certs**, **service** teams for **timeout** policy, **SRE** for **SLO** **burn** **alerts**—and how those teams **coordinate** during **sev-1** calls."
    },
    {
      "question": "What **decomposing** **monolith** **by** **domain**?",
      "answer": "Identify **bounded** **contexts**, **strangle** **hottest** **paths** **first** **with** **clear** **ownership**. Interviewers reward naming **metrics** (`http_client_requests_seconds`, `resilience4j_circuitbreaker_state`), **trace** correlation IDs, and **rollback** criteria rather than hand-wavy resilience claims. Tie answers to **Spring** reality: **Feign** + **LoadBalancer**, **WebClient** + **`ExchangeFilterFunction`**, **Resilience4j** registries, and **Micrometer** tags that make **on-call** searches fast."
    },
    {
      "question": "How **handle** **sessions** **during** **routing** **split**?",
      "answer": "**Sticky** **sessions** **or** **central** **session** **store**; **JWT** **stateless** **often** **simpler**. Call out **ownership**: **platform** **SRE** for **mesh**/**certs**, **service** teams for **timeout** policy, **SRE** for **SLO** **burn** **alerts**—and how those teams **coordinate** during **sev-1** calls. Interviewers reward naming **metrics** (`http_client_requests_seconds`, `resilience4j_circuitbreaker_state`), **trace** correlation IDs, and **rollback** criteria rather than hand-wavy resilience claims."
    },
    {
      "question": "What **rollback** **plan**?",
      "answer": "**Toggle** **traffic** **back** **to** **legacy** **with** **feature** **flag** **and** **verify** **data** **reconciliation**. Reference **security**: **mTLS** **service** identity, **OAuth2** **scopes**, **audit** logs at **edge**, and why **secrets** never belong in **Feign** **URL** query strings. Contrast **happy** **path** docs with **partition** behavior: **split** **retries**, **half-open** **probes**, **degraded** **read** modes, and **idempotency** keys that prevent **duplicate** **writes**."
    },
    {
      "question": "What **observability** **across** **old** **and** **new**?",
      "answer": "**Unified** **trace** **ids** **across** **proxy** **hops** **into** **both** **codebases**. Contrast **happy** **path** docs with **partition** behavior: **split** **retries**, **half-open** **probes**, **degraded** **read** modes, and **idempotency** keys that prevent **duplicate** **writes**. Mention **verification**: **`curl -v`** through **gateway**, **`kubectl logs`**, **APM** **waterfall** **spans**, and **dashboards** that slice **p99** by **downstream** **service** **name**."
    },
    {
      "question": "When **stop** **strangler**?",
      "answer": "When **legacy** **handles** **zero** **production** **traffic** **and** **data** **drained** **or** **archived**. For **gateway** and **service** stacks, emphasize **timeout** ordering (**outer > inner**), **bulkheads** per **tenant**, and **JWT** **cache** **TTL** during **issuer** rotations. Communicate **executive**-friendly **impact**: **customer** **minutes** degraded, **error** **budget** burn, **mitigation** **ETA**, and **post-incident** **themes** mapped to **roadmap** work."
    },
    {
      "question": "What is the **Strangler Fig** pattern when retiring a legacy system?",
      "answer": "Incrementally route slices of traffic (by path, tenant, or feature flag) from legacy to new implementation behind a **facade**. Measure parity on errors and latency. Expand the slice as confidence grows until legacy can be decommissioned."
    },
    {
      "question": "What is an **Anti-Corruption Layer (ACL)**?",
      "answer": "A boundary that **translates** foreign/legacy models into your domain model so outdated terminology and shapes do not leak inward. Keeps core domain clean while integrating with ERP, SOAP, or partner APIs."
    }
  ],
  "codeBased": [
    {
      "question": "**Spring** **@Profile(\"legacy\")** bean",
      "answer": "// Route implementation behind interface"
    },
    {
      "question": "**ACL** **mapper** **MapStruct** comment",
      "answer": "// LegacyOrderDTO -> domain.Order"
    },
    {
      "question": "**nginx** **split** **traffic** comment",
      "answer": "// weight=80 legacy; weight=20 new"
    },
    {
      "question": "**Feature** **flag** **pseudo",
      "answer": "// if (flags.useNewPricing()) return newModule.quote();"
    },
    {
      "question": "**Kafka** **CDC** **to** **new** **read** **model**",
      "answer": "// Debezium capture pricing table changes"
    },
    {
      "question": "**API** **gateway** **route** **predicate**",
      "answer": "// Path=/v2/payments/** -> new cluster"
    },
    {
      "question": "**Database** **view** **facade** **anti-pattern** note",
      "answer": "// Thin views still couple schema—prefer ACL service"
    },
    {
      "question": "**Contract** **test** **pact** **provider**",
      "answer": "// verify legacy JSON shapes"
    },
    {
      "question": "**Spring** **RestTemplate** **adapter** **in** **ACL**",
      "answer": "// call legacy HTTP, translate exceptions"
    },
    {
      "question": "**OpenRewrite** **mention** for **Java** **migrations**",
      "answer": "// automated refactor helpers"
    },
    {
      "question": "How can **feature flags** reduce risk during a strangler migration?",
      "answer": "Flags control **percentage rollout**, **per-tenant** enablement, and instant **rollback** without redeploy. Pair with metrics: compare error rate legacy vs new path. Kill switch if new path violates SLO."
    },
    {
      "question": "Give one test you would run for **ACL** correctness.",
      "answer": "**Contract tests** mapping legacy samples to domain objects: table-driven tests with representative legacy payloads (including weird enums and nulls). Assert no unmapped codes leak as raw strings into domain services."
    }
  ],
  "seniorScenario": [
    {
      "question": "**Program:** **5-year** **mainframe** **strangle** **stalled** **at** **30%** **traffic**.",
      "answer": "**(1) Immediate response** **Executive** **review**; **re-scope** **domains**.\n\n**(2) Root cause** **Underestimated** **data** **reconciliation**.\n\n**(3) Fix** **Narrow** **slice** **with** **clear** **ROI**; **hire** **integration** **SMEs**.\n\n**(4) Prevention** **Quarterly** **milestone** **metrics** **on** **dashboard**. Reference **security**: **mTLS** **service** identity, **OAuth2** **scopes**, **audit** logs at **edge**, and why **secrets** never belong in **Feign** **URL** query strings. Contrast **happy** **path** docs with **partition** behavior: **split** **retries**, **half-open** **probes**, **degraded** **read** modes, and **idempotency** keys that prevent **duplicate** **writes**. Mention **verification**: **`curl -v`** through **gateway**, **`kubectl logs`**, **APM** **waterfall** **spans**, and **dashboards** that slice **p99** by **downstream** **service** **name**. Senior answers separate **symptom** from **root** **cause**: **502** at **edge** can be **empty** **Endpoints**, **stale** **pool**, or **upstream** **panic**—each needs different **first** **commands**. Call out **ownership**: **platform** **SRE** for **mesh**/**certs**, **service** teams for **timeout** policy, **SRE** for **SLO** **burn** **alerts**—and how those teams **coordinate** during **sev-1** calls. Interviewers reward naming **metrics** (`http_client_requests_seconds`, `resilience4j_circuitbreaker_state`), **trace** correlation IDs, and **rollback** criteria rather than hand-wavy resilience claims."
    },
    {
      "question": "**Incident:** **ACL** **throws** **on** **new** **legacy** **field** **breaking** **JSON**.",
      "answer": "**(1) Immediate response** **Rollback** **flag**; **add** **tolerant** **parser**.\n\n**(2) Root cause** **Unknown** **field** **policy** **too** **strict**.\n\n**(3) Fix** **Forward-compatible** **DTOs** **ignore** **unknowns**.\n\n**(4) Prevention** **Sample** **production** **payloads** **in** **CI**. Call out **ownership**: **platform** **SRE** for **mesh**/**certs**, **service** teams for **timeout** policy, **SRE** for **SLO** **burn** **alerts**—and how those teams **coordinate** during **sev-1** calls. Interviewers reward naming **metrics** (`http_client_requests_seconds`, `resilience4j_circuitbreaker_state`), **trace** correlation IDs, and **rollback** criteria rather than hand-wavy resilience claims. Tie answers to **Spring** reality: **Feign** + **LoadBalancer**, **WebClient** + **`ExchangeFilterFunction`**, **Resilience4j** registries, and **Micrometer** tags that make **on-call** searches fast. Explain **second-order** effects: **retry** amplification, **queue** growth, **thread** **pool** exhaustion, and **cost** of extra **hops** when **edge** dependencies like **Redis** rate-limit stores fail. Close with **prevention**: **contract** tests for **clients**, **SLO** alerts on **client-side** **error** rates, **game** days that **kill** **pods** during **business** hours in **staging**, and **lint** rules banning **blocking** calls on **reactor** threads. When **Kubernetes** is involved, cite **readiness**, **HPA**, **NetworkPolicy**, and **Service** **DNS** as factors that change **latency** independent of **Java** **code**."
    },
    {
      "question": "**Design:** **shared** **DB** **vs** **ACL** **service** **for** **inventory**.",
      "answer": "**(1) Immediate response** Recommend **ACL** **with** **events**.\n\n**(2) Root cause** **Shared** **DB** **blocks** **team** **autonomy**.\n\n**(3) Fix** **CDC** **out** **to** **new** **service** **read** **model**.\n\n**(4) Prevention** **ADR** **documented** **with** **cost** **estimate**. Interviewers reward naming **metrics** (`http_client_requests_seconds`, `resilience4j_circuitbreaker_state`), **trace** correlation IDs, and **rollback** criteria rather than hand-wavy resilience claims. Tie answers to **Spring** reality: **Feign** + **LoadBalancer**, **WebClient** + **`ExchangeFilterFunction`**, **Resilience4j** registries, and **Micrometer** tags that make **on-call** searches fast. Explain **second-order** effects: **retry** amplification, **queue** growth, **thread** **pool** exhaustion, and **cost** of extra **hops** when **edge** dependencies like **Redis** rate-limit stores fail. Close with **prevention**: **contract** tests for **clients**, **SLO** alerts on **client-side** **error** rates, **game** days that **kill** **pods** during **business** hours in **staging**, and **lint** rules banning **blocking** calls on **reactor** threads. When **Kubernetes** is involved, cite **readiness**, **HPA**, **NetworkPolicy**, and **Service** **DNS** as factors that change **latency** independent of **Java** **code**. For **gateway** and **service** stacks, emphasize **timeout** ordering (**outer > inner**), **bulkheads** per **tenant**, and **JWT** **cache** **TTL** during **issuer** rotations."
    },
    {
      "question": "**Security:** **legacy** **uses** **clear** **passwords** **in** **config**.",
      "answer": "**(1) Immediate response** **Rotate** **secrets**; **vault** **integration**.\n\n**(2) Root cause** **ACL** **copied** **config** **to** **repo**.\n\n**(3) Fix** **Secret** **manager** **+** **audit**.\n\n**(4) Prevention** **Scanner** **blocks** **commits**. Close with **prevention**: **contract** tests for **clients**, **SLO** alerts on **client-side** **error** rates, **game** days that **kill** **pods** during **business** hours in **staging**, and **lint** rules banning **blocking** calls on **reactor** threads. When **Kubernetes** is involved, cite **readiness**, **HPA**, **NetworkPolicy**, and **Service** **DNS** as factors that change **latency** independent of **Java** **code**. For **gateway** and **service** stacks, emphasize **timeout** ordering (**outer > inner**), **bulkheads** per **tenant**, and **JWT** **cache** **TTL** during **issuer** rotations. Communicate **executive**-friendly **impact**: **customer** **minutes** degraded, **error** **budget** burn, **mitigation** **ETA**, and **post-incident** **themes** mapped to **roadmap** work. Reference **security**: **mTLS** **service** identity, **OAuth2** **scopes**, **audit** logs at **edge**, and why **secrets** never belong in **Feign** **URL** query strings. Contrast **happy** **path** docs with **partition** behavior: **split** **retries**, **half-open** **probes**, **degraded** **read** modes, and **idempotency** keys that prevent **duplicate** **writes**."
    },
    {
      "question": "**Scale:** **dual** **write** **overload** **database**.",
      "answer": "**(1) Immediate response** **Throttle** **migration** **jobs**.\n\n**(2) Root cause** **Write** **amplification** **2x**.\n\n**(3) Fix** **Switch** **to** **CDC** **or** **async** **outbox**.\n\n**(4) Prevention** **Capacity** **plan** **before** **cutover**. Interviewers reward naming **metrics** (`http_client_requests_seconds`, `resilience4j_circuitbreaker_state`), **trace** correlation IDs, and **rollback** criteria rather than hand-wavy resilience claims. Tie answers to **Spring** reality: **Feign** + **LoadBalancer**, **WebClient** + **`ExchangeFilterFunction`**, **Resilience4j** registries, and **Micrometer** tags that make **on-call** searches fast. Explain **second-order** effects: **retry** amplification, **queue** growth, **thread** **pool** exhaustion, and **cost** of extra **hops** when **edge** dependencies like **Redis** rate-limit stores fail. Close with **prevention**: **contract** tests for **clients**, **SLO** alerts on **client-side** **error** rates, **game** days that **kill** **pods** during **business** hours in **staging**, and **lint** rules banning **blocking** calls on **reactor** threads. When **Kubernetes** is involved, cite **readiness**, **HPA**, **NetworkPolicy**, and **Service** **DNS** as factors that change **latency** independent of **Java** **code**. For **gateway** and **service** stacks, emphasize **timeout** ordering (**outer > inner**), **bulkheads** per **tenant**, and **JWT** **cache** **TTL** during **issuer** rotations."
    },
    {
      "question": "**Compliance:** **retain** **legacy** **audit** **logs** **10y** **while** **new** **stack** **different** **format**.",
      "answer": "**(1) Immediate response** **Archive** **immutable** **blob** **store**.\n\n**(2) Root cause** **Lost** **chain** **of** **custody** **risk**.\n\n**(3) Fix** **Normalized** **export** **pipeline** **with** **checksums**.\n\n**(4) Prevention** **Legal** **sign-off** **on** **format** **change**. Reference **security**: **mTLS** **service** identity, **OAuth2** **scopes**, **audit** logs at **edge**, and why **secrets** never belong in **Feign** **URL** query strings. Contrast **happy** **path** docs with **partition** behavior: **split** **retries**, **half-open** **probes**, **degraded** **read** modes, and **idempotency** keys that prevent **duplicate** **writes**. Mention **verification**: **`curl -v`** through **gateway**, **`kubectl logs`**, **APM** **waterfall** **spans**, and **dashboards** that slice **p99** by **downstream** **service** **name**. Senior answers separate **symptom** from **root** **cause**: **502** at **edge** can be **empty** **Endpoints**, **stale** **pool**, or **upstream** **panic**—each needs different **first** **commands**. Call out **ownership**: **platform** **SRE** for **mesh**/**certs**, **service** teams for **timeout** policy, **SRE** for **SLO** **burn** **alerts**—and how those teams **coordinate** during **sev-1** calls. Interviewers reward naming **metrics** (`http_client_requests_seconds`, `resilience4j_circuitbreaker_state`), **trace** correlation IDs, and **rollback** criteria rather than hand-wavy resilience claims."
    }
  ],
  "wrongAnswers": [
    "**Strangler** **means** **rewrite** **everything** **first** — **Correction:** **Incremental** **slice** **by** **slice**.",
    "**ACL** **is** **only** **for** **external** **vendors** — **Correction:** **Use** **between** **any** **foreign** **model** **and** **your** **domain**.",
    "**Feature** **flags** **remove** **need** **for** **tests** — **Correction:** **Automate** **checks** **per** **flag** **state**.",
    "**100%** **traffic** **flip** **is** **lowest** **risk** — **Correction:** **Gradual** **ramps** **reduce** **blast** **radius**.",
    "**Shared** **DB** **fastest** **therefore** **best** — **Correction:** **Coupling** **cost** **hits** **later** **hard**.",
    "**ACL** **should** **expose** **legacy** **tables** **directly** — **Correction:** **Translate** **to** **domain** **types**.",
    "**Strangler** **ends** **when** **code** **deleted** **only** — **Correction:** **Data** **and** **observability** **also** **migrate**.",
    "**Monolith** **always** **bad** — **Correction:** **Right** **size** **for** **team** **and** **scale**."
  ]
};
