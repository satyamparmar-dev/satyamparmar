export default [
  {
    "level": "basic",
    "category": "theory",
    "question": "[Feign, WebClient & resilience] **Circuit breaker OPEN**:",
    "options": {
      "A": "Fails fast without calling failing dependency",
      "B": "Always calls through",
      "C": "Only for GET",
      "D": "Waits forever"
    },
    "answer": "A",
    "explanation": "Protects thread pools."
  },
  {
    "level": "basic",
    "category": "code",
    "question": "[Feign, WebClient & resilience] **Half-open** state:",
    "options": {
      "A": "Allows limited probes",
      "B": "Unlimited traffic",
      "C": "Only UDP",
      "D": "Disables metrics"
    },
    "answer": "A",
    "explanation": "Close or reopen based on probe outcomes."
  },
  {
    "level": "basic",
    "category": "scenario",
    "question": "[Feign, WebClient & resilience] **Client timeout** should align with:",
    "options": {
      "A": "SLA slice and downstream budgets",
      "B": "Always infinite",
      "C": "Random",
      "D": "Only CPU"
    },
    "answer": "A",
    "explanation": "Bound tail latency."
  },
  {
    "level": "basic",
    "category": "theory",
    "question": "[Feign, WebClient & resilience] **Bulkhead** pattern:",
    "options": {
      "A": "Isolates thread pools per dependency",
      "B": "Shares one pool always",
      "C": "Only for SQL",
      "D": "DNS feature"
    },
    "answer": "A",
    "explanation": "Contain blast radius."
  },
  {
    "level": "basic",
    "category": "code",
    "question": "[Feign, WebClient & resilience] **Retry with jitter**:",
    "options": {
      "A": "Spreads retries to avoid thundering herd",
      "B": "Always immediate",
      "C": "Only GraphQL",
      "D": "Illegal"
    },
    "answer": "A",
    "explanation": "Exponential backoff + jitter."
  },
  {
    "level": "basic",
    "category": "scenario",
    "question": "[Feign, WebClient & resilience] **Feign** in Spring Cloud:",
    "options": {
      "A": "Declarative HTTP with interceptors",
      "B": "JPA implementation",
      "C": "Kafka client",
      "D": "Webpack plugin"
    },
    "answer": "A",
    "explanation": "Plugs resilience filters."
  },
  {
    "level": "basic",
    "category": "theory",
    "question": "[Feign, WebClient & resilience] **WebClient** vs **RestTemplate**:",
    "options": {
      "A": "WebClient is non-blocking; RestTemplate maintenance mode",
      "B": "Identical",
      "C": "RestTemplate is reactive",
      "D": "WebClient is JDBC"
    },
    "answer": "A",
    "explanation": "Prefer WebClient for new code."
  },
  {
    "level": "basic",
    "category": "code",
    "question": "[Feign, WebClient & resilience] **ExchangeFilterFunction** can:",
    "options": {
      "A": "Add tracing headers and metrics",
      "B": "Parse PDF",
      "C": "Compile protos",
      "D": "Replace SQL"
    },
    "answer": "A",
    "explanation": "Cross-cutting client concerns."
  },
  {
    "level": "basic",
    "category": "scenario",
    "question": "[Feign, WebClient & resilience] **Micrometer** on outbound calls:",
    "options": {
      "A": "Timers/counters by host/route/status",
      "B": "Replaces logging",
      "C": "Disables TLS",
      "D": "Fixes sagas"
    },
    "answer": "A",
    "explanation": "Dashboards and alerts."
  },
  {
    "level": "basic",
    "category": "theory",
    "question": "[Feign, WebClient & resilience] **429** from downstream should:",
    "options": {
      "A": "Respect Retry-After / backoff policy",
      "B": "Retry instantly forever",
      "C": "Map to 200",
      "D": "Ignore"
    },
    "answer": "A",
    "explanation": "Cooperative clients."
  },
  {
    "level": "intermediate",
    "category": "code",
    "question": "[Feign, WebClient & resilience] **Connection pool** exhaustion:",
    "options": {
      "A": "Threads wait; tune pool and concurrency",
      "B": "Means fast system",
      "C": "Only UI symptom",
      "D": "Impossible"
    },
    "answer": "A",
    "explanation": "Watch pool pending metrics."
  },
  {
    "level": "intermediate",
    "category": "scenario",
    "question": "[Feign, WebClient & resilience] **Retry POST** safely when:",
    "options": {
      "A": "Server is idempotent or Idempotency-Key used",
      "B": "Always",
      "C": "Never for payment",
      "D": "Only with GET"
    },
    "answer": "A",
    "explanation": "Know the contract."
  },
  {
    "level": "intermediate",
    "category": "theory",
    "question": "[Feign, WebClient & resilience] **Shed load** under overload:",
    "options": {
      "A": "Return 503 quickly to protect survival",
      "B": "Queue forever",
      "C": "Hide errors",
      "D": "Disable metrics"
    },
    "answer": "A",
    "explanation": "Prefer explicit degradation."
  },
  {
    "level": "intermediate",
    "category": "code",
    "question": "[Feign, WebClient & resilience] **Fallback** responses:",
    "options": {
      "A": "Should be safe and documented degradation",
      "B": "Hide all failures",
      "C": "Always throw",
      "D": "Block threads"
    },
    "answer": "A",
    "explanation": "Users understand limited mode."
  },
  {
    "level": "intermediate",
    "category": "scenario",
    "question": "[Feign, WebClient & resilience] **Cascading failure**:",
    "options": {
      "A": "One slow dep stalls many requests",
      "B": "Impossible in microservices",
      "C": "Only monoliths",
      "D": "Fixed by REST"
    },
    "answer": "A",
    "explanation": "Isolation + timeouts + bulkheads."
  },
  {
    "level": "intermediate",
    "category": "theory",
    "question": "[Feign, WebClient & resilience] **Reactive backpressure**:",
    "options": {
      "A": "Signals demand to producers",
      "B": "Infinite buffer",
      "C": "JDBC-only",
      "D": "DNS"
    },
    "answer": "A",
    "explanation": "Avoid unbounded queues."
  },
  {
    "level": "intermediate",
    "category": "code",
    "question": "[Feign, WebClient & resilience] **Client-side load balancing** (Spring):",
    "options": {
      "A": "Pick instance per call with health",
      "B": "Static IP only",
      "C": "Server-side only",
      "D": "No discovery"
    },
    "answer": "A",
    "explanation": "Works with registry."
  },
  {
    "level": "intermediate",
    "category": "scenario",
    "question": "[Feign, WebClient & resilience] **Feign FULL logging** in prod:",
    "options": {
      "A": "PII/volume risk — prefer BASIC/NONE",
      "B": "Always required",
      "C": "Replaces traces",
      "D": "Fixes pool"
    },
    "answer": "A",
    "explanation": "Balance observability."
  },
  {
    "level": "intermediate",
    "category": "theory",
    "question": "[Feign, WebClient & resilience] **ErrorDecoder** in Feign:",
    "options": {
      "A": "Maps HTTP errors to typed exceptions",
      "B": "Replaces TLS",
      "C": "Runs migrations",
      "D": "Parses YAML"
    },
    "answer": "A",
    "explanation": "Cleaner application handling."
  },
  {
    "level": "intermediate",
    "category": "code",
    "question": "[Feign, WebClient & resilience] **WebClientResponseException**:",
    "options": {
      "A": "Represents 4xx/5xx with status/body hints",
      "B": "Never thrown",
      "C": "Only for SOAP",
      "D": "JDBC error"
    },
    "answer": "A",
    "explanation": "Handle explicitly."
  },
  {
    "level": "advanced",
    "category": "scenario",
    "question": "[Feign, WebClient & resilience] **Resilience4j Retry** maxAttempts:",
    "options": {
      "A": "Trade success vs added latency",
      "B": "Always 1",
      "C": "Infinite default",
      "D": "Only SQL"
    },
    "answer": "A",
    "explanation": "Tune with budgets."
  },
  {
    "level": "advanced",
    "category": "theory",
    "question": "[Feign, WebClient & resilience] **TimeLimiter**:",
    "options": {
      "A": "Bounds async call duration",
      "B": "Only JDBC",
      "C": "DNS only",
      "D": "Git"
    },
    "answer": "A",
    "explanation": "Fail long hangs."
  },
  {
    "level": "advanced",
    "category": "code",
    "question": "[Feign, WebClient & resilience] **RateLimiter** client-side:",
    "options": {
      "A": "Self-throttle to protect downstream",
      "B": "Replace server limits",
      "C": "Illegal",
      "D": "Only GraphQL"
    },
    "answer": "A",
    "explanation": "Align with server policy."
  },
  {
    "level": "advanced",
    "category": "scenario",
    "question": "[Feign, WebClient & resilience] **Distributed tracing** on client:",
    "options": {
      "A": "Create child span per outbound call",
      "B": "Replace logs",
      "C": "Remove timeouts",
      "D": "Fix schema"
    },
    "answer": "A",
    "explanation": "Propagate W3C/b3 headers."
  },
  {
    "level": "advanced",
    "category": "theory",
    "question": "[Feign, WebClient & resilience] **Hystrix** today:",
    "options": {
      "A": "Maintenance; Resilience4j preferred",
      "B": "Default Boot 3",
      "C": "Faster than WebClient",
      "D": "Required"
    },
    "answer": "A",
    "explanation": "Modern Spring Cloud stack."
  },
  {
    "level": "advanced",
    "category": "code",
    "question": "[Feign, WebClient & resilience] **OkHttp / JDK client** tuning:",
    "options": {
      "A": "Pool max idle and keep-alive matter",
      "B": "No tuning",
      "C": "Only server",
      "D": "Banned"
    },
    "answer": "A",
    "explanation": "Match concurrency to workload."
  },
  {
    "level": "advanced",
    "category": "scenario",
    "question": "[Feign, WebClient & resilience] **DNS caching** staleness:",
    "options": {
      "A": "Can cause mysterious connection failures",
      "B": "Never happens",
      "C": "IPv6 only",
      "D": "Fixes saga"
    },
    "answer": "A",
    "explanation": "Refresh strategies matter."
  },
  {
    "level": "advanced",
    "category": "theory",
    "question": "[Feign, WebClient & resilience] **HTTP/2** multiplexing:",
    "options": {
      "A": "One connection, many streams",
      "B": "One request only",
      "C": "No flow control",
      "D": "No TLS"
    },
    "answer": "A",
    "explanation": "Still need per-stream timeouts."
  },
  {
    "level": "advanced",
    "category": "code",
    "question": "[Feign, WebClient & resilience] **Chaos experiments** on clients:",
    "options": {
      "A": "Validate timeouts/breakers in lower envs",
      "B": "Only production",
      "C": "Replace unit tests",
      "D": "Disable retries"
    },
    "answer": "A",
    "explanation": "Inject latency/faults."
  },
  {
    "level": "advanced",
    "category": "scenario",
    "question": "[Feign, WebClient & resilience] **Thread starvation** symptom:",
    "options": {
      "A": "All workers blocked on slow I/O",
      "B": "Low CPU always",
      "C": "Fast p99",
      "D": "No timeouts"
    },
    "answer": "A",
    "explanation": "Bulkheads/timeouts help."
  }
];
