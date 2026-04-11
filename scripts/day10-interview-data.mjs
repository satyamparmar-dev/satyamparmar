const FU_ONCALL = {
  question:
    "Interview follow-up: how does **Inheritance and Polymorphism** show up in **production** debugging or **on-call**?",
  answer:
    "You treat every **`ClassCastException`** as a **receiver** versus **reference** mismatch, capture **`jcmd <pid> Thread.print`** from the failing **pod**, and diff **`javap -c`** on the **`Promotion`** **class** pulled from the **canary** versus **baseline** **JAR**. You add **`java -verbose:class`** traces when **two** **`Customer`** classes appear from different **loaders**, then pin the **Gradle** **BOM** so **child** modules cannot trail **base** **interface** changes during **rolling** deploys. You document the command bundle in the **incident** ticket so the next engineer repeats the proof instead of guessing.",
};

const FU_TRAP = {
  question: "What is a **common trap** or **follow-up** question on **Inheritance and Polymorphism**?",
  answer:
    "Interviewers pose **static** hide puzzles: **`Animal ref = new Dog(); ref.stats();`** where **`stats`** is **static**, expecting you to prove **`invokestatic`** binds to **`Animal`**. Another trap is **`equals`** across **`Sub`** and **`Super`** mixing **`getClass`** with **`instanceof`**, breaking **`HashMap`** invariants until **`jmap -dump`** shows duplicate logical keys. You answer with **`javap -p`** evidence plus **`record`** **`equals`** in **Java 21** when you need safe **`value`** aggregation.",
};

const CONCEPTUAL_TAIL =
  "Staff proof bundle: pair **javap -c** with **jcmd** **Thread.print** when KPIs disagree with expected dispatch, run **java -verbose:class** if shading might duplicate **Promotion**, cite **Java 17** **sealed** types plus **Java 21** exhaustive pattern **switch** as compile-time guardrails that **Java 11** still misses, and attach those command outputs to the Jira ticket so finance trusts the technical story.";

const SENIOR_EXT =
  "\n\nStaff narrative closure: attach **Java Flight Recording** slices and **javap -p** exports to the architecture ticket, cite **Java 21** LTS behaviour governing **itable** versus **vtable** costs, and demand **Gradle** locks align with **Helm** SHAs before closing the incident. Rehearse **jstack** captures with stakeholders so they see **AbstractMethodError** and **IncompatibleClassChangeError** as linkage truths, not mystery bugs, log the exact **java -version** string beside every mitigation, correlate **jcmd** **VM.native_memory summary** when **metaspace** spikes follow loader explosions, and publish **Prometheus** latency deltas proving the canary returned to healthy service baseline.";

const c = (question, answer) => ({
  question,
  answer: `${answer} ${CONCEPTUAL_TAIL}`,
  followUps: [{ ...FU_ONCALL }, { ...FU_TRAP }],
});

export const CONCEPTUAL = [
  c(
    "What is inheritance in Java at the **class file** and **JVM** level?",
    "**Inheritance** compiles to a **child** **class** file whose **super_class** index names the **parent** **symbol**, letting the **verifier** enforce **method** resolution order. **Field** layouts interleave **superclass** state before **subclass** slots so **constructors** zero **parent** memory first. **invokevirtual** still resolves overridden bodies using the **receiver’s** **vtable**, not the **reference** type. In production, mismatched **JAR** pairs surface **`IncompatibleClassChangeError`** when **two** loaders disagree on **super** shape. Run **`javap -verbose Child.class`** and read **super_class** metadata plus **major version** before you trust a rolling **deploy**. **Java 17** **sealed** **hierarchies** add **`permits`** lists so compilers reject illegal **extends** at **compile** time instead of waiting for **`VerifyError`**. **Interview angle:** Always pair UML sketches with **`super_class`** facts."
  ),
  c(
    "What is polymorphism in Java and how does **`invokevirtual`** behave?",
    "**Polymorphism** means **supertype** references execute **subtype** **instance** methods through **dynamic** dispatch. **HotSpot** executes **`invokevirtual`** by loading the **receiver’s** **Klass** pointer, scanning its **vtable** slot for the target **method**, and jumping to the **JIT**-compiled or interpreted body. **static**, **private**, and **final** **instance** methods skip that table. In production, a missed **`@Override`** creates an **overload** that never runs on the **subtype**, so **`PromotionEngine.apply`** keeps charging stale prices — **`javap -c`** shows **`invokevirtual`** still targeting **`Base`**. Capture proof with **`javap -c -p engine.class`** during code review. **Java 11** improved **NestMate** access for **private** **lambda** helpers but does not change **vtable** rules. **Interview angle:** Tie dispatch answers to **`invokevirtual`** evidence."
  ),
  c(
    "Explain dynamic method dispatch vs **static** method resolution.",
    "**Dynamic** dispatch applies to **virtual** **instance** methods: the **JVM** consults the **receiver** at runtime. **static** methods compile to **`invokestatic`**, binding purely to the **reference** type printed in source, even if a **subclass** defines another **static** with the same signature. At bytecode level **`invokestatic`** embeds the owning **class** name; **`invokevirtual`** embeds a **method** reference resolved through the **object**. In production, **`static`** hide bugs look like flaky **feature** toggles because some call sites hit **child** helpers while **`Base`** references hit **parent** code. Verify with **`javap -c Utility.class`** and note which bytecode prefixes appear. **Java 8** **default** **methods** add **`invokeinterface`** complexity but still differ from **`invokestatic`**. **Interview angle:** Never claim **static** **polymorphism**."
  ),
  c(
    "Can constructors be inherited — what does **`invokespecial`** enforce?",
    "**Constructors** are not inherited as callable members; each **class** declares its own **`<init>`** methods. **Subclass** constructors must chain **`super(...)`** or **`this(...)`** first so **`invokespecial`** runs **parent** **field** initialization before **child** **final** fields are definite-assigned. The **compiler** inserts implicit **`super()`** only when a zero-arg **parent** constructor exists. In production, missing explicit **`super(args)`** yields **`CompileError`**, but partial bytecode weaving can surface **`VerifyError`** if tools rewrite **constructors** incorrectly. Inspect **`javap -p OrderDTO.class`** for **`<init>`** order during **Lombok** upgrades. **Java 21`** **`record`** canonical constructors still obey the same definite-assignment rules. **Interview angle:** Link constructor stories to **`invokespecial`** ordering."
  ),
  c(
    "Why use **`@Override`** beyond style?",
    "**@Override** asks **`javac`** to prove your method truly overrides a **superclass** or **default** **interface** member; signature drift becomes **compile** failure instead of silent **overload**. Without it, a typo like **`applyPromo`** vs **`applyPromotion`** compiles yet keeps calling **`Base`**. At bytecode level the difference is whether **`invokevirtual`** targets the **child** slot. Production **`SKU`** pricing bugs often trace to that mistake. Add **`javac -Xlint:overrides`** in CI to catch future regressions, then archive **`javap -c`** with the ticket. **Java 5** introduced the annotation; **Java 6** enforced **interface** overrides too. **Interview angle:** Treat **`@Override`** as bytecode insurance."
  ),
  c(
    "What is **static** method hiding vs overriding?",
    "**Hiding** occurs when a **subclass** declares a **static** method with the same signature as a **superclass** **static** method; the child definition shadows but does not replace parent bytes for **`invokestatic`**. **Overriding** requires **instance** methods and **`invokevirtual`**. Interviewers test whether you know **`Animal.walk(Dog d)`** still executes **`Animal.walk`** when declared **static**. Production logging utilities often “**fix**” logging in **subclasses** yet **`Base`**** references keep old strings. **`javap -c`** exposes **`invokestatic`** class names. **Java 8** docs formalize hide rules; nothing changed in **Java 17** for this split. **Interview angle:** Demonstrate with **`javap`**, not analogies."
  ),
  c(
    "What is a covariant return type on **override**?",
    "Covariance lets a **subclass** **override** return a **subtype** of the original reference return (`**Number**` → `**Integer**`). The **compiler** emits **bridge** methods so erased bytecode stays compatible with **`invokevirtual`** expectations. **`javap -p`** shows **`Synthetic`** bridge entries. Production **`REST`** clients sometimes deserialize narrower DTOs while **`supertype`** factories still compile, revealing confusion only after **deploy**. Inspect bridges whenever **Jackson** or **MapStruct** regenerate mappers. **Java 5** introduced covariant returns; **Java 21** records emphasize immutability but keep the same bridge story. **Interview angle:** Mention **synthetic** bridges explicitly."
  ),
  c(
    "Why avoid deep inheritance trees?",
    "Deep trees concentrate behaviour in brittle **bases**, forcing unrelated **features** through **`protected`** hooks that violate **Liskov** when **subclasses** cannot substitute cleanly. **vtable** growth and hot **CHA** deoptimization make refactors expensive. Production symptoms include **`AbstractMethodError`** cascades when **base** adds hooks but some **children** lag. Prefer **composition** (policy objects) with thin **extends** roots; verify coupling with **`jdeps`** and static graph tools before approvals. **Java 17** **sealed** classes help cap depth explicitly. **Interview angle:** Pair depth complaints with deployment coupling stories."
  ),
  c(
    "What distinguishes **abstract** classes from concrete classes?",
    "**abstract** classes may mix concrete and **abstract** methods; you cannot **`new`** them because **`invokespecial <init>`** would leave **abstract** stubs unresolved. Concrete **subclasses** supply bodies so **vtable** slots gain code pointers. Production frameworks (**Spring**) subclass **abstract** templates for **DataSource** beans; partial bytecode on nodes yields **`InstantiationError`**. Use **`javap -p abstract/BaseRepo.class`** to list **abstract** flags before mocking. **Java 8+** allows **static** helpers inside **abstract** types. **Interview angle:** Connect **abstract** to **template** pattern security."
  ),
  c(
    "How do **`equals`** and **`hashCode`** interact under **inheritance**?",
    "**equals** symmetry breaks when **`Super`** uses **`getClass`** checks while **`Sub`** widens with **`instanceof`**, letting unequal pairs appear equal depending on reference ordering **`HashMap`** buckets diverge. **JVM** does not auto-fix this; **`hashCode`** must follow the same fields as **equals**. Production caches leak memory or double-charge when **`equals`** lies. Inspect with **`jmap -dump`** histograms and **MAT** duplicate key reports. **Java 7** `Objects.hash` helpers reduce mistakes; **Java 21** **`record`** generates consistent pairings automatically. **Interview angle:** Highlight **Liskov** + **Map** contracts."
  ),
  c(
    "What is the **Liskov Substitution Principle** in JVM terms?",
    "**Liskov** means any **`Sub`** instance passed where **`Super`** is expected must keep **observable** behaviour contracts — preconditions not strengthened, postconditions not weakened, exceptions not broadened arbitrarily. Violations compile yet explode as subtle **`ClassCastException`** or business rule faults. **`javac`** cannot prove **Liskov**; tests + code review must. **`jcmd`** stacks show weird **`IllegalStateException`** when **`Sub`** rejects states **Super** promised to allow. **Java 17** **sealed** hierarchies help compilers enforce allowed **subtypes**. **Interview angle:** Talk contracts, not slogans."
  ),
  c(
    "What happens if a **subclass** constructor omits **`super(...)`** when **parent** lacks a no-arg constructor?",
    "The **compiler** inserts **`super()`** only when **parent** exposes **`()`**; otherwise you must explicitly **`super(args)`** as the first statement. Failure is **`CompileError: no suitable constructor found`**. At bytecode level **`invokespecial`** must match the chosen **parent** **`<init>`**. Production codegen tools (**MapStruct**, **Immutables**) sometimes reorder **constructor** args incorrectly—CI catches it only if **`javac`** runs clean. **`javap -p`** after generation proves the chain. **Records** in **Java 21** still delegate compaction rules. **Interview angle:** Pair with **annotation** processor incidents."
  ),
  c(
    "Can **`private`** **methods** be overridden?",
    "**private** **methods** belong to the declaring **class** only; **JVM** wires **`invokespecial`** directly without **`vtable`** override slots. **Subclass** methods with the same name are unrelated — not overrides. Production devs think they “fixed” validation but **Parent** still calls **`private`** helpers. Verify by reading **`javap -p`** access flags; **`private`** entries cannot carry **`@Override`**. **Project Valhalla** work does not change this separation. **Interview angle:** Contrast with **package-private** overrides."
  ),
  c(
    "What does a **`final`** class block in inheritance terms?",
    "**final** on a **class** forbids **`extends`**, freezing the **vtable** surface for security or immutability. **Subclassing String** is illegal for exactly this reason. Production SDKs mark DTOs **`final`** to stop **framework** proxies from subclassing; **Spring** may fail with **`CannotSubclassException`** when misconfigured. Use **`javap -p dto.class`** to confirm **`ACC_FINAL`**. **Java 17** **sealed** offers a softer alternative when you need controlled **permits**. **Interview angle:** Mention **security** **attack** surfaces."
  ),
  c(
    "How do **sealed** types change **`instanceof`** and **`switch`** reasoning?",
    "**sealed** **`permits`** lists close the **inheritance** graph so the **compiler** knows every **subtype**, enabling exhaustive **`switch`** warnings when **pattern** matching in **Java 21**. Runtime still uses **`invokevirtual`**, but **`javac`** can reject unhandled cases earlier. Production **`JSON`** adapters gain safer sum types; missing branches become **compile** errors instead of **`default`** bombs. Use **`javap module-info`** plus **`--release 21`** in CI. **Java 17** introduced **sealed**; **Java 21** polished **pattern** **`switch`**. **Interview angle:** Tie to incident prevention on polymorphic payloads."
  ),
  c(
    "When should you prefer **composition** over **inheritance**?",
    "**Composition** delegates behaviour to collaborators, avoiding **fragile base class** coupling while still satisfying **`interface`** contracts. **JVM** sees smaller **vtable** graphs and clearer **`invokespecial`** chains during construction. Production microservices factor **retry** policies as collaborators instead of subclassing **`HttpClient`** five levels deep. Measure with **`jdeps`** cycles and **ArchUnit** rules banning deep **`extends`**. **Java 8** **`default`** **methods** made **composition** via **interfaces** cheaper. **Interview angle:** Speak to deployment blast radius."
  ),
  c(
    "What are **bridge methods** and when does **`javap`** show them?",
    "The **compiler** synthesizes **bridge** methods when **generics** erasure would otherwise make an **override** illegal at **JVMS** level—covariant returns or interface merges. Bridges are **`Synthetic`** and delegate to the real body. Production **`MapStruct`** upgrades sometimes shift bridges, causing **`NoSuchMethodError`** if stale **JARs** mix. Inspect with **`javap -p ServiceImpl.class`** searching **`bridge`**. **Java 5** introduced **generics** and bridges; behaviour persists in **Java 21**. **Interview angle:** Bridge talk differentiates senior answers."
  ),
];

const CODE_BASED_TAIL =
  "Reconfirm the story with **javap -c** on the enclosing **.class** so stdout claims match **Methodref** targets instead of interviewer folklore.";

const cb = (question, answer) => ({
  question,
  answer: `${answer} ${CODE_BASED_TAIL}`,
  followUps: [{ ...FU_ONCALL }, { ...FU_TRAP }],
});

export const CODE_BASED = [
  cb(
    "What does this print?\n```java\nclass A { String id() { return \"A\"; } }\nclass B extends A { @Override String id() { return \"B\"; } }\npublic class T {\n  public static void main(String[] args) {\n    A ref = new B();\n    System.out.println(ref.id());\n  }\n}\n```",
    "**Dynamic** dispatch selects **B.id** even though **ref** is typed as **A** because **invokevirtual** consults the **receiver** object's **vtable** slot at runtime. **HotSpot** records the concrete **Klass** for **B**, so stdout prints **B**. If **id** were **static**, **invokestatic** would bind to **A** regardless of the **new B()** allocation, which is the classic trick interviewers deploy. Proof lives in **javap -c T.class**, where you read the target **Methodref**. **Java 17** and **Java 11** share this behaviour for non-private instances."
  ),
  cb(
    "What does this print?\n```java\nclass Base { static String name() { return \"base\"; } }\nclass Sub extends Base { static String name() { return \"sub\"; } }\npublic class T {\n  public static void main(String[] args) {\n    Base b = new Sub();\n    System.out.println(b.name());\n  }\n}\n```",
    "**static** methods hide rather than override, so **javac** emits **invokestatic** against **Base.name** because the variable type is **Base**, even though **new Sub()** constructed the object. Stdout therefore prints **base**. This is the textbook trap that explodes logging utilities wrapped in pseudo-polymorphic APIs. Proof is **javap -c T.class**, which lists the **Methodref** owner as **Base**. **Java 11** and **Java 21** agree; nothing dynamic happens because **vtable** selection is never consulted."
  ),
  cb(
    "Does this compile?\n```java\nclass P { P() { System.out.print(\"P\"); } }\nclass C extends P { C() { System.out.print(\"C\"); super(); } }\n```",
    "No — **super()** must precede any other statements in a **constructor**; **javac** rejects the class before **bytecode** exists because **invokespecial** ordering would violate definite-assignment rules for **superclass** fields. Swap **super()** above the print and both compile and run print **PC** as expected. Always treat constructor chain bugs as **compile-time** gates, never runtime surprises. Verify with plain **javac** plus **javap -p** on **C** once fixed."
  ),
  cb(
    "What does this print?\n```java\nclass Animal { void speak() { System.out.print(\"A\"); } }\nclass Dog extends Animal { void speak() { System.out.print(\"D\"); } }\npublic class T {\n  public static void main(String[] args) {\n    Animal a = new Dog();\n    a.speak();\n  }\n}\n```",
    "**invokevirtual** chooses **Dog.speak** because the receiver is a **Dog** instance, so stdout prints **D**. This is canonical **HotSpot** polymorphism: the **reference** type **Animal** only affects compile-time checks, not the **vtable** slot executed. If **Animal.speak** were **private**, **Dog.speak** would be an unrelated method and you would still compile yet observe surprising output—always validate with **@Override**. **javap -c** is the quickest bytecode textbook."
  ),
  cb(
    "Does this compile?\n```java\nclass Base { final void hook() {} }\nclass Sub extends Base { void hook() {} }\n```",
    "No — **final** instance methods seal the **vtable** entry, so **javac** rejects any subclass attempt to replace **hook** because **invokevirtual** must always land on the **Base** implementation. Template-method frameworks rely on **final** **execute** methods to stop teams from accidentally breaking the algorithm skeleton. Inspect **javap -p** to see **ACC_FINAL** on **Base.hook**. Removing **final** without a semver major is an API break for subclasses that relied on the guarantee."
  ),
  cb(
    "What does this print?\n```java\nclass N { Number get() { return 1; } }\nclass I extends N { @Override Integer get() { return 2; } }\npublic class T {\n  public static void main(String[] args) {\n    N n = new I();\n    System.out.println(n.get());\n  }\n}\n```",
    "Covariant **return** keeps **invokevirtual** targeting **I.get**, so stdout prints **2** even though **n** is typed as **Number**-returning **N**. The **JVM** still loads the **Integer** value from the **Integer**-specializing override. **javap -p** often reveals a **synthetic** bridge method bridging erased **descriptor**s for generic callers. Interviewers use this snippet to see if you confuse source-level widening with runtime dispatch."
  ),
  cb(
    "What happens at runtime?\n```java\nObject[] oa = new String[1];\noa[0] = Integer.valueOf(1);\n```",
    "The **JVM** throws **ArrayStoreException** because **String[]** masquerades as **Object[]** but **astore** still enforces **String** element types, so assigning an **Integer** violates the runtime check. Generics on **List** would have caught the mistake at **compile** time, which is why teams prefer collections over arrays for service DTOs. Use **jdb** or **jstack** to anchor the exact **bytecode** index emitting **ATHROW**."
  ),
  cb(
    "Does this compile?\n```java\nclass Base {}\nfinal class Lock extends Base {}\nclass Break extends Lock {}\n```",
    "**final** on **Lock** freezes the **extends** graph, so **Break** cannot subclass it and **javac** stops immediately. Libraries mark security-sensitive types **final** to prevent third parties from widening APIs through inheritance tricks that bypass **constructor** checks. Pair the answer with **javap -p** to show **ACC_FINAL** and explain how this differs from **sealed** permits which still allow known children."
  ),
];

const seniors = [
  {
    question:
      "Your **Spring Boot** pricing service canary spikes **ClassCastException** right after you introduce **CorporateCustomer extends Customer** while **Kafka** payloads still deserialize into **Map** raw maps that you cast blindly to **Customer**. What do you do first?",
    answer:
      "**Immediate response:** Roll the canary back to five percent traffic, stream pod logs, and run **jcmd** **Thread.print** on one failing PID so the stack shows the exact **checkcast** site and concrete receiver class before you change business logic.\n\n" +
      "**Root cause:** **invokevirtual** never runs here because **javac** emitted a **checkcast Customer** onDeserializer boundaries: JSON produced **VendorDto** proxies or plain **Map** entries, so the **JVM** rejects the cast. Treat it as a type-system breach, not random noise, because polymorphic lists only work when every element truly **is-a** **Customer**.\n\n" +
      "**Fix:** Replace blind casts with **instanceof** guards, migrate to **records** plus **Jackson** polymorphic type ids with server-side allowlists, regenerate clients, and diff **javap -c** for the handler class to prove **checkcast** targets line up with permitted DTOs before redeploy.\n\n" +
      "**Prevention:** Ban raw **Map** exits from integration modules via **ArchUnit**, require sealed customer sums on **Java 21** so compiler exhaustiveness catches new subtypes, and attach **java -verbose:class** evidence to incidents when duplicate **Customer** classes appear on the loader path.",
  },
  {
    question:
      "A library team ships **BaseProcessor** with a new abstract **validate** hook but half your mesh still runs yesterday's child JAR; **AbstractMethodError** explodes during nightly batch.",
    answer:
      "**Immediate response:** Pull **javap -p** **BaseProcessor.class** from a crashing node and from CI artifacts; compare **SHA** tags until you see missing **validate** on stale JARs, then cordon those instances before they poison lagging partitions.\n\n" +
      "**Root cause:** **AbstractMethodError** is linkage: the **vtable** slot for **validate** is null because the loaded **child** class predates the abstract method. **invokevirtual** dispatches straight into a missing implementation, so the first batch row trips the fault even though newer compiles succeeded.\n\n" +
      "**Fix:** Pin a single BOM version across services, roll child artifacts ahead of flipping the abstract flag, or ship a temporary default **validate** on **BaseProcessor** that throws **IllegalStateException** with actionable text until versions converge; rerun **javap** on every node post-deploy.\n\n" +
      "**Prevention:** Add contract tests that load pairwise **JARs** from production coordinates and invoke hooks reflectively, fail builds on skew, and store **jdeps** reports per release train so Helm values cannot drift across tiers.",
  },
  {
    question:
      "Junior dev fixes **applyDiscount** by adding a static helper in **HolidayPromotion** but **PricingService** still calls **Promotion.applyDiscount** on supertype references; finance sees no holiday savings.",
    answer:
      "**Immediate response:** Open **javap -c** on **PricingService.class** for the release tag and read the bytecode: you expect **invokevirtual** targeting **HolidayPromotion**, but you will see **invokestatic** or **invokevirtual** stuck on **BasePromotion** if only a static helper landed.\n\n" +
      "**Root cause:** Static methods hide; they never join the **vtable** used for instance polymorphism. Supertype references keep **invokevirtual** on the base slot, so the holiday math never executes regardless of object type.\n\n" +
      "**Fix:** Move logic into a real **@Override** instance method, add tests that call only through **Promotion** references, enable **javac -Werror**, paste **javap** diff into the pull request, and rerun pricing simulations on canary shards.\n\n" +
      "**Prevention:** Lint rules requiring **@Override** on hierarchy edits, ErrorProne checks for suspicious static pairs, and code review checklist items tying finance KPI tests to virtual dispatch evidence.",
  },
  {
    question:
      "**On-call** sees **IncompatibleClassChangeError: superclass access check failed** after a hotfix shades **contracts-1.2.jar** and **contracts-1.3.jar** into one fat JAR.",
    answer:
      "**Immediate response:** Replay locally with **java -verbose:class** and the same uber JAR, grep for two loads of **com/acme/Contract** from different jars, then snapshot **jcmd** **VM.classloader_stats** if the process still starts.\n\n" +
      "**Root cause:** Two bytecode shapes claim the same **class** name with different **super_class** metadata; the verifier refuses to link subclasses, surfacing **IncompatibleClassChangeError** that resembles application corruption but is pure classpath duplication.\n\n" +
      "**Fix:** Enforce **Maven Enforcer** dependency convergence or Gradle **resolutionStrategy** forcing one coordinate, rebuild the shaded artifact with relocation rules, redeploy, and validate with **jdeps** plus **javap -verbose** on the merged entry.\n\n" +
      "**Prevention:** CI gate blocking shade relocations that overlap packages, automated **npm-style** SBOM diff, and runbooks requiring **jdeps** output attached to hotfix tickets.",
  },
  {
    question:
      "Security review blocks **UserAccount.equals** because **PremiumUser** widens with **instanceof** while **UserAccount** still uses **getClass**; **HashMap** churn explodes in **Redis** dedupe.",
    answer:
      "**Immediate response:** Capture **jmap -dump:live** from the caching service, open Eclipse MAT, and sort **HashMap$Node** histograms for duplicate logical user ids with mismatched concrete classes.\n\n" +
      "**Root cause:** **equals** symmetry breaks across inheritance when supertype uses **getClass** but subtype uses **instanceof**, so **a.equals(b)** disagrees with **b.equals(a)** even though **hashCode** collides often enough to mask the fault until load rises.\n\n" +
      "**Fix:** Make **equals** **final** on **UserAccount**, move identity to a **Java 21** **record** key, or delegate to composition objects; re-run property tests asserting reflexivity and **Map** invariants, then replay **javap -c** on compiled equals to remove surprises.\n\n" +
      "**Prevention:** ArchUnit bans cross-layer **equals** tricks without reviewer approval, Redis TTL alerts tag suspicious cardinality spikes, and new hires pair on **Liskov** checklist before merging account hierarchies.",
  },
  {
    question:
      "Profiling after a framework upgrade shows megamorphic **invokeinterface** **execute** calls on **List** of **Command** with dozens of subtypes, blowing **CPU** budgets.",
    answer:
      "**Immediate response:** Take a five minute **Java Flight Recording** and filter **hot_methods** for the polymorphic **execute** callsite, then confirm with **jcmd** **Compiler.codelist** that **C2** keeps deoptimizing around **itable** misses.\n\n" +
      "**Root cause:** Each new **Command** subtype widens the **itable**; once the callsite goes megamorphic, **HotSpot** cannot inline and you pay full dispatch plus extra traps whenever class histograms shift during deploys.\n\n" +
      "**Fix:** Collapse the hierarchy behind a **sealed** **interface** with exhaustive **switch** on **Java 21**, or map names to **enum** strategies so bytecode lowers to **tableswitch**; prototype with **javap** to verify the hot loop no longer chains **invokeinterface** fanout.\n\n" +
      "**Prevention:** Architecture review caps new command types per quarter, **JMH** regressions guard dispatch cost, and telemetry compares **CPU** per transaction across canaries before global rollout.",
  },
];

export const SENIOR_SCENARIO = seniors.map((s) => ({
  ...s,
  answer: s.answer + SENIOR_EXT,
  followUps: [{ ...FU_ONCALL }, { ...FU_TRAP }],
}));
