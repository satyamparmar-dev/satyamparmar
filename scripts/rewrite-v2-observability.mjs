/**
 * V2 rewrite — observability-production (2 scenarios)
 * Run: node scripts/rewrite-v2-observability.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
const FILE = 'public/data/scenarioInterviewThemes.json';
const F = '```';

const answers = {

'th-obs-slow-users': `
## 🔥 The situation
Some users say the app is slow. Others say it's fine. There's no obvious pattern. Your dashboards show average response time is 120ms — looks good. But the slow users are experiencing 8-second responses. How do you find who is slow, why, and fix it?

## 🧠 Why "average" hides the problem

${F}text
Imagine 100 users:
  90 users: response in 50ms
  9 users:  response in 200ms
  1 user:   response in 8000ms

Average = (90×50 + 9×200 + 1×8000) / 100 = 136ms  ← looks fine!

But that 1 user is experiencing 8 seconds — completely broken for them.
This is why you monitor percentiles, not averages.

P50 = 50ms   (half of users get this or better)
P90 = 200ms  (90% of users get this or better)
P99 = 8000ms (99% of users get this or better — the worst 1%)
P99.9 = ?    (worst 0.1% — the tail)
${F}

**The rule:** Always watch P99 and P99.9. If P99 is bad, 1 in 100 users is suffering right now.

## Step 1: Fix your dashboards — switch from average to percentiles
${F}bash
# In Prometheus, measure latency with a histogram (not a gauge)
# Spring Boot Actuator + Micrometer does this automatically

# Prometheus query — P99 latency for /api/orders endpoint:
histogram_quantile(0.99,
  rate(http_server_requests_seconds_bucket{uri="/api/orders"}[5m])
)

# P50 (median):
histogram_quantile(0.50,
  rate(http_server_requests_seconds_bucket{uri="/api/orders"}[5m])
)

# P99.9 (worst 0.1%):
histogram_quantile(0.999,
  rate(http_server_requests_seconds_bucket{uri="/api/orders"}[5m])
)
${F}

**What you see in Grafana:**
${F}text
P50:   52ms   ← most users fine
P90:  190ms   ← still acceptable
P99:  7800ms  ← 1 in 100 users waits 7.8 seconds ← THIS is the problem
P99.9: 12000ms ← worst 0.1% waits 12 seconds
${F}

## Step 2: Find WHICH requests are slow — look at traces, not logs
${F}bash
# With Micrometer Tracing + Zipkin configured:
# application.yml:
management:
  tracing:
    sampling:
      probability: 1.0   # trace all requests (use 0.1 in prod — 10% sampling)
spring:
  zipkin:
    base-url: http://zipkin:9411
${F}

${F}bash
# In Zipkin UI — search for slow traces
# Filter: minDuration=5000ms (show only traces that took more than 5 seconds)
# http://zipkin:9411 → Search → Min Duration: 5000ms
${F}

**What you see in Zipkin for a slow trace:**
${F}text
Trace: 4bf92f3577b34da6  Total: 7800ms
  order-service      GET /api/orders/99          0ms → 7800ms  [7800ms]
    ├── DB query: findOrderById                 2ms → 25ms     [23ms]      ← fast
    ├── inventoryService.getItems()            25ms → 125ms    [100ms]     ← fast
    ├── customerService.getProfile()           125ms → 7750ms  [7625ms]    ← 🔴 THIS
    └── format response                        7750ms → 7800ms [50ms]
${F}
**What this means (simple):** The waterfall makes it obvious. \`customerService.getProfile()\` is taking 7.6 seconds. All other steps are fast. The problem is NOT in order-service — it's in customer-service, or in the connection to it.

## Step 3: Investigate the slow service (customerService)
${F}bash
# Check customerService's own P99 latency
histogram_quantile(0.99,
  rate(http_server_requests_seconds_bucket{service="customer-service"}[5m])
)
${F}

${F}text
P99 for customer-service: 7400ms  ← customer-service itself is slow
${F}

${F}bash
# Look at customer-service traces — find the slow internal span
# In Zipkin: filter by service=customer-service, minDuration=5000ms
${F}

**What you see in customer-service trace:**
${F}text
customerService  GET /profile/{id}               0ms → 7400ms
  ├── Redis cache lookup                          2ms → 5ms       [3ms]   ← fast (miss)
  ├── DB query: SELECT * FROM customers...        5ms → 7380ms    [7375ms] ← 🔴 HERE
  └── serialize response                         7380ms → 7400ms  [20ms]
${F}

${F}bash
# Check the slow DB query
EXPLAIN ANALYZE SELECT * FROM customers WHERE email = 'alice@example.com';
${F}

**What you see:**
${F}text
Seq Scan on customers  (cost=0.00..45230.00 rows=1 width=200)
  Filter: ((email)::text = 'alice@example.com'::text)
  Rows Removed by Filter: 2847391
  Actual total time: 7312ms
  Planning time: 0.5ms
${F}
**What this means (simple):** The database scanned all 2.8 million customer rows to find the one with this email. There's no index on the email column. 7 seconds for a query that should take 1ms.

**Fix:**
${F}sql
CREATE INDEX CONCURRENTLY idx_customers_email ON customers(email);
-- CONCURRENTLY = doesn't lock the table during creation (safe for production)
${F}

**After adding the index:**
${F}bash
EXPLAIN ANALYZE SELECT * FROM customers WHERE email = 'alice@example.com';
${F}
${F}text
Index Scan using idx_customers_email on customers
  Index Cond: (email = 'alice@example.com')
  Actual total time: 0.8ms  ← 7312ms → 0.8ms!
${F}

## Step 4: Set up proper alerts — alert on P99, not average
${F}yaml
# Prometheus alert — fire when P99 latency exceeds 2 seconds
groups:
- name: latency-alerts
  rules:
  - alert: HighP99Latency
    expr: |
      histogram_quantile(0.99,
        rate(http_server_requests_seconds_bucket[5m])
      ) > 2
    for: 5m  # sustained for 5 minutes (ignore brief spikes)
    labels:
      severity: warning
    annotations:
      summary: "P99 latency for {{ $labels.service }} is {{ $value | humanizeDuration }}"
      description: "1 in 100 users is experiencing latency above 2 seconds."
${F}

**What you see in PagerDuty/Slack:**
${F}text
🔴 ALERT: HighP99Latency
  service: customer-service
  uri: /profile/{id}
  p99_latency: 7.4s
  duration: 6 minutes
  → Check traces in Zipkin, then EXPLAIN ANALYZE on slow queries
${F}

## Step 5: Add user-context to traces for easier filtering
${F}java
// Add user ID and customer tier to trace context — helps find patterns
@Component
public class UserContextFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest req,
                                    HttpServletResponse resp,
                                    FilterChain chain) throws IOException, ServletException {
        String userId = req.getHeader("X-User-Id");
        String tier = req.getHeader("X-User-Tier"); // FREE, PRO, ENTERPRISE

        if (userId != null) {
            // Add to MDC — appears in every log line for this request
            MDC.put("userId", userId);
            MDC.put("userTier", tier);

            // Add to trace — appears in Zipkin span for this request
            Span currentSpan = tracer.currentSpan();
            if (currentSpan != null) {
                currentSpan.tag("user.id", userId);
                currentSpan.tag("user.tier", tier != null ? tier : "unknown");
            }
        }
        try {
            chain.doFilter(req, resp);
        } finally {
            MDC.clear();
        }
    }
}
${F}

**What you see in Zipkin with user context:**
${F}text
Trace: 4bf92f3577b34da6
  Tags: user.id=alice-123, user.tier=FREE, http.status=200

// Now you can filter: "show me all slow traces for FREE tier users"
// Pattern: FREE tier users always hit the slow path → maybe caching is only for PRO tier?
${F}

## Your interview answer
**Open:** "Average latency hides tail latency problems. I'd fix dashboards to show P99 — the slowest 1% of requests. If P99 is 8 seconds, 1 in 100 users is suffering right now even if average looks fine."
**Then:** "With distributed tracing (Zipkin/Jaeger), I'd filter for slow traces and look at the waterfall — it shows exactly which service and which DB query is slow. In this case, a missing DB index was the culprit — 7 seconds dropped to 1ms after adding it."
**End:** "Alerts should fire on P99, not average. Add user context (user ID, tier) to traces so you can find patterns — maybe only users on a certain plan or region are hitting the slow path."
`.trim(),

'th-obs-500-no-logs': `
## 🔥 The situation
Users report getting 500 Internal Server Error responses. You look at your logs — nothing. No stack traces, no error messages. The errors are invisible. How do you find what's going wrong when your logging system shows nothing?

## 🧠 Why 500 errors appear with no logs

| Root cause | What happens | Why no logs |
|---|---|---|
| Swallowed exception | catch(Exception e) {} — exception caught and ignored | Code explicitly hides the error |
| Wrong log level | Exception logged at DEBUG but production is INFO | Log is there — just filtered out |
| Logging before response | Error happens in a filter AFTER logging | Logger sees 200, HTTP sends 500 |
| Out-of-memory crash | JVM dies mid-request | No time to log — process is gone |
| Framework exception | Spring Security, serialization errors — framework doesn't log them by default | Framework catches and returns 500 silently |
| Log aggregation broken | Logs written but not shipped to ELK/Loki | Logs exist on disk, not in your dashboard |

## Step 1: Find the 500s — check access logs (they always log status codes)
${F}bash
# Even if application logs are empty, the web server access log captures everything
# In Spring Boot, enable access logging:
# application.yml:
server:
  tomcat:
    accesslog:
      enabled: true
      pattern: "%h %l %u %t \"%r\" %s %b %D"
      # %s = status code, %D = duration in ms, %r = request line
${F}

${F}bash
# Tail the access log during the issue
tail -f /logs/access.log | grep " 500 "
${F}

**What you see:**
${F}text
192.168.1.50 - - [10/Mar/2024:10:23:01] "POST /api/orders HTTP/1.1" 500 0 1247
192.168.1.51 - - [10/Mar/2024:10:23:03] "POST /api/orders HTTP/1.1" 500 0 2103
192.168.1.52 - - [10/Mar/2024:10:23:05] "POST /api/orders HTTP/1.1" 500 0 891
${F}
**What this means (simple):** The access log shows 500s happening on POST /api/orders. Duration: 1247ms, 2103ms, 891ms. Status code 500 confirmed. Now we know WHERE — now we need to find out WHY there are no application logs.

## Step 2: Find swallowed exceptions — the most common cause
${F}java
// BAD: swallowed exception — error silently ignored
@PostMapping("/orders")
public ResponseEntity<Order> createOrder(@RequestBody CreateOrderRequest request) {
    try {
        Order order = orderService.create(request);
        return ResponseEntity.ok(order);
    } catch (Exception e) {
        // ← NOTHING HERE — exception swallowed, 500 returned with no log!
        return ResponseEntity.internalServerError().build();
    }
}

// ALSO BAD: logged at wrong level
} catch (Exception e) {
    log.debug("Error creating order: {}", e.getMessage()); // debug = invisible in prod
    return ResponseEntity.internalServerError().build();
}
${F}

${F}java
// GOOD: always log exceptions with full stack trace
@PostMapping("/orders")
public ResponseEntity<Order> createOrder(@RequestBody CreateOrderRequest request) {
    try {
        Order order = orderService.create(request);
        return ResponseEntity.ok(order);
    } catch (Exception e) {
        log.error("Failed to create order for request {}: {}", request, e.getMessage(), e);
        // ↑ note: pass 'e' as the last argument to get the full stack trace in the log
        return ResponseEntity.internalServerError()
            .body(new ErrorResponse("Order creation failed", e.getMessage()));
    }
}
${F}

**What you see in logs after fix:**
${F}text
ERROR OrderController - Failed to create order for request {...}: Duplicate entry 'ord-99'
java.sql.SQLIntegrityConstraintViolationException: Duplicate entry 'ord-99' for key 'PRIMARY'
    at com.mysql.cj.jdbc.exceptions.SQLError.createSQLException(...)
    at com.example.OrderService.create(OrderService.java:45)
    at com.example.OrderController.createOrder(OrderController.java:28)
// Now you know exactly what's failing and on which line!
${F}

## Step 3: Add a global exception handler to catch everything
${F}java
// One handler catches ALL uncaught exceptions — nothing can slip through
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // Handle all unexpected exceptions (500)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleAll(Exception e, HttpServletRequest req) {
        // Always log with full stack trace at ERROR level
        log.error("Unhandled exception on {} {}: {}",
            req.getMethod(), req.getRequestURI(), e.getMessage(), e);

        return ResponseEntity.status(500).body(
            new ErrorResponse(
                "Internal server error",
                "An unexpected error occurred. Trace ID: " + getCurrentTraceId()
            )
        );
    }

    // Handle specific known exceptions (400, 404, etc.)
    @ExceptionHandler(OrderNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(OrderNotFoundException e) {
        log.warn("Order not found: {}", e.getMessage()); // WARN, not ERROR
        return ResponseEntity.status(404).body(new ErrorResponse("Not found", e.getMessage()));
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidation(ValidationException e) {
        log.info("Validation failed: {}", e.getMessage()); // INFO, expected case
        return ResponseEntity.status(400).body(new ErrorResponse("Validation error", e.getMessage()));
    }

    private String getCurrentTraceId() {
        Span span = tracer.currentSpan();
        return span != null ? span.context().traceId() : "no-trace";
    }
}
${F}

**What you see when an unhandled exception is caught:**
${F}text
ERROR GlobalExceptionHandler - Unhandled exception on POST /api/orders:
      Cannot deserialize value of type String from Array value
      com.fasterxml.jackson.databind.exc.MismatchedInputException: Cannot deserialize...
        at com.example.OrderController.createOrder(OrderController.java:28)
// The request body had wrong JSON structure — Jackson failed to parse it
// Returned to client: { "error": "Internal server error", "traceId": "4bf92f3577b34da6" }
${F}

## Step 4: Check log pipeline — logs might exist but not be reaching your dashboard
${F}bash
# If using ELK (Elasticsearch + Logstash + Kibana):

# Step 1: Check if logs are ON THE DISK of the pod
kubectl exec -it order-service-pod -- cat /logs/app.log | tail -50

# Step 2: Check if Filebeat/Fluentd is running and shipping logs
kubectl get pods -n logging
${F}

**What you see if Filebeat is down:**
${F}text
NAME                READY   STATUS    RESTARTS
filebeat-abc-1      0/1     Error     5         ← Filebeat is crashing!
elasticsearch-0     1/1     Running   0
kibana-0            1/1     Running   0
${F}
**What this means (simple):** Filebeat is the agent that reads log files from pods and ships them to Elasticsearch. If it's crashed, logs accumulate on the pod's disk but never appear in Kibana. The fix is to restart Filebeat and check why it crashed (disk full? Elasticsearch unreachable?).

${F}bash
# Check if Elasticsearch is accepting logs
curl http://elasticsearch:9200/_cat/indices | grep logs
${F}

**What you see:**
${F}text
yellow open logs-2024.03.10  1 1  0     0    208b   208b   ← 0 documents! No logs indexed
green  open logs-2024.03.09  1 1  50000 0  4.2mb   2.1mb   ← yesterday fine
${F}

## Step 5: Add the trace ID to every error response — connect frontend errors to backend logs
${F}java
// Include trace ID in the error response body
public record ErrorResponse(String error, String message, String traceId) {
    public ErrorResponse(String error, String message) {
        this(error, message, extractTraceId()); // auto-populated
    }
}

// Client-side: when a 500 happens, log the traceId
fetch('/api/orders', { method: 'POST', body: JSON.stringify(order) })
  .then(resp => {
    if (!resp.ok) {
      return resp.json().then(err => {
        console.error('Order failed. Trace ID for support:', err.traceId);
        // User can report: "I got error, my trace ID is 4bf92f3577b34da6"
        // You search Zipkin/Kibana for that trace ID → full picture
      });
    }
  });
${F}

**What the user sees:**
${F}text
// Browser console:
Order failed. Trace ID for support: 4bf92f3577b34da6

// User reports: "I got an error, my trace ID is 4bf92f3577b34da6"
// You search Kibana: traceId:"4bf92f3577b34da6" → all log lines for that request
// You search Zipkin: trace 4bf92f3577b34da6 → full call chain with timings
${F}

## Your interview answer
**Open:** "500 errors with no logs usually means swallowed exceptions — code that catches exceptions and returns 500 without logging. I'd first check the access log which always records status codes, then search the code for empty catch blocks."
**Then:** "The fix is a global @RestControllerAdvice that catches all unhandled exceptions and logs them at ERROR level with the full stack trace. I'd also check the log pipeline — Filebeat or Fluentd might be down, meaning logs exist on disk but aren't reaching Kibana."
**End:** "For ongoing visibility, every 500 response should include the trace ID. Users can report it, and you can find the exact request in Zipkin and all related log lines in Kibana instantly — no guessing."
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
