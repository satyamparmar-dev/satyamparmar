/**
 * V2 rewrite of all 4 distributed-transactions scenario answers.
 * Run: node scripts/rewrite-v2-distributed-tx.mjs
 */
import { readFileSync, writeFileSync } from 'fs';

const FILE = 'public/data/scenarioInterviewThemes.json';
const F = '```';

const answers = {

// ─────────────────────────────────────────────────────────────────────────────
'th-dt-pay-order': `
## 🔥 The situation
A user clicks "Place Order." Your system must charge their card AND create the order in the database. These happen in two separate services. If the charge succeeds but the order fails (or vice versa), money is taken but no order exists — or an order exists with no payment.

## 🧠 Understand this first

| Option | How it works | Problem |
|---|---|---|
| Traditional DB transaction | All-or-nothing in one database | Only works if everything is in the same DB |
| Two-Phase Commit (2PC) | Coordinator locks all services, then commits | Slow, blocking, hard to implement, still fails |
| Saga pattern | Break into steps with compensating actions | Eventual consistency, but works across services |
| Outbox pattern | Save event in same DB transaction as the data | Guarantees message is eventually sent |

**The core problem:** You cannot atomically write to two different databases. Choose Saga + Outbox instead.

## Step 1: Design the saga steps for "place order"

${F}text
Happy path:
  Step 1: PaymentService   → charge card      → PAYMENT_PENDING
  Step 2: OrderService     → create order     → ORDER_CREATED
  Step 3: PaymentService   → confirm payment  → PAYMENT_CONFIRMED

Failure at Step 2 (order creation fails):
  Compensate Step 1: PaymentService → refund card   → PAYMENT_REFUNDED
  Final state: nothing charged, nothing ordered ✓

Failure at Step 3 (confirm fails):
  Compensate Step 2: OrderService → cancel order
  Compensate Step 1: PaymentService → refund
  Final state: clean ✓
${F}

## Step 2: Use the Outbox pattern to guarantee message delivery

**Why:** If you charge the card and then try to send a Kafka event to OrderService, a crash between those two steps means the charge happened but the event was never sent — order never created.

${F}sql
-- Same database as PaymentService
CREATE TABLE outbox_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic       VARCHAR(100) NOT NULL,    -- Kafka topic name
  payload     TEXT NOT NULL,            -- JSON message
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  sent_at     TIMESTAMPTZ              -- null = not yet published
);
${F}

${F}java
@Service
@Transactional
public class PaymentService {

    public void charge(String orderId, Money amount) {
        // Step 1: charge card (via payment gateway)
        String chargeId = paymentGateway.charge(amount);

        // Step 2: save payment record
        paymentRepo.save(new Payment(orderId, chargeId, "PENDING"));

        // Step 3: save outbox event — SAME transaction as the payment record
        outboxRepo.save(new OutboxEvent(
            "order-events",
            "{\"type\":\"PAYMENT_CHARGED\",\"orderId\":\"" + orderId + "\",\"chargeId\":\"" + chargeId + "\"}"
        ));
        // If we crash here: both payment + outbox event are saved, or neither are (atomicity)
        // A poller will pick up the outbox event and send it to Kafka reliably
    }
}
${F}

**The outbox poller (sends events to Kafka):**
${F}java
@Component
public class OutboxPoller {

    @Scheduled(fixedDelay = 1000) // runs every 1 second
    @Transactional
    public void publishPending() {
        List<OutboxEvent> pending = outboxRepo.findBySentAtIsNull();
        for (OutboxEvent event : pending) {
            try {
                kafkaTemplate.send(event.getTopic(), event.getPayload()).get(); // sync send
                event.setSentAt(Instant.now());
                outboxRepo.save(event);
                log.info("Published outbox event {} to {}", event.getId(), event.getTopic());
            } catch (Exception e) {
                log.warn("Failed to publish outbox event {} — will retry", event.getId());
            }
        }
    }
}
${F}

**What you see in logs (happy path):**
${F}text
INFO  PaymentService - Charging card for order ord-99, amount 49.99
INFO  PaymentService - Payment saved, outbox event saved (transaction committed)
INFO  OutboxPoller   - Published outbox event abc-123 to order-events
INFO  OrderService   - Received PAYMENT_CHARGED event for ord-99, creating order
INFO  OrderService   - Order ord-99 created successfully
${F}

## Step 3: Handle the compensation (refund on failure)
${F}java
// OrderService listens to Kafka
@KafkaListener(topics = "order-events")
public void handlePaymentCharged(String message) {
    PaymentChargedEvent event = parse(message);
    try {
        orderRepo.save(new Order(event.getOrderId(), "CREATED"));
        publishOutbox("payment-events", "{\"type\":\"ORDER_CREATED\",\"orderId\":\"" + event.getOrderId() + "\"}");
    } catch (Exception e) {
        // Could not create order — tell payment to refund
        log.error("Failed to create order {} — triggering compensation", event.getOrderId());
        publishOutbox("payment-events", "{\"type\":\"ORDER_FAILED\",\"orderId\":\"" + event.getOrderId() + "\",\"chargeId\":\"" + event.getChargeId() + "\"}");
    }
}

// PaymentService listens for ORDER_FAILED and refunds
@KafkaListener(topics = "payment-events")
public void handleOrderFailed(String message) {
    if (message.contains("ORDER_FAILED")) {
        OrderFailedEvent e = parse(message);
        paymentGateway.refund(e.getChargeId());
        paymentRepo.updateStatus(e.getOrderId(), "REFUNDED");
        log.info("Refunded charge {} for order {}", e.getChargeId(), e.getOrderId());
    }
}
${F}

**What you see in logs (failure + compensation):**
${F}text
INFO  PaymentService - Charged card for ord-99
INFO  OutboxPoller   - Published PAYMENT_CHARGED for ord-99
ERROR OrderService   - DB error creating order ord-99: unique constraint violation
INFO  OutboxPoller   - Published ORDER_FAILED for ord-99
INFO  PaymentService - Received ORDER_FAILED — refunding charge ch_abc
INFO  PaymentService - Refund successful for ord-99
${F}
**What this means (simple):** The whole dance is asynchronous and event-driven. Each service only does one small step and trusts the next step to happen via Kafka. If anything fails, a compensating event reverses the previous step. No global lock, no 2PC.

## Step 4: Make every step idempotent
${F}java
// OrderService — don't create duplicate orders if the same event arrives twice
public void handlePaymentCharged(String orderId, String chargeId) {
    if (orderRepo.existsByOrderId(orderId)) {
        log.info("Order {} already exists — skipping duplicate event", orderId);
        return; // idempotent — safe to call multiple times
    }
    orderRepo.save(new Order(orderId, "CREATED"));
}
${F}

## Your interview answer
**Open:** "I'd use the Saga pattern with an Outbox — no 2PC, no distributed locks."
**Then:** "Each step is a local database transaction. Events are written to an outbox table in the same transaction as the data change — guaranteed to be sent eventually. If a step fails, a compensating event reverses the previous steps."
**End:** "The key properties: at-least-once delivery via the outbox poller, and idempotency on the receiving side so duplicate events are safe. This gives eventual consistency without distributed locking."
`.trim(),

// ─────────────────────────────────────────────────────────────────────────────
'th-dt-db-kafka': `
## 🔥 The situation
Your service saves a record to a database AND publishes an event to Kafka. You need both to succeed or neither. But Kafka and your database are different systems — you cannot wrap them in one transaction.

## 🧠 Understand this first

| Approach | Problem |
|---|---|
| Save to DB first, then publish to Kafka | Crash between save and publish → event never sent, DB has data with no event |
| Publish to Kafka first, then save to DB | Crash between publish and save → event sent but DB has no data |
| Both in one transaction | Kafka does not support XA/2PC with databases — this is not possible in practice |
| Outbox pattern | Save DB record + outbox event in one DB transaction. A poller reliably publishes the outbox event to Kafka | Works — this is the correct approach |

**The Outbox pattern solves the dual-write problem.**

## Step 1: Understand why dual-write fails
${F}text
// Without Outbox — common but broken approach:
try {
    orderRepo.save(order);           // ← DB write succeeds
    kafkaTemplate.send("orders", e); // ← JVM crashes HERE
    // Event never published — downstream services never know about the order
} catch (Exception e) { ... }

// The problem: no atomicity between DB and Kafka
${F}

## Step 2: Implement the Outbox pattern
${F}sql
-- outbox table in your application's database
CREATE TABLE outbox_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic       VARCHAR(255) NOT NULL,
  key         VARCHAR(255),          -- Kafka message key (for partitioning)
  payload     JSONB NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  sent_at     TIMESTAMPTZ,           -- null = pending
  attempts    INT DEFAULT 0
);

-- Index for efficient polling
CREATE INDEX idx_outbox_unsent ON outbox_events(created_at) WHERE sent_at IS NULL;
${F}

${F}java
@Service
public class OrderService {

    @Transactional
    public void createOrder(Order order) {
        // Both writes are in ONE local DB transaction
        orderRepo.save(order);

        outboxRepo.save(OutboxEvent.builder()
            .topic("order-events")
            .key(order.getId().toString())
            .payload(Map.of(
                "type", "ORDER_CREATED",
                "orderId", order.getId(),
                "customerId", order.getCustomerId(),
                "amount", order.getTotal()
            ))
            .build());

        // If this transaction rolls back (any reason), both are rolled back.
        // If it commits, both are committed — atomically within the DB.
    }
}
${F}

**What you see in the DB after the transaction commits:**
${F}text
orders table:
  id=ord-99, customer_id=cust-1, status=CREATED, total=49.99

outbox_events table:
  id=evt-abc, topic=order-events, payload={"type":"ORDER_CREATED","orderId":"ord-99"}, sent_at=NULL
${F}
**What this means (simple):** Both the order AND the outbox event are in the database. They will either both be there or neither — because they're in the same database transaction. Now a separate poller job reads the outbox and sends to Kafka.

## Step 3: The outbox poller
${F}java
@Component
public class OutboxPoller {

    @Scheduled(fixedDelay = 500) // poll every 500ms
    public void publishPending() {
        List<OutboxEvent> pending = outboxRepo.findTop100BySentAtIsNullOrderByCreatedAtAsc();

        for (OutboxEvent event : pending) {
            try {
                // Send to Kafka synchronously (wait for ack)
                kafkaTemplate.send(event.getTopic(), event.getKey(), event.getPayload())
                    .get(5, TimeUnit.SECONDS);

                // Mark as sent — only AFTER Kafka confirms receipt
                outboxRepo.markSent(event.getId(), Instant.now());

            } catch (Exception e) {
                outboxRepo.incrementAttempts(event.getId());
                log.warn("Failed to send outbox event {} (attempt {}): {}",
                    event.getId(), event.getAttempts() + 1, e.getMessage());
            }
        }
    }
}
${F}

**What you see in logs (normal operation):**
${F}text
INFO  OutboxPoller - Sent event evt-abc to order-events (partition=2, offset=1045)
INFO  OutboxPoller - Marked evt-abc as sent
INFO  OutboxPoller - Sent event evt-def to order-events (partition=2, offset=1046)
${F}

**What you see when Kafka is temporarily down:**
${F}text
WARN  OutboxPoller - Failed to send outbox event evt-abc (attempt 1): Connection refused
WARN  OutboxPoller - Failed to send outbox event evt-abc (attempt 2): Connection refused
INFO  OutboxPoller - Sent event evt-abc to order-events — succeeded on attempt 3
${F}
**What this means (simple):** The poller retries until Kafka is available. Events may be delayed, but they are NEVER lost — they stay in the outbox table until they are successfully sent. This is at-least-once delivery.

## Step 4: Handle duplicates on the consumer side
**Why:** The poller may send the same event twice if it crashes after Kafka acknowledges but before it marks the event as sent in the DB.

${F}java
// Consumer — check for duplicates using the event ID
@KafkaListener(topics = "order-events")
@Transactional
public void handleOrderCreated(String payload) {
    OrderCreatedEvent event = parse(payload);

    // Idempotency check
    if (processedEventRepo.existsById(event.getEventId())) {
        log.info("Duplicate event {} — skipping", event.getEventId());
        return;
    }

    // Process the event
    inventoryService.reserve(event.getOrderId(), event.getItems());

    // Record that we've processed this event
    processedEventRepo.save(new ProcessedEvent(event.getEventId()));
}
${F}

## Your interview answer
**Open:** "The dual-write problem is that you cannot atomically write to two different systems. The Outbox pattern solves it."
**Then:** "I write the business data and an outbox event in a single local DB transaction — they are always consistent with each other. A poller then reads unsent outbox events and publishes them to Kafka, retrying until successful."
**End:** "This gives at-least-once delivery from DB to Kafka. The consumer handles duplicates via an idempotency check on the event ID. No distributed transactions needed."
`.trim(),

// ─────────────────────────────────────────────────────────────────────────────
'th-dt-conflict': `
## 🔥 The situation
Two users try to update the same record at the same time. The second update overwrites the first — silently. The first user's changes are lost. This is called a "lost update" problem.

## 🧠 Understand this first

| Strategy | How it works | Best for |
|---|---|---|
| Optimistic locking | Read a version number, update only if version hasn't changed | Low contention — users rarely edit same record |
| Pessimistic locking | Lock the row while reading — others wait | High contention — e.g., concert ticket booking |
| Last-write-wins | No protection — whoever saves last wins | Only OK when conflicts don't matter (telemetry data) |
| CRDT | Data structure that merges concurrent changes automatically | Collaborative editing (Google Docs style) |

## Step 1: Implement optimistic locking with JPA

${F}java
@Entity
@Table(name = "products")
public class Product {

    @Id
    private Long id;

    private String name;
    private int stockCount;

    @Version  // ← JPA manages this automatically
    private int version;    // starts at 0, incremented on every UPDATE
}
${F}

${F}java
// Service layer — normal update
@Transactional
public Product updateStock(Long productId, int newCount) {
    Product product = productRepo.findById(productId).orElseThrow();
    product.setStockCount(newCount);
    return productRepo.save(product);
    // JPA generates: UPDATE products SET stock_count=?, version=version+1
    //                WHERE id=? AND version=?   ← the version check
    // If version doesn't match: throws OptimisticLockingFailureException
}
${F}

**What happens behind the scenes:**
${F}text
User A reads product: { id:1, stock:100, version:5 }
User B reads product: { id:1, stock:100, version:5 }

User A saves:  UPDATE products SET stock=90, version=6 WHERE id=1 AND version=5
              → 1 row updated ✓  (version was still 5)

User B saves:  UPDATE products SET stock=110, version=6 WHERE id=1 AND version=5
              → 0 rows updated ✗  (version is now 6, not 5 anymore)
              → JPA throws OptimisticLockingFailureException
${F}
**What this means (simple):** The WHERE clause includes the version number. If someone else saved between your read and your save, the version changed — your update hits 0 rows — JPA throws an exception. You handle it by re-reading and retrying.

## Step 2: Handle the optimistic locking exception
${F}java
@Service
public class ProductService {

    @Retryable(
        retryFor = OptimisticLockingFailureException.class,
        maxAttempts = 3,
        backoff = @Backoff(delay = 100, multiplier = 2)  // 100ms, 200ms, 400ms
    )
    @Transactional
    public Product updateStock(Long productId, int delta) {
        Product product = productRepo.findById(productId).orElseThrow();
        product.setStockCount(product.getStockCount() + delta);
        return productRepo.save(product);
    }

    @Recover
    public Product onConflict(OptimisticLockingFailureException e, Long productId, int delta) {
        log.error("Could not update product {} after 3 retries — conflict persists", productId);
        throw new ConflictException("Product is being edited by multiple users — please try again");
    }
}
${F}

**What you see in logs during conflict:**
${F}text
WARN  ProductService - OptimisticLockingFailureException for product 1, attempt 1/3
WARN  ProductService - OptimisticLockingFailureException for product 1, attempt 2/3
INFO  ProductService - Update succeeded for product 1 on attempt 3
${F}

## Step 3: Pessimistic locking (for high-contention scenarios)
**Use this when:** Two requests for the same row are common — like booking the last concert ticket.

${F}java
// Pessimistic locking — locks the row immediately on read
// Other threads trying to read+lock the same row WAIT until the lock is released
public interface TicketRepo extends JpaRepository<Ticket, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)  // SELECT ... FOR UPDATE
    @Query("SELECT t FROM Ticket t WHERE t.id = :id")
    Optional<Ticket> findByIdForUpdate(@Param("id") Long id);
}

@Transactional
public void bookTicket(Long ticketId, String userId) {
    Ticket ticket = ticketRepo.findByIdForUpdate(ticketId)  // row is locked
        .orElseThrow();

    if (!ticket.isAvailable()) {
        throw new TicketAlreadyBookedException("Ticket already taken");
    }
    ticket.setUserId(userId);
    ticket.setAvailable(false);
    ticketRepo.save(ticket);
    // Lock released when @Transactional method returns
}
${F}

**What the DB does:**
${F}sql
-- Thread 1 executes:
SELECT * FROM tickets WHERE id = 99 FOR UPDATE;  -- row locked

-- Thread 2 tries same:
SELECT * FROM tickets WHERE id = 99 FOR UPDATE;  -- WAITS here (blocked by Thread 1)

-- Thread 1 commits:
UPDATE tickets SET user_id='user-A', available=false WHERE id=99;
COMMIT;  -- lock released

-- Thread 2 unblocks and reads:
-- ticket.isAvailable() = false → throws TicketAlreadyBookedException
${F}
**What this means (simple):** Only one thread can hold the lock at a time. The second thread waits. When it finally reads the row, the ticket is already booked — no double-booking possible.

## Step 4: Expose the version to the API for frontend conflict detection
${F}java
// Include version in API response so client can send it back
public record ProductResponse(Long id, String name, int stock, int version) {}

// Client reads:  GET /products/1 → { id:1, stock:100, version:5 }
// Client sends:  PUT /products/1 { stock:90, version:5 }
// Server checks: if DB version != 5, return 409 Conflict
@PutMapping("/products/{id}")
public ResponseEntity<?> update(@PathVariable Long id, @RequestBody UpdateRequest req) {
    try {
        Product p = productService.updateWithVersion(id, req.stock(), req.version());
        return ResponseEntity.ok(toResponse(p));
    } catch (OptimisticLockingFailureException e) {
        return ResponseEntity.status(409)
            .body(Map.of("error", "Conflict", "message", "Record was modified by another user. Please refresh and try again."));
    }
}
${F}

**What the client sees on conflict:**
${F}json
HTTP 409 Conflict
{
  "error": "Conflict",
  "message": "Record was modified by another user. Please refresh and try again."
}
${F}

## Your interview answer
**Open:** "The lost update problem happens when two users read the same record, both make changes, and the second save silently overwrites the first. I'd fix it with optimistic locking."
**Then:** "JPA's \`@Version\` adds a version column — every UPDATE includes a WHERE version=N check. If another user saved first, the version changed, the update hits 0 rows, and JPA throws OptimisticLockingFailureException. The client gets a 409 and is told to refresh."
**End:** "For low-contention cases (most CRUD), optimistic locking is better because there's no blocking. For high-contention cases like ticket booking, I'd use pessimistic locking with SELECT FOR UPDATE to prevent any race condition."
`.trim(),

// ─────────────────────────────────────────────────────────────────────────────
'th-dt-retry-dup': `
## 🔥 The situation
A payment request times out. The client retries. The payment was actually processed the first time — but the response was lost in the network. The user is charged twice. How do you prevent this?

## 🧠 Understand this first

| Term | What it means |
|---|---|
| Idempotency | Calling the same operation multiple times gives the same result as calling it once |
| Idempotency key | A unique ID the client sends with the request — server uses it to detect duplicates |
| At-least-once delivery | The system guarantees the message is delivered, but may deliver it more than once |
| Exactly-once semantics | Delivered exactly once — very hard to guarantee end-to-end |

**The safe approach:** at-least-once delivery + idempotent receiver = effectively exactly-once behavior.

## Step 1: Client sends an idempotency key with every request
${F}java
// Client side — generate a unique key per operation
String idempotencyKey = UUID.randomUUID().toString(); // e.g., "550e8400-e29b-41d4-a716-446655440000"

// Include it in the HTTP header
HttpHeaders headers = new HttpHeaders();
headers.set("Idempotency-Key", idempotencyKey);

HttpEntity<PaymentRequest> request = new HttpEntity<>(paymentReq, headers);

try {
    ResponseEntity<PaymentResponse> response =
        restTemplate.postForEntity("/payments", request, PaymentResponse.class);
    // success
} catch (HttpServerErrorException | ResourceAccessException e) {
    // Timeout or 5xx — RETRY with the SAME idempotencyKey
    log.warn("Payment request failed, retrying with same key: {}", idempotencyKey);
    restTemplate.postForEntity("/payments", request, PaymentResponse.class);
}
${F}
**What this means (simple):** The same UUID is sent on both the original request AND the retry. The server uses this key to detect "I already processed this operation — return the same result without doing anything again."

## Step 2: Server stores and checks the idempotency key
${F}sql
CREATE TABLE idempotency_keys (
  key         VARCHAR(100) PRIMARY KEY,
  response    TEXT NOT NULL,    -- JSON of the response we sent
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  expires_at  TIMESTAMPTZ      -- clean up old keys after 24 hours
);
${F}

${F}java
@RestController
public class PaymentController {

    @PostMapping("/payments")
    @Transactional
    public ResponseEntity<PaymentResponse> pay(
        @RequestHeader("Idempotency-Key") String idempotencyKey,
        @RequestBody PaymentRequest request
    ) {
        // 1. Check if we already processed this key
        Optional<IdempotencyRecord> existing = idempotencyRepo.findById(idempotencyKey);
        if (existing.isPresent()) {
            log.info("Duplicate request detected for key {} — returning cached response", idempotencyKey);
            PaymentResponse cachedResponse = parse(existing.get().getResponse());
            return ResponseEntity.ok(cachedResponse); // same result, no charge
        }

        // 2. Process the payment
        PaymentResponse result = paymentGateway.charge(request.getCardToken(), request.getAmount());

        // 3. Save the key + response atomically
        idempotencyRepo.save(new IdempotencyRecord(
            idempotencyKey,
            toJson(result),
            Instant.now().plus(Duration.ofHours(24))
        ));

        return ResponseEntity.ok(result);
    }
}
${F}

**What you see in logs on original request:**
${F}text
INFO  PaymentController - Processing payment for key 550e8400 — charging $49.99
INFO  PaymentGateway    - Charge successful: charge_id=ch_abc123
INFO  PaymentController - Saved idempotency record for 550e8400
${F}

**What you see in logs on duplicate request:**
${F}text
INFO  PaymentController - Duplicate request detected for key 550e8400 — returning cached response
// No charge to the payment gateway. Response is identical to the first call.
${F}

## Step 3: Handle the race condition — two duplicate requests at the same time
**Problem:** Two retries arrive simultaneously. Both check the table and find no record. Both try to process and both try to charge.

${F}java
// Fix: use a unique constraint + handle the conflict
// The idempotency_keys table already has PRIMARY KEY on "key" — unique constraint built-in

@Transactional
public ResponseEntity<PaymentResponse> pay(String idempotencyKey, PaymentRequest request) {
    try {
        // Try to insert the key FIRST (claim it)
        idempotencyRepo.insert(new IdempotencyRecord(idempotencyKey, "PROCESSING", Instant.now()));
    } catch (DataIntegrityViolationException e) {
        // Another thread already inserted this key — wait and return their result
        log.info("Key {} already being processed — waiting for result", idempotencyKey);
        IdempotencyRecord record = waitForCompletion(idempotencyKey);
        return ResponseEntity.ok(parse(record.getResponse()));
    }

    // We won the race — proceed with the payment
    PaymentResponse result = paymentGateway.charge(request.getCardToken(), request.getAmount());
    idempotencyRepo.updateResponse(idempotencyKey, toJson(result));
    return ResponseEntity.ok(result);
}
${F}

## Step 4: Apply idempotency to Kafka consumers too
${F}java
// Kafka consumer — track which event IDs have been processed
@KafkaListener(topics = "payment-events")
@Transactional
public void handlePaymentEvent(ConsumerRecord<String, String> record) {
    String eventId = record.headers().lastHeader("event-id").toString();

    if (processedRepo.existsById(eventId)) {
        log.info("Already processed event {} — skipping", eventId);
        return;
    }

    // Process the event
    PaymentEvent event = parse(record.value());
    orderService.confirmPayment(event.getOrderId());

    // Mark as processed in same transaction
    processedRepo.save(new ProcessedEvent(eventId, Instant.now()));
}
${F}

**What you see when a duplicate Kafka event arrives:**
${F}text
INFO  PaymentEventConsumer - Already processed event evt-abc — skipping
// No duplicate order confirmation. Order status unchanged.
${F}

## Step 5: Expire old idempotency keys
${F}sql
-- Run periodically to prevent the table from growing forever
DELETE FROM idempotency_keys WHERE expires_at < NOW();
${F}

${F}java
// Or in Spring:
@Scheduled(cron = "0 0 2 * * *") // every day at 2 AM
public void cleanupExpiredKeys() {
    int deleted = idempotencyRepo.deleteExpired(Instant.now());
    log.info("Cleaned up {} expired idempotency keys", deleted);
}
${F}

## Your interview answer
**Open:** "I'd use idempotency keys — the client generates a unique UUID per operation and includes it in the request header. On retry, it sends the same UUID."
**Then:** "The server stores the key + response in a table. On every request, it checks: have I seen this key before? If yes, return the cached response immediately without charging again. The check and insert are in a DB transaction with a unique constraint to handle concurrent retries."
**End:** "The same pattern applies to Kafka consumers — track processed event IDs and skip duplicates. This gives effectively exactly-once behavior with at-least-once delivery infrastructure."
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
