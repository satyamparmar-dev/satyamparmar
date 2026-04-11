/**
 * Run once: node scripts/phase6/lib/build-mcq-all.mjs
 * Writes mcqAll.mjs next to this file.
 * Requires mcqStemBanks.json from: node scripts/phase6/lib/gen-stem-banks.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const stemBanks = JSON.parse(fs.readFileSync(path.join(__dirname, "mcqStemBanks.json"), "utf8"));

const THEMES = [
  { n: 49, label: "REST API design", prefix: "rest" },
  { n: 50, label: "OpenAPI & API contracts", prefix: "openapi" },
  { n: 51, label: "Microservices & DDD", prefix: "ddd" },
  { n: 52, label: "Discovery & API gateway", prefix: "gw" },
  { n: 53, label: "Feign, WebClient & resilience", prefix: "res" },
  { n: 54, label: "gRPC & GraphQL", prefix: "rpc" },
  { n: 55, label: "Inter-service messaging", prefix: "msg" },
  { n: 56, label: "Saga & distributed transactions", prefix: "saga" },
  { n: 57, label: "CQRS & event sourcing", prefix: "cqrs" },
  { n: 58, label: "Strangler, ACL & advanced patterns", prefix: "acl" },
];

/** @returns {{q:string, A:string, B:string, C:string, D:string, ans:"A"|"B"|"C"|"D", e:string}[]} */
function stemsRest(prefix, label) {
  const L = label;
  return [
    {
      q: `Which HTTP method is required to be **safe** (no server-side state change) in typical REST APIs?`,
      A: "GET",
      B: "POST",
      C: "PATCH",
      D: "DELETE",
      ans: "A",
      e: "GET (and HEAD) must not change resource state; caches and intermediaries rely on safety. POST/PATCH/DELETE are not safe.",
    },
    {
      q: `Which pair best describes **401** vs **403**?`,
      A: "401 = not authenticated; 403 = authenticated but not authorized",
      B: "401 = not authorized; 403 = not authenticated",
      C: "Both mean the same in REST",
      D: "401 is only for OAuth; 403 is only for JWT",
      ans: "A",
      e: "401 challenges for credentials; 403 denies an authenticated principal. Confusing them breaks client retry and security UX.",
    },
    {
      q: `**Idempotent** HTTP methods (when implemented correctly) include:`,
      A: "GET, PUT, DELETE",
      B: "POST, PATCH, GET",
      C: "PATCH, POST, DELETE",
      D: "Only GET",
      ans: "A",
      e: "GET/PUT/DELETE are idempotent in effect; POST is not unless you add idempotency keys. PATCH is not guaranteed idempotent without a defined contract.",
    },
    {
      q: "Returning **200 OK** with a JSON error field in the body while the status is 200 is problematic because:",
      A: "HTTP-aware clients and caches may treat the response as success",
      B: "JSON parsers reject error bodies",
      C: "It violates OAuth",
      D: "It is required by RFC 7807",
      ans: "A",
      e: "Status code must reflect outcome; logical errors should use 4xx/5xx with structured problem details, not 200.",
    },
    {
      q: `**Idempotency-Key** on POST primarily prevents:`,
      A: "Duplicate side effects when clients or gateways retry",
      B: "SQL injection",
      C: "TLS downgrade",
      D: "CORS preflight",
      ans: "A",
      e: "Networks retry; the key lets the server replay the same response without repeating charges or inventory moves.",
    },
    {
      q: `**Keyset pagination** is often preferred over deep **offset** because:`,
      A: "Large OFFSET scans many rows and can be unstable under concurrent writes",
      B: "Offset does not work with HTTPS",
      C: "Keyset requires GraphQL",
      D: "Offset is illegal in HTTP/2",
      ans: "A",
      e: "Keyset uses indexed seek; OFFSET walks and discards rows. Document opaque cursors.",
    },
    {
      q: `RFC 7807 **Problem Details** encourages which fields?`,
      A: "type, title, status, detail, instance (+ trace correlation)",
      B: "Only stack traces",
      C: "Only errorCode as a number",
      D: "SOAP fault codes",
      ans: "A",
      e: "Stable machine-readable errors help clients and support; add correlation ids for tracing.",
    },
    {
      q: `**201 Created** should typically include:`,
      A: "Location of the new resource and often a representation",
      B: "Only an empty body always",
      C: "A 3xx redirect to login",
      D: "Retry-After only",
      ans: "A",
      e: "Clients and tools rely on Location and body semantics for creates.",
    },
    {
      q: `**ETag** + **If-None-Match** on GET enables:`,
      A: "304 Not Modified bandwidth savings",
      B: "Automatic idempotent POST",
      C: "gRPC streaming",
      D: "JWT signing",
      ans: "A",
      e: "Conditional GET avoids sending bodies when nothing changed.",
    },
    {
      q: `Public URLs should avoid predictable **integer** primary keys mainly because:`,
      A: "Enumeration and coupling to storage leak business data",
      B: "Integers are forbidden in HTTP",
      C: "JSON cannot encode integers",
      D: "Browsers block integers",
      ans: "A",
      e: "Opaque IDs (UUID/ULID) reduce scanning risk and decouple API from DB sequences.",
    },
    {
      q: `In ${L}, a **collection** resource path should usually be:`,
      A: "Plural noun segment (e.g. /orders)",
      B: "Verb phrase (/getOrders)",
      C: "A query-only URL with no path",
      D: "Always singular (/order)",
      ans: "A",
      e: "Noun-based collections with stable IDs are the common REST convention.",
    },
    {
      q: `**429 Too Many Requests** pairs best with:`,
      A: "Retry-After when possible",
      B: "A 200 body explaining rate limits only",
      C: "Suppressing all response headers",
      D: "Redirect to HTTP",
      ans: "A",
      e: "Cooperative backoff needs a hint; metrics should track limit headers.",
    },
    {
      q: `**409 Conflict** is appropriate when:`,
      A: "State conflict such as duplicate unique key or illegal transition",
      B: "JSON is malformed",
      C: "Client forgot Content-Type",
      D: "Server is restarting",
      ans: "A",
      e: "409 signals business/state clashes; 400 is for syntax/type problems.",
    },
    {
      q: `Versioning via **URL** (/v2/...) vs **header** trade-off:`,
      A: "URL is obvious in logs; header keeps URLs stable but needs discipline",
      B: "Headers are illegal for public APIs",
      C: "URL versioning breaks TLS",
      D: "There is no trade-off — they are identical",
      ans: "A",
      e: "Pick one org standard; document deprecation and sunset policies.",
    },
    {
      q: `**HATEOAS** in mature internal APIs is often:`,
      A: "Optional; Level 2 + OpenAPI is common",
      B: "Mandatory for JSON",
      C: "Replaced exclusively by SOAP",
      D: "Required by Kubernetes",
      ans: "A",
      e: "Hypermedia helps some partner APIs; many teams stop at solid verbs, status codes, and docs.",
    },
    {
      q: `**PATCH** semantics must be documented because:`,
      A: "Merge vs JSON Patch behavior affects idempotency and validation",
      B: "PATCH cannot change resources",
      C: "PATCH is always idempotent by RFC guarantee",
      D: "PATCH is only for files",
      ans: "A",
      e: "Clients need a contract for partial updates; test edge cases.",
    },
    {
      q: `Caching intermediaries treat **GET** responses based on:`,
      A: "Cache-Control and validators like ETag",
      B: "Only request body hash",
      C: "SOAP headers",
      D: "Random per gateway",
      ans: "A",
      e: "Correct cache headers prevent stale or private data leaks.",
    },
    {
      q: `**Content negotiation** failure should yield:`,
      A: "406 Not Acceptable when the server cannot produce an acceptable representation",
      B: "200 with HTML silently",
      C: "500 always",
      D: "301 to /error",
      ans: "A",
      e: "406 signals no matching representation for Accept headers.",
    },
    {
      q: `For ${L}, **sub-resources** express:`,
      A: "Containment owned by parent lifecycle (when appropriate)",
      B: "RPC tunneling only",
      C: "Database foreign keys only in SQL",
      D: "JWT scopes",
      ans: "A",
      e: "Model URLs to reflect domain relationships without verb-heavy paths.",
    },
    {
      q: `**503 Service Unavailable** with **Retry-After** signals:`,
      A: "Temporary overload/maintenance; clients should back off",
      B: "Permanent deletion of the API",
      C: "Successful completion",
      D: "Client certificate required",
      ans: "A",
      e: "Pair 503 with retry hints to reduce retry storms.",
    },
    {
      q: `**412 Precondition Failed** commonly follows:`,
      A: "If-Match / optimistic concurrency mismatch on update",
      B: "Missing Content-Length on GET",
      C: "Invalid TLS cipher",
      D: "Wrong JDBC driver",
      ans: "A",
      e: "412 tells the client the resource changed since it last read ETag.",
    },
    {
      q: `Designing **POST /search** with a body vs **GET** with query params:`,
      A: "GET should be safe and cacheable; complex filters may justify POST with documented semantics",
      B: "GET must never include query params",
      C: "POST search is illegal",
      D: "GET with body is always preferred",
      ans: "A",
      e: "Trade safety, cacheability, and URL length; document non-RESTful exceptions.",
    },
    {
      q: "RFC 7807 Problem Details field `type` should be:",
      A: "Stable identifier (often https URL under your domain) clients can branch on",
      B: "Always stack trace text",
      C: "Random per request",
      D: "The string \\\"null\\\"",
      ans: "A",
      e: "Type identifies error classes; avoid changing meanings between releases without versioning.",
    },
    {
      q: `**Bulk operations** over REST often need:`,
      A: "Explicit partial-success reporting and idempotency boundaries",
      B: "Only 200 without body",
      C: "FTP resume",
      D: "A new TCP connection per row",
      ans: "A",
      e: "Batch APIs must define atomicity expectations and error itemization.",
    },
    {
      q: `**Correlation / trace id** in error responses helps:`,
      A: "Support and engineers link user reports to logs across services",
      B: "Replace authentication",
      C: "Disable HTTPS",
      D: "Remove need for metrics",
      ans: "A",
      e: "Never log secrets; propagate trace context across hops.",
    },
    {
      q: `**204 No Content** means:`,
      A: "Success with no response body",
      B: "Client error requiring HTML body",
      C: "Redirect loop",
      D: "Unauthorized only",
      ans: "A",
      e: "Do not attach JSON bodies to 204 — clients may mishandle them.",
    },
    {
      q: `**415 Unsupported Media Type** applies when:`,
      A: "The request Content-Type cannot be processed",
      B: "JWT expired",
      C: "Database is read-only",
      D: "DNS fails",
      ans: "A",
      e: "Tell clients which media types are accepted (Accept-Post or docs).",
    },
    {
      q: `**API gateway** authentication at the edge should complement:`,
      A: "Fine-grained authorization inside the domain service",
      B: "Removing all authz checks downstream",
      C: "Disabling TLS",
      D: "Storing passwords in URLs",
      ans: "A",
      e: "Edge authn is not a substitute for resource-level authz.",
    },
    {
      q: `**Sunset** / **Deprecation** headers communicate:`,
      A: "Timeline for consumers to migrate off old versions",
      B: "CPU temperature",
      C: "JWT signing algorithm only",
      D: "Database row locks",
      ans: "A",
      e: "Operational kindness: pair headers with docs and integration tests.",
    },
    {
      q: `Choosing **GraphQL** for a **public** API without guardrails risks:`,
      A: "Expensive queries and DoS via deep nesting",
      B: "Automatic REST compatibility",
      C: "No need for pagination",
      D: "Eliminating all N+1 issues without DataLoader",
      ans: "A",
      e: "Use complexity limits, timeouts, persisted queries, and monitoring.",
    },
  ].map((x) => ({ ...x, tag: prefix }));
}

function getRawStems(prefix, label) {
  const bank = stemBanks[prefix];
  if (bank?.length) {
    return bank.map((x) => ({ ...x, tag: prefix }));
  }
  return stemsRest(prefix, label);
}

function mixStem(theme, stem, idx) {
  const level = idx < 10 ? "basic" : idx < 20 ? "intermediate" : "advanced";
  const category = ["theory", "code", "scenario"][idx % 3];
  const q = `[${theme.label}] ${stem.q}`;
  return {
    level,
    category,
    question: q,
    options: { A: stem.A, B: stem.B, C: stem.C, D: stem.D },
    answer: stem.ans,
    explanation: stem.e,
  };
}

const BY_DAY = {};
for (const t of THEMES) {
  const stems = getRawStems(t.prefix, t.label);
  const out = [];
  for (let i = 0; i < 30; i++) {
    out.push(mixStem(t, stems[i % stems.length], i));
  }
  BY_DAY[t.n] = out;
}

const header = `/** Auto-generated by build-mcq-all.mjs — day-specific tagged MCQs. */\n\nexport function getMcqForDay(n, _title) {\n  const m = BY_DAY[n];\n  if (!m) throw new Error("No MCQ for day " + n);\n  return m;\n}\n\nconst BY_DAY = `;

const footer = `;\n`;

fs.writeFileSync(path.join(__dirname, "mcqAll.mjs"), header + JSON.stringify(BY_DAY, null, 2) + footer, "utf8");
console.log("wrote mcqAll.mjs");
