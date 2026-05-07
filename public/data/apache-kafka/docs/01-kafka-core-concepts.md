# Kafka Core Concepts

> ### What will you learn?
> - What Kafka is, and why teams use it for fast message flow.
> - How Kafka pieces work together: brokers, topics, partitions, producers, and consumers.
> - How reliability works with delivery semantics, replication, retention, and compaction.

## 📚 Table of Contents
1. [Introduction to Kafka](#introduction-to-kafka)
2. [Kafka Architecture](#kafka-architecture)
3. [Topics and Partitions](#topics-and-partitions)
4. [Producers and Consumers](#producers-and-consumers)
5. [Message Delivery Semantics](#message-delivery-semantics)
6. [Replication and High Availability](#replication-and-high-availability)
7. [Retention and Compaction](#retention-and-compaction)

---

## Introduction to Kafka

### What is Apache Kafka?

**Apache Kafka** is a distributed streaming platform.
Distributed means it runs on multiple machines.
It works like a high-performance messaging system.
It also works like a distributed log storage system.

In plain English: Kafka helps applications send and read data very quickly, while storing that data safely across servers.

### Simple Analogy: The Postal System

Think of Kafka like a **modern postal system**:

- **Topics** = Different types of mailboxes (e.g., "Orders", "Payments", "Notifications")
- **Partitions** = Multiple mail sorting centers for the same mailbox type (for parallel processing)
- **Producers** = People sending letters (applications sending data)
- **Consumers** = People receiving letters (applications reading data)
- **Brokers** = Post offices (Kafka servers that store and route messages)
- **Consumer Groups** = Multiple people reading from the same mailbox (for load distribution)

### Why Kafka?

1. **High Throughput**: Can handle millions of messages per second
2. **Scalability**: Horizontally scalable (add more brokers)
3. **Durability**: Messages are persisted to disk
4. **Fault Tolerance**: Replication ensures no data loss
5. **Real-time Processing**: Low latency for stream processing

**Quick Check:** If your app traffic doubles, which Kafka feature helps you handle that growth?

---

## Kafka Architecture

### High-Level Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Producer   │────▶│   Broker    │◀────│  Consumer   │
│  (Sender)   │     │   (Server)  │     │  (Receiver) │
└─────────────┘     └─────────────┘     └─────────────┘
                          │
                          │
                   ┌──────┴──────┐
                   │   Topic     │
                   │  Partition  │
                   └─────────────┘
```

### Components Explained

#### 1. **Brokers**

**Brokers** are Kafka servers.
They store messages in topics.
They handle read and write requests.
They replicate data for safety.
They coordinate with other brokers in a cluster.

**Key Points:**
- A Kafka cluster consists of one or more brokers
- Each broker has a unique ID
- Brokers can be added/removed without downtime

#### 2. **Clusters**

A **cluster** is a group of brokers that work together.
This gives high availability, scaling, and load sharing.

In plain English: one broker can fail, and the system can still continue.

**Example:**
```
Cluster with 3 Brokers:
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Broker 1 │  │ Broker 2 │  │ Broker 3 │
│  :9092   │  │  :9093   │  │  :9094   │
└──────────┘  └──────────┘  └──────────┘
    │             │             │
    └─────────────┴─────────────┘
           Kafka Cluster
```

#### 3. **Zookeeper vs KRaft Mode**

**Zookeeper (Traditional):**
- External dependency for cluster coordination
- Stores metadata, broker information, topic configurations
- Being phased out in favor of KRaft

**KRaft Mode (New):**
- Kafka's own consensus mechanism
- No external dependency
- Better performance and scalability
- Recommended for new deployments

**Quick Check:** What is the main operational difference between Zookeeper mode and KRaft mode?

---

## Topics and Partitions

### Topics

A **topic** is a named category where messages are published.

**Analogy:** A topic is like a **mailbox** or a **newspaper section** (e.g., "Sports", "Business").

**Example Topics:**
- `user-events`
- `order-created`
- `payment-processed`
- `inventory-updates`

### Partitions

A **partition** is a physical division of a topic.
Each partition is an ordered, immutable sequence of messages.
Ordered means order is guaranteed inside one partition.
Immutable means old records are not changed in place.

In plain English: a topic is split into smaller lanes so Kafka can process data faster.

**Why Partitions?**
1. **Parallelism**: Multiple consumers can read from different partitions simultaneously
2. **Scalability**: Distribute data across multiple brokers
3. **Ordering**: Messages within a partition are ordered (but not across partitions)

**Analogy:**
- Topic = A book
- Partition = Chapters of the book
- Multiple readers can read different chapters simultaneously

### Partition Structure

```
Topic: "user-events"
│
├── Partition 0: [msg1, msg2, msg3, ...]
├── Partition 1: [msg4, msg5, msg6, ...]
└── Partition 2: [msg7, msg8, msg9, ...]
```

**Key Properties:**
- Each message in a partition has a unique **offset** (sequential ID)
- Partitions are distributed across brokers
- Each partition can be on a different broker

### Partitioning Strategy

**How are messages assigned to partitions?**

1. **Key-Based Partitioning** (Recommended):
   - Messages with the same key go to the same partition
   - Ensures ordering for related messages
   - Example: User ID as key → all user events in same partition

2. **Round-Robin** (No Key):
   - Messages distributed evenly across partitions
   - No ordering guarantee

**Example:**
```java
// Key-based partitioning
producer.send(new ProducerRecord<>("user-events", userId, event));

// Round-robin (no key)
producer.send(new ProducerRecord<>("user-events", event));
```

### Replication Factor

**Replication Factor** means how many copies of each partition Kafka keeps across brokers.

**Example: Replication Factor = 3**
```
Topic: "user-events", Partition 0
│
├── Leader (Broker 1) ──┐
├── Replica (Broker 2) ──┼── All have same data
└── Replica (Broker 3) ──┘
```

**Benefits:**
- **Fault Tolerance**: If leader fails, replica becomes leader
- **High Availability**: No data loss on broker failure

**Quick Check:** Why does key-based partitioning help when you need per-user ordering?

---

## Producers and Consumers

### Producers

**Producers** are applications that publish messages to Kafka topics.

**Producer Responsibilities:**
1. Create messages
2. Assign partition (if key provided)
3. Send messages to broker
4. Handle acknowledgments
5. Retry on failure

**Producer Flow:**
```
Application → Producer → Serialize → Partition Selection → Send to Broker
```

**Key Configuration:**
- `acks`: Acknowledgment level (0, 1, all)
- `retries`: Number of retry attempts
- `batch.size`: Batch messages for efficiency
- `linger.ms`: Wait time before sending batch

### Consumers

**Consumers** are applications that read messages from Kafka topics.

**Consumer Responsibilities:**
1. Subscribe to topics
2. Read messages from partitions
3. Process messages
4. Commit offsets (mark messages as processed)

**Consumer Flow:**
```
Broker → Deserialize → Consumer → Process → Commit Offset
```

### Consumer Groups

A **Consumer Group** is a set of consumers that work together to read a topic.

In plain English: group members share the work so one consumer does not handle everything alone.

**Key Concepts:**
- Each consumer in a group reads from different partitions
- If consumers > partitions, some consumers are idle
- If consumers < partitions, some consumers read multiple partitions

**Example: Topic with 3 Partitions, Consumer Group with 2 Consumers**
```
Partition 0 ──▶ Consumer 1
Partition 1 ──▶ Consumer 1
Partition 2 ──▶ Consumer 2
```

**Example: Topic with 3 Partitions, Consumer Group with 4 Consumers**
```
Partition 0 ──▶ Consumer 1
Partition 1 ──▶ Consumer 2
Partition 2 ──▶ Consumer 3
Consumer 4 ──▶ (idle - no partition assigned)
```

### Offsets

**Offset** is a unique sequential ID for each message in one partition.

**Key Points:**
- Offsets are per partition (not global)
- Consumers track their position using offsets
- Committing offset = "I've processed up to this point"
- On restart, consumer resumes from last committed offset

**Example:**
```
Partition 0: [offset:0] [offset:1] [offset:2] [offset:3] [offset:4]
                             ▲
                       Consumer is here
                       (committed offset: 1)
```

**Quick Check:** If a consumer crashes and restarts, what helps it continue from the correct place?

---

## Message Delivery Semantics

### Three Delivery Guarantees

In plain English: delivery semantics describe the trade-off between speed, safety, and duplicate handling.

#### 1. **At-Most-Once** (May Lose Messages)

- Messages sent once, no retries
- If failure occurs, message may be lost
- **Use Case**: Metrics, logs where loss is acceptable

**Configuration:**
```properties
acks=0
retries=0
```

#### 2. **At-Least-Once** (May Duplicate Messages)

- Messages guaranteed to be delivered
- Retries on failure may cause duplicates
- **Use Case**: Most common, requires idempotent processing

**Configuration:**
```properties
acks=all
retries=3
enable.idempotence=false
```

#### 3. **Exactly-Once** (No Loss, No Duplicates)

- Messages delivered exactly once
- Requires idempotent producer and transactional processing
- **Use Case**: Financial transactions, critical operations

**Configuration:**
```properties
acks=all
retries=3
enable.idempotence=true
transactional.id=unique-id
```

### Choosing the Right Semantics

| Semantics | Loss Risk | Duplicate Risk | Performance | Use Case |
|-----------|-----------|----------------|-------------|----------|
| At-Most-Once | High | None | Highest | Metrics, Logs |
| At-Least-Once | None | Medium | High | Most Applications |
| Exactly-Once | None | None | Medium | Financial, Critical |

**Quick Check:** Which delivery option would you pick when duplicate payments are not acceptable?

---

## Replication and High Availability

### Leader-Follower Model

Each partition has:
- **1 Leader**: Handles all read/write requests
- **N-1 Followers**: Replicate leader's data (where N = replication factor)

**Leader Responsibilities:**
- Serve read/write requests
- Track which followers are in-sync

**Follower Responsibilities:**
- Replicate data from leader
- Become leader if current leader fails

### In-Sync Replicas (ISR)

**ISR** means replicas that are up-to-date with the leader.

In plain English: ISR is the trusted set of replicas that are ready to take over.

**How it works:**
1. Leader writes message
2. Followers replicate message
3. Leader waits for ISR acknowledgment
4. Message is committed

**Example: Replication Factor = 3**
```
Leader (Broker 1) ──┐
                   ├── ISR: All 3 replicas in sync
Replica (Broker 2) ─┼──
                   │
Replica (Broker 3) ─┘
```

### Leader Election

When leader fails:
1. Controller (broker) detects failure
2. Selects new leader from ISR
3. Updates metadata
4. Producers/consumers reconnect to new leader

**Time to Recovery:** Typically < 1 second

**Quick Check:** Why is leader election critical for high availability?

---

## Retention and Compaction

### Retention Policies

**Time-Based Retention:**
- Keep messages for X days/hours
- Example: `retention.ms=604800000` (7 days)
- Old messages automatically deleted

**Size-Based Retention:**
- Keep messages until topic reaches X size
- Example: `retention.bytes=1073741824` (1 GB)

**Use Cases:**
- **Short Retention**: Real-time events, temporary data
- **Long Retention**: Audit logs, compliance data

### Log Compaction

**Compaction** keeps only the latest value for each key.

In plain English: if the same key appears many times, Kafka keeps the newest state.

**How it works:**
- For each key, only the most recent message is kept
- Older messages with same key are deleted
- Useful for maintaining current state

**Example:**
```
Before Compaction:
[key: user-123, value: {name: "John", age: 25}]
[key: user-123, value: {name: "John", age: 26}]
[key: user-123, value: {name: "John", age: 27}]

After Compaction:
[key: user-123, value: {name: "John", age: 27}]  ← Only latest kept
```

**Use Cases:**
- User profiles
- Configuration data
- Current state snapshots

### Log Segments

Kafka stores partitions as **log segments** (files):
- Each segment is a file on disk
- Segments are rolled when size/time limit reached
- Old segments deleted based on retention policy

**Example:**
```
Partition 0:
├── segment-0.log (0-1000 offsets)
├── segment-1.log (1001-2000 offsets)
└── segment-2.log (2001-3000 offsets)
```

**Quick Check:** What is the difference between normal retention and log compaction?

---

## Summary

### Key Takeaways

1. **Kafka = Distributed Log System** with high throughput and durability
2. **Topics** organize messages, **Partitions** enable parallelism
3. **Producers** send, **Consumers** read, **Consumer Groups** distribute load
4. **Replication** provides fault tolerance and high availability
5. **Offsets** track consumer position in partitions
6. **Delivery Semantics** (at-least-once, exactly-once) depend on use case
7. **Retention** and **Compaction** manage data lifecycle

### Next Steps

- Read [Spring Boot Integration Guide](./02-spring-boot-integration.md)
- Review [Architecture Diagrams](./diagrams/)
- Start with [Basic Producer/Consumer Examples](../examples/)

**Quick Check:** Which single concept from this file do you think is most important before writing Kafka code?

---

## 📊 Visual Reference

See detailed diagrams in [docs/diagrams/](./diagrams/):
- `kafka-architecture.puml` - Complete Kafka architecture
- `producer-consumer-flow.puml` - Message flow diagram
- `replication-model.puml` - Replication and leader election

What's next? Go to [Spring Boot Integration Guide](./02-spring-boot-integration.md).
