export default [
  {
    "level": "basic",
    "category": "theory",
    "question": "[Strangler, ACL & advanced patterns] **Strangler fig** migrates by:",
    "options": {
      "A": "Incremental traffic shift behind facade",
      "B": "Big bang only",
      "C": "Never route",
      "D": "DNS only"
    },
    "answer": "A",
    "explanation": "Measure parity."
  },
  {
    "level": "basic",
    "category": "code",
    "question": "[Strangler, ACL & advanced patterns] **ACL** translates:",
    "options": {
      "A": "Foreign/legacy models into your domain",
      "B": "JWT only",
      "C": "SQL plans",
      "D": "CSS"
    },
    "answer": "A",
    "explanation": "Keep core clean."
  },
  {
    "level": "basic",
    "category": "scenario",
    "question": "[Strangler, ACL & advanced patterns] **Feature flags** in migration:",
    "options": {
      "A": "Rollout control + kill switch",
      "B": "Replace tests",
      "C": "Remove logs",
      "D": "UI-only"
    },
    "answer": "A",
    "explanation": "Pair with metrics."
  },
  {
    "level": "basic",
    "category": "theory",
    "question": "[Strangler, ACL & advanced patterns] **Parallel run** (shadow):",
    "options": {
      "A": "Compare legacy vs new outputs",
      "B": "CPU temp",
      "C": "JWT size",
      "D": "DNS"
    },
    "answer": "A",
    "explanation": "Validate correctness."
  },
  {
    "level": "basic",
    "category": "code",
    "question": "[Strangler, ACL & advanced patterns] **ACL tests**:",
    "options": {
      "A": "Table-driven legacy sample mapping",
      "B": "Skip",
      "C": "Manual only",
      "D": "SQL explain"
    },
    "answer": "A",
    "explanation": "CI guardrails."
  },
  {
    "level": "basic",
    "category": "scenario",
    "question": "[Strangler, ACL & advanced patterns] **Monolith first modularize**:",
    "options": {
      "A": "Prove boundaries before splitting",
      "B": "Extract random service",
      "C": "Rewrite all",
      "D": "Delete DB"
    },
    "answer": "A",
    "explanation": "Reduce risk."
  },
  {
    "level": "basic",
    "category": "theory",
    "question": "[Strangler, ACL & advanced patterns] **Database per service** goal:",
    "options": {
      "A": "No shared mutable tables",
      "B": "Shared DB always",
      "C": "One table all",
      "D": "FTP"
    },
    "answer": "A",
    "explanation": "Coupling reduction."
  },
  {
    "level": "basic",
    "category": "code",
    "question": "[Strangler, ACL & advanced patterns] **Synchronous shared DB** choke:",
    "options": {
      "A": "Connection pools couple services",
      "B": "Never happens",
      "C": "NoSQL-only",
      "D": "gRPC-only"
    },
    "answer": "A",
    "explanation": "Strangle data access."
  },
  {
    "level": "basic",
    "category": "scenario",
    "question": "[Strangler, ACL & advanced patterns] **ACL at boundary**:",
    "options": {
      "A": "Single integration edge",
      "B": "Every entity",
      "C": "DB trigger",
      "D": "CDN only"
    },
    "answer": "A",
    "explanation": "Avoid scatter."
  },
  {
    "level": "basic",
    "category": "theory",
    "question": "[Strangler, ACL & advanced patterns] **Tenant-based canary**:",
    "options": {
      "A": "Slice risk per customer segment",
      "B": "Illegal",
      "C": "Random",
      "D": "JWT-only"
    },
    "answer": "A",
    "explanation": "Blast radius."
  },
  {
    "level": "intermediate",
    "category": "code",
    "question": "[Strangler, ACL & advanced patterns] **Observability strangler**:",
    "options": {
      "A": "Compare error/latency old vs new",
      "B": "Skip",
      "C": "Same logs",
      "D": "No metrics"
    },
    "answer": "A",
    "explanation": "SLO gating."
  },
  {
    "level": "intermediate",
    "category": "scenario",
    "question": "[Strangler, ACL & advanced patterns] **Rollback** with flags:",
    "options": {
      "A": "Flip traffic back; keep schema compatible",
      "B": "Delete DB",
      "C": "No rollback",
      "D": "Rewrite"
    },
    "answer": "A",
    "explanation": "Operational safety."
  },
  {
    "level": "intermediate",
    "category": "theory",
    "question": "[Strangler, ACL & advanced patterns] **BFF during migration**:",
    "options": {
      "A": "Route to old/new backends",
      "B": "Unused",
      "C": "GraphQL-only",
      "D": "Illegal"
    },
    "answer": "A",
    "explanation": "Presentation aggregation."
  },
  {
    "level": "intermediate",
    "category": "code",
    "question": "[Strangler, ACL & advanced patterns] **Temporary data duplication**:",
    "options": {
      "A": "Plan convergence to single source",
      "B": "Forbidden",
      "C": "Permanent always",
      "D": "SQL-only"
    },
    "answer": "A",
    "explanation": "Migration realism."
  },
  {
    "level": "intermediate",
    "category": "scenario",
    "question": "[Strangler, ACL & advanced patterns] **Contract tests** on ACL:",
    "options": {
      "A": "Translation invariants in CI",
      "B": "Optional",
      "C": "Replace unit tests",
      "D": "Manual"
    },
    "answer": "A",
    "explanation": "Prevent regressions."
  },
  {
    "level": "intermediate",
    "category": "theory",
    "question": "[Strangler, ACL & advanced patterns] **Kill switch** new stack:",
    "options": {
      "A": "Disable quickly on SLO burn",
      "B": "Unneeded",
      "C": "Illegal",
      "D": "Deploy-only"
    },
    "answer": "A",
    "explanation": "Ops confidence."
  },
  {
    "level": "intermediate",
    "category": "code",
    "question": "[Strangler, ACL & advanced patterns] **Team ownership** per slice:",
    "options": {
      "A": "Matches strangler boundaries",
      "B": "One team all",
      "C": "Random",
      "D": "Managers-only"
    },
    "answer": "A",
    "explanation": "Conway."
  },
  {
    "level": "intermediate",
    "category": "scenario",
    "question": "[Strangler, ACL & advanced patterns] **Hexagonal ports** + ACL:",
    "options": {
      "A": "Adapters at edge",
      "B": "No ports",
      "C": "REST-only",
      "D": "SQL-only"
    },
    "answer": "A",
    "explanation": "Test doubles."
  },
  {
    "level": "intermediate",
    "category": "theory",
    "question": "[Strangler, ACL & advanced patterns] **Strangler adds hop**:",
    "options": {
      "A": "Watch timeouts and latency",
      "B": "No impact",
      "C": "Always faster",
      "D": "CPU-only"
    },
    "answer": "A",
    "explanation": "Tune caches."
  },
  {
    "level": "intermediate",
    "category": "code",
    "question": "[Strangler, ACL & advanced patterns] **Facade responsibilities**:",
    "options": {
      "A": "Routing/translation — not domain rules",
      "B": "All logic",
      "C": "TLS-only",
      "D": "SQL-only"
    },
    "answer": "A",
    "explanation": "Stay thin."
  },
  {
    "level": "advanced",
    "category": "scenario",
    "question": "[Strangler, ACL & advanced patterns] **Decommission legacy** when:",
    "options": {
      "A": "Zero traffic + no hidden dependencies",
      "B": "Immediately",
      "C": "Never",
      "D": "Keep forever"
    },
    "answer": "A",
    "explanation": "Dependency graph."
  },
  {
    "level": "advanced",
    "category": "theory",
    "question": "[Strangler, ACL & advanced patterns] **Runbooks** for flags/routes:",
    "options": {
      "A": "On-call clarity",
      "B": "Skip",
      "C": "Code-only",
      "D": "Wiki-only"
    },
    "answer": "A",
    "explanation": "Operational docs."
  },
  {
    "level": "advanced",
    "category": "code",
    "question": "[Strangler, ACL & advanced patterns] **Security review** migration:",
    "options": {
      "A": "New surfaces and auth paths",
      "B": "Skip",
      "C": "Same as before",
      "D": "WAF-only"
    },
    "answer": "A",
    "explanation": "Threat model delta."
  },
  {
    "level": "advanced",
    "category": "scenario",
    "question": "[Strangler, ACL & advanced patterns] **Dual-run cost**:",
    "options": {
      "A": "Temporary infra + engineering tax",
      "B": "Free",
      "C": "Zero",
      "D": "Cloud bill-only"
    },
    "answer": "A",
    "explanation": "Time-box."
  },
  {
    "level": "advanced",
    "category": "theory",
    "question": "[Strangler, ACL & advanced patterns] **Federation** during strangler:",
    "options": {
      "A": "Unify subgraphs gradually",
      "B": "Illegal",
      "C": "REST-only",
      "D": "SOAP-only"
    },
    "answer": "A",
    "explanation": "Incremental schema."
  },
  {
    "level": "advanced",
    "category": "code",
    "question": "[Strangler, ACL & advanced patterns] **CDC** for data strangler:",
    "options": {
      "A": "Sync legacy to new projections",
      "B": "Impossible",
      "C": "CSV-only",
      "D": "FTP"
    },
    "answer": "A",
    "explanation": "Consistency."
  },
  {
    "level": "advanced",
    "category": "scenario",
    "question": "[Strangler, ACL & advanced patterns] **Stakeholder narrative**:",
    "options": {
      "A": "Incremental wins vs big bang",
      "B": "Irrelevant",
      "C": "Tools-only",
      "D": "Hiring-only"
    },
    "answer": "A",
    "explanation": "Communication."
  },
  {
    "level": "advanced",
    "category": "theory",
    "question": "[Strangler, ACL & advanced patterns] **Post-migration cleanup**:",
    "options": {
      "A": "Remove flags/dead code/ACL if absorbed",
      "B": "Never",
      "C": "Keep all",
      "D": "Delete prod"
    },
    "answer": "A",
    "explanation": "Reduce debt."
  },
  {
    "level": "advanced",
    "category": "code",
    "question": "[Strangler, ACL & advanced patterns] **ACL vs domain service**:",
    "options": {
      "A": "ACL translates; domain implements rules",
      "B": "Same",
      "C": "ACL runs business logic",
      "D": "No difference"
    },
    "answer": "A",
    "explanation": "Separation of concerns."
  },
  {
    "level": "advanced",
    "category": "scenario",
    "question": "[Strangler, ACL & advanced patterns] **Metrics comparison** strangler:",
    "options": {
      "A": "Error budget per path",
      "B": "Ignore",
      "C": "Single metric",
      "D": "Logs-only"
    },
    "answer": "A",
    "explanation": "Data-driven cutover."
  }
];
