const FU_ONCALL = {
  question:
    "Interview follow-up: how does **Nested and Inner Classes** show up in **production** debugging or **on-call**?",
  answer:
    "You run **jcmd** `<pid>` **GC.class_histogram** when **heap** retains millions of **Service$1** instances after a **handler** refactor, then open **javap -p** on that **dollar** **class** to confirm **synthetic** **this$0** pointing at a **singleton** **outer**. You pair **jstack** captures showing **Outer$Inner** frames with **jmap -histo:live** deltas across soak windows, export **Eclipse** **MAT** shortest paths to **GC** **roots** through the **callback**, and attach **javap -c** **<init>** output proving the **outer** **receiver** is stored. You finish by updating the **runbook** with a **shade** checklist so the next **on-call** engineer replays the same command ladder instead of blaming **Netty** tuning.",
};

const FU_TRAP = {
  question: "What is a **common trap** or **follow-up** question on **Nested and Inner Classes**?",
  answer:
    "Interviewers claim **lambdas** never create **inner** **classes**, so retention worries vanished after **Java 8**. You answer that **LambdaMetafactory** still captures **this** and may desugar to **private** **static** methods on the **outer**, while **anonymous** **classes** remain **Outer$1** with **invokespecial** **<init>** sites. Another trap is **reflection** calling **Class.getDeclaredConstructor().newInstance()** on a non-**static** **inner** without an **enclosing** instance, producing **IllegalArgumentException**. You close with **java -verbose:class** evidence when **NoClassDefFoundError** follows **Maven** **shade** relocations that split **NestMembers** pairs.",
};

const CONCEPTUAL_TAIL =
  "Staff proof bundle: pair **javap -p** **Outer$Inner.class** with **jcmd** **GC.class_histogram** when **heap** retains unexpected **dollar** **classes**, run **jmap -histo:live** if **metaspace** climbs after **per-connection** **handlers**, cite **Java 11** **NestHost**/**NestMembers**, **Java 8** **invokedynamic** **lambdas**, and **Java 21** verifier rules that still honor **nest** **mates**, attach **MAT** **path** **to** **GC** **roots** screenshots, add **jstack** samples naming **callback** frames, rehearse **java -verbose:class** for **shade** regressions, and demand **javap** diffs on **PRs** that touch **nested** **DTOs** so reviewers replay bytecode evidence without your laptop.";

const SENIOR_EXT =
  "\n\nStaff narrative closure: attach **javap** **NestMembers** dumps and **jcmd** **VM.flags** slices to architecture tickets, cite **Java 11** **nest** **private** access when reviewers question **synthetic** **bridges**, demand **shade** rules keep **Outer$Inner** pairs aligned before closing incidents, rehearse **jstack** captures with stakeholders so **heap** leaks read as **this$0** coupling not random **framework** faults, log **java -version** beside every mitigation, publish **Prometheus** **heap** deltas proving **canary** recovered after **static** **nested** refactors, correlate **jstat -gc** when **tenured** growth follows **handler** churn, store **javap** diffs next to every **nested** **callback** **PR**, require **ArchUnit** failures to block merges when **non-static** **inner** **handlers** attach to **singleton** **beans**, add **Flight** **Recording** slices when **CPU** regressions follow **lambda** migrations, file **JMH** baselines when reviewers question **indy** overhead, and capture **java -Xlog:class+load** excerpts when **NoClassDefFoundError** correlates with **fat** **JAR** diffs.";

const c = (question, answer) => ({
  question,
  answer: `${answer} ${CONCEPTUAL_TAIL}`,
  followUps: [{ ...FU_ONCALL }, { ...FU_TRAP }],
});

export const CONCEPTUAL = [
  c(
    "What does **javac** emit for a non-**static** **inner** **class** at the **field** level?",
    "The **compiler** adds a **synthetic** field, commonly **this$0**, holding the **enclosing** **instance** reference. The **inner** **<init>** takes a hidden **outer** parameter that **aload** instructions store into **this$0** before other **fields** initialize. **invokevirtual** on **inner** methods often begins with **getfield** **this$0** to reach **outer** **state**. Production **heap** dumps show **inner** objects keeping entire **Spring** **context** graphs alive through that edge. **javap -p** is the authoritative view because **source** code hides the **synthetic**. **Java 8** through **Java 21** all use the same **model**; **Java 11** added **NestHost** metadata but did not remove **this$0**.",
  ),
  c(
    "How does a **static** **nested** **class** differ in **bytecode** from an **inner** **instance** **class**?",
    "**static** **nested** **types** compile to **Outer$Nested.class** without an implicit **outer** **field**; **new** uses **invokespecial** on the **nested** **<init>** without passing **Outer.this** unless you added explicit **constructor** parameters. **Inner** **types** require an **outer** **receiver** at construction time and retain it through **this$0**. Mislabeling them in design reviews causes **memory** leaks when **callbacks** capture **outer** accidentally. **Diagnostic**: compare **javap -p** outputs side by side. **Java 17** **records** as **static** **nested** **DTOs** avoid accidental **outer** coupling for **JSON** APIs.",
  ),
  c(
    "What are **NestHost** and **NestMembers** and why did **Java 11** add them?",
    "**NestHost** names the **top-level** **class** that owns the **nest**; **NestMembers** lists every **nested** **mate** allowed **private** access without widening **source** **visibility**. The **compiler** lowers **private** **field** reads across **nest** **mates** to **invokespecial** **synthetic** **accessor** methods the **verifier** accepts. **Reflection** and **MethodHandles** gained **Lookup** **defineHiddenClass** awareness of **nest** boundaries. Production impact is mostly **tooling**: **javap** now prints attributes you must diff after **shade** relocations. **Java 11** introduced the attributes; **Java 21** keeps the same **verification** story.",
  ),
  c(
    "Why can **inner** **classes** cause **memory** **leaks** in **event**-driven services?",
    "A **long**-lived **listener** or **Vert.x** **Handler** instance that is a non-**static** **inner** keeps a **reference** to its **outer** through **this$0**. Even after the **request** ends, the **event** **bus** may retain the **handler**, pinning the **outer** **singleton** and everything it references. Symptoms are **metaspace** growth and **tenured** **heap** inflation without rising **QPS**. **Fix** by converting to **static** **nested** **types** with explicit **dependencies**. Verify with **jcmd** **GC.class_histogram** counting **Outer$** **classes** and **MAT** paths to **GC** **roots**.",
  ),
  c(
    "How do **anonymous** **classes** get named on disk?",
    "**javac** assigns **Outer$1**, **Outer$2**, etc., in declaration order within a compilation unit, producing separate **class** **files** per **anonymous** body. Each still uses **invokespecial** **<init>** at the **new** site and may capture **outer** **this** like any **inner**. **Metaspace** churn appears when code allocates fresh **anonymous** instances per **request** on hot paths. **javap -p** lists **synthetic** **fields** for captures. **Java 7** style **anonymous** **Runnable** loops are a classic **production** smell modern teams replace with **lambdas** or shared tasks.",
  ),
  c(
    "How does a **lambda** differ **bytecode**-wise from an **anonymous** **SAM** **wrapper**?",
    "**Lambdas** usually emit **invokedynamic** bootstrapped by **LambdaMetafactory**, targeting a **desugared** **private** method holding the body. **Anonymous** **classes** are separate **class** **files** with **invokespecial** **<init>**. Captured **variables** become **constructor** parameters for either form, so **outer** **this** retention still happens when referenced. **Profiler** hotspots shift between **metaspace** for many **anonymous** classes versus **indy** **linking** costs for **lambdas**. Proof is **javap -c** showing **invokedynamic** versus **new** **Outer$1**. **Java 8** delivered **lambdas**; **Java 21** keeps the same lowering pattern on **HotSpot**.",
  ),
  c(
    "What **exception** appears when **reflection** tries to instantiate a non-**static** **inner** without an **outer**?",
    "**Class.getDeclaredConstructor().newInstance()** on **Outer.Inner** without supplying the **enclosing** **instance** yields **IllegalArgumentException** with messaging about missing **enclosing** instance. The **JVM** requires the **outer** **receiver** to construct **inner** **objects** because **bytecode** passes it as the first **constructor** argument. Frameworks that **reflectively** **instantiate** **nested** **beans** hit this during **wiring**. **Fix** by using **Constructor.newInstance(outer)** or refactoring to **static** **nested** **types**. **javap -p** shows whether **static** modifier is present.",
  ),
  c(
    "Why is **serialization** of non-**static** **inner** **classes** risky?",
    "**ObjectOutputStream** writes **synthetic** fields linking the **inner** instance to its **outer**; **deserialization** reconstructs both graphs. If the **outer** is not **Serializable** or **class** **loaders** differ, you see **InvalidClassException** or subtle **state** divergence. **JSON** mappers may also struggle when **DTOs** are **inner** **types** because they lack a stable **enclosing** context. Prefer **static** **nested** **records** at API boundaries. **Java 17** **serialization** filters help but do not fix bad **nested** modeling.",
  ),
  c(
    "How do **Maven** **shade** plugins break **Outer$Inner** pairs?",
    "Relocating **com.acme.Outer** while leaving **Inner** **ConstantPool** entries pointing at the old **binary** name produces **NoClassDefFoundError** or **IncompatibleClassChangeError** during **defineClass**. The **JVM** loads **Outer$Inner** as a separate **entity** whose **name** must stay consistent with **NestMembers** metadata after **Java 11**. **java -verbose:class** on a **canary** shows which **class** file fails first. **Fix** by paired relocations or excluding **nested** companions from relocation rules. Always diff **javap -verbose** before promoting **fat** **JARs**.",
  ),
  c(
    "Can a **static** **nested** **class** access **private** **members** of its **outer**?",
    "Yes — **javac** generates **synthetic** **bridge** methods or **access** stubs so **static** **nested** code can read **private** **outer** **fields** without changing **source** **visibility**. **NestHost** on **Java 11**+ formalizes this as **nest** **mate** access checked by the **verifier**. Interviewers expect you to distinguish **source** **private** from **bytecode** **accessors**. Proof command remains **javap -p** on the **outer** **class** listing **access$** methods. This behavior is unchanged on **Java 21**.",
  ),
  c(
    "How do **local** **classes** capture **effectively** **final** locals?",
    "**javac** hoists captured values into **synthetic** **constructor** parameters and **fields** on the **local** **class**, similar to **inner** capture mechanics but scoped to the **method** frame. **bytecode** at the **new** site passes loaded locals into **<init>**. Misuse inside tight loops can allocate many **Outer$1Local** classes, stressing **metaspace**. **javap -p** reveals **val$** **synthetics**. **Java 8** clarified **effectively** **final** rules used through **Java 21**.",
  ),
  c(
    "What is the **binary** name of a **nested** **enum**?",
    "**Enums** nested inside a **class** compile to **static** **final** **classes** with **Outer$EnumName** binary names unless declared inside an **interface** where they are implicitly **static** as well. **Class.forName** must use dollar separators, not dots between **outer** and **enum**. Wrong names cause **ClassNotFoundException** in **reflection** heavy **plugins**. Verify with **javap** or **Class.getName**. This naming convention predates **Java 5** and persists on **Java 21**.",
  ),
  c(
    "How does **JUnit 5** **@Nested** relate to **Java** **inner** **classes**?",
    "**@Nested** test **classes** are **inner** **instances** requiring an **outer** test instance, so **lifecycle** methods run in an **instance** context. Shared **mutable** **fields** on the **outer** test can create order-dependent flakes when **nested** cases **mutate** them. **static** **nested** test helpers avoid accidental **sharing**. Understanding **this$0** explains why **@BeforeEach** ordering matters. Use **javap -p** on test **classes** when diagnosing strange **initialization** failures. **Java 17** test **kits** commonly run on **JUnit 5** with this model.",
  ),
  c(
    "Why might **Jackson** fail to deserialize a non-**static** **inner** **DTO**?",
    "**Jackson** needs either a **default** **constructor** on a **static** **nested** type or explicit **creators**; non-**static** **inner** **types** implicitly need an **outer** instance that **JSON** does not carry, leading to **IllegalArgumentException** or **InvalidDefinitionException** depending on version. The **fix** is **static** **nested** **records** or **DTOs** at the API edge. Capture failing **stack** traces with **jcmd** **Thread.print** during **integration** tests. **Java 17** **records** reduce boilerplate once the type is **static**.",
  ),
  c(
    "What does **invokespecial** on an **inner** **constructor** signify at **call** sites?",
    "**invokespecial** initializes the **inner** **object** after **new** allocates it; the **operand** **stack** must already contain the **outer** reference followed by **constructor** arguments. **javap -c** shows **dup**/**aload** patterns moving the **outer** reference into place. Confusing this with **invokestatic** construction of **static** **nested** types is a common **interview** failure mode. Miscompiled **call** sites surface as **VerifyError** in exotic **bytecode** generators, more often **NoSuchMethodError** when **signatures** mismatch after **library** upgrades. **Java 21** **class** **file** version **65** still uses the same **opcode** story.",
  ),
  c(
    "How do you prove a **callback** no longer retains an **outer** after refactor?",
    "Capture **jcmd** **GC.class_histogram** before and after load tests, comparing counts of **Outer$** **classes** and **instances**. Open **javap -p** on the new **handler** **class** to ensure **this$0** disappeared. If counts fall but **heap** remains high, take **jmap -dump:live** and inspect **MAT** dominator trees for alternate **retention** paths. Attach histogram diffs to the **PR**. **Java 11**+ **NestHost** metadata should remain consistent across modules. This evidence satisfies **Staff** reviewers faster than anecdotal **profiler** screenshots alone.",
  ),
  c(
    "When should you prefer a **package-private** top-level **class** over a **nested** **type**?",
    "Choose **top-level** **classes** when multiple **packages** need the **type** without forcing a **dependency** on the **outer** API surface. **Nested** **types** communicate **logical** grouping and access to **private** **outer** state. Over-**nesting** produces **fat** **outer** **compilation** units and confusing **binary** names for **reflective** tools. **ArchUnit** can enforce boundaries. **Java** **modules** (**JPMS**) still expose **nested** **types** through **qualified** **exports** when needed. The decision is about **team** readability and **classpath** hygiene, not **micro** performance.",
  ),
];

const CODE_BASED_TAIL =
  "Reconfirm with **javap -c** on the compiled **class** so **stdout** claims match **new**/**invokespecial** sequences instead of intuition, cross-check **jcmd** **Compiler.codelist** if the interviewer asks about **indy** **linking** costs, and mention **jmap -histo:live** when **metaspace** spikes follow **anonymous** **per-request** allocations.";

const cb = (question, answer) => ({
  question,
  answer: `${answer} ${CODE_BASED_TAIL}`,
  followUps: [{ ...FU_ONCALL }, { ...FU_TRAP }],
});

export const CODE_BASED = [
  cb(
    "Does this compile?\n```java\nclass Outer {\n  class Inner {}\n  static void m() {\n    Inner i = new Inner();\n  }\n}\n```",
    "It does not compile: **static** **method** **m** lacks an **enclosing** **Outer** **instance**, but **Inner** requires **Outer.this** for construction. **javac** errors before **bytecode** emission. The **fix** is **outer.new Inner()** from an **instance** context or make **Inner** **static**.",
  ),
  cb(
    "What does this print?\n```java\nclass Outer {\n  static class Nested {\n    static String id() { return \"N\"; }\n  }\n}\npublic class T {\n  public static void main(String[] args) {\n    System.out.println(Outer.Nested.id());\n  }\n}\n```",
    "**static** **nested** **Nested** loads like a **top-level** **type** scoped under **Outer**; **id** is **static**, so **invokestatic** calls it without an **outer** instance. Stdout prints **N**. **javap** would show **Outer$Nested.class** without **this$0**.",
  ),
  cb(
    "What does this print?\n```java\nclass Outer {\n  int x = 2;\n  class Inner {\n    int f() { return x; }\n  }\n}\npublic class T {\n  public static void main(String[] args) {\n    Outer o = new Outer();\n    System.out.println(o.new Inner().f());\n  }\n}\n```",
    "**Inner** carries **this$0** referencing **o**; **f** reads **outer** field **x** through that **synthetic** link. **getfield** loads **x** from the **outer** after **getfield** **this$0**. Stdout prints **2**.",
  ),
  cb(
    "What does this print?\n```java\npublic class T {\n  public static void main(String[] args) {\n    String s = \"hi\";\n    Runnable r = () -> System.out.println(s);\n    s = \"bye\";\n    r.run();\n  }\n}\n```",
    "It fails to compile because **s** is not **effectively** **final** once reassigned; **lambda** capture requires **final** or **effectively** **final** locals. **javac** rejects the capture, unlike a mutable **ArrayList** reference where the reference itself stays final.",
  ),
  cb(
    "What does this print?\n```java\npublic class T {\n  public static void main(String[] args) {\n    final int v = 3;\n    class L { int g() { return v; } }\n    System.out.println(new L().g());\n  }\n}\n```",
    "**Local** **class** **L** captures **v** via **synthetic** **constructor** parameter **val$v**; **g** returns that constant. Stdout prints **3**. **javap -p** shows **synthetics** even though **source** looks simple.",
  ),
  cb(
    "What does this print?\n```java\nclass Outer {\n  int x = 1;\n  class Inner {\n    int x = 2;\n    int sum() { return x + Outer.this.x; }\n  }\n}\npublic class T {\n  public static void main(String[] args) {\n    Outer o = new Outer();\n    System.out.println(o.new Inner().sum());\n  }\n}\n```",
    "Inner field **x** shadows **outer** **x**; **Outer.this.x** qualifies the **outer** value. **sum** returns **2 + 1**. Stdout prints **3**. **bytecode** uses **getfield** on **this** versus **getfield** **this$0** paths.",
  ),
  cb(
    "Does this compile?\n```java\nclass Outer {\n  void run() {\n    Runnable r = new Runnable() {\n      public void run() { System.out.println(Outer.this); }\n    };\n  }\n}\n```",
    "It compiles: **anonymous** **Runnable** is an **inner** **class** with **this$0** to **Outer**, so **Outer.this** inside **run** refers to the **enclosing** instance. **javap** would show **Outer$1.class** implementing **Runnable**.",
  ),
  cb(
    "What does this print?\n```java\nclass Outer {\n  static class Nested {}\n}\npublic class T {\n  public static void main(String[] args) {\n    System.out.println(new Outer.Nested() instanceof Outer.Nested);\n  }\n}\n```",
    "**instanceof** checks the **runtime** **class** of **new Outer.Nested()**, which is exactly **Outer$Nested**, so the expression is **true** and prints **true**. No **outer** instance participates because **Nested** is **static**.",
  ),
];

const seniors = [
  {
    question:
      "After a **WebSocket** deploy, **Grafana** shows **heap** climbing while **active** **connections** stay flat; **MAT** dominators point at **OrderService$1** instances.",
    answer:
      "**Immediate response:** Run **jcmd** `<pid>` **GC.class_histogram** on a leaking pod and **javap -p** **OrderService$1.class** in the deployed **artifact** to confirm a **synthetic** **this$0** field.\n\n" +
      "**Root cause:** Each **handler** is a non-**static** **inner**/**anonymous** **callback** retaining **OrderService.this**, so the **singleton** **service** graph stays reachable until the **handler** is collected.\n\n" +
      "**Fix:** Refactor handlers to **static** **nested** **types** taking **OrderService** as an explicit **constructor** argument (or inject interfaces), redeploy, and re-run histogram diffs showing **OrderService$** counts near zero.\n\n" +
      "**Prevention:** **ArchUnit** rule banning new **non-static** **nested** **handlers** in **service** packages; **code review** checklist requiring **javap -p** screenshots for **PRs** touching **event** registration.",
  },
  {
    question:
      "**Canary** **pods** throw **NoClassDefFoundError: com/acme/shaded/Outer$Inner** right after a **Maven** **shade** release; **baseline** **JAR** worked.",
    answer:
      "**Immediate response:** Launch **java -verbose:class** on the **canary** to capture the first failing **load**, then **javap -verbose** both **Outer.class** and **Outer$Inner.class** inside the **fat** **JAR** for mismatched **binary** names.\n\n" +
      "**Root cause:** **Relocation** rules renamed **Outer** without updating **Inner** **ConstantPool** references or **NestMembers** lists, so the **class** **loader** cannot **define** the **nested** **pair** consistently.\n\n" +
      "**Fix:** Adjust **shade** configuration to relocate **Outer$Inner** together or exclude the package from relocation, rebuild, and verify with **jar tf** plus **javap** before promotion.\n\n" +
      "**Prevention:** **CI** step diffing **javap -verbose** **NestMembers** between **release** candidates; **runbook** entry tying **NoClassDefFoundError** to **JAR** diff first.",
  },
  {
    question:
      "**Spring** **REST** tests fail with **JsonMappingException** after codegen starts emitting **non-static** **inner** **DTOs** for nested **OpenAPI** models.",
    answer:
      "**Immediate response:** Open **javap -p** on the generated **DTO** to see missing **static** modifier and **synthetic** **this$0**, then reproduce with a minimal **ObjectMapper** **readValue** call in isolation.\n\n" +
      "**Root cause:** **Jackson** cannot fabricate the **enclosing** **controller** instance required by **inner** **classes**, so **deserialization** cannot construct legal **objects**.\n\n" +
      "**Fix:** Switch templates to **static** **nested** **records** or **top-level** **classes**, regenerate sources, and add **round-trip** tests.\n\n" +
      "**Prevention:** **Codegen** lint forbidding **inner** **DTOs**; **OpenAPI** **generator** config pinned in **Git** with **ArchUnit** tests on **classpath** **names**.",
  },
  {
    question:
      "A **profiler** shows hot **private** **static** **lambda$run$0** methods on **Outer** after migrating **anonymous** **Runnable** code to **lambdas**; leadership fears a **regression**.",
    answer:
      "**Immediate response:** Run **javap -c -p Outer.class** and count **invokedynamic** sites versus old **Outer$1** **class** files from the previous **build** artifact stored in **Nexus**.\n\n" +
      "**Root cause:** **LambdaMetafactory** desugars bodies into **private** **static** methods on the **capturing** **class**; this is expected **Java 8**+ behavior, not a miscompile.\n\n" +
      "**Fix:** If **capture** is unnecessary, replace with **method** references; otherwise document that **CPU** shifts from **metaspace** allocation to **indy** **linking** once.\n\n" +
      "**Prevention:** **Performance** **guild** note explaining **lambda** lowering; **JMH** microbench comparing **anonymous** versus **lambda** on the specific **SAM** path.",
  },
  {
    question:
      "**On-call** sees **IllegalArgumentException: no enclosing instance** when a **DI** framework **reflectively** constructs **com.acme.Service$Builder** during **integration** tests only.",
    answer:
      "**Immediate response:** **javap -p com.acme.Service$Builder.class** to see whether **Builder** lacks **static**; if non-**static**, capture the **failing** **Constructor** **toString** from logs.\n\n" +
      "**Root cause:** **Reflection** invoked **newInstance** on an **inner** **class** without passing the **Service** **outer** reference required by **bytecode**.\n\n" +
      "**Fix:** Make **Builder** **static** **nested** (idiomatic pattern) or change **framework** config to supply **outer** instances explicitly.\n\n" +
      "**Prevention:** **Checkstyle**/**Error** **Prone** rules preferring **static** **nested** **builders**; **integration** tests that **assert** **Modifier.isStatic** on **builder** **classes**.",
  },
  {
    question:
      "Two **microservices** share a **fat** **JAR** library; one sees **IncompatibleClassChangeError** referencing **NestMembers** after a partial **hotfix** ships only to **service** **A**.",
    answer:
      "**Immediate response:** Diff **javap -verbose** **NestHost**/**NestMembers** attributes between **service** **A** and **B** artifacts using the same **library** coordinate but different **patch** versions.\n\n" +
      "**Root cause:** **Java 11** **nest** metadata must stay consistent across **class** **files** loaded together; mismatched **Outer** and **Outer$Inner** pairs violate **nest** **mate** constraints.\n\n" +
      "**Fix:** Roll forward both services to the same **rebuilt** **library** version or roll back the partial patch so **Outer$Inner** pairs match **byte-for-byte** in **NestMembers**.\n\n" +
      "**Prevention:** **Release** train policy forbidding split **library** versions across **tightly** coupled **deploy** groups; **dependency** convergence **enforcer** in **Maven**/**Gradle**.",
  },
];

export const SENIOR_SCENARIO = seniors.map((s) => ({
  ...s,
  answer: s.answer + SENIOR_EXT,
  followUps: [{ ...FU_ONCALL }, { ...FU_TRAP }],
}));
