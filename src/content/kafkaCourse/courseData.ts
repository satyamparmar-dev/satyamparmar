// ─── Apache Kafka Complete Course ─────────────────────────────────────────────
// 5 phases · 19 lessons · ~18 hours

export type SectionType = 'why' | 'analogy' | 'concept' | 'code' | 'task' | 'summary';
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface CourseSection {
  id: string;
  type: SectionType;
  title: string;
  content: string; // markdown
}

export interface CourseLesson {
  id: string;
  phase: number;
  lesson: number;
  title: string;
  subtitle: string;
  duration: string;
  difficulty: Difficulty;
  tags: string[];
  sections: CourseSection[];
  checkpoints: string[];
}

export interface CoursePhase {
  number: number;
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  totalDuration: string;
}

// ─── Phases ───────────────────────────────────────────────────────────────────

export const COURSE_PHASES: CoursePhase[] = [
  {
    number: 1,
    id: 'phase-1',
    title: 'What is Kafka and Why Should I Care?',
    subtitle: 'Basic Theory — No code yet',
    description: 'Understand the real problem Kafka solves using everyday analogies. Learn brokers, topics, partitions, producers, and consumers in plain English before writing a single line of code.',
    icon: '📬',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    totalDuration: '3 hours',
  },
  {
    number: 2,
    id: 'phase-2',
    title: 'See the Big Picture',
    subtitle: 'Architecture Diagrams — Draw before you code',
    description: 'Look at the entire Kafka system as one picture. Trace how a message travels from producer to consumer across brokers. Understand replication and why Kafka never loses data.',
    icon: '🗺️',
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0369a1 100%)',
    totalDuration: '2 hours',
  },
  {
    number: 3,
    id: 'phase-3',
    title: 'Your First Kafka Code',
    subtitle: 'Spring Boot Integration — Run a real app',
    description: 'Start Kafka with one Docker command. Build a real Spring Boot producer and consumer. Send a message via REST and watch it appear in the consumer logs. Break things on purpose.',
    icon: '💻',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    totalDuration: '4 hours',
  },
  {
    number: 4,
    id: 'phase-4',
    title: 'Real Features You Will Use at Work',
    subtitle: 'Intermediate — What senior devs use daily',
    description: 'Master consumer groups, offset management, retries, dead letter topics, and transactions. These are the features that separate a toy Kafka app from a production one.',
    icon: '⚙️',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    totalDuration: '4 hours',
  },
  {
    number: 5,
    id: 'phase-5',
    title: 'Build Like a Senior Engineer',
    subtitle: 'Enterprise Real-World — Interview ready',
    description: 'Walk through a complete e-commerce order system. Trace every Kafka event from "Buy" to confirmation email. Learn the Saga pattern, Outbox pattern, and answer the top 10 interview questions.',
    icon: '🏗️',
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    totalDuration: '5 hours',
  },
];

// ─── Lessons ──────────────────────────────────────────────────────────────────

export const COURSE_LESSONS: CourseLesson[] = [

  // ── Phase 1: What is Kafka ───────────────────────────────────────────────

  {
    id: 'p1-l1',
    phase: 1,
    lesson: 1,
    title: 'Introduction to Apache Kafka',
    subtitle: 'The problem it solves and why every company uses it',
    duration: '45 min',
    difficulty: 'Beginner',
    tags: ['kafka', 'messaging', 'distributed-systems'],
    checkpoints: [
      'What real problem does Kafka solve that a direct REST API cannot?',
      'If you add a new "Analytics Service" that needs order data, do you change the Order Service? Why?',
      'Describe Kafka in one sentence using the "notice board" analogy.',
    ],
    sections: [
      {
        id: 'p1-l1-why',
        type: 'why',
        title: 'Why does this matter?',
        content: `Imagine your company has 10 services. Every time one service needs to tell another about an event, it calls it directly via REST. Now multiply that by 100 services. You have a spaghetti nightmare.

Kafka is the solution the entire industry settled on. **Netflix**, **Uber**, **LinkedIn** (who built Kafka), and thousands of companies use it because it solves one specific problem extremely well.

Understanding Kafka is no longer optional for a Java backend developer — it is expected in almost every mid-to-senior job interview.`,
      },
      {
        id: 'p1-l1-analogy',
        type: 'analogy',
        title: 'Think of it as an office notice board',
        content: `**Before Kafka:** When the Sales team closed a deal, they called Accounts directly. Then called Warehouse. Then called Shipping. Three calls. Slow. Fragile. If Accounts was busy, Sales waited.

**With Kafka:** Sales pins a note on the **notice board**: *"Deal closed — Order #1234."* Accounts walks up and reads it when ready. Warehouse reads it when ready. Shipping reads it when ready. Sales has already moved on.

> Kafka IS that notice board. Fast. Decoupled. Durable. One sender, many independent readers.

The critical insight: **the sender does not wait for anyone, and adding a new reader requires zero changes to the sender.**`,
      },
      {
        id: 'p1-l1-concept',
        type: 'concept',
        title: 'What is Apache Kafka?',
        content: `**Apache Kafka** is a distributed streaming platform. In practical terms, it is a highly reliable message broker that:

- Stores messages durably on disk (messages do not vanish after being read)
- Handles millions of messages per second
- Lets multiple independent consumers read the same message
- Keeps messages available for replay (hours, days, or forever — you configure it)

**The core problem it solves:**

| Without Kafka | With Kafka |
|---|---|
| Service A calls Service B directly (tight coupling) | Service A publishes an event; anyone reads it |
| If B is down, A crashes or must retry | A publishes and moves on; B reads when it recovers |
| Adding Service C means changing Service A | Adding Service C requires zero changes to A |
| Handling 10× traffic means scaling both A and B together | Each consumer scales independently |

**Why not just use a database?**
A database stores state. Kafka stores a stream of events — what *happened*, not just what *is*. You can replay the event stream and rebuild any state.`,
      },
      {
        id: 'p1-l1-task',
        type: 'task',
        title: 'Hands-on task (no code)',
        content: `Take a blank piece of paper. Draw this system:

1. A box on the left: **"Order Service"** — this is your notice board poster.
2. A big box in the middle: **"Kafka"** — this is the notice board itself.
3. Three boxes on the right: **"Payment Service"**, **"Inventory Service"**, **"Notification Service"**.
4. Draw arrows from Order Service → Kafka. Draw arrows from Kafka → each of the three right-side boxes.
5. Label the arrows: what travels along each one?

Next to the left arrows write: *"OrderCreated event (JSON)"*
Next to the right arrows write: *"Each service reads independently"*

**Save this drawing.** Every phase builds on it.`,
      },
      {
        id: 'p1-l1-summary',
        type: 'summary',
        title: 'What you just learned',
        content: `Kafka solves the "who calls who" problem. Instead of services calling each other directly, one service publishes an event to Kafka and every interested service reads it independently. This removes tight coupling, enables independent scaling, and means a crashed receiver never blocks the sender. The notice board analogy covers 90% of what Kafka is — everything else is implementation detail.`,
      },
    ],
  },

  {
    id: 'p1-l2',
    phase: 1,
    lesson: 2,
    title: 'Brokers, Topics & Partitions',
    subtitle: 'The three building blocks that every Kafka system is built from',
    duration: '45 min',
    difficulty: 'Beginner',
    tags: ['broker', 'topic', 'partition', 'kafka-architecture'],
    checkpoints: [
      'What is a broker in one sentence?',
      'A topic has 4 partitions. Where is message ordering guaranteed?',
      'Why would you use a message key instead of sending without a key?',
    ],
    sections: [
      {
        id: 'p1-l2-why',
        type: 'why',
        title: 'Why these three concepts?',
        content: `Every single Kafka question in a job interview comes back to **Broker**, **Topic**, and **Partition**. If you can explain all three with confidence, you pass the first round. These are the atoms — everything else is made of them.`,
      },
      {
        id: 'p1-l2-analogy',
        type: 'analogy',
        title: 'Post office, mailbox, and highway lane',
        content: `**Broker = Post Office**
A Kafka **broker** is a server that stores and routes messages. Just as a post office stores letters and routes them to recipients, a broker stores messages in topics and serves them to consumers. A group of brokers working together is a **cluster** — like a network of post offices.

**Topic = Mailbox Category**
A **topic** is a named channel. Just as you might have different email folders — Inbox, Promotions, Social — Kafka has topics like:
- \`order-created\`
- \`payment-processed\`
- \`user-events\`

All messages of the same *type* go into the same topic.

**Partition = Highway Lane**
A **partition** is a slice of a topic. Think of a 3-lane motorway: three cars can travel simultaneously rather than in a single queue. More partitions = more parallelism = higher throughput.

> Ordering is guaranteed **within one lane**. Not across lanes.`,
      },
      {
        id: 'p1-l2-concept',
        type: 'concept',
        title: 'The details that matter',
        content: `### Brokers

- Each broker has a unique numeric ID (1, 2, 3…)
- A cluster typically has 3 brokers (for 3× replication)
- Brokers can be added without downtime
- Each partition lives on exactly one broker as its **leader**

### Topics

- Created by producers or automatically by Kafka (if auto-create is on)
- Names are arbitrary strings: \`user.events\`, \`order-created\`, \`inventory_updates\`
- A topic has a **replication factor** (how many copies) and **partition count**

### Partitions

\`\`\`
Topic: "order-created"  (3 partitions, replication factor 2)
│
├── Partition 0: [msg:0] [msg:1] [msg:2] [msg:3] ...  → Leader: Broker 1
├── Partition 1: [msg:0] [msg:1] [msg:2] [msg:3] ...  → Leader: Broker 2
└── Partition 2: [msg:0] [msg:1] [msg:2] [msg:3] ...  → Leader: Broker 3
\`\`\`

Each message has a unique **offset** — its position within a partition.

### How messages land in partitions

**With a key** (recommended for related messages):
The key is hashed → same key always lands in same partition → ordering preserved for that key.
Example: \`userId\` as key → all events for user-123 always go to Partition 0.

**Without a key:**
Messages round-robin across all partitions. No ordering guarantee.`,
      },
      {
        id: 'p1-l2-code',
        type: 'code',
        title: 'Sending with and without a key',
        content: `\`\`\`java
// Key-based partitioning — all events for this userId go to the same partition
// This ensures ordering for that user's events
producer.send(new ProducerRecord<>("user-events", userId, event));

// Round-robin — message distributed to any partition
// No ordering guarantee, but maximum throughput
producer.send(new ProducerRecord<>("user-events", event));
\`\`\`

**Rule of thumb:** Use a key whenever ordering matters for related messages.
Example: payment events for the same order must stay in order → use \`orderId\` as key.`,
      },
      {
        id: 'p1-l2-task',
        type: 'task',
        title: 'Design exercise',
        content: `Design the Kafka topics for a simple ride-sharing app (like Uber). Answer these:

1. List 4 topic names you would create (one event per significant action).
2. For each topic, decide: how many partitions? What key would you use?
3. Which topic absolutely needs key-based partitioning and why?

*Hint: think about driver location updates — which user's events must stay ordered?*

There is no single right answer. The goal is to reason about partitioning strategy.`,
      },
      {
        id: 'p1-l2-summary',
        type: 'summary',
        title: 'What you just learned',
        content: `Brokers are Kafka servers that store messages. Topics are named channels for a type of event. Partitions split a topic into parallel lanes for throughput. Ordering is only guaranteed within one partition — which is why you use a message key when order matters for related messages. Three concepts, one mental model: post office (broker) with labelled mailboxes (topics) that have multiple lanes (partitions).`,
      },
    ],
  },

  {
    id: 'p1-l3',
    phase: 1,
    lesson: 3,
    title: 'Producers, Consumers & Consumer Groups',
    subtitle: 'Who sends, who reads, and how work is shared at scale',
    duration: '45 min',
    difficulty: 'Beginner',
    tags: ['producer', 'consumer', 'consumer-group', 'offset'],
    checkpoints: [
      'A topic has 5 partitions. Your consumer group has 8 consumers. How many are idle?',
      'What does "committing an offset" mean?',
      'Two separate services both need to read from order-created. What should each use?',
    ],
    sections: [
      {
        id: 'p1-l3-why',
        type: 'why',
        title: 'Why you need to understand these first',
        content: `99% of Kafka code you write will either be a **producer** (sending events) or a **consumer** (processing events). The **consumer group** is what makes horizontal scaling automatic. Understanding these three is understanding Kafka in practice.`,
      },
      {
        id: 'p1-l3-analogy',
        type: 'analogy',
        title: 'Letter writer, letter reader, and call center team',
        content: `**Producer = Letter Writer**
The producer is the part of your code that writes events. Order Service writes *"Order #1234 was placed."* It does not know or care who reads it.

**Consumer = Letter Reader**
The consumer reads messages from a topic. Payment Service reads order events and processes payments. It reads at its own pace.

**Consumer Group = Call Center Team**
Imagine 500 calls per hour and 5 staff members. Each staff member handles a different phone line (partition). Work is distributed automatically.

> If one staff member is sick, the others cover their line — automatic failover.
> If calls double, hire more staff — horizontal scaling.
> Adding a new team (consumer group) does not affect the existing team — independence.

**Offset = Bookmark**
When you read to page 200 of a novel and stop, you put a bookmark in. Next time you open the book, you start from page 200. The **offset** is Kafka's bookmark — per partition, per consumer group.`,
      },
      {
        id: 'p1-l3-concept',
        type: 'concept',
        title: 'The rules of consumer groups',
        content: `### The golden rules

\`\`\`
Active consumers = min(consumers in group, partitions in topic)
\`\`\`

| Scenario | Result |
|---|---|
| 3 partitions + 3 consumers | Perfect: 1 partition per consumer |
| 3 partitions + 1 consumer | That 1 consumer reads all 3 partitions |
| 3 partitions + 5 consumers | 3 active, **2 idle** (no partition available) |

### Multiple consumer groups = independent reads

\`\`\`
Topic: "order-created"
         │
         ├── Consumer Group: "payment-service"   → Payment team reads
         ├── Consumer Group: "inventory-service" → Inventory team reads
         └── Consumer Group: "analytics-service" → Analytics team reads
\`\`\`

Each group has its **own offset bookmark**. Inventory reading at offset 150 does not affect Payment reading at offset 200.

### Offsets — your position in the partition

\`\`\`
Partition 0: [0] [1] [2] [3] [4] [5] [6] [7]
                          ▲
                  Consumer committed here (offset=4)
                  Next read starts from 5
\`\`\`

Offsets are stored in Kafka's internal topic: \`__consumer_offsets\`.
On restart, the consumer checks this topic and resumes from its last committed offset.`,
      },
      {
        id: 'p1-l3-task',
        type: 'task',
        title: 'Partition assignment exercise',
        content: `Work through this scenario on paper:

**Topic:** \`payment-events\` with **4 partitions**
**Consumer Group:** \`fraud-detection-service\` starting with **2 consumers**

1. Draw which consumer gets which partition(s).
2. Now you scale up to 4 consumers. Redraw.
3. You scale to 6 consumers. Redraw. Which consumers are idle?
4. Broker 1 (which holds Partition 0 leader) crashes. What happens to the consumer reading Partition 0? What does Kafka do automatically?`,
      },
      {
        id: 'p1-l3-summary',
        type: 'summary',
        title: 'What you just learned',
        content: `Producers write events to topics. Consumers read events from topics. A consumer group is a team of consumers sharing partitions — each partition assigned to exactly one consumer in the group. Adding more consumers (up to partition count) scales processing automatically. Offsets track each group's reading position, surviving restarts and crashes. Two groups reading the same topic are completely independent of each other.`,
      },
    ],
  },

  {
    id: 'p1-l4',
    phase: 1,
    lesson: 4,
    title: 'Message Delivery Guarantees',
    subtitle: 'At-most-once, at-least-once, exactly-once — pick the right one',
    duration: '45 min',
    difficulty: 'Beginner',
    tags: ['delivery-semantics', 'exactly-once', 'idempotence', 'acks'],
    checkpoints: [
      'Which guarantee could result in a customer being charged twice? How do you prevent it?',
      'What configuration produces exactly-once semantics?',
      'When is "at-most-once" an acceptable choice?',
    ],
    sections: [
      {
        id: 'p1-l4-why',
        type: 'why',
        title: 'Why delivery guarantees matter',
        content: `If a network glitch happens mid-send, what should Kafka do? Retry and risk a duplicate? Give up and lose the message? The answer depends on what the message represents. Charging a credit card twice is catastrophic. Losing one metric event is fine. Kafka gives you a choice — but you must understand the trade-offs.`,
      },
      {
        id: 'p1-l4-analogy',
        type: 'analogy',
        title: 'Three tiers of courier service',
        content: `**At-Most-Once = Standard post**
"We'll try once. If it gets lost — sorry." Fast and cheap. Used for sending flyers.

**At-Least-Once = Tracked parcel**
"We guarantee it arrives. But if we retry after a network issue, you might get it twice." The most common choice. Requires your processing to be *idempotent* (running it twice gives the same result).

**Exactly-Once = Certified registered mail**
"Guaranteed to arrive. Guaranteed only once." Slowest. More expensive. Essential for payments.`,
      },
      {
        id: 'p1-l4-concept',
        type: 'concept',
        title: 'The three delivery guarantees in detail',
        content: `### At-Most-Once (fire and forget)
- Message sent once, no retries
- If failure occurs → message lost forever
- **Use when:** logging, metrics, analytics where occasional loss is acceptable

### At-Least-Once (the industry default)
- Kafka retries on failure
- On retry, message may be delivered more than once
- **Use when:** most business events — handle duplicates in your processing logic
- *Idempotency tip:* Before processing, check "have I already handled this order ID?"

### Exactly-Once (zero loss + zero duplicates)
- Message delivered exactly one time
- Requires idempotent producer + transactional consumer
- **Use when:** financial transactions, payment processing, critical operations

### Comparison table

| Guarantee | Loss risk | Duplicate risk | Speed | Best for |
|---|---|---|---|---|
| At-Most-Once | High | None | Fastest | Metrics, logs |
| At-Least-Once | None | Yes | Fast | Most apps |
| Exactly-Once | None | None | Moderate | Payments |`,
      },
      {
        id: 'p1-l4-code',
        type: 'code',
        title: 'Configuration for each guarantee — and what each property actually does',
        content: `### At-Most-Once (fire and forget)
\`\`\`yaml
spring:
  kafka:
    producer:
      acks: "0"         # Don't wait for ANY broker acknowledgment
      retries: 0        # Never retry — if it fails, it's gone
\`\`\`

**What happens in your app:** Your producer calls \`.send()\` and immediately moves on without waiting. If the broker is momentarily unreachable, the message is silently dropped. Your throughput is maximum — nothing waits. Use this ONLY for metrics, analytics, or logs where losing 1-in-10,000 messages is acceptable.

---

### At-Least-Once (the industry default)
\`\`\`yaml
spring:
  kafka:
    producer:
      acks: all               # Wait for ALL in-sync replicas to confirm
      retries: 2147483647     # Retry virtually forever on failure
      properties:
        enable.idempotence: false          # Allow duplicates on retry
        max.in.flight.requests.per.connection: 5
        retry.backoff.ms: 100             # Wait 100ms between retries
\`\`\`

**What happens in your app:** If the broker is slow or temporarily fails, your producer retries. The consumer WILL receive the message — guaranteed. But if a retry happens after the broker already received the first attempt, the consumer gets it twice. Your consumer must handle this with idempotency checks (e.g., "have I already processed order-1234?").

---

### Exactly-Once (zero loss + zero duplicates)
\`\`\`yaml
spring:
  kafka:
    producer:
      acks: all
      retries: 2147483647
      enable-idempotence: true            # Assign sequence numbers to deduplicate
      properties:
        transactional.id: order-producer-1  # Unique ID for this producer instance
        max.in.flight.requests.per.connection: 5  # Auto-set by idempotence
\`\`\`

**What happens in your app:** Each message gets a producer ID + sequence number. The broker rejects duplicates even across retries. \`transactional.id\` enables atomic batches — either all messages in a transaction commit or all roll back. Essential for payment events or any scenario where duplicates cause real-world harm.

---

### Properties side-by-side

| Property | At-Most-Once | At-Least-Once | Exactly-Once |
|---|---|---|---|
| \`acks\` | \`0\` | \`all\` | \`all\` |
| \`retries\` | \`0\` | \`3+\` | \`2147483647\` |
| \`enable.idempotence\` | \`false\` | \`false\` | \`true\` |
| \`transactional.id\` | not set | not set | unique string |
| Loss risk | High | None | None |
| Duplicate risk | None | Yes | None |
| Speed | Fastest | Fast | Moderate |`,
      },
      {
        id: 'p1-l4-task',
        type: 'task',
        title: 'Pick the right guarantee',
        content: `For each scenario below, choose the correct delivery guarantee and explain why:

1. Your app logs every page view to Kafka for analytics.
2. A payment service sends a "charge card" event.
3. A notification service sends "new message" push notifications.
4. An order service updates inventory counts.
5. A fraud detection service flags suspicious transactions.

*Think about: what is the cost of a lost message? What is the cost of a duplicate?*`,
      },
      {
        id: 'p1-l4-summary',
        type: 'summary',
        title: 'What you just learned',
        content: `The three delivery guarantees represent a trade-off between safety and speed. At-most-once is fastest but risks data loss. At-least-once is the safe default but requires idempotent processing. Exactly-once is the gold standard for critical operations but has overhead. In practice, most real-world systems use at-least-once with idempotent processing logic rather than the complexity of exactly-once transactions.`,
      },
    ],
  },

  // ── Phase 2: Architecture ────────────────────────────────────────────────

  {
    id: 'p2-l1',
    phase: 2,
    lesson: 1,
    title: 'Kafka Cluster Architecture',
    subtitle: 'How multiple brokers work together as one system',
    duration: '40 min',
    difficulty: 'Beginner',
    tags: ['cluster', 'broker', 'zookeeper', 'kraft'],
    checkpoints: [
      'What is a Kafka cluster and why do you need more than one broker?',
      'What is the difference between Zookeeper mode and KRaft mode?',
      'If you have 3 brokers and one crashes, what happens?',
    ],
    sections: [
      {
        id: 'p2-l1-why',
        type: 'why',
        title: 'Why multiple brokers?',
        content: `A single server can crash. A single server has limited disk and CPU. Kafka solves both problems by running as a **cluster** — multiple brokers that cooperate. Understanding cluster architecture is essential for any interview question about Kafka reliability.`,
      },
      {
        id: 'p2-l1-analogy',
        type: 'analogy',
        title: 'A network of post offices',
        content: `Imagine one post office for a city of a million people. The queues would be enormous. It would be a single point of failure.

Now imagine 3 post offices across the city. Work is split. If one office burns down, the other two continue operating. Mail that was stored in all three offices (replicated) survives.

Kafka works the same way: **3 brokers** (servers) share the load. Data is replicated across all three. One failure = automatic recovery, no data loss, no downtime.`,
      },
      {
        id: 'p2-l1-concept',
        type: 'concept',
        title: 'Kafka cluster anatomy',
        content: `\`\`\`
┌──────────────────────────────────────────────────────────────────────┐
│                         KAFKA CLUSTER                                │
│                                                                      │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐           │
│  │   Broker 1   │    │   Broker 2   │    │   Broker 3   │           │
│  │   port 9092  │    │   port 9093  │    │   port 9094  │           │
│  │              │    │              │    │              │           │
│  │ P0 Leader    │    │ P1 Leader    │    │ P2 Leader    │           │
│  │ P1 Replica   │    │ P2 Replica   │    │ P0 Replica   │           │
│  └──────────────┘    └──────────────┘    └──────────────┘           │
│                                                                      │
│  Coordinated by: Zookeeper (legacy) or KRaft (modern, recommended)  │
└──────────────────────────────────────────────────────────────────────┘
\`\`\`

### Zookeeper vs KRaft

**Zookeeper (Traditional):** An external coordination service. Kafka asks Zookeeper: "who is the leader?", "which brokers are alive?". Being phased out.

**KRaft (Modern):** Kafka manages its own metadata internally. No external dependency. Faster, simpler. Use this for new projects.

In our \`docker-compose.yml\` you'll see Zookeeper configured — this is common in tutorials and older setups. KRaft is the future.

### The Controller

One broker in the cluster is elected as the **Controller** — the manager who:
- Detects when brokers fail
- Assigns new partition leaders
- Updates cluster metadata

If the controller crashes, another broker becomes controller automatically.`,
      },
      {
        id: 'p2-l1-task',
        type: 'task',
        title: 'Draw the cluster',
        content: `On paper, draw a 3-broker Kafka cluster for an e-commerce app.

- Topic: \`order-created\` with 3 partitions, replication factor 3
- Assign which broker is the **leader** for each partition
- Show replicas on the other two brokers
- Draw a producer connecting to the cluster (hint: it connects to the leader of its target partition)
- Draw two consumer groups: \`payment-service\` and \`inventory-service\`

Then ask: "If Broker 2 crashes, what happens to Partition 1?"`,
      },
      {
        id: 'p2-l1-summary',
        type: 'summary',
        title: 'What you just learned',
        content: `A Kafka cluster is multiple brokers working as one reliable system. Each partition has one leader (handles reads/writes) and replicas on other brokers (for fault tolerance). One special broker acts as Controller — the cluster manager. If any broker crashes, the cluster re-elects leaders automatically in under a second with no data loss. KRaft is the modern mode that removes the need for Zookeeper.`,
      },
    ],
  },

  {
    id: 'p2-l2',
    phase: 2,
    lesson: 2,
    title: 'The Journey of a Message',
    subtitle: '8 steps from producer to consumer — trace every hop',
    duration: '40 min',
    difficulty: 'Beginner',
    tags: ['message-flow', 'acknowledgment', 'poll', 'commit'],
    checkpoints: [
      'Name all 8 steps a message takes from producer to consumer.',
      'Do consumers receive messages pushed to them, or do they pull (poll)?',
      'At which step does the producer know the message is safe?',
    ],
    sections: [
      {
        id: 'p2-l2-why',
        type: 'why',
        title: 'Why trace the full journey?',
        content: `90% of Kafka bugs happen because the developer does not know exactly what step failed. "Why did the consumer not receive the message?" Usually: wrong topic name, wrong partition assignment, offset already past the message, acknowledgment not received. Knowing the 8-step journey means you can immediately pinpoint the failure.`,
      },
      {
        id: 'p2-l2-analogy',
        type: 'analogy',
        title: 'A certified letter travels through the postal system',
        content: `Think of sending a certified letter:
1. You write the letter (producer creates message)
2. You address it and pick the post office counter (partition selection)
3. The post office stamps it "received" (broker writes to disk)
4. Copies are made for backup offices (replication)
5. The post office gives you a receipt (acknowledgment)
6. The recipient walks up to check their box (consumer polls)
7. Recipient reads and signs for the letter (consumer processes)
8. Recipient tells the post office "delivered" (offset commit)

Each step is traceable. If step 4 fails (backup office down), the letter waits. If step 8 is skipped, the letter will be "delivered" again on next visit.`,
      },
      {
        id: 'p2-l2-concept',
        type: 'concept',
        title: 'The 8-step message journey',
        content: `\`\`\`
Step 1: PARTITION SELECTION
   Producer has a message. If key provided → hash key → partition number.
   If no key → round-robin across partitions.

Step 2: SEND TO LEADER BROKER
   Producer connects to the broker that is the leader for the chosen partition.
   (Producers always write to leaders, never directly to replicas)

Step 3: LEADER WRITES TO DISK
   The leader broker appends the message to its partition log file on disk.
   Kafka is a log — append-only, immutable once written.

Step 4: REPLICATION
   Follower brokers fetch the message from the leader and write their copies.
   The ISR (In-Sync Replicas) set tracks which followers are up-to-date.

Step 5: ACKNOWLEDGMENT
   acks=0: Leader doesn't wait — fires and forgets
   acks=1: Leader confirms after writing to its own disk
   acks=all: Leader waits for ALL ISR replicas to confirm
   → Producer receives the ack and considers the send complete.

Step 6: CONSUMER POLLS
   Consumer asks the broker: "Any new messages since my last offset?"
   This is a PULL model — Kafka never pushes to consumers.

Step 7: CONSUMER PROCESSES
   Consumer receives the message batch and runs business logic.

Step 8: OFFSET COMMIT
   Consumer tells Kafka: "I've processed up to offset N in Partition P."
   Kafka stores this in the internal __consumer_offsets topic.
   On restart, consumer resumes from this committed offset.
\`\`\`

**Why pull instead of push?**
- Consumer controls its own speed (no overwhelm)
- Consumer can batch efficiently
- Consumer decides when to mark things as done`,
      },
      {
        id: 'p2-l2-task',
        type: 'task',
        title: 'Trace the journey from memory',
        content: `Close this page and on paper, draw the 8-step journey:
- Label each step
- At each step, write: "What could go wrong here? What does Kafka do about it?"

Then answer:
- *If the leader crashes between Step 3 and Step 5 (before ack), what happens?*
- *If the consumer crashes between Step 7 and Step 8, what happens on restart?*

These are real interview questions. Understand the answers before moving on.`,
      },
      {
        id: 'p2-l2-summary',
        type: 'summary',
        title: 'What you just learned',
        content: `A message takes 8 steps: partition selection → send to leader → write to disk → replicate → ack → consumer polls → consumer processes → offset commit. Consumers pull (not push) — they ask for messages at their own rate. The acknowledgment step is the guarantee checkpoint. The offset commit is the "I'm done" bookmark. Understanding every step is what separates a developer who can debug Kafka from one who cannot.`,
      },
    ],
  },

  {
    id: 'p2-l3',
    phase: 2,
    lesson: 3,
    title: 'Replication & High Availability',
    subtitle: 'Leader-follower, ISR, and automatic failover under one second',
    duration: '40 min',
    difficulty: 'Beginner',
    tags: ['replication', 'leader', 'isr', 'failover', 'high-availability'],
    checkpoints: [
      'What is the ISR set and why does it matter?',
      'With replication factor 3 and one broker down, can Kafka still serve reads and writes?',
      'What is the typical leader election time when a broker fails?',
    ],
    sections: [
      {
        id: 'p2-l3-why',
        type: 'why',
        title: 'What happens when a server dies?',
        content: `Servers crash. SSDs fail. Data centers lose power. Kafka's answer is replication: every piece of data exists on multiple servers simultaneously. When one server dies, another takes over automatically — in under one second — with no data loss. Understanding this is why interviewers ask "how does Kafka achieve high availability?"`,
      },
      {
        id: 'p2-l3-analogy',
        type: 'analogy',
        title: 'Phone backup and cloud photos',
        content: `When your phone backs up to Google Photos, every photo lives on your phone AND in the cloud. If your phone breaks, the photos survive.

Kafka replication works the same way:
- Every partition has 1 **leader** (your phone — the active copy)
- Multiple **followers** (cloud copies — the replicas on other brokers)
- If the leader's broker crashes → a follower is instantly promoted to leader
- No data lost because the follower had an exact copy

> The key word: **In-Sync Replicas (ISR)** — the followers that are fully up-to-date and trusted to become leader.`,
      },
      {
        id: 'p2-l3-concept',
        type: 'concept',
        title: 'Leader-Follower model in detail',
        content: `\`\`\`
Topic: "order-created", Partition 0
Replication Factor = 3

Broker 1 (LEADER)   ◄── Handles all reads and writes
    │
    │ replicates to
    ▼
Broker 2 (FOLLOWER) ◄── Copies every message, tracks leader offset
    │
    │ replicates to
    ▼
Broker 3 (FOLLOWER) ◄── Copies every message, tracks leader offset

ISR = {Broker 1, Broker 2, Broker 3}  ← all in sync
\`\`\`

### What happens when Broker 1 crashes

\`\`\`
[Broker 1 CRASH]

Controller detects failure (via heartbeat timeout)
Controller picks new leader from ISR: Broker 2
Controller updates cluster metadata
Producers and consumers reconnect to Broker 2

Time elapsed: < 1 second
Data lost: 0 (because Broker 2 was in-sync)
\`\`\`

### The ISR (In-Sync Replicas) rule

When you configure \`acks=all\`, the producer waits for **all ISR members** to confirm before considering a message committed. This is the strongest durability guarantee.

If a follower falls behind (network lag, slow disk), it is removed from ISR. The cluster continues with the remaining ISR members. The lagging follower catches up and rejoins ISR.

### Replication factor recommendation

| Environment | Replication Factor |
|---|---|
| Development / local | 1 (no replication) |
| Staging | 2 |
| Production | **3** (industry standard) |`,
      },
      {
        id: 'p2-l3-task',
        type: 'task',
        title: 'Failover scenario planning',
        content: `You have a 3-broker cluster with replication factor 3. Topic \`payments\` has 3 partitions.

Work through these failure scenarios:

1. Broker 1 (leader of Partition 0) crashes. What happens? Who takes over?
2. Both Broker 1 and Broker 2 crash simultaneously. Is the cluster still available?
3. You configured \`acks=all\` and Broker 3 (a follower) crashes. Can producers still send? Why?
4. What would happen if you set replication factor to 1? What is the risk?`,
      },
      {
        id: 'p2-l3-summary',
        type: 'summary',
        title: 'What you just learned',
        content: `Replication is Kafka's fault tolerance mechanism. Every partition has one leader (active) and multiple followers (replicas on other brokers). The ISR set is the group of followers that are fully caught up and eligible to become leader. When a leader fails, the controller elects a new leader from the ISR in under a second with zero data loss. Production clusters run replication factor 3 as the industry standard.`,
      },
    ],
  },

  // ── Phase 3: Spring Boot ─────────────────────────────────────────────────

  {
    id: 'p3-l1',
    phase: 3,
    lesson: 1,
    title: 'Spring Boot Project Setup',
    subtitle: 'Dependencies, docker-compose, and application.yml explained line by line',
    duration: '60 min',
    difficulty: 'Intermediate',
    tags: ['spring-boot', 'spring-kafka', 'docker', 'configuration'],
    checkpoints: [
      'What is the purpose of bootstrap-servers in application.yml?',
      'Why do we configure separate serializers for producer key and value?',
      'What does docker-compose up -d start, and how do you verify Kafka is running?',
    ],
    sections: [
      {
        id: 'p3-l1-why',
        type: 'why',
        title: 'Why Spring Boot makes Kafka easy',
        content: `Without Spring Boot, connecting to Kafka requires ~100 lines of boilerplate Java configuration. Spring Kafka (the \`spring-kafka\` library) reduces this to a few YAML lines and two annotations: **KafkaTemplate** to send, **@KafkaListener** to receive. You focus on business logic, not plumbing.`,
      },
      {
        id: 'p3-l1-concept',
        type: 'concept',
        title: 'Starting Kafka locally with Docker',
        content: `Open \`docker-compose.yml\` at the root of the project. It starts three services:

- **zookeeper** → Kafka's coordinator (legacy mode — used in most tutorials)
- **kafka** → The actual broker on port 9092
- **kafka-ui** → A browser dashboard at http://localhost:8080

\`\`\`bash
# Start everything in the background
docker-compose up -d

# Wait 30 seconds, then open the dashboard
# http://localhost:8080 → You should see one cluster listed
\`\`\`

When you see the Kafka UI showing **1 broker, 0 topics** — your local Kafka is running.`,
      },
      {
        id: 'p3-l1-code',
        type: 'code',
        title: 'Maven dependency + application.yml explained',
        content: `**pom.xml** — just two key dependencies:
\`\`\`xml
<!-- The Spring Boot + Kafka integration library -->
<dependency>
    <groupId>org.springframework.kafka</groupId>
    <artifactId>spring-kafka</artifactId>
</dependency>

<!-- Jackson for converting Java objects ↔ JSON -->
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
</dependency>
\`\`\`

**application.yml** — every important line explained:
\`\`\`yaml
spring:
  kafka:
    bootstrap-servers: localhost:9092  # "Where is Kafka?" — the broker address

    producer:
      key-serializer: ...StringSerializer    # Keys sent as plain text strings
      value-serializer: ...JsonSerializer    # Messages sent as JSON objects
      acks: all          # Wait for ALL replicas to confirm before "done"
      retries: 3         # Try again 3 times if send fails
      enable-idempotence: true  # Even with retries, never duplicate a message

    consumer:
      group-id: my-service-group   # This service's team name
      key-deserializer: ...StringDeserializer   # Read key as String
      value-deserializer: ...JsonDeserializer   # Read value as JSON → Java object
      auto-offset-reset: earliest  # If no bookmark exists, start from the beginning
      enable-auto-commit: false    # I will manually move my bookmark (safer)

    listener:
      ack-mode: manual_immediate   # Move bookmark the moment I call acknowledge()
      concurrency: 3               # Run 3 consumer threads in parallel (one per partition)
\`\`\``,
      },
      {
        id: 'p3-l1-task',
        type: 'task',
        title: 'Set up your local environment',
        content: `Follow these steps in order:

\`\`\`bash
# 1. Start Kafka
docker-compose up -d

# 2. Check all containers are healthy
docker-compose ps
# You should see: zookeeper (healthy), kafka (healthy), kafka-ui (Up)

# 3. Open Kafka UI in browser
# Navigate to: http://localhost:8080
# Click "local" cluster → you should see 1 broker online

# 4. Verify port 9092 is accessible
docker exec kafka kafka-topics --bootstrap-server localhost:9092 --list
# Should return empty (no topics yet) — that's fine
\`\`\`

If the kafka container shows "Restarting" — wait 60 seconds for Zookeeper to fully start first, then try again.`,
      },
      {
        id: 'p3-l1-summary',
        type: 'summary',
        title: 'What you just learned',
        content: `Spring Kafka turns 100 lines of Kafka configuration into a few YAML settings. The two key dependencies are spring-kafka and jackson-databind. bootstrap-servers tells your app where Kafka lives. The producer sends JSON; the consumer reads JSON. manual-commit mode gives you control over when messages are marked as done. Your local Kafka is now running — next step is writing the code to use it.`,
      },
    ],
  },

  {
    id: 'p3-l2',
    phase: 3,
    lesson: 2,
    title: 'Building Your First Producer',
    subtitle: 'KafkaTemplate, @Service, REST endpoint — the complete sender',
    duration: '60 min',
    difficulty: 'Intermediate',
    tags: ['producer', 'kafka-template', 'rest-api', 'dto'],
    checkpoints: [
      'What does KafkaTemplate.send(topic, key, message) do with each argument?',
      'Why use sendMessageAsync instead of a blocking send?',
      'What is the role of the @JsonProperty annotation on UserEvent?',
    ],
    sections: [
      {
        id: 'p3-l2-why',
        type: 'why',
        title: 'The sender side of your app',
        content: `Every Kafka flow starts with a producer. In Spring Boot, you do not configure a Kafka connection manually — you inject \`KafkaTemplate\` (Spring builds it from your YAML config) and call \`.send()\`. Three files make the complete producer: the DTO (data shape), the service (sends the message), and the controller (exposes a REST endpoint to trigger it).`,
      },
      {
        id: 'p3-l2-code',
        type: 'code',
        title: 'The three producer files explained',
        content: `**1. UserEvent.java — the DTO (Data Transfer Object)**
\`\`\`java
public class UserEvent {
    @JsonProperty("userId")
    private String userId;

    @JsonProperty("eventType")
    private String eventType;     // e.g. "LOGIN", "PURCHASE"

    @JsonProperty("timestamp")
    private LocalDateTime timestamp;

    @JsonProperty("data")
    private Object data;          // flexible payload

    public UserEvent() {
        this.timestamp = LocalDateTime.now(); // auto-set on creation
    }
    // getters and setters...
}
\`\`\`
\`@JsonProperty\` tells Jackson (the JSON library) the exact field name in JSON.

**2. KafkaProducerService.java — the actual sender**
\`\`\`java
@Service
public class KafkaProducerService {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public KafkaProducerService(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate; // Spring injects this from your config
    }

    // Async send — does NOT block the calling thread
    public void sendMessageAsync(String topic, String key, Object message) {
        ListenableFuture<SendResult<String, Object>> future =
            kafkaTemplate.send(topic, key, message);
        //  ▲ topic  = "user-events"  (which mailbox)
        //  ▲ key    = userId          (which partition lane)
        //  ▲ message = UserEvent obj  (what to send)

        future.addCallback(
            result -> logger.info("Sent to partition={}, offset={}",
                result.getRecordMetadata().partition(),
                result.getRecordMetadata().offset()),
            ex -> logger.error("Failed to send: {}", ex.getMessage())
        );
    }
}
\`\`\`

**3. EventController.java — the REST door**
\`\`\`java
@RestController
@RequestMapping("/api/events")
public class EventController {

    private final KafkaProducerService producerService;

    @PostMapping("/user")
    public ResponseEntity<String> publishUserEvent(@RequestBody UserEvent event) {
        producerService.sendMessageAsync("user-events", event.getUserId(), event);
        return ResponseEntity.ok("Event published successfully");
    }
}
\`\`\``,
      },
      {
        id: 'p3-l2-concept',
        type: 'concept',
        title: 'How the three files connect',
        content: `\`\`\`
HTTP POST /api/events/user
        │
        ▼
EventController.publishUserEvent(event)
        │
        ▼
KafkaProducerService.sendMessageAsync("user-events", event.getUserId(), event)
        │
        ├── topic   = "user-events"  → Kafka picks this topic
        ├── key     = event.userId   → Kafka hashes this to pick a partition
        └── message = event (UserEvent) → Jackson converts this to JSON bytes
        │
        ▼
KafkaTemplate sends to Kafka broker
        │
        ▼
Callback fires on success: logs partition + offset
\`\`\`

**Why async?** If Kafka is briefly slow, your HTTP request does not block. The user gets a fast response. The event is queued and sent in the background. For payments you might want synchronous confirmation — but for most events, async is the right default.`,
      },
      {
        id: 'p3-l2-task',
        type: 'task',
        title: 'Add a new event type',
        content: `Open \`examples/kafka-producer-service/\` and:

1. Add a new DTO: \`OrderEvent.java\` with fields: \`orderId\`, \`userId\`, \`totalAmount\`, \`status\`
2. Add a new endpoint in \`EventController.java\`: \`POST /api/events/order\`
3. Send to a new topic: \`order-events\` using \`orderId\` as the key

Test with curl:
\`\`\`bash
curl -X POST http://localhost:8081/api/events/order \\
  -H "Content-Type: application/json" \\
  -d '{"orderId":"ord-001","userId":"u-123","totalAmount":99.99,"status":"CREATED"}'
\`\`\`

Check the logs: you should see "Sent to partition=X, offset=Y"`,
      },
      {
        id: 'p3-l2-summary',
        type: 'summary',
        title: 'What you just learned',
        content: `A Spring Boot Kafka producer needs three pieces: a DTO (the message shape), a service (uses KafkaTemplate to send), and a controller (exposes an HTTP endpoint). KafkaTemplate.send() takes topic, key, and message — three simple arguments. Async sending is preferred for most events. Jackson automatically converts your Java objects to JSON bytes before they reach Kafka.`,
      },
    ],
  },

  {
    id: 'p3-l3',
    phase: 3,
    lesson: 3,
    title: 'Building Your First Consumer',
    subtitle: '@KafkaListener, manual acknowledgment, and consumer configuration',
    duration: '60 min',
    difficulty: 'Intermediate',
    tags: ['consumer', 'kafka-listener', 'acknowledgment', 'consumer-config'],
    checkpoints: [
      'What does @KafkaListener do and what are its required properties?',
      'Why is NOT calling acknowledgment.acknowledge() on an error the correct behavior?',
      'What is the difference between auto-commit and manual commit?',
    ],
    sections: [
      {
        id: 'p3-l3-why',
        type: 'why',
        title: 'The receiver side of your app',
        content: `The consumer is where your business logic lives. In Spring Kafka, you annotate one method with \`@KafkaListener\` and Spring does everything else: connects to Kafka, polls for messages, deserializes JSON back to Java objects, calls your method, and commits offsets. The one critical decision you control is: **when to acknowledge** (move the bookmark).`,
      },
      {
        id: 'p3-l3-code',
        type: 'code',
        title: 'The consumer service and config',
        content: `**KafkaConsumerService.java — the receiver**
\`\`\`java
@Service
public class KafkaConsumerService {

    @KafkaListener(
        topics = "user-events",           // which topic to watch
        groupId = "user-events-group",    // which team is reading
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumeUserEvent(
            @Payload UserEvent event,         // the deserialized message
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset,
            Acknowledgment acknowledgment) {  // the bookmark controller

        try {
            logger.info("Received: topic={}, partition={}, offset={}, userId={}",
                topic, partition, offset, event.getUserId());

            processUserEvent(event);          // your business logic here

            acknowledgment.acknowledge();     // SUCCESS: move bookmark forward
        } catch (Exception e) {
            logger.error("Error processing: {}", e.getMessage());
            // NOT acknowledging = message stays unread = will be retried
        }
    }

    private void processUserEvent(UserEvent event) {
        // e.g., save to database, call external service
        logger.info("Processing: userId={}, type={}", event.getUserId(), event.getEventType());
    }
}
\`\`\`

**application.yml — consumer settings explained**
\`\`\`yaml
spring:
  kafka:
    consumer:
      group-id: kafka-consumer-service-group
      enable-auto-commit: false    # MANUAL control over bookmark — SAFER
      auto-offset-reset: earliest  # If no bookmark: start from first message
    listener:
      ack-mode: manual_immediate   # Commit bookmark immediately when I call acknowledge()
      concurrency: 3               # 3 threads = 3 partitions handled in parallel
\`\`\``,
      },
      {
        id: 'p3-l3-concept',
        type: 'concept',
        title: 'The acknowledgment pattern',
        content: `**Why not auto-commit?**

Auto-commit moves the bookmark every 5 seconds regardless of whether your code succeeded.

Scenario without manual commit:
1. Consumer reads 50 messages from offset 100-150
2. Auto-commit runs at offset 125 ← bookmark moved here
3. Consumer crashes while processing message 130
4. On restart, consumer picks up from 126 (skips 100-125)
5. **Messages 100-125 are processed, never retried, never recovered**

**With manual commit:**
1. Consumer reads message 130
2. Code throws exception
3. \`acknowledge()\` is NOT called
4. Bookmark stays at 129
5. Consumer retries from 130 on next poll

This is the difference between "I'm using Kafka" and "I'm using Kafka correctly."

**The only time to acknowledge despite an error:** when you've sent the message to a dead-letter topic. Acknowledge to keep the main queue moving, and handle the failed message separately.`,
      },
      {
        id: 'p3-l3-task',
        type: 'task',
        title: 'Add partition and offset logging',
        content: `In your consumer, add detailed logging to understand what's happening:

1. Log the exact partition and offset when a message arrives
2. Log when acknowledgment is called
3. Intentionally throw a \`RuntimeException\` inside \`processUserEvent()\`
4. Watch the logs — you should see the same message attempted 3 times (retry behavior)
5. Remove the exception and process successfully — watch the acknowledgment log

Expected log pattern:
\`\`\`
INFO  Received: topic=user-events, partition=0, offset=5, userId=user-123
INFO  Processing: userId=user-123, type=LOGIN
INFO  Acknowledged offset=5 on partition=0   ← add this yourself
\`\`\``,
      },
      {
        id: 'p3-l3-summary',
        type: 'summary',
        title: 'What you just learned',
        content: `@KafkaListener is all you need to turn a method into a Kafka consumer. Spring handles polling, deserialization, threading, and error handling. The critical choice is manual acknowledgment — only move the bookmark after successful processing. An unacknowledged message is retried automatically. Manual commit is the production-correct default; auto-commit is for prototypes only.`,
      },
    ],
  },

  {
    id: 'p3-l4',
    phase: 3,
    lesson: 4,
    title: 'Running Your First Kafka App',
    subtitle: 'Start everything, send a message, watch it flow, break it on purpose',
    duration: '60 min',
    difficulty: 'Intermediate',
    tags: ['running', 'testing', 'curl', 'kafka-ui', 'debugging'],
    checkpoints: [
      'What URL do you call to send a test message?',
      'What happens if you use a topic name in the consumer that does not match the producer?',
      'How do you verify the consumer received a message in the logs?',
    ],
    sections: [
      {
        id: 'p3-l4-why',
        type: 'why',
        title: 'The moment of truth',
        content: `All the theory means nothing until you watch a message travel from your producer to your consumer in real time. This lesson is the "it works!" moment. We will also intentionally break things — because understanding failure modes is what makes you a good engineer, not just someone who copied working code.`,
      },
      {
        id: 'p3-l4-code',
        type: 'code',
        title: 'The complete run sequence',
        content: `**Terminal 1: Start Kafka**
\`\`\`bash
docker-compose up -d
# Wait ~30 seconds for Kafka to be fully ready
\`\`\`

**Terminal 2: Start the Producer Service**
\`\`\`bash
cd examples/kafka-producer-service
./mvnw spring-boot:run
# Producer starts on port 8081 (or as configured)
# Look for: "Started KafkaProducerServiceApplication"
\`\`\`

**Terminal 3: Start the Consumer Service**
\`\`\`bash
cd examples/kafka-consumer-service
./mvnw spring-boot:run
# Consumer starts, immediately begins polling "user-events"
# Look for: "Started KafkaConsumerServiceApplication"
\`\`\`

**Terminal 4: Send a test message**
\`\`\`bash
curl -X POST http://localhost:8081/api/events/user \\
  -H "Content-Type: application/json" \\
  -d '{
    "userId": "user-123",
    "eventType": "LOGIN",
    "data": {"device": "mobile", "ip": "192.168.1.1"}
  }'
# Expected response: "Event published successfully"
\`\`\`

**In Terminal 3 (consumer logs), you should see:**
\`\`\`
INFO - Received: topic=user-events, partition=0, offset=0, userId=user-123
INFO - Processing event: userId=user-123, eventType=LOGIN
\`\`\``,
      },
      {
        id: 'p3-l4-concept',
        type: 'concept',
        title: 'Break it on purpose (you will learn more)',
        content: `### Experiment 1: Wrong topic name
In \`ConsumerService.java\`, change:
\`\`\`java
topics = "user-events-WRONG"  // typo!
\`\`\`
Restart the consumer. Send a message from the producer. **Observe: the consumer receives nothing. No error.** Just silence. This is the most common beginner bug — a topic name typo causes silent failures.

Fix the name and restart. The message that was sitting in "user-events" is still there (Kafka is durable). The consumer picks it up immediately.

### Experiment 2: Consumer offline, then comes back
1. Stop the consumer (Ctrl+C in Terminal 3)
2. Send 5 messages via curl
3. Restart the consumer
4. Watch it process all 5 messages from the queue

**This proves:** Kafka holds messages until they are read. Services can go down and come back without losing events.

### Experiment 3: Use Kafka UI
Open \`http://localhost:8080\`. Click on the "user-events" topic.
- See messages in real time
- See partition assignment
- See consumer group offsets
- See consumer lag (how far behind the consumer is)`,
      },
      {
        id: 'p3-l4-task',
        type: 'task',
        title: 'Complete the three experiments',
        content: `Work through all three experiments from the previous section. For each one, answer:

**Experiment 1 (wrong topic):** Why did Kafka create the wrong-named topic automatically? What setting controls this? (Hint: look at docker-compose.yml for \`KAFKA_AUTO_CREATE_TOPICS_ENABLE\`)

**Experiment 2 (offline consumer):** How long can messages wait in Kafka before expiring? (Hint: look at \`KAFKA_LOG_RETENTION_HOURS\` in docker-compose.yml)

**Experiment 3 (Kafka UI):** Find the consumer group \`user-events-group\` in the UI. What is its current lag? What does lag = 0 mean?`,
      },
      {
        id: 'p3-l4-summary',
        type: 'summary',
        title: 'What you just learned',
        content: `You ran a full Kafka producer-consumer flow from start to finish. You sent a message via REST and watched it appear in consumer logs. You broke it with a wrong topic name and understood why silent failures happen. You proved that Kafka holds messages for offline consumers. You used Kafka UI to inspect topics, messages, and consumer lag. You are now ready for production features.`,
      },
    ],
  },

  // ── Phase 4: Production Features ────────────────────────────────────────

  {
    id: 'p4-l1',
    phase: 4,
    lesson: 1,
    title: 'Consumer Groups & Scaling',
    subtitle: 'How Kafka scales to millions of messages using team-based reading',
    duration: '60 min',
    difficulty: 'Intermediate',
    tags: ['consumer-groups', 'scaling', 'rebalancing', 'concurrency'],
    checkpoints: [
      'What is the formula for active consumers in a group?',
      'What is a rebalance and when does it happen?',
      'You deploy 6 instances of Payment Service with 3 Kafka partitions. How many are actively consuming?',
    ],
    sections: [
      {
        id: 'p4-l1-why',
        type: 'why',
        title: 'Why one consumer is never enough',
        content: `In production, your Kafka topics receive thousands of messages per second. One consumer instance cannot keep up. Kafka's answer is the consumer group — add more service instances and Kafka automatically distributes the load. This is how companies like Netflix handle millions of events per second: they just add more consumer pods.`,
      },
      {
        id: 'p4-l1-analogy',
        type: 'analogy',
        title: 'The call center team analogy revisited',
        content: `Your topic has 6 partitions. Think of these as 6 incoming phone lines.

**1 consumer (understaffed):** One person covers all 6 lines. Gets overwhelmed during peak.

**6 consumers (optimal):** One person per line. Perfect balance. Each handles their lane independently.

**10 consumers (overstaffed):** 6 people cover the 6 lines. 4 people sit idle waiting for a free line.

**Key insight:** You can only parallel-process as many streams as you have partitions. **Plan your partition count at topic creation time** — you can increase it later, but it requires careful migration.`,
      },
      {
        id: 'p4-l1-concept',
        type: 'concept',
        title: 'Consumer group mechanics',
        content: `### Partition assignment rules

\`\`\`
active consumers = min(consumers in group, number of partitions)
\`\`\`

| Partitions | Consumers | Active | Idle |
|---|---|---|---|
| 3 | 3 | 3 | 0 |
| 3 | 1 | 1 | 0 (reads all 3) |
| 3 | 5 | 3 | 2 |
| 6 | 4 | 4 | 0 (some read 2 partitions) |

### Rebalancing — the automatic redistribution

When a consumer joins or leaves a group, Kafka triggers a **rebalance**:
1. All consumers in the group stop reading briefly
2. Kafka reassigns partitions across the current consumers
3. Each consumer resumes from its last committed offset

This is automatic — you do nothing. But it means: **a brief pause in processing** during scale events.

### Spring Boot concurrency setting

In \`application.yml\`:
\`\`\`yaml
spring:
  kafka:
    listener:
      concurrency: 3  # 3 consumer threads in this single JVM instance
\`\`\`

This creates 3 consumer threads within one Spring Boot app — each thread handles one partition. For a topic with 3 partitions, this is the optimal setting for a single instance.`,
      },
      {
        id: 'p4-l1-code',
        type: 'code',
        title: 'Consumer group in code',
        content: `\`\`\`java
// All instances of this service share the same groupId
// Kafka automatically balances partitions across them
@KafkaListener(
    topics = "user-events",
    groupId = "analytics-group"   // ← same in all deployed instances
)
public void consume(ConsumerRecord<String, UserEvent> record) {
    logger.info("Partition={}, Offset={}, Thread={}",
        record.partition(),
        record.offset(),
        Thread.currentThread().getName()); // shows which thread/instance processed this

    processEvent(record.value());
}
\`\`\`

Deploy 3 instances of this service + 3 partitions → each instance handles 1 partition.
Deploy 6 instances + 3 partitions → 3 active, 3 idle (wasteful — match consumers to partitions).`,
      },
      {
        id: 'p4-l1-task',
        type: 'task',
        title: 'Observe consumer group behavior',
        content: `In your consumer \`application.yml\`, try these experiments:

\`\`\`yaml
# Experiment 1: Change concurrency to 1
listener:
  concurrency: 1
\`\`\`
Send 9 messages rapidly. Observe: all go through one thread.

\`\`\`yaml
# Experiment 2: Change back to 3
listener:
  concurrency: 3
\`\`\`
Send 9 messages. Observe: messages spread across 3 threads (check the Thread= log).

Then open Kafka UI at http://localhost:8080 → Consumer Groups → find your group → see which consumer instance handles which partition.`,
      },
      {
        id: 'p4-l1-summary',
        type: 'summary',
        title: 'What you just learned',
        content: `Consumer groups enable horizontal scaling: add more service instances and Kafka automatically redistributes partitions. Active consumers = min(consumers, partitions). Excess consumers beyond partition count sit idle — so plan partition counts ahead of time. Rebalancing is automatic but causes a brief processing pause. The concurrency setting controls threads within a single JVM instance.`,
      },
    ],
  },

  {
    id: 'p4-l2',
    phase: 4,
    lesson: 2,
    title: 'Offset Management',
    subtitle: 'Auto-commit vs manual commit — why it matters for data safety',
    duration: '60 min',
    difficulty: 'Intermediate',
    tags: ['offset', 'auto-commit', 'manual-commit', 'earliest', 'latest'],
    checkpoints: [
      'What happens to messages if the consumer crashes before manual commit?',
      'What is the difference between auto-offset-reset: earliest vs latest?',
      'Where does Kafka store consumer group offsets?',
    ],
    sections: [
      {
        id: 'p4-l2-why',
        type: 'why',
        title: 'Why offset management matters',
        content: `Offsets determine exactly what gets processed and what gets skipped. A wrong offset configuration can cause: silently lost messages (if offset committed before processing), or endlessly reprocessing the same messages (if offset never committed). This is one of the top sources of bugs in Kafka applications — and also one of the top interview topics.`,
      },
      {
        id: 'p4-l2-analogy',
        type: 'analogy',
        title: 'The bookmark analogy — deeper',
        content: `You are reading a 1000-page novel. You have two modes:

**Auto-bookmark (dangerous):** A robot moves your bookmark every 5 minutes — regardless of whether you actually read those pages. You go to the bathroom, come back, find your bookmark jumped 30 pages. You missed those pages forever.

**Manual bookmark (safe):** You move the bookmark yourself, only after you have actually read and understood the page. If you fall asleep mid-page, the bookmark stays where you left it. Tomorrow you start from where you actually finished.

In Kafka:
- **Auto-commit** = robot bookmark (may skip unprocessed messages on crash)
- **Manual commit** = your own bookmark (only moves after successful processing)`,
      },
      {
        id: 'p4-l2-concept',
        type: 'concept',
        title: 'Auto-commit vs manual commit in detail',
        content: `### Auto-commit (default — avoid in production)

\`\`\`yaml
consumer:
  enable-auto-commit: true
  auto-commit-interval: 5000   # moves bookmark every 5 seconds
\`\`\`

**The crash scenario:**
\`\`\`
t=0s: Consumer reads messages 100-150
t=3s: Auto-commit fires (committed offset: 125)
t=4s: Consumer crashes mid-processing at message 133
t=10s: Consumer restarts → reads from offset 126
Messages 100-125: processed fine
Messages 126-132: PROCESSED AGAIN (duplicate — offset 125 was committed)
Messages 133-150: LOST (after commit point, before crash)
\`\`\`

### Manual commit (production correct)

\`\`\`yaml
consumer:
  enable-auto-commit: false
listener:
  ack-mode: manual_immediate
\`\`\`

\`\`\`java
try {
    processEvent(event);          // do work FIRST
    acknowledgment.acknowledge(); // THEN move bookmark
} catch (Exception e) {
    // Don't acknowledge → message will be retried
}
\`\`\`

### Offset reset strategies

\`\`\`yaml
auto-offset-reset: earliest   # Start from message 0 (first ever message in partition)
auto-offset-reset: latest     # Start from now (only new messages after startup)
auto-offset-reset: none       # Throw exception if no offset found for this group
\`\`\`

**When does auto-offset-reset apply?** Only when the consumer group has no committed offset yet (first run, or after a group.id change).

### Where offsets are stored

Kafka stores all consumer group bookmarks in an internal topic: \`__consumer_offsets\`. Key = group-id + topic + partition. Value = offset number. You never touch this directly.`,
      },
      {
        id: 'p4-l2-task',
        type: 'task',
        title: 'Test offset reset behavior',
        content: `**Experiment 1: earliest vs latest**

Stop your consumer. Send 5 messages. Restart consumer with \`auto-offset-reset: earliest\`.
→ Consumer reads all 5 waiting messages. ✓

Stop consumer again. Send 5 more messages. Change to \`auto-offset-reset: latest\` and also change \`group-id\` (to simulate a fresh group).
→ Consumer only reads NEW messages after startup. The 5 waiting messages are skipped.

**Experiment 2: offset after crash**

1. Throw an exception in processEvent() for message userId="user-crash"
2. Send that specific message
3. Watch the retry behavior — same message retried 3 times
4. Fix the exception
5. Watch it process successfully and acknowledge

This proves: un-acknowledged messages are retried automatically.`,
      },
      {
        id: 'p4-l2-summary',
        type: 'summary',
        title: 'What you just learned',
        content: `Offsets are per-partition bookmarks stored in Kafka's internal __consumer_offsets topic. Auto-commit is dangerous for business logic — it can skip or lose messages on crash. Manual commit (enable-auto-commit: false + ack-mode: manual_immediate) ensures you only advance the bookmark after successful processing. auto-offset-reset controls what happens on a group's first run. In production: always manual commit, always earliest reset, always idempotent processing.`,
      },
    ],
  },

  {
    id: 'p4-l3',
    phase: 4,
    lesson: 3,
    title: 'Error Handling & Dead Letter Topics',
    subtitle: 'Retries, exponential backoff, and where bad messages go to rest',
    duration: '60 min',
    difficulty: 'Advanced',
    tags: ['error-handling', 'retry', 'dead-letter-topic', 'resilience'],
    checkpoints: [
      'What is a Dead Letter Topic and why is it essential in production?',
      'What is the difference between retry and dead-letter routing?',
      'After 3 retries fail, what should happen to the message?',
    ],
    sections: [
      {
        id: 'p4-l3-why',
        type: 'why',
        title: 'What happens when processing fails?',
        content: `In production, messages fail. The downstream database is down. The external API returns 500. The message has a malformed field. Without error handling, a single bad message can **block an entire partition forever** (consumer retries it endlessly, nothing else gets through). Dead Letter Topics (DLT) are the industry solution: move the bad message out of the way, let the queue flow, and handle failures separately.`,
      },
      {
        id: 'p4-l3-analogy',
        type: 'analogy',
        title: 'The undeliverable tray at the post office',
        content: `A letter arrives at the post office with an address that does not exist. The postman tries:
- Attempt 1: "No such street" → Returns to depot
- Attempt 2: Tries a nearby street → Still fails
- Attempt 3: Final attempt → Fails

Decision: the letter goes to the **Undeliverable Tray** — a special section where humans review problematic mail. The postman continues delivering the other 500 letters that are fine.

> The Dead Letter Topic (DLT) IS that undeliverable tray. Failed messages sit there. Operations teams review them. The main topic keeps flowing.`,
      },
      {
        id: 'p4-l3-code',
        type: 'code',
        title: 'Retry template and dead letter handler',
        content: `**RetryConfig.java — configure retry behavior**
\`\`\`java
@Configuration
public class RetryConfig {

    @Bean
    public RetryTemplate retryTemplate() {
        RetryTemplate retryTemplate = new RetryTemplate();

        // Wait 2 seconds between retries
        FixedBackOffPolicy backOffPolicy = new FixedBackOffPolicy();
        backOffPolicy.setBackOffPeriod(2000);
        retryTemplate.setBackOffPolicy(backOffPolicy);

        // Try 3 times total (1 original + 2 retries)
        SimpleRetryPolicy retryPolicy = new SimpleRetryPolicy();
        retryPolicy.setMaxAttempts(3);
        retryTemplate.setRetryPolicy(retryPolicy);

        return retryTemplate;
    }
}
\`\`\`

**Consumer with retry + dead letter routing**
\`\`\`java
@Service
public class RetryableConsumerService {

    private final RetryTemplate retryTemplate;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @KafkaListener(topics = "user-events", groupId = "retry-group")
    public void consumeWithRetry(@Payload UserEvent event, Acknowledgment ack) {
        try {
            retryTemplate.execute(ctx -> {
                int attempt = ctx.getRetryCount() + 1;
                logger.info("Attempt {} for userId={}", attempt, event.getUserId());
                processUserEvent(event);  // throws on failure
                return null;
            });

            ack.acknowledge(); // success path: move bookmark

        } catch (Exception e) {
            logger.error("Failed after all retries. Routing to DLT: {}", e.getMessage());
            kafkaTemplate.send("user-events-dead-letter", event.getUserId(), event);
            ack.acknowledge(); // acknowledge so main topic can move forward
        }
    }
}
\`\`\`

**KafkaErrorHandler.java — system-level error handler**
\`\`\`java
@Component
public class KafkaErrorHandler implements CommonErrorHandler {

    @Override
    public void handleRecord(Exception thrownException,
            ConsumerRecord<?, ?> record,
            Consumer<?, ?> consumer,
            MessageListenerContainer container) {

        logger.error("Unhandled error: topic={}, partition={}, offset={}",
            record.topic(), record.partition(), record.offset(), thrownException);

        kafkaTemplate.send("dead-letter-topic", record.key(), record.value());
    }
}
\`\`\``,
      },
      {
        id: 'p4-l3-concept',
        type: 'concept',
        title: 'The retry + DLT pattern',
        content: `\`\`\`
Message arrives at consumer
        │
        ▼
   Attempt 1 ──── FAILS
        │
        ▼ (wait 2s)
   Attempt 2 ──── FAILS
        │
        ▼ (wait 2s)
   Attempt 3 ──── FAILS
        │
        ▼
Send to Dead Letter Topic (user-events-dead-letter)
        │
        ├── Main topic: acknowledge() → queue moves forward
        │
        └── DLT: message waits for human or automated review

Later: ops team reviews DLT
  → Fix the issue
  → Replay message to original topic
  → Or discard after investigation
\`\`\`

**DLT naming convention:** \`{original-topic}-dlt\` or \`{original-topic}-dead-letter\`

**What to store in the DLT:** original message + error reason + timestamp + attempt count.`,
      },
      {
        id: 'p4-l3-task',
        type: 'task',
        title: 'Observe the retry → DLT flow',
        content: `In your consumer, add this to \`processUserEvent()\`:
\`\`\`java
if ("user-fail".equals(event.getUserId())) {
    throw new RuntimeException("Simulated processing failure");
}
\`\`\`

Then:
1. Send a normal message (userId: "user-ok") → should process fine
2. Send a failure message (userId: "user-fail") → should retry 3 times, then go to DLT

Watch the logs:
- "Attempt 1 for userId=user-fail"
- "Attempt 2 for userId=user-fail"
- "Attempt 3 for userId=user-fail"
- "Failed after all retries. Routing to DLT"

Open Kafka UI → find the \`user-events-dead-letter\` topic → see the failed message there.`,
      },
      {
        id: 'p4-l3-summary',
        type: 'summary',
        title: 'What you just learned',
        content: `Error handling in Kafka follows a clear pattern: retry N times with backoff, then route to the Dead Letter Topic. The DLT is an escape valve — it prevents one bad message from blocking the entire partition. After routing to DLT, you acknowledge the main topic so the queue keeps flowing. DLTs are monitored by operations teams who review failures, fix root causes, and replay messages. Every production Kafka app needs DLT infrastructure.`,
      },
    ],
  },

  {
    id: 'p4-l4',
    phase: 4,
    lesson: 4,
    title: 'Transactions & Exactly-Once Semantics',
    subtitle: 'All-or-nothing message delivery for critical business operations',
    duration: '60 min',
    difficulty: 'Advanced',
    tags: ['transactions', 'exactly-once', 'idempotence', 'kafka-transactions'],
    checkpoints: [
      'What does executeInTransaction guarantee if one message in the batch fails?',
      'When is exactly-once semantics worth the performance overhead?',
      'What configuration enables transactional producing?',
    ],
    sections: [
      {
        id: 'p4-l4-why',
        type: 'why',
        title: 'When duplicates are unacceptable',
        content: `For most events, "at-least-once + idempotent processing" is good enough. But some operations are inherently non-idempotent: charging a credit card, creating a bank transfer, decrementing inventory. For these, Kafka transactions provide atomic, exactly-once delivery — the strongest guarantee possible.`,
      },
      {
        id: 'p4-l4-analogy',
        type: 'analogy',
        title: 'The ATM withdrawal transaction',
        content: `An ATM does two things: **debit your account** and **dispense cash**. Both must happen together or neither should happen.

- If only the debit succeeds (ATM jams before dispensing) → you lose money
- If only the dispense succeeds (debit fails) → bank loses money

A transaction wraps both operations: either **both complete**, or **both roll back** as if nothing happened. Kafka transactions work the same way — you wrap multiple \`.send()\` calls into a transaction. If any one fails, **all are rolled back**.`,
      },
      {
        id: 'p4-l4-code',
        type: 'code',
        title: 'Transactional producer configuration and usage',
        content: `**TransactionalKafkaConfig.java**
\`\`\`java
@Configuration
public class TransactionalKafkaConfig {

    @Bean
    public ProducerFactory<String, Object> transactionalProducerFactory() {
        Map<String, Object> config = new HashMap<>();
        config.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        config.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        config.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);

        // These two lines enable transactions
        config.put(ProducerConfig.TRANSACTIONAL_ID_CONFIG, "tx-producer-1"); // unique per instance
        config.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);
        config.put(ProducerConfig.ACKS_CONFIG, "all");

        return new DefaultKafkaProducerFactory<>(config);
    }

    @Bean
    public KafkaTransactionManager<String, Object> kafkaTransactionManager() {
        return new KafkaTransactionManager<>(transactionalProducerFactory());
    }
}
\`\`\`

**Using transactions to send multiple events atomically**
\`\`\`java
@Service
public class TransactionalOrderService {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void placeOrder(Order order) {
        kafkaTemplate.executeInTransaction(operations -> {
            // All three sends are one atomic transaction
            operations.send("order-created", order.getId(), new OrderCreatedEvent(order));
            operations.send("inventory-reserve", order.getId(), new ReserveInventoryCommand(order));
            operations.send("payment-charge", order.getId(), new ChargePaymentCommand(order));
            return null;
            // If ANY of these sends fails → ALL three are rolled back
            // Downstream consumers never see partial data
        });
    }
}
\`\`\`

**Consumer reading with transaction isolation**
\`\`\`yaml
# Only see committed transaction messages (never partial transactions)
spring:
  kafka:
    consumer:
      isolation-level: read_committed  # default is read_uncommitted
\`\`\``,
      },
      {
        id: 'p4-l4-concept',
        type: 'concept',
        title: 'When to use (and not use) transactions',
        content: `### Use transactions when:
- Sending multiple related events that MUST all succeed together
- Combining Kafka publish with a database update (use Spring's \`@Transactional\` + \`KafkaTransactionManager\`)
- Duplicate events would cause real financial or data integrity damage

### Do NOT use transactions when:
- Sending a single event (no atomicity needed)
- Performance is critical and 10-20% overhead matters
- Events are for logging or analytics (duplicates are fine)

### The performance cost
Transactions add coordination overhead:
- Transaction coordinator election
- Two-phase commit protocol
- Isolation level enforcement on consumers
- **Roughly 10-20% slower than at-least-once**

### The idempotent producer (lighter alternative)
If you only need to prevent duplicates without grouping multiple sends:
\`\`\`yaml
producer:
  enable-idempotence: true  # no transactional-id needed
\`\`\`
The broker tracks producer ID + sequence number and deduplicates retries automatically.`,
      },
      {
        id: 'p4-l4-task',
        type: 'task',
        title: 'Simulate a transaction failure',
        content: `Wrap two sends in a transaction. Simulate a failure between them:

\`\`\`java
kafkaTemplate.executeInTransaction(ops -> {
    ops.send("order-created", orderId, event1);

    if (true) throw new RuntimeException("Simulated mid-transaction failure");

    ops.send("payment-charge", orderId, event2); // never reached
    return null;
});
\`\`\`

Verify in Kafka UI: **neither event1 nor event2 should appear** in their topics (because the transaction was rolled back).

Now add \`isolation-level: read_uncommitted\` temporarily — you might see the uncommitted event1 briefly. Switch back to \`read_committed\` — it disappears. This demonstrates the isolation guarantee.`,
      },
      {
        id: 'p4-l4-summary',
        type: 'summary',
        title: 'What you just learned',
        content: `Kafka transactions provide exactly-once, all-or-nothing delivery for groups of messages. Use executeInTransaction() to wrap multiple sends atomically. If any send fails, all are rolled back — consumers (configured with read_committed) never see partial data. The performance cost (10-20%) makes transactions appropriate for critical financial operations, not general-purpose event streaming. For duplicate prevention without grouping, idempotent producer is the lighter-weight alternative.`,
      },
    ],
  },

  // ── Phase 5: Enterprise ──────────────────────────────────────────────────

  {
    id: 'p5-l1',
    phase: 5,
    lesson: 1,
    title: 'Event-Driven Microservices',
    subtitle: 'Why services communicate through events instead of REST calls',
    duration: '75 min',
    difficulty: 'Advanced',
    tags: ['microservices', 'event-driven', 'loose-coupling', 'choreography'],
    checkpoints: [
      'What is the key difference between choreography and orchestration?',
      'If the Payment Service is down, what happens to the Order Service in an event-driven system?',
      'Name two benefits of event-driven over synchronous REST calls.',
    ],
    sections: [
      {
        id: 'p5-l1-why',
        type: 'why',
        title: 'Why microservices need events',
        content: `Microservices that call each other directly via REST are tightly coupled. Add latency at one service → cascade of slowdowns. Crash one service → other services fail too. This is the "distributed monolith" anti-pattern. Event-driven architecture solves this by making each service completely autonomous — they react to events, not to each other's APIs.`,
      },
      {
        id: 'p5-l1-analogy',
        type: 'analogy',
        title: 'The relay race vs the press conference',
        content: `**REST (synchronous):** A relay race. Runner 1 must hand the baton directly to Runner 2, who must hand it to Runner 3. If Runner 2 trips, the whole race stops. Each runner is tightly dependent on the next.

**Event-driven (asynchronous):** A press conference. The CEO announces "Q4 results are in." Journalists write articles. Investors make trades. Analysts update spreadsheets. Each does their work independently, at their own pace, when they are ready. The CEO's announcement does not wait for anyone.

> Kafka is the press conference. Services are the journalists and analysts.`,
      },
      {
        id: 'p5-l1-code',
        type: 'code',
        title: 'Three services, one topic, zero coupling',
        content: `**Order Service (Producer):**
\`\`\`java
@Service
public class OrderService {

    public Order createOrder(OrderRequest request) {
        Order order = orderRepository.save(new Order(request));

        // Publish and walk away — no idea who reads this
        kafkaTemplate.send("order-created", order.getId(),
            new OrderCreatedEvent(order.getId(), order.getUserId(), order.getTotalAmount()));

        return order;
    }
}
\`\`\`

**Payment Service (Consumer, independent):**
\`\`\`java
@Service
public class PaymentService {

    @KafkaListener(topics = "order-created", groupId = "payment-service")
    public void processPayment(@Payload OrderCreatedEvent event, Acknowledgment ack) {
        Payment payment = chargeCard(event.getUserId(), event.getTotalAmount());

        kafkaTemplate.send("payment-processed", event.getOrderId(),
            new PaymentProcessedEvent(event.getOrderId(), payment.isSuccess()));

        ack.acknowledge();
    }
}
\`\`\`

**Inventory Service (Consumer, independent — reads the same event):**
\`\`\`java
@Service
public class InventoryService {

    @KafkaListener(topics = "order-created", groupId = "inventory-service")
    public void reserveInventory(@Payload OrderCreatedEvent event, Acknowledgment ack) {
        boolean reserved = reserveItems(event.getItems());

        kafkaTemplate.send("inventory-reserved", event.getOrderId(),
            new InventoryReservedEvent(event.getOrderId(), reserved));

        ack.acknowledge();
    }
}
\`\`\`

**Key observation:** Payment and Inventory both read \`order-created\` in separate consumer groups. They are completely independent of each other. Adding a third consumer (Notifications) requires zero changes to any existing service.`,
      },
      {
        id: 'p5-l1-concept',
        type: 'concept',
        title: 'Choreography vs Orchestration',
        content: `### Choreography (Kafka approach — what we have built)
- No central coordinator
- Each service listens for events and reacts
- Services are independent actors
- Adding new behaviour = adding a new consumer

**Pros:** Loose coupling, easy to add services, fault isolation
**Cons:** Harder to trace the full flow, debugging is distributed

### Orchestration (alternative approach)
- A central "saga orchestrator" explicitly calls each service in order
- Orchestrator knows the full workflow
- Easier to trace and visualise

**Pros:** Clear workflow visibility, easier rollback logic
**Cons:** Orchestrator becomes a coupling point, single point of failure

### When to use each

| Use Choreography when... | Use Orchestration when... |
|---|---|
| Services are independent | Workflow has complex branching logic |
| Adding new consumers frequently | You need clear auditability of steps |
| Different teams own different services | Rollback logic is complex |`,
      },
      {
        id: 'p5-l1-task',
        type: 'task',
        title: 'Design an event-driven flow',
        content: `Design the event flow for a **flight booking system**. The user books a flight. Multiple things need to happen:

1. List all the events that should fire (name them: \`seat-reserved\`, \`payment-charged\`, etc.)
2. List the services that consume each event
3. What happens if the Luggage Allowance Service is down when the booking happens?
4. If the payment fails, how does the Seat Reservation Service know to release the seat?

Draw this as a flow diagram. There is no single right answer — the point is to reason about event-driven design.`,
      },
      {
        id: 'p5-l1-summary',
        type: 'summary',
        title: 'What you just learned',
        content: `Event-driven microservices communicate through Kafka topics rather than direct API calls. This creates loose coupling: services are independent, failures are isolated, and new services can be added without changing existing code. Choreography (each service reacts to events independently) is the Kafka-native pattern. Adding a new feature means adding a new consumer — no changes to existing services. This architecture is how Netflix, Uber, and Airbnb handle millions of events per minute.`,
      },
    ],
  },

  {
    id: 'p5-l2',
    phase: 5,
    lesson: 2,
    title: 'E-Commerce Order Service Deep Dive',
    subtitle: 'Trace the complete event chain through real production Java code',
    duration: '90 min',
    difficulty: 'Advanced',
    tags: ['order-service', 'event-chain', 'saga-pattern', 'real-world-code'],
    checkpoints: [
      'Name all 5 Kafka events fired during an order lifecycle.',
      'Why does createOrder() use @Transactional?',
      'What does OrderConfirmationState track and why?',
    ],
    sections: [
      {
        id: 'p5-l2-why',
        type: 'why',
        title: 'Seeing a real production system',
        content: `The enterprise-app/order-service is a complete, production-quality Spring Boot application. Every pattern we have studied in this course appears here: KafkaTemplate, @KafkaListener, @Transactional, manual acknowledgment, event-driven choreography. Walking through it end-to-end is the bridge between "I understand the concepts" and "I can build this at work."`,
      },
      {
        id: 'p5-l2-concept',
        type: 'concept',
        title: 'The full order event chain',
        content: `\`\`\`
Customer clicks "Buy Now"
        │
        ▼ HTTP POST /orders
OrderController.createOrder(request)
        │
        ▼ @Transactional
OrderService.createOrder()
  1. Save Order to PostgreSQL (status: PENDING)
  2. Publish → "order-created" topic → OrderCreatedEvent
        │
        ├──────────────────────────────────────────┐
        ▼ groupId="payment-service"                ▼ groupId="inventory-service"
  PaymentService                             InventoryService
  reads "order-created"                      reads "order-created"
  → charges card                             → reserves stock
  → publishes "payment-processed"            → publishes "inventory-reserved"
        │                                          │
        └──────────────┬───────────────────────────┘
                       ▼ both consumed by OrderEventConsumer
              OrderEventConsumer (in order-service!)
              reads "payment-processed"  → sets paymentOK=true
              reads "inventory-reserved" → sets inventoryOK=true
              When BOTH flags true → publishes "order-confirmed"
                                  OR
              If payment fails    → publishes "order-cancelled"
                       │
                       ▼ groupId="notification-service"
              NotificationService
              reads "order-confirmed"
              → sends email to customer
\`\`\`

**5 Kafka events total:**
1. \`order-created\` — OrderService publishes
2. \`payment-processed\` — PaymentService publishes
3. \`inventory-reserved\` — InventoryService publishes
4. \`order-confirmed\` — OrderService publishes (after both 2+3 received)
5. \`order-cancelled\` — OrderService publishes (if payment fails)`,
      },
      {
        id: 'p5-l2-code',
        type: 'code',
        title: 'Key code: createOrder and the confirmation state machine',
        content: `**OrderService.createOrder() — the starting gun**
\`\`\`java
@Transactional  // ← database write + kafka publish are ONE unit of work
public OrderResponse createOrder(CreateOrderRequest request) {

    // 1. Calculate total
    BigDecimal totalAmount = request.getItems().stream()
        .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
        .reduce(BigDecimal.ZERO, BigDecimal::add);

    // 2. Save to database
    Order order = new Order(request.getUserId(), orderItems, totalAmount, shippingAddress);
    order = orderRepository.save(order);

    // 3. Publish the starting event
    OrderCreatedEvent event = new OrderCreatedEvent(
        order.getId(), order.getUserId(),
        request.getItems(), totalAmount, request.getShippingAddress()
    );

    kafkaTemplate.send("order-created", order.getId(), event);
    // ↑ order.getId() as key = all events for this order go to same partition

    return toResponse(order);
}
\`\`\`

**OrderService — waiting for both payment AND inventory**
\`\`\`java
// In-memory state tracker: orderId → {paymentOK, inventoryOK}
private final Map<String, OrderConfirmationState> orderStates = new ConcurrentHashMap<>();

@Transactional
public void handlePaymentProcessed(String orderId, boolean success) {
    Order order = orderRepository.findById(orderId).orElseThrow();
    OrderConfirmationState state = orderStates.computeIfAbsent(orderId,
        k -> new OrderConfirmationState());

    if (success) {
        state.setPaymentProcessed(true);
        checkAndConfirmOrder(order, state); // confirms only if BOTH flags true
    } else {
        cancelOrder(order, "Payment failed");  // publishes order-cancelled
        orderStates.remove(orderId);
    }
}

// Same pattern for handleInventoryReserved()
// checkAndConfirmOrder() only publishes "order-confirmed" when:
//   state.isPaymentProcessed() && state.isInventoryReserved() == true
\`\`\``,
      },
      {
        id: 'p5-l2-task',
        type: 'task',
        title: 'Trace the code and answer these questions',
        content: `Open \`enterprise-app/order-service/src/\` and trace through the code:

1. Find \`OrderEventConsumer.java\` — which two topics does it subscribe to? What groupId does it use?
2. Find all 5 event classes in the \`event/\` package — what fields does each carry?
3. In \`OrderService.java\`, find \`checkAndConfirmOrder()\` — what condition triggers the order confirmation?
4. What happens to \`orderStates\` in memory if the Order Service crashes mid-flight (after payment confirmed but before inventory confirmed)?
5. In production, what would you use instead of the in-memory \`ConcurrentHashMap\` for \`orderStates\`? (Hint: think about what data store survives service restarts)`,
      },
      {
        id: 'p5-l2-summary',
        type: 'summary',
        title: 'What you just learned',
        content: `The order service implements a choreographed saga: OrderCreated fires the chain, Payment and Inventory act independently, the Order Service waits for both confirmations before firing OrderConfirmed. The @Transactional annotation ensures the database save and Kafka publish happen atomically. The order key (orderId) ensures all events for one order land in the same partition and maintain ordering. The in-memory state tracker is a simplification — production systems use Redis or database to track saga state across service restarts.`,
      },
    ],
  },

  {
    id: 'p5-l3',
    phase: 5,
    lesson: 3,
    title: 'Enterprise Patterns',
    subtitle: 'Saga, Outbox, and Circuit Breaker — the patterns senior engineers talk about',
    duration: '75 min',
    difficulty: 'Expert',
    tags: ['saga-pattern', 'outbox-pattern', 'circuit-breaker', 'distributed-transactions'],
    checkpoints: [
      'What problem does the Outbox Pattern solve?',
      'In a Saga, what is a "compensating event"?',
      'When should a Circuit Breaker open and what happens while it is open?',
    ],
    sections: [
      {
        id: 'p5-l3-why',
        type: 'why',
        title: 'Why patterns exist',
        content: `These patterns solve recurring, hard problems that every team faces when building distributed systems. You will encounter them in architecture discussions, design reviews, and interviews. Knowing the name, purpose, and trade-offs of each pattern is what distinguishes a senior engineer from a mid-level one.`,
      },
      {
        id: 'p5-l3-concept',
        type: 'concept',
        title: 'Pattern 1: The Saga Pattern',
        content: `**The Problem:** How do you manage a multi-step business transaction that spans multiple services (and databases) without a global database lock?

**The Solution:** Break the transaction into a sequence of local transactions. Each service does its step and publishes an event. If any step fails, **compensating events** undo previous steps.

**In our order system:**
\`\`\`
Step 1: OrderService  → creates order (PENDING) → publishes OrderCreated
Step 2: InventoryService → reserves stock       → publishes InventoryReserved
Step 3: PaymentService → charges card           → publishes PaymentProcessed

❌ If PaymentService FAILS:
Compensating Step: InventoryService reads OrderCancelled → releases reserved stock
Compensating Step: OrderService updates status to CANCELLED
\`\`\`

**Choreography Saga** (what we built): services react to events independently.
**Orchestration Saga**: a central SagaOrchestrator explicitly calls each service in sequence.

**The key insight:** You cannot use \`@Transactional\` across microservices. Sagas are the distributed transaction replacement.`,
      },
      {
        id: 'p5-l3-concept',
        type: 'concept',
        title: 'Pattern 2: The Outbox Pattern',
        content: `**The Problem:** Your service saves to the database AND publishes to Kafka. What if it crashes between the two?

\`\`\`
orderRepository.save(order);   ← succeeds ✓
// CRASH HERE
kafkaTemplate.send(...);       ← never happens ✗
// OrderCreated event is LOST forever
\`\`\`

**The Solution:** Write the Kafka event to a database "outbox" table **in the same database transaction** as the business data. A separate process (the "message relay") reads the outbox and publishes to Kafka.

\`\`\`
@Transactional
public void createOrder(Order order) {
    orderRepository.save(order);            // business table
    outboxRepository.save(new OutboxMessage( // outbox table — same transaction
        "order-created", order.getId(), orderEvent
    ));
    // If crash here: both writes roll back. Neither order nor event is saved.
    // When service restarts: nothing happened.
    // The relay picks up and publishes from outbox.
}
\`\`\`

**Guarantee:** If the order is in the database, the event WILL eventually reach Kafka. Atomicity ensured.`,
      },
      {
        id: 'p5-l3-concept',
        type: 'concept',
        title: 'Pattern 3: Circuit Breaker',
        content: `**The Problem:** Your consumer calls an external API (e.g., payment gateway). The API is down. Your consumer retries → 500 threads stuck waiting → your service starves → cascading failure.

**The Solution:** The Circuit Breaker monitors failure rates. When failures exceed a threshold, it **opens** the circuit — all calls immediately fail fast without actually calling the slow API.

\`\`\`
CLOSED (normal): calls go through, success rate tracked
        │
        ├── failure rate > 50% for 60s → OPEN (fail fast for 30s)
        │                                      │
        └──────────────── 30s timeout → HALF-OPEN (try one call)
                                               │
                          success → CLOSED    failure → OPEN again
\`\`\`

In Spring Boot with Resilience4j (used in the order-service pom.xml):
\`\`\`java
@CircuitBreaker(name = "payment-gateway", fallbackMethod = "paymentFallback")
public PaymentResult chargeCard(String userId, BigDecimal amount) {
    return paymentGatewayClient.charge(userId, amount); // external API call
}

public PaymentResult paymentFallback(String userId, BigDecimal amount, Exception e) {
    // Queue for retry or return "pending" status
    return PaymentResult.pending("Payment gateway unavailable, will retry");
}
\`\`\``,
      },
      {
        id: 'p5-l3-task',
        type: 'task',
        title: 'Pattern identification exercise',
        content: `For each scenario, identify which pattern to apply and explain why:

1. Your Order Service saves orders to PostgreSQL AND publishes OrderCreated to Kafka. You need to guarantee no lost events even during crashes.

2. Your flight booking spans: seat reservation, payment, loyalty points update, notification. Payment succeeds but loyalty points service is down.

3. Your notification service calls SendGrid API which starts returning 503 errors. Within 2 minutes, all your consumer threads are stuck waiting for SendGrid timeouts.

4. You need to update 3 different microservices' databases as part of one "Transfer Funds" operation.

**Answers:** Each scenario has exactly one pattern that fits best. Can you name them without looking back?`,
      },
      {
        id: 'p5-l3-summary',
        type: 'summary',
        title: 'What you just learned',
        content: `Three essential enterprise patterns: Saga replaces distributed transactions with event-driven compensations. Outbox Pattern ensures database writes and Kafka publishes are atomic. Circuit Breaker prevents cascading failures when downstream services are slow or down. These patterns appear in almost every senior-level system design interview and every production microservices architecture. Knowing when to apply each one — and the trade-offs — is the difference between a good engineer and a great one.`,
      },
    ],
  },

  {
    id: 'p5-l4',
    phase: 5,
    lesson: 4,
    title: 'Interview Preparation',
    subtitle: 'Top 10 Kafka interview Q&A answered the way a confident fresher should answer',
    duration: '75 min',
    difficulty: 'Expert',
    tags: ['interview', 'qa', 'kafka-interview', 'fresher-interview'],
    checkpoints: [
      'Answer Q1 out loud without looking at the answer.',
      'Answer Q5 out loud without looking at the answer.',
      'Answer Q9 out loud without looking at the answer.',
    ],
    sections: [
      {
        id: 'p5-l4-why',
        type: 'why',
        title: 'How to answer Kafka interview questions as a fresher',
        content: `Freshers make two mistakes in interviews: (1) they try to memorize technical definitions and sound robotic, (2) they panic when they do not know the full advanced answer. The correct approach: answer in plain English with an analogy, then show the technical detail. Always mention a concrete example. End with "I've implemented this in the kafka-producer-service where..." This shows you have hands-on experience.`,
      },
      {
        id: 'p5-l4-concept',
        type: 'concept',
        title: 'Q1: What is Apache Kafka and when would you use it?',
        content: `**The confident fresher answer:**

*"Kafka is a distributed messaging system — think of it as a shared notice board. One service posts an event and any number of other services read it independently. I would use it instead of REST when: (1) the sender should not wait for receivers, (2) I need to decouple services so adding a new receiver doesn't require changing the sender, (3) I need high throughput — Kafka handles millions of events per second. In the order service I worked on, the Order Service published an OrderCreated event to Kafka, and Payment, Inventory, and Notification services each consumed it independently — no direct API calls between services."*

**Why this works:** Analogy → use case → concrete example. Three-part structure.`,
      },
      {
        id: 'p5-l4-concept',
        type: 'concept',
        title: 'Q2–Q5: Core Architecture Questions',
        content: `**Q2: What is the difference between a topic and a partition?**

*"A topic is a named category — like a folder for a type of event. 'order-created', 'payment-processed'. A partition is a physical slice of that topic — like lanes on a motorway. More partitions = more parallel consumers. Order within a partition is guaranteed; order across partitions is not. That's why we use a message key when order matters — all events with the same key land in the same partition."*

---

**Q3: What is a consumer group?**

*"A team of consumers sharing the work. Each partition is assigned to exactly one consumer in the group. Add more consumers (up to partition count) and Kafka rebalances automatically — instant horizontal scaling. Two different services each need their own consumer group so they read independently without affecting each other's offsets."*

---

**Q4: What is an offset?**

*"A unique sequential number for each message within a partition — like a bookmark in a book. When my consumer reads and processes message at offset 47, it commits that offset. If it crashes and restarts, it resumes from offset 47 — no messages skipped or re-read. In the consumer I built, I use manual commit so the bookmark only moves after successful processing."*

---

**Q5: At-least-once vs exactly-once — what's the difference?**

*"At-least-once means the message is guaranteed to arrive but might arrive more than once if there's a retry. I handle this by making my processing idempotent — checking if I've already processed this order ID before processing it again. Exactly-once means no duplicates, no loss — achieved with Kafka transactions. I use exactly-once for payment events where charging a card twice would be a real problem."*`,
      },
      {
        id: 'p5-l4-concept',
        type: 'concept',
        title: 'Q6–Q10: Advanced Questions',
        content: `**Q6: What happens if a consumer crashes before committing the offset?**

*"The message will be re-delivered when the consumer restarts because Kafka sees the offset was never committed. This is the at-least-once behaviour. To handle it safely, I make processing idempotent — for example, checking if an order has already been processed before processing it again."*

---

**Q7: What is a Dead Letter Topic?**

*"A special Kafka topic where messages go after they've failed all retry attempts. Instead of blocking the main topic forever on a bad message, I route it to the DLT, acknowledge the main topic so the queue keeps flowing, and have operations review the DLT failures separately. Every production system I build includes DLT infrastructure."*

---

**Q8: How does Kafka achieve high availability?**

*"Through replication. Every partition has one leader and followers on other brokers. If the leader's server crashes, Kafka automatically elects a new leader from the in-sync replicas — happens in under a second with no data loss. We configure replication factor 3 in production: one for normal operation, two for safety. The acks=all producer setting ensures the message is on all replicas before confirming success."*

---

**Q9: In Spring Boot, how do you send a message to Kafka?**

*"You inject KafkaTemplate and call .send(topicName, key, message). Spring handles serialisation to JSON, the broker connection, and retries. I configured this in application.yml with bootstrap-servers, key-serializer, and value-serializer. In my order service, kafkaTemplate.send('order-created', order.getId(), event) sends the OrderCreated event with the order ID as key — ensuring all events for one order land in the same partition."*

---

**Q10: How would you monitor a Kafka consumer in production?**

*"The most important metric is consumer lag — the gap between the latest offset in a partition and the consumer's current position. High lag means the consumer is falling behind. I expose this via Spring Boot Actuator and Micrometer to a Prometheus/Grafana dashboard. I also monitor the Dead Letter Topic — messages piling up there indicate a systematic processing problem. Spring Boot's health endpoint includes Kafka connectivity status automatically."*`,
      },
      {
        id: 'p5-l4-task',
        type: 'task',
        title: 'Mock interview practice',
        content: `This is the most important task in the entire course. Do it seriously.

**Round 1 (self-interview):**
Cover all 10 answers. For each question, speak your answer OUT LOUD before looking at the written answer. If you stumble, mark it. Review the weak ones.

**Round 2 (teach it):**
Explain Kafka to a friend or family member who knows nothing about software. Use only the analogies from this course. If they say "I get it" — you truly understand it.

**Round 3 (code challenge):**
From memory, write:
1. A \`KafkaProducerService\` with a \`sendAsync\` method
2. A \`KafkaConsumerService\` with \`@KafkaListener\` and manual acknowledgment
3. The \`application.yml\` producer and consumer sections

No looking at the code. Just from memory. Then compare with the examples in the course.

**If you can do Round 3 from memory — you are interview ready.**`,
      },
      {
        id: 'p5-l4-summary',
        type: 'summary',
        title: 'What you just learned — and what this whole course built',
        content: `You can now explain Kafka to any interviewer: what it is (notice board), why it exists (decoupling), how it works (topics, partitions, producers, consumers, groups, offsets), how to code it (KafkaTemplate, @KafkaListener, manual ack), and how it is used in real systems (saga pattern, event-driven choreography, DLTs). You traced a complete e-commerce order through real Java code. You know three enterprise patterns. And you have 10 interview answers you can deliver confidently.

The journey: Theory → Architecture → Code → Production → Enterprise → Interview.

You are ready.`,
      },
    ],
  },

  // ── Phase 4: Producer & Consumer Config Reference ────────────────────────

  {
    id: 'p4-l5',
    phase: 4,
    lesson: 5,
    title: 'Producer Configuration — Complete Reference',
    subtitle: 'Every property explained: what it does, what changes when you tweak it, and when to use it',
    duration: '90 min',
    difficulty: 'Advanced',
    tags: ['producer', 'configuration', 'acks', 'batching', 'compression', 'idempotence', 'performance'],
    checkpoints: [
      'What is the difference between acks=1 and acks=all, and which one risks data loss?',
      'Your producer is slow — which two properties do you tune together to increase throughput?',
      'Why can setting max.in.flight.requests.per.connection > 1 without idempotence cause out-of-order messages?',
    ],
    sections: [
      {
        id: 'p4-l5-why',
        type: 'why',
        title: 'Why producer configuration matters',
        content: `Default Kafka producer settings are safe but conservative. In production, tuning producer configuration is the difference between a system that handles 10,000 messages/second and one that handles 1,000,000 messages/second — without touching a single line of business logic.

Equally important: the wrong settings can silently lose data or cause message reordering. This lesson gives you the exact mental model for every significant producer property: **what it controls, what the default is, and what happens in your running Spring Boot app when you change it.**`,
      },
      {
        id: 'p4-l5-analogy',
        type: 'analogy',
        title: 'Think of the producer as a courier dispatch office',
        content: `**acks** = How many post offices must stamp "received" before the courier reports success to you.

**retries** = How many times the courier tries again if the road is blocked before giving up.

**linger.ms** = How long the courier waits at your door collecting more parcels before driving to the post office. Waiting longer fills the van — fewer trips, higher efficiency.

**batch.size** = The maximum van size. When the van is full it leaves immediately regardless of linger.ms.

**compression.type** = Vacuum-packing parcels before loading. Takes a moment at your door but far more fits in the van.

**buffer.memory** = The total warehouse space at your dispatch office. If the warehouse fills up (backpressure), new parcels cannot be accepted until space frees.

**enable.idempotence** = Each parcel has a unique serial number. The post office refuses to stamp the same serial number twice — preventing duplicates even if the courier tries to deliver it twice.`,
      },
      {
        id: 'p4-l5-concept',
        type: 'concept',
        title: 'acks — The acknowledgment setting',
        content: `### What it controls
How many broker replicas must confirm receipt before the producer considers the message "sent."

### Values and their meaning

| Value | Meaning | Loss risk | Speed |
|---|---|---|---|
| \`acks=0\` | Producer doesn't wait at all | High — broker crash = lost | Fastest |
| \`acks=1\` | Only the partition leader confirms | Medium — leader crash before replication = lost | Fast |
| \`acks=all\` or \`acks=-1\` | ALL in-sync replicas confirm | None (with min.insync.replicas=2) | Slowest |

### What changes in your app

**acks=0 (fire and forget)**
Your \`.send()\` returns before the message even reaches the broker's network buffer. Zero wait. Zero guarantee. If the broker crashes at that exact millisecond, the message is gone forever with no error in your logs.

**acks=1 (leader only)**
The partition leader writes to disk and replies "done." Your producer is unblocked. BUT: if that leader crashes in the next 50ms before it has replicated to followers, the new elected leader does not have your message. It is silently lost. This was the default before Kafka 3.0.

**acks=all (all in-sync replicas)**
Every in-sync replica must confirm. Combined with \`min.insync.replicas=2\`, this means at least 2 brokers have written your message before your producer returns success. If the leader dies now, a follower already has the message and becomes the new leader. No data loss.

### Spring Boot configuration
\`\`\`yaml
spring:
  kafka:
    producer:
      acks: all   # "all" or "-1" — use this for production
\`\`\``,
      },
      {
        id: 'p4-l5-concept-retries',
        type: 'concept',
        title: 'retries, retry.backoff.ms, delivery.timeout.ms',
        content: `### retries — How many times to retry on transient failure

| Setting | Behaviour |
|---|---|
| \`retries=0\` | At-most-once. Any transient error = message lost. |
| \`retries=3\` | Try 3 more times. Handles brief network blips. |
| \`retries=2147483647\` | Retry until delivery.timeout.ms expires. Default since Kafka 2.6. |

**What changes in your app with retries=0:** A single 10ms network hiccup between your app and Kafka drops the message silently. You only notice it later in your business metrics.

**What changes with high retries:** Your producer keeps trying during outages. But without \`enable.idempotence=true\`, the broker may receive the same message twice (once from the original attempt and once from the retry). Your consumer must handle duplicates.

---

### retry.backoff.ms — Wait time between retry attempts
- **Default:** 100ms
- **Effect:** After a failed attempt, the producer waits this long before trying again.
- **Increase to:** Reduce pressure on a struggling broker. 500-1000ms gives a temporarily overloaded broker time to recover.
- **Risk:** Higher backoff = longer end-to-end latency before the message is confirmed.

\`\`\`yaml
spring:
  kafka:
    producer:
      properties:
        retry.backoff.ms: 500
        retry.backoff.max.ms: 5000  # Cap backoff with exponential growth
\`\`\`

---

### delivery.timeout.ms — The total time budget for one message
- **Default:** 120,000ms (2 minutes)
- **What it means:** From the moment \`.send()\` is called, the producer has this long to successfully deliver the message — including all retries and backoff waits.
- **If exceeded:** The message is dropped and your \`send()\` Future/callback receives a \`TimeoutException\`.
- **Must be greater than:** \`request.timeout.ms + linger.ms\`

**What changes in your app:** If your Kafka cluster goes down for 3 minutes and \`delivery.timeout.ms=120000\` (2 min), your producer gives up at 2 minutes and the message is lost. Increase this if you need "survive longer outages with retries" behaviour. Decrease it if you need fast failure detection.`,
      },
      {
        id: 'p4-l5-concept-batching',
        type: 'concept',
        title: 'linger.ms and batch.size — The throughput levers',
        content: `These two properties together determine how efficiently your producer groups messages before sending. They are the most impactful settings for throughput tuning.

---

### linger.ms — How long to wait before sending a batch
- **Default:** 0 (send immediately — no batching)
- **Unit:** Milliseconds

**linger.ms=0 (default):** Every \`.send()\` triggers an immediate network request to the broker. At 10,000 messages/second, that is 10,000 separate network round trips per second. Inefficient.

**linger.ms=10:** The producer waits up to 10ms to collect more messages before sending. In that 10ms window, 100 messages arrive → sent as one batch → one network round trip. 100x fewer requests. Throughput increases dramatically.

**linger.ms=100:** Even more messages per batch, even higher throughput. But every message now waits up to 100ms before it is sent. Adds latency. Use for bulk batch processing where latency doesn't matter.

| linger.ms | Throughput | Latency | Use case |
|---|---|---|---|
| 0 | Low | Minimal | Real-time, latency-sensitive |
| 5–20 | High | +5-20ms | Most production systems |
| 50–100 | Very high | +50-100ms | Bulk ingestion, analytics |

---

### batch.size — Maximum bytes per batch per partition
- **Default:** 16,384 bytes (16 KB)
- **What it means:** The producer collects messages for the same partition into a batch up to this size. When the batch is full, it sends immediately — regardless of linger.ms.

**batch.size=16384 (default):** Batches cap at 16KB. With large messages (10KB each), your batches contain 1-2 messages. Not much batching benefit.

**batch.size=65536 (64KB):** 4x more messages per batch. Fewer network calls. More efficient. The sweet spot for most high-throughput systems.

**batch.size=1048576 (1MB):** Very large batches. Maximum throughput but uses more memory and sends less frequently. Pair with linger.ms=50-100ms to fill the batch before sending.

\`\`\`yaml
spring:
  kafka:
    producer:
      properties:
        linger.ms: 20          # Wait 20ms to batch messages
        batch.size: 65536      # Max 64KB per batch
\`\`\``,
      },
      {
        id: 'p4-l5-concept-compression',
        type: 'concept',
        title: 'compression.type — Reduce network and storage costs',
        content: `### What it controls
How messages are compressed before being sent to the broker.

| Value | Ratio | CPU cost | Best for |
|---|---|---|---|
| \`none\` (default) | 1:1 | Zero | Low volume, already compressed data |
| \`gzip\` | 5:1 – 10:1 | High | Maximum compression ratio, batch processing |
| \`snappy\` | 2:1 – 4:1 | Low | Balanced — Google's recommendation for Kafka |
| \`lz4\` | 2:1 – 4:1 | Very low | Fastest compression/decompression speed |
| \`zstd\` | 4:1 – 8:1 | Medium | Best ratio-to-speed trade-off (Kafka 2.1+) |

### What changes in your app

**compression.type=none (default):**
Your 1KB JSON message is sent as 1KB. At 100,000 messages/second, you are pushing 100MB/s over the network. No producer CPU overhead.

**compression.type=snappy:**
Your 1KB JSON message compresses to ~300 bytes (JSON compresses very well — text is repetitive). You push 30MB/s instead of 100MB/s. Network cost drops 70%. Minimal CPU overhead. The consumer automatically decompresses — you do not change any consumer code.

**compression.type=gzip:**
Best compression ratio. Your 1KB JSON might become 150 bytes. But gzip uses significant CPU on both producer and consumer. Useful when network bandwidth is the bottleneck (cross-region replication, limited bandwidth).

### Spring Boot configuration
\`\`\`yaml
spring:
  kafka:
    producer:
      compression-type: snappy   # or zstd for newer clusters
\`\`\`

> **Pro tip:** Compression works best with batching. Large batches compress better than individual small messages. Set \`linger.ms=10\` and \`compression.type=snappy\` together.`,
      },
      {
        id: 'p4-l5-concept-memory',
        type: 'concept',
        title: 'buffer.memory, max.block.ms — Handling backpressure',
        content: `### buffer.memory — The producer's send buffer
- **Default:** 33,554,432 bytes (32 MB)
- **What it is:** A memory pool where the producer holds messages waiting to be sent. If Kafka is slower than your app is producing, messages queue here.

**What happens when the buffer fills up:**
Your \`.send()\` call blocks for up to \`max.block.ms\`. If the buffer is still full after that timeout, a \`BufferExhaustedException\` is thrown.

**Increase buffer.memory when:** You have high-burst traffic (flash sales, batch jobs) and want to absorb spikes without throwing exceptions.

**Decrease buffer.memory when:** You are running many producer instances and memory is constrained. A lower limit causes faster backpressure signalling.

---

### max.block.ms — How long send() waits when buffer is full
- **Default:** 60,000ms (60 seconds)
- **What it means:** If the producer's buffer is full, \`.send()\` waits this long for space to free up. If Kafka is still overwhelmed after 60 seconds, an exception is thrown to the caller.

**max.block.ms=60000 (default):**
Your calling thread is blocked for up to 60 seconds. This might cause your REST API endpoint to time out before Kafka recovers. Your users see a slow response.

**max.block.ms=5000:**
You fail fast after 5 seconds. Your REST endpoint can return a 503 "system busy" response to the user instead of hanging. More user-friendly under load.

\`\`\`yaml
spring:
  kafka:
    producer:
      properties:
        buffer.memory: 67108864    # 64MB — larger buffer for burst traffic
        max.block.ms: 10000        # Fail after 10s, don't hang indefinitely
\`\`\``,
      },
      {
        id: 'p4-l5-concept-inflight',
        type: 'concept',
        title: 'max.in.flight.requests.per.connection — Ordering vs throughput',
        content: `### What it controls
How many unacknowledged requests the producer can have outstanding to a single broker at the same time.

- **Default:** 5
- **Range:** 1 to 5 (must be ≤ 5 if \`enable.idempotence=true\`)

### The ordering problem

**max.in.flight.requests.per.connection=5 WITHOUT idempotence:**
The producer sends batch 1 and batch 2 simultaneously. Batch 1 fails. Batch 2 succeeds. The producer retries batch 1 — it now arrives AFTER batch 2. **Messages are out of order.** If your consumer expects order (event sourcing, sequential transactions), this is a bug.

**max.in.flight.requests.per.connection=1:**
Strict ordering guaranteed. The producer waits for batch 1 to be acknowledged before sending batch 2. Safe but slower — no parallelism.

**max.in.flight.requests.per.connection=5 WITH enable.idempotence=true:**
Kafka assigns sequence numbers to each batch. The broker rejects out-of-sequence arrivals. You get both parallelism AND ordering safety. This is the correct production configuration.

### Decision table

| Goal | Setting |
|---|---|
| Strict ordering + low throughput | \`max.in.flight=1\`, \`enable.idempotence=false\` |
| Strict ordering + high throughput | \`max.in.flight=5\`, \`enable.idempotence=true\` |
| Maximum throughput, no ordering requirement | \`max.in.flight=5\`, \`enable.idempotence=false\` |

\`\`\`yaml
spring:
  kafka:
    producer:
      enable-idempotence: true
      properties:
        max.in.flight.requests.per.connection: 5  # safe with idempotence
\`\`\``,
      },
      {
        id: 'p4-l5-concept-idempotence',
        type: 'concept',
        title: 'enable.idempotence and transactional.id — Duplicate prevention',
        content: `### enable.idempotence — Safe retries without duplicates
- **Default:** \`true\` since Kafka 3.0 (previously \`false\`)
- **What it does:** The producer gets a unique **Producer ID (PID)** from the broker. Each message gets a **sequence number**. The broker tracks the highest sequence number received per producer per partition. If the same PID + sequence number arrives twice (retry scenario), the broker silently discards the duplicate.

**Without idempotence:** Producer retries due to network timeout → broker received both → consumer gets message twice → double charge, duplicate order, inventory error.

**With idempotence:** Retry arrives → broker checks sequence number → already seen → discarded → consumer gets exactly one copy.

**Automatically enforces:**
- \`acks=all\` (required — weaker acks break the guarantee)
- \`max.in.flight.requests.per.connection ≤ 5\`
- \`retries > 0\`

---

### transactional.id — Atomic multi-message transactions
- **Default:** Not set
- **Required for:** Exactly-once semantics across multiple topics/partitions

**What it enables:**
\`\`\`java
kafkaTemplate.executeInTransaction(t -> {
    t.send("payments", paymentEvent);      // atomic
    t.send("audit-log", auditEvent);       // atomic
    t.send("notifications", notifEvent);   // atomic
    // All three commit together, or all three roll back together
    return true;
});
\`\`\`

**transactional.id must be:**
- Unique per producer instance in your cluster
- Stable across restarts (use a fixed string like \`order-producer-1\`, not a UUID)
- Different for each service/microservice

**If you set the same transactional.id on two producers simultaneously:** The broker fences the older one — it can no longer produce. This is intentional: prevents zombie producers from a previous deployment still sending stale transactions.

\`\`\`yaml
spring:
  kafka:
    producer:
      transaction-id-prefix: order-svc-   # Spring adds instance number → "order-svc-0"
      enable-idempotence: true
      acks: all
\`\`\``,
      },
      {
        id: 'p4-l5-code',
        type: 'code',
        title: 'Complete producer application.yml reference',
        content: `\`\`\`yaml
spring:
  kafka:
    bootstrap-servers: broker1:9092,broker2:9092,broker3:9092

    producer:
      # ── Serialization ──────────────────────────────────────
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer

      # ── Reliability ────────────────────────────────────────
      acks: all                    # Wait for ALL in-sync replicas (safest)
      retries: 2147483647          # Retry until delivery.timeout.ms expires
      enable-idempotence: true     # Deduplicate retries at broker level

      # ── Performance: batching ──────────────────────────────
      compression-type: snappy     # Compress before sending (2-4x reduction)

      # ── Spring-level transaction support ───────────────────
      transaction-id-prefix: payment-producer-  # Enables exactly-once

      # ── Raw Kafka properties (not Spring shortcuts) ─────────
      properties:
        # Ordering & safety
        max.in.flight.requests.per.connection: 5      # Safe with idempotence

        # Batching (THROUGHPUT LEVERS)
        linger.ms: 20              # Wait 20ms to collect more messages per batch
        batch.size: 65536          # Max 64KB per batch before sending immediately

        # Memory & backpressure
        buffer.memory: 67108864   # 64MB send buffer
        max.block.ms: 10000       # Fail fast after 10s if buffer is full

        # Timeout tuning
        request.timeout.ms: 30000    # 30s per attempt
        retry.backoff.ms: 500        # Wait 500ms between retries
        delivery.timeout.ms: 300000  # 5 min total budget per message

        # Observability
        client.id: order-service-producer   # Shows in broker logs & JMX metrics
\`\`\`

### What to change for different scenarios

\`\`\`yaml
# Scenario: Low-latency real-time events (payment confirmations)
linger.ms: 0
batch.size: 16384
acks: all
enable-idempotence: true

# Scenario: High-throughput batch ingestion (analytics events)
linger.ms: 100
batch.size: 1048576    # 1MB
compression-type: gzip
acks: 1               # Slightly less safe, much faster

# Scenario: Metrics/logs (loss is acceptable, speed matters)
acks: "0"
retries: 0
linger.ms: 50
compression-type: lz4
\`\`\``,
      },
      {
        id: 'p4-l5-task',
        type: 'task',
        title: 'Configuration tuning challenge',
        content: `For each scenario, write the producer \`application.yml\` snippet with the correct settings and explain your choices:

**Scenario 1:** You are building a click-tracking system that records every button click on a website. Expected volume: 500,000 events/minute. Losing 0.01% of events is acceptable. Latency must be under 100ms from click to Kafka.

**Scenario 2:** A payment service sends "ChargeCard" events to Kafka. Charging a card twice is a critical bug. Volume: 100 events/minute. Latency doesn't matter as long as it's under 30 seconds.

**Scenario 3:** An IoT sensor platform sends temperature readings every second from 10,000 sensors. Messages are small (200 bytes each). The network between sensors and Kafka is unreliable (drops 5% of packets). Duplicate readings are harmless.

*For each scenario: write acks, retries, enable-idempotence, linger.ms, and batch.size. Justify each choice.*`,
      },
      {
        id: 'p4-l5-summary',
        type: 'summary',
        title: 'What you just learned',
        content: `Producer configuration is a set of deliberate trade-offs between speed and safety. \`acks=all\` + \`enable.idempotence=true\` gives you maximum safety at the cost of a small latency penalty — the right default for production business events. \`linger.ms\` and \`batch.size\` are the throughput dials: increase them together to dramatically improve messages-per-second at the cost of slightly more latency. Compression is almost always worth enabling for JSON payloads. And \`delivery.timeout.ms\` is the master budget that governs how long the producer fights to deliver each message before giving up.`,
      },
    ],
  },

  {
    id: 'p4-l6',
    phase: 4,
    lesson: 6,
    title: 'Consumer Configuration — Complete Reference',
    subtitle: 'Every property explained: offsets, polling, heartbeats, rebalancing, and performance tuning',
    duration: '90 min',
    difficulty: 'Advanced',
    tags: ['consumer', 'configuration', 'auto-offset-reset', 'max-poll-records', 'session-timeout', 'rebalancing', 'isolation-level'],
    checkpoints: [
      'Why does max.poll.interval.ms need to be greater than your longest message processing time?',
      'What is the difference between session.timeout.ms and max.poll.interval.ms — which causes a rebalance?',
      'Your consumer is processing 500 records per poll but each record takes 2 seconds. What happens, and how do you fix it?',
    ],
    sections: [
      {
        id: 'p4-l6-why',
        type: 'why',
        title: 'Why consumer configuration is the hardest part of Kafka',
        content: `Producer misconfiguration usually causes obvious failures: send timeouts, buffer overflow exceptions, visible duplicates. Consumer misconfiguration causes subtle, hard-to-diagnose problems: messages silently skipped, endless rebalancing loops, consumers kicked out of the group for being "too slow," or data read in the wrong order.

The consumer interacts with three separate systems simultaneously: Kafka brokers (for fetching), the \`__consumer_offsets\` internal topic (for tracking position), and the group coordinator (for rebalancing heartbeats). Each has its own timeout. Get them wrong and your consumer looks "healthy" while silently malfunctioning.`,
      },
      {
        id: 'p4-l6-analogy',
        type: 'analogy',
        title: 'The consumer as a warehouse receiving team',
        content: `**group.id** = Your team's name. All workers with the same team name share the incoming delivery lanes (partitions). Two different departments (services) have different team names and each read ALL deliveries independently.

**auto.offset.reset** = The instruction card for new workers: "If you're joining mid-shift and don't know where we stopped yesterday — do you start from the very first delivery of the day (earliest), or only pick up new deliveries from now (latest)?"

**max.poll.records** = How many parcels one worker picks up per trip to the loading dock. Picking up 500 at once is efficient — but only if you can process all 500 before the supervisor checks back.

**max.poll.interval.ms** = The supervisor's check-in timer. Every \`max.poll.interval.ms\` milliseconds, the supervisor expects to see the worker come back for more parcels. If the worker disappears for longer (processing is too slow), the supervisor assumes the worker quit and redistributes their lane to others. A rebalance starts.

**session.timeout.ms** = The heartbeat timeout. Your worker's badge pings the system every few seconds to say "I'm still here." If the badge goes silent for \`session.timeout.ms\` — even between trips to the loading dock — the supervisor starts a rebalance.

**heartbeat.interval.ms** = How often the badge pings. Should be about 1/3 of session.timeout.ms so you have multiple chances to be detected as alive before the timeout fires.`,
      },
      {
        id: 'p4-l6-concept-group',
        type: 'concept',
        title: 'group.id and auto.offset.reset',
        content: `### group.id — Your consumer's team identity
- **Default:** None (required — you must set it)
- **Type:** Any string — usually the service name

**What changes based on group.id:**

| Scenario | Behaviour |
|---|---|
| Two instances of \`OrderService\` with the same group.id | They share partitions — each partition goes to one instance. Horizontal scaling. |
| \`PaymentService\` and \`InventoryService\` each with their own group.id | Both services read ALL messages from the topic independently. |
| You change group.id on a running service | Kafka treats it as a brand new consumer. No committed offsets exist. \`auto.offset.reset\` decides where it starts. |

\`\`\`yaml
spring:
  kafka:
    consumer:
      group-id: order-processing-service  # Unique per service, stable across restarts
\`\`\`

---

### auto.offset.reset — Where to start when there is no bookmark

| Value | Meaning | When to use |
|---|---|---|
| \`earliest\` | Start from the very first message ever in the topic | New service that needs to process historical data |
| \`latest\` | Start from new messages only — ignore historical | New service where past events are irrelevant |
| \`none\` | Throw \`NoOffsetForPartitionException\` if no offset found | Strict mode — fail loud rather than silently skip or reprocess |

**What happens when you deploy a new service with earliest:**
Your \`NotificationService\` joins the \`order-created\` topic. \`auto.offset.reset=earliest\` means it processes every order created since the topic was created — possibly millions of old orders. Your notification queue floods. Only use \`earliest\` when you actually want historical replay.

**What happens with latest:**
The service ignores all past messages. Clean start. Only processes orders created after deployment.

\`\`\`yaml
spring:
  kafka:
    consumer:
      auto-offset-reset: latest   # Default for most new services
\`\`\``,
      },
      {
        id: 'p4-l6-concept-commit',
        type: 'concept',
        title: 'enable.auto.commit and auto.commit.interval.ms',
        content: `### enable.auto.commit — Who moves the bookmark?

**true (default):** Kafka automatically commits the offset every \`auto.commit.interval.ms\` milliseconds — regardless of whether your code has finished processing the messages.

**false:** You call \`acknowledgment.acknowledge()\` explicitly in your listener code. The offset moves only when you decide it is safe.

### The danger of auto.commit=true

Timeline with auto.commit=true and auto.commit.interval.ms=5000ms:
\`\`\`
T=0s:   Consumer polls messages 1-10
T=1s:   Processing message 3... (slow DB call)
T=5s:   AUTO-COMMIT fires → offsets 1-10 committed to Kafka
T=6s:   Consumer crashes while processing message 7
T=7s:   Consumer restarts → resumes from offset 11
RESULT: Messages 7-10 were never processed. SILENTLY LOST.
\`\`\`

### The safe pattern: manual commit

\`\`\`java
@KafkaListener(topics = "orders", containerFactory = "manualAckFactory")
public void processOrder(OrderEvent event, Acknowledgment ack) {
    try {
        orderService.process(event);  // your business logic
        ack.acknowledge();            // ONLY commit AFTER successful processing
    } catch (Exception e) {
        // Don't acknowledge — message will be redelivered
        log.error("Processing failed, will retry", e);
        throw e;
    }
}
\`\`\`

\`\`\`yaml
spring:
  kafka:
    consumer:
      enable-auto-commit: false
    listener:
      ack-mode: manual_immediate   # Commit offset the instant acknowledge() is called
\`\`\`

### auto.commit.interval.ms
- **Default:** 5,000ms (5 seconds)
- **Only relevant when:** \`enable.auto.commit=true\`
- **Reduce to:** Decrease the window during which a crash causes reprocessing. But committing more frequently adds overhead.`,
      },
      {
        id: 'p4-l6-concept-polling',
        type: 'concept',
        title: 'max.poll.records and max.poll.interval.ms — The most critical pair',
        content: `These two properties work together and misconfiguring them is the #1 cause of consumers being kicked out of their group.

---

### max.poll.records — How many messages per poll() call
- **Default:** 500
- **What it means:** Each time the consumer's internal loop calls \`poll()\`, it returns at most this many records.

**max.poll.records=500 (default):**
Your listener receives 500 messages. Processing each takes 10ms → 5,000ms total. If \`max.poll.interval.ms=300,000ms\` (5 min), you are well within budget. Fine.

**Problem scenario:** max.poll.records=500, each message takes 2 seconds → 500 × 2s = 1,000 seconds to process one batch. \`max.poll.interval.ms=300,000ms\` (5 min) expires. The broker thinks your consumer died. Rebalance triggered. Your consumer gets assigned back and re-reads the same 500 messages. Infinite loop.

**Fix:** Reduce max.poll.records so the batch finishes within max.poll.interval.ms.

\`\`\`
max.poll.records = floor(max.poll.interval.ms / avg_processing_time_ms)
# Example: 300,000ms budget / 2,000ms per record = 150 records max
\`\`\`

---

### max.poll.interval.ms — The processing time budget
- **Default:** 300,000ms (5 minutes)
- **What it means:** The maximum time between two consecutive \`poll()\` calls. If your listener takes longer than this to process its batch, the consumer is considered dead and a rebalance starts.

**max.poll.interval.ms=300000 (default):**
You have 5 minutes to process your batch of records. For most apps this is more than enough.

**When to increase:** Your processing involves slow external calls (external APIs, batch database writes) that legitimately take more than 5 minutes. Increase to 600,000ms (10 min).

**When to decrease:** You want fast rebalancing on consumer failure. Smaller value = faster detection of a stuck consumer.

\`\`\`yaml
spring:
  kafka:
    consumer:
      max-poll-records: 50          # Reduce if processing is slow per record
      properties:
        max.poll.interval.ms: 600000  # 10 min — for slow external API processing
\`\`\``,
      },
      {
        id: 'p4-l6-concept-heartbeat',
        type: 'concept',
        title: 'session.timeout.ms and heartbeat.interval.ms — Keeping alive',
        content: `### session.timeout.ms — The heartbeat deadline
- **Default:** 45,000ms (45 seconds) on Kafka 3.0+
- **What it means:** If the broker does not receive a heartbeat from the consumer within this window, it declares the consumer dead and triggers a rebalance.
- **Important:** Heartbeats are sent by a background thread — NOT the thread running your \`@KafkaListener\`. A slow listener does NOT directly affect heartbeats. \`max.poll.interval.ms\` covers slow listeners. \`session.timeout.ms\` covers completely unresponsive consumers (process crash, OOM, network partition).

**session.timeout.ms=45000:**
If your consumer process crashes, the group waits up to 45 seconds before rebalancing. During this window, the partitions owned by the dead consumer are not being read.

**Reduce to 10000:** Faster failure detection, faster rebalance. But: flaky networks may cause false positives — brief network disruptions trigger unnecessary rebalances.

**Increase to 90000:** Tolerates network instability but partitions go unread for longer after a real crash.

---

### heartbeat.interval.ms — How often to signal "I'm alive"
- **Default:** 3,000ms (3 seconds)
- **Rule:** Must be significantly less than \`session.timeout.ms\`. Kafka recommends no more than 1/3.

**heartbeat.interval.ms=3000 with session.timeout.ms=45000:**
Consumer sends heartbeat every 3s. Broker allows up to 45s silence. Consumer gets ~15 missed heartbeats before being declared dead. Robust.

**heartbeat.interval.ms=14000 with session.timeout.ms=15000:**
Consumer sends heartbeat every 14s. One missed heartbeat = broker declares it dead. A single slow network packet triggers a rebalance. Too fragile.

\`\`\`yaml
spring:
  kafka:
    consumer:
      properties:
        session.timeout.ms: 45000
        heartbeat.interval.ms: 15000  # 1/3 of session.timeout
\`\`\``,
      },
      {
        id: 'p4-l6-concept-fetch',
        type: 'concept',
        title: 'fetch.min.bytes, fetch.max.wait.ms, fetch.max.bytes — Fetch tuning',
        content: `These control how much data the consumer retrieves per fetch request from the broker.

---

### fetch.min.bytes — Minimum data before broker responds
- **Default:** 1 byte (respond with ANY available data)
- **What it means:** The consumer sends a fetch request. The broker waits until at least this many bytes are available before responding.

**fetch.min.bytes=1 (default):**
Broker responds immediately even with 1 message. Low latency. But if there are 10,000 messages/second, the consumer makes 10,000 fetch requests/second — high overhead.

**fetch.min.bytes=65536 (64KB):**
Broker waits until it has 64KB worth of messages before responding. The consumer gets larger batches per fetch. Fewer fetch requests. Higher throughput. But: if traffic is low (only 5 messages per second), the consumer might wait up to \`fetch.max.wait.ms\` for the broker to accumulate 64KB — adding latency.

---

### fetch.max.wait.ms — How long the broker waits for fetch.min.bytes
- **Default:** 500ms
- **What it means:** If the broker doesn't have \`fetch.min.bytes\` ready, it waits this long before responding with whatever it has.

**Pair these together for low-traffic topics:**
\`\`\`
fetch.min.bytes=1, fetch.max.wait.ms=500ms
→ Respond immediately if any data available, max wait 500ms either way
\`\`\`

**Pair these for high-throughput batch processing:**
\`\`\`
fetch.min.bytes=65536, fetch.max.wait.ms=100ms
→ Wait for 64KB OR 100ms, whichever comes first
\`\`\`

---

### fetch.max.bytes — Maximum bytes per fetch response
- **Default:** 52,428,800 bytes (50 MB)
- **Rarely needs changing.** Increase if your messages are very large (video metadata, large payloads). Must coordinate with broker's \`fetch.message.max.bytes\`.

### max.partition.fetch.bytes — Per partition limit
- **Default:** 1,048,576 bytes (1 MB)
- **Per-partition** cap. If one partition has 5MB of data, only 1MB is returned per fetch. Prevents one busy partition from starving all others.

\`\`\`yaml
spring:
  kafka:
    consumer:
      fetch-min-size: 65536      # 64KB minimum before broker responds
      fetch-max-wait: 100ms      # Don't wait more than 100ms
      properties:
        max.partition.fetch.bytes: 1048576
\`\`\``,
      },
      {
        id: 'p4-l6-concept-isolation',
        type: 'concept',
        title: 'isolation.level — Transactional message visibility',
        content: `### What it controls
Whether the consumer can see messages that are part of an in-progress (uncommitted) transaction.

### Values

**read_uncommitted (default):**
The consumer reads ALL messages — including those from transactions that have not yet committed or may eventually roll back.

**Scenario:** A payment producer starts a transaction, sends "PaymentStarted" and "InventoryDecremented" to Kafka, then the producer crashes before committing. With \`read_uncommitted\`, your consumer already processed both messages. The transaction rolls back on the producer side, but your consumer already acted on them. Duplicate events or phantom transactions.

**read_committed:**
The consumer only sees messages from committed transactions. Messages from aborted or in-progress transactions are invisible until the transaction commits (or skipped forever if aborted).

**Use read_committed when:** Your producer uses \`transactional.id\` (exactly-once semantics) and your consumer should only see final, committed state.

**What changes in your app with read_committed:**
- Consumer will wait for in-progress transactions to complete before returning those messages.
- Your consumer may see a "gap" in offsets (messages from aborted transactions have offsets but are never returned).
- Slightly higher latency for the messages just after a transaction boundary.

\`\`\`yaml
spring:
  kafka:
    consumer:
      properties:
        isolation.level: read_committed  # Required for exactly-once consumer
\`\`\``,
      },
      {
        id: 'p4-l6-concept-assignment',
        type: 'concept',
        title: 'partition.assignment.strategy — How partitions are distributed',
        content: `### What it controls
The algorithm Kafka uses to decide which consumer in a group gets which partitions.

### Strategies and their behaviour

**RangeAssignor (default for older clients):**
Assigns consecutive ranges of partitions to consumers. Consumer 0 gets partitions 0-1, Consumer 1 gets 2-3. Simple but can be unbalanced if partition count is not evenly divisible.

**RoundRobinAssignor:**
Distributes partitions evenly across consumers in round-robin fashion. More balanced than Range. But: on rebalance, every consumer may get completely different partitions — causes cache misses if your consumer has in-memory state tied to specific partitions.

**StickyAssignor:**
Tries to keep existing partition assignments the same during rebalance. Only moves partitions that must change (when a consumer joins or leaves). Reduces "stop-the-world" effect of rebalancing.

**CooperativeStickyAssignor (recommended for production):**
Incremental rebalancing. Instead of "stop everything, reassign all partitions," it does the reassignment in multiple rounds. Consumers continue processing unaffected partitions during rebalance. Zero-downtime rebalancing.

| Strategy | Balance | Stability on rebalance | Recommended |
|---|---|---|---|
| RangeAssignor | OK | Low — all partitions moved | Legacy only |
| RoundRobinAssignor | Good | Low — all partitions moved | Old apps |
| StickyAssignor | Good | High — minimal movement | Stateful apps |
| CooperativeStickyAssignor | Good | Highest — incremental | All new apps |

\`\`\`yaml
spring:
  kafka:
    consumer:
      properties:
        partition.assignment.strategy: >
          org.apache.kafka.clients.consumer.CooperativeStickyAssignor
\`\`\``,
      },
      {
        id: 'p4-l6-code',
        type: 'code',
        title: 'Complete consumer application.yml reference',
        content: `\`\`\`yaml
spring:
  kafka:
    consumer:
      # ── Identity & Starting Point ───────────────────────────
      group-id: order-processing-service
      auto-offset-reset: latest       # earliest | latest | none

      # ── Serialization ──────────────────────────────────────
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
      properties:
        spring.json.trusted.packages: "com.example.events"

      # ── Commit Strategy ────────────────────────────────────
      enable-auto-commit: false       # Manual commit for data safety

      # ── Fetch Tuning ───────────────────────────────────────
      max-poll-records: 50            # Records per poll — reduce for slow processing
      fetch-min-size: 1               # Min bytes before broker responds (1 = low latency)
      fetch-max-wait: 500ms           # Max wait for fetch.min.bytes to be available

      # ── Heartbeat & Session ────────────────────────────────
      properties:
        session.timeout.ms: 45000
        heartbeat.interval.ms: 15000

        # Polling interval budget (must cover your full batch processing time)
        max.poll.interval.ms: 300000

        # Partition assignment
        partition.assignment.strategy: >
          org.apache.kafka.clients.consumer.CooperativeStickyAssignor

        # Exactly-once: only see committed transaction messages
        isolation.level: read_committed

        # Observability
        client.id: order-consumer-1

    # ── Spring Listener Container ───────────────────────────
    listener:
      ack-mode: manual_immediate      # Commit when acknowledge() is called
      concurrency: 3                  # 3 consumer threads (= 3 partitions active)
      poll-timeout: 3000ms            # How long listener waits for new messages before looping
\`\`\`

### ack-mode options explained

| ack-mode | When offset is committed |
|---|---|
| \`record\` | After each record processed (auto-commit per record) |
| \`batch\` | After all records in the poll batch are processed |
| \`time\` | Periodically based on ack-time interval |
| \`count\` | After N records processed |
| \`manual\` | When \`Acknowledgment.acknowledge()\` is called (batched) |
| \`manual_immediate\` | When \`acknowledge()\` is called (immediately, safest) |`,
      },
      {
        id: 'p4-l6-task',
        type: 'task',
        title: 'Diagnose these broken consumer configurations',
        content: `Each scenario describes a consumer misbehaving in production. Identify the misconfigured property and fix it.

**Problem 1:**
Your order consumer is processing records correctly but every 5 minutes the logs show \`Rebalancing: Consumer group order-service is rebalancing.\` After each rebalance, you see some orders processed twice.

*Clue: Processing each order takes about 12 seconds. You have max.poll.records=100 and max.poll.interval.ms=300000.*

---

**Problem 2:**
You deploy a new EmailNotificationService that listens to the \`order-created\` topic. On the first deployment it sends 500,000 emails to customers for orders placed over the past 6 months. Customers are furious.

*Clue: auto.offset.reset is set to a specific value.*

---

**Problem 3:**
Your consumer processes payment events. You recently switched the payment producer to use exactly-once transactions. Now your consumer intermittently processes payment events that were from failed transactions — events that "shouldn't exist."

*Clue: One consumer property controls which transaction states are visible.*

---

**Problem 4:**
Kafka cluster goes down for 45 seconds for a rolling restart. When it comes back, your consumer group has lost all partition assignments and triggers a full rebalance — even consumers that weren't affected.

*Clue: There is a partition assignment strategy that avoids this.*

*Write the fix for each as a \`application.yml\` snippet.*`,
      },
      {
        id: 'p4-l6-summary',
        type: 'summary',
        title: 'What you just learned',
        content: `Consumer configuration is where most Kafka bugs hide. The critical rules: always use \`enable.auto.commit=false\` and \`ack-mode=manual_immediate\` in production — auto-commit can silently skip messages on crash. Keep \`max.poll.records × avg_processing_time < max.poll.interval.ms\` or your consumer gets kicked from its group. \`session.timeout.ms\` and \`max.poll.interval.ms\` serve different purposes: session timeout detects dead processes, poll interval detects slow processors. Use \`CooperativeStickyAssignor\` to eliminate stop-the-world rebalances. And use \`isolation.level=read_committed\` when your producers use transactions.`,
      },
    ],
  },

  {
    id: 'p4-l7',
    phase: 4,
    lesson: 7,
    title: 'Topic & Broker Configuration — Complete Reference',
    subtitle: 'Partitions, replication, retention, compaction — every dial that shapes your Kafka cluster',
    duration: '75 min',
    difficulty: 'Advanced',
    tags: ['topic-config', 'broker-config', 'retention', 'compaction', 'replication', 'partitions', 'min-insync-replicas'],
    checkpoints: [
      'Your topic has 3 partitions but you suddenly need 20x throughput. What do you do, and what is the risk?',
      'What does min.insync.replicas=2 guarantee, and what happens if a broker goes down?',
      'When would you use cleanup.policy=compact instead of delete? Give a real-world example.',
    ],
    sections: [
      {
        id: 'p4-l7-why',
        type: 'why',
        title: 'Why topic and broker configuration matters',
        content: `Your producer and consumer configuration is tuned per-application. Topic and broker configuration is tuned per-system. Getting partitions, replication, and retention right at topic creation time prevents expensive migrations later. Setting \`min.insync.replicas\` incorrectly can make your cluster silently accept data it cannot safely store. Understanding these properties is what separates a developer who "uses Kafka" from one who "operates Kafka."`,
      },
      {
        id: 'p4-l7-analogy',
        type: 'analogy',
        title: 'The motorway and filing cabinet analogy',
        content: `**num.partitions** = Number of lanes on a motorway. More lanes = more cars in parallel. You can add lanes later but it requires construction (and may cause temporary traffic problems).

**replication.factor** = How many identical filing cabinets store the same documents. 1 cabinet = one fire destroys everything. 3 cabinets on 3 floors = you can lose 2 floors and still have all documents.

**retention.ms** = How long the filing cabinet keeps old documents before shredding them. 7 days: anything older gets shredded. Forever: nothing ever gets shredded.

**cleanup.policy=compact** = Instead of shredding by age, keep ONLY the most recent version of each document (keyed by customer ID). Old addresses are overwritten; only the latest address for each customer is kept.

**min.insync.replicas** = The minimum number of filing cabinets that must acknowledge receiving a document before you consider it safely filed. If only 1 cabinet acknowledges but your minimum is 2, the write is rejected.`,
      },
      {
        id: 'p4-l7-concept-partitions',
        type: 'concept',
        title: 'num.partitions — The parallelism dial',
        content: `### What it controls
How many parallel "lanes" a topic has. This is the single most impactful topic design decision.

### Rules of thumb for choosing partition count

| Throughput target | Recommended partitions |
|---|---|
| < 10,000 msg/s | 3–6 partitions |
| 10,000–100,000 msg/s | 12–30 partitions |
| 100,000–1,000,000 msg/s | 60–100+ partitions |

**Why you can't just "use 1000 partitions for everything":**
- Each partition is a directory on disk + open file handles on the broker
- 10,000 partitions across a 3-broker cluster = 3,333 open file handles per broker
- Broker leader election time is proportional to partition count
- Consumer rebalance time increases with partition count

### Changing partitions after creation

You can **increase** partitions: \`kafka-topics.sh --alter --partitions 20\`. But this breaks key-based ordering. Messages with the same key that were previously guaranteed to land in the same partition may now land in different partitions. If you use keys for ordering (all events for orderId=123 in sequence), increasing partitions breaks that guarantee.

You can **NOT decrease** partitions. The only option is to create a new topic with fewer partitions and migrate.

### Production practice
**Over-provision at creation time.** Start with 12 partitions even if you only need 3 today. Adding partitions later has side effects; creating with headroom is free.

\`\`\`bash
kafka-topics.sh --create \\
  --topic order-events \\
  --partitions 12 \\
  --replication-factor 3 \\
  --bootstrap-server localhost:9092
\`\`\``,
      },
      {
        id: 'p4-l7-concept-replication',
        type: 'concept',
        title: 'replication.factor and min.insync.replicas — Durability vs availability',
        content: `### replication.factor — How many copies of each partition exist

| Value | Meaning | Broker failures survived |
|---|---|---|
| \`1\` | No redundancy — single copy | 0 |
| \`2\` | One backup | 1 (the follower becomes leader) |
| \`3\` (production standard) | Two backups | 2 (can lose 2 of 3 brokers) |

**replication.factor=3 in a 3-broker cluster:**
- Partition 0 leader: Broker 1, followers: Broker 2, Broker 3
- Broker 1 crashes → Kafka elects Broker 2 as new leader in < 1 second. No data loss. No downtime.
- Broker 1 AND Broker 2 crash simultaneously → Only Broker 3 has the data. It becomes leader. Still online.
- All 3 crash → Data loss (the replicas not yet written to disk are gone).

---

### min.insync.replicas (ISR) — The safety floor for writes

**Default:** 1 (just the leader is sufficient)

**What it means:** When using \`acks=all\`, the producer waits for ALL in-sync replicas (ISR) to confirm. \`min.insync.replicas\` defines the minimum ISR size. If ISR falls below this threshold, the broker rejects writes with \`NotEnoughReplicasException\`.

**Scenario: replication.factor=3, min.insync.replicas=2**

\`\`\`
Normal operation: ISR = {Broker1, Broker2, Broker3} — 3 replicas, writes accepted
Broker3 goes down: ISR = {Broker1, Broker2} — 2 replicas ≥ min.insync=2, writes accepted
Broker2 also goes down: ISR = {Broker1} — 1 replica < min.insync=2, writes REJECTED
\`\`\`

**Why this is the correct production setting:**
If \`min.insync.replicas=1\` (default), writes are accepted even when only the leader has data. If the leader then crashes before replication, you lose the message. Setting to 2 guarantees at least 2 brokers have the message before confirming success.

**The trade-off:** With \`min.insync.replicas=2\` and 2 brokers down, your topic becomes read-only (consumers still work, producers cannot write). This is the correct safety behaviour — reject writes rather than accept data you might lose.

\`\`\`bash
# Set at topic creation
kafka-topics.sh --create --topic payments \\
  --config min.insync.replicas=2 \\
  --replication-factor 3 \\
  --partitions 6

# Or update existing topic
kafka-configs.sh --alter \\
  --entity-type topics --entity-name payments \\
  --add-config min.insync.replicas=2
\`\`\``,
      },
      {
        id: 'p4-l7-concept-retention',
        type: 'concept',
        title: 'retention.ms and retention.bytes — How long data lives',
        content: `### retention.ms — Time-based retention

- **Default:** 604,800,000ms (7 days)
- **Special value:** \`-1\` = keep forever

**What happens when retention.ms expires:**
Messages older than the threshold are deleted from the log segments. The segments are removed in batches (controlled by \`log.segment.bytes\` and \`log.retention.check.interval.ms\`). This is not real-time — there may be a delay of a few minutes before old segments are actually deleted.

| retention.ms | Use case |
|---|---|
| \`3600000\` (1 hour) | Real-time metrics — historical data has no value |
| \`86400000\` (1 day) | Log aggregation, event streaming |
| \`604800000\` (7 days) | Default — most business events |
| \`2592000000\` (30 days) | Audit logs, compliance events |
| \`-1\` (forever) | Event sourcing, data lake, full replay needed |

---

### retention.bytes — Size-based retention (per partition)

- **Default:** -1 (unlimited)
- **Per partition:** If a partition exceeds this size, the oldest log segments are deleted.

**Scenario:** \`retention.bytes=1073741824\` (1GB) with 12 partitions = 12GB max per topic. When any single partition exceeds 1GB, old segments are deleted — regardless of how recent they are. This caps storage cost but can delete recent messages during traffic spikes.

**Combined retention (both set):** Whichever limit is hit first triggers deletion. Either data is older than retention.ms OR the partition exceeds retention.bytes.

\`\`\`bash
kafka-configs.sh --alter --entity-type topics --entity-name order-events \\
  --add-config retention.ms=2592000000  # 30 days
\`\`\`

---

### segment.ms and segment.bytes — When to roll to a new log segment

**segment.ms (default: 7 days)** and **segment.bytes (default: 1GB)**: Kafka writes to one log segment at a time. A new segment is created when the current one is full (segment.bytes) or old enough (segment.ms). Retention only deletes COMPLETE segments — so the most recent segment (still being written to) is never deleted.

**Impact:** If you set \`retention.ms=1hour\` but \`segment.ms=7days\`, the current segment never rolls, so nothing is ever deleted. Set \`segment.ms\` smaller than \`retention.ms\` for time-based retention to work correctly.`,
      },
      {
        id: 'p4-l7-concept-compaction',
        type: 'concept',
        title: 'cleanup.policy — delete vs compact',
        content: `### Two fundamentally different retention strategies

**cleanup.policy=delete (default):**
Old data is deleted based on time (retention.ms) or size (retention.bytes). Messages are ephemeral — they expire. The topic is a stream of events.

**cleanup.policy=compact:**
Instead of deleting by time, the broker keeps only the LATEST message for each unique key. Old values for the same key are overwritten. The topic becomes a "last known state" store.

---

### How log compaction works

Messages on a compacted topic:
\`\`\`
Offset 1: key="user-123" value={"name":"Alice","city":"London"}
Offset 2: key="user-456" value={"name":"Bob","city":"Paris"}
Offset 3: key="user-123" value={"name":"Alice","city":"Manchester"}  ← UPDATE
Offset 4: key="user-123" value=null  ← TOMBSTONE (delete user-123)
\`\`\`

After compaction runs:
\`\`\`
Offset 2: key="user-456" value={"name":"Bob","city":"Paris"}   ← kept (latest)
Offset 4: key="user-123" value=null                            ← tombstone kept briefly then deleted
\`\`\`

Offset 1 and 3 are gone — user-123 now only has the tombstone (null) indicating deletion.

---

### When to use compaction

| Use case | cleanup.policy |
|---|---|
| User profile updates — always need latest profile | \`compact\` |
| Product catalogue — consumers need current state | \`compact\` |
| Order events — need full history for audit trail | \`delete\` |
| Click stream analytics — old clicks have no value | \`delete\` |
| Event sourcing — must be able to replay all events | \`delete\` with long retention |

**Hybrid:** \`cleanup.policy=compact,delete\` — compacts old segments AND enforces retention time. Latest value for each key is kept until the retention window expires.

\`\`\`bash
kafka-topics.sh --create --topic user-profiles \\
  --config cleanup.policy=compact \\
  --config min.cleanable.dirty.ratio=0.5 \\  # Compact when 50% is "dirty" (updated)
  --config delete.retention.ms=86400000       # Keep tombstones 24h after deletion
\`\`\``,
      },
      {
        id: 'p4-l7-concept-misc',
        type: 'concept',
        title: 'message.max.bytes, compression.type, unclean.leader.election',
        content: `### message.max.bytes — Maximum message size on broker

- **Default:** 1,048,576 bytes (1 MB)
- **What it controls:** The largest single message the broker will accept.

**If your producer sends a 5MB message with the default:** The broker rejects it with \`RecordTooLargeException\`.

**How to increase (must coordinate THREE places):**
\`\`\`bash
# 1. Broker (or topic) setting
message.max.bytes=10485760  # 10MB

# 2. Consumer fetch setting (must match or exceed)
fetch.message.max.bytes=10485760

# 3. Producer (usually already large enough by default)
max.request.size=10485760
\`\`\`

**Production advice:** Sending large messages through Kafka is an anti-pattern. Store large files (images, videos, PDFs) in S3/blob storage and send only the S3 URL as a Kafka message. Keep messages under 1MB.

---

### compression.type (topic-level override)

- **Default:** \`producer\` — honours whatever compression the producer used
- **Override options:** \`none\`, \`gzip\`, \`snappy\`, \`lz4\`, \`zstd\`

Setting \`compression.type=gzip\` at the topic level means the broker re-compresses all messages to gzip regardless of what the producer sent. This adds CPU overhead on the broker. Usually leave this as \`producer\` and control compression at the producer level.

---

### unclean.leader.election.enable — The data loss toggle

- **Default:** \`false\` (safe)
- **What it does:** If all ISR replicas are unavailable, Kafka can elect a lagging out-of-sync replica as leader.

**unclean.leader.election.enable=true:**
Kafka stays available by electing a lagging follower as leader. The messages that were on the dead leader but not yet replicated are permanently lost. The follower's data is the new "truth."

**unclean.leader.election.enable=false (default):**
Kafka waits for an ISR member to come back online before electing a leader. The topic may be unavailable for minutes or hours, but no data is lost.

**For payment topics, audit logs, or any financial data:** Always keep \`false\`. Data loss is unacceptable.
**For metrics, analytics, click-stream:** \`true\` might be acceptable — availability matters more than a few lost metric events.`,
      },
      {
        id: 'p4-l7-code',
        type: 'code',
        title: 'Topic configuration cheat sheet',
        content: `### Creating a production-grade topic via kafka-topics.sh
\`\`\`bash
kafka-topics.sh --create \\
  --bootstrap-server broker:9092 \\
  --topic order-events \\
  --partitions 12 \\
  --replication-factor 3 \\
  --config retention.ms=604800000 \\     # 7 days
  --config min.insync.replicas=2 \\      # Require 2 replicas for write safety
  --config compression.type=producer \\  # Use whatever producer sends
  --config max.message.bytes=1048576 \\  # 1MB max message size
  --config cleanup.policy=delete \\      # Delete by time (not compact)
  --config segment.ms=86400000          # Roll segments daily (for timely retention)
\`\`\`

### Via Spring Boot at application startup
\`\`\`java
@Configuration
public class KafkaTopicConfig {

    @Bean
    public NewTopic orderEventsTopic() {
        return TopicBuilder.name("order-events")
            .partitions(12)
            .replicas(3)
            .config(TopicConfig.RETENTION_MS_CONFIG, "604800000")      // 7 days
            .config(TopicConfig.MIN_IN_SYNC_REPLICAS_CONFIG, "2")
            .config(TopicConfig.COMPRESSION_TYPE_CONFIG, "snappy")
            .config(TopicConfig.CLEANUP_POLICY_CONFIG, TopicConfig.CLEANUP_POLICY_DELETE)
            .build();
    }

    @Bean
    public NewTopic userProfilesTopic() {
        return TopicBuilder.name("user-profiles")
            .partitions(6)
            .replicas(3)
            .config(TopicConfig.CLEANUP_POLICY_CONFIG, TopicConfig.CLEANUP_POLICY_COMPACT)
            .config(TopicConfig.MIN_CLEANABLE_DIRTY_RATIO_CONFIG, "0.5")
            .config(TopicConfig.DELETE_RETENTION_MS_CONFIG, "86400000")  // tombstones kept 24h
            .build();
    }
}
\`\`\`

### Quick reference: property → location

| Property | Set where |
|---|---|
| \`num.partitions\` | Topic creation (cannot reduce after) |
| \`replication.factor\` | Topic creation only |
| \`retention.ms\` | Topic config (can change anytime) |
| \`min.insync.replicas\` | Topic config or broker default |
| \`cleanup.policy\` | Topic config |
| \`message.max.bytes\` | Broker config (global) or topic override |
| \`unclean.leader.election.enable\` | Broker config or topic override |`,
      },
      {
        id: 'p4-l7-task',
        type: 'task',
        title: 'Design the topics for an e-commerce system',
        content: `Design Kafka topics for an e-commerce platform. For each topic, specify: partition count, replication factor, cleanup policy, retention settings, and min.insync.replicas. Justify every choice.

**Topics to design:**

1. **order-events** — Order lifecycle events (created, paid, shipped, delivered). Volume: 50,000 orders/day. Must be replayable for 90 days for compliance audit.

2. **product-catalogue** — Current product details and prices. Publishers update product records when prices change. Consumers always need the latest version of each product. Volume: 100 updates/day.

3. **click-stream** — Every click event from the website. Volume: 5,000,000 clicks/day. Loss of 0.1% is acceptable. Needs only 24 hours of history for real-time dashboards.

4. **payment-transactions** — Payment events. Volume: 50,000/day. Zero data loss acceptable. Must survive broker failures. Regulatory requirement: 7-year retention.

*Template for each topic:*
\`\`\`bash
kafka-topics.sh --create --topic [NAME] \\
  --partitions [N] \\
  --replication-factor [N] \\
  --config cleanup.policy=[delete|compact] \\
  --config retention.ms=[value or -1] \\
  --config min.insync.replicas=[N]
\`\`\`

*Explain: why these partition count, why this cleanup policy, why this retention.*`,
      },
      {
        id: 'p4-l7-summary',
        type: 'summary',
        title: 'What you just learned',
        content: `Topic configuration is infrastructure-level decision-making. Partition count determines your parallelism ceiling — over-provision at creation time because you cannot safely decrease partitions later. Replication factor 3 with min.insync.replicas=2 is the production safety standard: you can lose one broker without data loss or write rejection. Retention policy should match your data's business value: short for ephemeral metrics, long for compliance events, forever for event-sourced systems. Log compaction (cleanup.policy=compact) turns a topic into a "current state" snapshot — perfect for reference data like product catalogues and user profiles. And unclean.leader.election.enable should always be false for data you cannot afford to lose.`,
      },
    ],
  },

];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getLessonsForPhase(phaseNumber: number): CourseLesson[] {
  return COURSE_LESSONS.filter((l) => l.phase === phaseNumber);
}

export function getLessonById(id: string): CourseLesson | undefined {
  return COURSE_LESSONS.find((l) => l.id === id);
}

export function getNextLesson(id: string): CourseLesson | undefined {
  const idx = COURSE_LESSONS.findIndex((l) => l.id === id);
  return idx >= 0 && idx < COURSE_LESSONS.length - 1 ? COURSE_LESSONS[idx + 1] : undefined;
}

export function getPrevLesson(id: string): CourseLesson | undefined {
  const idx = COURSE_LESSONS.findIndex((l) => l.id === id);
  return idx > 0 ? COURSE_LESSONS[idx - 1] : undefined;
}

export function getTotalLessons(): number {
  return COURSE_LESSONS.length;
}

export function getTotalHours(): string {
  return '18';
}

export const KAFKA_COURSE_STORAGE_KEY = 'kafka-course-completed-lessons';

export function getCompletedLessons(): Set<string> {
  try {
    const stored = localStorage.getItem(KAFKA_COURSE_STORAGE_KEY);
    return stored ? new Set<string>(JSON.parse(stored)) : new Set<string>();
  } catch {
    return new Set<string>();
  }
}

export function markLessonComplete(id: string): void {
  const completed = getCompletedLessons();
  completed.add(id);
  localStorage.setItem(KAFKA_COURSE_STORAGE_KEY, JSON.stringify([...completed]));
}

export function markLessonIncomplete(id: string): void {
  const completed = getCompletedLessons();
  completed.delete(id);
  localStorage.setItem(KAFKA_COURSE_STORAGE_KEY, JSON.stringify([...completed]));
}
