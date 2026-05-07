/** Full section builder for phase9-day79.json — Design Patterns — Structural */

const T = (title, body, angle) =>
  `### ${title}\n\n${body}\n\n**Interview angle:** ${angle}`;

function buildWhy() {
  return (
    'At **02:17** the **checkout** **API** suddenly doubles **latency** after a harmless **feature** **flag** turns on **metrics** around **every** **database** **call**. You open **Grafana** and see **CPU** is fine. The **thread** **dumps** show **thousands** of **frames** in **LoggingDecorator** then **MetricsDecorator** then **RetryDecorator** then **CachingDecorator** then finally **JdbcPaymentRepository**. The bug looks like "**too** **much** **logging**." It is really **structural** **design**: you stacked **wrappers** until each **request** paid for six **virtual** **calls** and **allocation** **churn** you cannot see in a **line** **count**.\n\n' +
    'You are new. You thought **Decorator**, **Proxy**, and **Adapter** were three names for "wrap a **class**." In your first month you learn they answer different questions. **Decorator** adds **behavior** without changing the **core** **type** everyone depends on. **Proxy** controls **access** and **lazy** **loads** the real **object**. **Adapter** translates one **interface** into another so **legacy** **SOAP** can talk to your **REST** **port**. When you mix those jobs, **teams** ship **ClassCastException** at **integration** **boundaries** or **StackOverflowError** when a **Composite** **tree** accidentally points back at itself.\n\n' +
    'Interviewers who ask about **structural** **patterns** rarely want the **Gang** **of** **Four** **diagram** from memory. They want consequences. A weak answer says "**Decorator** wraps **objects**." A strong answer compares **Decorator** to **subclass** **explosion**, explains when **JDK** **dynamic** **Proxy** builds a **$Proxy** **class** at **runtime**, and names how **Facade** differs from **Adapter** at **team** **scale**. A strong answer says what breaks when fifty **services** each invent their own **RetryWrapper** with different **timeout** **semantics**.\n\n' +
    'Two failure modes show up everywhere. First, **ClassCastException** when an **Adapter** returns the wrong **concrete** **type** behind an **interface** and **Jackson** or **Spring** **Data** tries to **cast** it. The **stack** **trace** points at **framework** **code**, not your **adapter**, so **on-call** blames "**bad** **JSON**." Second, **StackOverflowError** or very deep **stacks** when a **Composite** **node** holds a **parent** **reference** and **equals**/**hashCode** or **toString** **recurses** without a **guard**. **Heap** looks fine while one **thread** dies with no **OutOfMemoryError**.\n\n' +
    'When you explain this to your team, use four steps. First, name the **stable** **interface** **callers** should see, like **PaymentPort**, not **AcmeSoapClient**. Second, name the **wrapper** **role**: **Decorator** for **cross** **cutting** **concerns**, **Proxy** for **guards** and **lazy** **init**, **Adapter** for **shape** **translation**. Third, say what breaks if you are wrong: **wrapper** **soup**, **infinite** **recursion**, or **double** **charging** because **retry** **decorators** stack twice. Fourth, say how you check: **javap** **-c** on **dynamic** **proxies**, **jcmd** **Thread.print** for **stack** **depth**, or **JUnit** **tests** that assert **decorator** **order**.\n\n' +
    'Here is a Staff-level fact that separates memorization from experience. **Java** **21** still generates **dynamic** **proxy** **classes** for **java.lang.reflect.Proxy** with **invokedynamic**-style **dispatch** to **InvocationHandler**. If you wrap the same **interface** ten times, you still pay **interface** **method** **resolution** and **Megamorphic** **call** **sites** can hurt **JIT** **inlining** under load. If you only know **UML**, you will miss **CPU** **profiles** that show **Decorator** **chains** as hot **frames**.\n\n' +
    'In your first six months you will see **structural** choices collide with **Spring** **AOP**. **Situation:** **@Transactional** **advice** and a **home** **grown** **RetryDecorator** both wrap the same **bean**, and **ordering** is wrong so **retries** run **outside** the **transaction**. **What you do:** you draw the **interceptor** **chain**, fix **order** **annotations**, and add one **integration** **test** that fails if **rollback** does not happen on the **third** **attempt**. **Situation:** **on-call** sees **Metaspace** grow after you add **JDK** **proxies** for **every** **tenant** **id**. **What you do:** you **cache** **Proxy** **instances** or switch to **CGLIB** **subclass** **proxies** intentionally and measure **jcmd** **GC.class_stats**.\n\n' +
    'You will also argue about **Facade** when **ten** **teams** import **twenty** **clients** from a **legacy** **monolith**. **Structural** **patterns** are how you keep **edges** **boring** on purpose. When you can tie each pattern to a **command** you actually run, like **javap** for **wrapper** **bytecode** or **jcmd** for **thread** **depth**, you sound like someone who ships **Java**, not someone who only highlights a **PDF**.'
  );
}

function buildTheoryContent() {
  const parts = [
    T(
      'Plain-language overview',
      '**Structural** **patterns** are recipes for how **objects** connect. They answer how you add **behavior** without **subclass** **explosion**, how you **shield** **callers** from messy **subsystems**, and how you translate one **API** shape into another. **Decorator**, **Proxy**, **Adapter**, **Facade**, **Bridge**, and **Composite** are names for repeated **composition** problems. The **JVM** still executes **invokeinterface** and **invokespecial** in **bytecode**; good structure keeps **latency** predictable and **tests** honest.',
      'Interviewers listen for composition trade-offs, not UML vocabulary alone.'
    ),
    T(
      'What is structural design and why teams keep saying it',
      'Teams reach for **Decorator** when **cross** **cutting** **concerns** multiply. They use **Proxy** when they need **lazy** **init**, **security** **checks**, or **remote** **stubs**. They use **Adapter** when **legacy** **XML** must look like a **clean** **Java** **interface**. They use **Facade** when **twenty** **classes** scare **API** consumers. Each choice changes **stack** **depth**, **serialization** **shape**, and how **Spring** **AOP** **proxies** line up.',
      'Weak answers list six names; strong ones say which pattern owns which risk.'
    ),
    T(
      'Your first Decorator in Java',
      'A **Decorator** implements the same **interface** as the **inner** **object** and **delegates** after adding work.\n\n```java\ninterface Quote { String text(); }\nrecord Core(String t) implements Quote { public String text() { return t; } }\nfinal class TagDecorator implements Quote {\n    private final Quote inner;\n    TagDecorator(Quote q) { inner = q; }\n    public String text() { return "<q>" + inner.text() + "</q>"; }\n}\n```\n\nYou stack **TagDecorator** on **Core** without a **subclass** per combination.',
      'Interviewers want to hear delegation and stable interface, not inheritance trees.'
    ),
    T(
      'When you sketch Decorator versus Proxy on a whiteboard',
      'Draw one **interface** at the top. Under it draw **Decorator** layers that all point **down** to a **single** **delegate**. Beside it draw **Proxy** with a **hollow** **arrow** that says "**maybe** **create** **real** **object** later" or "**check** **role** **first**." If your **Proxy** diagram looks like **Decorator** with extra **logging**, say out loud which **intent** you mean: **control** versus **add** **behavior**.',
      'Good candidates separate intent before naming **JDK** **Proxy**.'
    ),
    T(
      'How composition and delegation show up in bytecode',
      'Each **decorator** **call** compiles to **invokeinterface** on the **nested** **field**, then **invokeinterface** on the **inner** **delegate**. **javap** **-c** **TagDecorator.class** shows that chain. **java.lang.reflect.Proxy** generates a **synthetic** **class** that implements your **interfaces** and forwards to **InvocationHandler** **invoke** — extra **indirection** that **profilers** see as hot **frames**.',
      'Senior answers connect **wrapper** **depth** with **CPU** cost, not only with style.'
    ),
    T(
      'Comparison table — structural pattern',
      '| Pattern | When it helps | What breaks if you pick the wrong one |\n|---------|---------------|---------------------------------------|\n| **Decorator** | Add **metrics**/**logging** around a **core** | **Wrapper** **soup** and **p99** **latency** |\n| **Proxy** | **Lazy** **init**, **auth** **gate** | **Hidden** **side** **effects** on **every** **call** |\n| **Adapter** | **Legacy** **API** behind **new** **port** | **ClassCastException** at **boundaries** |\n| **Facade** | One **entry** to a **subsystem** | **God** **class** that knows everything |\n| **Composite** | **Tree** **UI** or **org** **charts** | **StackOverflowError** from bad **recursion** |\n\nPick the smallest pattern that still matches **intent**.',
      'Staff candidates compare **Decorator** stack cost versus **AOP** **aspects** honestly.'
    ),
    T(
      'Step sequence — add cross-cutting behavior without editing core domain',
      '1. Introduce a **narrow** **interface** the **domain** already depends on.\n2. Implement **Core** **class** with pure **rules** only.\n3. Add **Decorator** **classes** that take **Quote** (or your **port**) in a **constructor**.\n4. Wire **outer** **decorator** first in **tests**; assert **order** with **spy** **mocks**.\n5. Run **javap** **-c** on **one** **decorator** to show **invokeinterface** chain depth.\n6. Add **Micrometer** **timer** on the **outer** **layer** only so **metrics** stay consistent.\n\nStop when **domain** **tests** still run without **Spring**.',
      'Interviewers reward explicit wiring order over magic **lists** of **wrappers**.'
    ),
    T(
      'Common mistakes that look like framework bugs',
      '**ClassCastException** when an **Adapter** returns a **concrete** **type** your **controller** did not expect. **StackOverflowError** when **Composite** **toString** walks **children** and a **parent** **link** creates a **cycle**. **Spring** **AOP** **proxy** on **self** **invocation** inside the same **class** bypasses **advice** and looks like "**transaction** **not** **rolling** **back**." The fix is often **structure**, not more **try**/**catch**.',
      'Strong answers map symptoms back to **composition** mistakes.'
    ),
    T(
      'When Decorator stacks fight your latency budget',
      'Each **layer** adds **allocation** and **branch** **prediction** noise. Under load **JIT** may stop **inlining** **megamorphic** **interface** **calls**. **jcmd** **Thread.print** shows **deep** **stacks** with repeated **decorator** **class** names. **p99** grows while **mean** stays flat when a few **requests** hit the longest **chain**.',
      'Interviewers probe whether you measure **depth** before adding another **wrapper**.'
    ),
    T(
      'Choosing Decorator versus Spring AOP advice',
      '| Option | Good when | Watch out |\n|--------|-----------|----------|\n| **Decorator** in **plain** **Java** | Need **explicit** **order** in **unit** **tests** | More **boilerplate** **wiring** |\n| **@AspectJ** **around** **advice** | Cross-cutting across **many** **beans** | **Proxy** **type** limits and **self** **invocation** |\n| **Filter**/**HandlerInterceptor** | **HTTP** **edges** only | Wrong **layer** for **domain** **rules** |\n| **subclass** **Template** **Method** | Fixed **algorithm** **skeleton** | **Explosion** of **subclasses** |\n\nSay which **layer** owns **retry** and **idempotency**.',
      'Tech leads align **observability** **hooks** with **platform** standards.'
    ),
    T(
      'Code review checklist for wrappers and facades',
      'Reject **new** **Decorator** **layers** that duplicate **retry** already in **Resilience4j**. Flag **Facade** **methods** with **twenty** **parameters** that hide **temporal** **coupling**. Require **interface** **types** for **JDK** **dynamic** **proxies** so **tests** can swap **fakes**. On **Java** **17**, prefer **sealed** **hierarchies** for **closed** **tree** **shapes** in **Composite**.',
      'Review discipline stops **wrapper** **soup** from spreading across **services**.'
    ),
    T(
      'How to explain wrapper layers to a stakeholder',
      'Say each **layer** is a **policy** you can turn on or off: **logging**, **metrics**, **rate** **limit**. Offer the cost story: more **layers** mean more **milliseconds** per **request**. Tie it to **SLO** **burn** and **customer** **timeouts**, not to **pattern** **names**.',
      'Stakeholders care about **latency** and **support** **cost** more than **GoF** **chapters**.'
    ),
    T(
      'What the JVM does with dynamic Proxy and InvocationHandler',
      '**Proxy** **newProxyInstance** builds a **class** that implements your **interfaces** and routes every **method** to **InvocationHandler** **invoke**. **javap** **-p** **$Proxy0.class** shows **synthetic** **methods**. **Metaspace** holds **proxy** **metadata**; **heap** holds **handler** **instances**. Misuse shows up as **OutOfMemoryError** **Metaspace** when you create **unbounded** **proxy** **types**.',
      'Staff answers mention **$Proxy** **bytecode**, not only **interface** **diagrams**.'
    ),
    T(
      'jcmd and javap when stacks explode from Composite or Decorator',
      'Run **jcmd** **<pid>** **Thread.print** and count **frames** with the same **decorator** **prefix**. Use **javap** **-c** on **hot** **decorator** **classes** to prove **double** **dispatch** depth. Pair with **GC.heap_info** if **allocation** **rates** spike from **string** **concat** in **logging** **decorators**.',
      'On-call credibility comes from **thread** **depth** evidence, not guesses.'
    ),
    T(
      'Java 8 through 21 — proxies, records, and pattern matching',
      '| **Java** | Structural-relevant change |\n|----------|----------------------------|\n| **8** | **default** **methods** on **interfaces** simplify **Adapter** **glue** |\n| **11** | **var** keeps **local** **decorator** **wiring** readable |\n| **17** | **sealed** **interfaces** narrow **Composite** **node** **types** |\n| **21** | **Record** **patterns** simplify **tree** **walks** without **instanceof** **chains** |\n\nIf you still use **Visitor** everywhere, say why **sealed** **types** are not enough.',
      'Version answers should mention one **LTS** **line** you actually ship.'
    ),
    T(
      'Architecture guardrail that avoids wrapper soup',
      'Publish one **platform** **library** with **allowed** **decorator** **factories** for **metrics** and **tracing**. Add **ArchUnit** rules that **forbid** **domain** **packages** from depending on **HTTP** **client** **types** even through **adapters**. Document **Facade** **API** **surfaces** in an **ADR** when a **third** **team** imports your **module**.',
      'Architects connect **structural** **consistency** with **CI** **rules**, not only **slides**.'
    ),
    T(
      '60-second interview story',
      '**Structural** **patterns** shape **edges**: **Decorator** stacks **behavior**, **Proxy** controls **access**, **Adapter** translates **API**s, **Facade** hides **subsystems**, **Composite** models **trees**. Misuse shows up as **ClassCastException**, **StackOverflowError**, **deep** **stacks**, or **SLO** **misses** from **wrapper** **soup**. In reviews you name **order** and **intent**. When **prod** drifts, you run **javap** on **$Proxy** **classes** and **jcmd** **Thread.print** for **depth**.',
      'Practice this aloud so it sounds like experience, not a glossary.'
    ),
    T(
      'Satyverse drill — tie-down',
      'Open a **class** with a **Decorator** you wrote. Run **javap** **-c** **path/to/LoggingDecorator.class** and underline every **invokeinterface** to the **delegate**. Then run **jcmd** **<pid>** **Thread.print** on a **busy** **dev** **server** and count **frames** that mention **Decorator** in the **stack**.',
      'Interviewers like candidates who connect **bytecode** to **latency**, not only UML.'
    )
  ];
  return parts.join('\n\n');
}

function buildBasicCode() {
  const code = `package arch.day79;

/** Fresher reference card: structural patterns (println only). */
public class Day79Basic {

    public static void main(String[] args) {
        // Week one: tie each pattern name to one sentence you can defend in stand-up.
        System.out.println("=== Structural patterns — core concept table ===");
        System.out.println("Decorator | same interface; wrap inner object; add behavior by delegation");
        System.out.println("Proxy     | same interface; control access, lazy init, security, remote stub");
        System.out.println("Adapter   | translate one interface into another; legacy API behind port");
        System.out.println("Facade    | one simple class hides many subsystem classes");
        System.out.println("Composite | tree of parts; treat leaf and branch uniformly");
        System.out.println();

        // Tie words to Spring AOP so you do not confuse JDK proxy with plain wrappers.
        System.out.println("=== How to use them in Java projects ===");
        System.out.println("new LoggingDecorator(core)     | explicit decorator order in plain Java");
        System.out.println("@Transactional on interface    | Spring AOP JDK proxy around bean");
        System.out.println("InvocationHandler + Proxy      | dynamic proxy for interface list");
        System.out.println("Adapter implements PaymentPort | wraps AcmeSoapClient behind domain");
        System.out.println("CheckoutFacade                 | one entry for cart+pay+notify packages");
        System.out.println();

        // Freshers see ClassCastException; often it is adapter returning wrong concrete type.
        System.out.println("=== Beginner mistakes and their symptoms ===");
        System.out.println("ClassCastException          | Adapter returned concrete type caller did not expect");
        System.out.println("StackOverflowError          | Composite toString/equals walked a cyclic parent link");
        System.out.println("Self-invocation skips advice| @Transactional inside same class, no proxy edge");
        System.out.println("Deep stacks in thread dump  | too many Decorator layers per request");
        System.out.println();

        // One rule: name intent before you stack wrappers.
        System.out.println("=== Remember this ===");
        System.out.println("Each wrapper adds frames and indirection; measure depth before adding one more.");
        System.out.println();
        // Extra anchor for interviews: Proxy controls access; Decorator adds responsibilities.
        System.out.println("=== Interview anchor ===");
        System.out.println("Say Proxy for gatekeeping; Decorator for stacking behavior; Adapter for shape translation.");
    }
}`;
  const output = `=== Structural patterns — core concept table ===
Decorator | same interface; wrap inner object; add behavior by delegation
Proxy     | same interface; control access, lazy init, security, remote stub
Adapter   | translate one interface into another; legacy API behind port
Facade    | one simple class hides many subsystem classes
Composite | tree of parts; treat leaf and branch uniformly

=== How to use them in Java projects ===
new LoggingDecorator(core)     | explicit decorator order in plain Java
@Transactional on interface    | Spring AOP JDK proxy around bean
InvocationHandler + Proxy      | dynamic proxy for interface list
Adapter implements PaymentPort | wraps AcmeSoapClient behind domain
CheckoutFacade                 | one entry for cart+pay+notify packages

=== Beginner mistakes and their symptoms ===
ClassCastException          | Adapter returned concrete type caller did not expect
StackOverflowError          | Composite toString/equals walked a cyclic parent link
Self-invocation skips advice| @Transactional inside same class, no proxy edge
Deep stacks in thread dump  | too many Decorator layers per request

=== Remember this ===
Each wrapper adds frames and indirection; measure depth before adding one more.

=== Interview anchor ===
Say Proxy for gatekeeping; Decorator for stacking behavior; Adapter for shape translation.
`;
  return { code, output };
}

function buildMidCode() {
  const code = `package arch.day79;

/**
 * Four structural-pattern scenarios a senior engineer narrates.
 * // Wrapper soup and adapter leaks show up as latency and ClassCastException, not pattern labels.
 */
public class Day79Intermediate {

    static void scenario1() {
        // First feature: you subclass PaymentService for logging instead of decorating the port interface.
        System.out.println("--- Scenario 1: subclass explosion for metrics + logging + retry ---");
        System.out.println("symptom:  merge conflicts every sprint; impossible to compose behaviors safely");
        System.out.println("cause:    used inheritance for cross-cutting concerns instead of Decorator");
        System.out.println("why:      each subclass duplicates core logic paths and breaks LSP tests");
        System.out.println("fix:      introduce PaymentPort and stack LoggingDecorator(MetricsDecorator(core))");
        System.out.println("verify:   javap -c LoggingDecorator.class and count invokeinterface depth");
        System.out.println("next:     JUnit test that asserts decorator order with test doubles");
        System.out.println();
    }

    static void scenario2() {
        // Production: REST controller casts adapter result to wrong type after Jackson step.
        System.out.println("--- Scenario 2: Adapter returns legacy DTO that controller casts to record ---");
        System.out.println("symptom:  ClassCastException in framework code during response serialization");
        System.out.println("cause:    adapter implemented port but still leaked concrete SOAP types");
        System.out.println("why:      structural boundary broke; JVM cannot cast unrelated classes");
        System.out.println("fix:      map to domain types inside adapter; return only port types outward");
        System.out.println("verify:   grep controller for casts; add contract test on adapter output");
        System.out.println("next:     ArchUnit rule: web layer never imports legacy vendor packages");
        System.out.println();
    }

    static void scenario3() {
        // Performance: p99 spikes after adding three decorators per request.
        System.out.println("--- Scenario 3: Decorator stack doubles CPU in flame graph ---");
        System.out.println("symptom:  latency grows linearly with feature flags; CPU hot in decorator frames");
        System.out.println("cause:    each layer allocates strings and megamorphic interface calls");
        System.out.println("why:      JIT struggles to inline deep invokeinterface chains under load");
        System.out.println("fix:      collapse cross-cutting into one aspect or slim facade with batch hooks");
        System.out.println("verify:   jcmd <pid> Thread.print and measure stack depth during peak");
        System.out.println("next:     async profiler compare before/after decorator count");
        System.out.println();
    }

    static void scenario4() {
        // Architecture: CheckoutFacade becomes 4k-line god object.
        System.out.println("--- Scenario 4: Facade owns every subsystem import ---");
        System.out.println("symptom:  one change retriggers builds across all teams; tests slow");
        System.out.println("cause:    facade imported concrete classes instead of narrow ports");
        System.out.println("why:      structural coupling concentrated; no stable module seams");
        System.out.println("fix:      split facades per bounded context; depend on interfaces only");
        System.out.println("verify:   jdeps -summary on facade jar shows fan-out to every package");
        System.out.println("next:     publish ADR for allowed facade responsibilities");
        System.out.println();
    }

    public static void main(String[] args) {
        // Header anchors logs when you paste output into a structural design review.
        System.out.println("=== Day79Intermediate: four structural pattern scenarios ===");
        System.out.println("Tip: pair jcmd Thread.print with flame graphs when stacks grow.");
        System.out.println();
        scenario1();
        scenario2();
        scenario3();
        scenario4();
        System.out.println("=== End of scenario pack ===");
        System.out.println("Attach javap -c snippets when arguing decorator depth.");
        System.out.println("hint: log git SHA next to jcmd output so you compare builds fairly.");
    }
}`;
  const output = `=== Day79Intermediate: four structural pattern scenarios ===
Tip: pair jcmd Thread.print with flame graphs when stacks grow.

--- Scenario 1: subclass explosion for metrics + logging + retry ---
symptom:  merge conflicts every sprint; impossible to compose behaviors safely
cause:    used inheritance for cross-cutting concerns instead of Decorator
why:      each subclass duplicates core logic paths and breaks LSP tests
fix:      introduce PaymentPort and stack LoggingDecorator(MetricsDecorator(core))
verify:   javap -c LoggingDecorator.class and count invokeinterface depth
next:     JUnit test that asserts decorator order with test doubles

--- Scenario 2: Adapter returns legacy DTO that controller casts to record ---
symptom:  ClassCastException in framework code during response serialization
cause:    adapter implemented port but still leaked concrete SOAP types
why:      structural boundary broke; JVM cannot cast unrelated classes
fix:      map to domain types inside adapter; return only port types outward
verify:   grep controller for casts; add contract test on adapter output
next:     ArchUnit rule: web layer never imports legacy vendor packages

--- Scenario 3: Decorator stack doubles CPU in flame graph ---
symptom:  latency grows linearly with feature flags; CPU hot in decorator frames
cause:    each layer allocates strings and megamorphic interface calls
why:      JIT struggles to inline deep invokeinterface chains under load
fix:      collapse cross-cutting into one aspect or slim facade with batch hooks
verify:   jcmd <pid> Thread.print and measure stack depth during peak
next:     async profiler compare before/after decorator count

--- Scenario 4: Facade owns every subsystem import ---
symptom:  one change retriggers builds across all teams; tests slow
cause:    facade imported concrete classes instead of narrow ports
why:      structural coupling concentrated; no stable module seams
fix:      split facades per bounded context; depend on interfaces only
verify:   jdeps -summary on facade jar shows fan-out to every package
next:     publish ADR for allowed facade responsibilities

=== End of scenario pack ===
Attach javap -c snippets when arguing decorator depth.
hint: log git SHA next to jcmd output so you compare builds fairly.
`;
  return { code, output };
}

function buildAdvCode() {
  const code = `package arch.day79;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Tech lead triage: structural smells and JVM evidence without live I/O.
 */
public class Day79Advanced {

    record StructuralRisk(String id, boolean deepDecoratorStack, boolean adapterCastLeak, boolean compositeCycle) {}

    public static void main(String[] args) {
        // Block 1: model signals you would get from profiling plus ArchUnit and jcmd.
        System.out.println("=== Block 1: build the structural risk model ===");
        List<StructuralRisk> risks = List.of(
            new StructuralRisk("checkout-api", true, false, false),
            new StructuralRisk("checkout-api", false, true, false),
            new StructuralRisk("checkout-api", false, false, true)
        );
        for (StructuralRisk r : risks) {
            System.out.println(r.id() + " deepDec=" + r.deepDecoratorStack()
                + " adapterCast=" + r.adapterCastLeak() + " compositeCycle=" + r.compositeCycle());
        }
        System.out.println();

        // Block 2: ordered decision map — same order you would present in a design review.
        System.out.println("=== Block 2: apply the structural decision order ===");
        Map<String, String> action = new LinkedHashMap<>();
        action.put("deep_stack", "collapse decorators; move cross-cutting to single aspect or filter");
        action.put("adapter_cast", "map to port types inside adapter; ban casts in controllers");
        action.put("composite_loop", "guard toString/equals; use sealed tree or explicit graph walk");
        for (Map.Entry<String, String> e : action.entrySet()) {
            System.out.println("signal " + e.getKey() + " -> " + e.getValue());
        }
        System.out.println();

        // Block 3: printable triage table for on-call or architecture forum.
        System.out.println("=== Block 3: triage table — symptom to first command ===");
        Map<String, String> table = new LinkedHashMap<>();
        table.put("ClassCastException at JSON layer", "fix Adapter return types; grep controller casts");
        table.put("StackOverflowError in toString", "break Composite cycle; add visited set in debug printer");
        table.put("Transaction not rolling back", "fix self-invocation; extract collaborator or use AspectJ weaving");
        for (Map.Entry<String, String> e : table.entrySet()) {
            System.out.println(e.getKey() + " | " + e.getValue());
        }
        System.out.println();
        System.out.println("=== Recommended order ===");
        System.out.println("1) jcmd <pid> Thread.print during incident and measure decorator frames");
        System.out.println("2) javap -c on hottest Decorator class for invokeinterface depth");
        System.out.println("3) jdeps -summary on facade module; split if fan-out explodes");
        System.out.println("note: Java 21 record patterns help tree walks without instanceof ladders.");
        System.out.println("note: Java 17 sealed interfaces narrow Composite node types for exhaustive switches.");
        System.out.println("note: keep triage under 80 columns for Slack paste.");
        System.out.println("note: attach flame graph diff when removing decorator layers.");
        System.out.println("note: rerun load test after structural refactor; p99 often moves first.");
        System.out.println("note: pair ArchUnit with jdeps to catch adapter leaks into web layer.");
        System.out.println("note: document Facade boundaries in ADR when more than three teams depend on it.");
    }
}`;
  const output = `=== Block 1: build the structural risk model ===
checkout-api deepDec=true adapterCast=false compositeCycle=false
checkout-api deepDec=false adapterCast=true compositeCycle=false
checkout-api deepDec=false adapterCast=false compositeCycle=true

=== Block 2: apply the structural decision order ===
signal deep_stack -> collapse decorators; move cross-cutting to single aspect or filter
signal adapter_cast -> map to port types inside adapter; ban casts in controllers
signal composite_loop -> guard toString/equals; use sealed tree or explicit graph walk

=== Block 3: triage table — symptom to first command ===
ClassCastException at JSON layer | fix Adapter return types; grep controller casts
StackOverflowError in toString | break Composite cycle; add visited set in debug printer
Transaction not rolling back | fix self-invocation; extract collaborator or use AspectJ weaving

=== Recommended order ===
1) jcmd <pid> Thread.print during incident and measure decorator frames
2) javap -c on hottest Decorator class for invokeinterface depth
3) jdeps -summary on facade module; split if fan-out explodes
note: Java 21 record patterns help tree walks without instanceof ladders.
note: Java 17 sealed interfaces narrow Composite node types for exhaustive switches.
note: keep triage under 80 columns for Slack paste.
note: attach flame graph diff when removing decorator layers.
note: rerun load test after structural refactor; p99 often moves first.
note: pair ArchUnit with jdeps to catch adapter leaks into web layer.
note: document Facade boundaries in ADR when more than three teams depend on it.
`;
  return { code, output };
}

const PITFALLS = [
  'Confusing **Proxy** with **Decorator** on day one and naming both classes **PaymentProxy** — **code** **reviews** argue **intent** while **bugs** slip; fix by renaming **Decorator** **layers** with **behavior** words and **SecurityProxy** for **access** **control**; verify with a **package** **README** **one** **paragraph** diagram each **sprint**.',
  'Trying **Proxy** **newProxyInstance** for a **concrete** **class** that **implements** **no** **interfaces** — you get **IllegalArgumentException** at **runtime** or **compile** errors when you follow a **tutorial** blindly; fix by introducing a **narrow** **interface** for the **real** **object** or switch to **CGLIB**/**ByteBuddy** **subclass** **proxies** with **Spring**; verify with a **tiny** **main** that only **lists** **interfaces** you actually have.',
  'Calling **this** methods from the same **class** and expecting **Spring** **@Transactional** **advice** to run — **rollback** never happens and **logs** look **fine**; fix by extracting a **collaborator** **bean** or using **@Transactional** on **interface** **methods** invoked through **proxy**; verify with a **JUnit** **test** that asserts **transaction** **rollback** on **forced** **failure**.',
  '**Adapter** **returns** **legacy** **SOAP** **DTO** types to **controllers** that **cast** to **records** — **ClassCastException** surfaces in **Jackson** **serialization** layer; **map** inside **adapter** to **domain** **types** only; verify **contract** **test** that **controller** never **imports** **vendor** **packages**.',
  'Letting **CheckoutFacade** import **every** **subsystem** **concrete** **class** — **teams** **cannot** **ship** **independently** and **CI** **time** **explodes**; **split** **facades** per **bounded** **context** and expose **ports**; verify **jdeps** **-summary** **fan** **out** drops below **agreed** **threshold**.',
  'Stacking **Resilience4j** **retry** **decorator** **outside** **transactional** **boundary** so **retries** **commit** **partial** **work** — **data** **corruption** with **no** **exception** in **happy** **path** **logs**; **reorder** **wrappers** so **retry** sits **inside** **transaction** **policy** you **document**; verify **integration** **test** with **failure** **injection** **counting** **commits**.',
  '**Composite** **tree** **stores** **parent** **pointers** without **guarding** **equals**/**hashCode**/**toString** — **StackOverflowError** during **debug** **logging** or **cache** **key** **compute**; **add** **cycle** **detection** or **immutable** **tree** **walk** **visitor**; verify **jcmd** **Thread.print** shows **shallow** **stack** after **fix**.',
  'Creating **JDK** **dynamic** **Proxy** **per** **tenant** **without** **caching** — **Metaspace** **OOM** while **heap** looks **flat**; **cache** **Proxy** **instances** or use **CGLIB** **subclass** **proxies** **intentionally**; verify **jcmd** **GC.class_stats** **before**/**after** **traffic** **soak**.'
];

const WRONG = [
  '**Decorator** and **Proxy** are the same **pattern** because both **wrap** an **object**',
  '**Adapter** is only for **USB** **cables**; **Java** **code** never needs **adapters** if you use **Spring**',
  '**Facade** should import every **subsystem** **class** so **callers** only **compile** **once**',
  '**@Transactional** works on **private** **methods** as long as **Spring** **Boot** starts',
  '**Composite** **trees** should always store **parent** **pointers** with **no** **guard** **methods**',
  '**JDK** **dynamic** **proxy** can **proxy** **classes** that do not **implement** **interfaces**',
  'You should add a **new** **Decorator** for **every** **log** **line** so **filters** stay **pure**',
  '**jcmd** **Thread.print** is useless for **latency** because **threads** do not have **stack** **frames**'
];

function fuProd() {
  return {
    question: 'How do **structural** **patterns** show up in **production** or **build** incidents?',
    answer:
      'Last quarter a **checkout** **API** missed **rollback** on **payment** **failures** because **developers** called **this.processPayment** inside the same **@Service** **class**. **Spring** **AOP** **proxies** never intercepted the **call**, so **@Transactional** **advice** did not run. **Logs** showed **success** **commits** with **orphan** **cart** rows. We extracted the **method** to another **bean**, added an **integration** **test** with **failure** **injection**, and **p99** **error** **budget** recovered. **Structural** bugs hide where **objects** **call** each other, not only in **SQL**.'
  };
}

function fuTrap() {
  return {
    question: 'What is a common trap people believe about **Decorator**?',
    answer:
      'People believe **Decorator** is "free" because it is just a **wrapper**. In reality each **layer** adds **frames**, **allocations**, and **megamorphic** **interface** **calls** that **JIT** may stop **inlining** under load. **Teams** stack five **decorators** and then blame **GC** when **CPU** spikes. The fix is to **measure** **stack** **depth** with **jcmd** **Thread.print**, **collapse** **cross** **cutting** into **one** **aspect** where it fits, and document **order** in **tests** so **metrics** stay honest.'
  };
}

function ca(core, err, cmd, ver) {
  const mid =
    ' Under the hood, **invokeinterface** walks **vtable** **slots** for **decorator** **delegates**, while **java.lang.reflect.Proxy** **synthetic** **classes** forward to **InvocationHandler** **invoke**. **Composite** **walks** compile to **recursive** **calls** that can blow the **stack** if **graphs** cycle.';
  const tail =
    ' **Java** **17** **sealed** **types** help **Composite** **trees** stay **exhaustive**, and **Java** **21** **record** **patterns** simplify **tree** **visits** without long **instanceof** **chains**. **Java** **11** **var** keeps **local** **decorator** **wiring** readable. When teams skip guardrails, **production** shows **ClassCastException** at **adapters**, **StackOverflowError** in **debug** **prints**, or **silent** **bad** **commits** from **proxy** **self** **invocation**.';
  return `${core}${mid} ${err} You verify with ${cmd}. ${ver}${tail}`;
}

const CONCEPTUAL_Q = [
  [
    'In one sentence, what is a **structural** **pattern**?',
    '**Structural** **patterns** are recipes for how **objects** **compose**. They answer how you **wrap** **behavior**, how you **translate** **API** **shapes**, and how you **hide** **subsystems** behind a **simple** **face**. The **JVM** still runs **invokeinterface** and **invokespecial** **bytecode**; good structure keeps **latency** and **tests** predictable.',
    'When **teams** treat **Decorator** and **Proxy** as the same word, **integration** **bugs** hide behind **innocent** **refactors**.',
    '**javap** **-c** **LoggingDecorator.class** shows **invokeinterface** **chains** to the **delegate**.',
    '**Java** **17** **sealed** **interfaces** help **Composite** **node** **types** stay **exhaustive** in **switch** **expressions**.'
  ],
  [
    'What does **Decorator** mean when **interviewers** ask?',
    '**Decorator** implements the same **interface** as an **inner** **object** and **delegates** after adding **work** like **logging** or **metrics**. It avoids **subclass** **explosion** when **cross** **cutting** **concerns** multiply. At **bytecode** level each **call** walks **nested** **fields** with **invokeinterface**.',
    '**Production** **pain** shows up as **deep** **stacks** and **p99** **latency** when **teams** stack too many **layers**.',
    '**jcmd** **<pid>** **Thread.print** during **load** shows **frame** **count** and **decorator** **class** **names** repeating.',
    '**Java** **21** **virtual** **threads** reduce **blocking** **cost** but do not remove **megamorphic** **call** **sites** from **deep** **wrappers**.'
  ],
  [
    'How does **Proxy** differ from **Decorator** in real **systems**?',
    '**Proxy** controls **access**: **lazy** **init**, **security** **checks**, **remote** **stubs**. **Decorator** adds **responsibilities** to an **existing** **object** you already planned to **call**. Both **wrap**, but **intent** and **review** **checklists** differ. **JDK** **dynamic** **Proxy** builds **synthetic** **classes** that forward to **InvocationHandler** **invoke**.',
    'Mislabeling leads to **wrong** **retry** **policies** and **surprise** **side** **effects** on **every** **call**.',
    '**javap** **-p** **$Proxy0.class** lists **synthetic** **methods** generated at **runtime**.',
    '**Java** **11** **http** **client** is often hidden behind **Proxy** **style** **adapters** in **modern** **services**.'
  ],
  [
    'What is an **Adapter** and where does it break?',
    'An **Adapter** implements the **port** your **domain** wants while **calling** **legacy** **API**s internally. It **translates** **types**, **error** **codes**, and **pagination** **rules**. At **runtime** **ClassCastException** appears if you return a **legacy** **DTO** where a **record** was promised.',
    '**Jackson** **serialization** **errors** often mask **adapter** **contract** **drift**.',
    '**grep** **import** **legacy** in **web** **packages** plus **ArchUnit** **tests** catch **leaks** early.',
    '**Java** **17** **records** make **boundary** **DTO**s cheap, but **adapters** must still **map** **fields** **explicitly**.'
  ],
  [
    'What is a **Facade** and when does it become harmful?',
    'A **Facade** gives **one** **simple** **class** that coordinates **many** **subsystem** **objects** so **callers** avoid **import** **spaghetti**. It breaks when it **imports** every **concrete** **class** and becomes a **merge** **conflict** **magnet**.',
    '**CI** **time** **grows** and **teams** **block** each other because **one** **facade** **file** **touches** **all** **modules**.',
    '**jdeps** **-summary** on the **facade** **jar** shows **fan** **out** to **subsystem** **packages**.',
    '**Java** **21** **module** **stories** pair with **narrow** **facades** per **bounded** **context**.'
  ],
  [
    'What is **Composite** and what **production** **symptom** scares **on-call**?',
    '**Composite** lets you treat **leaf** and **branch** **nodes** **uniformly** through a **common** **interface**. **Tree** **walks** compile to **recursive** **calls**. If a **parent** **pointer** creates a **cycle**, **toString** or **equals** can **recurse** until **StackOverflowError**.',
    '**Logging** **frameworks** printing **large** **trees** amplify the **problem** under **debug** **flags**.',
    '**jcmd** **Thread.print** on a **stuck** **thread** shows **thousands** of **identical** **frames**.',
    '**Java** **17** **sealed** **hierarchies** help you **model** **allowed** **node** **kinds** for **exhaustive** **switch** **handling**.'
  ],
  [
    'Why does **Spring** **@Transactional** **fail** on **self** **invocation**?',
    '**Spring** **AOP** wraps **beans** with **proxies** so **advice** runs on **external** **calls** through the **proxy**. A **method** **calling** **this.other** inside the **same** **class** bypasses the **proxy** **edge**, so **transaction** **boundaries** do not start or **rollback** as you expect.',
    '**Data** **corruption** looks like **partial** **commits** with **clean** **logs**.',
    '**grep** **this.** in **service** **classes** plus **integration** **tests** with **failure** **injection** expose it.',
    '**Java** **21** **virtual** **threads** do not fix **proxy** **semantics**; **design** **still** **matters**.'
  ],
  [
    'What does **JDK** **dynamic** **Proxy** generate at **runtime**?',
    '**Proxy** **newProxyInstance** synthesizes a **class** that implements your **interface** **list** and forwards **methods** to **InvocationHandler** **invoke**. **javap** shows **$ProxyN** with **synthetic** **methods**. **Metaspace** stores **Class** **metadata** for each **proxy** **type**.',
    '**OutOfMemoryError** **Metaspace** can appear when **tenants** each get a **fresh** **proxy** **class**.',
    '**jcmd** **GC.class_stats** tracks **loaded** **classes** during **traffic** **ramps**.',
    '**Java** **11** tightened **encapsulation** **stories** around **internal** **API**s; **libraries** adapted **proxy** **usage** accordingly.'
  ],
  [
    'When should you prefer **Decorator** over **inheritance**?',
    '**Inheritance** fixes **behavior** at **compile** **time** with **subclasses**; **Decorator** composes **behavior** at **runtime** by **nesting** **wrappers**. That keeps **core** **classes** small and **avoids** **exploding** **class** **counts** when **features** **multiply**.',
    '**Merge** **conflicts** and **fragile** **super** **calls** show up when **teams** subclass for **logging**.',
    '**JUnit** **tests** with **spy** **decorators** prove **order** **independent** of **Spring**.',
    '**Java** **8** **default** **methods** on **interfaces** reduce **adapter** **glue** but do not replace **composition** **discipline**.'
  ],
  [
    'How does **Bridge** differ from **Adapter** in **interviews**?',
    '**Bridge** splits an **abstraction** from its **implementation** so both can **vary** **independently** — think **UI** **API** versus **rendering** **backend**. **Adapter** fixes a **mismatch** between two **existing** **interfaces** you did not **own** at **first**.',
    'Confusing them leads to **wrong** **refactor** **plans** and **months** of **migration** **pain**.',
    '**Whiteboard** **review** with **two** **orthogonal** **axes** clarifies **Bridge** intent.',
    '**Java** **17** **sealed** **types** can express **closed** **abstraction** **families** cleanly.'
  ],
  [
    'What **performance** **trap** hides in **Decorator** **chains**?',
    'Each **layer** adds **invokeinterface** **dispatch** and **allocation** for **strings** or **timers**. Under load the **JIT** may stop **inlining** **hot** **paths** when **call** **sites** become **megamorphic**.',
    '**CPU** **flame** **graphs** show **decorator** **frames** even when **heap** is **calm**.',
    '**async** **profiler** plus **jcmd** **Thread.print** compare **before**/**after** **layer** **count**.',
    '**Java** **21** **Project** **Loom** **virtual** **threads** reduce **blocking** **waits** but not **CPU** **work** inside **wrappers**.'
  ],
  [
    'How do you test **structural** **wiring** without **Spring** **context** **tests**?',
    '**Pure** **Java** **tests** **instantiate** **Core** **service** then **wrap** with **LoggingDecorator** and **assert** **order** with **mocks**. Keep **Spring** **tests** at the **edge** for **proxy** **behavior** only.',
    'Slow **feedback** hides **structural** **mistakes** until **integration** **stage**.',
    '**mvn** **-Dtest=DecoratorOrderTest** **test** should stay **under** **seconds**.',
    '**Java** **17** **text** **blocks** help **readable** **expected** **log** **lines** in **assertions**.'
  ],
  [
    'How does **ArchUnit** help **structural** **boundaries**?',
    '**ArchUnit** can **forbid** **web** **packages** from **importing** **legacy** **vendor** **packages** so **adapters** stay **the** **only** **bridge**.',
    'Without it, **ClassCastException** **clusters** appear after **innocent** **refactors**.',
    '**ArchUnit** **slices** **dependency** **rules** pair well with **jdeps** **output** in **CI**.',
    '**Java** **11** **module** **path** adds **strong** **encapsulation** when **teams** adopt **JPMS**.'
  ],
  [
    'What **Staff** **fact** ties **structural** **patterns** to **JIT** **behavior**?',
    '**HotSpot** **inlines** **small** **methods** when **call** **sites** stay **monomorphic** or **bimorphic**. **Deep** **Decorator** **stacks** increase **polymorphic** **calls** and can **reduce** **inlining**, which shows up as **CPU** **regressions** without **GC** **pressure**.',
    '**Flame** **graphs** shift **hot** **frames** into **interface** **dispatch** stubs.',
    '**Java** **Flight** **Recorder** **events** show **method** **profiling** **samples** around **hot** **wrappers**.',
    '**Java** **21** **continues** **improving** **compiler** **heuristics**, but **design** still dominates.'
  ],
  [
    'How do you explain **Facade** **trade-offs** to a **non** **Java** **stakeholder**?',
    'Say a **Facade** is a **single** **door** into a **messy** **subsystem** so **new** **features** ship faster at **first**. The **cost** is **coupling** if the **facade** **knows** **every** **detail**.',
    'Stakeholders care about **time** **to** **market** versus **team** **independence**.',
    '**Quarterly** **metrics** on **cross** **team** **merge** **rates** show whether the **facade** **helped**.',
    '**Java** **17** **migration** **ADR**s often split **monolith** **facades** along **domain** **lines**.'
  ],
  [
    'How do you choose **AOP** **aspects** versus **explicit** **Decorator** **stacks**?',
    '**Aspects** scale **cross** **cutting** **concerns** across **many** **beans** with **configuration**, but **ordering** and **proxy** **type** **limits** bite. **Explicit** **decorators** make **order** obvious in **code** and **unit** **tests**.',
    '**Incidents** happen when **aspect** **order** and **retry** **semantics** disagree with **transactions**.',
    '**Spring** **Boot** **actuator** **/beans** and **logging** **level** **TRACE** for **AOP** help **debug** **order**.',
    '**Java** **17** **pattern** **matching** on **sealed** **interfaces** can simplify **manual** **decorator** **dispatch**.'
  ],
  [
    'What breaks when **Composite** **equals** is **naive**?',
    '**Recursive** **equals** without **cycle** **detection** can **loop** forever or **compare** **exponential** **paths**. **hashCode** can **collide** badly when **parents** **include** **children** that **include** **parents**.',
    '**CPU** **spikes** during **cache** **puts** that **use** **composite** **keys**.',
    '**jcmd** **Thread.print** shows **deep** **equals** **frames**; **fix** with **IDs** or **visitor** **equality**.',
    '**Java** **21** **record** **patterns** help **structural** **equality** **checks** without **verbose** **instanceof**.'
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
  ' Tie the story back to **structural** **discipline**: **measure** **decorator** **depth**, keep **adapters** as the **only** **legacy** **bridge**, and pair **javap** with **jcmd** **Thread.print** when **stacks** grow. **Java** **17** **sealed** **types** help **Composite** **trees** stay **honest** without **reflection** **sprawl**.';

const CB_ANS = [
  'This **interface** **Quote** has **text**(). **TagDecorator** implements **Quote** and **delegates** to **inner** **Quote** after wrapping **strings**. At **runtime** **javac** emits **invokeinterface** for **inner.text** and **concat** **bytecode** for **string** **building**. **Production** risk is **stack** **depth** and **allocation** when you **nest** many **decorators**. You verify **invokeinterface** **count** with **javap** **-c** **TagDecorator.class** and **unit** **tests** that **spy** **call** **order**. **Java** **21** still uses the same **interface** **dispatch** model; **virtual** **threads** do not remove **megamorphic** **cost** on **hot** **paths**.',
  '**new** **RuntimeException**("x") allocates a **Throwable** with a **stack** **trace** capture when constructed, not when printed. **getMessage** only returns the **String** you passed; it does not **throw**. This snippet is small but it reminds you that **exception** **objects** are **ordinary** **heap** **allocations** unless you override **fillInStackTrace** for **performance** **sensitive** **paths**. In **structural** **reviews**, deep **decorator** **chains** pair **exception** **allocation** with **deep** **stacks** under **load**. You verify with **jcmd** **<pid>** **GC.heap_info** during **fault** **injection** tests. **Java** **11** improved **stack** **trace** **cost** characteristics for some **patterns**, but **exceptions** for **control** **flow** remain a **smell**.',
  '**Optional** **empty**() returns a **singleton** **empty** **Optional** instance shared across the **JVM**. **orElse** returns **"fallback"** without calling **orElseGet** because there is no **value** to compute lazily. No **autoboxing** or **NullPointerException** appears here. This matters when **adapters** misuse **Optional** as a **field** on **DTO**s that **Jackson** **reflects**. Prefer **Optional** as a **return** **type** for **methods** that may lack a **result**. You verify with **javap** **-c** on a tiny **class** to see **invokestatic** **Optional.empty**. **Java** **8** brought **Optional**; **Java** **11** added **Optional** **stream** helpers that reduce **adapter** **boilerplate**.',
  '**List** **of** returns an **immutable** **list** implementation. **add** throws **UnsupportedOperationException** at **runtime** because the **list** **implementation** rejects **mutation**. This is **structural** **adjacent** when **Facade** **methods** return **immutable** **views** that **callers** thought were **mutable**. You verify with **JUnit** **assertThrows**(**UnsupportedOperationException**.**class**, () -> xs.add(2)). **Java** **21** **sequenced** **collections** add ordering **guarantees** for some **immutable** **factories**.',
  '**record** **Point**(**int** **x**,**int** **y**) generates **value-based** **equals** and **hashCode**, but **System.identityHashCode** still uses **object** **header** **identity**, not **value** **equality**. So two **new** **Point**(1,1) **objects** can **equals** true while **identityHashCode** differs. **Structural** **lesson**: **identity** **versus** **value** matters when **Composite** **nodes** use **default** **Object** **identity** in **maps**. You verify by printing **equals** and **identityHashCode** side by side in a **main**. **Java** **16**+ **records** are stable; **Java** **21** **record** **patterns** help **tree** **dispatch** without **reflection**.',
  'This **class** will not **compile** in a plain **javac** **project** without **Spring** **libraries** because **@Service** is an **unknown** **annotation** **type** unless you import **org.springframework**. The teaching point is **framework** **annotations** are **just** **types** on the **classpath**; **structural** **proxies** still need **interfaces** or **subclass** **rules** at **runtime**. If you see **BeanCreationException**, the **root** **cause** is often **constructor** **graphs**, not missing **annotations** textually. You verify **classpath** with **mvn** **dependency:tree** and **javap** **-p** on **compiled** **classes** inside **Spring** **Boot** **fat** **jar**.',
  '**Map** **get** on a **missing** **key** returns **null** for **Integer** **values**. Assigning **null** to **int** **x** triggers **unboxing** with **NullPointerException** because **Java** tries to call **intValue** on **null**. This is a **Senior** **trap** in **adapter** **caches** that **store** **Integer** **counts**. Use **getOrDefault** or **Optional** **ofNullable**(**m.get**("k")). **Production** **logs** show **NPE** at **unbox** lines that look like **business** **logic** **bugs**. You verify with a **tiny** **main** and **breakpoint** on **autoboxing** in **IDE**. **Java** **8** **Map** **methods** like **getOrDefault** reduce this **class** of **bug**.',
  '**Stream** **of**(1,2,3) creates an **ordered** **stream**; **map** doubles each **element**; **forEach** prints **2**, **4**, **6** on separate lines. **Structural** angle: **pipelines** are **objects** too; **deep** **combinators** can mirror **decorator** **chains** in **complexity**. **forEach** is **terminal**, so **map** runs now. Avoid **building** **streams** in **tight** **loops** without **reuse** if **allocation** matters; sometimes a **plain** **for** is clearer in **domain** **code**. You verify with **javap** **-c** to see **invokeinterface** **stream** **calls**. **Java** **21** **sequenced** **streams** align with **ordered** **collection** **views** for **API** **DTO** **lists**.'
];

const CB_Q = [
  'What does this **TagDecorator** illustrate?\n```java\ninterface Quote { String text(); }\nrecord Core(String t) implements Quote { public String text() { return t; } }\nclass TagDecorator implements Quote {\n  private final Quote inner;\n  TagDecorator(Quote q) { inner = q; }\n  public String text() { return "<q>" + inner.text() + "</q>"; }\n}\n```',
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
    '**Immediate response:** Run `jcmd <pid> Thread.print` on **stuck** **requests** and capture **async** **profiler** **samples** for **hot** **frames** named **LoggingDecorator**, **MetricsDecorator**, or **$Proxy**. In parallel **grep** **src** for **new** **TagDecorator** or **Proxy.newProxyInstance** added in the **last** **deploy**. Save **javap** **-c** on the **outermost** **decorator** **class** to show **invokeinterface** **depth**.\n\n' +
    '**Root cause:** **Structural** **wrapper** **soup** increased **stack** **depth** and **megamorphic** **interface** **calls** so **JIT** **inlining** broke under load. **HotSpot** spent more **CPU** in **dispatch** **stubs** than in **business** **logic**. **Java** **8** through **21** share this **behavior**; **Java** **21** **virtual** **threads** only hide **blocking** **waits**, not **CPU** **work** inside **wrappers**.\n\n' +
    '**Fix:** **Collapse** **decorators** into **one** **aspect** where **ordering** is **standard**, or **merge** **logging** **and** **metrics** into a **single** **facade** **filter** at the **HTTP** **edge**. Add **JUnit** **contract** **tests** that **fail** if **decorator** **count** exceeds **N** for **core** **ports**. Re-run **load** **test** and compare **jcmd** **Thread.print** **frame** **count** **before**/**after**.\n\n' +
    '**Prevention:** Publish a **platform** **library** with **blessed** **wrapper** **factories** and **ArchUnit** **rules** that **cap** **domain** **imports** of **HTTP** **clients**. Document **retry** and **transaction** **order** in an **ADR** whenever **Resilience4j** and **Spring** **AOP** **overlap**.\n\n' +
    'Extra context: **Adapter** **leaks** show up as **ClassCastException** in **Jackson** **layers** when **controllers** **cast** **legacy** **types**. **Composite** **cycles** show up as **StackOverflowError** in **debug** **logs** even when **heap** is **fine**. Pair **jdeps** **output** with **facade** **ownership** reviews so **teams** do not **merge** **god** **facades** forever.';
  return body;
}

function buildSenior() {
  const titles = [
    '**Incident:** **p99** **latency** doubles after **deploy** adds **two** **new** **Decorators** around **every** **repository** **call**.',
    '**Design:** **PM** wants **retry** **and** **metrics** **both** **outside** **@Transactional** **without** **changing** **call** **sites**.',
    '**Ops:** **CI** **integration** **tests** **StackOverflowError** in **Composite** **toString** only when **debug** **logging** turns on.',
    '**Scale:** **CPU** **hot** **spots** move to **$Proxy** **dispatch** after **JDK** **dynamic** **proxy** **per** **tenant** **id**.',
    '**Security:** **Code** **review** finds **controllers** **casting** **Adapter** **output** to **vendor** **SOAP** **types**.',
    '**Cost:** **CheckoutFacade** **imports** **forty** **packages** and **blocks** **six** **teams** on **every** **release**.'
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

  B('theory', '**Structural** **patterns** mainly solve?', { A: 'How **objects** **compose** and **connect**', B: 'Object **birth** only', C: '**SQL** **indexes**', D: '**TLS** **handshake**' }, 'A', '**Structural** **patterns** shape **edges** and **wrappers**.');
  B('theory', '**Decorator** adds **behavior** by?', { A: '**Delegation** through same **interface**', B: '**extends** only', C: '**static** **import**', D: '**volatile** **fields**' }, 'A', 'Prefer **composition** over **subclass** **explosion**.');
  B('theory', '**Proxy** often handles?', { A: '**Lazy** **init** or **access** **control**', B: '**SQL** **tuning**', C: '**CSS**', D: '**TLS** **certs**' }, 'A', 'Do not confuse **intent** with **Decorator**.');
  B('theory', '**Adapter** maps?', { A: 'One **interface** to another **legacy** **shape**', B: '**Heap** **regions**', C: '**CPU** **cores**', D: '**JWT** **claims**' }, 'A', 'Keep **translation** inside the **adapter** **boundary**.');
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
    '**Decorator** **delegates**?\n```java\ninterface S { int v(); }\nclass D implements S { private final S i; D(S x){i=x;} public int v(){ return 1+i.v(); } }\n```',
    { A: 'Adds **behavior** then **calls** **inner**', B: '**Compile** **error**', C: '**Infinite** **loop** always', D: '**No** **delegation**' },
    'A',
    'Classic **Decorator** **shape**.'
  );
  B(
    'real-world',
    'Your **controller** **casts** **Adapter** **output** to a **vendor** **type**. Best summary?',
    { A: '**Adapter** **leaked** **shape**; map to **port** **types**', B: 'Always fine', C: 'Faster **GC**', D: 'Required by **Kafka**' },
    'A',
    '**Structural** **boundaries** belong at the **adapter**.'
  );

  I('theory', '**Facade** primarily?', { A: 'Simplifies **subsystem** **access**', B: 'Sorts **arrays**', C: '**TCP** **buffers**', D: '**JWT** **signing**' }, 'A', 'Watch **god** **class** **risk**.');
  I('theory', '**Composite** models?', { A: '**Tree** **structures** **uniformly**', B: '**CPU** **affinity**', C: '**CSS** **grid**', D: '**TLS** **version**' }, 'A', 'Guard **cycles** in **equals**/**toString**.');
  I('theory', '**Bridge** separates?', { A: '**Abstraction** from **implementation**', B: '**Heap** from **stack**', C: '**Git** **branches**', D: '**JSON** **keys**' }, 'A', 'Do not confuse with **Adapter** **intent**.');
  I('theory', '**JDK** **dynamic** **proxy** needs?', { A: '**Interface** **list** for **Proxy** **newProxyInstance**', B: 'Only **concrete** **classes**', C: '**final** **classes** only', D: '**No** **interfaces**' }, 'A', '**CGLIB** **differs** for **classes**.');
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
    '**p99** grows after adding **three** **Decorators** per **call**. Likely?',
    { A: '**Deep** **wrapper** **stack** **cost**', B: '**Smaller** **heap**', C: '**Better** **GC**', D: '**Zero** **CPU** **cost**' },
    'A',
    '**Measure** **depth** and **flame** **graphs**.'
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
    '**Sealed** **interfaces** (**Java** **17**) help **Composite** by?',
    { A: 'Limiting **node** **types** you must handle', B: 'Removing **interfaces**', C: 'Disabling **JUnit**', D: 'Forcing **microservices**' },
    'A',
    '**sealed** narrows allowed **subtypes** for **exhaustive** **switch**.'
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
    'After deploy, **Metaspace** climbs only on canary pods. First suspicion with **structural** lens?',
    { A: '**Unbounded** **JDK** **proxy** **types** per **tenant**', B: '**CPU** too fast', C: '**TLS** cipher', D: '**CSS** bundle' },
    'A',
    '**Proxy** **classes** cost **Metaspace**; **cache** or **redesign**.'
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
    '**CheckoutFacade** **imports** **every** **subsystem**. Best governance?',
    { A: 'Split **facades** per **bounded** **context**', B: 'Delete **interfaces**', C: 'Avoid **tests**', D: 'One **global** **map**' },
    'A',
    'Reduce **fan** **out** with **narrow** **ports**.'
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
    'Your **platform** team mandates **Java** **21** but one **service** still uses **field** **injection** everywhere. **Structural** angle?',
    { A: 'Prefer **constructor** **injection** so **proxy** **graphs** are explicit', B: 'Field **injection** is always better', C: 'Delete **interfaces**', D: 'Add more **static** **utils**' },
    'A',
    '**Constructor** **injection** clarifies **wrapper** **chains** for **tests**.'
  );

  return q;
}

const CHEATSHEET = `| Level | Concept | The rule in one line | Example or Command |
|-------|---------|----------------------|--------------------|
| Fresher | **Decorator** | Same **interface**; **delegate** after extra work | **new** **LogDec**(**core**) |
| Fresher | **Proxy** | **Control** **access**; **lazy** **real** **object** | **Proxy** **newProxyInstance**(...) |
| Fresher | **Adapter** | **Translate** **legacy** **API** to **port** | **implements** **PaymentPort** |
| Senior Dev | **Facade** | One **door** into **subsystem** | **CheckoutFacade** **placeOrder**(...) |
| Senior Dev | **Composite** | **Tree** **parts** **uniformly** | **interface** **Node** **children**() |
| Senior Dev | **Self** **invocation** | **@Transactional** needs **proxy** **edge** | **extract** **bean** **collaborator** |
| Senior Dev | **jcmd** | See **deep** **stacks** | **jcmd** **<pid>** **Thread.print** |
| Tech Lead | **AOP** vs **Decorator** | **Aspect** for **wide** **spray**; **Decorator** for **explicit** **order** | **@Order** on **advices** |
| Tech Lead | **ArchUnit** | **Ban** **vendor** **imports** in **web** | **noClasses**()...**should**()... |
| Tech Lead | **Facade** **split** | **One** **facade** per **bounded** **context** | **jdeps** **fan** **out** **budget** |
| Staff | **Megamorphic** **calls** | **Deep** **wrappers** hurt **JIT** **inlining** | **async** **profiler** **hot** **frames** |
| Staff | **$Proxy** | **Synthetic** **proxy** **class** | **javap** **-p** **$Proxy0.class** |
| Staff | **JPMS** | Enforce **exports** on **facade** **API** | **module-info** **exports** **com.mybiz.api** |`;

function buildDay79Sections() {
  const basic = buildBasicCode();
  const mid = buildMidCode();
  const adv = buildAdvCode();
  return [
    { type: 'why', title: 'Why structural design patterns matter in real Java systems', content: buildWhy() },
    { type: 'theory', title: 'Theory and Internals — Design Patterns — Structural', content: buildTheoryContent() },
    {
      type: 'code',
      title: 'Basic — Structural patterns reference card',
      language: 'java',
      filename: 'Day79Basic.java',
      level: 'basic',
      description: 'Print-only vocabulary for week-one learners.',
      code: basic.code,
      output: basic.output
    },
    {
      type: 'code',
      title: 'Intermediate — Four structural pattern incidents',
      language: 'java',
      filename: 'Day79Intermediate.java',
      level: 'intermediate',
      description: 'Senior narration with diagnostic commands.',
      code: mid.code,
      output: mid.output
    },
    {
      type: 'code',
      title: 'Advanced — Structural triage matrix',
      language: 'java',
      filename: 'Day79Advanced.java',
      level: 'advanced',
      description: 'Tech lead printable checklist.',
      code: adv.code,
      output: adv.output
    },
    {
      type: 'diagram',
      title: 'Decorator chain versus core delegate',
      diagramType: 'component',
      description: 'Each decorator wraps the same interface and delegates inward.',
      plantuml:
        '@startuml\ntitle Day 79 — Decorator chain\ninterface PaymentPort\nclass CoreService\nclass MetricsDecorator\nclass LoggingDecorator\nPaymentPort <|.. CoreService\nPaymentPort <|.. MetricsDecorator\nPaymentPort <|.. LoggingDecorator\nLoggingDecorator --> MetricsDecorator : delegates\nMetricsDecorator --> CoreService : delegates\nnote right of LoggingDecorator : outer layer first\n@enduml'
    },
    { type: 'pitfalls', title: 'Common Pitfalls', items: PITFALLS },
    {
      type: 'exercise',
      title: 'Exercise — Structural pattern vocabulary (fresher)',
      audience: 'fresher',
      difficulty: 'Beginner',
      problem:
        'You are writing your first **Java** program to practice **structural** **pattern** words before you join a real **code** **review**.\n\n1. Create **arch.day79.Day79FresherExercise** with **main**.\n2. Print one line that explains **Decorator** in plain words.\n3. Print one line that explains **Proxy** in plain words.\n4. Print one line that explains **Adapter** in plain words.\n5. Print one line that explains why **Facade** helps **callers**.',
      hints: [
        'Keep **final** **String** constants so **output** is the same every run.',
        '**Decorator** wraps the same **interface**; **Proxy** often **guards** or **lazy** **loads**.',
        '**Adapter** translates; **Facade** hides a whole **subsystem** behind one **door**.'
      ],
      solution: `package arch.day79;

/** Fresher drill: tie each structural name to one sentence you can defend aloud. */
public class Day79FresherExercise {

    public static void main(String[] args) {
        // args stay unused so classmates get identical output when they diff solutions.
        final String banner = "=== Day 79 — structural patterns in one screen ===";
        // banner gives pasting into chat a clear header during peer review.
        System.out.println(banner);
        final String decorator = "Decorator: same interface as the inner object; you delegate after adding work like logging.";
        // decorator is the word you use when you stack behavior without subclass explosion.
        System.out.println(decorator);
        final String proxy = "Proxy: same interface but you control access—lazy init, security checks, or remote stubs.";
        // proxy is not free logging; say gatekeeping before you draw UML.
        System.out.println(proxy);
        final String adapter = "Adapter: translate a legacy API into the port your domain already speaks.";
        // adapter is where ClassCastException hides if you leak concrete vendor types.
        System.out.println(adapter);
        final String facade = "Facade: one simple class coordinates many subsystem objects so imports stay small.";
        // facade becomes harmful when it imports every concrete class in the monolith.
        System.out.println(facade);
        final String composite = "Composite: tree of parts; you treat leaf and branch through one interface.";
        // composite risks StackOverflowError if equals or toString walks a cyclic parent link.
        System.out.println(composite);
        final String bridge = "Bridge: split abstraction from implementation so both sides can vary independently.";
        // bridge is not adapter; adapter fixes a mismatch, bridge plans for two axes of change.
        System.out.println(bridge);
        final String remember = "Remember: measure decorator depth before you add another wrapper layer.";
        // remember pairs with jcmd Thread.print when someone blames GC for CPU heat.
        System.out.println(remember);
    }
}
`
    },
    {
      type: 'exercise',
      title: 'Exercise — Structural wrapper triage (staff)',
      audience: 'staff',
      difficulty: 'Advanced',
      problem:
        'Your **checkout** **API** **p99** doubled after a **deploy** that stacked **LoggingDecorator**, **MetricsDecorator**, and **RetryDecorator** around every **repository** **port**, and **canary** **pods** also show **Metaspace** growth from **per-tenant** **JDK** **proxies**.\n\n1. Model three **services** **s1**, **s2**, **s3** with **boolean** flags **deepDecoratorStack**, **adapterCastLeak**, and **unboundedProxyTypes**.\n2. Store **LinkedHashMap** from **service** id to first **diagnostic** **command** (**jcmd** **Thread.print**, **javap** **-c**, **jcmd** **GC.class_stats**).\n3. Print each **service** **line** with its **flags**.\n4. Print **map** entries in **insertion** **order**.\n5. Print **prevention** lines: **one** about **collapsing** **decorators**, **one** about **caching** **Proxy** **instances**, **one** **ArchUnit** rule for **web** **versus** **adapter** **packages**.',
      hints: [
        'Reuse the **StructuralRisk** shape from the advanced **demo**: same **field** **names** keep the story coherent.',
        '**LinkedHashMap** matches how you would **triage** **incidents** in **Slack** **threads**.',
        'Commands stay as **String** literals; you are modeling **runbook** steps, not **exec** **shell**.'
      ],
      solution: `package arch.day79;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Staff exercise: deterministic triage when structural wrappers and proxies misbehave in prod. */
public class Day79StaffExercise {

    record StructuralRisk(String id, boolean deepDecoratorStack, boolean adapterCastLeak, boolean unboundedProxyTypes) {}

    public static void main(String[] args) {
        // LinkedHashMap preserves the order you would present facts in a bridge call.
        Map<String, String> firstCommand = new LinkedHashMap<>();
        firstCommand.put("s1", "jcmd <pid> Thread.print");
        firstCommand.put("s2", "javap -c LoggingDecorator.class");
        firstCommand.put("s3", "jcmd <pid> GC.class_stats");

        // Three synthetic services mirror combined signals from profiling and class stats.
        List<StructuralRisk> services = List.of(
            new StructuralRisk("s1", true, false, false),
            new StructuralRisk("s2", false, true, false),
            new StructuralRisk("s3", false, false, true)
        );

        // Print the modeled rows first so reviewers see you separated signals cleanly.
        System.out.println("=== Modeled services ===");
        for (StructuralRisk s : services) {
            System.out.println(
                s.id()
                    + " deepDec="
                    + s.deepDecoratorStack()
                    + " adapterCast="
                    + s.adapterCastLeak()
                    + " proxyTypes="
                    + s.unboundedProxyTypes()
            );
        }

        // Tie each id to the first command you would actually paste into a shell on-call.
        System.out.println("=== First command per service ===");
        for (Map.Entry<String, String> e : firstCommand.entrySet()) {
            System.out.println(e.getKey() + " -> " + e.getValue());
        }

        // Prevention block documents how you stop repeat pages without blaming individuals.
        System.out.println("=== Prevention — decorators ===");
        System.out.println("Cap cross-cutting in one platform aspect or HTTP filter; ban ad-hoc decorator stacks in domain.");

        System.out.println("=== Prevention — proxies ===");
        System.out.println("Cache Proxy instances per interface list; soak Metaspace with GC.class_stats during tenant ramp.");

        System.out.println("=== Prevention — boundaries ===");
        System.out.println("ArchUnit: noClasses that reside in ..web.. should depend on ..legacy.vendor..");

        // Staff reasoning: deep stacks show up in Thread.print before heap looks unhealthy.
        System.out.println("=== JVM note ===");
        System.out.println("Megamorphic invokeinterface chains from decorators show as hot frames, not always GC pressure.");

        // Adapter leaks surface as ClassCastException in framework code, not in your line number.
        System.out.println("=== Integration note ===");
        System.out.println("Contract tests on adapter output types stop Jackson from becoming the first debugger.");

        // Operational discipline: compare canary and baseline thread dumps from the same build id.
        System.out.println("=== Ops note ===");
        System.out.println("Attach git SHA next to jcmd output so you do not chase an old flame graph.");

        // Close with ADR expectation when platform libraries own wrapper factories.
        System.out.println("=== Governance ===");
        System.out.println("Any new decorator factory requires ADR, owner, and removal deadline for experimental stacks.");

        // Final line ties back to measurable SLO impact after you collapse layers.
        System.out.println("=== Result check ===");
        System.out.println("After fix, rerun load test: p99 should move before you declare victory.");
    }
}
`
    },
    {
      type: 'interview',
      title: 'Interview Drill — Design Patterns — Structural',
      conceptual: buildConceptual(),
      codeBased: buildCodeBased(),
      seniorScenario: buildSenior(),
      wrongAnswers: WRONG,
      jobSwitch: {
        resumeBullet: 'Collapsed ad-hoc decorator stacks across six checkout paths and cut p99 latency by forty-one percent.',
        interviewPositioning:
          'When I join a team I map **decorator** **order** and **Spring** **AOP** **edges** in week one because **structural** mistakes look like **logging** bugs until **p99** burns. I add one **jcmd** **Thread.print** snippet to the **runbook** and an **ArchUnit** slice for **adapter** **boundaries**.',
        starAnchor:
          'Situation: **checkout** **p99** doubled after we wrapped every **repository** with three new **decorators** and **canary** **Metaspace** grew from **per-tenant** **JDK** **proxies**. Task: prove whether **CPU** or **class** **loading** was the driver without a full **rollback**. Action: I captured **async** **profiler** **frames**, ran **javap** **-c** on the outer **LoggingDecorator**, cached **Proxy** **instances** per **interface** **list**, and split **CheckoutFacade** along **bounded** **context** lines with an **ADR**. Result: **p99** fell **forty-one** **percent** in **twenty** **four** hours and **Metaspace** **OOM** **pages** went to **zero** for **eight** **months**.'
      }
    },
    {
      type: 'mcq',
      title: 'MCQ — Design Patterns — Structural',
      description: 'Thirty questions across basic, intermediate, and advanced levels.',
      questions: buildMcq()
    },
    { type: 'cheatsheet', title: 'Cheatsheet — Design Patterns — Structural', content: CHEATSHEET }
  ];
}

export { buildDay79Sections };
