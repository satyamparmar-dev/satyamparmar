/**
 * V2 rewrite of all 8 microservices-scenarios answers.
 * Unified format: clean theory tables + commands with outputs + fresher explanations.
 * Run: node scripts/rewrite-v2-microservices.mjs
 */
import { readFileSync, writeFileSync } from 'fs';

const FILE = 'public/data/scenarioInterviewThemes.json';
const F = '```';

const answers = {

// ─────────────────────────────────────────────────────────────────────────────
'th-ms-slow-one': `
## 🔥 The situation
One microservice is slower than all others. Users are waiting. You do not know why yet.

## 🧠 Understand this first

| Cause | What it looks like | Quick check |
|---|---|---|
| N+1 DB queries | Service makes 1 query per item instead of 1 query for all | Logs show many repeated SQL lines |
| No DB index | Full table scan on every request | EXPLAIN ANALYZE shows "Seq Scan" |
| Downstream call | Calls another slow service | Trace shows long HTTP span |
| Blocking threads | All threads waiting on locks | Thread dump shows BLOCKED state |
| Memory pressure | GC pauses between requests | GC logs show frequent Full GC |

## Step 1: Add distributed tracing
**Why:** Tracing shows you where time is actually spent — your code, DB, or a downstream service.

${F}bash
# If using Spring Boot + Micrometer + Zipkin
# In application.yml:
management:
  tracing:
    sampling:
      probability: 1.0   # trace every request (use 0.1 in prod)
${F}

**What you see in Zipkin:**
${F}text
GET /orders/summary  Total: 1200ms
  ├── orderService logic           12ms
  ├── DB query (getOrder)          8ms
  ├── inventoryService.getItems()  1150ms  ← 🔴 HERE
  └── format response              30ms
${F}
**What this means (simple):** The waterfall shows inventoryService is eating 1150ms. Everything else is fast. Problem is there, not here.

## Step 2: Find if it's N+1 queries
**Run this:**
${F}bash
# Enable SQL logging in application.yml:
logging:
  level:
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql.BasicBinder: TRACE
${F}

**What you see in logs:**
${F}text
select * from items where order_id=1
select * from items where order_id=2
select * from items where order_id=3
... (100 more lines, one per order)
${F}
**What this means (simple):** If you fetched 100 orders and now see 100 item queries — that is N+1. You made 1 order query then N item queries instead of 1 JOIN.

**Fix N+1:**
${F}java
// BAD: fetches orders, then for each order fetches items separately
List<Order> orders = orderRepo.findAll();
orders.forEach(o -> o.getItems().size()); // triggers N extra queries

// GOOD: one query with JOIN FETCH
@Query("SELECT o FROM Order o JOIN FETCH o.items")
List<Order> findAllWithItems();
${F}

**What you see after fix:**
${F}text
select o.*, i.* from orders o left join items i on i.order_id = o.id
// ONE query — done
${F}

## Step 3: Check if a DB index is missing
${F}bash
EXPLAIN ANALYZE SELECT * FROM items WHERE order_id = 42;
${F}

**What you see (bad — no index):**
${F}text
Seq Scan on items  (cost=0.00..8450.00 rows=100 width=200)
  Filter: (order_id = 42)
  Rows Removed by Filter: 99900
  Actual total time: 980ms
${F}

**What you see (good — with index):**
${F}text
Index Scan using idx_items_order_id on items
  Index Cond: (order_id = 42)
  Actual total time: 0.8ms
${F}
**What this means (simple):** "Seq Scan" = reads every row. "Index Scan" = jumps straight to the right rows.

**Add the missing index:**
${F}sql
CREATE INDEX idx_items_order_id ON items(order_id);
${F}

## Step 4: Check thread pool exhaustion
${F}bash
# Take a thread dump
kill -3 <java-pid>
# Or with jcmd:
jcmd <java-pid> Thread.print > thread-dump.txt
grep "BLOCKED" thread-dump.txt | wc -l
${F}

**What you see:**
${F}text
"http-nio-8080-exec-1" BLOCKED (on object monitor)
"http-nio-8080-exec-2" BLOCKED (on object monitor)
"http-nio-8080-exec-3" WAITING
... (all 200 threads blocked)
${F}
**What this means (simple):** All request threads are stuck waiting. New requests queue up. This is thread pool exhaustion — usually caused by a slow downstream call holding threads.

## Your interview answer
**Open:** "I'd start with distributed tracing to pinpoint which service or query is slow."
**Then:** "Once I find it — if N+1, I add JOIN FETCH or batch loading. If missing index, I add it. If a downstream call, I check its own traces. If threads are blocked, I look at the thread dump."
**End:** "The key is: don't guess — measure first with tracing, then fix the actual bottleneck."
`.trim(),

// ─────────────────────────────────────────────────────────────────────────────
'th-ms-cascade': `
## 🔥 The situation
One service fails. A chain of failures follows. Soon half your system is down. This is called a cascade failure.

## 🧠 Understand this first

| Pattern | What it does | Simple analogy |
|---|---|---|
| Circuit Breaker | Stops calling a failing service automatically | Trip a fuse before it burns the whole house |
| Timeout | Don't wait forever for a response | Give up after 3 seconds, not 3 minutes |
| Bulkhead | Separate thread pools per downstream service | Separate compartments in a ship — one floods, rest float |
| Retry with backoff | Retry but wait longer each time | Knock again, but wait a bit before each knock |
| Fallback | Return a default/cached response when real one fails | Menu says "try this instead if that's unavailable" |

## Step 1: Add a circuit breaker with Resilience4j
**Why:** Without it, your service keeps hammering a dead service and eventually all YOUR threads are also blocked.

${F}xml
<!-- pom.xml -->
<dependency>
  <groupId>io.github.resilience4j</groupId>
  <artifactId>resilience4j-spring-boot3</artifactId>
  <version>2.2.0</version>
</dependency>
${F}

${F}yaml
# application.yml
resilience4j:
  circuitbreaker:
    instances:
      inventoryService:
        slidingWindowSize: 10          # track last 10 calls
        failureRateThreshold: 50       # open if 50%+ fail
        waitDurationInOpenState: 10s   # wait 10s before trying again
        permittedNumberOfCallsInHalfOpenState: 3
${F}

${F}java
@Service
public class OrderService {

    @CircuitBreaker(name = "inventoryService", fallbackMethod = "defaultInventory")
    public List<Item> getInventory(Long orderId) {
        return inventoryClient.getItems(orderId); // normal call
    }

    // Called automatically when circuit is OPEN
    public List<Item> defaultInventory(Long orderId, Exception e) {
        log.warn("Circuit open for inventory. Returning empty list.");
        return Collections.emptyList();
    }
}
${F}

**What you see in logs when circuit opens:**
${F}text
WARN  OrderService - Circuit open for inventory. Returning empty list.
INFO  CircuitBreaker - State transition: CLOSED -> OPEN (failure rate 60%)
INFO  CircuitBreaker - State transition: OPEN -> HALF_OPEN (after 10s)
INFO  CircuitBreaker - State transition: HALF_OPEN -> CLOSED (3 test calls passed)
${F}
**What this means (simple):**
- CLOSED = normal — calls go through
- OPEN = tripped — calls are blocked, fallback runs immediately
- HALF_OPEN = testing — 3 trial calls sent. If they pass, back to CLOSED. If fail, back to OPEN.

## Step 2: Add timeouts everywhere
${F}java
// For REST calls with RestTemplate
RestTemplate restTemplate = new RestTemplateBuilder()
    .connectTimeout(Duration.ofSeconds(2))  // stop trying to connect after 2s
    .readTimeout(Duration.ofSeconds(3))     // stop waiting for response after 3s
    .build();

// For WebClient (reactive)
WebClient client = WebClient.builder()
    .baseUrl("http://inventory-service")
    .build();

client.get()
    .uri("/items/{id}", orderId)
    .retrieve()
    .bodyToMono(List.class)
    .timeout(Duration.ofSeconds(3));  // throws TimeoutException if too slow
${F}

## Step 3: Add bulkheads (separate thread pools)
${F}yaml
resilience4j:
  bulkhead:
    instances:
      inventoryService:
        maxConcurrentCalls: 10   # only 10 threads can call inventory at once
      paymentService:
        maxConcurrentCalls: 5    # separate pool for payment
${F}

**What this means (simple):** Even if inventory is totally stuck and uses all 10 of its threads, payment still has its own 5 threads. They do not share. One service cannot starve the others.

## Step 4: Verify circuit breaker is working
${F}bash
# Hit the Actuator endpoint
curl http://localhost:8080/actuator/circuitbreakers
${F}

**What you see:**
${F}json
{
  "inventoryService": {
    "state": "OPEN",
    "failureRate": "70.0%",
    "slowCallRate": "0.0%",
    "bufferedCalls": 10,
    "failedCalls": 7,
    "notPermittedCalls": 15
  }
}
${F}
**What this means (simple):**
- state: OPEN = circuit is tripped, calls are blocked
- failureRate: 70% = 7 out of 10 recent calls failed
- notPermittedCalls: 15 = 15 calls were rejected instantly (no actual network call made) — good, saves your threads

## Your interview answer
**Open:** "I'd protect each service boundary with circuit breakers, timeouts, and bulkheads."
**Then:** "Resilience4j with @CircuitBreaker on the client side, with a fallback that returns cached/empty data. Separate bulkheads so one slow service can't steal all threads from others."
**End:** "The key insight is: fail fast at the boundary, not after waiting 30 seconds. The circuit breaker handles this automatically."
`.trim(),

// ─────────────────────────────────────────────────────────────────────────────
'th-ms-contract': `
## 🔥 The situation
Two services worked fine individually. But when deployed together, they break. The API contract between them changed without anyone noticing.

## 🧠 Understand this first

| Problem | What happens | Example |
|---|---|---|
| Field renamed | Consumer breaks at runtime | producer sends \`user_id\`, consumer expects \`userId\` |
| Field removed | NullPointerException | producer removed \`discount\`, consumer still reads it |
| New required field | Producer rejects old consumer requests | producer needs \`currency\` but consumer never sends it |
| Type changed | Parse error | producer sends number, consumer expects string |
| No contract tests | None of this caught until prod | deploys succeed, runtime explodes |

## Step 1: Add Pact consumer-driven contract tests

**The idea:** Consumer writes a test that says "I expect this response shape." Producer then proves it can fulfill that shape. If producer changes the shape, the test fails — before deployment.

**Consumer side (the service that CALLS the API):**
${F}java
// In the consumer service's test
@ExtendWith(PactConsumerTestExt.class)
@PactTestFor(providerName = "inventory-service")
class InventoryClientContractTest {

    @Pact(consumer = "order-service")
    public RequestResponsePact createPact(PactDslWithProvider builder) {
        return builder
            .given("items exist for order 1")
            .uponReceiving("GET /items/1")
            .path("/items/1")
            .method("GET")
            .willRespondWith()
            .status(200)
            .body(new PactDslJsonBody()
                .integerType("itemId")       // must be integer
                .stringType("name")          // must be string
                .decimalType("price"))       // must be decimal
            .toPact();
    }

    @Test
    @PactTestFor(pactMethod = "createPact")
    void shouldGetItems(MockServer mockServer) {
        // Consumer calls mock server — verifies consumer code works
        List<Item> items = inventoryClient.getItems(1L);
        assertThat(items).isNotEmpty();
    }
}
${F}

**What you see when test runs:**
${F}text
✅ Pact verified between order-service (consumer) and inventory-service (provider)
Pact file written to: target/pacts/order-service-inventory-service.json
${F}

**Provider side (the service that SERVES the API):**
${F}java
@Provider("inventory-service")
@PactFolder("pacts")  // reads the pact files consumers published
class InventoryContractVerificationTest {

    @TestTarget
    public final Target target = new HttpTarget(8080);

    @State("items exist for order 1")
    public void setupItemsForOrder1() {
        // Set up test data so state is true
        inventoryRepo.save(new Item(1L, "Widget", 9.99));
    }
}
${F}

**What you see when provider test fails:**
${F}text
❌ Verifying a pact between order-service and inventory-service
  GET /items/1 returns a response which
    has status code 200 (OK)
    has a matching body
      $.price  Expected: decimal  Actual: String("9.99")  ← MISMATCH
${F}
**What this means (simple):** The producer changed \`price\` from a number to a string. Consumer still expects a number. This would have broken prod — now caught before deploy.

## Step 2: Publish pacts to Pact Broker
${F}bash
# Run after consumer tests to share pacts with the team
./gradlew pactPublish \
  -PpactBrokerUrl=http://pact-broker:9292 \
  -PpactBrokerUsername=admin \
  -PpactBrokerPassword=secret
${F}

**What you see in Pact Broker UI:**
${F}text
order-service  ──── expects ──── inventory-service
               last verified: 2 hours ago ✅
               can-i-deploy: YES
${F}
**What this means (simple):** The broker is a shared server where all consumer pacts live. Producers pull from it to run verification. Dashboard shows which service pairs are compatible right now.

## Step 3: Block deployment if contract breaks
${F}bash
# Run before deploying consumer
pact-broker can-i-deploy \
  --pacticipant order-service \
  --version 1.4.2 \
  --to-environment production
${F}

**What you see (blocked):**
${F}text
Computer says no ✗
order-service version 1.4.2 has NOT been verified against inventory-service
${F}

**What you see (allowed):**
${F}text
Computer says yes ✓
All required verifications are published and successful
${F}

## Your interview answer
**Open:** "I'd introduce consumer-driven contract tests using Pact."
**Then:** "Consumer writes a pact describing what response shape it needs. Provider runs that pact as a test against its actual API. If the provider changes a field name or type, the pact test fails — before it reaches prod."
**End:** "The \`can-i-deploy\` gate in CI then blocks the deployment if verification hasn't passed. This catches contract breaks at the PR stage, not in production."
`.trim(),

// ─────────────────────────────────────────────────────────────────────────────
'th-ms-saga': `
## 🔥 The situation
You need to complete a business operation (place an order) that touches multiple services — inventory, payment, shipping. Each has its own database. A traditional database transaction cannot span all three. How do you keep data consistent?

## 🧠 Understand this first

| Approach | How it works | Problem |
|---|---|---|
| Distributed 2PC | One coordinator locks all services, commits together | Slow, requires all services to be available, hard to implement |
| Saga (Choreography) | Each service listens to events and reacts | Hard to trace, event storms |
| Saga (Orchestration) | One orchestrator tells each service what to do, handles failures | Clearer flow, easier to trace — preferred approach |

**Key idea:** Instead of one big transaction, you break it into small local transactions. If step 3 fails, you run compensating transactions to undo steps 1 and 2.

## Step 1: Design the saga steps and compensations

${F}text
Happy path (forward):
  1. OrderService    → create order (PENDING)
  2. InventoryService → reserve stock
  3. PaymentService   → charge card
  4. OrderService    → mark order CONFIRMED
  5. ShippingService  → create shipment

Failure at step 3 (payment fails):
  → run compensation for step 2: InventoryService.releaseStock()
  → run compensation for step 1: OrderService.cancelOrder()
${F}

## Step 2: Implement the orchestrator
${F}java
@Service
public class PlaceOrderSaga {

    public void execute(Order order) {
        try {
            // Step 1: reserve inventory
            inventoryClient.reserve(order.getItems()); // may throw InsufficientStockException

            // Step 2: charge payment
            paymentClient.charge(order.getPayment()); // may throw PaymentFailedException

            // Step 3: confirm
            orderRepo.updateStatus(order.getId(), "CONFIRMED");

        } catch (InsufficientStockException e) {
            // Nothing to compensate yet — inventory already said no
            orderRepo.updateStatus(order.getId(), "CANCELLED");

        } catch (PaymentFailedException e) {
            // Compensate: release the reserved stock
            inventoryClient.releaseReservation(order.getItems());
            orderRepo.updateStatus(order.getId(), "CANCELLED");
        }
    }
}
${F}

## Step 3: Handle the "what if compensation also fails?" problem

Use the **Outbox pattern** to guarantee compensation messages are sent even if the saga service crashes mid-way.

${F}java
@Transactional
public void chargeAndSave(Order order) {
    // Save the order state AND the outbox event in ONE local transaction
    orderRepo.save(order);

    outboxRepo.save(new OutboxEvent(
        "inventory-service",
        "RELEASE_RESERVATION",
        order.getId().toString()
    ));
    // If we crash here, both order + outbox event are saved (or neither)
    // A separate poller picks up the outbox event and sends it reliably
}
${F}

**Outbox table:**
${F}sql
CREATE TABLE outbox_events (
    id UUID PRIMARY KEY,
    destination VARCHAR(100),  -- which service
    event_type VARCHAR(100),
    payload TEXT,
    published_at TIMESTAMP,    -- null = not sent yet
    created_at TIMESTAMP DEFAULT NOW()
);
${F}

**Poller that reliably sends events:**
${F}java
@Scheduled(fixedDelay = 1000)
@Transactional
public void publishPending() {
    List<OutboxEvent> pending = outboxRepo.findByPublishedAtIsNull();
    for (OutboxEvent e : pending) {
        messageBroker.send(e.getDestination(), e.getPayload());
        e.setPublishedAt(Instant.now());
        outboxRepo.save(e);
    }
}
${F}

**What you see in logs during a payment failure:**
${F}text
INFO  PlaceOrderSaga - Reserving inventory for order 99
INFO  InventoryService - Reserved 2x Widget for order 99
INFO  PlaceOrderSaga - Charging payment for order 99
ERROR PaymentService - Card declined for order 99
INFO  PlaceOrderSaga - Compensating: releasing inventory for order 99
INFO  InventoryService - Released reservation for order 99
INFO  PlaceOrderSaga - Order 99 marked CANCELLED
${F}
**What this means (simple):**
- The saga orchestrator ran each step one by one
- Payment failed at step 3
- Compensation automatically released the inventory (step 2 undone)
- Order marked cancelled — no orphaned reservations left in inventory

## Step 4: Make each step idempotent
**Why:** If the network drops after payment but before confirmation, the poller may retry. Payment should not double-charge.

${F}java
// Payment service — check if already charged
public PaymentResult charge(String orderId, Money amount) {
    if (paymentRepo.existsByOrderId(orderId)) {
        log.info("Already charged for order {}, skipping", orderId);
        return paymentRepo.findByOrderId(orderId); // return existing result
    }
    // ... do actual charge
}
${F}

## Your interview answer
**Open:** "I'd use the Saga pattern with an orchestrator — one service drives the whole flow step by step."
**Then:** "Each step is a local transaction. If a step fails, the orchestrator calls compensating transactions to undo previous steps. I'd combine this with the Outbox pattern to make sure compensation events are reliably published even if the orchestrator crashes."
**End:** "Each step must be idempotent so retries don't cause double-charges or double-reservations. The outbox guarantees at-least-once delivery. Idempotency handles duplicates."
`.trim(),

// ─────────────────────────────────────────────────────────────────────────────
'th-ms-no-traffic': `
## 🔥 The situation
A service is healthy. All health checks pass. But it is receiving zero traffic. Requests are going somewhere else — or nowhere.

## 🧠 Understand this first

| Layer | What controls routing | What can go wrong |
|---|---|---|
| Load Balancer / Ingress | Routes external traffic to pods | Wrong service selector, wrong port |
| Kubernetes Service | Routes to pods inside cluster | Label mismatch, wrong targetPort |
| DNS | Resolves service names to IPs | Wrong DNS name, DNS not propagated |
| Service Discovery (Eureka etc) | Registers service instances | Not registered, wrong host/port |
| Health Check | Readiness probe | Failing probe = removed from endpoints |

## Step 1: Check Kubernetes endpoints (most common cause)
${F}bash
kubectl get endpoints <service-name> -n <namespace>
${F}

**What you see (problem — no endpoints):**
${F}text
NAME               ENDPOINTS   AGE
inventory-service  <none>      5m
${F}
**What this means (simple):** The Kubernetes Service has NO pods to send traffic to. Either: no pods match the selector, or all pods are failing their readiness probe.

**What you see (healthy):**
${F}text
NAME               ENDPOINTS                            AGE
inventory-service  10.0.1.5:8080,10.0.1.6:8080         5m
${F}

## Step 2: Check if the label selector matches pod labels
${F}bash
# Check what the Service is selecting
kubectl describe service inventory-service -n <namespace>
${F}

**What you see:**
${F}text
Name:              inventory-service
Selector:          app=inventory,version=v2   ← Service looks for these labels
Port:              80/TCP → 8080/TCP
${F}

${F}bash
# Check what labels the pods actually have
kubectl get pods -n <namespace> --show-labels
${F}

**What you see (mismatch — the bug):**
${F}text
NAME                          LABELS
inventory-dep-7c9f4b-xkp2m    app=inventory,version=v1   ← Pod has v1, Service wants v2
${F}
**What this means (simple):** The Service selector says \`version=v2\` but pods are labelled \`version=v1\`. They never match. Zero traffic reaches the pods — even though the pods are running fine.

**Fix:**
${F}bash
# Option A: Fix the Service selector
kubectl patch service inventory-service -n <namespace> \
  -p '{"spec":{"selector":{"app":"inventory","version":"v1"}}}'

# Option B: Fix the pod label (update the Deployment)
kubectl set selector deployment/inventory-dep 'app=inventory,version=v2' -n <namespace>
${F}

## Step 3: Check readiness probe
${F}bash
kubectl describe pod <pod-name> -n <namespace>
${F}

**What you see (failing readiness probe):**
${F}text
Readiness:  http-get http://:8080/actuator/health delay=10s timeout=1s
Conditions:
  Ready: False
Events:
  Warning  Unhealthy  2m  kubelet  Readiness probe failed: HTTP probe failed with statuscode: 503
${F}
**What this means (simple):** The pod is running but Kubernetes says "this pod is not ready." It removes it from the endpoint list. No traffic goes to it. Fix the readiness probe endpoint (make sure \`/actuator/health\` returns 200) or increase the timeout.

## Step 4: Check DNS resolution (for inter-service calls)
${F}bash
# From inside another pod in the cluster
kubectl exec -it <any-running-pod> -- nslookup inventory-service
${F}

**What you see (DNS not resolving):**
${F}text
Server:    10.96.0.10
Address 1: 10.96.0.10

nslookup: can't resolve 'inventory-service'
${F}

**What you see (DNS healthy):**
${F}text
Name:    inventory-service.default.svc.cluster.local
Address: 10.96.10.45
${F}
**What this means (simple):** If DNS can't resolve, service-to-service calls fail with "connection refused" or UnknownHost. Use the full name: \`inventory-service.<namespace>.svc.cluster.local\` if short name doesn't work.

## Step 5: Check if service is registered with Eureka (if used)
${F}bash
curl http://eureka-server:8761/eureka/apps/INVENTORY-SERVICE
${F}

**What you see (not registered):**
${F}text
<instances/>
${F}

**What you see (registered):**
${F}xml
<application>
  <name>INVENTORY-SERVICE</name>
  <instance>
    <hostName>10.0.1.5</hostName>
    <port enabled="true">8080</port>
    <status>UP</status>
  </instance>
</application>
${F}

## Your interview answer
**Open:** "I'd start with \`kubectl get endpoints\` — if there are no endpoints, the service has zero pods to route to."
**Then:** "Then I'd check if the label selector on the Service matches the pod labels — a single label mismatch means zero traffic silently. After that, I'd check the readiness probe — a failing probe removes the pod from endpoints."
**End:** "The root cause is almost always a label mismatch, a failing readiness probe, or a misconfigured port. All three are in kubectl describe output."
`.trim(),

// ─────────────────────────────────────────────────────────────────────────────
'th-ms-config': `
## 🔥 The situation
Services have different configs in different environments. Prod gets the wrong DB URL. Staging uses prod secrets. A config change requires a redeployment. Config is scattered across 10 services.

## 🧠 Understand this first

| Approach | How it works | Best for |
|---|---|---|
| Env variables | Set in Kubernetes Deployment YAML | Simple values, non-secret |
| Kubernetes ConfigMap | Key-value store, mounted as env or file | Per-environment config |
| Kubernetes Secret | Like ConfigMap but base64-encoded | Passwords, API keys |
| Spring Cloud Config Server | Central Git-backed config for all services | Large systems, many services |
| Vault (HashiCorp) | Secret management with rotation | Prod secrets, compliance |

## Step 1: Use ConfigMaps for environment config
${F}yaml
# configmap.yaml — per environment
apiVersion: v1
kind: ConfigMap
metadata:
  name: inventory-config
  namespace: production
data:
  DB_URL: jdbc:postgresql://prod-db:5432/inventory
  CACHE_TTL: "300"
  LOG_LEVEL: WARN
${F}

${F}yaml
# deployment.yaml — reference the ConfigMap
spec:
  containers:
  - name: inventory
    image: inventory:1.4.2
    envFrom:
    - configMapRef:
        name: inventory-config   # all keys become env variables
${F}

**Apply it:**
${F}bash
kubectl apply -f configmap.yaml
kubectl apply -f deployment.yaml
# Pods restart and pick up new config
${F}

**What you see:**
${F}text
configmap/inventory-config configured
deployment.apps/inventory-dep configured
${F}

## Step 2: Use Secrets for sensitive values
${F}bash
# Create a secret (values are base64 encoded by Kubernetes)
kubectl create secret generic db-credentials \
  --from-literal=DB_PASSWORD=mySecretPass123 \
  --from-literal=API_KEY=abcdef123456 \
  -n production
${F}

${F}yaml
# Reference secret in Deployment
spec:
  containers:
  - name: inventory
    env:
    - name: DB_PASSWORD
      valueFrom:
        secretKeyRef:
          name: db-credentials
          key: DB_PASSWORD
${F}

**What you see:**
${F}bash
kubectl get secret db-credentials -n production -o yaml
${F}
${F}text
data:
  DB_PASSWORD: bXlTZWNyZXRQYXNzMTIz   ← base64, not plaintext
  API_KEY: YWJjZGVmMTIzNDU2
${F}
**What this means (simple):** Kubernetes stores the value base64 encoded. Your app reads it as plain text through the env variable. Do NOT store real secrets in git — reference the Secret name only.

## Step 3: Central config with Spring Cloud Config Server
${F}yaml
# Config server application.yml
spring:
  cloud:
    config:
      server:
        git:
          uri: https://github.com/myorg/config-repo
          search-paths: '{application}'  # one folder per service
${F}

**Folder structure in the config Git repo:**
${F}text
config-repo/
  inventory-service/
    application.yml           ← shared defaults
    application-staging.yml   ← staging overrides
    application-production.yml ← prod overrides
  payment-service/
    application.yml
    application-production.yml
${F}

**Service requests its own config at startup:**
${F}bash
# Config server serves: GET /inventory-service/production
curl http://config-server:8888/inventory-service/production
${F}

**What you see:**
${F}json
{
  "name": "inventory-service",
  "profiles": ["production"],
  "propertySources": [
    {
      "name": "inventory-service/application-production.yml",
      "source": {
        "db.url": "jdbc:postgresql://prod-db:5432/inventory",
        "cache.ttl": 300
      }
    }
  ]
}
${F}

## Step 4: Refresh config without restart
${F}java
// Mark beans that should refresh when config changes
@RefreshScope
@RestController
public class InventoryController {

    @Value("\${cache.ttl}")
    private int cacheTtl;  // picks up new value on refresh

    // ...
}
${F}

${F}bash
# Trigger a refresh (after pushing new config to Git)
curl -X POST http://inventory-service:8080/actuator/refresh
${F}

**What you see:**
${F}json
["cache.ttl"]
${F}
**What this means (simple):** Only the changed keys are listed. Those beans marked \`@RefreshScope\` pick up the new values without restarting the pod. No downtime for config changes.

## Your interview answer
**Open:** "I'd separate config by layer: non-sensitive config in Kubernetes ConfigMaps, secrets in Kubernetes Secrets or Vault, and for large systems, a Spring Cloud Config Server backed by Git."
**Then:** "This gives environment-specific config without code changes. Secrets are never in Git. Config Server lets all services pull their own config at startup and refresh without restart."
**End:** "The key benefit: one Git PR to change a config value, and all services pick it up. Audit trail, rollback, and review all in Git history."
`.trim(),

// ─────────────────────────────────────────────────────────────────────────────
'th-ms-scale-one': `
## 🔥 The situation
One service gets much more traffic than others. You want to scale just that service, not the whole system. How do you design for that?

## 🧠 Understand this first

| Scaling type | What it means | Example |
|---|---|---|
| Horizontal scaling | Add more instances (pods) | Go from 2 pods to 10 pods |
| Vertical scaling | Give each instance more CPU/memory | Go from 512MB to 2GB RAM per pod |
| Stateless design | Each pod can handle any request | No session stored in memory |
| Stateful design | Request must go to the right pod | Session in memory — breaks if wrong pod serves it |
| HPA | Kubernetes auto-scales based on CPU/memory/custom metric | Adds pods when CPU > 70% |

## Step 1: Make the service stateless first
**Why:** If the service keeps session data in memory, scaling to 2 pods means some requests go to a pod that has no session — user gets logged out or sees errors.

${F}java
// BAD: session stored in JVM memory
@RestController
public class CartController {
    private Map<String, Cart> sessions = new HashMap<>(); // dies when pod restarts

    @GetMapping("/cart")
    public Cart getCart(HttpSession session) {
        return sessions.get(session.getId()); // not available on other pods
    }
}

// GOOD: session stored in Redis (shared between all pods)
@RestController
public class CartController {

    @Autowired
    private RedisTemplate<String, Cart> redis;

    @GetMapping("/cart/{userId}")
    public Cart getCart(@PathVariable String userId) {
        return redis.opsForValue().get("cart:" + userId); // any pod can read this
    }
}
${F}

${F}yaml
# pom.xml — add Spring Session Redis
# application.yml
spring:
  session:
    store-type: redis
  data:
    redis:
      host: redis-service
      port: 6379
${F}

## Step 2: Set CPU/memory requests and limits
**Why:** HPA uses these to calculate utilization. Without them, Kubernetes can't scale properly.

${F}yaml
# deployment.yaml
spec:
  containers:
  - name: inventory
    resources:
      requests:
        memory: "256Mi"
        cpu: "250m"      # 0.25 CPU — what we expect to use normally
      limits:
        memory: "512Mi"
        cpu: "500m"      # 0.5 CPU — hard cap, never go above
${F}

## Step 3: Add Horizontal Pod Autoscaler
${F}bash
# Create HPA — scale between 2 and 20 pods based on CPU
kubectl autoscale deployment inventory-dep \
  --min=2 \
  --max=20 \
  --cpu-percent=70 \
  -n production
${F}

**What you see:**
${F}text
horizontalpodautoscaler.autoscaling/inventory-dep autoscaled
${F}

${F}bash
# Watch it scale in real time
kubectl get hpa inventory-dep -n production -w
${F}

**What you see under load:**
${F}text
NAME            REFERENCE                TARGETS   MINPODS   MAXPODS   REPLICAS   AGE
inventory-dep   Deployment/inventory-dep  12%/70%   2         20        2          5m
inventory-dep   Deployment/inventory-dep  81%/70%   2         20        4          6m   ← load spike
inventory-dep   Deployment/inventory-dep  65%/70%   2         20        4          8m   ← stabilized
inventory-dep   Deployment/inventory-dep  20%/70%   2         20        2          18m  ← scaled back down
${F}
**What this means (simple):**
- 12%/70% = current CPU is 12%, target is 70% → 2 pods is fine
- 81%/70% = over target → Kubernetes adds 2 more pods (total: 4)
- After load drops, it waits (default ~5 min) then scales back to 2

## Step 4: Scale on custom metric (e.g., Kafka lag)
${F}yaml
# HPA on Kafka consumer lag (requires KEDA or custom metrics adapter)
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: inventory-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: inventory-dep
  minReplicas: 2
  maxReplicas: 20
  metrics:
  - type: External
    external:
      metric:
        name: kafka_consumer_lag
        selector:
          matchLabels:
            topic: inventory-events
      target:
        type: AverageValue
        averageValue: "100"  # scale up when lag per pod > 100 messages
${F}

## Step 5: Test that scaling works (load test)
${F}bash
# Simple load test with hey (HTTP load tool)
hey -n 10000 -c 100 http://inventory-service/items

# Watch pods while this runs
kubectl get pods -n production -w
${F}

**What you see:**
${F}text
NAME                      READY   STATUS    RESTARTS
inventory-dep-abc-1       1/1     Running   0
inventory-dep-abc-2       1/1     Running   0
inventory-dep-abc-3       0/1     Pending   0   ← new pod starting
inventory-dep-abc-3       1/1     Running   0   ← now ready
inventory-dep-abc-4       0/1     Pending   0   ← another one
${F}

## Your interview answer
**Open:** "The first step is making the service stateless — move any session data to Redis or a shared cache so any pod can handle any request."
**Then:** "Then I'd set CPU resource requests and limits on the Deployment, and add a Horizontal Pod Autoscaler targeting 70% CPU utilization. Kubernetes then automatically scales pods up and down."
**End:** "For event-driven services, I'd scale on consumer lag instead of CPU — KEDA makes this easy. The key is stateless pods plus an HPA target that reflects actual load."
`.trim(),

// ─────────────────────────────────────────────────────────────────────────────
'th-ms-logs-five': `
## 🔥 The situation
You have 5 microservices. A request fails somewhere. You need to find out what happened and in which service. Each service writes its own logs. How do you trace a failure across all 5?

## 🧠 Understand this first

| Tool / concept | What it does | Simple description |
|---|---|---|
| Correlation ID / Trace ID | One ID generated per request, passed to all services | Like a ticket number that follows the customer everywhere |
| MDC (Mapped Diagnostic Context) | Attach extra fields (like traceId) to every log line | Makes every log line say which request it belongs to |
| Centralized logging (ELK/Loki) | All services send logs to one place | One search box finds logs from all 5 services |
| Distributed tracing (Zipkin/Jaeger) | Visualizes the call chain with timings | Shows the whole journey of one request as a timeline |
| Structured logs (JSON) | Logs as JSON instead of plain text | Easier to query: \`traceId="abc123"\` finds all matching logs |

## Step 1: Add trace ID to every log line
${F}xml
<!-- pom.xml -->
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
<dependency>
  <groupId>io.micrometer</groupId>
  <artifactId>micrometer-tracing-bridge-brave</artifactId>
</dependency>
<dependency>
  <groupId>io.zipkin.reporter2</groupId>
  <artifactId>zipkin-reporter-brave</artifactId>
</dependency>
${F}

${F}yaml
# application.yml
logging:
  pattern:
    console: "%d{HH:mm:ss} [%thread] [traceId=%X{traceId}] %-5level %logger - %msg%n"
management:
  tracing:
    sampling:
      probability: 1.0
${F}

**What you see in logs:**
${F}text
10:23:01 [http-nio-8080-exec-1] [traceId=4bf92f3577b34da6] INFO  OrderService - Creating order for user 99
10:23:01 [http-nio-8080-exec-1] [traceId=4bf92f3577b34da6] INFO  InventoryClient - Calling inventory service
10:23:02 [http-nio-8080-exec-3] [traceId=4bf92f3577b34da6] INFO  InventoryService - Received reservation request
10:23:02 [http-nio-8080-exec-3] [traceId=4bf92f3577b34da6] ERROR InventoryService - Insufficient stock for item 42
${F}
**What this means (simple):** Every log line from every service has the same \`traceId\`. Search for that one ID and you see the full story across all 5 services, in order.

## Step 2: Pass trace ID through HTTP headers automatically
${F}java
// Spring Boot with Micrometer Tracing does this automatically.
// The traceId is propagated via the B3 header:
//   X-B3-TraceId: 4bf92f3577b34da6
//   X-B3-SpanId: a2fb4a1d1a96d312

// If you use RestTemplate, it's automatic.
// If you use WebClient, it's automatic.
// If you use Feign, it's automatic.

// If you make a raw HTTP call yourself, propagate manually:
@Bean
public RestTemplate restTemplate(ObservationRegistry registry) {
    return new RestTemplateBuilder()
        .additionalInterceptors(new ObservationRestTemplateCustomizer(registry))
        .build();
}
${F}

## Step 3: Use structured JSON logs for easy searching
${F}xml
<!-- pom.xml -->
<dependency>
  <groupId>net.logstash.logback</groupId>
  <artifactId>logstash-logback-encoder</artifactId>
  <version>7.4</version>
</dependency>
${F}

${F}xml
<!-- logback-spring.xml -->
<appender name="JSON" class="ch.qos.logback.core.ConsoleAppender">
  <encoder class="net.logstash.logback.encoder.LogstashEncoder"/>
</appender>
${F}

**What you see (JSON log line):**
${F}json
{
  "timestamp": "2024-01-15T10:23:02.123Z",
  "level": "ERROR",
  "service": "inventory-service",
  "traceId": "4bf92f3577b34da6",
  "spanId": "a2fb4a1d1a96d312",
  "message": "Insufficient stock for item 42",
  "logger": "InventoryService",
  "thread": "http-nio-8080-exec-3"
}
${F}
**What this means (simple):** JSON logs can be indexed by any field. In Kibana or Grafana Loki, you type \`traceId="4bf92f3577b34da6"\` and instantly see all logs across all 5 services for that one request — sorted by timestamp.

## Step 4: View the full trace in Zipkin
${F}bash
# Open Zipkin UI in browser
http://zipkin-server:9411

# Search by trace ID
http://zipkin-server:9411/zipkin/traces/4bf92f3577b34da6
${F}

**What you see:**
${F}text
Trace: 4bf92f3577b34da6  Total: 1800ms

  order-service          POST /orders                  0ms → 1800ms  [1800ms]
    ├── inventory-service  GET /reserve                 50ms → 150ms  [100ms]
    ├── payment-service    POST /charge                150ms → 1650ms [1500ms]  ← 🔴 slow
    └── shipping-service   POST /shipments             1650ms → 1800ms [150ms]
${F}
**What this means (simple):** The waterfall shows payment-service took 1500ms. That's where the slowness (or failure) is. You can click into it to see the exact error log attached to that span.

## Step 5: Alert on error rate per service
${F}yaml
# Prometheus alert rule
groups:
- name: microservice-errors
  rules:
  - alert: HighErrorRate
    expr: |
      rate(http_server_requests_seconds_count{status=~"5.."}[5m])
      /
      rate(http_server_requests_seconds_count[5m]) > 0.05
    for: 2m
    labels:
      severity: critical
    annotations:
      summary: "{{ $labels.service }} error rate > 5%"
${F}

**What you see in Grafana alert:**
${F}text
🔴 FIRING: HighErrorRate
  service: payment-service
  error rate: 8.3%
  duration: 3m
${F}

## Your interview answer
**Open:** "I'd make every request carry a trace ID — generated at the edge and passed through every service via HTTP headers."
**Then:** "Each service logs in structured JSON with that trace ID in every line. All logs go to a central store like ELK or Loki. To investigate a failure, I search by trace ID — all logs from all services appear instantly."
**End:** "Distributed tracing in Zipkin gives the timeline view — I can see exactly which service took how long and where the error happened. The trace ID is the key that ties everything together."
`.trim(),

};

// ── Apply rewrites ────────────────────────────────────────────────────────────
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
