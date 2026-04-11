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

const why = "Teams ship **OpenAPI** as the contract between producers and consumers, then discover in production that the **document is fiction**: Swagger UI is public and exposes internal admin routes, generated **Feign** clients compile but call the wrong path after an `operationId` rename, or a partner integration silently breaks because the spec said `string` while the server started returning `integer` cents instead of decimal dollars. The failure is rarely 'YAML syntax' — it is **contract drift**, **unsafe documentation exposure**, and **breaking changes that passed code review** because nobody diffed the machine-readable spec against the last release.\n\nInterviewers are not grading whether you memorised every **OpenAPI 3** keyword. They want evidence that you treat the specification as **operational infrastructure**: how you keep **code, docs, and runtime** aligned, how you classify **additive vs breaking** evolution, and how you wire **linting, diffing, and consumer tests** into CI so a bad merge cannot reach production.\n\nA strong Day 50 answer is usually four beats: (1) define the **source of truth** (contract-first file in git vs code-first emission from **springdoc**), (2) explain what you validate in CI (**Spectral** rules, breaking-change diff, optional **Pact** verify), (3) describe how documentation is published safely (internal portal, auth-gated **Swagger UI**, environment-specific **servers**), and (4) connect one realistic incident — for example leaked operations or SDK breakage — to the guardrail you added.\n\nAt scale, OpenAPI is how **platform, security, and ten product teams** coordinate. A single ambiguous `operationId` becomes ten duplicated gateway routes; an undocumented `429` response means SREs cannot build accurate **SLO** dashboards from access logs; inconsistent **Problem Details** bodies fragment client error handling. Good governance is boring on purpose: one **style guide**, one **breaking-change policy**, and artefacts that downstream automation can trust.\n\nWhat separates a senior answer is **operational behaviour**: you mention **artifact storage** for pinned specs per release, **deprecation** headers mirrored in the spec (`deprecated: true` plus runtime **Sunset**), and you explicitly separate **documentation exposure** from **runtime auth** — knowing that 'Try it out' in Swagger is not a substitute for **OAuth2** enforcement at the gateway.";

const pitfalls = [
  "Treating Swagger UI as authentication — browsers can still hit documented paths if the gateway does not enforce the same OAuth2 rules as production clients, which turns documentation into an attack surface.",
  "Renaming `operationId` for readability without a major SDK bump — OpenAPI Generator and Feign derive method names from `operationId`, so a cosmetic YAML change breaks every generated client at compile time.",
  "Publishing only human Markdown while the machine-readable spec drifts — partners integrate against JSON; if the spec omits `4xx` responses or error schemas, their retries and alerting stay wrong even when prose looks fine.",
  "Skipping `servers` and examples — wrong base URL in 'Try it out' sends traffic to prod from a developer laptop, or support burns hours on invalid example payloads that never matched validation.",
  "Using unbounded `array` schemas without `maxItems` — a well-meaning client can POST a 50 MB JSON array that passes schema validation but blows heap or upstream timeouts.",
  "Ignoring nullable vs optional semantics across OpenAPI 3.0 vs 3.1 and Jackson defaults — subtle `null` vs missing field behaviour breaks Kotlin and TypeScript clients differently.",
  "Running codegen with floating generator versions — unreproducible builds when the plugin upgrades overnight and reorders model property names or package paths.",
  "Storing secrets in `openapi.yaml` examples — committed tokens leak in git history and propagate to public doc portals even after rotation."
];

const exercise = {
  "title": "Exercise - CI Gate for GET /orders/{orderId} Response Schema",
  "difficulty": "Advanced",
  "problem": "You own the **Orders** service. The team uses **springdoc-openapi** (code-first) and publishes `openapi.json` from **`/v3/api-docs`**. Product wants a CI gate that blocks accidental **breaking** changes to the **GET /orders/{orderId}** `200` response schema.\n\nRequirements:\n1. Compare **baseline** vs **candidate** snapshots described by **required fields** and a **property type map** for the `Order` schema slice (new optional properties may appear in the candidate map).\n2. Emit **CI_RESULT=FAIL** if any baseline **required** field disappears or any **property type** changes.\n3. Emit **CI_RESULT=WARN** if only **`operationId`** changes while the HTTP path and response types stay compatible (codegen drift risk).\n4. Emit **CI_RESULT=PASS** when changes are purely **additive optional** fields.\n5. Print **machine-readable REASON=** lines for every rule triggered.\n6. Document in comments how this maps to **springdoc** emission + storing a **pinned baseline** per release tag.",
  "hints": [
    "Iterate baseline type keys first — removal or type mismatch is an immediate FAIL before considering optional niceties.",
    "Evaluate WARN only after you are sure no FAIL rules fired; operationId is cosmetic for HTTP but not for generators.",
    "Mention where the baseline file would live (artifact repo, git LFS, or release asset) so replay is deterministic."
  ],
  "solution": "package arch.day50;\n\nimport java.util.*;\n\n/**\n * Exercise: CI gate for OpenAPI response schema evolution on GET /orders/{orderId} 200.\n * <p>\n * Spring production mapping:\n * - springdoc-openapi emits /v3/api-docs; pipeline downloads JSON and extracts\n *   components.schemas.Order for the 200 response of GET /orders/{orderId}.\n * - Store baseline openapi.json per release tag in artifact repo; PR job diffs candidate.\n * - Optional: Spectral ruleset + openapi-diff for full document; this class is the\n *   minimal teachable core for \"breaking vs additive\" reasoning.\n */\npublic class Day50Exercise {\n\n    enum Level { PASS, WARN, FAIL }\n\n    static final class CiVerdict {\n        final Level level;\n        final List<String> reasons;\n\n        CiVerdict(Level level, List<String> reasons) {\n            this.level = level;\n            this.reasons = reasons;\n        }\n    }\n\n    /** Compare response schema snapshots (required, optional, property types). */\n    static CiVerdict evaluate(String operationIdBase, String operationIdCand,\n                              Set<String> reqBase, Set<String> reqCand,\n                              Map<String, String> typesBase, Map<String, String> typesCand) {\n        List<String> reasons = new ArrayList<>();\n        Level worst = Level.PASS;\n\n        for (String k : typesBase.keySet()) {\n            String tb = typesBase.get(k);\n            String tc = typesCand.get(k);\n            if (tc == null) {\n                reasons.add(\"RULE-BREAK-01 removed property '\" + k + \"' from schema\");\n                worst = Level.FAIL;\n            } else if (!tb.equals(tc)) {\n                reasons.add(\"RULE-BREAK-02 type change on '\" + k + \"': \" + tb + \" -> \" + tc);\n                worst = Level.FAIL;\n            }\n        }\n        for (String r : reqBase) {\n            if (!reqCand.contains(r)) {\n                reasons.add(\"RULE-BREAK-03 required field '\" + r + \"' missing in candidate\");\n                worst = Level.FAIL;\n            }\n        }\n        if (!operationIdBase.equals(operationIdCand) && worst == Level.PASS) {\n            reasons.add(\"RULE-WARN-01 operationId changed; Feign/OpenAPI Generator method names drift\");\n            worst = Level.WARN;\n        }\n        if (reasons.isEmpty()) {\n            reasons.add(\"No breaking rules triggered; additive optional fields allowed\");\n        }\n        return new CiVerdict(worst, reasons);\n    }\n\n    static void runCase(String label, CiVerdict v) {\n        System.out.println(\"--- \" + label + \" ---\");\n        System.out.println(\"CI_RESULT=\" + v.level);\n        for (String r : v.reasons) {\n            System.out.println(\"REASON=\" + r);\n        }\n        System.out.println();\n    }\n\n    public static void main(String[] args) {\n        System.out.println(\"=== Day 50 Exercise: OpenAPI schema CI gate ===\");\n        System.out.println(\"Operation: GET /orders/{orderId} response 200 schema slices\");\n        System.out.println();\n\n        // Case 1: additive optional only -> PASS\n        Map<String, String> baseTypes = new LinkedHashMap<>();\n        baseTypes.put(\"orderId\", \"string\");\n        baseTypes.put(\"status\", \"string\");\n        Map<String, String> candTypes = new LinkedHashMap<>(baseTypes);\n        candTypes.put(\"loyaltyTier\", \"string\");\n\n        runCase(\"PR-101: add optional loyaltyTier\",\n            evaluate(\"getOrder\", \"getOrder\",\n                Set.of(\"orderId\", \"status\"), Set.of(\"orderId\", \"status\"),\n                baseTypes, candTypes));\n\n        // Case 2: removed required total -> FAIL\n        Map<String, String> b2 = new LinkedHashMap<>();\n        b2.put(\"orderId\", \"string\");\n        b2.put(\"total\", \"number\");\n        Map<String, String> c2 = new LinkedHashMap<>();\n        c2.put(\"orderId\", \"string\");\n        runCase(\"PR-102: drop total from Order\",\n            evaluate(\"getOrder\", \"getOrder\",\n                Set.of(\"orderId\", \"total\"), Set.of(\"orderId\"),\n                b2, c2));\n\n        // Case 3: same schema but operationId rename -> WARN\n        Map<String, String> b3 = Map.of(\"orderId\", \"string\");\n        runCase(\"PR-103: rename operationId only\",\n            evaluate(\"getOrder\", \"getOrderById\",\n                Set.of(\"orderId\"), Set.of(\"orderId\"),\n                b3, new LinkedHashMap<>(b3)));\n\n        System.out.println(\"=== Summary ===\");\n        System.out.println(\"FAIL blocks merge until version bump + consumer sign-off.\");\n        System.out.println(\"WARN notifies platform to regenerate internal SDK in same release train.\");\n        System.out.println(\"PASS allows merge when Spectral + Pact (if any) also green.\");\n    }\n}\n"
};

const cheatsheetRows = [
  [
    "OpenAPI role",
    "Spec is the contract for humans + machines",
    "Docs, SDKs, gateways, and tests share one schema"
  ],
  [
    "Code-first",
    "springdoc emits `/v3/api-docs` from controllers",
    "Fast delivery; add CI snapshot or Spectral to avoid drift"
  ],
  [
    "Contract-first",
    "`openapi.yaml` drives codegen",
    "Best when partners need stable multi-language clients"
  ],
  [
    "Breaking change",
    "Remove/rename/type-tighten = semver major",
    "Diff OAS in CI; pair with Pact for consumer proof"
  ],
  [
    "operationId",
    "Stable like a public Java method",
    "Renaming breaks generators even if paths stay the same"
  ],
  [
    "Swagger UI exposure",
    "Separate internal docs + auth",
    "UI is not a security boundary"
  ],
  [
    "Errors in OAS",
    "Document `problem+json` components",
    "Aligns with Spring `ProblemDetail` and client parsers"
  ],
  [
    "Spectral",
    "Opinionated lint for style + safety",
    "Enforce `operationId`, errors, examples before merge"
  ],
  [
    "GroupedOpenApi",
    "Split public vs internal bundles",
    "Publish least privilege spec to partners"
  ],
  [
    "Examples",
    "Synthetic data only",
    "Prevents secret leakage and wrong integration assumptions"
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
  title: "REST Best Practices and OpenAPI",
  tags: ["Mid-Level","Advanced","Phase 6","Interview Prep","Satyverse(Satyam Parmar)"],
  prerequisites: ["Day 49","Day 48"],
  learningObjectives: ["Treat OpenAPI as the machine-readable contract tying Spring controllers, gateways, SDKs, and consumer tests together","Compare code-first (springdoc) vs contract-first workflows and choose CI gates (Spectral, openapi-diff, Pact) appropriate to each","Classify additive vs breaking schema and metadata changes, including stable operationId and security scope evolution","Publish documentation safely: GroupedOpenApi, environment servers, and controlled Swagger UI exposure","Map Spring Boot 3 + springdoc configuration to emitted OpenAPI and ProblemDetail-aligned error documentation","Explain a realistic production incident caused by spec drift or docs exposure and the guardrails you would add"],
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
  mcqLabel: "REST Best Practices and OpenAPI",
  mcqDescription: "Thirty questions from basic to advanced — REST Best Practices and OpenAPI. Read every option; distractors are plausible but wrong for a precise reason.",
  mcqQuestions,
  cheatsheetRows,
};
