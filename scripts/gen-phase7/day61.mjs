import { conceptualItem, codeBasedItem, seniorItem, scenarioDrillItem } from '../gen-phase6/lib.mjs';

const T = 'Kafka consumers';

const conceptual = [
  conceptualItem('What is **poll** loop responsibility?', '**poll** **fetches** records, **drives** **partition** **fetch** **negotiation**, and **sends** **heartbeats**; **long** gaps **trigger** **rebalance**.', T),
  conceptualItem('**enable.auto.commit** behavior?', 'Consumer **periodically** **commits** **offsets** **without** your **code** **choosing** **exactly** **after** **success** **processing**.', T),
  conceptualItem('**auto.offset.reset** latest vs earliest?', 'Where to **start** **without** **committed** **offset**; **latest** may **skip** **during** **outage** **if** **new** **group**.', T),
  conceptualItem('What is **cooperative** **rebalance**?', '**Incremental** **handoff** **reduces** **stop-the-world** compared to **eager** **rebalance**.', T),
  conceptualItem('**seek** API purpose?', '**Manual** **rewind** **or** **skip** **to** **timestamp** for **replay** **or** **recovery**.', T),
  conceptualItem('**isolation.level** read_committed?', 'Consumer **only** **reads** **transactionally** **committed** **records** when using **EOS** **producers**.', T),
  conceptualItem('**max.partition.fetch.bytes** trade?', '**Caps** **bytes** **per** **partition** **per** **fetch** **affecting** **memory** and **fairness**.', T),
  conceptualItem('Why **pause** **partitions**?', '**Backpressure** **signals** **to** **broker** when **downstream** **cannot** **accept** **more** **now**.', T),
  conceptualItem('**Static** **group** **membership**?', '**Sticky** **assignment** **without** **surprise** **rebalance** on **scale** **events** under **controlled** **ops**.', T),
  conceptualItem('**Deserializer** **errors** handling?', '**Poison** **byte** **payloads** need **DLQ** or **tombstone** **strategy** **not** **infinite** **retry**.', T),
  conceptualItem('**Consumer** **lag** formula intuition?', '**High** **watermark** **minus** **last** **consumed** **offset** per **partition** **aggregated**.', T),
  conceptualItem('**fetch.max.wait.ms** on consumer?', '**Long** **poll** **wait** for **batching** at **broker**.', T),
  conceptualItem('**Partition** **assignment** **strategy** examples?', '**Range**, **round-robin**, **sticky**, **cooperative-sticky** depending on **client** **version**.', T),
  conceptualItem('**Exactly-once** consumer myth?', '**Kafka** does **not** magically **EOS** **your** **DB** **writes**; **idempotent** **application** **layer** required.', T),
  conceptualItem('**Consumer** **interceptors** use?', '**Observability** **hooks** **around** **poll** **and** **commit**—**avoid** **heavy** **work** **there**.', T),
];

const codeBased = [
  codeBasedItem('**commitSync** after batch.', '// blocks until broker acks commit'),
  codeBasedItem('**commitAsync** pattern.', '// callbacks must handle ordering failures carefully'),
  codeBasedItem('**subscribe** with **rebalance** listener.', '// onPartitionsAssigned / onPartitionsRevoked hooks'),
  codeBasedItem('**wakeup** to interrupt **poll**.', '// consumer.wakeup() from another thread on shutdown'),
  codeBasedItem('**pause** **TopicPartition** list.', '// consumer.pause(tpSet) during downstream outage'),
  codeBasedItem('**ConsumerRecords** iteration.', '// for (ConsumerRecord r : records) process(r)'),
  codeBasedItem('**position** vs **committed**.', '// position current fetch; committed last group commit'),
  codeBasedItem('**consumer.group.id** must be stable.', '// new id resets offset cursor'),
  codeBasedItem('**max.poll.records** tuning.', '// batch size per poll vs handler time'),
  codeBasedItem('**allow.auto.create.topics** risk.', '// accidental topic explosion if mis-set'),
];

const seniorScenario = [
  seniorItem('**Incident:** **Cooperative** rebalance loop after **GC** pause.', 'Heap dump; **pause** **the** **world** metrics.', '**max.poll.interval** exceeded.', 'Tune **GC** or **raise** interval carefully; **faster** handler.', 'Alert **rebalance** rate.'),
  seniorItem('**Bug:** **Auto** commit before DB **txn** **commits**.', 'Orders **lost** on crash.', 'Offset **ahead** of **ledger**.', 'Manual commit after **DB** success or **outbox**.', 'Integration test **kill** -9.'),
  seniorItem('**Scale:** **One** **thread** **poll** **starves** **partitions**.', 'Latency skew.', 'Sequential **processing** **too** **slow**.', '**Delegate** per partition or **add** **instances** to **match** **partition** **count**.', 'Profile **poll** **loop**.'),
  seniorItem('**Design:** **Replay** **topic** from **T-7d** for **audit**.', 'Legal request.', '**Offset** **reset** semantics confuse **ops**.', 'Separate **replay** **consumer** group + **documentation**.', 'Cost estimate upfront.'),
  seniorItem('**Ops:** **Deserializer** **throws** **ClassNotFoundException** on deploy.', 'Schema **mismatch**.', '**Bad** **classpath** **rollout**.', '**Rolling** **back** incompatible **consumer**; **schema** **registry** **check**.', 'CI **compat** tests.'),
  seniorItem('**Cost:** **Huge** **fetch** **sizes** blow **heap** on **wide** messages.', 'OOM **kills**.', '**max.partition.fetch.bytes** too high.', 'Lower caps + **chunk** processing.', 'Heap **alerts** linked to deploys.'),
];

const wrongAnswers = [
  '**Auto** commit is always safe — **Correction:** Can **lose** or **duplicate** relative to **processing**.',
  '**More** **max.poll.records** always faster — **Correction:** **Bigger** batches **extend** **handler** **time**.',
  '**Consumer** can **read** **uncommitted** DB and be fine — **Correction:** **Split** **brain** vs **offset**.',
  '**Rebalance** never drops messages — **Correction:** **In-flight** **batch** may **replay**.',
  '**Seek** fixes **broker** lag — **Correction:** **Seek** only **client** cursor; fix **throughput** separately.',
  '**Same** **group.id** across **prod** and **staging** is ok — **Correction:** **Offset** **collision** chaos.',
  '**poll** is only for **reading** — **Correction:** **Heartbeat** **driver** too.',
  '**pause** stops **rebalance** — **Correction:** **Does** **not**; **still** **member** of **group**.',
];

const why = `**Consumer** tuning is where **SLOs** meet **reality**: **poll** cadence, **commit** points, and **rebalance** behavior decide whether you ship **duplicates**, **loss**, or **lag**. Interviewers love **max.poll.interval** war stories.\n\nThis day pairs with **producer** durability: **end-to-end** thinking separates **senior** answers from **tutorial** answers.`;

const theory = `### Day 61 — **Kafka** **consumers**\n\n### 1. Poll loop\n**poll** balances **fetch**, **heartbeat**, and **rebalance** participation.\n\n### 2. Offset commit modes\n**Auto** vs **sync** manual vs **async** manual—each trades **latency**, **throughput**, and **failure** semantics.\n\n### 3. Rebalance\n**Partition** **revocation** **stops** **processing**—design **idempotent** **handlers**.\n\n### 4. Backpressure\n**pause**/**resume** and **downstream** **queue** depths.\n\n### 5. Isolation level\nInteracts with **transactional** **producers**.\n\n### 6. Story\n**Auto** commit + DB write reorder → **finance** mismatch; **manual** commit after **persist**.`;

const basic = {
  title: 'Basic — Consumer vocabulary',
  filename: 'Day61Basic.java',
  description: 'Poll, commit, group concepts.',
  code: `package arch.day61;

public class Day61Basic {
    public static void main(String[] args) {
        System.out.println("poll: fetch + heartbeat driver");
        System.out.println("commit: persist group offset cursor");
        System.out.println("rebalance: partition ownership moves");
    }
}
`,
  output: `poll: fetch + heartbeat driver
commit: persist group offset cursor
rebalance: partition ownership moves
`,
};

const intermediate = {
  title: 'Intermediate — Commit after process simulation',
  filename: 'Day61Intermediate.java',
  description: 'Toy state machine: processed flag gates commit.',
  code: `package arch.day61;

public class Day61Intermediate {
    public static void main(String[] args) {
        boolean processed = true;
        boolean committed = processed;
        System.out.println("processed=" + processed + " committed=" + committed);
    }
}
`,
  output: `processed=true committed=true
`,
};

const advanced = {
  title: 'Advanced — Per-partition lag toy',
  filename: 'Day61Advanced.java',
  description: 'Print lag = highWater - position.',
  code: `package arch.day61;

public class Day61Advanced {
    public static void main(String[] args) {
        long high = 1000L;
        long pos = 970L;
        System.out.println("lag=" + (high - pos));
    }
}
`,
  output: `lag=30
`,
};

const diagram = {
  title: 'Consumer group coordinator',
  description: 'Members poll; coordinator assigns partitions.',
  plantuml: `@startuml
title Day 61 — Consumer group
participant Coordinator
participant Consumer
Coordinator -> Consumer : assignment
loop poll
  Consumer -> Coordinator : heartbeat + fetch
end
@enduml`,
};

const pitfalls = [
  '**max.poll.interval** **shorter** than **worst-case** **handler** **path**.',
  '**Auto** **commit** **with** **non-idempotent** **side** **effects**.',
  '**Ignoring** **rebalance** **listener** **for** **resource** **cleanup**.',
  '**Infinite** **retry** on **same** **poison** **offset**.',
  '**Same** **group.id** reused by **different** **applications**.',
  '**Manual** **commit** **every** **record** at **high** **throughput**.',
  '**No** **DLQ** for **schema** **death** **spiral**.',
  '**Assuming** **ordering** across **partitions** after **retry**.',
];

const exerciseSolution = `package arch.day61;

public class Day61Exercise {
    public static void main(String[] args) {
        System.out.println("auto: may commit before process; sync manual: slow; async manual: ordering risks");
    }
}
`;

const exercise = {
  titleSuffix: 'Kafka consumers — offset commit modes (Day 61 assignment)',
  problem: 'Print **exactly** the assignment line on offset commit trade-offs.',
  hints: ['One println, match assignments JSON verbatim.'],
  solution: exerciseSolution,
  difficulty: 'Advanced',
};

const cheatsheet = `| Topic | Recall |
|---|---|
| poll | Fetch + heartbeat |
| auto.commit | Easy but fuzzy commit point |
| commitSync | Stronger control, blocks |
| rebalance | Partition moves |
| max.poll.interval | Must exceed handler |
| lag | highWater - position |
| pause | Client backpressure |
| isolation | read_committed with tx |
| static membership | Fewer surprise rebalances |
| deserializer errors | DLQ / skip policy |`;

const drillSeeds = [
  { question: 'Code review: **commitSync** inside **tight** loop per **record** at **50k** RPS.', signals: ['throughput', 'commit', 'latency'], core: { root: '**Per-record** commit **amplifies** **round** **trips**.', breaks: '**Throughput** **collapse**.', fix: '**Batch** **commits** after **bounded** **micro-batch**.', angle: 'Measure **commit** **rate** metric.', fq1q: 'Failure?', fq1a: '**Partial** **batch** **retry** with **idempotent** writes.', fq2q: 'Alternative?', fq2a: '**EOS** transactional consume-process-produce if justified.' } },
  { question: '**Incident:** **Offset** rewinds **after** deploy.', signals: ['reset', 'group', 'config'], core: { root: '**New** **group.id** or **policy** **change** **lost** **commits**.', breaks: '**Duplicate** storm downstream.', fix: '**Restore** **correct** **group** + **committed** **offsets** from backup.', angle: 'Runbook for **offset** **management**.', fq1q: 'Prevention?', fq1a: '**IaC** **group.id** + **integration** tests.', fq2q: 'Comms?', fq2a: 'Declare **replay** window to stakeholders.' } },
  { question: '**Design:** **Ordered** **per** **account** with **3** **consumers** **and** **2** partitions.', signals: ['ordering', 'skew', 'parallelism'], core: { root: '**Partition** **count** **limits** useful **parallelism**.', breaks: '**Idle** consumer **or** **cross** **key** **reorder** illusion.', fix: '**Grow** partitions **or** **accept** **single** **worker** per **hot** **partition**.', angle: 'Draw **key** **distribution**.', fq1q: 'Hot spot?', fq1a: '**Salted** key variants for **analytics** only, not money.', fq2q: 'Test?', fq2a: 'Load with **skewed** **Zipf** keys.' } },
  { question: '**Trade-off:** **Synchronous** **DB** write **inside** **poll** loop vs **async** queue.', signals: ['latency', 'reorder', 'backpressure'], core: { root: '**Async** adds **reorder** + **pressure** **complexity**.', breaks: '**Hidden** **queue** **growth**.', fix: '**Bounded** queue + **pause** partitions.', angle: 'Show **watermark** alerts.', fq1q: 'Failure mode?', fq1a: '**Queue** full blocks or drops—choose explicitly.', fq2q: 'Ops?', fq2a: 'Dashboard **queue** **depth** per partition.' } },
  { question: '**Gotcha:** **Double** **processing** after **commitAsync** callback **reorders**.', signals: ['async', 'duplicate', 'ordering'], core: { root: '**Later** **commit** **wins** over **earlier** failure.', breaks: '**Skipped** events **or** duplicates.', fix: 'Prefer **commitSync** for **critical** slices or strict ordering of callbacks.', angle: 'Explain **callback** thread hazards.', fq1q: 'Metric?', fq1a: 'Track **offset** **commit** **gap** vs **processed** **watermark**.', fq2q: 'Better?', fq2a: '**EOS** **with** **txn** **consumer** if available.' } },
  { question: '**Senior:** **Fifty** teams share **one** **consumer** **template** library.', signals: ['platform', 'golden path'], core: { root: '**Divergent** error handling policies.', breaks: 'On-call confusion.', fix: '**Golden** **Spring** **Kafka** **starter** + **review** **gate**.', angle: 'SRE partnership.', fq1q: 'Metric?', fq1a: '**DLQ** rate per domain normalized.', fq2q: 'Risk?', fq2a: 'Library version skew across fleet.' } },
  { question: '**Security:** **Consumer** prints **full** **record** **payload** at **INFO**.', signals: ['PII', 'logging'], core: { root: '**Verbose** logging of events.', breaks: '**Compliance** breach.', fix: '**Redact** fields; **structured** logging policy.', angle: 'DLP scanning logs.', fq1q: 'Who approves?', fq1a: 'Security + data governance.', fq2q: 'Tooling?', fq2a: 'Log scrubbing in CI fixtures.' } },
  { question: '**Scale:** **GC** **pause** 6s on **large** **heap** during **traffic** peak.', signals: ['gc', 'rebalance', 'poll'], core: { root: '**Stop-the-world** exceeds **intervals**.', breaks: 'Rebalance storm + lag spike.', fix: 'Tune GC, shrink max heap per instance, scale out more smaller pods.', angle: 'Correlate GC logs with rebalance.', fq1q: 'Quick?', fq1a: 'Increase heap only if pause source understood—often wrong fix.', fq2q: 'Architecture?', fq2a: 'Streaming smaller batches.' } },
  { question: '**Misconception:** "**Consumer** **lag** zero means **end-to-end** **latency** zero."', signals: ['lag', 'latency', 'pipelines'], core: { root: 'Lag is broker cursor vs consumer; downstream queues may hide delay.', breaks: 'False confidence on UX SLO.', fix: 'Measure **e2e** timers with **trace** correlation.', angle: 'Define **SLO** per hop.', fq1q: 'Example?', fq1a: 'MirrorMaker consumer caught up but partner API slow.', fq2q: 'Dashboard?', fq2a: 'Lag + external dependency latency tiles.' } },
  { question: '**Chaos:** **Broker** leader **failover** during **long** batch.', signals: ['failover', 'retry', 'duplicate'], core: { root: '**In-flight** fetch **retried** may **deliver** duplicates.', breaks: 'Downstream double events without idempotency.', fix: 'Idempotent processing keys + metrics on dup rate.', angle: 'Game day script.', fq1q: 'Consumer setting?', fq1a: 'isolation and fetch isolation level awareness.', fq2q: 'Business mitigation?', fq2a: 'Ledger unique constraint on event id.' } },
];

export const drill61 = {
  day: 61,
  title: 'Kafka Consumers Deep Dive',
  phaseId: 'phase7',
  tags: ['consumer', 'poll', 'offset', 'rebalance', 'commit', 'lag', 'backpressure'],
  scenarios: drillSeeds.map((s, i) => scenarioDrillItem(61, i + 1, s.question, s.signals, s.core)),
};

export default {
  day: 61,
  title: 'Kafka Consumers Deep Dive',
  estimatedHours: 4,
  tags: ['Senior', 'Advanced', 'Phase 7', 'Interview Prep', 'Satyverse(Satyam Parmar)', 'Kafka'],
  prerequisites: ['Day 60', 'Day 59'],
  learningObjectives: [
    'Explain **poll** semantics and how **max.poll.interval** ties to handler runtime',
    'Compare **auto**, **sync**, and **async** commits with failure scenarios',
    'Use **pause**/**resume** and **rebalance** listeners for production-safe consumers',
    'Diagnose **lag**, **rebalance storms**, and **deserialization** failures',
    'Design **idempotent** consumption for **at-least-once** Kafka delivery',
    'Contrast **static** membership and cooperative rebalance trade-offs',
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
