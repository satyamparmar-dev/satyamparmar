# Senior Java Developer Interview Questions - Part 3
## JVM Internals & Memory Management (Deep Senior-Level)

> **Senior Technical Architect's Guide for Interviewing 8-18 Years Experience**
> *Production-Grade JVM Knowledge for High-Throughput, Low-Latency Systems*

---

## Table of Contents

1. [JVM Architecture & Class Loading](#jvm-architecture--class-loading)
2. [Memory Areas Deep Dive](#memory-areas-deep-dive)
3. [Garbage Collection - Deep Technical](#garbage-collection---deep-technical)
4. [JVM Tuning & Performance Engineering](#jvm-tuning--performance-engineering)
5. [Production Debugging Scenarios](#production-debugging-scenarios)

---

## JVM Architecture & Class Loading

### Q8: Custom ClassLoader Memory Leak - Application Restart Required Every 3 Days

**Scenario:**
A Java application that dynamically loads plugins using a custom ClassLoader experiences memory growth over time. After 3 days of running, the application requires a restart due to Metaspace exhaustion. The application loads and unloads plugins frequently, but memory is never released. Thread dumps show multiple ClassLoader instances that should have been garbage collected.

**Question:**
Explain the ClassLoader hierarchy, why custom ClassLoaders cause memory leaks, how to properly implement a ClassLoader that allows classes to be unloaded, and how to diagnose ClassLoader leaks in production.

**Step-by-Step Answer:**

#### ClassLoader Hierarchy

**Bootstrap ClassLoader:**
- Loads core Java classes (`java.lang.*`, `java.util.*`)
- Written in native code (C++)
- Parent of all ClassLoaders
- Not a Java object (no parent)

**Extension ClassLoader:**
- Loads from `jre/lib/ext`
- Parent: Bootstrap ClassLoader
- Rarely used in modern Java

**Application/System ClassLoader:**
- Loads from classpath
- Parent: Extension ClassLoader
- Default for most applications

**Custom ClassLoader:**
- User-defined loading logic
- Parent: Application ClassLoader (typically)
- Used for: plugins, hot deployment, OSGi

#### The Memory Leak

**Problematic Implementation:**
```java
// ❌ BAD: ClassLoader leak
public class PluginClassLoader extends ClassLoader {
    private final Map<String, Class<?>> loadedClasses = new HashMap<>();
    private final URL[] urls;
    
    public PluginClassLoader(URL[] urls, ClassLoader parent) {
        super(parent);
        this.urls = urls;
    }
    
    @Override
    protected Class<?> findClass(String name) throws ClassNotFoundException {
        // Cache classes - prevents GC!
        Class<?> clazz = loadedClasses.get(name);
        if (clazz != null) {
            return clazz;
        }
        
        // Load class
        clazz = defineClass(name, classBytes, 0, classBytes.length);
        loadedClasses.put(name, clazz); // Strong reference - never GC'd!
        return clazz;
    }
}

// Usage
PluginClassLoader loader = new PluginClassLoader(urls, parent);
Class<?> pluginClass = loader.loadClass("com.example.Plugin");
// loader goes out of scope, but classes can't be GC'd!
```

**Why Classes Can't Be Unloaded:**
1. **ClassLoader Reference**: Classes hold reference to their ClassLoader
2. **Static References**: Static fields in classes hold references
3. **Thread References**: Threads may hold references to classes
4. **Reflection**: Reflection caches may hold references

#### Proper ClassLoader Implementation

**Solution: WeakReference Cache:**
```java
// ✅ GOOD: Weak references allow GC
public class UnloadableClassLoader extends ClassLoader {
    private final Map<String, WeakReference<Class<?>>> loadedClasses = new WeakHashMap<>();
    private final URL[] urls;
    
    public UnloadableClassLoader(URL[] urls, ClassLoader parent) {
        super(parent);
        this.urls = urls;
    }
    
    @Override
    protected Class<?> findClass(String name) throws ClassNotFoundException {
        WeakReference<Class<?>> ref = loadedClasses.get(name);
        Class<?> clazz = ref != null ? ref.get() : null;
        
        if (clazz != null) {
            return clazz;
        }
        
        // Load class
        byte[] classBytes = loadClassBytes(name);
        clazz = defineClass(name, classBytes, 0, classBytes.length);
        loadedClasses.put(name, new WeakReference<>(clazz));
        return clazz;
    }
    
    // Allow explicit cleanup
    public void unload() {
        loadedClasses.clear();
        // Classes will be GC'd when no strong references exist
    }
}
```

**Solution: Isolated ClassLoader with Lifecycle:**
```java
// ✅ GOOD: Proper lifecycle management
public class IsolatedPluginClassLoader extends URLClassLoader {
    private final String pluginId;
    private final Set<Class<?>> loadedClasses = ConcurrentHashMap.newKeySet();
    
    public IsolatedPluginClassLoader(String pluginId, URL[] urls, ClassLoader parent) {
        super(urls, parent);
        this.pluginId = pluginId;
    }
    
    @Override
    protected Class<?> findClass(String name) throws ClassNotFoundException {
        Class<?> clazz = super.findClass(name);
        loadedClasses.add(clazz);
        return clazz;
    }
    
    public void unload() {
        // Clear static caches in loaded classes
        for (Class<?> clazz : loadedClasses) {
            clearStaticFields(clazz);
        }
        loadedClasses.clear();
    }
    
    private void clearStaticFields(Class<?> clazz) {
        // Use reflection to clear static fields
        // This is complex and risky - better to design classes for unloading
    }
}
```

#### Class Unloading Conditions

**Classes Can Be Unloaded When:**
1. **No Instances**: No instances of the class exist
2. **ClassLoader Unreachable**: ClassLoader is unreachable
3. **No Static References**: No static fields holding references
4. **No Reflection References**: Reflection caches cleared
5. **No Thread References**: No threads holding class references

**Metaspace Cleanup:**
- Classes are stored in Metaspace (Java 8+)
- Metaspace is garbage collected
- Full GC may unload classes
- But only if all conditions met

#### Diagnosing ClassLoader Leaks

**Tool: ClassLoader Analysis**
```java
public class ClassLoaderAnalyzer {
    public void analyzeClassLoaders() {
        // Get all ClassLoaders
        ThreadMXBean threadBean = ManagementFactory.getThreadMXBean();
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
        
        // Metaspace usage
        MemoryUsage metaspace = memoryBean.getMemoryPoolMXBeans().stream()
            .filter(pool -> pool.getName().contains("Metaspace"))
            .findFirst()
            .map(MemoryPoolMXBean::getUsage)
            .orElse(null);
        
        System.out.println("Metaspace used: " + metaspace.getUsed());
        System.out.println("Metaspace max: " + metaspace.getMax());
        
        // Count ClassLoaders
        long classLoaderCount = ManagementFactory.getClassLoadingMXBean()
            .getLoadedClassCount();
        System.out.println("Loaded classes: " + classLoaderCount);
    }
}
```

**JVM Flags for Diagnosis:**
```bash
# Enable ClassLoader unloading logging
-XX:+TraceClassUnloading
-XX:+TraceClassLoading

# Metaspace settings
-XX:MetaspaceSize=256m
-XX:MaxMetaspaceSize=512m
-XX:+PrintGCDetails
-XX:+PrintGCDateStamps
```

**Heap Dump Analysis:**
- Use Eclipse MAT
- Look for ClassLoader instances
- Check references preventing GC
- Analyze class counts per ClassLoader

#### Best Practices

**1. Use Weak References:**
```java
// Cache with WeakHashMap
private final Map<String, WeakReference<Class<?>>> cache = new WeakHashMap<>();
```

**2. Clear Static Caches:**
```java
// Design classes for unloading
public class Plugin {
    private static final Map<String, Object> cache = new ConcurrentHashMap<>();
    
    public static void clearCache() {
        cache.clear(); // Allow explicit cleanup
    }
}
```

**3. Isolate Plugins:**
```java
// Use separate ClassLoader per plugin
PluginClassLoader pluginLoader = new PluginClassLoader(pluginUrls, parent);
// When plugin unloaded, entire ClassLoader can be GC'd
```

**4. Monitor Metaspace:**
```java
@Scheduled(fixedRate = 60000)
public void monitorMetaspace() {
    MemoryUsage metaspace = getMetaspaceUsage();
    double usagePercent = (double) metaspace.getUsed() / metaspace.getMax() * 100;
    
    if (usagePercent > 80) {
        log.warn("High Metaspace usage: {}%", usagePercent);
    }
}
```

#### Follow-Up Questions

1. **Q: Why can't classes be unloaded in the default ClassLoader?**
   - Application ClassLoader is system-wide
   - Classes are shared across application
   - Unloading would break running code
   - Only custom ClassLoaders can be unloaded

2. **Q: How does OSGi handle ClassLoader lifecycle?**
   - Each bundle has its own ClassLoader
   - Bundles can be started/stopped
   - ClassLoaders are GC'd when bundle stops
   - Uses service registry for communication

3. **Q: What's the difference between PermGen and Metaspace?**
   - **PermGen**: Fixed size, Java 7 and earlier
   - **Metaspace**: Native memory, grows as needed, Java 8+
   - Metaspace avoids OutOfMemoryError from fixed size

---

### Q9: JIT Compilation Impact - Slow Startup, Fast Runtime

**Scenario:**
A Java application takes 5 minutes to reach peak performance after startup. During this warm-up period, response times are 10x slower than after warm-up. The application uses many small methods that are called frequently. The team suspects JIT compilation is the cause but doesn't understand how to optimize it.

**Question:**
Explain JIT compilation phases (C1 vs C2), method inlining, escape analysis, and how to optimize warm-up time. Include discussion of JIT compilation thresholds and when methods get compiled.

**Step-by-Step Answer:**

#### JIT Compilation Overview

**Interpreted Execution:**
- Bytecode executed by interpreter
- Slow but starts immediately
- No compilation overhead

**JIT Compilation:**
- Frequently executed methods compiled to native code
- Faster execution after compilation
- Compilation overhead (warm-up time)

**Compilation Tiers:**
1. **Interpreter**: Initial execution
2. **C1 (Client Compiler)**: Fast compilation, basic optimizations
3. **C2 (Server Compiler)**: Slow compilation, aggressive optimizations

#### C1 vs C2 Compilers

**C1 Compiler (Client/Tier 1):**
- **Speed**: Fast compilation (~10ms)
- **Optimizations**: Basic (inlining, simple optimizations)
- **Use Case**: Quick warm-up, desktop applications
- **Threshold**: 1,500 invocations

**C2 Compiler (Server/Tier 4):**
- **Speed**: Slow compilation (~100ms+)
- **Optimizations**: Aggressive (inlining, escape analysis, loop optimizations)
- **Use Case**: Long-running servers, peak performance
- **Threshold**: 10,000 invocations

**Tiered Compilation:**
```bash
# Enable tiered compilation (default in Java 8+)
-XX:+TieredCompilation

# Compilation flow:
# Interpreter → C1 → C2
# Methods start in interpreter
# After 1,500 invocations: C1 compiled
# After 10,000 invocations: C2 compiled
```

#### Method Inlining

**What is Inlining:**
- Replace method call with method body
- Eliminates call overhead
- Enables further optimizations

**Example:**
```java
// Before inlining
public int calculate(int a, int b) {
    return add(a, b); // Method call overhead
}

private int add(int x, int y) {
    return x + y;
}

// After inlining (conceptual)
public int calculate(int a, int b) {
    return a + b; // Inlined, no call overhead
}
```

**Inlining Heuristics:**
- **Method Size**: Small methods more likely to inline
- **Call Frequency**: Hot methods more likely to inline
- **Call Site Count**: Methods called from few places more likely to inline

**Max Inline Size:**
```bash
# C1 max inline size
-XX:MaxInlineSize=35  # Default: 35 bytes

# C2 max inline size  
-XX:FreqInlineSize=325  # Default: 325 bytes

# Methods larger than this are rarely inlined
```

#### Escape Analysis

**What is Escape Analysis:**
- Determines if object "escapes" method scope
- If object doesn't escape, can be allocated on stack
- Eliminates heap allocation and GC pressure

**Example:**
```java
// Object escapes - must be on heap
public Point createPoint(int x, int y) {
    Point p = new Point(x, y);
    return p; // Escapes - returned to caller
}

// Object doesn't escape - can be on stack
public int calculateDistance(int x1, int y1, int x2, int y2) {
    Point p1 = new Point(x1, y1); // Doesn't escape
    Point p2 = new Point(x2, y2); // Doesn't escape
    return p1.distanceTo(p2);
    // p1 and p2 can be stack-allocated (scalar replacement)
}
```

**Scalar Replacement:**
- Object fields replaced with local variables
- No object allocation
- Significant performance improvement

**Enable Escape Analysis:**
```bash
# Enabled by default in C2
-XX:+DoEscapeAnalysis
-XX:+EliminateAllocations  # Scalar replacement
```

#### Compilation Thresholds

**Invocation Thresholds:**
```bash
# C1 compilation threshold
-XX:CompileThreshold=1500  # Default: 1500

# C2 compilation threshold (tiered)
-XX:Tier3InvocationThreshold=200
-XX:Tier3MinInvocationThreshold=100
-XX:Tier4InvocationThreshold=10000
```

**Backedge Threshold (Loops):**
```bash
# Loop compilation threshold
-XX:CompileThreshold=1500
-XX:OnStackReplacePercentage=140  # OSR threshold

# OSR (On-Stack Replacement):
# Compiles method while it's executing in a loop
```

#### Optimizing Warm-Up Time

**Solution 1: Reduce Compilation Threshold**
```bash
# Compile methods earlier
-XX:CompileThreshold=100  # Lower threshold

# Trade-off: More compilation overhead, faster warm-up
```

**Solution 2: Pre-compile Critical Methods**
```java
// Warm up critical methods
public void warmup() {
    for (int i = 0; i < 10000; i++) {
        criticalMethod(); // Force compilation
    }
}
```

**Solution 3: Use AOT (Ahead-of-Time) Compilation**
```bash
# Java 9+ experimental AOT
jaotc --output libHelloWorld.so HelloWorld.class

# Pre-compile to native code
# Eliminates JIT warm-up
```

**Solution 4: Profile-Guided Optimization**
```bash
# Collect profiling data
-XX:+UnlockDiagnosticVMOptions
-XX:+LogCompilation
-XX:LogFile=compilation.log

# Use profiling to optimize hot methods
```

#### Monitoring JIT Compilation

**JIT Compilation Logging:**
```bash
# Detailed compilation log
-XX:+UnlockDiagnosticVMOptions
-XX:+LogCompilation
-XX:LogFile=jit.log

# Print compilation
-XX:+PrintCompilation

# Output example:
#   1234   42       3       java.lang.String::hashCode (29 bytes)
#   ^      ^       ^       ^
#   time   id     level   method
```

**JITWatch Tool:**
- Analyzes JIT compilation logs
- Shows inlining decisions
- Identifies optimization opportunities
- Visualizes compilation timeline

#### Performance Impact

**Warm-Up Period:**
- **Cold Start**: 100% interpreted, slow
- **Warming Up**: Mix of interpreted and compiled, improving
- **Warmed Up**: Mostly compiled, fast

**Typical Timeline:**
```
Time    Performance
----    -----------
0s      Cold (100% interpreted)
30s     Warming (50% compiled)
2min    Mostly warm (80% compiled)
5min    Fully warm (95%+ compiled)
```

#### Follow-Up Questions

1. **Q: Why not compile everything at startup?**
   - Compilation is expensive
   - Many methods never executed
   - Would slow startup significantly
   - JIT compiles only hot methods

2. **Q: How does JIT decide what to optimize?**
   - Method invocation count
   - Loop backedge count
   - Profiling data (branch prediction)
   - Code complexity

3. **Q: What's the difference between C1 and C2 optimizations?**
   - **C1**: Fast, basic optimizations (inlining, dead code elimination)
   - **C2**: Slow, aggressive optimizations (escape analysis, loop unrolling, vectorization)

---

## Memory Areas Deep Dive

### Q10: TLAB (Thread Local Allocation Buffer) - High Allocation Rate Performance

**Scenario:**
A high-throughput message processing system creates millions of small objects per second. Performance profiling shows that object allocation is a bottleneck, with threads contending for heap space. The system uses multiple threads, and allocation contention is causing performance degradation.

**Question:**
Explain TLAB, how it reduces allocation contention, when TLAB overflow occurs, and how to tune TLAB for high-allocation workloads. Include discussion of object allocation flow and eden space organization.

**Step-by-Step Answer:**

#### TLAB Overview

**What is TLAB:**
- Thread-Local Allocation Buffer
- Each thread gets its own allocation buffer
- Reduces contention on shared heap
- Fast allocation (pointer bump)

**Allocation Flow:**
```
Thread 1: [TLAB] → Allocate object → Pointer bump
Thread 2: [TLAB] → Allocate object → Pointer bump
Thread 3: [TLAB] → Allocate object → Pointer bump
         ↓
    Shared Eden Space (when TLAB full)
```

#### TLAB Structure

**Eden Space Organization:**
```
Eden Space
├─ TLAB 1 (Thread 1) [████████░░] 80% used
├─ TLAB 2 (Thread 2) [████░░░░░░] 40% used
├─ TLAB 3 (Thread 3) [██████████] 100% - overflow!
└─ Shared Space (for large objects, TLAB overflow)
```

**TLAB Lifecycle:**
1. **Allocation**: Thread allocates from its TLAB (fast)
2. **Near Full**: TLAB approaches capacity
3. **Retirement**: TLAB retired, new TLAB allocated
4. **GC**: Old TLABs collected during minor GC

#### Object Allocation Flow

**Fast Path (TLAB Allocation):**
```java
// Object allocation in TLAB
Object obj = new MyObject();
// 1. Check TLAB has space (fast - local check)
// 2. Bump pointer (atomic, no lock)
// 3. Initialize object
// Total: ~10-20 CPU cycles
```

**Slow Path (TLAB Overflow):**
```java
// TLAB full, allocate in shared space
Object obj = new MyObject();
// 1. TLAB check fails
// 2. Allocate new TLAB (may need lock)
// 3. Or allocate directly in shared space (needs synchronization)
// Total: ~100-1000 CPU cycles (much slower)
```

#### TLAB Tuning

**TLAB Size:**
```bash
# Initial TLAB size
-XX:TLABSize=256k  # Default: calculated based on allocation rate

# Min TLAB size
-XX:MinTLABSize=2k

# Max TLAB waste (when to retire TLAB)
-XX:TLABWasteTargetPercent=1  # Default: 1%
```

**TLAB Refill:**
```bash
# TLAB refill threshold
-XX:TLABRefillWasteFraction=64  # Default: 64

# When TLAB has < 1/64 remaining, retire and get new TLAB
```

**Monitoring TLAB:**
```bash
# Print TLAB statistics
-XX:+PrintTLAB

# Output:
# TLAB: gc thread: 0 [id: 0, desired_size: 1024KB, slow allocs: 0, refill waste: 8192B]
```

#### High-Allocation Optimization

**Problem: Frequent TLAB Overflow**
```java
// High allocation rate causes TLAB overflow
for (int i = 0; i < 1_000_000; i++) {
    Message msg = new Message(); // TLAB fills quickly
    process(msg);
}
```

**Solution 1: Increase TLAB Size**
```bash
# Larger TLAB for high-allocation threads
-XX:TLABSize=512k  # Increase from default

# Trade-off: More memory per thread, less frequent refills
```

**Solution 2: Object Pooling**
```java
// ✅ GOOD: Reuse objects
public class MessagePool {
    private final ThreadLocal<Queue<Message>> pool = 
        ThreadLocal.withInitial(() -> new ArrayDeque<>());
    
    public Message acquire() {
        Queue<Message> queue = pool.get();
        Message msg = queue.poll();
        return msg != null ? msg : new Message();
        msg.reset(); // Clear state
        return msg;
    }
    
    public void release(Message msg) {
        pool.get().offer(msg);
    }
}
```

**Solution 3: Reduce Object Size**
```java
// ❌ BAD: Large object headers
public class Message {
    private String field1; // 8 bytes + String reference
    private String field2; // 8 bytes + String reference
    // ... many fields
}

// ✅ GOOD: Compact representation
public class Message {
    private byte[] data; // Single array, less overhead
    // Parse on demand
}
```

#### TLAB vs Direct Allocation

**TLAB Allocation (Small Objects):**
- Fast: Pointer bump, no synchronization
- Thread-local: No contention
- Size limit: Typically < 100KB

**Direct Allocation (Large Objects):**
- Goes directly to old generation
- Bypasses TLAB (too large)
- Threshold: `-XX:PretenureSizeThreshold`

```bash
# Objects larger than this go directly to old gen
-XX:PretenureSizeThreshold=1m  # Default: 0 (disabled)
```

#### Follow-Up Questions

1. **Q: What happens when TLAB overflows?**
   - Thread allocates in shared Eden space
   - May need synchronization (slower)
   - New TLAB allocated when possible
   - Frequent overflow = performance degradation

2. **Q: Can TLAB size be different per thread?**
   - Yes, JVM adapts TLAB size based on allocation rate
   - High-allocation threads get larger TLABs
   - Adaptive sizing: `-XX:+ResizeTLAB` (default: enabled)

3. **Q: How does TLAB interact with GC?**
   - TLABs are part of Eden space
   - Collected during minor GC
   - New TLABs allocated after GC
   - GC frequency affects TLAB allocation

---

### Q11: Metaspace vs PermGen - OutOfMemoryError After Migration

**Scenario:**
A Java 7 application migrated to Java 11 experiences `OutOfMemoryError: Metaspace` after running for several days. The application uses dynamic class loading and previously had PermGen configured. The team increased Metaspace size, but the issue persists with gradual memory growth.

**Question:**
Explain the differences between PermGen and Metaspace, why Metaspace can still cause OOM, how to diagnose Metaspace leaks, and provide solutions for managing Metaspace in applications with dynamic class loading.

**Step-by-Step Answer:**

#### PermGen vs Metaspace

**PermGen (Java 7 and earlier):**
- Fixed size heap region
- Stores class metadata, interned strings
- `-XX:MaxPermSize=256m`
- OutOfMemoryError when full
- Collected by Full GC only

**Metaspace (Java 8+):**
- Native memory (off-heap)
- Stores class metadata only
- Grows as needed (up to max)
- `-XX:MaxMetaspaceSize=256m`
- Collected by GC (can be minor GC)
- More flexible, but can still leak

#### Key Differences

| Aspect | PermGen | Metaspace |
|--------|---------|-----------|
| Location | Heap | Native memory |
| Size | Fixed | Dynamic (up to max) |
| Collection | Full GC only | Minor GC possible |
| Strings | Stored here | Moved to heap |
| Flexibility | Limited | High |
| Leaks | Fixed size issue | Can grow indefinitely |

#### Metaspace Contents

**What's Stored:**
- Class metadata (bytecode, methods, fields)
- Method metadata
- Constant pool
- Annotations
- Method bytecode

**What's NOT Stored:**
- Class instances (in heap)
- Static fields (in heap)
- Interned strings (in heap, Java 7+)

#### Metaspace Leak Diagnosis

**Symptoms:**
- Gradual Metaspace growth
- OutOfMemoryError after days/weeks
- Multiple ClassLoader instances
- Classes not being unloaded

**Diagnosis Tools:**
```java
// Monitor Metaspace usage
public class MetaspaceMonitor {
    @Scheduled(fixedRate = 60000)
    public void monitorMetaspace() {
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
        
        for (MemoryPoolMXBean pool : memoryBean.getMemoryPoolMXBeans()) {
            if (pool.getName().contains("Metaspace")) {
                MemoryUsage usage = pool.getUsage();
                double usedPercent = (double) usage.getUsed() / usage.getMax() * 100;
                
                log.info("Metaspace: {}MB / {}MB ({}%)",
                    usage.getUsed() / 1024 / 1024,
                    usage.getMax() / 1024 / 1024,
                    usedPercent);
                
                if (usedPercent > 80) {
                    log.warn("High Metaspace usage!");
                }
            }
        }
    }
}
```

**JVM Flags:**
```bash
# Metaspace settings
-XX:MetaspaceSize=256m        # Initial size
-XX:MaxMetaspaceSize=512m    # Maximum size

# Metaspace GC logging
-XX:+PrintGCDetails
-XX:+PrintGCDateStamps
-Xlog:gc*:file=gc.log

# Class unloading
-XX:+TraceClassUnloading
-XX:+TraceClassLoading
```

#### Common Metaspace Leak Causes

**1. ClassLoader Not GC'd**
```java
// ❌ BAD: ClassLoader held by strong reference
public class PluginManager {
    private final List<ClassLoader> loaders = new ArrayList<>(); // Never cleared!
    
    public void loadPlugin(URL[] urls) {
        ClassLoader loader = new URLClassLoader(urls);
        loaders.add(loader); // Strong reference - prevents GC
    }
}
```

**2. Static References**
```java
// ❌ BAD: Static cache holds classes
public class Plugin {
    private static final Map<String, Class<?>> cache = new HashMap<>();
    
    static {
        cache.put("MyClass", MyClass.class); // Class reference prevents unloading
    }
}
```

**3. Reflection Caches**
```java
// Reflection may cache class metadata
Class<?> clazz = Class.forName("com.example.Plugin");
// Reflection cache may hold reference
```

#### Solutions

**Solution 1: Proper ClassLoader Lifecycle**
```java
// ✅ GOOD: Weak references, explicit cleanup
public class PluginManager {
    private final Map<String, WeakReference<ClassLoader>> loaders = new WeakHashMap<>();
    
    public void loadPlugin(String id, URL[] urls) {
        ClassLoader loader = new URLClassLoader(urls);
        loaders.put(id, new WeakReference<>(loader));
    }
    
    public void unloadPlugin(String id) {
        WeakReference<ClassLoader> ref = loaders.remove(id);
        if (ref != null) {
            ClassLoader loader = ref.get();
            if (loader instanceof URLClassLoader) {
                try {
                    ((URLClassLoader) loader).close(); // Java 7+
                } catch (IOException e) {
                    // Handle
                }
            }
        }
    }
}
```

**Solution 2: Metaspace Monitoring and Alerts**
```java
@Component
public class MetaspaceAlert {
    @Scheduled(fixedRate = 300000) // Every 5 minutes
    public void checkMetaspace() {
        MemoryUsage metaspace = getMetaspaceUsage();
        double usagePercent = (double) metaspace.getUsed() / metaspace.getMax() * 100;
        
        if (usagePercent > 85) {
            alertService.sendAlert("Critical Metaspace usage: " + usagePercent + "%");
            // Trigger Full GC to attempt class unloading
            System.gc();
        }
    }
}
```

**Solution 3: Limit Dynamic Class Loading**
```java
// ✅ GOOD: Limit and monitor class loading
public class RestrictedClassLoader extends URLClassLoader {
    private static final int MAX_CLASSES = 10000;
    private final AtomicInteger classCount = new AtomicInteger(0);
    
    @Override
    protected Class<?> findClass(String name) throws ClassNotFoundException {
        if (classCount.get() >= MAX_CLASSES) {
            throw new ClassLoadingLimitExceededException("Max classes reached");
        }
        classCount.incrementAndGet();
        return super.findClass(name);
    }
}
```

#### Tuning Metaspace

**Sizing:**
```bash
# Initial Metaspace size
-XX:MetaspaceSize=256m  # Should match typical usage

# Maximum Metaspace size
-XX:MaxMetaspaceSize=512m  # Set based on application needs

# Compressed class pointers (64-bit JVM)
-XX:+UseCompressedClassPointers  # Default: enabled
-XX:CompressedClassSpaceSize=1g   # Default: 1GB
```

**GC Tuning:**
```bash
# Force Full GC for Metaspace cleanup
-XX:+CMSClassUnloadingEnabled  # Java 7
-XX:+CMSPermGenSweepingEnabled # Java 7

# Java 8+: Metaspace collected by default
# But Full GC may be needed for class unloading
```

#### Follow-Up Questions

1. **Q: Why did Java move from PermGen to Metaspace?**
   - PermGen had fixed size, hard to tune
   - Metaspace is more flexible
   - Better GC behavior
   - Separates class metadata from heap

2. **Q: Can Metaspace cause native memory issues?**
   - Yes, Metaspace uses native memory
   - Can cause native OOM if unlimited
   - Always set MaxMetaspaceSize
   - Monitor native memory usage

3. **Q: How do you unload classes in production?**
   - Classes unload when ClassLoader is GC'd
   - Requires Full GC typically
   - All conditions must be met (no references)
   - Use custom ClassLoaders with proper lifecycle

---

## Garbage Collection - Deep Technical

### Q12: G1GC Working - High GC Pause Times in Production

**Scenario:**
A high-throughput e-commerce application processes millions of orders daily. After migrating from Parallel GC to G1GC, the application experiences occasional GC pause spikes of 500ms+ during peak traffic. The heap is 8GB, and G1GC was chosen for its low-latency promise, but pause times are worse than expected.

**Question:**
Explain how G1GC works internally, why pause times are high, how to tune G1GC for low-latency, and when to consider ZGC or Shenandoah instead. Include discussion of regions, concurrent marking, evacuation, and pause time targets.

**Step-by-Step Answer:**

#### G1GC Overview

**G1GC (Garbage First):**
- Low-latency collector for large heaps
- Replaces old generation with regions
- Concurrent marking and evacuation
- Pause time target: `-XX:MaxGCPauseMillis`

**Key Features:**
- Region-based heap organization
- Incremental collection
- Concurrent marking
- Evacuation (copying collection)

#### G1GC Heap Structure

**Region Organization:**
```
G1 Heap (8GB, 2048 regions of 4MB each)
├─ Young Generation (Eden + Survivor regions)
│   ├─ Eden: ~200 regions (800MB)
│   └─ Survivor: ~10 regions (40MB)
├─ Old Generation (Humongous + Regular regions)
│   ├─ Regular: ~1800 regions
│   └─ Humongous: Large objects (>50% region size)
└─ Free regions
```

**Region Types:**
- **Eden**: New object allocation
- **Survivor**: Objects that survived GC
- **Old**: Long-lived objects
- **Humongous**: Large objects (>2MB typically)

#### G1GC Collection Phases

**Young Collection (Minor GC):**
```
1. Stop-the-world: Root scanning
2. Parallel: Mark live objects in Eden/Survivor
3. Parallel: Evacuate live objects to Survivor/Old
4. Stop-the-world: Reference processing
5. Resume: Application continues
```

**Concurrent Marking Cycle:**
```
1. Initial Mark (STW): Mark roots
2. Root Region Scanning: Scan survivor regions
3. Concurrent Marking: Mark reachable objects (concurrent)
4. Remark (STW): Finalize marking
5. Cleanup (STW): Identify empty regions
6. Concurrent Cleanup: Reclaim empty regions
```

**Mixed Collection:**
- Collects both young and old regions
- Evacuates old regions with most garbage
- Controlled by pause time target

#### Why Pause Times Are High

**Common Causes:**

**1. Too Many Regions to Evacuate**
```bash
# Problem: G1 trying to collect too much in one pause
# Solution: Reduce pause time target
-XX:MaxGCPauseMillis=50  # More aggressive, smaller collections
```

**2. Large Object Allocation**
```java
// ❌ BAD: Large objects cause humongous allocations
byte[] largeBuffer = new byte[10 * 1024 * 1024]; // 10MB - humongous!

// ✅ GOOD: Use off-heap or smaller chunks
ByteBuffer directBuffer = ByteBuffer.allocateDirect(10 * 1024 * 1024);
```

**3. High Allocation Rate**
```bash
# High allocation rate = frequent young collections
# Solution: Increase young generation
-XX:G1NewSizePercent=5   # Default: 5%
-XX:G1MaxNewSizePercent=60 # Default: 60%
```

**4. Concurrent Marking Not Keeping Up**
```bash
# Concurrent marking can't keep up with allocation
# Solution: Tune marking threads
-XX:ConcGCThreads=4  # Concurrent GC threads
```

#### G1GC Tuning for Low Latency

**Basic Tuning:**
```bash
# Heap size
-Xms8g -Xmx8g  # Equal min/max prevents resizing

# G1GC specific
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200  # Pause time target (milliseconds)

# Region size (auto-calculated, but can set)
-XX:G1HeapRegionSize=4m  # 1MB, 2MB, 4MB, 8MB, 16MB, 32MB

# Young generation sizing
-XX:G1NewSizePercent=5
-XX:G1MaxNewSizePercent=60
```

**Advanced Tuning:**
```bash
# Concurrent marking
-XX:ConcGCThreads=4           # Concurrent marking threads
-XX:InitiatingHeapOccupancyPercent=45  # Start concurrent cycle at 45% heap usage

# Evacuation
-XX:G1ReservePercent=10       # Reserve 10% for evacuation
-XX:G1HeapWastePercent=5     # Allow 5% waste before mixed GC

# Pause time control
-XX:MaxGCPauseMillis=200     # Target pause time
-XX:GCPauseIntervalMillis=200 # Minimum interval between pauses
```

**Tuning Strategy:**
1. **Set realistic pause target**: 200ms is reasonable for most apps
2. **Monitor GC logs**: Use GCViewer or similar
3. **Adjust heap occupancy**: Lower `InitiatingHeapOccupancyPercent` if marking can't keep up
4. **Increase concurrent threads**: If CPU available
5. **Reduce allocation rate**: Code-level optimizations

#### G1GC vs ZGC vs Shenandoah

**G1GC:**
- **Best for**: Large heaps (4GB-32GB), balanced throughput/latency
- **Pause times**: 10-200ms (tunable)
- **Throughput**: Good (90%+)
- **Java version**: 7u4+

**ZGC:**
- **Best for**: Very large heaps (8GB+), ultra-low latency
- **Pause times**: <10ms (sub-millisecond target)
- **Throughput**: Excellent (95%+)
- **Java version**: 11+ (production: 15+)
- **Trade-off**: Higher CPU usage

**Shenandoah:**
- **Best for**: Large heaps, low latency, concurrent evacuation
- **Pause times**: <10ms
- **Throughput**: Excellent
- **Java version**: 12+ (production: 15+)
- **Trade-off**: Higher memory overhead

**When to Choose:**
- **G1GC**: Default choice, balanced, proven
- **ZGC**: Ultra-low latency requirements (trading, real-time)
- **Shenandoah**: Low latency with concurrent evacuation

#### GC Log Analysis

**Enable GC Logging:**
```bash
# Java 9+ unified logging
-Xlog:gc*:file=gc.log:time,tags:filecount=5,filesize=10M

# Detailed G1GC logging
-Xlog:gc+heap=debug:file=g1-detail.log
```

**Key Metrics:**
```
[0.123s][info][gc] GC(42) Pause Young (Normal) (G1 Evacuation Pause)
  [0.123s][info][gc]   Using 8 workers of 8 for evacuation
  [0.145s][info][gc]   Region Eden: 200->0(200) Survivors: 10->10(10) Old: 1800->1820(1800)
  [0.145s][info][gc]   200M->20M(8G) 22.000ms
```

**Analysis:**
- **Pause time**: 22ms (within target)
- **Throughput**: 200M collected in 22ms
- **Region movement**: Eden cleared, some promotion to Old

#### Production Monitoring

```java
@Component
public class G1GCMonitor {
    @Scheduled(fixedRate = 60000)
    public void monitorGC() {
        List<GarbageCollectorMXBean> gcBeans = 
            ManagementFactory.getGarbageCollectorMXBeans();
        
        for (GarbageCollectorMXBean gc : gcBeans) {
            if (gc.getName().contains("G1")) {
                long collections = gc.getCollectionCount();
                long time = gc.getCollectionTime();
                
                log.info("G1GC: {} collections, {}ms total time, avg: {}ms",
                    collections, time, 
                    collections > 0 ? time / collections : 0);
                
                // Alert on high pause times
                if (collections > 0) {
                    long avgPause = time / collections;
                    if (avgPause > 200) {
                        alertService.sendAlert("High GC pause: " + avgPause + "ms");
                    }
                }
            }
        }
    }
}
```

#### Follow-Up Questions

1. **Q: Why does G1GC have higher pause times than ZGC?**
   - G1GC does evacuation during pause (STW)
   - ZGC does concurrent evacuation (no STW)
   - G1GC is more conservative, ZGC is more aggressive

2. **Q: What's the difference between G1GC's concurrent marking and ZGC's concurrent collection?**
   - **G1GC**: Concurrent marking, but evacuation is STW
   - **ZGC**: Both marking and evacuation are concurrent
   - ZGC uses load barriers for concurrent access

3. **Q: How do you choose between G1GC region sizes?**
   - Smaller regions: More flexibility, more overhead
   - Larger regions: Less overhead, less flexibility
   - Default (auto): Usually optimal
   - Manual: Only if you know your object sizes

---

### Q13: GC Roots and Reachability - Memory Leak Investigation

**Scenario:**
A long-running Java application shows gradual memory growth. Heap dumps show millions of `Order` objects that should have been garbage collected. The objects are not referenced by application code, but GC is not collecting them. Investigation reveals the objects are held by `ThreadLocal` variables and static caches.

**Question:**
Explain GC roots, reachability analysis, the different reference types (Strong, Weak, Soft, Phantom), and how to identify why objects aren't being collected. Include discussion of reference queues and when to use each reference type.

**Step-by-Step Answer:**

#### GC Roots

**What are GC Roots:**
- Starting points for reachability analysis
- Objects directly accessible by JVM
- If object is reachable from GC root, it's not collected

**Types of GC Roots:**
1. **Local variables** (in active stack frames)
2. **Static fields** (in loaded classes)
3. **Thread references** (active threads)
4. **JNI references** (native code)
5. **Monitor locks** (synchronized objects)
6. **System class loader** (loaded classes)

#### Reachability Analysis

**Marking Process:**
```
1. Start from GC roots
2. Mark all reachable objects
3. Traverse object references
4. Mark connected objects
5. Unmarked objects = garbage
```

**Example:**
```java
// GC Root: Static field
private static List<Order> orders = new ArrayList<>();

// GC Root: Local variable
public void process() {
    Order order = new Order(); // Reachable from stack
    orders.add(order);         // Also reachable from static
}

// When process() returns:
// - order local variable gone (not a root)
// - But order still reachable from static orders list
// - Therefore, NOT collected
```

#### Reference Types

**Strong Reference (Default):**
```java
// ✅ Strong reference - prevents GC
Order order = new Order();
// Object will NOT be collected while 'order' reference exists
```

**Weak Reference:**
```java
// ✅ Weak reference - allows GC when no strong references
WeakReference<Order> weakOrder = new WeakReference<>(order);
order = null; // Clear strong reference
// Now weakOrder.get() may return null after GC
```

**Soft Reference:**
```java
// ✅ Soft reference - GC'd only when memory pressure
SoftReference<Order> softOrder = new SoftReference<>(order);
order = null;
// GC'd only when heap is getting full
```

**Phantom Reference:**
```java
// ✅ Phantom reference - for cleanup, always returns null
ReferenceQueue<Order> queue = new ReferenceQueue<>();
PhantomReference<Order> phantom = new PhantomReference<>(order, queue);
order = null;
// Used for finalization-like cleanup
```

#### The Memory Leak

**Problem: ThreadLocal Leak**
```java
// ❌ BAD: ThreadLocal holds strong reference
public class OrderContext {
    private static final ThreadLocal<Order> currentOrder = new ThreadLocal<>();
    
    public static void setOrder(Order order) {
        currentOrder.set(order); // Strong reference!
    }
    
    // If thread never calls remove(), order never GC'd
    // ThreadLocal map holds reference even after thread dies (in thread pool)
}
```

**Why It Leaks:**
- ThreadLocal uses ThreadLocalMap (in Thread object)
- Map holds strong references to values
- Thread pool threads are long-lived
- Values never cleared = memory leak

**Fix:**
```java
// ✅ GOOD: Always remove ThreadLocal
public class OrderContext {
    private static final ThreadLocal<Order> currentOrder = new ThreadLocal<>();
    
    public static void setOrder(Order order) {
        currentOrder.set(order);
    }
    
    public static void clear() {
        currentOrder.remove(); // Critical!
    }
    
    // Use try-finally or @PreDestroy
    @PreDestroy
    public void cleanup() {
        currentOrder.remove();
    }
}
```

**Problem: Static Cache Leak**
```java
// ❌ BAD: Static cache grows indefinitely
public class OrderCache {
    private static final Map<String, Order> cache = new HashMap<>();
    
    public static void put(String id, Order order) {
        cache.put(id, order); // Never removed!
    }
    
    // Cache grows forever
}
```

**Fix: WeakHashMap or Size Limit:**
```java
// ✅ GOOD: WeakHashMap (keys are weak references)
public class OrderCache {
    private static final Map<String, Order> cache = new WeakHashMap<>();
    // Keys can be GC'd when no strong references
}

// ✅ BETTER: Size-limited cache
public class OrderCache {
    private static final int MAX_SIZE = 10000;
    private static final Map<String, Order> cache = new LinkedHashMap<String, Order>() {
        @Override
        protected boolean removeEldestEntry(Map.Entry eldest) {
            return size() > MAX_SIZE;
        }
    };
}
```

#### Reference Queues

**Using Reference Queues:**
```java
// ✅ GOOD: Monitor when objects are GC'd
ReferenceQueue<Order> queue = new ReferenceQueue<>();
WeakReference<Order> ref = new WeakReference<>(order, queue);

order = null; // Clear strong reference

// Poll queue to see when object is GC'd
Reference<? extends Order> cleared = queue.poll();
if (cleared != null) {
    log.info("Order was garbage collected");
    // Perform cleanup
}
```

**Use Case: Cleanup After GC:**
```java
public class ResourceManager {
    private final ReferenceQueue<Resource> queue = new ReferenceQueue<>();
    private final Set<PhantomReference<Resource>> refs = new HashSet<>();
    
    public void register(Resource resource) {
        PhantomReference<Resource> ref = 
            new PhantomReference<>(resource, queue);
        refs.add(ref);
    }
    
    @Scheduled(fixedRate = 1000)
    public void cleanup() {
        Reference<? extends Resource> cleared;
        while ((cleared = queue.poll()) != null) {
            // Resource was GC'd, perform cleanup
            cleanupResource(cleared);
            refs.remove(cleared);
        }
    }
}
```

#### Diagnosing Memory Leaks

**Heap Dump Analysis:**
```bash
# Generate heap dump
jmap -dump:live,format=b,file=heap.hprof <pid>

# Analyze with Eclipse MAT
# 1. Look for "Leak Suspects" report
# 2. Find objects with high "Retained Heap"
# 3. Check "Path to GC Roots"
# 4. Identify what's preventing GC
```

**Programmatic Analysis:**
```java
public class MemoryLeakDetector {
    public void analyzeHeap() {
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
        MemoryUsage heapUsage = memoryBean.getHeapMemoryUsage();
        
        // Check for gradual growth
        long used = heapUsage.getUsed();
        long max = heapUsage.getMax();
        double usagePercent = (double) used / max * 100;
        
        if (usagePercent > 80) {
            // Potential leak - generate heap dump
            generateHeapDump();
        }
    }
}
```

#### When to Use Each Reference Type

**Strong Reference:**
- Default, use for normal objects
- Prevents GC while reference exists
- Use: Most application objects

**Weak Reference:**
- Allows GC when no strong references
- Use: Caches, metadata, temporary data
- Example: `WeakHashMap` for caching

**Soft Reference:**
- GC'd only under memory pressure
- Use: Caches that should survive minor GC
- Example: Image caches, computed values

**Phantom Reference:**
- Always returns null, used for cleanup
- Use: Resource cleanup, finalization alternative
- Example: File handle cleanup, native resource management

#### Follow-Up Questions

1. **Q: What's the difference between WeakReference and SoftReference?**
   - **Weak**: GC'd immediately when no strong refs
   - **Soft**: GC'd only when memory pressure
   - Use Weak for temporary caches, Soft for important caches

2. **Q: Can you have a memory leak with only weak references?**
   - Yes, if weak references themselves are held strongly
   - Example: `List<WeakReference<Object>>` - list holds refs strongly
   - Solution: Use `WeakHashMap` or `ReferenceQueue`

3. **Q: How do you prevent ThreadLocal leaks in thread pools?**
   - Always call `remove()` after use
   - Use try-finally blocks
   - Implement cleanup in `@PreDestroy`
   - Consider `InheritableThreadLocal` carefully

---

## Production Debugging Scenarios

### Q14: Application Slows Down After 3 Days - Gradual Performance Degradation

**Scenario:**
A Java application runs fine for the first 2-3 days, then gradually slows down. Response times increase from 100ms to 2000ms over a week. CPU usage remains normal, memory usage is stable, but GC frequency increases. No errors in logs. The application handles high traffic and processes large amounts of data.

**Question:**
Systematically diagnose this issue. What could cause gradual performance degradation? How do you identify the root cause? Provide a step-by-step debugging approach and solutions.

**Step-by-Step Answer:**

#### Systematic Diagnosis Approach

**Step 1: Check Memory Leaks**
```bash
# Generate heap dumps over time
jmap -dump:live,format=b,file=heap-day1.hprof <pid>
# Wait 24 hours
jmap -dump:live,format=b,file=heap-day2.hprof <pid>
# Wait 24 hours
jmap -dump:live,format=b,file=heap-day3.hprof <pid>

# Compare heap dumps
# Look for objects growing over time
```

**Step 2: Analyze GC Logs**
```bash
# Enable GC logging
-Xlog:gc*:file=gc.log:time,tags:filecount=10,filesize=10M

# Analyze trends
# - GC frequency increasing?
# - GC pause times increasing?
# - Heap usage growing?
```

**Step 3: Thread Dump Analysis**
```bash
# Generate thread dumps
jstack <pid> > thread-dump-1.txt
# Wait
jstack <pid> > thread-dump-2.txt

# Compare:
# - Blocked threads increasing?
# - Deadlocks?
# - Thread pool exhaustion?
```

#### Common Causes

**1. Memory Leak (Gradual Heap Growth)**
```java
// ❌ BAD: Cache growing indefinitely
public class OrderCache {
    private static final Map<String, Order> cache = new ConcurrentHashMap<>();
    
    public void cacheOrder(Order order) {
        cache.put(order.getId(), order); // Never evicted!
    }
}

// Symptoms:
// - Heap usage gradually increases
// - GC frequency increases
// - Eventually OOM

// Fix:
public class OrderCache {
    private static final Cache<String, Order> cache = Caffeine.newBuilder()
        .maximumSize(10_000)
        .expireAfterWrite(1, TimeUnit.HOURS)
        .build();
}
```

**2. Thread Pool Exhaustion**
```java
// ❌ BAD: Threads blocked, pool exhausted
@Async
public CompletableFuture<Void> processOrder(Order order) {
    // Long-running operation
    // If many orders, threads get blocked
    // New requests wait for available threads
    // Response time increases
}

// Symptoms:
// - Thread pool queue growing
// - Requests waiting for threads
// - Response time increases

// Fix:
@Configuration
public class AsyncConfig {
    @Bean
    public Executor asyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(20);
        executor.setMaxPoolSize(100);
        executor.setQueueCapacity(500);
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        return executor;
    }
}
```

**3. Database Connection Leak**
```java
// ❌ BAD: Connections not closed
public List<Order> getOrders() {
    Connection conn = dataSource.getConnection();
    // ... use connection
    // Never closed! Connection pool exhausted
}

// Symptoms:
// - Connection pool exhausted
// - Requests waiting for connections
// - Database connections increasing

// Fix:
public List<Order> getOrders() {
    try (Connection conn = dataSource.getConnection();
         PreparedStatement stmt = conn.prepareStatement("SELECT * FROM orders");
         ResultSet rs = stmt.executeQuery()) {
        // Auto-closed
    }
}
```

**4. Gradual File Handle Leak**
```java
// ❌ BAD: File handles not closed
public void processFile(String path) {
    FileInputStream fis = new FileInputStream(path);
    // Process file
    // Never closed! OS file handles exhausted
}

// Symptoms:
// - OS file handles exhausted
// - Can't open new files
// - Application slows down

// Fix:
public void processFile(String path) {
    try (FileInputStream fis = new FileInputStream(path)) {
        // Auto-closed
    }
}
```

**5. Gradual ClassLoader Leak (Metaspace)**
```java
// ❌ BAD: Classes not unloaded
public class PluginManager {
    private final List<ClassLoader> loaders = new ArrayList<>();
    
    public void loadPlugin(URL[] urls) {
        ClassLoader loader = new URLClassLoader(urls);
        loaders.add(loader); // Never removed
        // Metaspace grows
    }
}

// Symptoms:
// - Metaspace usage increasing
// - Eventually Metaspace OOM
// - GC overhead increases
```

#### Diagnostic Tools

**Heap Dump Analysis:**
```java
// Programmatic heap dump
public class HeapDumpGenerator {
    public void generateHeapDump() {
        try {
            HotSpotDiagnosticMXBean bean = ManagementFactory
                .getPlatformMXBean(HotSpotDiagnosticMXBean.class);
            bean.dumpHeap("heap-" + System.currentTimeMillis() + ".hprof", true);
        } catch (IOException e) {
            log.error("Failed to generate heap dump", e);
        }
    }
}
```

**GC Analysis:**
```bash
# Use GCViewer or similar
# Look for:
# - Increasing GC frequency
# - Increasing pause times
# - Heap usage trends
# - Promotion rates
```

**Thread Analysis:**
```java
// Monitor thread states
public class ThreadMonitor {
    @Scheduled(fixedRate = 60000)
    public void monitorThreads() {
        ThreadMXBean threadBean = ManagementFactory.getThreadMXBean();
        ThreadInfo[] threads = threadBean.dumpAllThreads(false, false);
        
        Map<Thread.State, Long> stateCount = Arrays.stream(threads)
            .collect(Collectors.groupingBy(
                ThreadInfo::getThreadState,
                Collectors.counting()
            ));
        
        log.info("Thread states: {}", stateCount);
        
        // Alert on high BLOCKED threads
        long blocked = stateCount.getOrDefault(Thread.State.BLOCKED, 0L);
        if (blocked > 10) {
            log.warn("High number of blocked threads: {}", blocked);
        }
    }
}
```

#### Solution Strategy

**1. Implement Monitoring:**
```java
@Component
public class PerformanceMonitor {
    @Scheduled(fixedRate = 60000)
    public void monitor() {
        // Memory
        MemoryUsage heap = ManagementFactory.getMemoryMXBean().getHeapMemoryUsage();
        double heapUsage = (double) heap.getUsed() / heap.getMax() * 100;
        
        // Threads
        int threadCount = ManagementFactory.getThreadMXBean().getThreadCount();
        
        // GC
        long gcCount = ManagementFactory.getGarbageCollectorMXBeans().stream()
            .mapToLong(GarbageCollectorMXBean::getCollectionCount)
            .sum();
        
        // Log metrics
        meterRegistry.gauge("heap.usage.percent", heapUsage);
        meterRegistry.gauge("thread.count", threadCount);
        meterRegistry.counter("gc.count").increment(gcCount);
        
        // Alert on anomalies
        if (heapUsage > 80) {
            alertService.sendAlert("High heap usage: " + heapUsage + "%");
        }
    }
}
```

**2. Set Up Alerts:**
- Heap usage > 80%
- GC frequency > threshold
- Thread count > threshold
- Response time > threshold

**3. Regular Health Checks:**
- Daily heap dump analysis
- Weekly GC log review
- Thread dump analysis on anomalies

#### Follow-Up Questions

1. **Q: How do you distinguish between memory leak and memory bloat?**
   - **Leak**: Objects that should be GC'd but aren't (grows indefinitely)
   - **Bloat**: Legitimate objects but too many (can be optimized)
   - Both cause OOM, but solutions differ

2. **Q: What tools do you use for production debugging?**
   - APM: New Relic, Datadog, AppDynamics
   - Profiling: JProfiler, YourKit, JFR
   - Heap analysis: Eclipse MAT, VisualVM
   - GC analysis: GCViewer, GCPlot

3. **Q: How do you prevent gradual degradation?**
   - Comprehensive monitoring
   - Regular health checks
   - Resource limits (caches, pools)
   - Proper cleanup (try-with-resources)
   - Code reviews for leaks

---

### Q15: High GC But Low Heap Usage - GC Overhead Limit Exceeded

**Scenario:**
A Java application throws `OutOfMemoryError: GC overhead limit exceeded`. Heap usage shows only 40% used, but GC is running constantly. The application processes large batches of data and creates many temporary objects. GC logs show frequent minor GCs with little memory reclaimed.

**Question:**
Explain what "GC overhead limit exceeded" means, why it occurs with low heap usage, and how to fix it. Include discussion of allocation rate, GC efficiency, and tuning strategies.

**Step-by-Step Answer:**

#### GC Overhead Limit

**What It Means:**
- JVM spends >98% of time in GC
- <2% of heap reclaimed per GC cycle
- JVM gives up and throws OOM
- Protection mechanism to prevent thrashing

**Trigger Conditions:**
```bash
# Default thresholds
-XX:GCTimeRatio=19  # GC time / application time = 1/19 (5%)
# If GC time > 98% of total time, trigger

-XX:GCHeapFreeLimit=2  # Must free >2% of heap
# If <2% freed, trigger
```

#### Why Low Heap Usage?

**The Problem:**
```
Heap: 8GB total
Used: 3.2GB (40%)
Free: 4.8GB (60%)

But:
- Allocation rate: 1GB/second
- GC reclaims: 100MB per cycle
- GC frequency: 10/second
- GC time: 98% of CPU time
- Application: 2% of CPU time
```

**Root Cause:**
- **High allocation rate**: Creating objects faster than GC can collect
- **Low GC efficiency**: GC not reclaiming enough per cycle
- **Frequent GC**: GC running constantly but not keeping up

#### Common Causes

**1. High Allocation Rate**
```java
// ❌ BAD: Creating too many temporary objects
public void processBatch(List<Order> orders) {
    for (Order order : orders) {
        // Creates new objects in loop
        String report = generateReport(order); // New String
        byte[] data = serialize(order);      // New byte array
        process(data);                        // Temporary objects
    }
}

// Fix: Reuse objects
public void processBatch(List<Order> orders) {
    StringBuilder reportBuilder = new StringBuilder(1000);
    ByteArrayOutputStream buffer = new ByteArrayOutputStream(1024);
    
    for (Order order : orders) {
        reportBuilder.setLength(0); // Reuse
        buffer.reset();              // Reuse
        generateReport(order, reportBuilder);
        serialize(order, buffer);
        process(buffer.toByteArray());
    }
}
```

**2. Large Young Generation**
```bash
# Problem: Young gen too large
# - Minor GC takes longer
# - But doesn't collect enough
# - Frequent GC needed

# Fix: Reduce young generation
-XX:NewRatio=2  # Young:Old = 1:2 (instead of default 1:3)
-XX:NewSize=1g
-XX:MaxNewSize=1g
```

**3. Inefficient GC Algorithm**
```bash
# Problem: GC algorithm not suited for workload
# - Serial GC: Too slow for multi-core
# - Parallel GC: High pause times
# - CMS: Deprecated, inefficient

# Fix: Use appropriate GC
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200
-XX:G1NewSizePercent=5
-XX:G1MaxNewSizePercent=60
```

#### Solutions

**Solution 1: Reduce Allocation Rate**
```java
// ✅ GOOD: Object pooling
public class ObjectPool<T> {
    private final Queue<T> pool = new ConcurrentLinkedQueue<>();
    private final Supplier<T> factory;
    
    public T acquire() {
        T obj = pool.poll();
        return obj != null ? obj : factory.get();
    }
    
    public void release(T obj) {
        obj.reset(); // Clear state
        pool.offer(obj);
    }
}

// Usage
ObjectPool<Message> messagePool = new ObjectPool<>(Message::new);
Message msg = messagePool.acquire();
try {
    process(msg);
} finally {
    messagePool.release(msg);
}
```

**Solution 2: Increase Heap Size**
```bash
# If allocation rate is legitimate, increase heap
-Xms4g -Xmx8g  # Increase from 2g to 8g

# More heap = less frequent GC
# But: Larger heap = longer GC pauses
```

**Solution 3: Tune GC Parameters**
```bash
# G1GC tuning for high allocation
-XX:+UseG1GC
-XX:MaxGCPauseMillis=100        # Lower pause target
-XX:G1NewSizePercent=10       # Larger young gen
-XX:G1MaxNewSizePercent=40
-XX:InitiatingHeapOccupancyPercent=30  # Start marking earlier
```

**Solution 4: Disable GC Overhead Limit (Not Recommended)**
```bash
# Only if you understand the risk
-XX:-UseGCOverheadLimit

# Warning: Application may hang in GC thrashing
```

#### Monitoring GC Efficiency

```java
@Component
public class GCEfficiencyMonitor {
    @Scheduled(fixedRate = 60000)
    public void monitorGC() {
        List<GarbageCollectorMXBean> gcBeans = 
            ManagementFactory.getGarbageCollectorMXBeans();
        
        for (GarbageCollectorMXBean gc : gcBeans) {
            long collections = gc.getCollectionCount();
            long time = gc.getCollectionTime();
            
            if (collections > 0) {
                double avgPause = (double) time / collections;
                double gcPercent = (double) time / 60000 * 100; // Last minute
                
                log.info("GC: {} collections, {}ms avg, {}% of time",
                    collections, avgPause, gcPercent);
                
                // Alert on high GC overhead
                if (gcPercent > 20) {
                    alertService.sendAlert("High GC overhead: " + gcPercent + "%");
                }
            }
        }
    }
}
```

#### Follow-Up Questions

1. **Q: What's the difference between GC overhead limit and heap OOM?**
   - **GC Overhead**: Heap not full, but GC can't keep up
   - **Heap OOM**: Heap actually full, no space for new objects
   - Different root causes, different solutions

2. **Q: How do you measure allocation rate?**
   - Use JFR (Java Flight Recorder)
   - Monitor object allocation events
   - Calculate: bytes allocated / time
   - Target: <100MB/second for most apps

3. **Q: When should you disable GC overhead limit?**
   - Almost never
   - Only if you have external monitoring
   - And understand the risk
   - Better to fix root cause

---

*This completes Part 3. See Index for navigation to other parts.*
