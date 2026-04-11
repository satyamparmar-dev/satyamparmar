/** Day 12 staff content: Encapsulation and Immutability (phase2-day12.json). */

export const WHY_CONTENT = [
  "At 03:18 the **Spring Boot** ledger microservice serving EU settlement batches begins emitting impossible running totals even though **JUnit** suites still pass on laptops. The artifact is a **DTO** whose **getter** returned the internal **ArrayList** of **LineItem** rows without copying. A downstream **Kafka** consumer cleared that list between **pagination** steps while another thread still iterated the same backing array, surfacing **ConcurrentModificationException** in one pod and silent double-counting in another. The symptom is inconsistent **BigDecimal** sums across **canary** shards, not a single obvious **SQLException**. The failure looks like flaky business rules but is really broken **encapsulation** of mutable **collection** state shared across threads.",
  "Interviewers who ask about **encapsulation** and **immutability** are not checking whether you memorized **private** fields and **getters**. They want evidence that you know how **getfield** and **putfield** expose object state through the **heap**, how **final** fields freeze references at **constructor** end, and how **defensive copies** stop callers from mutating your invariants behind your back. The mental model gap that separates a weak answer from a strong one is **API** shape versus **alias** control: strong candidates narrate **escape** of references and tie incidents to **bytecode** field access and **happens-before** edges, not UML boxes alone.",
  "Use this four-step pattern in every answer. First, name the mutable **component**: **List**, **Map**, **Date**, **byte[]**, or **mutable** **DTO** graph. Second, trace **escape**: **getter** returns internal reference, **constructor** stores caller's array without **copyOf**, or **record** exposes **mutable** field directly. Third, pick the failure: **ConcurrentModificationException**, corrupted **HashMap** keys after **setter** mutates a key object, or **race** on non-volatile reads. Fourth, verify with **javap -c** on accessors, **jcmd** **Thread.print** for concurrent stacks, or **jmap -dump:live** plus **MAT** duplicate **equals** buckets, and attach that evidence to the ticket. You rehearse those four moves in every **architecture** review so **DTO** graphs stop surprising **on-call**.",
  "At scale, ten engineers and fifty **REST** adapters multiply any leaky **getter**. One team exposes **List** **tags** from a **session** **bean**; another thread adds tags while **Jackson** serializes, producing **ConcurrentModificationException** that masquerades as serialization bugs. Another failure mode is mutating a **CustomerId** value object used as a **HashMap** key after insert, breaking **equals**/**hashCode** invariants until lookups return **null** for existing entries - the metric is rising **cache** miss rates, not a thrown **NullPointerException** at the mutation site. Both look like application defects but are **platform-level** mistakes in how **references** cross **thread** and **collection** boundaries. You only spot them when you treat **DTO** **graphs** like **concurrency** programs, not POJO sketches.",
  "A senior candidate states **Java 10** added **List.copyOf** and related factory copies so immutable snapshots from **Stream** pipelines no longer require manual **Collections.unmodifiableList(new ArrayList<>(...))** boilerplate; a mid-level answer stops at **final** on the field and forgets the **List** inside remains **mutable** unless copied or wrapped. Another senior signal is **Java 16** **records**: canonical **constructors** let you validate and normalize while still generating compact **equals**/**hashCode**, but **record** components that hold **mutable** types still leak unless you **defensive**-copy in the compact **constructor**.",
  "In your first six months on a new job this topic shows up weekly. A reviewer flags a **PR** that returns **this.lines** from a **getter**; you require **List.copyOf** or an **unmodifiable** view, add a unit test that mutates the caller copy, and paste **javap -c** showing no raw **aaload** escapes. During **on-call**, **Redis** **caching** misses spike because someone **mutated** a **DTO** after using it as a **key**; you freeze **keys** as **records** with **immutable** components and document **defensive** copies in the **runbook**. When onboarding a **legacy** **JavaBeans** module, you find **Date** fields shared across threads; you migrate hot paths to **Instant** or wrap **defensive** copies at boundaries and verify with **jstack** under load that **mutator** **contention** drops.",
].join("\n\n");

export const THEORY_CONTENT = `### Plain-language overview

**Encapsulation** hides object **fields** behind methods so invariants stay enforceable: balances stay non-negative, **IDs** stay normalized, **collections** stay consistent. **Immutability** means after **construction** an object’s observable state does not change—usually **final** reference fields pointing at **immutable** values or **defensive** copies of **mutable** inputs. The **JVM** still stores everything on the **heap**; **private** only blocks **compile-time** access from other classes, not **reflection** or **bytecode** tricks. **Interview angle:** Weak answers stop at **private**; strong answers discuss **alias** control and **thread** hazards.

### **getfield**, **putfield**, and **ACC_PRIVATE**

Instance field reads compile to **getfield** and writes to **putfield** with **ConstantPool** references to the field’s name and descriptor. **private** fields are accessible only inside the declaring **class** file; **javac** enforces that boundary, while **HotSpot** still performs ordinary **heap** loads and stores at runtime. **Interview angle:** Ask candidates to open **javap -c** on a **getter** and point to **getfield** before **areturn**.

### **Encapsulation** as invariant enforcement

**Mutators** (**setters** or command methods) centralize validation so illegal transitions throw **IllegalArgumentException** or **IllegalStateException** instead of corrupting **state** silently. **Package-private** or **protected** fields trade safety for test convenience—production code still prefers **private** fields with intentional **API** methods. **Interview angle:** Tie **encapsulation** reviews to **invariant** lists documented next to the **class**.

### **final** fields and definite assignment

**final** instance fields must be assigned exactly once by **constructor** end; **javac** checks definite assignment. The reference is frozen, but the object it points to may still be **mutable** (**StringBuilder**, **ArrayList**). **Interview angle:** Contrast **final** reference with deep **immutability**.

### **Defensive copy** on **ingress** and **egress**

On **ingress**, copy caller-supplied **arrays**/**collections** so later caller mutations do not mutate your **internal** state. On **egress**, return **copyOf**, **unmodifiable** views, or new **instances** so clients cannot reach your backing **collection**. Skipping either side causes **alias** bugs that **JUnit** misses when tests reuse the same reference politely. **Interview angle:** Mention **Arrays.copyOf** and **List.copyOf** as default tools since **Java 10**.

### **Immutable** object recipe

Make the **class** **final** (or **sealed**), all fields **private final**, no **setters**, **defensive** copies for **mutable** components, and **factory** methods that validate. Operations return new **instances** instead of mutating (**BigDecimal**-style). **Interview angle:** Link to **String**’s **intern** behaviour and **hashCode** stability for **HashMap** keys.

### **Record** carriers (**Java 16**) and shallow **immutability**

**record** components generate accessors without **set**; the **canonical** **constructor** can validate and **assign** normalized values. If a component type is **mutable**, **record** **immutability** is shallow unless you copy in the compact **constructor**. **Interview angle:** Ask how **Jackson** or **MapStruct** might bypass **constructor** if misconfigured.

### **JavaBeans** versus **immutable** **DTOs**

**JavaBeans** expect **setters** for frameworks (**Hibernate**, older **Spring** XML); **immutable** **DTOs** suit **events**, **caches**, and **functional** services. Mixing styles without discipline yields half-**mutable** graphs that confuse **serializers**. **Interview angle:** Position **record** as the **Java 21** default for transparent data when **ORM** constraints allow.

### Production comparison table

| Pattern | Invariant control | Risk |
|---------|-------------------|------|
| **private** field + **getter** only | Read-only **API** | Caller may still mutate returned **mutable** object |
| **Defensive copy** **ingress/egress** | Strong **alias** control | Allocation cost in hot loops |
| **List.copyOf** snapshot | **Immutable** list view | Fails on **null** elements; document clearly |

**Interview angle:** Use this table when reviewing **DTO** **PRs** under load.

### Step-by-step: proving a **reference** leak

Step 1: Identify the **getter** returning **collection** or **array**. Step 2: Run **javap -c ClassName.class** and confirm **areturn** passes **getfield** reference without **copyOf**. Step 3: Write a test mutating caller-held reference and assert internal **state** changed. Step 4: Fix with **List.copyOf** or **Collections.unmodifiableList** plus **new ArrayList** snapshot. Step 5: Re-run **javap** to prove the **invokestatic** **copyOf** appears on return paths. **Interview angle:** Staff proof is **javap** plus a failing test, not opinion.

### **HashMap** keys and **mutability**

**HashMap** buckets depend on **hashCode**; mutating a key object after **put** corrupts the table so **get** misses or **iterators** misbehave. **Interview angle:** Name **ConcurrentModificationException** on **keySet** iteration plus external **mutation** as the classic interview trap.

### **Memory** visibility: **encapsulation** is not **volatile**

**private** does not imply **visibility** across **threads**; **synchronized**, **volatile**, **java.util.concurrent** utilities, or **immutable** snapshots establish **happens-before**. **Interview angle:** Contrast **encapsulation** with **JMM** guarantees expected in **on-call** triage.

### **Thread**-safety snapshot table

| Approach | Mechanism | Symptom if wrong |
|----------|-----------|------------------|
| **Immutable** snapshot | **final** fields + **copyOf** | Still **unsafe** if **mutable** leaks |
| **Synchronized** **mutator** | Monitor **happens-before** | **Deadlock** if ordering sloppy |
| **ConcurrentHashMap** | Segmented **CAS** | **Composite** **DTO** still races if **mutable** |

**Interview angle:** Map **ConcurrentModificationException** stacks to **collection** **mutation** during iteration using **jstack**.

### Static analysis guardrails table

| Tooling | What it catches | Limit |
|---------|-----------------|-------|
| **ArchUnit** | **Public** fields, **Date** imports | Needs curated rules per module |
| **Error Prone** **Immutable** | Suspicious **getter** returns | False positives on ORM entities |
| **javap** review | Missing **copyOf** in bytecode | Manual but definitive |

**Interview angle:** Pair static rules with **javap** spot checks before declaring a type immutable.

### Illustrative **immutable** **List** snapshot

\`\`\`java
public final class OrderView {
    private final List<String> skus;

    public OrderView(List<String> skus) {
        this.skus = List.copyOf(skus);
    }

    public List<String> skus() {
        return skus;
    }
}
\`\`\`

**Interview angle:** Ask what breaks if **List.copyOf** is replaced with direct assignment.

### Sixty-second interview story

You define **encapsulation** as **invariant** control through **private** **heap** **fields** and curated methods, and **immutability** as frozen **references** plus non-escaping **mutable** guts. You warn that **final** on a **List** field does not freeze elements unless you **copyOf** or wrap. You cite **ConcurrentModificationException** and **HashMap** key corruption as production signatures of broken **encapsulation**. You verify with **javap -c**, **jcmd** **Thread.print** under contention, and **jmap** when **cache** metrics lie. **Interview angle:** Story must mention at least one **bytecode** opcode and one diagnostic command.

### Satyverse drill — tie-down

For every **DTO** in your service, list **mutable** components, trace every **getter** return path, and rebuild with **copyOf** until **javap** shows no raw **getfield** **areturn** of **mutable** **collections**. Pair with a concurrent stress test that mutates caller copies for five minutes while **jstack** stays clean. **Interview angle:** Drill ends when tests and **javap** agree, not when the **PR** description sounds confident.
`;

export const BASIC_CODE = `package arch.day12;

/**
 * Day 12 basic: println-only encapsulation and immutability reference card.
 */
public class Day12Basic {

    public static void main(String[] args) {
        // Core concept: how fields live on the heap and what private actually buys.
        System.out.println("=== Encapsulation - heap fields and access ===");
        System.out.println("private field   | javac blocks external compile-time access | heap slot still mutated via reflection");
        System.out.println("getter/setter   | centralize validation + invariants          | useless if returned mutable object aliases");
        System.out.println("package-private | wider visibility for tests                   | breaks module boundaries under JPMS");
        System.out.println("final field     | assign-once after ctor definite assignment   | does not deep-freeze mutable referent");
        System.out.println();

        // Commands that prove accessor behaviour and contention.
        System.out.println("=== Command reference - attach to Jira ===");
        System.out.println("javap -c LedgerDto.class       -> see getfield/areturn without copyOf on collections");
        System.out.println("jcmd <pid> Thread.print        -> show concurrent Iterator.remove vs mutator stacks");
        System.out.println("jmap -dump:live,format=b,file=heap.bin <pid>  -> MAT hunt duplicate cache keys");
        System.out.println("jstack <pid>                   -> sample ConcurrentModificationException frames");
        System.out.println("javac -Xlint:unchecked         -> surface raw collection escapes in legacy beans");
        System.out.println();

        // Failure signatures tied to broken invariants.
        System.out.println("=== Failure modes - invariants and aliases ===");
        System.out.println("ConcurrentModificationException | structurally modified list during iteration");
        System.out.println("IllegalStateException           | iterator remove after illegal sequence");
        System.out.println("Cache miss storm                | mutable key changed after HashMap put");
        System.out.println("Silent double count             | shared mutable list mutated between threads");
        System.out.println("Data race metrics               | non-volatile reads of partially published fields");
        System.out.println();

        // Build and runtime posture.
        System.out.println("=== Environment / configuration cues ===");
        System.out.println("Prefer List.copyOf / Map.copyOf snapshots at DTO boundaries on Java 10+");
        System.out.println("Ban public mutable fields in style guide except generated protobuf internals");
        System.out.println("Enable Error Prone ImmutableChecker or ArchUnit rules in CI");
        System.out.println("Document thread-safety policy per package - encapsulation is not enough");
        System.out.println("Spot-check record compact constructors for List.copyOf on mutable components");
        System.out.println();

        System.out.println("=== Review cue ===");
        System.out.println("staff cue: every getter returning collection must show copyOf in javap");
        System.out.println("staff cue: freeze cache keys as records with immutable components");
        System.out.println("staff cue: run jdeps on modules after removing public fields");
        System.out.println("done");
    }
}
`;

export const BASIC_OUTPUT = `=== Encapsulation - heap fields and access ===
private field   | javac blocks external compile-time access | heap slot still mutated via reflection
getter/setter   | centralize validation + invariants          | useless if returned mutable object aliases
package-private | wider visibility for tests                   | breaks module boundaries under JPMS
final field     | assign-once after ctor definite assignment   | does not deep-freeze mutable referent

=== Command reference - attach to Jira ===
javap -c LedgerDto.class       -> see getfield/areturn without copyOf on collections
jcmd <pid> Thread.print        -> show concurrent Iterator.remove vs mutator stacks
jmap -dump:live,format=b,file=heap.bin <pid>  -> MAT hunt duplicate cache keys
jstack <pid>                   -> sample ConcurrentModificationException frames
javac -Xlint:unchecked         -> surface raw collection escapes in legacy beans

=== Failure modes - invariants and aliases ===
ConcurrentModificationException | structurally modified list during iteration
IllegalStateException           | iterator remove after illegal sequence
Cache miss storm                | mutable key changed after HashMap put
Silent double count             | shared mutable list mutated between threads
Data race metrics               | non-volatile reads of partially published fields

=== Environment / configuration cues ===
Prefer List.copyOf / Map.copyOf snapshots at DTO boundaries on Java 10+
Ban public mutable fields in style guide except generated protobuf internals
Enable Error Prone ImmutableChecker or ArchUnit rules in CI
Document thread-safety policy per package - encapsulation is not enough
Spot-check record compact constructors for List.copyOf on mutable components

=== Review cue ===
staff cue: every getter returning collection must show copyOf in javap
staff cue: freeze cache keys as records with immutable components
staff cue: run jdeps on modules after removing public fields
done
`;

export const INTERMEDIATE_CODE = `package arch.day12;

/**
 * Day 12 intermediate: four encapsulation / immutability incidents (println only).
 */
public class Day12Intermediate {

    /*
     * Context: finance DTO returns internal ArrayList; Kafka thread clears during pagination.
     */
    static void scenario1() {
        System.out.println("--- Scenario 1: leaked List getter concurrent corruption ---");
        System.out.println("symptom: ConcurrentModificationException during Jackson serialization");
        System.out.println("cause:    getter returned this.lines without copy or unmodifiable wrap");
        System.out.println("why:      two threads share same backing array via alias");
        System.out.println("fix:      return List.copyOf(lines) or unmodifiable snapshot");
        System.out.println("verify:   javap -c InvoiceDto.class and search for copyOf before areturn");
        System.out.println("staff:    add concurrent stress test mutating caller-held list");
        System.out.println("note:    unit tests pass when single-threaded reuse hides alias");
        System.out.println();
    }

    /*
     * Context: legacy Date field mutated after cache insert breaks HashMap lookup.
     */
    static void scenario2() {
        System.out.println("--- Scenario 2: mutable Date key poisons settlement cache ---");
        System.out.println("symptom: cache miss rate climbs; settlements re-fetch constantly");
        System.out.println("cause:    SettlementKey used java.util.Date mutated after HashMap put");
        System.out.println("fix:      replace with Instant or immutable record key");
        System.out.println("verify:   jmap -dump then MAT HashMap histogram + key equals audit");
        System.out.println("staff:    ban Date in new code via ArchUnit import ban");
        System.out.println("echo:     reproduce with tiny main mutating key field post-put");
        System.out.println("note:    hashCode drift strands entries in wrong buckets silently");
        System.out.println();
    }

    /*
     * Context: record exposes MutableTag list; caller sorts in place breaking invariants.
     */
    static void scenario3() {
        System.out.println("--- Scenario 3: shallow record immutability broken ---");
        System.out.println("symptom: tag order flips in audit log without setter calls");
        System.out.println("cause:    record OrderEvent(List<MutableTag> tags) stored caller list ref");
        System.out.println("fix:      List.copyOf in compact constructor or wrap immutable tags");
        System.out.println("verify:   javap -c OrderEvent.class for invokespecial copyOf");
        System.out.println("staff:    code review checklist: record components must be immutable");
        System.out.println("metric:   audit diff noise correlates with caller-side sort()");
        System.out.println("note:    record accessors still return same list reference");
        System.out.println();
    }

    static void scenario4() {
        System.out.println("--- Scenario 4: racy read of partially constructed bean ---");
        System.out.println("symptom: sporadic zero balance in metrics exporter");
        System.out.println("cause:    another thread reads fields before ctor finishes publishing");
        System.out.println("fix:      final fields + safe publication or synchronized factory");
        System.out.println("verify:   jstack captures racing ctor vs reader frames");
        System.out.println("staff:    document @Immutable on types actually safe for cross-thread");
        System.out.println("context: encapsulation without JMM edge still allows torn reads");
        System.out.println("note:    use volatile holder or var handles only when measured");
        System.out.println("echo:    jcmd VM.flags confirms if experimental publication helpers enabled");
        System.out.println();
    }

    static void printBanner() {
        System.out.println("banner: Day12 intermediate encapsulation + immutability lab");
    }

    public static void main(String[] args) {
        printBanner();
        scenario1();
        scenario2();
        scenario3();
        scenario4();
    }
}
`;

export const INTERMEDIATE_OUTPUT = `banner: Day12 intermediate encapsulation + immutability lab
--- Scenario 1: leaked List getter concurrent corruption ---
symptom: ConcurrentModificationException during Jackson serialization
cause:    getter returned this.lines without copy or unmodifiable wrap
why:      two threads share same backing array via alias
fix:      return List.copyOf(lines) or unmodifiable snapshot
verify:   javap -c InvoiceDto.class and search for copyOf before areturn
staff:    add concurrent stress test mutating caller-held list
note:    unit tests pass when single-threaded reuse hides alias

--- Scenario 2: mutable Date key poisons settlement cache ---
symptom: cache miss rate climbs; settlements re-fetch constantly
cause:    SettlementKey used java.util.Date mutated after HashMap put
fix:      replace with Instant or immutable record key
verify:   jmap -dump then MAT HashMap histogram + key equals audit
staff:    ban Date in new code via ArchUnit import ban
echo:     reproduce with tiny main mutating key field post-put
note:    hashCode drift strands entries in wrong buckets silently

--- Scenario 3: shallow record immutability broken ---
symptom: tag order flips in audit log without setter calls
cause:    record OrderEvent(List<MutableTag> tags) stored caller list ref
fix:      List.copyOf in compact constructor or wrap immutable tags
verify:   javap -c OrderEvent.class for invokespecial copyOf
staff:    code review checklist: record components must be immutable
metric:   audit diff noise correlates with caller-side sort()
note:    record accessors still return same list reference

--- Scenario 4: racy read of partially constructed bean ---
symptom: sporadic zero balance in metrics exporter
cause:    another thread reads fields before ctor finishes publishing
fix:      final fields + safe publication or synchronized factory
verify:   jstack captures racing ctor vs reader frames
staff:    document @Immutable on types actually safe for cross-thread
context: encapsulation without JMM edge still allows torn reads
note:    use volatile holder or var handles only when measured
echo:    jcmd VM.flags confirms if experimental publication helpers enabled

`;

export const ADVANCED_CODE = `package arch.day12;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Day 12 advanced: alias risk scoring + immutability checklist + publication matrix.
 */
public class Day12Advanced {

    record RiskRule(String pattern, int score) {}

    static List<RiskRule> rules() {
        List<RiskRule> list = new ArrayList<>();
        list.add(new RiskRule("getter returns internal ArrayList", 5));
        list.add(new RiskRule("ctor stores caller array without copy", 4));
        list.add(new RiskRule("record wraps mutable Date", 3));
        list.add(new RiskRule("public non-final fields on DTO", 2));
        return list;
    }

    static Map<String, Boolean> immutabilityGate() {
        Map<String, Boolean> m = new LinkedHashMap<>();
        m.put("all fields private final", true);
        m.put("no setters on value type", true);
        m.put("collections use copyOf on ingress", false);
        m.put("cache keys are records or primitives", true);
        return m;
    }

    public static void main(String[] args) {
        System.out.println("banner: Day12 advanced encapsulation guardrails");
        System.out.println();
        System.out.println();

        System.out.println("=== Block 1: alias risk scoreboard ===");
        int total = 0;
        for (RiskRule r : rules()) {
            total += r.score();
            System.out.println(r.pattern() + " | score=" + r.score());
        }
        System.out.println("total risk = " + total);
        System.out.println();

        System.out.println("=== Block 2: immutability checklist ===");
        Map<String, Boolean> gate = immutabilityGate();
        int pass = 0;
        for (Map.Entry<String, Boolean> e : gate.entrySet()) {
            if (Boolean.TRUE.equals(e.getValue())) {
                pass++;
            }
            System.out.println(e.getKey() + " | " + e.getValue());
        }
        System.out.println("pass count = " + pass + " / " + gate.size());
        System.out.println();

        System.out.println("=== Block 3: publication posture matrix ===");
        Map<String, String> pub = new LinkedHashMap<>();
        pub.put("immutable snapshot", "safe handoff across threads without extra locks");
        pub.put("mutable bean", "requires explicit synchronization or confinement");
        pub.put("leaked collection", "ConcurrentModificationException or silent corruption");
        for (Map.Entry<String, String> e : pub.entrySet()) {
            System.out.println(e.getKey() + " -> " + e.getValue());
        }
        System.out.println("eof");
    }
}
`;

export const ADVANCED_OUTPUT = `banner: Day12 advanced encapsulation guardrails


=== Block 1: alias risk scoreboard ===
getter returns internal ArrayList | score=5
ctor stores caller array without copy | score=4
record wraps mutable Date | score=3
public non-final fields on DTO | score=2
total risk = 14

=== Block 2: immutability checklist ===
all fields private final | true
no setters on value type | true
collections use copyOf on ingress | false
cache keys are records or primitives | true
pass count = 3 / 4

=== Block 3: publication posture matrix ===
immutable snapshot -> safe handoff across threads without extra locks
mutable bean -> requires explicit synchronization or confinement
leaked collection -> ConcurrentModificationException or silent corruption
eof
`;

export const PITFALLS = [
  "Exposing **internal** **ArrayList** through a **getter** without **List.copyOf** or **unmodifiable** wrapping - production symptom is **ConcurrentModificationException** during **JSON** serialization while another thread mutates the same list; fix by returning **List.copyOf** snapshots or **Collections.unmodifiableList** backed by a **new** **ArrayList**; verify with **javap -c** **Dto.class** showing **invokestatic** **copyOf** before **areturn**.",
  "Storing caller-supplied **byte[]** or **char[]** directly in a **credential** holder without cloning - symptom is silent credential mutation after **network** buffer reuse; fix by **Arrays.copyOf** in **constructor**; verify with a unit test mutating the original array post-construct and asserting holder value unchanged.",
  "Using **mutable** **java.util.Date** fields inside **equals**/**hashCode** **beans** that serve as **HashMap** keys - symptom is **cache** misses and ghost entries after **setTime**; fix by migrating to **Instant** or **immutable** **record** keys; verify with **jmap -dump** and **MAT** **HashMap** **inspector**.",
  "Declaring **record** **components** as **List** of **mutable** **tags** without **List.copyOf** in the compact **constructor** - audit trails reorder when callers **sort** in place; fix with **List.copyOf** plus **immutable** element types; verify **javap -c** on **record** initializer for **copyOf**.",
  "Relying on **encapsulation** alone for **thread** safety while publishing **mutable** **DTOs** across **threads** without **synchronization** - symptom is torn reads of **long**/**double** or half-built graphs; fix with **final** fields, safe publication, or **concurrent** structures; verify with **jstack** under load plus **jcmd** **Thread.print**.",
  "Returning **this** from **fluent** **setters** on **entities** shared in **Hibernate** **session** - symptom is **shared** **mutations** surprising **transaction** boundaries; fix by **immutable** **command** objects for **API** layers; verify with integration tests and **javap** on service facades.",
  "Using **public** **static** **mutable** **collections** for **constants** - any module can **clear** the list; fix by **List.of** or **unmodifiable** wrappers; verify **javap -c** on holder **clinit** shows **immutable** factories.",
  "Letting **Lombok** **@Data** on **domain** **entities** expose **collection** getters that alias **internal** state - fix with **@Getter(AccessLevel.NONE)** on sensitive fields plus explicit snapshot methods; verify **javap** after **annotation** processing in CI.",
];

export const EXERCISE_PROBLEM = [
  "You join the **risk** platform squad that ships **immutable** **PositionSnapshot** **DTOs** to **Kafka**; reviewers require **List.copyOf** boundaries and **javap** evidence before **canary** cutover.",
  "",
  "Requirements:",
  "1. Implement **arch.day12.Day12Exercise** with **public static void main(String[] args)** printing a three-line legend labelled **encapsulate:**, **immutable:**, and **alias:** - each under 120 chars - explaining **private** **invariants**, **final** **snapshot** objects, and **copyOf** **escape** control.",
  "2. Declare **final class PositionSnapshot** with **private final String symbol**, **private final long qty**, **private final List<String> deskTags**; **constructor** takes **List<String> deskTags** and assigns **this.deskTags = List.copyOf(deskTags)**.",
  "3. Add **List<String> tags()** returning the internal list (already unmodifiable via **List.copyOf**).",
  "4. In **main**, build **List<String> raw = new ArrayList<>()**, add **EU**, pass to **PositionSnapshot**, print **tags()**, then **raw.add(\"US\")**, print **tags().size()** to show **alias** did not mutate snapshot.",
  "5. End with **done** on its own line.",
].join("\n");

export const EXERCISE_HINTS = [
  "Use **ArrayList** for **raw** so you can mutate after constructing the **snapshot** to prove **immutability**.",
  "**List.copyOf** throws on **null** elements - keep tags non-null for this exercise.",
  "Import **java.util** types explicitly so reviewers see the **mutable** versus **immutable** split.",
];

export const EXERCISE_SOLUTION = `package arch.day12;

import java.util.ArrayList;
import java.util.List;

/**
 * Day 12 exercise: PositionSnapshot with List.copyOf boundary.
 */
public class Day12Exercise {

    static final class PositionSnapshot {
        private final String symbol;
        private final long qty;
        private final List<String> deskTags;

        PositionSnapshot(String symbol, long qty, List<String> deskTags) {
            this.symbol = symbol;
            this.qty = qty;
            this.deskTags = List.copyOf(deskTags);
        }

        List<String> tags() {
            return deskTags;
        }
    }

    public static void main(String[] args) {
        final String e =
                "encapsulate: private fields plus ctor validation keep invariants inside the object boundary.";
        final String i = "immutable: final references and copyOf snapshots stop post-construct surprise mutations.";
        final String a = "alias: returning internal mutable collections without copyOf shares heap arrays with callers.";
        System.out.println(e);
        System.out.println(i);
        System.out.println(a);
        List<String> raw = new ArrayList<>();
        raw.add("EU");
        PositionSnapshot snap = new PositionSnapshot("FX", 10L, raw);
        System.out.println("tags=" + snap.tags());
        raw.add("US");
        int afterMutate = snap.tags().size();
        System.out.println("size_after_caller_mutate=" + afterMutate);
        boolean hasEu = snap.tags().contains("EU");
        System.out.println("symbol_check=" + hasEu);
        System.out.println("done");
    }
}
`;

export const JOB_SWITCH = {
  resumeBullet:
    "Hardened DTO getters with List.copyOf and killed ConcurrentModificationException spikes in billing Kafka path.",
  interviewPositioning:
    "When interviewers ask about **encapsulation** and **immutability**, you tie **private** **fields** to **heap** safety, **final** to publication, and **copyOf** to **alias** control. In week one at a new company you run **javap -c** on every **DTO** **getter** returning **collections** and file tickets when **areturn** follows raw **getfield** without **copyOf**.",
  starAnchor:
    "Situation: **canary** **billing** pods threw **ConcurrentModificationException** during **JSON** serialization while totals drifted across shards. Task: prove **reference** **leaks** and ship a safe fix without freezing the release train. Action: traced **InvoiceDto** **getter** returning internal **ArrayList**, added **List.copyOf** on egress, wrote concurrent stress tests, attached **javap** diffs to the **Jira**. Result: **zero** **ConcurrentModificationException** events for six months and **cache** consistency metrics returned to baseline within one deploy window.",
};

export const CHEATSHEET_CONTENT = `| Concept | Quick rule | Example / Command |
|---------|------------|---------------------|
| **private** | Hides **field** from other **classes** | Still on **heap** - not a **lock** |
| **final** field | Single assignment post-**ctor** | **Mutable** referent can still change |
| **Defensive copy** | **ingress** + **egress** | **Arrays.copyOf**, **List.copyOf** |
| **List.copyOf** | **Java 10** immutable snapshot | Throws on **null** elements |
| **unmodifiableList** | View over backing list | Mutations still visible if backing mutates |
| **record** | Shallow **immutability** | Copy **mutable** components in compact **ctor** |
| **HashMap** key | Must be stable **hashCode** | Never **mutate** key fields after **put** |
| **ConcurrentModificationException** | Structural change during iteration | **jstack** shows **Iterator** vs **mutator** |
| **JavaBeans** | **setters** for frameworks | Separate **immutable** **API** **DTO** layer |
| **JMM** | **private** != cross-thread safety | **final** fields help safe publication |
| **javap -c** | Prove **getter** bodies | Search **copyOf** before **areturn** |
`;

export const WRONG_ANSWERS = [
  "private fields cannot be read or written at runtime because the JVM enforces privacy like a firewall.",
  "final on a field makes the entire object graph deeply immutable including every list element.",
  "Returning Collections.unmodifiableList(myList) always prevents any mutation of the original backing list.",
  "Records automatically deep-copy every component so mutable lists inside records are always safe.",
  "Encapsulation alone guarantees thread safety without synchronization or immutable snapshots.",
  "HashMap rehashes entries every time you call get so mutating a key fixes stale bucket placement.",
  "Defensive copies are unnecessary if you trust other teams not to misuse your API.",
  "Java 8 streams always produce immutable collections without calling collectors that specify immutability.",
];
