/**
 * V2 rewrite of all 3 idempotency-retries scenario answers.
 * Run: node scripts/rewrite-v2-idempotency.mjs
 */
import { readFileSync, writeFileSync } from 'fs';

const FILE = 'public/data/scenarioInterviewThemes.json';
const F = '```';

const answers = {

// ─────────────────────────────────────────────────────────────────────────────
'th-idem-pay-dup': `
## 🔥 The situation
A customer clicks "Pay" and the network times out. The payment was actually processed but the response never reached the browser. The customer clicks "Pay" again. Now they are charged twice. Your payment API is not idempotent.

## 🧠 Understand this first

| Term | Simple meaning |
|---|---|
| Idempotent | You can call it 10 times and get the same result as calling it once |
| Idempotency key | A unique ID the client generates per operation — used to detect duplicates |
| Retry-safe | If the client retries, no bad side effects (like double charging) |
| At-least-once | The operation is guaranteed to happen — but may happen more than once |

**Non-idempotent:** POST /payments → charges the card every time it's called
**Idempotent:** POST /payments with Idempotency-Key → charges once, returns same result on retries

## Step 1: Client generates a unique key per payment attempt
${F}java
// FRONTEND / CLIENT CODE
// Generate a UUID once per "click Pay" action
// Store it in memory — if retry is needed, use THE SAME UUID

String idempotencyKey = UUID.randomUUID().toString();
// e.g., "f47ac10b-58cc-4372-a567-0e02b2c3d479"

// Send with every attempt for this payment
HttpHeaders headers = new HttpHeaders();
headers.set("Idempotency-Key", idempotencyKey);
headers.setContentType(MediaType.APPLICATION_JSON);

HttpEntity<PaymentRequest> entity = new HttpEntity<>(req, headers);

// First attempt — times out
try {
    restTemplate.postForObject("/payments", entity, PaymentResponse.class);
} catch (ResourceAccessException timeout) {
    log.warn("Payment timed out — will retry with same key: {}", idempotencyKey);
    // Wait 2 seconds then retry with SAME key
    Thread.sleep(2000);
    restTemplate.postForObject("/payments", entity, PaymentResponse.class); // same key!
}
${F}

**What this means (simple):** The UUID is the fingerprint for "this specific payment attempt by this user at this moment." If the same UUID arrives again, the server knows it's a retry, not a new payment.

## Step 2: Server checks the idempotency key before processing
${F}sql
CREATE TABLE payment_idempotency (
  idempotency_key  VARCHAR(100) PRIMARY KEY,
  response_status  INT          NOT NULL,
  response_body    TEXT         NOT NULL,   -- JSON we sent back
  charge_id        VARCHAR(100),            -- ID from the payment gateway
  created_at       TIMESTAMPTZ  DEFAULT NOW(),
  expires_at       TIMESTAMPTZ              -- clean up after 24 hours
);
${F}

${F}java
@RestController
public class PaymentController {

    @PostMapping("/payments")
    @Transactional
    public ResponseEntity<PaymentResponse> pay(
            @RequestHeader(value = "Idempotency-Key", required = true) String idempotencyKey,
            @RequestBody PaymentRequest request) {

        // 1. Check for existing record
        Optional<PaymentIdempotency> existing = idempotencyRepo.findById(idempotencyKey);
        if (existing.isPresent()) {
            log.info("Duplicate detected for key {} — returning cached response", idempotencyKey);
            PaymentResponse cached = parse(existing.get().getResponseBody());
            return ResponseEntity.status(existing.get().getResponseStatus()).body(cached);
        }

        // 2. Insert the key immediately (claim it) — unique constraint prevents race condition
        idempotencyRepo.insertPending(idempotencyKey, Instant.now().plus(Duration.ofHours(24)));

        // 3. Process the payment
        String chargeId = paymentGateway.charge(request.getCardToken(), request.getAmount());
        PaymentResponse response = new PaymentResponse(chargeId, "SUCCESS", request.getAmount());

        // 4. Save result — update the pending record
        idempotencyRepo.saveResult(idempotencyKey, 200, toJson(response), chargeId);

        return ResponseEntity.ok(response);
    }
}
${F}

**What you see in logs — original request:**
${F}text
INFO  PaymentController - New payment request for key f47ac10b
INFO  PaymentGateway    - Charging $49.99 to card tok_abc → charge_id: ch_xyz789
INFO  PaymentController - Payment complete. Saved result for key f47ac10b
→ HTTP 200 { "chargeId": "ch_xyz789", "status": "SUCCESS", "amount": 49.99 }
${F}

**What you see in logs — retry with same key:**
${F}text
INFO  PaymentController - Duplicate detected for key f47ac10b — returning cached response
→ HTTP 200 { "chargeId": "ch_xyz789", "status": "SUCCESS", "amount": 49.99 }
// Same response. No second charge. paymentGateway.charge() was never called again.
${F}

## Step 3: Handle the race condition — two retries arrive simultaneously
${F}java
@Transactional
public ResponseEntity<PaymentResponse> pay(String idempotencyKey, PaymentRequest request) {
    try {
        // INSERT with unique constraint — only one thread can succeed
        idempotencyRepo.insertOrFail(idempotencyKey);
    } catch (DataIntegrityViolationException e) {
        // Another thread is processing this key right now
        // Wait for it to finish and return its result
        log.info("Key {} is being processed by another request — waiting...", idempotencyKey);
        PaymentIdempotency record = pollForCompletion(idempotencyKey, Duration.ofSeconds(5));
        if (record != null && record.isComplete()) {
            return ResponseEntity.status(record.getResponseStatus())
                                 .body(parse(record.getResponseBody()));
        }
        // Timeout waiting — return 503
        return ResponseEntity.status(503).body(null);
    }
    // Proceed with payment...
}
${F}

## Step 4: Require idempotency key — return 400 if missing
${F}java
// If client doesn't send a key, reject the request
// This forces all clients to implement idempotency correctly
@PostMapping("/payments")
public ResponseEntity<?> pay(@RequestHeader(value = "Idempotency-Key", required = false) String key,
                              @RequestBody PaymentRequest req) {
    if (key == null || key.isBlank()) {
        return ResponseEntity.badRequest()
            .body(Map.of("error", "Idempotency-Key header is required for payment requests"));
    }
    // ...
}
${F}

## Step 5: Clean up expired keys
${F}java
@Scheduled(cron = "0 0 3 * * *") // every day at 3AM
public void cleanExpiredKeys() {
    int deleted = idempotencyRepo.deleteExpired(Instant.now());
    log.info("Cleaned {} expired idempotency keys", deleted);
}
${F}

## Your interview answer
**Open:** "I'd make the payment API idempotent using an Idempotency-Key header — the client generates a UUID per payment attempt and sends it with every retry."
**Then:** "The server stores the key + response in a DB table with a unique constraint. On first request: process and store. On duplicate: return the stored response immediately, no second charge. The unique constraint handles concurrent retries — only one can win the INSERT."
**End:** "Idempotency keys are cleaned up after 24 hours. The client is required to send the key — if missing, return 400. This ensures all callers implement it correctly from the start."
`.trim(),

// ─────────────────────────────────────────────────────────────────────────────
'th-idem-kafka-reprocess': `
## 🔥 The situation
Your Kafka consumer processes a message. The consumer commits the offset but crashes before updating the database. On restart, Kafka replays the same message. The message is processed twice — causing a duplicate order, a double inventory deduction, or a double payment confirmation.

## 🧠 Understand this first

| Kafka delivery guarantee | What it means | How to achieve |
|---|---|---|
| At-most-once | Message may be lost, never duplicated | Commit offset BEFORE processing (dangerous) |
| At-least-once | No message is lost, but may be processed multiple times | Commit offset AFTER processing (default, safe) |
| Exactly-once | Processed exactly once — very complex | Kafka Transactions + idempotent consumer |

**Best practice:** Use at-least-once delivery + idempotent consumer logic = effectively exactly-once behavior.

## Step 1: Understand why duplicates happen

${F}text
Normal flow:
  1. Consumer reads message: { eventId: "evt-123", orderId: "ord-99", type: "PAYMENT_CONFIRMED" }
  2. Consumer processes: marks order ord-99 as PAID in DB ✓
  3. Consumer commits offset to Kafka ✓

Crash scenario:
  1. Consumer reads message: { eventId: "evt-123", orderId: "ord-99" }
  2. Consumer processes: marks order ord-99 as PAID in DB ✓
  3. JVM CRASHES — offset not committed
  4. Consumer restarts → Kafka replays evt-123
  5. Consumer processes again → tries to mark ord-99 as PAID again → DUPLICATE
${F}

## Step 2: Track processed event IDs in a table
${F}sql
CREATE TABLE processed_events (
  event_id    VARCHAR(100) PRIMARY KEY,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  topic        VARCHAR(100),
  consumer_group VARCHAR(100)
);

-- Index for cleanup
CREATE INDEX idx_processed_events_time ON processed_events(processed_at);
${F}

${F}java
@Service
public class PaymentEventConsumer {

    @KafkaListener(topics = "payment-events", groupId = "order-service")
    @Transactional  // DB update + processed_events insert in ONE transaction
    public void handlePaymentConfirmed(ConsumerRecord<String, String> record) {

        String eventId = getEventId(record); // from Kafka header or payload

        // Idempotency check
        if (processedEventRepo.existsById(eventId)) {
            log.info("Skipping duplicate event: {}", eventId);
            return;  // no-op — already processed
        }

        // Process the event
        PaymentConfirmedEvent event = parse(record.value());
        orderRepo.updateStatus(event.getOrderId(), "PAID");
        log.info("Order {} marked as PAID", event.getOrderId());

        // Record that we've processed this event (same DB transaction)
        processedEventRepo.save(new ProcessedEvent(
            eventId,
            record.topic(),
            "order-service"
        ));
        // If we crash here: both the order update AND the processedEvent are rolled back
        // Kafka replays → we process again → processedEvent not in DB → process normally ✓
    }

    private String getEventId(ConsumerRecord<String, String> record) {
        // Try to get event ID from Kafka header first
        Header eventHeader = record.headers().lastHeader("event-id");
        if (eventHeader != null) {
            return new String(eventHeader.value(), StandardCharsets.UTF_8);
        }
        // Fall back: use topic + partition + offset as unique ID
        return record.topic() + ":" + record.partition() + ":" + record.offset();
    }
}
${F}

**What you see in logs — first processing:**
${F}text
INFO  PaymentEventConsumer - Processing event evt-123 (topic=payment-events, partition=2, offset=1045)
INFO  OrderService         - Order ord-99 marked as PAID
INFO  PaymentEventConsumer - Recorded processed event evt-123
${F}

**What you see in logs — duplicate after restart:**
${F}text
INFO  PaymentEventConsumer - Processing event evt-123 (topic=payment-events, partition=2, offset=1045)
INFO  PaymentEventConsumer - Skipping duplicate event: evt-123
// Order status unchanged. No double-update.
${F}

## Step 3: Use topic + partition + offset as the event ID (no header needed)
${F}java
// Kafka guarantees: (topic, partition, offset) is globally unique
// A message at partition=2, offset=1045 is always the same message
String deterministicEventId = String.format("%s-%d-%d",
    record.topic(), record.partition(), record.offset());
// → "payment-events-2-1045"
// This is always the same for the same message — no need for a separate event-id header
${F}

**What this means (simple):** Even if the producer doesn't include an \`event-id\` header, you can derive a unique ID from where the message lives in Kafka. Partition + offset never changes for a given message.

## Step 4: Use Kafka transactions for exactly-once (advanced)
${F}java
// Only if you need strict exactly-once and are willing to accept complexity
// Producer side — enable transactions
producerFactory.setTransactionIdPrefix("order-service-");

// Consumer side — only read committed messages
consumerFactory.setProperty(ConsumerConfig.ISOLATION_LEVEL_CONFIG, "read_committed");

// Process and produce in one atomic Kafka transaction
kafkaTemplate.executeInTransaction(ops -> {
    // consume → process → produce (all atomic)
    ops.send("inventory-events", buildInventoryReserveEvent(order));
    return null;
});
// If JVM crashes before commit: message is NOT committed to Kafka — no replay of incomplete work
${F}

**Trade-offs:**
${F}text
Exactly-once with Kafka Transactions:
  ✅ No duplicate processing
  ✅ Atomic consume + produce
  ❌ ~30% throughput reduction
  ❌ More complex setup
  ❌ Only works if ALL processing stays within Kafka (no DB writes)

At-least-once + idempotent consumer:
  ✅ Works with any data store (DB, Redis, etc.)
  ✅ Simple to implement
  ✅ High throughput
  ❌ Duplicates possible but handled gracefully
${F}

## Step 5: Clean up old processed event IDs
${F}java
@Scheduled(cron = "0 0 4 * * *") // 4 AM daily
public void cleanup() {
    Instant cutoff = Instant.now().minus(Duration.ofDays(7));
    int deleted = processedEventRepo.deleteProcessedBefore(cutoff);
    log.info("Cleaned {} old processed event records", deleted);
}
${F}

## Your interview answer
**Open:** "Kafka's at-least-once guarantee means the same message can be delivered more than once — especially after a consumer crash. The fix is idempotent consumer logic: track which event IDs have been processed."
**Then:** "I use a \`processed_events\` table with the event ID as the primary key. Each consumer checks this table before processing. The check + business logic + insert into processed_events all happen in one DB transaction — so a crash mid-way means the offset isn't committed either, and Kafka replays the message — but this time processedEvents is empty again, so we process it cleanly."
**End:** "If no event-id header exists, I derive a unique ID from topic + partition + offset — Kafka guarantees this combination is unique. For strict exactly-once, Kafka Transactions work but add complexity and reduce throughput — the idempotent table approach is simpler and handles 99% of cases."
`.trim(),

// ─────────────────────────────────────────────────────────────────────────────
'th-idem-retry-storm': `
## 🔥 The situation
A downstream service slows down. Your service retries failed requests. All instances retry at the same time. Now you have a thundering herd — hundreds of retries all hitting the struggling service at the same moment, making it even slower. Eventually everything cascades into a full outage.

## 🧠 Understand this first

| Term | What it means | Example |
|---|---|---|
| Retry storm | Many retries arrive simultaneously, overwhelming the target | 100 threads all retry at 3s → 100 requests at once |
| Thundering herd | Many processes wake up at the same time and compete for a resource | All instances retry at exactly the 3-second mark |
| Exponential backoff | Each retry waits longer than the last | 1s → 2s → 4s → 8s → 16s |
| Jitter | Add random delay to spread retries out | 1s±500ms → 2s±1s → 4s±2s |
| Circuit breaker | Stop retrying after N failures — wait before trying again | Open circuit for 30s, then try once |

**Without jitter:**
${F}text
t=0:    100 requests fail
t=3s:   100 retries arrive simultaneously → server still struggling → all fail again
t=6s:   100 retries again → storm continues
${F}

**With jitter:**
${F}text
t=0:    100 requests fail
t=2.3s: request 1 retries
t=2.7s: request 2 retries
t=3.1s: request 3 retries
...
t=5.8s: request 100 retries
→ requests spread over ~3 seconds → server handles one at a time → recovers
${F}

## Step 1: Add exponential backoff with jitter using Spring Retry
${F}xml
<!-- pom.xml -->
<dependency>
  <groupId>org.springframework.retry</groupId>
  <artifactId>spring-retry</artifactId>
</dependency>
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-aop</artifactId>
</dependency>
${F}

${F}java
@Configuration
@EnableRetry
public class RetryConfig {}
${F}

${F}java
@Service
public class InventoryClient {

    @Retryable(
        retryFor = { HttpServerErrorException.class, ResourceAccessException.class },
        maxAttempts = 4,
        backoff = @Backoff(
            delay = 1000,        // start: 1 second
            multiplier = 2.0,    // double each time: 1s → 2s → 4s → 8s
            random = true        // ← adds jitter: actual delay = delay ± (delay * 0.5)
        )
    )
    public InventoryResponse getInventory(Long itemId) {
        return restTemplate.getForObject("/inventory/" + itemId, InventoryResponse.class);
    }

    @Recover
    public InventoryResponse onExhausted(Exception e, Long itemId) {
        log.error("Inventory service unavailable after retries for item {}", itemId);
        return InventoryResponse.unavailable(); // fallback response
    }
}
${F}

**What you see in logs — normal retry with jitter:**
${F}text
WARN  InventoryClient - Request failed (attempt 1/4) for item 42 — retrying in 1247ms
WARN  InventoryClient - Request failed (attempt 2/4) for item 42 — retrying in 2531ms
WARN  InventoryClient - Request failed (attempt 3/4) for item 42 — retrying in 4102ms
ERROR InventoryClient - Request failed (attempt 4/4) for item 42 — giving up
WARN  InventoryClient - Returning fallback for item 42
${F}
**What this means (simple):** Each retry waits roughly double the previous time. The \`random=true\` adds noise — so 100 simultaneous failures retry at slightly different times. The load is spread out instead of hitting all at once.

## Step 2: Add a circuit breaker to stop retrying when the service is clearly down
${F}java
// Without circuit breaker: 100 threads each retry 4 times = 400 requests to a dead service
// With circuit breaker: after 10 failures, all threads return fallback immediately
// (no retries — circuit is open)

@CircuitBreaker(name = "inventoryService", fallbackMethod = "inventoryFallback")
@Retryable(maxAttempts = 4, backoff = @Backoff(delay = 1000, multiplier = 2, random = true))
public InventoryResponse getInventory(Long itemId) {
    return restTemplate.getForObject("/inventory/" + itemId, InventoryResponse.class);
}

public InventoryResponse inventoryFallback(Long itemId, Exception e) {
    log.warn("Circuit open for inventoryService — using fallback for item {}", itemId);
    return InventoryResponse.unavailable();
}
${F}

${F}yaml
resilience4j:
  circuitbreaker:
    instances:
      inventoryService:
        slidingWindowSize: 10
        failureRateThreshold: 50     # open if 50% of last 10 calls fail
        waitDurationInOpenState: 30s # don't try for 30s — let service recover
        permittedNumberOfCallsInHalfOpenState: 3
${F}

**What you see when circuit opens:**
${F}text
WARN  CircuitBreaker - inventoryService: CLOSED → OPEN (failure rate 70%)
WARN  InventoryClient - Circuit open for inventoryService — using fallback (no retry)
WARN  InventoryClient - Circuit open for inventoryService — using fallback (no retry)
// 100 threads all return fallback immediately — ZERO requests to struggling service
INFO  CircuitBreaker - inventoryService: OPEN → HALF_OPEN (after 30s)
INFO  CircuitBreaker - inventoryService: HALF_OPEN → CLOSED (3 test calls passed)
// Normal retries resume
${F}

## Step 3: Implement manual jitter if not using Spring Retry
${F}java
public InventoryResponse getWithJitter(Long itemId) throws InterruptedException {
    int maxAttempts = 4;
    long baseDelayMs = 1000;

    for (int attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return restTemplate.getForObject("/inventory/" + itemId, InventoryResponse.class);
        } catch (Exception e) {
            if (attempt == maxAttempts) throw e;

            // Exponential backoff with full jitter
            long exponentialDelay = baseDelayMs * (long) Math.pow(2, attempt - 1);
            long jitter = (long) (Math.random() * exponentialDelay);
            long sleep = jitter; // random value between 0 and exponentialDelay

            log.warn("Attempt {}/{} failed for item {} — sleeping {}ms", attempt, maxAttempts, itemId, sleep);
            Thread.sleep(sleep);
        }
    }
    return InventoryResponse.unavailable();
}
${F}

**What the delays look like across 5 simultaneous failed requests:**
${F}text
Request 1, attempt 2: sleeps 743ms
Request 2, attempt 2: sleeps 1204ms
Request 3, attempt 2: sleeps 321ms
Request 4, attempt 2: sleeps 1891ms
Request 5, attempt 2: sleeps 567ms
→ Retries spread across ~1.6 seconds — no thundering herd
${F}

## Step 4: Use a queue to absorb spikes instead of retrying inline
${F}java
// For non-time-critical operations: publish to a queue, let workers retry
@PostMapping("/orders/{id}/notify")
public ResponseEntity<?> notifyUser(@PathVariable String id) {
    // Don't retry the notification inline — put it in a queue
    kafkaTemplate.send("notification-jobs", id);
    return ResponseEntity.accepted().build(); // return immediately
}

// A separate consumer handles retries with backoff
@KafkaListener(topics = "notification-jobs")
public void processNotification(String orderId) {
    try {
        emailService.sendOrderConfirmation(orderId);
    } catch (Exception e) {
        // Re-queue with a delay (or use a dead-letter queue after N attempts)
        log.warn("Notification failed for order {} — DLQ", orderId);
        kafkaTemplate.send("notification-jobs-dlq", orderId);
    }
}
${F}

## Your interview answer
**Open:** "Retry storms happen when all instances retry simultaneously — they overwhelm the already-struggling downstream service. The fix is exponential backoff with jitter."
**Then:** "Jitter adds random noise to the retry delay so 100 simultaneous failures retry at slightly different times instead of all at once. Combined with a circuit breaker — which stops all retries when the service is clearly down — this prevents the thundering herd."
**End:** "The circuit breaker is key: once it opens, threads return a fallback immediately with zero retries — giving the downstream service breathing room to recover. After 30 seconds, it half-opens and tests with a few calls before fully re-enabling."
`.trim(),

};

// ── Apply rewrites ────────────────────────────────────────────────────────────
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
