/**
 * V2 rewrite — backpressure-control (2 scenarios)
 * Run: node scripts/rewrite-v2-backpressure.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
const FILE = 'public/data/scenarioInterviewThemes.json';
const F = '```';

const answers = {

'th-bp-db-spike': `
## 🔥 The situation
Traffic suddenly spikes. Every incoming request immediately tries to hit the database. The DB gets hundreds of simultaneous connections. It slows down, then starts rejecting connections, then crashes. Your entire app goes down because you had no backpressure mechanism to slow down the flood.

## 🧠 What is backpressure?

Backpressure is the system's ability to say "slow down — I can't process this fast." Without it, a fast producer (incoming HTTP requests) overwhelms a slow consumer (the database). Think of it like a garden hose — if you force too much water through a narrow pipe, the pipe bursts. Backpressure is the valve that controls the flow.

| Without backpressure | With backpressure |
|---|---|
| All 1000 requests hit DB at once | Only 20 DB connections active at a time |
| DB gets overwhelmed, crashes | DB handles a steady stream, stays healthy |
| All requests fail | Some requests wait, then succeed. Some fail fast with a clear error |
| Full outage | Degraded performance, no crash |

## Step 1: Understand the DB connection pool — your first line of backpressure

Spring Boot uses **HikariCP** as the connection pool by default. A connection pool works like this:

- You have a **fixed number of DB connections** (e.g., 10)
- Incoming requests grab a connection from the pool, use it, then return it
- If all 10 connections are busy, the 11th request **waits** in a queue for up to \`connectionTimeout\` ms
- If still no connection available after the timeout → exception is thrown

${F}yaml
# application.yml — tune HikariCP for your load
spring:
  datasource:
    hikari:
      maximum-pool-size: 20        # max 20 simultaneous DB connections
      minimum-idle: 5              # always keep 5 connections warm
      connection-timeout: 3000     # wait up to 3s for a free connection, then throw
      idle-timeout: 600000         # release idle connections after 10 min
      max-lifetime: 1800000        # force-close connections after 30 min (avoids stale)
      pool-name: MainHikariPool
${F}

**What you see when the pool is exhausted (no backpressure tuning):**
${F}text
ERROR c.z.h.p.HikariPool - HikariPool-1 - Connection is not available, request timed out after 30000ms
java.sql.SQLTransientConnectionException: HikariPool-1 - Connection is not available
${F}
**What this means (simple):** The default connection timeout is 30 seconds. During a spike, requests queue up for 30 full seconds before failing. Your thread pool also fills up during this wait, causing cascading failures. Fix: lower timeout to 3 seconds so failures are fast and threads are freed quickly.

**What you see after proper tuning:**
${F}text
WARN  c.z.h.p.HikariPool - MainHikariPool - Connection is not available, request timed out after 3000ms
→ HTTP 503 returned quickly to client
// Threads freed fast. Only DB-bound requests fail. Others continue normally.
${F}

## Step 2: Monitor the connection pool in real time
${F}bash
# Expose HikariCP metrics via Spring Actuator + Prometheus
# application.yml:
management:
  endpoints:
    web:
      exposure:
        include: health, metrics, prometheus
  metrics:
    tags:
      application: \${spring.application.name}
${F}

${F}bash
# Query pool metrics
curl http://localhost:8080/actuator/metrics/hikaricp.connections.active
curl http://localhost:8080/actuator/metrics/hikaricp.connections.pending
curl http://localhost:8080/actuator/metrics/hikaricp.connections.timeout
${F}

**What you see:**
${F}json
{
  "name": "hikaricp.connections.active",
  "measurements": [{ "statistic": "VALUE", "value": 19.0 }]
}
{
  "name": "hikaricp.connections.pending",
  "measurements": [{ "statistic": "VALUE", "value": 47.0 }]
}
${F}
**What this means (simple):**
- active: 19 → 19 out of 20 connections are in use right now (almost full!)
- pending: 47 → 47 requests are waiting for a connection — this is your queue depth
- If pending keeps growing and never shrinks, your pool size is too small for the load

**Grafana alert rule:**
${F}yaml
# Alert when pending requests stay high for more than 30 seconds
- alert: DBConnectionPoolExhausted
  expr: hikaricp_connections_pending{pool="MainHikariPool"} > 10
  for: 30s
  annotations:
    summary: "DB connection pool has {{ $value }} pending requests for 30s"
${F}

## Step 3: Add a request queue with bounded capacity (explicit backpressure)

Instead of letting all requests pile up waiting for a DB connection, use a bounded queue at the API level. If the queue is full, reject immediately with 503.

${F}java
@Configuration
public class BackpressureConfig {

    // A semaphore that allows at most 50 concurrent DB-touching requests
    // Any more than 50 get rejected immediately with 503
    @Bean
    public Semaphore dbRequestSemaphore() {
        return new Semaphore(50); // 50 permits = 50 concurrent requests allowed
    }
}

@RestController
public class OrderController {

    @Autowired private Semaphore dbRequestSemaphore;
    @Autowired private OrderService orderService;

    @GetMapping("/orders")
    public ResponseEntity<?> getOrders() {
        // Try to acquire a permit — don't wait if none available
        boolean acquired = dbRequestSemaphore.tryAcquire();

        if (!acquired) {
            // Backpressure: reject immediately instead of queuing for 30 seconds
            return ResponseEntity.status(503)
                .header("Retry-After", "5")
                .body(Map.of(
                    "error", "Server is at capacity",
                    "message", "Too many concurrent requests. Please retry in 5 seconds."
                ));
        }

        try {
            return ResponseEntity.ok(orderService.getOrders());
        } finally {
            dbRequestSemaphore.release(); // always release, even on exception
        }
    }
}
${F}

**What you see under spike (with semaphore):**
${F}text
// First 50 requests: processed normally
INFO  OrderController - Serving order request (49 permits remaining)

// Request 51+: rejected immediately
WARN  OrderController - Backpressure: rejecting request, 0 permits available
→ HTTP 503 { "error": "Server is at capacity", "message": "...retry in 5 seconds" }

// As requests complete, new ones are let in
INFO  OrderController - Permit released (1 now available)
INFO  OrderController - New request accepted (0 permits remaining)
${F}
**What this means (simple):** Without the semaphore, request 51 waits 30 seconds for a DB connection, holding a thread the whole time. With the semaphore, it fails in microseconds, frees the thread immediately, and the client retries in 5 seconds. You trade a long wait for a fast fail — the overall system stays healthy.

## Step 4: Use reactive programming for natural backpressure (advanced)
${F}java
// Spring WebFlux + R2DBC gives you reactive DB access
// The reactive pipeline has built-in backpressure — consumers pull only what they can handle

@RestController
public class ReactiveOrderController {

    @Autowired private ReactiveOrderRepository repo;

    @GetMapping(value = "/orders/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<Order> streamOrders() {
        return repo.findAll()
            .limitRate(100)           // request 100 items at a time from DB
            .delayElements(Duration.ofMillis(10)); // control output rate
        // The DB only fetches items as fast as the client can consume them
        // If client is slow, the DB read slows down too — natural backpressure
    }
}
${F}

**What this means (simple):** In reactive programming, the consumer (HTTP client) signals to the producer (DB query) how fast it can accept data. The DB doesn't dump all 100,000 orders into memory at once — it fetches a batch of 100, sends them, waits for the client to consume, then fetches the next 100. Memory stays low, DB stays calm.

## Your interview answer
**Open:** "Backpressure is how you protect downstream systems from being overwhelmed. The first tool is the DB connection pool — HikariCP limits concurrency naturally, but you need to tune the timeout to fail fast instead of queuing for 30 seconds."
**Then:** "On top of that, I'd add a Semaphore at the API layer: cap concurrent DB-touching requests at, say, 50. Anything above that gets an immediate 503 with a Retry-After header. This keeps threads free and prevents the cascade."
**End:** "The key insight is: a 503 returned in 1ms is better than a 30-second timeout. Fail fast, free the thread, and let the client retry. Never let a slow layer hold threads hostage."
`.trim(),

'th-bp-queue-grow': `
## 🔥 The situation
Your Kafka (or any message queue) consumer is processing 100 messages per second. But producers are sending 500 messages per second. The queue depth grows by 400 messages every second. Eventually it's millions of messages behind. Memory runs out, processing falls further and further behind, and old messages become irrelevant by the time they're processed.

## 🧠 Understand this first

| Term | Simple meaning |
|---|---|
| Consumer lag | How far behind the consumer is — number of unprocessed messages |
| Throughput | How many messages processed per second |
| Backpressure | Consumer signals to producer: "slow down" or producer is blocked until consumer catches up |
| Load shedding | Deliberately dropping low-priority messages when overwhelmed |
| DLQ (Dead Letter Queue) | A separate queue for messages that failed too many times |

**The problem visualized:**
${F}text
Producer:  ████████████████████████████████  (500/sec)
Consumer:  ████████████                      (100/sec)
Queue lag: +400/sec → growing forever

After 1 hour: 400 × 3600 = 1,440,000 unprocessed messages
${F}

## Step 1: Measure the lag — find out how bad it is
${F}bash
# Check consumer group lag in Kafka
kafka-consumer-groups.sh \
  --bootstrap-server kafka:9092 \
  --describe \
  --group my-consumer-group
${F}

**What you see:**
${F}text
GROUP              TOPIC           PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG
my-consumer-group  order-events    0          1234            6789            5555
my-consumer-group  order-events    1          2001            7500            5499
my-consumer-group  order-events    2          890             5900            5010
                                                              TOTAL LAG:      16064
${F}
**What this means (simple):**
- CURRENT-OFFSET: consumer last read message number 1234 on partition 0
- LOG-END-OFFSET: producer has written up to message 6789 on partition 0
- LAG: 5555 — consumer is 5555 messages behind on just this one partition
- Total lag across all partitions: 16,064 messages — and growing

**Set up a Prometheus alert for lag:**
${F}bash
# Kafka lag exposed via JMX or kafka-lag-exporter
# Grafana alert:
kafka_consumer_group_lag{group="my-consumer-group"} > 10000
# → Alert: "Consumer group is 10k+ messages behind — investigate throughput"
${F}

## Step 2: Speed up the consumer — increase parallelism
${F}yaml
# application.yml — increase consumer threads
spring:
  kafka:
    listener:
      concurrency: 6    # 6 consumer threads per application instance
                        # should match partition count (or be a divisor of it)
    consumer:
      max-poll-records: 500     # pull 500 messages per poll instead of 1
      fetch-min-bytes: 1048576  # wait to fetch until 1MB is ready (reduces round trips)
      fetch-max-wait: 500       # but don't wait more than 500ms
${F}

**Before (1 thread, 1 record per poll):**
${F}text
Thread 1: poll → process 1 msg (50ms) → poll → process 1 msg → ...
Throughput: ~20 messages/sec
${F}

**After (6 threads, 500 records per poll):**
${F}text
Thread 1: poll → process 500 msgs in batch → poll → ...
Thread 2: poll → process 500 msgs in batch → poll → ...
... (6 threads)
Throughput: ~300 messages/sec (6x improvement)
${F}

**What you see in logs after increasing concurrency:**
${F}text
INFO  KafkaListenerEndpointRegistry - Started 6 consumer threads
INFO  OrderEventConsumer - [Thread-1] Processing batch of 487 messages
INFO  OrderEventConsumer - [Thread-2] Processing batch of 500 messages
INFO  OrderEventConsumer - [Thread-3] Processing batch of 312 messages
// Lag starts decreasing instead of growing
${F}

## Step 3: Scale out — add more consumer instances
${F}bash
# Kubernetes: scale the consumer deployment
kubectl scale deployment order-consumer --replicas=5 -n production
${F}

**What you see:**
${F}text
deployment.apps/order-consumer scaled
# Kubernetes creates 4 more pods
# Kafka automatically rebalances partitions across all 5 pods

Partition assignment after rebalance:
  Pod 1: partitions [0, 1, 2]
  Pod 2: partitions [3, 4, 5]
  Pod 3: partitions [6, 7, 8]
  Pod 4: partitions [9, 10, 11]
  Pod 5: partitions [12, 13, 14]  ← if you have 15 partitions
${F}
**What this means (simple):** Each Kafka partition can only be read by ONE consumer in a group at a time. So to have 5 pods all reading in parallel, you need at least 5 partitions. If your topic has fewer partitions than consumers, some consumers sit idle. Always create topics with enough partitions (e.g., 12 or 24) to allow future scaling.

## Step 4: Add backpressure on the producer side
${F}java
// Producer applies backpressure when the queue is too large
// Check queue depth before producing — block or reject if too full

@Service
public class OrderProducer {

    private static final long MAX_LAG_THRESHOLD = 50_000; // messages

    public void publishOrder(Order order) {
        long currentLag = kafkaLagMonitor.getCurrentLag("order-events", "my-consumer-group");

        if (currentLag > MAX_LAG_THRESHOLD) {
            // Backpressure: don't add more work if we're already overwhelmed
            log.warn("Queue lag {} exceeds threshold {} — applying backpressure", currentLag, MAX_LAG_THRESHOLD);
            throw new QueueOverloadException("System is overloaded. Please retry in a moment.");
            // The HTTP client gets a 503 — they slow down → producers slow down → queue stabilizes
        }

        kafkaTemplate.send("order-events", order.getId().toString(), toJson(order));
    }
}
${F}

## Step 5: Load shedding — drop low-priority messages intentionally
${F}java
// If you can't keep up, drop less important messages
// Example: analytics events are low priority — drop them during overload

@KafkaListener(topics = "analytics-events")
public void handleAnalyticsEvent(ConsumerRecord<String, String> record) {
    long lag = kafkaLagMonitor.getCurrentLag("analytics-events", "analytics-group");

    if (lag > 100_000) {
        // We're too far behind — this analytics event is now stale
        // Better to skip it than process 100k stale events that are no longer useful
        log.warn("Dropping stale analytics event (lag={}): offset={}", lag, record.offset());
        meterRegistry.counter("events.shed", "topic", "analytics-events").increment();
        return; // skip processing — commit offset and move on
    }

    analyticsService.process(parse(record.value()));
}
${F}

**What you see in logs + metrics during load shedding:**
${F}text
WARN  AnalyticsConsumer - Dropping stale analytics event (lag=150432): offset=892011
WARN  AnalyticsConsumer - Dropping stale analytics event (lag=150431): offset=892012
// Consumer catches up fast by skipping non-critical events
// Metrics show events.shed counter increasing — visible on dashboard
${F}
**What this means (simple):** Stale analytics data from 2 hours ago is useless anyway. Skipping it lets the consumer catch up to the real-time events. Load shedding is like fast-forwarding through backlog to get current — you lose some history but the system stabilizes. This is acceptable for non-critical data but NEVER for payments, orders, or state-changing events.

## Step 6: Use KEDA to auto-scale consumers based on lag
${F}yaml
# KEDA ScaledObject — auto-scales consumer pods based on Kafka lag
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: order-consumer-scaler
spec:
  scaleTargetRef:
    name: order-consumer   # the Deployment to scale
  minReplicaCount: 2       # always at least 2 pods
  maxReplicaCount: 20      # never more than 20 pods
  triggers:
  - type: kafka
    metadata:
      bootstrapServers: kafka:9092
      consumerGroup: my-consumer-group
      topic: order-events
      lagThreshold: "1000"   # add 1 pod for every 1000 messages of lag
${F}

**What you see as lag grows:**
${F}text
KEDA: lag=5000 → scale order-consumer to 5 replicas
KEDA: lag=10000 → scale order-consumer to 10 replicas
KEDA: lag=500  → scale order-consumer to 2 replicas (scale down after lag clears)
${F}

## Your interview answer
**Open:** "I'd first measure the consumer lag with kafka-consumer-groups.sh to understand how bad it is and whether it's growing or stable."
**Then:** "To fix it: increase concurrency (more threads per pod), increase max-poll-records to process in batches, and add more consumer pods — Kafka rebalances partitions automatically. For long-term auto-scaling, KEDA can scale pods based on lag depth."
**End:** "If the gap is too large to close, load shedding helps for non-critical events — skip stale messages and get current. For critical messages, you always process them. The producer can also apply backpressure by checking lag before sending — if the queue is already overwhelmed, reject new work at the API level."
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
