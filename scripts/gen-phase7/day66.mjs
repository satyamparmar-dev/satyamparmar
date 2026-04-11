import { conceptualItem, codeBasedItem, seniorItem, scenarioDrillItem } from '../gen-phase6/lib.mjs';

const T = 'RabbitMQ and AWS messaging';

const conceptual = [
  conceptualItem('When **RabbitMQ** fits?', '**AMQP** broker with **flexible** routing (**exchanges**, **queues**), good for **task** workloads and **complex** topologies on **self-managed** or **hosted** Rabbit.', T),
  conceptualItem('**Kafka** vs **queue** mental model?', '**Kafka**: **durable** **log** with **replay** and **consumer groups**; **classic** **queues**: **delete** or **ack** semantics after consumption.', T),
  conceptualItem('What is **SQS**?', 'Managed **queue** with **visibility timeout**, **long polling**, **DLQ** integration—**no** log replay like Kafka.', T),
  conceptualItem('What is **SNS**?', 'Pub/sub **fan-out** to many subscribers including SQS, Lambda, HTTP.', T),
  conceptualItem('**SQS** **FIFO** vs **standard**?', 'FIFO gives **ordering** + **dedupe** with lower **throughput**; standard is **at-least-once** high throughput.', T),
  conceptualItem('**Visibility timeout** pitfall?', 'Processing longer than timeout causes **duplicate** delivery to another consumer.', T),
  conceptualItem('Rabbit **prefetch** (**qos**)?', 'Limits **unacked** messages per consumer balancing **fairness** and **memory**.', T),
  conceptualItem('Rabbit **dead-letter** exchange?', 'Route **rejected**/**expired** messages for inspection.', T),
  conceptualItem('**EventBridge** vs **SNS**?', 'EventBridge offers **schema** registry, **content** filtering, **SaaS** integrations—different **routing** ergonomics.', T),
  conceptualItem('**Kinesis** vs **Kafka** (high level)?', 'Both **streaming** logs; operational model and ecosystem differ—pick with **cloud** constraints.', T),
  conceptualItem('Why **long polling** SQS?', 'Reduces **empty** receive **charges** and **CPU** hot loops vs short polling.', T),
  conceptualItem('**Exactly-once** in SQS **FIFO** nuance?', '**Exactly-once** delivery **processing** still needs **idempotent** workers.', T),
  conceptualItem('**Rabbit** cluster **mirror** queues history?', 'Modern **quorum** queues differ from classic mirrored—know what your vendor runs.', T),
  conceptualItem('**Budget** angle picking tech?', 'Managed queues reduce **ops**; Kafka adds **replay** **power** with **operator** **cost**.', T),
  conceptualItem('**Hybrid** patterns?', 'SQS/Lambda fronting **Kafka** for **spiky** ingress is common—each tier has different **semantic** guarantees.', T),
];

const codeBased = [
  codeBasedItem('SQS **ReceiveMessage** wait time.', '// WaitTimeSeconds=20 long poll'),
  codeBasedItem('SNS **publish** pseudo.', '// sns.publish(topicArn, message)'),
  codeBasedItem('Rabbit **basicPublish** concept.', '// channel.basicPublish(exchange, routingKey, props, body)'),
  codeBasedItem('Rabbit **basicAck** multiple flag.', '// ack deliveryTag batches carefully'),
  codeBasedItem('SQS **ChangeMessageVisibility**.', '// extend processing lease'),
  codeBasedItem('SNS **filter policy** JSON.', '// MessageAttributes matching'),
  codeBasedItem('EventBridge **PutEvents** mention.', '// event bus routing'),
  codeBasedItem('SQS DLQ redrive.', '// aws API redrive tasks from DLQ'),
  codeBasedItem('Rabbit **TTL** on queue.', '// message expire to DLX'),
  codeBasedItem('**@SqsListener** spring abstraction.', '// polls with backoff integration'),
];

const seniorScenario = [
  seniorItem('**Incident:** **Lambda** **throttles** on **SQS** burst.', 'Increase concurrency limits.', 'Downstream saturation.', 'Kinesis or batching tuning.', 'AWS support ticket.'),
  seniorItem('**Bug:** **Visibility** too low vs **P99** handler.', 'Duplicates spike.', 'Timeout mismatch.', 'Raise visibility + heartbeat pattern.', 'Metrics.'),
  seniorItem('**Design:** Need **replay** month of audit.', 'SQS inadequate alone.', 'No log retention.', 'Kafka or S3 event archive.', 'ADR.'),
  seniorItem('**Ops:** Rabbit **memory** alarm.', 'Prefetch + backlog.', 'Consumers slower than producers.', 'Scale consumers + quarantine overloaded queues.', 'Runbook.'),
  seniorItem('**Cost:** **SNS** **HTTP** endpoints flaky.', 'Retry storms.', 'No backoff.', 'Exponential backoff + DLQ subscriptions.', 'FinOps.'),
  seniorItem('**Migration:** **ActiveMQ** to **Rabbit** routing keys mismatch.', 'Silent drops.', 'Mapping error.', 'Parallel run with shadow traffic.', 'Verification job.'),
];

const wrongAnswers = [
  '**SQS** provides **unlimited** **retention** — **Correction:** **Max** **14** days default retention window.',
  '**FIFO** throughput equals **standard** — **Correction:** **Lower** **TPS** limits.',
  '**Kafka** can always emulate **Rabbit** **routing** trivially — **Correction:** Different **primitives**; often need careful design.',
  '**Visibility** timeout solves poison messages — **Correction:** Need **DLQ** and redrive policies.',
  '**EventBridge** replaces **Kafka** always — **Correction:** Different **scale** and **replay** story.',
  '**Long** polling eliminates **duplicates** — **Correction:** Still **at-least-once** semantics generally.',
  '**Rabbit** **never** loses messages — **Correction:** **Cluster** failures and **misconfig** happen.',
  '**Lambda** + SQS is **free** scaling — **Correction:** **Concurrency** and **downstream** **costs** bite.',
];

const why = `Not every problem is **Kafka-shaped**. Interviewers reward knowing when **SQS**, **SNS**, **Rabbit**, and **Kafka** each win, especially around **replay**, **routing**, and **ops** **surface** area.\n\nThis day also ties **cloud** economics: **polling**, **visibility**, and **fan-out** patterns affect bills and **reliability**.`;

const theory = `### Day 66 — **RabbitMQ** + **AWS** **messaging**\n\n### 1. RabbitMQ\n**Exchanges**, **bindings**, **queues**, **prefetch**, **DLX**.\n\n### 2. SQS / SNS\n**Standard** vs **FIFO**, **visibility**, **long** polling, **DLQ**.\n\n### 3. Event abstraction\n**EventBridge** **rules** and **schemas**.\n\n### 4. Kafka contrast\n**Replay** **log** vs **work** **queue**.\n\n### 5. Failure modes\n**Visibility** **too** **short**, **retry** storms, **hot** **queues**.\n\n### 6. Story\n**SQS** **visibility** too low → duplicate **payments**; extend **timeout** + **idempotent** workers.`;

const basic = {
  title: 'Basic — SQS vs Kafka headline',
  filename: 'Day66Basic.java',
  description: 'Selection heuristic one-liners.',
  code: `package arch.day66;

public class Day66Basic {
    public static void main(String[] args) {
        System.out.println("SQS: managed queue with visibility timeout and DLQ");
        System.out.println("SNS: pub/sub fan-out bus");
        System.out.println("Kafka: durable log with replay and consumer groups");
    }
}
`,
  output: `SQS: managed queue with visibility timeout and DLQ
SNS: pub/sub fan-out bus
Kafka: durable log with replay and consumer groups
`,
};

const intermediate = {
  title: 'Intermediate — Assignment one-liner',
  filename: 'Day66Intermediate.java',
  description: 'Print SQS vs Kafka selection line.',
  code: `package arch.day66;

public class Day66Intermediate {
    public static void main(String[] args) {
        System.out.println("SQS: managed queue/task; Kafka: log streaming/replay");
    }
}
`,
  output: `SQS: managed queue/task; Kafka: log streaming/replay
`,
};

const advanced = {
  title: 'Advanced — Visibility math toy',
  filename: 'Day66Advanced.java',
  description: 'If handler 25s, pick visibility at least 30.',
  code: `package arch.day66;

public class Day66Advanced {
    public static void main(String[] args) {
        int handlerSec = 25;
        int visibility = handlerSec + 5;
        System.out.println("visibilitySec=" + visibility);
    }
}
`,
  output: `visibilitySec=30
`,
};

const diagram = {
  title: 'SNS fan-out to multiple SQS queues',
  description: 'Fan-out pattern with independent consumer scaling.',
  plantuml: `@startuml
title Day 66 — SNS + SQS
participant Publisher
participant SNS
queue SQS1
queue SQS2
Publisher -> SNS : publish
SNS -> SQS1 : subscribe
SNS -> SQS2 : subscribe
@enduml`,
};

const pitfalls = [
  '**Short** **visibility** **timeouts** for **long** **handlers**.',
  '**Poison** messages **without** **DLQ** in **SQS**.',
  '**Standard** **SQS** **expecting** **strict** **ordering**.',
  '**Rabbit** **unbounded** **queues** **without** **TTL** policies.',
  '**Hot** **polling** **loops** on **empty** **queues**.',
  '**SNS** **HTTP** **subscribers** **without** **retry** **budgets**.',
  '**Ignoring** **FIFO** **throughput** **limits** in **design** reviews.',
  '**Assuming** **managed** **queues** give **Kafka-class** **replay**.',
];

const exerciseSolution = `package arch.day66;

public class Day66Exercise {
    public static void main(String[] args) {
        System.out.println("SQS: managed queue/task; Kafka: log streaming/replay");
    }
}
`;

const exercise = {
  titleSuffix: 'RabbitMQ & AWS messaging — selection (Day 66 assignment)',
  problem: 'Print **exactly**: SQS: managed queue/task; Kafka: log streaming/replay',
  hints: ['Matches d66q4 expectedOutput verbatim.'],
  solution: exerciseSolution,
  difficulty: 'Advanced',
};

const cheatsheet = `| Tech | Recall |
|---|---|
| SQS | Visibility timeout, DLQ |
| SNS | Pub/sub fan-out |
| FIFO | Order + dedupe limits |
| EventBridge | Rules + schemas |
| Rabbit | Exchanges + bindings |
| prefetch | Consumer fairness |
| DLX | Rabbit dead letters |
| long poll | SQS efficiency |
| Kinesis | Streaming alternative |
| Kafka | Replay log |`;

const drillSeeds = [
  { question: 'Code review: **standard** SQS for **payment** ordering globally.', signals: ['ordering', 'fifo', 'money'], core: { root: 'Standard SQS not for strict global ordering.', breaks: 'Race conditions in settlements.', fix: 'FIFO with dedupe keys or redesign with idempotent ledger.', angle: 'Map business requirement to service limits.', fq1q: 'Test?', fq1a: 'Concurrency chaos on duplicate deliveries.', fq2q: 'Cost?', fq2a: 'FIFO pricing vs custom shard topic.' } },
  { question: '**Incident:** **SNS** fan-out duplicates to partner **HTTP**.', signals: ['retry', 'http', 'idempotency'], core: { root: 'At-least-once fan-out + partner non-idempotent API.', breaks: 'Duplicate invoices.', fix: 'Idempotency keys on partner + dedupe store.', angle: 'Track messageId usage.', fq1q: 'Short term?', fq1a: 'Throttle replays while patching.', fq2q: 'Contract?', fq2a: 'SLA on retry backoff.' } },
  { question: '**Design:** **Rabbit** to **Kafka** bridge service.', signals: ['bridge', 'dual write'], core: { root: 'Need reliable translation with backpressure.', breaks: 'Bridge becomes bottleneck.', fix: 'Dedicated connector with monitoring; audit lag both sides.', fq1q: 'Ordering?', fq1a: 'Preserve per-entity keys into kafka.', fq2q: 'Failure?', fq2a: 'Poison queue on mapping errors.' } },
  { question: '**Trade-off:** **Lambda** vs **ECS** consumer for **10k** RPS SQS.', signals: ['scale', 'cost'], core: { root: 'Lambda cold starts vs always-on workers.', breaks: 'Latency variance or cost explosion.', fix: 'Provisioned concurrency or move to persistent consumers.', angle: 'Measure cost per million messages.', fq1q: 'VPC?', fq1a: 'ENI limits may bite.', fq2q: 'Observability?', fq2a: 'Per-queue age alarms.' } },
  { question: '**Gotcha:** **ChangeMessageVisibility** storm hides root slowness.', signals: ['visibility', 'heartbeat'], core: { root: 'Workers extend lease forever without fixing handler.', breaks: 'Lag grows unbounded ', fix: 'Fix handler + max extension policy.', angle: 'Metric on renew count.', fq1q: 'Alert?', fq1a: 'High renew rate anomaly.', fq2q: 'Architecture?', fq2a: 'Break work into smaller steps.' } },
  { question: '**Senior:** **Enterprise** message standards across **clouds**.', signals: ['governance', 'multi-cloud'], core: { root: 'Each team picks tech ad hoc.', breaks: 'No shared tracing or schema story.', fix: 'Reference architecture with decision tree.', fq1q: 'Metric?', fq1a: 'Time to integrate new partner feed.', fq2q: 'Security?', fq2a: 'Central private link + IAM boundaries.' } },
  { question: '**Security:** **Public** **SQS** queue URL leaked.', signals: ['acl', 'sqs'], core: { root: 'Overly permissive policy.', breaks: 'Data exfiltration.', fix: 'Lock to VPC endpoints + IAM condition keys.', angle: 'Pen test item.', fq1q: 'Detection?', fq1a: 'CloudTrail anomalous ReceiveMessage.', fq2q: 'Response?', fq2a: 'Rotate credentials + purge if needed.' } },
  { question: '**Scale:** **Rabbit** **single** node during peak.', signals: ['ha', 'rabbit'], core: { root: 'No quorum queues or clustered setup.', breaks: 'Broker loss = outage.', fix: 'HA deployment + observability on memory/disk.', fq1q: 'Cost?', fq1a: 'Compare to managed offering TCO.', fq2q: 'Migration?', fq2a: 'Blue broker with federation bridge.' } },
  { question: '**Misconception:** "**SQS** guarantees single delivery."', signals: ['at-least-once', 'sqs'], core: { root: 'At-least-once semantics require idempotent handlers.', breaks: 'Surprise duplicates after deploy.', fix: 'Business keys + metrics on dup rate.', angle: 'Educate product teams.', fq1q: 'FIFO nuance?', fq1a: 'Still need idempotent effects.', fq2q: 'Testing?', fq2a: 'Fault injection duplicate receives.' } },
  { question: '**Chaos:** **Region** down; **active-active** SNS subscriptions.', signals: ['dr', 'multi-region'], core: { root: 'Cross region fan-out misconfigured.', breaks: 'Silent loss of events to secondary.', fix: 'Health checks + failover routing documented.', fq1q: 'RTO?', fq1a: 'Align with business continuity plan.', fq2q: 'Data?', fq2a: 'Global dedupe store risks.' } },
];

export const drill66 = {
  day: 66,
  title: 'RabbitMQ & AWS Messaging',
  phaseId: 'phase7',
  tags: ['RabbitMQ', 'SQS', 'SNS', 'EventBridge', 'visibility', 'DLQ', 'Kafka'],
  scenarios: drillSeeds.map((s, i) => scenarioDrillItem(66, i + 1, s.question, s.signals, s.core)),
};

export default {
  day: 66,
  title: 'RabbitMQ & AWS Messaging',
  estimatedHours: 4,
  tags: ['Senior', 'Advanced', 'Phase 7', 'Interview Prep', 'Satyverse(Satyam Parmar)', 'AWS', 'Messaging'],
  prerequisites: ['Day 65', 'Day 64'],
  learningObjectives: [
    'Compare **Kafka**, **RabbitMQ**, **SQS**, and **SNS** on semantics, replay, and ops',
    'Operate **SQS** with **visibility timeouts**, **long polling**, and **DLQ** strategies',
    'Explain **fan-out** patterns with **SNS** and **EventBridge** filters',
    'Tune **RabbitMQ** **prefetch** and **dead-letter** routing for reliable task queues',
    'Choose **FIFO** vs **standard** queues with clear throughput and ordering trade-offs',
    'Design **cross-system** bridges without losing ordering or amplifying duplicates',
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
