/**
 * Patch script — rewrite the idempotency scenario in scenarioInterviewThemes.json
 * Enterprise-grade content: problem first → what/why → behind the scenes → solution steps
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TARGET = resolve(__dirname, '../public/data/scenarioInterviewThemes.json');

const answer = `# Why Idempotency Is the Most Underrated Backend Skill

---

## The Problem — A Story From 3am On-Call

It is Black Friday. Your system is handling 50,000 orders per hour. At 3am your phone rings.

"Customers are being charged twice."

You open your laptop and check the payment service. The code looks correct. The database transactions look correct. The Kafka consumer looks correct.

But customers ARE being charged twice.

You spend two hours debugging. You finally find the root cause — and it has nothing to do with your code logic. It is in your assumption.

You assumed each request would arrive **exactly once**. But in distributed systems, every request is guaranteed to arrive **at least once**. Those are very different things.

One customer hit "Place Order." The network was slow. Their browser retried. Two orders. Two charges. One furious customer.

This is the problem idempotency solves.

---

## What Is Idempotency? (Plain Language)

**Idempotency** means: running the same operation multiple times gives the same result as running it once.

Think of a thermostat. You set it to 22°C. Whether you press the button once or ten times, the room stays at 22°C. The thermostat is idempotent.

Now think of your order API. Without idempotency:
- Client sends POST /orders → order created, customer charged ✓
- Network drops the response → client retries → another order created, customer charged again ✗

With idempotency:
- Client sends POST /orders with Idempotency-Key: abc-123 → order created, charged ✓
- Client retries with the same key → server says "I already processed abc-123, here is the same result" → no duplicate ✓

**The rule:** Any operation that changes state (create, update, charge, send) must be idempotent if it can be retried.

---

## Why Duplicates Are Guaranteed (Behind the Scenes)

Understanding WHY duplicates happen helps you see why idempotency is not optional.

### In REST APIs

Here is what happens at the network level:

\`\`\`
Client                    Load Balancer              Your API Server
  |                            |                           |
  |---POST /orders ----------->|---forward---------------->|
  |                            |                           | (processes OK)
  |                            |<--200 OK------------------|
  |                            |                           |
  |     (network drops here)   |                           |
  |                            |                           |
  | (client timeout — retries) |                           |
  |---POST /orders ----------->|---forward---------------->|
  |                            |                           | (processes AGAIN)
  |<--200 OK--------------------------------------- --------|
\`\`\`

The client did exactly what it was supposed to do — retry. The server did exactly what it was supposed to do — process the request. Nobody made a mistake. But the customer got charged twice.

### In Kafka and Message Queues

Kafka guarantees **at-least-once delivery** by default. Here is what happens:

\`\`\`
Kafka Broker                    Your Consumer
     |                               |
     |---delivers OrderCreatedEvent->|
     |                               | (consumer processes payment)
     |                               | (consumer crashes before committing offset)
     |                               |
     | (Kafka sees: offset not committed, must redeliver)
     |                               |
     |---delivers OrderCreatedEvent->| (consumer restarts, processes AGAIN)
     |                               | (second charge)
\`\`\`

This is not a bug. This is how at-least-once delivery works. The only way to stop it is to make your consumer idempotent.

### Other Places Duplicates Happen

| Trigger | Why Duplicate Happens |
|---|---|
| HTTP client retry | Network timeout before response arrives |
| Load balancer retry | Server slow to respond, LB retries to another instance |
| Kafka consumer restart | Offset not committed before crash |
| Scheduled job re-run | Job failed, was restarted manually or automatically |
| Message queue (SQS, RabbitMQ) | Default at-least-once delivery |
| Browser double-click | User clicks submit twice before page responds |

---

## Solution Step 1 — Idempotency Key for REST APIs

This is the most important pattern. Use it for any API that creates or charges something.

**How it works:**
1. Client generates a unique UUID and sends it as \`Idempotency-Key\` header
2. Server checks Redis: "Have I seen this key before?"
3. If yes → return the stored response immediately (no business logic runs again)
4. If no → run business logic, store the key + result in Redis with a TTL, return response

\`\`\`java
// Enterprise-grade idempotency key handler
@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final RedisTemplate<String, String> redis;
    private final OrderService orderService;
    private final ObjectMapper objectMapper;

    // Step 1: Accept the Idempotency-Key header (reject if missing)
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @RequestHeader(value = "Idempotency-Key", required = true) String idempotencyKey,
            @RequestBody @Valid CreateOrderRequest request,
            @AuthenticationPrincipal UserPrincipal user) {

        // Step 2: Validate the key format (must be UUID v4)
        validateIdempotencyKey(idempotencyKey);

        // Step 3: Build the Redis key — namespace by resource type + user + key
        String redisKey = "idempotency:order:" + user.getId() + ":" + idempotencyKey;

        // Step 4: Check if we already processed this key
        String cached = redis.opsForValue().get(redisKey);
        if (cached != null) {
            // Return the exact same response as the first call
            OrderResponse previous = objectMapper.readValue(cached, OrderResponse.class);
            return ResponseEntity.ok()
                .header("X-Idempotent-Replayed", "true")   // tell client this is a replay
                .body(previous);
        }

        // Step 5: Process the business logic (runs only once)
        OrderResponse response = orderService.createOrder(request, user);

        // Step 6: Store the result so future retries get the same response
        // TTL of 24 hours — long enough for any reasonable retry window
        redis.opsForValue().set(redisKey, objectMapper.writeValueAsString(response),
                Duration.ofHours(24));

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    private void validateIdempotencyKey(String key) {
        // Reject malformed keys to prevent cache poisoning
        if (key == null || key.isBlank() || key.length() > 64) {
            throw new InvalidIdempotencyKeyException("Idempotency-Key must be 1-64 characters");
        }
        try {
            UUID.fromString(key);   // enforce UUID format
        } catch (IllegalArgumentException e) {
            throw new InvalidIdempotencyKeyException("Idempotency-Key must be a valid UUID");
        }
    }
}
\`\`\`

**Why 24 hours TTL?** Most retry policies run within minutes. 24 hours gives a safe window. Beyond that, a new request with the same key should be treated as a new operation — the TTL handles this automatically.

**The X-Idempotent-Replayed header** tells the client "this response was replayed, not freshly computed." Useful for debugging.

---

## Solution Step 2 — Database-Level Deduplication

Redis can be unavailable. Network can be down. Always add database-level protection as a second layer.

\`\`\`sql
-- Add a unique constraint on idempotency_key at the database level
ALTER TABLE orders
  ADD COLUMN idempotency_key VARCHAR(64) NOT NULL,
  ADD CONSTRAINT orders_idempotency_key_unique UNIQUE (user_id, idempotency_key);

-- Create a partial index for performance (only index non-null keys)
CREATE UNIQUE INDEX idx_orders_idempotency
  ON orders (user_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;
\`\`\`

\`\`\`java
// In your repository layer — handle the constraint violation gracefully
@Transactional
public Order createOrder(CreateOrderRequest req, String idempotencyKey, Long userId) {
    try {
        Order order = Order.builder()
            .userId(userId)
            .amount(req.getAmount())
            .idempotencyKey(idempotencyKey)
            .status(OrderStatus.PENDING)
            .build();
        return orderRepository.save(order);

    } catch (DataIntegrityViolationException ex) {
        // Duplicate key — find and return the existing order
        return orderRepository.findByUserIdAndIdempotencyKey(userId, idempotencyKey)
            .orElseThrow(() -> new IllegalStateException(
                "Idempotency violation but order not found — race condition?"));
    }
}
\`\`\`

**Why this works:** Even if two threads race and both pass the Redis check at the same time, the database constraint catches the second one. The database is the source of truth, not Redis.

**Two-layer protection:**
- Redis (fast) → stops 99.9% of duplicates before they hit the database
- Database constraint (authoritative) → catches race conditions and Redis misses

---

## Solution Step 3 — Outbox Pattern for Event Publishing

The most common way to create duplicates with Kafka is publishing an event AFTER saving to the database in a separate step. If your app crashes between the save and the publish, you either lose the event or publish it twice on restart.

**The wrong way (non-atomic):**
\`\`\`java
@Transactional
public void createOrder(OrderRequest req) {
    Order order = orderRepo.save(req);        // saved in DB ✓
    kafkaTemplate.send("orders", event);      // what if this crashes here?
    // On restart: order exists in DB but event was never sent → lost event
}
\`\`\`

**The right way (Outbox Pattern):**
\`\`\`java
// Step 1: Save order AND outbox event in ONE database transaction
@Transactional
public void createOrder(OrderRequest req) {
    Order order = Order.builder()
        .idempotencyKey(req.getIdempotencyKey())
        .amount(req.getAmount())
        .status(OrderStatus.PENDING)
        .build();
    orderRepo.save(order);

    // Outbox event saved in same transaction — atomic with the order creation
    OutboxEvent outboxEvent = OutboxEvent.builder()
        .aggregateId(order.getId())
        .aggregateType("Order")
        .eventType("OrderCreated")
        .payload(toJson(new OrderCreatedEvent(order)))
        .status(OutboxStatus.PENDING)
        .createdAt(Instant.now())
        .build();
    outboxRepo.save(outboxEvent);
    // If anything above fails, BOTH roll back. No partial state.
}
\`\`\`

\`\`\`java
// Step 2: A separate poller publishes outbox events to Kafka
@Scheduled(fixedDelay = 1000)   // runs every 1 second
@Transactional
public void publishPendingOutboxEvents() {
    List<OutboxEvent> pending = outboxRepo.findPendingEvents(100);

    for (OutboxEvent event : pending) {
        try {
            // Kafka producer is configured with idempotent=true and acks=all
            kafkaTemplate.send("orders", event.getAggregateId(), event.getPayload()).get();
            event.setStatus(OutboxStatus.PUBLISHED);
            outboxRepo.save(event);
        } catch (Exception e) {
            log.error("Failed to publish outbox event {}", event.getId(), e);
            // Will retry on next schedule cycle
        }
    }
}
\`\`\`

**Why this works:** The order and the outbox event are created together in one database transaction. The event is never lost (it stays PENDING until published). The poller publishes it exactly once. Even if the poller crashes and restarts, it just finds the PENDING event and publishes it again — but the consumer handles that with deduplication (Step 4).

**Production tip:** Use Debezium instead of a scheduler. Debezium watches your database transaction log (CDC — Change Data Capture) and publishes events in real time, with stronger guarantees than a polling loop.

---

## Solution Step 4 — Kafka Consumer Deduplication

Your consumer must be idempotent. Kafka CAN deliver the same message more than once (consumer restart, rebalance, or manual retry). Your consumer must handle this safely.

\`\`\`java
@Service
public class OrderEventConsumer {

    private final RedisTemplate<String, String> redis;
    private final PaymentService paymentService;
    private final InventoryService inventoryService;

    @KafkaListener(topics = "orders", groupId = "payment-service")
    public void handle(ConsumerRecord<String, String> record) {
        OrderCreatedEvent event = parseEvent(record.value());

        // Step 1: Build a deduplication key from the event ID
        // eventId must be set by the producer (use the order ID or a UUID in the event payload)
        String dedupKey = "kafka:dedup:order-processed:" + event.getEventId();

        // Step 2: Check if we already processed this event
        // SetIfAbsent is atomic — only one thread can win this race
        Boolean isNew = redis.opsForValue().setIfAbsent(dedupKey, "1", Duration.ofDays(7));

        if (Boolean.FALSE.equals(isNew)) {
            // Already processed — safe to skip
            log.info("Skipping duplicate event: {}", event.getEventId());
            return;
        }

        try {
            // Step 3: Process the business logic
            paymentService.charge(event.getOrderId(), event.getAmount());
            inventoryService.reserve(event.getOrderId(), event.getItems());

        } catch (Exception e) {
            // Step 4: If processing fails, remove the dedup key so we can retry
            redis.delete(dedupKey);
            throw e;   // let Kafka retry or route to DLQ
        }
    }
}
\`\`\`

**The \`setIfAbsent\` trick:** Redis \`SETNX\` (set if not exists) is atomic. Even if two threads receive the same event simultaneously, only one will get \`true\` and process it. The other gets \`false\` and skips.

**Why 7-day TTL?** Long enough to cover any replay window. If you need to replay events older than 7 days, you will need to clear the dedup keys — but that is a deliberate operational decision, not an accident.

---

## Solution Step 5 — Making Side Effects Idempotent

Side effects (emails, notifications, SMS) are often forgotten. If your order flow sends an email, the email must also be idempotent.

\`\`\`java
@Service
public class NotificationService {

    private final EmailClient emailClient;
    private final NotificationLogRepository notificationLog;

    public void sendOrderConfirmation(Order order) {
        // Check if we already sent this notification
        boolean alreadySent = notificationLog.existsByOrderIdAndType(
            order.getId(), NotificationType.ORDER_CONFIRMATION);

        if (alreadySent) {
            log.info("Order confirmation already sent for order {}", order.getId());
            return;   // do not send again
        }

        // Send the email
        emailClient.send(
            order.getUserEmail(),
            "Order confirmed: " + order.getId(),
            buildEmailBody(order)
        );

        // Record that we sent it (in same transaction as the order update if possible)
        notificationLog.save(NotificationLog.builder()
            .orderId(order.getId())
            .type(NotificationType.ORDER_CONFIRMATION)
            .sentAt(Instant.now())
            .build());
    }
}
\`\`\`

---

## Enterprise Architecture — The Full Picture

\`\`\`
CLIENT
  │
  │  POST /orders
  │  Idempotency-Key: uuid-abc-123
  │
  ▼
API GATEWAY (validates key format, rate limiting)
  │
  ▼
ORDER SERVICE
  ├─ [1] Check Redis: "idempotency:order:user1:uuid-abc-123"
  │         Hit?  → return cached response
  │         Miss? → continue
  │
  ├─ [2] Begin DB transaction
  │         INSERT orders (idempotency_key = uuid-abc-123)
  │         ON CONFLICT → return existing row
  │         INSERT outbox_events (status = PENDING)
  │         Commit transaction
  │
  ├─ [3] Store result in Redis (TTL 24h)
  │
  └─ [4] Return 201 Created

OUTBOX POLLER (or Debezium CDC)
  │
  ├─ Reads PENDING outbox_events
  ├─ Publishes to Kafka (producer idempotent=true)
  └─ Marks events as PUBLISHED

KAFKA TOPIC: orders
  │
  ▼
PAYMENT SERVICE CONSUMER
  ├─ [1] redis SETNX "kafka:dedup:order-processed:event-id"
  │         Already set? → skip (idempotent)
  │         Not set?     → continue
  │
  ├─ [2] Process payment (atomic DB write with unique constraint)
  ├─ [3] Send notification (check notification_log table)
  └─ [4] Commit Kafka offset
\`\`\`

Every step has its own deduplication layer. No single point of failure can cause a duplicate.

---

## Common Pitfalls Table

| Pitfall | What Goes Wrong | Fix |
|---|---|---|
| No idempotency key on payment API | Customer charged twice on network retry | Require \`Idempotency-Key\` header, reject requests without it |
| Key expires too early (1 minute TTL) | Retry after TTL creates duplicate | Set TTL to 24h+ for financial operations |
| Checking Redis AFTER business logic | Race condition creates two records | Always check Redis FIRST, then do work |
| Not storing the response in Redis | Retry gets a new (different) response | Store the full response, return it exactly on replay |
| Publishing Kafka event outside DB transaction | Crash between save and publish = lost event | Use Outbox Pattern — event and business data in one transaction |
| Consumer processing without dedup | Kafka redelivery charges customer twice | Use \`setIfAbsent\` in Redis before processing |
| Forgetting side effects (email, SMS) | User gets 5 "Order confirmed" emails | Check notification_log table before sending any communication |
| Using non-UUID as idempotency key | Keys collide between different users | Namespace by user ID: \`idempotency:order:userId:clientKey\` |

---

## Interview-Ready Summary

**What idempotency means:** Running the same operation multiple times gives the same result as running it once.

**Why it matters:** Every distributed system delivers messages at least once — HTTP retries, Kafka redelivery, load balancer retries. Without idempotency, at-least-once delivery becomes at-least-once billing.

**The four layers you need:**
1. **REST API** — \`Idempotency-Key\` header checked against Redis, result cached 24h
2. **Database** — unique constraint on \`idempotency_key\` column as a backstop
3. **Event publishing** — Outbox Pattern so events and business data are written atomically
4. **Kafka consumer** — \`SETNX\` in Redis before processing each event

**The interview signal:** Most candidates say "we used retries." Staff-level engineers say "we used retries with idempotency keys at the API layer, unique constraints at the DB layer, the Outbox Pattern for event publishing, and Redis-based dedup in Kafka consumers — because duplicates are not edge cases, they are guaranteed."`;

const followUps = [
  {
    question: "How do you handle the race condition where two requests with the same Idempotency-Key arrive simultaneously?",
    answer: `**The race condition scenario:** Two threads both check Redis, both see the key is missing, and both try to process the request at the same time.

**Layer 1 — Redis \`setIfAbsent\`:** Before processing, use \`SETNX\` (set if not exists) instead of a read-then-write. Redis \`SETNX\` is atomic — only one thread wins.

\`\`\`java
// Atomic: only one caller gets true
Boolean acquired = redis.opsForValue()
    .setIfAbsent("lock:order:" + idempotencyKey, "processing", Duration.ofSeconds(30));

if (Boolean.FALSE.equals(acquired)) {
    // Another thread is processing this key right now — wait briefly and retry
    throw new ConcurrentIdempotencyException("Request in progress, retry in 1s");
}
\`\`\`

**Layer 2 — Database unique constraint:** Even if two threads both get past Redis (Redis was temporarily unavailable), the database \`UNIQUE\` constraint on \`idempotency_key\` rejects the second insert with a \`DataIntegrityViolationException\`. You catch it and return the existing row.

**The correct order:** SETNX lock → process → store result → release lock. Never read-then-write. Always atomic operations.`
  },
  {
    question: "What happens if the service crashes after processing but before storing the idempotency key in Redis?",
    answer: `This is the hardest case. The business logic ran (order created, payment charged) but Redis was not updated. When the client retries, Redis has no record of the key, so the service processes it again — duplicate.

**Solution: database as the source of truth, not Redis.**

Always write your idempotency record to the database in the SAME transaction as the business operation:

\`\`\`java
@Transactional
public Order createOrder(String idempotencyKey, CreateOrderRequest req) {
    // Both the order AND the idempotency record are saved atomically
    Order order = orderRepo.save(buildOrder(req, idempotencyKey));

    // This will throw DataIntegrityViolationException if key already exists
    idempotencyRepo.save(IdempotencyRecord.builder()
        .key(idempotencyKey)
        .responsePayload(toJson(order))
        .expiresAt(Instant.now().plus(Duration.ofHours(24)))
        .build());

    return order;
}
\`\`\`

On retry, query the idempotency table first. If the record exists, return it without running business logic. Redis is just a performance cache — the idempotency table is the authority. If Redis is cold after a restart, the database still has the record and prevents the duplicate.`
  },
  {
    question: "How do you make idempotency work across microservices in a distributed transaction?",
    answer: `When one business operation spans multiple services (Order → Payment → Inventory), each service needs its own idempotency layer. The idempotency key from the original API call must propagate through every downstream step.

**Pattern: propagate the idempotency key in the event payload**

\`\`\`java
// Order service publishes event WITH the original idempotency key
OrderCreatedEvent event = OrderCreatedEvent.builder()
    .eventId(UUID.randomUUID().toString())  // unique per event emission
    .orderId(order.getId())
    .idempotencyKey(originalApiKey)          // carry the original key through
    .build();
\`\`\`

\`\`\`java
// Payment service uses it as its own dedup key
String dedupKey = "payment:processed:" + event.getOrderId();
Boolean isNew = redis.opsForValue().setIfAbsent(dedupKey, "1", Duration.ofDays(7));
if (Boolean.FALSE.equals(isNew)) return;

paymentRepo.save(Payment.builder()
    .orderId(event.getOrderId())
    .idempotencyKey(event.getIdempotencyKey())  // unique constraint in payments table too
    .build());
\`\`\`

The Saga Pattern (choreography or orchestration) handles the compensating transactions when one step fails. Idempotency handles the duplicate delivery problem. Both are required — they solve different problems.`
  }
];

// Read the file
const raw = readFileSync(TARGET, 'utf-8');
const data = JSON.parse(raw);

// Find the theme and scenario
const themeIdx = data.themes.findIndex(t => t.id === 'idempotency-underrated-skill-plain');
if (themeIdx === -1) throw new Error('Theme not found: idempotency-underrated-skill-plain');

const theme = data.themes[themeIdx];
const scenarioIdx = theme.scenarios.findIndex(s => s.id === 'th-idempotency-deep-plain-full');
if (scenarioIdx === -1) throw new Error('Scenario not found: th-idempotency-deep-plain-full');

// Update the scenario
theme.scenarios[scenarioIdx] = {
  ...theme.scenarios[scenarioIdx],
  signals: [
    'Idempotency-Key',
    'setIfAbsent / SETNX',
    'at-least-once delivery',
    'ON CONFLICT (idempotency_key)',
    'Outbox Pattern',
    'Kafka consumer deduplication',
    'DataIntegrityViolationException',
    'X-Idempotent-Replayed',
    'TTL',
    'race condition',
    'side effects',
    'Debezium CDC'
  ],
  answer,
  followUps
};

// Write back
const updated = JSON.stringify(data, null, 2);
writeFileSync(TARGET, updated, 'utf-8');

// Verification
const verify = JSON.parse(readFileSync(TARGET, 'utf-8'));
const s = verify.themes[themeIdx].scenarios[scenarioIdx];
console.log('✓ Scenario updated successfully');
console.log(`  Answer length  : ${s.answer.length.toLocaleString()} chars`);
console.log(`  Signals count  : ${s.signals.length}`);
console.log(`  Follow-ups     : ${s.followUps.length}`);
console.log(`  File size      : ${updated.length.toLocaleString()} chars`);
