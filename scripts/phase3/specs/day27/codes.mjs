export const basicCode = String.raw`package arch.day27;

public class Day27Basic {

    static long fibIter(int n) {
        if (n <= 1) return n;
        long a = 0, b = 1;
        for (int i = 2; i <= n; i++) {
            long c = a + b;
            a = b;
            b = c;
        }
        return b;
    }

    public static void main(String[] args) {
        System.out.println("=== Fibonacci bottom-up O(n) time O(1) space ===");
        for (int i = 0; i <= 10; i++) {
            System.out.print(fibIter(i) + (i == 10 ? "" : " "));
        }
        System.out.println();
    }
}
`;

export const basicOutput = `=== Fibonacci bottom-up O(n) time O(1) space ===
0 1 1 2 3 5 8 13 21 34 55
`;

export const intermediateCode = String.raw`package arch.day27;

import java.util.*;

public class Day27Intermediate {

    static long fibMemo(int n, long[] memo) {
        if (n <= 1) return n;
        if (memo[n] != 0) return memo[n];
        memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
        return memo[n];
    }

    static int climbStairs(int n) {
        if (n <= 2) return n;
        int a = 1, b = 2;
        for (int i = 3; i <= n; i++) {
            int c = a + b;
            a = b;
            b = c;
        }
        return b;
    }

    public static void main(String[] args) {
        // --- Scenario 1: memo fib ---
        System.out.println("--- Scenario 1: fibMemo(20) ---");
        long[] memo = new long[21];
        System.out.println(fibMemo(20, memo));
        System.out.println();

        // --- Scenario 2: climbing stairs n=5 ---
        System.out.println("--- Scenario 2: climbStairs 5 ---");
        System.out.println(climbStairs(5));
        System.out.println();

        // --- Scenario 3: coin change min coins (1,3,4) target 6 ---
        System.out.println("--- Scenario 3: coinChange tabulation ---");
        int[] coins = { 1, 3, 4 };
        int t = 6;
        int[] dp = new int[t + 1];
        Arrays.fill(dp, 1_000_000);
        dp[0] = 0;
        for (int x = 1; x <= t; x++) {
            for (int c : coins) {
                if (x >= c) dp[x] = Math.min(dp[x], dp[x - c] + 1);
            }
        }
        System.out.println(dp[t]);
        System.out.println();

        // --- Scenario 4: house robber linear ---
        System.out.println("--- Scenario 4: robber max ---");
        int[] h = { 2, 7, 9, 3, 1 };
        int p2 = 0, p1 = 0;
        for (int x : h) {
            int cur = Math.max(p1, p2 + x);
            p2 = p1;
            p1 = cur;
        }
        System.out.println(p1);
    }
}
`;

export const intermediateOutput = `--- Scenario 1: fibMemo(20) ---
6765

--- Scenario 2: climbStairs 5 ---
8

--- Scenario 3: coinChange tabulation ---
2

--- Scenario 4: robber max ---
12
`;

export const advancedCode = String.raw`package arch.day27;

public class Day27Advanced {

    static int lcs(String a, String b) {
        int n = a.length(), m = b.length();
        int[] prev = new int[m + 1];
        for (int i = 1; i <= n; i++) {
            int[] cur = new int[m + 1];
            for (int j = 1; j <= m; j++) {
                if (a.charAt(i - 1) == b.charAt(j - 1)) {
                    cur[j] = prev[j - 1] + 1;
                } else {
                    cur[j] = Math.max(prev[j], cur[j - 1]);
                }
            }
            prev = cur;
        }
        return prev[m];
    }

    public static void main(String[] args) {
        // === Block 1: LCS length ===
        System.out.println("=== Block 1: LCS ===");
        System.out.println(lcs("abcde", "ace"));
        System.out.println();

        // === Block 2: DP checklist ===
        System.out.println("=== Block 2: define before code ===");
        System.out.println("1) Meaning of state");
        System.out.println("2) Recurrence + base");
        System.out.println("3) Order / memo");
        System.out.println("4) Target state answer");
        System.out.println("5) Complexity");
        System.out.println();

        // === Block 3: tabulation vs memo ===
        System.out.println("=== Block 3: tradeoff ===");
        System.out.println("Top-down: skips unreachable; recursion stack.");
        System.out.println("Bottom-up: iterative; must fill order correctly.");
    }
}
`;

export const advancedOutput = `=== Block 1: LCS ===
3

=== Block 2: define before code ===
1) Meaning of state
2) Recurrence + base
3) Order / memo
4) Target state answer
5) Complexity

=== Block 3: tradeoff ===
Top-down: skips unreachable; recursion stack.
Bottom-up: iterative; must fill order correctly.
`;
