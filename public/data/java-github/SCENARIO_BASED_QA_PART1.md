# Scenario-Based Questions & Answers - Part 1: Core Java & JVM

> **Senior Technical Architect's Guide to Real-World Java Problems**
> *25+ Years of Enterprise Java Experience*

---

## Table of Contents

1. [Core Java Scenarios](#core-java-scenarios)
2. [JVM & Memory Management](#jvm--memory-management)
3. [Concurrency & Multithreading](#concurrency--multithreading)

---

## Core Java Scenarios

### Q1: You're seeing `OutOfMemoryError: Java heap space` in production. How do you diagnose and fix it?

**Scenario:**
Your Spring Boot application running in production starts throwing `OutOfMemoryError` after running for several hours. The application handles high traffic and processes large datasets.

**Step-by-Step Solution:**

#### Step 1: Immediate Diagnosis

```bash
# Check current heap usage
jmap -heap <pid>

# Generate heap dump
jmap -dump:format=b,file=heap.hprof <pid>

# Or use JVM flags to auto-dump on OOM
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=/path/to/dumps
```

#### Step 2: Analyze Heap Dump

**Tools:**
- **Eclipse MAT (Memory Analyzer Tool)** - Best for finding memory leaks
- **VisualVM** - Good for quick analysis
- **jhat** - Built-in but basic

**Common Patterns to Look For:**
1. **Memory Leaks**: Objects that should be garbage collected but aren't
2. **Large Objects**: Collections holding too much data
3. **Class Loader Leaks**: Multiple class loaders not being released

#### Step 3: Code Investigation

```java
// ❌ BAD: Memory leak example
public class OrderCache {
    private static final Map<String, Order> cache = new HashMap<>();
    
    public void addOrder(Order order) {
        cache.put(order.getId(), order); // Never removed!
    }
}

// ✅ GOOD: Fixed with size limit and TTL
public class OrderCache {
    private static final Cache<String, Order> cache = Caffeine.newBuilder()
        .maximumSize(10_000)
        .expireAfterWrite(30, TimeUnit.MINUTES)
        .build();
    
    public void addOrder(Order order) {
        cache.put(order.getId(), order);
    }
}
```

#### Step 4: Common Causes & Fixes

**1. Unbounded Collections**
```java
// ❌ BAD
List<Order> orders = new ArrayList<>(); // Grows indefinitely

// ✅ GOOD
List<Order> orders = new ArrayList<>(expectedSize);
// Or use bounded collections
Queue<Order> queue = new ArrayBlockingQueue<>(1000);
```

**2. Caching Without Eviction**
```java
// ❌ BAD
private Map<String, User> userCache = new ConcurrentHashMap<>();

// ✅ GOOD: Use proper caching library
@Cacheable(value = "users", key = "#id")
public User getUser(String id) {
    return userRepository.findById(id);
}

// Or manual with TTL
private Cache<String, User> cache = Caffeine.newBuilder()
    .maximumSize(10_000)
    .expireAfterWrite(1, TimeUnit.HOURS)
    .build();
```

**3. Static Collections Growing**
```java
// ❌ BAD
public class Logger {
    private static List<LogEntry> logs = new ArrayList<>(); // Never cleared!
}

// ✅ GOOD
public class Logger {
    private static final int MAX_LOGS = 1000;
    private static Queue<LogEntry> logs = new ArrayBlockingQueue<>(MAX_LOGS);
}
```

#### Step 5: JVM Tuning

```bash
# Increase heap size (if legitimate need)
-Xms2g -Xmx4g

# Use G1GC for better pause times
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200

# Enable GC logging
-Xlog:gc*:file=gc.log:time,tags:filecount=5,filesize=10M

# For large heaps, consider ZGC or Shenandoah
-XX:+UseZGC  # Java 11+
```

**Best Practices:**
1. **Set appropriate heap size** - Not too small, not too large
2. **Enable heap dump on OOM** - Always have `-XX:+HeapDumpOnOutOfMemoryError`
3. **Monitor GC** - Use tools like GCViewer, JStat
4. **Review code** - Look for unbounded collections, caches, static references
5. **Use profiling** - JProfiler, YourKit for production profiling

**Follow-Up Questions:**

1. **Q: How do you prevent memory leaks in a long-running application?**
   - Use weak references for caches
   - Implement proper cleanup in `@PreDestroy` methods
   - Use connection pooling with proper limits
   - Monitor heap usage with Micrometer/Prometheus

2. **Q: What's the difference between `OutOfMemoryError: Java heap space` and `OutOfMemoryError: Metaspace`?**
   - Heap space: Object instances
   - Metaspace: Class metadata (Java 8+)
   - Fix metaspace: `-XX:MaxMetaspaceSize=256m`

3. **Q: How do you handle memory issues in a microservices architecture?**
   - Set appropriate limits per service
   - Use container memory limits (Docker/K8s)
   - Implement circuit breakers
   - Monitor with distributed tracing

---

### Q2: Your application is experiencing high CPU usage (90%+). How do you identify and resolve it?

**Scenario:**
Production application CPU spikes to 90%+ during peak hours. Response times increase, and users complain about slowness.

**Step-by-Step Solution:**

#### Step 1: Identify CPU-Intensive Threads

```bash
# Get thread dump
jstack <pid> > thread-dump.txt

# Or use top to find Java process
top -H -p <pid>  # Shows threads

# Continuous monitoring
jstat -gcutil <pid> 1000  # Every second
```

#### Step 2: Analyze Thread Dump

**Look for:**
1. **RUNNABLE threads** doing CPU-intensive work
2. **BLOCKED threads** waiting for locks
3. **Threads in loops** without sleep/yield

**Common Patterns:**

```java
// ❌ BAD: CPU-intensive loop
while (true) {
    processData(); // No sleep, consumes 100% CPU
}

// ✅ GOOD: Add sleep or use proper scheduling
@Scheduled(fixedDelay = 1000)
public void processData() {
    // Process with delay
}

// Or use CompletableFuture with delays
CompletableFuture.delayedExecutor(1, TimeUnit.SECONDS)
    .execute(() -> processData());
```

#### Step 3: Code-Level Fixes

**1. Inefficient Algorithms**
```java
// ❌ BAD: O(n²) nested loops
for (Order order : orders) {
    for (Item item : items) {
        if (order.contains(item)) { // Expensive operation
            process(order, item);
        }
    }
}

// ✅ GOOD: Use HashMap for O(1) lookup
Map<String, Order> orderMap = orders.stream()
    .collect(Collectors.toMap(Order::getId, Function.identity()));

for (Item item : items) {
    Order order = orderMap.get(item.getOrderId());
    if (order != null) {
        process(order, item);
    }
}
```

**2. Synchronous Blocking Operations**
```java
// ❌ BAD: Blocking I/O in request thread
@GetMapping("/data")
public ResponseEntity<Data> getData() {
    Data data = databaseService.fetchData(); // Blocks thread
    return ResponseEntity.ok(data);
}

// ✅ GOOD: Use async processing
@GetMapping("/data")
public CompletableFuture<ResponseEntity<Data>> getData() {
    return CompletableFuture.supplyAsync(() -> 
        databaseService.fetchData(), asyncExecutor)
        .thenApply(ResponseEntity::ok);
}
```

**3. Excessive Logging**
```java
// ❌ BAD: String concatenation in logging
logger.debug("Processing order: " + order + " with items: " + items);

// ✅ GOOD: Use parameterized logging
logger.debug("Processing order: {} with items: {}", order, items);

// Or use isDebugEnabled check for expensive operations
if (logger.isDebugEnabled()) {
    logger.debug("Expensive debug: {}", expensiveOperation());
}
```

**4. Inefficient Stream Operations**
```java
// ❌ BAD: Multiple terminal operations
long count = orders.stream().count();
List<Order> filtered = orders.stream()
    .filter(o -> o.isValid())
    .collect(Collectors.toList());

// ✅ GOOD: Single pass
List<Order> filtered = orders.stream()
    .filter(Order::isValid)
    .collect(Collectors.toList());
long count = filtered.size();
```

#### Step 4: Use Profiling Tools

**JProfiler / YourKit:**
- CPU profiling mode
- Identify hot methods
- Call tree analysis

**Async Profiler (Open Source):**
```bash
# Attach to running process
java -jar async-profiler.jar -e cpu -d 60 -f profile.html <pid>
```

#### Step 5: Monitoring & Alerts

```java
// Add CPU monitoring
@Component
public class CpuMonitor {
    private final MeterRegistry meterRegistry;
    
    @Scheduled(fixedRate = 5000)
    public void monitorCpu() {
        double cpuUsage = getCpuUsage();
        meterRegistry.gauge("system.cpu.usage", cpuUsage);
        
        if (cpuUsage > 80.0) {
            log.warn("High CPU usage detected: {}%", cpuUsage);
        }
    }
}
```

**Follow-Up Questions:**

1. **Q: How do you handle CPU spikes during batch processing?**
   - Use thread pools with appropriate size
   - Implement backpressure
   - Process in smaller batches
   - Use scheduled executors with delays

2. **Q: What's the difference between CPU-bound and I/O-bound operations?**
   - CPU-bound: Computation-intensive (use parallel streams, thread pools)
   - I/O-bound: Waiting for I/O (use async/await, NIO)

3. **Q: How do you optimize a CPU-intensive algorithm?**
   - Profile first (don't guess)
   - Use appropriate data structures
   - Consider parallel processing
   - Cache expensive computations

---

### Q3: Application threads are deadlocked. How do you detect and resolve it?

**Scenario:**
Application becomes unresponsive. Threads appear to be waiting indefinitely. Users report timeouts.

**Step-by-Step Solution:**

#### Step 1: Detect Deadlock

```bash
# Thread dump will show deadlock
jstack <pid> | grep -A 10 "deadlock"

# Or use Java programmatically
ThreadMXBean threadBean = ManagementFactory.getThreadMXBean();
long[] deadlockedThreads = threadBean.findDeadlockedThreads();
if (deadlockedThreads != null) {
    ThreadInfo[] threadInfos = threadBean.getThreadInfo(deadlockedThreads);
    // Log deadlock details
}
```

**Thread Dump Analysis:**
```
Found one Java-level deadlock:
=============================
"Thread-1":
  waiting to lock monitor 0x00007f8b1c0001e8 (object 0x000000076ab62200)
  which is held by "Thread-2"
"Thread-2":
  waiting to lock monitor 0x00007f8b1c0001f8 (object 0x000000076ab62300)
  which is held by "Thread-1"
```

#### Step 2: Common Deadlock Patterns

**Pattern 1: Lock Ordering**
```java
// ❌ BAD: Different lock order causes deadlock
public class AccountService {
    public void transfer(Account from, Account to, double amount) {
        synchronized (from) {        // Thread 1: locks A, waits for B
            synchronized (to) {       // Thread 2: locks B, waits for A
                from.debit(amount);
                to.credit(amount);
            }
        }
    }
}

// ✅ GOOD: Consistent lock ordering
public class AccountService {
    public void transfer(Account from, Account to, double amount) {
        Account first = from.getId().compareTo(to.getId()) < 0 ? from : to;
        Account second = first == from ? to : from;
        
        synchronized (first) {
            synchronized (second) {
                from.debit(amount);
                to.credit(amount);
            }
        }
    }
}

// ✅ BETTER: Use ReentrantLock with tryLock
public class AccountService {
    private final ReentrantLock lock1 = new ReentrantLock();
    private final ReentrantLock lock2 = new ReentrantLock();
    
    public void transfer(Account from, Account to, double amount) {
        boolean lock1Acquired = false;
        boolean lock2Acquired = false;
        
        try {
            lock1Acquired = lock1.tryLock(100, TimeUnit.MILLISECONDS);
            lock2Acquired = lock2.tryLock(100, TimeUnit.MILLISECONDS);
            
            if (lock1Acquired && lock2Acquired) {
                from.debit(amount);
                to.credit(amount);
            } else {
                throw new IllegalStateException("Could not acquire locks");
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            if (lock2Acquired) lock2.unlock();
            if (lock1Acquired) lock1.unlock();
        }
    }
}
```

**Pattern 2: Nested Synchronization**
```java
// ❌ BAD: Calling synchronized method while holding lock
public class OrderService {
    public synchronized void processOrder(Order order) {
        // ... processing
        inventoryService.updateInventory(order); // May acquire another lock
    }
}

public class InventoryService {
    public synchronized void updateInventory(Order order) {
        // ... updates
        orderService.notifyCompletion(order); // Deadlock risk!
    }
}

// ✅ GOOD: Avoid nested synchronization, use timeout
public class OrderService {
    private final Lock lock = new ReentrantLock();
    
    public void processOrder(Order order) {
        try {
            if (lock.tryLock(5, TimeUnit.SECONDS)) {
                try {
                    inventoryService.updateInventory(order);
                } finally {
                    lock.unlock();
                }
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
```

**Pattern 3: Database Deadlocks**
```java
// ❌ BAD: Multiple updates in wrong order
@Transactional
public void updateOrder(Order order) {
    orderRepository.save(order);           // Locks order row
    orderItemRepository.saveAll(order.getItems()); // May deadlock
}

// ✅ GOOD: Consistent update order, shorter transactions
@Transactional
public void updateOrder(Order order) {
    // Update in consistent order (e.g., by ID)
    List<OrderItem> sortedItems = order.getItems().stream()
        .sorted(Comparator.comparing(OrderItem::getId))
        .collect(Collectors.toList());
    
    orderItemRepository.saveAll(sortedItems);
    orderRepository.save(order);
}

// ✅ BETTER: Use optimistic locking
@Entity
public class Order {
    @Version
    private Long version; // Optimistic lock
    
    // ...
}
```

#### Step 3: Prevention Strategies

**1. Use Concurrent Collections**
```java
// ✅ GOOD: Thread-safe collections
private final ConcurrentHashMap<String, Order> cache = new ConcurrentHashMap<>();
private final BlockingQueue<Order> queue = new LinkedBlockingQueue<>();
```

**2. Use ReadWriteLock for Read-Heavy Operations**
```java
public class OrderCache {
    private final ReadWriteLock lock = new ReentrantReadWriteLock();
    private final Map<String, Order> cache = new HashMap<>();
    
    public Order get(String id) {
        lock.readLock().lock();
        try {
            return cache.get(id);
        } finally {
            lock.readLock().unlock();
        }
    }
    
    public void put(String id, Order order) {
        lock.writeLock().lock();
        try {
            cache.put(id, order);
        } finally {
            lock.writeLock().unlock();
        }
    }
}
```

**3. Use Atomic Operations**
```java
// ✅ GOOD: Atomic operations avoid locks
private final AtomicInteger counter = new AtomicInteger(0);
private final AtomicReference<Order> latestOrder = new AtomicReference<>();
```

#### Step 4: Monitoring & Detection

```java
@Component
public class DeadlockDetector {
    private final ThreadMXBean threadBean = ManagementFactory.getThreadMXBean();
    
    @Scheduled(fixedRate = 5000)
    public void detectDeadlock() {
        long[] deadlockedThreads = threadBean.findDeadlockedThreads();
        if (deadlockedThreads != null) {
            ThreadInfo[] threadInfos = threadBean.getThreadInfo(deadlockedThreads);
            log.error("Deadlock detected! Threads: {}", 
                Arrays.toString(threadInfos));
            // Alert, send notification, etc.
        }
    }
}
```

**Follow-Up Questions:**

1. **Q: How do you prevent deadlocks in a distributed system?**
   - Use distributed locks (Redis, Zookeeper) with timeouts
   - Implement idempotency
   - Use saga pattern for distributed transactions
   - Avoid long-held locks across service boundaries

2. **Q: What's the difference between deadlock and livelock?**
   - Deadlock: Threads blocked waiting for each other
   - Livelock: Threads keep retrying but never make progress
   - Solution: Add randomization, backoff, or priority

3. **Q: How do you handle database deadlocks?**
   - Use shorter transactions
   - Retry with exponential backoff
   - Consistent lock ordering
   - Use optimistic locking where possible

---

## JVM & Memory Management

### Q4: How do you tune JVM garbage collection for a high-throughput application?

**Scenario:**
Your Spring Boot application processes millions of requests per day. You're experiencing GC pauses affecting response times. Need to optimize GC for both throughput and low latency.

**Step-by-Step Solution:**

#### Step 1: Understand Your Application Profile

**Key Metrics:**
- **Throughput**: Percentage of time spent in GC (target: < 5%)
- **Latency**: GC pause times (target: < 100ms for most apps)
- **Memory Footprint**: Heap size requirements

**Application Types:**
- **Throughput-focused**: Batch processing, analytics (can tolerate longer pauses)
- **Latency-focused**: Real-time systems, trading (need low pauses)
- **Balanced**: Web applications (need both)

#### Step 2: Choose Appropriate GC Algorithm

**For Java 8:**
```bash
# G1GC (Recommended for most applications)
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200
-XX:G1HeapRegionSize=16m
-XX:InitiatingHeapOccupancyPercent=45

# Parallel GC (Throughput-focused)
-XX:+UseParallelGC
-XX:ParallelGCThreads=4

# CMS (Deprecated, but still used)
-XX:+UseConcMarkSweepGC
-XX:CMSInitiatingOccupancyFraction=75
```

**For Java 11+:**
```bash
# ZGC (Ultra-low latency, large heaps)
-XX:+UseZGC
-XX:+UnlockExperimentalVMOptions

# Shenandoah (Low latency, concurrent)
-XX:+UseShenandoahGC
-XX:ShenandoahGCHeuristics=adaptive
```

#### Step 3: Configure Heap Sizes

```bash
# Set initial and max heap (should be equal for production)
-Xms4g -Xmx4g

# Young generation size (for Parallel/CMS)
-Xmn2g  # 50% of heap for young gen

# Metaspace (Java 8+)
-XX:MetaspaceSize=256m
-XX:MaxMetaspaceSize=256m

# Direct memory (for NIO)
-XX:MaxDirectMemorySize=1g
```

**Best Practices:**
- **Don't set heap too large** - GC pauses increase with heap size
- **Don't set heap too small** - Frequent GC, low throughput
- **Monitor and adjust** - Use GC logs to tune

#### Step 4: Enable GC Logging

```bash
# Java 8
-Xloggc:/var/log/gc.log
-XX:+PrintGCDetails
-XX:+PrintGCDateStamps
-XX:+UseGCLogFileRotation
-XX:NumberOfGCLogFiles=5
-XX:GCLogFileSize=10M

# Java 9+ (Unified logging)
-Xlog:gc*:file=/var/log/gc.log:time,tags:filecount=5,filesize=10M
```

#### Step 5: Analyze GC Logs

**Tools:**
- **GCViewer** - Visualize GC logs
- **GCPlot** - Online GC log analyzer
- **jstat** - Real-time GC monitoring

```bash
# Real-time monitoring
jstat -gcutil <pid> 1000  # Every second

# Output:
#  S0     S1     E      O      M     CCS    YGC     YGCT    FGC    FGCT     GCT
#  0.00  50.00  25.00  75.00  95.00  90.00   100    2.500    5    1.200   3.700
```

**Key Metrics:**
- **YGC/YGCT**: Young GC count and time
- **FGC/FGCT**: Full GC count and time
- **O**: Old generation usage
- **GCT**: Total GC time

#### Step 6: Tune Based on Analysis

**If frequent Full GC:**
```bash
# Increase heap size
-Xmx8g

# Or tune G1GC
-XX:InitiatingHeapOccupancyPercent=40  # Start earlier
-XX:MaxGCPauseMillis=100  # More aggressive
```

**If long GC pauses:**
```bash
# Use G1GC with lower pause target
-XX:+UseG1GC
-XX:MaxGCPauseMillis=50

# Or switch to ZGC/Shenandoah (Java 11+)
-XX:+UseZGC
```

**If high GC overhead:**
```bash
# Reduce object allocation rate
# Review code for unnecessary object creation

# Tune young generation
-XX:NewRatio=2  # Young:Old = 1:2
```

#### Step 7: Code-Level Optimizations

```java
// ❌ BAD: Excessive object allocation
public List<String> processOrders(List<Order> orders) {
    List<String> results = new ArrayList<>();
    for (Order order : orders) {
        String result = "Order: " + order.getId() + 
                       " Total: " + order.getTotal() + 
                       " Date: " + order.getDate(); // String concatenation
        results.add(result);
    }
    return results;
}

// ✅ GOOD: Reduce allocations
public List<String> processOrders(List<Order> orders) {
    return orders.stream()
        .map(order -> String.format("Order: %s Total: %.2f Date: %s",
            order.getId(), order.getTotal(), order.getDate()))
        .collect(Collectors.toList());
}

// ✅ BETTER: Reuse objects, use StringBuilder for loops
public void processOrders(List<Order> orders) {
    StringBuilder sb = new StringBuilder(100); // Pre-sized
    for (Order order : orders) {
        sb.setLength(0); // Reuse
        sb.append("Order: ").append(order.getId());
        // Process...
    }
}
```

**Follow-Up Questions:**

1. **Q: How do you choose between G1GC, ZGC, and Shenandoah?**
   - **G1GC**: Balanced, Java 8+, heap < 32GB
   - **ZGC**: Ultra-low latency, Java 11+, large heaps (8GB+)
   - **Shenandoah**: Low latency, Java 11+, concurrent

2. **Q: What causes Full GC and how to minimize it?**
   - Causes: Old generation full, metaspace full, System.gc() calls
   - Minimize: Tune heap size, avoid System.gc(), use appropriate GC

3. **Q: How do you monitor GC in production?**
   - Enable GC logging
   - Use Micrometer + Prometheus
   - Set up alerts for GC pause times
   - Regular GC log analysis

---

### Q5: Your application has memory leaks in production. How do you identify the root cause?

**Scenario:**
Application memory usage grows continuously over days/weeks. Eventually causes OOM. Restart temporarily fixes it, but the pattern repeats.

**Step-by-Step Solution:**

#### Step 1: Confirm Memory Leak

```bash
# Monitor heap over time
jmap -histo:live <pid> | head -20  # Top objects

# Compare snapshots over time
# If same objects keep growing, it's a leak
```

#### Step 2: Generate and Analyze Heap Dump

```bash
# Generate heap dump
jmap -dump:live,format=b,file=heap.hprof <pid>

# Or use JVM flag for auto-dump on OOM
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=/var/dumps
```

**Analysis with Eclipse MAT:**

1. **Leak Suspects Report** - Shows likely leaks
2. **Histogram** - Object counts and sizes
3. **Dominator Tree** - Objects retaining memory
4. **Path to GC Roots** - Why objects aren't collected

#### Step 3: Common Memory Leak Patterns

**Pattern 1: Unclosed Resources**
```java
// ❌ BAD: Connection leak
public List<Order> getOrders() {
    Connection conn = dataSource.getConnection();
    // ... use connection
    // Never closed! Leak!
    return orders;
}

// ✅ GOOD: Use try-with-resources
public List<Order> getOrders() {
    try (Connection conn = dataSource.getConnection();
         PreparedStatement stmt = conn.prepareStatement("SELECT * FROM orders");
         ResultSet rs = stmt.executeQuery()) {
        // ... process
        return orders;
    } // Auto-closed
}
```

**Pattern 2: Listeners Not Removed**
```java
// ❌ BAD: Listener leak
public class OrderService {
    private List<OrderListener> listeners = new ArrayList<>();
    
    public void addListener(OrderListener listener) {
        listeners.add(listener); // Never removed!
    }
}

// ✅ GOOD: Use WeakReference or proper cleanup
public class OrderService {
    private final List<WeakReference<OrderListener>> listeners = new ArrayList<>();
    
    public void addListener(OrderListener listener) {
        listeners.add(new WeakReference<>(listener));
    }
    
    @PreDestroy
    public void cleanup() {
        listeners.clear();
    }
}
```

**Pattern 3: ThreadLocal Not Cleared**
```java
// ❌ BAD: ThreadLocal leak (especially with thread pools)
public class UserContext {
    private static ThreadLocal<User> user = new ThreadLocal<>();
    
    public static void setUser(User u) {
        user.set(u); // Never removed!
    }
}

// ✅ GOOD: Always remove
public class UserContext {
    private static ThreadLocal<User> user = new ThreadLocal<>();
    
    public static void setUser(User u) {
        user.set(u);
    }
    
    public static void clear() {
        user.remove(); // Important!
    }
}

// In Spring, use RequestContextHolder or @RequestScope
```

**Pattern 4: Static Collections**
```java
// ❌ BAD: Static map growing indefinitely
public class Cache {
    private static Map<String, Object> cache = new HashMap<>();
    
    public void put(String key, Object value) {
        cache.put(key, value); // Never evicted!
    }
}

// ✅ GOOD: Use proper cache with eviction
@Cacheable(value = "cache", key = "#key")
public Object get(String key) {
    return expensiveOperation();
}

// Or manual with size limit
private static final int MAX_SIZE = 1000;
private static Map<String, Object> cache = new LinkedHashMap<String, Object>() {
    @Override
    protected boolean removeEldestEntry(Map.Entry eldest) {
        return size() > MAX_SIZE;
    }
};
```

**Pattern 5: Inner Classes Holding Outer Reference**
```java
// ❌ BAD: Inner class holds reference to outer
public class OrderProcessor {
    private List<Order> orders = new ArrayList<>(); // Large list
    
    public void process() {
        ExecutorService executor = Executors.newFixedThreadPool(10);
        for (Order order : orders) {
            executor.submit(new Runnable() { // Inner class!
                @Override
                public void run() {
                    processOrder(order); // Holds reference to OrderProcessor
                }
            });
        }
    }
}

// ✅ GOOD: Use static nested class or lambda
public class OrderProcessor {
    public void process() {
        ExecutorService executor = Executors.newFixedThreadPool(10);
        for (Order order : orders) {
            final Order orderCopy = order; // Copy reference
            executor.submit(() -> processOrder(orderCopy));
        }
    }
}
```

#### Step 4: Use Memory Profiling Tools

**JProfiler / YourKit:**
- Allocation recording
- Object lifecycle tracking
- Memory leak detection

**Java Flight Recorder (JFR):**
```bash
# Enable JFR
-XX:+FlightRecorder
-XX:StartFlightRecording=duration=60s,filename=recording.jfr

# Analyze with JDK Mission Control
```

#### Step 5: Prevention Strategies

```java
// Use @PreDestroy for cleanup
@Component
public class OrderCache {
    private final Map<String, Order> cache = new ConcurrentHashMap<>();
    
    @PreDestroy
    public void cleanup() {
        cache.clear();
        // Close connections, remove listeners, etc.
    }
}

// Use WeakHashMap for caches
private final Map<String, WeakReference<Order>> cache = new WeakHashMap<>();

// Monitor memory usage
@Component
public class MemoryMonitor {
    @Scheduled(fixedRate = 60000)
    public void monitorMemory() {
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
        MemoryUsage heapUsage = memoryBean.getHeapMemoryUsage();
        double usagePercent = (double) heapUsage.getUsed() / heapUsage.getMax() * 100;
        
        if (usagePercent > 80) {
            log.warn("High memory usage: {}%", usagePercent);
        }
    }
}
```

**Follow-Up Questions:**

1. **Q: How do you detect memory leaks in a microservices architecture?**
   - Monitor each service independently
   - Use distributed tracing
   - Set up alerts for memory growth trends
   - Regular heap dump analysis

2. **Q: What's the difference between a memory leak and memory bloat?**
   - **Leak**: Objects that should be GC'd but aren't (grows indefinitely)
   - **Bloat**: Legitimate objects but too many (can be optimized)
   - Both cause OOM, but solutions differ

3. **Q: How do you handle memory leaks in third-party libraries?**
   - Report to library maintainers
   - Use workarounds (wrappers, proxies)
   - Consider alternatives
   - Monitor and restart if necessary

---

*Continue to Part 2 for Spring Boot, Concurrency, and Enterprise Patterns...*
