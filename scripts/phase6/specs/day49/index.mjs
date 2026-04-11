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

const why = "REST API design is where vague product requirements become a **contract** that mobile apps, BFFs, partners, and internal services depend on for years. Interviewers are rarely testing whether you memorized every line of RFC 9110 — they are testing whether you can **prevent the failure modes that show up in post-mortems**.\n\nTypical incidents: **double charges** because `POST /payments` was retried without idempotency; **broken caches** because the API returned `200 OK` with an error payload; **retry storms** after ambiguous `5xx` without `Retry-After`; **pagination** that works on page 1 but times out at offset 50,000; **silent consumer breakage** when response shapes change without a version or contract tests.\n\nWhen you explain REST well, you tie **resource layout and HTTP semantics** to **operational behavior**: what proxies may cache, what clients may safely retry, and how errors map to remediation (fix the payload vs refresh auth vs exponential backoff). That is the gap between a textbook answer and one that sounds like you have **shipped** APIs.\n\nA strong Day 49 answer usually does four things: (1) state what **problem boundary** the API solves for the domain, (2) justify **URLs + verbs + status codes** for that boundary, (3) name **one realistic incident** caused by a bad contract choice, (4) describe **mitigation** — idempotency store, RFC 7807-style errors, ETags, keyset pagination, explicit versioning, OpenAPI + consumer tests in CI.";

const pitfalls = [
  "Using GET for state-changing operations — breaks caching, prefetch, and safe-retry assumptions. Monitoring pings and CDN crawlers may trigger unintended mutations.",
  "Returning HTTP 200 with an error JSON body — intermediaries, APM tools, and generic clients cannot classify the call as failed. Alarms, dashboards, and retry logic all break silently.",
  "Deep offset pagination on large tables without a keyset alternative — `OFFSET 50000` forces the database to scan and discard rows; latency grows linearly and the result set shifts as rows are inserted/deleted.",
  "Treating 401 and 403 as interchangeable — 401 means 'provide credentials'; 403 means 'credentials rejected'. Confusing them breaks auth UX, security audits, and automated client retry decisions.",
  "POST for payments or inventory without Idempotency-Key — duplicate side effects when clients or API gateways retry on timeout. One network hiccup becomes two charges.",
  "Changing response shapes without versioning or consumer contract tests — removing a field, renaming a property, or changing a type silently breaks every consumer. CI never catches it because the producer's tests pass.",
  "Using sequential integer IDs in public URLs — enables enumeration attacks (`/orders/1`, `/orders/2`, ...) and couples your API contract to DB auto-increment. Prefer UUID or ULID.",
  "Ignoring `Retry-After` on 429 and 503 — clients that do not receive a retry hint will hammer the service with exponential backoff anyway, or worse, with fixed short intervals. Always signal when to retry."
];

const exercise = {
  "title": "Exercise - Design POST /orders for an Unreliable Network",
  "difficulty": "Advanced",
  "problem": "Design **POST /orders** for a partner-facing API over **unreliable networks** (timeouts and retries are normal).\n\nRequirements:\n1. Specify which **HTTP status codes** you return for: created, validation error, auth failure, business conflict, and duplicate retry.\n2. Describe how **`Idempotency-Key`** is validated and what you store server-side (TTL, scope).\n3. Explain what the client receives on a **duplicate** POST with the same key after a successful first call.\n4. Name **one trade-off** (e.g. dedup storage vs replay window).\n5. Optional: map one response to **Spring** (`ResponseEntity`, `ProblemDetail`).\n\nYou may answer in structured prose and short Java/pseudocode in comments — the goal is API semantics, not a large codebase.",
  "hints": [
    "Pair 201 + Location with create; use 409 or 422 consistently for your domain rules.",
    "Document that retries must reuse the same Idempotency-Key for the same logical operation.",
    "Mention correlation/trace id in error responses for operations."
  ],
  "solution": "package arch.day49;\n\nimport java.util.*;\n\n/**\n * Exercise solution: POST /orders with full idempotency, validation,\n * auth check, and RFC 7807 error format.\n *\n * In a real Spring app:\n *   @PostMapping(\"/orders\")\n *   ResponseEntity<Order> create(\n *       @RequestHeader(\"Idempotency-Key\") String key,\n *       @Valid @RequestBody CreateOrderRequest req,\n *       @AuthenticationPrincipal User user)\n */\npublic class Day49Exercise {\n\n    // Server-side store: idempotencyKey -> [statusCode, body, locationHeader]\n    // Production: Redis hash with SETNX + EXPIRE 86400, scoped to (userId, key)\n    static final Map<String, String[]> store = new HashMap<>();\n    static int seq = 1000;\n\n    static String[] postOrder(String key, String customerId,\n                              List<String> items, double total) {\n        // ── 1. Dedup check — replay without re-running side effects ──\n        if (store.containsKey(key)) {\n            System.out.println(\"  [REPLAY] key=\" + key);\n            return store.get(key);\n        }\n\n        // ── 2. Auth check — 401 if missing, 403 if wrong role ──────────\n        if (customerId == null || customerId.isBlank()) {\n            return new String[]{\"401\",\n                \"{\\\"type\\\":\\\"unauthorized\\\",\\\"status\\\":401,\\\"detail\\\":\\\"Bearer token required\\\"}\",\n                null};\n        }\n\n        // ── 3. Validate payload — 422 for business rule violations ─────\n        if (items == null || items.isEmpty()) {\n            return new String[]{\"422\",\n                problem(\"validation-error\", \"Order must contain at least one item\", \"/orders\"),\n                null};\n        }\n        if (total <= 0) {\n            return new String[]{\"422\",\n                problem(\"validation-error\", \"Total must be positive, got: \" + total, \"/orders\"),\n                null};\n        }\n        if (items.size() > 10) {\n            return new String[]{\"422\",\n                problem(\"max-items-exceeded\",\n                    \"Max 10 items per order; received \" + items.size(), \"/orders\"),\n                null};\n        }\n\n        // ── 4. Create order (DB insert + event publish) ─────────────────\n        String orderId = \"ord-\" + (++seq);\n        String body = String.format(\n            \"{\\\"orderId\\\":\\\"%s\\\",\\\"status\\\":\\\"PENDING\\\",\\\"total\\\":%.2f}\",\n            orderId, total);\n        String location = \"/orders/\" + orderId;\n\n        // ── 5. Cache response for TTL replay ────────────────────────────\n        // Trade-off: longer TTL = larger Redis footprint but safer retry window\n        String[] resp = {\"201\", body, location};\n        store.put(key, resp);\n        System.out.println(\"  [NEW] orderId=\" + orderId);\n        return resp;\n    }\n\n    static String problem(String type, String detail, String instance) {\n        // RFC 7807 — Spring 6: ProblemDetail.forStatusAndDetail(status, detail)\n        return String.format(\n            \"{\\\"type\\\":\\\"https://api.example.com/problems/%s\\\",\"\n            + \"\\\"status\\\":422,\\\"detail\\\":\\\"%s\\\",\\\"instance\\\":\\\"%s\\\"}\",\n            type, detail, instance);\n    }\n\n    static void call(String label, String key, String cust,\n                     List<String> items, double total) {\n        System.out.println(\"--- \" + label + \" ---\");\n        String[] r = postOrder(key, cust, items, total);\n        System.out.println(\"  HTTP \" + r[0]);\n        System.out.println(\"  Body     : \" + r[1]);\n        if (r[2] != null) System.out.println(\"  Location : \" + r[2]);\n        System.out.println();\n    }\n\n    public static void main(String[] args) {\n        System.out.println(\"=== POST /orders — Exercise Solution ===\\n\");\n\n        call(\"Case 1: Valid new order\",\n            \"idem-key-abc\", \"cust-42\", List.of(\"PROD-1\", \"PROD-2\"), 99.99);\n\n        call(\"Case 2: Same key retry (network timeout simulation)\",\n            \"idem-key-abc\", \"cust-42\", List.of(\"PROD-1\", \"PROD-2\"), 99.99);\n\n        call(\"Case 3: Validation failure — empty items\",\n            \"idem-key-def\", \"cust-42\", Collections.emptyList(), 0.0);\n\n        call(\"Case 4: Unauthenticated — no customer\",\n            \"idem-key-ghi\", null, List.of(\"PROD-1\"), 49.99);\n\n        call(\"Case 5: Too many items\",\n            \"idem-key-jkl\", \"cust-99\",\n            List.of(\"P1\",\"P2\",\"P3\",\"P4\",\"P5\",\"P6\",\"P7\",\"P8\",\"P9\",\"P10\",\"P11\"), 299.0);\n\n        System.out.println(\"=== Status Code Summary ===\");\n        System.out.println(\"201 + Location  -> order created successfully\");\n        System.out.println(\"422             -> business rule violated (RFC 7807 body)\");\n        System.out.println(\"401             -> caller not authenticated\");\n        System.out.println(\"409             -> same key + different payload (conflict)\");\n        System.out.println(\"REPLAY 201      -> duplicate key, replayed from store\");\n    }\n}\n"
};

const cheatsheetRows = [
  [
    "URLs",
    "Plural nouns, stable opaque IDs, sub-resources for containment",
    "Collections vs items vs sub-resources; no verbs except domain actions"
  ],
  [
    "POST vs PUT",
    "POST creates or triggers commands; PUT replaces full resource at known URI",
    "POST not idempotent unless you design it; PUT safe to retry"
  ],
  [
    "Status codes",
    "Never 200 for logical errors; body must match status",
    "Use 4xx/5xx; 422 for business rules, 409 for conflicts"
  ],
  [
    "401 vs 403",
    "401 = not logged in; 403 = logged in, not allowed",
    "Say both precisely — confused in 40% of codebases"
  ],
  [
    "Idempotency-Key",
    "UUID client-generated, Redis store keyed per (userId, key), 24 h TTL",
    "Same key replays response; diff payload + same key = 409"
  ],
  [
    "Pagination",
    "Prefer keyset on large tables; offset breaks at OFFSET 50000+",
    "`WHERE id < lastId ORDER BY id DESC LIMIT n` uses index"
  ],
  [
    "Errors",
    "RFC 7807: type, title, status, detail, instance + traceId",
    "Spring 6 ships ProblemDetail natively"
  ],
  [
    "Versioning",
    "One org standard (URL or header); additive changes first",
    "Breaking change = new version + deprecation window + Sunset header"
  ],
  [
    "Caching",
    "GET + Cache-Control + ETag + If-None-Match",
    "304 Not Modified saves bandwidth; If-Match enables optimistic lock"
  ],
  [
    "HATEOAS",
    "Useful for public/partner APIs; most internal APIs skip it",
    "OpenAPI docs + Level 2 is the pragmatic sweet spot"
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
  title: "REST API Design Principles",
  tags: ["Mid-Level","Advanced","Phase 6","Interview Prep","Satyverse(Satyam Parmar)"],
  prerequisites: ["Day 48","Day 47"],
  learningObjectives: ["Model resources, collections, and sub-resources with URLs that stay stable as the domain grows","Apply correct HTTP methods and status codes so caches, gateways, and client retries behave predictably","Design idempotent POST flows (Idempotency-Key), pagination (offset vs keyset), and error bodies (e.g. Problem Details)","Compare API versioning strategies and non-breaking evolution tactics used in real microservice fleets","Relate REST semantics to Java/Spring patterns: ResponseEntity, validation, and structured errors","Explain one concrete production failure tied to bad API semantics and how you would fix it"],
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
  mcqLabel: "REST API Design Principles",
  mcqDescription: "Thirty questions from basic to advanced — REST API Design Principles. Read every option; distractors are plausible but wrong for a precise reason.",
  mcqQuestions,
  cheatsheetRows,
};
