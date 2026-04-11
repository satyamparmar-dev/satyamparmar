const FU_ONCALL = {
  question:
    "Interview follow-up: how does **Java Collections Framework** show up in **production** debugging or **on-call**?",
  answer:
    "You capture **jcmd** `<pid>` **Thread.print** when **ConcurrentModificationException** appears during **Jackson** **serialization**, then align **stack** frames so one **thread** sits in **Iterator.next** while another hits **ArrayList.add** on the same **list** **identity**. You pull **jmap** **-histo:live** when **heap** climbs from an unbounded **HashMap** **cache**, open **MAT** dominators on **java.util.HashMap$Node**, and diff **jstat** **-gc** before and after **resize** storms. You finish by documenting **List.copyOf** versus **unmodifiable** **view** rules in the **runbook** so the next **on-call** engineer replays the same **command** ladder instead of toggling **GC** flags blindly.",
};

const FU_TRAP = {
  question: "What is a **common trap** or **follow-up** question on **Java Collections Framework**?",
  answer:
    "Interviewers claim **Collections.synchronizedMap** makes **iterators** **thread**-**safe** automatically. You answer that only **individual** **mutator** methods synchronize; **foreach** still needs **manual** **synchronization** on the **map** or a **ConcurrentHashMap** **migration**. Another trap is **mutable** **HashMap** **keys**: candidates swear **equals** stayed stable even after **setters** ran post-**put**. You close with **javap** on **ArrayList$Itr** showing **expectedModCount** checks and **jstack** proof of **checkForComodification** when **Kafka** **threads** interleave.",
};

const CONCEPTUAL_TAIL =
  "Staff proof bundle: pair **jcmd** **Thread.print** with **getter** **code** review whenever **ConcurrentModificationException** stacks mention **Spliterator** or **ArrayList$Itr**, run **jmap** **-dump:live** if **HashMap** **Node** histograms explode, cite **Java 8** **HashMap** **treeify**, **Java 10** **List.copyOf**, **Java 21** **SequencedCollection** ergonomics, attach **MAT** **HashMap** inspector screenshots for **mutable** **key** incidents, add **jstat** **-gc** slices proving **resize** correlation, rehearse **javap** **-c** **java.util.ArrayList** for **modCount** literacy, demand **stress** tests that **mutate**/**iterate** concurrently before any **DTO** **PR** merges, and log **java -version** beside every **repro** so **JDK** **implementation** **diffs** never masquerade as **logic** **bugs**.";

const SENIOR_EXT =
  "\n\nStaff narrative closure: attach **jstack** diffs and **jcmd** **VM.native_memory** slices to architecture tickets when **collection** refactors ship, cite **Java 21** **SequencedCollection** when **LinkedHashMap**-only ordering debates stall, demand **bounded** **caches** with **metrics** before closing **OutOfMemoryError** incidents, rehearse **jmap** histograms with stakeholders so **heap** growth reads as **unbounded** **maps** not mystery **leaks**, log **java -version** beside every mitigation, publish **Prometheus** **p99** deltas proving **ConcurrentHashMap** migrations recovered **read** paths, correlate **jstat** **-gc** when **ArrayList** growth follows **JSON** **batch** sizes, store **unit** **test** **repros** next to every **CME** fix **PR**, require **ArchUnit** bans on **Hashtable** in new modules, add **Flight** **Recording** allocation views when **resize** storms follow **ingestion** deploys, file **JMH** baselines when reviewers question **copyOf** overhead, capture **java -Xlog:gc** excerpts when **pause** times track **HashMap** **rehash** windows, and record **List.copyOf** versus **view** decisions inside **ADR** docs so future **teams** inherit the **rationale** without reopening **heap** **war** rooms.";

const c = (question, answer) => ({
  question,
  answer: `${answer} ${CONCEPTUAL_TAIL}`,
  followUps: [{ ...FU_ONCALL }, { ...FU_TRAP }],
});

export const CONCEPTUAL = [
  c(
    "How does **ArrayList** **grow** internally and why does it matter under **load**?",
    "**ArrayList** stores **elements** in an **Object[]** **elementData** with a separate **int** **size**. When **add** exhausts **capacity**, it allocates a larger array (typically **1.5x**) and **System.arraycopy** copies references, incrementing **modCount** each **structural** change. **Amortized** **O(1)** **add** still produces **allocation** spikes that show up as **young** **GC** churn in **throughput** **ingestion**. Production **symptom** is **p99** latency cliffs during **cold** **start** **fills** of huge **lists**. **Diagnostic**: **jmap** **-histo:live** for **Object[]** growth and **jstat** **-gc** correlation. **Java 8** through **Java 21** share this growth policy on **OpenJDK** **ArrayList**.",
  ),
  c(
    "What is **fail**-**fast** iteration and where is it implemented?",
    "**ArrayList** **iterators** cache **expectedModCount** taken from the **parent** list at **iterator** creation. Each **next**/**remove** compares to the live **modCount**; mismatch throws **ConcurrentModificationException**. This is a **best**-**effort** **heuristic**, not **ACID** isolation. **Production** stacks show **ArrayList$Itr.checkForComodification** under **Jackson** walks when another **thread** mutates the same **list**. Proof lives in **javap** **-c** **java.util.ArrayList$Itr**. **Java 11** tightened **Spliterator** documentation but kept **fail**-**fast** semantics for **standard** **collections**.",
  ),
  c(
    "Why does **HashMap** **resize** and what **GC** symptom can it cause?",
    "**HashMap** keeps a **Node[]** **table** whose length is always a **power** of **two**. When **size** exceeds **capacity** **times** **load** **factor**, it **resize**s, **rehashing** every **entry** into a new table. That is **O(n)** work and can lengthen **pause** times when millions of **entries** move during **traffic** spikes. **Production** teams misread the issue as **GC** tuning failure. **jstat** **-gc** and **jcmd** **GC.heap_info** help separate **resize** from **leaks**. **Java 8** added **treeify** on **deep** **bins** but **resize** **copies** still dominate when **capacity** was underestimated.",
  ),
  c(
    "What **equals** and **hashCode** rules does **HashMap** demand from **keys**?",
    "**Equal** **keys** must have **equal** **hash** **codes** so **get** probes the same **bucket** **index** chosen at **put** time. **Mutating** a **key** object so **hashCode** changes after **insert** strands **entries** while **get** returns **null**, inflating **cache** **miss** metrics. **Interviewers** expect **immutable** **keys** or stable **String** identifiers. **Diagnostic**: **jmap** **-dump:live** plus **MAT** **HashMap** inspector. **Java** **records** on **Java 16**+ help when components are themselves **immutable**.",
  ),
  c(
    "How does **ConcurrentHashMap** differ from **Collections.synchronizedMap**?",
    "**ConcurrentHashMap** uses **fine**-**grained** **locking** and **volatile** **reads** so concurrent **get** operations usually avoid **serializing** on one **monitor**. **Collections.synchronizedMap** wraps a **backing** **map** and **synchronizes** each **mutator** method on the same **lock**, creating **contention** on **read**-**heavy** **paths**. **Iterator** **weak** **consistency** on **CHM** contrasts with **fail**-**fast** **ArrayList** iterators. **Java 8** added **compute**/**merge** for **atomic** **read**-**modify**-**write**. Verify **contention** with **jstack** **BLOCKED** frames on the **wrapper** **monitor**.",
  ),
  c(
    "When should you pick **TreeMap** over **HashMap**?",
    "**TreeMap** maintains **keys** in **red**-**black** **tree** order using **Comparable** or a **Comparator**, giving **O(log n)** **containsKey**/**put** with **ordered** **iteration**. **HashMap** averages **O(1)** but cannot **emit** **sorted** **ranges**. **Production** misuse is choosing **HashMap** when **finance** **reports** need **subMap** scans, causing **client**-**side** **sorts** of millions of **rows**. **javap** is less central here; **jcmd** **Thread.print** still helps if **compareTo** **hotspots** deadlock. **Java 21** **SequencedMap** does not replace **TreeMap** **ordering** semantics for arbitrary **comparators**.",
  ),
  c(
    "What does **LinkedHashMap** add beyond **HashMap**?",
    "**LinkedHashMap** subclasses **HashMap** and links **entries** in **insertion** or **access** **order** for predictable **iteration**. **accessOrder** **true** enables **LRU**-style **caches** when **removeEldestEntry** is overridden. **Production** risk: **access**-**order** **mode** mutates **structure** on **get**, surprising teams who thought **get** was **read**-**only** for **LinkedHashMap**. **Diagnostic**: **heap** **diff** **histograms** for **LinkedHashMap$Entry**. **Java** **LinkedHashMap** behavior is stable across **Java 8**-**21**.",
  ),
  c(
    "What does **List.copyOf** guarantee compared with **Collections.unmodifiableList**?",
    "**List.copyOf** allocates a new **immutable** **list** snapshot rejecting **null** **elements**; **Collections.unmodifiableList** returns a **view** over the **backing** **list**, so **mutations** through other **aliases** still change what **clients** observe. **Production** **Kafka** **bugs** trace to **DTO** **getters** returning **unmodifiable** **views** of still-**shared** **mutable** **ArrayList** instances. **Java 10** introduced **List.copyOf** for **List**; **Java 9** brought **of** **factories** for **smaller** **immutable** **lists**.",
  ),
  c(
    "Why is **PriorityQueue** iteration order misleading?",
    "**PriorityQueue** uses a **binary** **heap** for **efficient** **poll**/**offer**, but its **iterator** walks **internal** **array** **positions** without **priority** **order**. **Production** **batch** jobs that **foreach** a **PriorityQueue** expecting **sorted** **output** ship silently **wrong** **settlements**. **Fix** by **polling** until **empty** or copying to a **sorted** **structure**. **javap** shows **siftUp**/**siftDown** mechanics. Behavior unchanged on **Java 21**.",
  ),
  c(
    "What happens when you call **add** on **Arrays.asList** output?",
    "**Arrays.asList** returns a **fixed**-**size** **List** **view** over the **array**; **add**/**remove** throw **UnsupportedOperationException** while **set** is allowed. **Canary** failures follow **refactors** that treat the **view** like **ArrayList**. **Fix** with **new** **ArrayList<>(Arrays.asList(...))** or **List.of** for **immutable** **snapshots**. **javac** does not warn. This pitfall spans **Java 8**-**21**.",
  ),
  c(
    "How do **Java 21** **SequencedCollection** methods change **List** ergonomics?",
    "**SequencedCollection** adds **getFirst**, **getLast**, **reversed**, and consistent **encounter** **order** operations for **ordered** **collections** like **ArrayList** and **LinkedHashMap** **sequenced** **views**. It reduces **boilerplate** that previously used **get(0)**/**get(size-1)** with **edge** **cases**. **Production** teams still must not confuse **reversed** **view** **mutations** with **copy** **semantics**. **Diagnostic** remains **unit** tests plus **API** **diff** reviews. This is **Java** **21** **library** surface area.",
  ),
  c(
    "Why can **null** **keys** break **ConcurrentHashMap.compute** paths?",
    "**ConcurrentHashMap** forbids **null** **keys** and **null** **values** to avoid ambiguity between **missing** **mappings** and **explicit** **nulls** under **concurrency**. Passing a **null** **key** into **compute** throws **IllegalArgumentException** immediately. **Production** spikes follow **Optional.get** without **isPresent** after **JSON** **parsing** **refactors**. **Fix** with **null** checks or **Optional** **orElseThrow** with **context**. Strictness holds on **Java 11**+ **CHM**.",
  ),
  c(
    "What is **weak** **consistency** for **ConcurrentHashMap** **iterators**?",
    "**ConcurrentHashMap** **iterators** reflect the **map** at some point during **traversal** and may **skip** or **duplicate** **entries** when **concurrent** **mutations** occur, but they typically avoid **ConcurrentModificationException**. This trades **strong** **atomic** **views** for **scalability**. **Production** **metrics** **pipelines** must not assume **iterators** are **point**-**in**-**time** **snapshots** for **audit**. **Java 8** documentation clarifies **bulk** **operations** **behavior** that continues through **Java 21**.",
  ),
  c(
    "How does **HashSet** relate to **HashMap** internally?",
    "**HashSet** is backed by a **HashMap** where **elements** are **keys** mapped to a **constant** **PRESENT** **object**. **equals**/**hashCode** on **elements** therefore follow **HashMap** **key** **rules**. **Production** **dedupe** bugs appear when **equals** changes across **library** upgrades while **hashCode** lags. **Diagnostic**: **javap** **-c** **java.util.HashSet** shows **map.put** delegation. Pattern stable **Java 8**-**21**.",
  ),
  c(
    "When is **CopyOnWriteArrayList** appropriate?",
    "**CopyOnWriteArrayList** **mutates** by copying the entire **backing** **array** on **write** while **iterators** snapshot the **array** at creation, avoiding **ConcurrentModificationException** on **iterate**. **Reads** are fast; **writes** are **expensive**. **Production** fits small **listener** **lists** with rare **registration** changes. Misuse is **high**-**churn** **write** **loads** causing **allocation** storms visible in **jmap** **histograms**. **Java** **concurrency** **docs** unchanged in spirit on **Java 21**.",
  ),
  c(
    "What does **Map.merge** do at the **bytecode** level of reasoning?",
    "**merge** **atomically** reads the current **value** for a **key**, applies the **remapping** **function** with the **provided** **value**, and **stores** the **result** for **ConcurrentHashMap** using **internal** **synchronization** **primitives**, while **HashMap** **merge** is **single**-**threaded** **safe** only if **you** **externally** **guard** **concurrency**. **Production** **race** bugs appear when **teams** **merge** into **HashMap** from **many** **threads** without **CHM**. **Java 8** introduced **merge** on **Map** **interface** **defaults** implemented by **concrete** **classes**.",
  ),
  c(
    "How do you choose **ArrayDeque** over **LinkedList** for **queues**?",
    "**ArrayDeque** uses a **circular** **array** with **head**/**tail** indices, giving **amortized** **O(1)** **offer**/**poll** with better **cache** locality than **LinkedList** **nodes**. **LinkedList** allocates a **node** per **element**, stressing **GC** under **queue** **load**. **Production** **latency** wins favor **ArrayDeque** unless you need **List** **operations** on the same **structure**. **jmap** **histograms** show **Node** churn when **LinkedList** misused. Guidance stable across **Java 8**-**21**.",
  ),
];

const CODE_BASED_TAIL =
  "Reconfirm behavior with **javap** on **jdk** classes when the interviewer challenges **iterator** implementation details, mention **jcmd** **GC.class_histogram** if **boxing** or **Node** allocation dominates the profile, cite **jstack** when **ConcurrentModificationException** stacks must align with **business** **thread** **names**, and cross-check **jmap** **-histo:live** whenever **resize** or **unbounded** **growth** suspicion appears.";

const cb = (question, answer) => ({
  question,
  answer: `${answer} ${CODE_BASED_TAIL}`,
  followUps: [{ ...FU_ONCALL }, { ...FU_TRAP }],
});

export const CODE_BASED = [
  cb(
    "What does this print?\n```java\nimport java.util.*;\npublic class T {\n  public static void main(String[] args) {\n    List<String> a = new ArrayList<>();\n    a.add(\"x\");\n    List<String> v = Collections.unmodifiableList(a);\n    a.add(\"y\");\n    System.out.println(v.size());\n  }\n}\n```",
    "**unmodifiableList** is a **view**: **add** on **a** mutates the backing **array**, so **v.size()** prints **2**. This shows **unmodifiable** is not a **snapshot** when other **aliases** exist; **List.copyOf** would have frozen **one** element at **copy** time on **Java 10**+.",
  ),
  cb(
    "What does this print?\n```java\nimport java.util.*;\npublic class T {\n  public static void main(String[] args) {\n    List<Integer> xs = Arrays.asList(1, 2, 3);\n    System.out.println(xs.getClass().getSimpleName());\n  }\n}\n```",
    "**Arrays.asList** returns a **private** **JDK** **List** implementation (often named like **ArrayList** inside **Arrays**); **getSimpleName** prints that **nested** **class** **name** such as **ArrayList** in many **JDK** builds. Teaching point: it is **not** **java.util.ArrayList** and **add** throws **UnsupportedOperationException**.",
  ),
  cb(
    "Does this throw?\n```java\nimport java.util.*;\npublic class T {\n  public static void main(String[] args) {\n    Map<String,String> m = new HashMap<>();\n    m.put(null, \"a\");\n    System.out.println(m.get(null));\n  }\n}\n```",
    "**HashMap** allows one **null** **key**; **get(null)** returns **a** and the program prints **a** without throwing. Contrast **ConcurrentHashMap**, which rejects **null** **keys** outright with **NullPointerException**/**IllegalArgumentException** depending on operation.",
  ),
  cb(
    "What does this print?\n```java\nimport java.util.*;\npublic class T {\n  public static void main(String[] args) {\n    Map<String,Integer> m = new HashMap<>();\n    m.merge(\"k\", 1, Integer::sum);\n    m.merge(\"k\", 2, Integer::sum);\n    System.out.println(m.get(\"k\"));\n  }\n}\n```",
    "**merge** applies **Integer::sum** when the **key** already exists: first call inserts **1**, second combines **1** and **2** to **3**. Stdout prints **3**. This models **atomic** **read**-**modify**-**write** on a **single**-**threaded** **HashMap**; multi-threaded **use** requires **ConcurrentHashMap**.",
  ),
  cb(
    "What does this print?\n```java\nimport java.util.*;\npublic class T {\n  public static void main(String[] args) {\n    Set<String> s = new HashSet<>();\n    s.add(new String(\"a\"));\n    s.add(new String(\"a\"));\n    System.out.println(s.size());\n  }\n}\n```",
    "Both strings are **equal** with matching **hashCode**, so **HashSet** stores one entry. **size** prints **1**. **IdentityHashSet** would differ, but **HashSet** follows **equals**/**hashCode** semantics.",
  ),
  cb(
    "Does this compile?\n```java\nimport java.util.concurrent.*;\npublic class T {\n  public static void main(String[] args) {\n    ConcurrentHashMap<String,String> m = new ConcurrentHashMap<>();\n    m.put(null, \"x\");\n  }\n}\n```",
    "The snippet **compiles**, but **ConcurrentHashMap.put** rejects **null** **keys** and **values**, so **main** throws **NullPointerException** when **put** runs. This differs from **HashMap**, which permits a single **null** **key**. Interview answers should cite the **stricter** **CHM** **contract** on **Java 8**+ to explain **canary** crashes after **Optional** misuse.",
  ),
  cb(
    "What does this print?\n```java\nimport java.util.*;\npublic class T {\n  public static void main(String[] args) {\n    List<String> a = new ArrayList<>();\n    a.add(\"a\"); a.add(\"b\");\n    for (String s : a) {\n      if (\"a\".equals(s)) a.remove(s);\n    }\n    System.out.println(\"ok\");\n  }\n}\n```",
    "The **enhanced** **for** loop uses an **iterator**; calling **ArrayList.remove** while iterating advances **modCount** without updating the **iterator** **expectedModCount**, so **fail**-**fast** logic throws **ConcurrentModificationException** on the next **next()** call. Stdout never prints **ok** under **standard** **OpenJDK** **ArrayList**; use **Iterator.remove** or **removeIf** for safe structural changes.",
  ),
  cb(
    "What does this print?\n```java\nimport java.util.*;\npublic class T {\n  public static void main(String[] args) {\n    Map<Integer,String> m = new TreeMap<>();\n    m.put(2, \"b\");\n    m.put(1, \"a\");\n    System.out.println(m.firstKey());\n  }\n}\n```",
    "**TreeMap** orders by **natural** **Integer** order, so **firstKey** returns **1** even though **2** inserted first. Stdout prints **1**, illustrating **sorted** **Map** semantics versus **HashMap** **iteration** **unpredictability**.",
  ),
];

const seniors = [
  {
    question:
      "Your **Spring** **invoice** service throws **ConcurrentModificationException** inside **ObjectMapper** while serializing **LineItemDto** only after **Kafka** **consumer** **rebalance** increases **parallelism**.",
    answer:
      "**Immediate response:** Capture **jcmd** `<pid>` **Thread.print** from a failing pod and grep **stack** frames for **ArrayList$Itr.next** alongside **ArrayList.add** on **worker** threads sharing the same **DTO** **list** **reference**.\n\n" +
      "**Root cause:** **Fail**-**fast** **iterator** detects **modCount** drift because **thread** **A** serializes a **mutable** **list** returned from a **getter** while **thread** **B** appends **lines** during **settlement** **batch** **processing**.\n\n" +
      "**Fix:** Change **getLines** to return **List.copyOf(lines)** or an **unmodifiable** **snapshot** after constructing a **defensive** **copy** in the **DTO** **builder**, add a **two**-**thread** **stress** test reproducing **CME**, redeploy, and attach **jstack** diffs to the **PR**.\n\n" +
      "**Prevention:** **ArchUnit** rule banning raw **mutable** **List** **returns** from **API** **DTOs**; **code** **review** checklist requiring **copyOf** at **trust** boundaries; **metrics** on **serialization** **errors** tied to **rebalance** events.",
  },
  {
    question:
      "**Redis** **fallback** **miss** rate jumps after **users** update profile fields; **heap** dumps still show **HashMap** **entries** but **get** returns **null**.",
    answer:
      "**Immediate response:** Take **jmap** **-dump:live** from the **cache** service and open **MAT** **HashMap** inspector on **ProfileKey** entries to see **hashCode**/**bucket** mismatches.\n\n" +
      "**Root cause:** **Mutable** **key** objects changed **hashCode** after **put**, stranding **entries** in stale **buckets** while **get** probes the new **hash** **index**.\n\n" +
      "**Fix:** Replace **keys** with **record ProfileKey(String id)** or **String** **ids**, reindex **cache**, add tests forbidding **setter** calls after **map** insertion.\n\n" +
      "**Prevention:** **Static** analysis banning **setter**-bearing **types** used as **HashMap** **keys**; **integration** tests mutating **keys** post-**put**; **documentation** in **runbook** linking **miss** spikes to **hash** drift.",
  },
  {
    question:
      "**p99** **latency** doubles during nightly **ingestion** after deploying a **CSV** **loader** that builds a **new** **HashMap** with default **capacity** for millions of **rows**.",
    answer:
      "**Immediate response:** Run **jstat** **-gc** `<pid>` **1s** during **ingestion** and correlate **young**/**old** **GC** spikes with **put** **bursts** in **profiler** **flame** graphs.\n\n" +
      "**Root cause:** Repeated **HashMap** **resize** operations copy **Node** tables whenever **size** crosses **load** **factor** thresholds, inflating **CPU** and **pause** times.\n\n" +
      "**Fix:** Pre-size with **new** **HashMap<>((int)(expected / 0.75f) + 1)** (or **Guava** **newHashMapWithExpectedSize**), rerun **ingestion**, and compare **jstat** timelines.\n\n" +
      "**Prevention:** **Performance** **budget** tests on **batch** jobs; **code** **review** rule requiring **expected** **size** hints for **large** **maps**; **dashboards** tracking **ingestion** **duration** regressions.",
  },
  {
    question:
      "A **service** still throws **ConcurrentModificationException** even after wrapping **shared** **Map** with **Collections.synchronizedMap**.",
    answer:
      "**Immediate response:** Pull **jstack** and verify whether **iterator** **loops** sit outside **synchronized(map)** blocks while other **threads** call **put**.\n\n" +
      "**Root cause:** **synchronizedMap** only **serializes** **individual** **methods**; **Iterator** **hasNext**/**next** sequences are **not** atomic unless **externally** synchronized.\n\n" +
      "**Fix:** Wrap **iteration** bodies with **synchronized(map)** or migrate to **ConcurrentHashMap** **entrySet** **streaming** patterns suited to **read**-**heavy** **workloads**.\n\n" +
      "**Prevention:** **Lint** rule or **ArchUnit** test detecting **foreach** on **synchronizedMap** **views** without **explicit** **monitor**; **on-call** **playbook** entry distinguishing **CHM** from **wrapper** **maps**.",
  },
  {
    question:
      "**Finance** **batch** reports show **wrong** **payment** order after a **refactor** switched from **TreeMap** to **PriorityQueue** but kept a **foreach** **export** loop.",
    answer:
      "**Immediate response:** Reproduce locally printing **queue** **elements** via **foreach** versus repeated **poll**, capture **stdout** diff, and attach to **ticket**.\n\n" +
      "**Root cause:** **PriorityQueue** **iterator** does not drain in **priority** order; **heap** **ordering** is only observable through **poll**/**peek**.\n\n" +
      "**Fix:** Replace **foreach** with **while(!q.isEmpty()) poll()** or copy into **ArrayList** then **sort** explicitly if **stable** **secondary** **keys** matter.\n\n" +
      "**Prevention:** **Unit** tests asserting **poll** **order**; **style** guide banning **foreach** on **PriorityQueue** for **business** **ordering**; **code** **review** checklist item.",
  },
  {
    question:
      "**Pods** **OOM** after **Black** **Friday** when a **static** **Map** **skuCache** grows without **bounds**; **metrics** show **heap** **used** climbing linearly with **SKU** **cardinality**.",
    answer:
      "**Immediate response:** Capture **jcmd** **GC.heap_info** and a **heap** dump, then rank **HashMap$Node** dominators in **MAT** to confirm the **cache** is the **retained** set.\n\n" +
      "**Root cause:** **Unbounded** **HashMap** retains every **SKU** **value** graph with no **eviction**, eventually exhausting **heap** despite **GC** pressure.\n\n" +
      "**Fix:** Introduce **Caffeine**/**Guava** **maximumSize** with **metrics** on **eviction** or implement **LinkedHashMap** **removeEldestEntry** with a **cap**, redeploy with **feature** flag.\n\n" +
      "**Prevention:** **SRE** **review** for **static** **mutable** **collections**; **ArchUnit** ban; **Prometheus** alerts on **cache** **size** **gauges** and **heap** **utilization**.",
  },
];

export const SENIOR_SCENARIO = seniors.map((s) => ({
  ...s,
  answer: s.answer + SENIOR_EXT,
  followUps: [{ ...FU_ONCALL }, { ...FU_TRAP }],
}));
