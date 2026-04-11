export const theoryTitle = "Dynamic programming basics";

export const theoryBase = `### Plain-language overview

**Dynamic programming** solves problems by combining answers to **overlapping subproblems** with **optimal substructure**. You either **memoize** top-down (cache recursion) or **tabulate** bottom-up (fill a table). Interviews want you to define **state**, **transition**, and **base cases** crisply.

**Interview angle:** state the **meaning** of dp[i] in one sentence before coding.

### Memoization vs tabulation

| Style | Pros | Cons |
| --- | --- | --- |
| Top-down + memo | Natural recursion, skips unreachable states | Recursion stack |
| Bottom-up | Iterative, often faster constants | Must order states |

**Interview angle:** Fibonacci memo is the hello world; climbing stairs extends one-liner recurrence.

### Overlapping subproblems

Naive recursion recomputes same branches—exponential. Cache turns to linear states.

### Optimal substructure

Global optimum composed of optimal subsolutions—fails in some counting problems with constraints—watch out.

### State design

Dimensions often index + constraint (knapsack weight). More dimensions ⇒ more memory—**compress** if only previous row needed.

### Base cases

Off-by-one in Fibonacci: dp[0]=0, dp[1]=1 typical. Climbing stairs uses dp[0]=1 sometimes—**define** clearly.

### Complexity

O(states × transition cost). Space can often roll to O(1) or O(width).

### Common patterns

Fibonacci, coin change (unbounded vs bounded), LCS, LIS (patience sorting trick advanced), grid paths.

### Production

DP appears in pricing, scheduling, resource allocation models—often behind solvers; interviews use toy versions.

### 60-second story

“I name dp[i] meaning. I write recurrence with base cases. I choose top-down memo or bottom-up by stack and sparsity. I analyze O(n) states for Fibonacci memo. I mention space optimization when only last two rows matter.”
`;
