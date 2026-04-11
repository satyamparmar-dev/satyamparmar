import { theoryTitle, theoryBase } from "./theory.mjs";
import {
  basicCode,
  basicOutput,
  intermediateCode,
  intermediateOutput,
  advancedCode,
  advancedOutput,
} from "./codes.mjs";
import diagram from "./diagram.mjs";
import mcqQuestions from "./mcq.mjs";
import interview from "./interview.mjs";

const why = `Trees model hierarchies: org charts, JSON documents, syntax, and decision paths. In interviews, trees separate candidates who can **recurse cleanly**—base case, left, right, combine—from those who get lost in pointer swaps. **BST** problems test ordering logic; **BFS** tests whether you know when a **queue** beats a stack.

In production, you rarely implement red-black trees by hand, but you constantly reason about **height**, **ordering**, and **traversal cost** when you use database indexes, DOM APIs, and configuration trees. Understanding why skew hurts is how you explain why a feature that “worked in staging” collapses when data orders badly.

**Level-order traversal** is the gateway to **width**, **depth**, and **shortest path** thinking on unweighted structures. It also mirrors how you might batch-process a hierarchy level by level in a job system—same pattern, different substrate.

On call, “tree-shaped” incidents include runaway recursion in poorly bounded parsers, imbalanced in-memory indexes, and serialization formats that explode when depth grows. The habits you build here—guarding null, tracking height, and choosing iterative structures—are directly transferable.

This day also previews **heaps** (often array-backed trees) and **graphs** (trees plus back edges). Seeing trees as constrained graphs helps later topics feel incremental, not alien.`;

const pitfalls = [
  "Forgetting **null** guards on children — NPE in BFS dequeue; fuzz tests; fix with checks before enqueue.",
  "**Off-by-one** on height base (-1 vs 0) — inconsistent depth answers; align with interviewer; fix single convention.",
  "Validating BST using only **inorder list** without handling **duplicates** policy — wrong answers; clarify strict vs non-strict.",
  "Using **stack** for level order — wrong traversal order; fix with `ArrayDeque` queue.",
  "**Integer overflow** on path sums — rare but mention; use long.",
  "Confusing **complete** vs **full** binary tree — wrong complexity claims for array storage; fix definitions.",
  "Reconstruct tree from **preorder only** without nulls — ambiguous; need inorder or markers.",
  "Ignoring **O(width)** BFS memory — wide bush blows heap; mention constraint.",
];

const exercise = {
  title: "Practice exercise",
  difficulty: "Intermediate",
  problem: `**Day 24 — Trees (assignment alignment)**

1. Build this binary tree: root \`3\`, left \`9\`, right \`20\`, \`20\`'s children \`15\` and \`7\`.
2. Return **level-order traversal** as a list of levels (each level is a list of values).
3. Print the result using Java's \`List\` string form (e.g. \`[[3], [9, 20], [15, 7]]\`).
4. Implement iteratively with a **queue** (\`ArrayDeque\`).`,
  hints: [
    "Process `size = q.size()` before dequeuing each level.",
    "Offer left then right children when non-null.",
    "Match output to LeetCode 102 style nested lists.",
  ],
  solution: String.raw`package arch.day24;

import java.util.*;

public class Day24Exercise {

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
        Node r = new Node(3);
        r.left = new Node(9);
        r.right = new Node(20);
        r.right.left = new Node(15);
        r.right.right = new Node(7);
        System.out.println(levelOrder(r));
    }
}
`,
};

const cheatsheetRows = [
  ["Preorder", "rootLR", "serialize/copy"],
  ["Inorder", "LrootR", "BST sorted"],
  ["Postorder", "LRroot", "delete/eval"],
  ["BFS", "queue", "levels/width"],
  ["BST search", "compare prune", "O(h)"],
  ["Height", "max depth", "skew risk"],
  ["Validate BST", "min/max bounds", "O(n)"],
  ["LCA BST", "walk from root", "split values"],
  ["Serialize", "pre + nulls", "rebuild"],
  ["Symmetric", "mirror DFS", "pair compare"],
  ["Path sum", "DFS acc", "backtrack"],
  ["Diameter", "DFS heights", "max combo"],
  ["Kth smallest", "inorder k", "early stop"],
  ["Invert", "swap children", "DFS"],
  ["Right view", "last per level", "BFS"],
];

export default {
  title: "Trees",
  tags: ["Fresher", "Intermediate", "Phase 3", "Interview Prep", "Satyverse(Satyam Parmar)"],
  prerequisites: ["Day 23", "Day 22"],
  learningObjectives: [
    "Implement preorder, inorder, postorder, and level-order traversals",
    "Apply BST properties for search, validation, and successor logic",
    "Analyze height, balance, and skew impact on complexity",
    "Use queues for BFS and stacks for iterative DFS",
    "Solve path, subtree, and serialization problems recursively",
    "Communicate tree definitions and edge cases clearly",
  ],
  why,
  theoryTitle,
  theoryBase,
  basicCode,
  basicOutput,
  intermediateCode,
  intermediateOutput,
  advancedCode,
  advancedOutput,
  diagram,
  pitfalls,
  exercise,
  interview,
  mcqLabel: "Trees",
  mcqDescription: "Thirty questions on traversals, BST, BFS, height, validation, and classic tree patterns.",
  mcqQuestions,
  cheatsheetRows,
};
