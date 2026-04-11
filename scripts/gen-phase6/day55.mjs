import { conceptualItem, codeBasedItem, seniorItem, scenarioDrillItem } from './lib.mjs';

const T = 'inter-service communication';

const conceptual = [
  conceptualItem('What is **sync** **request/response** **chaining** between services?', '**Sync** chains **block** the **caller** until **downstream** **finishes**, multiplying **latency** **variance** and **failure** **probability** along the **path**.', T),
  conceptualItem('What is **async** **choreography** with **events**?', 'Services **publish** **facts** to a **broker**; **consumers** **react** **without** **central** **orchestrator**. **Ordering** and **idempotency** **requirements** **dominate** **design**.', T),
  conceptualItem('When pick **orchestrated** **Saga** vs **choreography**?', '**Orchestration** gives **clear** **central** **state** **machine**; **choreography** **scales** **ownership** but **debugging** **cross-service** **flows** is **harder**.', T),
  conceptualItem('What is **outbox** **pattern**?', 'Write **business** **data** and **outbox** **event** **row** in **one** **DB** **transaction**, then **relay** **to** **broker** **reliably**.', T),
  conceptualItem('How does **message** **broker** **choice** affect **patterns**?', '**Kafka** **log** **semantics** differ from **Rabbit** **queues**—**ordering**, **replay**, and **consumer** **groups** **change** **design**.', T),
  conceptualItem('What is **temporal** **coupling**?', 'Services **must** **be** **up** **together** for **sync** **flow** **to** **complete**—**async** **decouples** **availability** **windows**.', T),
  conceptualItem('Explain **event** **envelope** **basics**.', 'Include **event** **id**, **type**, **schema** **version**, **timestamp**, **correlation** **id**, and **payload** **hash** **for** **dedup**.', T),
  conceptualItem('What is **idempotent** **consumer**?', 'Processing **same** **event** **twice** **must** **not** **double** **apply** **effects**—use **natural** **keys** or **store** **processed** **ids**.', T),
  conceptualItem('How do **timeouts** differ in **async** **world**?', '**Consumers** **still** **need** **processing** **deadlines**; **DLQ** **policies** **handle** **poison** **messages**.', T),
  conceptualItem('What is **BFF** role in **communication** **topology**?', '**BFF** **aggregates** **sync** **calls** **for** **UI**, **hiding** **chattiness** **from** **mobile** **clients**.', T),
  conceptualItem('What is **dead** **letter** **queue** **for**?', '**Isolate** **messages** **that** **fail** **after** **retries** for **manual** **replay** or **bug** **fixes**.', T),
  conceptualItem('Compare **at-least-once** vs **exactly-once** **processing**.', '**At-least-once** **needs** **idempotency**; **exactly-once** **is** **expensive** and **often** **approximated** **with** **transactions** **+** **offsets**.', T),
  conceptualItem('What is **API** **composition** **vs** **event** **composition**?', '**API** **composition** **happens** **in** **process** **request** **path**; **event** **composition** **materializes** **read** **models** **over** **time**.', T),
  conceptualItem('How does **backpressure** appear in **Kafka** **consumers**?', '**Poll** **loop** **pause**/**resume** or **reduce** **max.poll.records** so **downstream** **keeps** **up**.', T),
  conceptualItem('What **smell** indicates **sync** **overuse**?', '**Deep** **call** **graphs** **with** **identical** **timeout** **budget** **spent** **multiple** **times** **per** **user** **click**.', T),
];

const codeBased = [
  codeBasedItem('Spring **`@KafkaListener`** sketch', '// @KafkaListener(topics = "orders", groupId = "payments")\n// void onMessage(String payload, @Header(KafkaHeaders.RECEIVED_KEY) String key)'),
  codeBasedItem('**RabbitTemplate** send', '// rabbitTemplate.convertAndSend("orders.exchange", "order.placed", event);'),
  codeBasedItem('**Transactional** **outbox** **entity** fields', '// UUID id; String aggregateId; String type; String payload; Instant created; boolean published;'),
  codeBasedItem('**WebClient** **chain** **flatMap** (reactive)', '// a.then(b).then(c) // still couples latency—prefer events for side paths'),
  codeBasedItem('**Saga** **orchestrator** pseudo-interface', '// void onInventoryReserved(); void onPaymentFailedCompensate();'),
  codeBasedItem('**CloudEvents** **type** attribute', '// ce-type: com.example.order.placed.v1'),
  codeBasedItem('**Kafka** **consumer** **idempotent** **store**', '// INSERT processed_event_id ... ON CONFLICT DO NOTHING'),
  codeBasedItem('**RestTemplate** **callback** **URL** anti-pattern note', '// Callbacks tie services—prefer events or polling contracts'),
  codeBasedItem('**SQS** **visibility** **timeout** comment', '// Must exceed max processing time or duplicate delivery risk'),
  codeBasedItem('**Partition** **key** choice', '// Use orderId so related events stay ordered per aggregate'),
];

const seniorScenario = [
  seniorItem('**Incident:** **Kafka** **consumer** **lag** **hours** after **deploy**.', 'Pause **traffic** **canary**; **scale** **consumers**.', '**Slow** **DB** **migration** **or** **poison** **batch**.', '**Fix** **query**; **skip** **bad** **offsets** **to** **DLQ**; **replay**.', '**SLO** on **lag** **with** **burn** **alerts**.'),
  seniorItem('**Design:** **Checkout** **must** **reserve** **inventory** **and** **charge** **card**.', 'Compare **sync** **REST** **chain** vs **Saga**.', '**Tight** **coupling** **risk** **vs** **complex** **compensation**.', 'Use **outbox** **events** **+** **orchestrator** **or** **choreography** **with** **clear** **state** **table**.', '**E2E** **tests** **for** **failure** **injections**.'),
  seniorItem('**Migration:** **RPC** **storm** **between** **fifty** **services**.', 'Introduce **event** **bus** **golden** **path**.', '**Mesh** **traffic** **cost** **and** **retry** **storms**.', '**Strangler** **per** **domain**; **publish** **domain** **events**.', '**Dashboards** **per** **topic** **throughput**.'),
  seniorItem('**Bug:** **Duplicate** **shipments** from **at-least-once** **Kafka**.', 'Stop **consumer** **group**; **audit** **ids**.', '**Missing** **idempotent** **consumer** **guard**.', 'Add **unique** **constraint** **on** **shipment** **key**.', '**Replay** **tests** **with** **duplicate** **delivery**.'),
  seniorItem('**Ops:** **DLQ** **depth** **growing** **silently**.', 'Page **on-call**; **dashboard** **red**.', '**Alert** **missing** **on** **DLQ** **age**.', 'Add **SLO** **on** **oldest** **message** **age**.', '**Weekly** **DLQ** **triage** **ritual**.'),
  seniorItem('**Security:** **event** **payload** **contains** **PII** **cleartext**.', '**Encrypt** **fields**; **rotate** **keys**.', '**Broker** **compromise** **exposes** **data**.', '**Field-level** **encryption** **+** **topic** **ACLs**.', '**Data** **classification** **tags** **on** **schemas**.'),
];

const wrongAnswers = [
  '**Async** **means** **no** **timeouts** **needed** — **Correction:** **Consumers** **still** **bound** **work**.',
  '**Kafka** **guarantees** **exactly-once** **everywhere** — **Correction:** **End-to-end** **needs** **app** **design**.',
  '**Outbox** **replaces** **need** for **idempotent** **consumers** — **Correction:** **Relay** **can** **duplicate** **delivery**.',
  '**Choreography** **always** **simpler** than **orchestration** — **Correction:** **Debugging** **cost** **often** **higher**.',
  '**BFF** **should** **call** **twenty** **microservices** **sync** **per** **request** — **Correction:** **Aggregate** **or** **cache** **or** **event** **projections**.',
  '**Events** **never** **need** **versioning** — **Correction:** **Schema** **registry** **and** **compat** **rules** **apply**.',
  '**Sync** **is** **always** **wrong** — **Correction:** **Simple** **reads** **often** **fine** **with** **timeouts**.',
  '**DLQ** **messages** **safe** **to** **delete** **when** **queue** **shrinks** — **Correction:** **Root** **cause** **analysis** **first**.',
];

const why = `**Inter-service** **communication** **patterns** decide whether your **system** **fails** **gracefully** or **cascades** **into** **company-wide** **outages**. **Sync** **chains** **feel** **simple** until **latency** **variance** **eats** **SLOs**; **async** **events** **decouple** **availability** but **demand** **rigorous** **idempotency** and **observability**.\n\nInterviewers probe whether you **understand** **trade-offs**, not whether you **memorized** **Kafka** **APIs**.\n\nThis day ties **Day** **53** **clients** to **broader** **topologies**: **outbox**, **Saga**, **choreography**, **DLQ**, **backpressure**.\n\nStrong candidates **name** **failure** **modes** **like** **duplicate** **delivery** and **poison** **pill** **messages** with **concrete** **mitigations**.\n\nFinally, **platform** **thinking** matters—**golden** **paths** for **event** **schemas** and **consumer** **templates** beat **per-team** **snowflakes**.`;

const theory = `### Day 55 — **Inter-service** **communication** **patterns**\n\n### 1. **Sync** **HTTP**\n**Pros:** **simple** **mental** **model**. **Cons:** **temporal** **coupling**, **retry** **amplification**.\n\n### 2. **Messaging**\n**Topics**, **queues**, **consumer** **groups**, **ordering** **keys**.\n\n### 3. **Outbox**\n**Atomic** **DB** **+** **event** **emission**.\n\n### 4. **Idempotency**\n**Natural** **keys**, **dedup** **store**, **version** **columns**.\n\n### 5. **Saga** **vs** **choreography**\n**Orchestrator** **visibility** **vs** **distributed** **logic**.\n\n### 6. **Backpressure**\n**Pause** **consumption** when **downstream** **saturated**.\n\n### 7. **DLQ**\n**Operational** **safety** **valve**.\n\n### 8. **Story**\n**Sync** **checkout** **chain** **timeouts** → **outbox** **OrderPlaced** + **projections** **stabilized** **p99**.`;

const basic = {
  title: 'Basic — Sync vs async pattern table',
  filename: 'Day55Basic.java',
  description: 'When sync HTTP fits vs when events win.',
  code: `package arch.day55;

public class Day55Basic {
    public static void main(String[] args) {
        System.out.println("=== Sync HTTP request chain ===");
        System.out.println("Pros: simple to reason, great for read-after-write consistency");
        System.out.println("Cons: multiplies latency; failure anywhere fails the user request");
        System.out.println();
        System.out.println("=== Async event choreography ===");
        System.out.println("Pros: decouples availability; absorbs bursts with broker buffering");
        System.out.println("Cons: eventual consistency; needs idempotent consumers + schema discipline");
        System.out.println();
        System.out.println("=== Hybrid rule of thumb ===");
        System.out.println("User-facing critical path: short sync + outbox for side effects");
        System.out.println("Cross-domain notifications: durable events with outbox or log");
    }
}
`,
  output: `=== Sync HTTP request chain ===
Pros: simple to reason, great for read-after-write consistency
Cons: multiplies latency; failure anywhere fails the user request

=== Async event choreography ===
Pros: decouples availability; absorbs bursts with broker buffering
Cons: eventual consistency; needs idempotent consumers + schema discipline

=== Hybrid rule of thumb ===
User-facing critical path: short sync + outbox for side effects
Cross-domain notifications: durable events with outbox or log
`,
};

const intermediate = {
  title: 'Intermediate — Choreography steps (deterministic log)',
  filename: 'Day55Intermediate.java',
  description: 'Prints ordered event steps for order placed flow.',
  code: `package arch.day55;

import java.util.*;

public class Day55Intermediate {

    public static void main(String[] args) {
        List<String> log = new ArrayList<>();
        log.add("OrderService: persist order row + outbox OrderPlaced");
        log.add("OutboxRelay: publish OrderPlaced to broker");
        log.add("InventoryConsumer: reserve stock idempotently");
        log.add("PaymentConsumer: attempt charge idempotently");
        log.add("ShippingConsumer: create shipment when both succeed");
        System.out.println("=== Choreography timeline (happy path) ===");
        for (String line : log) {
            System.out.println(line);
        }
    }
}
`,
  output: `=== Choreography timeline (happy path) ===
OrderService: persist order row + outbox OrderPlaced
OutboxRelay: publish OrderPlaced to broker
InventoryConsumer: reserve stock idempotently
PaymentConsumer: attempt charge idempotently
ShippingConsumer: create shipment when both succeed
`,
};

const advanced = {
  title: 'Advanced — Sync chain vs async scorecard',
  filename: 'Day55Advanced.java',
  description: 'Weighted score for two integration styles on a toy workload.',
  code: `package arch.day55;

public class Day55Advanced {

    static int scoreSync(int hops, int blast) {
        return hops * 4 + blast * 3;
    }

    static int scoreAsync(int schemaCost, int opsMaturity) {
        return schemaCost * 2 + (10 - opsMaturity) * 5;
    }

    public static void main(String[] args) {
        System.out.println("=== Pattern scorecard (lower is better for that column intent) ===");
        int s = scoreSync(4, 3);
        int a = scoreAsync(3, 7);
        System.out.println("syncChainScore=" + s + " asyncEventScore=" + a);
        System.out.println(s < a ? "Pick: tighten sync chain (fewer hops)" : "Pick: invest in async + ops maturity");
    }
}
`,
  output: `=== Pattern scorecard (lower is better for that column intent) ===
syncChainScore=25 asyncEventScore=21
Pick: invest in async + ops maturity
`,
};

const diagram = {
  title: 'Outbox to broker to consumers',
  description: 'Order service writes DB+outbox; relay publishes; consumers process idempotently.',
  plantuml: `@startuml
title Day 55 — Reliable async emission
database MonolithDB
participant OrderSvc
participant OutboxRelay
queue Broker
participant Inventory

OrderSvc -> MonolithDB : TX: insert order + outbox row
OutboxRelay -> MonolithDB : poll unpublished rows
OutboxRelay -> Broker : publish OrderPlaced
Inventory -> Broker : consume + idempotent reserve
@enduml`,
};

const pitfalls = [
  '**Publishing** **to** **Kafka** **before** **DB** **commit** **succeeds**, causing **ghost** **events** **consumers** **cannot** **reconcile**.',
  '**Consumers** **without** **idempotency** **under** **at-least-once** **delivery**, **duplicating** **financial** **side** **effects**.',
  '**Unbounded** **sync** **chains** **(A→B→C→D)** **for** **user** **clicks**, **making** **p99** **a** **sum** **of** **worst** **case** **latencies**.',
  '**Ignoring** **DLQ** **depth** **alerts** until **disk** **fills** and **broker** **stops** **accepting** **writes**.',
  '**Using** **events** **as** **hidden** **RPC** **with** **request** **reply** **topics** **without** **timeouts**, **creating** **distributed** **deadlocks**.',
  '**Skipping** **schema** **versioning** **on** **event** **payloads**, **breaking** **old** **consumers** **silently**.',
  '**One** **giant** **event** **with** **50** **fields** **coupling** **every** **consumer** **to** **every** **column** **change**.',
  '**No** **correlation** **ids** **across** **async** **steps**, **making** **incident** **debugging** **impossible** **in** **logs**.',
];

const exerciseSolution = `package arch.day55;

import java.util.*;

/**
 * Day 55 assignment: sync vs async choreography design (toy planner).
 */
public class Day55Exercise {

    static List<String> planCheckout(boolean useAsync) {
        List<String> steps = new ArrayList<>();
        if (!useAsync) {
            steps.add("SYNC: POST /inventory/reserve");
            steps.add("SYNC: POST /payments/charge");
            steps.add("SYNC: POST /shipping/create");
        } else {
            steps.add("SYNC: POST /orders (persist + outbox)");
            steps.add("ASYNC: OrderPlaced -> inventory reserve");
            steps.add("ASYNC: InventoryReserved -> payment charge");
            steps.add("ASYNC: PaymentCaptured -> shipping create");
        }
        return steps;
    }

    public static void main(String[] args) {
        System.out.println("=== Assignment: sync vs async choreography ===\\n");
        System.out.println("--- Sync design ---");
        for (String s : planCheckout(false)) {
            System.out.println(s);
        }
        System.out.println();
        System.out.println("--- Async choreography ---");
        for (String s : planCheckout(true)) {
            System.out.println(s);
        }
    }
}
`;

const exercise = {
  titleSuffix: 'Sync vs async choreography design (Day 55 assignment)',
  problem:
    'Align with **Day 55 Assignment**: **Sync vs async choreography design**.\n\n1. Implement **`planCheckout(boolean useAsync)`** returning a **list** of **step** **strings**.\n2. When **`useAsync` is `false`**, return **exactly** **three** lines starting with **`SYNC:`** as in the **reference** **output**.\n3. When **`useAsync` is `true`**, return **exactly** **four** lines: one **`SYNC:`** for **order** **persistence** **+** **outbox**, then **three** **`ASYNC:`** lines **exactly** as shown.\n4. **`main()`** prints **both** **plans** with **headers** **matching** the **model** **output**.',
  hints: [
    'Use **`ArrayList`** and **`add`** in **order**.',
    'Keep **string** **prefixes** **`SYNC:`** / **`ASYNC:`** **exact** for **diff** **checks**.',
    'Do **not** **read** **environment** **or** **clock** for **branching**.',
  ],
  solution: exerciseSolution,
  difficulty: 'Advanced',
};

const cheatsheet = `| Pattern | Rule | One-liner |
|---|---|---|
| Sync chain | Minimize hops | p99 sums latencies |
| Outbox | Same TX as write | Reliable publish |
| Idempotent consumer | Dedup keys | Survives redelivery |
| Choreography | Many listeners | Needs trace IDs |
| Orchestration | Central state | Easier dashboards |
| DLQ | Alert on age | Ops safety valve |
| Kafka ordering | Partition key | Per-aggregate order |
| Backpressure | Pause poll | Protect downstream |
| BFF | Aggregate reads | Hides chattiness |
| Schema | Version events | Registry in CI |`;

const drillSeeds = [
  { question: 'Code review: **service** **publishes** **OrderPlaced** **before** **DB** **commit**.', signals: ['ghost', 'outbox', 'atomicity', 'race'], core: { root: '**Non-atomic** **publish** **with** **write**.', breaks: '**Consumers** **act** on **non-existent** **orders**.', fix: '**Transactional** **outbox** **pattern**.', angle: 'Mention **two-phase** **commit** **alternatives** **rare** **in** **microservices**.', fq1q: 'Test?', fq1a: '**Integration** **test** **kill** **broker** **mid-TX**.', fq2q: 'Metric?', fq2a: '**Outbox** **lag** **histogram**.' } },
  { question: '**Incident:** **duplicate** **charges** after **Kafka** **rebalance**.', signals: ['at-least-once', 'idempotent', 'consumer', 'offset'], core: { root: '**Consumer** **reprocessed** **offsets**.', breaks: '**Financial** **integrity** **broken**.', fix: '**Idempotency** **key** **table** **with** **unique** **constraint**.', angle: 'Explain **offset** **commit** **strategies**.', fq1q: 'Prevention?', fq1a: '**Chaos** **rebalance** **during** **load** **tests**.', fq2q: 'Communication?', fq2a: '**Finance** **must** **approve** **replay** **policy**.' } },
  { question: '**Design:** **real-time** **dashboard** **needs** **fresh** **order** **counts**.', signals: ['CQRS', 'projection', 'cache', 'sync'], core: { root: '**Poll** **sync** **chain** **too** **slow**.', breaks: '**DB** **load** **from** **N** **services**.', fix: '**Materialized** **view** **via** **events**.', angle: 'Mention **WebSocket** **push** **from** **projection**.', fq1q: 'Consistency?', fq1a: '**Seconds** **lag** **acceptable** **per** **product**.', fq2q: 'Fallback?', fq2a: '**Stale** **banner** **if** **projection** **lag** **high**.' } },
  { question: 'Explain **consumer** **group** **rebalance** **impact**.', signals: ['kafka', 'lag', 'stop', 'partition'], core: { root: '**Partitions** **reassigned** **pause** **processing**.', breaks: '**Temporary** **lag** **spike**.', fix: '**Sticky** **assignor**, **tune** **session** **timeout**.', angle: 'Cooperative vs eager rebalance.', fq1q: 'K8s **relation**?', fq1a: '**Rolling** **deploy** **triggers** **rebalance** **storms** **if** **too** **fast**.', fq2q: 'Mitigation?', fq1a: '**Min** **in-sync** **replicas** **and** **gradual** **rollout**.' } },
  { question: '**Trade-off:** **RabbitMQ** **queue** vs **Kafka** **topic** for **order** **events**.', signals: ['ordering', 'replay', 'ops', 'scale'], core: { root: '**Kafka** **log** **replay** **vs** **Rabbit** **competing** **consumers**.', breaks: '**Wrong** **tool** **increases** **cost**.', fix: 'Map **retention** **and** **ordering** **needs**.', angle: '**Managed** **service** **comparison**.', fq1q: 'When **Rabbit** **wins**?', fq1a: '**Complex** **routing** **per** **message** **with** **low** **volume**.', fq2q: 'When **Kafka** **wins**?', fq2a: '**High** **throughput** **event** **sourcing** **backbone**.' } },
  { question: '**Gotcha:** **BFF** **awaits** **fifteen** **Feign** **calls** **per** **page**.', signals: ['fanout', 'timeout', 'p99', 'BFF'], core: { root: '**Accidental** **mega** **sync** **graph**.', breaks: '**Page** **timeouts**.', fix: '**Aggregate** **API** **or** **projection** **read** **model**.', angle: '**GraphQL** **or** **backend** **for** **frontend** **patterns**.', fq1q: 'Metric?', fq1a: '**Waterfall** **span** **count** **per** **trace**.', fq2q: 'Long-term?', fq2a: '**Domain** **events** **feeding** **read** **store**.' } },
  { question: '**Senior:** **standardize** **async** **error** **envelope** **company-wide**.', signals: ['schema', 'platform', 'DLQ', 'version'], core: { root: '**Ad-hoc** **JSON** **blobs** **per** **team**.', breaks: '**No** **shared** **tooling** **for** **replay**.', fix: '**CloudEvents** **+** **registry** **+** **lint**.', angle: '**Golden** **library** **per** **language**.', fq1q: 'Rollout?', fq1a: '**Strangler** **new** **topics** **first**.', fq2q: 'Success?', fq2a: '**Mean** **time** **to** **replay** **drops**.' } },
  { question: '**Security:** **events** **carry** **full** **credit** **card** **PAN**.', signals: ['PCI', 'PII', 'encryption', 'topic'], core: { root: '**Broker** **compromise** **=** **breach**.', breaks: '**Compliance** **failure**.', fix: '**Tokenize** **card**; **encrypt** **fields**.', angle: '**Topic** **ACLs** **per** **environment**.', fq1q: 'Audit?', fq1a: '**Schema** **review** **blocks** **PAN** **fields**.', fq2q: 'Testing?', fq2a: '**Static** **scanner** **on** **producers**.' } },
  { question: '**Scale:** **single** **partition** **hot** **key** **orders** **topic**.', signals: ['hotspot', 'ordering', 'shard', 'kafka'], core: { root: '**One** **merchant** **dominates** **traffic**.', breaks: '**Partition** **bottleneck**.', fix: '**Sub-partition** **by** **store** **id** **or** **shed** **ordering** **requirement**.', angle: '**Accept** **unordered** **where** **safe**.', fq1q: 'Detection?', fq1a: '**Per-partition** **byte** **rate** **dashboard**.', fq2q: 'Trade-off?', fq2a: '**Global** **order** **impossible** **without** **sequential** **lane**.' } },
  { question: '**Misconception:** "**Messaging** **removes** **need** for **timeouts**."', signals: ['poison', 'processing', 'stall', 'DLQ'], core: { root: '**Consumers** **still** **hang** **on** **bad** **code**.', breaks: '**Lag** **grows** **unbounded**.', fix: '**Processing** **deadlines** **+** **virtual** **threads** **or** **watchdog**.', angle: '**max.poll.interval** **Kafka** **setting**.', fq1q: 'Alert?', fq1a: '**Consumer** **processing** **time** **p99**.', fq2q: 'Fix?', fq2a: '**Circuit** **break** **external** **calls** **inside** **consumer**.' } },
];

export const drill55 = {
  day: 55,
  title: 'Inter-Service Communication Patterns',
  phaseId: 'phase6',
  tags: ['Kafka', 'outbox', 'Saga', 'choreography', 'sync', 'async', 'DLQ', 'idempotency'],
  scenarios: drillSeeds.map((s, i) => scenarioDrillItem(55, i + 1, s.question, s.signals, s.core)),
};

export default {
  day: 55,
  title: 'Inter-Service Communication Patterns',
  tags: ['Mid-Level', 'Advanced', 'Phase 6', 'Interview Prep', 'Satyverse(Satyam Parmar)', 'Kafka', 'messaging'],
  prerequisites: ['Day 54', 'Day 53'],
  learningObjectives: [
    'Compare **synchronous** **HTTP** **chains** and **asynchronous** **event** **choreography** using **latency** and **failure** **amplification** **arguments**',
    'Explain the **transactional** **outbox** **pattern** and why **publish-before-commit** **fails**',
    'Design **idempotent** **consumers** for **at-least-once** **brokers** like **Kafka**',
    'Contrast **orchestrated** **Sagas** and **choreographed** **Sagas** with **debuggability** **trade-offs**',
    'Apply **backpressure** and **DLQ** **policies** to **poison** **messages** and **slow** **handlers**',
    'Choose **messaging** **vs** **RPC** using **ordering**, **replay**, and **operational** **maturity** **criteria**',
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
