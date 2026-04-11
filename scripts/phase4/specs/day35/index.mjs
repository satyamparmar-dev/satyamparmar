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

const why = `Advanced concurrency in Java is less about memorizing every class in java.util.concurrent and more about knowing which primitive matches your invariant. Locks give you mutual exclusion; atomics give you wait-free updates for single words; concurrent collections give you scalable reads and controlled writes; executors give you lifecycle and backpressure knobs. Senior interviews reward the ability to pick one without turning the system into a Rube Goldberg machine.

ReentrantLock shines when you need tryLock with timeouts or lockInterruptibly for cancellable tasks. That shows up in shutdown paths where threads must not wedge forever. If you cannot explain why finally unlock matters, interviewers worry you have never debugged a production lock leak.

LongAdder and high-performance counters matter in metrics pipelines and rate limiters. Understanding striping and eventual sum is part of reading JDK code and vendor libraries intelligently. It also keeps you from using synchronized around a hot global counter that becomes a serialization bottleneck.

Thread pools are not fire-and-forget. Fixed pools with unbounded queues hide overload until garbage piles up. CallerRuns can be a deliberate safety valve or an accidental latency bomb. Production ownership means you can read a ThreadPoolExecutor graph in metrics and decide whether to scale, tune, or fix upstream.

ForkJoin and common pool interactions with parallel streams and CompletableFuture defaults are a modern footgun. Blocking inside a shared pool can stall unrelated work. Virtual threads reduce the need for thread hoarding but do not remove contention on shared mutable state or pinning risks.

On call, pool exhaustion and queue growth charts are often the first hint of a concurrency design problem. Your story should include thread dumps, identifying which pool and which task class, then a bounded fix with validation and a rollback.`;

const pitfalls = [
  "**Lock without unlock in finally** — hung threads; always finally.",
  "**Unbounded LinkedBlockingQueue** — memory blowups under spikes.",
  "**Blocking in common ForkJoin pool** — stalls unrelated work.",
  "**Recursive computeIfAbsent** — lock nesting deadlock in CHM.",
  "**Fair locks by default** — unnecessary throughput loss.",
  "**Ignoring rejection policy** — silent task loss or thread explosion.",
  "**CopyOnWrite for write-heavy** — massive copying cost.",
  "**Assuming volatile makes structures thread-safe** — false.",
];

const exercise = {
  title: "Practice exercise",
  difficulty: "Intermediate",
  problem: `**Day 35 — Advanced concurrency (assignment alignment)**

1. Use **AtomicInteger** with **two threads** each incrementing **5000** times; print **atomic_total** line with final value.
2. Use **synchronized** on a shared **int** counter with the same thread pattern; print **sync_total** line.
3. Both totals must read **10000** when run on a correct JVM.
4. Use **arch.day35** package and class **Day35Exercise**.`,
  hints: [
    "Atomic: Runnable loop incrementAndGet 5000 times.",
    "Synchronized: synchronized(lock){ box[0]++; } in loop.",
    "Join threads before printing each line.",
  ],
  solution: String.raw`package arch.day35;

public class Day35Exercise {

    public static void main(String[] args) throws Exception {
        java.util.concurrent.atomic.AtomicInteger ai = new java.util.concurrent.atomic.AtomicInteger();
        Runnable rAtomic =
                () -> {
                    for (int i = 0; i < 5000; i++) {
                        ai.incrementAndGet();
                    }
                };
        Thread a1 = new Thread(rAtomic);
        Thread a2 = new Thread(rAtomic);
        a1.start();
        a2.start();
        a1.join();
        a2.join();
        System.out.println("atomic_total=" + ai.get());

        final Object lock = new Object();
        int[] box = { 0 };
        Runnable rSync =
                () -> {
                    for (int i = 0; i < 5000; i++) {
                        synchronized (lock) {
                            box[0]++;
                        }
                    }
                };
        Thread s1 = new Thread(rSync);
        Thread s2 = new Thread(rSync);
        s1.start();
        s2.start();
        s1.join();
        s2.join();
        System.out.println("sync_total=" + box[0]);
    }
}
`,
};

const cheatsheetRows = [
  ["ReentrantLock", "tryLock", "timeout"],
  ["Condition", "await/signal", "bounded buf"],
  ["Atomic*", "CAS", "hot counter"],
  ["LongAdder", "striped", "sum"],
  ["CHM", "concurrent map", "avoid recursion"],
  ["BlockingQueue", "put take", "backpressure"],
  ["Semaphore", "permits", "limit"],
  ["RWLock", "read shared", "write excl"],
  ["StampedLock", "optimistic", "care"],
  ["ForkJoin", "work steal", "no block"],
  ["Executor", "lifecycle", "metrics"],
  ["CallerRuns", "slow submit", "safety"],
  ["Scheduled", "delay", "rate"],
  ["Phaser", "dynamic", "barrier"],
  ["CopyOnWrite", "read heavy", "rare write"],
];

export default {
  title: "Advanced Concurrency",
  tags: ["Mid-Level", "Intermediate", "Phase 4", "Interview Prep", "Satyverse(Satyam Parmar)"],
  prerequisites: ["Day 34", "Day 33"],
  learningObjectives: [
    "Choose between locks, atomics, and concurrent collections deliberately",
    "Configure executors with bounded queues and rejection policies",
    "Avoid ForkJoin and common pool blocking hazards",
    "Apply LongAdder, StampedLock, and advanced juc types where justified",
    "Instrument and troubleshoot pool exhaustion in production",
    "Relate advanced primitives to virtual threads and pinning",
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
  mcqLabel: "Advanced Concurrency",
  mcqDescription: "Thirty questions on juc locks, atomics, pools, queues, and hazards.",
  mcqQuestions,
  cheatsheetRows,
};
