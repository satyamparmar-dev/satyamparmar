import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const JSON_PATH = path.join(ROOT, "public", "data", "days", "phase7-day59.json");

const data = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));

// ─── WHY ──────────────────────────────────────────────────────────────────────
const WHY_CONTENT = `You were building an order processing service. The checkout handler made three synchronous HTTP calls: one to the warehouse to reserve stock, one to analytics to record the sale, one to the fraud engine to verify the payment. On Black Friday the warehouse service started responding slowly. Your checkout handler started timing out. Orders stopped processing. You had to roll back at midnight. That situation is exactly why **Kafka** exists. Instead of making synchronous calls, your service writes one event to a **topic**. The warehouse, analytics, and fraud services each read from that topic on their own schedule. If the warehouse falls behind it drains the backlog when it recovers — but your checkout service never stalls waiting for it.

The concept sounds simple. The production reality is not. When interviewers ask about Kafka architecture the weakest answer starts and ends with a definition: "Kafka is a distributed message broker." The stronger answer ties every component to a failure mode. A **broker** is where data lives — but also where disk fills up silently when retention is misconfigured. A **partition** is the unit of parallelism — but also the reason why consumers past the partition count sit idle no matter how many pods you add. A **consumer group** enables independent scaling — but also the source of a **ConsumerCoordinatorException** when your processing logic takes longer than **max.poll.interval.ms**.

Two failure modes fool teams most often because both look like application bugs. The first is **IllegalStateException: This consumer has already been closed**. It appears after a deploy and looks like a threading problem in your service code. The real cause is almost always that your message handler takes longer than **max.poll.interval.ms**, so the broker treats your consumer as dead and kicks it out of the group. The second is **NOT_LEADER_OR_FOLLOWER**. It shows up during broker restarts and looks like a flaky network. What it actually means is that the client's cached metadata is stale — the partition leader moved and the client is still sending requests to the old leader. Both disappear when you fix a config, not the application logic.

As a Technical Lead here is the four-step pattern to reason about any Kafka question. Step one: name the component — is this a producer concern, a broker concern, or a consumer concern? Step two: describe its normal operation. Step three: name the failure mode — the exact error or metric that degrades when it is misconfigured. Step four: say how you verify it — which dashboard, which tool. When your team asks why you chose **acks=all** over **acks=1**, walk through all four steps: the broker waits for all **ISR** replicas to acknowledge; acks=1 only waits for the leader; the failure mode for acks=1 is silent data loss when the leader crashes before replication; you verify by watching **under-replicated-partitions** stay at zero in Grafana.

At Staff and Architect level the one fact that separates a strong answer from a textbook one is this: **replication.factor** and **min.insync.replicas** are independent levers, and tuning them together requires planning for your worst-case AZ failure. If you have **RF=3** and **min.insync.replicas=2** you survive one AZ going down and still accept producer writes. If you have **RF=3** and **min.insync.replicas=3**, any replica falling behind — due to GC pressure, network jitter, or a slow follower — blocks all writes. The right setting depends on your durability SLO, your AZ topology, and whether producers can afford to block or need to fail fast. The wrong setting silently erodes your durability guarantees without any error message until a broker fails.

When you join a new company this topic comes up in three specific situations. The first is the post-incident review where someone says "Kafka was slow" — you check **consumer lag per partition** and **under-replicated-partitions** before accepting that framing, because the real problem is usually a misconfigured consumer or a hot partition. The second is the architecture review where a team proposes 200 partitions for better throughput — you ask about their consumer capacity and explain that adding partitions without adding consumers leaves parallelism on the table and creates operational overhead that is hard to reverse. The third is your first week, when you ask about the **acks** setting for financial topics — if the answer is "we use the default," you know exactly which ADR to write first.`;

// ─── THEORY ───────────────────────────────────────────────────────────────────
const THEORY_CONTENT = `### Plain-language overview
Kafka is a storage system for events. An event is anything that happened: an order placed, a payment received, a user logged in. Kafka stores events as records in an append-only file called a log. Each log lives inside a partition. A broker is a server that holds partitions and answers read and write requests. When you need more capacity you split data across more partitions. When you need fault tolerance you copy each partition to multiple brokers. Consumers read at their own pace by tracking a position in the log — they do not delete records when they read them. That is the core model. Everything else is tuning.

**Interview angle:** Interviewers expect you to describe Kafka as a distributed commit log, not a queue — the distinction is that consumers track an offset rather than removing messages, which enables replay and multiple independent readers.

### What is Kafka and why does it exist
Kafka exists because HTTP calls between services create tight dependencies. When service A calls service B synchronously, A's health depends on B's health. Under load one slow service cascades into a system-wide outage. Kafka breaks that dependency. A writes an event to a topic. B reads that event at its own pace. If B is slow or crashed, A keeps running. When B recovers it picks up where it left off using stored offsets.

The original design came from LinkedIn in 2011. Engineers needed to move hundreds of millions of events per day from web servers to analytics systems without slowing the web servers. They built a durable high-throughput log. Today Kafka handles everything from payment events to IoT sensor data but the core idea is unchanged: write to a log, read from a log, let each side operate independently.

\`\`\`java
// Mental model: a topic is a file you append to
// Producers write at the end. Consumers read from a remembered position.
System.out.println("Topic: orders");
System.out.println("Partition 0: [event0, event1, event2, ...]");
System.out.println("Consumer position (offset): 2 — about to read event2");
\`\`\`

**Interview angle:** When asked "what is Kafka" the answer interviewers want is "append-only distributed log with replay" and "producers and consumers are decoupled" — not just "message broker."

### Topics, partitions, and segments in practice
A topic is a named stream of events. Kafka splits each topic into one or more partitions. Each partition is its own append-only log stored on disk. Within a partition every event gets a sequential number called an offset. Ordering is guaranteed within one partition. Across partitions there is no ordering guarantee.

A segment is a chunk of a partition's log stored as a physical file on the broker's disk. When a segment fills up Kafka starts a new one. Retention applies at the segment level — Kafka deletes whole segments when they expire, not individual records. This is why deleting a single record from Kafka is not a simple operation. You either wait for retention, use compaction with a tombstone, or seek the consumer past it.

**Interview angle:** Interviewers test whether you know ordering is per-partition not per-topic — many candidates assume Kafka guarantees global topic ordering and lose marks on this.

### How consumer groups work — what a Fresher needs to know
A consumer group is a set of consumer instances that share the work of reading a topic. Kafka assigns partitions to group members so each partition is read by exactly one member at a time. If you have 6 partitions and 3 consumers each consumer gets 2 partitions. If you have 6 partitions and 8 consumers two consumers sit idle — you can never have more active consumers than partitions in one group.

When a consumer joins or leaves the group Kafka triggers a rebalance to reassign partitions. During an eager rebalance all consumers stop fetching. This is the "stop the world" moment that causes lag spikes after deploys. The cooperative rebalance protocol (default since Kafka 3.1) lets consumers keep processing unaffected partitions while only the changing ones reassign.

**Interview angle:** The most common gap here is candidates saying "rebalance is transparent" — interviewers want you to name the lag impact and know that max.poll.interval.ms is the most common trigger.

### How brokers store and replicate data
When a producer sends a record it goes to the partition leader on one broker. The leader writes it to its local log and waits for followers to replicate before acknowledging the write if acks=all. Each follower that is caught up within replica.lag.time.max.ms is in the ISR — In-Sync Replicas. Only ISR members count for the acks=all acknowledgment.

If a leader crashes the controller promotes the highest-offset ISR member to leader. If no ISR member is available and unclean.leader.election.enable=true Kafka can promote an out-of-sync follower — but that means losing records the old leader had accepted. This is why unclean leader election is disabled for money topics.

| acks setting | What it waits for | Risk if misconfigured |
|---|---|---|
| acks=0 | Nothing — fire and forget | Silent loss on any broker issue |
| acks=1 | Leader write only | Data loss if leader crashes before followers replicate |
| acks=all | All ISR replicas write | Safe for durable topics; producer blocks until ISR ack |

**Interview angle:** Interviewers ask "what is ISR" to check whether you can connect replication lag, acks policy, and data-loss risk — the answer must mention all three to score full marks.

### Producer durability — acks, retries, and idempotency
The producer acks setting and the cluster's min.insync.replicas work together. Setting acks=all alone is not enough if min.insync.replicas=1, because then only one replica needs to ack. The safe combination for critical topics is: acks=all, min.insync.replicas=2, replication.factor=3.

Retries cause duplicate records when the broker wrote the record but the ack was lost in the network. The producer retries, writes again, and the consumer sees two copies. The idempotent producer (enable.idempotence=true) solves this by assigning a producer ID and sequence number to each batch. The broker deduplicates within a producer session.

**Interview angle:** Candidates often say "set acks=all to prevent data loss" without mentioning min.insync.replicas — interviewers at Staff level expect both settings named together with the rationale.

### Consumer offset management and delivery semantics
An offset is the position of the last record a consumer has processed in a partition. The consumer commits this offset back to Kafka stored in the __consumer_offsets internal topic. On restart the consumer fetches the committed offset and resumes from there.

At-least-once delivery: commit after processing. If the consumer crashes after processing but before committing it reprocesses on restart. Your code must be idempotent. At-most-once delivery: commit before processing. If the consumer crashes after committing but before processing the record is lost. Exactly-once delivery requires idempotent producer plus transactional consumer plus isolation.level=read_committed.

**Interview angle:** Interviewers expect you to say which delivery semantic your system uses and why — "at-least-once with idempotent handlers" is the most common correct answer for production systems.

### Common Senior Developer mistakes with Kafka
The most common mistake is setting max.poll.interval.ms without benchmarking handler runtime. If your handler calls a database that takes 8 seconds and max.poll.interval.ms is 300000ms but your database starts timing out at 10 seconds, you are one slow query away from a rebalance storm.

| Mistake | Symptom | Fix |
|---|---|---|
| max.poll.interval.ms too low | ConsumerCoordinatorException loops | Measure handler SLA; set interval >= p99 × 1.5 |
| Consumers > partitions | Some consumers always idle | Match consumer count to partition count |
| acks=1 on financial topic | Silent data loss on broker failover | Use acks=all + min.insync.replicas=2 |
| Hot partition key | One partition lags; others idle | Use high-cardinality key like entity ID |
| unclean.leader.election on | Data loss after AZ failure | Disable for all durability-critical topics |

**Interview angle:** Interviewers ask "what goes wrong with consumer groups at scale" to test whether you know the rebalance story, the partition-count ceiling, and the max.poll.interval trap — name all three.

### Choosing partition count and key strategy
Partition count is the most important architectural decision you make at topic creation because it is hard to increase and impossible to decrease without recreating the topic. It determines maximum parallelism per consumer group, number of open file handles on every broker, and replication bandwidth.

Rules of thumb: plan for 2x your expected peak consumer count and avoid more than 200 partitions per broker unless you have profiled it. For key strategy use a business entity ID as the partition key to preserve per-entity ordering. Avoid low-cardinality keys like status=PENDING or country=US — they create hot partitions.

| Key strategy | When to use | Risk |
|---|---|---|
| Entity ID (orderId) | Per-entity ordering required | Fine — good cardinality |
| Null key | Throughput only, no ordering | Round-robin, even distribution |
| Low-cardinality (status) | Avoid | Hot partitions under load |
| Composite (userId+date) | Per-user ordering with date | Complexity; ensure stable hash |

**Interview angle:** Tech Leads must explain why they chose a particular partition key and what hot-partition risk they mitigated — interviewers specifically probe this in system design rounds.

### Durability configuration for topic tiers
Not all topics need the same durability guarantees. A tiered configuration policy reduces cost while protecting critical paths.

| Tier | acks | RF | min.insync.replicas | unclean.leader.election |
|---|---|---|---|---|
| Financial / audit | all | 3 | 2 | false |
| Operational events | all | 3 | 1 | false |
| Metrics / telemetry | 1 | 2 | 1 | true |
| Dev / staging | 1 | 1 | 1 | true |

Review this table in every ADR that introduces a new topic. An SRE should be able to see which tier a topic belongs to from its configuration alone.

**Interview angle:** Tech Leads who can articulate topic tiers immediately show production experience — interviewers listen for you to distinguish financial from operational from telemetry with specific config differences.

### What to check in a Kafka code review
A code review checklist for Kafka changes: Is max.poll.interval.ms tuned to handler SLA? Is the partition key documented with cardinality reasoning? Is acks setting appropriate for this topic's durability tier? Is offset commit placed after processing, not before? Are consumers idempotent for at-least-once delivery? Is there consumer lag alerting configured for this consumer group?

For infrastructure changes: Is replication.factor consistent with AZ count? Does min.insync.replicas match the durability guarantee? Is unclean.leader.election.enable=false for critical topics?

**Interview angle:** A Tech Lead who lists specific checklist items immediately stands out — vague answers like "make sure it is configured correctly" lose points at this level.

### What happens inside the broker on every write
When a producer sends a batch to the leader, the leader appends it to the partition's active segment file. The write goes to the OS page cache first, not directly to disk. The log.flush.interval.messages and log.flush.interval.ms settings control when Kafka forces a sync to disk — the defaults rely on OS-level durability and replication for safety. This means if both leader and all followers crash simultaneously before the OS flushes, data in page cache is gone.

Followers fetch from the leader via FetchRequest RPCs. Each follower maintains a fetch offset. The leader tracks how far each follower is behind using the replica fetch lag metric. When a follower's lag exceeds replica.lag.time.max.ms it is removed from ISR. The controller watches for ISR changes and can trigger preferred-replica election to rebalance leader distribution across brokers.

**Interview angle:** Staff engineers describe the page-cache model and why Kafka does not fsync on every write — this distinguishes someone who has operated a Kafka cluster from someone who has only used the client API.

### The commands you run on-call for Kafka incidents
When paged for Kafka this is the triage sequence. First: check consumer lag per partition.

\`\`\`
kafka-consumer-groups.sh --bootstrap-server broker:9092 \\\\
  --group my-consumer-group --describe
\`\`\`

This shows LAG per partition. A hot partition shows one partition with lag in the millions while others are near zero. Second: check ISR health.

\`\`\`
kafka-topics.sh --bootstrap-server broker:9092 \\\\
  --describe --topic orders
\`\`\`

Look for "Isr:" containing fewer brokers than the replication factor — that is your under-replicated partition alarm. Third: check controller health by verifying broker-api-versions.sh responds quickly. For JVM-hosted consumers also run \`jcmd <pid> VM.flags | grep MaxGCPause\` to rule out GC pauses causing poll interval violations.

**Interview angle:** Interviewers ask "walk me through an on-call investigation" — the candidate who names kafka-consumer-groups.sh with specific flags immediately demonstrates operational experience.

### How Kafka changed across versions
Kafka 0.10 introduced consumer groups with broker-side coordinator. Kafka 0.11 introduced idempotent producers and transactions (EOS). Kafka 2.4 introduced the cooperative-sticky rebalance protocol which reduced stop-the-world rebalances significantly. Kafka 2.8 introduced KRaft mode as a preview, replacing ZooKeeper for cluster metadata. Kafka 3.3 made KRaft production-ready. Kafka 3.5 deprecated ZooKeeper mode. ZooKeeper support is fully removed in Kafka 4.0.

The KRaft migration matters for interviews because companies are actively migrating. In KRaft mode one or more brokers act as controllers using a Raft consensus log instead of ZooKeeper. This reduces operational complexity, improves metadata operation latency, and enables larger partition counts per cluster.

**Interview angle:** A Staff engineer who mentions KRaft migration, cooperative rebalance, and the version when EOS became production-ready signals real operational knowledge rather than surface familiarity.

### The architecture decision that prevents the hardest Kafka bugs
The single most impactful guardrail is a topic registry with tier classification. Every topic in production should have a documented owner, tier, partition key rationale, retention policy, consumer groups, and SLO. This prevents four classes of production incidents: wrong acks settings copied from a dev topic; hot partitions because nobody reviewed the key strategy; consumer lag storms because nobody knew who owned the consumer group; runaway storage costs because nobody signed off on retention.

Enforce topic naming conventions and configuration templates by tier in infrastructure-as-code. Reject topics without a registry entry in CI. This turns a set of undocumented knobs into a governed reviewable system.

**Interview angle:** Staff engineers describe governance patterns not just technical settings — naming a topic registry and tier-based configuration policy shows system-level ownership thinking.

### 60-second interview story
Kafka stores events in an append-only log split into partitions. A partition is the unit of parallelism — one consumer per group reads each partition. Producers write to the leader which replicates to followers called the ISR. The key production risk is mismatching max.poll.interval.ms to handler runtime — your consumer gets kicked from the group and you see rebalance storms in logs. When diagnosing an incident kafka-consumer-groups.sh shows lag per partition and kafka-topics.sh shows ISR health. At Staff level knowing that Kafka uses OS page cache for writes and relies on replication for durability — not fsync on every message — explains why RF=3 with min.insync.replicas=2 is the safe default for production.

**Interview angle:** This story arc — concept to failure mode to diagnostic command to version-specific fact — is the pattern interviewers at senior and staff levels look for in a complete Kafka answer.

### Satyverse drill — tie-down
On your machine right now: open a terminal and run kafka-consumer-groups.sh --describe for any consumer group in a local or staging environment. Look at the LAG column per partition. If any partition shows non-zero lag while another shows zero you have found an imbalanced load. Note the partition count. Count the consumer instances. Verify partition count >= consumer count. If consumers exceed partitions document which consumers are idle. This takes 5 minutes and tells you immediately whether parallelism is configured correctly for this group.

**Interview angle:** Interviewers who ask "how would you investigate consumer lag" want you to name this exact command with the --describe flag and explain what each column means.`;

// ─── CODE BASIC ───────────────────────────────────────────────────────────────
const CODE_BASIC = `package arch.day59;

public class Day59Basic {
    public static void main(String[] args) {

        // Freshers often confuse Kafka with a traditional work queue.
        // This section maps the core vocabulary so you can draw the
        // whiteboard diagram in any interview without hesitation.
        System.out.println("=== Core Kafka Vocabulary ===");
        System.out.println("Broker        : a server that stores partition logs and handles client requests");
        System.out.println("Topic         : a named stream of events — like 'orders' or 'payments'");
        System.out.println("Partition     : one slice of a topic — an ordered, append-only log on disk");
        System.out.println("Offset        : sequential position of a record within one partition");
        System.out.println("Replica       : a copy of a partition on a different broker for fault tolerance");
        System.out.println("ISR           : In-Sync Replicas — followers close enough to become leader");
        System.out.println("Leader        : the one replica that accepts all producer writes");
        System.out.println("Consumer Grp  : a set of consumers that share partition assignment");
        System.out.println();

        // Know this flow before you learn any configuration.
        // Every Kafka interview question builds on these six steps.
        System.out.println("=== How Kafka Delivers a Message (6 Steps) ===");
        System.out.println("Step 1: Producer hashes key -> picks partition -> sends to leader broker");
        System.out.println("Step 2: Leader writes record to partition log (OS page cache first)");
        System.out.println("Step 3: Followers fetch and replicate the record");
        System.out.println("Step 4: Leader sends ack to producer once ISR confirms (if acks=all)");
        System.out.println("Step 5: Consumer polls leader, reads records from last committed offset");
        System.out.println("Step 6: Consumer processes record, commits new offset back to Kafka");
        System.out.println();

        // These are the three mistakes freshers make in week one.
        // Match symptom to fix — do not guess at cause.
        System.out.println("=== Beginner Mistakes and Their Symptoms ===");
        System.out.println("Mistake : more consumers in a group than partitions");
        System.out.println("  Symptom : extra consumers sit idle — no error, no warning, no work done");
        System.out.println("  Fix     : add partitions OR reduce consumers to match partition count");
        System.out.println("Mistake : null partition key for an order topic");
        System.out.println("  Symptom : events round-robin across partitions — per-order order is lost");
        System.out.println("  Fix     : use orderId as the partition key");
        System.out.println("Mistake : committing offset before processing completes");
        System.out.println("  Symptom : crash after commit permanently loses the record");
        System.out.println("  Fix     : always commit AFTER successful processing");
        System.out.println();

        // One fact that wins Kafka interviews at every level.
        System.out.println("=== Remember This ===");
        System.out.println("Ordering in Kafka is PER PARTITION, not per topic.");
        System.out.println("To preserve order for one entity (one order, one user), use its ID as the key.");
        System.out.println("All events for the same key hash to the same partition.");
        System.out.println("That partition is read by exactly one consumer in the group at any time.");
    }
}`;

const CODE_BASIC_OUTPUT = `=== Core Kafka Vocabulary ===
Broker        : a server that stores partition logs and handles client requests
Topic         : a named stream of events — like 'orders' or 'payments'
Partition     : one slice of a topic — an ordered, append-only log on disk
Offset        : sequential position of a record within one partition
Replica       : a copy of a partition on a different broker for fault tolerance
ISR           : In-Sync Replicas — followers close enough to become leader
Leader        : the one replica that accepts all producer writes
Consumer Grp  : a set of consumers that share partition assignment

=== How Kafka Delivers a Message (6 Steps) ===
Step 1: Producer hashes key -> picks partition -> sends to leader broker
Step 2: Leader writes record to partition log (OS page cache first)
Step 3: Followers fetch and replicate the record
Step 4: Leader sends ack to producer once ISR confirms (if acks=all)
Step 5: Consumer polls leader, reads records from last committed offset
Step 6: Consumer processes record, commits new offset back to Kafka

=== Beginner Mistakes and Their Symptoms ===
Mistake : more consumers in a group than partitions
  Symptom : extra consumers sit idle — no error, no warning, no work done
  Fix     : add partitions OR reduce consumers to match partition count
Mistake : null partition key for an order topic
  Symptom : events round-robin across partitions — per-order order is lost
  Fix     : use orderId as the partition key
Mistake : committing offset before processing completes
  Symptom : crash after commit permanently loses the record
  Fix     : always commit AFTER successful processing

=== Remember This ===
Ordering in Kafka is PER PARTITION, not per topic.
To preserve order for one entity (one order, one user), use its ID as the key.
All events for the same key hash to the same partition.
That partition is read by exactly one consumer in the group at any time.`;

// ─── CODE INTERMEDIATE ────────────────────────────────────────────────────────
const CODE_INTERMEDIATE = `package arch.day59;

// Senior Developers hit these four problems in real Kafka work.
// Each scenario names the symptom, the Kafka root cause, and the exact fix.
// These are not toy examples — they come from production post-mortems.

public class Day59Intermediate {

    // Scenario 1: The first mistake a Senior Dev makes writing a Kafka consumer
    static void scenario1() {
        System.out.println("--- Scenario 1: max.poll.interval.ms shorter than handler runtime ---");
        System.out.println("symptom : Consumer leaves the group every few minutes; lag spikes after deploys");
        System.out.println("cause   : Message handler calls a database that sometimes takes 8s;");
        System.out.println("          max.poll.interval.ms was never tuned from its 300000ms default");
        System.out.println("why     : When poll() is not called within max.poll.interval.ms the broker");
        System.out.println("          treats the consumer as dead, removes it, and rebalances the group");
        System.out.println("fix     : Measure p99 handler time; set max.poll.interval.ms = p99 * 1.5");
        System.out.println("          e.g. p99=8s -> set max.poll.interval.ms=15000");
        System.out.println("verify  : kafka-consumer-groups.sh --describe; watch rebalance generation stop climbing");
        System.out.println("next    : Always ensure session.timeout.ms < max.poll.interval.ms");
        System.out.println();
    }

    // Scenario 2: A production bug that was hard to trace back to key design
    static void scenario2() {
        System.out.println("--- Scenario 2: Hot partition from low-cardinality key ---");
        System.out.println("symptom : One consumer processes 10x more records than peers; lag grows on p3 only");
        System.out.println("cause   : Partition key is customer tier (GOLD, SILVER, BASIC);");
        System.out.println("          90% of orders are BASIC so partition 3 receives 90% of all traffic");
        System.out.println("why     : Key-based partitioning hashes the key modulo partition count;");
        System.out.println("          a low-cardinality key creates massively unequal partition sizes");
        System.out.println("fix     : Change partition key to orderId (high cardinality) for even distribution");
        System.out.println("verify  : kafka-consumer-groups.sh --describe: all partition LAG values should be similar");
        System.out.println("next    : Add per-partition lag alerting to catch skew early in the next release");
        System.out.println();
    }

    // Scenario 3: Duplicate processing from auto-commit misuse
    static void scenario3() {
        System.out.println("--- Scenario 3: Duplicate payment processing from early offset commit ---");
        System.out.println("symptom : Payment events processed twice; bank account debited twice on retry");
        System.out.println("cause   : auto.commit.enable=true with 5-second interval;");
        System.out.println("          consumer crashed after auto-commit but before database write completed");
        System.out.println("why     : At-least-once delivery reprocesses records after any crash between");
        System.out.println("          commit and processing; auto-commit does not know when processing ends");
        System.out.println("fix     : Disable auto-commit; call consumer.commitSync() after database write");
        System.out.println("verify  : Inject crash after commit-before-process; confirm record reprocessed");
        System.out.println("next    : Add idempotency key to database schema to handle residual duplicates");
        System.out.println();
    }

    // Scenario 4: Architecture mistake — adding consumers beyond partition count
    static void scenario4() {
        System.out.println("--- Scenario 4: Adding consumers beyond partition count expecting linear speedup ---");
        System.out.println("symptom : Team scales to 12 consumers for a 6-partition topic; lag unchanged");
        System.out.println("cause   : Kafka assigns each partition to exactly one consumer in a group;");
        System.out.println("          6 consumers work, 6 consumers sit idle with no partition assignment");
        System.out.println("why     : Parallelism ceiling = partition count; extra consumers are warm standbys");
        System.out.println("fix     : Option A: increase partition count to 12 (requires topic recreation)");
        System.out.println("          Option B: keep 6 consumers; investigate why processing is slow per record");
        System.out.println("verify  : kafka-consumer-groups.sh --describe: PARTITION column covers 0..5 only");
        System.out.println("next    : Document partition count ceiling in ADR; flag at architecture review");
        System.out.println();
    }

    public static void main(String[] args) {
        scenario1();
        scenario2();
        scenario3();
        scenario4();
    }
}`;

const CODE_INTERMEDIATE_OUTPUT = `--- Scenario 1: max.poll.interval.ms shorter than handler runtime ---
symptom : Consumer leaves the group every few minutes; lag spikes after deploys
cause   : Message handler calls a database that sometimes takes 8s;
          max.poll.interval.ms was never tuned from its 300000ms default
why     : When poll() is not called within max.poll.interval.ms the broker
          treats the consumer as dead, removes it, and rebalances the group
fix     : Measure p99 handler time; set max.poll.interval.ms = p99 * 1.5
          e.g. p99=8s -> set max.poll.interval.ms=15000
verify  : kafka-consumer-groups.sh --describe; watch rebalance generation stop climbing
next    : Always ensure session.timeout.ms < max.poll.interval.ms

--- Scenario 2: Hot partition from low-cardinality key ---
symptom : One consumer processes 10x more records than peers; lag grows on p3 only
cause   : Partition key is customer tier (GOLD, SILVER, BASIC);
          90% of orders are BASIC so partition 3 receives 90% of all traffic
why     : Key-based partitioning hashes the key modulo partition count;
          a low-cardinality key creates massively unequal partition sizes
fix     : Change partition key to orderId (high cardinality) for even distribution
verify  : kafka-consumer-groups.sh --describe: all partition LAG values should be similar
next    : Add per-partition lag alerting to catch skew early in the next release

--- Scenario 3: Duplicate payment processing from early offset commit ---
symptom : Payment events processed twice; bank account debited twice on retry
cause   : auto.commit.enable=true with 5-second interval;
          consumer crashed after auto-commit but before database write completed
why     : At-least-once delivery reprocesses records after any crash between
          commit and processing; auto-commit does not know when processing ends
fix     : Disable auto-commit; call consumer.commitSync() after database write
verify  : Inject crash after commit-before-process; confirm record reprocessed
next    : Add idempotency key to database schema to handle residual duplicates

--- Scenario 4: Adding consumers beyond partition count expecting linear speedup ---
symptom : Team scales to 12 consumers for a 6-partition topic; lag unchanged
cause   : Kafka assigns each partition to exactly one consumer in a group;
          6 consumers work, 6 consumers sit idle with no partition assignment
why     : Parallelism ceiling = partition count; extra consumers are warm standbys
fix     : Option A: increase partition count to 12 (requires topic recreation)
          Option B: keep 6 consumers; investigate why processing is slow per record
verify  : kafka-consumer-groups.sh --describe: PARTITION column covers 0..5 only
next    : Document partition count ceiling in ADR; flag at architecture review`;

// ─── CODE ADVANCED ────────────────────────────────────────────────────────────
const CODE_ADVANCED = `package arch.day59;

import java.util.*;

// Tech Lead and Staff engineers think about Kafka as a set of trade-off models.
// This program shows a durability tier decision matrix and an on-call triage
// table — the kind of reasoning that distinguishes an architect from someone
// who has only read the documentation.

public class Day59Advanced {

    record TopicConfig(String tier, String acks, int rf, int minIsr, boolean uncleanLeader) {}
    record IncidentSignal(String metric, String value, String interpretation) {}

    public static void main(String[] args) {

        // Block 1: Build the durability tier model.
        // Each tier represents a class of topic with different SLO requirements.
        // The config choices flow from the durability SLO, not from preference.
        System.out.println("=== Block 1: Topic Durability Tier Model ===");
        List<TopicConfig> tiers = List.of(
            new TopicConfig("financial",   "all", 3, 2, false),
            new TopicConfig("operational", "all", 3, 1, false),
            new TopicConfig("telemetry",   "1",   2, 1, true),
            new TopicConfig("dev-staging", "1",   1, 1, true)
        );
        System.out.printf("%-14s %-6s %-4s %-8s %s%n",
            "Tier", "acks", "RF", "minISR", "uncleanLeader");
        System.out.println("-".repeat(50));
        for (TopicConfig t : tiers) {
            System.out.printf("%-14s %-6s %-4d %-8d %s%n",
                t.tier(), t.acks(), t.rf(), t.minIsr(),
                t.uncleanLeader() ? "ENABLED (risky)" : "disabled (safe)");
        }
        System.out.println();

        // Block 2: Apply the decision — select tier for a new payment topic.
        // This mirrors what a Tech Lead does during an ADR review.
        // Each flag eliminates lower tiers until only one remains.
        System.out.println("=== Block 2: Tier Selection for payment.captured Topic ===");
        boolean financialData         = true;
        boolean canAffordProducerBlock = true;
        boolean azRedundancyRequired  = true;

        String selectedTier;
        if (financialData && canAffordProducerBlock && azRedundancyRequired) {
            selectedTier = "financial";
        } else if (financialData) {
            selectedTier = "operational";
        } else {
            selectedTier = "telemetry";
        }
        TopicConfig chosen = tiers.stream()
            .filter(t -> t.tier().equals(selectedTier)).findFirst().orElseThrow();

        System.out.println("Topic         : payment.captured");
        System.out.println("Selected tier : " + chosen.tier());
        System.out.println("acks          : " + chosen.acks() + "  <- waits for all ISR replicas");
        System.out.println("RF            : " + chosen.rf() + "   <- survives 1 AZ loss");
        System.out.println("min.insync    : " + chosen.minIsr() + "   <- writable if 1 replica falls behind");
        System.out.println("unclean elect : " + chosen.uncleanLeader() + " <- NEVER allow non-ISR leader for money");
        System.out.println();

        // Block 3: On-call triage signal table.
        // When paged for Kafka these signals tell you where to look first.
        // A Staff engineer opens this mental model before diving into logs.
        System.out.println("=== Block 3: On-Call Triage Signal Table ===");
        List<IncidentSignal> signals = List.of(
            new IncidentSignal("consumer lag rising",         "all partitions",  "slow consumer or burst — check handler SLA"),
            new IncidentSignal("consumer lag rising",         "1 partition only","hot partition — check key cardinality"),
            new IncidentSignal("under-replicated partitions", "> 0",             "ISR shrink — check broker GC or disk"),
            new IncidentSignal("rebalance rate",              "elevated",        "poll interval exceeded — check handler time"),
            new IncidentSignal("NOT_LEADER_OR_FOLLOWER",      "producer logs",   "stale metadata — broker restart in progress"),
            new IncidentSignal("producer request latency",    "p99 spike",       "ISR-wait — check min.insync.replicas vs live ISR")
        );
        System.out.printf("%-34s %-18s %s%n", "Metric", "Value", "First action");
        System.out.println("-".repeat(88));
        for (IncidentSignal s : signals) {
            System.out.printf("%-34s %-18s %s%n", s.metric(), s.value(), s.interpretation());
        }
    }
}`;

const CODE_ADVANCED_OUTPUT = `=== Block 1: Topic Durability Tier Model ===
Tier           acks   RF   minISR   uncleanLeader
--------------------------------------------------
financial      all    3    2        disabled (safe)
operational    all    3    1        disabled (safe)
telemetry      1      2    1        ENABLED (risky)
dev-staging    1      1    1        ENABLED (risky)

=== Block 2: Tier Selection for payment.captured Topic ===
Topic         : payment.captured
Selected tier : financial
acks          : all  <- waits for all ISR replicas
RF            : 3   <- survives 1 AZ loss
min.insync    : 2   <- writable if 1 replica falls behind
unclean elect : false <- NEVER allow non-ISR leader for money

=== Block 3: On-Call Triage Signal Table ===
Metric                             Value              First action
----------------------------------------------------------------------------------------
consumer lag rising                all partitions     slow consumer or burst — check handler SLA
consumer lag rising                1 partition only   hot partition — check key cardinality
under-replicated partitions        > 0                ISR shrink — check broker GC or disk
rebalance rate                     elevated           poll interval exceeded — check handler time
NOT_LEADER_OR_FOLLOWER             producer logs      stale metadata — broker restart in progress
producer request latency           p99 spike          ISR-wait — check min.insync.replicas vs live ISR`;

// ─── PITFALLS ─────────────────────────────────────────────────────────────────
const PITFALLS = [
  // Fresher 1
  "Using null as the Kafka partition key when per-order ordering is required — records round-robin across all partitions so events for the same order arrive out of sequence on different consumers; fix it by passing orderId as the key so Kafka hashes it to a consistent partition; verify by running **kafka-console-consumer** with **--partition** flag and confirming all records for one orderId arrive from the same partition.",
  // Fresher 2
  "Assuming you can add consumers beyond partition count to increase throughput — the extra consumers sit idle and receive no partition assignment, producing no errors and no log messages to explain why processing did not speed up; fix it by checking partition count with **kafka-topics.sh --describe** and matching consumer count to partition count; verify with **kafka-consumer-groups.sh --describe** and confirm every consumer has at least one PARTITION listed.",
  // Senior Dev 1
  "Setting **auto.commit.enable=true** and relying on the 5-second auto-commit interval for a consumer that calls a slow external service — the offset commits while the external call is still in-flight; if the consumer crashes the offset is already committed and the record is silently dropped; disable auto-commit and call **commitSync()** explicitly after your external service call returns; verify by writing a test that injects a crash between processing and commit and confirming the record is reprocessed.",
  // Senior Dev 2
  "Using a low-cardinality value like payment status (PENDING, COMPLETED, FAILED) as the partition key on a high-volume topic — 80% of records hash to the same two partitions because most payments are PENDING; one consumer gets overwhelmed while others sit idle; rewrite to use paymentId as the key and document the cardinality rationale in the ADR; verify with **kafka-consumer-groups.sh --describe** and confirm lag is spread evenly across partitions.",
  // Tech Lead 1
  "Setting **replication.factor=3** without also setting **min.insync.replicas=2** for financial topics — with the default min.insync.replicas=1, acks=all only needs one replica to ack, giving false confidence in your durability guarantee; a single surviving broker is enough for the write to succeed but if that broker also fails the record is lost; enforce both settings together in your topic creation template and reject deviations in CI; verify with **kafka-topics.sh --describe** and confirm both values match your tier policy.",
  // Tech Lead 2
  "Choosing partition count based on current load without planning for growth — partition count cannot be decreased and increasing it requires migrating consumers and accepting that ordered processing breaks during the transition because new partitions initially receive no historical data; size for 2–3x expected peak traffic from day one and document the rationale in your ADR; verify in load testing that your chosen count handles target TPS without any single partition becoming a bottleneck.",
  // Staff 1
  "Enabling **unclean.leader.election.enable=true** on a topic that accumulates financial events — when an AZ fails and the leader broker goes down before followers fully replicate, Kafka promotes an out-of-sync follower and silently truncates uncommitted records from the old leader; no exception is thrown, no DLQ receives the lost records, and reconciliation may not catch the gap for hours; disable it for all financial topics and validate with **kafka-topics.sh --describe**; verify by running a game day that kills the leader with ISR size reduced to one and confirming producer errors appear rather than silent data loss.",
  // Staff 2
  "Setting **-Xmx** without tuning GC pause targets on a consumer JVM running in a Kubernetes pod with a 4GB memory limit — G1GC defaults target 200ms pauses which fits inside most session.timeout.ms values, but under bursty workloads a full GC pause of 600–800ms can exceed session.timeout.ms and trigger a rebalance storm; add **-XX:MaxGCPauseMillis=100** and set **-Xms** equal to **-Xmx** to avoid heap growth pauses; verify with **jcmd <pid> GC.heap_info** after load testing and confirm GC pauses stay below session.timeout.ms divided by three."
];

// ─── EXERCISE ─────────────────────────────────────────────────────────────────
const EXERCISE_FRESHER = {
  type: "exercise",
  title: "Exercise — Kafka Architecture — Fresher: vocabulary and delivery model",
  difficulty: "Beginner",
  level: "Fresher",
  problem: "You are exploring Kafka for the first time and want to lock in the core mental model before the interview. 1. Print a table with four Kafka components (broker, topic, partition, consumer group) and one sentence describing each. 2. Print the three acks values (0, 1, all) with the durability trade-off for each on one line. 3. Print what happens to ordering when a producer sends records with a null key. 4. Print the config name that controls how long a consumer can pause between poll() calls and the consequence of exceeding it.",
  hints: [
    "Use System.out.println for each row — format with a consistent column width using spaces.",
    "For acks, write the value first then a colon then the trade-off in plain English — no jargon.",
    "For null key and ordering, think about what round-robin means when two events belong to the same order."
  ],
  solution: `package arch.day59;

public class Day59FresherExercise {
    public static void main(String[] args) {

        // Part 1: Core component table — one row per Kafka building block.
        // Reading this table should let you draw a Kafka architecture diagram.
        System.out.println("=== Kafka Core Components ===");
        System.out.println("Broker        : a server that stores partition log files and handles client I/O");
        System.out.println("Topic         : a named stream of events split across one or more partitions");
        System.out.println("Partition     : an ordered, append-only log — the unit of parallelism");
        System.out.println("Consumer Grp  : a set of consumers sharing partition assignment; max 1 per partition");
        System.out.println();

        // Part 2: The three acks values and their durability trade-offs.
        // This is tested in almost every Kafka interview at Senior level and above.
        System.out.println("=== Producer acks Values ===");
        System.out.println("acks=0   : fire and forget — no durability; records lost on any broker issue");
        System.out.println("acks=1   : leader only — fast; silent loss if leader crashes before followers replicate");
        System.out.println("acks=all : waits for all ISR replicas — safe for financial topics; adds producer latency");
        System.out.println();

        // Part 3: What happens to ordering when key is null.
        // Many freshers set key=null and wonder why order events arrive out of sequence.
        System.out.println("=== Null Key and Ordering ===");
        System.out.println("When key is null: records round-robin across all partitions (sticky batch per send)");
        System.out.println("Two events for the same order can land on DIFFERENT partitions");
        System.out.println("Different partitions are read by DIFFERENT consumers in the group");
        System.out.println("Result: per-order ordering is broken — event2 may be processed before event1");
        System.out.println("Fix: use orderId as the key so all events for one order go to the same partition");
        System.out.println();

        // Part 4: The config that controls how long between poll() calls.
        // Getting this wrong causes the most common rebalance storm in production.
        System.out.println("=== max.poll.interval.ms ===");
        System.out.println("Config  : max.poll.interval.ms");
        System.out.println("Default : 300000 ms (5 minutes)");
        System.out.println("Meaning : max time the consumer can go without calling poll()");
        System.out.println("Exceeded: broker removes consumer from group and triggers a rebalance");
        System.out.println("Fix     : set this to at least 1.5x your p99 message handler runtime");
    }
}`
};

const EXERCISE_STAFF = {
  type: "exercise",
  title: "Exercise — Kafka Architecture — Staff: consumer group triage and durability design",
  difficulty: "Advanced",
  level: "Staff / Architect",
  problem: "Your payment processing service uses a Kafka consumer group with 4 consumers reading a topic with 12 partitions. After a deploy that added a slow external credit-check API call to the message handler, you start seeing consumer group rebalances every 3–4 minutes. Payments are still being processed correctly but lag is growing. 1. Identify the root cause configuration mismatch given p99 handler time is now 8 seconds. 2. Print the safe max.poll.interval.ms value for this handler. 3. Show what partition assignment looks like for 4 consumers across 12 partitions and explain whether 4 is enough. 4. Print the kafka-consumer-groups.sh command that confirms rebalance generation has stabilized. 5. Design a triage decision table that maps the five most common consumer lag patterns to their root cause and first action.",
  hints: [
    "For max.poll.interval.ms: the rule is p99 handler time × 1.5, rounded up to the nearest second.",
    "For partition assignment: 12 partitions / 4 consumers = 3 partitions each — use java.util.List to model this.",
    "For the triage table: think about what lag looks like on all partitions vs one partition vs growing vs flat."
  ],
  solution: `package arch.day59;

import java.util.*;

public class Day59StaffExercise {

    // Staff-level thinking: model the partition assignment and triage table
    // as deterministic data structures rather than narrative text.
    // This forces precision and makes the reasoning reviewable.

    record Assignment(String consumer, List<Integer> partitions) {}
    record TriageEntry(String lagPattern, String rootCause, String firstAction) {}

    public static void main(String[] args) {

        // Part 1: Root cause identification.
        // The p99 handler time (8s) exceeds the default max.poll.interval.ms
        // under load when the credit-check API has occasional 10s responses.
        // Even though the default is 300s, in practice slow outliers trigger it.
        System.out.println("=== Root Cause ===");
        int p99HandlerMs = 8000;
        int defaultPollInterval = 300000;
        System.out.println("p99 handler time    : " + p99HandlerMs + " ms");
        System.out.println("max.poll.interval.ms: " + defaultPollInterval + " ms (default — never tuned)");
        System.out.println("Root cause          : handler time not benchmarked; rebalance fires when DB is slow");
        System.out.println();

        // Part 2: Calculate safe max.poll.interval.ms value.
        // Rule: p99 handler time * 1.5, minimum 30000ms above the handler.
        // This gives breathing room for occasional slow calls.
        System.out.println("=== Safe max.poll.interval.ms Calculation ===");
        int safeInterval = (int)(p99HandlerMs * 1.5);
        System.out.println("Formula             : p99 * 1.5 = " + p99HandlerMs + " * 1.5 = " + safeInterval + " ms");
        System.out.println("Set in consumer cfg : max.poll.interval.ms=" + safeInterval);
        System.out.println("Also set            : session.timeout.ms < " + safeInterval + " (e.g. 10000ms)");
        System.out.println();

        // Part 3: Partition assignment model.
        // 12 partitions / 4 consumers = 3 partitions each.
        // 4 consumers is sufficient for 12 partitions — no idle consumers.
        System.out.println("=== Partition Assignment: 4 Consumers, 12 Partitions ===");
        int partitionCount = 12;
        List<String> consumers = List.of("consumer-0", "consumer-1", "consumer-2", "consumer-3");
        Map<String, List<Integer>> assignment = new LinkedHashMap<>();
        for (String c : consumers) assignment.put(c, new ArrayList<>());
        for (int p = 0; p < partitionCount; p++) {
            assignment.get(consumers.get(p % consumers.size())).add(p);
        }
        for (Map.Entry<String, List<Integer>> e : assignment.entrySet()) {
            System.out.println(e.getKey() + " -> partitions " + e.getValue());
        }
        System.out.println("Verdict: 4 consumers is correct for 12 partitions — all consumers active");
        System.out.println();

        // Part 4: The command that confirms rebalance generation has stabilized.
        // The CONSUMER-ID column shows generation; it should not change between runs.
        System.out.println("=== Verification Command ===");
        System.out.println("kafka-consumer-groups.sh --bootstrap-server broker:9092 \\");
        System.out.println("  --group payment-consumer-group --describe");
        System.out.println("Watch: CONSUMER-ID column — stable across two runs means no rebalance");
        System.out.println("Watch: LAG column — should drain toward zero after the fix");
        System.out.println();

        // Part 5: Triage decision table.
        // These five patterns cover 90% of Kafka on-call scenarios.
        // Knowing this table lets you narrow root cause in under 2 minutes.
        System.out.println("=== Consumer Lag Triage Table ===");
        List<TriageEntry> triage = List.of(
            new TriageEntry("Lag rising on ALL partitions",    "slow handler or traffic burst",      "measure p99 handler; check max.poll.interval.ms"),
            new TriageEntry("Lag on ONE partition only",       "hot partition (key skew)",            "check key cardinality; redistribute with entity ID"),
            new TriageEntry("Lag spikes after every deploy",   "rebalance storm from poll timeout",   "tune max.poll.interval.ms; switch to cooperative rebalance"),
            new TriageEntry("Lag flat but non-zero",           "consumer count < partition count",    "add consumers OR reduce partitions to match"),
            new TriageEntry("Lag grows then resets repeatedly","consumer crashing and rejoining",     "check DLQ; look for poison message blocking one partition")
        );
        System.out.printf("%-36s %-34s %s%n", "Lag Pattern", "Root Cause", "First Action");
        System.out.println("-".repeat(100));
        for (TriageEntry t : triage) {
            System.out.printf("%-36s %-34s %s%n", t.lagPattern(), t.rootCause(), t.firstAction());
        }
    }
}`
};

// ─── INTERVIEW — fix conceptual answer word counts and add jobSwitch ──────────
const JOB_SWITCH = {
  resumeBullet: "Redesigned Kafka partition key strategy for payment topic from low-cardinality status field to paymentId, eliminating hot partitions and reducing p99 consumer lag by 78%.",
  interviewPositioning: "When I join a new team I always look at the acks and min.insync.replicas settings for financial topics in the first week — these two settings together determine your actual durability guarantee and they are frequently set to defaults that do not match the stated SLO. I also check whether max.poll.interval.ms has been tuned against measured handler latency, because the default causes silent rebalance storms when processing gets even slightly slower under load. I document both findings in a Kafka Architecture Decision Record so the team has a shared baseline going forward.",
  starAnchor: "Our payment service started experiencing silent message loss during AZ failover events — roughly 12 records lost per incident, discovered only through reconciliation. I traced the issue to unclean.leader.election being enabled on the payment topic combined with replication.factor=2, which meant a single broker failure with a lagging follower could elect an out-of-sync replica. I changed replication factor to 3, set min.insync.replicas=2, and disabled unclean leader election across all financial topics. We ran a game day to validate recovery without data loss. In eight months of production operation after the change we had zero reconciliation discrepancies and the on-call team stopped getting paged for Kafka incidents."
};

// Rewrite conceptual answers to meet 120-word minimum
const CONCEPTUAL_ANSWERS = {
  "What is a **Kafka broker** and **cluster** role?": "A **broker** is a server in the Kafka cluster that stores partition log files and handles all producer and consumer requests. A **cluster** is a group of brokers that collectively own all partitions across all topics. One broker acts as the **controller** at any time — it tracks partition leadership, manages ISR membership, and coordinates failover when a broker goes down. In production the most important broker metric is **under-replicated-partitions**: when this is above zero it means at least one partition has fewer in-sync replicas than its replication factor, and your durability guarantee is weakened. You verify cluster health by running **kafka-broker-api-versions.sh** — if it hangs or errors, the controller is unreachable. Since Kafka 3.3, KRaft mode replaces ZooKeeper for controller metadata, making controller failover faster and removing the external dependency entirely.",
  "Why **partition** a **topic**?": "A **partition** is the unit of parallelism and storage in Kafka. Without partitions, only one consumer could process a topic's events at a time. With 12 partitions you can have up to 12 consumers working in parallel within one consumer group. Partitions also let you spread storage across multiple brokers — each broker holds only a subset of all partitions. The trade-off is that ordering is only guaranteed within one partition, not across a topic. This matters in production: if you use a null key, records round-robin across partitions and events for the same entity can arrive out of order. You verify partition health with **kafka-topics.sh --describe** and check that the ISR column matches the replication factor. Partition count was immutable before Kafka 1.0 and remains difficult to change safely today.",
  "How does **key-based partitioning** work?": "By default the **partitioner** computes a **murmur2** hash of the serialized key bytes and takes the result modulo the partition count to select a partition. The same key always maps to the same partition as long as the partition count does not change. This is how Kafka preserves per-entity ordering: all events for orderId=123 always go to partition 4, and one consumer in your group always reads partition 4. The production risk is using a low-cardinality key like order status — if 90% of records have status=PENDING they all hash to the same two partitions and you get a hot partition. To diagnose hot partitions run **kafka-consumer-groups.sh --describe** and look for one partition with lag in the millions while others show zero. Java's **Math.floorMod(key.hashCode(), numPartitions)** is a teaching toy — real clients use murmur2, not Java hashCode.",
  "What is the **controller** broker?": "The **controller** is one broker that handles all cluster metadata operations: it runs leader elections when a broker fails, maintains the ISR list for every partition, propagates partition metadata to all other brokers, and processes topic creation and deletion. There is exactly one active controller at a time. Loss of the controller triggers a fast re-election — in ZooKeeper mode another broker races to acquire the controller lock in ZooKeeper; in **KRaft** mode the election runs via Raft consensus and is typically faster. A slow controller shows up as elevated **ActiveControllerCount** metric equal to zero before re-election and high **UncleanLeaderElectionsPerSec** during broker failures. If controller operations are queuing you see **ControllerQueueSize** growing in JMX. KRaft became production-ready in Kafka 3.3, removing ZooKeeper entirely.",
  "What is **ISR**?": "**ISR** stands for In-Sync Replicas. It is the set of partition replicas that are sufficiently caught up with the leader to be eligible for promotion if the leader fails. A follower is in ISR as long as it has fetched from the leader within the last **replica.lag.time.max.ms** milliseconds (default 30s). When a follower falls behind — due to GC pause, disk pressure, or network jitter — it is removed from ISR. When acks=all the producer waits for all current ISR members to acknowledge the write. If ISR shrinks to one, acks=all effectively becomes acks=1. The metric to watch is **UnderReplicatedPartitions** in JMX or Grafana. When this goes above zero you have a durability risk even if the cluster is accepting writes. You verify ISR size per partition with **kafka-topics.sh --describe** and look at the Isr: field.",
  "What is **replication.factor** vs **min.insync.replicas**?": "**replication.factor** is the number of copies Kafka maintains for each partition — three copies means the log lives on three different brokers. This is set at topic creation and controls how many broker failures you can survive without data loss. **min.insync.replicas** is a write gate — it says how many replicas must have acknowledged a write before the producer considers it durable. These two settings work together: RF=3 means you have three copies; min.insync.replicas=2 means at least two must confirm the write. The production danger is setting RF=3 and leaving min.insync.replicas=1: acks=all only waits for one replica, which gives a false sense of safety. The safe combination for financial topics is RF=3, min.insync.replicas=2, acks=all. Verify both with **kafka-topics.sh --describe** and compare against your topic tier policy.",
  "Why avoid **hot partitions**?": "A **hot partition** happens when one partition receives a disproportionate share of all records because the partition key has low cardinality. For example, if you use payment status as the key and 80% of payments are PENDING, 80% of all records hash to the same one or two partitions. The consumer assigned to that partition processes ten times more work than any other consumer in the group. The hot partition becomes a storage bottleneck — its log grows faster, its follower replication falls behind, and its consumer lag grows while other partitions stay near zero. In production you discover it with **kafka-consumer-groups.sh --describe** — one partition shows lag in the millions while others show near zero. The fix is always a key redesign: use the entity ID (paymentId, orderId) which has high cardinality and distributes evenly across partitions.",
  "What is a **consumer group**?": "A **consumer group** is a named set of consumer instances that cooperate to process a topic. Kafka distributes partitions across group members so each partition is handled by exactly one member at any time. If you have 8 partitions and 4 consumers each consumer gets 2 partitions. If you add a 9th consumer it sits idle — there is no 9th partition to assign. When any member joins or leaves, the group coordinator triggers a **rebalance** to redistribute partitions. During an eager rebalance all consumers pause processing — this is the stop-the-world moment that causes lag spikes after deploys. The **cooperative rebalance protocol** (available since Kafka 2.4, default in 3.1) minimises disruption by only reassigning the changing partitions. You monitor group health with **kafka-consumer-groups.sh --describe** and watch the LAG and CONSUMER-ID columns.",
  "What happens on **consumer crash**?": "When a consumer crashes the **group coordinator** detects the absence of heartbeats within session.timeout.ms and removes the member from the group. This triggers a rebalance: the partitions that were assigned to the crashed consumer are redistributed to the surviving members. Any records that were fetched but not yet committed by the crashed consumer will be redelivered to the new assignee — this is the at-least-once delivery guarantee in action. The surviving consumers may see a lag spike immediately after the rebalance while they drain the backlog. If the crash happens repeatedly — for example due to a poison message — you see repeated rebalances in logs and growing lag on specific partitions. You diagnose this with **kafka-consumer-groups.sh --describe** and look for CONSUMER-ID values changing frequently between runs.",
  "What are **offsets**?": "An **offset** is a monotonically increasing integer that identifies the position of one record within one partition. The first record in a partition has offset 0, the second has offset 1, and so on. When a consumer reads records it tracks the offset of the last record it has processed. It periodically commits this offset back to Kafka, which stores it in the internal **__consumer_offsets** topic. On restart the consumer fetches its last committed offset and resumes from there. The consumer lag metric is computed as the difference between the partition's high-water mark (the latest produced offset) and the consumer's committed offset. A large lag means the consumer is behind. You commit offsets manually by calling **commitSync()** or **commitAsync()** after processing, or automatically if auto.commit is enabled. Auto-commit commits on a timer, not on processing completion, which creates at-most-once risk.",
  "Difference **log retention** and **compaction**?": "**Log retention** deletes old records based on time or size. When a segment reaches the retention age (log.retention.hours, default 7 days) or when total topic size exceeds log.retention.bytes, Kafka deletes whole segments. This means older records disappear and a consumer that falls too far behind may find its committed offset pointing to a deleted segment, causing **OffsetOutOfRangeException**. **Log compaction** keeps only the latest value per key. When two records have the same key, compaction deletes the older one and keeps the newer. Compaction is used for changelog topics where you want to recover the latest state of every entity rather than replay the full history. You delete a key by writing a tombstone — a record with that key and a null value. The two modes can be combined: cleanup.policy=compact,delete applies both.",
  "What is **ZooKeeper** vs **KRaft**?": "Before Kafka 2.8, **ZooKeeper** was a required external service that stored cluster metadata: controller election, broker registrations, topic configurations, and partition assignments. ZooKeeper added operational complexity — you had to run and monitor a separate distributed system alongside Kafka. **KRaft** (Kafka Raft) replaces ZooKeeper by embedding the metadata store directly into Kafka brokers using the Raft consensus algorithm. KRaft became production-ready in Kafka 3.3. ZooKeeper mode was deprecated in Kafka 3.5. It is fully removed in Kafka 4.0. The practical benefits are: faster controller failover (metadata is local), ability to scale to millions of partitions, and removal of the ZooKeeper operational burden. For interviews, know that companies are actively migrating and that the migration is one-way — KRaft clusters cannot roll back to ZooKeeper mode.",
  "Why **rack awareness**?": "**Rack awareness** tells Kafka how brokers are distributed across physical racks or availability zones. When creating a topic, Kafka uses this information to spread replicas so that no two replicas of the same partition live in the same rack. Without rack awareness, all three replicas of a partition might land on brokers in the same AZ. If that AZ goes offline, all three replicas become unavailable simultaneously and the partition is lost regardless of replication factor. With rack awareness and RF=3 across three AZs, one AZ failure leaves two replicas available — the ISR still has a quorum and writes continue. You configure rack awareness with the **broker.rack** property on each broker. Verify the placement with **kafka-topics.sh --describe** and confirm replicas are spread across distinct rack values. This is a mandatory setting for any Kafka cluster that spans multiple AZs.",
  "What is **unclean leader election**?": "**Unclean leader election** means promoting a replica that is NOT in the ISR to be the new partition leader. This happens when the current leader fails and all ISR members are also unavailable — for example during an AZ outage that takes down both the leader and all in-sync followers. Enabling it preserves availability: the partition stays writable. Disabling it preserves durability: the partition becomes unavailable until an ISR member recovers. For financial or audit topics the right choice is always **unclean.leader.election.enable=false** — silent data loss is worse than a brief write outage. You verify the setting with **kafka-topics.sh --describe** and look for the UncleanLeaderElectionsPerSec metric in JMX during game days. A non-zero value means data loss has already occurred.",
  "How do **metadata** requests affect clients?": "**Kafka clients** — both producers and consumers — cache topic and partition metadata: which broker is the leader for each partition, which partitions exist, and how many partitions the topic has. This cache is refreshed periodically and also on error. When a leader moves — due to a broker restart, a rebalance, or a preferred replica election — the client's cache becomes stale. The next request to the old leader returns **NOT_LEADER_OR_FOLLOWER**. The client then refreshes metadata and retries to the new leader. If the cluster is undergoing many leader movements simultaneously — for example during a rolling restart — clients can trigger a flood of metadata refresh requests that overwhelms the controller. This is a metadata storm. You diagnose it by watching **RequestsPerSec** on the controller broker and looking for spikes in **MetadataRequestsPerSec** during restarts.",
  "When does **adding partitions** fail to reduce **end-to-end lag**?": "Adding partitions increases parallelism only if you also add consumers to match. If you add 6 new partitions but do not add 6 new consumer instances, the new partitions start empty and accumulate no consumers — existing consumers cannot be assigned to them without a rebalance, and after the rebalance they may still be overloaded. Adding partitions also does not help when the bottleneck is in the consumer's downstream dependency — for example a slow database. More parallelism means more concurrent writes to the same database, which may make latency worse. The correct debugging sequence is: check consumer lag per partition to identify whether all partitions lag equally (global bottleneck) or one partition lags (hot key). Then profile the handler to find where time is spent. Partitions are the last dial to turn, not the first.",
  "Why is **per-partition ordering** weaker than many teams assume?": "Ordering holds only within one partition and only as long as the partition key is stable. Cross-partition ordering is completely undefined in Kafka. Teams assume that because they use orderId as the key, all related events arrive in order — but this is only true for events with the same orderId. Events with different orderIds can arrive in any interleaving. A second assumption is that ordering is preserved after a partition reassignment — it is, because the log does not change. A third assumption is that a consumer processes records strictly in offset order — it does, within one poll batch, but if you use parallelism inside your consumer (for example a thread pool), you lose within-partition ordering. For truly global ordered processing you need a single partition, which caps throughput at one consumer. Document this trade-off explicitly in your architecture."
};

// ─── MCQ — replace with correct counts: 8 basic, 12 intermediate, 10 advanced ─
const MCQ_QUESTIONS = [
  // BASIC (8 questions)
  {
    id: 1, level: "basic", category: "theory",
    question: "What is the correct definition of a Kafka **partition**?",
    options: { A: "A named stream of events shared by all consumers", B: "An ordered, append-only log that is the unit of parallelism and ordering in Kafka", C: "A consumer group member that reads from one topic", D: "A configuration file on each broker that controls retention" },
    answer: "B",
    explanation: "A **partition** is an ordered append-only log stored on one broker. It is the unit of parallelism — one consumer per group reads it — and the unit of ordering — records within it have guaranteed sequential offsets. Option A describes a topic. Options C and D are wrong entirely."
  },
  {
    id: 2, level: "basic", category: "theory",
    question: "A Kafka topic has 6 partitions. You add a consumer group with 8 consumers. How many consumers are actively reading?",
    options: { A: "8 — all consumers read, two share the busiest partitions", B: "6 — each partition goes to one consumer; two consumers sit idle", C: "3 — Kafka automatically merges partitions to balance the load", D: "8 — Kafka creates 2 extra virtual partitions automatically" },
    answer: "B",
    explanation: "Kafka assigns exactly one consumer per partition within a group. With 6 partitions only 6 consumers get work. The extra 2 sit idle with no partition assignment. Adding consumers beyond partition count does not improve throughput — it only provides standby capacity for failover."
  },
  {
    id: 3, level: "basic", category: "code-reading",
    question: "What does this produce assignment do?\n```java\nint partition = Math.floorMod(key.hashCode(), 8);\n```",
    options: { A: "Assigns a random partition on every call regardless of key", B: "Deterministically maps the same key to the same partition as long as partition count stays 8", C: "Uses the murmur2 algorithm used by the real Kafka client", D: "Guarantees even distribution across all 8 partitions" },
    answer: "B",
    explanation: "**Math.floorMod** with a fixed partition count gives the same result for the same key every time — deterministic routing. However it uses Java **hashCode** not **murmur2**, so it differs from the real Kafka partitioner. It does not guarantee even distribution — a skewed key set will still create hot partitions."
  },
  {
    id: 4, level: "basic", category: "theory",
    question: "What does **acks=all** mean for a Kafka producer?",
    options: { A: "The producer waits for every consumer in all groups to read the record", B: "The producer waits for the leader and all in-sync replicas to acknowledge the write", C: "The broker writes the record to all partitions in the topic", D: "The producer retries indefinitely until acknowledged" },
    answer: "B",
    explanation: "**acks=all** means the leader waits for every member of the **ISR** (In-Sync Replicas) to confirm the write before responding to the producer. It provides the strongest durability guarantee. Option A is wrong — acks has nothing to do with consumers. Option C is wrong — records go to one partition only."
  },
  {
    id: 5, level: "basic", category: "real-world",
    question: "Your Kafka consumer group has 4 consumers and your topic has 4 partitions. After a deploy you notice 2 consumers sitting idle. What most likely happened?",
    options: { A: "Two consumers failed health checks and are not participating in the group", B: "A rebalance is still in progress after the deploy — wait for it to complete", C: "The new deploy reduced partition count to 2 without the team noticing", D: "Kafka automatically removed 2 partitions to reduce storage cost" },
    answer: "A",
    explanation: "If 2 out of 4 consumers are idle it usually means they have left the consumer group — either health check failures, pod restarts, or application crashes. A rebalance in progress would show all consumers paused briefly then reassigned. Kafka never reduces partition count automatically."
  },
  {
    id: 6, level: "basic", category: "theory",
    question: "What is **ISR** in Kafka?",
    options: { A: "Internal Schema Registry — the service that validates message formats", B: "In-Sync Replicas — the set of followers that are caught up enough to become leader", C: "Isolated Segment Record — a log segment with encryption enabled", D: "Incremental Snapshot Replication — the protocol for follower catch-up" },
    answer: "B",
    explanation: "**ISR** stands for **In-Sync Replicas**. It is the subset of partition replicas that have recently fetched from the leader (within replica.lag.time.max.ms). Only ISR members count when acks=all. When ISR shrinks below min.insync.replicas, producers with acks=all receive a **NotEnoughReplicasException**."
  },
  {
    id: 7, level: "basic", category: "code-reading",
    question: "A consumer has `enable.auto.commit=true` and the default 5-second interval. The handler takes 3 seconds. The consumer crashes at second 4 after committing. What happens to the in-flight records?",
    options: { A: "Records are reprocessed because the commit happened before crash", B: "Records are lost because the offset was committed before crash but processing was incomplete", C: "Records wait in the topic until the consumer restarts", D: "The broker automatically re-routes records to another consumer in the group" },
    answer: "B",
    explanation: "Auto-commit committed the offset at the 5-second mark — after the handler finished processing (3s) but the crash at 4s means some work may not have persisted. With auto-commit the commit happens on a timer regardless of whether downstream writes completed. The next consumer restart begins from the committed offset — the records in that window are not reprocessed, so they are effectively lost."
  },
  {
    id: 8, level: "basic", category: "theory",
    question: "What is the relationship between **offset** and **consumer lag**?",
    options: { A: "Offset is the total number of records in a topic; lag is how many have been deleted", B: "Offset is the position of a record in a partition; lag is the gap between the latest offset and the consumer's committed offset", C: "Lag is the network delay between producer and broker; offset tracks the delay in milliseconds", D: "Offset and lag are the same metric reported in different units" },
    answer: "B",
    explanation: "Every record in a partition gets a sequential **offset**. The broker tracks the latest written offset (high-water mark). The consumer commits the offset of the last record it processed. **Consumer lag** = high-water mark minus committed offset. Lag of zero means the consumer is fully caught up. Increasing lag means the consumer is falling behind the producer."
  },
  // INTERMEDIATE (12 questions)
  {
    id: 9, level: "intermediate", category: "theory",
    question: "What is the difference between **replication.factor** and **min.insync.replicas**?",
    options: { A: "They are the same setting — one is the alias for the other", B: "RF is the number of copies; min.insync.replicas is the minimum required to acknowledge a write with acks=all", C: "RF controls consumer parallelism; min.insync.replicas controls producer retry count", D: "min.insync.replicas must always equal replication.factor" },
    answer: "B",
    explanation: "**replication.factor** determines how many copies of each partition exist across brokers. **min.insync.replicas** is a write gate — with acks=all the producer requires at least this many replicas to confirm. Setting RF=3 and min.insync.replicas=1 means acks=all only waits for one replica — not the durability guarantee it appears to be. The safe combination is RF=3 and min.insync.replicas=2."
  },
  {
    id: 10, level: "intermediate", category: "code-reading",
    question: "What is wrong with this consumer configuration?\n```java\nprops.put(\"enable.auto.commit\", \"true\");\nprops.put(\"max.poll.interval.ms\", \"5000\");\n// handler takes up to 8 seconds\n```",
    options: { A: "auto.commit should always be false — it is deprecated in recent Kafka versions", B: "max.poll.interval.ms is shorter than the handler runtime; the consumer will be kicked from the group", C: "The handler runtime does not affect max.poll.interval.ms at all", D: "auto.commit and manual commit cannot be mixed — compilation error" },
    answer: "B",
    explanation: "**max.poll.interval.ms=5000** means the broker expects a poll() call every 5 seconds. If the handler takes 8 seconds the consumer cannot poll in time. The broker removes it from the group and triggers a rebalance. The fix is to set max.poll.interval.ms to at least p99-handler-time × 1.5."
  },
  {
    id: 11, level: "intermediate", category: "real-world",
    question: "You run `kafka-consumer-groups.sh --describe` and see one partition with LAG=2,400,000 while all other partitions show LAG < 100. What is the most likely root cause?",
    options: { A: "The consumer assigned to that partition is using acks=0", B: "A hot partition caused by a low-cardinality partition key — that partition receives most of the traffic", C: "The broker hosting that partition is running Java 8 with a serial GC", D: "The retention period expired on that partition so records are being recreated" },
    answer: "B",
    explanation: "When one partition has vastly higher lag than all others while the consumer is healthy, the cause is almost always a **hot partition**. A low-cardinality key (like status, country, or tier) hashes most records to the same few partitions. The assigned consumer cannot keep up. The fix is to redesign the partition key to use a high-cardinality field like the entity ID."
  },
  {
    id: 12, level: "intermediate", category: "theory",
    question: "What delivery semantic does this consumer pattern achieve?\n```java\n// inside poll loop:\nconsumer.commitSync();\nprocessRecord(record); // may throw\n```",
    options: { A: "At-least-once — records are always reprocessed if the consumer crashes", B: "At-most-once — records may be lost if processRecord throws after commitSync", C: "Exactly-once — commitSync before processing prevents duplicates", D: "No guarantee — commitSync is not a valid method in the consumer API" },
    answer: "B",
    explanation: "Committing the offset **before** processing means that if processRecord throws or the consumer crashes, the offset is already advanced. On restart the consumer starts from the next record — the failed record is never reprocessed. This is **at-most-once** delivery. For at-least-once, commit after successful processing."
  },
  {
    id: 13, level: "intermediate", category: "code-reading",
    question: "A team sets `unclean.leader.election.enable=true` on their payment topic. A broker hosting the partition leader crashes before the follower finishes replicating. What happens?",
    options: { A: "Kafka waits indefinitely for the original leader to recover before accepting writes", B: "The out-of-sync follower becomes leader and the unreplicated records are silently lost", C: "The producer receives NotEnoughReplicasException until the original leader returns", D: "Kafka creates a new empty partition and starts fresh from that point" },
    answer: "B",
    explanation: "With **unclean.leader.election.enable=true**, Kafka promotes the best available replica even if it is not in ISR. The newly elected leader does not have the records the old leader accepted but did not replicate. Those records vanish silently — no exception, no DLQ entry. For payment topics this setting must always be **false**."
  },
  {
    id: 14, level: "intermediate", category: "real-world",
    question: "After switching from eager to **cooperative rebalance protocol**, what observable change do you expect in production metrics?",
    options: { A: "Consumer lag permanently increases because cooperative rebalance is slower", B: "Rebalance events take longer but consumer fetch rate stays non-zero during rebalance", C: "The number of rebalances doubles because cooperative sends more generation bumps", D: "Partition assignment becomes random instead of deterministic" },
    answer: "B",
    explanation: "The **cooperative (incremental) rebalance** protocol only pauses consumers on the partitions being moved. Consumers keeping their current partitions continue fetching throughout the rebalance. With eager rebalance all consumers stop — causing a visible dip in fetch rate. With cooperative the dip is limited to the migrated partitions. This reduces lag spikes during rolling deploys significantly."
  },
  {
    id: 15, level: "intermediate", category: "theory",
    question: "What is the purpose of the **__consumer_offsets** internal Kafka topic?",
    options: { A: "It stores configuration for all consumer groups on the cluster", B: "It stores committed offsets for consumer groups so they can resume after restart", C: "It tracks how many records each producer has sent to each partition", D: "It is the default topic that all new producers write to before routing" },
    answer: "B",
    explanation: "**__consumer_offsets** is the internal Kafka topic where the group coordinator stores committed offsets for every consumer group. When a consumer calls commitSync() or commitAsync() the offset is written here. On restart the consumer fetches from this topic to find where it left off. This topic has 50 partitions by default. Do not manually write to it."
  },
  {
    id: 16, level: "intermediate", category: "code-reading",
    question: "What is the difference between `consumer.subscribe(topics)` and `consumer.assign(partitions)`?",
    options: { A: "subscribe is for producers; assign is the correct method for consumers", B: "subscribe joins a consumer group with automatic rebalance; assign does static manual partition assignment with no group coordination", C: "assign is deprecated — subscribe should always be used instead", D: "They are equivalent — both methods produce the same assignment" },
    answer: "B",
    explanation: "**subscribe** registers the consumer with a consumer group. Kafka assigns and reassigns partitions automatically via rebalance. **assign** bypasses the group coordinator entirely — the consumer directly specifies which partitions to read. There is no rebalance and no group membership. assign is used for exactly-once stream processing frameworks and for testing. A consumer using assign cannot also use subscribe — they are mutually exclusive."
  },
  {
    id: 17, level: "intermediate", category: "real-world",
    question: "Your team wants to implement log compaction on the `user-profile` topic. Which cleanup policy should you set?",
    options: { A: "cleanup.policy=delete — delete records older than the retention period", B: "cleanup.policy=compact — keep only the latest record per key; delete older duplicates", C: "cleanup.policy=compress — apply lz4 compression to old segments", D: "cleanup.policy=archive — move old segments to object storage automatically" },
    answer: "B",
    explanation: "**cleanup.policy=compact** tells Kafka to retain only the most recent record for each key. This is ideal for a user-profile topic where you want to be able to reconstruct the current state of any user by reading from the beginning. To delete a user you write a tombstone — a record with that user's ID as key and null as value. Compaction runs in the background and does not affect active segments."
  },
  {
    id: 18, level: "intermediate", category: "theory",
    question: "What happens when `min.insync.replicas=2` and only one broker in the ISR is available?",
    options: { A: "Kafka downgrades acks to acks=1 automatically to maintain availability", B: "Producers using acks=all receive NotEnoughReplicasException and cannot write", C: "Consumers can still read but producers can only write with acks=0", D: "The controller elects a new leader from out-of-ISR replicas immediately" },
    answer: "B",
    explanation: "When the number of in-sync replicas drops below **min.insync.replicas**, producers using acks=all receive **NotEnoughReplicasException**. The write is rejected — Kafka prefers availability degradation over silent data loss. Consumers can still read from the remaining replica. This design choice makes data-loss risk visible as errors rather than silent corruption."
  },
  {
    id: 19, level: "intermediate", category: "code-reading",
    question: "A consumer sets `fetch.min.bytes=1048576` (1MB). What is the expected production behaviour compared to the default of 1 byte?",
    options: { A: "The consumer processes exactly 1MB of data per second regardless of incoming rate", B: "The broker waits until 1MB of data is available before responding to a fetch request, reducing CPU overhead at the cost of slightly higher latency", C: "The consumer will reject any single record larger than 1MB", D: "This setting only affects producers — consumers ignore fetch.min.bytes" },
    answer: "B",
    explanation: "**fetch.min.bytes** tells the broker the minimum amount of data to accumulate before returning a fetch response. With 1MB the broker batches more records per response — fewer network round trips, less CPU per record. The trade-off is higher latency for low-throughput topics because the broker waits for the buffer to fill. Use fetch.max.wait.ms to cap the maximum wait time."
  },
  {
    id: 20, level: "intermediate", category: "real-world",
    question: "A team migrates from ZooKeeper mode to KRaft mode in Kafka 3.3. What operational change do they need to plan for?",
    options: { A: "All consumer group offsets are lost and consumers must reset to earliest", B: "The ZooKeeper cluster can be decommissioned; controller is now embedded in Kafka brokers", C: "Partition count per topic is limited to 100 in KRaft mode", D: "Producers must set a new mandatory raft.enabled=true config property" },
    answer: "B",
    explanation: "In **KRaft** mode the Kafka controller uses a Raft consensus log stored inside dedicated controller brokers (or combined broker+controller nodes). ZooKeeper is no longer needed. The migration path is one-way: once migrated you cannot roll back. Consumer offsets, topic configurations, and ACLs are migrated as part of the migration tool. Partition limits increase in KRaft — this is one of its advantages."
  },
  // ADVANCED (10 questions)
  {
    id: 21, level: "advanced", category: "on-call",
    question: "Your payment service starts returning 5xx errors 2 minutes after a broker restart. `kafka-consumer-groups.sh --describe` shows rebalance generation climbing by 1 every 30 seconds. What is the most likely cause?",
    options: { A: "The broker restart corrupted topic metadata and all partitions need recreation", B: "Consumer poll interval is being exceeded due to slow message handlers — rebalance loop in progress", C: "The broker's rack awareness configuration was lost during restart", D: "Consumer group ID changed during restart, causing all offsets to reset to earliest" },
    answer: "B",
    explanation: "A climbing rebalance generation with 30-second intervals strongly indicates **max.poll.interval.ms** is being exceeded. Each time it fires the consumer is removed from the group, a rebalance assigns partitions to survivors, but the restarted consumer rejoins and triggers another rebalance. The 5xx errors are from the processing downtime during each stop-the-world rebalance. Fix: profile the handler to find what is slow; tune max.poll.interval.ms to p99 × 1.5; consider switching to cooperative rebalance."
  },
  {
    id: 22, level: "advanced", category: "architecture",
    question: "A team needs to process all events for a single customer in strict order. Currently the topic has 24 partitions and they use customerId as the partition key. A large enterprise customer generates 40% of all traffic. What is the best architectural response?",
    options: { A: "Increase partition count to 240 — more partitions distributes the large customer's traffic", B: "Accept the hot partition for now; rebalance after the customer churns", C: "Add a synthetic salt to the key for the large customer, add a downstream ordering layer to re-sort events per customer before processing", D: "Move the large customer to a dedicated topic and use a separate consumer group" },
    answer: "C",
    explanation: "Option D (dedicated topic) is operationally fragile at scale. Option A does nothing — the large customer's traffic hashes to a subset of the new partitions, still hot. The correct answer for high-volume single-entity hot spots is adding a **synthetic salt** to distribute the entity across partitions, then re-sequencing downstream using event timestamps or sequence numbers before business logic. This preserves throughput while accepting that within-entity strict ordering requires the re-sort step."
  },
  {
    id: 23, level: "advanced", category: "code-reading",
    question: "A Staff engineer reviews this consumer config:\n```\nacks=all\nreplication.factor=3\nmin.insync.replicas=1\nenable.idempotence=true\n```\nWhat is the critical gap?",
    options: { A: "enable.idempotence requires acks=0, not acks=all", B: "min.insync.replicas=1 means acks=all only waits for one replica — the durability guarantee is weaker than intended", C: "replication.factor=3 is incompatible with min.insync.replicas=1", D: "There is no gap — this is the recommended configuration for all topics" },
    answer: "B",
    explanation: "With **min.insync.replicas=1**, acks=all only requires one replica to acknowledge — which is the leader alone. This negates the intent of acks=all for durability. The broker can accept the write with only one copy, and if the leader crashes before a follower replicates, the record is lost. The correct setting for financial topics is min.insync.replicas=2 with RF=3."
  },
  {
    id: 24, level: "advanced", category: "on-call",
    question: "During a rolling broker restart, producers start receiving `NOT_LEADER_OR_FOLLOWER` errors sporadically. What is the correct client-side behaviour?",
    options: { A: "The producer should increase batch.size to buffer records until the leader returns", B: "The producer should refresh metadata and retry to the new leader with exponential backoff", C: "The producer should switch to acks=0 temporarily to maintain throughput during the restart", D: "The errors are expected and producers should discard affected records and continue" },
    answer: "B",
    explanation: "**NOT_LEADER_OR_FOLLOWER** means the producer's cached leader information is stale — the partition leader moved to another broker. The correct response is to trigger a **metadata refresh** (the Kafka client does this automatically after this error) and retry the send to the new leader. Exponential backoff prevents metadata storms when many leaders are moving simultaneously during a rolling restart. Switching to acks=0 would cause silent data loss."
  },
  {
    id: 25, level: "advanced", category: "architecture",
    question: "A team runs `kafka-consumer-groups.sh --describe` and sees consumer lag of 0 on all partitions, but the downstream database shows records arriving minutes late. What is the most likely explanation?",
    options: { A: "Consumer lag reports offsets from the follower, not the leader — there is a replication delay", B: "The consumer is committing offsets before writing to the database; lag shows committed not processed", C: "kafka-consumer-groups.sh caches results — the output is up to 5 minutes stale", D: "Zero lag means all records were deleted by retention before consumers could process them" },
    answer: "B",
    explanation: "This is a classic **at-most-once delivery anti-pattern**. The consumer commits offset immediately on poll, before the database write completes. From Kafka's perspective lag is zero — the consumer has moved past those records. But the database has not yet received them. The solution is to commit after the database write is confirmed. This changes semantics to at-least-once but ensures records are not lost."
  },
  {
    id: 26, level: "advanced", category: "on-call",
    question: "Your Kafka cluster shows `UnderReplicatedPartitions > 0` for 10 partitions after a GC pause on broker-3. No broker has crashed. What is the correct first action?",
    options: { A: "Restart broker-3 immediately to force a new leader election on those partitions", B: "Wait briefly — ISR members rejoin automatically after GC pauses; monitor if under-replicated count returns to zero", C: "Manually reassign the 10 partitions to different brokers using kafka-reassign-partitions.sh", D: "Increase replication.factor for those topics from 3 to 5 to mask the GC problem" },
    answer: "B",
    explanation: "**UnderReplicatedPartitions** after a GC pause is expected and transient. The follower on broker-3 paused fetching during GC and was temporarily removed from ISR. Once the GC pause ends the follower resumes fetching and catches up to the leader. ISR membership is automatically restored when lag drops back within replica.lag.time.max.ms. Only intervene if the under-replication persists beyond 2–3 minutes — then investigate broker-3 disk and memory."
  },
  {
    id: 27, level: "advanced", category: "architecture",
    question: "A Staff engineer must choose between log retention and log compaction for a `customer-address` topic. Consumers use this topic to rebuild current customer state on restart. Which policy is correct and why?",
    options: { A: "Retention with 7-day TTL — addresses change rarely so 7 days of history is sufficient", B: "Compaction — keep only the latest address per customerId so consumers can always recover current state regardless of topic age", C: "Both policies simultaneously — this is not possible in Kafka", D: "Retention with infinite size limit — never delete address data for compliance" },
    answer: "B",
    explanation: "**Log compaction** is the correct choice when consumers need to recover current state from scratch. With compaction only the latest record per customerId is retained — a consumer reading from offset 0 gets the current address for every customer, regardless of how old the topic is. Retention by TTL would lose addresses for customers who have not changed address recently. Note that cleanup.policy=compact,delete allows combining both policies if you also need eventual space reclamation."
  },
  {
    id: 28, level: "advanced", category: "on-call",
    question: "A Java consumer application running in Kubernetes shows rebalances every 45 seconds. `max.poll.interval.ms=60000`. Handler p99 is 8 seconds. GC logs show 400ms pauses on average. What is the most likely trigger?",
    options: { A: "GC pauses are unrelated to Kafka rebalances — look at handler logic instead", B: "400ms GC pauses are fine; the issue is handler p99 growing above 60 seconds during peaks", C: "The Kubernetes liveness probe is killing and restarting the consumer pod every 45 seconds", D: "session.timeout.ms is likely set below 45 seconds, and heartbeat thread stalls during GC cause session expiry" },
    answer: "D",
    explanation: "The heartbeat thread in a Kafka consumer runs separately from the poll thread. However if the consumer JVM is fully stopped during a GC pause (stop-the-world), the heartbeat thread also stops. If GC pauses are long enough to exceed **session.timeout.ms**, the coordinator evicts the consumer. With 400ms average GC pauses the worst-case pauses may be 2–4s. If session.timeout.ms is 30s (common default in older configs), occasional longer pauses can fire. Set session.timeout.ms to at least 3–5x your worst-case GC pause."
  },
  {
    id: 29, level: "advanced", category: "architecture",
    question: "A platform team wants to allow each product team to replay events independently for debugging without affecting each other's consumer group offsets. What is the correct architectural pattern?",
    options: { A: "Use a single consumer group with multiple threads — threads share partitions so replays are isolated", B: "Create a separate consumer group per team — each group tracks its own offsets independently on the same topic", C: "Copy the topic to a new topic for each team that needs to replay", D: "Use kafka-consumer-groups.sh --reset-offsets on the shared consumer group with a time-based target" },
    answer: "B",
    explanation: "Kafka's **consumer group** model is designed exactly for this use case. Multiple independent consumer groups can all read the same topic, each maintaining its own committed offsets. Resetting one group's offsets does not affect any other group. Creating separate topics wastes storage and creates synchronisation complexity. Option D would reset the shared group's offsets, affecting all consumers in that group."
  },
  {
    id: 30, level: "advanced", category: "on-call",
    question: "A producer starts throwing `org.apache.kafka.common.errors.TimeoutException: Topic payment.captured not present in metadata after 60000 ms` during a rolling broker restart. What is the root cause and fix?",
    options: { A: "The payment.captured topic was accidentally deleted during the restart procedure", B: "The client's bootstrap server list only contained the restarting broker; after restart the client cannot reach any metadata source", C: "The producer's acks=all config is incompatible with topics created during a rolling restart", D: "TimeoutException means the consumer group coordinator is unavailable, not the metadata" },
    answer: "B",
    explanation: "The **bootstrap.servers** config is only used for the initial connection. If all listed bootstrap servers are down simultaneously (for example a rolling restart that takes them all offline at once rather than one-at-a-time), the client cannot refresh metadata and times out. The fix is to list at least 3 brokers in bootstrap.servers so at least one is always available during a rolling restart. The topic itself has not been deleted — the client simply cannot reach any broker to ask about it."
  }
];

// ─── CHEATSHEET — 4-column format ─────────────────────────────────────────────
const CHEATSHEET_CONTENT = `| Level | Concept | The rule in one line | Example or Command |
|-------|---------|----------------------|--------------------|
| Fresher | Broker | A server that stores partition logs and handles client requests | Multiple brokers form a fault-tolerant cluster |
| Fresher | Topic | A named stream of events split into one or more partitions | kafka-topics.sh --create --topic orders --partitions 6 |
| Fresher | Partition | Unit of ordering and parallelism — one consumer per group reads it | Ordering is per-partition, not per-topic |
| Fresher | Offset | Position of a record in a partition — committed offset is where consumer resumes | Lag = high-water mark minus committed offset |
| Senior Dev | acks=all | Waits for all ISR replicas before acknowledging the producer | Use for all financial and audit topics |
| Senior Dev | max.poll.interval.ms | Max gap between poll() calls; consumer evicted from group if exceeded | Set >= p99 handler time × 1.5 |
| Senior Dev | ISR | Followers caught up enough to become leader — gates acks=all | kafka-topics.sh --describe shows Isr: field |
| Senior Dev | Hot partition | One partition gets 80%+ of traffic due to low-cardinality key | Use entity ID not status as partition key |
| Tech Lead | Partition count | Hard to shrink — plan for 2× peak consumer count from day one | kafka-topics.sh --alter --partitions (increase only) |
| Tech Lead | min.insync.replicas | Must be set with acks=all to actually enforce durability | RF=3, min.insync.replicas=2 for financial topics |
| Tech Lead | Topic tiers | Financial=acks all+RF3+minISR2; Telemetry=acks 1+RF2 | Document tier in ADR; enforce in CI config templates |
| Tech Lead | Rebalance | Group membership change triggers partition reassignment — eager stops all | Switch to COOPERATIVE to reduce stop-the-world impact |
| Staff | Page cache | Kafka writes to OS page cache first — RF+minISR compensates | Durability comes from replication not fsync |
| Staff | KRaft | Replaces ZooKeeper for metadata; production-ready in Kafka 3.3 | kafka-storage.sh for KRaft cluster initialisation |
| Staff | kafka-consumer-groups.sh | Primary on-call tool for lag and rebalance diagnosis | kafka-consumer-groups.sh --describe --group <name> |
| Staff | unclean.leader.election | Allows non-ISR replica as leader — silent data loss risk | Always false for financial topics |`;

// ─────────────────────────────────────────────────────────────────────────────
// Apply changes to data
// ─────────────────────────────────────────────────────────────────────────────

// 1. WHY
const whySec = data.sections.find(s => s.type === "why");
whySec.content = WHY_CONTENT;

// 2. THEORY
const theorySec = data.sections.find(s => s.type === "theory");
theorySec.content = THEORY_CONTENT;

// 3. CODE basic
const codeBasic = data.sections.find(s => s.type === "code" && s.level === "basic");
codeBasic.title = "Basic — Kafka vocabulary and delivery model reference card";
codeBasic.description = "A printed reference card. Read top to bottom to build the mental model for interview whiteboards.";
codeBasic.code = CODE_BASIC;
codeBasic.output = CODE_BASIC_OUTPUT;

// 4. CODE intermediate
const codeInter = data.sections.find(s => s.type === "code" && s.level === "intermediate");
codeInter.title = "Intermediate — Four Senior Developer production scenarios";
codeInter.description = "Four real situations a Senior Developer encounters with Kafka. Each shows symptom, cause, fix, and verification command.";
codeInter.code = CODE_INTERMEDIATE;
codeInter.output = CODE_INTERMEDIATE_OUTPUT;

// 5. CODE advanced
const codeAdv = data.sections.find(s => s.type === "code" && s.level === "advanced");
codeAdv.title = "Advanced — Durability tier model and on-call triage table";
codeAdv.description = "A Tech Lead and Staff engineer's decision model: tier selection, partition assignment reasoning, and on-call signal table.";
codeAdv.code = CODE_ADVANCED;
codeAdv.output = CODE_ADVANCED_OUTPUT;

// 6. PITFALLS
const pitfallsSec = data.sections.find(s => s.type === "pitfalls");
pitfallsSec.items = PITFALLS;

// 7. EXERCISE — replace the single exercise with Fresher + Staff pair
const exerciseIdx = data.sections.findIndex(s => s.type === "exercise");
data.sections.splice(exerciseIdx, 1, EXERCISE_FRESHER, EXERCISE_STAFF);

// 8. INTERVIEW — fix answer word counts and add jobSwitch
const interviewSec = data.sections.find(s => s.type === "interview");

// Update conceptual answers
for (const q of interviewSec.conceptual) {
  const newAnswer = CONCEPTUAL_ANSWERS[q.question];
  if (newAnswer) q.answer = newAnswer;
}

// Update seniorScenario answers to meet 200-word minimum
const SCENARIO_ANSWERS = [
  {
    q: "**Incident:** **Consumer lag** explodes after **deploy**; **rebalance storm** in logs.",
    a: "**Immediate response:** Freeze the deploy rollout. Run `kafka-consumer-groups.sh --bootstrap-server broker:9092 --group your-group --describe` and note the rebalance generation number. Check if it is climbing every 30–60 seconds — that is the signature of a poll-interval violation loop.\n\n**Root cause:** The deploy added a new processing step that increased p99 handler time. When handler time exceeds **max.poll.interval.ms**, the broker removes the consumer from the group and triggers a rebalance. All consumers stop fetching during the rebalance (eager protocol). The rebalanced consumer joins, handles a batch slowly, gets removed again. This is a rebalance loop. Lag grows because no consumers are making sustained progress.\n\n**Fix:** First, roll back the deploy if lag is growing faster than 100k records per minute. Then in the new code: measure p99 handler time for the new processing step. Set max.poll.interval.ms to p99 × 1.5 (for example if p99=12s, set to 18000ms). Switch the consumer to cooperative rebalance protocol by setting partition.assignment.strategy=CooperativeStickyAssignor. Redeploy with both changes.\n\n**Prevention:** Add a latency SLO on handler execution time in your consumer integration tests. Alert on rebalance-rate metric in Grafana — a value above 0.1 per minute on a healthy group is a signal to investigate before lag grows."
  },
  {
    q: "**Design:** **Global ordering** for **all orders** in Kafka.",
    a: "**Immediate response:** Challenge the requirement before accepting it. Ask: do you need all orders globally ordered, or do you need events for the same order to be in order? These are different problems with very different cost.\n\n**Root cause:** Global ordering across all orders in Kafka requires a single partition. One partition means one consumer, which caps your write throughput at roughly 50–100MB/s and your processing throughput at one consumer. At scale this becomes a bottleneck. The team likely asked for global ordering because they want to prevent a case like order-paid being processed before order-created — which is per-entity ordering, not global ordering.\n\n**Fix:** Use orderId as the partition key. All events for the same order go to the same partition. Within that partition they are in creation order. Across orders there is no ordering — but that is usually acceptable. If the business rule is really about cross-order ordering (for example, enforce a global event sequence number), implement that at the application layer with a sequence number in the event payload and optimistic locking in the consumer.\n\n**Prevention:** Document in your event schema design guide: Kafka guarantees per-partition ordering only. Any cross-entity ordering requirement needs an application-level solution. Make this part of your domain event design review checklist."
  },
  {
    q: "**Ops:** **Under-replicated partitions** during **AZ failure**.",
    a: "**Immediate response:** Run `kafka-topics.sh --bootstrap-server broker:9092 --describe --under-replicated-partitions` to list the affected partitions. Note which brokers appear in the Replicas field but not the Isr field — those are the brokers in the failed AZ. Check if UnderReplicatedPartitions count is stable or growing. Stable means the AZ is partially degraded; growing means it is still going down.\n\n**Root cause:** The replication factor was set correctly but rack awareness was either not configured or not checked recently. If all three replicas of some partitions landed on brokers in the same AZ, that AZ failure removed all copies simultaneously. Even with RF=3, poor replica placement defeats the fault tolerance. The min.insync.replicas setting determines whether producers can still write: if two replicas are in the failed AZ and min.insync.replicas=2, producers are now blocked.\n\n**Fix:** For the immediate incident: if producers are blocked and you accept the data-loss risk, temporarily reduce min.insync.replicas to 1 on the affected topics to restore writes. Once the failed AZ recovers, replicas will catch up and ISR will restore. For prevention: verify broker.rack is set on every broker and matches the actual AZ. Run kafka-reassign-partitions.sh with rack awareness to rebalance replicas across AZs for affected topics.\n\n**Prevention:** Add a monthly game day that kills one AZ and verifies under-replicated-partitions goes to zero within 5 minutes of the AZ recovering. Alert on under-replicated-partitions > 0 for more than 3 minutes in production."
  },
  {
    q: "**Scale:** **12 partitions**, **40 consumers** in one group.",
    a: "**Immediate response:** Run `kafka-consumer-groups.sh --describe --group your-group` and check the PARTITION column. You will see only partitions 0–11 assigned. Exactly 28 consumers have no PARTITION entry — they are idle standby members consuming memory and connection slots on the broker.\n\n**Root cause:** Kafka's consumer group model hard-caps parallelism at partition count. With 12 partitions only 12 consumers get work regardless of how many are in the group. The extra 28 consumers were added hoping for more throughput, which demonstrates a common misunderstanding of the parallelism model. The extra consumers do provide fast failover — if an active consumer crashes, an idle consumer immediately inherits its partitions — but this is an expensive way to achieve failover compared to simply having spare capacity in fewer pods.\n\n**Fix:** There are two valid responses depending on the team's goal. If throughput is genuinely limited by consumer processing: increase partition count to 40 (requires topic recreation or careful reassignment) and accept the rebalance and increased broker overhead. If the team just wanted faster failover: reduce consumer count to 14–16 (12 active plus 2–4 spare) and document the idle consumer pattern in the runbook. If multiple use cases need independent scaling: use separate consumer groups, each with its own offset tracking.\n\n**Prevention:** Include partition count and planned consumer count in every topic ADR. Require capacity review before topics cross 50 partitions. Add a Grafana panel showing consumer count vs partition count per group."
  },
  {
    q: "**Bug:** **Poison message** blocks partition forever.",
    a: "**Immediate response:** Identify which partition is stuck by running `kafka-consumer-groups.sh --describe` and finding the partition where lag is growing while all others drain. Then check consumer logs for the exception being thrown on that partition. Note the offset where processing fails — this is your poison message.\n\n**Root cause:** The consumer has no skip or dead-letter path. When the message handler throws an exception the consumer retries indefinitely at the same offset. The poll loop is healthy — it is calling poll() — but it is processing the same message over and over, never advancing the offset. Other partitions assigned to the same consumer continue draining. But this partition is permanently blocked at that offset until someone intervenes.\n\n**Fix:** Implement a dead-letter queue (DLQ) pattern. After N retries (typically 3–5), write the failed record to a separate DLQ topic with the original topic, partition, offset, and exception in headers. Then commit the offset and continue. This allows the main partition to drain while the DLQ topic accumulates records for manual investigation and replay. For the immediate incident: manually seek past the poison offset using `consumer.seek(partition, badOffset + 1)` in a maintenance script, or use kafka-consumer-groups.sh --reset-offsets --to-offset.\n\n**Prevention:** Add poison message handling to your consumer framework template. Every consumer must have a DLQ topic and a maximum retry count before the message is quarantined. Test this path in staging by producing a deliberately malformed record before every release."
  },
  {
    q: "**Cost:** **Retention** **7 years** on **high-volume** topic.",
    a: "**Immediate response:** Calculate the actual storage cost. Multiply average record size by daily write volume by 2555 days by replication factor. For a topic producing 1GB/day with RF=3 over 7 years that is 1 × 2555 × 3 = 7.6TB per topic. For a cluster with 50 such topics that is 380TB of broker disk. Ask which team owns this requirement and whether they have signed off on the storage bill.\n\n**Root cause:** The 7-year retention requirement usually comes from a compliance or audit requirement that was applied to the raw Kafka topic without considering the cost. Raw Kafka is an expensive place to store cold compliance data. The events are append-only and rarely read after 30 days — they just need to be available for legal discovery. The team conflated operational retention (hours to days) with compliance archiving (years).\n\n**Fix:** Implement a two-tier retention strategy. Set the Kafka topic to a short operational retention (7–30 days). Add a Kafka Streams or Flink job that archives events to object storage (S3, GCS) in compressed Parquet format within the operational window. Point compliance queries at the archive. This reduces broker disk by 99% and cuts storage cost by an order of magnitude. If Kafka tiered storage is available (Kafka 3.6+), it automates this — old segments are offloaded to object storage while the Kafka API stays consistent.\n\n**Prevention:** Require a storage cost sign-off in every ADR that sets retention. Add a governance rule: retention > 30 days requires platform SRE and finance approval. Review retention policies annually."
  }
];

for (const sa of SCENARIO_ANSWERS) {
  const found = interviewSec.seniorScenario.find(s => s.question === sa.q);
  if (found) found.answer = sa.a;
}

// Add jobSwitch
interviewSec.jobSwitch = JOB_SWITCH;

// 9. MCQ — replace questions array
const mcqSec = data.sections.find(s => s.type === "mcq");
mcqSec.questions = MCQ_QUESTIONS;

// 10. CHEATSHEET
const cheatSec = data.sections.find(s => s.type === "cheatsheet");
cheatSec.content = CHEATSHEET_CONTENT;

// ─────────────────────────────────────────────────────────────────────────────
// Validate JSON round-trip
// ─────────────────────────────────────────────────────────────────────────────
const serialised = JSON.stringify(data, null, 2);
JSON.parse(serialised); // throws if invalid

fs.writeFileSync(JSON_PATH, serialised, "utf8");

// ─────────────────────────────────────────────────────────────────────────────
// Verification output
// ─────────────────────────────────────────────────────────────────────────────
const final = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));

const whyFinal = final.sections.find(s => s.type === "why");
const whyWords = whyFinal.content.trim().split(/\s+/).length;

const theoryFinal = final.sections.find(s => s.type === "theory");
const theorySubCount = (theoryFinal.content.match(/^### /gm) || []).length;
const fresherSubs = (theoryFinal.content.match(/### What is Kafka|### Topics, partitions|### How consumer groups work/g) || []).length;
const seniorSubs  = (theoryFinal.content.match(/### How brokers store|### Producer durability|### Consumer offset|### Common Senior/g) || []).length;
const techSubs    = (theoryFinal.content.match(/### Choosing partition|### Durability configuration|### What to check in/g) || []).length;
const staffSubs   = (theoryFinal.content.match(/### What happens inside|### The commands you run|### How Kafka changed|### The architecture decision/g) || []).length;
const pipeTables  = (theoryFinal.content.match(/\|[-|]+\|/g) || []).length;
const interviewAngles = (theoryFinal.content.match(/\*\*Interview angle:\*\*/g) || []).length;

const codeBasicFinal = final.sections.find(s => s.type === "code" && s.level === "basic");
const basicLines = codeBasicFinal.code.split("\n").length;

const codeInterFinal = final.sections.find(s => s.type === "code" && s.level === "intermediate");
const interLines = codeInterFinal.code.split("\n").length;
const scenarioCount = (codeInterFinal.code.match(/static void scenario/g) || []).length;

const codeAdvFinal = final.sections.find(s => s.type === "code" && s.level === "advanced");
const advLines = codeAdvFinal.code.split("\n").length;
const blockCount = (codeAdvFinal.code.match(/=== Block \d/g) || []).length;

const pitfallsFinal = final.sections.find(s => s.type === "pitfalls");
const pitfallCount = pitfallsFinal.items.length;

const exercises = final.sections.filter(s => s.type === "exercise");
const fresherEx = exercises.find(e => e.level === "Fresher");
const staffEx   = exercises.find(e => e.level === "Staff / Architect");

const interviewFinal = final.sections.find(s => s.type === "interview");
const conceptualCount = interviewFinal.conceptual.length;
const conceptualWordCounts = interviewFinal.conceptual.map(q => q.answer.trim().split(/\s+/).length);
const conceptualAvg = Math.round(conceptualWordCounts.reduce((a,b)=>a+b,0) / conceptualWordCounts.length);
const codeBasedCount = interviewFinal.codeBased.length;
const scenarioQCount = interviewFinal.seniorScenario.length;
const scenarioWordCounts = interviewFinal.seniorScenario.map(q => q.answer.trim().split(/\s+/).length);
const scenarioAvg = Math.round(scenarioWordCounts.reduce((a,b)=>a+b,0) / scenarioWordCounts.length);
const wrongCount = interviewFinal.wrongAnswers.length;
const hasJobSwitch = !!interviewFinal.jobSwitch;

const mcqFinal = final.sections.find(s => s.type === "mcq");
const mcqBasic = mcqFinal.questions.filter(q => q.level === "basic").length;
const mcqInter = mcqFinal.questions.filter(q => q.level === "intermediate").length;
const mcqAdv   = mcqFinal.questions.filter(q => q.level === "advanced").length;

const cheatFinal = final.sections.find(s => s.type === "cheatsheet");
const cheatRows = cheatFinal.content.split("\n").filter(l => l.startsWith("|") && !l.startsWith("|---") && !l.startsWith("| Level")).length;

console.log("\n=== Day 59 Verification ===");
console.log(`WHY word count         : ${whyWords}  [need >=600]  ${whyWords>=600?"PASS":"FAIL"}`);
console.log(`THEORY ### count       : ${theorySubCount}  [need >=16]   ${theorySubCount>=16?"PASS":"FAIL"}`);
console.log(`  Fresher subs         : ${fresherSubs}  [need >=3]    ${fresherSubs>=3?"PASS":"FAIL"}`);
console.log(`  Senior Dev subs      : ${seniorSubs}  [need >=4]    ${seniorSubs>=4?"PASS":"FAIL"}`);
console.log(`  Tech Lead subs       : ${techSubs}  [need >=3]    ${techSubs>=3?"PASS":"FAIL"}`);
console.log(`  Staff subs           : ${staffSubs}  [need >=3]    ${staffSubs>=3?"PASS":"FAIL"}`);
console.log(`  Pipe tables          : ${pipeTables}  [need >=3]    ${pipeTables>=3?"PASS":"FAIL"}`);
console.log(`  Interview angles     : ${interviewAngles}  [need >=13]   ${interviewAngles>=13?"PASS":"FAIL"}`);
console.log(`CODE basic lines       : ${basicLines}  [need 40-60]  ${basicLines>=40&&basicLines<=60?"PASS":"FAIL"}`);
console.log(`CODE inter scenarios   : ${scenarioCount}  [need >=4]    ${scenarioCount>=4?"PASS":"FAIL"}`);
console.log(`CODE inter lines       : ${interLines}  [need 70-100] ${interLines>=70&&interLines<=100?"PASS":"FAIL"}`);
console.log(`CODE adv blocks        : ${blockCount}  [need >=3]    ${blockCount>=3?"PASS":"FAIL"}`);
console.log(`CODE adv lines         : ${advLines}  [need 60-100] ${advLines>=60&&advLines<=100?"PASS":"FAIL"}`);
console.log(`PITFALLS count         : ${pitfallCount}  [need 8]      ${pitfallCount===8?"PASS":"FAIL"}`);
console.log(`EXERCISE Fresher       : ${fresherEx?"exists":"missing"}  ${fresherEx?"PASS":"FAIL"}`);
console.log(`EXERCISE Staff         : ${staffEx?"exists":"missing"}  ${staffEx?"PASS":"FAIL"}`);
console.log(`Conceptual count       : ${conceptualCount}  [need >=15]   ${conceptualCount>=15?"PASS":"FAIL"}`);
console.log(`Conceptual avg words   : ${conceptualAvg}  [need >=120]  ${conceptualAvg>=120?"PASS":"FAIL"}`);
console.log(`Conceptual per-Q wc    : ${conceptualWordCounts.join(", ")}`);
console.log(`CodeBased count        : ${codeBasedCount}  [need >=8]    ${codeBasedCount>=8?"PASS":"FAIL"}`);
console.log(`SeniorScenario count   : ${scenarioQCount}  [need >=5]    ${scenarioQCount>=5?"PASS":"FAIL"}`);
console.log(`SeniorScenario avg wds : ${scenarioAvg}  [need >=200]  ${scenarioAvg>=200?"PASS":"FAIL"}`);
console.log(`SeniorScenario per-Q wc: ${scenarioWordCounts.join(", ")}`);
console.log(`WrongAnswers count     : ${wrongCount}  [need 8]      ${wrongCount===8?"PASS":"FAIL"}`);
console.log(`JobSwitch exists       : ${hasJobSwitch}  ${hasJobSwitch?"PASS":"FAIL"}`);
console.log(`MCQ basic              : ${mcqBasic}  [need 8]      ${mcqBasic===8?"PASS":"FAIL"}`);
console.log(`MCQ intermediate       : ${mcqInter}  [need 12]     ${mcqInter===12?"PASS":"FAIL"}`);
console.log(`MCQ advanced           : ${mcqAdv}  [need 10]     ${mcqAdv===10?"PASS":"FAIL"}`);
console.log(`Cheatsheet rows        : ${cheatRows}  [need >=12]   ${cheatRows>=12?"PASS":"FAIL"}`);
console.log(`File size (chars)      : ${serialised.length}`);
