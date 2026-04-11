export default {
  "conceptual": [
    {
      "question": "What is **OpenFeign** and how does Spring Cloud integrate it?",
      "answer": "**OpenFeign** is a **declarative** HTTP client: you write a Java **interface** with annotations like **`@GetMapping`** and Spring generates a **proxy** bean at runtime. **Spring Cloud OpenFeign** adds **`@FeignClient`**, **LoadBalancer** integration, **circuit breakers**, **error decoders**, and **request interceptors** so outbound calls behave like **first-class** infrastructure. Call out **ownership**: **platform** **SRE** for **mesh**/**certs**, **service** teams for **timeout** policy, **SRE** for **SLO** **burn** **alerts**—and how those teams **coordinate** during **sev-1** calls."
    },
    {
      "question": "When do you choose **WebClient** over **OpenFeign**?",
      "answer": "**WebClient** is the **reactive** HTTP client in **Spring WebFlux** with **non-blocking** I/O and **backpressure** awareness. Pick it when your service is already on the **reactive** stack or you need **streaming** responses. **Feign** is often simpler for **servlet** apps that are mostly **blocking** but can still use **async** options with care."
    },
    {
      "question": "Explain **Resilience4j** **circuit breaker** states and what moves between them.",
      "answer": "A **circuit breaker** starts **CLOSED** and counts failures in a **sliding window**. When the **failure rate** crosses a **threshold**, it **opens** and **short-circuits** calls to fail fast. After a **wait** interval it enters **HALF_OPEN** to allow **trial** calls; successes **close** it again while failures **re-open** it."
    },
    {
      "question": "Why are **blind retries** dangerous for **POST** in payment flows?",
      "answer": "**POST** is not **idempotent** by default: a **retry** after a **timeout** may execute the **server** **side effect** twice if the first request actually **succeeded** but the **ACK** was lost. Mitigate with **`Idempotency-Key`**, **deduplication** tables, or **safe** **retry** policies on **read-only** operations only. Close with **prevention**: **contract** tests for **clients**, **SLO** alerts on **client-side** **error** rates, **game** days that **kill** **pods** during **business** hours in **staging**, and **lint** rules banning **blocking** calls on **reactor** threads."
    },
    {
      "question": "How should **client timeouts** relate to **gateway** and **upstream** timeouts?",
      "answer": "Timeouts should **nest**: **outer** layers (**gateway**, **LB**) stay **longer** than **inner** **Feign**/**WebClient** timeouts so the **client** fails first with a **clear** error instead of **hanging** until the **edge** gives up. Misaligned stacks create **orphan** work and **duplicate** side effects. Interviewers reward naming **metrics** (`http_client_requests_seconds`, `resilience4j_circuitbreaker_state`), **trace** correlation IDs, and **rollback** criteria rather than hand-wavy resilience claims."
    },
    {
      "question": "What is a **bulkhead** and how does it differ from a **circuit breaker**?",
      "answer": "A **bulkhead** **isolates** **thread** pools or **semaphores** so one **slow** dependency cannot exhaust **all** workers for other calls. A **circuit breaker** **stops** calling a **failing** dependency temporarily. Teams often combine **both**: **bulkhead** limits **concurrency**, **breaker** stops **wasting** attempts during **outages**. Contrast **happy** **path** docs with **partition** behavior: **split** **retries**, **half-open** **probes**, **degraded** **read** modes, and **idempotency** keys that prevent **duplicate** **writes**."
    },
    {
      "question": "What does **Resilience4j Retry** configure besides **maxAttempts**?",
      "answer": "You configure **wait** duration, **exponential** **backoff** with optional **randomization** (**jitter**), which **exceptions** or **HTTP statuses** are **retryable**, and a **max** **total** **time** budget. **Jitter** spreads retries to avoid **thundering herd** when many clients retry together. Mention **verification**: **`curl -v`** through **gateway**, **`kubectl logs`**, **APM** **waterfall** **spans**, and **dashboards** that slice **p99** by **downstream** **service** **name**."
    },
    {
      "question": "How do **Feign ErrorDecoder** and **WebClient** **`onStatus`** differ in purpose?",
      "answer": "**ErrorDecoder** maps **HTTP status** and **body** to **typed** **exceptions** for **Feign** so callers can branch on **domain** errors. **WebClient** **`filter`** or **`onStatus`** hooks let you **translate** **4xx/5xx** into **exceptions** or **fallback** **Mono** values in **reactive** code. Close with **prevention**: **contract** tests for **clients**, **SLO** alerts on **client-side** **error** rates, **game** days that **kill** **pods** during **business** hours in **staging**, and **lint** rules banning **blocking** calls on **reactor** threads."
    },
    {
      "question": "What observability should wrap outbound HTTP clients?",
      "answer": "Emit **Micrometer** timers on **client** **name** and **outcome**, propagate **W3C** **`traceparent`** headers, and log **structured** fields (**uri template**, **status**, **duration**) without **secrets**. **Resilience4j** exposes **circuit breaker** and **retry** **events** for **metrics**. Close with **prevention**: **contract** tests for **clients**, **SLO** alerts on **client-side** **error** rates, **game** days that **kill** **pods** during **business** hours in **staging**, and **lint** rules banning **blocking** calls on **reactor** threads."
    },
    {
      "question": "Why is **connection pool** tuning important for **Feign** under load?",
      "answer": "Each **route** needs enough **connections** to match **expected** **concurrency**; too few causes **queueing** and **timeouts**, too many wastes **file descriptors** and **memory**. Tune **max** **per** **route**, **keep-alive**, and **idle** **eviction** to match **service** **SLO**. Contrast **happy** **path** docs with **partition** behavior: **split** **retries**, **half-open** **probes**, **degraded** **read** modes, and **idempotency** keys that prevent **duplicate** **writes**."
    },
    {
      "question": "What is **TimeLimiter** in Resilience4j and when do you use it?",
      "answer": "**TimeLimiter** bounds how long an **async** or **CompletableFuture**-backed call may run, complementing **HTTP** **read** timeouts. Use it when **thread** **boundaries** cross **executors** or when **blocking** code is wrapped for **reactive** pipelines. Close with **prevention**: **contract** tests for **clients**, **SLO** alerts on **client-side** **error** rates, **game** days that **kill** **pods** during **business** hours in **staging**, and **lint** rules banning **blocking** calls on **reactor** threads."
    },
    {
      "question": "How does **Spring Cloud LoadBalancer** replace legacy **Ribbon** for Feign?",
      "answer": "**Feign** resolves **`lb://serviceId`** through **LoadBalancerClient** backed by **Kubernetes** **discovery** or **Eureka**. **Ribbon** maintenance ended; modern stacks use **Spring Cloud LoadBalancer** with **caching** **TTL** you must tune to avoid **stale** **instances**. Contrast **happy** **path** docs with **partition** behavior: **split** **retries**, **half-open** **probes**, **degraded** **read** modes, and **idempotency** keys that prevent **duplicate** **writes**."
    },
    {
      "question": "What is **graceful degradation** with **fallback** methods?",
      "answer": "When a **breaker** opens or **timeout** hits, return a **cached** **read**, **default** **value**, or **feature** **off** response instead of **hard** **failure**. **FallbackFactory** in Feign can access **Throwable** to **log** **cause** while still **responding**. Communicate **executive**-friendly **impact**: **customer** **minutes** degraded, **error** **budget** burn, **mitigation** **ETA**, and **post-incident** **themes** mapped to **roadmap** work."
    },
    {
      "question": "Why should **reactive** chains avoid **blocking** calls?",
      "answer": "Blocking on a **reactor** **event-loop** thread **stalls** **many** requests. Offload blocking **Feign** to **bounded** **elastic** **schedulers** or prefer **non-blocking** **WebClient** end-to-end. Explain **second-order** effects: **retry** amplification, **queue** growth, **thread** **pool** exhaustion, and **cost** of extra **hops** when **edge** dependencies like **Redis** rate-limit stores fail. Close with **prevention**: **contract** tests for **clients**, **SLO** alerts on **client-side** **error** rates, **game** days that **kill** **pods** during **business** hours in **staging**, and **lint** rules banning **blocking** calls on **reactor** threads."
    },
    {
      "question": "How do **consumer-driven contracts** relate to Feign clients?",
      "answer": "**Pact** or **Spring Cloud Contract** tests verify **provider** responses match **consumer** expectations before **deploy**. They catch **breaking** **JSON** changes that would **fail** **Feign** **decoders** at runtime. Interviewers reward naming **metrics** (`http_client_requests_seconds`, `resilience4j_circuitbreaker_state`), **trace** correlation IDs, and **rollback** criteria rather than hand-wavy resilience claims. Tie answers to **Spring** reality: **Feign** + **LoadBalancer**, **WebClient** + **`ExchangeFilterFunction`**, **Resilience4j** registries, and **Micrometer** tags that make **on-call** searches fast."
    },
    {
      "question": "When pick **WebClient** over **RestTemplate** in new Spring code?",
      "answer": "**WebClient** is non-blocking, fits reactive stacks, and composes filters for metrics and resilience. **RestTemplate** is maintenance mode. For blocking apps, WebClient in `block()` is still acceptable short term — but prefer async end-to-end when load is I/O bound."
    },
    {
      "question": "What does **bulkhead** isolation mean for Feign/WebClient calls?",
      "answer": "Separate thread pools or concurrency limits per downstream so one slow service does not exhaust all worker threads (**cascading failure**). Resilience4j bulkheads + timeouts + circuit breakers work together: fail fast and preserve capacity for healthy deps."
    }
  ],
  "codeBased": [
    {
      "question": "`@FeignClient(name = \"orders\", path = \"/api\")` interface — what does Spring create?",
      "answer": "// @FeignClient(name = \"orders\", path = \"/api\")\n// interface OrderClient {\n//   @GetMapping(\"/{id}\") Order get(@PathVariable String id);\n// }\n// Spring creates a JDK proxy bean; calls go through LoadBalancer + encoder/decoder."
    },
    {
      "question": "Show **WebClient** GET with **uri** template and **retrieve**.",
      "answer": "// webClient.get()\n//   .uri(\"https://api/orders/{id}\", id)\n//   .retrieve()\n//   .bodyToMono(Order.class)\n//   .timeout(Duration.ofSeconds(2));"
    },
    {
      "question": "Resilience4j **`@CircuitBreaker`** annotation pseudo-config.",
      "answer": "// @CircuitBreaker(name = \"payments\", fallbackMethod = \"payFallback\")\n// public Payment pay(Request r) { return client.charge(r); }\n// private Payment payFallback(Request r, Exception e) { return Payment.degraded(); }"
    },
    {
      "question": "**Feign** **`Request.Options`** connect/read timeouts (conceptual).",
      "answer": "// @Bean\n// Request.Options feignOptions() {\n//   return new Request.Options(200, TimeUnit.MILLISECONDS, 1500, TimeUnit.MILLISECONDS, true);\n// }\n// Align read timeout with upstream SLA + margin."
    },
    {
      "question": "**WebClient** **`filter`** adding correlation header.",
      "answer": "// webClient.mutate().filter((req, next) ->\n//   next.exchange(ClientRequest.from(req).header(\"X-Trace-Id\", traceId).build())).build();"
    },
    {
      "question": "**Resilience4j RetryConfig** maxAttempts + intervalFunction.",
      "answer": "// RetryConfig.custom().maxAttempts(3)\n//   .intervalFunction(attempt -> 100L * (long) Math.pow(2, attempt - 1))\n//   .build();"
    },
    {
      "question": "**Bulkhead** registry configuration sketch.",
      "answer": "// BulkheadConfig.custom().maxConcurrentCalls(20).maxWaitDuration(Duration.ofMillis(50)).build();\n// Register per downstream dependency name."
    },
    {
      "question": "**Feign** **`ErrorDecoder`** mapping 404 to custom exception.",
      "answer": "// if (status == 404) return new NotFoundException(methodKey, response);\n// return new Default().decode(methodKey, response);"
    },
    {
      "question": "Micrometer tag **`client_name`** on outbound timer (conceptual).",
      "answer": "// Timer.builder(\"http.client.requests\")\n//   .tag(\"client\", \"payments\")\n//   .tag(\"outcome\", status >= 500 ? \"SERVER_ERROR\" : \"SUCCESS\")\n//   .register(registry);"
    },
    {
      "question": "**WebClient** **`onStatus`** throwing on 5xx.",
      "answer": "// .onStatus(HttpStatusCode::is5xxServerError,\n//   r -> r.bodyToMono(String.class).map(body -> new UpstreamException(body)))"
    },
    {
      "question": "A **circuit breaker** opens after failures. What should happen on the **half-open** state?",
      "answer": "Allow a **small probe** of calls through. Successes close the breaker; failures re-open immediately. Half-open prevents thundering herd while testing recovery. Log half-open transitions and expose metrics (Micrometer) for dashboards."
    },
    {
      "question": "How do you propagate **trace context** across a Feign call?",
      "answer": "Register a **RequestInterceptor** that copies **traceparent** / **b3** headers from the current span (Micrometer Tracing, Brave, OTel). Without this, downstream logs break the trace chain. Verify in integration tests with a test tracer."
    }
  ],
  "seniorScenario": [
    {
      "question": "**Production:** After a **payments** outage, **Feign** clients recover but **p99** stays high everywhere. Diagnose.",
      "answer": "**(1) Immediate response** Open **APM** **service** **map**, check **thread** **pool** **saturation** and **bulkhead** **rejects**, freeze risky **releases**.\n\n**(2) Root cause** **Bulkheads** were too small or **blocking** **fallbacks** exhausted **executor** queues; **retry** storms kept **CPU** hot.\n\n**(3) Fix** 1) Increase **bulkhead** **limits** carefully. 2) Remove **blocking** from **reactive** paths. 3) Add **jitter** to **retries**. 4) Scale **replicas** after **evidence** from **metrics**.\n\n**(4) Prevention** Add **dashboards** for **pool** **depth**, **reject** counts, and **chaos** tests for **dependency** **slowdown**. Call out **ownership**: **platform** **SRE** for **mesh**/**certs**, **service** teams for **timeout** policy, **SRE** for **SLO** **burn** **alerts**—and how those teams **coordinate** during **sev-1** calls. Interviewers reward naming **metrics** (`http_client_requests_seconds`, `resilience4j_circuitbreaker_state`), **trace** correlation IDs, and **rollback** criteria rather than hand-wavy resilience claims. Tie answers to **Spring** reality: **Feign** + **LoadBalancer**, **WebClient** + **`ExchangeFilterFunction`**, **Resilience4j** registries, and **Micrometer** tags that make **on-call** searches fast. Explain **second-order** effects: **retry** amplification, **queue** growth, **thread** **pool** exhaustion, and **cost** of extra **hops** when **edge** dependencies like **Redis** rate-limit stores fail."
    },
    {
      "question": "**Incident:** **429** from partner API — your **Feign** **retry** amplifies rate limit hits.",
      "answer": "**(1) Immediate response** Disable **auto** **retry** on **429**, alert **account** **manager**, switch to **cached** **reads** if safe.\n\n**(2) Root cause** Clients ignore **`Retry-After`** and **hammer** **partner** during **incidents**.\n\n**(3) Fix** Honor **`Retry-After`**, cap **max** **retries**, implement **exponential** **backoff** with **jitter**, negotiate **quota**.\n\n**(4) Prevention** **Contract** tests include **429** path; **SLO** on **partner** **latency** and **quota** **headroom**. For **gateway** and **service** stacks, emphasize **timeout** ordering (**outer > inner**), **bulkheads** per **tenant**, and **JWT** **cache** **TTL** during **issuer** rotations. Communicate **executive**-friendly **impact**: **customer** **minutes** degraded, **error** **budget** burn, **mitigation** **ETA**, and **post-incident** **themes** mapped to **roadmap** work. Reference **security**: **mTLS** **service** identity, **OAuth2** **scopes**, **audit** logs at **edge**, and why **secrets** never belong in **Feign** **URL** query strings. Contrast **happy** **path** docs with **partition** behavior: **split** **retries**, **half-open** **probes**, **degraded** **read** modes, and **idempotency** keys that prevent **duplicate** **writes**. Mention **verification**: **`curl -v`** through **gateway**, **`kubectl logs`**, **APM** **waterfall** **spans**, and **dashboards** that slice **p99** by **downstream** **service** **name**."
    },
    {
      "question": "**Design:** Team wants **synchronous** **Feign** chain **A→B→C** for checkout.",
      "answer": "**(1) Immediate response** Challenge **latency** **budget**; propose **async** **events** for non-critical steps.\n\n**(2) Root cause** Deep **sync** graphs multiply **timeouts** and **failure** **probability**.\n\n**(3) Fix** Introduce **Saga** or **event** for **inventory** **hold**; keep **Feign** for **read** **path** only where needed.\n\n**(4) Prevention** **Architecture** **decision** record documents **max** **chain** **depth**. Contrast **happy** **path** docs with **partition** behavior: **split** **retries**, **half-open** **probes**, **degraded** **read** modes, and **idempotency** keys that prevent **duplicate** **writes**. Mention **verification**: **`curl -v`** through **gateway**, **`kubectl logs`**, **APM** **waterfall** **spans**, and **dashboards** that slice **p99** by **downstream** **service** **name**. Senior answers separate **symptom** from **root** **cause**: **502** at **edge** can be **empty** **Endpoints**, **stale** **pool**, or **upstream** **panic**—each needs different **first** **commands**. Call out **ownership**: **platform** **SRE** for **mesh**/**certs**, **service** teams for **timeout** policy, **SRE** for **SLO** **burn** **alerts**—and how those teams **coordinate** during **sev-1** calls. Interviewers reward naming **metrics** (`http_client_requests_seconds`, `resilience4j_circuitbreaker_state`), **trace** correlation IDs, and **rollback** criteria rather than hand-wavy resilience claims."
    },
    {
      "question": "**Bug:** **Circuit breaker** never opens despite **500** storm.",
      "answer": "**(1) Immediate response** Verify **metric** **window**, **minimum** **number** of calls, and **recordExceptions** configuration.\n\n**(2) Root cause** **Predicate** ignores **wrapped** **exceptions** or **sample** size too small.\n\n**(3) Fix** Fix **recordException** rules, lower **minimum** **calls** for **canary** environments, add **integration** test.\n\n**(4) Prevention** Alert on **zero** **state** **transitions** during **fault** **injection**. Contrast **happy** **path** docs with **partition** behavior: **split** **retries**, **half-open** **probes**, **degraded** **read** modes, and **idempotency** keys that prevent **duplicate** **writes**. Mention **verification**: **`curl -v`** through **gateway**, **`kubectl logs`**, **APM** **waterfall** **spans**, and **dashboards** that slice **p99** by **downstream** **service** **name**. Senior answers separate **symptom** from **root** **cause**: **502** at **edge** can be **empty** **Endpoints**, **stale** **pool**, or **upstream** **panic**—each needs different **first** **commands**. Call out **ownership**: **platform** **SRE** for **mesh**/**certs**, **service** teams for **timeout** policy, **SRE** for **SLO** **burn** **alerts**—and how those teams **coordinate** during **sev-1** calls. Interviewers reward naming **metrics** (`http_client_requests_seconds`, `resilience4j_circuitbreaker_state`), **trace** correlation IDs, and **rollback** criteria rather than hand-wavy resilience claims."
    },
    {
      "question": "**Migration:** Replace **RestTemplate** with **WebClient** in **servlet** app.",
      "answer": "**(1) Immediate response** Run **dual** **write** period with **feature** **flag**, measure **thread** usage.\n\n**(2) Root cause** **Blocking** **`block()`** on **WebClient** gives little benefit; must adopt **async** **controller** or **mvc** + **Callable**.\n\n**(3) Fix** Migrate **hot** paths first; use **`WebClient`** with **`block()`** only as **temporary** bridge with **timeouts**.\n\n**(4) Prevention** **Lint** rule forbids new **RestTemplate** beans. Communicate **executive**-friendly **impact**: **customer** **minutes** degraded, **error** **budget** burn, **mitigation** **ETA**, and **post-incident** **themes** mapped to **roadmap** work. Reference **security**: **mTLS** **service** identity, **OAuth2** **scopes**, **audit** logs at **edge**, and why **secrets** never belong in **Feign** **URL** query strings. Contrast **happy** **path** docs with **partition** behavior: **split** **retries**, **half-open** **probes**, **degraded** **read** modes, and **idempotency** keys that prevent **duplicate** **writes**. Mention **verification**: **`curl -v`** through **gateway**, **`kubectl logs`**, **APM** **waterfall** **spans**, and **dashboards** that slice **p99** by **downstream** **service** **name**. Senior answers separate **symptom** from **root** **cause**: **502** at **edge** can be **empty** **Endpoints**, **stale** **pool**, or **upstream** **panic**—each needs different **first** **commands**."
    },
    {
      "question": "**Security:** **Feign** forwards internal **headers** to **internet** **partner**.",
      "answer": "**(1) Immediate response** Stop traffic, rotate **secrets**, patch **interceptor** list.\n\n**(2) Root cause** **RequestInterceptor** copies **`Authorization`** or **internal** **trace** headers inappropriately.\n\n**(3) Fix** Whitelist **headers** per **client**, use **separate** **Feign** **configurations** for **internal** vs **external**.\n\n**(4) Prevention** **Security** review checklist for every new **FeignClient**. Close with **prevention**: **contract** tests for **clients**, **SLO** alerts on **client-side** **error** rates, **game** days that **kill** **pods** during **business** hours in **staging**, and **lint** rules banning **blocking** calls on **reactor** threads. When **Kubernetes** is involved, cite **readiness**, **HPA**, **NetworkPolicy**, and **Service** **DNS** as factors that change **latency** independent of **Java** **code**. For **gateway** and **service** stacks, emphasize **timeout** ordering (**outer > inner**), **bulkheads** per **tenant**, and **JWT** **cache** **TTL** during **issuer** rotations. Communicate **executive**-friendly **impact**: **customer** **minutes** degraded, **error** **budget** burn, **mitigation** **ETA**, and **post-incident** **themes** mapped to **roadmap** work. Reference **security**: **mTLS** **service** identity, **OAuth2** **scopes**, **audit** logs at **edge**, and why **secrets** never belong in **Feign** **URL** query strings."
    }
  ],
  "wrongAnswers": [
    "**Circuit breakers** should open on the **first** timeout — **Correction:** Breakers need enough **calls** in a **window** to avoid **flapping** on **noise**.",
    "**WebClient** is always **non-blocking** even when you call **`block()`** — **Correction:** **`block()`** is **blocking** and can **starve** threads if misused.",
    "**Retries** are **safe** for all **HTTP** methods — **Correction:** **POST** needs **idempotency** design before **retry**.",
    "**Feign** works without any **HTTP** client implementation — **Correction:** You need **OKHttp**, **Apache HttpClient**, or **default** **JDK** client on **classpath**.",
    "**Bulkhead** and **circuit breaker** are the **same** pattern — **Correction:** **Bulkhead** limits **concurrency**; **breaker** stops calls during **failure** **spikes**.",
    "**Client timeout** should always be **longer** than **server** timeout — **Correction:** Usually **inner** **clients** are **shorter** than **outer** **gateways** so failures **fail** **fast** locally.",
    "**Resilience4j** replaces the need for **upstream** **fixes** — **Correction:** Resilience **contains** damage; **root** **cause** still needs **engineering**.",
    "**OpenFeign** cannot use **Spring** **Security** **OAuth2** tokens — **Correction:** Use **`RequestInterceptor`** or **`OAuth2FeignRequestInterceptor`** patterns to propagate **tokens** safely."
  ]
};
