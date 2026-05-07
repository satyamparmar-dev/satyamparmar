/**
 * Generator — creates public/data/kafkaRoadmap.json
 * Apache Kafka roadmap: Fresher → Senior → Tech Lead → Staff/Architect
 * Enterprise-grade content: story first, plain language, full code + output, pitfalls, interview summary
 */
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../public/data/kafkaRoadmap.json');

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 1 — FRESHER
// ─────────────────────────────────────────────────────────────────────────────

const t1_what_is_kafka = `# What Is Apache Kafka and Why Does It Exist?

---

## The Problem — A Story About a Broken E-commerce Site

It is 2014. A team at LinkedIn has a serious problem.

They have dozens of internal systems — analytics, monitoring, search, recommendations — and they all need real-time data from each other. Every system is sending data directly to every other system. 100 systems × 100 systems = 10,000 connections. When one system goes down, it takes down everything connected to it. When traffic spikes, everything slows together.

They called this the "data pipeline spaghetti problem."

They solved it by building Apache Kafka — and then open-sourcing it.

You will hit the same problem the moment your application needs to talk to more than two other services at the same time.

---

## What Is Apache Kafka? (Plain Language)

**Apache Kafka** is a system that lets different programs send messages to each other without talking directly. Think of it like a post office.

Without Kafka (direct messaging):
- Your Order Service calls Payment Service directly → if Payment is down, Order fails
- Your Order Service calls Inventory directly → if Inventory is slow, Order slows down
- Every service knows about every other service → change one, change all

With Kafka (message broker):
- Your Order Service drops a message ("order placed") into Kafka and moves on
- Payment Service, Inventory Service, Notification Service each read that message when they are ready
- Services do not know about each other — they only know about Kafka

Kafka is the post office. Your services are the senders and receivers. The "letters" are called **messages** or **events**.

---

## Core Vocabulary — 5 Words You Must Know

| Term | What It Means | Analogy |
|---|---|---|
| **Topic** | A named channel for messages (like a category) | A specific mailbox at the post office |
| **Producer** | The service that sends messages | The person who drops a letter in the mailbox |
| **Consumer** | The service that reads messages | The person who picks up letters |
| **Broker** | A Kafka server that stores messages | The post office building |
| **Partition** | A section of a topic (for parallel processing) | Multiple mailboxes in the same category |

---

## How Kafka Works (Behind the Scenes — Simple Version)

\`\`\`
Your Order Service (Producer)
        │
        │  "Order #123 placed by user 456, amount ₹2500"
        │
        ▼
  ┌─────────────────────────────────┐
  │     Apache Kafka Broker         │
  │                                 │
  │  Topic: "order-events"          │
  │  ├── Partition 0: [msg1, msg2]  │
  │  ├── Partition 1: [msg3, msg4]  │
  │  └── Partition 2: [msg5, msg6]  │
  └─────────────────────────────────┘
        │                │                │
        ▼                ▼                ▼
  Payment          Inventory        Notification
  Service          Service          Service
  (Consumer)       (Consumer)       (Consumer)
\`\`\`

Key thing to understand: **Kafka stores messages.** Unlike a phone call (lost if nobody picks up), a Kafka message is written to disk. Even if Payment Service is down right now, when it comes back, it reads the message from Kafka. Nothing is lost.

---

## Why Kafka Instead of a Simple HTTP Call?

| Situation | Direct HTTP Call | Kafka |
|---|---|---|
| Receiver service is down | Your call fails immediately | Message waits in Kafka, processed when receiver comes back |
| 100,000 events per second | Receiver gets overwhelmed | Kafka buffers the load, receivers process at their own pace |
| 5 services need the same event | Call each one sequentially | All 5 read from Kafka independently |
| You add a 6th service later | Change the sender code | 6th service just starts reading from Kafka — sender unchanged |
| Replay old events | Impossible | Kafka stores events for days/weeks — replay any time |

---

## Setting Up Kafka Locally with Docker

You do not need to install anything. One command starts Kafka:

\`\`\`yaml
# docker-compose.yml — save this file and run: docker-compose up -d
version: '3.8'
services:
  zookeeper:
    image: confluentinc/cp-zookeeper:7.6.0
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
    ports:
      - "2181:2181"

  kafka:
    image: confluentinc/cp-kafka:7.6.0
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1   # 1 is fine for local dev
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: "true"
\`\`\`

\`\`\`bash
# Start Kafka
docker-compose up -d

# Verify it is running
docker-compose ps

# Create a test topic
docker exec kafka kafka-topics --bootstrap-server localhost:9092 \\
  --create --topic order-events --partitions 3 --replication-factor 1

# List topics
docker exec kafka kafka-topics --bootstrap-server localhost:9092 --list
\`\`\`

---

## Interview-Ready Summary

- **Kafka** is a distributed message broker — services send events to Kafka instead of calling each other directly
- The main benefit: **decoupling** — senders and receivers do not need to know about each other
- Unlike HTTP, Kafka **persists messages to disk**, so a receiver can be offline and still get every message when it comes back
- Core terms: **topic** (category), **producer** (sender), **consumer** (receiver), **broker** (Kafka server), **partition** (parallel slot)
- **Interview signal:** "I used Kafka to decouple our Order Service from 4 downstream services — each service reads at its own pace, and we replay events during incidents to reprocess missed data"`;

const t2_core_concepts = `# Kafka Core Concepts Deep Dive — Topics, Partitions, Offsets, Brokers

---

## The Problem — What Happens When One Kafka Server Is Not Enough?

Imagine you are running a food delivery app. On a normal day, 1,000 orders per minute. On Diwali, 100,000 orders per minute.

If Kafka is one server and one topic is one file — you hit the disk write limit of a single machine. The system slows. Orders are delayed. Customers are angry.

This is why Kafka was designed around **partitions**. Instead of one file, a topic is split into many files across many machines. Each file is a partition. Each machine is a broker.

---

## Topics — The Named Channel

A **topic** is just a named category of messages. When you produce a message, you tell Kafka which topic to put it in. When you consume, you tell Kafka which topic to read from.

Topic naming best practice (enterprise standard):
\`\`\`
{service}-{entity}-{event-type}

Examples:
  order-service.orders.created
  payment-service.payments.processed
  inventory-service.stock.updated
  notification-service.emails.sent
\`\`\`

---

## Partitions — How Kafka Scales

A **partition** is the unit of parallelism in Kafka.

\`\`\`
Topic: "order-events" with 3 partitions

Partition 0: [offset 0: order#1] [offset 1: order#4] [offset 2: order#7] →
Partition 1: [offset 0: order#2] [offset 1: order#5] [offset 2: order#8] →
Partition 2: [offset 0: order#3] [offset 1: order#6] [offset 2: order#9] →
\`\`\`

Key rules about partitions:
- **Order is guaranteed within a partition** — if order#1 and order#4 are in Partition 0, you always read them in that order
- **Order is NOT guaranteed across partitions** — order#4 might arrive before order#3 if they are in different partitions
- **One partition = one consumer at a time** — you cannot have 2 consumers from the same group reading the same partition simultaneously

**How many partitions?** A common rule is 3× the number of consumer instances you plan to run. More partitions = more parallelism, but also more overhead. Start with 3–6 for most topics.

---

## Offsets — Kafka's Bookmark System

An **offset** is a number that marks where a consumer stopped reading.

\`\`\`
Partition 0: [msg at offset 0] [msg at offset 1] [msg at offset 2] [msg at offset 3]
                                                            ↑
                                               Consumer read up to here (offset 2)
                                               Next read starts at offset 3
\`\`\`

Kafka stores offsets in a special internal topic called \`__consumer_offsets\`. Every consumer group has its own offset per partition. This means:
- Consumer Group A can be at offset 50
- Consumer Group B can be at offset 10 (reading the same topic, but behind)
- Both groups read independently — neither affects the other

This is why Kafka is called a **log** — you can always go back and re-read from any offset.

---

## Brokers — Kafka Servers

A **broker** is a Kafka server. In production you run 3 or more brokers for fault tolerance.

\`\`\`
Kafka Cluster (3 brokers)

Broker 1 (Leader for Partition 0)    ← Producers write here
Broker 2 (Leader for Partition 1)    ← Producers write here
Broker 3 (Leader for Partition 2)    ← Producers write here

Each partition is also replicated:
Broker 1 holds: Partition 0 (Leader), Partition 1 (Replica), Partition 2 (Replica)
Broker 2 holds: Partition 0 (Replica), Partition 1 (Leader), Partition 2 (Replica)
Broker 3 holds: Partition 0 (Replica), Partition 1 (Replica), Partition 2 (Leader)
\`\`\`

**Replication factor** = how many copies of each partition exist. In production: always 3. This means Kafka can lose 2 out of 3 brokers and still serve traffic.

---

## Exploring Partitions and Offsets with Command Line

\`\`\`bash
# See partition and replica details for a topic
docker exec kafka kafka-topics --bootstrap-server localhost:9092 \\
  --describe --topic order-events

# Output:
# Topic: order-events  Partitions: 3  ReplicationFactor: 1
# Topic: order-events  Partition: 0  Leader: 1  Replicas: 1  Isr: 1
# Topic: order-events  Partition: 1  Leader: 1  Replicas: 1  Isr: 1
# Topic: order-events  Partition: 2  Leader: 1  Replicas: 1  Isr: 1

# Check consumer group offsets (where each consumer is)
docker exec kafka kafka-consumer-groups --bootstrap-server localhost:9092 \\
  --describe --group payment-service-group

# Output:
# GROUP                 TOPIC        PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG
# payment-service-group order-events 0          45              45              0
# payment-service-group order-events 1          52              52              0
# payment-service-group order-events 2          41              41              0
# LAG = 0 means consumer is caught up
\`\`\`

---

## Interview-Ready Summary

- A **topic** is a named category — like a table in a database, but append-only
- A **partition** is a split of a topic that enables parallel processing — more partitions = more consumer threads
- An **offset** is a sequential number marking position in a partition — Kafka remembers where each consumer group stopped
- A **broker** is a Kafka server — run 3 in production with replication factor 3 for fault tolerance
- **Interview signal:** "We had 12 partitions on our order topic — 4 consumer instances each handling 3 partitions. When we scaled to 8 instances, we needed 24 partitions to get full parallelism — one partition per consumer thread"`;

const t3_first_producer = `# Writing Your First Java Kafka Producer

---

## The Problem — How Does My Code Send a Message to Kafka?

You have Kafka running. You have a topic. Now how does your Java code actually put a message in?

A **producer** is Java code that connects to Kafka, constructs a message, and sends it. The message has two parts: a **key** (optional, used for partitioning) and a **value** (the actual content).

---

## Maven Dependency

\`\`\`xml
<!-- In your pom.xml -->
<dependency>
    <groupId>org.apache.kafka</groupId>
    <artifactId>kafka-clients</artifactId>
    <version>3.7.0</version>
</dependency>

<!-- For JSON serialization -->
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.17.0</version>
</dependency>
\`\`\`

---

## Step 1 — Simple String Producer (Understand the Basics)

\`\`\`java
package com.satyverse.kafka.producer;

import org.apache.kafka.clients.producer.*;
import org.apache.kafka.common.serialization.StringSerializer;

import java.util.Properties;

public class SimpleOrderProducer {

    public static void main(String[] args) throws Exception {

        // Step 1: Configure the producer
        Properties props = new Properties();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());

        // Step 2: Create the producer
        try (KafkaProducer<String, String> producer = new KafkaProducer<>(props)) {

            // Step 3: Build the message (record)
            // Key = orderId (used to decide which partition the message goes to)
            // Value = the actual message content
            ProducerRecord<String, String> record = new ProducerRecord<>(
                "order-events",           // topic name
                "order-123",              // key
                "Order placed: ₹2500"     // value
            );

            // Step 4: Send the message
            // send() is asynchronous — it returns a Future
            // get() blocks until Kafka confirms the message is written
            RecordMetadata metadata = producer.send(record).get();

            System.out.println("Message sent successfully!");
            System.out.println("Topic     : " + metadata.topic());
            System.out.println("Partition : " + metadata.partition());
            System.out.println("Offset    : " + metadata.offset());
        }
    }
}
\`\`\`

**Expected output:**
\`\`\`
Message sent successfully!
Topic     : order-events
Partition : 1
Offset    : 0
\`\`\`

---

## Step 2 — Production-Grade Producer (What You Actually Ship)

\`\`\`java
package com.satyverse.kafka.producer;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.kafka.clients.producer.*;
import org.apache.kafka.common.serialization.StringSerializer;

import java.util.Properties;
import java.util.concurrent.ExecutionException;

public class OrderEventProducer {

    private final KafkaProducer<String, String> producer;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final String TOPIC = "order-events";

    public OrderEventProducer() {
        Properties props = new Properties();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());

        // Reliability: wait for all replicas to acknowledge
        // "all" = strongest guarantee; "1" = only leader; "0" = fire and forget
        props.put(ProducerConfig.ACKS_CONFIG, "all");

        // Retry up to 3 times if the broker is temporarily unavailable
        props.put(ProducerConfig.RETRIES_CONFIG, 3);

        // Idempotence: ensures exactly one write even if producer retries
        // Requires acks=all and retries > 0
        props.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);

        this.producer = new KafkaProducer<>(props);
    }

    public void sendOrderEvent(String orderId, OrderEvent event) {
        try {
            String payload = objectMapper.writeValueAsString(event);

            ProducerRecord<String, String> record = new ProducerRecord<>(
                TOPIC,
                orderId,   // key → same orderId always goes to same partition
                payload
            );

            // Synchronous send: blocks until Kafka confirms
            RecordMetadata metadata = producer.send(record).get();

            System.out.printf("Sent order event | topic=%s partition=%d offset=%d orderId=%s%n",
                metadata.topic(), metadata.partition(), metadata.offset(), orderId);

        } catch (ExecutionException e) {
            // Kafka rejected the message even after retries
            System.err.println("Failed to send order event: " + e.getCause().getMessage());
            throw new RuntimeException("Kafka send failed", e);
        } catch (Exception e) {
            System.err.println("Unexpected error: " + e.getMessage());
            throw new RuntimeException("Order event send error", e);
        }
    }

    public void close() {
        // Always flush + close to avoid losing buffered messages
        producer.flush();
        producer.close();
    }

    // Simple event model
    public record OrderEvent(String orderId, String userId, double amount, String status) {}

    public static void main(String[] args) {
        OrderEventProducer p = new OrderEventProducer();
        try {
            p.sendOrderEvent("order-123",
                new OrderEvent("order-123", "user-456", 2500.0, "PLACED"));
            p.sendOrderEvent("order-124",
                new OrderEvent("order-124", "user-789", 1200.0, "PLACED"));
        } finally {
            p.close();
        }
    }
}
\`\`\`

**Expected output:**
\`\`\`
Sent order event | topic=order-events partition=1 offset=0 orderId=order-123
Sent order event | topic=order-events partition=2 offset=0 orderId=order-124
\`\`\`

---

## Key Producer Config Explained

| Config | Value | What It Does | When to Change |
|---|---|---|---|
| \`acks\` | \`all\` | Wait for all replicas to confirm | Use \`1\` for lower latency if you can tolerate rare loss |
| \`retries\` | \`3\` | Retry on transient failures | Increase to 5 for critical data |
| \`enable.idempotence\` | \`true\` | Prevents duplicate writes on retry | Always true in production |
| \`compression.type\` | \`lz4\` | Compress messages before sending | Use for high-throughput topics |
| \`linger.ms\` | \`5\` | Wait 5ms to batch more messages | Higher = better throughput, higher latency |
| \`batch.size\` | \`16384\` | Max bytes per batch | Increase for high-throughput |

---

## Interview-Ready Summary

- A **producer** configures a connection to Kafka, builds \`ProducerRecord\` objects, and calls \`send()\`
- The **key** decides which partition the message lands in — same key always = same partition = ordering guarantee
- **acks=all + enable.idempotence=true** is the production-safe combination — prevents both data loss and duplicates
- \`send().get()\` is synchronous (safe but slower); \`send(callback)\` is async (faster, use for high throughput)
- **Interview signal:** "We set acks=all and idempotent producer enabled — this gave us exactly-once writes into Kafka, which was critical for our payment events"`;

const t4_first_consumer = `# Writing Your First Java Kafka Consumer

---

## The Problem — How Do I Read Messages From Kafka?

Messages are in Kafka. Now your Payment Service, Inventory Service, Notification Service all need to read them — independently, at their own pace, without missing a single one.

This is what a **consumer** does. It connects to Kafka, says "I want to read topic X starting from offset Y," and polls for new messages in a loop.

The most important concept: **consumer groups**. Multiple consumers with the same \`group.id\` form a team. Kafka divides the topic's partitions between them. If you have 3 partitions and 3 consumers in a group, each consumer gets one partition. Kafka automatically rebalances if a consumer leaves or joins.

---

## Step 1 — Simple Consumer (Read and Print)

\`\`\`java
package com.satyverse.kafka.consumer;

import org.apache.kafka.clients.consumer.*;
import org.apache.kafka.common.serialization.StringDeserializer;

import java.time.Duration;
import java.util.List;
import java.util.Properties;

public class SimpleOrderConsumer {

    public static void main(String[] args) {

        // Step 1: Configure
        Properties props = new Properties();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        // group.id: all consumers with the same ID form a group
        // Kafka divides partitions between them
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "payment-service-group");
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        // What to do when the group has no committed offset yet:
        // "earliest" = read from the very beginning of the topic
        // "latest"   = only read new messages (default)
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");

        try (KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props)) {

            // Step 2: Subscribe to topic
            consumer.subscribe(List.of("order-events"));

            System.out.println("Consumer started. Waiting for messages...");

            // Step 3: Poll loop — keep polling until shutdown
            while (true) {
                // poll() blocks for up to 1 second waiting for messages
                ConsumerRecords<String, String> records = consumer.poll(Duration.ofSeconds(1));

                for (ConsumerRecord<String, String> record : records) {
                    System.out.printf("Received | partition=%d offset=%d key=%s value=%s%n",
                        record.partition(), record.offset(), record.key(), record.value());

                    // Process the message here (charge the payment, update inventory, etc.)
                    processMessage(record.key(), record.value());
                }
                // After processing, Kafka auto-commits offsets (default: every 5 seconds)
            }
        }
    }

    static void processMessage(String key, String value) {
        System.out.println("Processing order: " + key);
    }
}
\`\`\`

**Expected output:**
\`\`\`
Consumer started. Waiting for messages...
Received | partition=1 offset=0 key=order-123 value={"orderId":"order-123","userId":"user-456","amount":2500.0,"status":"PLACED"}
Processing order: order-123
Received | partition=2 offset=0 key=order-124 value={"orderId":"order-124","userId":"user-789","amount":1200.0,"status":"PLACED"}
Processing order: order-124
\`\`\`

---

## Step 2 — Production-Grade Consumer (Manual Offset Commit)

\`\`\`java
package com.satyverse.kafka.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.kafka.clients.consumer.*;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.serialization.StringDeserializer;

import java.time.Duration;
import java.util.*;

public class OrderEventConsumer {

    private final KafkaConsumer<String, String> consumer;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private volatile boolean running = true;

    public OrderEventConsumer() {
        Properties props = new Properties();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "payment-service-group");
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");

        // Disable auto-commit — we will commit manually after successful processing
        // This prevents marking a message as "done" before we actually processed it
        props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, false);

        // How many records to fetch in one poll()
        props.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, 50);

        this.consumer = new KafkaConsumer<>(props);
    }

    public void start() {
        consumer.subscribe(List.of("order-events"));

        // Shutdown hook — gracefully stop on Ctrl+C
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            System.out.println("Shutdown signal received — stopping consumer...");
            running = false;
            consumer.wakeup();   // interrupts the poll() call
        }));

        System.out.println("Consumer started [group=payment-service-group]");

        try {
            while (running) {
                ConsumerRecords<String, String> records = consumer.poll(Duration.ofSeconds(1));

                if (records.isEmpty()) continue;

                for (ConsumerRecord<String, String> record : records) {
                    try {
                        processOrderEvent(record);
                    } catch (Exception e) {
                        // Log the failure — do NOT commit offset — Kafka will redeliver
                        System.err.printf("Failed to process record at partition=%d offset=%d: %s%n",
                            record.partition(), record.offset(), e.getMessage());
                        // In production: route to Dead Letter Topic instead of stopping
                    }
                }

                // Commit after processing the whole batch
                // This tells Kafka: "we successfully processed everything up to these offsets"
                consumer.commitSync();
                System.out.printf("Committed offsets for %d records%n", records.count());
            }
        } catch (org.apache.kafka.common.errors.WakeupException e) {
            // Normal shutdown — wakeup() throws this to interrupt poll()
            if (running) throw e;
        } finally {
            consumer.close();
            System.out.println("Consumer closed cleanly.");
        }
    }

    private void processOrderEvent(ConsumerRecord<String, String> record) throws Exception {
        System.out.printf("Processing | partition=%d offset=%d orderId=%s%n",
            record.partition(), record.offset(), record.key());
        // Parse JSON and do real work here
        // paymentService.charge(orderId, amount);
    }

    public static void main(String[] args) {
        new OrderEventConsumer().start();
    }
}
\`\`\`

---

## Key Consumer Config Explained

| Config | Value | What It Does |
|---|---|---|
| \`group.id\` | \`"payment-service-group"\` | Groups consumers — Kafka divides partitions between them |
| \`auto.offset.reset\` | \`"earliest"\` | Start from beginning when no offset exists |
| \`enable.auto.commit\` | \`false\` | Commit offsets manually after processing |
| \`max.poll.records\` | \`50\` | Process 50 messages per poll — controls batch size |
| \`session.timeout.ms\` | \`30000\` | Kafka marks consumer dead if no heartbeat for 30s |

---

## Interview-Ready Summary

- A consumer uses \`poll()\` in a loop — Kafka pushes no data, consumers pull
- \`group.id\` is critical — same group = partitions shared; different group = each consumer reads all partitions independently
- **Manual offset commit** (\`enable.auto.commit=false\` + \`commitSync()\`) is production best practice — auto-commit can mark messages as processed before your code finished
- \`consumer.wakeup()\` is the correct way to stop a consumer — it interrupts \`poll()\` cleanly
- **Interview signal:** "We disabled auto-commit and used manual commitSync() after the database write — this ensured we never lost an event even if the consumer crashed mid-batch"`;

const t5_spring_boot_kafka = `# Kafka with Spring Boot — spring-kafka Basics

---

## The Problem — Writing Raw Kafka Code Is Repetitive

The raw Java Kafka client works, but you end up writing the same boilerplate in every project:
- Configure properties manually
- Write poll loops
- Handle shutdown hooks
- Manage serialization/deserialization
- Wire it into your Spring context

**Spring Kafka** eliminates all of this. You add one dependency, write a few lines of configuration, and use annotations to define producers and consumers.

---

## Maven Dependency

\`\`\`xml
<dependency>
    <groupId>org.springframework.kafka</groupId>
    <artifactId>spring-kafka</artifactId>
    <!-- Version managed by Spring Boot parent -->
</dependency>
\`\`\`

---

## Configuration (application.yml)

\`\`\`yaml
spring:
  kafka:
    bootstrap-servers: localhost:9092

    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
      acks: all
      retries: 3
      properties:
        enable.idempotence: true

    consumer:
      group-id: payment-service-group
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
      auto-offset-reset: earliest
      enable-auto-commit: false
      properties:
        spring.json.trusted.packages: "com.satyverse.kafka.model"
        max.poll.records: 50

    listener:
      ack-mode: MANUAL_IMMEDIATE   # commit offsets manually
\`\`\`

---

## The Event Model

\`\`\`java
package com.satyverse.kafka.model;

// Records work perfectly as Kafka message payloads — immutable, serializable
public record OrderEvent(
    String orderId,
    String userId,
    double amount,
    String status,
    long timestamp
) {}
\`\`\`

---

## Producer — KafkaTemplate

\`\`\`java
package com.satyverse.kafka.producer;

import com.satyverse.kafka.model.OrderEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderEventProducer {

    private final KafkaTemplate<String, OrderEvent> kafkaTemplate;
    private static final String TOPIC = "order-events";

    /**
     * Sends an order event to Kafka.
     * Key = orderId ensures all events for the same order go to the same partition.
     * This preserves order per-order even when there are multiple partitions.
     */
    public void sendOrderEvent(OrderEvent event) {
        CompletableFuture<SendResult<String, OrderEvent>> future =
            kafkaTemplate.send(TOPIC, event.orderId(), event);

        future.whenComplete((result, ex) -> {
            if (ex == null) {
                log.info("Order event sent | orderId={} partition={} offset={}",
                    event.orderId(),
                    result.getRecordMetadata().partition(),
                    result.getRecordMetadata().offset());
            } else {
                log.error("Failed to send order event | orderId={} error={}",
                    event.orderId(), ex.getMessage());
                // In production: save to outbox table for retry
            }
        });
    }
}
\`\`\`

---

## Consumer — @KafkaListener

\`\`\`java
package com.satyverse.kafka.consumer;

import com.satyverse.kafka.model.OrderEvent;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class PaymentEventConsumer {

    /**
     * @KafkaListener wires up the poll loop, thread management,
     * and deserialization for you.
     *
     * topics    = which topics to subscribe to
     * groupId   = the consumer group (overrides application.yml if needed)
     * containerFactory = which listener factory to use (default is fine for most cases)
     */
    @KafkaListener(topics = "order-events", groupId = "payment-service-group")
    public void handleOrderEvent(
            ConsumerRecord<String, OrderEvent> record,
            Acknowledgment ack) {   // Acknowledgment = manual offset commit

        OrderEvent event = record.value();
        log.info("Received order event | orderId={} partition={} offset={}",
            event.orderId(), record.partition(), record.offset());

        try {
            // Your business logic here
            processPayment(event);

            // Commit the offset ONLY after successful processing
            // If this throws, offset is NOT committed → Kafka redelivers the message
            ack.acknowledge();

            log.info("Payment processed and offset committed | orderId={}", event.orderId());

        } catch (Exception e) {
            log.error("Payment processing failed | orderId={} error={}",
                event.orderId(), e.getMessage());
            // Do NOT acknowledge → Kafka will redeliver
            // In production: configure @RetryableTopic or DLT (dead letter topic)
        }
    }

    private void processPayment(OrderEvent event) {
        // Charge the customer, update database, publish payment event
        log.info("Charging ₹{} for order {} by user {}",
            event.amount(), event.orderId(), event.userId());
    }
}
\`\`\`

---

## REST Controller to Trigger Events

\`\`\`java
package com.satyverse.kafka.controller;

import com.satyverse.kafka.model.OrderEvent;
import com.satyverse.kafka.producer.OrderEventProducer;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderEventProducer producer;

    @PostMapping
    public ResponseEntity<String> placeOrder(@RequestBody OrderRequest request) {
        OrderEvent event = new OrderEvent(
            request.orderId(),
            request.userId(),
            request.amount(),
            "PLACED",
            Instant.now().toEpochMilli()
        );
        producer.sendOrderEvent(event);
        return ResponseEntity.accepted().body("Order accepted: " + request.orderId());
    }

    public record OrderRequest(String orderId, String userId, double amount) {}
}
\`\`\`

**Test with curl:**
\`\`\`bash
curl -X POST http://localhost:8080/api/orders \\
  -H "Content-Type: application/json" \\
  -d '{"orderId":"order-125","userId":"user-999","amount":3500.0}'

# Response:
# Order accepted: order-125

# Consumer log output:
# Received order event | orderId=order-125 partition=0 offset=2
# Charging ₹3500.0 for order order-125 by user user-999
# Payment processed and offset committed | orderId=order-125
\`\`\`

---

## Interview-Ready Summary

- **Spring Kafka** wraps raw Kafka clients — \`KafkaTemplate\` for producing, \`@KafkaListener\` for consuming
- Configure in \`application.yml\` — no boilerplate Java configuration needed for standard setups
- Use \`ack-mode: MANUAL_IMMEDIATE\` + \`Acknowledgment.acknowledge()\` — same safety as raw \`commitSync()\`
- The key goes in \`kafkaTemplate.send(topic, key, value)\` — use the business entity ID as the key
- **Interview signal:** "We used @KafkaListener with MANUAL_IMMEDIATE ack mode — if the DB write failed, we did not acknowledge, so Kafka redelivered and we got exactly-once processing with our idempotency key check"`;

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 2 — SENIOR DEVELOPER
// ─────────────────────────────────────────────────────────────────────────────

const t6_consumer_groups = `# Consumer Groups and Partition Assignment

---

## The Problem — One Consumer Is Not Enough

Your \`payment-service\` consumes from \`order-events\`. Works great at 100 orders/minute. At 10,000 orders/minute, your single consumer thread cannot keep up. Orders pile up. Payment lag grows. Your on-call phone rings.

The solution is **consumer groups** — multiple consumer instances sharing the work.

---

## How Consumer Groups Work (Behind the Scenes)

\`\`\`
Topic: order-events (4 partitions)

Without scaling (1 consumer in group):
  Consumer A ← handles Partition 0, 1, 2, 3 (all of them alone)

With 2 consumers in same group:
  Consumer A ← handles Partition 0, 1
  Consumer B ← handles Partition 2, 3

With 4 consumers in same group (optimal):
  Consumer A ← Partition 0
  Consumer B ← Partition 1
  Consumer C ← Partition 2
  Consumer D ← Partition 3

With 5 consumers (one sits idle):
  Consumer A ← Partition 0
  Consumer B ← Partition 1
  Consumer C ← Partition 2
  Consumer D ← Partition 3
  Consumer E ← (idle — no partition available)
\`\`\`

**Rule:** max useful consumers in a group = number of partitions. Adding more consumers than partitions gives no benefit.

---

## The Rebalance — What Happens When a Consumer Joins or Leaves

When a consumer joins or leaves the group, Kafka **rebalances** — reassigns which partitions each consumer handles.

\`\`\`
Before: Consumer A (P0, P1), Consumer B (P2, P3)

Consumer C joins:
1. Kafka tells all consumers: "Stop processing, we are rebalancing"
2. All consumers pause their poll() loops
3. Group Coordinator (a Kafka broker) assigns partitions:
   Consumer A ← P0
   Consumer B ← P1, P2
   Consumer C ← P3
4. All consumers resume

This pause is called "stop-the-world rebalance" — it causes a processing gap
\`\`\`

In newer Kafka versions (2.4+), **cooperative rebalancing** only moves the partitions that changed — most consumers keep processing during the rebalance.

---

## Consumer Group with Spring Boot — Scale by Adding Instances

\`\`\`java
// No code changes needed to scale — just set concurrency
@Configuration
public class KafkaConsumerConfig {

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, OrderEvent> kafkaListenerContainerFactory(
            ConsumerFactory<String, OrderEvent> cf) {

        ConcurrentKafkaListenerContainerFactory<String, OrderEvent> factory =
            new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(cf);

        // 3 concurrent consumers in one JVM instance
        // Each gets assigned separate partitions by Kafka
        // Combine with 3-partition topic → 3-way parallelism in one app instance
        factory.setConcurrency(3);
        factory.getContainerProperties().setAckMode(ContainerProperties.AckMode.MANUAL_IMMEDIATE);
        return factory;
    }
}

// The @KafkaListener stays the same — Spring handles the threading
@KafkaListener(
    topics = "order-events",
    groupId = "payment-service-group",
    containerFactory = "kafkaListenerContainerFactory"
)
public void handleOrderEvent(ConsumerRecord<String, OrderEvent> record, Acknowledgment ack) {
    log.info("Thread={} partition={} offset={}",
        Thread.currentThread().getName(),
        record.partition(),
        record.offset());
    processPayment(record.value());
    ack.acknowledge();
}
\`\`\`

**Output with concurrency=3 and 3 partitions:**
\`\`\`
Thread=org.springframework.kafka.KafkaListenerEndpointContainer#0-0-C-1 partition=0 offset=10
Thread=org.springframework.kafka.KafkaListenerEndpointContainer#0-1-C-1 partition=1 offset=8
Thread=org.springframework.kafka.KafkaListenerEndpointContainer#0-2-C-1 partition=2 offset=12
\`\`\`

---

## Monitor Consumer Lag (The Most Important Kafka Metric)

**Consumer lag** = how far behind a consumer is from the latest message.

\`\`\`bash
# Check lag for payment-service-group
kafka-consumer-groups --bootstrap-server localhost:9092 \\
  --describe --group payment-service-group

# Good state (lag = 0):
# GROUP                 TOPIC        PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG
# payment-service-group order-events 0          1000            1000            0
# payment-service-group order-events 1          980             980             0
# payment-service-group order-events 2          1020            1020            0

# Bad state (lag growing):
# GROUP                 TOPIC        PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG
# payment-service-group order-events 0          500             1500            1000  ← BEHIND
# payment-service-group order-events 1          480             1480            1000  ← BEHIND
\`\`\`

**If lag is growing:**
1. Consumer is too slow → scale up consumer instances or increase \`concurrency\`
2. Producer is too fast → check if batch sizes changed or traffic spiked
3. Consumer is crashing → check logs for exceptions

---

## Interview-Ready Summary

- **Consumer group** = a team of consumers — Kafka divides partitions between them
- **Max parallelism** = number of partitions — more consumers than partitions = idle consumers
- **Rebalance** happens when consumers join or leave — causes a brief processing pause
- **Consumer lag** = \`LOG-END-OFFSET - CURRENT-OFFSET\` — monitor this in production, alert on sustained lag
- **Interview signal:** "We had 12 partitions and 4 consumer instances with concurrency=3 — 12 total threads, zero idle partitions. When lag grew during peak, we scaled to 6 instances and lag went to zero in 2 minutes"`;

const t7_offset_management = `# Offset Management — At-Most-Once, At-Least-Once, Exactly-Once

---

## The Problem — Duplicates or Lost Messages?

Your payment service is processing orders from Kafka. The consumer reads a message, charges the customer, then commits the offset. Simple.

But what if the app crashes after the charge but before the offset commit? Kafka redelivers the message. The customer gets charged twice.

Or worse — what if your auto-commit fires before the charge finishes and then the charge fails? The offset is committed, Kafka thinks it is done, and the customer never gets charged. Silent data loss.

This is the offset management problem. There are three delivery guarantees and each has trade-offs.

---

## The Three Delivery Guarantees

### At-Most-Once (commit before processing)
\`\`\`java
@KafkaListener(topics = "order-events")
public void handle(ConsumerRecord<String, OrderEvent> record, Acknowledgment ack) {
    // Commit FIRST — if processing fails after this, message is lost
    ack.acknowledge();
    processPayment(record.value());  // if this throws, payment is missed silently
}
\`\`\`
**Use when:** You can tolerate missing events. Example: analytics, metrics collection.

### At-Least-Once (commit after processing — default safe choice)
\`\`\`java
@KafkaListener(topics = "order-events")
public void handle(ConsumerRecord<String, OrderEvent> record, Acknowledgment ack) {
    processPayment(record.value());  // if this throws, ack is not called
    ack.acknowledge();               // commit AFTER success — on crash, Kafka redelivers
    // Risk: consumer crashes after processPayment but before ack → duplicate processing
}
\`\`\`
**Use when:** You can tolerate duplicate delivery but not data loss. Combine with idempotency to handle duplicates safely.

### Exactly-Once (transactional + idempotency key)
\`\`\`java
@KafkaListener(topics = "order-events")
@Transactional  // DB + Kafka offset in same transaction
public void handle(ConsumerRecord<String, OrderEvent> record, Acknowledgment ack) {

    String dedupKey = "payment:processed:" + record.value().orderId();

    // Check if already processed (idempotency guard)
    if (redis.hasKey(dedupKey)) {
        log.info("Duplicate event skipped: {}", record.value().orderId());
        ack.acknowledge();
        return;
    }

    // Process + mark as done atomically
    processPayment(record.value());
    redis.opsForValue().set(dedupKey, "done", Duration.ofDays(7));
    ack.acknowledge();
}
\`\`\`
**Use when:** You need exactly-once behavior — financial operations, inventory updates.

---

## Which One to Use?

| Scenario | Use | Reason |
|---|---|---|
| Analytics events | At-most-once | Missing one event is acceptable |
| Notifications | At-least-once | Sending twice is annoying but not harmful |
| Payment processing | At-least-once + idempotency | Cannot lose payments, duplicates handled by idempotency key |
| Inventory deduction | Exactly-once | Overcounting stock = real money loss |
| Audit logs | At-least-once | Better to have duplicate log than no log |

---

## Manual vs Auto Offset Commit — The Safety Difference

\`\`\`yaml
# Auto-commit (risky for production)
spring.kafka.consumer.enable-auto-commit: true
spring.kafka.consumer.auto-commit-interval: 5000  # commits every 5 seconds

# What happens:
# t=0s  → consumer reads messages 1–50
# t=3s  → consumer processes message 30, crashes
# t=5s  → auto-commit would have fired but never did (crashed)
# t=5s  → consumer restarts, reads from last committed offset
# Result: messages 1–29 were committed before crash? No — auto-commit hadn't fired yet
# So consumer reprocesses 1–29 on restart (duplicates possible)

# Manual commit (production standard)
spring.kafka.consumer.enable-auto-commit: false
spring.kafka.listener.ack-mode: MANUAL_IMMEDIATE

# What happens:
# t=0s  → consumer reads messages 1–50
# t=3s  → consumer processes message 30, crashes (no ack called)
# t=3s  → consumer restarts, reads from last committed offset (0)
# Result: reprocesses from beginning of batch — predictable, controllable
\`\`\`

---

## Interview-Ready Summary

- **At-most-once:** commit before processing — possible data loss, never duplicates
- **At-least-once:** commit after processing — possible duplicates, never data loss
- **Exactly-once:** at-least-once + idempotency key — no loss, no duplicates, production gold standard
- **Rule:** disable auto-commit in production — use MANUAL_IMMEDIATE and call \`ack.acknowledge()\` after your DB write
- **Interview signal:** "We used at-least-once with an idempotency key stored in Redis — duplicate Kafka redeliveries were caught by the Redis SETNX check and skipped before hitting the database"`;

const t8_error_handling = `# Error Handling — Dead Letter Topics, Retry, and @RetryableTopic

---

## The Problem — What Happens When Processing Fails?

Your consumer receives an order event. It tries to charge the customer. The payment gateway returns a 503 for 30 seconds (transient error). What does your consumer do?

Without error handling: it either crashes (stops consuming forever) or silently swallows the error (payment never charged). Both are wrong.

The enterprise answer is: **retry the transient errors, route the permanent failures to a Dead Letter Topic (DLT).**

---

## Spring Kafka @RetryableTopic — The Enterprise Standard

\`\`\`java
package com.satyverse.kafka.consumer;

import com.satyverse.kafka.model.OrderEvent;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.DltHandler;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.annotation.RetryableTopic;
import org.springframework.kafka.requeue.KafkaConsumerBackoffManager;
import org.springframework.retry.annotation.Backoff;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class ResilientOrderConsumer {

    /**
     * @RetryableTopic automatically creates retry topics:
     *   order-events-retry-0  (retry after 1s)
     *   order-events-retry-1  (retry after 2s)
     *   order-events-retry-2  (retry after 4s)
     *   order-events-dlt      (dead letter — give up after 3 retries)
     *
     * The original consumer keeps processing other messages while retries happen.
     * No blocking. No stopping.
     */
    @RetryableTopic(
        attempts = "4",                     // 1 original + 3 retries
        backoff = @Backoff(
            delay = 1000,                   // 1 second first retry
            multiplier = 2.0,              // double each time: 1s, 2s, 4s
            maxDelay = 10000               // cap at 10 seconds
        ),
        dltTopicSuffix = "-dlt",           // dead letter topic name suffix
        autoCreateTopics = "true"          // auto-create retry + DLT topics
    )
    @KafkaListener(topics = "order-events", groupId = "payment-service-group")
    public void handleOrderEvent(OrderEvent event) {
        log.info("Processing order: {}", event.orderId());

        // Simulate transient failure (payment gateway down)
        if (isPaymentGatewayDown()) {
            throw new PaymentGatewayException("Payment gateway temporarily unavailable");
            // Spring Kafka catches this and routes to retry topic
        }

        // Simulate permanent failure (invalid card)
        if (isInvalidCard(event)) {
            throw new InvalidCardException("Card number invalid — do not retry");
            // After all retries exhausted, goes to DLT
        }

        processPayment(event);
        log.info("Payment processed: {}", event.orderId());
    }

    /**
     * @DltHandler — called when message arrives in the dead letter topic.
     * Log it, alert, store for manual review — do NOT throw here.
     */
    @DltHandler
    public void handleDlt(OrderEvent event, ConsumerRecord<?, ?> record) {
        log.error("DEAD LETTER | orderId={} partition={} offset={} — manual review required",
            event.orderId(), record.partition(), record.offset());

        // In production: save to a "failed_events" database table for manual replay
        // Send alert to PagerDuty / Slack
        // failedEventRepository.save(new FailedEvent(event, record.topic(), Instant.now()));
    }

    private boolean isPaymentGatewayDown() { return false; /* real check */ }
    private boolean isInvalidCard(OrderEvent e) { return false; /* real check */ }
    private void processPayment(OrderEvent e) { /* real logic */ }
}
\`\`\`

---

## What the Retry Topic Flow Looks Like

\`\`\`
Message arrives in:  order-events (partition=0, offset=10)
                           │
                           ▼ Processing throws PaymentGatewayException
                           │
              order-events-retry-0 (wait 1 second)
                           │
                           ▼ Still failing
                           │
              order-events-retry-1 (wait 2 seconds)
                           │
                           ▼ Still failing
                           │
              order-events-retry-2 (wait 4 seconds)
                           │
                           ▼ Still failing after 3 retries
                           │
              order-events-dlt → @DltHandler called → alert + save to DB
\`\`\`

**Key benefit:** The original \`order-events\` consumer keeps processing other messages during the retry wait. One bad message does not block the whole topic.

---

## Non-Retryable Exceptions — Skip Straight to DLT

\`\`\`java
@RetryableTopic(
    attempts = "4",
    backoff = @Backoff(delay = 1000, multiplier = 2.0),
    // These exceptions go straight to DLT — no retrying
    exclude = { InvalidCardException.class, ValidationException.class }
)
@KafkaListener(topics = "order-events", groupId = "payment-service-group")
public void handleOrderEvent(OrderEvent event) {
    // ...
}
\`\`\`

---

## Monitor Dead Letter Topics

\`\`\`bash
# Check how many messages are in the DLT
kafka-consumer-groups --bootstrap-server localhost:9092 \\
  --describe --group payment-service-group-dlt

# Consume and inspect DLT messages
kafka-console-consumer --bootstrap-server localhost:9092 \\
  --topic order-events-dlt --from-beginning --max-messages 10
\`\`\`

---

## Interview-Ready Summary

- **Retry topics** handle transient failures — same message is routed through retry-0, retry-1, retry-2 with exponential backoff
- **Dead Letter Topic (DLT)** handles permanent failures — log, alert, save for manual review
- **@RetryableTopic** in Spring Kafka does all of this with one annotation — no manual retry logic needed
- **Non-retryable exceptions** (like \`InvalidCardException\`) should bypass retries and go straight to DLT using \`exclude = {}\`
- **Interview signal:** "We configured @RetryableTopic with 3 retries and 2x backoff — 95% of transient payment gateway errors resolved within 7 seconds. Permanent failures went to the DLT where we had an alerting rule and a nightly replay job"`;

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 3 — TECHNICAL LEAD
// ─────────────────────────────────────────────────────────────────────────────

const t9_topic_design = `# Kafka Topic Design — Naming, Partitions, Retention, Compaction

---

## The Problem — A Topic Design Mistake Costs You 3 Months Later

You create a topic called "events." One team puts order events in it. Another team puts payment events. A third team puts user signup events. All mixed together.

Six months later: you cannot replay just the order events. You cannot set different retention policies for payments vs signups. You cannot scale payment consumers independently. Your consumer code is a mess of if-else checks.

Topic design is an architecture decision. Get it wrong early and it costs you dearly.

---

## Naming Convention (Enterprise Standard)

\`\`\`
{domain}.{entity}.{event-type}

Examples:
  order-service.orders.created
  order-service.orders.cancelled
  payment-service.payments.processed
  payment-service.payments.failed
  inventory-service.stock.reserved
  inventory-service.stock.released
  user-service.users.registered
  notification-service.emails.sent

Rules:
  ✓ Use hyphens or dots — never spaces or camelCase
  ✓ Always include the domain (service name)
  ✓ Entity is plural noun (orders, payments, users)
  ✓ Event type is past tense (created, processed, failed)
  ✗ Never: "events", "data", "messages" — too vague
  ✗ Never: "OrderCreated", "payment_processed" — inconsistent casing
\`\`\`

---

## How Many Partitions?

| Factor | Recommendation |
|---|---|
| Expected throughput | 1 partition per 10 MB/s write throughput (estimate) |
| Consumer parallelism | At least 1 partition per consumer thread you plan to run |
| Future scaling room | Start with 2-3× what you need today |
| Operational simplicity | Under 20 partitions for most topics — avoid partition explosion |
| Max rule | Never exceed 200 partitions per broker without careful testing |

**Practical formula:** max(expected consumer threads × 2, throughput_MB_per_sec / 10, 3)

You cannot decrease partitions later without recreating the topic. Always overestimate slightly.

---

## Retention Policy — How Long Kafka Keeps Messages

\`\`\`bash
# Set retention when creating topic
kafka-topics --bootstrap-server localhost:9092 --create \\
  --topic order-service.orders.created \\
  --partitions 6 \\
  --replication-factor 3 \\
  --config retention.ms=604800000    # 7 days in milliseconds
  --config retention.bytes=10737418240  # 10 GB per partition cap

# Change retention on existing topic (no downtime)
kafka-configs --bootstrap-server localhost:9092 \\
  --entity-type topics \\
  --entity-name order-service.orders.created \\
  --alter \\
  --add-config retention.ms=2592000000   # 30 days
\`\`\`

**Retention guide by topic type:**

| Topic Type | Retention | Reason |
|---|---|---|
| Payment events | 90 days | Audit, replay for reconciliation |
| Order events | 30 days | Support queries, replay on incidents |
| Notification events | 7 days | Short lifecycle, no replay needed |
| Analytics events | 3 days | Processed by Spark/Flink in real time |
| Audit log events | 365 days | Legal/compliance requirement |

---

## Log Compaction — Keep Only the Latest Value per Key

For some topics you do not want all history — you want the **latest state per key**.

Example: user profile updates. You only care about the user's current profile, not every change they made.

\`\`\`bash
# Create a compacted topic
kafka-topics --bootstrap-server localhost:9092 --create \\
  --topic user-service.users.profiles \\
  --partitions 3 \\
  --replication-factor 3 \\
  --config cleanup.policy=compact  # only keep latest value per key
\`\`\`

\`\`\`
Without compaction (all history kept):
  Key=user-123: [profile v1] [profile v2] [profile v3] [profile v4]

With compaction (only latest per key kept):
  Key=user-123: [profile v4]

This is used for: user profiles, product catalog, configuration, feature flags
\`\`\`

**Deletion with compaction:** Send a message with the same key and a **null value**. This is called a **tombstone**. Kafka deletes the key during the next compaction cycle.

---

## Decision Table — Which Config to Use?

| Question | Answer | Config |
|---|---|---|
| Need to replay events for recovery? | Yes | \`retention.ms\` = 30+ days |
| Only care about current state, not history? | Yes | \`cleanup.policy=compact\` |
| Topic is high-volume, short-lived events? | Yes | \`retention.ms\` = 3–7 days + \`retention.bytes\` cap |
| Payment/audit data? | Yes | \`retention.ms\` = 90+ days, \`replication.factor=3\` |
| Internal microservice communication? | Yes | \`retention.ms\` = 7 days, 3–6 partitions |

---

## Interview-Ready Summary

- **Naming:** \`{domain}.{entity}.{event-type}\` — makes ownership and intent clear
- **Partitions:** start with max(consumer threads × 2, 3) — you cannot reduce later, so start slightly over
- **Retention:** match the replay and audit requirements — do not use one retention for all topics
- **Compaction:** use when consumers only need the latest state per key (user profile, config updates)
- **Interview signal:** "We designed 23 topics following the domain.entity.event-type convention. Payment topics had 90-day retention for audit. Order topics had 30-day retention. We used compaction on our product catalog topic — Kafka kept only the latest price for each SKU, consumers always got current state"`;

const t10_kafka_streams = `# Kafka Streams — Real-Time Stream Processing in Java

---

## The Problem — What If You Need to Process Events AS They Arrive?

Your e-commerce platform produces order events. The fraud team wants to know: "Is this user placing more than 10 orders in 5 minutes?" The answer must come in real time — not in a batch job that runs at midnight.

You could read Kafka events in a consumer and write the aggregation logic yourself. But you'd have to handle: windowing, state management, fault tolerance, partitioning, and exactly-once semantics — all yourself.

**Kafka Streams** is a Java library built into Kafka that handles all of this for you.

---

## What Kafka Streams Does (Plain Language)

Kafka Streams lets you write code that:
1. Reads from a Kafka topic (input)
2. Transforms or aggregates the data (processing)
3. Writes results to another Kafka topic (output)

It runs inside your Java application — no separate cluster needed. It handles state, windowing, and fault recovery automatically.

---

## Maven Dependency

\`\`\`xml
<dependency>
    <groupId>org.apache.kafka</groupId>
    <artifactId>kafka-streams</artifactId>
    <version>3.7.0</version>
</dependency>
\`\`\`

---

## Example 1 — Filter and Transform Events

\`\`\`java
package com.satyverse.streams;

import org.apache.kafka.common.serialization.Serdes;
import org.apache.kafka.streams.*;
import org.apache.kafka.streams.kstream.*;

import java.util.Properties;

public class OrderFilterStream {

    public static void main(String[] args) {
        Properties props = new Properties();
        props.put(StreamsConfig.APPLICATION_ID_CONFIG, "order-filter-app");
        props.put(StreamsConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        props.put(StreamsConfig.DEFAULT_KEY_SERDE_CLASS_CONFIG, Serdes.String().getClass());
        props.put(StreamsConfig.DEFAULT_VALUE_SERDE_CLASS_CONFIG, Serdes.String().getClass());

        StreamsBuilder builder = new StreamsBuilder();

        // Read from input topic
        KStream<String, String> orders = builder.stream("order-service.orders.created");

        // Filter: only high-value orders (₹5000+)
        // Route them to a VIP processing topic
        orders
            .filter((orderId, orderJson) -> extractAmount(orderJson) >= 5000)
            .peek((k, v) -> System.out.println("High-value order: " + k))
            .to("order-service.orders.high-value");

        // Route normal orders to standard topic
        orders
            .filter((orderId, orderJson) -> extractAmount(orderJson) < 5000)
            .to("order-service.orders.standard");

        KafkaStreams streams = new KafkaStreams(builder.build(), props);
        streams.start();

        Runtime.getRuntime().addShutdownHook(new Thread(streams::close));
    }

    static double extractAmount(String json) {
        // parse JSON and extract amount field
        return 0.0; // simplified
    }
}
\`\`\`

---

## Example 2 — Fraud Detection: Count Orders Per User in 5-Minute Window

\`\`\`java
package com.satyverse.streams;

import org.apache.kafka.common.serialization.Serdes;
import org.apache.kafka.streams.*;
import org.apache.kafka.streams.kstream.*;
import org.apache.kafka.streams.kstream.TimeWindows;

import java.time.Duration;
import java.util.Properties;

public class FraudDetectionStream {

    private static final int FRAUD_THRESHOLD = 10; // 10 orders in 5 minutes = suspicious

    public static void main(String[] args) {
        Properties props = new Properties();
        props.put(StreamsConfig.APPLICATION_ID_CONFIG, "fraud-detection-app");
        props.put(StreamsConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        props.put(StreamsConfig.DEFAULT_KEY_SERDE_CLASS_CONFIG, Serdes.String().getClass());
        props.put(StreamsConfig.DEFAULT_VALUE_SERDE_CLASS_CONFIG, Serdes.String().getClass());

        StreamsBuilder builder = new StreamsBuilder();

        KStream<String, String> orders = builder.stream("order-service.orders.created");

        // Rekey by userId so all events for same user go to same partition
        KStream<String, String> ordersByUser = orders
            .selectKey((orderId, orderJson) -> extractUserId(orderJson));

        // Count orders per user in a 5-minute tumbling window
        ordersByUser
            .groupByKey()
            .windowedBy(TimeWindows.ofSizeWithNoGrace(Duration.ofMinutes(5)))
            .count()
            .toStream()
            .filter((windowedKey, count) -> count >= FRAUD_THRESHOLD)
            .peek((windowedKey, count) -> {
                String userId = windowedKey.key();
                System.out.printf("FRAUD ALERT: user=%s placed %d orders in 5 minutes%n",
                    userId, count);
            })
            .to("fraud-service.alerts.created");

        KafkaStreams streams = new KafkaStreams(builder.build(), props);
        streams.start();

        Runtime.getRuntime().addShutdownHook(new Thread(streams::close));
    }

    static String extractUserId(String json) { return "user-123"; /* parse JSON */ }
}
\`\`\`

**What this does:**
\`\`\`
Input (order-service.orders.created):
  t=0:00 → order#1, userId=user-A
  t=0:30 → order#2, userId=user-A
  t=1:00 → order#3, userId=user-A
  ... (10 orders in 5 minutes)

Output (fraud-service.alerts.created):
  FRAUD ALERT: user=user-A placed 10 orders in 5 minutes
\`\`\`

---

## Kafka Streams State — How It Remembers Counts

Kafka Streams stores aggregation state in a **RocksDB** database on the local disk. This state is also backed up to a **Kafka changelog topic**. If your app restarts, it rebuilds state from the changelog — no data lost.

\`\`\`
RocksDB (local disk, fast):
  user-A → 8 orders in window starting at 10:00
  user-B → 2 orders in window starting at 10:00

Changelog topic (Kafka, durable):
  Exactly the same data, replicated as Kafka messages
  On restart → rebuild RocksDB from changelog → state restored
\`\`\`

---

## Interview-Ready Summary

- **Kafka Streams** is a Java library for real-time stream processing — runs inside your app, no separate cluster
- Use \`KStream\` for per-record transformations (filter, map, join)
- Use \`KTable\` for stateful aggregations (count, sum, latest value per key)
- **Windowing** lets you count events in time buckets — tumbling (non-overlapping) or sliding (overlapping)
- State is stored in **RocksDB** locally + backed up to Kafka changelog topics for fault tolerance
- **Interview signal:** "We used Kafka Streams to detect fraud in real time — counting orders per user in a 5-minute tumbling window. When the count hit 10, an alert went to PagerDuty within 30 seconds of the 10th order"`;

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 4 — STAFF / ARCHITECT
// ─────────────────────────────────────────────────────────────────────────────

const t11_producer_config = `# Kafka Producer Configuration — Reliability, Throughput, and Exactly-Once

---

## The Problem — Your Producer Is Losing Messages in Production

You deployed. Throughput is great. Then during a broker restart (rolling deploy), some messages disappear. Orders are missing. Payments not processed. The logs show no errors — Kafka accepted the messages. But the broker that was restarting dropped them.

The root cause: you used \`acks=1\` (only the leader confirms). The leader accepted, then restarted. The replica hadn't copied it yet. Message gone.

This is why producer configuration matters as much as the application code.

---

## Complete Producer Configuration Reference

\`\`\`java
package com.satyverse.kafka.config;

import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.*;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaProducerConfig {

    @Bean
    public ProducerFactory<String, Object> producerFactory() {
        Map<String, Object> config = new HashMap<>();

        // ── Connection ───────────────────────────────────────────────
        config.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "kafka1:9092,kafka2:9092,kafka3:9092");

        // ── Serializers ──────────────────────────────────────────────
        config.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        config.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG,
            "org.springframework.kafka.support.serializer.JsonSerializer");

        // ── Reliability ──────────────────────────────────────────────
        // acks=all: wait for all in-sync replicas (ISR) to confirm
        // This is the only setting that prevents data loss during broker failover
        config.put(ProducerConfig.ACKS_CONFIG, "all");

        // Idempotent producer: ensures exactly one write even with retries
        // Requires acks=all and retries > 0
        config.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);

        // Retry on transient failures (broker restart, leader election)
        config.put(ProducerConfig.RETRIES_CONFIG, Integer.MAX_VALUE);

        // Max time to retry (5 minutes) — after this, send() throws
        config.put(ProducerConfig.DELIVERY_TIMEOUT_MS_CONFIG, 300000);

        // Max in-flight requests per connection
        // Must be <= 5 when idempotence is enabled
        config.put(ProducerConfig.MAX_IN_FLIGHT_REQUESTS_PER_CONNECTION, 5);

        // ── Throughput Tuning ────────────────────────────────────────
        // Wait up to 10ms to fill a batch before sending
        // Higher linger.ms = better throughput, higher latency
        config.put(ProducerConfig.LINGER_MS_CONFIG, 10);

        // Max bytes per batch per partition (16KB default, increase for bulk loads)
        config.put(ProducerConfig.BATCH_SIZE_CONFIG, 65536);   // 64KB

        // Compress messages: snappy = fast, lz4 = faster, gzip = smallest
        config.put(ProducerConfig.COMPRESSION_TYPE_CONFIG, "lz4");

        // ── Memory ──────────────────────────────────────────────────
        // Total memory for buffering unsent messages (32MB default)
        config.put(ProducerConfig.BUFFER_MEMORY_CONFIG, 67108864);  // 64MB

        // How long to wait for buffer space before throwing BufferExhaustedException
        config.put(ProducerConfig.MAX_BLOCK_MS_CONFIG, 60000);  // 60 seconds

        return new DefaultKafkaProducerFactory<>(config);
    }

    @Bean
    public KafkaTemplate<String, Object> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }
}
\`\`\`

---

## Config Decision Table

| Config | For Reliability | For Throughput | Trade-off |
|---|---|---|---|
| \`acks=all\` | Required | Lower throughput | ~2ms extra latency per message |
| \`acks=1\` | Risky | Higher throughput | Messages lost if leader fails before replica sync |
| \`enable.idempotence=true\` | Required | Minimal overhead | No duplicate writes on retry |
| \`linger.ms=10\` | OK | 3-5× better batching | 10ms extra latency |
| \`compression.type=lz4\` | OK | Less network, faster | Small CPU overhead |
| \`batch.size=65536\` | OK | Fewer network calls | More memory usage |

---

## Kafka Transactions — Atomic Multi-Topic Writes

Sometimes you need to write to two topics atomically. Either both succeed or neither does.

\`\`\`java
@Bean
public KafkaTransactionManager<String, Object> transactionManager(
        ProducerFactory<String, Object> pf) {
    return new KafkaTransactionManager<>(pf);
}

// In your service:
@Service
@RequiredArgsConstructor
public class OrderSagaOrchestrator {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    // Both sends are atomic — either both written or neither
    @Transactional("kafkaTransactionManager")
    public void orchestrateOrder(OrderEvent orderEvent) {
        // Write to order topic
        kafkaTemplate.send("order-service.orders.created", orderEvent.orderId(), orderEvent);

        // Write to audit topic in the same transaction
        kafkaTemplate.send("audit-service.audit.events",
            orderEvent.orderId(),
            new AuditEvent("ORDER_CREATED", orderEvent.orderId(), Instant.now()));

        // If the second send fails, the first one is also rolled back
        // Kafka guarantees: consumers reading with isolation.level=read_committed
        // will never see the partial state
    }
}
\`\`\`

---

## Monitor Producer Health

\`\`\`bash
# Check producer metrics via JMX (or Micrometer in Spring Boot)
# Key metrics to watch:
# record-send-rate         — messages per second
# record-error-rate        — should be 0 in steady state
# request-latency-avg      — avg time to get ack from broker
# batch-size-avg           — if too small, increase linger.ms

# In Spring Boot with Actuator:
curl http://localhost:8080/actuator/metrics/kafka.producer.record.send.rate
\`\`\`

---

## Interview-Ready Summary

- **acks=all + enable.idempotence=true** is the only combination that prevents data loss AND duplicates
- **linger.ms + batch.size** control throughput — increase both for high-volume producers (analytics, logging)
- **Kafka transactions** make multi-topic writes atomic — essential for Outbox Pattern and saga steps
- **MAX_IN_FLIGHT_REQUESTS_PER_CONNECTION must be ≤ 5** when idempotence is enabled — higher values disable the idempotence guarantee
- **Interview signal:** "We switched from acks=1 to acks=all with idempotent producers after losing 200 payment events during a rolling deploy. The extra 2ms per message was worth the zero data-loss guarantee"`;

const t12_kafka_security = `# Kafka Security — TLS, SASL, and ACLs

---

## The Problem — Your Kafka Topic Is Wide Open

Default Kafka has no authentication and no authorization. Anyone on the network who knows the broker address can read any topic and write to any topic. In a company with 50 microservices, that means your payment topics are readable by your analytics service.

In a regulated industry (fintech, healthcare, e-commerce with PII), this fails every security audit.

Enterprise Kafka needs three layers:
1. **TLS** — encrypt data in transit
2. **SASL** — authenticate who is connecting
3. **ACLs** — authorize what each client can do

---

## Layer 1 — TLS (Encrypt Data in Transit)

\`\`\`yaml
# application.yml — Spring Boot client with TLS
spring:
  kafka:
    bootstrap-servers: kafka1:9093,kafka2:9093,kafka3:9093
    properties:
      security.protocol: SSL
      ssl.truststore.location: /etc/kafka/secrets/kafka.client.truststore.jks
      ssl.truststore.password: \${KAFKA_TRUSTSTORE_PASSWORD}
      ssl.keystore.location: /etc/kafka/secrets/kafka.client.keystore.jks
      ssl.keystore.password: \${KAFKA_KEYSTORE_PASSWORD}
      ssl.key.password: \${KAFKA_KEY_PASSWORD}
      # Verify the broker hostname matches the certificate
      ssl.endpoint.identification.algorithm: https
\`\`\`

---

## Layer 2 — SASL/SCRAM Authentication (Recommended for Enterprise)

SCRAM is username + password authentication with salted hashing. Better than PLAIN (which sends password in plaintext even over TLS).

\`\`\`bash
# Create a Kafka user for payment-service
kafka-configs --bootstrap-server kafka1:9092 \\
  --entity-type users \\
  --entity-name payment-service \\
  --alter \\
  --add-config 'SCRAM-SHA-512=[iterations=8192,password=strong-password-here]'

# Verify user was created
kafka-configs --bootstrap-server kafka1:9092 \\
  --entity-type users --entity-name payment-service --describe
\`\`\`

\`\`\`yaml
# application.yml — Spring Boot with SASL/SCRAM + TLS
spring:
  kafka:
    bootstrap-servers: kafka1:9093,kafka2:9093
    properties:
      security.protocol: SASL_SSL
      sasl.mechanism: SCRAM-SHA-512
      sasl.jaas.config: >
        org.apache.kafka.common.security.scram.ScramLoginModule required
        username="payment-service"
        password="\${KAFKA_PASSWORD}";
      ssl.truststore.location: /etc/kafka/secrets/truststore.jks
      ssl.truststore.password: \${TRUSTSTORE_PASSWORD}
\`\`\`

---

## Layer 3 — ACLs (Authorize What Each Service Can Do)

\`\`\`bash
# Grant payment-service: read from order-events topic only
kafka-acls --bootstrap-server kafka1:9092 --add \\
  --allow-principal User:payment-service \\
  --operation Read \\
  --operation Describe \\
  --topic order-service.orders.created \\
  --group payment-service-group

# Grant order-service: write to order-events topic only
kafka-acls --bootstrap-server kafka1:9092 --add \\
  --allow-principal User:order-service \\
  --operation Write \\
  --operation Describe \\
  --topic order-service.orders.created

# Verify ACLs
kafka-acls --bootstrap-server kafka1:9092 --list \\
  --topic order-service.orders.created
\`\`\`

**ACL matrix (enterprise pattern):**

| Service | Topic | Permission |
|---|---|---|
| order-service | order-service.orders.* | Write |
| payment-service | order-service.orders.* | Read |
| payment-service | payment-service.payments.* | Write |
| inventory-service | order-service.orders.* | Read |
| inventory-service | inventory-service.stock.* | Write |
| analytics-service | *.* | Read only — never Write |

---

## Secrets Management — Never Hard-Code Passwords

\`\`\`java
// In Kubernetes: mount Kafka passwords as environment variables from Secrets
// application.yml reads them with \${KAFKA_PASSWORD}

// In AWS: use AWS Secrets Manager
@Bean
public KafkaProperties kafkaProperties(SecretsManagerClient secretsManager) {
    GetSecretValueResponse secret = secretsManager.getSecretValue(
        GetSecretValueRequest.builder().secretId("prod/kafka/payment-service").build()
    );
    // Parse and inject into KafkaProperties
    // Never log or print these values
    return buildKafkaProperties(secret.secretString());
}
\`\`\`

---

## Interview-Ready Summary

- **TLS** encrypts data between client and broker — use \`security.protocol=SASL_SSL\` in production, never \`PLAINTEXT\`
- **SASL/SCRAM** authenticates each service with a unique username/password — rotate passwords via Vault or AWS Secrets Manager
- **ACLs** authorize what each service can read or write — each service should only have the minimum permissions it needs (principle of least privilege)
- Passwords must come from environment variables or secrets managers — never in source code or application.properties committed to git
- **Interview signal:** "We implemented per-service Kafka users with ACLs — payment-service could only read order topics and write payment topics. This passed our SOC2 audit and prevented a misconfigured analytics service from accidentally writing to production payment topics"`;

const t13_performance_tuning = `# Kafka Performance Tuning — Throughput vs Latency

---

## The Problem — Your Kafka Cluster Is Hitting Limits

1,000 messages/second — fine.
100,000 messages/second — Kafka starts falling behind. Producers block. Consumers lag. Broker CPU spikes.

Performance tuning in Kafka means understanding: **where is the bottleneck?** Then adjusting one lever at a time and measuring.

---

## The Four Bottleneck Points

\`\`\`
Producer → Network → Broker Disk → Consumer

1. Producer bottleneck: small batches, no compression, sync sends
2. Network bottleneck: uncompressed messages, too many TCP connections
3. Broker disk bottleneck: slow disks, too many partitions per broker, sync flush enabled
4. Consumer bottleneck: slow processing logic, single-threaded, small max.poll.records
\`\`\`

---

## Producer Tuning — High Throughput

\`\`\`java
// For maximum throughput (e.g., log aggregation, analytics events)
Map<String, Object> config = new HashMap<>();

// Batch messages before sending (don't send one by one)
config.put(ProducerConfig.LINGER_MS_CONFIG, 20);          // wait 20ms to fill batch
config.put(ProducerConfig.BATCH_SIZE_CONFIG, 1048576);    // 1MB batch size

// Compress before sending — lz4 is fastest, gzip is smallest
config.put(ProducerConfig.COMPRESSION_TYPE_CONFIG, "lz4");

// More in-flight requests = more parallelism
config.put(ProducerConfig.MAX_IN_FLIGHT_REQUESTS_PER_CONNECTION, 5);

// Async sends with callback (do not block with .get())
kafkaTemplate.send(topic, key, value).whenComplete((result, ex) -> {
    if (ex != null) log.error("Send failed: {}", ex.getMessage());
});
\`\`\`

**Expected improvement:** 5–15× throughput vs single-message synchronous sends.

---

## Broker Tuning — Key Settings

\`\`\`bash
# In server.properties

# Network threads — increase for high connection count
num.network.threads=8          # default 3, increase for >100 clients

# IO threads — increase for high disk I/O
num.io.threads=16              # default 8, increase for SSD disks

# Socket buffers — larger for high-throughput clients
socket.send.buffer.bytes=1048576    # 1MB (default 102400)
socket.receive.buffer.bytes=1048576

# Log flush — default is "let the OS decide" which is fastest
# DO NOT set log.flush.interval.messages — OS buffering is faster and safe with replication
# log.flush.interval.messages=1  ← never do this in high throughput scenarios

# Replication fetch size
replica.fetch.max.bytes=10485760  # 10MB (default 1MB) for large messages
\`\`\`

---

## Consumer Tuning — Process Faster

\`\`\`java
// For maximum consumer throughput
Map<String, Object> config = new HashMap<>();

// Fetch more data per request
config.put(ConsumerConfig.FETCH_MIN_BYTES_CONFIG, 1048576);    // 1MB min fetch
config.put(ConsumerConfig.FETCH_MAX_WAIT_MS_CONFIG, 500);      // wait 500ms for min bytes

// Process more messages per poll
config.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, 500);       // 500 per poll

// Larger fetch buffer
config.put(ConsumerConfig.MAX_PARTITION_FETCH_BYTES_CONFIG, 10485760);  // 10MB

// Session timeout — give slow consumers more time before Kafka rebalances
config.put(ConsumerConfig.SESSION_TIMEOUT_MS_CONFIG, 45000);  // 45 seconds
config.put(ConsumerConfig.HEARTBEAT_INTERVAL_MS_CONFIG, 15000); // 15 seconds
\`\`\`

---

## Measuring Performance — Commands You Run On-Call

\`\`\`bash
# Test producer throughput
kafka-producer-perf-test --topic perf-test --num-records 1000000 \\
  --record-size 1000 --throughput -1 \\
  --producer-props bootstrap.servers=localhost:9092 acks=all compression.type=lz4

# Output:
# 1000000 records sent, 145678.32 records/sec (138.93 MB/sec),
# 5.23 ms avg latency, 231.00 ms max latency

# Test consumer throughput
kafka-consumer-perf-test --topic perf-test --messages 1000000 \\
  --bootstrap-server localhost:9092

# Output:
# start.time=2024-01-15 10:00:00.000, end.time=2024-01-15 10:00:08.123
# MB.sec=160.45, nMsg.sec=168342.77

# Check broker under-replicated partitions (critical metric)
kafka-topics --bootstrap-server localhost:9092 \\
  --describe --under-replicated-partitions
# If this shows partitions → broker is falling behind → replication lag → data safety risk
\`\`\`

---

## Performance vs Reliability Trade-offs

| Setting | Maximum Performance | Maximum Reliability |
|---|---|---|
| \`acks\` | \`0\` (no wait) | \`all\` |
| \`linger.ms\` | \`50ms\` | \`0ms\` (send immediately) |
| \`compression.type\` | \`lz4\` | \`lz4\` (no conflict) |
| \`enable.idempotence\` | \`false\` | \`true\` |
| \`replication.factor\` | \`1\` | \`3\` |
| Sync disk flush | Off (OS buffered) | Off (replication is the safety net) |

**The golden rule:** Use \`acks=all\` + \`enable.idempotence=true\` for financial data. Use \`acks=1\` + \`linger.ms=20\` + \`lz4\` for high-volume non-critical events.

---

## Interview-Ready Summary

- **Throughput bottleneck:** increase \`linger.ms\`, \`batch.size\`, add \`lz4\` compression — this alone gives 10× improvement
- **Consumer bottleneck:** increase \`max.poll.records\`, add concurrency, make processing async
- **Broker bottleneck:** increase \`num.io.threads\`, use SSDs, avoid \`log.flush.interval.messages=1\`
- **Measure first:** run \`kafka-producer-perf-test\` before tuning — know your baseline
- **Interview signal:** "We went from 15,000 to 210,000 messages/sec by enabling lz4 compression, setting linger.ms=20, and increasing batch.size to 1MB. Zero code changes in business logic — pure configuration tuning"`;

const t14_observability = `# Kafka Observability — Consumer Lag, JMX Metrics, and Alerting

---

## The Problem — Kafka Is Silent When Things Go Wrong

Your Kafka consumer is processing orders. Unknown to you, it crashed 2 hours ago and auto-restarted, but the restart loop is causing it to lose messages. Kafka is filling up with unprocessed orders. By the time support tickets arrive, your lag is 500,000 messages — nearly 3 hours of orders unprocessed.

Without observability, you find out from customers. With observability, you find out in 2 minutes.

---

## The Three Metrics That Matter Most

| Metric | What It Tells You | Alert If |
|---|---|---|
| **Consumer lag** | How far behind the consumer is | Lag growing for > 5 minutes |
| **Under-replicated partitions** | Brokers falling behind in replication | Any under-replicated partitions exist |
| **Active controller count** | Is the cluster leader healthy | Not exactly 1 |

---

## Consumer Lag with Spring Boot Actuator + Micrometer

\`\`\`xml
<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
\`\`\`

\`\`\`yaml
# application.yml
management:
  endpoints:
    web:
      exposure:
        include: health,metrics,prometheus
  metrics:
    tags:
      application: \${spring.application.name}
      environment: \${APP_ENV:dev}
\`\`\`

\`\`\`java
// Custom consumer lag metric — expose to Prometheus
@Component
@RequiredArgsConstructor
public class KafkaLagMetrics {

    private final AdminClient adminClient;
    private final MeterRegistry meterRegistry;

    @Scheduled(fixedDelay = 30000)  // check every 30 seconds
    public void recordConsumerLag() {
        try {
            ListConsumerGroupOffsetsResult offsets =
                adminClient.listConsumerGroupOffsets("payment-service-group");

            Map<TopicPartition, OffsetAndMetadata> currentOffsets =
                offsets.partitionsToOffsetAndMetadata().get(10, TimeUnit.SECONDS);

            Set<TopicPartition> partitions = currentOffsets.keySet();
            Map<TopicPartition, Long> endOffsets = adminClient
                .listOffsets(partitions.stream().collect(
                    Collectors.toMap(p -> p, p -> OffsetSpec.latest())))
                .all().get(10, TimeUnit.SECONDS)
                .entrySet().stream()
                .collect(Collectors.toMap(Map.Entry::getKey,
                    e -> e.getValue().offset()));

            long totalLag = 0;
            for (Map.Entry<TopicPartition, OffsetAndMetadata> entry : currentOffsets.entrySet()) {
                TopicPartition partition = entry.getKey();
                long lag = endOffsets.getOrDefault(partition, 0L) - entry.getValue().offset();
                totalLag += lag;

                // Expose per-partition lag as Gauge metric
                Gauge.builder("kafka.consumer.lag",
                        () -> lag)
                    .tag("topic", partition.topic())
                    .tag("partition", String.valueOf(partition.partition()))
                    .tag("group", "payment-service-group")
                    .register(meterRegistry);
            }

            log.info("Total consumer lag for payment-service-group: {}", totalLag);

        } catch (Exception e) {
            log.error("Failed to record consumer lag metrics: {}", e.getMessage());
        }
    }
}
\`\`\`

---

## Prometheus + Grafana Alert Rule

\`\`\`yaml
# prometheus-alerts.yml
groups:
  - name: kafka-alerts
    rules:
      # Alert if consumer lag grows for 5 minutes
      - alert: KafkaConsumerLagGrowing
        expr: |
          increase(kafka_consumer_lag{group="payment-service-group"}[5m]) > 1000
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Kafka consumer lag is growing"
          description: "payment-service-group lag increased by {{ $value }} in 5 minutes"

      # Alert if any partitions are under-replicated
      - alert: KafkaUnderReplicatedPartitions
        expr: kafka_server_replicamanager_underreplicatedpartitions > 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Kafka has under-replicated partitions"
          description: "{{ $value }} partitions are under-replicated — data durability at risk"
\`\`\`

---

## Essential Command-Line Monitoring

\`\`\`bash
# Real-time consumer lag (run this first during incidents)
kafka-consumer-groups --bootstrap-server localhost:9092 \\
  --describe --group payment-service-group

# Watch lag in real time (refresh every 3 seconds)
watch -n 3 'kafka-consumer-groups --bootstrap-server localhost:9092 \\
  --describe --group payment-service-group'

# Check broker health — under-replicated partitions
kafka-topics --bootstrap-server localhost:9092 --describe --under-replicated-partitions

# Check topic partition leaders
kafka-topics --bootstrap-server localhost:9092 \\
  --describe --topic order-service.orders.created

# Reset offset to replay events (use carefully — data reprocessed)
kafka-consumer-groups --bootstrap-server localhost:9092 \\
  --group payment-service-group \\
  --topic order-service.orders.created \\
  --reset-offsets --to-earliest --execute
\`\`\`

---

## Distributed Tracing With Kafka

\`\`\`xml
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-tracing-bridge-brave</artifactId>
</dependency>
<dependency>
    <groupId>io.zipkin.reporter2</groupId>
    <artifactId>zipkin-reporter-brave</artifactId>
</dependency>
\`\`\`

\`\`\`java
// Spring Kafka auto-propagates trace context through Kafka message headers
// when micrometer-tracing is on the classpath

// Producer automatically adds B3 trace headers to each message
kafkaTemplate.send("order-events", orderId, event);
// → message headers include: X-B3-TraceId, X-B3-SpanId, X-B3-ParentSpanId

// Consumer automatically continues the trace
@KafkaListener(topics = "order-events")
public void handle(OrderEvent event) {
    // Trace ID from producer is automatically continued here
    // Zipkin shows: HTTP POST /orders → Kafka publish → Kafka consume → DB write
    log.info("Processing with traceId={}", MDC.get("traceId"));
}
\`\`\`

---

## Interview-Ready Summary

- **Consumer lag** is the #1 Kafka metric — monitor it with Prometheus/Grafana and alert when it grows for > 5 minutes
- **Under-replicated partitions** = data safety risk — alert immediately when this is > 0
- Expose lag via **Micrometer Gauge** metrics in Spring Boot — scrape with Prometheus, dashboard in Grafana
- **Distributed tracing** with Micrometer Tracing propagates trace context through Kafka headers automatically — no manual header management
- **Interview signal:** "During a Black Friday incident, our consumer lag alert fired at 2,000 messages. We had 4 minutes to scale from 3 to 12 consumer instances before customer-visible delays. Without the alert, we would have found out from support tickets 30 minutes later"`;

// ─────────────────────────────────────────────────────────────────────────────
// BUILD THE JSON
// ─────────────────────────────────────────────────────────────────────────────

const data = {
  version: 1,
  meta: {
    title: "Apache Kafka Roadmap",
    description: "From zero to enterprise-grade Kafka — Fresher to Staff/Architect level. Plain language, full code examples, real production patterns.",
    totalTopics: 14,
    estimatedHours: 40
  },
  phases: [
    {
      id: "fresher",
      level: "Fresher",
      levelLabel: "Fresher (0–1 yr)",
      color: "success",
      icon: "school",
      description: "Understand what Kafka is, why it exists, and write your first producer and consumer in Java and Spring Boot.",
      topics: [
        {
          id: "what-is-kafka",
          order: 1,
          title: "What Is Apache Kafka and Why Does It Exist?",
          tags: ["kafka", "basics", "message-broker", "intro"],
          estimatedMinutes: 20,
          content: t1_what_is_kafka
        },
        {
          id: "core-concepts",
          order: 2,
          title: "Core Concepts — Topics, Partitions, Offsets, Brokers",
          tags: ["topics", "partitions", "offsets", "brokers", "concepts"],
          estimatedMinutes: 25,
          content: t2_core_concepts
        },
        {
          id: "first-producer",
          order: 3,
          title: "Writing Your First Java Kafka Producer",
          tags: ["producer", "java", "KafkaProducer", "code"],
          estimatedMinutes: 30,
          content: t3_first_producer
        },
        {
          id: "first-consumer",
          order: 4,
          title: "Writing Your First Java Kafka Consumer",
          tags: ["consumer", "java", "KafkaConsumer", "poll-loop"],
          estimatedMinutes: 30,
          content: t4_first_consumer
        },
        {
          id: "spring-boot-kafka",
          order: 5,
          title: "Kafka with Spring Boot — KafkaTemplate and @KafkaListener",
          tags: ["spring-boot", "spring-kafka", "KafkaTemplate", "KafkaListener"],
          estimatedMinutes: 35,
          content: t5_spring_boot_kafka
        }
      ]
    },
    {
      id: "senior",
      level: "Senior Dev",
      levelLabel: "Senior Developer (1–3 yr)",
      color: "primary",
      icon: "code",
      description: "Understand Kafka internals, consumer groups, offset strategies, error handling, and schema management for production systems.",
      topics: [
        {
          id: "consumer-groups",
          order: 6,
          title: "Consumer Groups, Partitions Assignment, and Consumer Lag",
          tags: ["consumer-groups", "rebalance", "lag", "scaling", "partitions"],
          estimatedMinutes: 35,
          content: t6_consumer_groups
        },
        {
          id: "offset-management",
          order: 7,
          title: "Offset Management — At-Most-Once, At-Least-Once, Exactly-Once",
          tags: ["offsets", "at-least-once", "exactly-once", "idempotency", "commitSync"],
          estimatedMinutes: 30,
          content: t7_offset_management
        },
        {
          id: "error-handling",
          order: 8,
          title: "Error Handling — Dead Letter Topics, Retry, @RetryableTopic",
          tags: ["DLT", "retry", "RetryableTopic", "dead-letter", "backoff"],
          estimatedMinutes: 35,
          content: t8_error_handling
        }
      ]
    },
    {
      id: "tech-lead",
      level: "Tech Lead",
      levelLabel: "Technical Lead (3–5 yr)",
      color: "warning",
      icon: "architecture",
      description: "Design Kafka topics for scale, use Kafka Streams for real-time processing, and build event-driven microservice architectures.",
      topics: [
        {
          id: "topic-design",
          order: 9,
          title: "Kafka Topic Design — Naming, Partitions, Retention, Compaction",
          tags: ["topic-design", "naming", "partitions", "retention", "compaction", "architecture"],
          estimatedMinutes: 40,
          content: t9_topic_design
        },
        {
          id: "kafka-streams",
          order: 10,
          title: "Kafka Streams — Real-Time Stream Processing in Java",
          tags: ["kafka-streams", "KStream", "KTable", "windowing", "RocksDB"],
          estimatedMinutes: 45,
          content: t10_kafka_streams
        }
      ]
    },
    {
      id: "staff",
      level: "Staff / Architect",
      levelLabel: "Staff / Architect (5+ yr)",
      color: "error",
      icon: "hub",
      description: "Production-grade Kafka configuration, security, performance tuning, and full observability for enterprise systems.",
      topics: [
        {
          id: "producer-config",
          order: 11,
          title: "Producer Configuration — Reliability, Throughput, and Exactly-Once",
          tags: ["producer-config", "acks", "idempotence", "transactions", "tuning"],
          estimatedMinutes: 40,
          content: t11_producer_config
        },
        {
          id: "kafka-security",
          order: 12,
          title: "Kafka Security — TLS, SASL/SCRAM, and ACLs",
          tags: ["TLS", "SASL", "SCRAM", "ACLs", "security", "enterprise"],
          estimatedMinutes: 40,
          content: t12_kafka_security
        },
        {
          id: "performance-tuning",
          order: 13,
          title: "Kafka Performance Tuning — Throughput vs Latency",
          tags: ["performance", "throughput", "latency", "linger.ms", "batch.size", "lz4"],
          estimatedMinutes: 40,
          content: t13_performance_tuning
        },
        {
          id: "observability",
          order: 14,
          title: "Kafka Observability — Consumer Lag, Metrics, and Alerting",
          tags: ["observability", "consumer-lag", "Prometheus", "Grafana", "tracing", "Micrometer"],
          estimatedMinutes: 40,
          content: t14_observability
        }
      ]
    }
  ]
};

const json = JSON.stringify(data, null, 2);
JSON.parse(json); // validate before writing

writeFileSync(OUT, json, 'utf-8');
console.log('✓ kafkaRoadmap.json generated');
console.log(`  File size   : ${(json.length / 1024).toFixed(1)} KB`);
console.log(`  Phases      : ${data.phases.length}`);
console.log(`  Topics      : ${data.phases.reduce((s, p) => s + p.topics.length, 0)}`);
data.phases.forEach(p => {
  console.log(`  ${p.level.padEnd(16)} : ${p.topics.length} topics`);
});
