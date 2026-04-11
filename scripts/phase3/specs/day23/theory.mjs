export const theoryTitle = "Hash maps and hashing";

export const theoryBase = `### Plain-language overview

A **hash map** maps keys to values with expected **O(1)** get/put by hashing the key to a bucket, then resolving collisions with chaining or open addressing. Interviews focus on **equals/hashCode contracts**, **collision** behavior, and **when TreeMap wins**.

**Interview angle:** separate **average** O(1) from **worst** O(n) without balanced buckets.

### equals and hashCode contract

If two objects are **equal**, they **must** have the same **hashCode**. Violating this breaks **HashMap** lookups—entries appear missing. Symmetric: unequal objects may share hash codes (collision).

**Interview angle:** in DTOs used as keys, override both or use immutable key types.

### Collision strategies

**Chaining:** bucket is list/tree of entries. **Open addressing:** probe sequence. Java **HashMap** bins become **treeified** when chains grow (Java 8+).

**Interview angle:** worst case devolves to linear scan per bucket—adversarial keys.

### Load factor and resize

Default load factor 0.75 balances space vs collisions. When size/capacity exceeds threshold, **resize** doubles buckets and **rehash**—amortized analysis matters.

**Interview angle:** resizing is O(n) rare event; mention amortized O(1) insert.

### HashMap vs TreeMap vs LinkedHashMap

| Map | Order | get/put |
| --- | --- | --- |
| HashMap | undefined | O(1) expected |
| LinkedHashMap | insertion/access | O(1) expected |
| TreeMap | sorted keys | O(log n) |

**Interview angle:** need sorted keys or range queries → TreeMap.

### Immutable keys

Mutable keys that change hash after insert make entries **unreachable**. Prefer **String**, **Integer**, or immutable records.

**Interview angle:** defensive copies for composite keys.

### Frequency counting pattern

Single pass: **map.merge(k,1,Integer::sum)** or **getOrDefault**. Second pass for first unique character scans string with ordered iteration or LinkedHashMap.

**Interview angle:** two passes O(n) time, O(min(n, alphabet)) space.

### Multi-set and grouping

**Map** keys to **List** values using **computeIfAbsent** to build adjacency-style structures—common in graphs and anagram buckets.

### Security and hashing

**Denial of service** via hash collision amplification—historical Java **String** hash seeding mitigations; know conceptually.

### Production

Caches, indexes, dedupe, counting. Watch **memory** of large maps and **concurrent** access—**ConcurrentHashMap** vs synchronized map.

### 60-second story

“I ensure equals/hashCode consistent for keys. I cite expected O(1) with collision caveats. I pick LinkedHashMap for predictable iteration, TreeMap for sorted keys. For frequency problems I do O(n) counting then O(n) answer scan. I mention unmodifiable keys and concurrent choices.”
`;
