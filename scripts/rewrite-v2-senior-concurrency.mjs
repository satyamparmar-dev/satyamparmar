/**
 * V2 rewrite — senior-java-concurrency-jmm (3 scenarios)
 * Run: node scripts/rewrite-v2-senior-concurrency.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
const FILE = 'public/data/scenarioInterviewThemes.json';
const F = '```';

const answers = {

'th-sr-volatile-visible': `
## 🔥 The situation
Thread 1 sets \`running = false\` to stop a loop. Thread 2 is running \`while (running) { ... }\`. Thread 2 never sees the update. It loops forever. No exception. No error. Just silent, infinite looping.

## 🧠 Why threads can't see each other's writes — the Java Memory Model

${F}text
Modern CPUs have multiple layers of cache (L1, L2, L3).
Each CPU core has its OWN local cache.

Thread 1 runs on Core 1:
  Core 1 L1 cache: running = false  ← Thread 1 wrote here
  Main memory:     running = true   ← NOT yet flushed to main memory

Thread 2 runs on Core 2:
  Core 2 L1 cache: running = true   ← Thread 2 reads from ITS cache
  Main memory:     running = true

Thread 2 never sees Thread 1's write because it's still in Core 1's cache!
This is a visibility problem — not a correctness problem in your logic, but in hardware caching.
${F}

| Keyword / mechanism | Guarantees visibility? | Guarantees atomicity? | Use for |
|---|---|---|---|
| Nothing (plain field) | No | No | Single-threaded only |
| \`volatile\` | Yes — flushes to main memory | No — not for compound ops | Simple flags, status |
| \`synchronized\` | Yes | Yes | Any compound operation |
| \`AtomicBoolean\` | Yes | Yes — CAS operations | Boolean with check-then-act |
| \`AtomicInteger\` | Yes | Yes | Counters, compare-and-set |

## Step 1: See the broken code — and understand why it's broken

${F}java
// BROKEN: plain boolean — Thread 2 may cache the old value forever
public class Worker implements Runnable {
    private boolean running = true; // ← no visibility guarantee

    public void stop() {
        this.running = false; // Thread 1 writes this
        // But this write may stay in Thread 1's CPU cache!
        // Thread 2 reads from ITS cache and sees the old value
    }

    @Override
    public void run() {
        while (running) { // Thread 2 reads running — may never see false
            doWork();
        }
        System.out.println("Worker stopped");
    }
}
${F}

**What you see (broken behaviour):**
${F}text
Main thread calls: worker.stop()
→ running = false set in Thread 1's cache
→ Thread 2 keeps running forever — "Worker stopped" never prints
(may work sometimes on some JVMs/CPUs — but it's not guaranteed to work)
${F}

## Step 2: Fix with volatile — for simple flags

${F}java
// FIXED: volatile ensures every write is immediately visible to all threads
public class Worker implements Runnable {
    private volatile boolean running = true; // ← keyword adds visibility guarantee

    public void stop() {
        this.running = false;
        // JVM guarantees: this write is flushed to main memory immediately
        // Any subsequent read of 'running' by ANY thread will see false
    }

    @Override
    public void run() {
        while (running) { // always reads from main memory — never stale
            doWork();
        }
        System.out.println("Worker stopped"); // this WILL print
    }
}
${F}

**What you see after fix:**
${F}text
Main thread calls: worker.stop()
Thread 2: exits the while loop
Thread 2: "Worker stopped"
${F}
**What this means (simple):** \`volatile\` tells the JVM "never cache this field — always read it fresh from main memory, always write it directly to main memory." It's a lightweight synchronization for simple reads and writes.

## Step 3: When volatile is NOT enough — use AtomicBoolean

**The problem with volatile for compound operations:**
${F}java
// BROKEN: volatile doesn't help here — check-then-act is NOT atomic
private volatile int count = 0;

public void increment() {
    count++; // This is THREE operations: read count, add 1, write count
    // Thread A reads count=5
    // Thread B reads count=5 (same time)
    // Thread A writes count=6
    // Thread B writes count=6  ← should be 7! Lost update!
}
${F}

${F}java
// FIXED: AtomicInteger — compare-and-set is a single atomic CPU instruction
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicBoolean;

private final AtomicInteger count = new AtomicInteger(0);
private final AtomicBoolean running = new AtomicBoolean(true);

public void increment() {
    count.incrementAndGet(); // atomic: read+add+write in one CPU instruction
}

public boolean stopIfRunning() {
    return running.compareAndSet(true, false);
    // Atomic: "if running is true, set it to false and return true"
    //         "if running is already false, do nothing and return false"
    // No thread can see a half-done state
}
${F}

**What you see with AtomicInteger under concurrent load:**
${F}text
// 10 threads each call increment() 1000 times:
// Without AtomicInteger: count might be 7823 (lost updates)
// With AtomicInteger: count is exactly 10000 — always
${F}

## Step 4: synchronized for compound operations on multiple fields
${F}java
// When you need to update multiple fields atomically together:
public class BankAccount {
    private int balance;
    private int transactionCount; // must stay in sync with balance

    // BAD: two volatile fields don't help — they update independently
    // Another thread could see balance updated but transactionCount not yet

    // GOOD: synchronized — both updates happen atomically
    public synchronized void deposit(int amount) {
        balance += amount;
        transactionCount++;
        // No thread can read balance and transactionCount between these two lines
    }

    public synchronized int getBalance() {
        return balance; // also synchronized — always sees the latest write
    }
}
${F}

**Performance note:**
${F}text
volatile:         No locking — very fast, but only for simple reads/writes
AtomicXxx:        Hardware CAS instruction — fast, for single-variable operations
synchronized:     JVM lock — slightly slower, but handles any compound operation
ReentrantLock:    Like synchronized but more flexible (tryLock, interruptible)
${F}

## Your interview answer
**Open:** "This is a Java Memory Model visibility problem. Each CPU core has its own cache, and without a visibility guarantee, Thread 2 may never see Thread 1's write — it keeps reading the stale cached value."
**Then:** "For a simple stop flag, I'd mark it \`volatile\` — that tells the JVM to always flush writes to main memory and always read fresh. For compound operations like check-then-act or incrementing a counter, \`volatile\` isn't enough — I'd use \`AtomicBoolean\` or \`AtomicInteger\` which use hardware compare-and-set instructions for atomicity."
**End:** "When multiple fields need to be updated together consistently, \`synchronized\` is the right tool — it ensures only one thread is in that block at a time and all writes are visible when the lock is released."
`.trim(),

'th-sr-executor-pool': `
## 🔥 The situation
Your ExecutorService is backing up. Tasks are queuing faster than threads can process them. Response times degrade. You need to understand how thread pools work, how to size them correctly, and which type to use for your workload.

## 🧠 How a ThreadPoolExecutor works

${F}text
ThreadPoolExecutor has these components:

1. Core threads (corePoolSize):
   → Always kept alive, even when idle
   → New tasks go here first

2. Work queue (BlockingQueue):
   → If all core threads are busy, new tasks wait here
   → Can be bounded (capacity limit) or unbounded

3. Max threads (maximumPoolSize):
   → If queue is full AND we're below max, create a new thread
   → Extra threads die after keepAliveTime if idle

4. Rejection handler:
   → If queue is full AND we're at max threads → task is rejected

Flow: task arrives → core thread free? → use it
                   → queue not full?  → queue it
                   → below max?       → create new thread
                   → else             → reject!
${F}

| Pool type | Best for | Pitfall |
|---|---|---|
| Fixed pool (newFixedThreadPool) | CPU-bound tasks — predictable throughput | Unbounded queue — memory leak if tasks queue faster than consumed |
| Cached pool (newCachedThreadPool) | Short-lived async tasks | Unbounded threads — can spawn thousands under load |
| Work-stealing (ForkJoinPool) | Recursive/parallel computation | Not ideal for blocking I/O |
| Single thread (newSingleThreadExecutor) | Ordered serial execution | No concurrency — one task at a time |
| Scheduled pool | Cron-style recurring tasks | Not for high-throughput work |

## Step 1: Sizing the pool — CPU-bound vs IO-bound

${F}java
int cpuCores = Runtime.getRuntime().availableProcessors();

// CPU-bound tasks (computation — hashing, encoding, sorting):
// Rule: pool size = number of CPU cores
// More threads than cores = context switching overhead, no benefit
int cpuBoundPoolSize = cpuCores; // e.g., 8 threads on an 8-core machine

// IO-bound tasks (HTTP calls, DB queries — threads WAIT most of the time):
// Rule: pool size = cores × (1 + wait_time / compute_time)
// If a task spends 90% waiting and 10% computing: ratio = 9
// pool size = 8 × (1 + 9) = 80 threads
// More threads can be in-flight while others wait
int ioBoundPoolSize = cpuCores * 10; // rough starting point — tune with load testing

System.out.println("CPU-bound pool size: " + cpuBoundPoolSize);
System.out.println("IO-bound pool size: " + ioBoundPoolSize);
${F}

**What you see:**
${F}text
CPU-bound pool size: 8
IO-bound pool size: 80
${F}

## Step 2: Create a properly configured ThreadPoolExecutor

${F}java
// For IO-bound tasks (HTTP client, DB calls):
ThreadPoolExecutor executor = new ThreadPoolExecutor(
    20,                                          // corePoolSize: always-on threads
    100,                                         // maximumPoolSize: max under load
    60L, TimeUnit.SECONDS,                       // keepAliveTime: idle extra threads die after 60s
    new ArrayBlockingQueue<>(500),               // BOUNDED queue — capacity 500
    new ThreadFactory() {                        // named threads — easier to debug
        private final AtomicInteger count = new AtomicInteger(0);
        public Thread newThread(Runnable r) {
            Thread t = new Thread(r, "order-processor-" + count.incrementAndGet());
            t.setDaemon(true); // daemon threads die when main thread dies
            return t;
        }
    },
    new ThreadPoolExecutor.CallerRunsPolicy()    // rejection: caller thread runs the task
    // This creates natural backpressure — if pool+queue are full,
    // the HTTP request thread itself runs the task (slowing down new requests)
);
${F}

**Rejection policies explained:**
${F}java
// AbortPolicy (default): throw RejectedExecutionException — caller must handle it
// CallerRunsPolicy:      the thread that submitted the task runs it — natural backpressure
// DiscardPolicy:         silently drop the task — use only if task loss is acceptable
// DiscardOldestPolicy:  drop the oldest queued task to make room
${F}

## Step 3: Use Spring's @Async with a configured pool
${F}java
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "orderProcessorPool")
    public Executor orderProcessorPool() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(20);
        executor.setMaxPoolSize(100);
        executor.setQueueCapacity(500);
        executor.setThreadNamePrefix("order-processor-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}

@Service
public class OrderNotifier {

    @Async("orderProcessorPool") // use the named pool
    public CompletableFuture<Void> sendConfirmationEmail(String orderId) {
        emailService.send(orderId); // runs in the pool thread, not the HTTP thread
        return CompletableFuture.completedFuture(null);
    }
}
${F}

## Step 4: Monitor the pool — catch queue buildup before it causes problems
${F}java
// Expose pool metrics to Prometheus via Micrometer
@Bean
public MeterBinder threadPoolMetrics(ThreadPoolTaskExecutor executor) {
    return registry -> {
        ThreadPoolExecutor pool = executor.getThreadPoolExecutor();

        Gauge.builder("thread.pool.active", pool, ThreadPoolExecutor::getActiveCount)
            .tag("pool", "order-processor").register(registry);

        Gauge.builder("thread.pool.queue.size", pool, e -> e.getQueue().size())
            .tag("pool", "order-processor").register(registry);

        Gauge.builder("thread.pool.completed", pool, ThreadPoolExecutor::getCompletedTaskCount)
            .tag("pool", "order-processor").register(registry);
    };
}
${F}

${F}bash
# Prometheus query — alert when queue is getting full:
thread_pool_queue_size{pool="order-processor"} > 400
# → Alert: "Order processor queue at 80% capacity — scale up or investigate slow tasks"
${F}

**What you see in the metrics during a spike:**
${F}text
thread_pool_active{pool="order-processor"}    = 100   ← all threads busy
thread_pool_queue_size{pool="order-processor"} = 487  ← queue at 97% — nearly full!
→ ALERT fires → scale up or investigate why tasks are slow
${F}

## Your interview answer
**Open:** "Thread pool sizing depends on whether tasks are CPU-bound or IO-bound. For CPU-bound work, pool size = CPU cores. For IO-bound work where threads spend most time waiting, I can have many more threads — roughly cores × 10 as a starting point."
**Then:** "I'd use ThreadPoolTaskExecutor with a bounded queue — an unbounded queue hides the problem (tasks pile up silently, memory fills). With CallerRunsPolicy as the rejection handler, when the pool is full the calling thread runs the task itself — that's natural backpressure that slows intake when we're overwhelmed."
**End:** "I'd expose active count and queue depth as Prometheus metrics and alert when the queue reaches 80% — that's early warning, before requests start failing."
`.trim(),

'th-sr-completablefuture': `
## 🔥 The situation
You're making 3 external API calls — user profile, orders, and inventory. They're sequential: you wait for user profile (200ms), then orders (150ms), then inventory (300ms). Total: 650ms. These calls are independent — there's no reason they can't all run at the same time.

## 🧠 CompletableFuture — the building blocks

| Method | What it does | Use when |
|---|---|---|
| \`supplyAsync(fn)\` | Run a task in a thread pool, returns a future | Starting an async operation |
| \`thenApply(fn)\` | Transform the result (like map) | After a result arrives, convert it |
| \`thenCompose(fn)\` | Chain another future (like flatMap) | Next step is also async |
| \`thenCombine(other, fn)\` | Combine two futures when both complete | Merge two independent results |
| \`allOf(futures...)\` | Wait for ALL futures to complete | Fan-out: wait for everything |
| \`anyOf(futures...)\` | Return when the FIRST future completes | Race: take the fastest |
| \`exceptionally(fn)\` | Handle exception, provide fallback | Recovery on error |
| \`handle(fn)\` | Handle both success and failure | Always runs, check for exception |
| \`orTimeout(n, unit)\` | Fail fast if not done in time (Java 9+) | Timeout on any async call |

## Step 1: Sequential vs parallel — the difference in code and time

${F}java
// SEQUENTIAL (slow — 650ms total):
public DashboardData loadDashboard(String userId) {
    UserProfile profile = userService.getProfile(userId);    // 200ms — wait
    List<Order> orders = orderService.getOrders(userId);     // 150ms — wait
    List<Item> inventory = inventoryService.getItems(userId); // 300ms — wait
    return new DashboardData(profile, orders, inventory);
    // Total: 200 + 150 + 300 = 650ms
}

// PARALLEL (fast — 300ms total — as slow as the slowest call):
public DashboardData loadDashboard(String userId) throws Exception {
    CompletableFuture<UserProfile> profileFuture =
        CompletableFuture.supplyAsync(() -> userService.getProfile(userId));    // starts immediately

    CompletableFuture<List<Order>> ordersFuture =
        CompletableFuture.supplyAsync(() -> orderService.getOrders(userId));    // starts immediately

    CompletableFuture<List<Item>> inventoryFuture =
        CompletableFuture.supplyAsync(() -> inventoryService.getItems(userId)); // starts immediately

    // All 3 are running in parallel NOW.
    // Wait for all to complete:
    CompletableFuture.allOf(profileFuture, ordersFuture, inventoryFuture).join();

    return new DashboardData(
        profileFuture.get(),     // already done — no wait
        ordersFuture.get(),      // already done — no wait
        inventoryFuture.get()    // already done — no wait
    );
    // Total: max(200, 150, 300) = 300ms ← 2× faster!
}
${F}

**What you see in traces (parallel):**
${F}text
Dashboard request    0ms → 312ms  [312ms total]
  ├── getProfile     0ms → 200ms  [200ms]     ← all three start at time 0
  ├── getOrders      0ms → 151ms  [151ms]
  └── getItems       0ms → 311ms  [311ms]     ← longest determines total time
${F}

## Step 2: Add a custom thread pool (don't use ForkJoinPool.commonPool for IO!)
${F}java
// By default, supplyAsync uses ForkJoinPool.commonPool
// That pool is shared by ALL CompletableFutures in the JVM — bad for IO tasks
// Create a dedicated pool for IO-bound calls:

@Configuration
public class AsyncConfig {
    @Bean("dashboardPool")
    public Executor dashboardPool() {
        ThreadPoolTaskExecutor exec = new ThreadPoolTaskExecutor();
        exec.setCorePoolSize(20);
        exec.setMaxPoolSize(50);
        exec.setQueueCapacity(200);
        exec.setThreadNamePrefix("dashboard-async-");
        exec.initialize();
        return exec;
    }
}

// Use it:
@Autowired @Qualifier("dashboardPool") private Executor dashboardPool;

CompletableFuture<UserProfile> profileFuture =
    CompletableFuture.supplyAsync(() -> userService.getProfile(userId), dashboardPool);
${F}

## Step 3: Handle exceptions and provide fallbacks
${F}java
// Without error handling — one failure kills the whole response:
CompletableFuture<UserProfile> profileFuture =
    CompletableFuture.supplyAsync(() -> userService.getProfile(userId));
// If userService throws, the exception propagates up — no dashboard at all

// With exceptionally — return a fallback on error:
CompletableFuture<UserProfile> profileFuture =
    CompletableFuture.supplyAsync(() -> userService.getProfile(userId))
        .exceptionally(ex -> {
            log.warn("Profile service failed: {} — using empty profile", ex.getMessage());
            return UserProfile.empty(); // fallback — show dashboard with empty profile
        });

// With handle — inspect both success and failure:
CompletableFuture<UserProfile> profileFuture =
    CompletableFuture.supplyAsync(() -> userService.getProfile(userId))
        .handle((profile, ex) -> {
            if (ex != null) {
                log.warn("Profile failed: {}", ex.getMessage());
                return UserProfile.empty();
            }
            return profile;
        });
${F}

**What you see in logs when one service fails:**
${F}text
WARN  DashboardService - Profile service failed: Connection refused — using empty profile
INFO  DashboardService - Dashboard loaded: profile=empty, orders=15, inventory=3 items
// Dashboard still shows orders and inventory — partial success, not total failure
${F}

## Step 4: Add timeouts — don't wait forever for slow services
${F}java
// orTimeout() — Java 9+: complete exceptionally if not done in time
CompletableFuture<UserProfile> profileFuture =
    CompletableFuture.supplyAsync(() -> userService.getProfile(userId), dashboardPool)
        .orTimeout(2, TimeUnit.SECONDS)   // fail after 2 seconds
        .exceptionally(ex -> {
            if (ex instanceof TimeoutException) {
                log.warn("Profile timed out after 2s — using cached/empty");
                return profileCache.getLastKnown(userId); // try cache
            }
            return UserProfile.empty();
        });

// completeOnTimeout() — Java 9+: complete with a value (not exception) on timeout
CompletableFuture<UserProfile> profileFuture =
    CompletableFuture.supplyAsync(() -> userService.getProfile(userId), dashboardPool)
        .completeOnTimeout(UserProfile.empty(), 2, TimeUnit.SECONDS);
        // if not done in 2s: complete with empty profile (no exception thrown)
${F}

**What you see with timeout:**
${F}text
WARN  DashboardService - Profile timed out after 2s — using cached/empty
INFO  DashboardService - Dashboard loaded in 2001ms (capped by profile timeout)
// Without timeout: request could hang for 30s waiting for a slow service
// With timeout: max response time is bounded at 2s — predictable SLA
${F}

## Step 5: Chaining dependent futures (thenCompose)
${F}java
// When the second call depends on the result of the first:
CompletableFuture<DashboardData> dashboard =
    CompletableFuture.supplyAsync(() -> userService.getProfile(userId))  // step 1
        .thenCompose(profile -> {
            // step 2 uses the profile result — can't run until step 1 is done
            CompletableFuture<List<Order>> ordersFuture =
                CompletableFuture.supplyAsync(() -> orderService.getOrders(profile.getAccountId()));
            CompletableFuture<List<Item>> itemsFuture =
                CompletableFuture.supplyAsync(() -> inventoryService.getItems(profile.getRegion()));
            // steps 2a and 2b run in parallel — both depend on profile, not on each other
            return CompletableFuture.allOf(ordersFuture, itemsFuture)
                .thenApply(v -> new DashboardData(profile, ordersFuture.join(), itemsFuture.join()));
        });
${F}

## Your interview answer
**Open:** "CompletableFuture lets you run independent calls in parallel and combine results. Three sequential 200ms calls become 200ms total if they run concurrently — you wait for the slowest one, not the sum."
**Then:** "I'd use supplyAsync with a dedicated thread pool — not the ForkJoinPool common pool, which is shared and can starve. exceptionally gives a fallback when one service fails so the whole response doesn't fail. orTimeout bounds wait time so slow services don't hold up responses indefinitely."
**End:** "thenCompose is for chaining — when step 2 depends on step 1's result, but steps 2a and 2b can still run in parallel within that step. The pattern: sequential where there's a dependency, parallel everywhere else."
`.trim(),

};

const data = JSON.parse(readFileSync(FILE, 'utf8'));
let count = 0;
for (const theme of data.themes) {
  for (const scenario of theme.scenarios) {
    if (answers[scenario.id]) { scenario.answer = answers[scenario.id]; console.log(`✅ ${scenario.id}`); count++; }
  }
}
writeFileSync(FILE, JSON.stringify(data, null, 2));
console.log(`\nDone — ${count} scenarios rewritten.`);
