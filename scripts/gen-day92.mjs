import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── WHY ────────────────────────────────────────────────────────────────────

const WHY_CONTENT =
  'You are the oncall engineer. It is 2:17am. PagerDuty fires. Your payment service p99 latency has spiked from 120ms to 900ms. ' +
  'You pull up Grafana. CPU is fine. Database pool is healthy. Downstream services respond normally. You restart the pods. ' +
  'Latency drops. Fifteen minutes later it spikes again.\n\n' +
  'Your team\'s instinct: increase heap size. You go from `-Xmx2g` to `-Xmx4g` and redeploy. The problem gets *worse*. ' +
  'Pauses are now 1.4 seconds instead of 800ms. You have no idea why doubling heap made things worse. You roll back and file a ticket for Monday.\n\n' +
  'What you did not know: the service was allocating objects larger than 50% of a G1 region, triggering humongous allocation paths that ' +
  'bypassed the young generation entirely and went straight to old gen. Every few minutes, old gen filled, G1 ran a Mixed GC, and paused all threads ' +
  'for 800ms. Doubling the heap gave G1 more old gen to scan during that mixed collection, which made pauses longer, not shorter. ' +
  'A single flag — `-XX:G1HeapRegionSize=16m` — would have reclassified those allocations as normal and eliminated the problem in ten minutes.\n\n' +
  'This gap is not about being a weak engineer. GC is invisible when it works. Most engineers never look at a GC log until production is on fire, ' +
  'then they guess. The engineers who reach Staff level look at GC logs proactively — they have tuned flags, read heap dumps, and built the ' +
  'diagnostic muscle before an incident requires it.\n\n' +
  'In senior and Staff interviews, the question "Walk me through how you tuned GC in production" is a litmus test. The right answer is a story: ' +
  'the metric that signaled the problem, the log analysis step, the specific flag, and the measured result. ' +
  'Candidates who give a Wikipedia summary of GC algorithms fail. Candidates who tell a concrete operational story get offers.\n\n' +
  'After this day you will have the model, the tooling, and the systematic workflow to diagnose GC problems before they become incidents — ' +
  'and a production story to tell when an interviewer asks for one.';

// ─── THEORY ─────────────────────────────────────────────────────────────────

const THEORY_CONTENT =
  '## What Keeps Objects Alive: GC Roots\n\n' +
  'The garbage collector cannot collect an object unless it is unreachable. Reachability is determined by tracing from a set of ' +
  '*roots* — references that are always considered live by definition, without needing another object to point at them.\n\n' +
  'GC roots in the JVM:\n' +
  '- **Stack frames**: local variables and method parameters in every active stack frame on every thread\n' +
  '- **Static fields**: class-level fields. The class itself is a GC root via the classloader.\n' +
  '- **JNI references**: objects referenced from native code via `JNIEnv`\n' +
  '- **Active thread objects**: `Thread` instances currently scheduled by the OS\n' +
  '- **Synchronization monitors**: objects held in `synchronized` blocks\n\n' +
  'Anything not reachable by tracing from these roots is eligible for collection. ' +
  'A `List` buried 10 references deep is still live if the chain back to a root is unbroken.\n\n' +
  '**Senior insight**: The most common production memory leak is a static `Map` used as a cache with no eviction. ' +
  'Static fields are GC roots. Every object you put in that map becomes permanently live until explicitly removed. ' +
  'The map grows without bound, old gen fills up, GC pressure increases. You never see a `OutOfMemoryError` for months — ' +
  'just steadily worsening p99 latency as GC works harder and harder to keep up.\n\n' +
  '---\n\n' +
  '## G1GC: The Region-Based Heap\n\n' +
  'G1GC divides the heap into equal-sized regions, typically between 1MB and 32MB depending on `-Xmx`. ' +
  'Unlike the older parallel and CMS collectors which had fixed young/old boundaries, G1 assigns roles to regions dynamically: ' +
  'Eden, Survivor, Old, or Humongous. This flexibility is what allows G1 to meet pause time targets.\n\n' +
  '**Collection types:**\n\n' +
  '**Young GC** (Stop-The-World, parallel): Collects all Eden and Survivor regions. Objects that survive enough young GCs are promoted to old regions. ' +
  'This is normal and expected. Young GC pauses should be under 100ms for most services.\n\n' +
  '**Concurrent Marking**: After old generation occupancy exceeds `InitiatingHeapOccupancyPercent` (default 45%), ' +
  'G1 starts a concurrent marking cycle — it identifies which old regions contain mostly garbage, concurrently with application threads. ' +
  'This phase does NOT stop the world (except for two brief checkpoints: Initial Mark and Remark).\n\n' +
  '**Mixed GC** (Stop-The-World): Uses the concurrent marking results to collect a mix of young regions AND the most garbage-dense old regions. ' +
  'This is G1\'s primary mechanism for reclaiming old gen. Mixed GC pauses are longer than Young GC pauses.\n\n' +
  '**Full GC** (Stop-The-World, single-threaded): The last resort. Triggered when G1 cannot keep up — usually because promotion rate ' +
  'exceeds concurrent marking speed, or because there is a humongous allocation that cannot fit. ' +
  'Full GC is catastrophic: single-threaded, it can pause a 32GB heap for tens of seconds. If you see Full GC in your logs, your tuning has already failed.\n\n' +
  '**Humongous objects**: Any object larger than 50% of a single G1 region size is classified as humongous. ' +
  'Humongous objects are allocated directly in old gen regions, bypassing young gen entirely. ' +
  'They trigger concurrent marking immediately, cause fragmentation, and can prematurely trigger Mixed GC. ' +
  'Common causes: large byte arrays for JSON serialization, large query result sets materialized into memory.\n\n' +
  'Fix: increase `-XX:G1HeapRegionSize` so the "50% threshold" is larger. With 16MB regions, objects must be >8MB to be humongous.\n\n' +
  '**Senior insight**: The default G1 region size is auto-calculated from heap size. For a 4GB heap it is 2MB — meaning any object >1MB ' +
  'is humongous. JSON payloads, Hibernate result sets, and batch lists frequently exceed 1MB in enterprise services. ' +
  'Set `G1HeapRegionSize` explicitly based on your allocation profile, not on JVM auto-calculation.\n\n' +
  '---\n\n' +
  '## ZGC and Shenandoah: Concurrent Compaction\n\n' +
  'Both ZGC (Java 15+ production-ready) and Shenandoah (Red Hat, backported to Java 8+) solve the same problem G1 cannot: ' +
  'they compact the heap (move live objects to defragment) *while application threads are running*.\n\n' +
  'G1 compaction is stop-the-world. As heap grows to hundreds of GB, G1 pause times grow too. ' +
  'ZGC and Shenandoah achieve sub-millisecond pauses regardless of heap size by using:\n\n' +
  '- **Load barriers** (ZGC): Code injected at every object field read. When a thread reads a reference, ' +
  'the barrier checks if the object has been moved and returns the new location. This is how the GC can move objects concurrently — ' +
  'application threads always get redirected to the current location.\n' +
  '- **Forwarding pointers** (Shenandoah): A forwarding pointer is stored in the object header. When an object is moved, ' +
  'the old location\'s forwarding pointer is updated. Application threads that read the old location are transparently redirected.\n\n' +
  '**Trade-offs:**\n' +
  '- ZGC and Shenandoah use more CPU than G1 — the concurrent compaction work steals cycles from application threads\n' +
  '- Throughput (operations per second) is often slightly lower than G1 under the same CPU budget\n' +
  '- Memory overhead is higher — extra metadata for tracking object moves\n\n' +
  '**When to choose ZGC over G1**: Latency-sensitive services where p99 matters more than absolute throughput. ' +
  'Financial trading systems, payment APIs, real-time recommendation engines. ' +
  'If a 200ms GC pause is acceptable, stay with G1 — it is simpler to tune.\n\n' +
  '**Senior insight**: ZGC\'s pause time does not grow with heap size. A 1TB ZGC heap still pauses under 1ms. ' +
  'G1 on a 1TB heap can pause for minutes. If you are ever told "we need a bigger server to fix latency", ' +
  'check GC logs first — scaling up a G1 heap often makes pause times worse.\n\n' +
  '---\n\n' +
  '## GC Tuning Workflow: Systematic, Not Intuitive\n\n' +
  'The most expensive GC tuning mistake is changing the algorithm before exhausting tuning options for the current one.\n\n' +
  '**Step 1 — Enable structured GC logging** (do this in production, always):\n' +
  '```\n' +
  '-Xlog:gc*:file=/logs/gc.log:time,uptime,level,tags:filecount=10,filesize=20m\n' +
  '```\n' +
  'This rotates logs and gives you timestamps, uptime, and full tag context.\n\n' +
  '**Step 2 — Run under realistic load** and collect logs for at least one traffic cycle.\n\n' +
  '**Step 3 — Analyze with GCEasy** (upload your gc.log, free tier is enough) or grep for:\n' +
  '- `Pause Young` — normal young GC\n' +
  '- `Pause Mixed` — old gen being collected, should be infrequent\n' +
  '- `Pause Full` — emergency, page oncall\n' +
  '- `Humongous` — find and fix the allocation\n\n' +
  '**Step 4 — Identify the pattern** before changing anything:\n' +
  '- Frequent short pauses? → Promotion rate too high, tune young gen sizing\n' +
  '- Infrequent long Mixed GC pauses? → IHOP too high, lower `InitiatingHeapOccupancyPercent`\n' +
  '- Full GC? → Promotion failure or humongous allocation failure — fix the root cause\n\n' +
  '**Step 5 — Tune MaxGCPauseMillis first**. G1 respects this as a target. Reducing it causes G1 to do more, smaller collections.\n\n' +
  '**Step 6 — If G1 cannot meet your requirements after thorough tuning, then evaluate ZGC.**\n\n' +
  '**Senior insight**: `MaxGCPauseMillis` is not a hard limit — it is a hint. G1 will exceed it when necessary. ' +
  'If your p99 pause target is 100ms and G1 consistently hits 300ms despite tuning, switch to ZGC. ' +
  'If G1 hits 100ms with some spikes to 200ms, tune the humongous allocation problem first.\n\n' +
  '---\n\n' +
  '## Memory Leak Detection\n\n' +
  'A Java memory leak is not a pointer that escapes (that\'s C++). It is an object that is still referenced but no longer needed. ' +
  'The GC cannot collect it because something in your code is still holding a reference — it just shouldn\'t be.\n\n' +
  '**Detection signals** (in order of urgency):\n' +
  '1. Old gen heap usage grows across GC cycles without stabilizing\n' +
  '2. GC overhead limit exceeded error\n' +
  '3. OutOfMemoryError: Java heap space\n\n' +
  '**Diagnostic workflow:**\n\n' +
  '**Step 1 — Confirm the pattern**: In GCEasy or your GC logs, look at old gen occupancy after each Full GC. ' +
  'If it is higher after each cycle, you have a leak.\n\n' +
  '**Step 2 — Take a heap dump** at the moment of elevated old gen usage:\n' +
  '```bash\n' +
  'jmap -dump:format=b,file=heap.hprof <pid>\n' +
  '# Or set -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/dumps/ to capture it automatically\n' +
  '```\n\n' +
  '**Step 3 — Open in Eclipse MAT**. Key insight: look at **Retained Heap**, not Shallow Heap. ' +
  'Retained heap = how much memory would be freed if this object were collected (including everything only reachable through it). ' +
  'A `HashMap` with 200K entries has small shallow heap but enormous retained heap.\n\n' +
  '**Step 4 — Run "Leak Suspects" report** in MAT. It finds objects with unusually large retained heaps and traces the reference path back to a GC root.\n\n' +
  '**Common culprits:**\n' +
  '- Static `Map` or `List` used as an unbounded cache\n' +
  '- `ThreadLocal` variables not cleaned up in thread pool threads (`threadLocal.remove()` in a finally block)\n' +
  '- Event listeners registered but never unregistered\n' +
  '- Hibernate/JPA second-level cache without size limits\n\n' +
  '**Senior insight**: `ThreadLocal` leaks are particularly nasty in Tomcat/Jetty because HTTP threads are reused. ' +
  'A `ThreadLocal` set during request processing and never cleared accumulates one object per request handled by that thread. ' +
  'The objects are live as long as the thread is live — which is forever in a thread pool.\n\n' +
  '---\n\n' +
  '## Off-Heap Memory: The Memory Your Heap Monitor Cannot See\n\n' +
  'JVM process memory is not just the heap. Your `-Xmx` tells you nothing about total process memory consumption:\n\n' +
  '| Memory Area | What Lives Here | How It Grows |\n' +
  '|-------------|----------------|-------------|\n' +
  '| Java Heap | Your objects | GC manages it |\n' +
  '| Metaspace | Class metadata, bytecode | Grows when you load new classes (CGLIB, Groovy, plugins) |\n' +
  '| Code Cache | JIT-compiled native code | Grows as JIT compiles hot methods; bounded by `-XX:ReservedCodeCacheSize` |\n' +
  '| Direct ByteBuffer | `ByteBuffer.allocateDirect()` | Allocated off-heap; freed when ByteBuffer is GC\'d |\n' +
  '| Thread Stacks | Each thread\'s stack frames | Grows with thread count; each thread uses `-Xss` (default 512KB-1MB) |\n\n' +
  'A container with `-Xmx2g` in a 3GB pod can OOM at the OS level while heap is at 60% — ' +
  'because metaspace + direct buffers + code cache + thread stacks consumed the remaining 1GB.\n\n' +
  '**Direct ByteBuffer** is particularly tricky: `ByteBuffer.allocateDirect(1_000_000)` allocates 1MB off-heap. ' +
  'The ByteBuffer object itself is small and lives on the heap. When the ByteBuffer is GC\'d, a `Cleaner` (a `PhantomReference`) ' +
  'triggers native deallocation of the off-heap memory. But if the ByteBuffer is long-lived or GC is infrequent, ' +
  'the off-heap memory accumulates. Netty, NIO, and Kafka clients all use direct buffers heavily.\n\n' +
  '**Metaspace**: Watch for `OutOfMemoryError: Metaspace` in dynamic code generation scenarios — CGLIB proxies (Spring AOP), ' +
  'Groovy/Kotlin compilation at runtime, plugin architectures that load/unload classes. ' +
  'Set `-XX:MetaspaceSize=256m -XX:MaxMetaspaceSize=512m` to cap it.\n\n' +
  '**Senior insight**: When monitoring JVM memory, track *process RSS* (Resident Set Size) from the OS, not just heap. ' +
  'In Kubernetes, `container_memory_working_set_bytes` from cAdvisor is the number the OOM killer uses. ' +
  'Your heap dashboard showing 70% full means nothing if the process is at 95% of container limit.\n\n' +
  '---\n\n' +
  '## GC Overhead Limit Exceeded: What It Really Means\n\n' +
  'This error is thrown when the JVM has spent more than 98% of its time in garbage collection and recovered less than 2% of the heap ' +
  'in the last several GC cycles. The JVM is spinning and making no meaningful progress.\n\n' +
  'The most common wrong response: increase `-Xmx`. This only delays the error. If the heap is full because of a leak, ' +
  'a bigger heap just means more objects accumulate before the error fires — usually 30 minutes later instead of 5 minutes.\n\n' +
  'The correct response:\n' +
  '1. Take a heap dump immediately (or set `-XX:+HeapDumpOnOutOfMemoryError` in advance)\n' +
  '2. Identify what is filling the heap using MAT retained heap analysis\n' +
  '3. Fix the reference leak or add eviction — do not touch heap size until the leak is fixed\n' +
  '4. After fixing the leak, tune heap size based on steady-state usage, not spike usage\n\n' +
  '**Senior insight**: `GC overhead limit exceeded` is a kindness — the JVM is telling you it cannot continue rather than hanging forever. ' +
  'Do not disable this check with `-XX:-UseGCOverheadLimit`. Engineers who do this convert a fast, debuggable failure into a slow, undiagnosable hang.';

// ─── CODE BASIC ─────────────────────────────────────────────────────────────

const CODE_BASIC =
  'import java.lang.ref.WeakReference;\n' +
  'import java.util.HashMap;\n' +
  'import java.util.Map;\n' +
  'import java.util.WeakHashMap;\n\n' +
  'public class GcRootDemo {\n\n' +
  '    // Static field = GC root: this map\'s entries are permanently live until explicitly removed\n' +
  '    // This is the most common memory leak pattern in production Java services\n' +
  '    private static final Map<String, Object> STATIC_CACHE = new HashMap<>();\n\n' +
  '    public static void main(String[] args) throws InterruptedException {\n' +
  '        demonstrateStrongVsWeak();\n' +
  '        demonstrateStaticRoot();\n' +
  '        demonstrateWeakHashMap();\n' +
  '    }\n\n' +
  '    static void demonstrateStrongVsWeak() throws InterruptedException {\n' +
  '        Object strong = new Object();\n' +
  '        // WeakReference does NOT prevent collection — only strong references do\n' +
  '        WeakReference<Object> weak = new WeakReference<>(strong);\n\n' +
  '        System.gc();\n' +
  '        Thread.sleep(50);\n' +
  '        System.out.println("Strong ref present -> object alive: " + (weak.get() != null)); // true\n\n' +
  '        strong = null; // remove the strong reference from this stack frame (a GC root)\n' +
  '        System.gc();\n' +
  '        Thread.sleep(50);\n' +
  '        // Now no strong reference holds this object — GC collected it\n' +
  '        System.out.println("Strong ref cleared -> object alive: " + (weak.get() != null)); // false\n' +
  '    }\n\n' +
  '    static void demonstrateStaticRoot() {\n' +
  '        // Static field is a GC root — object will NEVER be collected while the class is loaded\n' +
  '        STATIC_CACHE.put("order-123", new byte[1024 * 512]); // 512KB — never gets freed\n' +
  '        System.gc();\n' +
  '        System.out.println("Static cache entry survives GC: " + (STATIC_CACHE.get("order-123") != null)); // true\n' +
  '        // In production: every request that calls put() with a new key grows this map permanently\n' +
  '    }\n\n' +
  '    static void demonstrateWeakHashMap() throws InterruptedException {\n' +
  '        // WeakHashMap: entries are removed when the KEY has no other strong references\n' +
  '        // Useful for caches where the cache should not extend the lifetime of the key\n' +
  '        WeakHashMap<Object, String> weakMap = new WeakHashMap<>();\n' +
  '        Object key = new Object();\n' +
  '        weakMap.put(key, "payment-session-data");\n' +
  '        System.out.println("Before key release: " + weakMap.size()); // 1\n\n' +
  '        key = null; // no more strong references to key\n' +
  '        System.gc();\n' +
  '        Thread.sleep(100); // allow GC and WeakHashMap cleanup\n' +
  '        // Entry is gone because the key was collected\n' +
  '        System.out.println("After key GC\'d: " + weakMap.size()); // 0\n' +
  '    }\n' +
  '}';

const OUTPUT_BASIC =
  'Strong ref present -> object alive: true\n' +
  'Strong ref cleared -> object alive: false\n' +
  'Static cache entry survives GC: true\n' +
  'Before key release: 1\n' +
  'After key GC\'d: 0';

// ─── CODE INTERMEDIATE ───────────────────────────────────────────────────────

const CODE_INTERMEDIATE =
  '// Startup class — JVM flags that MUST be in your Kubernetes deployment manifest\n' +
  '// These belong in JAVA_TOOL_OPTIONS or _JAVA_OPTIONS env var, not hardcoded in the app\n\n' +
  '/*\n' +
  'REQUIRED JVM FLAGS FOR PRODUCTION (add to your K8s Deployment spec):\n\n' +
  'env:\n' +
  '  - name: JAVA_TOOL_OPTIONS\n' +
  '    value: >\n' +
  '      -XX:+UseG1GC\n' +
  '      -XX:MaxGCPauseMillis=200\n' +
  '      -XX:G1HeapRegionSize=16m\n' +
  '      -XX:InitiatingHeapOccupancyPercent=35\n' +
  '      -XX:G1ReservePercent=20\n' +
  '      -XX:+UseContainerSupport\n' +
  '      -XX:MaxRAMPercentage=75.0\n' +
  '      -XX:+HeapDumpOnOutOfMemoryError\n' +
  '      -XX:HeapDumpPath=/dumps/\n' +
  '      -Xlog:gc*:file=/logs/gc.log:time,uptime,level,tags:filecount=10,filesize=20m\n' +
  '      -XX:MetaspaceSize=256m\n' +
  '      -XX:MaxMetaspaceSize=512m\n' +
  '*/\n\n' +
  'import io.micrometer.core.instrument.Gauge;\n' +
  'import io.micrometer.core.instrument.MeterRegistry;\n' +
  'import io.micrometer.core.instrument.binder.MeterBinder;\n' +
  'import org.springframework.context.annotation.Bean;\n' +
  'import org.springframework.context.annotation.Configuration;\n\n' +
  'import java.lang.management.GarbageCollectorMXBean;\n' +
  'import java.lang.management.ManagementFactory;\n' +
  'import java.lang.management.MemoryMXBean;\n\n' +
  '@Configuration\n' +
  'public class GcProductionMonitoringConfig {\n\n' +
  '    // Register GC pause time as a Micrometer metric\n' +
  '    // This is what you alert on, not raw heap usage\n' +
  '    // Alert rule: rate(jvm_gc_pause_total_seconds[5m]) > 0.1 (spending >10% of time in GC)\n' +
  '    @Bean\n' +
  '    public MeterBinder gcPauseMonitor() {\n' +
  '        return (MeterRegistry registry) -> {\n' +
  '            for (GarbageCollectorMXBean gc : ManagementFactory.getGarbageCollectorMXBeans()) {\n' +
  '                // G1GC exposes: "G1 Young Generation" and "G1 Old Generation"\n' +
  '                // ZGC exposes: "ZGC" (single unified collector)\n' +
  '                Gauge.builder("jvm.gc.pause.total.seconds", gc,\n' +
  '                        g -> g.getCollectionTime() / 1000.0)\n' +
  '                    .tag("collector", gc.getName())\n' +
  '                    .description("Total wall-clock seconds spent in GC pauses for this collector")\n' +
  '                    .register(registry);\n\n' +
  '                Gauge.builder("jvm.gc.collections.total", gc,\n' +
  '                        GarbageCollectorMXBean::getCollectionCount)\n' +
  '                    .tag("collector", gc.getName())\n' +
  '                    .description("Total number of GC collections — rate of increase is your collection frequency")\n' +
  '                    .register(registry);\n' +
  '            }\n\n' +
  '            // Track non-heap memory separately — this is what heap dashboards miss\n' +
  '            MemoryMXBean memBean = ManagementFactory.getMemoryMXBean();\n' +
  '            Gauge.builder("jvm.memory.nonheap.used.bytes", memBean,\n' +
  '                    m -> m.getNonHeapMemoryUsage().getUsed())\n' +
  '                .description("Non-heap usage: metaspace + code cache. " +\n' +
  '                             "If this grows continuously, you have a classloader leak (CGLIB, plugins).")\n' +
  '                .register(registry);\n' +
  '        };\n' +
  '    }\n' +
  '}\n\n' +
  '// Actuator endpoint to check GC stats at runtime without a profiler:\n' +
  '// GET /actuator/metrics/jvm.gc.pause.total.seconds\n' +
  '// GET /actuator/metrics/jvm.memory.nonheap.used.bytes\n' +
  '// GET /actuator/metrics/jvm.memory.max  (heap ceiling)\n' +
  '// Grafana query: rate(jvm_gc_pause_total_seconds_total[5m]) per collector';

const OUTPUT_INTERMEDIATE =
  '# On startup, Micrometer registers gauges for each GC collector:\n' +
  '# Metrics available at /actuator/metrics:\n' +
  '#   jvm.gc.pause.total.seconds{collector="G1 Young Generation"}\n' +
  '#   jvm.gc.pause.total.seconds{collector="G1 Old Generation"}\n' +
  '#   jvm.gc.collections.total{collector="G1 Young Generation"}\n' +
  '#   jvm.gc.collections.total{collector="G1 Old Generation"}\n' +
  '#   jvm.memory.nonheap.used.bytes\n' +
  '# Alert threshold: rate > 0.1 (more than 10% of time spent in GC pauses)';

// ─── CODE ADVANCED ──────────────────────────────────────────────────────────

const CODE_ADVANCED =
  'import com.github.benmanes.caffeine.cache.Cache;\n' +
  'import com.github.benmanes.caffeine.cache.Caffeine;\n' +
  'import com.github.benmanes.caffeine.cache.stats.CacheStats;\n' +
  'import org.springframework.stereotype.Component;\n\n' +
  'import java.util.Map;\n' +
  'import java.util.concurrent.ConcurrentHashMap;\n' +
  'import java.util.concurrent.TimeUnit;\n\n' +
  '// ═══════════════════════════════════════════════════════════════\n' +
  '// BUG: Static ConcurrentHashMap as a session cache\n' +
  '// Symptom: Old gen grows 100MB/hour. GC logs show Mixed GC pauses\n' +
  '//          growing from 200ms to 1200ms over 6 hours. Eventually Full GC.\n' +
  '// Cause: Every unique orderId creates a permanent entry. 10K orders/hour\n' +
  '//        = 60K entries/hour = out of memory by end of business day.\n' +
  '// ═══════════════════════════════════════════════════════════════\n' +
  '@Component\n' +
  'class OrderSessionCacheBuggy {\n' +
  '    // BUG: No size limit, no TTL, no eviction. Static = GC root = never collected.\n' +
  '    private static final Map<String, OrderSession> CACHE = new ConcurrentHashMap<>();\n\n' +
  '    public void put(String orderId, OrderSession session) {\n' +
  '        CACHE.put(orderId, session); // grows permanently\n' +
  '    }\n\n' +
  '    public OrderSession get(String orderId) {\n' +
  '        return CACHE.get(orderId);\n' +
  '    }\n' +
  '}\n\n' +
  '// ═══════════════════════════════════════════════════════════════\n' +
  '// FIX: Caffeine cache with size cap and TTL\n' +
  '// Caffeine is the production JVM cache standard in 2026.\n' +
  '// Guava Cache is deprecated. Spring\'s @Cacheable can use Caffeine as backend.\n' +
  '// ═══════════════════════════════════════════════════════════════\n' +
  '@Component\n' +
  'class OrderSessionCache {\n' +
  '    private final Cache<String, OrderSession> cache = Caffeine.newBuilder()\n' +
  '        .maximumSize(50_000)                    // FIX: hard cap — old gen stays bounded\n' +
  '        .expireAfterWrite(30, TimeUnit.MINUTES) // FIX: stale sessions auto-expire\n' +
  '        .recordStats()                          // enables hit rate monitoring via Micrometer\n' +
  '        .build();\n\n' +
  '    public void put(String orderId, OrderSession session) {\n' +
  '        cache.put(orderId, session);\n' +
  '    }\n\n' +
  '    public OrderSession get(String orderId) {\n' +
  '        return cache.getIfPresent(orderId); // null on miss — no blocking, no loader\n' +
  '    }\n\n' +
  '    public CacheStats stats() {\n' +
  '        return cache.stats(); // hitRate(), evictionCount(), loadExceptionCount()\n' +
  '    }\n' +
  '}\n\n' +
  '// ── Test proving the fix ─────────────────────────────────────\n' +
  'import static org.assertj.core.api.Assertions.assertThat;\n' +
  'import org.junit.jupiter.api.Test;\n' +
  'import org.springframework.beans.factory.annotation.Autowired;\n' +
  'import org.springframework.boot.test.context.SpringBootTest;\n\n' +
  '@SpringBootTest\n' +
  'class OrderSessionCacheTest {\n\n' +
  '    @Autowired\n' +
  '    OrderSessionCache cache;\n\n' +
  '    @Test\n' +
  '    void cache_isBoundedAndEvicts() throws InterruptedException {\n' +
  '        // Insert 60,000 entries — 10,000 over the limit\n' +
  '        for (int i = 0; i < 60_000; i++) {\n' +
  '            cache.put("order-" + i, new OrderSession("user-" + i));\n' +
  '        }\n' +
  '        // Caffeine evicts synchronously during put when over limit\n' +
  '        // Before fix: CACHE.size() == 60,000 (no eviction)\n' +
  '        // After fix: evictionCount > 0, heap stays bounded\n' +
  '        assertThat(cache.stats().evictionCount()).isGreaterThan(0);\n' +
  '    }\n\n' +
  '    @Test\n' +
  '    void cache_expireAfterWrite() throws InterruptedException {\n' +
  '        // In unit tests, use a Caffeine ticker to advance time without sleeping 30 minutes\n' +
  '        // This test documents the expected behavior — full expiry test uses FakeTicker\n' +
  '        cache.put("order-expired", new OrderSession("user-1"));\n' +
  '        assertThat(cache.get("order-expired")).isNotNull();\n' +
  '        // After 30 minutes of inactivity, get("order-expired") returns null\n' +
  '    }\n' +
  '}\n\n' +
  'record OrderSession(String userId) {}';

const OUTPUT_ADVANCED =
  '# Before fix (ConcurrentHashMap):\n' +
  '# cache.size() grows without bound — 60000 entries after test\n' +
  '# GC logs show old gen growing 50-100MB/hour under production traffic\n' +
  '#\n' +
  '# After fix (Caffeine):\n' +
  '# evictionCount() > 0 — Caffeine evicted 10,000 entries to maintain maximumSize(50,000)\n' +
  '# Old gen stabilizes at steady-state after initial warmup\n' +
  '# cache.stats().hitRate() visible in Grafana for cache effectiveness monitoring';

// ─── DIAGRAM ────────────────────────────────────────────────────────────────

const PLANTUML =
  '@startuml\n' +
  'skinparam state {\n' +
  '  BackgroundColor #1e2a3a\n' +
  '  BorderColor #4a9eff\n' +
  '  FontColor #e0e0e0\n' +
  '  ArrowColor #4a9eff\n' +
  '}\n' +
  'skinparam backgroundColor #0d1117\n' +
  'skinparam fontColor #e0e0e0\n\n' +
  'title G1GC Collection Cycle: Phase Transitions\n\n' +
  '[*] --> YoungGC : Heap starts filling\n\n' +
  'state YoungGC {\n' +
  '  [*] --> STW_Young : Eden full\n' +
  '  STW_Young : Pause (parallel, all threads stopped)\n' +
  '  STW_Young : Collects: Eden + Survivor regions\n' +
  '  STW_Young : Promotes survivors to Old regions\n' +
  '  STW_Young --> [*] : Usually < 50ms\n' +
  '}\n\n' +
  'YoungGC --> ConcurrentMarking : Old gen > InitiatingHeapOccupancyPercent (45% default)\n\n' +
  'state ConcurrentMarking {\n' +
  '  [*] --> InitialMark\n' +
  '  InitialMark : Brief STW — piggybacked on Young GC\n' +
  '  InitialMark --> ConcurrentMark\n' +
  '  ConcurrentMark : Runs concurrently — app threads keep running\n' +
  '  ConcurrentMark : Identifies garbage-dense old regions\n' +
  '  ConcurrentMark --> Remark\n' +
  '  Remark : Brief STW — processes remaining references\n' +
  '  Remark --> Cleanup\n' +
  '  Cleanup : Reclaims fully empty regions immediately\n' +
  '  Cleanup --> [*]\n' +
  '}\n\n' +
  'ConcurrentMarking --> MixedGC : Marking complete, garbage map ready\n\n' +
  'state MixedGC {\n' +
  '  [*] --> STW_Mixed : G1 schedules mixed collection\n' +
  '  STW_Mixed : Pause (parallel, all threads stopped)\n' +
  '  STW_Mixed : Collects: Young regions + top garbage old regions\n' +
  '  STW_Mixed : Uses concurrent marking results to choose which old regions\n' +
  '  STW_Mixed --> [*] : Longer than Young GC pause\n' +
  '}\n\n' +
  'MixedGC --> YoungGC : Old gen reclaimed, cycle continues\n' +
  'MixedGC --> FullGC : Promotion failure or humongous alloc failure\n\n' +
  'state FullGC {\n' +
  '  [*] --> STW_Full\n' +
  '  STW_Full : CATASTROPHIC: single-threaded, entire heap\n' +
  '  STW_Full : Can pause for seconds or minutes on large heaps\n' +
  '  STW_Full : Triggered by: humongous allocation failure, promotion failure\n' +
  '  STW_Full --> [*]\n' +
  '}\n\n' +
  'FullGC --> YoungGC : Heap reclaimed — back to normal cycle\n' +
  'note right of FullGC : If you see Full GC in logs\\nyour tuning has already failed.\\nFix humongous allocations\\nor lower IHOP threshold.\n\n' +
  'note right of ConcurrentMarking : Concurrent phases use CPU\\nbut do not pause app threads.\\nHigher CPU overhead =\\nbetter throughput/latency tradeoff.\n' +
  '@enduml';

// ─── PITFALLS ────────────────────────────────────────────────────────────────

const PITFALLS = [
  '**Humongous object allocations triggering premature Mixed GC**\n\n' +
  '**Symptom**: GC logs show frequent Mixed GC pauses even with low heap utilization. `Humongous` appears in gc.log.\n\n' +
  '**Cause**: Objects larger than 50% of G1 region size bypass young gen and go directly to old gen. ' +
  'Old gen fills faster than expected, triggering concurrent marking and Mixed GC repeatedly.\n\n' +
  '**Buggy pattern**:\n' +
  '```java\n' +
  '// Serializing a 2MB response body into a single byte[] with default G1 region size 2MB\n' +
  '// This object is humongous — goes straight to old gen\n' +
  'byte[] responseBytes = objectMapper.writeValueAsBytes(largeOrderList); // > 1MB\n' +
  '```\n\n' +
  '**Fix**:\n' +
  '```bash\n' +
  '# Increase region size so the 50% threshold is larger\n' +
  '-XX:G1HeapRegionSize=16m\n' +
  '# Now objects must be > 8MB to be humongous — covers most JSON payloads\n' +
  '# OR: stream the serialization instead of materializing a single byte[]\n' +
  '```\n\n' +
  '**Detection**: `grep -i "humongous" gc.log` or GCEasy\'s "Humongous Allocations" panel.',

  '**Setting -Xms equal to -Xmx to "prevent resizing"**\n\n' +
  '**Symptom**: Service startup is slow; container consumes max memory immediately on deploy even under no load.\n\n' +
  '**Cause**: Setting `-Xms4g -Xmx4g` tells the JVM to commit the full 4GB of virtual memory to physical pages at startup. ' +
  'In Kubernetes, this fights with other pods for memory from the first second.\n\n' +
  '**Buggy JVM flags**:\n' +
  '```bash\n' +
  '# Wrong: forces immediate full heap commit, wastes memory at startup\n' +
  '-Xms4g -Xmx4g\n' +
  '```\n\n' +
  '**Fix**:\n' +
  '```bash\n' +
  '# Right: start small, grow as needed, cap at 75% of container limit\n' +
  '-XX:InitialRAMPercentage=25.0 -XX:MaxRAMPercentage=75.0 -XX:+UseContainerSupport\n' +
  '```\n\n' +
  '**Detection**: Check pod memory usage at startup vs steady state in Grafana `container_memory_working_set_bytes`.',

  '**Not setting UseContainerSupport in Kubernetes**\n\n' +
  '**Symptom**: JVM allocates heap based on host node memory (64GB), not container limit (2GB). OOMKilled immediately.\n\n' +
  '**Cause**: Without `-XX:+UseContainerSupport` (default ON in Java 11+, but must be verified), ' +
  'JVM reads `/proc/meminfo` which shows host memory, not cgroup limits.\n\n' +
  '**Buggy scenario**:\n' +
  '```bash\n' +
  '# Java 8u131-191 without this flag: JVM sees 64GB host, allocates 16GB heap in a 2GB container\n' +
  '-server  # no container support flags\n' +
  '```\n\n' +
  '**Fix**:\n' +
  '```bash\n' +
  '-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0\n' +
  '# Verify it works: kubectl exec <pod> -- java -XX:+PrintFlagsFinal -version | grep MaxHeap\n' +
  '```\n\n' +
  '**Detection**: `kubectl exec <pod> -- java -XX:+PrintFlagsFinal -version 2>&1 | grep "MaxHeapSize"` — should be ~75% of container limit.',

  '**ThreadLocal not cleared in thread pool threads**\n\n' +
  '**Symptom**: Heap dump shows thousands of request-scoped objects held in `ThreadLocalMap.Entry[]` in thread pool threads. ' +
  'MAT retained heap trace leads to `java.lang.Thread` → `threadLocals` → your object.\n\n' +
  '**Cause**: Thread pool threads are reused. A `ThreadLocal` set during request handling and never removed ' +
  'stays on that thread forever — one accumulated object per request that thread handled.\n\n' +
  '**Buggy code**:\n' +
  '```java\n' +
  'private static final ThreadLocal<TenantContext> TENANT = new ThreadLocal<>();\n' +
  'public void handle(HttpRequest req) {\n' +
  '    TENANT.set(new TenantContext(req.getHeader("X-Tenant")));\n' +
  '    processOrder(); // TENANT is never removed — leaks one TenantContext per request on this thread\n' +
  '}\n' +
  '```\n\n' +
  '**Fix**:\n' +
  '```java\n' +
  'public void handle(HttpRequest req) {\n' +
  '    try {\n' +
  '        TENANT.set(new TenantContext(req.getHeader("X-Tenant")));\n' +
  '        processOrder();\n' +
  '    } finally {\n' +
  '        TENANT.remove(); // ALWAYS in finally — even if processOrder() throws\n' +
  '    }\n' +
  '}\n' +
  '```\n\n' +
  '**Detection**: MAT heap dump → OQL: `SELECT * FROM java.lang.ThreadLocal$ThreadLocalMap$Entry`.',

  '**Increasing -Xmx to fix GC Overhead Limit Exceeded**\n\n' +
  '**Symptom**: Error fires again 30 minutes after increasing heap. Or never fires again but p99 stays elevated.\n\n' +
  '**Cause**: GC overhead limit exceeded means GC is spinning and recovering <2% of heap. ' +
  'The heap is full because of a leak, not because it is sized too small. More heap = more objects accumulate before the error = same result, later.\n\n' +
  '**Buggy response**:\n' +
  '```bash\n' +
  '# Wrong: delays the inevitable by 2x\n' +
  '-Xmx2g -> -Xmx4g  # "fixed" the error for today, but it fires again tomorrow\n' +
  '```\n\n' +
  '**Fix**:\n' +
  '```bash\n' +
  '# 1. Get a heap dump at the moment of the error:\n' +
  '-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/dumps/\n' +
  '# 2. Open in Eclipse MAT, run Leak Suspects report\n' +
  '# 3. Fix the reference that is accumulating objects\n' +
  '# 4. THEN tune heap size based on steady-state usage\n' +
  '```\n\n' +
  '**Detection**: MAT "Leak Suspects" report. Look for objects with retained heap >20% of total heap.',

  '**Monitoring only heap usage, missing off-heap growth**\n\n' +
  '**Symptom**: Process gets OOMKilled by Kubernetes but heap dashboard shows 60% utilization. No heap OOM in logs.\n\n' +
  '**Cause**: Total process memory = heap + metaspace + code cache + direct buffers + thread stacks. ' +
  'Heap dashboard shows one component. OOM killer uses total RSS.\n\n' +
  '**Buggy monitoring**:\n' +
  '```yaml\n' +
  '# Grafana alert only on heap:\n' +
  '# jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"} > 0.85\n' +
  '# This misses metaspace growth from CGLIB proxy inflation\n' +
  '```\n\n' +
  '**Fix**:\n' +
  '```yaml\n' +
  '# Alert on container RSS from cAdvisor — what Kubernetes OOM killer watches:\n' +
  '# container_memory_working_set_bytes / kube_pod_container_resource_limits_memory_bytes > 0.85\n' +
  '# Also monitor: jvm_memory_used_bytes{area="nonheap"} for metaspace trends\n' +
  '```\n\n' +
  '**Detection**: `kubectl exec <pod> -- cat /proc/<pid>/status | grep VmRSS` — compare to container limit.',

  '**Calling System.gc() in production code**\n\n' +
  '**Symptom**: Periodic latency spikes that correlate with specific code paths (e.g., after batch job, after report generation). ' +
  'GC logs show a Full GC triggered at odd times not correlated with heap pressure.\n\n' +
  '**Cause**: `System.gc()` is a hint to the JVM to run a full GC. Most JVMs honor it. ' +
  'On G1, this triggers a Full GC — single-threaded, stops all threads for seconds.\n\n' +
  '**Buggy code**:\n' +
  '```java\n' +
  'public void generateMonthlyReport() {\n' +
  '    List<Order> orders = orderRepo.findAllForMonth(month); // large result set\n' +
  '    Report report = reportGenerator.generate(orders);\n' +
  '    orders = null; // "help GC" — does nothing useful\n' +
  '    System.gc();   // BUG: triggers Full GC, pauses all threads for 2 seconds\n' +
  '    return report;\n' +
  '}\n' +
  '```\n\n' +
  '**Fix**:\n' +
  '```java\n' +
  'public Report generateMonthlyReport() {\n' +
  '    // Remove System.gc() entirely — trust the GC\n' +
  '    // If concerned about memory: stream the query instead of loading all into a List\n' +
  '    try (Stream<Order> orders = orderRepo.streamAllForMonth(month)) {\n' +
  '        return reportGenerator.generate(orders);\n' +
  '    }\n' +
  '}\n' +
  '```\n\n' +
  '**Detection**: `grep -c "System.gc" $(find src -name "*.java")` — should return 0 in production code.',

  '**Ignoring GC logs until production is on fire**\n\n' +
  '**Symptom**: Every GC incident is a surprise. Tuning is reactive and based on guesswork.\n\n' +
  '**Cause**: GC logs are disabled or not collected, so there is no historical baseline to compare against during an incident.\n\n' +
  '**Buggy practice** (absent JVM flags):\n' +
  '```bash\n' +
  '# No GC logging configured — flying blind in production\n' +
  'java -jar payment-service.jar\n' +
  '```\n\n' +
  '**Fix**:\n' +
  '```bash\n' +
  '# Enable structured GC logging with rotation — ~1MB/hour under normal load\n' +
  'java \\\n' +
  '  -Xlog:gc*:file=/logs/gc.log:time,uptime,level,tags:filecount=10,filesize=20m \\\n' +
  '  -jar payment-service.jar\n' +
  '# Review gc.log weekly — spot trends before they become incidents\n' +
  '# Upload to GCEasy for visual analysis: gcEasy.io (free tier)\n' +
  '```\n\n' +
  '**Detection**: `ls -la /logs/gc.log` on each pod — if it does not exist, you are flying blind.'
];

// ─── EXERCISE ────────────────────────────────────────────────────────────────

const EXERCISE_PROBLEM =
  '## Black Friday Post-Mortem: Payment Service Latency Regression\n\n' +
  'You are the senior engineer on the payments team at an e-commerce company. After Black Friday, ' +
  'the SRE team has handed you this incident summary:\n\n' +
  '**Incident timeline:**\n' +
  '- 09:00 — Traffic ramps to 8x normal load\n' +
  '- 09:45 — p99 latency begins climbing: 200ms → 500ms → 1.2 seconds\n' +
  '- 10:15 — On-call restarts pods. Latency drops. p50 is normal.\n' +
  '- 10:40 — Latency spikes again. Pattern repeats every ~25 minutes.\n' +
  '- 11:00 — Engineering escalates. Pods increased from 3 to 9. Latency still spikes.\n' +
  '- 12:30 — Feature freeze declared. Team unable to identify root cause.\n\n' +
  '**What you have to work with:**\n' +
  '- GC log excerpt showing 400-800ms pauses correlating exactly with latency spikes\n' +
  '- Heap dump taken during one spike (old gen at 95% utilization)\n' +
  '- MAT analysis showing: `byte[]` objects account for 68% of retained heap, ' +
  'traced to `OrderPayloadSerializer.serialize()` via a static cache field\n' +
  '- Current JVM flags: `-Xmx2g -Xms2g -XX:+UseG1GC` (no GC logging flags)\n' +
  '- Service serializes payment orders to JSON using Jackson, average payload size 1.8MB\n\n' +
  '**Your task:**\n\n' +
  '1. Based on the MAT analysis, identify the root cause. What GC mechanism explains why ' +
  'adding more pods did not help and why the pattern repeats every 25 minutes?\n\n' +
  '2. Write the corrected JVM flags this service should run with. ' +
  'Justify each flag you add or change.\n\n' +
  '3. The Jackson serialization produces 1.8MB `byte[]` objects per payment request at peak load. ' +
  'Write a code change to the serialization approach that eliminates the humongous allocation, ' +
  'without changing the API contract.\n\n' +
  '4. Write three Grafana alert rules (as PromQL expressions with threshold comments) that would have ' +
  'caught this problem before it became a customer-facing incident.';

const EXERCISE_HINTS = [
  'A 1.8MB byte[] with the default G1 region size (2MB) — calculate whether this is a humongous allocation.',
  'The 25-minute repeat pattern corresponds to a GC cycle: what triggers G1 Mixed GC? What metric determines when it starts?',
  'Adding more pods does not fix a per-pod memory leak or humongous allocation problem — each new pod has the same issue.',
  'For hint 3: Jackson\'s ObjectMapper can write to an OutputStream directly instead of returning a byte[]. Consider how this changes allocation behavior.',
  'For alert rules: think about what GC metric would be elevated 5-10 minutes before users notice latency spikes.'
];

const EXERCISE_SOLUTION =
  '## Root Cause Analysis\n\n' +
  '**1.8MB byte[] with 2MB G1 regions = humongous allocation.**\n\n' +
  'G1 classifies objects as humongous when they exceed 50% of a single region. With the default region size (auto-calculated as 2MB for a 2GB heap), ' +
  'any object >1MB is humongous. The 1.8MB `byte[]` from Jackson serialization goes directly to old gen, bypassing young gen entirely.\n\n' +
  'At 8x load, the team was creating ~8x as many of these allocations per second. Old gen filled faster. ' +
  'G1\'s concurrent marking triggered at 45% old gen occupancy (IHOP default), then Mixed GC ran, pausing all threads for 400-800ms. ' +
  'This is the 25-minute cycle: old gen fills → Mixed GC → pauses → old gen starts filling again.\n\n' +
  '**Adding pods did not help** because each pod independently had the same allocation pattern. ' +
  'A memory pressure problem does not scale away — it multiplies.\n\n' +
  '## Corrected JVM Flags\n\n' +
  '```bash\n' +
  '-XX:+UseG1GC                           # explicit (default Java 9+)\n' +
  '-XX:G1HeapRegionSize=16m               # FIX: 1.8MB < 8MB (50% of 16MB) — no longer humongous\n' +
  '-XX:MaxGCPauseMillis=200               # target pause time — G1 tries to honor this\n' +
  '-XX:InitiatingHeapOccupancyPercent=35  # start marking earlier, reducing Mixed GC pause at 45%\n' +
  '-XX:G1ReservePercent=20               # keep 20% headroom to avoid promotion failure\n' +
  '-XX:+UseContainerSupport              # read cgroup limits in Kubernetes\n' +
  '-XX:MaxRAMPercentage=75.0             # set heap as 75% of container memory\n' +
  '-XX:+HeapDumpOnOutOfMemoryError\n' +
  '-XX:HeapDumpPath=/dumps/\n' +
  '-Xlog:gc*:file=/logs/gc.log:time,uptime,level,tags:filecount=10,filesize=20m\n' +
  '```\n\n' +
  '## Code Fix: Eliminate Humongous byte[] Allocation\n\n' +
  '```java\n' +
  'import com.fasterxml.jackson.databind.ObjectMapper;\n' +
  'import org.springframework.http.MediaType;\n' +
  'import org.springframework.web.bind.annotation.*;\n\n' +
  'import jakarta.servlet.http.HttpServletResponse;\n' +
  'import java.io.IOException;\n\n' +
  '// BUG: Materializes entire JSON into a byte[] — 1.8MB humongous allocation per request\n' +
  '@GetMapping("/payments/{id}")\n' +
  'public ResponseEntity<byte[]> getPaymentBuggy(@PathVariable String id) {\n' +
  '    Payment payment = paymentService.findById(id);\n' +
  '    byte[] json = objectMapper.writeValueAsBytes(payment); // BUG: single large byte[]\n' +
  '    return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(json);\n' +
  '}\n\n' +
  '// FIX: Stream directly to response output — Jackson writes in chunks, no large byte[] created\n' +
  '@GetMapping("/payments/{id}")\n' +
  'public void getPaymentFixed(\n' +
  '        @PathVariable String id,\n' +
  '        HttpServletResponse response) throws IOException {\n' +
  '    Payment payment = paymentService.findById(id);\n' +
  '    response.setContentType(MediaType.APPLICATION_JSON_VALUE);\n' +
  '    // ObjectMapper writes to output stream in 8KB chunks — no humongous allocation\n' +
  '    objectMapper.writeValue(response.getOutputStream(), payment);\n' +
  '}\n' +
  '```\n\n' +
  '## Grafana Alert Rules\n\n' +
  '```promql\n' +
  '# Alert 1: GC pause rate — fires before users notice\n' +
  '# Threshold: >5% of time spent in GC pauses over 5 minutes\n' +
  'rate(jvm_gc_pause_seconds_sum{collector="G1 Old Generation"}[5m])\n' +
  '  / rate(jvm_gc_pause_seconds_count{collector="G1 Old Generation"}[5m]) > 0.3\n\n' +
  '# Alert 2: Old gen occupancy climbing — canary before Mixed GC explodes\n' +
  '# Threshold: old gen >70% after a GC cycle (should stabilize lower)\n' +
  'jvm_memory_used_bytes{area="heap", id="G1 Old Gen"}\n' +
  '  / jvm_memory_max_bytes{area="heap", id="G1 Old Gen"} > 0.70\n\n' +
  '# Alert 3: Container RSS approaching limit — catches off-heap surprises\n' +
  '# Threshold: >85% of container memory limit\n' +
  'container_memory_working_set_bytes\n' +
  '  / kube_pod_container_resource_limits{resource="memory"} > 0.85\n' +
  '```';

// ─── INTERVIEW ───────────────────────────────────────────────────────────────

const INTERVIEW_CONCEPTUAL = [
  {
    question: 'What is a GC root and why does it matter for diagnosing memory leaks?',
    answer:
      'A GC root is any reference the JVM considers unconditionally live — it does not need to be reachable from another object to survive collection. ' +
      'GC roots include: active thread stack frames (local variables), static fields, JNI references from native code, and active thread objects themselves.\n\n' +
      'Any object reachable by following a chain of references starting from a GC root is live and cannot be collected. ' +
      'Memory leaks in Java are always caused by an unintended reference chain from a GC root to an object that should have been discarded.\n\n' +
      'In practice: a static `Map` is a GC root via the class object. Every value in that map stays live as long as the map contains its key. ' +
      'This is why unbounded static caches are the most common cause of Java memory leaks — the developer thinks the object is "done" but the static field is still holding it.\n\n' +
      'Diagnosing leaks means finding which GC root anchors the leaked objects. Eclipse MAT\'s "Path to GC Root" feature does this automatically. ' +
      'It shows you exactly which field, in which class, is keeping your 500K leaked objects alive.',
    followUps: [
      {
        question: 'If I set an object reference to null, is it immediately eligible for GC?',
        answer:
          'Setting a local variable to null removes one reference. The object is eligible for collection *only when all references to it are gone*. ' +
          'If the same object is stored in a list, a map, or another field, setting the local variable to null does nothing. ' +
          'The GC traces all paths from all roots — one removed path is irrelevant if others exist.'
      },
      {
        question: 'What makes a ThreadLocal a particularly dangerous GC root pattern?',
        answer:
          'Thread objects are GC roots. `Thread.threadLocals` is a field on each Thread that holds the `ThreadLocalMap`. ' +
          'In a thread pool, threads are never collected — they live for the lifetime of the pool. ' +
          'Any `ThreadLocal` value set on a pool thread and not removed via `threadLocal.remove()` stays live for the entire pool lifetime. ' +
          'Multiply by the number of requests handled by that thread, and you have a classic slow memory leak ' +
          'that only shows up in production under sustained load.'
      }
    ]
  },
  {
    question: 'Explain the difference between G1GC Young GC, Mixed GC, and Full GC.',
    answer:
      '**Young GC**: Stop-the-world, parallel. Collects all Eden and Survivor regions. Objects that survive a threshold number of young GCs are promoted to old gen regions. ' +
      'Pauses typically 10-100ms. Frequent and expected.\n\n' +
      '**Mixed GC**: Stop-the-world, parallel. Triggered after a concurrent marking cycle completes. ' +
      'Collects all young regions AND a subset of old gen regions identified as garbage-dense during concurrent marking. ' +
      'Longer pauses than Young GC. Should be infrequent — if you see them every minute, old gen is filling too fast.\n\n' +
      '**Full GC**: Stop-the-world, single-threaded. The nuclear option. Triggered when G1 cannot keep up — usually promotion failure ' +
      '(not enough old gen space to promote survivors) or humongous allocation failure. ' +
      'On a 4GB heap, Full GC can take 2-5 seconds. On a 32GB heap, tens of seconds. ' +
      'If you see Full GC in your production logs, your configuration has failed and you need to fix it before the next traffic spike.',
    followUps: [
      {
        question: 'What specifically triggers a G1 Full GC? How do you prevent it?',
        answer:
          'Full GC is triggered by: (1) promotion failure — not enough old gen space when young GC tries to promote survivors; ' +
          '(2) humongous allocation failure — no contiguous regions for a humongous object; ' +
          '(3) concurrent marking cannot keep pace with allocation rate.\n\n' +
          'Prevention: lower `InitiatingHeapOccupancyPercent` to start marking earlier, increase `G1ReservePercent` for headroom, ' +
          'fix humongous allocations by increasing `G1HeapRegionSize`, reduce allocation rate by fixing the root cause (unbounded caches, large batch operations).'
      },
      {
        question: 'Mixed GC uses concurrent marking results. What happens if allocation outpaces concurrent marking?',
        answer:
          'If the application allocates objects faster than G1 can complete a concurrent marking cycle, old gen fills before marking finishes. ' +
          'G1 cannot determine which old regions are most garbage-dense, so it cannot run an effective Mixed GC. ' +
          'Result: promotion failure → Full GC. This is why reducing IHOP (so marking starts earlier) is often the correct first tuning step ' +
          'for services with high old gen allocation rates.'
      }
    ]
  },
  {
    question: 'What is a humongous object in G1GC and why does it cause problems?',
    answer:
      'G1GC classifies an object as humongous when its size exceeds 50% of a single G1 region size. ' +
      'Humongous objects are allocated directly in old gen regions (specifically "humongous regions"), bypassing the young generation entirely.\n\n' +
      'Problems this causes:\n' +
      '1. **Premature old gen pressure**: Old gen fills faster than the promotion-from-young pathway would predict\n' +
      '2. **Concurrent marking triggered early**: G1 starts Mixed GC preparation sooner than necessary\n' +
      '3. **Fragmentation**: Humongous regions cannot be shared with other objects, wasting space when the humongous object is collected\n' +
      '4. **Premature Full GC**: If old gen fills too fast for marking to keep up\n\n' +
      'Common sources: large byte arrays from JSON serialization, bulk database query results materialized into `List`, large files read into memory.\n\n' +
      'Fix: Increase `-XX:G1HeapRegionSize` to make the 50% threshold larger, OR restructure the code to avoid creating large objects (streaming instead of batching).',
    followUps: [
      {
        question: 'How would you find what is creating humongous allocations without access to a profiler?',
        answer:
          '`grep -i "humongous" gc.log` identifies when they occur. ' +
          'Then use `-XX:+G1PrintRegionLivenessInfo` (diagnostic flag, not production) or async-profiler\'s allocation profiling mode: ' +
          '`async-profiler -e alloc -d 30 -f humongous.html <pid>` to identify the allocation site. ' +
          'The JFR (Java Flight Recorder) memory tab also shows allocation by call stack without attaching a heavy profiler.'
      },
      {
        question: 'If you increase G1HeapRegionSize, what is the trade-off?',
        answer:
          'Larger regions mean coarser-grained collection. G1 tracks garbage density per-region — with 32MB regions, a region with 1MB of garbage and 31MB of live data ' +
          'cannot be collected efficiently. G1 may skip regions it would have collected with smaller granularity, leading to less effective old gen reclamation. ' +
          'The correct region size is one where your "large" allocations are not humongous, but not so large that granularity is lost. ' +
          'Start at 16MB for services with 1-2MB payloads.'
      }
    ]
  },
  {
    question: 'Why does ZGC achieve sub-millisecond pause times while G1 cannot?',
    answer:
      'G1\'s Mixed GC must stop all application threads to move live objects during compaction — it cannot do concurrent compaction. ' +
      'Pause time grows with the amount of live data being moved, so large heaps = long pauses.\n\n' +
      'ZGC achieves concurrent compaction by inserting **load barriers** at every object field read. ' +
      'When an application thread reads a reference, the load barrier checks whether the object has been relocated by the GC. ' +
      'If it has, the barrier transparently updates the reference and returns the new location. ' +
      'This means ZGC can move objects while application threads are running — threads are automatically redirected.\n\n' +
      'ZGC\'s stop-the-world phases are minimal: root scanning and stack scanning at the beginning and end of a marking cycle. ' +
      'These are bounded by thread count and stack depth, not heap size — hence sub-millisecond at any heap size.\n\n' +
      'Trade-off: load barriers consume CPU on every object read. ZGC has ~10-15% higher CPU overhead than G1 ' +
      'and slightly lower throughput. For latency-sensitive workloads (payment APIs, real-time systems), this trade is almost always worth it.',
    followUps: [
      {
        question: 'When would you NOT switch from G1 to ZGC?',
        answer:
          'Batch processing, ETL pipelines, and throughput-first workloads where occasional GC pauses are acceptable in exchange for higher raw throughput. ' +
          'Very small heaps (<4GB) where G1 pause times are already under 50ms — the load barrier overhead adds CPU cost without meaningful benefit. ' +
          'Services where CPU is the bottleneck — adding GC overhead from concurrent work directly reduces throughput. ' +
          'Also: if your library stack uses heavy `synchronized` blocks, ZGC\'s concurrent phases can interfere with contention patterns.'
      },
      {
        question: 'How does Shenandoah differ from ZGC in its approach to concurrent compaction?',
        answer:
          'Shenandoah uses forwarding pointers rather than load barriers. When an object is relocated, Shenandoah installs a forwarding pointer in the old location\'s object header. ' +
          'Threads reading the old address find the forwarding pointer and follow it to the new location. ' +
          'Both achieve concurrent compaction but with different metadata overhead. ZGC uses colored pointers (high bits of the 64-bit pointer encode GC state), ' +
          'making reference checks faster. Shenandoah\'s forwarding approach is simpler but has slightly higher overhead per relocated object.'
      }
    ]
  },
  {
    question: 'Walk me through your systematic GC tuning workflow.',
    answer:
      '**Step 1 — Enable GC logging before touching any flags:**\n' +
      '`-Xlog:gc*:file=/logs/gc.log:time,uptime,level,tags:filecount=10,filesize=20m`\n\n' +
      '**Step 2 — Collect logs under realistic production load.** Spot-checking under development load produces meaningless results.\n\n' +
      '**Step 3 — Analyze pause patterns.** Upload to GCEasy or grep for:\n' +
      '- `Pause Young` → Young GC — expected\n' +
      '- `Pause Mixed` → Old gen collection — check frequency\n' +
      '- `Pause Full` → Stop everything immediately\n' +
      '- `Humongous` → Allocation problem\n\n' +
      '**Step 4 — Identify the bottleneck.** Mixed GC too frequent? Lower IHOP. Mixed GC pauses too long? Tune MaxGCPauseMillis. Full GC? Fix allocation problem.\n\n' +
      '**Step 5 — Change one flag at a time.** Measure under the same load. Attribute the change to the flag.\n\n' +
      '**Step 6 — If G1 cannot meet your latency target after exhausting tuning options, evaluate ZGC.**\n\n' +
      'The most expensive mistake: changing the GC algorithm in step 1 before exhausting G1 tuning options.',
    followUps: [
      {
        question: 'How do you baseline GC performance before tuning?',
        answer:
          'Collect three metrics as your baseline before any change: (1) Young GC frequency (collections/min) and average pause, ' +
          '(2) Mixed GC frequency and average pause, (3) p99 application latency correlated with GC pause times. ' +
          'This baseline is what you compare against after each flag change. Without a baseline, you cannot claim your tuning worked.'
      },
      {
        question: 'MaxGCPauseMillis is described as a "target" not a "limit." What does that mean in practice?',
        answer:
          'G1 uses `MaxGCPauseMillis` as a soft target — it tries to meet it by adjusting the size of its collection sets (fewer regions per Mixed GC). ' +
          'However, G1 will exceed the target when it has no choice: during Full GC, during Initial Mark piggybacked on Young GC, or when promotion failure forces an emergency collection. ' +
          'If you set `MaxGCPauseMillis=50` and G1 consistently exceeds 200ms, the problem is allocation rate or humongous objects — not the target value.'
      }
    ]
  },
  {
    question: 'What is the difference between shallow heap and retained heap in Eclipse MAT?',
    answer:
      'Shallow heap is the memory consumed by the object itself — its fields and header. A `HashMap` with 100K entries has a small shallow heap (header + a few reference fields).\n\n' +
      'Retained heap is how much memory would be freed if this object were collected — including everything reachable only through this object. ' +
      'That same `HashMap` with 100K entries has an enormous retained heap: the `HashMap` itself + the entry array + all 100K key objects + all 100K value objects.\n\n' +
      'Memory leak analysis requires retained heap, not shallow heap. An object with 48 bytes of shallow heap can retain 2GB of retained heap. ' +
      'MAT\'s Leak Suspects report automatically identifies the objects with the largest retained heap and traces their path to a GC root — ' +
      'this path is the reference chain keeping your leaked objects alive.',
    followUps: [
      {
        question: 'How would you take a heap dump from a live Kubernetes pod without restarting it?',
        answer:
          '`kubectl exec <pod-name> -- jmap -dump:format=b,file=/dumps/heap.hprof <pid>` — note: jmap can cause the JVM to pause briefly during dump. ' +
          'For production-safe dumps, use JDK Mission Control (JMC) or async-profiler which cause shorter pauses. ' +
          'Better: set `-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/dumps/` in advance so the dump is captured automatically at the moment of OOM, ' +
          'then copy it out with `kubectl cp <pod>:/dumps/heap.hprof ./heap.hprof`.'
      },
      {
        question: 'What is a dominator tree in MAT and when do you use it?',
        answer:
          'A dominator in graph theory: object A dominates object B if every path from a GC root to B must pass through A. ' +
          'The dominator tree in MAT shows the "ownership" structure — which object, if collected, would also free all objects it dominates. ' +
          'Use it when Leak Suspects does not give a clear answer: sort the dominator tree by retained heap descending, ' +
          'and the top entries show you exactly which objects are holding the most memory hostage.'
      }
    ]
  },
  {
    question: 'What is off-heap memory and what are its most common sources in a Java service?',
    answer:
      'Off-heap memory is any JVM process memory outside the Java heap. It is not managed by the garbage collector and not visible in heap metrics.\n\n' +
      'Major sources:\n' +
      '- **Metaspace**: Class metadata. Grows when new classes are loaded — CGLIB proxies (Spring AOP), Groovy compilation, OSGi plugins\n' +
      '- **Code cache**: JIT-compiled native code. Bounded by `-XX:ReservedCodeCacheSize` (default 240MB)\n' +
      '- **Direct ByteBuffer**: `ByteBuffer.allocateDirect()` — Netty, NIO, Kafka clients, Java NIO channels all use this heavily\n' +
      '- **Thread stacks**: Each thread uses `-Xss` of native memory (default ~512KB-1MB per thread)\n' +
      '- **JVM internal overhead**: GC metadata, JIT compiler itself\n\n' +
      'A container with `-Xmx2g` in a 3GB pod can be OOMKilled at the OS level while heap shows 60% — because metaspace + code cache + direct buffers consumed the remaining 1GB.\n\n' +
      'Monitor with: `jcmd <pid> VM.native_memory` or `cat /proc/<pid>/status | grep VmRSS`.',
    followUps: [
      {
        question: 'How does Direct ByteBuffer memory get freed if it is off-heap and not GC-managed?',
        answer:
          'Direct ByteBuffer registers a `Cleaner` — a `PhantomReference` — with the garbage collector. When the ByteBuffer object on the heap is collected, ' +
          'the GC enqueues the Cleaner, which triggers native deallocation of the off-heap memory. ' +
          'The problem: if heap GC is infrequent (large heap, low allocation rate), ByteBuffer objects may stay live for a long time, ' +
          'holding off-heap memory that the process RSS grows to accommodate. ' +
          'Calling `((DirectBuffer) buffer).cleaner().clean()` explicitly frees it immediately — but is not usually necessary if the buffer\'s lifecycle is well-managed.'
      },
      {
        question: 'What causes Metaspace to grow unboundedly in a Spring application?',
        answer:
          'CGLIB proxy generation: every `@Configuration` class and every AOP-proxied bean generates synthetic classes at startup. ' +
          'For most applications, this is a one-time cost. It becomes unbounded when classes are generated dynamically at runtime — ' +
          'Groovy/Kotlin scripts evaluated at request time, plugin architectures that load/unload classloaders, ' +
          'or reflection-heavy frameworks that generate accessor classes per call. ' +
          'Set `-XX:MaxMetaspaceSize=512m` to cap it and fail fast rather than growing until OOM.'
      }
    ]
  },
  {
    question: 'How do GC tuning decisions differ between a latency-sensitive payment API and a batch ETL pipeline?',
    answer:
      'The optimization target is fundamentally different:\n\n' +
      '**Payment API (latency-sensitive):** Every GC pause shows up as a p99 latency spike that customers experience. ' +
      'Optimize for pause time. Acceptable trade-offs: higher CPU overhead, lower raw throughput. ' +
      'Configuration: G1GC with aggressive `MaxGCPauseMillis=100`, lower IHOP, or ZGC if G1 cannot hit targets.\n\n' +
      '**Batch ETL (throughput-first):** Processing speed matters, not individual pause times. ' +
      'A 2-second GC pause during a 4-hour batch job is irrelevant. ' +
      'Optimize for throughput: more time running application code, less time in GC overhead. ' +
      'Configuration: G1GC or ParallelGC with larger `MaxGCPauseMillis`, larger IHOP (defer mixed GC), larger young gen to reduce promotion frequency.\n\n' +
      'Using ZGC on a batch workload wastes CPU on load barriers without any latency benefit. ' +
      'Using ParallelGC on a payment API creates seconds-long pauses under load. ' +
      'The algorithm choice must follow the workload\'s optimization target.',
    followUps: [
      {
        question: 'A service is both latency-sensitive for online requests and runs a nightly batch job. How do you handle GC for both?',
        answer:
          'Options: (1) Run the batch job in a separate JVM process with different GC config — cleanest but requires separate deployment. ' +
          '(2) Schedule batch work during off-peak hours and accept GC pauses then. ' +
          '(3) Use ZGC for everything — it serves both adequately (low latency online, decent batch throughput). ' +
          '(4) Use adaptive JVM flags via JMX or a flag file that can be changed between batch and online modes — fragile and not recommended.'
      }
    ]
  }
];

const INTERVIEW_CODE_BASED = [
  {
    question:
      'What does this GC log line indicate and what should your response be?\n\n' +
      '```\n' +
      '[2026-01-15T09:47:23.445+0000][gc] GC(3847) Pause Full (Allocation Failure) 3892M->1204M(4096M) 4328.441ms\n' +
      '```',
    answer:
      'This is a Full GC triggered by allocation failure. Breaking it down:\n\n' +
      '- `Pause Full` → single-threaded, catastrophic stop-the-world\n' +
      '- `Allocation Failure` → G1 could not allocate a new object because old gen is full\n' +
      '- `3892M->1204M(4096M)` → before: 3892MB used; after: 1204MB used; heap size: 4096MB\n' +
      '- `4328.441ms` → 4.3 seconds of total application pause\n\n' +
      'Response: This is a P1 incident in a latency-sensitive service. Immediate actions:\n' +
      '1. Check if this is repeating — `grep "Pause Full" gc.log | wc -l` for frequency\n' +
      '2. Look for `Humongous` or `Promotion Failed` immediately before this line\n' +
      '3. Take a heap dump: `jmap -dump:format=b,file=heap.hprof <pid>`\n' +
      '4. If humongous: increase `G1HeapRegionSize`. If promotion failure: lower IHOP or reduce allocation rate\n' +
      '5. The 3892M → 1204M gap (2688MB freed) suggests a real leak is not the immediate cause — this was likely a humongous allocation failure',
    followUps: [
      {
        question: 'The Full GC freed 2.7GB. Does that mean the application is healthy?',
        answer:
          'No. Full GC should never happen in a tuned G1 configuration. The fact that 2.7GB was freed means old gen accumulated garbage G1 could not collect via Mixed GC fast enough. ' +
          'Root causes: Mixed GC not running frequently enough (IHOP too high), humongous allocations bypassing young gen, or allocation rate exceeding marking speed. ' +
          'The immediate Full GC "fixed" the symptom — the underlying pattern will repeat.'
      }
    ]
  },
  {
    question:
      'What is wrong with this code from a GC perspective?\n\n' +
      '```java\n' +
      'public class ReportService {\n' +
      '    private static final List<Report> REPORT_CACHE = new ArrayList<>();\n' +
      '    \n' +
      '    public void generateAndCache(String month) {\n' +
      '        List<Order> orders = orderRepo.findAllForMonth(month);\n' +
      '        Report report = new Report(orders);\n' +
      '        REPORT_CACHE.add(report);\n' +
      '    }\n' +
      '}\n' +
      '```',
    answer:
      'Three GC problems:\n\n' +
      '1. **Static List = GC root = unbounded growth**: `REPORT_CACHE` is a static field, making it a GC root. Every `Report` added stays live forever — never collected. ' +
      'This is a textbook memory leak.\n\n' +
      '2. **`orders` List held by Report**: The `Report` constructor likely stores a reference to the `orders` list. Every report keeps its entire order dataset in memory.\n\n' +
      '3. **No eviction**: Old reports are never removed. After 12 months of daily reports, you have 12 months of order data in memory.\n\n' +
      'Fix: Replace static `ArrayList` with a Caffeine cache with TTL and max size. Store only the rendered report data, not the raw order list. ' +
      '`Caffeine.newBuilder().maximumSize(12).expireAfterWrite(24, TimeUnit.HOURS).build()`',
    followUps: [
      {
        question: 'If you used a WeakReference to hold each Report in the list, would that fix the leak?',
        answer:
          'Partially. WeakReferences allow the GC to collect the Report when no strong references exist. But if any other code holds a strong reference to the Report (e.g., the calling method), ' +
          'the weak reference stays valid. WeakReference is appropriate for caches where the cache should not be the reason the object stays alive. ' +
          'It does not address the unbounded growth of the list itself — you still accumulate WeakReference wrappers without eviction. ' +
          'Caffeine with TTL is the correct solution: it manages both the size cap and the reference lifecycle.'
      }
    ]
  },
  {
    question:
      'What does this JVM startup flag combination do and what is wrong with it for a Kubernetes deployment?\n\n' +
      '```bash\n' +
      'java -Xmx8g -Xms8g -XX:+UseParallelGC -jar service.jar\n' +
      '```',
    answer:
      'Three problems for Kubernetes:\n\n' +
      '1. **`-Xms8g`**: Commits the full 8GB heap to physical memory at JVM startup. Pod starts with 8GB memory usage immediately, ' +
      'competing with other pods on the node from second one.\n\n' +
      '2. **`-XX:+UseParallelGC`**: ParallelGC (Throughput collector) has no pause time target. It runs stop-the-world collections on all available CPUs, ' +
      'which can produce multi-second pauses on large heaps. Wrong choice for any latency-sensitive service.\n\n' +
      '3. **No `UseContainerSupport`**: Without this (Java 11+ has it on by default, but older versions do not), the JVM reads host memory, not container cgroup limits. ' +
      'A 3-container node with 32GB host memory and 8GB per container: without container support, each JVM tries to use 32GB * 0.25 = 8GB from its perspective, ' +
      'but the container is limited to 8GB, causing OOMKill.\n\n' +
      'Correct for Kubernetes: `-XX:+UseG1GC -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:MaxGCPauseMillis=200`',
    followUps: [
      {
        question: 'A colleague argues that -Xms==-Xmx prevents GC pauses caused by heap resizing. Is this correct?',
        answer:
          'Incorrect. G1GC does not resize the heap between collections — it manages regions within the committed heap. ' +
          'Heap resizing pauses (which were a concern with older collectors) are not a meaningful performance factor in G1. ' +
          'The cost of `-Xms==-Xmx` is immediate full memory commit at startup, which in Kubernetes means competing for node memory from the first second, ' +
          'slowing pod startup, and wasting memory during low-traffic periods.'
      }
    ]
  },
  {
    question:
      'What will this code do to GC behavior at high request rates and how would you fix it?\n\n' +
      '```java\n' +
      '@RestController\n' +
      'public class OrderController {\n' +
      '    @GetMapping("/orders/{customerId}")\n' +
      '    public byte[] getOrders(@PathVariable String customerId) throws Exception {\n' +
      '        List<Order> orders = orderService.findAll(customerId); // returns 500 orders avg\n' +
      '        ObjectMapper mapper = new ObjectMapper(); // created per-request\n' +
      '        return mapper.writeValueAsBytes(orders); // 2MB byte[] per request\n' +
      '    }\n' +
      '}\n' +
      '```',
    answer:
      'Two GC problems:\n\n' +
      '1. **`new ObjectMapper()` per request**: ObjectMapper is expensive to construct (~20ms, allocates many internal structures). ' +
      'At 100 req/s, this creates 100 short-lived large objects per second, putting massive pressure on young gen.\n\n' +
      '2. **`writeValueAsBytes()` materializes a 2MB byte[]**: With default G1 region size (2MB for a 2GB heap), ' +
      'this 2MB array is humongous — allocated directly in old gen. At 100 req/s, old gen fills with 200MB/s of humongous allocations.\n\n' +
      'Fix:\n' +
      '```java\n' +
      '@RestController\n' +
      'public class OrderController {\n' +
      '    @Autowired ObjectMapper mapper; // singleton, injected by Spring\n' +
      '    \n' +
      '    @GetMapping("/orders/{customerId}")\n' +
      '    public void getOrders(@PathVariable String customerId,\n' +
      '                          HttpServletResponse response) throws Exception {\n' +
      '        List<Order> orders = orderService.findAll(customerId);\n' +
      '        response.setContentType("application/json");\n' +
      '        mapper.writeValue(response.getOutputStream(), orders); // streams, no large byte[]\n' +
      '    }\n' +
      '}\n' +
      '```',
    followUps: [
      {
        question: 'Is ObjectMapper thread-safe to use as a singleton?',
        answer:
          'Yes — after configuration. ObjectMapper is thread-safe for read operations (serialization/deserialization) once fully configured. ' +
          'Do not call `.configure()`, `.registerModule()`, or other configuration methods after the bean is initialized in a multi-threaded context. ' +
          'In Spring, `@Bean ObjectMapper` is singleton-scoped by default and fully configured at startup — safe to inject and share.'
      }
    ]
  },
  {
    question:
      'This service shows steadily increasing old gen usage over 8 hours but heap never OOMs. GC logs show:\n\n' +
      '```\n' +
      '[gc] GC(1201) Pause Mixed 1820M->1650M(4096M) 340.221ms\n' +
      '[gc] GC(1250) Pause Mixed 1900M->1750M(4096M) 380.444ms\n' +
      '[gc] GC(1310) Pause Mixed 2050M->1900M(4096M) 410.881ms\n' +
      '```\n\n' +
      'After each Mixed GC, old gen is higher than after the previous one. What does this indicate?',
    answer:
      'This is a slow memory leak. Old gen grows by ~150MB between each Mixed GC cycle despite the GC running. ' +
      'Mixed GC is collecting garbage, but new live objects are accumulating faster than Mixed GC is reclaiming space.\n\n' +
      'Interpretation of the numbers:\n' +
      '- GC 1201: old gen collected 170MB but net is still growing\n' +
      '- Each Mixed GC ends at a higher baseline than the previous one\n' +
      '- Without intervention, old gen will hit 95% → concurrent marking overwhelmed → Full GC → potentially heap exhaustion\n\n' +
      'Next steps:\n' +
      '1. Take a heap dump now (before OOM, while the leak pattern is clear)\n' +
      '2. Open in MAT, sort dominator tree by retained heap\n' +
      '3. Look for objects with retained heap growing with uptime — not static size\n' +
      '4. Trace the reference path to the GC root\n' +
      'Likely culprit: a cache without TTL, an event listener accumulating events, or a ThreadLocal accumulating context objects.',
    followUps: [
      {
        question: 'The Mixed GC pause times are also growing (340ms → 380ms → 410ms). Why?',
        answer:
          'Mixed GC pause time grows because there is more live data to scan. G1 must trace all live references to identify garbage — ' +
          'as old gen accumulates more live objects (the leak), tracing takes longer. ' +
          'This is a feedback loop: the leak causes longer pauses, longer pauses reduce throughput, reduced throughput may increase queue depth, ' +
          'which may increase allocation rate, which fills old gen faster. Fix the leak first; the pause times follow.'
      }
    ]
  }
];

const INTERVIEW_SENIOR_SCENARIO = [
  {
    question:
      'Your payment service runs on 6 pods, each with -Xmx4g. Under Black Friday load (10x normal), ' +
      'p99 latency spikes to 2+ seconds every 20-30 minutes. Restarting pods temporarily restores latency. ' +
      'The SRE team wants to add more pods. How do you diagnose and fix the actual root cause?',
    answer:
      '**Step 1 — Establish that GC is the cause, not just a symptom.**\n' +
      'Pull GC logs from a pod during a spike. If you see `Pause Mixed` or `Pause Full` coinciding with the latency spike, GC is confirmed.\n' +
      '`kubectl exec <pod> -- grep "Pause" /logs/gc.log | tail -50`\n\n' +
      '**Step 2 — Determine the GC type causing the pause.**\n' +
      'Mixed GC = old gen filling up. Check the pattern: does old gen grow steadily between Mixed GC collections?\n' +
      '`grep "Pause Mixed" gc.log` — look at heap usage before and after each collection.\n\n' +
      '**Step 3 — Rule out or confirm humongous allocations.**\n' +
      '`grep -i "humongous" gc.log` — if present, identify what is creating large objects.\n' +
      'Payment serialization (JSON payloads), bulk query results, large batch operations are usual suspects.\n\n' +
      '**Step 4 — Take a heap dump during elevated old gen usage.**\n' +
      'Set `-XX:+HeapDumpOnOutOfMemoryError` in advance. Or `jmap -dump:format=b,file=/tmp/heap.hprof <pid>` manually.\n' +
      'Open in MAT. Leak Suspects report. Dominator tree sorted by retained heap.\n\n' +
      '**Step 5 — Explain to SRE why more pods do not help.**\n' +
      'Each pod independently fills old gen at the same rate. 12 pods instead of 6 means 12 pods having the same GC spikes — ' +
      'traffic is distributed, but each pod\'s GC behavior is identical. More pods reduces request rate per pod, which may delay the onset, but does not eliminate it.\n\n' +
      '**Step 6 — Fix based on root cause.**\n' +
      '- Humongous allocations: increase `G1HeapRegionSize=16m`, stream serialization instead of materializing byte[]\n' +
      '- Memory leak: fix reference retention, add Caffeine TTL cache, clear ThreadLocals\n' +
      '- IHOP too high: lower to 35% so marking starts earlier\n\n' +
      '**Step 7 — Measure after fix** with the same load. Compare Mixed GC frequency, old gen growth rate, p99 latency.',
    followUps: [
      {
        question: 'The team insists on adding pods while you investigate. What do you ask for?',
        answer:
          'Ask for GC logging to be enabled on the new pods: `-Xlog:gc*:file=/logs/gc.log:time,uptime,level,tags:filecount=10,filesize=20m`. ' +
          'Without logs, the new pods are just more unknown nodes. Also ask for container memory limit headroom — if pods are at 90% of limit, adding pods to the same node may cause node memory pressure.'
      },
      {
        question: 'How long would you give a pod to "warm up" before trusting its GC metrics?',
        answer:
          'Two complete traffic cycles for the workload. For a service with 20-minute GC spike intervals, at least 60 minutes of production traffic. ' +
          'JIT compilation needs ~30 minutes to fully optimize hot paths. GC steady state depends on allocation patterns which stabilize after initial class loading and cache warming.'
      }
    ]
  },
  {
    question:
      'You join a new company. The primary microservice has `-Xmx8g` but runs in a 6GB Kubernetes container. ' +
      'It has been "working" for 18 months. How do you diagnose what is actually happening and what risks does this configuration carry?',
    answer:
      '**Step 1 — Verify the current behavior.** Check container resource requests and limits:\n' +
      '`kubectl describe pod <pod> | grep -A5 Limits`\n' +
      'Confirm: limits.memory < 8g. This means the JVM is configured to use more heap than the container allows.\n\n' +
      '**Step 2 — Check if UseContainerSupport is overriding the -Xmx flag.**\n' +
      'In Java 11+, `UseContainerSupport=true` by default. If `-XX:MaxRAMPercentage` is not set, JVM calculates max heap from cgroup limits, not `-Xmx`. ' +
      'The effective max heap may be lower than 8g despite the flag.\n' +
      '`kubectl exec <pod> -- java -XX:+PrintFlagsFinal -version 2>&1 | grep MaxHeapSize`\n\n' +
      '**Step 3 — Check actual RSS vs container limit.**\n' +
      '`kubectl exec <pod> -- cat /proc/1/status | grep VmRSS`\n' +
      'If RSS > container limit, the pod is at risk of OOMKill — but Kubernetes may be using memory-overcommit on the node.\n\n' +
      '**Step 4 — Identify the risk.**\n' +
      '- If GC pressure causes a Full GC spike in memory, RSS temporarily exceeds the container limit, triggering OOMKill\n' +
      '- This is a latent reliability risk: works under normal load, fails under traffic spikes\n\n' +
      '**Step 5 — Fix by replacing fixed -Xmx with container-aware flags:**\n' +
      '`-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:InitialRAMPercentage=25.0`\n' +
      'Remove `-Xmx8g` entirely. Deploy to one pod first, verify effective heap size, then roll out.\n\n' +
      '**Step 6 — Present the risk and fix to the team as a week-2 contribution.** Finding and fixing JVM misconfiguration in your first month is a strong Staff-level signal.',
    followUps: [
      {
        question: 'Why has this configuration "worked" for 18 months if it is misconfigured?',
        answer:
          'Normal traffic may never push the JVM to attempt allocating near 8GB. If steady-state heap usage is 3-4GB, the misconfiguration is dormant — ' +
          'the JVM never actually tries to allocate what the container cannot provide. It becomes a problem on the first traffic spike or memory pressure event. ' +
          '"It worked for 18 months" is not evidence of correctness — it is evidence that the load has not stressed the configuration yet.'
      }
    ]
  },
  {
    question:
      'The CEO wants to move the monolith to microservices. The architect proposes 50 services, each running in its own JVM. ' +
      'What GC-related operational concerns would you raise?',
    answer:
      '**Concern 1 — JVM startup overhead at scale.**\n' +
      '50 JVMs, each with JIT warmup taking 5-15 minutes to reach optimal performance. Rolling deploys become slow and risky. ' +
      'Consider GraalVM native image for cold-start-sensitive services, or ensure traffic routing avoids new pods during JIT warmup.\n\n' +
      '**Concern 2 — Heap sizing across 50 services.**\n' +
      '50 services × average 2GB heap = 100GB committed memory minimum. Container-aware JVM flags are not optional — they are mandatory. ' +
      'Every service must have `-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0` or you will have OOMKill incidents on day one.\n\n' +
      '**Concern 3 — GC log collection and analysis at scale.**\n' +
      'GC logs from 50 services need centralized collection (Fluentd/Filebeat → Elasticsearch) and alerting. ' +
      'A Full GC in service-47 is invisible without log aggregation.\n\n' +
      '**Concern 4 — Off-heap memory is per-JVM.**\n' +
      'Metaspace, code cache, thread stacks — each JVM pays this overhead. 50 JVMs might consume 50 × 512MB = 25GB just in non-heap overhead.\n\n' +
      '**Concern 5 — GC tuning expertise scales poorly.**\n' +
      '50 services with different workloads need different GC configurations. Establish a base configuration as a team standard, ' +
      'then tune exceptions based on measured GC logs, not intuition.',
    followUps: [
      {
        question: 'Would virtual threads (Java 21) change this analysis?',
        answer:
          'Virtual threads reduce thread count dramatically — instead of 200 platform threads per service (200 × 1MB stack = 200MB off-heap), ' +
          'you might have 10 carrier threads. This reduces thread stack off-heap overhead significantly. ' +
          'But it does not change heap, metaspace, code cache, or GC algorithm concerns. ' +
          'Virtual threads improve I/O concurrency per JVM; they do not change the fundamental per-JVM overhead.'
      }
    ]
  }
];

const INTERVIEW_WRONG_ANSWERS = [
  'Wrong: "Just increase -Xmx to fix memory issues." ' +
  'Why it\'s wrong: -Xmx only delays the problem if the root cause is a memory leak or humongous allocation. ' +
  'More heap = more accumulated garbage before the same crash or pause occurs. Fix the root cause, then size the heap to steady-state usage.',

  'Wrong: "System.gc() helps free memory after large batch operations." ' +
  'Why it\'s wrong: System.gc() triggers a Full GC on G1 — single-threaded, can pause all threads for seconds. ' +
  'The JVM\'s GC is better at deciding when to collect than hand-triggered calls. Remove all System.gc() from production code.',

  'Wrong: "Setting -Xms == -Xmx prevents GC overhead from heap resizing." ' +
  'Why it\'s wrong: G1GC does not resize the heap between collections; the concern this "fixes" does not exist for modern collectors. ' +
  'The cost is immediate full memory commit at startup, which in Kubernetes wastes memory during low-traffic and competes with other pods.',

  'Wrong: "G1GC always achieves the MaxGCPauseMillis target." ' +
  'Why it\'s wrong: MaxGCPauseMillis is a soft hint, not a hard limit. G1 can and does exceed it during Full GC, Initial Mark, and promotion failure. ' +
  'If your SLA requires <100ms pauses and G1 consistently hits 400ms, you need to fix the allocation pattern or switch to ZGC.',

  'Wrong: "More pods will fix GC latency spikes." ' +
  'Why it\'s wrong: Each pod has the same GC behavior independently. Adding pods distributes request rate but does not change per-pod allocation patterns. ' +
  'A memory leak or humongous allocation issue scales linearly — more pods means the same GC spikes, just on more nodes.',

  'Wrong: "ZGC is always better than G1GC because its pauses are shorter." ' +
  'Why it\'s wrong: ZGC uses 10-15% more CPU for concurrent compaction work. For batch/throughput workloads, G1 delivers higher raw throughput. ' +
  'ZGC is the right choice when p99 latency matters more than throughput. Choose based on the workload, not the spec sheet.',

  'Wrong: "heap usage at 70% means the service is healthy." ' +
  'Why it\'s wrong: Heap usage tells you nothing about total process memory (metaspace + code cache + direct buffers + thread stacks). ' +
  'A service can be OOMKilled by Kubernetes while heap shows 70% if off-heap components have grown. Monitor container RSS, not just heap.',

  'Wrong: "GC logs slow down the application and should not be enabled in production." ' +
  'Why it\'s wrong: Structured GC logging with file rotation adds <1% overhead and consumes ~1MB/hour. ' +
  'Not having GC logs in production means every GC incident is diagnosed by guesswork. Enable them always: ' +
  '`-Xlog:gc*:file=/logs/gc.log:time,uptime,level,tags:filecount=10,filesize=20m`'
];

// ─── MCQ QUESTIONS ────────────────────────────────────────────────────────────

const MCQ_QUESTIONS = [
  {
    id: 1, level: 'basic', category: 'theory',
    question: 'Which of the following is NOT a GC root in the JVM?',
    options: {
      A: 'Local variables in an active method stack frame',
      B: 'Static fields of a loaded class',
      C: 'An object referenced only by another heap object',
      D: 'Objects referenced from active JNI native code'
    },
    answer: 'C',
    explanation: 'A GC root must be directly reachable without tracing through other heap objects. ' +
      'Stack frames (A), static fields (B), and JNI references (D) are all unconditionally live without needing another object to reference them. ' +
      'An object referenced only by another heap object (C) is reachable through that object, but only if that other object is itself reachable from a root — it is not a root itself.'
  },
  {
    id: 2, level: 'basic', category: 'theory',
    question: 'In G1GC, what is a humongous object?',
    options: {
      A: 'Any object larger than 1MB',
      B: 'Any object that has survived 15+ Young GC cycles',
      C: 'Any object whose size exceeds 50% of a single G1 region',
      D: 'Any object allocated in the Old Generation directly'
    },
    answer: 'C',
    explanation: 'G1 defines humongous as >50% of a single region size. With a default 2MB region, objects >1MB are humongous. ' +
      'A is wrong because the threshold is percentage-based on region size, not a fixed 1MB. ' +
      'B describes promotion aging, not humongous classification. ' +
      'D is a consequence of being humongous (humongous objects go to old gen), not the definition.'
  },
  {
    id: 3, level: 'basic', category: 'theory',
    question: 'Which GC event in G1GC is single-threaded and most dangerous to application latency?',
    options: {
      A: 'Pause Young (Normal)',
      B: 'Pause Full',
      C: 'Concurrent Mark Cycle',
      D: 'Pause Mixed'
    },
    answer: 'B',
    explanation: 'Full GC in G1 is single-threaded and processes the entire heap. On a 4GB heap it can take seconds; on 32GB, tens of seconds. ' +
      'Young GC (A) is parallel and typically under 100ms. Concurrent Mark (C) runs concurrently with application threads — no pause. ' +
      'Mixed GC (D) is stop-the-world but parallel and processes only selected regions, so it is faster than Full GC.'
  },
  {
    id: 4, level: 'basic', category: 'theory',
    question: 'What does MaxRAMPercentage do when combined with UseContainerSupport in Kubernetes?',
    options: {
      A: 'Sets heap to a percentage of the host node\'s total memory',
      B: 'Sets heap to a percentage of the container memory limit from cgroup',
      C: 'Caps non-heap memory (metaspace + code cache) as a percentage of total RAM',
      D: 'Sets the InitiatingHeapOccupancyPercent as a fraction of available RAM'
    },
    answer: 'B',
    explanation: 'UseContainerSupport tells the JVM to read cgroup limits instead of host /proc/meminfo. ' +
      'MaxRAMPercentage then sets max heap as that percentage of the cgroup-reported limit. ' +
      'A is wrong — without UseContainerSupport, it reads host memory (dangerous). ' +
      'C and D are incorrect — these flags have nothing to do with metaspace or IHOP configuration.'
  },
  {
    id: 5, level: 'basic', category: 'theory',
    question: 'Eclipse MAT shows an object with shallow heap of 48 bytes but retained heap of 2.1GB. What does this mean?',
    options: {
      A: 'The object itself uses 2.1GB of memory',
      B: 'If this object were collected, 2.1GB of memory would be freed',
      C: 'This object has survived 2.1GB worth of GC cycles',
      D: 'The object is referenced by 2.1GB of other objects'
    },
    answer: 'B',
    explanation: 'Retained heap = total memory freed if this object and everything only reachable through it were collected. ' +
      'The object itself is 48 bytes (shallow heap), but it holds references to 2.1GB of other objects that would also be freed. ' +
      'This is the key metric for leak diagnosis — a tiny object can "retain" enormous memory through reference chains. ' +
      'A is wrong (shallow heap is 48 bytes). C and D describe unrelated concepts.'
  },
  {
    id: 6, level: 'basic', category: 'theory',
    question: 'GC Overhead Limit Exceeded is thrown when:',
    options: {
      A: 'Heap usage exceeds 90% for more than 60 seconds',
      B: 'The JVM spends >98% of CPU in GC and recovers <2% of heap across multiple cycles',
      C: 'A Full GC fails to free any memory',
      D: 'MaxGCPauseMillis is exceeded more than 10 times in a row'
    },
    answer: 'B',
    explanation: 'GC Overhead Limit Exceeded fires when the JVM is effectively spinning in GC — spending almost all time collecting but recovering almost nothing each cycle. ' +
      'This indicates the heap is nearly fully occupied by live (referenced) objects, often due to a memory leak. ' +
      'A, C, and D do not match the actual JVM threshold logic. The correct response is a heap dump + leak analysis, not just increasing -Xmx.'
  },
  {
    id: 7, level: 'basic', category: 'theory',
    question: 'Which JVM flag enables structured GC logging with file rotation in Java 11+?',
    options: {
      A: '-verbose:gc -Xloggc:/logs/gc.log',
      B: '-XX:+PrintGCDetails -XX:+PrintGCDateStamps',
      C: '-Xlog:gc*:file=/logs/gc.log:time,uptime,level,tags:filecount=10,filesize=20m',
      D: '-XX:+UseGCLogFileRotation -XX:NumberOfGCLogFiles=10'
    },
    answer: 'C',
    explanation: 'Java 9+ unified JVM logging system uses -Xlog. The format is -Xlog:what:where:decorators:output-options. ' +
      'gc* captures all GC-related log messages. A and B are Java 8 syntax (deprecated). D is also Java 8 style and was removed in Java 9. ' +
      'In Java 11+, -Xlog:gc* is the correct and only supported approach.'
  },
  {
    id: 8, level: 'basic', category: 'theory',
    question: 'What is off-heap memory and which of these does NOT consume off-heap memory?',
    options: {
      A: 'JVM Metaspace',
      B: 'Direct ByteBuffer allocations',
      C: 'Java objects created with new()',
      D: 'JIT-compiled native code in the code cache'
    },
    answer: 'C',
    explanation: 'Objects created with new() are allocated on the Java heap, which IS managed by GC. ' +
      'Off-heap memory includes Metaspace (class metadata, A), Direct ByteBuffer allocations (B, allocated via OS syscall), ' +
      'and the code cache for JIT-compiled methods (D). ' +
      'These are not tracked by heap metrics and can cause OOMKill in Kubernetes even when heap looks healthy.'
  },
  {
    id: 9, level: 'intermediate', category: 'theory',
    question: 'G1GC\'s InitiatingHeapOccupancyPercent (IHOP) defaults to 45%. What does lowering it to 35% accomplish?',
    options: {
      A: 'Reduces heap size to 35% of -Xmx to save memory',
      B: 'Triggers concurrent marking earlier, giving G1 more time to complete before old gen fills',
      C: 'Increases young gen size to 35% of total heap',
      D: 'Sets the minimum heap that must remain free after each Mixed GC'
    },
    answer: 'B',
    explanation: 'IHOP is the old gen occupancy percentage that triggers concurrent marking. ' +
      'Lower IHOP = marking starts sooner = more time for G1 to identify garbage before old gen fills. ' +
      'This reduces the risk of Full GC caused by concurrent marking not completing before old gen exhaustion. ' +
      'Trade-off: more frequent marking cycles consume more CPU. A, C, D are incorrect — IHOP only controls the marking trigger threshold.'
  },
  {
    id: 10, level: 'intermediate', category: 'code',
    question: 'What is wrong with this memory management approach?\n\n```java\npublic class OrderEventBus {\n    private static final List<OrderEventListener> LISTENERS = new ArrayList<>();\n    \n    public static void subscribe(OrderEventListener listener) {\n        LISTENERS.add(listener);\n    }\n    \n    public static void publish(OrderEvent event) {\n        LISTENERS.forEach(l -> l.onEvent(event));\n    }\n    // No unsubscribe method\n}\n```',
    options: {
      A: 'The static List is not thread-safe for concurrent subscribe/publish calls',
      B: 'Listeners added via subscribe() are never removed and the static list is a GC root, creating a memory leak',
      C: 'publish() should be async to avoid blocking the calling thread',
      D: 'OrderEventListener should be a WeakReference to allow GC'
    },
    answer: 'B',
    explanation: 'The static `LISTENERS` list is a GC root. Every listener subscribed through this bus stays live until explicitly removed. ' +
      'Without an unsubscribe mechanism, listeners accumulate forever. In a long-running service, this means listener objects (and everything they reference) ' +
      'are never collected. A is also true but is a thread-safety issue, not a memory leak. C is a design concern, not a GC concern. ' +
      'D is a valid mitigation (WeakReference listeners would be collected when no strong reference exists) but B is the primary problem.'
  },
  {
    id: 11, level: 'intermediate', category: 'theory',
    question: 'Why does Direct ByteBuffer memory NOT appear in heap metrics?',
    options: {
      A: 'Direct ByteBuffer is garbage collected differently and excluded from heap calculations',
      B: 'The allocation happens via OS native call (mmap or similar), outside the Java heap',
      C: 'Direct ByteBuffer uses the JVM stack, not the heap',
      D: 'It is part of Metaspace, which is separate from the heap'
    },
    answer: 'B',
    explanation: 'ByteBuffer.allocateDirect() calls the OS to allocate memory outside the JVM heap. The ByteBuffer object on the heap is tiny (just metadata and a Cleaner reference). ' +
      'The actual data buffer is native memory. When the ByteBuffer is GC\'d, a PhantomReference (Cleaner) triggers deallocation of the native memory. ' +
      'A is incorrect — it is GC-related but the allocation itself is native. C and D describe different memory areas entirely.'
  },
  {
    id: 12, level: 'intermediate', category: 'code',
    question: 'This service processes 500K requests/day. What GC problem will emerge within a week?\n\n```java\n@Service\npublic class RequestTracker {\n    private static final Map<String, RequestMetadata> ACTIVE = new ConcurrentHashMap<>();\n    \n    public void start(String requestId) {\n        ACTIVE.put(requestId, new RequestMetadata(Instant.now()));\n    }\n    \n    public void complete(String requestId) {\n        RequestMetadata meta = ACTIVE.get(requestId); // never removed!\n        log.info("Request {} took {}ms", requestId, meta.duration());\n    }\n}\n```',
    options: {
      A: 'ConcurrentHashMap will throw ConcurrentModificationException under load',
      B: 'ACTIVE will grow to 500K entries/day with no eviction — 3.5M entries and gigabytes of metadata by week\'s end',
      C: 'RequestMetadata objects will be promoted to old gen after surviving too many Young GC cycles',
      D: 'The static field will cause a class initialization deadlock'
    },
    answer: 'B',
    explanation: '`complete()` reads from ACTIVE but never calls `ACTIVE.remove(requestId)`. ' +
      'Every request creates an entry that stays permanently. At 500K/day, after 7 days you have 3.5M entries. ' +
      'Each RequestMetadata is a live object held by a static map (GC root). Old gen fills steadily → Mixed GC pressure → eventually Full GC. ' +
      'Fix: `ACTIVE.remove(requestId)` in `complete()` or in a finally block. ' +
      'A is wrong — ConcurrentHashMap is thread-safe. C describes natural promotion, not a bug. D is wrong — there is no deadlock risk here.'
  },
  {
    id: 13, level: 'intermediate', category: 'theory',
    question: 'How does ZGC achieve concurrent compaction (moving live objects without stopping all threads)?',
    options: {
      A: 'It pauses threads briefly when they touch a relocated object',
      B: 'Load barriers intercept every object field read and transparently redirect to the new location if the object was moved',
      C: 'It copies objects to new locations during Young GC pauses only',
      D: 'It uses a second heap area to stage objects before moving them to their final location'
    },
    answer: 'B',
    explanation: 'ZGC inserts load barriers at every object field read (compiled by JIT). When a thread reads a reference, the barrier checks colored pointer metadata. ' +
      'If the GC has moved the referenced object, the barrier updates the reference in-place and returns the new location — transparently to the application. ' +
      'This means ZGC can compact the heap concurrently because threads are automatically corrected to new locations. ' +
      'A is wrong — there are no extra pauses per-object. C and D describe different mechanisms entirely.'
  },
  {
    id: 14, level: 'intermediate', category: 'theory',
    question: 'A service has -Xmx4g but its Kubernetes pod limit is 6g. What memory components consume the remaining 2g?',
    options: {
      A: 'Reserved JVM buffer that prevents OOMKill',
      B: 'Metaspace, code cache, direct ByteBuffer, thread stacks, and JVM internal overhead',
      C: 'JVM always allocates 2x the heap for GC work buffers',
      D: 'Operating system kernel memory reserved for JVM I/O operations'
    },
    answer: 'B',
    explanation: 'JVM process memory = heap + metaspace + code cache + direct buffers + thread stacks + JVM internal overhead. ' +
      'With -Xmx4g, 2GB of headroom for metaspace (class loading), code cache (JIT compiled code), Netty/NIO direct buffers, thread stacks (each thread uses ~512KB-1MB), ' +
      'and GC internal metadata. This is why setting MaxRAMPercentage to 75% (not 100%) is critical — the remaining 25% covers these components. ' +
      'A, C, D are incorrect descriptions of how JVM memory works.'
  },
  {
    id: 15, level: 'intermediate', category: 'code',
    question: 'What does this GC log excerpt indicate?\n\n```\n[gc] GC(445) Pause Young (Normal) 512M->498M(2048M) 45.221ms\n[gc] GC(446) Pause Young (Normal) 531M->517M(2048M) 48.332ms\n[gc] GC(447) Pause Young (Normal) 554M->541M(2048M) 51.111ms\n```',
    options: {
      A: 'Memory leak — heap grows after each Young GC, never stabilizing',
      B: 'Normal pattern — heap grows slightly after each Young GC because some objects are promoted to old gen',
      C: 'Humongous allocation — objects are bypassing young gen',
      D: 'Young GC is failing to collect any garbage'
    },
    answer: 'B',
    explanation: 'Each Young GC collects some Eden garbage but some objects survive and are promoted to old gen. ' +
      'After GC(445): 512M → 498M (freed 14MB). The total heap after GC (498M, 517M, 541M) grows slowly because old gen is accumulating promoted objects. ' +
      'This is the expected G1 pattern: old gen grows until IHOP is hit, then concurrent marking runs. ' +
      'A would be a concern if old gen grew unboundedly without stabilizing. C would show `Humongous` in the log. D is wrong — 14-17MB is being freed each cycle.'
  },
  {
    id: 16, level: 'intermediate', category: 'theory',
    question: 'What is the correct way to size G1HeapRegionSize for a service that creates 1.5MB JSON byte arrays?',
    options: {
      A: 'Set it to 1MB so more regions are available for allocation',
      B: 'Leave it at default; G1 auto-calculates the optimal size',
      C: 'Set it to 4MB or higher so 1.5MB < 50% threshold, preventing humongous classification',
      D: 'Set it equal to the average object size to minimize fragmentation'
    },
    answer: 'C',
    explanation: 'G1HeapRegionSize must be set so 50% of region size > object size to prevent humongous classification. ' +
      'For 1.5MB objects: 50% of 4MB = 2MB > 1.5MB — so 4MB regions would work, but it is safer to use 8MB or 16MB for headroom. ' +
      'A is wrong — smaller regions make the problem worse (lower threshold). ' +
      'B is wrong — auto-calculation may produce 2MB regions for a 4GB heap, making 1.5MB objects humongous. ' +
      'D is wrong — region size is not meant to match object size.'
  },
  {
    id: 17, level: 'intermediate', category: 'code',
    question: 'This code runs in a Tomcat thread pool. What memory issue does it create?\n\n```java\nprivate static final ThreadLocal<byte[]> BUFFER = ThreadLocal.withInitial(() -> new byte[64 * 1024]);\n\npublic void processRequest(HttpRequest request) {\n    byte[] buffer = BUFFER.get();\n    // use buffer for request processing\n    // no cleanup\n}\n```',
    options: {
      A: 'No issue — thread-local byte arrays are garbage collected with the thread',
      B: '64KB arrays are permanently held per thread, but this is by design for performance',
      C: 'BUFFER.get() creates a new array on every call, filling young gen',
      D: 'The 64KB is reasonable but the absence of BUFFER.remove() can cause issues if the thread is later used for different contexts'
    },
    answer: 'D',
    explanation: 'ThreadLocal without remove() is safe only when the thread is always used for the same type of work. ' +
      'In Tomcat, threads handle different requests. If future requests do not expect the ThreadLocal value (e.g., after servlet context changes, classloader reloads), ' +
      'the stale value creates a hard reference through the thread, preventing proper cleanup. ' +
      'More critically, if the byte array holds sensitive request data from a previous request and is not cleared, it is a security issue. ' +
      'Best practice: BUFFER.remove() in a try-finally or use a fresh allocation per request for buffers that must be clean.'
  },
  {
    id: 18, level: 'intermediate', category: 'theory',
    question: 'When should you switch from G1GC to ZGC?',
    options: {
      A: 'Whenever heap size exceeds 4GB',
      B: 'When G1 Mixed GC pauses consistently exceed your p99 latency budget after thorough G1 tuning',
      C: 'As soon as you upgrade to Java 21 — ZGC is always faster',
      D: 'When your service has more than 1000 requests per second'
    },
    answer: 'B',
    explanation: 'The decision criterion is latency budget, not heap size or request rate. ' +
      'Switch to ZGC when: G1 tuning (MaxGCPauseMillis, IHOP, G1HeapRegionSize) cannot bring pauses within your p99 budget, AND your workload is latency-sensitive (not batch/throughput-first). ' +
      'A is wrong — heap size does not determine GC algorithm choice. ' +
      'C is wrong — ZGC has higher CPU overhead and lower raw throughput for batch workloads. ' +
      'D is wrong — throughput is not the deciding factor.'
  },
  {
    id: 19, level: 'intermediate', category: 'code',
    question: 'What does this flag combination do in a Kubernetes pod with 4GB limit?\n\n```bash\n-XX:+UseContainerSupport\n-XX:MaxRAMPercentage=75.0\n-XX:InitialRAMPercentage=25.0\n```',
    options: {
      A: 'Sets max heap to 3GB, starts heap at 1GB, and reads memory limits from cgroup',
      B: 'Sets max heap to 3GB, initial heap to 3GB, and uses 75% of host memory',
      C: 'Sets max heap to 75MB and initial heap to 25MB',
      D: 'These flags conflict with each other and the JVM will use default heap sizing'
    },
    answer: 'A',
    explanation: 'UseContainerSupport tells the JVM to read cgroup limits (4GB from the pod limit). ' +
      'MaxRAMPercentage=75.0 sets max heap to 75% of 4GB = 3GB. ' +
      'InitialRAMPercentage=25.0 sets starting heap to 25% of 4GB = 1GB. ' +
      'This allows the heap to grow from 1GB to 3GB as needed, leaving 1GB for metaspace, code cache, and other off-heap components. ' +
      'B is wrong about initial heap. C has the math wrong. D is wrong — these flags are compatible.'
  },
  {
    id: 20, level: 'intermediate', category: 'theory',
    question: 'What is the correct interpretation of this GC event?\n\n`GC(892) Pause Full (Allocation Failure) 3850M->1100M(4096M) 8243.771ms`',
    options: {
      A: 'A normal Full GC that freed 2.75GB in 8.2 seconds — expected under high load',
      B: 'A catastrophic single-threaded Full GC lasting 8.2 seconds — your tuning has failed',
      C: 'A Mixed GC that took slightly longer than usual',
      D: 'A concurrent marking phase that overlapped with a Young GC'
    },
    answer: 'B',
    explanation: 'Pause Full in G1 is a catastrophic failure of the GC configuration. It is single-threaded and lasted 8.2 seconds — ' +
      'all application threads were stopped for over 8 seconds. "Allocation Failure" means G1 could not allocate an object and fell back to Full GC. ' +
      'A is wrong — Full GC should never be described as "normal." ' +
      'C is wrong — Mixed GC shows "Pause Mixed" not "Pause Full." ' +
      'D is wrong — concurrent marking does not produce Pause entries.'
  },
  {
    id: 21, level: 'advanced', category: 'code',
    question: 'This service runs a 6-hour batch job nightly. How will this code affect GC during the batch?\n\n```java\n@Scheduled(cron = "0 0 2 * * *")\npublic void nightly() {\n    List<Order> allOrders = orderRepo.findAll(); // returns 5M orders\n    Map<String, BigDecimal> totals = new HashMap<>();\n    for (Order o : allOrders) {\n        totals.merge(o.getCustomerId(), o.getTotal(), BigDecimal::add);\n    }\n    reportService.publish(totals);\n}',
    options: {
      A: 'No GC impact — the list and map are collected after the method returns',
      B: '5M Order objects in a List cause massive Young GC pressure; the HashMap persists for 6 hours in old gen',
      C: '5M records in memory cause immediate OOM and the batch job never completes',
      D: 'The List with 5M Orders is a humongous allocation and bypasses young gen'
    },
    answer: 'B',
    explanation: 'Loading 5M Order objects materializes them all on the heap simultaneously. ' +
      'The List and all Order objects will be promoted to old gen quickly as they survive Young GC cycles during the 6-hour run. ' +
      'The `totals` HashMap also stays live for the entire method duration. ' +
      'Old gen fills with 5M+ objects → Mixed GC runs frequently → long pause times during batch → risk of Full GC. ' +
      'Fix: use Stream processing with `orderRepo.findAllAsStream()` and process in chunks so only a subset is live at any time. ' +
      'A is wrong — the list is live for the entire batch duration. C may happen if heap is undersized. D is wrong — a List is not itself a single large object.'
  },
  {
    id: 22, level: 'advanced', category: 'scenario',
    question: 'After enabling ZGC on a payment service (Java 21, Spring Boot 3.2), CPU usage increased by 20% but p99 latency improved from 400ms to 8ms. The CFO asks if this is worth the extra compute cost. What is your argument?',
    options: {
      A: 'The CPU increase is a bug — ZGC should be tuned until CPU returns to baseline',
      B: '20% more CPU is the expected cost of ZGC\'s concurrent compaction; 400ms → 8ms p99 eliminates customer-facing checkout failures worth significantly more than the compute cost',
      C: 'Switch back to G1GC — the CPU increase will eventually cause a different type of outage',
      D: 'Increase pod count by 20% instead of using ZGC so CPU per pod stays constant'
    },
    answer: 'B',
    explanation: 'ZGC\'s concurrent compaction uses CPU that G1 spends in stop-the-world pauses. ' +
      '20% CPU increase is expected and well-documented. The 400ms → 8ms p99 improvement eliminates customer-visible latency spikes during checkout — ' +
      'for a payment service, 400ms STW pauses translate to timeout errors, failed transactions, and revenue loss. ' +
      'The 20% CPU cost is a deliberate trade-off: buy back latency headroom with CPU budget. ' +
      'A is wrong — the CPU increase is by design. C is wrong — Z\'s CPU overhead is predictable and stable, not a risk. D costs the same CPU but fixes nothing.'
  },
  {
    id: 23, level: 'advanced', category: 'code',
    question: 'What will happen to this service\'s old gen over 24 hours under 1000 req/s?\n\n```java\n@Service\npublic class PaymentCacheService {\n    private final Map<String, PaymentSession> sessions = new ConcurrentHashMap<>();\n    \n    @PostConstruct\n    public void init() {\n        // schedule cleanup every hour\n        Executors.newScheduledThreadPool(1)\n            .scheduleAtFixedRate(this::cleanup, 1, 1, TimeUnit.HOURS);\n    }\n    \n    private void cleanup() {\n        sessions.entrySet().removeIf(e -> \n            e.getValue().getCreatedAt().isBefore(Instant.now().minusSeconds(1800)));\n    }\n    \n    public void cache(String id, PaymentSession session) { sessions.put(id, session); }\n    public PaymentSession get(String id) { return sessions.get(id); }\n}',
    options: {
      A: 'Old gen will grow unboundedly because ConcurrentHashMap does not support removeIf',
      B: 'Old gen will accumulate 1000 sessions/sec × 3600 sec = 3.6M entries per cleanup cycle before being purged',
      C: 'The scheduled cleanup prevents any memory pressure',
      D: 'Sessions expire after 30 minutes so at most 1.8M sessions are live at any time'
    },
    answer: 'B',
    explanation: 'Cleanup runs every 1 hour. At 1000 req/s, the map accumulates 1000 × 3600 = 3.6M entries before each cleanup. ' +
      'Each cleanup removes entries older than 30 minutes — so the newest 1.8M entries (the last 30 minutes) survive. ' +
      'The issue: peak old gen holds 3.6M sessions × (average session size). If each PaymentSession is 1KB, that\'s 3.6GB. ' +
      'Fix: run cleanup every minute, or use Caffeine with `expireAfterWrite(30, MINUTES)` which evicts continuously. ' +
      'A is wrong — ConcurrentHashMap does support removeIf. D describes steady-state, not peak between cleanups.'
  },
  {
    id: 24, level: 'advanced', category: 'theory',
    question: 'G1ReservePercent defaults to 10%. What happens if you set it to 30% and why would you do this?',
    options: {
      A: 'G1 keeps 30% of heap permanently empty, reducing effective heap by 30%',
      B: 'G1 keeps 30% of total heap as free headroom, reducing promotion failure risk at the cost of available allocation space',
      C: 'G1 triggers Mixed GC when only 30% of old gen is free',
      D: 'G1 reserves 30% of each region for pointer metadata'
    },
    answer: 'B',
    explanation: 'G1ReservePercent is a safety buffer: G1 tries to keep this percentage of total heap free at all times to absorb promotion spikes. ' +
      'Higher reserve = less risk of promotion failure (which triggers Full GC) = at the cost of available allocation space. ' +
      'You increase it when you see promotion failure events in GC logs, which indicate G1 ran out of space to promote survivors from young gen. ' +
      'The trade-off: with 30% reserve on a 4GB heap, effectively only 2.8GB is available for allocation. ' +
      'A is wrong — it is not permanently empty, just a target. C and D describe unrelated concepts.'
  },
  {
    id: 25, level: 'advanced', category: 'code',
    question: 'A colleague says "I added this to fix our memory leak." Will it work?\n\n```java\npublic void processPayment(Payment payment) {\n    PaymentContext ctx = new PaymentContext(payment);\n    CONTEXT_MAP.put(payment.getId(), new WeakReference<>(ctx));\n    try {\n        processor.process(ctx);\n    } finally {\n        CONTEXT_MAP.remove(payment.getId());\n    }\n}\n```',
    options: {
      A: 'Yes — WeakReference prevents the context from being held after processing',
      B: 'Yes — the finally block ensures cleanup even on exception',
      C: 'Partially — the finally block removes the map entry, but WeakReference is unnecessary and the CONTEXT_MAP itself may still be a problem if it is static',
      D: 'No — WeakReference inside a Map prevents GC from collecting the context during processing'
    },
    answer: 'C',
    explanation: 'The `finally` block correctly removes the map entry — this is the actual leak fix. ' +
      'The WeakReference wrapper is unnecessary: since the map entry is removed in finally, the context will be collected naturally after `processPayment` returns ' +
      '(no other strong references exist). The WeakReference adds complexity without benefit here. ' +
      'The remaining concern: if CONTEXT_MAP is static and any code path misses the finally (e.g., if remove throws), entries accumulate. ' +
      'Using try-with-resources or ensuring remove is truly always called is the right pattern. ' +
      'D is wrong — WeakReference inside a Map does not prevent collection of ctx during processing as long as `ctx` local variable holds a strong reference.'
  },
  {
    id: 26, level: 'advanced', category: 'scenario',
    question: 'You identify that Metaspace is growing 50MB/hour and will hit MaxMetaspaceSize in 8 hours. The service has been running fine for 6 months. What changed and how do you diagnose?',
    options: {
      A: 'Increase MaxMetaspaceSize to 2GB to prevent the error',
      B: 'Use jmap -histo to compare class counts before and after the growth, identifying which classes are being loaded repeatedly',
      C: 'Restart the service to reset Metaspace to baseline',
      D: 'Reduce -Xmx to give more native memory to Metaspace'
    },
    answer: 'B',
    explanation: 'Metaspace grows when new classes are loaded. Steady growth at 50MB/hour after 6 months indicates something changed that generates new classes at runtime. ' +
      'Common causes: a recent deploy enabled a feature that uses dynamic class generation (new @Aspect AOP, Groovy template evaluation, new CGLIB-proxied beans). ' +
      'Diagnosis: `jmap -histo <pid> | grep -E "(class count)" | sort -k3 -n` to find which class types are multiplying. ' +
      'Or: `jcmd <pid> VM.native_memory` for Metaspace trend. ' +
      'A just delays the OOM. C resets temporarily but the problem returns. D cannot move memory between Metaspace and heap.'
  },
  {
    id: 27, level: 'advanced', category: 'code',
    question: 'A service runs this code 50K times per minute. How does it affect GC?\n\n```java\npublic String buildCorrelationHeader(String traceId, String spanId, String tenantId) {\n    return "trace=" + traceId + ",span=" + spanId + ",tenant=" + tenantId;\n}\n```',
    options: {
      A: 'No GC impact — String concatenation is optimized by the JVM to avoid intermediate objects',
      B: 'Each call creates multiple intermediate String objects before the final result, adding minor young gen pressure at 50K calls/min',
      C: 'The Strings are interned and reused, so no allocation occurs after the first call',
      D: 'At 50K calls/min this will cause Full GC within hours'
    },
    answer: 'B',
    explanation: 'String concatenation with + in Java compiles to StringBuilder append calls, producing a StringBuilder and the final String. ' +
      'Modern JVM (Java 9+ invokedynamic-based string concat) is more efficient and may reduce intermediate objects. ' +
      'At 50K/min: minor allocation pressure, but these are short-lived objects that stay in young gen and are collected in Young GC — this is expected behavior, not a crisis. ' +
      'A is partially true for modern JVMs (invokedynamic optimization), but intermediates may still occur. ' +
      'C is wrong — only string literals are interned by default. D is an overstatement — young gen allocation at this rate is normal, not catastrophic.'
  },
  {
    id: 28, level: 'advanced', category: 'scenario',
    question: 'You enable JFR (Java Flight Recorder) on a production service for 15 minutes to diagnose slow startup. Which JFR event category directly shows you which methods are allocating the most heap?',
    options: {
      A: 'jdk.ThreadSleep events',
      B: 'jdk.ObjectAllocationInNewTLAB and jdk.ObjectAllocationOutsideTLAB events',
      C: 'jdk.GCPhase events',
      D: 'jdk.ClassLoad events'
    },
    answer: 'B',
    explanation: 'TLAB (Thread Local Allocation Buffer) events capture object allocations with call stacks. ' +
      'jdk.ObjectAllocationInNewTLAB fires when a new TLAB is needed (frequent allocation sites). ' +
      'jdk.ObjectAllocationOutsideTLAB fires for large objects that bypass TLAB (potential humongous candidates). ' +
      'In JDK Mission Control, these events populate the "Memory" tab showing allocation by stack trace. ' +
      'A shows thread sleep events — irrelevant for allocation analysis. C shows GC phase durations, not allocation sites. D shows class loading, relevant for Metaspace growth.'
  },
  {
    id: 29, level: 'advanced', category: 'theory',
    question: 'A service has -XX:G1HeapRegionSize=8m and -Xmx16g. What is the maximum number of regions, and what happens to GC performance if the number of old regions exceeds 2048?',
    options: {
      A: '2048 regions; no impact — G1 handles any region count equally',
      B: '2048 regions; exceeding 2048 is impossible as region count is fixed at heap creation',
      C: '2048 regions; Mixed GC must process more old regions per cycle, increasing pause time per collection',
      D: '4096 regions; G1 switches to parallel GC automatically above 2048 regions'
    },
    answer: 'C',
    explanation: 'Region count = heap size / region size = 16GB / 8MB = 2048 regions. ' +
      'G1 processes a target number of regions per Mixed GC cycle (controlled by G1MixedGCCountTarget, default 8). ' +
      'With more old gen regions holding live data, each Mixed GC must scan more memory to identify garbage-dense regions, ' +
      'and the total number of Mixed GCs needed to reclaim old gen increases. ' +
      'This is one reason why very large heaps with G1 can still produce elevated pause times — there is simply more to scan. ' +
      'ZGC\'s advantage grows with heap size precisely because it is not region-count-limited in the same way.'
  },
  {
    id: 30, level: 'advanced', category: 'scenario',
    question: 'You are joining a company as a Staff engineer. In week 2, you review the primary service\'s JVM config and find it uses default settings with no GC logging. What do you recommend and how do you justify the change to the team?',
    options: {
      A: 'Do nothing — if the service is running fine, changing JVM flags risks destabilizing it',
      B: 'Switch immediately to ZGC and add -Xmx flags to match host memory',
      C: 'Add GC logging with rotation and UseContainerSupport flags first; instrument GC pause time as a Micrometer metric; establish a baseline before tuning anything else',
      D: 'Increase heap size to 75% of host memory to give GC more room to work'
    },
    answer: 'C',
    explanation: 'The correct Staff-level approach is: observe before changing. ' +
      'Adding GC logging (non-breaking, ~1% overhead) and container-awareness is universally safe and gives you the data to make evidence-based decisions. ' +
      'Micrometer gauge for GC pause time builds a Grafana baseline. After 1-2 weeks of baseline data, you can identify: is there actually a problem? What is the pattern? ' +
      'This approach: (1) gives you credibility — you have data, not opinion; (2) demonstrates Staff-level thinking — improve observability before tuning; ' +
      '(3) is low-risk — logging flags do not change GC behavior. ' +
      'A misses the observability gap. B is premature and risky without a baseline. D is the classic wrong response to unknown GC behavior.'
  }
];

// ─── CHEATSHEET ──────────────────────────────────────────────────────────────

const CHEATSHEET_CONTENT =
  '| GC Algorithm | Pause Type | Heap Layout | When To Use | Gotcha |\n' +
  '|---|---|---|---|---|\n' +
  '| G1GC (-XX:+UseG1GC) | STW Young + Mixed; concurrent marking | Equal-sized regions (Eden/Survivor/Old/Humongous) | Default for most services; latency-tolerant (p99 < 500ms ok) | Full GC is single-threaded; humongous objects bypass young gen |\n' +
  '| ZGC (-XX:+UseZGC) | Sub-1ms STW (root scan only); concurrent compaction | ZPages (small/medium/large) | Latency-critical services; any heap size | 10-15% higher CPU overhead; load barriers on every object read |\n' +
  '| Shenandoah (-XX:+UseShenandoahGC) | Sub-10ms STW; concurrent compaction via forwarding pointers | Regions similar to G1 | Latency-sensitive; available as backport to Java 8+ | Slightly higher per-object overhead than ZGC; Red Hat JDK primary |\n' +
  '| ParallelGC (-XX:+UseParallelGC) | STW only; all threads for GC | Fixed Young/Old split | Batch ETL, throughput-first jobs | Never for latency-sensitive services; pauses grow with heap |\n' +
  '| SerialGC (-XX:+UseSerialGC) | STW, single-threaded | Fixed Young/Old | CLI tools, tiny microservices (<256MB) | Catastrophic for any concurrent load |\n' +
  '| **G1 Key Flag** | **What It Controls** | **Default** | **When To Change** | **Direction** |\n' +
  '| -XX:MaxGCPauseMillis | Pause target hint (not hard limit) | 200ms | Latency SLA is tighter | Lower (150, 100) |\n' +
  '| -XX:G1HeapRegionSize | Region size (humongous threshold = 50%) | Auto (1-32MB) | Objects > 1MB being created | Increase to 8m/16m/32m |\n' +
  '| -XX:InitiatingHeapOccupancyPercent | Old gen % that triggers concurrent marking | 45% | Full GC from marking not completing | Lower (35%, 30%) |\n' +
  '| -XX:G1ReservePercent | Heap % kept free as headroom | 10% | Promotion failure in GC logs | Increase (15%, 20%) |\n' +
  '| -XX:MaxRAMPercentage | Max heap as % of container memory | N/A | Always set in Kubernetes | 75.0 (leaves room for off-heap) |\n' +
  '| -XX:+UseContainerSupport | Read cgroup limits not host memory | true (Java 11+) | Verify in Java 8 deployments | Must be ON in K8s |\n' +
  '| **Off-Heap Component** | **What Lives Here** | **How To Monitor** | **How To Bound It** | **Gotcha** |\n' +
  '| Metaspace | Class metadata, bytecode | jvm_memory_nonheap_used | -XX:MaxMetaspaceSize=512m | CGLIB/Groovy generates classes at runtime |\n' +
  '| Code Cache | JIT compiled native methods | jcmd <pid> VM.native_memory | -XX:ReservedCodeCacheSize=256m | If full, JIT stops compiling → performance degrades |\n' +
  '| Direct ByteBuffer | NIO, Netty, Kafka buffers | jcmd VM.native_memory summary | Limit via application logic | Freed only when ByteBuffer is GC\'d |\n' +
  '| Thread Stacks | Each thread\'s call stack | Thread count × -Xss | Reduce -Xss or thread count | Virtual threads (Java 21) drastically reduce this |\n' +
  '| **GC Log Pattern** | **What It Means** | **Severity** | **Immediate Action** | **Root Fix** |\n' +
  '| Pause Young (Normal) | Eden collected; some promoted | Normal | Monitor frequency | If too frequent, increase young gen sizing |\n' +
  '| Pause Mixed | Young + old region collection | Watch trend | Check old gen growth rate | Lower IHOP or reduce allocation |\n' +
  '| Pause Full (Allocation Failure) | Single-threaded full GC | Critical | Take heap dump NOW | Fix humongous alloc or memory leak |\n' +
  '| Humongous in GC log | Object > 50% of region size | High | Find allocation site | Increase G1HeapRegionSize or stream instead of batch |';

// ─── ASSIGNMENT ──────────────────────────────────────────────────────────────

const ASSIGNMENT_DESCRIPTION =
  '## Order Processing Service: GC Investigation & Hardening\n\n' +
  'You are the senior engineer responsible for `order-processing-service` — a Spring Boot application that:\n' +
  '- Processes 200K orders/day (peak: 500 orders/minute during lunch/dinner rush)\n' +
  '- Serializes each order to JSON (~800KB average payload)\n' +
  '- Caches order summaries for 30-minute TTL\n' +
  '- Runs on Kubernetes: 3 pods, each with 8GB container limit\n' +
  '- Current JVM flags: `-Xmx6g -Xms6g -XX:+UseG1GC` (no GC logging)\n\n' +
  'The service experiences p99 latency spikes every 15-20 minutes that correlate with customer complaint spikes at mealtimes.';

const ASSIGNMENT_QUESTIONS = [
  {
    id: 'q1',
    type: 'conceptual',
    difficulty: 'Intermediate',
    title: 'Diagnose the Latency Pattern',
    question:
      'Based on the service description: 800KB JSON payloads, 6GB heap, G1 region size auto-calculated for a 6GB heap.\n\n' +
      '1. Calculate whether the 800KB JSON byte[] allocations are humongous under the current configuration.\n' +
      '2. Explain the mechanism by which humongous allocations cause the 15-20 minute latency spike pattern.\n' +
      '3. Why does `-Xms6g -Xmx6g` make this worse, not better?\n',
    hints: [
      'G1 auto-calculates region size: for a 6GB heap, what is the default region size? (Hint: JVM uses heap/2048 rounded to power of 2)',
      'If 50% of region size < 800KB, the byte[] is humongous — work through the math',
      'Think about what Xms == Xmx does at pod startup time in Kubernetes'
    ],
    solution:
      '**1. Humongous calculation:**\n' +
      'G1 auto-calculates region size as the smallest power of 2 where heap/region ≤ 2048 regions.\n' +
      '6144MB / 2048 = 3MB → rounded up to 4MB regions.\n' +
      '50% of 4MB = 2MB. 800KB < 2MB → **NOT humongous** with 4MB regions.\n\n' +
      '*However*: if the heap is 2GB in testing (2048MB / 2048 = 1MB regions, 50% = 512KB), then 800KB IS humongous.\n' +
      'The critical takeaway: always set G1HeapRegionSize explicitly rather than relying on auto-calculation.\n\n' +
      '**2. If this were humongous:**\n' +
      '800KB objects bypass young gen → old gen fills directly → IHOP (45%) hit → concurrent marking → Mixed GC → 15-20 minute cycle.\n' +
      'Pattern: old gen fills at rate proportional to JSON payload size × request rate.\n\n' +
      '**3. -Xms6g -Xmx6g effect:**\n' +
      'The full 6GB is committed to physical memory at JVM startup. In K8s, the pod immediately consumes 6GB from the node\'s memory. ' +
      'This competes with OS page cache and other pods, potentially causing node memory pressure. ' +
      'More critically, it contributes to the RSS being close to the container limit, ' +
      'meaning any GC-related memory spike (Full GC metadata, direct buffer growth) risks OOMKill.',
    points: 20
  },
  {
    id: 'q2',
    type: 'coding',
    difficulty: 'Advanced',
    title: 'Fix the JVM Configuration',
    question:
      'Write the complete corrected JVM flags for this service running in Kubernetes with an 8GB container limit. ' +
      'For each flag you add or change, write a one-line comment explaining why.\n\n' +
      'Remove: `-Xmx6g -Xms6g`\n' +
      'Add the correct flags for: heap sizing, GC algorithm, pause targets, GC logging, container awareness, OOM safety.',
    hints: [
      'Container limit is 8GB. Heap should be at most 75% of that. Do not hardcode -Xmx.',
      'GC logging should rotate and not require manual management',
      'Think about what G1HeapRegionSize should be for 800KB payloads (even though they are not currently humongous, explicit is safer)'
    ],
    codeTemplate:
      '# Replace the existing JAVA_TOOL_OPTIONS env var with correct flags:\n' +
      '# Current (wrong):\n' +
      'JAVA_TOOL_OPTIONS="-Xmx6g -Xms6g -XX:+UseG1GC"\n\n' +
      '# Write the corrected flags below:\n' +
      'JAVA_TOOL_OPTIONS="\n' +
      '  # Heap sizing (container-aware):\n' +
      '  <YOUR FLAGS HERE>\n\n' +
      '  # GC algorithm and tuning:\n' +
      '  <YOUR FLAGS HERE>\n\n' +
      '  # Logging and safety:\n' +
      '  <YOUR FLAGS HERE>\n' +
      '"',
    solution:
      '```bash\n' +
      'JAVA_TOOL_OPTIONS="\n' +
      '  # Container-aware sizing — reads cgroup limits, not host /proc/meminfo\n' +
      '  -XX:+UseContainerSupport\n' +
      '  # Heap ceiling: 75% of 8GB = 6GB. Leaves 2GB for metaspace, code cache, direct buffers, thread stacks\n' +
      '  -XX:MaxRAMPercentage=75.0\n' +
      '  # Start at 25% (2GB), grow as needed — avoids committing 6GB at startup\n' +
      '  -XX:InitialRAMPercentage=25.0\n\n' +
      '  # G1GC explicit (default in Java 9+ but explicit for clarity in CI reviews)\n' +
      '  -XX:+UseG1GC\n' +
      '  # Pause target: 200ms is reasonable starting point; lower after establishing baseline\n' +
      '  -XX:MaxGCPauseMillis=200\n' +
      '  # Explicit region size: with 6GB heap auto-calc gives 4MB regions. 800KB payloads are safe.\n' +
      '  # Set 8MB explicitly so 800KB payloads have comfortable headroom (800KB << 4MB threshold)\n' +
      '  -XX:G1HeapRegionSize=8m\n' +
      '  # Start concurrent marking at 35% old gen (not 45% default) — more time to complete before Full GC\n' +
      '  -XX:InitiatingHeapOccupancyPercent=35\n' +
      '  # Keep 15% headroom to absorb promotion spikes without Full GC\n' +
      '  -XX:G1ReservePercent=15\n\n' +
      '  # Capture heap dump automatically at OOM — your postmortem lifeline\n' +
      '  -XX:+HeapDumpOnOutOfMemoryError\n' +
      '  -XX:HeapDumpPath=/dumps/\n' +
      '  # Structured GC logging with rotation: ~1MB/hour overhead, essential for diagnosis\n' +
      '  -Xlog:gc*:file=/logs/gc.log:time,uptime,level,tags:filecount=10,filesize=20m\n' +
      '  # Metaspace cap: prevent Spring CGLIB proxy inflation from consuming unbounded native memory\n' +
      '  -XX:MaxMetaspaceSize=512m\n' +
      '"\n' +
      '```',
    expectedOutput: 'Flag review shows: no -Xmx/-Xms; MaxRAMPercentage=75.0; UseContainerSupport; GC logging enabled; HeapDumpOnOutOfMemoryError set',
    points: 25
  },
  {
    id: 'q3',
    type: 'coding',
    difficulty: 'Advanced',
    title: 'Eliminate the Memory Allocation Hotspot',
    question:
      'The service serializes orders to JSON for API responses. Current implementation:\n\n' +
      '```java\n' +
      '@GetMapping("/orders/{orderId}")\n' +
      'public ResponseEntity<byte[]> getOrder(@PathVariable String orderId) throws Exception {\n' +
      '    Order order = orderService.findById(orderId);\n' +
      '    byte[] json = objectMapper.writeValueAsBytes(order); // creates large byte[] per request\n' +
      '    return ResponseEntity.ok()\n' +
      '        .contentType(MediaType.APPLICATION_JSON)\n' +
      '        .body(json);\n' +
      '}\n' +
      '```\n\n' +
      'Rewrite this endpoint to eliminate the large intermediate `byte[]` allocation without changing the API response.',
    hints: [
      'Jackson\'s ObjectMapper can write directly to an OutputStream — find the method that accepts an OutputStream',
      'HttpServletResponse provides an OutputStream via getOutputStream()',
      'Spring also has StreamingResponseBody for this pattern'
    ],
    codeTemplate:
      '@GetMapping("/orders/{orderId}")\n' +
      'public ??? getOrder(@PathVariable String orderId, ???) throws Exception {\n' +
      '    Order order = orderService.findById(orderId);\n' +
      '    // TODO: stream serialization to response without materializing byte[]\n' +
      '}',
    solution:
      '```java\n' +
      '// Option A: Direct HttpServletResponse output — simplest\n' +
      '@GetMapping("/orders/{orderId}")\n' +
      'public void getOrder(\n' +
      '        @PathVariable String orderId,\n' +
      '        HttpServletResponse response) throws Exception {\n' +
      '    Order order = orderService.findById(orderId);\n' +
      '    response.setContentType(MediaType.APPLICATION_JSON_VALUE);\n' +
      '    response.setStatus(HttpServletResponse.SC_OK);\n' +
      '    // Jackson writes to the response OutputStream in ~8KB chunks — no large byte[] created\n' +
      '    objectMapper.writeValue(response.getOutputStream(), order);\n' +
      '    // GC impact: O(1) allocations instead of O(payload_size) — no humongous byte[] possible\n' +
      '}\n\n' +
      '// Option B: StreamingResponseBody — Spring manages the lifecycle\n' +
      '@GetMapping("/orders/{orderId}")\n' +
      'public ResponseEntity<StreamingResponseBody> getOrderStreaming(\n' +
      '        @PathVariable String orderId) throws Exception {\n' +
      '    Order order = orderService.findById(orderId);\n' +
      '    StreamingResponseBody stream = outputStream -> objectMapper.writeValue(outputStream, order);\n' +
      '    return ResponseEntity.ok()\n' +
      '        .contentType(MediaType.APPLICATION_JSON)\n' +
      '        .body(stream);\n' +
      '}\n' +
      '```',
    expectedOutput: 'No large byte[] allocation per request. GC logs show reduced humongous or large allocation events.',
    points: 20
  },
  {
    id: 'q4',
    type: 'scenario',
    difficulty: 'Expert',
    title: 'Production Incident: GC Pressure at Mealtime Peak',
    question:
      'It is 12:45pm on a Tuesday. Lunch rush is at full speed. You receive a Slack alert:\n\n' +
      '*"order-processing-service: p99 > 2000ms, 3 of 4 order pods showing elevated GC. ' +
      'Customer support receiving complaints about slow checkout."*\n\n' +
      'You check Grafana. The GC pause metric shows:\n' +
      '- G1 Old Generation: 15 pauses in last 5 minutes, average 340ms\n' +
      '- G1 Young Generation: normal frequency, 45ms average\n' +
      '- Old gen occupancy: 78% and climbing\n\n' +
      'You have SSH access to pods. GC logging is not yet enabled (this is pre-fix). You have JDK tools available.\n\n' +
      'Write your step-by-step incident response. Include: the exact commands you run, what you look for in each output, ' +
      'and how you decide between mitigation options (restart pods vs change JVM flags vs fix code).',
    hints: [
      'Start with triage: which pods are worst? Can you shed load from the worst pod temporarily?',
      'Without GC logs, what JDK tools can tell you GC state right now?',
      'Heap dump analysis takes 20-30 minutes — is that the right move during an active incident?'
    ],
    solution:
      '## Incident Response: GC Pressure at Mealtime\n\n' +
      '### T+0: Immediate Triage (first 2 minutes)\n\n' +
      '```bash\n' +
      '# Check which pod is worst — direct traffic away from it\n' +
      'kubectl top pods -l app=order-processing-service\n\n' +
      '# Check GC state right now without logs\n' +
      'kubectl exec order-processing-pod-abc -- jstat -gcutil <pid> 2000 10\n' +
      '# Output columns: S0 S1 E O M YGC YGCT FGC FGCT GCT\n' +
      '# Watch O (old gen %) and FGC (full GC count)\n' +
      '# If FGC > 0: Full GC happened — this is critical\n' +
      '# If O > 85% and climbing: Mixed GC not keeping up\n' +
      '```\n\n' +
      '### T+2: Mitigation Decision\n\n' +
      'If FGC == 0 and O < 90%: **Do not restart yet.** GC is stressed but functional.\n' +
      'Enable GC logging dynamically if possible:\n' +
      '```bash\n' +
      'kubectl exec <pod> -- jcmd <pid> VM.log what=gc* decorators=time,uptime,level,tags\n' +
      '# This enables GC logging without restart (Java 11+ jcmd)\n' +
      '```\n\n' +
      'If FGC > 0 or O > 90%: **Take a heap dump then restart one pod.**\n' +
      '```bash\n' +
      'kubectl exec <worst-pod> -- jmap -dump:live,format=b,file=/tmp/heap.hprof <pid>\n' +
      'kubectl cp <worst-pod>:/tmp/heap.hprof ./heap-incident.hprof\n' +
      'kubectl delete pod <worst-pod>  # K8s restarts it automatically\n' +
      '```\n\n' +
      '### T+5: Scale while investigating\n\n' +
      '```bash\n' +
      '# Buy time by temporarily scaling up\n' +
      'kubectl scale deployment order-processing-service --replicas=6\n' +
      '# More pods = lower per-pod request rate = lower per-pod GC pressure\n' +
      '# This is NOT a fix — it is time to diagnose\n' +
      '```\n\n' +
      '### T+15: Heap dump analysis (post-mitigation)\n\n' +
      'Open heap-incident.hprof in Eclipse MAT. Run Leak Suspects.\n' +
      'Look for objects with retained heap > 1GB. Trace to GC root.\n' +
      'If you find an unbounded cache: add Caffeine TTL immediately and deploy.\n\n' +
      '### T+30: Post-incident actions\n\n' +
      '1. Deploy GC logging flags to all pods: `jcmd` or next deploy\n' +
      '2. Add GC pause time alert: `rate(jvm_gc_pause_seconds_sum[5m]) > 0.15`\n' +
      '3. File postmortem: root cause, timeline, action items with owners and deadlines\n\n' +
      '**Why NOT change JVM flags during the incident?**\n' +
      'Flag changes require pod restart. During an incident, restarting all pods simultaneously risks losing capacity. ' +
      'Mitigate first (scale up, restart worst pods), diagnose, fix root cause, then deploy flag changes during off-peak.',
    points: 20
  },
  {
    id: 'q5',
    type: 'coding',
    difficulty: 'Expert',
    title: 'Test That Proves GC Behavior Is Fixed',
    question:
      'Write a JUnit test that proves:\n' +
      '1. The original `byte[]` allocation pattern creates objects larger than a specified size threshold\n' +
      '2. The streaming alternative does NOT create objects above that threshold\n\n' +
      'You can use JDK MBean APIs to observe allocation or use a simple measurement approach. ' +
      'The test should fail on the buggy version and pass on the fixed version.',
    hints: [
      'Runtime.getRuntime().totalMemory() - freeMemory() before and after can approximate allocation, but GC makes this imprecise',
      'A simpler approach: use a custom OutputStream wrapper that counts bytes written to verify streaming behavior',
      'For the streaming version, verify that no single allocation > threshold occurs by counting bytes written incrementally'
    ],
    codeTemplate:
      '@SpringBootTest\nclass OrderSerializationGcTest {\n\n' +
      '    @Autowired ObjectMapper objectMapper;\n\n' +
      '    @Test\n' +
      '    void streaming_doesNotMaterializeLargeByteArray() throws Exception {\n' +
      '        Order largeOrder = TestOrderFactory.createWithItems(500); // ~800KB when serialized\n' +
      '        // TODO: prove the streaming path does not create an 800KB byte[]\n' +
      '    }\n' +
      '}',
    solution:
      '```java\n' +
      '@SpringBootTest\n' +
      'class OrderSerializationGcTest {\n\n' +
      '    @Autowired ObjectMapper objectMapper;\n\n' +
      '    @Test\n' +
      '    void buggy_writeValueAsBytes_createsLargeByteArray() throws Exception {\n' +
      '        Order largeOrder = TestOrderFactory.createWithItems(500);\n' +
      '        // Directly verify: writeValueAsBytes returns a byte[] — size is testable\n' +
      '        byte[] result = objectMapper.writeValueAsBytes(largeOrder);\n' +
      '        // Assert the allocation IS large (document the current behavior)\n' +
      '        assertThat(result.length).isGreaterThan(500_000); // > 500KB\n' +
      '        // In production with 2MB G1 regions: 500KB+ byte[] is not humongous\n' +
      '        // With 1MB regions: it would be. This test documents the risk.\n' +
      '    }\n\n' +
      '    @Test\n' +
      '    void fixed_writeValue_streamsInChunks() throws Exception {\n' +
      '        Order largeOrder = TestOrderFactory.createWithItems(500);\n' +
      '        // Capture chunks written to verify streaming behavior\n' +
      '        ChunkTrackingOutputStream tracker = new ChunkTrackingOutputStream();\n' +
      '        objectMapper.writeValue(tracker, largeOrder);\n' +
      '        // Verify total output matches expected size (same as writeValueAsBytes)\n' +
      '        assertThat(tracker.totalBytesWritten()).isGreaterThan(500_000);\n' +
      '        // Verify no single write call exceeded our chunk threshold\n' +
      '        assertThat(tracker.maxSingleWriteSize()).isLessThan(64_000); // < 64KB per write call\n' +
      '    }\n\n' +
      '    // Custom OutputStream that tracks write sizes\n' +
      '    static class ChunkTrackingOutputStream extends OutputStream {\n' +
      '        private long total = 0;\n' +
      '        private int maxChunk = 0;\n\n' +
      '        @Override public void write(int b) { total++; maxChunk = Math.max(maxChunk, 1); }\n\n' +
      '        @Override public void write(byte[] b, int off, int len) {\n' +
      '            total += len;\n' +
      '            maxChunk = Math.max(maxChunk, len); // track largest single write\n' +
      '        }\n\n' +
      '        public long totalBytesWritten() { return total; }\n' +
      '        public int maxSingleWriteSize() { return maxChunk; }\n' +
      '    }\n' +
      '}\n' +
      '```\n\n' +
      '**What this proves:**\n' +
      '- Buggy test: confirms a byte[] of the full payload size is created (documents the GC risk)\n' +
      '- Fixed test: confirms Jackson writes in small chunks, never allocating the full payload as a single array\n' +
      '- The max chunk size < 64KB means no humongous allocation is possible under any G1 region size configuration',
    expectedOutput:
      'buggy test: passes (byte[].length > 500KB confirmed)\n' +
      'fixed streaming test: passes (maxSingleWriteSize < 64KB confirmed)',
    points: 15
  }
];

// ─── ASSEMBLE AND WRITE ──────────────────────────────────────────────────────

const day92 = {
  day: 92,
  title: 'Stage 1.2 — Garbage Collection: Expert Level',
  estimatedHours: 2,
  difficulty: 'Expert',
  level: 'Expert',
  track: 'Staff',
  tags: ['GC', 'JVM', 'G1GC', 'ZGC', 'Memory Tuning', 'Performance'],
  prerequisites: ['JVM Architecture & Class Loading', 'Java Memory Model & Happens-Before'],
  learningObjectives: [
    'Read and interpret a GC log to identify Stop-The-World pause spikes and their root cause',
    'Explain G1GC region layout and why humongous object allocations bypass young gen',
    'Tune G1GC flags (G1HeapRegionSize, IHOP, G1ReservePercent) using a systematic workflow',
    'Detect off-heap memory growth independently from heap metrics using container RSS monitoring',
    'Diagnose a memory leak using heap dump + Eclipse MAT retained heap and Leak Suspects analysis',
    'Articulate the trade-offs between G1GC and ZGC for a latency-sensitive production service',
    'Write a production-ready resume bullet anchored to a real GC tuning story with measurable outcome'
  ],
  sections: [
    { type: 'why', title: 'Why This Matters', content: WHY_CONTENT },
    { type: 'theory', title: 'Garbage Collection: The Complete Production Model', content: THEORY_CONTENT },
    {
      type: 'code',
      title: 'GC Roots: What Survives and What Gets Collected',
      description: 'Proves which reference types prevent GC collection — strong, weak, static, and WeakHashMap keys',
      language: 'java',
      filename: 'GcRootDemo.java',
      code: CODE_BASIC,
      level: 'basic',
      output: OUTPUT_BASIC
    },
    {
      type: 'code',
      title: 'Production GC Configuration and Monitoring in Spring Boot',
      description: 'Shows the mandatory JVM flags, Micrometer metrics, and non-heap monitoring every production service must have',
      language: 'java',
      filename: 'GcProductionMonitoringConfig.java',
      code: CODE_INTERMEDIATE,
      level: 'intermediate',
      output: OUTPUT_INTERMEDIATE
    },
    {
      type: 'code',
      title: 'Memory Leak via Unbounded Static Cache: Detection and Fix',
      description: 'Classic static Map memory leak — buggy pattern, Caffeine fix, and test proving bounded behavior',
      language: 'java',
      filename: 'OrderSessionCacheLeak.java',
      code: CODE_ADVANCED,
      level: 'advanced',
      output: OUTPUT_ADVANCED
    },
    {
      type: 'diagram',
      title: 'G1GC Collection Cycle: State Transitions',
      diagramType: 'state',
      description: 'Shows the complete G1GC state machine: Young GC → Concurrent Marking → Mixed GC → Full GC. Understanding this diagram prevents the most common G1 tuning mistakes.',
      plantuml: PLANTUML
    },
    { type: 'pitfalls', title: 'Common Mistakes & Production Traps', items: PITFALLS },
    {
      type: 'exercise',
      title: 'Black Friday Post-Mortem: Payment Service Latency Regression',
      problem: EXERCISE_PROBLEM,
      hints: EXERCISE_HINTS,
      solution: EXERCISE_SOLUTION,
      difficulty: 'Expert'
    },
    {
      type: 'interview',
      title: 'Interview Preparation',
      conceptual: INTERVIEW_CONCEPTUAL,
      codeBased: INTERVIEW_CODE_BASED,
      seniorScenario: INTERVIEW_SENIOR_SCENARIO,
      wrongAnswers: INTERVIEW_WRONG_ANSWERS,
      jobSwitch: {
        resumeBullet: 'Diagnosed G1GC humongous allocation pattern causing 800ms STW pauses under peak load; tuned G1HeapRegionSize and lowered IHOP threshold, eliminating Full GC occurrences and reducing p99 latency by 65% at equal infrastructure cost.',
        interviewPositioning: 'Frame GC tuning as a systematic diagnostic process — describe the metric that signaled the problem, the specific tool and analysis step, and the exact flag with measured outcome. At a new company, proactively offer in your first month to audit JVM configuration on primary services; out-of-the-box container configs are almost always incorrect.',
        starAnchor: 'Situation: Payment service experiencing periodic 800ms p99 latency spikes under load, causing checkout failures. Task: Diagnose root cause and remediate without hardware scaling. Action: Enabled structured GC logging, analyzed Mixed GC patterns in GCEasy, identified humongous byte[] allocations from Jackson serialization; tuned G1HeapRegionSize from auto-calc (4MB) to explicit 16MB, lowered IHOP from 45% to 35%. Result: p99 latency reduced from 900ms to under 140ms; Full GC events eliminated; change deployed without downtime or hardware cost increase.'
      }
    },
    {
      type: 'mcq',
      title: 'Knowledge Check',
      description: '30 questions covering GC internals, production tuning, memory leak diagnosis, and off-heap memory behavior.',
      questions: MCQ_QUESTIONS
    },
    { type: 'cheatsheet', title: 'GC Quick Reference', content: CHEATSHEET_CONTENT },
    {
      type: 'assignment',
      title: 'Order Processing Service: GC Investigation & Hardening',
      description: ASSIGNMENT_DESCRIPTION,
      totalPoints: 100,
      questions: ASSIGNMENT_QUESTIONS
    }
  ]
};

const outputPath = join(__dirname, '..', 'public', 'data', 'days', 'senior-day92.json');
writeFileSync(outputPath, JSON.stringify(day92, null, 2));
console.log('Written:', outputPath);
const s = day92.sections;
console.log('Sections:', s.map(x => x.type));
const interview = s.find(x => x.type === 'interview');
console.log('Conceptual Q&As:', interview.conceptual.length);
console.log('CodeBased Q&As:', interview.codeBased.length);
console.log('SeniorScenario:', interview.seniorScenario.length);
console.log('WrongAnswers:', interview.wrongAnswers.length);
const mcq = s.find(x => x.type === 'mcq');
console.log('MCQ total:', mcq.questions.length);
const byLevel = mcq.questions.reduce((a, q) => { a[q.level] = (a[q.level] || 0) + 1; return a; }, {});
console.log('MCQ by level:', byLevel);
const assignment = s.find(x => x.type === 'assignment');
console.log('Assignment parts:', assignment.questions.length);
console.log('Total points:', assignment.totalPoints);
