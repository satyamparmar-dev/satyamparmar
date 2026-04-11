export const theoryTitle = "Heaps and priority queues";

export const theoryBase = `### Plain-language overview

A **binary heap** is a complete tree with **heap order**: min-heap parent ≤ children; max-heap parent ≥ children. Java’s **PriorityQueue** is a min-heap by default (smallest at head). **offer/poll** are O(log n); **peek** is O(1).

**Interview angle:** heap is **not** FIFO—tie-breaks need explicit comparator.

### Array indexing

For 0-based heap array: parent **(i-1)/2**, children **2i+1** and **2i+2**. Complete tree ⇒ dense array storage.

### Build-heap

Bottom-up heapify can build in O(n) for n elements—better than n successive inserts for static batch (theory question).

### Top-K patterns

Keep size-k heap: for “k largest” in min-heap of size k storing the k biggest seen so far; for “k smallest” use max-heap of size k.

**Interview angle:** clarify ascending vs descending desired order.

### k-way merge

Use min-heap of iterators across k sorted lists—classic pattern.

### Dijkstra awareness

Priority queue drives shortest path on graphs—mention if interviewer goes advanced.

### Limited capacity

**PriorityBlockingQueue** for concurrent bounded priority scheduling.

### Production

Job schedulers, rate limiting windows, streaming top-k, A* search. Watch **comparator consistency with equals** for correctness.

### 60-second story

“I use PriorityQueue with explicit Comparator. I know offer/poll logarithmic, peek constant. For top-k I bound heap size k. I distinguish heap from FIFO queue. I mention O(n) build-heap if batch static.”
`;
