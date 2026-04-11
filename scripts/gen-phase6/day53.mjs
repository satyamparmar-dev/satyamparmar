import { conceptualItem, codeBasedItem, seniorItem, scenarioDrillItem } from './lib.mjs';

const T = 'Feign and WebClient';

const conceptual = [
  conceptualItem(
    'What is **OpenFeign** and how does Spring Cloud integrate it?',
    '**OpenFeign** is a **declarative** HTTP client: you write a Java **interface** with annotations like **`@GetMapping`** and Spring generates a **proxy** bean at runtime. **Spring Cloud OpenFeign** adds **`@FeignClient`**, **LoadBalancer** integration, **circuit breakers**, **error decoders**, and **request interceptors** so outbound calls behave like **first-class** infrastructure.',
    T,
  ),
  conceptualItem(
    'When do you choose **WebClient** over **OpenFeign**?',
    '**WebClient** is the **reactive** HTTP client in **Spring WebFlux** with **non-blocking** I/O and **backpressure** awareness. Pick it when your service is already on the **reactive** stack or you need **streaming** responses. **Feign** is often simpler for **servlet** apps that are mostly **blocking** but can still use **async** options with care.',
    T,
  ),
  conceptualItem(
    'Explain **Resilience4j** **circuit breaker** states and what moves between them.',
    'A **circuit breaker** starts **CLOSED** and counts failures in a **sliding window**. When the **failure rate** crosses a **threshold**, it **opens** and **short-circuits** calls to fail fast. After a **wait** interval it enters **HALF_OPEN** to allow **trial** calls; successes **close** it again while failures **re-open** it.',
    T,
  ),
  conceptualItem(
    'Why are **blind retries** dangerous for **POST** in payment flows?',
    '**POST** is not **idempotent** by default: a **retry** after a **timeout** may execute the **server** **side effect** twice if the first request actually **succeeded** but the **ACK** was lost. Mitigate with **`Idempotency-Key`**, **deduplication** tables, or **safe** **retry** policies on **read-only** operations only.',
    T,
  ),
  conceptualItem(
    'How should **client timeouts** relate to **gateway** and **upstream** timeouts?',
    'Timeouts should **nest**: **outer** layers (**gateway**, **LB**) stay **longer** than **inner** **Feign**/**WebClient** timeouts so the **client** fails first with a **clear** error instead of **hanging** until the **edge** gives up. Misaligned stacks create **orphan** work and **duplicate** side effects.',
    T,
  ),
  conceptualItem(
    'What is a **bulkhead** and how does it differ from a **circuit breaker**?',
    'A **bulkhead** **isolates** **thread** pools or **semaphores** so one **slow** dependency cannot exhaust **all** workers for other calls. A **circuit breaker** **stops** calling a **failing** dependency temporarily. Teams often combine **both**: **bulkhead** limits **concurrency**, **breaker** stops **wasting** attempts during **outages**.',
    T,
  ),
  conceptualItem(
    'What does **Resilience4j Retry** configure besides **maxAttempts**?',
    'You configure **wait** duration, **exponential** **backoff** with optional **randomization** (**jitter**), which **exceptions** or **HTTP statuses** are **retryable**, and a **max** **total** **time** budget. **Jitter** spreads retries to avoid **thundering herd** when many clients retry together.',
    T,
  ),
  conceptualItem(
    'How do **Feign ErrorDecoder** and **WebClient** **`onStatus`** differ in purpose?',
    '**ErrorDecoder** maps **HTTP status** and **body** to **typed** **exceptions** for **Feign** so callers can branch on **domain** errors. **WebClient** **`filter`** or **`onStatus`** hooks let you **translate** **4xx/5xx** into **exceptions** or **fallback** **Mono** values in **reactive** code.',
    T,
  ),
  conceptualItem(
    'What observability should wrap outbound HTTP clients?',
    'Emit **Micrometer** timers on **client** **name** and **outcome**, propagate **W3C** **`traceparent`** headers, and log **structured** fields (**uri template**, **status**, **duration**) without **secrets**. **Resilience4j** exposes **circuit breaker** and **retry** **events** for **metrics**.',
    T,
  ),
  conceptualItem(
    'Why is **connection pool** tuning important for **Feign** under load?',
    'Each **route** needs enough **connections** to match **expected** **concurrency**; too few causes **queueing** and **timeouts**, too many wastes **file descriptors** and **memory**. Tune **max** **per** **route**, **keep-alive**, and **idle** **eviction** to match **service** **SLO**.',
    T,
  ),
  conceptualItem(
    'What is **TimeLimiter** in Resilience4j and when do you use it?',
    '**TimeLimiter** bounds how long an **async** or **CompletableFuture**-backed call may run, complementing **HTTP** **read** timeouts. Use it when **thread** **boundaries** cross **executors** or when **blocking** code is wrapped for **reactive** pipelines.',
    T,
  ),
  conceptualItem(
    'How does **Spring Cloud LoadBalancer** replace legacy **Ribbon** for Feign?',
    '**Feign** resolves **`lb://serviceId`** through **LoadBalancerClient** backed by **Kubernetes** **discovery** or **Eureka**. **Ribbon** maintenance ended; modern stacks use **Spring Cloud LoadBalancer** with **caching** **TTL** you must tune to avoid **stale** **instances**.',
    T,
  ),
  conceptualItem(
    'What is **graceful degradation** with **fallback** methods?',
    'When a **breaker** opens or **timeout** hits, return a **cached** **read**, **default** **value**, or **feature** **off** response instead of **hard** **failure**. **FallbackFactory** in Feign can access **Throwable** to **log** **cause** while still **responding**.',
    T,
  ),
  conceptualItem(
    'Why should **reactive** chains avoid **blocking** calls?',
    'Blocking on a **reactor** **event-loop** thread **stalls** **many** requests. Offload blocking **Feign** to **bounded** **elastic** **schedulers** or prefer **non-blocking** **WebClient** end-to-end.',
    T,
  ),
  conceptualItem(
    'How do **consumer-driven contracts** relate to Feign clients?',
    '**Pact** or **Spring Cloud Contract** tests verify **provider** responses match **consumer** expectations before **deploy**. They catch **breaking** **JSON** changes that would **fail** **Feign** **decoders** at runtime.',
    T,
  ),
];

const codeBased = [
  codeBasedItem(
    '`@FeignClient(name = "orders", path = "/api")` interface — what does Spring create?',
    '// @FeignClient(name = "orders", path = "/api")\n// interface OrderClient {\n//   @GetMapping("/{id}") Order get(@PathVariable String id);\n// }\n// Spring creates a JDK proxy bean; calls go through LoadBalancer + encoder/decoder.',
  ),
  codeBasedItem(
    'Show **WebClient** GET with **uri** template and **retrieve**.',
    '// webClient.get()\n//   .uri("https://api/orders/{id}", id)\n//   .retrieve()\n//   .bodyToMono(Order.class)\n//   .timeout(Duration.ofSeconds(2));',
  ),
  codeBasedItem(
    'Resilience4j **`@CircuitBreaker`** annotation pseudo-config.',
    '// @CircuitBreaker(name = "payments", fallbackMethod = "payFallback")\n// public Payment pay(Request r) { return client.charge(r); }\n// private Payment payFallback(Request r, Exception e) { return Payment.degraded(); }',
  ),
  codeBasedItem(
    '**Feign** **`Request.Options`** connect/read timeouts (conceptual).',
    '// @Bean\n// Request.Options feignOptions() {\n//   return new Request.Options(200, TimeUnit.MILLISECONDS, 1500, TimeUnit.MILLISECONDS, true);\n// }\n// Align read timeout with upstream SLA + margin.',
  ),
  codeBasedItem(
    '**WebClient** **`filter`** adding correlation header.',
    '// webClient.mutate().filter((req, next) ->\n//   next.exchange(ClientRequest.from(req).header("X-Trace-Id", traceId).build())).build();',
  ),
  codeBasedItem(
    '**Resilience4j RetryConfig** maxAttempts + intervalFunction.',
    '// RetryConfig.custom().maxAttempts(3)\n//   .intervalFunction(attempt -> 100L * (long) Math.pow(2, attempt - 1))\n//   .build();',
  ),
  codeBasedItem(
    '**Bulkhead** registry configuration sketch.',
    '// BulkheadConfig.custom().maxConcurrentCalls(20).maxWaitDuration(Duration.ofMillis(50)).build();\n// Register per downstream dependency name.',
  ),
  codeBasedItem(
    '**Feign** **`ErrorDecoder`** mapping 404 to custom exception.',
    '// if (status == 404) return new NotFoundException(methodKey, response);\n// return new Default().decode(methodKey, response);',
  ),
  codeBasedItem(
    'Micrometer tag **`client_name`** on outbound timer (conceptual).',
    '// Timer.builder("http.client.requests")\n//   .tag("client", "payments")\n//   .tag("outcome", status >= 500 ? "SERVER_ERROR" : "SUCCESS")\n//   .register(registry);',
  ),
  codeBasedItem(
    '**WebClient** **`onStatus`** throwing on 5xx.',
    '// .onStatus(HttpStatusCode::is5xxServerError,\n//   r -> r.bodyToMono(String.class).map(body -> new UpstreamException(body)))',
  ),
];

const seniorScenario = [
  seniorItem(
    '**Production:** After a **payments** outage, **Feign** clients recover but **p99** stays high everywhere. Diagnose.',
    'Open **APM** **service** **map**, check **thread** **pool** **saturation** and **bulkhead** **rejects**, freeze risky **releases**.',
    '**Bulkheads** were too small or **blocking** **fallbacks** exhausted **executor** queues; **retry** storms kept **CPU** hot.',
    '1) Increase **bulkhead** **limits** carefully. 2) Remove **blocking** from **reactive** paths. 3) Add **jitter** to **retries**. 4) Scale **replicas** after **evidence** from **metrics**.',
    'Add **dashboards** for **pool** **depth**, **reject** counts, and **chaos** tests for **dependency** **slowdown**.',
  ),
  seniorItem(
    '**Incident:** **429** from partner API — your **Feign** **retry** amplifies rate limit hits.',
    'Disable **auto** **retry** on **429**, alert **account** **manager**, switch to **cached** **reads** if safe.',
    'Clients ignore **`Retry-After`** and **hammer** **partner** during **incidents**.',
    'Honor **`Retry-After`**, cap **max** **retries**, implement **exponential** **backoff** with **jitter**, negotiate **quota**.',
    '**Contract** tests include **429** path; **SLO** on **partner** **latency** and **quota** **headroom**.',
  ),
  seniorItem(
    '**Design:** Team wants **synchronous** **Feign** chain **A→B→C** for checkout.',
    'Challenge **latency** **budget**; propose **async** **events** for non-critical steps.',
    'Deep **sync** graphs multiply **timeouts** and **failure** **probability**.',
    'Introduce **Saga** or **event** for **inventory** **hold**; keep **Feign** for **read** **path** only where needed.',
    '**Architecture** **decision** record documents **max** **chain** **depth**.',
  ),
  seniorItem(
    '**Bug:** **Circuit breaker** never opens despite **500** storm.',
    'Verify **metric** **window**, **minimum** **number** of calls, and **recordExceptions** configuration.',
    '**Predicate** ignores **wrapped** **exceptions** or **sample** size too small.',
    'Fix **recordException** rules, lower **minimum** **calls** for **canary** environments, add **integration** test.',
    'Alert on **zero** **state** **transitions** during **fault** **injection**.',
  ),
  seniorItem(
    '**Migration:** Replace **RestTemplate** with **WebClient** in **servlet** app.',
    'Run **dual** **write** period with **feature** **flag**, measure **thread** usage.',
    '**Blocking** **`block()`** on **WebClient** gives little benefit; must adopt **async** **controller** or **mvc** + **Callable**.',
    'Migrate **hot** paths first; use **`WebClient`** with **`block()`** only as **temporary** bridge with **timeouts**.',
    '**Lint** rule forbids new **RestTemplate** beans.',
  ),
  seniorItem(
    '**Security:** **Feign** forwards internal **headers** to **internet** **partner**.',
    'Stop traffic, rotate **secrets**, patch **interceptor** list.',
    '**RequestInterceptor** copies **`Authorization`** or **internal** **trace** headers inappropriately.',
    'Whitelist **headers** per **client**, use **separate** **Feign** **configurations** for **internal** vs **external**.',
    '**Security** review checklist for every new **FeignClient**.',
  ),
];

const wrongAnswers = [
  '**Circuit breakers** should open on the **first** timeout — **Correction:** Breakers need enough **calls** in a **window** to avoid **flapping** on **noise**.',
  '**WebClient** is always **non-blocking** even when you call **`block()`** — **Correction:** **`block()`** is **blocking** and can **starve** threads if misused.',
  '**Retries** are **safe** for all **HTTP** methods — **Correction:** **POST** needs **idempotency** design before **retry**.',
  '**Feign** works without any **HTTP** client implementation — **Correction:** You need **OKHttp**, **Apache HttpClient**, or **default** **JDK** client on **classpath**.',
  '**Bulkhead** and **circuit breaker** are the **same** pattern — **Correction:** **Bulkhead** limits **concurrency**; **breaker** stops calls during **failure** **spikes**.',
  '**Client timeout** should always be **longer** than **server** timeout — **Correction:** Usually **inner** **clients** are **shorter** than **outer** **gateways** so failures **fail** **fast** locally.',
  '**Resilience4j** replaces the need for **upstream** **fixes** — **Correction:** Resilience **contains** damage; **root** **cause** still needs **engineering**.',
  '**OpenFeign** cannot use **Spring** **Security** **OAuth2** tokens — **Correction:** Use **`RequestInterceptor`** or **`OAuth2FeignRequestInterceptor`** patterns to propagate **tokens** safely.',
];

const why = `Outbound HTTP is where **microservices** lose **SLOs**: a **small** **timeout** mistake or **retry** policy turns a **blip** into a **company-wide** **outage**. **Feign** and **WebClient** are the **default** **Spring** tools interviewers expect you to **reason** about with **Resilience4j** **patterns**, not just **annotations**.\n\n**Strong** answers connect **declarative** clients to **load balancing**, **observability**, and **failure** **containment**. Weak answers stop at "I added **@FeignClient**" without **timeouts**, **retries**, or **idempotency** **thinking**.\n\nThis day focuses on **client-side** **resilience**: **circuit** **breakers**, **bulkheads**, **retries** with **jitter**, and **graceful** **degradation**—each with **measurable** **trade-offs** in **latency** and **correctness**.\n\nProduction **post-mortems** often cite **retry** **storms**, **thread** **pool** **exhaustion**, and **half-open** **circuits** stuck **open** after **misconfigured** **exceptions**. You should sound like you have read those **reports**.\n\nFinally, **align** **timeouts** across **layers** and **test** **assumptions** with **chaos** **experiments** so **dashboards** match **reality** when **dependencies** **slow** **down**.`;

const theory = `### Day 53 — **Feign**, **WebClient**, and **client resilience**\n\n---\n\n### 1. **OpenFeign** in Spring Cloud\n**OpenFeign** maps annotated interfaces to HTTP calls. **Spring** registers **beans** with **proxies** that honor **LoadBalancer** names, **encoders/decoders**, and **custom** **error** handling. Interview angle: explain **how** **declarative** clients stay **testable** with **contract** tests.\n\n---\n\n### 2. **WebClient** reactive model\n**WebClient** uses **Netty** under the hood in **WebFlux** stacks. Operators like **timeout**, **retryWhen**, and **onErrorResume** compose **resilience** in the **reactive** chain. Avoid **blocking** unless isolated.\n\n---\n\n### 3. **Circuit breaker** semantics\n**Resilience4j** tracks **sliding** **windows** of outcomes. Tune **failureRateThreshold**, **waitDurationInOpenState**, **permittedNumberOfCallsInHalfOpenState**, and **slowCall** detection. Too aggressive opens on **noise**; too lenient wastes **resources** during **blackouts**.\n\n---\n\n### 4. **Retry** with **jitter**\n**Exponential** backoff reduces **load** on recovering systems; **jitter** prevents **synchronized** **retry** waves. Restrict **retry** to **idempotent** operations or **known** **safe** **timeouts** only.\n\n---\n\n### 5. **Bulkheads**\nSeparate **executors** or **semaphores** per **dependency** so one **bad** **service** cannot **starve** **others**. Pair with **queue** **limits** and **clear** **rejection** **metrics**.\n\n---\n\n### 6. **Timeouts** layering\n**Connect** vs **read** vs **overall** **deadline**. Outer **gateways** > inner **clients** > **database** **statement** **timeouts** is a common **pattern**—adapt to your **stack** but keep **ordering** **consistent**.\n\n---\n\n### 7. **Observability**\n**Micrometer** **http.client.requests** timer, **Resilience4j** metrics, **trace** **propagation** on **Feign** **RequestInterceptor**. Logs must avoid **secrets**.\n\n---\n\n### 8. **60-second** story\n**Symptom:** Checkout **timeouts** after **inventory** **slowdown**. **Cause:** **Feign** **retry** without **bulkhead** saturated **tomcat** **threads**. **Fix:** **bulkhead** + **retry** **budget** + **timeout** **alignment**. **Verify:** **thread** **pool** metrics and **chaos** **replay**.`;

const basic = {
  title: 'Basic — Client stack reference tables',
  filename: 'Day53Basic.java',
  description: 'Static tables: Feign vs WebClient, Resilience4j modules, timeout nesting.',
  code: `package arch.day53;

/*
 * Reference only — Spring Cloud OpenFeign + WebClient + Resilience4j interview map.
 */
public class Day53Basic {

    public static void main(String[] args) {
        System.out.println("=== Feign vs WebClient (when to pick) ===");
        System.out.println("Feign     | Declarative interfaces, servlet-friendly, LoadBalancer lb://");
        System.out.println("WebClient | Reactive stack, streaming, non-blocking pipelines");
        System.out.println();
        System.out.println("=== Resilience4j building blocks ===");
        System.out.println("CircuitBreaker | fail fast after error rate / slow calls");
        System.out.println("Retry          | backoff + jitter on transient failures");
        System.out.println("Bulkhead       | cap concurrent calls per dependency");
        System.out.println("TimeLimiter    | bound async execution wall time");
        System.out.println("RateLimiter    | smooth or limit request rate");
        System.out.println();
        System.out.println("=== Timeout nesting (typical) ===");
        System.out.println("1. DB statement timeout (shortest meaningful work unit)");
        System.out.println("2. Feign/WebClient read timeout");
        System.out.println("3. Gateway / edge idle timeout (longer)");
        System.out.println();
        System.out.println("=== Retry safety ===");
        System.out.println("Safe-ish: GET/HEAD with bounded retries + jitter");
        System.out.println("Risky: POST without Idempotency-Key or dedup store");
    }
}
`,
  output: `=== Feign vs WebClient (when to pick) ===
Feign     | Declarative interfaces, servlet-friendly, LoadBalancer lb://
WebClient | Reactive stack, streaming, non-blocking pipelines

=== Resilience4j building blocks ===
CircuitBreaker | fail fast after error rate / slow calls
Retry          | backoff + jitter on transient failures
Bulkhead       | cap concurrent calls per dependency
TimeLimiter    | bound async execution wall time
RateLimiter    | smooth or limit request rate

=== Timeout nesting (typical) ===
1. DB statement timeout (shortest meaningful work unit)
2. Feign/WebClient read timeout
3. Gateway / edge idle timeout (longer)

=== Retry safety ===
Safe-ish: GET/HEAD with bounded retries + jitter
Risky: POST without Idempotency-Key or dedup store
`,
};

const intermediate = {
  title: 'Intermediate — Four deterministic client scenarios',
  filename: 'Day53Intermediate.java',
  description: 'Retry budget, Feign error classification, bulkhead cap, timeout mismatch — no network, no sleep.',
  code: `package arch.day53;

import java.util.ArrayList;
import java.util.List;

/**
 * Simulates policy decisions without real HTTP.
 * spring.cloud.openfeign + spring.webflux WebClient mapping in comments only.
 */
public class Day53Intermediate {

    static int attempt;

    static int callWithRetryBudget() {
        attempt = 0;
        int max = 3;
        int status;
        do {
            attempt++;
            status = attempt < 3 ? 503 : 200;
        } while (status != 200 && attempt < max);
        return status;
    }

    static String classifyFeignStatus(int http) {
        if (http == 404) {
            return "decode: NotFoundException";
        }
        if (http >= 500) {
            return "decode: RetryableException";
        }
        return "decode: OK";
    }

    static String bulkheadTry(List<String> inflight, int max, String callId) {
        if (inflight.size() >= max) {
            return "BULKHEAD_REJECT " + callId;
        }
        inflight.add(callId);
        return "ACQUIRED " + callId;
    }

    static String timeoutLayers(int clientMs, int gatewayMs) {
        if (clientMs > gatewayMs) {
            return "MISALIGNED: client timeout exceeds gateway";
        }
        return "OK: nested timeouts";
    }

    public static void main(String[] args) {
        System.out.println("=== Day 53 intermediate scenarios ===\\n");

        System.out.println("--- Scenario 1: retry budget ---");
        System.out.println("finalStatus=" + callWithRetryBudget() + " attempts=" + attempt);
        System.out.println();

        System.out.println("--- Scenario 2: Feign ErrorDecoder classes ---");
        System.out.println(classifyFeignStatus(404));
        System.out.println(classifyFeignStatus(503));
        System.out.println();

        System.out.println("--- Scenario 3: bulkhead cap ---");
        List<String> lane = new ArrayList<>();
        System.out.println(bulkheadTry(lane, 2, "a"));
        System.out.println(bulkheadTry(lane, 2, "b"));
        System.out.println(bulkheadTry(lane, 2, "c"));
        System.out.println();

        System.out.println("--- Scenario 4: timeout alignment ---");
        System.out.println(timeoutLayers(1500, 3000));
        System.out.println(timeoutLayers(4000, 3000));
    }
}
`,
  output: `=== Day 53 intermediate scenarios ===

--- Scenario 1: retry budget ---
finalStatus=200 attempts=3

--- Scenario 2: Feign ErrorDecoder classes ---
decode: NotFoundException
decode: RetryableException

--- Scenario 3: bulkhead cap ---
ACQUIRED a
ACQUIRED b
BULKHEAD_REJECT c

--- Scenario 4: timeout alignment ---
OK: nested timeouts
MISALIGNED: client timeout exceeds gateway
`,
};

const advanced = {
  title: 'Advanced — Deterministic circuit breaker + slow dependency',
  filename: 'Day53Advanced.java',
  description: 'CLOSED→OPEN after failures, HALF_OPEN probe, dependency succeeds after warm-up counter.',
  code: `package arch.day53;

/**
 * Tiny CB + dependency simulation (deterministic).
 * resilience4j.circuitbreaker naming mirrored in println labels only.
 */
public class Day53Advanced {

    enum State { CLOSED, OPEN, HALF_OPEN }

    static final int FAILURE_THRESHOLD = 3;
    static int consecutiveFailures;
    static State state = State.CLOSED;
    static int depCalls;

    static boolean slowDependency() {
        depCalls++;
        return depCalls >= 4;
    }

    static String invoke() {
        if (state == State.OPEN) {
            return "SHORT_CIRCUIT";
        }
        boolean ok = slowDependency();
        if (!ok) {
            consecutiveFailures++;
            if (consecutiveFailures >= FAILURE_THRESHOLD) {
                state = State.OPEN;
            }
            return "FAIL";
        }
        consecutiveFailures = 0;
        state = State.CLOSED;
        return "OK";
    }

    static void halfOpenProbe() {
        state = State.HALF_OPEN;
        consecutiveFailures = 0;
        depCalls = 3;
    }

    public static void main(String[] args) {
        System.out.println("=== Circuit breaker walkthrough ===");
        for (int i = 0; i < 5; i++) {
            System.out.println("call " + (i + 1) + ": " + invoke());
        }
        System.out.println("--- admin: move to HALF_OPEN probe ---");
        halfOpenProbe();
        System.out.println("probe: " + invoke());
        System.out.println("next: " + invoke());
    }
}
`,
  output: `=== Circuit breaker walkthrough ===
call 1: FAIL
call 2: FAIL
call 3: FAIL
call 4: OK
call 5: SHORT_CIRCUIT
--- admin: move to HALF_OPEN probe ---
probe: OK
next: OK
`,
};

const diagram = {
  title: 'Client resilience — Feign/WebClient to downstream',
  description: 'Shows declarative client, optional circuit breaker, and dependency service with metrics.',
  plantuml: `@startuml
title Day 53 — Outbound call with resilience
participant "Order Service" as OS
participant "Feign / WebClient" as C
participant "CircuitBreaker" as CB
participant "Payments API" as P

OS -> C : GET /payments/{id}
C -> CB : acquire permit
CB -> P : HTTP
P --> CB : 200 / 503 / timeout
CB --> C : result / fail fast
C --> OS : DTO / exception
note right of CB
  Resilience4j tracks sliding window;
  bulkhead limits concurrent calls
end note
@enduml`,
};

const pitfalls = [
  'Setting **infinite** **timeouts** on **Feign** so **threads** **pile** up during **upstream** **stalls**, hiding **problems** until **GC** **pauses** **kill** **the** **JVM**.',
  'Enabling **retry** on **POST** **payments** without **`Idempotency-Key`** or **server** **dedup**, **duplicating** **charges** after **ambiguous** **timeouts**.',
  'Using **`WebClient.block()`** on **reactor** **event-loop** **threads**, **serializing** **thousands** of **requests** behind **one** **slow** **dependency**.',
  'Configuring **circuit** **breakers** with **minimum** **calls** **too** **high** for **low** **QPS** **services**, so **breakers** **never** **open** during **real** **outages**.',
  'Sharing **one** **giant** **thread** **pool** for **all** **Feign** **clients** so **one** **noisy** **neighbor** **blocks** **unrelated** **outbound** **calls**.',
  'Ignoring **`Retry-After`** on **429** responses and **hammering** **partners** until **they** **ban** **your** **traffic**.',
  'Logging **full** **`Authorization`** **headers** when **debugging** **Feign**, **leaking** **bearer** **tokens** into **central** **logs**.',
  'Treating **fallback** methods as **free**—implementing **heavy** **blocking** **work** there **recreates** **the** **outage** **inside** **your** **service**.',
];

const exerciseSolution = advanced.code.replace(/Day53Advanced/g, 'Day53Exercise');

const exercise = {
  titleSuffix: 'Circuit breaker around slow dependency (Day 53 assignment)',
  problem:
    'Align with **Day 53 Assignment**: **Circuit breaker around slow dependency**.\n\n1. Simulate a **dependency** that returns **`false`** for the **first three** invocations and **`true`** afterward (warm-up).\n2. Implement a **circuit breaker** with **`FAILURE_THRESHOLD = 3`**: after **three** consecutive **logical** failures, enter **OPEN** and **short-circuit** further calls with a clear message.\n3. While **CLOSED**, each failed dependency call counts toward the threshold; a **success** resets consecutive failures.\n4. In **`main()`**, print **at least six** labeled lines showing: failures opening the circuit, **short-circuit** behavior, then a **manual** transition to **HALF_OPEN** (reset state in code), and a **successful** **probe**.\n5. Use **only** **deterministic** logic—**no** **`Math.random`**, **`UUID`**, **`System.currentTimeMillis`**, or **`hashCode`** for decisions.',
  hints: [
    'Track **`consecutiveFailures`** separately from **total** **dependency** **calls**.',
    'When **OPEN**, skip calling the dependency and print **`SHORT_CIRCUIT`**.',
    'Add a **`halfOpenProbe()`** helper that sets state and rewinds counters for the demo.',
  ],
  solution: exerciseSolution,
  difficulty: 'Advanced',
};

const cheatsheet = `| Topic | Rule of thumb | Interview one-liner |
|---|---|---|
| OpenFeign | Declarative HTTP + LB | Contract tests catch breaks early |
| WebClient | Reactive Netty client | Never block on event-loop threads |
| Circuit breaker | Sliding window + half-open | Tune minimum calls for low QPS |
| Retry | Backoff + jitter | POST needs idempotency keys |
| Bulkhead | Concurrency cap per dep | Prevents total thread starvation |
| Timeouts | Nest inner < outer | Stops orphan work at layers |
| ErrorDecoder | Map status → typed errors | Enables business-level handling |
| Observability | Micrometer + trace headers | Debug client issues like a gateway |
| TimeLimiter | Bound async work | Pairs with CompletableFuture APIs |
| LoadBalancer cache | TTL tuning | Stale instances cause mystery 503 |`;

const drillSeeds = [
  {
    question:
      'Code review: **Feign** client has **no** **readTimeout**, **unlimited** **retry** on **POST /charge**, and **logs** full **`Authorization`**. What is wrong?',
    signals: ['timeout', 'idempotency', 'secrets', 'retry'],
    core: {
      root: '**Missing** **timeouts** plus **unsafe** **retries** on **non-idempotent** **POST** plus **credential** **logging**.',
      breaks: '**Thread** **exhaustion**, **duplicate** **charges**, and **token** **leakage** into **SIEM**.',
      fix: 'Add **connect/read** **timeouts**, **idempotency** **keys** or **disable** **retry** on **POST**, **redact** **headers** in **logs**.',
      angle: 'Name **Resilience4j** **Retry** **predicates** and **Feign** **Logger.Level** **NONE** for **headers**.',
      fq1q: 'How do you **prove** **duplicate** **charges** stopped after the fix?',
      fq1a:
        'Compare **payment** **provider** **dashboard** **duplicate** **rates** before/after, add **idempotency** **key** **metrics**, and run **replay** tests in **staging** with **timeout** **faults**.',
      fq2q: 'What **metric** shows **Feign** **thread** **starvation**?',
      fq2a:
        '**Tomcat** **`threads.busy`**, **executor** **queue** **depth**, and **client** **`http.server.requests`** **latency** **percentiles** **jump** while **CPU** stays **flat**—pair with **traces** showing **blocked** **threads**.',
    },
  },
  {
    question:
      '**Incident:** **inventory** **latency** doubles; **checkout** **service** **CPU** is **low** but **p99** explodes. **Feign** **metrics** show **massive** **wait** on **bulkhead**.',
    signals: ['bulkhead', 'queueing', 'p99', 'saturation'],
    core: {
      root: '**Bulkhead** **maxConcurrentCalls** too low or **slow** **inventory** **fills** **wait** **queue**.',
      breaks: 'Requests **block** waiting for **permits**; **users** see **timeouts** at **gateway**.',
      fix: 'Raise **limits** carefully, **shorten** **inventory** **timeout**, **fail** **fast** with **fallback** **stock** **read**.',
      angle: 'Show **bulkhead** **available** **permits** **metric** interpretation.',
      fq1q: 'When is raising **bulkhead** **unsafe**?',
      fq1a:
        'When **downstream** **cannot** **absorb** **extra** **concurrency** and will **collapse**—coordinate with **dependency** **owner** and use **feature** **flags** to **cap** **traffic**.',
      fq2q: 'What **alternative** reduces **need** for **large** **bulkheads**?',
      fq2a:
        '**Cache** **read** **models**, **async** **events** for **non-critical** **paths**, and **reduce** **fan-out** **chains** so **each** **request** **holds** **fewer** **permits**.',
    },
  },
  {
    question:
      '**Design** choice: **synchronous** **Feign** **chain** **A→B→C** vs **event** **choreography** for **order** **placed** **flow**.',
    signals: ['latency', 'coupling', 'SAGA', 'events'],
    core: {
      root: '**Sync** **chains** multiply **latency** **variance** and **failure** **modes**; **events** **decouple** **critical** **path**.',
      breaks: 'One **slow** **B** **stalls** **A**; **retries** **amplify** **load** on **B** and **C**.',
      fix: 'Keep **sync** only for **must-have** **reads**; **publish** **OrderPlaced** for **inventory**/**shipping**.',
      angle: 'Mention **outbox** **pattern** for **reliable** **publication**.',
      fq1q: 'How do you **maintain** **read** **consistency** after **events**?',
      fq1a:
        'Use **projections**, **CQRS** **read** **models**, or **clear** **UX** **for** **eventual** **consistency** with **status** **polling** or **websockets**.',
      fq2q: 'What **test** **prevents** **lost** **events**?',
      fq2a:
        '**End-to-end** tests with **broker** **faults**, **outbox** **drain** **metrics**, and **idempotent** **consumers** verified by **replay**.',
    },
  },
  {
    question:
      'Explain how **Resilience4j** **circuit breaker** **sliding** **window** **counts** **slow** **calls**.',
    signals: ['slowCallRate', 'duration', 'window'],
    core: {
      root: '**slowCallDurationThreshold** marks **calls** **slower** than **SLA** as **slow**; **slowCallRateThreshold** opens **circuit**.',
      breaks: 'Mis-tuned **thresholds** open **breaker** during **normal** **GC** **pauses**.',
      fix: 'Base **thresholds** on **p95** **dependency** **latency** with **margin**; **test** in **staging**.',
      angle: 'Contrast **count-based** vs **time-based** **windows**.',
      fq1q: 'How does **half-open** **behave** under **load**?',
      fq1a:
        'Only **permitted** **probes** run; if **traffic** is **high**, **coordinate** **probes** with **randomized** **jitter** or **dedicated** **canary** **instances**.',
      fq2q: 'What **dashboard** **panels** do you **add**?',
      fq2a:
        '**State** **gauge**, **call** **volume**, **failure** **rate**, **slow** **call** **percentage**, and **transition** **events** **annotated** with **deploy** **markers**.',
    },
  },
  {
    question:
      '**Trade-off:** **aggressive** **retry** with **short** **backoff** vs **conservative** **retry** with **long** **backoff** for **503** from **partner**.',
    signals: ['503', 'backoff', 'SLO', 'herd'],
    core: {
      root: '**Aggressive** **retry** **hurts** **recovering** **partner**; **conservative** **hurts** **your** **SLO** if **errors** are **transient**.',
      breaks: '**Thundering** **herd** or **unnecessary** **user** **errors**.',
      fix: 'Cap **attempts**, **add** **jitter**, **honor** **`Retry-After`**, **monitor** **partner** **SLO**.',
      angle: 'Discuss **game** **theory** of **many** **clients** **retrying**.',
      fq1q: 'How do **you** **coordinate** with **partners**?',
      fq1a:
        '**Runbooks** with **contacts**, **shared** **status** **pages**, **agreed** **rate** **limits**, and **synthetic** **probes** **outside** **retry** **loops**.',
      fq2q: 'What **client-side** **feature** **helps** **UX** during **outages**?',
      fq2a:
        '**Graceful** **degradation** **banners**, **cached** **reads**, **queue** **requests**, and **clear** **retry** **CTA** instead of **spinners** **forever**.',
    },
  },
  {
    question:
      '**Gotcha:** **Circuit** **breaker** **opens** in **tests** but **never** in **prod** despite **real** **500** **errors**.',
    signals: ['recordException', 'minimumCalls', 'wrapped'],
    core: {
      root: '**Exceptions** **wrapped** in **`RuntimeException`** **not** **counted**, or **minimum** **calls** **too** **high**.',
      breaks: '**Overload** **continues** hitting **broken** **dependency** **until** **total** **collapse**.',
      fix: 'Adjust **recordException** **predicate**, **lower** **minimum** **calls** for **small** **services**, **add** **assertions** in **tests**.',
      angle: 'Show **Resilience4j** **event** **consumer** **logging** **state** **changes**.',
      fq1q: 'How do **chaos** **tests** **validate** **breakers**?',
      fq1a:
        'Inject **faults** **against** **staging** **dependencies**, **assert** **state** **OPEN** within **N** **seconds**, then **HALF_OPEN** **recovery**.',
      fq2q: 'What **alert** **fires** when **breaker** **misconfigured**?',
      fq2a:
        '**Zero** **state** **transitions** during **known** **fault** **drills**, or **error** **rate** **high** while **breaker** **stays** **CLOSED**.',
    },
  },
  {
    question:
      '**Senior** **architecture:** **standardize** **client** **resilience** across **fifty** **Spring** **Boot** **services**.',
    signals: ['platform', 'defaults', 'golden path'],
    core: {
      root: '**Ad-hoc** **timeouts** and **retries** **without** **shared** **libraries** **create** **inconsistent** **failure** **behavior**.',
      breaks: '**On-call** **cannot** **compare** **dashboards**; **incidents** **repeat**.',
      fix: 'Ship **starter** with **Feign** **defaults**, **Resilience4j** **configs**, **Micrometer** **tags**, **lint** **rules**.',
      angle: 'Mention **SRE** **review** **gate** for **new** **clients**.',
      fq1q: 'How do **you** **migrate** **legacy** **services**?',
      fq1a:
        '**Strangler** **per** **domain**, **dual** **metrics** **during** **cutover**, **training** **sessions** with **copy-paste** **templates**.',
      fq2q: 'What **metric** **proves** **standardization** **worked**?',
      fq2a:
        '**Reduced** **p99** **variance** **across** **services** for **same** **dependency**, **fewer** **SEV1** **client** **timeout** **incidents** **quarter** over **quarter**.',
    },
  },
  {
    question:
      '**Security:** **Feign** **interceptor** copies **all** **incoming** **request** **headers** to **outbound** **partner** **call**.',
    signals: ['header leak', 'PII', 'OAuth'],
    core: {
      root: '**Over-forwarding** **internal** **headers** **leaks** **PII** and **breaks** **partner** **contracts**.',
      breaks: '**Compliance** **incident** and **partner** **revokes** **keys**.',
      fix: '**Whitelist** **headers**, **separate** **internal** vs **external** **Feign** **configs**.',
      angle: 'Reference **OWASP** **logging** **guidance**.',
      fq1q: 'How do **you** **detect** **this** in **CI**?',
      fq1a:
        '**Static** **analysis** for **RequestInterceptor** **patterns**, **contract** tests that **fail** on **unexpected** **headers**, **staging** **traffic** **mirroring**.',
      fq2q: 'What **operational** **drill** **validates** **fix**?',
      fq2a:
        '**Pen** **test** **partner** **receives** **only** **approved** **headers** under **load**, **audit** **log** **review** **weekly**.',
    },
  },
  {
    question:
      '**Scale:** **10k** **RPS** **checkout** — **WebClient** **connection** **pool** **exhaustion** **symptoms**.',
    signals: ['pool', 'file descriptors', 'ephemeral ports'],
    core: {
      root: '**Max** **connections** **per** **host** **too** **low** or **connections** **not** **reused**.',
      breaks: '**Ephemeral** **port** **exhaustion** or **massive** **connect** **latency**.',
      fix: 'Tune **maxConnections**, **maxIdleTime**, **pendingAcquireMaxCount**, **scale** **out** **pods**.',
      angle: 'Correlate **Netty** **metrics** with **Linux** **`ss`** **output**.',
      fq1q: 'How **does** **Kubernetes** **change** **pool** **math**?',
      fq1a:
        '**Many** **pods** **multiply** **connections** to **same** **dependency**—coordinate **global** **limits** with **dependency** **owner** and **consider** **shared** **proxy**.',
      fq2q: 'What **test** **catches** **pool** **misconfig**?',
      fq2a:
        '**Soak** **test** at **target** **RPS** with **connection** **metrics** **assertions** and **gradual** **ramp** **in** **staging**.',
    },
  },
  {
    question:
      '**Misconception:** "**Circuit** **breaker** **fixes** **slow** **queries** **in** **the** **database**."',
    signals: ['misconception', 'root cause', 'masking'],
    core: {
      root: '**Breakers** **hide** **symptoms** by **failing** **fast**; **DB** **tuning** still **required**.',
      breaks: '**Users** **see** **errors** while **DB** **load** **remains** **high** **from** **other** **sources**.',
      fix: '**Profile** **SQL**, **add** **indexes**, **cache** **hot** **keys**, **use** **breaker** only as **temporary** **relief**.',
      angle: 'Explain **error** **budget** **trade-off** between **degradation** and **correctness**.',
      fq1q: 'How **long** may **degraded** **mode** **run**?',
      fq1a:
        'Until **error** **budget** **allows** **fix** **deployment** or **executive** **risk** **acceptance**—track **customer** **impact** **minutes**.',
      fq2q: 'What **metric** **proves** **DB** **fix** **worked**?',
      fq2a:
        '**Query** **p95** **latency** **down**, **CPU** **on** **RDS** **down**, **breaker** **closed** **steady** **under** **peak** **load**.',
    },
  },
];

export const drill53 = {
  day: 53,
  title: 'Feign, WebClient & Resilience',
  phaseId: 'phase6',
  tags: [
    'OpenFeign',
    'WebClient',
    'Resilience4j',
    'circuit breaker',
    'retry',
    'bulkhead',
    'timeout',
    'Spring Cloud',
  ],
  scenarios: drillSeeds.map((s, i) =>
    scenarioDrillItem(53, i + 1, s.question, s.signals, s.core),
  ),
};

export default {
  day: 53,
  title: 'Feign, WebClient & Resilience',
  tags: [
    'Mid-Level',
    'Advanced',
    'Phase 6',
    'Interview Prep',
    'Satyverse(Satyam Parmar)',
    'OpenFeign',
    'WebClient',
    'Resilience4j',
  ],
  prerequisites: ['Day 52', 'Day 51'],
  learningObjectives: [
    'Compare **OpenFeign** vs **WebClient** and pick the stack that matches **servlet** vs **reactive** constraints',
    'Configure **Resilience4j** **circuit breakers**, **retries**, and **bulkheads** with **metrics** you can defend in interviews',
    'Explain **timeout** **nesting** across **client**, **gateway**, and **upstream** and why **misalignment** creates **orphan** work',
    'Design **safe** **retries** for **idempotent** calls and **avoid** **duplicate** **side effects** on **POST**',
    'Map **Feign** **ErrorDecoder** / **WebClient** filters to **typed** errors and **observability** tags',
    'Diagnose **thread** **pool** **saturation** and **retry** **storms** using **Micrometer** and **distributed** **traces**',
  ],
  why,
  theory,
  codes: [basic, intermediate, advanced],
  diagram,
  pitfalls,
  exercise,
  cheatsheet,
  interview: {
    conceptual,
    codeBased,
    seniorScenario,
    wrongAnswers,
  },
};
