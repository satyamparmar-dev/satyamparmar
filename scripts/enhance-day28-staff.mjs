/**
 * Day 28 — staff enhancement for public/data/days/phase4-day28.json
 * (day 28 is phase4-day28.json; phase1-day28.json does not exist in repo).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const JSON_PATH = path.join(ROOT, "public", "data", "days", "phase4-day28.json");

const WHY_CONTENT = `At 01:44 your **Spring Boot** catalog pod logs **ClassCastException: java.lang.Long cannot be cast to java.lang.String** three frames below **ObjectMapper.readValue** while a DTO field still says **List<String>** for SKUs. A **JdbcTemplate** helper returns a **raw** **List** after PR SKU-218 swapped a typed **RowMapper** for a **Map**-shaped shortcut. Only some tenants mix numeric and text IDs, so **on-call** greps the CSV first and blames data. **Erasure** means **javac** could not insert **checkcast** at the **raw** assignment, so the heap quietly holds **Long** values where **String** was promised. **Jackson** enforces **String** later, and the stack looks like the mapper broke when the JDBC edge was untyped. That story is why this lesson exists: **generics** are not labels you add for style; they are the proof chain the compiler needs before **I/O** crosses team boundaries.

If you are newer to Java, treat **List<String>** as homework your IDE and **javac** do for you before **main** runs. **Generics** block obvious **add** mistakes. They are not a second copy of the type living in every **Object** on the heap. When someone uses a **raw** **List**, the app still boots. The failure waits for the wrong tenant row. That delay scares freshers: the test passed locally because every fixture used text SKUs. It is normal, and it is why you learn **unchecked** warnings are debt, not noise.

When you already ship features, interviewers listen for consequences, not slogans. A weak answer blames **Jackson**. A strong answer names **heap pollution**, **erasure**, and a frame under **readValue** that finally executes **checkcast** to **java.lang.String**. You say you diffed **jcmd** **Thread.print**, proved a **Long** sat in the collection, restored **RowMapper**<**List**<**String**>>, and made **javac** **-Xlint:unchecked** fail CI on shared **library** modules. When a team of ten gets this wrong, you also see **NoSuchMethodException** from reflective helpers that lost their **Class**<**T**> witness, or **ArrayStoreException** after **@SafeVarargs** let an **Object**[] escape into long-lived storage. Both look like flaky tests or corrupt feeds; they are **reified** arrays colliding with erased proofs.

When you lead an **API** squad, walk your people through four steps every time this topic comes up in review or incident chat. Step one, say what **javac** still proves at the call site: a named **T**, a **wildcard** capture, or nothing because someone used a **raw** export. Step two, when **jstack** shows **$$Bridge**, run **javap -p** on the exact class and read **ACC_BRIDGE** next to real code so nobody rolls back a harmless processor bump. Step three, lock **wildcard** direction with **PECS** before you widen signatures, producer **extends**, consumer **super**, because reversed polarity rejects legal callers at compile time. Step four, verify on a canary with **jcmd** **Thread.print** so you see the receiver at the failing **checkcast**. Fifty microservices share one sloppy util **JAR**: **staging** tenants differ from **prod**, so the bug hides until the wrong path rolls out.

At Staff depth, separate folklore from JVM behavior with one precise version fact. **Java 5** shipped **erasure** so **List**<**String**> and **List**<**Integer**> still share **java.util.ArrayList** at runtime **getClass()** time. **Java 7** added **diamond** **<>** so constructors infer context. **Java 17** and **Java 21** still synthesize **bridge** methods for covariant returns; **MapStruct** upgrades can rename **synthetic** frames in **jstack** without changing correctness, so you prove behavior with **javap**, not panic.

In your first six months at a new company this theme follows you everywhere. You block a PR that pipes **List** without angle brackets into **Stream** code: you turn on **Error Prone** **rawtypes** and paste the warning text into the thread. You calm a **ClassCastException** after a dependency bump: you diff **javap -p** bridge lists between artifacts instead of rumor. You rescue nested **JSON**: you add **TypeReference** or **TypeToken**, then add a contract test that fails if **LinkedHashMap** shows up where a typed row was promised. Small habits, big safety.`;

const THEORY_INSERT =
  "### Generics in plain Java code (fresher walkthrough)\n\n" +
  "A **generic** **class** carries a type parameter such as **T** so you can reuse one **Box** for **String**, **Integer**, or a **DTO** without copying source. When you declare **Box<String>**, **javac** checks that every **return** and **parameter** that mentions **T** lines up with **String**; at bytecode level an unbounded **T** still erases to **java.lang.Object**, which is why generic **instanceof** tests such as `List<String>` are illegal at compile time. In week one you mostly read **List** on **Collections** APIs and trust the compiler to reject bad **add** calls.\n\n" +
  "```java\n" +
  "public final class Box<T> {\n" +
  "    private final T value;\n" +
  "    public Box(T value) { this.value = value; }\n" +
  "    public T get() { return value; }\n" +
  "}\n" +
  "```\n\n" +
  "**Interview angle:** Ask the candidate to point at **T** in the source versus **Object** in `javap -c` output to prove they understand **erasure** without buzzwords.\n\n";

const THEORY_TECH_LEAD_INSERT =
  "### **PECS** decisions you defend in design review (Technical Lead band)\n\n" +
  "You read the **API** like a contract. Outputs that only flow data out get **? extends T**. Inputs that must accept **T** subtypes for writes get **? super T**. If you flip them, **javac** blocks good callers or opens unsafe writes. You write that rule on the **wiki** so juniors stop debating it in chat. **Interview angle:** Listen for **PECS** tied to read versus write paths, not memorized letters.\n\n" +
  "### How you explain **erasure** to stakeholders without losing the room (Technical Lead band)\n\n" +
  "You say the compiler checks types before shipping, but the running **JVM** often sees **Object** slots for **List** elements. You explain that **JSON** mappers need extra **TypeReference** glue when **List** nests inside **List**. You promise guardrails: **-Xlint:unchecked** on **library** builds and **ArchUnit** banning **raw** exports. **Interview angle:** Reward calm storytelling that names one customer-visible risk and one guardrail.\n\n";

const BASIC_CODE =
  "package arch.day28;\n\n" +
  "/**\n" +
  " * Day 28 basic: println-only reference for fresher through staff readers.\n" +
  " */\n" +
  "public class Day28Basic {\n\n" +
  "    public static void main(String[] args) {\n" +
  "        // Core idea: javac proves List<String>; JVM still loads erased List descriptors.\n" +
  "        System.out.println(\"=== Core concept table ===\");\n" +
  "        System.out.println(\"scope    | this file is println-only — no collections or loops\");\n" +
  "        System.out.println(\"List<String> compile | javac rejects list.add(Integer.valueOf(1))\");\n" +
  "        System.out.println(\"List.add bytecode   | descriptor still takes java.lang.Object\");\n" +
  "        System.out.println(\"getClass runtime    | same ArrayList class for String and Integer lists\");\n" +
  "        System.out.println(\"covariant return    | triggers ACC_BRIDGE synthetic methods\");\n" +
  "        System.out.println();\n\n" +
  "        // How to use the idea in week one: commands and flags you can copy from docs.\n" +
  "        System.out.println(\"=== How to use it (commands and flags) ===\");\n" +
  "        System.out.println(\"javap -p Service.class       list ACC_BRIDGE synthetic methods\");\n" +
  "        System.out.println(\"javap -c Service.class       inspect checkcast after erased calls\");\n" +
  "        System.out.println(\"javac -Xlint:unchecked       surface unchecked warnings in modules\");\n" +
  "        System.out.println(\"jcmd <pid> Thread.print      frame context around ClassCastException\");\n" +
  "        System.out.println(\"java -version                confirm JDK family for bridge expectations\");\n" +
  "        System.out.println();\n\n" +
  "        // Errors beginners blame on data but seniors tie to erased boundaries.\n" +
  "        System.out.println(\"=== Common beginner mistakes (symptoms) ===\");\n" +
  "        System.out.println(\"ClassCastException        heap saw Long where String was promised\");\n" +
  "        System.out.println(\"ArrayStoreException       varargs generic array took wrong runtime type\");\n" +
  "        System.out.println(\"ClassCastException gson   LinkedTreeMap cast to Row without TypeToken\");\n" +
  "        System.out.println(\"AbstractMethodError shade bridge pair missing after jar relocation\");\n" +
  "        System.out.println();\n\n" +
  "        // Remember-this block before interview or on-call.\n" +
  "        System.out.println(\"=== Remember this ===\");\n" +
  "        System.out.println(\"PECS     | producer extends | consumer super\");\n" +
  "        System.out.println(\"Raw List | strips compile proofs | ban in new public APIs\");\n" +
  "        System.out.println(\"Erasure  | Class<T> or TypeToken carries lost nested shapes\");\n" +
  "        System.out.println(\"staff cue| grep 'List ' without angle brackets before blaming Jackson\");\n" +
  "        System.out.println(\"staff cue| diff javap -p after MapStruct upgrades\");\n" +
  "        System.out.println(\"staff cue| require TypeReference for nested JSON in code review\");\n" +
  "        System.out.println(\"eof\");\n" +
  "    }\n" +
  "}\n";

const BASIC_OUTPUT =
  "=== Core concept table ===\n" +
  "scope    | this file is println-only — no collections or loops\n" +
  "List<String> compile | javac rejects list.add(Integer.valueOf(1))\n" +
  "List.add bytecode   | descriptor still takes java.lang.Object\n" +
  "getClass runtime    | same ArrayList class for String and Integer lists\n" +
  "covariant return    | triggers ACC_BRIDGE synthetic methods\n\n" +
  "=== How to use it (commands and flags) ===\n" +
  "javap -p Service.class       list ACC_BRIDGE synthetic methods\n" +
  "javap -c Service.class       inspect checkcast after erased calls\n" +
  "javac -Xlint:unchecked       surface unchecked warnings in modules\n" +
  "jcmd <pid> Thread.print      frame context around ClassCastException\n" +
  "java -version                confirm JDK family for bridge expectations\n\n" +
  "=== Common beginner mistakes (symptoms) ===\n" +
  "ClassCastException        heap saw Long where String was promised\n" +
  "ArrayStoreException       varargs generic array took wrong runtime type\n" +
  "ClassCastException gson   LinkedTreeMap cast to Row without TypeToken\n" +
  "AbstractMethodError shade bridge pair missing after jar relocation\n\n" +
  "=== Remember this ===\n" +
  "PECS     | producer extends | consumer super\n" +
  "Raw List | strips compile proofs | ban in new public APIs\n" +
  "Erasure  | Class<T> or TypeToken carries lost nested shapes\n" +
  "staff cue| grep 'List ' without angle brackets before blaming Jackson\n" +
  "staff cue| diff javap -p after MapStruct upgrades\n" +
  "staff cue| require TypeReference for nested JSON in code review\n" +
  "eof\n";

const INTERMEDIATE_CODE =
  "package arch.day28;\n\n" +
  "/**\n" +
  " * Day 28 intermediate: four on-call style generics narratives (println only).\n" +
  " * Real prod teams blame Jackson or Gradle when JDBC raw Lists or wildcards are the real fault.\n" +
  " * MapStruct bumps rename synthetic bridges—always diff javap before rollback.\n" +
  " *\n" +
  " * Mid-level readers should rehearse each scenario as a ticket narrative:\n" +
  " * capture the command that proved root cause, paste javap snippets, and link the PR.\n" +
  " * Generics incidents rarely throw during unit tests—they appear under mixed tenant data.\n" +
  " * Keep scenario titles aligned with log lines your lead will search in Splunk or ELK.\n" +
  " *\n" +
  " * When you escalate, attach JVM version (java -version) because bridge behavior is stable\n" +
  " * across LTS lines but warning text differs between javac releases and IDE inspectors.\n" +
  " *\n" +
  " * Remember: flipped PECS is cheaper to fix at compile time than rewriting APIs later.\n" +
  " */\n" +
  "public class Day28Intermediate {\n\n" +
  "    // Scenario 1 hook: raw JDBC Lists are the silent author of Jackson ClassCastException stacks.\n" +
  "    static void scenario1() {\n" +
  "        System.out.println(\"--- Scenario 1: DTO hydration blows up after raw JDBC List ---\");\n" +
  "        System.out.println(\"symptom:  HTTP 500 only for tenants with mixed numeric SKU identifiers\");\n" +
  "        System.out.println(\"cause:    DAO returned raw List and caller treated it as List<String>\");\n" +
  "        System.out.println(\"why:      erasure skipped checkcasts until Jackson readValue enforced String\");\n" +
  "        System.out.println(\"fix:      JdbcTemplate.query with RowMapper<List<String>> or parser at JDBC edge\");\n" +
  "        System.out.println(\"verify:   jcmd <pid> Thread.print shows checkcast to java.lang.String after Object\");\n" +
  "        System.out.println(\"next:     grep raw List in DAO package; attach RowMapper diff to ticket\");\n" +
  "        System.out.println();\n" +
  "    }\n\n" +
  "    // Scenario 2 hook: diff javap before rolling back a MapStruct upgrade.\n" +
  "    static void scenario2() {\n" +
  "        System.out.println(\"--- Scenario 2: Lombok bump lit up Repository$$Bridge in profiler ---\");\n" +
  "        System.out.println(\"symptom:  jstack shows CovariantClient$$Bridge during MapStruct-heavy requests\");\n" +
  "        System.out.println(\"cause:    narrowed generic return forced javac to synthesize ACC_BRIDGE methods\");\n" +
  "        System.out.println(\"why:      JVM calls erased signature then bridges cast to specialized return type\");\n" +
  "        System.out.println(\"fix:      keep upgrade when javap diff only adds expected synthetic bridges\");\n" +
  "        System.out.println(\"verify:   javap -p ClientImpl.class and scan method flags for ACC_BRIDGE\");\n" +
  "        System.out.println(\"next:     jcmd <pid> JFR.start duration=300s if CPU regression must be quantified\");\n" +
  "        System.out.println();\n" +
  "    }\n\n" +
  "    // Scenario 3 hook: nested JSON always needs a TypeToken or JavaType witness.\n" +
  "    static void scenario3() {\n" +
  "        System.out.println(\"--- Scenario 3: Gson drops nested List<Row> inside ApiEnvelope JSON ---\");\n" +
  "        System.out.println(\"symptom:  ClassCastException: LinkedTreeMap cannot be cast to Row in IT suite\");\n" +
  "        System.out.println(\"cause:    gson.fromJson(payload, ApiEnvelope.class) erases nested List<Row>\");\n" +
  "        System.out.println(\"why:      Class literal cannot carry ParameterizedType for inner generics\");\n" +
  "        System.out.println(\"fix:      new TypeToken<ApiEnvelope<List<Row>>>(){}.getType() for HTTP client read\");\n" +
  "        System.out.println(\"verify:   javap -v EnvelopeParser$1.class shows Signature attribute intact\");\n" +
  "        System.out.println(\"next:     add CI rule blocking Class literal for nested generic JSON reads\");\n" +
  "        System.out.println();\n" +
  "    }\n\n" +
  "    // Scenario 4 hook: flipped PECS belongs in API review, not midnight paging.\n" +
  "    static void scenario4() {\n" +
  "        System.out.println(\"--- Scenario 4: ingest API used List<? super Number> for a read-only aggregator ---\");\n" +
  "        System.out.println(\"symptom:  Gradle compileJava fails when clients pass List<Integer> to mergeTotals\");\n" +
  "        System.out.println(\"cause:    ? super Number marks a consumer sink but method never called add\");\n" +
  "        System.out.println(\"why:      capture of ? cannot prove List<Integer> is valid argument type\");\n" +
  "        System.out.println(\"fix:      read-only parameters should be List<? extends Number> per PECS\");\n" +
  "        System.out.println(\"verify:   ./gradlew compileJava --info and confirm capture#1 error disappeared\");\n" +
  "        System.out.println(\"next:     publish PECS one-pager next to every public Collection parameter\");\n" +
  "        System.out.println();\n" +
  "    }\n\n" +
  "    public static void main(String[] args) {\n" +
  "        System.out.println(\"banner: Day28 intermediate arch.day28\");\n" +
  "        System.out.println();\n" +
  "        scenario1();\n" +
  "        scenario2();\n" +
  "        scenario3();\n" +
  "        scenario4();\n" +
  "    }\n" +
  "}\n";

const INTERMEDIATE_OUTPUT =
  "banner: Day28 intermediate arch.day28\n\n" +
  "--- Scenario 1: DTO hydration blows up after raw JDBC List ---\n" +
  "symptom:  HTTP 500 only for tenants with mixed numeric SKU identifiers\n" +
  "cause:    DAO returned raw List and caller treated it as List<String>\n" +
  "why:      erasure skipped checkcasts until Jackson readValue enforced String\n" +
  "fix:      JdbcTemplate.query with RowMapper<List<String>> or parser at JDBC edge\n" +
  "verify:   jcmd <pid> Thread.print shows checkcast to java.lang.String after Object\n" +
  "next:     grep raw List in DAO package; attach RowMapper diff to ticket\n\n" +
  "--- Scenario 2: Lombok bump lit up Repository$$Bridge in profiler ---\n" +
  "symptom:  jstack shows CovariantClient$$Bridge during MapStruct-heavy requests\n" +
  "cause:    narrowed generic return forced javac to synthesize ACC_BRIDGE methods\n" +
  "why:      JVM calls erased signature then bridges cast to specialized return type\n" +
  "fix:      keep upgrade when javap diff only adds expected synthetic bridges\n" +
  "verify:   javap -p ClientImpl.class and scan method flags for ACC_BRIDGE\n" +
  "next:     jcmd <pid> JFR.start duration=300s if CPU regression must be quantified\n\n" +
  "--- Scenario 3: Gson drops nested List<Row> inside ApiEnvelope JSON ---\n" +
  "symptom:  ClassCastException: LinkedTreeMap cannot be cast to Row in IT suite\n" +
  "cause:    gson.fromJson(payload, ApiEnvelope.class) erases nested List<Row>\n" +
  "why:      Class literal cannot carry ParameterizedType for inner generics\n" +
  "fix:      new TypeToken<ApiEnvelope<List<Row>>>(){}.getType() for HTTP client read\n" +
  "verify:   javap -v EnvelopeParser$1.class shows Signature attribute intact\n" +
  "next:     add CI rule blocking Class literal for nested generic JSON reads\n\n" +
  "--- Scenario 4: ingest API used List<? super Number> for a read-only aggregator ---\n" +
  "symptom:  Gradle compileJava fails when clients pass List<Integer> to mergeTotals\n" +
  "cause:    ? super Number marks a consumer sink but method never called add\n" +
  "why:      capture of ? cannot prove List<Integer> is valid argument type\n" +
  "fix:      read-only parameters should be List<? extends Number> per PECS\n" +
  "verify:   ./gradlew compileJava --info and confirm capture#1 error disappeared\n" +
  "next:     publish PECS one-pager next to every public Collection parameter\n\n";

const PITFALL_ITEMS = [
  "// Fresher pitfalls",
  "Copy-pasting tutorial code that declares **List** without **<Type>** on a **new** field — **javac** may compile with unchecked warnings while **add** calls silently accept wrong types until **Jackson** throws **ClassCastException** during serialization; fix by always writing **List<String>** (or your DTO type) in fields and method returns; verify with **javac -Xlint:unchecked** on the module and fix every raw warning.",
  "Believing **List<Object>** can hold a **List<String>** because **String** extends **Object** — assignment fails at **compile** time because generics are **invariant**; fix by using **List<? extends Object>** or the concrete **List<String>** your API truly needs; verify by reading the **javac** error about incompatible types, not by casting at runtime.",
  "Trying **if (x instanceof List<String>)** — **javac** rejects illegal **reified** generic **instanceof** tests; symptom is you never reach runtime because the code does not build; fix by switching to **List**<?> + **Class**<**?>** tokens or pattern matching on elements instead; verify with a clean **javac** compile on **Java 17** using preview features only when justified.",
  "// Mid-level pitfalls",
  "Publishing **public** **DAO** methods that return **raw** **List** into pipelines typed as **List<DTO>** — production symptom is **ClassCastException** inside **Jackson** after numeric JDBC columns populate **Long** where **String** was assumed; fix with **RowMapper<List<String>>** and ban raw exports via **ArchUnit**; verify **jcmd** **Thread.print** shows **checkcast** to **String** above the fault.",
  "Declaring an API **List<? super Integer>** when the method only **reads** sums — legal callers with **List<Number>** are rejected at **compile** time; flip to **List<? extends Number>** per **PECS** for read-only aggregation; verify **./gradlew compileJava** succeeds for integration tests that pass **List<Integer>**.",
  "Mixing **HashMap** of **raw** nested **List** values inside a **Spring** **cache** layer — tenants see **ClassCastException** only on warm-cache paths; fix by typing the cache value as **List<ProductDto>** and evicting on schema change; verify with **jmap** **-histo:live** and reproduction tenant toggles plus **javac** unchecked clean build.",
  "// Staff pitfalls",
  "Letting **maven-shade-plugin** relocate **MapStruct** or **Lombok** packages so **ACC_BRIDGE** pairs desync — canary throws **AbstractMethodError** during **invokeinterface** even though **javac** succeeded; fix by excluding processor output packages from relocation or splitting mapper jars; verify nightly **javap -p** diff of fat jars vs thin modules.",
  "Shipping **@SafeVarargs** helpers that leak the **Object[]** created for **generic** **varargs** into long-lived **static** fields — rare **ArrayStoreException** after batch jobs mix element types; fix by copying into **List<T>** internally and banning field storage of vararg arrays; verify with **SpotBugs** **VA** rules and chaos tests on mixed payloads.",
];

const CHEATSHEET_CONTENT =
  "| Level | Concept | The rule in one line | Example or Command |\n" +
  "| --- | --- | --- | --- |\n" +
  "| Fresher | **List<T>** | **javac** proves what you **add** | `List<String> names = new ArrayList<>();` |\n" +
  "| Fresher | **diamond** **<>** | repeat types only when you must | `new ArrayList<>()` |\n" +
  "| Fresher | **raw** **List** | strips compiler proofs | ban in new **public** **API** |\n" +
  "| Senior Dev | **erasure** | **T** becomes **Object** or bound in bytecode | `javap -c Box.class` |\n" +
  "| Senior Dev | **PECS** read path | producer uses **extends** | `List<? extends Number> sums()` |\n" +
  "| Senior Dev | **PECS** write path | consumer uses **super** | `void fill(List<? super Integer> sink)` |\n" +
  "| Senior Dev | **invariance** | containers do not widen like elements | fix with **wildcard**, not cast |\n" +
  "| Tech Lead | **unchecked** debt | shared libs fail build on noise | `javac -Xlint:unchecked -Werror` |\n" +
  "| Tech Lead | **API** review | draw read vs write arrows before **wildcard** | wiki **PECS** checklist |\n" +
  "| Tech Lead | **JSON** edge | **Class** literal drops nested **List** shape | `TypeToken` / **JavaType** |\n" +
  "| Staff | **bridge** methods | **JVM** needs **ACC_BRIDGE** for covariant return | `javap -p Impl.class` |\n" +
  "| Staff | heap pollution | **raw** assign poisons typed field | `jcmd <pid> Thread.print` |\n" +
  "| Staff | shade relocations | can break **bridge** pairs | `javap -p` fat **JAR** nightly |\n" +
  "| Staff | **SafeVarargs** | arrays stay **reified** after **varargs** | watch **ArrayStoreException** |\n";

const FRESHER_EXERCISE = {
  type: "exercise",
  title: "Exercise — generic Box (fresher)",
  audience: "fresher",
  difficulty: "Beginner",
  problem:
    "Practice a tiny generic class so **T** stops feeling magical.\n\n" +
    "1. Create **arch.day28.Day28FresherExercise** with a **static** nested **Holder<T>** storing one **T** via constructor and **get()**.\n" +
    "2. In **main**, build **Holder<String>** with literal **\"sku\"**, print **get()**.\n" +
    "3. Build **Holder<Integer>** with **42**, print **get()**.\n" +
    "4. Print one line explaining in plain English that both holders share **erased** bytecode for **get**.",
  hints: [
    "**Holder** can be `static class Holder<T> { private final T v; ... }` — keep it small.",
    "Use **System.out.println** only; no collections or file I/O.",
    "The last line can be a fixed teaching string about **Object** slots after erasure.",
  ],
  solution: `// Namespace groups this drill with other arch.day28 samples.
package arch.day28;

/**
 * Fresher exercise: smallest generic holder so erasure feels concrete.
 */
// Runnable class the JVM launches via main below.
public class Day28FresherExercise {

    // Nested static generic type keeps the example in one file for beginners.
    static final class Holder<T> {
        // Field stores the single payload the holder wraps.
        private final T value;

        // Constructor captures the caller's value into the final field.
        Holder(T value) {
            // Assign once; generics still erase to Object for unbounded T in bytecode.
            this.value = value;
        }

        // Accessor returns T; javac tracks String vs Integer at call sites.
        T get() {
            // The same get() bytecode works for both String and Integer holders.
            return value;
        }
    }

    public static void main(String[] args) {
        // Entry point required by JVM; no args used so output stays identical everywhere.
        // Build a Holder parameterized with String; diamond infers the constructor type.
        Holder<String> sku = new Holder<>("sku");
        // Prints the String payload to prove get() returns the stored generic type.
        System.out.println(sku.get());

        // Second holder uses Integer autoboxing; still one generic class at runtime.
        Holder<Integer> qty = new Holder<>(42);
        // Prints 42 to show Integer specialization without duplicating source code.
        System.out.println(qty.get());

        // Teaching line states the JVM view: unbounded T erases to java.lang.Object.
        System.out.println("teaching: unbounded T erases to java.lang.Object in bytecode for Holder.get");
    }
}
`,
};

const STAFF_EXERCISE = {
  type: "exercise",
  title: "Exercise — catalog SKU cast triage (staff)",
  audience: "staff",
  difficulty: "Advanced",
  problem:
    "Your **Spring** catalog service throws **ClassCastException: Long cannot be cast to String** inside **readValue** only for tenants whose **SKU** feed mixes numeric and textual IDs after a **JdbcTemplate** helper refactor.\n\n" +
    "1. Model three JDBC rows as **String** descriptions (**row_ok**, **row_bad**, **row_noise**) where **row_bad** simulates a **Long** cell smuggled into a **List<String>** slot.\n" +
    "2. Build a deterministic **Map** of symptom -> recommended first command (**jcmd** **Thread.print**, **javac** **-Xlint:unchecked**, **javap** **-p**) as strings.\n" +
    "3. Print a triage line for **row_bad** naming the **root JVM/Java mechanism** (erasure + heap pollution) without using randomness.\n" +
    "4. Print the **fix** pattern (**RowMapper**<List<String>> at JDBC boundary) and the **verify** step (**gradle** compile with warnings as errors).\n" +
    "5. Emit a **prevention** line referencing **ArchUnit** raw **List** ban in public packages.",
  hints: [
    "Keep every **Map** entry as `LinkedHashMap` literals with `put` in **main**—deterministic order matters for reviewers.",
    "You are not simulating JDBC I/O—**println** narratives are enough if they name real tooling.",
    "Tie **row_bad** explicitly to **checkcast** inside **Jackson**, not to **GC** tuning.",
  ],
  solution: `package arch.day28;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Staff exercise: printable triage card for generic heap pollution behind Jackson frames.
 *
 * Rows are symbolic—real JDBC would query ResultSet, but println keeps CI deterministic.
 * Ordered LinkedHashMap preserves the teaching narrative from healthy to noisy tenants.
 * Each command string names a tool you would run before proposing a rollback.
 * The mechanism line restates erasure + heap pollution without blaming product data.
 * Fix/verify/prevention mirror what you would document in a blameless postmortem.
 */
public class Day28StaffExercise {

    public static void main(String[] args) {
        final String rowOk = "row_ok:string_sku";
        final String rowBad = "row_bad:long_sku_pollutes_List_String";
        final String rowNoise = "row_noise:tenant_toggle";

        Map<String, String> symptomToCommand = new LinkedHashMap<>();
        symptomToCommand.put(rowOk, "jcmd <pid> Thread.print (baseline healthy tenant)");
        symptomToCommand.put(rowBad, "javac -Xlint:unchecked on shared-data + jcmd Thread.print on failing tenant");
        symptomToCommand.put(rowNoise, "javap -p CatalogMapper.class to diff bridges after processor bump");

        System.out.println("=== Modeled JDBC rows ===");
        for (Map.Entry<String, String> e : symptomToCommand.entrySet()) {
            System.out.println(e.getKey() + " -> first tool: " + e.getValue());
        }

        System.out.println("=== Triage for row_bad ===");
        System.out.println("mechanism: erasure let raw List from JdbcTemplate land in List<String> DTO field until Jackson readValue emitted checkcast to String");

        System.out.println("=== Fix pattern ===");
        System.out.println("fix: replace Map row extract with RowMapper<List<String>> or parse Object cells to String before DTO");

        System.out.println("=== Verify ===");
        System.out.println("verify: ./gradlew compileJava with -Werror on unchecked in shared modules + rerun canary tenant suite");

        System.out.println("=== Prevention ===");
        System.out.println("prevention: ArchUnit rule banning raw List/Map in arch.catalog public packages + PR template checklist");

        // Staff extension: name the JVM mechanism once more for interview drills.
        System.out.println("=== JVM recap ===");
        System.out.println("javac erased List element type at JDBC boundary; Jackson enforced String with checkcast");
        System.out.println("see also: Java SE 17 Language Specification sections on erasure and synthetic bridges");
        System.out.println("see also: jcmd Man page for Thread.print usage on Linux and Windows JDK builds");
    }
}
`,
};

const SENIOR_ANSWERS = [
  `**Immediate response:** On the canary pod capture **jcmd** \`<pid> Thread.print\` while the **Thread** is inside **ObjectMapper.readValue**, then save the top twenty frames; circle the **checkcast** that targets **java.lang.String** so everyone agrees this is not a generic **Number** coercion bug. Pull the **shared-data** module and run **javac -Xlint:unchecked** with the same **release** and **processor** path CI uses so you reproduce warnings where **RowMapper** results feed **raw** **List** fields before the mapper runs. Diff the git history for SKU-218 and list every **JdbcTemplate**.**query** overload that dropped explicit type arguments.

**Root cause:** The **DAO** returns a **raw** **List** from **Map**-based row mapping, then higher layers stuff that reference into **List<String>** fields on the DTO. **Erasure** means **javac** cannot insert **checkcast** instructions at the assignment into the raw structure, so the heap quietly holds **Long** instances where **String** was promised. **Jackson** performs stricter runtime shaping when it hydrates nested collections, so the first **String**-typed read executes **checkcast** and the **JVM** throws **ClassCastException** with framework frames on top even though the defect is your JDBC boundary. **Java 17** still erases **List** element types identically to **Java 8**; the failure mode is therefore unchanged across LTS bumps—only tooling noise differs.

**Fix:** Replace the **Map<String,Object>** convenience path with **JdbcTemplate**.query passing a **RowMapper** that returns **List<String>** or a small domain parser that normalizes **Object** cells to **String** before anyone stores them in the DTO. Ban **raw** return types from **arch.catalog** packages via **ArchUnit**, add integration tests that load fixtures with numeric SKUs and textual SKUs in one payload, redeploy to canary, and attach **javap -c** excerpts showing **checkcast** removed from the hot path after the boundary is typed.

**Prevention:** Turn **-Xlint:unchecked** into **error** for shared **library** modules in **Gradle** **JavaCompile** options, require **JSON Schema** validation before **ObjectMapper** entry for tenant feeds, and document every **unchecked** suppression with a ticket link. **Java 21** preview unnamed classes do not relax these JDBC rules—services still need explicit **RowMapper** types at the persistence edge.`,
  `**Immediate response:** Before anyone rolls back **Lombok** + **MapStruct**, run **javap -p InventoryClient.class** (or the exact class named in **jstack**) on both the previous **JAR** and the candidate **JAR** side by side and diff **ACC_SYNTHETIC** / **ACC_BRIDGE** method lines; store that diff in the incident channel so product sees evidence instead of fear.

**Root cause:** When a subclass narrows a generic return type—**List<ItemDto>** where the interface promised **List<? extends ItemDto>**—**javac** emits **bridge** methods so the **JVM** satisfies the erased **List** contract and then **checkcast** concrete elements for callers expecting the narrower type. **HotSpot** invokes the bridge frequently but the cost is almost always noise compared to network I/O; the scary **$$Bridge** frames in **async-profiler** or **jstack** are normal bytecode, not corruption. **Java 8** and **Java 17** **javac** both synthesize these bridges with the same intent; upgrading annotation processors changes ordering or naming slightly, which is why flame graphs suddenly highlight synthetic symbols after a dependency bump.

**Fix:** Educate stakeholders with the **javap** diff; keep the upgrade if bridges are the only delta. If you still suspect perf regression, run **jcmd** \`<pid> JFR.start\` for a five-minute flight recording and prove **bridge** dispatch occupies measurable **CPU**—rare before you tune I/O. Add a note to the **release** ticket linking **JLS** bridge semantics so future reviewers do not open unnecessary rollbacks.

**Prevention:** Maintain a **runbook** step: every **MapStruct** / **Lombok** upgrade must attach **javap -p** before/after for generated **mapper** interfaces. Add a CI job that fails when shading relocates **processor** packages in a way that strips bridges—use **maven-enforcer** or **Gradle** **task** hooks for fat **JAR** modules. **Java 21** record components and compact constructors still interact with bridges when implementing generic interfaces—keep the same review discipline.`,
  `**Immediate response:** Reproduce the failing integration test locally, then **javap -v** the **TypeToken** anonymous subclass your **Gson** client uses (for example, **Envelope$1.class**) and confirm the **Signature** attribute still mentions **ApiEnvelope<List<Row>>** in the constant pool; if it is missing, your anonymization or **ProGuard** rules stripped generic metadata.

**Root cause:** **fromJson(String, ApiEnvelope.class)** uses a **Class** literal that carries only the raw **ApiEnvelope** shape after **erasure**; nested **List<Row>** evaporates, so **Gson** materializes **LinkedTreeMap** entries that fail when application code casts to **Row**. Unit tests that passed used smaller **JSON** blobs or **List.class** shortcuts that never exercised the nested path, hiding the bug until integration traffic hit full envelopes. This is the textbook failure **TypeToken** exists to solve: it reifies the full generic type via subclass **Signature** data that survives for **Gson**'s **TypeAdapter** selection.

**Fix:** Replace **Class** literals on nested generics with **new TypeToken<ApiEnvelope<List<Row>>>(){}.getType()** on the HTTP client path, add a regression fixture that mirrors production envelope nesting, redeploy to **staging**, and verify with **javap -v** that the anonymous **TypeToken** subclass carries the expected signature. On **Java 11+**, run the same **javap** **Signature** check after module encapsulation changes because **IllegalAccessError** during adapter lookup is a separate failure class worth excluding.

**Prevention:** Enforce a **code review** checklist: no **REST** or **Feign** client may call **fromJson** with **Class** when the static type contains nested generics; static analysis templates or **Error Prone** custom checks flag literals. Pair every **Gson** client with a contract test that asserts **instanceof** on concrete **Row** elements, not just map keys. **Java 17** **record** accessors combined with **Gson** still need explicit **TypeToken** for nested lists—records do not restore erased shapes automatically.`,
  `**Immediate response:** Run **./gradlew compileJava --info** and scroll to the exact wildcard error; copy the **capture#** line into the incident doc so reviewers see you are dealing with **wildcard capture**, not a broken dependency tree.

**Root cause:** The batch ingest method declared **List<? super Number>** even though the implementation only **read** numeric cells for aggregation. With **PECS**, **super** marks a **consumer** sink where callers may safely **add** **Number** subtypes; **List<Integer>** is not a subtype of **List<? super Number>** because **Integer** producers cannot satisfy a **Number** sink contract in the **Java** type system—invariance blocks the relation even though **Integer** **is-a** **Number**. The compiler message mentioning **capture#1 of ?** is the giveaway: **javac** created a fresh capture variable and could not prove your caller matched.

**Fix:** Change the parameter to **List<? extends Number>** if the method only reads cells, or introduce a named **<T extends Number>** with appropriate **PECS** on secondary parameters if you must both read and write under strict constraints. Re-run **compileJava**, then add a unit test that demonstrates unsafe **add** operations remain forbidden where appropriate. Document the mnemonic beside the method in **Javadoc** so future contributors do not flip the wildcard again. **Java 8** and **Java 21** **javac** issue the same class of capture errors; upgrading **JDK** will not magically accept an incorrectly oriented wildcard.

**Prevention:** Add an **API** design checklist printed in the wiki: draw a small arrow next to every **Collection** parameter—reads point to **extends**, writes that must accept **Number** sinks point to **super**. Wire a **review** bot heuristic that flags **? super** on parameters whose body never calls **add**. Optional: teach **Pair** programming candidates to run **jshell** with toy lists when **Gradle** errors feel opaque.`,
  `**Immediate response:** Pull the shaded **JAR** and run **javap -p** on both the **MapStruct**-generated mapper interface and its implementation inside the **fat** artifact; compare **ACC_BRIDGE** counts against the unshaded module build. If bridges vanished or renamed inconsistently, stop the rollout immediately.

**Root cause:** **MapStruct** implements generic interfaces whose erased **JVM** view must align with **synthetic** **bridge** methods so **invokeinterface** dispatches land on the correct implementation slot. Aggressive **Maven Shade** relocation rules can rename packages in generated bytecode without updating every **bridge** pair, yielding **AbstractMethodError** at runtime even though **javac** succeeded. The error surfaces inside **generic** adapter glue, so teams blame **compiler** bugs or **Spring** wiring when the **vtable** is simply incomplete after relocation.

**Fix:** Adjust shade filters to **exclude** annotation processor output packages from relocation, or split mapper modules so shading never touches them. Redeploy canary with **java -verbose:class** smoke tests and watch for clean **Class** load lines without **LinkageError**. Attach **javap** diffs to the ticket showing restored **bridge** methods.

**Prevention:** Nightly contract tests that diff **javap -p** output for every published **fat** **JAR** against a golden file; fail CI when **bridge** counts regress. Document forbidden relocations for **MapStruct**, **lombok**, and **byte-buddy** packages in the **build** standards. On **Java 17**, **--illegal-access** noise is gone but **module** boundaries make class loading stricter—keep shade rules reviewed whenever you bump **JDK** LTS.`,
  `**Immediate response:** Grab **jstack** from the failing worker, locate frames mentioning **Arrays** or **ArrayList** construction inside the new **util** helper, then **javap -c** that helper to see how **varargs** arrays leak into fields or how **Object[]** escapes.

**Root cause:** **@SafeVarargs** on a **static** **<T>** method tells **javac** the implementation will not corrupt the **varargs** array, but if another layer stores that array into a field typed as **Object[]** and later writes incompatible elements, the **JVM** enforces **reified** array store checks and throws **ArrayStoreException** even though **Collection** generics were erased. **Heap** corruption adjacent to generics often masquerades as flaky ingestion data. **Java 7** tightened **SafeVarargs** placement rules; **Java 9+** module access can hide **reflective** array manipulation until runtime.

**Fix:** Remove **@SafeVarargs** until a senior audit signs off, copy **varargs** into a defensive **List<T>** via **Arrays.asList** or **List.of** before crossing module boundaries, add fuzz tests that permute element types, redeploy the hotfix, and re-run **jstack** capture to confirm frames no longer show **Array** store failures.

**Prevention:** Require **SpotBugs** **VA** or **Error Prone** rules on any PR adding **@SafeVarargs**, and ban blanket **@SuppressWarnings("unchecked")** on modules without **RFC** links. Document that **SafeVarargs** never deletes runtime array checks—it only calms **javac** at the declaration site. **Java 21** sequenced collections do not change **varargs** reification rules; keep the same review bar.`,
];

function wordCount(s) {
  return s
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function hashSections(content) {
  return (content.match(/^###\s/gm) || []).length;
}

function pipeTables(content) {
  return (content.match(/^\|[^|\n]+\|[^|\n]+\|[^|\n]+\|\s*$/gm) || []).length;
}

function interviewAngles(content) {
  return (content.match(/\*\*Interview angle:\*\*/g) || []).length;
}

function nonBlankCodeLines(code) {
  return code ? code.split("\n").filter((l) => l.trim().length > 0).length : 0;
}

function theoryLevelDistribution(content) {
  const heads = [...content.matchAll(/^### (.+)$/gm)].map((m) =>
    m[1].replace(/\*\*/g, "").trim()
  );
  const closing = (h) =>
    /60-second interview story/i.test(h) || /Satyverse drill/i.test(h);
  const band = heads.filter((h) => !closing(h));
  const fresher = band.filter(
    (h) =>
      /Plain-language|fresher walkthrough|Raw types versus|Bounded type parameters$/i.test(h)
  ).length;
  const seniorDev = band.filter(
    (h) =>
      /Erasure mechanics at|Wildcards and capture|Generic methods and inference|Production comparison table|Erasure versus arrays snippet/i.test(
        h
      )
  ).length;
  const techLead = band.filter(
    (h) =>
      /PECS at module boundaries|Step-by-step:|Wildcard decision table|PECS decisions you defend|erasure to stakeholders/i.test(
        h
      )
  ).length;
  const staff = band.filter(
    (h) =>
      /Bridge methods|Heap pollution|Reifiable|Reflection and Type|Reflection token comparison/i.test(h)
  ).length;
  return {
    totalHeadings: heads.length,
    fresher,
    seniorDev,
    techLead,
    staff,
    closing: heads.filter(closing).length,
  };
}

function cheatsheetDataRows(content) {
  const lines = (content || "").split("\n").filter((l) => /^\|/.test(l));
  return Math.max(0, lines.filter((l) => !/^\|[\s-|:]+\|\s*$/.test(l)).length - 1);
}

function main() {
  const raw = fs.readFileSync(JSON_PATH, "utf8");
  const data = JSON.parse(raw);

  const sections = data.sections;
  const whySec = sections.find((s) => s.type === "why");
  const theorySec = sections.find((s) => s.type === "theory");
  const pitfallsSec = sections.find((s) => s.type === "pitfalls");
  const cheatsheetSec = sections.find((s) => s.type === "cheatsheet");
  const interviewSec = sections.find((s) => s.type === "interview");
  const mcqSec = sections.find((s) => s.type === "mcq");
  const codeSecs = sections.filter((s) => s.type === "code");

  if (whySec) whySec.content = WHY_CONTENT;

  if (theorySec && !theorySec.content.includes("fresher walkthrough")) {
    theorySec.content = theorySec.content.replace(
      "### Erasure mechanics at **bytecode** **level**",
      THEORY_INSERT + "### Erasure mechanics at **bytecode** **level**"
    );
  }
  if (
    theorySec &&
    !theorySec.content.includes("explain **erasure** to stakeholders without losing the room")
  ) {
    theorySec.content = theorySec.content.replace(
      "### **Generic** **methods** and **inference**",
      THEORY_TECH_LEAD_INSERT + "### **Generic** **methods** and **inference**"
    );
  }
  if (theorySec && theorySec.content.includes(THEORY_TECH_LEAD_INSERT + THEORY_TECH_LEAD_INSERT)) {
    theorySec.content = theorySec.content.replace(
      THEORY_TECH_LEAD_INSERT + THEORY_TECH_LEAD_INSERT,
      THEORY_TECH_LEAD_INSERT
    );
  }

  const basicSec = codeSecs.find((c) => c.level === "basic");
  const interSec = codeSecs.find((c) => c.level === "intermediate");
  if (basicSec) {
    basicSec.code = BASIC_CODE;
    basicSec.output = BASIC_OUTPUT;
  }
  if (interSec) {
    interSec.code = INTERMEDIATE_CODE;
    interSec.output = INTERMEDIATE_OUTPUT;
  }

  if (pitfallsSec) pitfallsSec.items = PITFALL_ITEMS;
  if (cheatsheetSec) cheatsheetSec.content = CHEATSHEET_CONTENT;

  const exIdx = sections.findIndex((s) => s.type === "exercise");
  if (exIdx !== -1) {
    if (sections[exIdx + 1]?.type === "exercise") {
      sections[exIdx] = { ...FRESHER_EXERCISE };
      sections[exIdx + 1] = { ...STAFF_EXERCISE };
    } else {
      sections.splice(exIdx, 1, { ...FRESHER_EXERCISE }, { ...STAFF_EXERCISE });
    }
  }

  if (interviewSec?.seniorScenario?.length === SENIOR_ANSWERS.length) {
    for (let i = 0; i < SENIOR_ANSWERS.length; i++) {
      if (wordCount(interviewSec.seniorScenario[i].answer) < 200) {
        interviewSec.seniorScenario[i].answer = SENIOR_ANSWERS[i];
      }
    }
  }

  const out = JSON.stringify(data, null, 2) + "\n";
  JSON.parse(out);
  fs.writeFileSync(JSON_PATH, out, "utf8");

  const whyWords = wordCount(sections.find((s) => s.type === "why").content);
  const theoryH = hashSections(theorySec.content);
  const levels = theoryLevelDistribution(theorySec.content);
  const conceptual = interviewSec.conceptual || [];
  const concWords = conceptual.map((x) => wordCount(x.answer));
  const senior = interviewSec.seniorScenario || [];
  const senWords = senior.map((x) => wordCount(x.answer));
  const mcqQs = mcqSec.questions || [];
  const mcqBy = { basic: 0, intermediate: 0, advanced: 0 };
  for (const q of mcqQs) {
    mcqBy[q.level] = (mcqBy[q.level] || 0) + 1;
  }
  const basic = sections.filter((s) => s.type === "code").find((c) => c.level === "basic");
  const inter = sections.filter((s) => s.type === "code").find((c) => c.level === "intermediate");
  const adv = sections.filter((s) => s.type === "code").find((c) => c.level === "advanced");

  console.log("--- Verification ---");
  console.log("WHY word count:", whyWords);
  console.log("THEORY ### count:", theoryH);
  console.log(
    "THEORY level distribution (fresher / seniorDev / techLead / staff):",
    `${levels.fresher} / ${levels.seniorDev} / ${levels.techLead} / ${levels.staff} (closing headings: ${levels.closing})`
  );
  console.log("Conceptual: count =", conceptual.length, "| words =", concWords.join(", "));
  console.log("SeniorScenario: count =", senior.length, "| words =", senWords.join(", "));
  console.log("JobSwitch:", !!interviewSec.jobSwitch);
  console.log("MCQ by level:", JSON.stringify(mcqBy));
  console.log(
    "Code lines [basic, intermediate, advanced]:",
    [basic, inter, adv].map((c) => nonBlankCodeLines(c.code)).join(", ")
  );
  console.log("File size (chars):", fs.statSync(JSON_PATH).size);

  const exCount = sections.filter((s) => s.type === "exercise").length;
  const fail = [];
  if (whyWords < 600 || whyWords > 750) fail.push("WHY length 600-750");
  if (theoryH < 14) fail.push("THEORY ### < 14");
  if (pipeTables(theorySec.content) < 3) fail.push("THEORY pipe tables < 3");
  if (interviewAngles(theorySec.content) < 13) fail.push("THEORY angles < 13");
  if (levels.fresher < 3) fail.push("THEORY fresher band < 3");
  if (levels.mid < 4) fail.push("THEORY mid band < 4");
  if (levels.staff < 4) fail.push("THEORY staff band < 4");
  for (const w of concWords) if (w < 120) fail.push(`conceptual ${w} words`);
  for (const w of senWords) if (w < 200) fail.push(`senior ${w} words`);
  if (cheatsheetDataRows(cheatsheetSec.content) < 12) fail.push("cheatsheet rows");
  const pitItems = pitfallsSec.items.filter((x) => typeof x === "string" && !x.trimStart().startsWith("//"));
  if (pitItems.length !== 8) fail.push("pitfalls body count !== 8");
  if (exCount !== 2) fail.push("exercise sections !== 2");
  const staffEx = sections.find((s) => s.type === "exercise" && s.audience === "staff");
  const fresherEx = sections.find((s) => s.type === "exercise" && s.audience === "fresher");
  if (staffEx && staffEx.solution.split("\n").length < 50) fail.push("staff exercise < 50 lines");
  if (fresherEx && fresherEx.solution.split("\n").length < 25) fail.push("fresher exercise < 25 lines");

  if (fail.length) {
    console.log("\n✗ Day 28 —", fail.join("; "));
    process.exitCode = 1;
  } else {
    console.log("\n✓ Day 28 complete. All checks pass.");
  }
}

main();