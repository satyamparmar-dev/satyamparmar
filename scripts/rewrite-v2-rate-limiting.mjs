/**
 * V2 rewrite of all 3 rate-limiting-traffic scenario answers.
 * Run: node scripts/rewrite-v2-rate-limiting.mjs
 */
import { readFileSync, writeFileSync } from 'fs';

const FILE = 'public/data/scenarioInterviewThemes.json';
const F = '```';

const answers = {

// ─────────────────────────────────────────────────────────────────────────────
'th-rl-one-client': `
## 🔥 The situation
One client is making thousands of requests per minute. It is hammering your API, slowing it down for all other clients. You need to limit how many requests this client can make.

## 🧠 Understand this first

| Algorithm | How it works | Best for |
|---|---|---|
| Fixed window | Count requests in a fixed time window (e.g., 0–60s) | Simple, but burst at window boundary |
| Sliding window | Count requests in a rolling window (past 60s from now) | Smoother, more accurate |
| Token bucket | A bucket fills with tokens over time. Each request uses 1 token | Allows controlled bursting |
| Leaky bucket | Requests queue up and drain at fixed rate | Strict smooth output rate |

**Most APIs use Token Bucket or Sliding Window.**

## Step 1: Rate limit with Redis (works across multiple service instances)

**Why Redis?** If you store counters in JVM memory, each instance has its own counter — a client can make 10x the limit by hitting 10 instances. Redis is shared across all instances.

${F}bash
# Using Bucket4j with Redis (popular Spring Boot choice)
# pom.xml:
${F}

${F}xml
<dependency>
  <groupId>com.github.vladimir-bukhtoyarov</groupId>
  <artifactId>bucket4j-redis</artifactId>
  <version>8.10.1</version>
</dependency>
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
${F}

${F}java
@Component
public class RateLimiterService {

    private final RedissonClient redisson;

    // 100 requests per minute per client
    private static final int LIMIT = 100;
    private static final Duration WINDOW = Duration.ofMinutes(1);

    public boolean isAllowed(String clientId) {
        // Each client gets its own bucket in Redis
        ProxyManager<String> proxyManager = Bucket4jRedisson.casBasedBuilder(redisson).build();

        BucketConfiguration config = BucketConfiguration.builder()
            .addLimit(Bandwidth.classic(LIMIT, Refill.intervally(LIMIT, WINDOW)))
            .build();

        Bucket bucket = proxyManager.builder()
            .build(clientId, () -> config);   // key = clientId

        return bucket.tryConsume(1); // returns true if allowed, false if rate limited
    }
}
${F}

**What Redis stores:**
${F}text
Key: "rate-limit:client-abc"
Value: { tokens: 87, last_refill: 1710000000 }

Each request: tokens-- (if > 0: allow. if == 0: reject)
Every minute: tokens reset to 100
${F}

## Step 2: Add rate limiting as a filter
${F}java
@Component
@Order(1)
public class RateLimitFilter extends OncePerRequestFilter {

    @Autowired private RateLimiterService rateLimiter;

    @Override
    protected void doFilterInternal(HttpServletRequest req,
                                    HttpServletResponse resp,
                                    FilterChain chain) throws IOException, ServletException {

        String clientId = req.getHeader("X-Client-Id");
        if (clientId == null) clientId = req.getRemoteAddr(); // fallback to IP

        if (!rateLimiter.isAllowed(clientId)) {
            resp.setStatus(429); // Too Many Requests
            resp.setHeader("Retry-After", "60");
            resp.setHeader("X-RateLimit-Limit", "100");
            resp.setHeader("X-RateLimit-Remaining", "0");
            resp.getWriter().write("{\"error\":\"Rate limit exceeded. Try again in 60 seconds.\"}");
            return;
        }

        chain.doFilter(req, resp);
    }
}
${F}

**What the client sees when rate limited:**
${F}text
HTTP 429 Too Many Requests
Retry-After: 60
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0

{ "error": "Rate limit exceeded. Try again in 60 seconds." }
${F}
**What this means (simple):** The client knows exactly: you hit your limit (100 requests), wait 60 seconds. The \`Retry-After\` header tells them when to retry. This is far better than a vague 503 error.

## Step 3: Different limits for different client tiers
${F}java
public int getLimitForClient(String clientId) {
    ClientTier tier = clientRepo.getTier(clientId);
    return switch (tier) {
        case FREE -> 60;       // 60 requests/min
        case PRO -> 1000;      // 1000 requests/min
        case ENTERPRISE -> 10000; // 10000 requests/min
    };
}
${F}

## Step 4: Monitor and alert on rate limiting
${F}java
// Add a metric counter whenever a request is rate limited
if (!rateLimiter.isAllowed(clientId)) {
    meterRegistry.counter("rate_limit.rejected",
        "clientId", clientId,
        "endpoint", req.getRequestURI()
    ).increment();
    // return 429 ...
}
${F}

${F}bash
# Prometheus query — how many requests per minute are being rejected?
rate(rate_limit_rejected_total[1m])
${F}

**What you see in Grafana:**
${F}text
rate_limit_rejected_total{clientId="client-abc"} increases steeply
→ Alert fires: "client-abc is being rate limited 500 times/min — investigate or contact client"
${F}

## Your interview answer
**Open:** "I'd use a token bucket algorithm backed by Redis — one bucket per client ID stored in Redis so the limit is shared across all service instances."
**Then:** "Each request decrements the bucket. If empty, return 429 with a Retry-After header. Refill the bucket every minute. For multiple service instances, Redis ensures the counter is global — not per-JVM."
**End:** "Different client tiers get different limits. A Prometheus counter tracks rejections per client, so we can alert if a client is being hammered or if we're rate limiting legitimate traffic too aggressively."
`.trim(),

// ─────────────────────────────────────────────────────────────────────────────
'th-rl-multi-instance': `
## 🔥 The situation
You have rate limiting working on a single service instance. Now you scale to 5 instances. Each instance has its own counter. A client can make 5x the intended limit by spreading requests across instances. How do you fix this?

## 🧠 Understand this first

| Approach | Shared? | Latency | Best for |
|---|---|---|---|
| In-memory (per JVM) | No — each instance is independent | Zero | Single instance only |
| Redis (centralized) | Yes — all instances share one counter | ~1ms | Most systems — correct choice |
| API Gateway (Nginx, Kong) | Yes — handled before your service | ~0.5ms | Large scale, infrastructure-level |
| Sticky sessions | Partial — routes same client to same instance | — | Workaround, not a real fix |

**The correct fix: move the counter to Redis.**

## Step 1: Confirm the problem — per-JVM counters don't share

${F}text
Without shared counter (broken):
  Instance 1: client-abc has made 80/100 requests
  Instance 2: client-abc has made 80/100 requests
  Instance 3: client-abc has made 80/100 requests
  Total actual requests from client-abc: 240 — but never rejected!

With Redis (correct):
  Redis: "client-abc" → 240 requests this minute
  All 3 instances read from same Redis key
  On request 101: all instances see bucket is empty → 429
${F}

## Step 2: Redis atomic increment (simplest approach)
${F}java
@Service
public class RedisRateLimiter {

    @Autowired
    private StringRedisTemplate redis;

    private static final int MAX_REQUESTS = 100;
    private static final int WINDOW_SECONDS = 60;

    public boolean isAllowed(String clientId) {
        String key = "rl:" + clientId;

        // Lua script — atomic: increment AND set expiry in one operation
        String luaScript =
            "local count = redis.call('INCR', KEYS[1])\n" +
            "if count == 1 then\n" +
            "  redis.call('EXPIRE', KEYS[1], ARGV[1])\n" +   // set TTL only on first request
            "end\n" +
            "return count";

        Long count = redis.execute(
            RedisScript.of(luaScript, Long.class),
            List.of(key),
            String.valueOf(WINDOW_SECONDS)
        );

        return count != null && count <= MAX_REQUESTS;
    }
}
${F}

**What Redis looks like during a busy minute:**
${F}bash
# Check in redis-cli
redis-cli GET "rl:client-abc"
# → "87"   (87 requests so far this minute)

redis-cli TTL "rl:client-abc"
# → 23     (key expires in 23 seconds — counter resets)
${F}

**What you see when counter is shared across instances:**
${F}text
Instance 1: request from client-abc → Redis count: 98 → ALLOW
Instance 2: request from client-abc → Redis count: 99 → ALLOW
Instance 3: request from client-abc → Redis count: 100 → ALLOW
Instance 1: request from client-abc → Redis count: 101 → REJECT (429)
Instance 2: request from client-abc → Redis count: 102 → REJECT (429)
// All 3 instances see the same counter — limit enforced correctly
${F}

## Step 3: Sliding window with Redis sorted sets (more accurate)
**Why:** Fixed window has a burst problem — a client can send 100 at 00:59 and another 100 at 01:01, getting 200 requests in 2 seconds but never hitting the per-minute limit.

${F}java
public boolean isAllowedSlidingWindow(String clientId) {
    String key = "sw:" + clientId;
    long now = System.currentTimeMillis();
    long windowStart = now - 60_000; // 60 seconds ago

    // Use Redis sorted set: score = timestamp, value = request UUID
    // 1. Remove old entries (outside the window)
    // 2. Count remaining (current window)
    // 3. Add new entry if allowed
    String luaScript =
        "redis.call('ZREMRANGEBYSCORE', KEYS[1], 0, ARGV[1])\n" +     // remove old
        "local count = redis.call('ZCARD', KEYS[1])\n" +               // count in window
        "if count < tonumber(ARGV[3]) then\n" +                        // if under limit
        "  redis.call('ZADD', KEYS[1], ARGV[2], ARGV[2])\n" +         // add new entry
        "  redis.call('EXPIRE', KEYS[1], 60)\n" +                      // reset TTL
        "  return 1\n" +
        "end\n" +
        "return 0";

    Long allowed = redis.execute(
        RedisScript.of(luaScript, Long.class),
        List.of(key),
        String.valueOf(windowStart),
        String.valueOf(now),
        String.valueOf(MAX_REQUESTS)
    );

    return Long.valueOf(1).equals(allowed);
}
${F}

**What Redis sorted set looks like:**
${F}bash
redis-cli ZRANGE "sw:client-abc" 0 -1 WITHSCORES
# → Each entry is a timestamp (score) of a past request
# Remove entries older than 60 seconds before counting
${F}

## Step 4: Or use an API Gateway for infrastructure-level rate limiting
**Best for:** Very high traffic, or when you don't want rate limiting logic in your application code.

${F}nginx
# Nginx rate limiting config
http {
  limit_req_zone $http_x_client_id zone=per_client:10m rate=100r/m;
  # zone=per_client — shared memory for counters (10MB)
  # rate=100r/m — 100 requests per minute per client ID

  server {
    location /api/ {
      limit_req zone=per_client burst=20 nodelay;
      # burst=20 — allow up to 20 extra requests instantly (token bucket style)
      # nodelay — don't queue, reject immediately if burst exceeded
      proxy_pass http://backend;
    }
  }
}
${F}

**What Nginx returns when rate limited:**
${F}text
HTTP 429 Too Many Requests
(Nginx handles this before your app even sees the request)
${F}

## Your interview answer
**Open:** "Per-JVM counters break when you scale — a client can hit each instance separately and get N times the intended limit. The fix is a shared counter in Redis."
**Then:** "An atomic Lua script in Redis does increment + expiry in one operation — no race conditions between instances. All instances read and write the same key. I'd use a sliding window sorted set for accuracy, or a simple INCR+EXPIRE for simplicity."
**End:** "For infrastructure-level enforcement before requests even reach the application, Nginx or Kong with shared memory zones is even better — zero application code, shared across instances by default."
`.trim(),

// ─────────────────────────────────────────────────────────────────────────────
'th-rl-429-random': `
## 🔥 The situation
Users randomly get 429 Too Many Requests errors, but they are not sending an unusual amount of traffic. The errors are intermittent. Something in the rate limiting logic is wrong.

## 🧠 Understand this first

| Root cause | What it looks like | Fix |
|---|---|---|
| Window boundary burst | 429 exactly at the start of each minute | Use sliding window instead of fixed window |
| Shared IP — NAT | All users behind a corporate firewall share one IP | Rate limit by user ID, not IP |
| Wrong key | All requests counted under the same bucket | Check the rate limit key construction |
| Redis connection failure | Fail-open counts as 0, or fail-closed rejects all | Add circuit breaker + fail-open policy |
| Too low a limit | Legitimate usage hits the limit | Re-analyse traffic patterns, raise limit |
| Clock skew in sliding window | Window calculation wrong across instances | Use Redis server time, not local JVM time |

## Step 1: Log which key is being rate limited
${F}java
// Add detailed logging to your rate limiter
public boolean isAllowed(String clientId) {
    String key = buildKey(clientId, request);

    long count = redis.increment(key);
    long remaining = Math.max(0, MAX_REQUESTS - count);

    log.debug("Rate limit check: key={} count={} remaining={} allowed={}",
        key, count, remaining, count <= MAX_REQUESTS);

    if (count > MAX_REQUESTS) {
        log.warn("Rate limited: key={} count={}", key, count);
        return false;
    }
    return true;
}
${F}

**What you see in logs when the key is wrong:**
${F}text
WARN  RateLimiter - Rate limited: key=rl:null count=101
WARN  RateLimiter - Rate limited: key=rl:null count=102
WARN  RateLimiter - Rate limited: key=rl:null count=103
${F}
**What this means (simple):** \`key=rl:null\` means the client ID was null — all requests are being counted under the same bucket! If your API key header is missing or misconfigured, all traffic shares one counter and the limit is hit almost immediately.

**Fix:**
${F}java
// Check what you're using as the rate limit key
String clientId = request.getHeader("X-Client-Id");
if (clientId == null || clientId.isBlank()) {
    // Option A: Reject requests without a client ID
    throw new MissingClientIdException("X-Client-Id header required");
    // Option B: Fall back to IP address
    clientId = "ip:" + request.getRemoteAddr();
}
String key = "rl:" + clientId;
${F}

## Step 2: Check for window boundary bursts (fixed window problem)
${F}text
Fixed window problem:
  23:59:55 — client sends 100 requests → bucket fills up
  00:00:01 — new window starts → bucket resets
  00:00:05 — client sends 100 more requests → another 100 allowed

Result: 200 requests in 10 seconds — but no 429s reported from the rate limiter.
For the server, this is a burst problem.
The flip side: users near the window boundary see 429 at 23:59:59 then no limit at 00:00:01.
${F}

**Fix: Use sliding window**
${F}java
// Sliding window counts requests in the past 60 seconds from NOW
// Not in a fixed 0-60s, 60-120s window
// At any given moment, the window slides forward in time

// Simple sliding window with Redis sorted set:
public boolean isAllowedSlidingWindow(HttpServletRequest request, String clientId) {
    String key = "sw:" + clientId;
    long now = System.currentTimeMillis();
    long windowStart = now - WINDOW_MS; // 60 seconds ago

    // Use Redis time (not local JVM time) to avoid clock skew across instances
    List<Long> redisTime = redis.execute(
        RedisScript.of("return redis.call('TIME')", List.class),
        Collections.emptyList()
    );
    long redisNow = redisTime.get(0) * 1000 + redisTime.get(1) / 1000; // microseconds → ms
    long redisWindowStart = redisNow - 60_000;

    // Remove entries outside window, count, add new entry
    redis.opsForZSet().removeRangeByScore(key, 0, redisWindowStart);
    Long count = redis.opsForZSet().size(key);

    if (count != null && count >= MAX_REQUESTS) {
        return false;
    }
    redis.opsForZSet().add(key, UUID.randomUUID().toString(), redisNow);
    redis.expire(key, Duration.ofSeconds(70)); // keep key a bit longer than window
    return true;
}
${F}

## Step 3: Handle Redis failures gracefully (fail-open vs fail-closed)

**Fail-closed (default for most):** If Redis is down, reject all requests → your whole API goes down.
**Fail-open:** If Redis is down, allow all requests → no rate limiting during outage (safer for users, riskier for server).

${F}java
public boolean isAllowed(String clientId) {
    try {
        return checkRedis(clientId);
    } catch (RedisConnectionFailureException | QueryTimeoutException e) {
        log.error("Redis rate limiter unavailable — failing open for client {}", clientId);
        // Fail-open: allow the request, lose rate limiting temporarily
        // Better than 429ing all legitimate users because Redis is down
        return true;
    }
}
${F}

**Add a circuit breaker around Redis:**
${F}java
@CircuitBreaker(name = "redisRateLimiter", fallbackMethod = "allowOnRedisDown")
public boolean checkRedis(String clientId) {
    // Redis call here
}

public boolean allowOnRedisDown(String clientId, Exception e) {
    log.warn("Rate limiter circuit open — allowing request for {}", clientId);
    return true; // fail-open
}
${F}

**What you see in logs during Redis outage:**
${F}text
ERROR RateLimiter - Redis rate limiter unavailable — failing open for client-abc
WARN  CircuitBreaker - redisRateLimiter: CLOSED → OPEN (Redis connection failure rate 100%)
WARN  RateLimiter   - Rate limiter circuit open — allowing request for client-abc
INFO  CircuitBreaker - redisRateLimiter: OPEN → HALF_OPEN (after 10s)
INFO  CircuitBreaker - redisRateLimiter: HALF_OPEN → CLOSED (Redis recovered)
${F}

## Step 4: Check for NAT / shared IP issues
${F}java
// BAD: rate limiting by IP when 1000 users share one corporate IP
String key = "rl:" + request.getRemoteAddr(); // all corporate users hit the same limit

// GOOD: rate limit by authenticated user ID (from JWT claim)
String userId = extractUserIdFromJwt(request);
String key = "rl:user:" + userId;

// EVEN BETTER: rate limit by API key for API clients
String apiKey = request.getHeader("X-API-Key");
String key = "rl:api:" + apiKey;
${F}

**How to detect shared IP problem:**
${F}bash
# Check your logs for the rate-limited IP
grep "rate limited" app.log | grep "ip:203.0.113.1" | wc -l
# → 5000 rate limit events for one IP

# Check how many distinct user IDs are behind that IP
grep "203.0.113.1" access.log | grep -o 'user=[^ ]*' | sort -u | wc -l
# → 847 distinct users behind that one IP — they're all hitting your per-IP limit
${F}

## Your interview answer
**Open:** "Random 429s usually trace to one of three things: a null rate limit key making all requests share one bucket, a fixed window causing bursts at the boundary, or rate limiting by IP when many users share one IP."
**Then:** "I'd add debug logging to see which key is being rate limited. If I see \`key=rl:null\`, the client ID header is missing. If the 429s happen exactly at the minute mark, it's the fixed window — switch to sliding window. If it's a corporate client, switch from IP to API-key-based limiting."
**End:** "I'd also add a circuit breaker around the Redis call to fail-open when Redis is down — better to lose rate limiting temporarily than to 429 all legitimate users because of an infra issue."
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
