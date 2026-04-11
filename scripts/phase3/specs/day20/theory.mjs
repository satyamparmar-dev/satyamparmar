export const theoryTitle = "Arrays and two pointers";

export const theoryBase = `### Plain-language overview

**Arrays** give O(1) random access by index; **two pointers** are two indices moving through an array (or two arrays) while preserving a **invariant**—often monotonicity in a sorted structure. Interviews love this pattern because it turns O(n²) “try all pairs” thinking into O(n) single-pass reasoning when the data supports it.

**Interview angle:** before coding, say whether the array is **sorted**, whether elements are **distinct**, and whether you need **all** solutions or one.

### Why two pointers work

When the array is sorted, if \`a[i] + a[j]\` is too small for a target, increasing \`i\` raises the sum; if too large, decreasing \`j\` lowers it. That **monotone** adjustment visits each candidate edge at most once—hence linear time. The same spirit appears in merging sorted arrays and partitioning.

**Interview angle:** prove that you never skip the only valid pair—usually because moving the wrong pointer would only worsen the gap.

### Sliding window (related family)

A **window** is a subarray defined by left/right pointers. **Fixed-size** windows slide one step; **variable-size** windows grow/shrink while a condition holds (longest substring with at most k distinct chars). Complexity is often O(n) because each element enters and leaves the window a bounded number of times.

**Interview angle:** state what you count inside the window and what you reset when the constraint breaks.

### Sorted vs unsorted

Two-pointer pair tricks typically require **sorted** input. If unsorted, sorting costs O(n log n) unless another structure (hash map) gives O(n) expected. Choose based on whether you need indices stable, memory limits, or duplicate handling.

**Interview angle:** compare **O(n) hash** vs **O(n log n) sort + two pointers** for two-sum variants.

### Invariants checklist

| Invariant type | Example |
| --- | --- |
| Ordering | \`i < j\` and both move toward center |
| Value bound | sum ≤ target while maximizing length |
| Partition | elements left of p are ≤ pivot |

**Interview angle:** one sentence: “I keep left as the smallest viable index and right as the largest.”

### Common pitfalls in code

Off-by-one with empty arrays, duplicate skipping when problem wants unique triplets, and integer overflow on \`a[i]+a[j]\` (use \`long\` in Java for sums). For **subarray** problems, clarify if empty subarray is allowed.

**Interview angle:** mention overflow before the interviewer does.

### Stability and duplicates

When skipping duplicates for uniqueness, move pointers while \`a[i] == a[i+1]\` **after** recording a valid triplet—order matters to avoid dropping valid combinations.

**Interview angle:** show dry-run on \`[1,1,2,2,3]\`.

### Partition and Dutch flag

**Partition** around a pivot rearranges elements in O(n) with two or three regions. Dutch national flag extends to three colors—three pointers. This is the structural cousin of quicksort and certain stream aggregations.

**Interview angle:** connect partition to quickselect for k-th largest.

### Prefix sums (array companion pattern)

**Prefix sum** turns range sum queries into O(1) after O(n) preprocessing: \`psum[i] = sum(a[0..i-1])\`. Pair with hash map for “subarray sum = k” in O(n).

**Interview angle:** separate **index** prefix from **value** prefix to avoid off-by-one.

### Two arrays, two pointers

Merging sorted arrays or computing intersections uses two indices advancing independently—total work O(n+m) because each step advances at least one pointer.

**Interview angle:** tie-break when \`a[i]==b[j]\` based on problem (unique intersection vs multiset).

### Complexity table

| Pattern | Preconditions | Time | Extra space |
| --- | --- | --- | --- |
| Two sum sorted | sorted | O(n) | O(1) |
| Two sum unsorted | none | O(n) expected hash | O(n) |
| Merge sorted | two sorted | O(n+m) | O(1) if output given |
| Sliding window | contiguous | O(n) typical | O(k) for counts |

### Production mapping

Batch processors often **sort once** then **stream** with two pointers to avoid quadratic joins in memory. Watch for **stable sort** needs when merging labeled events.

**Interview angle:** mention sort cost amortized over many queries on the same array.

### 60-second story

“I check if the array is sorted. If yes, I use two pointers with a monotone invariant—each adjustment excludes impossible candidates. If not, I compare hash map O(n) expected versus sort-then-scan O(n log n) for memory and determinism. I watch overflow on sums, duplicate policy, and empty inputs. I prove we never skip the answer by showing the rejected side cannot contain the target.”
`;
