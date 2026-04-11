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

const why = `CompletableFuture is the default glue of asynchronous Java services. It expresses dependencies between tasks more clearly than nested callbacks, and it gives you explicit error paths if you use exceptionally and handle instead of letting exceptions disappear into completedExceptionally states that nobody reads.

The default executor choice is a silent dependency on ForkJoinPool.commonPool. That is fine until your service shares the pool with parallel streams, framework callbacks, and ad hoc supplyAsync calls under load. Senior engineers pass explicit executors to isolate latency classes and to make thread dumps interpretable.

Virtual threads change throughput economics for blocking workloads, but CompletableFuture composition still matters for non-blocking stages and for integrating with libraries that expose futures. You should be able to explain pinning: when a virtual thread blocks a carrier because of synchronized or native code, you have reintroduced the scarcity you thought you eliminated.

Timeouts and cancellation are production requirements, not interview trivia. orTimeout and completeOnTimeout help you fail fast instead of wedging thread pools when downstream systems stall. Structured concurrency approaches group related tasks so failures propagate and resources clean up predictably.

On call, slow external calls often show up as growing CompletableFuture chains waiting on get or join at the edges. Your mitigation should include deadline propagation, bulkheading, and metrics on stage latencies—not just increasing pool sizes until the JVM runs out of memory.`;

const pitfalls = [
  "**Implicit common pool overload** — pass dedicated ExecutorService.",
  "**Blocking inside callbacks** — starves pools; offload or use virtual threads carefully.",
  "**Swallowed exceptions** — always attach handle/exceptionally or log whenComplete.",
  "**join on calling thread under load** — hides async benefit; use truly async boundaries.",
  "**No timeout on external CF** — hung pipelines; add orTimeout.",
  "**Lost MDC/trace context** — propagate manually in async stages.",
  "**allOf without per-future error check** — partial failures hidden.",
  "**Assuming virtual threads fix CPU contention** — false; CPU-bound still needs cores.",
];

const exercise = {
  title: "Practice exercise",
  difficulty: "Intermediate",
  problem: `**Day 36 — CompletableFuture and virtual threads (assignment alignment)**

1. Create **ExecutorService** with **newSingleThreadExecutor** for deterministic ordering.
2. Build **three** \`CompletableFuture.supplyAsync\` tasks on that executor returning **\"A\"**, **\"B\"**, **\"C\"** respectively.
3. Use **CompletableFuture.allOf** to wait for all three, then **concatenate** results in **A,B,C order** (submission order on single-thread pool) and print **combined=ABC** style line.
4. **shutdown** the executor after printing.`,
  hints: [
    "Store futures in vars a,b,c; allOf(a,b,c).join(); then a.get()+b.get()+c.get().",
    "Catch Exception in main or declare throws.",
    "Package arch.day36, class Day36Exercise.",
  ],
  solution: String.raw`package arch.day36;

import java.util.concurrent.*;

public class Day36Exercise {

    public static void main(String[] args) throws Exception {
        ExecutorService ex = Executors.newSingleThreadExecutor();
        CompletableFuture<String> a = CompletableFuture.supplyAsync(() -> "A", ex);
        CompletableFuture<String> b = CompletableFuture.supplyAsync(() -> "B", ex);
        CompletableFuture<String> c = CompletableFuture.supplyAsync(() -> "C", ex);
        CompletableFuture.allOf(a, b, c).join();
        System.out.println("combined=" + a.get() + b.get() + c.get());
        ex.shutdown();
    }
}
`,
};

const cheatsheetRows = [
  ["supplyAsync", "Supplier", "executor"],
  ["thenApply", "map", "transform"],
  ["thenCompose", "flatMap", "nested CF"],
  ["thenCombine", "zip", "two CFs"],
  ["allOf", "void wait", "manual get"],
  ["anyOf", "first finish", "race"],
  ["exceptionally", "recover", "throwable"],
  ["handle", "both", "bi fn"],
  ["whenComplete", "side effect", "always"],
  ["join", "unchecked", "wait"],
  ["completedFuture", "ready", "constant"],
  ["failedFuture", "failed", "factory"],
  ["orTimeout", "fail late", "deadline"],
  ["runAsync", "Runnable", "void"],
  ["executor param", "isolate", "ops"],
];

export default {
  title: "CompletableFuture and Virtual Threads",
  tags: ["Mid-Level", "Intermediate", "Phase 4", "Interview Prep", "Satyverse(Satyam Parmar)"],
  prerequisites: ["Day 35", "Day 34"],
  learningObjectives: [
    "Compose CompletableFuture pipelines with explicit executors",
    "Handle failures with exceptionally, handle, and whenComplete",
    "Use allOf/anyOf patterns and understand limitations",
    "Explain virtual thread benefits and pinning pitfalls",
    "Apply timeouts and cancellation for resilient async services",
    "Relate async design to observability and thread dumps",
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
  mcqLabel: "CompletableFuture and Virtual Threads",
  mcqDescription: "Thirty questions on composition, executors, error handling, and virtual threads.",
  mcqQuestions,
  cheatsheetRows,
};
