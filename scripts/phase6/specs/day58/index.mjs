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

const why = "**Legacy** **systems** **pay** **the** **bills** **but** **block** **velocity**. The **Strangler** **Fig** **pattern** **is** **how** **adults** **migrate** **without** **betting** **the** **company** **on** **a** **big** **bang**. **ACLs** **keep** **your** **new** **domain** **model** **clean** **when** **the** **old** **world** **is** **messy**.\n\nInterviewers **listen** **for** **traffic** **shaping**, **data** **reconciliation**, **rollback** **plans**, and **honest** **trade-offs** **about** **dual** **write** **pain**.\n\nThis **day** **caps** **Phase** **6** **microservices** **topics** **before** **messaging** **deep** **dives** **in** **Phase** **7**.\n\nYou **should** **connect** **strangler** **milestones** **to** **business** **KPIs**, **not** **only** **engineering** **tasks**.\n\nFinally, **governance** **of** **feature** **flags** **and** **observability** **parity** **separates** **successful** **migrations** **from** **fire** **drills**.";

const pitfalls = [
  "**Big** **bang** **cutover** **without** **canary** **or** **rollback** **flag**, **causing** **multi-hour** **outages**.",
  "**Translating** **legacy** **errors** **into** **domain** **exceptions** **without** **mapping** **table**, **breaking** **client** **contracts**.",
  "**Dual** **write** **without** **reconciliation** **job**, **diverging** **inventory** **counts** **silently**.",
  "**Copy-pasting** **legacy** **field** **names** **into** **new** **database** **schema**, **cementing** **corruption** **forever**.",
  "**Feature** **flags** **sprawl** **without** **ownership**, **leaving** **mystery** **toggles** **nobody** **dares** **remove**.",
  "**ACL** **that** **grows** **into** **god** **service** **with** **all** **domains** **mixed** **together**.",
  "**Ignoring** **session** **affinity** **during** **split**, **random** **401s** **for** **users**.",
  "**Decommissioning** **legacy** **before** **archiving** **audit** **data**, **violating** **retention** **policy**."
];

const exercise = {
  "title": "Exercise — Strangler migration and anti-corruption layer (Day 58 assignment)",
  "difficulty": "Advanced",
  "problem": "Align with **Day 58 Assignment**: **Strangler migration and anti-corruption layer**.\n\n1. Implement **`chooseBackend(String path, int userBucket)`** with **rules**: paths **starting** **`/v2/`** → **`NEW`**; paths **`/legacy/`** with **`userBucket < 20`** → **`NEW`**; **else** **`LEGACY`**.\n2. Implement **`aclTranslate(String legacyStatus)`**: **`OLD_OPEN`** → **`ShipmentOpen`**, **`OLD_CLOSED`** → **`ShipmentClosed`**, **else** **`ShipmentUnknown`**.\n3. **`main()`** prints **five** **lines** **exactly** as the **reference** output **(header** **+** **four** **cases**).\n4. **Deterministic** **only**.",
  "hints": [
    "Use **`String.startsWith`** for **path** **rules**.",
    "Compare **bucket** **with** **20** **for** **canary** **slice**.",
    "Match **output** **strings** **verbatim**."
  ],
  "solution": "package arch.day58;\n\nimport java.util.*;\n\n/**\n * Day 58 assignment: strangler routing + ACL decision (deterministic).\n */\npublic class Day58Exercise {\n\n    static String chooseBackend(String path, int userBucket) {\n        if (path.startsWith(\"/v2/\")) {\n            return \"NEW\";\n        }\n        if (path.startsWith(\"/legacy/\") && userBucket < 20) {\n            return \"NEW\";\n        }\n        return \"LEGACY\";\n    }\n\n    static String aclTranslate(String legacyStatus) {\n        if (\"OLD_OPEN\".equals(legacyStatus)) {\n            return \"ShipmentOpen\";\n        }\n        if (\"OLD_CLOSED\".equals(legacyStatus)) {\n            return \"ShipmentClosed\";\n        }\n        return \"ShipmentUnknown\";\n    }\n\n    public static void main(String[] args) {\n        System.out.println(\"=== Strangler + ACL assignment ===\");\n        System.out.println(\"path=/v2/orders b=5 -> \" + chooseBackend(\"/v2/orders\", 5));\n        System.out.println(\"path=/legacy/orders b=10 -> \" + chooseBackend(\"/legacy/orders\", 10));\n        System.out.println(\"path=/legacy/orders b=50 -> \" + chooseBackend(\"/legacy/orders\", 50));\n        System.out.println(\"ACL OLD_OPEN -> \" + aclTranslate(\"OLD_OPEN\"));\n        System.out.println(\"ACL UNKNOWN -> \" + aclTranslate(\"WEIRD\"));\n    }\n}\n"
};

const cheatsheetRows = [
  [
    "Strangler",
    "Slice by route",
    "Canary with metrics"
  ],
  [
    "ACL",
    "Translate only",
    "Stop legacy nouns leaking"
  ],
  [
    "Feature flag",
    "Owned + TTL",
    "Remove after migration"
  ],
  [
    "Dual write",
    "Reconcile",
    "Detect drift early"
  ],
  [
    "CDC",
    "Log-based",
    "Decouple from legacy code"
  ],
  [
    "Gateway",
    "Weighted routes",
    "Roll back with config"
  ],
  [
    "Contract test",
    "Golden legacy payloads",
    "ACL safe refactors"
  ],
  [
    "Session",
    "Sticky or JWT",
    "Avoid random logouts"
  ],
  [
    "Decommission",
    "Zero traffic + archive",
    "Legal retention satisfied"
  ],
  [
    "ADR",
    "Document trade-offs",
    "Future teams understand why"
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
  title: "Advanced Microservices Patterns",
  tags: ["Mid-Level","Advanced","Phase 6","Interview Prep","Satyverse(Satyam Parmar)","Strangler","ACL"],
  prerequisites: ["Day 57","Day 56"],
  learningObjectives: ["Apply the **Strangler** **Fig** **pattern** with **routing**, **canaries**, and **rollback** **plans**","Design an **Anti-Corruption** **Layer** that **maps** **legacy** **models** **to** **your** **domain**","Compare **dual** **write**, **CDC**, and **ACL-backed** **APIs** **for** **data** **migration** **trade-offs**","Instrument **traffic** **splits** **and** **business** **KPI** **parity** **during** **modernization**","Govern **feature** **flags** **and** **decommission** **criteria** **so** **migrations** **actually** **finish**","Align **security** **and** **compliance** **(audit**, **secrets**)** **across** **old** **and** **new** **stacks**"],
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
  mcqLabel: "Advanced Microservices Patterns",
  mcqDescription: "Thirty questions from basic to advanced — Advanced Microservices Patterns. Read every option; distractors are plausible but wrong for a precise reason.",
  mcqQuestions,
  cheatsheetRows,
};
