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

const why = "**Inter-service** **communication** **patterns** decide whether your **system** **fails** **gracefully** or **cascades** **into** **company-wide** **outages**. **Sync** **chains** **feel** **simple** until **latency** **variance** **eats** **SLOs**; **async** **events** **decouple** **availability** but **demand** **rigorous** **idempotency** and **observability**.\n\nInterviewers probe whether you **understand** **trade-offs**, not whether you **memorized** **Kafka** **APIs**.\n\nThis day ties **Day** **53** **clients** to **broader** **topologies**: **outbox**, **Saga**, **choreography**, **DLQ**, **backpressure**.\n\nStrong candidates **name** **failure** **modes** **like** **duplicate** **delivery** and **poison** **pill** **messages** with **concrete** **mitigations**.\n\nFinally, **platform** **thinking** matters—**golden** **paths** for **event** **schemas** and **consumer** **templates** beat **per-team** **snowflakes**.";

const pitfalls = [
  "**Publishing** **to** **Kafka** **before** **DB** **commit** **succeeds**, causing **ghost** **events** **consumers** **cannot** **reconcile**.",
  "**Consumers** **without** **idempotency** **under** **at-least-once** **delivery**, **duplicating** **financial** **side** **effects**.",
  "**Unbounded** **sync** **chains** **(A→B→C→D)** **for** **user** **clicks**, **making** **p99** **a** **sum** **of** **worst** **case** **latencies**.",
  "**Ignoring** **DLQ** **depth** **alerts** until **disk** **fills** and **broker** **stops** **accepting** **writes**.",
  "**Using** **events** **as** **hidden** **RPC** **with** **request** **reply** **topics** **without** **timeouts**, **creating** **distributed** **deadlocks**.",
  "**Skipping** **schema** **versioning** **on** **event** **payloads**, **breaking** **old** **consumers** **silently**.",
  "**One** **giant** **event** **with** **50** **fields** **coupling** **every** **consumer** **to** **every** **column** **change**.",
  "**No** **correlation** **ids** **across** **async** **steps**, **making** **incident** **debugging** **impossible** **in** **logs**."
];

const exercise = {
  "title": "Exercise — Sync vs async choreography design (Day 55 assignment)",
  "difficulty": "Advanced",
  "problem": "Align with **Day 55 Assignment**: **Sync vs async choreography design**.\n\n1. Implement **`planCheckout(boolean useAsync)`** returning a **list** of **step** **strings**.\n2. When **`useAsync` is `false`**, return **exactly** **three** lines starting with **`SYNC:`** as in the **reference** **output**.\n3. When **`useAsync` is `true`**, return **exactly** **four** lines: one **`SYNC:`** for **order** **persistence** **+** **outbox**, then **three** **`ASYNC:`** lines **exactly** as shown.\n4. **`main()`** prints **both** **plans** with **headers** **matching** the **model** **output**.",
  "hints": [
    "Use **`ArrayList`** and **`add`** in **order**.",
    "Keep **string** **prefixes** **`SYNC:`** / **`ASYNC:`** **exact** for **diff** **checks**.",
    "Do **not** **read** **environment** **or** **clock** for **branching**."
  ],
  "solution": "package arch.day55;\n\nimport java.util.*;\n\n/**\n * Day 55 assignment: sync vs async choreography design (toy planner).\n */\npublic class Day55Exercise {\n\n    static List<String> planCheckout(boolean useAsync) {\n        List<String> steps = new ArrayList<>();\n        if (!useAsync) {\n            steps.add(\"SYNC: POST /inventory/reserve\");\n            steps.add(\"SYNC: POST /payments/charge\");\n            steps.add(\"SYNC: POST /shipping/create\");\n        } else {\n            steps.add(\"SYNC: POST /orders (persist + outbox)\");\n            steps.add(\"ASYNC: OrderPlaced -> inventory reserve\");\n            steps.add(\"ASYNC: InventoryReserved -> payment charge\");\n            steps.add(\"ASYNC: PaymentCaptured -> shipping create\");\n        }\n        return steps;\n    }\n\n    public static void main(String[] args) {\n        System.out.println(\"=== Assignment: sync vs async choreography ===\\n\");\n        System.out.println(\"--- Sync design ---\");\n        for (String s : planCheckout(false)) {\n            System.out.println(s);\n        }\n        System.out.println();\n        System.out.println(\"--- Async choreography ---\");\n        for (String s : planCheckout(true)) {\n            System.out.println(s);\n        }\n    }\n}\n"
};

const cheatsheetRows = [
  [
    "Pattern",
    "Rule",
    "One-liner"
  ],
  [
    "Sync chain",
    "Minimize hops",
    "p99 sums latencies"
  ],
  [
    "Outbox",
    "Same TX as write",
    "Reliable publish"
  ],
  [
    "Idempotent consumer",
    "Dedup keys",
    "Survives redelivery"
  ],
  [
    "Choreography",
    "Many listeners",
    "Needs trace IDs"
  ],
  [
    "Orchestration",
    "Central state",
    "Easier dashboards"
  ],
  [
    "DLQ",
    "Alert on age",
    "Ops safety valve"
  ],
  [
    "Kafka ordering",
    "Partition key",
    "Per-aggregate order"
  ],
  [
    "Backpressure",
    "Pause poll",
    "Protect downstream"
  ],
  [
    "BFF",
    "Aggregate reads",
    "Hides chattiness"
  ],
  [
    "Schema",
    "Version events",
    "Registry in CI"
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
  ]
];

export default {
  title: "Inter-Service Communication Patterns",
  tags: ["Mid-Level","Advanced","Phase 6","Interview Prep","Satyverse(Satyam Parmar)","Kafka","messaging"],
  prerequisites: ["Day 54","Day 53"],
  learningObjectives: ["Compare **synchronous** **HTTP** **chains** and **asynchronous** **event** **choreography** using **latency** and **failure** **amplification** **arguments**","Explain the **transactional** **outbox** **pattern** and why **publish-before-commit** **fails**","Design **idempotent** **consumers** for **at-least-once** **brokers** like **Kafka**","Contrast **orchestrated** **Sagas** and **choreographed** **Sagas** with **debuggability** **trade-offs**","Apply **backpressure** and **DLQ** **policies** to **poison** **messages** and **slow** **handlers**","Choose **messaging** **vs** **RPC** using **ordering**, **replay**, and **operational** **maturity** **criteria**"],
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
  mcqLabel: "Inter-Service Communication Patterns",
  mcqDescription: "Thirty questions from basic to advanced — Inter-Service Communication Patterns. Read every option; distractors are plausible but wrong for a precise reason.",
  mcqQuestions,
  cheatsheetRows,
};
