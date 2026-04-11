import { theoryTitle, theoryBase } from "./theory.mjs";
import {
  basicCode,
  basicOutput,
  intermediateCode,
  intermediateOutput,
  advancedCode,
  advancedOutput,
} from "./codes.mjs";
import diagram from "./diagram.mjs";
import mcqQuestions from "./mcq.mjs";
import interview from "./interview.mjs";

const why = "**CQRS** **and** **event** **sourcing** **solve** **real** **problems**—**audit**, **scalable** **reads**, **time-travel** **debugging**—but **they** **multiply** **moving** **parts**. Interviewers **probe** **whether** **you** **know** **projection** **lag**, **replay** **cost**, and **schema** **evolution** **pain**.\n\nWeak answers **equate** **Kafka** **topics** **with** **an** **event** **store** **without** **explaining** **ordering** **and** **consumer** **idempotency**.\n\nStrong answers **separate** **command** **side** **integrity** **from** **read** **side** **freshness** **SLOs**.\n\nThis **day** **builds** **on** **Sagas** **and** **messaging**: **events** **as** **source** **of** **truth** **inside** **a** **bounded** **context**.\n\nYou **should** **mention** **snapshots**, **upcasters**, **and** **rebuild** **playbooks** **like** **you** **have** **run** **them**.";

const pitfalls = [
  "**Treating** **projection** **lag** **as** **zero** **without** **SLO**, **confusing** **users** **with** **stale** **UI** **after** **writes**.",
  "**Replaying** **years** **of** **events** **without** **snapshots**, **making** **deploy** **migrations** **take** **hours**.",
  "**Mutable** **delete** **in** **event** **store** **to** **fix** **bugs**, **destroying** **audit** **trail** **integrity**.",
  "**Global** **ordering** **assumption** **across** **Kafka** **partitions**, **building** **wrong** **invariants**.",
  "**Projection** **handlers** **that** **throw** **without** **DLQ**, **stalling** **entire** **consumer** **pipeline**.",
  "**Embedding** **secrets** **in** **events**, **impossible** **to** **rotate** **without** **reprocessing**.",
  "**Skipping** **idempotency** **on** **projection** **upserts**, **duplicating** **rows** **on** **at-least-once** **delivery**.",
  "**Using** **CQRS** **for** **simple** **CRUD** **admin** **tool** **with** **two** **engineers**, **creating** **ops** **burden** **with** **no** **benefit**."
];

const exercise = {
  "title": "Exercise — Projection consistency and replay strategy (Day 57 assignment)",
  "difficulty": "Advanced",
  "problem": "Align with **Day 57 Assignment**: **Projection consistency and replay strategy**.\n\n1. Implement **`replayToView(List<String> eventTypes)`** that **folds** **events** **in** **order** into **printed** **lines** **exactly** as the **reference** **`main()`**.\n2. Map **`OrderPlaced`** → **`row:order=PENDING_PAYMENT`**, **`PaymentCaptured`** → **`row:order=PAID`**, **`OrderShipped`** → **`row:order=SHIPPED`**.\n3. Unknown **types** → **`row:ignored=<type>`**.\n4. **`main()`** uses **`List.of(\"OrderPlaced\", \"PaymentCaptured\", \"OrderShipped\")`** and prints **header** **`=== Projection replay ===`** then **three** **rows**.",
  "hints": [
    "Use **`switch` **expressions** or **`if` **chain** in **order**.",
    "**Append** **one** **line** **per** **event**.",
    "Keep **strings** **exact** for **grading**."
  ],
  "solution": "package arch.day57;\n\nimport java.util.*;\n\n/**\n * Day 57 assignment: projection replay from ordered event list (toy).\n */\npublic class Day57Exercise {\n\n    static List<String> replayToView(List<String> eventTypes) {\n        List<String> view = new ArrayList<>();\n        for (String e : eventTypes) {\n            switch (e) {\n                case \"OrderPlaced\" -> view.add(\"row:order=PENDING_PAYMENT\");\n                case \"PaymentCaptured\" -> view.add(\"row:order=PAID\");\n                case \"OrderShipped\" -> view.add(\"row:order=SHIPPED\");\n                default -> view.add(\"row:ignored=\" + e);\n            }\n        }\n        return view;\n    }\n\n    public static void main(String[] args) {\n        List<String> ev = List.of(\"OrderPlaced\", \"PaymentCaptured\", \"OrderShipped\");\n        System.out.println(\"=== Projection replay ===\");\n        for (String line : replayToView(ev)) {\n            System.out.println(line);\n        }\n    }\n}\n"
};

const cheatsheetRows = [
  [
    "CQRS",
    "Split R/W",
    "Scale reads independently"
  ],
  [
    "Event sourcing",
    "Append log",
    "Replay rebuilds state"
  ],
  [
    "Projection",
    "Consumer",
    "Eventual freshness SLO"
  ],
  [
    "Snapshot",
    "Periodic",
    "Cuts replay CPU time"
  ],
  [
    "Upcaster",
    "Migrate events",
    "Replay applies new schema"
  ],
  [
    "Optimistic lock",
    "expectedVersion",
    "Detect concurrent commands"
  ],
  [
    "Stream",
    "Per aggregate",
    "Ordering scoped"
  ],
  [
    "Rebuild job",
    "Batch",
    "Monitor lag & duplicates"
  ],
  [
    "GDPR",
    "Crypto erase",
    "Immutable log needs strategy"
  ],
  [
    "Testing",
    "Golden events",
    "Assert folded state"
  ],
  [
    "Trace id",
    "Propagate on every hop",
    "Debug 502/504 with correlation"
  ],
  [
    "Timeouts",
    "Client < gateway < server",
    "Cancel work; avoid retry storms"
  ],
  [
    "Payload size",
    "Cap upload; stream large",
    "Protect memory and threads"
  ],
  [
    "Deprecation",
    "Sunset header + docs",
    "Give consumers a calendar"
  ],
  [
    "Security",
    "Authn at edge; authz in service",
    "Do not trust gateway alone"
  ]
];

export default {
  title: "CQRS & Event Sourcing",
  tags: ["Mid-Level","Advanced","Phase 6","Interview Prep","Satyverse(Satyam Parmar)","CQRS","events"],
  prerequisites: ["Day 56","Day 55"],
  learningObjectives: ["Separate **command** **and** **query** **responsibilities** and justify **when** **CQRS** **pays** **off**","Explain **event** **sourcing** **replay**, **snapshots**, and **schema** **evolution** **with** **upcasters**","Design **projections** **with** **idempotent** **consumers** and **freshness** **SLOs**","Compare **Kafka** **as** **bus** vs **dedicated** **event** **stores** **for** **per-aggregate** **streams**","Plan **rebuild** **jobs** and **migration** **strategies** **without** **silent** **data** **corruption**","Address **GDPR** **and** **audit** **requirements** **when** **events** **contain** **PII**"],
  why,
  theoryTitle,
  theoryBase,
  basicCode,
  basicOutput,
  intermediateCode,
  intermediateOutput,
  advancedCode,
  advancedOutput,
  diagram,
  pitfalls,
  exercise,
  interview,
  mcqLabel: "CQRS & Event Sourcing",
  mcqDescription: "Thirty questions from basic to advanced — CQRS & Event Sourcing. Read every option; distractors are plausible but wrong for a precise reason.",
  mcqQuestions,
  cheatsheetRows,
};
