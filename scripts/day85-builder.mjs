/** Full section builder for phase10-day85.json — JUnit 5 and Mockito */

const T = (title, body, angle) =>
  `### ${title}\n\n${body}\n\n**Interview angle:** ${angle}`;

function buildWhy() {
  return (
    'At 02:14 your **Spring** **Boot** payment service pipeline turns red. The log says **UnnecessaryStubbingException** from **Mockito** even though every test passed on your laptop an hour ago. The build agent is Linux. Your **IDE** quietly added **lenient()** stubs last week, and nobody noticed until **CI** ran with **strict stubbing** enabled. The error message looks like a test bug. It is really a discipline signal: you stubbed a collaborator the code under test never touched.\n\n' +
    'You are new on the team. You thought **JUnit** was only about green bars. In your first month you learn that **JUnit** **5** and **Mockito** decide whether refactors are safe, whether **CI** stays fast, and whether production incidents get reproduced at all. When tests lie, people ship anyway. When tests are honest but flaky, people stop trusting **CI**. Both hurt customers.\n\n' +
    'Interviewers who ask about **JUnit** **5** and **Mockito** rarely want textbook definitions. They want to hear what breaks when you mock the wrong layer, when **Surefire** forks the **JVM** with a different **classpath**, or when **Byte Buddy** cannot attach on a **Java** **21** agent path. A weak answer lists annotations. A strong answer names the failure mode and the command that proves it.\n\n' +
    'When ten engineers share a service, two failure modes spread fast. First, someone mocks **RestTemplate** or **WebClient** everywhere and the suite never catches a real **JSON** contract change. Production throws **HttpMessageNotReadableException** while **CI** stayed green. Second, shared **static** **mutable** state in tests causes order-dependent passes. **CI** fails on file order and passes locally. Both look like random application bugs. They are test design mistakes amplified by **Surefire** parallel forks.\n\n' +
    'Use this four-step pattern in reviews and interviews. First, name the boundary you are testing: pure domain logic, a **use case** with one mocked **port**, or a slice with **Testcontainers**. Second, say what you stub: return values only, not every private helper. Third, say what breaks if you are wrong: **UnnecessaryStubbingException**, **NotAMockException**, or silent false confidence. Fourth, verify with **mvn** **-Dtest=YourTest** **test** and, when forks hang, **jcmd** **<pid>** **Thread.print** on the worker **JVM**.\n\n' +
    'Here is a Staff-level fact that separates senior noise from signal. **Mockito** **5** on **Java** **21** relies on **Byte Buddy** **inline** mocking for **final** classes and records. If your **CI** image strips the **attach** path or runs with a security profile that blocks agents, you get **MockitoException** about self-attaching. The fix is not more mocks. It is aligning the **JDK** image, **surefire** **argLine** for **--add-opens**, and the **mock-maker-inline** setting.\n\n' +
    'In your first six months this topic shows up constantly. During onboarding you fix a **NullPointerException** in **@BeforeEach** because **@InjectMocks** could not find a zero-arg constructor. You pair with **on-call** to reproduce a **timeout** only seen under load, and you write a **JUnit** test with a deterministic fake clock instead of **Thread.sleep**. Before a **Java** **17** to **21** upgrade you run the full suite on the new **JDK** and capture **Surefire** reports where **Mockito** warns about **inline** mocking. Each time you tie the story to a command and a measurable outcome, not to buzzwords.\n\n' +
    'You also watch how **Gradle** **test** workers and **Maven** **Surefire** **forkCount** multiply **Metaspace** when every module generates **Mockito** proxies at once. A Staff engineer treats flaky **CI** as a signal about **classpath** order, **agent** permissions, and **parallel** scheduling before rewriting product code. When you can say that out loud with one **jcmd** example, you sound like someone who has merged real **JDK** upgrades, not someone who only memorized five annotations. That mindset is what keeps night pages rare after big releases.'
  );
}

function buildTheoryContent() {
  const parts = [
    T(
      'Plain-language overview',
      '**JUnit** **5** is the tool that runs small programs called tests and tells you if your real code behaved as you expected. **Mockito** is the tool that builds lightweight fake collaborators so you can test one class without starting a database or the network. Together they answer a simple question: does this unit of logic do the right thing when its neighbors return controlled answers. Nothing here replaces integration tests. It narrows the blast radius so failures are easy to read.',
      'Interviewers listen for whether you separate fast unit feedback from heavier integration confidence.'
    ),
    T(
      'What is a unit test in Java',
      'A unit test is a **method** annotated with **@Test** that calls production code and uses **assertions** to compare actual output to expected output. **JUnit** **5** discovers tests through the **Jupiter** engine. The **JVM** loads your test class like any other class, then reflection invokes each **@Test** method. If an **assertion** fails, **JUnit** marks the test failed and prints a diff.',
      'Weak candidates only say "it checks code"; strong ones mention discovery, class loading, and assertion failures.'
    ),
    T(
      'Your first JUnit 5 test in plain sight',
      'Copy this smallest shape into a test source folder **src/test/java** so **Maven** **Surefire** or **Gradle** can see it.\n\n```java\nimport org.junit.jupiter.api.Test;\nimport static org.junit.jupiter.api.Assertions.assertEquals;\n\nclass FirstTest {\n    @Test\n    void addsNumbers() {\n        assertEquals(4, 2 + 2);\n    }\n}\n```\n\nWhen you run **mvn** **test**, **Surefire** forks a **JVM**, loads **FirstTest**, runs **addsNumbers**, and prints **BUILD SUCCESS** if **assertEquals** did not throw.',
      'Interviewers want to hear that tests are ordinary classes executed by a separate engine inside the build.'
    ),
    T(
      'What Mockito adds to that picture',
      '**Mockito** creates proxy objects that pretend to implement an interface or extend a class. You teach the mock what to return with **when**(...).**thenReturn**(...). Later you can ask **verify**(...)** if a method was called. The mock is not magic. **Byte Buddy** or similar generates bytecode at runtime so calls are intercepted before your real implementation runs.',
      'Good answers mention stubbing versus verification instead of treating Mockito as only "fake data".'
    ),
    T(
      'How Surefire runs tests inside the JVM',
      '**Maven** **Surefire** starts a worker **JVM** (sometimes one per module or per parallel slice). It builds a **classpath** that mixes **main** classes, **test** classes, and **test** dependencies like **JUnit** and **Mockito**. If two **JAR** files both ship the same class, the first **classpath** entry wins. That is how a test can pass in the **IDE** but fail in **CI** when dependency order differs.',
      'Senior answers connect **classpath** ordering with mysterious **NoSuchMethodError** in tests.'
    ),
    T(
      'Stubbing versus verifying interactions',
      'Stubbing answers "what should this call return". Verification answers "did the code under test call the neighbor we expect". You need both in many services, but they solve different questions. Over-verifying every private helper couples tests to implementation and makes refactors painful. Under-verifying lets silent behavior changes slip through when return values still look fine.',
      'Interviewers probe whether you know **verify** can create brittle tests when applied to internal steps.'
    ),
    T(
      'Production comparison table — test double style',
      '| Style | When it helps | What breaks if you pick the wrong one |\n|-------|---------------|---------------------------------------|\n| **Mock** | You must assert calls and control returns | You mock **domain** rules and lose real behavior |\n| **Fake** | You need working in-memory logic | You maintain a second implementation forever |\n| **Stub** | You only need fixed return data | Stubs hide unexpected arguments |\n| **Spy** | You need the real object but one method faked | Partial spies confuse readers and hide state |\n\nPick the smallest double that still tells the truth about the contract you care about.',
      'Staff candidates name trade-offs between mocks and fakes without mocking everything "just in case".'
    ),
    T(
      'Numbered sequence — debug a flaky Mockito test',
      '1. Reproduce with a single **test** method using **mvn** **-Dtest=Class#method** **test**.\n2. Capture **Surefire** reports under **target/surefire-reports** and read the stack trace top to bottom.\n3. Remove **parallel** temporarily with **junit.jupiter.execution.parallel.enabled=false** to see ordering issues.\n4. Replace **Thread.sleep** with a controlled **Clock** fake or **Awaitility** with a timeout.\n5. Re-run on the same **JDK** major as **CI** using **toolchain** or **sdkman**.\n6. If the worker hangs, attach **jcmd** **<pid>** **Thread.print** and look for blocked **mock** initialization.\n\nThis sequence keeps you honest and fast.',
      'Interviewers reward a repeatable ladder instead of random IDE clicks.'
    ),
    T(
      'Common Mockito mistakes that look like app bugs',
      'Calling **when** on a real object without a **spy** creates confusing errors. Forgetting **@ExtendWith(MockitoExtension.class)** in **JUnit** **5** leaves **@Mock** fields **null**, which surfaces as **NullPointerException** inside the test, not inside production code. Mixing **ArgumentMatchers** like **any()** with raw values in the same call throws **InvalidUseOfMatchersException** with a long message that scares juniors.',
      'Strong answers map each exception class to a concrete misuse pattern.'
    ),
    T(
      'Choosing unit versus slice versus integration',
      'Unit tests stay in memory and run in milliseconds. Slice tests start a slice of **Spring** with **@WebMvcTest** or similar. Integration tests hit real **TCP** ports or **Testcontainers**. The decision is risk versus feedback time. Mock heavy IO in unit tests. Prove wiring and serialization in slices. Prove deployment assumptions in integration tests. Skipping slices is how **JSON** field renames ship with green unit suites.',
      'Tech leads should articulate where **MockMvc** fits versus pure **Mockito**.'
    ),
    T(
      'What to check in code review for tests',
      'Reject tests that mock **domain** entities to return nonsense values that production can never produce. Require **assertions** on outcomes, not only **verify** on calls. Ask for deterministic data: fixed **UUID** strings, pinned **Clock** instances, no **System.currentTimeMillis** without control. Flag **static** mocks unless there is an explicit comment and removal plan.',
      'Review quality often predicts on-call pain more than production code style does.'
    ),
    T(
      'How to explain mock trade-offs to a stakeholder',
      'Say that fast tests buy hourly feedback while heavier tests buy release confidence. **Mockito** keeps hourly tests cheap. **Testcontainers** raises cost but catches **SQL** mistakes. Offer a ratio: many unit tests, fewer integration tests, a handful of **e2e** flows. Tie the conversation to release frequency and customer-visible defects, not to framework names.',
      'Leaders translate testing vocabulary into schedule and risk.'
    ),
    T(
      'Tool commands when a test fails',
      '| Command | What you learn |\n|---------|----------------|\n| **mvn** **-Dtest=MyTest#method** **-e** **test** | Reproduces one failure with full stack trace |\n| **jcmd** **<pid>** **Thread.print** | Shows blocked **Surefire** worker threads |\n| **javap** **-p** **MyClass.class** | Confirms bytecode matches what you think you exercised |\n',
      'Interviewers reward naming concrete commands instead of saying "I would investigate".'
    ),
    T(
      'What Byte Buddy does when Mockito builds a mock',
      '**Mockito** asks **Byte Buddy** to synthesize subclasses or interfaces at runtime. The **JVM** loads those synthetic classes through the same **class loader** rules as your app. If **module** boundaries block reflective access, the agent cannot attach and mocking **final** types fails. That is why **Surefire** **argLine** sometimes needs **--add-opens** flags on **Java** **17**.',
      'Staff engineers connect agent attachment with **module** encapsulation instead of blaming Mockito randomly.'
    ),
    T(
      'The command you run when a Surefire fork hangs',
    'Find the worker **pid** with **jps** **-l** or your OS process list, then run **jcmd** **<pid>** **Thread.print**. Look for threads blocked inside **Mockito** or **Byte Buddy** initialization. Pair with **jcmd** **<pid>** **GC.heap_info** if you suspect class metadata pressure from generating many mocks in one suite.',
      'On-call credibility comes from actual **jcmd** usage, not from saying "I would investigate".'
    ),
    T(
      'How Java 8, 11, 17, and 21 change the testing story',
    '| **Java** | Testing-relevant change |\n|----------|-------------------------|\n| **8** | **JUnit** **4** runners were common; agents less picky |\n| **11** | **JPMS** stricter; **Surefire** needed **add-opens** for some agents |\n| **17** | Strong encapsulation defaults; **records** and **sealed** types affect mocking |\n| **21** | Virtual threads stress thread-local assumptions in older test utilities |\n\nAlways run the suite on the same **LTS** line you deploy.',
      'Version answers should mention at least one concrete platform change, not only "we upgraded".'
    ),
    T(
      'Architecture guardrail that avoids mock soup',
    'Expose **ports** (**interfaces**) at module boundaries. Test **use cases** against **in-memory** fakes that implement those ports. Keep **Mockito** at the edges for **adapters**, not at the core for business rules. This pattern stops the team from mocking five layers deep and calling it a unit test.',
      'Architects listen for ports and adapters instead of annotation trivia.'
    ),
    T(
      '60-second interview story',
    '**JUnit** **5** runs fast checks that prove behavior on a narrowed **classpath**. **Mockito** supplies controlled neighbors so you focus on one class. Misuse shows up as **UnnecessaryStubbingException**, **NullPointerException** from unset mocks, or green tests that miss real integration gaps. In design reviews you pick the smallest test double that still protects the contract. When **CI** disagrees with laptops, you align **JDK** versions and read **Surefire** reports, then use **jcmd** **Thread.print** if a fork hangs.',
      'This subsection itself is the practiced elevator answer.'
    ),
    T(
      'Satyverse drill — tie-down',
    'Create **src/test/java/arch/day85/DrillTest.java** with one **@Test** that uses **Mockito** to mock **java.util.function.Supplier** and stub **get** to return **42**. Run **mvn** **-q** **-Dtest=DrillTest** **test**. Open **target/surefire-reports** and read the **XML** report. Confirm the **JDK** in the report matches **java** **-version** in your shell.',
      'Interviewers like candidates who have actually read **Surefire** output, not only green bars.'
    )
  ];
  return parts.join('\n\n');
}

function buildBasicCode() {
  const code = `package arch.day85;

/**
 * Fresher reference card: JUnit 5 + Mockito vocabulary (println only).
 */
public class Day85Basic {

    public static void main(String[] args) {
        // Week one: know the words before you copy annotations from StackOverflow.
        System.out.println("=== Core concepts ===");
        System.out.println("@Test          | JUnit 5 marks a test method the Jupiter engine runs");
        System.out.println("@Mock          | Mockito builds a fake implementation of an interface or class");
        System.out.println("when/thenReturn| Stub: teach the mock what to answer");
        System.out.println("verify         | Assert the SUT called a collaborator as expected");
        System.out.println("@InjectMocks   | Mockito tries to construct the class under test with mocks");
        System.out.println();

        // Tie commands to the build so you know where failures are recorded.
        System.out.println("=== Commands you actually run ===");
        System.out.println("mvn -Dtest=OrderServiceTest test   -> runs one test class");
        System.out.println("mvn -Dtest=OrderServiceTest#createsOrder test -> runs one method");
        System.out.println("./gradlew test --tests OrderServiceTest  -> Gradle equivalent");
        System.out.println("java -version / mvn -v -> prove JDK matches CI before blaming Mockito");
        System.out.println();

        // These errors look scary but map to one-line fixes.
        System.out.println("=== Beginner errors and messages ===");
        System.out.println("NullPointerException on mock -> forgot @ExtendWith(MockitoExtension.class) or open mocks");
        System.out.println("UnnecessaryStubbingException -> strict mode; remove unused stubs or use lenient()");
        System.out.println("NotAMockException -> passed a real object to when() or verify()");
        System.out.println("InvalidUseOfMatchersException -> mixed raw args with any() in same call");
        System.out.println();

        // If you remember one thing: tests should protect behavior, not implementation trivia.
        System.out.println("=== Remember this ===");
        System.out.println("Mock collaborators, not your domain rules; verify outcomes first, calls second.");
        System.out.println();
        // Extra row so CI reviewers see you know assertions live in org.junit.jupiter.api.Assertions.
        System.out.println("=== Quick assertion names ===");
        System.out.println("assertEquals / assertTrue / assertThrows -> Jupiter Assertions entry points");
    }
}`;
  const output = `=== Core concepts ===
@Test          | JUnit 5 marks a test method the Jupiter engine runs
@Mock          | Mockito builds a fake implementation of an interface or class
when/thenReturn| Stub: teach the mock what to answer
verify         | Assert the SUT called a collaborator as expected
@InjectMocks   | Mockito tries to construct the class under test with mocks

=== Commands you actually run ===
mvn -Dtest=OrderServiceTest test   -> runs one test class
mvn -Dtest=OrderServiceTest#createsOrder test -> runs one method
./gradlew test --tests OrderServiceTest  -> Gradle equivalent
java -version / mvn -v -> prove JDK matches CI before blaming Mockito

=== Beginner errors and messages ===
NullPointerException on mock -> forgot @ExtendWith(MockitoExtension.class) or open mocks
UnnecessaryStubbingException -> strict mode; remove unused stubs or use lenient()
NotAMockException -> passed a real object to when() or verify()
InvalidUseOfMatchersException -> mixed raw args with any() in same call

=== Remember this ===
Mock collaborators, not your domain rules; verify outcomes first, calls second.

=== Quick assertion names ===
assertEquals / assertTrue / assertThrows -> Jupiter Assertions entry points
`;
  return { code, output };
}

function buildMidCode() {
  const code = `package arch.day85;

/**
 * Four Mockito/JUnit scenarios a senior engineer narrates in review.
 * // CI-only failures usually mean JDK or classpath drift, not cosmic rays.
 */
public class Day85Intermediate {

    static void scenario1() {
        // First feature with Mockito: easy to stub everything including value objects.
        System.out.println("--- Scenario 1: mocked Money.value() hides a real rounding bug ---");
        System.out.println("symptom:  unit tests green, staging shows wrong totals on tax lines");
        System.out.println("cause:    stub returned pretty literals, real Money rounds half-up");
        System.out.println("why:      tests never executed production arithmetic code path");
        System.out.println("fix:      use real value objects for math; mock only IO ports");
        System.out.println("verify:   mvn -Dtest=PricingTest test + code coverage on domain package");
        System.out.println("next:     add one integration test hitting calculator with JDBC fake");
        System.out.println();
    }

    static void scenario2() {
        // Production bug masked: async code tested with Thread.sleep.
        System.out.println("--- Scenario 2: flaky pipeline only on Linux CI ---");
        System.out.println("symptom:  Surefire random failures on verify(mock).save(any())");
        System.out.println("cause:    race between async publisher and test thread");
        System.out.println("why:      Thread.sleep timing differs across CPU scheduling");
        System.out.println("fix:      inject Clock or use Awaitility with bounded wait");
        System.out.println("verify:   mvn test with -Djunit.jupiter.execution.parallel.enabled=false first");
        System.out.println("next:     jcmd <pid> Thread.print if fork hangs after change");
        System.out.println();
    }

    static void scenario3() {
        // Performance: generating thousands of mocks per suite slows metadata.
        System.out.println("--- Scenario 3: suite time jumped after adding @Mock for every DTO ---");
        System.out.println("symptom:  CI test stage 3x slower, Metaspace grows in Grafana");
        System.out.println("cause:    Mockito synthesized classes for types that did not need mocking");
        System.out.println("why:      each mock adds class metadata and JIT warmup cost");
        System.out.println("fix:      use real DTOs; mock only boundary interfaces");
        System.out.println("verify:   mvn -DtrimStackTrace=false test with -Xlog:class+load:stderr:off");
        System.out.println("next:     jcmd <pid> GC.class_stats | findstr Mockito");
        System.out.println();
    }

    static void scenario4() {
        // Architecture: team standard for test slices.
        System.out.println("--- Scenario 4: team bans static mocks without ADR ---");
        System.out.println("symptom:  Mockito inline static mock hid missing dependency injection");
        System.out.println("cause:    static mocking replaced design feedback with silence");
        System.out.println("why:      tests green while production still used global singletons");
        System.out.println("fix:      inject collaborators; reserve static mock for legacy seams only");
        System.out.println("verify:   ArchUnit rule no Mockito.mockStatic without // LEGACY tag");
        System.out.println("next:     document port interfaces in module README");
        System.out.println();
    }

    public static void main(String[] args) {
        // Header helps you find this output inside noisy CI logs or IDE runs.
        System.out.println("=== Day85Intermediate: four Mockito/JUnit war stories ===");
        System.out.println("Tip: run with mvn -Dtest=Day85Intermediate test from the module root.");
        System.out.println();
        // Order matches a typical escalation: domain honesty, timing, cost, governance.
        scenario1();
        scenario2();
        scenario3();
        scenario4();
        System.out.println("=== End of scenario pack ===");
        System.out.println("When escalating, attach Surefire XML and JDK versions.");
    }
}`;
  const output = `=== Day85Intermediate: four Mockito/JUnit war stories ===
Tip: run with mvn -Dtest=Day85Intermediate test from the module root.

--- Scenario 1: mocked Money.value() hides a real rounding bug ---
symptom:  unit tests green, staging shows wrong totals on tax lines
cause:    stub returned pretty literals, real Money rounds half-up
why:      tests never executed production arithmetic code path
fix:      use real value objects for math; mock only IO ports
verify:   mvn -Dtest=PricingTest test + code coverage on domain package
next:     add one integration test hitting calculator with JDBC fake

--- Scenario 2: flaky pipeline only on Linux CI ---
symptom:  Surefire random failures on verify(mock).save(any())
cause:    race between async publisher and test thread
why:      Thread.sleep timing differs across CPU scheduling
fix:      inject Clock or use Awaitility with bounded wait
verify:   mvn test with -Djunit.jupiter.execution.parallel.enabled=false first
next:     jcmd <pid> Thread.print if fork hangs after change

--- Scenario 3: suite time jumped after adding @Mock for every DTO ---
symptom:  CI test stage 3x slower, Metaspace grows in Grafana
cause:    Mockito synthesized classes for types that did not need mocking
why:      each mock adds class metadata and JIT warmup cost
fix:      use real DTOs; mock only boundary interfaces
verify:   mvn -DtrimStackTrace=false test with -Xlog:class+load:stderr:off
next:     jcmd <pid> GC.class_stats | findstr Mockito

--- Scenario 4: team bans static mocks without ADR ---
symptom:  Mockito inline static mock hid missing dependency injection
cause:    static mocking replaced design feedback with silence
why:      tests green while production still used global singletons
fix:      inject collaborators; reserve static mock for legacy seams only
verify:   ArchUnit rule no Mockito.mockStatic without // LEGACY tag
next:     document port interfaces in module README

=== End of scenario pack ===
When escalating, attach Surefire XML and JDK versions.
`;
  return { code, output };
}

function buildAdvCode() {
  const code = `package arch.day85;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Tech lead triage: classify a failing test incident without live I/O.
 * Staff use this flow before blaming product code for red CI.
 * Blocks are signals, pattern map, checklist, then ordered response.
 */
public class Day85Advanced {

    // Signal record keeps log flags you would grep from Surefire text.
    record Signal(String name, boolean strictStubbing, boolean agentError, boolean flakyTiming) {}

    public static void main(String[] args) {
        // Walk blocks top to bottom; skipping Block 2 is how teams thrash for hours.
        System.out.println("=== Block 1: collect signals from logs ===");
        List<Signal> signals = List.of(
            new Signal("build-1842", true, false, false),
            new Signal("build-1843", false, true, false),
            new Signal("build-1844", false, false, true)
        );
        for (Signal s : signals) {
            System.out.println(s.name() + " strict=" + s.strictStubbing() + " agent=" + s.agentError() + " timing=" + s.flakyTiming());
        }
        System.out.println();

        // Map stubbing and agent errors to the fix vocabulary your team already uses.
        System.out.println("=== Block 2: score likely root cause ===");
        Map<String, String> action = new LinkedHashMap<>();
        action.put("strict_stubbing", "remove unused stubs or mark lenient with comment");
        action.put("agent_error", "align JDK image, check surefire argLine add-opens for Java 17+");
        action.put("flaky_timing", "replace sleep with Awaitility or deterministic scheduler");
        for (Map.Entry<String, String> e : action.entrySet()) {
            System.out.println("pattern " + e.getKey() + " -> " + e.getValue());
        }
        System.out.println();

        // Table rows are paste-ready into incident tickets or Slack war rooms.
        System.out.println("=== Block 3: on-call checklist table ===");
        Map<String, String> table = new LinkedHashMap<>();
        table.put("UnnecessaryStubbingException", "mvn -Dtest=... test single method; delete stale when()");
        table.put("MockitoException self attach", "jcmd <pid> VM.version; verify JDK has attach allowed");
        table.put("Random Surefire failure", "disable parallel; jcmd Thread.print on stuck fork");
        for (Map.Entry<String, String> e : table.entrySet()) {
            System.out.println(e.getKey() + " | " + e.getValue());
        }
        System.out.println();
        System.out.println("=== Block 4: recommended order of operations ===");
        System.out.println("1) reproduce single test with mvn -Dtest=Class#method");
        System.out.println("2) align JDK major with CI container java -version");
        System.out.println("3) if hang persists run jcmd <pid> Thread.print on worker");
        System.out.println("4) only then widen scope to full module test");
        // Done: attach this output beside Surefire XML in the ticket.
        //
        //
    }
}`;
  const output = `=== Block 1: collect signals from logs ===
build-1842 strict=true agent=false timing=false
build-1843 strict=false agent=true timing=false
build-1844 strict=false agent=false timing=true

=== Block 2: score likely root cause ===
pattern strict_stubbing -> remove unused stubs or mark lenient with comment
pattern agent_error -> align JDK image, check surefire argLine add-opens for Java 17+
pattern flaky_timing -> replace sleep with Awaitility or deterministic scheduler

=== Block 3: on-call checklist table ===
UnnecessaryStubbingException | mvn -Dtest=... test single method; delete stale when()
MockitoException self attach | jcmd <pid> VM.version; verify JDK has attach allowed
Random Surefire failure | disable parallel; jcmd Thread.print on stuck fork

=== Block 4: recommended order of operations ===
1) reproduce single test with mvn -Dtest=Class#method
2) align JDK major with CI container java -version
3) if hang persists run jcmd <pid> Thread.print on worker
4) only then widen scope to full module test
`;
  return { code, output };
}

const PITFALLS = [
  'Forgetting **@ExtendWith(MockitoExtension.class)** on a **JUnit** **5** test class — every **@Mock** field stays **null** and the next call throws **NullPointerException** inside **@BeforeEach**; add the extension or use **MockitoAnnotations.openMocks**; verify by running **mvn** **-Dtest=YourTest** **test** and checking fields are non-null in debugger.',
  'Calling **when**(realObject.**method**()) without a **spy** — **Mockito** throws **NotAMockException** because **when** expects a proxy; wrap with **spy**(realObject) or stub only interfaces; verify by rerunning the single failing test method in isolation.',
  'Using **verify** on every private helper while the public behavior never changes — tests become brittle and block refactors with no customer value; keep **verify** for port boundaries only; verify by counting **verify** lines per test in review and rejecting spikes.',
  'Sharing a **static** **mutable** **SimpleDateFormat** across parallel **Surefire** forks — intermittent **ArrayIndexOutOfBoundsException** appears only under load; replace with **java.time** or per-test instances; verify by running **mvn** **test** with **parallel** enabled ten times.',
  'Letting every team invent its own **Mockito** **strictness** policy — half the services use **lenient()** to silence noise and hide dead collaborators; publish a standard: strict by default, **lenient** only with comment ticket; verify with a **checkstyle** or **ArchUnit** grep for lenient usage.',
  'Skipping **CI** matrix on **JDK** minor bumps — **Byte Buddy** and **Mockito** patch releases diverge and **inline** mocking breaks only on the build server; pin **toolchain** in **Maven**/**Gradle** and test twice yearly; verify **docker** **run** **java** **-version** matches **mvn** **-v**.',
  'Running **Surefire** with default **Metaspace** in a huge suite that generates thousands of mocks — under peak **CI** parallelism you hit **OutOfMemoryError: Metaspace** after twenty minutes; raise **MaxMetaspaceSize** intentionally or reduce mocks; verify with **jcmd** **<pid>** **VM.flags** and **GC.heap_info** on the fork.',
  'Mocking **System** or **UUID** globally without resetting — tests interfere when **parallel** classes read different random seeds; prefer injected **Clock**/**Supplier**; verify by running the full suite with **junit.jupiter.execution.parallel.mode.default.classes** set to **concurrent**.'
];

function fuProd() {
  return {
    question: 'How does **JUnit** **5** and **Mockito** show up in **production** or **CI** incidents?',
    answer:
      'Your **CI** job turns red only on Linux agents because **Surefire** enables **parallel** classes while your laptop did not. The failure is **UnnecessaryStubbingException** after a refactor removed a call path. You reproduce with **mvn** **-Dtest=PaymentServiceTest#chargesTax** **test** and open **target/surefire-reports**. You align **JDK** **21** patch levels so **Byte Buddy** matches **Mockito** **5**.'
  };
}

function fuTrap() {
  return {
    question: 'What is a common trap people believe about **Mockito**?',
    answer:
      'People think **mock**(**everything**) is safe speed. It hides **JSON** mapping bugs until **HttpMessageNotReadableException** hits **production**. Prefer **MockMvc** or contract tests for serialization. Trap fix: mock **ports**, keep **value** objects real unless IO-bound.'
  };
}

function ca(core, err, cmd, ver) {
  const tail =
    ' Teams still get burned when **CI** uses a different **JDK** patch than laptops, so **Byte Buddy** and **Mockito** versions disagree and **inline** mocks fail only on Linux agents. Capture **./mvnw** **-v** output beside **docker** **run** **java** **-version** from the build image. When forks hang, **jcmd** **<pid>** **Thread.print** shows whether **Mockito** is stuck generating proxies. This discipline matters because **Java** **21** tightened warnings around dynamic agents while **JUnit** **5.10** changed parallel defaults that interact with **strict** stubbing.';
  return `${core} At the **JVM** level **Surefire** still forks a process, loads your **test** **bytecode**, and runs **@Test** methods like any other **main**-less entry. ${err} You shorten mean time to clue with ${cmd}. ${ver}${tail}`;
}

const CONCEPTUAL_Q = [
  ['What is **JUnit** **5** **Jupiter**?', '**JUnit** **5** is the fifth generation test framework API. The **Jupiter** engine discovers **@Test** methods, runs lifecycle callbacks, and reports failures.', '**AssertionFailedError** bubbles when expectations mismatch.', '**mvn** **-Dtest=SampleTest** **test**', '**Java** **17** made **sealed** types more common, which changes what **Mockito** can subclass without **inline** **mock-maker**.'],
  ['What does **@Test** do?', 'It marks a method the test engine must execute and report.', 'Missing **@Test** means silent skips that look like green builds.', '**mvn** **test** with **-Dsurefire.printSummary=false** still lists zero tests run.', '**JUnit** **5.10** refined **parallel** config keys compared with **5.8**.'],
  ['What is **Mockito** in one sentence?', '**Mockito** builds runtime proxies or subclasses that intercept calls.', '**NotAMockException** means you passed a plain object to **when**.', '**javap** **-p** **MockClass** (generated) shows synthetic methods.', '**Mockito** **5** defaults expect **inline** **mock-maker** for **final** types on modern **JDK**.'],
  ['Why use **@ExtendWith(MockitoExtension.class)**?', 'It wires **@Mock** and **@InjectMocks** before each test.', '**NullPointerException** on mocks is the usual smell without it.', '**mvn** **-X** **test** prints extension registration in debug logs.', '**Spring** **Boot** **3** aligns on **JUnit** **5** baseline behaviors from **Java** **17**.'],
  ['**when** versus **doAnswer**?', '**when** returns fixed values; **doAnswer** runs custom code per invocation.', 'Wrong choice makes tests hide side effects real code relies on.', '**mvn** **-DtrimStackTrace=false** exposes stack lines inside **doAnswer** lambdas.', '**Java** **21** records often need **doAnswer** when copying immutable builders.'],
  ['**verify** versus stubbing?', 'Stubbing sets return values; **verify** asserts an interaction happened.', 'Over-**verify** creates brittle tests that break on harmless refactors.', '**jcmd** rarely needed here; use **Surefire** report counts of failures.', '**JUnit** **5** **dynamic** tests change how many invocations **verify** sees.'],
  ['What is **ArgumentCaptor**?', 'It records arguments passed to mocks for deeper assertions.', 'Capturing the wrong overload yields confusing **AssertionError** messages.', '**mvn** **-Dtest=...** isolates the captor test.', '**Java** **11** **var** simplifies captor generics readability in tests.'],
  ['What is **strict stubbing**?', 'Unused **when** stubs fail the test to prevent lying setups.', '**UnnecessaryStubbingException** is the hallmark error.', '**mvn** **-Dmockito.strictness=STRICT_STUBS** forces the behavior explicitly.', '**Mockito** **4** moved defaults closer to strictness users expect in **CI**.'],
  ['**@InjectMocks** pitfalls?', '**Mockito** tries constructor or field injection ordering.', '**MockitoException** about zero-args constructor confuses teams.', '**javap** **-p** **Service.class** shows which ctor exists.', '**Java** **17** records may need explicit ctor matching for injection.'],
  ['How do **parameterized** tests help?', '**@ParameterizedTest** runs the same logic on many inputs.', 'Bad datasets hide edge cases with false confidence.', '**Gradle** **--tests** pattern filters parameterized cases.', '**JUnit** **5.9** improved naming templates for parameterized display names.'],
  ['What is a **spy**?', 'A **spy** wraps a real object and can stub selected methods.', 'Partial stubs can leave dangerous real methods executing.', '**mvn** **test** with **-Dtest=...** plus debugger breakpoints on spy.', '**Mockito** **inline** interacts with **final** methods differently on **JDK** **21**.'],
  ['How do you test exceptions in **JUnit** **5**?', '**assertThrows** captures expected exception types.', 'Swallowing exceptions in **try/catch** inside tests hides failures.', '**Surefire** XML still records **AssertionFailedError** vs runtime exceptions.', '**Java** **17** pattern matching can simplify **assertThrows** follow-up checks.'],
  ['What are **lifecycle** methods?', '**@BeforeEach** and **@AfterEach** reset state around each **@Test**.', 'Leaks between tests cause order-dependent failures.', '**mvn** **test** with **-Djunit.jupiter.execution.parallel.enabled=false** exposes order bugs.', '**JUnit** **5** extension model replaced **@Rule** chains from **JUnit** **4**.'],
  ['How does **classpath** affect tests?', '**Surefire** builds an ordered **classpath** for forked **JVM**s.', 'Duplicate classes create **NoSuchMethodError** only in **CI**.', '**mvn** **dependency:tree** finds conflicting **JUnit** artifacts.', '**Java** **11** **JPMS** adds **module-path** concerns for test agents.'],
  ['What is **Mockito** **inline** **mock-maker**?', 'It enables mocking **final** classes via agents.', '**MockitoException** about self-attach appears in slim containers.', '**jcmd** **<pid>** **VM.version** confirms attach-capable **JDK**.', '**Java** **21** continues tightening dynamic agent warnings in logs.'],
  ['How do you reduce flaky async tests?', 'Prefer **Awaitility** or injected **Executor** fakes over **sleep**.', 'Flaky tests erode trust and hide real **regressions**.', '**jcmd** **Thread.print** shows parked threads waiting on latches.', '**JUnit** **5** **parallel** modes interact badly with shared static clocks.'],
  ['What is the test pyramid?', 'Many fast unit tests, fewer integration, rare **e2e**.', 'Over-mocking at the base creates a green tower on sand.', '**mvn** **verify** phases separate unit versus **failsafe** integration.', '**Spring** **Boot** **3** encourages **Testcontainers** for integration slices on **Java** **17**.'],
  ['How do **Spring** tests relate to **Mockito**?', '**@MockBean** replaces **Spring** beans with mocks in slices.', 'Wrong slice annotation loads half the context and **NPE**s.', '**mvn** **-Dtest=...** plus **spring.test.context.cache** logging.', '**Java** **17** baseline is required for **Spring** **Boot** **3** test starters.']
];

function buildConceptual() {
  return CONCEPTUAL_Q.map(([q, a1, e2, c3, v4], i) => ({
    question: q,
    answer: ca(a1, e2, c3, v4),
    followUps: [fuProd(), fuTrap()]
  }));
}

const CB_QUESTIONS = [
  'What does this print or throw?\n```java\nimport static org.mockito.Mockito.*;\nimport java.util.List;\nclass X { public static void main(String[] a) {\n  List<String> m = mock(List.class);\n  when(m.get(0)).thenReturn("a");\n  System.out.println(m.get(0));\n}}\n```',
  'What happens?\n```java\nimport static org.mockito.Mockito.*;\nclass Y { interface P { int v(); }\n  public static void main(String[] a) {\n    P p = mock(P.class);\n    when(p.v()).thenReturn(1);\n    System.out.println(p.v());\n  }\n}\n```',
  'Output?\n```java\nimport static org.mockito.Mockito.*;\nclass Z { interface R { String s(); }\n  public static void main(String[] a) {\n    R r = mock(R.class);\n    System.out.println(r.s());\n  }\n}\n```',
  'Does this compile?\n```java\nimport static org.mockito.Mockito.*;\nclass A { interface S { void go(int x); }\n  void t() {\n    S s = mock(S.class);\n    when(s.go(anyInt())).thenReturn(null);\n  }\n}\n```',
  'What breaks?\n```java\nimport static org.mockito.Mockito.*;\nclass B { interface T { void x(int a, String b); }\n  void t() {\n    T m = mock(T.class);\n    when(m.x(1, anyString())).thenReturn(null);\n  }\n}\n```',
  'Behavior?\n```java\nimport static org.mockito.Mockito.*;\nclass C { interface U { int add(int a,int b);} \n  public static void main(String[] a) {\n    U u = mock(U.class);\n    when(u.add(1,2)).thenReturn(3);\n    System.out.println(u.add(1,2)+u.add(2,2));\n  }\n}\n```',
  'Result?\n```java\nclass D { static int x = 0;\n  @org.junit.jupiter.api.Test void t() { x++; org.junit.jupiter.api.Assertions.assertEquals(1,x);}\n  @org.junit.jupiter.api.Test void u() { x++; org.junit.jupiter.api.Assertions.assertEquals(2,x);}\n}\n```',
  'Conceptually what is wrong?\n```java\nimport static org.mockito.Mockito.*;\nclass E { interface Repo { String load(String id);} \n  String svc(Repo r,String id){ return r.load(id).toUpperCase(); }\n}\n```',
  'What does captor record?\n```java\nimport static org.mockito.Mockito.*;\nimport org.mockito.ArgumentCaptor;\nclass F { interface G { void save(String x);} \n  void run(G g){ g.save("hi"); ArgumentCaptor<String> c=ArgumentCaptor.forClass(String.class); verify(g).save(c.capture()); System.out.println(c.getValue());}\n}\n```',
  'Parallel safety?\n```java\nclass H { static StringBuilder sb = new StringBuilder();\n  @org.junit.jupiter.api.Test void one(){ sb.append("a");}\n  @org.junit.jupiter.api.Test void two(){ sb.append("b");}\n}\n```',
  'Inline versus default?\n```java\n// mock-maker-inline comment only — final class mocking requires agent\nrecord Point(int x,int y){}\n```',
  'Lifecycle?\n```java\nimport org.junit.jupiter.api.*;\nclass L { static int c=0; @BeforeEach void b(){c++;} @Test void t(){ Assertions.assertEquals(1,c);} }\n```'
];

const CB_TAIL =
  ' **Surefire** still loads real **bytecode** for each mock class, so huge suites stress **Metaspace** the same way a leaking classloader would. Cross-check your **JDK** minor version against **mockito-core** release notes because **Byte Buddy** picks different strategies per **Java** **LTS**. When two machines disagree, run **java** **-version** and **./mvnw** **-v** side by side before you blame business logic.';

function cbAns(i) {
  const bodies = [
    '**Mockito** stubs **List.get** to return **"a"**, so **println** prints **a** without a real **ArrayList**. At runtime **Byte Buddy** generated a proxy implementing **List** that intercepts **get**. If you forgot **when**, **get** would return **null** and later code could **NPE**. Use **mvn** **test** on a tiny module to watch **Surefire** load the mock class. **Java** **17** module rules occasionally require **add-opens** for the agent.',
    '**when**(**p.v**()).**thenReturn**(1) makes the mock return **1**, so **println** prints **1**. The **JVM** still executes the mock handler table inside the generated subclass. Production risk is stubbing business math you never execute for real. **javap** **-c** on the mock (if dumped) shows forwarded calls. **Mockito** **5** prefers **inline** mocking for interfaces and classes alike on **JDK** **21**.',
    'Unstubbed **mock** method returns **null** for reference return type **String**, so **println** prints the word **null**. This is default **Mockito** behavior: zero interaction stub means **null** or primitives default. Production lesson: never assert on unstuffed collaborators in real services. **jcmd** is not needed; **Surefire** stack traces suffice. **Java** **11**+ **String** lines are still **null**-safe here.',
    '**when**(**s.go**(**anyInt**())) is invalid because **go** returns **void**; you must use **doNothing**() or **doAnswer** for void methods. **javac** fails or **Mockito** rejects the chain depending on setup. This catches seniors who only memorized **when**/**thenReturn**. Fix with **doNothing**().**when**(s).**go**(anyInt()). **JUnit** **5** will not even run if compile fails.',
    'Mixing raw **1** with **anyString**() in the same call throws **InvalidUseOfMatchersException** at runtime when the mock runs. **Mockito** requires all arguments be matchers or all concrete. Fix by using **eq**(1) and **anyString**() together. This shows up in **CI** when tests order differs. **Java** **17** does not change matcher rules.',
    'First **add**(1,2) returns stubbed **3**, second **add**(2,2) is unstuffed so returns **0** for **int** primitive default, printing **3**. This surprises teams who assume symmetric stubbing. Shows **Mockito** defaulting rules. Use **ArgumentMatchers** **anyInt**() if you meant wildcard. **Surefire** XML records the printed value in logs if captured.',
    'Mutable **static** **x** makes **order-dependent** tests; with parallel or reorder, **assertEquals** fails unpredictably. **JUnit** **5** runs tests in non-guaranteed order unless fixed. Fix by removing **static** **mutable** or using **TestInstance** **PER_METHOD** resets. **jcmd** **Thread.print** shows parallel workers. **Java** **21** **virtual** threads amplify shared static risk if misused.',
    'Snippet is fine structurally; risk is mocking **Repo** while claiming you tested **svc** logic with real persistence rules. **Mockito** returns **null** **load** unless stubbed, so **toUpperCase** would **NPE**. Always stub **load** or use fake **Repo**. **mvn** **test** exposes **NPE** quickly. **Spring** teams often replace with **@MockBean** in slices.',
    '**ArgumentCaptor** captures **"hi"** passed to **save**, so **println** prints **hi**. **verify** ensures the interaction happened once. This pattern audits payloads sent to messaging gateways. **javap** shows synthetic **capture** helpers. **Mockito** **4**+ **captor** generics are stricter.',
    'Shared **StringBuilder** across tests is unsafe with **parallel** **JUnit** **5**; interleaving produces flaky lengths. Default **PER_METHOD** lifecycle still shares **static** field. Fix: instance field or **@BeforeEach** reset. **jcmd** may show contention. **Java** **17** **parallel** stream in build tools can add noise.',
    '**Record** **Point** can be mocked only with **inline** **mock-maker** and agent attachment; comment reminds that **final** semantics apply. Without **inline**, **Mockito** cannot mock **records** on older configs. **CI** must allow **Byte Buddy** attach. **Java** **21** records are common DTOs in services.',
    '**@BeforeEach** runs before **@Test**, so **c** becomes **1** before assertions, test passes in isolation. If another test mutates **static** **c**, coupling appears. Prefer non-static fields. **Surefire** fork-per-module isolates some pollution. **JUnit** **5.10** lifecycle tracing helps debugging extensions.'
  ];
  return (bodies[i] || bodies[0]) + CB_TAIL;
}

function buildCodeBased() {
  return CB_QUESTIONS.map((q, i) => ({
    question: q,
    answer: cbAns(i),
    followUps: [
      { question: 'What breaks in **CI** if you ignore this behavior?', answer: fuProd().answer },
      { question: 'What **Mockito** trap does this expose?', answer: fuTrap().answer }
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
  '\n\nDeeper runbook: stash **target/surefire-reports** **TEST-*.xml** next to **jcmd** output because leads compare machine-readable failures faster than screenshots. When **parallel** mode is on, reproduce once with **-Djunit.jupiter.execution.parallel.enabled=false** to prove ordering, then fix the root cause instead of leaving that flag as a crutch. **Java** **21** **stderr** sometimes prints **WARNING** lines about **dynamic** agents before **Mockito** throws; grep logs before you rewrite domain code. If **Metaspace** climbs only during integration tests, compare **forkCount** with available **CI** agents so you do not exhaust memory across workers. Record **mockito-core** and **byte-buddy** versions in the incident timeline so the next **JDK** bump does not reopen the same ticket.';

const SENIOR_BLOCK = (a, b, c, d) =>
  `**Immediate response:** ${a}\n\n**Root cause:** ${b}\n\n**Fix:** ${c}\n\n**Prevention:** ${d}\n\nStaff note: capture **mvn** **-e** **-X** test output and **jcmd** **<pid>** **Thread.print** from the stuck **Surefire** worker, attach **Surefire** **XML** to the ticket, and align **JDK** **21** **patch** with **Mockito** **5** **release** notes before closing. Add **javap** **-p** on the failing test class if you suspect **classpath** shadowing between **junit-jupiter-engine** versions. Compare **Metaspace** before and after the suite with **jcmd** **GC.class_stats** when **OutOfMemoryError** mentions **Metaspace**. Document the **exact** **surefire** **forkCount** and **reuseForks** flags because they change how **Mockito** caches generated classes across methods.${SENIOR_TAIL}`;

function buildSenior() {
  return [
    senior(
      'Your **CI** fails only on agents with **parallel** tests enabled: **UnnecessaryStubbingException** floods **Surefire** reports after a refactor.',
      SENIOR_BLOCK(
        'Run **mvn** **-Dtest=FailingTest** **test** on an agent with parallel on, download **target/surefire-reports**, and grep for **UnnecessaryStubbingException**.',
        '**Strict stubbing** flags **when** clauses that no code path touches anymore. **JUnit** **5** parallel execution reorders tests so unused stubs differ across machines.',
        'Delete stale **when** lines or mark rare globals with **lenient**() and a comment ticket. Re-run **mvn** **test** with **-Djunit.jupiter.execution.parallel.enabled=true**.',
        'Add a **code review** checklist item: every **when** must map to an observable behavior or documented **lenient** reason.'
      )
    ),
    senior(
      '**Production** shows **HttpMessageNotReadableException** after a **JSON** field rename, but **unit** tests stayed green.',
      SENIOR_BLOCK(
        'Open **APM** trace, confirm payload shape, and run one **MockMvc** or contract test locally with real **ObjectMapper** settings.',
        '**Unit** tests mocked **WebClient** or **RestTemplate** and never deserialized real **JSON**, so **Jackson** never ran.',
        'Add slice tests with **@JsonTest** or **WebMvcTest** that load **ObjectMapper** beans; keep **Mockito** only at IO edges.',
        'Require **consumer-driven** contract tests in **CI** for any public **REST** **API** change.'
      )
    ),
    senior(
      '**Surefire** worker **JVM** hangs at **100**% **CPU** after upgrading to **Java** **21** on **CI** only.',
      SENIOR_BLOCK(
        'Identify worker **pid** with **jps** **-l**, run **jcmd** **<pid>** **Thread.print**, and capture twenty seconds of output.',
        '**Byte Buddy** or **Mockito** agent attachment retries when **attach** path is blocked, or **inline** mocking spins while generating many **final** mocks.',
        'Add **surefire** **argLine** **--add-opens** flags documented for **JDK** **21**, or pin **mockito-core** version compatible with agent mode.',
        'Add **CI** image smoke test that runs **mvn** **-Dtest=AgentSmokeTest** **test** before merging platform upgrades.'
      )
    ),
    senior(
      'Flaky **verify**(**repo**).**save**(**any**()) fails one in fifty **CI** runs.',
      SENIOR_BLOCK(
        'Temporarily disable **parallel** with **junit.jupiter.execution.parallel.enabled=false** and measure failure rate.',
        'Async repository writes complete after the assertion window; **Thread.sleep** races the scheduler.',
        'Inject a **CountDownLatch** test double or use **Awaitility** **await**().**untilAsserted** around **verify**.',
        'Ban **Thread.sleep** in tests via **checkstyle**; provide **Clock** and **Executor** test doubles instead.'
      )
    ),
    senior(
      'Team wants **mockStatic** everywhere to avoid refactoring **legacy** **UUID.randomUUID** calls.',
      SENIOR_BLOCK(
        'Schedule a thirty-minute design huddle and show **mockStatic** cost: slower **Metaspace** growth and opaque failures.',
        'Static mocking hides missing **dependency** **injection**; **JVM** still executes real statics unless every path is mocked.',
        'Introduce **Supplier**<**UUID**> port, inject in **production**, replace static calls incrementally with **ArchUnit** gate.',
        'Document **ADR**: static mock allowed only in **//** **LEGACY** **BRIDGE** modules with expiry date.'
      )
    ),
    senior(
      'After **JDK** bump, **Metaspace** **OutOfMemoryError** appears only during full **integration** test phase.',
      SENIOR_BLOCK(
        'Re-run failing module with **MAVEN_OPTS=-XX:MaxMetaspaceSize=512m** and capture **hs_err_pid** file.',
        'Thousands of **inline** mocks and **CGLIB** proxies inflate class metadata; **forked** **Surefire** multiplies loaders.',
        'Lower **parallelism**, split suites, or raise **MaxMetaspaceSize** with CFO-approved **CI** cost note.',
        'Track **Metaspace** after **GC** with **jcmd** **GC.class_stats** weekly on **CI** agents.'
      )
    )
  ];
}

const WRONG = [
  'You should call **System.gc()** at the end of every **@Test** to make **Mockito** faster.',
  '**Mockito** proves your **JSON** contracts are correct if **unit** tests are green.',
  '**@InjectMocks** always picks the constructor you mentally prefer without ambiguity.',
  '**verify** every private method so **code coverage** stays at one hundred percent.',
  '**Parallel** **JUnit** **5** tests are safe with shared **static** **mutable** fields.',
  '**Mockito** can mock **everything** including your core **domain** rules with no risk.',
  '**CI** failures on **Linux** mean the tests are wrong and **Windows** is the source of truth.',
  '**Lenient** stubbing should be the default so **CI** never blocks merges.'
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
    'What runs **@Test** methods in **JUnit** **5**?',
    { A: 'The **Maven** compiler plugin', B: 'A test engine such as **Jupiter**', C: 'The **java** launcher directly', D: '**Gradle** wrapper only' },
    'B',
    '**Jupiter** is the **JUnit** **5** test engine; **Surefire** invokes it. **javac** only compiles. **java** without a test runner would not discover **@Test**.'
  );
  B(
    'theory',
    'What does **Mockito** primarily create?',
    { A: 'Real database rows', B: 'Test doubles such as **mocks**', C: 'Production **JWT** tokens', D: '**Kubernetes** pods' },
    'B',
    '**Mockito** builds proxies or synthetic subclasses. The other choices are unrelated.'
  );
  B(
    'theory',
    'Which annotation integrates **Mockito** with **JUnit** **5** lifecycle?',
    { A: '@RunWith(MockitoJUnitRunner.class)', B: '@ExtendWith(MockitoExtension.class)', C: '@SpringBootTest', D: '@Entity' },
    'B',
    '**JUnit** **5** uses **@ExtendWith**. **@RunWith** is **JUnit** **4** style.'
  );
  B(
    'theory',
    'What does **verify** do?',
    { A: 'Stub a return value', B: 'Assert an interaction happened', C: 'Start **Spring**', D: 'Compile **bytecode**' },
    'B',
    '**verify** checks calls. **when**/**thenReturn** stubs.'
  );
  B(
    'code',
    'What prints?\n```java\nimport static org.mockito.Mockito.*;\ninterface R{int v();}\nclass T{public static void main(String[]a){R r=mock(R.class);when(r.v()).thenReturn(7);System.out.println(r.v());}}\n```',
    { A: '0', B: '7', C: 'null', D: 'throws **NotAMockException**' },
    'B',
    'Stubbed **v** returns **7**. **NotAMockException** happens if **r** were not a mock.'
  );
  B(
    'code',
    'What happens if **when** mixes **anyInt**() and literal **5** incorrectly?',
    { A: 'Compiles fine', B: '**InvalidUseOfMatchersException**', C: 'Returns **null**', D: 'Starts **GC**' },
    'B',
    '**Mockito** requires consistent matcher usage per invocation.'
  );
  B(
    'code',
    '**assertThrows** expects what?',
    { A: 'A void method', B: 'An executable that should throw', C: 'A **mock** only', D: 'A **static** block' },
    'B',
    '**assertThrows** wraps **Executable** lambdas in **JUnit** **5**.'
  );
  B(
    'theory',
    'Why avoid mocking **domain** **value** objects?',
    { A: 'They compile slower', B: 'You hide real math and invariants', C: '**IDE** forbids it', D: '**Docker** rejects it' },
    'B',
    'Value objects are cheap; mocking them loses real behavior.'
  );
  for (let i = 0; i < 4; i++) {
    I(
      'theory',
      `Intermediate theory ${i + 1}: strict stubbing helps detect what?`,
      { A: 'Slow CPUs', B: 'Unused **when** clauses', C: 'Network **DNS**', D: 'GUI flicker' },
      'B',
      'Strict stubbing fails on unused stubs via **UnnecessaryStubbingException**.'
    );
  }
  for (let i = 0; i < 5; i++) {
    I(
      'code',
      `What is wrong here?\n\`\`\`java\nvoid bad${i}(){\n  Object o = new Object();\n  org.mockito.Mockito.when(o.toString()).thenReturn("x");\n}\n\`\`\``,
      { A: 'Nothing', B: '**o** is not a **mock**', C: 'Missing **import** **java.util**', D: 'Needs **@SpringBootTest**' },
      'B',
      '**when** requires a **mock** or **spy**, not a plain **Object**.'
    );
  }
  for (let i = 0; i < 3; i++) {
    I(
      'theory',
      `Flaky test pattern ${i + 1}: what is the smell?`,
      { A: '**Thread.sleep** without condition', B: 'Using **assertEquals**', C: 'Using **@Test**', D: 'Using **Maven**' },
      'A',
      'Sleep races the scheduler; prefer **Awaitility** or fakes.'
    );
  }

  A(
    'theory',
    'Your **Java** **21** **CI** throws **MockitoException** about self-attach. Most likely fix?',
    { A: 'Delete all tests', B: 'Allow agent attach or add **--add-opens** per docs', C: 'Downgrade to **Java** **8** only', D: 'Disable **CPU**' },
    'B',
    'Agents need attach permissions; **JDK** **17**+ tightened module opens.'
  );
  A(
    'theory',
    'Why might **inline** **mock-maker** increase **Metaspace**?',
    { A: 'It prints larger logs', B: 'It generates many synthetic classes', C: 'It uses **GPU**', D: 'It disables **GC**' },
    'B',
    'Each mock type can create new **Class** objects in **Metaspace**.'
  );
  for (let i = 0; i < 3; i++) {
    A(
      'code',
      `After deploy, **REST** clients fail but unit tests green. Which gap ${i + 1}?`,
      { A: 'Missing slice or contract tests', B: 'Too many **assertTrue(true)**', C: 'Using **JUnit** **5**', D: 'Using **Git**' },
      'A',
      'Unit tests mocked away serialization; need slice or contract coverage.'
    );
  }
  for (let i = 0; i < 5; i++) {
    A(
      'theory',
      `On-call ${i + 1}: **Surefire** fork at **100**% **CPU**. First command?`,
      { A: '`jcmd <pid> Thread.print`', B: '`format C:`', C: '`ping google.com`', D: '`rm -rf target`' },
      'A',
      'Thread print shows where **Mockito** or **Byte Buddy** spins; never delete **target** blindly during incident.'
    );
  }

  return q;
}

const CHEATSHEET = `| Level | Concept | The rule in one line | Example or Command |
|-------|---------|----------------------|--------------------|
| Fresher | **@Test** | Marks a runnable check | **mvn** **-Dtest=MyTest** **test** |
| Fresher | **@Mock** | Fake collaborator | **@ExtendWith(MockitoExtension.class)** |
| Fresher | **when** | Stub return | **when**(repo.findById(1)).**thenReturn**(user) |
| Senior Dev | **verify** | Assert call happened | **verify**(repo).**save**(**any**()) |
| Senior Dev | **strict stubbing** | Unused **when** fails | **UnnecessaryStubbingException** |
| Senior Dev | **ArgumentCaptor** | Inspect args | **ArgumentCaptor**<**Order**> c = ... |
| Senior Dev | **spy** | Partial real object | **spy**(new **ArrayList**<>()) |
| Tech Lead | Test pyramid | Fast base, slow top | More **unit**, fewer **e2e** |
| Tech Lead | Slices | Test wiring | **@WebMvcTest** with **MockMvc** |
| Tech Lead | **CI** parity | Match **JDK** | **docker** **run** **java** **-version** |
| Staff | Agent attach | **inline** mocks need **JDK** help | **surefire** **argLine** **--add-opens** |
| Staff | Hang triage | See blocked threads | **jcmd** **<pid>** **Thread.print** |
| Staff | **Metaspace** | Classes cost memory | **jcmd** **GC.class_stats** |`;

export function buildDay85Sections() {
  const basic = buildBasicCode();
  const mid = buildMidCode();
  const adv = buildAdvCode();
  return [
    { type: 'why', title: 'Why JUnit 5 and Mockito matters', content: buildWhy() },
    { type: 'theory', title: 'Theory and Internals — JUnit 5 and Mockito', content: buildTheoryContent() },
    {
      type: 'code',
      title: 'Basic — JUnit 5 + Mockito reference card',
      language: 'java',
      filename: 'Day85Basic.java',
      level: 'basic',
      description: 'Print-only vocabulary for week-one learners.',
      code: basic.code,
      output: basic.output
    },
    {
      type: 'code',
      title: 'Intermediate — Four Mockito incidents',
      language: 'java',
      filename: 'Day85Intermediate.java',
      level: 'intermediate',
      description: 'Senior narration with diagnostic commands.',
      code: mid.code,
      output: mid.output
    },
    {
      type: 'code',
      title: 'Advanced — Triage matrix',
      language: 'java',
      filename: 'Day85Advanced.java',
      level: 'advanced',
      description: 'Tech lead printable checklist.',
      code: adv.code,
      output: adv.output
    },
    {
      type: 'diagram',
      title: 'Unit under test with mocked ports',
      diagramType: 'component',
      description: 'SUT calls port interfaces backed by Mockito proxies in tests.',
      plantuml:
        '@startuml\ntitle Day 85 — ports and mocks\nrectangle "Service (SUT)" as SUT\ninterface Repo\nSUT --> Repo : uses\nnote right of Repo : Mockito mock in tests\n@enduml'
    },
    { type: 'pitfalls', title: 'Common Pitfalls', items: PITFALLS },
    {
      type: 'exercise',
      title: 'Exercise — Mockito vocabulary (fresher)',
      audience: 'fresher',
      difficulty: 'Beginner',
      problem:
        'You are writing your first **JUnit** **5** drill file to learn **Mockito** words.\n\n1. Create **arch.day85.Day85FresherExercise** with **main**.\n2. Print one line that names **@Mock** and what it does.\n3. Print one line that contrasts **when** with **verify**.\n4. Print one line reminding you to add **@ExtendWith(MockitoExtension.class)** when using **@Mock** fields.',
      hints: [
        'Keep strings in **final** **String** constants.',
        'Use only **System.out.println**.',
        'Do not import **Mockito** if you only print teaching text.'
      ],
      solution: `package arch.day85;

/** Fresher drill: say the words before you annotate real tests. */
public class Day85FresherExercise {

    public static void main(String[] args) {
        // args unused so output is identical on every machine.
        final String mockLine = "@Mock builds a Mockito test double injected into the class under test.";
        // mockLine explains the annotation purpose without needing a running framework.
        System.out.println(mockLine);
        final String whenVerify = "when stubs return values; verify asserts a method was called on a collaborator.";
        // whenVerify separates stubbing from interaction assertions for interviews.
        System.out.println(whenVerify);
        final String ext = "Remember @ExtendWith(MockitoExtension.class) when @Mock fields would otherwise be null.";
        // ext prevents the classic NullPointerException story in week one.
        System.out.println(ext);
    }
}
`
    },
    {
      type: 'exercise',
      title: 'Exercise — CI triage card (staff)',
      audience: 'staff',
      difficulty: 'Advanced',
      problem:
        'Your **CI** module fails with **UnnecessaryStubbingException** only when **parallel** execution is on.\n\n1. Model three builds **b1**, **b2**, **b3** as **String** keys with booleans **parallelOn** and **strictMockito**.\n2. Store them in a **LinkedHashMap** preserving insertion order.\n3. Print the recommended first command for each key (**mvn** flag or **jcmd**).\n4. Print one line naming the **JUnit** **5** property that disables parallel classes.\n5. Print a **prevention** line about **code review** checklist for unused **when** stubs.',
      hints: [
        'Use **LinkedHashMap** not **HashMap** so println order is stable.',
        'Commands can be plain strings; you are not executing them.',
        'Tie **b1** to single-test reproduction, **b3** to **Thread.print** if hung.'
      ],
      solution: `package arch.day85;

import java.util.LinkedHashMap;
import java.util.Map;

/** Staff triage: deterministic println card for parallel Surefire + strict Mockito. */
public class Day85StaffExercise {

    record Build(String id, boolean parallelOn, boolean strictMockito) {}

    public static void main(String[] args) {
        // LinkedHashMap keeps the story order: happy path -> parallel fail -> hang.
        Map<String, String> firstCmd = new LinkedHashMap<>();
        firstCmd.put("b1", "mvn -Dtest=PaymentTest#one -e test");
        firstCmd.put("b2", "mvn -Djunit.jupiter.execution.parallel.enabled=false test");
        firstCmd.put("b3", "jcmd <pid> Thread.print on stuck surefire fork");

        // Model builds as compact records; real CI would parse Jenkins JSON instead.
        Build b1 = new Build("b1", false, true);
        Build b2 = new Build("b2", true, true);
        Build b3 = new Build("b3", true, true);

        System.out.println("=== Modeled builds ===");
        System.out.println(b1.id() + " parallel=" + b1.parallelOn() + " strict=" + b1.strictMockito());
        System.out.println(b2.id() + " parallel=" + b2.parallelOn() + " strict=" + b2.strictMockito());
        System.out.println(b3.id() + " parallel=" + b3.parallelOn() + " strict=" + b3.strictMockito());

        System.out.println("=== First command per key ===");
        for (Map.Entry<String, String> e : firstCmd.entrySet()) {
            System.out.println(e.getKey() + " -> " + e.getValue());
        }

        System.out.println("=== JUnit 5 property ===");
        System.out.println("junit.jupiter.execution.parallel.enabled=false disables parallel classes for isolation.");

        System.out.println("=== Prevention ===");
        System.out.println("PR checklist: every when() must reference code path or carry // LENIENT + ticket");

        // Staff signal: mention JDK parity because agent attach differs across images.
        System.out.println("=== JDK note ===");
        System.out.println("Align mvn -v Java home with CI image java -version before blaming Mockito 5 inline maker");

        // Optional teaching line ties strict stubbing to product honesty.
        System.out.println("=== Teaching ===");
        System.out.println("UnnecessaryStubbingException is a feature: it flags mocks that lie about real behavior");

        // Closing line references Surefire report path for auditors.
        System.out.println("=== Audit artifact ===");
        System.out.println("Attach target/surefire-reports/*.xml to the incident ticket");

        // Reminder: parallel + shared static still breaks even if Mockito is perfect.
        System.out.println("=== Shared state warning ===");
        System.out.println("Scan tests for static mutable fields when enabling parallel execution");

        // Byte Buddy note without importing Mockito keeps this file javac-friendly alone.
        System.out.println("=== Agent note ===");
        System.out.println("Inline mock-maker needs attach-friendly JDK; check surefire argLine add-opens");

        // Next step for service teams: slice test for JSON.
        System.out.println("=== Follow-up test type ===");
        System.out.println("Add @JsonTest or WebMvcTest if failures involve payloads, not domain math");
    }
}
`
    },
    {
      type: 'interview',
      title: 'Interview Drill — JUnit 5 and Mockito',
      conceptual: buildConceptual(),
      codeBased: buildCodeBased(),
      seniorScenario: buildSenior(),
      wrongAnswers: WRONG,
      jobSwitch: {
        resumeBullet: 'Reduced flaky CI noise forty percent by replacing static mocks with injected ports and Surefire tuning.',
        interviewPositioning:
          'When I join a team I scan **pom.xml** **surefire** **argLine** and **JDK** **toolchain** first, then I grep for **lenient** stubbing without comments. I add one **ArchUnit** rule that bans **mockStatic** outside legacy packages in week one so the pattern is visible in review.',
        starAnchor:
          'Situation: our payment service had green unit tests but weekly **JSON** breakages in staging. Task: restore confidence without slowing **CI**. Action: I replaced broad **WebClient** mocks with **WebMvcTest** slices plus **Testcontainers** for the ledger module and deleted two hundred stale **when** clauses causing **UnnecessaryStubbingException** noise. Result: **CI** time dropped twenty-two minutes average and staging deserialization incidents went to zero over the next quarter.'
      }
    },
    {
      type: 'mcq',
      title: 'MCQ — JUnit 5 and Mockito',
      description: 'Thirty questions across basic, intermediate, and advanced levels.',
      questions: buildMcq()
    },
    { type: 'cheatsheet', title: 'Cheatsheet — JUnit 5 and Mockito', content: CHEATSHEET }
  ];
}

