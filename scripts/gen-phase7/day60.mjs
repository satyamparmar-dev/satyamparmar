import { conceptualItem, codeBasedItem, seniorItem, scenarioDrillItem } from '../gen-phase6/lib.mjs';

const T = 'Kafka producers';

const conceptual = [
  conceptualItem('What does **acks=all** mean?', 'Producer waits for **all** **in-sync replicas** to **ack** according to **broker** **ISR** policy before **success**—pairs with **min.insync.replicas** for **real** durability.', T),
  conceptualItem('Why **enable.idempotence=true**?', 'Producer **dedupes** **retries** with **sequence** numbers so **network** blips **do not** create **distinct** duplicate **records** at the broker **layer**.', T),
  conceptualItem('How do **retries** interact with **ordering**?', '**max.in.flight.requests.per.connection** >1 with **retries** can **reorder** **batches** on failure—tune for **latency** vs **ordering** risk.', T),
  conceptualItem('What is **delivery.timeout.ms**?', 'Upper bound for **send** attempts including **retries**—after it **fails** the record **unless** you handle **exceptions**.', T),
  conceptualItem('**linger.ms** vs **batch.size**?', '**linger** trades **latency** for **better** **batching**; **batch.size** caps **bytes** per **batch**—both **affect** throughput.', T),
  conceptualItem('Why **compression.type** matters?', 'Less **network** and **disk** at **cost** of **CPU** on **clients** and **brokers**—pick **lz4**/**zstd** per **SLA**.', T),
  conceptualItem('What is **acks=1** risk?', 'Leader **ack** before **followers** **catch** up—broker **loss** may **lose** data if **leader** had **not** **replicated**.', T),
  conceptualItem('**buffer.memory** exhaustion symptom?', '**block** on **send** or **timeout** depending on **max.block.ms**—indicates **slow** brokers or **too** small **buffer**.', T),
  conceptualItem('**partitioner** and **sticky** partitioner?', '**Sticky** batches **same** **partition** for **null** keys improving **batching** efficiency in modern clients.', T),
  conceptualItem('**Transactional** producer outline?', '**initTransactions**, **beginTransaction**, **send** + **commitTransaction** coordinates with **consumers** reading **committed** **offsets** with **isolation** **level**—heavier **latency** cost.', T),
  conceptualItem('Why avoid unbounded **retries** without **jitter**?', '**Retry** storm amplifies **outage** load on **already** **sick** **cluster**.', T),
  conceptualItem('**metadata.max.age.ms** relevance?', 'How long **client** **caches** **topic** **metadata** before **refresh**—stale **metadata** causes **NOT_LEADER** loops.', T),
  conceptualItem('**enable.idempotence** prerequisites?', 'Typically requires **acks=all** and **retries>0**; **check** **broker** **version** compatibility.', T),
  conceptualItem('What is **producer** **metric** **record-error-rate**?', 'Count of **failed** **sends**—pair with **broker** **under-replicated** **partitions** triage.', T),
  conceptualItem('**Sampling** vs full **trace** for Kafka?', 'At high **RPS**, **sample** **headers** for **correlation** while **metrics** stay **primary** **SLO** view.', T),
];

const codeBased = [
  codeBasedItem('Properties snippet: **acks all** + **idempotence**.', '// p.put("acks","all"); p.put("enable.idempotence","true");'),
  codeBasedItem('**KafkaProducer** send **Callback** purpose.', '// onCompletion(metadata, exception) for async error handling'),
  codeBasedItem('**flush** and **close** on shutdown.', '// producer.flush(); producer.close(Duration.ofSeconds(10));'),
  codeBasedItem('**max.block.ms** meaning.', '// time wait for metadata buffer space when sending'),
  codeBasedItem('**compression.type=lz4** one-liner benefit.', '// CPU vs bandwidth trade-off faster than gzip often'),
  codeBasedItem('**transactional.id** why needed?', '// fencing and epoch for exactly-once producer sessions'),
  codeBasedItem('**buffer.memory** tuning direction under backlog.', '// raise buffer or fix broker throughput'),
  codeBasedItem('**batch.size** too small symptom.', '// low throughput high request count'),
  codeBasedItem('**linger.ms** zero vs five ms trade.', '// lower latency vs bigger batches'),
  codeBasedItem('**RecordMetadata** fields interview.', '// topic partition offset timestamp'),
];

const seniorScenario = [
  seniorItem('**Incident:** **Duplicate** charges after **Kafka** **brownout**.', 'Freeze risky **consumers**; check **idempotence**.', '**Idempotence** **disabled** + **aggressive** **retries**.', 'Enable **idempotence**; **business** **idempotency** keys.', 'Dashboard **producer** **error** rate.'),
  seniorItem('**Ops:** **acks=all** but **silent** **loss** risk.', 'Check **min ISR** vs **RF**.', '**min.insync.replicas** too low.', 'Raise **min ISR**; **alert** **under-replicated**.', 'Policy lint on **topic** configs.'),
  seniorItem('**Latency:** **p99** produce spikes after **compression** change.', 'Rollback **compression** flag.', '**zstd** **level** too high on **small** **messages**.', 'Switch **algorithm** or **level**; **batch** better.', 'Microbench **payload** mix.'),
  seniorItem('**Design:** **Ordered** **per user** events.', 'Partition key = **userId**.', 'Wrong key → **cross-partition** reorder.', 'Enforce **key** in **API** contract.', 'Chaos test **leader** failover ordering.'),
  seniorItem('**Bug:** **metadata** storm from **tight** **retry** loop.', 'Back off **clients**.', '**NOT_LEADER** **treated** as **fatal** without **refresh** guard.', 'Exponential backoff + cap.', 'Synthetic **leader** step-down test.'),
  seniorItem('**Cost:** **10GB/s** egress from **produce** **fan-in**.', 'Placement + **compression**.', '**JSON** **uncompressed** across **regions**.', '**Schema** **binary** + **compression** + **regional** **clusters**.', 'FinOps dashboard per team.'),
];

const wrongAnswers = [
  '**Idempotence** removes need for **consumer** **dedupe** — **Correction:** **Still** need **business** **idempotency** for **side effects**.',
  '**acks=0** is fine for **money** — **Correction:** **No** delivery guarantee.',
  '**batch.size** only affects **broker** — **Correction:** **Client** **batching** first.',
  '**Infinite** **retries** always heal the cluster — **Correction:** **Can** **DDOS** **yourself**.',
  '**Producer** never needs **flush** — **Correction:** **Shutdown** **paths** need **flush/close**.',
  '**Same** **key** optional for **ordering** — **Correction:** **Ordering** is **partition-scoped** with **key** routing.',
  '**compression** is free — **Correction:** **CPU** **cost** on both sides.',
  '**Transactional** producer is default — **Correction:** **Overhead**; use when **EOS** story **requires** it.',
];

const why = `**Producers** decide **how** events **enter** the **log**: **durability**, **latency**, and **duplicate** behavior **start** here. Senior interviews probe **acks**, **idempotence**, **batching**, and **transactional** trade-offs with **numbers**, not slogans.\n\nMisconfigured **retries** and **ISR** policies cause **duplicate** downstream **effects** or **silent** **durability** gaps—tie fixes to **metrics** and **topic** **policy**.`;

const theory = `### Day 60 — **Kafka** **producers**\n\n### 1. Durability triangle\n**acks**, **retries**, **delivery.timeout.ms**, and **min.insync.replicas** must be reasoned **together**.\n\n### 2. Idempotence\n**PID** + **sequence** numbers **dedupe** producer **retries** at the protocol.\n\n### 3. Throughput tuning\n**linger.ms**, **batch.size**, **compression**, **buffer.memory**.\n\n### 4. Ordering pitfalls\n**in-flight** + **retries** can **reorder** unless constrained.\n\n### 5. Transactions\nFor **read-process-write** EOS patterns—latency and **operational** complexity rise.\n\n### 6. Story\n**Brownout** + **disabled** idempotence → **finance** duplicates; fix **idempotence** + **outbox** consumers.`;

const basic = {
  title: 'Basic — Producer vocabulary',
  filename: 'Day60Basic.java',
  description: 'Print acks and idempotence headline.',
  code: `package arch.day60;

public class Day60Basic {
    public static void main(String[] args) {
        System.out.println("acks=all waits on ISR policy");
        System.out.println("enable.idempotence dedupes producer retries");
        System.out.println("linger.ms trades latency for batching");
    }
}
`,
  output: `acks=all waits on ISR policy
enable.idempotence dedupes producer retries
linger.ms trades latency for batching
`,
};

const intermediate = {
  title: 'Intermediate — Effective batch size estimate',
  filename: 'Day60Intermediate.java',
  description: 'Toy: records per batch from total bytes and avg record size.',
  code: `package arch.day60;

public class Day60Intermediate {
    public static void main(String[] args) {
        int batchBytes = 32768;
        int avgRecord = 512;
        int est = batchBytes / avgRecord;
        System.out.println("estRecordsPerBatch=" + est);
    }
}
`,
  output: `estRecordsPerBatch=64
`,
};

const advanced = {
  title: 'Advanced — Retry budget toy',
  filename: 'Day60Advanced.java',
  description: 'Cap attempts with a simple retry loop budget.',
  code: `package arch.day60;

public class Day60Advanced {
    public static void main(String[] args) {
        int attempts = 0;
        int max = 5;
        boolean ok = false;
        while (!ok && attempts < max) {
            attempts++;
            ok = attempts >= 3;
        }
        System.out.println("attempts=" + attempts + " ok=" + ok);
    }
}
`,
  output: `attempts=3 ok=true
`,
};

const diagram = {
  title: 'Producer to leader and ISR',
  description: 'Producer batches; replicas acknowledge per acks policy.',
  plantuml: `@startuml
title Day 60 — Producer path
Producer -> Leader : produce request
Leader -> ISRfollowers : replicate
ISRfollowers --> Leader : caught up
Leader --> Producer : ack per acks config
@enduml`,
};

const pitfalls = [
  '**acks=all** **without** enforcing **min ISR** **on** **topic**.',
  '**Idempotence** **off** with **aggressive** **retries** on **payments**.',
  '**Huge** **linger** **hurting** **p99** **without** **measuring** **batch** **gain**.',
  '**Ordering** **assumed** **with** **high** **in-flight** + **retries**.',
  '**No** **alerts** on **record-error-rate** or **metadata** **age**.',
  '**Transactional** **misused** for **every** **event** **adding** **latency**.',
  '**Unbounded** **threads** **calling** **send** **without** **handling** **backpressure**.',
  '**Compression** **level** **picked** **without** **CPU** **profiling**.',
];

const exerciseSolution = `package arch.day60;

public class Day60Exercise {
    public static void main(String[] args) {
        System.out.println("acks=all + min.insync.replicas + replication factor");
    }
}
`;

const exercise = {
  titleSuffix: 'Kafka producers — durability trio (Day 60 assignment)',
  problem: 'Print **exactly**: acks=all + min.insync.replicas + replication factor',
  hints: ['Single **println** line as in assignment.'],
  solution: exerciseSolution,
  difficulty: 'Advanced',
};

const cheatsheet = `| Knob | Effect |
|---|---|
| acks | Durability vs latency |
| idempotence | Retry-safe protocol dedupe |
| retries | Recovery vs storm risk |
| linger/batch | Throughput vs latency |
| buffer.memory | Backpressure surface |
| compression | Bandwidth vs CPU |
| delivery.timeout | Hard cap on attempts |
| transactional.id | EOS sessions fencing |
| max.in.flight | Ordering vs throughput |
| partitioner | Key to partition routing |`;

const drillSeeds = [
  { question: 'Code review: **producer** **acks=1** **for** **ledger** topic.', signals: ['durability', 'money', 'ISR'], core: { root: '**Insufficient** **durability** for **financial** events.', breaks: '**Silent** **loss** on **leader** failure window.', fix: '**acks=all** + **min ISR** policy.', angle: 'Quote **RF** vs **writes** min.', fq1q: 'Test?', fq1a: '**Kill** **leader** **during** **load** with **monotonic** **verifier**.', fq2q: 'Observability?', fq2a: '**Under-replicated** + **producer** **latency**.' } },
  { question: '**Incident:** **Error** rate **spike** **metadata** **age** high.', signals: ['metadata', 'broker', 'controller'], core: { root: '**Controller** churn or **broker** **overload**.', breaks: 'Clients **stall** in **max.block**.', fix: 'Stabilize **cluster**; **backoff** **apps**.', angle: 'Correlate **controller** metrics.', fq1q: 'Runbook?', fq1a: '**Escalate** **platform** with **timeline**.', fq2q: 'Prevention?', fq2a: '**Synthetic** **metadata** **hammers** in **staging**.' } },
  { question: '**Design:** **At-least-once** produce + **exactly-once** **downstream** charge.', signals: ['EOS', 'outbox', 'idempotency'], core: { root: 'Need **idempotent** **consumer** + **key** strategy.', breaks: '**Duplicates** **double** **charge**.', fix: '**Outbox** **or** **dedupe** **table**.', angle: 'End-to-end story.', fq1q: 'Who owns?', fq1a: '**Service** team **owns** **consumer** **dedupe**.', fq2q: 'Metric?', fq2a: '**Replay** duplicate **detector**.' } },
  { question: '**Trade-off:** **gzip** vs **lz4** on **JSON** events.', signals: ['cpu', 'bandwidth', 'latency'], core: { root: '**gzip** shrinks more but **CPU** heavy.', breaks: '**p99** **produce** **up**.', fix: '**lz4** or **zstd** tuned.', angle: 'Measure **bytes** out and **CPU**.', fq1q: 'Mobile clients?', fq1a: 'If none, **favor** **broker** friendly codec.', fq2q: 'Schema?', fq2a: '**Avro**/**Protobuf** beats raw JSON.' } },
  { question: '**Gotcha:** **linger=50ms** **without** acknowledging **latency** **SLO** change.', signals: ['SLO', 'product', 'latency'], core: { root: 'Hidden **latency** **budget** burn.', breaks: '**UX** regression **blamed** on **network**.', fix: '**Canary** **linger** with **dashboard**.', angle: 'Product **sign-off**.', fq1q: 'Rollback?', fq1a: '**Feature** **flag** **per** **topic**.', fq2q: 'Guardrail?', fq2a: '**p95** produce **SLO** **burn** alert.' } },
  { question: '**Senior:** **Platform** mandates **idempotence** defaults.', signals: ['starter', 'governance', 'spring'], core: { root: '**Heterogeneous** clients ignore **policy**.', breaks: 'Incidents **repeat**.', fix: '**Lint** **terraform** + **golden** **Spring** config.', angle: '**Break** on **noncompliant** CI.', fq1q: 'Legacy?', fq1a: '**CAR** per **service**.', fq2q: 'Metric?', fq2a: '**%** producers **compliant**.' } },
  { question: '**Security:** **SASL** creds in **env** leaked in **traces**.', signals: ['secrets', 'logging'], core: { root: '**Verbose** **debug** on **producer** builder.', breaks: '**Credential** **rotation** emergency.', fix: 'Redact **logs**; **secret** manager.', angle: 'OWASP logging.', fq1q: 'Detect?', fq1a: '**Scanner** on **CI** **log** fixtures.', fq2q: 'Process?', fq2a: '**On-call** **redaction** checklist.' } },
  { question: '**Scale:** **10k** partitions **metadata** refresh storm on **restart**.', signals: ['restart', 'cache', 'burst'], core: { root: '**Thundering** herd **refreshes** simultaneously.', breaks: '**Controller** **overload**.', fix: '**Stagger** **deploys** + **raise** **metadata.max.age** thoughtfully.', angle: '**Chaos** **restart** **tests**.', fq1q: 'Edge?', fq1a: '**Service** mesh **health** gates.', fq2q: 'Long-term?', fq2a: '**Fewer** **micro** topics via **subject** design.' } },
  { question: '**Misconception:** "**Transactional** producer makes DB writes atomic."', signals: ['EOS', 'db', 'kafka'], core: { root: '**Kafka** txn boundary ≠ **DB** txn without **external** coordination.', breaks: '**Orphan** writes or **offsets** mismatch.', fix: '**Outbox** or **2PC** patterns **consciously**.', angle: 'Draw boundary on board.', fq1q: 'Pattern?', fq1a: '**Transactional** **consume-process-produce** with correct isolation.', fq2q: 'Pitfall?', fq2a: '**Timeout** too low causing **abort** storms.' } },
  { question: '**Performance:** Broker **CPU** pegged after aggressive **zstd** for tiny payloads.', signals: ['cpu', 'compression', 'broker'], core: { root: 'Codec cost dominates for small messages.', breaks: 'Cluster-wide produce p99 degrades.', fix: 'Tune level, switch to lz4, or grow message batches.', angle: 'Profile broker threads.', fq1q: 'Client-side?', fq1a: 'Batch more before compress if SLO allows.', fq2q: 'Schema?', fq2a: 'Binary formats reduce bytes before compression.' } },
];

export const drill60 = {
  day: 60,
  title: 'Kafka Producers Deep Dive',
  phaseId: 'phase7',
  tags: ['producer', 'acks', 'idempotence', 'batching', 'retries', 'compression', 'transactions'],
  scenarios: drillSeeds.map((s, i) => scenarioDrillItem(60, i + 1, s.question, s.signals, s.core)),
};

export default {
  day: 60,
  title: 'Kafka Producers Deep Dive',
  estimatedHours: 4,
  tags: ['Senior', 'Advanced', 'Phase 7', 'Interview Prep', 'Satyverse(Satyam Parmar)', 'Kafka'],
  prerequisites: ['Day 59', 'Day 58'],
  learningObjectives: [
    'Tune **acks**, **retries**, and **delivery.timeout.ms** with clear durability semantics',
    'Use **idempotent** producers and explain duplicate handling vs consumer idempotency',
    'Balance **linger**, **batch.size**, and **compression** against latency SLOs',
    'Diagnose **metadata** issues and **buffer** exhaustion from producer metrics',
    'Contrast **transactional** producers with at-least-once defaults',
    'Present a coherent **min ISR** + **RF** story for payment-grade topics',
  ],
  why,
  theory,
  codes: [basic, intermediate, advanced],
  diagram,
  pitfalls,
  exercise,
  cheatsheet,
  interview: { conceptual, codeBased, seniorScenario, wrongAnswers },
};
