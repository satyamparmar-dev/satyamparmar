import { theoryTitle, theoryBase } from "./theory.mjs";
import {
  basicCode,
  basicOutput,
  intermediateCode,
  intermediateOutput,
  advancedCode,
  advancedOutput,
} from "./codes.mjs";
import diagram from "./diagram.mjs";
import mcqQuestions from "./mcq.mjs";
import interview from "./interview.mjs";

const why = `The JVM is not a black box you appease with random flags. It is a runtime with observable memory regions, compilation pipelines, and garbage collectors that make explicit trade-offs between throughput, pause times, and operational complexity. Interviews reward candidates who connect symptoms like long tail latency to measurable GC pauses or allocation rates, not candidates who memorize every collector switch.

Understanding heap versus stack is foundational for reading stack traces, sizing thread pools, and debugging OutOfMemoryError messages that are actually native buffer leaks. Runtime snapshot methods are coarse, but they are still useful for quick sanity checks in exercises and for teaching what “committed heap” means compared to max.

Garbage collection is the classic trade-off problem. A collector that maximizes application throughput may produce unacceptable pause times for interactive services. A collector that minimizes pauses may burn more CPU and complicate tuning. Senior answers name the metrics they would capture before changing flags: allocation rate, promotion failures, pause histograms, and the business SLO.

Metaspace and class loader leaks still appear in production when frameworks generate proxies endlessly. Your story should include watching Metaspace growth, mapping it to dynamic class generation, and fixing the root cause instead of raising limits forever.

On call, JVM issues often overlap with container limits and noisy neighbors. You should be able to read cgroup memory pressure alongside JVM logs, explain why an application was OOM killed despite a seemingly generous Xmx, and propose a bounded experiment with monitoring rather than blind flag changes.`;

const pitfalls = [
  "**Tuning without metrics** — random Xmx/GC flags; measure first.",
  "**Ignoring native memory** — direct buffers metaspace thread stacks off-heap.",
  "**System.gc in production** — STW surprise; remove abuse.",
  "**Huge single heap** — long pauses; consider architecture split.",
  "**Classloader leaks** — Metaspace OOM; fix proxy caches.",
  "**Assuming freeMemory exact** — numbers fluctuate; use beans/JFR.",
  "**StackOverflow misread as heap OOM** — different fixes.",
  "**JDK upgrade default GC change** — retest latency assumptions.",
];

const exercise = {
  title: "Practice exercise",
  difficulty: "Intermediate",
  problem: `**Day 37 — JVM internals and GC (assignment alignment)**

1. Use **Runtime.getRuntime()** to read **maxMemory**, **totalMemory**, and **freeMemory**.
2. Compute **used = total - free** (as **long**).
3. Print four lines with labels **max=**, **total=**, **free=**, **used=** (numeric values ok).
4. Print a fifth line **explain=** with a short plain-text meaning: **max** is JVM heap ceiling, **used** is current bytes in use snapshot.`,
  hints: [
    "long max = rt.maxMemory(); same for total/free.",
    "String concatenation to println is fine for the exercise.",
    "Package arch.day37, class Day37Exercise.",
  ],
  solution: String.raw`package arch.day37;

public class Day37Exercise {

    public static void main(String[] args) {
        Runtime rt = Runtime.getRuntime();
        long max = rt.maxMemory();
        long total = rt.totalMemory();
        long free = rt.freeMemory();
        long used = total - free;
        System.out.println("max=" + max);
        System.out.println("total=" + total);
        System.out.println("free=" + free);
        System.out.println("used=" + used);
        System.out.println(
                "explain=max is JVM heap ceiling; used is current heap bytes in use (snapshot)");
    }
}
`,
};

const cheatsheetRows = [
  ["Heap", "objects", "shared"],
  ["Stack", "frames", "per thread"],
  ["JIT", "compile hot", "tiered"],
  ["GC", "reclaim", "pauses"],
  ["STW", "mutators pause", "latency"],
  ["G1", "regions", "default svc"],
  ["ZGC", "low pause", "big heaps"],
  ["Metaspace", "classes", "native"],
  ["Xmx", "heap max", "cap"],
  ["TLAB", "alloc buffer", "per thread"],
  ["Safepoint", "coordination", "VM ops"],
  ["NMT", "native track", "leaks"],
  ["JFR", "events", "profile"],
  ["Reference", "weak soft", "GC"],
  ["finalize", "avoid", "non-deterministic"],
];

export default {
  title: "JVM Internals and GC",
  tags: ["Mid-Level", "Intermediate", "Phase 4", "Interview Prep", "Satyverse(Satyam Parmar)"],
  prerequisites: ["Day 36", "Day 35"],
  learningObjectives: [
    "Explain heap, stack, Metaspace, and JIT at interview depth",
    "Interpret Runtime memory snapshots and related limitations",
    "Compare GC goals and select tuning strategies backed by metrics",
    "Recognize classloader, native, and container memory failure modes",
    "Use observability tools like JFR and jcmd in troubleshooting stories",
    "Avoid harmful tuning superstitions in production",
  ],
  why,
  theoryTitle,
  theoryBase,
  basicCode,
  basicOutput,
  intermediateCode,
  intermediateOutput,
  advancedCode,
  advancedOutput,
  diagram,
  pitfalls,
  exercise,
  interview,
  mcqLabel: "JVM Internals and GC",
  mcqDescription: "Thirty questions on memory model basics, GC, JIT, and diagnostics.",
  mcqQuestions,
  cheatsheetRows,
};
