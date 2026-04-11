export default [
  {
    "level": "basic",
    "category": "theory",
    "question": "[REST API design] Which HTTP method is required to be **safe** (no server-side state change) in typical REST APIs?",
    "options": {
      "A": "GET",
      "B": "POST",
      "C": "PATCH",
      "D": "DELETE"
    },
    "answer": "A",
    "explanation": "GET (and HEAD) must not change resource state; caches and intermediaries rely on safety. POST/PATCH/DELETE are not safe."
  },
  {
    "level": "basic",
    "category": "code",
    "question": "[REST API design] Which pair best describes **401** vs **403**?",
    "options": {
      "A": "401 = not authenticated; 403 = authenticated but not authorized",
      "B": "401 = not authorized; 403 = not authenticated",
      "C": "Both mean the same in REST",
      "D": "401 is only for OAuth; 403 is only for JWT"
    },
    "answer": "A",
    "explanation": "401 challenges for credentials; 403 denies an authenticated principal. Confusing them breaks client retry and security UX."
  },
  {
    "level": "basic",
    "category": "scenario",
    "question": "[REST API design] **Idempotent** HTTP methods (when implemented correctly) include:",
    "options": {
      "A": "GET, PUT, DELETE",
      "B": "POST, PATCH, GET",
      "C": "PATCH, POST, DELETE",
      "D": "Only GET"
    },
    "answer": "A",
    "explanation": "GET/PUT/DELETE are idempotent in effect; POST is not unless you add idempotency keys. PATCH is not guaranteed idempotent without a defined contract."
  },
  {
    "level": "basic",
    "category": "theory",
    "question": "[REST API design] Returning **200 OK** with a JSON error field in the body while the status is 200 is problematic because:",
    "options": {
      "A": "HTTP-aware clients and caches may treat the response as success",
      "B": "JSON parsers reject error bodies",
      "C": "It violates OAuth",
      "D": "It is required by RFC 7807"
    },
    "answer": "A",
    "explanation": "Status code must reflect outcome; logical errors should use 4xx/5xx with structured problem details, not 200."
  },
  {
    "level": "basic",
    "category": "code",
    "question": "[REST API design] **Idempotency-Key** on POST primarily prevents:",
    "options": {
      "A": "Duplicate side effects when clients or gateways retry",
      "B": "SQL injection",
      "C": "TLS downgrade",
      "D": "CORS preflight"
    },
    "answer": "A",
    "explanation": "Networks retry; the key lets the server replay the same response without repeating charges or inventory moves."
  },
  {
    "level": "basic",
    "category": "scenario",
    "question": "[REST API design] **Keyset pagination** is often preferred over deep **offset** because:",
    "options": {
      "A": "Large OFFSET scans many rows and can be unstable under concurrent writes",
      "B": "Offset does not work with HTTPS",
      "C": "Keyset requires GraphQL",
      "D": "Offset is illegal in HTTP/2"
    },
    "answer": "A",
    "explanation": "Keyset uses indexed seek; OFFSET walks and discards rows. Document opaque cursors."
  },
  {
    "level": "basic",
    "category": "theory",
    "question": "[REST API design] RFC 7807 **Problem Details** encourages which fields?",
    "options": {
      "A": "type, title, status, detail, instance (+ trace correlation)",
      "B": "Only stack traces",
      "C": "Only errorCode as a number",
      "D": "SOAP fault codes"
    },
    "answer": "A",
    "explanation": "Stable machine-readable errors help clients and support; add correlation ids for tracing."
  },
  {
    "level": "basic",
    "category": "code",
    "question": "[REST API design] **201 Created** should typically include:",
    "options": {
      "A": "Location of the new resource and often a representation",
      "B": "Only an empty body always",
      "C": "A 3xx redirect to login",
      "D": "Retry-After only"
    },
    "answer": "A",
    "explanation": "Clients and tools rely on Location and body semantics for creates."
  },
  {
    "level": "basic",
    "category": "scenario",
    "question": "[REST API design] **ETag** + **If-None-Match** on GET enables:",
    "options": {
      "A": "304 Not Modified bandwidth savings",
      "B": "Automatic idempotent POST",
      "C": "gRPC streaming",
      "D": "JWT signing"
    },
    "answer": "A",
    "explanation": "Conditional GET avoids sending bodies when nothing changed."
  },
  {
    "level": "basic",
    "category": "theory",
    "question": "[REST API design] Public URLs should avoid predictable **integer** primary keys mainly because:",
    "options": {
      "A": "Enumeration and coupling to storage leak business data",
      "B": "Integers are forbidden in HTTP",
      "C": "JSON cannot encode integers",
      "D": "Browsers block integers"
    },
    "answer": "A",
    "explanation": "Opaque IDs (UUID/ULID) reduce scanning risk and decouple API from DB sequences."
  },
  {
    "level": "intermediate",
    "category": "code",
    "question": "[REST API design] In REST API design, a **collection** resource path should usually be:",
    "options": {
      "A": "Plural noun segment (e.g. /orders)",
      "B": "Verb phrase (/getOrders)",
      "C": "A query-only URL with no path",
      "D": "Always singular (/order)"
    },
    "answer": "A",
    "explanation": "Noun-based collections with stable IDs are the common REST convention."
  },
  {
    "level": "intermediate",
    "category": "scenario",
    "question": "[REST API design] **429 Too Many Requests** pairs best with:",
    "options": {
      "A": "Retry-After when possible",
      "B": "A 200 body explaining rate limits only",
      "C": "Suppressing all response headers",
      "D": "Redirect to HTTP"
    },
    "answer": "A",
    "explanation": "Cooperative backoff needs a hint; metrics should track limit headers."
  },
  {
    "level": "intermediate",
    "category": "theory",
    "question": "[REST API design] **409 Conflict** is appropriate when:",
    "options": {
      "A": "State conflict such as duplicate unique key or illegal transition",
      "B": "JSON is malformed",
      "C": "Client forgot Content-Type",
      "D": "Server is restarting"
    },
    "answer": "A",
    "explanation": "409 signals business/state clashes; 400 is for syntax/type problems."
  },
  {
    "level": "intermediate",
    "category": "code",
    "question": "[REST API design] Versioning via **URL** (/v2/...) vs **header** trade-off:",
    "options": {
      "A": "URL is obvious in logs; header keeps URLs stable but needs discipline",
      "B": "Headers are illegal for public APIs",
      "C": "URL versioning breaks TLS",
      "D": "There is no trade-off — they are identical"
    },
    "answer": "A",
    "explanation": "Pick one org standard; document deprecation and sunset policies."
  },
  {
    "level": "intermediate",
    "category": "scenario",
    "question": "[REST API design] **HATEOAS** in mature internal APIs is often:",
    "options": {
      "A": "Optional; Level 2 + OpenAPI is common",
      "B": "Mandatory for JSON",
      "C": "Replaced exclusively by SOAP",
      "D": "Required by Kubernetes"
    },
    "answer": "A",
    "explanation": "Hypermedia helps some partner APIs; many teams stop at solid verbs, status codes, and docs."
  },
  {
    "level": "intermediate",
    "category": "theory",
    "question": "[REST API design] **PATCH** semantics must be documented because:",
    "options": {
      "A": "Merge vs JSON Patch behavior affects idempotency and validation",
      "B": "PATCH cannot change resources",
      "C": "PATCH is always idempotent by RFC guarantee",
      "D": "PATCH is only for files"
    },
    "answer": "A",
    "explanation": "Clients need a contract for partial updates; test edge cases."
  },
  {
    "level": "intermediate",
    "category": "code",
    "question": "[REST API design] Caching intermediaries treat **GET** responses based on:",
    "options": {
      "A": "Cache-Control and validators like ETag",
      "B": "Only request body hash",
      "C": "SOAP headers",
      "D": "Random per gateway"
    },
    "answer": "A",
    "explanation": "Correct cache headers prevent stale or private data leaks."
  },
  {
    "level": "intermediate",
    "category": "scenario",
    "question": "[REST API design] **Content negotiation** failure should yield:",
    "options": {
      "A": "406 Not Acceptable when the server cannot produce an acceptable representation",
      "B": "200 with HTML silently",
      "C": "500 always",
      "D": "301 to /error"
    },
    "answer": "A",
    "explanation": "406 signals no matching representation for Accept headers."
  },
  {
    "level": "intermediate",
    "category": "theory",
    "question": "[REST API design] For REST API design, **sub-resources** express:",
    "options": {
      "A": "Containment owned by parent lifecycle (when appropriate)",
      "B": "RPC tunneling only",
      "C": "Database foreign keys only in SQL",
      "D": "JWT scopes"
    },
    "answer": "A",
    "explanation": "Model URLs to reflect domain relationships without verb-heavy paths."
  },
  {
    "level": "intermediate",
    "category": "code",
    "question": "[REST API design] **503 Service Unavailable** with **Retry-After** signals:",
    "options": {
      "A": "Temporary overload/maintenance; clients should back off",
      "B": "Permanent deletion of the API",
      "C": "Successful completion",
      "D": "Client certificate required"
    },
    "answer": "A",
    "explanation": "Pair 503 with retry hints to reduce retry storms."
  },
  {
    "level": "advanced",
    "category": "scenario",
    "question": "[REST API design] **412 Precondition Failed** commonly follows:",
    "options": {
      "A": "If-Match / optimistic concurrency mismatch on update",
      "B": "Missing Content-Length on GET",
      "C": "Invalid TLS cipher",
      "D": "Wrong JDBC driver"
    },
    "answer": "A",
    "explanation": "412 tells the client the resource changed since it last read ETag."
  },
  {
    "level": "advanced",
    "category": "theory",
    "question": "[REST API design] Designing **POST /search** with a body vs **GET** with query params:",
    "options": {
      "A": "GET should be safe and cacheable; complex filters may justify POST with documented semantics",
      "B": "GET must never include query params",
      "C": "POST search is illegal",
      "D": "GET with body is always preferred"
    },
    "answer": "A",
    "explanation": "Trade safety, cacheability, and URL length; document non-RESTful exceptions."
  },
  {
    "level": "advanced",
    "category": "code",
    "question": "[REST API design] RFC 7807 Problem Details field `type` should be:",
    "options": {
      "A": "Stable identifier (often https URL under your domain) clients can branch on",
      "B": "Always stack trace text",
      "C": "Random per request",
      "D": "The string \\\"null\\\""
    },
    "answer": "A",
    "explanation": "Type identifies error classes; avoid changing meanings between releases without versioning."
  },
  {
    "level": "advanced",
    "category": "scenario",
    "question": "[REST API design] **Bulk operations** over REST often need:",
    "options": {
      "A": "Explicit partial-success reporting and idempotency boundaries",
      "B": "Only 200 without body",
      "C": "FTP resume",
      "D": "A new TCP connection per row"
    },
    "answer": "A",
    "explanation": "Batch APIs must define atomicity expectations and error itemization."
  },
  {
    "level": "advanced",
    "category": "theory",
    "question": "[REST API design] **Correlation / trace id** in error responses helps:",
    "options": {
      "A": "Support and engineers link user reports to logs across services",
      "B": "Replace authentication",
      "C": "Disable HTTPS",
      "D": "Remove need for metrics"
    },
    "answer": "A",
    "explanation": "Never log secrets; propagate trace context across hops."
  },
  {
    "level": "advanced",
    "category": "code",
    "question": "[REST API design] **204 No Content** means:",
    "options": {
      "A": "Success with no response body",
      "B": "Client error requiring HTML body",
      "C": "Redirect loop",
      "D": "Unauthorized only"
    },
    "answer": "A",
    "explanation": "Do not attach JSON bodies to 204 — clients may mishandle them."
  },
  {
    "level": "advanced",
    "category": "scenario",
    "question": "[REST API design] **415 Unsupported Media Type** applies when:",
    "options": {
      "A": "The request Content-Type cannot be processed",
      "B": "JWT expired",
      "C": "Database is read-only",
      "D": "DNS fails"
    },
    "answer": "A",
    "explanation": "Tell clients which media types are accepted (Accept-Post or docs)."
  },
  {
    "level": "advanced",
    "category": "theory",
    "question": "[REST API design] **API gateway** authentication at the edge should complement:",
    "options": {
      "A": "Fine-grained authorization inside the domain service",
      "B": "Removing all authz checks downstream",
      "C": "Disabling TLS",
      "D": "Storing passwords in URLs"
    },
    "answer": "A",
    "explanation": "Edge authn is not a substitute for resource-level authz."
  },
  {
    "level": "advanced",
    "category": "code",
    "question": "[REST API design] **Sunset** / **Deprecation** headers communicate:",
    "options": {
      "A": "Timeline for consumers to migrate off old versions",
      "B": "CPU temperature",
      "C": "JWT signing algorithm only",
      "D": "Database row locks"
    },
    "answer": "A",
    "explanation": "Operational kindness: pair headers with docs and integration tests."
  },
  {
    "level": "advanced",
    "category": "scenario",
    "question": "[REST API design] Choosing **GraphQL** for a **public** API without guardrails risks:",
    "options": {
      "A": "Expensive queries and DoS via deep nesting",
      "B": "Automatic REST compatibility",
      "C": "No need for pagination",
      "D": "Eliminating all N+1 issues without DataLoader"
    },
    "answer": "A",
    "explanation": "Use complexity limits, timeouts, persisted queries, and monitoring."
  }
];
