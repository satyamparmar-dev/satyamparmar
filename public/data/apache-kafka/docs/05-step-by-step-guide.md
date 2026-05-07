# Step-by-Step Application Guide

> ### What will you learn?
> - How to build Kafka producer and consumer services step by step.
> - How to add retries, streams, security, monitoring, and CI/CD.
> - How to verify each stage so you can move from local setup to production basics.

## 📚 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Step 1: Setup Kafka Cluster](#step-1-setup-kafka-cluster)
3. [Step 2: Create Spring Boot Producer Service](#step-2-create-spring-boot-producer-service)
4. [Step 3: Create Spring Boot Consumer Service](#step-3-create-spring-boot-consumer-service)
5. [Step 4: Implement Error Handling](#step-4-implement-error-handling)
6. [Step 5: Add Kafka Streams Processing](#step-5-add-kafka-streams-processing)
7. [Step 6: Secure Kafka with SSL/SASL](#step-6-secure-kafka-with-ssl-sasl)
8. [Step 7: Deploy and Monitor](#step-7-deploy-and-monitor)
9. [Step 8: CI/CD Pipeline](#step-8-cicd-pipeline)

---

## Prerequisites

### Required Software
- Java 17 or higher
- Maven 3.6+
- Docker and Docker Compose (for Kafka)
- IDE (IntelliJ IDEA, Eclipse, or VS Code)
- Git

### Knowledge Requirements
- Basic Java and Spring Boot
- Understanding of REST APIs
- Basic Docker knowledge

**Quick Check:** Which prerequisite is most important for you to review before coding?

---

## Step 1: Setup Kafka Cluster

In plain English: this step starts the Kafka infrastructure so your app has a broker to talk to.

### Option A: Docker Compose (Recommended for Development)

**Create `docker-compose.yml`:**
```yaml
version: '3.8'

services:
  zookeeper:
    image: confluentinc/cp-zookeeper:7.4.0
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
    ports:
      - "2181:2181"

  kafka:
    image: confluentinc/cp-kafka:7.4.0
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: "true"
```

**Start Kafka:**
```bash
docker-compose up -d
```

**Verify Kafka is running:**
```bash
docker-compose ps
```

**Create topics:**
```bash
docker exec -it kafka kafka-topics --create \
  --bootstrap-server localhost:9092 \
  --topic user-events \
  --partitions 3 \
  --replication-factor 1

docker exec -it kafka kafka-topics --list \
  --bootstrap-server localhost:9092
```

### Option B: Local Installation

1. Download Kafka from https://kafka.apache.org/downloads
2. Extract and navigate to Kafka directory
3. Start Zookeeper:
   ```bash
   bin/zookeeper-server-start.sh config/zookeeper.properties
   ```
4. Start Kafka:
   ```bash
   bin/kafka-server-start.sh config/server.properties
   ```

**Quick Check:** After startup, which command confirms Kafka containers are actually running?

---

## Step 2: Create Spring Boot Producer Service

In plain English: now you build the sender app that publishes events into Kafka topics.

### 2.1 Initialize Project

**Using Spring Initializr:**
- Go to https://start.spring.io
- Select: Maven, Java, Spring Boot 3.x
- Dependencies: Spring Web, Spring Kafka, Lombok (optional)

**Or use Maven command:**
```bash
mvn archetype:generate \
  -DgroupId=com.example \
  -DartifactId=kafka-producer-service \
  -DarchetypeArtifactId=maven-archetype-quickstart \
  -DinteractiveMode=false
```

### 2.2 Project Structure

```
kafka-producer-service/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/example/kafka/
│   │   │       ├── KafkaProducerServiceApplication.java
│   │   │       ├── config/
│   │   │       │   └── KafkaProducerConfig.java
│   │   │       ├── controller/
│   │   │       │   └── EventController.java
│   │   │       ├── dto/
│   │   │       │   └── UserEvent.java
│   │   │       └── service/
│   │   │           └── ProducerService.java
│   │   └── resources/
│   │       ├── application.yml
│   │       └── application-dev.yml
│   └── test/
└── pom.xml
```

### 2.3 Add Dependencies (pom.xml)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.1.0</version>
    </parent>
    
    <groupId>com.example</groupId>
    <artifactId>kafka-producer-service</artifactId>
    <version>1.0.0</version>
    
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.kafka</groupId>
            <artifactId>spring-kafka</artifactId>
        </dependency>
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>
```

### 2.4 Create Application Class

```java
package com.example.kafka;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class KafkaProducerServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(KafkaProducerServiceApplication.class, args);
    }
}
```

### 2.5 Create Configuration

**application.yml:**
```yaml
spring:
  application:
    name: kafka-producer-service
  
  kafka:
    bootstrap-servers: localhost:9092
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
      acks: all
      retries: 3
      batch-size: 16384
      linger-ms: 10
      enable-idempotence: true

server:
  port: 8080
```

### 2.6 Create DTO

```java
package com.example.kafka.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

public class UserEvent {
    private String userId;
    private String eventType;
    private LocalDateTime timestamp;
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

### 2.7 Create Producer Service

```java
package com.example.kafka.service;

import com.example.kafka.dto.UserEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;
import org.springframework.util.concurrent.ListenableFuture;
import org.springframework.util.concurrent.ListenableFutureCallback;

@Service
public class ProducerService {
    
    private static final Logger logger = LoggerFactory.getLogger(ProducerService.class);
    private final KafkaTemplate<String, Object> kafkaTemplate;
    
    public ProducerService(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }
    
    public void sendUserEvent(UserEvent event) {
        ListenableFuture<SendResult<String, Object>> future = 
            kafkaTemplate.send("user-events", event.getUserId(), event);
        
        future.addCallback(new ListenableFutureCallback<SendResult<String, Object>>() {
            @Override
            public void onSuccess(SendResult<String, Object> result) {
                logger.info("Message sent: topic={}, partition={}, offset={}",
                    result.getRecordMetadata().topic(),
                    result.getRecordMetadata().partition(),
                    result.getRecordMetadata().offset());
            }
            
            @Override
            public void onFailure(Throwable ex) {
                logger.error("Failed to send message", ex);
            }
        });
    }
}
```

### 2.8 Create Controller

```java
package com.example.kafka.controller;

import com.example.kafka.dto.UserEvent;
import com.example.kafka.service.ProducerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events")
public class EventController {
    
    private final ProducerService producerService;
    
    public EventController(ProducerService producerService) {
        this.producerService = producerService;
    }
    
    @PostMapping("/user")
    public ResponseEntity<String> publishUserEvent(@RequestBody UserEvent event) {
        try {
            producerService.sendUserEvent(event);
            return ResponseEntity.ok("Event published successfully");
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body("Failed to publish event: " + e.getMessage());
        }
    }
}
```

### 2.9 Test Producer

**Start the service:**
```bash
mvn spring-boot:run
```

**Send test event:**
```bash
curl -X POST http://localhost:8080/api/events/user \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "eventType": "LOGIN",
    "data": {"ip": "192.168.1.1"}
  }'
```

**Quick Check:** Why is `userId` useful as the Kafka message key in this flow?

---

## Step 3: Create Spring Boot Consumer Service

In plain English: this step builds the receiver app that reads and processes published events.

### 3.1 Create Consumer Project

Follow similar structure as producer service.

### 3.2 Consumer Configuration

**application.yml:**
```yaml
spring:
  application:
    name: kafka-consumer-service
  
  kafka:
    bootstrap-servers: localhost:9092
    consumer:
      group-id: user-events-group
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
      auto-offset-reset: earliest
      enable-auto-commit: false
    listener:
      ack-mode: manual_immediate
      concurrency: 3

server:
  port: 8081
```

### 3.3 Create Consumer Service

```java
package com.example.kafka.service;

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
public class ConsumerService {
    
    private static final Logger logger = LoggerFactory.getLogger(ConsumerService.class);
    
    @KafkaListener(topics = "user-events", groupId = "user-events-group")
    public void consumeUserEvent(
            @Payload UserEvent event,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset,
            Acknowledgment acknowledgment) {
        
        try {
            logger.info("Received: topic={}, partition={}, offset={}, userId={}",
                topic, partition, offset, event.getUserId());
            
            // Process event
            processEvent(event);
            
            // Acknowledge
            acknowledgment.acknowledge();
            
        } catch (Exception e) {
            logger.error("Error processing event", e);
            // Don't acknowledge - will be retried
        }
    }
    
    private void processEvent(UserEvent event) {
        // Business logic here
        logger.info("Processing event: userId={}, type={}", 
            event.getUserId(), event.getEventType());
    }
}
```

### 3.4 Test Consumer

**Start consumer service:**
```bash
mvn spring-boot:run
```

**Verify messages are consumed:**
- Check logs for consumed messages
- Send events from producer service

**Quick Check:** Why is manual acknowledgment used in the consumer configuration?

---

## Step 4: Implement Error Handling

In plain English: if processing fails, we prevent message loss by retrying or moving to a dead-letter topic.

### 4.1 Create Dead Letter Queue Handler

```java
@Service
public class DeadLetterQueueHandler {
    
    private final KafkaTemplate<String, Object> kafkaTemplate;
    
    @KafkaListener(topics = "user-events", groupId = "user-events-group")
    public void consumeWithErrorHandling(
            @Payload UserEvent event,
            Acknowledgment acknowledgment) {
        
        try {
            processEvent(event);
            acknowledgment.acknowledge();
            
        } catch (Exception e) {
            logger.error("Processing failed, sending to DLQ", e);
            
            // Send to dead-letter topic
            kafkaTemplate.send("user-events-dlq", event.getUserId(), event);
            acknowledgment.acknowledge(); // Acknowledge to avoid infinite retry
        }
    }
}
```

### 4.2 Create Retry Configuration

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
        retryPolicy.setMaxAttempts(3);
        retryTemplate.setRetryPolicy(retryPolicy);
        
        return retryTemplate;
    }
}
```

**Quick Check:** What problem is avoided by sending failed messages to `user-events-dlq`?

---

## Step 5: Add Kafka Streams Processing

In plain English: this step shows stream processing, where one input topic is transformed into another output topic.

### 5.1 Add Dependencies

```xml
<dependency>
    <groupId>org.apache.kafka</groupId>
    <artifactId>kafka-streams</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.kafka</groupId>
    <artifactId>spring-kafka</artifactId>
</dependency>
```

### 5.2 Create Streams Configuration

```java
@Configuration
@EnableKafkaStreams
public class KafkaStreamsConfig {
    
    @Bean
    public KStream<String, UserEvent> processUserEvents(StreamsBuilder streamsBuilder) {
        KStream<String, UserEvent> source = streamsBuilder.stream("user-events");
        
        // Filter and count login events
        KTable<String, Long> loginCounts = source
            .filter((key, value) -> "LOGIN".equals(value.getEventType()))
            .groupByKey()
            .count();
        
        // Write to output topic
        loginCounts.toStream().to("user-login-counts");
        
        return source;
    }
}
```

**Quick Check:** What is written to the `user-login-counts` topic in this example?

---

## Step 6: Secure Kafka with SSL/SASL

In plain English: this section secures communication between Kafka and your services.

### 6.1 Generate SSL Certificates

```bash
# Create keystore
keytool -keystore kafka.server.keystore.jks \
  -alias localhost -validity 365 \
  -genkey -keyalg RSA

# Create truststore
keytool -keystore kafka.server.truststore.jks \
  -alias CARoot -import -file ca-cert
```

### 6.2 Update Kafka Configuration

**server.properties:**
```properties
listeners=SSL://localhost:9093
security.inter.broker.protocol=SSL
ssl.keystore.location=/path/to/kafka.server.keystore.jks
ssl.keystore.password=password
ssl.key.password=password
ssl.truststore.location=/path/to/kafka.server.truststore.jks
ssl.truststore.password=password
```

### 6.3 Update Spring Boot Configuration

```yaml
spring:
  kafka:
    bootstrap-servers: localhost:9093
    properties:
      security.protocol: SSL
      ssl.truststore.location: /path/to/client.truststore.jks
      ssl.truststore.password: password
```

**Quick Check:** Why do both Kafka server and Spring client need SSL settings?

---

## Step 7: Deploy and Monitor

In plain English: this step packages your app for deployment and exposes health/metrics endpoints.

### 7.1 Add Monitoring Dependencies

```xml
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

### 7.2 Enable Actuator

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,metrics,prometheus
```

### 7.3 Create Dockerfile

```dockerfile
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/kafka-producer-service-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 7.4 Build and Run

```bash
mvn clean package
docker build -t kafka-producer-service .
docker run -p 8080:8080 kafka-producer-service
```

**Quick Check:** Which endpoint exposure setting allows Prometheus scraping here?

---

## Step 8: CI/CD Pipeline

In plain English: CI/CD automates build, test, image creation, and deployment checks on every change.

### 8.1 GitHub Actions Example

**.github/workflows/ci-cd.yml:**
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-java@v3
        with:
          java-version: '17'
      
      - name: Build with Maven
        run: mvn clean package
      
      - name: Run Tests
        run: mvn test
      
      - name: Build Docker Image
        run: docker build -t kafka-producer-service .
      
      - name: Deploy
        run: |
          # Deployment steps
          echo "Deploying..."
```

**Quick Check:** Which CI step should fail the pipeline if unit tests break?

---

## Summary

### What We Built

1. ✅ Kafka cluster setup (Docker)
2. ✅ Spring Boot producer service
3. ✅ Spring Boot consumer service
4. ✅ Error handling and retries
5. ✅ Kafka Streams processing
6. ✅ Security (SSL/SASL)
7. ✅ Monitoring and metrics
8. ✅ CI/CD pipeline

### Next Steps

- Review [Architecture Diagrams](./diagrams/)
- Explore [Advanced Features](./03-advanced-features.md)
- Implement [Enterprise Patterns](./04-enterprise-patterns.md)
- Scale and optimize for production

**Quick Check:** Which step in this guide felt most critical for making the system production-ready?

---

## Troubleshooting

### Common Issues

1. **Kafka not accessible**: Check firewall and network settings
2. **Consumer not receiving messages**: Verify group-id and topic name
3. **Serialization errors**: Check serializer/deserializer configuration
4. **Performance issues**: Tune batch size and linger.ms

### Debug Commands

```bash
# List topics
kafka-topics --list --bootstrap-server localhost:9092

# Describe topic
kafka-topics --describe --topic user-events --bootstrap-server localhost:9092

# Consume messages (for testing)
kafka-console-consumer --bootstrap-server localhost:9092 \
  --topic user-events --from-beginning

# Check consumer groups
kafka-consumer-groups --bootstrap-server localhost:9092 --list
```

**Quick Check:** Which debug command helps you verify whether your topic exists and has partitions?

What's next? Continue with the enterprise guide in [Enterprise-Level Application](./06-enterprise-application.md).
