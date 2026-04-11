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

const why = "People often sell microservices as “scale.” In real systems, they change how teams **own data** and how **money and orders stay correct** when the network is slow or a service is down. If you split services but still use **one shared database**, share JPA entities across “areas,” or chain many **blocking HTTP calls** for a single button, you do not get independence. You get a **distributed monolith**: releases still block each other, but failures are **partial**, retries can **double-charge** or **double-ship**, and on-call needs many tools to see the full story.\n\nInterviewers usually do not want book quotes. They want to hear **where you draw lines**, **who owns which rules**, and **what happens when a call fails or runs twice**. Good answers use simple words for hard topics: same word (“total,” “account”) can mean different things in billing vs CRM; **aggregates** match “what must stay consistent in one commit”; **context map** means “how teams depend on each other.”\n\nA strong answer often has four simple parts: (1) name the **business area** and the words experts use for it, (2) say what must stay **consistent in one transaction** vs what can catch up later, (3) give **one real failure** from messy boundaries (duplicates, rounding fights, migration fights), (4) give a **fix** people can operate (dedup keys, outbox, one owner for tax rules, module rules in the build).\n\nAt company scale, this matters because “more services” means **more choices about blast radius**. True independent deploys need **clear data ownership**, **clear SLOs**, and teams that match the architecture. DDD is a shared language for talking with product: what is **core** to the business, what is **supporting**, which team leads a model, and where **eventual consistency** is acceptable if you say it out loud.\n\nSenior answers sound operational in plain English: **timeouts** so threads do not hang forever, **idempotency** so retries are safe, **at-least-once messaging** so consumers must handle duplicates, **projection lag** so search is slightly behind writes, and **tracing** so async bugs are visible — not “clean code” alone.";

const pitfalls = [
  "Splitting by technical layer (only “database service”) instead of by business area — you still need every layer for each feature, but now with network calls in the middle.",
  "Keeping one shared database “to go faster” — teams step on each other’s schema changes and true independent releases are almost impossible.",
  "Treating a long chain of REST calls like one database transaction — partial failures leave half-finished business steps unless you design sagas, undo steps, and idempotency.",
  "Sending events without an outbox — the row saves but the message never leaves, or the message sends twice, so other systems drift or duplicate work.",
  "Using the same English word in two services for different meanings — tests look fine until finance reconciliation or customer support finds silent mismatches.",
  "Exposing internal database ids and entities to other teams’ code — everyone couples to your schema, and simple refactors break other services.",
  "Making one “aggregate” enormous so every small action locks too much data — slow responses and deadlocks show up under real load.",
  "Ignoring traces and lag metrics for async flows — duplicate messages and stuck workflows look random until you add dashboards and alerts."
];

const exercise = {
  "title": "Exercise — Checkout boundaries without one shared database",
  "difficulty": "Advanced",
  "problem": "You are breaking a monolith checkout into separate areas owned by different teams: **Orders**, **Inventory**, **Payments**, **Notifications**.\n\nWrite an architecture-first answer (prose is fine; code is optional).\n\n1. Name **three business areas** (bounded contexts) and one **language risk** for each (same word, different meaning).\n2. Say which steps should be **synchronous** (user waits) vs **async** (can finish shortly after), and give a **simple reason** for each choice.\n3. Explain how the **order** keeps its own rules **without** calling another team’s JPA repository directly.\n4. Describe **idempotency** for handling **PaymentCaptured** twice from the message bus.\n5. Name **one metric or alert** you would use to catch **slow background steps** or **stuck workflows**.\n\nGoal: show clear boundaries, not a perfect diagram.",
  "hints": [
    "If totals must not change after submit, decide **one owner** for price/tax and store **frozen numbers** on the order.",
    "Model checkout as **steps with states** (draft, submitted, paid) instead of one giant method.",
    "Build dedup keys from **business ids** (order id + payment ref), not from Kafka offset numbers."
  ],
  "solution": "package arch.day51;\n\nimport java.util.*;\n\n/**\n * Small runnable sketch: order aggregate, two \"ports,\" payment dedup.\n * Comments use plain language on purpose.\n */\npublic class Day51Exercise {\n\n    interface InventoryPort {\n        boolean reserve(String sku, int qty);\n    }\n\n    interface PaymentGatewayPort {\n        String capture(String orderId, int amountMinor);\n    }\n\n    static final class StubInventory implements InventoryPort {\n        public boolean reserve(String sku, int qty) {\n            return qty > 0 && sku.startsWith(\"SKU-\");\n        }\n    }\n\n    static final class StubPay implements PaymentGatewayPort {\n        public String capture(String orderId, int amountMinor) {\n            return \"pay-\" + orderId + \"-\" + amountMinor;\n        }\n    }\n\n    static final class OrderAggregate {\n        private final String id;\n        private final List<String> lines = new ArrayList<>();\n        private String status = \"DRAFT\";\n        private int totalMinor = 0;\n\n        OrderAggregate(String id) {\n            this.id = id;\n        }\n\n        void addLine(String sku, int qty, int unitMinor) {\n            if (qty <= 0 || unitMinor <= 0) {\n                throw new IllegalArgumentException(\"invalid line\");\n            }\n            lines.add(sku + \"x\" + qty);\n            totalMinor += qty * unitMinor;\n        }\n\n        void submit(InventoryPort inventory) {\n            if (lines.isEmpty()) {\n                throw new IllegalStateException(\"empty\");\n            }\n            if (!inventory.reserve(\"SKU-DEMO\", 1)) {\n                throw new IllegalStateException(\"inventory unavailable\");\n            }\n            status = \"SUBMITTED\";\n        }\n\n        String pay(PaymentGatewayPort pay) {\n            if (!\"SUBMITTED\".equals(status)) {\n                throw new IllegalStateException(\"wrong state\");\n            }\n            String ref = pay.capture(id, totalMinor);\n            status = \"PAID\";\n            return ref;\n        }\n\n        String status() {\n            return status;\n        }\n    }\n\n    // In production: store keys in DB with a unique index — not only in memory.\n    static String handlePaymentCaptured(String dedupKey,\n                                        String orderId,\n                                        Set<String> processedKeys) {\n        if (processedKeys.contains(dedupKey)) {\n            return \"DUPLICATE_IGNORED\";\n        }\n        processedKeys.add(dedupKey);\n        return \"LEDGER_UPDATED:\" + orderId;\n    }\n\n    public static void main(String[] args) {\n        StubInventory inv = new StubInventory();\n        StubPay pay = new StubPay();\n        OrderAggregate order = new OrderAggregate(\"ord-ex-1\");\n        order.addLine(\"SKU-DEMO\", 1, 500);\n        order.submit(inv);\n        String ref = order.pay(pay);\n        System.out.println(\"orderStatus=\" + order.status() + \" paymentRef=\" + ref);\n\n        Set<String> keys = new HashSet<>();\n        String businessDedup = \"ord-ex-1:capture\";\n        System.out.println(handlePaymentCaptured(businessDedup, \"ord-ex-1\", keys));\n        System.out.println(handlePaymentCaptured(businessDedup, \"ord-ex-1\", keys));\n\n        System.out.println(\"metric: saga_stage_latency_ms{stage=CAPTURE} p99 + DLQ depth\");\n    }\n}\n"
};

const cheatsheetRows = [
  [
    "Bounded context",
    "One area, one meaning per word",
    "Draw lines around language and data ownership"
  ],
  [
    "Aggregate",
    "One door for changes; one transaction focus",
    "Keep commits small; use events across areas"
  ],
  [
    "Ubiquitous language",
    "Same words in code and meetings",
    "Drift shows up as money and support bugs"
  ],
  [
    "Context map",
    "Who leads; who translates",
    "Name relationships, not only HTTP routes"
  ],
  [
    "Microservices",
    "Split when independence is worth cost",
    "Buy team speed; pay ops and network tax"
  ],
  [
    "Modular monolith",
    "Modules first, services later",
    "Prove boundaries before splitting deploys"
  ],
  [
    "Domain event",
    "Past fact after a change",
    "Outbox keeps DB and messages aligned"
  ],
  [
    "ACL",
    "Translator at the edge",
    "Keep vendor shapes out of core entities"
  ],
  [
    "CQRS",
    "Split read and write when reads hurt",
    "Accept small staleness; measure lag"
  ],
  [
    "Saga",
    "Multi-step flow with undo steps",
    "Replace fantasy distributed transactions"
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
  title: "Microservices Principles & DDD",
  tags: ["Mid-Level","Advanced","Phase 6","Interview Prep","Satyverse(Satyam Parmar)"],
  prerequisites: ["Day 50","Day 49"],
  learningObjectives: ["Tell **strategic DDD** (where to draw lines between areas of the business) apart from **tactical DDD** (how to code aggregates, events, and value objects) and link both to service boundaries","Explain why **one database per service** (as a goal) and **clear APIs or events between teams** help you avoid a **distributed monolith** that is still impossible to release independently","Describe the **aggregate** as a safe place for one database transaction, and choose **sync calls** vs **async messages** based on user wait time, downtime risk, and how much delay the business accepts","Use plain-language ideas behind **anti-corruption layer**, **published language**, and **customer–supplier** when talking about integrations with legacy or vendor systems","Map ideas to Java/Spring in simple terms: keep domains in separate modules, do not share JPA entities across areas, and use an **outbox** so “save order” and “publish event” succeed or fail together","Tell interview stories with **one concrete failure** (duplicates, rounding mismatch, shared DB pain) and **one clear fix you can measure** (dedup table, single owner for tax rules, migration plan)"],
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
  mcqLabel: "Microservices Principles & DDD",
  mcqDescription: "Thirty questions from basic to advanced — Microservices Principles & DDD. Read every option; distractors are plausible but wrong for a precise reason.",
  mcqQuestions,
  cheatsheetRows,
};
