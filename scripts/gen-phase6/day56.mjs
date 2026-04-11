import { conceptualItem, codeBasedItem, seniorItem, scenarioDrillItem } from './lib.mjs';

const T = 'Saga and distributed transactions';

const conceptual = [
  conceptualItem('What is a **Saga** **pattern**?', 'A **Saga** **splits** a **business** **transaction** into **local** **transactions** with **compensating** **actions** **instead** of **two-phase** **commit** **across** **databases**.', T),
  conceptualItem('**Choreography** **Saga** vs **orchestration** **Saga**?', '**Choreography** **uses** **events** **between** **services**; **orchestration** **uses** **central** **coordinator** **issuing** **commands**.', T),
  conceptualItem('What is a **compensating** **transaction**?', 'A **business** **operation** **that** **semantically** **undoes** **effects** **of** **a** **prior** **forward** **step**—not always **SQL** **ROLLBACK**.', T),
  conceptualItem('Why not **2PC** **everywhere**?', '**Two-phase** **commit** **locks** **resources** **long** **time**, **hurts** **availability**, **hard** **across** **heterogeneous** **systems**.', T),
  conceptualItem('What is **pivot** **transaction** in **Saga** **terms**?', 'The **step** **after** **which** **the** **workflow** **commits** **forward** **unless** **compensation** **runs**—defines **business** **commit** **point**.', T),
  conceptualItem('How handle **compensation** **failure**?', '**Retry** **with** **idempotency**, **manual** **intervention** **queue**, **audit** **trail** **for** **finance** **reconciliation**.', T),
  conceptualItem('What **idempotency** **means** for **compensate** **refund**?', 'Calling **refund** **twice** **must** **not** **double** **credit**—**provider** **keys** **help**.', T),
  conceptualItem('What is **Saga** **log** / **state** **table**?', '**Orchestrator** **persists** **current** **step** **and** **last** **completed** **actions** **for** **crash** **recovery**.', T),
  conceptualItem('How **timeouts** interact with **Saga**?', 'Each **step** **needs** **deadline**; **on** **timeout** **decide** **retry** **vs** **compensate** **based** **on** **known** **state**.', T),
  conceptualItem('What **event** **naming** **helps** **Sagas**?', 'Past-tense **facts** **like** **PaymentCaptured** **vs** **imperative** **ChargeCard** **commands**—clarity **for** **consumers**.', T),
  conceptualItem('What **anti-pattern** in **distributed** **transactions**?', '**Distributed** **database** **joins** **across** **services** **pretending** **ACID** **globally**.', T),
  conceptualItem('How **Saga** **relates** to **outbox**?', '**Outbox** **ensures** **events** **emit** **reliably** **after** **local** **commit**—**feeds** **Saga** **steps**.', T),
  conceptualItem('What **testing** **strategy** for **Sagas**?', '**State** **machine** **tests** **with** **injected** **failures** **per** **transition**.', T),
  conceptualItem('What **observability** for **Sagas**?', '**Correlation** **id** **per** **saga** **instance**, **metrics** **on** **stuck** **states** **> SLA**.', T),
  conceptualItem('What **business** **risk** **without** **Saga** **audit**?', '**Finance** **cannot** **reconcile** **partial** **shipments** **with** **failed** **payments**.', T),
];

const codeBased = [
  codeBasedItem('**State** **enum** for **orchestrator**', '// enum Step { RESERVED, PAID, SHIPPED, COMPENSATING }'),
  codeBasedItem('**Spring** **@Transactional** **local** **step**', '// void reserveInventory() { jdbc.update(...); }'),
  codeBasedItem('**Compensate** **method** **signature**', '// void releaseInventory(String reservationId);'),
  codeBasedItem('**Kafka** **command** **topic** pattern', '// saga.commands OrderSaga.CompensatePayment'),
  codeBasedItem('**Idempotent** **refund** **pseudo**', '// if (!refunds.exists(key)) provider.refund(key);'),
  codeBasedItem('**Temporal** **workflow** mention', '// Workflow.sleep + signals for long-running saga'),
  codeBasedItem('**Axon** **@SagaEventHandler** comment', '// reacts to domain events, persists association values'),
  codeBasedItem('**Database** **row** **lock** **for** **saga** **instance**', '// SELECT ... FOR UPDATE on saga_instance row'),
  codeBasedItem('**MapStruct** irrelevant—skip', '// compensation DTO mapping from legacy monolith'),
  codeBasedItem('**Dead** **letter** for **failed** **compensation**', '// publish CompensationFailed event to ops topic'),
];

const seniorScenario = [
  seniorItem('**Incident:** **inventory** **reserved** but **payment** **failed**—**shipment** **started**.', '**Stop** **fulfillment**; **freeze** **SKU**.', '**Missing** **gate** **between** **steps** **or** **race** **in** **choreography**.', '**Run** **compensating** **shipment** **cancel** **+** **inventory** **release** **with** **audit**.', '**Saga** **state** **table** **with** **explicit** **invariants**.'),
  seniorItem('**Design:** **hotel** **booking** **across** **three** **services**.', 'Pick **orchestrator** **with** **timeouts**.', '**Choreography** **hard** **for** **customer** **support** **to** **trace**.', '**Orchestrated** **Saga** **+** **support** **dashboard**.', '**E2E** **tests** **for** **each** **failure** **branch**.'),
  seniorItem('**Compensation** **fails** **with** **provider** **timeout**.', '**Retry** **exponential**; **open** **sev** **2**.', '**External** **API** **flaky** **during** **peak**.', '**Persist** **compensation** **job** **with** **next** **run** **time**.', '**Partner** **SLA** **playbook**.'),
  seniorItem('**Audit:** **finance** **needs** **proof** **of** **refund** **attempts**.', 'Export **immutable** **log**.', '**Saga** **logs** **in** **mutable** **tables** **only**.', '**Append-only** **event** **store** **for** **money** **steps**.', '**Quarterly** **reconciliation** **jobs**.'),
  seniorItem('**Scale:** **10k** **Sagas** **per** **minute** **on** **single** **DB** **orchestrator**.', '**Shard** **saga** **instances**.', '**Lock** **contention** **on** **coordinator** **row**.', '**Partition** **by** **tenant** **or** **hash**.', '**Benchmark** **before** **black** **Friday**.'),
  seniorItem('**Legal:** **compensation** **cannot** **delete** **PII** **already** **shipped** **to** **warehouse**.', '**Legal** **review**.', '**GDPR** **vs** **operational** **data** **retention**.', '**Anonymize** **where** **possible**; **document** **holds**.', '**Policy** **as** **code** **on** **compensation** **paths**.'),
];

const wrongAnswers = [
  '**Saga** **equals** **2PC** — **Correction:** **Saga** **avoids** **global** **locks** **with** **compensations**.',
  '**Compensating** **always** **means** **SQL** **ROLLBACK** — **Correction:** **Business** **undo** **may** **call** **APIs**.',
  '**Choreography** **needs** **no** **correlation** **id** — **Correction:** **Tracing** **requires** **shared** **ids**.',
  '**Saga** **guarantees** **strong** **consistency** — **Correction:** **Eventual** **consistency** **with** **business** **rules**.',
  '**Orchestrator** **cannot** **fail** — **Correction:** **Must** **persist** **state** **and** **recover**.',
  '**Compensation** **order** **irrelevant** — **Correction:** **Depends** **on** **business** **dependencies**.',
  '**Events** **remove** **need** for **timeouts** — **Correction:** **Each** **step** **still** **bounded**.',
  '**Saga** **only** **for** **payments** — **Correction:** **Any** **multi-step** **cross-service** **workflow**.',
];

const why = `**Distributed** **transactions** **without** **discipline** **become** **silent** **data** **corruption** **stories** **in** **post-mortems**. **Sagas** **trade** **ACID** **illusions** for **explicit** **compensation** **paths** you can **test**, **observe**, and **audit**.\n\nInterviewers want **you** **to** **explain** **forward** **steps**, **compensating** **steps**, **failure** **ordering**, and **why** **2PC** **does** **not** **scale** **across** **teams**.\n\nThis day connects **Day** **55** **events** **to** **money** **movements**: **inventory**, **payments**, **shipping**.\n\nYou should **sound** **comfortable** **with** **partial** **failure** **and** **human** **escalation** **paths**.\n\nFinally, **idempotency** **everywhere** **is** **non-negotiable** **when** **brokers** **redeliver** **messages**.`;

const theory = `### Day 56 — **Saga** **pattern** **and** **distributed** **transactions**\n\n### 1. Problem\nCross-service **strong** **consistency** is rare without tight coupling.\n\n### 2. Saga basics\nSequence of local transactions plus compensations.\n\n### 3. Orchestration\nCentral coordinator issues commands.\n\n### 4. Choreography\nServices react to events.\n\n### 5. Compensation\nSemantic undo—not always a SQL delete.\n\n### 6. Idempotency\nForward and backward steps must tolerate retries.\n\n### 7. Persistence\nSaga instance row or event journal.\n\n### 8. Story\nPayment captured, inventory failed → refund compensation with audit trail.`;

const basic = {
  title: 'Basic — Saga vocabulary',
  filename: 'Day56Basic.java',
  description: 'Forward steps vs compensations; orchestration vs choreography.',
  code: `package arch.day56;

public class Day56Basic {
    public static void main(String[] args) {
        System.out.println("=== Saga forward steps (example checkout) ===");
        System.out.println("1. Reserve inventory (local TX in inventory service)");
        System.out.println("2. Capture payment (local TX in payments service)");
        System.out.println("3. Create shipment (local TX in shipping service)");
        System.out.println();
        System.out.println("=== Compensations (reverse order) ===");
        System.out.println("3c. Cancel shipment if created");
        System.out.println("2c. Refund payment if captured");
        System.out.println("1c. Release inventory reservation");
        System.out.println();
        System.out.println("=== Styles ===");
        System.out.println("Orchestration: coordinator issues commands + stores state");
        System.out.println("Choreography: services publish facts; peers react");
    }
}
`,
  output: `=== Saga forward steps (example checkout) ===
1. Reserve inventory (local TX in inventory service)
2. Capture payment (local TX in payments service)
3. Create shipment (local TX in shipping service)

=== Compensations (reverse order) ===
3c. Cancel shipment if created
2c. Refund payment if captured
1c. Release inventory reservation

=== Styles ===
Orchestration: coordinator issues commands + stores state
Choreography: services publish facts; peers react
`,
};

const intermediate = {
  title: 'Intermediate — State machine trace',
  filename: 'Day56Intermediate.java',
  description: 'Prints saga transitions for success vs inventory failure path.',
  code: `package arch.day56;

public class Day56Intermediate {

    public static void main(String[] args) {
        System.out.println("=== Happy path trace ===");
        System.out.println("START -> RESERVE_OK -> PAY_OK -> SHIP_OK -> DONE");
        System.out.println();
        System.out.println("=== Failure after payment (inventory short) ===");
        System.out.println("START -> RESERVE_OK -> PAY_OK -> INVENTORY_FAIL");
        System.out.println("COMPENSATE -> REFUND_OK -> RELEASE_OK -> ABORTED");
    }
}
`,
  output: `=== Happy path trace ===
START -> RESERVE_OK -> PAY_OK -> SHIP_OK -> DONE

=== Failure after payment (inventory short) ===
START -> RESERVE_OK -> PAY_OK -> INVENTORY_FAIL
COMPENSATE -> REFUND_OK -> RELEASE_OK -> ABORTED
`,
};

const advanced = {
  title: 'Advanced — Compensation ordering check',
  filename: 'Day56Advanced.java',
  description: 'Validates compensation list order string for toy saga.',
  code: `package arch.day56;

public class Day56Advanced {

    static String compensationOrder(boolean shipped) {
        StringBuilder b = new StringBuilder();
        if (shipped) {
            b.append("cancelShipment;");
        }
        b.append("refundPayment;");
        b.append("releaseInventory;");
        return b.toString();
    }

    public static void main(String[] args) {
        System.out.println("order_if_shipped=" + compensationOrder(true));
        System.out.println("order_if_not_shipped=" + compensationOrder(false));
    }
}
`,
  output: `order_if_shipped=cancelShipment;refundPayment;releaseInventory;
order_if_not_shipped=refundPayment;releaseInventory;
`,
};

const diagram = {
  title: 'Orchestrated saga with compensations',
  description: 'Coordinator drives forward steps; failures trigger reverse compensations.',
  plantuml: `@startuml
title Day 56 — Saga compensation
participant Orchestrator
participant Inventory
participant Payments

Orchestrator -> Inventory : reserve
Inventory --> Orchestrator : ok
Orchestrator -> Payments : capture
Payments --> Orchestrator : ok
Orchestrator -> Inventory : ship
Inventory --> Orchestrator : fail
Orchestrator -> Payments : refund (compensate)
Orchestrator -> Inventory : release (compensate)
@enduml`,
};

const pitfalls = [
  '**Compensating** **in** **wrong** **order**, **leaving** **money** **refunded** **but** **inventory** **still** **locked**.',
  '**Treating** **HTTP** **502** **as** **failure** **when** **payment** **actually** **settled**, **triggering** **wrong** **refund**.',
  '**Missing** **idempotency** **on** **refund** **API**, **double** **crediting** **customers** **during** **retries**.',
  '**No** **persistent** **saga** **state**, **so** **process** **crash** **restarts** **workflow** **from** **scratch** **duplicating** **charges**.',
  '**Choreography** **without** **correlation** **ids**, **impossible** **to** **debug** **which** **order** **instance** **failed**.',
  '**Compensation** **that** **throws** **unchecked** **exceptions** **without** **retry** **policy**, **stuck** **sagas** **forever**.',
  '**Skipping** **audit** **logs** **for** **money** **movements**, **failing** **SOC2** **reviews**.',
  '**Assuming** **cancel** **shipment** **always** **possible** **after** **carrier** **picked** **up**—**business** **rules** **differ**.',
];

const exerciseSolution = `package arch.day56;

/**
 * Day 56 assignment: compensate payment after inventory failure (toy saga log).
 */
public class Day56Exercise {

    static String runCheckout(boolean inventoryOk) {
        StringBuilder log = new StringBuilder();
        log.append("reserve:OK;");
        log.append("pay:CAPTURED;");
        if (!inventoryOk) {
            log.append("inventory:FAIL;");
            log.append("compensate:REFUND;");
            log.append("compensate:RELEASE;");
            log.append("final:ABORTED");
        } else {
            log.append("inventory:OK;");
            log.append("ship:OK;");
            log.append("final:DONE");
        }
        return log.toString();
    }

    public static void main(String[] args) {
        System.out.println("=== Saga assignment trace ===");
        System.out.println("happy=" + runCheckout(true));
        System.out.println("fail=" + runCheckout(false));
    }
}
`;

const exercise = {
  titleSuffix: 'Compensating payment after inventory failure (Day 56 assignment)',
  problem:
    'Align with **Day 56 Assignment**: **Compensating payment after inventory failure**.\n\n1. Implement **`runCheckout(boolean inventoryOk)`** building a **single** **semicolon-separated** **log** **string** **exactly** as the **reference** **`main()`** prints.\n2. **Happy** **path** (`inventoryOk == true`): `reserve:OK;pay:CAPTURED;inventory:OK;ship:OK;final:DONE`\n3. **Failure** **path**: after **`pay:CAPTURED`**, **`inventory` fails**, then **`compensate:REFUND;compensate:RELEASE;final:ABORTED`**.\n4. **Deterministic** **only**—no **random** **or** **clock** **logic**.',
  hints: [
    '**Append** **segments** **in** **order** with **`StringBuilder`**.',
    '**Branch** **only** **on** **the** **boolean** **parameter**.',
    '**Match** **reference** **string** **exactly**.',
  ],
  solution: exerciseSolution,
  difficulty: 'Advanced',
};

const cheatsheet = `| Topic | Rule | One-liner |
|---|---|---|
| Saga | Local TX + compensate | No global 2PC |
| Orchestration | Coordinator | Easier ops traces |
| Choreography | Domain events | Needs correlation id |
| Compensation | Semantic undo | Not always DELETE row |
| Idempotency | All steps | Survives redelivery |
| Pivot step | Business commit point | Defines when forward-only |
| Audit | Append-only money log | Compliance requirement |
| Timeout | Per step | Retry vs compensate decision |
| Outbox | Reliable events | Feeds saga transitions |
| Testing | Inject failures | State machine coverage |`;

const drillSeeds = [
  { question: 'Code review: **refund** **called** **before** **cancel** **shipment** **even** **when** **label** **printed**.', signals: ['ordering', 'compensation', 'carrier', 'rules'], core: { root: '**Compensation** **order** **violates** **business** **constraints**.', breaks: '**Customer** **charged** **back** **while** **parcel** **moves**.', fix: '**Model** **shipment** **states** **and** **legal** **refund** **gates**.', angle: '**Talk** **to** **ops** **about** **carrier** **APIs**.', fq1q: 'Test?', fq1a: '**Table-driven** **tests** **for** **each** **shipment** **state**.', fq2q: 'Metric?', fq2a: '**Stuck** **SAGA** **instances** **by** **state**.' } },
  { question: '**Incident:** **duplicate** **payment** **capture** **after** **orchestrator** **retry**.', signals: ['idempotent', 'orchestrator', 'retry', 'key'], core: { root: '**Forward** **step** **not** **idempotent**.', breaks: '**Double** **charge**.', fix: '**Idempotency-Key** **on** **capture** **API**.', angle: '**Persist** **step** **outcomes** **before** **retry**.', fq1q: 'Detection?', fq1a: '**Provider** **dashboard** **duplicate** **authorization** **ids**.', fq2q: 'Prevention?', fq2a: '**Outbox** **+** **exactly-once** **processing** **per** **saga** **id**.' } },
  { question: '**Design:** **choose** **choreography** **for** **10-step** **loan** **approval**.', signals: ['complexity', 'trace', 'orchestrate', 'support'], core: { root: '**High** **branching** **favors** **orchestration**.', breaks: '**Support** **cannot** **replay** **timeline**.', fix: '**Temporal** **/** **orchestrator** **with** **UI**.', angle: '**Regulatory** **audit** **needs** **central** **log**.', fq1q: 'When **choreography** **ok**?', fq1a: '**Simple** **linear** **flows** **with** **great** **observability**.', fq2q: 'Cost?', fq2a: '**Orchestrator** **DB** **scaling** **plan**.' } },
  { question: 'Explain **pivot** **transaction** **in** **checkout** **saga**.', signals: ['commit', 'business', 'risk', 'undo'], core: { root: '**Point** **where** **undo** **becomes** **expensive** **or** **impossible** **without** **manual** **steps**.', breaks: '**Wrong** **pivot** **choice** **blocks** **legal** **refunds**.', fix: '**Legal** **+** **product** **define** **pivot** **per** **jurisdiction**.', angle: '**Payment** **captured** **often** **pivot**.', fq1q: 'UX?', fq1a: '**Clear** **message** **when** **past** **pivot**.', fq2q: 'Tech?', fq1a: '**Persist** **pivot** **flag** **on** **saga** **row**.' } },
  { question: '**Trade-off:** **synchronous** **orchestrator** **REST** **vs** **event-driven** **orchestrator**.', signals: ['latency', 'coupling', 'availability', 'throughput'], core: { root: '**REST** **simple** **but** **couples** **runtime**; **events** **decouple** **but** **complex**.', breaks: '**Wrong** **choice** **for** **peak** **traffic**.', fix: '**Hybrid** **command** **queue** **fronting** **orchestrator**.', angle: '**Backpressure** **on** **commands**.', fq1q: 'Pattern?', fq1a: '**Kafka** **command** **topic** **with** **key=orderId**.', fq2q: 'Risk?', fq2a: '**Ordering** **per** **saga** **instance** **required**.' } },
  { question: '**Gotcha:** **compensation** **assumes** **inventory** **reservation** **still** **exists** **after** **7** **days**.', signals: ['ttl', 'expiry', 'race', 'data'], core: { root: '**Reservation** **TTL** **expired** **independently**.', breaks: '**Release** **fails**; **inventory** **double** **sold**.', fix: '**Extend** **TTL** **policy** **coordinated** **with** **saga** **timeouts**.', angle: '**Timeboxed** **sagas**.', fq1q: 'Alert?', fq1a: '**Saga** **duration** **p99** **vs** **reservation** **TTL**.', fq2q: 'Fix?', fq2a: '**Heartbeat** **events** **renew** **reservation**.' } },
  { question: '**Senior:** **global** **Saga** **standard** **library** **for** **Java** **services**.', signals: ['platform', 'starter', 'DSL', 'training'], core: { root: '**Snowflake** **implementations** **per** **team**.', breaks: '**Incidents** **repeat**.', fix: '**Shared** **starter** **+** **code** **review** **checklist**.', angle: '**Temporal** **vs** **homegrown**.', fq1q: 'Migration?', fq1a: '**Strangler** **new** **flows** **first**.', fq2q: 'Metric?', fq2a: '**Mean** **time** **to** **compensate** **drops**.' } },
  { question: '**Security:** **saga** **orchestrator** **logs** **full** **PAN**.', signals: ['PCI', 'logging', 'secrets', 'mask'], core: { root: '**Sensitive** **data** **in** **logs**.', breaks: '**Compliance** **breach**.', fix: '**Tokenization** **+** **structured** **logging** **redaction**.', angle: '**Only** **store** **payment** **references**.', fq1q: 'CI?', fq1a: '**Secret** **scanner** **on** **log** **statements**.', fq2q: 'Audit?', fq2a: '**Immutable** **audit** **with** **hashed** **payloads**.' } },
  { question: '**Scale:** **millions** **stuck** **sagas** **in** **COMPENSATING** **state**.', signals: ['backlog', 'retry', 'ops', 'db'], core: { root: '**Compensation** **jobs** **cannot** **keep** **up**.', breaks: '**Support** **tickets** **explode**.', fix: '**Horizontal** **workers** **+** **partition** **saga** **table**.', angle: '**Priority** **queue** **for** **money** **steps**.', fq1q: 'SLO?', fq1a: '**95%** **compensations** **finish** **<** **5m**.', fq2q: 'Prevention?', fq2a: '**Load** **test** **compensation** **path**.' } },
  { question: '**Misconception:** "**Saga** **means** **we** **never** **need** **ACID** **locally**."', signals: ['local', 'transaction', 'myth', 'db'], core: { root: '**Each** **step** **still** **needs** **local** **ACID**.', breaks: '**Corrupted** **partial** **writes** **inside** **service**.', fix: '**Strong** **local** **transactions** **+** **outbox**.', angle: '**Saga** **coordinates** **across** **services** **only**.', fq1q: 'Example?', fq1a: '**Inventory** **row** **+** **audit** **row** **atomic**.', fq2q: 'Failure?', fq2a: '**Local** **TX** **rollback** **prevents** **orphan** **rows**.' } },
];

export const drill56 = {
  day: 56,
  title: 'Saga Pattern & Distributed Transactions',
  phaseId: 'phase6',
  tags: ['Saga', 'compensation', 'orchestration', 'choreography', 'outbox', 'idempotency', 'payments'],
  scenarios: drillSeeds.map((s, i) => scenarioDrillItem(56, i + 1, s.question, s.signals, s.core)),
};

export default {
  day: 56,
  title: 'Saga Pattern & Distributed Transactions',
  tags: ['Mid-Level', 'Advanced', 'Phase 6', 'Interview Prep', 'Satyverse(Satyam Parmar)', 'Saga', 'transactions'],
  prerequisites: ['Day 55', 'Day 54'],
  learningObjectives: [
    'Explain why **two-phase** **commit** **scales** **poorly** and how **Sagas** **trade** **strong** **consistency** for **business** **workflows**',
    'Design **forward** and **compensating** **steps** for **checkout** **flows** with **explicit** **ordering** **rules**',
    'Compare **orchestrated** and **choreographed** **Sagas** using **debuggability** and **team** **autonomy** **criteria**',
    'Apply **idempotency** **to** **payments** **and** **refunds** **when** **brokers** **or** **clients** **retry**',
    'Persist **saga** **instance** **state** **for** **crash** **recovery** and **support** **tooling**',
    'Relate **transactional** **outbox** **events** to **saga** **transitions** **and** **audit** **requirements**',
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
