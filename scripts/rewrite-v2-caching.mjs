/**
 * V2 rewrite — caching-consistency (2 scenarios)
 * Run: node scripts/rewrite-v2-caching.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
const FILE = 'public/data/scenarioInterviewThemes.json';
const F = '```';

const answers = {

'th-cache-stale': `
## 🔥 The situation
An admin updates a product price in the database. But users still see the old price for the next 30 minutes because the cache is stale. Some users even complete purchases at the wrong price. This is the cache consistency problem — the cache has data that is out of sync with the truth (the database).

## 🧠 Understand cache invalidation strategies

| Strategy | How it works | Best for | Stale window |
|---|---|---|---|
| TTL (Time-To-Live) | Cache entry expires after N seconds — auto-refresh | Read-heavy, tolerable staleness | Up to TTL duration |
| Cache-Aside (explicit invalidation) | On write: delete the cache key | Data that must be fresh | Near-zero (seconds) |
| Write-Through | On write: update DB AND cache together | Frequently read after write | Zero |
| Write-Behind (Write-Back) | Write to cache first, DB updated asynchronously | Very write-heavy | Zero for reads, eventual for DB |
| Event-driven invalidation | On DB change: publish event → consumer deletes cache | Microservices, multiple caches | Near-zero |

**The core trade-off:** Caches are fast but they hold a COPY of data. The original (DB) can change. The cache doesn't know unless you tell it.

## Step 1: Cache-Aside with explicit invalidation on write

This is the most common pattern. On every write to the DB, you also delete (or update) the cache entry.

${F}java
@Service
public class ProductService {

    @Autowired private ProductRepository productRepo;
    @Autowired private RedisTemplate<String, Product> redis;

    private static final Duration CACHE_TTL = Duration.ofMinutes(10);

    // READ — check cache first, hit DB only on miss
    public Product getProduct(Long id) {
        String key = "product:" + id;

        // 1. Try cache
        Product cached = redis.opsForValue().get(key);
        if (cached != null) {
            log.debug("Cache HIT for product {}", id);
            return cached;
        }

        // 2. Cache miss — go to DB
        log.debug("Cache MISS for product {} — fetching from DB", id);
        Product product = productRepo.findById(id)
            .orElseThrow(() -> new ProductNotFoundException(id));

        // 3. Populate cache for next time
        redis.opsForValue().set(key, product, CACHE_TTL);
        return product;
    }

    // WRITE — update DB, then invalidate cache
    @Transactional
    public Product updatePrice(Long id, BigDecimal newPrice) {
        // 1. Update the database (source of truth)
        Product product = productRepo.findById(id).orElseThrow();
        product.setPrice(newPrice);
        Product saved = productRepo.save(product);

        // 2. Invalidate the cache — delete the stale entry
        String key = "product:" + id;
        redis.delete(key);
        log.info("Updated price for product {} to {} — cache invalidated", id, newPrice);

        // Next read will be a cache MISS → fetches fresh data from DB → re-caches
        return saved;
    }
}
${F}

**What you see in logs — write + read cycle:**
${F}text
INFO  ProductService - Updated price for product 42 to 99.99 — cache invalidated
// Key "product:42" deleted from Redis

// 5 seconds later: user requests product 42
DEBUG ProductService - Cache MISS for product 42 — fetching from DB
// Fresh price 99.99 fetched from DB, re-cached in Redis

// Next user requests product 42:
DEBUG ProductService - Cache HIT for product 42
// Serves fresh 99.99 — correct!
${F}

## Step 2: Using Spring @CacheEvict annotation (cleaner approach)
${F}java
@Service
@CacheConfig(cacheNames = "products")
public class ProductService {

    // Cache the result — key = product ID
    @Cacheable(key = "#id", unless = "#result == null")
    public Product getProduct(Long id) {
        log.debug("Cache miss — loading product {} from DB", id);
        return productRepo.findById(id).orElseThrow();
    }

    // On update: evict the cache entry for this product
    @CacheEvict(key = "#id")
    @Transactional
    public Product updatePrice(Long id, BigDecimal newPrice) {
        Product p = productRepo.findById(id).orElseThrow();
        p.setPrice(newPrice);
        return productRepo.save(p);
        // @CacheEvict fires AFTER the method returns — cache cleared only after DB update succeeds
    }

    // Evict ALL product cache entries (e.g., after a bulk price update)
    @CacheEvict(allEntries = true)
    public void invalidateAllProducts() {
        log.info("All product cache entries cleared");
    }
}
${F}

${F}yaml
# Configure Redis as the cache backend
spring:
  cache:
    type: redis
    redis:
      time-to-live: 600000  # 10 minutes TTL (backup in case evict fails)
  data:
    redis:
      host: redis-service
      port: 6379
${F}

## Step 3: Event-driven cache invalidation (for distributed systems)

**Problem with the above:** If you have 3 instances of ProductService and instance 1 updates the product, only instance 1 deletes the cache key. Instances 2 and 3 still have the stale entry in their local caches (if using in-memory caching).

**Solution:** Publish a "product updated" event → all instances listen → all invalidate their caches.

${F}java
// Publisher — after updating the DB
@Transactional
public Product updatePrice(Long id, BigDecimal newPrice) {
    Product saved = productRepo.save(updated);

    // Publish event so ALL instances know to invalidate
    kafkaTemplate.send("cache-invalidation",
        id.toString(),
        "{\"type\":\"PRODUCT_UPDATED\",\"productId\":" + id + "}");
    return saved;
}

// All instances listen to this topic
@KafkaListener(topics = "cache-invalidation", groupId = "product-service")
public void handleCacheInvalidation(String message) {
    CacheInvalidationEvent event = parse(message);
    String key = "product:" + event.getProductId();
    redis.delete(key);
    log.info("Cache invalidated for product {} via event", event.getProductId());
}
${F}

**What you see across 3 service instances:**
${F}text
Instance 1: Updated product 42 price → published PRODUCT_UPDATED event
Instance 1: Cache invalidated for product 42 via event
Instance 2: Cache invalidated for product 42 via event
Instance 3: Cache invalidated for product 42 via event
// All 3 instances now serve fresh data on next request
${F}

## Step 4: The race condition — read between evict and re-cache
${F}text
A subtle problem with Cache-Aside:

T1: Writer updates DB → deletes cache key
T2: Reader 1 gets cache MISS → starts DB read (takes 50ms)
T3: Reader 2 gets cache MISS → starts DB read too (race condition!)
T4: Reader 1 finishes → caches value V1
T5: Writer2 updates DB → deletes cache key again
T6: Reader 2 finishes → caches OLD value V1 (!)  ← stale data re-cached

This is rare but possible under high concurrency.
${F}

**Fix: use short TTL + optimistic locking on cache write:**
${F}java
// Only write to cache if the key doesn't already exist (SET NX = Set if Not eXists)
// This prevents the race: only the FIRST reader populates the cache
String key = "product:" + id;
Boolean wasSet = redis.opsForValue().setIfAbsent(key, product, CACHE_TTL);
if (Boolean.TRUE.equals(wasSet)) {
    log.debug("Cache populated for product {}", id);
} else {
    log.debug("Cache already populated by another thread for product {}", id);
}
${F}

## Step 5: Set an appropriate TTL as a safety net
**Even with explicit invalidation, always set a TTL.** If the invalidation event is lost (network blip, consumer down), the cache will still self-heal after the TTL.

${F}java
// TTL guideline by data type:
// Product prices (change often): 5-10 minutes
// User profiles: 30 minutes (low change frequency)
// Currency exchange rates: 1 hour (external API, change slowly)
// Static content (config, categories): 24 hours
// Session data: match session timeout (e.g., 30 minutes)

redis.opsForValue().set(key, value, Duration.ofMinutes(10)); // always set TTL
// Never cache without a TTL — keys accumulate forever and Redis runs out of memory
${F}

## Your interview answer
**Open:** "Stale cache is the classic cache consistency problem. The simplest fix is Cache-Aside with explicit eviction — on every write to the database, delete the cache key for that record."
**Then:** "The next read is a cache miss, hits the fresh DB value, and re-caches it. With Spring's @CacheEvict this is automatic. For distributed deployments with multiple service instances, each instance listens to a 'cache-invalidation' Kafka event so all instances evict simultaneously."
**End:** "Always set a TTL even with explicit invalidation — if an eviction event is lost, the TTL ensures the cache eventually self-heals. The TTL is your safety net. The explicit invalidation is your first-response. Both together."
`.trim(),

'th-cache-down': `
## 🔥 The situation
Redis goes down. Your application was caching all DB queries in Redis. Now every single request hits the database directly — 100x more load than the DB was designed for. The DB buckles, then your entire service goes down. How do you design for Redis failure?

## 🧠 Redis failure modes and impacts

${F}text
Your service before Redis down:
  1000 req/sec → Redis (cache hit rate 95%) → 50 DB queries/sec
  DB comfortable at 50 queries/sec

Redis goes down:
  1000 req/sec → Redis fails → ALL fall through to DB → 1000 DB queries/sec
  DB designed for 50 queries/sec → OVERWHELMED → DB crashes → total outage

This is called a cache stampede or thundering herd on DB.
${F}

| Design choice | What it does | Impact on Redis-down scenario |
|---|---|---|
| No circuit breaker | Every request tries Redis, fails, hits DB | DB overwhelmed immediately |
| Circuit breaker + fail-open | After N failures, stop trying Redis, serve direct from DB | DB hit but controlled |
| Request coalescing | Only 1 DB query per unique cache key, others wait | DB load stays manageable |
| Local fallback cache (Caffeine) | In-memory L1 cache in the JVM — works even when Redis is down | Most requests served without DB |
| Graceful degradation | Return slightly stale data from last known good state | Some users get old data — better than outage |

## Step 1: Add a circuit breaker around Redis calls
${F}xml
<!-- pom.xml -->
<dependency>
  <groupId>io.github.resilience4j</groupId>
  <artifactId>resilience4j-spring-boot3</artifactId>
</dependency>
${F}

${F}java
@Service
public class ProductService {

    @Autowired private RedisTemplate<String, Product> redis;
    @Autowired private ProductRepository productRepo;

    // Circuit breaker wraps Redis access
    // If Redis fails repeatedly, circuit opens → fallback runs → DB queried directly
    @CircuitBreaker(name = "redis", fallbackMethod = "getProductFromDb")
    public Product getProduct(Long id) {
        String key = "product:" + id;
        Product cached = redis.opsForValue().get(key); // may throw if Redis is down
        if (cached != null) return cached;

        // Cache miss — get from DB and cache it
        Product product = productRepo.findById(id).orElseThrow();
        redis.opsForValue().set(key, product, Duration.ofMinutes(10)); // may throw
        return product;
    }

    // Fallback — called when Redis circuit is open
    public Product getProductFromDb(Long id, Exception e) {
        log.warn("Redis circuit open for product {} — serving direct from DB: {}", id, e.getMessage());
        // Go straight to DB — no cache read or write
        return productRepo.findById(id).orElseThrow();
    }
}
${F}

${F}yaml
resilience4j:
  circuitbreaker:
    instances:
      redis:
        slidingWindowSize: 10
        failureRateThreshold: 50      # open circuit if 50% of 10 calls fail
        waitDurationInOpenState: 15s  # wait 15s before testing Redis again
        permittedNumberOfCallsInHalfOpenState: 3
${F}

**What you see in logs when Redis goes down:**
${F}text
WARN  ProductService - Redis circuit open for product 42 — serving direct from DB: Connection refused
WARN  ProductService - Redis circuit open for product 43 — serving direct from DB: Connection refused
INFO  CircuitBreaker - redis: CLOSED → OPEN (failure rate 100%)
// After circuit opens, no Redis connection attempts — all go straight to DB
INFO  CircuitBreaker - redis: OPEN → HALF_OPEN (after 15s)
INFO  CircuitBreaker - redis: HALF_OPEN → CLOSED (Redis recovered)
INFO  ProductService - Redis circuit closed — resuming normal cache operations
${F}
**What this means (simple):** Without circuit breaker, every request tries Redis (adds 100ms timeout waiting for a dead server), then falls back to DB — threads pile up waiting for Redis timeouts. With circuit breaker, after 5 failures the circuit opens instantly — Redis calls skip the network, threads are free, DB load is direct but manageable.

## Step 2: Add a local in-memory cache (L1 cache) as a fallback

**Redis = L2 cache (shared, remote)**
**Caffeine = L1 cache (local, in-process — survives Redis downtime)**

${F}java
@Configuration
public class CacheConfig {

    @Bean
    public Cache<Long, Product> productLocalCache() {
        return Caffeine.newBuilder()
            .maximumSize(1000)               // max 1000 products in JVM memory
            .expireAfterWrite(Duration.ofMinutes(2)) // 2 min local TTL (shorter than Redis)
            .recordStats()                   // enable hit/miss metrics
            .build();
    }
}

@Service
public class ProductService {

    @Autowired private Cache<Long, Product> localCache;   // Caffeine L1
    @Autowired private RedisTemplate<String, Product> redis; // Redis L2
    @Autowired private ProductRepository productRepo;    // DB

    public Product getProduct(Long id) {
        // L1: Check local JVM cache (zero network calls — always fast)
        Product local = localCache.getIfPresent(id);
        if (local != null) {
            log.debug("L1 cache HIT for product {}", id);
            return local;
        }

        // L2: Check Redis (network call — fast if Redis is up)
        try {
            Product cached = redis.opsForValue().get("product:" + id);
            if (cached != null) {
                log.debug("L2 (Redis) cache HIT for product {}", id);
                localCache.put(id, cached); // populate L1 from L2
                return cached;
            }
        } catch (Exception e) {
            log.warn("Redis unavailable — skipping L2 cache: {}", e.getMessage());
            // Don't rethrow — continue to DB
        }

        // DB: Final fallback (expensive — should be rare)
        log.debug("All cache layers miss — fetching product {} from DB", id);
        Product product = productRepo.findById(id).orElseThrow();
        localCache.put(id, product);          // populate L1
        try {
            redis.opsForValue().set("product:" + id, product, Duration.ofMinutes(10));
        } catch (Exception e) {
            log.warn("Could not write to Redis — L2 cache miss only: {}", e.getMessage());
        }
        return product;
    }
}
${F}

**What happens when Redis goes down:**
${F}text
Normal (Redis up):
  Request → L1 hit (80%)   → return in <1ms
  Request → L1 miss, L2 hit (18%) → return in ~2ms
  Request → L1+L2 miss, DB (2%)  → return in ~20ms

Redis DOWN:
  Request → L1 hit (80%)   → return in <1ms (L1 unaffected by Redis!)
  Request → L1 miss, Redis error → DB (20%) → return in ~20ms
  // L1 serves 80% of traffic with no degradation
  // Only L1 misses (cold items) hit the DB directly
  // DB load goes from 2% to 20% of traffic — manageable, not catastrophic
${F}

## Step 3: Monitor Redis health and alert before it causes an outage
${F}java
// Spring Boot health indicator for Redis
// This is built in — just check the actuator health endpoint
${F}

${F}bash
curl http://your-service:8080/actuator/health
${F}

**What you see when Redis is down:**
${F}json
{
  "status": "DOWN",
  "components": {
    "redis": {
      "status": "DOWN",
      "details": {
        "error": "org.springframework.data.redis.RedisConnectionFailureException: Unable to connect"
      }
    },
    "db": { "status": "UP" },
    "diskSpace": { "status": "UP" }
  }
}
${F}

${F}yaml
# Prometheus alert — fire when Redis is down
- alert: RedisCacheDown
  expr: spring_cache_gets_total{result="miss"} / spring_cache_gets_total > 0.5
  for: 2m
  annotations:
    summary: "Cache miss rate > 50% for 2 minutes — Redis may be down"

# Or directly from Redis exporter:
- alert: RedisDown
  expr: redis_up == 0
  for: 30s
  annotations:
    summary: "Redis is down — cache layer unavailable"
${F}

## Step 4: Design for Redis restart — prevent cache stampede on recovery

**The problem:** Redis comes back up with an empty cache. Every request is a miss → all hit DB simultaneously → DB overwhelmed → DB crashes → Redis had no effect.

${F}java
// Probabilistic early expiration — prevents mass simultaneous miss after Redis restart
// "XFetch" algorithm: some requests refresh the cache BEFORE it expires
// so it never goes fully cold

public Product getProductWithEarlyRefresh(Long id) {
    String key = "product:" + id;
    String ttlKey = key + ":ttl";

    Product cached = redis.opsForValue().get(key);
    if (cached != null) {
        // Probabilistic refresh: if within 20% of TTL, sometimes refresh early
        Long remainingTtlMs = redis.getExpire(key, TimeUnit.MILLISECONDS);
        long totalTtlMs = Duration.ofMinutes(10).toMillis();

        double expiryFraction = 1.0 - (double) remainingTtlMs / totalTtlMs;
        if (expiryFraction > 0.8 && Math.random() < 0.1) {
            // 10% chance of early refresh in the last 20% of TTL window
            // Spreads cache refreshes over time instead of all at once at expiry
            log.debug("Probabilistic early refresh for product {}", id);
            refreshCacheFromDb(id, key);
        }
        return cached;
    }
    return refreshCacheFromDb(id, key);
}
${F}

## Your interview answer
**Open:** "When Redis goes down without protection, every cache miss falls through to the DB — potentially 50x the normal DB load. The DB wasn't designed for that and crashes. You need multiple layers of protection."
**Then:** "First: a circuit breaker around Redis calls so that after Redis goes down, subsequent requests skip the Redis timeout entirely and go straight to DB — no 30-second connection waits piling up threads. Second: a local Caffeine L1 cache in the JVM — this survives Redis downtime completely and serves 80% of traffic with zero degradation."
**End:** "The L1 cache is the most important one — it doesn't depend on any network. L2 (Redis) is for cross-instance sharing and larger capacity. When Redis comes back, you also need to warm up the cache gradually to prevent a stampede on recovery."
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
