/** Phase 3 — DSA (Days 19–27) */
export default {
  19: `**Big-O is about growth, not microseconds.** Count dominant operations; drop constants and lower terms. Worst case matters for interviews; amortized for structures like dynamic arrays.

**Space complexity:** include recursion stack depth; tail recursion is not free in Java.

**Empirical check:** time a few input sizes and see if ratio matches expected doubling behaviour — catches wrong complexity assumptions.

**Interview:** always state assumptions (input size, sorted or not, memory limits) before choosing algorithm.`,

  20: `**Two pointers** often turn O(n²) into O(n) on sorted arrays — pair sum, triplet, container with most water pattern.

**Sliding window** for contiguous subarray problems — expand/shrink while maintaining invariant.

**Prefix sums** answer range queries in O(1) after O(n) prep — essential for competitive and analytics code.`,

  21: `**Singly vs doubly linked:** deletion with only head pointer is O(n) singly; doubly with tail enables LRU designs.

**Dummy head** simplifies insertion at front — fewer null checks.

**Fast/slow pointers** detect cycles (Floyd) — know invariants: when they meet, resetting one to head finds cycle start.

**Memory:** each node is overhead vs array — cache locality worse; choose lists when frequent inserts in middle.`,

  22: `**Stack = LIFO** — parentheses, DFS iterative, monotonic stack for next-greater-element.

**Queue = FIFO** — BFS levels, task scheduling; \`Deque\` for both ends (\`ArrayDeque\` preferred over \`Stack\` class).

**PriorityQueue** is heap-backed — O(log n) insert; not a stable queue for fairness unless you tie-break.`,

  23: `**Hash function + buckets** — collisions via chaining or open addressing; Java \`HashMap\` uses linked nodes and may treeify.

**Load factor** trades memory vs collisions — default 0.75 is a good general default.

**Equals/hashCode** must agree for keys; \`IdentityHashMap\` for reference semantics (rare).

**Concurrent maps:** \`ConcurrentHashMap\` segment locking / node locking — avoid \`null\` keys.`,

  24: `**Tree traversals:** inorder on BST yields sorted order; preorder reconstructs with structure hints; postorder for deletion.

**BST vs balanced trees:** \`TreeMap\` is red-black — guarantees O(log n); know when skewed BST degrades to linked list.

**Tries** for prefix strings; segment trees / Fenwick for range aggregates — mention when problem is range-heavy.`,

  25: `**Heap property:** parent dominates children — \`PriorityQueue\` is min-heap by default; custom \`Comparator\` for max.

**Heapify** is O(n) for building from array — know why (bottom-up is cheaper than n inserts).

**Top-K** problems: fixed-size heap streaming over large inputs — memory-friendly pattern.

**Dijkstra** uses heap for frontier — connect theory to graph algorithms you will reuse.`,

  26: `**Binary search** requires monotonic predicate — not only on arrays but on answer space (“min capacity to ship packages”).

**Invariant style:** define \`[lo, hi)\` or \`[lo, hi]\` and never mix — off-by-one bugs dominate.

**Sorting stability** matters when secondary keys exist — \`Collections.sort\` guarantees stable merge sort / TimSort behaviour.

**Custom comparators** in \`Arrays.sort(T[], Comparator)\` — avoid violating transitivity.`,

  27: `**DP = optimal substructure + overlapping subproblems.** Top-down memo vs bottom-up table — same complexity, different stack use.

**State design:** dimensions are often index + constraint (knapsack weight); reduce state space when possible.

**Space optimization:** rolling array when transition only needs previous row.

**Interview:** start brute force recursion, identify repeated calls, add memo — shows structured thinking.`,
};
