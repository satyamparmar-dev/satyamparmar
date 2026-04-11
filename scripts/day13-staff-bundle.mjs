/** Day 13 staff content: Nested and Inner Classes (phase2-day13.json). */

export const WHY_CONTENT = [
  "At 02:52 the **Vert.x** **event** loop thread still holds twelve megabytes of **heap** per **connection** after you ship a **refactor** that registers **new OrderHandler()** as an **anonymous** **inner** **class** on every **WebSocket** open. The **handler** closes cleanly, but the **callback** object keeps an implicit reference to the enclosing **OrderService** **instance** through the **synthetic** **this$0** field **javac** emits. The symptom is **metaspace** pressure and rising **GC** pause times while **pod** counts stay flat, not a classic **OutOfMemoryError** on the first deploy hour. The artifact is the **nested** **class** **bytecode** inside **OrderService$1.class** loaded once per connection in the shaded **JAR**. The failure looks like a **Netty** leak or a **buggy** **cache**, but it is really **inner** **class** **lifetime** coupling the whole **service** graph to every **handler** instance.",
  "Interviewers who ask about **nested** and **inner** **classes** are not checking whether you memorized the words **static** versus **inner**. They want evidence that you know how **javac** encodes **Outer$Inner** **binary** names, when **invokevirtual** calls pass a hidden **outer** **receiver**, and how **lambdas** lower through **invokedynamic** instead of duplicating **Outer** captures blindly. The mental model gap that separates a weak answer from a strong one is **source** nesting versus **class** **file** layout and **GC** **reachability**: strong candidates draw **heap** arrows from **inner** instances back to **outer** **instances** and name **synthetic** fields.",
  "Use this four-step pattern in every answer. First, classify the **nested** type: **static** **member**, **inner** **instance**, **local**, or **anonymous**. Second, open **javap -p** and read **NestHost**/**NestMembers** on **Java 11**+ or scan for **this$0** **synthetic** fields on **inner** bodies. Third, narrate the **call** **site**: **invokestatic** for **static** **nested** **new**, **invokespecial** with **outer** **receiver** for **inner** **construction**. Fourth, verify **retention** with **jcmd** **GC.class_histogram** or **jmap -histo:live** when you suspect **inner** **callbacks** pinning **outer** graphs, and attach **javap** output to the **Jira** ticket. You repeat that loop whenever a **PR** introduces a **dollar**-suffixed **class** file under **load**-bearing packages.",
  "At scale, ten engineers and fifty **Spring** **controllers** multiply any sloppy **listener** pattern. One squad registers a non-**static** **nested** **RowMapper** inside a **singleton** **@Service**; every **query** allocates a **mapper** that carries **this$0**, keeping **service**-scoped **caches** reachable longer than intended and inflating **tenured** **heap**. Another failure mode is **IncompatibleClassChangeError** when a **library** **shade** rule renames **Outer** but leaves **Inner** **ConstantPool** references stale across **canary** **JARs** - the **JVM** throws during **defineClass** while **metrics** look like random **pod** **restarts**. **jstack** captures under **load** still show **Service$3** frames long after **queries** finish, which tells you the failure is **structural** **retention** rather than a **transient** **allocation** **spike**. You diff **javap** **NestMembers** slices from the prior **release** against **canary** artifacts before **on-call** blames **infrastructure**. Both resemble application bugs but are **platform** and **bytecode** hygiene failures.",
  "A senior candidate states **Java 11** introduced **NestHost** and **NestMembers** attributes so **private** **bridge** access between **nested** **types** uses **invokespecial** to **synthetic** accessors without widening **visibility** at **source** level; a mid-level answer still claims **inner** **classes** can freely touch **private** **outer** fields with no **compiler** help. Another senior signal is **Java 8** **lambdas**: when a **lambda** captures **this**, **LambdaMetafactory** may generate a **private** **static** **synthetic** method on the **outer** **class**, changing **profiler** hotspots compared with **anonymous** **inner** **classes**.",
  "In your first six months on a new job this topic shows up weekly. A reviewer asks you to convert a **GUI**-era **anonymous** **ActionListener** to a **lambda**; you show **javap -c** diff proving **invokedynamic** versus **invokespecial** and discuss capture cost. During **on-call**, **heap** dumps show millions of **com.acme.Service$3** instances; you trace **registration** sites, make **nested** **handlers** **static** where possible, and re-run **jcmd** **GC.heap_info**. While debugging **Jackson** **deserialization** of **non-static** **inner** **DTOs**, you hit **IllegalArgumentException** about missing **enclosing** **instance**; you refactor to **static** **nested** **types** or **records** and document **binary** names for **API** **schemas**.",
].join("\n\n");

export const THEORY_CONTENT = `### Plain-language overview

**Nested** **types** are **classes** or **interfaces** declared inside another **class** or **interface**. A **static** **nested** **class** behaves like a top-level **type** scoped under the **outer** name; it cannot reference **outer** **instance** **fields** without an explicit reference. A non-**static** **inner** **class** carries an implicit **pointer** to the **enclosing** **object** so **Outer.this** works. **Local** and **anonymous** **classes** live inside **methods** and capture **effectively** **final** locals. The **JVM** loads them as separate **class** files named **Outer$Inner**. **Interview angle:** If a candidate cannot sketch **this$0**, press them to open **javap -p**.

### **Class** **files**, **binary** names, and **class** **loaders**

Each **nested** **type** compiles to its own **class** file with a **$** in the **binary** name. **Class** **loaders** resolve **Outer$Inner** independently; **NoClassDefFoundError** appears when **shading** or **split** packages break the **name** link. **Interview angle:** Ask how **Maven** **shade** relocations interact with **Inner** **names**.

### **Static** **nested** **classes**

**static** **nested** **types** do not receive a **synthetic** **outer** **field**. **new** uses **invokestatic** or **new** + **invokespecial** on the **nested** **<init>** without an **outer** **receiver** parameter (unless your **constructor** adds one explicitly). They fit **builder** and **adapter** patterns tied to the **API** surface. **Interview angle:** Contrast **memory** retention with **inner** **instances**.

### Non-**static** **inner** **classes** and **synthetic** **outer** references

**javac** passes the **enclosing** **instance** as a hidden **constructor** argument and stores it in a **synthetic** field often named **this$0**. **invokevirtual** on **inner** methods may load **getfield** **this$0** before touching **outer** **state**. **Interview angle:** Tie **memory** **leaks** to **long**-lived **inner** **instances** holding **outer** graphs.

### **Local** **classes** and **capture**

**Local** **classes** may read **final** or **effectively** **final** locals; **javac** hoists captured values into **synthetic** **constructor** parameters and **fields**. **Interview angle:** Mention **capture** cost versus **lambda** **indify** on **Java 8**+.

### **Anonymous** **classes** and **bytecode**

**Anonymous** **classes** still get **Outer$1** style names and **invokespecial** **<init>** sites at **new**. They implement **interfaces** or **extend** **classes** inline. **Interview angle:** Compare with **lambda** **invokedynamic** bootstrap sequences on **javap -c**.

### **Lambdas** versus **anonymous** **inners** (**Java 8**)

**Lambdas** typically use **invokedynamic** pointing at **LambdaMetafactory** with a **desugared** **private** method holding the body. Captured **this** still ties to the **outer** **instance** but **object** shape differs from classic **Inner**. **Interview angle:** Discuss **profiler** surprises when **async** **pipelines** retain **capture** lists.

### **NestHost** and **NestMembers** (**Java 11**)

**NestHost** records the **top-level** **host** **class**; **NestMembers** lists **nested** friends. **private** access across **nest** mates is compiled to **synthetic** **accessor** methods the **verifier** allows. **Interview angle:** Explain why **reflection** **setAccessible** stories changed slightly with **nest** **mates**.

### Production comparison table

| Pattern | Retains **outer** **instance**? | Typical use |
|---------|--------------------------------|-------------|
| **static** **nested** | No implicit reference | **Builder**, **Mapper** factories |
| **inner** **instance** | Yes via **this$0** | **Iterator** tied to **collection** |
| **local** / **anonymous** | Captures **outer** **this** if used | Legacy **listeners** |

**Interview angle:** Use this table when reviewing **callback** **registration** **PRs**.

### Step-by-step: proving an **inner** **retains** an **outer**

Step 1: Run **javap -p Outer$Inner.class** and locate **synthetic** **this$0**. Step 2: Open **javap -c** on **<init>** to count **aload_1** storing **outer**. Step 3: Search codebase for **new** **Inner** sites without **static** conversion. Step 4: Capture **jcmd** **GC.class_histogram** before and after load test. Step 5: Refactor to **static** **nested** plus explicit **dependency** if **outer** state unnecessary. **Interview angle:** Staff proof is **javap** plus **histogram** deltas.

### **Serialization** and **inner** **classes**

**Non-static** **inner** **classes** **serialize** with **synthetic** fields referencing **outer** instances; **deserialization** may fail if the **enclosing** **instance** is missing. **Interview angle:** Recommend **static** **nested** **DTOs** for **JSON** **APIs**.

### Enclosing instance lookup and **reflection**

**Class.getEnclosingClass** and **getEnclosingConstructor** expose nesting relationships for frameworks. Misuse in **DI** can instantiate **inner** **types** without a legal **outer**. **Interview angle:** Mention **NoSuchMethodException** on reflective **newInstance** misuse.

### Pattern picker table

| Need | Prefer | Avoid |
|------|--------|-------|
| Stateless helper tied to API | **static** **nested** | **inner** with dummy **outer** |
| Per-outer policy object | **inner** | **static** that fakes **outer** with globals |
| Single **SAM** callback | **lambda** | **anonymous** when clarity suffers |

**Interview angle:** Tie choices to **heap** and **team** readability.

### Opcode lens for **nested** **construction**

| Site | Typical bytecode | Extra **receiver** |
|------|------------------|---------------------|
| **new** **static** **nested** | **new**, **invokespecial** **<init>** | None |
| **outer.new** **Inner** | **aload** **outer**, **new**, **invokespecial** | **Outer** reference |
| **lambda** **SAM** | **invokedynamic** | **Captured** values |

**Interview angle:** Ask candidates to trace **aload_0** patterns in **javap -c** for **inner** **ctors**.

### Illustrative **inner** access pattern

\`\`\`java
class Ship {
    private int fuel;

    class Engine {
        void burn() {
            fuel--;
        }
    }
}
\`\`\`

**Interview angle:** Ask how **javap -p Ship$Engine** exposes **this$0**.

### Sixty-second interview story

You explain **static** **nested** as scoped **top-level**, **inner** as carrying **outer** **this$0**, **local**/**anonymous** as **method**-scoped with **capture**, and **lambdas** as **invokedynamic** factories on **Java 8**. You warn **long**-lived **inner** **callbacks** pin **outer** **graphs** and show **javap -p** for **synthetic** fields. You close with **NestHost** on **Java 11** governing **private** **access** across **nest** **mates**. You verify with **javap** plus **jcmd** **GC.class_histogram** when **heap** smells wrong. **Interview angle:** Story must name at least one **opcode** family and one **diagnostic** command.

### Satyverse drill — tie-down

For every **nested** **type** in your module, run **javap -p** and highlight **synthetic** **outer** fields. Convert accidental **inner** **handlers** to **static** **nested** types with explicit **dependencies** until **histogram** counts drop. Re-run **jmap -histo:live** after load tests and paste before/after tables into the **PR**. **Interview angle:** Drill ends when **bytecode** and **heap** evidence align.
`;

export const BASIC_CODE = `package arch.day13;

/**
 * Day 13 basic: println-only nested vs inner reference card.
 */
public class Day13Basic {

    public static void main(String[] args) {
        // Binary names and loader resolution for nested types.
        System.out.println("=== Nested types - class file layout ===");
        System.out.println("static nested  | Outer$Nested.class | no implicit outer field");
        System.out.println("inner instance | Outer$Inner.class  | synthetic this$0 to enclosing");
        System.out.println("anonymous      | Outer$1.class      | numbered sibling classes");
        System.out.println("local          | Outer$1Local.class | method-scoped, captures finals");
        System.out.println();

        System.out.println("=== Command reference - bytecode and heap ===");
        System.out.println("javap -p Outer$Inner.class     -> show synthetic this$0 and NestHost");
        System.out.println("javap -c Outer$Inner.class     -> see outer receiver passed to <init>");
        System.out.println("jcmd <pid> GC.class_histogram  -> count Outer$* instances under load");
        System.out.println("jmap -histo:live <pid>         -> spot explosion of $1 $2 callbacks");
        System.out.println("java -verbose:class            -> trace duplicate nested loads from jars");
        System.out.println();

        System.out.println("=== Failure modes tied to nested types ===");
        System.out.println("NoClassDefFoundError       | shaded jar renamed Outer but not Inner");
        System.out.println("IllegalArgumentException   | reflection new inner without outer instance");
        System.out.println("Heap retention             | inner handler pins outer singleton graph");
        System.out.println("IncompatibleClassChangeError | nest split across mismatched jars");
        System.out.println("Metaspace churn            | anonymous per request without reuse");
        System.out.println();

        System.out.println("=== Environment / CI cues ===");
        System.out.println("Diff javap NestHost/NestMembers after every shade relocation");
        System.out.println("Ban non-static nested DTOs in JSON modules via ArchUnit");
        System.out.println("Prefer lambdas or static nested for SAM callbacks on hot paths");
        System.out.println("Document binary names for OpenAPI generators touching nested models");
        System.out.println("Count dollar classes in jcmd histogram after every perf regression");
        System.out.println();

        System.out.println("=== Review cue ===");
        System.out.println("staff cue: grep new Outer.Inner versus new Inner on outer.new");
        System.out.println("staff cue: histogram Outer dollar classes after soak tests");
        System.out.println("staff cue: diff NestMembers attributes when shade relocates packages");
        System.out.println("done");
    }
}
`;

export const BASIC_OUTPUT = `=== Nested types - class file layout ===
static nested  | Outer$Nested.class | no implicit outer field
inner instance | Outer$Inner.class  | synthetic this$0 to enclosing
anonymous      | Outer$1.class      | numbered sibling classes
local          | Outer$1Local.class | method-scoped, captures finals

=== Command reference - bytecode and heap ===
javap -p Outer$Inner.class     -> show synthetic this$0 and NestHost
javap -c Outer$Inner.class     -> see outer receiver passed to <init>
jcmd <pid> GC.class_histogram  -> count Outer$* instances under load
jmap -histo:live <pid>         -> spot explosion of $1 $2 callbacks
java -verbose:class            -> trace duplicate nested loads from jars

=== Failure modes tied to nested types ===
NoClassDefFoundError       | shaded jar renamed Outer but not Inner
IllegalArgumentException   | reflection new inner without outer instance
Heap retention             | inner handler pins outer singleton graph
IncompatibleClassChangeError | nest split across mismatched jars
Metaspace churn            | anonymous per request without reuse

=== Environment / CI cues ===
Diff javap NestHost/NestMembers after every shade relocation
Ban non-static nested DTOs in JSON modules via ArchUnit
Prefer lambdas or static nested for SAM callbacks on hot paths
Document binary names for OpenAPI generators touching nested models
Count dollar classes in jcmd histogram after every perf regression

=== Review cue ===
staff cue: grep new Outer.Inner versus new Inner on outer.new
staff cue: histogram Outer dollar classes after soak tests
staff cue: diff NestMembers attributes when shade relocates packages
done
`;

export const INTERMEDIATE_CODE = `package arch.day13;

/**
 * Day 13 intermediate: four nested-class production narratives (println only).
 */
public class Day13Intermediate {

    /*
     * Context: Vert.x / Netty style handler holds non-static inner per connection.
     */
    static void scenario1() {
        System.out.println("--- Scenario 1: inner handler pins outer service graph ---");
        System.out.println("symptom: metaspace and old gen grow while connection count flat");
        System.out.println("cause:    anonymous inner implements Handler capturing OrderService.this");
        System.out.println("why:      synthetic this$0 keeps whole service reachable from handler");
        System.out.println("fix:      convert to static nested with explicit OrderService param");
        System.out.println("verify:   javap -p OrderService$1.class lists synthetic outer field");
        System.out.println("staff:    jcmd <pid> GC.class_histogram | find OrderService$");
        System.out.println("note:    profilers show innocent handler retaining giant spring context");
        System.out.println("echo:    MAT path to GC roots often lists this$0 before you expect it");
        System.out.println();
    }

    /*
     * Context: shade plugin relocates Outer but Inner ConstantPool stale.
     */
    static void scenario2() {
        System.out.println("--- Scenario 2: NoClassDefFoundError after shaded deploy ---");
        System.out.println("symptom: canary pod crash loop on first user request");
        System.out.println("cause:    Inner still references old com.acme.Outer name in bytecode");
        System.out.println("fix:      align shade rules or stop relocating nested companions");
        System.out.println("verify:   javap -verbose Outer$Inner.class | grep class name");
        System.out.println("staff:    java -verbose:class on canary to see failing load");
        System.out.println("echo:     diff fat jar against baseline with jar tf | grep Outer");
        System.out.println("note:    IncompatibleClassChangeError also appears on split nests");
        System.out.println("verify2: jdeps --multi-release 21 fat.jar surfaces split nest edges");
        System.out.println();
    }

    static void scenario3() {
        System.out.println("--- Scenario 3: reflection tries to new inner without outer ---");
        System.out.println("symptom: IllegalArgumentException no enclosing instance");
        System.out.println("cause:    Class.getDeclaredConstructor().newInstance on non-static inner");
        System.out.println("fix:      use Constructor outer.new Inner or switch to static nested");
        System.out.println("verify:   javap -p Service$Builder.class for static modifier");
        System.out.println("staff:    add integration test constructing nested via public API");
        System.out.println("metric:   support tickets spike after codegen upgrade");
        System.out.println("note:    Jackson sometimes needs JsonCreator static factory");
        System.out.println();
    }

    static void scenario4() {
        System.out.println("--- Scenario 4: lambda versus anonymous bytecode debate ---");
        System.out.println("symptom: profiler shows unexpected private static lambda bodies on outer");
        System.out.println("cause:    lambda capture desugared to LambdaMetafactory indy sites");
        System.out.println("fix:      read javap -c and accept or replace with method reference");
        System.out.println("verify:   javap -c -p Outer.class | grep invokedynamic");
        System.out.println("staff:    compare against old anonymous inner class profile");
        System.out.println("context: Java 8 moved hot SAM paths to indy for metaspace wins");
        System.out.println("note:    capture lists still retain outer this when referenced");
        System.out.println("metric:  indy count rises when migrating anonymous to lambda");
        System.out.println("echo:    jstack still shows nested frames even with lambda sugar");
        System.out.println();
    }

    static void printBanner() {
        System.out.println("banner: Day13 intermediate nested + inner lab");
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

export const INTERMEDIATE_OUTPUT = `banner: Day13 intermediate nested + inner lab
--- Scenario 1: inner handler pins outer service graph ---
symptom: metaspace and old gen grow while connection count flat
cause:    anonymous inner implements Handler capturing OrderService.this
why:      synthetic this$0 keeps whole service reachable from handler
fix:      convert to static nested with explicit OrderService param
verify:   javap -p OrderService$1.class lists synthetic outer field
staff:    jcmd <pid> GC.class_histogram | find OrderService$
note:    profilers show innocent handler retaining giant spring context
echo:    MAT path to GC roots often lists this$0 before you expect it

--- Scenario 2: NoClassDefFoundError after shaded deploy ---
symptom: canary pod crash loop on first user request
cause:    Inner still references old com.acme.Outer name in bytecode
fix:      align shade rules or stop relocating nested companions
verify:   javap -verbose Outer$Inner.class | grep class name
staff:    java -verbose:class on canary to see failing load
echo:     diff fat jar against baseline with jar tf | grep Outer
note:    IncompatibleClassChangeError also appears on split nests
verify2: jdeps --multi-release 21 fat.jar surfaces split nest edges

--- Scenario 3: reflection tries to new inner without outer ---
symptom: IllegalArgumentException no enclosing instance
cause:    Class.getDeclaredConstructor().newInstance on non-static inner
fix:      use Constructor outer.new Inner or switch to static nested
verify:   javap -p Service$Builder.class for static modifier
staff:    add integration test constructing nested via public API
metric:   support tickets spike after codegen upgrade
note:    Jackson sometimes needs JsonCreator static factory

--- Scenario 4: lambda versus anonymous bytecode debate ---
symptom: profiler shows unexpected private static lambda bodies on outer
cause:    lambda capture desugared to LambdaMetafactory indy sites
fix:      read javap -c and accept or replace with method reference
verify:   javap -c -p Outer.class | grep invokedynamic
staff:    compare against old anonymous inner class profile
context: Java 8 moved hot SAM paths to indy for metaspace wins
note:    capture lists still retain outer this when referenced
metric:  indy count rises when migrating anonymous to lambda
echo:    jstack still shows nested frames even with lambda sugar

`;

export const ADVANCED_CODE = `package arch.day13;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Day 13 advanced: nest pattern catalog + leak score + refactor checklist.
 */
public class Day13Advanced {

    record NestPattern(String kind, boolean holdsOuter) {}

    static List<NestPattern> catalog() {
        List<NestPattern> list = new ArrayList<>();
        list.add(new NestPattern("static nested builder", false));
        list.add(new NestPattern("inner iterator", true));
        list.add(new NestPattern("anonymous listener", true));
        list.add(new NestPattern("lambda capturing this", true));
        return list;
    }

    static Map<String, Integer> leakWeights() {
        Map<String, Integer> m = new LinkedHashMap<>();
        m.put("singleton outer + inner handler", 5);
        m.put("per-request anonymous", 3);
        m.put("static nested utility", 0);
        m.put("local class in tight loop", 2);
        return m;
    }

    public static void main(String[] args) {
        System.out.println("banner: Day13 advanced nested-class guardrails");
        System.out.println("scope: arch.day13 bytecode + heap coupling model");
        System.out.println();
        System.out.println();

        System.out.println("=== Block 1: pattern catalog ===");
        for (NestPattern n : catalog()) {
            System.out.println(n.kind() + " | holdsOuter=" + n.holdsOuter());
        }
        System.out.println();

        System.out.println("=== Block 2: leak weight board ===");
        int sum = 0;
        for (Map.Entry<String, Integer> e : leakWeights().entrySet()) {
            sum += e.getValue();
            System.out.println(e.getKey() + " = " + e.getValue());
        }
        System.out.println("total weight = " + sum);
        System.out.println();

        System.out.println("=== Block 3: refactor checklist ===");
        Map<String, Boolean> checks = new LinkedHashMap<>();
        checks.put("javap shows no this$0 on hot path handlers", false);
        checks.put("shade verified for Outer$Inner pairs", true);
        checks.put("tests cover outer.new Inner construction", true);
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

export const ADVANCED_OUTPUT = `banner: Day13 advanced nested-class guardrails
scope: arch.day13 bytecode + heap coupling model


=== Block 1: pattern catalog ===
static nested builder | holdsOuter=false
inner iterator | holdsOuter=true
anonymous listener | holdsOuter=true
lambda capturing this | holdsOuter=true

=== Block 2: leak weight board ===
singleton outer + inner handler = 5
per-request anonymous = 3
static nested utility = 0
local class in tight loop = 2
total weight = 10

=== Block 3: refactor checklist ===
javap shows no this$0 on hot path handlers | false
shade verified for Outer$Inner pairs | true
tests cover outer.new Inner construction | true
pass count = 2 / 3
eof
`;

export const PITFALLS = [
  "Registering a **non-static** **nested** **handler** on a **singleton** **@Service** for every **WebSocket** session - production symptom is **heap** and **metaspace** growth because **synthetic** **this$0** pins the entire **Spring** **context** graph; fix by converting to **static** **nested** **types** with explicit **dependencies**; verify with **jcmd** **GC.class_histogram** counting **Service$** **classes**.",
  "Running **Maven** **shade** relocations that rename **Outer** but leave **Inner** **ConstantPool** entries stale - **canary** **pods** throw **NoClassDefFoundError** or **IncompatibleClassChangeError** on first load; fix by pairing relocations or excluding **nested** companions; verify **javap -verbose** **Outer$Inner.class** for consistent **binary** names.",
  "Calling **Class.newInstance** on a **non-static** **inner** **class** without an **enclosing** **receiver** - **IllegalArgumentException** at **runtime** during **framework** **wiring**; fix by using **outer.new Inner()** or **Constructor** with **outer** argument; verify **javap -p** shows **static** modifier when refactor completes.",
  "Serializing **non-static** **inner** **DTOs** with **Jackson** while **outer** **state** is not reconstructible - **JsonMappingException** or silent **wrong** **defaults** appear; fix by moving to **static** **nested** **records**; verify with **integration** tests round-tripping **JSON**.",
  "Creating **anonymous** **Runnable** instances inside **tight** **loops** on **Java 7** style code paths - **metaspace** churn and **GC** overhead; fix with **lambda** or **shared** **executor** tasks; verify **jmap** **class** histogram delta across loops.",
  "Using **inner** **classes** for **JUnit** **@Nested** tests without understanding **instance** **lifecycle** - flaky tests when **outer** **setup** mutates shared **fields**; fix by making **nested** tests **static** where possible or isolating **outer** **per** **test**; verify **Surefire** reports.",
  "Assuming **private** **outer** **fields** are reachable from **static** **nested** **classes** without accessors - **javac** error before **bytecode**; fix with **package-private** accessors or **NestHost** **synthetics** on **Java 11**; verify **javac** output.",
  "Letting **IDE** quick-fix generate **inner** **builder** **classes** inside **entities** shared across **threads** - subtle **retention** and **lock** **contention**; fix by **static** **nested** **builder** pattern; verify **javap -p** lacks **this$0** on **builder**.",
];

export const EXERCISE_PROBLEM = [
  "You join the **shipping** API squad that models **Hull** configuration with a **static** **nested** **builder**; reviewers want **javap** proof that **builders** never capture accidental **outer** **references**.",
  "",
  "Requirements:",
  "1. Implement **arch.day13.Day13Exercise** with **public static void main(String[] args)** printing a three-line legend **static:**, **inner:**, and **local:** describing **Outer$Nested**, **this$0** coupling, and **method**-scoped **capture** - each line under 120 chars.",
  "2. Declare **class Hull** with **private final String id** and **private Hull(String id)**.",
  "3. Add **public static final class Builder** inside **Hull** with **private String id**, **Builder id(String v)** returning **this**, and **Hull build()** returning **new Hull(id)**.",
  "4. In **main**, use **new Hull.Builder().id(\"H1\").build()** and print **hull=** plus **id** via a **package-private** **String label()** on **Hull** that returns **id** (same package access from exercise class).",
  "5. Add a **static** method **demoLocal()** in **Day13Exercise** that declares **final String prefix=\"L:\"** and a **local** **class** **Tag** with **String mk(String s)** returning **prefix+s**, then print **local=** plus **new Tag().mk(\"oop\")**.",
  "6. End with **done** on its own line.",
].join("\n");

export const EXERCISE_HINTS = [
  "**Builder** must be **static** **nested** so **new Builder()** does not require an outer **Hull** instance.",
  "Keep **Hull** **constructor** **private**; only **Builder** constructs instances for encapsulation.",
  "The **local** **class** must sit inside **demoLocal** to capture **prefix** naturally.",
];

export const EXERCISE_SOLUTION = `package arch.day13;

/**
 * Day 13 exercise: static nested builder + local class capture.
 */
public class Day13Exercise {

    static final class Hull {
        private final String id;

        private Hull(String id) {
            this.id = id;
        }

        String label() {
            return id;
        }

        public static final class Builder {
            private String id;

            public Builder id(String v) {
                this.id = v;
                return this;
            }

            public Hull build() {
                return new Hull(id);
            }
        }
    }

    static void demoLocal() {
        final String prefix = "L:";
        class Tag {
            String mk(String s) {
                return prefix + s;
            }
        }
        System.out.println("local=" + new Tag().mk("oop"));
    }

    public static void main(String[] args) {
        final String a = "static: Outer$Nested bytecode has no synthetic outer this field.";
        final String b = "inner: non-static nested ctor receives implicit outer instance slot.";
        final String c = "local: method-scoped class captures effectively final locals as fields.";
        System.out.println(a);
        System.out.println(b);
        System.out.println(c);
        Hull h = new Hull.Builder().id("H1").build();
        System.out.println("hull=" + h.label());
        demoLocal();
        System.out.println("done");
    }
}
`;

export const JOB_SWITCH = {
  resumeBullet:
    "Flattened hot-path inner handlers to static nested types; cut retained heap 18% on connection soak.",
  interviewPositioning:
    "When interviewers ask about **nested** **classes**, you explain **binary** **Outer$Inner** names, **this$0** retention, and **NestHost** on **Java 11**. In week one at a new company you **javap -p** every **callback** **class** under **com.company.service$** and ticket any **synthetic** **outer** on **singleton**-scoped handlers.",
  starAnchor:
    "Situation: **WebSocket** **canary** **pods** doubled **heap** after a **refactor** introduced **anonymous** **inner** **OrderHandler** capturing **OrderService**. Task: stop retention without rolling back features. Action: proved **this$0** via **javap**, converted handlers to **static** **nested** **types** with explicit **service** **injection**, reran **jcmd** **GC.class_histogram** soak. Result: **old** **gen** stable across **48** **hour** test; **OrderService$** instance counts dropped to **zero** on steady state.",
};

export const CHEATSHEET_CONTENT = `| Concept | Quick rule | Example / Command |
|---------|------------|---------------------|
| **static** **nested** | No **outer** **this$0** | **new Outer.Nested()** |
| **Inner** **instance** | **synthetic** **outer** ref | **outer.new Inner()** |
| **Binary** name | **Outer$Inner** | **javap -p** |
| **Anonymous** | **Outer$1** numbering | **javap** lists siblings |
| **Local** **class** | Captures **final** locals | **<init>** takes **synthetics** |
| **Lambda** | **invokedynamic** | **javap -c** **grep** **indy** |
| **NestHost** | **Java 11** **private** access | **javap -v** **NestMembers** |
| **Memory** leak | **inner** pins **outer** | **jcmd** **GC.class_histogram** |
| **Shade** | Move **Outer**+**Inner** together | **jar tf** **grep** **\\$** |
| **Reflection** | **inner** needs **outer** | **Constructor** with **enclosing** |
| **Serialization** | Avoid **non-static** **DTO** **inners** | Prefer **static** **nested** **record** |
`;

export const WRONG_ANSWERS = [
  "Static nested classes always hold a hidden reference to the outer instance just like inner classes.",
  "Anonymous classes in Java 8 are implemented exactly like lambdas with invokedynamic at every call site.",
  "Renaming Outer.java in an IDE automatically rewrites every Outer$Inner.class file on disk without recompilation.",
  "NestHost metadata was introduced in Java 8 to fix inner class visibility.",
  "Local classes can mutate and capture any local variable even when it is reassigned after the class declaration.",
  "javap cannot show synthetic fields so you must use a debugger to prove this$0 exists.",
  "Inner classes compile to the same class file as the outer class to save metaspace.",
  "Method references never capture the receiver and therefore cannot retain outer instances.",
];
