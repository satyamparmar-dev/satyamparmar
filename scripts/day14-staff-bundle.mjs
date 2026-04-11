/** Day 14 staff content: Java Collections Framework (phase2-day14.json). */

export const WHY_CONTENT = [
  "At 03:18 the **billing** **worker** **pod** throws **ConcurrentModificationException** while **Jackson** walks an **ArrayList** **LineDto** graph that another **Kafka** consumer thread still mutates with **lines.add** after each **settlement** batch. The **stack** points at **ArrayList$Itr.checkForComodification** and **Spliterator** frames inside **ObjectMapper**, so **on-call** blames **serialization** first. The artifact is the shared **mutable** **List** **field** on a **singleton** **BatchExporter** every **thread** aliases. The symptom is **HTTP** **500** bursts that correlate with **partition** **rebalance**, not steady **traffic**, because **rebalance** increases concurrent **touches** on the same **collection**.",
  "Interviewers who ask about the **Java** **Collections** **Framework** are not checking whether you memorized **ArrayList** versus **LinkedList**. They want evidence that you know how **fail**-**fast** **iterators** track **expectedModCount**, why **HashMap** **resize** copies **buckets**, when **ConcurrentHashMap** **segment** **rules** differ from **Collections.synchronizedMap**, and how **equals** plus **hashCode** pin **Set**/**Map** correctness. The mental model gap is treating **interfaces** as magic **utilities** instead of **mutation** contracts, **visibility**, and **happens**-**before** edges under **multi**-**threaded** **Spring** **beans**. They reward engineers who connect **Collection** **return** types to **heap** **graphs** and **telemetry**, not textbook **diagrams** alone.",
  "Use this four-step pattern in every answer. First, name the **mutability** posture: **snapshot** (**List.copyOf**), **unmodifiable** **view**, **thread**-**safe** **mutation** (**ConcurrentHashMap**), or **single**-**threaded** **fast** path (**ArrayList**). Second, open **jstack** during the incident and read whether **Iterator** frames collide with **mutator** **threads** on the same **object** **identity**. Third, cite **bytecode**-level behavior: **modCount** checks in **ArrayList$Itr**, **HashMap** **treeify** thresholds on **Java 8**, or **CHM** **volatile** reads on **Java 11**. Fourth, fix with **defensive** **copy**/**merge** patterns and verify with **jcmd** **Thread.print** plus a **stress** test that reproduces **ConcurrentModificationException** before merge. You keep a **runbook** snippet that maps **Spliterator** stacks to **getter** **alias** reviews so **on-call** stops retrying **serialization** flags that cannot fix **shared** **list** **mutation**.",
  "At scale, ten engineers shipping fifty **microservices** multiply any shared **cache** **Map** mistake. One team keeps a **static** **HashMap** **tenantConfig** without bounds while **rollouts** add keys per **request**; **pods** die with **OutOfMemoryError**: **Java** **heap** **space** that **metrics** attribute to **GC** thrash, not a single bad **query**. Another failure mode is **IllegalArgumentException** when **ConcurrentHashMap.compute** receives a **null** **key** after a **refactor** passes **Optional.get** without guarding - the **contract** is explicit on **Java 8**+ and fails fast during **peak** **traffic**. A third pattern is **UnsupportedOperationException** when **Arrays.asList** **views** meet **CI** **migrations** that suddenly call **add** on what looked like a **mutable** **List** **receiver**. All three resemble random **service** bugs but are really **collection** **discipline** and **API** **contract** failures amplified by **shared** **mutable** **state**.",
  "A senior candidate states **Java 21** adds **SequencedCollection** so **List** implementations expose **getFirst**, **getLast**, and **reversed** **views** with defined **encounter** **order** semantics; a mid-level answer still claims **LinkedHashMap** is the only way to reason about **stable** **iteration** **order**. Another senior signal is **Java 8** **HashMap** **bin** **treeify** when **chains** exceed **TREEIFY_THRESHOLD**, changing **worst**-**case** behavior from **O(n)** **scan** to **balanced** **tree** **lookup** under **hash** **collisions**. The same senior voice cites **Java 10** **List.copyOf** rejecting **null** **elements** as a deliberate **API** **guardrail** against **silent** **NPE** **mines** in **DTO** **pipelines**.",
  "In your first six months on a new job this topic shows up weekly. During **code** **review** you flag a **DTO** **getter** returning the internal **ArrayList**; you require **List.copyOf** and attach **javap**-free reasoning about **alias** **mutations** in **Kafka** **consumers**. On **on-call**, **Grafana** shows **latency** spikes when a **HashMap** **resize** doubles **buckets**; you capture **jstat** **-gc** and pre-size **new** **HashMap** **(expectedSize)** using the canonical load-factor formula. When **pairing** on a **cache** **rewrite**, you replace **Collections.synchronizedMap** on hot **read** paths with **ConcurrentHashMap** and document **compute** **idioms** so **threads** stop **serializing** every **get**. While profiling a **batch** **exporter**, you catch a **PriorityQueue** **mis**-**sort** caused by **foreach** instead of **poll** and fix the **loop** before **finance** **reconciliation** **SLAs** slip.",
].join("\n\n");

export const THEORY_CONTENT = `### Plain-language overview

The **Java** **Collections** **Framework** is the **JDK** **library** of **interfaces** (**Collection**, **List**, **Set**, **Map**, **Queue**) and **implementations** (**ArrayList**, **HashMap**, **ConcurrentHashMap**, **TreeMap**) that standardize how **objects** group **elements** or **key**/**value** pairs. Choosing a **type** is choosing **mutation** rules, **iteration** **order**, **thread** **safety**, and **big**-**O** behavior under **load**. **Interview angle:** Weak answers stop at **API** names; strong answers tie **iterator** **policies** and **equals**/**hashCode** contracts to **production** symptoms.

### **Iterable**, **Collection**, and **separation** from **Map**

**Map** does **not** **extend** **Collection**; it models **entries** with **keySet**, **values**, and **entrySet** **views**. **Iterable** powers **enhanced** **for** loops by exposing **iterator()**. Mixing **Map** APIs with **Collection** **helpers** without reading **view** **mutability** causes subtle **ConcurrentModificationException** paths. **Interview angle:** Ask candidates to diagram **view** **backings** for **keySet**.

### **ArrayList** internals and **growth**

**ArrayList** stores **elements** in **Object[]** **elementData** with **size** tracking logical length; **add** amortizes **O(1)** but **grow** copies arrays when **capacity** is exhausted. **trimToSize** releases slack. **Interview angle:** Connect **resize** bursts to **allocation** **spikes** visible in **jcmd** **GC.heap_info**.

### **HashMap** buckets, **hash** spread, and **treeify** (**Java 8**)

**HashMap** maps **hash** **codes** to **bin** indices with **perturbation** to spread **bits**, stores **Node** **chains**, and **treeifies** long **chains** into **balanced** **trees** when **TREEIFY_THRESHOLD** is exceeded. **Resize** **rehashes** entries into a doubled **table**. **Interview angle:** Pair **poor** **hashCode** with **CPU** **hotspots** and **jstack** showing **HashMap** **put** loops.

### **equals** and **hashCode** contract for **Set** and **Map** keys

**Equal** **objects** must produce **equal** **hash** **codes**; **mutating** a **key** after **insert** breaks **HashMap** **invariants** because **buckets** were chosen from the old **hash**. **Interview angle:** Demand **immutable** **keys** or stable **String**/**UUID** identifiers in **reviews**.

### **Fail**-**fast** **iterators** and **modCount**

**ArrayList** **iterators** store **expectedModCount** and compare to **parent** **modCount** on **next**/**remove**; mismatch throws **ConcurrentModificationException**. This is **heuristic**, not **ACID**. **Interview angle:** Contrast with **ConcurrentHashMap** **weakly** **consistent** **iterators** that rarely throw.

### **ConcurrentHashMap** versus **Collections.synchronizedMap**

**ConcurrentHashMap** uses **lock** **striping**/**CAS** **primitives** for **scales** **reads** and **fine**-**grained** **writes**; **synchronizedMap** wraps **mutator** **methods** with one **monitor** per **map**. **compute**, **merge**, and **putIfAbsent** give **atomic** **read**-**modify**-**write** on **Java 8**+. **Interview angle:** Ask for **latency** **profiles** when **read**-**heavy** **caches** used **synchronizedMap**.

### **TreeMap** and **ordering**

**TreeMap** is a **red**-**black** **tree** ordered by **Comparable** **keys** or a **Comparator**; **NavigableMap** adds **ceilingKey**/**floorEntry** **navigation**. **Interview angle:** Compare **O(log n)** **guarantees** with **HashMap** **average** **O(1)**.

### **LinkedHashMap** **insertion** versus **access** **order**

**LinkedHashMap** maintains **doubly**-**linked** **buckets** for predictable **iteration**; **access**-**order** mode supports **LRU**-style **caches** when **removeEldestEntry** is overridden. **Interview angle:** Warn that **access**-**order** mutates **structure** on **get**.

### **Immutable** **factories** (**List.of**, **Map.copyOf**, **Java 10**)

**List.of** and **Map.copyOf** return **unmodifiable** **snapshots**; **copyOf** rejects **null** **elements**/**keys**/**values**. They reduce **accidental** **sharing** at **API** **edges**. **Interview angle:** Contrast **Collections.unmodifiableList** **views** that still **alias** **mutable** **backing** **lists**.

### **Sequenced** **collections** (**Java 21**)

**SequencedCollection**/**SequencedMap** unify **first**/**last** **access** and **reversed** **views** for **ordered** **lists**/**deques**/**linked** **maps**. **Interview angle:** Mention **encounter** **order** when **migrating** **LinkedHashMap**-only **patterns**.

### Production comparison table — **List** **choices**

| Workload | Prefer | Avoid |
|----------|--------|-------|
| **Random** **index** **heavy** | **ArrayList** | **LinkedList** **get** **O(n)** |
| **Frequent** **middle** **inserts** in **tiny** **lists** | **ArrayList** **copy** **costs** still often win | **LinkedList** **iterator** **churn** without **proof** |
| **FIFO** **worker** **queues** | **ArrayDeque** | **Stack** **class** **legacy** |

**Interview angle:** Tie picks to **allocation** **rates** measurable with **jmap** **-histo:live**.

### Step-by-step: proving a **ConcurrentModificationException** **source**

Step 1: Capture **jcmd** **<pid>** **Thread.print** and note **threads** inside **Iterator.next** versus **List.add**. Step 2: Inspect **field** **visibility**: **getter** returning internal **list** **reference**. Step 3: Reproduce under **test** with **two** **Executor** **tasks** **mutating**/**iterating**. Step 4: Replace with **List.copyOf** **snapshot** or **queue** **hand**-**off**. Step 5: Re-run **load** and confirm **modCount** **noise** disappears. **Interview angle:** Staff proof is **thread** **names** plus **immutable** **DTO** **edges**.

### **Queue**, **Deque**, and **PriorityQueue** **caveats**

**ArrayDeque** is the **default** **deque**; **PriorityQueue** **iterator** does **not** emit **priority** **order** - only **poll** does. **Interview angle:** **Mis**-**sorted** **batch** jobs often trace to **iterating** **PriorityQueue** instead of **polling**.

### Iterator policy snapshot

| Iterator style | Throws **CME**? | Typical backing |
|----------------|----------------|-----------------|
| **ArrayList** **iterator** | Yes when mutated | **modCount** check |
| **ConcurrentHashMap** **views** | Rarely | **Weakly** **consistent** |
| **CopyOnWriteArrayList** | No on **iterate** | **Snapshot** **array** **copy** |

**Interview angle:** Use this table when **Spliterator** stacks confuse **junior** **on-call** engineers.

### Production comparison table — **Map** **choices**

| Need | Pick | Risk if wrong |
|------|------|---------------|
| **Hot** **concurrent** **cache** | **ConcurrentHashMap** | **synchronizedMap** **contention** |
| **Sorted** **range** **scans** | **TreeMap** | **HashMap** **cannot** **order** |
| **Stable** **iteration** **order** | **LinkedHashMap** | **HashMap** **shuffle** confuses **diffs** |

**Interview angle:** Ask how **metrics** would show **lock** **contention** on **synchronizedMap**.

### **unmodifiable** **view** versus **copy** snapshot

\`\`\`java
List<String> core = new ArrayList<>();
core.add("east");
List<String> view = Collections.unmodifiableList(core);
List<String> snap = List.copyOf(core);
core.add("west"); // mutates view, not snap
\`\`\`

**Interview angle:** Use this snippet to explain **alias** bugs after **DTO** **getters**.

### Sixty-second interview story

You define **ArrayList** as **array** **backing** with **modCount** **iterators**, **HashMap** as **bins** plus **Java 8** **treeify**, **ConcurrentHashMap** as **concurrent** **gets** without **global** **lock**, and **immutable** **factories** as **snapshot** **APIs** on **Java 10**. You warn that **mutable** **keys** corrupt **HashMap** and that **fail**-**fast** **iterators** throw **ConcurrentModificationException** when **threads** interleave. You close with **Java 21** **SequencedCollection** for **deterministic** **endpoints**. You verify with **jstack** plus **jcmd** when **logs** show **Spliterator** **CME** stacks. **Interview angle:** Story must name **one** **exception** type and **one** **command**.

### Satyverse drill — tie-down

Pick three **service** **DTOs** this week and trace every **Collection** **return** path: **copyOf** or **unmodifiable** **view** with **no** **mutable** **alias**. Run **jmap** **-histo:live** before and after removing **synchronizedMap** **hotspots** and attach **histogram** **diffs** to the **PR**. Rehearse **ConcurrentModificationException** reproduction tests for any **Kafka** **batch** **list** **field**. **Interview angle:** Drill ends when **tests** prove **iterator**/**mutator** **separation** you can **draw** on a **whiteboard**.
`;

export const BASIC_CODE = `package arch.day14;

/**
 * Day 14 basic: println-only collections reference card.
 */
public class Day14Basic {

    public static void main(String[] args) {
        // Core interfaces vs concrete types teams actually deploy.
        System.out.println("=== Collections — interface to implementation map ===");
        System.out.println("List       | ordered sequence | ArrayList default, LinkedList rare");
        System.out.println("Set        | unique by equals | HashSet, LinkedHashSet, TreeSet");
        System.out.println("Map        | key to value     | HashMap, LinkedHashMap, TreeMap");
        System.out.println("Queue      | FIFO discipline  | ArrayDeque, LinkedList as deque");
        System.out.println("Deque      | double-ended     | ArrayDeque preferred over Stack");
        System.out.println();

        System.out.println("=== Command reference — heap, threads, bytecode ===");
        System.out.println("jcmd <pid> Thread.print        -> see Iterator.next vs List.add races");
        System.out.println("jstack <pid>                   -> capture CME stack cheaply on Linux");
        System.out.println("jmap -histo:live <pid>         -> spot ArrayList/Node allocation churn");
        System.out.println("jstat -gc <pid> 1s             -> correlate HashMap resize with GC");
        System.out.println("javap -c java.util.ArrayList   -> read iterator checkForComodification");
        System.out.println();

        System.out.println("=== Failure modes tied to collections ===");
        System.out.println("ConcurrentModificationException | fail-fast iterator vs mutating thread");
        System.out.println("OutOfMemoryError heap space     | unbounded HashMap cache growth");
        System.out.println("ClassCastException              | raw types mixing in legacy APIs");
        System.out.println("IllegalArgumentException        | null key to ConcurrentHashMap.compute");
        System.out.println("UnsupportedOperationException   | Arrays.asList then add/remove");
        System.out.println();

        System.out.println("=== Environment / CI / review cues ===");
        System.out.println("Ban returning internal mutable lists from getters without copyOf");
        System.out.println("Load-test any synchronizedMap on read-heavy metrics dashboards");
        System.out.println("Document equals/hashCode invariants for every HashMap key DTO");
        System.out.println("Prefer ConcurrentHashMap for shared Spring @Singleton caches");
        System.out.println("Add ArchUnit rules blocking Hashtable in new modules");
        System.out.println();

        System.out.println("=== Review cue ===");
        System.out.println("staff cue: grep synchronizedMap in services with >1k RPS reads");
        System.out.println("staff cue: assert modCount storms with stress test plus jstack");
        System.out.println("staff cue: verify PriorityQueue workloads use poll not foreach order");
        System.out.println("done");
    }
}
`;

export const BASIC_OUTPUT = `=== Collections — interface to implementation map ===
List       | ordered sequence | ArrayList default, LinkedList rare
Set        | unique by equals | HashSet, LinkedHashSet, TreeSet
Map        | key to value     | HashMap, LinkedHashMap, TreeMap
Queue      | FIFO discipline  | ArrayDeque, LinkedList as deque
Deque      | double-ended     | ArrayDeque preferred over Stack

=== Command reference — heap, threads, bytecode ===
jcmd <pid> Thread.print        -> see Iterator.next vs List.add races
jstack <pid>                   -> capture CME stack cheaply on Linux
jmap -histo:live <pid>         -> spot ArrayList/Node allocation churn
jstat -gc <pid> 1s             -> correlate HashMap resize with GC
javap -c java.util.ArrayList   -> read iterator checkForComodification

=== Failure modes tied to collections ===
ConcurrentModificationException | fail-fast iterator vs mutating thread
OutOfMemoryError heap space     | unbounded HashMap cache growth
ClassCastException              | raw types mixing in legacy APIs
IllegalArgumentException        | null key to ConcurrentHashMap.compute
UnsupportedOperationException   | Arrays.asList then add/remove

=== Environment / CI / review cues ===
Ban returning internal mutable lists from getters without copyOf
Load-test any synchronizedMap on read-heavy metrics dashboards
Document equals/hashCode invariants for every HashMap key DTO
Prefer ConcurrentHashMap for shared Spring @Singleton caches
Add ArchUnit rules blocking Hashtable in new modules

=== Review cue ===
staff cue: grep synchronizedMap in services with >1k RPS reads
staff cue: assert modCount storms with stress test plus jstack
staff cue: verify PriorityQueue workloads use poll not foreach order
done
`;

export const INTERMEDIATE_CODE = `package arch.day14;

/**
 * Day 14 intermediate: four collections production narratives (println only).
 */
public class Day14Intermediate {

    /*
     * Context: shared ArrayList field mutated while Jackson iterator walks DTO graph.
     */
    static void scenario1() {
        System.out.println("--- Scenario 1: ConcurrentModificationException during JSON walk ---");
        System.out.println("symptom: billing worker 500s only after Kafka rebalance bursts");
        System.out.println("cause:    thread A iterates shared ArrayList while thread B calls add");
        System.out.println("why:      ArrayList$Itr expectedModCount lags parent modCount");
        System.out.println("fix:      return List.copyOf from getter or synchronize mutation boundary");
        System.out.println("verify:   jcmd <pid> Thread.print shows Iterator.next colliding with add");
        System.out.println("staff:    jstack during spike must list checkForComodification frames");
        System.out.println("metric:  Spliterator.forEachRemaining in stack ties to Jackson walk");
        System.out.println("echo:    repro requires two executor tasks touching same list identity");
        System.out.println();
    }

    /*
     * Context: mutable HashMap key mutates hashCode after insert so get returns null.
     */
    static void scenario2() {
        System.out.println("--- Scenario 2: silent cache miss from mutable map keys ---");
        System.out.println("symptom: Redis fallback misses even though entry was put minutes ago");
        System.out.println("cause:    AccountKey hashCode changed after fields mutated post-put");
        System.out.println("why:      HashMap bucket index derived from original hash at insert time");
        System.out.println("fix:      switch to record key or String id; forbid setters after put");
        System.out.println("verify:   jmap -dump:live then MAT HashMap inspector for stranded entries");
        System.out.println("staff:    unit test mutates key after put and asserts get nullability");
        System.out.println("note:    symptom mimics flaky cache not data loss");
        System.out.println();
    }

    /*
     * Context: massive HashMap resize copies tables and lengthens STW under load.
     */
    static void scenario3() {
        System.out.println("--- Scenario 3: GC pause spike from HashMap resize storm ---");
        System.out.println("symptom: p99 latency doubles right after cold start ingestion");
        System.out.println("cause:    default capacity HashMap grows through power-of-two resizes");
        System.out.println("why:      each resize rehashes every Node into a new table array");
        System.out.println("fix:      presize new HashMap(expectedElements) using load factor math");
        System.out.println("verify:   jstat -gc <pid> 1s correlates FGC with ingestion phase");
        System.out.println("staff:    jcmd GC.heap_info shows humongous int[] backing tables");
        System.out.println("context: Java 8 treeify still pays resize copy before trees help");
        System.out.println();
    }

    /*
     * Context: synchronizedMap still allows ConcurrentModificationException during iteration.
     */
    static void scenario4() {
        System.out.println("--- Scenario 4: synchronizedMap iterator versus reader/writer myth ---");
        System.out.println("symptom: occasional CME despite Collections.synchronizedMap wrapper");
        System.out.println("cause:    manual iterator loop outside synchronized(map) monitor");
        System.out.println("why:      synchronizedMap only guards individual mutator methods");
        System.out.println("fix:      synchronize on map during iteration or migrate to CHM views");
        System.out.println("verify:   javap -c on caller shows monitorenter missing around iterator");
        System.out.println("staff:    jstack captures one thread in next while another in put");
        System.out.println("note:    ConcurrentHashMap iterators are weakly consistent not fail-fast");
        System.out.println("metric: read-heavy services drop lock contention after CHM migration");
        System.out.println();
    }

    static void banner() {
        System.out.println("banner: Day14 intermediate collections lab");
    }

    public static void main(String[] args) {
        banner();
        scenario1();
        scenario2();
        scenario3();
        scenario4();
    }
}
`;

export const INTERMEDIATE_OUTPUT = `banner: Day14 intermediate collections lab
--- Scenario 1: ConcurrentModificationException during JSON walk ---
symptom: billing worker 500s only after Kafka rebalance bursts
cause:    thread A iterates shared ArrayList while thread B calls add
why:      ArrayList$Itr expectedModCount lags parent modCount
fix:      return List.copyOf from getter or synchronize mutation boundary
verify:   jcmd <pid> Thread.print shows Iterator.next colliding with add
staff:    jstack during spike must list checkForComodification frames
metric:  Spliterator.forEachRemaining in stack ties to Jackson walk
echo:    repro requires two executor tasks touching same list identity

--- Scenario 2: silent cache miss from mutable map keys ---
symptom: Redis fallback misses even though entry was put minutes ago
cause:    AccountKey hashCode changed after fields mutated post-put
why:      HashMap bucket index derived from original hash at insert time
fix:      switch to record key or String id; forbid setters after put
verify:   jmap -dump:live then MAT HashMap inspector for stranded entries
staff:    unit test mutates key after put and asserts get nullability
note:    symptom mimics flaky cache not data loss

--- Scenario 3: GC pause spike from HashMap resize storm ---
symptom: p99 latency doubles right after cold start ingestion
cause:    default capacity HashMap grows through power-of-two resizes
why:      each resize rehashes every Node into a new table array
fix:      presize new HashMap(expectedElements) using load factor math
verify:   jstat -gc <pid> 1s correlates FGC with ingestion phase
staff:    jcmd GC.heap_info shows humongous int[] backing tables
context: Java 8 treeify still pays resize copy before trees help

--- Scenario 4: synchronizedMap iterator versus reader/writer myth ---
symptom: occasional CME despite Collections.synchronizedMap wrapper
cause:    manual iterator loop outside synchronized(map) monitor
why:      synchronizedMap only guards individual mutator methods
fix:      synchronize on map during iteration or migrate to CHM views
verify:   javap -c on caller shows monitorenter missing around iterator
staff:    jstack captures one thread in next while another in put
note:    ConcurrentHashMap iterators are weakly consistent not fail-fast
metric: read-heavy services drop lock contention after CHM migration

`;

export const ADVANCED_CODE = `package arch.day14;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Day 14 advanced: workload routing + concurrency posture + checklist.
 */
public class Day14Advanced {

    record WorkloadPick(String signal, String pick, String reason) {}

    static List<WorkloadPick> workloadTable() {
        List<WorkloadPick> rows = new ArrayList<>();
        rows.add(new WorkloadPick("random index hot", "ArrayList", "cache-friendly array backing"));
        rows.add(new WorkloadPick("sorted range scans", "TreeMap", "NavigableMap red-black order"));
        rows.add(new WorkloadPick("shared read-heavy cache", "ConcurrentHashMap", "striped CAS not one lock"));
        rows.add(new WorkloadPick("stable audit iteration", "LinkedHashMap", "predictable encounter order"));
        return rows;
    }

    static Map<String, Integer> riskWeights() {
        Map<String, Integer> m = new LinkedHashMap<>();
        m.put("mutable HashMap keys in prod", 5);
        m.put("getter returns internal ArrayList", 4);
        m.put("PriorityQueue foreach for ordering", 3);
        m.put("bounded ArrayDeque task queue", 0);
        return m;
    }

    public static void main(String[] args) {
        System.out.println("banner: Day14 advanced collection guardrails");
        System.out.println("scope: arch.day14 workload + concurrency matrix");
        System.out.println();
        System.out.println();

        System.out.println("=== Block 1: list and map workload picker ===");
        for (WorkloadPick w : workloadTable()) {
            System.out.println(w.signal() + " | " + w.pick() + " | " + w.reason());
        }
        System.out.println();

        System.out.println("=== Block 2: risk weight board ===");
        int sum = 0;
        for (Map.Entry<String, Integer> e : riskWeights().entrySet()) {
            sum += e.getValue();
            System.out.println(e.getKey() + " = " + e.getValue());
        }
        System.out.println("total risk = " + sum);
        System.out.println();

        System.out.println("=== Block 3: PR checklist ===");
        Map<String, Boolean> checks = new LinkedHashMap<>();
        checks.put("DTO getters return copyOf or unmodifiable snapshots", false);
        checks.put("HashMap keys immutable or stable String ids", true);
        checks.put("Concurrent reads migrated off synchronizedMap hotspots", true);
        int pass = 0;
        for (Map.Entry<String, Boolean> c : checks.entrySet()) {
            if (Boolean.TRUE.equals(c.getValue())) {
                pass++;
            }
            System.out.println(c.getKey() + " | " + c.getValue());
        }
        System.out.println("pass count = " + pass + " / " + checks.size());
        System.out.println("eof");
    }
}
`;

export const ADVANCED_OUTPUT = `banner: Day14 advanced collection guardrails
scope: arch.day14 workload + concurrency matrix


=== Block 1: list and map workload picker ===
random index hot | ArrayList | cache-friendly array backing
sorted range scans | TreeMap | NavigableMap red-black order
shared read-heavy cache | ConcurrentHashMap | striped CAS not one lock
stable audit iteration | LinkedHashMap | predictable encounter order

=== Block 2: risk weight board ===
mutable HashMap keys in prod = 5
getter returns internal ArrayList = 4
PriorityQueue foreach for ordering = 3
bounded ArrayDeque task queue = 0
total risk = 12

=== Block 3: PR checklist ===
DTO getters return copyOf or unmodifiable snapshots | false
HashMap keys immutable or stable String ids | true
Concurrent reads migrated off synchronizedMap hotspots | true
pass count = 2 / 3
eof
`;

export const PITFALLS = [
  "Returning the internal **ArrayList** from a **Spring** **DTO** **getter** while **Kafka** consumers mutate the same **list** during **JSON** **serialization** - production symptom is **ConcurrentModificationException** with **ArrayList$Itr.checkForComodification** stacks during **rebalance**; fix by returning **List.copyOf** snapshots or **synchronizing** **mutation** **boundaries**; verify with **jcmd** **Thread.print** showing **Iterator.next** interleaving **List.add**.",
  "Using a **mutable** **DTO** as a **HashMap** **cache** **key** then calling **setters** after **put** - production symptom is **cache** **misses** and **null** **gets** even though **heap** still holds **orphaned** **entries** in wrong **buckets**; fix by **record** **keys** or **String** **ids** frozen at **insert**; verify with **jmap** **-dump:live** and **Eclipse** **MAT** **HashMap** **inspector**.",
  "Iterating a **PriorityQueue** with **enhanced** **for** expecting **priority** **order** - production symptom is **mis**-**ordered** **batch** **jobs** and **silent** **SLA** drift; fix by draining with **poll** in a **loop** or using **stream** **sorted** **copies**; verify with a **unit** test comparing **foreach** versus **poll** **sequences**.",
  "Keeping **Collections.synchronizedMap** on a **read**-**heavy** **metrics** **cache** with thousands of **RPS** - production symptom is **lock** **contention** and **p99** **latency** cliffs; fix by migrating to **ConcurrentHashMap** and **compute** **idioms**; verify with **jstack** **BLOCKED** frames on the **wrapper** **monitor**.",
  "Calling **Arrays.asList** then **add** in a **legacy** **refactor** - production symptom is **UnsupportedOperationException** during **canary** **traffic**; fix by wrapping with **new** **ArrayList<>** or using **List.of** for **immutable** **snapshots**; verify with **integration** tests covering **mutation** paths.",
  "Creating **unbounded** **static** **HashMap** **caches** without **eviction** or **metrics** - production symptom is **OutOfMemoryError**: **Java** **heap** **space** after **deploy** **weekends**; fix with **Caffeine**/**Guava** **bounded** **caches** or **LinkedHashMap** **removeEldestEntry**; verify with **jcmd** **GC.heap_info** and **heap** **dump** **dominators**.",
  "Storing **null** **keys** into **ConcurrentHashMap.compute** paths after **Optional** misuse - production symptom is **IllegalArgumentException** spikes on **Java** **11**+ **CHM** **strict** **null** **rules**; fix by **guarding** **keys** before **compute**; verify with **javac** **lint** and **null**-**safe** **DTO** **mappers**.",
  "Serializing **untrusted** **gadget** **graphs** containing **synchronized** **collections** - production symptom is **remote** **code** **execution** via **deserialization** **chains**; fix by disabling **Java** **serialization** for **untrusted** **bytes** and using **allowlists**; verify with **java** **-Djdk.serialFilter** **patterns** on **Java** **17**+ services.",
];

export const EXERCISE_PROBLEM = [
  "You join the **pricing** squad reviewing **token** **histogram** helpers that must expose **immutable** **snapshots** to **REST** clients while still using **HashMap.merge** for **aggregation**.",
  "",
  "Requirements:",
  "1. Implement **arch.day14.Day14Exercise** with **public static void main(String[] args)** printing two legend lines starting **copyOf:** and **merge:** explaining **List.copyOf** snapshots versus **HashMap.merge** aggregation (each line under 140 chars).",
  "2. Add **static** **final** **class** **TokenHistogram** with **private** **final** **Map<String,Integer> counts** constructed via **Collections.unmodifiableMap** over a **LinkedHashMap** **copy**.",
  "3. Provide **static TokenHistogram compute(List<String> tokens)** that uses **HashMap.merge** with **Integer::sum** for each token.",
  "4. Implement **int distinct()**, **int totalTokens()**, **List<String> keysSnapshot()** returning **List.copyOf(counts.keySet())**, and **String formatCounts()** appending **key=value;** pairs in **entrySet** **iteration** order.",
  "5. In **main**, build **List<String> tokens = List.of(\"east\",\"west\",\"east\",\"north\",\"east\")**, compute histogram, print **distinct=** and **total=**, print **keys=** snapshot, print **fmt=** plus **formatCounts()**, then **done** on its own line.",
].join("\n");

export const EXERCISE_HINTS = [
  "Keep **TokenHistogram** **immutable** after **compute** returns by wrapping the **LinkedHashMap** **copy** with **unmodifiableMap**.",
  "**merge** runs on your **thread**; still pair with **copyOf** **snapshots** when crossing **API** boundaries.",
  "**formatCounts** should walk **entrySet** so **order** matches the **LinkedHashMap** **insertion** **order** of **keys** discovered.",
];

export const EXERCISE_SOLUTION = `package arch.day14;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Day 14 exercise: HashMap.merge aggregation + immutable snapshot surface.
 */
public class Day14Exercise {

    static final class TokenHistogram {
        private final Map<String, Integer> counts;

        private TokenHistogram(Map<String, Integer> counts) {
            this.counts = Collections.unmodifiableMap(new LinkedHashMap<>(counts));
        }

        static TokenHistogram compute(List<String> tokens) {
            Map<String, Integer> m = new LinkedHashMap<>();
            for (String t : tokens) {
                m.merge(t, 1, Integer::sum);
            }
            return new TokenHistogram(m);
        }

        int distinct() {
            return counts.size();
        }

        int totalTokens() {
            int sum = 0;
            for (int v : counts.values()) {
                sum += v;
            }
            return sum;
        }

        List<String> keysSnapshot() {
            return List.copyOf(counts.keySet());
        }

        String formatCounts() {
            StringBuilder sb = new StringBuilder();
            for (Map.Entry<String, Integer> e : counts.entrySet()) {
                sb.append(e.getKey()).append('=').append(e.getValue()).append(';');
            }
            return sb.toString();
        }
    }

    public static void main(String[] args) {
        final String a = "copyOf: List.copyOf exposes an unmodifiable snapshot decoupled from later mutations.";
        final String b = "merge: HashMap.merge combines values for duplicate keys on the aggregating thread.";
        final List<String> tokens = List.of("east", "west", "east", "north", "east");
        System.out.println(a);
        System.out.println(b);
        TokenHistogram hist = TokenHistogram.compute(new ArrayList<>(tokens));
        System.out.println("distinct=" + hist.distinct() + " total=" + hist.totalTokens());
        System.out.println("keys=" + hist.keysSnapshot());
        System.out.println("fmt=" + hist.formatCounts());
        System.out.println("done");
    }
}
`;

export const JOB_SWITCH = {
  resumeBullet:
    "Replaced synchronizedMap hotspots with ConcurrentHashMap; cut p99 cache reads 42% on 8k RPS.",
  interviewPositioning:
    "When interviewers probe **collections**, you narrate **modCount** **fail**-**fast** **iterators**, **HashMap** **resize** cost, and **ConcurrentHashMap** **semantics**. In week one at a new company you **grep** **synchronizedMap** and **getter**-**returned** **ArrayList** instances, then ticket **List.copyOf** fixes with **jcmd** **Thread.print** reproducers attached.",
  starAnchor:
    "Situation: **billing** **pods** threw **ConcurrentModificationException** during **Jackson** **serialization** after **Kafka** **rebalance**. Task: stop **500s** without losing **throughput**. Action: proved **shared** **ArrayList** **mutation** via **jstack**, returned **List.copyOf** from **DTO** **getters**, added **two**-**thread** **stress** tests, migrated hot **cache** to **ConcurrentHashMap**. Result: **zero** **CME** **incidents** over **6** **months**; **p99** **latency** dropped **38** **percent** on **checkout** **path**.",
};

export const CHEATSHEET_CONTENT = `| Concept | Quick rule | Example / Command |
|---------|------------|---------------------|
| **fail**-**fast** | **modCount** vs **iterator** | **ConcurrentModificationException** |
| **ArrayList** **growth** | **amortized** **copy** | presize **new** **ArrayList**(n) |
| **HashMap** **get/put** | **average** **O(1)** | watch **resize** + **hash** **quality** |
| **equals**/**hashCode** | **contract** for **Set**/**Map** | **immutable** **keys** |
| **ConcurrentHashMap** | **fine**-**grained** **concurrency** | **compute**/**merge** **Java** **8** |
| **synchronizedMap** | **coarse** **lock** per **call** | **synchronize** **iteration** **manually** |
| **List.copyOf** | **immutable** **snapshot** **Java** **10** | rejects **null** **elements** |
| **LinkedHashMap** | **insertion** or **access** **order** | **LRU** via **removeEldestEntry** |
| **PriorityQueue** | **poll** **order** not **foreach** | loop **while(!q.isEmpty())** **poll** |
| **TreeMap** | **sorted** **keys** | **Comparable** or **Comparator** |
| **Java** **21** **Sequenced** | **first**/**last**/**reversed** | **SequencedCollection** **API** |
| **jcmd** **threads** | **prove** **races** | **jcmd** **pid** **Thread.print** |
`;

export const WRONG_ANSWERS = [
  "HashMap iteration order is stable across JVM runs as long as you do not call remove.",
  "Collections.synchronizedMap makes every iterator automatically thread-safe without extra synchronization.",
  "ConcurrentModificationException means the JVM detected a data race with happens-before guarantees.",
  "LinkedList random access by index is O(1) because each node stores its position.",
  "You can store null keys and null values in ConcurrentHashMap just like HashMap.",
  "PriorityQueue for-each loop always visits elements in ascending priority order.",
  "TreeMap and HashMap both use hashCode to order keys for iteration.",
  "Arrays.asList returns a growable ArrayList backed by a fresh copy of the array every time.",
];
