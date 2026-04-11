export default [
  {
    "level": "basic",
    "category": "theory",
    "question": "[CQRS & event sourcing] **CQRS** separates:",
    "options": {
      "A": "Command model from query model",
      "B": "Read-only JDBC",
      "C": "Write-only cache",
      "D": "JWT"
    },
    "answer": "A",
    "explanation": "Optimize each side."
  },
  {
    "level": "basic",
    "category": "code",
    "question": "[CQRS & event sourcing] **Event sourcing** truth:",
    "options": {
      "A": "Append-only event stream",
      "B": "Latest row only",
      "C": "PNG",
      "D": "SQL view"
    },
    "answer": "A",
    "explanation": "Fold to state."
  },
  {
    "level": "basic",
    "category": "scenario",
    "question": "[CQRS & event sourcing] **Projection rebuild**:",
    "options": {
      "A": "Replay events to new read model",
      "B": "DELETE *",
      "C": "FTP",
      "D": "Compile proto"
    },
    "answer": "A",
    "explanation": "Version handlers."
  },
  {
    "level": "basic",
    "category": "theory",
    "question": "[CQRS & event sourcing] **Eventual consistency** UX:",
    "options": {
      "A": "Read-your-writes strategies if needed",
      "B": "Always strong",
      "C": "Invisible",
      "D": "SQL-only"
    },
    "answer": "A",
    "explanation": "Routing/sticky read."
  },
  {
    "level": "basic",
    "category": "code",
    "question": "[CQRS & event sourcing] **Commands** should be:",
    "options": {
      "A": "Validated; idempotent when possible",
      "B": "Always GET",
      "C": "Never validated",
      "D": "Batch-only"
    },
    "answer": "A",
    "explanation": "Explicit intent."
  },
  {
    "level": "basic",
    "category": "scenario",
    "question": "[CQRS & event sourcing] **Read model denormalization**:",
    "options": {
      "A": "Pre-join for fast queries",
      "B": "Forbidden",
      "C": "3NF always",
      "D": "OLTP-only"
    },
    "answer": "A",
    "explanation": "Space for speed."
  },
  {
    "level": "basic",
    "category": "theory",
    "question": "[CQRS & event sourcing] **Projection lag** SLO:",
    "options": {
      "A": "Measure consumer behind log head",
      "B": "Ignore",
      "C": "Always zero",
      "D": "Unmeasurable"
    },
    "answer": "A",
    "explanation": "Alert breaches."
  },
  {
    "level": "basic",
    "category": "code",
    "question": "[CQRS & event sourcing] **Snapshots** (ES):",
    "options": {
      "A": "Accelerate aggregate replay",
      "B": "Required always",
      "C": "Illegal",
      "D": "HTTP cache"
    },
    "answer": "A",
    "explanation": "Periodic checkpoints."
  },
  {
    "level": "basic",
    "category": "scenario",
    "question": "[CQRS & event sourcing] **CQRS without events**:",
    "options": {
      "A": "Still split models; sync via other means",
      "B": "Impossible",
      "C": "Must use Kafka",
      "D": "Monolith-only"
    },
    "answer": "A",
    "explanation": "Pragmatic path."
  },
  {
    "level": "basic",
    "category": "theory",
    "question": "[CQRS & event sourcing] **Two DB CQRS**:",
    "options": {
      "A": "Need reliable sync (outbox/stream)",
      "B": "Always one DB",
      "C": "Illegal",
      "D": "Same connection"
    },
    "answer": "A",
    "explanation": "Avoid dual writes."
  },
  {
    "level": "intermediate",
    "category": "code",
    "question": "[CQRS & event sourcing] **Read side scaling**:",
    "options": {
      "A": "Replicas of projections / caches",
      "B": "Vertical only",
      "C": "No scale",
      "D": "Kafka-only"
    },
    "answer": "A",
    "explanation": "Elastic reads."
  },
  {
    "level": "intermediate",
    "category": "scenario",
    "question": "[CQRS & event sourcing] **Hot write aggregate**:",
    "options": {
      "A": "Shard/partition or redesign boundaries",
      "B": "Never happens",
      "C": "Reads-only issue",
      "D": "SQL fixes"
    },
    "answer": "A",
    "explanation": "Concurrency design."
  },
  {
    "level": "intermediate",
    "category": "theory",
    "question": "[CQRS & event sourcing] **Event schema evolution**:",
    "options": {
      "A": "Upcasters / versioned events",
      "B": "Never change",
      "C": "Delete old",
      "D": "REST-only"
    },
    "answer": "A",
    "explanation": "Backward compatible readers."
  },
  {
    "level": "intermediate",
    "category": "code",
    "question": "[CQRS & event sourcing] **Temporal / point-in-time** with ES:",
    "options": {
      "A": "Replay to reconstruct past state",
      "B": "Impossible",
      "C": "Logs-only",
      "D": "SQL-only"
    },
    "answer": "A",
    "explanation": "Audit/debug."
  },
  {
    "level": "intermediate",
    "category": "scenario",
    "question": "[CQRS & event sourcing] **CQRS complexity**:",
    "options": {
      "A": "More components than CRUD",
      "B": "Free",
      "C": "Zero",
      "D": "Tests-only"
    },
    "answer": "A",
    "explanation": "Use when benefits clear."
  },
  {
    "level": "intermediate",
    "category": "theory",
    "question": "[CQRS & event sourcing] **Materialized view refresh**:",
    "options": {
      "A": "Stream processing triggers",
      "B": "Cron only",
      "C": "Manual only",
      "D": "HTTP push"
    },
    "answer": "A",
    "explanation": "Near real-time."
  },
  {
    "level": "intermediate",
    "category": "code",
    "question": "[CQRS & event sourcing] **Idempotent projection**:",
    "options": {
      "A": "Same event twice does not double-apply",
      "B": "Unneeded",
      "C": "Impossible",
      "D": "SQL PK enough"
    },
    "answer": "A",
    "explanation": "At-least-once."
  },
  {
    "level": "intermediate",
    "category": "scenario",
    "question": "[CQRS & event sourcing] **Team ownership** read/write:",
    "options": {
      "A": "May split Conway responsibilities",
      "B": "Always one team",
      "C": "Forbidden",
      "D": "DevOps-only"
    },
    "answer": "A",
    "explanation": "Align boundaries."
  },
  {
    "level": "intermediate",
    "category": "theory",
    "question": "[CQRS & event sourcing] **Read-after-write strong**:",
    "options": {
      "A": "Route to primary or wait",
      "B": "Always default",
      "C": "Impossible in CQRS",
      "D": "Cache-only"
    },
    "answer": "A",
    "explanation": "Latency trade-off."
  },
  {
    "level": "intermediate",
    "category": "code",
    "question": "[CQRS & event sourcing] **Event store vs broker**:",
    "options": {
      "A": "Store is truth; broker transports",
      "B": "Same",
      "C": "Interchangeable",
      "D": "SQS-only"
    },
    "answer": "A",
    "explanation": "Different roles."
  },
  {
    "level": "advanced",
    "category": "scenario",
    "question": "[CQRS & event sourcing] **CQRS security**:",
    "options": {
      "A": "Queries may expose different authz",
      "B": "Same always",
      "C": "No authz",
      "D": "JWT-only"
    },
    "answer": "A",
    "explanation": "Read shape leakage."
  },
  {
    "level": "advanced",
    "category": "theory",
    "question": "[CQRS & event sourcing] **Delete from event log**:",
    "options": {
      "A": "Usually forbidden for compliance truth",
      "B": "Always compact freely",
      "C": "Required",
      "D": "Kafka-only"
    },
    "answer": "A",
    "explanation": "Legal/audit constraints."
  },
  {
    "level": "advanced",
    "category": "code",
    "question": "[CQRS & event sourcing] **Projection failure recovery**:",
    "options": {
      "A": "Replay from checkpoint after fix",
      "B": "Lose all",
      "C": "Ignore",
      "D": "Stop world"
    },
    "answer": "A",
    "explanation": "Deterministic handlers."
  },
  {
    "level": "advanced",
    "category": "scenario",
    "question": "[CQRS & event sourcing] **Reporting** often reads:",
    "options": {
      "A": "Projections / warehouses",
      "B": "Write DB always",
      "C": "Excel only",
      "D": "FTP"
    },
    "answer": "A",
    "explanation": "BI off read models."
  },
  {
    "level": "advanced",
    "category": "theory",
    "question": "[CQRS & event sourcing] **Domain events** naming:",
    "options": {
      "A": "Past tense facts",
      "B": "Imperative verbs",
      "C": "HTTP paths",
      "D": "SQL"
    },
    "answer": "A",
    "explanation": "Clear semantics."
  },
  {
    "level": "advanced",
    "category": "code",
    "question": "[CQRS & event sourcing] **CQRS + DDD**:",
    "options": {
      "A": "Commands target aggregates; queries hit read models",
      "B": "Unrelated",
      "C": "Forbidden",
      "D": "CRUD-only"
    },
    "answer": "A",
    "explanation": "Common pairing."
  },
  {
    "level": "advanced",
    "category": "scenario",
    "question": "[CQRS & event sourcing] **Ordering per aggregate**:",
    "options": {
      "A": "Single stream sequence",
      "B": "Global total order",
      "C": "Random",
      "D": "SQL-only"
    },
    "answer": "A",
    "explanation": "Parallel aggregates OK."
  },
  {
    "level": "advanced",
    "category": "theory",
    "question": "[CQRS & event sourcing] **Cold replay duration**:",
    "options": {
      "A": "Snapshots reduce downtime",
      "B": "Instant always",
      "C": "Impossible",
      "D": "Unneeded"
    },
    "answer": "A",
    "explanation": "Plan maintenance."
  },
  {
    "level": "advanced",
    "category": "code",
    "question": "[CQRS & event sourcing] **Read model staleness UX:**",
    "options": {
      "A": "Show freshness or refresh affordance",
      "B": "Hide",
      "C": "Always fresh",
      "D": "Illegal"
    },
    "answer": "A",
    "explanation": "Transparency."
  },
  {
    "level": "advanced",
    "category": "scenario",
    "question": "[CQRS & event sourcing] **Anti-pattern** one giant projection:",
    "options": {
      "A": "Join-everything view",
      "B": "Best practice",
      "C": "Required",
      "D": "Microservice"
    },
    "answer": "A",
    "explanation": "Split read models."
  }
];
