export const basicCode = String.raw`package arch.day26;

import java.util.*;

public class Day26Basic {

    public static void main(String[] args) {
        int[] a = { 5, 1, 4, 2, 3 };
        Arrays.sort(a);
        System.out.println("=== Sorted array ===");
        System.out.println(Arrays.toString(a));
        String[] w = { "banana", "apple", "Apricot" };
        Arrays.sort(w, String.CASE_INSENSITIVE_ORDER);
        System.out.println(Arrays.toString(w));
    }
}
`;

export const basicOutput = `=== Sorted array ===
[1, 2, 3, 4, 5]
[apple, Apricot, banana]
`;

export const intermediateCode = String.raw`package arch.day26;

public class Day26Intermediate {

    static int binarySearch(int[] a, int t) {
        int lo = 0, hi = a.length - 1;
        while (lo <= hi) {
            int mid = lo + ((hi - lo) >>> 1);
            if (a[mid] == t) return mid;
            if (a[mid] < t) lo = mid + 1;
            else hi = mid - 1;
        }
        return -1;
    }

    static int lowerBound(int[] a, int t) {
        int lo = 0, hi = a.length;
        while (lo < hi) {
            int mid = lo + ((hi - lo) >>> 1);
            if (a[mid] < t) lo = mid + 1;
            else hi = mid;
        }
        return lo;
    }

    public static void main(String[] args) {
        int[] a = { 1, 3, 3, 5, 7, 9 };

        // --- Scenario 1: exact search hit ---
        System.out.println("--- Scenario 1: exact ---");
        System.out.println(binarySearch(a, 7));
        System.out.println();

        // --- Scenario 2: missing ---
        System.out.println("--- Scenario 2: missing ---");
        System.out.println(binarySearch(a, 4));
        System.out.println();

        // --- Scenario 3: lower bound first >= target ---
        System.out.println("--- Scenario 3: lowerBound 3 ---");
        System.out.println(lowerBound(a, 3));
        System.out.println();

        // --- Scenario 4: lowerBound insert position ---
        System.out.println("--- Scenario 4: lowerBound 6 ---");
        System.out.println(lowerBound(a, 6));
    }
}
`;

export const intermediateOutput = `--- Scenario 1: exact ---
3

--- Scenario 2: missing ---
-1

--- Scenario 3: lowerBound 3 ---
1

--- Scenario 4: lowerBound 6 ---
4
`;

export const advancedCode = String.raw`package arch.day26;

public class Day26Advanced {

    static int peak(int[] a) {
        int lo = 0, hi = a.length - 1;
        while (lo < hi) {
            int mid = lo + ((hi - lo) >>> 1);
            if (a[mid] < a[mid + 1]) lo = mid + 1;
            else hi = mid;
        }
        return lo;
    }

    public static void main(String[] args) {
        // === Block 1: peak index (unimodal) ===
        System.out.println("=== Block 1: peak ===");
        int[] m = { 1, 3, 5, 4, 2 };
        System.out.println("peakIndex=" + peak(m));
        System.out.println();

        // === Block 2: sort stability note ===
        System.out.println("=== Block 2: stability ===");
        System.out.println("TimSort on Object[]: stable O(n log n).");
        System.out.println("Arrays.sort int[]: fast primitive sort, not stable concern.");
        System.out.println();

        // === Block 3: when binary search fails ===
        System.out.println("=== Block 3: prerequisites ===");
        System.out.println("Need sorted order + random access O(1) index.");
        System.out.println("Linked list mid not O(1) -> avoid classic BS on list.");
    }
}
`;

export const advancedOutput = `=== Block 1: peak ===
peakIndex=2

=== Block 2: stability ===
TimSort on Object[]: stable O(n log n).
Arrays.sort int[]: fast primitive sort, not stable concern.

=== Block 3: prerequisites ===
Need sorted order + random access O(1) index.
Linked list mid not O(1) -> avoid classic BS on list.
`;
