export const theoryTitle = "Sorting and binary search";

export const theoryBase = `### Plain-language overview

**Sorting** orders elements so you can **binary search**, merge streams, or satisfy monotonic invariants. **Binary search** halves a sorted searchable space each step—O(log n) comparisons when random access is O(1).

**Interview angle:** identify **duplicates**, **rotated** arrays, and **bounds** variants (first ≥ x).

### Comparison sort lower bound

Ω(n log n) comparisons for general comparison sorts—mergesort/heapsort achieve; quicksort average O(n log n), worst O(n²) without care.

### Stability

**Stable** sorts preserve relative order of equal keys—important for multi-key sorting. Mergesort stable; typical quicksort unstable.

**Interview angle:** Java **Arrays.sort(Object[])** uses TimSort—stable O(n log n).

### Java primitives sort

**Arrays.sort(int[])** uses dual-pivot quicksort—fast but know worst-case pathologies conceptually.

### Binary search template

Maintain **[lo, hi]** invariant; mid = lo + (hi-lo)/2 avoids overflow. Lower bound: first index with **a[i] ≥ target**.

**Interview angle:** avoid **lo+hi** overflow.

### Rotated sorted array

Still partially monotonic—modified binary search compares against endpoints.

### Counting / radix (awareness)

Non-comparison sorts can be O(n) with bounded key domains—not universal.

### Applications

Indexes, joins, scheduling by time, percentile queries after sort.

### 60-second story

“I pick sort when order unlocks log search or two pointers. I state stability needs. For binary search I define invariant on lo/hi, use safe mid, handle duplicates with bound variants. I note O(n log n) sort cost if input unsorted.”
`;
