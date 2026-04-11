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

const why = `Hash maps are the engine behind deduplication, caches, indexes, and frequency sketches in almost every backend service. Interviews love them because bugs are subtle: a broken **equals/hashCode** pair creates ghost keys, duplicate rows, or “impossible” cache misses. Production loves them until someone uses a **mutable key** or collides every key into one bucket under adversarial input.

Understanding hashing is how you choose between **HashMap**, **LinkedHashMap**, **TreeMap**, and **ConcurrentHashMap**—not by memorizing names but by knowing whether you need **sorted keys**, **stable iteration**, **concurrency**, or raw **throughput**. That decision shows up when you build rate limiters, session stores, and inverted indexes.

This day also connects frequency problems to **O(n)** counting flows: first pass to accumulate, second pass to answer “first unique” or “top k.” Those patterns reappear in logging pipelines and stream windows where you cannot afford a quadratic pass over a growing vocabulary.

On call, “map memory exploded” often traces to **unbounded** \`Map\` growth in a cache without eviction, or to accidental retention via **static** maps holding request-scoped keys. The same structure that makes algorithms fast can hide leaks when lifecycle is unclear.

Finally, hashing is a **security** surface: collision amplification used to be a real threat vector. You may never implement defenses yourself, but knowing why buckets **treeify** and why keys should be well-distributed keeps you credible in senior conversations.`;

const pitfalls = [
  "Breaking **equals/hashCode** symmetry — keys appear absent despite `contains` feeling true; add unit tests for key type; fix with IDE-generated methods or records.",
  "**Mutable keys** mutated after `put` — entry stuck in wrong bucket; prod cache corruption; fix immutable keys or stable IDs.",
  "Using **`hashCode` only** in equals — collisions cause false positives; must compare meaningful fields.",
  "Choosing **TreeMap** for “speed” — adds O(log n) overhead when sort unused; profile; fix with HashMap unless range queries needed.",
  "**ConcurrentHashMap** with **null** — `NullPointerException`; differs from HashMap; validate inputs.",
  "Assuming **O(1) worst** case — crafted collisions degrade; monitor bucket stats in advanced cases; consider safer key types.",
  "Storing **heavy values** without eviction — heap blowups; OOM during traffic; fix TTL, size caps, WeakReference values where appropriate.",
  "Logging **map keys** with PII — compliance incidents; redact; fix structured logging policies.",
];

const exercise = {
  title: "Practice exercise",
  difficulty: "Intermediate",
  problem: `**Day 23 — Hash maps (assignment alignment)**

1. Build a **frequency map** for each character in a string (case-sensitive).
2. Print the map for input \`swiss\`.
3. Find the **first non-repeating character** in \`leetcode\` and print \`char=...\` (use frequency map + left-to-right scan).
4. If none exists, print \`char=_\` (underscore).`,
  hints: [
    "Use `HashMap<Character,Integer>` with `getOrDefault`.",
    "Second pass must follow original string order, not map iteration order.",
    "For `leetcode`, expect `l` as first unique.",
  ],
  solution: String.raw`package arch.day23;

import java.util.*;

public class Day23Exercise {

    static Map<Character, Integer> freq(String s) {
        Map<Character, Integer> m = new HashMap<>();
        for (char c : s.toCharArray()) {
            m.put(c, m.getOrDefault(c, 0) + 1);
        }
        return m;
    }

    public static void main(String[] args) {
        System.out.println(freq("swiss"));
        String w = "leetcode";
        Map<Character, Integer> f = freq(w);
        char ans = '_';
        for (char c : w.toCharArray()) {
            if (f.get(c) == 1) {
                ans = c;
                break;
            }
        }
        System.out.println("char=" + ans);
    }
}
`,
};

const cheatsheetRows = [
  ["equals/hashCode", "Equal → same hash", "Contract tests"],
  ["HashMap", "expected O(1)", "Watch collisions"],
  ["TreeMap", "sorted keys", "O(log n)"],
  ["LinkedHashMap", "insert/access order", "LRU mode"],
  ["CHM", "concurrent", "no null key/value"],
  ["Immutable key", "stable hash", "avoid lost entries"],
  ["Load factor", "resize trigger", "amortized cost"],
  ["Treeify", "long buckets", "Java 8+"],
  ["computeIfAbsent", "lazy init", "grouping"],
  ["merge", "upsert combine", "counters"],
  ["Frequency", "two pass O(n)", "first unique"],
  ["Anagram key", "char count sig", "bucket words"],
  ["Two-sum", "map complement", "O(n) expected"],
  ["Subarray K", "prefix sums", "map counts"],
  ["Top K freq", "heap + map", "linearithmic"],
];

export default {
  title: "HashMaps and Hashing",
  tags: ["Fresher", "Intermediate", "Phase 3", "Interview Prep", "Satyverse(Satyam Parmar)"],
  prerequisites: ["Day 22", "Day 21"],
  learningObjectives: [
    "Apply equals/hashCode rules for map keys",
    "Choose HashMap, LinkedHashMap, TreeMap, or CHM appropriately",
    "Implement frequency and grouping patterns in O(n)",
    "Explain collision, load factor, and resize behavior",
    "Design LRU-style structures with map + list",
    "Recognize security and memory pitfalls of unbounded maps",
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
  mcqLabel: "HashMaps and Hashing",
  mcqDescription: "Thirty questions on contracts, map variants, concurrency, collisions, and classic counting problems.",
  mcqQuestions,
  cheatsheetRows,
};
