import { readFileSync, writeFileSync } from 'fs';
const FILE = 'public/data/scenarioInterviewThemes.json';
const F = '```';

const answers = {

'jvm-oom-classify': `
## 🔥 The situation

Your Java app crashes with \`OutOfMemoryError\`. But \`OutOfMemoryError\` isn't one thing — there are five different types, each pointing to a completely different cause and fix. Confusing heap OOM with Metaspace OOM will send your debugging down the wrong path entirely.

---

## 🧠 Understand this first

| OOM Type | Message | What it means |
|---|---|---|
| **Heap OOM** | \`Java heap space\` | App allocated more objects than \`-Xmx\` allows |
| **Metaspace OOM** | \`Metaspace\` | Too many classes loaded — usually a ClassLoader leak |
| **GC Overhead** | \`GC overhead limit exceeded\` | JVM spent >98% of time in GC but freed <2% — effectively out of heap |
| **Direct buffer OOM** | \`Direct buffer memory\` | Off-heap NIO/Netty buffers exceeded \`-XX:MaxDirectMemorySize\` |
| **Stack OOM** | \`unable to create new native thread\` | Too many threads; OS process limit reached |

---

## Step 1 — Reproduce and read the error message carefully

${F}bash
# Run your app with heap dump on OOM enabled
java -Xmx2g \
  -XX:+HeapDumpOnOutOfMemoryError \
  -XX:HeapDumpPath=/tmp/heapdump.hprof \
  -XX:+ExitOnOutOfMemoryError \
  -jar myapp.jar
${F}

**Heap OOM — what you see:**
${F}
java.lang.OutOfMemoryError: Java heap space
    at java.util.Arrays.copyOf(Arrays.java:3210)
    at com.example.DataService.loadAll(DataService.java:89)
${F}

**Metaspace OOM — what you see:**
${F}
java.lang.OutOfMemoryError: Metaspace
    at java.lang.ClassLoader.defineClass1(Native Method)
    at sun.reflect.GeneratedSerializationConstructorAccessor1.<clinit>(Unknown Source)
${F}

**GC Overhead — what you see:**
${F}
java.lang.OutOfMemoryError: GC overhead limit exceeded
    at com.example.cache.LRUCache.put(LRUCache.java:145)
${F}

**Direct buffer — what you see:**
${F}
java.lang.OutOfMemoryError: Direct buffer memory
    at java.nio.Bits.reserveMemory(Bits.java:694)
    at io.netty.buffer.UnpooledDirectByteBuf.<init>(UnpooledDirectByteBuf.java:64)
${F}

**Stack OOM — what you see:**
${F}
java.lang.OutOfMemoryError: unable to create new native thread
    at java.lang.Thread.start0(Native Method)
    at java.lang.Thread.start(Thread.java:714)
${F}

---

## Step 2 — Diagnose and fix each type

**Heap OOM fix:**

${F}bash
# Check heap usage trend
jcmd <PID> VM.native_memory summary

# Analyze heap dump for largest retained objects
# Download Eclipse MAT → File → Open Heap Dump
# Look at: Leak Suspects report → shows biggest memory consumers
${F}

Fix: either increase \`-Xmx\`, fix a memory leak, or reduce object retention (smaller caches, shorter TTLs).

**Metaspace OOM fix:**

${F}bash
# Count loaded classes over time
jstat -class <PID> 1000 30   # every 1 second, 30 times
# If class count keeps growing → ClassLoader leak

# Find which classloader is leaking
jcmd <PID> GC.class_stats | sort -k2 -rn | head -20
${F}

Fix: find where new ClassLoaders are created without being garbage collected. Common in JSP engines, GroovyShell, or dynamic proxy generation in loops.

**GC Overhead fix:**

${F}bash
# Enable GC logging
java -Xlog:gc*:file=/tmp/gc.log:time,uptime -jar myapp.jar
grep "pause" /tmp/gc.log | tail -20
# If consecutive GC events with tiny freed bytes → heap is full and thrashing
${F}

Fix: increase \`-Xmx\` or find what's filling the heap (usually a leak or unbounded cache).

**Direct buffer fix:**

${F}bash
# Check direct buffer usage
jcmd <PID> VM.native_memory summary | grep "Internal"
# Or via JMX: java.nio:type=BufferPool,name=direct → MemoryUsed
${F}

${F}java
# Limit direct memory
java -XX:MaxDirectMemorySize=512m -jar myapp.jar
${F}

Fix: look for ByteBuffer.allocateDirect() calls that aren't being released, or Netty pools that are too large.

**Stack OOM fix:**

${F}bash
# Check thread count
jcmd <PID> Thread.print | grep "Thread-" | wc -l
# Or
ps -eLf | grep myapp | wc -l

# Find what's creating threads
jcmd <PID> Thread.print | head -100
${F}

Fix: look for unbounded thread creation — e.g., a new Thread() call inside a loop or per-request. Replace with a thread pool of fixed size.

---

## 💡 Interview answer

**Open:** "We got an OOM in production and the first question I ask is: which kind? Each type has a completely different root cause."

**Then:** "The error message tells you the type. \`Java heap space\` means allocated objects exceeded \`-Xmx\` — analyze a heap dump. \`Metaspace\` means too many classes loaded — look for ClassLoader leaks. \`unable to create new native thread\` means thread count exceeded the OS limit — look for unbounded thread creation. I always run with \`-XX:+HeapDumpOnOutOfMemoryError\` and \`-XX:+ExitOnOutOfMemoryError\` so we get a dump before the process dies and then it restarts cleanly."

**End:** "The \`-XX:+ExitOnOutOfMemoryError\` flag is important — without it, the JVM can limp on in a degraded state that's hard to diagnose. A fast restart with a heap dump is better than a zombie process. K8s will restart the container and you have the dump to investigate."
`.trim(),

'jvm-oom-leak-vs-sizing': `
## 🔥 The situation

Heap OOM can happen for two completely different reasons: the heap is just too small (a **sizing** problem — add more memory and it goes away), or the app is accumulating objects it never releases (a **memory leak** — adding memory just delays the crash). Treating a leak as a sizing problem is a common and expensive mistake.

---

## 🧠 Understand this first

| Type | Symptom | Fix |
|---|---|---|
| **Sizing issue** | OOM happens at peak load, heap usage returns to normal after | Increase \`-Xmx\` |
| **Memory leak** | Heap usage grows monotonically over time, never returns to baseline | Find and fix the leak |

**How to tell the difference:**
- Sizing: heap usage correlates with load — busy times = high heap, quiet times = heap drops
- Leak: heap usage grows even when load is low; saw-tooth GC pattern that's always trending up

---

## Step 1 — Check heap usage over time

${F}bash
# Monitor heap usage every 5 seconds for 60 seconds
jstat -gcutil <PID> 5000 12
${F}

**What you see (sizing issue — usage drops after GC):**
${F}
  S0     S1     E      O      M     CCS    YGC     YGCT    FGC    FGCT     GCT
  0.00  98.45  45.23  72.10  95.23  87.45    145    8.234     2    1.245    9.479
  0.00  98.45  67.89  72.10  95.23  87.45    146    8.301     2    1.245    9.546
  0.00   0.00  12.34  58.45  95.23  87.45    147    8.367     2    1.245    9.612  ← GC ran, heap dropped
  0.00  98.45  34.56  58.45  95.23  87.45    148    8.432     2    1.245    9.677
${F}

**O column = Old Gen.** After GC, Old Gen dropped from 72% to 58% — that's good. It means objects are being freed.

**What you see (memory leak — Old Gen keeps growing):**
${F}
  S0     S1     E      O      M     ...
  0.00  98.45  45.23  65.10  ...
  0.00   0.00  12.34  71.23  ...   ← GC ran but Old Gen went UP
  0.00  98.45  34.56  74.56  ...   ← still growing after GC
  0.00   0.00  10.45  78.90  ...   ← growing
  ...
  FULL GC                  95.00  ...
  java.lang.OutOfMemoryError: Java heap space
${F}

Old Gen growing across GC cycles = leak.

---

## Step 2 — Capture and analyze a heap dump

${F}bash
# Take a live heap dump without killing the process
jcmd <PID> GC.heap_dump /tmp/heap-$(date +%s).hprof

# Or at OOM time (automatic):
java -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/tmp/ -jar myapp.jar
${F}

**Analyze with Eclipse MAT:**
${F}
1. File → Open Heap Dump → select .hprof
2. Reports → Leak Suspects → Run
3. Look for "Problem Suspect 1: ... accumulates ... bytes"
${F}

**What MAT typically shows for a leak:**
${F}
Problem Suspect 1:
  One instance of "com.example.UserSessionCache"
  occupies 1.8 GB (89%) of the heap

  Shortest paths from GC roots:
  com.example.UserSessionCache.sessions → java.util.HashMap
    → 847,293 UserSession objects (never expired!)
${F}

---

## Step 3 — Common leak patterns and fixes

**Pattern 1 — Unbounded static cache:**

${F}java
// BUG: static map grows forever
public class UserCache {
    private static final Map<String, UserSession> sessions = new HashMap<>();

    public static void store(String id, UserSession session) {
        sessions.put(id, session); // never removed!
    }
}

// FIX: use Caffeine with size and time limits
private static final Cache<String, UserSession> sessions = Caffeine.newBuilder()
    .maximumSize(10_000)
    .expireAfterWrite(30, TimeUnit.MINUTES)
    .build();
${F}

**Pattern 2 — Listener/callback not removed:**

${F}java
// BUG: every call adds a listener but never removes it
eventBus.register(new OrderEventListener(order)); // listener holds reference to order

// FIX: deregister when done
OrderEventListener listener = new OrderEventListener(order);
eventBus.register(listener);
try {
    processOrder(order);
} finally {
    eventBus.unregister(listener); // always deregister
}
${F}

**Pattern 3 — ThreadLocal not cleared:**

${F}java
// BUG: thread pool reuses threads; ThreadLocal data from previous request persists
private static ThreadLocal<RequestContext> context = new ThreadLocal<>();
context.set(new RequestContext(request)); // set but never removed

// FIX: always remove in finally
try {
    context.set(new RequestContext(request));
    processRequest();
} finally {
    context.remove(); // critical — prevents leak in thread pools
}
${F}

---

## 💡 Interview answer

**Open:** "We increased \`-Xmx\` three times over six months and kept hitting OOM. The ops team said 'just add more memory' but I suspected a leak because heap usage never returned to baseline even at low traffic."

**Then:** "I used \`jstat -gcutil\` to confirm: Old Gen kept growing after every GC cycle — a classic leak signature. A heap dump showed 89% of heap was one \`HashMap\` in our \`UserSessionCache\` — a static map that stored sessions but never evicted them. Fixed by replacing with a Caffeine cache capped at 10,000 entries with 30-minute expiry."

**End:** "The key diagnostic is whether Old Gen drops after a Full GC. If yes, it's a sizing issue. If Old Gen stays high or grows — it's a leak, and adding memory only delays the next crash. \`jstat -gcutil <PID> 5000\` gives you this answer in about 30 seconds."
`.trim(),

'jvm-oom-offheap-direct': `
## 🔥 The situation

Your app uses Netty (via Spring WebFlux) or NIO, and you're seeing \`OutOfMemoryError: Direct buffer memory\`. This is confusing because your heap looks fine — JVM heap usage is low, GC is healthy. The problem is in **off-heap** memory — native memory allocated outside the JVM heap using \`ByteBuffer.allocateDirect()\`. This memory is invisible to heap monitoring tools.

---

## 🧠 Understand this first

| Concept | What it means |
|---|---|
| **Direct buffer** | \`ByteBuffer.allocateDirect(n)\` — allocates native OS memory, not JVM heap |
| **Netty pooled allocator** | Netty pre-allocates large chunks of direct memory for performance |
| **MaxDirectMemorySize** | JVM flag limiting total direct buffer allocation (default = \`-Xmx\`) |
| **\`sun.misc.Cleaner\`** | Mechanism that frees direct buffers when GC collects the \`ByteBuffer\` reference |
| **Phantom reference lag** | Direct memory freed only when GC collects the ByteBuffer — not immediately |

---

## Step 1 — Confirm it's direct buffer OOM

${F}
java.lang.OutOfMemoryError: Direct buffer memory
    at java.nio.Bits.reserveMemory(Bits.java:694)
    at java.nio.DirectByteBuffer.<init>(DirectByteBuffer.java:123)
    at io.netty.buffer.UnpooledUnsafeDirectByteBuf.allocateDirect(UnpooledUnsafeDirectByteBuf.java:104)
${F}

---

## Step 2 — Monitor direct buffer usage

${F}java
// Via JMX — works at runtime
MBeanServer mbeanServer = ManagementFactory.getPlatformMBeanServer();
ObjectName bufferPoolName = new ObjectName("java.nio:type=BufferPool,name=direct");

Long memoryUsed = (Long) mbeanServer.getAttribute(bufferPoolName, "MemoryUsed");
Long totalCapacity = (Long) mbeanServer.getAttribute(bufferPoolName, "TotalCapacity");
Long count = (Long) mbeanServer.getAttribute(bufferPoolName, "Count");

System.out.printf("Direct buffers: %d buffers, %d MB used, %d MB capacity%n",
    count, memoryUsed / 1024 / 1024, totalCapacity / 1024 / 1024);
${F}

**What you see:**
${F}
Direct buffers: 15,234 buffers, 2,847 MB used, 2,847 MB capacity
${F}

If usage keeps growing → leak. If it's near \`MaxDirectMemorySize\` → need to increase the limit or reduce usage.

**Via command line:**
${F}bash
jcmd <PID> VM.native_memory summary | grep "Internal"
# Internal section includes direct buffer allocations

# Or check via JFR
jcmd <PID> JFR.start duration=60s filename=/tmp/jfr.jfr name=direct-mem
jfr print --events jdk.DirectBufferStatistics /tmp/jfr.jfr
${F}

---

## Step 3 — Common causes and fixes

**Cause 1 — Netty pool size too large:**

${F}yaml
# application.yml (Spring WebFlux/Reactor Netty)
spring:
  netty:
    connection-provider:
      max-connections: 500        # limit HTTP connection pool
    http-resources:
      shutdown-quiet-period: 2s

# JVM flag to limit direct memory
# In JAVA_OPTS:
# -XX:MaxDirectMemorySize=512m
${F}

**Cause 2 — DirectByteBuffer not being freed:**

${F}java
// BUG: ByteBuffer created but reference not released
public void processFile(Path path) throws IOException {
    FileChannel channel = FileChannel.open(path);
    ByteBuffer buffer = ByteBuffer.allocateDirect(1024 * 1024); // 1MB direct
    channel.read(buffer);
    // buffer goes out of scope but GC might not run soon
    // direct memory is NOT freed until GC collects the ByteBuffer object
}

// FIX: Use try-with-resources and explicitly clean
public void processFile(Path path) throws IOException {
    try (FileChannel channel = FileChannel.open(path)) {
        ByteBuffer buffer = ByteBuffer.allocateDirect(1024 * 1024);
        channel.read(buffer);
        buffer.flip();
        process(buffer);
        // Explicitly clean the direct buffer
        ((DirectBuffer) buffer).cleaner().clean();
    }
}
${F}

**Cause 3 — Force GC to release phantom references:**

${F}java
// If direct buffers are piling up because GC isn't running frequently:
System.gc(); // triggers GC which processes phantom references and frees direct buffers
// Alternatively, tune GC to run more frequently with smaller young gen
${F}

---

## Step 4 — Set explicit limits

${F}bash
java \
  -XX:MaxDirectMemorySize=512m \   # cap direct buffer at 512MB
  -XX:+HeapDumpOnOutOfMemoryError \
  -Dio.netty.maxDirectMemory=268435456 \  # Netty-specific: 256MB
  -jar myapp.jar
${F}

---

## 💡 Interview answer

**Open:** "We had OOM crashes on direct buffer memory — confusing because heap looked fine. The JVM was using ~500MB of heap but 3GB of direct memory from Netty's buffer pool."

**Then:** "I monitored via JMX \`java.nio:type=BufferPool,name=direct\` and saw 15,000 direct buffers accumulating. The root cause: our reactive WebFlux controllers were creating large response objects that held Netty buffers longer than expected because subscribers weren't releasing them promptly. Fixed by adding \`-XX:MaxDirectMemorySize=512m\` to surface the limit clearly, then investigating and fixing the buffer retention."

**End:** "The key insight: direct buffer memory is freed by Java's GC via phantom references — but only when the \`ByteBuffer\` Java object is collected. If your heap has lots of free space, GC might not run often enough to free the phantom references, causing direct memory to grow. You can trigger GC explicitly or tune \`-XX:MaxDirectMemorySize\` to force it to fail fast and surface the issue rather than quietly exhaust native memory."
`.trim(),

'jvm-oom-k8s-dump-runbook': `
## 🔥 The situation

Your Java pod in Kubernetes gets OOMKilled — either by the JVM itself (OOM exception) or by the Linux OOM killer (pod exceeds container memory limit). When the pod restarts, the evidence is gone. How do you capture a heap dump before the pod dies, and how do you actually debug it? This is the operational runbook for getting the right data.

---

## 🧠 Understand this first

| Scenario | What happens | How to capture |
|---|---|---|
| **JVM OOM exception** | \`OutOfMemoryError\` thrown; JVM can still run | \`-XX:+HeapDumpOnOutOfMemoryError\` dumps automatically |
| **Container OOM kill** | K8s/Linux kills the process before JVM throws OOM | Must export dump to a persistent volume first |
| **Exit code 137** | \`128 + 9 (SIGKILL)\` = OOM kill by container runtime | Check \`kubectl describe pod\` |
| **Exit code 1** | Clean JVM exit after OOM | JVM threw OOM, may have written heap dump |

---

## Step 1 — Configure the pod to survive long enough for dump

${F}yaml
# k8s/deployment.yaml
containers:
  - name: order-service
    resources:
      requests:
        memory: "2Gi"
      limits:
        memory: "3Gi"    # give headroom for the JVM overhead + dump writing

    env:
      - name: JAVA_OPTS
        value: >-
          -XX:+UseContainerSupport
          -XX:MaxRAMPercentage=65
          -XX:+HeapDumpOnOutOfMemoryError
          -XX:HeapDumpPath=/dumps/heapdump.hprof
          -XX:+ExitOnOutOfMemoryError
          -XX:OnOutOfMemoryError="chmod 666 /dumps/heapdump.hprof"

    volumeMounts:
      - name: dump-volume
        mountPath: /dumps

volumes:
  - name: dump-volume
    persistentVolumeClaim:
      claimName: jvm-dump-pvc   # or emptyDir for ephemeral storage
${F}

**PVC for persistent dump storage:**
${F}yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: jvm-dump-pvc
spec:
  accessModes: [ReadWriteOnce]
  resources:
    requests:
      storage: 10Gi
${F}

---

## Step 2 — Detect and retrieve the dump

${F}bash
# Step 1: Check if pod was OOMKilled
kubectl describe pod order-service-xyz | grep -A 5 "Last State:"

# Expected output:
# Last State:   Terminated
#   Reason:     OOMKilled
#   Exit Code:  137

# Step 2: Check if heap dump was written (before pod restarts)
kubectl exec order-service-xyz -- ls -lh /dumps/
# output: -rw------- 1 root root 1.8G Jan 15 14:47 heapdump.hprof

# Step 3: Copy dump to local machine
kubectl cp order-service-xyz:/dumps/heapdump.hprof ./heapdump.hprof
# This may take several minutes for large dumps

# Or if pod is already dead — copy from the PVC via a debug pod
kubectl run debug-pod --image=alpine --restart=Never \
  --overrides='{"spec":{"volumes":[{"name":"dumps","persistentVolumeClaim":{"claimName":"jvm-dump-pvc"}}],"containers":[{"name":"debug","image":"alpine","volumeMounts":[{"name":"dumps","mountPath":"/dumps"}],"command":["sleep","3600"]}]}}'

kubectl cp debug-pod:/dumps/heapdump.hprof ./heapdump.hprof
kubectl delete pod debug-pod
${F}

---

## Step 3 — Analyze the heap dump

${F}bash
# Option A: Eclipse MAT (GUI — recommended)
# 1. Download from eclipse.dev/mat/
# 2. File → Open Heap Dump → select heapdump.hprof
# 3. Run "Leak Suspects" report
# 4. Look at "Dominator Tree" for largest objects

# Option B: jhat (command line, basic)
jhat -port 7000 -J-Xmx4g heapdump.hprof
# Browse http://localhost:7000

# Option C: jmap (get class histogram without full dump)
jmap -histo:live <PID> | head -30
${F}

**What Eclipse MAT Leak Suspects shows:**
${F}
Problem Suspect 1:
  One instance of "org.springframework.web.context.request.RequestContextHolder"
  occupies 1.4 GB (78%) of the heap.

  Accumulated Objects:
    java.util.ArrayList → 847,293 instances
    com.example.OrderRequest → 847,293 instances

  Likely cause: Orders being accumulated in a request-scoped component
               that's actually application-scoped (wrong @Scope annotation)
${F}

---

## Step 4 — Automate dump collection with a sidecar

${F}yaml
# Sidecar that watches for heap dumps and uploads to S3
containers:
  - name: dump-watcher
    image: amazon/aws-cli:latest
    command:
      - /bin/sh
      - -c
      - |
        while true; do
          if [ -f /dumps/heapdump.hprof ]; then
            echo "Heap dump found, uploading..."
            aws s3 cp /dumps/heapdump.hprof s3://my-bucket/dumps/$(hostname)-$(date +%s).hprof
            rm /dumps/heapdump.hprof
          fi
          sleep 30
        done
    volumeMounts:
      - name: dump-volume
        mountPath: /dumps
    env:
      - name: AWS_DEFAULT_REGION
        value: us-east-1
${F}

---

## 💡 Interview answer

**Open:** "Our Java pods were OOMKilling every few days, and by the time we looked at them, the pod had restarted and evidence was gone."

**Then:** "I set up a PersistentVolumeClaim mounted at \`/dumps\` and configured \`-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/dumps/heapdump.hprof\`. Added \`-XX:+ExitOnOutOfMemoryError\` so the JVM exits cleanly after writing the dump. On the next OOM, I used \`kubectl cp\` to pull the 1.8GB dump and analyzed it in Eclipse MAT — found 847K \`OrderRequest\` objects held by an application-scoped bean that should have been request-scoped."

**End:** "The runbook I now follow for any OOM: (1) check exit code — 137 = container OOM kill, not JVM OOM; (2) look for the heap dump on the PVC; (3) run Leak Suspects in MAT. For exit code 137 without a heap dump (Linux killed before JVM could write it), increase the container memory limit slightly to give the JVM time to dump before being killed. The \`preStop\` hook can also buy a few seconds: \`preStop: exec: command: ['kill', '-3', '1']\` triggers a thread dump before SIGTERM."
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
