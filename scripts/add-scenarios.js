const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/data/scenarioInterviewThemes.json', 'utf8'));

const newThemes = [
  {
    id: 'resilience-patterns-production',
    title: 'Resilience patterns — Circuit Breaker, Retry, Bulkhead',
    subtitle: 'Protecting Java microservices from cascading failures using Resilience4j with real code, config, and production output.',
    tags: ['Resilience4j', 'Circuit Breaker', 'Retry', 'Bulkhead', 'Spring Boot', 'production', 'fault tolerance'],
    scenarios: [
      {
        id: 'th-circuit-breaker-resilience4j',
        question: 'Your API calls a legacy payment system that sometimes takes 5–10 seconds to respond. Under load, threads pile up waiting, your thread pool exhausts, and the whole service crashes. How do you fix this with a Circuit Breaker?',
        signals: ['Circuit Breaker', 'Resilience4j', 'OPEN state', 'HALF_OPEN', 'fallback', 'timeout', '@CircuitBreaker', 'sliding window', 'failure rate threshold', 'cascade failure'],
        answer: `## The situation

Your order service calls a legacy payment gateway. Normally: 200ms. Sometimes: 8–10 seconds or never responds.

Without protection:
\`\`\`text
200 concurrent requests arrive
  → 200 threads waiting for payment gateway (each holding for 10 seconds)
  → Tomcat thread pool default = 200 threads → completely full in < 1 second
  → New requests: "Connection Refused"
  → Your healthy service crashes because of ONE slow dependency
\`\`\`

This is a **cascade failure**. One slow dependency kills everything.

---

## Understand this first — what is a Circuit Breaker?

Think of a home circuit breaker (MCB):
- Normal → circuit CLOSED → electricity flows
- Overload → circuit OPENS → cuts power to prevent fire
- After a wait → circuit HALF-OPEN → tests if safe again

In your Java service:
| State | What happens | When it transitions |
|-------|-------------|-------------------|
| CLOSED | All calls go to payment gateway | failure rate > 50% → OPEN |
| OPEN | All calls return fallback immediately (< 1ms) | After 10s wait → HALF_OPEN |
| HALF_OPEN | 3 test calls go through | 2/3 succeed → CLOSED, else → OPEN again |

---

## Step 1 — Add Resilience4j to pom.xml

\`\`\`xml
<dependency>
    <groupId>io.github.resilience4j</groupId>
    <artifactId>resilience4j-spring-boot3</artifactId>
    <version>2.2.0</version>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-aop</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
\`\`\`

---

## Step 2 — Configure in application.yml

\`\`\`yaml
resilience4j:
  circuitbreaker:
    instances:
      paymentService:
        sliding-window-type: COUNT_BASED
        sliding-window-size: 10           # look at last 10 calls
        failure-rate-threshold: 50        # OPEN when 50% of calls fail
        slow-call-rate-threshold: 50      # OPEN when 50% of calls are slow
        slow-call-duration-threshold: 3s  # slow = takes more than 3 seconds
        wait-duration-in-open-state: 10s  # stay OPEN 10s before testing again
        permitted-number-of-calls-in-half-open-state: 3
        register-health-indicator: true   # expose state via /actuator/health
  timelimiter:
    instances:
      paymentService:
        timeout-duration: 4s              # hard timeout — thread never waits > 4s
\`\`\`

**In plain English:**
- After 5 of 10 calls fail or are slow → open the circuit
- Wait 10 seconds, then test with 3 real calls
- Hard 4-second timeout: no thread ever blocks for more than 4 seconds

---

## Step 3 — Use @CircuitBreaker in your service

\`\`\`java
@Service
public class PaymentService {

    private final PaymentGatewayClient gatewayClient;
    private final PendingPaymentQueue pendingQueue;

    @CircuitBreaker(name = "paymentService", fallbackMethod = "paymentFallback")
    @TimeLimiter(name = "paymentService")   // enforces the 4s hard timeout
    public CompletableFuture<PaymentResult> charge(PaymentRequest request) {
        return CompletableFuture.supplyAsync(() -> {
            log.info("Calling payment gateway for order {}", request.getOrderId());
            return gatewayClient.charge(request);  // may be slow
        });
    }

    // Fallback is called when:
    // 1. Method throws an exception
    // 2. Timeout exceeded (4s)
    // 3. Circuit is OPEN (no HTTP call made — fallback runs immediately)
    // Must have same parameters + Throwable at end
    public CompletableFuture<PaymentResult> paymentFallback(
            PaymentRequest request, Throwable ex) {

        log.warn("Payment gateway unavailable for order {}. Cause: {}",
                request.getOrderId(), ex.getMessage());

        // Queue the payment for retry by a background job
        pendingQueue.add(request);

        return CompletableFuture.completedFuture(
            PaymentResult.pending("Payment queued — will complete in 30 seconds")
        );
    }
}
\`\`\`

---

## Step 4 — What you see in logs

**Normal operation (CLOSED):**
\`\`\`text
INFO  PaymentService - Calling payment gateway for order ORD-1001
INFO  PaymentService - Calling payment gateway for order ORD-1002
INFO  PaymentService - Calling payment gateway for order ORD-1003
\`\`\`

**After 5 of 10 calls are slow — circuit OPENS:**
\`\`\`text
WARN  PaymentService - Payment gateway unavailable for order ORD-1006.
  Cause: CircuitBreaker 'paymentService' is OPEN and does not permit further calls
WARN  PaymentService - Payment gateway unavailable for order ORD-1007.
  Cause: CircuitBreaker 'paymentService' is OPEN and does not permit further calls
# No more actual HTTP calls to payment gateway
# Each fallback completes in < 1ms — thread pool stays free
# Orders are queued for retry — users see "payment queued" not "500 error"
\`\`\`

**After 10s — HALF_OPEN testing:**
\`\`\`text
INFO  PaymentService - Calling payment gateway for order ORD-1010  ← test call 1
INFO  PaymentService - Calling payment gateway for order ORD-1011  ← test call 2
INFO  PaymentService - Calling payment gateway for order ORD-1012  ← test call 3
INFO  CircuitBreakerStateMachine - 'paymentService' changed: HALF_OPEN → CLOSED
# All 3 test calls succeeded → normal operation resumes automatically
\`\`\`

---

## Step 5 — Monitor circuit state via Actuator

\`\`\`bash
curl http://localhost:8080/actuator/health
\`\`\`

**CLOSED (healthy):**
\`\`\`json
{
  "status": "UP",
  "components": {
    "circuitBreakers": {
      "details": {
        "paymentService": {
          "status": "UP",
          "details": {
            "state": "CLOSED",
            "failureRate": "10.0%",
            "slowCallRate": "0.0%",
            "bufferedCalls": 10,
            "failedCalls": 1
          }
        }
      }
    }
  }
}
\`\`\`

**OPEN (broken dependency):**
\`\`\`json
{
  "status": "DOWN",
  "details": {
    "paymentService": {
      "status": "CIRCUIT_OPEN",
      "details": {
        "state": "OPEN",
        "failureRate": "70.0%",
        "failedCalls": 7
      }
    }
  }
}
\`\`\`

**What this means:** Kubernetes readiness probe hits /actuator/health. OPEN circuit → probe returns DOWN → Kubernetes removes this pod from load balancer. Pod does NOT crash — it steps aside until the payment gateway recovers.

---

## Your interview answer

**Open:** "The root cause is threads blocking on a slow dependency. With a fixed thread pool, enough slow calls fill it completely and even unrelated endpoints stop responding."

**Then:** "I add Resilience4j @CircuitBreaker configured with: 50% failure threshold over last 10 calls, 10s open duration, 4s hard timeout via @TimeLimiter. After 5 slow calls, the circuit opens — subsequent calls hit the fallback in < 1ms instead of blocking for 4 seconds."

**Then:** "The fallback queues the payment for async retry. Users see 'payment processing' not a 500 error. After 10 seconds, the circuit goes HALF_OPEN, allows 3 test calls, and closes automatically if they succeed."

**End:** "Circuit state is visible via Actuator — Kubernetes readiness probes use it, Prometheus scrapes it, Grafana alerts when circuit opens in production."`,
        followUps: [
          {
            question: 'What is the difference between a Circuit Breaker and a Retry?',
            answer: '**Retry:** Automatically retries N times before giving up. Good for transient failures (network blips, temporary 503 that recovers in seconds). **Danger of Retry alone:** if the service is consistently slow, retrying amplifies load — 100 threads retrying 3 times = 300 calls hitting an already struggling dependency. **Circuit Breaker:** Stops calling the failing service entirely after a threshold. Good for persistent failures — protects your thread pool and gives the dependency time to recover. **Combined pattern (correct order):** Retry inside, Circuit Breaker outside. Retries handle occasional blips. If blips persist, Circuit Breaker opens and stops retrying. In Resilience4j: `@CircuitBreaker(name = "payment") @Retry(name = "payment")` — Retry runs inside the Circuit Breaker boundary. **Interview line:** "Retry is optimistic — assumes the failure is temporary. Circuit Breaker is defensive — assumes the dependency is broken and shields your own system from it."'
          },
          {
            question: 'How do you tune Circuit Breaker thresholds in production?',
            answer: '**Step 1 — Measure your baseline first.** Normal failure rate should be < 1–2%, normal p99 latency < 300ms. **Step 2 — Set failure threshold well above baseline noise.** If normal failure rate is 2%, set threshold at 30–50%. Setting at 5% causes false trips on normal noise. Setting at 80% is too lenient — users suffer too long before protection kicks in. **Step 3 — Set open duration to match your dependency\'s typical recovery time.** Payment gateway recovers in 30–60 seconds → open duration: 30s. DB restart takes 2 minutes → 120s. **Step 4 — Monitor and adjust using real data.** Prometheus: `resilience4j_circuitbreaker_calls_seconds_count{name="paymentService", kind="failed"}`. Watch Grafana for: circuit oscillating rapidly (opening and closing every few seconds) → increase threshold or open duration. Circuit never opening when dependency is clearly broken → lower threshold. **Safe starter config:** sliding-window: 20 calls, failure-rate: 50%, slow-call threshold: 3s, open-duration: 30s — tune after observing a month of production data.'
          },
          {
            question: 'What is Bulkhead isolation and when do you combine it with Circuit Breaker?',
            answer: '**Problem without Bulkhead:** All your dependencies (Payment, Inventory, Notification) share the same Tomcat thread pool (200 threads). Payment slows down → consumes all 200 threads → Inventory and Notification endpoints also stop responding even though those services are healthy. **Bulkhead:** Gives each dependency its own isolated concurrency limit. Payment: max 20 concurrent calls. Inventory: max 20. Even if Payment exhausts its 20, Inventory still has its own 20. **Resilience4j config:**\n```yaml\nresilience4j:\n  bulkhead:\n    instances:\n      paymentService:\n        max-concurrent-calls: 10      # at most 10 simultaneous calls to payment\n        max-wait-duration: 0ms         # if all 10 busy → reject immediately\n      inventoryService:\n        max-concurrent-calls: 20\n```\n**When bulkhead is full:** `BulkheadFullException: Bulkhead \'paymentService\' is full` → fallback called immediately — no blocking. **Combined use:** Bulkhead (concurrent call limit) + Circuit Breaker (failure rate threshold) + TimeLimiter (hard timeout per call) = complete protection. Use all three together for any external dependency in a production service.'
          }
        ]
      },
      {
        id: 'th-transactional-outbox-pattern',
        question: 'Your async notification service writes orders to DB then publishes to Kafka. The service crashed between the two steps. 500 events were lost. How do you guarantee zero event loss?',
        signals: ['Transactional Outbox', 'dual write problem', 'at-least-once delivery', 'idempotency key', 'outbox table', 'message relay', 'outbox poller', 'SKIP LOCKED'],
        answer: `## The situation

Your order service needs to do two things atomically:
1. Save order to DB
2. Publish OrderPlaced event to Kafka → Notification service sends email

**The broken code:**
\`\`\`java
@Transactional
public void placeOrder(Order order) {
    orderRepo.save(order);                    // Step 1: DB write ✓
    kafkaTemplate.send("orders",              // Step 2: Kafka publish
        new OrderPlacedEvent(order));         //         service crashes HERE ✗
}
// If crash between step 1 and 2:
// Order saved in DB: YES ✓
// Event published to Kafka: NO ✗
// Customer email sent: NO ✗ — customer has no idea their order exists
\`\`\`

This is the **dual write problem**. A Java @Transactional only covers the DB connection — not Kafka. You cannot atomically commit to two different systems.

---

## Why you can't just use @Transactional to cover both?

\`\`\`java
// ❌ This does NOT work
@Transactional
public void placeOrder(Order order) {
    orderRepo.save(order);               // DB transaction: protected ✓
    kafkaTemplate.send("orders", event); // Kafka: NOT part of DB transaction ✗
}
// Kafka has no concept of "rollback" in a DB sense
// If crash after save() but before send(): order in DB, no Kafka event
\`\`\`

---

## The fix — Transactional Outbox Pattern

**Core idea:** Write the Kafka event to an `outbox` table INSIDE the same DB transaction as your business data. A separate relay process reads the outbox and publishes to Kafka.

\`\`\`text
BEFORE (broken):                 AFTER (Outbox):

Order Service                    Order Service
  ├── Save order to DB           ├── Save order to DB      ←── ONE atomic DB transaction
  └── Publish to Kafka ✗         └── Save to outbox table  ←──
        (not atomic)
                                            ↓
                                 Outbox Relay (separate process)
                                   ├── Read unpublished events from outbox
                                   ├── Publish to Kafka → Notification Service
                                   └── Mark event as published
\`\`\`

**Why this is safe:** DB transactions are atomic — order row and outbox row either BOTH commit or BOTH roll back. The event is never lost even if the app crashes mid-method.

---

## Step 1 — Create the outbox table

\`\`\`sql
-- Liquibase/Flyway migration
CREATE TABLE outbox_events (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_type VARCHAR(100) NOT NULL,   -- 'ORDER'
    aggregate_id   VARCHAR(100) NOT NULL,   -- '1001' (the order ID)
    event_type     VARCHAR(100) NOT NULL,   -- 'OrderPlaced'
    payload        JSONB        NOT NULL,   -- full event JSON (Kafka message body)
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    published_at   TIMESTAMPTZ  NULL        -- NULL = not yet published to Kafka
);

-- Partial index — only covers unpublished rows → very fast polling queries
CREATE INDEX idx_outbox_unpublished
    ON outbox_events (created_at)
    WHERE published_at IS NULL;
\`\`\`

---

## Step 2 — Write order + outbox event in one transaction

\`\`\`java
@Service
public class OrderService {

    private final OrderRepository orderRepo;
    private final OutboxEventRepository outboxRepo;
    private final ObjectMapper objectMapper;

    @Transactional  // ONE transaction covers BOTH the order save and the outbox save
    public Order placeOrder(OrderRequest request) {
        // Step A: save the business data
        Order order = orderRepo.save(new Order(request));

        // Step B: save the outbox event in the SAME transaction
        // If this transaction rolls back → BOTH order AND outbox event disappear
        // If it commits → BOTH are guaranteed to exist in DB
        String payload = objectMapper.writeValueAsString(
            new OrderPlacedEvent(order.getId(), order.getUserId(),
                order.getTotalAmount(), Instant.now())
        );

        outboxRepo.save(OutboxEvent.builder()
            .aggregateType("ORDER")
            .aggregateId(order.getId().toString())
            .eventType("OrderPlaced")
            .payload(payload)
            .build());

        log.info("Order {} created with outbox event — relay will publish to Kafka", order.getId());
        return order;
        // On return: order AND outbox event are committed atomically to DB
        // No Kafka call here — the relay handles that separately
    }
}
\`\`\`

---

## Step 3 — Relay publishes outbox events to Kafka

\`\`\`java
@Component
public class OutboxRelay {

    private final OutboxEventRepository outboxRepo;
    private final KafkaTemplate<String, String> kafka;

    // Runs every 1 second
    @Scheduled(fixedDelay = 1000)
    @Transactional
    public void publishPendingEvents() {
        // Find up to 100 unpublished events, oldest first
        // FOR UPDATE SKIP LOCKED: if you run multiple relay pods, each pod grabs
        // different events — no duplicate publishing
        List<OutboxEvent> pending = outboxRepo
            .findByPublishedAtIsNullOrderByCreatedAtAsc(PageRequest.of(0, 100));

        for (OutboxEvent event : pending) {
            try {
                // .get() waits for Kafka broker acknowledgment before marking published
                kafka.send(
                    event.getAggregateType().toLowerCase() + "-events",  // "order-events"
                    event.getAggregateId(),   // Kafka key → ordering within same order
                    event.getPayload()        // JSON string
                ).get();

                // Mark as published — won't be picked up again
                event.setPublishedAt(Instant.now());
                outboxRepo.save(event);

                log.info("Published {} for {}/{} to Kafka",
                    event.getEventType(), event.getAggregateType(), event.getAggregateId());

            } catch (Exception e) {
                // Kafka unavailable — publishedAt stays NULL → retried next second
                log.error("Failed to publish outbox event {}: {}", event.getId(), e.getMessage());
            }
        }
    }
}
\`\`\`

**Log output (healthy relay):**
\`\`\`text
INFO  OutboxRelay - Published OrderPlaced for ORDER/1001 to Kafka
INFO  OutboxRelay - Published OrderPlaced for ORDER/1002 to Kafka
INFO  OutboxRelay - Published OrderPlaced for ORDER/1003 to Kafka
\`\`\`

**Log output (Kafka temporarily down):**
\`\`\`text
ERROR OutboxRelay - Failed to publish outbox event abc-123: Connection refused to kafka:9092
ERROR OutboxRelay - Failed to publish outbox event abc-123: Connection refused to kafka:9092
# Event stays in outbox (published_at = NULL)
# Will retry every second — nothing is lost
# DB has the order safely committed — service can even restart and continue
\`\`\`

---

## Step 4 — Make the consumer idempotent

The relay provides at-least-once delivery. If Kafka publish succeeds but marking as published fails, the event is published again. The consumer must handle duplicates safely.

\`\`\`java
@Component
public class NotificationConsumer {

    private final ProcessedEventRepository processedRepo;
    private final EmailService emailService;

    @KafkaListener(topics = "order-events", groupId = "notification-service")
    public void handle(ConsumerRecord<String, String> record) {
        OrderPlacedEvent event = parseEvent(record.value());

        // Idempotency key: unique per business event (event-type + entity-id)
        String idempotencyKey = "order-placed:" + event.getOrderId();

        // Check if we already processed this event
        if (processedRepo.existsByIdempotencyKey(idempotencyKey)) {
            log.info("Duplicate event for order {} — skipping (email already sent)",
                event.getOrderId());
            return;  // safe to skip — email already sent
        }

        // First time processing this event — send the email
        emailService.sendOrderConfirmation(event);

        // Record that we processed it — prevents future duplicates
        processedRepo.save(new ProcessedEvent(idempotencyKey, Instant.now()));

        log.info("Confirmation email sent for order {}", event.getOrderId());
    }
}
\`\`\`

**Log output showing idempotency working:**
\`\`\`text
INFO  NotificationConsumer - Confirmation email sent for order ORD-1001
INFO  NotificationConsumer - Duplicate event for order ORD-1001 — skipping (email already sent)
# First delivery: email sent. Second delivery (duplicate): safely ignored.
# Customer receives exactly ONE email.
\`\`\`

---

## Your interview answer

**Open:** "The dual write problem — you cannot atomically write to DB and Kafka. A crash between the two always loses the event, and there is no way to make @Transactional cover both systems."

**Then:** "The Transactional Outbox pattern solves this by writing the Kafka event payload to an outbox table INSIDE the same DB transaction as the order. DB transactions are atomic — both commit or both roll back. The event is never lost."

**Then:** "A relay process polls the outbox every second and publishes to Kafka. It provides at-least-once delivery — if relay crashes after publishing but before marking done, the event is sent again. So the consumer must be idempotent: it checks an idempotency key before processing."

**End:** "This guarantees: no lost events (outbox in same transaction), no duplicate emails (idempotency key in consumer). Trade-off: eventual consistency — up to 1 second delay. Acceptable for notifications."`,
        followUps: [
          {
            question: 'What is the difference between at-least-once and exactly-once delivery in Kafka?',
            answer: '**At-least-once:** Producer retries on failure → consumer may receive duplicates → consumer must be idempotent. Most common Kafka setup. Simpler, faster, more resilient to broker issues. **Exactly-once:** Kafka 0.11+ Exactly-Once Semantics (EOS). Producer uses `transactional.id` — if the same message is retried, Kafka deduplicates at the broker before the consumer ever sees it. **Spring Boot config for exactly-once:**\n```yaml\nspring.kafka.producer.transaction-id-prefix: my-app-tx-\nspring.kafka.producer.acks: all\nspring.kafka.producer.properties.enable.idempotence: true\n```\n**The real trade-off:** Exactly-once adds 20–30% latency overhead, is harder to configure correctly, and breaks in some edge cases (rebalances, broker failovers). Most production systems use at-least-once with idempotent consumers — same practical outcome, simpler system. **Interview line:** "I prefer at-least-once with idempotent consumers. Same practical result as exactly-once, but simpler to reason about, easier to test, and more resilient to Kafka infrastructure issues."'
          },
          {
            question: 'What happens if the outbox relay itself crashes — are events delayed or lost?',
            answer: '**Delayed, never lost.** The outbox event stays in DB with `published_at = NULL`. When the relay pod restarts (10–30 seconds in Kubernetes), it queries for all NULL published_at events and processes them oldest-first. **Prevent two relay pods from double-processing:** use `SELECT ... FOR UPDATE SKIP LOCKED` in your repository query:\n```java\n@Query(value = "SELECT * FROM outbox_events WHERE published_at IS NULL ORDER BY created_at LIMIT 100 FOR UPDATE SKIP LOCKED", nativeQuery = true)\nList<OutboxEvent> findUnpublishedWithLock();\n```\n`SKIP LOCKED` means: if relay pod A already locked event row 123, pod B skips it and takes the next unlocked row. No duplicate publishing, no blocking between pods. **Alternative — Debezium CDC:** Instead of polling, Debezium reads the PostgreSQL Write-Ahead Log (WAL) and streams outbox table inserts directly to Kafka. Sub-second latency, no polling overhead, no duplicate risk. Production-grade for high-volume systems. **Monitoring:** `SELECT COUNT(*) FROM outbox_events WHERE published_at IS NULL` → alert if this stays above 100 for more than 30 seconds — relay may be stuck.'
          },
          {
            question: 'How do you clean up the outbox table so it does not grow forever?',
            answer: '**Published events (published_at IS NOT NULL) are safe to delete.** **Scheduled cleanup:**\n```java\n@Scheduled(cron = "0 0 2 * * *")  // 2 AM every night\n@Transactional\npublic void cleanupPublishedEvents() {\n    Instant cutoff = Instant.now().minus(Duration.ofDays(7));  // keep 7 days for debugging\n    int deleted = outboxRepo.deleteByPublishedAtBefore(cutoff);\n    log.info("Outbox cleanup: deleted {} published events older than 7 days", deleted);\n}\n```\n**Expected log:**\n```text\nINFO  OutboxCleanup - Outbox cleanup: deleted 142,847 published events older than 7 days\n```\n**Monitor outbox health in Grafana:**\n```sql\n-- Add this as a Prometheus metric via Spring Actuator custom gauge\nSELECT COUNT(*) FROM outbox_events WHERE published_at IS NULL\n```\nAlert when this count stays above 1,000 for more than 1 minute — relay is failing to publish and events are accumulating. Normal value: near 0 (events published within 1–2 seconds of being written).'
          }
        ]
      }
    ]
  },
  {
    id: 'chaos-engineering-java',
    title: 'Chaos Engineering for Java microservices',
    subtitle: 'Design and run controlled chaos experiments using ToxiProxy and Chaos Monkey for Spring Boot — with real Docker commands, expected output, and hypothesis validation.',
    tags: ['Chaos Engineering', 'ToxiProxy', 'Chaos Monkey', 'Resilience4j', 'fault injection', 'Spring Boot', 'production testing'],
    scenarios: [
      {
        id: 'th-chaos-experiment-payment',
        question: 'How would you implement Chaos Engineering for a critical payment microservice? Walk through one complete experiment from hypothesis to fix validation with real commands and expected output.',
        signals: ['chaos experiment', 'hypothesis', 'blast radius', 'ToxiProxy', 'Chaos Monkey for Spring Boot', 'latency injection', 'circuit breaker validation', 'steady state definition'],
        answer: `## What is Chaos Engineering?

Deliberately injecting failures into your system in a controlled way to find weaknesses before real outages find them.

**Fire drill analogy:** You trigger a fire alarm on purpose to test evacuation routes, sprinklers, and exits. Without drills, the first real fire is a disaster. Without chaos experiments, the first real outage is your test.

**4-step process every time:**
1. Define steady state — what does "healthy" look like with real numbers?
2. Form hypothesis — "If X breaks, our system should Y"
3. Inject the failure
4. Observe — does reality match the hypothesis?

---

## Experiment: Validate Circuit Breaker protects against slow payment gateway

### Step 1 — Define steady state (measure baseline first)

\`\`\`bash
# Send 50 requests and measure response times
for i in $(seq 1 50); do
  curl -s -o /dev/null -w "%{http_code} %{time_total}s\\n" \\
    http://localhost:8080/api/orders \\
    -X POST -H 'Content-Type: application/json' \\
    -d '{"userId": 1, "amount": 100}'
done
\`\`\`

**Output (healthy baseline):**
\`\`\`text
200 0.187s
200 0.203s
200 0.191s
200 0.178s
...all 50 requests
Average: ~190ms, Max: ~250ms, Error rate: 0%
\`\`\`

**Steady state definition (write this down before injecting chaos):**
- p99 latency: < 300ms
- Error rate: 0%
- Circuit breaker state: CLOSED

### Step 2 — Write the hypothesis

> "If the payment gateway takes 5+ seconds to respond, our Resilience4j circuit breaker should open after 5 slow calls. After it opens, API responses should be < 50ms via fallback. User-visible error rate should stay at 0% (users get 200 with 'payment queued', not 500)."

### Step 3 — Set up ToxiProxy to inject latency

ToxiProxy sits between your service and a dependency, letting you inject controlled failures.

\`\`\`bash
# Run ToxiProxy in Docker
docker run -d --name toxiproxy \\
  -p 8474:8474 \\
  -p 18080:18080 \\
  ghcr.io/shopify/toxiproxy
\`\`\`

**Output:**
\`\`\`text
d3f8a2c1b4e7a9c2d1f0b3e5a8c7d2f1   ← container ID (ToxiProxy is running)
\`\`\`

\`\`\`bash
# Create proxy: localhost:18080 → your-payment-gateway:8080
curl -X POST http://localhost:8474/proxies \\
  -H 'Content-Type: application/json' \\
  -d '{"name":"payment-gateway","listen":"0.0.0.0:18080","upstream":"payment-gateway:8080","enabled":true}'
\`\`\`

**Output:**
\`\`\`json
{"name":"payment-gateway","listen":"[::]:18080","upstream":"payment-gateway:8080","enabled":true,"toxics":[]}
\`\`\`

\`\`\`bash
# Configure app to use proxy (in application-chaos.yml):
# payment.gateway.url: http://localhost:18080

# Inject 5-second latency on ALL requests through the proxy
curl -X POST http://localhost:8474/proxies/payment-gateway/toxics \\
  -H 'Content-Type: application/json' \\
  -d '{
    "name": "slow-latency",
    "type": "latency",
    "attributes": {"latency": 5000, "jitter": 500},
    "toxicity": 1.0
  }'
\`\`\`

**Output:**
\`\`\`json
{"name":"slow-latency","type":"latency","stream":"downstream","toxicity":1,"attributes":{"latency":5000,"jitter":500}}
\`\`\`

**What "toxicity: 1.0" means:** 100% of requests get the 5-second delay. Use 0.1 for 10% — a gentler, more realistic experiment.

### Step 4 — Run load and observe

\`\`\`bash
# Send 20 concurrent requests while latency is active
for i in $(seq 1 20); do
  curl -s -o /dev/null -w "%{http_code} %{time_total}s\\n" \\
    http://localhost:8080/api/orders \\
    -X POST -H 'Content-Type: application/json' \\
    -d '{"userId": 1, "amount": 100}' &
done
wait
\`\`\`

**Output (circuit breaker working correctly):**
\`\`\`text
200 5.012s   ← real call to payment gateway (slow, call 1 of 10)
200 5.087s   ← real call (slow, call 2)
200 5.043s   ← real call (slow, call 3)
200 5.019s   ← real call (slow, call 4)
200 5.091s   ← real call (slow, call 5 — 5/10 = 50% slow → circuit OPENS)
200 0.002s   ← fallback (circuit OPEN — no HTTP call made)
200 0.001s   ← fallback
200 0.001s   ← fallback
200 0.001s   ← fallback
...(all remaining 15: < 2ms via fallback)
\`\`\`

**Hypothesis validated:** After 5 slow calls, circuit opened. All remaining calls respond in < 2ms via fallback. Error rate: 0%. No thread pool exhaustion.

\`\`\`bash
# Confirm circuit state via Actuator
curl -s http://localhost:8080/actuator/health | python -m json.tool | grep '"state"'
\`\`\`

**Output:**
\`\`\`text
"state": "OPEN"
\`\`\`

### Step 5 — Remove chaos and verify recovery

\`\`\`bash
# Remove the latency toxic — payment gateway is "healthy" again
curl -X DELETE http://localhost:8474/proxies/payment-gateway/toxics/slow-latency
\`\`\`

\`\`\`bash
# Watch circuit recover: OPEN → HALF_OPEN → CLOSED
watch -n 3 'curl -s http://localhost:8080/actuator/health | python -m json.tool | grep state'
\`\`\`

**Output over 30 seconds:**
\`\`\`text
"state": "OPEN"       ← (0s: chaos removed but circuit still open — 10s wait remains)
"state": "HALF_OPEN"  ← (10s: testing with 3 real calls)
"state": "CLOSED"     ← (13s: 3 test calls succeeded — fully recovered automatically)
\`\`\`

**Experiment complete.** Circuit breaker opens, protects thread pool, serves users via fallback, and self-heals when dependency recovers. Zero user-visible 500 errors throughout.

---

## Other chaos experiments to run for a payment service

| What to break | ToxiProxy toxic | What you are testing |
|--------------|-----------------|---------------------|
| Payment gateway slow | latency: 5000ms, toxicity: 1.0 | Circuit breaker threshold |
| Payment gateway down | proxy.enabled = false | Fallback + immediate error handling |
| Partial failures (50% affected) | latency, toxicity: 0.5 | Retry logic + error rate |
| DB connection cut | timeout toxic on DB port | Connection pool + readiness probe |
| Kafka slow publish | bandwidth: 10KB/s | Producer timeout + outbox backlog |

---

## Automated chaos in CI with Chaos Monkey for Spring Boot

\`\`\`xml
<!-- pom.xml — runtime only, exclude from production -->
<dependency>
    <groupId>de.codecentric</groupId>
    <artifactId>chaos-monkey-spring-boot</artifactId>
    <version>3.1.0</version>
    <scope>runtime</scope>
</dependency>
\`\`\`

\`\`\`yaml
# application-chaos.yml — active only with chaos Spring profile
chaos:
  monkey:
    enabled: true
    watcher:
      service: true       # inject faults into @Service beans
    assaults:
      level: 5            # every 5th method call gets attacked
      latency-active: true
      latency-range-start: 2000   # inject 2–5 second delays
      latency-range-end: 5000
\`\`\`

\`\`\`bash
# Run integration tests with chaos enabled
./mvnw test -Dspring.profiles.active=chaos
\`\`\`

**What your tests see with circuit breaker working:**
\`\`\`text
PaymentServiceCircuitBreakerTest > verifyCircuitOpensAndFallbackRuns PASSED (10.3s)
# Test: called payment 10 times, verified circuit opened after 5 slow calls,
# verified fallback was called for calls 6–10, verified circuit closed after 10s
\`\`\`

---

## Your interview answer

**Open:** "Chaos Engineering finds weaknesses before users do. For a payment service I focus on three failure modes: dependency latency, connection loss, and partial failures."

**Then:** "I use ToxiProxy to proxy the payment gateway and inject controlled 5-second latency. I define steady state with numbers: p99 < 300ms, error rate 0%, circuit CLOSED. I hypothesize: after 5 slow calls the circuit opens and fallback responds in < 2ms."

**Then:** "I run 20 concurrent requests and observe the circuit opening after call 5. All remaining calls use fallback in < 2ms. I remove the toxic and watch the circuit self-heal from OPEN to CLOSED in 13 seconds."

**End:** "For CI automation I use Chaos Monkey for Spring Boot with the chaos profile — every 5th @Service call gets a random 2–5 second delay injected. This validates resilience patterns on every build without any external tools or manual steps."`,
        followUps: [
          {
            question: 'How do you limit blast radius when running chaos experiments in production?',
            answer: '**Blast radius:** the maximum possible user impact. Goal: learn from failures without actually taking down production. **Controls:** (1) **Toxicity percentage:** `toxicity: 0.05` means only 5% of requests get the toxic effect. 95% of users are completely unaffected. Start at 1%, increase slowly. (2) **Single pod targeting (Chaos Mesh):**\n```yaml\nspec:\n  mode: one           # affect exactly one pod, not all\n  selector:\n    labelSelectors:\n      app: payment-service\n  duration: 5m        # auto-stop — safety net if you forget to clean up\n```\n(3) **Time-boxed experiments:** Always set a `duration` so the experiment auto-stops even if something goes wrong. (4) **Automatic abort:** If Grafana alert fires (error rate > 2%), a webhook calls `DELETE /toxics/slow-latency` automatically. (5) **Off-peak timing:** Run production experiments at 2–4 AM local time — minimum user impact if something unexpected happens. **Key principle:** Never start a chaos experiment if you are already responding to an incident. Chaos is for calm, pre-planned learning — not active firefighting.'
          },
          {
            question: 'What is the difference between chaos testing and load testing?',
            answer: '**Load testing:** Pushes system with high volume of normal traffic to find capacity limits. Questions answered: "At what req/sec does latency degrade? What is my throughput ceiling?" Tools: JMeter, Gatling, k6. **Chaos testing:** Injects abnormal conditions (latency, errors, resource loss) at normal or moderate load. Questions answered: "Does my circuit breaker open when it should? Does my fallback work? Does the system recover automatically?" Tools: ToxiProxy, Chaos Monkey, Chaos Mesh. **Key difference:** Load testing finds WHEN the system breaks under high quantity. Chaos testing finds WHETHER the system handles specific failure types correctly. **Best combined approach:** Run a chaos experiment INSIDE a load test. At 80% of peak load, inject a ToxiProxy latency toxic on the payment gateway. Verify: error rate stays < 0.5%, p99 < 2s, system recovers within 30s after toxic removed. This is the closest simulation to a real production incident you can safely run.'
          },
          {
            question: 'How do you run chaos experiments at the Kubernetes infrastructure level?',
            answer: '**Use Chaos Mesh (CNCF project) — install as a Kubernetes operator:**\n```bash\nhelm repo add chaos-mesh https://charts.chaos-mesh.org\nhelm install chaos-mesh chaos-mesh/chaos-mesh -n chaos-testing --create-namespace\n```\n**Define network latency experiment as a K8s CRD:**\n```yaml\napiVersion: chaos-mesh.org/v1alpha1\nkind: NetworkChaos\nmetadata:\n  name: payment-latency-test\nspec:\n  action: delay\n  mode: one              # affect one random pod\n  selector:\n    labelSelectors:\n      app: payment-service\n  delay:\n    latency: 3000ms\n    jitter: 500ms\n  duration: 5m           # auto-stop after 5 minutes\n```\n```bash\nkubectl apply -f payment-chaos.yaml\nkubectl get networkchaos payment-latency-test -w\n```\n**Output:**\n```text\nNAME                  STATUS    AGE\npayment-latency-test  Running   30s\npayment-latency-test  Paused    5m   ← auto-stopped, no manual cleanup needed\n```\n**Other Chaos Mesh experiment types:** PodChaos (kill random pods), IOChaos (slow disk I/O), StressChaos (CPU or memory pressure), DNSChaos (inject DNS failures). Each is a K8s CRD — defined in YAML, applied with kubectl, version-controlled in git.'
          }
        ]
      }
    ]
  },
  {
    id: 'traffic-spike-scalability',
    title: 'Traffic spikes, rate limiting, and autoscaling',
    subtitle: 'Handling 10x sudden load spikes — rate limiting with Resilience4j, caching, async queuing, and Kubernetes HPA with real commands and output.',
    tags: ['traffic spike', 'rate limiting', 'autoscaling', 'HPA', 'Kafka', 'Redis', 'caching', 'load shedding', 'Spring Boot', 'Kubernetes'],
    scenarios: [
      {
        id: 'th-traffic-spike-200-to-2000',
        question: 'Your service handles 200 req/sec normally. On a sale event, traffic spikes to 2000 req/sec. DB connections exhaust, memory spikes, and pods crash within 3 minutes. What do you do — both immediately and architecturally?',
        signals: ['rate limiting', 'load shedding', 'horizontal scaling', 'HPA', 'caching', 'async queue', 'connection pool', 'graceful degradation', 'Resilience4j RateLimiter', 'kubectl scale'],
        answer: `## The situation

Normal: 200 req/sec → 20 DB queries/sec → pool of 20 connections: comfortable.
Sale: 2000 req/sec → 200 DB queries/sec → 20 connections immediately exhausted → threads queue → memory spikes → OOM → pods crash.

You have two timelines:
- **Right now (next 5 minutes):** Stop the bleeding
- **Before the next sale event (architectural):** Make this never happen again

---

## Immediate response — first 5 minutes

### Step 1 — Scale pods immediately

\`\`\`bash
kubectl scale deployment order-service --replicas=20 -n production
\`\`\`

**Output:**
\`\`\`text
deployment.apps/order-service scaled
\`\`\`

\`\`\`bash
kubectl get pods -n production -l app=order-service -w
\`\`\`

**Output (pods starting):**
\`\`\`text
order-service-abc-1    0/1   ContainerCreating   0   5s
order-service-abc-2    0/1   ContainerCreating   0   5s
order-service-abc-1    1/1   Running             0   2m15s  ← now taking traffic
order-service-abc-2    1/1   Running             0   2m18s
...
order-service-abc-20   1/1   Running             0   3m42s  ← all 20 running
\`\`\`

**Problem:** Spring Boot takes 2–4 minutes to start. During that window, rate limiting is essential.

### Step 2 — Enable rate limiting to protect the running pods

\`\`\`yaml
# application.yml
resilience4j:
  ratelimiter:
    instances:
      orderEndpoint:
        limit-for-period: 400    # 400 req/sec maximum (what your original pods can handle)
        limit-refresh-period: 1s
        timeout-duration: 0ms    # reject immediately — no queueing
\`\`\`

\`\`\`java
@RestController
public class OrderController {

    @RateLimiter(name = "orderEndpoint", fallbackMethod = "rateLimitFallback")
    @PostMapping("/orders")
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest req) {
        return ResponseEntity.ok(orderService.placeOrder(req));
    }

    // Called when rate limit exceeded — returns 429 immediately
    public ResponseEntity<?> rateLimitFallback(OrderRequest req, RequestNotPermitted ex) {
        return ResponseEntity
            .status(HttpStatus.TOO_MANY_REQUESTS)
            .header("Retry-After", "5")   // tell client to retry in 5 seconds
            .body(Map.of("message", "High traffic — please retry in 5 seconds"));
    }
}
\`\`\`

**What 400 users per second see (within limit):**
\`\`\`text
HTTP/1.1 200 OK
{"orderId": "ORD-1001", "status": "PROCESSING"}
\`\`\`

**What 1600 users per second see (over limit):**
\`\`\`text
HTTP/1.1 429 Too Many Requests
Retry-After: 5
{"message": "High traffic — please retry in 5 seconds"}
\`\`\`

**What this achieves:** 400 req/sec served perfectly. The other 1600 get a fast 429 in < 1ms — no DB hit, no thread consumed. 429 is far better than 500 — clients know to retry, not abandon.

---

## Architectural fixes — before the next spike

### Fix 1 — Cache product reads in Redis

During a sale, 90% of requests read product prices and catalog. These change once a day. Cache them.

\`\`\`java
@Service
public class ProductService {

    private final ProductRepository productRepo;
    private final RedisTemplate<String, Product> redis;
    private final Random random = new Random();

    public Product getProduct(Long id) {
        String key = "product:" + id;

        // Try Redis first — O(1), < 1ms, no DB connection needed
        Product cached = (Product) redis.opsForValue().get(key);
        if (cached != null) return cached;   // ← 99% of sale traffic returns here

        // Cache miss → DB query (only happens for new/expired entries)
        Product product = productRepo.findById(id).orElseThrow();

        // TTL with jitter to prevent mass expiry at same time (cache stampede prevention)
        // Without jitter: all 10,000 products expire at exactly 5min → all miss → DB stampede
        // With jitter: products expire randomly across 5–6 minutes → smooth load
        redis.opsForValue().set(key, product, Duration.ofSeconds(300 + random.nextInt(60)));
        return product;
    }
}
\`\`\`

**Impact on DB load:**
\`\`\`text
Before caching:  2000 product reads/sec → 2000 DB queries/sec → DB overwhelmed
After caching:   2000 product reads/sec → ~20 DB queries/sec (only cache misses)
\`\`\`

### Fix 2 — Convert order writes to async

Synchronous order processing holds a thread and connection for 2–3 seconds per request (payment gateway + email + inventory). At 2000 req/sec this needs 6000 simultaneous threads. Tomcat default: 200. Crash guaranteed.

\`\`\`java
// ❌ Synchronous: thread held 3+ seconds per request
@PostMapping("/orders")
public ResponseEntity<?> createOrder(@RequestBody OrderRequest req) {
    Order order = orderRepo.save(new Order(req));          // 10ms
    inventoryService.reserve(req);                         // 200ms (HTTP call)
    PaymentResult pay = paymentService.charge(req);        // 2000ms (payment gateway)
    emailService.sendConfirmation(req);                    // 800ms (email API)
    return ResponseEntity.ok(order);                       // total: ~3 seconds
}
// At 2000 req/sec needs 6000 concurrent threads → CRASH

// ✅ Async: thread held < 10ms per request
@PostMapping("/orders")
public ResponseEntity<?> createOrder(@RequestBody OrderRequest req) {
    // Save order with PENDING status — one fast DB insert
    Order order = orderRepo.save(new Order(req, OrderStatus.PENDING));

    // Publish to Kafka — takes < 5ms
    kafkaTemplate.send("order-requests", order.getId().toString(),
        new OrderCreatedEvent(order));

    // Return immediately — thread is FREE in < 10ms
    return ResponseEntity.status(HttpStatus.ACCEPTED)
        .body(Map.of(
            "orderId", order.getId(),
            "status", "PROCESSING",
            "message", "Order confirmed. Email coming in < 30 seconds."
        ));
    // Background: Kafka consumers handle inventory, payment, email at their own pace
}
\`\`\`

**Thread comparison:**
\`\`\`text
Synchronous at 2000 req/sec:
  2000 req × 3s each = 6000 threads needed → CRASH (Tomcat max: 200)

Async at 2000 req/sec:
  2000 req × 10ms each = 20 threads needed → COMFORTABLE
  Kafka buffers up to millions of events — processes at 500 events/sec safely
\`\`\`

### Fix 3 — Kubernetes HPA for automatic scaling

\`\`\`yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: order-service-hpa
  namespace: production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: order-service
  minReplicas: 3
  maxReplicas: 50
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilizationPercentage: 70  # scale up when avg CPU > 70%
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilizationPercentage: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 30    # scale up quickly (30s stability window)
    scaleDown:
      stabilizationWindowSeconds: 300   # scale down slowly (5 min — avoid thrashing)
\`\`\`

\`\`\`bash
kubectl apply -f hpa.yaml
kubectl get hpa order-service-hpa -w
\`\`\`

**Output during traffic spike:**
\`\`\`text
NAME                TARGETS          REPLICAS
order-service-hpa   25%/70%          3         ← normal
order-service-hpa   91%/70%          3         ← spike hitting
order-service-hpa   89%/70%          6         ← scaling up
order-service-hpa   72%/70%          10        ← still scaling
order-service-hpa   58%/70%          15        ← stabilized at 15 pods
\`\`\`

**HPA limitation:** Takes 1–2 minutes to detect and scale. For KNOWN events (sale at 10 AM), pre-scale 30 minutes early:
\`\`\`bash
kubectl scale deployment order-service --replicas=30 -n production
# After sale: scale back down
kubectl scale deployment order-service --replicas=3 -n production
\`\`\`

---

## Your interview answer

**Open:** "A 10x spike causes a cascade: more requests → DB pool exhausts → threads queue → memory spikes → OOM crash. The failure mode is predictable and preventable."

**Immediate (5 minutes):** "kubectl scale to 20 pods. Enable Resilience4j rate limiting returning 429 for requests beyond current capacity — serve 400 users well rather than serving 2000 users with 500 errors."

**Architectural:** "Cache product reads in Redis with TTL jitter — cuts DB queries by 99% for read-heavy sale traffic. Convert order writes to async: accept in < 10ms, return 202, process via Kafka consumers at sustainable pace."

**End:** "HPA auto-scales on CPU/memory for unpredicted spikes. For known sale events, pre-scale manually 30 minutes before — HPA has a 1–2 minute lag and pre-scaling is zero-cost."`,
        followUps: [
          {
            question: 'What is load shedding and when is it better than rate limiting?',
            answer: '**Rate limiting:** Rejects requests that exceed a per-client or per-endpoint quota. Protects against individual clients overloading the system. Returns 429 with Retry-After. **Load shedding:** When the SYSTEM itself is overloaded (CPU > 90%, DB response time spiking), proactively reject LOW-PRIORITY requests to protect HIGH-PRIORITY ones — regardless of which client sent them. **Example:** During a spike, shed report downloads (low priority) but keep checkout (high priority) running. **Spring Boot implementation:**\n```java\n@Component\npublic class LoadSheddingFilter implements Filter {\n    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws IOException, ServletException {\n        double cpuLoad = ManagementFactory.getOperatingSystemMXBean().getSystemLoadAverage();\n        HttpServletRequest httpReq = (HttpServletRequest) req;\n        \n        // When CPU > 85%, shed low-priority endpoints\n        if (cpuLoad > 0.85 && httpReq.getRequestURI().contains("/reports")) {\n            ((HttpServletResponse) res).setStatus(503);\n            return;\n        }\n        chain.doFilter(req, res);\n    }\n}\n```\n**When to use which:** Rate limiting = preventive, per-client protection. Load shedding = emergency, system-wide self-protection. Use both: rate limit first to prevent overload, load shedding as last resort when already overwhelmed.'
          },
          {
            question: 'How do you handle Kafka consumer lag when the consumers fall behind during a spike?',
            answer: '**The problem:** 2000 events/sec arriving, consumers process 500/sec → lag grows 1500/sec → after 10 minutes: 900,000 event backlog → emails delayed by 30+ minutes. **Monitor lag:**\n```bash\nkafka-consumer-groups.sh --bootstrap-server kafka:9092 --group order-processors --describe\n```\n**Output during spike:**\n```text\nGROUP           TOPIC          LAG\norder-processors order-requests 80000  ← lag growing fast\n```\n**Fix 1 — Scale consumers:** More pods = more parallel consumers. Maximum useful consumers = number of Kafka partitions. If topic has 10 partitions: `kubectl scale deployment order-consumer --replicas=10`. Beyond 10 pods, extra pods sit idle. **Fix 2 — Increase partitions before the event:** More partitions = more parallelism capacity. Add partitions proactively before a known sale: `kafka-topics.sh --alter --topic order-requests --partitions 20`. Cannot decrease partitions, only add. **Fix 3 — Batch processing:** Process multiple events per poll: `spring.kafka.consumer.max-poll-records: 100` → 100 events per batch DB insert instead of 100 individual inserts → 10–50x throughput improvement. **Alert on lag:** `kafka_consumer_lag_sum > 50000` in Prometheus → Slack warning → scale consumers before lag becomes user-visible.'
          },
          {
            question: 'What metrics do you monitor to detect a traffic spike before it causes an outage?',
            answer: '**Pre-outage early warning metrics (alert BEFORE users suffer):** (1) `hikaricp.connections.pending > 0` for more than 30 seconds → DB pool filling up, outage incoming. (2) `http.server.requests{status="200",percentile="0.99"} > 1000ms` → p99 latency degrading. (3) `jvm.threads.states{state="BLOCKED"} > 20` → thread contention starting. (4) `system.cpu.usage > 0.80` → CPU under pressure. (5) `kafka.consumer.lag.sum > 10000` → consumers falling behind. **Setup percentile metrics in Spring Boot:**\n```yaml\nmanagement:\n  metrics:\n    distribution:\n      percentiles-histogram:\n        http.server.requests: true\n      percentiles:\n        http.server.requests: 0.5, 0.95, 0.99\n```\n**Proactive traffic spike detection in Grafana:**\n```text\nAlert rule: rate(http_server_requests_total[1m]) > 1.5 * rate(http_server_requests_total[1m] offset 1h)\nMeaning: current req/sec is 50% higher than same time 1 hour ago\n```\nThis fires BEFORE the system degrades — giving you time to pre-scale.'
          }
        ]
      }
    ]
  },
  {
    id: 'notification-system-design-java',
    title: 'System design — Scalable notification service',
    subtitle: 'Design a notification system for 10 million messages per day across email, SMS, and push — with Java, Kafka, Redis, retry, DLQ, and full observability.',
    tags: ['system design', 'notification service', 'Kafka', 'Redis', 'Spring Boot', 'DLQ', 'idempotency', 'scalability', 'Java'],
    scenarios: [
      {
        id: 'th-notification-system-10m',
        question: 'Design a notification service that handles 10 million notifications per day across email, SMS, and push channels. Walk through architecture, data flow, retry strategy, and failure handling.',
        signals: ['Kafka topics', 'consumer groups', 'channel isolation', 'DLQ', 'idempotency', 'rate limiting', 'retry with backoff', 'delivery status', 'observability', 'capacity calculation'],
        answer: `## First — clarify requirements before designing

10M/day = ~115 notifications/second average.
Campaign blasts can be 5–10x peak → design for **1,000 notifications/second**.

Channels and their API rate limits:
- Email → SendGrid: 100 req/sec (standard plan)
- SMS → Twilio: 30 req/sec
- Push → Firebase FCM: thousands/sec (very generous)

Guarantees needed:
- At-least-once delivery (no lost notifications)
- No duplicate sends to same user for same event
- Delivery window: < 30 seconds
- Delivery status queryable by frontend

---

## Architecture — 4 layers

\`\`\`text
┌──────────────────────────────────────────────────┐
│  LAYER 1: INGESTION                              │
│  Any service → POST /notifications               │
│  Validates, deduplicates, publishes to Kafka     │
└──────────────────────┬───────────────────────────┘
                       │
             ┌─────────▼──────────┐
             │ Kafka Topic:        │
             │ "notifications"     │
             │ 6 partitions        │
             └──┬──────┬───────┬──┘
                │      │       │
  ┌─────────────▼─┐ ┌──▼───┐ ┌▼──────────────┐
  │ LAYER 2:      │ │      │ │               │
  │ Email         │ │ SMS  │ │ Push          │
  │ Consumers     │ │Consum│ │ Consumers     │
  │ (group:email) │ │(sms) │ │ (group:push)  │
  └───────┬───────┘ └──┬───┘ └──────┬────────┘
          │            │            │
  ┌───────▼────────────▼────────────▼──────┐
  │  LAYER 3: EXTERNAL DELIVERY            │
  │  SendGrid    Twilio SMS    Firebase    │
  └────────────────────────────────────────┘
  ┌────────────────────────────────────────┐
  │  LAYER 4: OBSERVABILITY               │
  │  Prometheus + Grafana + PagerDuty     │
  └────────────────────────────────────────┘
\`\`\`

---

## Step 1 — Ingestion API with idempotency

\`\`\`java
@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final RedisTemplate<String, String> redis;
    private final KafkaTemplate<String, String> kafka;
    private final NotificationRepository repo;

    @PostMapping
    public ResponseEntity<?> queue(@RequestBody @Valid NotificationRequest req) {
        // Each caller must include a unique idempotency key
        // Example key: "order-placed:ORD-1001:email" (event-type + entity-id + channel)
        String idemKey = req.getIdempotencyKey();

        // Check Redis — have we already accepted this notification?
        String existingId = redis.opsForValue().get("notif:idem:" + idemKey);
        if (existingId != null) {
            // Duplicate — return same ID without re-queuing (no duplicate email)
            return ResponseEntity.ok(
                Map.of("notificationId", existingId, "status", "ALREADY_QUEUED")
            );
        }

        // New request — save to DB (for audit) and queue to Kafka
        Notification notif = repo.save(new Notification(req, NotificationStatus.QUEUED));

        // Mark idempotency key in Redis — 24h TTL (callers can safely retry within 24 hours)
        redis.opsForValue().set(
            "notif:idem:" + idemKey,
            notif.getId().toString(),
            Duration.ofHours(24)
        );

        // Publish to Kafka
        // Key = channel name (EMAIL, SMS, PUSH) → same channel → same partition → ordering
        kafka.send("notifications", req.getChannel().name(),
            objectMapper.writeValueAsString(new NotificationEvent(notif.getId(), req)));

        return ResponseEntity.status(HttpStatus.ACCEPTED)
            .body(Map.of("notificationId", notif.getId(), "status", "QUEUED"));
    }
}
\`\`\`

**What callers see:**
\`\`\`text
First call (new):   POST /notifications → 202 Accepted  {"status": "QUEUED"}
Retry (same key):   POST /notifications → 200 OK        {"status": "ALREADY_QUEUED"}
# No duplicate notification is ever queued — safe for caller retries
\`\`\`

---

## Step 2 — Channel consumers with rate limiting

Each channel has its own consumer group — they scale independently.

\`\`\`java
@Component
public class EmailNotificationConsumer {

    private final SendGridClient sendGrid;
    private final NotificationRepository repo;

    @KafkaListener(
        topics = "notifications",
        groupId = "email-consumers"   // independent group — scales separately from SMS/Push
    )
    public void handle(ConsumerRecord<String, String> record) {
        NotificationEvent event = parseEvent(record.value());
        if (event.getChannel() != Channel.EMAIL) return;  // skip non-email events

        log.info("Processing email notification {} to {}",
            event.getNotificationId(), event.getRecipientEmail());

        // Rate-limited call to SendGrid (90/sec — below their 100/sec limit)
        sendEmailWithLimit(event);

        // Update status in DB
        repo.updateStatus(event.getNotificationId(), NotificationStatus.DELIVERED, Instant.now());

        log.info("Email delivered to {} — notification {}",
            event.getRecipientEmail(), event.getNotificationId());
    }

    @RateLimiter(name = "sendGrid")  // max 90 calls/sec
    private void sendEmailWithLimit(NotificationEvent event) {
        sendGrid.send(event.getRecipientEmail(), event.getSubject(), event.getBody());
    }
}
\`\`\`

\`\`\`yaml
# application.yml
resilience4j:
  ratelimiter:
    instances:
      sendGrid:
        limit-for-period: 90        # 90 emails/sec — stay below SendGrid's 100/sec
        limit-refresh-period: 1s
        timeout-duration: 2s        # wait up to 2s for a rate limit slot
      twilioSms:
        limit-for-period: 28        # 28 SMS/sec — below Twilio's 30/sec
        limit-refresh-period: 1s
        timeout-duration: 1s
\`\`\`

---

## Step 3 — Retry with exponential backoff + Dead Letter Queue

External APIs (SendGrid, Twilio) fail sometimes. Configure Kafka retry + DLQ.

\`\`\`java
@Configuration
public class KafkaConfig {

    @Bean
    public DefaultErrorHandler errorHandler(KafkaTemplate<String, String> kafka) {
        // After 3 retries → publish to notifications-dlq
        DeadLetterPublishingRecoverer dlq = new DeadLetterPublishingRecoverer(kafka,
            (record, ex) -> new TopicPartition("notifications-dlq", record.partition()));

        // Retry with exponential backoff: 1s → 2s → 4s
        ExponentialBackOff backOff = new ExponentialBackOff(1000L, 2.0);
        backOff.setMaxAttempts(3);

        return new DefaultErrorHandler(dlq, backOff);
    }
}
\`\`\`

**What happens when SendGrid is down:**
\`\`\`text
t=0s:    Attempt 1 → SendGrid timeout → FAIL
t=1s:    Attempt 2 → SendGrid timeout → FAIL (exponential: 1s wait)
t=3s:    Attempt 3 → SendGrid timeout → FAIL (exponential: 2s wait)
t=3s:    → Published to notifications-dlq (NOT lost — parked for investigation)
t=3s:    → DB status updated: FAILED
t=3s:    → Prometheus counter increments: notifications_failed_total{channel="email"}
t=5min:  → Grafana alert fires: "DLQ depth > 100 in last 5 minutes"
\`\`\`

\`\`\`bash
# Monitor DLQ depth
kafka-consumer-groups.sh --bootstrap-server kafka:9092 \\
  --group dlq-monitor --describe
\`\`\`

**Output (DLQ has failures):**
\`\`\`text
GROUP       TOPIC              LAG
dlq-monitor notifications-dlq  153   ← 153 failed notifications to investigate
\`\`\`

**Output (DLQ clear — healthy):**
\`\`\`text
GROUP       TOPIC              LAG
dlq-monitor notifications-dlq  0     ← no backlog, all notifications delivered
\`\`\`

---

## Step 4 — Delivery status for frontend polling

\`\`\`java
@GetMapping("/notifications/{id}/status")
public NotificationStatusResponse getStatus(@PathVariable UUID id) {
    // Redis first — set by consumer after delivery (< 1ms)
    String cached = redis.opsForValue().get("notif:status:" + id);
    if (cached != null) return new NotificationStatusResponse(id, NotificationStatus.valueOf(cached));

    // Fall back to DB
    return repo.findById(id)
        .map(n -> new NotificationStatusResponse(id, n.getStatus(), n.getDeliveredAt()))
        .orElseThrow(() -> new NotificationNotFoundException(id));
}
\`\`\`

**Consumer updates Redis after successful delivery:**
\`\`\`java
// In EmailNotificationConsumer after sendGrid.send() succeeds:
repo.updateStatus(event.getNotificationId(), NotificationStatus.DELIVERED, Instant.now());
redis.opsForValue().set(
    "notif:status:" + event.getNotificationId(),
    "DELIVERED",
    Duration.ofHours(1)   // 1h cache — frontend checks status rarely
);
\`\`\`

---

## Step 5 — Observability (how do you know it is healthy?)

\`\`\`text
Key Prometheus metrics to scrape:

notifications_queued_total{channel}      → rate of incoming notifications
notifications_delivered_total{channel}   → delivery success rate
notifications_failed_total{channel}      → failures sent to DLQ
notification_delivery_seconds{channel, quantile="0.99"} → end-to-end latency p99

kafka_consumer_lag{group="email-consumers"} → email consumer falling behind?
http_client_requests_total{uri="sendgrid", status="5xx"} → external API errors

Grafana alerts:
1. Delivery rate: delivered/(delivered+failed) < 99% for 5 min → PagerDuty
2. DLQ depth > 100 messages → Slack warning
3. p99 end-to-end latency > 30s → PagerDuty
4. Kafka consumer lag > 50,000 events → Slack warning
\`\`\`

---

## Capacity calculation (show your math in interviews)

\`\`\`text
10M/day ÷ 86,400 seconds = 115 notifications/sec average
Peak (campaign blasts): 10× = 1,000 notifications/sec

Channel split: 60% email (600/sec), 20% SMS (200/sec), 20% push (200/sec)

Email:  600/sec ÷ 90/sec per pod = 7 email consumer pods
SMS:    200/sec ÷ 28/sec per pod = 8 SMS consumer pods
Push:   200/sec — Firebase handles thousands/sec → 2 push consumer pods

Kafka:  6 partitions per topic (matches consumer count, can increase)
Redis:  10M idempotency keys × 24h TTL × ~200 bytes = ~2GB (manageable)
DB:     10M rows/day → partition by month, archive after 90 days
\`\`\`

---

## Your interview answer

**Open:** "I split the problem into 4 layers: ingestion (fast acceptance with idempotency), Kafka (buffering and channel routing), channel consumers (delivery to external APIs with rate limiting), and observability."

**Then:** "API validates and deduplicates using Redis idempotency keys (24h TTL), publishes to a Kafka notifications topic. Three independent consumer groups — email (7 pods), SMS (8 pods), push (2 pods) — each with Resilience4j rate limiters matching their API limits."

**Then:** "Retries use exponential backoff: 1s, 2s, 4s. After 3 failures the message goes to a DLQ. I alert on DLQ depth > 100 so failures are caught and investigated before they become large-scale delivery failures."

**End:** "Delivery status persisted to DB and Redis-cached for frontend. Key SLOs: delivery success rate > 99%, p99 latency < 30s, DLQ depth near zero. All visible in Grafana with PagerDuty integration."`,
        followUps: [
          {
            question: 'How do you handle user notification preferences and opt-outs?',
            answer: '**DB schema:**\n```sql\nCREATE TABLE notification_preferences (\n    user_id       BIGINT PRIMARY KEY,\n    email_enabled BOOLEAN DEFAULT true,\n    sms_enabled   BOOLEAN DEFAULT true,\n    push_enabled  BOOLEAN DEFAULT true,\n    dnd_enabled   BOOLEAN DEFAULT false,\n    dnd_start_hour INT DEFAULT 22,    -- 10 PM\n    dnd_end_hour   INT DEFAULT 8      -- 8 AM\n);\n```\n**Where to check preferences:** At ingestion time in the API — NOT in the consumer. Reason: fail early, avoid publishing events that will just be discarded downstream. Keeps Kafka clean and consumers simple. **Caching preferences:** User preferences change rarely. Cache in Redis with 1-hour TTL: `user:pref:{userId}` → JSON. API checks Redis first (< 1ms), falls back to DB on cache miss. **DND handling:** Consumer checks current server time against DND window. If in DND window, the consumer delays processing by publishing to a "scheduled-notifications" topic with a future timestamp — a separate scheduler picks these up after DND ends. **Interview line:** "Preferences are a read-heavy, write-rare pattern — cache them aggressively in Redis. Check at ingestion, not delivery — saves Kafka capacity and keeps consumers simple."'
          },
          {
            question: 'How do you prevent duplicate emails when the relay/consumer retries?',
            answer: '**The duplicate scenario:** Consumer calls SendGrid → success → consumer crashes before committing Kafka offset → Kafka redelivers the same message → duplicate email sent. **Prevention 1 — Idempotency key to SendGrid:**\n```java\n// Generate stable key from notification ID\n// Same notification ID → same key → SendGrid deduplicates within 24h\nString idempotencyKey = "notif-" + event.getNotificationId();\nrequest.addHeader("X-Idempotency-Key", idempotencyKey);\n// If SendGrid receives same key within 24h → returns previous result, no re-send\n```\n**Prevention 2 — DB unique constraint:**\n```sql\nCREATE TABLE sent_notifications (\n    user_id       BIGINT,\n    event_type    VARCHAR(100),\n    event_id      VARCHAR(100),\n    channel       VARCHAR(20),\n    sent_at       TIMESTAMPTZ,\n    UNIQUE (user_id, event_type, event_id, channel)  -- prevents any duplicate\n);\n```\nConsumer inserts into this table before calling SendGrid. On duplicate key → skip. **Prevention 3 — Redis idempotency check in consumer:**\n```java\nString key = "sent:email:" + event.getNotificationId();\nif (redis.hasKey(key)) { return; }  // skip duplicate\nredis.opsForValue().set(key, "1", Duration.ofHours(25));  // slightly longer than Kafka max.poll.interval\n```'
          },
          {
            question: 'What happens to notification delivery if Kafka goes down for 30 minutes?',
            answer: '**Impact:** API cannot publish to Kafka → 503 error → callers cannot queue new notifications. **Prevention — Transactional Outbox:** API writes to `outbox` table in DB instead of Kafka directly. Relay reads outbox and publishes to Kafka. When Kafka recovers, relay flushes the backlog automatically. Zero notifications lost. **Alternative — Honest 503 with Retry-After:**\n```java\ntry {\n    kafka.send("notifications", ...).get(2, TimeUnit.SECONDS);\n} catch (Exception e) {\n    return ResponseEntity.status(503)\n        .header("Retry-After", "60")\n        .body(Map.of("message", "Notification service temporarily unavailable — retry in 60s"));\n}\n```\nCallers retry after 60s. When Kafka is back → success. **Kafka replication:** `replication.factor: 3, min.insync.replicas: 2` on the notifications topic. Even if one broker goes down, two others hold the data — consumer lag may grow but no messages are lost. **Monitor Kafka health:** `kafka_server_BrokerTopicMetrics_MessagesInPerSec` dropping to 0 → PagerDuty alert immediately. `kafka_consumer_lag_sum` growing fast → scale consumers.'
          }
        ]
      }
    ]
  }
];

data.themes.push(...newThemes);
fs.writeFileSync('public/data/scenarioInterviewThemes.json', JSON.stringify(data, null, 2));
console.log('Done. Total themes:', data.themes.length);
