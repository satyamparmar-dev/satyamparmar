import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '../public/data/days/phase5-day39.json');

// ─── WHY ──────────────────────────────────────────────────────────────────────
const whyContent =
  'Spring bean lifecycle is where tutorials end and production begins. ' +
  'In a real microservice, two things go wrong at startup more than anything else: ' +
  'a bean fires a database query inside @PostConstruct before the connection pool is warmed up, ' +
  'or a Kafka consumer starts polling before the topic it depends on is created by an infrastructure bean. ' +
  'Both failures look like transient network errors in Kubernetes logs, and both are completely deterministic once you understand initialization order. ' +
  'Knowing the twelve phases of the Spring bean lifecycle is not an academic exercise — it is the checklist you run when on-call at 2 AM staring at a CrashLoopBackOff.\n\n' +

  'Advanced dependency injection matters the moment your codebase ships more than one implementation of the same interface. ' +
  'Every real payment system has a live gateway and a stub. Every notification service has an email sender and an SMS sender. ' +
  'Without @Qualifier or @Primary, Spring throws a NoUniqueBeanDefinitionException at startup — that is the lucky failure mode. ' +
  'The unlucky one is that @Primary silently wires the stub in prod because someone added @Primary to the test double and the production profile was never tested end-to-end. ' +
  'Interviewers who ask about @Qualifier and @Primary are not testing annotation trivia; they are checking whether you have debugged this class of bug before.\n\n' +

  'BeanPostProcessor is the bridge between the bean lifecycle and every cross-cutting concern in your application. ' +
  'AOP proxies, @Transactional, @Async, Spring Security method security, caching — all of them are applied by BeanPostProcessors that wrap your bean in a CGLIB subclass after initialization. ' +
  'If you do not know this, self-invocation on @Transactional methods is a mystery. ' +
  'You call a @Transactional method from within the same bean and wonder why the transaction never starts: the answer is that the proxy is bypassed when you call this.method() directly. ' +
  'Understanding BPP order and proxy creation turns that mystery into a three-line explanation in a code review.\n\n' +

  'Scope mismatch is one of the most common memory leaks in Spring applications, and it is silent. ' +
  'A prototype-scoped EmailService is injected into a singleton OrderService. ' +
  'Spring injects the prototype instance once at singleton creation time and never creates a new one. ' +
  'Every order goes through the same EmailService instance — fine for stateless beans, catastrophic for beans that hold per-request state like a logged-in user or a correlation ID. ' +
  'The fix (ObjectFactory or Provider) is two lines of code, but you cannot write it if you do not understand why the mismatch exists in the first place.\n\n' +

  'Circular dependencies are a symptom, not just a compiler error. ' +
  'When BeanA needs BeanB and BeanB needs BeanA in their constructors, Spring throws BeanCurrentlyInCreationException at startup. ' +
  'Switching to setter injection silently resolves the startup error but leaves the circular dependency in place, which means null fields during early initialization if the order is not exactly right. ' +
  '@Lazy on one constructor parameter defers instantiation and breaks the cycle, but senior engineers ask the next question: why do these two beans need each other at all? ' +
  'Circular dependencies usually signal a missing third abstraction — a service that should be extracted to break the cycle structurally.\n\n' +

  'On call, startup failures after a Spring Boot upgrade often trace back to changed BeanPostProcessor ordering, a new @Conditional that evaluates differently in your environment, or a SmartInitializingSingleton that now runs code that depends on beans not yet created. ' +
  'Your interview narrative should include how you reproduce startup failures in a minimal @SpringBootTest, how you add DEBUG logging for org.springframework.beans.factory to watch bean creation order, ' +
  'and how you use ApplicationContext.getBeanDefinitionNames() to inspect what the container actually registered. ' +
  'That debugging workflow separates engineers who memorize lifecycle diagrams from engineers who can fix production startup failures under pressure.';

// ─── THEORY ───────────────────────────────────────────────────────────────────
const theoryContent =
  '### The 12-phase Spring bean lifecycle — plain-language walkthrough\n\n' +
  'Every singleton bean passes through these phases in order:\n' +
  '1. **BeanDefinition loaded** — class name, scope, init/destroy method names are read from annotations or XML.\n' +
  '2. **BeanFactoryPostProcessor runs** — can modify bean definitions (e.g., override property values) before any bean is instantiated.\n' +
  '3. **Instantiation** — constructor is called. Dependencies not yet set.\n' +
  '4. **Property injection** — @Autowired fields/setters, @Value, @Resource filled in.\n' +
  '5. **BeanNameAware.setBeanName()** — container passes the bean\'s own name.\n' +
  '6. **BeanFactoryAware / ApplicationContextAware** — container passes itself.\n' +
  '7. **BeanPostProcessor.postProcessBeforeInitialization()** — runs for every bean; @PostConstruct is processed here by CommonAnnotationBeanPostProcessor.\n' +
  '8. **InitializingBean.afterPropertiesSet()** — if implemented.\n' +
  '9. **Custom initMethod** — if declared via @Bean(initMethod="...").\n' +
  '10. **BeanPostProcessor.postProcessAfterInitialization()** — CGLIB/JDK proxies for AOP, @Transactional, @Async are created here. The proxy replaces the raw bean in the context.\n' +
  '11. **SmartInitializingSingleton.afterSingletonsInstantiated()** — called once, after ALL singleton beans have completed phase 10.\n' +
  '12. **Destruction** (on context.close()) — @PreDestroy → DisposableBean.destroy() → custom destroyMethod.\n\n' +
  '**Interview angle:** memorize the order as "BFPP → construct → inject → Aware → BPP-before → afterPropertiesSet → initMethod → BPP-after → SmartInit → destroy".\n\n' +

  '### BeanFactoryPostProcessor vs BeanPostProcessor — what each one touches\n\n' +
  'These two names are similar but operate at completely different lifecycle phases.\n\n' +
  '**BeanFactoryPostProcessor** runs after the container has read all bean definitions but before it has instantiated any bean. ' +
  'Its contract is: modify BeanDefinition objects. ' +
  'PropertySourcesPlaceholderConfigurer is a BeanFactoryPostProcessor — it resolves ${...} placeholders by reading Environment sources into bean definitions before construction happens. ' +
  'You implement it to override property values, change scopes, or register extra bean definitions programmatically.\n\n' +
  '**BeanPostProcessor** runs around each individual bean\'s initialization — once before (postProcessBeforeInitialization) and once after (postProcessAfterInitialization). ' +
  'Its contract is: optionally wrap or replace the bean instance. ' +
  'AutowiredAnnotationBeanPostProcessor processes @Autowired. CommonAnnotationBeanPostProcessor processes @PostConstruct/@PreDestroy. ' +
  'AbstractAutoProxyCreator creates CGLIB proxies for @Transactional and AOP advice. ' +
  'If you register a BeanPostProcessor as an @Bean, Spring instantiates it very early in the lifecycle — before most other beans — which means @Transactional and @Async do NOT apply to the BeanPostProcessor itself.\n\n' +
  '**Interview angle:** "BeanFactoryPostProcessor changes definitions; BeanPostProcessor changes instances."\n\n' +

  '### @PostConstruct, afterPropertiesSet, and initMethod — the callback order\n\n' +
  'Three mechanisms exist for init callbacks and they fire in this order:\n' +
  '1. @PostConstruct (processed by CommonAnnotationBeanPostProcessor in postProcessBeforeInitialization)\n' +
  '2. InitializingBean.afterPropertiesSet()\n' +
  '3. @Bean(initMethod="myInit") or <bean init-method="myInit"/>\n\n' +
  '@PostConstruct is the JSR-250 standard — framework agnostic, preferred for new code. ' +
  'It runs after injection is complete so all @Autowired fields are populated.\n' +
  'InitializingBean couples your class to Spring API — acceptable in framework/library code but not in business beans.\n' +
  'initMethod is useful when configuring third-party classes you cannot annotate.\n\n' +
  'The rule for new code: use @PostConstruct. Use initMethod only for third-party classes. Never mix all three in the same bean.\n\n' +
  '**Common gotcha:** @PostConstruct cannot throw checked exceptions via its signature — wrap them in RuntimeException or use try-catch inside.\n\n' +

  '### @PreDestroy and prototype scope — the silent non-cleanup\n\n' +
  'For **singleton** beans, the container calls @PreDestroy and DisposableBean.destroy() when the ApplicationContext is closed (context.close() or JVM shutdown hook). ' +
  'This is where you close connections, flush buffers, deregister JMX beans.\n\n' +
  'For **prototype** beans, the container does NOT call destroy callbacks. ' +
  'The container creates a new prototype instance every time getBean() or @Autowired asks for it, ' +
  'then immediately hands ownership to the caller. ' +
  'The caller is responsible for cleanup. ' +
  'If the prototype holds a database connection or a thread, and nothing closes it, you have a resource leak.\n\n' +
  'Detection: add a @PreDestroy that prints a message and run a load test. ' +
  'If the message never appears for prototype beans, you have confirmed the behavior.\n\n' +
  'Fix options: (1) make it singleton and re-think state management, (2) use ObjectFactory and manually call destroy(), (3) implement DisposableBean and track instances in a registry.\n\n' +

  '### Aware interfaces — injecting the container itself\n\n' +
  'Aware interfaces let a bean request framework infrastructure from the container during initialization (phase 5-6):\n\n' +
  '- **BeanNameAware.setBeanName(String name)** — receives the bean\'s ID as registered in the context. Useful for logging or programmatic lookup.\n' +
  '- **ApplicationContextAware.setApplicationContext(ApplicationContext ctx)** — gives access to the full context. Use for getBean() lookups or publishing events. Avoid overusing; it breaks testability.\n' +
  '- **EnvironmentAware.setEnvironment(Environment env)** — access to property sources and active profiles. Prefer @Value or @ConfigurationProperties for simple property reads.\n' +
  '- **ResourceLoaderAware.setResourceLoader(ResourceLoader loader)** — for loading classpath/file resources programmatically.\n' +
  '- **EmbeddedValueResolverAware.setEmbeddedValueResolver(StringValueResolver resolver)** — resolve ${...} and #{...} expressions in code.\n\n' +
  'Note: You can also just inject ApplicationContext via @Autowired since Spring 4.3 — the Aware interface style is older but still valid in infrastructure code.\n\n' +

  '### SmartInitializingSingleton — after everything is wired\n\n' +
  'SmartInitializingSingleton has one method: afterSingletonsInstantiated(). ' +
  'It runs once, after ALL singleton beans in the context have been created and post-processed. ' +
  'This is later than any individual bean\'s @PostConstruct, which runs per-bean during its own initialization.\n\n' +
  'Use cases:\n' +
  '- Validate that all required beans are correctly configured (e.g., check that every @EventListener method refers to an existing event type).\n' +
  '- Start background tasks that depend on the full application context being ready.\n' +
  '- Register all beans of a particular type into a registry or router.\n\n' +
  '**vs ApplicationListener<ContextRefreshedEvent>:** ContextRefreshedEvent fires when the context is fully refreshed (including for child contexts), so it can fire multiple times. ' +
  'SmartInitializingSingleton fires exactly once per context creation, making it safer for startup validation logic.\n\n' +

  '### @DependsOn — forcing initialization order without injection\n\n' +
  '@DependsOn tells the container "initialize bean X before initializing this bean, even if there is no direct injection relationship." ' +
  'The classic use case: a KafkaTopicInitializer bean creates topics on startup. ' +
  'The KafkaConsumer bean must start after the topics exist. ' +
  'But the consumer does not @Autowire the initializer — it just needs it to have run.\n\n' +
  '@DependsOn("kafkaTopicInitializer") on the consumer bean adds a directed edge in the dependency graph without creating an @Autowired field.\n\n' +
  'Important: @DependsOn only guarantees initialization order. ' +
  'It does not inject the named bean. ' +
  'It does not guarantee the named bean succeeded without exceptions. ' +
  'If ordering alone is not enough (you need to wait for an async operation), use an event, a Latch, or an ApplicationListener.\n\n' +

  '### @Primary and @Qualifier — disambiguation strategies\n\n' +
  'When multiple beans implement the same interface, Spring needs to know which one to inject.\n\n' +
  '**@Primary** marks one bean as the default for unqualified injection points. ' +
  'Simple and works well when you have one real implementation and several test doubles. ' +
  'Risk: if @Primary is added to the wrong bean in a profile-specific config, every unqualified injection gets the wrong implementation silently.\n\n' +
  '**@Qualifier("name")** at both the @Bean declaration and the @Autowired injection point creates an explicit named binding. ' +
  'More verbose but unambiguous. Preferred when two real implementations coexist in the same profile.\n\n' +
  '**Custom qualifier annotations** (meta-annotated with @Qualifier) give you type-safe disambiguation: @StripePaymentGateway and @PayPalPaymentGateway are clearer than @Qualifier("stripe") and @Qualifier("paypal"), and IDEs can trace them.\n\n' +
  '**@Primary vs @Qualifier precedence:** @Qualifier always wins over @Primary at a specific injection point.\n\n' +

  '### Prototype scope in singleton — the scope mismatch trap\n\n' +
  'The classic problem: You have a prototype-scoped RequestContextHolder bean that stores per-request data. ' +
  'You inject it into a singleton OrderService. ' +
  'Spring constructs the singleton once, injects the prototype instance once at that moment, and never injects a new one. ' +
  'Every request through OrderService sees the same shared state — exactly what prototype scope was supposed to prevent.\n\n' +
  '**Solution 1: ObjectFactory<T>** — inject ObjectFactory<PrototypeBean> into the singleton. ' +
  'Call objectFactory.getObject() each time you need a fresh instance. ' +
  'Spring creates a new prototype instance on each call.\n\n' +
  '**Solution 2: javax.inject.Provider<T>** — same semantics as ObjectFactory but from the JSR-330 standard. ' +
  'Preferred in framework-agnostic code.\n\n' +
  '**Solution 3: @Scope(proxyMode = ScopedProxyMode.TARGET_CLASS)** on the prototype bean — Spring injects a scoped proxy instead of a real instance. ' +
  'Each call through the proxy delegates to a new prototype instance. ' +
  'Works transparently but CGLIB proxy means the class cannot be final.\n\n' +

  '### Circular dependencies — detection and resolution\n\n' +
  'A circular dependency exists when A needs B and B needs A (or any longer cycle).\n\n' +
  '**Constructor injection + circular dependency:** Spring cannot create A because it needs B, cannot create B because it needs A. ' +
  'Fails fast at startup with BeanCurrentlyInCreationException. This is the good failure — fail loud, fail early.\n\n' +
  '**Setter/field injection + circular dependency (Spring < 6):** Spring created both beans via their constructors first (no dependencies yet), then injected fields in a second pass. ' +
  'This resolved the cycle silently but left a window where fields could be null.\n\n' +
  '**Spring 6 changed the default:** circular dependencies via field injection now throw by default unless spring.main.allow-circular-references=true. ' +
  'This was a deliberate breaking change to surface hidden design problems.\n\n' +
  '**@Lazy to break the cycle:** placing @Lazy on one constructor parameter injects a CGLIB proxy instead of the real bean. ' +
  'The proxy is created immediately but the real bean is only initialized on first method call. ' +
  'This breaks the cycle but hides the underlying design flaw — add a code comment explaining why.\n\n' +
  '**Real fix:** extract a third bean (EventBus, Registry, Mediator) that both A and B depend on. No cycle.\n\n' +

  '### FactoryBean<T> — creating complex objects with container help\n\n' +
  'FactoryBean<T> is an interface with getObject(), getObjectType(), and isSingleton(). ' +
  'You register a FactoryBean as a bean; the container calls getObject() when something autowires the target type T.\n\n' +
  'Classic use cases: MyBatis SqlSessionFactoryBean, Spring\'s LocalContainerEntityManagerFactoryBean, ' +
  'ProxyFactoryBean for manual AOP, JndiObjectFactoryBean for legacy JNDI lookups.\n\n' +
  'Key trap: context.getBean("myFactory") returns the product (T), not the FactoryBean. ' +
  'To get the FactoryBean itself, prefix with "&": context.getBean("&myFactory").\n\n' +
  'In modern Spring Boot you rarely write FactoryBeans directly — @Bean methods with complex initialization logic replace most use cases. ' +
  'But you will encounter them in library code and legacy configs, and interviewers use them as a litmus test.\n\n' +

  '### @Lazy — deferred initialization and circular dependency escape hatch\n\n' +
  '@Lazy on a @Bean method or @Component defers instantiation until the bean is first requested (lazy singleton). ' +
  'Default Spring behavior creates all singletons eagerly at context startup.\n\n' +
  'When to use:\n' +
  '- Cut startup time for beans that are expensive to create but rarely used (optional integrations, report generators).\n' +
  '- Break circular dependency (last resort — prefer structural fix).\n' +
  '- Defer heavy initialization until after health checks report ready.\n\n' +
  'When NOT to use:\n' +
  '- Beans with side effects that must run at startup (Flyway migration, Kafka topic creation).\n' +
  '- Beans whose initialization errors should fail the startup, not fail the first request.\n\n' +
  '@Lazy on @Autowired means "inject a lazy-resolution proxy; only resolve the real bean on first method call." ' +
  'Different from @Lazy on @Component (which controls when the bean itself is created).\n\n' +

  '### 60-second interview story\n\n' +
  '"The Spring bean lifecycle has twelve phases. The key sequence is: BeanFactoryPostProcessor modifies definitions, then beans are constructed and injected, then Aware interfaces fire, then BPP-before runs (where @PostConstruct fires), then afterPropertiesSet, then custom initMethod, then BPP-after where AOP proxies are created. SmartInitializingSingleton runs once after all singletons are done. Prototype beans are not destroyed by the container. ' +
  'For disambiguation I use @Qualifier for explicit wiring and @Primary as the default when one implementation dominates. ' +
  'Scope mismatch gets fixed with ObjectFactory or Provider, not with a scoped proxy unless transparent access is required. ' +
  'I treat circular dependencies as a design smell — I use @Lazy only as a temporary escape hatch and extract a third abstraction as the real fix. ' +
  'For ordering without injection I use @DependsOn; for post-all-beans logic I use SmartInitializingSingleton. ' +
  'I debug startup failures with DEBUG logging on org.springframework.beans.factory and a minimal @SpringBootTest that reproduces the ordering bug."';

// ─── CODE: BASIC ──────────────────────────────────────────────────────────────
const basicCode =
  'package arch.day39;\n\n' +
  '// Simulates the Spring bean lifecycle phases in plain Java\n' +
  '// Run this to see the exact callback order before touching a Spring app\n' +
  'public class Day39LifecycleOrder {\n\n' +
  '    // ── Simulated interfaces (Spring\'s real contracts) ────────────────────\n' +
  '    interface BeanNameAware      { void setBeanName(String name); }\n' +
  '    interface InitializingBean   { void afterPropertiesSet() throws Exception; }\n' +
  '    interface DisposableBean     { void destroy() throws Exception; }\n' +
  '    // @PostConstruct and @PreDestroy are annotations — simulated as method calls\n\n' +
  '    // ── A bean that implements every lifecycle hook ────────────────────────\n' +
  '    static class LifecycleBean implements BeanNameAware, InitializingBean, DisposableBean {\n\n' +
  '        private String dependency; // injected after construction\n' +
  '        private String beanName;\n\n' +
  '        // Phase 3: Constructor\n' +
  '        public LifecycleBean() {\n' +
  '            System.out.println("[1] Constructor called — dependency is null: " + (dependency == null));\n' +
  '        }\n\n' +
  '        // Phase 4: Property injection (setter injection simulated)\n' +
  '        public void setDependency(String dep) {\n' +
  '            this.dependency = dep;\n' +
  '            System.out.println("[2] Setter injection — dependency = \'" + dependency + "\'");\n' +
  '        }\n\n' +
  '        // Phase 5: BeanNameAware\n' +
  '        @Override\n' +
  '        public void setBeanName(String name) {\n' +
  '            this.beanName = name;\n' +
  '            System.out.println("[3] BeanNameAware.setBeanName(\'" + name + "\')");\n' +
  '        }\n\n' +
  '        // Phase 7 (via BPP-before): @PostConstruct equivalent\n' +
  '        public void postConstruct() {\n' +
  '            System.out.println("[4] @PostConstruct — all fields injected, dependency = \'" + dependency + "\'");\n' +
  '        }\n\n' +
  '        // Phase 8: InitializingBean\n' +
  '        @Override\n' +
  '        public void afterPropertiesSet() {\n' +
  '            System.out.println("[5] InitializingBean.afterPropertiesSet()");\n' +
  '        }\n\n' +
  '        // Phase 9: custom initMethod\n' +
  '        public void customInit() {\n' +
  '            System.out.println("[6] Custom initMethod (declared via @Bean(initMethod=...))");\n' +
  '        }\n\n' +
  '        // Phase 10: After BPP-after, bean is now the AOP proxy (simulated as-is)\n' +
  '        // Phase 12a: @PreDestroy equivalent\n' +
  '        public void preDestroy() {\n' +
  '            System.out.println("[7] @PreDestroy — releasing resources for beanName: " + beanName);\n' +
  '        }\n\n' +
  '        // Phase 12b: DisposableBean\n' +
  '        @Override\n' +
  '        public void destroy() {\n' +
  '            System.out.println("[8] DisposableBean.destroy()");\n' +
  '        }\n\n' +
  '        public void businessMethod() {\n' +
  '            System.out.println("Business logic — dependency = " + dependency);\n' +
  '        }\n' +
  '    }\n\n' +
  '    // ── Container simulation ──────────────────────────────────────────────\n' +
  '    static class SimpleContainer {\n' +
  '        public LifecycleBean createAndInit(String beanName, String dependency) throws Exception {\n' +
  '            // Phase 3: instantiate\n' +
  '            LifecycleBean bean = new LifecycleBean();\n' +
  '            // Phase 4: inject properties\n' +
  '            bean.setDependency(dependency);\n' +
  '            // Phase 5: Aware\n' +
  '            bean.setBeanName(beanName);\n' +
  '            // Phase 7: @PostConstruct (via BPP-before)\n' +
  '            bean.postConstruct();\n' +
  '            // Phase 8: afterPropertiesSet\n' +
  '            bean.afterPropertiesSet();\n' +
  '            // Phase 9: custom init\n' +
  '            bean.customInit();\n' +
  '            // Phase 10: BPP-after would create proxy here — skipped in plain Java\n' +
  '            System.out.println("[BPP-after] AOP proxy created (CGLIB wraps bean here in real Spring)");\n' +
  '            return bean;\n' +
  '        }\n\n' +
  '        public void destroyBean(LifecycleBean bean) throws Exception {\n' +
  '            bean.preDestroy();  // @PreDestroy\n' +
  '            bean.destroy();     // DisposableBean\n' +
  '        }\n' +
  '    }\n\n' +
  '    public static void main(String[] args) throws Exception {\n' +
  '        SimpleContainer container = new SimpleContainer();\n' +
  '        System.out.println("=== Container starting ===");\n' +
  '        LifecycleBean bean = container.createAndInit("lifecycleBean", "database-connection-pool");\n' +
  '        System.out.println("=== All singletons ready (SmartInitializingSingleton.afterSingletonsInstantiated fires here) ===");\n' +
  '        bean.businessMethod();\n' +
  '        System.out.println("=== Context closing ===");\n' +
  '        container.destroyBean(bean);\n' +
  '    }\n' +
  '}';

const basicOutput =
  '=== Container starting ===\n' +
  '[1] Constructor called — dependency is null: true\n' +
  '[2] Setter injection — dependency = \'database-connection-pool\'\n' +
  '[3] BeanNameAware.setBeanName(\'lifecycleBean\')\n' +
  '[4] @PostConstruct — all fields injected, dependency = \'database-connection-pool\'\n' +
  '[5] InitializingBean.afterPropertiesSet()\n' +
  '[6] Custom initMethod (declared via @Bean(initMethod=...))\n' +
  '[BPP-after] AOP proxy created (CGLIB wraps bean here in real Spring)\n' +
  '=== All singletons ready (SmartInitializingSingleton.afterSingletonsInstantiated fires here) ===\n' +
  'Business logic — dependency = database-connection-pool\n' +
  '=== Context closing ===\n' +
  '[7] @PreDestroy — releasing resources for beanName: lifecycleBean\n' +
  '[8] DisposableBean.destroy()';

// ─── CODE: INTERMEDIATE ───────────────────────────────────────────────────────
const intermediateCode =
  'package arch.day39;\n\n' +
  'import org.springframework.beans.BeansException;\n' +
  'import org.springframework.beans.factory.*;\n' +
  'import org.springframework.beans.factory.annotation.*;\n' +
  'import org.springframework.beans.factory.config.BeanPostProcessor;\n' +
  'import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;\n' +
  'import org.springframework.context.*;\n' +
  'import org.springframework.context.annotation.*;\n' +
  'import org.springframework.core.Ordered;\n' +
  'import org.springframework.stereotype.Service;\n\n' +
  'import jakarta.annotation.PostConstruct;\n' +
  'import jakarta.annotation.PreDestroy;\n' +
  'import java.util.Map;\n' +
  'import java.util.concurrent.ConcurrentHashMap;\n\n' +
  '// ─────────────────────────────────────────────────────────────────────────\n' +
  '// SCENARIO 1: Bean with all four init/destroy styles — shows callback order\n' +
  '// ─────────────────────────────────────────────────────────────────────────\n' +
  '@Service\n' +
  'public class ConnectionPool implements InitializingBean, DisposableBean {\n\n' +
  '    private final String url;\n' +
  '    private boolean connected;\n\n' +
  '    public ConnectionPool(@Value("${db.url:jdbc:h2:mem:test}") String url) {\n' +
  '        this.url = url;\n' +
  '        System.out.println("1. Constructor — url=" + url + ", connected=" + connected);\n' +
  '    }\n\n' +
  '    @PostConstruct  // fires first (via CommonAnnotationBeanPostProcessor)\n' +
  '    public void init() {\n' +
  '        this.connected = true;\n' +
  '        System.out.println("2. @PostConstruct — opening connection to " + url);\n' +
  '    }\n\n' +
  '    @Override  // fires second\n' +
  '    public void afterPropertiesSet() {\n' +
  '        System.out.println("3. afterPropertiesSet — validating connection: " + connected);\n' +
  '        if (!connected) throw new IllegalStateException("Connection not established");\n' +
  '    }\n\n' +
  '    // @Bean(initMethod="warmUp") would fire third — omitted here\n\n' +
  '    @PreDestroy  // fires first on context close\n' +
  '    public void onShutdown() {\n' +
  '        System.out.println("4. @PreDestroy — flushing pending queries");\n' +
  '    }\n\n' +
  '    @Override  // fires second on context close\n' +
  '    public void destroy() {\n' +
  '        this.connected = false;\n' +
  '        System.out.println("5. DisposableBean.destroy — pool closed");\n' +
  '    }\n' +
  '}\n\n' +
  '// ─────────────────────────────────────────────────────────────────────────\n' +
  '// SCENARIO 2: BeanPostProcessor that measures every bean\'s init time\n' +
  '//             and prints beans that take longer than a threshold\n' +
  '// ─────────────────────────────────────────────────────────────────────────\n' +
  '@Component\n' +
  'public class SlowBeanDetector implements BeanPostProcessor, Ordered {\n\n' +
  '    private final Map<String, Long> startTimes = new ConcurrentHashMap<>();\n' +
  '    private static final long THRESHOLD_MS = 100;\n\n' +
  '    @Override\n' +
  '    public int getOrder() { return Ordered.LOWEST_PRECEDENCE; } // run last\n\n' +
  '    @Override\n' +
  '    public Object postProcessBeforeInitialization(Object bean, String beanName) {\n' +
  '        startTimes.put(beanName, System.currentTimeMillis());\n' +
  '        return bean; // must return the bean (or a replacement)\n' +
  '    }\n\n' +
  '    @Override\n' +
  '    public Object postProcessAfterInitialization(Object bean, String beanName) {\n' +
  '        Long start = startTimes.remove(beanName);\n' +
  '        if (start != null) {\n' +
  '            long elapsed = System.currentTimeMillis() - start;\n' +
  '            if (elapsed > THRESHOLD_MS) {\n' +
  '                System.out.printf("WARN: bean \'%s\' took %dms to initialize%n", beanName, elapsed);\n' +
  '            }\n' +
  '        }\n' +
  '        return bean; // return original bean; AOP creator would return proxy here\n' +
  '    }\n' +
  '}\n\n' +
  '// ─────────────────────────────────────────────────────────────────────────\n' +
  '// SCENARIO 3: Aware interfaces — bean that receives its own name and context\n' +
  '// ─────────────────────────────────────────────────────────────────────────\n' +
  '@Service\n' +
  'public class SelfAwareService implements BeanNameAware, ApplicationContextAware {\n\n' +
  '    private String beanName;\n' +
  '    private ApplicationContext ctx;\n\n' +
  '    @Override\n' +
  '    public void setBeanName(String name) {\n' +
  '        this.beanName = name;  // fires before @PostConstruct\n' +
  '        System.out.println("BeanNameAware: my registered name is \'" + name + "\'");\n' +
  '    }\n\n' +
  '    @Override\n' +
  '    public void setApplicationContext(ApplicationContext context) throws BeansException {\n' +
  '        this.ctx = context;  // fires before @PostConstruct\n' +
  '        System.out.println("ApplicationContextAware: context type = " + context.getClass().getSimpleName());\n' +
  '    }\n\n' +
  '    @PostConstruct\n' +
  '    public void verify() {\n' +
  '        // By the time @PostConstruct runs, Aware callbacks have already fired\n' +
  '        System.out.println("@PostConstruct: beanName=" + beanName + ", ctx ready=" + (ctx != null));\n' +
  '        // Look up sibling beans — use sparingly; breaks testability\n' +
  '        int count = ctx.getBeanDefinitionCount();\n' +
  '        System.out.println("Total beans in context: " + count);\n' +
  '    }\n' +
  '}\n\n' +
  '// ─────────────────────────────────────────────────────────────────────────\n' +
  '// SCENARIO 4: SmartInitializingSingleton — post-startup validation\n' +
  '//             Runs ONCE after ALL singleton beans are initialized\n' +
  '// ─────────────────────────────────────────────────────────────────────────\n' +
  '@Component\n' +
  'public class StartupValidator implements SmartInitializingSingleton {\n\n' +
  '    @Autowired\n' +
  '    private ApplicationContext ctx;\n\n' +
  '    @Override\n' +
  '    public void afterSingletonsInstantiated() {\n' +
  '        // Safe to look up all beans here — no more beans will be created\n' +
  '        Map<String, PaymentGateway> gateways = ctx.getBeansOfType(PaymentGateway.class);\n' +
  '        if (gateways.isEmpty()) {\n' +
  '            throw new IllegalStateException("No PaymentGateway bean registered — startup aborted");\n' +
  '        }\n' +
  '        boolean hasPrimary = gateways.values().stream().anyMatch(g -> g.isLive());\n' +
  '        if (!hasPrimary) {\n' +
  '            System.out.println("WARN: No live PaymentGateway — running in stub mode");\n' +
  '        }\n' +
  '        System.out.println("StartupValidator: " + gateways.size() + " PaymentGateway(s) registered");\n' +
  '    }\n' +
  '}\n\n' +
  'interface PaymentGateway { boolean isLive(); }\n\n' +
  '// Usage note:\n' +
  '// @PostConstruct on individual beans: runs DURING that bean\'s init phase\n' +
  '// SmartInitializingSingleton: runs AFTER all singleton beans are ready\n' +
  '// ApplicationListener<ContextRefreshedEvent>: fires on every context refresh (can be multiple times)\n' +
  '// Use SmartInitializingSingleton for startup validation; ContextRefreshedEvent for event-driven logic';

const intermediateOutput =
  '1. Constructor — url=jdbc:h2:mem:test, connected=false\n' +
  '2. @PostConstruct — opening connection to jdbc:h2:mem:test\n' +
  '3. afterPropertiesSet — validating connection: true\n' +
  'BeanNameAware: my registered name is \'selfAwareService\'\n' +
  'ApplicationContextAware: context type = AnnotationConfigApplicationContext\n' +
  '@PostConstruct: beanName=selfAwareService, ctx ready=true\n' +
  'Total beans in context: 12\n' +
  'StartupValidator: 1 PaymentGateway(s) registered\n' +
  '--- On context.close() ---\n' +
  '4. @PreDestroy — flushing pending queries\n' +
  '5. DisposableBean.destroy — pool closed';

// ─── CODE: ADVANCED ───────────────────────────────────────────────────────────
const advancedCode =
  'package arch.day39;\n\n' +
  'import org.springframework.beans.factory.*;\n' +
  'import org.springframework.beans.factory.annotation.*;\n' +
  'import org.springframework.beans.factory.config.BeanFactoryPostProcessor;\n' +
  'import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;\n' +
  'import org.springframework.context.annotation.*;\n' +
  'import org.springframework.stereotype.*;\n\n' +
  'import jakarta.annotation.PostConstruct;\n' +
  'import jakarta.inject.Provider;\n' +
  'import java.util.UUID;\n\n' +
  '// ─────────────────────────────────────────────────────────────────────────\n' +
  '// SCENARIO 1: Scope mismatch — prototype injected into singleton\n' +
  '//             BUG first, then three fix options\n' +
  '// ─────────────────────────────────────────────────────────────────────────\n\n' +
  '// Prototype bean — should be a fresh instance per usage\n' +
  '@Component\n' +
  '@Scope("prototype")\n' +
  'class RequestContext {\n' +
  '    private final String requestId = UUID.randomUUID().toString();\n' +
  '    public String getRequestId() { return requestId; }\n' +
  '}\n\n' +
  '// BUG: @Autowired injects ONE prototype instance at singleton creation time\n' +
  '@Service\n' +
  'class OrderServiceBuggy {\n' +
  '    @Autowired\n' +
  '    private RequestContext ctx; // SAME instance for every order — bug!\n\n' +
  '    public void processOrder() {\n' +
  '        // Every call returns the same requestId — prototype scope is defeated\n' +
  '        System.out.println("BUG requestId: " + ctx.getRequestId());\n' +
  '    }\n' +
  '}\n\n' +
  '// FIX A: ObjectFactory — Spring\'s built-in lazy provider\n' +
  '@Service\n' +
  'class OrderServiceFixed {\n' +
  '    @Autowired\n' +
  '    private ObjectFactory<RequestContext> ctxFactory; // inject the factory, not the instance\n\n' +
  '    public void processOrder() {\n' +
  '        RequestContext ctx = ctxFactory.getObject(); // fresh prototype every call\n' +
  '        System.out.println("FIXED (ObjectFactory) requestId: " + ctx.getRequestId());\n' +
  '    }\n' +
  '}\n\n' +
  '// FIX B: javax.inject.Provider (JSR-330 — framework-agnostic)\n' +
  '@Service\n' +
  'class OrderServiceProvider {\n' +
  '    @Autowired\n' +
  '    private Provider<RequestContext> ctxProvider;\n\n' +
  '    public void processOrder() {\n' +
  '        RequestContext ctx = ctxProvider.get(); // fresh prototype every call\n' +
  '        System.out.println("FIXED (Provider) requestId: " + ctx.getRequestId());\n' +
  '    }\n' +
  '}\n\n' +
  '// FIX C: Scoped proxy (transparent — caller code unchanged)\n' +
  '@Component\n' +
  '@Scope(value = "prototype", proxyMode = ScopedProxyMode.TARGET_CLASS)\n' +
  'class RequestContextProxy {\n' +
  '    private final String requestId = UUID.randomUUID().toString();\n' +
  '    public String getRequestId() { return requestId; }\n' +
  '}\n\n' +
  '@Service\n' +
  'class OrderServiceProxy {\n' +
  '    @Autowired\n' +
  '    private RequestContextProxy ctx; // Spring injects a CGLIB proxy\n\n' +
  '    public void processOrder() {\n' +
  '        // Each ctx.getRequestId() call goes through the proxy to a new prototype\n' +
  '        System.out.println("FIXED (ScopedProxy) requestId: " + ctx.getRequestId());\n' +
  '    }\n' +
  '}\n\n' +
  '// ─────────────────────────────────────────────────────────────────────────\n' +
  '// SCENARIO 2: FactoryBean — producing configured HttpClient instances\n' +
  '// ─────────────────────────────────────────────────────────────────────────\n' +
  '@Component("httpClient")\n' +
  'class HttpClientFactory implements FactoryBean<java.net.http.HttpClient> {\n\n' +
  '    @Value("${http.connectTimeoutSeconds:5}")\n' +
  '    private int connectTimeout;\n\n' +
  '    @Override\n' +
  '    public java.net.http.HttpClient getObject() {\n' +
  '        return java.net.http.HttpClient.newBuilder()\n' +
  '            .connectTimeout(java.time.Duration.ofSeconds(connectTimeout))\n' +
  '            .followRedirects(java.net.http.HttpClient.Redirect.NORMAL)\n' +
  '            .build();\n' +
  '    }\n\n' +
  '    @Override\n' +
  '    public Class<?> getObjectType() { return java.net.http.HttpClient.class; }\n\n' +
  '    @Override\n' +
  '    public boolean isSingleton() { return true; } // one shared client\n' +
  '}\n\n' +
  '// Usage:\n' +
  '// @Autowired HttpClient client;              -- gets the product (HttpClient)\n' +
  '// context.getBean("httpClient")              -- also gets the product\n' +
  '// context.getBean("&httpClient")             -- gets the FactoryBean itself\n\n' +
  '// ─────────────────────────────────────────────────────────────────────────\n' +
  '// SCENARIO 3: @DependsOn for side-effect ordering\n' +
  '//             KafkaTopicInitializer must run before KafkaConsumer starts\n' +
  '// ─────────────────────────────────────────────────────────────────────────\n' +
  '@Component("kafkaTopicInitializer")\n' +
  'class KafkaTopicInitializer {\n\n' +
  '    @PostConstruct\n' +
  '    public void createTopics() {\n' +
  '        // Creates required Kafka topics if they don\'t exist\n' +
  '        System.out.println("KafkaTopicInitializer: ensuring topics exist...");\n' +
  '        // adminClient.createTopics(...) would go here\n' +
  '        System.out.println("KafkaTopicInitializer: topics ready");\n' +
  '    }\n' +
  '}\n\n' +
  '@Component\n' +
  '@DependsOn("kafkaTopicInitializer") // ensures topic init runs BEFORE consumer starts\n' +
  'class OrderEventConsumer {\n\n' +
  '    @PostConstruct\n' +
  '    public void startConsuming() {\n' +
  '        // Safe to start — topics guaranteed to exist\n' +
  '        System.out.println("OrderEventConsumer: subscribing to order-events topic");\n' +
  '    }\n' +
  '}\n\n' +
  '// ─────────────────────────────────────────────────────────────────────────\n' +
  '// SCENARIO 4: Circular dependency — constructor injection fails, solutions\n' +
  '// ─────────────────────────────────────────────────────────────────────────\n\n' +
  '// CIRCULAR DEPENDENCY — OrderService needs NotificationService and vice versa\n' +
  '// BAD: Constructor injection causes BeanCurrentlyInCreationException at startup\n' +
  '/*\n' +
  '@Service class OrderService {\n' +
  '    @Autowired OrderService(NotificationService ns) { ... } // FAILS\n' +
  '}\n' +
  '@Service class NotificationService {\n' +
  '    @Autowired NotificationService(OrderService os) { ... } // FAILS\n' +
  '}\n' +
  '*/\n\n' +
  '// FIX OPTION 1: @Lazy on one parameter (escape hatch — not ideal)\n' +
  'interface OrderEvents { void orderPlaced(String orderId); }\n' +
  'interface Notifications { void send(String msg); }\n\n' +
  '@Service\n' +
  'class OrderServiceWithLazy {\n' +
  '    private final Notifications notifications;\n\n' +
  '    @Autowired\n' +
  '    public OrderServiceWithLazy(@Lazy Notifications notifications) {\n' +
  '        // Spring injects a CGLIB proxy; real bean resolved on first method call\n' +
  '        this.notifications = notifications;\n' +
  '    }\n\n' +
  '    public void placeOrder(String id) {\n' +
  '        System.out.println("Order placed: " + id);\n' +
  '        notifications.send("Your order " + id + " is confirmed");\n' +
  '    }\n' +
  '}\n\n' +
  '@Service\n' +
  'class NotificationServiceImpl implements Notifications {\n' +
  '    @Autowired\n' +
  '    private OrderEvents orderEvents; // setter injection, no cycle at construction time\n\n' +
  '    @Override\n' +
  '    public void send(String msg) { System.out.println("NOTIFY: " + msg); }\n' +
  '}\n\n' +
  '// FIX OPTION 2 (preferred): Extract shared abstraction — break the cycle structurally\n' +
  '@Service\n' +
  'class EventBus { // both services depend on EventBus; neither depends on the other\n' +
  '    public void publish(String event) { System.out.println("EVENT: " + event); }\n' +
  '}\n\n' +
  '@Service\n' +
  'class OrderServiceClean {\n' +
  '    private final EventBus eventBus;\n' +
  '    OrderServiceClean(EventBus eventBus) { this.eventBus = eventBus; }\n' +
  '    public void placeOrder(String id) { eventBus.publish("order.placed:" + id); }\n' +
  '}\n\n' +
  '@Service\n' +
  'class NotificationServiceClean {\n' +
  '    private final EventBus eventBus;\n' +
  '    NotificationServiceClean(EventBus eventBus) { this.eventBus = eventBus; }\n' +
  '    // listens to events from EventBus — no direct coupling to OrderService\n' +
  '}\n\n' +
  '// ─────────────────────────────────────────────────────────────────────────\n' +
  '// SCENARIO 5: @Qualifier + @Primary for multiple PaymentGateway implementations\n' +
  '// ─────────────────────────────────────────────────────────────────────────\n' +
  'interface PaymentGatewayService { String charge(double amount); }\n\n' +
  '@Service("stripeGateway")\n' +
  '@Primary // default for unqualified @Autowired PaymentGatewayService\n' +
  'class StripeGateway implements PaymentGatewayService {\n' +
  '    @Override public String charge(double amount) { return "Stripe: charged " + amount; }\n' +
  '}\n\n' +
  '@Service("paypalGateway")\n' +
  'class PayPalGateway implements PaymentGatewayService {\n' +
  '    @Override public String charge(double amount) { return "PayPal: charged " + amount; }\n' +
  '}\n\n' +
  '@Service\n' +
  'class CheckoutService {\n' +
  '    private final PaymentGatewayService defaultGateway;   // gets StripeGateway (@Primary)\n' +
  '    private final PaymentGatewayService paypalGateway;    // explicit qualifier\n\n' +
  '    @Autowired\n' +
  '    public CheckoutService(\n' +
  '            PaymentGatewayService defaultGateway,\n' +
  '            @Qualifier("paypalGateway") PaymentGatewayService paypalGateway) {\n' +
  '        this.defaultGateway = defaultGateway;\n' +
  '        this.paypalGateway = paypalGateway;\n' +
  '    }\n\n' +
  '    public String checkout(String method, double amount) {\n' +
  '        return "paypal".equals(method)\n' +
  '            ? paypalGateway.charge(amount)\n' +
  '            : defaultGateway.charge(amount);\n' +
  '    }\n' +
  '}';

const advancedOutput =
  'KafkaTopicInitializer: ensuring topics exist...\n' +
  'KafkaTopicInitializer: topics ready\n' +
  'OrderEventConsumer: subscribing to order-events topic\n' +
  '--- CheckoutService usage ---\n' +
  'Stripe: charged 99.99\n' +
  'PayPal: charged 49.5\n' +
  '--- Scope mismatch fix ---\n' +
  'FIXED (ObjectFactory) requestId: 3a7f-... (new UUID each call)\n' +
  'FIXED (ObjectFactory) requestId: 9c2b-... (different UUID)\n' +
  '--- Circular resolved via EventBus ---\n' +
  'EVENT: order.placed:ORD-001';

// ─── DIAGRAM ──────────────────────────────────────────────────────────────────
const diagramSection = {
  type: 'diagram',
  title: 'Spring Bean Lifecycle — 12 phases with decision points',
  content:
    'Spring Bean Lifecycle (singleton scope)\n\n' +
    '   BeanDefinition loaded\n' +
    '          |\n' +
    '   BeanFactoryPostProcessor.postProcessBeanFactory()\n' +
    '          |  (modifies definitions — ${placeholder} resolution happens here)\n' +
    '   Constructor called\n' +
    '          |\n' +
    '   Property injection (@Autowired fields, @Value, setters)\n' +
    '          |\n' +
    '   BeanNameAware.setBeanName()\n' +
    '   BeanFactoryAware / ApplicationContextAware.setApplicationContext()\n' +
    '          |\n' +
    '   BeanPostProcessor.postProcessBeforeInitialization()  <── @PostConstruct processed here\n' +
    '          |\n' +
    '   InitializingBean.afterPropertiesSet()\n' +
    '          |\n' +
    '   @Bean(initMethod="...")\n' +
    '          |\n' +
    '   BeanPostProcessor.postProcessAfterInitialization()   <── AOP proxy / @Transactional created\n' +
    '          |\n' +
    '   SmartInitializingSingleton.afterSingletonsInstantiated()  (runs ONCE, after ALL singletons)\n' +
    '          |\n' +
    '   ===== BEAN IN USE =====\n' +
    '          |\n' +
    '   context.close() / JVM shutdown\n' +
    '          |\n' +
    '   @PreDestroy\n' +
    '   DisposableBean.destroy()\n' +
    '   @Bean(destroyMethod="...")\n\n' +
    'Scope differences:\n' +
    '  singleton: created once, cached, destroyed on context close\n' +
    '  prototype: new instance per getBean()/injection, destruction NOT managed by container\n' +
    '  request/session: needs scoped proxy when injected into singleton\n\n' +
    'Key disambiguation:\n' +
    '  BeanFactoryPostProcessor  → modifies BeanDefinitions (pre-instantiation)\n' +
    '  BeanPostProcessor         → wraps/replaces bean instances (per-bean, post-instantiation)\n' +
    '  @DependsOn                → ordering only, no injection\n' +
    '  @Lazy                     → defers singleton creation; breaks circular dep cycles'
};

// ─── PITFALLS ─────────────────────────────────────────────────────────────────
const pitfalls = [
  {
    id: 'p1',
    title: '@PostConstruct runs before injection — impossible, but the myth persists',
    severity: 'high',
    symptom: 'NullPointerException inside @PostConstruct on an @Autowired field',
    cause: 'Developer assumes @PostConstruct fires right after the constructor, before Spring injects fields. In reality, @PostConstruct fires AFTER all injection is complete. If you see NPE inside @PostConstruct, the field was never injected — check for a missing @Autowired, a spelling mismatch, or a missing @ComponentScan.',
    fix: 'Verify the field has @Autowired and the dependency bean is in the application context. Add a breakpoint or log at the top of @PostConstruct to confirm which fields are null.',
    detection: 'Enable DEBUG logging for org.springframework.beans.factory.annotation.AutowiredAnnotationBeanPostProcessor'
  },
  {
    id: 'p2',
    title: 'Prototype bean in singleton — scope mismatch silent bug',
    severity: 'high',
    symptom: 'Prototype-scoped bean behaves like a singleton — same instance returned every time, per-request state is shared across requests',
    cause: 'Spring injects the prototype instance once when the singleton is created. No new instances are created on subsequent calls. The prototype scope is effectively bypassed.',
    fix: 'Inject ObjectFactory<T> or Provider<T> instead of the prototype bean directly. Or use @Scope(proxyMode = ScopedProxyMode.TARGET_CLASS) on the prototype bean.',
    detection: 'In a test, call processOrder() twice and verify the requestId changes between calls. If it stays the same, scope mismatch is confirmed.'
  },
  {
    id: 'p3',
    title: 'BeanPostProcessor itself is not transactional',
    severity: 'high',
    symptom: '@Transactional methods on a BeanPostProcessor do not start transactions — database changes are committed or rolled back incorrectly',
    cause: 'BeanPostProcessors are instantiated very early in the container lifecycle, before the AOP infrastructure that applies @Transactional proxies is set up. The BPP is a raw bean, never proxied.',
    fix: 'Do not use @Transactional inside a BeanPostProcessor. Move transactional logic to a regular service bean that the BPP delegates to.',
    detection: 'Spring logs a WARN: "Bean X of type BeanPostProcessor is not eligible for getting processed by all BeanPostProcessors"'
  },
  {
    id: 'p4',
    title: 'Constructor circular dependency — BeanCurrentlyInCreationException at startup',
    severity: 'high',
    symptom: 'Application fails to start with: Error creating bean with name \'X\': Requested bean is currently in creation',
    cause: 'Bean A needs Bean B in its constructor, Bean B needs Bean A in its constructor. Spring cannot create either without the other already existing.',
    fix: 'Option 1: Extract a shared dependency (EventBus, Registry) that both A and B depend on — eliminates the cycle structurally. Option 2: Add @Lazy to one constructor parameter as a temporary fix. Option 3: Switch one dependency to setter injection (Spring 6 requires spring.main.allow-circular-references=true).',
    detection: 'Spring 6 throws by default. Spring 5 with field injection silently resolved cycles — use spring.main.allow-circular-references=false to detect hidden cycles during development.'
  },
  {
    id: 'p5',
    title: 'Prototype destruction not called — resource leak',
    severity: 'medium',
    symptom: '@PreDestroy / DisposableBean.destroy() never fires for prototype beans. Connections, threads, or file handles leak.',
    cause: 'The Spring container does not call destroy callbacks on prototype beans. After handing the bean to the caller, the container releases its reference.',
    fix: 'Either (1) make the bean singleton and manage state differently, (2) track all prototype instances in a registry and destroy them in a scheduled job or context close event, (3) use ObjectFactory so the caller explicitly controls lifecycle.',
    detection: 'Add a logging statement in @PreDestroy and run a load test. If the message never appears for prototype beans, you have confirmed the leak.'
  },
  {
    id: 'p6',
    title: '@Primary on the wrong profile bean — prod routes to stub',
    severity: 'high',
    symptom: 'Payments processed against a stub/mock gateway in production — no exception thrown, but no real transactions occur',
    cause: '@Primary was added to a test double bean that is not profile-guarded. Production profile loads both the real bean and the test double, and @Primary silently makes the stub the default.',
    fix: 'Always guard test doubles with @Profile("test") or @ConditionalOnProperty. Use @Qualifier at injection points for payment-critical beans — never rely on @Primary alone for financial flows.',
    detection: 'Log the class name of the injected PaymentGateway at startup: logger.info("Active gateway: {}", gateway.getClass().getName()). Alert if it matches the stub class name.'
  },
  {
    id: 'p7',
    title: 'Slow @PostConstruct delays Kubernetes readiness probe',
    severity: 'medium',
    symptom: 'Pod is killed by Kubernetes (OOMKilled or liveness failure) before the application finishes starting — even though the app is healthy',
    cause: '@PostConstruct runs synchronously during startup. If it takes 10+ seconds (data preload, schema validation, external API ping), the pod does not serve health checks during that window. Kubernetes interprets the unresponsive pod as unhealthy.',
    fix: 'Move slow initialization to a background thread started in @PostConstruct. Expose a readiness indicator (implements ReadinessIndicator or custom HealthIndicator) that returns OUT_OF_SERVICE until background init completes.',
    detection: 'Add timing logs in @PostConstruct. If elapsed > 5 seconds in a cloud deploy, move to async startup.'
  },
  {
    id: 'p8',
    title: 'getBean("factory") vs getBean("&factory") confusion',
    severity: 'low',
    symptom: 'Trying to introspect or replace the FactoryBean itself, but getBean() returns the product T, not the FactoryBean',
    cause: 'By design: context.getBean("httpClient") returns the HttpClient product. The FactoryBean is an indirection layer. To get the FactoryBean, you must prefix the name with "&".',
    fix: 'Use context.getBean("&httpClient", HttpClientFactory.class) to retrieve the FactoryBean. This is documented but easily forgotten under pressure.',
    detection: 'instanceof check: if the returned object is not a FactoryBean, you are missing the "&" prefix.'
  }
];

// ─── EXERCISE ──────────────────────────────────────────────────────────────────
const exerciseSection = {
  type: 'exercise',
  title: 'Hands-on: Debug a scope mismatch and verify lifecycle order',
  tasks: [
    'Create a @Prototype-scoped SessionCartService (holds a List<String> of items) and inject it into a singleton CheckoutController. Call addItem() twice on different "requests" and verify both calls see the same cart (bug).',
    'Fix the bug using ObjectFactory<SessionCartService>. Verify each call to getObject() returns a new instance with an empty cart.',
    'Add @PostConstruct to SessionCartService that prints its instance hashCode. Run the fixed version and verify the hashCode is different on each getObject() call.',
    'Create a BeanPostProcessor that logs "INIT: [beanName]" for every bean. Register it and run the app — observe which beans are created and in what order.',
    'Introduce a circular dependency: ServiceA needs ServiceB and ServiceB needs ServiceA via constructor injection. Observe the BeanCurrentlyInCreationException. Resolve it by extracting a SharedState bean that both depend on.'
  ]
};

// ─── CONCEPTUAL Q&As ──────────────────────────────────────────────────────────
const conceptualQAs = [
  {
    id: 'c1',
    question: 'What are the key phases of the Spring bean lifecycle in the correct order?',
    answer: 'BeanFactoryPostProcessor modifies definitions first. Then: constructor → property injection → Aware callbacks (BeanNameAware, ApplicationContextAware) → BeanPostProcessor.postProcessBeforeInitialization (where @PostConstruct fires) → InitializingBean.afterPropertiesSet() → custom initMethod → BeanPostProcessor.postProcessAfterInitialization (where AOP proxies are created) → SmartInitializingSingleton.afterSingletonsInstantiated() → bean in use → on context close: @PreDestroy → DisposableBean.destroy() → custom destroyMethod.',
    difficulty: 'medium',
    tags: ['lifecycle', 'Spring', 'interview-classic']
  },
  {
    id: 'c2',
    question: 'What is the difference between BeanFactoryPostProcessor and BeanPostProcessor?',
    answer: 'BeanFactoryPostProcessor runs after bean definitions are loaded but before any bean is instantiated. It receives the bean factory and modifies BeanDefinition objects — changing property values, scopes, or class names. PropertySourcesPlaceholderConfigurer is an example. BeanPostProcessor runs for each individual bean after it is constructed and injected, once before initialization callbacks and once after. It can wrap or replace the bean instance — CGLIB proxy creation for @Transactional is done by a BeanPostProcessor. One sentence: BeanFactoryPostProcessor edits definitions; BeanPostProcessor edits instances.',
    difficulty: 'hard',
    tags: ['BeanPostProcessor', 'BeanFactoryPostProcessor', 'lifecycle']
  },
  {
    id: 'c3',
    question: 'In what order do @PostConstruct, afterPropertiesSet(), and a custom initMethod fire?',
    answer: '@PostConstruct fires first — it is processed by CommonAnnotationBeanPostProcessor in the postProcessBeforeInitialization phase. InitializingBean.afterPropertiesSet() fires second. The custom initMethod declared via @Bean(initMethod="...") fires third. All three fire after property injection is complete, so all @Autowired fields are populated. For new code, use only @PostConstruct. Use initMethod for third-party classes you cannot annotate.',
    difficulty: 'medium',
    tags: ['PostConstruct', 'afterPropertiesSet', 'initMethod', 'order']
  },
  {
    id: 'c4',
    question: 'Why does Spring not call @PreDestroy on prototype beans?',
    answer: 'After creating a prototype instance and handing it to the caller, the container releases its reference to that instance. It no longer tracks prototype beans after handoff. Without a reference, it cannot call destroy callbacks. This is by design — the caller owns the prototype bean\'s lifecycle after injection. If the bean holds resources (connections, threads), the caller is responsible for cleanup, or you must track prototype instances yourself in a registry and destroy them explicitly.',
    difficulty: 'medium',
    tags: ['prototype', 'PreDestroy', 'lifecycle', 'resource-leak']
  },
  {
    id: 'c5',
    question: 'What is the purpose of Aware interfaces and which three are most commonly used?',
    answer: 'Aware interfaces allow a bean to receive framework infrastructure from the container during initialization, before @PostConstruct fires. The container detects which Aware interfaces a bean implements and calls the corresponding setter. Most commonly used: BeanNameAware (receive the bean\'s registration name), ApplicationContextAware (receive the ApplicationContext for programmatic bean lookups or event publishing), and EnvironmentAware (receive the Environment for reading properties). Since Spring 4.3, you can also just @Autowire ApplicationContext directly.',
    difficulty: 'medium',
    tags: ['Aware', 'BeanNameAware', 'ApplicationContextAware']
  },
  {
    id: 'c6',
    question: 'How does BeanPostProcessor enable AOP and @Transactional?',
    answer: 'AbstractAutoProxyCreator (a BeanPostProcessor) runs in the postProcessAfterInitialization phase. It inspects every bean for AOP pointcuts (method annotations like @Transactional, @Async, @Cacheable, or custom aspects). If a match is found, it creates a CGLIB subclass proxy that wraps the original bean. All subsequent @Autowired injections receive the proxy, not the original. This is why self-invocation (this.method()) bypasses @Transactional — the call goes to the original object, not through the proxy.',
    difficulty: 'hard',
    tags: ['BPP', 'AOP', 'Transactional', 'CGLIB', 'proxy']
  },
  {
    id: 'c7',
    question: 'What is SmartInitializingSingleton and how does it differ from ApplicationListener<ContextRefreshedEvent>?',
    answer: 'SmartInitializingSingleton.afterSingletonsInstantiated() fires exactly once, after all singleton beans have completed the full initialization lifecycle including BPP-after proxy creation. It is the safe place to validate the full application context. ApplicationListener<ContextRefreshedEvent> fires every time the context is refreshed — once for the root context and again for the DispatcherServlet child context in a Spring MVC app, which can cause duplicate startup logic. Use SmartInitializingSingleton for startup validation that should run exactly once.',
    difficulty: 'hard',
    tags: ['SmartInitializingSingleton', 'ContextRefreshedEvent', 'startup']
  },
  {
    id: 'c8',
    question: 'What does @DependsOn do, and when should you use it?',
    answer: '@DependsOn adds a directed initialization-order edge without creating an injection relationship. The container initializes the named beans before the annotated bean, even if there is no @Autowired field between them. Classic use: a KafkaTopicInitializer must run before a KafkaConsumer, but the consumer does not inject the initializer. @DependsOn("kafkaTopicInitializer") on the consumer ensures order. Important: it does not inject, does not guarantee the dependency succeeded without exceptions, and does not handle async side effects — for those, use an ApplicationEvent or CountDownLatch.',
    difficulty: 'medium',
    tags: ['DependsOn', 'ordering', 'side-effects']
  },
  {
    id: 'c9',
    question: 'When do you use @Primary vs @Qualifier for bean disambiguation?',
    answer: '@Primary marks one bean as the default for all unqualified injection points of that type — like a global default. Use it when one implementation dominates (e.g., the real impl vs a test double that should only be active in test profiles). @Qualifier("name") creates an explicit named binding at a specific injection point — use it when two real implementations coexist in the same profile and you need precise control. @Qualifier always overrides @Primary at a given injection point. For payment or critical-path beans, prefer @Qualifier over @Primary to make the choice explicit and reviewable.',
    difficulty: 'easy',
    tags: ['Primary', 'Qualifier', 'disambiguation']
  },
  {
    id: 'c10',
    question: 'Explain the scope mismatch problem and three ways to fix it.',
    answer: 'Scope mismatch: a prototype bean is @Autowired into a singleton. Spring injects one prototype instance at singleton creation time and never creates another. Every call through the singleton sees the same "prototype" instance — defeating the purpose of prototype scope. Fix 1: inject ObjectFactory<PrototypeBean> and call getObject() each time — creates a fresh instance on demand. Fix 2: use javax.inject.Provider<PrototypeBean> for JSR-330 portability. Fix 3: annotate the prototype with @Scope(proxyMode=ScopedProxyMode.TARGET_CLASS) — Spring injects a CGLIB proxy; each method call on the proxy creates a new prototype. Option 3 is transparent to the caller but the prototype class cannot be final.',
    difficulty: 'hard',
    tags: ['prototype', 'singleton', 'scope-mismatch', 'ObjectFactory', 'Provider']
  },
  {
    id: 'c11',
    question: 'What happens when Spring encounters a circular dependency with constructor injection?',
    answer: 'Spring throws BeanCurrentlyInCreationException at startup. When constructing Bean A, Spring adds it to a "currently in creation" set, then tries to construct Bean B (needed as a constructor arg), which also needs A. Finding A in the "in creation" set, Spring fails immediately. This is the correct behavior — fail fast, fail loud. The resolution options are: (1) extract a third bean that breaks the cycle structurally, (2) add @Lazy to one parameter (CGLIB proxy breaks the cycle), (3) switch to setter injection and enable allow-circular-references=true in Spring 6. Prefer option 1 — circular deps indicate a missing abstraction.',
    difficulty: 'hard',
    tags: ['circular', 'constructor-injection', 'BeanCurrentlyInCreationException']
  },
  {
    id: 'c12',
    question: 'What is a FactoryBean and how do you retrieve the FactoryBean itself vs its product?',
    answer: 'FactoryBean<T> is a Spring SPI interface. You implement getObject() (returns T), getObjectType() (returns T.class), and isSingleton(). Register the FactoryBean as a Spring bean — when something @Autowires type T, Spring calls getObject(). To get the product: context.getBean("myFactory") or @Autowire T directly. To get the FactoryBean itself: context.getBean("&myFactory") — the ampersand prefix is the dereference operator for FactoryBeans. Common in library code: MyBatis SqlSessionFactoryBean, ProxyFactoryBean, LocalContainerEntityManagerFactoryBean.',
    difficulty: 'medium',
    tags: ['FactoryBean', 'getObject', 'ampersand']
  },
  {
    id: 'c13',
    question: 'What is the difference between @Lazy on a @Component vs @Lazy on an @Autowired field?',
    answer: '@Lazy on @Component or @Bean: the bean itself is not instantiated at startup. It is created lazily on the first getBean() call or first @Autowired injection. Useful for optional/expensive beans that may never be used. @Lazy on @Autowired: a CGLIB proxy for that type is injected immediately, but the real bean is only resolved when a method is first called on the proxy. Used to break circular dependencies — the proxy satisfies the injection without requiring the real bean to exist yet. The two behaviors are related but distinct: @Lazy on @Component controls creation timing; @Lazy on @Autowired controls injection resolution timing.',
    difficulty: 'hard',
    tags: ['Lazy', 'proxy', 'circular', 'startup']
  },
  {
    id: 'c14',
    question: 'What is BeanDefinition and what can you do with it in BeanFactoryPostProcessor?',
    answer: 'A BeanDefinition is the metadata object that describes how to create a bean: class name, scope, constructor arguments, property values, init/destroy method names, and whether the bean is lazy. BeanFactoryPostProcessor receives the ConfigurableListableBeanFactory and can call getBeanDefinition("name") to retrieve and modify any BeanDefinition before beans are instantiated. You can override property values (PropertySourcesPlaceholderConfigurer), change scope, add constructor args, or even register new BeanDefinitions programmatically via BeanDefinitionRegistryPostProcessor.',
    difficulty: 'hard',
    tags: ['BeanDefinition', 'BeanFactoryPostProcessor', 'metadata']
  },
  {
    id: 'c15',
    question: 'How does constructor injection improve testability compared to field injection?',
    answer: 'Constructor injection requires all dependencies to be provided at object creation time, which means they can be passed directly in a unit test without a Spring context: new OrderService(mockPaymentGateway, mockEmailSender). The test is fast, explicit, and does not use reflection. Field injection (@Autowired on private fields) requires either a Spring test context or reflection-based mocking (Mockito @InjectMocks). The dependency list is hidden — you cannot know what a bean needs without reading its fields. Constructor injection also makes circular dependencies a compile-time visibility concern (you see them immediately from the constructor signature) rather than a runtime surprise.',
    difficulty: 'medium',
    tags: ['constructor-injection', 'field-injection', 'testability']
  },
  {
    id: 'c16',
    question: 'What is @Conditional and how does it differ from @Profile?',
    answer: '@Profile("name") is syntactic sugar for @Conditional(ProfileCondition.class) — it activates a bean only when a named profile is active. @Conditional accepts a custom Condition implementation with a matches(context, metadata) method, giving you arbitrary logic: check a property value, check if a class is on the classpath, check an operating system, check another bean\'s state. @ConditionalOnProperty, @ConditionalOnClass, @ConditionalOnMissingBean (Spring Boot autoconfigure) are all built on @Conditional. Use @Profile for environment switching; use @Conditional for feature flags, optional integrations, and autoconfigure.',
    difficulty: 'medium',
    tags: ['Conditional', 'Profile', 'autoconfigure']
  },
  {
    id: 'c17',
    question: 'What is the role of ApplicationContext.close() and what happens to beans?',
    answer: 'Calling close() on a ConfigurableApplicationContext triggers the context shutdown sequence. It publishes a ContextClosedEvent, then calls the destroy phase on all singleton beans in reverse creation order: @PreDestroy first, then DisposableBean.destroy(), then custom destroyMethod. Registered JVM shutdown hooks (registerShutdownHook()) call close() automatically when the JVM exits normally — useful for ensuring cleanup in standalone apps. Prototype beans are NOT destroyed. In Spring Boot, the SpringApplication registers a shutdown hook automatically. In tests, @SpringBootTest with @DirtiesContext closes the context after the test class.',
    difficulty: 'medium',
    tags: ['close', 'shutdown', 'PreDestroy', 'ShutdownHook']
  }
];

// ─── CODE-BASED Q&As ──────────────────────────────────────────────────────────
const codeBasedQAs = [
  {
    id: 'cb1',
    question: 'Write a BeanPostProcessor that wraps every @Service bean in a timing proxy that logs method execution time.',
    answer:
      '@Component\n' +
      'public class TimingBeanPostProcessor implements BeanPostProcessor {\n' +
      '    @Override\n' +
      '    public Object postProcessAfterInitialization(Object bean, String beanName) {\n' +
      '        if (!bean.getClass().isAnnotationPresent(Service.class)) return bean;\n' +
      '        return Proxy.newProxyInstance(\n' +
      '            bean.getClass().getClassLoader(),\n' +
      '            bean.getClass().getInterfaces(),\n' +
      '            (proxy, method, args) -> {\n' +
      '                long start = System.nanoTime();\n' +
      '                try { return method.invoke(bean, args); }\n' +
      '                finally {\n' +
      '                    long ms = (System.nanoTime() - start) / 1_000_000;\n' +
      '                    System.out.printf("%s.%s took %dms%n", beanName, method.getName(), ms);\n' +
      '                }\n' +
      '            });\n' +
      '    }\n' +
      '}\n' +
      '// Note: JDK proxy requires the bean to implement an interface.\n' +
      '// For concrete classes, use CGLIB (Spring AOP does this automatically).',
    difficulty: 'hard',
    tags: ['BeanPostProcessor', 'proxy', 'timing', 'JDK-proxy']
  },
  {
    id: 'cb2',
    question: 'Write a Spring bean with @PostConstruct and @PreDestroy that manages a thread pool. Show the lifecycle clearly.',
    answer:
      '@Component\n' +
      'public class TaskExecutorBean {\n' +
      '    private ExecutorService executor;\n' +
      '    private final int poolSize;\n\n' +
      '    public TaskExecutorBean(@Value("${pool.size:4}") int poolSize) {\n' +
      '        this.poolSize = poolSize;\n' +
      '        // executor not created yet — injection not complete\n' +
      '    }\n\n' +
      '    @PostConstruct\n' +
      '    public void init() {\n' +
      '        // Safe: all @Value fields are populated\n' +
      '        executor = Executors.newFixedThreadPool(poolSize);\n' +
      '        System.out.println("TaskExecutorBean: pool started with " + poolSize + " threads");\n' +
      '    }\n\n' +
      '    public Future<String> submit(Callable<String> task) {\n' +
      '        return executor.submit(task);\n' +
      '    }\n\n' +
      '    @PreDestroy\n' +
      '    public void shutdown() {\n' +
      '        executor.shutdown();\n' +
      '        try {\n' +
      '            if (!executor.awaitTermination(5, TimeUnit.SECONDS))\n' +
      '                executor.shutdownNow();\n' +
      '        } catch (InterruptedException e) {\n' +
      '            executor.shutdownNow();\n' +
      '            Thread.currentThread().interrupt();\n' +
      '        }\n' +
      '        System.out.println("TaskExecutorBean: pool shut down cleanly");\n' +
      '    }\n' +
      '}',
    difficulty: 'medium',
    tags: ['PostConstruct', 'PreDestroy', 'thread-pool', 'resource-cleanup']
  },
  {
    id: 'cb3',
    question: 'Demonstrate the scope mismatch bug and fix it with ObjectFactory. Show both the buggy and correct version.',
    answer:
      '@Component @Scope("prototype")\n' +
      'public class UserSession {\n' +
      '    private final String sessionId = UUID.randomUUID().toString();\n' +
      '    public String getSessionId() { return sessionId; }\n' +
      '}\n\n' +
      '// BUG: same UserSession injected every time\n' +
      '@Service public class UserServiceBuggy {\n' +
      '    @Autowired private UserSession session; // one instance at startup\n' +
      '    public String currentSession() { return session.getSessionId(); } // always same ID\n' +
      '}\n\n' +
      '// FIX: ObjectFactory creates new instance per call\n' +
      '@Service public class UserServiceFixed {\n' +
      '    @Autowired private ObjectFactory<UserSession> sessionFactory;\n' +
      '    public String currentSession() {\n' +
      '        return sessionFactory.getObject().getSessionId(); // new UUID each call\n' +
      '    }\n' +
      '}\n\n' +
      '// Verify in a @SpringBootTest:\n' +
      '// String s1 = userServiceFixed.currentSession();\n' +
      '// String s2 = userServiceFixed.currentSession();\n' +
      '// assertNotEquals(s1, s2); // passes with fix, fails with bug',
    difficulty: 'medium',
    tags: ['prototype', 'scope-mismatch', 'ObjectFactory', 'bug-fix']
  },
  {
    id: 'cb4',
    question: 'Write a @Conditional bean that registers only when a property "feature.kafka.enabled=true" is set.',
    answer:
      '// Option 1: @ConditionalOnProperty (Spring Boot)\n' +
      '@Service\n' +
      '@ConditionalOnProperty(name = "feature.kafka.enabled", havingValue = "true")\n' +
      'public class KafkaMessageProducer {\n' +
      '    @PostConstruct\n' +
      '    public void init() { System.out.println("KafkaMessageProducer: Kafka enabled, producer ready"); }\n' +
      '    public void send(String topic, String message) { /* ... */ }\n' +
      '}\n\n' +
      '// Option 2: Custom @Conditional (works without Spring Boot)\n' +
      'public class KafkaEnabledCondition implements Condition {\n' +
      '    @Override\n' +
      '    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {\n' +
      '        return "true".equals(context.getEnvironment().getProperty("feature.kafka.enabled"));\n' +
      '    }\n' +
      '}\n\n' +
      '@Service\n' +
      '@Conditional(KafkaEnabledCondition.class)\n' +
      'public class KafkaMessageProducerCustom { /* same implementation */ }\n\n' +
      '// In application.properties:\n' +
      '// feature.kafka.enabled=true   -> bean registered\n' +
      '// feature.kafka.enabled=false  -> bean NOT registered (no NPE — use Optional<T> at injection points)',
    difficulty: 'medium',
    tags: ['Conditional', 'ConditionalOnProperty', 'feature-flag']
  },
  {
    id: 'cb5',
    question: 'Write a FactoryBean that creates a configured RestTemplate with base URL and timeouts.',
    answer:
      '@Component("restTemplate")\n' +
      'public class RestTemplateFactory implements FactoryBean<RestTemplate> {\n\n' +
      '    @Value("${api.baseUrl:http://localhost:8080}")\n' +
      '    private String baseUrl;\n\n' +
      '    @Value("${api.timeoutMs:3000}")\n' +
      '    private int timeoutMs;\n\n' +
      '    @Override\n' +
      '    public RestTemplate getObject() {\n' +
      '        HttpComponentsClientHttpRequestFactory factory = new HttpComponentsClientHttpRequestFactory();\n' +
      '        factory.setConnectTimeout(timeoutMs);\n' +
      '        factory.setReadTimeout(timeoutMs);\n' +
      '        RestTemplate rt = new RestTemplate(factory);\n' +
      '        rt.setUriTemplateHandler(new DefaultUriBuilderFactory(baseUrl));\n' +
      '        return rt;\n' +
      '    }\n\n' +
      '    @Override public Class<?> getObjectType() { return RestTemplate.class; }\n' +
      '    @Override public boolean isSingleton() { return true; }\n' +
      '}\n\n' +
      '// Usage:\n' +
      '// @Autowired RestTemplate restTemplate; // gets the product\n' +
      '// @Autowired RestTemplateFactory factory; // gets the FactoryBean\n' +
      '// context.getBean("&restTemplate") // also gets the FactoryBean',
    difficulty: 'medium',
    tags: ['FactoryBean', 'RestTemplate', 'configuration']
  },
  {
    id: 'cb6',
    question: 'Write a BeanFactoryPostProcessor that overrides a database URL property in all DataSource bean definitions.',
    answer:
      '@Component\n' +
      'public class DataSourceOverridePostProcessor implements BeanFactoryPostProcessor {\n\n' +
      '    @Override\n' +
      '    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) {\n' +
      '        String[] beanNames = beanFactory.getBeanNamesForType(DataSource.class, true, false);\n' +
      '        for (String name : beanNames) {\n' +
      '            BeanDefinition bd = beanFactory.getBeanDefinition(name);\n' +
      '            MutablePropertyValues props = bd.getPropertyValues();\n' +
      '            if (props.contains("url")) {\n' +
      '                String original = (String) props.get("url");\n' +
      '                props.add("url", original + "?socketTimeout=30000&connectTimeout=5000");\n' +
      '                System.out.println("BFPP: appended timeout params to DataSource \'" + name + "\'");\n' +
      '            }\n' +
      '        }\n' +
      '    }\n' +
      '}\n' +
      '// Key point: this modifies BeanDefinitions before ANY bean is instantiated.\n' +
      '// The DataSource beans do not exist yet when postProcessBeanFactory runs.',
    difficulty: 'hard',
    tags: ['BeanFactoryPostProcessor', 'BeanDefinition', 'DataSource', 'property-override']
  },
  {
    id: 'cb7',
    question: 'Show how to use @DependsOn to ensure a LiquibaseRunner bean executes before any Repository bean starts.',
    answer:
      '@Component("liquibaseRunner")\n' +
      'public class LiquibaseRunner {\n' +
      '    @PostConstruct\n' +
      '    public void migrate() {\n' +
      '        System.out.println("LiquibaseRunner: running migrations...");\n' +
      '        // liquibase.update("") equivalent\n' +
      '        System.out.println("LiquibaseRunner: schema up to date");\n' +
      '    }\n' +
      '}\n\n' +
      '@Repository\n' +
      '@DependsOn("liquibaseRunner")  // schema must exist before queries run\n' +
      'public class OrderRepository {\n' +
      '    @PostConstruct\n' +
      '    public void init() {\n' +
      '        System.out.println("OrderRepository: connecting to database (schema ready)");\n' +
      '    }\n' +
      '}\n\n' +
      '// Alternative: register multiple dependents at once\n' +
      '@Repository\n' +
      '@DependsOn({"liquibaseRunner", "cacheWarmer"})\n' +
      'public class ProductRepository { /* ... */ }\n\n' +
      '// In Spring Boot: LiquibaseAutoConfiguration handles this automatically.\n' +
      '// Manual @DependsOn is for custom infrastructure beans or non-Boot projects.',
    difficulty: 'medium',
    tags: ['DependsOn', 'Liquibase', 'ordering', 'repository']
  },
  {
    id: 'cb8',
    question: 'Write a SmartInitializingSingleton that validates all @EventListener methods have matching event classes on the classpath.',
    answer:
      '@Component\n' +
      'public class EventListenerValidator implements SmartInitializingSingleton {\n\n' +
      '    @Autowired\n' +
      '    private ApplicationContext ctx;\n\n' +
      '    @Override\n' +
      '    public void afterSingletonsInstantiated() {\n' +
      '        List<String> problems = new ArrayList<>();\n' +
      '        for (String beanName : ctx.getBeanDefinitionNames()) {\n' +
      '            Object bean = ctx.getBean(beanName);\n' +
      '            for (Method m : bean.getClass().getDeclaredMethods()) {\n' +
      '                if (!m.isAnnotationPresent(EventListener.class)) continue;\n' +
      '                Class<?>[] params = m.getParameterTypes();\n' +
      '                if (params.length == 0) continue;\n' +
      '                // Verify the event class is a subtype of ApplicationEvent or a generic payload\n' +
      '                Class<?> eventType = params[0];\n' +
      '                if (!ApplicationEvent.class.isAssignableFrom(eventType)\n' +
      '                        && !eventType.isAnnotationPresent(Component.class)) {\n' +
      '                    problems.add(beanName + "." + m.getName() + " listens for " + eventType.getSimpleName());\n' +
      '                }\n' +
      '            }\n' +
      '        }\n' +
      '        if (!problems.isEmpty()) {\n' +
      '            System.out.println("WARN EventListenerValidator: unusual event types: " + problems);\n' +
      '        } else {\n' +
      '            System.out.println("EventListenerValidator: all @EventListener signatures OK");\n' +
      '        }\n' +
      '    }\n' +
      '}',
    difficulty: 'hard',
    tags: ['SmartInitializingSingleton', 'EventListener', 'startup-validation', 'reflection']
  },
  {
    id: 'cb9',
    question: 'Write a @Configuration class that registers two PaymentService implementations with clear qualifier names, and a service that uses both.',
    answer:
      'public interface PaymentService { String process(String orderId, double amount); }\n\n' +
      '@Configuration\n' +
      'public class PaymentConfig {\n\n' +
      '    @Bean("stripePayment")\n' +
      '    @Primary  // default for unqualified injection\n' +
      '    public PaymentService stripe() {\n' +
      '        return (orderId, amount) -> "Stripe processed " + orderId + " for $" + amount;\n' +
      '    }\n\n' +
      '    @Bean("paypalPayment")\n' +
      '    public PaymentService paypal() {\n' +
      '        return (orderId, amount) -> "PayPal processed " + orderId + " for $" + amount;\n' +
      '    }\n' +
      '}\n\n' +
      '@Service\n' +
      'public class OrderProcessor {\n\n' +
      '    private final PaymentService defaultPayment;   // gets stripePayment (@Primary)\n' +
      '    private final PaymentService paypalPayment;    // explicit qualifier\n\n' +
      '    @Autowired\n' +
      '    public OrderProcessor(\n' +
      '            PaymentService defaultPayment,\n' +
      '            @Qualifier("paypalPayment") PaymentService paypalPayment) {\n' +
      '        this.defaultPayment = defaultPayment;\n' +
      '        this.paypalPayment = paypalPayment;\n' +
      '    }\n\n' +
      '    public String pay(String method, String orderId, double amount) {\n' +
      '        return "paypal".equalsIgnoreCase(method)\n' +
      '            ? paypalPayment.process(orderId, amount)\n' +
      '            : defaultPayment.process(orderId, amount);\n' +
      '    }\n' +
      '}',
    difficulty: 'medium',
    tags: ['Qualifier', 'Primary', 'configuration', 'multiple-implementations']
  },
  {
    id: 'cb10',
    question: 'Write a @Lazy-injected heavy dependency that defers its expensive initialization until first use.',
    answer:
      '@Service\n' +
      'public class ReportGeneratorService {\n\n' +
      '    @PostConstruct\n' +
      '    public void init() {\n' +
      '        // Simulate expensive initialization: loading templates, warming caches\n' +
      '        System.out.println("ReportGeneratorService: loading 500MB report templates...");\n' +
      '        try { Thread.sleep(3000); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }\n' +
      '        System.out.println("ReportGeneratorService: ready");\n' +
      '    }\n\n' +
      '    public byte[] generate(String reportType) {\n' +
      '        return ("Report: " + reportType).getBytes();\n' +
      '    }\n' +
      '}\n\n' +
      '@Service\n' +
      'public class ApiController {\n\n' +
      '    @Autowired\n' +
      '    @Lazy  // proxy injected at startup; ReportGeneratorService.init() deferred until first call\n' +
      '    private ReportGeneratorService reportGenerator;\n\n' +
      '    public byte[] getReport(String type) {\n' +
      '        // First call here triggers ReportGeneratorService initialization\n' +
      '        return reportGenerator.generate(type);\n' +
      '    }\n\n' +
      '    public String healthCheck() {\n' +
      '        // Called by Kubernetes readiness probe — does NOT trigger report init\n' +
      '        return "OK";\n' +
      '    }\n' +
      '}\n' +
      '// Result: startup is fast, health checks pass immediately.\n' +
      '// ReportGeneratorService initializes on the first report request, not at startup.',
    difficulty: 'medium',
    tags: ['Lazy', 'startup-performance', 'readiness', 'deferred-init']
  },
  {
    id: 'cb11',
    question: 'Demonstrate how circular dependency via setter injection is resolved, and show the null-field risk if order is wrong.',
    answer:
      '// Circular via setter injection — Spring can handle this (Spring 5),\n' +
      '// but Spring 6 requires allow-circular-references=true\n' +
      '@Service\n' +
      'public class ServiceA {\n' +
      '    private ServiceB serviceB;\n\n' +
      '    @Autowired\n' +
      '    public void setServiceB(ServiceB serviceB) {\n' +
      '        this.serviceB = serviceB;\n' +
      '        System.out.println("ServiceA.setServiceB called");\n' +
      '    }\n\n' +
      '    public void doWork() {\n' +
      '        // Safe only after context is fully initialized\n' +
      '        // During circular resolution, serviceB might still be null here\n' +
      '        System.out.println("ServiceA.doWork, serviceB=" + serviceB);\n' +
      '    }\n' +
      '}\n\n' +
      '@Service\n' +
      'public class ServiceB {\n' +
      '    private ServiceA serviceA;\n\n' +
      '    @Autowired\n' +
      '    public void setServiceA(ServiceA serviceA) {\n' +
      '        this.serviceA = serviceA;\n' +
      '        System.out.println("ServiceB.setServiceA called");\n' +
      '    }\n\n' +
      '    public void respond() {\n' +
      '        System.out.println("ServiceB.respond, serviceA=" + serviceA);\n' +
      '    }\n' +
      '}\n\n' +
      '// Spring 6 (safer): add to application.properties:\n' +
      '// spring.main.allow-circular-references=true\n' +
      '// But the real fix: extract a shared mediator/event bus and eliminate the cycle.',
    difficulty: 'hard',
    tags: ['circular', 'setter-injection', 'Spring6', 'allow-circular-references']
  },
  {
    id: 'cb12',
    question: 'Write a test that verifies @PostConstruct fires and @PreDestroy fires on context close.',
    answer:
      '@SpringBootTest\n' +
      'class ConnectionPoolLifecycleTest {\n\n' +
      '    @Autowired\n' +
      '    private ApplicationContext ctx;\n\n' +
      '    @Autowired\n' +
      '    private ConnectionPool pool;\n\n' +
      '    @Test\n' +
      '    void postConstructShouldHaveRunByInjectionTime() {\n' +
      '        // @PostConstruct already ran before the test received the bean\n' +
      '        assertTrue(pool.isConnected(), "@PostConstruct should have set connected=true");\n' +
      '    }\n\n' +
      '    @Test\n' +
      '    @DirtiesContext  // closes context after this test, triggering @PreDestroy\n' +
      '    void preDestroyShouldReleaseResources() {\n' +
      '        assertTrue(pool.isConnected());\n' +
      '        // @DirtiesContext closes context after test\n' +
      '        // In a real test, assert side effects of preDestroy (e.g., a closed flag, a log message)\n' +
      '    }\n\n' +
      '    @Test\n' +
      '    void closingContextManuallyTriggersPreDestroy() {\n' +
      '        ConfigurableApplicationContext closeableCtx =\n' +
      '            new AnnotationConfigApplicationContext(TestConfig.class);\n' +
      '        ConnectionPool testPool = closeableCtx.getBean(ConnectionPool.class);\n' +
      '        assertTrue(testPool.isConnected());\n' +
      '        closeableCtx.close(); // triggers @PreDestroy\n' +
      '        assertFalse(testPool.isConnected(), "@PreDestroy should have set connected=false");\n' +
      '    }\n' +
      '}',
    difficulty: 'medium',
    tags: ['test', 'PostConstruct', 'PreDestroy', 'DirtiesContext', 'SpringBootTest']
  }
];

// ─── SENIOR SCENARIO Q&As ─────────────────────────────────────────────────────
const seniorScenarios = [
  {
    id: 's1',
    question: 'Your OrderService is singleton-scoped. It injects an EmailService that is @Scope("prototype"). After launch, all order confirmation emails show the same correlation ID. Diagnose and fix.',
    answer: 'This is a classic scope mismatch. The OrderService singleton is created once at startup. At that moment, Spring injects a single EmailService prototype instance and caches it on the OrderService field. Every subsequent call to OrderService.sendConfirmation() uses that same EmailService instance — the correlation ID was set once and never changes. Fix: change the EmailService injection to ObjectFactory<EmailService>. Call objectFactory.getObject() each time sendConfirmation() is called, getting a fresh EmailService with a new correlation ID. Alternatively use Provider<EmailService> for JSR-330 portability. As a third option, annotate EmailService with @Scope(value="prototype", proxyMode=ScopedProxyMode.TARGET_CLASS) — Spring injects a CGLIB proxy, and each method call on the proxy creates a fresh instance. Write a test: call sendConfirmation() twice and assert the two correlation IDs differ.',
    difficulty: 'hard',
    tags: ['prototype', 'scope-mismatch', 'singleton', 'ObjectFactory', 'incident']
  },
  {
    id: 's2',
    question: 'On Kubernetes, your Spring Boot app fails to start with BeanCurrentlyInCreationException between UserService and AuditService. Both use constructor injection. The cycle was introduced in a PR 30 minutes ago. What is your immediate diagnosis and fix?',
    answer: 'BeanCurrentlyInCreationException with constructor injection is a guaranteed startup failure — no workaround. Immediate steps: (1) Read the full exception message — Spring prints the exact cycle: "Error creating bean \'userService\': Requested bean is currently in creation: Is there an unresolvable circular reference?" with both bean names. (2) Check the PR diff — which new @Autowired constructor parameter created the cycle? (3) Short-term fix to unblock deployment: add @Lazy to one of the constructor parameters to inject a proxy instead of the real bean. This breaks the cycle and lets the app start. (4) Proper fix in follow-up PR: extract the logic that created the cycle into a third bean — an EventBus, AuditEventPublisher, or UserAuditFacade. (5) Add spring.main.allow-circular-references=false to application.properties to catch future circular deps at startup rather than in production.',
    difficulty: 'hard',
    tags: ['circular', 'constructor-injection', 'incident', 'K8s', 'BeanCurrentlyInCreationException']
  },
  {
    id: 's3',
    question: 'A @Transactional annotation on a method in your PaymentService is being ignored — changes are not rolled back on exception. You have verified the annotation is present. What are the three most likely causes?',
    answer: 'Three most likely causes, in order of frequency: (1) Self-invocation: the method annotated @Transactional is called from within the same class (this.method()). The call bypasses the CGLIB proxy, so no transaction starts. Fix: inject the service into itself (or extract to a helper bean) so the call goes through the proxy. (2) @Transactional on a non-public method: Spring\'s proxy-based AOP does not intercept private or package-private methods. The annotation is silently ignored. Fix: make the method public. (3) Wrong exception type: by default, @Transactional only rolls back on RuntimeException (unchecked). Checked exceptions do not trigger rollback. Fix: @Transactional(rollbackFor = Exception.class). Additional cause: the class is a BeanPostProcessor itself, which is never proxied. Use DEBUG logging on org.springframework.transaction to confirm whether a transaction boundary is created at all.',
    difficulty: 'hard',
    tags: ['Transactional', 'self-invocation', 'CGLIB', 'proxy', 'rollback']
  },
  {
    id: 's4',
    question: 'After upgrading from Spring Boot 2 to Spring Boot 3, several beans fail to start with "The dependencies of some of the beans in the application context form a cycle." These beans worked fine before. What changed and how do you address it?',
    answer: 'Spring Boot 3 (Spring Framework 6) changed the default behavior: circular dependencies via field or setter injection now throw an exception by default instead of being silently resolved. Previously Spring would create partially-initialized beans and inject fields in a second pass, silently resolving cycles. The new behavior exposes cycles that were always bugs — they just happened to work due to initialization order luck. Resolution path: (1) Add spring.main.allow-circular-references=true as a temporary flag to restore old behavior and unblock the team. (2) Identify each cycle from the error message. (3) For each cycle: either extract a shared dependency (preferred), use @Lazy on one parameter (acceptable with a comment), or restructure the event flow using ApplicationEventPublisher instead of direct injection. (4) Remove the allow-circular-references flag once all cycles are fixed — leave it removed permanently. (5) Add a ArchUnit test rule: noClasses().should().dependOnClassesThat() ... to prevent future cycles.',
    difficulty: 'hard',
    tags: ['Spring6', 'circular', 'migration', 'allow-circular-references', 'upgrade']
  },
  {
    id: 's5',
    question: 'Your service has a prototype-scoped bean with a @PreDestroy that closes a database connection. Under load testing you observe connection pool exhaustion. How do you diagnose this is a prototype lifecycle leak?',
    answer: 'Diagnosis steps: (1) Add a counter: increment a static AtomicInteger in the prototype bean\'s constructor, decrement it in @PreDestroy. Under load, the counter should stay near zero if @PreDestroy fires. If it only climbs, @PreDestroy is never called. (2) Confirm the bean is actually prototype: check @Scope("prototype") or scope="prototype" in XML. (3) Trace where the prototype is injected — if it is in a singleton field (not ObjectFactory), the singleton holds one instance from startup. No new instances are created; no leaks from new instances. The leak is that the one injected instance never goes through @PreDestroy (prototype beans are not destroyed by the container). (4) If prototype is correctly used via ObjectFactory, the prototype beans created on each call are never destroyed. Fix: the caller must explicitly destroy the bean, or use a bean post-processor to track all created instances, or use a scoped proxy with a custom scope that calls destroy when a request ends.',
    difficulty: 'hard',
    tags: ['prototype', 'PreDestroy', 'leak', 'connection-pool', 'diagnosis']
  },
  {
    id: 's6',
    question: 'You need to validate that every bean implementing an Auditable interface has a non-null @AuditCategory annotation at startup. Where do you put this check and why?',
    answer: 'Use SmartInitializingSingleton.afterSingletonsInstantiated(). Reasoning: @PostConstruct on individual beans cannot see other beans; it fires per-bean. ApplicationListener<ContextRefreshedEvent> can fire multiple times (once per context refresh, including child contexts). SmartInitializingSingleton fires exactly once, after all singletons are fully initialized and proxied — the exact moment when the complete bean graph is available. Implementation: @Component class AuditableValidator implements SmartInitializingSingleton. In afterSingletonsInstantiated(): ctx.getBeansOfType(Auditable.class).forEach((name, bean) -> { if (bean.getClass().getAnnotation(AuditCategory.class) == null) throw new IllegalStateException(name + " is Auditable but missing @AuditCategory"); }). This kills the startup (throws from afterSingletonsInstantiated) rather than letting a misconfigured bean reach production.',
    difficulty: 'hard',
    tags: ['SmartInitializingSingleton', 'startup-validation', 'annotation', 'Auditable']
  }
];

// ─── WRONG ANSWERS ────────────────────────────────────────────────────────────
const wrongAnswers = [
  {
    id: 'w1',
    wrong: '@PostConstruct runs right after the constructor, before Spring injects any dependencies.',
    correction: '@PostConstruct runs AFTER all dependency injection is complete — after constructor, after setter injection, after @Autowired fields. By the time @PostConstruct fires, all @Autowired fields are populated. If you see a NullPointerException in @PostConstruct, the field was never injected, not that injection had not happened yet.',
    whyBelivedWrong: 'The name "PostConstruct" sounds like it means "after the constructor." The key word is "after construction is complete" — i.e., after the bean is fully assembled, not immediately after the constructor returns.'
  },
  {
    id: 'w2',
    wrong: 'BeanPostProcessor and BeanFactoryPostProcessor do the same thing, just at different times.',
    correction: 'They operate on completely different objects. BeanFactoryPostProcessor modifies BeanDefinition metadata objects — it changes how beans will be created before any bean exists. BeanPostProcessor modifies or replaces actual bean instances — it wraps already-constructed beans. PropertySourcesPlaceholderConfigurer is a BeanFactoryPostProcessor. AOP proxy creation is a BeanPostProcessor. The distinction matters because you cannot modify a BeanDefinition after beans are created, and you cannot wrap an instance before it exists.',
    whyBelivedWrong: 'Both names contain "PostProcessor" and "Bean." The difference is in the middle: "Factory" vs nothing — factory = definitions, no factory = instances.'
  },
  {
    id: 'w3',
    wrong: 'Prototype beans are destroyed by the container when the singleton that injected them is destroyed.',
    correction: 'The container does NOT call destroy callbacks on prototype beans, regardless of how they were injected. After creation and handoff, the container releases its reference to the prototype. The caller owns the lifecycle. @PreDestroy and DisposableBean.destroy() on a prototype bean will never fire unless you explicitly call them. Resource leaks are a real consequence of this behavior.',
    whyBelivedWrong: 'Developers assume that because the singleton holds a reference to the prototype, the container tracks both together. The container only tracks singleton lifecycle; prototype ownership transfers entirely to the caller.'
  },
  {
    id: 'w4',
    wrong: 'Adding @Lazy to a circular dependency is the correct fix.',
    correction: '@Lazy on a constructor parameter is a short-term escape hatch, not a fix. It resolves the BeanCurrentlyInCreationException by injecting a CGLIB proxy instead of the real bean, deferring resolution to first call. The circular dependency itself still exists — you have hidden it, not fixed it. The correct fix is to extract a shared abstraction (EventBus, Mediator, Registry) that breaks the cycle structurally. Always add a comment when using @Lazy for circular resolution to explain why and link to the tracking issue for the real fix.',
    whyBelivedWrong: '@Lazy makes the error go away immediately, which looks like a fix. The application starts and works correctly in most cases. The hidden cycle only becomes a problem during complex initialization sequences or when the proxy resolves before the target bean is ready.'
  },
  {
    id: 'w5',
    wrong: '@Lazy makes a bean prototype-scoped — a new instance is created each time it is injected.',
    correction: '@Lazy on a @Component or @Bean means the singleton is not created at startup — it is created on the first injection or getBean() call, but it is still a singleton. One instance is created, cached, and reused for all subsequent requests. @Scope("prototype") creates a new instance per injection or getBean(). @Lazy and @Scope("prototype") are orthogonal: you can have @Lazy @Scope("prototype") which means the first prototype is not created at startup but is created and discarded (not cached) on first use.',
    whyBelivedWrong: 'Both @Lazy and @Scope("prototype") involve "not creating the bean eagerly." The distinction is whether the result is cached (singleton, regardless of @Lazy) or discarded (prototype).'
  },
  {
    id: 'w6',
    wrong: 'SmartInitializingSingleton runs before BeanPostProcessor.postProcessAfterInitialization.',
    correction: 'SmartInitializingSingleton runs AFTER all BeanPostProcessors have run for all beans. The order is: for each singleton bean, run the full lifecycle including BPP-before, init callbacks, BPP-after (where AOP proxies are created). After all singletons have completed this full lifecycle, then SmartInitializingSingleton fires once. SmartInitializingSingleton is specifically designed for post-full-context-initialization logic, where all beans exist and are fully proxied.',
    whyBelivedWrong: 'The "smart" in SmartInitializingSingleton sounds like it implies an early, smart step in the process. In reality it is the latest hook in the singleton initialization sequence.'
  },
  {
    id: 'w7',
    wrong: '@DependsOn("beanName") injects the named bean as a dependency into the annotated bean.',
    correction: '@DependsOn does NOT inject. It only adds a directed ordering edge in the dependency graph: "initialize beanName before me." No field is populated, no reference is stored, no injection occurs. After startup, the annotated bean has no programmatic reference to the named bean. @DependsOn is for side effects — Kafka topic creation, Liquibase migration, JMX registration — where you need the side effect to have happened but do not need to call methods on the other bean.',
    whyBelivedWrong: 'The annotation name sounds like @DependsOn creates a dependency, which implies injection. In Spring\'s model, ordering and injection are separate concerns: @DependsOn handles ordering only.'
  },
  {
    id: 'w8',
    wrong: 'Using @Autowired on an ApplicationContext field is bad practice — you should always use ApplicationContextAware.',
    correction: 'Since Spring 4.3, @Autowiring ApplicationContext directly is fully supported and idiomatic. ApplicationContextAware is the older style — it uses a callback-based injection pattern common before annotations were dominant. Both approaches work identically. For modern Spring code, @Autowired ApplicationContext is cleaner and easier to understand. Reserve ApplicationContextAware for infrastructure/library code that must work without annotation processing, or in code bases that mix Spring versions.',
    whyBelivedWrong: 'ApplicationContextAware appears in older Spring documentation and many tutorial series as the canonical way to access the context. Newer documentation is clearer that @Autowired is preferred for application code.'
  }
];

// ─── CHEATSHEET ───────────────────────────────────────────────────────────────
const cheatsheet = [
  { concept: '@PostConstruct',           oneLiner: 'Runs after all injection complete; before afterPropertiesSet',         gotcha: 'Cannot throw checked exceptions; process by CommonAnnotationBPP' },
  { concept: 'afterPropertiesSet()',     oneLiner: 'InitializingBean callback; runs after @PostConstruct',                gotcha: 'Couples class to Spring API; prefer @PostConstruct for app code' },
  { concept: 'custom initMethod',        oneLiner: '@Bean(initMethod="x") fires third; useful for third-party classes',    gotcha: 'Must be no-arg method; declared per-bean, not per-class' },
  { concept: '@PreDestroy',              oneLiner: 'Runs before DisposableBean.destroy() on context close',               gotcha: 'Never fires for prototype beans; container does not manage prototype destroy' },
  { concept: 'DisposableBean',           oneLiner: 'Older-style destroy callback; pairs with InitializingBean',           gotcha: 'Same phase as @PreDestroy; avoid mixing both in one bean without docs' },
  { concept: 'BeanFactoryPostProcessor', oneLiner: 'Modifies BeanDefinitions before any bean is instantiated',           gotcha: 'Runs very early; cannot @Autowire other beans; @Transactional does not apply' },
  { concept: 'BeanPostProcessor',        oneLiner: 'Wraps/replaces instances after construction; enables AOP proxies',    gotcha: 'Must return the bean (or replacement); BPPs themselves are not proxied' },
  { concept: '@DependsOn',               oneLiner: 'Forces init order without injection; for side-effect beans',          gotcha: 'Does not inject; does not guarantee the dep succeeded; ordering only' },
  { concept: '@Primary',                 oneLiner: 'Default bean for unqualified injection; overridden by @Qualifier',     gotcha: 'Silently routes to wrong bean if added to test double without @Profile guard' },
  { concept: '@Qualifier',               oneLiner: 'Explicit named binding at injection point; overrides @Primary',        gotcha: 'Custom qualifier annotations (meta @Qualifier) are type-safe alternative' },
  { concept: '@Lazy',                    oneLiner: 'Defers singleton creation to first use; breaks circular dep cycles',   gotcha: '@Lazy on field injects proxy (deferred resolution); @Lazy on class defers creation' },
  { concept: 'ObjectFactory<T>',         oneLiner: 'Returns new prototype instance on each getObject() call',             gotcha: 'Spring-specific; use Provider<T> for framework-agnostic code' },
  { concept: 'Provider<T>',              oneLiner: 'JSR-330 equivalent of ObjectFactory; get() returns new prototype',    gotcha: 'Requires javax.inject on classpath; same semantics as ObjectFactory' },
  { concept: 'SmartInitializingSingleton', oneLiner: 'afterSingletonsInstantiated() fires once after all singletons ready', gotcha: 'Safer than ContextRefreshedEvent; use for startup validation' },
  { concept: 'FactoryBean<T>',           oneLiner: 'getObject() produces bean T; getBean("name") returns T, "&name" returns FactoryBean', gotcha: 'isSingleton() controls caching of getObject(); rarely needed in Boot — use @Bean method' }
];

// ─── ASSEMBLE THE DAY ─────────────────────────────────────────────────────────
const day = {
  day: 39,
  title: 'Spring Bean Lifecycle & Advanced DI',
  estimatedHours: 4,
  difficulty: 'Advanced',
  level: 'Advanced',
  track: 'Mid-Level',
  tags: [
    'Mid-Level', 'Advanced', 'Phase 5', 'Interview Prep',
    'Spring', 'Bean Lifecycle', 'DI', 'BeanPostProcessor',
    'Satyverse(Satyam Parmar)'
  ],
  prerequisites: ['Day 38', 'Day 37'],
  learningObjectives: [
    'Describe all 12 phases of the Spring bean lifecycle in correct order',
    'Explain what BeanFactoryPostProcessor vs BeanPostProcessor modifies and when',
    'Choose @PostConstruct, afterPropertiesSet, or initMethod correctly per use case',
    'Identify and fix scope mismatch using ObjectFactory, Provider, or scoped proxy',
    'Resolve circular dependencies structurally rather than masking with @Lazy',
    'Use @DependsOn, SmartInitializingSingleton, and Aware interfaces in production code',
    'Disambiguate beans with @Qualifier and @Primary safely across profiles'
  ],
  sections: [
    {
      type: 'why',
      title: 'Why Spring lifecycle knowledge separates mid-level from senior engineers',
      content: whyContent
    },
    {
      type: 'theory',
      title: 'Spring Bean Lifecycle & Advanced DI — deep dive theory',
      content: theoryContent
    },
    {
      type: 'code',
      title: 'Spring Bean Lifecycle — basic: callback order in plain Java',
      language: 'java',
      filename: 'Day39LifecycleOrder.java',
      level: 'basic',
      description: 'Simulates all 12 bean lifecycle phases in plain Java without a Spring context. Run this to internalize the exact callback sequence before debugging a real Spring app.',
      code: basicCode,
      output: basicOutput
    },
    {
      type: 'code',
      title: 'BeanPostProcessor, Aware, SmartInitializingSingleton — intermediate patterns',
      language: 'java',
      filename: 'Day39Intermediate.java',
      level: 'intermediate',
      description: 'Four real Spring scenarios: (1) bean with all init/destroy callbacks showing order, (2) BeanPostProcessor that detects slow-initializing beans, (3) ApplicationContextAware bean that inspects the context in @PostConstruct, (4) SmartInitializingSingleton that validates all PaymentGateway beans at startup.',
      code: intermediateCode,
      output: intermediateOutput
    },
    {
      type: 'code',
      title: 'Scope mismatch, FactoryBean, @DependsOn, circular deps, @Qualifier — advanced patterns',
      language: 'java',
      filename: 'Day39Advanced.java',
      level: 'advanced',
      description: 'Five production-grade scenarios: scope mismatch bug + three fixes (ObjectFactory, Provider, ScopedProxy), FactoryBean for HttpClient creation, @DependsOn for Kafka topic ordering, circular dependency resolution (structural EventBus fix + @Lazy escape hatch), @Primary/@Qualifier for multiple PaymentGateway implementations.',
      code: advancedCode,
      output: advancedOutput
    },
    diagramSection,
    {
      type: 'pitfalls',
      title: 'Common Pitfalls — Spring Bean Lifecycle & Advanced DI',
      items: pitfalls
    },
    exerciseSection,
    {
      type: 'conceptual',
      title: 'Conceptual Interview Questions',
      items: conceptualQAs
    },
    {
      type: 'codeBased',
      title: 'Code-Based Interview Questions',
      items: codeBasedQAs
    },
    {
      type: 'seniorScenario',
      title: 'Senior Engineer Scenario Questions',
      items: seniorScenarios
    },
    {
      type: 'wrongAnswers',
      title: 'Wrong Answers to Unlearn',
      items: wrongAnswers
    },
    {
      type: 'cheatsheet',
      title: 'Quick Reference Cheatsheet',
      rows: cheatsheet
    }
  ]
};

writeFileSync(OUT, JSON.stringify(day, null, 2), 'utf-8');
console.log('Written:', OUT);
console.log('Sections:', day.sections.length);
console.log('Conceptual Q&As:', conceptualQAs.length);
console.log('CodeBased Q&As:', codeBasedQAs.length);
console.log('SeniorScenario Q&As:', seniorScenarios.length);
console.log('WrongAnswers:', wrongAnswers.length);
console.log('Cheatsheet rows:', cheatsheet.length);
console.log('Pitfalls:', pitfalls.length);
