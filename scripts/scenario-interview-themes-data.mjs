/**
 * Source data for LinkedIn-style interview theme packs.
 * Run: node scripts/build-interview-themes.mjs
 */

const fu = (question, answer) => ({ question, answer });

export const themes = [
  {
    id: 'backend-production-chaos',
    title: 'Backend production chaos (first response)',
    subtitle:
      'OOM, latency spikes, Kafka lag, mystery 500s, K8s vs local, and batch jobs — how you think under pressure.',
    tags: ['Spring Boot', 'production', 'debugging', 'JVM', 'Kafka'],
    scenarios: [
      {
        id: 'th-prod-oom',
        question:
          'Your Spring Boot app suddenly throws OutOfMemoryError in production. What steps do you take to investigate?',
        signals: ['heap dump', 'GC logs', 'leak suspects', 'profiling', 'container limits'],
        answer: `## What’s going wrong
The JVM throws **OutOfMemoryError** when it cannot satisfy an allocation: most often **Java heap** is full, but you can also hit **Metaspace** (classes), **direct memory** (NIO/Netty), or **native** limits. The symptom is crashes or health-check failures, sometimes **without** a clean Java stack trace if the **Linux OOM killer** stops the container first.

## Why this happens
- **Retention**: objects stay reachable longer than you think (caches, sessions, collections, listeners, thread-locals, ORM first-level caches).
- **Allocation spikes**: one code path loads too much into memory at once (whole file, huge result set, giant JSON).
- **Wrong sizing**: heap too small for legitimate load, or **container limit** lower than effective JVM usage (heap + metaspace + threads + direct buffers).
- **GC cannot reclaim** fast enough → full GC loops → still not enough free space → OOM.

## What to check (and why)
1. **OOM message / cause** — distinguishes heap vs Metaspace vs “unable to create native thread” so you don’t tune the wrong knob.
2. **Heap dump (MAT dominator tree)** — shows **what retains memory** (not just what is big); fixes are targeted instead of blind -Xmx bumps.
3. **GC logs** — explains **allocation rate**, promotion, pauses; proves whether you have a leak vs steady high churn.
4. **Recent deploy / config** — new cache, query change, or library upgrade often correlates with retention or allocation regressions.
5. **Pod memory vs JVM flags** — if cgroup limit kills the process, you may never get a Java heap dump; you fix **limits and -Xmx** alignment.
6. **Off-heap / direct memory** — if heap looks fine but process RSS grows, suspect Netty, compression, or native libs.

## Behind the scenes
The JVM allocates objects in the **heap**; **GC** reclaims unreachable objects. If the **GC root set** still reaches your objects (even “by mistake”), they are not garbage. **Metaspace** holds class metadata; dynamic class generation or many classloaders can blow it. **Direct ByteBuffers** use native memory outside the heap but still count toward process memory and cgroup limits.

## What you’d do in production
Stabilize (scale/restart) if needed, enable **dump-on-OOM** and GC logging for the next occurrence, fix the **retention or allocation** bug, then right-size heap and **Kubernetes memory requests/limits** with headroom for non-heap. Add alerts on **heap usage**, **GC time**, and **restart count**.

## Interview tip
Show you distinguish **leak vs sizing vs container kill**, and that you use **evidence** (dump + GC) before raising -Xmx forever.

## Deep dive: step-by-step (what to run, what you see, how to read it)

### A — Classify: application log vs kernel / cgroup
**What to do:** Grep logs for **OutOfMemoryError**; run **kubectl describe pod POD -n NS** (or your orchestrator equivalent) on the **crashed** pod instance.
**What to look for in Java logs:** The text **after** **OutOfMemoryError:** — that string is the **primary classifier**.
**How to interpret (examples, not exhaustive):** **Java heap space** → object heap cannot grow further. **Metaspace** → class metadata space. **Direct buffer memory** → **DirectByteBuffer** / NIO pool. **Unable to create new native thread** → thread creation failed (often **stack** memory, **limits**, or **too many threads**).
**If logs show no Java stack but pod restarted:** In **describe**, under the container **Last State**: **Reason: OOMKilled**, **Exit Code: 137** (128+9). **Meaning:** Linux cgroup **memory.max** / limit exceeded for the container — **process RSS** (heap + non-heap + cache effects) exceeded **Limit**. **Not the same** as “Java printed heap OOM” — you may need **NMT**, **limits**, and **-Xmx** alignment before MAT.
**kubectl top pod POD -n NS:** **MEMORY** column vs **describe Limits**. **Expect:** headroom under normal load. **Red flag:** sustained **~100%** of limit before crash.

### B — Turn on artifacts for the *next* incident
**What to set (JDK 11+):** **-XX:+HeapDumpOnOutOfMemoryError** **-XX:HeapDumpPath=/dumps/heap.hprof** **-Xlog:gc*:file=/dumps/gc.log:time,uptime,level,tags** (directory must exist and be **writable**).
**What to expect when it triggers:** A **.hprof** file appears (size often **hundreds of MB–GB**); GC log grows with **Pause** / **GC(** lines. **Failure modes:** **Permission denied** / **No space left** in logs → fix volume or path.
**Optional NMT:** **-XX:NativeMemoryTracking=summary** + restart, then **jcmd PID VM.native_memory summary**. **Expect:** table of **committed** KB per **Java Heap**, **Class**, **Thread**, **Code**, **GC**, **Compiler**, **Internal**, **Symbol**, **Other**. **Red flag:** **Java Heap** modest but **Other** / **Internal** huge → investigate native / JNI / allocator.

### C — Live triage inside the running pod (before kill)
**Resolve PID:** **ps aux | grep java** or **cat /proc/1/cmdline** (Java as PID 1 is common).
**jcmd PID help** — **Expect:** subcommands listed. **If missing:** JRE-only image → use **JDK** debug image, **kubectl debug**, or **copy jcmd** in.
**jcmd PID GC.heap_info** — **Expect:** **GC.heap** **used** and **max** / capacity style lines. **Red flag:** **used** within a few % of **max** continuously.
**jcmd PID GC.class_histogram** — **Expect:** rows **num #instances #bytes class name**; top rows are **byte[]**, **char[]**, **String**, **HashMap$Node** in many apps. **Red flag:** **your** domain class in top 5 with **exploding #bytes** between two samples 10+ minutes apart.
**Forced dump:** **jcmd PID GC.heap_dump /dumps/manual.hprof** (JDK 11+) or **jmap -dump:live,format=b,file=/dumps/live.hprof PID**. **Expect:** noticeable **pause**; confirm file size **> 0**. **Do not** run repeatedly on saturated prod without approval.

### D — MAT: what to open and what each view proves
**Histogram (MAT):** Sort **Retained Heap**. **Expect:** large primitives arrays for JSON/XML. **Red flag:** one **business** type retains **hundreds of MB** with instance count matching “leak” (e.g. session objects).
**Dominator tree:** Top row **largest retained** object graph. **Action:** **Path to GC roots** (exclude weak refs as appropriate). **Expect:** legitimate roots (e.g. **active request**). **Red flag:** root path through **static** field, **singleton** cache, **ThreadLocal**, **listener list** never removed.
**Leak Suspects report:** **Use as hint only** — confirm with **dominator** + **roots**.

### E — GC log: patterns to grep mentally
**Young / minor GC (G1 “Pause Young”):** Line shows **used_before->used_after(committed)** and pause **ms**. **Healthy:** **after** drops, pauses stable, **Full GC** rare.
**Red flag pattern 1:** **Pause Full** or **Full GC** repeating every few seconds; **used_after** stays **near committed max** → **live set** too big or **leak**.
**Red flag pattern 2:** **Evacuation failure** / **to-space exhausted** (wording varies by GC) → heap can’t compact for promotion → often precedes OOM.
**Red flag pattern 3:** Very **high young GC frequency** with **tiny** pauses but **throughput** collapse → allocation rate vs young gen sizing; may need **batching** not only **-Xmx**.

### F — Profiling (staging or after mitigation)
**async-profiler** **alloc** profile or **jcmd … JFR.start** with **jdk.ObjectAllocationInNewTLAB** (if enabled). **Expect:** hottest allocation stacks. **When misleading:** while process is already in **death spiral** — capture **dump** first. **jstack** shows **where threads wait** — **not** heap retained bytes.

### G — Kubernetes: numbers that must line up
**From describe:** **limits.memory** (hard cap). **Effective -Xmx** (or **MaxRAMPercentage** result) **must leave room** for **metaspace**, **thread stacks** (**threads × stack**), **direct memory**, **code cache**, **native** libs. **Expect OOMKilled** if **-Xmx ≈ Limit** with no headroom.
**Anti-pattern → fix** — **static Map** sessions → **Caffeine**/Guava **maximumSize** + **expireAfterWrite**; **List.addAll(resultSet)** → **fetch size** + **stream**; **unbounded** **LinkedBlockingQueue** → **bounded** + **back-pressure** / **drop** policy.`,
        followUps: [
          fu(
            'Would you always increase heap when you see OOM?',
            '**No.** **What to check first:** MAT **dominator tree** + GC log **Full GC** lines — **expect** if leak: **after** full GC **heap used** still **~max**. **What to expect after only -Xmx bump:** longer **pause** times (G1 **region** count grows); problem **returns** if leak unchanged. **Evidence before -Xmx:** two **histograms** or dominators showing **unbounded** growth of same type.'
          ),
          fu(
            'What is a memory leak in Java vs just “using a lot of memory”?',
            '**Leak:** object graph **reachable** from **GC roots** but **should** be dead (listener, **static** map, **ThreadLocal**). **High usage:** large but **intentional** working set (cache with cap, batch job). **How to tell:** **Path to GC roots** in MAT — **unexpected** root = leak. **jcmd GC.class_histogram** twice — **expect** leak: same class **#bytes** **increases** while business load **flat**; **expect** sizing: **bytes** scales with **traffic**.'
          ),
          fu(
            'How do you get a heap dump in Kubernetes?',
            '**Steps:** (1) **kubectl exec -it POD -n NS -- sh** (2) **ps** / **jps** → **PID** (often **1**). (3) **jcmd PID GC.heap_dump /dumps/manual.hprof** — **expect** pause + file growth. (4) **kubectl cp NS/POD:/dumps/manual.hprof ./** (5) Open in MAT. **Automated:** **-XX:+HeapDumpOnOutOfMemoryError** **-XX:HeapDumpPath=/dumps/oom.hprof** + **emptyDir** mount — **expect** file after crash. **Failures:** **permission denied** → volume mount / **fsGroup**; **no space** → **sizeLimit** or emptyDir too small; **PII** → secure copy + delete.'
          ),
        ],
      },
      {
        id: 'th-prod-latency',
        question:
          'A request that normally takes 200ms now takes 20s under load. How do you approach performance tuning?',
        signals: ['profile first', 'DB', 'thread pools', 'caching', 'downstream timeouts'],
        answer: `## What’s going wrong
A path that was ~200ms becomes **seconds** under load. Users see timeouts; dashboards may still look “okay” on **average** CPU because threads are **blocked waiting**, not computing.

## Why this happens
Systems are **queues**: requests wait for worker threads, DB connections, pool slots, or downstream HTTP responses. Under load, the **slowest shared resource** becomes a bottleneck; arrival rate exceeds service rate → **queue depth grows** → latency grows **nonlinearly** (Little’s law: more waiting requests means longer waits). Timeouts and retries can **amplify** the problem.

## What to check (and why)
1. **p95/p99 latency and saturation metrics** — averages hide tail latency; percentiles show user pain.
2. **Distributed trace of one slow request** — tells you **which hop** (DB span, HTTP client, lock) owns the time so you don’t optimize the wrong layer.
3. **DB**: slow query log, explain plans, index usage, **pool wait time**, row locks — DB is the most common cross-team bottleneck.
4. **Thread pools**: active count, queue length, rejections — proves **thread starvation** vs CPU-bound work.
5. **Downstream latency + timeout config** — long timeouts keep threads pinned; short timeouts cause errors and retries.
6. **Cache hit ratio / stampede** — sudden miss storms can shift load to DB overnight.

## Behind the scenes
A servlet/worker thread **blocks** on I/O (JDBC, HTTP). If all threads block, new requests sit in an **accept queue** or Tomcat queue. The OS and JVM still show moderate CPU because threads are **waiting**, not executing code. Profiling CPU misses this; **tracing and pool metrics** catch it.

## What you’d do in production
Reproduce with load test, **fix the dominant span** (query, index, batch calls, caching), add **timeouts + bulkheads**, tune pools, and validate with **before/after percentiles**. Add SLO dashboards and alerts on **p99** and dependency health.

## Interview tip
Tie latency to **queueing theory** and **saturation** — senior answers show you measure **tails** and find the **constraint**, not “optimize random code.”`,
        followUps: [
          fu(
            'Why can average latency look fine while users suffer?',
            'A few **tail** requests dominate user experience. Always inspect **percentiles** and **max** alongside averages.'
          ),
          fu(
            'What is the difference between profiling and tracing?',
            '**Profiling** finds hot methods/allocations in a process. **Tracing** follows a request across services and shows **which hop** is slow.'
          ),
          fu(
            'How do you detect thread pool exhaustion quickly?',
            'Metrics on **active threads**, **queue size**, **rejected tasks**, plus thread dumps showing many threads blocked on pool acquire or downstream I/O.'
          ),
        ],
      },
      {
        id: 'th-prod-legacy-tests',
        question: 'You inherit a legacy service with no tests. How do you add new features safely?',
        signals: ['characterization tests', 'seams', 'incremental refactor', 'observability'],
        answer: `## What’s going wrong
You must ship a feature in a **legacy service with no tests**. Any change can break hidden assumptions (SQL quirks, implicit ordering, side effects in constructors). Fear is justified: **unknown unknowns** dominate.

## Why this happens
Legacy code often grew under deadline pressure: **tight coupling**, no seams, behavior only defined by **production**. Without tests, refactors are **unbounded risk**; without observability, regressions surface as **support tickets**.

## What to check (and why)
1. **Risk map** (money, PII, auth, inventory) — prioritizes where characterization tests and reviews matter most.
2. **Critical user journeys** — defines minimal “must not break” paths to cover first.
3. **Boundaries** (DB, queues, HTTP clients) — where failures are expensive; **contract tests** catch silent API/ schema drift.
4. **Hotspots for the feature** — you only need deep tests around code you will touch, not 100% coverage day one.
5. **Existing prod metrics/logs** — baseline behavior before change; proves improvement and catches regressions early.

## Behind the scenes
**Characterization tests** encode today’s outputs so refactors preserve behavior until you **deliberately** change semantics. **Feature flags** decouple **deploy** from **exposure**, shrinking blast radius. Small commits map each change to a **reversible** rollback point.

## What you’d do in production
Add tests + metrics around the change, ship behind a **flag**, canary if possible, watch **errors and business KPIs**, keep a **rollback** plan. Document invariants you learned for the next engineer.

## Interview tip
Emphasize **risk-based** testing and **incremental** safety — not “rewrite everything” or “hope manual QA is enough.”`,
        followUps: [
          fu(
            'What is a characterization test?',
            'A test that captures **current behavior** (even if buggy) so refactors do not change output unintentionally. You can fix semantics later deliberately.'
          ),
          fu(
            'Would you rewrite the service?',
            'Usually **no** first. Rewrite is high risk without tests/metrics. Prefer **strangler** patterns and incremental extraction.'
          ),
          fu(
            'How do integration tests help here?',
            'They validate **real I/O** (DB, queues) and catch assumptions unit tests miss — especially in legacy code with hidden coupling.'
          ),
        ],
      },
      {
        id: 'th-prod-kafka-lag',
        question:
          'Your microservice consumes a Kafka topic but lags behind by millions of messages. How do you diagnose?',
        signals: ['consumer group', 'partitions', 'rebalance', 'processing time', 'backpressure'],
        answer: `## What’s going wrong
**Consumer lag** grows: millions of messages sit unread while producers keep writing. The business sees stale data, missed SLAs, or growing storage cost.

## Why this happens
Throughput is **produce rate minus effective consume rate**. Lag explodes when: (1) **processing** per message is too slow (DB, HTTP, CPU); (2) **too few consumers** or consumers **idle** because partition count limits parallelism; (3) **rebalance storms** pause consumption; (4) **hot partitions** skew work to one consumer; (5) **poison messages** retry forever.

## What to check (and why)
1. **Lag per partition** — finds **hot keys** and skew; scaling consumers won’t help if one partition owns all traffic.
2. **Consumer group membership / rebalances** — frequent join/sync cycles mean little time spent **polling records**.
3. **max.poll.interval.ms vs processing time** — if a batch takes longer than allowed, the coordinator may kick the consumer → rebalance → worse lag.
4. **Downstream health** — slow DB or API directly caps records/sec per thread.
5. **Deserializer errors / poison pills** — one bad payload can block or retry a partition if not sent to DLQ.
6. **Partition count vs consumer count** — extra consumers beyond partitions **do nothing**; you need more partitions (with correct key strategy) to scale.

## Behind the scenes
Kafka stores messages in **ordered logs per partition**. A consumer group assigns **each partition to at most one consumer** in the group. Offsets commit after processing (depending on config); **at-least-once** means redelivery after failure — your handler must be **idempotent**. Rebalance is a **stop-the-world** style event for assignment.

## What you’d do in production
Optimize slow handlers, add **parallelism within bounds**, fix rebalance causes, increase partitions if key distribution allows, use **DLQ** for poison messages, scale consumers to partition count, alert on **lag** and **rebalance rate**.

## Interview tip
Connect lag to **partitions + processing time + rebalances**, and mention **idempotency** when you talk about speeding up or scaling consumers.`,
        followUps: [
          fu(
            'Can you always add consumers to reduce lag?',
            'Only up to the **number of partitions**. Beyond that, extra consumers sit idle unless you **increase partitions** (plan keying and ordering needs).'
          ),
          fu(
            'What causes repeated rebalances?',
            'Long processing exceeding **max.poll.interval**, GC pauses, flaky network, mis-sized \`session.timeout.ms\`, or consumer thread blocked on I/O.'
          ),
          fu(
            'When would you pause consumption?',
            'When downstream is unhealthy and you need **backpressure** — but do it deliberately with monitoring, not accidental thread blocking.'
          ),
        ],
      },
      {
        id: 'th-prod-500-no-logs',
        question: 'Users report random 500 errors from your API, but logs look fine. What is your next step?',
        signals: ['reproduce', 'tracing', 'sampling', 'multi-instance', 'downstream'],
        answer: `## What’s going wrong
Users see **500s** or failed flows, but your **application logs look clean**. That mismatch usually means the failure happened **elsewhere**, was **not logged**, or your view of logs is **incomplete**.

## Why this happens
- **Logging gaps**: catch blocks that swallow exceptions, **debug-only** logs, or logging only on one code path.
- **Sampling**: info logs sampled while errors should be **always-on** but aren’t.
- **Multi-instance**: errors hit **another pod**; you grep the wrong replica or a **canary** slice.
- **Edge vs app**: load balancer, API gateway, or **WAF** returns 502/504/500 without your service logging.
- **Async / thread boundaries**: failures on worker threads never reach the request filter that logs **requestId**.
- **Poor mapping**: downstream timeout becomes a **generic 500** with no structured error code.

## What to check (and why)
1. **Correlation / trace id** from client — stitches gateway → service → DB across systems; without it you are guessing.
2. **Traces (Jaeger/Tempo/Datadog)** — shows the **first failing span** even when logs are sparse.
3. **All pods + previous container logs** — catches **crash/restart** and one-replica bugs.
4. **Ingress/gateway access logs** — proves whether the request reached the app and what status left the edge.
5. **Exception handlers** — ensure **global handler** logs **errorId** + stack at error level.
6. **Downstream dashboards** — dependency brownout can surface as app 500 if not mapped clearly.

## Behind the scenes
A request may **fail after** the main controller logged “success,” or in a **filter** before your business logger runs. Reverse proxies can **terminate** TLS or enforce timeouts **without** your JVM seeing a full stack trace. Distributed systems need **context propagation** (W3C traceparent) so every hop emits the same **trace id**.

## What you’d do in production
Fix logging policy (always log errors with **correlation**), add **tracing**, standardize **error JSON**, alert on **error rate SLO**, and run **synthetic transactions** that prove end-to-end health.

## Interview tip
Frame “no logs” as an **observability design** problem: **propagation**, **handlers**, and **edge visibility** — not bad luck.`,
        followUps: [
          fu(
            'How does log sampling hide incidents?',
            'If errors are rare, sampling might drop the **one line** you need unless **errors are always logged** or keyed sampling is used.'
          ),
          fu(
            'What is a correlation ID?',
            'A stable id attached to a user request and propagated across services so you can stitch logs/traces together.'
          ),
          fu(
            'What would you add to prevent this class of issue?',
            'Standard **exception handler**, consistent **error model**, trace context propagation, and SLO-based alerts on **golden signals** (rate/errors/duration).'
          ),
        ],
      },
      {
        id: 'th-prod-k8s',
        question: 'You deploy a service that works locally but fails in Kubernetes. How do you debug?',
        signals: ['config', 'probes', 'networking', 'resources', 'image differences'],
        answer: `## What’s going wrong
The same artifact runs **locally** but **fails in Kubernetes**: crash loops, 503 from service, connection errors, or “works once then dies.”

## Why this happens
Containers change **everything except your JAR**: **environment variables**, **filesystem paths**, **network DNS names**, **TLS trust**, **CPU/memory limits**, **probes**, and **service discovery**. Local \`.env\` and **localhost** URLs rarely match cluster **Service** names and **Secrets**.

## What to check (and why)
1. **kubectl describe pod / events** — shows **ImagePullBackOff**, **OOMKilled**, **probe failures**, volume mount errors **before** you waste time in app logs.
2. **Container logs (current + previous)** — previous instance captures **crash on startup** after OOM.
3. **Env / ConfigMap / Secret mounting** — missing \`SPRING_DATASOURCE_URL\` or wrong **Spring profile** explains “cannot connect to DB” instantly.
4. **Readiness vs liveness** — liveness too aggressive kills slow-starting JVMs; readiness failing keeps Service endpoints **empty** → traffic never arrives or always fails.
5. **DNS & networking** — use fully qualified service names; check **NetworkPolicy** blocking egress to DB or SaaS APIs.
6. **Resource requests/limits** — throttling and OOM are **invisible** in code; they manifest as flaky timeouts and restarts.

## Behind the scenes
Kubelet runs **liveness** to restart unhealthy containers and **readiness** to include/exclude pods from **Endpoints**. The **Service** load-balances only to **ready** pods. cgroup **memory limit** includes more than heap; the kernel may **SIGKILL** the container (exit 137) without a Java OOM stack.

## What you’d do in production
Align **config parity** (same keys as prod-like stage), fix probes to match **real startup**, set realistic **requests/limits**, document **dependencies** (DB, broker), and validate with **helm diff** / GitOps review.

## Interview tip
Show you debug **platform + app** together: events, probes, resources, and config — not “it works on my laptop.”`,
        followUps: [
          fu(
            'Why would readiness fail while the app “runs”?',
            'Dependencies not ready (DB migrations), health checks too strict, or management port mismatch — traffic should not route until **dependencies required for serving** are up.'
          ),
          fu(
            'What is CrashLoopBackOff?',
            'Kube restarts a failing container repeatedly — usually exit code non-zero, OOMKill, or probe failure loop. Inspect **previous logs** and **exit reasons**.'
          ),
          fu(
            'How do you debug DNS issues in cluster?',
            'Test **nslookup** from a debug pod, verify **CoreDNS**, search domains, and service names (\`service.namespace.svc.cluster.local\`).'
          ),
        ],
      },
      {
        id: 'th-prod-batch',
        question:
          'A batch job that processes 1M records fails halfway with no clear error. How do you fix it?',
        signals: ['idempotency', 'chunking', 'checkpoints', 'retries', 'observability'],
        answer: `## What’s going wrong
A **long batch** (e.g. 1M rows) stops mid-run with **no obvious error** in the UI: partial updates, inconsistent counts, or silent scheduler kill.

## Why this happens
Batch jobs run **longer than any single request** tolerates: **process restarts**, **kube evictions**, **DB timeouts**, **memory pressure**, **poison records** that throw, or **unhandled** errors swallowed by a framework. Without **checkpoints**, reruns either **duplicate** work or **skip** work.

## What to check (and why)
1. **Scheduler / pod exit reason** — distinguishes **OOMKilled**, **node pressure**, **cron overlap**, **manual restart**.
2. **Job logs with record keys** — pinpoints **last successful offset**; without keys you cannot resume safely.
3. **DB transaction boundaries** — too-large transactions blow **undo logs** and timeouts; chunking reduces blast radius.
4. **Poison messages / bad rows** — isolate with **DLQ or skip+audit** so one row does not abort millions.
5. **Idempotency** — retries must not **double-charge** or **double-insert**; natural keys / upserts / idempotency tokens.
6. **Resource metrics** — JDBC pool wait, GC, disk; “no error” can be **silent timeout** or **thread kill**.

## Behind the scenes
Runtimes often treat batch as **at-least-once**: the job may **run twice** after a crash. **Exactly-once end-to-end** is rare; you aim for **exactly-once effect** by making side effects **idempotent**. Checkpoints turn an hour-long run into many **short commits**.

## What you’d do in production
Implement **checkpointed chunks**, **structured per-record errors**, **DLQ**, **alerts on failure rate**, **runbook** for reprocessing, and **metrics** (processed count, lag, duration). Test restart behavior in staging.

## Interview tip
Contrast **at-least-once execution** with **idempotent business effects** — that’s how senior engineers talk about batches.`,
        followUps: [
          fu(
            'How do you avoid processing the same chunk twice after a restart?',
            'Persist **checkpoint** after successful commit, use **unique job step ids**, and design writes with **natural keys** or idempotency tokens.'
          ),
          fu(
            'What is poison pill message handling in batch?',
            'Isolate failing records to a **DLQ** or skip file with reason; continue the batch for healthy records.'
          ),
          fu(
            'Would you parallelize blindly?',
            'Only with a clear **partitioning strategy** and controlled **DB contention**; otherwise you amplify locks and duplicates.'
          ),
        ],
      },
    ],
  },
  {
    id: 'microservices-scenarios',
    title: 'Microservices — scenario-based interview questions',
    subtitle: 'Latency, cascading failures, contracts, sagas, discovery, scaling, observability.',
    tags: ['microservices', 'distributed systems', 'resilience'],
    scenarios: [
      {
        id: 'th-ms-slow-one',
        question: 'A single microservice is slow, but the system feels fast overall. How do you debug it?',
        signals: ['distributed tracing', 'dependency graph', 'percentiles'],
        answer: `## What’s going wrong
End-to-end latency feels acceptable, but **one microservice** is the outlier: its endpoints are slow or its downstream calls dominate traces.

## Why this happens
Slowness is **local** to that service when: bad query/plan, **N+1**, regression in release, **GC** issues, **saturated pool**, or a **dependency** only that service calls heavily. Other services stay fast because they don’t hit that path or share that bottleneck.

## What to check (and why)
1. **Trace waterfall for slow requests** — identifies whether time is in **self CPU**, **JDBC**, or **outbound HTTP** (stops guesswork).
2. **Compare p99 before/after deploy** — ties regression to **change correlation**.
3. **DB metrics for that service’s queries** — lock waits, slow log, connection wait.
4. **Pool and thread metrics** — saturation looks like “slow service” but is really **waiting**.
5. **Service-specific feature flags** — partial rollout canary affecting subset of pods.

## Behind the scenes
Distributed systems hide local issues inside **span timings**. APM agents measure **in-process** work vs **child spans**; without tracing you might blame the network when the DB is waiting on **row locks**.

## What you’d do in production
Open a **focused investigation** on the hot endpoints, fix query/batching/caching, tune pools, roll forward or rollback release, add **SLO alerts** on that service’s **golden signals**.

## Interview tip
Always separate **local CPU work** from **waiting on dependencies** using **traces** — that’s the professional split.`,
        followUps: [
          fu('What metric do you trust first?', '**p95/p99 latency** per endpoint and per dependency span — averages hide tail problems.'),
          fu('Could metrics look healthy while users suffer?', 'Yes — if probes only hit \`/health\` or metrics aggregate across shards masking one hot partition.'),
        ],
      },
      {
        id: 'th-ms-cascade',
        question: 'One service going down causes multiple services to fail. Why does that happen?',
        signals: ['cascading failure', 'timeouts', 'retries', 'bulkhead', 'circuit breaker'],
        answer: `## What’s going wrong
When **service A** fails, **B, C, D** also error or time out — an outage **spreads** across supposedly independent components.

## Why this happens
Callers typically **block** on dependencies. Without **timeouts**, threads wait indefinitely. With **retries**, they **multiply** load on a sick dependency (**retry storm**). Shared **thread pools** and **connection pools** mean one slow dependency **starves** unrelated endpoints (**lack of bulkheads**).

## What to check (and why)
1. **Timeout and retry settings** per client — too high → thread pile-up; too many retries → amplified traffic.
2. **Thread pool utilization** — shows **propagation** of blocking calls.
3. **Circuit breaker / bulkhead** presence — absence explains why one fault becomes system-wide.
4. **Fan-out patterns** — one request calling many services synchronously multiplies blast radius.
5. **Downstream health dashboards** — identify the **first failing hop** (root) vs symptoms.

## Behind the scenes
**Cascading failure** is a **resource exhaustion** problem: the system runs out of **threads, connections, or memory** waiting. **Circuit breakers** stop calling sick deps; **bulkheads** cap resources per dependency so one bad friend cannot take the whole party down.

## What you’d do in production
Add **timeouts + bounded retries with jitter**, **circuit breakers**, **bulkheads**, **async** where possible, **degraded responses**, and **load shedding** under extreme load. Practice **failure drills**.

## Interview tip
Name **timeout → retry storm → pool exhaustion** as the classic chain; your fixes should **isolate** and **fail fast**.`,
        followUps: [
          fu('How do retries make outages worse?', 'They create **retry storms** that overload recovering services — use backoff, jitter, and caps.'),
          fu('What is a bulkhead?', 'Isolating resources (thread pools, connection pools) so one dependency cannot exhaust the whole service.'),
        ],
      },
      {
        id: 'th-ms-contract',
        question: 'A change in one service breaks others. How do you prevent this?',
        signals: ['backward compatibility', 'contract testing', 'versioning'],
        answer: `## What’s going wrong
A deploy in **service X** breaks **consumers** elsewhere: deserialization errors, missing fields, wrong types, or subtle logic assumptions.

## Why this happens
In microservices, **compile-time coupling is gone**. Teams ship independently; **implicit contracts** (JSON shape, event schema, ordering) drift. **Breaking changes** (rename/remove required fields) fail **older** mobile apps or other services still on old code.

## What to check (and why)
1. **Schema diff / OpenAPI diff** in CI — catches breaking changes **before** prod.
2. **Consumer-driven contracts** (Pact) — proves providers still satisfy **real** consumer expectations.
3. **Event compatibility** (Avro/Protobuf/JSON schema registry) — enforces **backward/forward** rules.
4. **Usage analytics** — know who still calls **v1** before sunset.
5. **Deployment order** — sometimes consumers must lead providers on **additive** changes (tolerant reader).

## Behind the scenes
**Postel’s law** in APIs: be conservative in what you send, liberal in what you accept — implemented as **optional fields**, **versioned events**, and **dual-write/dual-read** migration phases.

## What you’d do in production
Default to **additive** evolution, automate compatibility checks, communicate **deprecation timelines**, use **API gateway routing** for versioned paths when needed.

## Interview tip
Show you think in **compatibility matrices** (producer vs consumer versions), not “we updated the DTO.”`,
        followUps: [
          fu('What is consumer-driven contract testing?', 'Consumers define expected interactions; providers verify they still satisfy those contracts (e.g., Pact).'),
          fu('How do you version events safely?', 'Use **schema compatibility** rules, optional fields, and dual-write/dual-read phases during migrations.'),
        ],
      },
      {
        id: 'th-ms-saga',
        question: 'How do you handle transactions across multiple microservices?',
        signals: ['saga', 'outbox', 'idempotency', 'eventual consistency'],
        answer: `## What’s going wrong
A business operation spans **multiple databases/services** (pay, inventory, notify). You need **all-or-nothing** behavior, but there is **no single database transaction** across them.

## Why this happens
**Network partitions** and **independent failures** mean you cannot hold a global lock across services cheaply. Classic **two-phase commit (2PC)** is **blocking**, **fragile**, and couples availability — bad fit for many microservice stacks.

## What to check (and why)
1. **Business invariants** — which steps can be **eventual** vs must be **strongly** consistent (drives saga design).
2. **Compensating actions** — can you **refund**, **restock**, **cancel** if a later step fails?
3. **Idempotency** on every step — sagas **retry**; without idempotency you **double** effects.
4. **State machine / workflow persistence** — you need durable **“where am I in the saga?”** for recovery.
5. **Reliable events** — **outbox** avoids “DB committed, event never published.”

## Behind the scenes
A **Saga** is multiple **local transactions** + **compensations**. **Choreography**: services react to events. **Orchestration**: central coordinator sends commands — easier to reason about complex flows, risk is orchestrator availability.

## What you’d do in production
Model flows explicitly, implement **outbox**, add **reconciliation jobs**, monitor **stuck sagas**, document **manual recovery** playbooks.

## Interview tip
Say **2PC vs Saga trade-offs** in terms of **availability, complexity, and human operations** — not only definitions.`,
        followUps: [
          fu('When is 2PC acceptable?', 'Rarely across microservices; sometimes inside a single database cluster — still has operational downsides.'),
          fu('What is the outbox pattern?', 'Write business data and an **outbox event** in the same DB transaction; a relay publishes to the message bus reliably.'),
        ],
      },
      {
        id: 'th-ms-no-traffic',
        question: 'A microservice deploys successfully but traffic does not reach it. What do you check?',
        signals: ['service discovery', 'load balancer', 'health checks', 'routing'],
        answer: `## What’s going wrong
Deployment **succeeds** (image updated, pods running) but **no requests** hit the new revision — or traffic goes only to old pods.

## Why this happens
Kubernetes only routes to **Ready** endpoints. **Selector mismatch** (Service labels ≠ Pod labels), **Ingress** path/host rules, **wrong containerPort**, or **readiness probe** failing keeps pods **out of rotation**. Clients may cache **old DNS** or **old IPs**. **Istio/Linkerd** route rules can override Kubernetes defaults.

## What to check (and why)
1. **Endpoints** for the Service — empty list means **no ready targets**; explains 100% traffic miss.
2. **Readiness probe** logs — app “up” for you may still fail probe path/port.
3. **Service selector vs pod labels** — classic typo: traffic never binds.
4. **Ingress / gateway** host and path — request never reaches the intended Service.
5. **Client-side discovery cache** — JVM DNS cache, stale **Envoy** config, wrong **service URL** in config.

## Behind the scenes
kube-proxy (or CNI dataplane) load-balances to **Pod IPs** listed in **Endpoints** objects. **Readiness** gates membership; **liveness** does not. Mesh adds another **virtual** layer (VirtualService) that must align with K8s Services.

## What you’d do in production
Use **kubectl get endpoints**, describe ingress, verify probes, run **port-forward** to isolate network vs app, roll **config** fixes, document **service naming** conventions.

## Interview tip
Tie “no traffic” to **ready endpoints** and **routing layers** (Service + Ingress + mesh) — three places things can break.`,
        followUps: [
          fu('Could Istio/route rules block traffic?', 'Yes — VirtualService/DestinationRule misconfig can send traffic to wrong subset or apply fault injection.'),
          fu('What is blue/green routing mistake?', 'Traffic still pointed to old pool via load balancer weights or stale gateway config.'),
        ],
      },
      {
        id: 'th-ms-config',
        question: 'How do you manage configuration across environments for many services?',
        signals: ['centralized config', 'secrets', 'gitops'],
        answer: `## What’s going wrong
Ten microservices mean **ten places** for URLs, timeouts, feature toggles, and secrets. Prod breaks because **staging used different values** or a secret **rotated** without rolling all pods.

## Why this happens
Config is **data** that changes faster than code. Without **governance**, each team forks YAML; **drift** appears. Secrets in plain env or git **leak** or get **stale**. **Partial rollouts** leave half the fleet on old Redis password.

## What to check (and why)
1. **Single source of truth** (GitOps, config server, parameter store) — audit who changed what.
2. **Schema validation** for config on startup — fail fast on missing keys vs silent defaults.
3. **Secret rotation playbook** — dual-write credentials, rolling restart order.
4. **Environment parity checklist** — same keys exist in dev/stage/prod even if values differ.
5. **Feature flags vs config** — flags change behavior frequently; don’t mix with **long-lived secrets**.

## Behind the scenes
**12-factor** says store config in **environment**, but at scale you need **central delivery** + **ACLs**. Spring Cloud Config, Consul, AWS Parameter Store, Vault — all solve **distribution + encryption + audit**.

## What you’d do in production
Automate **config diff** between envs, restrict **manual kubectl set env**, use **sealed secrets** or cloud secret managers, alert on **failed config reload**.

## Interview tip
Emphasize **operational safety**: validation, rotation, and drift detection — not only “we use YAML.”`,
        followUps: [
          fu('Why not store secrets in git?', 'Risk of leakage; use vault/KMS with rotation and least privilege.'),
          fu('What breaks when configs diverge?', 'Subtle timeout/retry differences causing prod-only failure modes.'),
        ],
      },
      {
        id: 'th-ms-scale-one',
        question: 'One service needs to scale, others do not. How do you design for that?',
        signals: ['stateless', 'independent scaling', 'data ownership'],
        answer: `## What’s going wrong
One service is **melting** under its workload while siblings are idle. You want to **scale only** that service without paying to scale the whole monolith.

## Why this happens
Microservices allow **independent scaling** when services are **stateless** and **decoupled**. If they share a **single hot database** or **global lock**, scaling the app layer hits a **shared ceiling**. For consumers, **partition count** caps parallelism.

## What to check (and why)
1. **State**: session stickiness or local disk prevents horizontal scale — move state **out** (Redis, DB).
2. **Bottleneck downstream**: if DB is maxed, more pods = **more contention** — fix data layer or cache first.
3. **Right metric for HPA**: CPU alone misses **I/O wait**; use **custom** (queue lag, request latency).
4. **Partitioning** for Kafka/SQS — scaling consumers beyond partitions wastes money.

## Behind the scenes
Load balancers distribute to **identical** replicas only when any replica can serve any request (**stateless**). **Data ownership** per service avoids accidental **shared table** scaling traps.

## What you’d do in production
Scale the **bottleneck tier** first (DB read replicas, cache, partitions), tune **HPA**, use **KEDA** for queue-based scale, cost-review **over-provisioned** services.

## Interview tip
Mention **Amdahl’s law** intuition: scaling one service is useless if a **shared serial** section (DB, lock) dominates.`,
        followUps: [
          fu('What metric should drive autoscaling for APIs?', 'Often **CPU + latency SLO**; for queues use **lag**. Pure CPU can miss I/O-bound slowness.'),
          fu('What is data ownership?', 'Each service owns its schema; cross-service access via API/events, not shared tables.'),
        ],
      },
      {
        id: 'th-ms-logs-five',
        question: 'Debugging needs logs from five services. How do you simplify this?',
        signals: ['correlation id', 'central logging', 'tracing'],
        answer: `## What’s going wrong
An incident requires **five logins** and **grep across five systems**; engineers cannot reconstruct one user’s journey.

## Why this happens
Each service logs **locally** with different formats and **no shared id**. Without **propagation**, the same request looks like unrelated lines. **Microservices trade isolation for operational complexity** unless you invest in **platform logging/tracing**.

## What to check (and why)
1. **Correlation / trace headers** end-to-end — without them, stitching is manual guesswork.
2. **Structured JSON** — enables fast queries (traceId, userId, error.code).
3. **Central log store** — one query returns all services’ lines for an id.
4. **Trace UI** — faster than logs for **latency** and **fan-out** visualization.
5. **PII policy** — what you are allowed to log and how to **redact**.

## Behind the scenes
**OpenTelemetry** propagates **context** (trace id, span id) over HTTP/gRPC via **headers**. Log appenders can **inject** trace ids so logs and traces **join** in the same UI.

## What you’d do in production
Standardize **logging library config**, mandate **middleware** for correlation, train teams on **one query** workflow, add **saved searches** for incidents.

## Interview tip
Say: **“Same request id everywhere”** — that’s the core product of observability in microservices.`,
        followUps: [
          fu('What fields should structured logs include?', 'timestamp, level, service, traceId, spanId, user/org ids (carefully), request path, error code.'),
          fu('How do you avoid PII in logs?', 'Redaction, tokenization, policy in log pipeline, and strict access controls.'),
        ],
      },
    ],
  },
  {
    id: 'oauth-real-world',
    title: 'OAuth — scenario-based questions (production, not slides)',
    subtitle: 'Tokens, scopes, rotation, client types, and failure modes interviewers care about.',
    tags: ['OAuth2', 'OIDC', 'security', 'JWT'],
    scenarios: [
      {
        id: 'th-oauth-random-logout',
        question: 'Users get logged out randomly after a deployment. OAuth is enabled. What could be wrong?',
        signals: ['refresh rotation', 'clock skew', 'session affinity', 'cookie domain'],
        answer: `## What’s going wrong
Users are **logged out intermittently**, often after a **deploy** or on **mobile networks**, even though “nothing changed” in business logic.

## Why this happens
- **Clock skew**: validators think tokens are expired or not yet valid (\`nbf\` / \`exp\`).
- **Refresh token rotation**: two parallel refresh calls → one succeeds, old refresh invalidated → second fails → app clears session.
- **Cookie / storage changes**: \`Secure\`, \`SameSite\`, domain, or path differ between envs after deploy.
- **Session affinity** removed: sticky sessions break if load balancer config changes.

## What to check (and why)
1. **NTP / server time** vs IdP — rules out skew-driven 401s.
2. **Refresh endpoint logs** for **reuse** or **invalid_grant** — pinpoints rotation races.
3. **Deploy diff** for cookie settings, gateway TLS termination, and auth **issuer URL**.
4. **Mobile retry behavior** — duplicate refresh on flaky networks.
5. **Token lifetimes** — ultra-short access tokens magnify any refresh bug.

## Behind the scenes
JWT validation is **purely cryptographic + time checks** unless you introspect every call. **Refresh** is a **stateful** operation on the IdP side (session, rotation, reuse detection). Deploys often change **URLs** or **keys** without code changes in the app.

## What you’d do in production
Align clocks, tune refresh UX (single-flight refresh), test **rotation** under concurrency, canary auth config, add metrics on **refresh failure rate**.

## Interview tip
Separate **access token validation** (stateless) from **refresh/session** (stateful) — random logouts usually live in the second bucket.`,
        followUps: [
          fu('How does refresh token rotation break mobile retries?', 'If two refresh calls race, one succeeds and the old refresh is revoked — the other fails and the app logs out unless you handle **reuse detection** carefully.'),
          fu('What is clock skew impact on JWT?', 'If validators think token is not yet valid or already expired due to skew, you get intermittent 401s.'),
        ],
      },
      {
        id: 'th-oauth-401-prod',
        question: 'Your API works locally but returns 401 in production. What do you check first?',
        signals: ['redirect URI', 'client credentials', 'issuer', 'JWKS URL'],
        answer: `## What’s going wrong
Same code and tokens **work locally** but **401/invalid_token** appears in production (or only in one region).

## Why this happens
OAuth/OIDC is **configuration-sensitive**. Prod uses different **issuer** string, **redirect URI** must match **exactly**, **client credentials** differ, **JWKS** URL may be blocked by firewall, or your API validates **audience/issuer** strictly while tokens were minted for another resource server.

## What to check (and why)
1. **Issuer (\`iss\`) and audience (\`aud\`)** claims vs config — prevents “valid token, wrong API” confusion.
2. **Redirect URI** character-for-character match — IdPs reject near-misses.
3. **JWKS fetch** from prod network — egress/proxy may block metadata retrieval.
4. **Client id/secret rotation** — one service still on old secret.
5. **Spring Security / resource server** profile-specific YAML — prod profile not loaded locally.

## Behind the scenes
JWT validation typically fetches **signing keys** from **JWKS** and caches them. **Key rotation** requires cache refresh; wrong **issuer** means signature verifies against wrong trust anchor. **mTLS** or **custom CA** in prod can break metadata calls silently if trust store differs.

## What you’d do in production
Automate **config validation** on startup, log **auth failures** with **error codes** (not tokens), use **infra as code** for client registrations, test **staging** that mirrors prod networking.

## Interview tip
Mention **confused deputy** prevention via **audience** checks — shows security maturity beyond “it decodes.”`,
        followUps: [
          fu('Why is audience validation important?', 'Prevents tokens minted for one API being replayed against another (“confused deputy”).'),
          fu('What breaks when JWKS caching is stale?', 'After key rotation, validation fails until cache refreshes — intermittent 401s cluster-wide.'),
        ],
      },
      {
        id: 'th-oauth-m2m',
        question: 'One service must call another without an end user. Which OAuth flow fits?',
        signals: ['client credentials', 'mTLS', 'service accounts'],
        answer: `## What’s going wrong
You need **service B** to call **service C** with no human user logged in — still **authenticated and authorized**.

## Why this happens
User **access tokens** carry **user context** and often **broad scopes**; reusing them server-side couples services to user sessions and complicates **least privilege**. Machine flows need their own identity.

## What to check (and why)
1. **Grant type**: **client credentials** is standard for M2M — verify token endpoint and scopes per API product.
2. **Scopes** limited to what the caller needs — audit regularly.
3. **Network trust**: private VPC, **mTLS**, or service mesh identity — stops token theft from being enough.
4. **Secret storage** and rotation — client secrets in vault, not env files in images.

## Behind the scenes
The client exchanges **client_id + secret** (or cert) for an **access token** from the IdP. Resource servers validate **signature, exp, aud, scopes**. This is parallel to user flows but **no refresh token** is required in many setups (short-lived access only).

## What you’d do in production
Use **workload identity** where cloud provides tokens automatically, prefer **cert-based** auth over long-lived shared secrets when possible, monitor **token issuance** anomalies.

## Interview tip
Contrast **who** the token represents: **user** (authorization code / device) vs **client** (client credentials) — interviewers listen for that distinction.`,
        followUps: [
          fu('Why not reuse user access tokens service-to-service?', 'Over-broad scopes, harder revocation story, and coupling to user sessions — prefer **least-privilege** service tokens.'),
          fu('How do you rotate client secrets safely?', 'Dual-secret support, gradual rollout, secret manager with short TTL, audit who can read secrets.'),
        ],
      },
      {
        id: 'th-oauth-leak-mobile',
        question: 'A mobile access token leaks. What is your damage control plan?',
        signals: ['short TTL', 'rotation', 'revocation', 'binding'],
        answer: `## What’s going wrong
An **access token** for a mobile user leaked (log file, XSS’d webview, stolen backup). Attacker can call APIs as the user until the token dies.

## Why this happens
Bearer tokens are **replayable** by anyone who holds them. Mobile storage is not always secure; long TTLs widen the **attack window**. Without **binding** or **revocation**, possession equals authentication.

## What to check (and why)
1. **Access token TTL** — short windows limit damage; forces refresh path you can instrument.
2. **Refresh token rotation + reuse detection** — can invalidate **families** of tokens on theft.
3. **Server-side session / device registry** — allows **kill switch** per device.
4. **Anomaly detection** — geo, velocity, new device fingerprint.
5. **Scopes** — leaked token should not include admin APIs “just in case.”

## Behind the scenes
**JWTs** are often validated **without** calling the IdP each request (performance). That means **no instant server-side revocation** unless you maintain a **denylist**, use **introspection**, or keep access tokens **very short** and rely on refresh with stricter controls.

## What you’d do in production
Rotate keys, invalidate refresh tokens for user, notify user, audit access logs for **IOC**, tighten storage (Keychain/Keystore), add **DPoP** or **mTLS** where appropriate.

## Interview tip
State the trade-off: **stateless JWT speed** vs **revocation freshness** — mitigation is short TTL + rotation + monitoring.`,
        followUps: [
          fu('Why avoid long-lived JWTs?', 'If stolen, attacker has access until expiry unless you add **revocation** infrastructure or use opaque tokens + introspection.'),
          fu('What is token binding?', 'Techniques tying tokens to client context (device attestation, DPoP) — reduces replay from random machines.'),
        ],
      },
      {
        id: 'th-oauth-scopes-break',
        question: 'You add OAuth scopes and some users lose access to features. What happened?',
        signals: ['backward compatibility', 'migration', 'least privilege'],
        answer: `## What’s going wrong
After a scope change, some users get **403** on features they used yesterday — often **intermittent** until token refresh.

## Why this happens
**Authorization** depends on **claims in the current access token**. Old tokens in memory still carry **old scopes** until refresh. If you **tighten** required scopes on the resource server without **staggered** client updates, users with cached tokens fail. Mobile apps may not refresh until relaunch.

## What to check (and why)
1. **403 rate** spike correlated to deploy — confirms authz not authn.
2. **Token claims** for failing users vs working users — proves stale scope hypothesis.
3. **Client versions** still on old OAuth scope requests — need app store rollout.
4. **Policy mapping** on API gateway vs service — inconsistent enforcement causes “random.”

## Behind the scenes
**OIDC scopes** map to **claims** and **permissions** at the AS; resource servers should treat missing scope as **403 Forbidden**, while bad signature is **401 Unauthorized**. Migration often needs **dual-read** policies during transition.

## What you’d do in production
Feature-flag scope enforcement, **grace period**, force **re-auth** only if needed, communicate to app teams, dashboard **403 by client version**.

## Interview tip
Explicitly separate **401 vs 403** and tie breakage to **token lifecycle**, not “OAuth is broken.”`,
        followUps: [
          fu('How do you roll out scope changes safely?', 'Feature flags, dual enforcement periods, and client-specific policies with sunset dates.'),
          fu('Difference between authentication and authorization here?', 'User may authenticate fine (valid token) yet lack **authorization** scopes for the endpoint → 403, not 401.'),
        ],
      },
      {
        id: 'th-oauth-provider-down',
        question: 'The OAuth provider is slow or down. Your system starts failing. What mitigations exist?',
        signals: ['cache JWKS', 'circuit breaker', 'degraded mode'],
        answer: `## What’s going wrong
When the **identity provider** is slow or down, your APIs **start failing** even though business data stores are healthy.

## Why this happens
If every request **introspects** or **fetches JWKS** synchronously, the IdP becomes a **runtime dependency** on the **critical path**. Network blips turn into **cascading auth failures**. No **timeout** means threads block.

## What to check (and why)
1. **JWT vs opaque** — asymmetric JWT allows **local validation** with cached JWKS (IdP outage does not block verification of already-issued short-lived tokens).
2. **JWKS cache TTL + refresh strategy** — balance freshness vs availability.
3. **Introspection cache** — reduces calls; understand **revocation lag** risk.
4. **Circuit breaker / fallback** — fail closed vs degrade read-only — product decision.
5. **Timeouts** on auth client — prevent thread exhaustion.

## Behind the scenes
**JWKS** is a set of public keys rotated periodically. Validators cache keys and must **handle rotation** (kid header). **Introspection** is a live call: “is this token still active?” — simplest mentally, **heaviest** operationally.

## What you’d do in production
Prefer **local JWT validation** for high-traffic APIs, cache responsibly, run IdP in **HA**, load-test auth path, define **SLO** for token issuance separately from API SLO.

## Interview tip
Show you understand **availability coupling**: “We made login the spine of every request” — and how to **decouple** it.`,
        followUps: [
          fu('Risk of caching introspection results?', 'Stale revocation — balance TTL with risk; high-security endpoints may need fresher checks.'),
          fu('What is the difference between JWT and opaque tokens?', 'JWTs can be validated locally with public keys; opaque tokens usually need **introspection** to an auth server.'),
        ],
      },
    ],
  },
  {
    id: 'distributed-transactions',
    title: 'Distributed transactions & consistency',
    subtitle: 'Sagas, outbox, idempotency, and what to do when half the workflow succeeds.',
    tags: ['Saga', 'outbox', 'microservices'],
    scenarios: [
      {
        id: 'th-dt-pay-order',
        question: 'Payment succeeds, but order creation fails. What happens next?',
        signals: ['saga', 'compensation', 'reconciliation'],
        answer: `## What’s going wrong
**Payment gateway** says success, but **order service** fails to persist — user is charged without an order (or order stuck pending).

## Why this happens
There is **no single ACID transaction** across payment provider and your DB. Network failures, validation errors, or bugs can happen **after** money moved. **Retries** can make partial success **worse** without idempotency.

## What to check (and why)
1. **Saga state** — what step succeeded; need durable workflow id.
2. **Idempotency keys** on payment + order — replays must not double-charge or duplicate orders.
3. **Compensation** path — refund API, partial refund rules, support workflow.
4. **Reconciliation** with payment provider — source of truth for money vs internal ledger.
5. **Timeouts** — distinguish “unknown” from hard failure; **unknown** may need inquiry job.

## Behind the scenes
**Saga** = forward steps + **compensating** steps. Payment providers often support **idempotent** requests with the same key. Your DB commit and **event publish** still need **outbox** if you notify other systems.

## What you’d do in production
Implement explicit **order states** (PAYMENT_PENDING, PAID, FAILED), automated **refund** on terminal failure, **reconciliation batch**, alerts on mismatches, runbooks for stuck states.

## Interview tip
Never claim “distributed ACID”; show **state machine + compensation + reconciliation** — that’s hireable realism.`,
        followUps: [
          fu('Why not 2PC across services?', 'Blocking, tight coupling, fragility under partitions — poor fit for many microservice deployments.'),
          fu('How does reconciliation help?', 'Periodic jobs compare payment provider state vs internal orders and fix drift safely with alerts.'),
        ],
      },
      {
        id: 'th-dt-db-kafka',
        question: 'DB commit succeeds, but publishing to Kafka fails right after. How do you fix the design?',
        signals: ['transactional outbox', 'dual write problem'],
        answer: `## What’s going wrong
The row is **committed** in PostgreSQL, but **Kafka publish** fails afterward — downstream never learns, or learns twice if you retry naively.

## Why this happens
DB and broker are **different systems** with no shared transaction. **Dual write** (DB then Kafka) is non-atomic: either order can partially complete. **Retry** of publish without dedupe causes **duplicates**.

## What to check (and why)
1. **Outbox table in same DB** — proves you can commit **business row + event** atomically.
2. **Publisher reliability** — at-least-once relay with **primary key** on outbox id for dedupe.
3. **Consumer idempotency** — handles duplicate event delivery.
4. **Ordering needs** — partition key choice if ordering matters per aggregate.

## Behind the scenes
**Transactional outbox**: \`BEGIN; INSERT business; INSERT outbox; COMMIT;\` then a process reads outbox, publishes to Kafka, marks **published**. Crash between commit and publish → relay retries safely.

## What you’d do in production
Implement outbox + relay (or CDC), monitor **lag** of unpublished rows, alert on **stuck** events, document **replay** procedures.

## Interview tip
Name the **dual-write problem** explicitly — interviewers reward recognizing the anti-pattern.`,
        followUps: [
          fu('What is the dual-write problem?', 'Updating DB and messaging without a shared transaction leads to **inconsistency** if one side fails.'),
          fu('Can Change Data Capture (CDC) replace outbox?', 'Sometimes yes — trade-offs in ordering, schema coupling, and operational complexity.'),
        ],
      },
      {
        id: 'th-dt-conflict',
        question: 'Two services update related data concurrently and conflict. What do you do?',
        signals: ['optimistic locking', 'version', 'domain rules'],
        answer: `## What’s going wrong
Two services update **related rows** concurrently; final state is **wrong** (lost update, inconsistent totals, broken invariants).

## Why this happens
Without coordination, **read-modify-write** races happen: both read v1, both write v2 — one update **vanishes**. Separate services amplify this because there is no **single lock** across boundaries.

## What to check (and why)
1. **Optimistic locking** (\`version\` column) — detects concurrent writes at commit; forces retry path.
2. **Single writer per aggregate** — route all updates for \`Order:123\` through one service or partition.
3. **Database constraints** — unique keys and check constraints catch some illegal states.
4. **Event ordering** — Kafka partition by entity id to serialize conflicting updates.

## Behind the scenes
**Optimistic** concurrency assumes conflicts are rare: cheap reads, occasional retry on conflict. **Pessimistic** locks (\`SELECT FOR UPDATE\`) serialize early but risk **deadlocks** and **latency** under contention.

## What you’d do in production
Choose pattern per aggregate, add **retry with backoff** on conflict, monitor **conflict rate**, document **human** resolution for edge cases.

## Interview tip
Prefer **domain ownership** (“one writer”) over distributed locks when you can — simpler and fewer midnight pages.`,
        followUps: [
          fu('When is pessimistic locking better?', 'High contention on a small critical resource where retries are expensive — but watch deadlocks and latency.'),
          fu('How do message ordering reduce conflicts?', 'Partition by **aggregate id** so updates serialize per entity.'),
        ],
      },
      {
        id: 'th-dt-retry-dup',
        question: 'Retries cause duplicate updates. What went wrong?',
        signals: ['idempotency key', 'unique constraint'],
        answer: `## What’s going wrong
After timeouts or consumer restarts, **retries** create **duplicate rows**, double balance changes, or repeated notifications.

## Why this happens
Distributed systems deliver messages and HTTP calls **at least once** in practice. Any **non-idempotent** side effect (insert without unique key, \`balance = balance + 10\`) will **accumulate** duplicates under retry.

## What to check (and why)
1. **Natural / business keys** + **UNIQUE** constraints — DB rejects true duplicates; forces upsert design.
2. **Idempotency key** store — maps key → prior result for HTTP writes.
3. **Consumer dedupe** table — stores processed \`(topic, partition, offset)\` or message id.
4. **Exactly-once claims** — verify what layer guarantees (often **broker-only**, not end-to-end).

## Behind the scenes
**Idempotency** means \`f(f(x)) = f(x)\` for your operation’s **observable effects**. Implement via **upsert**, **INSERT … ON CONFLICT DO NOTHING**, or **conditional updates** with expected version.

## What you’d do in production
Audit all write paths for retry safety, add tests that **replay** the same request/message, monitor **duplicate rate** metrics.

## Interview tip
Say clearly: **“At-least-once transport + idempotent effects = correct system.”**`,
        followUps: [
          fu('How to implement idempotency keys in HTTP?', 'Header like \`Idempotency-Key\` stored with response mapping for 24h window; return same result on replay.'),
          fu('Kafka consumer duplicate delivery — what do you assume?', '**At-least-once** unless you invest in specialized exactly-once semantics — still need idempotent effects.'),
        ],
      },
    ],
  },
  {
    id: 'rate-limiting-traffic',
    title: 'Rate limiting & traffic control',
    subtitle: 'Fairness, distributed counters, and why spikes take systems down.',
    tags: ['rate limiting', 'API gateway', 'resilience'],
    scenarios: [
      {
        id: 'th-rl-one-client',
        question: 'A single client floods your API and slows everyone else. What do you do first?',
        signals: ['per-client limits', 'token bucket', 'gateway'],
        answer: `## What’s going wrong
One **API key** or integration sends a huge spike; **latency rises for everyone** sharing the same service, DB, or thread pool.

## Why this happens
Fairness is not automatic: without **per-tenant limits**, a noisy neighbor consumes **shared capacity** (CPU, connections, DB). **Retries** from that client **amplify** load. Edge protection is cheaper than letting garbage hit app logic.

## What to check (and why)
1. **Traffic attribution** — which **client id / org / key** dominates RPS (drives correct limit keys).
2. **Gateway vs app enforcement** — stop bad traffic **early** to save downstream cost.
3. **Burst vs sustained** — token bucket allows short bursts without starving others long-term.
4. **Retry behavior** of the client — accidental DDoS from tight retry loops.

## Behind the scenes
**Token bucket** refills tokens at a steady rate; allows bursts up to bucket size. **Leaky bucket** outputs at fixed rate — smoother but can add queue delay. Limits are often enforced with **atomic counters** in Redis at the edge.

## What you’d do in production
Define **SLO per tier**, implement **429 + Retry-After**, monitor **top consumers**, block abusive keys, document **fair use**.

## Interview tip
Connect rate limiting to **fairness** and **blast radius** — not “punishing users,” protecting the platform.`,
        followUps: [
          fu('Token bucket vs leaky bucket?', 'Token bucket allows controlled bursts; leaky bucket smooths traffic more strictly — pick based on UX and fairness goals.'),
          fu('Why not only IP limits?', 'NAT/shared IPs punish innocent users; prefer **API keys** or authenticated user limits.'),
        ],
      },
      {
        id: 'th-rl-multi-instance',
        question: 'Rate limiting works on one instance but not with many replicas. Why?',
        signals: ['distributed counter', 'Redis', 'sticky'],
        answer: `## What’s going wrong
Rate limiting **works on one replica** in dev, but in prod with **N pods** each allows **N × limit** requests — effectively **no global cap**.

## Why this happens
Each JVM holds its **own counter**. Unless state is **shared**, limits are **per process**. Autoscaling changes N dynamically, worsening drift.

## What to check (and why)
1. **Enforcement point** — move to **API gateway** or **Redis** sliding window — proves one source of truth.
2. **Algorithm** — fixed window allows **2× burst** at edges; sliding window or token bucket mitigates.
3. **Consistency** — Redis INCR is fast; tiny **overcount** under races may be acceptable; document it.
4. **Latency** of limit check — must stay **small** vs request budget.

## Behind the scenes
**Gossip-free** global counts need **central coordination** or **probabilistic** methods. **Edge CDNs** sometimes enforce limits closer to users to absorb junk traffic.

## What you’d do in production
Choose **edge-first** limits for public APIs, **Redis** for fine-grained per-user limits, load-test enforcement path, add **dashboards** for throttled volume.

## Interview tip
State plainly: **“In-memory limit × replicas = broken global limit.”** That sentence scores points.`,
        followUps: [
          fu('What breaks fixed windows?', 'Burst at window edges — **sliding window** or **token bucket** reduces cheating the boundary.'),
          fu('Eventual consistency on counters — risk?', 'Slight over-allowance under race — usually acceptable; document trade-off.'),
        ],
      },
      {
        id: 'th-rl-429-random',
        question: 'Users see random 429 errors during normal traffic. How do you debug?',
        signals: ['shared quota', 'burst', 'misconfig'],
        answer: `## What’s going wrong
Legitimate users hit **429** “randomly” — often correlated with **peaks**, certain **regions**, or right after **deploys**.

## Why this happens
**Mis-keyed limits** (everyone shares default bucket), **burst** too small vs legitimate batch jobs, **clock skew** between limiter nodes, **retry storms** that consume the quota, or **new limiter bugs** after rollout.

## What to check (and why)
1. **Limit key dimension** — per IP only hurts NAT’d corporate users; prefer **user id / API key**.
2. **Metrics**: throttled RPS vs total RPS — proves systemic vs edge case.
3. **Client retry** loops — mobile SDKs may ignore **Retry-After**.
4. **Deploy correlation** — bad default limit in config map.
5. **Distributed limiter health** — Redis latency causing fallback to “deny”.

## Behind the scenes
**Sliding windows** need multiple sub-counters or approximate structures; bugs in window boundaries cause **false positives**. **Jitter** in client retries reduces alignment that triggers stampedes.

## What you’d do in production
Add **debug headers** (remaining quota), canary config changes, tune burst, educate client teams on **backoff**, simulate **NAT** scenarios in tests.

## Interview tip
Treat mysterious 429s as **observability + client behavior** problems, not only “raise limits.”`,
        followUps: [
          fu('Should clients retry 429?', 'Only with **Retry-After** respect and exponential backoff; otherwise they worsen contention.'),
          fu('How do you test rate limits?', 'Load tests with realistic client diversity; chaos tests for gateway config rollout.'),
        ],
      },
    ],
  },
  {
    id: 'idempotency-retries',
    title: 'Idempotency, retries, and “double work”',
    subtitle: 'Why duplicates are normal in distributed systems.',
    tags: ['idempotency', 'reliability', 'HTTP'],
    scenarios: [
      {
        id: 'th-idem-pay-dup',
        question: 'A payment API is called twice after a timeout. Customers are charged twice. How do you prevent it?',
        signals: ['idempotency key', 'unique payment id', 'provider keys'],
        answer: `## What’s going wrong
Client **timed out**, retried **POST /pay**, and the user was **charged twice** for one intent.

## Why this happens
Networks are **unreliable**: server may **process** the first request but the **response never arrives**. Clients **correctly** retry unsafe methods unless the server makes POST **replay-safe**. Payment processors without **idempotency keys** double-settle.

## What to check (and why)
1. **Idempotency-Key header** persisted with **final status** — replays return same outcome.
2. **Provider idempotency** — Stripe-style keys on the gateway call.
3. **UNIQUE** constraint on **merchant reference** — DB-level backstop.
4. **Timeout values** — too low timeouts **cause** duplicate attempts.

## Behind the scenes
**At-least-once HTTP** is reality. Idempotency store is a **small state table**: key → response body + HTTP code, TTL window. First request does work; duplicates are **short-circuited**.

## What you’d do in production
Require keys on all **mutating** APIs, document client behavior, add **reconciliation** with PSP, test **duplicate delivery** in CI.

## Interview tip
Mention **unknown result** handling: client should **query** payment status by idempotency key instead of blind repost.`,
        followUps: [
          fu('Is PUT always idempotent?', 'Should be by HTTP semantics, but **your implementation** must still enforce it for side effects and downstream calls.'),
          fu('What about GET with side effects?', 'Bad pattern — side effects should not live in GET; scanners/proxies may call it repeatedly.'),
        ],
      },
      {
        id: 'th-idem-kafka-reprocess',
        question: 'A Kafka consumer restarts and reprocesses messages. Data changes again. Fix?',
        signals: ['idempotent consumer', 'dedupe store'],
        answer: `## What’s going wrong
After **consumer restart**, the same Kafka messages are handled again and **inventory / emails / points** double-apply.

## Why this happens
Kafka consumers **commit offsets** after processing (typical). On crash **after** effect but **before** commit, redelivery happens — **by design** for safety (at-least-once). Non-idempotent handlers **corrupt** state.

## What to check (and why)
1. **Effect type** — inserts vs upserts vs \`+=\` — only upserts/idempotent math survive replay.
2. **Dedupe store** — message id or (partition,offset) uniqueness.
3. **Transactional outbox** alignment — publishing side also idempotent.
4. **Exactly-once semantics** claims — verify scope (often **Kafka Streams** internal, not your DB).

## Behind the scenes
**Offset commit** is a separate action from **side effect**. Exactly-once **end-to-end** needs transactional **consume-process-produce** patterns or **idempotent consumer + unique keys**.

## What you’d do in production
Refactor handlers to **upsert**, add dedupe table, add tests that **replay** same record, monitor **duplicate business metrics**.

## Interview tip
Say: **“Kafka redelivery is normal; my handler must be safe.”**`,
        followUps: [
          fu('Exactly-once Kafka — do you believe it?', 'End-to-end exactly-once is rare; design for **at-least-once** delivery with idempotent effects.'),
          fu('Outbox vs consumer dedupe?', 'Outbox solves publish-after-write; **consumer dedupe** solves redelivery — both layers matter.'),
        ],
      },
      {
        id: 'th-idem-retry-storm',
        question: 'Retries were added for reliability but outages get worse. Why?',
        signals: ['retry storm', 'backoff', 'jitter', 'circuit breaker'],
        answer: `## What’s going wrong
You added **retries** to survive blips, but during outages **errors and latency get worse** — sometimes the system never recovers until clients stop calling.

## Why this happens
Retries **multiply traffic**: if 1k RPS each retries 5× quickly, you send **5k+ RPS** at a sick dependency (**retry storm**). Synchronized backoff (no **jitter**) aligns retries into **spikes**. No **circuit breaker** means you keep hammering a dead service.

## What to check (and why)
1. **Retry policy** — max attempts, base delay, **full jitter** — proves you won’t infinite-loop.
2. **Idempotency** — retries safe for side effects?
3. **429/503 Retry-After** — honor server-directed backoff.
4. **Downstream capacity** when healthy — ensure recovery isn’t drowned by retries.
5. **Client concurrency** — limit parallel retries per host.

## Behind the scenes
**Exponential backoff** spreads attempts over time; **jitter** breaks synchronization. **Circuit breaker** trips open after failures, failing fast and giving dependents time to **recover**.

## What you’d do in production
Centralize retry config, load-test failure modes, add **hedging** only where safe, monitor **retry ratio** metric.

## Interview tip
Phrase it as **self-inflicted DDoS** — interviewers recognize that story instantly.`,
        followUps: [
          fu('What is jitter?', 'Randomness added to backoff to prevent **thundering herd** retries aligning in time.'),
          fu('When should you not retry?', 'On non-transient errors (400 validation), or when downstream is clearly overloaded (429/503 with Retry-After).'),
        ],
      },
    ],
  },
  {
    id: 'backpressure-control',
    title: 'Backpressure vs blind scaling',
    subtitle: 'When the system needs to say “not now.”',
    tags: ['backpressure', 'queues', 'Kafka'],
    scenarios: [
      {
        id: 'th-bp-db-spike',
        question: 'Traffic spikes crash the database even after scaling API pods. Why?',
        signals: ['unbounded concurrency', 'connection pool', 'downstream limit'],
        answer: `## What’s going wrong
You scaled **API pods** during a spike, but the **database** falls over: connections maxed, CPU 100%, timeouts everywhere.

## Why this happens
More app instances → more **concurrent** queries unless you **limit** concurrency per instance or globally. **Connection pools** × pods can exceed DB **max_connections**. **Lock contention** grows superlinearly with concurrent writers.

## What to check (and why)
1. **DB active connections** vs **max** — proves exhaustion hypothesis.
2. **Pool size per pod × replicas** — mental math catches config mistakes fast.
3. **Slow queries / missing indexes** — more pods just run bad SQL faster.
4. **Queue depth** at app — threads waiting on pool indicate **backpressure** need.
5. **Read vs write path** — read replicas or cache may be correct relief valve.

## Behind the scenes
**Backpressure** means slowing producers when consumers cannot keep up. Without it, **Little’s law** says latency explodes as queue grows. **Bulkheads** cap DB usage per feature.

## What you’d do in production
Add **max concurrency** semaphores, tune pools, cache hot reads, shard/partition, scale **DB** vertically or add replicas, shed load at gateway.

## Interview tip
Say clearly: **scaling stateless apps without scaling the data tier** often **accelerates failure**.`,
        followUps: [
          fu('What is load shedding?', 'Reject/protect when overload — better fast errors than total collapse.'),
          fu('How do message systems apply backpressure?', 'Kafka: consumer **pause**, reduce **max.poll.records**, fix slow processing; brokers have limits too.'),
        ],
      },
      {
        id: 'th-bp-queue-grow',
        question: 'An async queue grows without bound under load. What failed?',
        signals: ['producer faster than consumer', 'DLQ', 'limits'],
        answer: `## What’s going wrong
Queue **depth grows without bound**; latency from publish to process becomes **minutes or hours**.

## Why this happens
**Arrival rate > processing rate** sustained. Causes: not enough **consumers**, **poison** messages retry forever, **downstream** (DB/API) slow, **serial** processing bottleneck, or producers ignore **backpressure** signals.

## What to check (and why)
1. **Consumer lag / depth metric** — quantifies how far behind you are.
2. **Processing time distribution** — identifies slow handler or dependency.
3. **Error/retry rate** — poison pills show as high retry loops.
4. **Consumer count vs partitions/shards** — scaling mistakes.
5. **Producer behavior** — are they blocking when queue full, or spiking memory?

## Behind the scenes
Queues **decouple** systems in time; they are **not infinite storage**. **Bounded queues** force **blocking**, **drop**, or **reject** policies — product must choose. **Kafka** consumers can **pause** fetching to push back on brokers.

## What you’d do in production
Scale consumers, optimize handler, **DLQ** bad messages, alert on **SLO lag**, implement **adaptive producer throttle**, document overflow behavior.

## Interview tip
Connect unbounded queues to **memory risk** and **SLO violations** — mature systems bound and monitor depth.`,
        followUps: [
          fu('Why bounded queues?', 'Unbounded memory growth crashes processes — prefer explicit limits + policies (drop, block, shed).'),
          fu('Relationship to autoscaling?', 'Scaling consumers helps only until **downstream** or **partition count** caps throughput.'),
        ],
      },
    ],
  },
  {
    id: 'api-gateway-vs-service-mesh',
    title: 'API Gateway vs Service Mesh — responsibilities',
    subtitle: 'North-south vs east-west traffic patterns.',
    tags: ['gateway', 'service mesh', 'architecture'],
    scenarios: [
      {
        id: 'th-gw-auth-rl',
        question: 'You need authentication, rate limiting, and request validation. Where should it live?',
        signals: ['API gateway', 'edge', 'WAF'],
        answer: `## What’s going wrong
You need **authn**, **rate limits**, and **basic validation** for internet clients — unclear whether to build it into each service or a shared layer.

## Why this happens
Duplicating TLS, JWT validation, and WAF rules in **every microservice** is **error-prone** and **expensive** to change. A **gateway** centralizes **cross-cutting edge concerns** while keeping **business authorization** near the domain.

## What to check (and why)
1. **North-south vs east-west** — public ingress concerns belong at **edge**; internal policies differ.
2. **Threat model** — bots, DDoS, credential stuffing → **WAF + gateway** first.
3. **Payload size limits** — stop huge bodies before they hit fragile parsers in apps.
4. **Who owns the gateway config** — platform team vs product team governance.

## Behind the scenes
The **API gateway** terminates TLS, can validate **JWT** signatures with cached JWKS, applies **rate limits** with Redis, and routes to internal services. It should stay **thin**: orchestration-only, not a second monolith of business rules.

## What you’d do in production
Put **token validation, throttling, IP allowlists, request size** at gateway; keep **authorization** (can this user access this row?) in services; version gateway routes with CI.

## Interview tip
Say **“edge policy, domain policy”** — two layers, two owners, two lifecycles.`,
        followUps: [
          fu('Risk of business logic in gateway?', 'Gateway becomes a **monolith** and release bottleneck; hard to test and scale independently.'),
          fu('Validation at gateway vs service?', 'Schema validation at edge for obvious attacks; **authoritative authorization** still in domain layer.'),
        ],
      },
      {
        id: 'th-mesh-internal',
        question: 'Internal service-to-service calls are flaky under load. What helps?',
        signals: ['service mesh', 'mTLS', 'retries', 'timeouts'],
        answer: `## What’s going wrong
**Internal** REST/gRPC calls are flaky: random timeouts, inconsistent retry behavior, hard-to-debug TLS issues — different teams configured clients differently.

## Why this happens
Microservices **explode** the number of network calls. Without uniform policy, each library picks its own **timeouts/retries**. **Plain HTTP** inside the cluster is easy to misconfigure; **identity** between services is often an afterthought.

## What to check (and why)
1. **Sidecar metrics** (Envoy/Istio) — see **502/503 upstream** vs app errors clearly.
2. **mTLS** — ensures **service identity** and encryption on the wire inside cluster.
3. **Retry policies** — must be **consistent** and safe with **idempotent** methods.
4. **Client timeouts** vs server timeouts — mismatches cause confusing half-closes.

## Behind the scenes
A **mesh** injects a **proxy** beside each pod; **iptables** or **eBPF** captures traffic. Policies are **declarative** (CRDs): retries, circuit breaking, traffic split, telemetry — **without** recompiling apps.

## What you’d do in production
Start with **observability-only** mesh if adoption is hard, then roll **mTLS**, standardize **retry budgets**, train teams on debugging **Envoy** access logs.

## Interview tip
Contrast **gateway (north-south)** with **mesh (east-west)** — mixing responsibilities is a common architecture smell.`,
        followUps: [
          fu('Gateway + mesh together?', 'Yes — gateway for **clients→system**, mesh for **service↔service** internal policies.'),
          fu('Operational cost of mesh?', 'Extra latency/resources and platform skill — justify when many teams/services need uniform policy.'),
        ],
      },
      {
        id: 'th-gw-canary',
        question: 'You want canary releases between internal microservices. Where is this configured?',
        signals: ['traffic split', 'mesh', 'ingress'],
        answer: `## What’s going wrong
You want **5% of internal traffic** to a new **payment service** revision without exposing customers to a separate public URL mess.

## Why this happens
**Canary** is a **routing** problem: split traffic by **percentage** or **headers** while keeping the same logical service name. **Kubernetes Service** alone is blunt; **mesh** gives fine-grained **subset routing**.

## What to check (and why)
1. **Traffic split destination** — correct **labels/versions** on pods.
2. **Metrics per subset** — error rate and latency **per canary** vs stable.
3. **Rollback** — one-click return to 100% stable.
4. **DB migrations** compatibility — canary must tolerate **old+new** schema during rollout.

## Behind the scenes
**VirtualService** (Istio) or **HTTPRoute** (Gateway API) sends weighted traffic to **v1/v2** subsets. **Telemetry** is tagged by **destination version** so you can compare golden signals.

## What you’d do in production
Progressive traffic (1%→5%→25%), **automated promotion** on SLO checks, **feature flags** for risky branches, document **abort criteria**.

## Interview tip
Mention **schema backward compatibility** with canaries — code rollout is easy; **data** mismatch is where canaries die.`,
        followUps: [
          fu('How do you validate a canary?', 'Compare **golden signals** for canary subset: error rate, latency, business KPIs, not only CPU.'),
          fu('What is a common canary mistake?', 'Routing **too little** traffic to detect issues, or measuring only averages.'),
        ],
      },
    ],
  },
  {
    id: 'event-driven-messaging',
    title: 'Event-driven systems & messaging',
    subtitle: 'Duplicates, ordering, schema evolution, and lag.',
    tags: ['Kafka', 'events', 'async'],
    scenarios: [
      {
        id: 'th-ed-dup',
        question: 'Consumers process the same business event twice and users see duplicate side effects. What do you fix?',
        signals: ['idempotency', 'dedupe', 'outbox'],
        answer: `## What’s going wrong
Downstream effects (emails, loyalty points, shipments) happen **twice** for one business event.

## Why this happens
Message brokers deliver **at least once**; producers may **retry** publishes; consumers **restart** and re-read. Any **non-idempotent** handler multiplies real-world side effects.

## What to check (and why)
1. **Consumer handler math** — \`+=\` vs deterministic **upsert** — quick code review finds duplicates.
2. **Dedupe store** — business event id or broker offset uniqueness.
3. **Producer outbox** — prevents “DB committed, never published” or double publish patterns.
4. **Retry configuration** — infinite retries on poison messages amplify duplicates.

## Behind the scenes
**Log-based brokers** retain messages; **offsets** track progress. Commit-after-process yields **redelivery** on crash before commit — the safe default. **Exactly-once** in Kafka often means **transactional produce** within broker, not your **email provider**.

## What you’d do in production
Idempotent writes, DLQ, monitor **duplicate KPIs**, chaos-test **consumer crash** mid-batch.

## Interview tip
Never promise **exactly-once end-to-end**; promise **correct effects under at-least-once**.`,
        followUps: [
          fu('Why not rely on “exactly-once Kafka”?', 'Broker features help, but end-to-end side effects still need **idempotent application logic**.'),
          fu('Where do duplicate publishes come from?', 'Retries, producer crashes after send but before ack bookkeeping, at-least-once brokers.'),
        ],
      },
      {
        id: 'th-ed-order',
        question: 'Events arrive out of order for the same entity. How do you handle consistency?',
        signals: ['partition key', 'version', 'monotonic sequence'],
        answer: `## What’s going wrong
Events for the **same customer/order** arrive **out of order**; state ends **nonsense** (older update wins, totals wrong).

## Why this happens
**Global order** across a whole topic is expensive. Kafka only guarantees order **within a partition**. If keying is wrong or multiple writers exist, related events **interleave** across partitions. **Clock skew** on \`createdAt\` makes time-based sorting unreliable.

## What to check (and why)
1. **Partition key** — must be **entity id** if per-entity order is required.
2. **Monotonic sequence** per aggregate in event payload — lets you **drop stale** events deterministically.
3. **Producer id** — multiple producers to same aggregate without coordination cause races.
4. **Consumer concurrency** — parallel threads per partition break order unless you **serialize** per key.

## Behind the scenes
Brokers append records **in partition log order**; consumers read in that order **per partition**. Cross-partition **interleaving** is normal. **Vector clocks** or **version fields** help merging when order cannot be guaranteed.

## What you’d do in production
Fix keying, add **version** checks in projections, document **invariants**, use **sagas** for multi-entity workflows.

## Interview tip
Say **“ordering is a partition-key contract”** — that’s the crisp mental model.`,
        followUps: [
          fu('Global total ordering — realistic?', 'Expensive and rarely needed; most systems need **per-aggregate** order.'),
          fu('What if cross-aggregate workflow?', 'Use **saga** orchestration or careful choreography with compensations.'),
        ],
      },
      {
        id: 'th-ed-schema',
        question: 'Schema changes break older consumers. What went wrong?',
        signals: ['backward compatibility', 'schema registry'],
        answer: `## What’s going wrong
A **schema deploy** breaks **older consumers**: parse errors, dropped messages, or silent field loss.

## Why this happens
Event schemas evolve faster than deployed consumers in **mobile** and **multi-team** environments. **Renaming/removing required fields** is breaking. **Producing new types** without compatibility checks lets bad records into the log.

## What to check (and why)
1. **Compatibility mode** in schema registry — backward/forward/full transitive policies.
2. **Consumer error metrics** — deserialization failures spike at deploy.
3. **Dual-schema rollout plan** — readers first, then writers, then cleanup.
4. **Topic versioning** — when incompatibility is unavoidable, use **new topic** and migrate.

## Behind the scenes
**Avro/Protobuf** wire format is binary; compatibility is enforced by **schema evolution rules** (field numbers, optional fields). **JSON** events still need **contract tests** — humans break JSON casually.

## What you’d do in production
CI checks on schema PRs, canary consumers, **tombstone** strategies for deletes, document **deprecation windows**.

## Interview tip
Tie schema changes to **deploy order** — “compatible readers first” is the mantra.`,
        followUps: [
          fu('Additive-only rule?', 'Prefer **backward compatible** reader-writer contracts: new writers, old readers still work.'),
          fu('How to migrate consumers?', 'Roll out readers that accept both shapes, then writers, then remove old — with telemetry on parse errors.'),
        ],
      },
    ],
  },
  {
    id: 'observability-production',
    title: 'Observability — logs, metrics, traces',
    subtitle: 'When dashboards look green but users are unhappy.',
    tags: ['observability', 'tracing', 'SLO'],
    scenarios: [
      {
        id: 'th-obs-slow-users',
        question: 'Users report slowness but CPU and memory look normal. Where do you look next?',
        signals: ['p99 latency', 'tracing', 'locks', 'downstream'],
        answer: `## What’s going wrong
Dashboards show **low CPU**, but users feel **slowness** or sporadic timeouts.

## Why this happens
**I/O wait**, **lock contention**, and **downstream latency** do not always raise CPU. Threads block on **JDBC**, **HTTP**, **remote cache**, or **DNS**. **Tail latency** (p99) is invisible if you only watch **CPU averages**.

## What to check (and why)
1. **Latency histograms** (p50/p95/p99) — user-perceived pain lives in the tail.
2. **Traces** — shows blocked time in **DB client** span vs app code.
3. **DB locks / slow queries** — often the hidden driver.
4. **DNS resolution time** — surprisingly common multi-second delays.
5. **Thread pool queue depth** — proves **scheduling** backlog.

## Behind the scenes
The OS marks threads **blocked** on I/O as not consuming CPU; the JVM still holds stacks waiting. **USE** methodology (Utilization, Saturation, Errors) catches **saturation** CPU misses.

## What you’d do in production
Instrument **RED** metrics, **SLO** on p99, **synthetic probes**, **on-call** runbooks tied to traces.

## Interview tip
Quote: **“Low CPU doesn’t mean healthy — it can mean everyone is waiting.”**`,
        followUps: [
          fu('RED metrics?', 'Rate, Errors, Duration — good service-level starting point; pair with **USE** for resources.'),
          fu('What is missing if you only have logs?', 'Cross-service causality — need **trace context propagation** (W3C traceparent).'),
        ],
      },
      {
        id: 'th-obs-500-no-logs',
        question: 'Some endpoints 500 but nothing obvious in application logs. Next steps?',
        signals: ['sampling', 'gateway logs', 'panic handlers'],
        answer: `## What’s going wrong
Endpoints return **500** but **application logs** show no matching stack trace — hard to debug under pressure.

## Why this happens
Failures occur **outside** your log statements: **reverse proxy** timeouts, **TLS** handshake failure, **worker process killed** (OOMKilled), **filters** that swallow exceptions, **logging sampling** dropping error lines, or errors on **async threads** not wired to request context.

## What to check (and why)
1. **Ingress/gateway logs** — see status code **before** it hits your pod.
2. **Previous container logs / exit code 137** — OOM vs app exception.
3. **Global exception handler** — ensures every uncaught error logs **errorId** + minimal stack.
4. **Trace** of failing request — pinpoints span where status flipped.
5. **Log pipeline** — dropped logs due to **rate limits** or filter rules.

## Behind the scenes
**Reverse proxies** have their own **timeouts**; they may return **502/504** without your app logging. **Kubernetes** can SIGKILL a container exceeding memory **cgroup** — JVM might not flush logs. **Structured logging** with **trace correlation** avoids “needle in haystack.”

## What you’d do in production
Fix handler coverage, disable dangerous sampling on **error** level, add **panic hooks**, alert on **5xx rate** independent of “log mentions.”

## Interview tip
Treat **edge + platform + app** as one **failure surface** for 5xx investigations.`,
        followUps: [
          fu('How to reduce alert fatigue?', 'SLO-based alerts, multi-window burn rates, dedupe, and actionable runbooks.'),
          fu('Synthetic checks?', 'Periodic canary requests validate critical paths even when organic traffic is low.'),
        ],
      },
    ],
  },
  {
    id: 'caching-consistency',
    title: 'Caching — speed vs correctness',
    subtitle: 'Invalidation, stampedes, and stale reads.',
    tags: ['Redis', 'caching', 'consistency'],
    scenarios: [
      {
        id: 'th-cache-stale',
        question: 'DB updates succeed but users still see old values. What are common causes?',
        signals: ['cache invalidation', 'TTL', 'replica lag'],
        answer: `## What’s going wrong
Database shows the **new value**, but API responses or UI still show **old** data — sometimes **intermittently**.

## Why this happens
**Cache-aside**: reads serve stale entries if **invalidation** on write fails or is forgotten. **TTL too long** delays convergence. **CDN** caches GET responses. **Read replicas** lag behind primary — not “cache” but looks like it. **Multi-layer** caches (local + Redis) desync.

## What to check (and why)
1. **Which layer** answered — add **X-Cache** debug headers or trace tags.
2. **Invalidation path** on every write mutation — code review for missed branches.
3. **TTL vs freshness SLO** — business tolerance drives design.
4. **Replica lag metrics** — if high, stale reads are **expected**.
5. **Key construction** — wrong key → reading **another tenant’s** stale entry (worse than stale).

## Behind the scenes
**Cache-aside** flow: on miss, load DB and populate cache; on update, either **write-through**, **write-behind**, or **invalidate**. **Event-driven invalidation** via pub/sub keeps layers coherent but adds complexity.

## What you’d do in production
Define **consistency tier** per endpoint (strong vs eventual), implement **versioned keys**, monitor **hit ratio** and **staleness**, bust CDN on publish.

## Interview tip
Say **“There are only two hard problems: cache invalidation and naming”** — then show your **systematic** invalidation design.`,
        followUps: [
          fu('Cache-aside vs write-through?', 'Aside: app loads cache on miss; risk stale unless invalidated. Write-through: writes go to cache+DB together; more consistent but write latency cost.'),
          fu('Thundering herd?', 'Many misses hit DB at once — mitigate with **singleflight**, **probabilistic early refresh**, or locks.'),
        ],
      },
      {
        id: 'th-cache-down',
        question: 'Redis goes down and the database is overwhelmed. What design prevents this?',
        signals: ['degradation', 'circuit breaker', 'timeouts'],
        answer: `## What’s going wrong
**Redis** dies; traffic **floods the database** and the site **collapses** worse than if there were no cache.

## Why this happens
Cache **masked** how many queries you truly need. On miss storm (**thundering herd**), every request becomes a **DB query** simultaneously. If app **blocks** waiting on Redis timeouts, thread pools **saturate** too.

## What to check (and why)
1. **Cache timeout** — fail fast, don’t wait 30s per call.
2. **Circuit breaker** on Redis client — open → degrade gracefully.
3. **Singleflight / request coalescing** — one DB query populates many waiters.
4. **DB connection pool** — sized for **cache-miss baseline**, not fantasy.
5. **Autoscaling** policy — CPU may spike suddenly on herd.

## Behind the scenes
Caches are **performance optimization**, not **correctness**. **Stale-while-revalidate** serves slightly old data while refreshing async. **Bulkhead** isolates cache failures from whole service.

## What you’d do in production
Redis HA (replica/sentinel/cluster), **graceful degradation** mode, **load shedding**, **rehearse** cache outage drills.

## Interview tip
Phrase: **“Cache absence should not be a surprise DDoS to the DB.”**`,
        followUps: [
          fu('Multi-tenant cache key mistake?', 'Missing tenant in key → **data leaks** across users; always namespace keys.'),
          fu('Redis memory eviction impact?', 'Hot keys evicted → miss storm; tune policy and monitor hit ratio.'),
        ],
      },
    ],
  },
  {
    id: 'mobile-network-apis',
    title: 'APIs that survive mobile networks',
    subtitle: 'Retries, duplicates, and flaky connectivity.',
    tags: ['mobile', 'API design', 'idempotency'],
    scenarios: [
      {
        id: 'th-mob-double-tap',
        question: 'User taps Pay once but two charges appear. What failed in API design?',
        signals: ['idempotency key', 'network retry'],
        answer: `## What’s going wrong
User tapped **Pay once**; **two charges** appear — classic mobile + unreliable network bug.

## Why this happens
Mobile clients often **retry** on slow responses. If the server **processed** the first request but the **ACK never arrived**, the client sends another **POST**. Without **idempotency**, the server treats it as a **new** payment.

## What to check (and why)
1. **Idempotency-Key** on payment initiation — server returns same result for duplicates.
2. **Payment provider** idempotency token — second call does not create a new charge.
3. **Client retry policy** — avoid duplicate POST without key.
4. **Status endpoint** — lets client **poll** “what happened to my key?” after timeout.

## Behind the scenes
**TCP** can deliver data even if app response times out at client; **HTTP** is request/response with **ambiguous outcome** on timeout — you need **outcome ids**.

## What you’d do in production
Require keys for writes, log **client request id**, reconcile with PSP, UX shows **pending** until confirmed.

## Interview tip
This scenario is **the** mobile payments interview story — show you know **timeout ambiguity**.`,
        followUps: [
          fu('Server processed payment but client never got 200 — what should API offer?', 'A **status lookup** by client request id or idempotency key so client can reconcile without repeating side effects.'),
          fu('Large payloads on 3G?', '**Pagination**, compression, field selection, fewer round trips with batched endpoints where safe.'),
        ],
      },
      {
        id: 'th-mob-offline',
        question: 'Mobile app syncs after offline period and conflicts appear. Approach?',
        signals: ['version vector', 'LWW', 'merge'],
        answer: `## What’s going wrong
After **offline** usage, sync uploads **conflict**: two edits to the same record with different **timestamps**.

## Why this happens
**Offline-first** means **forked histories**. Without **vector clocks** or **version checks**, the server cannot know **causal order**. **Last-write-wins** drops data silently when clocks skew or edits are concurrent.

## What to check (and why)
1. **Per-resource version / etag** — server rejects stale writes with **409** so client can merge.
2. **Domain merge rules** — counters vs text fields differ.
3. **Server authoritative** fields — money, inventory should not trust client blindly.
4. **Client UX** — show conflicts for human resolution when needed.

## Behind the scenes
**Optimistic concurrency**: client sends \`If-Match: version\`; server compares to current. **CRDTs** for collaborative text are advanced but powerful. **Event sourcing** can replay conflicts deterministically.

## What you’d do in production
Version every mutable resource, test **offline/online** transitions, metrics on **409** rate, document **resolution** UX.

## Interview tip
Admit **LWW is dangerous** for money — show you pick **right merge strategy per type**.`,
        followUps: [
          fu('Optimistic UI risks?', 'Show pending state until server ack; reconcile when response arrives.'),
          fu('Backward compatibility for old app versions?', 'Support multiple API versions or tolerant readers with **feature detection**.'),
        ],
      },
    ],
  },
  {
    id: 'distributed-locks',
    title: 'Distributed locks (Redis and beyond)',
    subtitle: 'When coordination looks easy and breaks in production.',
    tags: ['Redis', 'concurrency', 'locks'],
    scenarios: [
      {
        id: 'th-lock-ttl',
        question: 'A worker crashes while holding a Redis lock. Another worker picks up the job. What can go wrong?',
        signals: ['fencing token', 'TTL', 'exactly-once illusion'],
        answer: `## What’s going wrong
Process **A** held a **Redis lock**, crashed; lock **TTL expired**; process **B** acquired lock and ran the same job — now **two writers** think they own the work, or **A** wakes up and still mutates data.

## Why this happens
Distributed locks are **not** like JVM \`synchronized\`: **network delays**, **GC pauses**, and **clocks** mean lease timing is fuzzy. If work runs longer than TTL, another node can steal the lock. **Without fencing**, storage cannot tell **which era** of lock holder is valid.

## What to check (and why)
1. **TTL vs job duration** — TTL must cover p99 runtime + safety margin, with **lease renew** heartbeat.
2. **Fencing token** monotonic per lock acquisition — storage rejects writes with **old** token.
3. **Exactly-once illusion** — assume **at-least-once** execution; make effects **idempotent**.
4. **Unlock script** — must be **atomic** (Lua) and verify **value matches** holder to avoid deleting others’ locks.

## Behind the scenes
Redis **SET key NX PX** gives a lease. **RedLock** debates highlight that distributed consensus over async networks is subtle — many teams prefer **DB row locks** or **Kafka single partition** for coordination when correctness is paramount.

## What you’d do in production
Prefer **idempotency + unique constraints** where possible; if locks required, use **fencing**, monitor **lock wait time**, chaos-test **process pause**.

## Interview tip
Show you know locks are **leases**, not magic mutual exclusion across all failure modes.`,
        followUps: [
          fu('RedLock controversy — what is the interview point?', 'Distributed locks over async networks have **edge cases**; prefer DB **constraints** or **lease** patterns with clear correctness story.'),
          fu('When avoid locks?', 'Use **idempotent** writes + unique constraints, or single-writer partition in Kafka.'),
        ],
      },
      {
        id: 'th-lock-contention',
        question: 'Distributed lock causes massive latency under load. Why?',
        signals: ['coarse lock', 'hot key'],
        answer: `## What’s going wrong
Adding a **distributed lock** “to be safe” made endpoints **10× slower** under load — throughput collapses.

## Why this happens
**Contention**: every request fights for the **same key** → serial execution. **Round trips** to Redis per lock/unlock add latency. **Long critical sections** (remote calls inside lock) stretch hold time and amplify waits.

## What to check (and why)
1. **Lock granularity** — can you lock **per entity id** instead of global?
2. **Work inside critical section** — should be **milliseconds** of in-memory work only.
3. **Hot key** in business logic — lock mirrors **application hotspot**.
4. **Alternative** — **optimistic concurrency** or **queue per shard** might scale better.

## Behind the scenes
A lock transforms **parallel** system into **serial** pipeline for that key — **Amdahl** strikes. Redis single-threaded server can itself become **hot** on lock churn.

## What you’d do in production
Shrink critical sections, shard locks, batch operations, consider **lease-based** work queues (Kafka) instead of global mutex.

## Interview tip
Say: **“A lock converts parallelism into serialization — measure contention before adopting.”**`,
        followUps: [
          fu('Compare to optimistic locking?', 'Optimistic: detect conflicts at commit — good when contention is rare; pessimistic when conflicts frequent.'),
          fu('Database row locks vs Redis lock?', 'DB gives transactional integration; Redis is faster but you must design **unlock** and **fencing** carefully.'),
        ],
      },
    ],
  },
  {
    id: 'senior-jvm-gc-performance',
    title: 'Senior Java: JVM, GC, and runtime performance',
    subtitle: 'Pauses, throughput, flags, and what production JVMs actually do.',
    tags: ['JVM', 'GC', 'Java', 'performance', 'senior'],
    scenarios: [
      {
        id: 'th-sr-gc-pauses',
        question:
          'Production users see periodic latency spikes; metrics show stop-the-world GC pauses of 2–5 seconds. How do you approach tuning?',
        signals: ['GC logs', 'G1 vs ZGC', 'heap sizing', 'allocation rate', 'humongous objects'],
        answer: `## What’s going wrong
End-user latency jumps align with **stop-the-world (STW)** collections: the JVM pauses all application threads to reclaim or compact memory. Spikes of **seconds** usually mean **heap pressure**, **wrong collector for SLA**, or **humongous / giant** allocations.

## Why this happens
**Allocation rate** exceeds what the collector can reclaim incrementally → **full collections** or long **young-gen** pauses. **Heap too large** with a collector tuned for throughput can increase pause times. **Metaspace** or **class unloading** can contribute. **Container limits** + huge heap can cause **long marking** phases.

## What to check (and why)
1. **GC logs** (JDK unified logging: \`gc*\`, \`safepoint*\`) — shows pause times, phases, and whether problem is young vs old gen.
2. **Heap usage over time** — sustained near-max triggers frequent full GC; proves sizing or leak suspicion.
3. **Allocation profiler** (async-profiler, JFR) — finds **hot allocation sites** and accidental **byte[]** storms.
4. **JVM version and default GC** — JDK 11+ defaults differ; **ZGC/Shenandoah** target low pause vs **Parallel** for batch.
5. **Humongous objects** (G1) — large arrays bypass normal regions and trigger special paths.

## Behind the scenes
**Safepoints** stop threads at well-defined points for GC and JIT work. Long **TTSP** (time to safepoint) can look like “GC pause” in dashboards. **G1** balances pause targets with **mixed collections**; **ZGC** uses concurrent algorithms with different CPU trade-offs.

## What you’d do in production
Capture **before/after** GC logs, right-size heap vs container, reduce **allocation churn** in hot paths, evaluate **collector** vs SLO, add **GC pause alerts**, fix **memory leaks** if old gen never releases.

## Interview tip
Senior answers pair **pause time vs throughput vs footprint** — never “just increase heap” without evidence from GC logs.`,
        followUps: [
          fu('G1 vs ZGC in one sentence?', '**G1** is generational, pause-target oriented, widely default; **ZGC** (modern) aims at **sub-ms** pauses on large heaps with more CPU/barrier cost.'),
          fu('What is allocation rate?', 'Bytes allocated per second; high rate + weak locality forces GC to work harder — often fixed in app code, not only flags.'),
        ],
      },
      {
        id: 'th-sr-cpu-no-gc',
        question:
          'CPU is high but GC logs show little pause time. The service is still slow. Where else do you look in the JVM/runtime?',
        signals: ['JIT compilation', 'safepoint', 'native', 'locks', 'JFR'],
        answer: `## What’s going wrong
Throughput is poor and **CPU is busy**, but **GC pauses** are not the story. The bottleneck is **application code**, **JIT**, **locks**, **native libraries**, or **safepoint stalls**.

## Why this happens
**Inefficient hot loops**, **regex/JSON** on huge strings, **synchronized** contention, **false sharing**, or **JNI/crypto** burn CPU without long GC events. **JIT deoptimization** or **tiered compilation** can cause temporary regressions. **Biased locking revocation** (older JDKs) showed up as weird spikes.

## What to check (and why)
1. **CPU flame graph / JFR** — attributes time to **methods**, not guesses.
2. **Lock profiling** — shows **blocked vs running** threads; high contention is not “CPU mystery.”
3. **Native stack** (async-profiler) — if CPU is in **libzip**, **SSL**, or **compression**.
4. **Safepoint log** — long **TTSP** or **VM operations** correlate with “everything stops” without classic GC pause.

## Behind the scenes
The JVM runs **interpreted** then **C1/C2** compiled code; **on-stack replacement** and **deopts** change performance over **warmup**. **JFR** ties **Java + native + JVM** events in one timeline.

## What you’d do in production
Profile under **representative load**, fix dominant frames, reduce lock scope, cache parsed structures, validate **JDK upgrade** impact with benchmarks.

## Interview tip
Say: **“Separate GC pauses from CPU-bound work — different tools and fixes.”**`,
        followUps: [
          fu('What is false sharing?', 'Independent variables on the **same cache line** cause cores to invalidate each other’s caches — looks like lock contention but is memory layout.'),
          fu('Warmup matters for interviews?', 'Yes — first-request slowness after deploy is often **JIT + class init**; measure steady state and cold start separately.'),
        ],
      },
      {
        id: 'th-sr-metaspace',
        question:
          'After many hot redeploys in Tomcat/Spring, you hit java.lang.OutOfMemoryError: Metaspace. What is happening and how do you fix it?',
        signals: ['class loaders', 'Metaspace', 'redeploy leak', 'CGlib proxies'],
        answer: `## What’s going wrong
The JVM runs out of **class metadata** space: new classes keep loading but old **class loaders** (and their classes) are not collectible.

## Why this happens
Each redeploy often creates a **new ClassLoader** for the web app. If **references** to that loader remain (threads, **static** fields, **ThreadLocal**, **driver registration**, **OSGi**-style caches), **classes never unload** → **Metaspace** grows until OOM. **Dynamic proxies** (Spring, Hibernate, Mockito) generate many classes.

## What to check (and why)
1. **Heap dump / class histogram** — count of \`Class\` instances by loader; exploding counts confirm leak.
2. **Redeploy procedure** — are old contexts **fully destroyed**?
3. **ThreadLocals** in app code — forgotten **remove()** pins loaders.
4. **JDBC drivers** — improper deregister on undeploy.

## Behind the scenes
**Metaspace** (Java 8+) replaced PermGen; it grows in **native memory** (subject to **MaxMetaspaceSize**). GC collects **dead** class loaders when **no live references** exist — leak = live references.

## What you’d do in production
Fix **classloader leaks** (ThreadLocal hygiene, shutdown hooks), set **reasonable MaxMetaspaceSize** to fail fast, prefer **container replace** over endless in-place redeploy, use **MAT** loader analysis.

## Interview tip
Link **Metaspace OOM** to **classloader lifecycle**, not heap — senior distinction.`,
        followUps: [
          fu('Why not only raise MaxMetaspaceSize?', 'Masks the leak until the host runs out of **native** memory or kills the process — fix retention.'),
          fu('Spring Boot fat jar vs classic WAR?', 'Fat jar **restarts process** → fresh Metaspace; classic **hot redeploy** is where loader leaks historically hurt.'),
        ],
      },
    ],
  },
  {
    id: 'senior-java-concurrency-jmm',
    title: 'Senior Java: Concurrency and the memory model',
    subtitle: 'Visibility, ordering, and java.util.concurrent in real systems.',
    tags: ['concurrency', 'JMM', 'Java', 'senior'],
    scenarios: [
      {
        id: 'th-sr-volatile-visible',
        question:
          'Two threads share a boolean "running" flag without volatile. One sets it false; the other loop may never exit. Why?',
        signals: ['happens-before', 'visibility', 'JIT caching', 'volatile'],
        answer: `## What’s going wrong
The reader thread **never observes** the writer’s update to a plain **boolean** field — the loop runs “forever” in production but looks fine in debugger.

## Why this happens
Without a **happens-before** relationship, the JVM is allowed to **cache** the field in a CPU register or core-local cache and **not reload** from main memory. The writer’s update is **not guaranteed visible** to the reader without **synchronization** or **volatile**.

## What to check (and why)
1. **Field declaration** — missing \`volatile\` or improper \`AtomicBoolean\`.
2. **All exit paths** — is the flag written under the **same** lock the reader uses? If not, still broken.
3. **Tests** — concurrency bugs are **non-deterministic**; need stress tests or JCStress mindset.

## Behind the scenes
The **Java Memory Model** defines which reorderings are legal. **volatile** reads/writes establish **happens-before** with prior writes. \`synchronized\` and **concurrent** utilities embed those edges.

## What you’d do in production
Use \`volatile\` for simple flags, \`Atomic*\` for CAS updates, or **proper** lock boundaries; document invariants; add **lint** (Error Prone) for known patterns.

## Interview tip
Distinguish **atomicity** (read-modify-write) from **visibility** — \`volatile\` fixes visibility, not compound operations like \`count++\`.`,
        followUps: [
          fu('Is volatile enough for a counter?', '**No** for \`++\` — use \`AtomicInteger\` or synchronization; volatile alone does not make read-modify-write atomic.'),
          fu('What establishes happens-before?', 'Unlock before lock on same monitor, volatile write before volatile read, thread start/join, concurrent queue ops, etc.'),
        ],
      },
      {
        id: 'th-sr-executor-pool',
        question:
          'You use a fixed thread pool for all tasks. Under load, HTTP requests time out while pool threads are stuck in blocking JDBC calls. Explain and fix.',
        signals: ['pool isolation', 'bounded queues', 'CallerRunsPolicy', 'async servlet'],
        answer: `## What’s going wrong
**Tomcat/Jetty worker threads** or a **shared executor** are **blocked** waiting on JDBC, so **no threads** remain to accept or process other work → cascading timeouts.

## Why this happens
**Coupling** all work types on one pool means **slow I/O** starves **fast tasks**. **Unbounded queues** hide overload until everything is stuck. **CallerRunsPolicy** can block the servlet thread that submits, worsening HTTP backlog.

## What to check (and why)
1. **Thread dump** — count threads blocked on \`socketRead0\` / JDBC.
2. **Pool metrics** — active, queue size, rejections.
3. **Connection pool vs thread pool** sizing — threads waiting for **connections** amplify the stall.

## Behind the scenes
**Little’s law**: if tasks arrive faster than threads complete, **queue grows** or **reject**. **Reactive** or **virtual threads** (Java 21) change the model but **downstream** (DB) still bounds throughput.

## What you’d do in production
**Separate pools** for CPU vs I/O, right-size **Hikari** and executor, use **async** endpoints with care, **timeout** JDBC, **bulkhead** critical paths.

## Interview tip
Senior answer: **“One pool for everything is a denial-of-service to yourself.”**`,
        followUps: [
          fu('CallerRunsPolicy — when good?', '**Backpressure** to the submitter when queue full — useful for batch, dangerous if submitter is HTTP thread.'),
          fu('Virtual threads change what?', 'Cheap **blocking** threads — but **DB connections** and **CPU** still finite; not magic scaling.'),
        ],
      },
      {
        id: 'th-sr-completablefuture',
        question:
          'A pipeline built with CompletableFuture chains sometimes never completes in production — no exception in logs. What goes wrong?',
        signals: ['default ForkJoinPool', 'exception handling', 'join timeout', 'thread starvation'],
        answer: `## What’s going wrong
**Async stages** hang: a **missing** \`exceptionally\`/\`handle\` swallows failures, **deadlock** on common pool, or **blocking** inside a CF callback exhausts **ForkJoinPool**.

## Why this happens
\`CompletableFuture.runAsync\` without executor uses **ForkJoinPool.common()** — shared globally; **blocking** in tasks **starves** other library and app async work. **Uncaught** async exceptions do not propagate to the caller unless **explicitly** chained. **join()** without timeout waits forever.

## What to check (and why)
1. **Explicit Executor** for I/O-bound CF work — isolates from **common pool**.
2. **whenComplete / exceptionally** on every stage — surfaces failures.
3. **Timeouts** on \`get\`/\`join\` or **orTimeout** (Java 9+) — prevents silent hang.
4. **Thread dump** — blocked tasks on **CompletableFuture**.

## Behind the scenes
**ForkJoinPool** is work-stealing, optimized for **CPU** tasks; blocking there is an **anti-pattern** (documented as “managed blocker” only with care).

## What you’d do in production
Dedicated **executor** per domain, standard **error handling** pattern for CF, **metrics** on incomplete futures, prefer **structured concurrency** (Java 21+) for new code.

## Interview tip
Mention **never block on common pool** — instant senior signal for async Java.`,
        followUps: [
          fu('StructuredConcurrency briefly?', 'Java 21 \`StructuredTaskScope\` ties child tasks to parent scope for **cancellation** and **failure propagation** — fewer “lost” async errors.'),
          fu('Difference from reactive (Reactor)?', 'Similar **scheduler** discipline needed; both need explicit **error** and **timeout** handling — API shape differs.'),
        ],
      },
    ],
  },
  {
    id: 'senior-spring-transactions',
    title: 'Senior Java: Spring transactions and data integrity',
    subtitle: 'Proxy semantics, propagation, isolation, and production footguns.',
    tags: ['Spring', 'transactions', '@Transactional', 'senior'],
    scenarios: [
      {
        id: 'th-sr-self-invoke',
        question:
          'A method annotated with @Transactional does not roll back when called from another method in the same class. Why?',
        signals: ['proxy', 'self-invocation', 'AOP', 'public method'],
        answer: `## What’s going wrong
**Database commits** even though an inner method throws: **transaction boundary** never applied to the inner call.

## Why this happens
Spring’s **@Transactional** is implemented via a **JDK proxy or CGLIB proxy** around the bean. **Internal calls** (\`this.method()\`) **bypass** the proxy — no interceptor runs → **no transaction** (or wrong propagation) on the inner method.

## What to check (and why)
1. **Call path** — inner method invoked via \`this\` vs **injected self** or **separate bean**.
2. **Method visibility** — \`private\`/\`final\` methods on JDK proxy can’t be intercepted (CGLIB has nuances).
3. **Exception type** — default rollback is **RuntimeException** / **Error**, not checked unless \`rollbackFor\`.

## Behind the scenes
The proxy **wraps** the bean; only **external** calls through the proxy hit **TransactionInterceptor**. **AspectJ compile-time weaving** is an alternative if you truly need self-invocation semantics.

## What you’d do in production
**Refactor** transactional logic into another **service bean**, inject self with \`@Lazy\` if needed, or use **AspectJ**; add **integration tests** that assert rollback.

## Interview tip
This is the **#1** Spring transaction interview trap — name **proxy + self-invocation** clearly.`,
        followUps: [
          fu('Does @Transactional on class work?', 'Yes for **public** methods of the proxy; same **self-call** issue applies.'),
          fu('readOnly=true — what does it optimize?', 'Hints Hibernate/ JDBC driver for **read-only** connections and avoids **dirty checking** writes — not a security boundary.'),
        ],
      },
      {
        id: 'th-sr-propagation',
        question:
          'Service A calls Service B in the same request. A uses REQUIRED; B uses REQUIRES_NEW. A catches B’s exception and continues — what happens to B’s work?',
        signals: ['REQUIRES_NEW', 'suspend', 'commit', 'independent transaction'],
        answer: `## What’s going wrong
**Surprising persistence**: **B’s transaction commits** even though **A** caught the exception and “handled” it — partial side effects visible to other transactions.

## Why this happens
**REQUIRES_NEW** **suspends** the outer transaction and starts a **new** physical transaction for B. **Commit** of B happens when B’s method completes **successfully** — **before** control returns to A. **A’s catch** cannot roll back **already committed** work from B.

## What to check (and why)
1. **Propagation settings** on both services — maps to **actual** JDBC transaction boundaries.
2. **Business invariant** — is **partial commit** acceptable?
3. **Tests** with **two datasources** or **transaction synchronization** callbacks if debugging.

## Behind the scenes
Spring tracks **TransactionStatus** per thread; **suspend/resume** binds/unbinds **Connection** holders. Nested **savepoints** use **NESTED** (when supported), different from **REQUIRES_NEW**.

## What you’d do in production
Use **REQUIRES_NEW** only for **auditing**, **outbox** publish, or **intentional** isolation; otherwise prefer **single** transaction or **compensating** saga; document **exception** contracts.

## Interview tip
Contrast **REQUIRES_NEW** (independent commit) vs **NESTED** (rollback-only to savepoint) vs **REQUIRED** (join outer).`,
        followUps: [
          fu('MANDATORY vs REQUIRED?', '**MANDATORY** fails if **no** existing transaction; **REQUIRED** **joins** or **creates** one.'),
          fu('Same thread only?', 'Spring @Transactional is **thread-bound** — async without **TxContext** propagation loses transaction.'),
        ],
      },
      {
        id: 'th-sr-isolation',
        question:
          'Under load, reports show “duplicate” aggregated rows until rerun. You use READ_COMMITTED. What isolation issues might still appear?',
        signals: ['phantom read', 'non-repeatable read', 'lost update', 'SERIALIZABLE cost'],
        answer: `## What’s going wrong
**Non-deterministic** report results or **lost updates** when two transactions interleave — even without “dirty reads.”

## Why this happens
**READ_COMMITTED** prevents **dirty reads** but allows **non-repeatable reads** (row changes between reads) and **phantom reads** (new rows matching a predicate). **Lost update** can occur if two transactions **read-modify-write** without **locking** or **version** check.

## What to check (and why)
1. **Query patterns** — range scans + concurrent inserts → **phantoms**.
2. **ORM** optimistic \`@Version\` — prevents **lost update** without SERIALIZABLE.
3. **DB defaults** — PostgreSQL **RC** vs MySQL **RR** in older defaults — behavior differs.

## Behind the scenes
**Isolation** is implemented via **locks** and **MVCC** snapshots. **SERIALIZABLE** (true serializable or SSI) prevents anomalies at **cost** of **retries** / **deadlocks**.

## What you’d do in production
Use **version columns**, **SELECT FOR UPDATE** where justified, **idempotent** aggregates, **snapshot** tables for heavy reports, avoid long transactions.

## Interview tip
Name the **three classic anomalies** and which levels block them — shows DB literacy beyond Spring.`,
        followUps: [
          fu('Optimistic lock exception in JPA?', '**\`OptimisticLockException\`** on stale version — **retry** business operation or surface conflict to user.'),
          fu('@Transactional isolation=SERIALIZABLE in web apps?', 'Often **too heavy**; prefer **domain** constraints and **shorter** transactions.'),
        ],
      },
    ],
  },
  {
    id: 'senior-hibernate-jpa',
    title: 'Senior Java: Hibernate / JPA in production',
    subtitle: 'N+1, lazy loading, sessions, and consistency with the database.',
    tags: ['Hibernate', 'JPA', 'Spring Data', 'senior'],
    scenarios: [
      {
        id: 'th-sr-n-plus-one',
        question:
          'An API that returns 100 orders with line items triggers thousands of SQL queries. How do you diagnose and fix it?',
        signals: ['N+1', 'fetch join', '@EntityGraph', 'batch size'],
        answer: `## What’s going wrong
**Latency** and **DB load** explode: one query for parents plus **one per child** (or per association) — classic **N+1**.

## Why this happens
**Lazy** collections load when accessed; in a loop, each access runs a **new** query. **Open Session In View** can hide the problem in dev until **latency** or **connection pool** saturates.

## What to check (and why)
1. **SQL log / Hibernate statistics** — count statements per request.
2. **Where associations are touched** — DTO mapping loops trigger lazy loads.
3. **Fetch plan** — missing \`JOIN FETCH\`, \`@EntityGraph\`, or **DTO projection** query.

## Behind the scenes
Hibernate **lazy** proxies load via **Session**; **batch fetching** can group lazy loads by **batch-size** but is not a substitute for a **conscious** fetch plan.

## What you’d do in production
**Explicit** fetch joins or **projections** (\`JOIN\` in JPQL), **@BatchSize** where appropriate, **disable OSIV** for APIs and use **transactional** service boundaries, **integration test** with SQL assertion.

## Interview tip
Say **“fix the fetch graph, not just eager everywhere”** — eager global causes **cartesian product** pain.`,
        followUps: [
          fu('JOIN FETCH cartesian product?', 'Multiple **bag** collections in one query can multiply rows — use **multiple** queries or **DTO** mapping strategies.'),
          fu('Spring Data \`@EntityGraph\`?', 'Declares **attribute paths** to load in one query — keeps repository layer expressive.'),
        ],
      },
      {
        id: 'th-sr-lazy-session',
        question:
          'You get LazyInitializationException in a REST controller after moving @Transactional to a thinner service layer. What broke?',
        signals: ['session closed', 'OSIV', 'transaction boundary', 'DTO'],
        answer: `## What’s going wrong
Serialization (Jackson) or mapping touches a **lazy** association **after** the **PersistenceContext** closed.

## Why this happens
**@Transactional** ended → **Session/EntityManager** closed → **lazy** proxy cannot load. Previously **OpenEntityManagerInView** kept session open across **controller** rendering (masks design smell).

## What to check (and why)
1. **Transaction boundary** vs **where** lazy fields are read.
2. **OSIV filter** enabled or not — intentional change?
3. **DTO mapping** location — should run **inside** transaction or use **fetch join**.

## Behind the scenes
Hibernate **lazy** is bytecode proxy + **Session** callback; no session → exception. **DTO projection** avoids loading entities you do not need.

## What you’d do in production
Fetch required data **inside** service transaction, return **DTOs**, keep controllers **thin**; avoid relying on OSIV for **write** APIs.

## Interview tip
Frame OSIV as **convenience vs clear boundaries** — senior teams often **disable** it for services.`,
        followUps: [
          fu('Is OSIV always bad?', 'No — **read-only** server-rendered pages it can simplify; for **REST** at scale, explicit fetching is usually clearer.'),
          fu('merge() vs persist() interview angle?', '**persist** — new; **merge** — detached graph reattachment — wrong use causes **extra** selects or **unexpected** updates.'),
        ],
      },
      {
        id: 'th-sr-flush-order',
        question:
          'A test fails: a DB constraint violation despite setting parent before child in Java. Order of SQL surprises the team. What explains it?',
        signals: ['flush order', 'cascading', 'bidirectional', '@GeneratedValue'],
        answer: `## What’s going wrong
**INSERT/UPDATE** order from Hibernate does not always match **Java field assignment** order — **constraint** (FK, unique) fails in tests or prod.

## Why this happens
Hibernate **flush** computes **action** order from **entity graph**, **cascade**, **nullable** FKs, and **identifier** assignment. **Bidirectional** associations not **synchronized** confuse ownership. **Batching** reorders statements.

## What to check (and why)
1. **Owning side** of association — JPA relationship **mappedBy** vs **@JoinColumn**.
2. **nullable=false** and **when** IDs are generated — child may flush before parent has key.
3. **sql_show** + **order_inserts** / **order_updates** tuning if needed.

## Behind the scenes
**Flush** builds **Executable** list sorted for **referential integrity**; wrong mapping makes Hibernate **guess** wrong. **@MapsId** can align **dependent** PK with parent.

## What you’d do in production
Fix **mapping** (owning side, **add** both directions in helper method), use **@MapsId** for **derived** identities, **test** against real constraints.

## Interview tip
Shows you know JPA is **ORM state machine**, not “Java order = SQL order.”`,
        followUps: [
          fu('cascade=PERSIST pitfall?', 'Accidentally persisting **transient** graph you did not intend — **orphanRemoval** deletes surprise rows.'),
          fu('Why avoid Lombok @Data on entities?', '**equals/hashCode** on **mutable** fields or **collections** break **Set** semantics and Hibernate **identity** — use **id-only** or framework-safe patterns.'),
        ],
      },
    ],
  },
  {
    id: 'senior-spring-security',
    title: 'Senior Java: Spring Security in depth',
    subtitle: 'Filter chain, authorization, and common production mistakes.',
    tags: ['Spring Security', 'OAuth2', 'Java', 'senior'],
    scenarios: [
      {
        id: 'th-sr-filter-order',
        question:
          'After adding a custom filter, authentication is null in later filters or the controller. How do you reason about SecurityFilterChain order?',
        signals: ['SecurityFilterChain', 'addFilterBefore', 'OncePerRequestFilter', 'dispatcher types'],
        answer: `## What’s going wrong
**SecurityContext** is empty or **wrong** when your code runs: **401** on protected paths or **null** \`Authentication\` despite login.

## Why this happens
**Filter order** matters: your filter may run **before** \`UsernamePasswordAuthenticationFilter\` / **JWT** filter populates **SecurityContextHolder**. **DispatcherType** (ERROR, ASYNC) may skip filters if not registered. **Wrong** \`shouldNotFilter\` logic skips paths incorrectly.

## What to check (and why)
1. **Ordered** position in **SecurityFilterChain** bean — compare to **BearerTokenAuthenticationFilter** etc.
2. **Debug** logging \`org.springframework.security\` — shows **which** filter authenticated.
3. **Request path** matchers — separate chains for **actuator** vs API.

## Behind the scenes
Spring Security builds a **virtual filter chain** per **HttpSecurity** configuration. **SecurityContext** is **ThreadLocal**; must be **cleared** (filters do this) to avoid **leaks** in servlet pools.

## What you’d do in production
Document **filter diagram** for the team, use **integration tests** with \`@AutoConfigureMockMvc\`, avoid **business logic** in filters except **cross-cutting** auth concerns.

## Interview tip
State: **“Security is a pipeline — position is behavior.”**`,
        followUps: [
          fu('SecurityContextHolder mode?', '**MODE_INHERITABLETHREADLOCAL** for async — risky; prefer **propagation** with **DelegatingSecurityContext** wrappers.'),
          fu('Method security vs URL security?', '**@PreAuthorize** after authentication; URL rules first line of defense — **both** layers for defense in depth.'),
        ],
      },
      {
        id: 'th-sr-csrf-spa',
        question:
          'A React SPA + Spring Boot API starts getting 403 on POST after enabling cookie-based session auth. What is the likely cause and fix?',
        signals: ['CSRF', 'SameSite', 'CORS', 'Bearer vs cookie'],
        answer: `## What’s going wrong
**POST**/**PUT** fail with **403 Forbidden** from Spring Security while **GET** works — often **CSRF** protection rejecting **missing** or **wrong** token.

## Why this happens
**Session** + **cookie** authentication is **vulnerable** to CSRF; Spring enables **CSRF** by default for browser clients. **SPAs** using **fetch/XHR** must send **X-XSRF-TOKEN** header (or disable CSRF only with **token** alternative). **SameSite=None** requires **Secure** cookies.

## What to check (and why)
1. **CSRF** disabled vs **token** endpoint for SPA — intentional architecture?
2. **CORS** allows **credentials** and correct **origin** — cookies not sent cross-site otherwise.
3. **JWT Bearer** path — CSRF **not** same issue (different threat model).

## Behind the scenes
**Double-submit cookie** or **synchronizer token** pattern: server expects header matching cookie. **BREACH** / **cookie flags** are part of hardening.

## What you’d do in production
For SPA + session: expose **CSRF** token API, configure **CookieCsrfTokenRepository**, **SameSite** policy; or move to **Bearer** + **short-lived** tokens with **XSS** defenses.

## Interview tip
Connect **403** to **CSRF** vs **authorization** — quick diagnostic split.`,
        followUps: [
          fu('When disable CSRF?', '**Stateless** APIs with **Bearer** only — still need **authorization** and **XSS** protection for tokens in storage.'),
          fu('CORS preflight + credentials?', '**Specific origins**, not \`*\`, when \`credentials: true\`.'),
        ],
      },
    ],
  },
  {
    id: 'senior-java-modules-classloading',
    title: 'Senior Java: Class loading, modules, and libraries',
    subtitle: 'JPMS basics, dependency conflicts, and JDK upgrades.',
    tags: ['classloader', 'JPMS', 'Java', 'senior'],
    scenarios: [
      {
        id: 'th-sr-duplicate-jars',
        question:
          'NoSuchMethodError at runtime after a dependency upgrade even though the project compiles. How do you track it down?',
        signals: ['classpath', 'Maven dependency', 'shading', 'binary incompatibility'],
        answer: `## What’s going wrong
The JVM loads an **older** (or different) **.class** than the compiler used — **method** or **signature** missing at runtime.

## Why this happens
**Transitive** dependencies pull **two versions** of the same library; **classpath order** picks the wrong one. **Fat jars** **shade** incorrectly. **JDK** upgrade exposes **removed** APIs (e.g. internal sun.*). **Spring Boot BOM** vs manual version **override** conflict.

## What to check (and why)
1. \`mvn dependency:tree\` / Gradle **dependencyInsight** — find **duplicate** artifacts.
2. **Actual** loaded class: \`-verbose:class\` or **debugger**.
3. **Release notes** of upgraded lib — **binary incompatible** change despite **source** compile (default methods rare edge).

## Behind the scenes
**Linkage** is by **descriptor** (name + descriptor); **NoSuchMethodError** means **wrong** bytecode on classpath, not “compiler lied” — usually **two jars**.

## What you’d do in production
**Enforce** one version (\`dependencyManagement\`, constraints), **exclude** transitives, **integration tests** on **runtime** classpath, **align** Boot BOM.

## Interview tip
**Compile vs runtime classpath** difference — essential for senior build hygiene.`,
        followUps: [
          fu('NoClassDefFoundError vs ClassNotFoundException?', '**CNFE** — loader cannot find name; **NCDFE** — class failed **init** earlier or **missing** dependent class at load time.'),
          fu('Java Platform Module System quick point?', '**JPMS** adds **module-path** visibility; **illegal reflective access** warnings on JDK 9+ until libraries add **opens** / migration.'),
        ],
      },
      {
        id: 'th-sr-jdk-upgrade',
        question:
          'Moving from Java 11 to 21, some reflection-based frameworks (serialization, Hibernate, Spring) break. What changed and how do you migrate?',
        signals: ['strong encapsulation', 'internals', 'records', 'preview features'],
        answer: `## What’s going wrong
**IllegalAccessError** / **InaccessibleObjectException** or **serialization** failures after JDK upgrade — code or libs touched **JDK internal** packages or relied on **removed** APIs.

## Why this happens
JDKs **encapsulate** internal packages by default; **reflection** into \`java.*\` / \`jdk.*\` internals needs **--add-opens** (temporary) or **library upgrade**. **Removed** APIs (e.g. SecurityManager-related, some sun.misc) vanish. **Byte-code** libraries must support newer **class file** versions.

## What to check (and why)
1. **JEP** migration guides for **11→17→21**.
2. **--illegal-access** diagnostic logs (older flags) or JVM errors naming **module** / **package**.
3. **Framework versions** — Spring Boot **3.x** baseline Java 17.

## Behind the scenes
**JPMS** enforces **readability** and **opens** for deep reflection; **unnamed module** reads everything **exported** from **classpath** — still blocked from **illegal** deep opens without flags.

## What you’d do in production
Upgrade **frameworks first**, add **minimal** \`add-opens\` as **bridge**, remove over time, run **full regression** + **performance** baseline.

## Interview tip
Prefer **“upgrade dependencies, not pile JVM flags forever”** — flags are **debt**.`,
        followUps: [
          fu('Records vs Lombok for DTOs?', '**Records** are immutable carriers with **built-in** equals/hashCode/toString — great for APIs; Lombok still common for **mutable** builders.'),
          fu('Sealed classes interview hook?', '**Sealed** hierarchies for **exhaustive** pattern matching in **switch** — domain modeling + compiler checks.'),
        ],
      },
    ],
  },
  {
    id: 'senior-kafka-messaging',
    title: 'Senior Java: Kafka and async messaging',
    subtitle: 'Consumer groups, delivery semantics, and keeping DB and bus consistent.',
    tags: ['Kafka', 'messaging', 'Java', 'senior', 'distributed systems'],
    scenarios: [
      {
        id: 'th-kafka-lag',
        question:
          'Dashboards show high consumer lag but brokers look healthy. How do you tell if the problem is consumers, partitions, or upstream publish rate?',
        signals: ['consumer lag', 'partition assignment', 'fetch rate', 'processing time'],
        answer: `## What’s going wrong
**End-to-end lag** grows: messages sit on the log longer than SLO. Stakeholders blame “Kafka,” but lag is often **consumer throughput** or **skew**, not broker failure.

## Why this happens
Lag = how far **consumer offset** trails **log end offset**. If **processing** per message is slow, **one partition** is hot, or **too few consumers** relative to partitions, lag climbs. **Bursty producers** can outpace steady consumers. **Paused** or **stuck** consumers stop committing.

## What to check (and why)
1. **Per-partition lag** — proves **hot key** / skew vs uniform slowdown.
2. **Consumer group metrics**: records consumed/sec, poll latency, **time between polls** — violates **max.poll.interval.ms** if processing inside poll loop is too heavy.
3. **Thread/process health** — one pod OOM-restarting resets consumption.
4. **Broker request latency** — if fetch is slow, it is infra; if fetch is fast but app slow, it is **application** CPU/DB/locks.

## Behind the scenes
Consumers **pull** batches; **cooperative** rebalancing moves partition ownership. **Commits** (sync or async) advance offsets; at-least-once means **reprocessing** is possible after failure.

## What you’d do in production
Scale **consumers** up to **partition count** cap, optimize **handler** (DB batching, idempotency), fix **poison** messages, tune **fetch.min.bytes** / **max.poll.records** for balance, alert on **partition max lag**.

## Interview tip
Define lag as **offset gap**, then separate **broker path** vs **consumer processing** with partition-level data.`,
        followUps: [
          fu('Consumer count vs partitions?', 'You cannot parallelize **one** partition across multiple consumers in the same group — max useful consumers ≈ **partition count**.'),
          fu('Log compaction vs retention?', '**Compaction** keeps latest key; still need **correct** keys and tombstones — different from time retention for replay.'),
        ],
      },
      {
        id: 'th-kafka-rebalance',
        question:
          'After a rolling deploy, Kafka consumers thrash: constant rebalances and duplicate processing spikes. What typically causes this?',
        signals: ['session.timeout', 'max.poll.interval', 'cooperative rebalance', 'static membership'],
        answer: `## What’s going wrong
The **consumer group** repeatedly **loses and regains** partition assignments. Throughput collapses; **duplicates** appear because messages are **reprocessed** after revoke.

## Why this happens
**Slow** message handling or **blocking** inside the **poll loop** exceeds **max.poll.interval.ms** → broker drops the member → **rebalance**. **Long GC** pauses or **CPU throttling** have the same effect. **Too aggressive** rolling restarts multiply join/leave churn. Without **static membership**, every new instance id triggers more rebalance noise.

## What to check (and why)
1. **Consumer logs** for **rebalance** reasons and **heartbeat failures**.
2. **Processing time** distribution — p99 inside handler vs poll budget.
3. **JVM pauses / CPU limits** on pods — invisible in “app logs” but visible in **runtime** metrics.
4. **Consumer config** — session timeout vs processing; **partition count** vs instance count.

## Behind the scenes
The **group coordinator** tracks members via **heartbeats** and **poll** cadence. **CooperativeStickyAssignor** reduces stop-the-world handoffs vs **range** assignors but still needs **timely** polls.

## What you’d do in production
Move heavy work **out of poll thread** (async processing with **pause**/**resume** or decoupled workers), tune **max.poll.interval.ms** with justification, use **static consumer IDs** where safe, limit **concurrent** rollouts, load-test deploy behavior.

## Interview tip
Senior answer ties **rebalance storms** to **poll thread blocking** or **timeouts**, not “Kafka is unstable.”`,
        followUps: [
          fu('Exactly-once in Kafka — realistic?', 'Often **end-to-end** is **idempotent producer + transactional writes + careful consumer** — interview: name **trade-offs** and **failure modes**, not magic.'),
          fu('Why duplicates with at-least-once?', 'Commit after process can **lose** commit on crash → reprocess; process before commit can **double** on crash — design **idempotency**.'),
        ],
      },
      {
        id: 'th-kafka-idempotent',
        question:
          'You chose at-least-once delivery. How do you make downstream side effects (DB writes, payments) safe when messages can be redelivered?',
        signals: ['idempotency key', 'dedupe store', 'outbox', 'unique constraint'],
        answer: `## What’s going wrong
The same **business event** arrives twice; without design, you **double-charge**, **duplicate rows**, or send **two** emails.

## Why this happens
**At-least-once** is the common default: network retries, consumer crashes after process but before commit, or **rebalance** replay. **Exactly-once** across **Kafka + DB + HTTP** without careful boundaries is hard; most systems use **idempotent** handlers.

## What to check (and why)
1. **Natural idempotency** — **UPSERT** by business key, **unique** constraints, **conditional** updates.
2. **Explicit dedupe** — store **message id** / offset in a **processed** table with short TTL.
3. **Outbox pattern** — DB transaction writes **row + outbox row**; publisher reads outbox — avoids **dual write** races.

## Behind the scenes
**Idempotency keys** map duplicates to the **same** effect. **Distributed transactions** (2PC) are rare; **sagas** + **compensation** are more common for cross-service consistency.

## What you’d do in production
Require **event id** in schema, enforce **DB uniqueness**, add **metrics** for duplicate detection hits, test **replay** scenarios in CI.

## Interview tip
State clearly: **“At-least-once consumer + idempotent sink”** is the industry workhorse.`,
        followUps: [
          fu('Kafka transaction + read_committed?', 'Consumer can read only **committed** producer transactions — reduces some anomalies; still need **idempotent** business logic at boundaries.'),
          fu('Inbox pattern?', 'Track **processed** events per consumer — complements outbox on the **publish** side.'),
        ],
      },
      {
        id: 'th-kafka-outbox-dlq',
        question:
          'A team “dual writes”: REST handler saves to Postgres and publishes to Kafka. Under failure, events are missing or DB rows exist without messages. What pattern fixes this? What about poison messages?',
        signals: ['outbox', 'dual write', 'DLQ', 'retry topic'],
        answer: `## What’s going wrong
**Split-brain** between **database** and **bus**: one succeeds, the other fails — reconciling later is painful and **not** visible in happy-path tests.

## Why this happens
**No single atomic transaction** spans Postgres and Kafka. Retries duplicate publishes; crashes between steps leave **inconsistent** state. **Poison messages** fail processing forever and **block** partition progress if you do not **quarantine** them.

## What to check (and why)
1. **Outbox table** + **relay** (Debezium CDC or polling publisher) — **same DB transaction** as business write.
2. **Ordering** needs — partition key choice affects **per-entity** ordering.
3. **Error taxonomy** — **transient** (retry with backoff) vs **permanent** (DLQ / skip with audit).

## Behind the scenes
**Transactional outbox** turns “two systems” into “one commit + async relay.” **DLQ** preserves **observability** and **manual** replay while **unblocking** the main consumer.

## What you’d do in production
Implement **outbox** or **change data capture**, standard **retry/DLQ** topology, **alert** on DLQ depth, run **reconciliation** jobs for legacy gaps.

## Interview tip
Contrast **dual write** (bad) vs **outbox/CDC** (good) in one sentence — interviewers listen for that.`,
        followUps: [
          fu('Debezium vs polling outbox?', '**CDC** captures log changes with low app code; **polling outbox** is simple and explicit — choose by **ops maturity** and **schema control**.'),
          fu('Ordering across topics?', 'Generally **not** guaranteed — design aggregates or **single** partition per correlation id when order matters.'),
        ],
      },
    ],
  },
  {
    id: 'senior-observability-jfr',
    title: 'Senior Java: Observability, JFR, and tracing',
    subtitle: 'Flight Recorder, correlation, sampling, and metrics that explain latency.',
    tags: ['JFR', 'observability', 'OpenTelemetry', 'Java', 'senior'],
    scenarios: [
      {
        id: 'th-jfr-profile',
        question:
          'Production has intermittent latency spikes. You cannot reproduce locally. How do JDK Flight Recorder (JFR) and continuous profiling help?',
        signals: ['JFR', 'allocation', 'lock profiling', 'wall clock vs CPU'],
        answer: `## What’s going wrong
**Tail latency** hurts users but **logs** only show slow requests sometimes; **CPU** metrics look fine because threads **wait** on I/O or locks.

## Why this happens
**Sampling** blind spots, **missing** spans, and **aggregate** metrics hide **few** terrible requests. **Allocation pressure** and **lock contention** often drive p99 without maxing CPU averages.

## What to check (and why)
1. **JFR** events: **JDK CPU Load**, **Thread Park**, **Monitor Blocked**, **Object Allocation in New TLAB** — tie spikes to **code**.
2. **Wall-clock** profiler (async-profiler **wall**) vs **CPU** — waiting vs burning.
3. **One** exemplar trace with **full** span timings — confirms **which** dependency.

## Behind the scenes
**JFR** records **low-overhead** JVM and OS events into buffers; can run **continuously** with sensible disk/CPU budget. **JMC** helps interpret **hot methods**, **allocations**, and **GC** correlation.

## What you’d do in production
Enable **safe** continuous profiling in **canary**, capture **JFR** during incident window, compare **deployment** diffs, add **allocation** hotspots to backlog fixes.

## Interview tip
Say **“p99 needs wall time + allocation + locks — not only CPU charts.”**`,
        followUps: [
          fu('JFR in containers?', 'Ensure **tmp** space, **uid** permissions, and **CPU** headroom; **JDK** tools in **debug** image or **sidecar** pattern.'),
          fu('pprof vs JFR?', '**pprof** (Go) analogy: both are **evidence-first** — Java teams standardize on **JFR** + **async-profiler**.'),
        ],
      },
      {
        id: 'th-otel-correlation',
        question:
          'Distributed traces break when work jumps to @Async threads or Kafka consumers. What do you need for end-to-end correlation?',
        signals: ['trace context', 'W3C TraceContext', 'propagation', 'baggage'],
        answer: `## What’s going wrong
**Spans** start **new** traces in worker threads or message handlers — dashboards show **orphan** spans; you cannot connect **HTTP** to **async** work.

## Why this happens
**TraceContext** is **thread-local** by default; **executor** threads do not inherit it unless you **wrap** executors or use **context-aware** APIs. **Kafka headers** must **carry** traceparent; consumers must **extract** and **continue** the span.

## What to check (and why)
1. **OpenTelemetry** instrumentation for **Spring** executors, **Kafka** clients, **JDBC** (where supported).
2. **Manual** propagation for custom thread pools — **TaskDecorator** / **ContextSnapshot** patterns.
3. **Logs** — inject **trace_id** / **span_id** via **MDC** from OTel **log bridge**.

## Behind the scenes
**W3C traceparent** header standardizes **128-bit** trace id + parent span id; **baggage** carries **business** correlation (careful with **PII** and **size**).

## What you’d do in production
Standard **propagators**, **tests** that assert **same trace** across HTTP → async → message, **sample** head-based vs tail-based for cost.

## Interview tip
Mention **propagation is not automatic** across thread boundaries — senior Java reality.`,
        followUps: [
          fu('Head-based vs tail-based sampling?', '**Head** decides at start (cheap, can miss rare failures); **tail** keeps interesting traces (higher storage/compute) — useful for **error** capture.'),
          fu('Metrics vs traces?', '**Metrics** compress time series; **traces** explain **one** request path — both needed.'),
        ],
      },
      {
        id: 'th-obs-sampling-blind',
        question:
          'You sample traces at 1% to save cost. Incidents show “no trace” for failing requests. How do you balance cost and debuggability?',
        signals: ['tail sampling', 'error sampling', 'exemplars', 'logs'],
        answer: `## What’s going wrong
On-call **cannot** find a trace for the **exact** failing user journey — only **aggregates** and **guessing**.

## Why this happens
**Uniform random** sampling drops **rare** errors almost always. **Cost** pressure pushes sampling **too low** for tail problems.

## What to check (and why)
1. **Always sample** errors / high latency thresholds (**tail** or **adaptive** policies).
2. **Exemplars** on histograms linking **metric** points to **trace** ids.
3. **Structured logs** with **trace_id** even when trace backend missed span.

## Behind the scenes
**Probabilistic** sampling is statistically valid for **volume** SLOs but bad for **incident** forensics without **biased** sampling rules.

## What you’d do in production
Define **sampling policy** per route (critical checkout higher), **dynamic** sampling from collector, **retention** tiers, **runbooks** that use **logs + metrics** when traces absent.

## Interview tip
Interviewers want **policy**, not “sample more” — tie rules to **error rate** and **criticality**.`,
        followUps: [
          fu('RED metrics?', '**Rate, Errors, Duration** per service — quick health picture; extend with **saturation** (USE) for resources.'),
          fu('Cardinality explosion?', 'High-cardinality labels (user id) in **metrics** blow TSDB — keep labels **bounded**; use **traces/logs** for detail.'),
        ],
      },
      {
        id: 'th-structured-logging-cost',
        question:
          'JSON logs volume doubles cloud spend. Teams still cannot grep effectively. What do you change in a Java/Spring service?',
        signals: ['log level', 'PII', 'sampling', 'correlation', 'dynamic levels'],
        answer: `## What’s going wrong
**Expensive** log ingestion and **noise** — on-call reads **thousands** of duplicate lines without **actionable** fields.

## Why this happens
**DEBUG** in prod, **unbounded** stack traces, **per-row** logs in hot loops, missing **request** context, **no** standard **schema**.

## What to check (and why)
1. **Default INFO**, **feature** toggles for temporary DEBUG, **rate-limited** loggers for noisy paths.
2. **Structured** fields: **service**, **version**, **trace_id**, **user_hash** (not raw PII), **error.code**.
3. **Sampling** for **high-QPS** info logs; **metrics** for counts instead of **printf** every request.

## Behind the scenes
Log pipelines charge per **GB**; **JSON** parsing needs **stable** keys. **Logback** / **Log4j2** **filters** and **MDC** integrate with **OTel**.

## What you’d do in production
**Log budget** per service, **lint** for **forbidden** patterns, **dashboards** from **metrics** first, **PII** scrubbing at **edge**.

## Interview tip
**“Logs are for why; metrics are for how much”** — senior framing.`,
        followUps: [
          fu('Exception logging best practice?', 'Log **once** at boundary with **stack**; inner layers log **message + code** to avoid **duplicate** stacks.'),
          fu('Spring Boot Actuator loggers endpoint?', 'Change levels **live** for targeted debugging — guard with **auth** and **audit**.'),
        ],
      },
    ],
  },
  {
    id: 'senior-resilience-patterns',
    title: 'Senior Java: Resilience patterns',
    subtitle: 'Circuit breakers, bulkheads, timeouts, retries, and avoiding cascades.',
    tags: ['resilience', 'Resilience4j', 'microservices', 'Java', 'senior'],
    scenarios: [
      {
        id: 'th-cb-half-open',
        question:
          'After a downstream outage, your circuit breaker flaps open/half-open/closed and errors persist. What causes flapping and how do you tune it?',
        signals: ['half-open', 'slow call', 'failure rate', 'minimum calls', 'sliding window'],
        answer: `## What’s going wrong
The breaker **never stabilizes**: brief successes **close** the circuit, then **failures** immediately **trip** it again — users see **unpredictable** errors.

## Why this happens
**Downstream** is **degraded** (timeouts just under threshold) not fully **down**. **Half-open** probe calls are **too few** or **unrepresentative**. **Sliding window** counts **noise** as recovery. **Retry storms** from many instances **keep** downstream sick.

## What to check (and why)
1. **Latency distribution** of downstream — **partial** outage vs **hard** failure.
2. **Breaker config**: **wait duration in open**, **permitted calls in half-open**, **minimum number of calls**, **failure rate threshold**.
3. **Concurrency** — many pods **half-open** at once = **thundering herd**.

## Behind the scenes
**Circuit breaker** is a **state machine** (closed → open → half-open). **Resilience4j** / **Spring Cloud Circuit Breaker** map to **Resilience4j** / **Micrometer** metrics for **state** and **calls**.

## What you’d do in production
Increase **open** wait based on **MTTR**, **limit** half-open probes, add **jittered** retries **only** on **idempotent** paths, **bulkhead** concurrent calls, fix **root** downstream capacity.

## Interview tip
Explain **half-open** as **controlled experiment** — if experiments are too aggressive, you **flap**.`,
        followUps: [
          fu('Breaker vs timeout?', '**Timeout** bounds **one** wait; **breaker** stops **calling** a sick dependency to **protect** the system — complementary.'),
          fu('Count-based vs time-based window?', '**Time** windows track **recent** behavior under changing load; **count** windows need **enough** volume to be meaningful.'),
        ],
      },
      {
        id: 'th-bulkhead-pools',
        question:
          'One client feature calls a slow external API on the same thread pool as core checkout. Under load, checkout fails. What pattern fixes this?',
        signals: ['bulkhead', 'thread pool isolation', 'semaphore', 'cascading failure'],
        answer: `## What’s going wrong
**Shared** pool **exhaustion**: all threads **blocked** on the slow **optional** dependency; **critical** paths **starve**.

## Why this happens
**Coupling** through **one** executor or **HTTP client** pool. **Little’s law**: if slow calls occupy all slots, **arrival** of checkout requests **queues** until timeouts.

## What to check (and why)
1. **Active threads** / **queue depth** per pool.
2. **Downstream** latency by **integration** — identify **noisy neighbor** client.
3. **Defaults** — **ForkJoinPool.common** or **single** RestTemplate bean shared everywhere.

## Behind the scenes
**Bulkhead** limits **parallel** calls per **dependency** or **use case** (thread pool or **semaphore**). **Fails fast** when bulkhead full instead of **blocking** everyone.

## What you’d do in production
**Dedicated** pools / clients per domain, **timeouts**, **queue caps** with **clear** rejection policy, **tests** under **mixed** load scenarios.

## Interview tip
**“Bulkhead is scheduling isolation”** — instant senior sound bite.`,
        followUps: [
          fu('Semaphore vs thread bulkhead?', '**Semaphore** limits concurrency cheaply; **thread** isolation adds **OS thread** cost but **stronger** isolation for blocking code.'),
          fu('Reactive bulkhead?', '**Operator** limits concurrency on **event loop** — still need **timeouts** and **backpressure** discipline.'),
        ],
      },
      {
        id: 'th-retry-jitter',
        question:
          'After a short DB blip, all service instances retry at the same intervals and the database never recovers. What went wrong and how do you retry safely?',
        signals: ['retry storm', 'exponential backoff', 'jitter', 'idempotency'],
        answer: `## What’s going wrong
**Retry storm** / **metastable failure**: synchronized retries **overload** the recovering DB — **amplifies** the outage.

## Why this happens
**Fixed** backoff aligns **phases** across thousands of clients (**thundering herd**). **No cap** on retries creates **infinite** load. **Non-idempotent** retries **corrupt** data.

## What to check (and why)
1. **Retry** only on **transient** errors (connection reset), not **4xx** business errors.
2. **Exponential backoff + full jitter** — spreads retry times.
3. **Max attempts** and **circuit breaker** upstream of DB.
4. **Idempotency** keys for writes.

## Behind the scenes
**Client-side** retries multiply by **instance count** × **QPS**. **Server-side** rate limits and **queueing** need **cooperation** from clients.

## What you’d do in production
Use **Resilience4j Retry** / **Spring Retry** with **jitter**, **hedging** only where safe, **chaos** tests for **brownouts**, coordinate with **DBA** on **connection pool** sizes.

## Interview tip
Always mention **jitter + max attempts + idempotency** together — interview trinity.`,
        followUps: [
          fu('Hedged requests?', 'Send **second** request if first slow — can **double** load; use **only** for **safe** read paths with **strict** caps.'),
          fu('Kafka consumer retries?', 'Different trade-off — **pause** partitions, **retry topic**, **DLQ** — avoid **infinite** loop on poison message.'),
        ],
      },
      {
        id: 'th-rate-limit-cascade',
        question:
          'A partner API rate-limits you; your service queues requests until memory grows and JVM GC pauses spike. How do you design client-side resilience?',
        signals: ['rate limiter', '429', 'backpressure', 'queue bounds', 'bulkhead'],
        answer: `## What’s going wrong
**Unbounded** queues buffer **429** / slow responses until **memory** and **latency** explode — **cascading** failure **back** to your users.

## Why this happens
**Async** fire-and-forget without **capacity** limits; **default** HTTP client queues; **no** **token bucket** / **leaky bucket** on **outbound** calls.

## What to check (and why)
1. **429** response headers (**Retry-After**) — honor server intent.
2. **Client** max concurrent requests + **bounded** queue + **drop** or **fail fast** policy.
3. **Bulkhead** for that partner; **cache** read-mostly data.

## Behind the scenes
**Backpressure** means **slowing producers** when consumers saturated — in HTTP microservices, implement via **reactive** streams, **semaphore**, or **shed load** at **edge**.

## What you’d do in production
**Rate limit** outbound calls per **key**, **cache** with **TTL**, **degrade** features, **alert** on **saturation**, **contract** SLAs with partner.

## Interview tip
Connect **429** to **queue bounds** — senior client design.`,
        followUps: [
          fu('Adaptive concurrency?', 'Algorithms like **CoDel** / **AIMD** adjust **parallelism** based on **latency** — advanced but shows depth.'),
          fu('Gateway vs library rate limit?', '**Edge** gateway protects **cluster**; **library** limit protects **each** instance — often **both**.'),
        ],
      },
    ],
  },
  {
    id: 'senior-monitoring-slos',
    title: 'Senior Java: Monitoring, SLOs, and alerting',
    subtitle: 'Golden signals, error budgets, and alerts that wake people for the right reasons.',
    tags: ['SRE', 'SLO', 'monitoring', 'Prometheus', 'senior'],
    scenarios: [
      {
        id: 'th-sli-slo-budget',
        question:
          'The team debates “99.9% availability.” What is an SLI, an SLO, and how does an error budget change how you ship?',
        signals: ['SLI', 'SLO', 'error budget', 'multi-window'],
        answer: `## What’s going wrong
**Vague** reliability goals → **misaligned** priorities: product wants **features**, ops wants **stability**, no shared **math**.

## Why this happens
**Availability** without a **measurable** definition is meaningless. **SLO** needs **SLI** (what you measure), **target**, and **window**. **Error budget** is **allowed** bad events — when **exhausted**, **freeze** risky releases.

## What to check (and why)
1. **SLI** — good events / valid events (e.g. successful **HTTP** < 500 under **latency** threshold).
2. **SLO** — target **99.9%** over **30d** rolling window (example).
3. **Budget burn** alerts — **fast burn** vs **slow burn** (multi-window).

## Behind the scenes
**Google SRE** framework: **error budget** connects **reliability** to **product velocity**. **Multi-window** alerting reduces **noise** vs single spike.

## What you’d do in production
Write **SLO** docs per **user journey**, implement **SLI** in **metrics**, wire **alerts** to **budget**, use **canary** + **feature flags** when budget low.

## Interview tip
Recite: **SLI = measure, SLO = target + window, error budget = 1 − SLO** over traffic.`,
        followUps: [
          fu('Availability vs latency SLO?', 'Often **composite**: **good** request = success **and** p95 < **X** ms — define **valid** requests clearly.'),
          fu('Internal vs external SLO?', '**User-facing** SLO drives **priorities**; **internal** SLOs (DB) are **dependencies**.'),
        ],
      },
      {
        id: 'th-golden-signals',
        question:
          'For a Spring Boot HTTP service behind Kubernetes, which signals do you put on every dashboard and why?',
        signals: ['RED', 'USE', 'saturation', 'golden signals'],
        answer: `## What’s going wrong
On-call opens **dozens** of charts during an incident; **no standard** layout means **slow** diagnosis.

## Why this happens
**Organic** growth of dashboards without **framework**; **metrics** duplicated or **missing** saturation.

## What to check (and why)
1. **Rate** — RPS per route/instance (traffic shift).
2. **Errors** — 5xx rate, **Java** uncaught exceptions, **downstream** timeouts.
3. **Duration** — p50/p95/p99 **latency** per **endpoint**.
4. **Saturation** — **thread pools**, **DB pool** wait, **CPU throttle**, **GC** time, **queue depth**.

## Behind the scenes
**USE** (Utilization, Saturation, Errors) for **resources**; **RED** for **services**. **Kubernetes** adds **pod restart**, **OOMKilled**, **scheduling** delays.

## What you’d do in production
**Templated** Grafana/Cloud dashboards per **service**, **SLO** panels, **exemplars** to traces, **runbook** links on **alerts**.

## Interview tip
**“Start with RED + saturation; drill down with traces.”**`,
        followUps: [
          fu('Why p99 not only average?', '**Average** hides **tail** where users actually hurt; **SLOs** usually use **percentiles**.'),
          fu('Business metrics on same board?', '**Yes** for **correlation** (orders/min vs errors) — separate **noise** from **technical** panels if needed.'),
        ],
      },
      {
        id: 'th-alert-fatigue',
        question:
          'PagerDuty fires every night for “CPU > 80%” but incidents are rarely CPU. How do you redesign alerting?',
        signals: ['symptom vs cause', 'SLO-based', 'multi-burn', 'severity'],
        answer: `## What’s going wrong
**Alert fatigue** → real incidents **missed**; engineers **mute** channels and **ignore** pages.

## Why this happens
**Threshold** alerts on **symptoms** without **customer impact** correlation. **No** **severity** routing; **flapping** thresholds without **hysteresis** or **windows**.

## What to check (and why)
1. **Page** on **SLO burn** or **user-visible** failure rate, not raw **CPU** alone.
2. **Multi-window** / **multi-burn** rates — sustained problems only.
3. **Ticket** vs **page** — **CPU** might be **ticket** for next-day tuning.

## Behind the scenes
**Cause-based** alerts (disk full) are okay when **actionable**; **symptom-based** pages need **strong** link to **outage**.

## What you’d do in production
**Alert design review**, **runbooks**, **SLO** alerts, **aggregate** related checks, **e2e** **blackbox** probes for **critical** journeys.

## Interview tip
**“If the alert has no runbook action, don’t page.”**`,
        followUps: [
          fu('Synthetic monitoring?', '**Probes** catch **DNS**, **routing**, **auth** issues **before** users — complement **real user** metrics.'),
          fu('Alert on queue depth?', '**Yes** if it predicts **SLO** miss — tie to **latency** SLO, not **magic** number.'),
        ],
      },
      {
        id: 'th-canary-metrics',
        question:
          'You ship a canary deployment with 5% traffic. What metrics prove safe promotion vs rollback?',
        signals: ['canary', 'golden signals', 'comparison', 'segmentation'],
        answer: `## What’s going wrong
**Canary** promoted on **gut** or **only** “no crashes” — regression **hits** 100% later.

## Why this happens
**Low** traffic share hides **rare** errors; **no** **statistical** comparison between **cohorts**; **metrics** not **segmented** by **version**.

## What to check (and why)
1. **Error rate** and **latency** percentiles **by** **version** label (pod label / service mesh).
2. **Business** KPIs (conversion, payment failures) if applicable.
3. **Saturation** differences — **memory** leak shows in **canary** first.
4. **Trace** samples comparing **hot paths**.

## Behind the scenes
**Progressive delivery** assumes **representative** traffic — **geography** / **tenant** skew can fool **canaries**.

## What you’d do in production
**Automate** promotion rules, **minimum** request counts, **rollback** on **SLO** regression, **feature flag** as **faster** rollback than redeploy.

## Interview tip
Mention **version-tagged metrics** — without tags, canary analysis is **impossible**.`,
        followUps: [
          fu('Blue-green vs canary?', '**Blue-green** switches **all** at once (fast rollback if kept); **canary** shifts **gradually** — different **risk** profile.'),
          fu('Argo Rollouts / Flagger?', 'GitOps **controllers** automate **analysis** templates — good keyword for K8s interviews.'),
        ],
      },
    ],
  },
  {
    id: 'senior-production-incidents',
    title: 'Senior Java: Production incidents and response',
    subtitle: 'Containment, rollback decisions, and learning without blame.',
    tags: ['incident', 'production', 'postmortem', 'senior'],
    scenarios: [
      {
        id: 'th-incident-blast',
        question:
          'A bad deploy causes payment failures. What is your first-hour playbook: stabilize, communicate, and limit blast radius?',
        signals: ['blast radius', 'kill switch', 'rollback', 'comms', 'severity'],
        answer: `## What’s going wrong
**User-visible** financial impact — **money** and **trust** at risk; **panic** changes can **widen** damage.

## Why this happens
Incidents **cascade** when **no** clear **commander**, **unbounded** retries **hammer** partners, or **partial** fixes **split** traffic inconsistently.

## What to check (and why)
1. **Severity** and **incident commander** — single **decision** funnel.
2. **Stop bleeding**: **rollback**, **feature flag off**, **disable** non-critical features (**degradation**).
3. **Blast radius** — **which** regions, **tenants**, **percent** of traffic affected.
4. **Comms** — status page, support scripts, **internal** **Slack** **timeline**.

## Behind the scenes
**MTTD/MTTR** improve with **runbooks** and **safe** **rollback** automation. **Idempotent** payments and **reconciliation** jobs reduce **panic** fixes.

## What you’d do in production
**Pre-auth** **rollback** paths, **synthetic** checks on **payment** flows, **circuit** open on **partner** errors, **audit** **who** changed **what**.

## Interview tip
Order: **customer impact → stabilize → communicate → investigate** — not **debug first**.`,
        followUps: [
          fu('When forward-fix instead of rollback?', 'If rollback **data-migrates** wrong direction or **bug** is **tiny** and **hotfix** faster **and** **low risk** — still need **explicit** decision.'),
          fu('Chaos engineering tie-in?', '**Game days** validate **runbooks** and **observability** before real incidents.'),
        ],
      },
      {
        id: 'th-rollback-forward',
        question:
          'Rollback is slow (migrations ran forward-only). Forward fix might take hours. How do you decide under pressure?',
        signals: ['migration', 'compat', 'feature flag', 'data repair'],
        answer: `## What’s going wrong
**No fast rollback** — schema or **data** changes are **irreversible** without **planning**.

## Why this happens
**Forward-only** migrations without **expand/contract** pattern; **tight** coupling between **code** and **schema** versions; **missing** **compat** layers.

## What to check (and why)
1. **Expand/contract** — can old code run on **new** schema (nullable columns, dual writes)?
2. **Impact** — partial **feature disable** vs **full** revert.
3. **Data repair** scripts — **idempotent**, **backup**, **verified** on **staging**.

## Behind the scenes
**Blue-green DB** is rare; **most** teams use **backward-compatible** deploy steps and **feature flags** to **gate** new paths.

## What you’d do in production
Invest in **reversible** migration **habits**, **flags** per **risky** change, **practice** rollbacks quarterly, **monitor** **migration** **duration**.

## Interview tip
Senior teams prefer **expand/contract** + **flags** over **heroic** Friday migrations.`,
        followUps: [
          fu('Backward-compatible API?', 'Additive changes default; **deprecate** with **version** headers; never **break** clients in **single** deploy.'),
          fu('Liquibase/Flyway in K8s?', '**Job** hooks or **init** containers — ensure **one** leader migration; **lock** timeouts considered.'),
        ],
      },
      {
        id: 'th-postmortem',
        question:
          'After a major outage, leadership wants a postmortem. What makes it useful versus a blame session?',
        signals: ['blameless', 'timeline', 'action items', 'root causes'],
        answer: `## What’s going wrong
**Postmortems** become **political** or **generic** (“human error”) — **no** systemic improvement.

## Why this happens
**Fear** culture, missing **objective** **timeline**, **no** **owner** for **follow-ups**, confusing **root cause** (singular myth) with **contributing factors**.

## What to check (and why)
1. **Blameless** facilitation — focus on **systems** and **process**.
2. **Precise timeline** from **metrics**, **logs**, **deploys**, **changes**.
3. **Five whys** or **fishbone** without **stopping** at a person.
4. **Action items** with **owners** and **deadlines** — **track** to completion.

## Behind the scenes
**Learning organization** ties incidents to **SLO** reviews and **architecture** **debt** paydown.

## What you’d do in production
**Template** postmortem doc, **share** widely, **review** **action** **completion** in **quarterly** reliability meetings.

## Interview tip
Say **“contributing factors”** and **“controls we add”** instead of **one** **root** **cause**.`,
        followUps: [
          fu('SEV levels?', 'Consistent **severity** definitions tie **response** time and **comms** expectations — avoid **SEV inflation**.'),
          fu('Incident automation?', '**Status** updates from **chatops**, **runbook** links — reduce **toil** during stress.'),
        ],
      },
      {
        id: 'th-data-repair',
        question:
          'A bug duplicated ledger entries for 30 minutes. How do you approach data repair vs compensating transactions?',
        signals: ['reconciliation', 'idempotency', 'audit trail', 'human approval'],
        answer: `## What’s going wrong
**Financial** or **inventory** data **wrong** — simple **DELETE** may **violate** **audit** or **downstream** **reports**.

## Why this happens
**At-least-once** processing, **missing** **idempotency**, **race** in **dual write**, **manual** SQL under pressure.

## What to check (and why)
1. **Scope** — time window, **accounts** affected, **idempotent** keys available.
2. **Source of truth** — **bank** **statement**, **partner** **API**, **immutable** **event** log.
3. **Repair strategy** — **reverse** journal entries vs **mark** **void** vs **rebuild** from **events**.
4. **Approvals** — **finance** sign-off for **money** movement.

## Behind the scenes
**Compensating transaction** in **saga** pattern models **business** **reversal**; **technical** **delete** may not match **legal** **audit**.

## What you’d do in production
**Freeze** further damage, **snapshot** **DB**, **script** **idempotent** **repair**, **verify** on **copy**, **dry-run**, **canary** **repair**, **monitor** **after**.

## Interview tip
Emphasize **auditability** and **domain expert** review — senior **data** incidents are **process**, not only SQL.`,
        followUps: [
          fu('Event sourcing advantage?', '**Replay** / **rebuild** **read** models if **events** are **immutable** **truth** — costly but powerful.'),
          fu('Soft delete vs hard delete?', '**Soft** preserves **history** for **investigation**; **retention** policies manage **PII**.'),
        ],
      },
    ],
  },
  {
    id: 'senior-kubernetes-java',
    title: 'Senior Java: Kubernetes and the JVM',
    subtitle: 'Probes, memory, CPU, signals, and graceful shutdown for Java services.',
    tags: ['Kubernetes', 'JVM', 'containers', 'Java', 'senior'],
    scenarios: [
      {
        id: 'th-k8s-probes-warmup',
        question:
          'Pods restart in a loop during deploy: liveness fails while the JVM warms up. How do you fix probe design for Java/Spring Boot?',
        signals: ['liveness', 'readiness', 'startup probe', 'warmup'],
        answer: `## What’s going wrong
**Kubernetes kills** containers that fail **liveness** — during **legitimate** **warmup** (class loading, JIT, **Spring** context), the app is **not dead**, just **not ready**.

## Why this happens
**Liveness** hits **/actuator/health** too early or uses the **same** checks as **readiness** with **strict** timeouts. **Startup** probe missing for **slow** **starting** JVM apps.

## What to check (and why)
1. **Separate** **liveness** (deadlock/jvm frozen) vs **readiness** (can serve traffic: DB up, pool warm enough).
2. **startupProbe** with **generous** **failureThreshold** covering **warmup**.
3. **Readiness** excludes **optional** dependencies if you accept **degraded** mode.

## Behind the scenes
**Kubelet** restarts container on **liveness** failure; **removes** pod from **Service** endpoints on **readiness** failure — different **blast** **radius**.

## What you’d do in production
**startupProbe** + tuned **period**, **readiness** checks **critical** **deps** only, **liveness** **minimal** **HTTP** or **TCP**, **document** **SLO** for **cold** **start**.

## Interview tip
**Classic mistake: liveness = full stack health** — call that **readiness**, not **liveness**.`,
        followUps: [
          fu('preStop hook?', '**Sleep** allows **in-flight** requests to **drain** after **Endpoint** removal — pairs with **graceful** **shutdown**.'),
          fu('Actuator groups?', 'Spring Boot 2.2+ **health** **groups** map to **liveness**/**readiness** **probes** explicitly.'),
        ],
      },
      {
        id: 'th-k8s-oomkilled-heap',
        question:
          'The pod shows OOMKilled but you do not see Java OutOfMemoryError in logs. How do you reconcile cgroup limits with JVM heap settings?',
        signals: ['cgroup', 'OOMKilled', '-Xmx', 'Container Support', 'RSS'],
        answer: `## What’s going wrong
**Linux** **OOM killer** stops the container when **RSS** exceeds **memory limit** — can happen **without** a **Java** heap OOM if **native**, **thread stacks**, **metaspace**, **direct buffers**, or **heap** + **overhead** exceed the **limit**.

## Why this happens
**-Xmx** sized to **pod limit** ignores **non-heap** memory. **Older** JVMs lacked **container awareness** and **over-allocated** heap vs **cgroup**. **Huge** thread counts multiply **stack** space.

## What to check (and why)
1. **kubectl describe pod** → **OOMKilled** vs **Exit 137** patterns.
2. **JVM flags**: **MaxRAMPercentage** / **InitialRAMPercentage** (JDK 8u191+ / 11+).
3. **Native memory tracking** if heap looks **fine** in metrics.
4. **Requests vs limits** — **throttling** and **scheduling** behavior.

## Behind the scenes
**Cgroup v2** and **JDK** **ergonomics** read **container** limits for **default** heap sizing — still need **explicit** headroom for **metaspace** and **direct** memory.

## What you’d do in production
Set **heap** to **~70–75%** of **limit** rule-of-thumb (tune), **cap** **threads**, monitor **process** **RSS**, align **JVM** and **K8s** **memory** in **IaC** review.

## Interview tip
**“OOMKilled is OS-level; heap OOM is JVM-level — different diagnostics.”**`,
        followUps: [
          fu('Use limits = requests?', '**Guaranteed** QoS reduces **eviction** risk but **costs** flexibility — **burstable** common for **Java** **workloads** with **care**.'),
          fu('G1HeapRegionSize?', 'Usually **default** — tune only when **humongous** **objects** or **specialists** recommend.'),
        ],
      },
      {
        id: 'th-k8s-cpu-throttle-gc',
        question:
          'Java latency degrades in Kubernetes but CPU usage in metrics looks low. What container CPU interaction should you suspect?',
        signals: ['throttling', 'CFS quota', 'GC pauses', 'requests'],
        answer: `## What’s going wrong
**p99** latency **bad** while **average** CPU **low** — classic **CPU throttling**: the process **needs** **burst** CPU but **CFS quota** **caps** **short** windows, causing **long** stalls.

## Why this happens
**CPU request** sets **share**; **limit** enforces **quota**. **JVM** **GC** and **JIT** are **bursty**; **throttling** stretches **pause**-like effects. **Metrics** that average over **minutes** hide **100ms** **stalls**.

## What to check (and why)
1. **container_cpu_cfs_throttled_seconds** (Prometheus/cAdvisor style) — proves throttling.
2. **p99** **latency** vs **deploy** when **limits** introduced.
3. **JDK** **threads** vs **cores** seen by JVM (**active_processor_count**).

## Behind the scenes
**CFS** **bandwidth** control gives **quota** per **period**; **Java** benefits from **consistent** **CPU** during **GC** unless using **very low-pause** collectors with trade-offs.

## What you’d do in production
Right-size **CPU requests** closer to **steady** need, **avoid** **too-tight** **limits** for **latency** **SLOs**, **separate** **batch** from **online**, validate with **load** **test** in **cluster**.

## Interview tip
Mention **throttling metrics** by name — separates **Kubernetes** **literacy** from **generic** tuning advice.`,
        followUps: [
          fu('Vertical Pod Autoscaler?', '**VPA** suggests **CPU/memory** — can **disrupt** pods; use **carefully** with **Java** **warmup**.'),
          fu('node CPU manager static?', '**Pinned** CPUs for **latency** — advanced **kube** tuning.'),
        ],
      },
      {
        id: 'th-k8s-graceful-shutdown',
        question:
          'During rollouts, clients see connection resets. How do you implement graceful shutdown for Spring Boot on Kubernetes?',
        signals: ['SIGTERM', 'preStop', 'drain', 'connection pool', 'queue'],
        answer: `## What’s going wrong
**Rolling update** sends **SIGTERM**; the JVM **exits** while **HTTP** connections and **Kafka consumers** still **process** — **RST** packets and **duplicate** / **lost** work.

## Why this happens
**Default** **gracePeriod** too **short** for **drain**. **No** **preStop** **sleep** → **kube-proxy** still routes briefly while app **dying**. **Spring** **lifecycle** **hooks** not configured; **embedded** server **accept** stops **immediately**.

## What to check (and why)
1. **terminationGracePeriodSeconds** vs **max** request time + **drain** buffer.
2. **preStop** **hook** **sleep** to **wait** for **Endpoint** **propagation**.
3. **server.shutdown=graceful** (Spring Boot 2.3+) and **timeout**.
4. **Consumer** **cooperative** **rebalance** — **pause** and **finish** **in-flight**.

## Behind the scenes
**Endpoint** removal is **async** across **nodes**; **preStop** **coordination** is a **common** **pattern** to **absorb** **propagation** **delay**.

## What you’d do in production
Configure **graceful** **shutdown**, **readiness** **fail** on **SIGTERM** to **remove** from **LB** early, tune **Kafka** **session** timeouts with **shutdown** **budget**, **test** **rollouts** under **load**.

## Interview tip
Name **SIGTERM → graceful period → SIGKILL** sequence — shows you know **kube** **pod** **lifecycle**.`,
        followUps: [
          fu('Sidecar shutdown order?', '**Init** containers run **before**; **sidecar** **termination** can **race** **app** — use **K8s** **sidecar** **feature** (1.28+) or **process** **supervisor** patterns where needed.'),
          fu('Istio / mesh draining?', '**Connection** **draining** at **proxy** layer adds **another** **timer** — align **timeouts**.'),
        ],
      },
    ],
  },
  {
    id: 'jvm-oom-heap-gc-profiling',
    title: 'JVM OOM, heap, GC, profiling & containers',
    subtitle:
      'Classify failures, prove leaks with dumps and GC logs, off-heap and cgroup behavior, and Kubernetes dump paths — interview depth.',
    tags: ['JVM', 'OOM', 'GC', 'heap dump', 'Kubernetes', 'profiling', 'MAT'],
    scenarios: [
      {
        id: 'jvm-oom-classify',
        question:
          'Production shows restarts and “memory” errors, but logs are noisy. How do you tell Java heap OOM, Metaspace, direct memory, native threads, and Linux OOMKilled apart?',
        signals: ['OOM message', 'exit 137', 'Metaspace', 'direct buffer', 'native thread', 'OOMKilled'],
        answer: `## What’s going wrong
Different failures all look like “**out of memory**” in dashboards: **Java** may throw **OutOfMemoryError** with a **specific** message, or the **process** may vanish with **exit 137** after the **kernel** kills the cgroup — **no** Java stack.

## Why this happens
Each **memory kind** has a different **allocator**: **Java heap** (GC-managed), **Metaspace** (class metadata), **direct** **ByteBuffers** (native, outside heap), **thread stacks** + **malloc** (native), **cgroup** **limit** on **RSS** (all of the above).

## What to check (and why)
1. **Java log line** — **Java heap space** vs **Metaspace** vs **Direct buffer memory** vs **unable to create new native thread** — tells you **which knob** to tune.
2. **kubectl describe pod** — **Last State: Terminated**, **Reason: OOMKilled**, **Exit Code: 137** — **OS** killed container; compare **Limit** to **RSS**-style metrics.
3. **JVM flags** — **-XX:MaxMetaspaceSize**, **-XX:MaxDirectMemorySize**, **-Xss**, **-Xmx** — map to the failure mode you saw.
4. **NMT** — **-XX:NativeMemoryTracking=summary** + **jcmd PID VM.native_memory summary** — when **heap** metrics look fine but **RSS** explodes.

## Behind the scenes
**OOMKilled** means **cgroup** memory.max (or limit) was exceeded — can happen **without** heap OOM if **native** + **heap** + **page cache** pressure align badly. **Direct** memory is **not** in **heap** charts but counts toward **process** memory.

## What you’d do in production
Classify first, then **enable** the right **logging** and **dumps** for the **next** occurrence; fix **mis-sizing** (heap vs limit) before chasing **code** on the wrong layer.

## Interview tip
Say **“137 vs Java OOM”** — interviewers listen for **OS vs JVM** separation.

## Deep dive: step-by-step with expected output

### 1) Kubernetes: is it cgroup OOM or Java OOM?
**Run:** **kubectl describe pod POD -n NS** (use the **restarted** pod name).
**Look under** the app **container** → **Last State** (or **State** if running).
**Expect if cgroup killed:** **Reason: OOMKilled**, **Exit Code: 137**. **Also note** **Limits** (e.g. **512Mi**) vs **Requests**.
**Expect if clean shutdown:** **Completed** with different code — not your case here.
**Interpret:** **137 + OOMKilled** = kernel enforced **memory limit** on the container. **Next:** compare **Limit** to **JVM -Xmx** + non-heap; do **not** assume heap dump exists.

### 2) Application log: exact OutOfMemoryError string
**Run:** Log search **OutOfMemoryError** (Splunk/Loki/CloudWatch/etc.).
**Expect examples:** **Java heap space** | **Metaspace** | **Direct buffer memory** | **GC overhead limit exceeded** | **Unable to create new native thread**.
**Interpret:** Match string → tuning axis (**-Xmx** vs **MaxMetaspaceSize** vs **MaxDirectMemorySize** vs **threads**/**-Xss**). **GC overhead** often means **tiny heap** or **pathological** GC — read GC logs.

### 3) Effective JVM flags (what is *actually* running?)
**Run (in pod):** **jcmd PID VM.flags** — or **jcmd PID VM.info** (JDK varies).
**Expect:** Lines showing **MaxHeapSize**, **MaxMetaspaceSize**, **CompressedClassSpaceSize**, **ThreadStackSize**, etc. (names vary by JDK).
**Interpret:** **MaxHeapSize** near **container limit** in bytes → **OOMKilled** risk. **Missing MaxMetaspaceSize** → unbounded Metaspace until failure.

### 4) Native memory breakdown (when heap % looks “fine”)
**Prereq:** JVM started with **-XX:NativeMemoryTracking=summary** (needs restart to enable).
**Run:** **jcmd PID VM.native_memory summary**
**Expect:** Sections with **committed** KB: **Java Heap**, **Class**, **Thread**, **Code**, **GC**, **Compiler**, **Internal**, **Symbol**, **Other**.
**Interpret:** **Java Heap** low + **Class** very high → Metaspace/classloaders. **Thread** high → many threads × stacks. **Internal**/**Other** large → JNI, malloc, arenas — correlate with **Netty**/compression/native libs.

### 5) Native thread OOM path
**When log says** **unable to create new native thread**.
**Run:** **jcmd PID Thread.print** (or **jstack PID**) and count **"java.lang.Thread.State"** blocks; compare to **ulimit -u** (if shell) and **pod** **pids** cgroup limit if set.
**Expect:** Thousands of threads or thread count spike after deploy.
**Interpret:** **Thread pool** leak, **per-request** threads, or **-Xss** too large for thread count × limit.`,
        followUps: [
          fu(
            'Why exit 137?',
            '**128 + SIGKILL (9)** — container **OOMKilled** by cgroup when **RSS** (or relevant memory accounting) exceeded **Limits.memory**. **Expect** in **kubectl describe**: **Reason: OOMKilled**. **Not** the same as **java.lang.OutOfMemoryError: Java heap space** in app logs — you may get **one**, **both**, or **only 137** if the kernel wins the race.'
          ),
          fu(
            'Metaspace OOM typical causes?',
            '**Causes:** dynamic proxies (Spring/CGLIB), Groovy/JSP/script engines, **OSGi**-style loaders, **hot reload** leaking loaders, huge **annotation** / **reflect** metadata. **What to run:** **jcmd PID VM.metaspace** — **expect** **committed** near cap. **Mitigation:** **-XX:MaxMetaspaceSize** to **fail fast** with clear **OutOfMemoryError: Metaspace**; fix **classloader** lifecycle; **heap dump** shows **ClassLoader** dominators sometimes.'
          ),
        ],
      },
      {
        id: 'jvm-oom-leak-vs-sizing',
        question:
          'You have a heap dump and GC logs. How do you argue “memory leak” vs “legitimate high usage / undersized heap” to your team?',
        signals: ['dominator tree', 'GC roots', 'Full GC loop', 'allocation rate', 'MAT'],
        answer: `## What’s going wrong
**Stakeholders** want a **one-line** fix (**“increase heap”**). You need **evidence** whether objects are **wrongly retained** vs the service **honestly needs** more footprint for peak load.

## Why this happens
A **leak** is **unexpected reachability** (still **roots** to garbage-from-business-view). **High churn** or **large working set** can fill heap **without** a classic leak — needs **batching** or **capacity**, not only **more MB**.

## What to check (and why)
1. **MAT dominator tree** — **retained size** per object graph; **path to GC roots** — **why** it stays alive (static field, cache, **ClassLoader**, listener).
2. **Two dumps** spaced in time — if **same** dominator **grows** unbounded → **leak** signal; if proportional to **load** → **sizing**/throughput.
3. **GC logs** — **repeated Full GC**, **heap** barely drops after → retention; **healthy young GC**, **high allocation** → may be **allocation rate** / **undersized** young gen.
4. **Business event** — traffic **10x**? New **export** feature? Correlates **expected** growth.

## Behind the scenes
**Leak** = **reachability** from **GC roots**. **Sizing** = **reachable** set is **legitimate** but **too large** for current **-Xmx** or **wrong** batch sizes.

## What you’d do in production
Fix **retention** bugs first; then **right-size** heap and **GC** ergonomics; add **tests** for **cache** bounds.

## Interview tip
Never say “**memory leak**” without **dominator** or **root-path** story — say **“retained set”** or **“suspect leak”** until proven.

## Deep dive: step-by-step with expected output

### 1) MAT — Dominator tree (retained vs shallow)
**Open** **.hprof** in **Eclipse MAT** → **Dominator tree** (or run **Leak Suspects** then **verify** manually).
**What to look for:** Top entries **by Retained Heap** (not only Shallow). **Retained** = memory kept alive **only through** that object subtree.
**Expect (healthy-ish):** **char[]**, **byte[]**, **String**, **HashMap$Node** large if big caches or JSON — still verify **business** ownership.
**Red flag:** A **single** **ArrayList** or **Map** retaining **hundreds of MB** — open it → **Path to GC roots**.

### 2) Path to GC roots — what output means
**Action:** Right-click dominator → **Path to GC roots** → exclude **weak** refs as needed.
**Expect good:** Root is **short-lived** request object, **active Thread** for current work, **JVM** internal you understand.
**Red flag roots:** **java.lang.Class** → **static** field holding a **Map** of sessions; **Thread** → **ThreadLocal** map entry; **ClassLoader** → leaked loader retaining classes.

### 3) Two dumps over time (growth vs stable working set)
**Capture:** **jcmd PID GC.heap_dump** (or automatic dumps) at **T0** and **T1** under similar load.
**In MAT:** **Compare Basket** (or open two histograms side by side).
**Expect leak:** Same class **object count** and **retained bytes** **grow** monotonically across **T0→T1** while load **flat**.
**Expect sizing:** Growth **tracks** traffic (e.g. **10×** traffic → **~10×** footprint) — argue **capacity** / **batching**, not “unknown leak”.

### 4) GC log — Full GC not reclaiming
**Find lines** with **Full** / **Pause Full** / collector-specific full collection (G1, Parallel, Z).
**Read pattern:** **heap before → after (capacity)** on that line.
**Expect after healthy Full GC:** **after** drops **meaningfully** (exact % depends on live set).
**Red flag:** **after** stays **≥ ~85–95%** of capacity **every** cycle → **live set** equals **almost all heap** → leak or **massive** legitimate cache — MAT decides.

### 5) jcmd class histogram delta
**Run twice:** **jcmd PID GC.class_histogram | head -30** (or save full output).
**Expect:** Top classes stable **ranking** over time under **steady** load.
**Red flag:** One **application** class moves from rank 50 → top 5 with **#bytes** doubling hourly.

### 6) Code fix pattern
**unbounded ConcurrentHashMap** cache → **Caffeine** **maximumSize(N)** + **expireAfterWrite**; prove with **unit** test + **MAT** after fix.`,
        followUps: [
          fu(
            'Two dumps how far apart?',
            'Long enough for **meaningful** traffic: often **1–24h** prod or **15–60 min** load test. **Compare** total heap **used** and **top 5** dominators; **expect** dominator **retained** stable if **no** leak; **expect** same dominator **growing** if leak.'
          ),
          fu(
            'Can a “leak” be fixed by increasing heap?',
            '**Temporarily** masks **symptom**; **GC pauses** and **MTTR** still hurt — fix **root** reference or **eviction**.'
          ),
        ],
      },
      {
        id: 'jvm-oom-offheap-direct',
        question:
          'Heap usage in JMX looks healthy at 45%, but the container is OOMKilled. What non-heap consumers do you investigate first?',
        signals: ['direct ByteBuffer', 'Netty', 'NMT', 'RSS', 'Metaspace', 'JNI'],
        answer: `## What’s going wrong
**JMX heap** only tracks **Java heap** — **direct** memory, **Metaspace**, **thread stacks**, **JNI**, **malloc** in native libs all add to **RSS** under the **same** cgroup **limit**.

## Why this happens
**Netty**, **gRPC**, **compression** codecs, **mapped** files, and **large** **thread** counts consume **off-heap**. **Metaspace** grows with **class** count. **Native** **leaks** in JNI libs look like **RSS** growth without heap growth.

## What to check (and why)
1. **NativeMemoryTracking** — **summary** or **detail** (cost) — breaks down **Java** / **Class** / **Thread** / **Code** / **GC** / **Compiler** / **Internal** / **Symbol** / **Other**.
2. **Direct buffer** metrics — if exposed (Netty **ByteBuf** allocators), or **-XX:MaxDirectMemorySize** for **fail-fast**.
3. **Thread count** — **jcmd PID Thread.print** | count — **stack** = **threads × -Xss** order of magnitude.
4. **Metaspace** — **jcmd PID VM.metaspace** (JDK 11+).

## Behind the scenes
**DirectByteBuffer** allocates **native** memory; **GC** cleans them when **no longer referenced** — **phantom** **reference** path — but **high churn** can spike **native** before **heap** shows pain.

## What you’d do in production
Enable **NMT** in staging, reproduce, cap **direct** / **threads**, upgrade **leaky** native dependency, align **K8s limit** with **RSS** reality.

## Interview tip
Mention **“heap fine, RSS bad”** — signals **off-heap** thinking.

## Deep dive: step-by-step with expected output

### 1) Enable NMT and establish baseline
**Set (restart required):** **-XX:NativeMemoryTracking=summary** (use **detail** only in lab — overhead).
**Run:** **jcmd PID VM.native_memory baseline** (optional) then later **jcmd PID VM.native_memory summary.diff** vs baseline if available; else compare **summary** snapshots saved to files.
**Expect in summary:** Rough KB/MB per row: **Java Heap**, **Class**, **Thread**, **Code**, **Compiler**, **GC**, **Internal**, **Symbol**, **Other**.
**Interpret:** **Java Heap** ~45% of limit in JMX but **RSS** at limit → add **Thread** + **Class** + **Internal**; one of them is the villain.

### 2) Direct buffers — JVM flag and logs
**Set:** **-XX:MaxDirectMemorySize=512m** (example) to **fail fast** with **OutOfMemoryError: Direct buffer memory** in **Java** logs instead of silent **RSS** growth.
**Expect when exceeded:** Clear Java stack referencing **DirectByteBuffer** allocation path.
**Without flag:** Process may hit **cgroup** first → **OOMKilled** with confusingly “low” heap in JMX.

### 3) Thread stacks eat native memory
**Run:** **jcmd PID Thread.print** | count **"java.lang.Thread.State"** lines (or estimate thread count via **Metrics**).
**Rough math:** **threads × -Xss** (default often **1m** on 64-bit) = **hundreds of MB** at **500+** threads.
**Expect:** Thread count spike after bad config (unbounded pools).
**Fix:** Cap pools; reduce **-Xss** only with care (deep stacks may **StackOverflowError**).

### 4) Metaspace
**Run:** **jcmd PID VM.metaspace** (JDK 11+).
**Expect output fields** like **usage**, **capacity**, **committed** for **class** and **non-class** metaspace (wording varies).
**Red flag:** **usage** chasing **MaxMetaspaceSize** or **committed** growing unbounded when unset.

### 5) Netty / gRPC
**In app:** Expose allocator **metrics** if available; in dev enable **ResourceLeakDetector** / Netty **advanced** leak detection.
**Expect:** Stable **direct** memory for steady QPS; **sawtooth** is normal with churn — **monotonic** growth is not.`,
        followUps: [
          fu(
            'Does increasing heap help direct memory?',
            '**No** — **-Xmx** does not shrink **direct** native usage. **Expect** the same **OOMKilled** if **RSS** is dominated by **direct** or **threads**. Fix **buffer lifecycle**, **pool sizes**, or raise **container limit** / **MaxDirectMemorySize** consciously.'
          ),
        ],
      },
      {
        id: 'jvm-oom-k8s-dump-runbook',
        question:
          'Walk through how you configure heap dump on OOM and GC logging for a Java service in Kubernetes, and how you retrieve the dump safely.',
        signals: ['HeapDumpOnOutOfMemoryError', 'HeapDumpPath', 'emptyDir', 'kubectl cp', 'Xlog gc', 'PII'],
        answer: `## What’s going wrong
The next **OOM** must produce **actionable** artifacts (**.hprof**, **GC log**) without **filling** the **root** filesystem or **breaking** **PII** policy.

## Why this happens
**Default** paths may be **read-only** or **too small**; **sidecar** **read-only** root; **PID 1** **Java** may not have **JDK** **tools** in **minimal** image.

## What to check (and why)
1. **Volume** — **emptyDir** mounted at **/dumps** or **/tmp** with **sizeLimit** where supported.
2. **JVM flags** — **-XX:+HeapDumpOnOutOfMemoryError**, **-XX:HeapDumpPath=/dumps/oom.hprof**, **-Xlog:gc*:file=/dumps/gc.log**:time,uptime,level,tags.
3. **Image** — **jcmd** / **jmap** available (**debug** image or **copy** **JDK** tools).
4. **PII** — dumps contain **strings** — **access** control, **encryption** at rest, **retention**.

## Behind the scenes
**Heap dump** is **STW**-heavy; **dump-on-OOM** runs when **JVM** is already **failing** — still better than **no** dump.

## What you’d do in production
Document **runbook**: **exec** → **jcmd** manual dump, **kubectl cp** **pod:/dumps** → **local** **MAT**; **delete** dump after **analysis**.

## Interview tip
Mention **writable volume** + **PII** — **staff** bar.

## Deep dive: step-by-step with expected output

### 1) Pod volume (writable path)
**In Deployment/Pod spec:** **volumeMounts:** **mountPath: /dumps**, **name: dump-volume**; **volumes:** **emptyDir:** **{}** (optional **sizeLimit**).
**Verify after deploy:** **kubectl exec POD -- df -h /dumps** — **expect** **tmpfs** or writable FS with free space.
**Red flag:** **Read-only file system** on **/** → default **HeapDumpPath** fails silently or logs error.

### 2) JVM flags and what appears in logs when OOM fires
**Add:** **-XX:+HeapDumpOnOutOfMemoryError** **-XX:HeapDumpPath=/dumps/heap-oom.hprof**
**Add GC log (JDK 11+):** **-Xlog:gc*:file=/dumps/gc.log:time,uptime,level,tags**
**Expect on heap OOM:** Log lines about **java.lang.OutOfMemoryError** followed by **JVMTI** / dump attempt; **.hprof** file size **> 0** under **/dumps**.
**If dump fails:** Look for **IOException** / **No space left** / **Permission denied** in stderr — fix volume or **securityContext**.

### 3) Confirm Java PID inside pod
**Run:** **kubectl exec POD -- ps -ef** or **kubectl exec POD -- cat /proc/1/cmdline**
**Expect:** **java** as PID **1** in many containers — then **jcmd 1 …** works.

### 4) Manual heap dump (before crash)
**Run:** **kubectl exec POD -- jcmd 1 GC.heap_dump /dumps/manual.hprof**
**Expect:** Pause during dump; **ls -lh /dumps** shows growing then stable **.hprof** file.
**If jcmd missing:** Image is JRE-only → switch to **JDK** image for tooling, or **kubectl debug** with a **toolbox** container sharing **pid** namespace.

### 5) Copy dump off cluster
**Run:** **kubectl cp NAMESPACE/POD:/dumps/heap-oom.hprof ./heap-oom.hprof**
**Expect:** Large file transfer; **verify** with **ls -lh** locally.
**PII:** Treat **.hprof** as **sensitive** — encrypt at rest, limit access, delete after analysis.

### 6) JDK 8 vs 11+ GC logging (interview clarity)
**JDK 8 typical:** **-XX:+PrintGCDetails** **-XX:+PrintGCDateStamps** **-Xloggc:/dumps/gc.log** **-XX:+UseGCLogFileRotation** (with limits).
**JDK 11+:** **-Xlog:gc*:file=…** as above.
**Expect in file:** pause duration, **before/after** heap sizes, full GC markers — same **interpretation** as modern logs.`,
        followUps: [
          fu(
            'Minimal container image has no jcmd?',
            '**kubectl debug pod/POD -it --image=eclipse-temurin:17-jdk --target=CONTAINER** (pattern varies by cluster version) to attach a **JDK** container with **pid** sharing, then **jcmd** against **Java PID**. **Expect** to see **jcmd** help output; if **permission denied**, adjust **capabilities** / **securityContext** per policy.'
          ),
        ],
      },
    ],
  },
];
