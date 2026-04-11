const FU_ONCALL = {
  question:
    "Interview follow-up: how does **Abstract Classes and Interfaces** show up in **production** debugging or **on-call**?",
  answer:
    "You treat every **AbstractMethodError** as **linkage**, capture **jcmd** **Thread.print** from the crashing **pod**, and diff **javap -p** on the **interface** **class** file from **canary** versus **baseline** **JARs** before you touch business rules. You add **java -verbose:class** when **ServiceLoader** might load duplicate **SPI** providers, then pin the **Gradle** **BOM** so **adapter** modules cannot trail **SDK** **interface** bumps during **rolling** deploys. You document the command bundle in the **incident** ticket so finance trusts the technical story.",
};

const FU_TRAP = {
  question: "What is a **common trap** or **follow-up** question on **Abstract Classes and Interfaces**?",
  answer:
    "Interviewers pose **interface** **static** quizzes expecting **invokestatic** binding to the declared type, not the **runtime** class. Another trap is **diamond** **default** merges where candidates forget **Iface.super.m()** qualification. You answer with **javap -c** evidence plus a note that **@FunctionalInterface** breaks the moment a second **abstract** method appears. You close with **javap -p** on **implementors** to prove every **abstract** slot is filled.",
};

const CONCEPTUAL_TAIL =
  "Staff proof bundle: pair **javap -c** with **jcmd** **Thread.print** when **AbstractMethodError** disagrees with your mental model, run **java -verbose:class** if **SPI** duplicates are suspected, cite **Java 8** **defaults**, **Java 9** **private** **interface** helpers, and **Java 17** **sealed** **permits** as the version ladder, attach those outputs to **Jira**, add **jmap -dump:live** when **ServiceLoader** noise hides **class** loader issues, and rehearse **javac -verbose** repro steps so every answer names commands reviewers replay without your laptop.";

const SENIOR_EXT =
  "\n\nStaff narrative closure: attach **javap** exports and **jcmd** **VM.flags** slices to architecture tickets, cite **Java 21** pattern **switch** exhaustiveness on **sealed** **interfaces**, demand **Gradle** locks align with **Helm** SHAs before closing linkage incidents, rehearse **jstack** captures with stakeholders so **AbstractMethodError** reads as contract skew not mystery bugs, log **java -version** beside every mitigation, publish **Prometheus** error-rate deltas proving **canary** returned to healthy baseline after **interface** alignment, correlate **jstat -class** when **metaspace** spikes follow **SPI** churn, store **javap -verbose** major-version lines next to every **BOM** bump for audit trails, and require **java --show-module-resolution** logs whenever **IllegalAccessError** follows **interface** moves across **JPMS** layers.";

const c = (question, answer) => ({
  question,
  answer: `${answer} ${CONCEPTUAL_TAIL}`,
  followUps: [{ ...FU_ONCALL }, { ...FU_TRAP }],
});

export const CONCEPTUAL = [
  c(
    "What does **abstract** mean at the **class file** level?",
    "**javac** marks **abstract** types with **ACC_ABSTRACT** and leaves **abstract** methods without bodies so the **verifier** knows **new** is illegal. **Concrete** **subclasses** must emit overriding methods so **vtable** slots receive code pointers before allocation succeeds. Partial deploys with stale **child** **JARs** surface **AbstractMethodError** when **invokevirtual** targets a missing implementation. Run **javap -p Base.class** to read **abstract** flags and **major** version before trusting a **canary** artifact. **Java 11** tightened **nestmate** access but **abstract** rules stay consistent through **Java 21**.",
  ),
  c(
    "How is an **interface** represented in bytecode before **Java 8**?",
    "**interface** types compile to **class** files with **ACC_INTERFACE** plus **ACC_ABSTRACT** implicitly on methods that lack bodies. Constants are **public static final**. **invokeinterface** selects methods through **itable** entries on the receiver. Implementors must satisfy every method or **javac** fails. Production failures move to **AbstractMethodError** when **SDK** adds methods without **default** bodies. **javap -p Port.class** lists required methods for implementors. **Java 8** added real instance methods via **defaults**, changing evolution but not the **itable** model.",
  ),
  c(
    "Explain **default** methods and **invokeinterface** together.",
    "**default** methods carry bodies on **interfaces** so libraries evolve without forcing every **implementor** to change immediately. Bytecode still uses **invokeinterface**; resolution walks **interface** hierarchies to find the **default** implementation when the **class** does not override. **AbstractMethodError** appears if a **default** disappears between **JAR** versions while clients expect it. Use **javap -c** on call sites to see **invokeinterface** targets. **Java 8** introduced **defaults**; **Java 21** still uses the same linkage rules for non-**private** peers.",
  ),
  c(
    "Why do **static** methods on **interfaces** confuse teams?",
    "**static** **interface** methods compile to **invokestatic** anchored to the **interface** type named in source, not the **implementor** class. A variable typed as **JsonLogger** still calls **LogFacet.configure** if that is where **static** lives. This mirrors **class** **static** hiding. Misreads show up as wrong telemetry tags in production. Proof is **javap -c Caller.class** showing **Methodref** owner. **Java 8** enabled **interface** **static** members; behaviour matches **Java 17** and **Java 21**.",
  ),
  c(
    "What is the **diamond** problem with **defaults**?",
    "When two **interfaces** supply colliding **default** methods, the **implementing class** must **override** and may qualify **IfaceA.super.m()** to choose behaviour. **javac** refuses ambiguous merges, so the failure is **compile-time**, not silent runtime picks. Teams migrating large **SPI** graphs hit this during **library** upgrades. Inspect **javap -c** after resolution to see **invokespecial** bridging to the chosen **default**. **Java 8** documented the rules; later releases add better diagnostics but same semantics.",
  ),
  c(
    "What do **private** **interface** methods add starting **Java 9**?",
    "**private** **instance** methods let **default** methods share validation helpers without expanding the **public** **API**. **javac** emits **invokespecial** for those helpers inside the **interface** **class** file. This reduces copy-paste **default** bodies across methods. Production benefit is cleaner **SDK** surfaces with less **binary** compatibility risk than public helpers. Verify with **javap -p** access flags. **Java 9** delivered this feature; **Java 11** LTS teams rely on it heavily.",
  ),
  c(
    "How do **sealed** **interfaces** change design in **Java 17**?",
    "**sealed** **interfaces** declare **permits** so only listed types may **implement**, letting **javac** prove exhaustiveness for pattern **switch** on **Java 21**. Runtime dispatch remains **invokeinterface**, but illegal **implements** clauses fail earlier. This models closed sums for **JSON** unions safely. **IncompatibleClassChangeError** can follow if **permits** lists disagree between **artifacts**. Diff **javap** after every **library** release. **Java 17** introduced **sealed** types; **Java 21** improves **switch** ergonomics.",
  ),
  c(
    "What is **@FunctionalInterface** at bytecode level?",
    "**@FunctionalInterface** documents a single **abstract** method for **SAM** typing; **javac** errors if another **abstract** method appears. Lambdas lower to **invokedynamic** bootstraps targeting **LambdaMetafactory**, binding to that **SAM**. Adding methods breaks streams silently at **compile** time, which is preferable to runtime chaos. Inspect synthetic classes with **javap -p** when debugging weird lambda stacks. **Java 8** introduced both features; **Java 21** continues the same bytecode pattern.",
  ),
  c(
    "Why can **abstract** classes have **constructors** if you cannot instantiate them?",
    "**Constructors** on **abstract** classes run when **concrete** **subclasses** **invoke** **super(...)** so shared fields initialize before **child** bodies execute. **invokespecial** chains still obey definite assignment. Frameworks like **Spring** sometimes **subclass** **abstract** bases for proxies. If **constructors** throw, half-initialized graphs fail fast. Review **javap -p** **`<init>`** order after **annotation** processors run. **Records** and **abstract** bases coexist on **Java 21** with the same chaining rules.",
  ),
  c(
    "Can **Java** inherit implementation from more than one **superclass**?",
    "No — **class** **extends** is single inheritance; only **interfaces** stack with **implements**. **Default** methods provide limited multiple inheritance of behaviour, resolved by explicit **override** rules. This keeps **vtable** layout predictable. Attempting **extends** twice is a **compile** error. Production teams simulate mixins via **default** methods or **composition**. **javac** enforces the graph; **javap** shows a single **super_class** index per **class** file. **Java 11** through **Java 21** share this rule.",
  ),
  c(
    "What is a marker **interface** like **Serializable**?",
    "Marker **interfaces** carry no methods; frameworks and the **JVM** consult **instanceof** to enable behaviours like serialization. Mis-declaring markers yields **NotSerializableException** at runtime when object graphs violate contracts. They are weaker than **annotations** for documentation but remain pervasive in legacy APIs. Pair markers with explicit tests because **javac** cannot validate serialization graphs. **java.io.Serializable** predates **Java 5** annotations and still matters on **Java 21** services.",
  ),
  c(
    "How does **interface** inheritance interact with **defaults**?",
    "**interface** **extends** stacks abstract and **default** methods; **implementors** inherit **defaults** unless overridden. Collisions still trigger **diamond** resolution duties. **javac** linearizes **interface** lists to decide **default** precedence. **AbstractMethodError** can still appear if a **child** **class** expects a **default** that vanished in a **dependency** bump. Track **ConstantPool** entries with **javap -p**. **Java 8** formalized the model used through **Java 21**.",
  ),
  c(
    "When should you prefer an **abstract class** over an **interface**?",
    "Choose **abstract** when you must share mutable **protected** state, **constructor**-enforced invariants, and **template** methods with **final** orchestration. Choose **interfaces** for capability composition across unrelated types, especially when **defaults** suffice for shared behaviour. **AbstractMethodError** risk rises when **abstract** bases evolve hooks across many **JARs**. Document decisions with **jdeps** summaries. **Java 8** **defaults** blurred the line but did not remove state constraints on **interfaces**.",
  ),
  c(
    "What **module** errors appear when **interfaces** leak across boundaries?",
    "**IllegalAccessError** arises when a **module** does not **exports** the package containing an **interface** your **implementor** needs, even if **javac** succeeded in a split toolchain. **ServiceLoader** in **JPMS** requires **provides** directives aligned with **uses**. Symptoms look like **Spring** **BeanCreationException** wrapping linkage faults. Debug with **java --show-module-resolution** in CI. **Java 11** **JPMS** tightened visibility; **Java 21** keeps the same enforcement.",
  ),
  c(
    "How does **ServiceLoader** relate to **interfaces**?",
    "**ServiceLoader** discovers **implementations** of an **interface** via **META-INF/services** entries or **module** **provides**. Duplicate registrations yield **ServiceConfigurationError** during **boot**. This is pure **classpath** and **module** hygiene, not business logic. Verify provider files with **jar tf**. **AbstractMethodError** can follow if a provider **class** is outdated relative to the **interface**. **Java 8** refined **ServiceLoader** stream APIs; **Java 21** adds further conveniences but linkage rules persist.",
  ),
  c(
    "Why can **interfaces** not declare **protected** methods?",
    "**protected** implies package and subclass visibility, which does not map cleanly onto **interface** implementors scattered across packages. **javac** therefore rejects **protected** on **interface** members. Use **private** helpers with **defaults** instead. This keeps **binary** compatibility predictable for **invokeinterface** clients. If you need **protected** hooks, use **abstract** bases. **Java 9** **private** **interface** methods reinforced this split without changing the **protected** ban on **Java 21**.",
  ),
  c(
    "How do **generics** interact with **abstract** methods on **interfaces**?",
    "Type parameters erase to bounds at bytecode; **bridge** methods may appear to preserve **override** compatibility. **javap -p** shows **synthetic** bridges when **interfaces** and **classes** merge generic signatures. Production **NoSuchMethodError** can follow **library** upgrades that shift bridges while clients remain stale. Always diff **javap** across versions. **Java 5** introduced **generics**; **Java 21** still relies on bridges for mixed **interface** inheritance.",
  ),
];

const CODE_BASED_TAIL =
  "Reconfirm with **javap -c** on the compiled **class** so **stdout** claims match **Methodref** targets instead of folklore, then cross-check **jcmd** **Compiler.codelist** if interviewers ask about **JIT** effects on **invokeinterface** hot loops tied to the same snippet.";

const cb = (question, answer) => ({
  question,
  answer: `${answer} ${CODE_BASED_TAIL}`,
  followUps: [{ ...FU_ONCALL }, { ...FU_TRAP }],
});

export const CODE_BASED = [
  cb(
    "What does this print?\n```java\ninterface A { static String id() { return \"A\"; } }\nclass B implements A {}\npublic class T {\n  public static void main(String[] args) {\n    B b = new B();\n    System.out.println(b.id());\n  }\n}\n```",
    "This does not compile: **static** **interface** methods are not inherited for shorthand calls on **implementor** types, so **b.id()** is illegal. If rewritten as **A.id()**, **invokestatic** would bind to **A** and print **A**. Interviewers use this to test whether you confuse **inheritance** of **static** **interface** members with **instance** dispatch.",
  ),
  cb(
    "Does this compile?\n```java\nabstract class X { abstract void m(); }\nclass Y extends X {}\n```",
    "No — **Y** must **override** **m** or be declared **abstract**. **javac** rejects **Y** because **abstract** methods remain unsatisfied, preventing safe **vtable** setup for **new Y()**. This is a **compile-time** gate, unlike **AbstractMethodError**, which is the runtime cousin when **bytecode** skews across **JARs**.",
  ),
  cb(
    "What does this print?\n```java\ninterface I { default int v() { return 1; } }\ninterface J { default int v() { return 2; } }\nclass C implements I, J {\n  public int v() { return I.super.v() + J.super.v(); }\n}\npublic class T {\n  public static void main(String[] args) {\n    System.out.println(new C().v());\n  }\n}\n```",
    "**C** resolves **diamond** by **overriding** **v** and delegating to both **defaults** via qualified **super** calls, so stdout prints **3**. **invokeinterface** on **C.v** runs the merged body while **invokespecial** handles each **default** segment. **javap -c** shows the **invokespecial** pairs clearly.",
  ),
  cb(
    "Does this compile?\n```java\ninterface I { void m(); }\n@FunctionalInterface\ninterface K extends I { void n(); }\n```",
    "No — **@FunctionalInterface** requires exactly one **abstract** method, but **K** inherits **m** and declares **n**, yielding two **abstract** methods. **javac** fails the annotation contract. Teams hit this when extending **functional** **interfaces** casually.",
  ),
  cb(
    "What does this print?\n```java\ninterface Log {\n  default void run() { System.out.print(\"D\"); }\n}\nclass Impl implements Log {}\npublic class T {\n  public static void main(String[] args) {\n    Log l = new Impl();\n    l.run();\n  }\n}\n```",
    "**invokeinterface** executes **Log**'s **default** **run** because **Impl** did not override, printing **D**. **Defaults** are true instance methods from the **interface** type's perspective. Removing the **default** later without recompiling **Impl** risks **IncompatibleClassChangeError** at load time.",
  ),
  cb(
    "Does this compile?\n```java\ninterface I { protected void x(); }\n```",
    "No — **protected** is illegal on **interface** methods; **javac** rejects the declaration. Use **private** helpers with **defaults** or move hooks to **abstract** classes. This restriction keeps **interface** **API** surfaces consistent for **invokeinterface** callers across packages.",
  ),
  cb(
    "What happens when you run `new` on an **abstract** class reference type?\n```java\nabstract class A {}\nclass T { public static void main(String[] args) { A a = new A(); } }\n```",
    "**javac** rejects **new A()** because **A** is **abstract**; no bytecode ships. If bytecode were hacked, **InstantiationError** would follow at runtime. Frameworks use **abstract** bases to force **subclassing** with proper **constructor** chains.",
  ),
  cb(
    "Does this compile on **Java 17**?\n```java\nsealed interface S permits A, B {}\nfinal class A implements S {}\nclass B implements S {}\n```",
    "**B** must be **final** or **sealed** appropriately when **S** **permits** it; a non-**final** **B** without **sealed** modifiers breaks the closed hierarchy rules and **javac** errors. **permits** lists must cover all legitimate **implementors** with correct modifiers. This catches hierarchy mistakes at **compile** time instead of via mysterious runtime behaviour.",
  ),
];

const seniors = [
  {
    question:
      "Your **Spring Boot** service dies during context refresh with **AbstractMethodError** on **com.acme.PricingPort.settleTax** right after the platform **SDK** **canary** promotes, while half the nodes still run yesterday's **adapter** **JAR**.",
    answer:
      "**Immediate response:** Cordon one failing node, run **jcmd** **<pid>** **Thread.print**, and archive the stack frame that names **settleTax**, then extract **javap -p** **PricingPort.class** from both **canary** and **lagging** **JARs** to prove method list skew.\n\n" +
      "**Root cause:** **AbstractMethodError** is **linkage**: the **interface** gained a new **abstract** method but the loaded **implementor** **class** lacks the **override**, so the **JVM** cannot bind **invokeinterface** to code.\n\n" +
      "**Fix:** Roll **adapter** **artifacts** forward with the **SDK**, or ship a temporary **default** **settleTax** that throws **UnsupportedOperationException** until versions converge; redeploy atomically and re-run **javap** on every node.\n\n" +
      "**Prevention:** Add **CI** **javap** diff gates on shared **interfaces**, enforce **BOM** alignment in **Helm** values, and block **canary** promotion when **adapter** pipelines trail **SDK** builds.",
  },
  {
    question:
      "Two platform **interfaces** both add **default void audit()** with different semantics; **javac** now refuses your **Reporter** class until you disambiguate, and product demands both behaviours in one type.",
    answer:
      "**Immediate response:** Open **javap -c** on the last green **Reporter.class** if any exists, then reproduce with **javac -verbose** locally to capture the exact **inherits unrelated defaults** diagnostic text for the architecture thread.\n\n" +
      "**Root cause:** **Java** forbids silent **default** merging; **invokeinterface** cannot choose between two unrelated bodies without an explicit **override** that sequences **Iface.super** calls.\n\n" +
      "**Fix:** Implement **audit** on **Reporter**, compose by calling **AuditA.super.audit()** then **AuditB.super.audit()** or merge logic manually, then paste **javap -c** into the design doc proving **invokespecial** ordering.\n\n" +
      "**Prevention:** Publish **SPI** style guides banning duplicate **default** names across sibling **interfaces**, add **ArchUnit** rules, and require **library** RFCs before adding **defaults** to widely implemented types.",
  },
  {
    question:
      "**On-call** sees **ServiceConfigurationError** during **boot** after a merge adds a second **META-INF/services/com.acme.PaymentGateway** file from a shaded dependency.",
    answer:
      "**Immediate response:** Run **jar tf** on the fat **JAR** from the failing pod, grep **META-INF/services**, and list duplicate files with SHA256 to show which dependency duplicated the provider entry.\n\n" +
      "**Root cause:** **ServiceLoader** parses provider configuration eagerly; duplicate or conflicting provider lines violate the **SPI** contract before **Spring** finishes wiring **beans**.\n\n" +
      "**Fix:** Exclude the duplicate resource in the shade rule or merge provider lists intentionally, rebuild, and verify with **jar tf** plus a local **java -verbose:class** smoke test.\n\n" +
      "**Prevention:** Add packaging tests that fail CI when more than one provider resource exists for the same **interface**, and document **SPI** ownership in the **module** **provides** section when using **JPMS**.",
  },
  {
    question:
      "A **Java 11** service migrates modules; **IllegalAccessError** hits when **com.acme.internal.PortImpl** tries to **implement** **com.acme.api.PaymentPort** exposed from another **module** without **exports** to the impl package.",
    answer:
      "**Immediate response:** Re-run the service locally with **java --show-module-resolution** and capture the access denial line, then open **module-info** files for both **API** and **impl** modules to see missing **exports** or **opens** directives.\n\n" +
      "**Root cause:** **JPMS** blocks **implements** relationships when the **API** package is not readable at compile and runtime, even if **javac** in a misconfigured toolchain appeared to succeed.\n\n" +
      "**Fix:** Export the **API** package to the **impl** module with **requires transitive** where appropriate, adjust **module-info**, rebuild, and confirm with **javap** that **module-info.class** matches runtime **java --list-modules**.\n\n" +
      "**Prevention:** Add **Gradle** **jlink** or **module** integration tests in CI, require **module-info** reviews for **interface** moves, and attach **java --describe-module** output to migration tickets.",
  },
  {
    question:
      "Profiling shows megamorphic **invokeinterface** fanout on **EventHandler.handle** after dozens of **implementors** register; **CPU** doubles though traffic is flat.",
    answer:
      "**Immediate response:** Capture a five-minute **Java Flight Recording** filtered on the hot **handle** method, then confirm with **jcmd** **Compiler.codelist** that **C2** refuses to inline due to **itable** width.\n\n" +
      "**Root cause:** Each new **implementor** widens **interface** dispatch; once megamorphic, **HotSpot** pays full **invokeinterface** cost per call.\n\n" +
      "**Fix:** Collapse strategies behind a **sealed** **interface** with exhaustive **switch** on **Java 21**, or map event names to **enum** handlers so bytecode lowers to **tableswitch**; verify with **javap -c** that the hot loop no longer fans out.\n\n" +
      "**Prevention:** Cap new **handler** types per release, add **JMH** dispatch regressions, and review **interface** surface growth in architecture forums.",
  },
  {
    question:
      "A **library** removes a **default** body from **Retryable.connect** between **patch** versions; **canary** pods throw **IncompatibleClassChangeError** while **baseline** stays healthy.",
    answer:
      "**Immediate response:** Diff **javap -p** **Retryable.class** between versions, screenshot **default** flag changes, and pull **jcmd** **Thread.print** from a crashing pod to anchor the error to **defineClass** during **interface** initialization.\n\n" +
      "**Root cause:** **ConstantPool** and **method** attributes for **defaults** shifted; existing **implementor** bytecode expects a **default** slot that no longer exists, so the **verifier** rejects linkage.\n\n" +
      "**Fix:** Treat as breaking **semver**: bump major, recompile all **implementors**, or restore the **default** shim temporarily; ship coordinated **BOM** updates and rerun **javap** on all **artifacts**.\n\n" +
      "**Prevention:** Bytecode compatibility suites in CI, customer-facing **changelog** entries for **interface** **default** removals, and automated **javap** diffs attached to releases.",
  },
];

export const SENIOR_SCENARIO = seniors.map((s) => ({
  ...s,
  answer: s.answer + SENIOR_EXT,
  followUps: [{ ...FU_ONCALL }, { ...FU_TRAP }],
}));
