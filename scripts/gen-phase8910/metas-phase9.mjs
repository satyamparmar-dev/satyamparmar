/** Phase 9 — days 77–84 (Architecture & System Design) */

function LO9(title) {
  return [
    `Defend **${title}** choices with trade-offs, failure domains, and metrics`,
    `Contrast patterns and anti-patterns interviewers probe with follow-up questions`,
    `Sketch boundaries, data flows, and consistency models on a whiteboard`,
    `Relate scalability, cost, and operational complexity to team constraints`,
    `Use structured responses: requirements, options, decision, verification`,
    `Prepare STAR-style stories where architecture decisions had measurable impact`,
  ];
}

export const METAS_9 = [
  {
    day: 77,
    phaseNum: 9,
    phaseId: 'phase9',
    title: 'SOLID and Clean Architecture',
    T: 'SOLID and Clean Architecture',
    prereqs: ['Day 76', 'Day 75'],
    drillTags: ['SOLID', 'Clean Architecture', 'SRP', 'ports', 'adapters'],
    extraTags: ['Architecture'],
    E: ['multiple unrelated reasons to change in one class'],
    learningObjectives: LO9('SOLID and Clean Architecture'),
    conceptualExtra: [
      ['What is **SRP** in one **interview** sentence?', 'One axis of change per module—mixed reasons to change signal a split candidate.'],
      ['**Dependency** **rule** in **Clean** **Architecture**?', 'Source dependencies point inward; frameworks and I/O live in outer rings.'],
      ['**Open/Closed** without **speculation**?', 'Extend via interfaces and composition where change is likely—not abstract everything day one.'],
      ['**LSP** pitfall with **subtypes**?', 'Subclasses that strengthen preconditions or weaken postconditions break substitutability.'],
      ['**Interface** **Segregation** vs **fat** **API**?', 'Clients depend only on methods they use; fat ports create needless rebuilds and tests.'],
    ],
    codeExtra: [
      ['**Port** interface sketch comment', '// PaymentPort charge(Money m)'],
      ['**Adapter** wrapping **HTTP** client', '// StripePaymentAdapter implements PaymentPort'],
      ['**Use** **case** class pseudo', '// PlaceOrderHandler depends on ports only'],
      ['**DTO** at boundary note', '// map domain -> transport in adapter'],
      ['**Test** **double** for port', '// InMemoryOrderRepo for unit tests'],
    ],
    why: `**SOLID** and **Clean** **Architecture** separate **stable** **business** rules from **volatile** **details**. Interviews reward **boundary** discipline and honest **boilerplate** cost talk.`,
    theory: `### Day 77 — **SOLID** & **Clean** **Architecture**\n\n### 1. SRP / cohesion\nOne **reason** to **change** per unit.\n\n### 2. OCP / DIP\nDepend on **abstractions** at **boundaries**.\n\n### 3. Clean rings\n**Entities**, **use** **cases**, **interface** **adapters**, **frameworks**.\n\n### 4. Testing\n**Fast** tests on **core** without **web** **containers**.\n\n### 5. Failure domain\n**Leaky** **framework** imports in **domain**.\n\n### 6. Story\n**God** **service** split into **use** **cases** + **ports**—**deploy** **risk** drops.`,
    basic: {
      title: 'Basic — SOLID acronym anchor',
      filename: 'Day77Basic.java',
      description: 'Print SOLID letters as memory hook.',
      code: `package arch.day77;

public class Day77Basic {
    public static void main(String[] args) {
        System.out.println("S O L I D = coupling/cohesion guardrails");
    }
}
`,
      output: `S O L I D = coupling/cohesion guardrails\n`,
    },
    intermediate: {
      title: 'Intermediate — Dependency direction',
      filename: 'Day77Intermediate.java',
      description: 'Inward rule one-liner.',
      code: `package arch.day77;

public class Day77Intermediate {
    public static void main(String[] args) {
        System.out.println("dependencies point to policies not frameworks");
    }
}
`,
      output: `dependencies point to policies not frameworks\n`,
    },
    advanced: {
      title: 'Advanced — Port vs adapter',
      filename: 'Day77Advanced.java',
      description: 'Boundary vocabulary.',
      code: `package arch.day77;

public class Day77Advanced {
    public static void main(String[] args) {
        System.out.println("port=interface domain needs; adapter=technology glue");
    }
}
`,
      output: `port=interface domain needs; adapter=technology glue\n`,
    },
    diagram: {
      title: 'Clean Architecture rings',
      description: 'Dependencies flow inward.',
      plantuml: `@startuml
title Day 77 — Rings
rectangle Frameworks
rectangle Adapters
rectangle UseCases
rectangle Entities
Frameworks -down-> Adapters
Adapters -down-> UseCases
UseCases -down-> Entities
@enduml`,
    },
    pitfalls: [
      '**Anemic** **domain** with **only** **DTOs**.',
      '**100** **interfaces** **before** **need**.',
      '**Circular** **module** **dependencies**.',
      '**JPA** **entities** as **REST** **models** everywhere.',
      '**Shared** **kernel** **without** **bounded** **context** **ownership**.',
      '**Testing** **only** **integration** **because** **core** **tangled**.',
      '**Naming** **layers** **without** **enforcing** **rules**.',
      '**Big** **bang** **rewrite** **instead** of **strangler**.',
    ],
    cheatsheet: `| Term | Recall |
|---|---|
| SRP | One change axis |
| OCP | Extend behavior |
| LSP | Safe substitution |
| ISP | Small interfaces |
| DIP | Abstractions inward |
| Port | Domain need |
| Adapter | Tech impl |
| Use case | App service |
| Entity | Core rules |
| Anti | God service |`,
  },
  {
    day: 78,
    phaseNum: 9,
    phaseId: 'phase9',
    title: 'Design Patterns — Creational',
    T: 'Creational design patterns',
    prereqs: ['Day 77', 'Day 76'],
    drillTags: ['Singleton', 'Factory', 'Builder', 'Prototype', 'enum'],
    extraTags: ['Design Patterns'],
    E: ['enum: serialization/thread safety; DCL: easy to get wrong'],
    learningObjectives: LO9('Creational design patterns'),
    conceptualExtra: [
      ['**Singleton** when **justified**?', 'Truly single coordinated resource—often better as **DI**-scoped bean or explicit platform service.'],
      ['**Factory** **Method** vs **Abstract** **Factory**?', 'One product family method vs families of related products—interviews want boundary clarity.'],
      ['**Builder** for **what** **pain**?', 'Many optional parameters and invariants—readable construction vs telescoping constructors.'],
      ['**Prototype** vs **new**?', 'Clone expensive graphs or when concrete type chosen at runtime from registry.'],
      ['Why **enum** **singleton** in **Java**?', 'Serialization and reflection-safe idiom; avoids DCL and lazy-init footguns.'],
    ],
    codeExtra: [
      ['**Builder** fluent chain comment', '// return this for chaining'],
      ['**Factory** registry pseudo', '// map type -> supplier'],
      ['**clone** **Prototype** caveat', '// deep vs shallow copy'],
      ['**private** ctor **Singleton**', '// enum or static holder'],
      ['**Spring** **Bean** as singleton note', '// container-scoped lifecycle'],
    ],
    why: `**Creational** patterns organize **object** **birth**. Senior answers compare **testability**, **thread** **safety**, and **Spring** **alternatives** to textbook **Singleton**.`,
    theory: `### Day 78 — **Creational** **patterns**\n\n### 1. Singleton\n**Global** **state** **risk** vs **true** **single** **coordination**.\n\n### 2. Factory family\nHide **construction** **details** behind **interfaces**.\n\n### 3. Builder\n**Stepwise** **construction** with **validation**.\n\n### 4. Prototype\n**Clone** when **subclasses** proliferate.\n\n### 5. Modern Java\n**Records**, **DI**, **modules** change defaults.\n\n### 6. Story\n**DCL** **Singleton** **bug** under **reorder**—**enum** **wins** **interview** **credibility**.`,
    basic: {
      title: 'Basic — Pattern names',
      filename: 'Day78Basic.java',
      description: 'Creational list.',
      code: `package arch.day78;

public class Day78Basic {
    public static void main(String[] args) {
        System.out.println("Singleton Factory AbstractFactory Builder Prototype");
    }
}
`,
      output: `Singleton Factory AbstractFactory Builder Prototype\n`,
    },
    intermediate: {
      title: 'Intermediate — Builder intent',
      filename: 'Day78Intermediate.java',
      description: 'Telescoping escape.',
      code: `package arch.day78;

public class Day78Intermediate {
    public static void main(String[] args) {
        System.out.println("builder: optional fields + validation before build()");
    }
}
`,
      output: `builder: optional fields + validation before build()\n`,
    },
    advanced: {
      title: 'Advanced — Enum singleton note',
      filename: 'Day78Advanced.java',
      description: 'Thread and serialization.',
      code: `package arch.day78;

public class Day78Advanced {
    public static void main(String[] args) {
        System.out.println("prefer enum singleton over double-checked locking");
    }
}
`,
      output: `prefer enum singleton over double-checked locking\n`,
    },
    diagram: {
      title: 'Factory produces products',
      description: 'Client depends on abstractions.',
      plantuml: `@startuml
title Day 78 — Factory
Client -> Factory : createProduct()
Factory -> Product : new
@enduml`,
    },
    pitfalls: [
      '**Singleton** for **every** **service**.',
      '**Double-checked** **locking** **without** **volatile** **story**.',
      '**God** **factory** **knows** **all** **types**.',
      '**Builder** **without** **validation** on **build**.',
      '**Prototype** **shallow** **copy** **surprises**.',
      '**Pattern** **for** **resume** **only**.',
      '**Ignoring** **Spring** **ObjectFactory** **role**.',
      '**Abstract** **factory** **explosion** **of** **classes**.',
    ],
    cheatsheet: `| Pattern | Recall |
|---|---|
| Singleton | One instance |
| Factory Method | Subclass decides |
| Abstract Factory | Product families |
| Builder | Stepwise build |
| Prototype | Clone instance |
| Enum singleton | Safe Java idiom |
| DCL | Memory model risk |
| DI | Framework singleton |
| Registry | Named creators |
| Anti | Global state abuse |`,
  },
  {
    day: 79,
    phaseNum: 9,
    phaseId: 'phase9',
    title: 'Design Patterns — Structural',
    T: 'Structural design patterns',
    prereqs: ['Day 78', 'Day 77'],
    drillTags: ['Decorator', 'Proxy', 'Adapter', 'Facade', 'Composite'],
    extraTags: ['Design Patterns'],
    E: ['decorator: add behavior; proxy: control access'],
    learningObjectives: LO9('Structural design patterns'),
    conceptualExtra: [
      ['**Decorator** vs **subclassing**?', 'Compose behavior at runtime stacking wrappers; subclassing multiplies classes for combinations.'],
      ['**Proxy** **types** interview list?', 'Remote, virtual, protection—control access, lazy init, security checks.'],
      ['**Adapter** vs **Facade**?', 'Adapter translates one interface to another; Facade simplifies a subsystem surface.'],
      ['**Bridge** decouples **what** from **how**?', 'Abstraction from implementation so both vary independently.'],
      ['**Composite** tree **trade-off**?', 'Uniform leaf/container interface can weaken type safety—document illegal ops.'],
    ],
    codeExtra: [
      ['**Decorator** implements same **interface**', '// delegate + extra'],
      ['**Proxy** lazy field comment', '// create heavy object on first call'],
      ['**Adapter** class vs object', '// inheritance vs delegation'],
      ['**Facade** method **name**', '// placeOrder() hides 5 services'],
      ['**JDK** **Proxy** dynamic note', '// InvocationHandler'],
    ],
    why: `**Structural** patterns answer "**how** **pieces** **fit**". Interviews probe **Decorator** vs **Proxy** and **Adapter** at **integration** boundaries.`,
    theory: `### Day 79 — **Structural** **patterns**\n\n### 1. Decorator\n**Stack** **behavior** without **class** **explosion**.\n\n### 2. Proxy\n**Control** **access**, **lazy** **load**, **guards**.\n\n### 3. Adapter\n**Legacy** **API** **fit** **new** **port**.\n\n### 4. Facade\n**Reduce** **coupling** to **subsystem**.\n\n### 5. Composite\n**Tree** **structures** **uniformly**.\n\n### 6. Story\n**Caching** **decorator** around **repository**—**transparent** **read** **through**.`,
    basic: {
      title: 'Basic — Structural trio',
      filename: 'Day79Basic.java',
      description: 'Decorator proxy adapter.',
      code: `package arch.day79;

public class Day79Basic {
    public static void main(String[] args) {
        System.out.println("decorator proxy adapter facade bridge composite");
    }
}
`,
      output: `decorator proxy adapter facade bridge composite\n`,
    },
    intermediate: {
      title: 'Intermediate — Decorator stack',
      filename: 'Day79Intermediate.java',
      description: 'Compose behaviors.',
      code: `package arch.day79;

public class Day79Intermediate {
    public static void main(String[] args) {
        System.out.println("new MetricsDecorator(new LoggingDecorator(core))");
    }
}
`,
      output: `new MetricsDecorator(new LoggingDecorator(core))\n`,
    },
    advanced: {
      title: 'Advanced — Proxy control',
      filename: 'Day79Advanced.java',
      description: 'Access mediation.',
      code: `package arch.day79;

public class Day79Advanced {
    public static void main(String[] args) {
        System.out.println("proxy: auth check before delegate.realCall()");
    }
}
`,
      output: `proxy: auth check before delegate.realCall()\n`,
    },
    diagram: {
      title: 'Decorator object chain',
      description: 'Each layer wraps inner.',
      plantuml: `@startuml
title Day 79 — Decorator
component A as Core
component B as LogDec
component C as MetricDec
C --> B
B --> A
@enduml`,
    },
    pitfalls: [
      '**Confusing** **Decorator** with **Proxy** **intent**.',
      '**Deep** **wrapper** **chains** **hard** to **debug**.',
      '**Adapter** **leaking** **across** **every** **call**.',
      '**Facade** **becoming** **new** **god** **object**.',
      '**Dynamic** **proxy** **without** **interface** **clarity**.',
      '**Composite** **violations** **on** **leaf** **nodes**.',
      '**Bridge** **overkill** for **one** **implementation**.',
      '**Performance** **surprise** from **nested** **delegation**.',
    ],
    cheatsheet: `| Pattern | Recall |
|---|---|
| Decorator | Add behavior |
| Proxy | Control access |
| Adapter | Interface map |
| Facade | Simplify API |
| Bridge | Abstraction split |
| Composite | Tree uniform |
| Flyweight | Shared state |
| JDK Proxy | Dynamic |
| Delegate | Composition |
| Anti | Confuse intent |`,
  },
  {
    day: 80,
    phaseNum: 9,
    phaseId: 'phase9',
    title: 'Design Patterns — Behavioral',
    T: 'Behavioral design patterns',
    prereqs: ['Day 79', 'Day 78'],
    drillTags: ['Strategy', 'Observer', 'Command', 'State', 'Template'],
    extraTags: ['Design Patterns'],
    E: ['strategy: open for extension; if-else: edit risk'],
    learningObjectives: LO9('Behavioral design patterns'),
    conceptualExtra: [
      ['**Strategy** vs **if-else** **chains**?', 'Encapsulate varying algorithms behind interface—open for extension without editing core flow.'],
      ['**Observer** **push** vs **pull**?', 'Push sends events; pull lets observers query—memory and coupling trade-offs.'],
      ['**Command** **for** **undo**?', 'Encapsulate request as object—queue, log, macro, undo/redo stacks.'],
      ['**State** vs **Strategy**?', 'State transitions owned by context object graph; strategy is pluggable algorithm choice.'],
      ['**Template** **Method** **hook**?', 'Fixed skeleton in base; subclasses override steps—watch fragile inheritance.'],
    ],
    codeExtra: [
      ['**Strategy** interface', '// PricingStrategy quote(Order o)'],
      ['**Command** execute undo', '// void execute(); void undo();'],
      ['**Observer** register', '// addListener(Consumer<Event> l)'],
      ['**Iterator** enhanced for', '// hide collection traversal'],
      ['**Chain** of **responsibility** pseudo', '// handle or pass next'],
    ],
    why: `**Behavioral** patterns model **collaboration** and **variation**. Interviewers love **Strategy** over **growing** **switch** statements and **Command** for **queues** and **undo**.`,
    theory: `### Day 80 — **Behavioral** **patterns**\n\n### 1. Strategy\n**Pluggable** **algorithms**.\n\n### 2. Observer\n**Pub/sub** **object** graph.\n\n### 3. Command\n**Requests** as **first-class** objects.\n\n### 4. State\n**Explicit** **transitions**.\n\n### 5. Template Method\n**Invariant** **flow**, **variant** **steps**.\n\n### 6. Story\n**Pricing** **rules** **explode**—**Strategy** **registry** + **Spring** **beans**.`,
    basic: {
      title: 'Basic — Behavioral headline',
      filename: 'Day80Basic.java',
      description: 'Pattern bucket.',
      code: `package arch.day80;

public class Day80Basic {
    public static void main(String[] args) {
        System.out.println("behavioral: algorithms responsibilities collaboration");
    }
}
`,
      output: `behavioral: algorithms responsibilities collaboration\n`,
    },
    intermediate: {
      title: 'Intermediate — Strategy plug-in',
      filename: 'Day80Intermediate.java',
      description: 'Replace conditional.',
      code: `package arch.day80;

public class Day80Intermediate {
    public static void main(String[] args) {
        System.out.println("inject Strategy implementation instead of switch(type)");
    }
}
`,
      output: `inject Strategy implementation instead of switch(type)\n`,
    },
    advanced: {
      title: 'Advanced — Command queue',
      filename: 'Day80Advanced.java',
      description: 'Async execution.',
      code: `package arch.day80;

public class Day80Advanced {
    public static void main(String[] args) {
        System.out.println("command bus: enqueue Command objects for workers");
    }
}
`,
      output: `command bus: enqueue Command objects for workers\n`,
    },
    diagram: {
      title: 'Strategy context',
      description: 'Context delegates to strategy.',
      plantuml: `@startuml
title Day 80 — Strategy
Context -> Strategy : algorithm()
note right: interchangeable impls
@enduml`,
    },
    pitfalls: [
      '**Strategy** **explosion** **without** **registry**.',
      '**Observer** **memory** **leaks** **strong** **refs**.',
      '**Command** **without** **idempotency** **on** **retry**.',
      '**God** **mediator** **knows** **everything**.',
      '**Visitor** **cycle** **with** **new** **types**.',
      '**Template** **method** **fragile** **base** **class**.',
      '**Null** **Object** **masking** **real** **errors**.',
      '**Chain** **without** **terminal** **handler**.',
    ],
    cheatsheet: `| Pattern | Recall |
|---|---|
| Strategy | Swap algorithm |
| Observer | Notify dependents |
| Command | Request object |
| State | Transition graph |
| Template | Skeleton method |
| Mediator | Reduce mesh |
| Memento | Snapshot state |
| Iterator | Hide traversal |
| Chain | Pass along |
| Anti | Mega switch |`,
  },
  {
    day: 81,
    phaseNum: 9,
    phaseId: 'phase9',
    title: 'System Design Fundamentals',
    T: 'System design fundamentals',
    prereqs: ['Day 80', 'Day 79'],
    drillTags: ['scalability', 'load balancing', 'caching', 'CAP', 'consistency'],
    extraTags: ['System Design'],
    E: ['edge: cheap rejection; app: domain-aware limits'],
    learningObjectives: LO9('System design fundamentals'),
    conceptualExtra: [
      ['**Vertical** vs **horizontal** **scale**?', 'Bigger machine vs more machines—stateless tiers favor horizontal with load balancers.'],
      ['**Strong** vs **eventual** **read** **path**?', 'User expects immediate truth vs acceptable lag—pick per feature with product buy-in.'],
      ['**CDN** **role**?', 'Edge caching for static and cacheable dynamic assets; origin shielding and TLS termination.'],
      ['**Rate** **limit** **edge** vs **app**?', 'Edge cheaply rejects abuse; app enforces business rules and per-tenant fairness.'],
      ['**Idempotency** **key** **why**?', 'Safe retries on POST-like operations under flaky networks.'],
    ],
    codeExtra: [
      ['**consistent** **hash** ring comment', '// minimize remap on node add'],
      ['**sticky** **session** caveat', '// breaks elasticity'],
      ['**cache** **TTL** pseudo', '// max-age + stale-while-revalidate'],
      ['**circuit** **breaker** state', '// closed open half-open'],
      ['**backpressure** signal', '// 429 or drop slow clients'],
    ],
    why: `**Fundamentals** are the **scaffold** for every **URL** **shortener** and **order** **service**. Master **latency**, **consistency**, and **failure** **isolation** before **fancy** **diagrams**.`,
    theory: `### Day 81 — **System** **design** **fundamentals**\n\n### 1. Requirements\n**Functional**, **non-functional**, **scale** **assumptions**.\n\n### 2. Building blocks\n**LB**, **cache**, **DB**, **queue**, **search**.\n\n### 3. Data\n**Sharding**, **replication**, **hot** **keys**.\n\n### 4. Reliability\n**Retries**, **timeouts**, **bulkheads**, **degradation**.\n\n### 5. Security\n**AuthN/Z**, **rate** **limits**, **data** **minimization**.\n\n### 6. Story\n**Black** **Friday**—**edge** **rate** **limit** + **queue** **checkout** **shedding**.`,
    basic: {
      title: 'Basic — Non-functional four',
      filename: 'Day81Basic.java',
      description: 'Core NFRs.',
      code: `package arch.day81;

public class Day81Basic {
    public static void main(String[] args) {
        System.out.println("latency throughput availability durability cost");
    }
}
`,
      output: `latency throughput availability durability cost\n`,
    },
    intermediate: {
      title: 'Intermediate — Stateless tier',
      filename: 'Day81Intermediate.java',
      description: 'Scale out pattern.',
      code: `package arch.day81;

public class Day81Intermediate {
    public static void main(String[] args) {
        System.out.println("stateless app servers behind load balancer + shared data tier");
    }
}
`,
      output: `stateless app servers behind load balancer + shared data tier\n`,
    },
    advanced: {
      title: 'Advanced — CAP shorthand',
      filename: 'Day81Advanced.java',
      description: 'Interview line.',
      code: `package arch.day81;

public class Day81Advanced {
    public static void main(String[] args) {
        System.out.println("partition happens: pick consistency vs availability per operation");
    }
}
`,
      output: `partition happens: pick consistency vs availability per operation\n`,
    },
    diagram: {
      title: 'Client to data path',
      description: 'DNS LB app cache DB.',
      plantuml: `@startuml
title Day 81 — Path
User -> DNS
DNS -> LB
LB -> App
App -> Cache
App -> DB
@enduml`,
    },
    pitfalls: [
      '**Ignoring** **back-of-envelope** **math**.',
      '**Single** **global** **database** **for** **everything**.',
      '**No** **rate** **limits** at **edge**.',
      '**Cache** **without** **invalidation** **story**.',
      '**Synchronous** **chaining** **ten** **services**.',
      '**Strong** **consistency** **everywhere** **by** **default**.',
      '**Missing** **idempotency** on **mutations**.',
      '**No** **disaster** **recovery** **or** **RPO/RTO**.',
    ],
    cheatsheet: `| Topic | Recall |
|---|---|
| Scale | H vs V |
| LB | Health checks |
| Cache | TTL invalidate |
| CDN | Edge static |
| Queue | Async decouple |
| CAP | P assumed |
| SLO | Error budget |
| Shard | Key choice |
| Hot key | Salting |
| DR | Multi-region |`,
  },
  {
    day: 82,
    phaseNum: 9,
    phaseId: 'phase9',
    title: 'System Design — URL Shortener',
    T: 'URL shortener design',
    prereqs: ['Day 81', 'Day 80'],
    drillTags: ['URL shortener', 'hashing', 'base62', 'redirect', 'collision'],
    extraTags: ['System Design'],
    E: ['hash+truncate with collision check; counter+base62'],
    learningObjectives: LO9('URL shortener design'),
    conceptualExtra: [
      ['**Hash** **based** **short** **code**?', 'Deterministic from URL—watch collisions; rehash or append salt on clash.'],
      ['**Counter** **+** **base62**?', 'Monotonic ID encoded compactly—needs distributed ID generation without hotspots.'],
      ['**Read** **vs** **write** **ratio** assumption?', 'Redirect path is extremely read-heavy—cache aggressively.'],
      ['**Custom** **alias** **uniqueness**?', 'Unique index; reject or suggest alternatives.'],
      ['**Analytics** **without** **hurting** **latency**?', 'Async log to stream; approximate counts at edge vs exact in warehouse.'],
    ],
    codeExtra: [
      ['**base62** charset string', '// 0-9a-zA-Z'],
      ['**murmur** **hash** mention', '// fast non-crypto hash'],
      ['**Bloom** filter **optional**', '// maybe-seen before DB'],
      ['**HTTP** **301** vs **302**', '// permanent vs temporary caching semantics'],
      ['**KV** store key', '// shortCode -> longUrl ttl'],
    ],
    why: `The **URL** **shortener** is a **classic** **interview** because it blends **ID** **generation**, **storage**, **caching**, and **analytics** **without** **drowning** in **domain** **complexity**.`,
    theory: `### Day 82 — **URL** **shortener**\n\n### 1. API\n**create**, **resolve**, optional **delete**/**analytics**.\n\n### 2. IDs\n**Hash**, **counter**, **hybrid** **collision** **handling**.\n\n### 3. Storage\n**KV** **primary**; **SQL** if **complex** **queries**.\n\n### 4. Scale\n**CDN** **edge** **cache** hot **links**.\n\n### 5. Abuse\n**Spam** **URL** **filter**, **rate** **limits**.\n\n### 6. Story\n**Viral** **link**—**p99** **redirect** **SLO** via **regional** **cache**.`,
    basic: {
      title: 'Basic — Core operations',
      filename: 'Day82Basic.java',
      description: 'Create and resolve.',
      code: `package arch.day82;

public class Day82Basic {
    public static void main(String[] args) {
        System.out.println("POST /links -> short; GET /{code} -> 302 long");
    }
}
`,
      output: `POST /links -> short; GET /{code} -> 302 long\n`,
    },
    intermediate: {
      title: 'Intermediate — Collision strategy',
      filename: 'Day82Intermediate.java',
      description: 'Hash path.',
      code: `package arch.day82;

public class Day82Intermediate {
    public static void main(String[] args) {
        System.out.println("on collision: append counter or rehash with salt");
    }
}
`,
      output: `on collision: append counter or rehash with salt\n`,
    },
    advanced: {
      title: 'Advanced — Hot link cache',
      filename: 'Day82Advanced.java',
      description: 'Read path.',
      code: `package arch.day82;

public class Day82Advanced {
    public static void main(String[] args) {
        System.out.println("cache shortCode at edge; async click aggregate to stream");
    }
}
`,
      output: `cache shortCode at edge; async click aggregate to stream\n`,
    },
    diagram: {
      title: 'Redirect flow',
      description: 'Resolve short code.',
      plantuml: `@startuml
title Day 82 — Redirect
Browser -> API : GET /xYz
API -> Cache : lookup
Cache --> API : miss
API -> KV : get
KV --> API : long url
API --> Browser : 302
@enduml`,
    },
    pitfalls: [
      '**Predictable** **codes** **enabling** **enumeration** **abuse**.',
      '**No** **expiration** **policy** **for** **spam**.',
      '**302** vs **301** **caching** **confusion**.',
      '**Counter** **single** **DB** **hotspot**.',
      '**Analytics** **synchronous** **on** **redirect** **path**.',
      '**Ignoring** **malware** **URL** **scanning**.',
      '**Collision** **handling** **forgotten**.',
      '**No** **private** **link** **access** **control** **when** **needed**.',
    ],
    cheatsheet: `| Piece | Recall |
|---|---|
| ID | hash or counter |
| Encode | base62 |
| Store | KV primary |
| Read | cache edge |
| Write | idempotent create |
| Abuse | rate limit |
| Analytics | async |
| 301/302 | cache semantics |
| Collision | check unique |
| Scale | partition by code |`,
  },
  {
    day: 83,
    phaseNum: 9,
    phaseId: 'phase9',
    title: 'System Design — Notification Service',
    T: 'Notification service design',
    prereqs: ['Day 82', 'Day 81'],
    drillTags: ['notifications', 'queue', 'retry', 'template', 'channels'],
    extraTags: ['System Design'],
    E: ['different retry, cost, and SLA per channel'],
    learningObjectives: LO9('Notification service design'),
    conceptualExtra: [
      ['**Fan-out** **model**?', 'Enqueue per user/channel or batch—depends on cardinality and SLA.'],
      ['**At-least-once** **delivery** **implications**?', 'Idempotent consumers and dedupe keys for email/SMS gateways.'],
      ['**Template** **rendering** **where**?', 'App service vs worker vs vendor—latency and consistency trade-offs.'],
      ['**Priority** **queues**?', 'OTP beats marketing blast—separate lanes and quotas.'],
      ['**Unsubscribe** **and** **compliance**?', 'Canonical preference store; audit trails for consent.'],
    ],
    codeExtra: [
      ['**dead-letter** queue comment', '// poison after max retries'],
      ['**exponential** backoff pseudo', '// base * 2^attempt + jitter'],
      ['**provider** **webhook** status', '// delivery receipts'],
      ['**rate** **limit** per **provider**', '// 429 handling'],
      ['**batch** **API** mention', '// chunk recipients'],
    ],
    why: `**Notifications** combine **queues**, **third-party** **SLAs**, and **user** **trust**. Strong designs separate **channels**, **priorities**, and **compliance** from **core** **apps**.`,
    theory: `### Day 83 — **Notification** **service**\n\n### 1. API\n**Trigger** events, **idempotent** **enqueue**.\n\n### 2. Pipeline\n**Router** -> **template** -> **channel** **workers**.\n\n### 3. Providers\n**Email**, **SMS**, **push** adapters.\n\n### 4. Reliability\n**Retries**, **DLQ**, **metrics** per channel.\n\n### 5. Preferences\n**Opt-in**, **quiet** hours, **locale**.\n\n### 6. Story\n**SMS** **OTP** **lane** **never** **starved** by **marketing** **campaign**.`,
    basic: {
      title: 'Basic — Channels',
      filename: 'Day83Basic.java',
      description: 'Surface types.',
      code: `package arch.day83;

public class Day83Basic {
    public static void main(String[] args) {
        System.out.println("channels: email sms push in-app");
    }
}
`,
      output: `channels: email sms push in-app\n`,
    },
    intermediate: {
      title: 'Intermediate — Queue decouple',
      filename: 'Day83Intermediate.java',
      description: 'Async fan-out.',
      code: `package arch.day83;

public class Day83Intermediate {
    public static void main(String[] args) {
        System.out.println("api enqueues NotificationJob; workers call providers");
    }
}
`,
      output: `api enqueues NotificationJob; workers call providers\n`,
    },
    advanced: {
      title: 'Advanced — Per-channel policy',
      filename: 'Day83Advanced.java',
      description: 'Retries and cost.',
      code: `package arch.day83;

public class Day83Advanced {
    public static void main(String[] args) {
        System.out.println("sms: low retries high cost; email: higher retries batch-friendly");
    }
}
`,
      output: `sms: low retries high cost; email: higher retries batch-friendly\n`,
    },
    diagram: {
      title: 'Notification pipeline',
      description: 'Event to providers.',
      plantuml: `@startuml
title Day 83 — Pipeline
API -> Queue : enqueue
Queue -> Worker : pull
Worker -> Provider : send
Provider --> Worker : ack/webhook
@enduml`,
    },
    pitfalls: [
      '**Single** **queue** for **all** **priorities**.',
      '**No** **dedupe** on **provider** **retries**.',
      '**PII** in **logs** and **templates** **unmasked**.',
      '**Thundering** **herd** on **provider** **limits**.',
      '**Missing** **unsubscribe** **honoring**.',
      '**Template** **injection** **XSS** in **email** clients.',
      '**Push** **token** **rotations** **not** **handled**.',
      '**No** **observability** per **channel** **success** **rate**.',
    ],
    cheatsheet: `| Piece | Recall |
|---|---|
| Ingress | idempotent |
| Router | channel pick |
| Template | versioned |
| Queue | priority lanes |
| Retry | backoff jitter |
| DLQ | manual replay |
| Prefs | consent store |
| Provider | rate limits |
| Metrics | per channel |
| Cost | SMS vs email |`,
  },
  {
    day: 84,
    phaseNum: 9,
    phaseId: 'phase9',
    title: 'System Design — E-commerce Order Service',
    T: 'E-commerce order service design',
    prereqs: ['Day 83', 'Day 82'],
    drillTags: ['orders', 'inventory', 'payment', 'saga', 'idempotency'],
    extraTags: ['System Design'],
    E: ['saga: loose coupling; 2PC: strong consistency, not always available'],
    learningObjectives: LO9('E-commerce order service design'),
    conceptualExtra: [
      ['**Saga** **orchestrated** vs **choreography**?', 'Central coordinator vs event-driven peers—debuggability vs coupling trade-offs.'],
      ['**Inventory** **reservation** **pattern**?', 'Hold stock with TTL; confirm on payment; release on timeout.'],
      ['**Payment** **idempotency**?', 'Merchant key + gateway idempotency tokens to survive retries.'],
      ['**2PC** **why** **rare** **externally**?', 'Blocking protocol; not all payment/inventory systems participate—prefer compensations.'],
      ['**Order** **state** **machine**?', 'Placed, paid, packed, shipped—explicit transitions and side effects.'],
    ],
    codeExtra: [
      ['**compensating** **tx** comment', '// refund void hold'],
      ['**outbox** pattern pseudo', '// same DB tx as order row'],
      ['**idempotency-key** header', '// dedupe create order'],
      ['**stock** **decrement** **race**', '// optimistic version column'],
      ['**read** **your** **writes**', '// sticky routing or version check'],
    ],
    why: `**Orders** touch **money** and **stock**. Interviewers listen for **sagas**, **idempotency**, **inventory** **holds**, and **honest** **2PC** limits.`,
    theory: `### Day 84 — **Order** **service**\n\n### 1. Flow\n**Cart** -> **checkout** -> **pay** -> **fulfill**.\n\n### 2. Consistency\n**Per-service** **transactions** + **saga**.\n\n### 3. Inventory\n**Reservation**, **oversell** **guards**.\n\n### 4. Payments\n**PSP** **callbacks**, **reconciliation**.\n\n### 5. Failure\n**Compensations**, **manual** **review** queues.\n\n### 6. Story\n**Payment** **succeeds**, **inventory** **fails**—**compensating** **refund** **saga** **step**.`,
    basic: {
      title: 'Basic — Core services',
      filename: 'Day84Basic.java',
      description: 'Bounded contexts.',
      code: `package arch.day84;

public class Day84Basic {
    public static void main(String[] args) {
        System.out.println("orders payments inventory shipping notifications");
    }
}
`,
      output: `orders payments inventory shipping notifications\n`,
    },
    intermediate: {
      title: 'Intermediate — Saga steps',
      filename: 'Day84Intermediate.java',
      description: 'Happy path outline.',
      code: `package arch.day84;

public class Day84Intermediate {
    public static void main(String[] args) {
        System.out.println("reserve -> charge -> mark paid -> enqueue fulfillment");
    }
}
`,
      output: `reserve -> charge -> mark paid -> enqueue fulfillment\n`,
    },
    advanced: {
      title: 'Advanced — 2PC vs saga',
      filename: 'Day84Advanced.java',
      description: 'Trade-off line.',
      code: `package arch.day84;

public class Day84Advanced {
    public static void main(String[] args) {
        System.out.println("2PC blocks participants; saga compensates asynchronously");
    }
}
`,
      output: `2PC blocks participants; saga compensates asynchronously\n`,
    },
    diagram: {
      title: 'Checkout saga',
      description: 'Compensations on failure.',
      plantuml: `@startuml
title Day 84 — Saga
Order -> Inventory : reserve
Inventory --> Order : ok
Order -> Payment : charge
Payment --> Order : fail
Order -> Inventory : release
@enduml`,
    },
    pitfalls: [
      '**Double** **charges** **without** **idempotency**.',
      '**Overselling** **without** **reservation** **TTL**.',
      '**Synchronous** **calls** **across** **five** **teams**.',
      '**Missing** **reconciliation** with **PSP**.',
      '**Happy** **path** **only** **diagrams**.',
      '**Ignoring** **partial** **shipment** **and** **returns**.',
      '**Event** **ordering** **assumed** **global**.',
      '**No** **customer** **visible** **status** **on** **stuck** **orders**.',
    ],
    cheatsheet: `| Piece | Recall |
|---|---|
| Saga | compensate |
| 2PC | blocking |
| Hold | TTL release |
| Idempotency | keys |
| Outbox | reliable events |
| PSP | webhooks |
| State machine | explicit |
| Stock | optimistic lock |
| Fulfill | async workers |
| Support | replay DLQ |`,
  },
];
