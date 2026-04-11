export const basicCode = String.raw`package arch.day22;

import java.util.*;

public class Day22Basic {

    public static void main(String[] args) {
        Deque<Integer> st = new ArrayDeque<>();
        st.push(1);
        st.push(2);
        st.push(3);
        System.out.println("=== Stack LIFO pop order ===");
        while (!st.isEmpty()) {
            System.out.print(st.pop() + (st.isEmpty() ? "" : " "));
        }
        System.out.println();
        Deque<Integer> q = new ArrayDeque<>();
        q.offer(1);
        q.offer(2);
        q.offer(3);
        System.out.println("=== Queue FIFO poll order ===");
        while (!q.isEmpty()) {
            System.out.print(q.poll() + (q.isEmpty() ? "" : " "));
        }
        System.out.println();
    }
}
`;

export const basicOutput = `=== Stack LIFO pop order ===
3 2 1
=== Queue FIFO poll order ===
1 2 3
`;

export const intermediateCode = String.raw`package arch.day22;

import java.util.*;

public class Day22Intermediate {

    static boolean balanced(String s) {
        Deque<Character> st = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '[' || c == '{') {
                st.push(c);
            } else if (c == ')' || c == ']' || c == '}') {
                if (st.isEmpty()) return false;
                char o = st.pop();
                if (!match(o, c)) return false;
            }
        }
        return st.isEmpty();
    }

    static boolean match(char o, char cl) {
        return (o == '(' && cl == ')') || (o == '[' && cl == ']') || (o == '{' && cl == '}');
    }

    public static void main(String[] args) {
        // --- Scenario 1: balanced ---
        System.out.println("--- Scenario 1: balanced ---");
        System.out.println(balanced("([]){}"));
        System.out.println();

        // --- Scenario 2: unbalanced early ---
        System.out.println("--- Scenario 2: extra close ---");
        System.out.println(balanced("())"));
        System.out.println();

        // --- Scenario 3: unbalanced leftover open ---
        System.out.println("--- Scenario 3: leftover open ---");
        System.out.println(balanced("(([]"));
        System.out.println();

        // --- Scenario 4: deque both ends ---
        System.out.println("--- Scenario 4: deque as stack+queue ---");
        Deque<Integer> d = new ArrayDeque<>();
        d.offerLast(1);
        d.offerLast(2);
        d.offerFirst(0);
        System.out.println("pollFirst=" + d.pollFirst() + " pollLast=" + d.pollLast());
    }
}
`;

export const intermediateOutput = `--- Scenario 1: balanced ---
true

--- Scenario 2: extra close ---
false

--- Scenario 3: leftover open ---
false

--- Scenario 4: deque as stack+queue ---
pollFirst=0 pollLast=2
`;

export const advancedCode = String.raw`package arch.day22;

import java.util.*;

public class Day22Advanced {

    static int[] nextGreater(int[] a) {
        int n = a.length;
        int[] ans = new int[n];
        Arrays.fill(ans, -1);
        Deque<Integer> st = new ArrayDeque<>();
        for (int i = 0; i < n; i++) {
            while (!st.isEmpty() && a[i] > a[st.peek()]) {
                ans[st.pop()] = a[i];
            }
            st.push(i);
        }
        return ans;
    }

    public static void main(String[] args) {
        // === Block 1: monotonic stack demo ===
        System.out.println("=== Block 1: next greater element ===");
        int[] a = { 2, 1, 3, 4 };
        System.out.println(Arrays.toString(nextGreater(a)));
        System.out.println();

        // === Block 2: API choice table ===
        System.out.println("=== Block 2: Java deques vs legacy ===");
        System.out.println("Need              | Prefer");
        System.out.println("------------------|------------------");
        System.out.println("LIFO stack        | ArrayDeque (not java.util.Stack)");
        System.out.println("FIFO queue        | ArrayDeque offer/poll");
        System.out.println("Priority order    | PriorityQueue (not FIFO)");
        System.out.println("Thread-safe queue | ArrayBlockingQueue / concurrent");
        System.out.println();

        // === Block 3: complexity ===
        System.out.println("=== Block 3: monotonic stack ===");
        System.out.println("Each index pushed/popped once -> O(n) time for next-greater sweep.");
    }
}
`;

export const advancedOutput = `=== Block 1: next greater element ===
[3, 3, 4, -1]

=== Block 2: Java deques vs legacy ===
Need              | Prefer
------------------|------------------
LIFO stack        | ArrayDeque (not java.util.Stack)
FIFO queue        | ArrayDeque offer/poll
Priority order    | PriorityQueue (not FIFO)
Thread-safe queue | ArrayBlockingQueue / concurrent

=== Block 3: monotonic stack ===
Each index pushed/popped once -> O(n) time for next-greater sweep.
`;
