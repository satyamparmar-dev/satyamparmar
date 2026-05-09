import { readFileSync, writeFileSync } from 'fs';
const FILE = 'public/data/scenarioInterviewThemes.json';
const F = '```';

const answers = {

'th-kafka-lag': `
## 🔥 The situation

Your Kafka consumer is falling behind — the producer is writing messages faster than the consumer can process them. This builds up "consumer lag" — a count of messages in the topic partition that haven't been processed yet. If lag keeps growing, your system is behind in real-time, and eventually memory/disk pressure can cascade.

---

## 🧠 Understand this first

| Concept | What it means |
|---|---|
| **Consumer lag** | Difference between latest offset (newest message) and committed offset (last processed) per partition |
| **Consumer group** | A set of consumers that share work across partitions; each partition goes to exactly one consumer |
| **Committed offset** | The position your consumer saved saying "I've processed up to here" |
| **Throughput bottleneck** | Lag grows when message arrival rate > processing rate |
| **Partition parallelism** | Max parallel consumers = number of partitions; more partitions = more parallelism |
| **Backpressure** | The upstream producer won't slow down — you must scale the consumer side |

---

## Step 1 — Measure current lag

${F}bash
# Check lag for a consumer group
kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
  --group my-service-group \
  --describe
${F}

**What you see:**
${F}
GROUP             TOPIC     PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG
my-service-group  orders    0          48230           51820           3590
my-service-group  orders    1          49100           54200           5100
my-service-group  orders    2          47900           48100           200
${F}

**What this means:** Partitions 0 and 1 have significant lag (3590 and 5100 unprocessed messages). Partition 2 is nearly caught up. This tells you partitions 0 and 1 are the bottleneck.

---

## Step 2 — Find the bottleneck

${F}java
// In your Spring Kafka listener — add timing to find slow processing
@KafkaListener(topics = "orders", groupId = "my-service-group")
public void processOrder(ConsumerRecord<String, OrderEvent> record) {
    long start = System.currentTimeMillis();

    orderService.process(record.value()); // ← might be slow (DB call, external API)

    long elapsed = System.currentTimeMillis() - start;
    if (elapsed > 100) {
        log.warn("Slow processing: {}ms for key={}", elapsed, record.key());
    }
}
${F}

**Common causes of slow processing:**
- Synchronous DB write per message (use batch inserts instead)
- Blocking HTTP call to another service
- Heavy business logic that could be async

---

## Step 3 — Scale consumers (increase parallelism)

**Option A — Increase concurrency in the listener:**

${F}java
@Bean
public KafkaListenerContainerFactory<ConcurrentMessageListenerContainer<String, OrderEvent>>
        kafkaListenerContainerFactory() {
    ConcurrentKafkaListenerContainerFactory<String, OrderEvent> factory =
        new ConcurrentKafkaListenerContainerFactory<>();
    factory.setConsumerFactory(consumerFactory());
    factory.setConcurrency(3); // 3 threads → 3 partitions consumed in parallel
    return factory;
}
${F}

**Rule:** concurrency ≤ number of partitions. Extra threads sit idle.

**Option B — Increase partitions (if you need more than current count):**

${F}bash
# Increase topic partitions from 3 to 9
kafka-topics.sh --bootstrap-server localhost:9092 \
  --alter \
  --topic orders \
  --partitions 9
${F}

Then scale your consumer instances (or Pods) to 9.

---

## Step 4 — Tune fetch size to process more per poll

${F}java
@Bean
public ConsumerFactory<String, OrderEvent> consumerFactory() {
    Map<String, Object> props = new HashMap<>();
    props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
    props.put(ConsumerConfig.GROUP_ID_CONFIG, "my-service-group");
    props.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, 500);  // fetch 500 records per poll (default 500)
    props.put(ConsumerConfig.FETCH_MIN_BYTES_CONFIG, 1024 * 1024); // wait until 1MB available
    props.put(ConsumerConfig.FETCH_MAX_WAIT_MS_CONFIG, 500); // or 500ms, whichever first
    return new DefaultKafkaConsumerFactory<>(props, new StringDeserializer(),
        new JsonDeserializer<>(OrderEvent.class));
}
${F}

**Use batch listener to process in bulk:**

${F}java
@KafkaListener(topics = "orders", groupId = "my-service-group")
public void processOrders(List<ConsumerRecord<String, OrderEvent>> records) {
    log.info("Processing batch of {} orders", records.size());

    List<Order> orders = records.stream()
        .map(r -> toOrder(r.value()))
        .collect(toList());

    orderRepository.saveAll(orders); // single batch insert — much faster
}
${F}

---

## 💡 Interview answer

**Open:** "Our Kafka consumer had growing lag on the orders topic — up to 5000 messages behind during peak hours. The producer was publishing faster than we could insert into the database."

**Then:** "I used \`kafka-consumer-groups.sh --describe\` to identify which partitions were lagging. The problem was one DB insert per message. I switched to a batch listener with \`saveAll()\`, increased \`MAX_POLL_RECORDS\` to 500, and set concurrency to match our 6 partitions. Lag dropped to near-zero within minutes."

**End:** "For monitoring I added a Prometheus metric tracking lag via \`kafka_consumer_group_lag\` and set an alert at lag > 1000. The rule of thumb: partition count = max parallelism, so size your partitions at topic creation time — you can add partitions later but can't reduce them."
`.trim(),

'th-kafka-rebalance': `
## 🔥 The situation

Every time a consumer joins or leaves a Kafka consumer group (pod restart, deployment, crash), a **rebalance** happens — partitions are reassigned across all consumers. During rebalance, no messages are processed. Frequent rebalances (due to pod churn or slow processing causing session timeouts) can cause significant throughput gaps and duplicate message processing.

---

## 🧠 Understand this first

| Concept | What it means |
|---|---|
| **Rebalance** | Kafka redistributing partitions when group membership changes |
| **Session timeout** | If a consumer doesn't heartbeat within this time, Kafka thinks it's dead and triggers rebalance |
| **Max poll interval** | If \`poll()\` isn't called fast enough (slow processing), Kafka also triggers rebalance |
| **Cooperative rebalancing** | Newer strategy (Java client 2.4+) — only revokes partitions that need to move, not all of them |
| **Static membership** | Assigns a stable consumer ID so restarts don't trigger unnecessary rebalances |
| **Duplicate processing** | After rebalance, a consumer may reprocess messages from the last committed offset |

---

## Step 1 — Diagnose rebalance frequency

${F}bash
# Watch for rebalance events in logs
kubectl logs my-consumer-pod | grep -i "rebalance\|revoked\|assigned"
${F}

**What you see:**
${F}
INFO  Revoking previously assigned partitions [orders-0, orders-1]
INFO  (Re-)joining group
INFO  Successfully joined group with generation 47
INFO  Setting offset for partition orders-0 to offset 48230
${F}

"generation 47" means this is the 47th rebalance — that's excessive for a stable cluster.

---

## Step 2 — Fix the most common cause: max.poll.interval.ms exceeded

If your processing is slow, Kafka thinks the consumer died:

${F}java
@Bean
public ConsumerFactory<String, OrderEvent> consumerFactory() {
    Map<String, Object> props = new HashMap<>();
    // Default is 300000ms (5 min) — increase if processing is genuinely slow
    props.put(ConsumerConfig.MAX_POLL_INTERVAL_MS_CONFIG, 600000); // 10 minutes
    // Fetch fewer records per poll so each batch completes faster
    props.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, 50);
    // Heartbeat more frequently to stay alive
    props.put(ConsumerConfig.HEARTBEAT_INTERVAL_MS_CONFIG, 3000);
    props.put(ConsumerConfig.SESSION_TIMEOUT_MS_CONFIG, 30000); // session > 3×heartbeat
    return new DefaultKafkaConsumerFactory<>(props, ...);
}
${F}

**Rule:** \`heartbeat.interval.ms\` < \`session.timeout.ms\` / 3. This ensures at least 3 heartbeats before Kafka considers the consumer dead.

---

## Step 3 — Switch to cooperative rebalancing (reduces impact)

${F}java
props.put(ConsumerConfig.PARTITION_ASSIGNMENT_STRATEGY_CONFIG,
    CooperativeStickyAssignor.class.getName());
${F}

**What happens with default (eager) rebalancing:**
${F}
1. All consumers revoke ALL their partitions
2. All consumers rejoin
3. Partitions reassigned from scratch
→ Zero throughput during entire rebalance
${F}

**What happens with cooperative rebalancing:**
${F}
1. Only partitions that need to move are revoked
2. Consumers that keep their partitions continue processing
→ Minimal throughput loss
${F}

---

## Step 4 — Use static membership to survive restarts

${F}java
props.put(ConsumerConfig.GROUP_INSTANCE_ID_CONFIG, "consumer-" + podName);
// podName = env var from K8s: spec.containers.env.valueFrom.fieldRef.fieldPath=metadata.name
${F}

${F}yaml
# In K8s deployment — give each pod a unique stable ID
env:
  - name: POD_NAME
    valueFrom:
      fieldRef:
        fieldPath: metadata.name
${F}

With static membership, a consumer that restarts within \`session.timeout.ms\` rejoins as the same member — no rebalance triggered.

---

## Step 5 — Handle partition revocation cleanly

${F}java
@KafkaListener(topics = "orders", groupId = "my-service-group")
public class OrderConsumer implements ConsumerSeekAware {

    @Override
    public void onPartitionsRevoked(Collection<TopicPartition> partitions) {
        log.info("Partitions revoked: {} — committing offsets", partitions);
        // Commit offsets synchronously before partition is taken away
        // Spring Kafka handles this if AckMode = MANUAL
    }

    @Override
    public void onPartitionsAssigned(Collection<TopicPartition> partitions) {
        log.info("Partitions assigned: {}", partitions);
        // Re-initialize any partition-local state here
    }
}
${F}

---

## 💡 Interview answer

**Open:** "Our Kafka consumer group was rebalancing dozens of times per hour — every rolling deployment caused all consumers to revoke partitions, creating throughput gaps during peak traffic."

**Then:** "Two changes fixed it: First, I switched from the default EagerAssignor to \`CooperativeStickyAssignor\` — only partitions that need to move get revoked, not everything. Second, I added \`GROUP_INSTANCE_ID_CONFIG\` with each pod's name from the K8s downward API, so a restarting pod rejoins as the same member within the session timeout without triggering a full rebalance."

**End:** "I also tuned \`max.poll.records\` down to 50 to ensure each poll completes within \`max.poll.interval.ms\`, and added a Grafana dashboard tracking rebalance events per hour. After the changes, rebalances dropped from ~60/hour to ~2/hour (one per scheduled deployment)."
`.trim(),

'th-kafka-idempotent': `
## 🔥 The situation

Your Kafka producer retries on network errors, but each retry can produce a **duplicate message**. A payment confirmation gets processed twice. An order gets created twice. Exactly-once processing is one of the hardest problems in distributed systems — Kafka's idempotent producer and transactional API solve it at the infrastructure level.

---

## 🧠 Understand this first

| Concept | What it means |
|---|---|
| **At-most-once** | Message might be lost; never duplicated — achieved by not retrying |
| **At-least-once** | Message always delivered; might be duplicated — achieved by retrying |
| **Exactly-once** | Delivered exactly once — Kafka's idempotent producer + transactions |
| **Producer ID (PID)** | Unique ID Kafka assigns to a producer; used to detect duplicates |
| **Sequence number** | Monotonically increasing per-partition counter Kafka uses to deduplicate |
| **Transactional producer** | Can write to multiple partitions atomically — either all succeed or none |

---

## Step 1 — Enable idempotent producer

${F}java
@Bean
public ProducerFactory<String, OrderEvent> producerFactory() {
    Map<String, Object> props = new HashMap<>();
    props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
    props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
    props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);

    // Enable idempotent producer — deduplicates retries within a session
    props.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);
    // These are automatically set when idempotence is enabled:
    // acks=all, retries=Integer.MAX_VALUE, max.in.flight.requests.per.connection=5

    return new DefaultKafkaProducerFactory<>(props);
}
${F}

**What idempotence does:**
${F}
// First attempt — sequence 1
Producer → Broker: {PID=42, seq=1, data="order-123"}
Broker: stored ✅

// Network glitch — producer retries
Producer → Broker: {PID=42, seq=1, data="order-123"}
Broker: "I already have seq=1 for PID=42, dropping duplicate" ✅

// Result: exactly one write despite retry
${F}

**Limitation:** Idempotence only deduplicates within a **single producer session**. If the producer restarts, it gets a new PID and duplicates become possible again.

---

## Step 2 — Transactional producer for cross-partition atomicity

${F}java
@Bean
public ProducerFactory<String, Object> transactionalProducerFactory() {
    Map<String, Object> props = new HashMap<>();
    props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
    props.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);
    props.put(ProducerConfig.TRANSACTIONAL_ID_CONFIG, "order-service-tx-1");
    // Transactional ID survives producer restarts — same ID = deduplicate across restarts
    return new DefaultKafkaProducerFactory<>(props);
}

@Bean
public KafkaTemplate<String, Object> kafkaTemplate() {
    return new KafkaTemplate<>(transactionalProducerFactory());
}
${F}

${F}java
@Service
public class OrderService {

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    public void processOrder(Order order) {
        kafkaTemplate.executeInTransaction(template -> {
            // Both of these succeed or both fail — atomic
            template.send("orders", order.getId(), order);
            template.send("audit-log", order.getId(), new AuditEvent(order));
            return true;
        });
    }
}
${F}

---

## Step 3 — Consumer-side: read_committed to skip uncommitted messages

${F}java
@Bean
public ConsumerFactory<String, Object> consumerFactory() {
    Map<String, Object> props = new HashMap<>();
    props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
    // Only read messages from committed transactions
    props.put(ConsumerConfig.ISOLATION_LEVEL_CONFIG, "read_committed");
    return new DefaultKafkaConsumerFactory<>(props, new StringDeserializer(),
        new JsonDeserializer<>(Object.class));
}
${F}

**What you see with \`read_uncommitted\` (default):**
${F}
Consumer reads: order-1 (committed) ✅
Consumer reads: order-2 (transaction aborted!) ← shouldn't process this
${F}

**What you see with \`read_committed\`:**
${F}
Consumer reads: order-1 (committed) ✅
Consumer skips: order-2 (aborted transaction) ✅
${F}

---

## Step 4 — Application-level idempotency as a safety net

Kafka's exactly-once doesn't protect against application bugs. Add an idempotency key in your database:

${F}java
@Entity
public class ProcessedMessage {
    @Id
    private String messageId; // Kafka offset + partition, or a business ID
    private Instant processedAt;
}

@KafkaListener(topics = "orders")
@Transactional
public void processOrder(ConsumerRecord<String, OrderEvent> record) {
    String messageId = record.topic() + "-" + record.partition() + "-" + record.offset();

    if (processedMessageRepo.existsById(messageId)) {
        log.info("Skipping duplicate: {}", messageId);
        return;
    }

    orderService.createOrder(record.value());
    processedMessageRepo.save(new ProcessedMessage(messageId, Instant.now()));
    // Both writes committed in same DB transaction = atomic idempotency
}
${F}

---

## 💡 Interview answer

**Open:** "Our payment service was processing Kafka messages multiple times during broker failovers because the producer retried on timeout, creating duplicate payment confirmations."

**Then:** "I enabled \`ENABLE_IDEMPOTENCE_CONFIG=true\` on the producer — this assigns a sequence number per partition and the broker deduplicates retries automatically. For cross-restart protection, I also set a \`TRANSACTIONAL_ID_CONFIG\` which is stable across restarts. On the consumer side I set \`isolation.level=read_committed\` to skip aborted transactions."

**End:** "As a belt-and-suspenders measure, I also added an application-level idempotency table in the DB keyed by partition-offset. This catches rare cases where the consumer restarts mid-processing. The real lesson: always design consumers to be idempotent — even with Kafka's guarantees, infrastructure failures can create unexpected duplicates."
`.trim(),

'th-kafka-outbox-dlq': `
## 🔥 The situation

You save data to a database and publish a Kafka event — but these two operations aren't atomic. The DB save succeeds but the Kafka publish fails (broker down), or worse, the Kafka publish succeeds but the DB transaction rolls back. You now have inconsistent state. Then, when you do publish successfully, the consumer throws an exception — where does the message go?

Two patterns solve this: **Transactional Outbox** for reliable publishing, and **Dead Letter Queue (DLQ)** for handling consumer failures.

---

## 🧠 Understand this first

| Concept | What it means |
|---|---|
| **Dual-write problem** | Writing to DB + Kafka in the same operation — no built-in atomicity across the two |
| **Outbox pattern** | Write event to the DB in the same transaction as your data — a relay process publishes it to Kafka |
| **CDC (Change Data Capture)** | Tool (Debezium) that reads DB transaction log and publishes changes to Kafka |
| **DLQ (Dead Letter Queue)** | A separate Kafka topic where failed messages land after max retry attempts |
| **Retry topic** | Spring Kafka feature — failed messages go to a retry topic with delay, then DLQ |

---

## Step 1 — Implement the Outbox pattern

**The problematic dual-write (DON'T DO THIS):**

${F}java
// Bug: if Kafka is down after DB save, event is lost
@Transactional
public void createOrder(Order order) {
    orderRepository.save(order);           // ← succeeds
    kafkaTemplate.send("orders", order);   // ← might fail — now inconsistent!
}
${F}

**The Outbox pattern (CORRECT):**

${F}java
@Entity
public class OutboxEvent {
    @Id @GeneratedValue
    private Long id;
    private String topic;
    private String aggregateId;
    private String payload;     // JSON-serialized event
    private boolean published;
    private Instant createdAt;
}
${F}

${F}java
@Service
@Transactional
public class OrderService {

    public void createOrder(Order order) {
        // Both writes in the SAME DB transaction — atomic
        orderRepository.save(order);

        OutboxEvent event = new OutboxEvent();
        event.setTopic("orders");
        event.setAggregateId(order.getId().toString());
        event.setPayload(objectMapper.writeValueAsString(order));
        event.setPublished(false);
        outboxRepository.save(event);

        // If DB tx rolls back, BOTH the order AND the event row are rolled back
        // Kafka is not involved here at all
    }
}
${F}

**Step 1b — Outbox relay (publishes to Kafka):**

${F}java
@Component
public class OutboxRelay {

    @Scheduled(fixedDelay = 1000) // every 1 second
    @Transactional
    public void publishPendingEvents() {
        List<OutboxEvent> pending = outboxRepository
            .findByPublishedFalseOrderByCreatedAtAsc();

        for (OutboxEvent event : pending) {
            kafkaTemplate.send(event.getTopic(), event.getAggregateId(), event.getPayload())
                .get(5, TimeUnit.SECONDS); // wait for Kafka ack
            event.setPublished(true);
            outboxRepository.save(event);
        }
    }
}
${F}

**Production-grade alternative — use Debezium (CDC):**

${F}bash
# Debezium watches your DB transaction log (PostgreSQL WAL / MySQL binlog)
# and publishes outbox rows to Kafka automatically
# No polling needed — event-driven and low latency
# Configure via Debezium connector in Kafka Connect
${F}

---

## Step 2 — Dead Letter Queue for consumer failures

**When the consumer throws an exception — configure retry + DLQ:**

${F}java
@Bean
public ConcurrentKafkaListenerContainerFactory<String, Object> kafkaListenerContainerFactory(
        ConsumerFactory<String, Object> consumerFactory,
        KafkaTemplate<String, Object> template) {

    ConcurrentKafkaListenerContainerFactory<String, Object> factory =
        new ConcurrentKafkaListenerContainerFactory<>();
    factory.setConsumerFactory(consumerFactory);

    // Default error handler — retry 3 times then send to DLQ
    factory.setCommonErrorHandler(new DefaultErrorHandler(
        new DeadLetterPublishingRecoverer(template,
            (record, ex) -> new TopicPartition(record.topic() + ".DLQ", -1)),
        new FixedBackOff(2000L, 3L) // retry every 2s, max 3 attempts
    ));

    return factory;
}
${F}

**Or use \`@RetryableTopic\` for declarative retry:**

${F}java
@RetryableTopic(
    attempts = "4",                    // 1 original + 3 retries
    backoff = @Backoff(delay = 2000, multiplier = 2), // 2s, 4s, 8s
    dltTopicSuffix = ".DLQ",
    dltStrategy = DltStrategy.FAIL_ON_ERROR
)
@KafkaListener(topics = "orders", groupId = "my-service-group")
public void processOrder(OrderEvent event) {
    // If this throws, Spring retries automatically
    // After max attempts, message goes to orders.DLQ
    orderService.process(event);
}
${F}

**What you see in Kafka topics after a failure:**

${F}bash
kafka-topics.sh --list --bootstrap-server localhost:9092 | grep orders
# orders
# orders-retry-0      ← first retry (2s delay)
# orders-retry-1      ← second retry (4s delay)
# orders-retry-2      ← third retry (8s delay)
# orders.DLQ          ← final failure destination
${F}

---

## Step 3 — Monitor and replay the DLQ

${F}bash
# See what's in the DLQ
kafka-console-consumer.sh \
  --bootstrap-server localhost:9092 \
  --topic orders.DLQ \
  --from-beginning \
  --max-messages 10
${F}

**Replay DLQ after fixing the bug:**

${F}bash
# Re-publish DLQ messages back to the original topic
kafka-console-consumer.sh --topic orders.DLQ ... \
  | kafka-console-producer.sh --topic orders ...
${F}

Or build a Spring Boot endpoint:

${F}java
@PostMapping("/admin/dlq/replay")
public void replayDlq() {
    // Read from DLQ, publish back to original topic
    ConsumerRecords<String, Object> records = dlqConsumer.poll(Duration.ofSeconds(5));
    records.forEach(r -> kafkaTemplate.send("orders", r.key(), r.value()));
}
${F}

---

## 💡 Interview answer

**Open:** "We had a race condition: the order service saved to DB and immediately published to Kafka. If Kafka was temporarily unavailable, the event was lost but the DB had the record — silent inconsistency."

**Then:** "I implemented the Transactional Outbox pattern — the event is written to an \`outbox_events\` table in the same DB transaction as the order. A scheduled relay then publishes from the outbox to Kafka idempotently. This means the DB transaction is the source of truth — Kafka is eventually consistent with it."

**End:** "For the consumer side, I added \`@RetryableTopic\` with exponential backoff to 3 retry topics, and a DLQ for messages that keep failing. The DLQ has a Slack alert and a replay endpoint. The key insight: the outbox pattern trades Kafka publish latency (now async) for consistency — acceptable for all our use cases."
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
