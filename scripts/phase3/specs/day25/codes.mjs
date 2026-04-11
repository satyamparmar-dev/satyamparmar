export const basicCode = String.raw`package arch.day25;

import java.util.*;

public class Day25Basic {

    public static void main(String[] args) {
        PriorityQueue<Integer> pq = new PriorityQueue<>();
        pq.offer(5);
        pq.offer(1);
        pq.offer(3);
        System.out.println("=== Min-heap poll order ===");
        while (!pq.isEmpty()) {
            System.out.print(pq.poll() + (pq.isEmpty() ? "" : " "));
        }
        System.out.println();
    }
}
`;

export const basicOutput = `=== Min-heap poll order ===
1 3 5
`;

export const intermediateCode = String.raw`package arch.day25;

import java.util.*;

public class Day25Intermediate {

    static int kthLargest(int[] a, int k) {
        PriorityQueue<Integer> pq = new PriorityQueue<>();
        for (int x : a) {
            pq.offer(x);
            if (pq.size() > k) {
                pq.poll();
            }
        }
        return pq.peek();
    }

    public static void main(String[] args) {
        int[] a = { 3, 2, 1, 5, 6, 4 };

        // --- Scenario 1: kth largest ---
        System.out.println("--- Scenario 1: kth largest k=2 ---");
        System.out.println(kthLargest(a, 2));
        System.out.println();

        // --- Scenario 2: max-heap via comparator ---
        System.out.println("--- Scenario 2: max-heap peek ---");
        PriorityQueue<Integer> maxh = new PriorityQueue<>(Comparator.reverseOrder());
        maxh.offer(1);
        maxh.offer(9);
        maxh.offer(4);
        System.out.println(maxh.peek());
        System.out.println();

        // --- Scenario 3: merge two sorted with PQ ---
        System.out.println("--- Scenario 3: k-way style pair merge ---");
        int[] x = { 1, 4, 7 };
        int[] y = { 2, 5 };
        int i = 0, j = 0;
        StringBuilder sb = new StringBuilder();
        while (i < x.length && j < y.length) {
            if (x[i] <= y[j]) {
                sb.append(x[i++]).append(' ');
            } else {
                sb.append(y[j++]).append(' ');
            }
        }
        while (i < x.length) sb.append(x[i++]).append(' ');
        while (j < y.length) sb.append(y[j++]).append(' ');
        System.out.println(sb.toString().trim());
        System.out.println();

        // --- Scenario 4: tie-break comparator ---
        System.out.println("--- Scenario 4: string length then lex ---");
        PriorityQueue<String> s = new PriorityQueue<>(
            Comparator.comparingInt(String::length).thenComparing(Comparator.naturalOrder()));
        s.offer("bb");
        s.offer("a");
        s.offer("ccc");
        System.out.println(s.poll() + "," + s.poll() + "," + s.poll());
    }
}
`;

export const intermediateOutput = `--- Scenario 1: kth largest k=2 ---
5

--- Scenario 2: max-heap peek ---
9

--- Scenario 3: k-way style pair merge ---
1 2 4 5 7

--- Scenario 4: string length then lex ---
a,bb,ccc
`;

export const advancedCode = String.raw`package arch.day25;

import java.util.*;

public class Day25Advanced {

    static void heapifyDown(int[] h, int n, int i) {
        while (true) {
            int l = 2 * i + 1;
            int r = 2 * i + 2;
            int sm = i;
            if (l < n && h[l] < h[sm]) sm = l;
            if (r < n && h[r] < h[sm]) sm = r;
            if (sm == i) break;
            int t = h[i];
            h[i] = h[sm];
            h[sm] = t;
            i = sm;
        }
    }

    public static void main(String[] args) {
        // === Block 1: manual sift demo ===
        System.out.println("=== Block 1: array heapify root ===");
        int[] h = { 2, 5, 1 };
        heapifyDown(h, 3, 0);
        System.out.println(Arrays.toString(h));
        System.out.println();

        // === Block 2: complexity ===
        System.out.println("=== Block 2: PQ operations ===");
        System.out.println("offer/poll: O(log n)");
        System.out.println("peek: O(1)");
        System.out.println("build-heap batch: O(n) bottom-up");
        System.out.println();

        // === Block 3: when not PQ ===
        System.out.println("=== Block 3: choose structure ===");
        System.out.println("Need FIFO fairness -> Queue not PQ");
        System.out.println("Need exact median stream -> two heaps");
        System.out.println("Need all elements sorted -> sort array");
    }
}
`;

export const advancedOutput = `=== Block 1: array heapify root ===
[1, 5, 2]

=== Block 2: PQ operations ===
offer/poll: O(log n)
peek: O(1)
build-heap batch: O(n) bottom-up

=== Block 3: choose structure ===
Need FIFO fairness -> Queue not PQ
Need exact median stream -> two heaps
Need all elements sorted -> sort array
`;
