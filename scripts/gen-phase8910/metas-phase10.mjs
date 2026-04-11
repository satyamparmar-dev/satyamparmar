/** Phase 10 — days 85–90 (Testing, Performance, Interview Capstone) */

function LO10(title) {
  return [
    `Apply **${title}** with production-grade tests, tools, and measurable outcomes`,
    `Explain trade-offs between test types: unit, slice, integration, contract, e2e`,
    `Use profiling and benchmarking vocabulary correctly in senior interviews`,
    `Deliver behavioral answers with STAR structure tied to real architecture decisions`,
    `Run mock interviews with follow-up depth on testing and performance`,
    `Connect reliability practices from earlier phases to capstone scenarios`,
  ];
}

export const METAS_10 = [
  {
    day: 85,
    phaseNum: 10,
    phaseId: 'phase10',
    title: 'JUnit 5 and Mockito',
    T: 'JUnit 5 and Mockito',
    prereqs: ['Day 84', 'Day 83'],
    drillTags: ['JUnit 5', 'Mockito', 'unit test', 'mock', 'verify'],
    extraTags: ['Testing'],
    E: ['Implemented: JUnit 5 & Mockito', 'Focus: Mock UserRepository for UserService.findById tests.'],
    learningObjectives: LO10('JUnit 5 and Mockito'),
    conceptualExtra: [
      ['**@ExtendWith(MockitoExtension.class)** why?', 'Integrates Mockito with JUnit 5 lifecycle without JUnit 4 runners.'],
      ['**when** vs **doAnswer**?', 'Simple stubbing vs custom logic or side effects in mocks.'],
      ['**verify** vs **stub**?', 'Assert interactions happened vs define return behavior—both needed, do not confuse intent.'],
      ['**strict** **stubbing** **unused**?', 'Detects wasteful or misleading stubs—keeps tests honest.'],
      ['**ArgumentCaptor** **use**?', 'Inspect complex arguments passed to collaborators when matchers alone are awkward.'],
    ],
    codeExtra: [
      ['**@Mock** field', '// injected mock collaborator'],
      ['**@InjectMocks**', '// class under test gets mocks'],
      ['**verify(repo).findById**', '// interaction assertion'],
      ['**assertThrows** JUnit5', '// exception testing'],
      ['**@ParameterizedTest** mention', '// table-driven cases'],
    ],
    why: `**JUnit** **5** + **Mockito** are the **default** **Java** **unit** **testing** **stack**. Interviews expect **clean** **test** **doubles** and **verification** **discipline** without **over-mocking** **domain** **logic**.`,
    theory: `### Day 85 — **JUnit** **5** & **Mockito**\n\n### 1. Test pyramid\n**Fast** **unit** **base**; **fewer** **heavy** **integration**.\n\n### 2. Mockito basics\n**Stub** **behavior**, **verify** **calls**, **avoid** **static** **pitfalls**.\n\n### 3. JUnit 5\n**Lifecycle**, **assertions**, **extensions**.\n\n### 4. Design for test\n**Ports** **enable** **mock** **repositories**.\n\n### 5. Anti-patterns\n**Testing** **implementation** **details** **only**.\n\n### 6. Story\n**Flaky** **test** fixed by **removing** **Thread.sleep** and **using** **Awaitility** or **deterministic** **fakes**.`,
    basic: {
      title: 'Basic — JUnit 5 smoke',
      filename: 'Day85Basic.java',
      description: 'Assertion vocabulary.',
      code: `package arch.day85;

public class Day85Basic {
    public static void main(String[] args) {
        System.out.println("JUnit5: assertEquals(expected, actual) in @Test methods");
    }
}
`,
      output: `JUnit5: assertEquals(expected, actual) in @Test methods\n`,
    },
    intermediate: {
      title: 'Intermediate — Mockito vocabulary',
      filename: 'Day85Intermediate.java',
      description: 'Stub phrase.',
      code: `package arch.day85;

public class Day85Intermediate {
    public static void main(String[] args) {
        System.out.println("when(mock.find()).thenReturn(value)");
    }
}
`,
      output: `when(mock.find()).thenReturn(value)\n`,
    },
    advanced: {
      title: 'Advanced — Verify interactions',
      filename: 'Day85Advanced.java',
      description: 'Verification line.',
      code: `package arch.day85;

public class Day85Advanced {
    public static void main(String[] args) {
        System.out.println("verify(repo, times(1)).save(any())");
    }
}
`,
      output: `verify(repo, times(1)).save(any())\n`,
    },
    diagram: {
      title: 'Unit under test with mocks',
      description: 'SUT calls mocked ports.',
      plantuml: `@startuml
title Day 85 — Mocks
rectangle SUT
rectangle MockRepo
SUT -> MockRepo : findById
@enduml`,
    },
    pitfalls: [
      '**Mocking** **value** **objects** **needlessly**.',
      '**Static** **mock** **abuse** **hiding** **design** **smells**.',
      '**verify** **every** **call** **brittle** **tests**.',
      '**Shared** **mutable** **state** **across** **tests**.',
      '**catch** **Exception** **in** **tests** **swallowing** **failures**.',
      '**Random** **or** **time** **without** **control**.',
      '**Testing** **private** **methods** **directly**.',
      '**Huge** **fixture** **trees** **per** **test**.',
    ],
    cheatsheet: `| API | Recall |
|---|---|
| @Mock | Collaborator |
| @InjectMocks | SUT wiring |
| when | Stub return |
| verify | Interaction |
| captor | Arg inspect |
| assertThrows | Exceptions |
| strict | Unused stubs |
| lenient | Rare relax |
| spy | Partial real |
| inline | Mock maker |`,
  },
  {
    day: 86,
    phaseNum: 10,
    phaseId: 'phase10',
    title: 'Spring Testing and Testcontainers',
    T: 'Spring Testing and Testcontainers',
    prereqs: ['Day 85', 'Day 84'],
    drillTags: ['Spring Boot Test', 'Testcontainers', 'slice test', 'MockMvc'],
    extraTags: ['Testing', 'Spring'],
    E: ['Implemented: Spring Testing & Testcontainers', 'Focus: @WebMvcTest for 404 unknown IDs.'],
    learningObjectives: LO10('Spring Testing and Testcontainers'),
    conceptualExtra: [
      ['**@WebMvcTest** **scope**?', 'Controller layer + web slice; does not load full @SpringBootApplication context by default.'],
      ['**@SpringBootTest** vs **slice**?', 'Full integration vs focused layer—speed and failure isolation trade-off.'],
      ['**Testcontainers** **value**?', 'Real Postgres/Kafka in disposable containers—catches driver and SQL issues mocks miss.'],
      ['**@DynamicPropertySource**?', 'Inject container host/port into Spring Environment before context starts.'],
      ['**@MockBean** **caution**?', 'Replaces beans in slice—can hide wiring errors if overused.'],
    ],
    codeExtra: [
      ['**MockMvc** perform get', '// mockMvc.perform(get("/api/x"))'],
      ['**@Sql** scripts mention', '// seed data'],
      ['**JdbcTemplate** test', '// assert row counts'],
      ['**container** start static', '// singleton container class'],
      ['**@AutoConfigureMockMvc**', '// inject MockMvc bean'],
    ],
    why: `**Spring** **testing** is about **choosing** the **right** **slice**. **Testcontainers** bridges **unit** confidence and **prod** **parity** without **manual** **VM** **farms**.`,
    theory: `### Day 86 — **Spring** **testing** & **Testcontainers**\n\n### 1. Slices\n**Web**, **DataJpa**, **Json** tests.\n\n### 2. MockMvc\n**Status**, **jsonPath**, **exception** handlers.\n\n### 3. Containers\n**Lifecycle**, **reuse**, **CI** **caching**.\n\n### 4. Properties\n**Dynamic** **ports** **wiring**.\n\n### 5. Speed\n**Parallel** **CI** **jobs** and **reuse** **modes**.\n\n### 6. Story\n**404** **test** caught **missing** **@ControllerAdvice** mapping.`,
    basic: {
      title: 'Basic — Slice test intent',
      filename: 'Day86Basic.java',
      description: 'Web slice label.',
      code: `package arch.day86;

public class Day86Basic {
    public static void main(String[] args) {
        System.out.println("@WebMvcTest loads controllers + web stack only");
    }
}
`,
      output: `@WebMvcTest loads controllers + web stack only\n`,
    },
    intermediate: {
      title: 'Intermediate — MockMvc check',
      filename: 'Day86Intermediate.java',
      description: 'Status assertion phrase.',
      code: `package arch.day86;

public class Day86Intermediate {
    public static void main(String[] args) {
        System.out.println("andExpect(status().isNotFound()) for unknown id");
    }
}
`,
      output: `andExpect(status().isNotFound()) for unknown id\n`,
    },
    advanced: {
      title: 'Advanced — Testcontainers hook',
      filename: 'Day86Advanced.java',
      description: 'Dynamic properties.',
      code: `package arch.day86;

public class Day86Advanced {
    public static void main(String[] args) {
        System.out.println("@DynamicPropertySource registers jdbc url from container");
    }
}
`,
      output: `@DynamicPropertySource registers jdbc url from container\n`,
    },
    diagram: {
      title: 'CI with Testcontainers',
      description: 'Pipeline starts Docker-backed tests.',
      plantuml: `@startuml
title Day 86 — CI
participant Pipeline
participant Docker
Pipeline -> Docker : start deps
Docker --> Pipeline : ports
Pipeline -> Tests : Spring context
@enduml`,
    },
    pitfalls: [
      '**Full** **context** **for** **every** **test** **class**.',
      '**Flaky** **ports** **without** **dynamic** **config**.',
      '**Containers** **per** **method** **slow** **suite**.',
      '**@MockBean** **masking** **missing** **@Component**.',
      '**Ignoring** **ARM** vs **x86** **image** **tags**.',
      '**Data** **leaks** **between** **tests** **without** **cleanup**.',
      '**@Transactional** **rollback** **hiding** **integration** **bugs**.',
      '**No** **parallel** **isolation** **in** **CI**.',
    ],
    cheatsheet: `| Annotation | Recall |
|---|---|
| @WebMvcTest | Controller slice |
| @DataJpaTest | JPA slice |
| @SpringBootTest | Full |
| @MockBean | Replace bean |
| @AutoConfigureMockMvc | MVC test |
| TC | Real dependency |
| DynamicPropertySource | Wire ports |
| reuse | Speed CI |
| awaitility | Async assert |
| TestRestTemplate | HTTP blackbox |`,
  },
  {
    day: 87,
    phaseNum: 10,
    phaseId: 'phase10',
    title: 'Contract Testing and Advanced Testing',
    T: 'Contract testing',
    prereqs: ['Day 86', 'Day 85'],
    drillTags: ['Pact', 'contract test', 'CDC', 'WireMock'],
    extraTags: ['Testing'],
    E: ['Implemented: Contract Testing & Advanced Testing', 'Focus: Consumer-driven contract failure prevention.'],
    learningObjectives: LO10('Contract testing'),
    conceptualExtra: [
      ['**Consumer-driven** **contracts**?', 'Consumer defines expected interactions; provider verifies—catches breaking API drift early.'],
      ['**Pact** **broker** **role**?', 'Shares contracts and verification results across teams and CI pipelines.'],
      ['**Contract** vs **e2e**?', 'Contracts are narrower guarantees; e2e is slower and flakier but broader confidence.'],
      ['**WireMock** **use** **case**?', 'Stub HTTP dependencies for tests without running real remote services.'],
      ['**Schema** **evolution** **with** **contracts**?', 'Version fields, tolerant readers, provider verification gates on publish.'],
    ],
    codeExtra: [
      ['**pact** **dsl** fragment', '// uponReceiving("get user")'],
      ['**@PactTestFor** mention', '// JUnit5 integration'],
      ['**stubFor** WireMock', '// get(urlEqualTo(...))'],
      ['**OpenAPI** diff tool', '// breaking change detection'],
      ['**can-i-deploy** pact', '// gate release'],
    ],
    why: `**Contract** **testing** prevents **distributed** **systems** from **silently** **diverging**. It is a **senior** **topic** because it blends **API** **design**, **CI** **governance**, and **team** **boundaries**.`,
    theory: `### Day 87 — **Contract** **testing**\n\n### 1. Motivation\n**Integration** **without** **full** **mesh** **e2e**.\n\n### 2. Flow\n**Consumer** **pact** -> **broker** -> **provider** **verify**.\n\n### 3. Breaking changes\n**Diff** **failures** **block** **deploy**.\n\n### 4. Tools\n**Pact**, **Spring** **Cloud** **Contract**, **WireMock**.\n\n### 5. Culture\n**Negotiate** **examples**, not **only** **docs**.\n\n### 6. Story\n**Field** **rename** **caught** **pre-merge** **via** **provider** **verification** **failure**.`,
    basic: {
      title: 'Basic — Contract idea',
      filename: 'Day87Basic.java',
      description: 'CDC headline.',
      code: `package arch.day87;

public class Day87Basic {
    public static void main(String[] args) {
        System.out.println("consumer-driven contract: examples as executable spec");
    }
}
`,
      output: `consumer-driven contract: examples as executable spec\n`,
    },
    intermediate: {
      title: 'Intermediate — Broker benefit',
      filename: 'Day87Intermediate.java',
      description: 'Sharing artifacts.',
      code: `package arch.day87;

public class Day87Intermediate {
    public static void main(String[] args) {
        System.out.println("broker stores pact json + verification matrix per version");
    }
}
`,
      output: `broker stores pact json + verification matrix per version\n`,
    },
    advanced: {
      title: 'Advanced — Failure prevention',
      filename: 'Day87Advanced.java',
      description: 'CI gate.',
      code: `package arch.day87;

public class Day87Advanced {
    public static void main(String[] args) {
        System.out.println("can-i-deploy blocks if provider verification missing");
    }
}
`,
      output: `can-i-deploy blocks if provider verification missing\n`,
    },
    diagram: {
      title: 'Pact flow',
      description: 'Consumer publishes; provider verifies.',
      plantuml: `@startuml
title Day 87 — Pact
Consumer -> Broker : publish pact
Provider -> Broker : verify results
@enduml`,
    },
    pitfalls: [
      '**Contracts** **without** **broker** **discipline**.',
      '**Over-specifying** **incidental** **headers**.',
      '**Flaky** **provider** **states** **breaking** **verify**.',
      '**Ignoring** **message** **contracts** for **async**.',
      '**Manual** **copy** **pact** **files** in **email**.',
      '**No** **versioning** **strategy**.',
      '**Mock** **server** **drift** from **real** **provider**.',
      '**E2E** **duplication** **instead** of **targeted** **contract**.',
    ],
    cheatsheet: `| Term | Recall |
|---|---|
| CDC | Consumer drives |
| Pact | JSON interactions |
| Broker | Share artifacts |
| Verify | Provider CI |
| Stub | WireMock |
| can-i-deploy | Gate |
| Breaking | Field removal |
| Message | Async pact |
| OpenAPI | Doc contract |
| Team | Negotiate examples |`,
  },
  {
    day: 88,
    phaseNum: 10,
    phaseId: 'phase10',
    title: 'JVM Performance and Profiling',
    T: 'JVM performance',
    prereqs: ['Day 87', 'Day 86'],
    drillTags: ['JMH', 'profiling', 'GC', 'JIT', 'allocation'],
    extraTags: ['Performance'],
    E: ['Implemented: JVM Performance & Profiling', 'Focus: JMH benchmark String + vs StringBuilder.'],
    learningObjectives: LO10('JVM performance and profiling'),
    conceptualExtra: [
      ['**JMH** **why** not **loop** **nanoTime**?', 'JIT dead-code elimination and unfair warmup—JMH controls forks, warmup, and blackholes.'],
      ['**Allocation** **pressure** **symptoms**?', 'Young GC churn, high allocation rate in profiler—often hotter than algorithm big-O on moderate n.'],
      ['**async-profiler** modes?', 'CPU wall vs alloc—pick question first then profile mode.'],
      ['**GC** **pause** vs **throughput**?', 'Low-latency collectors trade CPU overhead; choose per SLO not buzzwords.'],
      ['**Inlining** and **devirtualization**?', 'JIT optimizes hot monomorphic calls—microbenchmarks may lie if assumptions differ from prod.'],
    ],
    codeExtra: [
      ['**@Benchmark** method', '// JMH entry'],
      ['**@Fork** mention', '// isolate JVM'],
      ['**Blackhole.consume**', '// prevent DCE'],
      ['**-XX:+FlightRecorder**', '// JFR snapshot'],
      ['**jstack** thread dump', '// lock contention hint'],
    ],
    why: `**Performance** answers need **measurement** literacy. **JMH** and **profilers** separate **data** from **folklore**—critical for **senior** **credibility**.`,
    theory: `### Day 88 — **JVM** **performance**\n\n### 1. Methodology\n**Baseline**, **hypothesis**, **measure**, **fix**, **re-measure**.\n\n### 2. Microbenchmarks\n**JMH** **harness** **rules**.\n\n### 3. Profilers\n**CPU**, **alloc**, **wall** **time**.\n\n### 4. GC\n**Generational** **model**, **pause** **targets**.\n\n### 5. JIT\n**Warmup**, **tiered** **compilation**.\n\n### 6. Story\n**String** **concat** in **loop**—**StringBuilder** wins after **JIT** **stabilizes**; **prove** with **JMH**.`,
    basic: {
      title: 'Basic — JIT and GC headline',
      filename: 'Day88Basic.java',
      description: 'JVM optimizing layers.',
      code: `package arch.day88;

public class Day88Basic {
    public static void main(String[] args) {
        System.out.println("JIT optimizes hot code; GC manages heap lifetimes");
    }
}
`,
      output: `JIT optimizes hot code; GC manages heap lifetimes\n`,
    },
    intermediate: {
      title: 'Intermediate — JMH purpose',
      filename: 'Day88Intermediate.java',
      description: 'Benchmark honesty.',
      code: `package arch.day88;

public class Day88Intermediate {
    public static void main(String[] args) {
        System.out.println("JMH avoids DCE and accounts for warmup forks");
    }
}
`,
      output: `JMH avoids DCE and accounts for warmup forks\n`,
    },
    advanced: {
      title: 'Advanced — Concat vs builder',
      filename: 'Day88Advanced.java',
      description: 'Loop pattern.',
      code: `package arch.day88;

public class Day88Advanced {
    public static void main(String[] args) {
        System.out.println("loop + creates many intermediate Strings; builder reuses buffer");
    }
}
`,
      output: `loop + creates many intermediate Strings; builder reuses buffer\n`,
    },
    diagram: {
      title: 'Profile workflow',
      description: 'Reproduce, capture, analyze.',
      plantuml: `@startuml
title Day 88 — Profile
Load -> App : traffic
App -> Profiler : sample
Profiler -> Engineer : hot methods
@enduml`,
    },
    pitfalls: [
      '**Microbench** **without** **JMH**.',
      '**Profiling** **in** **IDE** **only** **on** **toy** **data**.',
      '**Tuning** **GC** **before** **fixing** **allocation** **bugs**.',
      '**Single** **machine** **benchmark** **as** **universal** **truth**.',
      '**Ignoring** **coordinated** **omission** in **load** **tests**.',
      '**String** **intern** **abuse**.',
      '**Synchronized** **everywhere** **from** **profiler** **noise**.',
      '**No** **before/after** **numbers** in **PR**.',
    ],
    cheatsheet: `| Tool | Recall |
|---|---|
| JMH | Microbench |
| async-profiler | CPU alloc |
| JFR | Flight recording |
| jstack | Threads |
| MAT | Heap dump |
| GC log | Pause analysis |
| -Xlog:gc | Unified logging |
| Blackhole | JMH DCE |
| Amdahl | Parallel limit |
| p99 | Tail matters |`,
  },
  {
    day: 89,
    phaseNum: 10,
    phaseId: 'phase10',
    title: 'System Design Case Study and Behavioral',
    T: 'System design case study',
    prereqs: ['Day 88', 'Day 87'],
    drillTags: ['STAR', 'behavioral', 'trade-offs', 'case study', 'communication'],
    extraTags: ['Interview'],
    E: ['Implemented: System Design Case Study + Behavioral', 'Focus: STAR response for architecture trade-off decision.'],
    learningObjectives: LO10('System design case study and behavioral'),
    conceptualExtra: [
      ['**STAR** **mapping** for **architecture**?', 'Situation: constraints; Task: reliability goal; Action: design + metrics; Result: outage reduction or cost win.'],
      ['How to **disagree** **constructively** in **story**?', 'Data, alternatives, escalation path—no personal blame narrative.'],
      ['**Trade-off** **triangle** **phrasing**?', 'Latency vs cost vs consistency—pick two explicitly for the scenario.'],
      ['**Postmortem** **behavior**?', 'Blameless, action items with owners—shows mature incident culture.'],
      ['**Stakeholder** **translation**?', 'Business impact of tech choices in plain language with risk brackets.'],
    ],
    codeExtra: [
      ['**SLO** number in story', '// p99 200ms checkout'],
      ['**error** **budget** mention', '// freeze features when burned'],
      ['**ADR** one-liner', '// record decision context'],
      ['**rollback** metric', '// error rate threshold'],
      ['**cost** **estimate**', '// monthly infra delta'],
    ],
    why: `**Capstone** **behavioral** + **design** **case** **study** proves you can **ship** **and** **communicate**. **STAR** with **metrics** beats **buzzword** **spray**.`,
    theory: `### Day 89 — **Case** **study** + **behavioral**\n\n### 1. Clarify\n**Requirements**, **scale**, **constraints**.\n\n### 2. High level\n**API**, **data**, **components**.\n\n### 3. Deep dives\n**Bottleneck**, **failure**, **security**.\n\n### 4. Evolution\n**Migrations**, **strangler**, **SLOs**.\n\n### 5. Behavioral\n**STAR** **stories** with **numbers**.\n\n### 6. Story\n**Monolith** **split**—**you** **proposed** **boundary** **and** **measured** **MTTR** **drop**.`,
    basic: {
      title: 'Basic — STAR letters',
      filename: 'Day89Basic.java',
      description: 'Mnemonic.',
      code: `package arch.day89;

public class Day89Basic {
    public static void main(String[] args) {
        System.out.println("STAR = Situation Task Action Result");
    }
}
`,
      output: `STAR = Situation Task Action Result\n`,
    },
    intermediate: {
      title: 'Intermediate — Trade-off framing',
      filename: 'Day89Intermediate.java',
      description: 'Explicit options.',
      code: `package arch.day89;

public class Day89Intermediate {
    public static void main(String[] args) {
        System.out.println("option A cost vs option B latency vs option C ops complexity");
    }
}
`,
      output: `option A cost vs option B latency vs option C ops complexity\n`,
    },
    advanced: {
      title: 'Advanced — Result with metric',
      filename: 'Day89Advanced.java',
      description: 'Outcome proof.',
      code: `package arch.day89;

public class Day89Advanced {
    public static void main(String[] args) {
        System.out.println("result: p99 down 40% and incident count halved next quarter");
    }
}
`,
      output: `result: p99 down 40% and incident count halved next quarter\n`,
    },
    diagram: {
      title: 'Interview arc',
      description: 'Clarify, design, trade-offs, wrap.',
      plantuml: `@startuml
title Day 89 — Flow
start
:Clarify;
:Sketch;
:Trade-offs;
:Metrics;
stop
@enduml`,
    },
    pitfalls: [
      '**Vague** **we** **improved** **things**.',
      '**No** **numbers** in **results**.',
      '**Blaming** **individuals**.',
      '**Jumping** to **solution** **before** **requirements**.',
      '**Ignoring** **interviewer** **hints**.',
      '**Only** **happy** **path** **stories**.',
      '**Buzzwords** **without** **personal** **contribution**.',
      '**Running** **over** **time** **without** **summaries**.',
    ],
    cheatsheet: `| Piece | Recall |
|---|---|
| STAR | structure |
| Metric | prove impact |
| Trade-off | name 3 options |
| Risk | honest caveats |
| Rollback | always plan |
| SLO | customer lens |
| ADR | document why |
| Stakeholder | plain English |
| Follow-up | pause think |
| Close | recap decision |`,
  },
  {
    day: 90,
    phaseNum: 10,
    phaseId: 'phase10',
    title: 'Full Mock Interview Simulation',
    T: 'Mock interview simulation',
    prereqs: ['Day 89', 'Day 88'],
    drillTags: ['mock interview', 'full round', 'follow-ups', 'timeboxing', 'communication'],
    extraTags: ['Interview'],
    E: ['Implemented: Full Mock Interview Simulation', 'Focus: Mixed full-round simulation with follow-up probing.'],
    learningObjectives: LO10('full mock interview simulation'),
    conceptualExtra: [
      ['How to **timebox** **design** **section**?', '5 clarify, 10 high-level, 10 deep dive, 5 wrap—adjust to interviewer pace.'],
      ['**Follow-up** **probing** **strategy**?', 'Pause, restate assumption, answer narrow question, reconnect to diagram.'],
      ['**When** **you** **do** **not** **know**?', 'Hypothesis + how you would validate with metrics or a spike—not bluffing.'],
      ['**Coding** + **system** **same** **day**?', 'Energy management; warm up mentally; keep communication continuous while typing.'],
      ['**Feedback** **capture** **post-mock**?', 'One technique drill and one content gap per session—avoid unfocused retries.'],
    ],
    codeExtra: [
      ['**pseudocode** **first**', '// agree API before details'],
      ['**test** **cases** aloud', '// edge empty null scale'],
      ['**complexity** **stated**', '// Big-O with n meaning'],
      ['**diagram** **legend**', '// traffic volume assumptions'],
      ['**checkpoint** phrase', '// does this depth match what you want?'],
    ],
    why: `The **full** **round** **simulation** builds **muscle** **memory** for **pressure**, **time**, and **follow-ups**—the **difference** between **knowing** **topics** and **passing** **panels**.`,
    theory: `### Day 90 — **Mock** **interview** **simulation**\n\n### 1. Cadence\n**Warmup**, **deep** **dive**, **retro**.\n\n### 2. Communication\n**Think** **aloud**, **confirm** **assumptions**.\n\n### 3. Depth\n**Interviewer** **steers**—adapt **quickly**.\n\n### 4. Bodies of work\n**Java**, **Spring**, **distributed** **systems**, **design**.\n\n### 5. Mindset\n**Curiosity** and **calm** **recovery** from **mistakes**.\n\n### 6. Story\n**Post-mock** **note**: **one** **diagram** **skill** **and** **one** **Java** **API** **drill** **for** **tomorrow**.`,
    basic: {
      title: 'Basic — Session structure',
      filename: 'Day90Basic.java',
      description: 'Round parts.',
      code: `package arch.day90;

public class Day90Basic {
    public static void main(String[] args) {
        System.out.println("intro -> coding or design -> behavioral -> your questions");
    }
}
`,
      output: `intro -> coding or design -> behavioral -> your questions\n`,
    },
    intermediate: {
      title: 'Intermediate — Think-aloud habit',
      filename: 'Day90Intermediate.java',
      description: 'Narration.',
      code: `package arch.day90;

public class Day90Intermediate {
    public static void main(String[] args) {
        System.out.println("narrate assumptions before silent coding tunnel");
    }
}
`,
      output: `narrate assumptions before silent coding tunnel\n`,
    },
    advanced: {
      title: 'Advanced — Follow-up recovery',
      filename: 'Day90Advanced.java',
      description: 'Probe handling.',
      code: `package arch.day90;

public class Day90Advanced {
    public static void main(String[] args) {
        System.out.println("if stumped: narrow scope, propose experiment, offer trade-off table");
    }
}
`,
      output: `if stumped: narrow scope, propose experiment, offer trade-off table\n`,
    },
    diagram: {
      title: 'Full round timeline',
      description: 'Typical senior loop.',
      plantuml: `@startuml
title Day 90 — Round
|Interviewer|
start
:Opener 5m;
:System 25m;
:Coding 25m;
:Behavioral 20m;
:Q&A 10m;
stop
@enduml`,
    },
    pitfalls: [
      '**Silent** **20** **minute** **coding**.',
      '**Arguing** with **interviewer** **hints**.',
      '**Ignoring** **time** **warnings**.',
      '**No** **questions** at **end**.',
      '**Cramming** **new** **topics** **night** **before**.',
      '**Skipping** **retro** after **each** **mock**.',
      '**One** **speed** **only**—too **slow** or **rushed**.',
      '**Perfectionism** **blocking** **progress** on **design**.',
    ],
    cheatsheet: `| Skill | Drill |
|---|---|
| Timebox | visible clock |
| Clarify | ask early |
| Diagram | legible boxes |
| Trade-off | 3 options |
| Recover | breathe restate |
| Code | tests aloud |
| Behavioral | STAR metric |
| End | smart questions |
| Retro | one fix |
| Repeat | weekly |`,
  },
];
