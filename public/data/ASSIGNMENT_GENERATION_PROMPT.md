# Assignment JSON Generation Prompt — Phases 3–10

## Context

This project is the **Satyverse(Satyam Parmar)** Java learning app. Each phase has a corresponding
assignment JSON file (`assignments_phase{N}.json`) stored in `public/data/`.

Phases 1 and 2 are already done. Generate the remaining phases using the **exact same
structure and quality level**.

---

## File Location & Naming

- Output path: `public/data/assignments_phase{N}.json`
- One file per phase: `assignments_phase3.json` … `assignments_phase10.json`

---

## JSON Schema (must match exactly)

```json
{
  "phase": <number>,
  "title": "<Phase N · Phase Title>",
  "assignments": {
    "<day>": {
      "type": "assignment",
      "title": "Day <N> Assignment: <Day Topic>",
      "description": "<1-2 sentences describing what this assignment tests>",
      "totalPoints": 100,
      "questions": [ ...4 questions... ]
    }
  }
}
```

### Question Schema

```json
{
  "id": "d<day>q<index>",
  "type": "conceptual" | "scenario" | "coding",
  "difficulty": "Beginner" | "Intermediate" | "Advanced" | "Expert",
  "title": "<Short descriptive title>",
  "question": "<The full question text. May include inline code fenced with backticks.>",
  "hints": ["<hint 1>", "<hint 2>", "<hint 3>"],
  "solution": "<Full markdown solution — use headings, bullet points, fenced code blocks>",
  "codeTemplate": "<Starter code (coding type only)>",
  "expectedOutput": "<Expected stdout (coding type only)>",
  "points": <number>
}
```

---

## Points Distribution Per Day (must sum to exactly 100)

| Position | Type | Points |
|----------|------|--------|
| Q1 | conceptual | 20 |
| Q2 | conceptual | 20 |
| Q3 | scenario | 25 |
| Q4 | coding | 35 |

---

## Question Type Guidelines

### `conceptual`
- Test understanding of a specific concept from the day's topic.
- Question may include a short code snippet asking "what is the output and why?"
- Solution must explain the **why**, not just the answer.
- 3 hints, each a short clue that guides without giving the answer away.

### `scenario`
- Real-world or interview problem framing.
- May ask to "design", "diagnose a bug", "identify issues", or "choose the right approach".
- Solution should include both the reasoning and the corrected/designed code where applicable.

### `coding`
- Must include `codeTemplate` — a skeleton with method signatures and TODO comments.
- Must include `expectedOutput` — exact stdout the completed program should print.
- Solution is the full working Java class.
- Keep programs self-contained (single class with `main`).

---

## Difficulty Guidelines by Phase

| Phase | Days | Difficulty |
|-------|------|-----------|
| 3 | 19–27 | Intermediate |
| 4 | 28–37 | Intermediate → Advanced |
| 5 | 38–48 | Advanced |
| 6 | 49–58 | Advanced |
| 7 | 59–67 | Advanced |
| 8 | 68–76 | Advanced |
| 9 | 77–84 | Expert |
| 10 | 85–90 | Expert |

Within a phase, Q1/Q2 can be one level below the phase difficulty,
and Q4 (coding) can match or be one level above.

---

## Phases and Days to Generate

### Phase 3 — Data Structures & Algorithms (days 19–27)

| Day | Topic | Suggested Focus |
|-----|-------|----------------|
| 19 | Complexity Analysis | Big-O notation, time vs space, worst/avg/best case |
| 20 | Arrays and Two Pointers | Two-pointer technique, sliding window |
| 21 | Linked Lists | Singly/doubly linked list, reversal, cycle detection |
| 22 | Stacks and Queues | Stack with array/linked list, queue variants, monotonic stack |
| 23 | HashMaps and Hashing | Hash collisions, load factor, open addressing vs chaining |
| 24 | Trees | BST operations, BFS, DFS, tree height |
| 25 | Heaps and Priority Queues | Min/max heap, PriorityQueue API, heap sort |
| 26 | Sorting and Binary Search | Merge sort, quick sort, binary search variants |
| 27 | Dynamic Programming Basics | Memoisation, tabulation, overlapping subproblems |

**Coding challenges to use:**
- Day 19: Measure runtime growth empirically with arrays of size 100, 1000, 10000.
- Day 20: Find pair that sums to target in a sorted array (two pointers).
- Day 21: Reverse a linked list iteratively.
- Day 22: Evaluate balanced parentheses using a stack.
- Day 23: Implement frequency map; find first non-repeating character.
- Day 24: BFS level-order traversal of a binary tree.
- Day 25: Find k-th largest element using PriorityQueue.
- Day 26: Binary search on a sorted array; return index or -1.
- Day 27: Fibonacci with memoisation (top-down DP).

---

### Phase 4 — Java Advanced & Java 17+ (days 28–37)

| Day | Topic | Suggested Focus |
|-----|-------|----------------|
| 28 | Generics Deep Dive | Type erasure, bounded wildcards, PECS |
| 29 | Lambda and Functional Interfaces | Functional interfaces, method references, closures |
| 30 | Streams API | Intermediate vs terminal ops, lazy evaluation, collect |
| 31 | Optional and Modern Java APIs | Avoiding NullPointerException, Optional chaining |
| 32 | Java 17 Records and Sealed Classes | Record internals, sealed hierarchy, exhaustive switch |
| 33 | Pattern Matching and Switch Expressions | instanceof pattern, switch expressions, guards |
| 34 | Concurrency Foundations | Thread lifecycle, synchronized, volatile, deadlock |
| 35 | Advanced Concurrency | ReentrantLock, CountDownLatch, ConcurrentHashMap |
| 36 | CompletableFuture and Virtual Threads | thenApply, allOf, exceptionally, Project Loom |
| 37 | JVM Internals and GC | Heap regions, GC algorithms, G1GC, tuning flags |

**Coding challenges to use:**
- Day 28: Generic `Pair<A,B>` class with swap() method.
- Day 29: Use method references to transform a list of strings (uppercase, filter, sort).
- Day 30: Given employee list, find avg salary by department using Stream groupingBy.
- Day 31: Chain Optional to safely extract nested field (User → Address → City).
- Day 32: Define a sealed `Shape` hierarchy; use exhaustive switch expression for area.
- Day 33: Switch expression returning String description based on object type.
- Day 34: Demonstrate deadlock with two threads and two locks; then fix it.
- Day 35: Implement a thread-safe counter using AtomicInteger vs synchronized.
- Day 36: Run 3 async tasks with CompletableFuture.allOf, combine results.
- Day 37: Print JVM heap info (Runtime.getRuntime()); explain what each metric means.

---

### Phase 5 — Spring Ecosystem (days 38–48)

| Day | Topic | Suggested Focus |
|-----|-------|----------------|
| 38 | Spring Core - IoC & DI | ApplicationContext, bean definitions, @Autowired |
| 39 | Spring Bean Lifecycle & Advanced DI | @PostConstruct, @PreDestroy, @Qualifier, @Primary |
| 40 | Spring AOP | Aspects, pointcuts, advice types, @Around |
| 41 | Spring MVC & REST | @RestController, @RequestMapping, request lifecycle |
| 42 | Spring Boot Internals | Auto-configuration, @SpringBootApplication, starters |
| 43 | Spring Boot Config & Actuator | @Value, @ConfigurationProperties, Actuator endpoints |
| 44 | Spring Data JPA & Hibernate | @Entity, repositories, N+1 problem, FetchType |
| 45 | Spring Data Transactions & Locking | @Transactional propagation, isolation levels, optimistic lock |
| 46 | Spring Security - Authentication | SecurityFilterChain, UserDetailsService, password encoding |
| 47 | Spring Security - OAuth2 & Authorisation | OAuth2 flow, JWT, @PreAuthorize, roles |
| 48 | Spring WebFlux & Reactive | Mono/Flux, reactive pipeline, backpressure |

**Notes for Phase 5:**
- Questions should be scenario-based (interview-style).
- Coding questions should show Spring snippet patterns (annotations, bean config) — not full runnable apps.
- For coding type, `codeTemplate` can be a partial Spring class/config, `expectedOutput` can describe the bean behaviour.
- Difficulty: Advanced.

**Scenario ideas:**
- Day 38: Circular dependency — how does Spring detect it? How to break it?
- Day 40: Log execution time of all service methods using @Around advice.
- Day 44: Explain the N+1 query problem with a `@OneToMany` example; how to fix with JOIN FETCH.
- Day 45: What happens when two transactions update the same row simultaneously? Optimistic vs pessimistic locking.
- Day 46: A request to `/admin` should only be accessible to users with ROLE_ADMIN. Show SecurityFilterChain config.

---

### Phase 6 — REST API & Microservices (days 49–58)

| Day | Topic | Suggested Focus |
|-----|-------|----------------|
| 49 | REST API Design Principles | Richardson Maturity Model, HATEOAS, idempotency |
| 50 | REST Best Practices & OpenAPI | Versioning, pagination, error responses, OpenAPI 3 |
| 51 | Microservices Principles & DDD | Bounded context, aggregate, service decomposition |
| 52 | Service Discovery & API Gateway | Eureka, Spring Cloud Gateway, load balancing |
| 53 | Feign, WebClient & Resilience | Feign client, WebClient, Circuit Breaker, Retry |
| 54 | gRPC & GraphQL | Protobuf, streaming, GraphQL queries vs REST |
| 55 | Inter-Service Communication Patterns | Sync vs async, choreography vs orchestration |
| 56 | Saga Pattern & Distributed Transactions | Saga steps, compensating transactions, 2PC problems |
| 57 | CQRS & Event Sourcing | Command/Query split, event store, projection |
| 58 | Advanced Microservices Patterns | Strangler Fig, Anti-Corruption Layer, Sidecar |

**Scenario ideas:**
- Day 49: Design the REST API for a hotel booking system — endpoints, methods, status codes.
- Day 51: How do you decide where to split a monolith into microservices? What is a bounded context?
- Day 53: A downstream service is slow; how does Circuit Breaker protect your service? Closed → Open → Half-Open states.
- Day 56: An order service calls payment, then inventory. Payment succeeds but inventory fails. How does Saga roll back the payment?

---

### Phase 7 — Kafka & Messaging (days 59–67)

| Day | Topic | Suggested Focus |
|-----|-------|----------------|
| 59 | Kafka Architecture | Brokers, topics, partitions, consumer groups |
| 60 | Kafka Producers Deep Dive | Acks, batching, compression, idempotent producer |
| 61 | Kafka Consumers Deep Dive | Offset commit, rebalancing, partition assignment |
| 62 | Delivery Semantics & EOS | At-most-once, at-least-once, exactly-once semantics |
| 63 | Kafka Streams | KStream, KTable, stateful transformations, windowing |
| 64 | Schema Registry & Kafka Connect | Avro, schema evolution, source/sink connectors |
| 65 | Spring Kafka | @KafkaListener, KafkaTemplate, error handling |
| 66 | RabbitMQ & AWS Messaging | Exchanges, queues, SQS, SNS vs Kafka |
| 67 | Distributed Systems Theory | CAP theorem, BASE, eventual consistency |

**Difficulty:** Advanced.

**Scenario ideas:**
- Day 59: A consumer group has 3 consumers and 5 partitions. How are partitions assigned? What if one consumer crashes?
- Day 62: Your order service must charge a customer exactly once even if Kafka redelivers the message. Which delivery semantic and producer config do you use?
- Day 67: CAP theorem — in a network partition, which two properties can a distributed system guarantee? Give examples (Cassandra vs HBase).

**Coding questions** (code snippets, not full runnable apps):
- Day 65: Show `@KafkaListener` config with manual offset commit and error handling.
- Day 63: Show a Kafka Streams topology that counts words per 1-minute window.

---

### Phase 8 — Cloud, Databases & DevOps (days 68–76)

| Day | Topic | Suggested Focus |
|-----|-------|----------------|
| 68 | Advanced SQL | Window functions, CTEs, query optimisation, indexes |
| 69 | Transactions & Connection Pooling | ACID, isolation levels, HikariCP config |
| 70 | NoSQL - MongoDB & Cassandra | Document model, wide-column, CAP positioning |
| 71 | Redis - Caching & Advanced Patterns | Data structures, TTL, cache-aside, pub/sub |
| 72 | Docker for Java Applications | Dockerfile, multi-stage build, docker-compose |
| 73 | Kubernetes Core | Pods, Deployments, Services, ConfigMaps |
| 74 | Kubernetes Advanced & Helm | HPA, resource limits, liveness/readiness probes, Helm |
| 75 | AWS for Java Developers | EC2, S3, RDS, Lambda, EKS |
| 76 | CI/CD & Observability | GitHub Actions, Prometheus, Grafana, distributed tracing |

**Difficulty:** Advanced.

**Scenario ideas:**
- Day 68: A query `SELECT * FROM orders WHERE status='PENDING'` is slow on 10M rows. What indexes would you add and why?
- Day 69: Your app has 500 concurrent users but the DB pool is set to 10 connections. What happens? How do you tune HikariCP?
- Day 71: Explain cache-aside pattern. What is cache stampede and how do you prevent it?
- Day 73: A pod keeps restarting. What Kubernetes commands help diagnose the issue?

**Coding questions** (YAML/config/snippets are valid for Docker/K8s days):
- Day 72: Write a multi-stage Dockerfile for a Spring Boot fat JAR.
- Day 76: Show a GitHub Actions workflow YAML that builds, tests, and pushes a Docker image.

---

### Phase 9 — Architecture & System Design (days 77–84)

| Day | Topic | Suggested Focus |
|-----|-------|----------------|
| 77 | SOLID & Clean Architecture | Each SOLID principle with a violation and fix |
| 78 | Design Patterns - Creational | Singleton, Factory, Builder, Prototype |
| 79 | Design Patterns - Structural | Adapter, Decorator, Proxy, Facade |
| 80 | Design Patterns - Behavioral | Strategy, Observer, Command, Template Method |
| 81 | System Design Fundamentals | Scalability, load balancing, caching, CDN, DB sharding |
| 82 | System Design - URL Shortener | Requirements, HLD, data model, base62 encoding |
| 83 | System Design - Notification Service | Fan-out, push vs pull, rate limiting, retry |
| 84 | System Design - E-commerce Order Service | Order state machine, saga, CQRS, event sourcing |

**Difficulty:** Expert.

**Scenario ideas (system design):**
- Day 81: Design a rate limiter for an API that allows 100 requests/user/minute. What algorithms exist? (Token bucket, leaky bucket, sliding window.)
- Day 82: How would you generate a unique short URL? Walk through the entire system design.
- Day 83: A notification service must send 10M push notifications per day. How do you scale it?

**Pattern questions should include:**
- Violation example (wrong code) + corrected code for SOLID days.
- UML-like structure description + Java implementation for design pattern days.

**Coding questions:**
- Day 77: Show SRP violation in a class, then refactor.
- Day 78: Implement thread-safe Singleton with double-checked locking.
- Day 79: Implement Decorator pattern for a text transformer (uppercase, trim, prefix).
- Day 80: Implement Strategy pattern for sorting algorithm selection.

---

### Phase 10 — Testing, Performance & Mocks (days 85–90)

| Day | Topic | Suggested Focus |
|-----|-------|----------------|
| 85 | JUnit 5 & Mockito | @Test, assertions, @Mock, @InjectMocks, verify |
| 86 | Spring Testing & Testcontainers | @SpringBootTest, @WebMvcTest, @DataJpaTest, Testcontainers |
| 87 | Contract Testing & Advanced Testing | Pact, consumer-driven contracts, mutation testing |
| 88 | JVM Performance & Profiling | JMH benchmarking, heap dumps, GC tuning, async-profiler |
| 89 | System Design Case Study + Behavioral | End-to-end design review, STAR method answers |
| 90 | Full Mock Interview Simulation | Mixed questions across all topics |

**Difficulty:** Expert.

**Scenario ideas:**
- Day 85: A team mocks the database in all tests. Tests pass but the migration to PostgreSQL breaks production. What went wrong? What should they have done?
- Day 86: What is the difference between @SpringBootTest and @WebMvcTest? When do you use each?
- Day 88: Your application has a 10-second GC pause every 5 minutes. What GC algorithm is likely in use? How do you diagnose and fix it?

**Coding questions:**
- Day 85: Write a JUnit 5 test class for a `UserService.findById()` that mocks `UserRepository`.
- Day 86: Write a `@WebMvcTest` for a REST controller that returns a 404 for unknown IDs.
- Day 88: Write a JMH benchmark comparing `String +` vs `StringBuilder` for 1000 concatenations.

---

## Quality Checklist for Each Day

- [ ] Question titles are concise and specific (not generic like "Question 1")
- [ ] Hints are useful but don't give the answer away (3 hints per question)
- [ ] Solutions are thorough with markdown formatting (headers, code blocks, tables where appropriate)
- [ ] Coding questions have `codeTemplate` with clear TODOs
- [ ] `expectedOutput` is exact (matches what the solution code would print)
- [ ] Question IDs follow `d{day}q{1-4}` pattern
- [ ] Points sum to exactly 100 per day
- [ ] Difficulty is appropriate for the phase
- [ ] Solutions explain the WHY, not just the WHAT

---

## Example Already Done

See `assignments_phase1.json` (days 1–9) and `assignments_phase2.json` (days 10–18)
for the exact structure, tone, and depth expected.

Key things to match:
- Solution depth (2–10 lines of explanation + code block where needed)
- Hint quality (3 per question, each a single actionable clue)
- Scenario realism (real interview or production scenarios)
- Code that is self-contained and compiles

---

## How to Generate

For each phase, create one JSON file. Process days in order within the phase.
Match the structure exactly — the app's TypeScript types validate the JSON at runtime.

The TypeScript interface being satisfied is:

```typescript
interface AssignmentFile {
  phase: number;
  title: string;
  assignments: Record<string, AssignmentSection>;
}

interface AssignmentSection {
  type: 'assignment';
  title: string;
  description: string;
  totalPoints: number;
  questions: AssignmentQuestion[];
}

interface AssignmentQuestion {
  id: string;
  type: 'conceptual' | 'scenario' | 'coding';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  title: string;
  question: string;
  hints: string[];
  solution: string;
  codeTemplate?: string;   // coding type only
  expectedOutput?: string; // coding type only
  points: number;
}
```
