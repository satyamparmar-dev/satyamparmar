import { readFileSync, writeFileSync } from 'fs';
const FILE = 'public/data/scenarioInterviewThemes.json';
const F = '```';
const answers = {
  'th-lock-ttl': `
## 🔥 The situation

Your batch job service acquires a Redis lock with a 30-second TTL before processing a large payment batch. The JVM hits a GC pause — a full collection that lasts 45 seconds. During those 45 seconds, the lock's TTL expires. A second process sees the lock as free, acquires it, and starts processing the same batch. The first process wakes up from GC pause, does not know its lock expired, and continues. Now both processes are writing to the payment table at the same time. Rows get double-updated. Some payments are processed twice.

This is one of the hardest bugs in distributed systems because it happens rarely, only under load, and only when the GC pause is longer than your TTL.

## 🧠 Understand this first — why TTL locks are not safe alone

| What you expect | What actually happens |
|---|---|
| Lock held by Process A until it releases | Lock expires silently after TTL |
| Only one process runs at a time | Two processes run after TTL expires |
| Process A knows if it lost the lock | Process A has no idea — it thinks it still holds the lock |
| Lock release is atomic | Process A can release Process B's lock if it does not verify ownership |

The core problem: **the process that holds a lock has no way to know the lock expired while it was paused**. Redis TTL is wall-clock time. GC pauses are invisible to Redis.

## Step 1: See the problem in logs — dual acquisition

**What you see in the logs when this happens:**
\`\`\`
2026-05-08 10:15:00 INFO  BatchWorker[PID-101] - Acquired lock: batch-job-lock TTL=30s token=TOKEN-A
2026-05-08 10:15:01 INFO  BatchWorker[PID-101] - Processing batch: 5000 payments
2026-05-08 10:15:02 WARN  JVM              - GC: Full GC (Allocation Failure) pause starting
2026-05-08 10:15:47 WARN  JVM              - GC: Full GC completed — paused 45237ms ← 45 seconds!
2026-05-08 10:15:47 INFO  BatchWorker[PID-101] - GC done, resuming batch at offset=1200

# Meanwhile, on a different server:
2026-05-08 10:15:30 INFO  BatchWorker[PID-202] - Lock batch-job-lock is free (TTL expired at 10:15:30)
2026-05-08 10:15:30 INFO  BatchWorker[PID-202] - Acquired lock: batch-job-lock TTL=30s token=TOKEN-B
2026-05-08 10:15:30 INFO  BatchWorker[PID-202] - Processing batch: 5000 payments (from offset=0)

# Both PID-101 and PID-202 are now running simultaneously — data corruption starts here
2026-05-08 10:15:47 ERROR DatabaseAudit    - DUPLICATE UPDATE detected: paymentId=PAY-8812 updated by both PID-101 and PID-202
\`\`\`

**What this means (simple):**
- PID-101 was alive and holding the lock — but Redis did not know that
- PID-202 correctly saw an expired TTL and acquired the lock
- Two processes now believe they are the sole owner — both are wrong

## Step 2: Understand fencing tokens — the only safe solution

A **fencing token** is a monotonically increasing number returned each time a lock is acquired. The storage layer (your database) rejects any write with a token older than the last accepted token.

**Run this (concept diagram as log output):**
\`\`\`
Acquire #1 → token=47   (Process A gets this)
Acquire #2 → token=48   (Process B gets this, after TTL expires)

Process A (stale, token=47) tries to write:
  → Storage sees: last accepted token=48, incoming token=47
  → Storage REJECTS the write: "Stale fencing token — another process took over"

Process B (current, token=48) writes:
  → Storage sees: last accepted token=48, incoming token=48
  → Storage ACCEPTS the write
\`\`\`

**What this means (simple):**
- The storage layer becomes the final arbiter — not Redis
- Even if Process A wakes up and tries to write, the database blocks it
- This is safe because the token comparison happens atomically inside the database transaction

## Step 3: Implement fencing tokens with Redisson in Java

**Run this (Java — Redisson with fencing token support):**
\`\`\`java
@Service
public class BatchJobService {

    private final RedissonClient redisson;
    private final PaymentBatchRepository batchRepo;

    // Redisson's RLock gives you a lock with ownership tracking
    public void processBatchSafely(Long batchId) {
        RLock lock = redisson.getLock("batch-job-lock:" + batchId);

        boolean acquired = false;
        try {
            // waitTime=0: don't queue up — fail fast if lock is taken
            // leaseTime=30: auto-release after 30s if process dies
            acquired = lock.tryLock(0, 30, TimeUnit.SECONDS);

            if (!acquired) {
                log.info("Lock not acquired for batchId={} — another process is running", batchId);
                return;
            }

            log.info("Lock acquired for batchId={} by threadId={}", batchId,
                     Thread.currentThread().getId());

            // Process in small chunks so each database write includes a version check
            processBatchWithVersionCheck(batchId);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            if (acquired && lock.isHeldByCurrentThread()) {
                lock.unlock();
                log.info("Lock released for batchId={}", batchId);
            } else if (acquired) {
                // This means our lease expired — log a critical alert
                log.error("CRITICAL: Lock lease expired while processing batchId={} — " +
                          "check for concurrent processing!", batchId);
            }
        }
    }

    private void processBatchWithVersionCheck(Long batchId) {
        PaymentBatch batch = batchRepo.findById(batchId).orElseThrow();

        // Version acts as a simple fencing token at the DB level
        long expectedVersion = batch.getVersion();

        for (Payment payment : batch.getPendingPayments()) {
            // Each update includes the expected version — DB rejects stale writes
            int updated = batchRepo.updatePaymentIfVersion(
                payment.getId(), "PROCESSED", expectedVersion);

            if (updated == 0) {
                // Another process updated this — stop immediately
                log.error("Fencing check failed: payment={} batchId={} — stopping this worker",
                          payment.getId(), batchId);
                throw new StaleWorkerException("Lost lock lease — another worker took over");
            }
        }
    }
}
\`\`\`

**The SQL that enforces fencing at the database level:**
\`\`\`sql
-- This UPDATE only succeeds if the version matches
-- If another worker updated it first, version is now higher → 0 rows updated
UPDATE payments
SET    status = 'PROCESSED',
       version = version + 1,
       processed_at = NOW()
WHERE  id = :paymentId
  AND  status = 'PENDING'
  AND  version = :expectedVersion;
\`\`\`

**What you see in the log when the stale worker is blocked:**
\`\`\`
2026-05-08 10:15:47 ERROR BatchJobService  - Fencing check failed: payment=PAY-8812 batchId=500 — stopping this worker
2026-05-08 10:15:47 ERROR BatchJobService  - CRITICAL: Lock lease expired while processing batchId=500 — check for concurrent processing!
2026-05-08 10:15:47 INFO  BatchJobService  - Stale worker PID-101 self-terminated — no data corrupted
\`\`\`

**What this means (simple):**
- The database update checks the version — if it returns 0 rows updated, the worker knows it lost the race
- The worker stops itself before any corruption happens
- This is exactly how fencing tokens work: the database is the authority, not the lock

## Step 4: Add a heartbeat to extend the TTL while the job runs

**Run this (Java — heartbeat thread that renews the lock):**
\`\`\`java
// Redisson does this automatically via "watch dog" mechanism
// But here is the concept in plain code:

ScheduledExecutorService heartbeat = Executors.newSingleThreadScheduledExecutor();

heartbeat.scheduleAtFixedRate(() -> {
    if (lock.isHeldByCurrentThread()) {
        // Renew the lease — reset TTL to 30 seconds from now
        lock.expire(30, TimeUnit.SECONDS);
        log.debug("Lock lease renewed for batchId={}", batchId);
    } else {
        log.warn("Cannot renew — lock no longer held by this thread");
        heartbeat.shutdown();  // stop renewing
    }
}, 10, 10, TimeUnit.SECONDS);  // renew every 10 seconds (TTL is 30s)
\`\`\`

**What you see:**
\`\`\`
2026-05-08 10:15:00 DEBUG BatchJobService - Lock lease renewed for batchId=500
2026-05-08 10:15:10 DEBUG BatchJobService - Lock lease renewed for batchId=500
2026-05-08 10:15:20 DEBUG BatchJobService - Lock lease renewed for batchId=500
# ... continues until job finishes or process dies
# If process dies, heartbeat stops, TTL expires naturally, next worker picks up
\`\`\`

**What this means (simple):**
- Short TTL (30s) + heartbeat every 10s = lock stays alive as long as the process is alive
- If the process dies or GC-pauses for longer than 30s without a renewal, the lock expires correctly
- Redisson's watch dog mode does this automatically — you do not need to write the heartbeat yourself

## Your interview answer

**Open:** "TTL-based locks are not safe alone because a GC pause or network delay can cause the lock to expire while the process is still alive and believes it holds the lock — leading to two processes running the same job simultaneously."

**Then:** "The fix has two parts. First, I add a fencing token — a monotonically increasing number assigned at lock acquisition. Every database write includes this token, and the database rejects any write with a stale token using an optimistic version check in the WHERE clause. Second, I use a heartbeat to renew the lock TTL while the job runs — Redisson does this automatically with its watch dog. This way, a healthy process never loses its lock unexpectedly."

**End:** "I test this by simulating a GC pause with Thread.sleep inside the critical section, verifying that the stale worker's database updates return 0 rows and the worker self-terminates, while the new lock holder completes the job cleanly."
`.trim(),

  'th-lock-contention': `
## 🔥 The situation

Your order service adds a Redis distributed lock to protect inventory deduction. Under normal load it works fine. Then a flash sale happens — 50 concurrent threads all try to acquire the same lock key \`inventory-lock\`. Forty-nine threads queue up waiting. Each waits up to 5 seconds. Requests start timing out. The p99 latency goes from 80ms to 6 seconds. Users see spinner screens. The lock — added for safety — became the bottleneck.

This is lock contention. It turns a parallel system into a serial pipeline.

## 🧠 Understand this first — how contention kills throughput

| Without lock | With global lock (contended) |
|---|---|
| 50 threads work in parallel | 50 threads wait in a queue |
| Throughput ≈ 50 × per-thread rate | Throughput ≈ 1 × per-thread rate |
| p99 latency = single-thread time | p99 latency = 49 × wait time |
| Scales with thread count | Does NOT scale |

| Solution | How it helps | Best for |
|---|---|---|
| Shard locks per entity | 50 locks instead of 1 — each has low contention | Order per orderId, inventory per SKU |
| Shrink critical section | Less time holding lock = less waiting | Any contended lock |
| Optimistic locking | No lock at all — retry on conflict | Low contention scenarios |
| Queue per shard | Kafka partition per key — serial within key, parallel across keys | High volume, ordered writes |

## Step 1: Measure the contention — see the problem in metrics

**Run this (log your lock wait time):**
\`\`\`java
@Service
public class InventoryService {

    private final RedissonClient redisson;
    private final MeterRegistry meterRegistry;

    public void deductInventory(String skuId, int qty) {
        RLock lock = redisson.getLock("inventory-lock");  // ← global lock, all SKUs share this

        long waitStart = System.currentTimeMillis();

        try {
            // waitTime=5s: give up after 5 seconds of waiting
            boolean acquired = lock.tryLock(5, 10, TimeUnit.SECONDS);
            long waitMs = System.currentTimeMillis() - waitStart;

            // Record how long threads waited for the lock
            meterRegistry.timer("lock.wait.ms", "lock", "inventory-lock")
                         .record(waitMs, TimeUnit.MILLISECONDS);

            if (waitMs > 1000) {
                log.warn("High lock wait time: {}ms for lock=inventory-lock skuId={}",
                         waitMs, skuId);
            }

            if (!acquired) {
                throw new LockTimeoutException("Could not acquire inventory lock after 5s");
            }

            doDeductInventory(skuId, qty);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            if (lock.isHeldByCurrentThread()) lock.unlock();
        }
    }
}
\`\`\`

**What you see in Grafana / logs during a flash sale:**
\`\`\`
# Grafana metric: lock.wait.ms p99
Normal load:   p99 = 12ms    ← fine
Flash sale:    p99 = 4832ms  ← 400x worse — this is the contention

# Application logs:
2026-05-08 14:00:01 WARN  InventoryService - High lock wait time: 3241ms for lock=inventory-lock skuId=SKU-99
2026-05-08 14:00:01 WARN  InventoryService - High lock wait time: 4107ms for lock=inventory-lock skuId=SKU-42
2026-05-08 14:00:02 ERROR InventoryService - Could not acquire inventory lock after 5s — thread giving up
2026-05-08 14:00:02 ERROR InventoryService - Could not acquire inventory lock after 5s — thread giving up
\`\`\`

**What this means (simple):**
- All 50 threads are fighting for 1 lock
- Each thread waits behind all the others
- The wait time grows linearly with the number of threads
- This is Amdahl's Law: the serial section (critical section) limits total parallelism

## Step 2: Fix — shard the lock by entity ID

Instead of one global lock for all inventory, use one lock per SKU ID. Now 50 threads touching 50 different SKUs all run in parallel.

**Run this (Java — lock per SKU ID):**
\`\`\`java
@Service
public class InventoryService {

    private final RedissonClient redisson;

    public void deductInventory(String skuId, int qty) {
        // ← Key change: lock name includes the SKU ID
        // "inventory-lock:SKU-99" and "inventory-lock:SKU-42" are DIFFERENT locks
        RLock lock = redisson.getLock("inventory-lock:" + skuId);

        try {
            boolean acquired = lock.tryLock(1, 5, TimeUnit.SECONDS);

            if (!acquired) {
                // Very unlikely now — only threads for the SAME skuId compete
                throw new LockTimeoutException("Inventory lock timeout for sku=" + skuId);
            }

            doDeductInventory(skuId, qty);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            if (lock.isHeldByCurrentThread()) lock.unlock();
        }
    }
}
\`\`\`

**What you see after sharding (same flash sale load):**
\`\`\`
# Grafana metric: lock.wait.ms p99
Before sharding:  p99 = 4832ms   ← terrible
After sharding:   p99 = 14ms     ← back to normal!

# Application logs: no more timeout errors
2026-05-08 14:05:00 INFO  InventoryService - Deducted qty=1 from SKU-99 in 8ms
2026-05-08 14:05:00 INFO  InventoryService - Deducted qty=1 from SKU-42 in 11ms
2026-05-08 14:05:00 INFO  InventoryService - Deducted qty=1 from SKU-07 in 9ms
\`\`\`

**What this means (simple):**
- 50 threads touching 50 different SKUs → 50 different locks → no contention
- The only contention is when two threads try to buy the SAME SKU at the same moment — which is rare and much shorter
- This is the most important fix — always ask "what is the natural key for this operation?"

## Step 3: Shrink the critical section — only lock what needs it

Even with a sharded lock, keep the critical section as small as possible.

**Run this (Java — move non-critical work outside the lock):**
\`\`\`java
public void deductInventory(String skuId, int qty, String orderId) {
    // ❌ BAD: all of this is inside the lock — validation, logging, notification
    // RLock lock = redisson.getLock("inventory-lock:" + skuId);
    // lock.lock();
    // validateOrder(orderId);       ← does not need the lock
    // sendNotification(orderId);    ← definitely does not need the lock
    // doDeductInventory(skuId, qty);
    // logAuditEvent(orderId);       ← does not need the lock
    // lock.unlock();

    // ✅ GOOD: only the inventory deduction is inside the lock
    validateOrder(orderId);           // ← outside lock — safe, read-only

    RLock lock = redisson.getLock("inventory-lock:" + skuId);
    try {
        lock.tryLock(1, 5, TimeUnit.SECONDS);
        doDeductInventory(skuId, qty);  // ← only this needs the lock
    } finally {
        if (lock.isHeldByCurrentThread()) lock.unlock();
    }

    logAuditEvent(orderId);           // ← outside lock — safe
    sendNotification(orderId);        // ← outside lock — async call
}
\`\`\`

**What you see (lock hold time comparison):**
\`\`\`
# Before: lock held for entire method
Lock hold time: avg=280ms (validation + deduction + notification all inside)

# After: only deduction inside lock
Lock hold time: avg=12ms  ← 23x less time per hold = 23x more throughput
\`\`\`

**What this means (simple):**
- The less time each thread holds the lock, the sooner the next thread can proceed
- I/O calls (HTTP, database reads) inside the critical section multiply wait time for everyone
- Rule: only put the minimum atomic mutation inside the lock

## Step 4: Use optimistic locking as an alternative (no Redis needed)

For low-to-medium contention, optimistic locking avoids the lock entirely.

**Run this (Java — JPA optimistic locking with @Version):**
\`\`\`java
@Entity
@Table(name = "inventory")
public class Inventory {
    @Id
    private String skuId;

    private int availableQty;

    @Version                    // ← JPA manages this automatically
    private Long version;       // increments on every update
}

@Service
public class InventoryService {

    @Retryable(value = OptimisticLockingFailureException.class, maxAttempts = 3)
    @Transactional
    public void deductInventory(String skuId, int qty) {
        Inventory inv = inventoryRepo.findById(skuId).orElseThrow();

        if (inv.getAvailableQty() < qty) {
            throw new InsufficientInventoryException("Not enough stock for sku=" + skuId);
        }

        inv.setAvailableQty(inv.getAvailableQty() - qty);
        inventoryRepo.save(inv);
        // JPA sends: UPDATE inventory SET available_qty=?, version=version+1 WHERE sku_id=? AND version=?
        // If two threads read version=5 and both try to save, the second one gets 0 rows updated
        // → OptimisticLockingFailureException → @Retryable retries with fresh data
    }
}
\`\`\`

**What you see under load with optimistic locking:**
\`\`\`
# Low contention (most SKUs): no retries needed
2026-05-08 14:10:00 INFO  - Deducted qty=1 SKU-99 version=5→6 in 9ms (0 retries)

# High contention (same SKU, flash item): occasional retries
2026-05-08 14:10:01 WARN  - Optimistic lock conflict SKU-99 version=8 — retrying (attempt 1)
2026-05-08 14:10:01 INFO  - Deducted qty=1 SKU-99 version=9→10 in 18ms (1 retry)

# Throughput comparison (200 concurrent threads, 1 hot SKU):
Global Redis lock:     ~200 req/s  (serial bottleneck)
Sharded Redis lock:    ~800 req/s  (4 concurrent per shard)
Optimistic locking:   ~1400 req/s  (parallel reads, occasional retry)
\`\`\`

**What this means (simple):**
- Optimistic locking assumes conflicts are rare — it reads without locking and detects conflicts at write time
- If there is a conflict, it retries with fresh data — usually resolves in 1-2 retries
- Works best when contention on the same entity is low (most flash sales: many SKUs, not one)
- If contention is genuinely high on the same row, optimistic locking causes too many retries — use a queue instead

## Your interview answer

**Open:** "Lock contention happens when one global lock serialises all threads — adding a distributed lock for safety turns a parallel system into a serial queue, and under load the wait time grows linearly with the number of threads."

**Then:** "The most impactful fix is sharding the lock by the natural entity key — instead of one inventory-lock for all SKUs, I use inventory-lock:SKU-ID so threads for different SKUs never compete. I also shrink the critical section to only the atomic mutation — no I/O, no HTTP calls, no audit logging inside the lock. For scenarios with low natural contention I prefer optimistic locking with JPA's @Version annotation, which needs no Redis at all and lets me measure retry rates as a health signal."

**End:** "I detect the problem by tracking lock wait time as a metric — when p99 wait time starts exceeding 100ms I investigate the lock granularity, and when it exceeds 1 second I treat it as a latency incident."
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
