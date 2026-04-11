export const theoryTitle = "Stacks and queues";

export const theoryBase = `### Plain-language overview

A **stack** is LIFO: push/pop at one end. A **queue** is FIFO: enqueue at tail, dequeue from head. A **deque** generalizes both. Interviews use these for bracket matching, BFS layers, monotonic windows, and parsing. Production uses them in work queues, backpressure, and event loops.

**Interview angle:** say whether you need **LIFO** (DFS, recursion unrolling) or **FIFO** (BFS, fair scheduling).

### Stack — core operations

| Op | Typical cost (array impl) |
| --- | --- |
| push | O(1) amortized |
| pop | O(1) |
| peek | O(1) |

**Interview angle:** **ArrayDeque** is preferred over **Stack** class (legacy, synchronized).

### Queue — core operations

| Op | ArrayDeque | LinkedList |
| --- | --- | --- |
| offer/poll ends | O(1) | O(1) |
| random access | no | slow walk |

**Interview angle:** for pure queue, **ArrayDeque** avoids node allocation churn.

### Deque use cases

Sliding window max (monotonic deque), palindrome checks, work-stealing schedulers. Both ends O(1).

**Interview angle:** monotonic deque maintains candidates in increasing/decreasing order for next-greater-element problems.

### Monotonic stack intuition

For **next greater element**, keep a stack of indices with decreasing values; popping resolves answers when a larger value arrives—amortized O(n).

**Interview angle:** each element pushed/popped once.

### Balanced parentheses pattern

Push opens, on close pop must match top; end stack empty. Extends to tags and custom pairs.

**Interview angle:** map close→open or switch on char.

### Recursion unrolling

Call stack **is** a stack; iterative DFS uses explicit **Deque** to control depth and avoid overflow.

**Interview angle:** iterative can be safer for deep graphs.

### Bounded queues and backpressure

Fixed-capacity queues block, drop, or signal when full—ties to reactive streams and rate limiting.

**Interview angle:** mention **offer** vs **add** non-blocking behavior.

### Java API pitfalls

**Stack** legacy; **LinkedList** as queue allocates per node; **PriorityQueue** is **not** FIFO—it is a heap.

**Interview angle:** never use **PriorityQueue** when you need fair FIFO.

### Complexity summary

| Structure | Peek ends | Notes |
| --- | --- | --- |
| Stack | one | LIFO |
| Queue | head/tail | FIFO |
| Heap PQ | min/max | ordered, not arrival order |

### Production mapping

Thread pools, async event loops, breadcrumb stacks for undo, parser stacks for JSON/XML.

**Interview angle:** bounded queues protect memory under spikes.

### 60-second story

“I pick stack vs queue by traversal order: DFS→stack, BFS→queue. I use **ArrayDeque** for both ends unless I need priorities—then heap. For parentheses I map closing symbols and guard empty pop. For monotonic problems I explain each element enters/leaves stack once—O(n).”
`;
