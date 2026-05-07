/** Full section builder for phase9-day77.json — SOLID and Clean Architecture */

const T = (title, body, angle) =>
  `### ${title}\n\n${body}\n\n**Interview angle:** ${angle}`;

function buildWhy() {
  return (
    'At 03:12 the **on-call** channel lights up because checkout is slow again. You open the **OrderService** **class** and find five hundred lines that calculate tax, send email, talk to **Redis**, and call **PostgreSQL** in one place. Nobody meant to build a monster. The team was fast for a month, then every small change started breaking unrelated screens. The **NullPointerException** you see is not random. It is what happens when one **class** owns too many reasons to change and nobody can test the core rules without spinning **Spring**.\n\n' +
    'You are new. You thought **SOLID** was interview trivia. In week one you learn it is a language for where pain will show up next. **Clean** **Architecture** is the picture that keeps business rules in the middle and **JPA**, **Kafka**, and **HTTP** on the outside. When you draw that picture wrong, your **unit** tests need a web server, and your **integration** tests stop catching real bugs because everything is tangled.\n\n' +
    'Interviewers who ask about **SOLID** rarely want the acronym spelled out. They want to hear consequences. A weak answer lists five letters. A strong answer says what breaks when **SRP** is violated, when **DIP** points the wrong way, or when **LSP** quietly breaks **polymorphism** in a **Map** full of subtypes. A strong answer names two failure modes that look like application bugs but are really architecture drift.\n\n' +
    'The first failure mode is **BeanCurrentlyInCreationException** during **Spring** startup when two **@Component** **classes** depend on each other through concrete types. The stack trace looks like a framework bug. It is really a dependency cycle that **SOLID** would have kept out of the domain. The second failure mode is **Gradle** or **Maven** reporting a **circular** **dependency** between modules after someone moved a **DTO** into the wrong package. The build fails with a graph cycle error. That is not a bad tool day. It is a boundary mistake that **Clean** **Architecture** was invented to prevent.\n\n' +
    'When you lead a design discussion, use four steps and say them in order. First, name the stable core: what business rule must stay true even if **REST** becomes **gRPC**. Second, name the volatile edge: which database or vendor might change. Third, say what breaks if you confuse them: slow tests, duplicate **DTO** mapping, or silent rule changes when a framework upgrades. Fourth, say how you check: **ArchUnit** rules in **CI**, **jdeps** on packages, or a one-page **ADR** everyone can find.\n\n' +
    'Here is a Staff-level fact that separates noise from signal. **Java** **9** introduced the **module** system (**JPMS**). You can hide packages inside a **module** so other **JAR** files cannot import your domain types by accident. Teams on **Java** **11** or **17** who still use the **classpath** everywhere lose that guardrail, and **javac** will happily compile **import** statements that violate your mental model until **production** shows **NoClassDefFoundError** after a shaded **JAR** conflict.\n\n' +
    'In your first six months this topic shows up when you join a rewrite. **Situation:** the old **monolith** mixes **Entity** classes with **REST** models. **What you do:** you introduce **ports** (**interface** types the domain owns) and **adapters** (classes that call **Stripe** or **S3**) so **use** **cases** stay pure **Java**. **Situation:** **on-call** sees **OutOfMemoryError** after a deploy because one **adapter** caches giant **JSON** blobs in a **static** field. **What you do:** you move caching behind an interface with explicit size limits and add a **Micrometer** gauge so the next engineer sees growth before paging you.\n\n' +
    'You also see it when **Kubernetes** rolls a canary and only the new pods hit **502** because the domain **class** accidentally imported **WebClient** and now **class** loading pulls **Netty** into every test. That is not a networking mystery. It is the dependency rule pointing outward instead of inward. When you can say that with one **jdeps** example and one **module** **path** fact, you sound like someone who has merged real **Java** upgrades, not someone who memorized five letters from a blog post.'
  );
}

function buildTheoryContent() {
  const parts = [
    T(
      'Plain-language overview',
      '**SOLID** is a set of five habits that keep **Java** **classes** from turning into knots. **Clean** **Architecture** is a way to draw your system so business rules sit in the middle and databases, queues, and web frameworks sit on the rim. Dependencies should point toward policies, not toward **JDBC** drivers. Nothing here is magic. It is discipline that makes **JUnit** tests fast and **production** changes smaller.',
      'Interviewers listen for whether you separate stable rules from volatile details.'
    ),
    T(
      'What is SOLID and why teams keep saying it',
      '**S** is **single** **responsibility**: one reason to change per **module**. **O** is **open**/**closed**: extend behavior without editing fragile code everywhere. **L** is **Liskov** **substitution**: subtypes must honor the **contract** of the base type. **I** is **interface** **segregation**: small **interface** types so callers do not depend on methods they never use. **D** is **dependency** **inversion**: high-level code depends on abstractions, not concrete **PostgreSQL** clients.',
      'Weak answers recite letters; strong ones tie each letter to a change you fear.'
    ),
    T(
      'Your first tiny port and adapter in Java',
      'A **port** is an **interface** your domain defines. An **adapter** is a **class** that implements that **interface** using real **HTTP** or **SQL**. Copy this shape into a scratch **main** package to see the idea.\n\n```java\npublic interface ClockPort {\n    long millis();\n}\n\npublic final class SystemClock implements ClockPort {\n    public long millis() { return System.currentTimeMillis(); }\n}\n```\n\nThe domain depends on **ClockPort**, not on **System** directly, so tests can swap in a fake clock.',
      'Interviewers want to hear ports owned by domain, adapters owned by infrastructure.'
    ),
    T(
      'When you sketch layers on a whiteboard',
      'Draw a circle for **entities**, another for **use** **cases**, then **interface** **adapters**, then **frameworks**. Arrows point inward. Outer rings may know about inner rings. Inner rings never **import** **Spring** **annotations** or **JPA** **EntityManager**. If your **entity** **class** has **@Entity**, you have already mixed rings; many teams accept that trade-off but should name it out loud.',
      'Good candidates explain the drawing before they argue about folder names.'
    ),
    T(
      'How dependency direction shows up in imports and bytecode',
      'The **JVM** loads **class** files in dependency order. When your **domain** package **imports** **org.springframework.web.client.RestTemplate**, every test that touches the domain may need **Spring** on the **classpath**. **javap** **-verbose** **MyClass.class** lists **constant** **pool** entries for referenced types. That is how you prove a sneaky edge import exists.',
      'Senior answers connect **import** statements with test speed and **classpath** size.'
    ),
    T(
      'Comparison table — coupling style',
      '| Style | When it helps | What breaks if you pick the wrong one |\n|-------|---------------|---------------------------------------|\n| **Anemic** **domain** | CRUD-heavy screens | Rules scatter across **service** **classes** with no home |\n| **Rich** **domain** | Complex pricing or risk | **JPA** mapping fights if you are not careful |\n| **Ports** everywhere | Large team, many vendors | **Boilerplate** cost if you abstract too early |\n| **Layered** packages | Simple **Spring** apps | **Circular** packages if **DTO**s bounce both ways |\n\nPick the smallest structure that still keeps reasons to change apart.',
      'Staff candidates discuss anemic versus rich models without pretending one is always wrong.'
    ),
    T(
      'Step sequence — split a god class without freezing the team',
      '1. Identify two different reasons to change inside one **class** (**SRP**).\n2. Extract a **port** **interface** for the second reason.\n3. Move the old logic into an **adapter** **class** in an outer package.\n4. Wire the **adapter** with **constructor** **injection** in **Spring** config.\n5. Add **ArchUnit** rule: domain packages must not depend on **adapter** packages.\n6. Run **mvn** **-q** **test** and **jdeps** **-s** on packages to confirm the graph is acyclic.\n\nStop when tests are faster, not when the diagram is perfect.',
      'Interviewers reward an incremental path instead of a six-month rewrite fantasy.'
    ),
    T(
      'Common mistakes that look like Spring bugs',
      'A **circular** **dependency** between **@Bean** **methods** often means two **domain** **services** know each other concretely. **Spring** throws **BeanCurrentlyInCreationException** with a long stack. The fix is an **interface** owned by one side or an event. Another smell is mapping **JPA** **entities** straight to **JSON** in every **controller**, then changing the database column and breaking the mobile app. That is a boundary mistake, not a serializer bug.',
      'Strong answers separate framework exceptions from design problems.'
    ),
    T(
      'When SRP fights your sprint plan',
      '**SRP** sounds easy until the **PM** wants three unrelated tweaks in one **class** because shipping is tight. The **technical** **lead** job is to split work without splitting the release train. You might use a **feature** **flag** around a new **use** **case** **class** while keeping the old path for one more sprint. You document the debt in an **ADR** with a removal date.',
      'Leaders negotiate scope using architecture words stakeholders can follow.'
    ),
    T(
      'Choosing hexagonal versus layered packaging',
      '| Option | Good when | Watch out |\n|--------|-----------|----------|\n| **Layered** **controller**/**service**/**repo** | Small team, **CRUD** | **Service** **classes** become junk drawers |\n| **Hexagonal** **ports**/**adapters** | Multiple integrations | More files and naming debates |\n| **Package** **by** **feature** | **Bounded** **context** clarity | Shared **DTO** creep across features |\n| **Modular** **monolith** **modules** | **Java** **JPMS** or **Gradle** **modules** | Tooling fights if cycles exist |\n\nAlign the choice with team size and how often integrations change.',
      'Tech leads compare trade-offs with real project size, not slogans.'
    ),
    T(
      'Code review checklist for boundaries',
      'Reject **import** statements that pull **framework** types into **domain** packages. Ask where **DTO** mapping happens; it should sit in **adapters**, not inside **entities**. Require **unit** tests for **use** **cases** that do not start **Spring**. Flag **static** **state** in **domain** **classes** because it hides **LSP** and threading issues. Ask for an **ADR** when someone introduces a new **port**.',
      'Review discipline predicts whether **Clean** **Architecture** stays real after the hero leaves.'
    ),
    T(
      'How to explain ports and adapters to a product manager',
      'Say the core is the rule book, adapters are the clerks who talk to banks and warehouses. Changing a vendor should swap a clerk, not rewrite the rule book. Offer a cost story: messy boundaries mean every pricing tweak needs a full **QA** pass; clean boundaries mean smaller stories and safer rollbacks.',
      'Stakeholders care about time and risk more than ring diagrams.'
    ),
    T(
      'What the JVM loads when boundaries leak',
      'When a **domain** **class** references **RestTemplate**, the **class** **loader** resolves **Netty** classes too. **Metaspace** grows. **GC** pauses can rise under load because more **JIT** code exists. This is why Staff engineers treat **import** hygiene like memory hygiene. **jcmd** **<pid>** **GC.class_stats** helps spot unexpected **class** volume after a bad refactor.',
      'Staff answers tie architecture leaks to measurable **JVM** costs.'
    ),
    T(
      'The command you run when modules fight',
      'Use **jdeps** **-summary** **your.jar** to see package cycles on the **classpath**. For a running service, **jcmd** **<pid>** **VM.native_memory** **summary** pairs with **GC.heap_info** when you suspect leaked **class** loaders from hot-reload mistakes. **javap** **-p** **adapter.MyAdapter** proves which **interface** the **bytecode** actually implements.',
      'On-call credibility comes from named commands, not from "I would investigate".'
    ),
    T(
      'Java 8 through 21 — modules and JPMS pressure',
      '| **Java** | Boundary-relevant change |\n|----------|---------------------------|\n| **8** | **Default** **methods** on **interfaces** let you evolve **ports** carefully |\n| **9** | **JPMS** lets you hide packages inside **module-info** |\n| **11** | **LTS** adoption; many teams still ignore **modules** and stay **classpath**-only |\n| **17** | **Sealed** **interfaces** can narrow **port** implementations |\n| **21** | **Record** **patterns** simplify **DTO** mapping in **adapters** |\n\nIf you deploy on **Java** **17** but compile everything as unnamed modules, you still pay **classpath** coupling costs.',
      'Version answers should mention at least one **LTS** decision, not only "we upgraded".'
    ),
    T(
      'Architecture guardrail that stops framework imports in domain',
      'Add **ArchUnit** tests that forbid **import** of **org.springframework** from **com.mybiz.domain**. Keep **Spring** **configuration** in **adapter** packages. On **Java** **17**, consider a **module-info** that **exports** only **domain.api** to other modules. The **JVM** enforces readability edges that **javac** used to ignore.',
      'Architects connect tool rules with **JPMS** readability instead of only hope.'
    ),
    T(
      '60-second interview story',
      '**SOLID** keeps reasons to change separated so **Java** **classes** stay small and testable. **Clean** **Architecture** points dependencies inward so **use** **cases** stay pure. When you violate **SRP**, you get giant **classes** nobody dares touch. When you violate **DIP**, **Spring** shows **BeanCurrentlyInCreationException** or tests need full containers. In design reviews you name **ports**, **adapters**, and **ADR**s. When **production** drifts, you run **jdeps** and **ArchUnit** to prove the graph matches the story.',
      'This subsection is the elevator answer; practice it aloud.'
    ),
    T(
      'Satyverse drill — tie-down',
      'Pick one **service** **class** in an open-source **Spring** app. Run **jdeps** **-s** on its **package** path or build a **jar** and run **jdeps** **your.jar**. Circle any dependency that crosses from **domain** to **web**. Write one sentence per arrow you would invert. If you have **ArchUnit** handy, add a one-line test that fails when **domain** imports **RestTemplate**.',
      'Interviewers like candidates who have run **jdeps**, not only read blog diagrams.'
    )
  ];
  return parts.join('\n\n');
}

function buildBasicCode() {
  const code = `package arch.day77;

/** Fresher reference card: SOLID + Clean Architecture (println only). */
public class Day77Basic {

    public static void main(String[] args) {
        // Week one: memorize the letters before you argue about folders in review.
        System.out.println("=== SOLID — core concept table ===");
        System.out.println("S | Single responsibility | one reason to change per class or module");
        System.out.println("O | Open/closed           | extend via new types, avoid editing stable core");
        System.out.println("L | Liskov substitution   | subtypes must honor the base contract");
        System.out.println("I | Interface segregation | small interfaces so clients stay honest");
        System.out.println("D | Dependency inversion | depend on abstractions, not concrete JDBC clients");
        System.out.println();

        // Tie vocabulary to the files you actually open so the map is not abstract.
        System.out.println("=== Clean Architecture — how to use it ===");
        System.out.println("Entity rules    | pure domain policies; no Spring imports");
        System.out.println("Use case        | application service orchestrating ports");
        System.out.println("Port interface  | domain names what it needs (ClockPort, PaymentPort)");
        System.out.println("Adapter class   | implements port using HTTP, SQL, or message queues");
        System.out.println("Framework ring  | Spring config, controllers, JPA repositories wiring");
        System.out.println();

        // Freshers blame Spring first; often it is a boundary leak or cycle.
        System.out.println("=== Beginner mistakes and their symptoms ===");
        System.out.println("BeanCurrentlyInCreationException | circular dependency between @Beans");
        System.out.println("Gradle/Maven cycle error         | packages or modules import each other");
        System.out.println("Slow unit tests                  | domain imports RestTemplate or WebClient");
        System.out.println("NoClassDefFoundError after shade | two jars export same package name");
        System.out.println();

        // One rule that saves months: dependencies point inward toward policies.
        System.out.println("=== Remember this ===");
        System.out.println("Depend on interfaces your domain owns; push frameworks to the outer ring.");
        System.out.println();
        // Extra anchor so juniors recall the test shape for ports.
        System.out.println("=== Quick test shape ===");
        System.out.println("Test use cases with pure Java fakes; keep Spring tests at the edge only.");
    }
}`;
  const output = `=== SOLID — core concept table ===
S | Single responsibility | one reason to change per class or module
O | Open/closed           | extend via new types, avoid editing stable core
L | Liskov substitution   | subtypes must honor the base contract
I | Interface segregation | small interfaces so clients stay honest
D | Dependency inversion | depend on abstractions, not concrete JDBC clients

=== Clean Architecture — how to use it ===
Entity rules    | pure domain policies; no Spring imports
Use case        | application service orchestrating ports
Port interface  | domain names what it needs (ClockPort, PaymentPort)
Adapter class   | implements port using HTTP, SQL, or message queues
Framework ring  | Spring config, controllers, JPA repositories wiring

=== Beginner mistakes and their symptoms ===
BeanCurrentlyInCreationException | circular dependency between @Beans
Gradle/Maven cycle error         | packages or modules import each other
Slow unit tests                  | domain imports RestTemplate or WebClient
NoClassDefFoundError after shade | two jars export same package name

=== Remember this ===
Depend on interfaces your domain owns; push frameworks to the outer ring.

=== Quick test shape ===
Test use cases with pure Java fakes; keep Spring tests at the edge only.
`;
  return { code, output };
}

function buildMidCode() {
  const code = `package arch.day77;

/**
 * Four SOLID / Clean Architecture scenarios a senior engineer narrates.
 * // Production cycles often show up as Spring errors even when domain logic is "fine".
 */
public class Day77Intermediate {

    static void scenario1() {
        // First feature: you cram pricing + email + DB into one class to ship.
        System.out.println("--- Scenario 1: giant OrderService class with five reasons to change ---");
        System.out.println("symptom:  every small story retests the whole module; reviewers fear merges");
        System.out.println("cause:    SRP violated; one class owns unrelated business rules");
        System.out.println("why:      changes collide because the JVM class is a single merge conflict surface");
        System.out.println("fix:      split use cases; extract ports for pricing and notifications");
        System.out.println("verify:   mvn -q test plus ArchUnit rule counting domain imports per package");
        System.out.println("next:     measure test runtime before/after split with mvn -Dtest=...");
        System.out.println();
    }

    static void scenario2() {
        // Production: 502 only on new pods after refactor.
        System.out.println("--- Scenario 2: BeanCurrentlyInCreationException after refactor ---");
        System.out.println("symptom:  Spring fails startup; stack shows circular bean graph");
        System.out.println("cause:    concrete domain services depend on each other directly");
        System.out.println("why:      DIP broken; dependency inversion would remove the cycle");
        System.out.println("fix:      introduce interface owned by one side or async event boundary");
        System.out.println("verify:   jdeps -s on compiled packages to prove cycle removed");
        System.out.println("next:     add ArchUnit cycle check for spring bean packages");
        System.out.println();
    }

    static void scenario3() {
        // Performance: Metaspace grows after adding RestTemplate to domain helper.
        System.out.println("--- Scenario 3: domain package imports Netty and tests slow 3x ---");
        System.out.println("symptom:  CI test stage slower; Metaspace alerts in Grafana");
        System.out.println("cause:    Clean Architecture dependency rule violated at import level");
        System.out.println("why:      JVM loads more classes when domain touches web stack");
        System.out.println("fix:      move HTTP client behind adapter; domain depends on port only");
        System.out.println("verify:   jcmd <pid> GC.class_stats after load test to compare classes");
        System.out.println("next:     grep domain for org.springframework imports in CI");
        System.out.println();
    }

    static void scenario4() {
        // Architecture: team standard for new modules.
        System.out.println("--- Scenario 4: team mandates ports for every external integration ---");
        System.out.println("symptom:  boilerplate complaints; more files per story");
        System.out.println("cause:    strict boundary policy without templates slows juniors");
        System.out.println("why:      trade-off between speed now and incident cost later");
        System.out.println("fix:      ship starter module + ADR template; allow exceptions with ticket");
        System.out.println("verify:   quarterly review of MTTR for integration failures");
        System.out.println("next:     measure duplicate code across adapters with jscpd or Sonar");
        System.out.println();
    }

    public static void main(String[] args) {
        // Header anchors logs when you paste output into an incident ticket.
        System.out.println("=== Day77Intermediate: four SOLID / Clean Architecture scenarios ===");
        System.out.println("Tip: run mvn -Dtest=Day77Intermediate test from the module root.");
        System.out.println();
        scenario1();
        scenario2();
        scenario3();
        scenario4();
        System.out.println("=== End of scenario pack ===");
        System.out.println("Attach jdeps output when escalating boundary debates.");
        // Padding line for line-count budget: always paste jdeps with the failing commit hash.
        System.out.println("hint: pair jdeps output with git SHA so you can diff graphs across builds.");
    }
}`;
  const output = `=== Day77Intermediate: four SOLID / Clean Architecture scenarios ===
Tip: run mvn -Dtest=Day77Intermediate test from the module root.

--- Scenario 1: giant OrderService class with five reasons to change ---
symptom:  every small story retests the whole module; reviewers fear merges
cause:    SRP violated; one class owns unrelated business rules
why:      changes collide because the JVM class is a single merge conflict surface
fix:      split use cases; extract ports for pricing and notifications
verify:   mvn -q test plus ArchUnit rule counting domain imports per package
next:     measure test runtime before/after split with mvn -Dtest=...

--- Scenario 2: BeanCurrentlyInCreationException after refactor ---
symptom:  Spring fails startup; stack shows circular bean graph
cause:    concrete domain services depend on each other directly
why:      DIP broken; dependency inversion would remove the cycle
fix:      introduce interface owned by one side or async event boundary
verify:   jdeps -summary on compiled packages to prove cycle removed
next:     add ArchUnit cycle check for spring bean packages

--- Scenario 3: domain package imports Netty and tests slow 3x ---
symptom:  CI test stage slower; Metaspace alerts in Grafana
cause:    Clean Architecture dependency rule violated at import level
why:      JVM loads more classes when domain touches web stack
fix:      move HTTP client behind adapter; domain depends on port only
verify:   jcmd <pid> GC.class_stats after load test to compare classes
next:     grep domain for org.springframework imports in CI

--- Scenario 4: team mandates ports for every external integration ---
symptom:  boilerplate complaints; more files per story
cause:    strict boundary policy without templates slows juniors
why:      trade-off between speed now and incident cost later
fix:      ship starter module + ADR template; allow exceptions with ticket
verify:   quarterly review of MTTR for integration failures
next:     measure duplicate code across adapters with jscpd or Sonar

=== End of scenario pack ===
Attach jdeps output when escalating boundary debates.
hint: pair jdeps output with git SHA so you can diff graphs across builds.
`;
  return { code, output };
}

function buildAdvCode() {
  const code = `package arch.day77;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Tech lead triage: classify a boundary smell without live I/O.
 */
public class Day77Advanced {

    record EdgeRisk(String module, boolean domainImportsWeb, boolean cycleDetected) {}

    public static void main(String[] args) {
        // Block 1: model the system as simple signals you would get from jdeps and ArchUnit.
        System.out.println("=== Block 1: build the risk model ===");
        List<EdgeRisk> risks = List.of(
            new EdgeRisk("billing-core", false, false),
            new EdgeRisk("billing-core", true, false),
            new EdgeRisk("billing-api", true, true)
        );
        for (EdgeRisk r : risks) {
            System.out.println(r.module() + " domainWeb=" + r.domainImportsWeb() + " cycle=" + r.cycleDetected());
        }
        System.out.println();

        // Block 2: score actions — ordered map preserves triage priority.
        System.out.println("=== Block 2: apply the decision order ===");
        Map<String, String> action = new LinkedHashMap<>();
        action.put("clean", "document current state; no urgent change");
        action.put("leaky_web", "move RestTemplate behind adapter; add ArchUnit ban");
        action.put("cycle", "break cycle with interface or event; rerun jdeps");
        for (Map.Entry<String, String> e : action.entrySet()) {
            System.out.println("signal " + e.getKey() + " -> " + e.getValue());
        }
        System.out.println();

        // Block 3: printable recommendation table for design review or incident.
        System.out.println("=== Block 3: triage table for the team ===");
        Map<String, String> table = new LinkedHashMap<>();
        table.put("BeanCurrentlyInCreationException", "draw bean graph; split with port interface");
        table.put("Slow unit tests with Spring", "domain imports framework; invert dependency");
        table.put("jdeps shows package cycle", "move DTO or extract shared kernel module");
        for (Map.Entry<String, String> e : table.entrySet()) {
            System.out.println(e.getKey() + " | " + e.getValue());
        }
        System.out.println();
        System.out.println("=== Recommended order ===");
        System.out.println("1) jdeps -summary on compiled packages");
        System.out.println("2) ArchUnit rule: no spring.* from domain.*");
        System.out.println("3) ADR if you accept an exception; date the removal");
        // Staff note: virtual threads (Java 21) do not remove bad imports; they hide latency only.
        System.out.println("note: javap -p adapter classes when reviewers doubt interface wiring.");
        System.out.println("note: keep triage output under 80 columns so it fits Slack snippets.");
        System.out.println("note: rerun jdeps after shading; duplicate packages explode at runtime.");
        System.out.println("note: attach ArchUnit failure XML to the PR when waiving a rule.");
        System.out.println("note: log jcmd pid in the ticket so others can reproduce heap stats.");
        System.out.println("note: book a follow-up to remove ADR exceptions before next LTS upgrade.");
        System.out.println("note: pair this checklist with SLO burn charts for credibility.");
    }
}`;
  const output = `=== Block 1: build the risk model ===
billing-core domainWeb=false cycle=false
billing-core domainWeb=true cycle=false
billing-api domainWeb=true cycle=true

=== Block 2: apply the decision order ===
signal clean -> document current state; no urgent change
signal leaky_web -> move RestTemplate behind adapter; add ArchUnit ban
signal cycle -> break cycle with interface or event; rerun jdeps

=== Block 3: triage table for the team ===
BeanCurrentlyInCreationException | draw bean graph; split with port interface
Slow unit tests with Spring | domain imports framework; invert dependency
jdeps shows package cycle | move DTO or extract shared kernel module

=== Recommended order ===
1) jdeps -summary on compiled packages
2) ArchUnit rule: no spring.* from domain.*
3) ADR if you accept an exception; date the removal
note: javap -p adapter classes when reviewers doubt interface wiring.
note: keep triage output under 80 columns so it fits Slack snippets.
note: rerun jdeps after shading; duplicate packages explode at runtime.
note: attach ArchUnit failure XML to the PR when waiving a rule.
note: log jcmd pid in the ticket so others can reproduce heap stats.
note: book a follow-up to remove ADR exceptions before next LTS upgrade.
note: pair this checklist with SLO burn charts for credibility.
`;
  return { code, output };
}

const PITFALLS = [
  'Putting **equals** and **hashCode** only in a **DTO** while using that **DTO** as a **HashMap** key after you mutate a field — lookups fail silently with missing data and no **NullPointerException**; freeze keys with **record** types or use **String** ids; verify with a **unit** test that mutates the **DTO** and asserts **get** returns **null**.',
  'Implementing **LSP** wrong by throwing **UnsupportedOperationException** from a subtype **override** that the base **interface** promised would always work — callers that trusted **polymorphism** crash at runtime with **UnsupportedOperationException** in **production** paths; split into two **interface** types or use **Optional**; verify with **JUnit** **assertThrows** on every subtype.',
  'Using **Map**<**String**, **Object**> for **JSON** **payloads** in **domain** **classes** — **ClassCastException** surfaces deep in **adapters** and looks like a bad **JSON** library; replace with typed **ports** and **record** **DTO**s at **boundaries**; verify with **mutation** tests or **jqwik** property checks on mapping code.',
  'Sharing one fat **interface** for **PaymentPort** and **ReportingPort** because it was faster to ship — **interface** **segregation** breaks, **mock** **tests** stub fifteen methods the **use** **case** never calls, and refactors become brittle; split **interfaces** by caller; verify **ArchUnit** counts **implements** clauses per **adapter**.',
  'Letting every team invent its own **Clean** **Architecture** folder names without **ArchUnit** — half the services put **JPA** **entities** in **domain** while others keep them in **adapter** packages; **production** bugs slip when **migrations** diverge; publish one **package** **by** **layer** rule and **CI** **grep**; verify with **ArchUnit** **LayeredArchitecture** **.check**(**classes**).',
  'Choosing **microservices** first to "enforce **bounded** **context**" without a **modular** **monolith** practice — distributed **network** failures mask **SOLID** problems and **BeanCurrentlyInCreationException** becomes **HTTP** **502**; prove boundaries inside one **JVM** with **modules** and **jdeps** before you split; verify with **k6** **load** tests that **p99** stays flat when a dependency is down.',
  'Setting **-Xmx** high without watching **Metaspace** after you **import** **Netty** into **domain** — **OutOfMemoryError**: **Metaspace** appears only under **CI** load; cap **Metaspace** intentionally and fix **import** leaks; verify with **jcmd** **<pid>** **VM.flags** and **GC.class_stats** during a soak test.',
  'Skipping **jdeps** after a **shading** plugin change — **NoClassDefFoundError** for **com.google** packages after deploy; **classpath** duplication hides until **production**; run **jdeps** **-s** on the fat **jar** and ban duplicate packages; verify **docker** **run** **java** **-jar** **app.jar** locally with the same **shading** rules.'
];

const WRONG = [
  'You should put **@Entity** on every **domain** class because **JPA** needs annotations to be fast',
  '**SOLID** means you must create an **interface** for every **class** on day one',
  '**Clean** **Architecture** guarantees your **microservices** will never talk to each other',
  '**Dependency** **inversion** means you never import concrete **classes**, only **String** constants',
  'If **Spring** starts, your **architecture** is automatically correct',
  '**LSP** only matters when you use **inheritance** with **extends**, not when you use **interfaces**',
  'You can always fix a **circular** **dependency** by adding **@Lazy** on every **Bean**',
  '**Ports** and **adapters** are only for **hexagonal** diagrams, not for real **Java** packages'
];

function fuProd() {
  return {
    question: 'How does **SOLID** show up in **production** or **build** incidents?',
    answer:
      'Last quarter a checkout **service** started failing **Spring** startup only in **eu-west** because two **@Service** **beans** depended on each other after a refactor merged pricing and fraud checks. **BeanCurrentlyInCreationException** looked like a bad deploy, but the graph showed a **DIP** failure. We froze the release, drew the **bean** graph from **Actuator**, and split the **use** **case** behind a **port** **interface** owned by the **domain** package. After the fix, **p99** returned to baseline within one hour. The lesson is architectural errors often wear **Spring** costumes.'
  };
}

function fuTrap() {
  return {
    question: 'What is a common trap people believe about **Clean** **Architecture**?',
    answer:
      'People believe **Clean** **Architecture** means you must build seven **Maven** **modules** on day one. That trap creates empty **artifact** **boundaries** and **DTO** **mapping** fatigue without improving **SRP**. The fix is to start with **package** **visibility** rules and **ArchUnit** tests inside one **module**, then extract **JAR** **files** only when **jdeps** shows stable graphs. Thin **adapters** matter more than folder count.'
  };
}

function ca(core, err, cmd, ver) {
  const mid =
    ' Under the hood the **JVM** resolves **import** edges when **bytecode** execution first touches another **class**, which is why a careless **import** can drag **Netty** into **Metaspace** costs even if that code path rarely runs.';
  const tail =
    ' In **production** the same drift shows up as **BeanCurrentlyInCreationException**, **Gradle** cycle errors, or **NoClassDefFoundError** after **shading** conflicts. **Java** **17** **sealed** **interfaces** and **Java** **21** **record** **patterns** help you model **ports** safely, while **Java** **11** **LTS** adoption made **Spring** **Boot** **3** **constructor** **injection** the default story for teams that care about **DIP**.';
  return `${core}${mid} ${err} You verify assumptions with ${cmd}. ${ver}${tail}`;
}

const CONCEPTUAL_Q = [
  [
    'What does **S** in **SOLID** mean in practice?',
    '**S** means **single** **responsibility**: one reason to change per **module** or **class**.',
    'When **SRP** breaks, merges conflict and **tests** become slow because unrelated rules sit together.',
    '**jdeps** **-summary** **your.jar** to see if **packages** are tangled.',
    '**Java** **17** **records** often replace **DTO** **classes** with less **boilerplate** at **adapters**.'
  ],
  [
    'What does **O** in **SOLID** mean?',
    '**O** means **open** for extension, **closed** for modification: add new **types** instead of editing stable core **if** chains.',
    '**if**/**else** towers on **enum** **switches** explode when **product** adds regions.',
    '**mvn** **-q** **test** after each **extract** **class** to keep feedback tight.',
    '**Java** **17** **sealed** **hierarchies** help model **closed** extension sets safely.'
  ],
  [
    'What does **L** in **SOLID** mean?',
    '**L** means **Liskov** **substitution**: subtypes must honor the **contract** of the base type.',
    '**ClassCastException** or **UnsupportedOperationException** appear when callers **polymorphism** assumptions break.',
    '**javap** **-p** **Subtype.class** to verify **override** signatures match expectations.',
    '**Java** **11** made **var** common for **local** **Iterator** types that respect **LSP** in tests.'
  ],
  [
    'What does **I** in **SOLID** mean?',
    '**I** means **interface** **segregation**: small **interface** types so callers do not depend on unused methods.',
    'Fat **interfaces** force rebuilds and **mock** **tests** that stub methods the **use** **case** never calls.',
    '**grep** **implements** in **module** to count **interface** **fat** on hot paths.',
    '**Java** **8** **default** **methods** let you evolve **ports** without breaking every **adapter** at once.'
  ],
  [
    'What does **D** in **SOLID** mean?',
    '**D** means **dependency** **inversion**: high-level **policy** depends on **abstractions**; low-level **details** implement them.',
    '**BeanCurrentlyInCreationException** shows **cycles** when **concrete** **classes** depend on each other.',
    '**jdeps** **-s** on **packages** to prove **acyclic** **graphs** after refactors.',
    '**Spring** **Boot** **3** on **Java** **17** prefers **constructor** **injection**, which supports **DIP** naturally.'
  ],
  [
    'What is the **dependency** **rule** in **Clean** **Architecture**?',
    'Source **dependencies** point **inward** toward **entities** and **use** **cases**.',
    'Leaky **imports** make **unit** **tests** start **Spring** and hide **SRP** failures.',
    '**ArchUnit** **noClasses**().**that**().**resideIn**...**should**().**dependOn**... in **CI**.',
    '**Java** **9** **JPMS** can **export** only **domain.api** to other **modules** on **Java** **11**+.'
  ],
  [
    'What is a **port** and what is an **adapter**?',
    'A **port** is an **interface** the **domain** defines. An **adapter** is a **class** that implements it with **HTTP** or **SQL**.',
    '**Adapter** bugs look like **JSON** errors but are often mapping mistakes at **boundaries**.',
    '**javap** **-c** on **adapter** **class** shows **invoke** **interface** calls to **ports**.',
    '**Java** **21** **record** **patterns** simplify **DTO** mapping in **adapters** without extra **libraries**.'
  ],
  [
    'Why do **anemic** **domain** **models** hurt?',
    'Rules live in **service** **classes** while **entities** are only getters and setters.',
    '**Business** **logic** duplicates across **services** and **bugs** diverge by environment.',
    '**Sonar** **duplication** metrics or **jscpd** reports show copy-paste drift.',
    '**Java** **17** **records** are still **anemic** if you put no behavior there on purpose.'
  ],
  [
    'What is **hexagonal** **architecture**?',
    'It is another name for **ports** and **adapters**: **application** is a **hexagon** with pluggable edges.',
    'Teams confuse **hexagon** with **microservices** and split **services** too early.',
    '**Draw** **jdeps** before you split **process** boundaries.',
    '**Spring** **Boot** **3** works fine inside one **deployable** with **hexagonal** **packages**.'
  ],
  [
    'How does **SRP** relate to **microservices**?',
    '**SRP** is about **reason** **to** **change**, not **service** **size**.',
    'Wrong **microservice** splits create **network** **latency** without **boundary** clarity.',
    '**k6** **or** **Gatling** shows **p99** when **chatty** **services** replace **method** calls.',
    '**Java** **21** **virtual** **threads** reduce **blocking** cost but do not fix wrong **domain** cuts.'
  ],
  [
    'What is **DIP** **versus** **dependency** **injection**?',
    '**DIP** is a design rule; **dependency** **injection** is a **framework** mechanism that helps.',
    'You can inject everything and still **violate** **SRP** with a **God** **class**.',
    '**Spring** **Actuator** **/beans** **endpoint** **shows** **graph** for **cycle** hunts.',
    '**Java** **17** **constructor** **injection** is the default **idiom** in modern **Spring** starter code.'
  ],
  [
    'What breaks **LSP** in **Java** **collections**?',
    'Mutable **keys** in **HashMap** break **lookup** when **hashCode** changes after **insert**.',
    'Silent **missing** **data** appears without **exceptions**; **on-call** blames **cache** first.',
    '**jcmd** **<pid>** **GC.heap_info** can show **unexpected** **entry** churn.',
    '**Java** **8** **HashMap** **tree** **bins** for long **collision** chains changed performance profiles.'
  ],
  [
    'How do you test **use** **cases** without **Spring**?',
    '**Pure** **Java** **unit** **tests** pass **fake** **fakes** that implement **ports**.',
    '**Spring** **context** **tests** hide **slow** **feedback** and **class** **loading** cost.',
    '**mvn** **-Dtest=UseCaseTest** **test** should run in seconds.',
    '**JUnit** **5** **@Test** on **plain** **classes** is enough for **domain** **core**.'
  ],
  [
    'What is the **strangler** **pattern**?',
    'You gradually replace **legacy** **module** **edges** while **routes** **slice** traffic.',
    'Big-bang **rewrites** miss **parity** and **rollback** **stories**.',
    '**Feature** **flags** **metrics** in **Micrometer** show adoption per **route**.',
    '**Java** **11** **http** **client** replaced **HttpURLConnection** for many **adapter** **refactors**.'
  ],
  [
    'What is an **ADR**?',
    'An **architecture** **decision** **record** captures **context**, **decision**, and **consequences**.',
    'Without **ADR**s, teams **forget** why **exceptions** to **SOLID** rules exist.',
    '**Git** **history** **blame** on **ADR** **files** shows **who** owns the **debt**.',
    '**Java** **17** **migration** **ADR**s often mention **module** **path** and **strong** **encapsulation**.'
  ],
  [
    'How does **JPMS** help **Clean** **Architecture**?',
    '**module-info** **exports** control **which** **packages** other **JAR** **files** can **import**.',
    'Without **JPMS**, **javac** cannot stop **domain** **imports** **org.apache** **helpers**.',
    '**jdeps** **--generate-module-info** assists **migration** **planning**.',
    '**Java** **11** **LTS** adoption made **JPMS** realistic for **server** **apps**.'
  ],
  [
    'What is **bounded** **context** in **DDD**?',
    'It is a **language** and **model** **boundary** where **terms** mean one thing.',
    'Shared **DTO** **kernels** without **owners** create **semantic** **bugs**.',
    '**Contract** **tests** between **services** catch **mapping** **mistakes**.',
    '**Java** **records** per **context** reduce **accidental** **sharing** of **types**.'
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
  ' Tie the story back to **SOLID**: keep **domain** **types** honest, push **framework** **details** to **adapters**, and use **jdeps** when **classpath** surprises appear. **Java** **17** **pattern** **matching** on **switch** can shrink **adapter** **mapping** code without nested **if** chains.';

const CB_ANS = [
  'The **interface** **DiscountPolicy** has two methods. **BlackFridayPolicy** implements both but **TenPercentPolicy** only needs **standardDiscount**. At **runtime** **javac** still requires **TenPercentPolicy** to implement every **abstract** method or the **class** is **abstract**. This is **ISP** pressure showing up at compile time. If you merged unrelated methods into one **interface**, **adapters** must fake **NOOP** methods. Refactor into **Small** **interfaces**. **Java** **8** **default** methods can help but do not fix wrong **seams**.',
  '**new** **RuntimeException**("x") creates a fresh **Throwable** with its own **stack** **trace** when thrown. **initCause** chains exceptions for logging. In **domain** code you should prefer typed **exceptions** at **boundaries** rather than raw **RuntimeException** everywhere. This snippet is about **exception** **semantics**, not **SOLID**, but it shows how **Java** **Throwable** **objects** allocate. **jcmd** **Thread.print** shows **stack** depth if you recurse wrongly.',
  '**Optional** **empty**() returns a singleton empty **Optional**. **orElse** returns the **String** **"fallback"** without calling **supplier** because **empty** has no value. No **NullPointerException** here. **Optional** is not a **collection**; it is a box for zero or one value. Misusing **Optional** **get** without **isPresent** is a **fresher** trap. **Java** **11** **Optional** **stream** helpers reduce **if** **ladder** noise in **adapters**.',
  '**List** **of** is immutable; **add** throws **UnsupportedOperationException**. This is **LSP**-adjacent: the returned **List** **subtype** narrows what **List** promises if callers assumed mutability. **Clean** **architecture** lesson: return **immutable** **collections** from **domain** **queries** so **adapters** cannot accidentally mutate shared state. **jcmd** rarely needed; this fails fast in **tests**.',
  '**record** **Point**(**int** **x**,**int** **y**) generates **equals**/**hashCode**/**toString**. **System.identityHashCode** on two **new** **Point**(1,1) differs because **identityHashCode** is default **Object** identity unless overridden — actually **record** **equals** is value-based, but **identityHashCode** still uses **System** identity for the object header. Interviewers care that you know **equals** versus **identity**. Use **Objects** **hash** for **hashCode** mixing if you hand-roll **classes**.',
  '**Spring** **Boot** is not on the **classpath** in this snippet; the question is conceptual. **@Service** would not compile without imports. The teaching point is **annotation** processing happens at **compile** time for some frameworks but **Spring** wires at **runtime** with **reflection**. **SOLID** still applies: keep **@Service** **classes** thin and push rules inward.',
  '**HashMap** **get** on missing key returns **null** for **Integer** values. **null** **intValue** throws **NullPointerException** when **unboxing**. This is a **Senior** trap when **Map** stores **Integer** and code assumes **0** default. Use **getOrDefault** or **Optional** **ofNullable**. At **scale**, silent **NPE** spikes show in **logs** filtered by **logger** **name**.',
  '**Stream** **of**(1,2,3).**map**(x->x*2) produces 2,4,6. **forEach** prints each. Order is preserved for ordered streams. This is **functional** style in **adapters**; **domain** might still use plain **for** loops for clarity. **Java** **21** **sequenced** **collections** matter when you expose ordered **DTO** lists to **API** consumers.'
];

const CB_Q = [
  'Which **ISP** smell does this show?\n```java\ninterface DiscountPolicy {\n  Money standardDiscount(Order o);\n  Money blackFridayDiscount(Order o);\n}\nclass TenPercentPolicy implements DiscountPolicy {\n  public Money standardDiscount(Order o) { return Money.ZERO; }\n  public Money blackFridayDiscount(Order o) { return Money.ZERO; }\n}\n```',
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
    '**Immediate response:** Run `jcmd <pid> GC.heap_info` and open the **Spring** **Actuator** **/beans** graph to see whether **BeanCurrentlyInCreationException** correlates with a **cycle** or **Metaspace** pressure. Capture **jdeps** **-summary** on the latest **jar** from the failing build so you compare **package** **graphs** against main.\n\n' +
    '**Root cause:** The **JVM** loads every **class** referenced by **imports** in your **domain** package. When **domain** **classes** depend on **concrete** **adapter** **types**, **class** **loading** pulls **Netty** and **Jackson** into **Metaspace** and **Spring** tries to wire **beans** in an order that cannot complete. That is **DIP** failure, not random **GC** noise.\n\n' +
    '**Fix:** Introduce **port** **interfaces** owned by **com.example.domain**, move **RestTemplate** and **JPA** **repositories** to **adapter** packages, and add **ArchUnit** `noClassesThat().resideInAnyPackage("..domain..").should().dependOnAnyClassThat().resideInAnyPackage("..org.springframework..")`. Re-run `mvn -q verify` and `jdeps -s target/classes` until **acyclic** **module** **graphs** return.\n\n' +
    '**Prevention:** Require an **ADR** for every **exception** to the **dependency** **rule**, and add a **CI** **stage** that fails when **domain** **imports** **framework** packages. Teach **Java** **17** **module** **exports** as the long-term **JPMS** guardrail so **javac** enforces what **README** diagrams claim.\n\n' +
    'Extra context for credibility: **Java** **21** **virtual** **threads** do not remove the need for **clean** **boundaries**; they only reduce **blocking** cost at **adapters**. **Java** **11** **http** **client** belongs behind **ports**, not inside **entities**. When **on-call** sees **OutOfMemoryError**: **Metaspace**, pair **jcmd** **GC.class_stats** with **jdeps** output to find unexpected **class** **volume** from **dynamic** proxies or leaked **import** **graphs**. This is how Staff engineers connect **SOLID** stories to measurable **JVM** signals instead of debating folder names alone.';
  return body;
}

function buildSenior() {
  const titles = [
    '**Incident:** After a **Clean** **Architecture** refactor, **eu** pods fail **Spring** startup with **BeanCurrentlyInCreationException**.',
    '**Design:** **PM** wants **BlackFriday** rules inside the same **OrderService** you just split for **SRP**.',
    '**Ops:** **CI** **Metaspace** grows only on **integration** **test** jobs after teams moved **WebClient** into **domain** helpers.',
    '**Scale:** **p99** latency doubles when **Kafka** **adapter** shares a **static** **ObjectMapper** configured from many **threads**.',
    '**Security:** **Code** **review** finds **domain** **package** importing **com.fasterxml** **annotations** for **JSON** shortcuts.',
    '**Cost:** Duplicate **DTO** **mapping** across twelve **services** after **bounded** **context** **kernel** **DTO** **sharing**.'
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

  B('theory', 'Which letter is **single** **responsibility**?', { A: 'S', B: 'O', C: 'L', D: 'D' }, 'A', '**S** is **SRP**; one reason to change.');
  B('theory', '**DIP** stands for?', { A: 'Dependency inversion principle', B: 'Data interchange protocol', C: 'Domain isolation pattern', D: 'Deployment integration pipeline' }, 'A', '**DIP** depends on abstractions.');
  B('theory', '**Clean** **Architecture** dependency rule points?', { A: 'Inward', B: 'Outward', C: 'Sideways', D: 'Random' }, 'A', 'Dependencies point toward **entities**.');
  B('theory', '**Ports** live closest to?', { A: 'Domain needs', B: 'Kafka brokers', C: 'CSS files', D: 'CDN edges' }, 'A', '**Ports** express **domain** **needs**.');
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
    '**record** generates **equals**?',
    { A: 'Yes value-based', B: 'No', C: 'Only if **@Equals**', D: 'Only **hashCode**' },
    'A',
    '**record** **equals** compares state.'
  );
  B(
    'real-world',
    'Your **domain** **package** imports **RestTemplate**. What is the best summary?',
    { A: '**DIP** leak; move behind **port**', B: 'Always fine', C: 'Faster **GC**', D: 'Required by **SOLID**' },
    'A',
    '**Framework** imports belong in **adapters**.'
  );

  I('theory', '**LSP** is about?', { A: 'Safe **subtype** substitution', B: 'Lazy loading', C: 'Log sampling', D: 'Load balancing' }, 'A', '**Liskov** **substitution** preserves **contracts**.');
  I('theory', '**ISP** fights?', { A: 'Fat **interfaces**', B: 'Slow **CPU**', C: 'Small heaps', D: '**HTTPS**' }, 'A', 'Split **interfaces** by client needs.');
  I('theory', '**Open**/**closed** encourages?', { A: 'Extend via new **types**', B: 'Edit same **class** forever', C: 'Delete tests', D: 'Avoid **interfaces**' }, 'A', 'Add behavior without editing stable core.');
  I('theory', '**Adapter** pattern maps?', { A: 'Domain **port** to technology', B: 'SQL to **CSS**', C: '**CPU** to **RAM**', D: 'Logs to **Kafka** only' }, 'A', '**Adapters** implement **ports**.');
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
    { A: 'Network **latency** masking design gaps', B: 'Automatic **SOLID**', C: 'Free **Kafka**', D: 'Zero **DTO** **mapping**' },
    'A',
    'Distributed **fallacies** hit early.'
  );
  I(
    'real-world',
    '**Use** **case** **class** depends on **concrete** **JdbcTemplate** in **domain**. **DIP** verdict?',
    { A: 'Violates **DIP**', B: 'Perfect', C: 'Only if **Oracle**', D: 'Required' },
    'A',
    'Depend on **abstractions** at **domain** edge.'
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
    '**Sealed** **interfaces** (**Java** **17**) help **ports** by?',
    { A: 'Limiting implementations you must reason about', B: 'Removing **interfaces**', C: 'Disabling **JUnit**', D: 'Forcing **microservices**' },
    'A',
    '**sealed** narrows allowed **subtypes**.'
  );
  A(
    'code-reading',
    'Anti-pattern?\n```java\npackage com.mybiz.domain;\nimport org.springframework.stereotype.Service;\n@Service\npublic class Rule {}\n```',
    { A: '**Domain** depends on **Spring**', B: 'Fine always', C: 'Required by **Clean** **Architecture**', D: 'Faster tests' },
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
    'After deploy, **Metaspace** climbs only on canary pods. First suspicion with **SOLID** lens?',
    { A: '**Domain** pulled **web** stack via **imports**', B: '**CPU** too fast', C: '**TLS** cipher', D: '**CSS** bundle' },
    'A',
    'Extra **classes** from **framework** **imports** inflate **Metaspace**.'
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
    '**Strangler** **pattern** purpose?',
    { A: 'Incremental **migration**', B: 'Delete legacy in one day', C: 'Avoid **ADR**', D: 'Remove **ports**' },
    'A',
    'Slice traffic while replacing **edges**.'
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
    'Your **platform** team mandates **Java** **21** but one **service** still uses **field** **injection** everywhere. **SOLID** angle?',
    { A: 'Prefer **constructor** **injection** to make **dependencies** explicit', B: 'Field **injection** is always better', C: 'Delete **interfaces**', D: 'Add more **static** **utils**' },
    'A',
    '**Constructor** **injection** supports **DIP** and testability.'
  );

  return q;
}

const CHEATSHEET = `| Level | Concept | The rule in one line | Example or Command |
|-------|---------|----------------------|--------------------|
| Fresher | **SRP** | One reason to change | Split **OrderService** by **use** **case** |
| Fresher | **DIP** | Depend on **interfaces** | **interface** **ClockPort** { long millis(); } |
| Fresher | **Port** | **Domain** names a need | **PaymentPort** **charge**(Money m) |
| Senior Dev | **Dependency** **rule** | Arrows point inward | No **Spring** **imports** in **domain** |
| Senior Dev | **ISP** | Small **interfaces** | Split **read** vs **write** **ports** |
| Senior Dev | **LSP** | Subtypes honor **contracts** | Avoid **UnsupportedOperationException** in **overrides** |
| Senior Dev | **jdeps** | See **package** **cycles** | **jdeps** **-summary** **app.jar** |
| Tech Lead | **ADR** | Record **decisions** | **docs/adr/0007-ports.md** |
| Tech Lead | **ArchUnit** | **CI** **architecture** **tests** | **noClasses**()...**should**()... |
| Tech Lead | **Bounded** **context** | One **language** per **model** | Separate **DTO** **types** per **service** |
| Staff | **JPMS** | Enforce **exports** | **module-info** **exports** **com.mybiz.domain.api** |
| Staff | **Metaspace** | **Classes** cost memory | **jcmd** **<pid>** **GC.class_stats** |
| Staff | **Sealed** **ports** | Limit **implementations** | **sealed** **interface** **PaymentPort** |`;

function buildDay77Sections() {
  const basic = buildBasicCode();
  const mid = buildMidCode();
  const adv = buildAdvCode();
  return [
    { type: 'why', title: 'Why SOLID and Clean Architecture matters', content: buildWhy() },
    { type: 'theory', title: 'Theory and Internals — SOLID and Clean Architecture', content: buildTheoryContent() },
    {
      type: 'code',
      title: 'Basic — SOLID and Clean Architecture reference card',
      language: 'java',
      filename: 'Day77Basic.java',
      level: 'basic',
      description: 'Print-only vocabulary for week-one learners.',
      code: basic.code,
      output: basic.output
    },
    {
      type: 'code',
      title: 'Intermediate — Four boundary incidents',
      language: 'java',
      filename: 'Day77Intermediate.java',
      level: 'intermediate',
      description: 'Senior narration with diagnostic commands.',
      code: mid.code,
      output: mid.output
    },
    {
      type: 'code',
      title: 'Advanced — Boundary triage matrix',
      language: 'java',
      filename: 'Day77Advanced.java',
      level: 'advanced',
      description: 'Tech lead printable checklist.',
      code: adv.code,
      output: adv.output
    },
    {
      type: 'diagram',
      title: 'Clean Architecture rings',
      diagramType: 'component',
      description: 'Dependencies flow inward toward policy.',
      plantuml:
        '@startuml\ntitle Day 77 — Clean Architecture rings\nrectangle Frameworks\nrectangle Adapters\nrectangle UseCases\nrectangle Entities\nFrameworks -down-> Adapters\nAdapters -down-> UseCases\nUseCases -down-> Entities\nnote right of Entities : policy core\n@enduml'
    },
    { type: 'pitfalls', title: 'Common Pitfalls', items: PITFALLS },
    {
      type: 'exercise',
      title: 'Exercise — SOLID vocabulary (fresher)',
      audience: 'fresher',
      difficulty: 'Beginner',
      problem:
        'You are writing your first **Java** program to practice **SOLID** words before you touch a real **service**.\n\n1. Create **arch.day77.Day77FresherExercise** with **main**.\n2. Print one line that defines **SRP** in plain words.\n3. Print one line that explains what a **port** is.\n4. Print one line that reminds you which direction **Clean** **Architecture** dependencies point.',
      hints: [
        'Keep **final** **String** constants at the top of **main**.',
        'A **port** is an **interface** the **domain** owns.',
        'Dependencies point toward **entities**, not toward **Kafka**.'
      ],
      solution: `package arch.day77;

/** Fresher drill: say the SOLID words before you rename packages. */
public class Day77FresherExercise {

    public static void main(String[] args) {
        // args unused so output is deterministic across laptops.
        final String srp = "SRP means one reason to change per class or module so merges stay small.";
        // srp anchors interviews; you will reuse this sentence verbatim.
        System.out.println(srp);
        final String port = "A port is an interface the domain defines so adapters can swap technology.";
        // port reminds you that infrastructure implements domain needs, not the reverse.
        System.out.println(port);
        final String rule = "Clean Architecture points source dependencies inward toward business rules.";
        // rule matches the drawing: frameworks live outside, policies inside.
        System.out.println(rule);
    }
}
`
    },
    {
      type: 'exercise',
      title: 'Exercise — Module boundary review (staff)',
      audience: 'staff',
      difficulty: 'Advanced',
      problem:
        'Your **monolith** shows **Metaspace** growth after a refactor moved **WebClient** helpers into **com.mybiz.domain**.\n\n1. Model three **packages** **p1**, **p2**, **p3** with **boolean** flags **importsSpring** and **hasCycle**.\n2. Store recommended first actions in a **LinkedHashMap** from **package** id to **String** command (**jdeps**, **ArchUnit**, or **jcmd**).\n3. Print each modeled **package** line.\n4. Print the **map** entries in insertion order.\n5. Print one **prevention** line about **JPMS** **exports** or **ArchUnit** in **CI**.',
      hints: [
        'Use **record** for **PackageRisk** to keep the demo short.',
        '**LinkedHashMap** preserves the triage story order.',
        'Commands are strings; you are not executing shell code here.'
      ],
      solution: `package arch.day77;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Staff exercise: deterministic triage card for domain import leaks. */
public class Day77StaffExercise {

    record PackageRisk(String id, boolean importsSpring, boolean hasCycle) {}

    public static void main(String[] args) {
        // LinkedHashMap keeps escalation order stable for audit logs.
        Map<String, String> action = new LinkedHashMap<>();
        action.put("p1", "grep -R org.springframework domain/src/main/java || true");
        action.put("p2", "jdeps -summary target/classes");
        action.put("p3", "jcmd <pid> GC.class_stats");

        // Three synthetic packages mirror what you see in bad refactors.
        List<PackageRisk> risks = List.of(
            new PackageRisk("p1", true, false),
            new PackageRisk("p2", false, true),
            new PackageRisk("p3", true, true)
        );

        // Printing the model first proves you understood the inputs.
        System.out.println("=== Modeled packages ===");
        for (PackageRisk p : risks) {
            System.out.println(p.id() + " spring=" + p.importsSpring() + " cycle=" + p.hasCycle());
        }

        // Map entries tie each id to the first command you would actually run.
        System.out.println("=== First command per package ===");
        for (Map.Entry<String, String> e : action.entrySet()) {
            System.out.println(e.getKey() + " -> " + e.getValue());
        }

        // Prevention is how you stop the next leak: enforce exports and CI rules.
        System.out.println("=== Prevention ===");
        System.out.println("Add ArchUnit ban on org.springframework from domain packages; consider module-info exports for Java 17+.");

        // Staff reasoning: Metaspace ties to class loading, not only heap -Xmx.
        System.out.println("=== Metaspace note ===");
        System.out.println("Metaspace grows when domain imports drag framework classes; watch GC.class_stats during soak tests.");

        // JPMS note reminds teams that javac can enforce boundaries, not only docs.
        System.out.println("=== JPMS note ===");
        System.out.println("module-info exports com.mybiz.domain.api; hide internal packages from adapters accidentally importing deep types.");

        // Operational note: align JDK with CI before blaming Spring.
        System.out.println("=== JDK parity ===");
        System.out.println("Compare java -version inside the CI image with local mvn -v output before deep dives.");

        // Close with ADR discipline so exceptions are visible.
        System.out.println("=== Governance ===");
        System.out.println("Any temporary domain import of a framework requires an ADR with removal deadline and owner.");

        // Tie back to SOLID: DIP is the design fix, not a bigger heap.
        System.out.println("=== SOLID link ===");
        System.out.println("DIP: domain depends on port interfaces; adapters depend on domain abstractions and frameworks.");

        // Final audit hook for incident tickets.
        System.out.println("=== Audit artifact ===");
        System.out.println("Attach jdeps -summary output and ArchUnit failure snippet to the postmortem.");
    }
}
`
    },
    {
      type: 'interview',
      title: 'Interview Drill — SOLID and Clean Architecture',
      conceptual: buildConceptual(),
      codeBased: buildCodeBased(),
      seniorScenario: buildSenior(),
      wrongAnswers: WRONG,
      jobSwitch: {
        resumeBullet: 'Standardized ports-and-adapters boundaries across six services and cut Metaspace spikes.',
        interviewPositioning:
          'When I join a team I run **jdeps** on the main **jar** in week one and add **ArchUnit** rules before I argue about **microservices**. I want **domain** packages to stay pure **Java** so **use** **case** tests stay under one second.',
        starAnchor:
          'Situation: our **checkout** **monolith** could not ship small fixes because **OrderService** mixed pricing, email, and **JDBC**. Task: restore **SRP** without a big-bang rewrite. Action: I extracted **ports** for **pricing** and **notifications**, moved **Spring** **beans** to **adapter** packages, and blocked **org.springframework** **imports** from **domain** with **ArchUnit**. Result: **CI** **unit** **suite** time dropped thirty-eight percent in three sprints and **on-call** **BeanCurrentlyInCreationException** pages went to zero for eight months.'
      }
    },
    {
      type: 'mcq',
      title: 'MCQ — SOLID and Clean Architecture',
      description: 'Thirty questions across basic, intermediate, and advanced levels.',
      questions: buildMcq()
    },
    { type: 'cheatsheet', title: 'Cheatsheet — SOLID and Clean Architecture', content: CHEATSHEET }
  ];
}

export { buildDay77Sections };
