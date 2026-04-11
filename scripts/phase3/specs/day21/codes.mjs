export const basicCode = String.raw`package arch.day21;

public class Day21Basic {

    static class Node {
        int v;
        Node next;
        Node(int v, Node next) {
            this.v = v;
            this.next = next;
        }
    }

    static String fmt(Node h) {
        StringBuilder sb = new StringBuilder();
        for (Node c = h; c != null; c = c.next) {
            if (sb.length() > 0) sb.append("->");
            sb.append(c.v);
        }
        return sb.length() == 0 ? "EMPTY" : sb.toString();
    }

    public static void main(String[] args) {
        Node h = new Node(1, new Node(2, new Node(3, null)));
        System.out.println("=== Walk list ===");
        System.out.println(fmt(h));
    }
}
`;

export const basicOutput = `=== Walk list ===
1->2->3
`;

export const intermediateCode = String.raw`package arch.day21;

public class Day21Intermediate {

    static class Node {
        int v;
        Node next;
        Node(int v, Node next) {
            this.v = v;
            this.next = next;
        }
    }

    static Node mergeSorted(Node a, Node b) {
        Node d = new Node(0, null);
        Node t = d;
        while (a != null && b != null) {
            if (a.v <= b.v) {
                t.next = a;
                a = a.next;
            } else {
                t.next = b;
                b = b.next;
            }
            t = t.next;
        }
        t.next = a != null ? a : b;
        return d.next;
    }

    static boolean hasCycle(Node head) {
        Node s = head, f = head;
        while (f != null && f.next != null) {
            s = s.next;
            f = f.next.next;
            if (s == f) return true;
        }
        return false;
    }

    public static void main(String[] args) {
        // --- Scenario 1: merge sorted lists ---
        System.out.println("--- Scenario 1: merge sorted ---");
        Node a = new Node(1, new Node(4, null));
        Node b = new Node(2, new Node(3, null));
        Node m = mergeSorted(a, b);
        for (Node c = m; c != null; c = c.next) {
            System.out.print(c.v + (c.next != null ? " " : ""));
        }
        System.out.println();
        System.out.println();

        // --- Scenario 2: no cycle ---
        System.out.println("--- Scenario 2: cycle check (linear) ---");
        Node lin = new Node(1, new Node(2, null));
        System.out.println("hasCycle=" + hasCycle(lin));
        System.out.println();

        // --- Scenario 3: cycle present ---
        System.out.println("--- Scenario 3: cycle check (cyclic) ---");
        Node c1 = new Node(1, null);
        Node c2 = new Node(2, null);
        Node c3 = new Node(3, null);
        c1.next = c2;
        c2.next = c3;
        c3.next = c2;
        System.out.println("hasCycle=" + hasCycle(c1));
        System.out.println();

        // --- Scenario 4: dummy head insert front ---
        System.out.println("--- Scenario 4: prepend with dummy ---");
        Node d = new Node(0, null);
        d.next = new Node(5, null);
        Node n = new Node(9, d.next);
        d.next = n;
        for (Node x = d.next; x != null; x = x.next) {
            System.out.print(x.v + (x.next != null ? " " : ""));
        }
        System.out.println();
    }
}
`;

export const intermediateOutput = `--- Scenario 1: merge sorted ---
1 2 3 4

--- Scenario 2: cycle check (linear) ---
hasCycle=false

--- Scenario 3: cycle check (cyclic) ---
hasCycle=true

--- Scenario 4: prepend with dummy ---
9 5
`;

export const advancedCode = String.raw`package arch.day21;

public class Day21Advanced {

    static class Node {
        int v;
        Node next;
        Node(int v, Node next) {
            this.v = v;
            this.next = next;
        }
    }

    static Node reverseIterative(Node head) {
        Node prev = null;
        Node curr = head;
        while (curr != null) {
            Node nxt = curr.next;
            curr.next = prev;
            prev = curr;
            curr = nxt;
        }
        return prev;
    }

    static String fmt(Node h) {
        StringBuilder sb = new StringBuilder();
        for (Node c = h; c != null; c = c.next) {
            if (sb.length() > 0) sb.append("->");
            sb.append(c.v);
        }
        return sb.toString();
    }

    public static void main(String[] args) {
        // === Block 1: reverse iterative ===
        System.out.println("=== Block 1: reverse iterative ===");
        Node h = new Node(1, new Node(2, new Node(3, null)));
        System.out.println("before=" + fmt(h));
        Node r = reverseIterative(h);
        System.out.println("after=" + fmt(r));
        System.out.println();

        // === Block 2: operation cost table ===
        System.out.println("=== Block 2: singly linked costs ===");
        System.out.println("Op          | Time | Notes");
        System.out.println("------------|------|------------------");
        System.out.println("prepend     | O(1) | new head");
        System.out.println("index i     | O(n) | walk i steps");
        System.out.println("append tail*| O(n) | *no tail pointer");
        System.out.println("reverse     | O(n) | three pointers");
        System.out.println();

        // === Block 3: when to prefer array ===
        System.out.println("=== Block 3: array vs list ===");
        System.out.println("Random access heavy -> array/ArrayList.");
        System.out.println("Frequent head insert + stable node refs -> linked list.");
    }
}
`;

export const advancedOutput = `=== Block 1: reverse iterative ===
before=1->2->3
after=3->2->1

=== Block 2: singly linked costs ===
Op          | Time | Notes
------------|------|------------------
prepend     | O(1) | new head
index i     | O(n) | walk i steps
append tail*| O(n) | *no tail pointer
reverse     | O(n) | three pointers

=== Block 3: array vs list ===
Random access heavy -> array/ArrayList.
Frequent head insert + stable node refs -> linked list.
`;
