import { conceptualItem, codeBasedItem, seniorItem, scenarioDrillItem } from '../gen-phase6/lib.mjs';

const T = 'delivery semantics and EOS';

const conceptual = [
  conceptualItem('Define **at-most-once** in Kafka-shaped systems.', 'Offsets **committed** **before** processing finishes or messages skipped → **loss** **possible**.', T),
  conceptualItem('Define **at-least-once**.', 'Processing may run **multiple** **times** for same message; **dedupe** or **idempotency** needed downstream.', T),
  conceptualItem('Define **exactly-once** in **practice**.', '**End-to-end** EOS requires **Kafka** **protocol** features **plus** **external** **side-effect** **idempotency**.', T),
  conceptualItem('What does **idempotent** consumer mean?', 'Second **delivery** of same **business** **event** does **not** change **final** **state** thanks to **keys** or **constraints**.', T),
  conceptualItem('**Transactional** **read-process-write** sketch?', 'Consume, transform, produce, commit **offsets** and **messages** **atomically** in **Kafka** **transaction** **scope**.', T),
  conceptualItem('Why **business** **eventId** beats **offset-only** dedupe?', 'Offsets change on **replay** or **topic** **migration**; **business** **id** survives **reconciliation**.', T),
  conceptualItem('**Outbox** pattern role?', '**Atomically** **persist** **event** with **DB** **txn** then **async** **publisher** drains **outbox** safely.', T),
  conceptualItem('**Duplicate** window from **producer** **retries**?', 'Without **idempotence**, same **logical** event can **appear** multiple times.', T),
  conceptualItem('**Two-phase** commit between DB and Kafka?', 'Rare; heavy; **outbox** or **change-data-capture** often simpler operationally.', T),
  conceptualItem('**Clock skew** dedupe risk?', 'Time-window **dedupe** alone **misses** **slow** duplicates or **reordered** clocks.', T),
  conceptualItem('**Saga** vs **Kafka** EOS?', '**Saga** coordinates **multiple** **services**; **Kafka** tx covers **consumer+producer** to **broker**.', T),
  conceptualItem('**Poison pill** handling?', 'Skip with **DLQ** after **N** tries while **auditing** **offset** advance strategy.', T),
  conceptualItem('What is **effectively-once** phrasing?', '**At-least-once** transport + **idempotent** **effects** = **effective** EOS for the business.', T),
  conceptualItem('**Offset** commit **after** DB **commit** ordering?', '**Classic** **pattern** for **at-least-once** with **no** **loss** when DB fails before commit.', T),
  conceptualItem('**Debezium** + **Kafka** duplication?', '**CDC** may **replay**; consumers must **handle** **duplicate** **logical** rows.', T),
];

const codeBased = [
  codeBasedItem('Idempotent insert pseudo-SQL.', '// INSERT .. ON CONFLICT DO NOTHING with business event_id unique'),
  codeBasedItem('**consume-transform-produce** transactional flow.', '// readUncommitted vs read_committed consumer isolation'),
  codeBasedItem('**Unique** constraint on **dedupe** table.', '// (consumer_group, topic, partition, offset) optional'),
  codeBasedItem('**Outbox** row shape fields.', '// id, payload, created_at, published_at nullable'),
  codeBasedItem('**Redis** SETNX dedupe caveats.', '// ttl + missed extensibility vs DB uniqueness'),
  codeBasedItem('**Spring** @Transactional + Kafka warning.', '// producer send outside DB txn without outbox'),
  codeBasedItem('**Optimistic** lock snippet mention.', '// update .. where version = ?'),
  codeBasedItem('**Dead-letter** metadata to retain.', '// original offset + exception class + stack hash'),
  codeBasedItem('**Choreography** duplicate **event** handling.', '// each service idempotent subscriber'),
  codeBasedItem('**Ledger** double entry idempotency.', '// operation_id primary key on postings table'),
];

const seniorScenario = [
  seniorItem('**Incident:** **Payments** duplicated during **broker** flap.', 'Freeze payouts; reconcile ledger.', 'Consumer **not** idempotent on **retry**.', '**Unique** constraint + **manual** **adjustment** playbook.', 'Game day **retry** hammer tests.'),
  seniorItem('**Design:** **EOS** marketing slide but **MySQL** writes not **idempotent**.', 'Reality check workshop.', 'Slide ≠ **architecture**.', 'Adopt **outbox** + **unique** keys.', 'ADR signed by **finance**.'),
  seniorItem('**Bug:** **commit** **before** DB causes **loss**.', 'Transaction logs.', 'Ordering wrong.', 'Commit **after** persist or **txn** **outbox**.', 'Integration tests.'),
  seniorItem('**Compliance:** **Replay** duplicates **audit** export.', 'Legal asks source.', 'Offset-only dedupe used.', 'Switch to **business** **keys** in **exports**.', 'Retention policy doc.'),
  seniorItem('**Scale:** **Dedupe** table hot **partition**.', 'Writes collapse.', 'Monotonic bigserial primary key hotspot.', 'Shard **dedupe** or use **UUID** keys with careful indexing.', 'Capacity modeling.'),
  seniorItem('**Migration:** dual **publish** during topic move.', 'Duplicates expected.', 'Two topics same events.', 'Consumer handles **eventId** globally.', 'Cutover checklist.'),
];

const wrongAnswers = [
  '**EOS** in Kafka means **no** duplicates anywhere — **Correction:** **Side** **effects** still need **design**.',
  '**Transactional** producer alone protects **MySQL** — **Correction:** **Separate** **systems**.',
  '**At-least-once** is **buggy** — **Correction:** **Common** **and** fine with **idempotency**.',
  '**UUID** always solves dedupe — **Correction:** Need **unique** constraint + handling.',
  '**Skip** bad messages silently — **Correction:** **DLQ** + **audit** trail.',
  '**Exactly-once** is **free** with **Kafka** — **Correction:** **Operational** + **engineering** cost.',
  '**Offsets** are stable business keys — **Correction:** **Replay** changes offsets.',
  '**Synchronous** HTTP to partner inside consumer is EOS — **Correction:** **Timeouts** create uncertainty.',
];

const why = `Delivery semantics are where **brokers** meet **banks**. Interviewers want **at-least-once** + **idempotent** effects articulated clearly, not buzzword **EOS**.\n\nYou should connect **offsets**, **transactions**, and **outbox** patterns to **metrics** finance can **reconcile**.`;

const theory = `### Day 62 — **Delivery** **semantics** and **EOS**\n\n### 1. Semantics ladder\n**At-most-once**, **at-least-once**, **effectively-once**, **Kafka** **transactional** guarantees.\n\n### 2. Idempotency\n**Business** keys, **unique** constraints, **state machine** transitions.\n\n### 3. Transactions\n**consume-process-produce** isolation costs and operational limits.\n\n### 4. Outbox\nPairs **DB** durability with **event** publication.\n\n### 5. Failure cases\n**Partial** **commit**, **duplicate** **retries**, **replays**.\n\n### 6. Story\n**Retry** storm duplicates charges → **unique** **operation_id** saves the quarter.`;

const basic = {
  title: 'Basic — Semantics ladder',
  filename: 'Day62Basic.java',
  description: 'Print three delivery semantics one-liners.',
  code: `package arch.day62;

public class Day62Basic {
    public static void main(String[] args) {
        System.out.println("at-most-once: may lose, will not duplicate (idealized)");
        System.out.println("at-least-once: may duplicate, will not lose (with care)");
        System.out.println("effectively-once: at-least-once + idempotent side effects");
    }
}
`,
  output: `at-most-once: may lose, will not duplicate (idealized)
at-least-once: may duplicate, will not lose (with care)
effectively-once: at-least-once + idempotent side effects
`,
};

const intermediate = {
  title: 'Intermediate — Dedupe key toy',
  filename: 'Day62Intermediate.java',
  description: 'Build dedupe key from topic, partition, offset.',
  code: `package arch.day62;

public class Day62Intermediate {
    public static void main(String[] args) {
        String k = "orders-0-102934";
        System.out.println("dedupe=" + k);
    }
}
`,
  output: `dedupe=orders-0-102934
`,
};

const advanced = {
  title: 'Advanced — Idempotent flag map',
  filename: 'Day62Advanced.java',
  description: 'Simulate seen event ids with a set.',
  code: `package arch.day62;

import java.util.*;

public class Day62Advanced {
    public static void main(String[] args) {
        Set<String> seen = new HashSet<>();
        String id = "evt-42";
        boolean first = seen.add(id);
        boolean second = seen.add(id);
        System.out.println("first=" + first + " second=" + second);
    }
}
`,
  output: `first=true second=false
`,
};

const diagram = {
  title: 'Outbox + consumer idempotency',
  description: 'DB transaction anchors event; consumer dedupes by business key.',
  plantuml: `@startuml
title Day 62 — EOS patterns
database DB
queue Kafka
participant Service
Service -> DB : txn + outbox row
Service -> Kafka : async publish drain
Kafka -> Service : consume with idempotent handler
@enduml`,
};

const pitfalls = [
  '**Marketing** **EOS** **without** **DB** **constraints**.',
  '**Committing** **offsets** **before** **DB** **on** **critical** paths.',
  '**Time**-based **dedupe** only.',
  '**Silent** **skip** of **bad** **messages**.',
  '**Assuming** **UUID** **=** **dedupe**.',
  '**Ignoring** **replay** **after** **topic** **migration**.',
  '**No** **reconciliation** **job** for **finance**.',
  '**Hot** **dedupe** **table** **indexes** **wrong**.',
];

const exerciseSolution = `package arch.day62;

public class Day62Exercise {
    public static void main(String[] args) {
        System.out.println("topic+partition+offset OR business eventId (preferred)");
    }
}
`;

const exercise = {
  titleSuffix: 'Delivery semantics — dedupe key (Day 62 assignment)',
  problem: 'Print **exactly**: topic+partition+offset OR business eventId (preferred)',
  hints: ['Single println matching assignment expectedOutput.'],
  solution: exerciseSolution,
  difficulty: 'Advanced',
};

const cheatsheet = `| Term | Recall |
|---|---|
| At-least-once | Kafka default + retries |
| Idempotent consumer | Safe replays |
| Outbox | Atomic DB + event |
| Business id | Stable dedupe key |
| Tx consume-produce | Kafka EOS scope |
| DLQ | Poison path |
| Offset commit order | Loss vs dup trade |
| Saga | Cross-service workflow |
| CDC replay | Needs dedupe |
| Reconciliation | Finance hourly jobs |`;

const drillSeeds = [
  { question: 'Code review: **commitSync** immediately **before** **HTTP** **charge** returns 504.', signals: ['ordering', 'timeout', 'duplicate'], core: { root: 'Uncertain if partner charged; offset already moved.', breaks: 'Money drift vs Kafka state.', fix: 'Idempotent charge token + inquiry API + reconcile.', angle: 'Sketch state machine on whiteboard.', fq1q: 'Offset?', fq1a: 'Commit only after durable business outcome recorded.', fq2q: 'Tooling?', fq2a: 'Partner sandbox tests for timeout paths.' } },
  { question: '**Incident:** **Replay** job doubles **inventory** reservations.', signals: ['replay', 'idempotency', 'stock'], core: { root: 'Handler used offset dedupe only.', breaks: 'Oversold inventory.', fix: 'Business reservation_id uniqueness.', angle: 'Explain difference vs transport key.', fq1q: 'Testing?', fq1a: 'ReplayFixture with assertion on stock count.', fq2q: 'Monitoring?', fq2a: 'Alert on reservation count anomalies.' } },
  { question: '**Design:** **Saga** with **Kafka** **_TOPIC_** per step vs **choreography**.', signals: ['coupling', 'orchestration', 'events'], core: { root: 'Choreography simpler but observability harder.', breaks: 'Stuck sagas invisible.', fix: 'Process manager + timeout compensation.', angle: 'Trade-offs for regulated domains.', fq1q: 'EOS?', fq1a: 'Per hop at-least-once expected.', fq2q: 'UX?', fq2a: 'Explicit pending states.' } },
  { question: '**Trade-off:** **Redis** dedupe vs **Postgres** uniqueness.', signals: ['durability', 'loss', 'ops'], core: { root: 'Redis may evict TTL duplicates late.', breaks: 'Rare duplicate charges after TTL.', fix: 'Postgres unique for money; redis for soft guard.', angle: 'Classify criticality tiers.', fq1q: 'Cost?', fq1a: 'DB pressure vs redis simplicity.', fq2q: 'Migration?', fq2a: 'Dual write verification window.' } },
  { question: '**Gotcha:** **Transactional** consumer timeout too low.', signals: ['abort', 'storm', 'retry'], core: { root: 'Transactions abort under GC pauses.', breaks: 'Offset lag spiral.', fix: 'Raise timeout with justified SLA + reduce GC pauses.', angle: 'Profile before tuning blindly.', fq1q: 'Metric?', fq1a: 'Abort rate + consumer lag correlation.', fq2q: 'Quick win?', fq2a: 'Smaller batches first.' } },
  { question: '**Senior:** **Global** **standard** for idempotency headers.', signals: ['platform', 'governance'], core: { root: 'Each team invented headers differently.', breaks: 'Cross-service dedupe failures.', fix: 'Publish BEP + interceptors.', angle: 'RFC with examples.', fq1q: 'Enforcement?', fq1a: 'Contract tests in CI.', fq2q: 'Legacy?', fq2a: 'Adapter at edge.' } },
  { question: '**Security:** **PII** inside dedupe keys logged.', signals: ['gdpr', 'logging'], core: { root: 'Hashes included raw emails.', breaks: 'Compliance breach.', fix: 'Opaque surrogate ids + redact logs.', angle: 'Data classification training.', fq1q: 'Audit?', fq1a: 'Sample log scans weekly.', fq2q: 'Architecture?', fq2a: 'Tokenization service.' } },
  { question: '**Scale:** **Outbox** publisher **single** threaded bottleneck.', signals: ['throughput', 'publisher'], core: { root: 'One sweeper cannot clear peak backlog.', breaks: 'Lag between DB and Kafka grows.', fix: 'Partition outbox by shard; multiple publisher workers with advisory locks.', angle: 'Show SQL lock pattern.', fq1q: 'Ordering?', fq1a: 'Per-entity ordering preserved within shard.', fq2q: 'Monitoring?', fq2a: 'Age of oldest unpublished row.' } },
  { question: '**Misconception:** "**Exactly-once** == no **reconciliation** needed."', signals: ['finance', 'ops'], core: { root: 'Still need humans+reports for partner mismatch.', breaks: 'Blind trust in brokers.', fix: 'Nightly **triple** match reports.', angle: 'SRE + finance dashboards.', fq1q: 'SLA?', fq1a: 'Time to detect duplicate money < 1 hour.', fq2q: 'Runbook?', fq2a: 'Freeze payouts procedure.' } },
  { question: '**Chaos:** **Region** failover mid transaction.', signals: ['dr', 'kafka'], core: { root: 'In-flight transactions may abort.', breaks: 'Temporary duplicate or lag spike.', fix: 'Idempotent resume + fencing tokens where supported.', angle: 'Game day documentation.', fq1q: 'RPO/RTO?', fq1a: 'Align with finance risk appetite.', fq2q: 'Customer?', fq2a: 'Communicate delayed settlement window.' } },
];

export const drill62 = {
  day: 62,
  title: 'Delivery Semantics & EOS',
  phaseId: 'phase7',
  tags: ['EOS', 'idempotency', 'outbox', 'transactions', 'at-least-once', 'dedupe'],
  scenarios: drillSeeds.map((s, i) => scenarioDrillItem(62, i + 1, s.question, s.signals, s.core)),
};

export default {
  day: 62,
  title: 'Delivery Semantics & EOS',
  estimatedHours: 4,
  tags: ['Senior', 'Advanced', 'Phase 7', 'Interview Prep', 'Satyverse(Satyam Parmar)', 'Kafka'],
  prerequisites: ['Day 61', 'Day 60'],
  learningObjectives: [
    'Contrast **at-most-once**, **at-least-once**, and **effective** exactly-once patterns',
    'Implement **idempotent** consumers using **business** keys and **database** constraints',
    'Explain **transactional** read-process-write scopes and operational limits',
    'Design **outbox** hybrids for **atomic** DB writes and **Kafka** publication',
    'Diagnose **duplicate** incidents with reconciliation metrics and replay tests',
    'Choose **dedupe** storage (cache vs database) based on criticality',
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