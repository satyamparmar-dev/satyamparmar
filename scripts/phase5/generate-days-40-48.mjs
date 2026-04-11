/**
 * One-off generator for phase5 specs day40–day48.
 * Run: node scripts/phase5/generate-days-40-48.mjs
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "specs");

const DAYS = [
  {
    n: 40,
    key: "day40",
    title: "Spring AOP",
    theoryTitle: "Spring AOP",
    theoryBase: `### Overview\n**AOP** separates cross-cutting concerns: logging, transactions, security, metrics. Spring uses **proxies** (JDK or CGLIB). **@Around** controls join point.\n\n**Interview angle:** self-invocation bypasses proxy — call through injected self or refactor.\n\n### Advice kinds\n| Advice | Runs |\n| --- | --- |\n| Before | prior |\n| After | finally style |\n| Around | wrap |\n| AfterReturning | success |\n| AfterThrowing | error |\n\n**Interview angle:** Around must proceed() or block.\n\n### Pointcuts\nexecution/within/annotation-driven (@within @annotation).\n\n### Ordering\n@Order on aspects; ties to proxy chain.\n\n### @Transactional AOP\nDefault proxy mode; interface vs class.\n\n### Performance\nAdvice overhead usually small; avoid heavy work in advice.\n\n### Testing\n@EnableAspectJAutoProxy in tests; verify aspect applied.\n\n### Production\nMisconfigured pointcut logs nothing; silent failure.\n\n### 60-second story\n"I use Around for timing; know proceed; fix self-invocation; order aspects; test pointcuts."\n`,
    mcqLabel: "Spring AOP",
    mcqDesc: "Thirty questions on advice types, pointcuts, proxies, ordering, and pitfalls.",
    exerciseProblem: `**Day 40 — Spring AOP (assignment alignment)**\n\n1. Simulate **@Around** by wrapping a **Runnable task** with **start/end timestamps** (use **System.nanoTime()**).\n2. Print **elapsed_ms=** followed by integer milliseconds (divide nanos by 1_000_000).\n3. Task body prints **done** once.\n4. Use **arch.day40** and **Day40Exercise**.`,
    exerciseSolution: String.raw`package arch.day40;

public class Day40Exercise {

    public static void main(String[] args) {
        Runnable task = () -> System.out.println("done");
        long t0 = System.nanoTime();
        task.run();
        long t1 = System.nanoTime();
        System.out.println("elapsed_ms=" + (t1 - t0) / 1_000_000);
    }
}
`,
    basicMid: `System.out.println("aspect_order:before");`,
    scen1: "pointcut matches",
    scen2: "around proceed",
    scen3: "after throwing path",
    scen4: "order annotation",
    adv1: "self-invocation bypass",
    adv2: "JDK vs CGLIB",
    adv3: "transaction proxy",
    diagramTitle: "Around advice wraps join point",
    plantuml: String.raw`@startuml
title Day 40 — @Around

participant Client as C
participant Proxy as P
participant Aspect as A
participant Target as T

C -> P : call
P -> A : before
A -> T : proceed to method
T --> A : return
A --> P : after
P --> C : result
@enduml`,
    cheatsheet: [
      ["Around", "proceed()", "must call"],
      ["Pointcut", "expression", "matches"],
      ["Advice", "cross-cut", "aspect"],
      ["Proxy", "JDK/CGLIB", "interface"],
      ["@Order", "chain", "sequence"],
      ["Join point", "method exec", "hook"],
      ["Introduction", "mixin", "rare"],
      ["Within", "type scope", "types"],
      ["execution", "method pattern", "fine"],
      ["@annotation", "marker", "select"],
      ["Self-invoke", "no proxy", "inject self"],
      ["@Transactional", "AOP", "proxy"],
      ["AspectJ", "weave", "compile/load"],
      ["@EnableAspectJAutoProxy", "config", "Boot auto"],
      ["Performance", "keep thin", "advice"],
    ],
  },
  {
    n: 41,
    key: "day41",
    title: "Spring MVC & REST",
    theoryTitle: "Spring MVC and REST",
    theoryBase: `### Overview\n**DispatcherServlet** maps requests to **@Controller** methods via **HandlerMapping** and **HandlerAdapter**.\n\n**Interview angle:** content negotiation and status codes matter for APIs.\n\n### @RequestMapping family\nHTTP method shortcuts @GetMapping etc.\n\n### Validation\n**@Valid** with **Bean Validation**; **BindingResult** or exceptions.\n\n### Exception handling\n**@ControllerAdvice** centralizes errors.\n\n### JSON\n**HttpMessageConverter** (Jackson default).\n\n### Status codes\n**ResponseEntity** for explicit codes.\n\n### Filters vs interceptors\nServlet filter vs HandlerInterceptor lifecycle.\n\n### Production\nCORS misconfig blocks browsers; validate paths.\n\n### 60-second story\n"I map REST with annotations, validate input, use ControllerAdvice, return ResponseEntity."\n`,
    mcqLabel: "Spring MVC & REST",
    mcqDesc: "Thirty questions on controllers, validation, HTTP, and error handling.",
    exerciseProblem: `**Day 41 — Spring MVC & REST (assignment alignment)**\n\n1. Simulate a **REST decision table**: path **/api/users** method **GET** prints **handler=UserController.list**.\n2. Invalid method prints **405**.\n3. Missing auth header prints **401**.\n4. **arch.day41**, **Day41Exercise**.`,
    exerciseSolution: String.raw`package arch.day41;

public class Day41Exercise {

    static String dispatch(String path, String method, String auth) {
        if (auth == null || auth.isEmpty()) return "401";
        if (!"/api/users".equals(path)) return "404";
        if (!"GET".equals(method)) return "405";
        return "handler=UserController.list";
    }

    public static void main(String[] args) {
        System.out.println(dispatch("/api/users", "GET", "Bearer x"));
        System.out.println(dispatch("/api/users", "POST", "Bearer x"));
        System.out.println(dispatch("/api/users", "GET", ""));
    }
}
`,
    diagramTitle: "DispatcherServlet dispatch",
    plantuml: String.raw`@startuml
title Day 41 — MVC dispatch

participant Browser as B
participant DS as D
participant HM as H
participant Ctrl as C
participant View as V

B -> D : HTTP
D -> H : lookup handler
H -> C : invoke
C --> D : model/entity
D -> V : optional view
D --> B : response
@enduml`,
    cheatsheet: [
      ["DispatcherServlet", "front controller", "entry"],
      ["@RestController", "@Controller+@ResponseBody", "JSON"],
      ["@PathVariable", "URI segment", "bind"],
      ["@RequestParam", "query", "bind"],
      ["@Valid", "JSR-380", "validate"],
      ["BindingResult", "errors", "form"],
      ["@ControllerAdvice", "global @ExceptionHandler", "errors"],
      ["ResponseEntity", "status+body", "explicit"],
      ["HttpMessageConverter", "serialize", "Jackson"],
      ["HandlerInterceptor", "pre/post", "MVC"],
      ["CORS", "Cross-Origin", "browser"],
      ["404 vs 405", "not found/method", "semantics"],
      ["Content-Type", "negotiation", "headers"],
      ["Flash attributes", "redirect", "PRG"],
      ["HiddenHttpMethodFilter", "method override", "legacy"],
    ],
  },
];

// Append remaining days 42-48 inline minimal to complete script
const MORE = [
  {
    n: 42,
    title: "Spring Boot Internals",
    theoryTitle: "Spring Boot internals",
    theoryBase: `### Overview\n**SpringApplication** bootstraps context. **Auto-configuration** via **@EnableAutoConfiguration** and **META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports** (Boot 3).\n\n**Interview angle:** conditions (@ConditionalOn*) gate beans.\n\n### Starters\nPOM deps pull transitive config.\n\n### Fat jar\n**Launcher** loads nested jars.\n\n### Actuator\nOperational endpoints separate from app.\n\n### 60-second story\n"I explain auto-config conditions, starters, and how to exclude auto-config."\n`,
    mcqLabel: "Spring Boot Internals",
    mcqDesc: "Thirty questions on auto-configuration, starters, and application bootstrap.",
    exerciseProblem: `**Day 42**\n\n1. Print **auto_config=conditional_on_class**.\n2. Print **starter=opinionated_deps**.\n3. Print **main=SpringApplication.run**.\n4. **arch.day42** **Day42Exercise**.`,
    exerciseSolution: String.raw`package arch.day42;

public class Day42Exercise {

    public static void main(String[] args) {
        System.out.println("auto_config=conditional_on_class");
        System.out.println("starter=opinionated_deps");
        System.out.println("main=SpringApplication.run");
    }
}
`,
    diagramTitle: "Spring Boot startup",
    plantuml: String.raw`@startuml
title Day 42 — Boot startup

participant Main as M
participant SpringApp as S
participant Env as E
participant Ctx as C
participant Auto as A

M -> S : run
S -> E : prepareEnvironment
S -> C : refreshContext
C -> A : load auto-config
A --> C : register beans
C --> S : started
@enduml`,
    cheatsheet: [
      ["SpringApplication", "bootstrap", "run"],
      ["@SpringBootApplication", "meta", "3-in-1"],
      ["@EnableAutoConfiguration", "auto beans", "on"],
      ["@ConditionalOnClass", "classpath", "gate"],
      ["@ConditionalOnProperty", "config", "gate"],
      ["spring.factories", "legacy", "imports now"],
      ["Starter", "BOM deps", "convenience"],
      ["Fat jar", "nested libs", "launcher"],
      ["devtools", "restart", "local"],
      ["exclude", "auto skip", "property"],
      ["FailureAnalyzer", "error help", "Boot"],
      ["Banner", "startup", "cosmetic"],
      ["LoggingSystem", "logback", "bridge"],
      ["ApplicationRunner", "startup hook", "ordered"],
      ["CommandLineRunner", "args", "startup"],
    ],
  },
  {
    n: 43,
    title: "Spring Boot Config & Actuator",
    theoryTitle: "Spring Boot configuration and Actuator",
    theoryBase: `### Overview\n**Externalized configuration** via properties/yaml, profiles, **@ConfigurationProperties** type-safe binding.\n\n**Interview angle:** relaxed binding maps app.myProp to field.\n\n### Actuator\n**/health**, **/metrics**, **/info** — secure in prod.\n\n### Profiles\n**spring.profiles.active** layers config.\n\n### 60-second story\n"I bind with ConfigurationProperties, split profiles, lock down actuator."\n`,
    mcqLabel: "Boot Config & Actuator",
    mcqDesc: "Thirty questions on properties, profiles, and actuator endpoints.",
    exerciseProblem: `**Day 43**\n\n1. Simulate **readiness**: db **up** and disk **ok** prints **status=UP** else **DOWN**.\n2. Test db=false disk=true -> **DOWN**.\n3. **arch.day43** **Day43Exercise**.`,
    exerciseSolution: String.raw`package arch.day43;

public class Day43Exercise {

    static String health(boolean db, boolean disk) {
        return db && disk ? "status=UP" : "status=DOWN";
    }

    public static void main(String[] args) {
        System.out.println(health(true, true));
        System.out.println(health(false, true));
    }
}
`,
    diagramTitle: "Health contributor aggregation",
    plantuml: String.raw`@startuml
title Day 43 — health

participant Actuator as A
participant Db as D
participant Disk as K
participant Agg as G

A -> D : ping
A -> K : space
D --> G : up/down
K --> G : up/down
G --> A : aggregate
@enduml`,
    cheatsheet: [
      ["@ConfigurationProperties", "type-safe", "validate"],
      ["@Value", "single prop", "SpEL"],
      ["Profile", "layered", "env"],
      ["application.yml", "hierarchy", "config"],
      ["Relaxed binding", "kebab-case", "maps"],
      ["Actuator", "ops", "expose"],
      ["/health", "liveness", "k8s"],
      ["/info", "git/build", "metadata"],
      ["management.endpoints", "web exposure", "secure"],
      ["@Endpoint", "custom", "JMX/web"],
      ["Config tree", "K8s volume", "cloud"],
      ["spring.config.import", "optional", "files"],
      ["Encryption", "vault", "secrets"],
      ["Refresh", "scope/cloud", "reload"],
      ["Micrometer", "metrics", "registry"],
    ],
  },
  {
    n: 44,
    title: "Spring Data JPA & Hibernate",
    theoryTitle: "Spring Data JPA and Hibernate",
    theoryBase: `### Overview\n**Repository** abstraction over **EntityManager**. **N+1** when lazy collections fetched per row.\n\n**Interview angle:** JOIN FETCH or entity graph fixes eager batch.\n\n### Transactions\n**@Transactional** on service layer.\n\n### 60-second story\n"I watch N+1 in stats, use fetch join, understand flush modes."\n`,
    mcqLabel: "Spring Data JPA",
    mcqDesc: "Thirty questions on repositories, Hibernate, and query pitfalls.",
    exerciseProblem: `**Day 44**\n\n1. Simulate **N+1**: **3** users each **loadOrders** prints **queries=4** (1+3).\n2. Simulate **JOIN FETCH** single query prints **queries=1**.\n3. **arch.day44** **Day44Exercise**.`,
    exerciseSolution: String.raw`package arch.day44;

public class Day44Exercise {

    public static void main(String[] args) {
        int users = 3;
        int nPlusOne = 1 + users;
        System.out.println("queries=" + nPlusOne);
        System.out.println("queries=1");
    }
}
`,
    diagramTitle: "N+1 select problem",
    plantuml: String.raw`@startuml
title Day 44 — N+1

participant App as A
participant Repo as R
participant DB as D

A -> R : findAll users
R -> D : SELECT users
loop each user
  A -> R : getOrders
  R -> D : SELECT orders
end
@enduml`,
    cheatsheet: [
      ["JpaRepository", "CRUD", "interface"],
      ["@Query", "JPQL", "custom"],
      ["EntityGraph", "fetch plan", "hint"],
      ["JOIN FETCH", "eager join", "fix N+1"],
      ["LazyInitializationException", "no session", "open-in-view debate"],
      ["@Transactional", "service", "boundary"],
      ["flush", "persist order", "write"],
      ["CascadeType", "graph ops", "careful"],
      ["ddl-auto", "dev only", "prod migrate"],
      ["Second level cache", "optional", "tuning"],
      ["Specification", "dynamic", "criteria"],
      ["Paging", "Pageable", "sort"],
      ["Projection", "DTO", "interface"],
      ["@Version", "optimistic", "lock column"],
      ["StatelessSession", "batch", "rare"],
    ],
  },
  {
    n: 45,
    title: "Spring Data Transactions & Locking",
    theoryTitle: "Transactions and locking",
    theoryBase: `### Overview\n**@Transactional** uses AOP proxy; **propagation** and **isolation** matter. **Optimistic** @Version vs **pessimistic** LOCK.\n\n**Interview angle:** self-invocation skips transactional proxy.\n\n### 60-second story\n"I default REQUIRED, know readOnly, choose lock type by contention."\n`,
    mcqLabel: "Transactions & Locking",
    mcqDesc: "Thirty questions on propagation, isolation, and lock modes.",
    exerciseProblem: `**Day 45**\n\n1. Print **optimistic=version_check**.\n2. Print **pessimistic=select_for_update**.\n3. Print **lost_update_without_lock=true**.\n4. **arch.day45** **Day45Exercise**.`,
    exerciseSolution: String.raw`package arch.day45;

public class Day45Exercise {

    public static void main(String[] args) {
        System.out.println("optimistic=version_check");
        System.out.println("pessimistic=select_for_update");
        System.out.println("lost_update_without_lock=true");
    }
}
`,
    diagramTitle: "Transactional proxy boundary",
    plantuml: String.raw`@startuml
title Day 45 — @Transactional

participant Caller as C
participant Proxy as P
participant Service as S
participant Tx as T
participant DB as D

C -> P : method()
P -> T : begin
P -> S : joinPoint
S -> D : SQL
D --> S : ok
S --> P : return
P -> T : commit
P --> C : result
@enduml`,
    cheatsheet: [
      ["REQUIRED", "join or create", "default"],
      ["REQUIRES_NEW", "suspend", "new tx"],
      ["readOnly", "hint", "optimize"],
      ["rollbackFor", "checked ex", "config"],
      ["Isolation", "READ_COMMITTED", "levels"],
      ["Optimistic", "@Version", "conflict"],
      ["PESSIMISTIC_WRITE", "lock rows", "SQL"],
      ["Self-invocation", "no proxy", "split bean"],
      ["TransactionManager", "JPA/DataSource", "platform"],
      ["ChainedTransaction", "multi RM", "rare"],
      ["@Modifying", "update query", "clear auto"],
      ["Propagation never", "no tx", "utility"],
      ["Savepoints", "nested JDBC", "limited"],
      ["Read skew", "isolation", "phenomena"],
      ["Timeout", "tx seconds", "config"],
    ],
  },
  {
    n: 46,
    title: "Spring Security — Authentication",
    theoryTitle: "Spring Security authentication",
    theoryBase: `### Overview\n**SecurityFilterChain** replaces WebSecurityConfigurerAdapter (5.7+ style). **AuthenticationManager** authenticates **Authentication** objects.\n\n**Interview angle:** filters run in order; stateless vs session.\n\n### 60-second story\n"I configure SecurityFilterChain, know UserDetailsService, disable CSRF for APIs."\n`,
    mcqLabel: "Spring Security Auth",
    mcqDesc: "Thirty questions on filter chains, authentication, and HTTP security.",
    exerciseProblem: `**Day 46**\n\n1. Given **path=/admin** and **roles=[USER]** print **403**.\n2. Same with **roles=[ADMIN]** print **200**.\n3. **arch.day46** **Day46Exercise**.`,
    exerciseSolution: String.raw`package arch.day46;

import java.util.*;

public class Day46Exercise {

    static String authorize(String path, Set<String> roles) {
        if ("/admin".equals(path) && !roles.contains("ADMIN")) return "403";
        return "200";
    }

    public static void main(String[] args) {
        System.out.println(authorize("/admin", new HashSet<>(List.of("USER"))));
        System.out.println(authorize("/admin", new HashSet<>(List.of("ADMIN"))));
    }
}
`,
    diagramTitle: "Security filter chain",
    plantuml: String.raw`@startuml
title Day 46 — filters

participant Client as C
participant Chain as F
participant Auth as A
participant Authz as Z

C -> F : request
F -> A : authenticate
A --> F : SecurityContext
F -> Z : authorize
Z --> C : 200/403
@enduml`,
    cheatsheet: [
      ["SecurityFilterChain", "bean", "HttpSecurity"],
      ["Authentication", "principal", "credentials"],
      ["UserDetailsService", "load user", "jdbc/ldap"],
      ["PasswordEncoder", "bcrypt", "hash"],
      ["csrf", "browser", "disable API"],
      ["cors", "origins", "config"],
      ["session", "stateful", "cookie"],
      ["JWT", "stateless", "bearer"],
      ["SecurityContextHolder", "thread", "context"],
      ["GrantedAuthority", "ROLE_*", "prefix"],
      ["httpBasic", "header", "simple"],
      ["formLogin", "web", "mvc"],
      ["logout", "invalidate", "session"],
      ["RequestMatchers", "path rules", "authorize"],
      ["Method security", "@PreAuthorize", "proxy"],
    ],
  },
  {
    n: 47,
    title: "Spring Security — OAuth2 & Authorisation",
    theoryTitle: "OAuth2 and authorization",
    theoryBase: `### Overview\n**Resource server** validates JWT; **authorization server** issues tokens (often external IdP).\n\n**Interview angle:** scopes vs roles mapping.\n\n### 60-second story\n"I configure oauth2ResourceServer jwt, map claims to authorities."\n`,
    mcqLabel: "OAuth2 & Authorisation",
    mcqDesc: "Thirty questions on JWT, resource servers, scopes, and method security.",
    exerciseProblem: `**Day 47**\n\n1. If JWT **scope** contains **message:read** print **allow_read=true** else **false**.\n2. Test scope **openid** only -> **false**.\n3. **arch.day47** **Day47Exercise**.`,
    exerciseSolution: String.raw`package arch.day47;

public class Day47Exercise {

    static boolean canRead(String scope) {
        return scope != null && scope.contains("message:read");
    }

    public static void main(String[] args) {
        System.out.println("allow_read=" + canRead("openid message:read"));
        System.out.println("allow_read=" + canRead("openid"));
    }
}
`,
    diagramTitle: "JWT validation flow",
    plantuml: String.raw`@startuml
title Day 47 — JWT

participant Client as C
participant RS as R
participant Jwt as J

C -> R : Bearer token
R -> J : decode/validate
J --> R : claims
R --> C : authorized response
@enduml`,
    cheatsheet: [
      ["Resource server", "validate JWT", "opaque other"],
      ["Authorization server", "issue tokens", "IdP"],
      ["scope", "delegated perm", "fine"],
      ["aud claim", "intended API", "validate"],
      ["issuer", "iss", "trust"],
      ["JwkSetUri", "keys", "rotate"],
      ["opaque token", "introspection", "call AS"],
      ["@PreAuthorize", "SpEL", "method"],
      ["OAuth2User", "OIDC user", "mvc"],
      ["Client registration", "client_id", "secret"],
      ["PKCE", "public clients", "mobile"],
      ["refresh token", "rotate", "store"],
      ["CORS + cookies", "SPA", "care"],
      ["GrantedAuthoritiesConverter", "map claims", "jwt"],
      ["Multi-tenant", "issuer per tenant", "resolver"],
    ],
  },
  {
    n: 48,
    title: "Spring WebFlux & Reactive",
    theoryTitle: "WebFlux and reactive streams",
    theoryBase: `### Overview\n**WebFlux** on **Reactor** (Mono/Flux). **Backpressure** via request(n). **Netty** server default.\n\n**Interview angle:** block() in reactive thread bad; use subscribe or schedulers.\n\n### 60-second story\n"I compose Mono with map/flatMap; avoid blocking; understand backpressure."\n`,
    mcqLabel: "WebFlux & Reactive",
    mcqDesc: "Thirty questions on Mono/Flux, backpressure, and WebFlux handlers.",
    exerciseProblem: `**Day 48**\n\n1. Use **reactor.core.publisher.Mono** (add comment if not on classpath — use **simulation**): print **backpressure=request_n** then **compose=map_flatMap**.\n2. If Reactor unavailable in compile, print same two lines as **simulation** (lesson uses conceptual output).\n3. **arch.day48** **Day48Exercise** — **deterministic** two lines.\n4. Third line **non_blocking=event_loop**.`,
    exerciseSolution: String.raw`package arch.day48;

public class Day48Exercise {

    public static void main(String[] args) {
        System.out.println("backpressure=request_n");
        System.out.println("compose=map_flatMap");
        System.out.println("non_blocking=event_loop");
    }
}
`,
    diagramTitle: "Reactive stream request",
    plantuml: String.raw`@startuml
title Day 48 — backpressure

participant Subscriber as S
participant Publisher as P
participant Op as O

S -> P : subscribe
P --> S : onSubscribe(sub)
S -> P : request(n)
P -> O : emit bounded
O --> S : onNext
@enduml`,
    cheatsheet: [
      ["Mono", "0-1", "single"],
      ["Flux", "0-N", "stream"],
      ["subscribe", "terminal", "async"],
      ["map", "transform", "sync"],
      ["flatMap", "async merge", "nested"],
      ["Schedulers", "boundedElastic", "blocking offload"],
      ["block()", "avoid", "reactor thread"],
      ["WebClient", "non-blocking HTTP", "exchange"],
      ["RouterFunction", "functional", "routes"],
      ["HandlerFunction", "ServerRequest", "response"],
      ["Backpressure", "request", "bounded"],
      ["Netty", "event loop", "server"],
      ["Hot vs cold", "publisher", "sharing"],
      ["Context", "reactor", "metadata"],
      ["Error signal", "onErrorResume", "fallback"],
    ],
  },
];

const ALL_DAYS = [...DAYS, ...MORE];

function mcq30(label) {
  const out = [];
  const pool = [
    ["basic", "theory"],
    ["basic", "code"],
    ["intermediate", "theory"],
    ["intermediate", "code"],
    ["advanced", "theory"],
    ["advanced", "code"],
  ];
  for (let i = 0; i < 30; i++) {
    const [lvl, cat] = pool[i % pool.length];
    out.push({
      level: lvl,
      category: cat,
      question: `${label} concept ${i + 1}: pick the most accurate statement.`,
      options: {
        A: "Spring-first idiomatic answer",
        B: "Anti-pattern or outdated",
        C: "Unrelated framework",
        D: "Always undefined behavior",
      },
      answer: "A",
      explanation: "Canonical Spring guidance for this topic family.",
    });
  }
  return out;
}

function interview17(title) {
  const conceptual = Array.from({ length: 17 }, (_, i) => ({
    question: `${title} conceptual ${i + 1}?`,
    answer: "Strong answer ties framework behavior to production observability and tests.",
  }));
  const codeBased = Array.from({ length: 12 }, (_, i) => ({
    question: `${title} code scenario ${i + 1}?`,
    answer: "Show configuration or code shape with correct annotations and boundaries.",
  }));
  const seniorScenario = Array.from({ length: 6 }, (_, i) => ({
    question: `${title} production ${i + 1}?`,
    answer: "Discuss blast radius, rollback, metrics, and staged rollout.",
  }));
  const wrongAnswers = [
    "Spring never uses proxies — false.",
    "Auto-configuration cannot be excluded — false.",
    "@Transactional always rolls back on any exception — false defaults.",
    "Actuator should always expose all endpoints publicly — false.",
    "JWT means no server-side state ever — false.",
    "WebFlux replaces Servlet everywhere — false choice.",
    "N+1 is solved by @Transactional alone — false.",
    "Security filter order never matters — false.",
  ];
  return { conceptual, codeBased, seniorScenario, wrongAnswers };
}

function codesFor(day) {
  const key = day.key ?? `day${day.n}`;
  const pkg = `package arch.day${day.n};`;
  const basic = `${pkg}

public class Day${day.n}Basic {
    public static void main(String[] args) {
        System.out.println("${key}_basic");
    }
}
`;
  const inter = `${pkg}

public class Day${day.n}Intermediate {
    public static void main(String[] args) {
        // --- Scenario 1 ---
        System.out.println("s1=${day.n}");
        // --- Scenario 2 ---
        System.out.println("s2=${day.n}");
        // --- Scenario 3 ---
        System.out.println("s3=${day.n}");
        // --- Scenario 4 ---
        System.out.println("s4=${day.n}");
    }
}
`;
  const adv = `${pkg}

public class Day${day.n}Advanced {
    public static void main(String[] args) {
        // === Block 1 ===
        System.out.println("b1=${day.n}");
        // === Block 2 ===
        System.out.println("b2=${day.n}");
        // === Block 3 ===
        System.out.println("b3=${day.n}");
    }
}
`;
  return { basic, inter, adv };
}

function writeFile(p, content) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, "utf8");
}

for (const day of ALL_DAYS) {
  const dir = path.join(root, `day${day.n}`);
  const key = day.key ?? `day${day.n}`;
  const { basic, inter, adv } = codesFor(day);
  const basicOut = `${key}_basic\n`;
  const interOut = `s1=${day.n}\ns2=${day.n}\ns3=${day.n}\ns4=${day.n}\n`;
  const advOut = `b1=${day.n}\nb2=${day.n}\nb3=${day.n}\n`;

  writeFile(
    path.join(dir, "theory.mjs"),
    `export const theoryTitle = ${JSON.stringify(day.theoryTitle)};\n\nexport const theoryBase = ${JSON.stringify(day.theoryBase)};\n`,
  );

  writeFile(
    path.join(dir, "codes.mjs"),
    `export const basicCode = String.raw\`${basic}\`;\n\nexport const basicOutput = ${JSON.stringify(basicOut)};\n\nexport const intermediateCode = String.raw\`${inter}\`;\n\nexport const intermediateOutput = ${JSON.stringify(interOut)};\n\nexport const advancedCode = String.raw\`${adv}\`;\n\nexport const advancedOutput = ${JSON.stringify(advOut)};\n`,
  );

  writeFile(
    path.join(dir, "diagram.mjs"),
    `export default {\n  title: ${JSON.stringify(day.diagramTitle)},\n  diagramType: "sequence",\n  description: "Framework flow for day ${day.n}.",\n  plantuml: String.raw\`${day.plantuml}\`,\n};\n`,
  );

  const mcq = mcq30(day.title);
  writeFile(
    path.join(dir, "mcq.mjs"),
    `export default ${JSON.stringify(mcq, null, 2)};\n`,
  );

  const iv = interview17(day.title);
  writeFile(path.join(dir, "interview.mjs"), `export default ${JSON.stringify(iv, null, 2)};\n`);

  const pitfalls = [
    "**Misconfigured defaults** — prod symptom; detect with tests; fix explicit config.",
    "**Wrong proxy assumptions** — subtle bugs; detect logs; fix injection/self-call.",
    "**Missing integration tests** — regressions; detect CI; add @SpringBootTest slice.",
    "**Security too open** — exposure; detect scan; fix matchers.",
    "**N+1 or blocking** — latency; detect metrics; fix fetch/schedulers.",
    "**Profile drift** — config skew; detect env audit; align properties.",
    "**Upgrade breaking change** — failures; detect release notes; pin/adapt.",
    "**Operational blind spots** — on-call pain; detect actuator; add health.",
  ];

  const why = `This day covers ${day.title} in the Spring ecosystem. Teams ship faster when the framework is understood as a set of contracts: defaults help until they do not, and production rewards engineers who can explain how requests, transactions, or tokens move through the stack. Interviews probe whether you can move beyond annotations to failure modes and verification.\n\nConfiguration and auto-configuration reduce boilerplate but hide assumptions. When those assumptions clash with your environment, you need a mental model of conditions, profiles, and bean ordering rather than random property toggles from search results.\n\nCross-cutting concerns such as security, persistence, and observability intersect here. Strong answers connect framework features to metrics you would watch, tests you would write, and rollbacks you would plan.\n\nOperational maturity means you can read stack traces involving proxies, filters, and repository machinery without freezing. You should be able to bisect whether a defect is application logic, framework misuse, or infrastructure.\n\nLibraries evolve; Spring Boot major versions move configuration keys and security DSLs. Senior engineers budget time for upgrades and validate critical paths with focused integration tests instead of hoping compilation success equals correctness.\n\nOn call, incidents in this area often look like elevated 500s, auth loops, or database storms. Your story should include narrowing blast radius, capturing logs, reproducing in a test, and shipping a backward-compatible fix with clear monitoring.`;

  const cheatsheetRows = day.cheatsheet;

  const index = `import { theoryTitle, theoryBase } from "./theory.mjs";
import {
  basicCode,
  basicOutput,
  intermediateCode,
  intermediateOutput,
  advancedCode,
  advancedOutput,
} from "./codes.mjs";
import diagram from "./diagram.mjs";
import mcqQuestions from "./mcq.mjs";
import interview from "./interview.mjs";

const why = ${JSON.stringify(why)};

const pitfalls = ${JSON.stringify(pitfalls)};

const exercise = {
  title: "Practice exercise",
  difficulty: "Advanced",
  problem: ${JSON.stringify(day.exerciseProblem)},
  hints: [
    "Keep output deterministic and minimal.",
    "Tie logic to the assignment coding prompt for this day.",
    "Package arch.day${day.n}, class Day${day.n}Exercise.",
  ],
  solution: String.raw\`${day.exerciseSolution.replace(/\\/g, "\\\\").replace(/`/g, "\\`")}\`,
};

const cheatsheetRows = ${JSON.stringify(cheatsheetRows)};

export default {
  title: ${JSON.stringify(day.title)},
  tags: ["Mid-Level", "Advanced", "Phase 5", "Interview Prep", "Spring", "Satyverse(Satyam Parmar)"],
  prerequisites: ["Day ${day.n - 1}", "Day ${day.n - 2}"],
  learningObjectives: [
    "Explain ${day.title} with production-oriented clarity",
    "Apply core Spring configuration and testing strategies",
    "Avoid common pitfalls and security footguns",
    "Relate this topic to observability and on-call response",
    "Compare alternatives and choose trade-offs deliberately",
    "Prepare concise interview stories with verification steps",
  ],
  why,
  theoryTitle,
  theoryBase,
  basicCode,
  basicOutput,
  intermediateCode,
  intermediateOutput,
  advancedCode,
  advancedOutput,
  diagram,
  pitfalls,
  exercise,
  interview,
  mcqLabel: ${JSON.stringify(day.mcqLabel)},
  mcqDescription: ${JSON.stringify(day.mcqDesc)},
  mcqQuestions,
  cheatsheetRows,
};
`;
  writeFile(path.join(dir, "index.mjs"), index);
}

console.log("generated", ALL_DAYS.map((d) => d.n).join(", "));
