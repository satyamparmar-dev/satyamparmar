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

const why = `Dynamic programming is how you stop recomputing the same subproblem like a broken record. In interviews, it separates “I memorized Fibonacci” from “I can **define state** and **justify transitions**.” In production, full DP often hides inside optimization libraries—but the **habit** of identifying overlapping structure is what helps you simplify services: cache results, reuse partial aggregates, avoid exponential fan-out in reporting jobs.

Memoization is also the on-call pattern behind **caching**: you pay memory to avoid repeating expensive work. The difference is engineering discipline—bounded caches, eviction, and stampeding protection—where the whiteboard version is usually unbounded \`HashMap\`.

Tabulation teaches **ordering**: you cannot fill a cell until its dependencies are ready. That mindset maps to data pipelines where **DAG** execution order prevents inconsistent aggregates.

Fibonacci with memo is the gateway, but the durable skill is writing **one-sentence semantics** for \`dp[i]\` before you touch the keyboard. Teams hire for that clarity because it prevents subtle off-by-one state bugs in pricing rules, promo engines, and simulation code.

This day also warns that **not** everything is DP—some problems are greedy, some divide-and-conquer with disjoint subproblems. The interview win is picking the right family fast.

On call, “CPU melting” sometimes traces to a **recursive** report builder revisiting the same subtree without memo—same mistake as naive Fibonacci, dressed in business logic.`;

const pitfalls = [
  "**Undefined dp state** — ambiguous transitions and wrong answers; write meaning comment first; fix precise definition.",
  "**Missing base cases** — infinite recursion stack overflow; test smallest inputs; fix explicit returns.",
  "**Wrong order in tabulation** — reading uninitialized cells; zero garbage answers; fix dependency-directed loops.",
  "Using **== for memo sentinel** when valid values include that sentinel — fib memo with 0 tricky; use `Long` wrapper or -1 sentinel with constraints.",
  "Confusing **0/1 knapsack** inner loop direction with **unbounded** — counting errors; fix loop order per pattern.",
  "**Integer overflow** summing DP values — use `long` where sums explode.",
  "Memo **key** missing dimensions — collisions merge incompatible states; include full tuple in key.",
  "Calling DP when **greedy** suffices — overcomplicated; analyze exchange argument first.",
];

const exercise = {
  title: "Practice exercise",
  difficulty: "Intermediate",
  problem: `**Day 27 — Dynamic programming basics (assignment alignment)**

1. Implement **Fibonacci** with **top-down memoisation** in a new class.
2. Use a \`long[]\` memo sized \`n+1\` with **-1** as “unset” sentinel (Fibonacci grows fast—use \`long\`).
3. Return \`F(n)\` for \`n=30\` and print it.
4. Also print the number of **non-memoized** evaluations by counting only when you compute a new value (optional counter field).`,
  hints: [
    "Initialize memo with Arrays.fill(memo, -1).",
    "Base: n<=1 return n; if memo[n]!=-1 return memo[n]; else compute store return.",
    "F(30) = 832040.",
  ],
  solution: String.raw`package arch.day27;

import java.util.*;

public class Day27Exercise {

    static long calls = 0;

    static long fibMemo(int n, long[] memo) {
        if (n <= 1) return n;
        if (memo[n] != -1) return memo[n];
        calls++;
        memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
        return memo[n];
    }

    public static void main(String[] args) {
        int n = 30;
        long[] memo = new long[n + 1];
        Arrays.fill(memo, -1);
        System.out.println(fibMemo(n, memo));
        System.out.println("fresh_computations=" + calls);
    }
}
`,
};

const cheatsheetRows = [
  ["Overlapping", "reuse subproblems", "memo/tab"],
  ["Optimal substructure", "global from locals", "recurrence"],
  ["Top-down", "recursion + cache", "natural order"],
  ["Bottom-up", "iterative table", "control stack"],
  ["State", "meaning of dp[...]", "define first"],
  ["Base case", "terminate recursion", "smallest n"],
  ["Fib memo", "O(n)", "each once"],
  ["Fib naive", "O(2^n)", "recompute"],
  ["Space roll", "2 vars", "last rows"],
  ["Climb stairs", "fib-like", "1 or 2"],
  ["Coin change", "unbounded min", "per amount"],
  ["LCS", "2D table", "match/skip"],
  ["Knapsack", "0/1 vs unbounded", "loop dir"],
  ["Robber", "skip/take", "linear"],
  ["Grid path", "sum up+left", "obstacles variant"],
];

export default {
  title: "Dynamic Programming Basics",
  tags: ["Fresher", "Intermediate", "Phase 3", "Interview Prep", "Satyverse(Satyam Parmar)"],
  prerequisites: ["Day 26", "Day 25"],
  learningObjectives: [
    "Define DP state, transitions, and base cases precisely",
    "Implement top-down memoization and bottom-up tabulation",
    "Analyze time and space complexity including space optimization",
    "Recognize when greedy suffices versus needing DP",
    "Solve foundational problems: Fibonacci, stairs, grids, coin change",
    "Avoid common memo sentinel and ordering pitfalls",
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
  mcqLabel: "Dynamic Programming Basics",
  mcqDescription: "Thirty questions on memo vs tab, classic DP families, complexity, and pitfalls.",
  mcqQuestions,
  cheatsheetRows,
};
