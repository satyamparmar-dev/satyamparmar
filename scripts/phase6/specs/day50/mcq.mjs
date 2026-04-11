export default [
  {
    "level": "basic",
    "category": "theory",
    "question": "[OpenAPI & API contracts] OpenAPI **operationId** should be:",
    "options": {
      "A": "Unique per document",
      "B": "Shared across paths",
      "C": "Optional always",
      "D": "Same as path"
    },
    "answer": "A",
    "explanation": "Duplicate operationIds break generators and gateway routing."
  },
  {
    "level": "basic",
    "category": "code",
    "question": "[OpenAPI & API contracts] **components.schemas** holds:",
    "options": {
      "A": "Reusable schema definitions",
      "B": "Only paths",
      "C": "Server URLs",
      "D": "Security only"
    },
    "answer": "A",
    "explanation": "Schemas are referenced by $ref from request/response models."
  },
  {
    "level": "basic",
    "category": "scenario",
    "question": "[OpenAPI & API contracts] Adding a **new optional** JSON field is usually:",
    "options": {
      "A": "Non-breaking",
      "B": "Breaking",
      "C": "Illegal in OpenAPI",
      "D": "Requires new protocol"
    },
    "answer": "A",
    "explanation": "Optional additive fields preserve compatibility."
  },
  {
    "level": "basic",
    "category": "theory",
    "question": "[OpenAPI & API contracts] Removing a **required** response field is:",
    "options": {
      "A": "Breaking",
      "B": "Always safe",
      "C": "Ignored by clients",
      "D": "Only cosmetic"
    },
    "answer": "A",
    "explanation": "Consumers may depend on required fields."
  },
  {
    "level": "basic",
    "category": "code",
    "question": "[OpenAPI & API contracts] **nullable: true** means:",
    "options": {
      "A": "Value may be null",
      "B": "Field must be absent",
      "C": "Same as required false",
      "D": "Forbidden in JSON"
    },
    "answer": "A",
    "explanation": "Nullability is explicit in OpenAPI 3."
  },
  {
    "level": "basic",
    "category": "scenario",
    "question": "[OpenAPI & API contracts] **Spectral** is often used to:",
    "options": {
      "A": "Lint OpenAPI for style and errors",
      "B": "Run JVM bytecode",
      "C": "Compile protobuf",
      "D": "Replace HTTP"
    },
    "answer": "A",
    "explanation": "Spectral enforces API design rules in CI."
  },
  {
    "level": "basic",
    "category": "theory",
    "question": "[OpenAPI & API contracts] **openapi-diff** in CI helps catch:",
    "options": {
      "A": "Breaking contract changes",
      "B": "CSS issues",
      "C": "Kubernetes versions",
      "D": "JWT signing only"
    },
    "answer": "A",
    "explanation": "Compare baselines to PR artifacts."
  },
  {
    "level": "basic",
    "category": "code",
    "question": "[OpenAPI & API contracts] **examples** on schemas help:",
    "options": {
      "A": "Client understanding and tests",
      "B": "Hide endpoints",
      "C": "Disable auth",
      "D": "Remove versioning"
    },
    "answer": "A",
    "explanation": "Examples document realistic payloads."
  },
  {
    "level": "basic",
    "category": "scenario",
    "question": "[OpenAPI & API contracts] **servers** array documents:",
    "options": {
      "A": "Base URLs per environment",
      "B": "Java packages",
      "C": "DB indexes",
      "D": "Thread pools"
    },
    "answer": "A",
    "explanation": "Clients know where to call."
  },
  {
    "level": "basic",
    "category": "theory",
    "question": "[OpenAPI & API contracts] **securitySchemes** describe:",
    "options": {
      "A": "Auth mechanisms (Bearer, OAuth2, etc.)",
      "B": "CPU limits",
      "C": "Pagination cursors",
      "D": "SQL plans"
    },
    "answer": "A",
    "explanation": "Apply via security requirements on operations."
  },
  {
    "level": "intermediate",
    "category": "code",
    "question": "[OpenAPI & API contracts] **tags** group operations for:",
    "options": {
      "A": "Documentation navigation",
      "B": "TLS ciphers",
      "C": "Heap dumps",
      "D": "GC tuning"
    },
    "answer": "A",
    "explanation": "Swagger UI and team ownership."
  },
  {
    "level": "intermediate",
    "category": "scenario",
    "question": "[OpenAPI & API contracts] **$ref** to another file enables:",
    "options": {
      "A": "Modular spec splitting",
      "B": "Faster DNS",
      "C": "UDP transport",
      "D": "Binary only APIs"
    },
    "answer": "A",
    "explanation": "Split domains while composing one doc."
  },
  {
    "level": "intermediate",
    "category": "theory",
    "question": "[OpenAPI & API contracts] **deprecated: true** on an operation signals:",
    "options": {
      "A": "Consumers should migrate",
      "B": "Immediate removal",
      "C": "404 always",
      "D": "Server crash"
    },
    "answer": "A",
    "explanation": "Pair with sunset policy and comms."
  },
  {
    "level": "intermediate",
    "category": "code",
    "question": "[OpenAPI & API contracts] **oneOf** in schema means:",
    "options": {
      "A": "Exactly one variant matches",
      "B": "All variants required",
      "C": "No JSON allowed",
      "D": "Unlimited any"
    },
    "answer": "A",
    "explanation": "Discriminated unions need clear mapping."
  },
  {
    "level": "intermediate",
    "category": "scenario",
    "question": "[OpenAPI & API contracts] **format: uuid** on string suggests:",
    "options": {
      "A": "UUID-shaped strings",
      "B": "16-bit int",
      "C": "Base64 blob mandatory",
      "D": "XML only"
    },
    "answer": "A",
    "explanation": "Validation hint; still a string type."
  },
  {
    "level": "intermediate",
    "category": "theory",
    "question": "[OpenAPI & API contracts] **responses.default** captures:",
    "options": {
      "A": "Unlisted status codes",
      "B": "Only 200",
      "C": "Only 5xx",
      "D": "CORS"
    },
    "answer": "A",
    "explanation": "Fallback documentation for unexpected codes."
  },
  {
    "level": "intermediate",
    "category": "code",
    "question": "[OpenAPI & API contracts] **requestBody** **required: true** means:",
    "options": {
      "A": "Client must send body",
      "B": "Body forbidden",
      "C": "Body ignored",
      "D": "Only GET"
    },
    "answer": "A",
    "explanation": "Missing body fails validation."
  },
  {
    "level": "intermediate",
    "category": "scenario",
    "question": "[OpenAPI & API contracts] **parameters** **in: path** are:",
    "options": {
      "A": "Substituted into the path template",
      "B": "Always query strings",
      "C": "Headers only",
      "D": "Cookies only"
    },
    "answer": "A",
    "explanation": "Path params are part of the URL."
  },
  {
    "level": "intermediate",
    "category": "theory",
    "question": "[OpenAPI & API contracts] **content** map under responses keys:",
    "options": {
      "A": "Media types (application/json)",
      "B": "SQL dialects",
      "C": "JVM flags",
      "D": "File inode"
    },
    "answer": "A",
    "explanation": "Each media type can have its own schema."
  },
  {
    "level": "intermediate",
    "category": "code",
    "question": "[OpenAPI & API contracts] **allOf** composes schemas by:",
    "options": {
      "A": "Merging constraints",
      "B": "Picking random fields",
      "C": "Deleting properties",
      "D": "Disabling TLS"
    },
    "answer": "A",
    "explanation": "Used for composition and inheritance patterns."
  },
  {
    "level": "advanced",
    "category": "scenario",
    "question": "[OpenAPI & API contracts] **enum** on string restricts:",
    "options": {
      "A": "Allowed string values",
      "B": "HTTP version",
      "C": "TCP port",
      "D": "Thread count"
    },
    "answer": "A",
    "explanation": "Invalid enum values fail validation."
  },
  {
    "level": "advanced",
    "category": "theory",
    "question": "[OpenAPI & API contracts] **minLength** / **maxLength** validate:",
    "options": {
      "A": "String lengths",
      "B": "Array capacity only",
      "C": "CPU usage",
      "D": "Latency SLO"
    },
    "answer": "A",
    "explanation": "String constraints for inputs."
  },
  {
    "level": "advanced",
    "category": "code",
    "question": "[OpenAPI & API contracts] **additionalProperties: false** means:",
    "options": {
      "A": "No extra properties beyond defined",
      "B": "Any property allowed",
      "C": "Only XML",
      "D": "Disable caching"
    },
    "answer": "A",
    "explanation": "Strict object shape for clients."
  },
  {
    "level": "advanced",
    "category": "scenario",
    "question": "[OpenAPI & API contracts] **callbacks** describe:",
    "options": {
      "A": "Async out-of-band requests the API may initiate",
      "B": "Sync JDBC",
      "C": "Heap snapshots",
      "D": "DNS TTL"
    },
    "answer": "A",
    "explanation": "Webhook-style contracts."
  },
  {
    "level": "advanced",
    "category": "theory",
    "question": "[OpenAPI & API contracts] **links** (OpenAPI links) help with:",
    "options": {
      "A": "Discovering related calls",
      "B": "Packet fragmentation",
      "C": "Kernel modules",
      "D": "ZIP compression"
    },
    "answer": "A",
    "explanation": "Hypermedia-lite navigation in docs."
  },
  {
    "level": "advanced",
    "category": "code",
    "question": "[OpenAPI & API contracts] **API first** design means:",
    "options": {
      "A": "Spec agreed before implementation drift",
      "B": "Code then never document",
      "C": "No reviews",
      "D": "Only SOAP"
    },
    "answer": "A",
    "explanation": "Contract drives parallel client/server work."
  },
  {
    "level": "advanced",
    "category": "scenario",
    "question": "[OpenAPI & API contracts] **GroupedOpenApi** (springdoc) can:",
    "options": {
      "A": "Split docs by paths/packages",
      "B": "Disable TLS",
      "C": "Replace Feign",
      "D": "Compile C++"
    },
    "answer": "A",
    "explanation": "Multiple OpenAPI groups per app."
  },
  {
    "level": "advanced",
    "category": "theory",
    "question": "[OpenAPI & API contracts] **version** field in **info** is:",
    "options": {
      "A": "Semantic API version string",
      "B": "JVM major only",
      "C": "Git hash required",
      "D": "Random token"
    },
    "answer": "A",
    "explanation": "Communicates release to consumers."
  },
  {
    "level": "advanced",
    "category": "code",
    "question": "[OpenAPI & API contracts] **contact** and **license** in **info** aid:",
    "options": {
      "A": "Governance and support",
      "B": "Packet routing",
      "C": "Thread pinning",
      "D": "SQL hints"
    },
    "answer": "A",
    "explanation": "Ownership and legal clarity."
  },
  {
    "level": "advanced",
    "category": "scenario",
    "question": "[OpenAPI & API contracts] **externalDocs** points to:",
    "options": {
      "A": "More documentation outside the spec",
      "B": "Internal heap dump",
      "C": "Binary plist",
      "D": "Kernel log"
    },
    "answer": "A",
    "explanation": "Deep links for human readers."
  }
];
