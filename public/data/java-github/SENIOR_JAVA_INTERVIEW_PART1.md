# Senior Java Developer Interview Questions - Part 1
## OOPS & Design Principles | Java Collections Deep Internals

> **Senior Technical Architect's Guide for Interviewing 8-18 Years Experience**
> *Deep Technical Scenarios for Product-Based Companies, Fintech, High-Throughput Platforms*

---

## Table of Contents

1. [OOPS & Design Principles](#oops--design-principles)
2. [Java Collections - Deep Internals](#java-collections---deep-internals)

---

## OOPS & Design Principles

### Q1: Production System Violates Liskov Substitution Principle - Payment Processing Failure

**Scenario:**
A fintech payment processing system has a base `PaymentProcessor` class and two implementations: `CreditCardProcessor` and `CryptocurrencyProcessor`. The system works fine for credit cards, but when cryptocurrency payments are processed, transactions fail silently. The error logs show "Invalid payment method" but the actual exception is swallowed. The code review reveals that `CryptocurrencyProcessor` throws an `UnsupportedOperationException` in methods that credit card processors handle normally.

**Question:**
You're debugging this production issue. Explain the root cause, why it violates LSP, and how you would refactor this to maintain extensibility while ensuring type safety.

**Step-by-Step Answer:**

#### Root Cause Analysis

**The Violation:**
```java
// ❌ BAD: LSP Violation
public abstract class PaymentProcessor {
    public abstract PaymentResult process(PaymentRequest request);
    public abstract void validate(PaymentRequest request);
    public abstract void refund(String transactionId);
}

public class CreditCardProcessor extends PaymentProcessor {
    @Override
    public PaymentResult process(PaymentRequest request) {
        validate(request);
        // Process credit card
        return new PaymentResult(true, "Success");
    }
    
    @Override
    public void validate(PaymentRequest request) {
        // Validate credit card details
        if (request.getCardNumber() == null) {
            throw new ValidationException("Card number required");
        }
    }
    
    @Override
    public void refund(String transactionId) {
        // Refund via credit card gateway
        refundGateway.process(transactionId);
    }
}

public class CryptocurrencyProcessor extends PaymentProcessor {
    @Override
    public PaymentResult process(PaymentRequest request) {
        validate(request);
        // Process cryptocurrency
        return new PaymentResult(true, "Success");
    }
    
    @Override
    public void validate(PaymentRequest request) {
        // Cryptocurrency doesn't need card validation
        // But forced to implement
    }
    
    @Override
    public void refund(String transactionId) {
        // Cryptocurrency doesn't support refunds!
        throw new UnsupportedOperationException("Cryptocurrency refunds not supported");
    }
}

// Client code - violates LSP
public class PaymentService {
    public void processRefund(PaymentProcessor processor, String transactionId) {
        // This will fail for CryptocurrencyProcessor!
        processor.refund(transactionId); // Breaks LSP - can't substitute
    }
}
```

**Why This Violates LSP:**
- LSP states: Objects of a superclass should be replaceable with objects of its subclasses without breaking the application
- `CryptocurrencyProcessor` cannot be used wherever `PaymentProcessor` is expected
- Client code must know the concrete type, breaking polymorphism
- The contract is violated: refund() should work for all PaymentProcessors

#### Deep Technical Explanation

**LSP Violation Impact:**
1. **Type Safety Loss**: Compile-time checks don't catch runtime failures
2. **Polymorphism Broken**: Can't use `PaymentProcessor` interface safely
3. **Testing Complexity**: Must test all combinations
4. **Maintenance Nightmare**: Adding new processors requires changing client code

#### Refactored Solution

**Option 1: Interface Segregation (Recommended)**
```java
// ✅ GOOD: Separate interfaces
public interface PaymentProcessor {
    PaymentResult process(PaymentRequest request);
    void validate(PaymentRequest request);
}

public interface RefundablePaymentProcessor extends PaymentProcessor {
    void refund(String transactionId);
}

public interface RecurringPaymentProcessor extends PaymentProcessor {
    void setupRecurringPayment(RecurringPaymentRequest request);
}

// Implementations
public class CreditCardProcessor implements RefundablePaymentProcessor {
    @Override
    public PaymentResult process(PaymentRequest request) {
        validate(request);
        return processCreditCard(request);
    }
    
    @Override
    public void refund(String transactionId) {
        refundGateway.process(transactionId);
    }
}

public class CryptocurrencyProcessor implements PaymentProcessor {
    @Override
    public PaymentResult process(PaymentRequest request) {
        validate(request);
        return processCryptocurrency(request);
    }
    
    // No refund method - not in contract
}

// Client code - type-safe
public class PaymentService {
    public void processRefund(RefundablePaymentProcessor processor, String transactionId) {
        // Type system ensures only refundable processors accepted
        processor.refund(transactionId);
    }
    
    public void processPayment(PaymentProcessor processor, PaymentRequest request) {
        // Works for all payment types
        processor.process(request);
    }
}
```

**Option 2: Optional Operations with Result Type**
```java
// ✅ GOOD: Explicit optional operations
public abstract class PaymentProcessor {
    public abstract PaymentResult process(PaymentRequest request);
    public abstract void validate(PaymentRequest request);
    
    // Optional operation - returns Optional
    public Optional<RefundResult> refund(String transactionId) {
        return Optional.empty(); // Default: not supported
    }
    
    // Check capability
    public boolean supportsRefund() {
        return false;
    }
}

public class CreditCardProcessor extends PaymentProcessor {
    @Override
    public Optional<RefundResult> refund(String transactionId) {
        return Optional.of(refundGateway.process(transactionId));
    }
    
    @Override
    public boolean supportsRefund() {
        return true;
    }
}

public class CryptocurrencyProcessor extends PaymentProcessor {
    // refund() returns Optional.empty() - contract satisfied
    // No exception thrown
}

// Client code
public class PaymentService {
    public void processRefund(PaymentProcessor processor, String transactionId) {
        if (processor.supportsRefund()) {
            processor.refund(transactionId)
                .ifPresentOrElse(
                    result -> log.info("Refund successful: {}", result),
                    () -> log.warn("Refund not supported")
                );
        }
    }
}
```

**Option 3: Strategy Pattern with Capabilities**
```java
// ✅ GOOD: Capability-based design
public interface PaymentCapability {
    // Marker interface for capabilities
}

public interface RefundCapability extends PaymentCapability {
    RefundResult refund(String transactionId);
}

public interface RecurringCapability extends PaymentCapability {
    void setupRecurring(RecurringPaymentRequest request);
}

public class PaymentProcessor {
    private final Set<PaymentCapability> capabilities;
    
    public PaymentProcessor(Set<PaymentCapability> capabilities) {
        this.capabilities = capabilities;
    }
    
    public <T extends PaymentCapability> Optional<T> getCapability(Class<T> type) {
        return capabilities.stream()
            .filter(type::isInstance)
            .map(type::cast)
            .findFirst();
    }
}

// Usage
PaymentProcessor creditCard = new PaymentProcessor(Set.of(
    new CreditCardRefundCapability(),
    new CreditCardRecurringCapability()
));

creditCard.getCapability(RefundCapability.class)
    .ifPresent(refund -> refund.refund(transactionId));
```

#### Trade-offs Analysis

| Approach | Pros | Cons |
|----------|------|------|
| Interface Segregation | Type-safe, clear contracts | More interfaces to manage |
| Optional Operations | Single hierarchy, flexible | Runtime checks needed |
| Capability Pattern | Most flexible, composable | More complex, less type-safe |

**Best Practice:**
- Use Interface Segregation for clear, compile-time safety
- Use Optional for truly optional operations
- Use Capabilities for complex, composable systems

#### Performance Considerations

- **Interface Segregation**: No performance impact, compile-time only
- **Optional Operations**: Minimal overhead (Optional allocation)
- **Capability Pattern**: Slight overhead for capability lookup

#### Follow-Up Questions

1. **Q: How would you handle this if you need to add a new payment method that supports refunds but not recurring payments?**
   - Use Interface Segregation with multiple interfaces
   - Implement only required interfaces
   - Client code checks for specific interfaces

2. **Q: What if the business requirement changes and cryptocurrency now supports refunds?**
   - Add `RefundablePaymentProcessor` to `CryptocurrencyProcessor`
   - No breaking changes to existing code
   - LSP maintained throughout

3. **Q: How do you test LSP compliance?**
   - Property-based testing
   - Contract testing
   - Substitution tests: replace superclass with subclass in all contexts

4. **Q: Real-world example: Java's `ArrayList` and `LinkedList` both implement `List`. Does this violate LSP?**
   - No, both honor the `List` contract
   - Performance characteristics differ (acceptable)
   - Behavioral differences (e.g., iteration order) are documented

---

### Q2: Breaking Cyclic Dependencies in Legacy Monolith - Order Processing System

**Scenario:**
A legacy e-commerce monolith has a circular dependency: `OrderService` depends on `InventoryService`, which depends on `ShippingService`, which depends back on `OrderService`. The application fails to start with `BeanCurrentlyInCreationException` in Spring. The team tried using `@Lazy` but it only masks the problem and causes `NullPointerException` at runtime when services are accessed before initialization.

**Question:**
Explain the root cause, why `@Lazy` is a code smell here, and provide a production-ready refactoring strategy that eliminates the cycle while maintaining functionality.

**Step-by-Step Answer:**

#### Root Cause Analysis

**The Cycle:**
```java
// ❌ BAD: Cyclic Dependency
@Service
public class OrderService {
    @Autowired
    private InventoryService inventoryService; // Depends on
    
    public void createOrder(Order order) {
        inventoryService.reserveItems(order.getItems());
        // Process order
    }
}

@Service
public class InventoryService {
    @Autowired
    private ShippingService shippingService; // Depends on
    
    public void reserveItems(List<Item> items) {
        // Reserve items
        shippingService.calculateShipping(items); // Needs shipping
    }
}

@Service
public class ShippingService {
    @Autowired
    private OrderService orderService; // Depends back on OrderService!
    
    public ShippingCost calculateShipping(List<Item> items) {
        Order order = orderService.getCurrentOrder(); // Needs order context
        return calculateCost(order, items);
    }
}
```

**Why This Happens:**
- Tight coupling between domain concepts
- Services have too many responsibilities
- Missing abstraction layers
- Business logic scattered across services

#### Why @Lazy is a Code Smell

```java
// ❌ BAD: @Lazy masks the problem
@Service
public class OrderService {
    @Autowired
    @Lazy
    private InventoryService inventoryService; // Delays injection
    
    public void createOrder(Order order) {
        // inventoryService might be null if called during initialization!
        inventoryService.reserveItems(order.getItems()); // NPE risk
    }
}
```

**Problems with @Lazy:**
1. **Runtime Failures**: NPE if accessed during initialization
2. **Hidden Dependencies**: Makes dependencies unclear
3. **Testing Complexity**: Hard to test initialization order
4. **Performance**: Proxy overhead, delayed initialization
5. **Maintenance**: Future developers don't see the cycle

#### Refactored Solutions

**Solution 1: Extract Shared Domain Model (Recommended)**
```java
// ✅ GOOD: Extract domain events
public class OrderCreatedEvent {
    private final Order order;
    private final List<Item> items;
    // Getters
}

public class ItemsReservedEvent {
    private final String orderId;
    private final List<Item> items;
    // Getters
}

// OrderService - publishes events
@Service
public class OrderService {
    private final ApplicationEventPublisher eventPublisher;
    private final OrderRepository orderRepository;
    
    public void createOrder(Order order) {
        Order savedOrder = orderRepository.save(order);
        // Publish event instead of direct call
        eventPublisher.publishEvent(new OrderCreatedEvent(savedOrder));
    }
}

// InventoryService - listens to events
@Service
public class InventoryService {
    private final ApplicationEventPublisher eventPublisher;
    
    @EventListener
    @Async
    public void handleOrderCreated(OrderCreatedEvent event) {
        List<Item> reservedItems = reserveItems(event.getItems());
        // Publish next event
        eventPublisher.publishEvent(new ItemsReservedEvent(
            event.getOrder().getId(), 
            reservedItems
        ));
    }
    
    private List<Item> reserveItems(List<Item> items) {
        // Reserve logic - no dependency on ShippingService
        return items.stream()
            .filter(this::hasStock)
            .collect(Collectors.toList());
    }
}

// ShippingService - listens to events
@Service
public class ShippingService {
    @EventListener
    @Async
    public void handleItemsReserved(ItemsReservedEvent event) {
        // Can query OrderService if needed, but no direct dependency
        Order order = orderRepository.findById(event.getOrderId())
            .orElseThrow();
        ShippingCost cost = calculateShipping(order, event.getItems());
        // Publish shipping calculated event
    }
}
```

**Solution 2: Introduce Service Layer**
```java
// ✅ GOOD: Facade/Orchestrator pattern
@Service
public class OrderOrchestrator {
    private final OrderService orderService;
    private final InventoryService inventoryService;
    private final ShippingService shippingService;
    
    // Orchestrator coordinates, services don't know about each other
    @Transactional
    public OrderProcessingResult processOrder(OrderRequest request) {
        // Step 1: Create order
        Order order = orderService.createOrder(request);
        
        // Step 2: Reserve inventory (no shipping dependency)
        InventoryReservation reservation = inventoryService.reserve(
            order.getItems()
        );
        
        // Step 3: Calculate shipping (has order and items, no cycle)
        ShippingCost shippingCost = shippingService.calculateShipping(
            order, 
            reservation.getReservedItems()
        );
        
        // Step 4: Complete order
        return orderService.completeOrder(order, reservation, shippingCost);
    }
}

// Services become focused, no cycles
@Service
public class OrderService {
    private final OrderRepository orderRepository;
    // No dependency on InventoryService or ShippingService
}

@Service
public class InventoryService {
    // No dependency on ShippingService or OrderService
    public InventoryReservation reserve(List<Item> items) {
        // Pure inventory logic
    }
}

@Service
public class ShippingService {
    // No dependency on OrderService
    public ShippingCost calculateShipping(Order order, List<Item> items) {
        // Pure shipping calculation
    }
}
```

**Solution 3: Dependency Inversion with Interfaces**
```java
// ✅ GOOD: Depend on abstractions
public interface ShippingCalculator {
    ShippingCost calculate(OrderContext context, List<Item> items);
}

public interface OrderContextProvider {
    OrderContext getContext(String orderId);
}

@Service
public class InventoryService {
    private final ShippingCalculator shippingCalculator;
    private final OrderContextProvider orderContextProvider;
    
    public void reserveItems(String orderId, List<Item> items) {
        // Reserve items
        OrderContext context = orderContextProvider.getContext(orderId);
        shippingCalculator.calculate(context, items);
    }
}

@Service
public class ShippingService implements ShippingCalculator {
    // Implements interface, no direct dependency on OrderService
    @Override
    public ShippingCost calculate(OrderContext context, List<Item> items) {
        // Calculate using context, not OrderService
    }
}

@Service
public class OrderService implements OrderContextProvider {
    @Override
    public OrderContext getContext(String orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow();
        return new OrderContext(order);
    }
}
```

#### Trade-offs Analysis

| Solution | Pros | Cons | When to Use |
|----------|------|------|-------------|
| Event-Driven | Loose coupling, scalable | Async complexity, eventual consistency | High-throughput, microservices |
| Orchestrator | Simple, synchronous | Single point of coordination | Monoliths, simple flows |
| Dependency Inversion | Flexible, testable | More interfaces | Complex dependencies |

#### Performance Considerations

- **Event-Driven**: Async processing, better scalability, but eventual consistency
- **Orchestrator**: Synchronous, simpler, but potential bottleneck
- **Dependency Inversion**: No performance impact, better testability

#### Follow-Up Questions

1. **Q: How do you handle transaction boundaries in event-driven approach?**
   - Use `@TransactionalEventListener` with phases
   - Saga pattern for distributed transactions
   - Compensating actions for rollback

2. **Q: What if InventoryService needs order information that ShippingService calculated?**
   - Pass data through events
   - Use shared data store (database)
   - Query when needed (break cycle with repository)

3. **Q: How do you test the orchestrator without creating cycles in tests?**
   - Mock dependencies
   - Use test doubles
   - Integration tests with Spring Test

---

### Q3: Strategy vs Factory vs Builder - Real-World Payment Gateway Selection

**Scenario:**
A payment processing system needs to support multiple payment gateways (Stripe, PayPal, Square). The current implementation uses a large if-else chain that's becoming unmaintainable. New gateways are added frequently, and each gateway has different configuration requirements, initialization steps, and capabilities. The code violates Open/Closed Principle.

**Question:**
Design a solution using appropriate design patterns. Explain when to use Strategy, Factory, and Builder, and how they work together. Show how this handles gateway-specific configuration, initialization, and the addition of new gateways without modifying existing code.

**Step-by-Step Answer:**

#### Current Problem

```java
// ❌ BAD: If-else chain, violates OCP
public class PaymentService {
    public PaymentResult processPayment(PaymentRequest request) {
        PaymentGateway gateway;
        
        if (request.getGatewayType().equals("STRIPE")) {
            gateway = new StripeGateway();
            gateway.configure(stripeConfig);
        } else if (request.getGatewayType().equals("PAYPAL")) {
            gateway = new PayPalGateway();
            gateway.configure(paypalConfig);
        } else if (request.getGatewayType().equals("SQUARE")) {
            gateway = new SquareGateway();
            gateway.configure(squareConfig);
        } else {
            throw new UnsupportedGatewayException();
        }
        
        return gateway.process(request);
    }
}
```

#### Pattern Selection Strategy

**When to Use Each Pattern:**

1. **Strategy Pattern**: When you have multiple algorithms/interfaces that are interchangeable
2. **Factory Pattern**: When object creation is complex or needs to be abstracted
3. **Builder Pattern**: When object construction has many optional parameters

**In This Scenario:**
- **Strategy**: Different payment processing algorithms
- **Factory**: Creating the right gateway instance
- **Builder**: Complex gateway configuration

#### Complete Solution

```java
// ✅ GOOD: Strategy Pattern - Payment processing algorithm
public interface PaymentGateway {
    PaymentResult processPayment(PaymentRequest request);
    PaymentResult refund(String transactionId);
    boolean supports(PaymentMethod method);
    GatewayCapabilities getCapabilities();
}

// Strategy implementations
@Component
public class StripeGateway implements PaymentGateway {
    private final StripeConfig config;
    
    public StripeGateway(StripeConfig config) {
        this.config = config;
    }
    
    @Override
    public PaymentResult processPayment(PaymentRequest request) {
        // Stripe-specific processing
        return stripeClient.charge(request);
    }
    
    @Override
    public PaymentResult refund(String transactionId) {
        return stripeClient.refund(transactionId);
    }
    
    @Override
    public boolean supports(PaymentMethod method) {
        return method == PaymentMethod.CREDIT_CARD || 
               method == PaymentMethod.DEBIT_CARD;
    }
    
    @Override
    public GatewayCapabilities getCapabilities() {
        return GatewayCapabilities.builder()
            .supportsRefund(true)
            .supportsRecurring(true)
            .supportsPartialRefund(true)
            .build();
    }
}

@Component
public class PayPalGateway implements PaymentGateway {
    // Similar implementation
}

// ✅ GOOD: Factory Pattern - Gateway creation
public interface PaymentGatewayFactory {
    PaymentGateway createGateway(GatewayType type);
    PaymentGateway createGateway(GatewayType type, GatewayConfig config);
}

@Component
public class PaymentGatewayFactoryImpl implements PaymentGatewayFactory {
    private final Map<GatewayType, Supplier<PaymentGateway>> gatewaySuppliers;
    private final GatewayConfigProvider configProvider;
    
    public PaymentGatewayFactoryImpl(
            List<PaymentGateway> gateways,
            GatewayConfigProvider configProvider) {
        this.configProvider = configProvider;
        this.gatewaySuppliers = gateways.stream()
            .collect(Collectors.toMap(
                this::getGatewayType,
                gateway -> () -> gateway
            ));
    }
    
    @Override
    public PaymentGateway createGateway(GatewayType type) {
        GatewayConfig config = configProvider.getConfig(type);
        return createGateway(type, config);
    }
    
    @Override
    public PaymentGateway createGateway(GatewayType type, GatewayConfig config) {
        Supplier<PaymentGateway> supplier = gatewaySuppliers.get(type);
        if (supplier == null) {
            throw new UnsupportedGatewayException("Gateway not found: " + type);
        }
        
        PaymentGateway gateway = supplier.get();
        gateway.configure(config); // Configure using builder
        return gateway;
    }
    
    private GatewayType getGatewayType(PaymentGateway gateway) {
        // Determine type from gateway instance
        if (gateway instanceof StripeGateway) return GatewayType.STRIPE;
        if (gateway instanceof PayPalGateway) return GatewayType.PAYPAL;
        // ...
        throw new IllegalArgumentException();
    }
}

// ✅ GOOD: Builder Pattern - Complex configuration
public class GatewayConfig {
    private final String apiKey;
    private final String apiSecret;
    private final String endpoint;
    private final int timeout;
    private final boolean sandbox;
    private final RetryConfig retryConfig;
    private final Map<String, String> customParams;
    
    private GatewayConfig(Builder builder) {
        this.apiKey = builder.apiKey;
        this.apiSecret = builder.apiSecret;
        this.endpoint = builder.endpoint;
        this.timeout = builder.timeout;
        this.sandbox = builder.sandbox;
        this.retryConfig = builder.retryConfig;
        this.customParams = builder.customParams;
    }
    
    public static Builder builder() {
        return new Builder();
    }
    
    public static class Builder {
        private String apiKey;
        private String apiSecret;
        private String endpoint;
        private int timeout = 30000;
        private boolean sandbox = false;
        private RetryConfig retryConfig = RetryConfig.defaultConfig();
        private Map<String, String> customParams = new HashMap<>();
        
        public Builder apiKey(String apiKey) {
            this.apiKey = apiKey;
            return this;
        }
        
        public Builder apiSecret(String apiSecret) {
            this.apiSecret = apiSecret;
            return this;
        }
        
        public Builder endpoint(String endpoint) {
            this.endpoint = endpoint;
            return this;
        }
        
        public Builder timeout(int timeout) {
            this.timeout = timeout;
            return this;
        }
        
        public Builder sandbox(boolean sandbox) {
            this.sandbox = sandbox;
            return this;
        }
        
        public Builder retryConfig(RetryConfig retryConfig) {
            this.retryConfig = retryConfig;
            return this;
        }
        
        public Builder customParam(String key, String value) {
            this.customParams.put(key, value);
            return this;
        }
        
        public GatewayConfig build() {
            validate();
            return new GatewayConfig(this);
        }
        
        private void validate() {
            if (apiKey == null || apiSecret == null) {
                throw new IllegalArgumentException("API credentials required");
            }
        }
    }
}

// ✅ GOOD: Service using all patterns
@Service
public class PaymentService {
    private final PaymentGatewayFactory gatewayFactory;
    private final PaymentGatewaySelector gatewaySelector;
    
    public PaymentResult processPayment(PaymentRequest request) {
        // Factory creates gateway
        PaymentGateway gateway = gatewayFactory.createGateway(
            request.getGatewayType()
        );
        
        // Strategy processes payment
        if (!gateway.supports(request.getPaymentMethod())) {
            throw new UnsupportedPaymentMethodException();
        }
        
        return gateway.processPayment(request);
    }
}

// ✅ GOOD: Adding new gateway - no code changes to existing classes
@Component
public class SquareGateway implements PaymentGateway {
    // New implementation
    // Automatically discovered by factory
}
```

#### Pattern Interaction

```
Client Request
    ↓
PaymentService (Orchestrator)
    ↓
PaymentGatewayFactory (Factory Pattern)
    ├─→ Creates GatewayConfig (Builder Pattern)
    └─→ Returns PaymentGateway
         ↓
    PaymentGateway.processPayment() (Strategy Pattern)
```

#### Trade-offs Analysis

| Pattern | Responsibility | Flexibility |
|---------|---------------|-------------|
| Strategy | Algorithm selection | High - easy to add new algorithms |
| Factory | Object creation | High - abstracts creation complexity |
| Builder | Complex construction | High - handles many parameters |

#### Follow-Up Questions

1. **Q: What if a gateway needs different initialization based on environment (dev/staging/prod)?**
   - Use Factory with environment-aware configuration
   - Builder with environment-specific defaults
   - Configuration profiles in Spring

2. **Q: How do you handle gateway-specific features that not all gateways support?**
   - Use capability interface pattern
   - Gateway capabilities exposed via `getCapabilities()`
   - Client checks capabilities before use

3. **Q: What if gateway creation is expensive? Should you cache instances?**
   - Use Singleton or cached instances in Factory
   - Consider gateway connection pooling
   - Lazy initialization for rarely-used gateways

---

## Java Collections - Deep Internals

### Q4: HashMap Collision Handling - Performance Degradation in Production

**Scenario:**
A high-throughput order processing system uses `HashMap<String, Order>` to cache orders by order ID. After deploying to production, the system experiences severe performance degradation. CPU usage spikes, and response times increase from 50ms to 5000ms. Analysis shows that all order IDs hash to the same bucket. Investigation reveals that order IDs follow a pattern like "ORDER-2024-001", "ORDER-2024-002", etc., and the custom hashCode implementation is flawed.

**Question:**
Explain how HashMap handles collisions in Java 8+, why this specific case causes O(n) performance, the difference between Java 7 and Java 8+ collision handling, and how to fix this production issue.

**Step-by-Step Answer:**

#### Root Cause Analysis

**The Problem:**
```java
// ❌ BAD: Flawed hashCode
public class Order {
    private String orderId; // "ORDER-2024-001"
    
    @Override
    public int hashCode() {
        // Only uses year part - all orders hash to same bucket!
        return orderId.split("-")[1].hashCode(); // Returns same for all 2024 orders
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Order order = (Order) o;
        return Objects.equals(orderId, order.orderId);
    }
}

// Usage
Map<String, Order> orderCache = new HashMap<>();
// All orders hash to bucket 0
orderCache.put("ORDER-2024-001", order1); // Bucket 0
orderCache.put("ORDER-2024-002", order2); // Bucket 0 - collision!
orderCache.put("ORDER-2024-003", order3); // Bucket 0 - collision!
// ... thousands of collisions
```

#### HashMap Internal Structure (Java 8+)

**HashMap Structure:**
```
HashMap
├─ Node<K,V>[] table (array of buckets)
│   ├─ Bucket 0: [Node] -> [Node] -> [Node] (LinkedList/Tree)
│   ├─ Bucket 1: [Node]
│   ├─ Bucket 2: [Node]
│   └─ ...
├─ int threshold (resize threshold)
├─ float loadFactor (default 0.75)
└─ int size (number of key-value pairs)
```

**Node Structure:**
```java
static class Node<K,V> implements Map.Entry<K,V> {
    final int hash;      // Cached hash code
    final K key;
    V value;
    Node<K,V> next;      // Next node in collision chain
}
```

#### Collision Handling: Java 7 vs Java 8+

**Java 7: Always LinkedList**
```java
// Java 7: Collision → LinkedList (always O(n) worst case)
Bucket 0: [Node1] -> [Node2] -> [Node3] -> [Node4] -> ... -> [Node1000]
          O(1)       O(2)       O(3)       O(4)       ...    O(1000)
```

**Java 8+: LinkedList → Tree Conversion**
```java
// Java 8+: Collision → LinkedList, converts to Tree if threshold exceeded
// Threshold: TREEIFY_THRESHOLD = 8, UNTREEIFY_THRESHOLD = 6

// Before treeification (≤8 nodes)
Bucket 0: [Node1] -> [Node2] -> ... -> [Node8]  // LinkedList, O(n)

// After treeification (>8 nodes)
Bucket 0: TreeNode (Red-Black Tree)  // O(log n)
         /        \
    [Node1-4]   [Node5-8]
```

**Tree Conversion Conditions:**
```java
static final int TREEIFY_THRESHOLD = 8;
static final int MIN_TREEIFY_CAPACITY = 64;

// Treeify only if:
// 1. Bucket has > TREEIFY_THRESHOLD nodes
// 2. HashMap capacity >= MIN_TREEIFY_CAPACITY
```

#### Why Performance Degrades

**With Collisions:**
```java
// All keys hash to bucket 0
map.get("ORDER-2024-500");

// Java 7: O(n) - linear search through 500 nodes
// Java 8+: 
//   - If ≤8 nodes: O(n) - still LinkedList
//   - If >8 nodes: O(log n) - Tree, but still slower than O(1)
//   - If >64 nodes: O(log n) - Tree, better but not ideal
```

**Performance Impact:**
- **Expected**: O(1) average, O(1) best case
- **With collisions**: O(n) worst case (Java 7), O(log n) with tree (Java 8+)
- **In production**: 1000 orders in one bucket = 1000x slower lookups

#### Deep Technical: Hash Function & Bucket Selection

**Hash Function:**
```java
// HashMap.hash() - final hash used for bucket selection
static final int hash(Object key) {
    int h;
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}

// Why XOR with right-shifted value?
// - Distributes higher bits into lower bits
// - Reduces collisions when lower bits are similar
```

**Bucket Selection:**
```java
// Bucket index calculation
int index = (table.length - 1) & hash(key);

// Example:
// table.length = 16 (capacity)
// hash("ORDER-2024-001") = 12345
// index = (16 - 1) & 12345 = 15 & 12345 = 9
```

**Problem in Scenario:**
```java
// All order IDs hash to same bucket
hash("ORDER-2024-001") → bucket 0
hash("ORDER-2024-002") → bucket 0  // Same bucket!
hash("ORDER-2024-003") → bucket 0  // Same bucket!
```

#### Fix: Proper hashCode Implementation

**Solution 1: Use All Parts of Order ID**
```java
// ✅ GOOD: Use entire order ID
@Override
public int hashCode() {
    return Objects.hash(orderId); // Uses entire string
}

// Or if orderId is the key directly:
Map<String, Order> cache = new HashMap<>();
// String.hashCode() is well-distributed
```

**Solution 2: Custom Hash Function for Order ID Pattern**
```java
// ✅ GOOD: Distribute based on all parts
@Override
public int hashCode() {
    String[] parts = orderId.split("-");
    // Use all parts: ORDER, year, number
    return Objects.hash(parts[0], parts[1], parts[2]);
}

// Better distribution:
// "ORDER-2024-001" → hash(ORDER, 2024, 001)
// "ORDER-2024-002" → hash(ORDER, 2024, 002) // Different hash
```

**Solution 3: Use Order ID as Key Directly**
```java
// ✅ BEST: Use String as key (String.hashCode() is well-designed)
Map<String, Order> orderCache = new HashMap<>();

// String.hashCode() implementation (well-distributed):
// s[0]*31^(n-1) + s[1]*31^(n-2) + ... + s[n-1]
```

#### Tree Structure Deep Dive

**Red-Black Tree in HashMap:**
```java
static final class TreeNode<K,V> extends LinkedHashMap.Entry<K,V> {
    TreeNode<K,V> parent;
    TreeNode<K,V> left;
    TreeNode<K,V> right;
    TreeNode<K,V> prev;
    boolean red;
    
    // Tree operations
    TreeNode<K,V> find(int h, Object k, Class<?> kc);
    TreeNode<K,V> putTreeVal(HashMap<K,V> map, Node<K,V>[] tab, ...);
}
```

**Tree Conversion Process:**
1. **Check threshold**: If bucket size > 8
2. **Check capacity**: If map capacity >= 64
3. **Convert**: Replace LinkedList with Red-Black Tree
4. **Maintain order**: Tree maintains insertion order for iteration

**Why Red-Black Tree?**
- Self-balancing: O(log n) worst case
- Better than AVL for frequent insertions
- Maintains order for iteration

#### Performance Comparison

| Scenario | Java 7 | Java 8+ (LinkedList) | Java 8+ (Tree) |
|----------|--------|---------------------|----------------|
| No collisions | O(1) | O(1) | O(1) |
| 8 collisions | O(8) | O(8) | O(8) |
| 64 collisions | O(64) | O(64) | O(log 64) = O(6) |
| 1000 collisions | O(1000) | O(1000) | O(log 1000) = O(10) |

#### Production Fix Strategy

**Immediate Fix:**
```java
// 1. Fix hashCode
@Override
public int hashCode() {
    return orderId != null ? orderId.hashCode() : 0;
}

// 2. Rebuild cache with proper hashing
Map<String, Order> newCache = new HashMap<>(orderCache.size() * 2);
orderCache.forEach((k, v) -> newCache.put(k, v));
orderCache = newCache;
```

**Long-term Prevention:**
```java
// Use immutable keys
public final class OrderId {
    private final String value;
    
    public OrderId(String value) {
        this.value = validate(value);
    }
    
    @Override
    public int hashCode() {
        return value.hashCode(); // Well-distributed
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof OrderId)) return false;
        return value.equals(((OrderId) o).value);
    }
}
```

#### Follow-Up Questions

1. **Q: Why does HashMap use 0.75 as default load factor?**
   - Balance between space and time
   - 0.75 means resize when 75% full
   - Too low: frequent resizing (expensive)
   - Too high: more collisions (slower lookups)

2. **Q: What happens during HashMap resize?**
   - New array created (2x capacity)
   - All entries rehashed and redistributed
   - O(n) operation, but amortized O(1)
   - Tree nodes may be split or converted back to LinkedList

3. **Q: Can you have a HashMap with load factor > 1.0?**
   - Yes, but not recommended
   - Allows more entries than capacity
   - Guarantees collisions, degrades to O(n) or O(log n)

4. **Q: How does ConcurrentHashMap handle collisions differently?**
   - Uses segments/buckets with separate locks
   - Tree structure similar to HashMap
   - Lock striping reduces contention

---

*Continue to Part 2 for Multithreading & Concurrency Advanced Topics...*
