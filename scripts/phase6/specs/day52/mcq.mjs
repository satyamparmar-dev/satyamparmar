export default [
  {
    "level": "basic",
    "category": "theory",
    "question": "[Discovery & API gateway] **Service discovery** primarily solves:",
    "options": {
      "A": "Mapping logical names to current instances",
      "B": "Compiling Java",
      "C": "Rendering React",
      "D": "DNS root servers"
    },
    "answer": "A",
    "explanation": "Ephemeral workloads need dynamic resolution."
  },
  {
    "level": "basic",
    "category": "code",
    "question": "[Discovery & API gateway] **Kubernetes readiness** probe should fail when:",
    "options": {
      "A": "Critical dependencies are unavailable",
      "B": "CPU > 1%",
      "C": "Pod name is odd",
      "D": "Logs are JSON"
    },
    "answer": "A",
    "explanation": "Remove bad pods from Service endpoints."
  },
  {
    "level": "basic",
    "category": "scenario",
    "question": "[Discovery & API gateway] **Liveness** probe should stay:",
    "options": {
      "A": "Cheap and process-focused",
      "B": "Same as readiness always",
      "C": "Always HTTP POST to DB",
      "D": "Disabled"
    },
    "answer": "A",
    "explanation": "Avoid restart loops from slow checks."
  },
  {
    "level": "basic",
    "category": "theory",
    "question": "[Discovery & API gateway] API gateway **rate limiting** protects:",
    "options": {
      "A": "Upstream capacity and fairness",
      "B": "Only CSS",
      "C": "JVM heap only",
      "D": "Git history"
    },
    "answer": "A",
    "explanation": "Per key/user/IP as designed."
  },
  {
    "level": "basic",
    "category": "code",
    "question": "[Discovery & API gateway] **TLS termination** at the gateway:",
    "options": {
      "A": "Offloads crypto; still use TLS behind if needed",
      "B": "Removes all encryption",
      "C": "Only for UDP",
      "D": "Illegal in cloud"
    },
    "answer": "A",
    "explanation": "Common edge pattern."
  },
  {
    "level": "basic",
    "category": "scenario",
    "question": "[Discovery & API gateway] **JWT validation** at the edge:",
    "options": {
      "A": "Authenticates caller; services still authorize",
      "B": "Replaces all authz",
      "C": "Means no HTTPS",
      "D": "Only for SOAP"
    },
    "answer": "A",
    "explanation": "Edge authn ≠ resource authz."
  },
  {
    "level": "basic",
    "category": "theory",
    "question": "[Discovery & API gateway] **Request ID / trace** at gateway:",
    "options": {
      "A": "Correlates logs across services",
      "B": "Stores passwords",
      "C": "Replaces metrics",
      "D": "Fixes SQL N+1"
    },
    "answer": "A",
    "explanation": "Propagate context headers."
  },
  {
    "level": "basic",
    "category": "code",
    "question": "[Discovery & API gateway] **WAF** placement vs gateway:",
    "options": {
      "A": "Often in front for exploit filtering",
      "B": "Inside JVM only",
      "C": "After payroll",
      "D": "Same as Redis"
    },
    "answer": "A",
    "explanation": "Different from business authorization."
  },
  {
    "level": "basic",
    "category": "scenario",
    "question": "[Discovery & API gateway] **Path-based routing** sends:",
    "options": {
      "A": "/orders to the orders service",
      "B": "Random instances",
      "C": "Only WebSocket",
      "D": "ICMP packets"
    },
    "answer": "A",
    "explanation": "Declarative routes."
  },
  {
    "level": "basic",
    "category": "theory",
    "question": "[Discovery & API gateway] **Canary** release means:",
    "options": {
      "A": "Small traffic slice to new version",
      "B": "All users instantly",
      "C": "Only databases",
      "D": "Rollback forbidden"
    },
    "answer": "A",
    "explanation": "Measure errors/latency first."
  },
  {
    "level": "intermediate",
    "category": "code",
    "question": "[Discovery & API gateway] **Blue/green** reduces:",
    "options": {
      "A": "Downtime during deploy switch",
      "B": "Need for tests",
      "C": "HTTP entirely",
      "D": "Need for DNS"
    },
    "answer": "A",
    "explanation": "Instant traffic flip between environments."
  },
  {
    "level": "intermediate",
    "category": "scenario",
    "question": "[Discovery & API gateway] **Timeout** at gateway vs client:",
    "options": {
      "A": "Gateway < client budget to return 504 predictably",
      "B": "Always infinite",
      "C": "Client must be shortest",
      "D": "Irrelevant"
    },
    "answer": "A",
    "explanation": "Predictable failure modes."
  },
  {
    "level": "intermediate",
    "category": "theory",
    "question": "[Discovery & API gateway] **Retrying POST** blindly at gateway:",
    "options": {
      "A": "Risky without idempotency end-to-end",
      "B": "Always safe",
      "C": "Forbidden for GET",
      "D": "Fixes duplicates"
    },
    "answer": "A",
    "explanation": "POST retries can duplicate side effects."
  },
  {
    "level": "intermediate",
    "category": "code",
    "question": "[Discovery & API gateway] **Mutual TLS** mesh style:",
    "options": {
      "A": "Service identities between nodes",
      "B": "Public only",
      "C": "Replaces JWT always",
      "D": "No certificates"
    },
    "answer": "A",
    "explanation": "Zero-trust patterns."
  },
  {
    "level": "intermediate",
    "category": "scenario",
    "question": "[Discovery & API gateway] **Sticky sessions** trade:",
    "options": {
      "A": "Easier server state vs harder scaling",
      "B": "No trade-off",
      "C": "Only HTTP/3",
      "D": "Only GraphQL"
    },
    "answer": "A",
    "explanation": "Prefer stateless when possible."
  },
  {
    "level": "intermediate",
    "category": "theory",
    "question": "[Discovery & API gateway] **CORS** enforcement happens in:",
    "options": {
      "A": "Browsers using response headers",
      "B": "Postgres",
      "C": "Kafka",
      "D": "JVM GC"
    },
    "answer": "A",
    "explanation": "Server sets Allow-* headers."
  },
  {
    "level": "intermediate",
    "category": "code",
    "question": "[Discovery & API gateway] **API keys** in query strings:",
    "options": {
      "A": "Often leak via logs/referrers vs headers",
      "B": "Safer than headers",
      "C": "Required by OAuth",
      "D": "Illegal"
    },
    "answer": "A",
    "explanation": "Prefer headers or signed tokens."
  },
  {
    "level": "intermediate",
    "category": "scenario",
    "question": "[Discovery & API gateway] **Global IP rate limit** is:",
    "options": {
      "A": "Coarse hygiene; layer finer limits",
      "B": "Perfect fairness",
      "C": "Replaces auth",
      "D": "Only for gRPC"
    },
    "answer": "A",
    "explanation": "Combine with per-key tiers."
  },
  {
    "level": "intermediate",
    "category": "theory",
    "question": "[Discovery & API gateway] **Backend timeout** shorter than gateway:",
    "options": {
      "A": "Lets gateway return controlled error",
      "B": "Causes hangs",
      "C": "Illegal",
      "D": "Only for SQL"
    },
    "answer": "A",
    "explanation": "Avoid blind proxy waits."
  },
  {
    "level": "intermediate",
    "category": "code",
    "question": "[Discovery & API gateway] **Health checks** hitting dependencies in readiness:",
    "options": {
      "A": "Reflect real ability to serve",
      "B": "Always wrong",
      "C": "Only liveness",
      "D": "Never for Redis"
    },
    "answer": "A",
    "explanation": "Don't route to broken instances."
  },
  {
    "level": "advanced",
    "category": "scenario",
    "question": "[Discovery & API gateway] **BFF / aggregation** at gateway risk:",
    "options": {
      "A": "Becoming a domain monolith",
      "B": "Impossible",
      "C": "No latency",
      "D": "Only for SOAP"
    },
    "answer": "A",
    "explanation": "Keep thin; domain stays in services."
  },
  {
    "level": "advanced",
    "category": "theory",
    "question": "[Discovery & API gateway] **Envoy / data plane** updates via:",
    "options": {
      "A": "Control plane (xDS APIs)",
      "B": "FTP",
      "C": "Manual JVM flags",
      "D": "CSS"
    },
    "answer": "A",
    "explanation": "Dynamic listeners/routes/clusters."
  },
  {
    "level": "advanced",
    "category": "code",
    "question": "[Discovery & API gateway] **DNS-based K8s Service** gives:",
    "options": {
      "A": "Stable name for changing Pod IPs",
      "B": "Static bare-metal forever",
      "C": "No cluster IP",
      "D": "UDP-only routing"
    },
    "answer": "A",
    "explanation": "Kube-proxy or CNI implements."
  },
  {
    "level": "advanced",
    "category": "scenario",
    "question": "[Discovery & API gateway] **Circuit breaker** at edge:",
    "options": {
      "A": "Stops hammering failing upstreams",
      "B": "Replaces unit tests",
      "C": "Fixes SQL",
      "D": "Removes metrics"
    },
    "answer": "A",
    "explanation": "Fail fast; optional fallback."
  },
  {
    "level": "advanced",
    "category": "theory",
    "question": "[Discovery & API gateway] **Max request body** limits:",
    "options": {
      "A": "Protect memory and upstreams",
      "B": "Unlimited always",
      "C": "Only GET",
      "D": "HTTP/2 forbids"
    },
    "answer": "A",
    "explanation": "Reject huge payloads early."
  },
  {
    "level": "advanced",
    "category": "code",
    "question": "[Discovery & API gateway] **IP allowlist** for admin APIs:",
    "options": {
      "A": "Network guardrail before auth",
      "B": "Replaces OAuth",
      "C": "Public only",
      "D": "Same as CORS"
    },
    "answer": "A",
    "explanation": "Defense in depth."
  },
  {
    "level": "advanced",
    "category": "scenario",
    "question": "[Discovery & API gateway] **Observability** per route at gateway:",
    "options": {
      "A": "SLO dashboards for p95/errors",
      "B": "Only stderr",
      "C": "Only build time",
      "D": "CPU temp"
    },
    "answer": "A",
    "explanation": "RED/USE style metrics."
  },
  {
    "level": "advanced",
    "category": "theory",
    "question": "[Discovery & API gateway] **Zero-trust** networking:",
    "options": {
      "A": "Verify every hop; minimal implicit trust",
      "B": "Trust VPC fully",
      "C": "No TLS",
      "D": "No logs"
    },
    "answer": "A",
    "explanation": "Identity + policy everywhere."
  },
  {
    "level": "advanced",
    "category": "code",
    "question": "[Discovery & API gateway] **Header injection** attacks:",
    "options": {
      "A": "Mitigate by validating/normalizing at trusted edge",
      "B": "Impossible in HTTP",
      "C": "Only SQL issue",
      "D": "Only browser"
    },
    "answer": "A",
    "explanation": "Treat headers as untrusted input."
  },
  {
    "level": "advanced",
    "category": "scenario",
    "question": "[Discovery & API gateway] **WebSocket** through gateway needs:",
    "options": {
      "A": "Upgrade handling, idle timeouts, limits",
      "B": "Nothing special",
      "C": "No TLS",
      "D": "FTP upgrade"
    },
    "answer": "A",
    "explanation": "Operational limits still apply."
  }
];
