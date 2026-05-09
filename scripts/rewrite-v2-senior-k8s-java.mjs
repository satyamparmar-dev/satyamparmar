import { readFileSync, writeFileSync } from 'fs';
const FILE = 'public/data/scenarioInterviewThemes.json';
const F = '```';

const answers = {

'th-k8s-probes-warmup': `
## 🔥 The situation

Your Spring Boot app takes 30 seconds to start (loading caches, warming up Hibernate, connecting to the database). Kubernetes marks it Ready after 10 seconds because the health endpoint responds, and starts sending real traffic. The app isn't ready — requests fail. Or worse, Kubernetes kills the pod thinking it's stuck because the startup probe times out too early.

---

## 🧠 Understand this first

| Probe Type | Purpose | When it fails |
|---|---|---|
| **startupProbe** | Tells K8s when the app has *started* — gates liveness/readiness probes | Pod is killed and restarted |
| **livenessProbe** | Is the app alive? (not deadlocked/hung) | Pod is killed and restarted |
| **readinessProbe** | Is the app ready to accept traffic? | Pod removed from Service endpoints |

**Key rule:** \`startupProbe\` must succeed before \`livenessProbe\` starts. This prevents liveness from killing a slow-starting pod.

---

## Step 1 — Add Spring Boot Actuator health groups

${F}xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
${F}

${F}yaml
# application.yml
management:
  endpoint:
    health:
      probes:
        enabled: true          # enables /actuator/health/liveness and /readiness
      show-details: always
  health:
    livenessstate:
      enabled: true
    readinessstate:
      enabled: true
${F}

Spring Boot auto-manages these two states:
- \`/actuator/health/liveness\` → \`{"status":"UP"}\` as soon as app context loads
- \`/actuator/health/readiness\` → \`{"status":"OUT_OF_SERVICE"}\` until your custom warmup completes

---

## Step 2 — Signal readiness after warmup

${F}java
@Component
public class AppWarmup implements ApplicationListener<ApplicationReadyEvent> {

    private final ApplicationContext applicationContext;

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        // Do your warmup here — cache loading, DB connection check, etc.
        log.info("Starting warmup...");
        cacheLoader.preloadAll();
        hibernateSchemaValidator.validate();
        log.info("Warmup complete — marking app as READY");

        // Tell Spring Boot the app is ready for traffic
        AvailabilityChangeEvent.publish(applicationContext,
            ReadinessState.ACCEPTING_TRAFFIC);
    }
}
${F}

Until \`ACCEPTING_TRAFFIC\` is published, \`/actuator/health/readiness\` returns \`OUT_OF_SERVICE\` — Kubernetes won't send traffic.

---

## Step 3 — Configure K8s probes correctly

${F}yaml
# k8s/deployment.yaml
containers:
  - name: order-service
    image: myregistry/order-service:1.2.3
    ports:
      - containerPort: 8080

    startupProbe:
      httpGet:
        path: /actuator/health/liveness
        port: 8080
      failureThreshold: 30      # allow up to 30 × 10s = 5 minutes to start
      periodSeconds: 10
      # Liveness/readiness probes DON'T START until startupProbe succeeds

    livenessProbe:
      httpGet:
        path: /actuator/health/liveness
        port: 8080
      initialDelaySeconds: 0    # startupProbe already handled the delay
      periodSeconds: 10
      failureThreshold: 3       # 3 failures → restart pod

    readinessProbe:
      httpGet:
        path: /actuator/health/readiness
        port: 8080
      initialDelaySeconds: 0
      periodSeconds: 5
      failureThreshold: 3       # 3 failures → remove from Service endpoints
${F}

---

## Step 4 — Verify probe behavior

${F}bash
# Check probe status
kubectl describe pod order-service-abc | grep -A 10 "Conditions:"

# Watch events for probe failures
kubectl get events --sort-by='.lastTimestamp' | grep -i "liveness\|readiness\|startup"
${F}

**What you see (before warmup completes):**
${F}
Readiness probe failed: HTTP probe failed with statuscode: 503
Warning  Unhealthy  Readiness probe failed → pod not in endpoints (no traffic)
${F}

**What you see (after warmup):**
${F}
Normal   Started   Started container order-service
Normal   Pulled    Successfully pulled image
Normal   Healthy   Startup probe succeeded
→ Pod added to Service endpoints — traffic flows
${F}

---

## 💡 Interview answer

**Open:** "After a rolling deployment, new pods were receiving traffic while still warming up their caches — first 30 seconds of requests were slow because the cache was cold, causing p99 latency spikes on every deploy."

**Then:** "I split the health endpoints using Spring Boot's built-in liveness/readiness probe support. The key change: the \`ApplicationReadyEvent\` listener runs warmup first, then publishes \`ACCEPTING_TRAFFIC\` — so K8s readiness probe stays 503 until warmup is done. The \`startupProbe\` with \`failureThreshold=30\` gives the pod up to 5 minutes to pass liveness without being killed."

**End:** "After the fix, rolling deploys are smooth — new pods never receive traffic until fully warm. The separation between liveness (\`/health/liveness\`) and readiness (\`/health/readiness\`) is crucial: liveness going down restarts the pod; readiness going down just removes it from the load balancer, which is what you want during warmup or maintenance windows."
`.trim(),

'th-k8s-oomkilled-heap': `
## 🔥 The situation

Your Java pod in Kubernetes keeps getting killed with \`OOMKilled\` status. The JVM has 4GB heap set with \`-Xmx4g\`, and your K8s pod limit is also 4GB. Sounds fine — but you're ignoring all the other memory the JVM uses outside the heap. The container limit gets breached and the kernel's OOM killer terminates the process.

---

## 🧠 Understand this first

| Memory Region | What it is | Typical size |
|---|---|---|
| **Heap** | Objects your app allocates — controlled by \`-Xmx\` | 60-70% of container limit |
| **Metaspace** | Class metadata — grows with loaded classes, libraries | 256MB+ for large apps |
| **Thread stacks** | Each thread has a stack (~512KB default) | 200 threads × 512KB = 100MB |
| **Code cache** | JIT-compiled native code | 64-240MB |
| **Direct buffers** | Off-heap memory (NIO, Netty) | Variable |
| **JVM overhead** | Runtime structures, GC internal data | ~100-200MB |

**Rule of thumb:** Container memory limit = Xmx + ~500MB-1GB overhead. Never set Xmx equal to the container limit.

---

## Step 1 — Diagnose the OOMKill

${F}bash
# Check if pod was OOMKilled
kubectl describe pod order-service-xyz | grep -A 5 "Last State:"
${F}

**What you see:**
${F}
Last State:   Terminated
  Reason:     OOMKilled         ← kernel killed it for exceeding memory limit
  Exit Code:  137               ← 128 + 9 (SIGKILL)
  Started:    Mon, 15 Jan 2024 14:00:00 +0000
  Finished:   Mon, 15 Jan 2024 14:47:23 +0000
${F}

${F}bash
# Check memory usage before the kill
kubectl top pods order-service-xyz --containers

# Check container limits
kubectl get pod order-service-xyz -o jsonpath='{.spec.containers[0].resources}'
${F}

---

## Step 2 — Set correct JVM heap and container limits

${F}yaml
# k8s/deployment.yaml
containers:
  - name: order-service
    resources:
      requests:
        memory: "2Gi"
        cpu: "500m"
      limits:
        memory: "3Gi"    # container limit
        cpu: "2000m"

    env:
      # Heap = container limit - overhead
      # 3GB limit → 2GB heap (leaves 1GB for Metaspace, threads, code cache, etc.)
      - name: JAVA_OPTS
        value: >-
          -Xms1g
          -Xmx2g
          -XX:MetaspaceSize=256m
          -XX:MaxMetaspaceSize=512m
          -XX:ReservedCodeCacheSize=256m
          -XX:+UseG1GC
          -XX:+HeapDumpOnOutOfMemoryError
          -XX:HeapDumpPath=/tmp/heapdump.hprof
${F}

**Even better — use container-aware JVM flags:**

${F}yaml
env:
  - name: JAVA_OPTS
    value: >-
      -XX:+UseContainerSupport
      -XX:MaxRAMPercentage=65.0
      -XX:InitialRAMPercentage=50.0
      -XX:+HeapDumpOnOutOfMemoryError
      -XX:HeapDumpPath=/tmp/heapdump.hprof
${F}

\`-XX:MaxRAMPercentage=65.0\` automatically sets Xmx to 65% of the container memory limit — no hardcoded values. If the container limit is 3GB, heap is capped at ~2GB, leaving ~1GB for JVM overhead.

---

## Step 3 — Monitor native memory to find the real culprit

${F}bash
# Enable Native Memory Tracking to see all JVM memory regions
java -XX:NativeMemoryTracking=summary -jar myapp.jar

# Query at runtime
jcmd <PID> VM.native_memory summary
${F}

**What you see:**
${F}
Native Memory Tracking:
Total: reserved=6.2GB, committed=3.8GB
-                 Java Heap (reserved=2048MB, committed=2048MB)
-                  Class (reserved=1100MB, committed=115MB)   ← Metaspace
-                 Thread (reserved=322MB, committed=322MB)    ← 322 threads!
-                   Code (reserved=245MB, committed=46MB)
-                Internal (reserved=42MB, committed=42MB)
-              Compiler (reserved=1MB, committed=1MB)
-        Shared class (reserved=12MB, committed=12MB)
${F}

If Metaspace is huge, you might have a class loader leak. If Thread is huge, you have too many threads.

---

## Step 4 — Get the heap dump before the pod is killed

${F}yaml
# Sidecar container to copy heap dump before pod terminates
initContainers: []
containers:
  - name: order-service
    env:
      - name: JAVA_OPTS
        value: -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/dumps/heap.hprof
    volumeMounts:
      - name: dumps
        mountPath: /dumps

volumes:
  - name: dumps
    emptyDir: {}
${F}

${F}bash
# After the pod dies, copy the dump before it's cleaned up
kubectl cp order-service-xyz:/dumps/heap.hprof ./heap.hprof

# Analyze with Eclipse MAT or jhat
jhat -port 7000 heap.hprof
# Open http://localhost:7000
${F}

---

## 💡 Interview answer

**Open:** "Our Java pods were getting OOMKilled every few hours. We had \`-Xmx4g\` set and the container limit was also 4GB — we thought that was safe."

**Then:** "The mistake was ignoring JVM overhead. With 4GB limit, the heap consumed all 4GB, and Metaspace, thread stacks, code cache, and GC metadata pushed total JVM memory to 4.8GB — the kernel OOM killer fired at 4GB. I switched to \`-XX:MaxRAMPercentage=65\` so the heap auto-caps at 65% of the container limit. With a 4GB limit, heap caps at ~2.6GB, leaving 1.4GB buffer for JVM overhead."

**End:** "I also added \`-XX:HeapDumpOnOutOfMemoryError\` to capture a heap dump on the next occurrence — the dump revealed a static cache holding onto request objects indefinitely, which was the actual memory leak. Use \`NativeMemoryTracking=summary\` with \`jcmd VM.native_memory\` to see exactly how the JVM is using memory broken down by region."
`.trim(),

'th-k8s-cpu-throttle-gc': `
## 🔥 The situation

Your Java app in Kubernetes shows high latency — but CPU usage looks low, memory is fine, there are no errors. The real problem: Kubernetes CPU throttling is silently pausing your JVM when it exceeds its CPU limit. This interrupts GC threads, causes GC pauses to take much longer than expected, and creates latency spikes that look like GC problems but are actually a CPU configuration issue.

---

## 🧠 Understand this first

| Concept | What it means |
|---|---|
| **CPU limit** | K8s caps how much CPU a container can use per period (100ms window by default) |
| **CPU throttling** | When a container hits its limit, cgroups pauses it for the rest of the period |
| **CPU request** | Guaranteed minimum CPU — used for scheduling; doesn't cap usage |
| **Throttle %** | (Throttled time / total CPU time) × 100 — should be < 25% ideally |
| **GC + throttling** | GC needs CPU bursts; throttling pauses GC mid-collection → longer GC pauses |
| **VPA (Vertical Pod Autoscaler)** | K8s component that recommends/sets CPU and memory based on actual usage |

---

## Step 1 — Detect CPU throttling

${F}bash
# Check throttling at the container level via cgroups
kubectl exec order-service-xyz -- cat \
  /sys/fs/cgroup/cpu/cpu.stat
${F}

**What you see:**
${F}
nr_periods 5421
nr_throttled 2890          ← throttled in 2890 out of 5421 periods!
throttled_time 48293000000 ← 48 seconds of throttle time
${F}

**What this means:** 53% of scheduling periods were throttled — the JVM was being paused over half the time.

**Check via Prometheus (if kube-state-metrics is installed):**
${F}
# Throttle ratio (should be < 0.25)
rate(container_cpu_cfs_throttled_seconds_total{pod=~"order-service.*"}[5m])
/ rate(container_cpu_cfs_periods_total{pod=~"order-service.*"}[5m])
${F}

---

## Step 2 — Fix CPU limits

**Option A — Remove the CPU limit (controversial but effective):**

${F}yaml
resources:
  requests:
    cpu: "1000m"    # guaranteed 1 CPU
    memory: "2Gi"
  limits:
    # NO cpu limit — JVM can burst freely
    # K8s scheduler still uses request for placement
    memory: "3Gi"  # always keep memory limit
${F}

**Option B — Set a higher limit that allows GC bursts:**

${F}yaml
resources:
  requests:
    cpu: "1000m"
  limits:
    cpu: "4000m"    # allow up to 4 CPUs during GC bursts
    memory: "3Gi"
${F}

**Rule of thumb:** Java GC needs CPU bursts proportional to heap size. For a 2GB heap with G1GC, plan for 2-4x the steady-state CPU during GC.

---

## Step 3 — Tune GC for lower CPU burst requirements

${F}yaml
env:
  - name: JAVA_OPTS
    value: >-
      -XX:+UseG1GC
      -XX:MaxGCPauseMillis=200          # GC pause target
      -XX:GCTimeRatio=4                 # spend ≤ 20% of time in GC (1/(1+4))
      -XX:G1HeapRegionSize=4m           # tune region size for your heap
      -XX:ConcGCThreads=2               # limit GC threads to reduce CPU burst
      -XX:ParallelGCThreads=4           # STW GC threads
      -XX:+UseContainerSupport          # respect container CPU limits for thread sizing
${F}

\`-XX:+UseContainerSupport\` makes the JVM respect container CPU limits when sizing its thread pools — without it, the JVM sees all node CPUs and creates too many threads, which worsens the throttling problem.

---

## Step 4 — Correlate GC logs with throttling events

${F}yaml
env:
  - name: JAVA_OPTS
    value: >-
      -Xlog:gc*:file=/tmp/gc.log:time,uptime,level,tags:filecount=5,filesize=10m
      -XX:+UseContainerSupport
      -XX:MaxRAMPercentage=65
${F}

${F}bash
# Look for long GC pauses in the log
grep "Pause" /tmp/gc.log | awk '{print $1, $NF}' | sort -k2 -rn | head -20
${F}

**What you see (throttling-induced long GC):**
${F}
[14:23:05.123][gc] GC(42) Pause Young (Normal) (G1 Evacuation Pause) 1200ms  ← very long!
[14:23:06.323][gc] GC(43) Pause Young (Normal) 45ms   ← normal
[14:23:06.700][gc] GC(44) Pause Young (Normal) 890ms  ← throttled again
${F}

Irregular pause spikes (not consistent slowness) = throttling. Consistent slowness = heap pressure.

---

## 💡 Interview answer

**Open:** "We had intermittent p99 latency spikes — sometimes 2 seconds, usually 100ms. GC logs showed young GC pauses occasionally taking 1200ms instead of the expected 50ms. Heap was not the issue."

**Then:** "I checked \`cpu.stat\` in cgroups and found a 53% throttle rate. Our limit was 1 CPU for a service that needed CPU bursts during G1GC parallel phases. The fix: I raised the CPU limit to 4 CPUs (while keeping the request at 1 CPU, which controls scheduling) and added \`-XX:+UseContainerSupport\` so the JVM correctly sizes its GC thread pool for the container environment."

**End:** "Throttle rate dropped from 53% to < 5%, and the GC pause spikes disappeared. The key insight: CPU limit and CPU request serve different purposes. Request = guaranteed allocation = what the scheduler uses. Limit = hard cap = what causes throttling. For GC-heavy Java workloads, the limit should be 3-4× the request to allow GC CPU bursts."
`.trim(),

'th-k8s-graceful-shutdown': `
## 🔥 The situation

During a rolling deployment, Kubernetes sends SIGTERM to the old pods. If your Spring Boot app doesn't handle it gracefully, in-flight requests get cut off with connection errors. Users see 502/503 errors during every deploy, even though the service is technically still running at the moment of shutdown.

---

## 🧠 Understand this first

| Concept | What it means |
|---|---|
| **SIGTERM** | Signal K8s sends to start graceful shutdown — your app should start winding down |
| **SIGKILL** | Signal sent after \`terminationGracePeriodSeconds\` — immediate kill, no cleanup |
| **Graceful shutdown** | Stop accepting new requests, finish in-flight requests, close connections cleanly |
| **preStop hook** | K8s lifecycle hook that runs before SIGTERM — useful for drain delays |
| **terminationGracePeriodSeconds** | How long K8s waits between SIGTERM and SIGKILL (default: 30s) |
| **Endpoint propagation delay** | After K8s removes a pod from endpoints, load balancers may still send traffic for ~5s |

---

## Step 1 — Enable Spring Boot graceful shutdown

${F}yaml
# application.yml
server:
  shutdown: graceful            # default is "immediate"
  tomcat:
    accept-count: 0             # stop accepting new connections during shutdown

spring:
  lifecycle:
    timeout-per-shutdown-phase: 30s   # wait up to 30s for in-flight requests to complete
${F}

With \`server.shutdown=graceful\`, Spring Boot's built-in shutdown hook:
1. Stops accepting new HTTP requests immediately
2. Waits for in-flight requests to complete (up to timeout)
3. Closes connections cleanly
4. Shuts down the application context

---

## Step 2 — Add preStop hook to handle the endpoint propagation delay

K8s removes the pod from the Service endpoints and sends SIGTERM at the same time — but load balancers take a few seconds to propagate the endpoint removal. During that window, traffic still arrives at the terminating pod.

**Solution:** Add a preStop hook that sleeps for 5-10 seconds before the app starts shutting down:

${F}yaml
# k8s/deployment.yaml
containers:
  - name: order-service
    lifecycle:
      preStop:
        exec:
          command: ["/bin/sh", "-c", "sleep 10"]
          # Waits 10s before SIGTERM — load balancer propagation completes in this time

    # Total termination budget:
    # preStop(10s) + graceful shutdown(30s) < terminationGracePeriodSeconds(60s)
terminationGracePeriodSeconds: 60
${F}

**Timeline of graceful shutdown:**
${F}
T+0s:  K8s removes pod from Service endpoints + starts preStop hook
T+0s:  Load balancer still routing traffic to pod (propagation lag)
T+10s: preStop completes → SIGTERM sent to JVM
T+10s: Spring Boot graceful shutdown begins — stops accepting new requests
T+10s: Load balancer has now propagated endpoint removal — no new traffic
T+30s: All in-flight requests complete → JVM exits cleanly
T+60s: (Would be SIGKILL, but JVM already exited)
${F}

---

## Step 3 — Handle SIGTERM in your application code

${F}java
@Component
public class GracefulShutdownHandler {

    @PreDestroy
    public void onShutdown() {
        log.info("Received SIGTERM — starting graceful shutdown");
        // Clean up non-HTTP resources:
        // Stop Kafka consumer (finish current batch)
        // Close scheduled tasks
        // Flush metrics/logs
    }
}

// For Kafka consumers specifically — pause before shutdown
@KafkaListener(topics = "orders")
public class OrderConsumer {

    @Autowired
    private KafkaListenerEndpointRegistry registry;

    @EventListener(ContextClosingEvent.class)
    public void onShutdown() {
        log.info("Stopping Kafka consumers gracefully");
        registry.getListenerContainers()
            .forEach(container -> container.stop()); // finish current messages, don't poll more
    }
}
${F}

---

## Step 4 — Verify no requests are dropped during rolling deploy

${F}bash
# During a rolling deploy, watch for 5xx errors
kubectl rollout status deployment/order-service &

# In another terminal — continuous health check
while true; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://your-service/api/orders)
    echo "$(date +%H:%M:%S) - HTTP $STATUS"
    sleep 1
done
${F}

**What you see (without graceful shutdown):**
${F}
14:23:05 - HTTP 200
14:23:06 - HTTP 200
14:23:07 - HTTP 502   ← in-flight request dropped
14:23:08 - HTTP 200
${F}

**What you see (with graceful shutdown):**
${F}
14:23:05 - HTTP 200
14:23:06 - HTTP 200
14:23:07 - HTTP 200   ← no drops during deploy
14:23:08 - HTTP 200
${F}

---

## 💡 Interview answer

**Open:** "Every rolling deployment caused a brief window of 502 errors — Kubernetes was sending traffic to pods that had already started shutting down, and in-flight requests were being cut off."

**Then:** "Two changes fixed it: First, I enabled Spring Boot's \`server.shutdown=graceful\` which stops accepting new requests on SIGTERM but completes in-flight requests. Second, I added a \`preStop: sleep 10\` lifecycle hook — this delays SIGTERM by 10 seconds, giving the load balancer time to propagate the endpoint removal before we stop accepting requests."

**End:** "Setting \`terminationGracePeriodSeconds=60\` gives the full budget: 10s preStop + 30s request drain + 20s buffer. The order matters: if SIGTERM fires before the load balancer stops routing, you'll drop requests even with graceful shutdown enabled. The preStop sleep bridges that propagation gap."
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
