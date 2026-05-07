# Senior Java Developer Interview Questions - Part 2
## Multithreading & Concurrency (Advanced)

> **Senior Technical Architect's Guide for Interviewing 8-18 Years Experience**
> *Deep Technical Scenarios for High-Throughput, Low-Latency Systems*

---

## Table of Contents

1. [Thread Lifecycle & Memory Visibility](#thread-lifecycle--memory-visibility)
2. [Synchronization & Locks](#synchronization--locks)
3. [Thread Pools & Executors](#thread-pools--executors)
4. [Lock-Free Programming](#lock-free-programming)
5. [Advanced Concurrency Patterns](#advanced-concurrency-patterns)

---

## Thread Lifecycle & Memory Visibility

### Q5: Happens-Before Relationship - Stale Data in Multi-Threaded Cache

**Scenario:**
A high-performance caching system uses a `ConcurrentHashMap` for thread-safe operations, but still experiences stale data reads. The cache implementation has a `get()` method that reads a value, and a `put()` method that updates it. Under high concurrency, some threads see old values even after `put()` completes. The code doesn't use `volatile` or `synchronized`, relying only on `ConcurrentHashMap`'s thread-safety.

**Question:**
Explain the happens-before relationship, why `ConcurrentHashMap` alone doesn't guarantee visibility of values written by other threads in this scenario, and how to fix it. Include memory barrier concepts and JMM (Java Memory Model) implications.

**Step-by-Step Answer:**

#### Root Cause Analysis

**The Problem:**
```java
// ❌ BAD: Stale data despite ConcurrentHashMap
public class Cache {
    private final ConcurrentHashMap<String, Value> map = new ConcurrentHashMap<>();
    private Value lastValue; // Not thread-safe!
    
    public Value get(String key) {
        Value value = map.get(key); // Thread-safe read
        lastValue = value; // Race condition!
        return value;
    }
    
    public void put(String key, Value value) {
        map.put(key, value); // Thread-safe write
        // But other threads may not see this immediately
    }
    
    public Value getLastValue() {
        return lastValue; // May return stale value!
    }
}
```

**Why This Happens:**
- `ConcurrentHashMap` guarantees thread-safety for map operations
- But doesn't create happens-before relationship for external variables
- CPU caches may hold stale values
- Compiler optimizations may reorder instructions

#### Happens-Before Relationship

**Definition:**
- If action A happens-before action B, then A's results are visible to B
- Establishes ordering and visibility guarantees

**Happens-Before Rules:**
1. **Program Order**: Actions in same thread happen in order
2. **Monitor Lock**: Unlock happens-before subsequent lock
3. **Volatile**: Write happens-before subsequent read
4. **Thread Start**: `Thread.start()` happens-before thread's actions
5. **Thread Join**: Thread termination happens-before `join()` returns
6. **Transitivity**: If A hb B and B hb C, then A hb C

#### Memory Visibility Problem

**Without Happens-Before:**
```java
// Thread 1
map.put("key", newValue);  // Write to ConcurrentHashMap
flag = true;               // Write to regular variable
// No happens-before relationship!

// Thread 2
if (flag) {                // May see stale value (false)
    Value v = map.get("key"); // May see stale value
}
```

**CPU Cache Coherency:**
```
CPU 1 Cache          Main Memory          CPU 2 Cache
[flag=true]    →     [flag=?]      ←     [flag=false] (stale)
```

**Memory Barriers:**
- **Load Barrier**: Ensures loads complete before subsequent loads
- **Store Barrier**: Ensures stores complete before subsequent stores
- **Full Barrier**: Both load and store barriers

#### Fix: Proper Synchronization

**Solution 1: Use Volatile**
```java
// ✅ GOOD: Volatile creates happens-before
public class Cache {
    private final ConcurrentHashMap<String, Value> map = new ConcurrentHashMap<>();
    private volatile Value lastValue; // Volatile ensures visibility
    
    public Value get(String key) {
        Value value = map.get(key);
        lastValue = value; // Write to volatile
        return value;
    }
    
    public Value getLastValue() {
        return lastValue; // Read from volatile - sees latest value
    }
}
```

**Solution 2: Synchronized Blocks**
```java
// ✅ GOOD: Synchronized creates happens-before
public class Cache {
    private final ConcurrentHashMap<String, Value> map = new ConcurrentHashMap<>();
    private Value lastValue;
    private final Object lock = new Object();
    
    public Value get(String key) {
        Value value = map.get(key);
        synchronized (lock) {
            lastValue = value; // Synchronized write
        }
        return value;
    }
    
    public Value getLastValue() {
        synchronized (lock) {
            return lastValue; // Synchronized read - sees latest value
        }
    }
}
```

**Solution 3: AtomicReference**
```java
// ✅ GOOD: Atomic operations have happens-before
public class Cache {
    private final ConcurrentHashMap<String, Value> map = new ConcurrentHashMap<>();
    private final AtomicReference<Value> lastValue = new AtomicReference<>();
    
    public Value get(String key) {
        Value value = map.get(key);
        lastValue.set(value); // Atomic write - creates happens-before
        return value;
    }
    
    public Value getLastValue() {
        return lastValue.get(); // Atomic read - sees latest value
    }
}
```

#### Deep Technical: JMM and Memory Barriers

**Java Memory Model:**
- Defines when writes are visible to reads
- Allows optimizations while maintaining correctness
- Happens-before is the core concept

**Volatile Semantics:**
```java
volatile int x = 0;
volatile int y = 0;

// Thread 1
x = 1;  // Store barrier inserted
y = 2;  // Store barrier inserted

// Thread 2
int a = y; // Load barrier inserted
int b = x; // Load barrier inserted
// If a == 2, then b == 1 (happens-before guarantee)
```

**Synchronized Semantics:**
```java
synchronized (lock) {
    x = 1;  // Full barrier on entry
}           // Full barrier on exit

synchronized (lock) {
    int a = x; // Full barrier on entry
}              // Full barrier on exit
```

#### ConcurrentHashMap and Visibility

**ConcurrentHashMap Guarantees:**
- Operations on the map itself are thread-safe
- `get()` sees updates from `put()` (happens-before within map)
- But doesn't create happens-before for external variables

**Internal Implementation:**
```java
// ConcurrentHashMap.get() - simplified
public V get(Object key) {
    Node<K,V>[] tab; Node<K,V> e, p; int n, eh; K ek;
    int h = spread(key.hashCode());
    if ((tab = table) != null && (n = tab.length) > 0 &&
        (e = tabAt(tab, (n - 1) & h)) != null) {
        // Uses volatile read (tabAt uses Unsafe.getObjectVolatile)
        // Creates happens-before for map operations only
    }
}
```

#### Follow-Up Questions

1. **Q: Why doesn't ConcurrentHashMap guarantee visibility for external variables?**
   - Only guarantees happens-before for its own operations
   - External variables need separate synchronization
   - This is by design for performance

2. **Q: What's the difference between volatile and synchronized for visibility?**
   - **Volatile**: Only visibility, no mutual exclusion
   - **Synchronized**: Both visibility and mutual exclusion
   - Volatile is lighter but limited

3. **Q: Can you have a race condition with volatile?**
   - Yes, for compound operations (read-modify-write)
   - Volatile ensures visibility, not atomicity
   - Use Atomic classes for atomic operations

---

### Q6: Deadlock Detection in Production - Order Processing System

**Scenario:**
A distributed order processing system experiences deadlocks during peak traffic. Thread dumps show threads blocked waiting for locks. The system processes orders that require inventory reservation and payment processing. Deadlocks occur when multiple orders are processed concurrently, and threads acquire locks in different orders.

**Question:**
Explain how to detect deadlocks programmatically, analyze thread dumps, identify the root cause, and provide a production-ready solution that prevents deadlocks while maintaining performance.

**Step-by-Step Answer:**

#### Deadlock Detection

**Programmatic Detection:**
```java
// ✅ GOOD: Deadlock detection utility
public class DeadlockDetector {
    private final ThreadMXBean threadBean = ManagementFactory.getThreadMXBean();
    
    public void detectDeadlock() {
        long[] deadlockedThreads = threadBean.findDeadlockedThreads();
        if (deadlockedThreads != null) {
            ThreadInfo[] threadInfos = threadBean.getThreadInfo(deadlockedThreads);
            
            System.err.println("Deadlock detected!");
            for (ThreadInfo threadInfo : threadInfos) {
                System.err.println("Thread: " + threadInfo.getThreadName());
                System.err.println("Lock: " + threadInfo.getLockInfo());
                System.err.println("Blocked by: " + threadInfo.getLockOwnerName());
                System.err.println("Stack trace:");
                for (StackTraceElement element : threadInfo.getStackTrace()) {
                    System.err.println("  " + element);
                }
            }
        }
    }
    
    @Scheduled(fixedRate = 5000)
    public void monitorDeadlocks() {
        detectDeadlock();
    }
}
```

**Thread Dump Analysis:**
```bash
# Generate thread dump
jstack <pid> > thread-dump.txt

# Look for deadlock
jstack <pid> | grep -A 10 "deadlock"
```

**Thread Dump Example:**
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

#### Root Cause Analysis

**The Deadlock:**
```java
// ❌ BAD: Different lock order causes deadlock
public class OrderService {
    private final Object inventoryLock = new Object();
    private final Object paymentLock = new Object();
    
    public void processOrder(Order order) {
        // Thread 1: Locks inventory, then payment
        synchronized (inventoryLock) {
            reserveInventory(order);
            synchronized (paymentLock) {
                processPayment(order);
            }
        }
    }
}

public class PaymentService {
    private final Object inventoryLock; // Same lock
    private final Object paymentLock;   // Same lock
    
    public void refund(Order order) {
        // Thread 2: Locks payment, then inventory (DIFFERENT ORDER!)
        synchronized (paymentLock) {
            processRefund(order);
            synchronized (inventoryLock) {
                releaseInventory(order);
            }
        }
    }
}
```

**Deadlock Scenario:**
```
Time    Thread 1                    Thread 2
----    --------                    --------
T1      Lock inventoryLock          -
T2      -                          Lock paymentLock
T3      Wait for paymentLock       Wait for inventoryLock
T4      DEADLOCK!                  DEADLOCK!
```

#### Solution: Consistent Lock Ordering

**Solution 1: Global Lock Ordering**
```java
// ✅ GOOD: Consistent lock order
public class LockOrdering {
    // Define global lock order
    private static final int INVENTORY_LOCK_ORDER = 1;
    private static final int PAYMENT_LOCK_ORDER = 2;
    
    public static void acquireLocks(Object lock1, Object lock2) {
        // Always acquire in order
        if (getLockOrder(lock1) > getLockOrder(lock2)) {
            Object temp = lock1;
            lock1 = lock2;
            lock2 = temp;
        }
        
        synchronized (lock1) {
            synchronized (lock2) {
                // Critical section
            }
        }
    }
}
```

**Solution 2: ReentrantLock with tryLock**
```java
// ✅ GOOD: Timeout prevents indefinite blocking
public class OrderService {
    private final ReentrantLock inventoryLock = new ReentrantLock();
    private final ReentrantLock paymentLock = new ReentrantLock();
    
    public void processOrder(Order order) {
        boolean inventoryLocked = false;
        boolean paymentLocked = false;
        
        try {
            // Try to acquire locks with timeout
            inventoryLocked = inventoryLock.tryLock(100, TimeUnit.MILLISECONDS);
            if (!inventoryLocked) {
                throw new LockAcquisitionException("Could not acquire inventory lock");
            }
            
            reserveInventory(order);
            
            paymentLocked = paymentLock.tryLock(100, TimeUnit.MILLISECONDS);
            if (!paymentLocked) {
                throw new LockAcquisitionException("Could not acquire payment lock");
            }
            
            processPayment(order);
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new LockAcquisitionException("Interrupted", e);
        } finally {
            if (paymentLocked) paymentLock.unlock();
            if (inventoryLocked) inventoryLock.unlock();
        }
    }
}
```

**Solution 3: Single Lock (Simplest)**
```java
// ✅ GOOD: Single lock eliminates deadlock risk
public class OrderService {
    private final Object orderLock = new Object();
    
    public void processOrder(Order order) {
        synchronized (orderLock) {
            reserveInventory(order);
            processPayment(order);
        }
    }
}
// Trade-off: Lower concurrency, but no deadlock risk
```

**Solution 4: Lock-Free Design**
```java
// ✅ BEST: Lock-free using atomic operations
public class OrderService {
    private final ConcurrentHashMap<String, Order> orders = new ConcurrentHashMap<>();
    
    public void processOrder(Order order) {
        orders.compute(order.getId(), (id, existing) -> {
            if (existing == null) {
                reserveInventory(order);
                processPayment(order);
                return order;
            }
            return existing;
        });
    }
}
```

#### Production Monitoring

```java
@Component
public class DeadlockMonitor {
    private final ThreadMXBean threadBean = ManagementFactory.getThreadMXBean();
    
    @Scheduled(fixedRate = 10000)
    public void checkDeadlocks() {
        long[] deadlockedThreads = threadBean.findDeadlockedThreads();
        if (deadlockedThreads != null) {
            ThreadInfo[] threadInfos = threadBean.getThreadInfo(deadlockedThreads);
            
            // Log deadlock
            log.error("Deadlock detected! Threads: {}", 
                Arrays.stream(threadInfos)
                    .map(ThreadInfo::getThreadName)
                    .collect(Collectors.toList()));
            
            // Alert
            alertService.sendAlert("Deadlock detected in production");
            
            // Optionally: Take thread dump
            generateThreadDump();
        }
    }
}
```

#### Follow-Up Questions

1. **Q: How do you prevent deadlocks in a distributed system?**
   - Use distributed locks with timeouts (Redis, Zookeeper)
   - Implement idempotency
   - Use saga pattern for distributed transactions
   - Avoid long-held locks across service boundaries

2. **Q: What's the difference between deadlock and livelock?**
   - **Deadlock**: Threads blocked waiting (no progress)
   - **Livelock**: Threads keep retrying but never succeed
   - Solution: Add randomization, backoff, or priority

3. **Q: Can you have a deadlock with a single lock?**
   - No, deadlock requires at least 2 locks
   - But can have contention and blocking
   - Use lock-free algorithms for high concurrency

---

## Synchronization & Locks

### Q7: Volatile vs Synchronized - Performance-Critical Counter

**Scenario:**
A high-frequency trading system needs a thread-safe counter that's read millions of times per second. The current implementation uses `synchronized` methods, but performance profiling shows this is a bottleneck. The team considers using `volatile` but is concerned about correctness.

**Question:**
Explain when to use `volatile` vs `synchronized`, the performance implications, and design a thread-safe counter that meets both correctness and performance requirements. Include discussion of false sharing and cache line optimization.

**Step-by-Step Answer:**

#### Volatile vs Synchronized

**Volatile:**
- **Visibility**: Ensures writes are visible to all threads
- **No Atomicity**: Doesn't prevent race conditions for compound operations
- **Performance**: Very fast (no locking overhead)
- **Use Case**: Single variable, read-heavy, write-rarely

**Synchronized:**
- **Visibility**: Ensures writes are visible
- **Atomicity**: Prevents race conditions
- **Mutual Exclusion**: Only one thread at a time
- **Performance**: Slower (locking overhead, potential blocking)
- **Use Case**: Compound operations, critical sections

#### The Problem

```java
// ❌ BAD: Synchronized is too slow for high-frequency reads
public class Counter {
    private long count = 0;
    
    public synchronized void increment() {
        count++; // Slow - acquires lock every time
    }
    
    public synchronized long get() {
        return count; // Slow - acquires lock every time
    }
}
```

**Performance Issues:**
- Lock contention under high concurrency
- Context switching overhead
- Cache invalidation
- False sharing (if multiple counters)

#### Solution: AtomicLong

```java
// ✅ GOOD: Lock-free using CAS
public class Counter {
    private final AtomicLong count = new AtomicLong(0);
    
    public void increment() {
        count.incrementAndGet(); // Lock-free, CAS-based
    }
    
    public long get() {
        return count.get(); // Lock-free read
    }
}
```

**How AtomicLong Works:**
```java
// Simplified AtomicLong.incrementAndGet()
public final long incrementAndGet() {
    return unsafe.getAndAddLong(this, valueOffset, 1L) + 1L;
}

// CAS (Compare-And-Swap) operation
// 1. Read current value
// 2. Calculate new value
// 3. Compare current with expected (atomic)
// 4. If match, update; else retry
```

**Performance Comparison:**
- **Synchronized**: ~100ns per operation (with contention: much worse)
- **AtomicLong**: ~10-20ns per operation (CAS is fast)
- **Volatile read**: ~1-2ns (fastest, but no atomicity)

#### Advanced: False Sharing Prevention

**False Sharing Problem:**
```java
// ❌ BAD: False sharing
public class Counter {
    private volatile long count1 = 0; // Same cache line
    private volatile long count2 = 0; // Same cache line
    // When count1 is written, count2's cache line is invalidated!
}
```

**Cache Line:**
- Modern CPUs: 64 bytes per cache line
- Multiple variables in same cache line = false sharing
- One write invalidates entire cache line

**Solution: Padding**
```java
// ✅ GOOD: Prevent false sharing
public class Counter {
    private volatile long count1 = 0;
    private long p1, p2, p3, p4, p5, p6, p7; // Padding (56 bytes)
    private volatile long count2 = 0;
    // count1 and count2 are in different cache lines
}

// Or use @Contended (Java 8+)
@Contended
public class Counter {
    private volatile long count1 = 0;
    private volatile long count2 = 0;
    // JVM adds padding automatically
}
```

#### High-Performance Counter Design

```java
// ✅ BEST: Striped counter for high concurrency
public class StripedCounter {
    private static final int STRIPE_COUNT = Runtime.getRuntime().availableProcessors();
    private final AtomicLong[] counters = new AtomicLong[STRIPE_COUNT];
    
    public StripedCounter() {
        for (int i = 0; i < STRIPE_COUNT; i++) {
            counters[i] = new AtomicLong(0);
        }
    }
    
    public void increment() {
        int index = Thread.currentThread().hashCode() % STRIPE_COUNT;
        counters[index].incrementAndGet();
    }
    
    public long get() {
        long sum = 0;
        for (AtomicLong counter : counters) {
            sum += counter.get();
        }
        return sum;
    }
}
```

**Why Striped:**
- Reduces contention by distributing across multiple counters
- Each thread updates different counter
- Final sum combines all counters
- Trade-off: Slightly inaccurate during concurrent updates

#### Follow-Up Questions

1. **Q: When would you use volatile over AtomicLong?**
   - Single writer, multiple readers
   - Write-once, read-many pattern
   - Performance-critical read path
   - Example: Configuration flags

2. **Q: What's the performance impact of false sharing?**
   - Can cause 10-100x slowdown
   - Cache line invalidation is expensive
   - Critical for high-frequency counters
   - Use padding or @Contended

3. **Q: How does CAS handle high contention?**
   - CAS retries on failure (spin loop)
   - Under high contention, many retries
   - May need exponential backoff
   - Consider lock-free data structures

---

*Continue to Part 3 for JVM Internals & Memory Management (Most Extensive Section)...*
