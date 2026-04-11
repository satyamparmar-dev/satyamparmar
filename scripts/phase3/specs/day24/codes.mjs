export const basicCode = String.raw`package arch.day24;

public class Day24Basic {

    static class Node {
        int v;
        Node left, right;
        Node(int v) { this.v = v; }
    }

    static void inorder(Node n, StringBuilder sb) {
        if (n == null) return;
        inorder(n.left, sb);
        if (sb.length() > 0) sb.append(",");
        sb.append(n.v);
        inorder(n.right, sb);
    }

    public static void main(String[] args) {
        Node r = new Node(4);
        r.left = new Node(2);
        r.right = new Node(6);
        r.left.left = new Node(1);
        r.left.right = new Node(3);
        StringBuilder sb = new StringBuilder();
        inorder(r, sb);
        System.out.println("=== BST inorder (sorted) ===");
        System.out.println(sb);
    }
}
`;

export const basicOutput = `=== BST inorder (sorted) ===
1,2,3,4,6
`;

export const intermediateCode = String.raw`package arch.day24;

import java.util.*;

public class Day24Intermediate {

    static class Node {
        int v;
        Node left, right;
        Node(int v) { this.v = v; }
    }

    static List<List<Integer>> levelOrder(Node root) {
        List<List<Integer>> out = new ArrayList<>();
        if (root == null) return out;
        Deque<Node> q = new ArrayDeque<>();
        q.add(root);
        while (!q.isEmpty()) {
            int sz = q.size();
            List<Integer> row = new ArrayList<>();
            for (int i = 0; i < sz; i++) {
                Node n = q.remove();
                row.add(n.v);
                if (n.left != null) q.add(n.left);
                if (n.right != null) q.add(n.right);
            }
            out.add(row);
        }
        return out;
    }

    public static void main(String[] args) {
        // --- Scenario 1: balanced small tree ---
        System.out.println("--- Scenario 1: level order ---");
        Node r = new Node(3);
        r.left = new Node(9);
        r.right = new Node(20);
        r.right.left = new Node(15);
        r.right.right = new Node(7);
        System.out.println(levelOrder(r));
        System.out.println();

        // --- Scenario 2: single node ---
        System.out.println("--- Scenario 2: single ---");
        System.out.println(levelOrder(new Node(1)));
        System.out.println();

        // --- Scenario 3: empty ---
        System.out.println("--- Scenario 3: null ---");
        System.out.println(levelOrder(null));
        System.out.println();

        // --- Scenario 4: left skew ---
        System.out.println("--- Scenario 4: skew ---");
        Node s = new Node(1);
        s.left = new Node(2);
        s.left.left = new Node(3);
        System.out.println(levelOrder(s));
    }
}
`;

export const intermediateOutput = `--- Scenario 1: level order ---
[[3], [9, 20], [15, 7]]

--- Scenario 2: single ---
[[1]]

--- Scenario 3: null ---
[]

--- Scenario 4: skew ---
[[1], [2], [3]]
`;

export const advancedCode = String.raw`package arch.day24;

public class Day24Advanced {

    static class Node {
        int v;
        Node left, right;
        Node(int v) { this.v = v; }
    }

    static int height(Node n) {
        if (n == null) return -1;
        return 1 + Math.max(height(n.left), height(n.right));
    }

    static boolean isBST(Node n, long min, long max) {
        if (n == null) return true;
        if (n.v <= min || n.v >= max) return false;
        return isBST(n.left, min, n.v) && isBST(n.right, n.v, max);
    }

    public static void main(String[] args) {
        // === Block 1: height ===
        System.out.println("=== Block 1: height ===");
        Node r = new Node(2);
        r.left = new Node(1);
        r.right = new Node(3);
        System.out.println("height=" + height(r));
        System.out.println();

        // === Block 2: validate BST ===
        System.out.println("=== Block 2: validate BST ===");
        System.out.println(isBST(r, Long.MIN_VALUE, Long.MAX_VALUE));
        Node bad = new Node(5);
        bad.left = new Node(1);
        bad.right = new Node(4);
        bad.right.left = new Node(3);
        bad.right.right = new Node(6);
        System.out.println(isBST(bad, Long.MIN_VALUE, Long.MAX_VALUE));
        System.out.println();

        // === Block 3: complexity ===
        System.out.println("=== Block 3: BST ops vs height ===");
        System.out.println("balanced h~log n -> search O(log n)");
        System.out.println("skew h~n-1 -> search O(n)");
    }
}
`;

export const advancedOutput = `=== Block 1: height ===
height=1

=== Block 2: validate BST ===
true
false

=== Block 3: BST ops vs height ===
balanced h~log n -> search O(log n)
skew h~n-1 -> search O(n)
`;
