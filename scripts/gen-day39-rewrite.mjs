import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '../public/data/days/phase5-day39.json');

// ─── WHY ──────────────────────────────────────────────────────────────────────
const why =
  'You already know how to create objects in Java. You write `new EmailService()` and it works. ' +
  'So why does Spring exist? Why does it manage objects for you?\n\n' +
  'Imagine you are building an online shopping app. You have an `OrderService` that needs an `EmailService` to send confirmation emails, ' +
  'and that `EmailService` needs a `TemplateEngine` to format the email, and that `TemplateEngine` needs a `FileLoader` to read templates from disk. ' +
  'Now every time you write `new OrderService()`, you also have to write:\n' +
  '`new OrderService(new EmailService(new TemplateEngine(new FileLoader())))`\n\n' +
  'That is four classes chained together. Add ten more services and it becomes a nightmare. ' +
  'Worse, if you want to swap the real `EmailService` with a fake one during testing, you have to change code in many places. ' +
  'This is the problem Spring solves. You tell Spring what your classes need, and Spring builds and connects everything for you automatically.\n\n' +
  'But Spring cannot just create your object and hand it over immediately. ' +
  'Think of it like hiring a new employee. First the company decides to hire someone (that\'s the bean definition). ' +
  'Then they actually hire the person (construction). Then they give them a laptop, access card, and team introduction (injection). ' +
  'Then the employee goes through an orientation before starting real work (PostConstruct). ' +
  'Then they actually do their job (the bean is in use). ' +
  'When they leave the company, there is an exit process — hand back the laptop, revoke access (PreDestroy). ' +
  'This entire sequence is the Spring bean lifecycle. Every single object Spring manages goes through this process.\n\n' +
  'Understanding this lifecycle matters the moment things go wrong. ' +
  'If your app crashes at startup and says "NullPointerException in PostConstruct", that means your employee tried to start working before getting their laptop. ' +
  'If your app leaks database connections, that means the exit process never ran properly. ' +
  'Once you see the lifecycle clearly, these errors stop being mysterious and start having obvious fixes.\n\n' +
  'Dependency Injection (DI) is the specific mechanism Spring uses to "hand over the laptop". ' +
  'Instead of your class creating its own dependencies with `new`, Spring injects them. ' +
  'This sounds fancy but it is just Spring calling your constructor or setting your fields before handing the object to you. ' +
  'The advanced DI features — @Qualifier, @Primary, @Lazy, scope — are just answers to questions that naturally come up: ' +
  '"What if I have two EmailService implementations?", "What if creating this bean is expensive?", "What if I need a fresh object for every request?"\n\n' +
  'By the end of this day, you will understand exactly what Spring does between the moment you write @Service and the moment your method gets called. ' +
  'No more framework magic — just a clear, step-by-step process you can reason about, debug, and explain in an interview.';

// ─── THEORY ───────────────────────────────────────────────────────────────────
const theory =
  '### Start here: what is a "bean"?\n\n' +
  'In Spring, a **bean** is just a Java object that Spring creates and manages for you. ' +
  'That is the entire definition. If you annotate a class with @Component, @Service, @Repository, or @Controller, ' +
  'you are telling Spring: "Please create one instance of this class and keep it available for the whole application."\n\n' +
  'By default, Spring creates exactly **one** instance per bean (called singleton scope) and reuses it everywhere. ' +
  'So when five different classes all @Autowire the same EmailService, they all get the exact same object — ' +
  'Spring creates it once and shares it.\n\n' +
  '**The simplest possible Spring bean:**\n' +
  '```java\n' +
  '@Service\n' +
  'public class GreetingService {\n' +
  '    public String greet(String name) {\n' +
  '        return "Hello, " + name;\n' +
  '    }\n' +
  '}\n' +
  '```\n' +
  'That is a bean. Spring creates it, and anyone can @Autowire it.\n\n' +

  '### Dependency Injection — the "handing over" step\n\n' +
  'Dependency Injection means Spring automatically provides the objects your class needs. ' +
  'Instead of you writing `this.emailService = new EmailService()` inside your class, ' +
  'Spring looks at your constructor and says "this class needs an EmailService, let me find one and pass it in."\n\n' +
  '**Before Spring (manual, painful):**\n' +
  '```java\n' +
  'public class OrderService {\n' +
  '    private EmailService emailService;\n' +
  '    public OrderService() {\n' +
  '        this.emailService = new EmailService(); // you create it yourself\n' +
  '    }\n' +
  '}\n' +
  '```\n' +
  '**With Spring (automatic, clean):**\n' +
  '```java\n' +
  '@Service\n' +
  'public class OrderService {\n' +
  '    private final EmailService emailService;\n' +
  '    public OrderService(EmailService emailService) { // Spring passes it in\n' +
  '        this.emailService = emailService;\n' +
  '    }\n' +
  '}\n' +
  '```\n' +
  'Spring sees the constructor, finds the EmailService bean it already created, and passes it automatically. ' +
  'You never call `new EmailService()`. Spring handles it.\n\n' +

  '### The lifecycle — what Spring does between @Service and your method running\n\n' +
  'Here is the full sequence Spring follows every time it creates a bean. ' +
  'Read it like a recipe:\n\n' +
  '**Step 1 — Read the recipe (BeanDefinition)**\n' +
  'Spring scans your code and finds all @Service, @Component etc. classes. ' +
  'It builds a recipe for each one: what class is it, what does it need, how should it be created. ' +
  'At this point, no objects exist yet — Spring is just planning.\n\n' +
  '**Step 2 — Adjust the recipe if needed (BeanFactoryPostProcessor)**\n' +
  'Before creating anything, Spring allows recipe modifications. ' +
  'This is how ${property.value} placeholders in your @Value annotations get replaced with real values from application.properties. ' +
  'You rarely write this yourself, but Spring Boot uses it heavily internally.\n\n' +
  '**Step 3 — Build the object (Constructor)**\n' +
  'Spring calls your constructor. The object exists now, but its fields are empty. ' +
  'If you print `emailService` inside the constructor, it is null.\n\n' +
  '**Step 4 — Give it what it needs (Injection)**\n' +
  'Spring fills in all @Autowired fields, @Value fields, and setter injections. ' +
  'After this step, all dependencies are populated.\n\n' +
  '**Step 5 — Tell it who it is (Aware interfaces)**\n' +
  'Optional step. If your bean implements BeanNameAware, Spring tells it its own registered name. ' +
  'If it implements ApplicationContextAware, Spring gives it access to the whole container. ' +
  'Most beans never need this.\n\n' +
  '**Step 6 — Let it warm up (@PostConstruct)**\n' +
  'If you have a method annotated @PostConstruct, Spring calls it now. ' +
  'This is your chance to do setup work that needs the injected dependencies — ' +
  'open a connection, preload a cache, validate configuration. ' +
  'This is the most commonly used lifecycle hook.\n\n' +
  '**Step 7 — Wrap it if needed (BeanPostProcessor)**\n' +
  'Spring checks if any BeanPostProcessors want to wrap this bean. ' +
  'This is where @Transactional, @Async, and AOP features work — ' +
  'Spring replaces your bean with a proxy that adds extra behaviour. ' +
  'From this point on, when someone @Autowires this service, they get the proxy, not your original object.\n\n' +
  '**Step 8 — Bean is ready and in use**\n' +
  'Your bean is now available. Every @Autowired injection of this type gets this (possibly proxied) instance.\n\n' +
  '**Step 9 — Cleanup on shutdown (@PreDestroy)**\n' +
  'When the application shuts down, Spring calls @PreDestroy methods. ' +
  'Close database connections, stop background threads, flush buffers.\n\n' +

  '### @PostConstruct — the most important lifecycle hook\n\n' +
  '@PostConstruct marks a method that Spring calls after the bean is fully built and all dependencies are injected.\n\n' +
  '**When you need it:** anything that requires your injected fields to be ready — opening connections, loading data, validating config.\n\n' +
  '**Golden rule:** never do this work in the constructor. In the constructor, your @Autowired fields are still null. In @PostConstruct, they are all populated.\n\n' +
  '```java\n' +
  '@Service\n' +
  'public class CacheService {\n' +
  '    @Autowired\n' +
  '    private DatabaseRepository db;\n\n' +
  '    private List<String> cache;\n\n' +
  '    public CacheService() {\n' +
  '        // db is NULL here — do not use it\n' +
  '    }\n\n' +
  '    @PostConstruct\n' +
  '    public void loadCache() {\n' +
  '        cache = db.findAll(); // safe — db is injected before this runs\n' +
  '    }\n' +
  '}\n' +
  '```\n\n' +

  '### @PreDestroy — the cleanup hook\n\n' +
  '@PreDestroy marks a method Spring calls when the application is shutting down. ' +
  'Use it to release resources your bean holds.\n\n' +
  '**Important rule for prototype beans:** Spring calls @PreDestroy on singleton beans. ' +
  'For prototype-scoped beans (a new instance per request), Spring does NOT call @PreDestroy. ' +
  'If your prototype holds a resource, you are responsible for closing it yourself.\n\n' +

  '### Bean scopes — how many instances does Spring create?\n\n' +
  'By default, Spring creates ONE instance of each bean for the entire app (singleton). ' +
  'But you can change this:\n\n' +
  '**@Scope("singleton")** — default. One shared instance. Everyone gets the same object.\n' +
  '**@Scope("prototype")** — new instance every time someone asks for it. Like calling new each time.\n' +
  '**@Scope("request")** — one instance per HTTP request. Useful in web apps.\n' +
  '**@Scope("session")** — one instance per user session.\n\n' +
  'Singleton is right 95% of the time. Use prototype when your bean holds per-user state.\n\n' +

  '### The scope mismatch trap — very common beginner mistake\n\n' +
  'Imagine you have a prototype bean called `Cart` (one per user) and you inject it into a singleton `CheckoutService`.\n\n' +
  'Spring creates `CheckoutService` ONCE. At that moment, it injects ONE `Cart` instance. ' +
  'That same Cart is now stuck inside CheckoutService forever. ' +
  'Every user\'s checkout goes through the same Cart object — their items mix together. That is a bug.\n\n' +
  '**Why it happens:** the singleton is created once, so injection happens once. Prototype scope is irrelevant after that single injection moment.\n\n' +
  '**The fix:** instead of injecting `Cart` directly, inject `ObjectFactory<Cart>`. ' +
  'Each time you call `objectFactory.getObject()`, Spring creates a fresh `Cart`.\n\n' +

  '### @Qualifier and @Primary — "which one do you want?"\n\n' +
  'What happens when you have two classes that implement the same interface?\n\n' +
  '```java\n' +
  'interface PaymentService { void pay(); }\n\n' +
  '@Service class StripePayment implements PaymentService { ... }\n' +
  '@Service class PayPalPayment implements PaymentService { ... }\n' +
  '```\n\n' +
  'Now if you @Autowire `PaymentService`, Spring panics — it has two candidates and does not know which to pick. ' +
  'You get a `NoUniqueBeanDefinitionException` at startup.\n\n' +
  '**@Primary** says: "When in doubt, use this one."\n' +
  '**@Qualifier("name")** says: "I specifically want this one, at this injection point."\n\n' +
  '@Qualifier always wins over @Primary. Use @Primary for the default implementation. Use @Qualifier when you need a specific non-default one.\n\n' +

  '### @DependsOn — "do this first"\n\n' +
  'Sometimes one bean needs another bean to have run its setup before it starts — ' +
  'but without actually injecting it. Example: a database migration bean must run before any repository bean starts.\n\n' +
  '@DependsOn("migrationRunner") tells Spring: "create and initialize migrationRunner before creating me." ' +
  'No injection happens. It is purely about order.\n\n' +

  '### Circular dependencies — when A needs B and B needs A\n\n' +
  'This is a design problem that Spring makes visible. ' +
  'If OrderService needs NotificationService and NotificationService needs OrderService, ' +
  'Spring cannot create either one first — both need the other to exist.\n\n' +
  'With constructor injection, Spring fails at startup with a clear error. Good — fail fast.\n\n' +
  'The real fix is not a Spring trick. It is a design fix: extract a third class ' +
  '(like an EventBus or shared helper) that both depend on, breaking the circle.\n\n' +

  '### 60-second mental model\n\n' +
  'Spring creates your objects (construction), fills in what they need (injection), ' +
  'lets them do setup (@PostConstruct), wraps them in proxies if needed (BeanPostProcessor), ' +
  'then serves them to the rest of your app. ' +
  'On shutdown it calls @PreDestroy for cleanup. ' +
  'Prototype beans are created fresh each time but Spring does not clean them up — you do. ' +
  'When you have two beans of the same type, use @Primary for the default or @Qualifier for an explicit pick. ' +
  'Circular dependencies are a design smell — extract a shared class instead of patching with @Lazy.';

// ─── CODE BASIC ───────────────────────────────────────────────────────────────
const basicCode =
  'package day39;\n\n' +
  '// Step 1: Run this WITHOUT Spring to understand what Spring does behind the scenes.\n' +
  '// We will manually call each lifecycle step so you can see the order clearly.\n' +
  '// In a real Spring app, Spring calls all of this automatically.\n\n' +
  'public class LifecycleDemo {\n\n' +
  '    // This is our "bean" — just a plain Java class\n' +
  '    static class WelcomeService {\n\n' +
  '        private String greeting; // will be "injected" (set) from outside\n\n' +
  '        // Step 1: Constructor — called by Spring first\n' +
  '        // At this point, greeting is still null\n' +
  '        public WelcomeService() {\n' +
  '            System.out.println("1. Constructor called. greeting = " + greeting); // null!\n' +
  '        }\n\n' +
  '        // Step 2: Injection — Spring sets this field after construction\n' +
  '        public void setGreeting(String greeting) {\n' +
  '            this.greeting = greeting;\n' +
  '            System.out.println("2. Injection done. greeting = " + greeting);\n' +
  '        }\n\n' +
  '        // Step 3: @PostConstruct equivalent — Spring calls this after injection\n' +
  '        // Now greeting is available. Safe to use it.\n' +
  '        public void init() {\n' +
  '            System.out.println("3. PostConstruct: ready to serve. greeting = " + greeting);\n' +
  '        }\n\n' +
  '        // Step 4: Normal usage\n' +
  '        public void welcome(String name) {\n' +
  '            System.out.println("4. Business logic: " + greeting + ", " + name + "!");\n' +
  '        }\n\n' +
  '        // Step 5: @PreDestroy equivalent — Spring calls this on shutdown\n' +
  '        public void cleanup() {\n' +
  '            System.out.println("5. PreDestroy: shutting down, releasing resources.");\n' +
  '        }\n' +
  '    }\n\n' +
  '    public static void main(String[] args) {\n' +
  '        System.out.println("=== Spring does all of this automatically. We do it manually so you can see it. ===\\n");\n\n' +
  '        // Spring internally does exactly these steps:\n\n' +
  '        // Step 1: construct\n' +
  '        WelcomeService service = new WelcomeService();\n\n' +
  '        // Step 2: inject\n' +
  '        service.setGreeting("Hello");\n\n' +
  '        // Step 3: PostConstruct\n' +
  '        service.init();\n\n' +
  '        System.out.println("\\n--- App is running ---\\n");\n\n' +
  '        // Step 4: use the bean normally\n' +
  '        service.welcome("Satyam");\n' +
  '        service.welcome("Priya");\n\n' +
  '        System.out.println("\\n--- App is shutting down ---\\n");\n\n' +
  '        // Step 5: PreDestroy\n' +
  '        service.cleanup();\n' +
  '    }\n' +
  '}';

const basicOutput =
  '=== Spring does all of this automatically. We do it manually so you can see it. ===\n\n' +
  '1. Constructor called. greeting = null\n' +
  '2. Injection done. greeting = Hello\n' +
  '3. PostConstruct: ready to serve. greeting = Hello\n\n' +
  '--- App is running ---\n\n' +
  '4. Business logic: Hello, Satyam!\n' +
  '4. Business logic: Hello, Priya!\n\n' +
  '--- App is shutting down ---\n\n' +
  '5. PreDestroy: shutting down, releasing resources.';

// ─── CODE INTERMEDIATE ────────────────────────────────────────────────────────
const intermediateCode =
  'package day39;\n\n' +
  '// Now the same concepts but with real Spring annotations.\n' +
  '// This is a Spring Boot app — Spring calls everything automatically.\n\n' +
  'import org.springframework.beans.factory.annotation.Autowired;\n' +
  'import org.springframework.beans.factory.annotation.Value;\n' +
  'import org.springframework.stereotype.Service;\n' +
  'import org.springframework.stereotype.Component;\n' +
  'import org.springframework.context.annotation.Primary;\n' +
  'import org.springframework.beans.factory.annotation.Qualifier;\n' +
  'import org.springframework.beans.factory.ObjectFactory;\n' +
  'import org.springframework.context.annotation.Scope;\n' +
  'import jakarta.annotation.PostConstruct;\n' +
  'import jakarta.annotation.PreDestroy;\n' +
  'import java.util.List;\n\n' +
  '// ─────────────────────────────────────────────────────────────────────────\n' +
  '// EXAMPLE 1: @PostConstruct and @PreDestroy in action\n' +
  '// Scenario: A service that loads product data into memory on startup\n' +
  '// ─────────────────────────────────────────────────────────────────────────\n\n' +
  '@Service\n' +
  'public class ProductCacheService {\n\n' +
  '    @Autowired\n' +
  '    private ProductRepository repository; // Spring injects this first\n\n' +
  '    private List<String> cache;\n\n' +
  '    // Spring calls this automatically after repository is injected\n' +
  '    @PostConstruct\n' +
  '    public void loadCache() {\n' +
  '        // Safe to use repository here — it is already injected\n' +
  '        cache = repository.findAllProductNames();\n' +
  '        System.out.println("Cache loaded with " + cache.size() + " products at startup.");\n' +
  '    }\n\n' +
  '    public List<String> getProducts() {\n' +
  '        return cache; // instant, no database call needed\n' +
  '    }\n\n' +
  '    // Spring calls this when the application shuts down\n' +
  '    @PreDestroy\n' +
  '    public void clearCache() {\n' +
  '        cache.clear();\n' +
  '        System.out.println("Cache cleared on shutdown.");\n' +
  '    }\n' +
  '}\n\n' +
  '// ─────────────────────────────────────────────────────────────────────────\n' +
  '// EXAMPLE 2: @Primary and @Qualifier\n' +
  '// Scenario: Two notification services — email (default) and SMS (on demand)\n' +
  '// ─────────────────────────────────────────────────────────────────────────\n\n' +
  'interface NotificationService {\n' +
  '    void send(String message);\n' +
  '}\n\n' +
  '@Service\n' +
  '@Primary // Spring picks this one by default when no @Qualifier is specified\n' +
  'class EmailNotificationService implements NotificationService {\n' +
  '    @Override\n' +
  '    public void send(String message) {\n' +
  '        System.out.println("EMAIL: " + message);\n' +
  '    }\n' +
  '}\n\n' +
  '@Service("smsNotification") // we give it a specific name for @Qualifier\n' +
  'class SmsNotificationService implements NotificationService {\n' +
  '    @Override\n' +
  '    public void send(String message) {\n' +
  '        System.out.println("SMS: " + message);\n' +
  '    }\n' +
  '}\n\n' +
  '@Service\n' +
  'public class OrderService {\n\n' +
  '    // Gets EmailNotificationService because it is @Primary\n' +
  '    @Autowired\n' +
  '    private NotificationService defaultNotifier;\n\n' +
  '    // Gets SmsNotificationService because we specified the qualifier name\n' +
  '    @Autowired\n' +
  '    @Qualifier("smsNotification")\n' +
  '    private NotificationService smsNotifier;\n\n' +
  '    public void placeOrder(String item, String method) {\n' +
  '        System.out.println("Order placed: " + item);\n' +
  '        if ("sms".equals(method)) {\n' +
  '            smsNotifier.send("Your order for " + item + " is confirmed!");\n' +
  '        } else {\n' +
  '            defaultNotifier.send("Your order for " + item + " is confirmed!");\n' +
  '        }\n' +
  '    }\n' +
  '}\n\n' +
  '// ─────────────────────────────────────────────────────────────────────────\n' +
  '// EXAMPLE 3: Scope mismatch — the most common beginner bug\n' +
  '// Scenario: A Cart bean that should be unique per user,\n' +
  '//           but gets stuck as one shared cart because of scope mismatch.\n' +
  '// ─────────────────────────────────────────────────────────────────────────\n\n' +
  '@Component\n' +
  '@Scope("prototype") // new instance every time getObject() is called\n' +
  'class Cart {\n' +
  '    private final java.util.List<String> items = new java.util.ArrayList<>();\n\n' +
  '    public void addItem(String item) { items.add(item); }\n' +
  '    public List<String> getItems() { return items; }\n' +
  '}\n\n' +
  '// BAD: injecting Cart directly into a singleton\n' +
  '@Service\n' +
  'class CheckoutServiceBuggy {\n\n' +
  '    // Problem: Spring injects ONE Cart at startup and reuses it forever.\n' +
  '    // User A and User B share the same Cart — their items mix. Bug!\n' +
  '    @Autowired\n' +
  '    private Cart cart;\n\n' +
  '    public void addToCart(String item) { cart.addItem(item); }\n' +
  '    public List<String> getCart() { return cart.getItems(); }\n' +
  '}\n\n' +
  '// GOOD: inject ObjectFactory so we get a fresh Cart per call\n' +
  '@Service\n' +
  'class CheckoutServiceFixed {\n\n' +
  '    // ObjectFactory creates a new Cart every time getObject() is called\n' +
  '    @Autowired\n' +
  '    private ObjectFactory<Cart> cartFactory;\n\n' +
  '    public Cart getCartForCurrentUser() {\n' +
  '        return cartFactory.getObject(); // fresh Cart every time\n' +
  '    }\n' +
  '}\n\n' +
  '// ─────────────────────────────────────────────────────────────────────────\n' +
  '// EXAMPLE 4: @Value — reading from application.properties\n' +
  '// application.properties: app.max-retries=3, app.service-name=OrderAPI\n' +
  '// ─────────────────────────────────────────────────────────────────────────\n\n' +
  '@Service\n' +
  'class RetryService {\n\n' +
  '    @Value("${app.max-retries:3}") // reads from properties, default 3\n' +
  '    private int maxRetries;\n\n' +
  '    @Value("${app.service-name:DefaultService}")\n' +
  '    private String serviceName;\n\n' +
  '    @PostConstruct\n' +
  '    public void logConfig() {\n' +
  '        // Both values are injected before this runs\n' +
  '        System.out.println(serviceName + " will retry up to " + maxRetries + " times.");\n' +
  '    }\n\n' +
  '    public void callWithRetry(Runnable action) {\n' +
  '        for (int i = 1; i <= maxRetries; i++) {\n' +
  '            try { action.run(); return; }\n' +
  '            catch (Exception e) {\n' +
  '                System.out.println("Attempt " + i + " failed. " +\n' +
  '                    (i < maxRetries ? "Retrying..." : "Giving up."));\n' +
  '            }\n' +
  '        }\n' +
  '    }\n' +
  '}';

const intermediateOutput =
  '--- App startup ---\n' +
  'Cache loaded with 42 products at startup.\n' +
  'OrderAPI will retry up to 3 times.\n\n' +
  '--- App running ---\n' +
  'Order placed: Laptop\n' +
  'EMAIL: Your order for Laptop is confirmed!\n' +
  'Order placed: Mouse\n' +
  'SMS: Your order for Mouse is confirmed!\n\n' +
  '--- App shutdown ---\n' +
  'Cache cleared on shutdown.';

// ─── CODE ADVANCED ────────────────────────────────────────────────────────────
const advancedCode =
  'package day39;\n\n' +
  '// Advanced patterns: BeanPostProcessor, circular dependency fix,\n' +
  '// @DependsOn, and @Lazy. These are real production scenarios.\n\n' +
  'import org.springframework.beans.factory.config.BeanPostProcessor;\n' +
  'import org.springframework.context.annotation.DependsOn;\n' +
  'import org.springframework.context.annotation.Lazy;\n' +
  'import org.springframework.stereotype.Component;\n' +
  'import org.springframework.stereotype.Service;\n' +
  'import org.springframework.beans.factory.annotation.Autowired;\n' +
  'import jakarta.annotation.PostConstruct;\n\n' +
  '// ─────────────────────────────────────────────────────────────────────────\n' +
  '// ADVANCED 1: BeanPostProcessor — running code around every bean\n' +
  '//\n' +
  '// Imagine you want to log the startup time of every single bean.\n' +
  '// You cannot add @PostConstruct to 100 classes manually.\n' +
  '// BeanPostProcessor lets you intercept every bean creation in one place.\n' +
  '// ─────────────────────────────────────────────────────────────────────────\n\n' +
  '@Component\n' +
  'public class StartupTimerBPP implements BeanPostProcessor {\n\n' +
  '    // Called BEFORE each bean\'s @PostConstruct (and other init callbacks)\n' +
  '    @Override\n' +
  '    public Object postProcessBeforeInitialization(Object bean, String beanName) {\n' +
  '        // We just store the start time. We use the beanName as a key.\n' +
  '        StartupTimerRegistry.start(beanName);\n' +
  '        return bean; // IMPORTANT: always return the bean (or a replacement)\n' +
  '    }\n\n' +
  '    // Called AFTER each bean\'s @PostConstruct (and other init callbacks)\n' +
  '    @Override\n' +
  '    public Object postProcessAfterInitialization(Object bean, String beanName) {\n' +
  '        long ms = StartupTimerRegistry.stop(beanName);\n' +
  '        if (ms > 200) {\n' +
  '            System.out.println("SLOW BEAN: " + beanName + " took " + ms + "ms to initialize!");\n' +
  '        }\n' +
  '        // Returning bean as-is. Spring\'s AOP infrastructure returns a PROXY here instead,\n' +
  '        // which is how @Transactional, @Async etc work under the hood.\n' +
  '        return bean;\n' +
  '    }\n' +
  '}\n\n' +
  '// Simple registry to track timing (not thread-safe — demo only)\n' +
  'class StartupTimerRegistry {\n' +
  '    private static final java.util.Map<String, Long> times = new java.util.HashMap<>();\n' +
  '    static void start(String name) { times.put(name, System.currentTimeMillis()); }\n' +
  '    static long stop(String name) {\n' +
  '        Long start = times.remove(name);\n' +
  '        return start == null ? 0 : System.currentTimeMillis() - start;\n' +
  '    }\n' +
  '}\n\n' +
  '// ─────────────────────────────────────────────────────────────────────────\n' +
  '// ADVANCED 2: @DependsOn — controlling startup order without injection\n' +
  '//\n' +
  '// Real scenario: You have a DatabaseMigrationService that creates tables.\n' +
  '// The UserRepository must only start AFTER migrations are done.\n' +
  '// But UserRepository does not @Autowire the migration service.\n' +
  '// @DependsOn solves this — it is ordering without injection.\n' +
  '// ─────────────────────────────────────────────────────────────────────────\n\n' +
  '@Service("databaseMigration")\n' +
  'public class DatabaseMigrationService {\n\n' +
  '    @PostConstruct\n' +
  '    public void runMigrations() {\n' +
  '        System.out.println("DatabaseMigration: creating/updating tables...");\n' +
  '        // In real code: Flyway or Liquibase runs here\n' +
  '        System.out.println("DatabaseMigration: schema is ready.");\n' +
  '    }\n' +
  '}\n\n' +
  '@Service\n' +
  '@DependsOn("databaseMigration") // wait for migration before starting\n' +
  'public class UserRepository {\n\n' +
  '    @PostConstruct\n' +
  '    public void init() {\n' +
  '        // By the time this runs, databaseMigration has already completed\n' +
  '        System.out.println("UserRepository: connecting (tables are guaranteed to exist).");\n' +
  '    }\n\n' +
  '    public String findByEmail(String email) {\n' +
  '        return "User[" + email + "]"; // simplified\n' +
  '    }\n' +
  '}\n\n' +
  '// ─────────────────────────────────────────────────────────────────────────\n' +
  '// ADVANCED 3: Circular dependency and how to fix it properly\n' +
  '//\n' +
  '// BAD design: InvoiceService needs PaymentService, PaymentService needs InvoiceService.\n' +
  '// Spring cannot create either. Fails at startup.\n' +
  '//\n' +
  '// WRONG fix: @Lazy on one of them (hides the problem, doesn\'t fix it).\n' +
  '// RIGHT fix: extract shared logic into a third class both can depend on.\n' +
  '// ─────────────────────────────────────────────────────────────────────────\n\n' +
  '// THE PROBLEM (do not do this):\n' +
  '/*\n' +
  '@Service class InvoiceService {\n' +
  '    @Autowired PaymentService paymentService; // needs PaymentService\n' +
  '}\n' +
  '@Service class PaymentService {\n' +
  '    @Autowired InvoiceService invoiceService; // needs InvoiceService — CIRCULAR!\n' +
  '}\n' +
  '// Spring throws: "The dependencies of some of the beans in the application\n' +
  '//                context form a cycle: invoiceService -> paymentService -> invoiceService"\n' +
  '*/\n\n' +
  '// THE FIX: extract the shared behaviour into EventBus\n' +
  '// Neither class needs the other. Both depend only on EventBus.\n\n' +
  '@Service\n' +
  'class EventBus {\n' +
  '    public void publish(String event, Object data) {\n' +
  '        System.out.println("EVENT [" + event + "]: " + data);\n' +
  '        // In real apps: listeners subscribe and react to events\n' +
  '    }\n' +
  '}\n\n' +
  '@Service\n' +
  'class InvoiceService {\n' +
  '    @Autowired private EventBus eventBus; // depends on EventBus, not PaymentService\n\n' +
  '    public void createInvoice(String orderId) {\n' +
  '        System.out.println("Invoice created for order: " + orderId);\n' +
  '        eventBus.publish("invoice.created", orderId); // fire event instead of direct call\n' +
  '    }\n' +
  '}\n\n' +
  '@Service\n' +
  'class PaymentService {\n' +
  '    @Autowired private EventBus eventBus; // depends on EventBus, not InvoiceService\n\n' +
  '    public void processPayment(String orderId, double amount) {\n' +
  '        System.out.println("Payment of $" + amount + " processed for order: " + orderId);\n' +
  '        eventBus.publish("payment.processed", orderId);\n' +
  '    }\n' +
  '}\n\n' +
  '// ─────────────────────────────────────────────────────────────────────────\n' +
  '// ADVANCED 4: How @Transactional actually works (the proxy secret)\n' +
  '//\n' +
  '// When you put @Transactional on a method, Spring wraps your class in a proxy.\n' +
  '// Callers talk to the proxy, not your real class.\n' +
  '// The proxy starts a transaction, calls your method, then commits or rolls back.\n' +
  '//\n' +
  '// The famous self-invocation bug: calling a @Transactional method from within\n' +
  '// the same class bypasses the proxy — the transaction never starts.\n' +
  '// ─────────────────────────────────────────────────────────────────────────\n\n' +
  '@Service\n' +
  'class TransactionDemo {\n\n' +
  '    // This works: external caller -> proxy -> this method -> transaction starts\n' +
  '    @org.springframework.transaction.annotation.Transactional\n' +
  '    public void saveOrder(String orderId) {\n' +
  '        System.out.println("Saving order " + orderId + " inside a transaction.");\n' +
  '        // If exception thrown here, transaction rolls back automatically\n' +
  '    }\n\n' +
  '    // This DOES NOT work as expected:\n' +
  '    public void processBatch(java.util.List<String> orderIds) {\n' +
  '        for (String id : orderIds) {\n' +
  '            // Calling saveOrder from within the same class bypasses the proxy!\n' +
  '            // No transaction is started. @Transactional is silently ignored.\n' +
  '            saveOrder(id); // BAD: direct call, not through proxy\n' +
  '        }\n' +
  '    }\n\n' +
  '    // Fix: move processBatch to a DIFFERENT class, or inject self (ugly but works)\n' +
  '}';

const advancedOutput =
  '--- Startup sequence ---\n' +
  'DatabaseMigration: creating/updating tables...\n' +
  'DatabaseMigration: schema is ready.\n' +
  'UserRepository: connecting (tables are guaranteed to exist).\n\n' +
  '--- Runtime ---\n' +
  'Invoice created for order: ORD-001\n' +
  'EVENT [invoice.created]: ORD-001\n' +
  'Payment of $299.0 processed for order: ORD-001\n' +
  'EVENT [payment.processed]: ORD-001\n' +
  'Saving order ORD-001 inside a transaction.\n\n' +
  '--- SLOW BEAN warning (if a bean took > 200ms) ---\n' +
  'SLOW BEAN: reportGeneratorService took 312ms to initialize!';

// ─── DIAGRAM ──────────────────────────────────────────────────────────────────
const diagram = {
  type: 'diagram',
  title: 'Spring Bean Lifecycle — from @Service to your method running',
  content:
    'Think of Spring like hiring and onboarding an employee.\n\n' +
    '  You write @Service          <- "We want to hire this class"\n' +
    '       |\n' +
    '  Spring reads the class      <- "What does this employee need? What are the job requirements?"\n' +
    '  (BeanDefinition)               (reads constructor args, @Value fields, @Autowired fields)\n' +
    '       |\n' +
    '  BeanFactoryPostProcessor    <- "${property}" placeholders replaced with real values\n' +
    '  (rare, Spring Boot handles)    from application.properties\n' +
    '       |\n' +
    '  Constructor called          <- "Employee starts on their first day"\n' +
    '                                 Dependencies not available yet (no laptop yet)\n' +
    '       |\n' +
    '  @Autowired fields filled    <- "Give them the laptop, access card, tools"\n' +
    '  (@Value, setters)              All dependencies now available\n' +
    '       |\n' +
    '  @PostConstruct runs         <- "Orientation / onboarding"\n' +
    '                                 Setup that needs the injected tools:\n' +
    '                                 open connections, load cache, validate config\n' +
    '       |\n' +
    '  BeanPostProcessor wraps     <- "Put on a uniform" (optional)\n' +
    '  bean in proxy (if needed)      @Transactional, @Async, AOP all work this way.\n' +
    '                                 Callers see the proxy, not the original bean.\n' +
    '       |\n' +
    '  Bean is READY               <- "Employee is working"\n' +
    '  (used by the whole app)        All @Autowired injections get this bean\n' +
    '       |\n' +
    '       | ... app runs normally ...\n' +
    '       |\n' +
    '  Application shuts down\n' +
    '       |\n' +
    '  @PreDestroy runs            <- "Exit process"\n' +
    '                                 Close connections, stop threads, flush buffers\n\n' +
    '─────────────────────────────────────────────────────────────────────────\n\n' +
    'SCOPE: how many instances does Spring create?\n\n' +
    '  @Scope("singleton")  <- default. ONE instance shared by everyone.\n' +
    '                          Like one shared printer for the whole office.\n\n' +
    '  @Scope("prototype")  <- NEW instance every time someone asks for it.\n' +
    '                          Like giving every employee their own notepad.\n' +
    '                          WARNING: Spring does NOT call @PreDestroy on prototypes.\n\n' +
    '  @Scope("request")    <- ONE instance per HTTP request. Web apps only.\n\n' +
    '─────────────────────────────────────────────────────────────────────────\n\n' +
    'DISAMBIGUATION: two beans of the same type?\n\n' +
    '  interface PaymentService\n' +
    '       |\n' +
    '       |-- StripePayment (@Primary)    <- Spring picks this by default\n' +
    '       |-- PayPalPayment               <- Only used when @Qualifier("payPalPayment") specified\n\n' +
    'CIRCULAR DEPENDENCY:\n\n' +
    '  A needs B, B needs A -> Spring cannot create either -> startup FAILS\n\n' +
    '  Fix: Extract C that both A and B depend on. No more circle.\n' +
    '  A -> C\n' +
    '  B -> C'
};

// ─── PITFALLS ─────────────────────────────────────────────────────────────────
const pitfalls = [
  {
    id: 'p1',
    title: 'Using an @Autowired field inside the constructor',
    severity: 'high',
    symptom: 'NullPointerException in the constructor when accessing an @Autowired field',
    cause: 'Spring injects @Autowired fields AFTER the constructor runs, not before. Inside the constructor, all injected fields are still null.',
    fix: 'Move the logic that needs the injected field to a @PostConstruct method. That runs after all injection is done.',
    detection: 'If you get NPE in a constructor and the field has @Autowired, this is the cause 100% of the time.'
  },
  {
    id: 'p2',
    title: 'Injecting a prototype bean directly into a singleton',
    severity: 'high',
    symptom: 'A bean that should be unique per user/request is shared across all users — state leaks between users',
    cause: 'Spring injects the prototype once when creating the singleton, then never again. Everyone shares the same "prototype" instance.',
    fix: 'Inject ObjectFactory<YourBean> or Provider<YourBean> instead. Call getObject() or get() each time you need a fresh instance.',
    detection: 'Add a print of the object\'s hashCode in two separate "user" calls. If the hashCode is the same both times, you have a mismatch.'
  },
  {
    id: 'p3',
    title: '@Transactional method called from within the same class',
    severity: 'high',
    symptom: 'Changes are not rolled back on exception even though the method has @Transactional. No error is thrown.',
    cause: '@Transactional works through a proxy. When you call a method on `this`, you bypass the proxy. No proxy = no transaction.',
    fix: 'Move the @Transactional method to a different class, or inject the current class into itself and call through that reference.',
    detection: 'Add a log inside the method checking TransactionSynchronizationManager.isActualTransactionActive(). If false, the transaction never started.'
  },
  {
    id: 'p4',
    title: 'Spring does not call @PreDestroy on prototype beans',
    severity: 'medium',
    symptom: 'Database connections or file handles stay open after the prototype bean is no longer needed',
    cause: 'Once Spring hands over a prototype bean, it forgets about it. @PreDestroy is only called for singletons on shutdown.',
    fix: 'Make the bean singleton if possible. If you need prototype, the caller must manually clean up, or implement a registry that tracks all instances.',
    detection: 'Add a counter that increments in the constructor and decrements in @PreDestroy. Under load, it should stay near zero. If it only climbs, you have a leak.'
  },
  {
    id: 'p5',
    title: 'Circular dependency with constructor injection',
    severity: 'high',
    symptom: 'Application fails at startup: "The dependencies of some of the beans in the application context form a cycle"',
    cause: 'Bean A needs Bean B in its constructor, Bean B needs Bean A. Spring cannot create either without the other already existing.',
    fix: 'Extract shared logic into a third bean that both A and B depend on. This breaks the circle structurally. Using @Lazy is a temporary patch, not a real fix.',
    detection: 'Spring\'s error message shows the exact cycle. Read it: "beanA -> beanB -> beanA". That tells you exactly which classes to refactor.'
  },
  {
    id: 'p6',
    title: '@Primary bean is the wrong implementation in production',
    severity: 'high',
    symptom: 'App runs fine in tests but wrong implementation is active in production — e.g., emails go to the stub service instead of real SendGrid',
    cause: '@Primary was added to a test/stub implementation without restricting it to a test profile. Production loads both beans and picks the stub.',
    fix: 'Always annotate stub/test beans with @Profile("test") or @ConditionalOnProperty so they only load in the right environment.',
    detection: 'Add a startup log: logger.info("Active NotificationService: {}", notificationService.getClass().getSimpleName()). Alert if it prints the stub class name.'
  },
  {
    id: 'p7',
    title: 'Slow @PostConstruct blocks the app from being ready',
    severity: 'medium',
    symptom: 'App takes 30 seconds to start. Health checks fail during startup. Load balancer marks the instance as down before it finishes.',
    cause: '@PostConstruct runs synchronously. If it loads 1GB of data or calls a slow API, the entire startup waits.',
    fix: 'Start the heavy work on a background thread inside @PostConstruct. Expose a readiness check that returns "not ready" until background init finishes.',
    detection: 'Time your @PostConstruct methods. If any take more than 5 seconds in a cloud environment, move the work to background threads.'
  },
  {
    id: 'p8',
    title: 'Missing @ComponentScan makes beans invisible to Spring',
    severity: 'medium',
    symptom: 'NoSuchBeanDefinitionException at startup even though @Service is clearly on the class',
    cause: 'Spring only scans packages listed in @ComponentScan (or the package of your @SpringBootApplication class and its sub-packages). Beans in other packages are invisible.',
    fix: 'Move the class into a sub-package of your main app class, or explicitly add the package to @ComponentScan.',
    detection: 'Print ctx.getBeanDefinitionNames() at startup. If your bean is not in the list, Spring never found it during scanning.'
  }
];

// ─── EXERCISE ─────────────────────────────────────────────────────────────────
const exercise = {
  type: 'exercise',
  title: 'Hands-on practice — build and observe the lifecycle',
  tasks: [
    'Create a Spring Boot project with a single @Service called GreetingService. Add a @PostConstruct that prints "GreetingService is ready!" and a @PreDestroy that prints "GreetingService is shutting down!". Run the app and stop it. Verify both messages appear.',
    'Create a second @Service called WelcomeService that @Autowires GreetingService. In @PostConstruct, call a method on greetingService and print the result. Verify it works (greetingService is not null in @PostConstruct).',
    'Now try doing the same in WelcomeService\'s constructor instead of @PostConstruct. Observe the NullPointerException. Switch back to @PostConstruct. This is the most important lesson of the day.',
    'Create an interface MessageSender with a send() method. Create two implementations: EmailSender and SmsSender. Mark EmailSender with @Primary. @Autowire MessageSender in two places — once without @Qualifier (gets Email) and once with @Qualifier("smsSender") (gets SMS). Verify in logs.',
    'Create a prototype-scoped @Component called RequestTracker that stores a UUID generated in its constructor. Inject it into a singleton @Service. Call a method on it twice and print the UUID. Observe that both calls show the SAME UUID (the mismatch bug). Fix it using ObjectFactory<RequestTracker> and verify the UUIDs are different.'
  ]
};

// ─── CONCEPTUAL Q&As ──────────────────────────────────────────────────────────
const conceptual = [
  {
    id: 'c1',
    question: 'In simple words, what is a Spring bean and why does Spring manage it instead of you creating it with `new`?',
    answer: 'A Spring bean is just a Java object that Spring creates and manages for you. You use `new` when you need an object once in a specific place. Spring manages beans when many different parts of your app need the same object — like a database connection service or an email sender. Spring creates it once, keeps it ready, and injects it wherever it is needed. This way you never have to pass objects around manually, and swapping implementations (like replacing a real payment service with a test stub) is a one-line config change instead of hunting through all the code that calls `new`.',
    difficulty: 'easy',
    tags: ['basics', 'DI', 'why-spring']
  },
  {
    id: 'c2',
    question: 'What is the correct order of these three events: constructor runs, @Autowired fields are injected, @PostConstruct runs?',
    answer: 'Always in this order: (1) constructor runs — the object is created but all @Autowired fields are null, (2) @Autowired fields are injected — Spring fills in all the dependencies, (3) @PostConstruct runs — all fields are populated and ready to use. This is why you should never use @Autowired fields inside the constructor. They are null there. @PostConstruct is specifically designed for code that needs those fields to be ready.',
    difficulty: 'easy',
    tags: ['lifecycle', 'PostConstruct', 'order']
  },
  {
    id: 'c3',
    question: 'What is the purpose of @PostConstruct? Give a real example of when you would use it.',
    answer: '@PostConstruct marks a method that Spring calls after all @Autowired fields are injected and the bean is fully constructed. You use it for setup that needs those injected fields. Real examples: (1) loading data into a cache at startup using an injected repository, (2) opening a connection pool using an injected config value, (3) registering the bean with an external service using an injected registration client, (4) validating that all required config values are non-null before the app starts serving traffic. The rule is: anything that needs your injected dependencies to be ready belongs in @PostConstruct, not the constructor.',
    difficulty: 'easy',
    tags: ['PostConstruct', 'use-case']
  },
  {
    id: 'c4',
    question: 'What is @PreDestroy for? Is it called for all beans?',
    answer: '@PreDestroy marks a method Spring calls when the application is shutting down — right before the bean is destroyed. You use it to release resources: close database connections, stop background threads, flush unsaved data to disk. Important limitation: @PreDestroy is only called for SINGLETON beans. For PROTOTYPE beans, Spring gives up ownership after creation and never calls @PreDestroy. If a prototype bean holds a resource (a connection, a file handle), the calling code is responsible for cleaning it up.',
    difficulty: 'easy',
    tags: ['PreDestroy', 'prototype', 'cleanup']
  },
  {
    id: 'c5',
    question: 'What is the difference between singleton and prototype scope? When would you use each?',
    answer: 'Singleton (default): Spring creates ONE instance of the bean and shares it with everyone who asks for it. It is like one shared printer for the office — everyone uses the same machine. Use this for stateless services like EmailService, PaymentService, database repositories. Prototype: Spring creates a NEW instance every time someone asks for it. Like giving each person their own notepad. Use this when the bean holds state specific to a particular user or operation — a shopping cart, a request-specific context object. For 95% of Spring beans, singleton is the right choice.',
    difficulty: 'easy',
    tags: ['scope', 'singleton', 'prototype']
  },
  {
    id: 'c6',
    question: 'You have two classes implementing the same interface. How does Spring know which one to inject? Explain @Primary and @Qualifier.',
    answer: 'When Spring sees two beans of the same type, it panics and throws NoUniqueBeanDefinitionException at startup — unless you help it decide. @Primary on one of the implementations tells Spring "this is the default, use this one when no other guidance is given." @Qualifier("beanName") at an injection point says "I specifically want this named implementation, ignore @Primary." @Qualifier always wins over @Primary. Use @Primary for the dominant implementation (the one used in 90% of places), and @Qualifier for the specific cases where you need the other one.',
    difficulty: 'medium',
    tags: ['Qualifier', 'Primary', 'disambiguation']
  },
  {
    id: 'c7',
    question: 'Explain the scope mismatch problem in simple terms. What causes it and how do you fix it?',
    answer: 'Scope mismatch is when you inject a prototype bean into a singleton. Here is the problem in plain terms: the singleton is created once. At that one moment, Spring injects one prototype instance into it. That prototype instance is now stuck inside the singleton forever. Prototype scope is supposed to give you a fresh instance each time, but because injection happens only once (when the singleton is created), you always get the same old instance. It is like hiring a new employee on Monday and expecting them to show up as a completely different person every day — the hire happened once. Fix: instead of injecting the prototype directly, inject ObjectFactory<YourPrototype>. Call getObject() each time you need a fresh instance — that is when a new instance is actually created.',
    difficulty: 'medium',
    tags: ['scope-mismatch', 'prototype', 'ObjectFactory']
  },
  {
    id: 'c8',
    question: 'What is a circular dependency and what is the correct way to fix it?',
    answer: 'Circular dependency is when Bean A needs Bean B and Bean B also needs Bean A. Spring cannot create A without B, and cannot create B without A — a deadlock. It fails at startup with a clear error message showing the cycle. The wrong fix is @Lazy — it hides the problem by deferring creation but the circular dependency still exists in your design. The right fix is to extract a third bean (like an EventBus, shared registry, or helper service) that both A and B depend on. Now A depends on C and B depends on C — no circle. The circular dependency was a signal that you were missing an abstraction in your design.',
    difficulty: 'medium',
    tags: ['circular', 'design', 'fix']
  },
  {
    id: 'c9',
    question: 'What does @DependsOn do? How is it different from @Autowired?',
    answer: '@DependsOn tells Spring to initialize one bean before another, without any injection happening. @Autowired actually injects a reference — the field gets populated and you can call methods on it. @DependsOn is purely about ordering: "make sure beanX is done with its startup before you start me." You use @DependsOn when you need a side effect to have happened — a database migration to have run, a Kafka topic to have been created — but you do not actually need to call methods on that bean yourself. If you need to call methods on it, use @Autowired. If you just need it to have run, use @DependsOn.',
    difficulty: 'medium',
    tags: ['DependsOn', 'ordering', 'vs-Autowired']
  },
  {
    id: 'c10',
    question: 'How does @Transactional actually work? Why does calling a @Transactional method from within the same class not work?',
    answer: '@Transactional works through a proxy. When you annotate a method with @Transactional, Spring wraps your class in a proxy object (a generated subclass). When external code calls your service, it actually calls the proxy. The proxy starts a transaction, calls your real method, then commits or rolls back. The problem with self-invocation: when code inside your class calls another method with `this.method()`, it calls directly on the real object — the call never goes through the proxy. No proxy = no transaction start. The @Transactional annotation is silently ignored. Fix: move the @Transactional method to a different class so the call always goes through a proxy.',
    difficulty: 'medium',
    tags: ['Transactional', 'proxy', 'self-invocation']
  },
  {
    id: 'c11',
    question: 'What is BeanPostProcessor and what is it used for? Give a real-world example.',
    answer: 'BeanPostProcessor is a Spring interface that lets you run code around the initialization of EVERY bean in your application — before its init callbacks and after. You get the bean object and you can inspect it, modify it, or replace it entirely with a different object (like a proxy). Real-world uses: (1) measuring how long each bean takes to initialize and logging slow ones, (2) checking that every bean marked with a custom annotation has the required configuration, (3) this is how @Transactional works — AbstractAutoProxyCreator (a BPP) replaces your bean with a CGLIB proxy after initialization. You rarely write BeanPostProcessors directly in application code — they are for framework-level concerns that apply to many beans at once.',
    difficulty: 'hard',
    tags: ['BeanPostProcessor', 'proxy', 'AOP']
  },
  {
    id: 'c12',
    question: 'What is the difference between constructor injection and field injection? Which is preferred and why?',
    answer: 'Field injection: @Autowired directly on a private field. Spring uses reflection to set it. Easy to write but has problems: you cannot use the class without Spring (your unit tests need a full context or reflection mocking), the required dependencies are hidden (reading the class gives no clue what it needs), and Spring cannot tell if the field was actually set. Constructor injection: dependencies are listed as constructor parameters. Spring calls the constructor with the right objects. This is preferred because: (1) your class works without Spring — just call `new MyService(mockDep)` in tests, (2) all required dependencies are immediately visible in the constructor signature, (3) if a dependency is missing, you get a compile-time error, not a runtime NPE, (4) you can make fields final, preventing accidental changes after construction.',
    difficulty: 'medium',
    tags: ['constructor-injection', 'field-injection', 'best-practice']
  },
  {
    id: 'c13',
    question: 'What happens if you have two @Service classes with @Primary both on them?',
    answer: 'Spring throws NoUniqueBeanDefinitionException at startup, same as if neither had @Primary. @Primary is only useful when exactly ONE bean of that type has it. If two beans both have @Primary, Spring still cannot decide and fails. Fix: remove @Primary from one of them and use @Qualifier at the injection points that need the non-default one. If both implementations are truly equal, reconsider your design — you may need a third class that combines or routes between them.',
    difficulty: 'medium',
    tags: ['Primary', 'conflict', 'disambiguation']
  },
  {
    id: 'c14',
    question: 'What is @Lazy and when should you use it?',
    answer: '@Lazy delays the creation of a bean until it is first needed. By default, Spring creates all singleton beans at startup. With @Lazy, the bean is created only when someone first @Autowires it and actually calls a method on it. Use @Lazy when: (1) the bean is expensive to create (loading large data, connecting to a slow service) and is only needed occasionally, (2) as a last resort to break a circular dependency (but fix the design first). Do NOT use @Lazy just to speed up startup for beans that will be needed immediately — the cost is just deferred to the first request. Also: @Lazy on an @Autowired field injects a proxy immediately but only resolves the real bean on first method call — different from @Lazy on the @Service class itself.',
    difficulty: 'medium',
    tags: ['Lazy', 'startup', 'proxy']
  },
  {
    id: 'c15',
    question: 'You put @PostConstruct on a method but it never runs. What are the three most likely reasons?',
    answer: 'Reason 1: The class is not a Spring bean. If you forgot @Service, @Component, or @Repository — or if the class is in a package Spring is not scanning — Spring never manages the class and never calls @PostConstruct. Reason 2: The method has a return type other than void or it has parameters. @PostConstruct requires a no-argument method with void return type. Spring silently ignores methods that do not match. Reason 3: The class is manually instantiated with `new` somewhere. If you call `new MyService()` yourself, Spring is not involved. @PostConstruct is only called by Spring for beans it created — not for objects you created manually.',
    difficulty: 'medium',
    tags: ['PostConstruct', 'debugging', 'not-running']
  },
  {
    id: 'c16',
    question: 'What is the difference between @PostConstruct and implementing InitializingBean? Which should you use?',
    answer: '@PostConstruct (JSR-250 standard): a method annotation. Your class knows nothing about Spring — it is a plain annotation from the Java standard library. Can be used in any Java EE or Jakarta EE context, not just Spring. InitializingBean (Spring interface): your class implements a Spring-specific interface and overrides afterPropertiesSet(). This tightly couples your class to Spring — it cannot be used outside of Spring without the Spring jar. They fire in the same lifecycle phase but @PostConstruct fires slightly earlier (it is processed by a BeanPostProcessor). Which to use: always prefer @PostConstruct for application code. Use InitializingBean only in Spring framework or library code where coupling to Spring is acceptable.',
    difficulty: 'medium',
    tags: ['PostConstruct', 'InitializingBean', 'comparison']
  },
  {
    id: 'c17',
    question: 'In a Spring Boot app, where should your @Service and @Component classes live in the package structure, and why?',
    answer: 'They must live in the same package as your @SpringBootApplication class, or in any sub-package of it. Spring Boot automatically scans the package of the @SpringBootApplication class and all its sub-packages for @Component, @Service, @Repository, @Controller etc. If you put a class in a different package (outside this tree), Spring never finds it and the bean does not exist — you get NoSuchBeanDefinitionException when something tries to @Autowire it. This is one of the most common beginner mistakes. Standard structure: main class in com.myapp, all other classes in com.myapp.service, com.myapp.repository, com.myapp.controller etc.',
    difficulty: 'easy',
    tags: ['ComponentScan', 'package-structure', 'beginner']
  }
];

// ─── CODE-BASED Q&As ──────────────────────────────────────────────────────────
const codeBased = [
  {
    id: 'cb1',
    question: 'Write a Spring @Service that reads a greeting message from application.properties and prints it at startup. The property key is "app.greeting" with default "Hello World".',
    answer:
      '@Service\n' +
      'public class GreetingService {\n\n' +
      '    // Reads app.greeting from application.properties\n' +
      '    // If not found, uses "Hello World" as the default\n' +
      '    @Value("${app.greeting:Hello World}")\n' +
      '    private String greeting;\n\n' +
      '    @PostConstruct\n' +
      '    public void printGreeting() {\n' +
      '        // greeting is injected before this runs\n' +
      '        System.out.println("App started with greeting: " + greeting);\n' +
      '    }\n\n' +
      '    public String getGreeting() {\n' +
      '        return greeting;\n' +
      '    }\n' +
      '}\n\n' +
      '// In application.properties:\n' +
      '// app.greeting=Welcome to Satyverse!\n\n' +
      '// Output at startup:\n' +
      '// App started with greeting: Welcome to Satyverse!',
    difficulty: 'easy',
    tags: ['Value', 'PostConstruct', 'properties']
  },
  {
    id: 'cb2',
    question: 'Write the buggy version and then the fixed version of injecting a prototype-scoped bean into a singleton.',
    answer:
      '// The prototype bean\n' +
      '@Component\n' +
      '@Scope("prototype")\n' +
      'public class RequestId {\n' +
      '    private final String id = java.util.UUID.randomUUID().toString();\n' +
      '    public String getId() { return id; }\n' +
      '}\n\n' +
      '// ---- BUGGY VERSION ----\n' +
      '@Service\n' +
      'public class RequestHandlerBuggy {\n' +
      '    @Autowired\n' +
      '    private RequestId requestId; // injected ONCE at startup\n\n' +
      '    public void handle() {\n' +
      '        // Always prints the same ID — prototype scope is broken\n' +
      '        System.out.println("Handling request: " + requestId.getId());\n' +
      '    }\n' +
      '}\n\n' +
      '// ---- FIXED VERSION ----\n' +
      '@Service\n' +
      'public class RequestHandlerFixed {\n' +
      '    @Autowired\n' +
      '    private ObjectFactory<RequestId> requestIdFactory; // inject the factory\n\n' +
      '    public void handle() {\n' +
      '        RequestId requestId = requestIdFactory.getObject(); // fresh instance each call\n' +
      '        System.out.println("Handling request: " + requestId.getId()); // different ID each time\n' +
      '    }\n' +
      '}',
    difficulty: 'medium',
    tags: ['prototype', 'scope-mismatch', 'ObjectFactory', 'bug-fix']
  },
  {
    id: 'cb3',
    question: 'Write two implementations of a Logger interface and wire them correctly using @Primary and @Qualifier.',
    answer:
      'public interface Logger {\n' +
      '    void log(String message);\n' +
      '}\n\n' +
      '@Service\n' +
      '@Primary // default logger — used when no @Qualifier is specified\n' +
      'public class ConsoleLogger implements Logger {\n' +
      '    @Override\n' +
      '    public void log(String message) {\n' +
      '        System.out.println("[CONSOLE] " + message);\n' +
      '    }\n' +
      '}\n\n' +
      '@Service("fileLogger") // give it a name for @Qualifier\n' +
      'public class FileLogger implements Logger {\n' +
      '    @Override\n' +
      '    public void log(String message) {\n' +
      '        System.out.println("[FILE] Writing to file: " + message);\n' +
      '    }\n' +
      '}\n\n' +
      '@Service\n' +
      'public class AuditService {\n\n' +
      '    @Autowired\n' +
      '    private Logger defaultLogger; // gets ConsoleLogger (it is @Primary)\n\n' +
      '    @Autowired\n' +
      '    @Qualifier("fileLogger") // explicitly asks for FileLogger\n' +
      '    private Logger auditLogger;\n\n' +
      '    public void recordEvent(String event) {\n' +
      '        defaultLogger.log("Event: " + event);  // console\n' +
      '        auditLogger.log("Audit: " + event);    // file\n' +
      '    }\n' +
      '}',
    difficulty: 'easy',
    tags: ['Primary', 'Qualifier', 'interface', 'multiple-beans']
  },
  {
    id: 'cb4',
    question: 'Write a @PostConstruct that validates required configuration and fails startup if something is wrong.',
    answer:
      '@Service\n' +
      'public class PaymentConfig {\n\n' +
      '    @Value("${payment.api-key:}") // empty string if not set\n' +
      '    private String apiKey;\n\n' +
      '    @Value("${payment.base-url:}")\n' +
      '    private String baseUrl;\n\n' +
      '    @PostConstruct\n' +
      '    public void validate() {\n' +
      '        // Throw at startup rather than discovering the misconfiguration\n' +
      '        // during the first real payment request\n' +
      '        if (apiKey == null || apiKey.isBlank()) {\n' +
      '            throw new IllegalStateException(\n' +
      '                "payment.api-key is required but not set in application.properties");\n' +
      '        }\n' +
      '        if (baseUrl == null || baseUrl.isBlank()) {\n' +
      '            throw new IllegalStateException(\n' +
      '                "payment.base-url is required but not set in application.properties");\n' +
      '        }\n' +
      '        System.out.println("PaymentConfig validated. Connected to: " + baseUrl);\n' +
      '    }\n\n' +
      '    public String getApiKey() { return apiKey; }\n' +
      '    public String getBaseUrl() { return baseUrl; }\n' +
      '}\n\n' +
      '// If payment.api-key is missing, app refuses to start with a clear error.\n' +
      '// Much better than a cryptic NPE on the first payment request in production.',
    difficulty: 'easy',
    tags: ['PostConstruct', 'validation', 'startup', 'fail-fast']
  },
  {
    id: 'cb5',
    question: 'Write a service that uses @DependsOn to ensure a database setup bean runs first.',
    answer:
      '// Step 1: the setup bean\n' +
      '@Service("dbSetup")\n' +
      'public class DatabaseSetupService {\n\n' +
      '    @PostConstruct\n' +
      '    public void setup() {\n' +
      '        System.out.println("DatabaseSetup: creating indexes and seeding reference data...");\n' +
      '        // simulate some work\n' +
      '        System.out.println("DatabaseSetup: done.");\n' +
      '    }\n' +
      '}\n\n' +
      '// Step 2: the service that needs setup to have run first\n' +
      '@Service\n' +
      '@DependsOn("dbSetup") // dbSetup runs BEFORE this bean is created\n' +
      'public class ProductService {\n\n' +
      '    @PostConstruct\n' +
      '    public void init() {\n' +
      '        // We can safely query — the database is set up\n' +
      '        System.out.println("ProductService: initializing with seeded data.");\n' +
      '    }\n' +
      '}\n\n' +
      '// Output order is guaranteed:\n' +
      '// DatabaseSetup: creating indexes and seeding reference data...\n' +
      '// DatabaseSetup: done.\n' +
      '// ProductService: initializing with seeded data.',
    difficulty: 'easy',
    tags: ['DependsOn', 'ordering', 'PostConstruct']
  },
  {
    id: 'cb6',
    question: 'Rewrite this class to use constructor injection instead of field injection. Explain the benefit.',
    answer:
      '// BEFORE: field injection (avoid this)\n' +
      '@Service\n' +
      'public class ReportService {\n' +
      '    @Autowired private UserRepository userRepo;\n' +
      '    @Autowired private EmailService emailService;\n' +
      '    @Autowired private ReportFormatter formatter;\n\n' +
      '    public void generateAndSend(Long userId) {\n' +
      '        String report = formatter.format(userRepo.findById(userId));\n' +
      '        emailService.send(userRepo.findEmail(userId), report);\n' +
      '    }\n' +
      '}\n\n' +
      '// AFTER: constructor injection (do this)\n' +
      '@Service\n' +
      'public class ReportService {\n' +
      '    private final UserRepository userRepo;\n' +
      '    private final EmailService emailService;\n' +
      '    private final ReportFormatter formatter;\n\n' +
      '    // @Autowired is optional when there is only one constructor\n' +
      '    public ReportService(UserRepository userRepo,\n' +
      '                         EmailService emailService,\n' +
      '                         ReportFormatter formatter) {\n' +
      '        this.userRepo = userRepo;\n' +
      '        this.emailService = emailService;\n' +
      '        this.formatter = formatter;\n' +
      '    }\n\n' +
      '    public void generateAndSend(Long userId) {\n' +
      '        String report = formatter.format(userRepo.findById(userId));\n' +
      '        emailService.send(userRepo.findEmail(userId), report);\n' +
      '    }\n' +
      '}\n\n' +
      '// Benefits of constructor injection:\n' +
      '// 1. Fields are final — cannot be accidentally changed after creation\n' +
      '// 2. Testable without Spring: new ReportService(mockUserRepo, mockEmail, mockFormatter)\n' +
      '// 3. Dependencies are visible from the constructor — no hidden surprises\n' +
      '// 4. Compile-time error if a dependency is missing',
    difficulty: 'easy',
    tags: ['constructor-injection', 'field-injection', 'refactoring', 'testability']
  },
  {
    id: 'cb7',
    question: 'Write a BeanPostProcessor that prints the name of every bean as it is initialized.',
    answer:
      '@Component\n' +
      'public class BeanInitLogger implements BeanPostProcessor {\n\n' +
      '    // Called before a bean\'s @PostConstruct\n' +
      '    @Override\n' +
      '    public Object postProcessBeforeInitialization(Object bean, String beanName) {\n' +
      '        System.out.println("INIT START: " + beanName +\n' +
      '            " (" + bean.getClass().getSimpleName() + ")");\n' +
      '        return bean; // must return the bean!\n' +
      '    }\n\n' +
      '    // Called after a bean\'s @PostConstruct\n' +
      '    @Override\n' +
      '    public Object postProcessAfterInitialization(Object bean, String beanName) {\n' +
      '        System.out.println("INIT DONE:  " + beanName);\n' +
      '        return bean; // must return the bean!\n' +
      '    }\n' +
      '}\n\n' +
      '// Sample output during startup:\n' +
      '// INIT START: userRepository (SimpleJpaRepository)\n' +
      '// INIT DONE:  userRepository\n' +
      '// INIT START: emailService (EmailServiceImpl)\n' +
      '// INIT DONE:  emailService\n' +
      '// ...\n\n' +
      '// Note: if you return null from either method, Spring throws a NullPointerException.\n' +
      '// Always return the bean (or the replacement object).',
    difficulty: 'medium',
    tags: ['BeanPostProcessor', 'debugging', 'startup']
  },
  {
    id: 'cb8',
    question: 'Write a @PreDestroy that cleanly shuts down an ExecutorService (thread pool).',
    answer:
      '@Service\n' +
      'public class BackgroundTaskService {\n\n' +
      '    private ExecutorService executorService;\n\n' +
      '    @PostConstruct\n' +
      '    public void startPool() {\n' +
      '        executorService = java.util.concurrent.Executors.newFixedThreadPool(4);\n' +
      '        System.out.println("Thread pool started with 4 threads.");\n' +
      '    }\n\n' +
      '    public void runTask(Runnable task) {\n' +
      '        executorService.submit(task);\n' +
      '    }\n\n' +
      '    @PreDestroy\n' +
      '    public void stopPool() {\n' +
      '        System.out.println("Shutting down thread pool...");\n' +
      '        executorService.shutdown(); // stop accepting new tasks\n' +
      '        try {\n' +
      '            // Wait up to 10 seconds for running tasks to finish\n' +
      '            if (!executorService.awaitTermination(10, java.util.concurrent.TimeUnit.SECONDS)) {\n' +
      '                executorService.shutdownNow(); // force stop if still running\n' +
      '                System.out.println("Force-stopped thread pool.");\n' +
      '            } else {\n' +
      '                System.out.println("Thread pool shut down cleanly.");\n' +
      '            }\n' +
      '        } catch (InterruptedException e) {\n' +
      '            executorService.shutdownNow();\n' +
      '            Thread.currentThread().interrupt();\n' +
      '        }\n' +
      '    }\n' +
      '}',
    difficulty: 'medium',
    tags: ['PreDestroy', 'ExecutorService', 'resource-cleanup', 'thread-pool']
  },
  {
    id: 'cb9',
    question: 'Fix this circular dependency by extracting a shared bean.',
    answer:
      '// PROBLEM: LoginService needs AuditService, AuditService needs LoginService\n' +
      '// Spring fails at startup.\n\n' +
      '// WRONG approach — just adds @Lazy which hides the problem:\n' +
      '// @Autowired @Lazy AuditService auditService;  <- do not do this\n\n' +
      '// RIGHT approach: extract shared logic into EventPublisher\n\n' +
      '@Service\n' +
      'public class EventPublisher {\n' +
      '    // Both LoginService and AuditService depend on this.\n' +
      '    // Neither depends on the other.\n' +
      '    private final java.util.List<String> eventLog = new java.util.ArrayList<>();\n\n' +
      '    public void publish(String event) {\n' +
      '        eventLog.add(event);\n' +
      '        System.out.println("EVENT: " + event);\n' +
      '    }\n' +
      '}\n\n' +
      '@Service\n' +
      'public class LoginService {\n' +
      '    private final EventPublisher eventPublisher;\n\n' +
      '    public LoginService(EventPublisher eventPublisher) {\n' +
      '        this.eventPublisher = eventPublisher;\n' +
      '    }\n\n' +
      '    public void login(String username) {\n' +
      '        System.out.println(username + " logged in");\n' +
      '        eventPublisher.publish("USER_LOGGED_IN: " + username);\n' +
      '    }\n' +
      '}\n\n' +
      '@Service\n' +
      'public class AuditService {\n' +
      '    private final EventPublisher eventPublisher;\n\n' +
      '    public AuditService(EventPublisher eventPublisher) {\n' +
      '        this.eventPublisher = eventPublisher;\n' +
      '    }\n\n' +
      '    public void recordAction(String action) {\n' +
      '        eventPublisher.publish("AUDIT: " + action);\n' +
      '    }\n' +
      '}',
    difficulty: 'medium',
    tags: ['circular', 'refactoring', 'EventPublisher', 'design']
  },
  {
    id: 'cb10',
    question: 'Write a simple Spring Boot test that verifies @PostConstruct ran and injected the correct value.',
    answer:
      '@SpringBootTest\n' +
      'class ProductCacheServiceTest {\n\n' +
      '    @Autowired\n' +
      '    private ProductCacheService cacheService;\n\n' +
      '    @Test\n' +
      '    void postConstructShouldLoadCache() {\n' +
      '        // If @PostConstruct ran, the cache is populated\n' +
      '        // If Spring did not call @PostConstruct, getProducts() returns null or empty\n' +
      '        List<String> products = cacheService.getProducts();\n\n' +
      '        assertNotNull(products, "@PostConstruct should have run and loaded the cache");\n' +
      '        assertFalse(products.isEmpty(), "Cache should have at least one product");\n' +
      '    }\n\n' +
      '    @Test\n' +
      '    void injectedValueShouldBeCorrect() {\n' +
      '        // Verifies that @Value injection worked\n' +
      '        assertNotNull(cacheService.getGreeting());\n' +
      '        assertFalse(cacheService.getGreeting().isBlank());\n' +
      '    }\n' +
      '}\n\n' +
      '// Key insight: by the time the test runs, Spring has already:\n' +
      '// 1. Created ProductCacheService\n' +
      '// 2. Injected all @Autowired dependencies\n' +
      '// 3. Called @PostConstruct\n' +
      '// So testing @PostConstruct side-effects is just testing the resulting state.',
    difficulty: 'medium',
    tags: ['test', 'SpringBootTest', 'PostConstruct', 'verification']
  },
  {
    id: 'cb11',
    question: 'What is wrong with this code? How do you fix it?\n\n@Service public class ReportService {\n  @Autowired EmailService emailService;\n  \n  public void sendMonthlyReports() {\n    this.sendReport("admin@company.com");\n  }\n  \n  @Transactional\n  public void sendReport(String email) {\n    // save report to db and send email\n  }\n}',
    answer:
      '// PROBLEM: sendReport is @Transactional but is called via this.sendReport()\n' +
      '// from within the same class. The call bypasses the Spring proxy.\n' +
      '// No transaction is started. Changes are not rolled back on error.\n\n' +
      '// WRONG fix: do nothing and hope it works\n' +
      '// ALSO WRONG: add @Transactional to sendMonthlyReports (still self-invocation)\n\n' +
      '// RIGHT fix: extract sendReport into a separate @Service\n\n' +
      '@Service\n' +
      'public class ReportSenderService {\n\n' +
      '    @Autowired\n' +
      '    private EmailService emailService;\n\n' +
      '    @Transactional // now works — callers go through the proxy\n' +
      '    public void sendReport(String email) {\n' +
      '        // save report to db and send email — fully transactional\n' +
      '    }\n' +
      '}\n\n' +
      '@Service\n' +
      'public class ReportService {\n\n' +
      '    @Autowired\n' +
      '    private ReportSenderService reportSender; // inject the other service\n\n' +
      '    public void sendMonthlyReports() {\n' +
      '        reportSender.sendReport("admin@company.com"); // goes through proxy now!\n' +
      '    }\n' +
      '}',
    difficulty: 'hard',
    tags: ['Transactional', 'self-invocation', 'proxy', 'fix']
  },
  {
    id: 'cb12',
    question: 'Write a bean that implements ApplicationContextAware to look up all beans of a specific type at startup.',
    answer:
      '@Service\n' +
      'public class PluginRegistry implements ApplicationContextAware {\n\n' +
      '    private ApplicationContext ctx;\n' +
      '    private Map<String, Plugin> plugins;\n\n' +
      '    // Spring calls this automatically — gives us access to the container\n' +
      '    @Override\n' +
      '    public void setApplicationContext(ApplicationContext ctx) {\n' +
      '        this.ctx = ctx;\n' +
      '    }\n\n' +
      '    @PostConstruct\n' +
      '    public void loadPlugins() {\n' +
      '        // ctx is set by Spring before @PostConstruct runs\n' +
      '        plugins = ctx.getBeansOfType(Plugin.class);\n' +
      '        System.out.println("Found " + plugins.size() + " plugins: " + plugins.keySet());\n' +
      '    }\n\n' +
      '    public Plugin getPlugin(String name) {\n' +
      '        return plugins.get(name);\n' +
      '    }\n' +
      '}\n\n' +
      'interface Plugin { void execute(); }\n\n' +
      '@Service class PdfPlugin implements Plugin {\n' +
      '    @Override public void execute() { System.out.println("PDF plugin running"); }\n' +
      '}\n\n' +
      '@Service class CsvPlugin implements Plugin {\n' +
      '    @Override public void execute() { System.out.println("CSV plugin running"); }\n' +
      '}\n\n' +
      '// Tip: since Spring 4.3, you can also just @Autowire ApplicationContext directly.\n' +
      '// ApplicationContextAware is the older style.',
    difficulty: 'medium',
    tags: ['ApplicationContextAware', 'PostConstruct', 'beansOfType', 'plugin-pattern']
  }
];

// ─── SENIOR SCENARIOS ─────────────────────────────────────────────────────────
const seniorScenarios = [
  {
    id: 's1',
    question: 'Your team reports that in production, all users are seeing each other\'s shopping cart contents. Carts are supposed to be separate per user. The Cart class is @Scope("prototype"). What went wrong and how do you fix it?',
    answer: 'Classic scope mismatch. Someone injected the prototype Cart directly into a singleton CheckoutService with @Autowired. Spring created CheckoutService once and injected one Cart at that moment. That one Cart instance is now shared by all users for the lifetime of the application. To verify: add a print of cart.hashCode() on each request — it will be the same number for every user. Fix: replace the @Autowired Cart field with @Autowired ObjectFactory<Cart>. Change every place that uses `this.cart` to `cartFactory.getObject()`. Each call to getObject() creates a fresh Cart instance. Add a test: call getCart() twice in the same test and assert the hashCodes are different. Deploy with the fix and the user isolation is restored.',
    difficulty: 'medium',
    tags: ['prototype', 'scope-mismatch', 'production-bug', 'ObjectFactory']
  },
  {
    id: 's2',
    question: 'Your Spring Boot application starts correctly on your laptop but crashes in production with "NullPointerException at PaymentService.java:23" on the very first request. Line 23 is inside @PostConstruct. What are you looking for?',
    answer: 'If @PostConstruct runs but throws NPE, one of the @Autowired fields used inside it is null. This happens for one of three reasons: (1) The field has @Autowired but the bean it needs does not exist in the production context — maybe it is guarded by @Profile("dev") or @ConditionalOnProperty and that property is not set in production. (2) The field references a class that is not being scanned in production — check that @ComponentScan covers the right packages and that no package is excluded in a production profile. (3) The app has two application contexts (parent + child) and the bean is registered in the child context but @Autowired is looking in the parent. To diagnose: add a null check at the top of @PostConstruct and log which fields are null. Then check your production environment\'s active profiles and property values against development.',
    difficulty: 'hard',
    tags: ['PostConstruct', 'NPE', 'production', 'profile', 'debugging']
  },
  {
    id: 's3',
    question: 'A junior developer added @Primary to the MockEmailService in a test class. Now real emails are not being sent in production. How did this happen and what is the safe fix?',
    answer: 'The MockEmailService with @Primary was in a class that is compiled into the main source set, not just the test source set (src/main/java instead of src/test/java). Or it was in src/test/java but the production build somehow includes test classes. In production, both RealEmailService and MockEmailService are present. @Primary on the mock makes Spring pick the mock as the default everywhere — all email calls go to MockEmailService which does nothing. Nobody gets their emails. Immediate fix: remove @Primary from MockEmailService and add @Profile("test") to the class so Spring only registers it when the test profile is active. Better fix: move MockEmailService to src/test/java entirely so it can never be included in a production build. Prevention: add a startup log that prints the class name of the active EmailService. Set up an alert if it ever shows "Mock" in production.',
    difficulty: 'hard',
    tags: ['Primary', 'mock', 'profile', 'production-incident']
  },
  {
    id: 's4',
    question: 'After upgrading from Spring Boot 2 to Spring Boot 3, five services fail with "The dependencies of some of the beans form a cycle." They worked fine before. What changed and what is your approach?',
    answer: 'Spring Framework 6 (which Spring Boot 3 uses) changed the default behavior: circular dependencies now throw an exception instead of being silently resolved. In Spring Boot 2, Spring would create beans with empty fields first, then fill in the circular references in a second pass. This "worked" but left a window where beans had null fields. Spring Boot 3 made this an error by default to force you to fix the actual design problem. Immediate unblock: add spring.main.allow-circular-references=true to application.properties to restore old behavior and get the team unblocked. Then fix each cycle properly: read the error message (Spring prints the exact cycle chain), identify what shared logic is causing the mutual dependency, extract it into a new bean that both sides depend on. Once all cycles are fixed, remove the allow-circular-references flag. Add an ArchUnit test that asserts no cycles exist — this catches regressions before they reach production.',
    difficulty: 'hard',
    tags: ['Spring6', 'circular', 'migration', 'upgrade', 'allow-circular-references']
  },
  {
    id: 's5',
    question: 'Your app runs perfectly during load testing but after 24 hours in production the database connection pool is exhausted. You suspect a resource leak in a prototype-scoped bean. How do you investigate and fix it?',
    answer: 'Investigation: add two static AtomicInteger counters to the prototype bean — increment in the constructor, decrement in @PreDestroy. After 24 hours, if the "created" counter is 100,000 and the "destroyed" counter is 0, @PreDestroy is never firing — confirming the prototype leak. Also check the connection pool monitoring: if active connections grow monotonically and never drop back, connections are being opened (in @PostConstruct of the prototype) but never closed. Root cause: Spring does not call @PreDestroy on prototype beans. Every call to getBean() or ObjectFactory.getObject() creates a new bean, each opens a connection, none are closed. Fix options: (1) if the prototype holds a connection, make it singleton and redesign state management — this is the cleanest fix. (2) Track all created prototype instances in a WeakReference registry and close them in a scheduled cleanup task. (3) Use a try-with-resources pattern: the caller gets the prototype, uses it, and explicitly calls destroy(). Short-term hotfix: reduce the prototype creation rate by checking if the bean really needs to be prototype-scoped or if singleton with request-scoped state management would work.',
    difficulty: 'hard',
    tags: ['prototype', 'PreDestroy', 'connection-pool', 'leak', 'production']
  },
  {
    id: 's6',
    question: 'A new team member put business logic inside a Spring bean\'s constructor that calls an @Autowired service. It worked in their local test. In the full integration test it throws NPE. Explain why and what rule to enforce going forward.',
    answer: 'In the local test, they probably used Mockito @InjectMocks which creates the object differently and can sometimes satisfy the dependency before the constructor runs. In the full Spring integration test, Spring creates the object via the constructor first — all @Autowired fields are null at that point — then injects fields. Any use of an @Autowired field inside the constructor throws NPE in a real Spring context. The rule: never access @Autowired fields inside the constructor. The constructor is for assigning constructor parameters to fields. All logic that needs injected dependencies belongs in @PostConstruct. Enforce this in code review with a comment convention or an ArchUnit rule: "no method calls on @Autowired fields inside constructors." To fix the existing code: move the business logic to a @PostConstruct method. The result is identical behavior but with the correct Spring lifecycle.',
    difficulty: 'medium',
    tags: ['constructor', 'PostConstruct', 'NPE', 'lifecycle', 'code-review']
  }
];

// ─── WRONG ANSWERS ────────────────────────────────────────────────────────────
const wrongAnswers = [
  {
    id: 'w1',
    wrong: '@PostConstruct runs immediately after the constructor, before Spring injects anything.',
    correction: 'The opposite is true. Spring always injects @Autowired fields, @Value properties, and setter dependencies BEFORE calling @PostConstruct. The entire purpose of @PostConstruct is to give you a safe place to write setup code where all your dependencies are already available. If @PostConstruct ran before injection, it would be useless — you could not use any of your autowired services.',
    whyBelivedWrong: 'The name "PostConstruct" sounds like "right after construction." It actually means "after the bean is fully constructed," which includes injection. "Fully constructed" = built + all dependencies handed over.'
  },
  {
    id: 'w2',
    wrong: '@Scope("prototype") means Spring creates a new instance every time a method is called.',
    correction: 'Prototype scope means Spring creates a new instance every time someone ASKS FOR the bean — via @Autowired injection, getBean(), or ObjectFactory.getObject(). It does NOT create a new instance per method call. Once you have a reference to a prototype bean, that reference stays the same for all method calls on it. A new instance is only created when you explicitly ask for one.',
    whyBelivedWrong: 'The word "prototype" combined with "per request" thinking makes people assume every call gets a new object. The scope applies to bean acquisition, not method invocation.'
  },
  {
    id: 'w3',
    wrong: '@Autowired fields are injected before the constructor runs.',
    correction: 'The constructor always runs first. That is how object creation works in Java — you cannot set fields on an object before it exists. Spring creates the object using the constructor, then injects fields afterwards. This is why @Autowired fields are null inside constructors. If you need dependencies at construction time, list them as constructor parameters — Spring will provide them when calling the constructor.',
    whyBelivedWrong: 'Developers expect Spring to "set up everything before handing the object over." Spring does fully set up the object — but construction always comes before field setting, by Java language rules.'
  },
  {
    id: 'w4',
    wrong: '@PreDestroy is called for all beans including prototype beans when the app shuts down.',
    correction: 'Spring calls @PreDestroy only for singleton beans. After creating a prototype bean and handing it over, Spring forgets about it — it holds no reference. With no reference, it cannot call @PreDestroy. This is by design: prototype means the caller owns the lifecycle after creation. If your prototype bean holds a database connection, you are responsible for closing it. This is one of the most common resource leaks in Spring applications.',
    whyBelivedWrong: 'Developers assume Spring tracks everything it creates. It tracks singletons fully. Prototypes only up to creation — after handoff, it is the caller\'s responsibility.'
  },
  {
    id: 'w5',
    wrong: '@DependsOn injects the named bean into the annotated bean.',
    correction: '@DependsOn only controls initialization ORDER. No injection happens. No reference is stored. The named bean is initialized before the current bean, and that is all. After startup, the annotated bean has no programmatic access to the @DependsOn bean. If you also need a reference to use it, you must @Autowire it separately — @DependsOn and @Autowired are independent.',
    whyBelivedWrong: '"Depends on" sounds exactly like "needs a reference to." In Spring\'s terminology, "depends on" only means "initialize this first." Injection is a separate concern.'
  },
  {
    id: 'w6',
    wrong: 'Adding @Lazy to one of two circularly-dependent beans fixes the circular dependency problem.',
    correction: '@Lazy hides the circular dependency by injecting a proxy instead of the real bean, allowing startup to succeed. But the circular relationship still exists in your code — A still logically depends on B and B still logically depends on A. You have masked a design problem. The real fix is to extract a third class that both A and B depend on, eliminating the circle structurally. Always add a comment when using @Lazy for this reason, and create a follow-up task to fix the design.',
    whyBelivedWrong: '@Lazy makes the startup error disappear and the app works. It looks fixed. But "no error at startup" is not the same as "the design problem is resolved."'
  },
  {
    id: 'w7',
    wrong: 'Singleton scope means the class can only be instantiated once in the entire JVM.',
    correction: 'Singleton scope in Spring means ONE instance per ApplicationContext, not per JVM. If you have two ApplicationContexts in the same JVM (common in Spring MVC with a root context and a web context, or in tests that create multiple contexts), each context has its own singleton instance of the bean. They are different objects. Also, nothing stops you from creating additional instances with `new MyService()` outside of Spring — Spring\'s singleton scope only applies to beans Spring itself manages.',
    whyBelivedWrong: 'The classic Singleton design pattern from GoF means "one per JVM." Spring reused the word with a different scope: "one per Spring container."'
  },
  {
    id: 'w8',
    wrong: 'You need @Autowired on a constructor for Spring to use it for injection.',
    correction: 'Since Spring 4.3, if a class has exactly ONE constructor, Spring automatically uses it for injection without needing @Autowired. You only need @Autowired when there are multiple constructors and you want Spring to use a specific one. Most modern Spring Boot code omits @Autowired on single-constructor classes entirely. When combined with Lombok\'s @RequiredArgsConstructor, you get clean constructor injection with zero Spring annotations in your class.',
    whyBelivedWrong: 'Old Spring examples and tutorials always showed @Autowired because they were written before Spring 4.3. Many learning resources have not been updated.'
  }
];

// ─── CHEATSHEET ───────────────────────────────────────────────────────────────
const cheatsheet = [
  { concept: '@Component / @Service / @Repository', oneLiner: 'Tell Spring: "manage this class as a bean"', gotcha: 'Class must be in a package Spring scans (sub-package of @SpringBootApplication)' },
  { concept: '@Autowired', oneLiner: 'Ask Spring: "inject the matching bean here"', gotcha: 'Field is null in the constructor — use @PostConstruct or constructor injection instead' },
  { concept: '@PostConstruct', oneLiner: 'Runs after all @Autowired fields are set — your safe setup zone', gotcha: 'Must be void, no parameters. Never runs if the class is created with `new` outside Spring.' },
  { concept: '@PreDestroy', oneLiner: 'Runs on app shutdown — release resources here', gotcha: 'NOT called for prototype beans. Only singleton beans get this cleanup call.' },
  { concept: '@Value("${key:default}")', oneLiner: 'Read a value from application.properties', gotcha: 'Also null in constructor — use in @PostConstruct or constructor parameter' },
  { concept: '@Scope("singleton")', oneLiner: 'Default. One shared instance for the whole app.', gotcha: 'Do not store per-user/per-request state in a singleton' },
  { concept: '@Scope("prototype")', oneLiner: 'New instance every time it is requested', gotcha: 'Spring does NOT call @PreDestroy. Injecting directly into singleton defeats the scope — use ObjectFactory.' },
  { concept: '@Primary', oneLiner: 'Default bean when multiple match. Spring picks this one.', gotcha: 'Two @Primary beans = same error as none. Never add @Primary to test doubles without @Profile.' },
  { concept: '@Qualifier("name")', oneLiner: 'Explicitly name which bean you want at an injection point', gotcha: 'Name must exactly match the bean name. @Qualifier always overrides @Primary.' },
  { concept: 'ObjectFactory<T>', oneLiner: 'Call getObject() each time you need a fresh prototype instance', gotcha: 'The ObjectFactory itself is a singleton — only what getObject() returns is a new prototype.' },
  { concept: '@DependsOn("beanName")', oneLiner: 'Force beanName to initialize first. Ordering only — no injection.', gotcha: 'Does not inject. Does not guarantee the depended bean succeeded. Ordering only.' },
  { concept: '@Lazy', oneLiner: 'Defer bean creation to first use (not at startup)', gotcha: 'Errors from lazy bean creation hit users, not startup logs. Do not @Lazy beans that must validate at startup.' },
  { concept: 'BeanPostProcessor', oneLiner: 'Run code around every bean\'s initialization — used by @Transactional, AOP', gotcha: 'Must return the bean from both methods. BPPs themselves cannot use @Transactional.' },
  { concept: 'Constructor injection', oneLiner: 'List dependencies as constructor params — Spring provides them', gotcha: '@Autowired optional if there is only one constructor (Spring 4.3+). Preferred over field injection.' },
  { concept: 'Circular dependency', oneLiner: 'A needs B and B needs A — Spring cannot start', gotcha: '@Lazy hides it, does not fix it. Extract a third shared class to break the cycle structurally.' }
];

// ─── ASSEMBLE ─────────────────────────────────────────────────────────────────
const day = {
  day: 39,
  title: 'Spring Bean Lifecycle & Advanced DI',
  estimatedHours: 4,
  difficulty: 'Advanced',
  level: 'Advanced',
  track: 'Mid-Level',
  tags: ['Mid-Level', 'Advanced', 'Phase 5', 'Interview Prep', 'Spring', 'Bean Lifecycle', 'DI', 'Satyverse(Satyam Parmar)'],
  prerequisites: ['Day 38', 'Day 37'],
  learningObjectives: [
    'Explain in simple words why Spring manages objects instead of you using `new`',
    'Describe the lifecycle order: constructor → injection → @PostConstruct → use → @PreDestroy',
    'Identify why @Autowired fields are null in constructors and where to use them safely',
    'Explain the scope mismatch bug and fix it using ObjectFactory',
    'Disambiguate multiple beans of the same type using @Primary and @Qualifier',
    'Recognize and fix circular dependency as a design problem, not a Spring trick',
    'Understand how @Transactional works through proxies and why self-invocation breaks it'
  ],
  sections: [
    { type: 'why', title: 'Why Spring manages objects — and why this matters more than you think', content: why },
    { type: 'theory', title: 'Spring Bean Lifecycle & Dependency Injection — from zero to clear', content: theory },
    {
      type: 'code',
      title: 'Step 1 — See the lifecycle in plain Java (no Spring yet)',
      language: 'java',
      filename: 'LifecycleDemo.java',
      level: 'basic',
      description: 'Before touching Spring, understand what it does manually. This code shows every lifecycle step — constructor, injection, PostConstruct, usage, PreDestroy — in plain Java so the sequence is crystal clear. Spring does exactly these steps, just automatically.',
      code: basicCode,
      output: basicOutput
    },
    {
      type: 'code',
      title: 'Step 2 — Real Spring annotations: @PostConstruct, @PreDestroy, @Primary, @Qualifier, scope mismatch',
      language: 'java',
      filename: 'Day39Intermediate.java',
      level: 'intermediate',
      description: 'Four real Spring scenarios with actual annotations: (1) a cache service that loads data in @PostConstruct and clears in @PreDestroy, (2) two notification implementations with @Primary and @Qualifier, (3) the scope mismatch bug shown side-by-side with the ObjectFactory fix, (4) @Value reading from properties.',
      code: intermediateCode,
      output: intermediateOutput
    },
    {
      type: 'code',
      title: 'Step 3 — Advanced: BeanPostProcessor, @DependsOn, circular fix, @Transactional proxy secret',
      language: 'java',
      filename: 'Day39Advanced.java',
      level: 'advanced',
      description: 'Four production-grade patterns: (1) a BeanPostProcessor that detects slow-starting beans, (2) @DependsOn for guaranteed initialization order, (3) circular dependency fixed properly by extracting an EventBus, (4) how @Transactional actually works through proxies and why self-invocation silently ignores it.',
      code: advancedCode,
      output: advancedOutput
    },
    diagram,
    {
      type: 'pitfalls',
      title: 'Common mistakes — Spring Bean Lifecycle & DI',
      items: pitfalls
    },
    exercise,
    {
      type: 'conceptual',
      title: 'Interview Questions — Conceptual',
      items: conceptual
    },
    {
      type: 'codeBased',
      title: 'Interview Questions — Code Based',
      items: codeBased
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
    },
    {
      type: 'video',
      title: 'Spring Bean Lifecycle & Dependency Injection — Video Walkthrough',
      url: 'https://www.youtube.com/watch?v=IJUwG0iGZOY',
      description: 'Watch this after reading the theory. It shows the lifecycle visually with live code examples.'
    }
  ]
};

writeFileSync(OUT, JSON.stringify(day, null, 2), 'utf-8');
console.log('Written:', OUT);
console.log('Sections:', day.sections.length);
console.log('Conceptual Q&As:', conceptual.length);
console.log('CodeBased Q&As:', codeBased.length);
console.log('SeniorScenario:', seniorScenarios.length);
console.log('WrongAnswers:', wrongAnswers.length);
console.log('Cheatsheet rows:', cheatsheet.length);
console.log('Pitfalls:', pitfalls.length);
