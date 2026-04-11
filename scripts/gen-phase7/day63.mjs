import { conceptualItem, codeBasedItem, seniorItem, scenarioDrillItem } from '../gen-phase6/lib.mjs';

const T = 'Kafka Streams';

const conceptual = [
  conceptualItem('What is a **topology**?', 'Directed graph of **processors** (sources, sinks, stateful ops) compiled from **StreamsBuilder**.', T),
  conceptualItem('**KStream** vs **KTable**?', '**KStream** is **record** stream; **KTable** is **changelog**-backed **key-value** **materialization**.', T),
  conceptualItem('What is **changelog** topic?', 'Durable **log** backing **state stores** for **fault** tolerance and **restore**.', T),
  conceptualItem('**Windowed** operations?', '**Time-based** **grouping** with **grace** period for **lateness** handling.', T),
  conceptualItem('**Interactive Query** (IQ)?', 'Expose **local** **state** **stores** for **read** **side** serving with **metadata** routing.', T),
  conceptualItem('**Repartition** topic?', 'Reroute **keys** through internal topic to shuffle data for joins/aggregations.', T),
  conceptualItem('**Exactly-once** in Streams?', '**processing.guarantee** with EOS enabled coordinates producer/consumer of internal topics.', T),
  conceptualItem('**State** dir and **RocksDB**?', 'Persistent **KV** stores per **tasks**; disk footprint grows with keyspace.', T),
  conceptualItem('**Punctuate** API?', '**Time**-driven **callbacks** for periodic maintenance or **emitting** derived outputs.', T),
  conceptualItem('**Join** types high level?', 'Stream-stream, stream-table, table-table with **co-partitioning** requirements.', T),
  conceptualItem('**Serdes** role?', 'Serialize/deserialize with **Schema**-aware formats across operators.', T),
  conceptualItem('**Task** == partitions?', 'Each **stream thread** runs **tasks** mapped to **partition-task** assignments.', T),
  conceptualItem('**Standby replicas**?', 'Warm **replicas** to **restore** faster on failure at **extra** disk/network cost.', T),
  conceptualItem('Why **co-partition** for joins?', 'Join keys must land on **same** partition across source topics after **repartition** alignment.', T),
  conceptualItem('**Grace** period pitfall?', 'After **grace**, late records dropped—**document** business tolerance.', T),
];

const codeBased = [
  codeBasedItem('**StreamsBuilder.stream** topic.', '// KStream<String,String> s = builder.stream("orders");'),
  codeBasedItem('**groupByKey** before count.', '// grouped.keySerde required'),
  codeBasedItem('**windowedBy** with **TimeWindows**.', '// ofSizeAndGrace duration parameters'),
  codeBasedItem('**toTable** from stream.', '// Materialize changelog semantics'),
  codeBasedItem('**leftJoin** stream-table.', '// facts enriched with slowly changing dim'),
  codeBasedItem('**suppress** operator purpose.', '// reduce churn until window closes'),
  codeBasedItem('**Materialized.as** store name.', '// names changelog topics + directories'),
  codeBasedItem('**Properties** **processing.guarantee**.', '// exactly_once_v2 vs at_least_once'),
  codeBasedItem('**globalTable** pattern.', '// replicated table for broadcast lookups'),
  codeBasedItem('**KTable.filter** side effects.', '// triggers changelog compaction semantics'),
];

const seniorScenario = [
  seniorItem('**Incident:** **Restore** time hours after **broker** outage.', 'Check **changelog** retention.', '**Retention** shorter than **restore** gap.', 'Raise retention or **standby** replicas.', 'Synthetic **kill** task drill.'),
  seniorItem('**Bug:** **Join** missing events after **repartition** skew.', 'Key audit.', 'Keys not co-partitioned.', 'Fix **partition count** + **key** strategy.', 'Contract tests on join outputs.'),
  seniorItem('**Ops:** Disk 95% on **state.dir**.', 'Stop-the-world risk.', 'RocksDB **growth** unbounded.', 'Right-size disk + **standby** + compact state.', 'Alert early.'),
  seniorItem('**Design:** **24/7** analytics wants **exact** late data forever.', 'Challenge requirements.', 'Infinite grace impossible.', 'Separate **late lane** topic + **approx** window.', 'SLA doc.'),
  seniorItem('**Scale:** **Single** **thread** pegs CPU on heavy **aggregate**.', 'Profile hot store.', 'Key explosion.', 'Salting for analytics or pre-aggregation upstream.', 'Capacity model.'),
  seniorItem('**Migration:** **EOS** toggle during peak.', 'Freeze change.', 'Abort storm risk.', 'Blue/green apps with feature flag.', 'Runbook validation.'),
];

const wrongAnswers = [
  '**Streams** removes need for **topics** — **Correction:** **Internal** topics still exist.',
  '**KTable** always small — **Correction:** **High** cardinality still explodes.',
  '**Join** works without **same** partitions — **Correction:** **Repartition** required unless already aligned.',
  '**IQ** always linearly scalable — **Correction:** **State** locality constraints.',
  '**Suppress** fixes **ordering** globally — **Correction:** Partition ordering still applies.',
  '**RocksDB** needs no monitoring — **Correction:** **Disk** and **compaction** pressure matter.',
  '**Streams** is only for JVM batch — **Correction:** Continuous streaming model.',
  '**grace=0** is always best — **Correction:** Late data dropped unexpectedly.',
];

const why = `**Kafka Streams** collapses **stream** processing into **library** form—no separate **cluster** to babysit—but **state**, **partitions**, and **join** constraints still dominate **on-call** stories.\n\nInterviewers expect you to know **changelog**, **restore**, **repartition**, and **grace** trade-offs with numbers.`;

const theory = `### Day 63 — **Kafka** **Streams**\n\n### 1. Building blocks\n**StreamsBuilder**, **KStream**, **KTable**, **GlobalKTable**.\n\n### 2. Stateful ops\n**aggregate**, **reduce**, **join** with **materialized** stores.\n\n### 3. Fault tolerance\n**Changelog** + **restore** from Kafka.\n\n### 4. Windows\n**Tumbling**, **sliding**, **grace**.\n\n### 5. EOS\n**Exactly-once** processing toggle and broker requirements.\n\n### 6. Story\n**Restore** storm after retention misconfig → extend retention + **standby**.`;

const basic = {
  title: 'Basic — Streams vocabulary',
  filename: 'Day63Basic.java',
  description: 'Stream vs table headline.',
  code: `package arch.day63;

public class Day63Basic {
    public static void main(String[] args) {
        System.out.println("KStream: append-only event flow");
        System.out.println("KTable: compacted changelog view");
        System.out.println("changelog: durable backing log for state");
    }
}
`,
  output: `KStream: append-only event flow
KTable: compacted changelog view
changelog: durable backing log for state
`,
};

const intermediate = {
  title: 'Intermediate — Word split toy',
  filename: 'Day63Intermediate.java',
  description: 'Split line to tokens for windowed count mental model.',
  code: `package arch.day63;

public class Day63Intermediate {
    public static void main(String[] args) {
        String line = "kafka streams rock";
        for (String w : line.split(" ")) {
            System.out.println(w);
        }
    }
}
`,
  output: `kafka
streams
rock
`,
};

const advanced = {
  title: 'Advanced — Window bucket toy',
  filename: 'Day63Advanced.java',
  description: 'Floor division timestamp to 60s window.',
  code: `package arch.day63;

public class Day63Advanced {
    public static void main(String[] args) {
        long ts = 130L;
        long win = 60L;
        System.out.println("bucket=" + (ts / win));
    }
}
`,
  output: `bucket=2
`,
};

const diagram = {
  title: 'Stateful processor with changelog',
  description: 'Tasks persist to RocksDB and changelog topic.',
  plantuml: `@startuml
title Day 63 — Kafka Streams state
participant Task
database RocksDB
queue Changelog
Task -> RocksDB : read/write
Task -> Changelog : append updates
Changelog -> Task : restore on restart
@enduml`,
};

const pitfalls = [
  '**Changelog** **retention** shorter than **restore** horizon.',
  '**Join** **without** verifying **co-partitioning**.',
  '**Unbounded** **key** space in **aggregate** with no **TTL** strategy.',
  '**EOS** **misconfigured** broker version compatibility.',
  '**Disk** **alerts** missing on **state** **volume**.',
  '**Grace** **too** **small** causing **silent** drops.',
  '**Repartition** **explosion** from sloppy key mapping.',
  '**Interactive** **queries** **without** **routing** metadata coverage.',
];

const exerciseSolution = `package arch.day63;

public class Day63Exercise {
    public static void main(String[] args) {
        System.out.println("aggregate, join (materialized state + changelog)");
    }
}
`;

const exercise = {
  titleSuffix: 'Kafka Streams — stateful ops (Day 63 assignment)',
  problem: 'Print **exactly**: aggregate, join (materialized state + changelog)',
  hints: ['Matches assignment expectedOutput verbatim.'],
  solution: exerciseSolution,
  difficulty: 'Advanced',
};

const cheatsheet = `| Concept | Recall |
|---|---|
| topology | Processor graph |
| changelog | Durable state log |
| RocksDB | Local KV persistence |
| repartition | Shuffle via internal topic |
| grace | Late record tolerance |
| IQ | Serve local state |
| EOS mode | Broker + client pairing |
| standby | Faster failover |
| co-partition | Join prerequisite |
| suppress | Reduce output churn |`;

const drillSeeds = [
  { question: 'Code review: **changelog** retention 1h for **7** day **restore** SLA.', signals: ['retention', 'restore', 'pager'], core: { root: 'Cannot rebuild state after long downtime.', breaks: 'Silent bad aggregates after deploy.', fix: 'Raise retention + size disks for replay.', angle: 'Calculate worst-case restore window.', fq1q: 'Standby?', fq1a: 'Reduce restore but not replace retention math entirely.', fq2q: 'Test?', fq2a: 'Kill node for weekend drill.' } },
  { question: '**Incident:** **Join** output missing partner events.', signals: ['partition', 'key', 'join'], core: { root: 'Keys not routed to matching partitions.', breaks: 'Silent data loss in analytics.', fix: 'Align topic partition counts + repartition explicitly.', angle: 'Whiteboard key path.', fq1q: 'Detect?', fq1a: 'Side-output unmatched keys metrics.', fq2q: 'Quick fix?', fq2a: 'Temporary dual write with reconciliation job.' } },
  { question: '**Design:** **GlobalKTable** vs **KTable** for **currency** rates.', signals: ['broadcast', 'size', 'IQ'], core: { root: 'Global replicated to all instances.', breaks: 'Memory blow if table huge.', fix: 'Partitioned KTable + join if small enough or external cache.', angle: 'Measure row cardinality.', fq1q: 'Update latency?', fq1a: 'Changelog propagation delay budget.', fq2q: 'Failure?', fq2a: 'Stale rate metric with alerting.' } },
  { question: '**Trade-off:** **suppress** until window close vs immediate emits.', signals: ['latency', 'churn', 'storage'], core: { root: 'Suppress delays visibility but reduces downstream noise.', breaks: 'Ops confused during incidents without dashboards.', fix: 'Document latency budget + metrics on suppressed buffers.', angle: 'UX for analysts.', fq1q: 'Memory?', fq1a: 'Bound suppress store with max records.', fq2q: 'Upgrade?', fq2a: 'Feature flag per topology branch.' } },
  { question: '**Gotcha:** **processing.guarantee** switched without broker support.', signals: ['eos', 'version'], core: { root: 'Transactions not fully available in cluster.', breaks: 'Task fails to start.', fix: 'Verify broker.version and configs; rollback flag.', angle: 'Pre-deploy checklist automation.', fq1q: 'Metric?', fq1a: 'Streams thread died with txn errors.', fq2q: 'Comms?', fq2a: 'Link to upgrade ticket for tracking.' } },
  { question: '**Senior:** central **Streams** **SRE** checklist.', signals: ['platform', 'gold', 'lint'], core: { root: 'Teams ship fat stateful topologies without review.', breaks: 'Shared cluster disk incidents.', fix: 'Mandatory sizing worksheet + auto disk alerts.', angle: 'Architectural review board.', fq1q: 'Metric?', fq1a: 'Bytes per store per service.', fq2q: 'Penalty?', fq2a: 'No prod deploy without sign-off.' } },
  { question: '**Security:** **IQ** endpoint exposes PII state store.', signals: ['pii', 'http'], core: { root: 'No authz on embedded server.', breaks: 'Data leak.', fix: 'mTLS + scoped reads + disable in prod.', angle: 'Threat model per topology.', fq1q: 'Audit?', fq1a: 'Quarterly penetration test item.', fq2q: 'Alternative?', fq2a: 'Export snapshots via controlled pipeline.' } },
  { question: '**Scale:** long **GC** pauses stall stream threads.', signals: ['gc', 'lag'], core: { root: 'Heap too large for latency targets.', breaks: 'Consumer kicked from group.', fix: 'Tune GC, reduce per-task heap, more instances.', angle: 'Correlate GC logs thread stall.', fq1q: 'Config?', fq1a: 'num.stream.threads per core guidance.', fq2q: 'Architecture?', fq2a: 'Break topology to smaller apps.' } },
  { question: '**Misconception:** "**Internal** topics are free."', signals: ['ops', 'money', 'kafka'], core: { root: 'They consume storage, ISR traffic, monitoring noise.', breaks: 'Surprise cloud bill.', fix: 'Tenant chargeback + retention policies.', angle: 'FinOps partnership.', fq1q: 'Metric?', fq1a: 'Bytes in internal topics.', fq2q: 'Cleanup?', fq2a: 'Remove unused topologies aggressively.' } },
  { question: '**Late data:** **Grace** ended; business still wants events.', signals: ['product', 'sla'], core: { root: 'Business expectation mismatch.', breaks: 'Finance discrepancies.', fix: 'Secondary late pipeline with reconciliation joins.', angle: 'Event contract version bump.', fq1q: 'Who decides?', fq1a: 'Data governance committee.', fq2q: 'Monitoring?', fq2a: 'Dropped late record counter by reason.' } },
];

export const drill63 = {
  day: 63,
  title: 'Kafka Streams',
  phaseId: 'phase7',
  tags: ['streams', 'KStream', 'KTable', 'state', 'changelog', 'window', 'join'],
  scenarios: drillSeeds.map((s, i) => scenarioDrillItem(63, i + 1, s.question, s.signals, s.core)),
};

export default {
  day: 63,
  title: 'Kafka Streams',
  estimatedHours: 4,
  tags: ['Senior', 'Advanced', 'Phase 7', 'Interview Prep', 'Satyverse(Satyam Parmar)', 'Kafka'],
  prerequisites: ['Day 62', 'Day 61'],
  learningObjectives: [
    'Explain **KStream**, **KTable**, **changelog**, and **RocksDB** state stores',
    'Design **joins** with correct **co-partitioning** and **repartition** strategy',
    'Tune **window** **grace**, **suppress**, and **retention** for late data policies',
    'Operate **Kafka Streams** with disk, **restore**, and **standby** awareness',
    'Contrast **at-least-once** and **exactly-once** processing modes with broker requirements',
    'Use **Interactive Queries** safely with authentication and data classification',
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
