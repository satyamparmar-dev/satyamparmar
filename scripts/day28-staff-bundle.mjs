/** Day 28 staff content: Generics Deep Dive (phase4-day28.json). */

export const WHY_CONTENT = [
  "At 01:44 the **catalog** **Spring Boot** **pod** throws **ClassCastException: java.lang.Long cannot be cast to java.lang.String** three frames below **ObjectMapper.readValue** while **hydrating** a **DTO** that declared **List** **String** **skus** but received a **raw** **List** from a **legacy** **JdbcTemplate** **query** wrapped in **unchecked** **Map** **put** calls. The **artifact** is **migration** **PR** **SKU-218** that swapped **typed** **RowMapper** for a **Map**\<**String**,**Object**\> convenience **helper** without **reifying** **element** **types**. The **symptom** is **HTTP** **500** only on **stores** whose **SKU** **payload** mixes **numeric** and **string** **IDs**, so **on-call** blames **data** **quality** first. The failure is **erasure** meeting **raw** **heap** **pollution**: the **compiler** **trusted** **List**\<**String**\> at the **call** **site** while **bytecode** still **loads** **List** as **erase-to-** **Object** **structures** from **older** **libraries**.",
  "Interviewers who ask about **generics** are not checking whether you memorized **?** **extends** versus **?** **super**. They want evidence that you know **javac** **erases** most **type** **parameters** to **bounds** or **Object**, when **bridge** **methods** appear in **bytecode**, why **raw** **types** strip **checks**, and how **PECS** keeps **public** **API** **edges** **sound** while **internals** stay **flexible**. The mental model gap is treating **generics** as **runtime** **tags** instead of **compile**-**time** **proof** **obligations** that **disappear** at **class** **load** unless you carry **Class**\<**T**\> tokens or **careful** **reflection**.",
  "Use this four-step pattern in every answer. First, state what **javac** can prove: **T** **extends** **bounds**, **wildcard** **capture**, or **raw** **fall**-**through**. Second, open **javap -p** **Subclass.class** when **override** **stacks** confuse you and read **synthetic** **bridge** **flag** lines. Third, decide **API** **polarity** with **PECS** — **producer** **extends**, **consumer** **super** — before widening **wildcards**. Fourth, verify **runtime** **assumptions** with **-Xlint:unchecked** clean builds and **jcmd** **Thread.print** capturing **ClassCastException** **receiver** **types** at the **failing** **invokeinterface** site.",
  "At scale, ten **microservices** and fifty **Gradle** **modules** multiply any **unchecked** **cast** buried in **shared** **util** **jars**. One squad exposes **static** **T** **parse** methods that **reflectively** **instantiate** **T** without **Class** tokens and ships **NoSuchMethodException** or **ClassCastException** only on **canary** traffic. Another failure mode is **ArrayStoreException** when **varargs** **generic** **methods** synthesize **Object**[] **arrays** that later receive **wrong** **reified** **elements** through **mixed** **classpath** **versions** — the **stack** resembles **data** **corruption** but is really **heap** **pollution** from **unchecked** **generic** **bridges**.",
  "A senior candidate states **Java 5** introduced **erasure** mainly to keep **bytecode** **shape** compatible with **pre**-**generic** **class** **libraries**, so **List**\<**String**\> and **List**\<**Integer**\> still **share** **java.util.List** at **runtime**; a mid-level answer still believes **getClass** distinguishes them. Another senior signal is **Java 7** **diamond** \<\> letting **javac** **infer** **constructor** **type** **arguments** while **anonymous** inner **bodies** still need **explicit** **witness** types in edge **cases**.",
  "In your first six months on a new job this topic shows up weekly. During **review** you flag a **DAO** returning **List** without **type** **arguments** into a **Stream**\<**Product**\>; you demand **RowMapper** fixes and enable **Error** **Prone** **rawtypes**. On **on-call**, **Grafana** links **ClassCastException** to **MapStruct** **mappers** after a **Lombok** upgrade; you diff **javap** **bridge** lists and add **integration** tests for **wildcard** **signatures**. While migrating **Gson** to **records**, you introduce **TypeToken** patterns so **erasure** never drops **nested** **generic** **shapes** at **serialization** **edges**.",
].join("\n\n");

export const THEORY_CONTENT = `### Plain-language overview

**Generics** add **type** **parameters** to **classes** and **methods** so **javac** proves **List**\<**String**\> cannot receive **Integer** at **compile** **time**. **Erasure** replaces most **parameter** **metadata** in **bytecode** with **bounds** or **java.lang.Object**, so **runtime** **instanceof** cannot ask whether an **Object** is a **List**\<**String**\>. **Interview angle:** Strong candidates separate **compile**-**time** proofs from **JVM** **loads**.

### Erasure mechanics at **bytecode** **level**

**javac** emits **method** **descriptors** using **erased** **parameters**: **List.add(E)** becomes **add(Object)** on the **erased** **signature** subject to **bridge** synthesis for **covariant** **returns**. **Runtime** **invokeinterface** on **ArrayList** still passes **Object** references; **cast** **bytecodes** inserted by **javac** enforce **static** **types** at call sites. **Interview angle:** Ask how many **checkcast** **instructions** appear after **generic** **get** calls.

### **Raw** **types** versus **parameterized** **types**

**Raw** **Foo** disables **generic** **checks** and leaks **unchecked** warnings; legacy **bytecode** allows assigning **List** to **List**\<**String**\> with only **lint** noise. **Production** **symptom** is delayed **ClassCastException** inside **framework** frames. **Interview angle:** Ban **raw** **public** **APIs** in **style** guides.

### Bounded type parameters

\`<T extends Comparable<T>>\` lets **javac** accept **compareTo** invokes without casts. Multiple **bounds** use \`<T extends Number & Comparable<T>>\` style where one **class** plus **interfaces** combine with **&**. **Erasure** replaces **T** with the **leftmost** **class** **bound** then **interfaces** as **extra** **constraints** at compile time only. **Interview angle:** Probe recursive **bounds** for **Enum** singleton patterns.

### Wildcards and **capture**

\`List<? extends Number>\` is a **producer** of **Number**; \`List<? super Integer>\` is a **consumer** accepting **Integer**. **javac** creates **fresh** **capture** variables when **assigning** between **wildcards**. **Interview angle:** Ask why \`list.add(1)\` fails on **extends** list.

### **PECS** at **module** **boundaries**

**Producer** **extends**, **consumer** **super** guides **public** **method** **signatures** so callers pass **wider** **types** while **internals** stay **specific**. Flipping **PECS** yields APIs that reject **legal** **callers** or allow **unsafe** **writes**. **Interview angle:** Map **PECS** to **read**-**only** versus **write**-**heavy** **use** cases.

### **Generic** **methods** and **inference**

\`<T> T pick(T a, T b)\` carries **type** **variables** on the **method**; **javac** infers **T** from **arguments** and **target** **types**. **Diamond** \<\> on **Java 7**+ avoids repeating **type** **arguments** in **constructors** when **context** suffices. **Interview angle:** Mention **Java 8** inference limits with nested **generics** in **lambda** targets.

### **Bridge** **methods** after **erasure**

When a **subclass** refines **return** types, **javac** emits **synthetic** **bridge** **methods** delegating to **user** **code** with **covariant** returns. **Stack** traces sometimes show **bridge** **names** confusing **jstack** readers. **Interview angle:** Predict **ACC_BRIDGE** lines in **javap -p**.

### **Heap** **pollution** and **@SafeVarargs**

**Varargs** of **generic** types create **Object**[] **arrays** at **runtime**; misuse can **ArrayStoreException** or **ClassCastException** later. **@SafeVarargs** on **final** **methods** **suppresses** warnings when the **method** body is **safe**. **Interview angle:** Tie **heap** **pollution** to **on-call** stories after **util** **refactors**.

### **Reifiable** **types** versus **erased** **signatures**

**Primitives**, **raw** **types**, and **unbounded** **type** **variables** in **arrays** interact badly because **arrays** are **reified** but **generic** **arrays** are illegal to **new**. Use **ArrayList** instead or accept **unchecked** casts with tight scope. **Interview angle:** Explain **new T[0]** compile error.

### Production comparison table — **API** **shape**

| Surface | Prefer | Avoid |
|---------|--------|-------|
| **Read**-only **return** | **List**\<**?** **extends** **T**\> | **Concrete** **ArrayList**\<**T**\> locking callers in |
| **Write** **heavy** **param** | **List**\<**?** **super** **T**\> | **Unbounded** **List**\<**\?**\> hiding intent |
| **Internal** **algorithm** | **Named** **type** **param** **T** | **Wildcard** soup in **private** helpers |

**Interview angle:** Use this table in **library** **export** reviews.

### Step-by-step: proving a **bridge** exists

Step 1: **javac** the **subclass** with **generics**. Step 2: Run **javap -p Sub.class** and locate **ACC_BRIDGE** **ACC_SYNTHETIC** methods. Step 3: **javap -c** bridge body to see **checkcast** inserted. Step 4: Compare against **superclass** **descriptor**. Step 5: File **PR** note if **profiler** hotspots land on **bridge** unexpectedly. **Interview angle:** Staff proof is **javap** evidence attached to tickets.

### **Reflection** and **Type** **literals**

**java.lang.Class**\<**T**\> is a **reified** token carrying **type** **arguments** at **compile** time for **reflective** **instantiation**. **java.lang.reflect.ParameterizedType** exposes **actual** **type** **arguments** for **frameworks**. **JSON** libraries often need **TypeToken** subclasses to preserve **nested** **generics**. **Interview angle:** Mention **Gson** **TypeToken** as **production** pattern.

### Erasure versus **arrays** snippet

\`\`\`java
// Illegal: cannot create generic array directly
// List<String>[] bad = new List<String>[1];

List<String>[] workaround = (List<String>[]) new List<?>[1]; // unchecked
\`\`\`

**Interview angle:** Ask candidates to justify why **workaround** still compiles with warning.

### Wildcard decision table

| Need | Syntax | Writes allowed |
|------|--------|----------------|
| Read **T** **candidates** | **?** **extends** **T** | Essentially none |
| Accept **T** **subtypes** | **?** **super** **T** | **T** values |
| Unknown | **?** | **null** only |

**Interview angle:** Quick whiteboard filter for **collections** **APIs**.

### Reflection token comparison

| Technique | Preserves **nested** generics | Typical use |
|-----------|------------------------------|-------------|
| **Class**\<**T**\> | No for **List**\<**String**\> shape | **Spring** beans |
| **ParameterizedType** | Yes via **getActualTypeArguments** | Framework introspection |
| **TypeToken** subclass | Yes for serializers | **Gson** nested maps |

**Interview angle:** Ask how **Jackson** **JavaType** differs from raw **Class**.

### 60-second interview story

You explain **erasure** erasing to **bounds**/**Object**, **bridges** keeping **virtual** **dispatch** sound, **PECS** guiding **wildcard** **direction**, and **raw** **types** as **migration** **hazards**. You warn **ClassCastException** usually means **unchecked** earlier and show **javap -p** for **synthetic** **bridges**. You close with **Class**\<**T**\> tokens for **reflection** and **TypeToken** for **JSON**. You verify with **-Xlint:unchecked** clean builds and **javap** on **hot** **subclasses**. **Interview angle:** Story must name **erasure** plus one **tool**.

### Satyverse drill — tie-down

Pick one **shared** **module** this week and eliminate **raw** **List**/**Map** **returns**; rerun **gradle** **compileJava** with **-Xlint:unchecked** **fail** mode in **CI**. For every **override** with **covariant** **returns**, attach **javap -p** **bridge** proof to the **PR**. Rehearse **PECS** signatures on **public** **copy**/**merge** helpers and add **tests** that rejected **illegal** **wildcard** **writes** at **compile** **time**. **Interview angle:** Drill ends when **lint** silence matches **bytecode** evidence.
`;

export const BASIC_CODE = `package arch.day28;

/**
 * Day 28 basic: println-only generics + erasure reference card.
 */
public class Day28Basic {

    public static void main(String[] args) {
        // Erasure and compile-time vs runtime guarantees.
        System.out.println("=== Generics — compile versus runtime ===");
        System.out.println("javac proof | List<String> rejects Integer at compile time");
        System.out.println("bytecode    | List.add uses Object slot after erasure");
        System.out.println("runtime     | getClass identical for ArrayList<String|Integer>");
        System.out.println("bridge      | ACC_BRIDGE methods preserve covariant returns");
        System.out.println();

        System.out.println("=== Command reference — javap, lint, stacks ===");
        System.out.println("javap -p MyService.class     -> list ACC_BRIDGE synthetic methods");
        System.out.println("javap -c MyService.class     -> see checkcast after erased calls");
        System.out.println("javac -Xlint:unchecked       -> surface unchecked cast warnings");
        System.out.println("jcmd <pid> Thread.print      -> ClassCastException frame context");
        System.out.println("java -version                -> bridge/strip rules stable OpenJDK");
        System.out.println();

        System.out.println("=== Failure modes tied to generics ===");
        System.out.println("ClassCastException        | unchecked cast from raw or erased heap");
        System.out.println("ArrayStoreException       | varargs generic array misuse");
        System.out.println("IllegalArgumentException  | Type mismatch in reflective proxies");
        System.out.println("NoSuchMethodError         | erased signature mismatch after shading");
        System.out.println("VerifyError               | exotic bytecode generators + generics");
        System.out.println();

        System.out.println("=== Environment / CI cues ===");
        System.out.println("Fail builds on unchecked warnings in shared library modules");
        System.out.println("Ban raw public APIs via ArchUnit or Error Prone rawtypes");
        System.out.println("Document Class<T> tokens for every reflective factory");
        System.out.println("Require TypeReference patterns for nested JSON generics");
        System.out.println("Diff javap when upgrading Lombok/MapStruct annotation processors");
        System.out.println();

        System.out.println("=== Review cue ===");
        System.out.println("staff cue: grep 'List ' without type args in src/main/java");
        System.out.println("staff cue: javap -p subclasses after every covariant return PR");
        System.out.println("staff cue: PECS scan on public copyAll/fill/addAll helpers");
        System.out.println("done");
    }
}
`;

export const BASIC_OUTPUT = `=== Generics — compile versus runtime ===
javac proof | List<String> rejects Integer at compile time
bytecode    | List.add uses Object slot after erasure
runtime     | getClass identical for ArrayList<String|Integer>
bridge      | ACC_BRIDGE methods preserve covariant returns

=== Command reference — javap, lint, stacks ===
javap -p MyService.class     -> list ACC_BRIDGE synthetic methods
javap -c MyService.class     -> see checkcast after erased calls
javac -Xlint:unchecked       -> surface unchecked cast warnings
jcmd <pid> Thread.print      -> ClassCastException frame context
java -version                -> bridge/strip rules stable OpenJDK

=== Failure modes tied to generics ===
ClassCastException        | unchecked cast from raw or erased heap
ArrayStoreException       | varargs generic array misuse
IllegalArgumentException  | Type mismatch in reflective proxies
NoSuchMethodError         | erased signature mismatch after shading
VerifyError               | exotic bytecode generators + generics

=== Environment / CI cues ===
Fail builds on unchecked warnings in shared library modules
Ban raw public APIs via ArchUnit or Error Prone rawtypes
Document Class<T> tokens for every reflective factory
Require TypeReference patterns for nested JSON generics
Diff javap when upgrading Lombok/MapStruct annotation processors

=== Review cue ===
staff cue: grep 'List ' without type args in src/main/java
staff cue: javap -p subclasses after every covariant return PR
staff cue: PECS scan on public copyAll/fill/addAll helpers
done
`;

export const INTERMEDIATE_CODE = `package arch.day28;

/**
 * Day 28 intermediate: four generics production narratives (println only).
 */
public class Day28Intermediate {

    /*
     * Context: DAO returns raw List into typed DTO pipeline — CCE at Jackson boundary.
     */
    static void scenario1() {
        System.out.println("--- Scenario 1: ClassCastException after raw JDBC bridge ---");
        System.out.println("symptom: 500s only for tenants with mixed numeric SKU columns");
        System.out.println("cause:    legacy DAO returns raw List stuffed into DTO List<String>");
        System.out.println("why:      erasure allows heap pollution until checkcast fails");
        System.out.println("fix:      RowMapper<List<String>> or typed Tuple mapping at source");
        System.out.println("verify:   jcmd <pid> Thread.print shows cast to String after Object");
        System.out.println("staff:    javac -Xlint:unchecked on shared-data module fails CI");
        System.out.println("metric:  Spliterator map frames hide first illegal assignment");
        System.out.println("echo:    grep raw List returns in arch repo before blaming Jackson");
        System.out.println();
    }

    /*
     * Context: Profiler shows hot synthetic bridge methods after covariant return deploy.
     */
    static void scenario2() {
        System.out.println("--- Scenario 2: bridge methods spook on-call during flame review ---");
        System.out.println("symptom: jstack shows Repository$$Bridge method names post-Lombok bump");
        System.out.println("cause:    subclass narrowed return type so javac synthesized ACC_BRIDGE");
        System.out.println("why:      JVM dispatches erased signature then casts to specialized type");
        System.out.println("fix:      accept bridges as normal; only optimize if profiler proves hot");
        System.out.println("verify:   javap -p ServiceClient.class  (scan for ACC_BRIDGE)");
        System.out.println("staff:    javap -c shows delegate into user implementation");
        System.out.println("note:    shading tools must keep bridge pairs aligned");
        System.out.println();
    }

    /*
     * Context: Gson default parse drops nested generic map shape — LinkedTreeMap surprises.
     */
    static void scenario3() {
        System.out.println("--- Scenario 3: TypeToken forgotten on nested JSON generics ---");
        System.out.println("symptom: integration tests flip between Map and LinkedTreeMap assertions");
        System.out.println("cause:    Type erasure erased List<Row> inside outer JSON generics");
        System.out.println("why:      fromJson(String, Class) cannot witness nested parameters");
        System.out.println("fix:      new TypeToken<List<ApiRow>>(){}.getType() for read path");
        System.out.println("verify:   javap -v consumer shows constant pool TypeToken subclass");
        System.out.println("staff:    add regression JSON fixture before closing ticket");
        System.out.println("context: Java 8 diamond does not recover runtime generic shape alone");
        System.out.println();
    }

    /*
     * Context: Public API used PECS backwards so valid customer List rejected at compile.
     */
    static void scenario4() {
        System.out.println("--- Scenario 4: flipped PECS blocks legal batch ingest ---");
        System.out.println("symptom: Gradle compile errors after clients pass List<Integer> to merge");
        System.out.println("cause:    method took List<? super Number> but should extend for reads");
        System.out.println("why:      capture prevents proving producer type relation to caller");
        System.out.println("fix:      read-heavy params use List<? extends Number> per mnemonic");
        System.out.println("verify:   javac error message mentions capture#1 of ?");
        System.out.println("staff:    jstack unnecessary here — compile failure is the guardrail");
        System.out.println("metric:  API reviews checklist PECS arrow direction");
        System.out.println("echo:    pair wildcard fix with unit proving add still disallowed");
        System.out.println();
    }

    static void banner() {
        System.out.println("banner: Day28 intermediate generics lab");
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

export const INTERMEDIATE_OUTPUT = `banner: Day28 intermediate generics lab
--- Scenario 1: ClassCastException after raw JDBC bridge ---
symptom: 500s only for tenants with mixed numeric SKU columns
cause:    legacy DAO returns raw List stuffed into DTO List<String>
why:      erasure allows heap pollution until checkcast fails
fix:      RowMapper<List<String>> or typed Tuple mapping at source
verify:   jcmd <pid> Thread.print shows cast to String after Object
staff:    javac -Xlint:unchecked on shared-data module fails CI
metric:  Spliterator map frames hide first illegal assignment
echo:    grep raw List returns in arch repo before blaming Jackson

--- Scenario 2: bridge methods spook on-call during flame review ---
symptom: jstack shows Repository$$Bridge method names post-Lombok bump
cause:    subclass narrowed return type so javac synthesized ACC_BRIDGE
why:      JVM dispatches erased signature then casts to specialized type
fix:      accept bridges as normal; only optimize if profiler proves hot
verify:   javap -p ServiceClient.class  (scan for ACC_BRIDGE)
staff:    javap -c shows delegate into user implementation
note:    shading tools must keep bridge pairs aligned

--- Scenario 3: TypeToken forgotten on nested JSON generics ---
symptom: integration tests flip between Map and LinkedTreeMap assertions
cause:    Type erasure erased List<Row> inside outer JSON generics
why:      fromJson(String, Class) cannot witness nested parameters
fix:      new TypeToken<List<ApiRow>>(){}.getType() for read path
verify:   javap -v consumer shows constant pool TypeToken subclass
staff:    add regression JSON fixture before closing ticket
context: Java 8 diamond does not recover runtime generic shape alone

--- Scenario 4: flipped PECS blocks legal batch ingest ---
symptom: Gradle compile errors after clients pass List<Integer> to merge
cause:    method took List<? super Number> but should extend for reads
why:      capture prevents proving producer type relation to caller
fix:      read-heavy params use List<? extends Number> per mnemonic
verify:   javac error message mentions capture#1 of ?
staff:    jstack unnecessary here — compile failure is the guardrail
metric:  API reviews checklist PECS arrow direction
echo:    pair wildcard fix with unit proving add still disallowed

`;

export const ADVANCED_CODE = `package arch.day28;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Day 28 advanced: wildcard posture + erasure flags + checklist.
 */
public class Day28Advanced {

    record ApiPosture(String surface, String wildcardRule, int safetyScore) {}

    static List<ApiPosture> postureRows() {
        List<ApiPosture> rows = new ArrayList<>();
        rows.add(new ApiPosture("read-only return", "extends producer", 2));
        rows.add(new ApiPosture("sink parameter", "super consumer", 2));
        rows.add(new ApiPosture("internal algorithm", "named type param", 3));
        rows.add(new ApiPosture("JSON edge", "TypeToken or JavaType", 1));
        return rows;
    }

    static Map<String, Boolean> erasureFlags() {
        Map<String, Boolean> m = new LinkedHashMap<>();
        m.put("runtime instanceof List<String>", false);
        m.put("need Class<T> for reflection newInstance", true);
        m.put("bridges appear on covariant returns", true);
        m.put("raw types strip compiler proofs", true);
        return m;
    }

    public static void main(String[] args) {
        System.out.println("banner: Day28 advanced generics guardrails");
        System.out.println("scope: arch.day28 erasure + boundary matrix");
        System.out.println();
        System.out.println();

        System.out.println("=== Block 1: API posture table ===");
        for (ApiPosture r : postureRows()) {
            System.out.println(r.surface() + " | " + r.wildcardRule() + " | score=" + r.safetyScore());
        }
        System.out.println();

        System.out.println("=== Block 2: erasure truth board ===");
        int trueCount = 0;
        for (Map.Entry<String, Boolean> e : erasureFlags().entrySet()) {
            if (Boolean.TRUE.equals(e.getValue())) {
                trueCount++;
            }
            System.out.println(e.getKey() + " -> " + e.getValue());
        }
        System.out.println("trueStatements=" + trueCount);
        System.out.println();

        System.out.println("=== Block 3: merge checklist ===");
        Map<String, Boolean> checks = new LinkedHashMap<>();
        checks.put("shared modules compile with -Xlint:unchecked", false);
        checks.put("public APIs avoid raw types in signatures", true);
        checks.put("covariant services have javap bridge notes in PR", true);
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

export const ADVANCED_OUTPUT = `banner: Day28 advanced generics guardrails
scope: arch.day28 erasure + boundary matrix


=== Block 1: API posture table ===
read-only return | extends producer | score=2
sink parameter | super consumer | score=2
internal algorithm | named type param | score=3
JSON edge | TypeToken or JavaType | score=1

=== Block 2: erasure truth board ===
runtime instanceof List<String> -> false
need Class<T> for reflection newInstance -> true
bridges appear on covariant returns -> true
raw types strip compiler proofs -> true
trueStatements=3

=== Block 3: merge checklist ===
shared modules compile with -Xlint:unchecked | false
public APIs avoid raw types in signatures | true
covariant services have javap bridge notes in PR | true
pass count = 2 / 3
eof
`;

export const PITFALLS = [
  "Shipping **public** **DAO** **methods** that **return** **raw** **List** into a **pipeline** typed as **List**\<**DTO**\> — production **symptom** is **ClassCastException** inside **Jackson** or **MapStruct** frames after **numeric** **columns** slip through **JdbcTemplate**; fix by **typed** **RowMapper** and **fail** **CI** on **-Xlint:unchecked**; verify with **jcmd** **Thread.print** reading **checkcast** targets at the **faulting** **line**.",
  "Declaring **API** **Parameters** as **List**\<**\?** **super** **Integer**\> when the **method** only **reads** **elements** — production **symptom** is **compile**-**time** **API** **revolts** where **callers** hold **List**\<**Number**\>; fix by switching to **List**\<**\?** **extends** **Number**\> per **PECS**; verify by **javac** **error** text referencing **capture** of **wildcard**.",
  "Using **Class**\<**T**\> **newInstance** without **erase**-**safe** **bounds** after **library** upgrades — production **symptom** is **IllegalAccessException** or **NoSuchMethodError** when **module** opens or **constructors** change; fix by **getDeclaredConstructor** + **setAccessible** policy or **Spring** **Objenesis** patterns; verify with **javap** **-p** on **generated** **subclasses** and **integration** tests.",
  "Creating **generic** **varargs** **helpers** without **@SafeVarargs** and then **widening** arrays — production **symptom** is **ArrayStoreException** on **rare** **paths** after **unchecked** **writes** into **Object**[] backing **arrays**; fix by copying into **ArrayList**\<**T**\> internally or marking **final** **methods** **@SafeVarargs** after audit; verify with **SpotBugs** **VA** warnings and **stress** fuzz tests.",
  "Assuming **instanceof** **List**\<**String**\> works at **runtime** for **guard** clauses — production **symptom** is **IllegalArgumentException** from **framework** **validators** that **mirror** this mistake; fix by passing **Class**\<**\?**\> tokens or **Pattern** matching on **reified** **shapes**; verify with **javac** refusing **illegal** **generic** **instanceof** forms at **compile** time already.",
  "Mixing **Lombok** **@Builder** **generics** with **Maven** **shade** relocations that drop **bridge** **methods** — production **symptom** is **AbstractMethodError** or **IncompatibleClassChangeError** during **canary** **defineClass**; fix by aligning **shade** rules or upgrading **plugins**; verify with **javap** **-p** **diff** on **canary** versus **baseline** **jars**.",
  "Publishing **Map**\<**String**,**\?**\> **everywhere** to avoid thinking about **wildcards** — production **symptom** is **unsafe** **puts** of **wrong** **value** types that surface as **CCE** deep in **consumers**; fix with **bounded** **type** **variables** or **sealed** **DTO** **hierarchy**; verify **ArchUnit** **layer** checks and **mutation** tests.",
  "Suppressing **unchecked** **casts** globally with **@SuppressWarnings** on **modules** — production **symptom** is silent **heap** **pollution** until **high** **cardinality** tenants hit edge **JSON**; fix by scoping **suppress** to **three**-**line** **methods** plus **comment** rationale; verify **CodeQL** or **Error** **Prone** on **CI** still flags **broad** **suppress**.",
];

export const EXERCISE_PROBLEM = [
  "You harden **config** **ingest** after **on-call** found a **ClassCastException** from a **List** that was not actually **List**\<**String**\>; reviewers demand a **reified** **witness** for **reflection**-**light** **cells**.",
  "",
  "Requirements:",
  "1. Implement **arch.day28.Day28Exercise** with **public static void main(String[] args)** printing two legend lines starting **erasure:** and **token:** (each under 140 chars) explaining non-reified **List**\<**String**\> versus **Class**\<**String**\> witness usage.",
  "2. Add **static** **final** **class** **TypedCell**\<**T**\> with **private** **final** **Class**\<**T**\> **type**, **private** **final** **List**\<**T**\> **items** initialized as **new** **ArrayList**\<\>(), and **constructor** **TypedCell(Class**\<**T**\> type)** storing the token.",
  "3. Provide **void add(T v)** appending to **items** and **List**\<**T**\> **snapshot()** returning **List.copyOf(items)**.",
  "4. In **main**, build **TypedCell**\<**String**\> with **String.class**, **add** **north** and **south**, print **type=** plus simple name, print **snap=** plus **snapshot**, end with **done** line.",
].join("\n");

export const EXERCISE_HINTS = [
  "**TypedCell** must keep **Class**\<**T**\> because **runtime** cannot recover **T** from an empty **ArrayList** alone.",
  "**List.copyOf** gives **callers** an **immutable** **view** after you finish **mutation** inside **add**.",
  "Use **final** **String** **literals** for **legend** lines so output stays deterministic in reviews.",
];

export const EXERCISE_SOLUTION = `package arch.day28;

import java.util.ArrayList;
import java.util.List;

/**
 * Day 28 exercise: reified Class token cell with erased list storage.
 */
public class Day28Exercise {

    static final class TypedCell<T> {
        private final Class<T> type;
        private final List<T> items = new ArrayList<>();

        TypedCell(Class<T> type) {
            this.type = type;
        }

        void add(T v) {
            items.add(v);
        }

        Class<T> type() {
            return type;
        }

        List<T> snapshot() {
            return List.copyOf(items);
        }
    }

    static void printLegend() {
        final String erasure =
                "erasure: List<String> metadata vanishes at runtime except for inserted casts.";
        final String token =
                "token: Class<String> carries a reified witness for reflection-safe cells.";
        System.out.println(erasure);
        System.out.println(token);
    }

    public static void main(String[] args) {
        printLegend();
        TypedCell<String> cell = new TypedCell<>(String.class);
        cell.add("north");
        cell.add("south");
        System.out.println("type=" + cell.type().getSimpleName());
        System.out.println("snap=" + cell.snapshot());
        System.out.println("done");
    }
}
`;

export const JOB_SWITCH = {
  resumeBullet:
    "Eliminated raw JDBC Lists; enabled -Xlint:unchecked gates; cut generic CCEs to zero over 2 quarters.",
  interviewPositioning:
    "When interviewers probe **generics**, you explain **erasure**, **bridges**, **PECS**, and **Class**\<**T**\> tokens. In week one at a new company you **grep** **raw** **List**/**Map** in **shared** modules, **fail** **CI** on **unchecked** warnings, and attach **javap -p** diffs for **covariant** **service** **returns**.",
  starAnchor:
    "Situation: **catalog** service threw **ClassCastException** after **SKU** **migration** mixed numeric and string IDs. Task: restore **SLA** without reverting **data** **model**. Action: traced **raw** **List** from **legacy** **JdbcTemplate** helpers, added **typed** **RowMapper**\<**List**\<**String**\>\>, enabled **-Xlint:unchecked** as **error** in **gradle**, documented **TypeToken** for **nested** **JSON**. Result: **zero** **CCE** incidents in **9** **months**; **on-call** **pages** for **serialization** fell **70** **percent**.",
};

export const CHEATSHEET_CONTENT = `| Concept | Quick rule | Example / Command |
|---------|------------|---------------------|
| **Erasure** | **Compile** proofs vanish | **List** raw at runtime |
| **PECS** | **extends** read / **super** write | **copy(src,dst)** signature |
| **Bridge** | **Covariant** returns | **javap -p** **ACC_BRIDGE** |
| **Raw** type | No **type** args | **ClassCastException** risk |
| **Wildcard** **capture** | Fresh type per **assign** | **javac** capture#1 errors |
| **Class**\<**T**\> | **Reified** token | **Spring** **ResolvableType** |
| **SafeVarargs** | **Final** **method** guard | **Heap** pollution audit |
| **TypeToken** | **Nested** **JSON** shape | **Gson** pattern |
| **Diamond** \<\> | **Java** **7** inference | \`new ArrayList<>()\` |
| **Reifiable** | **Arrays** care | **new** **T**[] illegal |
| **javap** | Prove **synthetics** | **javap -c** **Subclass** |
| **lint** | Surface **unchecked** | **-Xlint:unchecked** |
`;

export const WRONG_ANSWERS = [
  "List<String> and List<Integer> have different runtime Class objects you can compare with ==.",
  "Wildcards ? super T are ideal for every read-only API because they are the most flexible possible signature.",
  "Bridge methods mean javac failed and you should delete them manually from class files.",
  "You can safely write new T() inside a generic class if T extends Object because the JVM knows T at runtime.",
  "Raw types are recommended for Spring beans to avoid classpath scanning overhead.",
  "PECS does not apply to method return types—only parameters ever need wildcards.",
  "Type erasure was removed in Java 8 so streams carry full generic metadata at runtime.",
  "SuppressWarnings(\"unchecked\") on a module is best practice to keep Gradle output clean.",
];
