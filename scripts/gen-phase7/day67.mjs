import { conceptualItem, codeBasedItem, seniorItem, scenarioDrillItem } from '../gen-phase6/lib.mjs';

const T = 'distributed systems theory';

const conceptual = [
  conceptualItem('State **CAP** cleanly.', 'During a **network partition**, you cannot have both **strong linearizable** availability for all operations *and* **full** consistency without compromise—systems pick **CP** or **AP** flavors in practice.', T),
  conceptualItem('**PACELC** extension?', 'If **partition** (P) then choose **A** vs **C**; **else** (E) choose **latency (L)** vs **consistency (C)** for normal operation.', T),
  conceptualItem('Define **linearizability**.', 'Operations appear to occur atomically at **one** point on a **global** timeline matching real-time order observable by concurrent clients.', T),
  conceptualItem('Define **serializability**.', 'Outcomes match **some** sequential execution of transactions—as if no interleaving—can differ from linearizability scope.', T),
  conceptualItem('**Eventual consistency** meaning?', 'If updates stop, replicas **converge** to same state given enough time—does not specify **when**.', T),
  conceptualItem('**Idempotency** key pattern?', 'Client supplies key so **retries** do not duplicate side effects.', T),
  conceptualItem('**Optimistic** concurrency control?', 'Detect conflicts on **commit** using **versions**; **retry** on conflict.', T),
  conceptualItem('**Vector clocks** intuition?', 'Track **causal** **precedence** across replicas to detect **concurrent** updates.', T),
  conceptualItem('**Quorum** **read/write** in replicated DBs?', '**R + W > N** style rules tune **tolerance** of stale reads vs write durability.', T),
  conceptualItem('**Exactly-once** illusion?', 'End-to-end **EOS** generally built from **at-least-once** transport + **idempotent** effects + **dedupe**.', T),
  conceptualItem('**BYZANTINE** vs crash faults?', '**Byzantine** includes **arbitrary** malicious behavior; most cloud systems assume **crash** fault models.', T),
  conceptualItem('What is **backpressure**?', 'Signaling **upstream** to **slow** down when **downstream** saturated.', T),
  conceptualItem('**Two generals** problem relevance?', 'Proves **no** deterministic protocol guarantees over **unreliable** links—motivates **timeouts** and **retry** with uncertainty.', T),
  conceptualItem('**SLA** vs **SLO** vs **SLI**?', '**SLI** measured signal, **SLO** internal target, **SLA** contractual promise to customers.', T),
  conceptualItem('**Chaos engineering** goal?', 'Learn **failure** behavior **proactively** with controlled **experiments**.', T),
];

const codeBased = [
  codeBasedItem('Optimistic update SQL.', '// UPDATE t SET v=?, ver=ver+1 WHERE id=? AND ver=?'),
  codeBasedItem('Compare-and-swap pseudo.', '// if (atomic.compareAndSet(e, n))'),
  codeBasedItem('**Hazelcast** style map putIfAbsent concept.', '// dedupe token registration'),
  codeBasedItem('**etcd** transaction compare revision.', '// modRevision guard'),
  codeBasedItem('Dynamo style **conditional** write.', '// attribute_not_exists(id)'),
  codeBasedItem('**Spring** @Version JPA field.', '// optimistic locking field'),
  codeBasedItem('**Circuit** breaker open pseudo.', '// fail fast while half-open probes'),
  codeBasedItem('**Rate** limit token bucket comment.', '// smooth bursts'),
  codeBasedItem('**UUID** v4 as idempotency key storage.', '// unique constraint'),
  codeBasedItem('**Lease** lock with TTL.', '// fencing token caution'),
];

const seniorScenario = [
  seniorItem('**Incident:** **Split** brain after **partition** heals.', 'Stop writes; snapshot divergent states.', '**Automatic** merge impossible safely for money.', 'Manual reconciliation + CRDT only if domain allows.', 'Playbook.'),
  seniorItem('**Design:** **Strong** consistency globally for **social** likes.', 'Challenge product.', 'Latency + availability hit.', 'AP with **counter** CRDT + UX tolerance.', 'Metrics.'),
  seniorItem('**Ops:** **Thundering** herd on cache expiry.', 'Spike to DB.', 'No jitter.', 'Stale-while-revalidate + jittered TTL.', 'Load test.'),
  seniorItem('**Bug:** Lost update without **version** field.', 'Last writer wins silently.', 'No OCC.', 'Add version column + UI retry UX.', 'Training.'),
  seniorItem('**Compliance:** **Audit** requires **linearizable** reads.', 'Architecture review.', 'Replica lag unacceptable.', 'Read from leader or consensus read path.', 'Diagram.'),
  seniorItem('**Scale:** **Global** **strong** transactions across regions.', 'Latency unacceptable.', 'CAP trade-offs in wide-area systems.', 'Saga choreography per aggregate.', 'ADR.'),
];

const wrongAnswers = [
  '**CAP** says always pick **C** — **Correction:** **Partition** forces **trade-off**.',
  '**Eventual** consistency means **immediate** wrong reads ok forever — **Correction:** **Converges** when quiescent.',
  '**Idempotency** keys remove **retries** — **Correction:** They make **retries** **safe**.',
  '**Vector** clocks make conflicts disappear — **Correction:** They **detect**; **resolution** still needed.',
  '**SLO** is legally binding — **Correction:** **SLA** is **contract** facing.',
  '**Chaos** in prod Friday — **Correction:** **Blast** radius control matters.',
  '**Serializability** implies **linearizability** always — **Correction:** Different **definitions**.',
  '**Quorum** math always used in SQL DB — **Correction:** Single-node **primary** common.',
];

const why = `**Distributed systems** interviews test whether you can **name** trade-offs (**CAP**, **latency vs consistency**) and connect them to **operational** patterns—**idempotency**, **retries**, **versioning**, and **observability**.

Messaging days built intuition; this day sharpens **theory** vocabulary for **staff** loops.`;

const theory = `### Day 67 — **Distributed** **systems** **theory**

### 1. CAP / PACELC
Partition behavior vs steady-state latency trade-offs.

### 2. Consistency models
**Linearizability**, **serializability**, **eventual**.

### 3. Concurrency control
**Optimistic** vs **pessimistic**; **version** fields.

### 4. Time and ordering
**Vector** clocks, **happens-before**, **quorum** ideas.

### 5. Reliability patterns
**Backpressure**, **bulkheads**, **timeouts**.

### 6. Story
**Optimistic** lock without **UX** retry causes **support** spikes; add **version** conflict flows.`;

const basic = {
  title: 'Basic — CAP one-liner',
  filename: 'Day67Basic.java',
  description: 'Partition trade-off headline.',
  code: `package arch.day67;

public class Day67Basic {
    public static void main(String[] args) {
        System.out.println("CAP: during partition, balance consistency vs availability");
        System.out.println("PACELC: latency vs consistency even without partition");
    }
}
`,
  output: `CAP: during partition, balance consistency vs availability
PACELC: latency vs consistency even without partition
`,
};

const intermediate = {
  title: 'Intermediate — Assignment CAP print',
  filename: 'Day67Intermediate.java',
  description: 'Print CAP assignment line.',
  code: `package arch.day67;

public class Day67Intermediate {
    public static void main(String[] args) {
        System.out.println("Consistency vs Availability (Partition tolerance assumed)");
    }
}
`,
  output: `Consistency vs Availability (Partition tolerance assumed)
`,
};

const advanced = {
  title: 'Advanced — Version increment toy',
  filename: 'Day67Advanced.java',
  description: 'Simulate OCC conflict on stale version.',
  code: `package arch.day67;

public class Day67Advanced {
    public static void main(String[] args) {
        int dbVersion = 5;
        int clientVersion = 4;
        boolean ok = dbVersion == clientVersion;
        System.out.println("commitOk=" + ok);
    }
}
`,
  output: `commitOk=false
`,
};

const diagram = {
  title: 'Quorum read/write overlap',
  description: 'R + W > N allows tunable staleness vs durability.',
  plantuml: `@startuml
title Day 67 — Quorum intuition
note right: Example: N=3, R=2, W=2
participant Writer
participant Reader
database Replicas
Writer -> Replicas : write quorum
Reader -> Replicas : read quorum
@enduml`,
};

const pitfalls = [
  '**Hand-wavy** **CAP** without **concrete** **system** **behaviors**.',
  '**No** **version** field on **hot** **aggregates** with **concurrent** **writers**.',
  '**Misusing** **CRDT** where **invariants** need **strong** **consistency**.',
  '**Unbounded** **retries** without **idempotency** keys.',
  '**Ignoring** **clock** skew in **time-based** **policies**.',
  '**SLA** promised **without** **SLO** **budget** math.',
  '**Chaos** experiments **without** **blast** **radius** controls.',
  '**Assuming** **serializable** **isolation** on **globally** **sharded** **DB** without checking.',
];

const exerciseSolution = `package arch.day67;

public class Day67Exercise {
    public static void main(String[] args) {
        System.out.println("Consistency vs Availability (Partition tolerance assumed)");
    }
}
`;

const exercise = {
  titleSuffix: 'Distributed systems theory — CAP (Day 67 assignment)',
  problem: 'Print **exactly**: Consistency vs Availability (Partition tolerance assumed)',
  hints: ['Matches d67q4 expectedOutput verbatim.'],
  solution: exerciseSolution,
  difficulty: 'Advanced',
};

const cheatsheet = `| Term | Recall |
|---|---|
| CAP | Partition trade-offs |
| PACELC | Latency vs consistency |
| Linearizable | Real-time global order |
| Serializable | Transaction interleaving |
| Eventual | Converge when quiet |
| OCC | Version conflicts |
| Vector clock | Causality detection |
| Idempotency key | Safe retries |
| Quorum | R+W>N style |
| Backpressure | Slow upstream signal |`;

const drillSeeds = [
  { question: 'Whiteboard: **AP** **cache** + **primary** **DB** during **partition**.', signals: ['cap', 'cache', 'split'], core: { root: 'Reads may be stale; writes may queue or conflict.', breaks: 'Users see divergent carts.', fix: 'UX for conflict resolution + metrics on staleness.', angle: 'Name product decision explicitly.', fq1q: 'Money path?', fq1a: 'Route money operations to CP subsystem.', fq2q: 'Metric?', fq2a: 'Stale read age histogram.' } },
  { question: '**Incident:** **OptimisticLockException** storm after launch.', signals: ['occ', 'retry'], core: { root: 'Hot aggregate + no exponential backoff on retries.', breaks: 'DB CPU pegs.', fix: 'Backoff + merge strategy + reduce contentious aggregates.', fq1q: 'UX?', fq1a: 'Tell user someone else edited; refresh.', fq2q: 'Arch?', fq2a: 'Partition writes per finer-grained entity.' } },
  { question: '**Design:** **Globally** unique **username** with **AP** regions.', signals: ['uniqueness', 'latency'], core: { root: 'Cannot guarantee instant global uniqueness without coordination.', breaks: 'Rare duplicate handles until merge.', fix: 'Async reconciliation job + reserved handles.', angle: 'Honest product trade-off.', fq1q: 'Alternative?', fq1a: 'Central allocator service CP path.', fq2q: 'Testing?', fq2a: 'Jepsen-style partition tests in staging.' } },
  { question: '**Trade-off:** **Strong** reads on **payment** ledger vs **regional** **latency**.', signals: ['latency', 'money'], core: { root: 'Cross-region RTT dominates.', breaks: 'Checkout p99 unacceptable.', fix: 'Leader in home region + read-your-writes UX proxy.', fq1q: 'Compliance?', fq1a: 'Audit trail still central.', fq2q: 'DR?', fq2a: 'Graceful degrade mode documented.' } },
  { question: '**Gotcha:** **Vector** clocks stored but conflicts **never** resolved.', signals: ['crdt', 'debt'], core: { root: 'Operational backlog ignored.', breaks: 'Silent corrupted aggregates in analytics.', fix: 'Automated conflict resolver + alerting.', fq1q: 'Metric?', fq1a: 'Conflict counter by type.', fq2q: 'Ownership?', fq2a: 'Data platform team SLA.' } },
  { question: '**Senior:** **SRE** defines **error** **budget** policy for **critical** services.', signals: ['slo', 'policy'], core: { root: 'No policy means chaos releases continue.', breaks: 'Burn permanent without consequence.', fix: 'Freeze features when budget low.', fq1q: 'Who decides?', fq1a: 'Eng director + product.', fq2q: 'Metric?', fq2a: 'Burn rate forecast dashboard.' } },
  { question: '**Security:** **Leader** **election** **token** not **fenced**.', signals: ['lease', 'split'], core: { root: 'Old leader writes after pause.', breaks: 'Corruption.', fix: 'Fencing tokens in storage layer if supported.', fq1q: 'Example?', fq1a: 'Zookeeper epoch style.', fq2q: 'Test?', fq2a: 'Inject long GC on leader.' } },
  { question: '**Scale:** **Thundering** herd on config service.', signals: ['cache', 'jitter'], core: { root: 'All clients refresh at same TTL boundary.', breaks: 'Config API outage.', fix: 'Jitter + stale-while-revalidate.', fq1q: 'Client?', fq1a: 'Backoff with decorrelated jitter.', fq2q: 'Server?', fq2a: 'Rate limit per tenant.' } },
  { question: '**Misconception:** "**Serializable** isolation fixes all races in microservices."', signals: ['scope', 'db'], core: { root: 'Each DB transaction local; cross-service invariants need sagas.', breaks: 'Inventory oversell across services.', fix: 'Claim tokens + saga compensation.', fq1q: 'Pattern?', fq1a: 'Try-confirm-cancel.', fq2q: 'Observability?', fq2a: 'Saga step metrics.' } },
  { question: '**Chaos:** **Regional** outage and **degraded** **read** mode.', signals: ['dr', 'ux'], core: { root: 'Stale reads served intentionally.', breaks: 'Users misunderstand stale data.', fix: 'Banner + timestamp of last successful sync.', fq1q: 'Metric?', fq1a: 'Fraction of requests served from stale tier.', fq2q: 'Rollback?', fq2a: 'Traffic shift runbook.' } },
];

export const drill67 = {
  day: 67,
  title: 'Distributed Systems Theory',
  phaseId: 'phase7',
  tags: ['CAP', 'PACELC', 'consistency', 'linearizability', 'OCC', 'quorum', 'idempotency'],
  scenarios: drillSeeds.map((s, i) => scenarioDrillItem(67, i + 1, s.question, s.signals, s.core)),
};

export default {
  day: 67,
  title: 'Distributed Systems Theory',
  estimatedHours: 4,
  tags: ['Senior', 'Advanced', 'Phase 7', 'Interview Prep', 'Satyverse(Satyam Parmar)', 'Distributed Systems'],
  prerequisites: ['Day 66', 'Day 65'],
  learningObjectives: [
    'Explain **CAP** and **PACELC** with concrete system behaviors, not slogans',
    'Contrast **linearizability**, **serializability**, and **eventual consistency** models',
    'Apply **optimistic** concurrency, **idempotency** keys, and **versioned** updates',
    'Describe **quorum** reasoning and **leader** election failure modes at a high level',
    'Relate **SLIs**, **SLOs**, and **SLAs** to operational governance',
    'Connect **chaos** experiments to **blast** radius controls and learning goals',
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
