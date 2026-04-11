import { writeFileSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE = path.join(__dirname, '../public/data/days/phase5-day39.json');
const day = JSON.parse(readFileSync(FILE, 'utf-8'));

// ─── PITFALLS (enhanced with code examples) ───────────────────────────────────
const pitfalls = {
  type: 'pitfalls',
  title: 'Common Pitfalls — Spring Bean Lifecycle & Advanced DI',
  items: [
    {
      id: 'p1',
      title: 'Using an @Autowired field inside the constructor',
      severity: 'high',
      symptom: 'NullPointerException in the constructor when accessing an @Autowired field',
      cause: 'Spring calls your constructor first to create the object, then injects @Autowired fields in a second step. Inside the constructor, all @Autowired fields are still null — injection has not happened yet.',
      codeExample:
        '// BUG — repo is null here, Spring has not injected it yet\n' +
        '@Service\n' +
        'public class ProductService {\n' +
        '    @Autowired\n' +
        '    private ProductRepository repo;\n\n' +
        '    public ProductService() {\n' +
        '        List<Product> all = repo.findAll(); // NullPointerException!\n' +
        '    }\n' +
        '}\n\n' +
        '// FIX — move the logic to @PostConstruct\n' +
        '@Service\n' +
        'public class ProductService {\n' +
        '    @Autowired\n' +
        '    private ProductRepository repo;\n\n' +
        '    private List<Product> all;\n\n' +
        '    @PostConstruct\n' +
        '    public void init() {\n' +
        '        all = repo.findAll(); // safe — repo is injected before this runs\n' +
        '    }\n' +
        '}',
      fix: 'Move any logic that uses @Autowired fields to a @PostConstruct method. That is guaranteed to run after all injection is complete. Alternatively, use constructor injection — then the dependency is a constructor parameter and is available immediately.',
      detection: 'If you get NPE in a constructor and the field has @Autowired, this is the cause 100% of the time. Add a null-check log at the top of the constructor to confirm which field is null.'
    },
    {
      id: 'p2',
      title: 'Injecting a prototype bean directly into a singleton — scope mismatch',
      severity: 'high',
      symptom: 'A bean that should be unique per user or request is shared across all callers — state leaks, same ID, same cart, same context object for everyone',
      cause: 'Spring creates the singleton once. At that one moment it @Autowires one prototype instance. That same instance stays in the singleton\'s field forever. Prototype scope is silently defeated — you get singleton behaviour.',
      codeExample:
        '// BUG — Cart is prototype but injected into a singleton\n' +
        '@Component @Scope("prototype")\n' +
        'public class Cart {\n' +
        '    private List<String> items = new ArrayList<>();\n' +
        '    public void add(String item) { items.add(item); }\n' +
        '    public List<String> getItems() { return items; }\n' +
        '}\n\n' +
        '@Service // singleton\n' +
        'public class OrderService {\n' +
        '    @Autowired\n' +
        '    private Cart cart; // ONE Cart injected at startup — shared by all users!\n\n' +
        '    public void addItem(String item) { cart.add(item); }\n' +
        '}\n' +
        '// User A adds "Pizza", User B adds "Burger" -> both see [Pizza, Burger]\n\n' +
        '// FIX — inject ObjectFactory, create fresh Cart per call\n' +
        '@Service\n' +
        'public class OrderService {\n' +
        '    @Autowired\n' +
        '    private ObjectFactory<Cart> cartFactory;\n\n' +
        '    public Cart getCart() {\n' +
        '        return cartFactory.getObject(); // new Cart instance every time\n' +
        '    }\n' +
        '}',
      fix: 'Inject ObjectFactory<T> or Provider<T> instead of the prototype directly. Call getObject() or get() each time you need a fresh instance. Alternatively, annotate the prototype with @Scope(proxyMode = ScopedProxyMode.TARGET_CLASS) — Spring injects a proxy that creates a new instance on each method call transparently.',
      detection: 'Print the prototype bean\'s System.identityHashCode() inside a method on two separate "user" calls. If both print the same number, you have confirmed scope mismatch.'
    },
    {
      id: 'p3',
      title: '@Transactional method called from within the same class (self-invocation)',
      severity: 'high',
      symptom: 'Database changes are not rolled back on exception even though the method has @Transactional. No error is thrown — the method runs, changes are committed, but the transaction boundary is completely ignored.',
      cause: '@Transactional works through a CGLIB proxy that Spring wraps around your bean. When you call this.method() from inside the same class, you call on the real object — the proxy is bypassed. No proxy = no transaction start.',
      codeExample:
        '// BUG — self-invocation bypasses the @Transactional proxy\n' +
        '@Service\n' +
        'public class OrderService {\n' +
        '    public void placeOrder(String item) {\n' +
        '        this.saveOrder(item); // direct call — proxy bypassed — NO transaction!\n' +
        '    }\n\n' +
        '    @Transactional\n' +
        '    public void saveOrder(String item) {\n' +
        '        orderRepo.save(item); // commits even if exception thrown next line\n' +
        '        notifyWarehouse(item); // if this throws, order is NOT rolled back\n' +
        '    }\n' +
        '}\n\n' +
        '// FIX — move saveOrder to a separate @Service\n' +
        '@Service\n' +
        'public class OrderPersistenceService {\n' +
        '    @Transactional // now works — external callers go through the proxy\n' +
        '    public void saveOrder(String item) {\n' +
        '        orderRepo.save(item);\n' +
        '        notifyWarehouse(item);\n' +
        '    }\n' +
        '}\n\n' +
        '@Service\n' +
        'public class OrderService {\n' +
        '    @Autowired private OrderPersistenceService persistenceService;\n\n' +
        '    public void placeOrder(String item) {\n' +
        '        persistenceService.saveOrder(item); // goes through proxy — transaction works\n' +
        '    }\n' +
        '}',
      fix: 'Move the @Transactional method to a different @Service class. All callers must go through an @Autowired reference (the proxy), never through `this`. You can verify a transaction is active with TransactionSynchronizationManager.isActualTransactionActive().',
      detection: 'Add a log inside the method: System.out.println("Transaction active: " + TransactionSynchronizationManager.isActualTransactionActive()). If it prints false, the proxy was bypassed.'
    },
    {
      id: 'p4',
      title: 'Spring does not call @PreDestroy on prototype beans — resource leak',
      severity: 'medium',
      symptom: 'Database connections, file handles, or threads stay open indefinitely. Connection pool exhausts after hours of traffic. The @PreDestroy cleanup method exists in the code but never runs.',
      cause: 'After creating a prototype and handing it to the caller, Spring releases its reference. With no reference, it cannot call @PreDestroy on shutdown. The caller owns the lifecycle — but callers often do not know this.',
      codeExample:
        '// Problem: this prototype opens a connection, but @PreDestroy never fires\n' +
        '@Component @Scope("prototype")\n' +
        'public class ReportExporter {\n' +
        '    private Connection conn;\n\n' +
        '    @PostConstruct\n' +
        '    public void open() {\n' +
        '        conn = dataSource.getConnection(); // opens connection\n' +
        '    }\n\n' +
        '    @PreDestroy\n' +
        '    public void close() {\n' +
        '        conn.close(); // NEVER CALLED for prototype beans!\n' +
        '    }\n' +
        '}\n\n' +
        '// FIX A — implement AutoCloseable and use try-with-resources\n' +
        '@Component @Scope("prototype")\n' +
        'public class ReportExporter implements AutoCloseable {\n' +
        '    private Connection conn;\n\n' +
        '    @PostConstruct\n' +
        '    public void open() { conn = dataSource.getConnection(); }\n\n' +
        '    @Override\n' +
        '    public void close() { conn.close(); } // caller controls cleanup\n' +
        '}\n\n' +
        '// Caller:\n' +
        'try (ReportExporter exporter = exporterFactory.getObject()) {\n' +
        '    exporter.generate(reportId);\n' +
        '} // close() called automatically here',
      fix: 'Three options: (1) implement AutoCloseable and have callers use try-with-resources, (2) make the bean singleton and redesign to avoid per-call state, (3) use a registry to track all created prototype instances and clean them up in a @PreDestroy on a singleton tracker bean.',
      detection: 'Add a static AtomicInteger counter — increment in @PostConstruct, decrement in @PreDestroy (if you add explicit cleanup). Under load, if the counter only climbs and never drops, cleanup is not happening.'
    },
    {
      id: 'p5',
      title: 'Circular dependency with constructor injection — startup fails',
      severity: 'high',
      symptom: 'Application fails to start: "The dependencies of some of the beans in the application context form a cycle" with a chain like "serviceA -> serviceB -> serviceA"',
      cause: 'Bean A needs Bean B in its constructor, Bean B needs Bean A. Spring cannot create A without B existing, and cannot create B without A existing — a deadlock. With constructor injection, Spring detects this immediately and refuses to start.',
      codeExample:
        '// BUG — circular constructor dependency\n' +
        '@Service\n' +
        'public class UserService {\n' +
        '    private final AuditService audit;\n' +
        '    public UserService(AuditService audit) { this.audit = audit; } // needs AuditService\n' +
        '}\n\n' +
        '@Service\n' +
        'public class AuditService {\n' +
        '    private final UserService users;\n' +
        '    public AuditService(UserService users) { this.users = users; } // needs UserService\n' +
        '}\n' +
        '// Spring fails at startup — cannot create either without the other\n\n' +
        '// FIX — extract shared EventBus that both depend on\n' +
        '@Service\n' +
        'public class EventBus {\n' +
        '    public void publish(String event) { System.out.println("EVENT: " + event); }\n' +
        '}\n\n' +
        '@Service\n' +
        'public class UserService {\n' +
        '    private final EventBus eventBus; // no longer needs AuditService directly\n' +
        '    public UserService(EventBus eventBus) { this.eventBus = eventBus; }\n' +
        '    public void createUser(String name) { eventBus.publish("user.created:" + name); }\n' +
        '}\n\n' +
        '@Service\n' +
        'public class AuditService {\n' +
        '    private final EventBus eventBus; // no longer needs UserService directly\n' +
        '    public AuditService(EventBus eventBus) { this.eventBus = eventBus; }\n' +
        '}',
      fix: 'Extract a third bean (EventBus, SharedRegistry, Mediator) that both services can depend on. This breaks the cycle structurally. Using @Lazy on one parameter hides the cycle but does not fix the design — always prefer the structural fix.',
      detection: 'Spring\'s error message prints the exact cycle chain. Read it carefully: it tells you exactly which classes to refactor.'
    },
    {
      id: 'p6',
      title: '@Primary added to a stub/mock in production — wrong implementation silently active',
      severity: 'high',
      symptom: 'Emails never arrive, payments always succeed with fake responses, notifications show test content in production. No errors thrown — the stub is operating silently.',
      cause: 'A test stub or mock class has @Primary without being restricted to a @Profile("test"). Both the real and stub implementations load in production. @Primary on the stub wins, and it silently replaces the real service everywhere it is injected.',
      codeExample:
        '// BUG — MockEmailService has @Primary without @Profile("test")\n' +
        '@Service\n' +
        '@Primary // THIS IS THE BUG — no profile restriction\n' +
        'public class MockEmailService implements EmailService {\n' +
        '    @Override\n' +
        '    public void send(String to, String body) {\n' +
        '        System.out.println("[MOCK] Email to " + to); // silently swallows all emails\n' +
        '    }\n' +
        '}\n\n' +
        '@Service // real implementation — but @Primary on the mock wins\n' +
        'public class SmtpEmailService implements EmailService {\n' +
        '    @Override\n' +
        '    public void send(String to, String body) { /* sends real email via SMTP */ }\n' +
        '}\n\n' +
        '// FIX — restrict stub to test profile only\n' +
        '@Service\n' +
        '@Profile("test") // only registered when Spring profile "test" is active\n' +
        'public class MockEmailService implements EmailService {\n' +
        '    @Override\n' +
        '    public void send(String to, String body) {\n' +
        '        System.out.println("[TEST MOCK] Email to " + to);\n' +
        '    }\n' +
        '}',
      fix: 'Always annotate test stubs with @Profile("test") or move them to src/test/java. Add a startup log: logger.info("Active EmailService: {}", emailService.getClass().getSimpleName()). Alert in monitoring if it ever shows "Mock" or "Stub" in production.',
      detection: 'Search the codebase for classes implementing your critical interfaces (EmailService, PaymentService) that have @Primary and do NOT have @Profile. Every match is a potential production incident.'
    },
    {
      id: 'p7',
      title: 'Slow @PostConstruct delays health checks and causes Kubernetes restarts',
      severity: 'medium',
      symptom: 'App is killed by Kubernetes before it finishes starting. Health check endpoint returns errors during startup. Liveness probe fails and the pod enters a restart loop even though the app is actually healthy.',
      cause: '@PostConstruct runs synchronously on the main startup thread. If it loads large datasets, calls slow external APIs, or runs migrations, the app does not serve any HTTP traffic (including health checks) during that window. Kubernetes interprets an unresponsive pod as unhealthy and kills it.',
      codeExample:
        '// BUG — slow @PostConstruct blocks the entire startup thread\n' +
        '@Service\n' +
        'public class ReferenceDataLoader {\n' +
        '    @Autowired private CountryRepository countryRepo;\n\n' +
        '    @PostConstruct\n' +
        '    public void load() throws Exception {\n' +
        '        // This takes 25 seconds — health check port is unreachable during this time\n' +
        '        Thread.sleep(25_000); // simulating slow external data load\n' +
        '        System.out.println("Reference data loaded.");\n' +
        '    }\n' +
        '}\n\n' +
        '// FIX — start slow work on a background thread, expose readiness indicator\n' +
        '@Service\n' +
        'public class ReferenceDataLoader {\n' +
        '    @Autowired private CountryRepository countryRepo;\n' +
        '    private volatile boolean ready = false;\n\n' +
        '    @PostConstruct\n' +
        '    public void scheduleLoad() {\n' +
        '        // Return immediately — health check can now respond\n' +
        '        new Thread(() -> {\n' +
        '            // slow work happens in background\n' +
        '            try { Thread.sleep(25_000); } catch (InterruptedException e) { return; }\n' +
        '            ready = true;\n' +
        '            System.out.println("Reference data loaded.");\n' +
        '        }).start();\n' +
        '    }\n\n' +
        '    public boolean isReady() { return ready; }\n' +
        '    // Wire this into a Spring Boot ReadinessIndicator\n' +
        '}',
      fix: 'Move any work that takes more than ~2 seconds to a background thread started in @PostConstruct. Expose a readiness flag and implement a ReadinessIndicator (Spring Boot Actuator) that returns OUT_OF_SERVICE until background init completes. Kubernetes will wait for readiness before routing traffic.',
      detection: 'Add System.currentTimeMillis() timing around each @PostConstruct call. Log any that take over 1 second. In Kubernetes, set initialDelaySeconds in your readiness probe to give the app time, and investigate which bean is slow.'
    },
    {
      id: 'p8',
      title: '@Service class not found by Spring — silent no-op',
      severity: 'medium',
      symptom: 'NoSuchBeanDefinitionException when another class tries to @Autowire it. Or worse — no exception, but the bean is never used because the injection point had @Autowired(required=false).',
      cause: 'Spring Boot scans only the package of the @SpringBootApplication class and its sub-packages. Any class outside this package tree is invisible to Spring, regardless of @Service or @Component annotations.',
      codeExample:
        '// Project structure:\n' +
        '// com.myapp.Main.java  (@SpringBootApplication)\n' +
        '// com.myapp.service.OrderService.java  — FOUND (sub-package)\n' +
        '// com.utils.EmailHelper.java  — NOT FOUND (different package tree!)\n\n' +
        '// WRONG — EmailHelper is outside com.myapp\n' +
        'package com.utils;\n' +
        '@Service // Spring never sees this — wrong package\n' +
        'public class EmailHelper { ... }\n\n' +
        '// FIX A — move to a sub-package of Main\n' +
        'package com.myapp.util;\n' +
        '@Service // Spring finds this — sub-package of com.myapp\n' +
        'public class EmailHelper { ... }\n\n' +
        '// FIX B — add the package to @ComponentScan explicitly\n' +
        '@SpringBootApplication\n' +
        '@ComponentScan(basePackages = {"com.myapp", "com.utils"})\n' +
        'public class Main { ... }\n\n' +
        '// Quick debug: print all registered beans at startup\n' +
        'Arrays.stream(ctx.getBeanDefinitionNames()).sorted().forEach(System.out::println);',
      fix: 'Move the class into a sub-package of your @SpringBootApplication class. Or add the package explicitly to @ComponentScan. Print ctx.getBeanDefinitionNames() to confirm which beans Spring actually found.',
      detection: 'If your bean\'s name does not appear in getBeanDefinitionNames(), Spring never scanned its package. Check the package structure against your main application class.'
    }
  ]
};

// ─── EXERCISE / ASSIGNMENT (enhanced, topic-specific, hands-on) ────────────────
const exercise = {
  type: 'exercise',
  title: 'Assignment — Build a Mini Order Processing System Using Spring Lifecycle Correctly',
  problem:
    'Build a small Spring Boot application that processes food delivery orders. ' +
    'The system must demonstrate correct use of the Spring bean lifecycle and DI patterns you learned today.\n\n' +
    '**Requirements:**\n\n' +
    '**Part 1 — Lifecycle basics**\n' +
    'Create a `MenuService` that loads a menu (a List<String> of item names) from a `MenuRepository` ' +
    'at startup using @PostConstruct. The menu must be pre-loaded before any order can be placed. ' +
    'On application shutdown, @PreDestroy must log "MenuService: saving menu state before shutdown."\n\n' +
    '**Part 2 — Scope mismatch fix**\n' +
    'Create a prototype-scoped `OrderCart` bean that holds a list of items for one order. ' +
    'Create a singleton `CheckoutService` that uses `ObjectFactory<OrderCart>` to get a fresh cart ' +
    'for each new order. Prove it works by creating two orders and verifying their carts are different objects.\n\n' +
    '**Part 3 — Multiple implementations with @Primary and @Qualifier**\n' +
    'Create a `NotificationService` interface with a `notify(String message)` method. ' +
    'Implement it twice: `EmailNotification` (@Primary, default) and `SmsNotification` (@Service("sms")). ' +
    'Create an `OrderConfirmationService` that sends email by default but SMS for premium users. ' +
    'Use @Qualifier("sms") for the SMS injection point.\n\n' +
    '**Part 4 — Startup order with @DependsOn**\n' +
    'Create a `DatabaseSeeder` bean that inserts test menu items in @PostConstruct and logs ' +
    '"DatabaseSeeder: menu items seeded." Create a `MenuService` that @DependsOn("databaseSeeder") ' +
    'so it only loads the menu after seeding is done. Verify the log order shows seeding before loading.\n\n' +
    '**Part 5 — Circular dependency refactor**\n' +
    'You are given this broken code: `OrderService` needs `BillingService` to calculate prices, ' +
    'and `BillingService` needs `OrderService` to get order details. Spring fails at startup. ' +
    'Refactor it by extracting a `PricingEngine` bean that `OrderService` depends on directly, ' +
    'eliminating the need for `BillingService` to touch `OrderService`.\n\n' +
    '**Part 6 — Write a test**\n' +
    'Write a @SpringBootTest that: (a) verifies the menu is loaded (not null/empty) after startup, ' +
    '(b) verifies two calls to get an OrderCart return different object instances.',
  hints: [
    'Part 2: After injecting ObjectFactory<OrderCart> into CheckoutService, call cartFactory.getObject() inside a method — not at field injection time. Compare System.identityHashCode() of two carts to prove they are different objects.',
    'Part 3: @Primary on EmailNotification means any plain @Autowired NotificationService gets Email. For SMS, add @Qualifier("sms") at the injection point. Test by calling both paths and checking the log output.',
    'Part 4: The log output must show "DatabaseSeeder: menu items seeded." BEFORE "MenuService: loading menu...". If the order is wrong, @DependsOn is missing or misspelled.',
    'Part 5: Ask yourself — what does BillingService actually need from OrderService? Usually it only needs the price of items, not the Order object itself. Extract PricingEngine with a calculatePrice(List<String> items) method. Both OrderService and BillingService can use it with no cycle.',
    'Part 6: In the test for Part 2, call checkoutService.startNewOrder() twice and assert: assertNotSame(cart1, cart2). assertNotSame checks object identity, not equality.'
  ],
  solution:
    'package day39.assignment;\n\n' +
    'import jakarta.annotation.PostConstruct;\n' +
    'import jakarta.annotation.PreDestroy;\n' +
    'import org.springframework.beans.factory.ObjectFactory;\n' +
    'import org.springframework.beans.factory.annotation.*;\n' +
    'import org.springframework.context.annotation.*;\n' +
    'import org.springframework.stereotype.*;\n' +
    'import java.util.*;\n\n' +
    '// ── PART 1: MenuService with lifecycle callbacks ──────────────────────────\n' +
    '@Service\n' +
    'public class MenuService {\n' +
    '    @Autowired\n' +
    '    private MenuRepository menuRepository;\n\n' +
    '    private List<String> menu;\n\n' +
    '    @PostConstruct\n' +
    '    public void loadMenu() {\n' +
    '        menu = menuRepository.findAllItems();\n' +
    '        System.out.println("MenuService: loaded " + menu.size() + " items.");\n' +
    '    }\n\n' +
    '    public List<String> getMenu() { return Collections.unmodifiableList(menu); }\n\n' +
    '    @PreDestroy\n' +
    '    public void onShutdown() {\n' +
    '        System.out.println("MenuService: saving menu state before shutdown.");\n' +
    '    }\n' +
    '}\n\n' +
    '// ── PART 2: Prototype cart + ObjectFactory fix ────────────────────────────\n' +
    '@Component\n' +
    '@Scope("prototype")\n' +
    'public class OrderCart {\n' +
    '    private final List<String> items = new ArrayList<>();\n' +
    '    public void add(String item) { items.add(item); }\n' +
    '    public List<String> getItems() { return Collections.unmodifiableList(items); }\n' +
    '}\n\n' +
    '@Service\n' +
    'public class CheckoutService {\n' +
    '    @Autowired\n' +
    '    private ObjectFactory<OrderCart> cartFactory;\n\n' +
    '    public OrderCart startNewOrder() {\n' +
    '        return cartFactory.getObject(); // fresh cart every time\n' +
    '    }\n' +
    '}\n\n' +
    '// ── PART 3: @Primary + @Qualifier notification ────────────────────────────\n' +
    'public interface NotificationService {\n' +
    '    void notify(String message);\n' +
    '}\n\n' +
    '@Service @Primary\n' +
    'public class EmailNotification implements NotificationService {\n' +
    '    public void notify(String msg) { System.out.println("EMAIL: " + msg); }\n' +
    '}\n\n' +
    '@Service("sms")\n' +
    'public class SmsNotification implements NotificationService {\n' +
    '    public void notify(String msg) { System.out.println("SMS: " + msg); }\n' +
    '}\n\n' +
    '@Service\n' +
    'public class OrderConfirmationService {\n' +
    '    @Autowired\n' +
    '    private NotificationService emailNotifier; // gets EmailNotification (@Primary)\n\n' +
    '    @Autowired @Qualifier("sms")\n' +
    '    private NotificationService smsNotifier;\n\n' +
    '    public void confirm(String orderId, boolean isPremium) {\n' +
    '        String msg = "Order " + orderId + " confirmed!";\n' +
    '        if (isPremium) smsNotifier.notify(msg);\n' +
    '        else emailNotifier.notify(msg);\n' +
    '    }\n' +
    '}\n\n' +
    '// ── PART 4: @DependsOn for startup ordering ───────────────────────────────\n' +
    '@Service("databaseSeeder")\n' +
    'public class DatabaseSeeder {\n' +
    '    @PostConstruct\n' +
    '    public void seed() {\n' +
    '        System.out.println("DatabaseSeeder: menu items seeded.");\n' +
    '    }\n' +
    '}\n\n' +
    '// MenuService above gets @DependsOn added:\n' +
    '// @Service @DependsOn("databaseSeeder") public class MenuService { ... }\n\n' +
    '// ── PART 5: Circular dep fixed with PricingEngine ─────────────────────────\n' +
    '@Service\n' +
    'public class PricingEngine {\n' +
    '    public double calculateTotal(List<String> items) {\n' +
    '        return items.size() * 9.99; // simplified\n' +
    '    }\n' +
    '}\n\n' +
    '@Service\n' +
    'public class OrderService {\n' +
    '    @Autowired private PricingEngine pricing; // no longer needs BillingService\n' +
    '    public double getOrderTotal(List<String> items) { return pricing.calculateTotal(items); }\n' +
    '}\n\n' +
    '@Service\n' +
    'public class BillingService {\n' +
    '    @Autowired private PricingEngine pricing; // no longer needs OrderService\n' +
    '    public void generateInvoice(List<String> items) {\n' +
    '        System.out.println("Invoice total: $" + pricing.calculateTotal(items));\n' +
    '    }\n' +
    '}\n\n' +
    '// ── PART 6: Tests ─────────────────────────────────────────────────────────\n' +
    '@SpringBootTest\n' +
    'class OrderSystemTest {\n' +
    '    @Autowired MenuService menuService;\n' +
    '    @Autowired CheckoutService checkoutService;\n\n' +
    '    @Test\n' +
    '    void menuShouldBeLoadedAfterStartup() {\n' +
    '        assertNotNull(menuService.getMenu());\n' +
    '        assertFalse(menuService.getMenu().isEmpty());\n' +
    '    }\n\n' +
    '    @Test\n' +
    '    void eachOrderShouldGetFreshCart() {\n' +
    '        OrderCart cart1 = checkoutService.startNewOrder();\n' +
    '        OrderCart cart2 = checkoutService.startNewOrder();\n' +
    '        assertNotSame(cart1, cart2); // different object instances\n' +
    '        cart1.add("Pizza");\n' +
    '        assertTrue(cart2.getItems().isEmpty()); // carts are isolated\n' +
    '    }\n' +
    '}'
};

// ─── INTERVIEW (enhanced: richer answers, code in codeBased followUps) ─────────
const interview = {
  type: 'interview',
  title: 'Interview Questions — Spring Bean Lifecycle & Advanced DI',

  conceptual: [
    {
      question: 'In simple words, what is a Spring bean and why does Spring create it instead of you using `new`?',
      answer:
        'A Spring bean is just a Java object that Spring creates and manages. Imagine building an order management system with 20 services — each service needs several other services. If you use `new`, you write chains like `new OrderService(new EmailService(new TemplateLoader(new FileReader())))` everywhere. ' +
        'Change one constructor and you hunt through 50 files. ' +
        'With Spring, you declare what each class needs (via constructor params or @Autowired), and Spring builds and connects everything automatically. ' +
        'The real payoff: swapping a real PaymentService with a test stub is one annotation change, not a search-and-replace through the whole codebase.',
      followUps: [
        {
          question: 'Can you create a Spring bean without any annotation?',
          answer:
            'Yes — use a @Configuration class with a @Bean method:\n\n' +
            '@Configuration\n' +
            'public class AppConfig {\n' +
            '    @Bean\n' +
            '    public EmailService emailService() {\n' +
            '        return new SmtpEmailService("smtp.gmail.com", 587);\n' +
            '    }\n' +
            '}\n\n' +
            'This is useful for third-party classes you cannot annotate (e.g., Jackson\'s ObjectMapper, RestTemplate). ' +
            '@Bean methods give you full control over construction arguments.'
        }
      ]
    },
    {
      question: 'What is the correct lifecycle order? Constructor → @Autowired → @PostConstruct, or some other order?',
      answer:
        'Correct order is always: (1) Constructor — object is created, all fields are null, (2) @Autowired injection — Spring fills every @Autowired field and @Value, (3) @PostConstruct — all fields ready, safe to use them.\n\n' +
        'The easiest way to remember: Spring must BUILD the object before it can GIVE it tools (@Autowired), and it must give the tools before the object can START WORK (@PostConstruct). ' +
        'This mirrors hiring: hire person → give them equipment → let them start their job.',
      followUps: [
        {
          question: 'What if afterPropertiesSet() and @PostConstruct are both on the same bean — which fires first?',
          answer:
            '@PostConstruct fires first (it is processed in postProcessBeforeInitialization by CommonAnnotationBeanPostProcessor), then afterPropertiesSet() (called directly by the container), then any custom initMethod declared via @Bean(initMethod="...").\n\n' +
            'In practice, never put all three on the same bean — pick one. @PostConstruct is the modern standard for application code.'
        }
      ]
    },
    {
      question: 'Explain the scope mismatch bug. How does injecting a prototype bean into a singleton break things?',
      answer:
        'Scope mismatch: a prototype bean is @Autowired directly into a singleton. Spring injects one prototype instance when the singleton is created — and never again. That one instance is shared by every thread and every user forever.\n\n' +
        'Think of it this way: the singleton is like a shared printer in the office (one for everyone). The prototype Cart is supposed to be a personal notepad (one per person). But if you glue the notepad to the printer, everyone writes on the same notepad — their notes mix.\n\n' +
        'The fix is ObjectFactory<Cart>: instead of gluing a notepad to the printer, you put a notepad dispenser next to it. Each person pulls a fresh notepad from the dispenser.',
      followUps: [
        {
          question: 'How does ScopedProxyMode.TARGET_CLASS solve the same problem differently from ObjectFactory?',
          answer:
            'With ScopedProxyMode.TARGET_CLASS, Spring injects a CGLIB proxy object into the singleton. The proxy looks and behaves exactly like your Cart, but every method call on the proxy goes through Spring to get the "right" instance (a new prototype). The caller\'s code is unchanged.\n\n' +
            'With ObjectFactory, the caller must explicitly call getObject() — the fresh instance creation is visible in the code.\n\n' +
            'Proxy approach: transparent to caller, but prototype class cannot be final, and proxy adds overhead.\n' +
            'ObjectFactory approach: explicit, works with final classes, no proxy overhead.'
        }
      ]
    },
    {
      question: 'When would you use @Primary vs @Qualifier? Can they conflict?',
      answer:
        '@Primary on a bean makes it the default for any unqualified injection of that type. ' +
        '@Qualifier("name") at a specific injection point says "I want this exact one." They do not conflict — @Qualifier always wins over @Primary at any injection point where it is used.\n\n' +
        'Use @Primary when one implementation covers 90% of cases (the real PaymentGateway vs a test stub). ' +
        'Use @Qualifier when two real implementations coexist and you need explicit control at specific injection points (Stripe vs PayPal — both are real, both are used).\n\n' +
        'One dangerous pattern: @Primary on a stub without @Profile("test"). In production, both the real service and the stub are registered, @Primary silently makes the stub the default, and real functionality is replaced with no-ops.',
      followUps: [
        {
          question: 'How would you make disambiguation type-safe instead of using string-based @Qualifier?',
          answer:
            'Create a custom qualifier annotation:\n\n' +
            '@Target({ElementType.FIELD, ElementType.PARAMETER, ElementType.TYPE})\n' +
            '@Retention(RetentionPolicy.RUNTIME)\n' +
            '@Qualifier\n' +
            'public @interface StripeGateway {}\n\n' +
            '@Service @StripeGateway\n' +
            'public class StripePaymentService implements PaymentService { ... }\n\n' +
            '@Service\n' +
            'public class CheckoutService {\n' +
            '    @Autowired @StripeGateway\n' +
            '    private PaymentService stripe; // type-safe, IDE-navigable\n' +
            '}\n\n' +
            'If you rename StripeGateway, the IDE finds and refactors all usages. String-based @Qualifier("stripe") does not.'
        }
      ]
    },
    {
      question: 'What is @DependsOn and when should you use it instead of @Autowired?',
      answer:
        '@DependsOn tells Spring to fully initialize the named bean before starting the current one — no injection, no field, just guaranteed ordering. ' +
        '@Autowired injects a reference you can actually call methods on.\n\n' +
        'Use @DependsOn when: the dependency only needs to have run (its @PostConstruct executed a side effect — created database tables, published Kafka topics, registered JMX beans). You do not need to call its methods.\n\n' +
        'Use @Autowired when: you need to call methods on the dependency at runtime.\n\n' +
        'Common mistake: using @DependsOn and then being surprised when you cannot access the dependency\'s state — because there is no reference to it.',
      followUps: [
        {
          question: 'Does @DependsOn guarantee the dependency succeeded without errors?',
          answer:
            'No. @DependsOn guarantees initialization ORDER. If the named bean throws an exception in @PostConstruct, Spring stops the whole startup — so it effectively guarantees the dependency did not crash. But it does not give you any way to read the dependency\'s result or state. For that, you need @Autowired to get a reference and call a method.'
        }
      ]
    },
    {
      question: 'Why does @Transactional on a method not work when the method is called from within the same class?',
      answer:
        '@Transactional works through a CGLIB proxy — a generated subclass of your class that Spring creates and stores in the context. When another class @Autowires your service, it gets the proxy, not your real class.\n\n' +
        'When the proxy\'s method is called, it: starts a transaction → calls your real method → commits or rolls back.\n\n' +
        'When you call `this.myMethod()` inside your class, you call directly on the real object — the proxy is completely bypassed. No proxy call = no transaction boundary.\n\n' +
        'The fix is structural: move the @Transactional method to a different @Service so all callers always go through a proxy.',
      followUps: [
        {
          question: 'How can you verify inside a method whether a transaction is currently active?',
          answer:
            'Use TransactionSynchronizationManager.isActualTransactionActive():\n\n' +
            '@Transactional\n' +
            'public void saveOrder(String orderId) {\n' +
            '    boolean active = TransactionSynchronizationManager.isActualTransactionActive();\n' +
            '    System.out.println("Transaction active: " + active);\n' +
            '    // If this prints false, the proxy was bypassed (self-invocation bug)\n' +
            '    orderRepo.save(orderId);\n' +
            '}'
        }
      ]
    },
    {
      question: 'What is BeanPostProcessor? How is it different from @PostConstruct?',
      answer:
        '@PostConstruct is specific to ONE bean — it is a method inside your class that runs after your bean is initialised.\n\n' +
        'BeanPostProcessor is a global interceptor — it runs for EVERY bean in the application context. You write one BeanPostProcessor and Spring calls it for each bean: once before its init callbacks, and once after.\n\n' +
        'Practical difference: @PostConstruct is for your bean\'s own setup. BeanPostProcessor is for cross-cutting framework concerns — applying the same wrapper/check/metric to many beans without touching each class.\n\n' +
        'This is how @Transactional, @Async, @Cacheable work internally: AbstractAutoProxyCreator (a BeanPostProcessor) replaces your bean with a CGLIB proxy after initialization. You never call it — Spring does.',
      followUps: [
        {
          question: 'What is the most critical rule when implementing a BeanPostProcessor?',
          answer:
            'Always return the bean (or a valid replacement) from both postProcessBeforeInitialization and postProcessAfterInitialization. Returning null causes Spring to throw NullPointerException when injecting that bean into others:\n\n' +
            '@Override\n' +
            'public Object postProcessAfterInitialization(Object bean, String beanName) {\n' +
            '    // Do your work...\n' +
            '    return bean; // NEVER return null\n' +
            '    // return wrappedBean; // OK if you want to replace the bean with a proxy\n' +
            '}'
        }
      ]
    },
    {
      question: 'What is the difference between constructor injection and field injection? Why does the Spring team recommend constructor injection?',
      answer:
        'Field injection (@Autowired on a private field) is simpler to write but has three real problems:\n' +
        '1. Not testable without Spring — you need ReflectionTestUtils or a full context to set private @Autowired fields in a unit test.\n' +
        '2. Dependencies are hidden — you cannot tell what a bean needs without reading all its fields.\n' +
        '3. Fields cannot be final — nothing prevents someone from changing them after construction.\n\n' +
        'Constructor injection lists all dependencies as constructor parameters. Benefits: testable with `new MyService(mock1, mock2)`, all dependencies visible in the signature, fields can be final, and a missing dependency causes a compile error not a runtime NPE.\n\n' +
        'The Spring team recommends constructor injection in their own documentation since Spring 4.',
      followUps: [
        {
          question: 'If constructor injection is better, why does field injection still appear everywhere?',
          answer:
            'Two reasons: (1) Field injection requires fewer lines — beginners prefer it because it looks cleaner. (2) Old tutorials, Stack Overflow answers, and course materials written before Spring 4 all showed field injection as the standard. Those resources spread the pattern before constructor injection became idiomatic. IntelliJ IDEA now shows a warning on field-injected @Autowired fields specifically to push developers toward constructor injection.'
        }
      ]
    },
    {
      question: 'What is a circular dependency? What is the correct fix vs the wrong fix?',
      answer:
        'Circular dependency: Bean A needs Bean B in its constructor, and Bean B needs Bean A. Spring cannot create either one first.\n\n' +
        'Wrong fix — @Lazy on one parameter: this injects a CGLIB proxy for the "lazy" dependency. The proxy allows startup to succeed, but A and B still logically depend on each other. The design problem is hidden, not resolved.\n\n' +
        'Right fix — extract a shared bean: identify WHY A needs B and B needs A. Usually both need some shared logic (event publishing, data formatting, pricing calculation). Extract that logic into a new @Service C. Now A depends on C and B depends on C — the circle is broken. This is not a Spring trick, it is a design improvement.',
      followUps: [
        {
          question: 'Spring Boot 3 changed how circular dependencies are handled. What changed?',
          answer:
            'Spring Boot 2 silently resolved circular dependencies via field/setter injection using an internal three-level cache. Spring Boot 3 (Framework 6) throws an exception by default for any circular dependency. To restore old behaviour temporarily: spring.main.allow-circular-references=true in application.properties. But treat this as a temporary measure — fix the design and remove the flag.'
        }
      ]
    },
    {
      question: 'What is @Lazy and what are its two different uses?',
      answer:
        '@Lazy has two distinct uses that are easy to confuse:\n\n' +
        'Use 1 — On a class or @Bean: defers singleton creation to first use. The bean is not created at startup. Useful for expensive optional beans (report generators, rarely-used admin tools).\n\n' +
        'Use 2 — On an @Autowired field: injects a proxy immediately (at the field\'s bean creation time), but resolves the actual target bean only on the first method call. Used to break circular dependencies.\n\n' +
        'Common misconception: @Lazy makes a bean prototype-scoped. It does not. The bean is still a singleton — created once, cached, shared. @Lazy only changes WHEN that one instance is created (startup vs first use).',
      followUps: [
        {
          question: 'When should you NOT use @Lazy?',
          answer:
            'Do not use @Lazy on beans whose initialization errors should stop the app from starting — for example, a bean that validates critical config in @PostConstruct. With @Lazy, the error only surfaces on the first request in production, not at startup. Also avoid @Lazy on beans that are always needed immediately — you just delay an inevitable cost and push errors into production traffic.'
        }
      ]
    },
    {
      question: 'What are Aware interfaces? Give two examples and when you would use them.',
      answer:
        'Aware interfaces let a bean ask the Spring container for framework infrastructure during initialization — before @PostConstruct fires.\n\n' +
        'BeanNameAware: Spring calls setBeanName(String name) and gives the bean its own registered ID. Useful for logging or metrics that tag data by bean name.\n\n' +
        'ApplicationContextAware: Spring calls setApplicationContext(ApplicationContext ctx) with the whole container. Use for programmatic getBeansOfType() lookups — like a plugin registry that collects all beans implementing a Plugin interface.\n\n' +
        'Modern alternative: since Spring 4.3 you can just @Autowire ApplicationContext directly. The Aware callback style is older but still valid in infrastructure and library code.',
      followUps: [
        {
          question: 'Is accessing ApplicationContext from a bean considered a bad practice?',
          answer:
            'For business services: yes. It creates a service-locator anti-pattern — your class can access any bean, hiding its real dependencies. Hard to test, hard to understand. For framework/infrastructure code (plugin registries, dynamic routers, extension points): acceptable and sometimes the only option. The rule: in application code, use @Autowired with specific types. In framework code that needs to discover or manage multiple beans dynamically, ApplicationContext is fine.'
        }
      ]
    },
    {
      question: 'What is SmartInitializingSingleton and when would you use it?',
      answer:
        'SmartInitializingSingleton has one method: afterSingletonsInstantiated(). It fires exactly once, after every singleton bean in the context has been fully created and post-processed (including AOP proxies).\n\n' +
        'This is later than @PostConstruct on individual beans — @PostConstruct fires per-bean during that bean\'s initialization. afterSingletonsInstantiated fires after ALL beans are done.\n\n' +
        'Use it when: your startup validation needs to inspect beans that may not have existed yet at @PostConstruct time. Examples: checking that every bean implementing an Auditable interface has @AuditCategory annotation configured, registering all Plugin beans into a router, warming a cache that depends on all repositories being ready.',
      followUps: [
        {
          question: 'How is SmartInitializingSingleton safer than ApplicationListener<ContextRefreshedEvent>?',
          answer:
            'ContextRefreshedEvent fires every time the context is refreshed. In a Spring MVC app, this happens twice — once for the root context and once for the DispatcherServlet child context. If your startup code registers things or starts threads, it runs twice, causing duplicates or errors. SmartInitializingSingleton fires exactly once per context instance. Prefer it for one-time startup validation.'
        }
      ]
    },
    {
      question: 'What happens to beans during application shutdown? What is the order?',
      answer:
        'When the application context closes (via context.close() or the JVM shutdown hook), Spring runs the destruction sequence for all singleton beans in REVERSE creation order — beans created last are destroyed first. For each bean: (1) @PreDestroy method called, (2) DisposableBean.destroy() called if implemented, (3) custom destroyMethod from @Bean(destroyMethod="...") called.\n\n' +
        'Spring Boot registers a JVM shutdown hook automatically, so graceful shutdown fires on Ctrl+C or SIGTERM.\n\n' +
        'Prototype beans are NOT destroyed — Spring gave up ownership after creation. Request and session-scoped beans are cleaned up at the end of their respective scope, not on context close.',
      followUps: [
        {
          question: 'If you have three singletons A, B, C created in that order, what is the destruction order?',
          answer:
            'Destruction order is C, B, A — reverse of creation. This makes logical sense: if B depends on A (created first), you should destroy B before A. Destroying A first while B still exists and might use it would be wrong. The reverse-order destruction ensures dependencies are always destroyed after the beans that use them.'
        }
      ]
    },
    {
      question: 'What is the difference between @PostConstruct and InitializingBean? Which should you choose?',
      answer:
        'Both run at the same lifecycle phase (after injection). The difference is coupling:\n\n' +
        '@PostConstruct: a JSR-250 standard annotation. No Spring import needed. Your class stays framework-agnostic and could theoretically run in any Jakarta EE container.\n\n' +
        'InitializingBean: a Spring-specific interface. Your class implements it and overrides afterPropertiesSet(). This ties your class to Spring\'s API — it imports from org.springframework.\n\n' +
        'Choose @PostConstruct for all application code — it is cleaner, standard, and Spring-independent. Use InitializingBean only in Spring framework extension code where the Spring coupling is already accepted.',
      followUps: [
        {
          question: 'Is there any functional difference between them — does one have capabilities the other lacks?',
          answer:
            'afterPropertiesSet() declares throws Exception, allowing checked exceptions directly. @PostConstruct-annotated methods must not declare checked exceptions — you have to catch them inside and wrap in a RuntimeException if you want to fail startup. In practice this rarely matters because failing startup is the goal in both cases, and RuntimeException achieves that.'
        }
      ]
    },
    {
      question: 'Your @Service class has @PostConstruct but the method never runs. List four reasons why.',
      answer:
        'Reason 1: The class is not in a scanned package. Spring Boot only scans the @SpringBootApplication class\'s package and sub-packages. Classes outside that tree are invisible.\n\n' +
        'Reason 2: The method signature is wrong. @PostConstruct requires a no-argument method with a void return type. Spring silently ignores non-void or parameterized methods.\n\n' +
        'Reason 3: The object was created with `new` manually outside of Spring. Spring only calls @PostConstruct on beans it manages. Objects you create yourself with `new` are plain Java objects — no lifecycle callbacks.\n\n' +
        'Reason 4: The bean failed to initialize before @PostConstruct (e.g., an @Autowired dependency threw an exception during its own creation). Spring aborts the bean creation and @PostConstruct never fires — check the full stack trace for the root cause above.',
      followUps: [
        {
          question: 'How do you quickly verify which beans Spring actually registered?',
          answer:
            'applicationContext.getBeanDefinitionNames() returns the names of all registered beans. Print them sorted:\n\n' +
            'Arrays.stream(ctx.getBeanDefinitionNames()).sorted().forEach(System.out::println);\n\n' +
            'If your bean name is missing, Spring never registered it. The package scanning issue or missing annotation is confirmed. If your bean IS in the list but @PostConstruct still did not fire, the issue is one of the method signature problems.'
        }
      ]
    },
    {
      question: 'What is FactoryBean<T>? When and why would you use it?',
      answer:
        'FactoryBean<T> is a special Spring interface. You implement getObject() which returns the actual bean T, getObjectType() which returns T.class, and isSingleton() which controls caching.\n\n' +
        'You use it when constructing an object requires complex steps that cannot easily fit in a @Bean method — like building a JNDI resource, configuring an SDK client that needs a builder pattern with many steps, or integrating legacy frameworks.\n\n' +
        'Key trick: context.getBean("myFactory") returns T (the product), not the FactoryBean itself. To get the FactoryBean, prefix with "&": context.getBean("&myFactory").\n\n' +
        'In modern Spring Boot, most cases where you would write a FactoryBean are better served by a @Bean method with complex logic. FactoryBeans are most common in Spring framework internals and library integration code.',
      followUps: [
        {
          question: 'Give a real example of a FactoryBean you would encounter in a Spring project.',
          answer:
            'The most common is SqlSessionFactoryBean from MyBatis-Spring. You register it as a @Bean, set the DataSource and mapper locations on it, and it produces an SqlSessionFactory that Spring then makes available for injection. You never call new SqlSessionFactory() yourself — the FactoryBean handles the complex construction. Another example: LocalContainerEntityManagerFactoryBean for JPA, which sets up the EntityManagerFactory with the right persistence unit, data source, and JPA vendor adapter.'
        }
      ]
    },
    {
      question: 'How does @Conditional differ from @Profile? When would you use each?',
      answer:
        '@Profile("name") is actually shorthand for @Conditional(ProfileCondition.class) — it activates a bean only when a specific named profile is active.\n\n' +
        '@Conditional accepts a custom Condition class with a matches() method where you can put any logic: check a property value, check if a class is on the classpath, check the operating system, check if another bean exists.\n\n' +
        '@ConditionalOnProperty, @ConditionalOnClass, @ConditionalOnMissingBean (Spring Boot autoconfigure) are all built on @Conditional.\n\n' +
        'Use @Profile for environment switching (dev vs prod vs test). Use @Conditional for feature flags, optional integrations, and "only if X library is present on the classpath" checks.',
      followUps: [
        {
          question: 'How would you write a @Conditional that only activates a bean if a specific property is set to "true"?',
          answer:
            '// Custom condition\n' +
            'public class KafkaEnabledCondition implements Condition {\n' +
            '    @Override\n' +
            '    public boolean matches(ConditionContext ctx, AnnotatedTypeMetadata meta) {\n' +
            '        return "true".equals(ctx.getEnvironment().getProperty("feature.kafka.enabled"));\n' +
            '    }\n' +
            '}\n\n' +
            '@Service\n' +
            '@Conditional(KafkaEnabledCondition.class)\n' +
            'public class KafkaProducer { ... }\n\n' +
            '// Or with Spring Boot shorthand:\n' +
            '@Service\n' +
            '@ConditionalOnProperty(name = "feature.kafka.enabled", havingValue = "true")\n' +
            'public class KafkaProducer { ... }'
        }
      ]
    }
  ],

  codeBased: [
    {
      question: 'Write a @Service with @Value and @PostConstruct. Prove that @Value is injected before @PostConstruct fires.',
      answer:
        '@Service\n' +
        'public class AppConfig {\n\n' +
        '    @Value("${app.name:Satyverse}")\n' +
        '    private String appName;\n\n' +
        '    @Value("${app.max-retries:3}")\n' +
        '    private int maxRetries;\n\n' +
        '    public AppConfig() {\n' +
        '        // @Value fields are NOT set here — they are null/0 in the constructor\n' +
        '        System.out.println("Constructor: appName=" + appName); // prints null\n' +
        '    }\n\n' +
        '    @PostConstruct\n' +
        '    public void init() {\n' +
        '        // @Value fields ARE set here — all injected before @PostConstruct\n' +
        '        System.out.println("@PostConstruct: appName=" + appName + ", retries=" + maxRetries);\n' +
        '        if (maxRetries < 1 || maxRetries > 10) {\n' +
        '            throw new IllegalStateException("app.max-retries must be between 1 and 10");\n' +
        '        }\n' +
        '    }\n' +
        '}\n\n' +
        '// Output:\n' +
        '// Constructor: appName=null\n' +
        '// @PostConstruct: appName=Satyverse, retries=3',
      followUps: [
        {
          question: 'What happens if app.max-retries=0 is set in application.properties?',
          answer: '@PostConstruct throws IllegalStateException before the bean is registered. The application fails to start with a clear message: "app.max-retries must be between 1 and 10". This is the fail-fast pattern — catch misconfiguration at startup, not on the first production request.'
        }
      ]
    },
    {
      question: 'Demonstrate the scope mismatch bug and fix it. Show the difference in behaviour clearly.',
      answer:
        '@Component @Scope("prototype")\n' +
        'class SessionId {\n' +
        '    private final String id = UUID.randomUUID().toString().substring(0, 8);\n' +
        '    public String getId() { return id; }\n' +
        '}\n\n' +
        '// BUG VERSION\n' +
        '@Service\n' +
        'class BuggyHandler {\n' +
        '    @Autowired private SessionId session; // injected once, shared forever\n' +
        '    public String getSession() { return session.getId(); }\n' +
        '}\n' +
        '// buggyHandler.getSession() -> "abc12345"\n' +
        '// buggyHandler.getSession() -> "abc12345" <- same ID, different "user"!\n\n' +
        '// FIXED VERSION\n' +
        '@Service\n' +
        'class FixedHandler {\n' +
        '    @Autowired private ObjectFactory<SessionId> sessionFactory;\n' +
        '    public String getSession() {\n' +
        '        return sessionFactory.getObject().getId(); // new instance each call\n' +
        '    }\n' +
        '}\n' +
        '// fixedHandler.getSession() -> "abc12345"\n' +
        '// fixedHandler.getSession() -> "xyz98765" <- different ID, correct!\n\n' +
        '// Proof in a test:\n' +
        '// assertNotEquals(fixedHandler.getSession(), fixedHandler.getSession());',
      followUps: []
    },
    {
      question: 'Write two PaymentService implementations. Wire Stripe as default (@Primary) and PayPal by name. Use both in a CheckoutService.',
      answer:
        'interface PaymentService {\n' +
        '    String charge(String orderId, double amount);\n' +
        '}\n\n' +
        '@Service\n' +
        '@Primary\n' +
        'class StripeService implements PaymentService {\n' +
        '    public String charge(String orderId, double amount) {\n' +
        '        return String.format("Stripe: charged $%.2f for %s", amount, orderId);\n' +
        '    }\n' +
        '}\n\n' +
        '@Service("paypal")\n' +
        'class PayPalService implements PaymentService {\n' +
        '    public String charge(String orderId, double amount) {\n' +
        '        return String.format("PayPal: charged $%.2f for %s", amount, orderId);\n' +
        '    }\n' +
        '}\n\n' +
        '@Service\n' +
        'class CheckoutService {\n' +
        '    @Autowired\n' +
        '    private PaymentService defaultGateway; // Stripe (@Primary)\n\n' +
        '    @Autowired\n' +
        '    @Qualifier("paypal")\n' +
        '    private PaymentService paypalGateway;\n\n' +
        '    public String checkout(String method, String orderId, double amount) {\n' +
        '        return "paypal".equalsIgnoreCase(method)\n' +
        '            ? paypalGateway.charge(orderId, amount)\n' +
        '            : defaultGateway.charge(orderId, amount);\n' +
        '    }\n' +
        '}\n\n' +
        '// checkoutService.checkout("stripe", "ORD-1", 99.99)\n' +
        '// -> "Stripe: charged $99.99 for ORD-1"\n' +
        '// checkoutService.checkout("paypal", "ORD-2", 49.50)\n' +
        '// -> "PayPal: charged $49.50 for ORD-2"',
      followUps: []
    },
    {
      question: 'Write a @PreDestroy that gracefully shuts down an ExecutorService. Why is graceful shutdown important?',
      answer:
        '@Service\n' +
        'public class OrderProcessingPool {\n' +
        '    private ExecutorService pool;\n\n' +
        '    @PostConstruct\n' +
        '    public void startPool() {\n' +
        '        pool = Executors.newFixedThreadPool(4);\n' +
        '        System.out.println("OrderProcessingPool: started 4 worker threads.");\n' +
        '    }\n\n' +
        '    public Future<String> submitOrder(Callable<String> order) {\n' +
        '        return pool.submit(order);\n' +
        '    }\n\n' +
        '    @PreDestroy\n' +
        '    public void stopPool() {\n' +
        '        System.out.println("OrderProcessingPool: stopping — waiting for in-flight orders...");\n' +
        '        pool.shutdown(); // no new tasks accepted\n' +
        '        try {\n' +
        '            // Give in-flight orders 10 seconds to complete\n' +
        '            if (!pool.awaitTermination(10, TimeUnit.SECONDS)) {\n' +
        '                System.out.println("OrderProcessingPool: timeout — force stopping.");\n' +
        '                pool.shutdownNow(); // interrupt running tasks\n' +
        '            } else {\n' +
        '                System.out.println("OrderProcessingPool: all orders completed cleanly.");\n' +
        '            }\n' +
        '        } catch (InterruptedException e) {\n' +
        '            pool.shutdownNow();\n' +
        '            Thread.currentThread().interrupt();\n' +
        '        }\n' +
        '    }\n' +
        '}\n\n' +
        '// Without @PreDestroy: threads are killed mid-order on shutdown.\n' +
        '// Orders partially processed, data corrupted, database in inconsistent state.',
      followUps: [
        {
          question: 'Does @PreDestroy fire when the JVM is killed with kill -9?',
          answer: 'No. kill -9 is an immediate, forced JVM termination — no shutdown hooks run, no @PreDestroy fires, threads are terminated instantly. @PreDestroy fires on graceful shutdown: SIGTERM (Kubernetes pod stop, kill without -9), context.close() called in code, or System.exit(). This is why Kubernetes sends SIGTERM and waits for the terminationGracePeriodSeconds before sending SIGKILL — it gives your @PreDestroy time to run.'
        }
      ]
    },
    {
      question: 'Write a BeanPostProcessor that logs startup timing for every bean.',
      answer:
        '@Component\n' +
        'public class StartupTimerBPP implements BeanPostProcessor {\n\n' +
        '    private final ConcurrentHashMap<String, Long> times = new ConcurrentHashMap<>();\n\n' +
        '    @Override\n' +
        '    public Object postProcessBeforeInitialization(Object bean, String name) {\n' +
        '        times.put(name, System.currentTimeMillis());\n' +
        '        return bean; // must return the bean\n' +
        '    }\n\n' +
        '    @Override\n' +
        '    public Object postProcessAfterInitialization(Object bean, String name) {\n' +
        '        Long start = times.remove(name);\n' +
        '        if (start != null) {\n' +
        '            long ms = System.currentTimeMillis() - start;\n' +
        '            String label = ms > 500 ? "SLOW! " : ms > 100 ? "WARN  " : "OK    ";\n' +
        '            System.out.printf("[BPP] %s %-40s %dms%n", label, name, ms);\n' +
        '        }\n' +
        '        return bean; // must return the bean\n' +
        '    }\n' +
        '}\n\n' +
        '// Sample output during startup:\n' +
        '// [BPP] OK     userRepository                           12ms\n' +
        '// [BPP] WARN   productCatalogService                    134ms\n' +
        '// [BPP] SLOW!  reportGeneratorService                   823ms  <- investigate this',
      followUps: []
    },
    {
      question: 'Refactor field injection to constructor injection. Show what changes and why each change matters.',
      answer:
        '// BEFORE — field injection (avoid)\n' +
        '@Service\n' +
        'public class InvoiceService {\n' +
        '    @Autowired private CustomerRepository customerRepo;\n' +
        '    @Autowired private TaxCalculator taxCalc;\n' +
        '    @Autowired private PdfGenerator pdfGen;\n\n' +
        '    public byte[] generate(Long customerId, List<String> items) {\n' +
        '        Customer c = customerRepo.findById(customerId);\n' +
        '        double tax = taxCalc.calculate(items, c.getCountry());\n' +
        '        return pdfGen.render(c, items, tax);\n' +
        '    }\n' +
        '}\n\n' +
        '// AFTER — constructor injection (do this)\n' +
        '@Service\n' +
        'public class InvoiceService {\n' +
        '    private final CustomerRepository customerRepo; // final: cannot be changed\n' +
        '    private final TaxCalculator taxCalc;\n' +
        '    private final PdfGenerator pdfGen;\n\n' +
        '    // No @Autowired needed — Spring uses the single constructor automatically\n' +
        '    public InvoiceService(CustomerRepository customerRepo,\n' +
        '                          TaxCalculator taxCalc,\n' +
        '                          PdfGenerator pdfGen) {\n' +
        '        this.customerRepo = customerRepo;\n' +
        '        this.taxCalc = taxCalc;\n' +
        '        this.pdfGen = pdfGen;\n' +
        '    }\n\n' +
        '    public byte[] generate(Long customerId, List<String> items) {\n' +
        '        Customer c = customerRepo.findById(customerId);\n' +
        '        double tax = taxCalc.calculate(items, c.getCountry());\n' +
        '        return pdfGen.render(c, items, tax);\n' +
        '    }\n' +
        '}\n\n' +
        '// Unit test — NO Spring context needed:\n' +
        '// var service = new InvoiceService(mockRepo, mockTax, mockPdf);\n' +
        '// var result = service.generate(1L, List.of("Book", "Pen"));\n' +
        '// assertNotNull(result);',
      followUps: []
    },
    {
      question: 'Write @DependsOn to guarantee a CacheWarmer runs before ProductService. Then write a test that verifies the order.',
      answer:
        '@Service("cacheWarmer")\n' +
        'public class CacheWarmer {\n' +
        '    private boolean warmed = false;\n\n' +
        '    @PostConstruct\n' +
        '    public void warm() {\n' +
        '        System.out.println("CacheWarmer: warming cache...");\n' +
        '        warmed = true;\n' +
        '        System.out.println("CacheWarmer: cache ready.");\n' +
        '    }\n\n' +
        '    public boolean isWarmed() { return warmed; }\n' +
        '}\n\n' +
        '@Service\n' +
        '@DependsOn("cacheWarmer") // Spring initializes cacheWarmer first\n' +
        'public class ProductService {\n' +
        '    @Autowired private CacheWarmer cacheWarmer; // also inject to read state\n\n' +
        '    @PostConstruct\n' +
        '    public void init() {\n' +
        '        // cacheWarmer.isWarmed() is guaranteed to be true here\n' +
        '        System.out.println("ProductService: starting (cache warm=" + cacheWarmer.isWarmed() + ")");\n' +
        '        if (!cacheWarmer.isWarmed()) throw new IllegalStateException("Cache not ready!");\n' +
        '    }\n' +
        '}\n\n' +
        '// Test:\n' +
        '@SpringBootTest\n' +
        'class OrderTest {\n' +
        '    @Autowired CacheWarmer cacheWarmer;\n' +
        '    @Autowired ProductService productService;\n\n' +
        '    @Test\n' +
        '    void cacheWarmerShouldBeReadyBeforeProductService() {\n' +
        '        // If @DependsOn works, cacheWarmer.isWarmed() must be true\n' +
        '        // when ProductService starts. No exception means it passed.\n' +
        '        assertTrue(cacheWarmer.isWarmed());\n' +
        '    }\n' +
        '}',
      followUps: []
    },
    {
      question: 'Fix this circular dependency: OrderService needs PriceService, PriceService needs OrderService. Extract a shared bean.',
      answer:
        '// PROBLEM:\n' +
        '// @Service class OrderService { @Autowired PriceService price; }\n' +
        '// @Service class PriceService { @Autowired OrderService order; } <- CYCLE\n\n' +
        '// Step 1: Ask why PriceService needs OrderService.\n' +
        '// Answer: it needs to know the item list to calculate tax.\n' +
        '// That logic belongs in neither class — extract it.\n\n' +
        '// FIXED:\n' +
        '@Service\n' +
        'public class TaxEngine {\n' +
        '    public double calculateTax(List<String> items, String country) {\n' +
        '        double base = items.size() * 10.0;\n' +
        '        return "IN".equals(country) ? base * 0.18 : base * 0.10;\n' +
        '    }\n' +
        '}\n\n' +
        '@Service\n' +
        'public class PriceService {\n' +
        '    private final TaxEngine taxEngine;\n' +
        '    PriceService(TaxEngine taxEngine) { this.taxEngine = taxEngine; }\n\n' +
        '    public double quote(List<String> items, String country) {\n' +
        '        return items.size() * 10.0 + taxEngine.calculateTax(items, country);\n' +
        '    }\n' +
        '}\n\n' +
        '@Service\n' +
        'public class OrderService {\n' +
        '    private final PriceService priceService;\n' +
        '    OrderService(PriceService priceService) { this.priceService = priceService; }\n\n' +
        '    public double calculateOrderTotal(List<String> items, String country) {\n' +
        '        return priceService.quote(items, country);\n' +
        '    }\n' +
        '}\n' +
        '// No cycle. Clean constructor injection. Fully testable.',
      followUps: []
    },
    {
      question: 'Write a SmartInitializingSingleton that validates every @Service with a custom @RequiresConfig annotation has config loaded.',
      answer:
        '// Custom annotation\n' +
        '@Retention(RetentionPolicy.RUNTIME)\n' +
        '@Target(ElementType.TYPE)\n' +
        'public @interface RequiresConfig {\n' +
        '    String key(); // property key that must be non-blank\n' +
        '}\n\n' +
        '@Component\n' +
        'public class ConfigValidator implements SmartInitializingSingleton {\n' +
        '    @Autowired ApplicationContext ctx;\n' +
        '    @Autowired Environment env;\n\n' +
        '    @Override\n' +
        '    public void afterSingletonsInstantiated() {\n' +
        '        List<String> problems = new ArrayList<>();\n\n' +
        '        ctx.getBeansWithAnnotation(RequiresConfig.class).forEach((name, bean) -> {\n' +
        '            RequiresConfig annotation = bean.getClass().getAnnotation(RequiresConfig.class);\n' +
        '            String value = env.getProperty(annotation.key());\n' +
        '            if (value == null || value.isBlank()) {\n' +
        '                problems.add(name + " requires property: " + annotation.key());\n' +
        '            }\n' +
        '        });\n\n' +
        '        if (!problems.isEmpty()) {\n' +
        '            throw new IllegalStateException(\n' +
        '                "Missing required configuration:\\n" + String.join("\\n", problems));\n' +
        '        }\n' +
        '        System.out.println("ConfigValidator: all required properties are set.");\n' +
        '    }\n' +
        '}\n\n' +
        '// Usage:\n' +
        '@Service\n' +
        '@RequiresConfig(key = "stripe.api-key")\n' +
        'public class StripeService { ... }\n\n' +
        '// If stripe.api-key is not set, app fails at startup with:\n' +
        '// "Missing required configuration: stripeService requires property: stripe.api-key"',
      followUps: []
    },
    {
      question: 'Write a Spring Boot test that verifies @PostConstruct ran AND that two prototype injections give different instances.',
      answer:
        '@SpringBootTest\n' +
        'class LifecycleTest {\n\n' +
        '    @Autowired MenuService menuService;\n' +
        '    @Autowired CheckoutService checkoutService;\n\n' +
        '    @Test\n' +
        '    void postConstructShouldLoadMenu() {\n' +
        '        // @PostConstruct ran before any test executes\n' +
        '        // If it did not run, getMenu() returns null -> assertion fails\n' +
        '        assertNotNull(menuService.getMenu(), "@PostConstruct should have loaded the menu");\n' +
        '        assertFalse(menuService.getMenu().isEmpty(), "Menu should not be empty after startup");\n' +
        '    }\n\n' +
        '    @Test\n' +
        '    void prototypeCartsShouldBeDifferentInstances() {\n' +
        '        OrderCart cart1 = checkoutService.startNewOrder();\n' +
        '        OrderCart cart2 = checkoutService.startNewOrder();\n\n' +
        '        // assertNotSame checks object identity (==), not equals()\n' +
        '        assertNotSame(cart1, cart2, "Each order should get a fresh Cart instance");\n\n' +
        '        // Prove isolation: item added to cart1 must not appear in cart2\n' +
        '        cart1.add("Pizza");\n' +
        '        assertTrue(cart2.getItems().isEmpty(), "Carts must be isolated — no shared state");\n' +
        '    }\n' +
        '}\n\n' +
        '// Key insight: Spring\'s full lifecycle (construct -> inject -> @PostConstruct)\n' +
        '// has already completed by the time @Test methods execute.\n' +
        '// Testing @PostConstruct effects = testing the resulting state of the bean.',
      followUps: []
    },
    {
      question: 'Diagnose and fix this @Transactional self-invocation bug.',
      answer:
        '// BUG — saveOrder is called via this, bypassing the proxy\n' +
        '@Service\n' +
        'public class OrderService {\n\n' +
        '    public void processBatch(List<String> items) {\n' +
        '        for (String item : items) {\n' +
        '            this.saveOrder(item); // WRONG — bypasses @Transactional proxy\n' +
        '        }\n' +
        '    }\n\n' +
        '    @Transactional\n' +
        '    public void saveOrder(String item) {\n' +
        '        orderRepo.save(item);\n' +
        '        auditLog.record(item); // if this throws, NO rollback happens!\n' +
        '    }\n' +
        '}\n\n' +
        '// Confirm the bug:\n' +
        '// Add inside saveOrder:\n' +
        '// System.out.println(TransactionSynchronizationManager.isActualTransactionActive());\n' +
        '// Called via this -> prints false\n' +
        '// Called via proxy (external) -> prints true\n\n' +
        '// FIX — extract to a separate service\n' +
        '@Service\n' +
        'public class OrderPersistence {\n' +
        '    @Transactional // now works — all callers go through the proxy\n' +
        '    public void saveOrder(String item) {\n' +
        '        orderRepo.save(item);\n' +
        '        auditLog.record(item); // if this throws, transaction rolls back\n' +
        '    }\n' +
        '}\n\n' +
        '@Service\n' +
        'public class OrderService {\n' +
        '    @Autowired private OrderPersistence persistence;\n\n' +
        '    public void processBatch(List<String> items) {\n' +
        '        for (String item : items) {\n' +
        '            persistence.saveOrder(item); // through proxy — @Transactional works\n' +
        '        }\n' +
        '    }\n' +
        '}',
      followUps: []
    },
    {
      question: 'Write a bean implementing ApplicationContextAware to auto-discover all plugins and register them.',
      answer:
        'public interface Plugin {\n' +
        '    String getName();\n' +
        '    void execute(String input);\n' +
        '}\n\n' +
        '@Service class PdfPlugin implements Plugin {\n' +
        '    public String getName() { return "pdf"; }\n' +
        '    public void execute(String input) { System.out.println("PDF: " + input); }\n' +
        '}\n\n' +
        '@Service class CsvPlugin implements Plugin {\n' +
        '    public String getName() { return "csv"; }\n' +
        '    public void execute(String input) { System.out.println("CSV: " + input); }\n' +
        '}\n\n' +
        '@Service\n' +
        'public class PluginRegistry implements ApplicationContextAware {\n\n' +
        '    private ApplicationContext ctx;\n' +
        '    private Map<String, Plugin> plugins;\n\n' +
        '    @Override\n' +
        '    public void setApplicationContext(ApplicationContext ctx) {\n' +
        '        this.ctx = ctx; // called before @PostConstruct\n' +
        '    }\n\n' +
        '    @PostConstruct\n' +
        '    public void register() {\n' +
        '        plugins = new HashMap<>();\n' +
        '        ctx.getBeansOfType(Plugin.class).values()\n' +
        '            .forEach(p -> plugins.put(p.getName(), p));\n' +
        '        System.out.println("Plugins registered: " + plugins.keySet());\n' +
        '    }\n\n' +
        '    public void run(String pluginName, String input) {\n' +
        '        Plugin p = plugins.get(pluginName);\n' +
        '        if (p == null) throw new IllegalArgumentException("Unknown plugin: " + pluginName);\n' +
        '        p.execute(input);\n' +
        '    }\n' +
        '}\n\n' +
        '// pluginRegistry.run("pdf", "invoice.pdf") -> "PDF: invoice.pdf"\n' +
        '// pluginRegistry.run("csv", "report.csv")  -> "CSV: report.csv"\n' +
        '// Adding a new plugin = just add a new @Service implementing Plugin. Zero config.',
      followUps: []
    }
  ],

  seniorScenario: [
    {
      question: 'Users in production see each other\'s shopping cart contents. The Cart bean is @Scope("prototype"). What went wrong and how do you fix it with zero downtime?',
      answer:
        'Root cause: scope mismatch. Cart is prototype, but it was @Autowired directly into a singleton CheckoutService. Spring injected one Cart at singleton startup — that same Cart is now shared by every request, every user, every thread.\n\n' +
        'To confirm without touching production: enable DEBUG logging for the CheckoutService bean. Add a log line printing System.identityHashCode(cart) inside addToCart(). If all log lines show the same hash, one Cart is shared — confirmed.\n\n' +
        'Fix: change the @Autowired Cart field to @Autowired ObjectFactory<Cart> cartFactory. Change every use of cart.x() to cartFactory.getObject().x(). This is a two-line change in CheckoutService — no schema changes, no infra changes.\n\n' +
        'Deploy strategy for zero downtime: since this is a singleton field change, a rolling restart works. The old instances serve traffic until replaced. New instances get fresh carts per request immediately.\n\n' +
        'Verification after deploy: add an integration test that calls addToCart() for two simulated users and asserts their cart contents are isolated. Add this test to CI so this cannot regress.',
      followUps: [
        {
          question: 'What if Cart also has a @PreDestroy to close a connection? Does the fix affect that?',
          answer:
            'Yes, and it makes the leak worse without addressing it. With ObjectFactory, a new Cart is created per call but @PreDestroy is still never called — prototype beans are not cleaned up by Spring. The connection opened in Cart\'s @PostConstruct is never closed.\n\n' +
            'The real fix for that: make Cart implement AutoCloseable, and have the caller use try-with-resources: try (Cart cart = cartFactory.getObject()) { cart.add(item); }. Or redesign Cart to not hold connections — connections should stay in the repository layer.'
        }
      ]
    },
    {
      question: 'After a Spring Boot 2 to 3 upgrade, five services fail with circular dependency errors at startup. How do you handle this without rolling back?',
      answer:
        'Spring Boot 3 (Framework 6) changed the default: circular dependencies via field/setter injection that were silently resolved before now throw BeanCurrentlyInCreationException.\n\n' +
        'Immediate action (< 5 minutes): add spring.main.allow-circular-references=true to application.properties. This restores Spring Boot 2 behaviour. Deploy. The app starts. You have bought time to fix the real problems.\n\n' +
        'Investigation: read each error message — Spring prints the full cycle chain. Write each one down. For five services there are likely two or three distinct cycle clusters.\n\n' +
        'Fix per cycle: for each cycle, ask "what does A need from B and B need from A?" Usually both need some shared calculation or event — extract that to a new @Service C. A and B both depend on C. No cycle.\n\n' +
        'Validation: after fixing each cycle, temporarily remove allow-circular-references and start the app. If it starts clean, the cycle is gone.\n\n' +
        'Final step: remove allow-circular-references=true permanently. Add an ArchUnit test:\n\n' +
        'noClasses().that().resideInPackage("com.myapp..")\n' +
        '    .should().dependOnClassesThat().resideInPackage("..same..")\n\n' +
        'This catches any new cycles in CI before they reach production.',
      followUps: []
    },
    {
      question: 'A @Transactional method is not rolling back on exceptions in production. Developers swear the annotation is there. Walk through your diagnosis.',
      answer:
        'Three most common causes, in order of frequency:\n\n' +
        'Cause 1 — Self-invocation: the @Transactional method is called from within the same class (this.method()). The proxy is bypassed, no transaction starts. To check: add TransactionSynchronizationManager.isActualTransactionActive() inside the method. If it returns false, this is the cause. Fix: move the @Transactional method to a separate @Service.\n\n' +
        'Cause 2 — Wrong exception type: @Transactional only rolls back on RuntimeException (unchecked) by default. If the method throws a checked exception (IOException, SQLException), the transaction COMMITS even on error. Check: is the exception checked? Fix: add @Transactional(rollbackFor = Exception.class) or throw an unchecked wrapper.\n\n' +
        'Cause 3 — @Transactional on a non-public method: CGLIB proxies can only intercept public methods. @Transactional on a private or package-private method is silently ignored. Fix: make the method public.\n\n' +
        'Additional check: enable Spring\'s transaction debug logging:\n' +
        'logging.level.org.springframework.transaction=DEBUG\n\n' +
        'This logs every transaction begin, commit, and rollback. If you do not see a "begin" log for your method, no transaction ever started.',
      followUps: []
    },
    {
      question: 'Production startup takes 45 seconds. Kubernetes liveness probes kill the pod before it finishes. What is your approach?',
      answer:
        'Step 1 — Measure: add a BeanPostProcessor that times each bean\'s initialization (System.currentTimeMillis() delta between postProcessBefore and postProcessAfter). Find the top 5 slowest beans.\n\n' +
        'Step 2 — Classify slow beans:\n' +
        '- Network I/O in @PostConstruct (calling an external API, downloading config): move to background thread\n' +
        '- Loading a large dataset: move to background thread, expose a ReadinessIndicator\n' +
        '- Unnecessary pre-loading that could be lazy: add @Lazy\n\n' +
        'Step 3 — Fix Kubernetes immediately: increase initialDelaySeconds in the readiness probe to match the current startup time. This stops the kill-before-ready problem while you fix the root cause.\n\n' +
        'Step 4 — Fix slow beans: for each bean with heavy @PostConstruct, move work to a background thread. Set a volatile boolean ready = false. In the background thread\'s completion, set ready = true. Implement ReadinessIndicator that returns OutOfService until ready == true. Kubernetes waits for readiness before routing traffic.\n\n' +
        'Step 5 — Spring Boot options: spring.main.lazy-initialization=true makes ALL beans lazy by default (good for startup time, bad for catching wiring errors). spring.threads.virtual.enabled=true (Boot 3.2+) uses virtual threads for parallel bean initialization. Test thoroughly before enabling either in production.',
      followUps: []
    },
    {
      question: 'Your team wants to enforce that every @Service implementing the Auditable interface MUST have a non-null @AuditCategory annotation. Where and how do you implement this check?',
      answer:
        'Use SmartInitializingSingleton.afterSingletonsInstantiated() for this check — not @PostConstruct (individual beans may not all exist yet) and not ApplicationListener<ContextRefreshedEvent> (fires multiple times).\n\n' +
        '@Component\n' +
        'public class AuditValidator implements SmartInitializingSingleton {\n' +
        '    @Autowired ApplicationContext ctx;\n\n' +
        '    @Override\n' +
        '    public void afterSingletonsInstantiated() {\n' +
        '        List<String> violations = new ArrayList<>();\n' +
        '        ctx.getBeansOfType(Auditable.class).forEach((name, bean) -> {\n' +
        '            if (bean.getClass().getAnnotation(AuditCategory.class) == null) {\n' +
        '                violations.add(name + " is Auditable but missing @AuditCategory");\n' +
        '            }\n' +
        '        });\n' +
        '        if (!violations.isEmpty()) {\n' +
        '            throw new IllegalStateException("Audit config errors:\\n" + String.join("\\n", violations));\n' +
        '        }\n' +
        '    }\n' +
        '}\n\n' +
        'This causes a hard startup failure with a clear message if any Auditable bean is missing the annotation. You catch the misconfiguration at deployment time, not in a production audit log review.\n\n' +
        'Complement with an ArchUnit test for CI-time feedback:\n' +
        'classes().that().implement(Auditable.class)\n' +
        '    .should().beAnnotatedWith(AuditCategory.class)\n' +
        '    .check(importedClasses);',
      followUps: []
    },
    {
      question: 'A junior developer used field injection in 50 classes. You want to migrate to constructor injection. What is your strategy to do this safely without breaking everything?',
      answer:
        'Approach: incremental migration, one class at a time, with tests validating each step.\n\n' +
        'Step 1 — Automate detection: enable IntelliJ\'s "Spring: Field injection warning" inspection project-wide. Or use a Checkstyle/ArchUnit rule: no @Autowired on fields in the main source set. This gives you a prioritized list.\n\n' +
        'Step 2 — Prioritize: migrate classes that have unit tests first. These tests will immediately catch if you break something during migration. Classes without tests are riskier.\n\n' +
        'Step 3 — Mechanical migration per class:\n' +
        '1. Add all @Autowired fields as constructor parameters\n' +
        '2. Make fields private final\n' +
        '3. Remove @Autowired from fields\n' +
        '4. Run the class\'s unit tests: if they use new MyClass() they will now fail because the constructor requires arguments — update the tests to pass mock objects\n' +
        '5. Run the full integration test suite\n\n' +
        'Step 4 — Lombok shortcut for simple cases: add @RequiredArgsConstructor on the class. Lombok generates the constructor from all final fields. This is one annotation instead of writing the constructor manually.\n\n' +
        'Step 5 — After migration: enforce the rule permanently with ArchUnit in CI so new code cannot reintroduce field injection.',
      followUps: []
    }
  ],

  wrongAnswers: [
    {
      wrong: '@PostConstruct runs right after the constructor, before any @Autowired fields are set.',
      correction:
        'The opposite is true. Spring sets ALL @Autowired fields and @Value properties FIRST, then calls @PostConstruct. The entire purpose of @PostConstruct is to give you a safe place to run setup code where your dependencies are already available. If it ran before injection, you could not use any injected fields in it — it would be useless.\n\n' +
        'Proof:\n' +
        '@Service public class Demo {\n' +
        '    @Autowired private Repo repo;\n' +
        '    public Demo() { System.out.println("constructor: repo=" + repo); }  // prints null\n' +
        '    @PostConstruct public void init() { System.out.println("@PostConstruct: repo=" + repo); } // not null\n' +
        '}',
      whyBelivedWrong: '"PostConstruct" sounds like "immediately after construction." It actually means "after the bean is fully constructed," which Spring defines as: built + dependencies provided. The bean is not ready until both steps are done.'
    },
    {
      wrong: '@PreDestroy is called for all Spring beans — including prototype beans — when the application shuts down.',
      correction:
        'Spring calls @PreDestroy only for SINGLETON beans. After creating a prototype, Spring releases its reference and forgets the bean. No reference = no cleanup call. This is intentional — prototype ownership transfers to the caller.\n\n' +
        'If a prototype holds a database connection, the @PreDestroy on it will NEVER fire. That connection leaks. The caller must close it manually using try-with-resources or an explicit destroy() call.',
      whyBelivedWrong: 'Developers assume Spring tracks everything it creates for its full lifetime. It tracks singletons fully. Prototypes only up to the moment of handoff.'
    },
    {
      wrong: '@Lazy fixes circular dependencies.',
      correction:
        '@Lazy on a constructor parameter injects a CGLIB proxy instead of the real bean. The proxy allows startup to succeed because Spring does not need to create the real bean yet. But the circular dependency design is still there — A still logically needs B and B still logically needs A.\n\n' +
        'The real fix: extract a third class that both A and B depend on. This eliminates the circular relationship from your design. @Lazy is a temporary patch — always comment it and create a follow-up ticket when you use it this way.',
      whyBelivedWrong: 'The startup error disappears after adding @Lazy, which looks like a fix. "No error" is confused with "problem solved."'
    },
    {
      wrong: '@Scope("prototype") means Spring creates a new instance on every method call.',
      correction:
        'Prototype scope means Spring creates a new instance every time a bean is REQUESTED — via @Autowired injection, getBean(), or ObjectFactory.getObject(). Once you have a reference to a prototype instance, all method calls on that reference use the same object. A new instance is only created when you explicitly ask Spring for one.\n\n' +
        'Example:\n' +
        'Cart cart = cartFactory.getObject(); // new instance created here\n' +
        'cart.add("Pizza");  // same cart\n' +
        'cart.add("Burger"); // same cart\n' +
        'Cart cart2 = cartFactory.getObject(); // NEW instance only here',
      whyBelivedWrong: 'Prototype sounds like "fresh per operation." The scope controls bean acquisition (when you get a new one from Spring), not how many times you can call methods on the one you already have.'
    },
    {
      wrong: '@DependsOn("beanX") injects beanX into your bean as a field named beanX.',
      correction:
        '@DependsOn controls initialization ORDER only. It tells Spring to initialize the named bean first. No injection happens. No field is populated. After startup, your bean has zero programmatic access to the @DependsOn bean through that annotation.\n\n' +
        'If you also need to call methods on beanX, you must @Autowire it separately:\n' +
        '@Service @DependsOn("migrationRunner")\n' +
        'public class UserRepo {\n' +
        '    @Autowired private MigrationRunner runner; // ALSO needed if you want to call methods\n' +
        '}',
      whyBelivedWrong: '"Depends on" implies needing and using something, which implies having a reference. In Spring terminology, "depends on" means only "initialize this first." Injection is a separate mechanism.'
    },
    {
      wrong: 'Singleton scope in Spring means only one instance of the class exists in the entire JVM.',
      correction:
        'Spring singleton means one instance per ApplicationContext, not per JVM. In a Spring MVC app there are typically two contexts (root + DispatcherServlet child context) — each has its own set of singletons. In tests that create multiple contexts, each context has its own instances.\n\n' +
        'Also: nothing stops you from creating additional instances with new MyService() outside Spring. Spring\'s singleton scope only applies to beans it manages — it has no control over manual instantiation.',
      whyBelivedWrong: 'The classic Gang-of-Four Singleton design pattern means one per JVM. Spring borrowed the word but scoped it to the container, not the JVM.'
    },
    {
      wrong: 'You need @Autowired on a constructor for Spring to inject through it.',
      correction:
        'Since Spring 4.3, if a class has exactly ONE constructor, Spring automatically uses it for dependency injection — no @Autowired annotation needed. @Autowired is only required when there are MULTIPLE constructors and you want to designate which one Spring should use.\n\n' +
        '@Service\n' +
        'public class OrderService {\n' +
        '    private final Repo repo;\n' +
        '    public OrderService(Repo repo) { this.repo = repo; } // Spring uses this automatically\n' +
        '}',
      whyBelivedWrong: 'All Spring tutorials written before Spring 4.3 (2016) showed @Autowired on constructors. Those examples spread widely and the newer behaviour is not well-known.'
    },
    {
      wrong: '@Lazy makes a bean prototype-scoped — a fresh instance is created each time it is @Autowired.',
      correction:
        '@Lazy and @Scope("prototype") are completely independent. @Lazy on a singleton delays its creation to first use — the bean is still a singleton (one instance, cached forever after first creation). @Scope("prototype") creates a new instance per request. Adding @Lazy to a prototype only makes the FIRST instance creation lazy — after that, getObject() behaviour is unchanged.\n\n' +
        'If you need a fresh instance each time: use @Scope("prototype") with ObjectFactory, not @Lazy.',
      whyBelivedWrong: 'Both @Lazy and @Scope("prototype") involve "not creating the bean at startup." The distinction: @Lazy = create once but later. @Scope("prototype") = create fresh each time, never cache.'
    }
  ]
};

// ─── MCQ (30 questions with code examples and detailed explanations) ────────────
const mcq = {
  type: 'mcq',
  title: 'Quiz — Spring Bean Lifecycle & Advanced DI',
  description: 'Test your understanding with 30 questions — basic to advanced. Code-category questions include real code snippets.',
  questions: [
    // ── BASIC (8) ──────────────────────────────────────────────────────────────
    {
      id: 1, level: 'basic', category: 'theory',
      question: 'What is a Spring bean in the simplest possible definition?',
      options: {
        A: 'A class that must extend SpringBean base class',
        B: 'Any Java class that Spring creates, wires, and manages for you',
        C: 'A method in a @Controller class that handles HTTP requests',
        D: 'An XML element that configures database connection pools'
      },
      answer: 'B',
      explanation: 'A Spring bean is just a regular Java class that Spring takes responsibility for. You annotate it with @Service, @Component, @Repository, or @Controller (or use a @Bean method in @Configuration). Spring creates one instance, provides its dependencies, and makes it available throughout your application. No special base class or interface is required.'
    },
    {
      id: 2, level: 'basic', category: 'theory',
      question: 'In what order do these Spring lifecycle events occur?\n\n(1) @PostConstruct method runs\n(2) @Autowired fields are injected\n(3) Constructor is called',
      options: {
        A: '1 → 2 → 3',
        B: '2 → 3 → 1',
        C: '3 → 2 → 1',
        D: '3 → 1 → 2'
      },
      answer: 'C',
      explanation: 'Always: Constructor first (3) — object created, fields are null. Then @Autowired injection (2) — Spring fills all dependencies. Then @PostConstruct (1) — all fields ready, safe to use them. This order never changes regardless of how many annotations you combine.'
    },
    {
      id: 3, level: 'basic', category: 'code',
      question: 'What does this code print?\n\n```java\n@Service\npublic class GreetingService {\n    @Value("${app.greeting:Hello}")\n    private String greeting;\n\n    public GreetingService() {\n        System.out.println("A: " + greeting);\n    }\n\n    @PostConstruct\n    public void init() {\n        System.out.println("B: " + greeting);\n    }\n}\n```',
      options: {
        A: 'A: Hello\nB: Hello',
        B: 'A: null\nB: Hello',
        C: 'B: Hello\nA: null',
        D: 'A: Hello\nB: null'
      },
      answer: 'B',
      explanation: '@Value is injected AFTER the constructor runs. Inside the constructor, greeting is null (no value yet) → prints "A: null". By the time @PostConstruct runs, Spring has injected the @Value → prints "B: Hello". This demonstrates exactly why you should never use injected fields in the constructor.'
    },
    {
      id: 4, level: 'basic', category: 'theory',
      question: 'What is @PreDestroy used for?',
      options: {
        A: 'To prevent a bean from being destroyed under any condition',
        B: 'To run cleanup code when the application context closes',
        C: 'To run setup code before the constructor is called',
        D: 'To mark a bean that should be created before all other beans'
      },
      answer: 'B',
      explanation: '@PreDestroy marks a method Spring calls when the application is shutting down (when the context is closed). This is your cleanup hook: close database connections, stop background threads, flush unsaved data. Important: Spring does NOT call @PreDestroy on prototype-scoped beans — only singleton beans get this lifecycle callback.'
    },
    {
      id: 5, level: 'basic', category: 'theory',
      question: 'What is the default scope of a Spring bean if no @Scope annotation is specified?',
      options: {
        A: 'prototype — a new instance for every @Autowired injection',
        B: 'request — one instance per HTTP request',
        C: 'singleton — one shared instance for the whole application',
        D: 'session — one instance per logged-in user session'
      },
      answer: 'C',
      explanation: 'Singleton is the default. Spring creates exactly ONE instance of the bean and shares it with everyone who asks for it via @Autowired. This is appropriate for stateless services (the vast majority). Singleton beans are created at startup (unless @Lazy) and destroyed on context close. Use prototype only when your bean must hold state unique to each caller.'
    },
    {
      id: 6, level: 'basic', category: 'code',
      question: 'Which of these correctly shows constructor injection in modern Spring Boot (no @Autowired needed)?',
      options: {
        A: '@Service public class A {\n    @Autowired private B b;\n}',
        B: '@Service public class A {\n    private final B b;\n    public A(B b) { this.b = b; }\n}',
        C: '@Service public class A {\n    private B b;\n    @Autowired public void setB(B b) { this.b = b; }\n}',
        D: '@Service public class A {\n    @Inject private B b;\n}'
      },
      answer: 'B',
      explanation: 'Since Spring 4.3, a class with a SINGLE constructor does not need @Autowired — Spring detects it automatically. Option B is correct constructor injection: (1) field is final (immutable after construction), (2) dependency is explicit in the constructor signature, (3) testable with new A(mockB) without any Spring context, (4) no @Autowired annotation clutter needed.'
    },
    {
      id: 7, level: 'basic', category: 'theory',
      question: 'You have two @Service classes implementing the same interface. Spring throws NoUniqueBeanDefinitionException. What is the quickest fix to make one the default?',
      options: {
        A: 'Add @Primary to the implementation you want as the default',
        B: 'Add @Singleton to the implementation you want as the default',
        C: 'Remove @Service from one of them',
        D: 'Add @Autowired(required=false) at the injection point'
      },
      answer: 'A',
      explanation: '@Primary tells Spring "when multiple beans of this type exist and no @Qualifier is specified, use this one." It is the default-setter. The other bean is still available by requesting it explicitly with @Qualifier("beanName"). Adding @Singleton does nothing — singleton is already the default scope. Removing @Service hides the bean entirely — not always what you want.'
    },
    {
      id: 8, level: 'basic', category: 'code',
      question: 'What is wrong with this code?\n\n```java\n@Service\npublic class DataLoader {\n    @Autowired\n    private DataRepository repo;\n\n    public DataLoader() {\n        List<Data> all = repo.findAll(); // line A\n    }\n\n    @PostConstruct\n    public void init() {\n        List<Data> all = repo.findAll(); // line B\n    }\n}\n```',
      options: {
        A: 'Line A throws NullPointerException — repo is not injected until after the constructor',
        B: 'Line B throws NullPointerException — @PostConstruct fires before @Autowired',
        C: 'Both line A and B throw exceptions — you cannot use repo in either place',
        D: 'Nothing is wrong — both lines work correctly'
      },
      answer: 'A',
      explanation: 'Line A throws NullPointerException because repo is null inside the constructor — Spring injects @Autowired fields AFTER the constructor completes. Line B (inside @PostConstruct) is perfectly correct — by the time @PostConstruct runs, repo is already injected and ready. This is exactly why @PostConstruct exists.'
    },

    // ── INTERMEDIATE (12) ──────────────────────────────────────────────────────
    {
      id: 9, level: 'intermediate', category: 'code',
      question: 'What does this code print when checkoutService.addToCart("Pizza") is called twice?\n\n```java\n@Component @Scope("prototype")\nclass Cart {\n    private List<String> items = new ArrayList<>();\n    public void add(String i) { items.add(i); }\n    public List<String> getItems() { return items; }\n}\n\n@Service\nclass CheckoutService {\n    @Autowired private Cart cart;\n    public void addToCart(String item) {\n        cart.add(item);\n        System.out.println(cart.getItems());\n    }\n}\n```',
      options: {
        A: '[Pizza]\n[Pizza] — new cart each call, first item cleared',
        B: '[Pizza]\n[Pizza, Pizza] — same cart object used both times',
        C: '[Pizza]\n[] — prototype creates new empty cart each call',
        D: 'NullPointerException — prototype beans cannot be @Autowired into singletons'
      },
      answer: 'B',
      explanation: 'Scope mismatch bug. CheckoutService is a singleton created once. Spring injects ONE Cart at that moment. Both calls to addToCart() use that same Cart instance — items accumulate. The output shows [Pizza] then [Pizza, Pizza]. Fix: inject ObjectFactory<Cart> and call getObject() per call to get a truly fresh cart.'
    },
    {
      id: 10, level: 'intermediate', category: 'code',
      question: 'Which code correctly fixes the scope mismatch from the previous question?\n\n```java\n// Option A:\n@Service\nclass CheckoutService {\n    @Autowired private ObjectFactory<Cart> cartFactory;\n    public void addToCart(String item) {\n        Cart cart = cartFactory.getObject();\n        cart.add(item);\n        System.out.println(cart.getItems());\n    }\n}\n\n// Option B:\n@Service @Scope("prototype")\nclass CheckoutService {\n    @Autowired private Cart cart;\n    public void addToCart(String item) { ... }\n}\n```',
      options: {
        A: 'Option A — ObjectFactory creates a fresh Cart on each getObject() call',
        B: 'Option B — making CheckoutService prototype fixes the mismatch',
        C: 'Both options fix the problem equally well',
        D: 'Neither option works — prototype beans cannot be wired correctly'
      },
      answer: 'A',
      explanation: 'Option A is correct. ObjectFactory<Cart> creates a new Cart instance on each getObject() call — fresh cart per addToCart() invocation. Option B makes CheckoutService prototype but still has the same direct @Autowired Cart field problem — if CheckoutService is injected into another singleton, it itself becomes stuck as one instance. The real fix is ObjectFactory or Provider at the point where per-call freshness is needed.'
    },
    {
      id: 11, level: 'intermediate', category: 'theory',
      question: 'What happens when you call this.saveOrder() from inside the same class where saveOrder() has @Transactional?',
      options: {
        A: 'A nested transaction is automatically created for the self-call',
        B: 'The transaction works normally — Spring handles same-class calls specially',
        C: 'The call bypasses the proxy — @Transactional is silently ignored',
        D: 'Spring throws an exception because self-invocation on @Transactional is illegal'
      },
      answer: 'C',
      explanation: '@Transactional works through a CGLIB proxy. When external code calls your service, it goes through the proxy (which manages the transaction). When you call this.method() inside the class, you call directly on the real object — the proxy is completely bypassed. No transaction starts. No error thrown. Changes are committed even if an exception occurs. The fix: move saveOrder() to a separate @Service class.'
    },
    {
      id: 12, level: 'intermediate', category: 'code',
      question: 'Given this code, which injection point gets StripeService and which gets PayPalService?\n\n```java\n@Service @Primary class StripeService implements PaymentGateway { }\n@Service("paypal") class PayPalService implements PaymentGateway { }\n\n@Service class OrderProcessor {\n    @Autowired\n    private PaymentGateway gatewayA;  // point 1\n\n    @Autowired @Qualifier("paypal")\n    private PaymentGateway gatewayB;  // point 2\n}\n```',
      options: {
        A: 'Point 1: PayPalService, Point 2: StripeService',
        B: 'Point 1: StripeService, Point 2: PayPalService',
        C: 'Both points get StripeService because it is @Primary',
        D: 'Spring throws NoUniqueBeanDefinitionException for both'
      },
      answer: 'B',
      explanation: 'Point 1: no @Qualifier specified → Spring uses @Primary → StripeService. Point 2: @Qualifier("paypal") explicitly names the bean → PayPalService. @Qualifier always overrides @Primary at any injection point where it is used. This is the correct way to have a default implementation while also being able to inject a specific alternative when needed.'
    },
    {
      id: 13, level: 'intermediate', category: 'code',
      question: 'What does @DependsOn guarantee in this code?\n\n```java\n@Service("migrationRunner")\npublic class DatabaseMigration {\n    @PostConstruct\n    public void migrate() { System.out.println("Migrations ran."); }\n}\n\n@Service\n@DependsOn("migrationRunner")\npublic class UserRepo {\n    @PostConstruct\n    public void init() { System.out.println("UserRepo ready."); }\n}\n```',
      options: {
        A: 'UserRepo @Autowires DatabaseMigration and can call methods on it',
        B: '"Migrations ran." always prints before "UserRepo ready."',
        C: 'DatabaseMigration is made a singleton because UserRepo depends on it',
        D: 'UserRepo is destroyed before DatabaseMigration on shutdown'
      },
      answer: 'B',
      explanation: '@DependsOn guarantees initialization ORDER only — "migrationRunner" bean is fully initialized (including its @PostConstruct) before UserRepo starts initializing. So "Migrations ran." is guaranteed to print before "UserRepo ready." No injection happens. UserRepo gets no reference to DatabaseMigration through @DependsOn — for that you would need @Autowired separately.'
    },
    {
      id: 14, level: 'intermediate', category: 'theory',
      question: 'What does BeanPostProcessor do, and what is the most important rule when implementing one?',
      options: {
        A: 'It processes @Bean methods in @Configuration classes; the rule is to only call getBean() inside it',
        B: 'It runs around every bean\'s initialization; you must always return the bean (or replacement) from both methods',
        C: 'It runs once after all beans are created; you must call super.postProcess() to trigger initialization',
        D: 'It post-processes HTTP requests; you must register it in WebMvcConfigurer'
      },
      answer: 'B',
      explanation: 'BeanPostProcessor has two methods: postProcessBeforeInitialization (runs before @PostConstruct) and postProcessAfterInitialization (runs after — this is where AOP proxies are created). Both methods receive the bean and must return it (or a valid replacement). Returning null causes NullPointerException when Spring tries to inject that bean elsewhere. This is the #1 mistake when writing custom BeanPostProcessors.'
    },
    {
      id: 15, level: 'intermediate', category: 'code',
      question: 'What does this BeanPostProcessor do, and is there a bug in it?\n\n```java\n@Component\npublic class LoggingBPP implements BeanPostProcessor {\n    @Override\n    public Object postProcessBeforeInitialization(Object bean, String name) {\n        System.out.println("Initializing: " + name);\n        return bean;\n    }\n\n    @Override\n    public Object postProcessAfterInitialization(Object bean, String name) {\n        System.out.println("Done: " + name);\n        return null; // <-- is this a problem?\n    }\n}\n```',
      options: {
        A: 'It logs bean names. Returning null is fine — Spring ignores null returns.',
        B: 'It logs bean names. Returning null is a bug — Spring throws NullPointerException for every bean.',
        C: 'It only logs the first bean because returning null stops the processor loop.',
        D: 'No bug. BeanPostProcessor methods can return null to indicate no changes.'
      },
      answer: 'B',
      explanation: 'Returning null from postProcessAfterInitialization is a critical bug. Spring uses the returned value as the final bean to store and inject. Returning null means all beans become null in the context. When other beans try to @Autowire them, they get null and throw NullPointerException. Fix: change return null to return bean.'
    },
    {
      id: 16, level: 'intermediate', category: 'theory',
      question: 'Spring Boot 3 changed how it handles circular dependencies compared to Spring Boot 2. What is the change?',
      options: {
        A: 'Spring Boot 3 automatically resolves all circular dependencies using AI',
        B: 'Spring Boot 3 throws an exception by default; Boot 2 silently resolved them',
        C: 'Spring Boot 3 removed support for circular dependencies completely',
        D: 'Spring Boot 3 requires @Circular annotation to declare intended cycles'
      },
      answer: 'B',
      explanation: 'Spring Boot 2 silently resolved circular dependencies via field/setter injection using an internal three-level bean cache. This masked design problems — beans could have null fields during some ordering scenarios. Spring Boot 3 (Framework 6) changed the default to throw BeanCurrentlyInCreationException for any circular dependency. You can restore old behaviour with spring.main.allow-circular-references=true temporarily while you fix the actual design.'
    },
    {
      id: 17, level: 'intermediate', category: 'code',
      question: 'This circular dependency causes startup failure. Which fix is structurally correct?\n\n```java\n@Service class InvoiceService {\n    @Autowired PaymentService paymentService; // needs payment\n}\n@Service class PaymentService {\n    @Autowired InvoiceService invoiceService; // needs invoice — CYCLE!\n}\n```',
      options: {
        A: 'Add @Lazy to one of the @Autowired fields',
        B: 'Extract a shared EventBus bean that both depend on instead of each other',
        C: 'Add spring.main.allow-circular-references=true permanently',
        D: 'Make one of the services @Scope("prototype")'
      },
      answer: 'B',
      explanation: 'Extracting a shared EventBus (or shared logic class) breaks the circular design. InvoiceService depends on EventBus, PaymentService depends on EventBus — neither depends on the other. A publishes events, B listens to events — decoupled. @Lazy (A) hides the problem. allow-circular-references=true (C) keeps the bad design in production. @Scope("prototype") (D) does not fix dependency relationships.'
    },
    {
      id: 18, level: 'intermediate', category: 'theory',
      question: 'Why does @Transactional not work on private methods?',
      options: {
        A: 'Private methods are not allowed in Spring beans',
        B: 'CGLIB proxies can only intercept public methods — private methods are called directly',
        C: '@Transactional requires @Autowired to be present on the same method',
        D: 'Private methods automatically get READ_ONLY transactions instead'
      },
      answer: 'B',
      explanation: '@Transactional works by wrapping your bean in a CGLIB subclass proxy. CGLIB generates a subclass and overrides public methods to add transaction management. Private methods cannot be overridden in a subclass (Java language rule) — they are not accessible from outside the class. So the proxy cannot intercept them. @Transactional on a private method is silently ignored — no transaction, no error.'
    },
    {
      id: 19, level: 'intermediate', category: 'code',
      question: 'What is the key difference between @Lazy on a class vs @Lazy on an @Autowired field?\n\n```java\n// Version A:\n@Service @Lazy\npublic class HeavyService { ... } // @Lazy on the class\n\n// Version B:\n@Service\npublic class OrderService {\n    @Autowired @Lazy\n    private HeavyService heavy; // @Lazy on the field\n}\n```',
      options: {
        A: 'Version A defers HeavyService creation to first use; Version B injects a proxy and defers real creation to first method call',
        B: 'Both versions do exactly the same thing',
        C: 'Version A makes HeavyService prototype; Version B makes it singleton',
        D: 'Version B creates a new HeavyService on every method call (prototype behaviour)'
      },
      answer: 'A',
      explanation: 'Version A (@Lazy on class): HeavyService is not created at startup. On the first getBean() or @Autowired injection that resolves it, Spring creates it and caches it as a singleton. Version B (@Lazy on field): a proxy is injected into OrderService immediately at startup. The real HeavyService bean is only created and resolved when a method is first called on the proxy. This is used to break circular dependencies (the proxy satisfies the injection before the real bean exists).'
    },
    {
      id: 20, level: 'intermediate', category: 'theory',
      question: 'What is SmartInitializingSingleton and when does its method fire?',
      options: {
        A: 'It fires after each individual bean\'s @PostConstruct',
        B: 'It fires once, after ALL singleton beans have finished their complete initialization',
        C: 'It fires before the first HTTP request is received',
        D: 'It fires every time the ApplicationContext is refreshed'
      },
      answer: 'B',
      explanation: 'SmartInitializingSingleton.afterSingletonsInstantiated() fires exactly once, after every singleton bean has been fully created, injected, had its @PostConstruct called, and been wrapped in any BeanPostProcessor proxies. This is the "everything is truly ready" moment. Use it for startup validation that needs to inspect the full application context — like verifying all required beans implement required interfaces or have required annotations.'
    },

    // ── ADVANCED (10) ─────────────────────────────────────────────────────────
    {
      id: 21, level: 'advanced', category: 'theory',
      question: 'In which BeanPostProcessor phase does Spring create @Transactional CGLIB proxies?',
      options: {
        A: 'postProcessBeforeInitialization — before @PostConstruct runs',
        B: 'postProcessAfterInitialization — after all init callbacks complete',
        C: 'During BeanFactoryPostProcessor — before beans are instantiated',
        D: 'During SmartInitializingSingleton — after all singletons are ready'
      },
      answer: 'B',
      explanation: 'AbstractAutoProxyCreator (a BeanPostProcessor) creates CGLIB proxies in postProcessAfterInitialization — after the bean has completed all init callbacks (constructor, injection, @PostConstruct, afterPropertiesSet). The proxy replaces the raw bean in the context. All subsequent @Autowired injections receive the proxy. This is why @Transactional works on @Autowired references but not on this.method() calls — your code has no reference to the proxy inside the real object.'
    },
    {
      id: 22, level: 'advanced', category: 'code',
      question: 'What is the output order of this Spring Boot application?\n\n```java\n@Component class A implements SmartInitializingSingleton {\n    @PostConstruct void pc() { System.out.println("A @PostConstruct"); }\n    public void afterSingletonsInstantiated() { System.out.println("A SmartInit"); }\n}\n@Component class B {\n    @PostConstruct void pc() { System.out.println("B @PostConstruct"); }\n}\n```',
      options: {
        A: 'A SmartInit → A @PostConstruct → B @PostConstruct',
        B: 'A @PostConstruct → B @PostConstruct → A SmartInit',
        C: 'A @PostConstruct → A SmartInit → B @PostConstruct',
        D: 'B @PostConstruct → A @PostConstruct → A SmartInit'
      },
      answer: 'B',
      explanation: 'Each bean\'s @PostConstruct fires during that bean\'s initialization. SmartInitializingSingleton.afterSingletonsInstantiated() fires AFTER all singleton beans have been initialized. So: A @PostConstruct fires when A is initialized → B @PostConstruct fires when B is initialized → A SmartInit fires after both A and B are fully done. The exact @PostConstruct order (A before B or B before A) depends on dependency graph, but SmartInit is always last.'
    },
    {
      id: 23, level: 'advanced', category: 'theory',
      question: 'What is the difference between BeanFactoryPostProcessor and BeanPostProcessor?',
      options: {
        A: 'BeanFactoryPostProcessor modifies BeanDefinition metadata before beans are created; BeanPostProcessor wraps bean instances after creation',
        B: 'BeanFactoryPostProcessor wraps instances; BeanPostProcessor modifies definitions',
        C: 'BeanFactoryPostProcessor runs after @PostConstruct; BeanPostProcessor runs before',
        D: 'Both do the same thing at different times in the startup sequence'
      },
      answer: 'A',
      explanation: 'Key distinction: BeanFactoryPostProcessor runs when NO beans have been created yet — it modifies BeanDefinition objects (metadata: class name, scope, property values, init method names). PropertySourcesPlaceholderConfigurer resolves ${...} here. BeanPostProcessor runs per-bean after construction and injection — it can wrap or replace the actual instance. AOP proxy creation happens here. One modifies blueprints, the other modifies the built objects.'
    },
    {
      id: 24, level: 'advanced', category: 'code',
      question: 'How do you retrieve a FactoryBean itself (not its product) from the ApplicationContext?\n\n```java\n@Component("dbClient")\npublic class DbClientFactory implements FactoryBean<DatabaseClient> {\n    public DatabaseClient getObject() { return new DatabaseClient(); }\n    public Class<?> getObjectType() { return DatabaseClient.class; }\n}\n```',
      options: {
        A: 'ctx.getBean("dbClient") — returns the DbClientFactory',
        B: 'ctx.getBean("&dbClient") — the & prefix returns the FactoryBean itself',
        C: 'ctx.getFactory("dbClient") — dedicated method for FactoryBeans',
        D: 'ctx.getBean("dbClient", FactoryBean.class) — type argument selects the factory'
      },
      answer: 'B',
      explanation: 'ctx.getBean("dbClient") returns the DatabaseClient product (what getObject() returns). To get the FactoryBean itself, prefix the bean name with "&": ctx.getBean("&dbClient") returns DbClientFactory. The "&" is the "dereference operator" for FactoryBeans in Spring — it is a deliberate design choice to make transparent injection of FactoryBean products the default.'
    },
    {
      id: 25, level: 'advanced', category: 'theory',
      question: 'Why can @Transactional not be applied to methods inside a BeanPostProcessor?',
      options: {
        A: 'BeanPostProcessors are final classes and cannot be subclassed by CGLIB',
        B: 'BeanPostProcessors are created before the AOP infrastructure that creates @Transactional proxies exists',
        C: '@Transactional requires a database connection which is not available during bean post-processing',
        D: 'Spring applies @Transactional to all BeanPostProcessor methods by default, making the annotation redundant'
      },
      answer: 'B',
      explanation: 'Spring creates BeanPostProcessors very early — before most of the container infrastructure, including AbstractAutoProxyCreator (the BPP that creates @Transactional proxies). A BPP is therefore never itself proxied. Spring logs a WARN: "Bean X of type BeanPostProcessor is not eligible for getting processed by all BeanPostProcessors." If you need transactional logic in a BPP, move it to a regular @Service and delegate to it from the BPP.'
    },
    {
      id: 26, level: 'advanced', category: 'code',
      question: 'Which approach gives the cleanest call-site code for injecting a prototype Cart into a singleton, with no changes needed at call sites?\n\n```java\n@Component @Scope("prototype") class Cart { public void add(String i) {} }\n```',
      options: {
        A: 'Inject ObjectFactory<Cart> and call cartFactory.getObject().add(item)',
        B: 'Inject Provider<Cart> and call cartProvider.get().add(item)',
        C: 'Annotate Cart with @Scope(value="prototype", proxyMode=ScopedProxyMode.TARGET_CLASS) and inject Cart directly',
        D: 'Store Cart in a ThreadLocal in a singleton'
      },
      answer: 'C',
      explanation: 'ScopedProxyMode.TARGET_CLASS is the most transparent approach. Spring injects a CGLIB proxy into the singleton. Every method call on the proxy (cart.add(item)) transparently creates or retrieves a fresh prototype instance. Call-site code is identical to direct field access — no getObject() or get() needed. Trade-off: Cart cannot be final (CGLIB needs to subclass it), and there is proxy overhead per call.'
    },
    {
      id: 27, level: 'advanced', category: 'theory',
      question: 'In what order do @PostConstruct, InitializingBean.afterPropertiesSet(), and @Bean(initMethod="x") fire?',
      options: {
        A: 'afterPropertiesSet() → @PostConstruct → initMethod',
        B: 'initMethod → afterPropertiesSet() → @PostConstruct',
        C: '@PostConstruct → afterPropertiesSet() → initMethod',
        D: 'All fire simultaneously in parallel'
      },
      answer: 'C',
      explanation: '@PostConstruct is processed by CommonAnnotationBeanPostProcessor in the postProcessBeforeInitialization phase — so it fires first. InitializingBean.afterPropertiesSet() is called directly by the container next. The custom initMethod from @Bean(initMethod="...") fires last. In practice: use only @PostConstruct for new code. Use initMethod only for third-party classes you cannot annotate. Never mix all three in one bean.'
    },
    {
      id: 28, level: 'advanced', category: 'code',
      question: 'What happens when this code runs?\n\n```java\n@Service\npublic class UserService {\n    private final AuditService audit;\n    public UserService(AuditService audit) { this.audit = audit; }\n}\n@Service\npublic class AuditService {\n    private final UserService users;\n    public AuditService(UserService users) { this.users = users; }\n}\n```',
      options: {
        A: 'Spring resolves the cycle using a three-level cache — app starts fine',
        B: 'Spring throws BeanCurrentlyInCreationException at startup',
        C: 'Spring creates both beans with null fields and fills them in a second pass',
        D: 'Spring randomly picks one bean to create first and skips the other\'s dependency'
      },
      answer: 'B',
      explanation: 'Constructor injection + circular dependency = immediate startup failure. Spring tries to create UserService, finds it needs AuditService, tries to create AuditService, finds it needs UserService — which is already being created (in the "currently in creation" set). Spring throws BeanCurrentlyInCreationException. This is the CORRECT and SAFE behavior — fail fast at startup, not during production traffic. The three-level cache only helps with field/setter injection cycles (and only in Spring Boot 2).'
    },
    {
      id: 29, level: 'advanced', category: 'theory',
      question: 'ApplicationContextAware and @Autowired ApplicationContext are both available in Spring 4.3+. Which should you prefer for application code?',
      options: {
        A: 'ApplicationContextAware — it is the official Spring interface and must always be used in serious projects',
        B: '@Autowired ApplicationContext — simpler, less code, equally supported, preferred for application code',
        C: 'Neither — any access to ApplicationContext from a bean is always an anti-pattern',
        D: 'ApplicationContextAware in @Service beans; @Autowired in @Component beans'
      },
      answer: 'B',
      explanation: 'Both work identically. Since Spring 4.3, @Autowired ApplicationContext is fully supported and is the cleaner approach — no interface to implement, no callback method, just a field injection like any other bean. ApplicationContextAware is the older callback style from the pre-annotation era. Both are valid, but for modern Spring Boot application code, @Autowired is the idiomatic choice. Using ApplicationContext at all (regardless of injection style) should be minimal in business code — service-locator patterns reduce testability.'
    },
    {
      id: 30, level: 'advanced', category: 'code',
      question: 'This @Transactional is not working. Identify ALL the problems.\n\n```java\n@Service\npublic class ReportService {\n    public void generateMonthly() {\n        this.saveReport(new Report()); // problem 1?\n    }\n\n    @Transactional\n    private void saveReport(Report r) { // problem 2?\n        reportRepo.save(r);\n    }\n}\n```',
      options: {
        A: 'Only problem 1: self-invocation bypasses the proxy',
        B: 'Only problem 2: @Transactional on private methods is ignored',
        C: 'Both problems: self-invocation bypasses the proxy AND @Transactional is ignored on private methods',
        D: 'No problems — both work correctly with Spring\'s internal proxy handling'
      },
      answer: 'C',
      explanation: 'Two problems stack: (1) this.saveReport() is a self-invocation — it calls the real object directly, bypassing the CGLIB proxy. Even if the method were public, no transaction would start. (2) saveReport() is private — CGLIB cannot override private methods (Java rule), so @Transactional is silently ignored even if it were called through a proxy. Fix: make saveReport() public AND move it to a separate @Service so all callers go through a proxy.'
    }
  ]
};

// ─── REPLACE SECTIONS ─────────────────────────────────────────────────────────
day.sections = day.sections.map(s => {
  if (s.type === 'pitfalls') return pitfalls;
  if (s.type === 'exercise') return exercise;
  if (s.type === 'interview') return interview;
  if (s.type === 'mcq') return mcq;
  return s;
});

writeFileSync(FILE, JSON.stringify(day, null, 2), 'utf-8');

const iv = day.sections.find(s => s.type === 'interview');
const mq = day.sections.find(s => s.type === 'mcq');
const pt = day.sections.find(s => s.type === 'pitfalls');
console.log('Written:', FILE);
console.log('Sections:', day.sections.map(s => s.type));
console.log('Pitfalls:', pt.items.length);
console.log('Conceptual Q&As:', iv.conceptual.length);
console.log('CodeBased Q&As:', iv.codeBased.length);
console.log('SeniorScenario:', iv.seniorScenario.length);
console.log('WrongAnswers:', iv.wrongAnswers.length);
console.log('MCQ total:', mq.questions.length);
console.log('MCQ by level:', mq.questions.reduce((a,q) => { a[q.level]=(a[q.level]||0)+1; return a; }, {}));
console.log('MCQ by category:', mq.questions.reduce((a,q) => { a[q.category]=(a[q.category]||0)+1; return a; }, {}));
