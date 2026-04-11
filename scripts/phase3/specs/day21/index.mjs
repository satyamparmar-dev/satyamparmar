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

const why = `Linked lists are the structure interviewers use when they want to see **pointer discipline**: one wrong \`next\` assignment and you lose the rest of the list in your head and in memory. They also map to real systems—task queues, symbol tables paired with doubly linked nodes for LRU caches, and lock-free structures at the edge of JVM concurrency. The topic is less about “lists are cool” and more about whether you can keep **invariants** under mutation.

In production, raw singly linked lists are rarer than \`ArrayList\`, but the **patterns** dominate: reversing segments, detecting cycles in iterator graphs, merging ordered streams, and implementing eviction policies. When latency spikes in a cache layer, understanding how splice and map work together is how you read the code path without panicking.

Interviewers listen for **dummy nodes**, **Floyd’s tortoise and hare**, and the **three-pointer reverse**. They also listen for honesty about **recursion depth** and **cache locality**. Saying “I’ll recurse because it’s shorter” without mentioning stack risk is a yellow flag for teams that ship large payloads.

Linked lists also train you to test **tiny universes**: null head, singleton, two-node swap, cycle present vs absent. Most on-call bugs from pointer code are repro’d in those sizes within seconds once you know to try them.

Finally, this day connects to **Day 23** maps-plus-list combos (LRU) and **Day 22** stack behaviors used in recursive list algorithms. Seeing the graph of topics—not isolated tricks—is what moves you from solving LeetCode to sounding like an engineer.

On call, “mystery memory growth” sometimes traces to accidental **cycles** in hand-rolled structures or forgotten \`next\` clears. The cycle detection you practice here is the same mental model you use when a profiler shows a tiny set of objects retaining megabytes.`;

const pitfalls = [
  "Forgetting to save **`next` before rewiring** `curr.next` — you orphan the tail and corrupt the list; dry-run two nodes; fix by `Node nxt = curr.next` before any mutation.",
  "Using **recursion** on deep lists — `StackOverflowError` under load tests; detect with depth counters; fix with iterative three-pointer reverse.",
  "**Off-by-one** in fast/slow middle detection — wrong half reversed for palindrome check; trace even/odd length; fix by standard `while (fast!=null && fast.next!=null)` pattern and clarify definition.",
  "Treating **intersection** as equal values — wrong answer merges distinct nodes sharing value; use **reference** identity; fix by aligning lengths then walking pointers.",
  "Deleting a **tail** via copy-next trick — no successor to copy; silent wrong state; check tail case; fix with predecessor scan or doubly linked structure.",
  "**Null dereference** in empty or single-node operations — NPE in CI only on edge tests; guard head null early; fix with explicit branches.",
  "Merge sorted lists **without tail pointer** — accidental O(n²) rescanning; keep `tail` moving; fix dummy + tail pattern.",
  "Confusing **cycle start** proof — meeting point is not generally the start; reset pointer to head for phase two; fix by memorizing correct second phase or deriving on board.",
];

const exercise = {
  title: "Practice exercise",
  difficulty: "Intermediate",
  problem: `**Day 21 — Linked lists (assignment alignment)**

1. Implement **iterative** reversal of a singly linked list of integers built in code (use a simple static \`Node\` class).
2. Print the list **before** and **after** reversal as \`v1->v2->...\` (print \`EMPTY\` if null).
3. Handle **empty** list without throwing.
4. Use values \`1->2->3->4\` in \`main\` for deterministic output.`,
  hints: [
    "Use `Node nxt = curr.next` before changing `curr.next`.",
    "Initialize `prev = null`, `curr = head`; stop when `curr == null`; new head is `prev`.",
    "String building: walk from head and append `->` between values.",
  ],
  solution: String.raw`package arch.day21;

public class Day21Exercise {

    static class Node {
        int v;
        Node next;
        Node(int v, Node next) {
            this.v = v;
            this.next = next;
        }
    }

    static String fmt(Node h) {
        if (h == null) return "EMPTY";
        StringBuilder sb = new StringBuilder();
        for (Node c = h; c != null; c = c.next) {
            if (sb.length() > 0) sb.append("->");
            sb.append(c.v);
        }
        return sb.toString();
    }

    static Node reverse(Node head) {
        Node prev = null;
        Node curr = head;
        while (curr != null) {
            Node nxt = curr.next;
            curr.next = prev;
            prev = curr;
            curr = nxt;
        }
        return prev;
    }

    public static void main(String[] args) {
        Node head = new Node(1, new Node(2, new Node(3, new Node(4, null))));
        System.out.println("before=" + fmt(head));
        Node rev = reverse(head);
        System.out.println("after=" + fmt(rev));
    }
}
`,
};

const cheatsheetRows = [
  ["Walk list", "O(n) to reach index", "No random access"],
  ["Prepend", "O(1)", "New head pointer"],
  ["Dummy head", "Sentinel before real head", "Unifies edge inserts"],
  ["Reverse iter", "prev/curr/nxt", "O(n) time O(1) space"],
  ["Reverse recur", "Implicit stack", "O(n) space risk"],
  ["Floyd cycle", "slow 1x fast 2x", "O(n) time O(1) space"],
  ["Cycle start", "meet then head+1-step", "Phase 2 proof"],
  ["Merge sorted", "dummy + tail", "O(n+m)"],
  ["Intersection", "length align + walk", "Reference identity"],
  ["Middle", "slow/fast", "Clarify even length"],
  ["Delete given node", "copy next val", "Not tail"],
  ["DLL delete", "O(1) with node ref", "Rewire prev/next"],
  ["LRU combo", "HashMap + DLL", "O(1) get/put"],
  ["Array vs list", "cache + index", "Pick by access pattern"],
  ["Deep list", "avoid recursion", "StackOverflow guard"],
];

export default {
  title: "Linked Lists",
  tags: ["Fresher", "Intermediate", "Phase 3", "Interview Prep", "Satyverse(Satyam Parmar)"],
  prerequisites: ["Day 20", "Day 19"],
  learningObjectives: [
    "Manipulate singly linked lists with correct pointer order",
    "Use dummy nodes and merge patterns fluently",
    "Detect cycles and explain Floyd’s phases",
    "Compare iterative vs recursive reversal tradeoffs",
    "Implement remove-nth, intersection, and middle patterns",
    "Connect lists to LRU and production cache structures",
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
  mcqLabel: "Linked Lists",
  mcqDescription: "Thirty questions on singly/doubly lists, cycles, merge, reversal, LRU, and complexity.",
  mcqQuestions,
  cheatsheetRows,
};
