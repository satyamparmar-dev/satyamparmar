/** Full section builder for phase9-day78.json — Design Patterns — Creational */

const T = (title, body, angle) =>
  `### ${title}\n\n${body}\n\n**Interview angle:** ${angle}`;

function buildWhy() {
  return (
    'At 04:05 the nightly **batch** job prints the wrong totals. You trace it to two different **PriceCalculator** **instances** hiding behind a homemade **Singleton** someone wrote in **2016**. One **thread** cached **BigDecimal** state in a **static** field. Another **thread** overwrote it between **parse** and **multiply**. The bug looks like bad business logic. It is really **object** **creation** discipline: you let **global** **state** pretend to be a **pattern**.\n\n' +
    'You are new. You thought **creational** **patterns** were chapter titles in a book. In your first month you learn they are answers to boring questions. Who is allowed to call **new**? How do you hide **JDBC** details from **domain** rules? How do you build a **request** **DTO** with twenty optional fields without a **constructor** with fifteen **null** arguments? When those questions go unanswered, **production** pays in **NullPointerException**, **IllegalStateException**, and silent wrong numbers.\n\n' +
    'Interviewers who ask about **Singleton**, **Factory** **Method**, **Builder**, or **Prototype** rarely want a textbook diagram. They want consequences. A weak answer says "**Singleton** means one **instance**." A strong answer says when **double-checked** **locking** breaks without **volatile**, why **enum** **singleton** wins on **Java** **5** and still wins on **Java** **21**, and how **Spring** **singleton** **beans** are a different animal than **Gang** **of** **Four** **Singleton**. A strong answer names what breaks when ten engineers each add a **new** **factory** in the same **package**.\n\n' +
    'Two failure modes show up everywhere. First, **Stream** **CorruptedException** or weird **equals** behavior after you **serialize** a **Singleton** implemented as a plain **class** with **readResolve** missing. The app looks fine until **session** **replication** or **cache** **warm** paths run. Second, **OutOfMemoryError**: **Metaspace** when someone registers hundreds of **dynamic** **proxies** or **anonymous** **factory** **classes** in a hot loop. **CPU** looks fine while **GC** **logs** scream. Both look like mystery infrastructure bugs until you map them to **object** **birth** choices.\n\n' +
    'When you explain this to your team, use four steps. First, name the **interface** the rest of the code should depend on, not the **concrete** **class**. Second, name who constructs **objects**: a **factory**, a **builder**, or the **DI** **container**. Third, say what breaks if you are wrong: hidden **global** **state**, **test** **flakiness**, or **immutable** **objects** built half-valid. Fourth, say how you check: **javap** **-c** on the **class** **file**, **jcmd** **GC.class_stats** when **Metaspace** grows, or a **JUnit** **test** that proves two **beans** are not the same **instance** when they should not be.\n\n' +
    'Here is a Staff-level fact that separates memorization from experience. On **Java** **17** and newer, **records** are immutable **classes** that **javac** generates with **equals**/**hashCode**/**toString** for free. That pairs naturally with **Builder**-style **construction** for **DTO**s at **boundaries**, while **domain** **entities** stay **classes** you control. If you still hand-roll **Singleton** with **synchronized** blocks and forget the **memory** **model** story, you are arguing with the **JVM** **spec**, not with your **PM**.\n\n' +
    'In your first six months you will see **creational** choices collide with **Spring**. **Situation:** two **@Bean** **methods** return the same **interface** but different **implementations** depending on **profile**, and **integration** **tests** mix **profiles** by accident. **What you do:** you make **construction** explicit with **@Configuration** **classes** and **@Qualifier** names, then you write one **test** that asserts the **bean** graph for **staging** matches **prod** intent. **Situation:** **on-call** sees **p99** spikes after deploy because a **Builder** **build** **method** forgot **validation** and **invalid** **objects** reach **Kafka**. **What you do:** you throw **IllegalStateException** inside **build** and add **Micrometer** **counter** **validation_failures** so the next engineer sees the blast radius in **Grafana**.\n\n' +
    'You will also argue about **Abstract** **Factory** when **vendor** **A** and **vendor** **B** both sell **payments**. Fifty **services** mean fifty chances to pick the wrong **creational** shortcut. When you can tie each pattern to a **command** you actually run, like **javap** for **bytecode** shape or **jcmd** for **class** **loader** leaks, you sound like someone who ships **Java**, not someone who only highlights a **PDF**.'
  );
}

function buildTheoryContent() {
  const parts = [
    T(
      'Plain-language overview',
      '**Creational** **patterns** are recipes for **object** **birth**. They answer who may call **new**, how to hide **constructor** details, and how to build **immutable** **objects** safely. **Singleton**, **Factory** **Method**, **Abstract** **Factory**, **Builder**, and **Prototype** are names for repeated problems, not magic spells. The **JVM** still executes **bytecode** one **class** at a time. Good patterns keep **tests** fast and **production** surprises small.',
      'Interviewers listen for trade-offs, not pattern names shouted in a row.'
    ),
    T(
      'What is creational design and why teams keep saying it',
      'Teams argue about **Singleton** because shared **state** is easy and dangerous. They reach for **Factory** **Method** when **subclasses** pick **concrete** **types**. They use **Builder** when optional **parameters** explode. They clone with **Prototype** when **construction** is expensive. Each choice changes **thread** **safety**, **serialization**, and how **Spring** wires **beans**.',
      'Weak answers list five names; strong ones tie each name to a failure they fear.'
    ),
    T(
      'Your first Factory Method in Java',
      'A **Factory** **Method** hides **new** behind a **method** so callers depend on an **interface**.\n\n```java\ninterface Document { String render(); }\nfinal class PdfDocument implements Document {\n    public String render() { return "pdf"; }\n}\nfinal class DocumentFactory {\n    static Document pdf() { return new PdfDocument(); }\n}\n```\n\nLater you add **HtmlDocument** without editing every caller if they only use **Document**.',
      'Interviewers want to hear who owns construction and how tests swap implementations.'
    ),
    T(
      'When you sketch a factory on a whiteboard',
      'Draw the **interface** at the top, **concrete** **classes** below, and one **factory** **method** arrow per family. **Abstract** **Factory** adds a second dimension: families of related **objects** like **UI** widgets for **Windows** versus **Mac**. If the drawing looks like spaghetti, your **package** **structure** probably is spaghetti too.',
      'Good candidates explain the product family before naming **Abstract** **Factory**.'
    ),
    T(
      'How object creation shows up in bytecode and Metaspace',
      'Every **new** becomes **invokespecial** in **bytecode** that calls a **constructor**. **javap** **-c** **MyClass.class** shows that sequence. **Factory** **registries** that create **anonymous** **inner** **classes** inflate **Metaspace** because each **class** has **metadata**. **jcmd** **<pid>** **GC.class_stats** shows **class** counts rising when factories spin out **dynamic** **types**.',
      'Senior answers connect **object** **creation** frequency with **Metaspace**, not only with **heap**.'
    ),
    T(
      'Comparison table — creational pattern',
      '| Pattern | When it helps | What breaks if you pick the wrong one |\n|---------|---------------|---------------------------------------|\n| **Singleton** | One shared **coordinate** like an **ID** **generator** | Hidden **global** **state** and bad **tests** |\n| **Factory** **Method** | **Subclass** picks **type** | **God** **factory** knows every **vendor** |\n| **Builder** | Many optional **fields** | **build** without **validation** ships **invalid** **objects** |\n| **Prototype** | **Clone** is cheaper than **reparse** | **Shallow** **copy** shares **mutable** **nested** **objects** |\n\nPick the smallest pattern that still keeps invariants honest.',
      'Staff candidates compare **Singleton** versus **Spring** **scoped** **beans** without conflating them.'
    ),
    T(
      'Step sequence — introduce a Builder without breaking callers',
      '1. Add a **static** **builder**() **factory** on the **class** under construction.\n2. Move optional **setters** into **fluent** **methods** that return **this**.\n3. Put **validation** inside **build**() and throw **IllegalStateException** with a clear message.\n4. Keep old **constructors** **private** so **callers** migrate deliberately.\n5. Add **JUnit** **tests** that assert **build** rejects bad combinations.\n6. Run **javap** **-p** **MyDto.class** to confirm **constructors** are not **public** anymore.\n\nStop when **immutable** **DTO**s cannot be built half-empty.',
      'Interviewers reward safe migration steps instead of a big-bang rewrite.'
    ),
    T(
      'Common mistakes that look like concurrency bugs',
      'A **Singleton** implemented with **double-checked** **locking** without **volatile** can publish a half-built **instance** to another **thread**. Symptoms look like random **NullPointerException** in **getInstance**. **Spring** **prototype** **beans** injected into **singleton** **beans** accidentally share **mutable** **state** and look like race bugs. The fix is often **construction** rules, not more **synchronized** blocks.',
      'Strong answers separate memory-model mistakes from business logic mistakes.'
    ),
    T(
      'When Singleton fights your unit tests',
      '**Singleton** **state** survives across **test** **methods** unless you reset it. **JUnit** **5** parallel **execution** makes the pain worse. Prefer **enum** **singleton** for **serialization** safety, or let **Spring** manage a **singleton** **bean** with a **test** **configuration** that swaps a **stub**. **IllegalAccessException** from **reflection** hacks is a smell that your **Singleton** fights the **test** **harness**.',
      'Interviewers probe whether you can replace globals with **dependency** **injection** in tests.'
    ),
    T(
      'Choosing Spring singleton bean versus enum singleton',
      '| Option | Good when | Watch out |\n|--------|-----------|----------|\n| **enum** **singleton** | **Java** **language** **id** **serialization** story | Hard to **mock** without **PowerMock** style hacks |\n| **Spring** **singleton** **bean** | **Enterprise** **apps** with **DI** | **Scope** mistakes with **prototype** **dependencies** |\n| **static** **holder** **id** | Legacy **libraries** | **Class** **loader** leaks in **containers** |\n| **ObjectFactory** **getObject** | Lazy **init** | **Circular** **dependency** if misused |\n\nSay out loud which **lifecycle** you mean: **JVM** **class** **loader** or **Spring** **context**.',
      'Tech leads align **Spring** **scopes** with **session** versus **request** **traffic**.'
    ),
    T(
      'Code review checklist for factories and builders',
      'Ask whether **build** validates invariants. Reject **factories** that **switch** on **string** names without a **default** branch that fails fast. Flag **Singleton** **getInstance** in **library** code that **library** users cannot **reset** for **tests**. Require **immutable** **fields** in **record** **builders** once you are on **Java** **17**.',
      'Review discipline stops **creational** shortcuts from spreading across **services**.'
    ),
    T(
      'How to explain Builder boilerplate to a stakeholder',
      'Say **Builder** buys readable **code** and safer **defaults** at the cost of more lines. Offer the alternative: twelve-parameter **constructors** that **developers** will call wrong under deadline pressure. Tie the story to defect rate: invalid **DTO**s that reach **Kafka** cost more than typing **builder** methods.',
      'Stakeholders care about defect cost more than pattern names.'
    ),
    T(
      'What the JVM does when reflection breaks Singleton',
      '**Reflection** can call **private** **constructors** unless you block it. Attackers or sloppy tests can create a second **Singleton** **instance** even when you thought you were safe. **enum** **singleton** stops that **Constructor** **newInstance** path for **enum** constants. **javap** **-p** shows **synthetic** **methods** **clone** and **readObject** you may need to defend.',
      'Staff answers mention **serialization** entry points, not only **getInstance**.'
    ),
    T(
      'jcmd and javap when Metaspace spikes from factories',
      'Run **jcmd** **<pid>** **GC.class_stats** to see loaded **class** counts by **loader**. Pair with **jcmd** **<pid>** **VM.native_memory** **summary** when **Metaspace** grows during **traffic** spikes. Use **javap** **-c** on **factory** **classes** that generate **proxies** to see hidden **invokedynamic** chains. These commands turn "**maybe** **GC**" into evidence.',
      'On-call credibility comes from named **JVM** commands, not vibes.'
    ),
    T(
      'Java 8 through 21 — records, builders, and serialization',
      '| **Java** | Creational-relevant change |\n|----------|----------------------------|\n| **8** | **Optional** and **streams** reduce **null** **factories** in **mappers** |\n| **11** | **var** makes **local** **builders** readable |\n| **17** | **records** replace **DTO** **boilerplate**; **sealed** **hierarchies** narrow **factory** outputs |\n| **21** | **Record** **patterns** simplify **switch** on **shapes** from **factories** |\n\nIf you still hand-roll **equals** on **DTO**s in **2026**, say why **records** are not enough.',
      'Version answers should mention one **LTS** decision you actually deploy.'
    ),
    T(
      'Architecture guardrail that avoids factory explosion',
      'Cap **Abstract** **factory** **families** with an **ADR** when you add a third vendor. Add **ArchUnit** tests that forbid **new** in **domain** packages except **static** **factory** **methods** you list. Publish a **Spring** **starter** snippet so **teams** do not invent twelve **different** **ObjectProvider** patterns.',
      'Architects connect **creational** consistency with **CI** rules, not only slides.'
    ),
    T(
      '60-second interview story',
      '**Creational** **patterns** control **object** **birth**: **Singleton** for one **coordinate**, **Factory** **Method** for **subtype** choice, **Builder** for optional **fields**, **Prototype** for **clone** when **parsing** is expensive. Misuse shows up as **global** **state**, bad **serialization**, or **Metaspace** spikes from **dynamic** **classes**. In design reviews you name **lifecycle** and **test** strategy. When **production** drifts, you run **javap** and **jcmd** **GC.class_stats** to prove what **constructors** actually ran.',
      'Practice this aloud so it sounds like experience, not a glossary.'
    ),
    T(
      'Satyverse drill — tie-down',
      'Open any **Java** **module** with a **Builder**. Run **javap** **-p** **path/to/MyDto.class** and circle **private** **constructors**. If **Metaspace** is suspicious locally, run **java** **-XX:NativeMemoryTracking** **summary** on a small **main** that builds ten thousand **Builder** **objects** in a loop and watch **class** **stats** stay flat.',
      'Interviewers like candidates who have read **javap** output, not only UML.'
    )
  ];
  return parts.join('\n\n');
}

function buildBasicCode() {
  const code = `package arch.day78;

/** Fresher reference card: creational patterns (println only). */
public class Day78Basic {

    public static void main(String[] args) {
        // Week one: tie each pattern name to one sentence you can defend in stand-up.
        System.out.println("=== Creational patterns — core concept table ===");
        System.out.println("Singleton        | one shared instance; danger is hidden global mutable state");
        System.out.println("Factory Method   | subclass or method picks concrete type behind an interface");
        System.out.println("Abstract Factory | families of related products (UI theme, payment vendor)");
        System.out.println("Builder          | stepwise construction + validation before build()");
        System.out.println("Prototype        | clone or copy when construction is expensive");
        System.out.println();

        // Tie words to Spring so you do not confuse GoF Singleton with container scope.
        System.out.println("=== How to use them in Java projects ===");
        System.out.println("enum singleton   | Java idiom for serialization + thread safety");
        System.out.println("@Bean singleton   | Spring default scope; one per application context");
        System.out.println("static factory     | private ctor + static factory method");
        System.out.println("Builder fluent     | return this; validate in build()");
        System.out.println("ObjectProvider<T>  | lazy lookup when circular wiring is risky");
        System.out.println();

        // Freshers see weird test failures; often it is construction + shared static state.
        System.out.println("=== Beginner mistakes and their symptoms ===");
        System.out.println("IllegalStateException in build()   | Builder allowed invalid field combo");
        System.out.println("Two Singleton instances in tests   | reflection or deserialization path");
        System.out.println("CloneNotSupportedException         | forgot implements Cloneable on class");
        System.out.println("BeanCreationException              | factory method returns null bean");
        System.out.println();

        // One rule: prefer explicit construction rules over clever hidden globals.
        System.out.println("=== Remember this ===");
        System.out.println("Control who calls new; validate before objects escape into production.");
        System.out.println();
        // Extra line so juniors recall enum beats hand-rolled DCL in interviews.
        System.out.println("=== Interview anchor ===");
        System.out.println("Say enum singleton over double-checked locking unless you love memory model trivia.");
    }
}`;
  const output = `=== Creational patterns — core concept table ===
Singleton        | one shared instance; danger is hidden global mutable state
Factory Method   | subclass or method picks concrete type behind an interface
Abstract Factory | families of related products (UI theme, payment vendor)
Builder          | stepwise construction + validation before build()
Prototype        | clone or copy when construction is expensive

=== How to use them in Java projects ===
enum singleton   | Java idiom for serialization + thread safety
@Bean singleton   | Spring default scope; one per application context
static factory     | private ctor + static factory method
Builder fluent     | return this; validate in build()
ObjectProvider<T>  | lazy lookup when circular wiring is risky

=== Beginner mistakes and their symptoms ===
IllegalStateException in build()   | Builder allowed invalid field combo
Two Singleton instances in tests   | reflection or deserialization path
CloneNotSupportedException         | forgot implements Cloneable on class
BeanCreationException              | factory method returns null bean

=== Remember this ===
Control who calls new; validate before objects escape into production.

=== Interview anchor ===
Say enum singleton over double-checked locking unless you love memory model trivia.
`;
  return { code, output };
}

function buildMidCode() {
  const code = `package arch.day78;

/**
 * Four creational-pattern scenarios a senior engineer narrates.
 * // Misused Singleton and Builder issues show up as Spring startup failures or silent bad data.
 */
public class Day78Intermediate {

    static void scenario1() {
        // First feature: you use static getInstance() so you do not thread PaymentClient through constructors.
        System.out.println("--- Scenario 1: double-checked Singleton without volatile ---");
        System.out.println("symptom:  rare NullPointerException inside getInstance during load tests");
        System.out.println("cause:    another thread saw a half-published reference without a happens-before edge");
        System.out.println("why:      the JVM memory model allows reordering unless you use volatile or enum");
        System.out.println("fix:      replace with enum singleton or inject a single Spring bean with clear scope");
        System.out.println("verify:   javap -c -p YourSingleton.class and grep for monitorenter pattern");
        System.out.println("next:     stress test with jcstress or many parallel JUnit threads");
        System.out.println();
    }

    static void scenario2() {
        // Production: invoices differ between pods after cache warm.
        System.out.println("--- Scenario 2: Serializable Singleton returns a second instance ---");
        System.out.println("symptom:  equals says two registry objects differ only after deserialization");
        System.out.println("cause:    readObject created a new instance beside your static holder");
        System.out.println("why:      serialization bypasses your private constructor unless you add readResolve");
        System.out.println("fix:      use enum singleton or implement readResolve returning the canonical instance");
        System.out.println("verify:   write ObjectOutputStream bytes and read back; assert identity equals");
        System.out.println("next:     search codebase for new Registry( via reflection in tests");
        System.out.println();
    }

    static void scenario3() {
        // Performance: Metaspace climbs because a factory allocates new anonymous types per request.
        System.out.println("--- Scenario 3: factory builds dynamic proxies in a hot loop ---");
        System.out.println("symptom:  Metaspace alerts while heap looks healthy; GC logs mention class unloading");
        System.out.println("cause:    Proxy.newProxyInstance or bytecode helpers create new classes each call");
        System.out.println("why:      each generated proxy is a Class object stored in Metaspace, not the heap");
        System.out.println("fix:      cache proxy instances or switch to stable interfaces with one shared proxy");
        System.out.println("verify:   jcmd <pid> GC.class_stats during soak and watch loaded class count");
        System.out.println("next:     javap -c on the factory to count invokedynamic and proxy sites");
        System.out.println();
    }

    static void scenario4() {
        // Architecture: platform team standard for vendor-specific payment objects.
        System.out.println("--- Scenario 4: Abstract Factory per region duplicated twelve ways ---");
        System.out.println("symptom:  each service invents its own PaymentFactory package and beans conflict");
        System.out.println("cause:    no shared creational module; teams copy-paste factory wiring");
        System.out.println("why:      Spring still needs one coherent bean graph per context at startup");
        System.out.println("fix:      publish a starter with @Configuration factories and @Qualifier names");
        System.out.println("verify:   mvn dependency:tree and Spring test that lists beans per profile");
        System.out.println("next:     ArchUnit rule: domain never calls new on vendor SDK classes directly");
        System.out.println();
    }

    public static void main(String[] args) {
        // Header anchors logs when you paste output into a creational design review.
        System.out.println("=== Day78Intermediate: four creational pattern scenarios ===");
        System.out.println("Tip: pair jcmd class stats with code search for Proxy.newProxyInstance.");
        System.out.println();
        scenario1();
        scenario2();
        scenario3();
        scenario4();
        System.out.println("=== End of scenario pack ===");
        System.out.println("Attach javap -c snippets when arguing Singleton or proxy fixes.");
        System.out.println("hint: log git SHA next to jcmd output so you compare builds fairly.");
    }
}`;
  const output = `=== Day78Intermediate: four creational pattern scenarios ===
Tip: pair jcmd class stats with code search for Proxy.newProxyInstance.

--- Scenario 1: double-checked Singleton without volatile ---
symptom:  rare NullPointerException inside getInstance during load tests
cause:    another thread saw a half-published reference without a happens-before edge
why:      the JVM memory model allows reordering unless you use volatile or enum
fix:      replace with enum singleton or inject a single Spring bean with clear scope
verify:   javap -c -p YourSingleton.class and grep for monitorenter pattern
next:     stress test with jcstress or many parallel JUnit threads

--- Scenario 2: Serializable Singleton returns a second instance ---
symptom:  equals says two registry objects differ only after deserialization
cause:    readObject created a new instance beside your static holder
why:      serialization bypasses your private constructor unless you add readResolve
fix:      use enum singleton or implement readResolve returning the canonical instance
verify:   write ObjectOutputStream bytes and read back; assert identity equals
next:     search codebase for new Registry( via reflection in tests

--- Scenario 3: factory builds dynamic proxies in a hot loop ---
symptom:  Metaspace alerts while heap looks healthy; GC logs mention class unloading
cause:    Proxy.newProxyInstance or bytecode helpers create new classes each call
why:      each generated proxy is a Class object stored in Metaspace, not the heap
fix:      cache proxy instances or switch to stable interfaces with one shared proxy
verify:   jcmd <pid> GC.class_stats during soak and watch loaded class count
next:     javap -c on the factory to count invokedynamic and proxy sites

--- Scenario 4: Abstract Factory per region duplicated twelve ways ---
symptom:  each service invents its own PaymentFactory package and beans conflict
cause:    no shared creational module; teams copy-paste factory wiring
why:      Spring still needs one coherent bean graph per context at startup
fix:      publish a starter with @Configuration factories and @Qualifier names
verify:   mvn dependency:tree and Spring test that lists beans per profile
next:     ArchUnit rule: domain never calls new on vendor SDK classes directly

=== End of scenario pack ===
Attach javap -c snippets when arguing Singleton or proxy fixes.
hint: log git SHA next to jcmd output so you compare builds fairly.
`;
  return { code, output };
}

function buildAdvCode() {
  const code = `package arch.day78;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Tech lead triage: creational smells and JVM evidence without live I/O.
 */
public class Day78Advanced {

    record CreationRisk(String id, boolean staticSingleton, boolean proxyHotLoop, boolean builderSkipsValidation) {}

    public static void main(String[] args) {
        // Block 1: model signals you would get from code review plus jcmd / javap.
        System.out.println("=== Block 1: build the creational risk model ===");
        List<CreationRisk> risks = List.of(
            new CreationRisk("payments-api", true, false, false),
            new CreationRisk("payments-api", false, true, false),
            new CreationRisk("payments-api", false, false, true)
        );
        for (CreationRisk r : risks) {
            System.out.println(r.id() + " staticSingleton=" + r.staticSingleton()
                + " proxyHotLoop=" + r.proxyHotLoop() + " badBuilder=" + r.builderSkipsValidation());
        }
        System.out.println();

        // Block 2: ordered decision map — same order you would present in a design review.
        System.out.println("=== Block 2: apply the creational decision order ===");
        Map<String, String> action = new LinkedHashMap<>();
        action.put("singleton_static", "replace with enum or Spring @Bean; document lifecycle");
        action.put("proxy_loop", "cache Proxy instances; cap class generation; watch Metaspace");
        action.put("builder_gap", "throw IllegalStateException in build(); add invariant tests");
        for (Map.Entry<String, String> e : action.entrySet()) {
            System.out.println("signal " + e.getKey() + " -> " + e.getValue());
        }
        System.out.println();

        // Block 3: printable triage table for on-call or architecture forum.
        System.out.println("=== Block 3: triage table — symptom to first command ===");
        Map<String, String> table = new LinkedHashMap<>();
        table.put("StreamCorruptedException", "check readResolve on Singleton; test ObjectOutputStream round-trip");
        table.put("Metaspace OOM", "jcmd <pid> GC.class_stats; search for Proxy.newProxyInstance in hot paths");
        table.put("IllegalStateException in build", "audit Builder validation; add Micrometer counter for failures");
        for (Map.Entry<String, String> e : table.entrySet()) {
            System.out.println(e.getKey() + " | " + e.getValue());
        }
        System.out.println();
        System.out.println("=== Recommended order ===");
        System.out.println("1) javap -c -p suspected Singleton or factory class");
        System.out.println("2) jcmd <pid> VM.flags | findstr HeapSize");
        System.out.println("3) ADR when you accept a non-standard factory; add ArchUnit guard");
        System.out.println("note: Java 21 records plus Builder reduce DTO boilerplate if invariants stay in build().");
        System.out.println("note: Java 17 sealed interfaces narrow factory outputs without giant switch statements.");
        System.out.println("note: keep triage under 80 columns for Slack paste.");
        System.out.println("note: attach javap output to PR when changing creational patterns.");
        System.out.println("note: rerun soak after factory change; Metaspace spikes lag heap charts.");
        System.out.println("note: pair readResolve tests with any Serializable singleton registry.");
        System.out.println("note: document ObjectProvider usage when breaking circular bean graphs.");
    }
}`;
  const output = `=== Block 1: build the creational risk model ===
payments-api staticSingleton=true proxyHotLoop=false badBuilder=false
payments-api staticSingleton=false proxyHotLoop=true badBuilder=false
payments-api staticSingleton=false proxyHotLoop=false badBuilder=true

=== Block 2: apply the creational decision order ===
signal singleton_static -> replace with enum or Spring @Bean; document lifecycle
signal proxy_loop -> cache Proxy instances; cap class generation; watch Metaspace
signal builder_gap -> throw IllegalStateException in build(); add invariant tests

=== Block 3: triage table — symptom to first command ===
StreamCorruptedException | check readResolve on Singleton; test ObjectOutputStream round-trip
Metaspace OOM | jcmd <pid> GC.class_stats; search for Proxy.newProxyInstance in hot paths
IllegalStateException in build | audit Builder validation; add Micrometer counter for failures

=== Recommended order ===
1) javap -c -p suspected Singleton or factory class
2) jcmd <pid> VM.flags | findstr HeapSize
3) ADR when you accept a non-standard factory; add ArchUnit guard
note: Java 21 records plus Builder reduce DTO boilerplate if invariants stay in build().
note: Java 17 sealed interfaces narrow factory outputs without giant switch statements.
note: keep triage under 80 columns for Slack paste.
note: attach javap output to PR when changing creational patterns.
note: rerun soak after factory change; Metaspace spikes lag heap charts.
note: pair readResolve tests with any Serializable singleton registry.
note: document ObjectProvider usage when breaking circular bean graphs.
`;
  return { code, output };
}

const PITFALLS = [
  'Calling **getInstance** on a **Singleton** from a **static** **initializer** before fields finish wiring — you see **ExceptionInInitializerError** wrapped around **NullPointerException** in logs and blame **Spring**; fix by lazy init inside **getInstance** or use **enum** **Singleton**; verify with a **JUnit** test that constructs the class in isolation before the **ApplicationContext** starts.',
  'Forgetting **implements** **Cloneable** before **clone** — **CloneNotSupportedException** stops your **Prototype** demo on the first day; fix by implementing **Cloneable** or use **copy** **constructors** instead of **clone**; verify by running the same snippet on **Java** **17** and **Java** **21** locally and asserting no exception.',
  'Using **double-checked** **locking** for **Singleton** without **volatile** — rare **NullPointerException** under parallel **JUnit** looks like a flaky test, not memory rules; fix with **enum** **Singleton** or mark the holder **volatile**; verify with **javap** **-c** **MySingleton.class** and confirm **monitorenter** pairs, then add **jcstress** or high-thread **stress** **test**.',
  'Letting a **Builder** **build** method return half-valid **DTO**s — **Kafka** consumers throw **IllegalArgumentException** downstream while **unit** tests stayed green; enforce invariants in **build** and throw **IllegalStateException** with a clear field name; verify with **Micrometer** counter **builder_validation_failures** and a contract test that feeds bad combinations.',
  'Letting every team ship its own **Abstract** **Factory** for the same **payment** **vendor** — **Bean** name clashes and duplicate **SDK** versions appear at **runtime** after **merge**; publish one **starter** **module** with **@Configuration** and **@Qualifier** conventions; verify with **mvn** **dependency:tree** diff in **CI** and a **Spring** test that lists **beans** per **profile**.',
  'Caching **Proxy.newProxyInstance** results in a **Map** keyed by **wrong** identity — you still allocate **Metaspace** for new **proxy** **classes** when **class** **loader** scope changes; key by **ClassLoader** plus **interface** list or avoid **per-request** **proxies**; verify **jcmd** **GC.class_stats** during soak and compare **loaded** **class** count to **traffic** **QPS**.',
  'Setting **-XX:MaxMetaspaceSize** too low while **factories** legitimately load many **plugins** — **OutOfMemoryError** **Metaspace** hits only on **canary** **pods** with new **vendor** **JAR**s; raise cap after measuring **jcmd** **VM.native_memory** **summary** or shrink **dynamic** **class** generation; verify both **jcmd** **GC.class_stats** and **GC** **logs** during **deploy** **soak**.',
  'Skipping **readResolve** on a **Serializable** **Singleton** — after **session** **replication** you get two live **coordinate** **generators** and **id** **collisions** with no stack trace in **business** code; add **readResolve** or switch to **enum**; verify by **ObjectOutputStream** round-trip **test** in **CI** and assert **identityHashCode** matches the canonical instance.'
];

const WRONG = [
  '**Singleton** always means exactly one **object** in the **JVM**, no matter how many **class** **loaders** you use',
  '**Factory** **Method** and **Abstract** **Factory** are two names for the same **UML** box',
  '**Builder** is only for **testing**; **production** code should use **constructors** with twelve **parameters** for speed',
  '**Spring** **singleton** **beans** and **Gang** **of** **Four** **Singleton** are identical so you can mix them freely',
  'Calling **System.gc** after building many **Builder** **objects** is the right way to keep **Metaspace** small',
  '**Prototype** **clone** is always safer than **copy** **constructors** because **clone** is built into **Object**',
  'You can ignore **IllegalStateException** from **build** if the **DTO** still **serializes** to **JSON**',
  '**jcmd** **GC.heap_info** is the first tool when **Metaspace** runs out because **heap** and **Metaspace** are the same **region**'
];

function fuProd() {
  return {
    question: 'How do **creational** **patterns** show up in **production** or **build** incidents?',
    answer:
      'Last quarter a pricing **service** returned different **tax** **rates** between **pods** because a hand-rolled **Singleton** **registry** was **serialized** into **Redis** without a stable **readResolve** path. Two **JVM** processes rebuilt different **instances** after failover. **StreamCorruptedException** never appeared; the bug looked like **bad** **business** **rules**. We froze traffic, proved duplicate **instances** with **ObjectOutputStream** round-trip **tests**, and replaced the pattern with an **enum** **Singleton** plus a **Spring** **bean** for **wiring**. **p99** error **rate** dropped after deploy. **Creational** bugs hide inside **state** that should be global.'
  };
}

function fuTrap() {
  return {
    question: 'What is a common trap people believe about **Singleton**?',
    answer:
      'People believe **Singleton** means one **instance** per **application** everywhere. In real **JVM**s you also have **class** **loader** boundaries, **cluster** **replication**, and **Spring** **scopes**. A **Singleton** **class** in a **shared** **library** can exist once per **class** **loader**, so **WAR** **files** and **plugin** **containers** break the mental model. The fix is to say which **lifecycle** you mean: **enum** **Singleton** for **plain** **Java**, **Spring** **singleton** **bean** for **container** **lifecycle**, or explicit **injection** of a single **shared** **instance** you **test** with **fakes**.'
  };
}

function ca(core, err, cmd, ver) {
  const mid =
    ' Under the hood, **new** becomes **invokespecial** in **bytecode**, while **factory** **methods** hide that call behind a **stable** **interface**. **Proxy** **factories** can create new **Class** **objects** that live in **Metaspace**, so **heap** **graphs** can look healthy while **class** **loading** costs explode.';
  const tail =
    ' **Java** **17** **records** reduce **DTO** **boilerplate** when paired with **Builder** **validation**, and **Java** **21** **record** **patterns** simplify **factory** **dispatch** without giant **switch** **chains**. **Java** **11** **LTS** made **var** common for **local** **Builder** variables in **adapters**. When teams skip these guardrails, **production** shows **IllegalStateException**, **OutOfMemoryError** **Metaspace**, or silent **duplicate** **Singleton** **instances** after **serialization**.';
  return `${core}${mid} ${err} You verify with ${cmd}. ${ver}${tail}`;
}

const CONCEPTUAL_Q = [
  [
    'In one sentence, what is a **creational** **pattern**?',
    'You can think of **creational** **patterns** as agreed rules for **object** **birth**. They answer who may call **new**, how to hide **constructor** details, and how to build **immutable** **objects** without a **constructor** with fifteen **null** arguments. The **JVM** still executes **bytecode** the same way; **patterns** are about **team** **discipline** and **test** **speed**.',
    'When **creational** rules are vague, **teams** duplicate **factories** and **tests** become slow because every **class** **loads** a different **graph**.',
    '**javap** **-p** **MyDto.class** to confirm **constructors** are **private** after a **Builder** migration.',
    '**Java** **17** **records** often replace **DTO** **classes** while **Builder** still holds **validation** for optional fields.'
  ],
  [
    'What does **Singleton** mean in **Java** and why is it dangerous?',
    'A **Singleton** tries to give you one **shared** **instance** of a **type** so **coordinate** **code** can live in one place. The danger is **global** **mutable** **state** that **tests** cannot reset and **clusters** **deserialize** into duplicate **instances** if **serialization** is involved.',
    '**Production** **bugs** look like random **NullPointerException** or **inconsistent** **cache** **hits** when two **instances** exist.',
    '**jcmd** **<pid>** **GC.heap_info** plus **ObjectOutputStream** round-trip **tests** prove **identity** **story**.',
    '**Java** **21** still recommends **enum** **Singleton** for **language** **level** **serialization** safety over **double-checked** **locking**.'
  ],
  [
    'What is **Factory** **Method** when **interviewers** ask?',
    '**Factory** **Method** means a **method** (often on an **interface** or **abstract** **type**) decides which **concrete** **class** to **new** behind a **stable** **API**. Callers depend on **Document** or **PaymentClient**, not **PdfDocument** directly.',
    'When **factories** become **God** **classes** with giant **switch** **statements**, **teams** fear **touching** **vendor** **code**.',
    '**jdeps** **-summary** **your.jar** to see if **factory** **packages** depend on every **vendor** **SDK**.',
    '**Java** **17** **sealed** **interfaces** narrow **factory** outputs so **exhaustive** **switch** **expressions** stay honest.'
  ],
  [
    'What problem does **Builder** solve in plain words?',
    '**Builder** lets you set **optional** **fields** step by step and then call **build**() to create a **valid** **immutable** **object**. It avoids **constructors** with twelve **parameters** where **callers** pass **null** for **meaning** they do not understand.',
    'If **build** skips **validation**, **Kafka** **consumers** throw **IllegalArgumentException** far from the **origin**.',
    '**javap** **-c** **MyDto.class** shows **invokespecial** on **private** **ctor** only from **build**.',
    '**Java** **11** **var** keeps **local** **Builder** variables readable in **adapters** without extra **noise**.'
  ],
  [
    'What is **Prototype** **clone** and when do you avoid it?',
    '**Prototype** means **copy** an **existing** **object** instead of **parsing** or **fetching** again. **clone** is easy to misuse because **default** **clone** is **shallow** and **mutable** **nested** **objects** **share** **references**.',
    '**Production** **bugs** look like **two** **threads** mutating the same **nested** **list** without knowing.',
    '**javap** **-p** **on** **clone** **implementations** shows **synthetic** **bridges** and **throws** **clauses**.',
    '**Java** **8** **Collectors** and **immutable** **collections** from **List** **of** reduce **copy** **mistakes** compared to raw **clone**.'
  ],
  [
    'How does **Abstract** **Factory** differ from **Factory** **Method** in real **systems**?',
    '**Factory** **Method** usually picks one **product** **type** per **family** **member**. **Abstract** **Factory** returns a whole **family** of **related** **objects** (for example **Windows** **buttons** vs **Mac** **buttons**) so **UI** **themes** stay consistent.',
    'When **teams** mix the two names, **Spring** **beans** get **duplicated** **vendor** **wiring**.',
    '**mvn** **dependency:tree** shows whether **two** **factories** pull **different** **versions** of the same **SDK**.',
    '**Java** **17** **sealed** **hierarchies** help model **closed** **product** **families** without **reflection** **sprawl**.'
  ],
  [
    'Why do **Spring** **singleton** **beans** confuse people who studied **Gang** **of** **Four** **Singleton**?',
    '**Spring** **singleton** means one **instance** per **ApplicationContext**, not per **planet**. **GoF** **Singleton** is a **language** **idiom** about **static** **access** and **private** **constructors**. The **lifecycle** and **test** **story** differ.',
    '**BeanCurrentlyInCreationException** shows **graph** **cycles**, not **classic** **Singleton** **bugs**.',
    '**Spring** **Actuator** **/beans** **endpoint** lists **scopes** so you see **prototype** **mistakes** early.',
    '**Java** **21** **virtual** **threads** do not remove the need to understand **bean** **scope** and **construction** **order**.'
  ],
  [
    'What does **double-checked** **locking** get wrong without **volatile**?',
    '**Double-checked** **locking** tries to avoid **synchronized** **cost** on every **call** by **checking** a **field** twice. Without **volatile**, another **thread** can observe a **partially** **constructed** **instance** because **writes** can be **reordered**.',
    'Symptoms are **rare** **NullPointerException** in **getInstance** that **repro** only under **load**.',
    '**javap** **-c** **-p** **MySingleton.class** shows **monitorenter** pairs and **volatile** **field** **access**.',
    '**Java** **5** and newer fixed the **memory** **model** story, but **enum** **Singleton** still avoids the **debate** entirely.'
  ],
  [
    'How does **serialization** break naive **Singleton** **implementations**?',
    '**readObject** can **create** a **new** **instance** even when you thought **static** **fields** owned the world. **Attackers** and **frameworks** can **skip** your **private** **constructor** through **serialization** **machinery**.',
    '**Production** **symptoms** are **equals** **surprises** and **inconsistent** **in-memory** **id** **generators** after **failover**.',
    '**ObjectOutputStream** round-trip **tests** plus **grep** for **readResolve** catch **gaps**.',
    '**Java** **17** **records** are **serialization** **friendly** for **DTO**s but **domain** **entities** still need **rules** about **identity**.'
  ],
  [
    'What **Metaspace** pressure has to do with **Proxy** **factories**?',
    '**Proxy.newProxyInstance** can create **dynamic** **classes**. Each **class** consumes **Metaspace** **metadata**, not ordinary **heap** **objects** in the same way.',
    '**OutOfMemoryError** **Metaspace** can appear while **heap** **usage** looks **flat**.',
    '**jcmd** **<pid>** **GC.class_stats** shows **loaded** **class** count rising with **traffic**.',
    '**Java** **11** **LTS** adoption made **Metaspace** tuning common on **server** **containers** with **cgroups** **limits**.'
  ],
  [
    'How should **Builder** **validate** **invariants** before **objects** **escape**?',
    'Put **validation** in **build**() and throw **IllegalStateException** with a **field** **name** when **combinations** are illegal. Keep **fields** **private** until **build** finishes so **half-built** **builders** cannot leak.',
    'If you **validate** only in **setters**, **callers** can still **omit** **required** **fields**.',
    '**Micrometer** **counter** **builder_validation_failures** shows **blast** **radius** in **Grafana**.',
    '**Java** **21** **record** **patterns** can simplify **post-build** **checks** on **nested** **DTO** **graphs**.'
  ],
  [
    'When do you pick **static** **factory** **methods** instead of **public** **constructors**?',
    'Use **static** **factories** when you want **named** **construction** methods, **cached** **instances**, or **subtype** **selection** without exposing **constructors**. They also help when you may later return **subtypes** or **reuse** **immutable** **instances**.',
    'When **names** are vague, **callers** still **new** the **wrong** **subtype**.',
    '**javap** **-p** shows **private** **constructors** and **public** **static** **factory** **methods** clearly.',
    '**Java** **8** **interface** **static** **methods** can host **factories** for **service** **loader** style **plugins**.'
  ],
  [
    'How do you test **creational** **code** without **Spring** **context** **tests**?',
    'Keep **factories** **pure** **Java** where possible. **JUnit** **5** **tests** should **assert** **invalid** **combinations** throw and **valid** **combinations** build **immutable** **objects** you can **compare** with **equals**.',
    'When **tests** only use **Spring**, **construction** **bugs** hide behind **bean** **wiring** **noise**.',
    '**mvn** **-Dtest=BuilderTest** **test** should run in **seconds** on **laptop** **CI**.',
    '**Java** **17** **text** **blocks** make **JSON** **fixture** **strings** readable in **adapter** **tests**.'
  ],
  [
    'What is an **ObjectProvider** and why does **Spring** use it for **lazy** **creation**?',
    '**ObjectProvider** is a **lookup** **indirection** that lets you **defer** **fetching** a **bean** until **runtime** **needs** it. It helps when **circular** **dependencies** are risky and you want **explicit** **lazy** **initialization**.',
    'Misuse still creates **surprise** **eager** **graphs** if you **call** **getObject** everywhere **unconditionally**.',
    '**Spring** **Actuator** **/beans** **endpoint** shows **lazy** **initialization** **flags** when configured.',
    '**Java** **21** **scoped** **values** are **different** from **Spring** **scopes**; keep **names** straight in **reviews**.'
  ],
  [
    'How does **ArchUnit** stop **random** **new** **VendorSdk** in **domain** **packages**?',
    '**ArchUnit** **tests** **fail** **CI** when **domain** **packages** **dependOn** **concrete** **vendor** **types**. That forces **factories** and **ports** to live **where** you **expect**.',
    'Without **CI** **rules**, **vendors** **leak** into **domain** and **tests** become **integration** **heavy**.',
    '**ArchUnit** **noClassesThat**().**resideIn**("..domain..").**should**().**dependOn**... is a common **snippet**.',
    '**Java** **11** **module** **exports** can **layer** **on** **top** of **ArchUnit** for **stronger** **guards**.'
  ],
  [
    'What **Staff** **level** fact ties **records** to **creational** **patterns**?',
    '**records** are **immutable** **data** **carriers** **generated** by **javac** with **equals**/**hashCode**/**toString**. They pair with **Builder**-style **construction** at **boundary** **DTO**s while **domain** **entities** stay **classes** you **control** for **behavior**.',
    'If you **abuse** **records** for **entities** with **mutable** **lists**, you **recreate** **HashMap** **key** **bugs**.',
    '**javap** **-p** **MyRecord.class** shows **canonical** **constructor** and **components**.',
    '**Java** **21** **record** **patterns** simplify **factory** **output** **dispatch** without **nested** **if** **ladders**.'
  ],
  [
    'How do you explain **Abstract** **Factory** **trade-offs** to a **non** **Java** **stakeholder**?',
    'Say **Abstract** **Factory** buys **consistency** across **related** **objects** (same **vendor** **theme**) at the **cost** of more **interfaces** and **wiring** **code**. The **alternative** is **copy** **paste** **vendor** **calls** that **diverge** under **deadline** **pressure**.',
    'Stakeholders care about **defect** **cost** and **time** **to** **change** **vendor** more than **names**.',
    '**Quarterly** **review** of **integration** **incident** **count** validates whether **factory** **discipline** paid off.',
    '**Java** **17** **migration** **ADR**s often mention **sealed** **factories** when **vendor** **SDK** **counts** grow.'
  ]
];

function buildConceptual() {
  return CONCEPTUAL_Q.map(([q, a1, e2, c3, v4]) => ({
    question: q,
    answer: ca(a1, e2, c3, v4),
    followUps: [fuProd(), fuTrap()]
  }));
}

const CB_TAIL =
  ' Tie the story back to **creational** **discipline**: **validate** in **build**, prefer **enum** **Singleton** over **clever** **static** **holders**, and pair **javap** with **jcmd** **GC.class_stats** when **Metaspace** moves. **Java** **17** **sealed** **types** help **factories** stay **exhaustive** without **reflection** **sprawl**.';

const CB_ANS = [
  'This **enum** **Singleton** gives you one **instance** per **enum** **constant** with **language** **level** **serialization** safety. **javac** generates **values**() and **ordinal** **machinery** you normally hand-roll wrong. At **runtime** there is no **public** **constructor** for **outside** **code** to call, which blocks naive **reflection** **newInstance** paths compared to a plain **class** **Singleton**. **Production** risk with **enum** is mostly **mutable** **state** you add later to the **enum** **constant** **class** body. You verify behavior with **javap** **-p** **OrderGateway.class** and **unit** **tests** that **serialize** and **deserialize** without duplicate **identity**. **Java** **21** still treats **enum** **Singleton** as the interview **default** answer over **double-checked** **locking**.',
  '**new** **RuntimeException**("x") allocates a **Throwable** with a **stack** **trace** capture when constructed, not when printed. **getMessage** only returns the **String** you passed; it does not **throw**. This snippet is small but it reminds you that **exception** **objects** are **ordinary** **heap** **allocations** unless you override **fillInStackTrace** for **performance** **sensitive** **paths**. In **creational** **reviews**, noisy **exception** **constructors** in **hot** **loops** pair with **allocation** **profiles**, not only **pattern** **theory**. You verify with **jcmd** **<pid>** **GC.heap_info** during **fault** **injection** tests. **Java** **11** improved **stack** **trace** **cost** characteristics for some **patterns**, but **exceptions** for **control** **flow** remain a **smell**.',
  '**Optional** **empty**() returns a **singleton** **empty** **Optional** instance shared across the **JVM**. **orElse** returns **"fallback"** without calling **orElseGet** because there is no **value** to compute lazily. No **autoboxing** or **NullPointerException** appears here. This matters to **creational** **code** because **Optional** is sometimes misused as a **field** **type** or **serialization** **DTO**, which breaks **frameworks**. Prefer **Optional** as a **return** **type** for **methods** that may lack a **result**. You verify with **javap** **-c** on a tiny **class** to see **invokestatic** **Optional.empty**. **Java** **8** brought **Optional**; **Java** **11** added **Optional** **stream** helpers that reduce **factory** **boilerplate** in **adapters**.',
  '**List** **of** returns an **immutable** **list** implementation. **add** throws **UnsupportedOperationException** at **runtime** because the **list** **implementation** rejects **mutation**. This is not a **creational** **bug** about **new**, but it is **Liskov**-adjacent: callers who assumed **mutable** **List** **behavior** get **surprises**. For **DTO** **builders**, return **immutable** **collections** from **build**() so **callers** cannot **mutate** shared **graphs** after **validation**. You verify with **JUnit** **assertThrows**(**UnsupportedOperationException**.**class**, () -> xs.add(2)). **Java** **21** **sequenced** **collections** add ordering **guarantees** for some **immutable** **factories**.',
  '**record** **Point**(**int** **x**,**int** **y**) generates **value-based** **equals** and **hashCode**, but **System.identityHashCode** still uses **object** **header** **identity**, not **value** **equality**. So two **new** **Point**(1,1) **objects** can **equals** true while **identityHashCode** differs. **creational** **lesson**: **identity** **versus** **value** matters when you **cache** **instances** in **Singleton** **maps** keyed by **object** **references**. You verify by printing **equals** and **identityHashCode** side by side in a **main**. **Java** **16**+ **records** are stable; **Java** **21** **record** **patterns** help **dispatch** **factory** **outputs** without **reflection**.',
  'This **class** will not **compile** in a plain **javac** **project** without **Spring** **libraries** because **@Service** is an **unknown** **annotation** **type** unless you import **org.springframework**. The teaching point is **framework** **annotations** are **just** **types** on the **classpath**; **creational** **wiring** still happens through **constructors** and **bean** **factories** at **runtime**. If you see **BeanCreationException**, the **root** **cause** is often **constructor** **graphs**, not missing **annotations** textually. You verify **classpath** with **mvn** **dependency:tree** and **javap** **-p** on **compiled** **classes** inside **Spring** **Boot** **fat** **jar**.',
  '**Map** **get** on a **missing** **key** returns **null** for **Integer** **values**. Assigning **null** to **int** **x** triggers **unboxing** with **NullPointerException** because **Java** tries to call **intValue** on **null**. This is a **Senior** **trap** in **factory** **maps** that **cache** **Integer** **counts**. Use **getOrDefault** or **Optional** **ofNullable**(**m.get**("k")). **Production** **logs** show **NPE** at **unbox** lines that look like **business** **logic** **bugs**. You verify with a **tiny** **main** and **breakpoint** on **autoboxing** in **IDE**. **Java** **8** **Map** **methods** like **getOrDefault** reduce this **class** of **bug**.',
  '**Stream** **of**(1,2,3) creates an **ordered** **stream**; **map** doubles each **element**; **forEach** prints **2**, **4**, **6** on separate lines. **creational** angle: **streams** are not **collections**; they are **pipeline** **objects** with **lazy** **evaluation** until a **terminal** **operation**. **forEach** is **terminal**, so **map** runs now. Avoid **building** **streams** in **tight** **loops** without **reuse** if **allocation** matters; sometimes a **plain** **for** is clearer in **domain** **code**. You verify with **javap** **-c** to see **invokeinterface** **stream** **calls**. **Java** **21** **sequenced** **streams** align with **ordered** **collection** **views** for **API** **DTO** **lists**.'
];

const CB_Q = [
  'What does this **enum** **Singleton** guarantee?\n```java\nenum Gateway {\n  INSTANCE;\n  int seq() { return 0; }\n}\n```',
  'What does this teach about **Throwable** construction?\n```java\nThrowable t = new RuntimeException("x");\nSystem.out.println(t.getMessage());\n```',
  'What prints?\n```java\nimport java.util.Optional;\nclass O {\n  public static void main(String[] a) {\n    System.out.println(Optional.empty().orElse("fallback"));\n  }\n}\n```',
  'What happens?\n```java\nimport java.util.List;\nclass L {\n  public static void main(String[] a) {\n    var xs = List.of(1);\n    xs.add(2);\n  }\n}\n```',
  'Does **record** **Point** make **identityHashCode** equal for equal points?\n```java\nrecord Point(int x,int y){}\nclass P {\n  static void go() {\n    var a = new Point(1,1);\n    var b = new Point(1,1);\n    System.out.println(System.identityHashCode(a)==System.identityHashCode(b));\n  }\n}\n```',
  'Will this compile without **Spring** on **classpath**?\n```java\n@Service\nclass X {}\n```',
  'What throws?\n```java\nimport java.util.HashMap;\nimport java.util.Map;\nclass M {\n  static void go() {\n    Map<String,Integer> m = new HashMap<>();\n    int x = m.get("k");\n  }\n}\n```',
  'What prints?\n```java\nimport java.util.stream.Stream;\nclass S {\n  public static void main(String[] a) {\n    Stream.of(1,2,3).map(x->x*2).forEach(System.out::println);\n  }\n}\n```'
];

function buildCodeBased() {
  return CB_Q.map((q, i) => ({
    question: q,
    answer: CB_ANS[i] + ' ' + CB_TAIL,
    followUps: [fuProd(), fuTrap()]
  }));
}

function seniorBlock(i) {
  const body =
    '**Immediate response:** Run `jcmd <pid> GC.class_stats` and `jcmd <pid> VM.native_memory summary` on the **canary** pod while you capture **thread** **dumps** from **jcmd <pid> Thread.print**. In parallel, **grep** the **deployed** **artifact** for **Proxy.newProxyInstance** and **Factory** **classes** that might run per **request**. Save **javap** **-c** on the hottest **factory** **class** from the **jar** so you can show **invokedynamic** **chains** in the **postmortem** channel.\n\n' +
    '**Root cause:** **Metaspace** stores **Class** **metadata** for **dynamic** **proxies** and **anonymous** **classes** created by **factories** that were not **cached**. The **heap** **metrics** can look healthy while **class** **loading** explodes because **Metaspace** is a separate **native** **region** from **Java** **heap** **objects**. **Java** **8** through **21** all behave this way; **Java** **17** **records** do not fix **proxy** **storms** unless you **design** **construction** **boundaries**.\n\n' +
    '**Fix:** **Cache** **proxy** **instances** keyed by **interface** **list** plus **ClassLoader**, or **replace** **per-request** **proxies** with **explicit** **adapters** compiled once. **Raise** **-XX:MaxMetaspaceSize** only after **measurement**; otherwise you hide **leaks**. Add **JUnit** **stress** **tests** that exercise the **factory** under **concurrency** and **assert** **loaded** **class** count stays **flat** using **jcmd** **GC.class_stats** snapshots before and after the **load** **test** **window**.\n\n' +
    '**Prevention:** Publish a **starter** **module** with **approved** **creational** **patterns** for **vendor** **SDK**s, **ArchUnit** rules that **ban** **new** **VendorClient** in **domain** **packages**, and an **ADR** for every **Abstract** **Factory** **family** added. **Java** **21** **virtual** **threads** reduce **blocking** in **IO** **adapters** but they do not stop **bad** **factory** **graphs** from **allocating** **classes**.\n\n' +
    'Extra context: when **teams** confuse **Spring** **singleton** **beans** with **GoF** **Singleton**, they **inject** **prototype** **beans** into **wrong** **scopes** and **share** **mutable** **state** by **accident**. **Java** **11** **http** **client** belongs behind **ports**, not inside **static** **holders**. Pair **ObjectOutputStream** **round-trip** **tests** with **serialization** **flags** for any **registry** that claims **global** **identity** across **pods**.';
  return body;
}

function buildSenior() {
  const titles = [
    '**Incident:** **Canary** **pods** throw **OutOfMemoryError**: **Metaspace** right after a **deploy** that added a **per-request** **Proxy** **factory** in the **payment** **gateway**.',
    '**Design:** **PM** wants a **third** **vendor** **Abstract** **Factory** **family** added in one **sprint** without a **shared** **starter** **module**.',
    '**Ops:** **CI** **integration** **tests** **OOM** **Metaspace** only when **Gradle** **runs** **parallel** **workers** that **build** thousands of **dynamic** **mocks**.',
    '**Scale:** **p99** **latency** spikes because a **Builder** **build** **method** forgot **validation** and **invalid** **DTO**s **queue** on **Kafka** **retry** **loops**.',
    '**Security:** **Code** **review** finds **Constructor.newInstance** in **tests** that **bypass** **private** **Singleton** **constructors** and **ship** to **production** **helpers** by **mistake**.',
    '**Cost:** Twelve **services** each **forked** a **PaymentFactory** **class** and **dependency** **trees** now **pull** **three** **incompatible** **SDK** **versions**.'
  ];
  return titles.map((q) => ({
    question: q,
    answer: seniorBlock(0),
    followUps: [
      {
        question: 'How do you communicate blast radius during this?',
        answer:
          'You list customer-facing **API** **routes** touched, **error** **rate** **SLO** **burn**, and whether **rollback** is safe given **schema** **migrations**. You keep **Slack** updates short: what you verified with **jcmd**, what you changed, what still unknown. You avoid blaming individuals; you cite **dependency** **graphs** and **ADR** gaps.'
      },
      {
        question: 'Which **post-incident** item is mandatory?',
        answer:
          'Update **ArchUnit** rules, attach **jdeps** **before**/**after** **artifact** to the ticket, and add a **module** **ownership** line in the **runbook** so the next **on-call** knows which **package** **violations** are intentional debt with a removal date.'
      }
    ]
  }));
}

function mcqRow(level, category, id, q, opts, ans, exp) {
  return { id, level, category, question: q, options: opts, answer: ans, explanation: exp };
}

function buildMcq() {
  const q = [];
  let id = 1;
  const B = (cat, question, opts, ans, exp) => {
    q.push(mcqRow('basic', cat, id++, question, opts, ans, exp));
  };
  const I = (cat, question, opts, ans, exp) => {
    q.push(mcqRow('intermediate', cat, id++, question, opts, ans, exp));
  };
  const A = (cat, question, opts, ans, exp) => {
    q.push(mcqRow('advanced', cat, id++, question, opts, ans, exp));
  };

  B('theory', '**Creational** **patterns** mainly solve?', { A: 'Object **birth** and **construction** rules', B: 'SQL **tuning**', C: 'CSS **layout**', D: 'TLS **handshake** speed' }, 'A', '**Creational** **patterns** focus on **who** calls **new** and **how** **objects** are built.');
  B('theory', '**Singleton** tries to guarantee?', { A: 'One shared **instance** of a **type** in a **scope**', B: 'Immutable **Strings**', C: '**O**(1) **sort**', D: '**Zero** **GC**' }, 'A', 'Say which **scope**: **JVM**, **class** **loader**, or **Spring** **context**.');
  B('theory', '**Factory** **Method** hides?', { A: 'Which **concrete** **class** gets **new**', B: '**SQL** **indexes**', C: '**HTTP** **status** **codes**', D: '**CPU** **affinity**' }, 'A', 'Callers depend on **interfaces** or **abstract** **types**.');
  B('theory', '**Builder** helps when?', { A: 'Many optional **fields** and **validation** rules', B: 'You need **faster** **loops**', C: 'You need **smaller** **Git**', D: 'You need **more** **threads**' }, 'A', '**build**() should enforce **invariants**.');
  B(
    'code-reading',
    'What fails?\n```java\ninterface P { void a(); void b(); }\nclass X implements P { public void a(){} }\n```',
    { A: '**javac** error: **X** not **abstract**', B: 'Runs fine', C: '**NPE**', D: '**SOE**' },
    'A',
    'Must implement all **interface** methods or stay **abstract**.'
  );
  B(
    'code-reading',
    'Immutable list?\n```java\nimport java.util.List;\nList<Integer> xs = List.of(1,2);\n```',
    { A: 'Yes', B: 'No', C: 'Only on **Java** **8**', D: 'Needs **new**' },
    'A',
    '**List.of** returns unmodifiable list.'
  );
  B(
    'code-reading',
    '**enum** **Singleton** idiom?\n```java\nenum K { INSTANCE }\n```',
    { A: 'One **enum** **constant** **INSTANCE**', B: '**Compile** **error**', C: '**Two** **instances**', D: 'Needs **new**' },
    'A',
    '**enum** **Singleton** is a common **Java** **interview** answer.'
  );
  B(
    'real-world',
    'Your **domain** **package** calls **new** **VendorSdk** everywhere. Best summary?',
    { A: 'Hide **construction** behind **factory** or **port**', B: 'Always fine', C: 'Faster **GC**', D: 'Required by **Kafka**' },
    'A',
    'Centralize **creational** **rules** so **teams** do not fork **vendor** **wiring**.'
  );

  I('theory', '**Abstract** **Factory** focuses on?', { A: 'Families of related **products**', B: 'Sorting **arrays**', C: '**TCP** **buffers**', D: '**JWT** **signing**' }, 'A', 'Keeps **vendor** **themes** consistent.');
  I('theory', '**Prototype** **pattern** is about?', { A: 'Copying **existing** **objects**', B: '**CPU** **affinity**', C: '**CSS** **grid**', D: '**TLS** **version**' }, 'A', 'Watch **shallow** versus **deep** **copy**.');
  I('theory', '**double-checked** **locking** risk without **volatile**?', { A: 'Half-published **Singleton** **reference**', B: '**Faster** **equals**', C: '**Smaller** **Git**', D: '**Better** **JSON**' }, 'A', '**Memory** **model** **reordering** bites under **load**.');
  I('theory', '**Spring** **prototype** **scope** means?', { A: 'New **bean** **instance** per **lookup**', B: 'One **instance** per **planet**', C: '**Immutable** **String**', D: '**No** **beans**' }, 'A', 'Do not confuse with **singleton** **scope**.');
  I(
    'code-reading',
    'Output?\n```java\nrecord R(int x){}\nclass T {\n  public static void main(String[] a){\n    var r1 = new R(1);\n    var r2 = new R(1);\n    System.out.println(r1.equals(r2));\n  }\n}\n```',
    { A: 'true', B: 'false', C: 'compile error', D: 'throws' },
    'A',
    '**record** **equals** compares fields.'
  );
  I(
    'code-reading',
    'Throws?\n```java\nimport java.util.HashMap;\nimport java.util.Map;\nclass M {\n  static void go(){\n    Map<String,Integer> m = new HashMap<>();\n    int v = m.get("x");\n  }\n}\n```',
    { A: '**NPE** on unbox', B: 'prints 0', C: 'compile error', D: '**SOE**' },
    'A',
    '**null** **Integer** unbox throws **NPE**.'
  );
  I(
    'code-reading',
    '**BeanCurrentlyInCreationException** often signals?',
    { A: '**Circular** **dependency**', B: 'Low **heap**', C: 'Bad **CSS**', D: 'Wrong **JDK** **vendor**' },
    'A',
    '**Spring** **bean** graph cycle.'
  );
  I(
    'code-reading',
    '**jdeps** helps?', { A: 'Package **cycles**', B: 'SQL **tuning**', C: '**CSS** minify', D: '**TLS** certs' },
    'A',
    '**jdeps** shows **module**/**package** dependencies.'
  );
  I(
    'code-reading',
    '**ArchUnit** is used to?', { A: 'Enforce **package** rules in **tests**', B: 'Tune **GC**', C: 'Encrypt **JWT**', D: 'Replace **JUnit**' },
    'A',
    '**ArchUnit** asserts **architecture** constraints.'
  );
  I(
    'real-world',
    'Team shares **DTO** **kernel** across contexts and terms diverge. Risk?',
    { A: 'Semantic **bugs**', B: 'Faster **CPU**', C: 'Smaller **Git**', D: 'Better **LSP**' },
    'A',
    '**Bounded** **context** vocabulary drifts.'
  );
  I(
    'real-world',
    '**Microservice** split before **modular** **monolith** proof. Likely pain?',
    { A: 'Network **latency** masking design gaps', B: 'Automatic **patterns**', C: 'Free **Kafka**', D: 'Zero **DTO** **mapping**' },
    'A',
    'Distributed **fallacies** hit early.'
  );
  I(
    'real-world',
    '**Builder** **build** returns **DTO** without checking **required** **fields**. Risk?',
    { A: '**Invalid** **objects** reach **Kafka**', B: 'Faster **CPU**', C: 'Smaller **Git**', D: 'Better **GC**' },
    'A',
    'Validate in **build** and throw **IllegalStateException** with **context**.'
  );

  A(
    'theory',
    '**JPMS** **module-info** **exports** primarily control?',
    { A: 'Which **packages** are readable', B: 'Heap size', C: 'Thread count', D: 'TLS version' },
    'A',
    '**exports** gate **compile**/**runtime** access.'
  );
  A(
    'theory',
    '**Sealed** **interfaces** (**Java** **17**) help **factories** by?',
    { A: 'Limiting implementations you must reason about', B: 'Removing **interfaces**', C: 'Disabling **JUnit**', D: 'Forcing **microservices**' },
    'A',
    '**sealed** narrows allowed **subtypes**.'
  );
  A(
    'code-reading',
    'Anti-pattern?\n```java\npackage com.mybiz.domain;\nimport org.springframework.stereotype.Service;\n@Service\npublic class Rule {}\n```',
    { A: '**Domain** depends on **Spring**', B: 'Fine always', C: 'Required by **patterns** books', D: 'Faster tests' },
    'A',
    'Keep **framework** **annotations** out of pure **domain** if you want strict rings.'
  );
  A(
    'code-reading',
    'Risk?\n```java\nclass A { B b; }\nclass B { A a; }\n```',
    { A: 'Construction **cycle**', B: 'Always illegal', C: '**LSP** violation', D: '**GC** leak' },
    'A',
    '**Spring** may struggle to order **beans** without **interfaces**/**events**.'
  );
  A(
    'on-call',
    'After deploy, **Metaspace** climbs only on canary pods. First suspicion with **creational** lens?',
    { A: '**Dynamic** **classes** from **Proxy** **factories**', B: '**CPU** too fast', C: '**TLS** cipher', D: '**CSS** bundle' },
    'A',
    '**Proxy** **storms** inflate **Metaspace** before **heap** looks bad.'
  );
  A(
    'on-call',
    '**jdeps** shows **cycle** between **api** and **domain**. Best next step?',
    { A: 'Break cycle with **interface** or move **DTO**', B: 'Increase **-Xmx** only', C: 'Delete tests', D: 'Add **@Lazy** everywhere' },
    'A',
    'Cycles need design fixes, not only **Spring** tricks.'
  );
  A(
    'architecture',
    'You need cross-team **DTO** sharing. Safest?',
    { A: 'Versioned **contract** **module** + **consumer** **tests**', B: 'Copy **paste** fields', C: 'Shared **database** **schema** only', D: 'Email **JSON** samples' },
    'A',
    'Contracts + tests beat tribal knowledge.'
  );
  A(
    'architecture',
    '**Abstract** **Factory** **families** across **services** drift. Best governance?',
    { A: 'Shared **starter** **module** + **ADR** per **vendor**', B: 'Delete **interfaces**', C: 'Avoid **tests**', D: 'One **global** **Singleton** map' },
    'A',
    'Publish **one** **blessed** **factory** **graph** per **platform**.'
  );
  A(
    'on-call',
    '**NoClassDefFoundError** after **shading** plugin update. Tool?',
    { A: '**jdeps** on fat **jar**', B: '**ping**', C: '**top**', D: '**curl** **localhost**' },
    'A',
    'Find duplicate **packages** and **classpath** conflicts.'
  );
  A(
    'architecture',
    'Your **platform** team mandates **Java** **21** but one **service** still uses **field** **injection** everywhere. **Creational** angle?',
    { A: 'Prefer **constructor** **injection** to make **dependencies** explicit', B: 'Field **injection** is always better', C: 'Delete **interfaces**', D: 'Add more **static** **utils**' },
    'A',
    '**Constructor** **injection** clarifies **object** **graphs** for **factories** and **tests**.'
  );

  return q;
}

const CHEATSHEET = `| Level | Concept | The rule in one line | Example or Command |
|-------|---------|----------------------|--------------------|
| Fresher | **Singleton** | One **shared** **instance** per **scope** you name | **enum** **K** { **INSTANCE** } |
| Fresher | **Factory** **Method** | Hide **new** behind **interface** | **static** **Document** **pdf**() { **return** **new** **Pdf**(); } |
| Fresher | **Builder** | **validate** in **build**() | **throw** **new** **IllegalStateException**("missing id") |
| Senior Dev | **volatile** **DCL** | **volatile** or **enum** stops **half-published** refs | **javap** **-c** **Singleton.class** |
| Senior Dev | **Prototype** | **clone** vs **copy** **ctor** | **implements** **Cloneable** or avoid **clone** |
| Senior Dev | **Spring** **scope** | **singleton** **bean** **!=** **GoF** **Singleton** | **@Scope**(**ConfigurableBeanFactory**.**SCOPE_PROTOTYPE**) |
| Senior Dev | **jdeps** | See **package** **cycles** in **factories** | **jdeps** **-summary** **app.jar** |
| Tech Lead | **Abstract** **Factory** | One **family** per **vendor** **theme** | **PaymentFactory** **eu**() vs **us**() |
| Tech Lead | **ArchUnit** | **Ban** **new** **VendorSdk** in **domain** | **noClasses**()...**should**()... |
| Tech Lead | **Starter** **module** | **One** **blessed** **wiring** **graph** | **@Configuration** **class** **VendorBeans** |
| Staff | **Metaspace** | **Proxy** **classes** cost **metadata** | **jcmd** **<pid>** **GC.class_stats** |
| Staff | **readResolve** | **Singleton** **serialization** story | **ObjectOutputStream** round-trip **test** |
| Staff | **JPMS** | Enforce **exports** on **factory** **packages** | **module-info** **exports** **com.mybiz.api** |`;

function buildDay78Sections() {
  const basic = buildBasicCode();
  const mid = buildMidCode();
  const adv = buildAdvCode();
  return [
    { type: 'why', title: 'Why creational design patterns matter in real Java systems', content: buildWhy() },
    { type: 'theory', title: 'Theory and Internals — Design Patterns — Creational', content: buildTheoryContent() },
    {
      type: 'code',
      title: 'Basic — Creational patterns reference card',
      language: 'java',
      filename: 'Day78Basic.java',
      level: 'basic',
      description: 'Print-only vocabulary for week-one learners.',
      code: basic.code,
      output: basic.output
    },
    {
      type: 'code',
      title: 'Intermediate — Four creational pattern incidents',
      language: 'java',
      filename: 'Day78Intermediate.java',
      level: 'intermediate',
      description: 'Senior narration with diagnostic commands.',
      code: mid.code,
      output: mid.output
    },
    {
      type: 'code',
      title: 'Advanced — Creational triage matrix',
      language: 'java',
      filename: 'Day78Advanced.java',
      level: 'advanced',
      description: 'Tech lead printable checklist.',
      code: adv.code,
      output: adv.output
    },
    {
      type: 'diagram',
      title: 'Creational families — factories and products',
      diagramType: 'component',
      description: 'Abstract Factory returns related products behind interfaces.',
      plantuml:
        '@startuml\ntitle Day 78 — Creational families\ninterface PaymentClient\nclass StripeClient\nclass AdyenClient\ninterface PaymentFactory\nclass EuPaymentFactory\nclass UsPaymentFactory\nPaymentFactory <|.. EuPaymentFactory\nPaymentFactory <|.. UsPaymentFactory\nEuPaymentFactory ..> StripeClient : creates\nUsPaymentFactory ..> AdyenClient : creates\nPaymentClient <|.. StripeClient\nPaymentClient <|.. AdyenClient\nnote right of PaymentFactory : one family per region or vendor theme\n@enduml'
    },
    { type: 'pitfalls', title: 'Common Pitfalls', items: PITFALLS },
    {
      type: 'exercise',
      title: 'Exercise — Creational pattern vocabulary (fresher)',
      audience: 'fresher',
      difficulty: 'Beginner',
      problem:
        'You are writing your first **Java** program to practice **creational** **pattern** words before you touch a real **service**.\n\n1. Create **arch.day78.Day78FresherExercise** with **main**.\n2. Print one line that explains **Singleton** in plain words.\n3. Print one line that explains **Factory** **Method** in plain words.\n4. Print one line that explains **Builder** in plain words.',
      hints: [
        'Keep **final** **String** constants at the top of **main**.',
        '**Singleton** is about one shared **instance** in a **scope** you can name.',
        '**Builder** should **validate** before it returns an **object**.'
      ],
      solution: `package arch.day78;

/** Fresher drill: say the creational words before you argue in code review. */
public class Day78FresherExercise {

    public static void main(String[] args) {
        // args unused so output is deterministic across laptops.
        final String singleton = "Singleton means one shared instance for a named scope; watch global mutable state.";
        // singleton anchors interviews; enum often beats hand-rolled double-checked locking.
        System.out.println(singleton);
        final String factory = "Factory Method hides new behind a method so callers depend on interfaces.";
        // factory reminds you that construction is a policy decision, not scattered news.
        System.out.println(factory);
        final String builder = "Builder sets optional fields step by step and validates inside build().";
        // builder matches how you keep DTO invariants honest at boundaries.
        System.out.println(builder);
        final String proto = "Prototype copies an existing object instead of reparsing expensive inputs.";
        // proto warns about shallow copy surprises with nested mutable lists.
        System.out.println(proto);
        final String spring = "Spring singleton bean means one instance per ApplicationContext, not per planet.";
        // spring stops you from confusing container scope with GoF Singleton.
        System.out.println(spring);
        final String meta = "Metaspace holds class metadata; proxy factories can grow it before heap looks full.";
        // meta connects creational choices to jcmd GC.class_stats on-call.
        System.out.println(meta);
    }
}
`
    },
    {
      type: 'exercise',
      title: 'Exercise — Factory and Metaspace triage (staff)',
      audience: 'staff',
      difficulty: 'Advanced',
      problem:
        'Your **payment** **gateway** **service** shows **OutOfMemoryError**: **Metaspace** on **canary** **pods** after a **deploy** that added **per-request** **Proxy** **factories**.\n\n1. Model three **components** **c1**, **c2**, **c3** with **boolean** flags **proxyHotLoop** and **builderMissingValidation**.\n2. Store recommended first actions in a **LinkedHashMap** from **component** id to **String** command (**jcmd**, **javap**, or **grep** **Proxy**).\n3. Print each modeled **component** line.\n4. Print the **map** entries in insertion order.\n5. Print one **prevention** line about **caching** **proxies** and an **ArchUnit** rule for **domain** **packages**.',
      hints: [
        'Use **record** for **CreationalRisk** to keep the demo short.',
        '**LinkedHashMap** preserves the triage story order.',
        'Commands are strings; you are not executing shell code here.'
      ],
      solution: `package arch.day78;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Staff exercise: deterministic triage card for creational Metaspace incidents. */
public class Day78StaffExercise {

    record CreationalRisk(String id, boolean proxyHotLoop, boolean builderMissingValidation) {}

    public static void main(String[] args) {
        // LinkedHashMap keeps escalation order stable for audit logs.
        Map<String, String> action = new LinkedHashMap<>();
        action.put("c1", "jcmd <pid> GC.class_stats");
        action.put("c2", "javap -c -p com.mybiz.PaymentProxyFactory.class");
        action.put("c3", "grep -R Proxy.newProxyInstance src/main/java");

        // Three synthetic components mirror on-call signals you combine.
        List<CreationalRisk> risks = List.of(
            new CreationalRisk("c1", true, false),
            new CreationalRisk("c2", false, true),
            new CreationalRisk("c3", true, true)
        );

        // Printing the model first proves you understood the inputs.
        System.out.println("=== Modeled components ===");
        for (CreationalRisk p : risks) {
            System.out.println(p.id() + " proxyHot=" + p.proxyHotLoop() + " badBuilder=" + p.builderMissingValidation());
        }

        // Map entries tie each id to the first command you would actually run.
        System.out.println("=== First command per component ===");
        for (Map.Entry<String, String> e : action.entrySet()) {
            System.out.println(e.getKey() + " -> " + e.getValue());
        }

        // Prevention is how you stop the next leak: cache proxies and validate builders.
        System.out.println("=== Prevention ===");
        System.out.println("Cache Proxy instances per interface list; ArchUnit ban new VendorSdk in domain packages.");

        // Staff reasoning: Metaspace ties to class loading, not only heap -Xmx.
        System.out.println("=== Metaspace note ===");
        System.out.println("Dynamic proxy classes live in Metaspace; soak tests must watch GC.class_stats.");

        // javap note reminds reviewers to read bytecode when factories get clever.
        System.out.println("=== javap note ===");
        System.out.println("javap -c shows invokedynamic chains that explain hidden class generation.");

        // Operational note: align JDK with CI before blaming libraries.
        System.out.println("=== JDK parity ===");
        System.out.println("Compare java -version inside the CI image with local mvn -v output before deep dives.");

        // Close with ADR discipline so non-standard factories are visible.
        System.out.println("=== Governance ===");
        System.out.println("Any per-request Proxy factory requires an ADR with removal deadline and owner.");

        // Tie back to creational policy: construction rules belong in one module.
        System.out.println("=== Creational link ===");
        System.out.println("Publish a starter module with approved factories so teams do not fork wiring.");

        // Final audit hook for incident tickets.
        System.out.println("=== Audit artifact ===");
        System.out.println("Attach jcmd GC.class_stats before/after and javap snippet to the postmortem.");
    }
}
`
    },
    {
      type: 'interview',
      title: 'Interview Drill — Design Patterns — Creational',
      conceptual: buildConceptual(),
      codeBased: buildCodeBased(),
      seniorScenario: buildSenior(),
      wrongAnswers: WRONG,
      jobSwitch: {
        resumeBullet: 'Replaced hand-rolled payment Singletons with enum gateways across four services, eliminating duplicate registry instances.',
        interviewPositioning:
          'When I join a team I scan for **getInstance** and **Proxy.newProxyInstance** in week one because **creational** shortcuts look fine in **demo** but explode **Metaspace** or **serialization** in **prod**. I add **Builder** **validation** tests and one **jcmd** **class** **stats** checklist to the **runbook**.',
        starAnchor:
          'Situation: our **pricing** **registry** returned different **tax** **rates** between **pods** after **failover** because two **Singleton** **instances** existed post **deserialization**. Task: prove **identity** and fix without a **big-bang** rewrite. Action: I added **ObjectOutputStream** round-trip **tests**, replaced **static** **holders** with **enum** **Singleton** for **Java** **code**, and moved **Spring** **wiring** to **explicit** **@Bean** **methods** with **profiles**. Result: **zero** duplicate **registry** **incidents** for **nine** months and **Metaspace** **canary** **OOM** pages dropped from **four** per month to **zero**.'
      }
    },
    {
      type: 'mcq',
      title: 'MCQ — Design Patterns — Creational',
      description: 'Thirty questions across basic, intermediate, and advanced levels.',
      questions: buildMcq()
    },
    { type: 'cheatsheet', title: 'Cheatsheet — Design Patterns — Creational', content: CHEATSHEET }
  ];
}

export { buildDay78Sections };
