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

const why = `Complexity analysis is the part of DSA interviews that separates “it works on my laptop” from “it will survive real traffic.” When you ship a nested loop over tenant data or sort inside a request handler, tests often stay green while production latency grows superlinearly with batch size. Interviewers use Big-O language to see whether you can **predict** that failure before it pages someone at midnight.

This topic also shows up in code review and architecture discussions. Teams argue about indexes, batching, streaming versus materializing collections, and cache shapes. The same skill you use to state “this merge is O(n·m)” is the skill you use to push back on a product requirement that implies all-pairs comparisons at enterprise scale. Complexity is not academic—it is a **risk communication** tool.

A strong interview answer is never only a label. You name the **dominant operation** (comparisons, hash probes, allocations), the **input assumptions** (sorted, distinct keys, bounded range), and whether you mean **worst, average, or amortized** bounds. You connect time and **auxiliary space**, including recursion depth, because Java does not magically erase stack frames. That precision is what signals seniority.

Interviewers also probe whether you confuse **asymptotics with constants**. Two algorithms in the same Big-O class can differ by orders of magnitude in practice because of cache locality, boxing, and garbage churn. The best candidates acknowledge both: asymptotic class for scalability, profiling for p99 reality. Blindly quoting O(n log n) without naming the hidden sort or map resize is a common rejection pattern.

At scale, the failure modes are predictable. A feature that worked for 1,000 rows collapses at 100,000 because someone squared the work accidentally. A “fast” hash map path becomes a linked-list scan under collision pressure. A recursive parser blows stack depth. Complexity analysis is how you **recognize** those shapes in code review logs and flame graphs, not just on a whiteboard.

In day-to-day engineering, complexity shows up when metrics move: p99 latency tracks payload size, CPU pegs on a single hot method, or GC time spikes after a refactor. On call, you triage by asking what grew—users, rows, keys—and whether the handler’s work could be quadratic or unbounded fan-out. The engineer who can answer that question calmly shortens incidents and prevents repeat regressions.`;

const pitfalls = [
  "Stating Big-O without naming the dominant operation — interviewers hear vague hand-waving while p99 latency maps directly to nested iterations or hidden sorts; count loop dimensions and map resize costs in review; fix by deriving work from the innermost scaling step and documenting it beside the method.",
  "Quoting average-case O(1) map access while ignoring collision worst case — attackers or skewed keys turn buckets into long chains and timeouts spike; watch bucket depth metrics and CPU on `equals`; fix with better `hashCode`, treeified buckets awareness, or ordered structures when determinism matters.",
  "Forgetting recursion stack in “O(1) extra space” claims — deep recursion on large inputs throws `StackOverflowError` or thrashes frames; detect with depth limits and thread dumps; fix by rewriting iterative algorithms or explicit stacks.",
  "Micro-benchmarking on cold JVM to “prove” linearity — JIT warmup and GC noise produce fake conclusions that mislead sizing; use stabilized runs or deterministic operation counters; fix with JMH-style harnesses or growth-ratio checks across n.",
  "Treating small-n constants as irrelevant forever — at modest n, an O(n²) routine with tiny constants can beat a heavy O(n log n); detect when product limits n < 50; fix by choosing simpler code with explicit max-size guardrails.",
  "Assuming `Arrays.sort` cost is irrelevant inside a loop — repeated sorts multiply to O(k·n log n) and dominate handlers; detect with profiler samples on `sort`; fix by sorting once, using heaps, or maintaining order incrementally.",
  "Confusing **upper bound O** with **tight Θ** — you may claim O(n²) when actual is Θ(n), sounding pessimistic or unsure; interviewers test precision; fix by proving both upper and lower arguments or stating dominant term exactly.",
  "Ignoring auxiliary memory from intermediate collections — streaming pipelines that materialize large lists blow heap and GC; detect allocation rates in metrics; fix by batching, primitive arrays, or single-pass algorithms where possible.",
];

const exercise = {
  title: "Practice exercise",
  difficulty: "Advanced",
  problem: `**Day 19 — Complexity Analysis (assignment alignment)**

1. For array sizes **100**, **1000**, and **10000**, print **deterministic operation counts** for a nested duplicate-check style loop (all pairs \`i < j\`) so growth is visible without relying on noisy wall-clock timers.
2. Print **linear scan** operation counts for the same sizes (single loop) for contrast.
3. For each size, print the ratio **nested_ops / n** to show approximate linear growth of the pair count versus n (quadratic total work).
4. Add a one-line summary class label for the nested approach (**O(n²)**) and the linear scan (**O(n)**), tied to the printed numbers.`,
  hints: [
    "Pairwise inner loop comparisons total **n·(n−1)/2** for distinct ordered pairs with i<j.",
    "Keep everything integer and deterministic—no random input, no wall-clock timing requirement for grading.",
    "Use `long` for counts when n=10_000 to avoid overflow in intermediate products.",
  ],
  solution: String.raw`package arch.day19;

public class Day19Exercise {

    static long pairChecks(int n) {
        return (long) n * (n - 1) / 2;
    }

    public static void main(String[] args) {
        System.out.println("=== Empirical growth (operation counts) ===");
        for (int n : new int[] { 100, 1000, 10000 }) {
            long nested = pairChecks(n);
            long linear = n;
            double ratio = nested / (double) n;
            System.out.println("n=" + n + " nested_pair_checks=" + nested + " linear_scan_ops=" + linear
                + " nested_over_n=" + String.format("%.2f", ratio));
        }
        System.out.println("Summary: nested_pair_checks grow ~Theta(n^2); linear_scan grows Theta(n).");
    }
}
`,
};

const cheatsheetRows = [
  ["Big-O", "Upper bound on growth; drop constants/low terms", "Dominant operation + largest growing term"],
  ["Big-Θ", "Tight bound: same upper and lower class", "Same growth rate up to constants"],
  ["Big-Ω", "Lower bound — at least this hard", "Adversarial input forces this much work"],
  ["Worst case", "Protects SLAs under hostile/large data", "State when interviewer cares about guarantees"],
  ["Average case", "Needs a model (e.g., random keys)", "Never confuse with best case"],
  ["Amortized", "Spread rare expensive ops over many cheap ones", "`ArrayList.add` amortized O(1)"],
  ["Time vs space", "Count both; include recursion stack", "Auxiliary space excludes input unless asked"],
  ["Nested loops", "Multiply iterations per dimension", "i<j inner sum → Θ(n²)"],
  ["Sort cost", "Comparison sort Ω(n log n)", "Identify hidden sorts in loops"],
  ["Binary search", "Halve search space each step", "Requires sorted + random access"],
  ["Hash map", "Expected O(1); watch collisions", "Know equals/hashCode contract"],
  ["Two-pointer", "Often O(n) on sorted arrays", "Prove monotonicity of pointers"],
  ["Recursion depth", "Each frame costs stack", "Java: prefer iterative or explicit stack when deep"],
  ["Profiling", "Validates constants p99 reality", "Pair with asymptotic reasoning"],
  ["Master theorem", "Recurrence T(n)=aT(n/b)+f(n)", "Know divide & conquer templates"],
];

export default {
  title: "Complexity Analysis",
  tags: ["Fresher", "Intermediate", "Phase 3", "Interview Prep", "Satyverse(Satyam Parmar)"],
  prerequisites: ["Day 18", "Day 17"],
  learningObjectives: [
    "Explain Big-O, Θ, Ω, worst/average/amortized with interview precision",
    "Derive time and space from code structure, including recursion depth",
    "Contrast asymptotic classes with practical profiling and JVM effects",
    "Detect quadratic and hidden-sort patterns in service handlers",
    "Communicate complexity assumptions and validate with measurements or op counts",
    "Answer follow-ups on hashing, sorting, and divide-and-conquer recurrences",
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
  mcqLabel: "Complexity Analysis",
  mcqDescription:
    "Thirty questions from basic definitions through recurrences, hashing pitfalls, and amortized reasoning — read distractors carefully.",
  mcqQuestions,
  cheatsheetRows,
};
