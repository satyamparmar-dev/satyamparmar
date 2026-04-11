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

const why = `Stacks and queues are the two disciplining orders behind half of interview patterns and half of service plumbing. When you see **DFS**, you are seeing a stack; when you see **BFS** or fair work distribution, you are seeing a queue. Interviewers care whether you pick the right **end** of the structure and whether you know Java’s **ArrayDeque** is the default hammer—not the legacy **Stack** class and not a **PriorityQueue** when you need FIFO.

In production, queues carry **backpressure**: bounded queues block, drop, or reject when producers outrun consumers. Misunderstanding \`offer\` versus \`add\` is how you get either silent data loss or surprise exceptions under spike traffic. Stacks show up in parsers, undo buffers, and explicit recursion flattening—anywhere you need **last-writer-wins** behavior with deterministic order.

Monotonic stacks look exotic until you realize they are just **scheduling deferred work**: each element waits until a stronger signal arrives, then resolves in amortized constant time. That mental model maps to “daily temperatures,” histogram rectangles, and nested string decoding—not just trivia.

On call, “queue depth climbing” is a symptom language. Pair it with **consumer lag** and **oldest message age** to decide if you scale consumers, shard topics, or fix a poison message. The structures you memorize for interviews are the same ones you read in metrics dashboards.

Finally, **thread-safe** choices matter: a plain \`ArrayDeque\` in a multi-threaded handler races; concurrent queues exist for a reason. Saying “I’ll synchronize later” is how incidents start.`;

const pitfalls = [
  "Using **`java.util.Stack`** for new code — legacy synchronized Vector stack; surprises in API; prefer **`ArrayDeque`**; detect in review checklists; fix by swapping type and method names (`push`/`pop`/`peek`).",
  "Treating **`PriorityQueue` as FIFO** — orders by comparator, not arrival; subtle ordering bugs in schedulers; unit tests with ties; fix with explicit `LinkedList`/`ArrayDeque` when fairness required.",
  "Calling **`add` on a bounded queue** under load — throws `IllegalStateException` instead of signaling backpressure; outages during spikes; fix with `offer`, metrics on false returns, and rejection policies.",
  "Popping from an **empty** stack on malformed input — `EmptyStackException` or null handling bugs; fuzz inputs; fix by checking `isEmpty()` before pop and returning false for invalid parentheses.",
  "**Recursive DFS** on deep graphs — `StackOverflowError`; looks fine in small tests; fix with explicit `Deque` stack simulation.",
  "Using **`null` elements** in `ArrayDeque` — `NullPointerException`; accidental sentinel; fix by using Optional wrappers or separate boolean flags.",
  "Monotonic stack **index vs value confusion** — wrong width calculations in histogram; off-by-one rectangles; fix by storing indices and reading heights from array on pop.",
  "Ignoring **memory** of unbounded `LinkedList` work queues — GC churn under burst; heap pressure; fix with bounded `ArrayBlockingQueue` and consumer scaling.",
];

const exercise = {
  title: "Practice exercise",
  difficulty: "Intermediate",
  problem: `**Day 22 — Stacks and queues (assignment alignment)**

1. Implement a method \`boolean balanced(String s)\` supporting \`()\`, \`[]\`, and \`{}\`.
2. Return \`false\` on **extra** closing bracket or **mismatched** type.
3. Return \`false\` if any **open** bracket remains after scan.
4. In \`main\`, print results for \`([]){}\`, \`())\`, and \`(([]\` each on its own line (\`true\`/\`false\`).`,
  hints: [
    "Use `ArrayDeque<Character>` as stack; push opens.",
    "On close, if stack empty or top mismatch, return false.",
    "After loop, stack must be empty for true.",
  ],
  solution: String.raw`package arch.day22;

import java.util.*;

public class Day22Exercise {

    static boolean balanced(String s) {
        Deque<Character> st = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '[' || c == '{') {
                st.push(c);
            } else if (c == ')' || c == ']' || c == '}') {
                if (st.isEmpty()) return false;
                char o = st.pop();
                if (!((o == '(' && c == ')') || (o == '[' && c == ']') || (o == '{' && c == '}'))) {
                    return false;
                }
            }
        }
        return st.isEmpty();
    }

    public static void main(String[] args) {
        System.out.println(balanced("([]){}"));
        System.out.println(balanced("())"));
        System.out.println(balanced("(([]"));
    }
}
`,
};

const cheatsheetRows = [
  ["Stack", "LIFO end", "DFS, undo, parens"],
  ["Queue", "FIFO ends", "BFS, fair work"],
  ["Deque", "both ends O(1)", "window max, steal"],
  ["ArrayDeque", "array-backed", "prefer over Stack"],
  ["PriorityQueue", "heap order", "not FIFO"],
  ["offer vs add", "bounded failure", "backpressure"],
  ["Monotonic stack", "next greater", "each idx once"],
  ["BlockingQueue", "put blocks", "producer/consumer"],
  ["Min stack", "aux mins", "O(1) min"],
  ["Iterative DFS", "explicit stack", "avoid SO"],
  ["Histogram", "stack widths", "largest rect"],
  ["RPN eval", "operand stack", "operators pop 2"],
  ["Concurrent Q", "j.u.c", "thread-safe picks"],
  ["Work stealing", "deque per worker", "fork/join"],
  ["Parse nesting", "stack depth", "limit attacks"],
];

export default {
  title: "Stacks and Queues",
  tags: ["Fresher", "Intermediate", "Phase 3", "Interview Prep", "Satyverse(Satyam Parmar)"],
  prerequisites: ["Day 21", "Day 20"],
  learningObjectives: [
    "Choose stack, queue, deque, or heap for a problem’s traversal order",
    "Implement parentheses and monotonic stack patterns in Java",
    "Explain Java API pitfalls (Stack, PriorityQueue, bounded queues)",
    "Model backpressure with offer/poll and blocking queues",
    "Use iterative DFS where recursion depth is risky",
    "Relate queues to production metrics (depth, lag, age)",
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
  mcqLabel: "Stacks and Queues",
  mcqDescription: "Thirty questions on LIFO/FIFO, ArrayDeque, monotonic stacks, heaps vs queues, and concurrency.",
  mcqQuestions,
  cheatsheetRows,
};
