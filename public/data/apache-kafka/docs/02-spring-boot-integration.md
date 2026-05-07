# Spring Boot Integration with Kafka

> ### What will you learn?
> - How to connect a Spring Boot app to Kafka using `spring-kafka`.
> - How producer and consumer code is written in real projects.
> - How to configure retries, transactions, and tests for safer message flow.

## 📚 Table of Contents
1. [Introduction](#introduction)
2. [Project Setup](#project-setup)
3. [Producer Implementation](#producer-implementation)
4. [Consumer Implementation](#consumer-implementation)
5. [Configuration Best Practices](#configuration-best-practices)
6. [Error Handling and Retries](#error-handling-and-retries)
7. [Transactions](#transactions)
8. [Testing](#testing)

---

## Introduction

**Spring Boot Kafka** provides integration between Spring Boot applications and Apache Kafka using the `spring-kafka` library.

In plain English: you can send and receive Kafka messages without writing low-level Kafka setup code from scratch.

### Key Components

1. **KafkaTemplate**: High-level API for sending messages
2. **@KafkaListener**: Annotation-based consumer
3. **KafkaAdmin**: Topic management
4. **ConcurrentMessageListenerContainer**: Consumer container

**Quick Check:** Which component would you use to send a message from your service code?

---

## Project Setup

### Maven Dependencies

```xml
<dependencies>
    <!-- Spring Boot Starter -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter</artifactId>
    </dependency>
    
    <!-- Spring Kafka -->
    <dependency>
        <groupId>org.springframework.kafka</groupId>
        <artifactId>spring-kafka</artifactId>
    </dependency>
    
    <!-- JSON Serialization -->
    <dependency>
        <groupId>org.springframework.kafka</groupId>
        <artifactId>spring-kafka</artifactId>
    </dependency>
    
    <!-- Jackson for JSON -->
    <dependency>
        <groupId>com.fasterxml.jackson.core</groupId>
        <artifactId>jackson-databind</artifactId>
    </dependency>
    
    <!-- Validation -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
</dependencies>
```

### Application Properties

**application.yml** (Recommended):
```yaml
spring:
  application:
    name: kafka-producer-service
  
  kafka:
    # Bootstrap servers
    bootstrap-servers: localhost:9092
    
    # Producer Configuration
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
      acks: all                    # Wait for all replicas
      retries: 3                   # Retry 3 times
      batch-size: 16384            # 16KB batch size
      linger-ms: 10                # Wait 10ms to batch
      buffer-memory: 33554432      # 32MB buffer
      compression-type: snappy     # Compress messages
      enable-idempotence: true     # Exactly-once semantics
      max-in-flight-requests-per-connection: 5
      
    # Consumer Configuration
    consumer:
      group-id: ${spring.application.name}-group
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
      auto-offset-reset: earliest  # earliest, latest, none
      enable-auto-commit: false    # Manual offset commit
      max-poll-records: 500        # Max records per poll
      max-poll-interval-ms: 300000 # 5 minutes
      session-timeout-ms: 30000    # 30 seconds
      heartbeat-interval-ms: 3000  # 3 seconds
      
    # Listener Configuration
    listener:
      ack-mode: manual_immediate   # Manual acknowledgment
      concurrency: 3               # 3 consumer threads
      type: batch                  # Batch processing
```

**application.properties** (Alternative):
```properties
spring.kafka.bootstrap-servers=localhost:9092
spring.kafka.producer.key-serializer=org.apache.kafka.common.serialization.StringSerializer
spring.kafka.producer.value-serializer=org.springframework.kafka.support.serializer.JsonSerializer
spring.kafka.producer.acks=all
spring.kafka.producer.retries=3
spring.kafka.consumer.group-id=my-group
spring.kafka.consumer.auto-offset-reset=earliest
```

In plain English: the YAML and properties files define how your app talks to Kafka brokers, serializes data, and handles offsets.

**Quick Check:** Why is `bootstrap-servers` required before anything else can work?

---

## Producer Implementation

In plain English: a producer is the sender part of your app. It builds an event and pushes it to a Kafka topic.

### Basic Producer Service

```java
package com.example.kafka.producer;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;
import org.springframework.util.concurrent.ListenableFuture;
import org.springframework.util.concurrent.ListenableFutureCallback;

@Service
public class KafkaProducerService {
    
    private static final Logger logger = LoggerFactory.getLogger(KafkaProducerService.class);
    
    private final KafkaTemplate<String, Object> kafkaTemplate;
    
    public KafkaProducerService(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }
    
    /**
     * Send message synchronously
     */
    public void sendMessage(String topic, String key, Object message) {
        try {
            kafkaTemplate.send(topic, key, message);
            logger.info("Message sent successfully to topic: {}, key: {}", topic, key);
        } catch (Exception e) {
            logger.error("Error sending message to topic: {}", topic, e);
            throw new RuntimeException("Failed to send message", e);
        }
    }
    
    /**
     * Send message asynchronously with callback
     */
    public void sendMessageAsync(String topic, String key, Object message) {
        ListenableFuture<SendResult<String, Object>> future = 
            kafkaTemplate.send(topic, key, message);
        
        future.addCallback(new ListenableFutureCallback<SendResult<String, Object>>() {
            @Override
            public void onSuccess(SendResult<String, Object> result) {
                logger.info("Message sent successfully: topic={}, partition={}, offset={}",
                    result.getRecordMetadata().topic(),
                    result.getRecordMetadata().partition(),
                    result.getRecordMetadata().offset());
            }
            
            @Override
            public void onFailure(Throwable ex) {
                logger.error("Failed to send message: topic={}, key={}", topic, key, ex);
                // Implement retry logic or dead-letter queue
            }
        });
    }
    
    /**
     * Send message to specific partition
     */
    public void sendToPartition(String topic, int partition, String key, Object message) {
        kafkaTemplate.send(topic, partition, key, message);
    }
}
```

### Producer with DTO

```java
package com.example.kafka.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

public class UserEvent {
    
    @JsonProperty("userId")
    private String userId;
    
    @JsonProperty("eventType")
    private String eventType;
    
    @JsonProperty("timestamp")
    private LocalDateTime timestamp;
    
    @JsonProperty("data")
    private Object data;
    
    // Constructors, Getters, Setters
    public UserEvent() {
        this.timestamp = LocalDateTime.now();
    }
    
    public UserEvent(String userId, String eventType, Object data) {
        this.userId = userId;
        this.eventType = eventType;
        this.data = data;
        this.timestamp = LocalDateTime.now();
    }
    
    // Getters and Setters
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }
    
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    
    public Object getData() { return data; }
    public void setData(Object data) { this.data = data; }
}
```

### Using Producer in Controller

```java
package com.example.kafka.controller;

import com.example.kafka.dto.UserEvent;
import com.example.kafka.producer.KafkaProducerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events")
public class EventController {
    
    private final KafkaProducerService producerService;
    
    public EventController(KafkaProducerService producerService) {
        this.producerService = producerService;
    }
    
    @PostMapping("/user")
    public ResponseEntity<String> publishUserEvent(@RequestBody UserEvent event) {
        try {
            // Use userId as key for partitioning
            producerService.sendMessageAsync("user-events", event.getUserId(), event);
            return ResponseEntity.ok("Event published successfully");
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body("Failed to publish event: " + e.getMessage());
        }
    }
}
```

### Producer Configuration Class

```java
package com.example.kafka.config;

import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.support.serializer.JsonSerializer;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaProducerConfig {
    
    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;
    
    @Bean
    public ProducerFactory<String, Object> producerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        
        // Idempotence for exactly-once semantics
        configProps.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);
        configProps.put(ProducerConfig.ACKS_CONFIG, "all");
        configProps.put(ProducerConfig.RETRIES_CONFIG, 3);
        configProps.put(ProducerConfig.MAX_IN_FLIGHT_REQUESTS_PER_CONNECTION, 5);
        
        // Performance tuning
        configProps.put(ProducerConfig.BATCH_SIZE_CONFIG, 16384);
        configProps.put(ProducerConfig.LINGER_MS_CONFIG, 10);
        configProps.put(ProducerConfig.COMPRESSION_TYPE_CONFIG, "snappy");
        configProps.put(ProducerConfig.BUFFER_MEMORY_CONFIG, 33554432);
        
        return new DefaultKafkaProducerFactory<>(configProps);
    }
    
    @Bean
    public KafkaTemplate<String, Object> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }
}
```

**Quick Check:** Why might you choose `sendMessageAsync` instead of a blocking send call?

---

## Consumer Implementation

In plain English: a consumer is the receiver part of your app. It reads, processes, and acknowledges events.

### Basic Consumer with @KafkaListener

```java
package com.example.kafka.consumer;

import com.example.kafka.dto.UserEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

@Service
public class KafkaConsumerService {
    
    private static final Logger logger = LoggerFactory.getLogger(KafkaConsumerService.class);
    
    /**
     * Single message consumer
     */
    @KafkaListener(
        topics = "user-events",
        groupId = "user-events-group",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumeUserEvent(
            @Payload UserEvent event,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset,
            Acknowledgment acknowledgment) {
        
        try {
            logger.info("Received message: topic={}, partition={}, offset={}, userId={}",
                topic, partition, offset, event.getUserId());
            
            // Process the event
            processUserEvent(event);
            
            // Manually acknowledge
            acknowledgment.acknowledge();
            
        } catch (Exception e) {
            logger.error("Error processing message: topic={}, offset={}", topic, offset, e);
            // Don't acknowledge - message will be retried
            // Or send to dead-letter queue
        }
    }
    
    /**
     * Batch consumer (processes multiple messages at once)
     */
    @KafkaListener(
        topics = "user-events",
        groupId = "user-events-batch-group",
        containerFactory = "batchKafkaListenerContainerFactory"
    )
    public void consumeUserEventsBatch(
            @Payload java.util.List<UserEvent> events,
            Acknowledgment acknowledgment) {
        
        logger.info("Received batch of {} messages", events.size());
        
        try {
            for (UserEvent event : events) {
                processUserEvent(event);
            }
            
            acknowledgment.acknowledge();
            
        } catch (Exception e) {
            logger.error("Error processing batch", e);
            // Handle error - retry or dead-letter queue
        }
    }
    
    private void processUserEvent(UserEvent event) {
        // Business logic here
        logger.info("Processing event: userId={}, eventType={}", 
            event.getUserId(), event.getEventType());
        
        // Example: Save to database, call external service, etc.
    }
}
```

### Consumer Configuration

```java
package com.example.kafka.config;

import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.listener.ContainerProperties;
import org.springframework.kafka.support.serializer.JsonDeserializer;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaConsumerConfig {
    
    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;
    
    @Bean
    public ConsumerFactory<String, Object> consumerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        configProps.put(ConsumerConfig.GROUP_ID_CONFIG, "default-group");
        configProps.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        configProps.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class);
        
        // Offset management
        configProps.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        configProps.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, false);
        
        // Performance tuning
        configProps.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, 500);
        configProps.put(ConsumerConfig.MAX_POLL_INTERVAL_MS_CONFIG, 300000);
        configProps.put(ConsumerConfig.SESSION_TIMEOUT_MS_CONFIG, 30000);
        configProps.put(ConsumerConfig.HEARTBEAT_INTERVAL_MS_CONFIG, 3000);
        
        // JSON Deserializer configuration
        configProps.put(JsonDeserializer.TRUSTED_PACKAGES, "*");
        configProps.put(JsonDeserializer.VALUE_DEFAULT_TYPE, "com.example.kafka.dto.UserEvent");
        
        return new DefaultKafkaConsumerFactory<>(configProps);
    }
    
    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, Object> kafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, Object> factory = 
            new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory());
        
        // Manual acknowledgment
        factory.getContainerProperties().setAckMode(ContainerProperties.AckMode.MANUAL_IMMEDIATE);
        
        // Error handling
        factory.setCommonErrorHandler(new org.springframework.kafka.listener.DefaultErrorHandler());
        
        return factory;
    }
    
    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, Object> batchKafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, Object> factory = 
            new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory());
        factory.setBatchListener(true); // Enable batch processing
        factory.getContainerProperties().setAckMode(ContainerProperties.AckMode.MANUAL_IMMEDIATE);
        return factory;
    }
}
```

**Quick Check:** What is the benefit of manual acknowledgment in a consumer?

---

## Configuration Best Practices

In plain English: these settings help you balance reliability and performance in real production environments.

### Production-Ready Configuration

```yaml
spring:
  kafka:
    bootstrap-servers: ${KAFKA_BROKERS:localhost:9092}
    
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
      
      # Reliability
      acks: all
      retries: 2147483647  # Max retries
      enable-idempotence: true
      max-in-flight-requests-per-connection: 5
      
      # Performance
      batch-size: 32768
      linger-ms: 20
      compression-type: snappy
      buffer-memory: 67108864
      
      # Timeouts
      request-timeout-ms: 30000
      delivery-timeout-ms: 120000
      
    consumer:
      group-id: ${spring.application.name}-${ENVIRONMENT:dev}
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
      
      # Offset management
      auto-offset-reset: earliest
      enable-auto-commit: false
      
      # Performance
      max-poll-records: 500
      max-poll-interval-ms: 300000
      fetch-min-size: 1
      fetch-max-wait-ms: 500
      
      # Session management
      session-timeout-ms: 30000
      heartbeat-interval-ms: 3000
      
    listener:
      ack-mode: manual_immediate
      concurrency: 3
      type: batch
```

### Environment-Specific Configuration

**application-dev.yml:**
```yaml
spring:
  kafka:
    bootstrap-servers: localhost:9092
    consumer:
      group-id: ${spring.application.name}-dev
```

**application-prod.yml:**
```yaml
spring:
  kafka:
    bootstrap-servers: kafka1:9092,kafka2:9092,kafka3:9092
    consumer:
      group-id: ${spring.application.name}-prod
    producer:
      compression-type: lz4  # Better compression for production
```

**Quick Check:** Why do we keep separate configuration for dev and prod?

---

## Error Handling and Retries

In plain English: when message processing fails, we retry first and then move bad messages to a dead-letter topic.

### Custom Error Handler

```java
package com.example.kafka.config;

import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.listener.CommonErrorHandler;
import org.springframework.kafka.listener.MessageListenerContainer;
import org.springframework.stereotype.Component;

@Component
public class KafkaErrorHandler implements CommonErrorHandler {
    
    private static final Logger logger = LoggerFactory.getLogger(KafkaErrorHandler.class);
    private final KafkaTemplate<String, Object> kafkaTemplate;
    
    public KafkaErrorHandler(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }
    
    @Override
    public void handleOtherException(
            Exception thrownException,
            Consumer<?, ?> consumer,
            MessageListenerContainer container,
            boolean batchListener) {
        
        logger.error("Kafka listener error", thrownException);
        // Implement custom error handling
    }
    
    @Override
    public void handleRecord(
            Exception thrownException,
            ConsumerRecord<?, ?> record,
            Consumer<?, ?> consumer,
            MessageListenerContainer container) {
        
        logger.error("Error processing record: topic={}, partition={}, offset={}",
            record.topic(), record.partition(), record.offset(), thrownException);
        
        // Send to dead-letter topic
        try {
            kafkaTemplate.send("dead-letter-topic", record.key(), record.value());
            logger.info("Message sent to dead-letter topic");
        } catch (Exception e) {
            logger.error("Failed to send to dead-letter topic", e);
        }
    }
}
```

### Retry Configuration

```java
@Configuration
public class RetryConfig {
    
    @Bean
    public RetryTemplate retryTemplate() {
        RetryTemplate retryTemplate = new RetryTemplate();
        
        FixedBackOffPolicy backOffPolicy = new FixedBackOffPolicy();
        backOffPolicy.setBackOffPeriod(2000); // 2 seconds
        retryTemplate.setBackOffPolicy(backOffPolicy);
        
        SimpleRetryPolicy retryPolicy = new SimpleRetryPolicy();
        retryPolicy.setMaxAttempts(3);
        retryTemplate.setRetryPolicy(retryPolicy);
        
        return retryTemplate;
    }
}
```

### Consumer with Retry

```java
@Service
public class RetryableConsumerService {
    
    private final RetryTemplate retryTemplate;
    
    @KafkaListener(topics = "user-events", groupId = "retry-group")
    public void consumeWithRetry(
            @Payload UserEvent event,
            Acknowledgment acknowledgment) {
        
        try {
            retryTemplate.execute(context -> {
                processUserEvent(event);
                return null;
            });
            
            acknowledgment.acknowledge();
            
        } catch (Exception e) {
            logger.error("Failed after retries", e);
            // Send to dead-letter queue
        }
    }
}
```

**Quick Check:** What problem does a dead-letter topic solve?

---

## Transactions

In plain English: transactions help ensure a group of Kafka writes succeeds together or fails together.

### Transactional Producer

```java
@Configuration
public class TransactionalKafkaConfig {
    
    @Bean
    public ProducerFactory<String, Object> transactionalProducerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        // ... existing config ...
        
        // Enable transactions
        configProps.put(ProducerConfig.TRANSACTIONAL_ID_CONFIG, "tx-producer-1");
        configProps.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);
        
        return new DefaultKafkaProducerFactory<>(configProps);
    }
    
    @Bean
    public KafkaTransactionManager<String, Object> kafkaTransactionManager() {
        return new KafkaTransactionManager<>(transactionalProducerFactory());
    }
}
```

### Using Transactions

```java
@Service
@Transactional
public class TransactionalProducerService {
    
    private final KafkaTemplate<String, Object> kafkaTemplate;
    
    public void publishEventsInTransaction(List<UserEvent> events) {
        kafkaTemplate.executeInTransaction(operations -> {
            for (UserEvent event : events) {
                operations.send("user-events", event.getUserId(), event);
            }
            return null;
        });
    }
}
```

**Quick Check:** When would transactional publishing be more useful than normal publishing?

---

## Testing

In plain English: this test setup starts an embedded Kafka broker so producer and consumer behavior can be verified locally.

### Test Configuration

```java
@SpringBootTest
@EmbeddedKafka(partitions = 1, topics = {"test-topic"})
class KafkaIntegrationTest {
    
    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;
    
    @Autowired
    private KafkaConsumerService consumerService;
    
    @Test
    void testProducerConsumer() throws InterruptedException {
        UserEvent event = new UserEvent("user-123", "LOGIN", null);
        kafkaTemplate.send("test-topic", "user-123", event);
        
        Thread.sleep(1000); // Wait for processing
        
        // Assertions
    }
}
```

**Quick Check:** Why is integration testing important for message-driven apps?

---

## Summary

### Key Takeaways

1. **KafkaTemplate** for producing messages
2. **@KafkaListener** for consuming messages
3. **Manual acknowledgment** for at-least-once delivery
4. **Error handling** with dead-letter queues
5. **Batch processing** for high throughput
6. **Transactions** for exactly-once semantics

### Next Steps

- Read [Advanced Features Guide](./03-advanced-features.md)
- Review [Enterprise Patterns](./04-enterprise-patterns.md)
- Build the [Complete Application](./05-step-by-step-guide.md)

**Quick Check:** Which topic do you want to practice first: producer, consumer, retries, or transactions?

What's next? Continue with [Advanced Features Guide](./03-advanced-features.md).
