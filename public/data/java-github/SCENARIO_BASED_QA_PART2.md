# Scenario-Based Questions & Answers - Part 2: Spring Boot & Enterprise

> **Senior Technical Architect's Guide to Real-World Java Problems**
> *25+ Years of Enterprise Java Experience*

---

## Table of Contents

1. [Spring Boot Scenarios](#spring-boot-scenarios)
2. [Database & Transaction Management](#database--transaction-management)
3. [REST API & Integration](#rest-api--integration)

---

## Spring Boot Scenarios

### Q6: Your Spring Boot application is slow to start. How do you optimize startup time?

**Scenario:**
Application takes 2-3 minutes to start. This affects deployment times and development productivity. Need to reduce startup time to under 30 seconds.

**Step-by-Step Solution:**

#### Step 1: Identify Startup Bottlenecks

```bash
# Enable startup logging
-Dspring.main.log-startup-info=true

# Or use Spring Boot Actuator
management.endpoints.web.exposure.include=startup
```

**Use Spring Boot DevTools for startup analysis:**
```java
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(Application.class);
        app.setLogStartupInfo(true);
        app.run(args);
    }
}
```

#### Step 2: Common Causes & Fixes

**1. Excessive Auto-Configuration**
```java
// ❌ BAD: Loading unnecessary auto-configurations
@SpringBootApplication
public class Application {
    // Loads ALL auto-configurations
}

// ✅ GOOD: Exclude unnecessary auto-configurations
@SpringBootApplication(exclude = {
    DataSourceAutoConfiguration.class,  // If not using DB
    JmsAutoConfiguration.class,          // If not using JMS
    KafkaAutoConfiguration.class         // If not using Kafka
})
public class Application {
}

// Or in application.properties
spring.autoconfigure.exclude=\
  org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration
```

**2. Lazy Initialization**
```java
// ✅ GOOD: Enable lazy initialization (Java 9+)
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(Application.class);
        app.setLazyInitialization(true); // Beans created on demand
        app.run(args);
    }
}

// Or in application.properties
spring.main.lazy-initialization=true
```

**3. Heavy @PostConstruct Methods**
```java
// ❌ BAD: Heavy initialization in @PostConstruct
@Component
public class DataLoader {
    @PostConstruct
    public void init() {
        // Loading millions of records at startup
        List<Order> orders = orderRepository.findAll();
        cache.putAll(orders);
    }
}

// ✅ GOOD: Lazy loading or async initialization
@Component
public class DataLoader {
    @EventListener(ApplicationReadyEvent.class)
    @Async
    public void init() {
        // Load after application is ready
        List<Order> orders = orderRepository.findAll();
        cache.putAll(orders);
    }
}

// Or use @Lazy
@Lazy
@Component
public class DataLoader {
    // Only initialized when first accessed
}
```

**4. Database Connection Pool Initialization**
```yaml
# ❌ BAD: Creating all connections at startup
spring:
  datasource:
    hikari:
      minimum-idle: 10
      maximum-pool-size: 20

# ✅ GOOD: Lazy connection creation
spring:
  datasource:
    hikari:
      minimum-idle: 2  # Start with fewer
      maximum-pool-size: 20
      connection-timeout: 30000
```

**5. Component Scanning Too Broad**
```java
// ❌ BAD: Scanning entire package tree
@ComponentScan(basePackages = "com.company")

// ✅ GOOD: Scan only necessary packages
@ComponentScan(basePackages = {
    "com.company.service",
    "com.company.controller"
})
```

**6. Heavy Bean Creation**
```java
// ❌ BAD: Creating expensive objects at startup
@Configuration
public class AppConfig {
    @Bean
    public ExpensiveService expensiveService() {
        return new ExpensiveService(loadLargeDataset()); // Slow!
    }
}

// ✅ GOOD: Lazy or factory pattern
@Configuration
public class AppConfig {
    @Bean
    @Lazy
    public ExpensiveService expensiveService() {
        return new ExpensiveService();
    }
    
    // Or use factory
    @Bean
    public ExpensiveServiceFactory factory() {
        return new ExpensiveServiceFactory();
    }
}
```

#### Step 3: Use Spring Boot 2.4+ Features

**GraalVM Native Image (Experimental):**
```xml
<plugin>
    <groupId>org.graalvm.nativeimage</groupId>
    <artifactId>native-image-maven-plugin</artifactId>
</plugin>
```

**Spring Boot Buildpacks:**
```bash
# Faster container builds
mvn spring-boot:build-image
```

#### Step 4: Profile and Measure

```java
@Component
public class StartupProfiler {
    private static final Logger log = LoggerFactory.getLogger(StartupProfiler.class);
    
    @EventListener
    public void onApplicationReady(ApplicationReadyEvent event) {
        long startupTime = event.getApplicationContext().getStartupDate();
        log.info("Application started in {} ms", startupTime);
    }
}
```

**Follow-Up Questions:**

1. **Q: How do you balance lazy initialization with startup validation?**
   - Use `@DependsOn` for critical beans
   - Validate in `@PostConstruct` for critical components
   - Use health checks for validation

2. **Q: What's the impact of lazy initialization on memory?**
   - Lower initial memory footprint
   - Memory grows as beans are accessed
   - Monitor memory usage over time

3. **Q: How do you optimize startup in a microservices architecture?**
   - Use container images with pre-warmed JVM
   - Implement health checks for readiness
   - Use sidecar patterns for shared components

---

### Q7: Spring Boot application throws `TransactionException: Transaction is not active`. How do you fix it?

**Scenario:**
Your service method throws transaction exceptions intermittently. Transactions seem to be closing prematurely or not starting properly.

**Step-by-Step Solution:**

#### Step 1: Understand Transaction Propagation

```java
// Transaction propagation levels
@Transactional(propagation = Propagation.REQUIRED)      // Default
@Transactional(propagation = Propagation.REQUIRES_NEW)  // New transaction
@Transactional(propagation = Propagation.NESTED)        // Nested transaction
@Transactional(propagation = Propagation.SUPPORTS)      // Use if exists
@Transactional(propagation = Propagation.NOT_SUPPORTED) // Suspend transaction
@Transactional(propagation = Propagation.MANDATORY)     // Must have transaction
@Transactional(propagation = Propagation.NEVER)         // No transaction
```

#### Step 2: Common Causes & Fixes

**1. Self-Invocation Problem**
```java
// ❌ BAD: Transaction doesn't work (proxy issue)
@Service
public class OrderService {
    public void processOrder(Order order) {
        validateOrder(order); // @Transactional not applied!
        saveOrder(order);
    }
    
    @Transactional
    public void validateOrder(Order order) {
        // Transaction not active here!
    }
}

// ✅ GOOD: Extract to separate service or use self-injection
@Service
public class OrderService {
    @Autowired
    private OrderService self; // Self-injection
    
    public void processOrder(Order order) {
        self.validateOrder(order); // Works via proxy
        saveOrder(order);
    }
    
    @Transactional
    public void validateOrder(Order order) {
        // Transaction active
    }
}

// ✅ BETTER: Separate service
@Service
public class OrderValidationService {
    @Transactional
    public void validateOrder(Order order) {
        // Transaction active
    }
}
```

**2. Async Methods**
```java
// ❌ BAD: Transaction doesn't propagate to async
@Transactional
public void processOrder(Order order) {
    orderRepository.save(order);
    asyncService.sendNotification(order); // No transaction context!
}

// ✅ GOOD: Complete transaction before async
@Transactional
public void processOrder(Order order) {
    orderRepository.save(order);
    // Transaction commits here
}
// Then async
@Async
public void sendNotification(Order order) {
    // No transaction needed for notification
}
```

**3. Exception Handling**
```java
// ❌ BAD: Catching exception prevents rollback
@Transactional
public void processOrder(Order order) {
    try {
        orderRepository.save(order);
        inventoryService.update(order); // May throw exception
    } catch (Exception e) {
        log.error("Error", e);
        // Transaction still commits!
    }
}

// ✅ GOOD: Let exception propagate or configure rollback
@Transactional(rollbackFor = Exception.class)
public void processOrder(Order order) {
    try {
        orderRepository.save(order);
        inventoryService.update(order);
    } catch (BusinessException e) {
        // Transaction rolls back
        throw e;
    }
}

// Or configure default rollback
@Transactional(rollbackFor = Exception.class)
public void processOrder(Order order) {
    // Any exception causes rollback
}
```

**4. Multiple Data Sources**
```java
// ❌ BAD: Wrong transaction manager
@Transactional
public void saveOrder(Order order) {
    orderRepository.save(order); // Uses default transaction manager
    auditRepository.save(audit); // Needs different transaction manager!
}

// ✅ GOOD: Specify transaction manager
@Transactional(transactionManager = "orderTransactionManager")
public void saveOrder(Order order) {
    orderRepository.save(order);
}

@Transactional(transactionManager = "auditTransactionManager")
public void saveAudit(Audit audit) {
    auditRepository.save(audit);
}
```

**5. Read-Only Transactions**
```java
// ❌ BAD: Write in read-only transaction
@Transactional(readOnly = true)
public Order getOrder(String id) {
    Order order = orderRepository.findById(id);
    order.setStatus("PROCESSED"); // Exception!
    return order;
}

// ✅ GOOD: Separate read and write
@Transactional(readOnly = true)
public Order getOrder(String id) {
    return orderRepository.findById(id);
}

@Transactional
public void updateOrder(Order order) {
    orderRepository.save(order);
}
```

#### Step 3: Debug Transaction Issues

```java
@Component
public class TransactionDebugger {
    private static final Logger log = LoggerFactory.getLogger(TransactionDebugger.class);
    
    @EventListener
    public void handleTransaction(TransactionPhase phase, Object source) {
        TransactionStatus status = TransactionSynchronizationManager.getCurrentTransactionStatus();
        log.debug("Transaction status: {}, Active: {}", 
            status, TransactionSynchronizationManager.isActualTransactionActive());
    }
}

// Or use AOP
@Aspect
@Component
public class TransactionAspect {
    @Around("@annotation(org.springframework.transaction.annotation.Transactional)")
    public Object logTransaction(ProceedingJoinPoint joinPoint) throws Throwable {
        boolean active = TransactionSynchronizationManager.isActualTransactionActive();
        log.info("Transaction active: {}", active);
        return joinPoint.proceed();
    }
}
```

#### Step 4: Configuration

```yaml
# application.yml
spring:
  jpa:
    properties:
      hibernate:
        current_session_context_class: thread
    open-in-view: false  # Important for transaction boundaries
```

**Follow-Up Questions:**

1. **Q: How do you handle distributed transactions in microservices?**
   - Use Saga pattern
   - Event-driven architecture
   - Two-phase commit (avoid if possible)
   - Idempotency keys

2. **Q: What's the difference between `REQUIRED` and `REQUIRES_NEW`?**
   - **REQUIRED**: Joins existing transaction or creates new
   - **REQUIRES_NEW**: Always creates new transaction (suspends existing)

3. **Q: How do you test transactions?**
   - Use `@Transactional` in tests (rolls back by default)
   - Use `@Rollback(false)` to commit
   - Test transaction boundaries
   - Use `@DirtiesContext` if needed

---

### Q8: Spring Boot REST API is returning 500 errors intermittently. How do you diagnose and fix?

**Scenario:**
Production REST API returns 500 Internal Server Error for some requests. Errors are intermittent and hard to reproduce. Logs show various exceptions.

**Step-by-Step Solution:**

#### Step 1: Enable Comprehensive Logging

```yaml
# application.yml
logging:
  level:
    org.springframework.web: DEBUG
    org.springframework.security: DEBUG
    com.example: DEBUG
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
```

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception ex, HttpServletRequest request) {
        log.error("Unhandled exception for request: {}", request.getRequestURI(), ex);
        
        ErrorResponse error = ErrorResponse.builder()
            .timestamp(Instant.now())
            .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
            .error("Internal Server Error")
            .message(ex.getMessage())
            .path(request.getRequestURI())
            .build();
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
    
    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ErrorResponse> handleDataAccess(DataAccessException ex) {
        log.error("Database error", ex);
        // Return appropriate error
    }
}
```

#### Step 2: Common Causes & Fixes

**1. NullPointerException**
```java
// ❌ BAD: No null checks
@GetMapping("/orders/{id}")
public ResponseEntity<Order> getOrder(@PathVariable String id) {
    Order order = orderRepository.findById(id).get(); // NPE if not found!
    return ResponseEntity.ok(order);
}

// ✅ GOOD: Proper null handling
@GetMapping("/orders/{id}")
public ResponseEntity<Order> getOrder(@PathVariable String id) {
    return orderRepository.findById(id)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
}
```

**2. Database Connection Issues**
```java
// ❌ BAD: No connection pool configuration
# No connection pool settings

// ✅ GOOD: Configure connection pool
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
      leak-detection-threshold: 60000
```

**3. Transaction Timeout**
```java
// ❌ BAD: Long-running transaction
@Transactional
@GetMapping("/reports/generate")
public ResponseEntity<Report> generateReport() {
    // Takes 5 minutes - transaction times out!
    return ResponseEntity.ok(reportService.generate());
}

// ✅ GOOD: No transaction for read-only or async processing
@GetMapping("/reports/generate")
public CompletableFuture<ResponseEntity<Report>> generateReport() {
    return CompletableFuture.supplyAsync(() -> 
        reportService.generate(), asyncExecutor)
        .thenApply(ResponseEntity::ok);
}
```

**4. Memory Issues**
```java
// ❌ BAD: Loading too much data
@GetMapping("/orders")
public ResponseEntity<List<Order>> getAllOrders() {
    return ResponseEntity.ok(orderRepository.findAll()); // Millions of records!
}

// ✅ GOOD: Pagination
@GetMapping("/orders")
public ResponseEntity<Page<Order>> getAllOrders(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size) {
    Pageable pageable = PageRequest.of(page, size);
    return ResponseEntity.ok(orderRepository.findAll(pageable));
}
```

**5. Circular Dependencies**
```java
// ❌ BAD: Circular dependency
@Service
public class OrderService {
    @Autowired
    private PaymentService paymentService; // PaymentService depends on OrderService!
}

// ✅ GOOD: Break circular dependency
// Option 1: Use @Lazy
@Service
public class OrderService {
    @Autowired
    @Lazy
    private PaymentService paymentService;
}

// Option 2: Refactor (better)
@Service
public class OrderService {
    private final OrderEventPublisher eventPublisher;
    
    public void processOrder(Order order) {
        // Process order
        eventPublisher.publishOrderCreated(order); // Event-driven
    }
}
```

#### Step 3: Add Request/Response Logging

```java
@Component
public class RequestLoggingFilter extends OncePerRequestFilter {
    private static final Logger log = LoggerFactory.getLogger(RequestLoggingFilter.class);
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                   HttpServletResponse response, 
                                   FilterChain filterChain) throws ServletException, IOException {
        long startTime = System.currentTimeMillis();
        
        try {
            filterChain.doFilter(request, response);
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            log.info("Request: {} {} - Status: {} - Duration: {}ms",
                request.getMethod(),
                request.getRequestURI(),
                response.getStatus(),
                duration);
        }
    }
}
```

#### Step 4: Health Checks and Monitoring

```java
@Component
public class CustomHealthIndicator implements HealthIndicator {
    @Override
    public Health health() {
        // Check database
        // Check external services
        // Check memory
        return Health.up()
            .withDetail("database", "connected")
            .build();
    }
}

// Use Actuator
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
  health:
    db:
      enabled: true
```

**Follow-Up Questions:**

1. **Q: How do you handle errors in a microservices architecture?**
   - Use circuit breakers (Resilience4j, Hystrix)
   - Implement retry with exponential backoff
   - Use distributed tracing
   - Centralized error logging

2. **Q: What's the difference between 500 and 502/503 errors?**
   - **500**: Application error (bug in code)
   - **502**: Bad gateway (upstream service error)
   - **503**: Service unavailable (overloaded, maintenance)

3. **Q: How do you prevent sensitive data in error responses?**
   - Sanitize error messages
   - Use error codes instead of messages
   - Log detailed errors server-side
   - Return generic messages to clients

---

## Database & Transaction Management

### Q9: Database queries are slow. How do you identify and optimize them?

**Scenario:**
Application response times are slow. Database appears to be the bottleneck. Need to identify slow queries and optimize them.

**Step-by-Step Solution:**

#### Step 1: Enable Query Logging

```yaml
# application.yml
spring:
  jpa:
    properties:
      hibernate:
        format_sql: true
        show_sql: true
        use_sql_comments: true
    show-sql: true
logging:
  level:
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql.BasicBinder: TRACE
```

#### Step 2: Use Hibernate Statistics

```yaml
spring:
  jpa:
    properties:
      hibernate:
        generate_statistics: true
```

```java
@RestController
public class StatisticsController {
    @Autowired
    private EntityManagerFactory entityManagerFactory;
    
    @GetMapping("/admin/statistics")
    public Map<String, Object> getStatistics() {
        Statistics stats = entityManagerFactory.unwrap(SessionFactory.class)
            .getStatistics();
        
        return Map.of(
            "queryCount", stats.getQueryExecutionCount(),
            "slowQueries", stats.getSlowQueries(),
            "cacheHitCount", stats.getSecondLevelCacheHitCount()
        );
    }
}
```

#### Step 3: Common Performance Issues & Fixes

**1. N+1 Query Problem**
```java
// ❌ BAD: N+1 queries
@Entity
public class Order {
    @OneToMany(mappedBy = "order")
    private List<OrderItem> items;
}

@GetMapping("/orders")
public List<Order> getOrders() {
    List<Order> orders = orderRepository.findAll(); // 1 query
    // For each order, another query for items! (N queries)
    return orders;
}

// ✅ GOOD: Use JOIN FETCH
@Query("SELECT o FROM Order o JOIN FETCH o.items")
List<Order> findAllWithItems();

// Or use EntityGraph
@EntityGraph(attributePaths = {"items"})
List<Order> findAll();

// Or use @BatchSize
@Entity
public class Order {
    @OneToMany(mappedBy = "order")
    @BatchSize(size = 10)
    private List<OrderItem> items;
}
```

**2. Missing Indexes**
```java
// ❌ BAD: No index on frequently queried column
@Entity
public class Order {
    @Column
    private String customerId; // Queried often, no index
}

// ✅ GOOD: Add index
@Entity
@Table(indexes = @Index(name = "idx_customer_id", columnList = "customerId"))
public class Order {
    @Column
    private String customerId;
}

// Or in migration
CREATE INDEX idx_customer_id ON orders(customer_id);
```

**3. Fetching Too Much Data**
```java
// ❌ BAD: Fetching all columns
@Query("SELECT o FROM Order o")
List<Order> findAll();

// ✅ GOOD: Fetch only needed columns
@Query("SELECT new com.example.dto.OrderSummary(o.id, o.total, o.status) FROM Order o")
List<OrderSummary> findSummaries();

// Or use projections
public interface OrderSummary {
    String getId();
    BigDecimal getTotal();
    String getStatus();
}
```

**4. Inefficient Joins**
```java
// ❌ BAD: Cartesian product
@Query("SELECT o FROM Order o, Customer c WHERE o.customerId = c.id")
List<Order> findOrdersWithCustomers();

// ✅ GOOD: Proper JOIN
@Query("SELECT o FROM Order o JOIN o.customer c")
List<Order> findOrdersWithCustomers();
```

**5. No Pagination**
```java
// ❌ BAD: Loading all records
@GetMapping("/orders")
public List<Order> getAllOrders() {
    return orderRepository.findAll(); // Could be millions!
}

// ✅ GOOD: Pagination
@GetMapping("/orders")
public Page<Order> getAllOrders(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(defaultValue = "id") String sortBy) {
    Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
    return orderRepository.findAll(pageable);
}
```

#### Step 4: Use Database-Specific Tools

**PostgreSQL:**
```sql
-- Enable slow query log
SET log_min_duration_statement = 1000; -- Log queries > 1 second

-- Find slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Explain plan
EXPLAIN ANALYZE SELECT * FROM orders WHERE customer_id = '123';
```

**MySQL:**
```sql
-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;

-- Find slow queries
SELECT * FROM mysql.slow_log ORDER BY start_time DESC LIMIT 10;
```

#### Step 5: Use Connection Pool Monitoring

```java
@Component
public class ConnectionPoolMonitor {
    @Autowired
    private DataSource dataSource;
    
    @Scheduled(fixedRate = 60000)
    public void monitorPool() {
        if (dataSource instanceof HikariDataSource) {
            HikariDataSource hikari = (HikariDataSource) dataSource;
            HikariPoolMXBean pool = hikari.getHikariPoolMXBean();
            
            log.info("Pool stats - Active: {}, Idle: {}, Total: {}, Waiting: {}",
                pool.getActiveConnections(),
                pool.getIdleConnections(),
                pool.getTotalConnections(),
                pool.getThreadsAwaitingConnection());
        }
    }
}
```

**Follow-Up Questions:**

1. **Q: How do you optimize database queries in a read-heavy application?**
   - Use read replicas
   - Implement caching (Redis, Caffeine)
   - Use database-specific optimizations
   - Consider materialized views

2. **Q: What's the difference between eager and lazy loading?**
   - **Eager**: Loads immediately (can cause N+1)
   - **Lazy**: Loads on access (can cause LazyInitializationException)
   - Use JOIN FETCH for specific queries

3. **Q: How do you handle database migrations in production?**
   - Use Flyway or Liquibase
   - Test migrations on staging
   - Rollback strategy
   - Zero-downtime migrations

---

### Q10: Spring Boot application has connection pool exhaustion. How do you diagnose and fix?

**Scenario:**
Application throws `HikariPool - Connection is not available` errors. Database connections are exhausted, causing requests to fail.

**Step-by-Step Solution:**

#### Step 1: Monitor Connection Pool

```java
@RestController
@RequestMapping("/admin")
public class PoolMonitorController {
    @Autowired
    private DataSource dataSource;
    
    @GetMapping("/pool/stats")
    public Map<String, Object> getPoolStats() {
        if (dataSource instanceof HikariDataSource) {
            HikariDataSource hikari = (HikariDataSource) dataSource;
            HikariPoolMXBean pool = hikari.getHikariPoolMXBean();
            
            return Map.of(
                "active", pool.getActiveConnections(),
                "idle", pool.getIdleConnections(),
                "total", pool.getTotalConnections(),
                "waiting", pool.getThreadsAwaitingConnection(),
                "max", hikari.getMaximumPoolSize()
            );
        }
        return Collections.emptyMap();
    }
}
```

#### Step 2: Identify Leaks

```yaml
# Enable leak detection
spring:
  datasource:
    hikari:
      leak-detection-threshold: 60000  # 60 seconds
```

**Common Leak Patterns:**

```java
// ❌ BAD: Connection not closed
public List<Order> getOrders() {
    Connection conn = dataSource.getConnection();
    // ... use connection
    // Never closed! Leak!
    return orders;
}

// ✅ GOOD: Use try-with-resources
public List<Order> getOrders() {
    try (Connection conn = dataSource.getConnection();
         PreparedStatement stmt = conn.prepareStatement("SELECT * FROM orders");
         ResultSet rs = stmt.executeQuery()) {
        // ... process
        return orders;
    }
}

// ✅ BETTER: Use JPA/Spring Data (handles connections)
@Repository
public interface OrderRepository extends JpaRepository<Order, String> {
    // Spring manages connections
}
```

#### Step 3: Configure Pool Properly

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000  # 30 seconds
      idle-timeout: 600000       # 10 minutes
      max-lifetime: 1800000      # 30 minutes
      leak-detection-threshold: 60000
```

**Sizing Formula:**
```
connections = ((core_count * 2) + effective_spindle_count)
```

#### Step 4: Fix Long-Running Transactions

```java
// ❌ BAD: Long transaction holds connection
@Transactional
public void processLargeBatch(List<Order> orders) {
    for (Order order : orders) {
        processOrder(order); // Takes 10 minutes total!
    }
}

// ✅ GOOD: Process in chunks
@Transactional(propagation = Propagation.REQUIRES_NEW)
public void processChunk(List<Order> chunk) {
    for (Order order : chunk) {
        processOrder(order);
    }
}

public void processLargeBatch(List<Order> orders) {
    List<List<Order>> chunks = Lists.partition(orders, 100);
    for (List<Order> chunk : chunks) {
        processChunk(chunk); // Each chunk in separate transaction
    }
}
```

#### Step 5: Use Read Replicas for Read Operations

```java
@Configuration
public class DataSourceConfig {
    @Bean
    @Primary
    public DataSource primaryDataSource() {
        // Write datasource
        return DataSourceBuilder.create()
            .url("jdbc:postgresql://primary-host/db")
            .build();
    }
    
    @Bean
    public DataSource readDataSource() {
        // Read replica
        return DataSourceBuilder.create()
            .url("jdbc:postgresql://replica-host/db")
            .build();
    }
}

// Use for read operations
@Repository
public class OrderRepository {
    @Autowired
    @Qualifier("readDataSource")
    private DataSource readDataSource;
    
    public List<Order> findAll() {
        // Use read replica
    }
}
```

**Follow-Up Questions:**

1. **Q: How do you handle connection pool exhaustion in a microservices architecture?**
   - Use service mesh for connection pooling
   - Implement circuit breakers
   - Use database connection proxies (PgBouncer)
   - Monitor and alert on pool usage

2. **Q: What's the difference between minimum-idle and maximum-pool-size?**
   - **minimum-idle**: Connections kept in pool when idle
   - **maximum-pool-size**: Maximum connections allowed
   - Set minimum-idle lower to save resources

3. **Q: How do you test connection pool behavior?**
   - Use load testing tools (JMeter, Gatling)
   - Monitor pool metrics under load
   - Test connection leak scenarios
   - Verify timeout behavior

---

*Continue to Part 3 for Concurrency, Design Patterns, and Production Debugging...*
