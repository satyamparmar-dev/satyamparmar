const FU_ONCALL = {
  question:
    "Interview follow-up: how does **Generics Deep Dive** show up in **production** debugging or **on-call**?",
  answer:
    "You pair **jcmd** `<pid>` **Thread.print** with **javap -p** on the exact **service** **class** cited in a **ClassCastException** so you see whether an **unchecked** cast or **raw** **List** smuggled a **Long** into a **String**-typed **DTO** pipeline. You run **javac -Xlint:unchecked** on the failing **module** and fail the build in **CI** when shared **libs** introduce **raw** **Map** returns. You diff **jstack** frames that mention **checkcast** after **Jackson** or **MapStruct** calls, then open **jmap** **-histo:live** only if you suspect duplicate **Type** **machinery** from **shade** plugins. You document the **Class** `<T>` **token** or **TypeToken** path the fix needs so the next engineer replays the same ladder instead of toggling **GC** flags.",
};

const FU_TRAP = {
  question: "What is a **common trap** or **follow-up** question on **Generics Deep Dive**?",
  answer:
    "Interviewers insist **List** `<Object>` is a safe substitute for **List** `<String>` because everything extends **Object**. You answer that **generics** are **invariant**: **List** `<String>` is not a **subtype** of **List** `<Object>`; only **wildcards** (`? extends`, `? super`) widen at API edges under **PECS**. Another trap is claiming **instanceof List** `<String>` works at **runtime**; you cite **JLS** **erasure**—**javac** rejects illegal **reified** tests—and show **`java -version`** because **bridge** and **strip** tooling questions still track **JDK** lineage across **Java 8**, **17**, and **21** upgrades.",
};

const CONCEPTUAL_TAIL =
  "Staff proof bundle: attach **javap -c** **diffs** whenever **covariant** **returns** ship, run **jcmd** **Thread.print** when **ClassCastException** receivers mention **Object**-to-**String** **checkcast** after **erased** **get** calls, keep **-Xlint:unchecked** as **error** in shared **Gradle** **modules**, cite **Java 5** **erasure** for **binary** compatibility versus **reified** **Scala** models, rehearse **TypeToken** / **JavaType** adoption for **nested** **JSON**, log **java -version** beside every **serialization** **regression**, correlate **jmap** **histograms** when **bridge**-heavy **CPU** samples follow **Lombok** bumps, demand **ArchUnit** bans on **raw** **Collection** returns, and store **PECS** **signature** screenshots in **ADRs** so wildcard direction never reverses quietly across **teams**.";

const SENIOR_EXT =
  "\n\nStaff narrative closure: keep **javap** **bridge** evidence in **tickets** whenever **MapStruct** or **Jackson** upgrades land, cite **Java 7** **diamond** limits when **anonymous** classes lose **inference**, run **javac** **-Xlint:unchecked** in **CI** gates for **library** **PRs**, attach **jstack** **checkcast** lines to **PagerDuty** notes so **on-call** sees **heap** **pollution** not **bad** **data**, rehearse **Class** `<T>` **witnesses** with **Spring** **ResolvableType** when **beans** need **nested** **shapes**, publish **JSON** **schema** tests whenever **Gson** drops **TypeToken**, correlate **jstat** **-class** churn after **annotation** **processor** changes, and ban module-level **@SuppressWarnings(\"unchecked\")** except with **RFC** links.";

const c = (question, answer) => ({
  question,
  answer: `${answer} ${CONCEPTUAL_TAIL}`,
  followUps: [{ ...FU_ONCALL }, { ...FU_TRAP }],
});

export const CONCEPTUAL = [
  c(
    "How does **type** **erasure** show up in **bytecode** versus **source**?",
    "**javac** erases most **type** **parameters** to their **leftmost** **class** **bound** or **java.lang.Object** when **unbounded**, then inserts **checkcast** **bytecodes** at **call** **sites** where the **static** **type** promises more than the **operand** **stack** guarantees. **invokeinterface** on **List.add** still takes **Object** after **erasure**, so **generics** are a **compile-time** proof discipline, not **runtime** tags on **ArrayList** **instances**. **Production** **ClassCastException** stacks therefore land on **framework** frames even though business code looked **typed**. **Diagnostic**: **javap -c Consumer.class** counts **checkcast** instructions after **getter** chains. **Java 5** shipped this **JVM** **model** to preserve **pre-generic** **library** **linking**, and it still governs **Java 21** **OpenJDK** builds.",
  ),
  c(
    "Why are **raw** **types** still legal, and what breaks when you use them in new **API**?",
    "**Raw** **Foo** means **type** **arguments** were omitted; **javac** stops proving **element** **types**, yet **bytecode** stays compatible with legacy **JARs** compiled before **Java 5**. Assigning a **raw** **List** into **List** `<String>` is allowed with **unchecked** warnings, so **heap** **pollution** can insert **Integer** rows that survive until a **String** **consumer** executes a widening **checkcast** and throws **ClassCastException**. **Production** teams misread that failure as **bad** **payload** quality because the faulting frame is **Jackson** or **JdbcTemplate**. Run **javac -Xlint:unchecked** and **grep** shared **modules** for **raw** return types; **Java 8** through **21** share this hazard.",
  ),
  c(
    "Explain **wildcard** **capture** and why **javac** invents **`capture#1` of `?`** names.",
    "When you assign **List** `<? extends Number>` to a **local**, **javac** introduces a **fresh** **capture** variable representing an unknown but fixed **subtype** of **Number** for **that** **value**. **Statements** such as `list.add(1)` fail because the **compiler** cannot prove the **capture** accepts **Integer** without violating another **client** who might hold the same **list** as **List** `<? extends Number>` backed by **List** `<Double>`. **Production** impact is usually compile-time **API** friction, yet mis-fixes resort to **unchecked** casts that explode at **runtime**. Inspect **javac** **error** text for **`capture#`** tokens and refactor with a **private** **generic** helper `<T extends Number> void fill(List<T> dst)` instead. **Java** **21** still uses the same capture rules.",
  ),
  c(
    "What **PECS** means for a **public** **copy** method and why both **wildcards** appear.",
    "**Producer** **extends**, **consumer** **super** tells you to read **T** from **`List<? extends T>`** and write **T** into **`List<? super T>`**, which is why **Collections.copy**-style helpers take **`List<? extends T> src`** and **`List<? super T> dest`**. **Erasure** makes both lists share **`add(Object)`** at **bytecode**, but **javac** uses **wildcard** variance to **prove** each **add** is **type**-sound. **Production** **bugs** from flipped **PECS** show up as either **compile** failures in **Gradle** (`capture` errors) or **unsafe** **writes** allowed into **read-only** structures. **Diagnostic**: open **javap -v** on the **copy** **helper** and verify only **extends** sources feed **read** loops. **Java 7** **diamond** does not remove **PECS** reasoning.",
  ),
  c(
    "How do **bridge** **methods** preserve **virtual** **dispatch** after **erasure**?",
    "When a **subclass** **narrows** a **return** type—**`public Integer get()` overriding `Number get()`**—**javac** emits a **synthetic** **bridge** method with the **erased** **super** signature delegating to your implementation with **checkcast**. **JVM** **invokevirtual** resolution uses the **bridge** so legacy **bytecode** that calls **`Number get()`** still lands on your **Integer** body. **Stack** traces sometimes show **`SomeType$$Bridge`** names after **annotation** processors, spooking **on-call** until **javap -p** shows **ACC_BRIDGE**. Misaligned **bridges** after **Maven** **shade** cause **AbstractMethodError**. **Verify** with **javap -p Service.class** after every **Lombok**/**MapStruct** bump on **Java 11**+ **toolchains**.",
  ),
  c(
    "Why can you not construct **`new T()`** or **`new T[10]`** inside a generic **class**?",
    "**Erasure** replaces **T** with **Object** or a **bound** at **runtime**, so **`new T()`** would expand to **`new Object()`**, breaking callers who expected a deeper **subtype**, and **`new T[]`** would create **arrays** whose **runtime** **component** type cannot equal each distinct **instantiation** of **GenericFoo** `<String>` versus `<Integer>`. **javac** forbids both to prevent **heap** **pollution** that **`ArrayStoreException`** or **`ClassCastException`** would surface later. **Production** code instead takes **`Class<T> token`** or **`Supplier<T>`**. **Diagnostic**: if you see **`Cannot create a generic array`**, refactor to **`ArrayList<T>`**; confirm with **`javac`** errors before shipping. Rules carry from **Java 5** through **Java 21**.",
  ),
  c(
    "Why is **`List<Integer>` not a `List<Number>`** even though **Integer** **extends** **Number**?",
    "**Generics** are **invariant** on **type parameter** **instantiations**: mutable **lists** would allow **`add(Double)`** on a **`List<Number>`** view that aliases a **`List<Integer>`**, violating **heap** integrity. **Arrays** remain **covariant** (which is why **`ArrayStoreException`** exists), so **interviewers** contrast **`String[]` assignable to `Object[]`** with **`List<String>` not assignable to `List<Object>`**. **Production** migrations stumble when DTOs **widen** collection fields without wildcards. **PECS** wildcards restore safe **read/write** splits. **java -version** matters when discussing **records** + **generics** interplay on **Java 17**.",
  ),
  c(
    "How does **`Class<T>`** act as a **reified** **token** for **reflection**?",
    "**Class** literals like **`String.class`** embed a concrete **type** in **`constant_pool`** entries the **JVM** loads, giving **`Class<String>`** despite **erasure** on **`List<String>`**. **Frameworks** therefore thread **`Class<T>`** or **`Type`** graphs (**`ParameterizedType`**) whenever **`newInstance`**, bean wiring, or **JSON** **readers** must recover shapes. Without a **token**, **`List<String>`** field metadata vanishes except via **`getGenericType()`**. **Production** failure is **`Gson`** returning **`LinkedTreeMap`** instead of **`List<MyRow>`** because **`fromJson(String, Class)`** cannot witness generics. **Diagnostic**: **javap -v** the **TypeToken** subclass literal. **Java 8** **Method.getGenericReturnType** remains the workhorse on **Java 21**.",
  ),
  c(
    "What is **heap** **pollution** with **varargs** **generic** **methods** and **`@SafeVarargs`?**",
    "**Varargs** of **T** compile to **`Object[]`** arguments at **caller** sites; if callers pass differently reified arrays, **unsafe** stores sneak past **javac** until a later read throws **ClassCastException** or **ArrayStoreException**. **`@SafeVarargs`** on **final**/**static** methods documents that the body never leaks the **array** with wrong **element** types, suppressing warnings only when true. **Production** library helpers that expose generic **varargs** without audit become **CVE**-class footguns in **data** **pipelines**. **SpotBugs** and **`javac -Xlint:unchecked`** catch sloppy sites. **Java 7** introduced **`@SafeVarargs`** for callers; **Java 21** still enforces the same discipline.",
  ),
  c(
    "How does **diamond** **`<>`** interact with **type** **inference** on **constructors**?",
    "**Diamond** tells **javac** to infer **class** **type** **arguments** from **assignment** context—**`List<String> xs = new ArrayList<>()`** reuses **String** without repeating it. **Anonymous** inner classes historically demanded explicit **type** **witnesses** on some **JDK** levels, so interview answers mention inference limits when **`new Foo<>() { }`** fails. Mis-inference yields **compile** errors, not **runtime** **surprises**, which is preferable to **raw** types. **Java 7** added **diamond**; **Java 8** method reference targets tightened **inference** further; **Java 21** infers more **nested** shapes but still respects **PECS**.",
  ),
  c(
    "What role do **`ParameterizedType`** and **`TypeToken`** play for **nested** **generics** in **JSON**?",
    "**java.lang.reflect.ParameterizedType** exposes **`getActualTypeArguments()`** so frameworks introspect **`Map<String, List<Row>>`**. **Gson** **`TypeToken`** and **Jackson** **`JavaType`** bake those **types** into anonymous subclasses whose **`super` class** metadata survives **erasure** in **class** files. Without them, **`fromJson(json, Map.class)`** erases values to **LinkedTreeMap**. **Production** symptom: intermittent **ClassCastException** in **batch** jobs reading **nested** **rows**. **Diagnostic**: **javap -v MyTypeToken$1.class** shows preserved generics. This pattern is mandatory across **Java 8**–**21** interop stacks.",
  ),
  c(
    "**Static** **generic** **methods** versus **instance** **type** **parameters**: what can each reference?",
    "**Method-level** **`<T> T nill()`** introduces a **fresh** **T** independent of outer **class** parameters, which is how **`Collections.emptyList()`** works inside non-generic **utility** classes. **Static** members cannot refer to **class** **T** because no **instantiation** fixes **T** yet. Interview mistakes claim **`static void add(T x)`** inside **`Foo<T>`** without declaring **`static <T>`** duplicates—actually the **class** **T** is visible to **static** **methods** in **Java**, unlike some languages, but **shadowing** rules confuse people—use explicit **method** **`<T>`** when decoupling. **Production** fixes involve extracting helpers to avoid **capture** errors. Use **`javap`** to confirm **erased** **descriptors** line up after refactors on **Java 17** **services**.",
  ),
  c(
    "How do **covariant** **returns** on **generic** **interfaces** interact with **synthetic** **bridges**?",
    "Implementing **`Supplier<Integer>`** after extending a **`Supplier<Number>`**-style erased story, or refining return types in **hierarchies**, forces **javac** to emit **bridges** so **interface** merging stays **sound**. **Bytecode** **verify** rejects **illegal** overrides if **bridges** go missing—seen when **shade** plugins strip **ACC_SYNTHETIC** entries. **Production** **IncompatibleClassChangeError** after **fat** **JAR** rebuilds often traces here. **Diagnostic**: **javap -p Impl.class** listing **bridge** pairs before closing **release** tickets. Applies equally to **Java 11** and **Java 21** **Spring** components.",
  ),
  c(
    "Why does **`add`** fail on **`List<? extends Number>` but succeed on **`List<? super Integer>`?**",
    "**extends** lists are **producers**: you may read **Number** but cannot **add** **Integer** because the **list** might be **`List<Double>`**. **super Integer** lists model **consumers** that accept **Integer** (and **supertypes** **are** represented via **Object** writes at **erasure**). **javac** encodes variance to stop **heap** corruption. **Production** APIs flip these when copying **metrics** batches. **jcmd** rarely helps—**javac** is the guardrail—yet **runtime** **CCE** still appears if **unchecked** casts bypassed compile proofs. **Java 21** **sequenced** collections inherit the same wildcard rules.",
  ),
  c(
    "What are **recursive** **bounds** like **`<T extends Comparable<T>>`** solving?",
    "They tie **T** to an **ordering** API where **compareTo** accepts the **same** **T**, enabling **`Collections.max`** without **unsafe** casts. Without recursion you'd need **`<T extends Comparable<? super T>>`** tricks for **inheritance** edges. **Erasure** replaces **T** with **Comparable** at **bytecode** boundaries while **inserting** **casts** for concrete calls. **Production** sort pipelines depend on this for **DTO** keys. **Diagnostic** when debugging **ClassCastException**: inspect **TreeMap** **comparator** types via **stack** frames, then **javap** suspected **compareTo** overrides. Stable across **Java 8**–**21** **TimSort** backends.",
  ),
  c(
    "How should you migrate libraries drowning in **unchecked** **cast** warnings?",
    "Tighten **source** **types** first—replace **raw** **return** **types**, add **`Class<T>`** parameters to factories, introduce **`TypeReference`** helpers for **JSON**—before blanket **`@SuppressWarnings`**. Turn **`-Xlint:unchecked`** to **error** in **CI** for **shared** **modules** so debt cannot grow. Where warnings persist, scope **suppress** to three-line methods with **comments** citing **invariants**. **Production** regressions track to **Map** **multiplexers** that cast **`Object`** to **`T`**. Pair migration with **tests** using **malicious** **payloads** forged from **raw** **YAML**. **Java 11** **modules** plus **Java 21** still rely on this playbook.",
  ),
  c(
    "Why can **generics** interact badly with **Kotlin** **platform** **types** at **boundaries**?",
    "**Kotlin** exposes **platform** types for **Java** APIs that lack **nullability** **annotations**, so **generic** **Java** methods returning **raw** or loosely typed **collections** become **mutable** **MutableList** views in **Kotlin** without compile guarantees. Mixed **modules** may pass **`List` without generics** back into **Java** code expecting **`List<String>`**, reviving **erasure** holes. **Fix** by tightening **Java** APIs with **non-null** **annotations** and **explicit** **wildcard** **PECS**. **Diagnostic**: reproduce with **`javap`** on the **Java** **facet**, then add **Kotlin** tests enforcing **reified** **types**. Still relevant shipping **Java 17** services with **Kotlin 2** clients.",
  ),
];

const CODE_BASED_TAIL =
  "Re-run **javap -c** on the snippet's **class** when the interviewer doubts **erasure**, cite **jcmd** **Thread.print** if **checkcast** frames appear at **runtime**, and log **java -version** so **bridge** discussions stay tied to the **OpenJDK** release you reproduce.";

const cb = (question, answer) => ({
  question,
  answer: `${answer} ${CODE_BASED_TAIL}`,
  followUps: [{ ...FU_ONCALL }, { ...FU_TRAP }],
});

export const CODE_BASED = [
  cb(
    "What does this print?\n```java\nimport java.util.*;\npublic class T {\n  public static void main(String[] args) {\n    List<String> a = new ArrayList<>();\n    List<?> b = a;\n    System.out.println(b.size());\n  }\n}\n```",
    "**`List<?>`** is an **unbounded** **wildcard** **view**; **`b`** aliases the same **ArrayList** instance as **`a`**, so **`size()`** runs the real list and prints **0**. **Generics** are still **compile-time** checked—**you** cannot **`b.add(\"x\")`** without **unsafe** casts—but **read-only** calls like **`size`** remain legal because they do not depend on the **capture**. At **bytecode** level **`size`** invokes **`ArrayList.size`** without extra **checkcast** on elements.",
  ),
  cb(
    "Does this compile?\n```java\nimport java.util.*;\npublic class T {\n  public static void main(String[] args) {\n    List<? extends Number> xs = new ArrayList<Integer>();\n    xs.add(1);\n  }\n}\n```",
    "This fails at **compile** time: **`add(Integer)`** is rejected because **`xs`** could alias **`List<Double>`**; **`javac`** cannot prove **`capture#1`** accepts your literal **1** without breaking another possible **heap** configuration. **Erasure** would make **`add(Object)`** available **at bytecode**, so the **language** blocks the call early—a **feature**, not a nuisance. **Production** teams workaround via **`List<Integer>`** locals or **`? super Integer`** parameters.",
  ),
  cb(
    "What does this print?\n```java\nimport java.util.*;\npublic class T {\n  public static void main(String[] args) {\n    List raw = new ArrayList();\n    raw.add(42);\n    List<String> xs = raw;\n    System.out.println(xs.get(0));\n  }\n}\n```",
    "The snippet compiles with **unchecked** warnings: **raw** **`List.add`** stores **`Integer`**, but **`xs.get(0)`** inserts a **`checkcast String`** before returning to **`println`**, which throws **`ClassCastException: class java.lang.Integer cannot be cast to class java.lang.String`**. Stdout never prints a value; **heap** **pollution** from **raw** types surfaces at **read** time. **javac** warned; **runtime** **JVM** enforces **casts** **inserted** by **compiler**.",
  ),
  cb(
    "What does this print?\n```java\npublic class T {\n  static class Box<T> { T v; void set(T x){ v=x; } T get(){ return v; } }\n  static class IntBox extends Box<Integer> {}\n  public static void main(String[] args) {\n    Box b = new IntBox();\n    b.set(\"oops\");\n    IntBox ib = (IntBox)b;\n    System.out.println(ib.get());\n  }\n}\n```",
    "Assigning **`Box b`** erases generics through the **`Box` raw** supertype: **`b.set(\"oops\")`** performs an **unchecked** call storing a **String** into **`IntBox`**, corrupting the heap. **`ib.get()`** executes **`checkcast Integer`** and throws **`ClassCastException`** when **`println`** tries to coerce the **String**. Illustrates why **raw** **aliases** around **specialized** inherits are deadly.",
  ),
  cb(
    "What does this print?\n```java\nimport java.util.*;\npublic class T {\n  public static void main(String[] args) {\n    System.out.println(new ArrayList<String>().getClass()\n        == new ArrayList<Integer>().getClass());\n  }\n}\n```",
    "**`getClass()`** returns the **runtime** **Class** object for **java.util.ArrayList** for both instantiations because **type** **arguments** do not create distinct **classes** after **erasure**. The program prints **`true`**, showing **List** `<String>` vs `<Integer>` differ only to **`javac`**, not **`Class`** identity. **Reflection** must use **`ParameterizedType`** or **tokens** for deeper shapes.",
  ),
  cb(
    "What does this print?\n```java\nimport java.util.*;\npublic class T {\n  public static void main(String[] args) {\n    List<String> a = new ArrayList<>();\n    List<Integer> b = new ArrayList<>();\n    System.out.println(a.getClass() == b.getClass());\n  }\n}\n```",
    "Both **lists** share **`java.util.ArrayList`** **Class** literal after **erasure**, so **`==`** on **`getClass()`** returns **`true`**. **Type** **arguments** **`String`** versus **`Integer`** exist only for **`javac`**; **bytecode** constructors target the same **class** file. Interview contrast: **`instanceof List<String>`** is illegal, **`Class<?>`** tokens are required for **reified** checks.",
  ),
  cb(
    "What does this print?\n```java\nimport java.util.*;\npublic class T {\n  static <T extends Comparable<T>> T max(List<T> xs) { return xs.get(0); }\n  public static void main(String[] args) {\n    System.out.println(max(List.of(\"z\",\"a\")));\n  }\n}\n```",
    "**`max`** returns the **first** element only (toy method) but compiles because **`String`** satisfies **`Comparable<String>`**; **`List.of(\"z\",\"a\")`** materializes **`List<String>`**, inferred **`T=String`**, and **`println`** emits **`z`**. Demonstrates **method** **type** **parameter** **inference** tying **`T`** to **`String`** without explicit angle brackets at call site beyond **List.of**.",
  ),
  cb(
    "Does this throw at runtime?\n```java\nimport java.util.*;\npublic class T {\n  @SafeVarargs\n  static <T> List<T> asList(T... a) { return Arrays.asList(a); }\n  public static void main(String[] args) {\n    List<String> xs = asList(\"x\");\n    System.out.println(xs.get(0));\n  }\n}\n```",
    "**`@SafeVarargs`** suppresses warnings for this **final**-style helper only if the body is safe; here **`Arrays.asList`** wraps the **varargs** **array** properly and **`get(0)`** prints **`x`** without throwing. **Unsafe** variants that leak **`Object[]`** would risk **ClassCastException**, but this pattern is standard. **javac** still enforces **`@SafeVarargs`** only on **static**/final methods per language rules.",
  ),
];

const seniors = [
  {
    question:
      "Your **catalog** **Spring Boot** service throws **`ClassCastException: java.lang.Long cannot be cast to java.lang.String`** inside **`ObjectMapper.readValue`** only for tenants whose **SKU** feed mixes numeric and textual IDs after **PR** **SKU-218** swapped a **typed** **RowMapper** for **`Map<String,Object>`** convenience.",
    answer:
      "**Immediate response:** Run **`jcmd <pid> Thread.print`** on a canary pod and capture the **`checkcast`** frame above **`readValue`** to confirm the failing cast targets **`String`**, not **`Number`**, then **`javac -Xlint:unchecked`** the **`shared-data`** module locally.\n\n" +
      "**Root cause:** **Legacy** **DAO** code returns a **raw** **`List`** shoved into **`List<String>`** DTO fields; **erasure** allowed **heap** pollution until **Jackson** enforced **`String`** during **hydration**, so **Long** rows detonated inside **framework** frames.\n\n" +
      "**Fix:** Restore **`JdbcTemplate.query(..., new RowMapper<List<String>>)`** (or domain **parser**) at the **source**, ban **raw** returns from **`arch.catalog`**, redeploy with **integration** tests on mixed **SKU** fixtures, attach **`javap`** evidence to the PR.\n\n" +
      "**Prevention:** **ArchUnit** rule blocking **raw** **Collections** in public packages; **CI** **`-Xlint:unchecked`** as **error** for shared **libraries**; **JSON** schema validation before mapper entry.",
  },
  {
    question:
      "After upgrading **Lombok** and **MapStruct**, **jstack** shows hot frames named **`InventoryClient$$Bridge.getItems`** and **product** demands a **rollback** citing **\"compiler bugs\"**.",
    answer:
      "**Immediate response:** **`javap -p InventoryClient.class`** on both **canary** and **baseline** **JARs** and diff **ACC_BRIDGE** **entries** before approving rollback.\n\n" +
      "**Root cause:** **Covariant** **return** refinement (`**List<ItemDto>**` over **`List<? extends ItemDto>`**) forced **javac** to synthesize **bridge** methods; **bytecode** is **normal**, not corrupt, and **CPU** cost is usually negligible versus I/O.\n\n" +
      "**Fix:** Educate stakeholders, keep upgrade if **diff** shows only expected **bridges**, add **microbenchmark** only if **profiler** proves **synthetic** dispatch is hot—rare—otherwise close incident as **false** alarm.\n\n" +
      "**Prevention:** **Release** checklist requiring **`javap`** **diffs** for **annotation** processor upgrades; **document** **bridge** semantics in **runbooks**.",
  },
  {
    question:
      "**Gson** integration tests flap: **`ClassCastException`** when reading **`ApiEnvelope<List<Row>>`** but unit tests using **`List.class`** still pass.",
    answer:
      "**Immediate response:** **`javap -v EnvelopeTypeToken.class`** (or your **`TypeToken`** anonymous class) to ensure **generic** **signatures** exist in the **constant** pool.\n\n" +
      "**Root cause:** **`fromJson(json, ApiEnvelope.class)`** drops **`List<Row>`** due to **erasure**; runtime delivers **`LinkedTreeMap`** entries that fail when code casts to **`Row`**. **Passing** **unit** tests used overly **raw** **deserializers**.\n\n" +
      "**Fix:** Introduce **`TypeToken<ApiEnvelope<List<Row>>>(){}.getType()`** for the **HTTP** client path, add regression fixture, redeploy.\n\n" +
      "**Prevention:** **Code** review rule: no **`Class`** literals for **nested** **generics**; **static** analysis template bans in **REST** clients.",
  },
  {
    question:
      "**Gradle** 9 **compile** fails after you widen a **batch** ingest API: **`List<? super Number>`** parameter rejects **`List<Integer>`** callers even though integers are numbers.",
    answer:
      "**Immediate response:** Open **`./gradlew compileJava --info`** and read the **`capture`** / wildcard message to confirm **PECS** direction bug.\n\n" +
      "**Root cause:** **Method** only **reads** numbers for aggregation but **declared** **`super`**, expecting a **consumer** sink; **`List<Integer>`** is not a **subtype** of **`List<? super Number>`** because **invariance** blocks that relation—you needed **`? extends Number`** for **reads** or a **named** **`T extends Number`**.\n\n" +
      "**Fix:** Flip signature to **`List<? extends Number>`**, rerun **compile**, add **consumer** test proving **`add`** still forbidden where unsafe.\n\n" +
      "**Prevention:** **API** design checklist printing **PECS** arrow beside every **collection** parameter; **pair** with **review** bot heuristics.",
  },
  {
    question:
      "**Shadow** **JAR** ingest reorders packages; **canary** throws **`AbstractMethodError`** inside a **generic** **interface** **adapter** that **MapStruct** generated.",
    answer:
      "**Immediate response:** **`javap -p`** the **shaded** **interface** and **implementation** pair, verifying **bridge** **methods** and **default** methods align with **pre-shade** **bytecode**.\n\n" +
      "**Root cause:** **Relocator** stripped or renamed **synthetic** **bridges**, breaking **JVM** **vtable** expectations after **erasure** merged **interface** methods.\n\n" +
      "**Fix:** Adjust **`maven-shade-plugin`** filters to keep **bridge** **synthetics**, or stop relocating **processor**-generated packages; redeploy **canary** with **`java -verbose:class`** smoke test.\n\n" +
      "**Prevention:** **Contract** test diffing **`javap`** output of **fat** **JARs** nightly; **document** forbidden relocations for **annotation** processors.",
  },
  {
    question:
      "**Sonar** flags **0** issues yet **production** logs show **`ArrayStoreException`** after a **utils** jar added **`@SafeVarargs` generic varargs** without review.",
    answer:
      "**Immediate response:** **`jstack`** from failing **worker** and locate **`Arrays` / `ArrayList`** constructors in **`varargs` wrapper** frames; **`javap -c`** the helper to see how the **array** leaks.\n\n" +
      "**Root cause:** **Helper** wrote **`Object[]`** from **generic** **varargs** then another layer stored **incompatible** **components**, triggering **reified** **array** **store** checks—classic **heap** pollution adjacent to **generics**.\n\n" +
      "**Fix:** Remove **`@SafeVarargs`** until **audit** completes, copy into **`List<T>`** internally instead of exposing **arrays**, add fuzz tests. **Redeploy** hotfix.\n\n" +
      "**Prevention:** **Peer** review requires **SpotBugs** **VA** results for **varargs** PRs; ban **module-wide** suppression of **unchecked** warnings.",
  },
];

export const SENIOR_SCENARIO = seniors.map((s) => ({
  ...s,
  answer: s.answer + SENIOR_EXT,
  followUps: [{ ...FU_ONCALL }, { ...FU_TRAP }],
}));
