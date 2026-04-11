export const theoryTitle = "Trees";

export const theoryBase = `### Plain-language overview

A **tree** is an acyclic connected graph rooted at a node. **Binary trees** have ≤2 children. **BST** property: left subtree values < node < right subtree (for strict definition). Interviews test traversals, height vs depth, and recursion base cases.

**Interview angle:** confirm duplicate policy and whether tree is **BST** or general binary tree.

### Traversals

| Order | Pattern | Use |
| --- | --- | --- |
| Preorder | root, left, right | copy/serialize |
| Inorder | left, root, right | BST → sorted |
| Postorder | left, right, root | delete bottom-up |
| Level (BFS) | queue layer by layer | depth, shortest path on unweighted |

**Interview angle:** iterative traversals use explicit stack or queue.

### Height and depth

**Height** of node: longest path down to leaf. **Depth**: distance from root. Tree height affects balance and operation costs.

**Interview angle:** leaf height 0 or 1—state convention.

### BST search/insert

Average O(h) where h height; balanced h=O(log n); skewed h=O(n).

**Interview angle:** inorder successor/predecessor patterns for delete.

### Balanced trees (awareness)

AVL/red-black (Java **TreeMap**) keep h=O(log n). Unbalanced BST can degrade.

### Recursion template

Base case null node; recurse left/right; combine—watch stack depth.

### Serialization

Preorder with null markers can rebuild uniquely if includes nulls—classic interview.

### Production

Expression trees, decision trees, org charts, DOM-like structures, indexes—often backed by balanced structures in libraries.

### 60-second story

“I confirm BST vs general. I implement traversals recursive or iterative with stack/queue. I state time O(n) visits each node once. For BST I use property to prune search. I discuss height skew risk and balanced structures.”
`;
