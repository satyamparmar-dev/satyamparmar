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

const why = "**gRPC** and **GraphQL** change how **teams** **negotiate** **contracts** between **services** and **clients**. Interviewers want **protocol** **choices** tied to **latency**, **evolution**, and **operational** **risk**, not **trend** **keywords**.\n\n**Mistakes** include **exposing** **raw** **gRPC** to **browsers**, **unbounded** **GraphQL** **queries**, and **breaking** **protobuf** **wires** without **detection**.\n\nStrong answers compare **REST** **edge** vs **gRPC** **internal**, and **GraphQL** **BFF** **aggregation** vs **chattiness** **costs**.\n\nYou should **name** **N+1**, **DataLoader**, **federation** **checks**, and **grpc-web** **gateways** as **tools**, not **buzzwords**.\n\nFinally, **schema** **boundaries** are **ownership** **boundaries**—**who** **approves** **breaking** **changes** matters as much as **syntax**.";

const pitfalls = [
  "Serving **unbounded** **GraphQL** **depth** to **internet** **users**, enabling **cheap** **DoS** with **deep** **nested** **queries**.",
  "Publishing **internal** **gRPC** **package** **names** and **ports** to **mobile** **apps**, **bypassing** **auth** and **WAF** **protections**.",
  "**Reusing** **protobuf** **field** **numbers** after **deprecation**, **corrupting** **wire** **compatibility** **silently**.",
  "Returning **massive** **GraphQL** **lists** without **pagination** **keys**, **OOMing** **gateway** **pods**.",
  "Treating **GraphQL** **`errors`** as **optional** **niceties** while **partial** **data** **breaks** **invariants**.",
  "Running **gRPC** **without** **deadlines**, letting **cascading** **queues** **stall** **the** **mesh**.",
  "**Federated** **subgraphs** **deploying** **without** **composition** **checks**, **breaking** **supergraph** **at** **runtime**.",
  "Using **GraphQL** **mutations** for **long** **running** **jobs** without **async** **task** **pattern**, **timing** **out** **clients**."
];

const exercise = {
  "title": "Exercise — Protocol choices and schema boundaries (Day 54 assignment)",
  "difficulty": "Advanced",
  "problem": "Align with **Day 54 Assignment**: **Protocol choices and schema boundaries**.\n\n1. Implement **`protocolForUseCase(String)`** returning a **fixed** string for each of: **`public-mobile-read`**, **`service-stream`**, **`partner-webhook-callback`**, **`high-throughput-internal-rpc`** (use the **exact** strings shown in the reference **`main()`** output).\n2. Implement **`boundary(String consumer, String producer)`** returning **`ACL-DTO-required`** when teams differ, else **`shared-schema-ok`**.\n3. **`main()`** prints a **header**, **four** protocol lines, a **blank** line, then **two** boundary lines (**orders→payments**, **billing→billing**) **exactly** as in the model output.\n4. **No** randomness, **`UUID`**, **`currentTimeMillis`**, or **`hashCode`** decisions.",
  "hints": [
    "Use **`switch` expressions** or **`Map`** for the **use-case** table.",
    "Compare **consumer** and **producer** with **`String.equals`**.",
    "Match **reference** output **verbatim** for autograding-style checks."
  ],
  "solution": "package arch.day54;\n\nimport java.util.*;\n\n/**\n * Day 54 assignment: protocol choice + schema boundary table (deterministic).\n */\npublic class Day54Exercise {\n\n    static String protocolForUseCase(String uc) {\n        return switch (uc) {\n            case \"public-mobile-read\" -> \"GraphQL-or-REST-edge\";\n            case \"service-stream\" -> \"gRPC-stream-internal\";\n            case \"partner-webhook-callback\" -> \"REST-JSON-signed\";\n            case \"high-throughput-internal-rpc\" -> \"gRPC-unary\";\n            default -> \"undecided\";\n        };\n    }\n\n    static String boundary(String consumer, String producer) {\n        if (!consumer.equals(producer)) {\n            return \"ACL-DTO-required\";\n        }\n        return \"shared-schema-ok\";\n    }\n\n    public static void main(String[] args) {\n        System.out.println(\"=== Day 54: protocol choices & schema boundaries ===\\n\");\n        for (String uc : List.of(\"public-mobile-read\", \"service-stream\", \"partner-webhook-callback\", \"high-throughput-internal-rpc\")) {\n            System.out.println(uc + \" -> \" + protocolForUseCase(uc));\n        }\n        System.out.println();\n        System.out.println(\"orders->payments boundary: \" + boundary(\"orders\", \"payments\"));\n        System.out.println(\"billing->billing boundary: \" + boundary(\"billing\", \"billing\"));\n    }\n}\n"
};

const cheatsheetRows = [
  [
    "gRPC",
    "Protobuf + HTTP/2",
    "Internal RPC default for JVM fleets"
  ],
  [
    "GraphQL",
    "Schema + resolvers",
    "Add complexity + depth limits"
  ],
  [
    "N+1",
    "Per-row fetches",
    "DataLoader batch per request"
  ],
  [
    "Federation",
    "Subgraphs + gateway",
    "CI composition checks mandatory"
  ],
  [
    "Evolution",
    "Field numbers sacred",
    "Buf breaking checks on main"
  ],
  [
    "grpc-web",
    "Envoy/gateway",
    "Browsers need translation layer"
  ],
  [
    "Errors",
    "gRPC status / GraphQL errors",
    "Partial data still needs authz"
  ],
  [
    "Deadlines",
    "Propagate metadata",
    "Stops silent queue growth"
  ],
  [
    "REST edge",
    "Cache semantics",
    "Still king for public JSON"
  ],
  [
    "ACL",
    "Anti-corruption DTO",
    "Cross-team protobuf needs translation"
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
  title: "gRPC & GraphQL",
  tags: ["Mid-Level","Advanced","Phase 6","Interview Prep","Satyverse(Satyam Parmar)","gRPC","GraphQL"],
  prerequisites: ["Day 53","Day 52"],
  learningObjectives: ["Contrast **gRPC** **protobuf** contracts with **REST** **JSON** for **edge** vs **internal** traffic","Explain **GraphQL** **N+1** and how **DataLoader** **batching** protects **database** **capacity**","Describe **schema** **evolution** for **protobuf** **field** **numbers** and **GraphQL** **deprecations**","Compare **GraphQL** **federation** **governance** with **monolithic** **schema** **ownership**","Map **gRPC** **deadlines** and **status** **codes** to **client** **retry** **policies**","Choose **protocols** using **latency**, **tooling**, **security**, and **team** **boundary** **criteria**"],
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
  mcqLabel: "gRPC & GraphQL",
  mcqDescription: "Thirty questions from basic to advanced — gRPC & GraphQL. Read every option; distractors are plausible but wrong for a precise reason.",
  mcqQuestions,
  cheatsheetRows,
};
