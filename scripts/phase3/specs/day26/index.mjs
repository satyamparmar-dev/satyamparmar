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

const why = `Sorting and binary search are the “make data speak” pair: once values are **ordered**, you can **halve** uncertainty each step instead of scanning everything. That shows up in databases, configuration UIs, feature flags, and any service that maintains **sorted runs** for merge or seek. Interviews test whether you can separate **comparison costs**, **stability**, and **access patterns** from buzzwords.

Binary search is also a **mindset**: many “find minimum feasible capacity” problems are binary search on the answer with a greedy check. That pattern is how teams size batches, rate limits, and autoscaling bounds without exhaustive search.

Sorting stability sounds academic until your **multi-column** export shuffles rows with identical primary keys and auditors complain. Knowing that **TimSort** is stable helps you pick the right tool when you sort Java objects.

On call, “binary search wrong” bugs are often **off-by-one** invariants or **unsorted** inputs after a bad merge. The defensive habit is to assert preconditions, use **safe mid**, and write tests for **duplicates** and **endpoints**.

This day closes the loop with **two pointers** (Day 20) and **heaps** (Day 25): sometimes you sort once and scan linearly; sometimes you maintain order incrementally with a heap; sometimes you never fully sort and only binary-search a virtual space.`;

const pitfalls = [
  "**Unsorted** input to binary search — silent wrong index; assert sorted or sort first; fix precondition checks.",
  "**Integer overflow** in `lo+hi` — infinite loops or wrong mid; use `lo + ((hi-lo)>>>1)`.",
  "**Inclusive vs exclusive** bounds confusion — infinite loop or skip answers; pick one template and stick to it.",
  "Using **`Collections.binarySearch`** on shuffled `ArrayList` — undefined; sort first.",
  "Expecting **stability** from primitive `Arrays.sort(int[])` — not the same concern as object TimSort; document requirements.",
  "**Duplicates**: needing **first/last** occurrence but using only exact equality BS — wrong index; use lower/upper bound variants.",
  "Binary search on **linked list** pretending O(log n) — mid not O(1); fix with different structure.",
  "Confusing **lower bound** returning `n` as “past end” — valid insert position; document API semantics.",
];

const exercise = {
  title: "Practice exercise",
  difficulty: "Intermediate",
  problem: `**Day 26 — Sorting and binary search (assignment alignment)**

1. Implement **binary search** on a sorted int array that may contain **duplicates**.
2. Return the **index** of the target if present; otherwise return **-1**.
3. If multiple equal values exist, return the **smallest index** (first occurrence).
4. Use array \`[1,2,2,2,3,4]\` and target \`2\` — expect index **1**.`,
  hints: [
    "When a[mid]==target, record answer and move hi=mid-1 to search left half for earlier occurrence.",
    "Use `lo + ((hi - lo) >>> 1)` for mid.",
    "Initialize answer as -1 and update when hit.",
  ],
  solution: String.raw`package arch.day26;

public class Day26Exercise {

    static int firstOccurrence(int[] a, int t) {
        int lo = 0, hi = a.length - 1;
        int ans = -1;
        while (lo <= hi) {
            int mid = lo + ((hi - lo) >>> 1);
            if (a[mid] == t) {
                ans = mid;
                hi = mid - 1;
            } else if (a[mid] < t) {
                lo = mid + 1;
            } else {
                hi = mid - 1;
            }
        }
        return ans;
    }

    public static void main(String[] args) {
        int[] a = { 1, 2, 2, 2, 3, 4 };
        System.out.println(firstOccurrence(a, 2));
        System.out.println(firstOccurrence(a, 5));
    }
}
`,
};

const cheatsheetRows = [
  ["Binary search", "halve interval", "sorted + index"],
  ["Safe mid", "lo+(hi-lo)/2", "avoid overflow"],
  ["Lower bound", "first >= x", "predicate BS"],
  ["Upper bound", "first > x", "symmetric"],
  ["First equal", "shrink left on hit", "duplicates"],
  ["TimSort", "stable n log n", "Object[]"],
  ["int[] sort", "dual-pivot", "fast avg"],
  ["Merge sort", "stable", "O(n) space"],
  ["Quick sort", "avg n log n", "worst n^2"],
  ["Heap sort", "in-place", "unstable"],
  ["Counting sort", "bounded keys", "O(n+k)"],
  ["Radix sort", "digits", "integer strings"],
  ["BS on answer", "monotone check", "capacity"],
  ["Rotated array", "which half sorted", "compare ends"],
  ["Quickselect", "partition", "avg O(n)"],
];

export default {
  title: "Sorting and Binary Search",
  tags: ["Fresher", "Intermediate", "Phase 3", "Interview Prep", "Satyverse(Satyam Parmar)"],
  prerequisites: ["Day 25", "Day 24"],
  learningObjectives: [
    "Implement binary search variants: exact, bounds, duplicates",
    "Explain comparison sort limits and stability",
    "Choose appropriate JDK sort for objects vs primitives",
    "Apply binary search on answer problems with feasibility checks",
    "Analyze time/space for merge, quick, and heap sorts",
    "Avoid overflow and off-by-one bugs in search loops",
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
  mcqLabel: "Sorting and Binary Search",
  mcqDescription: "Thirty questions on binary search variants, sort stability, JDK sorts, and classic theory.",
  mcqQuestions,
  cheatsheetRows,
};
