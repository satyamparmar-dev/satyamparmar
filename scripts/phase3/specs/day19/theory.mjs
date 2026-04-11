export const theoryTitle = "Complexity analysis";

export const theoryBase = `### Plain-language overview

**Complexity analysis** is how engineers predict how work grows when inputs grow. In interviews it is not a ritual suffix you append after coding — it is the **contract** you are signing about scalability, tail latency, and operational risk. Big-O describes an **upper bound** on growth; Theta describes a **tight** bound when best and worst match in order; Omega is a **lower bound**. Candidates who mix these casually sound imprecise; candidates who name the **dominant operation** (comparisons, probes, allocations, recursive calls) sound senior.

**Interview angle:** start every complexity answer with “dominant work per input size,” then name assumptions (sorted input, unique keys, bounded alphabet).

### Big-O, Theta, Omega — precise use

| Symbol | Meaning | Interview phrasing |
| --- | --- | --- |
| **O(f)** | Worst case grows ≤ c·f(n) for large n | “At most on the order of …” |
| **Ω(f)** | Some family forces ≥ c·f(n) | “At least … for adversarial input” |
| **Θ(f)** | Tight: both O and Ω | “Growth is exactly … up to constants” |

**Interview angle:** saying “average O(n)” without defining the input distribution is a red flag — clarify model or say “expected under random hash” explicitly.

### Worst, average, amortized

**Worst case** protects SLAs when an attacker or pathological dataset hits your service. **Average case** can look sunny but hides spikes. **Amortized** spreads rare expensive operations across many cheap ones (dynamic array doubling, disjoint-set union). In production you still watch **p99** because amortized reasoning can mask periodic latency cliffs when resizing triggers.

**Interview angle:** for **ArrayList.add**, cite amortized O(1) but mention the rare O(n) copy — that is the question behind many “why did GC spike?” incidents.

### Counting dominant operations

1. Pick the **innermost** loop or recursive branch that scales with n.
2. Multiply nested dimensions (nested loops over n → n²; two independent dimensions n·m → nm).
3. Add sequential blocks — **keep the largest term**.
4. Include **hidden** work: sorting inside a loop, **substring** copying, boxing, map resizing.

**Interview angle:** “I charge O(n log n) for the sort; the scan is O(n); total dominated by sort.”

### Recurrence intuition (no magic)

| Recurrence shape | Typical source | Closed form (interview) |
| --- | --- | --- |
| T(n)=T(n/2)+O(1) | Halve search space | O(log n) |
| T(n)=T(n/2)+O(n) | Partition-style | O(n) total level work × log levels |
| T(n)=2T(n/2)+O(n) | Divide & conquer merge | O(n log n) |
| T(n)=T(n-1)+O(1) | Linear chain | O(n) |
| T(n)=T(n-1)+O(n) | Nested recurrence | O(n²) |

**Interview angle:** draw the recursion tree or count levels — interviewers prefer a **sketch** over memorized master-theorem quoting.

### Space: auxiliary vs recursion stack

**Auxiliary space** excludes the input itself but includes allocated buffers, hash tables, and output if required. **Recursion stack** depth can turn a “O(1) extra” claim into O(n) if each frame holds constant work but depth is n. Java has no mandatory tail-call elimination — depth matters.

**Interview angle:** iterative BFS with a queue: O(width) space; DFS recursion: O(height) stack.

### Hidden constants and hardware reality

Big-O drops constants, but constants win at small n and inside tight loops. Cache locality makes adjacent array scans faster than pointer-chasing linked lists with the same asymptotic class. In interviews you acknowledge **O-notation vs engineering**: choose the simpler O(n log n) with better constants over a worse-hidden O(n log² n).

**Interview angle:** “Asymptotically same class, but contiguous memory wins on real CPUs.”

### Common complexity classes (problem families)

| Class | Example patterns |
| --- | --- |
| O(1) | Array index, hash map get average |
| O(log n) | Binary search, balanced BST height ops |
| O(n) | Single pass, BFS/DFS on graph with O(V+E) |
| O(n log n) | Sorting lower bound comparison-based |
| O(n²) | All pairs, naive duplicate check |
| O(2^n) | Exhaustive subsets (bitmasks/backtracking) |

**Interview angle:** map the **problem statement** to a family before coding — saves ten minutes of dead ends.

### Adversarial inputs that break “average” claims

Hash maps degrade without balanced trees if collisions cluster. Quicksort random pivot avoids worst n² on sorted input — in Java **Arrays.sort** uses tuned algorithms; still know the pitfall. Regular nested loops on user-controlled sizes are DoS vectors — complexity is a **security** property.

**Interview angle:** tie worst-case awareness to rate limits and max payload sizes.

### Empirical validation without fooling yourself

Micro-benchmarks lie: JVM warmup, GC, OS scheduling. Still, **growth ratios** across n = 100, 1_000, 10_000 can expose accidental n². Prefer **deterministic operation counters** when teaching or testing; if timing, warm up, fix n trials, report median.

**Interview angle:** “I would sanity-check growth on representative sizes and profile if p99 regresses.”

### Production symptoms mapped to complexity

| Symptom | Often implies |
| --- | --- |
| p99 grows superlinearly with batch size | Hidden quadratic merge or sort-in-loop |
| CPU flat but latency up | Lock contention — not pure asymptotics |
| GC churn spikes | Allocations inside hot loops / boxing |
| Timeouts only on large tenants | Per-tenant O(n²) aggregation |

**Interview angle:** connect **metrics** to **algorithm structure**, not only to “CPU high.”

### Interview speaking template (60 seconds)

“I identify the dominant operation and whether input structure changes the bound — sorted, distinct, bounded range. I state time and space, including recursion depth. I mention worst vs amortized if the structure is dynamic. If two solutions differ, I compare classes first, then practical constants and implementation risk. If unsure, I propose a quick growth check or profiler confirmation rather than bluffing.”

### Cheatsheet mindset vs math theater

Interviewers want **sound reasoning**, not calculus. If you derive a sum, keep it lightweight: ∑i = n(n-1)/2 → Θ(n²). If you use master theorem, ensure **regularity** conditions match — otherwise use the tree method.

**Interview angle:** show **clear bookkeeping** of what you count — comparisons vs assignments vs hash probes.

### Trade-off table: faster algorithm vs simpler code

| Situation | Prefer |
| --- | --- |
| Small n (< 50) | Simple O(n²) if fewer bugs |
| Hot path at scale | Lower asymptotic class |
| Maintenance critical | Readable structure with documented complexity |
| Security sensitive | Strict worst-case structures (trees, ordered maps) |

### Closing 60-second story

“Complexity analysis is how I communicate scalability contracts. In an interview I derive bounds from dominant operations, separate worst and amortized, and include space for recursion and auxiliary structures. On the job I pair that with profiling because constants matter for p99. If latency grows faster than business growth, I look for nested loops, accidental sorting, and unbounded fan-out — then I prove the fix with measurements and a guardrail test that fails if someone reintroduces quadratic work.”
`;
