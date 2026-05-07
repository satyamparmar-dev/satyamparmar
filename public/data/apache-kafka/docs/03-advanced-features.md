# Advanced Kafka Features

> ### What will you learn?
> - How Kafka Streams, Connect, and Transactions solve real data flow problems.
> - How Kafka security and monitoring are configured in practical setups.
> - How to tune performance and improve fault tolerance for production use.

## 📚 Table of Contents
1. [Kafka Streams](#kafka-streams)
2. [Kafka Connect](#kafka-connect)
3. [Transactions](#transactions)
4. [Security](#security)
5. [Monitoring and Metrics](#monitoring-and-metrics)
6. [Performance Tuning](#performance-tuning)
7. [Fault Tolerance](#fault-tolerance)

---

## Kafka Streams

### Introduction

**Kafka Streams** is a client library for building real-time stream processing applications that transform input Kafka topics into output Kafka topics.

In plain English: you read events from one topic, process them in code, and write results to another topic.

### Key Concepts

- **KStream**: Stream of key-value pairs (immutable, append-only)
- **KTable**: Changelog stream (mutable, latest value per key)
- **GlobalKTable**: Replicated table across all instances
- **State Stores**: Local storage for stateful operations

### Simple Stream Processing Example

```java
package com.example.kafka.streams;

import org.apache.kafka.common.serialization.Serdes;
import org.apache.kafka.streams.KafkaStreams;
import org.apache.kafka.streams.StreamsBuilder;
import org.apache.kafka.streams.StreamsConfig;
import org.apache.kafka.streams.kstream.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Properties;

@Configuration
public class KafkaStreamsConfig {
    
    @Bean
    public KafkaStreams kafkaStreams(StreamsBuilder streamsBuilder) {
        // Define stream processing topology
        KStream<String, UserEvent> source = streamsBuilder.stream("user-events");
        
        // Filter events
        KStream<String, UserEvent> filtered = source.filter((key, value) -> 
            "LOGIN".equals(value.getEventType())
        );
        
        // Group by user and count
        KTable<String, Long> userLoginCounts = filtered
            .groupBy((key, value) -> value.getUserId())
            .count();
        
        // Write to output topic
        userLoginCounts.toStream().to("user-login-counts");
        
        // Build and start streams
        Properties props = new Properties();
        props.put(StreamsConfig.APPLICATION_ID_CONFIG, "user-events-processor");
        props.put(StreamsConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        props.put(StreamsConfig.DEFAULT_KEY_SERDE_CLASS_CONFIG, Serdes.String().getClass());
        props.put(StreamsConfig.DEFAULT_VALUE_SERDE_CLASS_CONFIG, Serdes.String().getClass());
        
        KafkaStreams streams = new KafkaStreams(streamsBuilder.build(), props);
        streams.start();
        
        return streams;
    }
}
```

### Advanced Stream Processing

```java
@Service
public class AdvancedStreamProcessor {
    
    @Bean
    public KStream<String, UserEvent> processUserEvents(StreamsBuilder builder) {
        KStream<String, UserEvent> source = builder.stream("user-events");
        
        // Windowed aggregations
        TimeWindows tumblingWindow = TimeWindows.of(Duration.ofMinutes(5));
        
        KTable<Windowed<String>, Long> windowedCounts = source
            .groupByKey()
            .windowedBy(tumblingWindow)
            .count();
        
        // Join streams
        KStream<String, UserEvent> loginEvents = source.filter((k, v) -> 
            "LOGIN".equals(v.getEventType()));
        
        KStream<String, UserEvent> logoutEvents = source.filter((k, v) -> 
            "LOGOUT".equals(v.getEventType()));
        
        // Join login and logout events
        KStream<String, SessionDuration> sessions = loginEvents
            .leftJoin(logoutEvents,
                (login, logout) -> new SessionDuration(login, logout),
                JoinWindows.of(Duration.ofHours(1)),
                StreamJoined.with(Serdes.String(), userEventSerde, userEventSerde)
            );
        
        sessions.to("user-sessions");
        
        return source;
    }
}
```

### Stateful Operations

```java
@Configuration
public class StatefulStreamConfig {
    
    @Bean
    public KStream<String, UserEvent> statefulProcessing(StreamsBuilder builder) {
        KStream<String, UserEvent> source = builder.stream("user-events");
        
        // Aggregate with state store
        KTable<String, UserProfile> userProfiles = source
            .groupByKey()
            .aggregate(
                UserProfile::new,
                (key, event, profile) -> profile.update(event),
                Materialized.as("user-profiles-store")
            );
        
        return source;
    }
}
```

**Quick Check:** What is the main difference between a simple stream transformation and a stateful operation?

---

## Kafka Connect

### Introduction

**Kafka Connect** is a framework for connecting Kafka with external systems such as databases, key-value stores, search indexes, and file systems.

In plain English: Connect helps Kafka talk to outside systems without writing full custom apps every time.

### Source Connector (Read from External System)

**Example: Database Source Connector**

```java
package com.example.kafka.connect;

import org.apache.kafka.connect.source.SourceRecord;
import org.apache.kafka.connect.source.SourceTask;
import java.util.*;

public class DatabaseSourceTask extends SourceTask {
    
    @Override
    public String version() {
        return "1.0.0";
    }
    
    @Override
    public void start(Map<String, String> props) {
        // Initialize database connection
    }
    
    @Override
    public List<SourceRecord> poll() throws InterruptedException {
        // Read from database and create SourceRecords
        List<SourceRecord> records = new ArrayList<>();
        
        // Example: Read from database
        // records.add(new SourceRecord(...));
        
        return records;
    }
    
    @Override
    public void stop() {
        // Cleanup
    }
}
```

### Sink Connector (Write to External System)

**Example: Database Sink Connector**

```java
public class DatabaseSinkTask extends SinkTask {
    
    @Override
    public String version() {
        return "1.0.0";
    }
    
    @Override
    public void start(Map<String, String> props) {
        // Initialize database connection
    }
    
    @Override
    public void put(Collection<SinkRecord> records) {
        // Write records to database
        for (SinkRecord record : records) {
            // Insert/Update database
        }
    }
    
    @Override
    public void stop() {
        // Cleanup
    }
}
```

### Connect Configuration

**connect-standalone.properties:**
```properties
bootstrap.servers=localhost:9092
key.converter=org.apache.kafka.connect.json.JsonConverter
value.converter=org.apache.kafka.connect.json.JsonConverter
key.converter.schemas.enable=true
value.converter.schemas.enable=true
```

**source-connector.properties:**
```properties
name=db-source-connector
connector.class=com.example.kafka.connect.DatabaseSourceConnector
tasks.max=1
topics=db-changes
db.url=jdbc:postgresql://localhost:5432/mydb
db.table=users
```

**Quick Check:** What is the difference between a source connector and a sink connector?

---

## Transactions

In plain English: transactions make sure related writes are committed together, so partial updates do not happen.

### Transactional Producer

```java
@Configuration
public class TransactionalConfig {
    
    @Bean
    public ProducerFactory<String, Object> transactionalProducerFactory() {
        Map<String, Object> config = new HashMap<>();
        config.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        config.put(ProducerConfig.TRANSACTIONAL_ID_CONFIG, "tx-producer-1");
        config.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);
        config.put(ProducerConfig.ACKS_CONFIG, "all");
        
        return new DefaultKafkaProducerFactory<>(config);
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
public class TransactionalService {
    
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final UserRepository userRepository;
    
    public void createUserWithEvents(User user) {
        // Database transaction
        userRepository.save(user);
        
        // Kafka transaction
        kafkaTemplate.send("user-created", user.getId(), user);
        kafkaTemplate.send("user-events", user.getId(), 
            new UserEvent(user.getId(), "CREATED", user));
    }
}
```

### Exactly-Once Semantics

```java
@Configuration
public class ExactlyOnceConfig {
    
    @Bean
    public ConsumerFactory<String, Object> exactlyOnceConsumerFactory() {
        Map<String, Object> config = new HashMap<>();
        // ... standard config ...
        
        // Enable exactly-once
        config.put(ConsumerConfig.ISOLATION_LEVEL_CONFIG, "read_committed");
        
        return new DefaultKafkaConsumerFactory<>(config);
    }
}
```

**Quick Check:** Why is `read_committed` important for exactly-once behavior?

---

## Security

In plain English: security has three goals here: verify identity (auth), protect data in transit (encryption), and control permissions (ACLs).

### SASL/PLAIN Authentication

**server.properties:**
```properties
listeners=SASL_PLAINTEXT://localhost:9092
security.inter.broker.protocol=SASL_PLAINTEXT
sasl.mechanism.inter.broker.protocol=PLAIN
sasl.enabled.mechanisms=PLAIN
```

**jaas.conf:**
```
KafkaServer {
    org.apache.kafka.common.security.plain.PlainLoginModule required
    username="admin"
    password="admin-secret"
    user_admin="admin-secret"
    user_producer="producer-secret"
    user_consumer="consumer-secret";
};
```

**Spring Boot Configuration:**
```yaml
spring:
  kafka:
    bootstrap-servers: localhost:9092
    properties:
      security.protocol: SASL_PLAINTEXT
      sasl.mechanism: PLAIN
      sasl.jaas.config: org.apache.kafka.common.security.plain.PlainLoginModule required username="producer" password="producer-secret";
```

### SSL/TLS Encryption

**server.properties:**
```properties
listeners=SSL://localhost:9093
security.inter.broker.protocol=SSL
ssl.keystore.location=/path/to/kafka.server.keystore.jks
ssl.keystore.password=keystore-password
ssl.key.password=key-password
ssl.truststore.location=/path/to/kafka.server.truststore.jks
ssl.truststore.password=truststore-password
```

**Spring Boot Configuration:**
```yaml
spring:
  kafka:
    bootstrap-servers: localhost:9093
    properties:
      security.protocol: SSL
      ssl.truststore.location: /path/to/client.truststore.jks
      ssl.truststore.password: truststore-password
      ssl.keystore.location: /path/to/client.keystore.jks
      ssl.keystore.password: keystore-password
      ssl.key.password: key-password
```

### ACLs (Access Control Lists)

**Enable ACLs:**
```properties
authorizer.class.name=kafka.security.authorizer.AclAuthorizer
```

**Create ACL:**
```bash
kafka-acls --bootstrap-server localhost:9092 \
  --add --allow-principal User:producer \
  --operation Write --topic user-events
```

**Quick Check:** Which security piece controls who can write to a topic?

---

## Monitoring and Metrics

### JMX Metrics

Kafka exposes metrics via JMX. Enable JMX:

In plain English: monitoring tells you if Kafka is healthy before users feel any issue.

**server.properties:**
```properties
jmx.port=9999
```

### Micrometer Integration

```xml
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

**Configuration:**
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

### Custom Metrics

```java
@Service
public class MetricsService {
    
    private final MeterRegistry meterRegistry;
    private final Counter messagesProduced;
    private final Timer processingTime;
    
    public MetricsService(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
        this.messagesProduced = Counter.builder("kafka.messages.produced")
            .description("Total messages produced")
            .register(meterRegistry);
        this.processingTime = Timer.builder("kafka.processing.time")
            .description("Message processing time")
            .register(meterRegistry);
    }
    
    public void recordMessageProduced() {
        messagesProduced.increment();
    }
    
    public void recordProcessingTime(Duration duration) {
        processingTime.record(duration);
    }
}
```

### Prometheus + Grafana

**docker-compose.yml:**
```yaml
version: '3'
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
  
  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
```

**Quick Check:** Why do teams usually use both Prometheus and Grafana together?

---

## Performance Tuning

In plain English: tuning means adjusting Kafka settings so you get the speed and reliability balance you need.

### Producer Tuning

```yaml
spring:
  kafka:
    producer:
      # Batch settings
      batch-size: 32768          # Increase for higher throughput
      linger-ms: 20              # Wait time to fill batch
      
      # Compression
      compression-type: snappy   # snappy, gzip, lz4, zstd
      
      # Buffer
      buffer-memory: 67108864    # 64MB buffer
      
      # Acks
      acks: 1                    # Faster (less reliable)
      # acks: all                # Slower (more reliable)
```

### Consumer Tuning

```yaml
spring:
  kafka:
    consumer:
      # Fetch settings
      fetch-min-size: 1
      fetch-max-wait-ms: 500
      
      # Poll settings
      max-poll-records: 500      # Increase for batch processing
      
      # Session
      session-timeout-ms: 30000
      heartbeat-interval-ms: 3000
```

### Topic Configuration

```bash
# Create topic with optimized settings
kafka-topics --create \
  --topic user-events \
  --partitions 6 \
  --replication-factor 3 \
  --config retention.ms=604800000 \
  --config segment.ms=86400000 \
  --config compression.type=snappy
```

**Quick Check:** Which producer setting in this section helps improve throughput by batching?

---

## Fault Tolerance

In plain English: fault tolerance means the system keeps working even when components fail.

### Replication

```bash
# Create topic with replication factor 3
kafka-topics --create \
  --topic critical-events \
  --partitions 3 \
  --replication-factor 3
```

### Consumer Offset Management

```java
@Configuration
public class OffsetConfig {
    
    @Bean
    public ConsumerFactory<String, Object> consumerFactory() {
        Map<String, Object> config = new HashMap<>();
        // ... standard config ...
        
        // Manual offset commit for control
        config.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, false);
        
        return new DefaultKafkaConsumerFactory<>(config);
    }
}
```

### Idempotent Producer

```yaml
spring:
  kafka:
    producer:
      enable-idempotence: true
      acks: all
      max-in-flight-requests-per-connection: 5
```

### Retry Configuration

```java
@Configuration
public class RetryConfig {
    
    @Bean
    public RetryTemplate retryTemplate() {
        RetryTemplate retryTemplate = new RetryTemplate();
        
        ExponentialBackOffPolicy backOffPolicy = new ExponentialBackOffPolicy();
        backOffPolicy.setInitialInterval(1000);
        backOffPolicy.setMultiplier(2.0);
        backOffPolicy.setMaxInterval(10000);
        retryTemplate.setBackOffPolicy(backOffPolicy);
        
        SimpleRetryPolicy retryPolicy = new SimpleRetryPolicy();
        retryPolicy.setMaxAttempts(5);
        retryTemplate.setRetryPolicy(retryPolicy);
        
        return retryTemplate;
    }
}
```

**Quick Check:** Why combine replication, idempotence, and retries instead of using only one?

---

## Summary

### Key Takeaways

1. **Kafka Streams** for real-time stream processing
2. **Kafka Connect** for external system integration
3. **Transactions** for exactly-once semantics
4. **Security** with SASL/SSL
5. **Monitoring** with JMX, Micrometer, Prometheus
6. **Performance Tuning** for optimal throughput
7. **Fault Tolerance** with replication and retries

### Next Steps

- Read [Enterprise Patterns Guide](./04-enterprise-patterns.md)
- Build [Complete Application](./05-step-by-step-guide.md)
- Review [Architecture Diagrams](./diagrams/)

**Quick Check:** Which advanced feature from this file do you want to apply first in a sample project?

What's next? Continue with [Enterprise Patterns Guide](./04-enterprise-patterns.md).
