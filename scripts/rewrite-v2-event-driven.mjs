/**
 * V2 rewrite — event-driven-messaging (3 scenarios)
 * Run: node scripts/rewrite-v2-event-driven.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
const FILE = 'public/data/scenarioInterviewThemes.json';
const F = '```';

const answers = {

'th-ed-dup': `
## 🔥 The situation
Your Kafka consumer is processing an "ORDER_PLACED" event. It creates an inventory reservation and sends a confirmation email. Then the consumer crashes before committing the offset. On restart, Kafka replays the same event. Now the user has two inventory reservations and two confirmation emails.

## 🧠 Why duplicates happen in event-driven systems

Kafka (and most message systems) guarantee **at-least-once delivery** by default. This means:
- Every message is definitely delivered
- But it may be delivered more than once (on retry, restart, or rebalance)

This is intentional — the alternative (at-most-once) means messages can be LOST. Lost messages are worse than duplicates. So the system delivers duplicates and asks YOU to handle them gracefully.

${F}text
Normal flow:
  Consumer reads message → processes → commits offset → done

Crash after processing but before commit:
  Consumer reads message → processes (email sent!) → CRASH
  Consumer restarts → Kafka replays from last committed offset
  Consumer reads same message again → processes again → duplicate email!

This is NOT a bug in Kafka. It is by design. You handle it with idempotency.
${F}

| Solution | How it works | Best for |
|---|---|---|
| Idempotent consumer | Track processed event IDs in DB — skip if already seen | Most common — works for any DB or action |
| Exactly-once via Kafka transactions | Atomic consume + produce in one Kafka transaction | Complex — only works within Kafka ecosystem |
| Idempotent operations | Design the operation to be safe to call twice | Best when possible — e.g., UPDATE instead of INSERT |

## Step 1: Add an event ID to every message

First, every event needs a unique ID. This is what you use to detect duplicates.

${F}java
// Producer — include a stable, unique event ID
public void publishOrderPlaced(Order order) {
    String eventId = UUID.randomUUID().toString(); // unique per event

    ProducerRecord<String, String> record = new ProducerRecord<>(
        "order-events",               // topic
        order.getId().toString(),     // key (used for partitioning — same order → same partition)
        buildPayload(order, eventId)  // JSON payload
    );

    // Also add event ID as a Kafka header for easy extraction
    record.headers().add("event-id", eventId.getBytes(StandardCharsets.UTF_8));

    kafkaTemplate.send(record);
    log.info("Published ORDER_PLACED event {} for order {}", eventId, order.getId());
}

private String buildPayload(Order order, String eventId) {
    return """
        {
          "eventId": "%s",
          "type": "ORDER_PLACED",
          "orderId": "%s",
          "customerId": "%s",
          "timestamp": "%s"
        }
        """.formatted(eventId, order.getId(), order.getCustomerId(), Instant.now());
}
${F}

## Step 2: Track processed event IDs in a database table
${F}sql
-- In the consumer's database
CREATE TABLE processed_events (
  event_id      VARCHAR(100)  PRIMARY KEY,   -- unique constraint prevents duplicates
  topic         VARCHAR(100)  NOT NULL,
  consumer_group VARCHAR(100) NOT NULL,
  processed_at  TIMESTAMPTZ   DEFAULT NOW()
);

-- Clean up old events (older than 7 days) — prevents unbounded growth
CREATE INDEX idx_processed_events_age ON processed_events(processed_at);
${F}

${F}java
@Service
public class OrderEventConsumer {

    @KafkaListener(topics = "order-events", groupId = "inventory-service")
    @Transactional // ← VERY IMPORTANT: DB update + processedEvent insert in one atomic transaction
    public void handleOrderPlaced(ConsumerRecord<String, String> record) {

        // Extract the event ID
        String eventId = extractEventId(record);

        // Step 1: Check if already processed
        if (processedEventRepo.existsById(eventId)) {
            log.info("⏩ Skipping duplicate event: {} (already processed)", eventId);
            return; // safe to return — offset will still be committed, event is skipped
        }

        // Step 2: Parse and process the event
        OrderPlacedEvent event = parse(record.value());
        inventoryService.createReservation(event.getOrderId(), event.getItems());
        emailService.sendConfirmation(event.getCustomerId(), event.getOrderId());

        // Step 3: Record this event as processed (same transaction as above)
        processedEventRepo.save(new ProcessedEvent(
            eventId,
            record.topic(),
            "inventory-service"
        ));

        log.info("✅ Processed event {} for order {}", eventId, event.getOrderId());
    }

    private String extractEventId(ConsumerRecord<String, String> record) {
        // Try Kafka header first
        Header header = record.headers().lastHeader("event-id");
        if (header != null) {
            return new String(header.value(), StandardCharsets.UTF_8);
        }
        // Fallback: derive from Kafka's built-in coordinates — always unique per message
        return record.topic() + "-" + record.partition() + "-" + record.offset();
        // e.g., "order-events-2-1045" — this is guaranteed unique for any given message
    }
}
${F}

**What you see in logs — first processing:**
${F}text
INFO  OrderEventConsumer - Processing event evt-abc for order ord-99
INFO  InventoryService   - Reservation created for order ord-99
INFO  EmailService       - Confirmation email sent to customer cust-1
INFO  OrderEventConsumer - ✅ Processed event evt-abc for order ord-99
INFO  OrderEventConsumer - Committed offset (partition=2, offset=1045)
${F}

**What you see in logs — duplicate after crash/replay:**
${F}text
INFO  OrderEventConsumer - Processing event evt-abc for order ord-99
INFO  OrderEventConsumer - ⏩ Skipping duplicate event: evt-abc (already processed)
// No second reservation. No second email.
${F}

## Step 3: Design operations to be naturally idempotent where possible
${F}java
// BAD: INSERT throws error or creates duplicate on second call
inventoryRepo.save(new Reservation(orderId, items)); // second call = duplicate row

// GOOD: UPSERT — same result whether called once or ten times
@Modifying
@Query("""
    INSERT INTO reservations (order_id, item_id, quantity, status)
    VALUES (:orderId, :itemId, :qty, 'RESERVED')
    ON CONFLICT (order_id, item_id) DO UPDATE SET status = 'RESERVED'
    """)
void upsertReservation(@Param("orderId") String orderId,
                        @Param("itemId") String itemId,
                        @Param("qty") int qty);

// Second call with same orderId+itemId:
// → updates existing row instead of inserting a new one → safe!
${F}

${F}java
// BAD: email sent on every call
emailService.send(customerId, "Your order is confirmed!"); // second call = second email

// GOOD: track sent emails by event ID
public void sendConfirmationIfNotSent(String eventId, String customerId, String orderId) {
    if (sentEmailRepo.existsByEventId(eventId)) {
        log.info("Email already sent for event {} — skipping", eventId);
        return;
    }
    emailClient.send(customerId, "Your order " + orderId + " is confirmed!");
    sentEmailRepo.save(new SentEmail(eventId, customerId, Instant.now()));
}
${F}

## Step 4: Why the @Transactional annotation is critical here
${F}text
Scenario without @Transactional:
  1. Create reservation in DB ✓
  2. Send email ✓
  3. Save ProcessedEvent to DB ← FAILS (DB error)
  4. Kafka offset committed
  → Event recorded as unprocessed? No. Processed? No. State is inconsistent!

  Next replay: reservation created AGAIN, email sent AGAIN (duplicate!)

With @Transactional:
  1. Create reservation + save ProcessedEvent in ONE DB transaction
  2. Either BOTH commit or BOTH rollback
  3. If step 1 fails → transaction rolls back → ProcessedEvent not saved → Kafka replays → clean retry
  4. If step 1 succeeds → ProcessedEvent is saved → Kafka replays → "already processed" → skip

Note: The email is the tricky part. Emails cannot be in a DB transaction.
Strategy: send email AFTER the transaction commits, and make it idempotent with its own ID table.
${F}

## Your interview answer
**Open:** "Kafka delivers at-least-once — duplicates are by design, not a bug. The fix is idempotent consumer logic: every event needs a unique ID, and the consumer checks whether it has already processed that ID before doing any work."
**Then:** "I store processed event IDs in a DB table with a unique constraint. The check, business logic, and ID insert all happen in one DB transaction — so a crash mid-way rolls everything back cleanly, and Kafka replays to a clean state."
**End:** "Where possible, I also design operations to be naturally idempotent — UPSERT instead of INSERT, status checks before sending emails. Multiple calls should produce the same outcome as one."
`.trim(),

'th-ed-order': `
## 🔥 The situation
Events are published in order: ORDER_CREATED → PAYMENT_CONFIRMED → ORDER_SHIPPED. But the consumer receives them out of order: ORDER_SHIPPED arrives before ORDER_CREATED. The consumer tries to mark an order as shipped before it even exists. The system breaks.

## 🧠 Why out-of-order events happen

${F}text
Kafka ordering guarantee: within a single partition, messages are ALWAYS in order.
But across partitions, there is NO ordering guarantee.

Example:
  Producer sends ORDER_CREATED  → partition 2, offset 100
  Producer sends PAYMENT_CONFIRMED → partition 0, offset 85  ← different partition!
  Producer sends ORDER_SHIPPED  → partition 2, offset 101

Consumer group:
  Thread A reads partition 2: ORDER_CREATED (offset 100) → processes ✓
  Thread B reads partition 0: PAYMENT_CONFIRMED (offset 85) → processes ✓
  Thread A reads partition 2: ORDER_SHIPPED (offset 101) → processes ✓

But if thread B is slower:
  Thread A processes ORDER_CREATED (100) and ORDER_SHIPPED (101) fast
  Thread B is still processing PAYMENT_CONFIRMED
  → ORDER_SHIPPED arrives at business logic BEFORE PAYMENT_CONFIRMED
${F}

## Step 1: Fix ordering at the producer — use the same partition key for related events
${F}java
// BAD: random or no partition key — events for same order go to different partitions
kafkaTemplate.send("order-events", toJson(event)); // no key → random partition

// GOOD: use order ID as the partition key
// All events for the same order go to the same partition → always in order
kafkaTemplate.send(
    "order-events",
    orderId.toString(),  // ← partition key: Kafka hashes this to pick a partition
    toJson(event)
);
// ORDER_CREATED, PAYMENT_CONFIRMED, ORDER_SHIPPED for order-99
// all land on partition 3 (for example) → always processed in order on that partition
${F}

**What this means (simple):** Kafka uses the message key to decide which partition to write to (key → hash → partition number). If all events for order-99 have key "99", they all go to the same partition. Same partition → strictly ordered → consumer processes them in sequence.

**What you see in Kafka:**
${F}bash
kafka-console-consumer.sh --bootstrap-server kafka:9092 \
  --topic order-events --from-beginning \
  --property print.key=true \
  --property print.partition=true
${F}
${F}text
Partition:1 | Key:order-99 | ORDER_CREATED (offset 100)
Partition:1 | Key:order-99 | PAYMENT_CONFIRMED (offset 101)
Partition:1 | Key:order-99 | ORDER_SHIPPED (offset 102)
// All on same partition — always delivered in this order to the same consumer thread
${F}

## Step 2: What if you can't guarantee ordering? Use event versioning
${F}java
// Add a sequence number or timestamp to each event
public class OrderEvent {
    private String eventId;
    private String orderId;
    private String type;           // ORDER_CREATED, PAYMENT_CONFIRMED, etc.
    private int sequenceNumber;    // 1, 2, 3... — monotonically increasing per order
    private Instant occurredAt;    // when it happened in the source system
    private String payload;
}

// Producer increments sequence per order
public void publishOrderEvent(String orderId, String type, Object data) {
    int seq = orderEventSequence.getAndIncrement(orderId); // atomic increment per order
    OrderEvent event = new OrderEvent(orderId, type, seq, Instant.now(), toJson(data));
    kafkaTemplate.send("order-events", orderId, toJson(event));
}
${F}

## Step 3: Consumer — detect and handle out-of-order events
${F}java
@KafkaListener(topics = "order-events")
@Transactional
public void handleOrderEvent(ConsumerRecord<String, String> record) {
    OrderEvent event = parse(record.value());

    // Check current sequence number for this order
    int expectedSeq = orderStateRepo.getNextExpectedSequence(event.getOrderId());

    if (event.getSequenceNumber() < expectedSeq) {
        // This event is OLDER than what we've already processed — skip it
        log.warn("Late event for order {} — seq {} already processed (expected {})",
            event.getOrderId(), event.getSequenceNumber(), expectedSeq);
        return;
    }

    if (event.getSequenceNumber() > expectedSeq) {
        // This event arrived EARLY — future events came before past events
        // Strategy 1: Store it and wait for missing events
        pendingEventRepo.save(event);
        log.warn("Out-of-order event for order {} — seq {} arrived but expected {}. Storing.",
            event.getOrderId(), event.getSequenceNumber(), expectedSeq);
        return;
    }

    // Process in correct order
    processEvent(event);
    orderStateRepo.incrementSequence(event.getOrderId());

    // Check if any stored future events can now be processed
    processPendingEvents(event.getOrderId(), expectedSeq + 1);
}

private void processPendingEvents(String orderId, int nextSeq) {
    // Retrieve and process any buffered events now that we're in order
    Optional<OrderEvent> pending = pendingEventRepo.findByOrderIdAndSeq(orderId, nextSeq);
    pending.ifPresent(e -> {
        processEvent(e);
        pendingEventRepo.delete(e);
        processPendingEvents(orderId, nextSeq + 1); // recursive — process chain
    });
}
${F}

**What you see in logs — out-of-order event:**
${F}text
WARN  OrderConsumer - Out-of-order event for order ord-99 — seq 3 (ORDER_SHIPPED) arrived but expected 2 (PAYMENT_CONFIRMED). Storing.
INFO  OrderConsumer - Processing seq 2 (PAYMENT_CONFIRMED) for order ord-99
INFO  OrderConsumer - Found pending seq 3 (ORDER_SHIPPED) for order ord-99 — processing now
// ORDER_SHIPPED processed AFTER PAYMENT_CONFIRMED — correct order restored
${F}

## Step 4: Use state machine to reject invalid transitions
${F}java
// Order status transitions — only valid sequences allowed
public enum OrderStatus {
    CREATED, PAYMENT_PENDING, PAYMENT_CONFIRMED, SHIPPED, DELIVERED, CANCELLED;

    private static final Map<OrderStatus, Set<OrderStatus>> VALID_TRANSITIONS = Map.of(
        CREATED,            Set.of(PAYMENT_PENDING, CANCELLED),
        PAYMENT_PENDING,    Set.of(PAYMENT_CONFIRMED, CANCELLED),
        PAYMENT_CONFIRMED,  Set.of(SHIPPED),
        SHIPPED,            Set.of(DELIVERED)
    );

    public boolean canTransitionTo(OrderStatus next) {
        return VALID_TRANSITIONS.getOrDefault(this, Set.of()).contains(next);
    }
}

// In the consumer:
public void processShippedEvent(Order order) {
    if (!order.getStatus().canTransitionTo(OrderStatus.SHIPPED)) {
        log.error("Invalid transition: order {} is {} — cannot move to SHIPPED",
            order.getId(), order.getStatus());
        // Route to DLQ or wait for missing events
        throw new InvalidStateTransitionException(
            "Order " + order.getId() + " is not in PAYMENT_CONFIRMED state");
    }
    order.setStatus(OrderStatus.SHIPPED);
    orderRepo.save(order);
}
${F}

**What you see when an out-of-order event is rejected:**
${F}text
ERROR OrderConsumer - Invalid transition: order ord-99 is CREATED — cannot move to SHIPPED
// Event goes to DLQ for manual review or retry after the missing events arrive
${F}

## Your interview answer
**Open:** "Kafka guarantees ordering within a partition, not across partitions. The most reliable fix is to use the entity ID (e.g., order ID) as the Kafka partition key — all events for the same order go to the same partition and are always processed in order."
**Then:** "If ordering still can't be guaranteed, I'd add a sequence number to each event. The consumer checks the sequence before processing — if a future event arrives early, it's stored in a buffer. When the missing events arrive, the buffered ones are processed in the correct order."
**End:** "A state machine in the consumer adds a safety net — if an event represents an invalid state transition (like shipping an order that was never paid), it's rejected immediately and routed to a DLQ rather than corrupting data."
`.trim(),

'th-ed-schema': `
## 🔥 The situation
Your ORDER_PLACED event has evolved. Version 1 had a \`customerId\` field. Version 2 renamed it to \`userId\` and added a required \`currency\` field. The consumer running v1 code starts getting events from the v2 producer. It crashes because it doesn't understand the new schema.

## 🧠 Understand this first — schema evolution rules

| Change type | Backward compatible? | Forward compatible? | Safe? |
|---|---|---|---|
| Add optional field | ✅ Yes — old code ignores it | ✅ Yes — new code reads it | ✅ Safe |
| Add required field | ❌ No — old code doesn't send it | ✅ Yes — new code gets it | ❌ Breaking |
| Remove field | ✅ Yes — old code still sends it (ignored) | ❌ No — new code expects it | ⚠️ Careful |
| Rename field | ❌ No — name mismatch | ❌ No | ❌ Always breaking |
| Change field type | ❌ No | ❌ No | ❌ Always breaking |

**Rule: add fields, never rename or remove them. Make new fields optional with defaults.**

## Step 1: Use Avro + Schema Registry (the standard approach)

**Without Schema Registry:** Producer changes schema → consumer breaks → you find out in prod
**With Schema Registry:** Schema change is registered → compatibility checked automatically → incompatible change rejected before a single message is sent

${F}bash
# Add to pom.xml:
# io.confluent:kafka-avro-serializer
# org.apache.avro:avro

# Schema Registry is a separate service (part of Confluent Platform or standalone)
# It stores all Avro schemas and enforces compatibility rules
${F}

**Define the Avro schema for ORDER_PLACED:**
${F}json
{
  "type": "record",
  "name": "OrderPlacedEvent",
  "namespace": "com.example.events",
  "fields": [
    { "name": "eventId",    "type": "string" },
    { "name": "orderId",    "type": "string" },
    { "name": "customerId", "type": "string" },
    { "name": "amount",     "type": "double" },
    { "name": "currency",
      "type": ["null", "string"],  // ← union with null = optional field
      "default": null              // ← old producers don't send this — default to null
    }
  ]
}
${F}

**What this means (simple):**
- \`currency\` is defined as \`["null", "string"]\` — it can be null OR a string
- \`"default": null\` — if the field is missing (old producer), it defaults to null
- Old consumers that don't know about \`currency\` ignore it automatically
- New consumers that want \`currency\` get null if old producer sent the event

${F}java
// application.yml — configure Schema Registry
spring:
  kafka:
    properties:
      schema.registry.url: http://schema-registry:8081
      auto.register.schemas: false   # don't auto-register — require explicit registration
      use.latest.version: true
    producer:
      value-serializer: io.confluent.kafka.serializers.KafkaAvroSerializer
    consumer:
      value-deserializer: io.confluent.kafka.serializers.KafkaAvroDeserializer
      properties:
        specific.avro.reader: true
${F}

## Step 2: Register the schema and set compatibility mode
${F}bash
# Register the schema for a topic
curl -X POST http://schema-registry:8081/subjects/order-events-value/versions \
  -H "Content-Type: application/vnd.schemaregistry.v1+json" \
  -d '{"schema": "{\"type\":\"record\",\"name\":\"OrderPlacedEvent\",\"fields\":[{\"name\":\"eventId\",\"type\":\"string\"},{\"name\":\"orderId\",\"type\":\"string\"},{\"name\":\"customerId\",\"type\":\"string\"},{\"name\":\"amount\",\"type\":\"double\"},{\"name\":\"currency\",\"type\":[\"null\",\"string\"],\"default\":null}]}"}'
${F}

**What you see:**
${F}json
{ "id": 7 }
${F}
**What this means (simple):** The schema is now registered with ID 7. Every message sent with this schema includes the ID in its first 5 bytes. The consumer looks up the schema by ID to deserialize the message — even if it was sent months ago, it can still deserialize correctly.

${F}bash
# Set compatibility mode — BACKWARD means new schema can read old messages
curl -X PUT http://schema-registry:8081/config/order-events-value \
  -H "Content-Type: application/vnd.schemaregistry.v1+json" \
  -d '{"compatibility": "BACKWARD"}'
${F}

**What you see when you try to register an INCOMPATIBLE schema:**
${F}bash
# Try to register a breaking change: rename customerId to userId
curl -X POST http://schema-registry:8081/subjects/order-events-value/versions \
  -d '{"schema": "...schema with userId instead of customerId..."}'
${F}
${F}text
HTTP 409 Conflict
{
  "error_code": 409,
  "message": "Schema being registered is incompatible with an earlier schema;
              error: {oldSchemaVersion: 1, oldSchema: ..., compatibility: BACKWARD,
              difference: ...READER_FIELD_MISSING_DEFAULT_VALUE customerId}"
}
${F}
**What this means (simple):** The Schema Registry BLOCKS the bad schema change before a single message is produced. The producer gets a 409 error. No incompatible message ever reaches Kafka. Your consumer is safe.

## Step 3: Evolve the schema safely — add new field, keep old field
${F}json
// Version 2 schema — safe evolution
{
  "type": "record",
  "name": "OrderPlacedEvent",
  "fields": [
    { "name": "eventId",    "type": "string" },
    { "name": "orderId",    "type": "string" },
    { "name": "customerId", "type": "string" },    // ← KEPT (don't rename!)
    { "name": "userId",     "type": ["null", "string"], "default": null }, // ← NEW (optional)
    { "name": "amount",     "type": "double" },
    { "name": "currency",   "type": ["null", "string"], "default": null }
  ]
}
${F}

**Migration strategy (instead of renaming):**
${F}java
// Producer: populate BOTH fields during transition period
OrderPlacedEvent event = OrderPlacedEvent.newBuilder()
    .setCustomerId(order.getCustomerId())   // old field — keep for old consumers
    .setUserId(order.getCustomerId())       // new field — same value, new name
    .setAmount(order.getTotal())
    .setCurrency("USD")
    .build();

kafkaTemplate.send("order-events", event);
${F}

${F}java
// Old consumer: reads customerId — still works
String customerId = event.getCustomerId(); // "cust-123"

// New consumer: reads userId — works too
String userId = event.getUserId(); // "cust-123" (same value)

// Future: after all consumers are updated, stop populating customerId
// Schedule customerId removal for a future sprint
${F}

## Step 4: Handle schema evolution in the consumer gracefully
${F}java
// Consumer with graceful handling of unexpected new fields
@KafkaListener(topics = "order-events")
public void handleOrderPlaced(GenericRecord record) {
    // Use GenericRecord when you want to handle any schema version
    String orderId = record.get("orderId").toString();
    String customerId = record.get("customerId").toString();

    // Safely read new optional field — may be null in old events
    Object userIdField = record.get("userId");
    String userId = userIdField != null ? userIdField.toString() : customerId; // fallback to customerId

    Object currencyField = record.get("currency");
    String currency = currencyField != null ? currencyField.toString() : "USD"; // default

    log.info("Processing order {} for user {} in {}", orderId, userId, currency);
    orderProcessor.process(orderId, userId, currency);
}
${F}

**What you see in logs processing old events (no currency field):**
${F}text
INFO  OrderConsumer - Processing order ord-99 for user cust-1 in USD (defaulted)
${F}

**What you see in logs processing new events:**
${F}text
INFO  OrderConsumer - Processing order ord-100 for user cust-2 in EUR
${F}

## Your interview answer
**Open:** "Schema evolution problems happen when producer and consumer are deployed independently. The safest approach is Avro + Schema Registry — schemas are versioned, and incompatible changes are rejected before any message is produced."
**Then:** "For backward-compatible evolution: only ADD optional fields with defaults. Never rename a field — instead, add a new field with the new name alongside the old one, populate both, then deprecate the old field after all consumers are updated."
**End:** "The Schema Registry enforces compatibility rules automatically. If a breaking change is attempted, it returns 409 — blocking the deployment before any consumer is affected. This catches schema mismatches at build time, not at 3am in production."
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
