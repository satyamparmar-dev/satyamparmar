# Enterprise Integration Patterns

> ### What will you learn?
> - How Kafka-based microservices coordinate work without tight coupling.
> - Why patterns like Saga, Outbox, and Circuit Breaker are used in enterprise apps.
> - How to design safer event-driven flows for real business operations.

## 📚 Table of Contents
1. [Event-Driven Microservices](#event-driven-microservices)
2. [CQRS and Event Sourcing](#cqrs-and-event-sourcing)
3. [Saga Pattern](#saga-pattern)
4. [Request-Reply Pattern](#request-reply-pattern)
5. [Outbox Pattern](#outbox-pattern)
6. [Circuit Breaker Pattern](#circuit-breaker-pattern)

---

## Event-Driven Microservices

### Architecture Overview

Event-driven microservices communicate through events published to Kafka topics, enabling loose coupling and scalability.

In plain English: services do not call each other directly for every step. They share updates through Kafka events.

### Example: Order Processing System

**Order Service (Producer):**
```java
@Service
public class OrderService {
    
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final OrderRepository orderRepository;
    
    public Order createOrder(OrderRequest request) {
        Order order = new Order(request);
        order = orderRepository.save(order);
        
        // Publish event
        OrderCreatedEvent event = new OrderCreatedEvent(
            order.getId(),
            order.getUserId(),
            order.getTotalAmount(),
            order.getItems()
        );
        
        kafkaTemplate.send("order-created", order.getId(), event);
        
        return order;
    }
}
```

**Payment Service (Consumer):**
```java
@Service
public class PaymentService {
    
    @KafkaListener(topics = "order-created", groupId = "payment-service")
    public void processPayment(
            @Payload OrderCreatedEvent event,
            Acknowledgment acknowledgment) {
        
        try {
            Payment payment = processPayment(event);
            
            // Publish payment event
            PaymentProcessedEvent paymentEvent = new PaymentProcessedEvent(
                payment.getId(),
                event.getOrderId(),
                payment.getStatus()
            );
            
            kafkaTemplate.send("payment-processed", event.getOrderId(), paymentEvent);
            
            acknowledgment.acknowledge();
            
        } catch (Exception e) {
            logger.error("Payment processing failed", e);
            // Send to dead-letter queue
        }
    }
}
```

**Inventory Service (Consumer):**
```java
@Service
public class InventoryService {
    
    @KafkaListener(topics = "order-created", groupId = "inventory-service")
    public void reserveInventory(
            @Payload OrderCreatedEvent event,
            Acknowledgment acknowledgment) {
        
        try {
            reserveItems(event.getItems());
            
            InventoryReservedEvent inventoryEvent = new InventoryReservedEvent(
                event.getOrderId(),
                event.getItems()
            );
            
            kafkaTemplate.send("inventory-reserved", event.getOrderId(), inventoryEvent);
            
            acknowledgment.acknowledge();
            
        } catch (Exception e) {
            logger.error("Inventory reservation failed", e);
        }
    }
}
```

### Event Schema

```java
public class OrderCreatedEvent {
    private String orderId;
    private String userId;
    private BigDecimal totalAmount;
    private List<OrderItem> items;
    private LocalDateTime timestamp;
    
    // Constructors, Getters, Setters
}
```

**Quick Check:** Why is loose coupling useful when multiple teams build different services?

---

## CQRS and Event Sourcing

In plain English: CQRS splits write and read logic, and Event Sourcing stores changes as events.

### CQRS (Command Query Responsibility Segregation)

**Command Side (Write):**
```java
@Service
public class OrderCommandService {
    
    private final KafkaTemplate<String, Object> kafkaTemplate;
    
    public void createOrder(OrderCommand command) {
        // Validate command
        validateCommand(command);
        
        // Publish command event
        OrderCommandEvent event = new OrderCommandEvent(
            UUID.randomUUID().toString(),
            command.getUserId(),
            command.getItems(),
            LocalDateTime.now()
        );
        
        kafkaTemplate.send("order-commands", event.getOrderId(), event);
    }
}
```

**Query Side (Read):**
```java
@Service
public class OrderQueryService {
    
    private final OrderReadRepository readRepository;
    
    @KafkaListener(topics = "order-events", groupId = "order-query-service")
    public void updateReadModel(
            @Payload OrderEvent event,
            Acknowledgment acknowledgment) {
        
        // Update read model
        OrderReadModel readModel = readRepository.findByOrderId(event.getOrderId())
            .orElse(new OrderReadModel(event.getOrderId()));
        
        readModel.apply(event);
        readRepository.save(readModel);
        
        acknowledgment.acknowledge();
    }
    
    public OrderDTO getOrder(String orderId) {
        return readRepository.findByOrderId(orderId)
            .map(this::toDTO)
            .orElseThrow(() -> new OrderNotFoundException(orderId));
    }
}
```

### Event Sourcing

**Event Store:**
```java
@Service
public class EventStore {
    
    private final KafkaTemplate<String, Object> kafkaTemplate;
    
    public void appendEvent(String aggregateId, DomainEvent event) {
        // Store event in Kafka (event log)
        kafkaTemplate.send("event-store", aggregateId, event);
    }
    
    public List<DomainEvent> getEvents(String aggregateId) {
        // Read events from Kafka
        // This is simplified - in practice, use Kafka Streams or consumer
        return Collections.emptyList();
    }
}
```

**Aggregate:**
```java
public class OrderAggregate {
    private String orderId;
    private OrderStatus status;
    private List<DomainEvent> uncommittedEvents = new ArrayList<>();
    
    public void createOrder(OrderCommand command) {
        OrderCreatedEvent event = new OrderCreatedEvent(
            orderId,
            command.getUserId(),
            command.getItems()
        );
        
        apply(event);
        uncommittedEvents.add(event);
    }
    
    private void apply(OrderCreatedEvent event) {
        this.orderId = event.getOrderId();
        this.status = OrderStatus.CREATED;
    }
    
    public List<DomainEvent> getUncommittedEvents() {
        return uncommittedEvents;
    }
    
    public void markEventsAsCommitted() {
        uncommittedEvents.clear();
    }
}
```

**Quick Check:** What advantage do you get by keeping an event history instead of only final state?

---

## Saga Pattern

In plain English: Saga manages a business process across services by chaining events and handling rollback steps.

### Orchestration-Based Saga

**Saga Orchestrator:**
```java
@Service
public class OrderSagaOrchestrator {
    
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final SagaStateRepository sagaStateRepository;
    
    @KafkaListener(topics = "order-created", groupId = "saga-orchestrator")
    public void startSaga(@Payload OrderCreatedEvent event) {
        SagaState saga = new SagaState(event.getOrderId());
        sagaStateRepository.save(saga);
        
        // Step 1: Reserve inventory
        ReserveInventoryCommand command = new ReserveInventoryCommand(
            event.getOrderId(),
            event.getItems()
        );
        kafkaTemplate.send("inventory-commands", event.getOrderId(), command);
    }
    
    @KafkaListener(topics = "inventory-reserved", groupId = "saga-orchestrator")
    public void onInventoryReserved(@Payload InventoryReservedEvent event) {
        SagaState saga = sagaStateRepository.findByOrderId(event.getOrderId())
            .orElseThrow();
        
        saga.markInventoryReserved();
        sagaStateRepository.save(saga);
        
        // Step 2: Process payment
        ProcessPaymentCommand command = new ProcessPaymentCommand(
            event.getOrderId(),
            saga.getTotalAmount()
        );
        kafkaTemplate.send("payment-commands", event.getOrderId(), command);
    }
    
    @KafkaListener(topics = "payment-processed", groupId = "saga-orchestrator")
    public void onPaymentProcessed(@Payload PaymentProcessedEvent event) {
        SagaState saga = sagaStateRepository.findByOrderId(event.getOrderId())
            .orElseThrow();
        
        if (event.getStatus() == PaymentStatus.SUCCESS) {
            saga.markPaymentProcessed();
            sagaStateRepository.save(saga);
            
            // Step 3: Confirm order
            ConfirmOrderCommand command = new ConfirmOrderCommand(event.getOrderId());
            kafkaTemplate.send("order-commands", event.getOrderId(), command);
        } else {
            // Compensate: Release inventory
            compensateInventory(event.getOrderId());
        }
    }
    
    private void compensateInventory(String orderId) {
        ReleaseInventoryCommand command = new ReleaseInventoryCommand(orderId);
        kafkaTemplate.send("inventory-commands", orderId, command);
    }
}
```

### Choreography-Based Saga

**Each service handles its own compensation:**
```java
@Service
public class PaymentService {
    
    @KafkaListener(topics = "order-created", groupId = "payment-service")
    public void processPayment(@Payload OrderCreatedEvent event) {
        try {
            Payment payment = processPayment(event);
            kafkaTemplate.send("payment-processed", event.getOrderId(), 
                new PaymentProcessedEvent(payment));
        } catch (Exception e) {
            // Publish failure event
            kafkaTemplate.send("payment-failed", event.getOrderId(), 
                new PaymentFailedEvent(event.getOrderId(), e.getMessage()));
        }
    }
    
    @KafkaListener(topics = "order-cancelled", groupId = "payment-service")
    public void refundPayment(@Payload OrderCancelledEvent event) {
        // Compensating transaction: refund
        refundPayment(event.getOrderId());
    }
}
```

**Quick Check:** In your own words, how is orchestration different from choreography?

---

## Request-Reply Pattern

In plain English: this pattern gives request-response behavior while still using asynchronous Kafka topics.

### Request-Reply Implementation

**Request Service:**
```java
@Service
public class RequestReplyService {
    
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final Map<String, CompletableFuture<Object>> pendingRequests = new ConcurrentHashMap<>();
    
    public <T> CompletableFuture<T> sendRequest(String topic, Object request, Class<T> responseType) {
        String correlationId = UUID.randomUUID().toString();
        
        CompletableFuture<T> future = new CompletableFuture<>();
        pendingRequests.put(correlationId, (CompletableFuture<Object>) future);
        
        // Send request with correlation ID
        RequestMessage requestMessage = new RequestMessage(correlationId, request);
        kafkaTemplate.send(topic, correlationId, requestMessage);
        
        // Timeout handling
        ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
        scheduler.schedule(() -> {
            if (pendingRequests.remove(correlationId) != null) {
                future.completeExceptionally(new TimeoutException("Request timeout"));
            }
        }, 30, TimeUnit.SECONDS);
        
        return future;
    }
    
    @KafkaListener(topics = "response-topic", groupId = "request-service")
    public void handleResponse(@Payload ResponseMessage response) {
        CompletableFuture<Object> future = pendingRequests.remove(response.getCorrelationId());
        if (future != null) {
            future.complete(response.getPayload());
        }
    }
}
```

**Reply Service:**
```java
@Service
public class ReplyService {
    
    @KafkaListener(topics = "request-topic", groupId = "reply-service")
    public void handleRequest(@Payload RequestMessage request) {
        // Process request
        Object response = processRequest(request.getPayload());
        
        // Send response with same correlation ID
        ResponseMessage responseMessage = new ResponseMessage(
            request.getCorrelationId(),
            response
        );
        
        kafkaTemplate.send("response-topic", request.getCorrelationId(), responseMessage);
    }
}
```

**Quick Check:** Why is a correlation ID needed in request-reply messaging?

---

## Outbox Pattern

### Problem

Ensuring database transaction and Kafka message publication are atomic.

In plain English: we want to avoid a case where DB write succeeds but event publish fails (or vice versa).

### Solution: Outbox Pattern

**Outbox Entity:**
```java
@Entity
@Table(name = "outbox")
public class OutboxEvent {
    @Id
    private String id;
    private String aggregateId;
    private String eventType;
    private String payload;
    private LocalDateTime createdAt;
    private boolean published;
}
```

**Transactional Service:**
```java
@Service
@Transactional
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final OutboxRepository outboxRepository;
    
    public Order createOrder(OrderRequest request) {
        // 1. Save order (database transaction)
        Order order = new Order(request);
        order = orderRepository.save(order);
        
        // 2. Save event to outbox (same transaction)
        OutboxEvent outboxEvent = new OutboxEvent(
            UUID.randomUUID().toString(),
            order.getId(),
            "OrderCreated",
            serialize(new OrderCreatedEvent(order)),
            LocalDateTime.now(),
            false
        );
        outboxRepository.save(outboxEvent);
        
        // Transaction commits - both order and outbox event are saved
        return order;
    }
}
```

**Outbox Publisher (Separate Process):**
```java
@Service
public class OutboxPublisher {
    
    private final OutboxRepository outboxRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    
    @Scheduled(fixedDelay = 1000) // Poll every second
    public void publishOutboxEvents() {
        List<OutboxEvent> unpublishedEvents = outboxRepository.findByPublishedFalse();
        
        for (OutboxEvent event : unpublishedEvents) {
            try {
                // Publish to Kafka
                kafkaTemplate.send("order-events", event.getAggregateId(), 
                    deserialize(event.getPayload()));
                
                // Mark as published
                event.setPublished(true);
                outboxRepository.save(event);
                
            } catch (Exception e) {
                logger.error("Failed to publish outbox event", e);
            }
        }
    }
}
```

**Quick Check:** Why does the outbox event use a `published` flag?

---

## Circuit Breaker Pattern

In plain English: circuit breaker stops repeated calls to a failing dependency so the whole system stays stable.

### Circuit Breaker with Resilience4j

**Dependencies:**
```xml
<dependency>
    <groupId>io.github.resilience4j</groupId>
    <artifactId>resilience4j-spring-boot2</artifactId>
</dependency>
```

**Configuration:**
```yaml
resilience4j:
  circuitbreaker:
    instances:
      kafkaProducer:
        registerHealthIndicator: true
        slidingWindowSize: 10
        minimumNumberOfCalls: 5
        permittedNumberOfCallsInHalfOpenState: 3
        automaticTransitionFromOpenToHalfOpenEnabled: true
        waitDurationInOpenState: 10s
        failureRateThreshold: 50
        eventConsumerBufferSize: 10
```

**Usage:**
```java
@Service
public class ResilientProducerService {
    
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final CircuitBreaker circuitBreaker;
    
    public ResilientProducerService(
            KafkaTemplate<String, Object> kafkaTemplate,
            CircuitBreakerRegistry circuitBreakerRegistry) {
        this.kafkaTemplate = kafkaTemplate;
        this.circuitBreaker = circuitBreakerRegistry.circuitBreaker("kafkaProducer");
    }
    
    public void sendMessage(String topic, String key, Object message) {
        Supplier<Void> kafkaOperation = () -> {
            kafkaTemplate.send(topic, key, message);
            return null;
        };
        
        Supplier<Void> decoratedOperation = CircuitBreaker
            .decorateSupplier(circuitBreaker, kafkaOperation);
        
        Try.ofSupplier(decoratedOperation)
            .onFailure(throwable -> {
                logger.error("Circuit breaker opened or operation failed", throwable);
                // Fallback: Store in database for later retry
            })
            .get();
    }
}
```

**Quick Check:** What is the purpose of a fallback when the circuit is open?

---

## Summary

### Key Patterns

1. **Event-Driven Microservices**: Loose coupling through events
2. **CQRS**: Separate read and write models
3. **Event Sourcing**: Store events as source of truth
4. **Saga**: Distributed transaction management
5. **Request-Reply**: Synchronous communication over async
6. **Outbox**: Ensure transactional consistency
7. **Circuit Breaker**: Fault tolerance and resilience

### Best Practices

- Use idempotent operations
- Implement proper error handling
- Monitor and alert on failures
- Design for eventual consistency
- Use correlation IDs for tracing

### Next Steps

- Build [Complete Application](./05-step-by-step-guide.md)
- Review [Architecture Diagrams](./diagrams/)
- Implement patterns in your projects

**Quick Check:** Which one pattern from this file would you implement first in a fresher project and why?

What's next? Continue with [Step-by-Step Application Guide](./05-step-by-step-guide.md).
