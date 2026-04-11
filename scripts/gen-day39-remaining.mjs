import { writeFileSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE = path.join(__dirname, '../public/data/days/phase5-day39.json');

// Load existing day (why, theory, code, diagram already rewritten)
const day = JSON.parse(readFileSync(FILE, 'utf-8'));

// ─── EXERCISE ─────────────────────────────────────────────────────────────────
const exercise = {
  type: 'exercise',
  title: 'Exercise — Scope Mismatch: Find the Bug and Fix It',
  problem:
    'You are building a food delivery app. A `Cart` bean holds the items a user wants to order. ' +
    'It is annotated with `@Scope("prototype")` so each user gets their own cart. ' +
    'But users are reporting that items from other users appear in their cart.\n\n' +
    'The broken code:\n\n' +
    '```java\n' +
    '@Component\n' +
    '@Scope("prototype")\n' +
    'public class Cart {\n' +
    '    private List<String> items = new ArrayList<>();\n' +
    '    public void add(String item) { items.add(item); }\n' +
    '    public List<String> getItems() { return items; }\n' +
    '    public void clear() { items.clear(); }\n' +
    '}\n\n' +
    '@Service\n' +
    'public class OrderService {\n' +
    '    @Autowired\n' +
    '    private Cart cart; // <- bug is here\n\n' +
    '    public void addItem(String item) { cart.add(item); }\n' +
    '    public List<String> getCart() { return cart.getItems(); }\n' +
    '    public void checkout() { cart.clear(); }\n' +
    '}\n' +
    '```\n\n' +
    'Tasks:\n' +
    '1. Explain in your own words WHY this code causes items from different users to mix — what exactly is Spring doing wrong here?\n' +
    '2. Fix the code using `ObjectFactory<Cart>` so each simulated user gets their own fresh Cart.\n' +
    '3. Write a simple test (no Spring context needed) that proves the bug exists in the original code and is fixed in your version.\n' +
    '4. Bonus: What would happen if you added `@Scope(value="prototype", proxyMode=ScopedProxyMode.TARGET_CLASS)` to the Cart class instead? How is that different from ObjectFactory?',
  hints: [
    'Think about WHEN Spring injects the Cart into OrderService. OrderService is a singleton — it is created exactly once at startup. The @Autowired injection also happens exactly once at that moment.',
    'Try printing cart.hashCode() inside addItem() for two different "user" calls. If the number is the same both times, you have confirmed the bug.',
    'With ObjectFactory: inject ObjectFactory<Cart> instead of Cart directly. Call cartFactory.getObject() each time you need a cart — this creates a new Cart on every call.',
    'The scoped proxy approach is transparent — the caller uses cart.add() as normal. But the proxy internally creates a new Cart per HTTP request/session scope. For prototype scope, ObjectFactory gives you more explicit control.'
  ],
  solution:
    'package day39;\n\n' +
    'import org.springframework.beans.factory.ObjectFactory;\n' +
    'import org.springframework.beans.factory.annotation.Autowired;\n' +
    'import org.springframework.context.annotation.Scope;\n' +
    'import org.springframework.stereotype.Component;\n' +
    'import org.springframework.stereotype.Service;\n' +
    'import java.util.ArrayList;\n' +
    'import java.util.List;\n\n' +
    '// ── The Cart bean — unchanged ──\n' +
    '@Component\n' +
    '@Scope("prototype")\n' +
    'public class Cart {\n' +
    '    private List<String> items = new ArrayList<>();\n' +
    '    public void add(String item) { items.add(item); }\n' +
    '    public List<String> getItems() { return new ArrayList<>(items); }\n' +
    '    public void clear() { items.clear(); }\n' +
    '}\n\n' +
    '// ── Fixed OrderService — uses ObjectFactory ──\n' +
    '@Service\n' +
    'public class OrderService {\n\n' +
    '    @Autowired\n' +
    '    private ObjectFactory<Cart> cartFactory; // inject the factory, not the cart\n\n' +
    '    // In a real web app, you would store the cart per-session.\n' +
    '    // Here we simulate by always getting a fresh cart (simplified).\n' +
    '    public Cart getCartForUser() {\n' +
    '        return cartFactory.getObject(); // new Cart instance every call\n' +
    '    }\n' +
    '}\n\n' +
    '// ── Simple test — no Spring needed ──\n' +
    'class ScopeMismatchTest {\n\n' +
    '    public static void main(String[] args) {\n' +
    '        // Simulate the BUG: one Cart shared by all\n' +
    '        Cart sharedCart = new Cart();\n\n' +
    '        // User A adds "Pizza"\n' +
    '        sharedCart.add("Pizza");\n' +
    '        System.out.println("User A cart: " + sharedCart.getItems()); // [Pizza]\n\n' +
    '        // User B comes along — gets the SAME cart object\n' +
    '        sharedCart.add("Burger"); // User B\'s item goes into User A\'s cart!\n' +
    '        System.out.println("User B cart: " + sharedCart.getItems()); // [Pizza, Burger] BUG!\n\n' +
    '        System.out.println();\n\n' +
    '        // Simulate the FIX: each user gets a fresh Cart\n' +
    '        Cart userACart = new Cart(); // ObjectFactory.getObject() does exactly this\n' +
    '        Cart userBCart = new Cart();\n\n' +
    '        userACart.add("Pizza");\n' +
    '        userBCart.add("Burger");\n\n' +
    '        System.out.println("User A cart: " + userACart.getItems()); // [Pizza]\n' +
    '        System.out.println("User B cart: " + userBCart.getItems()); // [Burger]\n' +
    '        System.out.println("Same cart? " + (userACart == userBCart)); // false\n' +
    '    }\n' +
    '}\n\n' +
    '// Expected output:\n' +
    '// User A cart: [Pizza]\n' +
    '// User B cart: [Pizza, Burger]  <- BUG demonstrated\n' +
    '//\n' +
    '// User A cart: [Pizza]\n' +
    '// User B cart: [Burger]         <- FIX working\n' +
    '// Same cart? false'
};

// ─── INTERVIEW SECTION (nested: conceptual, codeBased, seniorScenario, wrongAnswers)
const interview = {
  type: 'interview',
  title: 'Interview Questions — Spring Bean Lifecycle & Advanced DI',

  conceptual: [
    {
      question: 'In simple words, what is a Spring bean and why does Spring create it instead of you using `new`?',
      answer:
        'A Spring bean is just a Java object that Spring creates and manages for you. You use `new` when you need an object in one place. Spring manages beans when many parts of your app need the same object — like an email sender or a database service. Spring creates it once, keeps it ready, and gives it to anyone who asks. The real benefit: when you want to swap the real EmailService with a test version, you change one line of config instead of hunting through every class that calls `new EmailService()`.',
      followUps: [
        {
          question: 'Can you use Spring beans without the @Autowired annotation?',
          answer: 'Yes, in two ways. First: constructor injection with a single constructor needs no @Autowired — Spring detects the constructor automatically since Spring 4.3. Second: you can call applicationContext.getBean(MyService.class) to look up a bean programmatically. But @Autowired (or constructor injection) is cleaner and is the standard approach for application code.'
        }
      ]
    },
    {
      question: 'What order do these three things happen: constructor runs, @Autowired fields are set, @PostConstruct runs?',
      answer:
        'Always: (1) constructor runs — the object exists but all @Autowired fields are null, (2) @Autowired fields are set — Spring fills in all dependencies, (3) @PostConstruct runs — everything is ready. This is why you never use @Autowired fields inside a constructor — they are null there. @PostConstruct is the safe zone where all your dependencies are available.',
      followUps: [
        {
          question: 'What if you need to do setup work that depends on an injected field? Where do you put that code?',
          answer: 'Always in @PostConstruct. For example, if you want to load a cache using an injected repository, put that logic in a @PostConstruct method. The repository is guaranteed to be injected before @PostConstruct fires. In the constructor, it would be null.'
        }
      ]
    },
    {
      question: 'What does @PostConstruct do and when would you actually use it in a real project?',
      answer:
        '@PostConstruct marks a method Spring calls after the bean is built and all dependencies are injected. Real uses: loading data into a cache at startup (using an injected repository), opening a connection pool (using an injected config), validating that required properties are not blank (fail fast at startup instead of on the first request), registering the bean with an external service. The rule: anything that needs your injected fields belongs in @PostConstruct, not the constructor.',
      followUps: [
        {
          question: 'What happens if @PostConstruct throws an exception?',
          answer: 'Spring treats it as a fatal startup failure. The bean is not registered in the context and the application fails to start. This is actually useful — if your @PostConstruct validates config and throws when something is missing, you get a clear error at startup instead of a confusing failure on the first real request.'
        }
      ]
    },
    {
      question: 'What is @PreDestroy and why does it NOT work for prototype beans?',
      answer:
        '@PreDestroy marks a method Spring calls when the application shuts down, right before the bean is destroyed. Use it to release resources: close connections, stop threads, flush data. It does NOT fire for prototype beans because Spring gives up ownership of a prototype after creation — it hands the object to the caller and forgets about it. With no reference, it cannot call cleanup. For singletons, Spring holds the reference for the entire app lifetime, so it knows when to clean up.',
      followUps: [
        {
          question: 'So if I have a prototype bean that opens a database connection, how do I close it?',
          answer: 'You are responsible for closing it. Three options: (1) make the caller explicitly call a close() method when done, (2) use try-with-resources if the bean implements AutoCloseable, (3) track all prototype instances in a registry and clean them up in a scheduled job. In practice, the easiest fix is to ask whether the bean really needs to be prototype-scoped — often singleton with stateless design works better.'
        }
      ]
    },
    {
      question: 'Explain the scope mismatch bug in simple terms. Why does injecting a prototype directly into a singleton not work?',
      answer:
        'Spring creates a singleton once. At that one moment, it injects one prototype instance. That prototype is now stuck inside the singleton forever — it is the same object for every call, every user, every request. Prototype scope was supposed to give a fresh instance each time, but because the injection happened only once (when the singleton was created), you always get the old one. Fix: inject ObjectFactory<YourPrototype> instead, and call getObject() each time you need a fresh instance.',
      followUps: [
        {
          question: 'How do you verify in a test that scope mismatch is happening?',
          answer: 'Print the prototype bean\'s hashCode() on two separate calls through the singleton. If both calls return the same hashCode, you are seeing the same object — scope mismatch confirmed. After the fix with ObjectFactory, the two hashCodes should be different.'
        }
      ]
    },
    {
      question: 'You have two classes implementing the same interface. How do you tell Spring which one to inject?',
      answer:
        '@Primary on one implementation makes it the default — Spring picks it for all unqualified injection points. @Qualifier("beanName") at a specific injection point says "I want this exact one." @Qualifier always wins over @Primary. Use @Primary for the dominant implementation and @Qualifier for the exception. Never put @Primary on a test/stub class without also adding @Profile("test") — otherwise the stub becomes the default in production.',
      followUps: [
        {
          question: 'What happens if you put @Primary on both implementations?',
          answer: 'Spring throws NoUniqueBeanDefinitionException at startup — same as if neither had @Primary. @Primary only works when exactly one bean of that type has it. If two have it, Spring is back to having no default.'
        }
      ]
    },
    {
      question: 'What is a circular dependency and what is the right way to fix it?',
      answer:
        'Circular dependency: Bean A needs Bean B and Bean B needs Bean A. Spring cannot create either — it needs B to create A, and needs A to create B. With constructor injection, Spring throws BeanCurrentlyInCreationException at startup. The wrong fix is @Lazy — it makes the startup error disappear by injecting a proxy, but the circular design is still there. The real fix: extract a third bean (EventBus, shared helper, registry) that both A and B depend on. A depends on C, B depends on C — no circle.',
      followUps: [
        {
          question: 'Why is @Lazy considered a wrong fix for circular dependencies?',
          answer: '@Lazy makes the startup succeed by injecting a proxy instead of the real bean. The proxy resolves the actual bean lazily on first use. But the classes still have a circular dependency in their design — A still logically needs B and B still logically needs A. You have hidden the design problem, not fixed it. Future developers will see @Lazy with no explanation and not know why it is there.'
        }
      ]
    },
    {
      question: 'What does @DependsOn do? How is it different from @Autowired?',
      answer:
        '@DependsOn tells Spring to initialize one named bean before initializing the current bean — purely for ordering. No injection happens. No reference is stored. @Autowired actually injects a reference you can use. Use @DependsOn when you need a side effect to have happened (database migration to have run, Kafka topic to exist) but you do not need to call any methods on that bean. If you need to call methods on it, use @Autowired.',
      followUps: [
        {
          question: 'Give a real example of when @DependsOn is the right tool.',
          answer: 'Database migration: a FlywayMigrationService runs SQL scripts in @PostConstruct. A UserRepository must only start after the schema exists, but it does not need to call any methods on FlywayMigrationService. @DependsOn("flywayMigration") on UserRepository guarantees the migration runs first without creating an injection relationship between unrelated classes.'
        }
      ]
    },
    {
      question: 'How does @Transactional actually work? Why does calling a @Transactional method from within the same class not start a transaction?',
      answer:
        '@Transactional works through a proxy. Spring wraps your class in a generated CGLIB subclass. When external code calls your method, it goes through the proxy — the proxy starts a transaction, calls your real method, then commits or rolls back. Self-invocation: when code inside your class calls `this.myMethod()`, it calls directly on the real object, bypassing the proxy. No proxy call = no transaction start. Fix: move the @Transactional method to a separate class so all callers always go through a proxy.',
      followUps: [
        {
          question: 'How do you confirm whether a transaction is actually active inside a method?',
          answer: 'Call TransactionSynchronizationManager.isActualTransactionActive() inside the method. If it returns false, no transaction was started — you have confirmed the self-invocation problem or a missing proxy.'
        }
      ]
    },
    {
      question: 'What is the difference between singleton and prototype scope? When should you use each?',
      answer:
        'Singleton (default): one instance shared by the whole app. Use for stateless services — EmailService, PaymentService, repositories. Prototype: new instance every time the bean is requested. Use when the bean holds per-user or per-operation state, like a shopping cart or a job context. 95% of Spring beans should be singleton. Prototype adds complexity (no @PreDestroy, scope mismatch trap) — only use it when you genuinely need isolated state per caller.',
      followUps: [
        {
          question: 'Can a singleton bean safely hold instance variables?',
          answer: 'Yes, if the variables are set once (in @PostConstruct) and are read-only after that — like a cached configuration or a loaded resource. Never store per-user, per-request, or per-thread state in singleton fields — that causes data leaks between users. If you need mutable per-request state, use a prototype bean or ThreadLocal, not a singleton field.'
        }
      ]
    },
    {
      question: 'What is a BeanPostProcessor and why would you ever need one?',
      answer:
        'BeanPostProcessor runs around every bean\'s initialization — once before and once after. You can inspect the bean, wrap it, or replace it entirely. This is how Spring itself adds @Transactional, @Async, and AOP — a BeanPostProcessor checks each bean for these annotations and replaces it with a proxy if found. In application code, you use a BeanPostProcessor when you need to apply the same behaviour to many beans at once without modifying each class — like logging initialization time, validating that all beans with a custom annotation are correctly configured, or integrating a third-party instrumentation library.',
      followUps: [
        {
          question: 'What is the most important rule when writing a BeanPostProcessor?',
          answer: 'Always return the bean (or its replacement) from both postProcessBeforeInitialization and postProcessAfterInitialization. If you return null, Spring throws a NullPointerException for every bean your processor touches. Returning the original bean unchanged is a no-op — safe if you only want to observe, not modify.'
        }
      ]
    },
    {
      question: 'What is the difference between constructor injection and field injection? Which is better?',
      answer:
        'Field injection: @Autowired on a private field. Easy to write. Problems: the class cannot be used without Spring (unit tests need a full context or Mockito reflection magic), all required dependencies are hidden inside the class, and fields cannot be final. Constructor injection: dependencies listed as constructor parameters, Spring calls the constructor. Better because: you can write `new MyService(mockDep)` in unit tests with no Spring, all dependencies are visible in the constructor, fields can be final, and missing dependencies fail at compile time not runtime.',
      followUps: [
        {
          question: 'Is there any case where field injection is acceptable?',
          answer: 'In test classes only — @Autowired or @MockBean on test fields is standard and accepted. IntelliJ IDEA\'s Spring inspections suppress the warning in test classes for this reason. In production code, constructor injection is always preferred.'
        }
      ]
    },
    {
      question: 'What is @Lazy and when should you use it?',
      answer:
        'By default, Spring creates all singleton beans at startup. @Lazy delays a bean\'s creation until the first time it is needed. Use it when: (1) the bean is expensive to create (loads 500MB of data) and is rarely used, (2) you want startup to be faster and health checks to pass before heavy initialization runs. Do NOT use @Lazy just to speed up startup for beans that are always needed — the cost is deferred, not eliminated. It hits users on the first request instead.',
      followUps: [
        {
          question: 'What is the difference between @Lazy on a class vs @Lazy on an @Autowired field?',
          answer: '@Lazy on a @Component class: that bean is not created at startup. @Lazy on a specific @Autowired field: a proxy is injected at startup, but the real bean is only resolved when a method on that proxy is first called. They are different mechanisms. The field-level @Lazy is used to break circular dependencies (the proxy breaks the creation cycle), while class-level @Lazy is used for startup performance.'
        }
      ]
    },
    {
      question: 'What are Aware interfaces in Spring and when would you use them?',
      answer:
        'Aware interfaces let a bean ask Spring for framework infrastructure during initialization. The most useful: BeanNameAware (Spring gives your bean its own registered name), ApplicationContextAware (Spring gives your bean access to the whole container so you can look up other beans programmatically), EnvironmentAware (access to application properties and active profiles). These interfaces fire before @PostConstruct, so by the time @PostConstruct runs you already have the values. Since Spring 4.3, you can also just @Autowire ApplicationContext directly — simpler and the preferred modern approach.',
      followUps: [
        {
          question: 'Why should you be careful about overusing ApplicationContextAware?',
          answer: 'Injecting the whole ApplicationContext and calling getBean() inside your class creates a service-locator pattern — your class can access any bean in the app, making dependencies hidden and tests hard to write. It breaks the explicit, visible dependency contract of @Autowired. Use it only for framework-level code like plugin registries or dynamic routing, not for regular business services.'
        }
      ]
    },
    {
      question: 'What happens during Spring application shutdown? In what order do things run?',
      answer:
        'When context.close() is called (or the JVM shuts down via registered shutdown hook), Spring: (1) publishes a ContextClosedEvent, (2) calls @PreDestroy methods on all singleton beans, (3) calls DisposableBean.destroy() if implemented, (4) calls any custom destroyMethod declared via @Bean. The order of bean destruction is the reverse of creation order — beans created last are destroyed first. Prototype beans are NOT destroyed. Spring Boot registers a JVM shutdown hook automatically so graceful shutdown happens even with Ctrl+C.',
      followUps: [
        {
          question: 'What does registerShutdownHook() do and when do you need to call it?',
          answer: 'registerShutdownHook() tells the JVM to call context.close() when the JVM exits normally (not on kill -9). Spring Boot does this automatically. In a standalone Spring application (not Spring Boot), you must call ctx.registerShutdownHook() yourself, otherwise @PreDestroy never fires on normal JVM exit.'
        }
      ]
    },
    {
      question: 'What is SmartInitializingSingleton and when should you use it instead of @PostConstruct?',
      answer:
        '@PostConstruct on a bean runs when that individual bean finishes initializing — other beans may still be starting up. SmartInitializingSingleton.afterSingletonsInstantiated() runs once, after ALL singleton beans have completed their full initialization including BeanPostProcessor wrapping. Use SmartInitializingSingleton when your startup logic needs to inspect or interact with beans that might not exist yet at @PostConstruct time — like validating that every bean implementing a certain interface has a required configuration, or registering all beans of a certain type into a router.',
      followUps: [
        {
          question: 'Why is SmartInitializingSingleton safer than ApplicationListener<ContextRefreshedEvent> for startup logic?',
          answer: 'ContextRefreshedEvent fires every time the context is refreshed — once for the root context and again for the DispatcherServlet child context in a web app. If your startup logic runs twice it can cause duplicate registration, double cache loading, or double background thread creation. SmartInitializingSingleton fires exactly once per context, making it the safer choice for one-time startup tasks.'
        }
      ]
    },
    {
      question: 'Your class has @Service but Spring is not finding it. What are the four most likely reasons?',
      answer:
        '(1) Package not scanned: the class is outside the package tree of your @SpringBootApplication class. Spring Boot scans the main class package and all sub-packages. Move the class into a sub-package or add it explicitly to @ComponentScan. (2) Wrong annotation: you might have @Component on the interface instead of the implementation class. Spring creates instances of concrete classes. (3) The class is abstract: Spring cannot instantiate abstract classes. (4) Manual instantiation: somewhere you called new MyService() and are using that instance — Spring never managed that object, so @Autowired fields inside it are null.',
      followUps: [
        {
          question: 'How do you confirm which beans Spring has actually registered?',
          answer: 'Call applicationContext.getBeanDefinitionNames() and print the results. If your bean name is not in the list, Spring never found it during scanning. This is faster than guessing at package structure.'
        }
      ]
    }
  ],

  codeBased: [
    {
      question: 'Write a Spring @Service that reads a greeting from application.properties using @Value and prints it at startup using @PostConstruct.',
      answer:
        '@Service\n' +
        'public class GreetingService {\n\n' +
        '    // Reads "app.greeting" from application.properties.\n' +
        '    // Uses "Hello!" as the default if the property is not set.\n' +
        '    @Value("${app.greeting:Hello!}")\n' +
        '    private String greeting;\n\n' +
        '    @PostConstruct\n' +
        '    public void init() {\n' +
        '        // greeting is injected before this method runs\n' +
        '        System.out.println("App started. Greeting: " + greeting);\n' +
        '    }\n\n' +
        '    public String getGreeting() { return greeting; }\n' +
        '}\n\n' +
        '// In application.properties:\n' +
        '// app.greeting=Welcome to Satyverse!\n\n' +
        '// Output at startup:\n' +
        '// App started. Greeting: Welcome to Satyverse!',
      followUps: [
        {
          question: 'What happens if you move the System.out.println to the constructor instead of @PostConstruct?',
          answer: 'The greeting field will be null in the constructor — Spring sets @Value fields after the constructor runs. You would print "App started. Greeting: null". This is the classic mistake that @PostConstruct solves.'
        }
      ]
    },
    {
      question: 'Show the buggy version of injecting a prototype bean into a singleton, and then fix it using ObjectFactory.',
      answer:
        '// The prototype bean — should be unique per usage\n' +
        '@Component\n' +
        '@Scope("prototype")\n' +
        'class RequestTracker {\n' +
        '    private final String id = UUID.randomUUID().toString();\n' +
        '    public String getId() { return id; }\n' +
        '}\n\n' +
        '// BUG: direct injection — same instance forever\n' +
        '@Service\n' +
        'class RequestHandlerBuggy {\n' +
        '    @Autowired private RequestTracker tracker; // injected ONCE at startup\n' +
        '    public void handle() {\n' +
        '        System.out.println("ID: " + tracker.getId()); // same ID every call\n' +
        '    }\n' +
        '}\n\n' +
        '// FIX: ObjectFactory gives a fresh instance per call\n' +
        '@Service\n' +
        'class RequestHandlerFixed {\n' +
        '    @Autowired private ObjectFactory<RequestTracker> trackerFactory;\n' +
        '    public void handle() {\n' +
        '        RequestTracker tracker = trackerFactory.getObject(); // new each time\n' +
        '        System.out.println("ID: " + tracker.getId()); // different ID each call\n' +
        '    }\n' +
        '}',
      followUps: [
        {
          question: 'What is Provider<T> and how does it differ from ObjectFactory<T>?',
          answer: 'Provider<T> is the JSR-330 (Java standard) equivalent of Spring\'s ObjectFactory<T>. Both have one method that returns a new instance: ObjectFactory.getObject() and Provider.get(). Provider is preferred when your code should work outside of Spring too, since it has no Spring dependency. In a pure Spring Boot project, they are interchangeable.'
        }
      ]
    },
    {
      question: 'Create two implementations of PaymentService (StripePayment and PayPalPayment) and wire them correctly so the default is Stripe and PayPal is available by name.',
      answer:
        'interface PaymentService {\n' +
        '    String charge(String orderId, double amount);\n' +
        '}\n\n' +
        '@Service\n' +
        '@Primary // default — Spring picks this when no @Qualifier is given\n' +
        'class StripePayment implements PaymentService {\n' +
        '    public String charge(String orderId, double amount) {\n' +
        '        return "Stripe charged $" + amount + " for order " + orderId;\n' +
        '    }\n' +
        '}\n\n' +
        '@Service("paypalPayment") // explicit name for @Qualifier\n' +
        'class PayPalPayment implements PaymentService {\n' +
        '    public String charge(String orderId, double amount) {\n' +
        '        return "PayPal charged $" + amount + " for order " + orderId;\n' +
        '    }\n' +
        '}\n\n' +
        '@Service\n' +
        'class CheckoutService {\n' +
        '    @Autowired\n' +
        '    private PaymentService defaultPayment; // gets StripePayment (@Primary)\n\n' +
        '    @Autowired\n' +
        '    @Qualifier("paypalPayment")\n' +
        '    private PaymentService paypalPayment; // explicitly PayPal\n\n' +
        '    public String pay(String method, String orderId, double amount) {\n' +
        '        return "paypal".equals(method)\n' +
        '            ? paypalPayment.charge(orderId, amount)\n' +
        '            : defaultPayment.charge(orderId, amount);\n' +
        '    }\n' +
        '}',
      followUps: []
    },
    {
      question: 'Write a @PostConstruct that validates required config and fails the application startup if anything is missing.',
      answer:
        '@Service\n' +
        'public class StripeConfig {\n\n' +
        '    @Value("${stripe.api-key:}")\n' +
        '    private String apiKey;\n\n' +
        '    @Value("${stripe.webhook-secret:}")\n' +
        '    private String webhookSecret;\n\n' +
        '    @PostConstruct\n' +
        '    public void validate() {\n' +
        '        if (apiKey.isBlank()) {\n' +
        '            throw new IllegalStateException(\n' +
        '                "stripe.api-key must be set. Get it from the Stripe dashboard.");\n' +
        '        }\n' +
        '        if (webhookSecret.isBlank()) {\n' +
        '            throw new IllegalStateException(\n' +
        '                "stripe.webhook-secret must be set. Required for payment webhooks.");\n' +
        '        }\n' +
        '        System.out.println("Stripe config OK. API key ends with: ..." +\n' +
        '            apiKey.substring(Math.max(0, apiKey.length() - 4)));\n' +
        '    }\n' +
        '}\n\n' +
        '// If stripe.api-key is missing from application.properties,\n' +
        '// the app refuses to start with a clear error message.\n' +
        '// Much better than a NullPointerException on the first payment request.',
      followUps: []
    },
    {
      question: 'Write a BeanPostProcessor that logs how long each bean takes to initialize. Flag any bean that takes more than 100ms.',
      answer:
        '@Component\n' +
        'public class SlowBeanDetector implements BeanPostProcessor {\n\n' +
        '    private final Map<String, Long> startTimes = new java.util.concurrent.ConcurrentHashMap<>();\n\n' +
        '    @Override\n' +
        '    public Object postProcessBeforeInitialization(Object bean, String beanName) {\n' +
        '        startTimes.put(beanName, System.currentTimeMillis());\n' +
        '        return bean; // always return the bean!\n' +
        '    }\n\n' +
        '    @Override\n' +
        '    public Object postProcessAfterInitialization(Object bean, String beanName) {\n' +
        '        Long start = startTimes.remove(beanName);\n' +
        '        if (start != null) {\n' +
        '            long ms = System.currentTimeMillis() - start;\n' +
        '            if (ms > 100) {\n' +
        '                System.out.println("SLOW: " + beanName + " took " + ms + "ms");\n' +
        '            }\n' +
        '        }\n' +
        '        return bean; // always return the bean!\n' +
        '    }\n' +
        '}',
      followUps: [
        {
          question: 'What happens if you accidentally return null from a BeanPostProcessor?',
          answer: 'Spring throws a NullPointerException. When Spring calls postProcessAfterInitialization it expects to get back a valid bean (or a proxy). Returning null tells Spring there is no bean — it then fails when trying to inject that null bean into other beans that need it. Always return the bean.'
        }
      ]
    },
    {
      question: 'Rewrite this field-injected class to use constructor injection. Explain what improves.',
      answer:
        '// BEFORE — field injection (avoid in production code)\n' +
        '@Service\n' +
        'public class OrderService {\n' +
        '    @Autowired private OrderRepository orderRepo;\n' +
        '    @Autowired private EmailService emailService;\n' +
        '    @Autowired private InventoryService inventoryService;\n\n' +
        '    public void placeOrder(String item) {\n' +
        '        inventoryService.reserve(item);\n' +
        '        orderRepo.save(item);\n' +
        '        emailService.sendConfirmation(item);\n' +
        '    }\n' +
        '}\n\n' +
        '// AFTER — constructor injection (do this)\n' +
        '@Service\n' +
        'public class OrderService {\n' +
        '    private final OrderRepository orderRepo;\n' +
        '    private final EmailService emailService;\n' +
        '    private final InventoryService inventoryService;\n\n' +
        '    // @Autowired not needed — Spring uses the single constructor automatically\n' +
        '    public OrderService(OrderRepository orderRepo,\n' +
        '                        EmailService emailService,\n' +
        '                        InventoryService inventoryService) {\n' +
        '        this.orderRepo = orderRepo;\n' +
        '        this.emailService = emailService;\n' +
        '        this.inventoryService = inventoryService;\n' +
        '    }\n\n' +
        '    public void placeOrder(String item) {\n' +
        '        inventoryService.reserve(item);\n' +
        '        orderRepo.save(item);\n' +
        '        emailService.sendConfirmation(item);\n' +
        '    }\n' +
        '}\n\n' +
        '// What improves:\n' +
        '// 1. Fields are final — cannot be changed after construction\n' +
        '// 2. Unit test: new OrderService(mockRepo, mockEmail, mockInventory) — no Spring needed\n' +
        '// 3. All dependencies visible in the constructor signature\n' +
        '// 4. Missing dependency = compile error, not runtime NPE',
      followUps: []
    },
    {
      question: 'Fix this circular dependency by extracting a shared EventBus bean.',
      answer:
        '// PROBLEM (do not do this)\n' +
        '// @Service class InvoiceService { @Autowired PaymentService ps; }\n' +
        '// @Service class PaymentService { @Autowired InvoiceService is; } <- CIRCULAR\n\n' +
        '// FIX: extract EventBus. Neither class needs the other.\n\n' +
        '@Service\n' +
        'class EventBus {\n' +
        '    public void publish(String event, String data) {\n' +
        '        System.out.println("EVENT [" + event + "]: " + data);\n' +
        '    }\n' +
        '}\n\n' +
        '@Service\n' +
        'class InvoiceService {\n' +
        '    private final EventBus eventBus;\n' +
        '    InvoiceService(EventBus eventBus) { this.eventBus = eventBus; }\n\n' +
        '    public void createInvoice(String orderId) {\n' +
        '        System.out.println("Invoice created: " + orderId);\n' +
        '        eventBus.publish("invoice.created", orderId);\n' +
        '    }\n' +
        '}\n\n' +
        '@Service\n' +
        'class PaymentService {\n' +
        '    private final EventBus eventBus;\n' +
        '    PaymentService(EventBus eventBus) { this.eventBus = eventBus; }\n\n' +
        '    public void processPayment(String orderId) {\n' +
        '        System.out.println("Payment processed: " + orderId);\n' +
        '        eventBus.publish("payment.done", orderId);\n' +
        '    }\n' +
        '}',
      followUps: []
    },
    {
      question: 'Write a @PreDestroy that cleanly shuts down a scheduled background thread.',
      answer:
        '@Service\n' +
        'public class HealthCheckService {\n\n' +
        '    private ScheduledExecutorService scheduler;\n\n' +
        '    @PostConstruct\n' +
        '    public void start() {\n' +
        '        scheduler = Executors.newSingleThreadScheduledExecutor();\n' +
        '        scheduler.scheduleAtFixedRate(\n' +
        '            () -> System.out.println("Health check: OK"),\n' +
        '            0, 30, TimeUnit.SECONDS);\n' +
        '        System.out.println("Health check started.");\n' +
        '    }\n\n' +
        '    @PreDestroy\n' +
        '    public void stop() {\n' +
        '        System.out.println("Stopping health check...");\n' +
        '        scheduler.shutdown();\n' +
        '        try {\n' +
        '            if (!scheduler.awaitTermination(5, TimeUnit.SECONDS))\n' +
        '                scheduler.shutdownNow();\n' +
        '        } catch (InterruptedException e) {\n' +
        '            scheduler.shutdownNow();\n' +
        '            Thread.currentThread().interrupt();\n' +
        '        }\n' +
        '        System.out.println("Health check stopped cleanly.");\n' +
        '    }\n' +
        '}',
      followUps: []
    },
    {
      question: 'Write a SmartInitializingSingleton that checks all beans implementing a Validator interface have their rules configured.',
      answer:
        '@Component\n' +
        'public class ValidatorRegistry implements SmartInitializingSingleton {\n\n' +
        '    @Autowired\n' +
        '    private ApplicationContext ctx;\n\n' +
        '    @Override\n' +
        '    public void afterSingletonsInstantiated() {\n' +
        '        // All singleton beans are fully initialized by now\n' +
        '        Map<String, Validator> validators = ctx.getBeansOfType(Validator.class);\n\n' +
        '        List<String> unconfigured = new ArrayList<>();\n' +
        '        for (Map.Entry<String, Validator> entry : validators.entrySet()) {\n' +
        '            if (!entry.getValue().hasRules()) {\n' +
        '                unconfigured.add(entry.getKey());\n' +
        '            }\n' +
        '        }\n\n' +
        '        if (!unconfigured.isEmpty()) {\n' +
        '            throw new IllegalStateException(\n' +
        '                "These validators have no rules configured: " + unconfigured +\n' +
        '                ". App cannot start safely.");\n' +
        '        }\n\n' +
        '        System.out.println("All " + validators.size() + " validators are configured correctly.");\n' +
        '    }\n' +
        '}\n\n' +
        'interface Validator { boolean hasRules(); }',
      followUps: []
    },
    {
      question: 'What is wrong with this code and how do you fix it?\n\n@Service public class ReportService {\n    @Transactional\n    public void saveAndEmail() { saveReport(); sendEmail(); }\n    \n    public void saveReport() { /* saves to DB */ }\n    public void sendEmail() { /* sends email */ }\n}',
      answer:
        '// PROBLEM: saveAndEmail is @Transactional and called from outside (good).\n' +
        '// But internally it calls saveReport() and sendEmail() via this.saveReport().\n' +
        '// Those are direct calls — they go through the real object, not the proxy.\n' +
        '// If saveReport() also had @Transactional, it would be ignored.\n\n' +
        '// In this case the bigger issue: if sendEmail() throws, the transaction\n' +
        '// for saveReport() WILL roll back — because they are in the same\n' +
        '// saveAndEmail() transaction. That may or may not be what you want.\n\n' +
        '// If you want saveReport() to commit even if sendEmail() fails,\n' +
        '// they need separate transactions. Fix: separate class.\n\n' +
        '@Service\n' +
        'public class ReportSaver {\n' +
        '    @Transactional\n' +
        '    public void saveReport() { /* saves to DB, has its own transaction */ }\n' +
        '}\n\n' +
        '@Service\n' +
        'public class ReportService {\n' +
        '    @Autowired private ReportSaver saver;\n' +
        '    @Autowired private EmailService emailService;\n\n' +
        '    public void saveAndEmail() {\n' +
        '        saver.saveReport();       // goes through proxy, transaction commits\n' +
        '        emailService.sendEmail(); // separate concern, no transaction needed\n' +
        '    }\n' +
        '}',
      followUps: []
    },
    {
      question: 'Write a bean that uses @DependsOn to guarantee a DatabaseSeeder runs before it starts.',
      answer:
        '@Service("databaseSeeder")\n' +
        'public class DatabaseSeeder {\n' +
        '    @PostConstruct\n' +
        '    public void seed() {\n' +
        '        System.out.println("DatabaseSeeder: inserting reference data (countries, currencies)...");\n' +
        '        System.out.println("DatabaseSeeder: done.");\n' +
        '    }\n' +
        '}\n\n' +
        '@Service\n' +
        '@DependsOn("databaseSeeder") // wait for seeder before starting\n' +
        'public class ProductCatalogService {\n' +
        '    @PostConstruct\n' +
        '    public void init() {\n' +
        '        // Reference data (currencies, etc.) is guaranteed to exist\n' +
        '        System.out.println("ProductCatalogService: loading products with reference data.");\n' +
        '    }\n' +
        '    public String getProduct(String id) { return "Product[" + id + "]"; }\n' +
        '}\n\n' +
        '// Guaranteed output order:\n' +
        '// DatabaseSeeder: inserting reference data...\n' +
        '// DatabaseSeeder: done.\n' +
        '// ProductCatalogService: loading products with reference data.',
      followUps: []
    },
    {
      question: 'Write a Spring Boot test that verifies @PostConstruct ran correctly and @PreDestroy fires when the context closes.',
      answer:
        '@SpringBootTest\n' +
        'class ProductCacheServiceTest {\n\n' +
        '    @Autowired\n' +
        '    private ProductCacheService cacheService;\n\n' +
        '    @Test\n' +
        '    void cacheShouldBeLoadedAfterStartup() {\n' +
        '        // By the time the test runs, Spring has already:\n' +
        '        // 1. Created ProductCacheService\n' +
        '        // 2. Injected all @Autowired fields\n' +
        '        // 3. Called @PostConstruct which loaded the cache\n' +
        '        List<String> products = cacheService.getProducts();\n' +
        '        assertNotNull(products, "Cache should have been loaded in @PostConstruct");\n' +
        '        assertFalse(products.isEmpty(), "Cache should not be empty");\n' +
        '    }\n' +
        '}\n\n' +
        '// To test @PreDestroy, create a fresh context and close it manually:\n' +
        '@Test\n' +
        'void preDestroyShouldClearCache() {\n' +
        '    var ctx = new AnnotationConfigApplicationContext(AppConfig.class);\n' +
        '    ProductCacheService svc = ctx.getBean(ProductCacheService.class);\n' +
        '    assertFalse(svc.getProducts().isEmpty()); // @PostConstruct ran\n' +
        '    ctx.close(); // triggers @PreDestroy\n' +
        '    // After close, the bean is destroyed — further assertions would be on state before close\n' +
        '    // In practice: verify side effects like a "cache cleared" flag or a log message\n' +
        '}',
      followUps: []
    }
  ],

  seniorScenario: [
    {
      question: 'Users report that in production all orders show the same tracking ID regardless of which user placed them. The TrackingIdGenerator is @Scope("prototype"). What do you do?',
      answer:
        'This is scope mismatch. Diagnosis: TrackingIdGenerator is prototype but was @Autowired directly into a singleton OrderService. Spring injected one instance at startup and reused it for every order. To confirm: add System.out.println(trackingGenerator.hashCode()) inside the order method and watch the logs — it will be the same number every time.\n\nImmediate fix: change the @Autowired field from TrackingIdGenerator to ObjectFactory<TrackingIdGenerator>. Call factory.getObject() each time an order is placed — this creates a fresh generator with a unique ID per order. Deploy the fix.\n\nVerification: add a test that calls placeOrder() twice and asserts the two tracking IDs are different. Deploy with the test so this cannot regress silently.\n\nRoot-cause note: add a team convention — prototype beans must never be @Autowired directly into singletons. Add this to your code review checklist and consider an ArchUnit rule to catch it automatically.',
      followUps: [
        {
          question: 'Could you have caught this in testing before it reached production?',
          answer: 'Yes. A simple integration test calling the endpoint twice and asserting the tracking IDs differ would have caught it. The root cause of this reaching production was the absence of that test. After fixing, write the test first, confirm it fails with the old code, then apply the fix and confirm it passes.'
        }
      ]
    },
    {
      question: 'After a Spring Boot 2 to Spring Boot 3 upgrade, five services fail at startup with circular dependency errors. They worked fine before. What is your step-by-step response?',
      answer:
        'Spring Boot 3 (Spring Framework 6) made circular dependency detection strict by default — previously, Spring silently resolved cycles via three-level bean caching. This was hidden behaviour that could cause null fields during startup in unlucky ordering scenarios.\n\nStep 1 — Stop the bleeding: add spring.main.allow-circular-references=true to application.properties. This restores Spring Boot 2 behaviour and unblocks the team. Do not leave this permanently.\n\nStep 2 — Map the cycles: read each error message. Spring prints the exact chain: "beanA -> beanB -> beanA". Write it down for each of the five services.\n\nStep 3 — Fix each cycle structurally: for each cycle, identify what shared logic is causing both beans to need each other. Extract that logic into a new @Service that both depend on. This is not a Spring trick — it is a design improvement.\n\nStep 4 — Remove the flag: once all cycles are fixed, remove spring.main.allow-circular-references=true. The app should start without it.\n\nStep 5 — Prevention: add an ArchUnit test that asserts no package-level cycles exist. This catches regressions in CI before they reach production.',
      followUps: []
    },
    {
      question: 'Payment emails are being sent in production but customers are getting emails with fake/test content instead of real order details. Your @Primary EmailService is working. What do you investigate?',
      answer:
        'The most likely cause: a MockEmailService or StubEmailService somewhere has @Primary without being restricted to a @Profile("test"). In production, both the real and mock email services are registered, and @Primary on the mock silently overrides the real one.\n\nStep 1 — Confirm: add a startup log in your main config: logger.info("Active EmailService: {}", emailService.getClass().getName()). If it prints "MockEmailService" in production, you have confirmed the cause.\n\nStep 2 — Find the mock: search for classes that implement EmailService and have @Primary. Check whether they have @Profile("test") or @ConditionalOnProperty limiting them to test environments.\n\nStep 3 — Fix: add @Profile("test") to the mock class or move it entirely to src/test/java. The real EmailService should have @Primary if needed, or no @Primary if it is the only implementation in production.\n\nStep 4 — Prevent recurrence: add a startup health check or actuator endpoint that logs the active implementations of all critical interfaces (email, payment, notification). Set up an alert if any of them resolve to a class name containing "Mock", "Stub", or "Test" in a production environment.',
      followUps: []
    },
    {
      question: 'Your app starts correctly locally but throws NPE in @PostConstruct of PaymentService in production. The exact same code works on your machine. What do you investigate?',
      answer:
        'NPE in @PostConstruct means a field that should be @Autowired is null. Since it works locally but not in production, the dependency exists in your local environment but is missing or not loaded in production.\n\nStep 1 — Identify the null field: add a null check at the top of @PostConstruct and log which fields are null. Deploy with that log and read the production output.\n\nStep 2 — Check profiles: is the missing bean guarded by @Profile("dev") or @ConditionalOnProperty with a property that is set locally but not in production? Print the active profiles at startup: logger.info("Active profiles: {}", Arrays.toString(env.getActiveProfiles())).\n\nStep 3 — Check package scanning: is the missing bean in a package that is not scanned in production? Some configurations have explicit @ComponentScan packages that might exclude certain paths in the production build.\n\nStep 4 — Check conditional annotations: does the missing bean have @ConditionalOnClass or @ConditionalOnMissingBean that evaluates differently in production (e.g., a library present locally but not in the production image)?\n\nStep 5 — Print all registered beans at startup: applicationContext.getBeanDefinitionNames(). If the missing bean is not in the list, Spring never registered it — the reason will be in the conditions above.',
      followUps: []
    },
    {
      question: 'Your team has 200 Spring beans. Startup takes 45 seconds. The product team wants startup under 10 seconds. Where do you start?',
      answer:
        'Step 1 — Measure first: add a BeanPostProcessor that times every bean\'s initialization (record System.currentTimeMillis() in postProcessBeforeInitialization and log the delta in postProcessAfterInitialization). Run startup and identify the top 10 slowest beans.\n\nStep 2 — Classify: for each slow bean, ask: (a) is it doing network I/O in @PostConstruct (connecting to external services, downloading data)? (b) is it loading a large file or dataset? (c) is it doing unnecessary work that can be lazy?\n\nStep 3 — Fix network I/O: move any external connections in @PostConstruct to background threads. The bean reports itself as "initializing" until the background thread completes. Use a health indicator to signal readiness.\n\nStep 4 — Apply @Lazy selectively: beans that are rarely used (report generators, batch exporters, admin tools) can be @Lazy. They will not be created at startup, only on first use.\n\nStep 5 — Parallel startup: Spring Boot 2.4+ supports spring.main.lazy-initialization=true to make all beans lazy by default, and spring.threads.virtual.enabled=true (Boot 3.2+) to use virtual threads for parallel initialization. Test thoroughly — lazy initialization changes error timing from startup to first request.\n\nStep 6 — Reduce component scan scope: narrow @ComponentScan to specific packages instead of scanning the entire classpath. Fewer candidates to scan = faster startup.',
      followUps: []
    },
    {
      question: 'A junior developer on your team puts business logic in a constructor that uses an @Autowired field. It works in their Mockito unit test but throws NPE in the full Spring integration test. Explain what you would teach them.',
      answer:
        'Teach them the injection order first: constructor runs → @Autowired fields set → @PostConstruct runs. In the constructor, @Autowired fields are always null. The Mockito test "worked" because @InjectMocks bypasses Spring\'s normal creation order and can satisfy fields in different ways. The integration test uses Spring\'s real lifecycle and correctly shows the NPE.\n\nThe rule to communicate: the constructor is only for receiving constructor parameters and assigning them to fields. Any logic that needs @Autowired fields goes in @PostConstruct.\n\nThe fix to show: move the logic from the constructor to a @PostConstruct method. Show them both run and produce identical results — just at different lifecycle phases.\n\nThe deeper lesson: if you find yourself needing @Autowired fields in a constructor, it usually means the dependency should be a constructor parameter instead. That is the correct approach: use constructor injection so the dependency is available at construction time without any lifecycle tricks.\n\nPrevention: add the rule to your team\'s code review checklist and add an IntelliJ inspection or ArchUnit rule that flags any method call on an @Autowired field inside a constructor.',
      followUps: []
    }
  ],

  wrongAnswers: [
    {
      wrong: '@PostConstruct runs right after the constructor, before any @Autowired fields are set.',
      correction: 'The opposite: Spring sets ALL @Autowired fields first, then calls @PostConstruct. That is the entire point of @PostConstruct — it is a safe zone where all your dependencies are already available. If it ran before injection, you could never use your dependencies in it.',
      whyBelivedWrong: '"PostConstruct" sounds like "immediately after construction." It actually means "after the bean is fully constructed," which includes injection. The bean is not "fully constructed" until all its dependencies are provided.'
    },
    {
      wrong: '@PreDestroy is called for all Spring beans, including prototype-scoped ones, on application shutdown.',
      correction: 'Spring calls @PreDestroy only for SINGLETON beans. Prototype beans are handed over to the caller after creation and Spring forgets about them — no reference, no cleanup call. If a prototype holds a resource (connection, thread), the caller must close it. This is one of the most common resource leaks in Spring applications.',
      whyBelivedWrong: 'Developers assume Spring tracks everything it creates. It tracks singletons for their full lifetime. Prototypes only up to the moment of creation — after that, ownership transfers to the caller.'
    },
    {
      wrong: 'Adding @Lazy to one of two circularly-dependent beans fixes the circular dependency.',
      correction: '@Lazy hides the circular dependency by injecting a proxy that resolves the real bean lazily. Startup succeeds. But the design problem is still there — A still logically needs B and B still logically needs A. The real fix is to extract a third bean that both can depend on, breaking the circle structurally.',
      whyBelivedWrong: 'When @Lazy is added, the startup error disappears and the app works. This looks like a fix. But "no startup error" does not mean "the design is correct." The circular relationship is still in the code.'
    },
    {
      wrong: '@Scope("prototype") means Spring creates a new instance every time a method is called on the bean.',
      correction: 'Prototype scope means Spring creates a new instance every time someone REQUESTS the bean — via @Autowired injection, getBean(), or ObjectFactory.getObject(). Once you have a reference to a prototype instance, all method calls on that same reference use the same object. A new instance is only created when you ask for one.',
      whyBelivedWrong: 'The word "prototype" combined with the mental model of "fresh per operation" leads to this confusion. Scope controls bean acquisition, not method invocation.'
    },
    {
      wrong: '@DependsOn("beanX") injects beanX into your bean.',
      correction: '@DependsOn only controls initialization ORDER. It tells Spring to initialize beanX before the current bean. No injection happens. No field is set. After startup, your bean has no programmatic reference to beanX. If you also need to call methods on beanX, you must @Autowire it separately.',
      whyBelivedWrong: '"Depends on" in everyday English implies needing something — which implies having a reference to it. In Spring, "depends on" means only "initialize this first." Injection is a completely separate mechanism.'
    },
    {
      wrong: 'Singleton scope in Spring means only one instance of the class can exist in the entire JVM.',
      correction: 'Spring singleton means one instance per ApplicationContext — not per JVM. If you have two Spring contexts (common in web apps with a root context and a child context, or in tests), each context creates its own singleton. Also, nothing stops you from calling `new MyService()` outside of Spring — Spring\'s singleton scope only applies to beans Spring manages.',
      whyBelivedWrong: 'The classic Singleton design pattern (GoF) means one per JVM. Spring borrowed the word but scoped it to the container, not the JVM.'
    },
    {
      wrong: 'You must write @Autowired on a constructor for Spring to use it for dependency injection.',
      correction: 'Since Spring 4.3, @Autowired is not required on a constructor if the class has only one constructor. Spring automatically uses the single constructor for injection. @Autowired is only needed when there are multiple constructors and you want to tell Spring which one to use.',
      whyBelivedWrong: 'All old Spring tutorials and documentation (pre-4.3) showed @Autowired on constructors because it was required then. Many learning resources have not been updated.'
    },
    {
      wrong: '@Lazy makes a bean prototype-scoped — each @Autowired injection gets a new instance.',
      correction: '@Lazy on a @Service class means the SINGLETON is not created at startup — it is created on the first request. It is still a singleton — one instance is created, cached, and shared forever after that first creation. @Scope("prototype") is what gives you a new instance per request. The two are completely independent. You can have a @Lazy @Scope("prototype") bean, which is lazily-created on first request and then discarded (not cached) because it is prototype.',
      whyBelivedWrong: 'Both @Lazy and @Scope("prototype") involve "not creating the bean eagerly at startup." The distinction is whether the instance is cached after creation (singleton, even with @Lazy) or always discarded (prototype).'
    }
  ]
};

// ─── MCQ (30 questions: 8 basic, 12 intermediate, 10 advanced) ─────────────────
const mcq = {
  type: 'mcq',
  title: 'Quiz — Spring Bean Lifecycle & Advanced DI',
  description: 'Test your understanding with 30 questions across basic, intermediate, and advanced levels.',
  questions: [
    // ── BASIC (8) ──────────────────────────────────────────────────────────────
    {
      id: 1, level: 'basic', category: 'theory',
      question: 'What is a Spring bean?',
      options: {
        A: 'A special Java class that must extend a Spring base class',
        B: 'A Java object that Spring creates and manages for you',
        C: 'A configuration file that describes database connections',
        D: 'A method annotated with @Bean that returns a primitive value'
      },
      answer: 'B',
      explanation: 'A bean is just a regular Java object that Spring manages. You tell Spring to manage a class by adding @Service, @Component, @Repository, or @Controller. Spring creates an instance and makes it available for injection everywhere it is needed.'
    },
    {
      id: 2, level: 'basic', category: 'theory',
      question: 'In what order do these Spring lifecycle events happen?',
      options: {
        A: '@PostConstruct → constructor → @Autowired injection',
        B: '@Autowired injection → constructor → @PostConstruct',
        C: 'constructor → @Autowired injection → @PostConstruct',
        D: 'constructor → @PostConstruct → @Autowired injection'
      },
      answer: 'C',
      explanation: 'Always: constructor first (creates the object), then @Autowired injection (fills in the dependencies), then @PostConstruct (safe to use those dependencies now). This is why @PostConstruct exists — it is called after everything is wired up and ready.'
    },
    {
      id: 3, level: 'basic', category: 'theory',
      question: 'What is @PostConstruct used for?',
      options: {
        A: 'To mark a method that runs before the constructor',
        B: 'To mark a method that runs after all @Autowired fields are set',
        C: 'To declare the bean\'s scope as singleton',
        D: 'To replace the constructor entirely'
      },
      answer: 'B',
      explanation: '@PostConstruct marks a method Spring calls after the bean is created and all @Autowired fields are injected. It is the right place for any setup that needs your injected dependencies — loading a cache, opening a connection, validating configuration.'
    },
    {
      id: 4, level: 'basic', category: 'theory',
      question: 'What does @PreDestroy do?',
      options: {
        A: 'Runs before the constructor to pre-initialise fields',
        B: 'Runs when the application context is closed, for cleanup',
        C: 'Prevents the bean from being destroyed under any circumstances',
        D: 'Runs before @PostConstruct to configure default values'
      },
      answer: 'B',
      explanation: '@PreDestroy marks a method Spring calls when the application context is closing (shutdown). Use it to release resources: close connections, stop threads, flush unsaved data. Note: it is NOT called for prototype-scoped beans.'
    },
    {
      id: 5, level: 'basic', category: 'theory',
      question: 'What is the default scope of a Spring bean?',
      options: {
        A: 'prototype — a new instance per injection point',
        B: 'request — a new instance per HTTP request',
        C: 'singleton — one shared instance for the whole application',
        D: 'session — one instance per user session'
      },
      answer: 'C',
      explanation: 'By default, Spring creates exactly one instance of each bean and shares it with everyone who asks for it. This is singleton scope. It is the right choice for stateless services. Use prototype only when the bean must hold state unique to each caller.'
    },
    {
      id: 6, level: 'basic', category: 'theory',
      question: 'You have two beans implementing the same interface and you @Autowire the interface. Spring throws an error. What annotation resolves this?',
      options: {
        A: '@Scope("prototype") on both implementations',
        B: '@Primary on one implementation as the default choice',
        C: '@PostConstruct on the interface',
        D: '@DependsOn between the two implementations'
      },
      answer: 'B',
      explanation: 'When multiple beans match a type, Spring cannot choose — it throws NoUniqueBeanDefinitionException. Adding @Primary to one bean tells Spring "this is the default." The other is still available by name using @Qualifier.'
    },
    {
      id: 7, level: 'basic', category: 'code',
      question: 'What will this @PostConstruct method print?\n\n@Service\npublic class MyService {\n    @Value("${app.name:Satyverse}")\n    private String name;\n    \n    @PostConstruct\n    public void init() {\n        System.out.println("Name: " + name);\n    }\n}',
      options: {
        A: 'Name: null (because @Value is set after @PostConstruct)',
        B: 'Name: Satyverse (the default value from @Value)',
        C: 'An exception because @Value and @PostConstruct cannot be used together',
        D: 'Nothing — @PostConstruct only runs if there is an error'
      },
      answer: 'B',
      explanation: '@Value is injected before @PostConstruct runs. Since no app.name property is configured in this example, the default value "Satyverse" from @Value("${app.name:Satyverse}") is used. By the time init() runs, name is already "Satyverse".'
    },
    {
      id: 8, level: 'basic', category: 'code',
      question: 'Which of these is the correct way to do constructor injection in modern Spring Boot (4.3+)?',
      options: {
        A: '@Service public class A { @Autowired private B b; }',
        B: '@Service public class A { private final B b; public A(B b) { this.b = b; } }',
        C: '@Service public class A { private B b; public void setB(@Autowired B b) { this.b = b; } }',
        D: '@Service public class A { @Inject private B b; }'
      },
      answer: 'B',
      explanation: 'Since Spring 4.3, a single constructor is automatically used for injection — no @Autowired needed. Option B shows correct constructor injection: the field is final (cannot be changed), the dependency is explicit in the constructor signature, and the class works without Spring in tests.'
    },

    // ── INTERMEDIATE (12) ──────────────────────────────────────────────────────
    {
      id: 9, level: 'intermediate', category: 'theory',
      question: 'A class has @Service and @Scope("prototype"). You @Autowire it into a singleton service. How many instances are created throughout the app lifetime?',
      options: {
        A: 'One per call to any method of the singleton service',
        B: 'One new instance per HTTP request',
        C: 'Exactly one — injected at singleton creation time and reused',
        D: 'Zero — you cannot inject a prototype into a singleton'
      },
      answer: 'C',
      explanation: 'This is the scope mismatch bug. The singleton is created once. At that moment, Spring injects one prototype instance. That same instance stays in the singleton\'s field forever. Prototype scope is effectively broken. Fix: inject ObjectFactory<T> and call getObject() each time you need a fresh instance.'
    },
    {
      id: 10, level: 'intermediate', category: 'theory',
      question: 'What is the difference between @Primary and @Qualifier?',
      options: {
        A: '@Primary is for classes, @Qualifier is for interfaces',
        B: '@Primary sets the default bean; @Qualifier selects a specific bean at an injection point',
        C: '@Primary makes a bean singleton; @Qualifier makes it prototype',
        D: 'They are identical — just two names for the same annotation'
      },
      answer: 'B',
      explanation: '@Primary marks one bean as the default for its type — Spring picks it for any unqualified @Autowired of that type. @Qualifier("name") at an injection point selects a specific bean by name, overriding @Primary. @Qualifier is more explicit and always wins.'
    },
    {
      id: 11, level: 'intermediate', category: 'theory',
      question: 'What happens when Spring encounters a circular dependency with constructor injection?',
      options: {
        A: 'Spring silently resolves it by using a three-level cache',
        B: 'The app starts but the circular beans are null until first use',
        C: 'Spring throws BeanCurrentlyInCreationException at startup',
        D: 'Spring creates both beans with empty constructors and fills them in later'
      },
      answer: 'C',
      explanation: 'Constructor injection + circular dependency = startup failure. Spring cannot call A\'s constructor without B, and cannot call B\'s constructor without A. It throws BeanCurrentlyInCreationException immediately. This is the right and safe behavior — fail fast at startup, not silently during a request.'
    },
    {
      id: 12, level: 'intermediate', category: 'theory',
      question: 'How does @Transactional actually apply a transaction to your method?',
      options: {
        A: 'Spring modifies your .class bytecode at compile time to add transaction code',
        B: 'Spring wraps your bean in a proxy; callers go through the proxy which manages the transaction',
        C: 'Spring intercepts the JVM method call using a Java agent at runtime',
        D: 'You must manually call TransactionManager.begin() inside the @Transactional method'
      },
      answer: 'B',
      explanation: 'Spring creates a CGLIB proxy (a generated subclass) of your class. Callers who @Autowire your service actually get the proxy. When they call a @Transactional method, the proxy starts the transaction, calls the real method, then commits or rolls back. Self-invocation (this.method()) bypasses the proxy and skips transaction management.'
    },
    {
      id: 13, level: 'intermediate', category: 'code',
      question: 'What does this code print?\n\n@Component @Scope("prototype")\nclass Token { private String id = UUID.randomUUID().toString(); String getId() { return id; } }\n\n@Service class TokenService {\n    @Autowired Token token;\n    String get() { return token.getId(); }\n}\n// Called twice:\n// tokenService.get()\n// tokenService.get()',
      options: {
        A: 'Two different UUIDs because Token is prototype',
        B: 'The same UUID both times because of scope mismatch',
        C: 'An exception because prototype beans cannot be @Autowired',
        D: 'null both times because @Scope("prototype") disables @Autowired'
      },
      answer: 'B',
      explanation: 'Scope mismatch. TokenService is a singleton — Spring injects one Token instance when the singleton is created. Both calls to get() use that same Token instance with the same UUID. Fix: inject ObjectFactory<Token> and call getObject() in get().'
    },
    {
      id: 14, level: 'intermediate', category: 'code',
      question: 'Which method call correctly gets a fresh prototype instance every time from ObjectFactory?',
      options: {
        A: 'factory.getInstance()',
        B: 'factory.create()',
        C: 'factory.getObject()',
        D: 'factory.newBean()'
      },
      answer: 'C',
      explanation: 'ObjectFactory<T> has one method: getObject(). Each call to getObject() asks Spring to create and return a new prototype instance. This is the correct fix for scope mismatch — inject ObjectFactory<T> instead of T directly, and call getObject() each time you need a fresh instance.'
    },
    {
      id: 15, level: 'intermediate', category: 'theory',
      question: 'What does @DependsOn("beanX") on a service do?',
      options: {
        A: 'Injects beanX into the service as a field named "beanX"',
        B: 'Tells Spring to initialize beanX before this service, without injecting it',
        C: 'Makes this service a dependency of beanX',
        D: 'Declares that this service and beanX must be the same type'
      },
      answer: 'B',
      explanation: '@DependsOn is purely about initialization ORDER. Spring initialises the named bean first, then initialises the annotated bean. No injection happens. No field is populated. Use it when you need a side effect (migration ran, topics created) but do not need to call methods on the other bean directly.'
    },
    {
      id: 16, level: 'intermediate', category: 'theory',
      question: 'A @Transactional method is called from within the same class using "this.method()". What happens?',
      options: {
        A: 'The transaction works normally — Spring detects the same-class call and handles it',
        B: 'The transaction is ignored — the call bypasses the proxy',
        C: 'Spring throws an exception because self-invocation is not allowed',
        D: 'A nested transaction is automatically created'
      },
      answer: 'B',
      explanation: '@Transactional works through a proxy. "this.method()" calls directly on the real object — the proxy is bypassed. No proxy call = no transaction management. The method runs without a transaction. Fix: move the @Transactional method to a separate class.'
    },
    {
      id: 17, level: 'intermediate', category: 'code',
      question: 'What is wrong with this code?\n\n@Service public class CacheLoader {\n    @Autowired DataRepository repo;\n    \n    public CacheLoader() {\n        List<String> data = repo.findAll(); // use repo in constructor\n    }\n}',
      options: {
        A: 'Nothing — @Autowired fields are available in the constructor',
        B: 'repo is null in the constructor — @Autowired fields are set after construction',
        C: 'DataRepository cannot be @Autowired into a constructor-using class',
        D: 'The constructor must be private for Spring to work'
      },
      answer: 'B',
      explanation: '@Autowired fields are set AFTER the constructor runs. Inside the constructor, repo is null. repo.findAll() throws NullPointerException. Fix: move the data loading to a @PostConstruct method — by then repo is injected and ready.'
    },
    {
      id: 18, level: 'intermediate', category: 'theory',
      question: 'Spring Boot 3 changed circular dependency handling compared to Spring Boot 2. What changed?',
      options: {
        A: 'Circular dependencies are now automatically fixed by Spring without any developer action',
        B: 'Circular dependencies via field/setter injection now throw by default instead of being silently resolved',
        C: 'Constructor injection now supports circular dependencies that it did not before',
        D: 'Spring Boot 3 removed the concept of circular dependencies entirely'
      },
      answer: 'B',
      explanation: 'Spring Boot 3 (Framework 6) changed the default: circular dependencies via field or setter injection now throw an exception at startup. Previously Spring silently resolved them using internal caching, which masked design problems and could cause null fields. You can restore old behaviour with spring.main.allow-circular-references=true as a temporary measure while fixing the actual design.'
    },
    {
      id: 19, level: 'intermediate', category: 'theory',
      question: 'What is BeanPostProcessor used for?',
      options: {
        A: 'To configure properties in application.properties before beans are created',
        B: 'To run code around every bean\'s initialization — used by @Transactional, @Async, and AOP',
        C: 'To post a message to a message queue after each bean is initialized',
        D: 'To replace the ApplicationContext with a lighter version'
      },
      answer: 'B',
      explanation: 'BeanPostProcessor is a Spring hook that runs for every bean — before and after initialization. Spring\'s own features (@Transactional, @Async, @Cacheable, AOP aspects) work by replacing your bean with a CGLIB proxy inside a BeanPostProcessor. You can write your own to add cross-cutting behaviour across all beans without modifying each class.'
    },
    {
      id: 20, level: 'intermediate', category: 'code',
      question: 'You have StripeGateway (@Primary) and PayPalGateway (@Service("paypal")). How do you inject PayPal specifically?',
      options: {
        A: '@Autowired @Qualifier("paypal") private PaymentGateway gateway;',
        B: '@Autowired @Primary("paypal") private PaymentGateway gateway;',
        C: '@Autowired @Scope("paypal") private PaymentGateway gateway;',
        D: '@Autowired("paypal") private PaymentGateway gateway;'
      },
      answer: 'A',
      explanation: '@Qualifier("paypal") at the injection point tells Spring to use the bean named "paypal" — overriding @Primary. The bean name matches the value in @Service("paypal"). @Qualifier always wins over @Primary at a specific injection point.'
    },

    // ── ADVANCED (10) ─────────────────────────────────────────────────────────
    {
      id: 21, level: 'advanced', category: 'theory',
      question: 'In which lifecycle phase does Spring create CGLIB proxies for @Transactional beans?',
      options: {
        A: 'During BeanFactoryPostProcessor, before any bean is instantiated',
        B: 'During postProcessBeforeInitialization, before @PostConstruct',
        C: 'During postProcessAfterInitialization, after all init callbacks complete',
        D: 'During SmartInitializingSingleton, after all singletons are ready'
      },
      answer: 'C',
      explanation: 'AbstractAutoProxyCreator (a BeanPostProcessor) creates CGLIB proxies in postProcessAfterInitialization — after the bean has completed all its initialization (constructor, injection, @PostConstruct, afterPropertiesSet). The proxy replaces the raw bean in the context. All subsequent @Autowired injections get the proxy, not the original.'
    },
    {
      id: 22, level: 'advanced', category: 'theory',
      question: 'What is the difference between BeanFactoryPostProcessor and BeanPostProcessor?',
      options: {
        A: 'BeanFactoryPostProcessor modifies bean definitions before instantiation; BeanPostProcessor wraps instances after instantiation',
        B: 'BeanFactoryPostProcessor creates beans; BeanPostProcessor deletes beans',
        C: 'BeanFactoryPostProcessor runs after @PostConstruct; BeanPostProcessor runs before',
        D: 'They are identical — both modify bean instances at different times'
      },
      answer: 'A',
      explanation: 'BeanFactoryPostProcessor runs before any bean is created — it modifies BeanDefinition metadata (property values, scope, class). PropertySourcesPlaceholderConfigurer (resolves ${...}) is an example. BeanPostProcessor runs per-bean after creation — it can wrap or replace the instance. AOP proxy creation is a BeanPostProcessor. Key distinction: one modifies definitions, the other modifies instances.'
    },
    {
      id: 23, level: 'advanced', category: 'theory',
      question: 'When does SmartInitializingSingleton.afterSingletonsInstantiated() run?',
      options: {
        A: 'After each individual singleton\'s @PostConstruct completes',
        B: 'Once, after ALL singleton beans have finished their full initialization',
        C: 'Before any singleton beans are created, for pre-flight checks',
        D: 'On each HTTP request after all singletons are available'
      },
      answer: 'B',
      explanation: 'afterSingletonsInstantiated() fires exactly once, after every singleton bean has completed its full lifecycle including BeanPostProcessor wrapping. This is later than @PostConstruct (which fires per-bean). Use it for validation that requires the full application context to be ready — like checking that all beans of a type are correctly configured.'
    },
    {
      id: 24, level: 'advanced', category: 'code',
      question: 'A BeanPostProcessor\'s postProcessAfterInitialization returns null. What happens?',
      options: {
        A: 'The bean is treated as optional and skipped without error',
        B: 'Spring removes the bean from the context silently',
        C: 'Spring throws a NullPointerException when trying to inject that bean elsewhere',
        D: 'Spring replaces the bean with a new default instance of the same type'
      },
      answer: 'C',
      explanation: 'Spring expects a valid bean back from both BeanPostProcessor methods. Returning null tells Spring the bean is null. When other beans try to @Autowire it, they receive null — causing NullPointerException at injection or at the first method call. Always return the bean (or a valid replacement proxy) from BeanPostProcessor methods.'
    },
    {
      id: 25, level: 'advanced', category: 'theory',
      question: 'Why can @Transactional not be applied to a method in a BeanPostProcessor?',
      options: {
        A: 'BeanPostProcessors do not support annotations',
        B: 'BeanPostProcessors are instantiated before the AOP proxy infrastructure that creates @Transactional proxies',
        C: '@Transactional is automatically applied to all BeanPostProcessors by default',
        D: 'BeanPostProcessors can use @Transactional but only with REQUIRES_NEW propagation'
      },
      answer: 'B',
      explanation: 'BeanPostProcessors are created very early — before most of the container infrastructure, including the AOP creators that add @Transactional proxies. A BPP is never itself proxied. Spring logs a warning: "Bean X of type BeanPostProcessor is not eligible for getting processed by all BeanPostProcessors." Move transactional logic to a regular service that the BPP delegates to.'
    },
    {
      id: 26, level: 'advanced', category: 'code',
      question: 'You need to inject a prototype bean into a singleton so that each call gets a fresh instance. Which approach keeps the calling code cleanest (no changes needed at call sites)?',
      options: {
        A: 'Inject ObjectFactory<T> and call getObject() at each call site',
        B: 'Inject Provider<T> and call get() at each call site',
        C: 'Annotate the prototype with @Scope(proxyMode = ScopedProxyMode.TARGET_CLASS)',
        D: 'Annotate the singleton with @Lazy'
      },
      answer: 'C',
      explanation: 'With ScopedProxyMode.TARGET_CLASS, Spring injects a CGLIB proxy into the singleton. Every call through the proxy (like protBean.doSomething()) transparently creates a new prototype instance. No changes needed at call sites — they keep using the injected field normally. The downside: the prototype class cannot be final, and the proxy adds a small overhead.'
    },
    {
      id: 27, level: 'advanced', category: 'theory',
      question: 'In what order are @PostConstruct, InitializingBean.afterPropertiesSet(), and a custom initMethod called?',
      options: {
        A: 'initMethod → afterPropertiesSet() → @PostConstruct',
        B: '@PostConstruct → afterPropertiesSet() → initMethod',
        C: 'afterPropertiesSet() → @PostConstruct → initMethod',
        D: 'All three are called simultaneously'
      },
      answer: 'B',
      explanation: '@PostConstruct is processed by CommonAnnotationBeanPostProcessor in the postProcessBeforeInitialization phase — so it fires first. afterPropertiesSet() is called next by the container. The custom initMethod declared via @Bean(initMethod="...") fires last. For new code, use only @PostConstruct. Use initMethod for third-party classes you cannot annotate.'
    },
    {
      id: 28, level: 'advanced', category: 'code',
      question: 'context.getBean("myFactory") returns a Product, not the FactoryBean. How do you get the FactoryBean itself?',
      options: {
        A: 'context.getBean("myFactory", FactoryBean.class)',
        B: 'context.getBean("&myFactory")',
        C: 'context.getFactoryBean("myFactory")',
        D: 'context.getBean("myFactory$factory")'
      },
      answer: 'B',
      explanation: 'By design, getBean("name") returns the FactoryBean\'s product (what getObject() returns). To get the FactoryBean itself, prefix the name with "&": context.getBean("&myFactory"). The ampersand is the "dereference operator" for FactoryBeans. This is a frequently-asked trivia question in Spring interviews.'
    },
    {
      id: 29, level: 'advanced', category: 'theory',
      question: 'ApplicationContextAware and @Autowired ApplicationContext do the same thing. Which should you use in modern Spring Boot?',
      options: {
        A: 'ApplicationContextAware — it is the official Spring interface and must always be used',
        B: '@Autowired ApplicationContext — simpler and the preferred modern approach since Spring 4.3',
        C: 'Neither — accessing the ApplicationContext from a bean is always wrong',
        D: 'ApplicationContextAware in @Service; @Autowired in @Component'
      },
      answer: 'B',
      explanation: 'Both work identically. Since Spring 4.3, @Autowiring ApplicationContext directly is fully supported and cleaner — no interface to implement, no setBeanName-style callback. ApplicationContextAware is the older style common in pre-annotation Spring code. In modern Spring Boot, @Autowired ApplicationContext is the idiomatic choice for application code.'
    },
    {
      id: 30, level: 'advanced', category: 'theory',
      question: 'For which scope does Spring manage the full lifecycle including @PreDestroy cleanup?',
      options: {
        A: 'Both singleton and prototype',
        B: 'Only prototype',
        C: 'Only singleton',
        D: 'All scopes: singleton, prototype, request, session'
      },
      answer: 'C',
      explanation: 'Spring manages the full lifecycle — including @PreDestroy — only for singleton-scoped beans. For prototype beans, Spring creates the instance and hands it to the caller, then releases its reference. With no reference, it cannot call @PreDestroy. For request/session scoped beans, cleanup happens at the end of the request/session via a scope implementation, not via @PreDestroy in the traditional sense.'
    }
  ]
};

// ─── CHEATSHEET (markdown table, same format as Day 38) ───────────────────────
const cheatsheet = {
  type: 'cheatsheet',
  title: 'Quick Reference — Spring Bean Lifecycle & Advanced DI',
  content:
    '| Topic | Rule of thumb | Interview one-liner |\n' +
    '|-------|---------------|---------------------|\n' +
    '| @PostConstruct | Safe setup zone — all @Autowired fields are ready here | "If you need injected fields during setup, put the code in @PostConstruct, not the constructor" |\n' +
    '| @PreDestroy | Release resources on shutdown — close connections, stop threads | "Prototype beans are NOT cleaned up by Spring — the caller is responsible" |\n' +
    '| Constructor injection | List all required dependencies as constructor params; fields become final | "Constructor injection makes your class testable without Spring and dependencies visible at a glance" |\n' +
    '| @Autowired in constructor | Not needed since Spring 4.3 if there is only one constructor | "Spring auto-detects a single constructor — @Autowired is optional" |\n' +
    '| Scope: singleton | Default. One shared instance. Good for stateless services. | "Never store per-user state in a singleton field — it leaks between users" |\n' +
    '| Scope: prototype | New instance on every request. Spring does NOT call @PreDestroy. | "Prototype in singleton via @Autowired = scope mismatch bug — use ObjectFactory" |\n' +
    '| ObjectFactory<T> | Inject this instead of T directly; call getObject() for a fresh prototype | "getObject() is the only method — each call creates a new prototype instance" |\n' +
    '| @Primary | Default bean when multiple match; overridden by @Qualifier | "Never @Primary a test stub without @Profile — it will silence real services in production" |\n' +
    '| @Qualifier | Explicit named injection; always wins over @Primary | "@Qualifier beats @Primary at any specific injection point" |\n' +
    '| @DependsOn | Order beans without injection — for side effects like migrations | "@DependsOn orders, it does not inject. To call methods, you still need @Autowired" |\n' +
    '| @Lazy | Defer singleton creation to first use; avoid for startup-critical beans | "Lazy does not make a bean prototype — it is still a singleton, just created later" |\n' +
    '| Circular dependency | A → B → A fails at startup with constructor injection | "Extract a shared third bean C that both A and B depend on — @Lazy is a temporary patch, not a fix" |\n' +
    '| @Transactional proxy | Callers get a proxy, not the real object | "this.method() bypasses the proxy — @Transactional is silently ignored on self-invocation" |\n' +
    '| BeanPostProcessor | Runs around every bean\'s init — how AOP and @Transactional work | "Always return the bean from both methods — returning null causes NullPointerException" |\n' +
    '| SmartInitializingSingleton | afterSingletonsInstantiated() fires once, after ALL singletons are ready | "Safer than ContextRefreshedEvent for startup validation — fires exactly once per context" |'
};

// ─── UPDATE THE DAY FILE ───────────────────────────────────────────────────────
// Remove the old separate conceptual, codeBased, seniorScenario, wrongAnswers sections
// and replace with interview + mcq + cheatsheet in Day 38 format

day.sections = day.sections.filter(s =>
  !['conceptual', 'codeBased', 'seniorScenario', 'wrongAnswers', 'cheatsheet', 'exercise'].includes(s.type)
);

// Insert exercise, interview, mcq, cheatsheet before video
const videoIdx = day.sections.findIndex(s => s.type === 'video');
day.sections.splice(videoIdx, 0, exercise, interview, mcq, cheatsheet);

writeFileSync(FILE, JSON.stringify(day, null, 2), 'utf-8');

console.log('Written:', FILE);
console.log('Sections:', day.sections.map(s => s.type));
console.log('Conceptual Q&As:', interview.conceptual.length);
console.log('CodeBased Q&As:', interview.codeBased.length);
console.log('SeniorScenario:', interview.seniorScenario.length);
console.log('WrongAnswers:', interview.wrongAnswers.length);
console.log('MCQ questions:', mcq.questions.length);
console.log('MCQ by level:', mcq.questions.reduce((a,q) => { a[q.level]=(a[q.level]||0)+1; return a; }, {}));
