export const theoryTitle = "Linked lists";

export const theoryBase = `### Plain-language overview

A **linked list** is a chain of nodes where each node holds a value and a reference to the **next** (and optionally **prev**). Unlike arrays, there is no O(1) random access by index; you **walk** pointers. Interviews use lists to test pointer manipulation, **cycle** reasoning, and careful **edge** handling (empty list, single node).

**Interview angle:** state whether the list is **singly** or **doubly** linked before you code.

### Singly vs doubly linked

| Type | Pros | Cons |
| --- | --- | --- |
| Singly | Less memory, simpler | No O(1) predecessor |
| Doubly | O(1) delete with node ref | Extra prev pointer, more invariants |

**Interview angle:** Java’s **LinkedList** is doubly linked; many whiteboard problems assume singly unless specified.

### Complexity of core operations

| Operation | Singly (known head) | Notes |
| --- | --- | --- |
| Prepend | O(1) | New head |
| Append at tail w/o tail ptr | O(n) | Must walk |
| Append with tail ptr | O(1) | Keep tail reference |
| Index access | O(n) | Walk |
| Delete given node (no prev) | O(n) or copy-next trick | Classic interview twist |

**Interview angle:** mention you need **previous** for arbitrary delete in singly lists.

### Dummy (sentinel) node pattern

A **dummy** head simplifies insertion/deletion at the **front** by eliminating null special cases. Return **dummy.next** as the new head. This pattern reduces bugs in merge and remove-nth-from-end.

**Interview angle:** “I use dummy to unify empty and non-empty cases.”

### Cycle detection — Floyd’s algorithm

**Tortoise** moves one step, **hare** two. If a cycle exists, they meet inside the loop; if hare reaches null, no cycle. Phase two resets one pointer to head and moves both one step to find cycle start (classic follow-up).

**Interview angle:** prove why meeting implies cycle; know **O(n) time, O(1) space** vs HashSet O(n) space.

### Reverse — iterative vs recursive

**Iterative:** three pointers **prev**, **curr**, **next** relink in O(n) time, O(1) space. **Recursive:** implicit stack O(n) space—state tradeoff in interviews.

**Interview angle:** recursive blows stack on deep lists in production-sized stress—prefer iterative for robustness.

### Merge two sorted lists

Like merge in mergesort: compare heads, advance smaller, attach with a dummy tail pointer—O(n+m) time, O(1) extra.

**Interview angle:** keep a **tail** pointer to avoid scanning to end each step.

### Middle of linked list

Slow/fast pointers: when fast reaches end, slow is middle (careful with even length definitions). Used in palindrome list problems after reversing second half.

**Interview angle:** clarify if “middle” means lower or upper median for even n.

### Intersection of two lists

Align lengths by advancing longer list’s pointer, then walk both together—first equal reference is intersection (by **reference** identity, not value).

**Interview angle:** distinguish value equality vs same node object.

### Memory and JVM reality

Lists have **pointer overhead** and poor cache locality vs arrays. In services, prefer array-backed structures unless you need frequent head inserts with stable iterators.

**Interview angle:** connect asymptotics to **allocation churn** and GC.

### Common bugs

Null dereference on **curr.next**, losing rest of list when reversing, off-by-one in fast/slow termination, confusing **copy** vs **mutation**.

**Interview angle:** dry-run on 0,1,2 nodes.

### Production mapping

Event chains, LRU internals (doubly linked + map), lock-free structures—lists appear where **O(1) splice** matters.

**Interview angle:** LRU combines **HashMap** for lookup + **DLL** for order.

### 60-second story

“I confirm singly vs doubly. I use dummy head when inserting at head or merging. For reverse I use three-pointer iterative. For cycles I explain Floyd’s two-pointer meeting argument. I state O(n) time for walks and O(1) extra unless recursion. I test empty, single, two-node, and cycle cases.”
`;
