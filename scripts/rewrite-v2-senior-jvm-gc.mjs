/**
 * V2 rewrite — senior-jvm-gc-performance (3 scenarios)
 * Run: node scripts/rewrite-v2-senior-jvm-gc.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
const FILE = 'public/data/scenarioInterviewThemes.json';
const F = '```';

const answers = {

'th-sr-gc-pauses': `
## 🔥 The situation
Your P99 latency spikes to 3–5 seconds every few minutes. The rest of the time it's under 100ms. The pattern is periodic — like clockwork. This is the classic GC pause signature: the JVM stops all application threads to collect garbage, and those pause windows show up as latency spikes.

## 🧠 Understand GC pauses first

| GC type | What it collects | Speed | Stops all threads? |
|---|---|---|---|
| Minor GC (Young Gen) | Short-lived objects — created and died quickly | Very fast (< 50ms) | Yes, but briefly |
| Major GC (Old Gen) | Long-lived objects that survived multiple minor GCs | Slow (100ms–10s) | Yes — this is the problem |
| Full GC | Entire heap — Young + Old + Metaspace | Slowest (seconds) | Yes — worst case |
| G1GC concurrent mark | Marks live objects while app runs | Concurrent — no full stop | Mostly no |
| ZGC / Shenandoah | Concurrent compaction | Near-zero pauses (< 1ms) | Barely — sub-millisecond |

**Simple mental model:** GC is the JVM's garbage truck. The truck needs to stop traffic (your app threads) to safely collect garbage. Old GCs stopped everything for a long time. Modern GCs (G1, ZGC) do most work while traffic keeps moving — only stopping briefly.

## Step 1: Enable GC logging to confirm GC is causing the spikes

${F}bash
# Add these JVM flags to your startup:
java -Xlog:gc*:file=/logs/gc.log:time,uptime,level,tags:filecount=5,filesize=20m \
     -jar your-app.jar

# Or in application startup script / Dockerfile:
JAVA_OPTS="-Xlog:gc*:file=/logs/gc.log:time,uptime,level,tags"
${F}

**What you see in gc.log (healthy — fast Minor GC):**
${F}text
[2024-03-10T10:23:01.123+0000][0.456s][info][gc] GC(42) Pause Young (Normal) (G1 Evacuation Pause) 512M->245M(1024M) 28.431ms
[2024-03-10T10:23:08.456+0000][7.789s][info][gc] GC(43) Pause Young (Normal) (G1 Evacuation Pause) 498M->238M(1024M) 31.205ms
${F}
**What this means (simple):**
- \`Pause Young\` = Minor GC — this is fast and normal (28ms, 31ms)
- \`512M->245M(1024M)\` = heap went from 512MB used to 245MB used, total heap is 1024MB
- These short pauses at 28–31ms are expected — not your problem

**What you see during the spike (Full GC — the problem):**
${F}text
[2024-03-10T10:25:01.000+0000][120.333s][info][gc] GC(89) Pause Full (Ergonomics) 900M->180M(1024M) 4231.087ms
${F}
**What this means (simple):**
- \`Pause Full\` = Full GC — stopped ALL threads for 4.2 seconds
- \`Ergonomics\` = JVM triggered this automatically (heap nearly full)
- This is your 4-second P99 spike — confirmed

## Step 2: Switch to G1GC with proper tuning (if on Java 8) or check your collector
${F}bash
# Check which GC is active:
java -XX:+PrintFlagsFinal -version 2>&1 | grep -i "UseG1GC\|UseZGC\|UseShenandoahGC"
${F}

**What you see:**
${F}text
     bool UseG1GC = true  {product} {ergonomic}
${F}

${F}bash
# If G1GC — tune the pause target and heap:
java \
  -XX:+UseG1GC \
  -Xms2g -Xmx2g \                        # set min=max to avoid heap resize GCs
  -XX:MaxGCPauseMillis=200 \             # target: keep pauses under 200ms
  -XX:G1HeapRegionSize=16m \             # larger regions = fewer regions = less overhead
  -XX:InitiatingHeapOccupancyPercent=45 \ # start concurrent mark earlier (don't wait until 92%)
  -jar your-app.jar
${F}

**What you see after tuning (G1 concurrent cycles, no Full GC):**
${F}text
GC(101) Pause Young (Concurrent Start) 512M->244M(2048M) 45.231ms
GC(102) Concurrent Mark Cycle
GC(102) Pause Remark 244M->244M(2048M) 12.034ms
GC(102) Concurrent Sweep
GC(103) Pause Young (Normal) 480M->235M(2048M) 38.102ms
// No more "Pause Full" — concurrent work done while app runs
${F}

## Step 3: For sub-millisecond pauses — switch to ZGC (Java 15+ LTS)
${F}bash
# ZGC: near-zero pauses regardless of heap size — perfect for latency-sensitive apps
java \
  -XX:+UseZGC \
  -Xms4g -Xmx4g \
  -XX:+ZGenerational \   # Java 21: generational ZGC — even better throughput
  -jar your-app.jar
${F}

**What you see with ZGC:**
${F}text
GC(1) Garbage Collection (Proactive) 1200M(30%)->512M(13%) 8.234ms   ← 8ms total!
GC(2) Garbage Collection (Proactive) 1400M(35%)->600M(15%) 6.891ms
// Pauses < 10ms even on 4GB heap — P99 stays flat
${F}

## Step 4: Reduce allocation rate — fewer objects = fewer GCs
${F}java
// BAD: creates a new StringBuilder on every log call (even when debug is off)
log.debug("Processing order " + orderId + " for user " + userId); // String concat = new object

// GOOD: lazy evaluation — string only built if debug logging is enabled
log.debug("Processing order {} for user {}", orderId, userId); // SLF4J format — no concat

// BAD: new ArrayList created in a loop
for (Order order : orders) {
    List<Item> items = new ArrayList<>(); // new object every iteration
    items.addAll(order.getItems());
    process(items);
}

// GOOD: reuse collection or process stream directly
orders.stream()
    .flatMap(o -> o.getItems().stream())
    .forEach(this::process);

// BAD: autoboxing in tight loop (int → Integer → back to int)
Map<String, Integer> counts = new HashMap<>();
for (String key : keys) {
    counts.put(key, counts.getOrDefault(key, 0) + 1); // boxing/unboxing on every iteration
}

// GOOD: use primitive collections (Eclipse Collections, Trove, or just count differently)
Map<String, Long> counts = new HashMap<>();
keys.forEach(k -> counts.merge(k, 1L, Long::sum));
${F}

## Your interview answer
**Open:** "I'd start by enabling GC logging and looking for 'Pause Full' events — those are the thread-stopping collections that cause latency spikes. If I see Full GC taking 4 seconds, that's the culprit."
**Then:** "The fix depends on what's triggering Full GC. If it's heap pressure, I'd tune G1GC with InitiatingHeapOccupancyPercent=45 so it starts concurrent collection earlier. For latency-critical systems, I'd switch to ZGC which keeps pauses under 10ms regardless of heap size."
**End:** "I'd also look at allocation rate — fewer short-lived objects means less GC work. Fixing log.debug string concatenation and boxing in hot loops can cut allocation significantly and reduce GC frequency."
`.trim(),

'th-sr-cpu-no-gc': `
## 🔥 The situation
CPU is at 100% but GC logs look normal — no unusually long pauses, no Full GC. Something in your application code itself is burning CPU. You don't know which method because there are thousands of them. You need a profiler.

## 🧠 Understand profiling first

| Tool | What it shows | Overhead | How to use |
|---|---|---|---|
| JFR (Java Flight Recorder) | CPU samples, allocations, lock contention, I/O | ~1% | Built into JDK 11+ — zero cost to always have on |
| JDK Mission Control (JMC) | GUI to open .jfr files — flame graph, event browser | N/A | Desktop app, open the .jfr recording |
| async-profiler | CPU flame graph, allocation profiler | ~1–3% | Attach to running process — best for containers |
| YourKit / JProfiler | Comprehensive — CPU, memory, threads | 5–15% | IDE integration, not for production |
| VisualVM | Method profiling, heap viewer | Moderate | Free, good for dev environment |

**The flame graph:** Imagine a stack of function calls drawn as a bar chart. The WIDTH of each bar = how much CPU time that function consumed. Wide bars at the top of the stack = hot methods you need to fix.

## Step 1: Start a JFR recording on the running process

${F}bash
# Find the Java process ID
jps -l
# → 12345 com.example.OrderServiceApplication

# Start a 60-second JFR recording (zero restart needed — attaches to live JVM)
jcmd 12345 JFR.start name=cpu-profile duration=60s filename=/tmp/cpu-profile.jfr settings=profile

# Wait 60 seconds, then check it's done
jcmd 12345 JFR.check

# Or trigger a dump manually before duration ends
jcmd 12345 JFR.dump name=cpu-profile filename=/tmp/cpu-profile.jfr
${F}

**What you see:**
${F}text
Started recording 1. The result will be written to:
/tmp/cpu-profile.jfr

# After 60s:
Recording 1 (cpu-profile) stopped.
${F}

## Step 2: Open the recording in JDK Mission Control

${F}bash
# Download JMC from https://adoptium.net/jmc
# Open the .jfr file in JMC

# OR use async-profiler for a quick flame graph in the terminal:
# Download async-profiler from https://github.com/async-profiler/async-profiler
./profiler.sh -d 30 -f /tmp/flame.html 12345
# Opens flame.html in browser — click bars to explore
${F}

**What you see in JMC — Method Profiling view:**
${F}text
Method                                        Samples  % CPU
com.fasterxml.jackson.databind.ObjectMapper.readValue  4820   48.2%
java.util.regex.Pattern.compile                         1230   12.3%
com.example.OrderService.calculateDiscount               890    8.9%
java.lang.String.format                                  654    6.5%
...
${F}
**What this means (simple):**
- \`ObjectMapper.readValue\` is eating 48% of all CPU — it's being called thousands of times
- \`Pattern.compile\` is 12% — someone is compiling a regex on every request instead of once
- These are your hot spots — fix these two and CPU will likely drop to 30–40%

## Step 3: Fix the hot methods

**Fix 1: ObjectMapper — share a single instance**
${F}java
// BAD: new ObjectMapper() on every call — very expensive (scans classpath for modules)
public Order parseOrder(String json) {
    return new ObjectMapper().readValue(json, Order.class); // ← creates mapper every time!
}

// GOOD: ObjectMapper is thread-safe — create once, reuse everywhere
@Configuration
public class JacksonConfig {
    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper()
            .findAndRegisterModules()        // register JavaTimeModule etc. once
            .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
    }
}

// Inject and reuse:
@Service
public class OrderParser {
    @Autowired private ObjectMapper objectMapper; // shared instance

    public Order parseOrder(String json) throws JsonProcessingException {
        return objectMapper.readValue(json, Order.class); // ← fast: reuses cached schema
    }
}
${F}

**Fix 2: Regex — compile once, not on every call**
${F}java
// BAD: Pattern.compile() called on every request — extremely expensive
public boolean isValidEmail(String email) {
    return Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$").matcher(email).matches();
    // Pattern.compile runs every time — 12% of your CPU!
}

// GOOD: compile once at class load time — reuse the compiled pattern
private static final Pattern EMAIL_PATTERN =
    Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");

public boolean isValidEmail(String email) {
    return EMAIL_PATTERN.matcher(email).matches(); // ← reuses compiled pattern — near-zero cost
}
${F}

**What you see after fixes — JFR re-recording:**
${F}text
Method                                        Samples  % CPU
com.example.OrderService.calculateDiscount     1890   29.8%   ← now the real top consumer
com.example.InventoryService.checkStock         870   13.7%
com.fasterxml.jackson.databind.ObjectMapper.readValue  210    3.3%  ← dropped from 48% to 3%!
java.util.regex.Pattern.compile                  45    0.7%  ← dropped from 12% to 0.7%!
${F}

## Step 4: Use async-profiler in containers (when JMC is not available)
${F}bash
# In a Kubernetes pod — profile without restarting:
kubectl exec -it order-service-pod -- bash

# Inside the container:
curl -sL https://github.com/async-profiler/async-profiler/releases/download/v3.0/async-profiler-3.0-linux-x64.tar.gz | tar xz
./profiler.sh -d 30 -f /tmp/flame.html $(pgrep java)

# Copy the flame graph out
kubectl cp order-service-pod:/tmp/flame.html ./flame.html
# Open flame.html in your browser
${F}

**What you see in the flame graph:**
${F}text
[Wide orange bar at top]  ObjectMapper.readValue  (48% width)
  └── [narrower bars below] — its callers: OrderParser.parse, OrderController.create, etc.
// The widest bar at the TOP of the stack is your hotspot
${F}

## Your interview answer
**Open:** "When CPU is high but GC looks normal, the problem is in application code — not memory. I'd use JFR to capture a CPU profile without restarting the JVM, then open it in JDK Mission Control to find the hot methods."
**Then:** "The most common findings: ObjectMapper created per-request (share one instance — it's thread-safe), regex compiled per-request (compile once as a static final field), String.format in tight loops (use SLF4J parameters instead), or an inefficient algorithm making O(n²) calls."
**End:** "JFR has ~1% overhead so it's safe to run in production. async-profiler is the alternative for containers where you need a flame graph quickly without copying files off-pod."
`.trim(),

'th-sr-metaspace': `
## 🔥 The situation
Your application throws \`java.lang.OutOfMemoryError: Metaspace\`. The heap looks fine. GC is normal. But Metaspace keeps growing until the JVM dies. This is a class metadata leak.

## 🧠 Understand Metaspace first

${F}text
JVM Memory layout:

┌──────────────────────────────────────────────────────┐
│  Heap                                                │
│  ┌─────────────┐  ┌──────────────────────────────┐  │
│  │  Young Gen  │  │          Old Gen              │  │
│  │ (new objects│  │ (long-lived objects)          │  │
│  │ Eden/S0/S1) │  │                              │  │
│  └─────────────┘  └──────────────────────────────┘  │
└──────────────────────────────────────────────────────┘

Outside heap (native memory):
┌────────────────────┐  ┌─────────────────┐  ┌────────────┐
│  Metaspace         │  │  Code Cache     │  │  Threads   │
│  (class metadata)  │  │  (JIT compiled) │  │  (stacks)  │
│  No fixed limit    │  │                 │  │            │
└────────────────────┘  └─────────────────┘  └────────────┘
${F}

| What Metaspace stores | Example |
|---|---|
| Class definitions | All fields, methods, bytecode of every loaded class |
| Method metadata | Method signatures, local variable types |
| Constant pool | String literals, class references |
| Annotations | All @Annotations on classes and methods |

**Key insight:** A class is ONLY removed from Metaspace when its ClassLoader is garbage collected. If a ClassLoader is accidentally kept alive (referenced somewhere), ALL the classes it loaded stay in Metaspace forever — even if no instances of those classes exist.

## Step 1: Confirm it's a Metaspace OOM
${F}bash
# The error message tells you the type:
java.lang.OutOfMemoryError: Metaspace
# vs
java.lang.OutOfMemoryError: Java heap space
# vs
java.lang.OutOfMemoryError: GC overhead limit exceeded

# Enable Metaspace logging:
java -XX:+PrintFlagsFinal -version 2>&1 | grep MetaspaceSize
${F}

${F}bash
# Monitor Metaspace usage in real time:
jcmd <pid> VM.native_memory summary
${F}

**What you see:**
${F}text
Native Memory Tracking:

Total: reserved=2145MB, committed=412MB
-                 Java Heap (reserved=1024MB, committed=1024MB)
-                     Class (reserved=1056MB, committed=58MB)    ← Metaspace here
                            (classes #87432)                     ← 87,432 classes loaded!
-                    Thread (reserved=42MB, committed=42MB)
-                      Code (reserved=240MB, committed=48MB)
${F}
**What this means (simple):** 87,432 classes loaded is a huge red flag. A typical Spring Boot app loads 10,000–20,000 classes at startup. 87,000 means classes are being generated dynamically (by Groovy, CGLIB, ASM, or similar) and not being unloaded.

## Step 2: See which classes are growing
${F}bash
# Check class loading count over time:
jcmd <pid> VM.class_histogram | head -30
${F}

**What you see:**
${F}text
 num     #instances         #bytes  class name
----------------------------------------------
   1:       1245891      138765432  [B (byte arrays)
   2:        892341       89234100  java.lang.String
   3:         45231       23456789  groovy.lang.GroovyClassLoader$InnerLoader
   4:         45231       18234567  [Ljava.lang.Object;
   5:         12456        8765432  com.example.DynamicClass$EnhancerByCGLIB$...
${F}
**What this means (simple):** 45,231 instances of \`GroovyClassLoader$InnerLoader\` — each one is a ClassLoader. Each one loaded classes that are now stuck in Metaspace. This is the leak. Groovy is creating a new ClassLoader (and therefore new classes) on every script execution.

## Step 3: Enable class loading/unloading trace
${F}bash
# JVM flag to log every class load and unload:
java -XX:+TraceClassLoading -XX:+TraceClassUnloading -jar your-app.jar 2>&1 | head -100
${F}

**What you see:**
${F}text
[Loaded com.example.DynamicRule$1 from __JVM_DefineClass__]
[Loaded com.example.DynamicRule$2 from __JVM_DefineClass__]
[Loaded com.example.DynamicRule$3 from __JVM_DefineClass__]
... (thousands of lines, new class loaded every second)
# No corresponding [Unloaded ...] lines — classes load but never unload
${F}

## Step 4: Find the leak — take a heap dump and look for ClassLoaders
${F}bash
# Trigger a heap dump on the live process:
jcmd <pid> GC.heap_dump /tmp/heap.hprof

# Or enable automatic dump on OOM:
java -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/tmp/heap.hprof -jar your-app.jar
${F}

${F}bash
# Open heap.hprof in Eclipse MAT (Memory Analyzer Tool)
# File → Open Heap Dump → heap.hprof
# Then: Reports → Leak Suspects → Run
${F}

**What MAT shows:**
${F}text
Problem Suspect 1:
  45,231 instances of groovy.lang.GroovyClassLoader$InnerLoader
  Total retained heap: 312 MB

  Accumulation point: com.example.RuleEngine.evaluateRule(String)
  Each call creates a new GroovyClassLoader → loads the script as a new class → ClassLoader stays alive

Shortest path to GC root:
  GroovyClassLoader$InnerLoader → held by → GroovyScript instance → held by → RuleEngine.scriptCache (static Map)
${F}
**What this means (simple):** Every time \`evaluateRule()\` is called with a script string, it creates a new GroovyClassLoader and adds the resulting script to a static Map. The Map holds the ClassLoader alive. ClassLoader holds the classes alive. Classes grow Metaspace forever.

## Step 5: Fix — cache compiled scripts, reuse ClassLoaders
${F}java
// BAD: new GroovyClassLoader on every evaluation
public class RuleEngine {
    public Object evaluate(String script, Map<String, Object> context) {
        GroovyClassLoader gcl = new GroovyClassLoader(); // new ClassLoader every time!
        Class<?> clazz = gcl.parseClass(script);         // new class every time!
        return ((Script) clazz.newInstance()).run();
        // gcl is never closed — stays alive, leaks Metaspace
    }
}

// GOOD: cache the compiled script class — compile once, run many times
@Service
public class RuleEngine {
    private final GroovyClassLoader sharedGcl = new GroovyClassLoader(); // ONE ClassLoader
    private final Map<String, Class<?>> scriptCache = new ConcurrentHashMap<>();

    public Object evaluate(String script, Map<String, Object> context) {
        Class<?> clazz = scriptCache.computeIfAbsent(script, s -> sharedGcl.parseClass(s));
        Script instance = (Script) clazz.getDeclaredConstructor().newInstance();
        instance.setBinding(new Binding(context));
        return instance.run();
    }
    // Now: one ClassLoader, one compiled class per unique script string
    // Metaspace grows once per unique script, then stays flat
}
${F}

**After fix — class count is stable:**
${F}text
# jcmd <pid> VM.native_memory summary
Class (reserved=1056MB, committed=28MB)
      (classes #14231)     ← 14,231 classes — down from 87,432. Flat after startup.
${F}

## Step 6: Set a Metaspace limit as a safety net
${F}bash
# Without a limit, Metaspace can grow until the OS runs out of native memory — hard to debug
java -XX:MaxMetaspaceSize=256m -jar your-app.jar

# If Metaspace grows past 256MB, you get OOMError: Metaspace EARLY
# — easier to diagnose than a full OS memory exhaustion
${F}

## Your interview answer
**Open:** "Metaspace OOM means class metadata is growing without bound — almost always a ClassLoader leak. Each ClassLoader holds a reference chain to all the classes it loaded, keeping them in Metaspace forever."
**Then:** "I'd check the class count with \`jcmd VM.native_memory\` — if it's in the tens of thousands and growing, that confirms the leak. Then I'd take a heap dump and open it in Eclipse MAT, looking at the Leak Suspects report to find which ClassLoader is accumulating and what's holding it alive."
**End:** "The fix is almost always: don't create new ClassLoaders per request. Compile scripts or dynamically generated classes once, cache the result, and reuse it. Set -XX:MaxMetaspaceSize as a guard so you get a clear OOM message before the OS runs out of native memory."
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
