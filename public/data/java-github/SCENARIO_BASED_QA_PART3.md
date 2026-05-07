# Scenario-Based Questions & Answers - Part 3: Concurrency, Design Patterns & Production

> **Senior Technical Architect's Guide to Real-World Java Problems**
> *25+ Years of Enterprise Java Experience*

---

## Table of Contents

1. [Concurrency & Multithreading](#concurrency--multithreading)
2. [Design Patterns & Architecture](#design-patterns--architecture)
3. [Production Debugging](#production-debugging)

---

## Concurrency & Multithreading

### Q11: Your application has race conditions causing data corruption. How do you identify and fix them?

**Scenario:**
Order processing system shows incorrect totals. Multiple threads are updating the same order simultaneously, causing lost updates and data inconsistency.

**Step-by-Step Solution:**

#### Step 1: Identify Race Conditions

**Symptoms:**
- Data inconsistency
- Lost updates
- Incorrect calculations
- Intermittent bugs

**Tools:**
```bash
# Thread dump analysis
jstack <pid> | grep -A 20 "BLOCKED"

# Use concurrency testing tools
# - ThreadSanitizer
# - FindBugs/SpotBugs
```

#### Step 2: Common Race Condition Patterns

**Pattern 1: Check-Then-Act**
```java
// ❌ BAD: Race condition
public class OrderService {
    private final Map<String, Order> orders = new HashMap<>();
    
    public void updateOrder(String id, BigDecimal amount) {
        Order order = orders.get(id);
        if (order != null) {
            order.setTotal(order.getTotal().add(amount)); // Race condition!
        }
    }
}

// ✅ GOOD: Synchronization
public class OrderService {
    private final Map<String, Order> orders = new ConcurrentHashMap<>();
    
    public void updateOrder(String id, BigDecimal amount) {
        orders.computeIfPresent(id, (key, order) -> {
            order.setTotal(order.getTotal().add(amount));
            return order;
        });
    }
}

// ✅ BETTER: Atomic operations
public class OrderService {
    private final ConcurrentHashMap<String, AtomicReference<BigDecimal>> totals = 
        new ConcurrentHashMap<>();
    
    public void updateOrder(String id, BigDecimal amount) {
        totals.computeIfAbsent(id, k -> new AtomicReference<>(BigDecimal.ZERO))
            .updateAndGet(current -> current.add(amount));
    }
}
```

**Pattern 2: Lost Update Problem**
```java
// ❌ BAD: Lost update
@Transactional
public void updateInventory(String productId, int quantity) {
    Product product = productRepository.findById(productId).get();
    product.setStock(product.getStock() - quantity); // Lost update if concurrent!
    productRepository.save(product);
}

// ✅ GOOD: Optimistic locking
@Entity
public class Product {
    @Version
    private Long version; // Optimistic lock
    
    @Column
    private int stock;
}

@Transactional
public void updateInventory(String productId, int quantity) {
    Product product = productRepository.findById(productId)
        .orElseThrow();
    
    int newStock = product.getStock() - quantity;
    if (newStock < 0) {
        throw new InsufficientStockException();
    }
    
    product.setStock(newStock);
    productRepository.save(product); // Version check happens here
}

// ✅ BETTER: Database-level atomic update
@Modifying
@Query("UPDATE Product p SET p.stock = p.stock - :quantity WHERE p.id = :id AND p.stock >= :quantity")
int decrementStock(@Param("id") String id, @Param("quantity") int quantity);

public void updateInventory(String productId, int quantity) {
    int updated = productRepository.decrementStock(productId, quantity);
    if (updated == 0) {
        throw new InsufficientStockException();
    }
}
```

**Pattern 3: Compound Operations**
```java
// ❌ BAD: Non-atomic compound operation
public class Counter {
    private int count = 0;
    
    public void increment() {
        count++; // Not atomic! (read-modify-write)
    }
}

// ✅ GOOD: Use AtomicInteger
public class Counter {
    private final AtomicInteger count = new AtomicInteger(0);
    
    public void increment() {
        count.incrementAndGet(); // Atomic
    }
    
    public int get() {
        return count.get();
    }
}

// ✅ BETTER: For complex operations, use synchronized or locks
public class OrderCounter {
    private final AtomicInteger count = new AtomicInteger(0);
    private final Object lock = new Object();
    
    public void incrementAndLog() {
        synchronized (lock) {
            int newValue = count.incrementAndGet();
            log.info("Count incremented to: {}", newValue);
        }
    }
}
```

#### Step 3: Use Proper Synchronization

**Option 1: Synchronized Blocks**
```java
public class OrderService {
    private final Map<String, Order> orders = new HashMap<>();
    private final Object lock = new Object();
    
    public void updateOrder(String id, BigDecimal amount) {
        synchronized (lock) {
            Order order = orders.get(id);
            if (order != null) {
                order.setTotal(order.getTotal().add(amount));
            }
        }
    }
}
```

**Option 2: ReentrantLock**
```java
public class OrderService {
    private final Map<String, Order> orders = new HashMap<>();
    private final ReentrantLock lock = new ReentrantLock();
    
    public void updateOrder(String id, BigDecimal amount) {
        lock.lock();
        try {
            Order order = orders.get(id);
            if (order != null) {
                order.setTotal(order.getTotal().add(amount));
            }
        } finally {
            lock.unlock();
        }
    }
}
```

**Option 3: ReadWriteLock**
```java
public class OrderCache {
    private final Map<String, Order> cache = new HashMap<>();
    private final ReadWriteLock lock = new ReentrantReadWriteLock();
    
    public Order get(String id) {
        lock.readLock().lock();
        try {
            return cache.get(id);
        } finally {
            lock.readLock().unlock();
        }
    }
    
    public void put(String id, Order order) {
        lock.writeLock().lock();
        try {
            cache.put(id, order);
        } finally {
            lock.writeLock().unlock();
        }
    }
}
```

#### Step 4: Testing for Race Conditions

```java
@Test
public void testConcurrentUpdates() throws InterruptedException {
    OrderService service = new OrderService();
    int threads = 10;
    int iterations = 1000;
    ExecutorService executor = Executors.newFixedThreadPool(threads);
    CountDownLatch latch = new CountDownLatch(threads);
    
    for (int i = 0; i < threads; i++) {
        executor.submit(() -> {
            try {
                for (int j = 0; j < iterations; j++) {
                    service.updateOrder("order1", BigDecimal.ONE);
                }
            } finally {
                latch.countDown();
            }
        });
    }
    
    latch.await();
    Order order = service.getOrder("order1");
    assertEquals(BigDecimal.valueOf(threads * iterations), order.getTotal());
}
```

**Follow-Up Questions:**

1. **Q: How do you handle race conditions in a distributed system?**
   - Use distributed locks (Redis, Zookeeper)
   - Implement idempotency keys
   - Use event sourcing
   - Database-level constraints

2. **Q: What's the difference between optimistic and pessimistic locking?**
   - **Optimistic**: Assume no conflicts, check at commit (faster, retry on conflict)
   - **Pessimistic**: Lock immediately (slower, no retries needed)

3. **Q: How do you prevent race conditions in cache updates?**
   - Use atomic cache operations
   - Implement cache versioning
   - Use distributed cache with proper locking
   - Consider eventual consistency

---

### Q12: Thread pool is exhausted, causing requests to be rejected. How do you fix it?

**Scenario:**
Application uses thread pools for async processing. Under high load, thread pool gets exhausted, and new tasks are rejected, causing failures.

**Step-by-Step Solution:**

#### Step 1: Monitor Thread Pool

```java
@Component
public class ThreadPoolMonitor {
    @Autowired
    private ThreadPoolTaskExecutor asyncExecutor;
    
    @Scheduled(fixedRate = 5000)
    public void monitorPool() {
        ThreadPoolExecutor executor = asyncExecutor.getThreadPoolExecutor();
        log.info("Thread pool stats - Active: {}, Pool: {}, Queue: {}, Completed: {}",
            executor.getActiveCount(),
            executor.getPoolSize(),
            executor.getQueue().size(),
            executor.getCompletedTaskCount());
        
        if (executor.getQueue().size() > 100) {
            log.warn("Thread pool queue is getting full!");
        }
    }
}
```

#### Step 2: Configure Thread Pool Properly

```java
@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer {
    
    @Override
    @Bean(name = "asyncExecutor")
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10);
        executor.setMaxPoolSize(50);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("async-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        executor.initialize();
        return executor;
    }
    
    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return (ex, method, params) -> {
            log.error("Async method {} threw exception", method.getName(), ex);
        };
    }
}
```

**Sizing Guidelines:**
- **CPU-bound tasks**: `corePoolSize = CPU cores`
- **I/O-bound tasks**: `corePoolSize = CPU cores * 2-4`
- **Queue capacity**: Based on expected load
- **Max pool size**: Based on resource constraints

#### Step 3: Handle Rejection Policies

```java
// Option 1: CallerRunsPolicy (default in Spring)
// Executes task in calling thread (backpressure)
executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());

// Option 2: AbortPolicy (throws exception)
executor.setRejectedExecutionHandler(new ThreadPoolExecutor.AbortPolicy());

// Option 3: DiscardPolicy (silently discards)
executor.setRejectedExecutionHandler(new ThreadPoolExecutor.DiscardPolicy());

// Option 4: DiscardOldestPolicy (discards oldest)
executor.setRejectedExecutionHandler(new ThreadPoolExecutor.DiscardOldestPolicy());

// Option 5: Custom policy
executor.setRejectedExecutionHandler((r, executor) -> {
    log.warn("Task rejected, queue full. Retrying...");
    // Retry logic or fallback
    try {
        Thread.sleep(100);
        executor.execute(r);
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
    }
});
```

#### Step 4: Use CompletableFuture with Timeouts

```java
@Service
public class OrderProcessingService {
    @Autowired
    @Qualifier("asyncExecutor")
    private Executor executor;
    
    public CompletableFuture<Order> processOrder(Order order) {
        return CompletableFuture
            .supplyAsync(() -> process(order), executor)
            .orTimeout(30, TimeUnit.SECONDS) // Timeout
            .exceptionally(ex -> {
                log.error("Order processing failed", ex);
                return handleFailure(order, ex);
            });
    }
    
    private Order process(Order order) {
        // Long-running processing
        return order;
    }
}
```

#### Step 5: Implement Circuit Breaker Pattern

```java
@Component
public class ResilientOrderService {
    private final CircuitBreaker circuitBreaker;
    
    public ResilientOrderService() {
        this.circuitBreaker = CircuitBreaker.of("orderService", 
            CircuitBreakerConfig.custom()
                .failureRateThreshold(50)
                .waitDurationInOpenState(Duration.ofSeconds(30))
                .slidingWindowSize(10)
                .build());
    }
    
    public Order processOrder(Order order) {
        return circuitBreaker.executeSupplier(() -> {
            return orderProcessingService.process(order);
        });
    }
}
```

**Follow-Up Questions:**

1. **Q: How do you size thread pools for different types of workloads?**
   - CPU-bound: Number of cores
   - I/O-bound: Cores * (1 + wait time / compute time)
   - Mixed: Profile and measure
   - Consider queue capacity

2. **Q: What happens when thread pool queue is full?**
   - Depends on rejection policy
   - CallerRunsPolicy: Executes in calling thread (backpressure)
   - AbortPolicy: Throws RejectedExecutionException
   - Monitor and alert on rejections

3. **Q: How do you handle thread pool exhaustion in a microservices architecture?**
   - Use service mesh for connection pooling
   - Implement circuit breakers
   - Use async messaging (Kafka, RabbitMQ)
   - Horizontal scaling

---

## Design Patterns & Architecture

### Q13: How do you design a scalable order processing system using Java 8+ features?

**Scenario:**
Need to design an order processing system that can handle millions of orders per day. System must be scalable, maintainable, and use modern Java features.

**Step-by-Step Solution:**

#### Step 1: Domain Model Design

```java
// Domain entities
@Entity
public class Order {
    @Id
    private String id;
    private String customerId;
    private OrderStatus status;
    private BigDecimal total;
    
    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrderItem> items;
    
    @Version
    private Long version; // Optimistic locking
    
    // Immutable value objects
    public Money getTotal() {
        return Money.of(total, Currency.USD);
    }
}

public enum OrderStatus {
    PENDING, VALIDATED, PROCESSING, COMPLETED, CANCELLED
}
```

#### Step 2: Service Layer with Streams

```java
@Service
public class OrderProcessingService {
    private final OrderRepository orderRepository;
    private final InventoryService inventoryService;
    private final PaymentService paymentService;
    private final NotificationService notificationService;
    
    @Transactional
    public ProcessingResult processOrders(List<Order> orders) {
        return orders.stream()
            .filter(this::isValid)
            .peek(this::logOrder)
            .map(this::enrichOrder)
            .filter(order -> hasInventory(order))
            .map(this::calculatePricing)
            .map(this::applyDiscounts)
            .map(this::processPayment)
            .peek(this::updateInventory)
            .peek(order -> order.setStatus(OrderStatus.COMPLETED))
            .collect(Collectors.collectingAndThen(
                Collectors.toList(),
                this::createResult
            ));
    }
    
    private boolean isValid(Order order) {
        return order != null 
            && order.getItems() != null 
            && !order.getItems().isEmpty();
    }
    
    private Order enrichOrder(Order order) {
        Customer customer = customerService.findById(order.getCustomerId());
        order.setCustomer(customer);
        return order;
    }
    
    private boolean hasInventory(Order order) {
        return order.getItems().stream()
            .allMatch(item -> inventoryService.hasStock(
                item.getProductId(), 
                item.getQuantity()
            ));
    }
    
    private Order calculatePricing(Order order) {
        BigDecimal subtotal = order.getItems().stream()
            .map(OrderItem::getItemTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        order.setSubtotal(subtotal);
        order.setTax(calculateTax(subtotal));
        order.setTotal(subtotal.add(order.getTax()));
        return order;
    }
    
    private Order applyDiscounts(Order order) {
        BigDecimal discount = discountService.calculateDiscount(order);
        order.setDiscount(discount);
        order.setTotal(order.getTotal().subtract(discount));
        return order;
    }
    
    private Order processPayment(Order order) {
        PaymentResult result = paymentService.process(order);
        if (!result.isSuccess()) {
            throw new PaymentException("Payment failed");
        }
        return order;
    }
    
    private void updateInventory(Order order) {
        order.getItems().forEach(item -> 
            inventoryService.decrementStock(
                item.getProductId(), 
                item.getQuantity()
            )
        );
    }
    
    private ProcessingResult createResult(List<Order> processed) {
        return ProcessingResult.builder()
            .processedCount(processed.size())
            .totalValue(processed.stream()
                .map(Order::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add))
            .orders(processed)
            .build();
    }
}
```

#### Step 3: Parallel Processing for Large Batches

```java
@Service
public class BatchOrderProcessor {
    
    public ProcessingResult processBatch(List<Order> orders) {
        // Split into chunks for parallel processing
        int chunkSize = 100;
        List<List<Order>> chunks = partition(orders, chunkSize);
        
        List<Order> processed = chunks.parallelStream()
            .map(this::processChunk)
            .flatMap(List::stream)
            .collect(Collectors.toList());
        
        return createResult(processed);
    }
    
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    private List<Order> processChunk(List<Order> chunk) {
        return chunk.stream()
            .filter(this::isValid)
            .map(this::processOrder)
            .collect(Collectors.toList());
    }
    
    private <T> List<List<T>> partition(List<T> list, int size) {
        return IntStream.range(0, (list.size() + size - 1) / size)
            .mapToObj(i -> list.subList(i * size, Math.min((i + 1) * size, list.size())))
            .collect(Collectors.toList());
    }
}
```

#### Step 4: Event-Driven Architecture

```java
@Component
public class OrderEventPublisher {
    private final ApplicationEventPublisher eventPublisher;
    
    public void publishOrderCreated(Order order) {
        eventPublisher.publishEvent(new OrderCreatedEvent(order));
    }
    
    public void publishOrderCompleted(Order order) {
        eventPublisher.publishEvent(new OrderCompletedEvent(order));
    }
}

@EventListener
@Async
public void handleOrderCreated(OrderCreatedEvent event) {
    Order order = event.getOrder();
    notificationService.sendConfirmation(order);
    analyticsService.trackOrderCreated(order);
}

@EventListener
@Async
public void handleOrderCompleted(OrderCompletedEvent event) {
    Order order = event.getOrder();
    inventoryService.updateStock(order);
    shippingService.createShipment(order);
}
```

#### Step 5: Caching Strategy

```java
@Service
public class OrderService {
    
    @Cacheable(value = "orders", key = "#id")
    public Order getOrder(String id) {
        return orderRepository.findById(id)
            .orElseThrow(() -> new OrderNotFoundException(id));
    }
    
    @CacheEvict(value = "orders", key = "#order.id")
    public Order updateOrder(Order order) {
        return orderRepository.save(order);
    }
    
    @Cacheable(value = "orderStats", key = "#customerId")
    public OrderStatistics getOrderStatistics(String customerId) {
        return orderRepository.findByCustomerId(customerId).stream()
            .collect(Collectors.collectingAndThen(
                Collectors.toList(),
                this::calculateStatistics
            ));
    }
    
    private OrderStatistics calculateStatistics(List<Order> orders) {
        return OrderStatistics.builder()
            .totalOrders(orders.size())
            .totalValue(orders.stream()
                .map(Order::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add))
            .averageOrderValue(orders.stream()
                .map(Order::getTotal)
                .collect(Collectors.averagingDouble(BigDecimal::doubleValue)))
            .build();
    }
}
```

#### Step 6: Error Handling

```java
@Component
public class OrderProcessingErrorHandler {
    
    public Order handleError(Order order, Exception ex) {
        return switch (ex) {
            case InsufficientStockException e -> handleInsufficientStock(order, e);
            case PaymentException e -> handlePaymentFailure(order, e);
            case ValidationException e -> handleValidationError(order, e);
            default -> handleGenericError(order, ex);
        };
    }
    
    private Order handleInsufficientStock(Order order, InsufficientStockException ex) {
        order.setStatus(OrderStatus.CANCELLED);
        order.setCancellationReason("Insufficient stock: " + ex.getProductId());
        notificationService.sendStockUnavailableNotification(order);
        return order;
    }
    
    private Order handlePaymentFailure(Order order, PaymentException ex) {
        order.setStatus(OrderStatus.PAYMENT_FAILED);
        paymentService.retryPayment(order);
        return order;
    }
}
```

**Follow-Up Questions:**

1. **Q: How do you scale this system to handle 10x more load?**
   - Horizontal scaling (multiple instances)
   - Database read replicas
   - Caching layer (Redis)
   - Message queue for async processing
   - CDN for static content

2. **Q: How do you ensure data consistency in this design?**
   - Use transactions for critical operations
   - Implement saga pattern for distributed transactions
   - Use event sourcing for audit trail
   - Database constraints and validations

3. **Q: How do you monitor and observe this system?**
   - Distributed tracing (Zipkin, Jaeger)
   - Metrics (Prometheus, Micrometer)
   - Logging (ELK stack)
   - Health checks and alerts

---

## Production Debugging

### Q14: Application is slow but you don't know why. How do you systematically debug it?

**Scenario:**
Production application is experiencing slowness. No obvious errors in logs. Need a systematic approach to identify the bottleneck.

**Step-by-Step Solution:**

#### Step 1: Establish Baseline Metrics

```java
@Component
public class PerformanceMonitor {
    private final MeterRegistry meterRegistry;
    
    @Scheduled(fixedRate = 60000)
    public void collectMetrics() {
        // JVM metrics
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
        MemoryUsage heapUsage = memoryBean.getHeapMemoryUsage();
        meterRegistry.gauge("jvm.memory.used", heapUsage.getUsed());
        meterRegistry.gauge("jvm.memory.max", heapUsage.getMax());
        
        // Thread metrics
        ThreadMXBean threadBean = ManagementFactory.getThreadMXBean();
        meterRegistry.gauge("jvm.threads.live", threadBean.getThreadCount());
        
        // GC metrics
        List<GarbageCollectorMXBean> gcBeans = ManagementFactory.getGarbageCollectorMXBeans();
        gcBeans.forEach(gc -> {
            meterRegistry.gauge("jvm.gc.collections", gc.getCollectionCount());
            meterRegistry.gauge("jvm.gc.time", gc.getCollectionTime());
        });
    }
}
```

#### Step 2: Add Request Tracing

```java
@Component
public class RequestTracingFilter extends OncePerRequestFilter {
    private static final Logger log = LoggerFactory.getLogger(RequestTracingFilter.class);
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                   HttpServletResponse response, 
                                   FilterChain filterChain) throws ServletException, IOException {
        long startTime = System.currentTimeMillis();
        String requestId = UUID.randomUUID().toString();
        
        MDC.put("requestId", requestId);
        
        try {
            filterChain.doFilter(request, response);
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            log.info("Request: {} {} - Status: {} - Duration: {}ms - RequestId: {}",
                request.getMethod(),
                request.getRequestURI(),
                response.getStatus(),
                duration,
                requestId);
            
            if (duration > 1000) {
                log.warn("Slow request detected: {}ms for {}", duration, request.getRequestURI());
            }
            
            MDC.clear();
        }
    }
}
```

#### Step 3: Profile Critical Paths

```java
@Aspect
@Component
public class PerformanceAspect {
    private static final Logger log = LoggerFactory.getLogger(PerformanceAspect.class);
    
    @Around("execution(* com.example.service.*.*(..))")
    public Object measureExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();
        String methodName = joinPoint.getSignature().toShortString();
        
        try {
            Object result = joinPoint.proceed();
            long duration = System.currentTimeMillis() - startTime;
            
            if (duration > 100) { // Log slow methods
                log.warn("Slow method: {} took {}ms", methodName, duration);
            }
            
            return result;
        } catch (Throwable ex) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Method {} failed after {}ms", methodName, duration, ex);
            throw ex;
        }
    }
}
```

#### Step 4: Database Query Analysis

```java
@Component
public class QueryPerformanceMonitor {
    private static final Logger log = LoggerFactory.getLogger(QueryPerformanceMonitor.class);
    
    @EventListener
    public void handleQuery(PreQueryEvent event) {
        long startTime = System.currentTimeMillis();
        // Store start time in thread local
    }
    
    @EventListener
    public void handleQueryComplete(PostQueryEvent event) {
        long duration = System.currentTimeMillis() - getStartTime();
        if (duration > 1000) {
            log.warn("Slow query detected: {}ms - {}", duration, event.getQuery());
        }
    }
}
```

#### Step 5: Use APM Tools

**Application Performance Monitoring:**
- **New Relic** - Full APM solution
- **Datadog** - Infrastructure and APM
- **AppDynamics** - Enterprise APM
- **Elastic APM** - Open source

**Java Flight Recorder:**
```bash
# Enable JFR
-XX:+FlightRecorder
-XX:StartFlightRecording=duration=60s,filename=recording.jfr

# Analyze with JDK Mission Control
```

#### Step 6: Systematic Debugging Checklist

1. **Check CPU Usage**
   ```bash
   top -H -p <pid>
   jstack <pid>
   ```

2. **Check Memory Usage**
   ```bash
   jmap -heap <pid>
   jstat -gcutil <pid> 1000
   ```

3. **Check Thread Dumps**
   ```bash
   jstack <pid> | grep -A 10 "BLOCKED"
   ```

4. **Check Database**
   ```sql
   -- PostgreSQL
   SELECT * FROM pg_stat_activity WHERE state = 'active';
   
   -- MySQL
   SHOW PROCESSLIST;
   ```

5. **Check Network**
   ```bash
   netstat -an | grep ESTABLISHED
   tcpdump -i any port 8080
   ```

6. **Check Logs**
   ```bash
   grep "ERROR\|WARN\|Exception" application.log | tail -100
   ```

**Follow-Up Questions:**

1. **Q: How do you debug performance issues in a microservices architecture?**
   - Use distributed tracing
   - Correlate logs across services
   - Monitor service dependencies
   - Use service mesh observability

2. **Q: What tools do you use for production debugging?**
   - APM tools (New Relic, Datadog)
   - Log aggregation (ELK, Splunk)
   - Metrics (Prometheus, Grafana)
   - Distributed tracing (Zipkin, Jaeger)

3. **Q: How do you prevent performance regressions?**
   - Performance testing in CI/CD
   - Benchmark critical paths
   - Set up performance budgets
   - Regular profiling

---

### Q15: Application crashes in production with no clear error. How do you diagnose it?

**Scenario:**
Application crashes randomly in production. No exceptions in logs. Process just terminates. Need to diagnose root cause.

**Step-by-Step Solution:**

#### Step 1: Enable Crash Dumps

```bash
# JVM crash dumps (Linux)
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=/var/dumps
-XX:ErrorFile=/var/dumps/hs_err_pid%p.log

# Core dumps
ulimit -c unlimited
echo "/var/dumps/core.%e.%p" > /proc/sys/kernel/core_pattern
```

#### Step 2: Check System Logs

```bash
# Check system logs
journalctl -u your-service -n 100

# Check OOM killer
dmesg | grep -i "out of memory"
dmesg | grep -i "killed process"

# Check system resources
free -h
df -h
```

#### Step 3: Common Causes

**1. Out of Memory (OOM) Killer**
```bash
# Check if OOM killer killed the process
dmesg | grep -i "oom"

# Solution: Increase memory limits or optimize memory usage
# In Docker/K8s:
resources:
  limits:
    memory: "2Gi"
  requests:
    memory: "1Gi"
```

**2. Native Memory Exhaustion**
```bash
# Check direct memory
-XX:MaxDirectMemorySize=1g

# Check metaspace
-XX:MaxMetaspaceSize=256m
```

**3. Signal Handling**
```java
// Add shutdown hooks
Runtime.getRuntime().addShutdownHook(new Thread(() -> {
    log.info("Application shutting down...");
    // Cleanup
}));
```

#### Step 4: Add Health Checks

```java
@Component
public class ApplicationHealthMonitor {
    private static final Logger log = LoggerFactory.getLogger(ApplicationHealthMonitor.class);
    
    @Scheduled(fixedRate = 30000)
    public void checkHealth() {
        try {
            // Check memory
            MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
            MemoryUsage heapUsage = memoryBean.getHeapMemoryUsage();
            double usagePercent = (double) heapUsage.getUsed() / heapUsage.getMax() * 100;
            
            if (usagePercent > 90) {
                log.error("Critical memory usage: {}%", usagePercent);
                // Alert, take action
            }
            
            // Check threads
            ThreadMXBean threadBean = ManagementFactory.getThreadMXBean();
            int threadCount = threadBean.getThreadCount();
            if (threadCount > 500) {
                log.error("High thread count: {}", threadCount);
            }
            
        } catch (Exception e) {
            log.error("Health check failed", e);
        }
    }
}
```

#### Step 5: Use Process Managers

**Systemd:**
```ini
[Unit]
Description=My Application
After=network.target

[Service]
Type=simple
User=appuser
ExecStart=/usr/bin/java -jar /opt/app/app.jar
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

**Docker:**
```dockerfile
# Use health checks
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:8080/actuator/health || exit 1
```

**Kubernetes:**
```yaml
livenessProbe:
  httpGet:
    path: /actuator/health/liveness
    port: 8080
  initialDelaySeconds: 60
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /actuator/health/readiness
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 5
```

**Follow-Up Questions:**

1. **Q: How do you handle crashes in a containerized environment?**
   - Use health checks
   - Configure restart policies
   - Monitor container metrics
   - Use orchestration (K8s) for auto-recovery

2. **Q: What's the difference between a crash and a graceful shutdown?**
   - **Crash**: Unexpected termination (signals, OOM, exceptions)
   - **Graceful**: Controlled shutdown (SIGTERM, shutdown hooks)

3. **Q: How do you prevent crashes in production?**
   - Comprehensive error handling
   - Resource limits and monitoring
   - Health checks and auto-restart
   - Load testing before deployment

---

## Summary

This comprehensive guide covers:

✅ **Core Java & JVM**: Memory management, GC tuning, performance  
✅ **Spring Boot**: Startup optimization, transactions, REST APIs  
✅ **Concurrency**: Race conditions, thread pools, deadlocks  
✅ **Design Patterns**: Scalable architectures, event-driven design  
✅ **Production Debugging**: Systematic approaches, tools, monitoring  

**Key Takeaways:**
1. Always monitor and measure before optimizing
2. Use proper tools for diagnosis (profiling, APM, logging)
3. Follow best practices from the start
4. Test under load before production
5. Have proper observability in place

**Next Steps:**
- Practice with real scenarios
- Set up monitoring in your environment
- Review and apply patterns to your codebase
- Continuously learn and improve

---

**Remember: Production issues are learning opportunities. Document solutions and share knowledge! 🚀**
