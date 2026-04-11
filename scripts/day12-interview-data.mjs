const FU_ONCALL = {
  question:
    "Interview follow-up: how does **Encapsulation and Immutability** show up in **production** debugging or **on-call**?",
  answer:
    "You capture **jcmd** **Thread.print** when **ConcurrentModificationException** hits during **JSON** serialization, then open **javap -c** on the **DTO** **getter** to see whether **List.copyOf** appears before **areturn**. You pull **jmap -dump:live** when **cache** miss metrics spike after a **Date** **key** **mutation**, attach **MAT** **HashMap** histograms to the ticket, and add **jstack** samples showing **Iterator** frames colliding with **mutator** threads. You finish by documenting **defensive** **copy** rules in the **runbook** so the next **on-call** engineer repeats the same command ladder without improvising.",
};

const FU_TRAP = {
  question: "What is a **common trap** or **follow-up** question on **Encapsulation and Immutability**?",
  answer:
    "Interviewers love **final** **List** fields where the list contents still **mutate** because only the reference is frozen. Another trap is **Collections.unmodifiableList** backed by a **mutable** **ArrayList** callers still hold. You answer with **javap** evidence plus **List.copyOf** versus **unmodifiable** semantics, then mention **record** **shallow** **immutability** when components stay **mutable**. You close by naming **HashMap** **key** **mutations** after **put** as silent **production** killers that only **MAT** exposes.",
};

const CONCEPTUAL_TAIL =
  "Staff proof bundle: pair **javap -c** with **jcmd** **Thread.print** when **ConcurrentModificationException** disagrees with your mental model, run **jmap -dump:live** if **cache** metrics imply **hashCode** drift, cite **Java 10** **List.copyOf**, **Java 16** **records**, and **Java 21** **sequenced** **collections** ergonomics, attach outputs to **Jira**, add **jstack** samples under load, rehearse **javac -verbose** repro steps, and demand **MAT** **Histogram** screenshots whenever **equals** symmetry breaks so every answer names commands reviewers replay without your laptop.";

const SENIOR_EXT =
  "\n\nStaff narrative closure: attach **javap** **getter** dumps and **jcmd** **VM.flags** slices to architecture tickets, cite **Java 21** **record** patterns for **DTO** carriers, demand **Gradle** modules align **immutable** **API** packages with **ORM** layers before closing incidents, rehearse **jstack** captures with stakeholders so **ConcurrentModificationException** reads as **alias** bugs not random **framework** faults, log **java -version** beside every mitigation, publish **Prometheus** miss-rate deltas proving **canary** recovered after **copyOf** fixes, correlate **jstat -gc** when **allocation** spikes follow **defensive** **copy** bursts, store **javap** diffs next to every **DTO** **PR**, require **ArchUnit** failures to block merges when **public** **mutable** fields reappear, add **Flight** **Recording** slices whenever **CPU** regressions follow **immutability** hardening, file **JMH** baselines when reviewers question **copyOf** overhead, and capture **java -Xlog:gc** excerpts when **GC** pauses correlate with **DTO** **hardening**.";

const c = (question, answer) => ({
  question,
  answer: `${answer} ${CONCEPTUAL_TAIL}`,
  followUps: [{ ...FU_ONCALL }, { ...FU_TRAP }],
});

export const CONCEPTUAL = [
  c(
    "What does **encapsulation** mean at the **JVM** **heap** level?",
    "**private** **fields** live in the object’s **heap** layout; **getfield** and **putfield** still load and store values at runtime. **Encapsulation** is a **compile-time** access rule enforced by **javac**, not a **memory** fence. **Interviewers** expect you to separate **API** shape from **alias** safety: returning internal **mutable** **collections** breaks invariants even when fields stay **private**. Production **ConcurrentModificationException** during serialization is the classic symptom. Use **javap -c** on accessors to prove **copyOf** exists. **Java 11** through **Java 21** share the same **bytecode** field access model.",
  ),
  c(
    "Why is **final** on a **List** field not enough for **immutability**?",
    "**final** freezes the reference slot after the **constructor** completes; the **List** instance can still **mutate** elements unless you use **List.of**, **List.copyOf**, or an **unmodifiable** view with no external **alias** to the backing list. **HotSpot** still issues **invokeinterface** **add** on the same **object** identity. **Cache** corruption follows when two threads share that **alias**. **javap** shows **final** only on the field entry, not deep immutability. **Java 10** **List.copyOf** is the idiomatic snapshot tool on modern **LTS** lines.",
  ),
  c(
    "What is a **defensive copy** on **ingress**?",
    "On **ingress**, the **constructor** or **factory** copies caller-supplied **arrays** or **collections** so later caller **mutations** do not change internal **state**. **byte[]** passwords and **char[]** buffers especially demand **Arrays.copyOf** to avoid **buffer** **pool** reuse bugs. Skipping **ingress** copies yields silent **DTO** drift under **load**. Verify with a unit test mutating the caller **collection** post-construct. **Java 8** **Arrays.copyOf** predates **List.copyOf** but remains essential for primitives.",
  ),
  c(
    "What is a **defensive copy** on **egress**?",
    "**Egress** copies happen when **getters** return snapshots or **unmodifiable** views instead of internal **references**. Returning **this.lines** directly shares the **ArrayList** backing array with callers. **List.copyOf** allocates a new **immutable** list; **Collections.unmodifiableList(new ArrayList<>(internal))** also works but costs two allocations. Production **Kafka** threads mutating **DTO** lists during **serialization** disappear after **egress** fixes. Proof is **javap -c** showing **invokestatic** **copyOf**.",
  ),
  c(
    "How do **record** components interact with **immutability** (**Java 16**)?",
    "**record** accessors expose components without **setters**, and **equals**/**hashCode**/**toString** are synthesized. **Immutability** is shallow: **mutable** component types still leak unless the compact **constructor** copies them. **Misconfigured** **serialization** frameworks can bypass **constructor** validation if mappers use **reflective** field writes. **Interview angle:** Ask for compact **constructor** bodies that call **List.copyOf**. **Java 21** adds no change to this shallow rule.",
  ),
  c(
    "Why can **mutable** **keys** break **HashMap**?",
    "**HashMap** buckets derive from **hashCode** computed at **put** time; mutating the **key** object changes **hashCode** so **get** probes the wrong bucket while the entry still exists. Symptoms are rising **cache** misses and ghost data. **Diagnostic**: **jmap -dump** plus **MAT** **HashMap** **inspector**. Fix with **immutable** **record** keys or **String** ids. **Java 8** through **Java 21** **HashMap** behaves the same here.",
  ),
  c(
    "Does **encapsulation** imply **thread** safety?",
    "No — **private** fields do not establish **happens-before** relationships across **threads**. **Immutable** snapshots (**final** fields + no **mutable** **escapes**) or **synchronization**/**java.util.concurrent** utilities are required. **Race** symptoms include torn reads of **long** fields or half-published object graphs. Use **jstack** to see **constructor** versus reader **threads**. **Java** **Memory** **Model** rules are independent of **accessor** visibility.",
  ),
  c(
    "What is the difference between **List.copyOf** and **Collections.unmodifiableList**?",
    "**List.copyOf** creates a new **immutable** list snapshot; **Collections.unmodifiableList** wraps an existing list so mutations through other **aliases** still change the **view**. **copyOf** rejects **null** elements and fails fast on **null** list. Choose **copyOf** for **DTO** boundaries; use **unmodifiable** only when you control the sole **alias**. **javap** shows **copyOf** as **invokestatic**. **Java 10** introduced **List.copyOf**.",
  ),
  c(
    "How does **JavaBeans** style conflict with **immutability**?",
    "**JavaBeans** expose **setters** for **frameworks** like **Hibernate**; **immutable** **DTOs** suit **events** and **caches**. Mixing styles in one layer yields **half-mutable** graphs that **serializers** mutate unexpectedly. Mitigate with **immutable** **command** objects at **API** edges and **mutable** **entities** only inside **persistence** packages. **ArchUnit** can ban cross-layer **setters**. **Spring** **records** support improves on **Java 17**+.",
  ),
  c(
    "What does **String** **immutability** buy you for **hashing**?",
    "**String** **hashCode** is cached and **intern** tables rely on immutability; **String** **constants** are safe **HashMap** keys. **StringBuilder** is **mutable** and must never be used as a key. Production bugs appear when **identity** **hashCode** misuse mixes with **mutable** **char** sequences. **javap** on **String** shows **final** **class** and **intern** machinery. **Java 8**+ **String** **concat** optimizations still assume immutability.",
  ),
  c(
    "Why avoid **public** **mutable** **static** **collections**?",
    "Any **class** in the **classpath** can **clear** or **mutate** shared **static** **state**, breaking **invariants** globally. **Symptoms** are flaky **integration** tests and impossible **prod** **only** bugs. Fix with **List.of** snapshots or **private** **static** **final** **immutable** holders. Verify **javap -c** **<clinit>** paths. **JPMS** reduces accidental access but does not fix **mutable** **public** fields inside exported packages.",
  ),
  c(
    "How does **serialization** stress **encapsulation**?",
    "**ObjectInputStream** can reconstruct objects without calling your **constructor**, bypassing **validation** unless you implement **readObject** guards or use **records** with trusted streams. **Encapsulation** does not stop **bytecode** **gadget** chains. **NotSerializableException** and **StreamCorruptedException** appear when graphs violate contracts. Use **jcmd** **JVMTI** agents sparingly; prefer schema-first formats for **DTO** edges. **Java 17** **serialization** filters reduce attack surface.",
  ),
  c(
    "What is **volatile** versus **private** for field publication?",
    "**volatile** establishes **happens-before** for reads and writes of a single field; **private** only limits **compile-time** visibility. **Immutable** **final** fields published through a **final** **reference** from a **constructor** benefit from safe-initialization rules. Misuse shows up as sporadic **null** or zero reads. **jstack** plus code inspection beats guessing. **Java 5+** **JMM** clarifies **volatile** semantics used through **Java 21**.",
  ),
  c(
    "Why use **immutable** **value** objects in **concurrent** **pipelines**?",
    "**Immutable** snapshots eliminate lock **contention** on read-mostly **DTOs** flowing through **Kafka** or **reactive** chains. **Mutating** **DTOs** in flight forces **synchronized** regions that **block** **event** loops. **copyOf** adds allocation cost you measure with **jcmd** **GC.heap_info**. **Java 21** **virtual** **threads** still benefit from immutability to reduce **pinning** risk when **blocking** sneaks in.",
  ),
  c(
    "How does **Lombok** interact with **encapsulation** reviews?",
    "**@Data** generates **getters**/**setters** that may expose **collection** fields directly unless you configure access levels. **Annotation** processors run before you read **source**, so **javap** on **class** files remains authoritative. **Production** incidents trace to **generated** **equals** including **mutable** fields that change mid-**hashCode** use. Add **ArchUnit** rules and **Error** **Prone** checks. **Java 17** **records** reduce **Lombok** surface area for **DTOs**.",
  ),
  c(
    "What is **escape analysis** and does it replace **defensive** **copy**?",
    "**Escape** **analysis** lets **JIT** stack-allocate or eliminate locks when objects do not **escape** **threads**, but it is **optimization**, not a **contract**. **API** **methods** returning **internal** **state** always **escape**. Relying on **EA** for **correctness** is unsafe across **JVM** updates. **jcmd** **Compiler.codecache** dumps are curiosity, not proof. **Java 21** **HotSpot** still treats **documented** **immutability** as the **API** promise.",
  ),
  c(
    "When should you prefer **byte[]** clones for **sensitive** data?",
    "**byte[]** fields should **clone** on **ingress** and **zero** on close to avoid **buffer** **reuse** leaks and **timing** attacks on **crypto** material. **String** **internment** risks keeping secrets longer than needed. **Production** **compliance** reviews ask for explicit **lifecycle** control. Use **Arrays.copyOf** and **Arrays.fill** **zero**. **Java 11** **Arrays.compare** helpers assist **constant**-time comparisons in security code.",
  ),
];

const CODE_BASED_TAIL =
  "Reconfirm with **javap -c** on the compiled **class** so **stdout** claims match **getfield**/**putfield** sequences instead of intuition, cross-check **jcmd** **Compiler.codelist** if the interviewer asks whether **escape** **analysis** elided copies in **hot** **loops**, and mention **jmap -histo:live** when **allocation** rates spike after adding **List.copyOf** everywhere.";

const cb = (question, answer) => ({
  question,
  answer: `${answer} ${CODE_BASED_TAIL}`,
  followUps: [{ ...FU_ONCALL }, { ...FU_TRAP }],
});

export const CODE_BASED = [
  cb(
    "What does this print?\n```java\nimport java.util.*;\nclass Box {\n  private final List<Integer> xs = new ArrayList<>();\n  List<Integer> get() { return xs; }\n}\npublic class T {\n  public static void main(String[] args) {\n    Box b = new Box();\n    b.get().add(1);\n    System.out.println(b.get().size());\n  }\n}\n```",
    "**get** returns the internal **ArrayList** reference, so the caller mutates **Box** state even though **xs** is **private** and **final**. **final** only stops reassigning **xs**, not **mutating** its contents. Stdout prints **1**. **Encapsulation** of the reference failed because the **mutable** object **escaped**.",
  ),
  cb(
    "Does this compile?\n```java\nimport java.util.*;\nfinal class C {\n  private final List<String> items;\n  C(List<String> items) { this.items = items; }\n}\n```",
    "It compiles but is **unsafe**: the **constructor** aliases the caller’s **List** without **List.copyOf**, so external **mutation** changes **internal** **state**. **javac** does not warn. **Immutable** **DTOs** must **copy** on **ingress**.",
  ),
  cb(
    "What does this print?\n```java\nimport java.util.*;\npublic class T {\n  public static void main(String[] args) {\n    List<String> a = new ArrayList<>();\n    a.add(\"x\");\n    List<String> u = Collections.unmodifiableList(a);\n    a.add(\"y\");\n    System.out.println(u.size());\n  }\n}\n```",
    "**unmodifiableList** is a view over **a**; adding **y** through **a** changes the backing list, so **u.size()** prints **2**. This demonstrates **unmodifiable** is not a **snapshot** when other **aliases** exist.",
  ),
  cb(
    "What does this print?\n```java\nimport java.util.*;\npublic class T {\n  public static void main(String[] args) {\n    List<String> snap = List.copyOf(List.of(\"a\"));\n    System.out.println(snap.getClass().getSimpleName());\n  }\n}\n```",
    "**List.copyOf** returns an **unmodifiable** **List** implementation (often named like **ImmutableCollections$ListN** or similar); **getSimpleName** prints the concrete **JDK** **class** name such as **ListN** in modern **JDKs**. The teaching point is **copyOf** produces **immutable** snapshots, not **ArrayList**.",
  ),
  cb(
    "Does this throw?\n```java\nimport java.util.*;\npublic class T {\n  public static void main(String[] args) {\n    List<String> in = new ArrayList<>();\n    in.add(null);\n    List.copyOf(in);\n  }\n}\n```",
    "Yes — **List.copyOf** rejects **null** elements and throws **NullPointerException**. This is an intentional **fail-fast** guard for **immutable** snapshots.",
  ),
  cb(
    "What does this print?\n```java\npublic class T {\n  static class K {\n    int v;\n    K(int v) { this.v = v; }\n    public int hashCode() { return v; }\n    public boolean equals(Object o) { return o instanceof K k && k.v == v; }\n  }\n  public static void main(String[] args) {\n    java.util.HashMap<K,String> m = new java.util.HashMap<>();\n    K k = new K(1);\n    m.put(k, \"a\");\n    k.v = 2;\n    System.out.println(m.get(k));\n  }\n}\n```",
    "Mutating **k.v** after **put** changes **hashCode** so **get** probes the wrong bucket; stdout prints **null** even though the entry still exists somewhere in the table. This is the **mutable** **key** trap.",
  ),
  cb(
    "Does this compile?\n```java\npublic class T {\n  String name;\n  public String getName() { return name; }\n}\n```",
    "It compiles: **package-private** **field** **name** is visible to other **types** in the same **package**, so **encapsulation** is weaker than **private** **fields** even though a **getter** exists. **Collaborators** in the package can assign **name** directly. **ArchUnit** should fail this pattern in **service** modules.",
  ),
  cb(
    "What does this print?\n```java\npublic class T {\n  public static final class R {\n    private final int x;\n    public R(int x) { this.x = x; }\n    public int x() { return x; }\n  }\n  public static void main(String[] args) {\n    R r = new R(1);\n    System.out.println(r.x());\n  }\n}\n```",
    "**R** is **immutable** regarding **x**: **final** **primitive** field with no **setter**. **x()** returns a **primitive** **value**, so stdout prints **1** and callers cannot mutate **x** through the **API**. This models safe **value** **object** **encapsulation** without **collection** **aliases**.",
  ),
];

const seniors = [
  {
    question:
      "Your **Spring Boot** **billing** **canary** throws **ConcurrentModificationException** inside **Jackson** while serializing **InvoiceDto**; totals differ between pods even though **SQL** reconciles.",
    answer:
      "**Immediate response:** Capture **jcmd** **<pid>** **Thread.print** from a failing pod and **javap -c** **InvoiceDto.class** in the same **artifact** to see whether **getLines** returns the internal **ArrayList** without **List.copyOf**.\n\n" +
      "**Root cause:** Two **threads** alias the same **List**: one **iterator** walks during **serialization** while another **Kafka** consumer **mutates** lines, structurally modifying the backing list during iteration.\n\n" +
      "**Fix:** Return **List.copyOf(lines)** (or **unmodifiable** snapshot) from **getters**, add concurrent tests that **mutate** caller copies, redeploy, and attach **javap** diff to the **PR**.\n\n" +
      "**Prevention:** **ArchUnit** rule banning raw **collection** **returns** from **DTOs**, **Error** **Prone** **Immutable** checks, and **CI** **javap** snippets on **serialization** hot types.",
  },
  {
    question:
      "**Redis** **cache** miss rate doubles after a **refactor** switches **keys** from **String** to **mutable** **AccountKey** with **setLastSeen** called post-**put**.",
    answer:
      "**Immediate response:** Take **jmap -dump:live** from the **cache** service, open **MAT**, inspect **HashMap** buckets for **AccountKey** entries whose **hashCode** no longer matches bucket index.\n\n" +
      "**Root cause:** **hashCode** changed after **mutation** post-**put**, stranding entries while **get** probes empty buckets—classic **mutable** **key** corruption.\n\n" +
      "**Fix:** Replace with **record AccountKey(String id, Instant seen)** or **String** composite keys, reindex **cache**, and add tests forbidding **setter** calls after **map** insertion.\n\n" +
      "**Prevention:** **Code review** checklist item: **Map** keys must be **immutable**; static analysis bans **setters** on key types; **metrics** alert on miss-rate spikes after **DTO** changes.",
  },
  {
    question:
      "A **Java 16** **record OrderEvent(List<Tag> tags)** shows reordered **tags** in **audit** logs even though the **event** is supposed to be **immutable**.",
    answer:
      "**Immediate response:** Run **javap -c OrderEvent.class** verifying whether the **canonical** **constructor** calls **List.copyOf**; reproduce locally by **sort**ing the caller’s **ArrayList** after **construction**.\n\n" +
      "**Root cause:** **Shallow** **record** **immutability**: storing the caller’s **mutable** **list** **alias** lets external **sort** mutate **order** without invoking **setters**.\n\n" +
      "**Fix:** Use **this.tags = List.copyOf(tags)** in a compact **constructor**, make **Tag** itself **immutable**, and add regression tests mutating caller lists post-create.\n\n" +
      "**Prevention:** **Style guide** mandating **copyOf** for **record** **List** components; **PR** template checkbox; **spotless**/**checkstyle** cannot catch this—**javap** review does.",
  },
  {
    question:
      "**Micrometer** **gauge** sometimes reads **0** for **AccountBalance** while **transactions** show funds; stack shows **racy** reads during **object** **construction**.",
    answer:
      "**Immediate response:** Pull **jstack** samples during **deploy** waves and identify **threads** reading **balance** fields while another **thread** still runs the **constructor**.\n\n" +
      "**Root cause:** **Encapsulation** without **safe** **publication**: non-**final** fields or leaking **this** from **constructor** lets other **threads** observe partially initialized **state**.\n\n" +
      "**Fix:** Make fields **final**, avoid leaking **this**, use **static** **factory** methods that publish only after **construction** completes, or **synchronize** publication paths.\n\n" +
      "**Prevention:** **Concurrency** **training** for **DTO** authors; **static** analysis for **this** **escape**; **load** tests that hammer **metrics** during **rolling** **restart**.",
  },
  {
    question:
      "A **library** upgrade regenerates **Lombok** **@Data** **entities**; **HashSet** dedupe fails in **batch** jobs after **IDs** start **mutating** mid-**pipeline**.",
    answer:
      "**Immediate response:** Diff **javap -p** **Entity.class** before and after upgrade focusing on **equals**/**hashCode** and **setter** generation; capture **jmap** histogram of **HashSet** nodes.\n\n" +
      "**Root cause:** **equals**/**hashCode** now include **mutable** **fields** that **batch** processors tweak after **insert** into **sets**, breaking **Set** invariants.\n\n" +
      "**Fix:** Restrict **equals**/**hashCode** to stable **identifiers**, move **mutable** **attributes** out of **equality**, or switch to **immutable** **snapshots** for **dedupe** keys.\n\n" +
      "**Prevention:** **ArchUnit** tests locking **equals** contracts; **codegen** review; **integration** tests asserting **Set** stability across **mutation** steps.",
  },
  {
    question:
      "**CPU** spikes after you **defensive**-**copy** every **List** in **hot** **RPC** paths; **GC** pause times climb though **correctness** improved.",
    answer:
      "**Immediate response:** Run **jcmd** **<pid>** **GC.heap_info** and a short **Flight** **Recording** focusing on **allocation** rates in **copyOf** heavy methods.\n\n" +
      "**Root cause:** **Immutability** traded **CPU**/**GC** for safety: per-request **List.copyOf** on large lists allocates new backing arrays under **load**.\n\n" +
      "**Fix:** Narrow copies to **trust** boundaries, reuse **immutable** **views** where **aliases** are controlled, or switch internal representation to **persistent** **vector** structures after profiling.\n\n" +
      "**Prevention:** **Performance** **SLA** tests on **DTO** layers; **JMH** microbenchmarks for **copyOf**; document **trust** levels so copies happen once per **batch**, not per **getter** call.",
  },
];

export const SENIOR_SCENARIO = seniors.map((s) => ({
  ...s,
  answer: s.answer + SENIOR_EXT,
  followUps: [{ ...FU_ONCALL }, { ...FU_TRAP }],
}));
