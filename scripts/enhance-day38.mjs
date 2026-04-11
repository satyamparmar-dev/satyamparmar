import { readFileSync, writeFileSync } from 'fs';

const json = JSON.parse(readFileSync('public/data/days/phase5-day38.json', 'utf8'));

// ── 1. ENHANCE "why" — add daily-job angle paragraph ──────────────────────
const whySec = json.sections.find(s => s.type === 'why');
whySec.content += "\n\nIn daily engineering work, IoC and DI problems surface in three recurring ways. During code review, you spot a service with eight @Autowired fields — you know the class is doing too much and the hidden coupling will make the next feature slower. During debugging, a @Transactional method silently commits when it should roll back — you trace the call graph and find it called via this inside the same class. During on-call, you get paged for a memory leak — you pull a heap dump, find a HashMap in a singleton with 400,000 entries, and trace it to a scope mismatch that has been accumulating since the last deploy. Each of these problems has the same root: the engineer who wrote the code did not fully understand who owns object lifetime and how the proxy layer works. Understanding Spring Core at this level is not academic — it directly cuts your debugging time and reduces the number of incidents your team causes.";

// ── 2. ENHANCE "theory" — add 4 deep-dive sections ────────────────────────
const theorySec = json.sections.find(s => s.type === 'theory');
theorySec.content += `

### 10. Spring's three-level singleton cache — why field injection tolerates circular deps

Spring's **DefaultSingletonBeanRegistry** manages singletons with three internal caches that work together to allow field-injection circular dependencies:

**Level 1 — singletonFactories**: As soon as Spring starts constructing a singleton (after calling the constructor), it registers an ObjectFactory lambda into this map. This lambda can produce an early reference to the partially-constructed bean. This happens *before* any fields are injected.

**Level 2 — earlySingletonObjects**: When another bean needs the not-yet-complete bean, Spring calls the Level 1 factory, gets the early reference, removes it from singletonFactories, and stores it here. The bean is incomplete — fields are not yet set — but the Java reference is stable.

**Level 3 — singletonObjects**: The fully-initialized singleton. When Spring finishes injecting all fields and running @PostConstruct, the bean moves here.

**How a field-injection cycle resolves:** Bean A starts creation → ObjectFactory for A placed in Level 1 → Spring injects Bean B into A's @Autowired field → B needs A → Spring finds A's factory in Level 1 → early A reference moved to Level 2 → B's field receives incomplete A → B finishes → A finishes → both move to Level 3. The early reference in Level 2 is the same Java object identity as the final A in Level 3 — everything is consistent once both are done.

**Why constructor injection cannot use this mechanism:** The constructor call *is* the creation step. For Spring to call new BeanA(BeanB b), BeanB must already be fully created. There is no moment before the constructor where an early reference exists. Hence constructor cycles produce a clean fail-fast: **The dependencies of some beans in the application context form a cycle**.

**Spring Boot 2.6 change:** spring.main.allow-circular-references defaults to false. This disables Level 1/2 resolution. Circular deps that were silently resolving via the three-level cache now fail at startup — forcing teams to fix the design. Re-enable temporarily with spring.main.allow-circular-references=true while migrating legacy code.

**Interview angle:** "The three-level cache explains why @Autowired field injection can sometimes tolerate circular deps while constructor injection always fails loudly. But tolerates does not mean safe — the injected bean is partially initialized when the other bean first uses it, which is a latent correctness hazard when @PostConstruct methods call across the cycle."

### 11. FactoryBean\<T\> — beans that produce other beans

**FactoryBean<T>** is a Spring SPI interface. A bean implementing it registers the *product* of getObject(), not itself. Key contract:

- **getObject()** — creates or returns the product
- **getObjectType()** — product type used for @Autowired type-matching
- **isSingleton()** — whether to cache the product (default: true)

**Access rules in code:**
- context.getBean("dataSource") returns the product (a DataSource)
- context.getBean("&dataSource") returns the FactoryBean itself (& prefix convention)

**Where you see it every day in production:**
- **Spring Data JPA**: JpaRepositoryFactoryBean creates the UserRepository proxy for every interface extending JpaRepository. The interface you declare is never instantiated — JpaRepositoryFactoryBean.getObject() returns a JDK dynamic proxy.
- **MyBatis-Spring**: SqlSessionFactoryBean builds the SqlSessionFactory from your mapper XML files.
- **Hibernate**: LocalSessionFactoryBean assembles the SessionFactory from entity scanning config.
- **Spring Integration**: MessageChannel factory beans build typed channel implementations.

**When to write your own FactoryBean:** When a third-party client requires multi-step construction and the factory itself needs injected Spring beans. Example: a Kafka AdminClient that needs @Value-injected bootstrap servers, a custom SSL KeyStore bean, and a retry policy bean — all three injected into the FactoryBean's constructor, combined in getObject() to build the client.

**Interview angle:** "When you ask how injecting UserRepository works given it is only an interface, the answer is FactoryBean. Spring Data registers a JpaRepositoryFactoryBean per interface. getObject() returns a JDK dynamic proxy implementing your interface. getBean() gives you the proxy transparently."

### 12. @Import variants — the backbone of auto-configuration

**@Import** has three distinct modes that underpin all of Spring Boot's autoconfiguration:

**Mode 1 — Direct @Configuration import:**
@Import(SecurityConfig.class) registers SecurityConfig as a @Configuration class, equivalent to having it component-scanned. Used in modular apps to assemble explicit configurations without component scanning.

**Mode 2 — ImportSelector:**
Spring calls selectImports(AnnotationMetadata) which returns an array of fully-qualified class names to register as @Configuration beans. @EnableAutoConfiguration uses AutoConfigurationImportSelector which reads:
META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports
Every class name in that file is imported as a @Configuration if its @Conditional conditions pass.

**Mode 3 — ImportBeanDefinitionRegistrar:**
Gets direct programmatic access to BeanDefinitionRegistry. Can register any number of BeanDefinitions of any type. Examples:
- @EnableJpaRepositories scans for Repository interfaces, registers JpaRepositoryFactoryBean per interface
- @EnableCaching registers CacheInterceptor and AnnotationCacheOperationSource
- @ComponentScan delegates to ClassPathBeanDefinitionScanner

**How a Spring Boot Starter works end-to-end:**
1. You add spring-boot-starter-data-redis to pom.xml
2. The JAR's META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports contains RedisAutoConfiguration
3. @EnableAutoConfiguration triggers AutoConfigurationImportSelector at Phase 1
4. RedisAutoConfiguration is imported, but @ConditionalOnClass(RedisConnectionFactory.class) passes (Lettuce is on classpath)
5. @Bean methods in RedisAutoConfiguration register RedisConnectionFactory, RedisTemplate, etc.
6. Your @Autowired RedisTemplate<String, Object> is satisfied automatically

**Interview angle:** "Every @EnableXxx annotation works through @Import. Trace @EnableScheduling: it imports SchedulingConfiguration, which registers ScheduledAnnotationBeanPostProcessor — the BeanPostProcessor that scans for @Scheduled methods and registers them with TaskScheduler."

### 13. @DependsOn, SmartInitializingSingleton, and initialization ordering

**@DependsOn("liquibaseMigration")** forces the named bean to be fully initialized — constructor called, fields injected, @PostConstruct completed — before the annotated bean is created. Spring's dependency ordering algorithm only considers constructor-parameter edges. Side-effect dependencies (database migration must run before repositories start) are invisible unless expressed with @DependsOn.

**Real scenario:** A Flyway migration bean has initMethod = "migrate". Without @DependsOn on the @Configuration that creates JPA repositories, Spring may create the JPA EntityManagerFactory (which triggers schema validation) before Flyway runs. The result is a SchemaValidationException on startup that only occurs in fresh environments with no existing schema.

**@Order controls list injection order, not bean creation order.** @Order(1) on PaymentProcessor A and @Order(2) on B means A appears first in List<PaymentProcessor>. Lower number = higher priority. It does NOT guarantee A is instantiated before B — use @DependsOn for that.

**SmartInitializingSingleton.afterSingletonsInstantiated()** fires after ALL non-lazy singletons are in Level 3 (singletonObjects) — after Phase 4 (BeanPostProcessors applied, all proxies in place) but before Phase 5 (ContextRefreshedEvent, ApplicationRunner.run()). Use it for:
- Cross-bean validation: "Are all required PaymentProcessor beans registered?"
- Pre-warming caches that require multiple fully-initialized beans
- Registering Micrometer metrics whose tag values come from other beans
- Printing a startup summary of active feature flags

**Ordering among BeanFactoryPostProcessors:** BFPP implementations that implement PriorityOrdered run before Ordered, which run before the rest. ConfigurationClassPostProcessor (processes @Configuration and registers all @Bean methods) implements PriorityOrdered at HIGHEST_PRECEDENCE so it always runs first — all other BFPPs depend on @Configuration classes having been processed.

**Interview angle:** "When a NullPointerException occurs inside @PostConstruct calling another bean, the first question is: is that other bean guaranteed to be initialized? If the constructor does not declare it as a parameter, Spring has no ordering obligation. @DependsOn is the explicit declaration of that ordering requirement."`;

// ── 3. ADD 2 more conceptual Q&As ─────────────────────────────────────────
const interview = json.sections.find(s => s.type === 'interview');

interview.conceptual.push({
  question: "What is FactoryBean in Spring and how does Spring Data use it to create repository proxies?",
  answer: "**FactoryBean<T>** is a Spring SPI interface that allows a registered bean to act as a factory producing a different object. When a class implementing FactoryBean<UserRepository> is registered, Spring calls getObject() at startup and registers the *product* in the context — not the factory itself. Calling context.getBean(\"userRepo\") returns the UserRepository product. Calling context.getBean(\"&userRepo\") (the & prefix) returns the FactoryBean instance.\n\n**Spring Data uses FactoryBean for every repository interface.** When @EnableJpaRepositories is processed, a JpaRepositoriesRegistrar (ImportBeanDefinitionRegistrar) scans for interfaces extending Repository<T, ID> and registers a JpaRepositoryFactoryBean BeanDefinition for each one. At startup, JpaRepositoryFactoryBean.getObject() creates a JDK dynamic proxy implementing your interface, backed by Spring Data's query resolution engine.\n\nThis is why you can @Autowired UserRepository even though you only declared an interface — FactoryBean is the bridge between interface declaration and a runtime proxy. The FactoryBean pattern is also used by MyBatis SqlSessionFactoryBean, Hibernate LocalSessionFactoryBean, and any library that needs complex multi-step construction of a bean.",
  followUps: [
    {
      question: "How would you detect in a running context that a particular bean was created by a FactoryBean?",
      answer: "Three approaches: (1) context.isFactoryBean(\"beanName\") returns true if the backing BeanDefinition comes from a FactoryBean. (2) In the context's bean names list, the name appears once for the product — call context.getBean(\"&beanName\") to retrieve the factory itself; if that succeeds and returns a FactoryBean, you know. (3) In the BeanDefinition registry, the registered class is the FactoryBean implementation class, not the product type — context.getBeanDefinition(\"beanName\").getBeanClassName() returns JpaRepositoryFactoryBean, not UserRepository. In practical debugging, the Spring startup log with --debug shows each bean's class name, which reveals FactoryBeans."
    },
    {
      question: "Can you write your own FactoryBean and when would you use it over a plain @Bean method?",
      answer: "Yes — implement FactoryBean<T> on a @Component or @Bean-declared class. getObject() builds the product, getObjectType() returns the type for autowiring, isSingleton() controls caching. Prefer FactoryBean over @Bean when: (1) the factory itself needs multiple injected Spring beans as constructor parameters, and passing them all to a @Bean method would be unwieldy; (2) isSingleton() needs to return false to create a new product per injection point; (3) you are writing reusable library code where consumers configure the factory bean in their context rather than calling your @Bean method. For application code, a @Bean method is almost always cleaner and more readable — reserve FactoryBean for integrations and frameworks."
    }
  ]
});

interview.conceptual.push({
  question: "How does Spring's three-level singleton cache work, and why did Spring Boot 2.6 disable circular reference resolution by default?",
  answer: "**DefaultSingletonBeanRegistry** manages singleton creation with three caches: singletonFactories (ObjectFactory lambdas placed immediately after constructor call), earlySingletonObjects (early bean references after first factory invocation), and singletonObjects (fully initialized singletons).\n\nWhen Bean A starts construction, Spring immediately adds an ObjectFactory for A to singletonFactories. If during A's initialization Spring needs Bean B, and B has a field pointing to A, Spring finds A's factory in singletonFactories, calls it to get an early reference, moves it to earlySingletonObjects, and injects it into B's field. B completes. A's field injection finishes. Both move to singletonObjects.\n\n**Constructor injection cannot use this mechanism** because the constructor call *is* the instantiation — there is no moment before construction where an early reference exists. Hence constructor cycles fail at startup with a clear error.\n\n**Spring Boot 2.6 defaulted spring.main.allow-circular-references to false** for two reasons: (1) a bean injected via the early reference is *partially initialized* — its own fields may be null when the other bean calls methods on it inside @PostConstruct, causing subtle bugs; (2) circular dependencies are a design smell indicating the two beans are too tightly coupled. Forcing startup failure surfaces the problem immediately rather than hiding it. Re-enable temporarily with spring.main.allow-circular-references=true while migrating legacy code.",
  followUps: [
    {
      question: "If Spring Boot 2.6+ fails on circular refs by default, how do you migrate a large legacy codebase safely?",
      answer: "Step 1: add spring.main.allow-circular-references=true to get the application running. Step 2: run with --debug to see all circular dependency warnings in the startup log — Spring logs every bean involved in a resolved cycle. Step 3: prioritize by impact: fix cycles in high-traffic services first. Step 4: for each cycle, extract the shared logic into a new @Component with no dependencies on either circular bean. Step 5: add an ArchUnit rule to CI that detects cycles in the service layer: noClasses().that().resideInPackage(\"..service..\").should().dependOnEachOther() — prevents regressions. Step 6: once all cycles are fixed, remove allow-circular-references=true."
    },
    {
      question: "What is the concrete risk of an early-reference bean being used in @PostConstruct?",
      answer: "Suppose Bean A has a field @Autowired Bean B, and Bean B has a field @Autowired Bean A with a @PostConstruct that calls a.getSomeList(). When B's @PostConstruct runs, A is the early reference from Level 2 — its constructor has run but its own @Autowired fields (like userRepository) are not yet set. getSomeList() may call userRepository.findAll(), which throws NullPointerException because userRepository is null. This bug is non-deterministic: it depends on bean creation order, which can change after adding a new bean or upgrading Spring. The early reference is the same Java object identity as the final A, but its internal state is incomplete at the time B's @PostConstruct sees it."
    }
  ]
});

// ── 4. ADD 2 more codeBased Q&As ─────────────────────────────────────────
interview.codeBased.push({
  question: "Show how @DependsOn forces initialization order for a side-effect dependency.",
  answer: "// Problem: Flyway migration must complete before JPA repositories start\n// Spring cannot detect this because there is no constructor parameter edge\n\n// @Configuration\n// public class RepositoryConfig {\n//\n//     // @DependsOn ensures flywayMigration bean is fully initialized first\n//     @Bean\n//     @DependsOn(\"flywayMigration\")\n//     public EntityManagerFactory entityManagerFactory(DataSource ds) {\n//         LocalContainerEntityManagerFactoryBean factory = ...\n//         return factory.getObject();\n//     }\n//\n//     @Bean(name = \"flywayMigration\", initMethod = \"migrate\")\n//     public Flyway flyway(DataSource ds) {\n//         return Flyway.configure().dataSource(ds).load();\n//         // migrate() called as initMethod after this @Bean method returns\n//     }\n// }\n\n// Without @DependsOn, Spring may create EntityManagerFactory first\n// triggering schema validation before Flyway creates the schema\n// Result: SchemaValidationException in fresh environments\n\n// Alternative for post-all-singleton work: implement SmartInitializingSingleton\n// afterSingletonsInstantiated() fires after all beans are ready",
  followUps: [
    {
      question: "What happens if you accidentally create a cycle with @DependsOn — A depends on B and B depends on A?",
      answer: "Spring detects the @DependsOn cycle before any instantiation begins and throws BeanCreationException: Circular depends-on relationship between beans. The error names both beans and the cycle direction. This check is separate from the constructor-injection cycle check and runs in Phase 3 before any bean is instantiated. The fix: remove one direction. Usually only one bean actually needs the other's side effect — identify which side effect is truly required and keep only that @DependsOn."
    },
    {
      question: "When is @DependsOn appropriate versus restructuring the constructor dependencies?",
      answer: "Use constructor injection when Bean A uses Bean B's return value — the dependency is a collaborator. Use @DependsOn when Bean A needs a *side effect* of Bean B's initialization but does not hold a reference to B — the database schema must exist, a cache must be populated, a file must be written. The rule: if removing @DependsOn would cause a NullPointerException, use constructor injection. If removing @DependsOn would cause a missing-schema error or wrong startup order without any NPE, use @DependsOn. Mixing the two patterns makes the dependency graph harder to read — comment clearly why @DependsOn is needed."
    }
  ]
});

interview.codeBased.push({
  question: "Show a custom FactoryBean that produces a configured third-party client.",
  answer: "// FactoryBean wraps complex multi-step SDK construction\n// The factory itself is a Spring bean with injected dependencies\n\n// @Component\n// public class RedissonClientFactoryBean implements FactoryBean<RedissonClient> {\n//\n//     private final String redisUrl;              // @Value injected\n//     private final SslConfig sslConfig;          // another Spring bean\n//     private final RetryPolicy retryPolicy;      // another Spring bean\n//\n//     public RedissonClientFactoryBean(\n//         @Value(\"${redis.url}\") String redisUrl,\n//         SslConfig sslConfig,\n//         RetryPolicy retryPolicy\n//     ) {\n//         this.redisUrl = redisUrl;\n//         this.sslConfig = sslConfig;\n//         this.retryPolicy = retryPolicy;\n//     }\n//\n//     @Override\n//     public RedissonClient getObject() throws Exception {\n//         Config config = new Config();\n//         config.useSingleServer()\n//             .setAddress(redisUrl)\n//             .setSslConfig(sslConfig.toRedissonSsl())\n//             .setRetryAttempts(retryPolicy.maxAttempts());\n//         return Redisson.create(config);\n//     }\n//\n//     @Override public Class<?> getObjectType() { return RedissonClient.class; }\n//     @Override public boolean isSingleton() { return true; }\n// }\n\n// Usage: @Autowired RedissonClient client;  ← receives getObject() product\n// Access factory: context.getBean(\"&redissonClientFactoryBean\")",
  followUps: [
    {
      question: "What is the modern Spring alternative to FactoryBean for complex bean creation?",
      answer: "A @Bean method in a @Configuration class that takes the dependencies as method parameters: @Bean public RedissonClient redissonClient(@Value(\"${redis.url}\") String url, SslConfig ssl, RetryPolicy retry) { ... }. Spring injects each parameter from the context. This is simpler, more readable, and does not require implementing a framework interface. FactoryBean is still the right choice when: (1) isSingleton() must return false (new client per injection), (2) the factory needs to be a Spring-managed bean implementing other interfaces, or (3) you are building a reusable library where users configure the factory bean type rather than calling your @Bean method. For application code, @Bean methods win on clarity."
    },
    {
      question: "How does @Autowired type resolution work when both a FactoryBean and its product are registered?",
      answer: "Spring uses getObjectType() from the FactoryBean for type-matching during autowiring. When resolving @Autowired RedissonClient client, Spring checks all bean definitions — for FactoryBean definitions, it calls getObjectType() rather than looking at the class declaration. If getObjectType() returns RedissonClient.class, the factory is a candidate for the injection. The FactoryBean itself is never injected for @Autowired RedissonClient because its class is RedissonClientFactoryBean, not RedissonClient. This transparent resolution is why FactoryBean-produced beans feel like any other Spring bean to consumers — they declare @Autowired against the product type and never know about the factory."
    }
  ]
});

// ── 5. ENRICH pitfalls with detection/fix hints ────────────────────────────
const pitfallsSec = json.sections.find(s => s.type === 'pitfalls');
pitfallsSec.items = [
  "Using field injection with @Autowired instead of constructor injection — fields cannot be final, unit tests require ReflectionTestUtils or a full Spring context, and circular dependencies silently resolve via the three-level cache (until Spring Boot 2.6 defaulted allow-circular-references=false); detect by running IntelliJ's Spring inspections or Checkstyle with a rule against @Autowired on fields; fix by moving all dependencies to the constructor.",
  "Storing request-specific state (user ID, locale, trace ID, tenant ID) in a singleton-scoped field — the field is shared across all concurrent HTTP requests; the last writer wins; any thread can read another user's data; this is a GDPR-class security bug; detect by adding a concurrent integration test that fires two requests with different users simultaneously and asserts no cross-contamination; fix by using method parameters, @RequestScope beans, or ThreadLocal cleared in a filter.",
  "Calling a @Transactional, @Async, @Cacheable, or @Retryable method from within the same class using this.method() — Spring's CGLIB or JDK proxy is bypassed; the AOP interceptor never runs; transactions never start; async tasks run synchronously on the caller's thread; detect by adding TransactionSynchronizationManager.isActualTransactionActive() inside the method (it returns false) or by asserting Thread.currentThread().getName() inside @Async; fix by extracting the method to a separate @Component or by injecting self.",
  "Injecting a prototype-scoped bean directly into a singleton constructor — the prototype is instantiated once at singleton creation and pinned in the final field forever; per-call mutable state accumulates across all callers; detect by adding a counter to the prototype and asserting it resets between calls in a test; fix by injecting ObjectFactory<T> or javax.inject.Provider<T> and calling getObject()/get() per invocation, or use @Lookup method injection.",
  "Making a @Configuration class or its @Bean methods final — CGLIB cannot subclass final types; Spring falls back silently to lite mode; @Bean methods called between each other create new instances instead of returning the cached singleton; a DataSource referenced twice creates two connection pools; detect by enabling debug logging (spring.jpa.show-sql and connection pool size alerts); fix by removing all final modifiers from @Configuration classes and @Bean methods.",
  "Running synchronous network calls, loading large files, or blocking on external services inside @PostConstruct — any slow operation delays the entire context startup; any exception prevents the app from starting and causes Kubernetes liveness probes to kill the pod before it becomes Ready; detect by measuring context startup time (management.endpoint.startup.enabled=true, GET /actuator/startup); fix by moving remote calls to ApplicationRunner.run() with retry logic, keeping @PostConstruct for local initialization only.",
  "Using applicationContext.getBean() in business logic or service classes — this is the Service Locator anti-pattern; dependencies are hidden from the constructor (makes the class lie about what it needs), unit testing requires a live context, bypasses lifecycle and AOP proxy management; detect via code review or ArchUnit rule noClasses().should().callMethod(ApplicationContext.class, \"getBean\"); fix by declaring all dependencies in the constructor and letting Spring inject them.",
  "Treating @Lazy as a permanent solution to circular dependencies — @Lazy injects a CGLIB proxy placeholder that initializes the real bean on the first method call; wiring errors surface under live traffic instead of at deploy; the first caller pays full initialization cost (latency spike); future engineers cannot understand why @Lazy exists without reading git history; @Lazy only masks the design problem, it does not fix it; detect by adding a tech-debt comment and a TODO ticket; fix by extracting the shared dependency into a third bean with no circular relationship to either original bean."
];

// ── 6. EXPAND cheatsheet to 15 rows ────────────────────────────────────────
const cheatSec = json.sections.find(s => s.type === 'cheatsheet');
cheatSec.content = `| Topic | Rule of thumb | Interview one-liner |
|-------|---------------|---------------------|
| Constructor vs field injection | Constructor for required deps; field injection is a code smell | "Field injection prevents final fields and requires a Spring context to unit test" |
| Circular dependency root fix | Extract shared bean C that A and B both depend on | "Constructor cycles fail loud at startup — that is the right and safe behavior" |
| Bean scope: singleton | Default; never store per-request state in a field | "Singleton is shared across all threads — a mutable field leaks data between users" |
| Scope mismatch | Inject ObjectFactory<T> instead of T for prototype-in-singleton | "Direct prototype injection pins one instance to the singleton forever" |
| Proxy bypass / self-invocation | Only external calls hit the Spring proxy | "this.method() bypasses @Transactional, @Async, and @Cacheable entirely" |
| BeanPostProcessor | Runs after each bean is created; replaces bean reference with proxy | "@Transactional is applied by AnnotationAwareAspectJAutoProxyCreator, not the compiler" |
| @Configuration CGLIB | @Bean methods are intercepted to return the cached singleton | "Calling @Bean methods inside @Configuration goes through the CGLIB proxy" |
| Startup phases | BeanDef → BFPP → Instantiate → BPP → Ready → Shutdown | "@Conditional runs in phase 2; AOP proxies are applied in phase 4" |
| BeanFactory vs ApplicationContext | Always ApplicationContext; BeanFactory is for framework internals | "ApplicationContext adds eager init, events, environment, and i18n abstraction" |
| @Lazy | Defers bean init to first use; moves wiring errors to runtime | "@Lazy trades deploy-time validation for late errors under live traffic" |
| Three-level cache | Enables field-injection circular deps via early references | "Spring Boot 2.6 disables this by default; the early reference is partially initialized" |
| FactoryBean<T> | getBean(name) = product; getBean(&name) = the factory | "Spring Data uses FactoryBean to turn a Repository interface into a JPA proxy" |
| @Import modes | Direct class / ImportSelector / ImportBeanDefinitionRegistrar | "Every @EnableXxx annotation uses @Import — trace it to see what beans get registered" |
| @DependsOn | Forces side-effect ordering when constructor cannot express it | "@DependsOn for schema migrations; constructor injection for real bean dependencies" |
| SmartInitializingSingleton | afterSingletonsInstantiated() fires after all singletons are ready | "Use it to validate cross-bean invariants before the app serves its first request" |`;

// ── 7. Write, verify ────────────────────────────────────────────────────────
const output = JSON.stringify(json, null, 2);
writeFileSync('public/data/days/phase5-day38.json', output, 'utf8');
const verify = JSON.parse(readFileSync('public/data/days/phase5-day38.json', 'utf8'));
const iv = verify.sections.find(s => s.type === 'interview');
const th = verify.sections.find(s => s.type === 'theory');
const ch = verify.sections.find(s => s.type === 'cheatsheet');
const pt = verify.sections.find(s => s.type === 'pitfalls');
const wy = verify.sections.find(s => s.type === 'why');
console.log('File written, size:', output.length, 'chars');
console.log('Conceptual Q&As:', iv.conceptual.length);
console.log('CodeBased Q&As:', iv.codeBased.length);
console.log('SeniorScenario Q&As:', iv.seniorScenario.length);
console.log('WrongAnswers:', iv.wrongAnswers.length);
console.log('Pitfall count:', pt.items.length);
console.log('Cheatsheet rows:', (ch.content.match(/^\|[^-]/gm) || []).length - 1);
console.log('Theory length (chars):', th.content.length);
console.log('Why paragraphs:', wy.content.split('\n\n').length);
