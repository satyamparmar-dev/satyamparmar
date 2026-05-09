import { readFileSync, writeFileSync } from 'fs';
const FILE = 'public/data/scenarioInterviewThemes.json';
const F = '```';

const answers = {

'th-jfr-profile': `
## 🔥 The situation

Your Java app is slow in production — high CPU, long request times, mysterious latency spikes. You can't attach a profiler like YourKit because you can't break production. Java Flight Recorder (JFR) is built into the JVM and has near-zero overhead (~1-2%) — you can run it live against a production process and get a detailed profile of what's actually happening.

---

## 🧠 Understand this first

| Concept | What it means |
|---|---|
| **JFR (Java Flight Recorder)** | Built-in JVM profiler — records CPU, memory, GC, I/O, locks, threads, method calls |
| **JMC (Java Mission Control)** | GUI tool to open and analyze \`.jfr\` files |
| **jcmd** | Command-line tool to send commands to a running JVM process |
| **Continuous recording** | JFR can run always, saving to a rolling file — zero-setup, always-on profiling |
| **Method profiling** | JFR samples the call stack every N ms — shows where CPU time is spent |
| **Lock events** | JFR records thread contention — shows what threads are blocking on |

---

## Step 1 — Start a JFR recording on a running process

${F}bash
# Find your Java process PID
jcmd                              # lists all JVM processes

# Start a 60-second recording
jcmd <PID> JFR.start duration=60s filename=/tmp/myapp-profile.jfr name=prod-profile

# Check recording status
jcmd <PID> JFR.check

# Stop early and dump
jcmd <PID> JFR.stop name=prod-profile
${F}

**What you see:**
${F}
Started recording 1. The result will be written to:
/tmp/myapp-profile.jfr
${F}

**Alternative — enable at JVM startup (always-on):**

${F}bash
java \
  -XX:StartFlightRecording=duration=0,filename=recording.jfr,settings=profile,maxsize=100m \
  -jar myapp.jar
# duration=0 → continuous, never stops
# maxsize=100m → oldest data discarded when full (ring buffer)
${F}

---

## Step 2 — Analyze the recording

${F}bash
# Download JMC from adoptium.net or use the CLI summary
jfr summary /tmp/myapp-profile.jfr

# Print CPU-heavy methods
jfr print --events jdk.ExecutionSample /tmp/myapp-profile.jfr | head -50
${F}

**What you see in JMC (open the .jfr file):**

${F}
Method Profiling → Top Methods:
  42%  com.example.OrderService.findOrders()        ← most CPU here
  18%  org.hibernate.SQL.executeQuery()
   9%  com.fasterxml.jackson.databind.ObjectMapper.writeValue()

Lock Instances:
  Thread "http-nio-8080-exec-3" blocked 230ms on java.util.HashMap (shared mutable state!)

GC Events:
  3 G1GC pauses, avg 45ms, max 120ms → investigate
${F}

---

## Step 3 — Diagnose with specific event types

${F}bash
# Find longest method calls
jfr print --events jdk.MethodTiming /tmp/myapp-profile.jfr 2>/dev/null | sort -k5 -rn | head -20

# Find thread blocking events
jfr print --events jdk.ThreadPark,jdk.JavaMonitorWait /tmp/myapp-profile.jfr | head -30

# Find file/network I/O
jfr print --events jdk.FileRead,jdk.SocketRead /tmp/myapp-profile.jfr | head -20
${F}

**What you see (lock contention):**
${F}
jdk.JavaMonitorWait {
  startTime = 14:23:05.123
  duration = 234.5 ms                ← 234ms waiting for a lock!
  monitorClass = java.util.HashMap
  eventThread = "http-nio-8080-exec-3"
  stackTrace = [
    com.example.cache.LocalCache.get(LocalCache.java:45)
    com.example.OrderService.findOrders(OrderService.java:87)
  ]
}
${F}

**What this means:** A shared \`HashMap\` cache is a bottleneck. Replace with \`ConcurrentHashMap\` or Caffeine cache.

---

## Step 4 — Custom JFR events for business metrics

${F}java
@Name("com.example.OrderProcessed")
@Label("Order Processed")
@Category("Business")
public class OrderProcessedEvent extends Event {
    @Label("Order ID")
    public String orderId;

    @Label("Processing Time ms")
    public long processingTimeMs;

    @Label("Item Count")
    public int itemCount;
}

// In your service:
public void processOrder(Order order) {
    OrderProcessedEvent event = new OrderProcessedEvent();
    event.begin();

    // ... process order ...

    event.orderId = order.getId().toString();
    event.itemCount = order.getItems().size();
    event.commit();  // recorded in JFR stream
}
${F}

---

## 💡 Interview answer

**Open:** "We had mysterious latency spikes — p99 was 800ms but we couldn't reproduce it locally. Attaching a profiler in production was too risky."

**Then:** "I used \`jcmd <PID> JFR.start duration=60s\` to capture a live recording with ~1% overhead. Opening it in JMC showed 42% CPU in \`OrderService.findOrders()\` and a \`HashMap\` with 234ms lock contention in our local cache. We replaced it with a \`ConcurrentHashMap\` and the p99 dropped to 120ms."

**End:** "Now JFR runs continuously with \`-XX:StartFlightRecording=maxsize=100m\` — it's a ring buffer so if an incident happens, we dump the last N minutes without needing to set anything up. Custom JFR events let us correlate business operations with JVM-level behavior in the same timeline."
`.trim(),

'th-otel-correlation': `
## 🔥 The situation

A request is slow or fails. You have logs in Service A, Service B, and the database — but you can't correlate them. Which database call in service B was triggered by which user request in service A? Without distributed tracing, you're hunting through unrelated log lines trying to mentally reconstruct a call chain that spans multiple services.

OpenTelemetry (OTel) solves this with a single **trace ID** that flows through every service hop, and **spans** that represent each operation's time and attributes.

---

## 🧠 Understand this first

| Concept | What it means |
|---|---|
| **Trace** | The complete journey of one request across all services |
| **Span** | One operation within a trace (HTTP call, DB query, Kafka publish) |
| **TraceId** | A single ID shared by all spans in one request's journey |
| **SpanId** | Unique ID for each individual span |
| **W3C Trace Context** | HTTP header standard (\`traceparent\`) for propagating trace IDs between services |
| **OTLP** | OpenTelemetry Protocol — how spans are exported to a backend (Jaeger, Tempo, Honeycomb) |

---

## Step 1 — Add OpenTelemetry to Spring Boot

${F}xml
<!-- Spring Boot Actuator with Micrometer Tracing -->
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-tracing-bridge-otel</artifactId>
</dependency>
<dependency>
    <groupId>io.opentelemetry</groupId>
    <artifactId>opentelemetry-exporter-otlp</artifactId>
</dependency>
${F}

${F}yaml
# application.yml
management:
  tracing:
    sampling:
      probability: 1.0    # 1.0 = 100% of requests traced (use 0.1 in high-traffic prod)

spring:
  application:
    name: order-service  # shown in traces

otel:
  exporter:
    otlp:
      endpoint: http://jaeger:4317  # or Tempo, Honeycomb, etc.
${F}

---

## Step 2 — Propagate trace context between services

When Service A calls Service B via RestTemplate or WebClient, the trace ID is automatically propagated if you use auto-instrumented clients:

${F}java
// RestTemplate — inject tracing interceptor
@Bean
public RestTemplate restTemplate(RestTemplateBuilder builder) {
    return builder.build(); // Spring Boot auto-adds ObservationRestTemplateCustomizer
}

// WebClient — tracing works automatically with Spring Boot auto-configuration
@Bean
public WebClient webClient(WebClient.Builder builder) {
    return builder.baseUrl("http://payment-service").build();
}
${F}

**What gets sent in the HTTP header:**
${F}
GET /api/payments HTTP/1.1
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
             ↑  ↑ traceId (16 bytes hex)                ↑ spanId   ↑ flags
${F}

Service B receives this header and creates a child span under the same trace.

---

## Step 3 — Include trace ID in logs for correlation

${F}xml
<!-- logback-spring.xml -->
<pattern>%d{HH:mm:ss} [%thread] %-5level %logger{36}
  [traceId=%X{traceId} spanId=%X{spanId}] - %msg%n</pattern>
${F}

**What your logs look like:**
${F}
# Service A log
14:23:05 [http-exec-1] INFO OrderService [traceId=4bf92f3577b34da6a spanId=00f067aa] - Creating order 123

# Service B log (same traceId!)
14:23:05 [http-exec-3] INFO PaymentService [traceId=4bf92f3577b34da6a spanId=1234abcd] - Charging $99.00

# DB query (same traceId!)
14:23:05 [http-exec-3] DEBUG HikariPool [traceId=4bf92f3577b34da6a spanId=5678efgh] - SELECT * FROM payments
${F}

Now you can grep by \`traceId=4bf92f3577b34da6a\` in Kibana/Grafana and see the entire request journey across all services.

---

## Step 4 — Add custom spans for important operations

${F}java
@Service
public class OrderService {

    private final Tracer tracer;

    public Order createOrder(OrderRequest request) {
        Span span = tracer.nextSpan()
            .name("order.create")
            .tag("order.customerId", request.getCustomerId())
            .tag("order.itemCount", String.valueOf(request.getItems().size()))
            .start();

        try (Tracer.SpanInScope ws = tracer.withSpan(span)) {
            // All spans created inside here are children of this span
            Order order = orderRepository.save(toEntity(request));
            inventoryClient.reserve(order);   // this creates its own child span
            return order;
        } catch (Exception e) {
            span.tag("error", e.getMessage());
            throw e;
        } finally {
            span.end();
        }
    }
}
${F}

**What you see in Jaeger UI:**
${F}
order-service: order.create         ←── 180ms total
  └── order-service: SELECT orders  ←──── 12ms DB
  └── inventory-service: POST /reserve ←── 95ms HTTP
      └── inventory-service: UPDATE stock ← 8ms DB
${F}

---

## 💡 Interview answer

**Open:** "We had a latency spike affecting 5% of orders — the logs showed it, but we couldn't tell if the slowness was in our order service, the downstream payment service, or the database."

**Then:** "I added OpenTelemetry via Micrometer tracing with 10% sampling. The MDC pattern automatically added traceId to every log line. Within an hour of deploying, I searched by a slow traceId in Grafana and saw the Jaeger waterfall — the inventory service was taking 800ms on one specific SKU category, in a synchronous REST call we hadn't noticed was blocking."

**End:** "The fix was async processing for inventory reservation. But the real win was visibility: now every incident starts with 'find the slow traceId, look at the waterfall.' We reduced mean time to diagnose from 40 minutes to under 5."
`.trim(),

'th-obs-sampling-blind': `
## 🔥 The situation

You're tracing 100% of requests in production. Storage costs are exploding. You reduce sampling to 1% to save money. Now a critical bug hits — the exact failing requests aren't in your 1% sample, and you're debugging blind again. How do you balance cost vs coverage?

---

## 🧠 Understand this first

| Concept | What it means |
|---|---|
| **Head-based sampling** | Decision made at the start of a request — cheap but you might miss important traces |
| **Tail-based sampling** | Decision made after the trace completes — can sample 100% of errors, 1% of successes |
| **Adaptive sampling** | Dynamically adjust rate based on traffic patterns (Jaeger, OpenTelemetry Collector support this) |
| **Sampling bias** | 1% sampling means rare errors (0.1% of requests) are almost never captured |
| **Always-sample** | Flag on errors/slow requests — \`RECORD_AND_SAMPLE\` regardless of base rate |

---

## Step 1 — Default to low rate, always capture errors

${F}java
// Custom sampler: 10% of normal traffic, 100% of errors/slow requests
@Bean
public Sampler customSampler() {
    return new Sampler() {
        @Override
        public SamplingResult shouldSample(Context parentContext, String traceId,
                String name, SpanKind spanKind, Attributes attributes,
                List<LinkData> parentLinks) {

            // Always sample if it's an error or tagged as important
            if (attributes.get(AttributeKey.booleanKey("error")) == Boolean.TRUE) {
                return SamplingResult.recordAndSample();
            }

            // 10% of normal requests
            return Math.random() < 0.10
                ? SamplingResult.recordAndSample()
                : SamplingResult.drop();
        }

        @Override public String getDescription() { return "error-always-10pct-default"; }
    };
}
${F}

---

## Step 2 — Use the OpenTelemetry Collector for tail-based sampling

${F}yaml
# otel-collector-config.yaml
processors:
  tail_sampling:
    decision_wait: 10s      # wait 10s for full trace before deciding
    num_traces: 50000       # max traces in memory
    policies:
      - name: always-sample-errors
        type: status_code
        status_code:
          status_codes: [ERROR]    # 100% of error traces

      - name: always-sample-slow
        type: latency
        latency:
          threshold_ms: 500        # 100% of traces > 500ms

      - name: sample-normal
        type: probabilistic
        probabilistic:
          sampling_percentage: 5   # 5% of everything else
${F}

**What this means:** Errors and slow requests are always captured; normal fast requests get 5% sampling. Your storage stays bounded but you never miss an important trace.

---

## Step 3 — Add explicit sampling hints in code

${F}java
@GetMapping("/orders/{id}")
public Order getOrder(@PathVariable Long id) {
    Span span = tracer.currentSpan();

    try {
        Order order = orderService.findById(id);

        if (order.isHighValue()) {
            // Force this trace to be sampled regardless of rate
            span.tag("sample.force", "true");
        }

        return order;
    } catch (Exception e) {
        // Mark error — tail sampler will always keep this trace
        span.tag("error", "true");
        span.tag("error.message", e.getMessage());
        throw e;
    }
}
${F}

---

## Step 4 — Monitor sampling effectiveness

${F}yaml
# Prometheus metrics from OTel Collector
otelcol_processor_tail_sampling_sampling_decision_timer_count
otelcol_processor_tail_sampling_policy_evaluation_decision_count

# Alert: if error sample rate < 100%, something is wrong
- alert: MissedErrorTraces
  expr: |
    rate(otelcol_processor_tail_sampling_policy_evaluation_decision_count{
      policy="always-sample-errors", decision="sampled"}[5m])
    / rate(http_server_requests_total{status=~"5.."}[5m]) < 0.99
  for: 5m
  annotations:
    summary: "Error traces not fully captured"
${F}

---

## 💡 Interview answer

**Open:** "After cutting sampling to 1% for cost, we had an incident where the failing 0.2% of requests were almost never captured — we spent hours trying to reproduce a bug we couldn't trace."

**Then:** "I moved to a tail-based sampling strategy using the OpenTelemetry Collector. The policy: 100% of error traces, 100% of traces > 500ms, 5% of everything else. This dropped storage by 80% while keeping full coverage of what actually matters."

**End:** "The key insight: cost comes from normal successful requests, not errors. Normal traffic at 5% gives you sufficient statistical representation for performance analysis. But you need 100% of errors — they're rare and each one matters. Tail-based sampling is the only way to make that decision correctly because you don't know if a request will error until it's done."
`.trim(),

'th-structured-logging-cost': `
## 🔥 The situation

Your app generates gigabytes of logs per day. Log storage costs are spiraling. Developers are adding \`log.debug()\` everywhere, and some logs have expensive string formatting even when the log level means they'll never be written. You need to make logging cheaper without losing observability.

---

## 🧠 Understand this first

| Concept | What it means |
|---|---|
| **Structured logging** | JSON-format logs with key-value fields — cheaper to search, filter, and index |
| **Log level guard** | \`if (log.isDebugEnabled())\` before expensive message formatting |
| **Lazy logging** | \`log.debug(() -> "expensive " + obj.toString())\` — only evaluates if debug is on |
| **Log aggregation cost** | Typically charged per GB ingested — reducing volume directly cuts cost |
| **MDC** | Mapped Diagnostic Context — per-thread key-value store added to every log line |
| **Sampling logs** | Log 1 in N messages for high-frequency operations |

---

## Step 1 — Switch to structured JSON logging

${F}xml
<!-- pom.xml — add logstash encoder -->
<dependency>
    <groupId>net.logstash.logback</groupId>
    <artifactId>logstash-logback-encoder</artifactId>
    <version>7.4</version>
</dependency>
${F}

${F}xml
<!-- logback-spring.xml -->
<appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
    <encoder class="net.logstash.logback.encoder.LogstashEncoder">
        <includeMdcKeyName>traceId</includeMdcKeyName>
        <includeMdcKeyName>userId</includeMdcKeyName>
        <includeMdcKeyName>requestId</includeMdcKeyName>
    </encoder>
</appender>
${F}

**What plain text logs look like:**
${F}
2024-01-15 14:23:05 INFO OrderService - Processing order 123 for user alice, items=5, total=$99.00
${F}

**What structured logs look like (JSON):**
${F}json
{
  "timestamp": "2024-01-15T14:23:05.123Z",
  "level": "INFO",
  "logger": "OrderService",
  "message": "Processing order",
  "orderId": "123",
  "userId": "alice",
  "itemCount": 5,
  "totalAmount": 99.00,
  "traceId": "4bf92f3577b34da6a"
}
${F}

**Why this saves money:** You can filter logs in the aggregator (Loki, CloudWatch) on fields like \`level=ERROR\` or \`userId=alice\` *before* indexing — you don't pay to store and index DEBUG logs that are never queried.

---

## Step 2 — Fix expensive debug logging

**Bad (always formats the string even if DEBUG is off):**

${F}java
// This String.format runs every time, even if debug logs are disabled
log.debug("Order details: " + order.toDetailedString()); // expensive!
log.debug(String.format("Processing %d items for user %s", items.size(), user.getEmail()));
${F}

**Good (lazy evaluation):**

${F}java
// SLF4J parameterized logging — only formats if DEBUG enabled
log.debug("Processing {} items for user {}", items.size(), user.getEmail());

// Java 8+ lambda — entire expression evaluated lazily
log.debug(() -> "Order details: " + order.toDetailedString()); // only if DEBUG
${F}

**Guard for really expensive operations:**

${F}java
if (log.isDebugEnabled()) {
    // Only runs if debug logging is on
    String diagnostics = buildExpensiveDiagnosticsString(order);
    log.debug("Full diagnostics: {}", diagnostics);
}
${F}

---

## Step 3 — Set appropriate log levels per package

${F}yaml
# application.yml
logging:
  level:
    root: WARN                              # everything defaults to WARN
    com.example: INFO                       # your app code gets INFO
    com.example.service.PaymentService: DEBUG # one noisy service stays DEBUG
    org.hibernate.SQL: DEBUG               # show SQL only in dev
    org.hibernate.type.descriptor: TRACE   # show SQL params — very noisy, dev only
    org.springframework.web: WARN          # Spring internals = WARN only
    com.zaxxer.hikari: WARN               # connection pool = WARN only
${F}

---

## Step 4 — Sample high-frequency logs

${F}java
// For very high-frequency events (millions/hour), log only 1 in 100
private final AtomicLong logCounter = new AtomicLong(0);

public void processEvent(Event event) {
    processInternal(event);

    // Log every 100th event
    if (logCounter.incrementAndGet() % 100 == 0) {
        log.info("Processed event sample - type={} count={}", event.getType(), logCounter.get());
    }
}
${F}

---

## Step 5 — Add MDC for correlation without extra log lines

Instead of logging the user/request on every line, set it once in a filter:

${F}java
@Component
public class MdcFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res,
            FilterChain chain) throws ServletException, IOException {
        try {
            MDC.put("requestId", UUID.randomUUID().toString());
            MDC.put("userId", extractUserId(req));
            chain.doFilter(req, res);
        } finally {
            MDC.clear(); // always clean up to prevent thread pool leaks
        }
    }
}
${F}

Now every log line automatically includes \`userId\` and \`requestId\` without repeating them manually.

---

## 💡 Interview answer

**Open:** "Our log costs were $800/month and growing — developers were adding debug logs freely and some were doing expensive string formatting regardless of log level."

**Then:** "Three changes: First, switched to JSON structured logging with Logstash encoder — this let us filter at the Loki ingestion layer, dropping DEBUG logs before they're indexed. Second, audited all \`log.debug()\` calls for string concatenation and replaced with SLF4J parameterized format or lazy lambdas. Third, set root level to WARN and only elevated our own packages to INFO."

**End:** "Log volume dropped 70% and costs followed. The structured format was the real unlock — we could now write Loki queries like \`{level=\\"ERROR\\"} | json | orderId=\\"123\\"\` instead of full-text searching, which also made incident investigations faster."
`.trim(),

};

const data = JSON.parse(readFileSync(FILE, 'utf8'));
let count = 0;
for (const theme of data.themes) {
  for (const scenario of theme.scenarios) {
    if (answers[scenario.id]) {
      scenario.answer = answers[scenario.id];
      console.log(`✅ ${scenario.id}`);
      count++;
    }
  }
}
writeFileSync(FILE, JSON.stringify(data, null, 2));
console.log(`\nDone — ${count} scenarios rewritten.`);
