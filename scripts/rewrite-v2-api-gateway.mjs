/**
 * V2 rewrite — api-gateway-vs-service-mesh (3 scenarios)
 * Run: node scripts/rewrite-v2-api-gateway.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
const FILE = 'public/data/scenarioInterviewThemes.json';
const F = '```';

const answers = {

'th-gw-auth-rl': `
## 🔥 The situation
You have 10 microservices. Every one of them needs to validate JWT tokens and enforce rate limiting. Should each service implement this itself? Or does that belong somewhere central — like an API Gateway?

## 🧠 API Gateway — the front door

An API Gateway sits between the outside world and your services. It handles concerns that are common to all services so each service doesn't have to repeat the same code.

${F}text
Internet
    │
    ▼
┌─────────────────────┐
│     API Gateway     │  ← handles: auth, rate limiting, routing, logging, SSL termination
│  (Kong / AWS ALB /  │
│   Spring Cloud GW)  │
└─────────┬───────────┘
          │
    ┌─────┴──────┐
    │            │
┌───▼───┐   ┌───▼───┐
│Order  │   │Invent-│  ← services focus on business logic only
│Service│   │ory    │    no JWT validation code, no rate limit code
└───────┘   └───────┘
${F}

| Responsibility | At Gateway | In each Service | Best place |
|---|---|---|---|
| JWT validation | Validate once, pass user ID downstream | Every service validates independently | Gateway |
| Rate limiting | One counter per client, shared | Each service has its own counter (wrong!) | Gateway |
| SSL termination | Gateway handles HTTPS, internal is HTTP | Each service needs its own cert | Gateway |
| Business auth (can THIS user see THIS order?) | Gateway doesn't know business rules | Service checks e.g., order.userId == caller | Service |
| Request routing | Gateway routes /orders → order-service | Not applicable | Gateway |
| Logging all requests | One place to log every inbound request | Duplicated across all services | Gateway |

## Step 1: Set up Spring Cloud Gateway with JWT validation
${F}xml
<!-- pom.xml -->
<dependency>
  <groupId>org.springframework.cloud</groupId>
  <artifactId>spring-cloud-starter-gateway</artifactId>
</dependency>
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
</dependency>
${F}

${F}yaml
# application.yml — gateway routing + JWT validation
spring:
  cloud:
    gateway:
      routes:
        - id: order-service
          uri: http://order-service:8080
          predicates:
            - Path=/api/orders/**
          filters:
            - StripPrefix=1               # removes /api prefix before forwarding
            - AddRequestHeader=X-User-Id, \${user.id}  # pass user ID downstream

        - id: inventory-service
          uri: http://inventory-service:8080
          predicates:
            - Path=/api/inventory/**
          filters:
            - StripPrefix=1

  security:
    oauth2:
      resourceserver:
        jwt:
          jwk-set-uri: https://auth.example.com/.well-known/jwks.json
${F}

${F}java
// Gateway security config — validate JWT once for all routes
@Configuration
@EnableWebFluxSecurity
public class GatewaySecurityConfig {

    @Bean
    SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        return http
            .authorizeExchange(exchanges -> exchanges
                .pathMatchers("/health", "/actuator/**").permitAll()  // public endpoints
                .anyExchange().authenticated()                          // all others need valid JWT
            )
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
            .csrf(ServerHttpSecurity.CsrfSpec::disable)  // stateless API — no CSRF needed
            .build();
    }

    // After JWT validation, add user info as a header for downstream services
    @Bean
    GlobalFilter propagateUserIdFilter() {
        return (exchange, chain) -> exchange.getPrincipal()
            .cast(JwtAuthenticationToken.class)
            .flatMap(auth -> {
                String userId = auth.getToken().getSubject();
                ServerHttpRequest mutated = exchange.getRequest().mutate()
                    .header("X-User-Id", userId)
                    .header("X-User-Email", auth.getToken().getClaimAsString("email"))
                    .build();
                return chain.filter(exchange.mutate().request(mutated).build());
            });
    }
}
${F}

**What downstream services see:**
${F}text
// Incoming request to order-service (after gateway processing):
GET /orders/123
X-User-Id: user-abc-123
X-User-Email: alice@example.com
Authorization: (stripped or kept, your choice)
// No JWT validation needed in order-service — gateway already did it
${F}

**What you see in logs when JWT is invalid:**
${F}text
WARN  o.s.s.o.s.r.a.JwtAuthenticationProvider - Failed to authenticate since the JWT was invalid
→ Gateway returns: HTTP 401 { "error": "Unauthorized" }
// Request never reaches order-service
${F}

## Step 2: Add rate limiting at the gateway
${F}yaml
# Rate limiting filter — built into Spring Cloud Gateway with Redis
spring:
  cloud:
    gateway:
      routes:
        - id: order-service
          uri: http://order-service:8080
          predicates:
            - Path=/api/orders/**
          filters:
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenishRate: 100   # 100 requests/sec steady state
                redis-rate-limiter.burstCapacity: 200   # allow burst up to 200
                redis-rate-limiter.requestedTokens: 1
                key-resolver: "#{@userKeyResolver}"     # rate limit per user, not per IP
${F}

${F}java
// Rate limit key: per authenticated user ID
@Bean
KeyResolver userKeyResolver() {
    return exchange -> exchange.getPrincipal()
        .cast(JwtAuthenticationToken.class)
        .map(auth -> auth.getToken().getSubject())  // user ID from JWT
        .defaultIfEmpty("anonymous");               // unauthenticated fallback
}
${F}

**What you see when rate limited at the gateway:**
${F}text
HTTP 429 Too Many Requests
X-RateLimit-Remaining: 0
X-RateLimit-Limit: 100
Retry-After: 1
// No request reaches any microservice
${F}

## Step 3: Business authorization stays in the service
${F}java
// This check CANNOT be done at the gateway — the gateway doesn't know business rules
// order-service:
@GetMapping("/orders/{orderId}")
public ResponseEntity<Order> getOrder(@PathVariable Long orderId,
                                       @RequestHeader("X-User-Id") String userId) {
    Order order = orderRepo.findById(orderId).orElseThrow();

    // Business auth: only the order owner or admin can see it
    if (!order.getUserId().equals(userId) && !isAdmin(userId)) {
        return ResponseEntity.status(403).body(null); // 403 Forbidden
    }
    return ResponseEntity.ok(order);
}
// The gateway validated "is this a real logged-in user?"
// The service validates "is this user allowed to see THIS specific order?"
${F}

## Your interview answer
**Open:** "Auth validation and rate limiting belong at the API Gateway — they're cross-cutting concerns that every service would otherwise duplicate in the same way."
**Then:** "The gateway validates the JWT once, extracts the user ID, and forwards it as a trusted header. Services skip JWT parsing entirely. Rate limiting at the gateway means one shared Redis counter per user — consistent regardless of how many service instances you have."
**End:** "What stays in the service: business authorization — 'can this user see this specific order?' The gateway doesn't have that business context. Clear rule: infrastructure concerns → gateway, business rules → service."
`.trim(),

'th-mesh-internal': `
## 🔥 The situation
You have 20 microservices talking to each other. You need mutual TLS between services, retry logic, circuit breakers, and observability for every service-to-service call. Do you add all this code to each service? Or use a service mesh?

## 🧠 Service Mesh vs API Gateway — what's different?

${F}text
API Gateway:           External traffic → your services
                       One gateway at the edge

Service Mesh (Istio):  Internal traffic between your services
                       A sidecar proxy (Envoy) injected next to EVERY pod
                       All inter-service traffic goes through the sidecar
${F}

| Feature | API Gateway | Service Mesh (Istio) |
|---|---|---|
| Who it protects | North-south (external → internal) | East-west (service → service) |
| Where it runs | One place (edge) | Everywhere (sidecar on every pod) |
| Auth | JWT validation, API keys | mTLS — mutual certificate auth between services |
| Retries, circuit breakers | Manual config or code | Automatic via mesh policy — no code changes |
| Observability | Gateway-level only | Every call between any two services |
| Zero code changes | No | Yes — mesh works transparently |

## Step 1: Install Istio and understand the sidecar model
${F}bash
# Install Istio control plane
istioctl install --set profile=demo -y

# Enable automatic sidecar injection for your namespace
kubectl label namespace production istio-injection=enabled

# Deploy your service as normal — Istio injects a sidecar automatically
kubectl apply -f order-service-deployment.yaml
${F}

**What you see after injection:**
${F}bash
kubectl get pods -n production
${F}
${F}text
NAME                          READY   STATUS    RESTARTS
order-service-7c9f4b-xkp2m    2/2     Running   0   ← 2/2 means: your container + Envoy sidecar
inventory-service-abc-def12    2/2     Running   0
payment-service-xyz-789abc     2/2     Running   0
${F}
**What this means (simple):** Every pod now has TWO containers — yours, and Envoy (the sidecar proxy). All traffic your service sends or receives flows through Envoy transparently. Your code doesn't change at all.

## Step 2: Enable mTLS — every service-to-service call is encrypted and authenticated
${F}yaml
# PeerAuthentication — require mTLS for all services in the namespace
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: production
spec:
  mtls:
    mode: STRICT   # ← reject any unencrypted call between services
${F}

${F}bash
kubectl apply -f peer-authentication.yaml
${F}

**What happens after applying:**
${F}text
Without mTLS: order-service → HTTP → inventory-service (plain text — anyone can sniff it)

With mTLS STRICT:
  order-service (Envoy) ← presents cert → inventory-service (Envoy)
  inventory-service (Envoy) ← presents cert → order-service (Envoy)
  Both verify each other's certs (MUTUAL TLS — both sides prove identity)
  Traffic is encrypted end-to-end
  A rogue service without a valid Istio cert cannot talk to inventory-service at all
${F}

**Verify mTLS is working:**
${F}bash
# Check if the connection between two services is using mTLS
istioctl authn tls-check order-service-pod inventory-service.production.svc.cluster.local
${F}

**What you see:**
${F}text
HOST:PORT                                    STATUS     SERVER     CLIENT     AUTHN POLICY
inventory-service.production:8080            OK         mTLS       mTLS       default/production
${F}
**What this means (simple):** STATUS OK + both sides showing mTLS = secure mutual authentication is active. If it showed "CONFLICT" or "HTTP", the connection would be unencrypted.

## Step 3: Add retries and circuit breakers via mesh policy — no code changes
${F}yaml
# VirtualService — retry policy for inventory-service calls
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: inventory-vs
  namespace: production
spec:
  hosts:
  - inventory-service
  http:
  - retries:
      attempts: 3                # retry up to 3 times
      perTryTimeout: 2s          # each attempt has a 2-second timeout
      retryOn: "5xx,connect-failure,reset"  # retry on these conditions
    timeout: 10s                 # total request timeout (all attempts combined)
    route:
    - destination:
        host: inventory-service
        port:
          number: 8080
${F}

${F}yaml
# DestinationRule — circuit breaker for inventory-service
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: inventory-dr
  namespace: production
spec:
  host: inventory-service
  trafficPolicy:
    outlierDetection:
      consecutive5xxErrors: 5      # open circuit after 5 consecutive 5xx errors
      interval: 10s                # check every 10 seconds
      baseEjectionTime: 30s        # eject unhealthy host for 30 seconds
      maxEjectionPercent: 50       # eject at most 50% of hosts
${F}

**What you see in Istio logs when circuit opens:**
${F}text
[2024-03-10T10:23:01] WARN  Envoy - upstream_rq_pending_overflow: inventory-service ejected
[2024-03-10T10:23:01] INFO  Envoy - Ejecting inventory-service:8080 for 30s (5 consecutive 5xx)
[2024-03-10T10:23:31] INFO  Envoy - Re-adding inventory-service:8080 after 30s
${F}
**What this means (simple):** The Envoy sidecar (not your code) tracks error rates and automatically stops sending traffic to failing hosts. Your order-service code doesn't have a single line of circuit breaker logic — Envoy handles it. After 30 seconds, Envoy tries again automatically.

## Step 4: Observe all traffic in Kiali (Istio's dashboard)
${F}bash
# Open Kiali — Istio's visual observability dashboard
kubectl port-forward -n istio-system svc/kiali 20001:20001
# Open http://localhost:20001
${F}

**What you see in Kiali:**
${F}text
Service graph showing:
  order-service ──── 1200 req/min, 99.8% success ──── inventory-service
  order-service ──── 450 req/min, 100% success ────── payment-service
  inventory-service ─ 230 req/min, 87.3% success ──── database-proxy   ← RED flag here

Click on inventory-service → database-proxy:
  Error rate: 12.7%
  P99 latency: 890ms
  Error type: 503 upstream timeout
${F}
**What this means (simple):** Kiali reads the traffic metrics from all Envoy sidecars and draws a live graph. You can see every service-to-service call, its success rate, latency, and error breakdown — without adding any instrumentation code to your services.

## Your interview answer
**Open:** "A service mesh like Istio handles east-west traffic — service-to-service calls inside the cluster. It injects an Envoy sidecar into every pod, and all traffic flows through it transparently."
**Then:** "mTLS is automatic — every inter-service call is mutually authenticated and encrypted. Retries, timeouts, and circuit breakers are configured as YAML policies — no code changes needed in any service. Kiali shows a live service graph with success rates and latencies for every connection."
**End:** "The rule of thumb: API Gateway for external → internal traffic (auth, rate limiting, routing). Service mesh for internal → internal traffic (mTLS, retries, observability). They're complementary, not competing."
`.trim(),

'th-gw-canary': `
## 🔥 The situation
You want to release a new version of a service (v2) to only 5% of users first. If it works, gradually increase to 100%. If something goes wrong, roll back instantly. How do you do this with zero downtime?

## 🧠 Understand this first

| Deployment strategy | What it means | Risk |
|---|---|---|
| Big bang (all at once) | Deploy v2 to all pods at the same time | High — if v2 is broken, 100% of users affected |
| Rolling update | Replace pods one by one: 1 v2 pod, then 2, then all | Medium — some users get v2 before all do |
| Blue/Green | Run v1 (blue) and v2 (green) fully, switch traffic at once | Low — instant rollback (switch back to blue) |
| Canary | Route small % of traffic to v2, monitor, gradually increase | Very low — 5% affected on failure, not 100% |

**Canary is the safest approach for production.**

## Step 1: Deploy v2 alongside v1 — both running at the same time
${F}yaml
# v1 Deployment (existing)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-service-v1
  labels:
    app: order-service
    version: v1
spec:
  replicas: 19   # will carry 95% of traffic
  selector:
    matchLabels:
      app: order-service
      version: v1
  template:
    metadata:
      labels:
        app: order-service
        version: v1
    spec:
      containers:
      - name: order-service
        image: order-service:1.0.0
${F}

${F}yaml
# v2 Deployment (canary — new version)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-service-v2
  labels:
    app: order-service
    version: v2
spec:
  replicas: 1    # will carry ~5% of traffic (1 out of 20 pods)
  selector:
    matchLabels:
      app: order-service
      version: v2
  template:
    metadata:
      labels:
        app: order-service
        version: v2
    spec:
      containers:
      - name: order-service
        image: order-service:2.0.0
${F}

**What you see:**
${F}bash
kubectl get pods -n production
${F}
${F}text
NAME                              READY  VERSION
order-service-v1-abc-1            1/1    v1
order-service-v1-abc-2            1/1    v1
... (19 pods total)
order-service-v2-xyz-1            1/1    v2   ← just 1 canary pod
${F}

## Step 2: Use Istio VirtualService for precise traffic splitting (weight-based)
${F}yaml
# VirtualService — controls what % of traffic goes to v1 vs v2
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: order-service-canary
spec:
  hosts:
  - order-service
  http:
  - route:
    - destination:
        host: order-service
        subset: v1        # v1 pods
      weight: 95          # 95% of requests
    - destination:
        host: order-service
        subset: v2        # v2 pod
      weight: 5           # 5% of requests
${F}

${F}yaml
# DestinationRule — defines what "v1" and "v2" subsets mean
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: order-service-dr
spec:
  host: order-service
  subsets:
  - name: v1
    labels:
      version: v1     # matches pods with label version=v1
  - name: v2
    labels:
      version: v2     # matches pods with label version=v2
${F}

**What this means (simple):** Without Istio, Kubernetes routes to pods randomly — with 19 v1 pods and 1 v2 pod, you'd get roughly 5% to v2 but can't control it precisely. With Istio, you set exact weights (95/5) regardless of pod counts. You can have 10 v2 pods but still only send 5% of traffic to them.

## Step 3: Monitor the canary — compare v1 vs v2 error rates and latency
${F}bash
# In Grafana — compare the two versions side by side
# Prometheus queries:

# Error rate for v1:
rate(http_server_requests_seconds_count{version="v1",status=~"5.."}[5m])
/ rate(http_server_requests_seconds_count{version="v1"}[5m])

# Error rate for v2:
rate(http_server_requests_seconds_count{version="v2",status=~"5.."}[5m])
/ rate(http_server_requests_seconds_count{version="v2"}[5m])
${F}

**What you see in Grafana during a healthy canary:**
${F}text
v1 error rate: 0.1%   p99 latency: 45ms
v2 error rate: 0.08%  p99 latency: 41ms  ← v2 is slightly better!
→ Safe to increase canary percentage
${F}

**What you see during a bad canary:**
${F}text
v1 error rate: 0.1%   p99 latency: 45ms
v2 error rate: 8.3%   p99 latency: 890ms  ← 🔴 v2 is much worse
→ Immediate rollback!
${F}

## Step 4: Gradually increase canary traffic
${F}bash
# Week 1: 5% to v2 — monitor for 24 hours
# Week 1, day 2: increase to 25%
kubectl apply -f - <<EOF
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: order-service-canary
spec:
  hosts:
  - order-service
  http:
  - route:
    - destination:
        host: order-service
        subset: v1
      weight: 75
    - destination:
        host: order-service
        subset: v2
      weight: 25
EOF
${F}

${F}bash
# Week 1, day 3: 50/50
# Week 1, day 4: 25% v1, 75% v2
# Week 1, day 5: 100% v2 — canary complete

# Final step: all traffic to v2
kubectl apply -f - <<EOF
spec:
  http:
  - route:
    - destination:
        host: order-service
        subset: v2
      weight: 100
EOF

# Then scale down v1
kubectl scale deployment order-service-v1 --replicas=0 -n production
${F}

## Step 5: Instant rollback if something goes wrong
${F}bash
# If v2 has high error rate — roll back in seconds
kubectl apply -f - <<EOF
spec:
  http:
  - route:
    - destination:
        host: order-service
        subset: v1
      weight: 100   # 100% back to v1 immediately
    - destination:
        host: order-service
        subset: v2
      weight: 0
EOF
${F}

**What you see immediately after rollback:**
${F}text
v1 error rate: 0.1%  (back to normal)
v2 error rate: 0   (no more traffic to v2)
→ Users are back to v1 — most never noticed the problem (only 5% were on v2)
${F}
**What this means (simple):** Rolling back is just changing a number in a YAML file and re-applying it. Kubernetes and Istio react in seconds. No pod restarts needed. No downtime. The v2 pods are still running — just receiving no traffic. You can investigate what went wrong while users are safely on v1.

## Your interview answer
**Open:** "I'd use a canary deployment with Istio's VirtualService — deploy v2 alongside v1 and route only 5% of traffic to it using a weight-based rule."
**Then:** "Monitor error rates and latency for both versions in Grafana. If v2 looks healthy, gradually increase the weight — 5% → 25% → 50% → 100% over a few days. If anything spikes, flip the weight back to 100% v1 in seconds."
**End:** "The key advantage over rolling update: you control exactly what percentage gets v2, and rollback is instant — just change a number, no pod restarts. Only 5% of users are exposed if something breaks."
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
