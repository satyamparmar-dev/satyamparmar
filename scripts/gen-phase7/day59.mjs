import { conceptualItem, codeBasedItem, seniorItem, scenarioDrillItem } from '../gen-phase6/lib.mjs';

const T = 'Kafka architecture';

const conceptual = [
  conceptualItem('What is a **Kafka broker** and **cluster** role?', '**Brokers** persist **topics** as **append-only** logs; a **cluster** shares metadata via the **controller** and replicates **partitions** for availability.', T),
  conceptualItem('Why **partition** a **topic**?', '**Partitions** are the **unit of parallelism** and **storage shard**; **ordering** is **only per partition**.', T),
  conceptualItem('How does **key-based partitioning** work?', 'By default the **partitioner** hashes the **record key** modulo **partition count** so the **same key** maps to the **same partition**.', T),
  conceptualItem('What is the **controller** broker?', 'One broker **coordinates** **leader** elections, **ISR** maintenance, and **metadata** updates; **loss** triggers **fast** **failover**.', T),
  conceptualItem('What is **ISR**?', '**In-sync replicas**: followers **caught up** enough to **promote** if the **leader** fails.', T),
  conceptualItem('What is **replication.factor** vs **min.insync.replicas**?', '**RF** controls **copies**; **min.insync.replicas** gates **producer durability** when using **acks=all**.', T),
  conceptualItem('Why avoid **hot partitions**?', 'One **partition** absorbs **skewed keys** and becomes a **throughput** and **storage** bottleneck.', T),
  conceptualItem('What is a **consumer group**?', 'A **logical** set of consumers that **share** **partition assignment**; **each partition** is read by **at most one** member in the group.', T),
  conceptualItem('What happens on **consumer crash**?', 'The **group coordinator** **rebalances**; partitions **move** to **survivors**; **uncommitted** work may be **redelivered** under **at-least-once**.', T),
  conceptualItem('What are **offsets**?', '**Monotonic positions** per **partition**; **committed offsets** define **progress** in the **consumer group**.', T),
  conceptualItem('Difference **log retention** and **compaction**?', '**Retention** **time/size** deletes **old** segments; **compaction** keeps the **latest** value **per key** for **changelog** topics.', T),
  conceptualItem('What is **ZooKeeper** vs **KRaft**?', 'Modern clusters use **KRaft** for **metadata**; legacy used **ZooKeeper**—interviews may still mention **migration**.', T),
  conceptualItem('Why **rack awareness**?', '**Replica placement** across **racks/AZs** reduces **correlated** failure wiping **ISR**.', T),
  conceptualItem('What is **unclean leader election**?', 'Promoting a **non-ISR** replica **risks** **data loss**—usually **disabled** for **critical** topics.', T),
  conceptualItem('How do **metadata** requests affect clients?', '**Clients** cache **topic/partition leaders**; **leader movement** triggers **metadata refresh** and **NOT_LEADER** handling.', T),
];

const codeBased = [
  codeBasedItem('Name three producer **acks** modes and durability trade-off.', '// acks=0 fire-and-forget; acks=1 leader only; acks=all ISR ack'),
  codeBasedItem('Consumer **subscribe** vs **assign**.', '// subscribe: group rebalance; assign: static partition map, no auto balance'),
  codeBasedItem('**max.poll.interval.ms** meaning.', '// max time between poll() calls before consumer considered dead'),
  codeBasedItem('**session.timeout.ms** vs **heartbeat**.', '// member liveness to coordinator; heartbeats keep session alive'),
  codeBasedItem('**fetch.min.bytes** / **fetch.max.wait.ms**.', '// broker batching trades latency for efficiency'),
  codeBasedItem('**rebalance.protocol** cooperative mention.', '// incremental cooperative rebalance reduces stop-the-world'),
  codeBasedItem('List **metrics** for consumer health.', '// lag per partition, rebalance rate, poll time, fetch rate'),
  codeBasedItem('**partitioner** default behavior key null.', '// round-robin sticky when key is null (version dependent)'),
  codeBasedItem('What **NOT_LEADER_FOR_PARTITION** implies.', '// metadata stale or leader changed; refresh metadata'),
  codeBasedItem('Why **idempotent producer** needs **acks=all** in practice.', '// EOS story ties to transactional and ISR semantics'),
];

const seniorScenario = [
  seniorItem('**Incident:** **Consumer lag** explodes after **deploy**; **rebalance storm** in logs.', 'Freeze deploy; snapshot **rebalance reason**.', '**max.poll.interval** exceeded due to **slow handler** + **larger batches**.', 'Fix **handler** time or **tune** intervals; **cooperative** rebalance.', 'Alert on **rebalance rate** per group.'),
  seniorItem('**Design:** **Global ordering** for **all orders** in Kafka.', 'Challenge requirement.', 'Single partition **serializes** throughput.', 'Use **orderId** partition key; accept **per-key** ordering only.', 'Document **SLO** vs **ordering** trade-off.'),
  seniorItem('**Ops:** **Under-replicated partitions** during **AZ failure**.', 'Check **ISR** and **rack** placement.', '**RF** or **min ISR** misconfigured for **AZ** loss.', 'Raise **RF**, verify **rack awareness**, **pause** risky **traffic**.', 'Game-day **AZ** drill.'),
  seniorItem('**Scale:** **12 partitions**, **40 consumers** in one group.', 'Explain **idle consumers**.', '**Max parallelism** = **partition count** for the group.', '**Repartition** topic or **multiple** groups for **read scaling**.', 'Capacity model in **ADR**.'),
  seniorItem('**Bug:** **Poison message** blocks partition forever.', 'DLQ pattern.', 'No **skip** path; **offset** stuck.', '**Tombstone** handling + **DLQ** + **manual** intervention playbook.', 'Test **poison** in **staging**.'),
  seniorItem('**Cost:** **Retention** **7 years** on **high-volume** topic.', 'Tiered storage or topic split.', 'Disk and **replay** cost **unsustainable**.', 'Compaction + **export** to **object storage** + **governance**.', 'Finance sign-off on **retention** policy.'),
];

const wrongAnswers = [
  '**Kafka** guarantees **global** **ordering** across a topic — **Correction:** **Per-partition** ordering only.',
  '**More consumers** than **partitions** speeds up **one** group — **Correction:** **Extra** members **idle**.',
  '**acks=1** is always **enough** for **payments** — **Correction:** **Durability** needs **acks=all** + **min ISR** design.',
  '**Offsets** are **per topic** only — **Correction:** **Per** **partition** per consumer group.',
  '**Delete topic** instantly frees **all** disk — **Correction:** **Segments** and **replicas** recover **at** **pace** of **GC**.',
  '**Rebalance** is **free** — **Correction:** **Stop-the-world** consumption during **eager** rebalance.',
  '**Replication** fixes **hot keys** — **Correction:** **Same** partition still **hot**; need **key** design.',
  '**Consumer** **threads** **unlimited** help — **Correction:** **Poll loop** and **partition** count bound useful work.',
];

const why = `**Kafka** is the **default** answer when teams need **durable**, **replayable** **event streams** at scale. Interviewers expect you to **tie** **brokers**, **partitions**, and **consumer groups** to **real** **failure** modes: **rebalance storms**, **hot partitions**, and **mis-tuned** **poll** intervals.\n\nStrong answers **name** **metrics** (**lag**, **ISR**, **under-replicated partitions**) and **policies** (**acks**, **min ISR**, **retention**). Weak answers **stop** at "**Kafka** is a **queue**" without **ordering** or **parallelism** semantics.\n\nThis day frames **Day 59** as **architecture literacy**: how **storage**, **replication**, and **client** behavior fit together before **producer/consumer** deep dives.`;

const theory = `### Day 59 — **Kafka** **architecture**\n\n### 1. Topics, partitions, segments\nAppend-only **log** **segments** per **partition**; **ordering** is **partition-scoped**. Choose **partition count** early with **growth** in mind—**expensive** to shrink.\n\n### 2. Producers and durability hooks\n**acks** and **retries** interact with **leader** and **ISR**. **Idempotent** producers address **duplicate** retries at the protocol edge.\n\n### 3. Consumers and groups\n**One** **consumer** **instance** per **partition** **max** in a **group**. **Offsets** track **progress**; **commits** define **delivery** semantics with your **processing** code.\n\n### 4. Replication and controllers\n**Leaders** serve **reads/writes**; **followers** replicate. **Controller** manages **metadata** and **failover**.\n\n### 5. Operational signals\n**Consumer lag**, **under-replicated** **partitions**, **offline** **log directories**, and **rebalance** **rates** are **first-class** **dashboards**.\n\n### 6. 60-second story\n**Symptom:** **Lag** after **crash**. **Cause:** **Slow** **poll** + **rebalance** **churn**. **Fix:** **Handler** **SLA** + **tuned** **intervals** + **partition** count **match** parallelism.`;

const basic = {
  title: 'Basic — Broker, topic, partition map',
  filename: 'Day59Basic.java',
  description: 'Print core vocabulary for interview whiteboards.',
  code: `package arch.day59;

public class Day59Basic {
    public static void main(String[] args) {
        System.out.println("broker   = log storage + leader serving");
        System.out.println("topic    = named stream");
        System.out.println("partition = parallelism + ordering unit");
        System.out.println("replica  = copied log for fault tolerance");
    }
}
`,
  output: `broker   = log storage + leader serving
topic    = named stream
partition = parallelism + ordering unit
replica  = copied log for fault tolerance
`,
};

const intermediate = {
  title: 'Intermediate — Partition for key',
  filename: 'Day59Intermediate.java',
  description: 'Deterministic partition index from string key.',
  code: `package arch.day59;

public class Day59Intermediate {
    static int partitionFor(String key, int numParts) {
        return Math.floorMod(key.hashCode(), numParts);
    }

    public static void main(String[] args) {
        System.out.println("keyA p=" + partitionFor("keyA", 8));
        System.out.println("keyB p=" + partitionFor("keyB", 8));
    }
}
`,
  output: `keyA p=2
keyB p=3
`,
};

const advanced = {
  title: 'Advanced — Round-robin partition assignment toy',
  filename: 'Day59Advanced.java',
  description: 'Toy assignment: partition index maps to consumer member by modulo.',
  code: `package arch.day59;

import java.util.*;

public class Day59Advanced {
    public static void main(String[] args) {
        int partitions = 6;
        List<String> members = List.of("c1", "c2", "c3");
        for (int p = 0; p < partitions; p++) {
            String m = members.get(p % members.size());
            System.out.println("p" + p + " -> " + m);
        }
    }
}
`,
  output: `p0 -> c1
p1 -> c2
p2 -> c3
p3 -> c1
p4 -> c2
p5 -> c3
`,
};

const diagram = {
  title: 'Producers, brokers, consumer group',
  description: 'Keys land on partitions; group members share partition assignment.',
  plantuml: `@startuml
title Day 59 — Kafka architecture
rectangle Cluster {
  queue "topic orders (p0..pN)" as T
}
Producer -> T : key -> partition
T -> ConsumerGroup : fetch
ConsumerGroup : members share assignment
@enduml`,
};

const pitfalls = [
  '**Partition** **keys** that **collide** on **few** values → **hot** **partitions**.',
  '**Treating** **Kafka** like a **work** **queue** without **replay** **design**.',
  '**Scaling** **consumers** **beyond** **partition** **count** expecting **linear** **speedup**.',
  '**Ignoring** **max.poll.interval.ms** vs **handler** **runtime**.',
  '**No** **lag** **alerting** per **partition**.',
  '**Unclean** **leader** **election** **enabled** on **money** **topics**.',
  '**Tiny** **partition** **count** **planned** **without** **future** **throughput**.',
  '**Metadata** **storms** from **tight** **retry** loops on **NOT_LEADER**.',
];

const exerciseSolution = `package arch.day59;

public class Day59Exercise {
    public static void main(String[] args) {
        System.out.println("configs: max.poll.interval.ms, session.timeout.ms, fetch.max.wait.ms");
        System.out.println("metric: consumer-lag per partition + rebalance rate");
    }
}
`;

const exercise = {
  titleSuffix: 'Kafka architecture — consumer tuning literacy (Day 59 assignment)',
  problem:
    'Match **Day 59** coding drill: print **two lines** **exactly**:\n1. **configs:** max.poll.interval.ms, session.timeout.ms, fetch.max.wait.ms\n2. **metric:** consumer-lag per partition + rebalance rate',
  hints: ['Use **System.out.println** twice with **exact** strings.', 'No extra spaces around colons beyond the template.'],
  solution: exerciseSolution,
  difficulty: 'Advanced',
};

const cheatsheet = `| Concept | Recall |
|---|---|
| Partition | Ordering + parallelism unit |
| Consumer group | Shared assignment; max 1 reader/partition |
| acks all | Waits for ISR policy |
| Lag | High-water minus consumer position |
| Rebalance | Membership / poll timeout driven |
| ISR | In-sync follower set |
| Controller | Metadata + leader elections |
| Retention | Time/size; compaction optional |
| Key hash | Stable routing for entity ordering |
| Hot key | Skew → single partition overload |`;

const drillSeeds = [
  { question: 'Code review: **consumer** **threads** **manually** **assign** **same** **partition** **twice**.', signals: ['assign', 'double read', 'bug'], core: { root: '**Static** **assignment** **error** or **duplicate** **client** **ids**.', breaks: '**Nondeterministic** **offsets** and **duplicate** **processing**.', fix: '**One** **owner** per **partition**; verify **group** **generation**.', angle: 'Interview: **subscribe** vs **assign**.', fq1q: 'Detection?', fq1a: '**Offset** **commits** **fighting**; **metric** **anomalies** **per** **partition**.', fq2q: 'Test?', fq2a: '**Chaos** **kill** **consumer** **pod** **during** **load**.' } },
  { question: '**Incident:** **Under-replicated** **partitions** spike after **broker** **patch**.', signals: ['ISR', 'network', 'patch'], core: { root: '**Network** **partition** or **IO** **saturation** **slowing** **followers**.', breaks: '**Producer** **latency** **up**; **risk** if **min ISR** **breached**.', fix: '**Throttle** **traffic**; **fix** **broker** **IO**; **verify** **rack** **layout**.', angle: '**cruise** **control** **Kafka** **features** if applicable.', fq1q: 'Rollback?', fq1a: '**Binary** **rollback** only if **safe**; else **traffic** **shift**.', fq2q: 'Comms?', fq2a: '**SLO** **burn** **and** **expected** **recovery** **window**.' } },
  { question: '**Design:** **Exactly-once** **ordering** for **all** **events** **globally**.', signals: ['ordering', 'EOS', 'trade-off'], core: { root: '**Global** **order** **implies** **single** **writer** **path** **or** **heavy** **coordination**.', breaks: '**Throughput** **ceiling**.', fix: '**Per-entity** **streams**; **idempotent** **consumers**.', angle: '**Event** **sourcing** **vs** **analytics** **needs**.', fq1q: 'CEO ask?', fq1a: 'Translate to **money** **reconciliation** **requirements**.', fq2q: 'Metric?', fq2a: '**Duplicate** **rate** + **lag**.' } },
  { question: '**Trade-off:** **12** vs **120** **partitions** **day** **one**.', signals: ['operations', 'rocksdb', 'streams'], core: { root: '**More** **partitions** **more** **files** **and** **election** **churn** **overhead**.', breaks: '**Ops** **complexity**; **consumer** **instances** **needed** **to** **use** **them**.', fix: 'Model **throughput**; **grow** with **repartition** **tooling**.', angle: '**Connect** / **Streams** **chtopic doubling** awareness.', fq1q: 'Who decides?', fq1a: '**Platform** **tier** **with** **service** **SLO** **inputs**.', fq2q: 'Migration?', fq2a: '**Double-write** **bridge** **topic** **pattern**.' } },
  { question: '**Gotcha:** **Log** **retention** **cut** **overnight** **to** **save** **disk**.', signals: ['retention', 'replay', 'compliance'], core: { root: '**Consumers** **offline** **lose** **history** **for** **rebuild**.', breaks: '**Audit** / **ML** **pipelines** **break**.', fix: '**Tiered** **storage** or **export** **before** **cut**.', angle: '**Legal** **hold** **requirements**.', fq1q: 'Guardrail?', fq1a: '**Automated** **storage** **forecast** **alerts**.', fq2q: 'Recovery?', fq2a: '**Replay** **from** **warehouse** **if** **possible**.' } },
  { question: '**Senior:** **Multi-tenant** **cluster** — noisy **neighbor** topic saturates **disk** **IO**.', signals: ['fairness', 'quota', 'tenant'], core: { root: '**No** **per-tenant** **throttle** or **dedicated** **cluster** tier.', breaks: '**All** **SLAs** **miss** **together**.', fix: '**Quota** + **dedicated** **brokers** for **VIP** tenants.', angle: '**Chargeback** model.', fq1q: 'Metric?', fq1a: '**IO** **wait** **per** **broker** + **topic** **bytes** **in**.', fq2q: 'Long-term?', fq2a: '**Cell-based** **Kafka** **architecture**.' } },
  { question: '**Security:** **ACL** misconfigured — **producer** can **write** **to** **internal** **ops** topic.', signals: ['authorization', 'leak', 'governance'], core: { root: '**Wildcard** **principal** grants in **RBAC**.', breaks: '**Poison** **data** or **PII** **exfil**.', fix: '**Least** **privilege** + **review** **terraform** **ACLs**.', angle: '**Audit** **trail** **for** **topic** **creation**.', fq1q: 'Detect?', fq1a: '**Unexpected** **write** **rate** **to** **protected** topics.', fq2q: 'Process?', fq2a: '**PR** review for **ACL** changes.' } },
  { question: '**Scale:** **Cross-AZ** **traffic** bill explodes for **mirrored** **cluster**.', signals: ['cloud', 'egress', 'replication'], core: { root: '**Leader** **in** **AZ-A**, **followers** **fetch** **cross** **AZ** without **rack** **awareness**.', breaks: '**Budget** **overrun**.', fix: '**Preferred** **replica** + **rack** IDs + **traffic** topology review.', angle: 'Finance + platform joint **review**.', fq1q: 'Quick win?', fq1a: '**Co-locate** **heavy** **consumers** with **leader** **AZ** when safe.', fq2q: 'Anti-pattern?', fq2a: '**Global** **cluster** for **every** **team** by default.' } },
  { question: '**Misconception:** "**Replication** **factor** **three** means **triple** **write** throughput**."', signals: ['throughput', 'ISR', 'write path'], core: { root: '**Leader** still **bounds** **single-partition** **write** path; replication costs **network** and **disk**.', breaks: 'Wrong **capacity** **plans**.', fix: 'Model **p99** with **acks=all** and **ISR** **width**.', angle: 'Draw **write** path on whiteboard.', fq1q: 'When RF helps?', fq1a: '**Availability** and **durability**, not magic scale-out of one hot partition.', fq2q: 'Load test?', fq2a: '**Partition** sweep with fixed message size.' } },
];

export const drill59 = {
  day: 59,
  title: 'Kafka Architecture',
  phaseId: 'phase7',
  tags: ['Kafka', 'broker', 'partition', 'consumer group', 'ISR', 'replication', 'lag', 'rebalance'],
  scenarios: drillSeeds.map((s, i) => scenarioDrillItem(59, i + 1, s.question, s.signals, s.core)),
};

export default {
  day: 59,
  title: 'Kafka Architecture',
  estimatedHours: 4,
  tags: ['Senior', 'Advanced', 'Phase 7', 'Interview Prep', 'Satyverse(Satyam Parmar)', 'Kafka'],
  prerequisites: ['Day 58', 'Day 57'],
  learningObjectives: [
    'Explain **brokers**, **topics**, **partitions**, and **replication** with operational implications',
    'Reason about **consumer groups**, **rebalancing**, and **partition** **parallelism** limits',
    'Name **durability** levers that pair **acks** with **ISR** policy',
    'Diagnose **lag**, **hot keys**, and **metadata** issues using the right metrics',
    'Contrast **Kafka** log semantics with **classic** **queues** for interview clarity',
    'Design **key** strategies that preserve **per-entity** ordering without **skew**',
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
