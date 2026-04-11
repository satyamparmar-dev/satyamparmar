import { conceptualItem, codeBasedItem, seniorItem, scenarioDrillItem } from './lib.mjs';

const T = 'CQRS and event sourcing';

const conceptual = [
  conceptualItem('What is **CQRS**?', '**Command** **Query** **Responsibility** **Segregation** **splits** **write** **models** **from** **read** **models** so each **can** **scale** **and** **evolve** **independently**.', T),
  conceptualItem('What is **event** **sourcing**?', 'Store **state** **as** **append-only** **events** **instead** **of** **only** **current** **row** **snapshot**—**replay** **rebuilds** **state**.', T),
  conceptualItem('What is a **projection** **read** **model**?', 'A **denormalized** **view** **built** **by** **consuming** **events**—**optimized** **for** **queries**.', T),
  conceptualItem('How **CQRS** **without** **event** **sourcing** **looks**?', 'Separate **write** **DB** **schema** **from** **read** **DB** **or** **cache** **updated** **synchronously** **or** **async**.', T),
  conceptualItem('What **event** **store** **requirements**?', '**Total** **ordering** **per** **stream**, **immutability**, **versioning**, **snapshot** **support** **optional**.', T),
  conceptualItem('Explain **optimistic** **concurrency** **on** **aggregates**.', '**Expected** **version** **on** **write** **detects** **conflicts** **when** **two** **commands** **race**.', T),
  conceptualItem('What **snapshotting** **solves**?', '**Long** **event** **streams** **slow** **replay**—**snapshots** **truncate** **history** **with** **pointer** **to** **last** **included** **event**.', T),
  conceptualItem('What **is** **event** **upcasting**?', 'Transform **old** **event** **payloads** **during** **replay** **to** **new** **schema** **versions**.', T),
  conceptualItem('CQRS **complexity** **cost**?', '**Eventual** **consistency** **on** **reads**, **more** **moving** **parts**, **operational** **burden** **for** **projections**.', T),
  conceptualItem('How **handle** **personal** **data** **in** **event** **log**?', '**Encryption**, **redaction** **strategies**, **legal** **holds**—**immutable** **log** **complicates** **GDPR** **deletion**.', T),
  conceptualItem('What **read** **side** **failure** **modes**?', '**Stale** **projection** **lag**, **wrong** **handler** **ordering**, **duplicate** **processing**.', T),
  conceptualItem('Difference **between** **domain** **event** **and** **integration** **event**?', '**Domain** **events** **internal** **to** **BC**; **integration** **events** **cross** **service** **boundary** **with** **public** **contract**.', T),
  conceptualItem('What **testing** **replay**?', '**Given** **event** **list**, **assert** **final** **projection** **state**—**golden** **fixtures**.', T),
  conceptualItem('How **Axon** /**EventStore** **fit**?', '**Frameworks** **provide** **aggregates**, **event** **bus**, **projection** **processors**—still **need** **domain** **discipline**.', T),
  conceptualItem('When **avoid** **event** **sourcing**?', '**Simple** **CRUD** **with** **no** **audit** **or** **time-travel** **requirements** **rarely** **justify** **cost**.', T),
];

const codeBased = [
  codeBasedItem('**Aggregate** **apply** **method** sketch', '// void apply(OrderPlaced e) { this.total += e.amount; }'),
  codeBasedItem('**Command** **handler** loads aggregate', '// Order agg = repo.load(id, expectedVersion); agg.ship(); repo.save(agg);'),
  codeBasedItem('**Projection** **@EventHandler** pseudo', '// on(OrderPlaced e) { jdbc.update("insert into order_view ..."); }'),
  codeBasedItem('**Kafka** **as** **event** **log** caveat', '// partitions give per-key order, not global total order'),
  codeBasedItem('**Snapshot** **table** columns', '// aggregate_id, version, payload_bytes, created_at'),
  codeBasedItem('**Upcaster** **interface** comment', '// EventUpcast from v1 payload to v2 structure'),
  codeBasedItem('**Spring** **@Transactional** **on** **projection**', '// risk: long TX — prefer idempotent upsert per event'),
  codeBasedItem('**Debezium** **CDC** **to** **projection**', '// alternative to domain events for read models'),
  codeBasedItem('**Query** **side** **cache** **invalidation**', '// versioned keys or TTL with lag acceptance'),
  codeBasedItem('**CloudEvents** **wrap** **domain** **event**', '// attributes + data map to integration boundary'),
];

const seniorScenario = [
  seniorItem('**Incident:** **read** **model** **shows** **paid** **orders** **as** **pending**.', '**Freeze** **deploys**; **check** **lag**.', '**Projection** **consumer** **stuck** **or** **buggy** **handler**.', '**Replay** **from** **checkpoint** **or** **rebuild** **view**.', '**SLO** on **projection** **freshness**.'),
  seniorItem('**Design:** **legal** **requires** **10-year** **audit** **trail** **of** **pricing** **changes**.', 'Prefer **event** **sourcing** **for** **price** **aggregate**.', '**Mutable** **rows** **overwrite** **history**.', '**Append-only** **events** **+** **archival** **policy**.', '**Compliance** **sign-off** **on** **schema** **changes**.'),
  seniorItem('**Migration:** **CRUD** **to** **ES** **without** **big** **bang**.', '**Strangler** **new** **aggregates**.', '**Dual** **write** **complexity**.', '**Capture** **changes** **via** **CDC** **initially**.', '**Feature** **flag** **read** **paths**.'),
  seniorItem('**Performance:** **replay** **takes** **hours** **after** **schema** **change**.', '**Snapshot** **more** **frequently**.', '**Millions** **events** **per** **aggregate** **rare** **but** **deadly**.', '**Partition** **aggregate** **design**.', '**Benchmark** **replay** **in** **CI**.'),
  seniorItem('**Security:** **projection** **exposes** **PII** **from** **events**.', '**Mask** **fields** **at** **projection** **time**.', '**Event** **payload** **too** **rich**.', '**Field-level** **encryption** **keys** **rotated**.', '**Data** **classification** **per** **event** **type**.'),
  seniorItem('**Conflict:** **two** **commands** **same** **version** **accepted**.', '**Alert** **data** **team**.', '**Lost** **update** **without** **optimistic** **lock**.', '**Enforce** **expectedVersion** **in** **repository**.', '**Property-based** **tests** **for** **concurrency**.'),
];

const wrongAnswers = [
  '**CQRS** **requires** **event** **sourcing** — **Correction:** **They** **are** **often** **paired** **but** **not** **mandatory**.',
  '**Projections** **always** **strongly** **consistent** — **Correction:** **Usually** **eventual** **unless** **same** **TX** **rare**.',
  '**Event** **log** **easy** **to** **delete** **user** **data** — **Correction:** **GDPR** **needs** **compensating** **events** **or** **crypto** **shredding**.',
  '**Replay** **always** **free** — **Correction:** **CPU** **and** **time** **cost** **grows** **with** **history**.',
  '**Kafka** **is** **an** **event** **store** **drop-in** — **Correction:** **Different** **guarantees** **than** **ES** **databases**.',
  '**Snapshots** **replace** **events** — **Correction:** **Snapshots** **optimize** **replay** **events** **remain** **source** **of** **truth**.',
  '**One** **projection** **table** **per** **service** **always** — **Correction:** **Many** **read** **models** **possible**.',
  '**Commands** **should** **embed** **full** **read** **DTO** — **Correction:** **Commands** **carry** **intent** **minimal** **data**.',
];

const why = `**CQRS** **and** **event** **sourcing** **solve** **real** **problems**—**audit**, **scalable** **reads**, **time-travel** **debugging**—but **they** **multiply** **moving** **parts**. Interviewers **probe** **whether** **you** **know** **projection** **lag**, **replay** **cost**, and **schema** **evolution** **pain**.\n\nWeak answers **equate** **Kafka** **topics** **with** **an** **event** **store** **without** **explaining** **ordering** **and** **consumer** **idempotency**.\n\nStrong answers **separate** **command** **side** **integrity** **from** **read** **side** **freshness** **SLOs**.\n\nThis **day** **builds** **on** **Sagas** **and** **messaging**: **events** **as** **source** **of** **truth** **inside** **a** **bounded** **context**.\n\nYou **should** **mention** **snapshots**, **upcasters**, **and** **rebuild** **playbooks** **like** **you** **have** **run** **them**.`;

const theory = `### Day 57 — **CQRS** **and** **event** **sourcing**\n\n### 1. CQRS\nSplit **commands** **and** **queries**.\n\n### 2. Event sourcing\nAppend-only **event** **log** **as** **truth**.\n\n### 3. Projections\nRead **models** **from** **streams**.\n\n### 4. Concurrency\nOptimistic **versioning** **on** **aggregates**.\n\n### 5. Snapshots\nTruncate **replay** **time**.\n\n### 6. Upcasting\nSchema **migration** **during** **replay**.\n\n### 7. Ops\nRebuild **jobs**, **lag** **metrics**, **storage** **growth**.\n\n### 8. Story\nPricing **bug** **fixed** **by** **replaying** **events** **into** **new** **projection** **schema**.`;

const basic = {
  title: 'Basic — CQRS / ES vocabulary',
  filename: 'Day57Basic.java',
  description: 'Command vs query; event log vs projection.',
  code: `package arch.day57;

public class Day57Basic {
    public static void main(String[] args) {
        System.out.println("=== CQRS split ===");
        System.out.println("Command side: validate business rules, mutate aggregates, emit events");
        System.out.println("Query side: serve denormalized read models optimized for UI/search");
        System.out.println();
        System.out.println("=== Event sourcing ===");
        System.out.println("Truth = ordered append-only events per aggregate stream");
        System.out.println("State = fold(events) optionally accelerated by snapshots");
        System.out.println();
        System.out.println("=== Projection consistency ===");
        System.out.println("Usually eventual: measure lag SLO between write commit and read freshness");
    }
}
`,
  output: `=== CQRS split ===
Command side: validate business rules, mutate aggregates, emit events
Query side: serve denormalized read models optimized for UI/search

=== Event sourcing ===
Truth = ordered append-only events per aggregate stream
State = fold(events) optionally accelerated by snapshots

=== Projection consistency ===
Usually eventual: measure lag SLO between write commit and read freshness
`,
};

const intermediate = {
  title: 'Intermediate — Deterministic replay fold',
  filename: 'Day57Intermediate.java',
  description: 'Folds integer events into balance state.',
  code: `package arch.day57;

public class Day57Intermediate {

    static int fold(int[] deltas) {
        int bal = 0;
        for (int d : deltas) {
            bal += d;
        }
        return bal;
    }

    public static void main(String[] args) {
        int[] events = {100, -20, -30, 50};
        System.out.println("events=" + java.util.Arrays.toString(events));
        System.out.println("balance=" + fold(events));
    }
}
`,
  output: `events=[100, -20, -30, 50]
balance=100
`,
};

const advanced = {
  title: 'Advanced — Snapshot + tail replay',
  filename: 'Day57Advanced.java',
  description: 'Applies snapshot base plus tail events only.',
  code: `package arch.day57;

public class Day57Advanced {

    static int rebuild(int snapshotBalance, int[] tailAmounts) {
        int bal = snapshotBalance;
        for (int a : tailAmounts) {
            bal += a;
        }
        return bal;
    }

    public static void main(String[] args) {
        int[] tail = {5, 10, -3};
        System.out.println("replayedBalance=" + rebuild(100, tail));
    }
}
`,
  output: `replayedBalance=112
`,
};

const diagram = {
  title: 'CQRS write path vs projection consumers',
  description: 'Command persists events; projector updates read store asynchronously.',
  plantuml: `@startuml
title Day 57 — CQRS flow
actor User
participant CommandAPI
database EventStore
queue Bus
participant Projector
database ReadDB

User -> CommandAPI : PlaceOrder command
CommandAPI -> EventStore : append OrderPlaced
CommandAPI -> User : 202 Accepted
Bus -> Projector : OrderPlaced
Projector -> ReadDB : upsert order_view
@enduml`,
};

const pitfalls = [
  '**Treating** **projection** **lag** **as** **zero** **without** **SLO**, **confusing** **users** **with** **stale** **UI** **after** **writes**.',
  '**Replaying** **years** **of** **events** **without** **snapshots**, **making** **deploy** **migrations** **take** **hours**.',
  '**Mutable** **delete** **in** **event** **store** **to** **fix** **bugs**, **destroying** **audit** **trail** **integrity**.',
  '**Global** **ordering** **assumption** **across** **Kafka** **partitions**, **building** **wrong** **invariants**.',
  '**Projection** **handlers** **that** **throw** **without** **DLQ**, **stalling** **entire** **consumer** **pipeline**.',
  '**Embedding** **secrets** **in** **events**, **impossible** **to** **rotate** **without** **reprocessing**.',
  '**Skipping** **idempotency** **on** **projection** **upserts**, **duplicating** **rows** **on** **at-least-once** **delivery**.',
  '**Using** **CQRS** **for** **simple** **CRUD** **admin** **tool** **with** **two** **engineers**, **creating** **ops** **burden** **with** **no** **benefit**.',
];

const exerciseSolution = `package arch.day57;

import java.util.*;

/**
 * Day 57 assignment: projection replay from ordered event list (toy).
 */
public class Day57Exercise {

    static List<String> replayToView(List<String> eventTypes) {
        List<String> view = new ArrayList<>();
        for (String e : eventTypes) {
            switch (e) {
                case "OrderPlaced" -> view.add("row:order=PENDING_PAYMENT");
                case "PaymentCaptured" -> view.add("row:order=PAID");
                case "OrderShipped" -> view.add("row:order=SHIPPED");
                default -> view.add("row:ignored=" + e);
            }
        }
        return view;
    }

    public static void main(String[] args) {
        List<String> ev = List.of("OrderPlaced", "PaymentCaptured", "OrderShipped");
        System.out.println("=== Projection replay ===");
        for (String line : replayToView(ev)) {
            System.out.println(line);
        }
    }
}
`;

const exercise = {
  titleSuffix: 'Projection consistency and replay strategy (Day 57 assignment)',
  problem:
    'Align with **Day 57 Assignment**: **Projection consistency and replay strategy**.\n\n1. Implement **`replayToView(List<String> eventTypes)`** that **folds** **events** **in** **order** into **printed** **lines** **exactly** as the **reference** **`main()`**.\n2. Map **`OrderPlaced`** → **`row:order=PENDING_PAYMENT`**, **`PaymentCaptured`** → **`row:order=PAID`**, **`OrderShipped`** → **`row:order=SHIPPED`**.\n3. Unknown **types** → **`row:ignored=<type>`**.\n4. **`main()`** uses **`List.of("OrderPlaced", "PaymentCaptured", "OrderShipped")`** and prints **header** **`=== Projection replay ===`** then **three** **rows**.',
  hints: [
    'Use **`switch` **expressions** or **`if` **chain** in **order**.',
    '**Append** **one** **line** **per** **event**.',
    'Keep **strings** **exact** for **grading**.',
  ],
  solution: exerciseSolution,
  difficulty: 'Advanced',
};

const cheatsheet = `| Topic | Rule | One-liner |
|---|---|---|
| CQRS | Split R/W | Scale reads independently |
| Event sourcing | Append log | Replay rebuilds state |
| Projection | Consumer | Eventual freshness SLO |
| Snapshot | Periodic | Cuts replay CPU time |
| Upcaster | Migrate events | Replay applies new schema |
| Optimistic lock | expectedVersion | Detect concurrent commands |
| Stream | Per aggregate | Ordering scoped |
| Rebuild job | Batch | Monitor lag & duplicates |
| GDPR | Crypto erase | Immutable log needs strategy |
| Testing | Golden events | Assert folded state |`;

const drillSeeds = [
  { question: 'Code review: **projection** **handler** **updates** **5** **tables** **in** **one** **JDBC** **transaction** **per** **event**.', signals: ['lock', 'latency', 'retry', 'tx'], core: { root: '**Long** **TX** **in** **hot** **path**.', breaks: '**DB** **locks** **and** **retry** **storms**.', fix: '**Per-table** **idempotent** **upserts** **shorter** **TX**.', angle: '**Outbox** **pattern** **for** **commands** **vs** **read** **side**.', fq1q: 'Metric?', fq1a: '**Projection** **lag** **histogram**.', fq2q: 'Test?', fq2a: '**Chaos** **kill** **DB** **during** **replay**.' } },
  { question: '**Incident:** **replay** **job** **double** **counts** **revenue**.', signals: ['idempotent', 'replay', 'aggregate', 'bug'], core: { root: '**Non-idempotent** **SUM** **projection**.', breaks: '**Finance** **wrong**.', fix: '**Rebuild** **from** **scratch** **with** **fixed** **handler**.', angle: '**Version** **projection** **code** **with** **migrations**.', fq1q: 'Prevention?', fq1a: '**Golden** **event** **fixtures** **in** **CI**.', fq2q: 'Comms?', fq2a: '**Notify** **audit** **team** **before** **numbers** **published**.' } },
  { question: '**Design:** **legal** **wants** **immutable** **pricing** **history**.', signals: ['audit', 'ES', 'append', 'compliance'], core: { root: '**Mutable** **row** **fails** **audit**.', breaks: '**Cannot** **prove** **past** **quotes**.', fix: '**Event** **sourced** **price** **list** **aggregate**.', angle: '**Retention** **policy** **on** **cold** **storage**.', fq1q: 'PII?', fq1a: '**Separate** **customer** **events** **with** **redaction**.', fq2q: 'Query?', fq2a: '**Projection** **per** **effective** **date**.' } },
  { question: 'Explain **upcaster** **vs** **dual** **write** **migration**.', signals: ['schema', 'replay', 'dual', 'version'], core: { root: '**Upcaster** **transforms** **on** **read** **replay**.', breaks: '**Dual** **write** **complex** **operationally**.', fix: 'Pick **based** **on** **downtime** **budget**.', angle: '**Strangler** **new** **aggregates** **first**.', fq1q: 'Risk?', fq1a: '**Silent** **data** **loss** **if** **upcaster** **wrong**.', fq2q: 'Verify?', fq2a: '**Property** **tests** **roundtrip** **old** **events**.' } },
  { question: '**Trade-off:** **Kafka** **log** **vs** **EventStoreDB** **for** **sourcing**.', signals: ['ordering', 'ops', 'query', 'cost'], core: { root: '**Kafka** **great** **bus** **not** **always** **ideal** **event** **DB**.', breaks: '**Wrong** **tooling** **for** **aggregate** **streams**.', fix: '**Match** **product** **to** **needed** **guarantees**.', angle: '**Consumer** **position** **vs** **stream** **version**.', fq1q: 'When **Kafka** **ok**?', fq1a: '**Integration** **events** **with** **idempotent** **consumers**.', fq2q: 'When **ESDB**?', fq2a: '**Strong** **stream** **consistency** **per** **aggregate**.' } },
  { question: '**Gotcha:** **projection** **uses** **`MAX(event_time)`** **without** **tie-break**.', signals: ['ordering', 'clock', 'duplicate', 'skew'], core: { root: '**Equal** **timestamps** **reorder** **wrong**.', breaks: '**Flaky** **read** **model**.', fix: '**Use** **monotonic** **sequence** **per** **stream**.', angle: '**Vector** **clocks** **rare** **in** **biz** **apps**.', fq1q: 'Test?', fq1a: '**Shuffle** **same-timestamp** **events** **in** **replay** **test**.', fq2q: 'Ops?', fq2a: '**NTP** **skew** **alerts** **on** **writers**.' } },
  { question: '**Senior:** **company-wide** **projection** **framework** **in** **Java**.', signals: ['platform', 'starter', 'SLO', 'replay'], core: { root: '**Duplicated** **buggy** **consumers**.', breaks: '**Inconsistent** **lag** **SLOs**.', fix: '**Shared** **library** **+** **template** **service**.', angle: '**Self-service** **replay** **API** **with** **RBAC**.', fq1q: 'Metric?', fq1a: '**p99** **projection** **freshness** **per** **tenant**.', fq2q: 'Cost?', fq2a: '**Managed** **event** **store** **TCO** **vs** **DIY**.' } },
  { question: '**Security:** **projection** **stores** **cleartext** **SSN** **from** **events**.', signals: ['PII', 'encryption', 'gdpr', 'read'], core: { root: '**Read** **model** **too** **rich**.', breaks: '**Breach** **surface** **widens**.', fix: '**Tokenize** **at** **write**; **mask** **at** **read**.', angle: '**Field-level** **encryption** **rotation**.', fq1q: 'Deletion?', fq1a: '**Tombstone** **events** **+** **crypto** **erase**.', fq2q: 'Audit?', fq2a: '**Access** **logs** **on** **projection** **queries**.' } },
  { question: '**Scale:** **10TB** **event** **log** **per** **year** **storage** **cost** **alert**.', signals: ['retention', 'archive', 'snapshot', 'cost'], core: { root: '**Unbounded** **growth** **without** **archival**.', breaks: '**Budget** **overrun**.', fix: '**Tiered** **storage** **+** **aggressive** **snapshotting**.', angle: '**Compress** **old** **streams**.', fq1q: 'Compliance?', fq1a: '**Legal** **hold** **buckets** **separate**.', fq2q: 'Tech?', fq2a: '**Cold** **line** **replay** **jobs** **async**.' } },
  { question: '**Misconception:** "**Replay** **fixes** **bad** **business** **logic** **silently**."', signals: ['logic', 'bug', 'data', 'correct'], core: { root: '**Replay** **recomputes** **same** **wrong** **fold** **if** **code** **unchanged**.', breaks: '**Persisted** **wrong** **projection**.', fix: '**Fix** **handler** **then** **rebuild** **view**.', angle: '**Blue/green** **projection** **tables**.', fq1q: 'Verify?', fq1a: '**Diff** **old** **vs** **new** **row** **counts**.', fq2q: 'Risk?', fq2a: '**Wrong** **migration** **could** **wipe** **read** **store**.' } },
];

export const drill57 = {
  day: 57,
  title: 'CQRS & Event Sourcing',
  phaseId: 'phase6',
  tags: ['CQRS', 'event sourcing', 'projection', 'replay', 'snapshot', 'aggregate', 'read model'],
  scenarios: drillSeeds.map((s, i) => scenarioDrillItem(57, i + 1, s.question, s.signals, s.core)),
};

export default {
  day: 57,
  title: 'CQRS & Event Sourcing',
  tags: ['Mid-Level', 'Advanced', 'Phase 6', 'Interview Prep', 'Satyverse(Satyam Parmar)', 'CQRS', 'events'],
  prerequisites: ['Day 56', 'Day 55'],
  learningObjectives: [
    'Separate **command** **and** **query** **responsibilities** and justify **when** **CQRS** **pays** **off**',
    'Explain **event** **sourcing** **replay**, **snapshots**, and **schema** **evolution** **with** **upcasters**',
    'Design **projections** **with** **idempotent** **consumers** and **freshness** **SLOs**',
    'Compare **Kafka** **as** **bus** vs **dedicated** **event** **stores** **for** **per-aggregate** **streams**',
    'Plan **rebuild** **jobs** and **migration** **strategies** **without** **silent** **data** **corruption**',
    'Address **GDPR** **and** **audit** **requirements** **when** **events** **contain** **PII**',
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
