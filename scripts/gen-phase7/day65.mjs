import { conceptualItem, codeBasedItem, seniorItem, scenarioDrillItem } from '../gen-phase6/lib.mjs';

const T = 'Spring Kafka';

const conceptual = [
  conceptualItem('What is **KafkaTemplate**?', 'Spring **producer** facade with **transaction** support and **callbacks** for **send** results.', T),
  conceptualItem('**@KafkaListener** basics?', 'Annotated **listener** method invoked with **ConsumerRecord** or payload types; integrates with **container** factories.', T),
  conceptualItem('**Acknowledgment** manual commit?', 'Call **acknowledge** after successful processing for **at-least-once** control.', T),
  conceptualItem('**ConcurrentKafkaListenerContainerFactory**?', 'Configures **concurrency**, **error** handlers, **deserializer** adapters.', T),
  conceptualItem('**DefaultErrorHandler** / **SeekToCurrentErrorHandler**?', 'Policies for **retries** and **seek** behavior on failures with backoff and **DLT** support.', T),
  conceptualItem('**KafkaTransactionManager** role?', 'Binds **DB** and **Kafka** transactions when using **chained** transaction managers carefully.', T),
  conceptualItem('**@RetryableTopic** pattern?', 'Declarative **retry** topics + **DLT** wiring with Spring Kafka support.', T),
  conceptualItem('**Listener** **container** **idle** events?', 'Hooks for **health** signals and **lag** based scaling integrations.', T),
  conceptualItem('**ConsumerFactory** immutable props?', 'Shared **configs** for **deserializers** and **security** settings.', T),
  conceptualItem('**ProducerFactory** bean?', 'Supplies **KafkaProducer** instances with Spring lifecycle management.', T),
  conceptualItem('Why tune **concurrency** vs partitions?', 'Threads should relate to **partition** **throughput** goals—too many waste resources.', T),
  conceptualItem('**ErrorHandlingDeserializer**?', 'Wrapper that routes **bad** records to handler instead of **fatal** consumer loop.', T),
  conceptualItem('**RecordFilterStrategy**?', 'Skip messages without committing offsets if policy matches—use carefully.', T),
  conceptualItem('**Batch** listener mode?', 'Receive **List** of records per poll for micro-batching but watch **timeout** **budgets**.', T),
  conceptualItem('**Observation** / **Micrometer** integration?', 'Metrics and **tracing** hooks for Spring Kafka 3+ observability stack.', T),
];

const codeBased = [
  codeBasedItem('@KafkaListener topics attribute.', '// @KafkaListener(topics = "orders", groupId = "g1")'),
  codeBasedItem('Manual ack method signature.', '// void onMsg(String v, Acknowledgment ack)'),
  codeBasedItem('KafkaTemplate send with ListenableFuture (concept).', '// template.send(topic, key, value).completable()'),
  codeBasedItem('Concurrent factory setConcurrency.', '// factory.setConcurrency(3);'),
  codeBasedItem('DeadLetterPublishingRecoverer mention.', '// publishes failed record to DLT'),
  codeBasedItem('CommonErrorHandler backoff.', '// exponentialBackOff with maxAttempts'),
  codeBasedItem('@EnableKafka presence.', '// enables listener annotation processing'),
  codeBasedItem('JsonDeserializer trusted packages.', '// spring.json.trusted.packages'),
  codeBasedItem('NewTopic bean for admin.', '// KafkaAdmin creates topic if permitted'),
  codeBasedItem('Container stopping on context shutdown.', '// registerShutdownHook'),
];

const seniorScenario = [
  seniorItem('**Incident:** Listener **threads** exhausted.', 'Thread dump.', 'Blocking calls in **@KafkaListener**.', 'Offload or increase pool carefully.', 'Lint blocking calls.'),
  seniorItem('**Bug:** **Ack** before DB **commit**.', 'Duplication/loss confusion.', 'Wrong ordering.', 'Transaction sync boundaries.', 'Tests.'),
  seniorItem('**Ops:** **Deserialization** exception infinite loop.', 'Poison payload.', 'No DLT path.', 'Error handler + DLT.', 'Schema CI.'),
  seniorItem('**Design:** **Reactive** vs **blocking** listeners.', 'Team skill mix.', 'Complexity.', 'KafkaListener default; reactive for pipeline backpressure.', 'ADR.'),
  seniorItem('**Scale:** **Over** **sharding** concurrency vs partitions.', 'Idle threads.', 'Misunderstanding parallelism.', 'Right-size concurrency.', 'Dashboard.'),
  seniorItem('**Security:** **SASL** props in **application.yml** committed.', 'Leak.', 'Repo history.', 'Vault + externalized config.', 'Rotation.'),
];

const wrongAnswers = [
  '**Spring** hides all **Kafka** tuning — **Correction:** Still need **consumer** **science**.',
  '**@KafkaListener** always transactional — **Correction:** **Must** configure explicitly.',
  '**More** concurrency always increases throughput — **Correction:** **Partition** bound.',
  '**Catch** Exception swallow ok — **Correction:** **Hides** poison messages.',
  '**KafkaTemplate** is thread-unsafe — **Correction:** **Producer** shared safely.',
  '**Manual** ack not needed with Spring — **Correction:** Often required for DB pairing.',
  '**Default** deserializer trusts all classes — **Correction:** **Security** configs required.',
  '**Spring** manages topic creation always — **Correction:** Needs **KafkaAdmin** + ACLs.',
];

const why = `**Spring Kafka** is the **on-ramp** most **Java** shops use for **Kafka**. Interviewers expect you to connect **listeners**, **error handlers**, and **concurrency** to the **same** **metrics** you would discuss with raw clients.\n\nFocus on **ack** ordering with **database** transactions and **DLT** hygiene—those separate senior answers from demos.`;

const theory = `### Day 65 — **Spring** **Kafka**\n\n### 1. Producer side\n**KafkaTemplate**, **transactions**, **send** callbacks.\n\n### 2. Consumer side\n**@KafkaListener**, **batch** vs **record**, **manual** ack.\n\n### 3. Error handling\n**DefaultErrorHandler**, **retry** topics, **DLT** publishing.\n\n### 4. Concurrency\nContainer **threads** vs **partitions**.\n\n### 5. Observability\n**Micrometer** metrics and **tracing**.\n\n### 6. Story\nManual **ack** before DB commit causes **loss**; reorder with **transactional** listener or **outbox**.`;

const basic = {
  title: 'Basic — Spring Kafka vocabulary',
  filename: 'Day65Basic.java',
  description: 'Listener vs template headline.',
  code: `package arch.day65;

public class Day65Basic {
    public static void main(String[] args) {
        System.out.println("@KafkaListener: managed consumer callback entrypoint");
        System.out.println("KafkaTemplate: producer facade for send()");
        System.out.println("Acknowledgment: manual commit hook");
    }
}
`,
  output: `@KafkaListener: managed consumer callback entrypoint
KafkaTemplate: producer facade for send()
Acknowledgment: manual commit hook
`,
};

const intermediate = {
  title: 'Intermediate — Concurrency vs partitions',
  filename: 'Day65Intermediate.java',
  description: 'Print reminder string from assignment.',
  code: `package arch.day65;

public class Day65Intermediate {
    public static void main(String[] args) {
        System.out.println("concurrency should relate to partitions, not infinite threads");
    }
}
`,
  output: `concurrency should relate to partitions, not infinite threads
`,
};

const advanced = {
  title: 'Advanced — Error handler pseudo-flow',
  filename: 'Day65Advanced.java',
  description: 'Toy retry attempts counter.',
  code: `package arch.day65;

public class Day65Advanced {
    public static void main(String[] args) {
        int attempts = 0;
        int max = 4;
        while (attempts < max) {
            attempts++;
            if (attempts == 3) break;
        }
        System.out.println("stoppedAfterAttempts=" + attempts);
    }
}
`,
  output: `stoppedAfterAttempts=3
`,
};

const diagram = {
  title: 'Spring Kafka listener container',
  description: 'Factory creates concurrent message listeners with error handler chain.',
  plantuml: `@startuml
title Day 65 — Spring Kafka
participant Container
participant Listener
queue Kafka
Kafka -> Container : poll
Container -> Listener : invoke @KafkaListener
Listener -> Container : ack or error handler
@enduml`,
};

const pitfalls = [
  '**Blocking** **remote** **calls** directly in **listener** **method**.',
  '**Acknowledgment** **before** **successful** **DB** **commit**.',
  '**No** **DLT** for **deserialization** **failures**.',
  '**Concurrency** **far** **above** **partition** **count** without **reason**.',
  '**Swallowed** **exceptions** **in** **listener**.',
  '**Trusted** **packages** **too** **broad** for **JSON**.',
  '**Missing** **observability** **on** **listener** **errors**.',
  '**Outdated** **Spring** **Kafka** **without** **modern** **error** **handler** APIs.',
];

const exerciseSolution = `package arch.day65;

public class Day65Exercise {
    public static void main(String[] args) {
        System.out.println("concurrency should relate to partitions, not infinite threads");
    }
}
`;

const exercise = {
  titleSuffix: 'Spring Kafka — concurrency literacy (Day 65 assignment)',
  problem: 'Print **exactly**: concurrency should relate to partitions, not infinite threads',
  hints: ['Matches d65q4 expectedOutput verbatim.'],
  solution: exerciseSolution,
  difficulty: 'Advanced',
};

const cheatsheet = `| Bean | Recall |
|---|---|
| KafkaTemplate | Producer send |
| ListenerContainerFactory | Concurrency + errors |
| Acknowledgment | Manual commit |
| ErrorHandler | Retry + DLT |
| KafkaTransactionManager | Tx boundaries |
| JsonDeserializer | trusted.packages |
| Batch listener | List consumer records |
| observationRegistry | metrics traces |
| KafkaAdmin | Topic creation |
| RetryableTopic | Retry + DLT wiring |`;

const drillSeeds = [
  { question: 'Code review: **@KafkaListener** method **restTemplate.exchange** **blocking** **5s** each.', signals: ['blocking', 'pool', 'poll'], core: { root: 'Handler exceeds poll budget risk.', breaks: 'Rebalance storm or lag.', fix: 'Async handoff with bounded queue or WebClient with timeouts isolated.', angle: 'Profile listener thread utilization.', fq1q: 'Metric?', fq1a: 'Consumer poll idle ratio + rebalance rate.', fq2q: 'Alternative?', fq2a: 'Partition-level queue with pause/resume.' } },
  { question: '**Incident:** **DLT** fills but **no** **alerts**.', signals: ['dlt', 'oncall'], core: { root: 'Monitoring gap on error topics.', breaks: 'Silent business loss.', fix: 'Lag + rate alerts on DLT + runbook.', angle: 'SLO on poison handling.', fq1q: 'Who?', fq1a: 'Owning service team not platform only.', fq2q: 'Dashboard?', fq2a: 'Top offending exception class histogram.' } },
  { question: '**Design:** **Transactional** listener with slow DB.', signals: ['transactional', 'timeout', 'kafka'], core: { root: 'Producer blocked on txn coordinator.', breaks: 'End-to-end stall.', fix: 'Shorten work in txn; outbox pattern for long IO.', angle: 'Draw txn timeline.', fq1q: 'Config?', fq1a: 'transaction.timeout.ms alignment.', fq2q: 'Testing?', fq2a: 'Chaos inject DB latency in staging.' } },
  { question: '**Trade-off:** **RetryableTopic** vs **manual** retry **queue**.', signals: ['complexity', 'visibility'], core: { root: 'RetryableTopic fast to adopt; manual flexible.', breaks: 'Wrong choice for cross-region ordering needs.', fix: 'Pick based on UX for replay tooling.', fq1q: 'Observability?', fq1a: 'Retry topic lag metrics.', fq2q: 'Security?', fq2a: 'ACLs on retry/dlt topics.' } },
  { question: '**Gotcha:** **record** filter returning **false** always.', signals: ['filter', 'lag'], core: { root: 'Skips commits incorrectly.', breaks: 'Infinite reread.', fix: 'Use filter only with clear semantics; tests.', angle: 'Document offset behavior.', fq1q: 'Alternative?', fq1a: 'Predicate in business service with DLQ.', fq2q: 'Test?', fq2a: 'Unit test filter decisions per payload type.' } },
  { question: '**Senior:** Golden **Spring** **Kafka** starter across **org**.', signals: ['platform', 'standards'], core: { root: 'Teams diverge on error handling defaults.', breaks: 'Uncomparable incidents.', fix: 'Opinionated starter with allowed overrides registry.', fq1q: 'Enforcement?', fq1a: 'Arch review lint fails CI.', fq2q: 'Migration?', fq2a: 'Strangler upgrade path per service.' } },
  { question: '**Security:** **Jaas** config in **source** tree.', signals: ['secrets', 'sasl'], core: { root: 'Long lived keys in git.', breaks: 'Cluster compromise.', fix: 'Vault + workload identity.', angle: 'Audit quarterly.', fq1q: 'Detect?', fq1a: 'Secret scanning pre-commit.', fq2q: 'Response?', fq2a: 'Key rotation within hours.' } },
  { question: '**Scale:** **K8s** **HPA** on **CPU** only for Kafka consumers.', signals: ['hpa', 'lag'], core: { root: 'CPU low while lag huge during IO wait.', breaks: 'No scale out when needed.', fix: 'Custom metrics adapter on lag.', angle: 'SRE+platform collab.', fq1q: 'Cost?', fq1a: 'Avoid thrashing with cooldown windows.', fq2q: 'Alternative?', fq2a: 'Partition rebalance automation.' } },
  { question: '**Misconception:** "**Spring** handles **EOS** to **Postgres** automatically."', signals: ['eos', 'spring'], core: { root: 'Still need business idempotency and txn design.', breaks: 'Silent money bugs.', fix: 'Outbox or idempotent upserts.', angle: 'Whiteboard boundaries.', fq1q: 'Pattern?', fq1a: 'Transactional outbox publisher.', fq2q: 'Failure?', fq2a: 'Partial write without compensating action.' } },
  { question: '**Chaos:** **Broker** cert rotated; listeners die.', signals: ['tls', 'auth'], core: { root: 'Truststore not hot reloaded.', breaks: 'Total consume stop.', fix: 'Rolling pods after trust update or dynamic ssl config if supported.', angle: 'Game day with security team.', fq1q: 'Metric?', fq1a: 'SSL handshake failure rate spike.', fq2q: 'Prevention?', fq2a: 'Automated cert expiry alerts 30d ahead.' } },
];

export const drill65 = {
  day: 65,
  title: 'Spring Kafka',
  phaseId: 'phase7',
  tags: ['Spring', 'KafkaListener', 'KafkaTemplate', 'error handler', 'DLT', 'concurrency'],
  scenarios: drillSeeds.map((s, i) => scenarioDrillItem(65, i + 1, s.question, s.signals, s.core)),
};

export default {
  day: 65,
  title: 'Spring Kafka',
  estimatedHours: 4,
  tags: ['Senior', 'Advanced', 'Phase 7', 'Interview Prep', 'Satyverse(Satyam Parmar)', 'Spring', 'Kafka'],
  prerequisites: ['Day 64', 'Day 63'],
  learningObjectives: [
    'Configure **@KafkaListener** with **manual** acknowledgements and batch modes',
    'Apply **error handlers**, **retry** topics, and **DLT** publishing patterns',
    'Tune **concurrency** and container properties against **partition** counts',
    'Use **KafkaTemplate** safely with transactions and asynchronous send handling',
    'Integrate **Spring** observability for Kafka clients in production dashboards',
    'Align **Spring** transactional listeners with database consistency strategies',
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
