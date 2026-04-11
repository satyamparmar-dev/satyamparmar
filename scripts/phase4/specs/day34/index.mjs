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

const why = `Concurrency is where correct-looking code becomes wrong code under load. The Java Memory Model is not trivia for certification; it is the contract that lets you reason about what one thread can observe after another thread publishes data. Interviews probe whether you can name real happens-before edges, not recite acronyms.

Most production bugs are not exotic lock algorithms. They are simple races on counters, flags, or cache maps that worked in tests because timing was kind. synchronized and volatile are not interchangeable spells; they solve different problems, and using the wrong one creates either performance collapse or silent corruption.

Deadlock is the classic interview story because it is easy to diagram and painful in operations. The fix is often boring: consistent lock ordering, smaller critical sections, and higher-level abstractions like concurrent queues that encapsulate invariants. Senior answers mention how you would detect deadlock in a thread dump and how you would validate a fix under stress.

Executor frameworks exist because thread-per-request does not scale. You should understand lifecycle methods, rejection policies, and why an unbounded queue can hide backpressure until the JVM falls over. That operational angle is what separates tutorial threading from service ownership.

Virtual threads change economics but not the rules of shared mutable state. Pinning and carrier pool exhaustion are the new watch items. You should be able to explain when synchronized or native code still blocks a carrier and how to structure IO so virtual threads deliver their promise.

On call, thread pool queue depth, GC pauses elongating lock holds, and retry storms amplifying contention all tie back to these foundations. Your narrative should connect metrics to thread dumps, then to a concrete code or configuration change with a rollback plan.`;

const pitfalls = [
  "**Using volatile for i++** — race remains; use Atomics or synchronized.",
  "**Inconsistent lock order** — deadlock; define global ordering.",
  "**Ignoring InterruptedException** — broken cancellation; restore or exit.",
  "**Cached pool + blocking tasks** — thread explosion; bound and segregate.",
  "**Shared SimpleDateFormat** — not thread-safe; use DateTimeFormatter.",
  "**HashMap from parallel threads** — corrupt map; use ConcurrentHashMap.",
  "**ThreadLocal without remove in pools** — memory leak; clean up.",
  "**join without timeout in shutdown** — hung service; use awaitTermination.",
];

const exercise = {
  title: "Practice exercise",
  difficulty: "Intermediate",
  problem: `**Day 34 — Concurrency foundations (assignment alignment)**

1. In comments, state the classic **deadlock** pattern when **Thread1** locks **A then B** while **Thread2** locks **B then A**.
2. Implement **two threads** that each loop **1000** times incrementing a **shared int** protected by **nested synchronized** blocks on **lockA** then **lockB** in **that order only** for both threads.
3. **join** both threads and print the **final count** (expect **2000**).
4. Print one line **ordered_locks_ok** after the count.`,
  hints: [
    "Use final Object lockA = new Object(); final Object lockB = new Object();",
    "Same Runnable for both threads; synchronized(lockA){ synchronized(lockB){ c[0]++; } }",
    "Package arch.day34, class Day34Exercise.",
  ],
  solution: String.raw`package arch.day34;

public class Day34Exercise {

    public static void main(String[] args) throws Exception {
        // Classic deadlock if Thread1: lockA->lockB and Thread2: lockB->lockA (AB-BA cycle).
        final Object lockA = new Object();
        final Object lockB = new Object();
        int[] c = { 0 };
        Runnable r =
                () -> {
                    for (int i = 0; i < 1000; i++) {
                        synchronized (lockA) {
                            synchronized (lockB) {
                                c[0]++;
                            }
                        }
                    }
                };
        Thread t1 = new Thread(r);
        Thread t2 = new Thread(r);
        t1.start();
        t2.start();
        t1.join();
        t2.join();
        System.out.println(c[0]);
        System.out.println("ordered_locks_ok");
    }
}
`,
};

const cheatsheetRows = [
  ["happens-before", "visibility order", "JMM"],
  ["synchronized", "mutual exclusion", "monitor"],
  ["volatile", "visibility", "not i++"],
  ["race", "unsync rw", "undefined"],
  ["deadlock", "cycle waits", "lock order"],
  ["Executor", "pool", "reuse"],
  ["shutdown", "stop accept", "drain"],
  ["interrupt", "cooperative", "policy"],
  ["join", "wait thread", "hb"],
  ["Atomic*", "CAS", "lock-free"],
  ["ConcurrentHashMap", "segments/bins", "safe"],
  ["ReentrantLock", "tryLock", "flexible"],
  ["RWLock", "many readers", "one writer"],
  ["Semaphore", "permits", "throttle"],
  ["Latch", "one-shot wait", "barrier start"],
];

export default {
  title: "Concurrency Foundations",
  tags: ["Mid-Level", "Intermediate", "Phase 4", "Interview Prep", "Satyverse(Satyam Parmar)"],
  prerequisites: ["Day 33", "Day 32"],
  learningObjectives: [
    "Explain happens-before, races, and safe publication",
    "Use synchronized and volatile appropriately",
    "Design lock ordering to avoid deadlock",
    "Operate ExecutorService lifecycle safely",
    "Choose juc utilities for common coordination patterns",
    "Relate threading issues to observability and on-call practice",
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
  mcqLabel: "Concurrency Foundations",
  mcqDescription: "Thirty questions on JMM basics, locks, executors, races, and deadlock.",
  mcqQuestions,
  cheatsheetRows,
};
