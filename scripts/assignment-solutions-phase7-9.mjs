/**
 * Third-pass: interview-real solutions for Phase 7 (Kafka & Messaging) and Phase 9 (Architecture).
 * Imported by generate-assignments-phases3-10.mjs — keys match assignment day strings.
 *
 * Each day: q1–q6 are markdown strings; q4 may include { solution, codeTemplate, expectedOutput }.
 */

export const PHASE7_SOLUTIONS_BY_DAY = {
  '59': {
    q1: `## In one minute
**Kafka** is a distributed **append-only log** implemented as topics split into **partitions**. Producers append **records**; consumers read with an **offset** cursor. Brokers replicate partitions for fault tolerance.

## Concrete production example
An **order-events** topic with key = \`orderId\` gives **per-order ordering** (single partition for that key) while scaling horizontally across many keys.

## What people get wrong
They say "Kafka is a queue." It is closer to a **durable log**: consumers **pull** and **advance offsets**; replay and retention are first-class, unlike a typical AMQP queue that deletes on ack.

## Failure mode to name
**Hot partition**: one key dominates traffic → one broker/partition becomes the bottleneck while others are idle.`,
    q2: `## Option A: Few topics, many partitions
Good for **uniform** throughput; ops is simpler.

## Option B: Many topics (domain boundaries)
Good for **ACLs**, **retention**, and **team ownership** per bounded context; more metadata to manage.

## Incident lens (reliability / replay / recovery)
- **Replay**: log retention + reset offsets vs **dead-letter** topic — trade data volume vs operational clarity.
- **Recovery**: more partitions can absorb parallelism but **cannot** fix a **hot key** without changing the partitioning strategy.

## Interview line
"Partitions are the unit of parallelism **and** ordering — design keys with that law in mind."`,
    q3: `## First 5 minutes (do not skip)
1. **Consumer lag** per partition vs end-to-end latency — is the problem **consume** or **produce**?
2. **Group state**: is the group **rebalancing** constantly? (symptom: stop-the-world consumption)
3. **Broker health**: under-replicated partitions? leader elections?

## What NOT to do immediately
- Blindly **scale consumers** past **partition count** (useless parallelism).
- **Flush** configs (acks, linger) without understanding producer batching side effects.

## Prove recovery
- Show **lag trending down** after fix, **rebalance rate** flat, and **error budget** style check: no sustained **consumer-time** behind **max.poll.interval**.

## Concrete failure mode
**Sticky assignor + crash**: partitions migrate; if processing is slow, members get kicked → rebalance storm → lag explodes.`,
    q4: {
      solution: `## What interviewers want
You can explain **assignment** (which consumer owns which partition) and what happens on **crash**: partitions **reassign**, **in-flight** messages may be **redelivered** (at-least-once).

## Snippet: consumer subscription + poll loop (conceptual Java)
\`\`\`java
// Pseudo-Kafka consumer — interview: "poll is the heartbeat + fetch driver"
Properties p = new Properties();
p.put("bootstrap.servers", "kafka:9092");
p.put("group.id", "orders-consumers");
p.put("key.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");
p.put("value.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");
// max.poll.interval.ms must exceed your per-batch processing time
KafkaConsumer<String, String> c = new KafkaConsumer<>(p);
c.subscribe(List.of("orders"));
while (true) {
  ConsumerRecords<String, String> records = c.poll(Duration.ofMillis(500));
  for (ConsumerRecord<String, String> r : records) {
    process(r); // if this is too slow → rebalance risk
  }
}
\`\`\`

## Failure mode cheat sheet
- **Rebalance loop**: processing > **max.poll.interval** → member removed → replay/duplicates.
- **Zombie consumer**: old member still processing after reassignment → duplicate side effects without idempotency.`,
      codeTemplate: `// Day 59 — Kafka consumer sketch (fill TODOs for interview discussion)
import java.util.*;

public class Day59Assignment {
  public static void main(String[] args) {
    // TODO: name three consumer configs you tune when you see rebalance storms
    // TODO: what metric proves a partition is "hot"?
    System.out.println("configs: max.poll.interval.ms, session.timeout.ms, fetch.max.wait.ms");
    System.out.println("metric: consumer-lag per partition + rebalance rate");
  }
}`,
      expectedOutput: `configs: max.poll.interval.ms, session.timeout.ms, fetch.max.wait.ms
metric: consumer-lag per partition + rebalance rate`,
    },
    q5: `## The tension
You reduced fetch wait or batch size → lower latency, but consumers **commit** more often or **process smaller batches** → higher duplicate probability on crash + more broker round trips.

## Redesign (interview answer)
1. **Idempotent sink**: primary key / dedupe table / outbox with **event id**.
2. **Processing + commit contract**: commit **after** idempotent apply, or use **transactions** where justified.
3. **Isolate slow poison messages** to **DLQ** so they do not stall the partition.

## Concrete failure mode
**At-least-once + non-idempotent insert** → duplicate rows after rebalance replay.

## Guardrail
Alert on **DLQ depth** + **duplicate-key violations** (should be near zero with idempotency).`,
    q6: `## One-liners (Kafka architecture)
- **Ordering**: per-partition **total order**; across partitions **no global order** without extra design.
- **Idempotency**: producer **idempotence** + broker dedupe window; consumer must still be **business-idempotent**.
- **Offset/ack**: offset is **consumer progress**; committing offset acknowledges progress (strategy: auto vs manual sync/async).
- **Replay**: reset offsets or restore from compacted topic / rebuild projection — trade **cost** vs **correctness**.

## Anti-pattern
Treating **commit** as "message deleted" like a queue — you will mis-design error handling and replay.`,
  },
  '60': {
    q1: `## Plain explanation
A **Kafka producer** batches records, compresses optionally, and sends to the **leader** partition broker. **acks** controls durability acknowledgement; **retries** handle transient failures; **idempotence** reduces duplicates during retries.

## Production example
High-throughput ingestion: tune **linger.ms** and **batch.size** to trade latency for throughput; watch **buffer-exhaustion** if the broker is slow.

## Common mistake
"acks=all is always best" — it is **safer** but adds **latency** and can amplify tail latency during broker issues.

## Failure mode
**Infinite retries** on non-transient errors → **retry storm** amplifying an outage.`,
    q2: `## Compare: throughput-first vs durability-first
| | Throughput-first | Durability-first |
|--|--|--|
| acks | often \`1\` or tuned | \`all\` |
| latency | lower | higher |
| risk | more data loss window on crash | fewer acknowledged writes lost |

## Replay / recovery
Idempotent producer helps **retry duplicates** at the protocol level; you still need **business keys** for consumer-side duplicates.

## Interview pivot
Mention **min.insync.replicas** with **acks=all** — without ISR, you do not get the durability you think you have.`,
    q3: `## Triage order
1. **Producer metrics**: record-error-rate, request-latency, batch-size, buffer-available-bytes.
2. **Broker**: under-replicated partitions? controller churn?
3. **Client logs**: \`NOT_LEADER_FOR_PARTITION\`, \`TIMEOUT\`, auth/TLS issues.

## Do NOT immediately
Turn **retries** to max without **jitter** caps — you can DDOS your own cluster during brownouts.

## Recovery proof
Stable **p99 produce latency**, error rate ~0, and **no growing** \`metadata age\` / stale leader cache.

## Failure mode
**Idempotence disabled + aggressive retries** → duplicate events that look like distinct business actions downstream.`,
    q4: {
      solution: `## Snippet: producer settings candidates should know
\`\`\`java
Properties p = new Properties();
p.put("bootstrap.servers", "kafka:9092");
p.put("acks", "all");                 // durability
p.put("enable.idempotence", "true"); // requires acks=all in practice
p.put("retries", Integer.toString(Integer.MAX_VALUE));
p.put("delivery.timeout.ms", "120000");
p.put("linger.ms", "5");
p.put("batch.size", "32768");
KafkaProducer<String, String> producer = new KafkaProducer<>(p);
\`\`\`

## Failure mode: "acks=all but ISR=1"
If **min.insync.replicas** is not enforced, you can acknowledge while replication is unhealthy — **silent durability loss** risk during broker failure.`,
      codeTemplate: `// Day 60 — Producer interview snippet
public class Day60Assignment {
  public static void main(String[] args) {
    // TODO: print the three settings you pair with acks=all for real durability
    System.out.println("acks=all + min.insync.replicas + replication factor");
  }
}`,
      expectedOutput: `acks=all + min.insync.replicas + replication factor`,
    },
    q5: `## What went wrong
You lowered **linger** and increased **request rate** → better latency but more **small batches** → higher CPU on brokers and more **duplicate exposure windows** if retries overlap with slow brokers.

## Better approach
- Keep **idempotence** on; tune **delivery.timeout** vs **request.timeout** deliberately.
- Use **circuit breaker** on the producing service if brokers are unhealthy (fail fast vs hammer).

## Failure mode
**Producer buffer full** (\`RecordAccumulator\`) → publish thread blocks → cascading latency in the service.`,
    q6: `## Ordering / idempotency / offsets / replay (producer angle)
- **Ordering**: same **key** → same partition → producer ordering preserved unless retries reorder (idempotence fixes Kafka protocol duplicates).
- **Idempotency**: \`enable.idempotence=true\` + proper acks; still not EOS end-to-end.
- **Offsets**: producer does not commit consumer offsets — but **transactions** can write to Kafka + consume offsets atomically in advanced setups.
- **Replay**: re-read topic — producers do not "replay" consumers; fix **downstream dedupe**.

## Anti-pattern
Setting **retries=0** to "avoid duplicates" — you often just **lose** messages on transient failures.`,
  },
  '61': {
    q1: `## Consumer in plain terms
Consumers read partitions sequentially via **poll()**. Offsets track progress. A **group** coordinates partition assignment so each partition is consumed by **one** consumer in the group (for typical subscribe API).

## Example
Scale consumers up to partition count for **parallelism**; beyond that, idle consumers.

## Misunderstanding
"More consumers always speeds up consumption" — **false** if partitions are fewer than consumers.

## Failure mode
**Long GC** or blocking \`process()\` → **max.poll.interval** exceeded → rebalance.`,
    q2: `## Auto commit vs manual commit
| | Auto | Manual |
|--|--|--|
| ease | high | lower |
| duplicate risk on crash | higher | lower if commit after process |
| latency | fewer sync commits | explicit control |

## Recovery story
Manual commit pairs with **idempotent** processing: commit only after side effects are durable.

## Failure mode
**Commit-before-process** → never lose offset but may **skip** messages on crash.`,
    q3: `## First checks
1. **Consumer group lag** per partition — hot partition?
2. **Rebalance reason** in logs (poll timeout vs voluntary join)
3. **Processing time histogram** inside poll loop

## Avoid
Immediately increasing **max.poll.interval** without fixing slow handler — you mask poison messages.

## Prove recovery
Lag slope negative for 15–30 min + **no** constant rebalance churn.

## Failure mode
**Cooperative rebalance** still hurts if one partition stuck on poison message.`,
    q4: {
      solution: `## Manual commit sketch
\`\`\`java
consumer.subscribe(List.of("orders"));
while (true) {
  var records = consumer.poll(Duration.ofMillis(500));
  for (var r : records) {
    try {
      applyIdempotent(r);
      consumer.commitSync(); // or batch commits
    } catch (PoisonException e) {
      sendToDlq(r, e);
      consumer.commitSync(); // advance past poison with audit
    }
  }
}
\`\`\`

## Failure mode
Committing every message synchronously under high throughput → **throughput collapse**; batch commits carefully.`,
      codeTemplate: `public class Day61Assignment {
  public static void main(String[] args) {
    // TODO: name offset commit modes and one failure scenario for each
    System.out.println("auto: may commit before process; sync manual: slow; async manual: ordering risks");
  }
}`,
      expectedOutput: `auto: may commit before process; sync manual: slow; async manual: ordering risks`,
    },
    q5: `## Duplicate risk after your "fix"
If you increased batching or prefetch, you might process **larger** batches per poll — any crash mid-batch without idempotency duplicates partial work.

## Fix pattern
- **Batch id** + transactional writes OR
- **Per-message id** dedupe table

## Failure mode
**Async commit** callbacks arriving out of order → offset leapfrogging → **skipped** messages.`,
    q6: `## Consumer rapid fire
- **Ordering**: per partition order preserved in one consumer thread model.
- **Idempotency**: at-least-once delivery implies **retry duplicates** — handle in sink.
- **Offsets**: committed offset defines restart position — must match business durability.
- **Replay**: reset offsets / restore compacted topic — reprocess projections idempotently.

## Anti-pattern
Using **pause()** forever on error without DLQ — stalls partition forever.`,
  },
  '62': {
    q1: `## Semantics in practice
- **At-most-once**: commit early → possible loss.
- **At-least-once**: commit after processing → duplicates on crash.
- **Exactly-once**: requires **end-to-end** definition — often **EOS Kafka + transactional writes** plus **idempotent** app.

## Example
Payment charge: use **idempotency key** + ledger uniqueness — Kafka alone cannot "EOS" your DB.

## Misunderstanding
"Exactly-once everywhere" — usually **exactly-once effect** in the business sense via **keys** and **dedupe**.

## Failure mode
**EOS enabled** but consumer still **double-writes** to DB without transaction boundaries.`,
    q2: `## Compare EOS vs at-least-once + idempotent sink
EOS adds broker/client complexity; idempotent sink is often simpler and portable across systems.

## Incident recovery
EOS reduces some classes of duplicates but **external side effects** (email) still need **outbox** or **compensation**.

## Failure mode
**Zombie fencing** scenarios when consumers write externally — EOS in Kafka does not fence your Postgres row.`,
    q3: `## Triage
1. Duplicate charges? correlate **consumer instance id** + **offset** + **idempotency key** collisions.
2. Are you using **transactions** correctly (timeout too low)?
3. External system **timeouts** causing client-side retries?

## Do not
Disable idempotency to "stop duplicates" — you usually increase **data loss** risk.

## Proof
Reconciliation job matches **Kafka offsets processed** == **ledger rows** for time window.`,
    q4: {
      solution: `## Idempotent consumer pattern (interview gold)
\`\`\`java
void handle(OrderEvent e) {
  if (processedEvents.insertIfAbsent(e.getId())) { // unique constraint
    charge(e);
  }
}
\`\`\`

Pair with **at-least-once** Kafka delivery — duplicates become **harmless**.

## Failure mode
**Clock skew** + time-based dedupe only → duplicates slip through.`,
      codeTemplate: `public class Day62Assignment {
  public static void main(String[] args) {
    // TODO: print the minimum fields for a consumer dedupe key
    System.out.println("topic+partition+offset OR business eventId (preferred)");
  }
}`,
      expectedOutput: `topic+partition+offset OR business eventId (preferred)`,
    },
    q5: `## After "fix"
You reduced duplicates in Kafka but **downstream email** still fires twice — EOS does not cover SMTP.

## Fix
**Outbox** table in the same DB transaction as state change + async sender.

## Failure mode
**Two active consumers** during network partition writing same external resource — needs **fencing token** or **single writer** pattern.`,
    q6: `## Definitions
- **Ordering**: per key via partition; EOS does not create global order.
- **Idempotency**: produce **idempotence** + consumer **dedupe**.
- **Offsets**: consumer offset commits define read progress.
- **Replay**: rebuild state from log — must be deterministic + idempotent.

## Anti-pattern
Using **message timestamp** as sole idempotency key under retries.`,
  },
  '63': {
    q1: `## Kafka Streams mental model
**KStream** is an event stream; **KTable** is a changelog table (materialized view). Stateful ops (aggregate, join) use **RocksDB** state stores + changelog topics for fault tolerance.

## Example
**Windowed word count** for 1-minute tumbling windows for abuse detection.

## Misunderstanding
"Streams removes operational complexity" — you still operate **state size**, **rebalancing**, and **disk** on app nodes.

## Failure mode
**Rebalance** during heavy state restore → long downtime for that task.`,
    q2: `## Streams DSL vs Processor API
DSL faster to write; Processor API for custom timing/control.

## Recovery
State stores restore from changelog — **restore time** is your incident variable.

## Failure mode
**Aggressive compaction** misconfigured → state rebuild pulls huge history.`,
    q3: `## First checks
1. **Restore rate** / **rocksdb** disk usage
2. **Rebalance storm** (long GC pauses in stream threads)
3. **Input topic** lag vs **punctuate** timers

## Avoid
Immediately scaling pods without understanding **state assignment** — can increase churn.

## Proof
Stable **processed-rate** and **zero** under-replicated internal changelog topics.`,
    q4: {
      solution: `## Topology sketch (interview)
\`\`\`java
StreamsBuilder b = new StreamsBuilder();
KStream<String, String> text = b.stream("lines");
text.flatMapValues(v -> Arrays.asList(v.toLowerCase().split("\\\\W+")))
    .groupBy((k, word) -> word)
    .windowedBy(TimeWindows.ofSizeWithNoGrace(Duration.ofMinutes(1)))
    .count(Materialized.as("counts-store"));
\`\`\`

## Failure mode
**Late data** after grace period dropped — business surprise if you did not document **allowed lateness**.`,
      codeTemplate: `public class Day63Assignment {
  public static void main(String[] args) {
    // TODO: name two stateful operations that explode disk if key space is huge
    System.out.println("aggregate, join (materialized state + changelog)");
  }
}`,
      expectedOutput: `aggregate, join (materialized state + changelog)`,
    },
    q5: `## Second-order issue
Windowed count looks right but **repartition topic** exploded traffic due to bad key — cost + lag.

## Fix
Pre-filter / map to **coarser key**; increase partitions only with evidence.

## Failure mode
**Changelog retention** too short → cannot rebuild state after long downtime.`,
    q6: `## Streams rapid fire
- **Ordering**: per partition in source topics; joins add **co-partitioning** requirements.
- **Idempotency**: processing is deterministic; failures replay changelog — still need **exactly-once** config for cross-topic EOS if used.
- **Offsets**: internal **consumer** offsets for changelog consumption.
- **Replay**: reset application + rebuild state from changelog.

## Anti-pattern
Joining topics with **different partition counts** without repartitioning.`,
  },
  '64': {
    q1: `## Schema Registry role
Centralizes **Avro/JSON/Protobuf** schemas with **versioning** so producers and consumers evolve safely.

## Example
Add optional field with **BACKWARD** compatibility for consumers that can read older payloads.

## Misunderstanding
"Registry prevents bad data" — it prevents **incompatible** schema changes; **business validation** is still yours.

## Failure mode
**Breaking change** deployed → deserialization failures across services.`,
    q2: `## BACKWARD vs FORWARD vs FULL
- **Backward**: new schema, old readers (common rolling deploy)
- **Forward**: old schema, new readers (less common)
- **Full**: both directions

## Recovery
Use **schema id** embedded in wire format (Confluent wire format) to pin exact writer schema.

## Failure mode
**Multiple schema versions** in one topic without compatibility discipline → consumer hell.`,
    q3: `## Triage
1. **Deserialization errors** metric + dead letters
2. **Connector task** failures (auth, network, DB)
3. **Schema compatibility** check failures in CI

## Do not
Delete old schema versions that still exist in Kafka retention.

## Proof
Connector **lag** decreasing + **error tuples** ~0.

## Failure mode
**Auto-register** in prod allows accidental incompatible schemas.`,
    q4: {
      solution: `## Connect sink snippet (conceptual)
\`\`\`json
{
  "connector.class": "io.confluent.connect.jdbc.JdbcSinkConnector",
  "topics": "orders",
  "connection.url": "jdbc:postgresql://db/orders",
  "auto.create": "true",
  "pk.mode": "record_key",
  "insert.mode": "upsert"
}
\`\`\`

## Failure mode
**At-least-once sink** without primary keys → duplicate rows in DB.`,
      codeTemplate: `public class Day64Assignment {
  public static void main(String[] args) {
    // TODO: print one reason Connect tasks restart in a loop
    System.out.println("DB auth failure, schema mismatch, or deserialization error");
  }
}`,
      expectedOutput: `DB auth failure, schema mismatch, or deserialization error`,
    },
    q5: `## After schema fix
Throughput improved but **DB upsert** contention spiked — connector can outpace DB.

## Fix
Throttle **tasks**, batch settings, or scale DB / partition input.

## Failure mode
**Single-threaded** sink task hotspot on huge partition.`,
    q6: `## Registry rapid fire
- **Ordering**: not a schema concern — but evolution must not break readers.
- **Idempotency**: upsert keys in sink; dedupe on business id.
- **Offsets**: Connect tracks offsets in **internal topic**.
- **Replay**: reset connector offsets — dangerous without idempotent sink.

## Anti-pattern
Sharing one **global** schema subject for unrelated events.`,
  },
  '65': {
    q1: `## Spring Kafka at a glance
\`@KafkaListener\` runs consumer loop in managed threads; \`KafkaTemplate\` sends messages with transaction support optional. Error handlers decide **retry vs DLQ**.

## Example
Manual ack with \`Acknowledgment\` interface for **at-least-once** with your DB transaction.

## Misunderstanding
"Spring hides Kafka" — you still must tune **concurrency**, **poll**, and **commit**.

## Failure mode
**Default concurrency** too low → one thread processes all partitions sequentially in some configs.`,
    q2: `## @KafkaListener vs reactive KafkaReceiver
Blocking listener simpler; reactive for pipeline backpressure — but complexity rises.

## Recovery
Use **SeekToCurrentErrorHandler** / custom **ErrorHandlingDeserializer** patterns consciously.

## Failure mode
**Serialization exception** poison pill retries forever without DLQ.`,
    q3: `## First checks
1. **Listener container** logs: commit failures?
2. **Retry topic** / DLQ accumulation
3. **Thread pool** saturation in @KafkaListener method

## Avoid
Catching **Throwable** and swallowing — hides poison messages.

## Proof
Stable **processing rate**, DLQ near zero, **lag** down.

## Failure mode
**Transactional listener** + slow DB → producer send blocked → poll starvation.`,
    q4: {
      solution: `## Manual ack listener (interview)
\`\`\`java
@KafkaListener(topics = "orders", groupId = "spring-group")
public void onMessage(ConsumerRecord<String, String> r, Acknowledgment ack) {
  try {
    service.apply(r.value());
    ack.acknowledge();
  } catch (TransientException e) {
    // retry policy / backoff — do not ack yet
  }
}
\`\`\`

## Failure mode
Acking before DB commit → message loss on process crash.`,
      codeTemplate: `public class Day65Assignment {
  public static void main(String[] args) {
    // TODO: print the pair: listener concurrency vs topic partitions
    System.out.println("concurrency should relate to partitions, not infinite threads");
  }
}`,
      expectedOutput: `concurrency should relate to partitions, not infinite threads`,
    },
    q5: `## After tuning concurrency
You improved throughput but hit **ordering** issues for same key processed by multiple threads.

## Fix
**Single-threaded** listener per partition OR **partition-aware** routing to ordered workers.

## Failure mode
**Out-of-order DB updates** for same aggregate.`,
    q6: `## Spring Kafka rapid fire
- **Ordering**: per partition order preserved in single-threaded processing.
- **Idempotency**: still required — Spring does not dedupe business logic.
- **Offsets**: ack drives committed offset when using manual ack.
- **Replay**: seek APIs in container — operational, dangerous without guards.

## Anti-pattern
Throwing from listener without error handler → poison retry loop.`,
  },
  '66': {
    q1: `## Rabbit vs Kafka (interview)
**RabbitMQ**: flexible routing (exchanges), push-oriented consumers, per-message ack, great for **task queues**.
**Kafka**: durable log, replay, high throughput streaming, consumer groups.

## Example
**Order tasks** on Rabbit with priority queues; **analytics events** on Kafka.

## Misunderstanding
"Kafka replaces Rabbit" — often they solve different messaging UX problems.

## Failure mode
**Kafka consumer** used for RPC-style request/response without timeouts → operational pain.`,
    q2: `## SNS/SQS vs Kafka
SQS: managed queue, at-least-once, simple ops; limited ordering (FIFO constraints). Kafka: log-centric streaming.

## Recovery
SQS visibility timeout tuning is your **rebalance analog** — poison messages rotate visibility.

## Failure mode
**FIFO throughput** limited without partition strategy.`,
    q3: `## Triage
1. **Redeliveries** / poison messages
2. **Broker memory** watermarks (Rabbit)
3. **SQS approximate age of oldest message**

## Avoid
Blindly increasing **prefetch** without consumer capacity.

## Proof
Queue depth stable near 0 under steady load.

## Failure mode
**Unacked** messages pile up → memory pressure on Rabbit.`,
    q4: {
      solution: `## SQS long polling sketch (pseudo)
\`\`\`java
ReceiveMessageRequest req = new ReceiveMessageRequest()
  .withQueueUrl(queueUrl)
  .withWaitTimeSeconds(20)
  .withMaxNumberOfMessages(10);
\`\`\`

## Failure mode
**Short polling** hot loop → AWS bill + CPU burn.`,
      codeTemplate: `public class Day66Assignment {
  public static void main(String[] args) {
    // TODO: when pick SQS vs Kafka in one line each
    System.out.println("SQS: managed queue/task; Kafka: log streaming/replay");
  }
}`,
      expectedOutput: `SQS: managed queue/task; Kafka: log streaming/replay`,
    },
    q5: `## Cross-cloud complexity
You unified on one bus but **latency SLO** regressed due to cross-region links.

## Fix
Region-local topics + **aggregation**; avoid chatty cross-region RPC.

## Failure mode
**Duplicate processing** when bridging systems without idempotency keys.`,
    q6: `## Rapid fire
- **Ordering**: FIFO queues / Kafka partitions — different guarantees.
- **Idempotency**: visibility timeout extensions vs Kafka retries — both need idempotent handlers.
- **Offsets**: SQS **receipt handle**; Kafka offsets — different operational playbooks.
- **Replay**: Kafka native; SQS replay via **redrive** / new copies.

## Anti-pattern
Using SQS as an **infinite** event store.`,
  },
  '67': {
    q1: `## CAP in one breath
In a **partition**, you must choose between **consistency** and **availability** for reads/writes; **partition tolerance** is mandatory in distributed systems.

## Example
**Cassandra** availability-oriented tunable consistency; **HBase** CP-oriented with Hadoop dependencies.

## Misunderstanding
"CA systems exist" — in practice networks fail; you always plan for **P**.

## Failure mode
**Split-brain writes** when two sides both accept writes.`,
    q2: `## Strong consistency vs eventual
Strong: simpler mental model, harder availability under partitions. Eventual: better uptime, harder app invariants.

## Recovery
Use **version vectors**, **CRDTs**, or **leader election** consciously.

## Failure mode
**Last-write-wins** without causal context loses data silently.`,
    q3: `## Triage
1. **Split-brain symptoms**: divergent counters in two regions
2. **Clock skew** breaking ordering assumptions
3. **Quorum** loss in consensus systems

## Avoid
Turning off safety checks to "restore availability" without understanding **durability** trade-offs.

## Proof
**Linearizable test** harness or business reconciliation passes.

## Failure mode
**Dual writes** to two stores without saga/outbox.`,
    q4: {
      solution: `## Interview snippet: explicit version conflict handling
\`\`\`java
void save(Order o) {
  int rows = jdbc.update(
    "UPDATE orders SET state=?, version=version+1 WHERE id=? AND version=?",
    o.state(), o.id(), o.version());
  if (rows == 0) throw new OptimisticLockException();
}
\`\`\`

## Failure mode
Retry storm on optimistic conflicts without backoff.`,
      codeTemplate: `public class Day67Assignment {
  public static void main(String[] args) {
    // TODO: print CAP: during partition, tradeoff between which two?
    System.out.println("Consistency vs Availability (Partition tolerance assumed)");
  }
}`,
      expectedOutput: `Consistency vs Availability (Partition tolerance assumed)`,
    },
    q5: `## After "high availability"
You routed writes to both DCs for speed — now **inconsistent** reads across users.

## Fix
Choose **active-passive** for writer, **async replication** with clear staleness SLAs, or **CRDT** for specific domains.

## Failure mode
**Read-your-writes** violated for session-sensitive flows.`,
    q6: `## Rapid fire
- **Ordering**: causal ordering needs clocks + careful design; not automatic in distributed systems.
- **Idempotency**: mandatory for retries across partitions.
- **Offsets**: not universal — Kafka-specific; distributed systems use **vector clocks**, **Lamport**, etc.
- **Replay**: event log rebuild — requires deterministic processing.

## Anti-pattern
Assuming **DB transactions** span microservices without distributed protocol.`,
  },
};

export const PHASE9_SOLUTIONS_BY_DAY = {
  '77': {
    q1: `## SRP in practice
A class should have **one reason to change** — typically one axis of business change.

## Example violation
\`OrderService\` that emails, bills, prints PDFs — any notification template change forces redeploy of billing logic.

## Scale failure
Teams step on each other; tests become slow and flaky.

## Fix direction
Split by **use case** classes or modules; inject collaborators.

## Failure mode after sloppy split
**Anemic domain** + **transaction script** scattered — still hard to test.`,
    q2: `## Clean Architecture trade-off
**Dependency rule** helps testability; cost is more interfaces/boilerplate.

## Incident angle
Poor boundaries mean a bug in PDF rendering takes down **payment** deployment.

## Failure mode
**Circular module dependencies** — "big ball of mud" with packages.`,
    q3: `## Review scenario
Reviewer asks: "Why does UserController call PaymentGateway directly?" — boundary violation.

## Response structure
Acknowledge leak → introduce **application use case** + ports; move I/O to adapters.

## Failure mode
**Framework annotations** in domain entities → untestable core.`,
    q4: {
      solution: `## Before / after snippet
**Bad (SRP violation)**
\`\`\`java
class UserService {
  User find(String id){...}
  void email(User u){...} // wrong responsibility
}
\`\`\`

**Better**
\`\`\`java
class UserService {
  private final UserRepo repo;
  User find(String id){ return repo.find(id); }
}
class EmailNotifier { void send(User u){...} }
\`\`\`

## Failure mode
**God service** becomes merge conflict battlefield.`,
      codeTemplate: `public class Day77Assignment {
  public static void main(String[] args) {
    // TODO: name one SRP smell you look for in PRs
    System.out.println("multiple unrelated reasons to change in one class");
  }
}`,
      expectedOutput: `multiple unrelated reasons to change in one class`,
    },
    q5: `## New requirement: multi-channel notifications
Stable: **domain events** and **user entity**. Refactor first: introduce **NotificationPort** with adapters for email/SMS/push.

## Failure mode if you bolt on
**If/else** chains across the service → untestable and merge-heavy.`,
    q6: `## Rapid fire
- **Coupling**: change ripple across modules.
- **Cohesion**: related behavior stays together.
- **Consistency**: transactional boundaries — often **per aggregate** in DDD.
- **Failure domain**: blast radius of a bug — bounded by module boundaries.

## Anti-pattern
**Shared DTO** types across all layers forever.`,
  },
  '78': {
    q1: `## Singleton when it is ok
**Global config** or **expensive** client init (with caution) — still prefer Spring beans over hand-rolled singletons in modern apps.

## Danger
Hidden global **mutable state** under test breaks parallel tests.

## Failure mode
**Classloader** tricks in app servers create multiple singleton instances.`,
    q2: `## DCL vs enum singleton (Joshua Bloch)
Enum singleton is **serialization-safe** and **thread-safe** by design; DCL is error-prone.

## Trade-off
Enum less flexible for mocking unless designed with interfaces.

## Failure mode
**Partially constructed** instance visible without volatile (old DCL bug).`,
    q3: `## Interview trap
"Make this logger singleton thread-safe" — discuss **double-checked locking** + **volatile** or just use **static holder** idiom.

## Failure mode
**Synchronized** getInstance on every call kills hot path performance.`,
    q4: {
      solution: `## Enum singleton (preferred interview answer)
\`\`\`java
public enum AppConfig {
  INSTANCE;
  private final String apiKey = load();
  public String apiKey(){ return apiKey; }
}
\`\`\`

## DCL sketch (know the volatile)
\`\`\`java
class X {
  private static volatile X inst;
  static X get(){ if(inst==null){ synchronized(X.class){ if(inst==null) inst=new X(); } } return inst; }
}
\`\`\``,
      codeTemplate: `public class Day78Assignment {
  public static void main(String[] args) {
    // TODO: why enum singleton vs DCL for Java interviews
    System.out.println("enum: serialization/thread safety; DCL: easy to get wrong");
  }
}`,
      expectedOutput: `enum: serialization/thread safety; DCL: easy to get wrong`,
    },
    q5: `## New requirement: multiple configs per tenant
Singleton **global** config breaks — move to **scoped** factory or registry with lifecycle.

## Failure mode
**Static caches** grow unbounded per tenant.`,
    q6: `## Rapid fire
- **Coupling**: global singleton hides dependencies.
- **Cohesion**: factory families belong together.
- **Consistency**: config should reload coherently — avoid half-updated globals.
- **Failure domain**: bad singleton can take down whole JVM on init exception.

## Anti-pattern
**Singleton DatabaseConnection** without pool.`,
  },
  '79': {
    q1: `## Decorator vs subclass
Decorator composes behavior at **runtime**; subclassing is compile-time extension.

## Example
Add **metrics** around \`HttpClient\` without changing call sites.

## Failure mode
**Stack overflow** of decorators if chained naively with deep stacks (rare but messy).`,
    q2: `## vs Proxy
Proxy often controls **access**; decorator adds **behavior**. Same structure, different intent.

## Failure mode
**Leaky abstraction** if decorator changes contract subtly.`,
    q3: `## Scenario
Add cross-cutting **retry** to payment client — decorator wraps core client; keeps **single responsibility** per layer.

## Failure mode
**Retry** on non-idempotent POST without **idempotency keys**.`,
    q4: {
      solution: `## Decorator sketch
\`\`\`java
interface Text { String apply(String s); }
class Upper implements Text { public String apply(String s){ return s.toUpperCase(); } }
class Trim implements Text {
  private final Text inner;
  Trim(Text inner){ this.inner = inner; }
  public String apply(String s){ return inner.apply(s).trim(); }
}
\`\`\``,
      codeTemplate: `public class Day79Assignment {
  public static void main(String[] args) {
    // TODO: decorator vs proxy intent
    System.out.println("decorator: add behavior; proxy: control access");
  }
}`,
      expectedOutput: `decorator: add behavior; proxy: control access`,
    },
    q5: `## New requirement: dynamic ordering of transforms
Decorator chain becomes rigid — consider **list of strategies** (composite) with explicit ordering config.

## Failure mode
Order-dependent transforms (hash then encrypt) silently wrong if reordered.`,
    q6: `## Rapid fire
- **Coupling**: decorator stacks can couple layers if interfaces too wide.
- **Cohesion**: each decorator should do one thing.
- **Consistency**: ordering matters for crypto/metrics.
- **Failure domain**: retries multiply downstream load.

## Anti-pattern
**Mega-decorator** that logs, retries, metrics, caches in one class.`,
  },
  '80': {
    q1: `## Strategy pattern
Encapsulate a family of algorithms behind an interface — choose at runtime.

## Example
**Tax rules** per country without giant switch growing forever.

## Failure mode
**Strategy explosion** — too many tiny classes without grouping.`,
    q2: `## vs Template Method
Template method fixes skeleton in base class; strategy composes behavior — favor strategy for **testability** and **composition**.

## Failure mode
**Context object** passed everywhere becomes a blob.`,
    q3: `## Scenario
Payment routing: **card vs wallet vs BNPL** — strategy selected by checkout type; failures isolated per strategy.

## Failure mode
**Partial failure** without compensation across strategies.`,
    q4: {
      solution: `## Strategy sketch
\`\`\`java
interface Pay { Result pay(Order o); }
class Checkout { private final Map<Type, Pay> routes; }
\`\`\`

## Failure mode
Missing **default** strategy → NPE at runtime.`,
      codeTemplate: `public class Day80Assignment {
  public static void main(String[] args) {
    // TODO: strategy vs if-else chain maintenance
    System.out.println("strategy: open for extension; if-else: edit risk");
  }
}`,
      expectedOutput: `strategy: open for extension; if-else: edit risk`,
    },
    q5: `## New requirement: A/B pricing experiments
Strategy selection must be **deterministic per user** and **auditable** — inject **experiment resolver** with seeding.

## Failure mode
**Random** per request pricing breaks trust and caching.`,
    q6: `## Rapid fire
- **Coupling**: strategy interface too wide couples all implementations.
- **Cohesion**: keep strategies small.
- **Consistency**: choose strategy before transactional boundary.
- **Failure domain**: mis-routed strategy charges wrong amount — needs compensating transaction.

## Anti-pattern
**God switch** in one method with 40 cases.`,
  },
  '81': {
    q1: `## Rate limiting goals
Protect **dependencies**, ensure **fairness**, and provide predictable **latency**.

## Example
100 req/min/user → token bucket with **burst** allowance for interactive UX.

## Failure mode
**Global limit** only — one noisy tenant affects everyone.`,
    q2: `## Algorithms
Token bucket (smooth + burst), leaky bucket (smooth output), sliding window (accuracy).

## Trade-off
Accuracy vs memory — sliding window log is heavier than counters.

## Failure mode
**Distributed limiter** without sync → double budget across nodes.`,
    q3: `## Scenario
Spike from marketing campaign — return **429** with **Retry-After**, shed load at edge, protect DB.

## Failure mode
**Retry storm** from clients without jitter.`,
    q4: {
      solution: `## Pseudocode: token bucket
\`\`\`java
class Bucket {
  double tokens, rate, cap, last;
  synchronized boolean take(){
    refill();
    if(tokens>=1){ tokens-=1; return true;}
    return false;
  }
}
\`\`\`

## Failure mode
**Per-user map** unbounded → memory leak — use LRU + cardinality controls.`,
      codeTemplate: `public class Day81Assignment {
  public static void main(String[] args) {
    // TODO: why edge limiter vs app limiter
    System.out.println("edge: cheap rejection; app: domain-aware limits");
  }
}`,
      expectedOutput: `edge: cheap rejection; app: domain-aware limits`,
    },
    q5: `## After raising limits
Latency improved but **cost** spiked — downstream SaaS per-call billing.

## Fix
Tiered limits + **cache** for expensive operations.

## Failure mode
**Thundering herd** on cache expiry.`,
    q6: `## Rapid fire
- **Coupling**: limiter keys tied to tenant/user/device — choose carefully.
- **Cohesion**: keep enforcement at **one** layer or coordinate explicitly.
- **Consistency**: global counts need **Redis** / gossip coordination.
- **Failure domain**: limiter outage should **fail closed** or **open** by policy.

## Anti-pattern
Rate limit **after** expensive work already done.`,
  },
  '82': {
    q1: `## URL shortener core
**Redirect lookup** by short key → long URL; **write path** creates mapping; must be **low latency** reads.

## Example
Base62 encoding of auto-increment or random tokens with collision checks.

## Failure mode
**Predictable** keys enable scraping/guessing — use **entropy** + abuse protection.`,
    q2: `## SQL vs NoSQL
SQL with PK index works; NoSQL with partition key = short code scales horizontally.

## Trade-off
**Hot keys** if sequential IDs expose patterns; shard by prefix.

## Failure mode
**Dual writes** to cache and DB without TTL coherence.`,
    q3: `## Scenario
Spike from viral link — **CDN/edge cache** for redirects, **rate limit** create endpoint.

## Failure mode
**Cache stampede** on hot URL expiration.`,
    q4: {
      solution: `## Schema sketch
\`\`\`text
short_code (PK), long_url, created_at, owner_id, expires_at
\`\`\`

## Base62
Map 0-61 to [a-zA-Z0-9] — avoid ambiguous chars if product requires.

## Failure mode
**Collision** on random generation without retry loop.`,
      codeTemplate: `public class Day82Assignment {
  public static void main(String[] args) {
    // TODO: two ways to generate short codes
    System.out.println("hash+truncate with collision check; counter+base62");
  }
}`,
      expectedOutput: `hash+truncate with collision check; counter+base62`,
    },
    q5: `## New requirement: editable long URLs
Stable: **short code** immutable; add **version** or new mapping with **redirect type** (301 vs 302) policy.

## Failure mode
**301 caches** forever at browsers — user stuck on old destination.`,
    q6: `## Rapid fire
- **Coupling**: analytics pipeline tied to redirect path — isolate async.
- **Cohesion**: create/read APIs separate scaling profiles.
- **Consistency**: read-after-write for creator UI — use **strong** read or token.
- **Failure domain**: abuse uploads — malware scanning on create.

## Anti-pattern
Storing **only** hashed URL without canonicalization → duplicates.`,
  },
  '83': {
    q1: `## Notification service
Fan-out events to channels (push/email/SMS) with **provider adapters** and **per-user preferences**.

## Example
Queue per channel with different **SLA** and **retry** policies.

## Failure mode
**Fan-out storm** from celebrity mention — need **rate limiting** + **sharding**.`,
    q2: `## Push vs pull
Mobile push is provider-mediated; email is SMTP batch; pull models for web inbox.

## Trade-off
Push is fast but **opaque** delivery guarantees; email has **retries** and **bounces**.

## Failure mode
**Duplicate notifications** without idempotency keys per event.`,
    q3: `## Scenario
10M/day → partition by **user_id**, **autoscale** workers, **dead letter** for provider 4xx/5xx separately.

## Failure mode
**Poison** provider credential rotates → all channels fail if shared client poorly isolated.`,
    q4: {
      solution: `## Worker sketch
\`\`\`java
void handle(NotificationJob j) {
  if (dedupe.seen(j.id())) return;
  provider.send(j); // with timeouts
}
\`\`\`

## Failure mode
**Blocking** SMTP in web thread — always async pipeline.`,
      codeTemplate: `public class Day83Assignment {
  public static void main(String[] args) {
    // TODO: one reason to split queues by channel
    System.out.println("different retry, cost, and SLA per channel");
  }
}`,
      expectedOutput: `different retry, cost, and SLA per channel`,
    },
    q5: `## New requirement: user-defined quiet hours
Add **schedule table** + **timezone** correctness — DST bugs cause midnight spam.

## Failure mode
**Cron in UTC** only — wrong local quiet hours.`,
    q6: `## Rapid fire
- **Coupling**: templating engine coupled to provider — use adapter.
- **Cohesion**: batch vs transactional notifications separate.
- **Consistency**: at-least-once job queue + idempotent send.
- **Failure domain**: provider outage — degrade gracefully (banner in app).

## Anti-pattern
**Infinite retry** on 400-class errors.`,
  },
  '84': {
    q1: `## Order service
State machine: Created → Paid → Fulfilled / Cancelled; integrate **inventory**, **payment**, **shipping**.

## Example
Saga orchestration with **timeouts** and **compensation** messages.

## Failure mode
**Lost message** between steps → stuck order — need **reconciliation** job.`,
    q2: `## CQRS touch
Commands mutate state; queries read **projections** — trade complexity for scale.

## Failure mode
**Projection lag** shows stale "shipped" in UI — define **staleness** SLA.`,
    q3: `## Scenario
Payment succeeds, inventory fails — **compensating refund** saga step; must be **idempotent**.

## Failure mode
**Double refund** if compensation retried.`,
    q4: {
      solution: `## State + idempotency
\`\`\`java
enum State { CREATED, PAID, CANCELLED, SHIPPED }
void onPaymentOk(String orderId, String payId){
  if (!orders.markPaidIf(orderId, State.CREATED, payId)) return; // idempotent
  inventory.reserve(orderId);
}
\`\`\``,
      codeTemplate: `public class Day84Assignment {
  public static void main(String[] args) {
    // TODO: name saga compensation vs 2PC trade-off
    System.out.println("saga: loose coupling; 2PC: strong consistency, not always available");
  }
}`,
      expectedOutput: `saga: loose coupling; 2PC: strong consistency, not always available`,
    },
    q5: `## New requirement: partial shipments
Stable: **order aggregate**; add **shipment** sub-entity with its own state — avoid boolean flags explosion.

## Failure mode
**Monolithic state enum** becomes unmaintainable.`,
    q6: `## Rapid fire
- **Coupling**: payment provider webhooks tightly coupled to core — use **adapter**.
- **Cohesion**: keep saga orchestration in one module with explicit steps.
- **Consistency**: define **per step** consistency (strong vs eventual).
- **Failure domain**: inventory oversell — **optimistic locking** + reconciliation.

## Anti-pattern
**Synchronous** chain of HTTP calls with no timeouts across services.`,
  },
};
