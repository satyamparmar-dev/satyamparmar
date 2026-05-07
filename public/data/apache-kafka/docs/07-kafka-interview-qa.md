# Kafka Interview Questions & Production Scenarios

## 🎯 Overview

This comprehensive guide covers **frequently asked Kafka interview questions** and **real-world production challenges**, with detailed solutions and best practices from a senior architect's perspective.

**Target Audience:** Software engineers preparing for interviews and production deployments  
**Level:** Beginner → Advanced  
**Focus:** Real-world scenarios, troubleshooting, and best practices

---

## 📚 Table of Contents

1. [Core Concepts & Architecture](#core-concepts--architecture)
2. [Producer Scenarios](#producer-scenarios)
3. [Consumer Scenarios](#consumer-scenarios)
4. [Performance & Scaling](#performance--scaling)
5. [Fault Tolerance & Reliability](#fault-tolerance--reliability)
6. [Spring Boot Integration](#spring-boot-integration)
7. [Kafka Streams](#kafka-streams)
8. [Monitoring & Debugging](#monitoring--debugging)
9. [Production Best Practices](#production-best-practices)

---

## Core Concepts & Architecture

### Q1: Explain Kafka's Architecture and How It Differs from Traditional Message Queues

**Answer:**

Kafka is a **distributed streaming platform** that combines messaging, storage, and stream processing. Unlike traditional message queues, Kafka:

**Key Differences:**

1. **Message Persistence:**
   - **Traditional Queue:** Messages deleted after consumption
   - **Kafka:** Messages persisted on disk, retained for configurable time

2. **Consumer Model:**
   - **Traditional Queue:** Point-to-point (one consumer per message)
   - **Kafka:** Publish-subscribe with consumer groups (multiple consumers can read same message)

3. **Ordering:**
   - **Traditional Queue:** Global ordering
   - **Kafka:** Ordering per partition (not global)

4. **Throughput:**
   - **Traditional Queue:** Limited by broker processing
   - **Kafka:** High throughput (millions of messages/second) via partitioning

**Kafka Architecture Components:**

```
┌─────────────┐
│  Producer   │──┐
└─────────────┘  │
                 ▼
┌─────────────┐  │  ┌─────────────┐
│   Broker    │◄─┼──│   Broker    │
│  (Server)   │  │  │  (Server)   │
└─────────────┘  │  └─────────────┘
                 │
┌─────────────┐  │
│  Consumer   │◄─┘
└─────────────┘
```

**Key Components:**
- **Brokers:** Kafka servers that store data
- **Topics:** Categories for messages
- **Partitions:** Physical division of topics (enables parallelism)
- **Replicas:** Copies of partitions for fault tolerance
- **Consumer Groups:** Groups of consumers working together

**Real-World Example:**
In an e-commerce system:
- **Traditional Queue:** Order service sends message, payment service receives and deletes it
- **Kafka:** Order service publishes to `order-created` topic, multiple services (payment, inventory, notification) can consume independently, and messages are retained for replay

---

**Follow-Up Questions:**

1. **Q:** Why does Kafka use partitions instead of a single topic?
   **A:** Partitions enable:
   - **Parallelism:** Multiple consumers can read from different partitions
   - **Scalability:** Distribute load across brokers
   - **Ordering:** Messages within a partition are ordered

2. **Q:** What happens if a consumer reads from multiple partitions?
   **A:** Messages from different partitions may arrive out of order. If global ordering is needed, use a single partition or handle ordering in application logic.

3. **Q:** How does Kafka ensure no message loss?
   **A:** Through replication (replication factor > 1), acknowledgments (acks=all), and durable storage (messages written to disk).

---

### Q2: Explain the Relationship Between Topics, Partitions, and Consumer Groups

**Answer:**

**Topics:**
- Logical category for messages (e.g., `user-events`, `order-created`)
- Can have multiple partitions

**Partitions:**
- Physical division of a topic
- Each partition is an ordered, immutable sequence
- Distributed across brokers
- Enables parallelism and scalability

**Consumer Groups:**
- Group of consumers working together to consume a topic
- Each partition is consumed by only one consumer in a group
- If consumers > partitions, some consumers are idle
- If consumers < partitions, some consumers read multiple partitions

**Example Scenario:**

```
Topic: "user-events" (3 partitions)
Consumer Group: "analytics-group" (2 consumers)

Partition 0 ──▶ Consumer 1
Partition 1 ──▶ Consumer 1
Partition 2 ──▶ Consumer 2
```

**Key Rules:**
1. One partition → One consumer per group (at a time)
2. Multiple consumer groups can read same topic independently
3. Partition count should be >= consumer count for optimal parallelism

**Code Example:**

```java
// Consumer configuration
@KafkaListener(
    topics = "user-events",
    groupId = "analytics-group"  // Consumer group
)
public void consume(ConsumerRecord<String, UserEvent> record) {
    // This consumer will be assigned partitions based on group membership
    logger.info("Partition: {}, Offset: {}", 
        record.partition(), record.offset());
}
```

---

**Follow-Up Questions:**

1. **Q:** What happens when a new consumer joins a consumer group?
   **A:** Kafka triggers a **rebalance**:
   - Partitions are redistributed among all consumers
   - Each consumer gets assigned partitions
   - Consumers resume from last committed offset

2. **Q:** How to handle rebalancing gracefully?
   **A:** 
   - Implement `ConsumerRebalanceListener`
   - Commit offsets before partition revocation
   - Handle `RevokedPartitions` and `AssignedPartitions` events

```java
@KafkaListener(topics = "user-events", groupId = "analytics-group")
public void consume(ConsumerRecord<String, UserEvent> record,
                    Acknowledgment ack) {
    try {
        processMessage(record);
        ack.acknowledge(); // Commit offset
    } catch (Exception e) {
        // Don't acknowledge - will be retried
    }
}
```

---

### Q3: What Are Offsets and How Does Kafka Manage Consumer Position?

**Answer:**

**Offset:**
- Unique sequential ID for each message in a partition
- Per-partition (not global)
- Increments with each message

**Offset Management:**

1. **Auto-Commit (Default):**
   ```yaml
   spring:
     kafka:
       consumer:
         enable-auto-commit: true
         auto-commit-interval: 5000  # 5 seconds
   ```
   - Kafka automatically commits offsets periodically
   - **Risk:** Messages may be lost if consumer crashes before commit

2. **Manual Commit (Recommended):**
   ```yaml
   spring:
     kafka:
       consumer:
         enable-auto-commit: false
   ```
   ```java
   @KafkaListener(topics = "user-events", groupId = "analytics-group")
   public void consume(ConsumerRecord<String, UserEvent> record,
                       Acknowledgment ack) {
       try {
           processMessage(record);
           ack.acknowledge(); // Manual commit
       } catch (Exception e) {
           // Don't acknowledge - will be retried
       }
   }
   ```

**Offset Storage:**
- Stored in `__consumer_offsets` topic
- Key: `group-id + topic + partition`
- Value: Offset number

**Offset Reset Strategies:**

```yaml
spring:
  kafka:
    consumer:
      auto-offset-reset: earliest  # or latest, none
```

- **earliest:** Start from beginning of partition
- **latest:** Start from end (only new messages)
- **none:** Throw exception if no offset found

**Real-World Scenario:**

```
Partition 0: [0] [1] [2] [3] [4] [5] [6] [7] [8] [9]
                              ▲
                        Consumer is here
                        (committed offset: 5)
                        
On restart, consumer resumes from offset 5
```

---

**Follow-Up Questions:**

1. **Q:** What happens if a consumer processes a message but crashes before committing offset?
   **A:** Message will be reprocessed (at-least-once delivery). Ensure idempotent processing.

2. **Q:** How to handle duplicate messages?
   **A:** 
   - Use idempotent operations
   - Store processed message IDs
   - Use exactly-once semantics (Kafka transactions)

3. **Q:** What is consumer lag?
   **A:** Difference between latest offset and consumer's current offset. High lag indicates consumer is falling behind.

---

## Producer Scenarios

### Q4: How to Ensure Message Delivery Guarantees in Kafka?

**Answer:**

Kafka supports three delivery semantics:

**1. At-Most-Once (May Lose Messages)**

```yaml
spring:
  kafka:
    producer:
      acks: 0              # No acknowledgment
      retries: 0           # No retries
```

- Messages sent once, no retries
- **Use Case:** Metrics, logs where loss is acceptable
- **Risk:** Message loss on failure

**2. At-Least-Once (May Duplicate Messages)**

```yaml
spring:
  kafka:
    producer:
      acks: all            # Wait for all replicas
      retries: 2147483647  # Max retries
      enable-idempotence: false
```

- Messages guaranteed to be delivered
- Retries may cause duplicates
- **Use Case:** Most common, requires idempotent processing
- **Risk:** Duplicate messages

**3. Exactly-Once (No Loss, No Duplicates)**

```yaml
spring:
  kafka:
    producer:
      acks: all
      retries: 2147483647
      enable-idempotence: true
      transactional-id: unique-producer-id
```

```java
@Configuration
public class TransactionalKafkaConfig {
    
    @Bean
    public ProducerFactory<String, Object> producerFactory() {
        Map<String, Object> config = new HashMap<>();
        config.put(ProducerConfig.TRANSACTIONAL_ID_CONFIG, "tx-producer-1");
        config.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);
        config.put(ProducerConfig.ACKS_CONFIG, "all");
        return new DefaultKafkaProducerFactory<>(config);
    }
}
```

- Messages delivered exactly once
- Requires idempotent producer and transactional processing
- **Use Case:** Financial transactions, critical operations

**Code Example - Idempotent Producer:**

```java
@Service
public class OrderService {
    
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final Set<String> processedOrderIds = new ConcurrentHashMap<>().newKeySet();
    
    public void createOrder(Order order) {
        // Check if already processed (idempotency)
        if (processedOrderIds.contains(order.getId())) {
            logger.info("Order already processed: {}", order.getId());
            return;
        }
        
        // Process order
        kafkaTemplate.send("order-created", order.getId(), order);
        processedOrderIds.add(order.getId());
    }
}
```

---

**Follow-Up Questions:**

1. **Q:** How does idempotence work in Kafka?
   **A:** Producer assigns sequence numbers to messages. Broker deduplicates based on producer ID + sequence number.

2. **Q:** What is the performance impact of exactly-once semantics?
   **A:** Slight performance overhead due to:
   - Transaction coordination
   - Additional metadata
   - Synchronization overhead
   - Typically 10-20% slower than at-least-once

3. **Q:** How to handle exactly-once in consumers?
   **A:** 
   - Set `isolation.level=read_committed`
   - Only committed messages are visible
   - Combine with idempotent processing

---

### Q5: Production Issue - Producer is Slow, Messages Are Not Being Sent Fast Enough

**Answer:**

**Symptoms:**
- Low throughput
- High latency
- Producer buffer full errors
- Messages queued in memory

**Root Causes & Solutions:**

**1. Batch Size Too Small**

```yaml
# Before (slow)
spring:
  kafka:
    producer:
      batch-size: 1024  # 1KB

# After (optimized)
spring:
  kafka:
    producer:
      batch-size: 32768  # 32KB
      linger-ms: 20      # Wait 20ms to fill batch
```

**Explanation:**
- Larger batches = fewer network calls
- `linger.ms` waits to fill batch before sending
- Trade-off: Slight latency increase for higher throughput

**2. Compression Not Enabled**

```yaml
spring:
  kafka:
    producer:
      compression-type: snappy  # or gzip, lz4, zstd
```

**Benefits:**
- Reduces network bandwidth
- Faster transmission
- Lower storage costs

**3. Acks Configuration**

```yaml
# For highest throughput (less reliable)
spring:
  kafka:
    producer:
      acks: 1  # Wait for leader only

# For reliability (slightly slower)
spring:
  kafka:
    producer:
      acks: all  # Wait for all replicas
```

**4. Increase Buffer Memory**

```yaml
spring:
  kafka:
    producer:
      buffer-memory: 67108864  # 64MB (default: 32MB)
```

**5. Async Sending with Callbacks**

```java
@Service
public class OptimizedProducerService {
    
    private final KafkaTemplate<String, Object> kafkaTemplate;
    
    public void sendMessageAsync(String topic, String key, Object message) {
        ListenableFuture<SendResult<String, Object>> future = 
            kafkaTemplate.send(topic, key, message);
        
        // Non-blocking - continues immediately
        future.addCallback(
            result -> logger.info("Sent: {}", result),
            failure -> logger.error("Failed: {}", failure)
        );
    }
}
```

**6. Multiple Producer Instances**

```java
@Configuration
public class MultiProducerConfig {
    
    @Bean
    @Primary
    public KafkaTemplate<String, Object> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }
    
    @Bean
    public KafkaTemplate<String, Object> highThroughputTemplate() {
        Map<String, Object> config = new HashMap<>();
        // Optimized for throughput
        config.put(ProducerConfig.BATCH_SIZE_CONFIG, 65536);
        config.put(ProducerConfig.LINGER_MS_CONFIG, 50);
        config.put(ProducerConfig.COMPRESSION_TYPE_CONFIG, "snappy");
        return new KafkaTemplate<>(new DefaultKafkaProducerFactory<>(config));
    }
}
```

**Monitoring:**

```java
// Add metrics
@Autowired
private MeterRegistry meterRegistry;

public void sendMessage(String topic, String key, Object message) {
    Timer.Sample sample = Timer.start(meterRegistry);
    kafkaTemplate.send(topic, key, message).addCallback(
        result -> {
            sample.stop(meterRegistry.timer("kafka.producer.send.time"));
            meterRegistry.counter("kafka.producer.send.success").increment();
        },
        failure -> {
            sample.stop(meterRegistry.timer("kafka.producer.send.time"));
            meterRegistry.counter("kafka.producer.send.failure").increment();
        }
    );
}
```

---

**Follow-Up Questions:**

1. **Q:** What is the optimal batch size?
   **A:** Depends on:
   - Message size
   - Network latency
   - Throughput requirements
   - Start with 32KB, tune based on metrics

2. **Q:** How to balance throughput and latency?
   **A:** 
   - High throughput: Large batches, higher `linger.ms`
   - Low latency: Small batches, lower `linger.ms`
   - Use different producers for different use cases

3. **Q:** What happens when buffer memory is full?
   **A:** Producer blocks or throws `BufferExhaustedException`. Increase `buffer.memory` or reduce send rate.

---

## Consumer Scenarios

### Q6: Production Issue - Consumer Lag is Increasing, Messages Are Not Being Processed Fast Enough

**Answer:**

**Symptoms:**
- Consumer lag continuously increasing
- Messages piling up in topics
- Slow processing times
- Consumer falling behind

**Root Causes & Solutions:**

**1. Processing Logic Too Slow**

```java
// Before (slow)
@KafkaListener(topics = "user-events", groupId = "analytics-group")
public void consume(ConsumerRecord<String, UserEvent> record) {
    // Synchronous database call - blocks consumer
    database.save(record.value());  // 100ms per message
    // Throughput: ~10 messages/second
}

// After (optimized)
@KafkaListener(topics = "user-events", groupId = "analytics-group")
public void consume(ConsumerRecord<String, UserEvent> record) {
    // Async processing - non-blocking
    CompletableFuture.runAsync(() -> {
        database.save(record.value());
    });
    // Throughput: 1000+ messages/second
}
```

**2. Increase Consumer Concurrency**

```yaml
# Before
spring:
  kafka:
    listener:
      concurrency: 1  # Single thread

# After
spring:
  kafka:
    listener:
      concurrency: 5  # 5 consumer threads
```

```java
@KafkaListener(
    topics = "user-events",
    groupId = "analytics-group",
    concurrency = "5"  // 5 threads
)
public void consume(ConsumerRecord<String, UserEvent> record) {
    processMessage(record);
}
```

**3. Batch Processing**

```yaml
spring:
  kafka:
    consumer:
      max-poll-records: 500  # Process 500 records per poll
    listener:
      type: batch  # Enable batch processing
```

```java
@KafkaListener(
    topics = "user-events",
    groupId = "analytics-group",
    containerFactory = "batchKafkaListenerContainerFactory"
)
public void consume(List<ConsumerRecord<String, UserEvent>> records) {
    // Process batch
    List<UserEvent> events = records.stream()
        .map(ConsumerRecord::value)
        .collect(Collectors.toList());
    
    // Batch database insert
    database.saveAll(events);  // Much faster than individual saves
}
```

**4. Increase Partitions**

```bash
# Add partitions to topic
kafka-topics --alter \
  --topic user-events \
  --partitions 10 \
  --bootstrap-server localhost:9092
```

**Explanation:**
- More partitions = more parallelism
- Each partition can be consumed by different consumer
- Maximum parallelism = number of partitions

**5. Scale Out Consumers**

```yaml
# Deploy multiple consumer instances
# Each instance in same consumer group
# Kafka automatically distributes partitions
```

**6. Optimize Poll Interval**

```yaml
spring:
  kafka:
    consumer:
      max-poll-interval-ms: 300000  # 5 minutes
      fetch-min-size: 1
      fetch-max-wait-ms: 500
```

**7. Parallel Processing with Thread Pool**

```java
@Service
public class ParallelConsumerService {
    
    private final ExecutorService executorService = 
        Executors.newFixedThreadPool(10);
    
    @KafkaListener(topics = "user-events", groupId = "analytics-group")
    public void consume(ConsumerRecord<String, UserEvent> record,
                        Acknowledgment ack) {
        executorService.submit(() -> {
            try {
                processMessage(record);
                ack.acknowledge();
            } catch (Exception e) {
                logger.error("Processing failed", e);
                // Don't acknowledge - will retry
            }
        });
    }
}
```

**Monitoring Consumer Lag:**

```java
@Component
public class ConsumerLagMonitor {
    
    @Autowired
    private KafkaAdmin kafkaAdmin;
    
    @Scheduled(fixedDelay = 60000)  // Every minute
    public void checkConsumerLag() {
        // Get consumer group lag
        // Alert if lag > threshold
    }
}
```

**Grafana Query:**
```
kafka_consumer_lag_sum{group="analytics-group"}
```

---

**Follow-Up Questions:**

1. **Q:** What is the maximum number of consumers in a group?
   **A:** Maximum = number of partitions. Extra consumers remain idle.

2. **Q:** How to handle consumer rebalancing without losing messages?
   **A:** 
   - Commit offsets before partition revocation
   - Implement `ConsumerRebalanceListener`
   - Process messages idempotently

3. **Q:** What happens if a consumer takes too long to process?
   **A:** Exceeds `max.poll.interval.ms`, consumer is removed from group, rebalance occurs.

---

### Q7: How to Handle Duplicate Messages in Consumers?

**Answer:**

**Problem:**
- Consumer processes message
- Crashes before committing offset
- Message reprocessed on restart
- Duplicate processing

**Solutions:**

**1. Idempotent Processing**

```java
@Service
public class IdempotentConsumerService {
    
    private final Set<String> processedMessageIds = 
        new ConcurrentHashMap<>().newKeySet();
    
    @KafkaListener(topics = "user-events", groupId = "analytics-group")
    public void consume(ConsumerRecord<String, UserEvent> record,
                        Acknowledgment ack) {
        String messageId = record.key();  // Use key as message ID
        
        // Check if already processed
        if (processedMessageIds.contains(messageId)) {
            logger.info("Message already processed: {}", messageId);
            ack.acknowledge();  // Acknowledge but skip processing
            return;
        }
        
        try {
            processMessage(record.value());
            processedMessageIds.add(messageId);
            ack.acknowledge();
        } catch (Exception e) {
            logger.error("Processing failed", e);
            // Don't acknowledge - will retry
        }
    }
}
```

**2. Database-Based Deduplication**

```java
@Entity
@Table(name = "processed_messages")
public class ProcessedMessage {
    @Id
    private String messageId;
    private LocalDateTime processedAt;
}

@Service
public class DatabaseDeduplicationService {
    
    @Autowired
    private ProcessedMessageRepository repository;
    
    @KafkaListener(topics = "user-events", groupId = "analytics-group")
    @Transactional
    public void consume(ConsumerRecord<String, UserEvent> record,
                        Acknowledgment ack) {
        String messageId = record.key();
        
        // Check database
        if (repository.existsById(messageId)) {
            logger.info("Message already processed: {}", messageId);
            ack.acknowledge();
            return;
        }
        
        try {
            processMessage(record.value());
            
            // Mark as processed
            ProcessedMessage processed = new ProcessedMessage();
            processed.setMessageId(messageId);
            processed.setProcessedAt(LocalDateTime.now());
            repository.save(processed);
            
            ack.acknowledge();
        } catch (Exception e) {
            logger.error("Processing failed", e);
        }
    }
}
```

**3. Redis-Based Deduplication**

```java
@Service
public class RedisDeduplicationService {
    
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    @KafkaListener(topics = "user-events", groupId = "analytics-group")
    public void consume(ConsumerRecord<String, UserEvent> record,
                        Acknowledgment ack) {
        String messageId = record.key();
        String key = "processed:" + messageId;
        
        // Check Redis (atomic operation)
        Boolean isNew = redisTemplate.opsForValue()
            .setIfAbsent(key, "1", Duration.ofDays(7));
        
        if (!isNew) {
            logger.info("Message already processed: {}", messageId);
            ack.acknowledge();
            return;
        }
        
        try {
            processMessage(record.value());
            ack.acknowledge();
        } catch (Exception e) {
            // Delete from Redis on failure
            redisTemplate.delete(key);
            logger.error("Processing failed", e);
        }
    }
}
```

**4. Exactly-Once Semantics**

```yaml
spring:
  kafka:
    consumer:
      isolation-level: read_committed  # Only committed messages
    producer:
      enable-idempotence: true
      transactional-id: unique-id
```

```java
@Configuration
public class ExactlyOnceConfig {
    
    @Bean
    public ConsumerFactory<String, Object> consumerFactory() {
        Map<String, Object> config = new HashMap<>();
        config.put(ConsumerConfig.ISOLATION_LEVEL_CONFIG, "read_committed");
        return new DefaultKafkaConsumerFactory<>(config);
    }
}
```

---

**Follow-Up Questions:**

1. **Q:** What is the performance impact of deduplication?
   **A:** 
   - In-memory: Fast but limited by memory
   - Database: Slower but persistent
   - Redis: Fast and persistent, recommended for production

2. **Q:** How long to keep deduplication records?
   **A:** Depends on:
   - Message retention period
   - Replay scenarios
   - Typically 7-30 days

3. **Q:** What if two consumers process the same message simultaneously?
   **A:** Use distributed locking (Redis, database) or ensure single consumer per partition.

---

## Performance & Scaling

### Q8: How to Scale Kafka for High Throughput?

**Answer:**

**Scaling Strategies:**

**1. Horizontal Scaling (Add Brokers)**

```bash
# Add more brokers to cluster
# Kafka automatically redistributes partitions
```

**Benefits:**
- More storage capacity
- Better fault tolerance
- Higher throughput

**2. Increase Partitions**

```bash
# Add partitions to topic
kafka-topics --alter \
  --topic high-throughput-topic \
  --partitions 20 \
  --bootstrap-server localhost:9092
```

**Considerations:**
- More partitions = more parallelism
- But also more overhead
- Recommended: 1-2 partitions per broker

**3. Optimize Producer Configuration**

```yaml
spring:
  kafka:
    producer:
      batch-size: 65536          # 64KB batches
      linger-ms: 50              # Wait 50ms
      compression-type: snappy   # Compress
      buffer-memory: 134217728   # 128MB buffer
      acks: 1                    # Leader only (faster)
```

**4. Optimize Consumer Configuration**

```yaml
spring:
  kafka:
    consumer:
      fetch-min-size: 1024       # 1KB minimum
      fetch-max-wait-ms: 100     # Wait 100ms
      max-poll-records: 1000     # Process 1000 per poll
    listener:
      concurrency: 10             # 10 threads
      type: batch                 # Batch processing
```

**5. Network Optimization**

```yaml
# Increase socket buffer sizes
spring:
  kafka:
    producer:
      send-buffer-bytes: 131072   # 128KB
    consumer:
      receive-buffer-bytes: 65536 # 64KB
```

**6. JVM Tuning**

```bash
# Producer JVM options
-Xmx4g
-Xms4g
-XX:+UseG1GC
-XX:MaxGCPauseMillis=20

# Consumer JVM options
-Xmx8g
-Xms8g
-XX:+UseG1GC
```

**7. Topic-Level Configuration**

```bash
# Create topic with optimized settings
kafka-topics --create \
  --topic high-throughput-topic \
  --partitions 10 \
  --replication-factor 3 \
  --config retention.ms=604800000 \
  --config segment.bytes=1073741824 \
  --config compression.type=snappy
```

**8. Monitor and Tune**

```java
// Monitor producer metrics
@Scheduled(fixedDelay = 60000)
public void monitorThroughput() {
    double throughput = meterRegistry.counter("kafka.producer.records-sent")
        .count() / 60.0;  // Records per second
    
    if (throughput < targetThroughput) {
        // Alert or auto-scale
    }
}
```

---

**Follow-Up Questions:**

1. **Q:** What is the maximum throughput of a single Kafka broker?
   **A:** Depends on hardware, typically:
   - 100K-1M messages/second
   - 100-500 MB/second
   - With proper tuning

2. **Q:** How many partitions should I have?
   **A:** General rule:
   - Start with: Number of consumers
   - Maximum: 2x number of brokers
   - Too many partitions: Overhead, slower rebalancing

3. **Q:** How to handle hot partitions?
   **A:** 
   - Use better partitioning key
   - Distribute load evenly
   - Consider custom partitioner

---

## Fault Tolerance & Reliability

### Q9: Production Issue - Messages Are Being Lost

**Answer:**

**Symptoms:**
- Messages sent but not received
- Consumer not processing all messages
- Data gaps in processing

**Root Causes & Solutions:**

**1. Producer Not Waiting for Acknowledgments**

```yaml
# Before (risky)
spring:
  kafka:
    producer:
      acks: 0  # No acknowledgment

# After (safe)
spring:
  kafka:
    producer:
      acks: all  # Wait for all replicas
      retries: 2147483647
```

**2. Consumer Auto-Commit Enabled**

```yaml
# Before (risky)
spring:
  kafka:
    consumer:
      enable-auto-commit: true

# After (safe)
spring:
  kafka:
    consumer:
      enable-auto-commit: false
    listener:
      ack-mode: manual_immediate
```

```java
@KafkaListener(topics = "user-events", groupId = "analytics-group")
public void consume(ConsumerRecord<String, UserEvent> record,
                    Acknowledgment ack) {
    try {
        processMessage(record);
        ack.acknowledge();  // Commit only after processing
    } catch (Exception e) {
        // Don't acknowledge - will retry
    }
}
```

**3. Insufficient Replication**

```bash
# Before (risky)
kafka-topics --create \
  --topic important-topic \
  --replication-factor 1  # Single copy

# After (safe)
kafka-topics --create \
  --topic important-topic \
  --replication-factor 3  # 3 copies
```

**4. Topic Retention Too Short**

```bash
# Check retention
kafka-configs --describe \
  --topic important-topic \
  --bootstrap-server localhost:9092

# Increase retention
kafka-configs --alter \
  --topic important-topic \
  --add-config retention.ms=604800000 \
  --bootstrap-server localhost:9092
```

**5. Consumer Processing Errors**

```java
@KafkaListener(topics = "user-events", groupId = "analytics-group")
public void consume(ConsumerRecord<String, UserEvent> record,
                    Acknowledgment ack) {
    try {
        processMessage(record);
        ack.acknowledge();
    } catch (Exception e) {
        // Send to dead letter queue instead of losing
        sendToDeadLetterQueue(record);
        ack.acknowledge();  // Acknowledge to avoid infinite retry
    }
}
```

**6. Network Partitions**

```yaml
# Increase timeouts
spring:
  kafka:
    producer:
      request-timeout-ms: 30000
      delivery-timeout-ms: 120000
    consumer:
      session-timeout-ms: 30000
      heartbeat-interval-ms: 3000
```

**7. Monitor for Message Loss**

```java
@Component
public class MessageLossDetector {
    
    @Autowired
    private MeterRegistry meterRegistry;
    
    private long lastProcessedOffset = 0;
    
    @KafkaListener(topics = "user-events", groupId = "analytics-group")
    public void consume(ConsumerRecord<String, UserEvent> record) {
        long currentOffset = record.offset();
        
        // Check for gaps
        if (currentOffset > lastProcessedOffset + 1) {
            long gap = currentOffset - lastProcessedOffset - 1;
            meterRegistry.counter("kafka.message.gap", 
                "topic", record.topic(),
                "partition", String.valueOf(record.partition()))
                .increment(gap);
            
            logger.warn("Message gap detected: {} messages missing", gap);
        }
        
        lastProcessedOffset = currentOffset;
    }
}
```

---

**Follow-Up Questions:**

1. **Q:** How to verify no messages are lost?
   **A:** 
   - Monitor producer/consumer metrics
   - Check for gaps in offsets
   - Use end-to-end testing
   - Compare message counts

2. **Q:** What is the difference between `acks=1` and `acks=all`?
   **A:** 
   - `acks=1`: Leader acknowledges (faster, less reliable)
   - `acks=all`: All replicas acknowledge (slower, more reliable)

---

## Spring Boot Integration

### Q10: How to Configure Kafka in Spring Boot for Production?

**Answer:**

**Complete Production Configuration:**

```yaml
spring:
  application:
    name: kafka-service
  
  kafka:
    bootstrap-servers: ${KAFKA_BROKERS:localhost:9092}
    
    # Producer Configuration
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
      
      # Reliability
      acks: all
      retries: 2147483647
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
    
    # Consumer Configuration
    consumer:
      group-id: ${spring.application.name}-${ENVIRONMENT:dev}
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
      
      # Offset Management
      auto-offset-reset: earliest
      enable-auto-commit: false
      
      # Performance
      max-poll-records: 500
      max-poll-interval-ms: 300000
      fetch-min-size: 1
      fetch-max-wait-ms: 500
      
      # Session Management
      session-timeout-ms: 30000
      heartbeat-interval-ms: 3000
      
      # JSON Deserializer
      properties:
        spring.json.trusted.packages: "*"
        spring.json.value.default.type: com.example.dto.UserEvent
    
    # Listener Configuration
    listener:
      ack-mode: manual_immediate
      concurrency: 3
      type: single
```

**Java Configuration Class:**

```java
@Configuration
@EnableKafka
public class KafkaConfig {
    
    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;
    
    // Producer Factory
    @Bean
    public ProducerFactory<String, Object> producerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        
        // Production settings
        configProps.put(ProducerConfig.ACKS_CONFIG, "all");
        configProps.put(ProducerConfig.RETRIES_CONFIG, Integer.MAX_VALUE);
        configProps.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);
        configProps.put(ProducerConfig.MAX_IN_FLIGHT_REQUESTS_PER_CONNECTION, 5);
        configProps.put(ProducerConfig.BATCH_SIZE_CONFIG, 32768);
        configProps.put(ProducerConfig.LINGER_MS_CONFIG, 20);
        configProps.put(ProducerConfig.COMPRESSION_TYPE_CONFIG, "snappy");
        
        return new DefaultKafkaProducerFactory<>(configProps);
    }
    
    // Consumer Factory
    @Bean
    public ConsumerFactory<String, Object> consumerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        configProps.put(ConsumerConfig.GROUP_ID_CONFIG, "default-group");
        configProps.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        configProps.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class);
        
        configProps.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        configProps.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, false);
        configProps.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, 500);
        
        configProps.put(JsonDeserializer.TRUSTED_PACKAGES, "*");
        configProps.put(JsonDeserializer.VALUE_DEFAULT_TYPE, "com.example.dto.UserEvent");
        
        return new DefaultKafkaConsumerFactory<>(configProps);
    }
    
    // Kafka Template
    @Bean
    public KafkaTemplate<String, Object> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }
    
    // Listener Container Factory
    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, Object> kafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, Object> factory = 
            new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory());
        factory.getContainerProperties().setAckMode(ContainerProperties.AckMode.MANUAL_IMMEDIATE);
        factory.setConcurrency(3);
        return factory;
    }
}
```

---

**Follow-Up Questions:**

1. **Q:** Why use `JsonSerializer` instead of `StringSerializer`?
   **A:** 
   - Type safety
   - Automatic serialization/deserialization
   - Schema evolution support
   - Better error handling

2. **Q:** What is `trusted.packages` in JSON deserializer?
   **A:** Security feature - only deserialize classes from trusted packages to prevent deserialization attacks.

---

### Q11: Production Issue - Spring Boot Consumer Not Receiving Messages

**Answer:**

**Common Causes & Solutions:**

**1. Wrong Consumer Group ID**

```yaml
# Check group ID matches
spring:
  kafka:
    consumer:
      group-id: my-service-group  # Must be consistent
```

**2. Auto-Offset-Reset Configuration**

```yaml
# If set to 'latest', won't see old messages
spring:
  kafka:
    consumer:
      auto-offset-reset: earliest  # Start from beginning
```

**3. Topic Name Mismatch**

```java
// Verify topic name matches exactly
@KafkaListener(
    topics = "user-events",  // Must match exactly
    groupId = "analytics-group"
)
public void consume(ConsumerRecord<String, UserEvent> record) {
    // ...
}
```

**4. Consumer Not Subscribed**

```java
// Explicit subscription
@KafkaListener(
    topics = "user-events",
    groupId = "analytics-group",
    containerFactory = "kafkaListenerContainerFactory"
)
public void consume(ConsumerRecord<String, UserEvent> record) {
    // ...
}
```

**5. Check Consumer Group Status**

```bash
# List consumer groups
kafka-consumer-groups --bootstrap-server localhost:9092 --list

# Describe consumer group
kafka-consumer-groups --bootstrap-server localhost:9092 \
  --group analytics-group --describe
```

**6. Debug Consumer Configuration**

```java
@PostConstruct
public void logConsumerConfig() {
    ConsumerFactory<String, Object> factory = kafkaListenerContainerFactory()
        .getConsumerFactory();
    Map<String, Object> config = factory.getConfigurationProperties();
    logger.info("Consumer config: {}", config);
}
```

**7. Verify Kafka Connection**

```java
@Component
public class KafkaHealthCheck implements HealthIndicator {
    
    @Autowired
    private KafkaAdmin kafkaAdmin;
    
    @Override
    public Health health() {
        try {
            // Test connection
            AdminClient adminClient = AdminClient.create(
                kafkaAdmin.getConfigurationProperties());
            adminClient.listTopics();
            return Health.up().build();
        } catch (Exception e) {
            return Health.down().withException(e).build();
        }
    }
}
```

---

**Follow-Up Questions:**

1. **Q:** How to test if consumer is working?
   **A:** 
   - Send test message
   - Check consumer logs
   - Monitor consumer lag
   - Use Kafka UI

2. **Q:** What if consumer is in different consumer group?
   **A:** Consumer will read from beginning (if `auto-offset-reset=earliest`) or latest messages only.

---

## Kafka Streams

### Q12: When to Use Kafka Streams vs Regular Consumers?

**Answer:**

**Kafka Streams Use Cases:**
- Real-time stream processing
- Aggregations and transformations
- Joining multiple streams
- Stateful operations
- Windowing operations

**Regular Consumers Use Cases:**
- Simple message consumption
- Integration with external systems
- Database operations
- API calls

**Example - Kafka Streams:**

```java
@Configuration
@EnableKafkaStreams
public class KafkaStreamsConfig {
    
    @Bean
    public KStream<String, UserEvent> processUserEvents(StreamsBuilder streamsBuilder) {
        KStream<String, UserEvent> source = streamsBuilder.stream("user-events");
        
        // Filter login events
        KStream<String, UserEvent> loginEvents = source.filter((key, value) -> 
            "LOGIN".equals(value.getEventType()));
        
        // Count logins per user
        KTable<String, Long> loginCounts = loginEvents
            .groupByKey()
            .count();
        
        // Windowed aggregations
        TimeWindows tumblingWindow = TimeWindows.of(Duration.ofMinutes(5));
        KTable<Windowed<String>, Long> windowedCounts = loginEvents
            .groupByKey()
            .windowedBy(tumblingWindow)
            .count();
        
        // Write to output topic
        loginCounts.toStream().to("user-login-counts");
        
        return source;
    }
}
```

**Example - Regular Consumer:**

```java
@KafkaListener(topics = "user-events", groupId = "analytics-group")
public void consume(ConsumerRecord<String, UserEvent> record) {
    // Simple processing
    if ("LOGIN".equals(record.value().getEventType())) {
        database.incrementLoginCount(record.key());
    }
}
```

**When to Use Each:**

| Scenario | Kafka Streams | Regular Consumer |
|----------|---------------|------------------|
| Simple filtering | ✅ | ✅ |
| Aggregations | ✅ | ❌ |
| Joining streams | ✅ | ❌ |
| Windowing | ✅ | ❌ |
| External API calls | ❌ | ✅ |
| Database operations | ❌ | ✅ |
| Complex transformations | ✅ | ❌ |

---

**Follow-Up Questions:**

1. **Q:** What is the performance difference?
   **A:** Kafka Streams is optimized for stream processing, typically faster for aggregations and joins.

2. **Q:** Can I use both in the same application?
   **A:** Yes, but be careful with resource usage and consumer groups.

---

## Monitoring & Debugging

### Q13: How to Monitor Kafka in Production?

**Answer:**

**1. Kafka Metrics (JMX)**

```yaml
# Enable JMX
management:
  endpoints:
    jmx:
      exposure:
        include: "*"
  metrics:
    export:
      jmx:
        enabled: true
```

**Key Metrics to Monitor:**

- **Producer Metrics:**
  - `record-send-rate`: Messages per second
  - `record-error-rate`: Error rate
  - `request-latency-avg`: Average latency
  - `buffer-available-bytes`: Available buffer

- **Consumer Metrics:**
  - `records-consumed-rate`: Consumption rate
  - `records-lag-max`: Maximum lag
  - `fetch-latency-avg`: Fetch latency

- **Broker Metrics:**
  - `messages-in-per-sec`: Incoming messages
  - `bytes-in-per-sec`: Incoming bytes
  - `bytes-out-per-sec`: Outgoing bytes
  - `under-replicated-partitions`: Replication issues

**2. Micrometer + Prometheus**

```yaml
management:
  endpoints:
    web:
      exposure:
        include: prometheus,health,metrics
  metrics:
    export:
      prometheus:
        enabled: true
```

```java
@Component
public class KafkaMetrics {
    
    @Autowired
    private MeterRegistry meterRegistry;
    
    public void recordMessageProduced(String topic) {
        meterRegistry.counter("kafka.producer.messages", "topic", topic).increment();
    }
    
    public void recordMessageConsumed(String topic, long processingTime) {
        meterRegistry.timer("kafka.consumer.processing.time", "topic", topic)
            .record(processingTime, TimeUnit.MILLISECONDS);
    }
}
```

**3. Consumer Lag Monitoring**

```java
@Component
public class ConsumerLagMonitor {
    
    @Autowired
    private KafkaAdmin kafkaAdmin;
    
    @Scheduled(fixedDelay = 60000)
    public void monitorLag() {
        try (AdminClient adminClient = AdminClient.create(
                kafkaAdmin.getConfigurationProperties())) {
            
            // Get consumer groups
            ListConsumerGroupsResult groups = adminClient.listConsumerGroups();
            
            // For each group, check lag
            // Alert if lag > threshold
        }
    }
}
```

**4. Grafana Dashboards**

**Key Dashboards:**
- Producer throughput
- Consumer lag
- Error rates
- Latency percentiles
- Broker health

**5. Logging**

```yaml
logging:
  level:
    org.springframework.kafka: INFO
    org.apache.kafka: WARN
    com.example.kafka: DEBUG
```

```java
@KafkaListener(topics = "user-events", groupId = "analytics-group")
public void consume(ConsumerRecord<String, UserEvent> record) {
    MDC.put("topic", record.topic());
    MDC.put("partition", String.valueOf(record.partition()));
    MDC.put("offset", String.valueOf(record.offset()));
    
    logger.info("Processing message: {}", record.value());
    
    try {
        processMessage(record.value());
    } finally {
        MDC.clear();
    }
}
```

**6. Health Checks**

```java
@Component
public class KafkaHealthIndicator implements HealthIndicator {
    
    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;
    
    @Override
    public Health health() {
        try {
            // Test producer
            kafkaTemplate.send("health-check", "test", "test").get(5, TimeUnit.SECONDS);
            return Health.up()
                .withDetail("kafka", "Connected")
                .build();
        } catch (Exception e) {
            return Health.down()
                .withDetail("kafka", "Disconnected")
                .withException(e)
                .build();
        }
    }
}
```

---

**Follow-Up Questions:**

1. **Q:** What is a good consumer lag threshold?
   **A:** Depends on use case:
   - Real-time: < 1000 messages
   - Batch: < 100,000 messages
   - Monitor trend, not just absolute value

2. **Q:** How often should I check metrics?
   **A:** 
   - Real-time dashboards: Continuous
   - Alerts: Every 1-5 minutes
   - Reports: Daily/weekly

---

## Production Best Practices

### Q14: What Are the Top 10 Kafka Production Best Practices?

**Answer:**

**1. Use Idempotent Producers**

```yaml
spring:
  kafka:
    producer:
      enable-idempotence: true
```

**2. Manual Offset Commits**

```yaml
spring:
  kafka:
    consumer:
      enable-auto-commit: false
    listener:
      ack-mode: manual_immediate
```

**3. Proper Error Handling**

```java
@KafkaListener(topics = "user-events", groupId = "analytics-group")
public void consume(ConsumerRecord<String, UserEvent> record,
                    Acknowledgment ack) {
    try {
        processMessage(record);
        ack.acknowledge();
    } catch (RetryableException e) {
        // Don't acknowledge - will retry
        logger.warn("Retryable error", e);
    } catch (Exception e) {
        // Send to dead letter queue
        sendToDLQ(record);
        ack.acknowledge();
    }
}
```

**4. Dead Letter Queue**

```java
@Service
public class DeadLetterQueueHandler {
    
    private final KafkaTemplate<String, Object> kafkaTemplate;
    
    public void sendToDLQ(ConsumerRecord<String, Object> record, Exception error) {
        DLQMessage dlqMessage = new DLQMessage(
            record.topic(),
            record.partition(),
            record.offset(),
            record.value(),
            error.getMessage()
        );
        kafkaTemplate.send("dead-letter-queue", record.key(), dlqMessage);
    }
}
```

**5. Monitoring and Alerting**

```java
@Component
public class KafkaAlerting {
    
    @Scheduled(fixedDelay = 60000)
    public void checkConsumerLag() {
        long lag = getConsumerLag();
        if (lag > 10000) {
            alertService.sendAlert("High consumer lag: " + lag);
        }
    }
}
```

**6. Resource Limits**

```yaml
# Set appropriate limits
spring:
  kafka:
    consumer:
      max-poll-records: 500  # Don't process too many at once
      max-poll-interval-ms: 300000  # 5 minutes max
```

**7. Graceful Shutdown**

```java
@PreDestroy
public void shutdown() {
    // Stop accepting new messages
    // Process remaining messages
    // Commit offsets
    // Close connections
}
```

**8. Schema Evolution**

```java
// Use Schema Registry for schema evolution
// Version your events
public class UserEventV1 {
    private String userId;
    private String eventType;
}

public class UserEventV2 extends UserEventV1 {
    private Map<String, String> metadata;  // New field
}
```

**9. Security**

```yaml
spring:
  kafka:
    properties:
      security.protocol: SSL
      ssl.truststore.location: /path/to/truststore
      ssl.keystore.location: /path/to/keystore
```

**10. Documentation**

- Document event schemas
- Document consumer groups
- Document retention policies
- Document error handling strategies

---

**Follow-Up Questions:**

1. **Q:** How to handle schema evolution?
   **A:** 
   - Use Schema Registry
   - Version your events
   - Backward/forward compatibility
   - Gradual migration

2. **Q:** What is the recommended replication factor?
   **A:** 
   - Development: 1
   - Production: 3
   - Critical: 5

---

## Summary

This comprehensive guide covers:

✅ **Core Concepts:** Architecture, topics, partitions, offsets  
✅ **Producer Scenarios:** Delivery guarantees, performance optimization  
✅ **Consumer Scenarios:** Lag handling, duplicate messages  
✅ **Performance & Scaling:** Throughput optimization, scaling strategies  
✅ **Fault Tolerance:** Message loss prevention, reliability  
✅ **Spring Boot Integration:** Production configuration, troubleshooting  
✅ **Kafka Streams:** When to use, examples  
✅ **Monitoring:** Metrics, dashboards, alerting  
✅ **Best Practices:** Production-ready patterns  

**Use this guide for:**
- 🎯 Interview preparation
- 🔧 Production troubleshooting  
- 📊 Architecture decisions
- ⚡ Performance optimization
- 👥 Team knowledge sharing

**Remember:** Every production system is different. Use these patterns as guidelines and adapt to your specific requirements.

This guide provides comprehensive coverage of:
- ✅ Core Kafka concepts
- ✅ Production scenarios and solutions
- ✅ Code examples and best practices
- ✅ Troubleshooting strategies
- ✅ Performance optimization
- ✅ Real-world patterns

**Use this guide for:**
- Interview preparation
- Production troubleshooting
- Architecture decisions
- Performance optimization
- Team knowledge sharing
