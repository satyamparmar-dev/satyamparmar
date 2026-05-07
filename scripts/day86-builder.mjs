/** Full section builder for phase10-day86.json — Spring Testing and Testcontainers */

const T = (title, body, angle) =>
  `### ${title}\n\n${body}\n\n**Interview angle:** ${angle}`;

function buildWhy() {
  return (
    'At 01:48 the **GitHub** **Actions** job for your **Spring** **Boot** checkout service times out. The log ends with **ApplicationContext** **failure** **threshold** **exceeded** while **Testcontainers** tries to pull **postgres:15** from a registry your laptop can reach but the runner cannot. Your **IDE** test green bar fooled you because **Docker** **Desktop** was warm and the image was already cached. The failure looks like "the pipeline is broken". It is really a parity problem between your machine and **CI**.\n\n' +
    'You are new. You thought **@SpringBootTest** meant "turn everything on". In week two you learn that **Spring** **testing** is mostly about picking the smallest **slice** that still proves the risk you care about. **@WebMvcTest** exercises controllers and **MockMvc** without your whole database. **@DataJpaTest** spins **JPA** against an in-memory or container database. **Testcontainers** gives you real **PostgreSQL** or **Kafka** in disposable **Docker** containers so driver quirks and **SQL** constraints show up before production.\n\n' +
    'Interviewers who ask about **Spring** **testing** and **Testcontainers** rarely want a list of annotations. They want to hear what breaks when you pick the wrong slice, when **@MockBean** hides a missing **@Service**, or when **@DynamicPropertySource** never runs because the static container field initialized in the wrong order. A weak answer says "we use **Testcontainers**". A strong answer says "we wire random host ports into **spring.datasource.url** and we know what **UnsatisfiedDependencyException** means in a slice test".\n\n' +
    'When ten engineers share fifty services, two pain patterns repeat. First, every team runs **@SpringBootTest** for speed of writing tests, **CI** crawls to forty minutes, and people stop running the suite before merge. Second, **JSON** mapping bugs slip through because **MockMvc** never hit a real **ObjectMapper** profile match, and production throws **HttpMessageNotReadableException** while tests stayed green. Both look like mysterious app bugs. They are test architecture choices amplified across repositories.\n\n' +
    'Use this four-step pattern in reviews and when you coach your team. First, name the risk: **HTTP** contract, **JPA** mapping, messaging, or cross-service wiring. Second, pick the slice: **@WebMvcTest**, **@DataJpaTest**, **@SpringBootTest** with **Testcontainers**, or a black-box **TestRestTemplate** test. Third, say what breaks if you are wrong: **UnsatisfiedDependencyException**, **IllegalStateException** from **Docker** **Client**, or silent false confidence from an over-mocked context. Fourth, verify with **mvn** **-Dtest=YourIT** **test**, **docker** **ps** during the run, and **jcmd** **<pid>** **Thread.print** if the **JVM** hangs after containers start.\n\n' +
    'Here is a Staff-level fact. **Testcontainers** starts a sidecar called **Ryuk** that reaps containers after the **JVM** exits. If your **Kubernetes** **CI** pod blocks extra containers or the **Docker** socket is read-only, tests fail before your **ApplicationContext** even loads, often with **Could** **not** **find** **a** **valid** **Docker** **environment**. The fix is platform policy and **Docker-in-Docker** or **privileged** runners, not rewriting business logic.\n\n' +
    'In your first six months you will live this topic. During onboarding you fix **UnsatisfiedDependencyException** because **@WebMvcTest** did not load the **SecurityFilterChain** bean you assumed was always there. You help **on-call** reproduce a **Flyway** failure that only appears when **PostgreSQL** enforces a check constraint your **H2** test never modeled. Before a **Spring** **Boot** **3** upgrade you align **Java** **17** **toolchain** in **Maven** and prove **Testcontainers** **reuse** works on **ARM** **CI** agents. Each time you tie the story to **docker** **info**, **mvn** output, and a measurable **CI** time change, not to buzzwords.\n\n' +
    'You also watch how **Metaspace** grows when dozens of integration tests each start a full **Spring** context. A Staff engineer treats slow **CI** as a signal about context caching, container reuse, and parallel forks before blaming developers for "writing too many tests". When you can say that with one **jcmd** **GC.class_stats** example after a suite, you sound like someone who has operated real pipelines, not someone who only memorized five annotations. That mindset is what keeps releases boring in a good way.'
  );
}

function buildTheoryContent() {
  const parts = [
    T(
      'Plain-language overview',
      '**Spring** **testing** is how you start only the parts of your app you need for one question, then prove that part behaves correctly. **Testcontainers** is a library that starts real databases or brokers inside **Docker** during the test run, then throws them away. Together they answer a simple question: does this **HTTP** handler, **JPA** query, or message listener work against something that behaves like production, without you manually installing **PostgreSQL** on every laptop.',
      'Interviewers listen for slice versus full context versus real container trade-offs stated in plain words.'
    ),
    T(
      'What is a Spring slice test',
      'A slice test loads a thin **Spring** **ApplicationContext** built for one layer. **@WebMvcTest** pulls in **web** **MVC** pieces such as **MockMvc** and **Controller** beans but not your whole data layer unless you add them. **@DataJpaTest** focuses on **JPA** repositories and an embedded or container database. The **JVM** still runs **bytecode** the normal way; **Spring** just registers fewer beans so startup stays fast.',
      'Weak answers blur slice and full **@SpringBootTest**; strong ones name which beans load by default.'
    ),
    T(
      'Your first @WebMvcTest shape',
      'Drop this minimal skeleton under **src/test/java** so **Surefire** can compile it once your project already depends on **spring-boot-starter-test**.\n\n```java\nimport org.junit.jupiter.api.Test;\nimport org.springframework.beans.factory.annotation.Autowired;\nimport org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;\nimport org.springframework.test.web.servlet.MockMvc;\nimport static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;\nimport static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;\n\n@WebMvcTest\nclass HelloMvcTest {\n    @Autowired MockMvc mockMvc;\n    @Test void ok() throws Exception { mockMvc.perform(get("/")).andExpect(status().isOk());\n    }\n}\n```\n\nYou still need a matching **@Controller** or adjust the test; the point is seeing how **MockMvc** issues an **HTTP** request in memory.',
      'Interviewers want proof you have run **MockMvc** at least once, not only read blog posts.'
    ),
    T(
      'What Testcontainers adds to Spring tests',
      '**Testcontainers** talks to **Docker** through the **Docker** **API** and starts containers such as **PostgreSQL** or **Kafka**. Your test reads host and mapped port, then registers **spring.datasource.url** before **Spring** starts. That catches driver dialect issues, real **SQL** errors, and timing that **H2** compatibility mode never shows. Nothing replaces discipline: you still need migrations and cleanup.',
      'Good answers mention **@DynamicPropertySource** or **ServiceConnection** style wiring, not only "we use Docker".'
    ),
    T(
      'How Spring builds the test ApplicationContext',
      '**Spring** **Test** scans your test class annotations, builds a **BeanDefinition** list, refreshes the **ConfigurableApplicationContext**, and runs lifecycle callbacks. Each slice annotation imports a different **ImportSelector**. If a **@Bean** you need is not in that import list, you get **UnsatisfiedDependencyException** even though the same app runs fine with **@SpringBootApplication** in production.',
      'Senior answers connect missing beans with slice imports instead of randomly adding **@SpringBootTest**.'
    ),
    T(
      'Comparison table — slice versus full stack',
      '| Annotation | What loads | What breaks if you pick the wrong one |\n|------------|------------|----------------------------------------|\n| **@WebMvcTest** | **Web** layer, **MockMvc**, controllers | You miss **repository** or **security** bugs that only appear with real beans |\n| **@DataJpaTest** | **JPA**, **DataSource**, repositories | You miss **web** **JSON** issues because **HTTP** stack never started |\n| **@SpringBootTest** | Entire application context | **CI** time explodes; flakes multiply from unrelated beans |\n\nPick the smallest context that still covers the failure class you fear.',
      'Staff candidates defend their choice with a risk sentence, not with "we always use full boot".'
    ),
    T(
      'Numbered sequence — debug a failing Spring test context',
      '1. Run **mvn** **-Dtest=BrokenIT** **-e** **test** and capture the first **Caused** **by** line.\n2. If **Testcontainers** is involved, run **docker** **ps** while the test runs to see containers and **Ryuk**.\n3. If the hang is after **Starting** **PostgreSQL** **container**, check registry auth and **CI** **Docker** socket mounts.\n4. For **UnsatisfiedDependencyException**, list missing types and either add **@Import** or switch to a broader test on purpose.\n5. If **Metaspace** grows, enable **spring.test.context.cache.maxSize** logging or split suites.\n6. When the worker is stuck, run **jcmd** **<pid>** **Thread.print** and look for **spring** **context** refresh threads.\n\nThis ladder keeps blame away from "the framework is random".',
      'Interviewers reward a reproducible sequence instead of rerunning the whole suite blindly.'
    ),
    T(
      'Common Spring test mistakes that look like product bugs',
      'Forgetting **@AutoConfigureMockMvc** when you need a **MockMvc** bean, using **@MockBean** to paper over a missing **@Service** registration, or assuming **@Transactional** rollback proves distributed transactions work. **ApplicationContext** failures often show **BeanCreationException** wrapped twice, which scares juniors who think the database is down when the wiring is wrong.',
      'Strong answers map stack traces to slice boundaries and bean graphs.'
    ),
    T(
      'Choosing between MockMvc slice and TestRestTemplate black box',
      '**MockMvc** stays in-process and is fastest for controller mapping, status codes, and **jsonPath** assertions. **TestRestTemplate** or **WebTestClient** with **RANDOM_PORT** starts a real port and exercises the full **Servlet** stack including filters you forgot to import in **@WebMvcTest**. **Testcontainers** belongs when the question involves real **SQL**, **Kafka** protocols, or file systems your fakes do not mimic.',
      'Tech leads should say when to pay the **Docker** tax versus when **MockMvc** is enough.'
    ),
    T(
      'What to check in code review for Spring tests',
      'Reject **@SpringBootTest** without a comment when **@WebMvcTest** would do. Require **assertions** on response body or persistence side effects, not only **isOk**(). Flag static **GenericContainer** fields without reuse strategy. Ask for **@Sql** or schema cleanup when integration tests share one database container.',
      'Review quality predicts whether **CI** stays under twenty minutes or becomes a morale problem.'
    ),
    T(
      'How to explain Testcontainers cost to a stakeholder',
      'Say **Docker**-backed tests cost **CI** minutes and **CPU** but prevent classes of production defects that mocks cannot see. Offer numbers: slice suite under five minutes, one **Testcontainers** module under twelve. Tie the decision to customer-visible outages from bad migrations or wrong isolation level, not to tech fashion.',
      'Leaders want schedule impact and defect class, not framework cheerleading.'
    ),
    T(
      'Tool commands when a Spring or container test fails',
      '| Command | What you learn |\n|---------|----------------|\n| **docker** **ps** **--format** **table** | Running **Testcontainers** and **Ryuk** sidecars |\n| **mvn** **-Dtest=MyIT** **-X** **test** | **Spring** **DEBUG** wiring during context startup |\n| **jcmd** **<pid>** **VM.native_memory** **summary** | Native memory pressure from many contexts |\n',
      'Interviewers reward naming **docker** **ps** beside **mvn**, not only **println** debugging.'
    ),
    T(
      'What the JVM holds while Spring Test and Docker run',
      'Each **ApplicationContext** caches **bean** **metadata** in **Metaspace** and **heap** for singletons. **Testcontainers** uses **Netty** and **Docker** **HTTP** clients in your test **JVM**. Under many parallel modules, you can hit **OutOfMemoryError** **Metaspace** or native **RSS** limits in **Kubernetes** **CI** pods before **Spring** even finishes refreshing.',
      'Staff engineers separate **heap** limits from **container** **cgroup** limits when triaging OOM in tests.'
    ),
    T(
      'The command you run when the test JVM hangs after containers start',
      'Use **jps** **-l** to find the **Surefire** worker, then **jcmd** **<pid>** **Thread.print**. Look for threads blocked on **docker** **pull**, **Ryuk** connection, or **spring** **context** refresh. Pair with **docker** **logs** **<containerId>** if **PostgreSQL** fails migrations inside the container.',
      'On-call credibility is showing thread names, not guessing "Docker is slow today".'
    ),
    T(
      'How Java 11, 17, and 21 interact with Spring Boot 3 testing',
      '| **Java** | Spring testing note |\n|----------|---------------------|\n| **11** | Still common on older **Boot** **2** shops; watch **JPMS** **add-opens** for agents |\n| **17** | **Spring** **Boot** **3** baseline; **records** in **DTO** tests need correct **JSON** mappers |\n| **21** | Virtual threads change assumptions in tests that pin thread pools; align **@EnabledIf** feature checks |\n\nRun **CI** on the same **LTS** line you deploy.',
      'Version answers should mention **Boot** **3** **Java** **17** minimum, not only "we use modern Java".'
    ),
    T(
      'Architecture guardrail for Testcontainers at scale',
      'Use one abstract base class or **JUnit** **5** extension that owns container lifecycle, enables **reuse** **mode** where safe, and documents image tags per **CPU** architecture. Centralize **@DynamicPropertySource** so fifty services do not each invent a different **JDBC** URL format. This stops **CI** from pulling fifty different **postgres** patch versions.',
      'Architects listen for reuse, image pinning, and **ARM** **CI** parity.'
    ),
    T(
      '60-second interview story',
      '**Spring** slice tests keep feedback fast while **Testcontainers** proves real database and broker behavior. Wrong slices give **UnsatisfiedDependencyException** or green tests that miss **JSON** and **SQL** gaps. In design review you pick **@WebMvcTest**, **@DataJpaTest**, or full **@SpringBootTest** with intent. When **CI** fails only on agents, you check **Docker** socket access, **Ryuk**, and **jcmd** **Thread.print** on stuck workers.',
      'This subsection is the elevator answer tying slice choice, containers, and commands.'
    ),
    T(
      'Satyverse drill — tie-down',
      'Add **src/test/java/arch/day86/DrillIT.java** with **@SpringBootTest** and a **static** **PostgreSQLContainer** from **Testcontainers** (or follow your company template). Register **spring.datasource.url** via **@DynamicPropertySource**. Run **mvn** **-q** **-Dtest=DrillIT** **test**. While it runs, execute **docker** **ps** in another terminal and confirm the **postgres** container row. Stop the test and confirm containers disappear.',
      'Interviewers like people who have watched **docker** **ps** during a test, not only read docs.'
    )
  ];
  return parts.join('\n\n');
}

function buildBasicCode() {
  const code = `package arch.day86;

/**
 * Fresher reference card: Spring slice tests + Testcontainers (println only).
 */
public class Day86Basic {

    public static void main(String[] args) {
        // Week one: learn which annotation loads which beans before you cargo-cult @SpringBootTest.
        System.out.println("=== Core Spring test slices ===");
        System.out.println("@WebMvcTest     | Loads web layer + MockMvc; not your whole DataSource");
        System.out.println("@DataJpaTest    | Loads JPA + repositories; embedded or TC database");
        System.out.println("@SpringBootTest | Full ApplicationContext; slowest, closest to prod");
        System.out.println("@MockBean       | Replaces a bean in the test context with a Mockito mock");
        System.out.println("Testcontainers  | Real Postgres/Kafka in Docker during the test JVM");
        System.out.println();

        // Tie commands to what you actually type when CI disagrees with the IDE.
        System.out.println("=== Commands you actually run ===");
        System.out.println("mvn -Dtest=OrderControllerTest test     -> one Spring test class");
        System.out.println("mvn -Dtest=OrderIT test                 -> integration test suffix IT");
        System.out.println("docker ps                                -> see Testcontainers + Ryuk rows");
        System.out.println("./mvnw -v && docker version              -> prove CI has Maven + Docker");
        System.out.println();

        // These stack traces look like prod is down; usually it is slice or Docker wiring.
        System.out.println("=== Beginner errors and messages ===");
        System.out.println("UnsatisfiedDependencyException -> bean missing from slice; add @Import or @MockBean");
        System.out.println("IllegalStateException Docker   -> CI cannot reach Docker socket or Ryuk blocked");
        System.out.println("Failed to load ApplicationContext -> read first Caused by; often Flyway or JDBC URL");
        System.out.println("404 on MockMvc -> missing @Controller or wrong @WebMvcTest scope");
        System.out.println();

        // One sentence you want tattooed on the inside of your eyelids before code review.
        System.out.println("=== Remember this ===");
        System.out.println("Pick the smallest Spring context that still scares you about the code you changed.");
        System.out.println();
        // MockMvc is the fastest HTTP feedback loop when you only care about the controller contract.
        System.out.println("=== MockMvc building blocks ===");
        System.out.println("mockMvc.perform(get(...)) -> in-memory HTTP; andExpect(status/jsonPath(...))");
    }
}`;
  const output = `=== Core Spring test slices ===
@WebMvcTest     | Loads web layer + MockMvc; not your whole DataSource
@DataJpaTest    | Loads JPA + repositories; embedded or TC database
@SpringBootTest | Full ApplicationContext; slowest, closest to prod
@MockBean       | Replaces a bean in the test context with a Mockito mock
Testcontainers  | Real Postgres/Kafka in Docker during the test JVM

=== Commands you actually run ===
mvn -Dtest=OrderControllerTest test     -> one Spring test class
mvn -Dtest=OrderIT test                 -> integration test suffix IT
docker ps                                -> see Testcontainers + Ryuk rows
./mvnw -v && docker version              -> prove CI has Maven + Docker

=== Beginner errors and messages ===
UnsatisfiedDependencyException -> bean missing from slice; add @Import or @MockBean
IllegalStateException Docker   -> CI cannot reach Docker socket or Ryuk blocked
Failed to load ApplicationContext -> read first Caused by; often Flyway or JDBC URL
404 on MockMvc -> missing @Controller or wrong @WebMvcTest scope

=== Remember this ===
Pick the smallest Spring context that still scares you about the code you changed.

=== MockMvc building blocks ===
mockMvc.perform(get(...)) -> in-memory HTTP; andExpect(status/jsonPath(...))
`;
  return { code, output };
}

function buildMidCode() {
  const code = `package arch.day86;

/**
 * Four Spring / Testcontainers scenarios a senior engineer narrates in review.
 */
public class Day86Intermediate {

    static void scenario1() {
        // First @WebMvcTest: easy to forget the service bean exists in prod but not in the slice.
        System.out.println("--- Scenario 1: @WebMvcTest throws UnsatisfiedDependencyException on first PR ---");
        System.out.println("symptom:  test fails before MockMvc runs; stack mentions missing OrderService bean");
        System.out.println("cause:    slice did not import the @Service your @Controller injects");
        System.out.println("why:      @WebMvcTest only auto-configures web layer beans by default");
        System.out.println("fix:      add @MockBean OrderService or @Import(TestConfig.class) intentionally");
        System.out.println("verify:   mvn -Dtest=OrderControllerTest -e test shows context refresh success");
        System.out.println("next:     grep @Autowired fields on controller and list each collaborator");
        System.out.println();
    }

    static void scenario2() {
        // Production: H2 green, Postgres red — classic Testcontainers motivation.
        System.out.println("--- Scenario 2: staging 23514 check violation while H2 tests stayed green ---");
        System.out.println("symptom:  Flyway applies but insert fails only in staging Postgres");
        System.out.println("cause:    H2 compatibility mode never enforced the real CHECK constraint");
        System.out.println("why:      SQL dialect and constraint validation differ from real engine");
        System.out.println("fix:      add @SpringBootTest + PostgreSQLContainer + @DynamicPropertySource");
        System.out.println("verify:   mvn -Dtest=OrderRepositoryIT test; docker ps shows postgres row");
        System.out.println("next:     jcmd <pid> Thread.print if context hangs after container start");
        System.out.println();
    }

    static void scenario3() {
        // Performance: CI melts when every class starts its own container.
        System.out.println("--- Scenario 3: CI test job jumped from 9 minutes to 47 minutes ---");
        System.out.println("symptom:  agents pull postgres image dozens of times per build");
        System.out.println("cause:    new PostgreSQLContainer() in @BeforeEach without reuse");
        System.out.println("why:      each test method paid Docker startup and JDBC wait");
        System.out.println("fix:      static container field with start() once + reuse enable or singleton base");
        System.out.println("verify:   docker ps during suite: one long-lived postgres not fifty");
        System.out.println("next:     jcmd <pid> GC.heap_info if Metaspace spikes from many contexts");
        System.out.println();
    }

    static void scenario4() {
        // Architecture: standardize how fifty services mount Docker in CI.
        System.out.println("--- Scenario 4: platform mandates Docker socket but Ryuk is blocked ---");
        System.out.println("symptom:  IllegalStateException Could not find valid Docker environment on CI only");
        System.out.println("cause:    pod security policy blocked sidecar or TCP to Docker daemon");
        System.out.println("why:      Testcontainers needs Ryuk or explicit reuse strategy to reap containers");
        System.out.println("fix:      enable privileged DinD runner or TESTCONTAINERS_RYUK_DISABLED with cleanup job");
        System.out.println("verify:   docker ps on agent during failing job; kubectl describe pod for mounts");
        System.out.println("next:     document image digests for ARM vs x86 in pipeline matrix");
        System.out.println();
    }

    public static void main(String[] args) {
        // Header helps you find this output inside noisy CI logs or IDE runs.
        System.out.println("=== Day86Intermediate: four Spring / Testcontainers war stories ===");
        System.out.println("Tip: run with mvn -Dtest=Day86Intermediate test from the module root.");
        System.out.println("Each scenario names a diagnostic command you can paste into runbooks.");
        System.out.println("If a line mentions Docker, validate the agent before you change Java code.");
        System.out.println();
        scenario1();
        scenario2();
        scenario3();
        scenario4();
        System.out.println("=== End of scenario pack ===");
        System.out.println("When escalating, attach Surefire XML, docker ps, and JDK versions.");
    }
}`;
  const output = `=== Day86Intermediate: four Spring / Testcontainers war stories ===
Tip: run with mvn -Dtest=Day86Intermediate test from the module root.
Each scenario names a diagnostic command you can paste into runbooks.
If a line mentions Docker, validate the agent before you change Java code.

--- Scenario 1: @WebMvcTest throws UnsatisfiedDependencyException on first PR ---
symptom:  test fails before MockMvc runs; stack mentions missing OrderService bean
cause:    slice did not import the @Service your @Controller injects
why:      @WebMvcTest only auto-configures web layer beans by default
fix:      add @MockBean OrderService or @Import(TestConfig.class) intentionally
verify:   mvn -Dtest=OrderControllerTest -e test shows context refresh success
next:     grep @Autowired fields on controller and list each collaborator

--- Scenario 2: staging 23514 check violation while H2 tests stayed green ---
symptom:  Flyway applies but insert fails only in staging Postgres
cause:    H2 compatibility mode never enforced the real CHECK constraint
why:      SQL dialect and constraint validation differ from real engine
fix:      add @SpringBootTest + PostgreSQLContainer + @DynamicPropertySource
verify:   mvn -Dtest=OrderRepositoryIT test; docker ps shows postgres row
next:     jcmd <pid> Thread.print if context hangs after container start

--- Scenario 3: CI test job jumped from 9 minutes to 47 minutes ---
symptom:  agents pull postgres image dozens of times per build
cause:    new PostgreSQLContainer() in @BeforeEach without reuse
why:      each test method paid Docker startup and JDBC wait
fix:      static container field with start() once + reuse enable or singleton base
verify:   docker ps during suite: one long-lived postgres not fifty
next:     jcmd <pid> GC.heap_info if Metaspace spikes from many contexts

--- Scenario 4: platform mandates Docker socket but Ryuk is blocked ---
symptom:  IllegalStateException Could not find valid Docker environment on CI only
cause:    pod security policy blocked sidecar or TCP to Docker daemon
why:      Testcontainers needs Ryuk or explicit reuse strategy to reap containers
fix:      enable privileged DinD runner or TESTCONTAINERS_RYUK_DISABLED with cleanup job
verify:   docker ps on agent during failing job; kubectl describe pod for mounts
next:     document image digests for ARM vs x86 in pipeline matrix

=== End of scenario pack ===
When escalating, attach Surefire XML, docker ps, and JDK versions.
`;
  return { code, output };
}

function buildAdvCode() {
  const code = `package arch.day86;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Tech lead triage: Spring context + Testcontainers incidents without live I/O.
 * Blocks: signals from CI, map pattern to fix vocabulary, checklist, ordered response.
 */
public class Day86Advanced {

    record Signal(String name, boolean contextFail, boolean dockerFail, boolean slowPull) {}

    public static void main(String[] args) {
        // Block 1 mirrors what you grep from Surefire + pipeline logs before guessing code.
        System.out.println("=== Block 1: collect signals from logs ===");
        List<Signal> signals = List.of(
            new Signal("build-2201", true, false, false),
            new Signal("build-2202", false, true, false),
            new Signal("build-2203", false, false, true)
        );
        for (Signal s : signals) {
            System.out.println(s.name() + " contextFail=" + s.contextFail()
                + " dockerFail=" + s.dockerFail() + " slowPull=" + s.slowPull());
        }
        System.out.println();

        // Block 2 names the fix pattern your platform team already documents.
        System.out.println("=== Block 2: map signal to first action ===");
        Map<String, String> action = new LinkedHashMap<>();
        action.put("context_fail", "read first Caused by; fix slice imports or @MockBean gaps");
        action.put("docker_fail", "validate Docker socket on agent; check Ryuk and registry auth");
        action.put("slow_pull", "pin image digest; enable layer cache; reuse static container");
        for (Map.Entry<String, String> e : action.entrySet()) {
            System.out.println("pattern " + e.getKey() + " -> " + e.getValue());
        }
        System.out.println();

        // Block 3 is the paste-ready triage table for Slack incidents.
        System.out.println("=== Block 3: on-call checklist table ===");
        Map<String, String> table = new LinkedHashMap<>();
        table.put("UnsatisfiedDependencyException", "mvn -Dtest=... -e test; list missing bean type");
        table.put("IllegalStateException Docker", "docker ps; kubectl describe pod; testcontainers.properties");
        table.put("ApplicationContext timeout", "jcmd <pid> Thread.print; reduce @SpringBootTest count");
        for (Map.Entry<String, String> e : table.entrySet()) {
            System.out.println(e.getKey() + " | " + e.getValue());
        }
        System.out.println();
        System.out.println("=== Block 4: recommended order of operations ===");
        System.out.println("1) reproduce single IT with mvn -Dtest=ClassIT test");
        System.out.println("2) run docker ps during failure window");
        System.out.println("3) if JVM hangs after container healthy: jcmd <pid> Thread.print");
        System.out.println("4) only then widen to full module or parallel matrix");
        // Done: attach this block output beside Surefire XML and docker ps in ticket.
        //
        //
        //
    }
}`;
  const output = `=== Block 1: collect signals from logs ===
build-2201 contextFail=true dockerFail=false slowPull=false
build-2202 contextFail=false dockerFail=true slowPull=false
build-2203 contextFail=false dockerFail=false slowPull=true

=== Block 2: map signal to first action ===
pattern context_fail -> read first Caused by; fix slice imports or @MockBean gaps
pattern docker_fail -> validate Docker socket on agent; check Ryuk and registry auth
pattern slow_pull -> pin image digest; enable layer cache; reuse static container

=== Block 3: on-call checklist table ===
UnsatisfiedDependencyException | mvn -Dtest=... -e test; list missing bean type
IllegalStateException Docker | docker ps; kubectl describe pod; testcontainers.properties
ApplicationContext timeout | jcmd <pid> Thread.print; reduce @SpringBootTest count

=== Block 4: recommended order of operations ===
1) reproduce single IT with mvn -Dtest=ClassIT test
2) run docker ps during failure window
3) if JVM hangs after container healthy: jcmd <pid> Thread.print
4) only then widen to full module or parallel matrix
`;
  return { code, output };
}

const PITFALLS = [
  'Using **@WebMvcTest** without **@AutoConfigureMockMvc** when your test **@Autowired** **MockMvc** — the field stays **null** and the next line throws **NullPointerException** before any **HTTP** call; add **@AutoConfigureMockMvc** or inject **MockMvc** via constructor; verify with **mvn** **-Dtest=YourControllerTest** **test** and a breakpoint on the field.',
  'Putting **@SpringBootTest** on every class because it "always works" — **CI** balloons to hours and developers skip the suite; replace with **@WebMvcTest** or **@DataJpaTest** where possible; verify by timing **mvn** **test** before and after and keeping module under fifteen minutes.',
  'Letting **@MockBean** replace collaborators without a comment — missing **@Service** beans ship because tests never loaded the real wiring; require ticket reference on each **@MockBean** in slice tests; verify with **ArchUnit** import or review checklist grep.',
  'Running **Testcontainers** suites with no **Docker** layer cache in **CI** — every build pulls multi-gig images and queues behind rate limits; pin digests and enable remote cache; verify **docker** **images** **ls** and pipeline cache hit metrics week over week.',
  'Disabling **Ryuk** globally to "speed up tests" without a cleanup job — zombie containers exhaust disk on shared agents; re-enable **Ryuk** or add explicit **teardown** in pipeline; verify **docker** **system** **df** on agents after a full suite.',
  'Starting a fresh **PostgreSQLContainer** per **@Test** method across two hundred tests — **Metaspace** and native threads spike and **Kubernetes** **OOMKills** the pod; move to **static** **container** with reuse; verify **jcmd** **<pid>** **GC.heap_info** and **docker** **ps** count mid-suite.',
  'Relying on **@Transactional** rollback in integration tests to prove distributed behavior — production uses separate connections and retries that tests never exercise; add at least one test without rollback or use **Testcontainers** with explicit commit; verify by reading **PostgreSQL** **logs** for **COMMIT** during the test.',
  'Ignoring **ARM** **CI** agents while image tags point to **amd64**-only layers — tests pass on **Mac** **M** laptops with emulation quirks but fail on Linux **ARM** runners; publish multi-arch manifests or per-arch tags; verify **docker** **manifest** **inspect** in pipeline and matrix both architectures.'
];

function fuProd() {
  return {
    question: 'How does **Spring** **testing** or **Testcontainers** show up in **production** or **CI** incidents?',
    answer:
      'Your **GitHub** **Actions** job fails with **IllegalStateException** about **Docker** while laptops stay green because the runner lacks a socket mount. You reproduce with **mvn** **-Dtest=OrderIT** **test** on a matching agent, capture **docker** **ps** during the run, and open **target/surefire-reports**. You align **Testcontainers** **properties** with platform **Kubernetes** **securityContext** before blaming application code.'
  };
}

function fuTrap() {
  return {
    question: 'What is a common trap people believe about **@SpringBootTest**?',
    answer:
      'People think full boot is the only "real" test. It hides whether your **@WebMvcTest** slice is wired because everything is always present. Prefer the smallest context that fails when you delete a **@Bean**. Trap fix: default to slices, reserve **@SpringBootTest** for narrow integration paths with **Testcontainers**.'
  };
}

function ca(core, err, cmd, ver) {
  const tail =
    ' Teams still get burned when **CI** **Docker** **daemon** version differs from laptops, so **Testcontainers** **Ryuk** behavior and image pull policies diverge. Capture **docker** **version** beside **./mvnw** **-v** from the build image. When **ApplicationContext** hangs, **jcmd** **<pid>** **Thread.print** shows threads stuck in **spring** **context** refresh or **Netty** **Docker** **HTTP** waits. **Spring** **Boot** **3** on **Java** **17** changed default **AOT**-related test hints while **JUnit** **5.10** refined parallel defaults that interact with shared **static** containers.';
  return `${core} At the **JVM** level **Surefire** forks a worker, **Spring** builds an **ApplicationContext** graph in **heap** and **Metaspace**, and **Testcontainers** opens **TCP** to **Docker**. ${err} You shorten mean time to clue with ${cmd}. ${ver}${tail}`;
}

const CONCEPTUAL_Q = [
  ['What is **@WebMvcTest**?', '**@WebMvcTest** tells **Spring** **Test** to build a small **ApplicationContext** focused on **web** **MVC** pieces such as **Controller** beans and **MockMvc**, not your entire **@SpringBootApplication** graph.', '**UnsatisfiedDependencyException** appears when a **@Controller** needs a **@Service** the slice did not load.', '**mvn** **-Dtest=OrderControllerTest** **-e** **test** shows the **BeanCreationException** chain.', '**Spring** **Boot** **3** tightened default **security** auto-config in tests compared with **Boot** **2**.'],
  ['What does **MockMvc** do?', '**MockMvc** sends fake **HTTP** requests through the **DispatcherServlet** in the same **JVM** without opening a real port.', 'You can get **404** even when production works if you forgot to register the **@Controller** under test.', '**mockMvc.perform(get(...))** failures show up as **NestedServletException** in **Surefire** **XML**.', '**Java** **21** **virtual** threads do not change **MockMvc** itself but can affect async handlers you test with **asyncDispatch**.'],
  ['What is **@DataJpaTest**?', '**@DataJpaTest** loads **JPA** infrastructure such as **EntityManager** and repositories, usually with an in-memory or **Testcontainers** database.', '**DataIntegrityViolationException** in **PostgreSQL** may never appear on **H2** with loose compatibility.', '**mvn** **-Dtest=OrderRepositoryTest** **test** plus **docker** **ps** confirms **Testcontainers** path.', '**Spring** **Boot** **3** uses **Hibernate** **6** dialect detection that differs from **Boot** **2**.'],
  ['What is **Testcontainers** in one sentence?', '**Testcontainers** is a **Java** library that talks to **Docker** and starts disposable real databases or brokers for tests.', '**IllegalStateException** about **Docker** environment means **CI** cannot see the daemon socket.', '**docker** **ps** during **mvn** **test** proves containers actually started.', '**Testcontainers** **1.19**+ improved **ARM** defaults; older lines needed explicit image platform hints.'],
  ['What is **@DynamicPropertySource**?', 'It is a static method that adds **spring.datasource.url** and friends into the **Environment** before the **ApplicationContext** refreshes.', 'Wrong ordering with **static** fields can leave **jdbc:tc:** pointing at **localhost:0**.', '**mvn** **-Dspring-boot.run.arguments=--debug** style logging or **@TestPropertySource** overrides help bisect.', '**Spring** **Boot** **3.1** introduced **ServiceConnection** style helpers that reduce boilerplate versus raw **@DynamicPropertySource**.'],
  ['**@MockBean** versus **@Mock** in a unit test?', '**@MockBean** replaces a **Spring** **bean** in the test **ApplicationContext**; **@Mock** with **Mockito** is for plain unit tests without **Spring**.', 'Overusing **@MockBean** hides missing **@Component** scanning in production.', '**mvn** **-Dtest=...** with **logging.level.org.springframework.test.context=DEBUG** shows bean replacement.', '**Spring** **Boot** **3** test slices still honor **@MockBean** but fail faster when **AOT** processing is enabled for native builds.'],
  ['What is **@SpringBootTest**?', 'It loads the full application context similar to production unless you narrow it with attributes.', '**ApplicationContext** **failure** **threshold** **exceeded** when one misconfigured **@Bean** breaks every integration test.', '**jcmd** **<pid>** **Thread.print** shows stuck refresh threads on huge contexts.', '**Java** **17** **Metaspace** pressure grows faster with **Spring** **Boot** **3** due to additional auto-configuration classes.'],
  ['How does **TestRestTemplate** differ from **MockMvc**?', '**TestRestTemplate** hits a real listening port with **RANDOM_PORT**, exercising filters and serialization closer to prod.', 'You miss servlet filter bugs if you only used **MockMvc** without importing security.', '**curl** **-v** **http://localhost:${local.server.port}/health** during **@SpringBootTest** proves wiring.', '**Spring** **Boot** **3** prefers **WebTestClient** for **WebFlux** stacks alongside the same port idea.'],
  ['What is context caching in **Spring** **Test**?', '**Spring** reuses **ApplicationContext** instances across test classes when configuration matches a cache key.', 'Mismatched **@MockBean** declarations break cache reuse and slow **CI** dramatically.', '**logging.level.org.springframework.test.context.cache=DEBUG** reveals cache hits.', '**Spring** **Framework** **6** refined cache key computation for **@DynamicPropertySource** methods.'],
  ['How do you test **async** controllers?', 'Use **MockMvc** **asyncDispatch** or **Awaitility** to wait until the **DeferredResult** completes.', 'Flaky **status** assertions happen when you assert before dispatch finishes.', '**mvn** **-Dtest=...** with **repeat** **count** in **IDE** exposes ordering.', '**Java** **21** **virtual** threads change thread-local usage in some **Spring** **MVC** async paths.'],
  ['What is **@Sql** used for?', '**@Sql** runs **SQL** scripts against the **DataSource** before or after tests.', 'Scripts can hide the fact that **Flyway** migrations are wrong if you bypass them.', '**mvn** **-Dtest=...** plus database logs show which script failed.', '**Spring** **Boot** **3** still supports **@Sql** on **slice** tests with a live **DataSource**.'],
  ['What breaks when **Docker** is not on **CI**?', '**Testcontainers** cannot start **PostgreSQLContainer**, so integration tests fail immediately.', 'The error looks like "build broken" but it is infrastructure.', '**docker** **info** on the agent is the fastest proof.', '**Testcontainers** **cloud** or **podman** compatibility varies by version; **Java** **17** test **JVM** is unaffected but daemon path differs.'],
  ['What is **Ryuk**?', '**Ryuk** is a **Testcontainers** sidecar that removes containers after the **JVM** exits.', 'Disabling it without cleanup leaks containers until disks fill.', '**docker** **ps** **-a** after suite shows zombies when **Ryuk** failed.', '**Spring** docs do not own **Ryuk**; it is pure **Testcontainers** lifecycle policy.'],
  ['How do **profiles** affect tests?', '**@ActiveProfiles** switches beans such as **DataSource** or **feature** flags for tests.', 'Wrong profile loads **mock** beans in **CI** that production never uses.', '**mvn** **-Dspring.profiles.active=test** must match test assumptions.', '**Spring** **Boot** **3** **native** image tests often need explicit **@ActiveProfiles** for **AOT** hints.'],
  ['What is the **failsafe** plugin for?', '**Maven** **Failsafe** runs integration tests in **verify** phase, often with **IT** suffix classes.', 'Accidentally running heavy **IT** classes with **Surefire** only can skip them.', '**mvn** **verify** **-X** shows which plugin forked which tests.', '**Java** **17** **toolchain** applies to **Failsafe** forks the same as **Surefire**.'],
  ['How do you speed up **Testcontainers** **CI**?', 'Reuse static containers, pin images, cache layers, and parallelize modules carefully.', 'Blind parallelism with one **Docker** daemon creates pull storms.', '**docker** **system** **df** shows whether cache is working.', '**Testcontainers** reuse mode plus **Spring** **Boot** **3** **test** **junit** extensions are common in **Java** **17** shops.'],
  ['What is **@Import** in tests?', '**@Import** pulls extra **@Configuration** classes into a slice test context.', 'Forgetting **@Import** for a small **@TestConfiguration** yields **UnsatisfiedDependencyException**.', '**mvn** **-Dtest=...** **-e** prints the missing type name.', '**Spring** **Framework** **6** **@Configuration** proxy behavior still applies inside tests.'],
  ['How do **Flyway** and **Testcontainers** interact?', '**Flyway** runs migrations against the **DataSource** **Testcontainers** exposes, so real **SQL** errors surface.', '**Migration** **ValidationException** means your test schema drifted from prod scripts.', '**mvn** **-Dtest=...** with **logging.level.org.flywaydb=DEBUG** shows statements.', '**Spring** **Boot** **3** defaults to **Flyway** **9**+ which stricter validates **PostgreSQL** constructs than older lines.']
];

function buildConceptual() {
  return CONCEPTUAL_Q.map(([q, a1, e2, c3, v4], i) => ({
    question: q,
    answer: ca(a1, e2, c3, v4),
    followUps: [fuProd(), fuTrap()]
  }));
}

const CB_QUESTIONS = [
  'What prints?\n```java\nclass P {\n  public static void main(String[] a) {\n    String u = "jdbc:postgresql://localhost:5432/db";\n    System.out.println(u.contains("tc:") ? "tc" : "plain");\n  }\n}\n```',
  'Conceptual: wrong slice symptom?\n```java\n// @WebMvcTest on class that @Autowired JdbcTemplate\n```',
  'Output?\n```java\nclass Q {\n  public static void main(String[] a) {\n    int p = 0;\n    try { p = Integer.parseInt("5432"); } catch (NumberFormatException e) { p = -1; }\n    System.out.println(p > 0 ? "port" : "bad");\n  }\n}\n```',
  'What is wrong?\n```java\n// @DynamicPropertySource void props(DynamicPropertyRegistry r) {\n//   r.add("spring.datasource.url", () -> container.getJdbcUrl());\n// } // instance method on non-static inner class\n```',
  'Thread safety smell?\n```java\nclass R { static int started;\n  static void mark() { started++; }\n}\n```',
  'Order of execution?\n```java\nclass S {\n  static String step = "";\n  static { step += "A"; }\n  static { step += "B"; }\n  public static void main(String[] a) { System.out.println(step); }\n}\n```',
  'Docker string check?\n```java\nclass T {\n  public static void main(String[] a) {\n    String h = System.getenv("DOCKER_HOST");\n    System.out.println(h == null ? "default" : "custom");\n  }\n}\n```',
  'Integration hint?\n```java\n// @SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)\n```',
  'What prints?\n```java\nclass U {\n  public static void main(String[] a) {\n    boolean reuse = Boolean.parseBoolean(System.getProperty("tc.reuse", "false"));\n    System.out.println(reuse);\n  }\n}\n```',
  'JSON path idea?\n```java\n// mockMvc.perform(get("/api/1")).andExpect(jsonPath("$.id").value(1));\n```',
  'Classpath note?\n```java\n// spring-boot-starter-test brings JUnit 5 + AssertJ + Mockito\n```',
  'Flyway flag?\n```java\n// spring.flyway.enabled=false in test profile sometimes\n```'
];

const CB_TAIL =
  ' **Spring** **Test** still builds a real **ApplicationContext** graph in **Metaspace**, so dozens of **@SpringBootTest** classes multiply **class** metadata. Cross-check **JDK** **17** **toolchain** with **Spring** **Boot** **3** **BOM** because mismatched **bytecode** levels show as **NoSuchMethodError** in **CI**. When **Testcontainers** is involved, run **docker** **ps** beside **mvn** **-v** before you blame SQL.';

function cbAns(i) {
  const bodies = [
    'The string has no **tc:** prefix, so **contains** is false and **println** prints **plain**. Real **Testcontainers** **JDBC** URLs often embed **tc:** so **Spring** can route to the container. Production risk is hard-coding **localhost** ports that collide on shared **CI** agents. **docker** **port** mappings are random unless you read **getMappedPort**. **Java** **17** does not change string behavior here.',
    '**@WebMvcTest** does not load **DataSource** auto-config by default, so **JdbcTemplate** is missing and **UnsatisfiedDependencyException** appears during context refresh. The **JVM** never reaches your **@Test** body. Fix by switching to **@DataJpaTest**/**@SpringBootTest** or **@MockBean** the template intentionally. **mvn** **-Dtest=...** **-e** prints the missing bean type. **Spring** **Boot** **3** keeps this slice boundary strict.',
    '**parseInt** succeeds for **5432**, so **p** is positive and **println** prints **port**. This mirrors checking a mapped **Docker** port before building **spring.datasource.url**. If parsing fails you should fail fast instead of connecting to **0**. **javap** is unnecessary; **Surefire** shows bad config quickly. **Java** **11**+ **parseInt** behavior is unchanged.',
    '**@DynamicPropertySource** methods must be **static** and live on a class **Spring** can register; a non-static inner class method is not valid, so properties never wire and **DataSource** fails. The **JVM** throws **IllegalStateException** during test bootstrap. Move method to outer class or make it **static**. **Spring** **Framework** **6** docs repeat this rule. **Boot** **3.1** **ServiceConnection** avoids some boilerplate.',
    'A **static** **int** mutated from tests is unsafe under **parallel** **Surefire** or shared contexts; counts race and flake. Prefer instance fields or **ThreadLocal** controlled fakes. **jcmd** **Thread.print** shows races under load. **Java** **21** **virtual** threads increase concurrency surface if tests pin shared statics.',
    '**static** blocks run in source order when the class initializes, so **step** becomes **AB** and **println** prints **AB**. This mirrors **Testcontainers** **static** container fields that must initialize once before **Spring** reads properties. Wrong order yields **null** **jdbc** URLs. **Spring** **Test** context cache also depends on deterministic configuration keys.',
    'When **DOCKER_HOST** is unset, **getenv** returns **null** and **println** prints **default**. **Testcontainers** uses env vars and **/.testcontainers.properties** to find the daemon. **CI** often sets **DOCKER_HOST** to **tcp:** socket. **docker** **context** **ls** on the agent confirms. **Java** **17** reads env the same as older releases.',
    '**RANDOM_PORT** starts an embedded server on a random **TCP** port so **TestRestTemplate** exercises real **HTTP** parsing. Without it, **MockMvc** in-memory path differs from filter ordering in prod. **curl** against **local.server.port** confirms. **Spring** **Boot** **3** still supports this pattern on **Java** **17**.',
    '**Boolean.parseBoolean** only treats **"true"** case-insensitive as true; default property **false** prints **false**. **Testcontainers** reuse is opt-in via properties or environment. Turning reuse on without **Ryuk** cleanup policy risks leaked containers. **docker** **ps** after suite verifies. **Java** **21** system properties behave the same.',
    '**jsonPath** asserts **JSON** payload fields on **MockMvc** results without starting a browser. If **ObjectMapper** modules differ from prod, assertions pass while prod fails with **HttpMessageNotReadableException**. Add **@JsonTest** or slice that loads real mapper beans. **Spring** **Boot** **3** **Jackson** defaults differ slightly from **2**.',
    '**spring-boot-starter-test** pulls **JUnit** **5**, **AssertJ**, and **Mockito** onto the **test** **classpath** so slice tests compile. Missing starter yields **cannot find symbol** for **@SpringBootTest**. **mvn** **dependency:tree** **-Dscope=test** confirms. **Java** **17** **module** path rarely affects classic **classpath** tests.',
    'Disabling **Flyway** in tests lets you seed schema manually, but you can miss migration bugs; production still runs **Flyway**. Prefer **Testcontainers** plus real **Flyway** in **IT** classes. **mvn** **-Dtest=*IT** **verify** uses **Failsafe** when configured. **Spring** **Boot** **3** **Flyway** **9** validates **SQL** stricter.'
  ];
  return (bodies[i] || bodies[0]) + CB_TAIL;
}

function buildCodeBased() {
  return CB_QUESTIONS.map((q, i) => ({
    question: q,
    answer: cbAns(i),
    followUps: [
      { question: 'What breaks in **CI** if you ignore this behavior?', answer: fuProd().answer },
      { question: 'What **Spring** slice trap does this expose?', answer: fuTrap().answer }
    ]
  }));
}

function senior(q, body) {
  return {
    question: q,
    answer: body,
    followUps: [
      { question: 'How do you communicate **ETA**?', answer: fuProd().answer },
      { question: 'What **post-incident** item is mandatory?', answer: fuTrap().answer }
    ]
  };
}

const SENIOR_TAIL =
  '\n\nDeeper runbook: stash **target/surefire-reports** **TEST-*.xml** next to **docker** **inspect** output for the **postgres** container id because platform teams compare machine-readable artifacts. When **parallel** **Surefire** is on, reproduce once with **-Djunit.jupiter.execution.parallel.enabled=false** to prove shared **static** **Testcontainers** fields, then fix ordering instead of leaving the flag forever. If **Metaspace** climbs only during **@SpringBootTest** modules, compare **spring.test.context.cache** hits with **logging.level.org.springframework.test.context.cache=DEBUG**. Record **testcontainers** and **spring-boot** **BOM** versions in the incident timeline so the next **Java** **21** bump does not reopen the same ticket.';

const SENIOR_BLOCK = (a, b, c, d) =>
  `**Immediate response:** ${a}\n\n**Root cause:** ${b}\n\n**Fix:** ${c}\n\n**Prevention:** ${d}\n\nStaff note: capture **mvn** **-e** **-X** test output, **docker** **ps** during failure, and **jcmd** **<pid>** **Thread.print** from the stuck **Surefire** worker; attach **Surefire** **XML** to the ticket. Compare **Metaspace** before and after the suite with **jcmd** **GC.class_stats** when **OutOfMemoryError** mentions **Metaspace**. Document **Testcontainers** **Ryuk** policy and **DOCKER_HOST** on agents because they decide whether contexts ever start.${SENIOR_TAIL}`;

function buildSenior() {
  return [
    senior(
      '**CI** passes on developer laptops but every **OrderIT** fails on **GitHub** **Actions** with **Could not find a valid Docker environment**.',
      SENIOR_BLOCK(
        'Open the failing job log, confirm the step runs on a runner labeled **docker**, and run **docker** **version** in a debug step on the same image.',
        '**Testcontainers** needs a **Docker** **API** socket; **Kubernetes** **pods** without **privileged** **DinD** or socket mount cannot start **PostgreSQLContainer**.',
        'Enable **Docker-in-Docker** for that workflow or set **TESTCONTAINERS_HOST_OVERRIDE** per platform docs; verify with **mvn** **-Dtest=OrderIT** **test** on a canary agent.',
        'Add a five-minute **smoke** **IT** in **CI** templates that fails fast when **Docker** is misconfigured before teams merge.'
      )
    ),
    senior(
      'After a **Spring** **Boot** **3** upgrade, **@WebMvcTest** classes fail with **UnsatisfiedDependencyException** for **SecurityFilterChain**.',
      SENIOR_BLOCK(
        'Run **mvn** **-Dtest=FailingMvcTest** **-e** **test** and copy the first **Caused** **by** line into the ticket.',
        '**Boot** **3** changed default **security** auto-configuration in tests; your slice no longer includes the beans your controller expects.',
        'Add **@Import**(**SecurityConfig**.class) intentionally, **@MockBean** **SecurityFilterChain**, or switch to **@AutoConfigureMockMvc** with **addFilters=false** only when documented.',
        'Publish a team cheat sheet: which security beans each slice loads under **Boot** **3** on **Java** **17**.'
      )
    ),
    senior(
      '**Staging** reports **duplicate** **key** **violations** on **PostgreSQL** while **H2** tests never failed.',
      SENIOR_BLOCK(
        'Reproduce insert against **staging** **read** **replica** logs, then run one **mvn** **-Dtest=OrderRepositoryIT** **test** with **Testcontainers** **PostgreSQL**.',
        '**H2** compatibility mode did not enforce the same **UNIQUE** constraint or default expression as **PostgreSQL**.',
        'Add **@SpringBootTest** **IT** with **PostgreSQLContainer** and **Flyway** enabled; align **spring.jpa.hibernate.ddl-auto** with prod policy.',
        'Ban relying on **H2** alone for **SQL** that uses **PostgreSQL** features; require **Testcontainers** in the **PR** template for schema changes.'
      )
    ),
    senior(
      '**CI** **test** stage grows from twelve minutes to one hour after teams adopt **Testcontainers** everywhere.',
      SENIOR_BLOCK(
        'Sample **docker** **events** during the job and count **container** **create** operations per minute.',
        'Each test class started its own **PostgreSQLContainer** without **reuse**, so pulls and startups dominated wall time.',
        'Introduce a **static** **PostgreSQLContainer** base class with **start** once, enable **testcontainers.reuse.enable=true** where policy allows, and cache image layers in the pipeline.',
        'Add **ArchUnit** or **Sonar** rule: no **new** **PostgreSQLContainer**() inside **@BeforeEach**.'
      )
    ),
    senior(
      '**ApplicationContext** loads locally but **CI** **OOMKills** the **Surefire** fork during integration tests.',
      SENIOR_BLOCK(
        'Capture **kubectl** **describe** **pod** **oom** section or **GitHub** **Actions** **exit** **137**, then run **jcmd** **<pid>** **GC.heap_info** on a repro laptop.',
        'Too many **@SpringBootTest** classes with different **@MockBean** sets bust **Spring** context cache and multiply **Metaspace**.',
        'Consolidate **@MockBean** patterns, split modules, or raise **Kubernetes** **memory** **limit** with finance approval; set **MAVEN_OPTS** **-XX:MaxMetaspaceSize** intentionally.',
        'Track **Metaspace** trend weekly from **jcmd** on **CI** agents after each **Spring** upgrade.'
      )
    ),
    senior(
      '**Flaky** **MockMvc** **jsonPath** assertions pass locally but fail one in thirty **CI** runs.',
      SENIOR_BLOCK(
        'Disable **parallel** **Surefire** for one build and log **spring.test.context.cache** statistics.',
        'Two test classes shared a **static** **ObjectMapper** **@Bean** override and mutated **JavaTimeModule** registration between runs.',
        'Isolate mapper configuration per test **@Configuration** or use **@DirtiesContext** only where unavoidable; prefer immutable **ObjectMapper** beans.',
        'Add **checkstyle** ban on mutating **ObjectMapper** after **ApplicationContext** refresh in **test** **config**.'
      )
    )
  ];
}

const WRONG = [
  '**@SpringBootTest** should be the default annotation on every test class because it is the safest option.',
  '**Testcontainers** removes the need for **Flyway** migrations in tests because the container is disposable.',
  '**@MockBean** is harmless because it only affects tests and can never hide production wiring bugs.',
  '**Docker** is optional on **CI** if developers run **Testcontainers** tests locally before merge.',
  '**@Transactional** rollback in integration tests proves your distributed transactions are correct in production.',
  '**H2** in **PostgreSQL** compatibility mode is always enough validation for **SQL** that ships to **RDS**.',
  'Disabling **Ryuk** globally is a best practice to make **Testcontainers** start faster.',
  '**MockMvc** exercises the exact same **HTTP** stack as a real browser hitting your load balancer.'
];

function buildMcq() {
  const mk = (id, level, category, question, options, answer, explanation) => ({
    id,
    level,
    category,
    question,
    options,
    answer,
    explanation
  });
  const q = [];
  let id = 1;
  const B = (cat, question, o, a, e) => q.push(mk(id++, 'basic', cat, question, o, a, e));
  const I = (cat, question, o, a, e) => q.push(mk(id++, 'intermediate', cat, question, o, a, e));
  const A = (cat, question, o, a, e) => q.push(mk(id++, 'advanced', cat, question, o, a, e));

  B(
    'theory',
    'Which annotation loads a **Spring** **MVC** slice for controller tests?',
    { A: '**@DataJpaTest**', B: '**@WebMvcTest**', C: '**@Entity**', D: '**@Table**' },
    'B',
    '**@WebMvcTest** focuses on **web** layer. **@DataJpaTest** is for **JPA**.'
  );
  B(
    'theory',
    'What does **Testcontainers** need on the machine running tests?',
    { A: 'A **Kubernetes** cluster only', B: 'A working **Docker** **API**', C: '**GUI** desktop', D: '**Windows** OS only' },
    'B',
    '**Testcontainers** talks to **Docker**; without it you get environment errors.'
  );
  B(
    'theory',
    'What is **@DynamicPropertySource** used for?',
    { A: 'Compile-time bytecode weaving', B: 'Inject container **JDBC** URLs into **Spring** **Environment**', C: 'Replace **main** method', D: 'Disable **JUnit**' },
    'B',
    'It registers properties such as **spring.datasource.url** before context refresh.'
  );
  B(
    'theory',
    'What does **@MockBean** do in a slice test?',
    { A: 'Deletes the class', B: 'Replaces a **Spring** bean with a **Mockito** mock in the test context', C: 'Starts **Docker**', D: 'Runs **Flyway** only in prod' },
    'B',
    '**@MockBean** is a **Spring** **Test** feature, not plain **Mockito** field injection.'
  );
  B(
    'code',
    'What prints?\n```java\nclass X {\n  public static void main(String[] a) {\n    String u = "jdbc:tc:postgresql:///db";\n    System.out.println(u.startsWith("jdbc:tc") ? "tc" : "no");\n  }\n}\n```',
    { A: 'no', B: 'tc', C: 'throws', D: 'null' },
    'B',
    'String starts with **jdbc:tc** so the ternary picks **tc**.'
  );
  B(
    'code',
    'Missing piece?\n```java\n// @WebMvcTest\n// class C { @Autowired ??? mockMvc; }\n```',
    { A: '**ObjectMapper** only', B: '**MockMvc**', C: '**EntityManager**', D: '**RestTemplate** builder' },
    'B',
    'Controller slice tests usually inject **MockMvc** (often with **@AutoConfigureMockMvc**).'
  );
  B(
    'code',
    '**assertThrows** in **JUnit** **5** wraps what?',
    { A: 'Only **IOException**', B: 'An **Executable** that should throw', C: '**Docker** client', D: '**Flyway**' },
    'B',
    '**assertThrows** takes **Executable** lambdas.'
  );
  B(
    'theory',
    'Why is **H2** alone risky for **PostgreSQL**-specific **SQL**?',
    { A: '**H2** is always slower', B: 'Dialect and constraints can differ from real **PostgreSQL**', C: '**H2** forbids **JUnit**', D: '**Docker** bans **H2**' },
    'B',
    'Use **Testcontainers** when you rely on **PostgreSQL** features.'
  );
  I(
    'theory',
    'Which error often means a bean is missing from a slice context?',
    { A: '**ClassNotFoundException** for **String**', B: '**UnsatisfiedDependencyException**', C: '**OutOfMemoryError** **heap** on **int**', D: '**ZipException** always' },
    'B',
    '**Spring** cannot inject a dependency that was not loaded in that slice.'
  );
  I(
    'theory',
    'What is a smell of using **@SpringBootTest** everywhere?',
    { A: 'Tests become too fast', B: '**CI** time explodes and developers skip suites', C: '**Docker** stops working', D: '**MockMvc** disappears' },
    'B',
    'Full contexts are powerful but expensive; prefer slices when possible.'
  );
  I(
    'theory',
    'What does **Ryuk** help with?',
    { A: 'Caching **Maven** dependencies', B: 'Cleaning up **Docker** containers after **JVM** exit', C: 'Compiling **Kotlin**', D: 'Signing **JWT**' },
    'B',
    '**Ryuk** is **Testcontainers** cleanup sidecar.'
  );
  I(
    'theory',
    'Why enable static **Testcontainers** reuse in **CI**?',
    { A: 'To disable **JUnit**', B: 'To avoid starting a new container per class when policy allows', C: 'To remove **Spring**', D: 'To skip **Surefire**' },
    'B',
    'Reuse cuts startup cost but needs governance.'
  );
  I(
    'code',
    'Bug?\n```java\n@BeforeEach\nvoid start() { postgres = new PostgreSQLContainer("postgres:15"); postgres.start(); }\n```',
    { A: 'Perfect for speed', B: 'Starts a new container every test method — usually too slow', C: 'Illegal in **Java** **17**', D: 'Required by **Spring**' },
    'B',
    'Prefer **static** shared container or reuse strategy.'
  );
  I(
    'code',
    'What is wrong?\n```java\n@DynamicPropertySource\nvoid props(DynamicPropertyRegistry r) {\n  r.add("spring.datasource.url", () -> container.getJdbcUrl());\n}\n```',
    { A: 'Nothing', B: 'Method should be **static** on supported setup', C: 'Must use **@Test**', D: '**Docker** forbids **registry**' },
    'B',
    '**@DynamicPropertySource** methods are **static** in common **Spring** **Test** usage.'
  );
  I(
    'code',
    'Slice mismatch?\n```java\n@WebMvcTest\nclass T { @Autowired JdbcTemplate jdbc; }\n```',
    { A: 'Always valid', B: '**JdbcTemplate** not loaded by **@WebMvcTest** by default', C: 'Requires **@Entity** only', D: 'Needs **Gradle** not **Maven**' },
    'B',
    'Use **@DataJpaTest**/**@SpringBootTest** or **@MockBean** intentionally.'
  );
  I(
    'code',
    'Async smell?\n```java\nmockMvc.perform(asyncDispatch(mockMvc.perform(get("/async")).andReturn()));\n```',
    { A: 'Always wrong', B: 'Pattern for **MockMvc** async — easy to forget dispatch step', C: 'Replaces **Docker**', D: 'Deletes **Flyway**' },
    'B',
    'Forgetting **asyncDispatch** causes flaky **status** assertions.'
  );
  I(
    'code',
    'Black-box port?\n```java\n@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)\n```',
    { A: 'Means no server starts', B: 'Starts real port for **TestRestTemplate**/**WebTestClient**', C: 'Disables **JUnit**', D: 'Runs only **Kotlin**' },
    'B',
    '**RANDOM_PORT** exercises servlet stack more fully than in-memory **MockMvc** alone.'
  );
  I(
    'theory',
    'Flaky **CI** only: what should you check first for **Testcontainers**?',
    { A: 'Rewrite all production code', B: '**Docker** daemon access and image pull auth on agents', C: 'Delete **target**', D: 'Downgrade to **Java** **8** only' },
    'B',
    'Most "works on my machine" **TC** failures are **Docker** plumbing.'
  );
  I(
    'theory',
    'What is a realistic goal of **@Sql** in tests?',
    { A: 'Replace **Docker**', B: 'Seed or clean data for a focused scenario', C: 'Disable **Spring** security globally', D: 'Remove **Metaspace**' },
    'B',
    '**@Sql** runs scripts against the test **DataSource**.'
  );
  I(
    'theory',
    'Why pair **Flyway** with **Testcontainers** in **IT** tests?',
    { A: 'To skip migrations', B: 'So schema matches prod migration history', C: 'To remove **JUnit**', D: 'To avoid **JDBC**' },
    'B',
    'You want migration failures before merge, not first in staging.'
  );
  A(
    'theory',
    'After **Spring** **Boot** **3** migration, **integration** tests **OOM** in **CI** only. Likely lever?',
    { A: 'Delete **Docker**', B: 'Reduce duplicate **@SpringBootTest** contexts or raise **Metaspace**/**memory** limits with evidence', C: 'Disable **Surefire**', D: 'Use **@Entity** on tests' },
    'B',
    'Context churn inflates **Metaspace**; fix architecture or resources deliberately.'
  );
  A(
    'theory',
    '**Platform** blocks **Ryuk**. What is the risk of disabling it without replacement cleanup?',
    { A: 'Faster tests forever with no downside', B: 'Zombie containers exhausting agent disk', C: '**JUnit** stops discovering tests', D: '**MockMvc** returns only **404**' },
    'B',
    'You need another cleanup strategy if **Ryuk** cannot run.'
  );
  A(
    'code',
    'Green **MockMvc** but prod **JSON** errors: best next test?',
    { A: 'More **println**', B: '**@JsonTest** or **WebMvcTest** that loads real **ObjectMapper** beans', C: 'Remove **Spring**', D: 'Use **H2** for messaging' },
    'B',
    'Serialization config must be exercised, not only hand-written **String** expectations.'
  );
  A(
    'code',
    '**ARM** **CI** fails pulling **postgres** image. Most plausible fix?',
    { A: 'Use **amd64** tag without manifest', B: 'Pin multi-arch digest or use platform-specific tag matrix', C: 'Remove **Testcontainers** from **pom.xml**', D: 'Run tests on **MS-DOS**' },
    'B',
    'Image architecture mismatches are common on **Apple** **Silicon** vs **Linux** **CI**.'
  );
  A(
    'code',
    'Staging **deadlock** not seen in tests using **@Transactional** rollback?',
    { A: 'Add more **@MockBean**', B: 'Add at least one **IT** without rollback or with real transaction boundaries', C: 'Use **@WebMvcTest** for repositories', D: 'Disable **PostgreSQL**' },
    'B',
    'Rollback hides cross-connection behavior.'
  );
  for (let i = 0; i < 5; i++) {
    A(
      'theory',
      `On-call ${i + 1}: **Test** **JVM** hung after **PostgreSQL** healthy. First command?`,
      { A: '`jcmd <pid> Thread.print`', B: '`format C:`', C: '`ping google.com`', D: '`rm -rf /`' },
      'A',
      'See **Spring** refresh threads vs **Docker** **HTTP** waits before killing agents.'
    );
  }

  return q;
}

const CHEATSHEET = `| Level | Concept | The rule in one line | Example or Command |
|-------|---------|----------------------|--------------------|
| Fresher | **@WebMvcTest** | Controller slice | **mockMvc.perform(get("/api/x"))** |
| Fresher | **MockMvc** | In-memory **HTTP** | **andExpect(status().isOk())** |
| Fresher | **Testcontainers** | Real deps in **Docker** | **new PostgreSQLContainer("postgres:15")** |
| Senior Dev | **@MockBean** | Replace bean in test context | **@MockBean** **OrderService** |
| Senior Dev | **@DynamicPropertySource** | Wire **JDBC** URL | **r.add("spring.datasource.url", ...)** |
| Senior Dev | **UnsatisfiedDependencyException** | Bean missing from slice | **mvn** **-Dtest=...** **-e** **test** |
| Senior Dev | **@DataJpaTest** | **JPA** slice | Repository tests with **EntityManager** |
| Tech Lead | Slice choice | Smallest context for the risk | **@WebMvcTest** vs **@SpringBootTest** |
| Tech Lead | **CI** **Docker** | **Testcontainers** needs socket | **docker** **ps** on agent |
| Tech Lead | **Reuse** | Speed vs isolation | **testcontainers.reuse.enable=true** |
| Staff | **Ryuk** | Cleanup sidecar | **docker** **ps** shows **testcontainers-ryuk** |
| Staff | **Metaspace** | Context cache misses cost | **jcmd** **GC.class_stats** |
| Staff | **jcmd** triage | Stuck refresh threads | **jcmd** **<pid>** **Thread.print** |`;

export function buildDay86Sections() {
  const basic = buildBasicCode();
  const mid = buildMidCode();
  const adv = buildAdvCode();
  return [
    { type: 'why', title: 'Why Spring Testing and Testcontainers matters', content: buildWhy() },
    { type: 'theory', title: 'Theory and Internals — Spring Testing and Testcontainers', content: buildTheoryContent() },
    {
      type: 'code',
      title: 'Basic — Spring slices + Testcontainers reference card',
      language: 'java',
      filename: 'Day86Basic.java',
      level: 'basic',
      description: 'Print-only vocabulary for week-one learners.',
      code: basic.code,
      output: basic.output
    },
    {
      type: 'code',
      title: 'Intermediate — Four Spring / Testcontainers incidents',
      language: 'java',
      filename: 'Day86Intermediate.java',
      level: 'intermediate',
      description: 'Senior narration with diagnostic commands.',
      code: mid.code,
      output: mid.output
    },
    {
      type: 'code',
      title: 'Advanced — Spring + Docker triage matrix',
      language: 'java',
      filename: 'Day86Advanced.java',
      level: 'advanced',
      description: 'Tech lead printable checklist.',
      code: adv.code,
      output: adv.output
    },
    {
      type: 'diagram',
      title: 'CI pipeline with Spring tests and Testcontainers',
      diagramType: 'component',
      description: 'Surefire fork talks to Docker API; containers wire into Spring Environment.',
      plantuml:
        '@startuml\ntitle Day 86 — CI + Testcontainers\nparticipant Surefire\nparticipant JVM\nparticipant Docker\nSurefire -> JVM : fork test\nJVM -> Docker : start postgres\nDocker --> JVM : mapped port\nJVM -> JVM : Spring context refresh\n@enduml'
    },
    { type: 'pitfalls', title: 'Common Pitfalls', items: PITFALLS },
    {
      type: 'exercise',
      title: 'Exercise — Spring slice vocabulary (fresher)',
      audience: 'fresher',
      difficulty: 'Beginner',
      problem:
        'You are writing your first drill class to memorize **Spring** test slice words.\n\n1. Create **arch.day86.Day86FresherExercise** with **main**.\n2. Print one line explaining **@WebMvcTest** in plain words.\n3. Print one line explaining **MockMvc** without writing a real test.\n4. Print one line explaining why **Testcontainers** uses **Docker**.',
      hints: [
        'Keep strings in **final** **String** constants.',
        'Use only **System.out.println**.',
        'You do not need **Spring** on the **classpath** if you only print teaching text.'
      ],
      solution: `package arch.day86;

/** Fresher drill: say the slice words before you annotate controllers. */
public class Day86FresherExercise {

    public static void main(String[] args) {
        // args unused so output is identical on every machine.
        final String webSlice = "@WebMvcTest loads only the Spring web MVC slice, not your whole application.";
        // webSlice reminds you that services and repositories are absent unless imported.
        System.out.println(webSlice);
        final String mvc = "MockMvc sends fake HTTP requests through DispatcherServlet in-process without a real port.";
        // mvc explains the main tool you touch in controller tests.
        System.out.println(mvc);
        final String tc = "Testcontainers starts real databases in Docker so JDBC URLs match production engines.";
        // tc connects Docker vocabulary to why CI needs an image pull.
        System.out.println(tc);
        final String dyn = "@DynamicPropertySource registers spring.datasource.url before the ApplicationContext starts.";
        // dyn is the wiring phrase interviewers expect next to containers.
        System.out.println(dyn);
        final String mockBean = "@MockBean replaces a Spring bean in the test context with a Mockito mock.";
        // mockBean contrasts plain @Mock with Spring test support.
        System.out.println(mockBean);
        final String dataSlice = "@DataJpaTest focuses on JPA repositories and a test DataSource.";
        // dataSlice reminds you web controllers are not loaded there.
        System.out.println(dataSlice);
        final String boot = "@SpringBootTest loads the full ApplicationContext and is the slowest default.";
        // boot warns against using it when a smaller slice would answer the question.
        System.out.println(boot);
    }
}
`
    },
    {
      type: 'exercise',
      title: 'Exercise — Docker + Spring CI triage (staff)',
      audience: 'staff',
      difficulty: 'Advanced',
      problem:
        'Your **GitHub** **Actions** job fails integration tests with **Could not find a valid Docker environment** while laptops pass.\n\n1. Model three pipeline keys **p1**, **p2**, **p3** in a **LinkedHashMap** with **String** first-command values.\n2. Print each key and command on its own line under a header.\n3. Print one line recommending **docker** **ps** during the failing step.\n4. Print one line about **Ryuk** and why disabling it needs a cleanup substitute.\n5. Print one **prevention** line requiring **Docker** smoke **IT** in shared **CI** templates.',
      hints: [
        'Use **LinkedHashMap** so iteration order matches your escalation story.',
        'Commands are strings only; you are not shelling out from Java.',
        'Map **p3** to **jcmd** **Thread.print** if the **JVM** hangs after **Docker** works.'
      ],
      solution: `package arch.day86;

import java.util.LinkedHashMap;
import java.util.Map;

/** Staff triage: deterministic println card for Testcontainers + Spring CI failures. */
public class Day86StaffExercise {

    record Pipeline(String id, boolean dockerSocket, boolean ryukAllowed) {}

    public static void main(String[] args) {
        // LinkedHashMap preserves escalation order for auditors reading logs.
        Map<String, String> firstCmd = new LinkedHashMap<>();
        firstCmd.put("p1", "docker version && docker info on the runner debug step");
        firstCmd.put("p2", "kubectl describe pod <agent> | findstr -i mount");
        firstCmd.put("p3", "jcmd <pid> Thread.print if JVM hangs after container healthy");

        // Compact records stand in for parsed workflow YAML.
        Pipeline p1 = new Pipeline("p1", false, true);
        Pipeline p2 = new Pipeline("p2", true, false);
        Pipeline p3 = new Pipeline("p3", true, true);

        System.out.println("=== Modeled pipelines ===");
        System.out.println(p1.id() + " socket=" + p1.dockerSocket() + " ryuk=" + p1.ryukAllowed());
        System.out.println(p2.id() + " socket=" + p2.dockerSocket() + " ryuk=" + p2.ryukAllowed());
        System.out.println(p3.id() + " socket=" + p3.dockerSocket() + " ryuk=" + p3.ryukAllowed());

        System.out.println("=== First command per key ===");
        for (Map.Entry<String, String> e : firstCmd.entrySet()) {
            System.out.println(e.getKey() + " -> " + e.getValue());
        }

        System.out.println("=== Live observation ===");
        System.out.println("During failure window run docker ps and capture postgres + ryuk container ids.");

        System.out.println("=== Ryuk note ===");
        System.out.println("Ryuk reaps containers; if disabled add explicit teardown or agents fill disks.");

        System.out.println("=== Prevention ===");
        System.out.println("Shared CI template must run one Docker-backed IT on every new runner image.");

        // Staff thinking: JVM memory still matters once Docker works.
        System.out.println("=== JVM follow-up ===");
        System.out.println("If OOM after Docker healthy: jcmd <pid> GC.class_stats for Metaspace churn.");

        // Tie back to Spring so the ticket is not only infra blame.
        System.out.println("=== Spring follow-up ===");
        System.out.println("Log spring.test.context.cache logger to see duplicate ApplicationContext explosions.");

        // Document where artifacts live for post-incident review.
        System.out.println("=== Audit paths ===");
        System.out.println("Attach surefire XML plus docker inspect for the postgres container.");

        // Remind about architecture parity across ARM and amd64 CI cells.
        System.out.println("=== Arch matrix ===");
        System.out.println("Pin multi-arch image digest; arm64 runners differ from amd64-only tags.");

        // Close with explicit owner split between platform and service teams.
        System.out.println("=== Ownership ===");
        System.out.println("Platform owns socket mounts; service owns static container reuse policy.");
    }
}
`
    },
    {
      type: 'interview',
      title: 'Interview Drill — Spring Testing and Testcontainers',
      conceptual: buildConceptual(),
      codeBased: buildCodeBased(),
      seniorScenario: buildSenior(),
      wrongAnswers: WRONG,
      jobSwitch: {
        resumeBullet: 'Reduced integration test CI time thirty five percent with static Testcontainers reuse and slice tests.',
        interviewPositioning:
          'When I join a team I open the shared **CI** workflow and confirm **Docker** socket mounts and **Ryuk** policy before I touch tests. In week one I add one **IT** that fails fast when **Testcontainers** cannot talk to **Docker**, and I document which modules stay on **@WebMvcTest** versus full **@SpringBootTest**.',
        starAnchor:
          'Situation: our ledger service had green **H2** tests but weekly **PostgreSQL** constraint failures in staging. Task: fix confidence without doubling **CI** cost. Action: I introduced a **static** **PostgreSQLContainer** base class, wired **@DynamicPropertySource**, enabled image layer caching on agents, and moved twenty controller tests from **@SpringBootTest** to **@WebMvcTest**. Result: average **CI** test stage dropped from forty-one to twenty-six minutes over six weeks and staging **SQL** incidents went to zero.'
      }
    },
    {
      type: 'mcq',
      title: 'MCQ — Spring Testing and Testcontainers',
      description: 'Thirty questions across basic, intermediate, and advanced levels.',
      questions: buildMcq()
    },
    { type: 'cheatsheet', title: 'Cheatsheet — Spring Testing and Testcontainers', content: CHEATSHEET }
  ];
}

