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

const why = "Outbound HTTP is where **microservices** lose **SLOs**: a **small** **timeout** mistake or **retry** policy turns a **blip** into a **company-wide** **outage**. **Feign** and **WebClient** are the **default** **Spring** tools interviewers expect you to **reason** about with **Resilience4j** **patterns**, not just **annotations**.\n\n**Strong** answers connect **declarative** clients to **load balancing**, **observability**, and **failure** **containment**. Weak answers stop at \"I added **@FeignClient**\" without **timeouts**, **retries**, or **idempotency** **thinking**.\n\nThis day focuses on **client-side** **resilience**: **circuit** **breakers**, **bulkheads**, **retries** with **jitter**, and **graceful** **degradation**—each with **measurable** **trade-offs** in **latency** and **correctness**.\n\nProduction **post-mortems** often cite **retry** **storms**, **thread** **pool** **exhaustion**, and **half-open** **circuits** stuck **open** after **misconfigured** **exceptions**. You should sound like you have read those **reports**.\n\nFinally, **align** **timeouts** across **layers** and **test** **assumptions** with **chaos** **experiments** so **dashboards** match **reality** when **dependencies** **slow** **down**.";

const pitfalls = [
  "Setting **infinite** **timeouts** on **Feign** so **threads** **pile** up during **upstream** **stalls**, hiding **problems** until **GC** **pauses** **kill** **the** **JVM**.",
  "Enabling **retry** on **POST** **payments** without **`Idempotency-Key`** or **server** **dedup**, **duplicating** **charges** after **ambiguous** **timeouts**.",
  "Using **`WebClient.block()`** on **reactor** **event-loop** **threads**, **serializing** **thousands** of **requests** behind **one** **slow** **dependency**.",
  "Configuring **circuit** **breakers** with **minimum** **calls** **too** **high** for **low** **QPS** **services**, so **breakers** **never** **open** during **real** **outages**.",
  "Sharing **one** **giant** **thread** **pool** for **all** **Feign** **clients** so **one** **noisy** **neighbor** **blocks** **unrelated** **outbound** **calls**.",
  "Ignoring **`Retry-After`** on **429** responses and **hammering** **partners** until **they** **ban** **your** **traffic**.",
  "Logging **full** **`Authorization`** **headers** when **debugging** **Feign**, **leaking** **bearer** **tokens** into **central** **logs**.",
  "Treating **fallback** methods as **free**—implementing **heavy** **blocking** **work** there **recreates** **the** **outage** **inside** **your** **service**."
];

const exercise = {
  "title": "Exercise — Circuit breaker around slow dependency (Day 53 assignment)",
  "difficulty": "Advanced",
  "problem": "Align with **Day 53 Assignment**: **Circuit breaker around slow dependency**.\n\n1. Simulate a **dependency** that returns **`false`** for the **first three** invocations and **`true`** afterward (warm-up).\n2. Implement a **circuit breaker** with **`FAILURE_THRESHOLD = 3`**: after **three** consecutive **logical** failures, enter **OPEN** and **short-circuit** further calls with a clear message.\n3. While **CLOSED**, each failed dependency call counts toward the threshold; a **success** resets consecutive failures.\n4. In **`main()`**, print **at least six** labeled lines showing: failures opening the circuit, **short-circuit** behavior, then a **manual** transition to **HALF_OPEN** (reset state in code), and a **successful** **probe**.\n5. Use **only** **deterministic** logic—**no** **`Math.random`**, **`UUID`**, **`System.currentTimeMillis`**, or **`hashCode`** for decisions.",
  "hints": [
    "Track **`consecutiveFailures`** separately from **total** **dependency** **calls**.",
    "When **OPEN**, skip calling the dependency and print **`SHORT_CIRCUIT`**.",
    "Add a **`halfOpenProbe()`** helper that sets state and rewinds counters for the demo."
  ],
  "solution": "package arch.day53;\n\n/**\n * Tiny CB + dependency simulation (deterministic).\n * resilience4j.circuitbreaker naming mirrored in println labels only.\n */\npublic class Day53Exercise {\n\n    enum State { CLOSED, OPEN, HALF_OPEN }\n\n    static final int FAILURE_THRESHOLD = 3;\n    static int consecutiveFailures;\n    static State state = State.CLOSED;\n    static int depCalls;\n\n    static boolean slowDependency() {\n        depCalls++;\n        return depCalls >= 4;\n    }\n\n    static String invoke() {\n        if (state == State.OPEN) {\n            return \"SHORT_CIRCUIT\";\n        }\n        boolean ok = slowDependency();\n        if (!ok) {\n            consecutiveFailures++;\n            if (consecutiveFailures >= FAILURE_THRESHOLD) {\n                state = State.OPEN;\n            }\n            return \"FAIL\";\n        }\n        consecutiveFailures = 0;\n        state = State.CLOSED;\n        return \"OK\";\n    }\n\n    static void halfOpenProbe() {\n        state = State.HALF_OPEN;\n        consecutiveFailures = 0;\n        depCalls = 3;\n    }\n\n    public static void main(String[] args) {\n        System.out.println(\"=== Circuit breaker walkthrough ===\");\n        for (int i = 0; i < 5; i++) {\n            System.out.println(\"call \" + (i + 1) + \": \" + invoke());\n        }\n        System.out.println(\"--- admin: move to HALF_OPEN probe ---\");\n        halfOpenProbe();\n        System.out.println(\"probe: \" + invoke());\n        System.out.println(\"next: \" + invoke());\n    }\n}\n"
};

const cheatsheetRows = [
  [
    "OpenFeign",
    "Declarative HTTP + LB",
    "Contract tests catch breaks early"
  ],
  [
    "WebClient",
    "Reactive Netty client",
    "Never block on event-loop threads"
  ],
  [
    "Circuit breaker",
    "Sliding window + half-open",
    "Tune minimum calls for low QPS"
  ],
  [
    "Retry",
    "Backoff + jitter",
    "POST needs idempotency keys"
  ],
  [
    "Bulkhead",
    "Concurrency cap per dep",
    "Prevents total thread starvation"
  ],
  [
    "Timeouts",
    "Nest inner < outer",
    "Stops orphan work at layers"
  ],
  [
    "ErrorDecoder",
    "Map status → typed errors",
    "Enables business-level handling"
  ],
  [
    "Observability",
    "Micrometer + trace headers",
    "Debug client issues like a gateway"
  ],
  [
    "TimeLimiter",
    "Bound async work",
    "Pairs with CompletableFuture APIs"
  ],
  [
    "LoadBalancer cache",
    "TTL tuning",
    "Stale instances cause mystery 503"
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
  title: "Feign, WebClient & Resilience",
  tags: ["Mid-Level","Advanced","Phase 6","Interview Prep","Satyverse(Satyam Parmar)","OpenFeign","WebClient","Resilience4j"],
  prerequisites: ["Day 52","Day 51"],
  learningObjectives: ["Compare **OpenFeign** vs **WebClient** and pick the stack that matches **servlet** vs **reactive** constraints","Configure **Resilience4j** **circuit breakers**, **retries**, and **bulkheads** with **metrics** you can defend in interviews","Explain **timeout** **nesting** across **client**, **gateway**, and **upstream** and why **misalignment** creates **orphan** work","Design **safe** **retries** for **idempotent** calls and **avoid** **duplicate** **side effects** on **POST**","Map **Feign** **ErrorDecoder** / **WebClient** filters to **typed** errors and **observability** tags","Diagnose **thread** **pool** **saturation** and **retry** **storms** using **Micrometer** and **distributed** **traces**"],
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
  mcqLabel: "Feign, WebClient & Resilience",
  mcqDescription: "Thirty questions from basic to advanced — Feign, WebClient & Resilience. Read every option; distractors are plausible but wrong for a precise reason.",
  mcqQuestions,
  cheatsheetRows,
};
