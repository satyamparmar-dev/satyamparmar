/** Day 11 staff content: Abstract Classes and Interfaces (phase2-day11.json). */

export const WHY_CONTENT = [
  "At 02:44 the **Spring Boot** pricing adapter pod serving EU traffic throws **AbstractMethodError** during request mapping even though **mvn test** passed on the developer laptop. The release train bumped a shared **interface** **JAR** that added a new **abstract** hook for tax computation while half the pool still runs an older **AbstractPriceAdapter** **bytecode** missing the override. The symptom is a **JVM** linkage failure before your **Controller** logs a single line, not a business rule rejection. The CI artifact is a shaded fat **JAR** where **javap** still shows the old **class** **major** version on one node because the **Helm** chart pinned the sidecar only. The failure looks like flaky routing but is really an **interface** contract skew across rolling pods.",
  "Interviewers who probe **abstract** classes and **interfaces** are not checking whether you memorized the keywords **implements** and **extends**. They want evidence that you know how **javac** lays down **ACC_ABSTRACT**, how **invokeinterface** picks **default** method bodies, and how **LinkageError** surfaces when shared library tiers disagree. The mental model gap that separates a weak answer from a strong one is bytecode vocabulary versus textbook UML: strong candidates tie contracts to **ConstantPool** entries you can prove with **javap** instead of waving at diagrams.",
  "Use this four-step pattern in every answer. First, classify the type as **abstract class**, **interface**, **FunctionalInterface**, or **sealed** contract and name whether mutable state fields exist. Second, narrate dispatch: **invokevirtual** for **class** hierarchies, **invokeinterface** for **interface** methods including **default** implementations, **invokestatic** for **interface** **static** helpers. Third, describe the failure surface: **AbstractMethodError**, **IllegalAccessError** on **module** boundaries, or **IncompatibleClassChangeError** after **jar** skew. Fourth, verify with **javap -p**, **javap -c**, or **jcmd** **Thread.print** and attach that proof to the incident ticket so finance sees evidence, not opinions. You repeat those four moves on every **pull request** that touches a shared **SDK** surface so reviewers see bytecode discipline, not slide decks.",
  "At scale, ten engineers and fifty **Kafka** listeners multiply any sloppy **interface** evolution. One squad ships a **default** **retry** method on **MessageHandler** while another team still compiles against an **interface** snapshot without that member, producing **AbstractMethodError** bursts invisible in application logs until the **JVM** refuses **class** initialization. Another failure mode is **IncompatibleClassChangeError** when a **library** removes **default** bodies or narrows **visibility** between **canary** and **baseline** **JARs**, surfacing as **VerifyError** during **defineClass**. Both look like mysterious pod health degradation but are platform linkage mistakes solvable only with aligned **Gradle** **BOM** versions and synchronized rollouts that keep **ConstantPool** shapes identical.",
  "A senior candidate states **Java 9** introduced **private** **instance** methods inside **interfaces** so **default** methods can share helpers without widening the **public** **API**; a mid-level answer forgets this and claims **interfaces** remain pure contracts with no concrete helpers beyond **defaults**. Another senior signal is **Java 17** **sealed** **interfaces** add **permits** lists, letting compilers enforce exhaustive pattern **switch**es that **Java 11** codebases still simulate with ad hoc visitor boilerplate and brittle **instanceof** chains. You cite those facts calmly while pointing at **javap** output on the projector.",
  "In your first six months on a new job this topic shows up weekly. A reviewer asks you to split a bloated **abstract** **Repository** base into **capabilities** **interfaces**; you sketch **template** methods that stay **final** while exposing **protected** hooks only where **Liskov** still holds, then prove overrides with **javap -c** before merging. During **on-call**, a **Micrometer** timer bean fails **initialization** because **CGLIB** cannot **subclass** a **final** **configuration** adapter; you refactor the hotspot to **interface**-based **composition** and document why **proxy** engines demand non-**final** targets or explicit **interfaces**. While migrating modules, **ServiceLoader** discovers two **PaymentGateway** **interface** providers on the **module** path, creating ambiguous wiring; you collapse duplicate **provides** clauses and add **SPI** tests so **javap** diffs gate future releases.",
].join("\n\n");

export const THEORY_CONTENT = `### Plain-language overview

**Abstract** classes and **interfaces** are the two sanctioned ways **Java** expresses contracts while keeping **single inheritance** for implementation. An **abstract class** may hold fields, **constructors**, and a mix of concrete and **abstract** methods; you cannot **new** it because **javac** marks the **class** **ACC_ABSTRACT** and the **verifier** rejects direct instantiation. An **interface** historically exposed **public abstract** methods only; **Java 8** added **default** and **static** methods with bodies, and **Java 9** added **private** helpers. At runtime **invokeinterface** resolves **interface** methods through **itable** slots while **invokevirtual** walks **vtable** entries for **class** hierarchies. **Interview angle:** If a candidate cannot separate **template** state in **abstract** bases from capability flags on **interfaces**, press them to open **javap -p**.

### Bytecode and **ACC_ABSTRACT** on classes

**javac** emits **class** files with access flags showing **ACC_ABSTRACT** when any method lacks a body or the **class** itself is declared **abstract**. **Concrete** **subclasses** must fill every inherited **abstract** slot so **vtable** indices receive real code pointers before **new** succeeds. Missing overrides yield **compile-time** errors; partial deploys with stale **child** **JARs** yield **AbstractMethodError** at **invokeinterface** or **invokevirtual** sites. **Interview angle:** Ask for **javap -p Child.class** output listing **abstract** flags.

### **abstract** classes as shared state plus template hooks

**abstract** bases centralize fields and **protected** helpers while forcing **subclasses** to implement variation points. **Template** methods stay **final** so collaborators cannot break the algorithm skeleton. **Spring** **JdbcTemplate** style APIs lean on **abstract** bases when many **subclasses** share identical plumbing. **Interview angle:** Tie **abstract** bases to **invokespecial** **constructor** chains that initialize shared fields before **child** bodies run.

### Pure **interface** contracts before **default** methods

Until **Java 8**, **interfaces** were pure **API** surfaces: **public abstract** methods (implicit modifiers) and **public static final** constants. Implementors supplied every method; **javac** checked signatures at **compile** time and **invokeinterface** bound at runtime. **Interview angle:** Contrast with **abstract** classes that already allowed **protected** state.

### **default** methods, **invokeinterface**, and evolution

**Java 8** **default** methods carry bodies on **interfaces** so library authors add **Stream**-era helpers without breaking existing implementors unless signatures clash. Bytecode uses **invokeinterface** with **default** targets resolved through the **interface** hierarchy. **Interview angle:** Mention **java.util.Collection** **removeIf** as a real evolution example.

### **static** methods on **interfaces**

**Java 8** allows **static** methods on **interfaces**; **invokestatic** binds to the **interface** type named in source, not **implementors**. Calling through a **subtype** reference still hits the **interface** owner, a frequent quiz trap. **Interview angle:** Pair with **javap -c** showing **invokestatic** owner.

### Resolving **default** method clashes (diamond)

When two **interfaces** expose colliding **default** signatures, the **implementing class** must **override** and may qualify with **InterfaceName.super.method()** to pick a behavior. **javac** rejects ambiguous merges without an explicit resolution. **Interview angle:** Frame diamond issues as **compile-time** failures, not silent picks.

### Production comparison table

| Contract style | Best when | Linkage risk |
|----------------|-----------|--------------|
| **abstract class** | Shared mutable state + **template** method | **AbstractMethodError** if **child** **JAR** lags |
| **interface** + **defaults** | Cross-cutting capability on unrelated types | Diamond conflicts without explicit **super** call |
| **sealed interface** | Closed sum for exhaustive **switch** | **IncompatibleClassChangeError** if **permits** list drifts |

**Interview angle:** Use this table when architects debate **SPI** versus **abstract** bases.

### Step-by-step: proving a contract mismatch on a canary

Step 1: Capture **jcmd** **Thread.print** from a failing pod to anchor the **AbstractMethodError** frame. Step 2: Run **javap -p** on the **interface** **class** file inside the **canary** **JAR** versus **baseline**. Step 3: Diff **ConstantPool** method entries for new **abstract** hooks. Step 4: Align **Gradle** **BOM** versions and redeploy atomically. Step 5: Re-run **javap** on every node to confirm identical bytecode. **Interview angle:** Staff answers always include a command ladder, not guesses.

### **FunctionalInterface**, lambdas, and **invokedynamic**

**@FunctionalInterface** documents a single **abstract** method (excluding **default** overrides of **Object** methods). **javac** emits **invokedynamic** bootstrap calls to **LambdaMetafactory** for lambda bodies, wiring **SAM** types to synthetic classes. Production confusion arises when developers add a second **abstract** method and lambdas stop compiling. **Interview angle:** Mention **java.util.function** package as the standard library pattern.

### **private** **interface** methods since **Java 9**

**private** **instance** methods let **default** methods share validation without exposing helpers on the **API** surface. **javac** still emits **invokeinterface** for **default** entry points while **invokespecial** handles **private** peers inside the same **interface** file. **Interview angle:** Contrast with **protected** methods, which **interfaces** still forbid.

### **sealed** **interfaces** and **permits** (**Java 17**)

**sealed** **interfaces** list **permits** clause types so only declared **implementors** may exist. Compilers use that closed world for exhaustive **switch** warnings with **pattern** matching in **Java 21**. Runtime dispatch remains **invokeinterface**, but illegal **implements** clauses fail at **compile** time. **Interview angle:** Position **sealed** types as incident prevention for polymorphic **JSON** unions.

### Marker **interfaces** and JVM special cases

**Serializable** and **Cloneable** are marker **interfaces** without methods; the **JVM** and libraries consult **instanceof** checks to enable special behavior. Misusing markers still compiles but yields **NotSerializableException** at runtime when object graphs violate contracts. **Interview angle:** Differentiate markers from rich **interface** contracts.

### Dispatch opcode quick matrix

| Call style | Opcode | What the JVM uses |
|------------|--------|-------------------|
| **instance** method on **class** type | **invokevirtual** | **receiver** **vtable** slot |
| **instance** method on **interface** type | **invokeinterface** | **receiver** **itable** |
| **static** method on **interface** | **invokestatic** | Declared **interface** type in bytecode |

**Interview angle:** Candidates who blur **vtable** and **itable** usually fail **static** hide puzzles on **interfaces**.

### SPI shape: **ServiceLoader** versus **abstract** plugin bases

| Integration | Mechanism | Typical failure |
|-------------|-----------|-----------------|
| **ServiceLoader** | **META-INF/services** + **interface** name | Duplicate providers, **ServiceConfigurationError** |
| **abstract** template | **extends** base in same **JAR** | **AbstractMethodError** when base adds hooks |
| **module** **provides** | **module-info** directives | **IllegalAccessError** when packages not exported |

**Interview angle:** Tie **SPI** debugging to **java --show-module-resolution** in CI.

### Illustrative **default** + **private** pattern

\`\`\`java
public interface Ledger {
    default void post(int cents) {
        validate(cents);
        System.out.println("posted:" + cents);
    }
    private void validate(int cents) {
        if (cents < 0) throw new IllegalArgumentException();
    }
}
\`\`\`

**Interview angle:** Ask candidates how **javap -c** distinguishes **private** helpers from **default** entry points.

### Sixty-second interview story

You explain that **abstract** classes hold **template** state while **interfaces** declare capabilities; **Java 8** **defaults** let libraries evolve without breaking **implementors** but create diamond merge duties; **Java 9** **private** **interface** methods hide helper logic; **Java 17** **sealed** **interfaces** close the **implementor** set for safer **switch** exhaustiveness. You close with **AbstractMethodError** meaning stale **child** bytecode, **IncompatibleClassChangeError** meaning mismatched **ConstantPool** evolution, and you verify using **javap -p** plus **jcmd** **Thread.print** attached to the ticket. **Interview angle:** This story must land in under sixty seconds without skipping bytecode verbs.

### Satyverse drill — tie-down

Pair every vocabulary word with **javap** evidence: open the **interface** **.class**, list **abstract** and **default** methods, then open the **implementor** and confirm every **abstract** slot is filled. Re-run after each **library** bump until **javap** output is byte-identical across **canary** and **baseline**. **Interview angle:** Drill ends only when commands, not opinions, prove parity.
`;

export const BASIC_CODE = `package arch.day11;

/**
 * Day 11 basic: println-only abstract vs interface reference card.
 * // Staff use this layout in onboarding docs so new hires pair vocabulary with javap.
 */
public class Day11Basic {

    public static void main(String[] args) {
        // Core concept table: how contracts differ in bytecode and design.
        System.out.println("=== Abstract class vs interface - contract shape ===");
        System.out.println("abstract class | ACC_ABSTRACT class | single extends | fields + ctor + abstract + concrete");
        System.out.println("interface      | interface type     | multi implements | abstract + default + static + private");
        System.out.println("instantiation  | new forbidden on abstract | new forbidden on interface | concrete class supplies new");
        System.out.println("state          | protected fields common | only public static final constants historically");
        System.out.println();

        // Command reference: prove contracts from class files, not slides.
        System.out.println("=== Command reference - attach to Jira ===");
        System.out.println("javap -p PaymentPort.class        -> list abstract/default/static methods + flags");
        System.out.println("javap -c Adapter.class            -> show invokevirtual vs invokeinterface sites");
        System.out.println("jcmd <pid> Thread.print           -> anchor AbstractMethodError stack to receiver class");
        System.out.println("java -verbose:class               -> trace duplicate providers during SPI load");
        System.out.println("javac -Xlint:deprecation          -> surface default method override drift in CI");
        System.out.println();

        // Failure modes table: what ops sees when bytecode skew exists.
        System.out.println("=== Failure modes - linkage not business logic ===");
        System.out.println("AbstractMethodError        | child JAR missing new interface abstract hook");
        System.out.println("IncompatibleClassChangeError | interface default removed between canary and baseline");
        System.out.println("IllegalAccessError         | module does not export package to implementor");
        System.out.println("VerifyError                | bad bytecode from generator after interface edit");
        System.out.println("ServiceConfigurationError  | duplicate META-INF/services entries for same type");
        System.out.println();

        // Environment posture: keep compiler and runtime agreeing on contract versions.
        System.out.println("=== Environment / configuration cues ===");
        System.out.println("Align Gradle BOM so shared interface JAR revs atomically across services");
        System.out.println("Use javap diff in CI when libraries expose sealed permits lists");
        System.out.println("Pin Java release flag to LTS line your pods actually run");
        System.out.println("Document FunctionalInterface count - second abstract method breaks lambdas");
        System.out.println("Run jdeps -summary on modules after interface edits to catch split-package drift");
        System.out.println();

        System.out.println("=== Review cue ===");
        System.out.println("staff cue: diff javap -p on interface before every rolling deploy");
        System.out.println("staff cue: grep @FunctionalInterface before adding new abstract methods");
        System.out.println("done");
    }
}
`;

export const BASIC_OUTPUT = `=== Abstract class vs interface - contract shape ===
abstract class | ACC_ABSTRACT class | single extends | fields + ctor + abstract + concrete
interface      | interface type     | multi implements | abstract + default + static + private
instantiation  | new forbidden on abstract | new forbidden on interface | concrete class supplies new
state          | protected fields common | only public static final constants historically

=== Command reference - attach to Jira ===
javap -p PaymentPort.class        -> list abstract/default/static methods + flags
javap -c Adapter.class            -> show invokevirtual vs invokeinterface sites
jcmd <pid> Thread.print           -> anchor AbstractMethodError stack to receiver class
java -verbose:class               -> trace duplicate providers during SPI load
javac -Xlint:deprecation          -> surface default method override drift in CI

=== Failure modes - linkage not business logic ===
AbstractMethodError        | child JAR missing new interface abstract hook
IncompatibleClassChangeError | interface default removed between canary and baseline
IllegalAccessError         | module does not export package to implementor
VerifyError                | bad bytecode from generator after interface edit
ServiceConfigurationError  | duplicate META-INF/services entries for same type

=== Environment / configuration cues ===
Align Gradle BOM so shared interface JAR revs atomically across services
Use javap diff in CI when libraries expose sealed permits lists
Pin Java release flag to LTS line your pods actually run
Document FunctionalInterface count - second abstract method breaks lambdas
Run jdeps -summary on modules after interface edits to catch split-package drift

=== Review cue ===
staff cue: diff javap -p on interface before every rolling deploy
staff cue: grep @FunctionalInterface before adding new abstract methods
done
`;

export const INTERMEDIATE_CODE = `package arch.day11;

/**
 * Day 11 intermediate: four interface + abstract contract incidents (println only).
 */
public class Day11Intermediate {

    /*
     * Context: shared SDK adds abstract method; half the pool ships old adapter JARs.
     */
    static void scenario1() {
        System.out.println("--- Scenario 1: AbstractMethodError after SDK interface bump ---");
        System.out.println("symptom: REST worker dies before controller logs with AbstractMethodError");
        System.out.println("cause:    canary loads PricingPort v3 with new abstract settleTax()");
        System.out.println("why:      old AbstractStripeAdapter bytecode never implemented settleTax");
        System.out.println("fix:      roll adapters forward or add default body then migrate");
        System.out.println("verify:   javap -p com.acme.PricingPort from both JARs side by side");
        System.out.println("staff:    attach jcmd Thread.print snippet to incident ticket");
        System.out.println("note:     AbstractMethodError is linkage, not a thrown business exception");
        System.out.println();
    }

    /*
     * Context: two defaults collide; build breaks until explicit super qualifier.
     */
    static void scenario2() {
        System.out.println("--- Scenario 2: diamond default merge compile failure ---");
        System.out.println("symptom: javac error class inherits unrelated defaults for audit()");
        System.out.println("cause:    AuditA and AuditB both define default void audit()");
        System.out.println("fix:      override audit() and call AuditA.super.audit() or merge manually");
        System.out.println("verify:   javap -c Reporter.class after fix shows resolved super chain");
        System.out.println("staff:    ban copy-paste defaults across sibling interfaces in style guide");
        System.out.println("echo:     reproduce locally with javac -verbose on failing module");
        System.out.println("note:     compiler refuses silent picks - ambiguity is compile-time");
        System.out.println();
    }

    /*
     * Context: dev calls Logger.warn via implementation type but static lives on interface.
     */
    static void scenario3() {
        System.out.println("--- Scenario 3: interface static hides behind subtype reference ---");
        System.out.println("symptom: metrics show wrong log tag despite new JsonLogger class");
        System.out.println("cause:    code calls JsonLogger.configure() but static sits on LogFacet");
        System.out.println("why:      invokestatic binds to declared reference type not runtime class");
        System.out.println("fix:      call LogFacet.configure() or remove static from inheritance story");
        System.out.println("verify:   javap -c Caller.class and read Methodref owner for configure");
        System.out.println("staff:    forbid static import from subclasses in code review checklist");
        System.out.println("metric:   log volume mismatch correlates with wrong static binding");
        System.out.println("note:     same trap as class static hide but on interfaces since Java 8");
        System.out.println();
    }

    static void scenario4() {
        System.out.println("--- Scenario 4: ServiceLoader duplicate PaymentGateway providers ---");
        System.out.println("symptom: boot fails with ServiceConfigurationError during module scan");
        System.out.println("cause:    two JARs register same provider class name in META-INF/services");
        System.out.println("fix:      shade one copy away or merge module provides clauses cleanly");
        System.out.println("verify:   jar tf payment-stub.jar | findstr META-INF/services");
        System.out.println("staff:    add ArchUnit rule banning duplicate provider resource paths");
        System.out.println("context: JVM loads SPI lists before Spring context finishes wiring");
        System.out.println("note:     interface-only SPI still needs single canonical provider entry");
        System.out.println();
    }

    static void printBanner() {
        System.out.println("banner: Day11 intermediate abstract + interface lab");
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

export const INTERMEDIATE_OUTPUT = `banner: Day11 intermediate abstract + interface lab
--- Scenario 1: AbstractMethodError after SDK interface bump ---
symptom: REST worker dies before controller logs with AbstractMethodError
cause:    canary loads PricingPort v3 with new abstract settleTax()
why:      old AbstractStripeAdapter bytecode never implemented settleTax
fix:      roll adapters forward or add default body then migrate
verify:   javap -p com.acme.PricingPort from both JARs side by side
staff:    attach jcmd Thread.print snippet to incident ticket
note:     AbstractMethodError is linkage, not a thrown business exception

--- Scenario 2: diamond default merge compile failure ---
symptom: javac error class inherits unrelated defaults for audit()
cause:    AuditA and AuditB both define default void audit()
fix:      override audit() and call AuditA.super.audit() or merge manually
verify:   javap -c Reporter.class after fix shows resolved super chain
staff:    ban copy-paste defaults across sibling interfaces in style guide
echo:     reproduce locally with javac -verbose on failing module
note:     compiler refuses silent picks - ambiguity is compile-time

--- Scenario 3: interface static hides behind subtype reference ---
symptom: metrics show wrong log tag despite new JsonLogger class
cause:    code calls JsonLogger.configure() but static sits on LogFacet
why:      invokestatic binds to declared reference type not runtime class
fix:      call LogFacet.configure() or remove static from inheritance story
verify:   javap -c Caller.class and read Methodref owner for configure
staff:    forbid static import from subclasses in code review checklist
metric:   log volume mismatch correlates with wrong static binding
note:     same trap as class static hide but on interfaces since Java 8

--- Scenario 4: ServiceLoader duplicate PaymentGateway providers ---
symptom: boot fails with ServiceConfigurationError during module scan
cause:    two JARs register same provider class name in META-INF/services
fix:      shade one copy away or merge module provides clauses cleanly
verify:   jar tf payment-stub.jar | findstr META-INF/services
staff:    add ArchUnit rule banning duplicate provider resource paths
context: JVM loads SPI lists before Spring context finishes wiring
note:     interface-only SPI still needs single canonical provider entry

`;

export const ADVANCED_CODE = `package arch.day11;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Day 11 advanced: opcode routing + contract budget + readiness matrix.
 */
public class Day11Advanced {

    record ContractSignal(String surface, String opcode, boolean allowsFields) {}

    static List<ContractSignal> catalog() {
        List<ContractSignal> list = new ArrayList<>();
        list.add(new ContractSignal("abstract class template", "invokevirtual", true));
        list.add(new ContractSignal("interface default body", "invokeinterface", false));
        list.add(new ContractSignal("interface static helper", "invokestatic", false));
        list.add(new ContractSignal("lambda SAM", "invokedynamic", false));
        return list;
    }

    static Map<String, Integer> evolutionDebt() {
        Map<String, Integer> m = new LinkedHashMap<>();
        m.put("default methods added last quarter", 3);
        m.put("FunctionalInterface regressions caught in CI", 1);
        m.put("sealed permits mismatches between artifacts", 0);
        m.put("duplicate SPI files caught in staging", 1);
        return m;
    }

    public static void main(String[] args) {
        System.out.println("banner: Day11 advanced contract guardrails");
        System.out.println();
        System.out.println();

        System.out.println("=== Block 1: dispatch catalog ===");
        for (ContractSignal c : catalog()) {
            System.out.println(c.surface() + " | opcode=" + c.opcode() + " | fields=" + c.allowsFields());
        }
        System.out.println();

        System.out.println("=== Block 2: evolution debt scoreboard ===");
        int total = 0;
        for (Map.Entry<String, Integer> e : evolutionDebt().entrySet()) {
            total += e.getValue();
            System.out.println(e.getKey() + " = " + e.getValue());
        }
        System.out.println("total debt points = " + total);
        System.out.println();

        System.out.println("=== Block 3: release readiness matrix ===");
        Map<String, Boolean> checks = new LinkedHashMap<>();
        checks.put("javap diff clean for shared interfaces", true);
        checks.put("SPI provider files unique", true);
        checks.put("second abstract method blocked on FunctionalInterface", false);
        int pass = 0;
        for (Map.Entry<String, Boolean> e : checks.entrySet()) {
            if (Boolean.TRUE.equals(e.getValue())) {
                pass++;
            }
            System.out.println(e.getKey() + " | " + e.getValue());
        }
        System.out.println("pass count = " + pass + " / " + checks.size());
        System.out.println("summary: block models Staff gate for interface-heavy releases");
        System.out.println("eof");
    }
}
`;

export const ADVANCED_OUTPUT = `banner: Day11 advanced contract guardrails


=== Block 1: dispatch catalog ===
abstract class template | opcode=invokevirtual | fields=true
interface default body | opcode=invokeinterface | fields=false
interface static helper | opcode=invokestatic | fields=false
lambda SAM | opcode=invokedynamic | fields=false

=== Block 2: evolution debt scoreboard ===
default methods added last quarter = 3
FunctionalInterface regressions caught in CI = 1
sealed permits mismatches between artifacts = 0
duplicate SPI files caught in staging = 1
total debt points = 5

=== Block 3: release readiness matrix ===
javap diff clean for shared interfaces | true
SPI provider files unique | true
second abstract method blocked on FunctionalInterface | false
pass count = 2 / 3
summary: block models Staff gate for interface-heavy releases
eof
`;

export const PITFALLS = [
  "Publishing a **library** **interface** with a new **abstract** method while **Gradle** consumers pin mixed **BOM** lines - production symptom is **AbstractMethodError** during **Spring** component wiring before **HTTP** handling starts; fix by rolling every **adapter** **JAR** together or temporarily adding a **default** stub with **@Deprecated**; verify with **javap -p** on the **interface** pulled from both **canary** and **baseline** **artifacts**.",
  "Letting two **interfaces** define colliding **default** **audit** methods without an **override** in the **implementor** - **javac** halts the build with **class inherits unrelated defaults** errors that look like merge conflicts; fix by implementing **audit** and delegating with **AuditTrail.super.audit()**; verify with **javap -c** on the **implementor** to confirm the **invokespecial** chain.",
  "Calling an **interface** **static** helper through a **subclass** **reference** type expecting polymorphism - logs show stale behaviour because **invokestatic** binds to the declared type; fix by qualifying **LogFacet.configure()** explicitly; verify with **javap -c Caller.class** reading the **Methodref** owner.",
  "Marking a **type** **@FunctionalInterface** then adding a second **abstract** method for a shortcut API - **javac** rejects lambdas and **Stream** pipelines suddenly fail CI; fix by splitting **SAM** contracts or using **default** methods; verify with **javac** on the module plus **javap -p** to count **abstract** entries.",
  "Using **abstract** **base** classes for cross-cutting **retry** policies instead of **interface** **composition** - symptom is **deep** **extends** chains and **AbstractMethodError** when the **base** adds hooks older **JARs** lack; fix by extracting policies as collaborators; verify **jdeps** summary for cycles plus **javap -p** on the **base** after each release.",
  "Shipping **sealed** **interfaces** in a **library** without **semver** discipline when **permits** lists change - integrators see **IncompatibleClassChangeError** at **class** load despite clean **javac** on their branch; fix by major bumps plus **bytecode** compatibility tests; verify customers run **javap -p** on your **artifact** before upgrading.",
  "Declaring **protected** methods on **interfaces** (illegal) after misreading preview docs - **javac** fails with illegal modifier errors blocking the pipeline; fix by moving helpers to **private** **default** peers or **abstract** bases; verify with **javac -Xlint:all** in CI.",
  "Duplicating **META-INF/services** files for the same **PaymentGateway** **interface** across shaded **JARs** - **ServiceLoader** throws **ServiceConfigurationError** during **boot**; fix by merging provider lists or excluding duplicates; verify with **jar tf** on every **release** candidate.",
];

export const EXERCISE_PROBLEM = [
  "You join the **ledger** platform squad that models postings through **abstract** bases and **payment** **ports** as **interfaces**; reviewers demand **javap** evidence and **@FunctionalInterface** safety before **canary** promotion.",
  "",
  "Requirements:",
  "1. Implement **arch.day11.Day11Exercise** with **public static void main(String[] args)** printing a three-line legend labelled **abstract:**, **interface:**, and **default:** describing **ACC_ABSTRACT** templates, pure contracts, and **Java 8** **default** evolution - each line under 120 chars.",
  "2. Declare **interface LedgerPort** with **abstract** **void post(int cents)** and **default void postPositive(int cents)** that throws **IllegalArgumentException** when cents is negative before delegating to **post**.",
  "3. Declare **abstract class AbstractLedger** with **protected final String id** field, constructor **AbstractLedger(String id)**, **abstract String channel()**, and **final String describe()** returning **id + ':' + channel()**.",
  "4. Add **class FileLedger extends AbstractLedger** implementing **LedgerPort** with **channel()** returning **FILE**, **post** printing **post:** plus the cents literal, and **main** constructing one instance, calling **describe**, then **postPositive** with **10**.",
  "5. End with **done** on its own line after all prints.",
].join("\n");

export const EXERCISE_HINTS = [
  "Keep **postPositive** as a **default** method on **LedgerPort** so implementors inherit validation without duplicating code.",
  "Use **final** on **describe** to mirror **template** method safety while still allowing **channel** to vary.",
  "Remember **abstract** classes can implement **interfaces** partially only if the **class** stays **abstract** - here **FileLedger** must be concrete.",
];

export const EXERCISE_SOLUTION = `package arch.day11;

/**
 * Day 11 exercise: abstract base + interface default + template describe.
 */
public class Day11Exercise {

    interface LedgerPort {
        void post(int cents);

        default void postPositive(int cents) {
            if (cents < 0) {
                throw new IllegalArgumentException("negative posting");
            }
            post(cents);
        }
    }

    abstract static class AbstractLedger {
        protected final String id;

        AbstractLedger(String id) {
            this.id = id;
        }

        abstract String channel();

        final String describe() {
            return id + ":" + channel();
        }
    }

    static class FileLedger extends AbstractLedger implements LedgerPort {
        FileLedger(String id) {
            super(id);
        }

        @Override
        String channel() {
            return "FILE";
        }

        @Override
        public void post(int cents) {
            System.out.println("post:" + cents);
        }
    }

    public static void main(String[] args) {
        final String a = "abstract: ACC_ABSTRACT bases share state and ctor chains while forcing overrides.";
        final String i = "interface: contracts stack via implements with invokeinterface dispatch sites.";
        final String d = "default: Java 8 interface bodies evolve APIs without breaking every implementor.";
        System.out.println(a);
        System.out.println(i);
        System.out.println(d);
        FileLedger ledger = new FileLedger("L1");
        System.out.println(ledger.describe());
        ledger.postPositive(10);
        System.out.println("done");
    }
}
`;

export const JOB_SWITCH = {
  resumeBullet:
    "Sealed shared ports and javap CI gates cut AbstractMethodError canaries to zero across twelve services.",
  interviewPositioning:
    "When interviewers ask about **abstract** classes versus **interfaces**, you describe **invokevirtual** versus **invokeinterface** proof and **ServiceLoader** hygiene. In week one at a new company you diff **javap -p** output for every shared **interface** **JAR** in the **BOM** and file tickets when **permits** lists disagree between artifacts.",
  starAnchor:
    "Situation: our **payment** **SPI** started throwing **AbstractMethodError** during **Spring** startup after a **library** added **settleTax** to **PricingPort**. Task: restore zero-downtime **rollout** without reverting revenue features. Action: compared **javap -p** between **canary** and **baseline** **JARs**, coordinated a synchronized **adapter** release, temporarily added a **default** stub marked **deprecated**, and added **CI** **javap** diff gates. Result: **zero** **AbstractMethodError** incidents for nine months and **on-call** pages for linkage issues dropped to none.",
};

export const CHEATSHEET_CONTENT = `| Concept | Quick rule | Example / Command |
|---------|------------|---------------------|
| **abstract class** | **ACC_ABSTRACT**, no **new** | **javap -p** shows abstract flags |
| **interface** | **ACC_INTERFACE** + **itable** dispatch | **invokeinterface** on call sites |
| **default** method | Body on **interface**, inherited | **javap -c** shows **invokespecial** to **super** |
| **static** on **interface** | **invokestatic** to declared type | Qualify **Iface.m()** always |
| **diamond** | **javac** error until override | **Iface.super.m()** resolves |
| **private** **interface** helper | Since **Java 9** | **javap -p** shows **private** |
| **sealed** | **permits** closes graph | **Java 17**+ compile checks |
| **@FunctionalInterface** | Single **abstract** method | Lambdas use **invokedynamic** |
| **AbstractMethodError** | Missing override at runtime | Diff **javap -p** across **JARs** |
| **ServiceLoader** | **META-INF/services** | **jar tf** hunts duplicates |
| **JPMS** access | **exports** to readers | **java --show-module-resolution** |
`;

export const WRONG_ANSWERS = [
  "Interfaces cannot contain any concrete methods - default methods never compile.",
  "Abstract classes and interfaces both support multiple inheritance for implementation in Java.",
  "invokeinterface and invokevirtual pick methods using only the reference type printed in source.",
  "Adding a private method to an interface requires Java 7 because interfaces were always pure.",
  "@FunctionalInterface allows unlimited abstract methods as long as one is named apply.",
  "ServiceLoader ignores META-INF/services duplicates and silently picks the first provider every time.",
  "Sealed interfaces are runtime enforced by the JVM throwing SealedViolationException on illegal implements.",
  "Abstract static methods on abstract classes are inherited and override like instance methods.",
];
