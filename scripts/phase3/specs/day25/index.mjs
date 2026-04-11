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

const why = `Heaps are the hidden engine behind **job schedulers**, **top-k dashboards**, and **graph shortest paths**. They are also a frequent interview trap because candidates confuse **PriorityQueue** with **Queue** fairness. In production, mis-specified comparators cause tasks to run out of order, retries to starve, or “urgent” work to never surface.

Learning heaps trains you to recognize **logarithmic** extraction of the best candidate under changing data—something arrays only give you after an **O(n log n)** sort. That distinction matters when you process streaming metrics where recomputing a full sort each tick is wasteful.

Top-k problems map directly to **bounded memory** dashboards: keep only k items in a heap instead of materializing the full distribution. The same pattern appears in fraud alerts, leaderboard snapshots, and sampling heavy tails.

On call, “scheduler acting weird” sometimes traces to **non-transitive** or **volatile** comparators, or to **duplicate** priorities collapsing ordering unpredictably. Knowing that \`PriorityQueue\` is **not stable** helps you design tie-break keys deliberately.

Finally, heaps bridge to **trees** (complete binary tree view) and **sorting** (heapsort). Seeing these as one family prevents the interview silo effect where each topic feels unrelated.`;

const pitfalls = [
  "Treating **`PriorityQueue` as FIFO** — tasks run by priority, not arrival; incidents of starvation; fix comparator + aging policy.",
  "**Null** elements — `NullPointerException`; validate before offer; fix guards.",
  "**Comparator inconsistent with equals** — subtle ordering bugs; unit test transitivity; fix with composite keys.",
  "Using **`remove(element)`** on hot paths — O(n) scan; restructure or maintain index map.",
  "Wrong heap for **kth largest** — using max-heap unbounded; memory blow; fix bounded min-heap size k.",
  "**Integer overflow** in custom compare on differences — broken ordering; use `Integer.compare`.",
  "Assuming **stability** — equal priorities reorder arbitrarily; fix secondary sort key.",
  "Ignoring **thread safety** — `PriorityQueue` not concurrent; use `PriorityBlockingQueue` or external lock.",
];

const exercise = {
  title: "Practice exercise",
  difficulty: "Intermediate",
  problem: `**Day 25 — Heaps (assignment alignment)**

1. Given an integer array, return the **k-th largest** element using a \`PriorityQueue\` (k is 1-based largest).
2. Use a **min-heap** of size **k** (store the k largest values seen).
3. For array \`[3,2,1,5,6,4]\` and \`k=2\`, print the result (expect **5**).
4. Print no extra randomness—deterministic main only.`,
  hints: [
    "When size > k, poll the smallest of the k+1 to drop the smallest among top candidates.",
    "Use `long` if you aggregate products in variants; not needed for this sample.",
    "After loop, peek is kth largest.",
  ],
  solution: String.raw`package arch.day25;

import java.util.*;

public class Day25Exercise {

    static int kthLargest(int[] a, int k) {
        PriorityQueue<Integer> pq = new PriorityQueue<>();
        for (int x : a) {
            pq.offer(x);
            if (pq.size() > k) {
                pq.poll();
            }
        }
        return pq.peek();
    }

    public static void main(String[] args) {
        int[] a = { 3, 2, 1, 5, 6, 4 };
        System.out.println(kthLargest(a, 2));
    }
}
`,
};

const cheatsheetRows = [
  ["Min-heap", "smallest at root", "Default PQ"],
  ["offer/poll", "O(log n)", "bubble/sink"],
  ["peek", "O(1)", "root"],
  ["kth largest", "min-heap size k", "peek answer"],
  ["k smallest", "max-heap size k", "reverse comparator"],
  ["k-way merge", "heap of heads", "O(N log k)"],
  ["Median stream", "two heaps", "balance sizes"],
  ["Build heap", "bottom-up", "O(n)"],
  ["Not FIFO", "priority order", "tie-break"],
  ["Not stable", "add key", "secondary compare"],
  ["remove(x)", "O(n) find", "avoid hot path"],
  ["Concurrent", "PriorityBlockingQueue", "schedulers"],
  ["Heapsort", "in-place", "not stable"],
  ["Indexed heap", "pos map", "decrease-key"],
  ["Dijkstra", "PQ distances", "graphs"],
];

export default {
  title: "Heaps and Priority Queues",
  tags: ["Fresher", "Intermediate", "Phase 3", "Interview Prep", "Satyverse(Satyam Parmar)"],
  prerequisites: ["Day 24", "Day 23"],
  learningObjectives: [
    "Use PriorityQueue with correct comparators and tie-breaks",
    "Implement top-k and k-way merge patterns with heaps",
    "Contrast heaps with sorting, FIFO queues, and TreeSet",
    "State time complexity for offer, poll, peek, and batch build",
    "Model schedulers and streaming aggregates with bounded heaps",
    "Recognize thread-safety and comparator contract pitfalls",
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
  mcqLabel: "Heaps and Priority Queues",
  mcqDescription: "Thirty questions on binary heaps, Java PriorityQueue, top-k, merges, and comparators.",
  mcqQuestions,
  cheatsheetRows,
};
