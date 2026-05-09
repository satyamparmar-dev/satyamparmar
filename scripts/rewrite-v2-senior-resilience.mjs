import { readFileSync, writeFileSync } from 'fs';
const FILE = 'public/data/scenarioInterviewThemes.json';
const F = '```';

const answers = {

'th-cb-half-open': `
## 🔥 The situation

Your service calls a downstream API that goes down. Without protection, every request waits for the full timeout (say, 30 seconds) before failing. With a circuit breaker, after N failures the breaker "trips open" and starts failing fast immediately — no waiting. But how do the breaker know when the downstream service has recovered? That's the **HALF-OPEN** state.

---

## 🧠 Understand this first

| State | What it means |
|---|---|
| **CLOSED** | Circuit is "working" — all requests pass through; failures tracked |
| **OPEN** | Too many failures — circuit tripped; requests fail immediately (no downstream call) |
| **HALF-OPEN** | Test phase — a limited number of requests are allowed through to check if service recovered |
| **Failure rate threshold** | e.g., 50% of last 10 calls failed → OPEN |
| **Wait duration** | How long to stay OPEN before trying HALF-OPEN (default: 60 seconds) |
| **Permitted calls in HALF-OPEN** | How many test calls to allow before deciding CLOSED vs OPEN |

---

## Step 1 — Add Resilience4j Circuit Breaker

${F}xml
<dependency>
    <groupId>io.github.resilience4j</groupId>
    <artifactId>resilience4j-spring-boot3</artifactId>
    <version>2.1.0</version>
</dependency>
${F}

${F}yaml
# application.yml
resilience4j:
  circuitbreaker:
    instances:
      paymentService:
        registerHealthIndicator: true
        slidingWindowSize: 10           # evaluate last 10 calls
        failureRateThreshold: 50        # trip open if ≥50% fail
        waitDurationInOpenState: 30s    # wait 30s before trying HALF-OPEN
        permittedNumberOfCallsInHalfOpenState: 3  # allow 3 test calls
        minimumNumberOfCalls: 5         # need at least 5 calls before evaluating
        slowCallRateThreshold: 80       # also trip if ≥80% calls are "slow"
        slowCallDurationThreshold: 2s   # "slow" = > 2 seconds
${F}

---

## Step 2 — Annotate your service call

${F}java
@Service
public class PaymentService {

    @CircuitBreaker(name = "paymentService", fallbackMethod = "paymentFallback")
    @TimeLimiter(name = "paymentService")
    public CompletableFuture<PaymentResult> processPayment(PaymentRequest request) {
        return CompletableFuture.supplyAsync(() ->
            paymentApiClient.charge(request));
    }

    // Called when circuit is OPEN or call fails
    public CompletableFuture<PaymentResult> paymentFallback(
            PaymentRequest request, Exception ex) {
        log.warn("Payment circuit open or failed, using fallback. Reason: {}", ex.getMessage());
        return CompletableFuture.completedFuture(
            PaymentResult.deferred(request.getOrderId()) // queue for retry later
        );
    }
}
${F}

---

## Step 3 — Observe the state transitions

${F}java
@Component
public class CircuitBreakerMonitor {

    @Autowired
    private CircuitBreakerRegistry registry;

    @PostConstruct
    public void setupListeners() {
        CircuitBreaker cb = registry.circuitBreaker("paymentService");

        cb.getEventPublisher()
            .onStateTransition(event ->
                log.info("Circuit breaker '{}' state: {} → {}",
                    event.getCircuitBreakerName(),
                    event.getStateTransition().getFromState(),
                    event.getStateTransition().getToState()))
            .onFailureRateExceeded(event ->
                log.warn("Failure rate exceeded: {}%", event.getFailureRate()))
            .onCallNotPermitted(event ->
                log.debug("Call rejected — circuit OPEN"));
    }
}
${F}

**What you see in logs when the downstream service fails:**
${F}
INFO  Circuit breaker 'paymentService' state: CLOSED → OPEN      ← tripped
WARN  Failure rate exceeded: 60.0%
DEBUG Call rejected — circuit OPEN                                ← failing fast
DEBUG Call rejected — circuit OPEN
DEBUG Call rejected — circuit OPEN
... (30 seconds later)
INFO  Circuit breaker 'paymentService' state: OPEN → HALF_OPEN   ← testing
INFO  3 test calls allowed through
INFO  Circuit breaker 'paymentService' state: HALF_OPEN → CLOSED ← recovered!
${F}

---

## Step 4 — Expose circuit breaker health via Actuator

${F}yaml
management:
  health:
    circuitbreakers:
      enabled: true
  endpoint:
    health:
      show-details: always
${F}

${F}bash
curl http://localhost:8080/actuator/health | jq '.components.circuitBreakers'
${F}

**What you see:**
${F}json
{
  "paymentService": {
    "status": "UP",
    "details": {
      "state": "CLOSED",
      "failureRate": "10.0%",
      "numberOfBufferedCalls": 10,
      "numberOfFailedCalls": 1
    }
  }
}
${F}

---

## 💡 Interview answer

**Open:** "Our payment service integration was causing cascading timeouts — when the payment API went down, all threads in our app were blocked for 30 seconds waiting, eventually exhausting the thread pool."

**Then:** "I added a Resilience4j circuit breaker with a 50% failure threshold over 10 calls and a 30-second wait in OPEN state. In HALF-OPEN, it allows 3 test calls before deciding to close or reopen. The fallback queues the payment for async retry instead of failing the order completely."

**End:** "The key tuning was \`permittedNumberOfCallsInHalfOpenState=3\` — too few and you reopen too quickly before the service is really stable; too many and you hammer a recovering service. Also important: the \`slowCallRateThreshold\` catches degraded-but-not-failing scenarios that pure error-rate checking misses."
`.trim(),

'th-bulkhead-pools': `
## 🔥 The situation

Your app calls three downstream services: Payment, Inventory, and Notifications. All share the same thread pool. When Inventory is slow, its requests pile up and consume all 200 threads — suddenly Payment and Notification calls can't run either, even though those services are healthy. One slow service brings down everything.

The **bulkhead pattern** isolates resource pools per service, so one slow dependency can't starve others.

---

## 🧠 Understand this first

| Concept | What it means |
|---|---|
| **Bulkhead** | Named after ship compartments — isolate failures to one section |
| **Thread pool bulkhead** | Each service gets its own thread pool — slowness in one doesn't block others |
| **Semaphore bulkhead** | Limit concurrent calls using a counter — lighter weight, same thread |
| **Max concurrent calls** | Number of in-flight calls allowed before new ones are rejected |
| **Max wait duration** | How long a call waits for a slot before being rejected |

---

## Step 1 — Configure bulkheads per service

${F}yaml
# application.yml
resilience4j:
  bulkhead:
    instances:
      paymentService:
        maxConcurrentCalls: 20       # max 20 simultaneous payment calls
        maxWaitDuration: 500ms       # wait 500ms for a slot, then reject

      inventoryService:
        maxConcurrentCalls: 10       # inventory can be slower — limit to 10
        maxWaitDuration: 100ms

      notificationService:
        maxConcurrentCalls: 50       # notifications are fast, allow more
        maxWaitDuration: 0ms         # don't wait at all — non-critical

  thread-pool-bulkhead:
    instances:
      paymentService:
        maxThreadPoolSize: 20
        coreThreadPoolSize: 10
        queueCapacity: 5             # small queue — prefer fast rejection over buildup
${F}

---

## Step 2 — Apply bulkhead to service calls

${F}java
@Service
public class OrderFulfillmentService {

    @Bulkhead(name = "paymentService", fallbackMethod = "paymentFallback")
    public PaymentResult processPayment(PaymentRequest req) {
        return paymentClient.charge(req);
    }

    @Bulkhead(name = "inventoryService", fallbackMethod = "inventoryFallback")
    public InventoryResult reserveInventory(InventoryRequest req) {
        return inventoryClient.reserve(req);
    }

    @Bulkhead(name = "notificationService", fallbackMethod = "notificationFallback",
              type = Bulkhead.Type.THREADPOOL)
    public CompletableFuture<Void> sendNotification(NotificationRequest req) {
        return CompletableFuture.runAsync(() -> notificationClient.send(req));
    }

    // Fallback when bulkhead is full
    public PaymentResult paymentFallback(PaymentRequest req, BulkheadFullException ex) {
        log.warn("Payment bulkhead full — {} concurrent calls", ex.getMessage());
        throw new ServiceUnavailableException("Payment service busy, try again shortly");
    }

    public Void notificationFallback(NotificationRequest req, Exception ex) {
        log.info("Notification dropped — queuing for retry: {}", req.getUserId());
        retryQueue.add(req); // non-critical, just retry later
        return null;
    }
}
${F}

---

## Step 3 — Combine bulkhead + circuit breaker

${F}java
// Order matters: bulkhead limits concurrency, then circuit breaker tracks failures
@Bulkhead(name = "inventoryService", fallbackMethod = "inventoryFallback")
@CircuitBreaker(name = "inventoryService", fallbackMethod = "inventoryFallback")
@TimeLimiter(name = "inventoryService")
public CompletableFuture<InventoryResult> reserveInventory(InventoryRequest req) {
    return CompletableFuture.supplyAsync(() -> inventoryClient.reserve(req));
}
${F}

**What happens under load when inventory is slow:**
${F}
Thread 1: inventory call — 5s (slow)
Thread 2: inventory call — 5s (slow)
...
Thread 10: inventory call — REJECTED (bulkhead full) → fallback
Thread 11+: inventory call — REJECTED immediately

Meanwhile:
Thread pool for payment: untouched ✅
Thread pool for notification: untouched ✅
${F}

---

## Step 4 — Monitor bulkhead usage

${F}bash
curl http://localhost:8080/actuator/metrics/resilience4j.bulkhead.concurrent.calls
${F}

**What you see:**
${F}json
{
  "name": "resilience4j.bulkhead.concurrent.calls",
  "measurements": [{"statistic": "VALUE", "value": 8}],
  "availableTags": [{"tag": "name", "values": ["paymentService", "inventoryService"]}]
}
${F}

Alert when bulkhead is near capacity:
${F}yaml
# Prometheus alert
- alert: BulkheadNearlyFull
  expr: resilience4j_bulkhead_available_concurrent_calls{name="inventoryService"} < 2
  for: 1m
  annotations:
    summary: "Inventory service bulkhead nearly exhausted"
${F}

---

## 💡 Interview answer

**Open:** "A slow inventory check was consuming all available threads in our shared pool — payment processing became unavailable even though the payment service was healthy."

**Then:** "I added Resilience4j bulkheads with separate thread pools per downstream service. Inventory got 10 threads with 100ms max wait; payment got 20 threads. When inventory is slow, it can only consume its 10 threads — payment's pool is completely isolated. I combined this with circuit breakers so persistent inventory failures trip open and calls are rejected immediately."

**End:** "The key tuning insight: set \`queueCapacity\` very small (5 or less). A large queue looks safer but it just hides the problem — requests pile up, latency grows, and you still exhaust memory. Prefer fast rejection with a good fallback over slow degradation with a full queue."
`.trim(),

'th-retry-jitter': `
## 🔥 The situation

Your service retries failed calls with a fixed 1-second delay. Under load, 1000 services all fail at the same time (during a brief outage) and all retry at exactly t+1s, t+2s, t+3s. This creates a **thundering herd** — the downstream service recovers just in time to be hit with another massive synchronized retry storm.

**Jitter** adds randomness to retry delays so requests spread out over time instead of hitting simultaneously.

---

## 🧠 Understand this first

| Concept | What it means |
|---|---|
| **Fixed retry** | Always wait the same time — simple but causes thundering herd |
| **Exponential backoff** | Double the wait each retry: 1s, 2s, 4s, 8s — reduces load over time |
| **Jitter** | Add random variance: instead of 4s, use 3.2s to 4.8s — spreads out retries |
| **Full jitter** | \`sleep = random(0, base × 2^attempt)\` — maximum spread, recommended by AWS |
| **Decorrelated jitter** | AWS's preferred: \`sleep = random(base, prev_sleep × 3)\` |
| **Max attempts** | Always cap retries — infinite retry → cascading failure |

---

## Step 1 — Configure Resilience4j retry with jitter

${F}yaml
# application.yml
resilience4j:
  retry:
    instances:
      paymentService:
        maxAttempts: 4                    # 1 initial + 3 retries
        waitDuration: 500ms               # base wait
        enableExponentialBackoff: true
        exponentialBackoffMultiplier: 2   # double each time: 500ms, 1s, 2s
        enableRandomizedWait: true
        randomizedWaitFactor: 0.5         # ±50% jitter: 250-750ms, 500ms-1.5s, 1-3s
        retryExceptions:
          - java.io.IOException
          - java.net.ConnectException
          - org.springframework.web.client.ResourceAccessException
        ignoreExceptions:
          - com.example.exception.BusinessValidationException  # don't retry business errors
${F}

**What the actual delays look like:**
${F}
Attempt 1: immediate
Attempt 2: wait 375ms  (500ms ± 50% jitter = 250-750ms)
Attempt 3: wait 830ms  (1000ms ± 50%)
Attempt 4: wait 1650ms (2000ms ± 50%)
→ Fail after 4 attempts
${F}

Without jitter, 1000 instances retry at exactly 500ms, 1000ms, 2000ms. With jitter, they spread across a 500ms window each time — peak load drops ~70%.

---

## Step 2 — Apply retry annotation

${F}java
@Service
public class PaymentService {

    @Retry(name = "paymentService", fallbackMethod = "paymentFallback")
    @CircuitBreaker(name = "paymentService", fallbackMethod = "paymentFallback")
    public PaymentResult processPayment(PaymentRequest request) {
        return paymentClient.charge(request); // retried automatically on failure
    }

    public PaymentResult paymentFallback(PaymentRequest request, Exception ex) {
        log.error("Payment failed after all retries: {}", ex.getMessage());
        // Queue for manual review or async retry
        failedPaymentQueue.add(request);
        return PaymentResult.pending(request.getOrderId());
    }
}
${F}

---

## Step 3 — Log retry events for observability

${F}java
@Component
public class RetryMonitor {

    @Autowired
    private RetryRegistry retryRegistry;

    @PostConstruct
    public void setupListeners() {
        retryRegistry.retry("paymentService").getEventPublisher()
            .onRetry(event ->
                log.warn("Retry attempt {} for paymentService — cause: {}",
                    event.getNumberOfRetryAttempts(),
                    event.getLastThrowable().getMessage()))
            .onError(event ->
                log.error("All {} retries exhausted for paymentService",
                    event.getNumberOfRetryAttempts()))
            .onSuccess(event -> {
                if (event.getNumberOfRetryAttempts() > 0)
                    log.info("Recovered after {} retries", event.getNumberOfRetryAttempts());
            });
    }
}
${F}

**What you see in logs:**
${F}
WARN  Retry attempt 1 for paymentService — cause: Connection refused
WARN  Retry attempt 2 for paymentService — cause: Connection refused
WARN  Retry attempt 3 for paymentService — cause: Connection refused
ERROR All 3 retries exhausted for paymentService
${F}

---

## Step 4 — Test retry behavior

${F}java
@SpringBootTest
class PaymentServiceRetryTest {

    @MockBean
    private PaymentClient paymentClient;

    @Autowired
    private PaymentService paymentService;

    @Test
    void retries3TimesBeforeFailing() {
        // Fail twice, succeed on 3rd attempt
        when(paymentClient.charge(any()))
            .thenThrow(new IOException("timeout"))
            .thenThrow(new IOException("timeout"))
            .thenReturn(PaymentResult.success("order-1"));

        PaymentResult result = paymentService.processPayment(new PaymentRequest("order-1"));

        assertThat(result.isSuccess()).isTrue();
        verify(paymentClient, times(3)).charge(any()); // called 3 times
    }
}
${F}

---

## 💡 Interview answer

**Open:** "After a 2-minute payment gateway outage, we saw a massive spike when it came back up — 1000 microservice instances all retried at the exact same 1-second intervals, and we essentially DDoS'd the recovering service."

**Then:** "I added exponential backoff with 50% jitter using Resilience4j. With jitter, each instance's retry delay varies by ±50% — 1000 instances that would all retry at exactly t+1s now spread across t+0.75s to t+1.25s. The load on the recovering service dropped to manageable levels."

**End:** "The critical config detail: set \`ignoreExceptions\` for business validation errors — you never want to retry a 400 Bad Request or a duplicate order error. Only retry transient infrastructure failures like \`IOException\` or \`ConnectException\`. Retrying non-retryable errors burns all your attempts and delays the real failure response."
`.trim(),

'th-rate-limit-cascade': `
## 🔥 The situation

Your service has a rate limiter to protect itself — max 100 requests/second. But when a downstream service starts being slow, your callers get 429 Too Many Requests. They retry with backoff. The retries create more load. Your rate limiter trips harder. The downstream service, already slow, gets hammered with retries. A single slow dependency has caused a cascading failure across the entire call chain.

---

## 🧠 Understand this first

| Concept | What it means |
|---|---|
| **Rate limiter** | Limits how many calls pass through per time unit |
| **429 Too Many Requests** | HTTP status when rate limit is exceeded |
| **Retry storm** | Callers retry 429s, creating more requests, causing more 429s — positive feedback loop |
| **Retry-After header** | Tell callers how long to wait — prevents immediate retry |
| **Token bucket** | Tokens accumulate up to a burst size; each request spends one token |
| **Adaptive rate limiting** | Automatically adjusts limit based on downstream response times |

---

## Step 1 — Configure Resilience4j rate limiter

${F}yaml
# application.yml
resilience4j:
  ratelimiter:
    instances:
      orderService:
        limitForPeriod: 100         # 100 requests...
        limitRefreshPeriod: 1s      # ...per second
        timeoutDuration: 0ms        # reject immediately if limit exceeded (don't queue)
${F}

---

## Step 2 — Apply rate limiter and return proper 429

${F}java
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @RateLimiter(name = "orderService", fallbackMethod = "rateLimitFallback")
    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody OrderRequest request) {
        return ResponseEntity.ok(orderService.create(request));
    }

    // Called when rate limit exceeded
    public ResponseEntity<Order> rateLimitFallback(
            OrderRequest request, RequestNotPermitted ex) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
            .header("Retry-After", "1")         // tell client to wait 1 second
            .header("X-RateLimit-Limit", "100")
            .header("X-RateLimit-Reset", String.valueOf(
                Instant.now().plusSeconds(1).getEpochSecond()))
            .body(null);
    }
}
${F}

**What the client sees:**
${F}
HTTP/1.1 429 Too Many Requests
Retry-After: 1
X-RateLimit-Limit: 100
X-RateLimit-Reset: 1705318986

{"error": "Rate limit exceeded. Try again in 1 second."}
${F}

---

## Step 3 — Add rate limiting on outbound calls (to protect downstream)

Rate limit your own outbound calls so you don't overwhelm a downstream service:

${F}java
@Service
public class InventoryClient {

    @RateLimiter(name = "inventoryService")
    @Retry(name = "inventoryService")
    @CircuitBreaker(name = "inventoryService")
    public InventoryResult checkStock(String productId) {
        // Rate-limited: won't call inventory more than 50 times/second
        return inventoryApi.check(productId);
    }
}
${F}

${F}yaml
resilience4j:
  ratelimiter:
    instances:
      inventoryService:
        limitForPeriod: 50      # max 50 calls/second to inventory service
        limitRefreshPeriod: 1s
        timeoutDuration: 200ms  # wait up to 200ms for a token
${F}

---

## Step 4 — Prevent retry storms with proper client-side handling

${F}java
@Service
public class ApiClient {

    @Retry(name = "apiClient")
    public Response callApi(Request request) {
        Response response = httpClient.execute(request);

        if (response.getStatusCode() == 429) {
            // Read Retry-After header and tell Resilience4j to wait
            String retryAfter = response.getHeader("Retry-After");
            int waitSeconds = Integer.parseInt(retryAfter);
            throw new RateLimitException("Rate limited. Wait " + waitSeconds + "s",
                Duration.ofSeconds(waitSeconds));
        }

        return response;
    }
}
${F}

${F}yaml
# Configure retry to respect Retry-After
resilience4j:
  retry:
    instances:
      apiClient:
        maxAttempts: 3
        waitDuration: 1s
        enableExponentialBackoff: true
        enableRandomizedWait: true
        randomizedWaitFactor: 0.5
        retryExceptions:
          - com.example.exception.RateLimitException
${F}

---

## Step 5 — Monitor rate limiter metrics

${F}bash
curl http://localhost:8080/actuator/metrics/resilience4j.ratelimiter.available.permissions
${F}

**Alert when rate limiter is constantly at zero (you're always throttled):**
${F}yaml
- alert: RateLimiterExhausted
  expr: resilience4j_ratelimiter_available_permissions{name="orderService"} == 0
  for: 30s
  annotations:
    summary: "Order service rate limit constantly exhausted — consider increasing limit or scaling"
${F}

---

## 💡 Interview answer

**Open:** "We had a cascade: our payment service got slow, causing our order service to queue requests. The rate limiter then started returning 429s, clients retried, and the retry storm made the payment service slower — a positive feedback loop."

**Then:** "Two changes broke the cycle: First, I added \`Retry-After\` headers to our 429 responses so clients backed off properly. Second, I added outbound rate limiting on our payment client — we capped our own call rate to 50/second to the payment service, which prevented us from hammering it when it was degraded."

**End:** "The real fix was circuit breaker + bulkhead on the payment client: when it's slow, the circuit trips OPEN and we return a queued-order response immediately. No more 429s being generated because we're not even trying the call. Rate limiting is a last-resort protection — circuit breakers upstream of it prevent the load from building up in the first place."
`.trim(),

};

const data = JSON.parse(readFileSync(FILE, 'utf8'));
let count = 0;
for (const theme of data.themes) {
  for (const scenario of theme.scenarios) {
    if (answers[scenario.id]) {
      scenario.answer = answers[scenario.id];
      console.log(`✅ ${scenario.id}`);
      count++;
    }
  }
}
writeFileSync(FILE, JSON.stringify(data, null, 2));
console.log(`\nDone — ${count} scenarios rewritten.`);
