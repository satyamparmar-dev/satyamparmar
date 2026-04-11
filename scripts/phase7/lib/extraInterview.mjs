/** Pad Phase 7 interview sections from 15/10 to 17/12 with Kafka-native extras (per day offset). */

const POOL_CONCEPTUAL = [
  {
    question: "When does **adding partitions** fail to reduce **end-to-end lag**?",
    answer:
      "**Lag** is bounded by the **slowest** stage: **hot partitions**, **single-threaded** processing, **downstream** bottlenecks, or **not enough consumers** to match partitions. More partitions without fixing skew or consumer capacity can **increase** operational overhead without improving p99.",
  },
  {
    question: "Why is **per-partition ordering** weaker than many teams assume?",
    answer:
      "Ordering holds **only within one partition**. Cross-partition order is **undefined** unless you engineer **single partition**, **versioned** state, or **downstream** reconciliation. Interviewers probe whether you confuse **topic** ordering with **global** ordering.",
  },
  {
    question: "What does **min.insync.replicas** actually gate for producers using **acks=all**?",
    answer:
      "It requires enough **ISR** replicas to acknowledge before the write is considered **durable** under your policy. If ISR shrinks below **min ISR**, producers with **acks=all** **block or error**, trading availability for **durability**—a deliberate safety lever.",
  },
  {
    question: "How does **consumer group generation** relate to **rebalances**?",
    answer:
      "Each membership change bumps **generation**. **Stale** members cannot commit offsets; **rebalances** revoke and assign partitions. Frequent generation churn usually points to **timeouts**, **slow polls**, or **unstable** network—not normal steady state.",
  },
  {
    question: "Why might **idempotent producer** still see duplicates downstream?",
    answer:
      "Broker-side idempotency covers **producer session** retries on the **write path**, not your **consumer** processing or **at-least-once** delivery to external systems. **End-to-end** uniqueness needs **idempotent sinks**, **keys**, or **transactions** where appropriate.",
  },
  {
    question: "What is the practical difference between **log compaction** and **time retention**?",
    answer:
      "**Retention** drops old segments by **time/size**. **Compaction** keeps the **latest** record per key for **changelog**-style topics. Picking the wrong mode breaks **replay**, **GDPR** expectations, or **storage** forecasts.",
  },
  {
    question: "When is **static consumer assignment** preferable to **subscribe**?",
    answer:
      "When you need **deterministic** partition ownership, **pin** workloads, or avoid **rebalance** disruption for specialized consumers—at the cost of **manual** scaling and **no** automatic balance. Misuse causes **double consumption** or **missed** partitions.",
  },
  {
    question: "How do **controller** elections impact clients during broker failures?",
    answer:
      "Clients rely on **metadata** for leaders. Controller work schedules **leader** changes; clients **refresh** metadata and may see **NOT_LEADER** spikes. **Watch** metadata request rates and **client** retry storms during incidents.",
  },
  {
    question: "What makes **cross-AZ Kafka** expensive beyond broker CPU?",
    answer:
      "**Replication** and **fetch** traffic across AZs can dominate **egress** bills. **Rack awareness** and **replica placement** reduce correlated loss and unnecessary **cross-zone** fan-out—finance and platform should review topology together.",
  },
  {
    question: "Why is **exactly-once** a **system** property, not a broker toggle?",
    answer:
      "You must align **producer** settings, **consumer** processing, **sink** idempotency, and often **transactions** or **outbox** patterns. Claiming EOS without covering **side effects** is a common **interview** failure mode.",
  },
  {
    question: "What does **consumer lag** tell you that **broker CPU** does not?",
    answer:
      "**Lag** ties **processing** speed and **fetch** cadence to **business** backlog per partition. **CPU** can look healthy while **lag** explodes due to **slow handlers**, **poison** messages, or **downstream** calls—**SLO** on lag is closer to user impact.",
  },
  {
    question: "How do **tombstones** interact with **compacted** topics?",
    answer:
      "A tombstone with a key signals **delete** in compaction semantics after cleanup policies run. Consumers and **stream** apps must handle **null** values and **ordering** with care or **state stores** become wrong.",
  },
  {
    question: "What is a **rebalance storm** and a common trigger?",
    answer:
      "Many consumers **enter** and **exit** the group rapidly, causing **constant** partition revocation. Common triggers: **handler** time exceeding **max.poll.interval.ms**, **GC** pauses, **too-small** session timeouts, or **buggy** deployment rollouts.",
  },
  {
    question: "Why are **sticky partitioners** relevant for **null keys**?",
    answer:
      "They improve **batching** by keeping **null-key** records on the same partition for a while, improving **throughput** but changing **spread** versus pure round-robin. **Throughput** tuning can accidentally create **hotspots** when misread as random sharding.",
  },
  {
    question: "What is the risk of **unclean leader election** on a financial topic?",
    answer:
      "Promoting a **non-ISR** replica can **truncate** the log and **lose** acknowledged data from the prior leader’s perspective—**catastrophic** for **ledger** topics. Teams disable it where **durability** beats **availability**.",
  },
  {
    question: "How does **Kafka Connect** **task restart** differ from a **consumer** restart?",
    answer:
      "Connect tasks have **worker** coordination, **offset** storage in **internal** topics, and **connector**-specific failure modes—**serialization** errors, **DLQs**, **rebalance** across workers. Treat it as **another** distributed client with its own dashboards.",
  },
  {
    question: "When would you choose **RabbitMQ**-style queues over **Kafka** logs?",
    answer:
      "When you need **classic** **work queues**, **per-message** ack competition, and **low-latency** **push** semantics without **replay** as a first-class requirement. **Kafka** wins for **durable**, **replayable**, **high-throughput** **event** backbones.",
  },
  {
    question: "What does the **CAP** trade-off imply for **Kafka** under a partition outage?",
    answer:
      "Per partition, **availability** vs **consistency** shows up as **accepting writes** vs **blocking** on **ISR** (**acks=all** + **min ISR**). Interviewers want **partition-scoped** reasoning, not buzzwords without **operational** levers.",
  },
  {
    question: "Why is **Schema Registry** compatibility a **deployment** concern?",
    answer:
      "**BACKWARD**/**FORWARD** modes decide whether **old** consumers can read **new** data or vice versa. A breaking schema pushed without policy breaks **consumers** or **connectors**—treat schemas like **API** contracts with **CI** gates.",
  },
  {
    question: "What problem do **Kafka Streams** **changelog** topics solve?",
    answer:
      "They back **state stores** for **fault-tolerant** **stateful** processing: after restarts, state can **restore** from **changelog** **replaying** from Kafka. Mis-sized **replication** or **retention** here loses **recovery** guarantees.",
  },
];

const POOL_CODE = [
  {
    question: "In Java, why is `Math.floorMod(key.hashCode(), numPartitions)` only a teaching toy?",
    answer:
      "Real partitioners use the **client** implementation and may **murmur** hash or differ by version; `hashCode` **stability** across JVM versions is not a broker contract. Use the **producer** API and tests rather than reimplementing internals.",
  },
  {
    question: "What does `NOT_LEADER_FOR_PARTITION` imply for a producer retry loop?",
    answer:
      "**Metadata** is stale: **leader** moved. **Refresh** metadata and retry with backoff—avoid **tight** loops that **amplify** load. Also verify **cluster** health and **client** timeouts.",
  },
  {
    question: "How does `max.block.ms` affect producer `send()` behavior?",
    answer:
      "It bounds how long **send** can block when the **metadata** or **buffer** is unavailable. Too low → **fail fast** under stress; too high → **threads** stall. Tune with **buffer** memory and **delivery** timeout together.",
  },
  {
    question: "What is the difference between `enable.auto.commit` and **manual** commits?",
    answer:
      "**Auto commit** commits **periodically** and can commit **before** processing finishes → **at-least-once** hazards. **Manual** commits after processing align **offsets** with **side effects**—with **rebalance** pitfalls if mis-ordered.",
  },
  {
    question: "Why might `session.timeout.ms` and `heartbeat.interval.ms` be tuned together?",
    answer:
      "**Heartbeats** must arrive **often enough** to keep the session alive while tolerating **GC** pauses and **network** jitter. **Tight** sessions cause **false** **failures** and **rebalances**; **loose** sessions slow **failure** detection.",
  },
  {
    question: "What does Spring Kafka `@KafkaListener` **concurrency** actually scale?",
    answer:
      "It scales **threads** in the **listener container**, but **throughput** per partition is still **serialized**—you need **enough partitions** to use extra threads. Misunderstanding this leads to **idle** threads and **unchanged** lag.",
  },
  {
    question: "How do you model **retry** for a failing record without blocking `poll()` forever?",
    answer:
      "Use **non-blocking** retry topics, **pause**/**resume** partitions, or **delegate** to **async** processing with **bounded** queues. **Blocking** the poll loop trips **max.poll.interval** and **kills** the consumer.",
  },
  {
    question: "What is a typical **Connect** **Single Message Transform** risk?",
    answer:
      "**SMTs** can **drop** fields silently, **rename** keys, or **break** schema evolution if not tested. Keep transforms **visible** in **config** reviews and **contract** tests.",
  },
  {
    question: "Why might **Avro** **GenericRecord** be slower than **SpecificRecord**?",
    answer:
      "**Specific** code generation avoids **schema** resolution overhead and enables **stronger** typing in **hot** paths. **Generic** is flexible but pays **reflection-like** costs—measure before micro-optimizing.",
  },
  {
    question: "What does `isolation.level=read_committed` change for a consumer?",
    answer:
      "It hides **uncommitted** **transactional** messages until commit, aligning reads with **transaction** boundaries. **Latency** can increase; use only when **transactions** are in play.",
  },
  {
    question: "How do you test **idempotent** producer behavior without a real cluster?",
    answer:
      "Use **testcontainers** or a small **staging** cluster, inject **broker** **errors** and **leader** movement, assert **no duplicates** at the **log** for a fixed **sequence** and **producer** id.",
  },
  {
    question: "What is the purpose of **`linger.ms`** and **`batch.size`** together?",
    answer:
      "**Linger** waits to **fill** batches for **higher** compression and **throughput**; **batch.size** caps bytes. **Tuning** trades **latency** vs **efficiency**—watch **p99** produce latency when increasing linger.",
  },
  {
    question: "Why might **`fetch.max.wait.ms`** reduce empty fetches but raise latency?",
    answer:
      "Brokers **wait** up to this bound to **accumulate** data, reducing **busy** polling. Under **low** traffic it can add **wait** time—pair with **`fetch.min.bytes`** consciously.",
  },
  {
    question: "What does **`enable.idempotence=true`** typically imply for other producer configs?",
    answer:
      "It enables **idempotent** semantics and may adjust **retries** and **`acks`** expectations—**interviewers** expect you to read **docs** for your **exact** client version rather than memorizing defaults.",
  },
  {
    question: "In Streams, what does **`commitIntervalMs`** interact with?",
    answer:
      "It controls how often **processed** state **commits** and interacts with **latency** vs **durability** of **state** and **punctuators**. **Changelog** replay still backs recovery, but **tuning** impacts failure windows.",
  },
  {
    question: "What AWS **SQS** **`VisibilityTimeout`** protects against?",
    answer:
      "It hides a message from other consumers while one **worker** processes it. Too short → **duplicate** processing; too long → **slow** recovery on crashes.",
  },
  {
    question: "How does **SNS** fan-out differ from a Kafka **topic** with many consumer groups?",
    answer:
      "**SNS** pushes to **many** **subscribers** (SQS, Lambda, HTTP) operationally distinct from Kafka’s **pull** **consumer groups** reading **one** log. **Cost**, **retry**, and **ordering** models differ—do not conflate them.",
  },
  {
    question: "What is a **vector clock** useful for in **distributed** data discussions?",
    answer:
      "Capturing **causal** order across **replicas** to detect **concurrent** updates—useful when explaining **conflict** resolution beside **Kafka**’s **ordering** guarantees.",
  },
  {
    question: "Why is **quorum** `2f+1` relevant when comparing to **Kafka ISR**?",
    answer:
      "Classic **quorum** systems tolerate **`f`** failures with **votes**; **Kafka** uses **leader** + **ISR** replication with different **availability** and **durability** semantics—**analogies** help but **do not** equate the models.",
  },
  {
    question: "What is the hazard of **`while(true)`** processing inside a consumer `poll` loop?",
    answer:
      "You **starve** **heartbeat** and **partition** fetch threads if work runs on the **same** thread without **pausing** and **yielding**—violates **max.poll.interval** assumptions. **Offload** work or **pause** partitions.",
  },
];

export function extraInterviewForDay(n) {
  const idx = Math.max(0, n - 59) * 2;
  const conceptual = [];
  const codeBased = [];
  for (let k = 0; k < 2; k += 1) {
    conceptual.push(POOL_CONCEPTUAL[(idx + k) % POOL_CONCEPTUAL.length]);
    codeBased.push(POOL_CODE[(idx + k) % POOL_CODE.length]);
  }
  return { conceptual, codeBased };
}
