import { conceptualItem, codeBasedItem, seniorItem, scenarioDrillItem } from '../gen-phase6/lib.mjs';

const T = 'Schema Registry and Kafka Connect';

const conceptual = [
  conceptualItem('What is **Schema Registry**?', 'Central **schema** **store** with **compatibility** rules and **REST** access for **producer**/**consumer** serdes.', T),
  conceptualItem('**BACKWARD** compatibility meaning?', 'New **schema** can read **data** written with **previous** schema (common default).', T),
  conceptualItem('**FORWARD** vs **FULL**?', '**Forward** allows old code to read new data; **full** is intersection of **forward** + **backward**.', T),
  conceptualItem('What is **Kafka Connect**?', 'Framework for **source** and **sink** **connectors** moving data between Kafka and systems like **JDBC**.', T),
  conceptualItem('**SMT** (Single Message Transforms)?', 'Lightweight **map** operations in connector pipeline (mask fields, route topics).', T),
  conceptualItem('**DLQ** in Connect?', 'Route **failed** records to a **dead-letter** topic with **error** metadata.', T),
  conceptualItem('**Connector** **task** parallelism?', 'Tasks split **work** across **partitions**; more tasks than partitions may idle.', T),
  conceptualItem('**Confluent** vs **Apicurio** landscape?', 'Both implement **registry** patterns; **operational** tooling differs—interviews may compare trade-offs.', T),
  conceptualItem('**subject** naming strategies?', '**TopicNameStrategy**, **RecordNameStrategy**, **TopicRecordNameStrategy** change how subjects map to schemas.', T),
  conceptualItem('**Wire format** with registry?', 'Payload includes **schema id** so **deserializer** can fetch from registry.', T),
  conceptualItem('**auto.register** risk in prod?', 'Accidental **incompatible** schema publishing bypasses CI checks.', T),
  conceptualItem('**Connector** **offset** storage?', 'Internal **Kafka** **topics** track **progress** per **partition**.', T),
  conceptualItem('**Exactly-once** sink nuances?', 'Need **idempotent** **writes** + keys; **at-least-once** default can duplicate DB rows.', T),
  conceptualItem('Why **version** schemas in CI?', 'Catch **breaking** changes before production **deserialization** outages.', T),
  conceptualItem('**Debezium** connector?', 'Streams **CDC** events from DB binlog to Kafka topics.', T),
];

const codeBased = [
  codeBasedItem('**curl** get schema by id (pseudo).', '// curl -s http://registry/subjects/orders-value/versions/latest'),
  codeBasedItem('**Avro** field default for evolution.', '// add optional field with default JSON'),
  codeBasedItem('**Protobuf** backward compat note.', '// reserve field numbers; avoid type changes'),
  codeBasedItem('**JsonSchema** draft compatibility check.', '// ci step runs compatibility verify'),
  codeBasedItem('Connect **key.converter** vs **value.converter**.', '// separate serializers for key and value'),
  codeBasedItem('**errors.tolerance=all** caution.', '// may swallow poison silently unless DLQ configured'),
  codeBasedItem('**pk.mode** jdbc sink.', '// record_key vs record_value impacts upsert'),
  codeBasedItem('**insert.mode** upsert.', '// requires primary key definition'),
  codeBasedItem('**transforms=MaskField** pseudo.', '// mask PII field paths'),
  codeBasedItem('**consumer.override** prefix.', '// pass consumer props to connector tasks'),
];

const seniorScenario = [
  seniorItem('**Incident:** **deserialize** errors spike after deploy.', 'Pause connector; inspect **schemas**.', '**Incompatible** evolution reached prod.', 'Rollback producer; fix **CI** gate.', 'Dashboard registry **409** conflicts.'),
  seniorItem('**Ops:** **Sink** duplicates rows hourly.', 'Check **keys**.', 'At-least-once without primary key.', 'Add **PK** + **upsert** mode.', 'Reconcile job.'),
  seniorItem('**Design:** **Share** one **subject** for unrelated events.', 'Modeling review.', 'Couples evolution unnecessarily.', 'Split subjects per type.', 'ADR.'),
  seniorItem('**Cost:** **Registry** HA cluster oversized.', 'Right-size.', 'Always-on **multi-AZ** for dev.', 'Tier environments.', 'FinOps.'),
  seniorItem('**Security:** **Schema** contains **PII** in plain Avro doc.', 'Classification fail.', 'Docs leak to logs.', 'Strip docs; use external data catalog.', 'Scanner.'),
  seniorItem('**Migration:** **Kafka** **version** bump breaks **wire** format.', 'Freeze.', 'Mixed cluster **version** mismatch.', 'Stagger upgrades with compatibility matrix.', 'Runbook.'),
];

const wrongAnswers = [
  'Registry makes topics **ordered** — **Correction:** Ordering still partition semantics.',
  '**Backward** means old writers OK with new readers always — **Correction:** Direction matters; define clearly.',
  'Connect replaces **Streamer** apps — **Correction:** Different fit for **bulk** integration.',
  '**SMT** replaces **stream** processing — **Correction:** Light transforms only.',
  '**JSON** without registry is safer — **Correction:** Still need contracts and evolution discipline.',
  '**tasks.max** infinite helps — **Correction:** Bounded by partitions and DB load.',
  '**DLQ** optional always — **Correction:** Needed for poison resilience.',
  '**Schema** evolution is only registry concern — **Correction:** Consumers must deploy with compatible code.',
];

const why = `**Schema Registry** and **Connect** operationalize **contracts** at **scale**. Strong candidates articulate **compatibility** modes, **connector** failure surfaces, and **DLQ** hygiene—not just buzzwords.\n\nFinancial and compliance orgs care about **PII** in schemas and **sink** idempotency.`;

const theory = `### Day 64 — **Schema** **Registry** + **Kafka** **Connect**\n\n### 1. Registry purpose\nVersioned **schemas** + **REST** + **compatibility** policies.\n\n### 2. Compatibility\n**Backward**, **forward**, **full**, **transitive** nuances.\n\n### 3. Connect\nSource/sink **tasks**, **converters**, **transforms**.\n\n### 4. Failure handling\n**errors.tolerance**, **DLQ** topics, **restarts**.\n\n### 5. Data quality\n**CI** checks for **breaking** changes.\n\n### 6. Story\n**Auto-register** in prod causes incompatible **Avro** → CI gate + **rollback**.`;

const basic = {
  title: 'Basic — Registry + Connect vocabulary',
  filename: 'Day64Basic.java',
  description: 'Three printed definitions.',
  code: `package arch.day64;

public class Day64Basic {
    public static void main(String[] args) {
        System.out.println("registry: central schema versions + compatibility rules");
        System.out.println("connect: source/sink integration framework");
        System.out.println("subject: named schema lineage used by serdes");
    }
}
`,
  output: `registry: central schema versions + compatibility rules
connect: source/sink integration framework
subject: named schema lineage used by serdes
`,
};

const intermediate = {
  title: 'Intermediate — Compatibility mode labels',
  filename: 'Day64Intermediate.java',
  description: 'Print backward vs forward one-liner.',
  code: `package arch.day64;

public class Day64Intermediate {
    public static void main(String[] args) {
        System.out.println("backward: new schema reads old data");
        System.out.println("forward: old schema reads new data");
    }
}
`,
  output: `backward: new schema reads old data
forward: old schema reads new data
`,
};

const advanced = {
  title: 'Advanced — Subject name builder toy',
  filename: 'Day64Advanced.java',
  description: 'Build subject from topic + suffix.',
  code: `package arch.day64;

public class Day64Advanced {
    public static void main(String[] args) {
        System.out.println("orders-value");
    }
}
`,
  output: `orders-value
`,
};

const diagram = {
  title: 'Connect sink with converters',
  description: 'Tasks read Kafka, write to DB with schema-aware deserialization.',
  plantuml: `@startuml
title Day 64 — Connect sink
queue Kafka
participant ConnectorTask
database Database
Kafka -> ConnectorTask : poll records
ConnectorTask -> Database : upsert with pk.mode
@enduml`,
};

const pitfalls = [
  '**Auto** **register** **without** **CI** **compat** **gates**.',
  '**Sink** **without** **primary** **key** **and** **upsert**.',
  '**Sharing** **subjects** across **unrelated** **events**.',
  '**errors.tolerance=all** **without** **DLQ** **visibility**.',
  '**tasks.max** **too** **high** **overwhelming** **downstream** **DB**.',
  '**PII** **inside** **schema** **docs** **and** **logs**.',
  '**Mixed** **converter** **configs** across **environments** silently.',
  '**Ignoring** **offset** **reset** **runbooks** during **disaster** **replay**.',
];

const exerciseSolution = `package arch.day64;

public class Day64Exercise {
    public static void main(String[] args) {
        System.out.println("DB auth failure, schema mismatch, or deserialization error");
    }
}
`;

const exercise = {
  titleSuffix: 'Schema Registry & Connect — task restart causes (Day 64 assignment)',
  problem: 'Print **exactly**: DB auth failure, schema mismatch, or deserialization error',
  hints: ['Match assignments_phase7 d64q4 expectedOutput.'],
  solution: exerciseSolution,
  difficulty: 'Advanced',
};

const cheatsheet = `| Item | Recall |
|---|---|
| Registry | Versioned schemas |
| BACKWARD | New read old default |
| Subject | orders-value naming |
| Connect task | Partition-bound work |
| DLQ | Poison handling |
| SMT | Field level transforms |
| Upsert | Needs PK |
| CI compat | Blocks prod breaks |
| offsets.topic | Internal connect progress |
| Debezium | CDC to Kafka |`;

const drillSeeds = [
  { question: 'Code review: **errors.tolerance=all** without **errors.deadletterqueue**.', signals: ['silent', 'poison', 'connect'], core: { root: 'Failures swallowed invisible.', breaks: 'Data loss in warehouse silently.', fix: 'Enable DLQ + logging + metrics.', angle: 'List required Connect error properties.', fq1q: 'Metric?', fq1a: 'error count per task in prometheus exporter.', fq2q: 'Who owns?', fq2a: 'Data engineering on-call.' } },
  { question: '**Incident:** **JDBC** sink **OOM** after message size doubled.', signals: ['heap', 'batch', 'sink'], core: { root: 'task **consumer** buffers huge batches.', breaks: 'connector restarts loop.', fix: 'Lower max.poll.records or raise heap with profiling justification.', angle: 'Explain backpressure path.', fq1q: 'DB side?', fq1a: 'Transaction log growth risk.', fq2q: 'Long-term?', fq2a: 'Split wide messages into normalized tables.' } },
  { question: '**Design:** **Global** **Avro** **union** mega schema for all events.', signals: ['coupling', 'evolution'], core: { root: 'Every service blocks on others evolution.', breaks: 'CI red across company on small change.', fix: 'Split subjects per bounded context.', angle: 'DDD language.', fq1q: 'Registry cost?', fq1a: 'Still cheaper than org-wide incident.', fq2q: 'Migration?', fq2a: 'Strangler dual-write consumer adapters.' } },
  { question: '**Trade-off:** **Protobuf** vs **Avro** for greenfield.', signals: ['ecosystem', 'typing'], core: { root: 'Tooling and team familiarity differ.', breaks: 'Wrong choice slows velocity.', fix: 'Pick based on client languages + codegen.', angle: 'Pilot both with same domain model.', fq1q: 'Interop?', fq1a: 'Consider JSON schema for edge if needed.', fq2q: 'Ops?', fq2a: 'Registry still central either way.' } },
  { question: '**Gotcha:** **Schema** deleted that still referenced in old segments.', signals: ['retention', 'replay'], core: { root: 'Old data unreadable after deletion.', breaks: 'Replay pipeline fails.', fix: 'Never delete versions in use; archive instead.', angle: 'Lifecycle policy with legal.', fq1q: 'Detection?', fq1a: 'Automated scan of active schema IDs in offsets.', fq2q: 'Recovery?', fq2a: 'Restore schema export from backup.' } },
  { question: '**Senior:** **Multi** **tenant** connect cluster isolation.', signals: ['noisy neighbor', 'security'], core: { root: 'One bad JDBC connector starves others.', breaks: 'SLA miss across customers.', fix: 'Per-tenant clusters or quotas.', angle: 'Chargeback model.', fq1q: 'Metric?', fq1a: 'task restart rate per connector name.', fq2q: 'Network?', fq2a: 'PrivateLink per tenant DB.' } },
  { question: '**Security:** **Registry** credentials baked into **git**.', signals: ['secrets', 'leak'], core: { root: 'Exposed basic auth file.', breaks: 'Schema tampering risk.', fix: 'Vault injection + rotation.', angle: 'SAST secret scanning.', fq1q: 'Response?', fq1a: 'Revoke keys + audit who used them.', fq2q: 'Prevention?', fq2a: 'Short-lived tokens only.' } },
  { question: '**Scale:** **Debezium** snapshot slows production DB.', signals: ['cdc', 'load'], core: { root: 'Heavy snapshot queries during peak.', breaks: 'OLTP latency spikes.', fix: 'Off-hours snapshot + incremental tuning.', angle: 'DBA partnership.', fq1q: 'Alternative?', fq1a: 'Read replica for snapshot if consistent.', fq2q: 'Monitoring?', fq2a: 'Replica lag + connector binlog lag.' } },
  { question: '**Misconception:** "**Compatibility** check replaces integration tests."', signals: ['testing', 'quality'], core: { root: 'Binary compatible still may be logically wrong.', breaks: 'Silent business bugs.', fix: 'Contract tests + producer consumer pairs in CI.', angle: 'Pact mention.', fq1q: 'Example?', fq1a: 'Field semantic change from cents to dollars.', fq2q: 'Owner?', fq2a: 'Product + eng pair approve schema PR.' } },
  { question: '**Chaos:** **Registry** restart during high produce.', signals: ['cache', 'client'], core: { root: 'Clients retry schema fetch storm.', breaks: 'Metadata latency spikes.', fix: 'Retry backoff + local schema cache TTL tuning.', angle: 'Game day script.', fq1q: 'SLO?', fq1a: 'Schema fetch p99 budget.', fq2q: 'Fallback?', fq2a: 'Read-only mirror registry.' } },
];

export const drill64 = {
  day: 64,
  title: 'Schema Registry & Kafka Connect',
  phaseId: 'phase7',
  tags: ['schema', 'registry', 'connect', 'avro', 'compatibility', 'connector', 'CDC'],
  scenarios: drillSeeds.map((s, i) => scenarioDrillItem(64, i + 1, s.question, s.signals, s.core)),
};

export default {
  day: 64,
  title: 'Schema Registry & Kafka Connect',
  estimatedHours: 4,
  tags: ['Senior', 'Advanced', 'Phase 7', 'Interview Prep', 'Satyverse(Satyam Parmar)', 'Kafka'],
  prerequisites: ['Day 63', 'Day 62'],
  learningObjectives: [
    'Explain **Schema Registry** roles, **subject** strategies, and **compatibility** modes',
    'Operate **Kafka Connect** with tasks, converters, transforms, and DLQ discipline',
    'Prevent **breaking** schema changes using **CI** and governance processes',
    'Design **idempotent** sinks and **keying** strategies for **at-least-once** delivery',
    'Compare **CDC** patterns (e.g., **Debezium**) with application-level outbox',
    'Secure registry and connector credentials with rotation and least privilege',
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
