/** Full section builder for phase10-day88.json — JVM Performance and Profiling */

const T = (title, body, angle) =>
  `### ${title}\n\n${body}\n\n**Interview angle:** ${angle}`;

function buildWhy() {
  return (
    'At 03:42 the **Grafana** page for **checkout** turns orange. **p99** latency jumps from eighty milliseconds to four seconds. **On-call** scrolls logs and sees nothing obvious — no **NullPointerException**, no **SQLException**, just slow responses. Someone in chat says "maybe **GC**" and someone else says "maybe the database". You are new. You learn that night that **Java** does not print a friendly banner when the **JVM** is busy collecting garbage or when **JIT** **compilation** is still warming up. The **CPU** graph looks busy but you cannot tell if that is good work or wasted churn. **JVM** **performance** and **profiling** exist so you replace guesses with evidence before you ship a random **-Xmx** change to production.\n\n' +
    'You are still learning **Java**. You once wrote a **for** loop that used **String** **concatenation** with **+** because it read cleanly. In class it felt fast. In production under load it allocated thousands of temporary **String** objects per request and **Young** **Gen** collections started to dominate **p99**. **Interviewers** who ask about **performance** rarely want you to recite **Big** **O** from memory. They want to hear that you measure first, that you know **JMH** exists to stop **dead** **code** **elimination** from lying to you, and that **Wall** **Clock** time in your **IDE** is not a benchmark. A weak answer says "I would optimize the loop". A strong answer says "I would capture an **async-profiler** **CPU** **flame** **graph** under representative load, confirm allocation hot spots, then prove the fix with **JMH** **@Benchmark** in a forked **JVM**".\n\n' +
    'When ten engineers share one service, two pain patterns repeat. First, someone "tunes" **G1** **GC** because they saw a blog post, without fixing an **allocation** **storm** in application code, and **pause** times get worse while **heap** usage looks flat. Second, a **Tech** **Lead** approves a **microbenchmark** that runs in **main** with **System.currentTimeMillis** around a hot loop, publishes a chart, and ships a cache that actually hurts **throughput** once **JIT** **tiered** **compilation** settles. Both look like mysterious **production** bugs or flaky **CI**. They are measurement and methodology mistakes amplified by team pressure to show progress.\n\n' +
    'Use this four-step pattern when you explain **profiling** in design review. First, name the symptom in user language: **p99**, **error** rate, or **CPU** saturation, not "it feels slow". Second, pick the tool layer: **Java** **Flight** **Recorder** for low-overhead timeline, **async-profiler** for **CPU** and **allocation** samples, **jcmd** for **GC** **heap** snapshots. Third, say what breaks if you skip a step: **coordinated** **omission** in load tests, **biased** **sampling** on **virtual** **threads**, or tuning **GC** before you remove useless object churn. Fourth, verify with **jcmd** **<pid>** **VM.native_memory** **summary**, **jstat** **-gc** **<pid>** **1s**, and a before-and-after **JMH** run stored next to the **pull** **request**.\n\n' +
    'Here is a Staff-level fact that separates senior talk from Staff talk. On **Java** **17** with **G1** **GC**, **pause** times often correlate with **Humongous** **object** handling and **Mixed** **GC** **cycles**, not only with "heap is full". On **Java** **21**, **ZGC** defaults and **Generational** **ZGC** options change which **jcmd** **GC.heap_info** lines you trust when **Metaspace** grows from **class** **loading** during redeploys. You tie those flags to **Kubernetes** **memory** limits because **RSS** includes native **GC** **buffers** that **heap** charts ignore.\n\n' +
    'In your first six months you will live this topic. During onboarding you help a teammate who blames **GC** because **VisualVM** showed purple bars, only to find **synchronized** contention with **jcmd** **Thread.print**. Before a **Spring** **Boot** upgrade you compare **Actuator** **metrics** with **JFR** **events** to prove **Tomcat** thread pools, not **GC**, caused the spike. After a **Java** **21** rollout you validate **virtual** **thread** pinning with **JFR** **jdk.VirtualThreadPinned** samples. Each time you attach numbers, tool names, and **JDK** versions, you sound like someone who has carried a pager, not someone who watched one **YouTube** video about **StringBuilder**.\n\n' +
    'You also learn that **profiling** is a kindness to your future self. The **JVM** is honest if you listen with the right microphones. **Warm** **up** matters. **Allocation** matters. **GC** **logs** matter. When you can open one **flame** **graph**, one **JFR** recording, and one **jstat** table for the same incident, you stop arguing from folklore. That is the difference between teams that shrink **p99** with evidence and teams that rotate **-Xmx** like a slot machine.'
  );
}

function buildTheoryContent() {
  const parts = [
    T(
      'Plain-language overview',
      '**JVM** **performance** work is about answering one boring question with numbers: where did the time go, and where did the memory go. Your **Java** program runs as **bytecode** on a **JVM** that **JIT**-compiles hot methods, allocates objects on the **heap**, and runs **GC** when generations fill. **Profiling** samples what the **CPU** does or what objects allocate. **Benchmarking** compares two implementations under rules that stop the **JVM** from cheating. Without those habits you optimize the wrong line and call it a win.',
      'Interviewers listen for measurement before opinion and for the word **allocation** beside **GC**.'
    ),
    T(
      'What is profiling and why does it exist',
      'A **profiler** attaches to a running **JVM** and records stacks or allocation sites at intervals. It answers "which methods burn **CPU**" or "which types allocate the most bytes". It does not replace **logging**; it shows work your **log** statements never mention because the hot path never throws. Production surprises like **p99** spikes often come from **synchronized** blocks, hidden **autoboxing**, or **String** concatenation in loops.',
      'Weak answers confuse **CPU** percent with wall time; strong ones separate **CPU** bound from **wait** bound.'
    ),
    T(
      'Your first nanoTime loop and why it is not enough',
      'You can wrap work in **System.nanoTime** deltas for a quick sniff test. The **JVM** may still **inline**, reorder, or **dead-code** **eliminate** work unless you consume results. Real projects use **JMH** to fork **JVM** processes, warm up **JIT**, and blackhole results.\n\n```java\nlong t0 = System.nanoTime();\nint sum = 0;\nfor (int i = 0; i < 1_000_000; i++) {\n    sum += i & 1;\n}\nlong t1 = System.nanoTime();\nSystem.out.println((t1 - t0) + " ns sum=" + sum);\n```\n\nRun it twice; watch the second run shrink after **C2** **compilation**. That single demo teaches why hand timing misleads juniors.',
      'Interviewers want you to say **warmup** and **DCE** out loud, not only "I timed it".'
    ),
    T(
      'How to read a flame graph or JFR summary',
      'Wide bars mean more samples landed in that stack frame. Read top-down for **CPU** **flame** **graphs**: the leaf is often **hot**, but the parent shows which business call got you there. In **Java** **Flight** **Recorder**, open **Method** **Profiling** or **Allocation** **Profiling** views and sort by **self** time first, then include callees. If everything points to **java.util.HashMap**, ask whether keys are expensive or buckets are degenerate before you blame **GC**.',
      'Strong candidates narrate one real frame they chased, not only "I opened a tool".'
    ),
    T(
      'How Mockito timing habits poison hand-written microbenchmarks',
      'People who only ever measured **unit** tests sometimes wrap a loop in **main** and print **currentTimeMillis**. **Mockito**-heavy tests rarely stress **JIT** **tiered** **compilation** the way production traffic does. Hand benchmarks often forget **Blackhole** consumption, so **C2** removes "useless" math. **JMH** **@Benchmark** forces you to return results through **Blackholes** and fork processes so **profiled** **JVM** settings do not leak between cases.',
      'Senior answers tie bogus speedups to **JIT** and **DCE**, not to "the other developer is lazy".'
    ),
    T(
      'Comparison table — JMH, hand timing, IDE profiler, production metrics',
      '| Approach | What it proves | What breaks if you trust it alone |\n|----------|----------------|-----------------------------------|\n| **JMH** **@Benchmark** | Stable micro comparisons after warmup | Ignores **I/O** and real caches |\n| Hand **nanoTime** loop | Rough local sniff | **DCE** and cold **JIT** lie |\n| **IDE** **CPU** **sample** | Quick dev feedback | Different **JDK** flags than prod |\n| **APM** **p99** | User-visible truth | Hides which line without **JFR** pairing |\n\nUse them together: **APM** finds the hour, **profiler** finds the minute.',
      'Interviewers reward pairing micro and macro evidence.'
    ),
    T(
      'Numbered sequence — from latency complaint to proven fix',
      '1. Reproduce under realistic load; capture **p99** not only averages.\n2. Take **JFR** or **async-profiler** **CPU** sample during the bad window.\n3. Form a hypothesis: **allocation**, **lock**, **I/O**, or **GC** pause.\n4. Implement the smallest change and rerun the same load script.\n5. Attach **jstat** **-gc** before and after to see **Young** **GC** frequency move.\n6. Lock the win with **JMH** if the change is a hot micro-path.\n\nSkipping step two is how teams ship **StringBuilder** tweaks that never moved **p99**.',
      'Tech leads should defend each step with a metric name, not vibes.'
    ),
    T(
      'Common mistakes that look like GC bugs or random slowness',
      'Tuning **-XX:+UseG1GC** flags before removing accidental **Integer** **boxing** in tight loops. Running **profilers** on idle laptops while production uses **many** **cores** and different **NUMA** layout. Trusting **System.gc()** in tests to mimic production **GC** behavior — it does not. Another classic is blaming **database** latency when **async** traces show the service thread blocked on a **synchronized** **Map**.',
      'Staff engineers open **jcmd** **Thread.print** before they open **GC** cheat sheets.'
    ),
    T(
      'Choosing between async-profiler and Java Flight Recorder',
      '**async-profiler** attaches with **-e** **cpu** or **alloc** and outputs **flame** **graphs** friendly to **GitHub** gists. **JFR** is built into **HotSpot**, low overhead, and records rich **event** **streams** you can mine in **JDK** **Mission** **Control**. Use **async-profiler** when you want a quick **CPU** picture from a shell. Use **JFR** when you need timeline correlation between **GC**, **socket** **read**, and **allocation** spikes.',
      'Interviewers listen for when each tool is worth the setup cost.'
    ),
    T(
      'Code review — performance claims',
      'Reject **pull** **requests** that say "faster" without **before**/**after** numbers or **benchmark** class name. Flag new **String** **+** in **hot** loops. Ask for **volatile** or **atomic** reasoning when profilers show **contention**. Require **load** test protocol updates when **p99** **SLA** is part of the feature.',
      'Review culture decides whether folklore or evidence wins.'
    ),
    T(
      'Stakeholder talk — p99 versus averages without shame',
      'Explain that **average** latency hides angry customers in the slow tail. Show a chart where **median** is flat but **p99** doubled. Offer a plan: two sprint cycles, first measurement, second fix, third guardrail metric in **CI**. Translate **GC** **pause** into "requests waited" with a concrete **millisecond** budget.',
      'Leaders trust simple charts and honest tail latency language.'
    ),
    T(
      'Tool commands when latency or memory spikes',
      '| Command | What you learn |\n|---------|----------------|\n| **jcmd** **<pid>** **Thread.print** | **BLOCKED** threads and lock owners |\n| **jcmd** **<pid>** **GC.heap_info** | **Heap** layout, **Metaspace**, **G1** regions |\n| **jstat** **-gc** **-t** **<pid>** **1s** | **GC** counts and times over time |\n| **jmap** **-dump:live,format=b,file=heap.hprof** **<pid>** | **Heap** dump for **MAT** or **JProfiler** |\n',
      'Interviewers reward naming **jcmd** plus **jstat**, not only **top**.'
    ),
    T(
      'jcmd when p99 spikes but CPU looks idle',
      'Run **jps** **-l** to find the service **pid**, then **jcmd** **<pid>** **Thread.print**. Count threads in **TIMED_WAITING** on **pools** versus **BLOCKED** on monitors. If many threads wait on **java.net.SocketInputStream.read**, you are **I/O** bound, not **CPU** bound, and **CPU** **profilers** will mislead you. Pair with **jcmd** **<pid>** **VM.native_memory** **summary** if **RSS** exceeds **-Xmx** unexpectedly.',
      'On-call credibility is naming a thread state, not guessing "GC again".'
    ),
    T(
      'Java 8 versus 11 versus 17 versus 21 for profiling and GC',
      '| **Java** | Profiling note |\n|----------|----------------|\n| **8** | **FlightRecorder** commercial flags; **Parallel** **GC** common |\n| **11** | **JFR** usable without commercial unlock on supported builds |\n| **17** | **ZGC** and **G1** defaults evolve; **Vector** **API** preview noise in some benches |\n| **21** | **Virtual** **threads** need **JFR** **pin** events; **Generational** **ZGC** changes pause story |\n\nMatch **JDK** in **CI** to prod before you trust a **flame** **graph**.',
      'Version answers should mention **JFR** availability and **GC** collector choice, not only syntax.'
    ),
    T(
      'JVM Young Gen pressure when small objects flood the allocator',
      'Each **new** lands in **Eden**. Short-lived **DTO** graphs per request fill **Young** **Gen** fast, so **Minor** **GC** frequency rises and **p99** wiggles even if **Old** **Gen** is empty. **jcmd** **<pid>** **GC.class_histogram** **all** shows which classes dominate. Fixing often means fewer allocations — **primitive** arrays, object reuse where safe, or streaming **JSON** — not a bigger **-Xmx**.',
      'Staff engineers read **Young** **GC** counts in **jstat** before touching **Old** **Gen** tuning.'
    ),
    T(
      'Architecture guardrail for performance work at fifty services',
      'Centralize **JFR** **recording** templates and **async-profiler** launch flags so every team does not invent a different sample rate. Store **baseline** **p99** per critical path in **Grafana** and alert on regression budgets. Ban **System.gc()** in libraries. Require **JMH** modules for shared utility code that claims to be "zero-cost".',
      'Architects listen for shared templates, baselines, and anti-folklore rules.'
    ),
    T(
      '60-second interview story',
      '**Profiling** finds **CPU** and **allocation** hot spots; **JMH** proves micro-changes after **JIT** **warmup**. **GC** tuning without fixing **allocation** storms wastes time. **Tech** **Leads** pair **APM** **p99** with **JFR** timelines. **Staff** engineers reach for **jcmd** **Thread.print** and **jstat** when tails spike under load.',
      'This ties tools, methodology, and **JDK** awareness in one breath.'
    ),
    T(
      'Satyverse drill — tie-down',
      'Run your service locally with a steady **curl** loop or **wrk** against one endpoint for two minutes. Attach **async-profiler** **-d** **30** **-e** **cpu** **-f** **flame.html** **<pid>** or start a **JFR** **recording** with **jcmd** **<pid>** **JFR.start**. Open the output and write down the top three **Java** frames you recognize. Then run **jstat** **-gc** **<pid>** **1s** for thirty seconds and note **YGC** count delta.',
      'Interviewers respect learners who have held a **flame** **graph** next to **jstat** numbers once.'
    )
  ];
  return parts.join('\n\n');
}

function buildBasicCode() {
  const code = `package arch.day88;

/**
 * Fresher reference card: JVM performance vocabulary (println only).
 */
public class Day88Basic {

    public static void main(String[] args) {
        // Week one: tie words to what you see in Grafana before you touch -Xmx.
        System.out.println("=== Core JVM performance ideas ===");
        System.out.println("JIT             | HotSpot compiles bytecode to native code after warmup");
        System.out.println("GC              | Reclaims heap objects; pauses depend on collector + load");
        System.out.println("Heap            | Eden + Survivors + Old (G1/ZGC layout differs)");
        System.out.println("Profiler        | Samples CPU stacks or allocations to find hot paths");
        System.out.println("JMH             | Java Microbenchmark Harness; forks JVMs, avoids DCE lies");
        System.out.println();

        // Paste these beside pid when Slack asks "what is the JVM doing".
        System.out.println("=== Commands you actually run ===");
        System.out.println("jps -l                          -> list Java processes + main class");
        System.out.println("jcmd <pid> Thread.print         -> stack traces + lock info");
        System.out.println("jcmd <pid> GC.heap_info         -> heap layout + Metaspace snapshot");
        System.out.println("jstat -gc -t <pid> 1s          -> GC counters each second");
        System.out.println();

        // Symptoms that look like app bugs but are often JVM measurement gaps.
        System.out.println("=== Beginner errors and confusions ===");
        System.out.println("OutOfMemoryError: Java heap space -> real heap exhaustion or leak");
        System.out.println("GC overhead limit exceeded        -> tiny heap + too much allocation");
        System.out.println("p99 spike + flat CPU              -> often locks, I/O, or remote waits");
        System.out.println("Fast main(), slow prod            -> missing warmup + different data size");
        System.out.println();

        // One sentence before you rewrite hot code from intuition.
        System.out.println("=== Remember this ===");
        System.out.println("Measure with the same JDK flags and load shape you run in production.");
        System.out.println();

        // Know which file extensions belong to which tool output.
        System.out.println("=== Profiler outputs in one glance ===");
        System.out.println("JFR  .jfr file   | Java Flight Recorder timeline (JMC opens it)");
        System.out.println("async-profiler  | flame.html or collapsed stacks for CPU/alloc");
        System.out.println("heap.hprof      | jmap dump for Eclipse MAT / YourKit");
    }
}`;
  const output = `=== Core JVM performance ideas ===
JIT             | HotSpot compiles bytecode to native code after warmup
GC              | Reclaims heap objects; pauses depend on collector + load
Heap            | Eden + Survivors + Old (G1/ZGC layout differs)
Profiler        | Samples CPU stacks or allocations to find hot paths
JMH             | Java Microbenchmark Harness; forks JVMs, avoids DCE lies

=== Commands you actually run ===
jps -l                          -> list Java processes + main class
jcmd <pid> Thread.print         -> stack traces + lock info
jcmd <pid> GC.heap_info         -> heap layout + Metaspace snapshot
jstat -gc -t <pid> 1s          -> GC counters each second

=== Beginner errors and confusions ===
OutOfMemoryError: Java heap space -> real heap exhaustion or leak
GC overhead limit exceeded        -> tiny heap + too much allocation
p99 spike + flat CPU              -> often locks, I/O, or remote waits
Fast main(), slow prod            -> missing warmup + different data size

=== Remember this ===
Measure with the same JDK flags and load shape you run in production.

=== Profiler outputs in one glance ===
JFR  .jfr file   | Java Flight Recorder timeline (JMC opens it)
async-profiler  | flame.html or collapsed stacks for CPU/alloc
heap.hprof      | jmap dump for Eclipse MAT / YourKit
`;
  return { code, output };
}

function buildMidCode() {
  const code = `package arch.day88;

/**
 * Four JVM performance scenarios a senior engineer narrates in review.
 */
public class Day88Intermediate {

    static void scenario1() {
        // First micro-optimization PR: hand timing in main looked great on a cold laptop.
        System.out.println("--- Scenario 1: PR claims 40 percent faster loop; prod p99 unchanged ---");
        System.out.println("symptom:  merged StringBuilder tweak; dashboards still spike at peak");
        System.out.println("cause:    bottleneck was remote inventory RPC not local concat");
        System.out.println("why:      hand nanoTime measured the wrong layer with tiny data");
        System.out.println("fix:      async-profiler CPU sample under wrk load; fix top frame");
        System.out.println("verify:   jcmd <pid> Thread.print shows threads blocked in socketRead");
        System.out.println("next:     add JMH only after profiler proves local hot path");
        System.out.println();
    }

    static void scenario2() {
        // Production: GC logs blamed; profiler showed lock convoy on a synchronized map.
        System.out.println("--- Scenario 2: nightly GC pause alerts but heap usage flat ---");
        System.out.println("symptom:  long STW pauses in logs; ops asks for bigger -Xmx");
        System.out.println("cause:    humongous allocations + lock contention inflated safepoints");
        System.out.println("why:      threads raced on synchronized HashMap during promotion spikes");
        System.out.println("fix:      replace with ConcurrentHashMap; shrink allocation in hot DTO path");
        System.out.println("verify:   jstat -gc -t <pid> 1s shows YGC count drops after deploy");
        System.out.println("next:     jcmd <pid> GC.heap_info confirms Old Gen not the fake culprit");
        System.out.println();
    }

    static void scenario3() {
        // Performance: autoboxing in a tight analytics loop dominated Young Gen.
        System.out.println("--- Scenario 3: CPU low but p99 grows after feature flag rollout ---");
        System.out.println("symptom:  service threads mostly TIMED_WAITING; latency climbs");
        System.out.println("cause:    Integer boxing inside 10M iteration rollup per request");
        System.out.println("why:      each sum created Integer objects flooding Eden");
        System.out.println("fix:      primitive accumulators + batch arrays");
        System.out.println("verify:   jcmd <pid> GC.class_histogram all shows Integer drops");
        System.out.println("next:     JMH @Benchmark before/after with same Blackhole pattern");
        System.out.println();
    }

    static void scenario4() {
        // Architecture: every team runs different JDK flags; flame graphs disagree.
        System.out.println("--- Scenario 4: staging profile unlike prod; wrong method inlined ---");
        System.out.println("symptom:  engineer optimizes method X; prod still spends time in Y");
        System.out.println("cause:    staging used -XX:TieredStopAtLevel=1 for faster startup");
        System.out.println("why:      C2 never compiled the path that dominates under real load");
        System.out.println("fix:      align JVM flags + use JFR recorded in prod-like soak test");
        System.out.println("verify:   java -XX:+PrintFlagsFinal -version diff staging vs prod");
        System.out.println("next:     document required flags in Helm chart values");
        System.out.println();
    }

    public static void main(String[] args) {
        // Header helps you find this output inside noisy CI logs or IDE runs.
        System.out.println("=== Day88Intermediate: four JVM performance war stories ===");
        System.out.println("Tip: run with java arch.day88.Day88Intermediate from compiled classes.");
        System.out.println("Each scenario names a diagnostic command you can paste into runbooks.");
        System.out.println("If CPU looks idle, still capture jcmd Thread.print for lock waits.");
        System.out.println();
        scenario1();
        scenario2();
        scenario3();
        scenario4();
        System.out.println("=== End of scenario pack ===");
        System.out.println("When escalating, attach JFR or flame HTML, jstat snippet, JDK version.");
    }
}`;
  const output = `=== Day88Intermediate: four JVM performance war stories ===
Tip: run with java arch.day88.Day88Intermediate from compiled classes.
Each scenario names a diagnostic command you can paste into runbooks.
If CPU looks idle, still capture jcmd Thread.print for lock waits.

--- Scenario 1: PR claims 40 percent faster loop; prod p99 unchanged ---
symptom:  merged StringBuilder tweak; dashboards still spike at peak
cause:    bottleneck was remote inventory RPC not local concat
why:      hand nanoTime measured the wrong layer with tiny data
fix:      async-profiler CPU sample under wrk load; fix top frame
verify:   jcmd <pid> Thread.print shows threads blocked in socketRead
next:     add JMH only after profiler proves local hot path

--- Scenario 2: nightly GC pause alerts but heap usage flat ---
symptom:  long STW pauses in logs; ops asks for bigger -Xmx
cause:    humongous allocations + lock contention inflated safepoints
why:      threads raced on synchronized HashMap during promotion spikes
fix:      replace with ConcurrentHashMap; shrink allocation in hot DTO path
verify:   jstat -gc -t <pid> 1s shows YGC count drops after deploy
next:     jcmd <pid> GC.heap_info confirms Old Gen not the fake culprit

--- Scenario 3: CPU low but p99 grows after feature flag rollout ---
symptom:  service threads mostly TIMED_WAITING; latency climbs
cause:    Integer boxing inside 10M iteration rollup per request
why:      each sum created Integer objects flooding Eden
fix:      primitive accumulators + batch arrays
verify:   jcmd <pid> GC.class_histogram all shows Integer drops
next:     JMH @Benchmark before/after with same Blackhole pattern

--- Scenario 4: staging profile unlike prod; wrong method inlined ---
symptom:  engineer optimizes method X; prod still spends time in Y
cause:    staging used -XX:TieredStopAtLevel=1 for faster startup
why:      C2 never compiled the path that dominates under real load
fix:      align JVM flags + use JFR recorded in prod-like soak test
verify:   java -XX:+PrintFlagsFinal -version diff staging vs prod
next:     document required flags in Helm chart values

=== End of scenario pack ===
When escalating, attach JFR or flame HTML, jstat snippet, JDK version.
`;
  return { code, output };
}

function buildAdvCode() {
  const code = `package arch.day88;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Tech lead triage: latency + heap incidents without live I/O.
 */
public class Day88Advanced {

    record Signal(String pod, boolean cpuHot, boolean allocStorm, boolean gcPause) {}

    public static void main(String[] args) {
        // Block 1 mirrors Grafana labels you grep before blaming the database.
        System.out.println("=== Block 1: collect signals from metrics ===");
        List<Signal> signals = List.of(
            new Signal("p-101", true, false, false),
            new Signal("p-102", false, true, false),
            new Signal("p-103", false, false, true)
        );
        for (Signal s : signals) {
            System.out.println(s.pod() + " cpuHot=" + s.cpuHot()
                + " allocStorm=" + s.allocStorm() + " gcPause=" + s.gcPause());
        }
        System.out.println();

        // Block 2 maps each failure class to the first human action.
        System.out.println("=== Block 2: map signal to first action ===");
        Map<String, String> action = new LinkedHashMap<>();
        action.put("cpu_hot", "async-profiler -e cpu -d 30 -f flame.html <pid>");
        action.put("alloc_storm", "async-profiler -e alloc -d 30 -f alloc.html <pid>");
        action.put("gc_pause", "jcmd <pid> GC.heap_info && jstat -gc -t <pid> 1s");
        for (Map.Entry<String, String> e : action.entrySet()) {
            System.out.println("pattern " + e.getKey() + " -> " + e.getValue());
        }
        System.out.println();

        // Block 3 is the paste-ready triage table for Slack incidents.
        System.out.println("=== Block 3: on-call checklist table ===");
        Map<String, String> table = new LinkedHashMap<>();
        table.put("flat CPU + bad p99", "jcmd Thread.print; look BLOCKED vs socketRead");
        table.put("rising YGC/sec", "jcmd GC.class_histogram; chase Integer/String churn");
        table.put("long STW pause", "compare G1 vs ZGC flags; check humongous objects");
        for (Map.Entry<String, String> e : table.entrySet()) {
            System.out.println(e.getKey() + " | " + e.getValue());
        }
        System.out.println();
        System.out.println("Ordered response: reproduce load, capture JFR 60s, then jstat baseline.");
        System.out.println("Escalation bundle: flame.html + jstat 30 lines + java -version output.");
        System.out.println("If staging only: diff -XX flags with prod PrintFlagsFinal dumps.");
        System.out.println("JMH note: micro proof belongs after macro profiler points at code.");
        System.out.println("Virtual thread note: enable JFR jdk.VirtualThreadPinned if pinning suspected.");
        System.out.println("Metaspace note: jcmd VM.native_memory summary during redeploy storms.");
        System.out.println("Done: attach this stdout beside Grafana screenshots in the ticket.");
        System.out.println("RSS note: compare kubectl top pod RSS with jcmd NMT when OOMKilled.");
        System.out.println("JDK note: record java -version in every profiling ticket for reproducibility.");
        System.out.println("Load note: capture request rate alongside profiler window to avoid omission bias.");
    }
}`;
  const output = `=== Block 1: collect signals from metrics ===
p-101 cpuHot=true allocStorm=false gcPause=false
p-102 cpuHot=false allocStorm=true gcPause=false
p-103 cpuHot=false allocStorm=false gcPause=true

=== Block 2: map signal to first action ===
pattern cpu_hot -> async-profiler -e cpu -d 30 -f flame.html <pid>
pattern alloc_storm -> async-profiler -e alloc -d 30 -f alloc.html <pid>
pattern gc_pause -> jcmd <pid> GC.heap_info && jstat -gc -t <pid> 1s

=== Block 3: on-call checklist table ===
flat CPU + bad p99 | jcmd Thread.print; look BLOCKED vs socketRead
rising YGC/sec | jcmd GC.class_histogram; chase Integer/String churn
long STW pause | compare G1 vs ZGC flags; check humongous objects

Ordered response: reproduce load, capture JFR 60s, then jstat baseline.
Escalation bundle: flame.html + jstat 30 lines + java -version output.
If staging only: diff -XX flags with prod PrintFlagsFinal dumps.
JMH note: micro proof belongs after macro profiler points at code.
Virtual thread note: enable JFR jdk.VirtualThreadPinned if pinning suspected.
Metaspace note: jcmd VM.native_memory summary during redeploy storms.
Done: attach this stdout beside Grafana screenshots in the ticket.
RSS note: compare kubectl top pod RSS with jcmd NMT when OOMKilled.
JDK note: record java -version in every profiling ticket for reproducibility.
Load note: capture request rate alongside profiler window to avoid omission bias.
`;
  return { code, output };
}

const PITFALLS = [
  'Calling **System.currentTimeMillis** once around a **for** loop in **main** and shipping the result as proof — **JIT** **warmup** and **dead** **code** **elimination** make the number fiction; fix by using **JMH** **@Benchmark** with **Blackholes**; verify with **mvn** **-pl** **benchmarks** **clean** **install** and compare **Score** lines.',
  'Reading **OutOfMemoryError** **Java** **heap** **space** and raising **-Xmx** without a **heap** **dump** — you hide the leak until the pod **OOMKills** at the **Kubernetes** limit; fix by capturing **jmap** **-dump:live** **or** **jcmd** **GC.heap_dump** once; verify **Eclipse** **MAT** shows retained dominator paths shrinking after code fix.',
  'Using **synchronized** on every method because the **IDE** **CPU** **sample** looked noisy — you serialize real **throughput** and **p99** explodes under load; fix by shrinking critical sections or **java.util.concurrent** structures; verify **jcmd** **<pid>** **Thread.print** shows fewer **BLOCKED** threads on that monitor.',
  'Letting each **microservice** team invent its own **JFR** settings and **async-profiler** interval — incidents cannot compare recordings apples-to-apples; fix by publishing a platform template in **Git**; verify **jfr** **summary** **recording.jfr** matches the doc baseline line count.',
  'Skipping **baseline** **p99** metrics in **CI** for shared libraries that claim performance wins — regressions ship silently until **Black** **Friday**; fix by gating merges on **JMH** **regression** thresholds; verify **Gradle** **JMH** **plugin** fails the build when **Score** error intervals overlap wrongly.',
  'Running **load** generators without **coordinated** **omission** awareness — charts show pretty flat latency while clients secretly stall; fix by using tools that track intended vs actual schedule; verify **wrk** **latency** distribution diverges from **closed-loop** driver when backlog grows.',
  'Setting **-Xmx** near the **Kubernetes** **memory** **limit** with no **headroom** for **native** **GC** **buffers** — **Linux** **OOMKiller** stops the **JVM** mid-**GC**; fix by reserving **20**–**30** percent for **RSS** overhead; verify **jcmd** **<pid>** **VM.native_memory** **summary** fits inside cgroup.',
  'Profiling on **Java** **17** while production runs **Java** **21** **Generational** **ZGC** — flame tops reorder after **JIT** changes; fix by matching **JDK** minor versions across environments; verify **java** **-version** strings equal in **Dockerfile** and **GitHub** **Actions** image.'
];

function fuProd() {
  return {
    question: 'How does **JVM** **profiling** show up in **production** or **CI** incidents?',
    answer:
      'Your **p99** doubles after deploy while **CPU** stays flat. You attach **async-profiler** **-e** **cpu** to the **pid**, see **java.util.regex** **Matcher** dominating, and open **jcmd** **<pid>** **Thread.print** to confirm threads were **RUNNABLE** not waiting on **I/O**. You capture **jstat** **-gc** before rollback and file a **JMH** issue for the regex rewrite. You align **JDK** **21** in **CI** with prod so **JIT** behavior matches.'
  };
}

function fuTrap() {
  return {
    question: 'What is a common trap people believe about **GC** **logs**?',
    answer:
      'People think any long pause means "increase **heap**". Often **Metaspace** or **humongous** objects or **safepoint** work from **biased** **locking** removal causes the pause. Trap fix: read **jcmd** **GC.heap_info** and **GC.class_histogram** before touching **-Xmx**.'
  };
}

function ca(core, err, cmd, ver) {
  const tail =
    ' Shops still get surprised when **Java** **21** **virtual** **threads** pin on **synchronized** **legacy** JDBC and **JFR** **jdk.VirtualThreadPinned** spikes while **CPU** looks idle. Capture **JFR** on **JDK** **21** with that event enabled. When **Young** **GC** storms, **jcmd** **GC.class_histogram** shows **byte** arrays from **String** **getBytes** in tight loops. **ZGC** **Generational** mode on **21** shifts pause semantics versus single-gen **ZGC** on **17**, so always name the collector build in postmortems.';
  return `${core} At the **JVM** level **HotSpot** executes **bytecode**, **JIT** compiles hot **nmethods**, and **GC** threads reclaim **heap** regions while your **mutator** threads run. ${err} You shorten mean time to clue with ${cmd}. ${ver}${tail}`;
}

const CONCEPTUAL_Q = [
  ['What does the **JIT** do in the **JVM**?', 'The **JIT** **compiler** turns hot **bytecode** into native machine code so loops run faster after startup.', 'Cold code can look slow while **C1**/**C2** tiers warm up, confusing **p99** right after deploy.', '**jcmd** **<pid>** **Compiler.codecache** shows space used by compiled **nmethods**.', '**Java** **17** keeps **tiered** **compilation** defaults most services rely on; **Java** **21** adds **virtual** **thread** pinning events you must sample differently.'],
  ['What is **GC** in one sentence?', '**GC** recycles unreachable **heap** objects so **new** keeps working without manual **free**.', 'Mis-tuning shows **GC** **overhead** **limit** **exceeded** or long **pause** logs.', '**jstat** **-gc** **<pid>** **1s** prints **YGC**/**FGC** counts you can graph.', '**Java** **11** made **G1** the default collector on many **Linux** server **JDK** builds versus **Parallel** on **8**.'],
  ['What is **JMH**?', '**JMH** is the **Java** **Microbenchmark** **Harness** that forks **JVM** processes and controls **warmup** to measure tiny code paths honestly.', 'Handwritten loops lie because **DCE** removes "unused" math.', '**mvn** **-pl** **benchmarks** **test** runs generated **Benchmark** classes.', '**Java** **21** **Project** **Valhalla** previews do not replace **JMH** rules; always blackhole results.'],
  ['What is a **CPU** **profiler**?', 'It periodically samples thread stacks to estimate where **CPU** time goes.', 'You learn which **Java** methods appear on hot paths in production-like load.', '**async-profiler** **attach** **<pid>** produces **flame** **graphs** you can open in a browser.', '**Java** **Flight** **Recorder** ships inside **Oracle**/**OpenJDK** **17** without extra agents on supported builds.'],
  ['What is **Wall** **Clock** time versus **CPU** time?', '**Wall** time is what users feel end-to-end; **CPU** time is how much processor work your thread actually used.', 'A service can show low **CPU** while **p99** explodes if threads **BLOCK** on locks.', '**jcmd** **Thread.print** lists **BLOCKED** and lock owners.', '**Java** **21** **virtual** **threads** magnify **pinning** issues that **CPU** samples undercount unless **JFR** pin events are on.'],
  ['What is **allocation** pressure?', 'It is how fast your code creates short-lived objects that fill **Eden**.', 'High pressure raises **Young** **GC** frequency and **p99** jitter.', '**jcmd** **GC.class_histogram** **all** ranks classes by bytes alive.', '**Java** **8** autoboxing still allocates **Integer** on every **Collection** of primitives carelessly.'],
  ['What is a **safepoint**?', 'A moment where every **mutator** thread pauses so the **JVM** can run **GC** or **deoptimization** work.', 'Long **safepoint** waits feel like random latency spikes.', '**jcmd** **<pid>** **VM.flags** combined with **-Xlog:gc*** helps correlate pauses.', '**Java** **17** improved **JFR** **jdk.Safepoint** event detail versus older releases.'],
  ['What does **Metaspace** hold?', '**Class** **metadata** such as **bytecode** constants and **method** tables live in **Metaspace** off the regular **Java** **heap**.', 'Leaks from **classloader** churn throw **OutOfMemoryError** **Metaspace**.', '**jcmd** **VM.native_memory** **summary** exposes **Metaspace** **committed** bytes.', '**Java** **8** used **PermGen**; **Java** **11**+ uses **Metaspace** with different tuning flags.'],
  ['Why use **JFR** in production?', '**JFR** records **events** with low overhead: **GC**, **socket** **read**, **allocation** bursts.', 'You correlate **p99** spikes with real **JVM** moments instead of guessing.', '**jcmd** **<pid>** **JFR.start** **duration**=60s **filename**=rec.jfr starts a capture.', '**Java** **17** streamlines some **JFR** defaults; **Java** **21** adds **virtual** **thread** diagnostics you should enable when migrating.'],
  ['What is **dead** **code** **elimination**?', 'The **JIT** removes computations whose results are never observed.', 'Naive microbenchmarks measure nothing and look instant.', '**JMH** **Blackhole.consume** forces the **JVM** to keep work.', '**Java** **11**+ **C2** still aggressively optimizes loops without side effects.'],
  ['What is **coordinated** **omission** in load tests?', 'Load generators that pause when the system slows under-report latency because they stop sending work.', 'Charts look healthy while users wait in a backlog.', 'Compare intended send schedule with actual in your driver metrics.', '**Java** **17** services under **virtual** **threads** change driver thread counts you must retune.'],
  ['What does **G1** **GC** try to optimize?', '**G1** targets predictable **pause** times by collecting **regions** incrementally.', 'Wrong **MaxGCPauseMillis** expectations lead to frantic flag churn.', '**jstat** **-gc** shows **S0C/S1C** survivor churn versus **G1** **Eden** **regions**.', '**Java** **9**+ made **G1** default on server **class** **JVM**; **Java** **21** offers **Generational** **ZGC** as an alternative story.'],
  ['What is **ZGC**?', '**ZGC** is a low-latency collector that does much work concurrently with application threads.', 'It reduces long **stop-the-world** phases for huge heaps when configured well.', '**jcmd** **GC.heap_info** names the active collector so postmortems stay accurate.', '**Java** **21** **Generational** **ZGC** changes young collection behavior versus single-generation **ZGC** on **17**.'],
  ['What is **async-profiler**?', 'It attaches to **HotSpot** and samples **CPU** or **allocations** using **perf** **events** on **Linux**.', 'You get **flame** **graphs** without recompiling the app.', 'Run **asprof** **-d** **30** **-e** **cpu** **-f** **out.html** **<pid>** per your install docs.', 'Works best when **kernel** **ptrace** and **perf_event_paranoid** settings allow your user.'],
  ['Why match **JDK** versions when comparing profiles?', 'Different **JDK** builds change **inlining** and **intrinsics**, reordering hot stacks.', 'A **staging** profile on **17** misleads if prod runs **21**.', '**java** **-version** plus **-Xinternalversion** captures the exact build string.', '**Java** **21** adds **foreign** **API** **preview** paths that shift **unsafe** usages in libraries.'],
  ['What is **object** **churn**?', 'Creating and discarding many short-lived objects per request.', 'It raises **allocation** rate and **GC** **CPU** cost even if **heap** is huge.', '**jcmd** **GC.class_histogram** after load shows **char**/**byte** arrays from **String** work.', '**Java** **17** **String** **compact** **strings** reduce footprint versus older **char**[]-only layouts.'],
  ['What does a **Staff** engineer document after a performance win?', 'They store **before**/**after** **jstat** or **JFR** snippets, **git** **SHA**, **JVM** flags, and load parameters.', 'Future regressions become bisectable.', '**jcmd** **<pid>** **VM.system_properties** dumps flags alongside code version.', '**Java** **21** services should note **virtual** **thread** pool settings versus platform threads.']
];

function buildConceptual() {
  return CONCEPTUAL_Q.map(([q, a1, e2, c3, v4], i) => ({
    question: q,
    answer: ca(a1, e2, c3, v4),
    followUps: [fuProd(), fuTrap()]
  }));
}

const CB_QUESTIONS = [
  'What prints?\n```java\nclass P {\n  public static void main(String[] a) {\n    Integer x = 200;\n    Integer y = 200;\n    System.out.println(x == y);\n  }\n}\n```',
  'Output?\n```java\nclass Q {\n  public static void main(String[] a) {\n    String s = "";\n    for (int i = 0; i < 3; i++) s += i;\n    System.out.println(s.length());\n  }\n}\n```',
  'What prints?\n```java\nclass R {\n  public static void main(String[] a) {\n    long t0 = System.nanoTime();\n    int x = 0;\n    for (int i = 0; i < 1000; i++) x += i;\n    long t1 = System.nanoTime();\n    System.out.println(x > 0 ? "work" : "skip");\n  }\n}\n```',
  'Smell?\n```java\n// long sum = 0;\n// for (Integer v : list) sum += v;\n```',
  'Order?\n```java\nclass S {\n  static String a = init("A");\n  static String b = init("B");\n  static String init(String x) { return x; }\n  public static void main(String[] args) { System.out.println(a + b); }\n}\n```',
  'Flag?\n```java\n// -XX:+AlwaysPreTouch at JVM startup\n```',
  'Thread state?\n```java\nclass T {\n  public static void main(String[] a) {\n    Thread.yield();\n    System.out.println("yielded");\n  }\n}\n```',
  'Boxing?\n```java\nclass U {\n  public static void main(String[] args) {\n    Integer a1 = 100;\n    Integer b1 = 100;\n    System.out.println(a1 == b1);\n  }\n}\n```',
  'GC hint?\n```java\n// jstat -gc <pid> 1s\n```',
  'Profiler?\n```java\n// jcmd <pid> JFR.start duration=30s filename=rec.jfr\n```',
  'Map?\n```java\n// new HashMap from multiple writer threads without synchronization\n```',
  'JIT?\n```java\n// -XX:TieredStopAtLevel=1 quick dev JVM\n```'
];

const CB_TAIL =
  ' **Metaspace** still grows when **Spring** loads thousands of **BeanDefinition** classes, so **OutOfMemoryError** **Metaspace** can follow big refactors. Cross-check **JDK** **17** versus **21** **GC** defaults because **ZGC** **generational** mode changes pause histograms. When **p99** spikes, pair **jcmd** **Thread.print** with **JFR** **socket** **read** events before you blame **Postgres**.';

function cbAns(i) {
  const bodies = [
    '**Integer** **valueOf** caches **-128**..**127**, so **200** boxes distinct objects and **==** compares references, printing **false**. Production risk is using **==** on **Integer** fields from **JSON**. Use **Objects.equals** or **intValue**. **javap** **-c** on **Integer.valueOf** shows the cache. **Java** **17** behavior matches **11** for this cache range.',
    'Loop builds **String** **"012"** via **concatenation**, so **length** is **3**. Each **+** can allocate a new **String**; **JIT** may optimize small loops but allocation pressure remains in hot services. Prefer **StringBuilder** in hot paths. **jcmd** **GC.class_histogram** shows **String** churn. **Java** **21** **String** internals stay compact **byte**-backed.',
    'Loop accumulates **x** so it is positive; ternary prints **work**. **nanoTime** delta is not printed, so **JIT** cannot eliminate the loop entirely, but without **JMH** **Blackhole** other microbenchmarks still lie. **JMH** consumes results explicitly. **Java** **11**+ **C2** still optimizes aggressively.',
    '**Integer** in the enhanced **for** autoboxes each **int** from a primitive list or unboxes from **Integer** list; mixed misuse allocates heavily. **NullPointerException** can appear if list holds **null** **Integer**. **jcmd** **GC.class_histogram** shows **Integer** spikes. **Java** **8** streams still autobox unless you use **mapToInt**.',
    '**static** fields **a** then **b** initialize in declaration order, **println** prints **AB**. This mirrors **static** initializer order affecting **singleton** **JVM** flags. Wrong order can expose half-built config to **JIT**. **Java** **17** class initialization rules unchanged.',
    '**AlwaysPreTouch** forces the **JVM** to touch every **heap** page at startup so later **page** faults do not hit request path; it raises startup time and **RSS** early. Pair with **Kubernetes** **memory** limits carefully. Verify with **jcmd** **VM.flags**. **Java** **11**+ supports the flag on **HotSpot** server builds.',
    '**yield** hints the scheduler; **println** still runs and prints **yielded**. This is not a performance fix, just scheduling noise. Real contention shows **BLOCKED** in **jcmd** **Thread.print**. **Java** **21** **virtual** threads change scheduling semantics versus platform threads.',
    '**100** is inside **Integer** cache, so **==** may print **true** for this **JVM**. Relying on that is fragile; cache is implementation detail. Use **equals** for **Integer** **API** fields. **javap** shows **Integer.valueOf** usage from autoboxing. **Java** **17** cache rule same as **11**.',
    '**jstat** **-gc** prints **S0C**, **E**, **OC**, **YGC**, **YGCT** so you see **Young** collections per second. Rising **YGC** with flat traffic signals **allocation** bugs. Combine with **jcmd** **GC.heap_info**. Works on **Java** **8** through **21** with **jstat** from same **JDK** **bin**.',
    '**JFR.start** records **events** into **rec.jfr** for **JDK** **Mission** **Control** analysis. Use **duration** bounds to avoid giant files. **Java** **17** **JFR** is default-supported; **Java** **21** adds more **virtual** **thread** events you should enable explicitly.',
    '**HashMap** is not thread-safe for concurrent **put**; internal structure can corrupt and **get** may spin or misbehave. Use **ConcurrentHashMap**. Verify with stress **JUnit** and **jcmd** **Thread.print** under load. **Java** **17** **HashMap** treeifies buckets like **11**.',
    '**TieredStopAtLevel=1** stops at **C1**, speeding startup but leaving hot loops unoptimized until you remove the flag. Profiling **staging** with this flag misleads prod **C2** behavior. Compare **java** **-XX:+PrintCompilation** output. **Java** **21** tiered defaults still respect this knob.'
  ];
  return (bodies[i] || bodies[0]) + CB_TAIL;
}

function buildCodeBased() {
  return CB_QUESTIONS.map((q, i) => ({
    question: q,
    answer: cbAns(i),
    followUps: [
      { question: 'What breaks in **CI** if you ignore this behavior?', answer: fuProd().answer },
      { question: 'What **JVM** **performance** trap does this expose?', answer: fuTrap().answer }
    ]
  }));
}

function senior(q, body) {
  return {
    question: q,
    answer: body,
    followUps: [
      { question: 'How do you communicate **ETA**?', answer: fuProd().answer },
      { question: 'What **post-incident** item is mandatory?', answer: fuTrap().answer }
    ]
  };
}

const SENIOR_TAIL =
  '\n\nDeeper runbook: stash **async-profiler** **flame.html** next to **jstat** **-gc** **30** **line** **snapshots** and **JFR** **recording.jfr** because auditors compare artifacts. When **Kubernetes** **HPA** scales pods during capture, correlate **pid** changes in notes. If **Metaspace** climbs after deploy, compare **jcmd** **VM.native_memory** **summary** before and after **classloader** leaks. Record exact **java** **-version** and **-XX:** flags in the incident timeline so **Java** **21** **Generational** **ZGC** upgrades do not reopen the same ticket. After any fix, rerun the same load script for the same duration and paste **p99** from **Grafana** with UTC boundaries so leadership sees apples-to-apples proof. When threads wait on **java.net.SocketInputStream.read**, attach **tcpdump** or **service** mesh traces so you do not mislabel **I/O** wait as **GC**. Teach **on-call** to capture **jcmd** output before pods restart, because **Kubernetes** may replace the **pid** and erase evidence. Finally, file a short **postmortem** item that names the **root** **metric** you added so this failure mode becomes a chart instead of a memory.';

const SENIOR_BLOCK = (a, b, c, d) =>
  `**Immediate response:** ${a}\n\n**Root cause:** ${b}\n\n**Fix:** ${c}\n\n**Prevention:** ${d}\n\nStaff note: capture **jcmd** **<pid>** **Thread.print**, **jstat** **-gc** **-t** **<pid>** **1s** for two minutes, and **JFR** **jcmd** **JFR.dump** if a recording was running; attach **Grafana** **p99** screenshot with UTC window. Compare **GC.heap_info** before and after suspected fixes. Document **cgroup** **memory** **limit** beside **-Xmx** because **RSS** includes native **GC** buffers.${SENIOR_TAIL}`;

function buildSenior() {
  return [
    senior(
      '**p99** doubles after deploy; **CPU** dashboard flat; logs show no errors.',
      SENIOR_BLOCK(
        'Run **jcmd** **<pid>** **Thread.print** during the spike window and count **BLOCKED** threads versus **socketRead** stacks.',
        'Threads were **BLOCKED** on a **synchronized** **HashMap** used as a request cache while **GC** looked innocent.',
        'Replace with **ConcurrentHashMap** or shrink the critical section; redeploy and rerun the same load test.',
        'Add **ArchUnit** ban on **synchronized** **Map** in request path packages and **JFR** **Java** **Monitor** **Block** events in staging soak.'
      )
    ),
    senior(
      '**Grafana** shows **Young** **GC** **rate** tripled; **heap** usage barely grew.',
      SENIOR_BLOCK(
        'Take **jcmd** **<pid>** **GC.class_histogram** **all** during load and sort by **bytes**.',
        'Autoboxing **Integer** in a tight analytics loop allocated millions of **Integer** instances per minute.',
        'Switch inner loops to **int** accumulators and **mapToInt** streams; verify **YGC**/sec drops in **jstat**.',
        'Require **JMH** microbench for any shared math utility claiming "zero cost" and track **allocation** rate metric.'
      )
    ),
    senior(
      'Service **OOMKilled** in **Kubernetes** despite **-Xmx** set to eighty percent of pod limit.',
      SENIOR_BLOCK(
        'Run **jcmd** **<pid>** **VM.native_memory** **summary** inside the pod before death and note **GC** **malloc** lines.',
        '**RSS** included **GC** native buffers and **Metaspace** beyond **heap** **commit**; limit left no headroom.',
        'Lower **-Xmx** or raise pod **memory** limit with finance approval; set **-XX:MaxMetaspaceSize** intentionally.',
        'Document **JVM** **vs** **pod** **memory** budget template in platform **Terraform** modules.'
      )
    ),
    senior(
      '**Profiler** in **staging** points to method **foo**; **prod** flame graph shows **bar** hottest after same build.',
      SENIOR_BLOCK(
        'Diff **java** **-XX:+PrintFlagsFinal** output between **staging** and **prod** pods.',
        '**Staging** used **-XX:TieredStopAtLevel=1** for faster cold starts, skipping **C2** opts that reshaped hot code.',
        'Remove dev-only flags in non-prod environments that claim to mirror prod; rerun **60** minute soak with **JFR**.',
        'Add **CI** check that fails if required **JVM** **OPTIONS** env var missing in **Helm** values.'
      )
    ),
    senior(
      'After **Java** **21** **virtual** **threads** rollout, random **p99** spikes with low **CPU**.',
      SENIOR_BLOCK(
        'Start **JFR** with **jdk.VirtualThreadPinned** enabled and reproduce under load.',
        'Pinned carriers blocked on **synchronized** **legacy** **JDBC** driver code holding platform threads.',
        'Replace **synchronized** sections with **ReentrantLock** in that library path or move work to platform pool for those calls.',
        'Maintain a denylist of libraries known to pin; track upgrades in dependency bot with **JFR** gate.'
      )
    ),
    senior(
      '**Full** **GC** storms every few minutes; **Old** **Gen** nearly empty.',
      SENIOR_BLOCK(
        'Open **GC** logs with **-Xlog:gc*** and correlate **humongous** object warnings if using **G1**.',
        'Large **byte** arrays for **Base64** payloads bypassed normal region sizing and triggered frequent **mixed** collections.',
        'Stream payloads or chunk sizes below **G1** **HeapRegionSize** rules; verify **jstat** **FGC** count stabilizes.',
        'Add code review rule for **byte** array allocations larger than threshold with **allocation** profiling proof.'
      )
    )
  ];
}

const WRONG = [
  '**System.gc()** in production is the right first step whenever **heap** usage looks high.',
  'If **CPU** usage is low, the **JVM** cannot be the reason **p99** latency is bad.',
  '**JMH** benchmarks in **CI** are unnecessary if your **IDE** stopwatch test looked faster.',
  '**Increasing** **-Xmx** always fixes **OutOfMemoryError** **Java** **heap** **space**.',
  '**G1** **GC** pause problems are always solved by adding more **CPU** to the pod.',
  '**Profiling** on your laptop with one thread is enough proof for a fifty-pod **Kubernetes** deployment.',
  '**String** **intern** is a safe way to reduce **heap** usage for all user-generated text.',
  '**Virtual** **threads** remove the need to ever look at **thread** **pools** or **locks** again.'
];

function buildMcq() {
  const mk = (id, level, category, question, options, answer, explanation) => ({
    id,
    level,
    category,
    question,
    options,
    answer,
    explanation
  });
  const q = [];
  let id = 1;
  const B = (cat, question, o, a, e) => q.push(mk(id++, 'basic', cat, question, o, a, e));
  const I = (cat, question, o, a, e) => q.push(mk(id++, 'intermediate', cat, question, o, a, e));
  const A = (cat, question, o, a, e) => q.push(mk(id++, 'advanced', cat, question, o, a, e));

  B(
    'theory',
    'What does **JIT** stand for in the **JVM** context?',
    { A: 'Just-in-time **compiler**', B: 'Java **integration** **tool**', C: 'Joint **index** **table**', D: 'Jump **if** **true** opcode only' },
    'A',
    '**JIT** compiles hot **bytecode** to native code.'
  );
  B(
    'theory',
    'What is **JMH** mainly used for?',
    { A: '**Java** **microbenchmarks** with forked **JVM** discipline', B: '**JSON** message hashing', C: '**Kubernetes** health checks', D: '**Maven** dependency resolution' },
    'A',
    '**JMH** avoids **DCE** lies in tiny loops.'
  );
  B(
    'theory',
    'What does **GC** reclaim?',
    { A: 'Unreachable **heap** objects', B: '**CPU** registers only', C: '**Docker** layers', D: '**Git** branches' },
    'A',
    '**GC** frees **Java** **heap** memory.'
  );
  B(
    'theory',
    'What is **Metaspace**?',
    { A: '**Class** **metadata** storage off the normal **Java** **heap**', B: '**CPU** cache line', C: '**HTTP** header map', D: '**Gradle** daemon heap' },
    'A',
    '**Metaspace** replaced **PermGen** in modern **JDK** lines.'
  );
  B(
    'code',
    'What prints?\n```java\nclass X {\n  public static void main(String[] a) {\n    Integer x = 300;\n    Integer y = 300;\n    System.out.println(x == y);\n  }\n}\n```',
    { A: 'true', B: 'false', C: 'throws', D: '0' },
    'B',
    '**300** is outside **Integer** cache; **==** compares references.'
  );
  B(
    'code',
    'Output?\n```java\nclass Y {\n  public static void main(String[] a) {\n    System.out.println("a" + "b" == "ab");\n  }\n}\n```',
    { A: 'false always', B: 'true at runtime due to **String** constant folding in this case', C: 'compile error', D: 'null' },
    'B',
    'Literals fold to same **String** **pool** entry here.'
  );
  B(
    'code',
    'Smell?\n```java\nlong t0 = System.currentTimeMillis();\nfor (int i=0;i<1_000_000;i++) { /* hot */ }\nlong t1 = System.currentTimeMillis();\n```',
    { A: 'Perfect **JMH** replacement', B: 'No **warmup**, no **blackhole**, easy **JIT** to remove work', C: 'Required by **JDK** **21**', D: 'Measures **GC** pauses accurately' },
    'B',
    'Hand timing misleads; use **JMH**.'
  );
  B(
    'real-world',
    'Teammate tunes **-Xmx** before profiling. Best response?',
    { A: 'Capture **jcmd** **GC.heap_info** and **async-profiler** first', B: 'Always double **heap** blindly', C: 'Disable **GC**', D: 'Delete metrics' },
    'A',
    'Measure **allocation** and **locks** before **heap** churn.'
  );
  I(
    'theory',
    'Which command shows **GC** counters over time?',
    { A: '**jstat** **-gc**', B: '**javac** **-version**', C: '**jar** **tf**', D: '**jdeps** only' },
    'A',
    '**jstat** samples **YGC**/**FGC** intervals.'
  );
  I(
    'theory',
    'What does **JFR** record?',
    { A: 'Low-overhead **JVM** **events** timeline', B: 'Only **SQL** queries', C: '**Git** commits', D: '**CPU** temperature' },
    'A',
    '**JFR** correlates **GC**, **socket**, **allocation** bursts.'
  );
  I(
    'theory',
    'Why avoid **synchronized** **HashMap** under concurrent writes?',
    { A: 'Not thread-safe; structure can corrupt', B: 'It is always faster than **ConcurrentHashMap**', C: '**JDK** forbids it', D: 'It disables **JIT**' },
    'A',
    'Use **ConcurrentHashMap** for concurrent **put**.'
  );
  I(
    'theory',
    'What is **allocation** pressure?',
    { A: 'High rate of short-lived object creation', B: 'Disk **I/O** only', C: '**TLS** handshake cost', D: '**Maven** download speed' },
    'A',
    'Pressure raises **Young** **GC** frequency.'
  );
  I(
    'code',
    'What prints?\n```java\nclass Z {\n  public static void main(String[] a) {\n    int s = 0;\n    for (Integer i : java.util.List.of(1,2,3)) s += i;\n    System.out.println(s);\n  }\n}\n```',
    { A: '0', B: '6', C: 'throws NPE', D: 'compile error' },
    'B',
    'Unboxing sums to **6**.'
  );
  I(
    'code',
    'Issue?\n```java\nMap<String,String> m = new HashMap<>();\n// two threads call m.put concurrently\n```',
    { A: 'Always safe', B: '**HashMap** not safe for concurrent writes', C: 'Requires **volatile** only', D: 'Only fails on **Java** **8**' },
    'B',
    'Use **ConcurrentHashMap** or external sync.'
  );
  I(
    'code',
    'Hint?\n```java\n// jcmd <pid> Thread.print\n```',
    { A: 'Shows stack traces and lock info', B: 'Deletes threads', C: 'Compiles project', D: 'Starts **GC** always' },
    'A',
    '**jcmd** **Thread.print** is first **on-call** grab.'
  );
  I(
    'code',
    'Profiler?\n```java\n// async-profiler -e cpu -d 30 -f out.html <pid>\n```',
    { A: 'Samples **CPU** stacks into **flame** graph', B: 'Formats disk', C: 'Runs **unit** tests', D: 'Patches **JDK**' },
    'A',
    '**async-profiler** attaches to **HotSpot**.'
  );
  I(
    'code',
    'GC log?\n```java\n// -Xlog:gc*:file=gc.log:time,uptime,level,tags\n```',
    { A: 'Unified **GC** logging on modern **JDK**', B: 'Disables **GC**', C: 'Only **Java** **8**', D: 'Prints SQL' },
    'A',
    '**-Xlog** is the modern **JDK** **GC** log switch.'
  );
  I(
    'theory',
    'Why match **JDK** in **staging** and **prod** for profiles?',
    { A: '**JIT** and **intrinsics** differ by version', B: 'No reason', C: '**Docker** requires it', D: '**Maven** enforces it' },
    'A',
    'Different **JDK** reorders hot methods.'
  );
  I(
    'theory',
    'What is **safepoint** polling about?',
    { A: 'Threads must reach **safepoint** for some **JVM** work', B: '**HTTP** keepalive', C: '**Git** merge', D: '**SQL** isolation' },
    'A',
    'Long **safepoint** waits hurt latency.'
  );
  I(
    'theory',
    'What does **Wall** clock measure?',
    { A: 'Elapsed real time users feel', B: 'Only **CPU** cycles', C: '**Git** clone time', D: '**IDE** indexing' },
    'A',
    'Pair with **CPU** profiles for full picture.'
  );
  A(
    'theory',
    'Which collector targets low-latency concurrent collection in modern **JDK**?',
    { A: '**ZGC**', B: 'Serial only forever', C: '**PermGen** collector', D: '**MS-DOS** heap' },
    'A',
    '**ZGC** trades different overheads; know your **JDK** version story.'
  );
  A(
    'theory',
    'Before **Java** **21** **virtual** **threads**, what event helps detect pinning?',
    { A: '**JFR** **jdk.VirtualThreadPinned**', B: '**javac** **lint**', C: '**jdeps**', D: '**jar** **sign**' },
    'A',
    'Enable pin events when migrating.'
  );
  A(
    'code',
    '**Integer** **==** on **api** fields. Safer?',
    { A: '**Objects.equals**', B: 'Always **==**', C: '**String.intern**', D: '**Thread.sleep**' },
    'A',
    'Avoid reference **==** on boxed values.'
  );
  A(
    'on-call',
    '**p99** up, **CPU** flat, many **BLOCKED** threads. First fix pattern?',
    { A: 'Shrink lock scope or change lock-free structure', B: 'Double **-Xmx** only', C: 'Add **System.gc**', D: 'Disable profiling' },
    'A',
    'Contention is not fixed by **heap** alone.'
  );
  A(
    'on-call',
    'Pod **OOMKilled** with **-Xmx** 90% of limit. Likely issue?',
    { A: 'Native **GC** **RSS** headroom missing', B: 'Too small **Git** repo', C: '**JUnit** slow', D: 'Wrong **log4j** level' },
    'A',
    'Reserve **RSS** beyond **heap** **commit**.'
  );
  A(
    'on-call',
    '**YGC**/sec tripled after deploy. First proof command?',
    { A: '**jcmd** **GC.class_histogram**', B: '**format** **C:**', C: '**ping**', D: '**rm** **-rf**' },
    'A',
    'Find allocation hot types.'
  );
  A(
    'on-call',
    '**Staging** profile useless vs **prod**. Check?',
    { A: '**TieredStopAtLevel** or other dev-only flags', B: '**IDE** theme', C: '**Docker** **buildx** only', D: '**Git** **LFS**' },
    'A',
    'Align **JVM** flags across environments.'
  );
  A(
    'on-call',
    '**Metaspace** **OOM** after many hot redeploys. Suspect?',
    { A: '**Classloader** leak retaining old classes', B: 'Too many **println**', C: '**Integer** cache', D: '**String** **pool** full' },
    'A',
    'Inspect **classloader** retention with **heap** dump.'
  );
  A(
    'on-call',
    'Need timeline of **socket** **read** + **GC**. Tool?',
    { A: '**JFR** recording analyzed in **JMC**', B: '**javap** only', C: '**tar**', D: '**wc**' },
    'A',
    '**JFR** correlates subsystems.'
  );
  A(
    'code',
    'Risk?\n```java\n// Production JVM opts: -XX:TieredStopAtLevel=1 -Xmx512m\n// Load test uses same jar against 4 vCPU prod-like host.\n```',
    {
      A: '**Profiling** may show different hot methods than prod **C2** after warm **JIT**',
      B: 'Guarantees identical **GC** pause times forever',
      C: 'Forces **ZGC** off',
      D: 'Disables **String** **pool**'
    },
    'A',
    'Dev **tier** caps mislead **CPU** **flame** graphs until flags match real **JVM** **OPTIONS**.'
  );

  return q;
}

const CHEATSHEET = `| Level | Concept | The rule in one line | Example or Command |
|-------|---------|----------------------|--------------------|
| Fresher | **JIT** | Hot code becomes native after **warmup** | watch second run shrink in **nanoTime** demo |
| Fresher | **GC** | Reclaims unreachable **heap** objects | read **YGC** in **jstat** **-gc** **<pid>** **1s** |
| Fresher | **Profiler** | Samples **CPU** or **alloc** stacks | **async-profiler** **-e** **cpu** **-d** **30** **<pid>** |
| Senior Dev | **JMH** | Honest microbench with **fork** + **Blackhole** | **mvn** **-pl** **benchmarks** **test** |
| Senior Dev | **Wall** vs **CPU** | Users feel **wall**; **CPU** can look idle under **locks** | **jcmd** **Thread.print** |
| Senior Dev | **Allocation** pressure | Short-lived objects fill **Eden** | **jcmd** **GC.class_histogram** **all** |
| Senior Dev | **DCE** | **JIT** drops unused math | never trust **main** loop timing alone |
| Tech Lead | **JFR** | Low-overhead timeline of **JVM** events | **jcmd** **<pid>** **JFR.start** **duration**=60s |
| Tech Lead | **Review** rule | No "faster" **PR** without numbers | attach **flame** + **jstat** snippet |
| Tech Lead | **Flag** parity | **staging** must match prod **JVM** flags | **-XX:+PrintFlagsFinal** diff |
| Staff | **RSS** vs **heap** | **OOMKilled** when **native** + **heap** exceed cgroup | **jcmd** **VM.native_memory** **summary** |
| Staff | **JDK** match | **JIT** order differs by **Java** **21** vs **17** | **java** **-version** in ticket |
| Staff | **Virtual** **threads** | **Pinning** shows in **JFR** events | **jdk.VirtualThreadPinned** on **21** |`;

export function buildDay88Sections() {
  const basic = buildBasicCode();
  const mid = buildMidCode();
  const adv = buildAdvCode();
  return [
    { type: 'why', title: 'Why JVM Performance and Profiling matters', content: buildWhy() },
    { type: 'theory', title: 'Theory and Internals — JVM Performance and Profiling', content: buildTheoryContent() },
    {
      type: 'code',
      title: 'Basic — JVM performance reference card',
      language: 'java',
      filename: 'Day88Basic.java',
      level: 'basic',
      description: 'Print-only vocabulary: JIT, GC, profilers, and first commands.',
      code: basic.code,
      output: basic.output
    },
    {
      type: 'code',
      title: 'Intermediate — Four JVM performance incidents',
      language: 'java',
      filename: 'Day88Intermediate.java',
      level: 'intermediate',
      description: 'Senior narration: hand benchmarks, GC noise, allocation, JVM flag drift.',
      code: mid.code,
      output: mid.output
    },
    {
      type: 'code',
      title: 'Advanced — Latency triage matrix (Tech Lead + Staff)',
      language: 'java',
      filename: 'Day88Advanced.java',
      level: 'advanced',
      description: 'Maps metrics signals to async-profiler, jcmd, and jstat actions.',
      code: adv.code,
      output: adv.output
    },
    {
      type: 'diagram',
      title: 'JVM profiling workflow',
      diagramType: 'component',
      description: 'Reproduce load, attach profiler or JFR, read jstat, decide fix.',
      plantuml:
        '@startuml\ntitle Day 88 — JVM profiling\nactor Engineer\nparticipant LoadGen\nparticipant JVM\nparticipant Profiler\nLoadGen -> JVM : steady traffic\nEngineer -> Profiler : attach sample\nProfiler -> JVM : stacks / alloc\nJVM -> Engineer : jstat GC counters\nEngineer -> Engineer : hypothesis + fix\n@enduml'
    },
    { type: 'pitfalls', title: 'Common Pitfalls', items: PITFALLS },
    {
      type: 'exercise',
      title: 'Exercise — JVM vocabulary (fresher)',
      audience: 'fresher',
      difficulty: 'Beginner',
      problem:
        'You are writing your first **Java** program to memorize **JVM** **performance** words you will see in **Grafana** and **Slack**.\n\n1. Create **arch.day88.Day88FresherExercise** with **main**.\n2. Print one line that explains what **JIT** does in plain words.\n3. Print one line that explains what **GC** does.\n4. Print one line that says why **JMH** matters compared to a **nanoTime** loop in **main**.',
      hints: [
        'Keep every teaching line in a **final** **String** constant.',
        'Use only **System.out.println** so the exercise stays copy-safe.',
        'Mention **warmup** or **dead** **code** when you talk about **JMH**.'
      ],
      solution: `package arch.day88;

/** Fresher drill: say JIT, GC, and JMH out loud before you tune -Xmx. */
public class Day88FresherExercise {

    public static void main(String[] args) {
        // args ignored so classmates get identical stdout when they run your jar.
        final String jitLine = "JIT compiles hot bytecode to native code after the JVM sees enough calls.";
        // jitLine connects Grafana CPU to something the JVM actually does over time.
        System.out.println(jitLine);
        final String gcLine = "GC reclaims unreachable heap objects so new allocations keep working.";
        // gcLine stops juniors from thinking Java frees memory like C malloc/free.
        System.out.println(gcLine);
        final String jmhLine = "JMH forks JVMs and uses blackholes so JIT cannot delete your benchmark work.";
        // jmhLine is the honest answer when someone shows a main() stopwatch PR.
        System.out.println(jmhLine);
        final String wallLine = "Wall clock is what users feel; CPU percent alone does not explain p99.";
        // wallLine prevents blaming GC when threads are BLOCKED on locks.
        System.out.println(wallLine);
        final String jcmdLine = "jcmd Thread.print shows BLOCKED threads and lock owners during spikes.";
        // jcmdLine is the first command you paste when latency jumps and logs are quiet.
        System.out.println(jcmdLine);
        final String jstatLine = "jstat -gc pid 1s prints YGC counts so you see allocation storms.";
        // jstatLine pairs numeric proof with stories about Young Gen flooding.
        System.out.println(jstatLine);
        final String flameLine = "async-profiler turns CPU samples into a flame graph of hot Java frames.";
        // flameLine names the artifact you attach to incident tickets.
        System.out.println(flameLine);
        final String jfrLine = "JFR records low-overhead JVM events you open later in JDK Mission Control.";
        // jfrLine contrasts timeline thinking with one-off println debugging.
        System.out.println(jfrLine);
        final String allocLine = "Allocation pressure means too many short-lived objects fill Eden each second.";
        // allocLine links micro code style to macro GC charts.
        System.out.println(allocLine);
        final String metaspaceLine = "Metaspace holds class metadata off-heap; classloader leaks blow it up.";
        // metaspaceLine explains OutOfMemoryError Metaspace without blaming the Java heap.
        System.out.println(metaspaceLine);
        final String zgcLine = "ZGC targets low pause times; always name your collector in postmortems.";
        // zgcLine reminds you GC stories differ between Java 17 and 21 builds.
        System.out.println(zgcLine);
        final String pinLine = "Virtual threads can pin on synchronized JDBC; JFR shows VirtualThreadPinned.";
        // pinLine is the Java 21 footnote interviewers expect after Loom rollouts.
        System.out.println(pinLine);
    }
}
`
    },
    {
      type: 'exercise',
      title: 'Exercise — Production profiling triage (staff)',
      audience: 'staff',
      difficulty: 'Advanced',
      problem:
        '**Checkout** **p99** doubled after a deploy. **CPU** is flat, **heap** usage looks normal, and logs show no **exception**.\n\n1. Model three pods **p-1**, **p-2**, **p-3** as **record** values with booleans **cpuHot**, **allocStorm**, **gcPause** (set any mix you like but keep at least one true per pod).\n2. Print each pod summary on its own line.\n3. Build a **LinkedHashMap** from pattern key **cpu_hot**, **alloc_storm**, **gc_pause** to the first **String** command you would run (**async-profiler**, **jcmd** **GC.class_histogram**, **jstat**, etc.).\n4. Print the map in order.\n5. Print one line stating why **jcmd** **Thread.print** still matters when **CPU** looks idle.',
      hints: [
        'Keep commands as string literals; you are teaching the runbook, not shelling out.',
        'Use **LinkedHashMap** so stdout order matches escalation narrative.',
        'Mention **BLOCKED** versus **RUNNABLE** when you defend **Thread.print**.'
      ],
      solution: `package arch.day88;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Staff exercise: deterministic triage model for JVM latency without live network I/O.
 * Reasoning: metrics labels are ambiguous until you pair thread state, allocation, and GC counters.
 */
public class Day88StaffExercise {

    record PodSignal(String pod, boolean cpuHot, boolean allocStorm, boolean gcPause) {}

    public static void main(String[] args) {
        // Three pods mirror a Grafana row where each symptom hints a different first command.
        PodSignal p1 = new PodSignal("p-1", true, false, false);
        PodSignal p2 = new PodSignal("p-2", false, true, false);
        PodSignal p3 = new PodSignal("p-3", false, false, true);

        // Printing booleans first forces readers to connect labels to hypotheses before commands.
        System.out.println("=== Pod signals ===");
        System.out.println(
            p1.pod() + " cpuHot=" + p1.cpuHot() + " allocStorm=" + p1.allocStorm() + " gcPause=" + p1.gcPause());
        System.out.println(
            p2.pod() + " cpuHot=" + p2.cpuHot() + " allocStorm=" + p2.allocStorm() + " gcPause=" + p2.gcPause());
        System.out.println(
            p3.pod() + " cpuHot=" + p3.cpuHot() + " allocStorm=" + p3.allocStorm() + " gcPause=" + p3.gcPause());

        // LinkedHashMap encodes the on-call decision tree in stable order for copy-paste runbooks.
        Map<String, String> firstAction = new LinkedHashMap<>();
        firstAction.put("cpu_hot", "async-profiler -e cpu -d 30 -f flame.html <pid>");
        firstAction.put("alloc_storm", "jcmd <pid> GC.class_histogram all");
        firstAction.put("gc_pause", "jstat -gc -t <pid> 1s for 30 samples");

        System.out.println("=== First command per pattern ===");
        for (Map.Entry<String, String> e : firstAction.entrySet()) {
            System.out.println(e.getKey() + " -> " + e.getValue());
        }

        // Thread.print rationale: low CPU with bad p99 often means lock or I/O wait, not missing MHz.
        System.out.println("=== Thread state note ===");
        System.out.println(
            "jcmd Thread.print still matters when CPU is flat because BLOCKED threads wait on monitors or sockets.");

        // JFR bridges timeline and code: Staff engineers attach artifacts, not opinions.
        System.out.println("=== Correlation note ===");
        System.out.println("Pair JFR 60s with the same load window as jstat so GC spikes line up with code.");

        // Flag drift is a recurring postmortem theme when staging uses TieredStopAtLevel=1.
        System.out.println("=== JVM flag note ===");
        System.out.println("Diff java -XX:+PrintFlagsFinal between staging and prod before trusting any flame graph.");

        // Native memory explains OOMKilled when heap charts look fine — RSS includes more than -Xmx.
        System.out.println("=== Native memory note ===");
        System.out.println("jcmd VM.native_memory summary belongs in the bundle when Kubernetes OOMKills the pod.");

        // Version-specific behavior prevents re-opening tickets after JDK upgrades.
        System.out.println("=== JDK version note ===");
        System.out.println("Record java -version in the ticket because Java 21 virtual thread pinning changes tail latency.");

        // Prevention converts one firefight into a platform guardrail other teams inherit.
        System.out.println("=== Prevention ===");
        System.out.println("Require Grafana panels for YGC rate plus p99 and block deploy if baseline regresses.");

        // JMH gate stops library authors from shipping folklore micro-optimizations.
        System.out.println("=== Library gate ===");
        System.out.println("Shared utils that claim speedups must ship a JMH module with forked benchmarks.");

        // Escalation bundle reduces back-and-forth when leadership asks what evidence exists.
        System.out.println("=== Escalation bundle ===");
        System.out.println("Attach flame.html, jstat snippet, JFR file, and cgroup memory limit next to -Xmx.");
    }
}
`
    },
    {
      type: 'interview',
      title: 'Interview Drill — JVM Performance and Profiling',
      conceptual: buildConceptual(),
      codeBased: buildCodeBased(),
      seniorScenario: buildSenior(),
      wrongAnswers: WRONG,
      jobSwitch: {
        resumeBullet:
          'Profiled checkout with async-profiler and cut p99 stalls forty percent after fixing map contention.',
        interviewPositioning:
          'When I join a service team I treat flat **CPU** with bad **p99** as a thread-state problem first, not a mystery **GC** ghost. In week one I add **jcmd** **Thread.print** and **jstat** **-gc** snippets to the **runbook**, and I verify **staging** **JVM** flags match **prod** before anyone trusts a **flame** **graph**.',
        starAnchor:
          'Situation: **checkout** **p99** jumped after a cache "optimization" shipped. Task: prove whether **GC** or **locks** caused it without a week-long rewrite. Action: I captured **async-profiler** **CPU** samples, found **synchronized** **HashMap** contention, swapped in **ConcurrentHashMap**, and stored **before**/**after** **jstat** lines in the **PR**. Result: **p99** returned to eighty milliseconds within forty-eight hours and **on-call** pages for that path stayed **zero** for seven months.'
      }
    },
    {
      type: 'mcq',
      title: 'MCQ — JVM Performance and Profiling',
      description: 'Thirty questions across basic, intermediate, and advanced JVM profiling levels.',
      questions: buildMcq()
    },
    { type: 'cheatsheet', title: 'Cheatsheet — JVM Performance and Profiling', content: CHEATSHEET }
  ];
}

