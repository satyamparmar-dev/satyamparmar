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

const why = "**Distributed** **transactions** **without** **discipline** **become** **silent** **data** **corruption** **stories** **in** **post-mortems**. **Sagas** **trade** **ACID** **illusions** for **explicit** **compensation** **paths** you can **test**, **observe**, and **audit**.\n\nInterviewers want **you** **to** **explain** **forward** **steps**, **compensating** **steps**, **failure** **ordering**, and **why** **2PC** **does** **not** **scale** **across** **teams**.\n\nThis day connects **Day** **55** **events** **to** **money** **movements**: **inventory**, **payments**, **shipping**.\n\nYou should **sound** **comfortable** **with** **partial** **failure** **and** **human** **escalation** **paths**.\n\nFinally, **idempotency** **everywhere** **is** **non-negotiable** **when** **brokers** **redeliver** **messages**.";

const pitfalls = [
  "**Compensating** **in** **wrong** **order**, **leaving** **money** **refunded** **but** **inventory** **still** **locked**.",
  "**Treating** **HTTP** **502** **as** **failure** **when** **payment** **actually** **settled**, **triggering** **wrong** **refund**.",
  "**Missing** **idempotency** **on** **refund** **API**, **double** **crediting** **customers** **during** **retries**.",
  "**No** **persistent** **saga** **state**, **so** **process** **crash** **restarts** **workflow** **from** **scratch** **duplicating** **charges**.",
  "**Choreography** **without** **correlation** **ids**, **impossible** **to** **debug** **which** **order** **instance** **failed**.",
  "**Compensation** **that** **throws** **unchecked** **exceptions** **without** **retry** **policy**, **stuck** **sagas** **forever**.",
  "**Skipping** **audit** **logs** **for** **money** **movements**, **failing** **SOC2** **reviews**.",
  "**Assuming** **cancel** **shipment** **always** **possible** **after** **carrier** **picked** **up**—**business** **rules** **differ**."
];

const exercise = {
  "title": "Exercise — Compensating payment after inventory failure (Day 56 assignment)",
  "difficulty": "Advanced",
  "problem": "Align with **Day 56 Assignment**: **Compensating payment after inventory failure**.\n\n1. Implement **`runCheckout(boolean inventoryOk)`** building a **single** **semicolon-separated** **log** **string** **exactly** as the **reference** **`main()`** prints.\n2. **Happy** **path** (`inventoryOk == true`): `reserve:OK;pay:CAPTURED;inventory:OK;ship:OK;final:DONE`\n3. **Failure** **path**: after **`pay:CAPTURED`**, **`inventory` fails**, then **`compensate:REFUND;compensate:RELEASE;final:ABORTED`**.\n4. **Deterministic** **only**—no **random** **or** **clock** **logic**.",
  "hints": [
    "**Append** **segments** **in** **order** with **`StringBuilder`**.",
    "**Branch** **only** **on** **the** **boolean** **parameter**.",
    "**Match** **reference** **string** **exactly**."
  ],
  "solution": "package arch.day56;\n\n/**\n * Day 56 assignment: compensate payment after inventory failure (toy saga log).\n */\npublic class Day56Exercise {\n\n    static String runCheckout(boolean inventoryOk) {\n        StringBuilder log = new StringBuilder();\n        log.append(\"reserve:OK;\");\n        log.append(\"pay:CAPTURED;\");\n        if (!inventoryOk) {\n            log.append(\"inventory:FAIL;\");\n            log.append(\"compensate:REFUND;\");\n            log.append(\"compensate:RELEASE;\");\n            log.append(\"final:ABORTED\");\n        } else {\n            log.append(\"inventory:OK;\");\n            log.append(\"ship:OK;\");\n            log.append(\"final:DONE\");\n        }\n        return log.toString();\n    }\n\n    public static void main(String[] args) {\n        System.out.println(\"=== Saga assignment trace ===\");\n        System.out.println(\"happy=\" + runCheckout(true));\n        System.out.println(\"fail=\" + runCheckout(false));\n    }\n}\n"
};

const cheatsheetRows = [
  [
    "Saga",
    "Local TX + compensate",
    "No global 2PC"
  ],
  [
    "Orchestration",
    "Coordinator",
    "Easier ops traces"
  ],
  [
    "Choreography",
    "Domain events",
    "Needs correlation id"
  ],
  [
    "Compensation",
    "Semantic undo",
    "Not always DELETE row"
  ],
  [
    "Idempotency",
    "All steps",
    "Survives redelivery"
  ],
  [
    "Pivot step",
    "Business commit point",
    "Defines when forward-only"
  ],
  [
    "Audit",
    "Append-only money log",
    "Compliance requirement"
  ],
  [
    "Timeout",
    "Per step",
    "Retry vs compensate decision"
  ],
  [
    "Outbox",
    "Reliable events",
    "Feeds saga transitions"
  ],
  [
    "Testing",
    "Inject failures",
    "State machine coverage"
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
  title: "Saga Pattern & Distributed Transactions",
  tags: ["Mid-Level","Advanced","Phase 6","Interview Prep","Satyverse(Satyam Parmar)","Saga","transactions"],
  prerequisites: ["Day 55","Day 54"],
  learningObjectives: ["Explain why **two-phase** **commit** **scales** **poorly** and how **Sagas** **trade** **strong** **consistency** for **business** **workflows**","Design **forward** and **compensating** **steps** for **checkout** **flows** with **explicit** **ordering** **rules**","Compare **orchestrated** and **choreographed** **Sagas** using **debuggability** and **team** **autonomy** **criteria**","Apply **idempotency** **to** **payments** **and** **refunds** **when** **brokers** **or** **clients** **retry**","Persist **saga** **instance** **state** **for** **crash** **recovery** and **support** **tooling**","Relate **transactional** **outbox** **events** to **saga** **transitions** **and** **audit** **requirements**"],
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
  mcqLabel: "Saga Pattern & Distributed Transactions",
  mcqDescription: "Thirty questions from basic to advanced — Saga Pattern & Distributed Transactions. Read every option; distractors are plausible but wrong for a precise reason.",
  mcqQuestions,
  cheatsheetRows,
};
