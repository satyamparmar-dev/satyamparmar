export const basicCode = String.raw`package arch.day20;

public class Day20Basic {

    static void printPair(int[] a, int i, int j) {
        System.out.println("i=" + i + " j=" + j + " sum=" + (a[i] + a[j]));
    }

    public static void main(String[] args) {
        int[] a = { 1, 3, 4, 6, 10 };
        int target = 9;
        int i = 0;
        int j = a.length - 1;
        System.out.println("=== Two pointers on sorted array ===");
        System.out.println("target=" + target);
        while (i < j) {
            int s = a[i] + a[j];
            if (s == target) {
                printPair(a, i, j);
                break;
            } else if (s < target) {
                i++;
            } else {
                j--;
            }
        }
        System.out.println("final_i=" + i + " final_j=" + j);
    }
}
`;

export const basicOutput = `=== Two pointers on sorted array ===
target=9
i=1 j=3 sum=9
final_i=1 final_j=3
`;

export const intermediateCode = String.raw`package arch.day20;

import java.util.*;

public class Day20Intermediate {

    static int[] twoSumSorted(int[] a, int t) {
        int i = 0, j = a.length - 1;
        while (i < j) {
            long s = (long) a[i] + a[j];
            if (s == t) return new int[] { i, j };
            if (s < t) i++;
            else j--;
        }
        return new int[] { -1, -1 };
    }

    static List<Integer> mergeUnique(int[] x, int[] y) {
        List<Integer> out = new ArrayList<>();
        int i = 0, j = 0;
        while (i < x.length && j < y.length) {
            if (x[i] < y[j]) {
                out.add(x[i++]);
            } else if (x[i] > y[j]) {
                out.add(y[j++]);
            } else {
                out.add(x[i]);
                i++;
                j++;
            }
        }
        while (i < x.length) out.add(x[i++]);
        while (j < y.length) out.add(y[j++]);
        return out;
    }

    public static void main(String[] args) {
        int[] a = { 1, 2, 4, 7, 10 };

        // --- Scenario 1: two sum sorted ---
        System.out.println("--- Scenario 1: two sum sorted ---");
        int[] p = twoSumSorted(a, 9);
        System.out.println("indices=" + p[0] + "," + p[1]);
        System.out.println();

        // --- Scenario 2: merge two sorted ---
        System.out.println("--- Scenario 2: merge sorted arrays ---");
        System.out.println(mergeUnique(new int[] { 1, 3, 5 }, new int[] { 2, 3, 6 }));
        System.out.println();

        // --- Scenario 3: remove duplicates in-place length ---
        System.out.println("--- Scenario 3: dedupe sorted length ---");
        int[] d = { 1, 1, 2, 2, 3 };
        int w = 0;
        for (int r = 0; r < d.length; r++) {
            if (w == 0 || d[r] != d[w - 1]) {
                d[w++] = d[r];
            }
        }
        System.out.println("unique_count=" + w);
        System.out.println();

        // --- Scenario 4: partition negatives left ---
        System.out.println("--- Scenario 4: partition (<0 left) ---");
        int[] z = { 3, -1, 2, -4, 1 };
        int lo = 0, hi = z.length - 1;
        while (lo < hi) {
            while (lo < hi && z[lo] < 0) lo++;
            while (lo < hi && z[hi] >= 0) hi--;
            if (lo < hi) {
                int tmp = z[lo];
                z[lo] = z[hi];
                z[hi] = tmp;
                lo++;
                hi--;
            }
        }
        System.out.println("split_index=" + lo + " arr=" + Arrays.toString(z));
    }
}
`;

export const intermediateOutput = `--- Scenario 1: two sum sorted ---
indices=1,3

--- Scenario 2: merge sorted arrays ---
[1, 2, 3, 5, 6]

--- Scenario 3: dedupe sorted length ---
unique_count=3

--- Scenario 4: partition (<0 left) ---
split_index=2 arr=[-4, -1, 2, 3, 1]
`;

export const advancedCode = String.raw`package arch.day20;

public class Day20Advanced {

    static int maxLenSubarraySumAtMost(int[] a, int k) {
        int n = a.length;
        int best = 0;
        int sum = 0;
        int left = 0;
        for (int right = 0; right < n; right++) {
            sum += a[right];
            while (sum > k && left <= right) {
                sum -= a[left++];
            }
            if (sum <= k) {
                best = Math.max(best, right - left + 1);
            }
        }
        return best;
    }

    public static void main(String[] args) {
        // === Block 1: variable window — max length sum <= k ===
        System.out.println("=== Block 1: sliding window (sum <= k) ===");
        int[] w = { 1, 1, 1, 2 };
        System.out.println("max_len=" + maxLenSubarraySumAtMost(w, 3));
        System.out.println();

        // === Block 2: two-pointer decision table ===
        System.out.println("=== Block 2: when two pointers apply ===");
        System.out.println("Problem                    | Needs sort? | Typical time");
        System.out.println("---------------------------|-------------|-------------");
        System.out.println("Two sum pair               | YES (scan)| O(n)");
        System.out.println("Merge sorted               | YES       | O(n+m)");
        System.out.println("Container with most water  | NO        | O(n) two ends");
        System.out.println("Three sum unique triplets  | YES       | O(n^2) with skips");
        System.out.println();

        // === Block 3: trap — unsorted two-sum ===
        System.out.println("=== Block 3: hash vs sort tradeoff ===");
        System.out.println("Unsorted two-sum: HashMap expected O(n) time O(n) space.");
        System.out.println("Sort + two pointers: O(n log n) time O(1) extra besides sort.");
    }
}
`;

export const advancedOutput = `=== Block 1: sliding window (sum <= k) ===
max_len=3

=== Block 2: when two pointers apply ===
Problem                    | Needs sort? | Typical time
---------------------------|-------------|-------------
Two sum pair               | YES (scan)| O(n)
Merge sorted               | YES       | O(n+m)
Container with most water  | NO        | O(n) two ends
Three sum unique triplets  | YES       | O(n^2) with skips

=== Block 3: hash vs sort tradeoff ===
Unsorted two-sum: HashMap expected O(n) time O(n) space.
Sort + two pointers: O(n log n) time O(1) extra besides sort.
`;
