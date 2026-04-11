export default [
  {
    "level": "basic",
    "category": "theory",
    "question": "[gRPC & GraphQL] **gRPC** transport defaults:",
    "options": {
      "A": "HTTP/2 + Protobuf",
      "B": "HTTP/0.9",
      "C": "FTP",
      "D": "SMTP"
    },
    "answer": "A",
    "explanation": "Efficient binary framing."
  },
  {
    "level": "basic",
    "category": "code",
    "question": "[gRPC & GraphQL] **Protobuf field numbers** must:",
    "options": {
      "A": "Stay stable; never repurpose",
      "B": "Change each release",
      "C": "Be sequential only",
      "D": "Match SQL ids"
    },
    "answer": "A",
    "explanation": "Wire compatibility."
  },
  {
    "level": "basic",
    "category": "scenario",
    "question": "[gRPC & GraphQL] **gRPC streaming** kinds:",
    "options": {
      "A": "Unary, client, server, bidi",
      "B": "Only unary",
      "C": "Only UDP",
      "D": "Only FTP"
    },
    "answer": "A",
    "explanation": "Long-lived RPC patterns."
  },
  {
    "level": "basic",
    "category": "theory",
    "question": "[gRPC & GraphQL] **GraphQL resolver** N+1:",
    "options": {
      "A": "Mitigate with DataLoader batching",
      "B": "Impossible",
      "C": "Only compile-time",
      "D": "Only REST"
    },
    "answer": "A",
    "explanation": "Per-field resolver cost."
  },
  {
    "level": "basic",
    "category": "code",
    "question": "[gRPC & GraphQL] **GraphQL schema** defines:",
    "options": {
      "A": "Types, queries, mutations",
      "B": "TCP ports",
      "C": "JVM flags",
      "D": "Kafka topics"
    },
    "answer": "A",
    "explanation": "Contract for clients."
  },
  {
    "level": "basic",
    "category": "scenario",
    "question": "[gRPC & GraphQL] **Proto3 optional / presence**:",
    "options": {
      "A": "Needs careful modeling vs proto2",
      "B": "Same as JSON null",
      "C": "Forbidden",
      "D": "Only strings"
    },
    "answer": "A",
    "explanation": "Language bindings differ."
  },
  {
    "level": "basic",
    "category": "theory",
    "question": "[gRPC & GraphQL] **oneof** in protobuf:",
    "options": {
      "A": "Exactly one branch set",
      "B": "All fields required",
      "C": "HTTP verb",
      "D": "SQL join"
    },
    "answer": "A",
    "explanation": "Discriminated union."
  },
  {
    "level": "basic",
    "category": "code",
    "question": "[gRPC & GraphQL] **gRPC deadline**:",
    "options": {
      "A": "Propagates timeout across callees",
      "B": "JWT only",
      "C": "SQL timeout",
      "D": "CSS"
    },
    "answer": "A",
    "explanation": "End-to-end latency budget."
  },
  {
    "level": "basic",
    "category": "scenario",
    "question": "[gRPC & GraphQL] **gRPC reflection** in prod:",
    "options": {
      "A": "Often restricted — info disclosure",
      "B": "Always public",
      "C": "Required",
      "D": "JDBC"
    },
    "answer": "A",
    "explanation": "Lock down dev tooling."
  },
  {
    "level": "basic",
    "category": "theory",
    "question": "[gRPC & GraphQL] **GraphQL introspection** public:",
    "options": {
      "A": "Often disabled or limited",
      "B": "Always on",
      "C": "Law-mandated",
      "D": "Same as gRPC reflection"
    },
    "answer": "A",
    "explanation": "Schema can leak capabilities."
  },
  {
    "level": "intermediate",
    "category": "code",
    "question": "[gRPC & GraphQL] **GraphQL pagination** best practice:",
    "options": {
      "A": "Cursors + limits",
      "B": "Unbounded lists",
      "C": "OFFSET only",
      "D": "No pagination"
    },
    "answer": "A",
    "explanation": "Protect server."
  },
  {
    "level": "intermediate",
    "category": "scenario",
    "question": "[gRPC & GraphQL] **gRPC status codes**:",
    "options": {
      "A": "Rich canonical codes (UNAVAILABLE, etc.)",
      "B": "HTTP only",
      "C": "SQLSTATE",
      "D": "Shell exit"
    },
    "answer": "A",
    "explanation": "Better than numeric HTTP alone."
  },
  {
    "level": "intermediate",
    "category": "theory",
    "question": "[gRPC & GraphQL] **GraphQL mutations** and retries:",
    "options": {
      "A": "Design idempotency keys where needed",
      "B": "Always GET",
      "C": "Never validated",
      "D": "Only batch"
    },
    "answer": "A",
    "explanation": "Networks retry."
  },
  {
    "level": "intermediate",
    "category": "code",
    "question": "[gRPC & GraphQL] **Proto JSON mapping**:",
    "options": {
      "A": "May surprise vs hand-written JSON APIs",
      "B": "Identical always",
      "C": "No enums",
      "D": "No lists"
    },
    "answer": "A",
    "explanation": "Interop test."
  },
  {
    "level": "intermediate",
    "category": "scenario",
    "question": "[gRPC & GraphQL] **gRPC-Web** often needs:",
    "options": {
      "A": "Envoy or bridge for browsers",
      "B": "Nothing",
      "C": "FTP",
      "D": "SOAP"
    },
    "answer": "A",
    "explanation": "Browser constraints."
  },
  {
    "level": "intermediate",
    "category": "theory",
    "question": "[gRPC & GraphQL] **GraphQL complexity** limits:",
    "options": {
      "A": "Cap query cost",
      "B": "Unlimited",
      "C": "REST-only feature",
      "D": "CPU-only"
    },
    "answer": "A",
    "explanation": "Prevent DoS queries."
  },
  {
    "level": "intermediate",
    "category": "code",
    "question": "[gRPC & GraphQL] **HTTP/2 flow control** on streams:",
    "options": {
      "A": "Backpressure applies",
      "B": "Unbounded",
      "C": "UDP only",
      "D": "Off"
    },
    "answer": "A",
    "explanation": "Streams aren't infinite queues."
  },
  {
    "level": "intermediate",
    "category": "scenario",
    "question": "[gRPC & GraphQL] **Proto package** names:",
    "options": {
      "A": "Reduce type collisions",
      "B": "HTTP latency",
      "C": "JWT size",
      "D": "GC pauses"
    },
    "answer": "A",
    "explanation": "Namespace messages."
  },
  {
    "level": "intermediate",
    "category": "theory",
    "question": "[gRPC & GraphQL] **GraphQL subscriptions** transport:",
    "options": {
      "A": "Often WebSocket/SSE",
      "B": "Unary only",
      "C": "JDBC",
      "D": "FTP"
    },
    "answer": "A",
    "explanation": "Timeouts still needed."
  },
  {
    "level": "intermediate",
    "category": "code",
    "question": "[gRPC & GraphQL] **gRPC interceptors**:",
    "options": {
      "A": "Metadata, auth, logging",
      "B": "SQL parsing",
      "C": "CSS",
      "D": "Heap dump"
    },
    "answer": "A",
    "explanation": "Client and server."
  },
  {
    "level": "advanced",
    "category": "scenario",
    "question": "[gRPC & GraphQL] **DataLoader** batches:",
    "options": {
      "A": "Loads for many resolver keys",
      "B": "SQL migrations",
      "C": "JWT refresh",
      "D": "DNS"
    },
    "answer": "A",
    "explanation": "Kill N+1 hotspots."
  },
  {
    "level": "advanced",
    "category": "theory",
    "question": "[gRPC & GraphQL] **Wire breaking change**:",
    "options": {
      "A": "Reusing field number with new type",
      "B": "Adding optional field",
      "C": "New message type",
      "D": "New enum value with unknown"
    },
    "answer": "A",
    "explanation": "Never repurpose numbers."
  },
  {
    "level": "advanced",
    "category": "code",
    "question": "[gRPC & GraphQL] **gRPC metadata**:",
    "options": {
      "A": "Headers + trailing metadata",
      "B": "SQL plans",
      "C": "Heap",
      "D": "CSS"
    },
    "answer": "A",
    "explanation": "Tracing, auth, etc."
  },
  {
    "level": "advanced",
    "category": "scenario",
    "question": "[gRPC & GraphQL] **@deprecated** GraphQL field:",
    "options": {
      "A": "Signals migration path",
      "B": "Deletes immediately",
      "C": "HTTP 301",
      "D": "JVM flag"
    },
    "answer": "A",
    "explanation": "Communicate to clients."
  },
  {
    "level": "advanced",
    "category": "theory",
    "question": "[gRPC & GraphQL] **Max message size** gRPC:",
    "options": {
      "A": "Protect memory",
      "B": "Unlimited always",
      "C": "UDP-only rule",
      "D": "Illegal"
    },
    "answer": "A",
    "explanation": "Tune client/server."
  },
  {
    "level": "advanced",
    "category": "code",
    "question": "[gRPC & GraphQL] **GraphQL partial errors**:",
    "options": {
      "A": "data + errors array possible",
      "B": "Forbidden",
      "C": "Only 500",
      "D": "SOAP-only"
    },
    "answer": "A",
    "explanation": "Understand nullable schema."
  },
  {
    "level": "advanced",
    "category": "scenario",
    "question": "[gRPC & GraphQL] **Internal gRPC + edge REST**:",
    "options": {
      "A": "Common efficiency pattern",
      "B": "Illegal",
      "C": "GraphQL-only world",
      "D": "SOAP-only"
    },
    "answer": "A",
    "explanation": "BFF may translate."
  },
  {
    "level": "advanced",
    "category": "theory",
    "question": "[gRPC & GraphQL] **Proto enum unknown** handling:",
    "options": {
      "A": "Forward-compatible clients ignore unknown",
      "B": "Crash",
      "C": "Illegal",
      "D": "HTTP 400"
    },
    "answer": "A",
    "explanation": "Versioning discipline."
  },
  {
    "level": "advanced",
    "category": "code",
    "question": "[gRPC & GraphQL] **GraphQL federation** composes:",
    "options": {
      "A": "Subgraphs into supergraph",
      "B": "JVM bytecode",
      "C": "Kafka topics",
      "D": "SQL views"
    },
    "answer": "A",
    "explanation": "Ownership per domain."
  },
  {
    "level": "advanced",
    "category": "scenario",
    "question": "[gRPC & GraphQL] **gRPC health protocol**:",
    "options": {
      "A": "Standard RPC for readiness",
      "B": "K8s exec only",
      "C": "JDBC",
      "D": "N/A"
    },
    "answer": "A",
    "explanation": "Integrate with probes."
  }
];
