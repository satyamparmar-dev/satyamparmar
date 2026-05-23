# Spring Boot annotations cheat sheet

*Every annotation you use in Spring Boot — what it does, when to use it, and when to use a different one instead. Grouped by purpose, not alphabetically.*

---

## Component scanning and bean registration

| Annotation | On | What it does |
|---|---|---|
| `@SpringBootApplication` | Main class | Combines `@Configuration` + `@EnableAutoConfiguration` + `@ComponentScan`. Your app entry point. |
| `@Component` | Any class | Generic Spring-managed bean. Detected by component scan. |
| `@Service` | Business logic class | Same as `@Component` — signals to humans that this is a service layer class. No extra behaviour. |
| `@Repository` | DAO / persistence class | Same as `@Component` + enables Spring's exception translation (wraps vendor exceptions into `DataAccessException`). |
| `@RestController` | HTTP controller | `@Controller` + `@ResponseBody`. All handler methods return data, not view names. |
| `@Controller` | MVC controller | Returns view names (Thymeleaf, JSP). Use `@RestController` for REST APIs. |
| `@Configuration` | Config class | Marks as a source of `@Bean` definitions. Processed differently from `@Component` — calls to `@Bean` methods are intercepted to enforce singleton. |
| `@Bean` | Method in `@Configuration` | Registers the return value as a Spring bean. Use when you cannot annotate the class itself (third-party libraries). |

```java
// @Component vs @Bean — when to use each:

// Use @Component when you own the class:
@Service
public class OrderService { ... }

// Use @Bean when you don't own the class (e.g. configuring a library):
@Configuration
public class AppConfig {
    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper().configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }
}
```

---

## Dependency injection

| Annotation | What it does |
|---|---|
| `@Autowired` | Injects a dependency. Works on constructor, setter, and field. |
| `@Qualifier("beanName")` | Disambiguates when multiple beans of the same type exist. |
| `@Primary` | Marks a bean as the preferred choice when multiple candidates exist. |
| `@Lazy` | Creates the bean only when it is first requested, not at startup. |
| `@Value("${property.name}")` | Injects a value from `application.properties` / environment. |
| `@Value("#{expression}")` | Injects the result of a SpEL expression. |

```java
// Prefer constructor injection over @Autowired on fields:
@Service
public class OrderService {

    private final PaymentService paymentService;
    private final OrderRepository orderRepository;

    // Spring auto-injects when there is only one constructor (no @Autowired needed in Java 8+)
    public OrderService(PaymentService paymentService, OrderRepository orderRepository) {
        this.paymentService = paymentService;
        this.orderRepository = orderRepository;
    }
}

// @Value for config injection
@Service
public class NotificationService {
    @Value("${notification.email.from}")
    private String fromEmail;

    @Value("${notification.max-retries:3}")  // default value = 3
    private int maxRetries;
}

// @Qualifier — when two beans implement the same interface
@Service
@Qualifier("stripe")
public class StripePaymentGateway implements PaymentGateway { ... }

@Service
@Qualifier("paypal")
public class PaypalPaymentGateway implements PaymentGateway { ... }

// Inject the one you want:
@Autowired
@Qualifier("stripe")
private PaymentGateway paymentGateway;
```

---

## Web layer (REST controllers)

| Annotation | What it does |
|---|---|
| `@RequestMapping("/api/orders")` | Maps HTTP requests to a class or method. Specify `method`, `path`, `produces`, `consumes`. |
| `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping`, `@PatchMapping` | Shorthand for `@RequestMapping(method = ...)`. Prefer these. |
| `@PathVariable` | Extracts a value from the URL path: `/orders/{id}`. |
| `@RequestParam` | Extracts a query parameter: `/orders?status=ACTIVE`. |
| `@RequestBody` | Deserialises the HTTP request body (JSON → Java object). |
| `@ResponseBody` | Serialises the return value to the response body. Already included in `@RestController`. |
| `@ResponseStatus(HttpStatus.CREATED)` | Sets the HTTP status code for a handler method. |
| `@RequestHeader` | Extracts an HTTP header value. |
| `@Valid` / `@Validated` | Triggers Bean Validation on the annotated parameter. |

```java
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @GetMapping("/{id}")
    public OrderDto getOrder(@PathVariable Long id) { ... }

    @GetMapping
    public List<OrderDto> listOrders(
        @RequestParam(defaultValue = "ACTIVE") String status,
        @RequestParam(defaultValue = "0") int page
    ) { ... }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderDto createOrder(@RequestBody @Valid CreateOrderRequest request) { ... }

    @PutMapping("/{id}/cancel")
    public void cancelOrder(
        @PathVariable Long id,
        @RequestHeader("X-User-Id") String userId
    ) { ... }
}
```

---

## Configuration and properties

| Annotation | What it does |
|---|---|
| `@ConfigurationProperties(prefix = "app")` | Binds all properties starting with `app.` to a POJO. Safer and more readable than multiple `@Value`. |
| `@EnableConfigurationProperties(MyProps.class)` | Registers a `@ConfigurationProperties` class as a bean (needed when not using `@Component` on the props class). |
| `@PropertySource("classpath:custom.properties")` | Loads an additional properties file into the Environment. |
| `@Profile("production")` | Bean or configuration active only when the named profile is active. |
| `@ConditionalOnProperty(name = "feature.payments.enabled", havingValue = "true")` | Registers the bean only when the property has the specified value. |
| `@ConditionalOnMissingBean` | Registers the bean only if no other bean of that type is registered. Used in auto-configuration. |
| `@ConditionalOnClass(SomeClass.class)` | Registers the bean only if the class is on the classpath. |

```java
// Prefer @ConfigurationProperties over many @Value fields:
@ConfigurationProperties(prefix = "app.payments")
@Component
public class PaymentProperties {
    private String apiUrl;
    private int timeoutSeconds = 30;        // default value
    private boolean enabled = true;

    // getters and setters (or use Lombok @Data)
}

// In application.yml:
// app:
//   payments:
//     api-url: https://api.stripe.com
//     timeout-seconds: 60

// @ConditionalOnProperty — feature flags:
@Service
@ConditionalOnProperty(name = "feature.new-checkout.enabled", havingValue = "true")
public class NewCheckoutService implements CheckoutService { ... }
```

---

## Data and persistence

| Annotation | What it does |
|---|---|
| `@Entity` | JPA managed class mapped to a database table. |
| `@Table(name = "orders")` | Customises the table name. |
| `@Id` | Marks the primary key field. |
| `@GeneratedValue(strategy = GenerationType.IDENTITY)` | Auto-generates the primary key (database `AUTO_INCREMENT`). |
| `@Column(name = "total_value", nullable = false)` | Customises the column mapping. |
| `@OneToMany`, `@ManyToOne`, `@ManyToMany` | Maps JPA relationships. |
| `@Transactional` | Wraps a method or class in a database transaction. |
| `@Query("SELECT o FROM Order o WHERE ...")` | Custom JPQL query on a Spring Data repository method. |
| `@Modifying` | Marks an `@Query` as an `UPDATE` or `DELETE` (not a `SELECT`). |

```java
// @Transactional — key rules:
@Service
public class OrderService {

    // Method-level transaction — most common
    @Transactional
    public void confirmOrder(Long orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow();
        order.setStatus(CONFIRMED);
        paymentService.charge(order);  // any exception rolls back the whole transaction
    }

    // Read-only hint — allows query optimizations in some JPA providers
    @Transactional(readOnly = true)
    public List<Order> findActiveOrders() {
        return orderRepository.findByStatus(ACTIVE);
    }

    // Propagation: requires a new transaction even if one already exists
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAuditEvent(Long orderId, String event) { ... }
}

// @Query on repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("SELECT o FROM Order o WHERE o.status = :status AND o.customerId = :customerId")
    List<Order> findByStatusAndCustomer(@Param("status") OrderStatus status,
                                        @Param("customerId") Long customerId);

    @Modifying
    @Transactional
    @Query("UPDATE Order o SET o.status = 'CANCELLED' WHERE o.createdAt < :cutoff")
    int cancelOldOrders(@Param("cutoff") LocalDateTime cutoff);
}
```

---

## Scheduling and async

| Annotation | What it does |
|---|---|
| `@EnableScheduling` | Enables `@Scheduled` — put on a `@Configuration` class. |
| `@Scheduled(fixedRate = 60000)` | Runs the method every N milliseconds. |
| `@Scheduled(cron = "0 0 2 * * ?")` | Cron expression — 2 AM every day. |
| `@EnableAsync` | Enables `@Async` — put on a `@Configuration` class. |
| `@Async` | Runs the method in a separate thread pool. Returns `CompletableFuture<T>` or `void`. |

```java
@EnableScheduling
@EnableAsync
@SpringBootApplication
public class Application { ... }

@Component
public class DataSyncJob {

    // Fixed rate: every 5 minutes
    @Scheduled(fixedRate = 300_000)
    public void syncOrders() { ... }

    // Cron: every day at 2:30 AM
    @Scheduled(cron = "0 30 2 * * ?")
    public void generateDailyReport() { ... }

    // Fixed delay: 10 seconds after the previous run COMPLETES
    @Scheduled(fixedDelay = 10_000)
    public void cleanupTempFiles() { ... }
}

@Service
public class EmailService {

    // Runs in a separate thread — caller gets back immediately
    @Async
    public CompletableFuture<Void> sendWelcomeEmail(String email) {
        // ... send email
        return CompletableFuture.completedFuture(null);
    }
}
```

---

## Validation

| Annotation | What it does |
|---|---|
| `@NotNull` | Field must not be null. |
| `@NotBlank` | String must not be null or blank. |
| `@NotEmpty` | Collection or string must not be empty. |
| `@Min(1)` / `@Max(100)` | Numeric range constraints. |
| `@Size(min=2, max=50)` | String or collection size. |
| `@Email` | Must be a valid email format. |
| `@Pattern(regexp = "...")` | Must match the regex. |
| `@Valid` | Triggers validation on a nested object or method parameter. |
| `@Validated` | Class-level equivalent of `@Valid`; enables group validation. |

```java
public record CreateOrderRequest(
    @NotNull Long customerId,
    @NotEmpty List<@Valid OrderItem> items,
    @Size(max = 500) String notes
) {}

public record OrderItem(
    @NotBlank String productId,
    @Min(1) @Max(1000) int quantity
) {}

// In controller — @Valid triggers validation:
@PostMapping
public OrderDto create(@RequestBody @Valid CreateOrderRequest request) { ... }

// Global exception handler for validation errors:
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
          .forEach(e -> errors.put(e.getField(), e.getDefaultMessage()));
        return errors;
    }
}
```

---

## Testing

| Annotation | What it does |
|---|---|
| `@SpringBootTest` | Loads the full application context. Integration tests. |
| `@WebMvcTest(OrderController.class)` | Only loads the web layer — fast controller tests without full context. |
| `@DataJpaTest` | Only loads JPA layer with an in-memory database. |
| `@MockBean` | Creates a Mockito mock and registers it in the Spring context. |
| `@SpyBean` | Creates a Spy (partial mock) in the Spring context. |
| `@TestConfiguration` | Defines beans that override real beans in tests only. |
| `@ActiveProfiles("test")` | Activates the `test` profile for a test class. |
| `@Sql("/init.sql")` | Runs SQL before a test method or class. |

```java
// Slice test — only web layer, dependencies mocked:
@WebMvcTest(OrderController.class)
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private OrderService orderService;

    @Test
    void shouldReturn200ForActiveOrder() throws Exception {
        when(orderService.findById(1L)).thenReturn(Optional.of(testOrder()));

        mockMvc.perform(get("/api/orders/1"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.status").value("ACTIVE"));
    }
}
```
