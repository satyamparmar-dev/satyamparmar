export default [
  {
    "level": "basic",
    "category": "theory",
    "question": "[Inter-service messaging] **At-least-once** delivery:",
    "options": {
      "A": "Duplicates possible — idempotent consumers",
      "B": "Exactly one always",
      "C": "No retries",
      "D": "Only HTTP"
    },
    "answer": "A",
    "explanation": "Dedup keys help."
  },
  {
    "level": "basic",
    "category": "code",
    "question": "[Inter-service messaging] **At-most-once** may:",
    "options": {
      "A": "Drop under failure",
      "B": "Never drop",
      "C": "Duplicate always",
      "D": "Only SQL"
    },
    "answer": "A",
    "explanation": "When loss acceptable."
  },
  {
    "level": "basic",
    "category": "scenario",
    "question": "[Inter-service messaging] **Exactly-once** E2E:",
    "options": {
      "A": "Hard; approximate with idempotency",
      "B": "Free in Kafka",
      "C": "TCP guarantees it",
      "D": "QoS0 only"
    },
    "answer": "A",
    "explanation": "Business semantics matter."
  },
  {
    "level": "basic",
    "category": "theory",
    "question": "[Inter-service messaging] **Kafka partition key**:",
    "options": {
      "A": "Controls ordering per partition",
      "B": "Random only",
      "C": "HTTP path",
      "D": "JWT"
    },
    "answer": "A",
    "explanation": "Hot keys limit throughput."
  },
  {
    "level": "basic",
    "category": "code",
    "question": "[Inter-service messaging] **Consumer group**:",
    "options": {
      "A": "Scales consumption; rebalances members",
      "B": "SQL join",
      "C": "TLS only",
      "D": "DNS cache"
    },
    "answer": "A",
    "explanation": "Parallel readers."
  },
  {
    "level": "basic",
    "category": "scenario",
    "question": "[Inter-service messaging] **Dead-letter queue**:",
    "options": {
      "A": "Quarantine poison messages after retries",
      "B": "Success queue",
      "C": "TLS store",
      "D": "SQL plan"
    },
    "answer": "A",
    "explanation": "Inspect and replay."
  },
  {
    "level": "basic",
    "category": "theory",
    "question": "[Inter-service messaging] **Transactional outbox**:",
    "options": {
      "A": "Same DB txn as business row + outbox event",
      "B": "UDP pattern",
      "C": "No DB",
      "D": "REST-only"
    },
    "answer": "A",
    "explanation": "Reliable publish."
  },
  {
    "level": "basic",
    "category": "code",
    "question": "[Inter-service messaging] **Ordering across partitions**:",
    "options": {
      "A": "Not global — only per partition",
      "B": "Global always",
      "C": "Guaranteed cross-topic",
      "D": "Random"
    },
    "answer": "A",
    "explanation": "Key design."
  },
  {
    "level": "basic",
    "category": "scenario",
    "question": "[Inter-service messaging] **Poison message** without DLQ:",
    "options": {
      "A": "Infinite retry loop risk",
      "B": "Harmless",
      "C": "Faster",
      "D": "Fixes lag"
    },
    "answer": "A",
    "explanation": "Cap retries."
  },
  {
    "level": "basic",
    "category": "theory",
    "question": "[Inter-service messaging] **Schema registry**:",
    "options": {
      "A": "Versioned Avro/Proto/JSON schemas",
      "B": "JWT registry",
      "C": "CSS",
      "D": "Maven only"
    },
    "answer": "A",
    "explanation": "CI compatibility checks."
  },
  {
    "level": "intermediate",
    "category": "code",
    "question": "[Inter-service messaging] **Kafka retention**:",
    "options": {
      "A": "Time/size bounded (often)",
      "B": "Infinite always",
      "C": "Memory-only",
      "D": "No compaction option"
    },
    "answer": "A",
    "explanation": "Tiered storage optional."
  },
  {
    "level": "intermediate",
    "category": "scenario",
    "question": "[Inter-service messaging] **Compaction topic**:",
    "options": {
      "A": "Keeps latest per key",
      "B": "All history forever",
      "C": "No keys",
      "D": "Headers only"
    },
    "answer": "A",
    "explanation": "Changelog pattern."
  },
  {
    "level": "intermediate",
    "category": "theory",
    "question": "[Inter-service messaging] **Consumer lag**:",
    "options": {
      "A": "How far behind processing is",
      "B": "CPU metric",
      "C": "TLS version",
      "D": "SQL slow query"
    },
    "answer": "A",
    "explanation": "Alert on SLO."
  },
  {
    "level": "intermediate",
    "category": "code",
    "question": "[Inter-service messaging] **Idempotent consumer**:",
    "options": {
      "A": "Same message twice does not double-apply",
      "B": "Never needed",
      "C": "Only GET",
      "D": "Illegal"
    },
    "answer": "A",
    "explanation": "Natural keys / dedup store."
  },
  {
    "level": "intermediate",
    "category": "scenario",
    "question": "[Inter-service messaging] **Transactional producer** (Kafka):",
    "options": {
      "A": "Atomic multi-partition write — costs latency",
      "B": "HTTP transaction",
      "C": "H2 push",
      "D": "GC"
    },
    "answer": "A",
    "explanation": "Use sparingly."
  },
  {
    "level": "intermediate",
    "category": "theory",
    "question": "[Inter-service messaging] **SQS visibility timeout** too low:",
    "options": {
      "A": "Duplicate processing risk",
      "B": "No effect",
      "C": "Stops duplicates",
      "D": "Fixes order"
    },
    "answer": "A",
    "explanation": "Tune to handler duration."
  },
  {
    "level": "intermediate",
    "category": "code",
    "question": "[Inter-service messaging] **FIFO SQS** gives:",
    "options": {
      "A": "Ordering per message group",
      "B": "Unlimited throughput",
      "C": "No duplicates ever",
      "D": "UDP order"
    },
    "answer": "A",
    "explanation": "Throughput trade-offs."
  },
  {
    "level": "intermediate",
    "category": "scenario",
    "question": "[Inter-service messaging] **Pub/sub fan-out**:",
    "options": {
      "A": "Many subscribers to same topic",
      "B": "One consumer only",
      "C": "SQL view",
      "D": "REST-only"
    },
    "answer": "A",
    "explanation": "Decouple producers."
  },
  {
    "level": "intermediate",
    "category": "theory",
    "question": "[Inter-service messaging] **Large payloads** in brokers:",
    "options": {
      "A": "Prefer blob store + reference",
      "B": "Unlimited",
      "C": "HTTP-only limit",
      "D": "No limits"
    },
    "answer": "A",
    "explanation": "Avoid huge messages."
  },
  {
    "level": "intermediate",
    "category": "code",
    "question": "[Inter-service messaging] **Ordering vs parallelism**:",
    "options": {
      "A": "Single partition orders but limits scale",
      "B": "Same",
      "C": "Free scale",
      "D": "Unrelated"
    },
    "answer": "A",
    "explanation": "Engineering trade-off."
  },
  {
    "level": "advanced",
    "category": "scenario",
    "question": "[Inter-service messaging] **Event replay** rebuilds:",
    "options": {
      "A": "Projections from log",
      "B": "TCP stack",
      "C": "JWT",
      "D": "CSS"
    },
    "answer": "A",
    "explanation": "Event-sourcing style."
  },
  {
    "level": "advanced",
    "category": "theory",
    "question": "[Inter-service messaging] **Backpressure** publishing:",
    "options": {
      "A": "Slow consumers increase lag — monitor",
      "B": "Impossible",
      "C": "REST-only",
      "D": "SQL-only"
    },
    "answer": "A",
    "explanation": "Scale consumers / partitions."
  },
  {
    "level": "advanced",
    "category": "code",
    "question": "[Inter-service messaging] **CloudEvents**:",
    "options": {
      "A": "Standard event metadata envelope",
      "B": "SQL format",
      "C": "gRPC-only",
      "D": "PNG"
    },
    "answer": "A",
    "explanation": "Interoperability."
  },
  {
    "level": "advanced",
    "category": "scenario",
    "question": "[Inter-service messaging] **Kafka Streams exactly-once**:",
    "options": {
      "A": "Processing guarantee within model; sinks still need care",
      "B": "Universal E2E",
      "C": "No state",
      "D": "Batch-only"
    },
    "answer": "A",
    "explanation": "Idempotent sinks."
  },
  {
    "level": "advanced",
    "category": "theory",
    "question": "[Inter-service messaging] **JMS vs Kafka** semantics:",
    "options": {
      "A": "Not equivalent — migration redesign",
      "B": "Identical",
      "C": "Kafka is JMS",
      "D": "No sessions"
    },
    "answer": "A",
    "explanation": "Read docs carefully."
  },
  {
    "level": "advanced",
    "category": "code",
    "question": "[Inter-service messaging] **Priority queues** risk:",
    "options": {
      "A": "Starvation of low priority",
      "B": "No risk",
      "C": "Fair always",
      "D": "Kafka-only"
    },
    "answer": "A",
    "explanation": "Monitor depth."
  },
  {
    "level": "advanced",
    "category": "scenario",
    "question": "[Inter-service messaging] **Scheduled redelivery**:",
    "options": {
      "A": "Broker delays retry visibility",
      "B": "Immediate only",
      "C": "Illegal",
      "D": "HTTP-only"
    },
    "answer": "A",
    "explanation": "Backoff at broker."
  },
  {
    "level": "advanced",
    "category": "theory",
    "question": "[Inter-service messaging] **Encryption at rest** messaging:",
    "options": {
      "A": "KMS / broker policies",
      "B": "Always plaintext",
      "C": "TLS enough always",
      "D": "Optional never"
    },
    "answer": "A",
    "explanation": "Compliance."
  },
  {
    "level": "advanced",
    "category": "code",
    "question": "[Inter-service messaging] **Multi-region replication lag**:",
    "options": {
      "A": "Consumers see eventual consistency",
      "B": "Always zero",
      "C": "SQL-only",
      "D": "Impossible"
    },
    "answer": "A",
    "explanation": "Design conflicts/UX."
  },
  {
    "level": "advanced",
    "category": "scenario",
    "question": "[Inter-service messaging] **Browser CORS** vs brokers:",
    "options": {
      "A": "Brokers not subject to browser CORS",
      "B": "Same as REST",
      "C": "Fixes Kafka",
      "D": "Always relevant"
    },
    "answer": "A",
    "explanation": "Different security model."
  }
];
