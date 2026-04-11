export default [
  {
    "level": "basic",
    "category": "theory",
    "question": "[Saga & distributed transactions] **Saga** coordinates long workflows with:",
    "options": {
      "A": "Local transactions + compensations",
      "B": "2PC only",
      "C": "Single DB lock",
      "D": "Cookies"
    },
    "answer": "A",
    "explanation": "Avoid global locks."
  },
  {
    "level": "basic",
    "category": "code",
    "question": "[Saga & distributed transactions] **Compensation** is:",
    "options": {
      "A": "Business-specific undo",
      "B": "Always DELETE row",
      "C": "Automatic always",
      "D": "SQL ROLLBACK only"
    },
    "answer": "A",
    "explanation": "May issue refunds/status reversals."
  },
  {
    "level": "basic",
    "category": "scenario",
    "question": "[Saga & distributed transactions] **Choreography** saga:",
    "options": {
      "A": "Peers react to events without central coordinator",
      "B": "Always orchestrator",
      "C": "No messages",
      "D": "REST-only"
    },
    "answer": "A",
    "explanation": "Loose coupling."
  },
  {
    "level": "basic",
    "category": "theory",
    "question": "[Saga & distributed transactions] **Orchestration** saga:",
    "options": {
      "A": "Coordinator drives state machine",
      "B": "Same as choreography",
      "C": "No persistence",
      "D": "SQL trigger only"
    },
    "answer": "A",
    "explanation": "Central status visibility."
  },
  {
    "level": "basic",
    "category": "code",
    "question": "[Saga & distributed transactions] **2PC** weakness:",
    "options": {
      "A": "Blocking + coordinator failure modes",
      "B": "Always best",
      "C": "No coordinator",
      "D": "Infinite throughput"
    },
    "answer": "A",
    "explanation": "Poor for wide-area."
  },
  {
    "level": "basic",
    "category": "scenario",
    "question": "[Saga & distributed transactions] **Saga timeout** triggers:",
    "options": {
      "A": "Compensation or escalation path",
      "B": "Never used",
      "C": "UI-only",
      "D": "Illegal"
    },
    "answer": "A",
    "explanation": "Bound stuck flows."
  },
  {
    "level": "basic",
    "category": "theory",
    "question": "[Saga & distributed transactions] **Idempotent saga steps**:",
    "options": {
      "A": "Safe when commands/events redelivered",
      "B": "Unnecessary",
      "C": "Impossible",
      "D": "GET-only"
    },
    "answer": "A",
    "explanation": "Networks retry."
  },
  {
    "level": "basic",
    "category": "code",
    "question": "[Saga & distributed transactions] **Saga state store** (orchestrator):",
    "options": {
      "A": "Tracks current step for resume",
      "B": "JWT only",
      "C": "CSS",
      "D": "DNS"
    },
    "answer": "A",
    "explanation": "Durable orchestration."
  },
  {
    "level": "basic",
    "category": "scenario",
    "question": "[Saga & distributed transactions] **Forward recovery**:",
    "options": {
      "A": "Retry failed step",
      "B": "Same as compensation",
      "C": "Only compensation",
      "D": "Only SQL"
    },
    "answer": "A",
    "explanation": "Choose per rules."
  },
  {
    "level": "basic",
    "category": "theory",
    "question": "[Saga & distributed transactions] **Parallel saga branches**:",
    "options": {
      "A": "Need join + aggregated failure handling",
      "B": "Always serial",
      "C": "Forbidden",
      "D": "SQL-only"
    },
    "answer": "A",
    "explanation": "Complex failure modes."
  },
  {
    "level": "intermediate",
    "category": "code",
    "question": "[Saga & distributed transactions] **Human approval** in saga:",
    "options": {
      "A": "Waits with timers/escalations",
      "B": "Impossible",
      "C": "Automated only",
      "D": "No state"
    },
    "answer": "A",
    "explanation": "Workflow engines help."
  },
  {
    "level": "intermediate",
    "category": "scenario",
    "question": "[Saga & distributed transactions] **Duplicate saga start**:",
    "options": {
      "A": "Prevent with business idempotency key",
      "B": "Ignore",
      "C": "Always fine",
      "D": "UUID-only"
    },
    "answer": "A",
    "explanation": "Avoid double orders."
  },
  {
    "level": "intermediate",
    "category": "theory",
    "question": "[Saga & distributed transactions] **Saga vs TCC**:",
    "options": {
      "A": "Different explicitness; both tackle distributed consistency",
      "B": "Identical",
      "C": "Unrelated",
      "D": "Saga is SQL-only"
    },
    "answer": "A",
    "explanation": "Pattern choice."
  },
  {
    "level": "intermediate",
    "category": "code",
    "question": "[Saga & distributed transactions] **Poison saga message**:",
    "options": {
      "A": "DLQ + stuck instance handling",
      "B": "Ignored",
      "C": "Self-heals",
      "D": "Metrics-only"
    },
    "answer": "A",
    "explanation": "Runbooks."
  },
  {
    "level": "intermediate",
    "category": "scenario",
    "question": "[Saga & distributed transactions] **Compensation order** often:",
    "options": {
      "A": "Reverse forward dependencies",
      "B": "Random",
      "C": "Same as forward",
      "D": "Alphabetical"
    },
    "answer": "A",
    "explanation": "Depends on domain."
  },
  {
    "level": "intermediate",
    "category": "theory",
    "question": "[Saga & distributed transactions] **Distributed lock** for saga:",
    "options": {
      "A": "Sometimes used — mind availability",
      "B": "Always required",
      "C": "Never used",
      "D": "Redis-only"
    },
    "answer": "A",
    "explanation": "Prefer idempotent design."
  },
  {
    "level": "intermediate",
    "category": "code",
    "question": "[Saga & distributed transactions] **Event sourcing + saga**:",
    "options": {
      "A": "Audit trail of workflow steps",
      "B": "Incompatible",
      "C": "No events",
      "D": "Batch-only"
    },
    "answer": "A",
    "explanation": "Traceability."
  },
  {
    "level": "intermediate",
    "category": "scenario",
    "question": "[Saga & distributed transactions] **Compensation failure**:",
    "options": {
      "A": "Escalate manually / alert",
      "B": "Impossible",
      "C": "Auto success",
      "D": "Ignore"
    },
    "answer": "A",
    "explanation": "Runbooks critical."
  },
  {
    "level": "intermediate",
    "category": "theory",
    "question": "[Saga & distributed transactions] **Saga monitoring**:",
    "options": {
      "A": "Per-instance completion/stuck metrics",
      "B": "Unneeded",
      "C": "CPU-only",
      "D": "Logs-only"
    },
    "answer": "A",
    "explanation": "Business SLO."
  },
  {
    "level": "intermediate",
    "category": "code",
    "question": "[Saga & distributed transactions] **Semantic lock / Try** (TCC):",
    "options": {
      "A": "Reserve resources in try phase",
      "B": "HTTP lock",
      "C": "DB only",
      "D": "JWT"
    },
    "answer": "A",
    "explanation": "TCC pattern."
  },
  {
    "level": "advanced",
    "category": "scenario",
    "question": "[Saga & distributed transactions] **Choreography observability**:",
    "options": {
      "A": "Correlation id across events",
      "B": "Easy always",
      "C": "Impossible",
      "D": "Orchestrator-only"
    },
    "answer": "A",
    "explanation": "Tracing required."
  },
  {
    "level": "advanced",
    "category": "theory",
    "question": "[Saga & distributed transactions] **Orchestrator HA**:",
    "options": {
      "A": "Stateful — needs HA + persistence",
      "B": "Stateless always",
      "C": "No backup",
      "D": "Irrelevant"
    },
    "answer": "A",
    "explanation": "Design recovery."
  },
  {
    "level": "advanced",
    "category": "code",
    "question": "[Saga & distributed transactions] **Saga + outbox**:",
    "options": {
      "A": "Reliable event emission with state changes",
      "B": "Unrelated",
      "C": "Replace saga",
      "D": "REST-only"
    },
    "answer": "A",
    "explanation": "Transactional messaging."
  },
  {
    "level": "advanced",
    "category": "scenario",
    "question": "[Saga & distributed transactions] **Partial fan-out failure**:",
    "options": {
      "A": "Define per-branch compensation",
      "B": "Always all-or-nothing",
      "C": "Ignore",
      "D": "SQL-only"
    },
    "answer": "A",
    "explanation": "Document invariants."
  },
  {
    "level": "advanced",
    "category": "theory",
    "question": "[Saga & distributed transactions] **Long-running saga** storage:",
    "options": {
      "A": "Durable for hours/days if needed",
      "B": "Memory-only",
      "C": "No storage",
      "D": "Redis-only"
    },
    "answer": "A",
    "explanation": "Business dependent."
  },
  {
    "level": "advanced",
    "category": "code",
    "question": "[Saga & distributed transactions] **Saga step versioning**:",
    "options": {
      "A": "Add compatible steps during upgrades",
      "B": "Never change",
      "C": "Delete old",
      "D": "URL-only"
    },
    "answer": "A",
    "explanation": "Rolling deploys."
  },
  {
    "level": "advanced",
    "category": "scenario",
    "question": "[Saga & distributed transactions] **Testing sagas**:",
    "options": {
      "A": "Scenario tests + failure injection",
      "B": "Unit only",
      "C": "No tests",
      "D": "Manual only"
    },
    "answer": "A",
    "explanation": "Validate compensations."
  },
  {
    "level": "advanced",
    "category": "theory",
    "question": "[Saga & distributed transactions] **Business invariants** mid-saga:",
    "options": {
      "A": "Define acceptable partial states",
      "B": "Not needed",
      "C": "Always strong",
      "D": "ACID-only"
    },
    "answer": "A",
    "explanation": "UX for interim."
  },
  {
    "level": "advanced",
    "category": "code",
    "question": "[Saga & distributed transactions] **Saga vs nightly batch**:",
    "options": {
      "A": "Event-driven interactive flow",
      "B": "Same",
      "C": "Saga is cron",
      "D": "SQL-only"
    },
    "answer": "A",
    "explanation": "Different triggers."
  },
  {
    "level": "advanced",
    "category": "scenario",
    "question": "[Saga & distributed transactions] **Terminal saga states**:",
    "options": {
      "A": "Completed or compensated",
      "B": "Always running",
      "C": "Only failed",
      "D": "Infinite loop"
    },
    "answer": "A",
    "explanation": "Retention policies."
  }
];
