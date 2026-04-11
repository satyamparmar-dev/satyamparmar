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

const why = `Arrays are the default data structure in backend services: request payloads, columnar batches, time series windows, and in-memory caches almost always land in contiguous memory. **Two pointers** are the pattern that turns many “try everything” sketches into linear passes when order or monotonicity is present. Interviewers use them to see whether you reason about **invariants** instead of memorizing templates.

In production, the same pattern appears when you merge sorted audit streams, collapse duplicate events in a timeline, or walk two ordered indexes during an incremental ETL join. The failure mode is familiar: someone squares the work by nested loops because the data was sortable once. Complexity here is not trivia—it is how you keep join logic from becoming a latency bomb.

Interview answers should start with **preconditions**: is the input sorted? can it contain duplicates? do we need one pair or all unique triplets? Then you describe how moving \`left\` or \`right\` **cannot** skip the only valid answer. That proof sketch separates mid-level code from senior reasoning.

Two pointers also sit next to **sliding windows**: both use two indices, but windows optimize contiguous segments while classic two-pointer pair search optimizes sums on sorted arrays. Mixing the two confuses candidates; clarifying which invariant you maintain fixes most stalls.

At scale, **integer overflow** and **empty inputs** decide whether your “simple” two-pointer solution is trustworthy. Production bugs from \`a[i]+a[j]\` wrapping positive are rare in interviews but memorable on call. Mentioning \`long\` sums signals you have shipped real parsers or financial aggregations.

Finally, on-call scenarios often trace back to accidental quadratic joins in application memory. When metrics show latency scaling with the product of two growing lists, the mental model you built on Day 20 is how you find the nested loops or repeated scans and replace them with sorted merges or hash-based joins.`;

const pitfalls = [
  "Using two pointers on **unsorted** data without proving monotonicity — pair-sum searches skip valid answers while p99 looks fine on toy tests; draw a counterexample for increasing/decreasing sums; fix by sorting once or switching to `HashMap` expected O(n).",
  "Ignoring **integer overflow** on `int` sums — comparisons break silently and branches move wrong; add unit tests with `Integer.MAX_VALUE` neighbors; fix by summing in `long` or using safe comparison tricks.",
  "Off-by-one when array is **empty or length 1** — `while (i < j)` never runs or indices invalid; detect with guard clauses in code review; fix by early return and explicit handling of no-solution cases.",
  "Applying **sliding window** where negatives break the shrink assumption — window sum is not monotone; profiler shows wrong outputs on mixed-sign arrays; fix with prefix sums + map or re-derive invariant.",
  "Emitting **duplicate triplets** in 3Sum — forgetting to skip equal neighbors after a hit explodes output and timeouts; trace sorted array with repeats; fix by advancing `lo`/`hi` while values unchanged after recording.",
  "Claiming **O(n)** after an uncounted **sort** — total time becomes O(n log n); reviewers miss hidden domination; fix by stating sort cost explicitly in complexity answer.",
  "Confusing **stable** vs **unstable** partition needs — labeled rows reorder incorrectly after in-place partition; QA catches flaky ordering; fix with stable algorithm or auxiliary index array.",
  "Using two pointers on **linked lists** without **null** checks — `fast.next` dereference on short lists crashes; static analysis flags risky while loops; fix with guarded advances and dummy head patterns where needed.",
];

const exercise = {
  title: "Practice exercise",
  difficulty: "Intermediate",
  problem: `**Day 20 — Arrays and two pointers (assignment alignment)**

1. Given a **sorted** integer array and a **target**, find **one** pair of indices \`(i, j)\`, \`i < j\`, such that \`a[i] + a[j] == target\`, using the **two-pointer** technique (start at both ends).
2. If **no** pair exists, print \`NO_PAIR\` deterministically.
3. Print the **indices** and **values** found (or the sentinel line).
4. Include a brief trailing comment line in output: \`method=two_pointer_sorted\`.

Use this sample in your solution: \`int[] a = { 1, 3, 4, 6, 10 }\`, \`target = 9\` (expect pair values 3 and 6).`,
  hints: [
    "If `a[left] + a[right] < target`, increase `left`; if greater, decrease `right`.",
    "Use `long` for the sum comparison if values can be large in your own tests.",
    "For the sample, indices should be `1` and `3` (0-based) with values `3` and `6`.",
  ],
  solution: String.raw`package arch.day20;

public class Day20Exercise {

    public static void main(String[] args) {
        int[] a = { 1, 3, 4, 6, 10 };
        int target = 9;
        int i = 0, j = a.length - 1;
        boolean found = false;
        while (i < j) {
            long s = (long) a[i] + a[j];
            if (s == target) {
                System.out.println("indices=" + i + "," + j);
                System.out.println("values=" + a[i] + "," + a[j]);
                found = true;
                break;
            }
            if (s < target) {
                i++;
            } else {
                j--;
            }
        }
        if (!found) {
            System.out.println("NO_PAIR");
        }
        System.out.println("method=two_pointer_sorted");
    }
}
`,
};

const cheatsheetRows = [
  ["Sorted two-sum", "Move left if sum small, right if large", "O(n) after sort; prove monotonicity"],
  ["Merge sorted", "Advance smaller head pointer", "O(n+m) time, linear scan"],
  ["Sliding window fixed-k", "Add right, drop left each step", "O(n) total steps"],
  ["Sliding window variable", "Grow until valid, shrink until invalid", "O(n) if each entry leaves once"],
  ["Remove dup sorted", "Write slow pointer on change", "O(n) in-place"],
  ["Partition", "Hoare/Lomuto variants", "O(n) per pass"],
  ["Reverse array", "Swap ends until meet", "O(n), O(1) space"],
  ["Container water", "Move shorter line inward", "O(n) greedy proof"],
  ["3Sum unique", "Fix i, two-pointer rest, skip dups", "O(n²) after sort"],
  ["Overflow", "Cast to long for sums", "Mention before coding"],
  ["Hash two-sum", "Map value→index", "O(n) expected unsorted"],
  ["Palindrome chars", "Two ends inward", "O(n) after normalize"],
  ["Runner technique", "Slow 1x fast 2x", "Cycle detection"],
  ["Subarray sum K", "Prefix + map", "O(n) with negatives"],
  ["Squares sorted", "Pick larger |x| from ends", "O(n) output fill"],
];

export default {
  title: "Arrays and Two Pointers",
  tags: ["Fresher", "Intermediate", "Phase 3", "Interview Prep", "Satyverse(Satyam Parmar)"],
  prerequisites: ["Day 19", "Day 18"],
  learningObjectives: [
    "Use two pointers on sorted arrays with correct monotonic proofs",
    "Implement sliding window variants with clear invariants",
    "Compare hash-based vs sort+scan strategies for pair problems",
    "Handle duplicates, overflow, and empty inputs cleanly",
    "Merge sorted sequences and partition arrays in linear time",
    "Explain production joins and streaming merges using pointer techniques",
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
  mcqLabel: "Arrays and Two Pointers",
  mcqDescription: "Thirty questions on sorted two-pointer reasoning, windows, merges, partitions, and pitfalls (overflow, stability).",
  mcqQuestions,
  cheatsheetRows,
};
