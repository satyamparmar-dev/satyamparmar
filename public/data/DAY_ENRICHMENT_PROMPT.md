# Day Content Enrichment Prompt

## What this is

All 90 day files already exist with shallow/generated content.
This prompt tells you how to **fully rewrite** a day to Day 49's quality level.

Day 49 is the gold standard:
- `public/data/days/phase6-day49.json`
- `public/data/days/scenarioDrill-day49.json`

Read those two files first before generating anything.

---

## Complete File Map

Every day maps to exactly two files:

| Days | Phase file prefix | scenarioDrill file |
|------|-------------------|--------------------|
| 1–9  | `phase1-day{D}.json` | `scenarioDrill-day{D}.json` |
| 10–18 | `phase2-day{D}.json` | `scenarioDrill-day{D}.json` |
| 19–27 | `phase3-day{D}.json` | `scenarioDrill-day{D}.json` |
| 28–37 | `phase4-day{D}.json` | `scenarioDrill-day{D}.json` |
| 38–48 | `phase5-day{D}.json` | `scenarioDrill-day{D}.json` |
| 49–58 | `phase6-day{D}.json` | `scenarioDrill-day{D}.json` |
| 59–67 | `phase7-day{D}.json` | `scenarioDrill-day{D}.json` |
| 68–76 | `phase8-day{D}.json` | `scenarioDrill-day{D}.json` |
| 77–84 | `phase9-day{D}.json` | `scenarioDrill-day{D}.json` |
| 85–90 | `phase10-day{D}.json` | `scenarioDrill-day{D}.json` |

Full day → topic map:

| Day | Phase | Topic |
|-----|-------|-------|
| 1 | 1 | Introduction to Java — JDK vs JRE vs JVM |
| 2 | 1 | Java Basics — Data Types, Variables, Operators |
| 3 | 1 | Control Flow — if/else, switch, loops |
| 4 | 1 | Methods and Scope |
| 5 | 1 | Arrays and Strings |
| 6 | 1 | OOP — Classes, Objects, Constructors |
| 7 | 1 | OOP — Inheritance and Polymorphism |
| 8 | 1 | OOP — Abstract Classes and Interfaces |
| 9 | 1 | Exception Handling |
| 10 | 2 | Collections — List and ArrayList |
| 11 | 2 | Collections — LinkedList, Stack, Queue |
| 12 | 2 | Collections — Set and HashSet |
| 13 | 2 | Collections — Map and HashMap |
| 14 | 2 | Iterators and for-each |
| 15 | 2 | Java 8 — Lambda and Streams basics |
| 16 | 2 | Java 8 — Optional and method references |
| 17 | 2 | File I/O and Serialization |
| 18 | 2 | Multithreading basics |
| 19 | 3 | Complexity Analysis |
| 20 | 3 | Arrays and Two Pointers |
| 21 | 3 | Linked Lists |
| 22 | 3 | Stacks and Queues |
| 23 | 3 | HashMaps and Hashing |
| 24 | 3 | Trees |
| 25 | 3 | Heaps and Priority Queues |
| 26 | 3 | Sorting and Binary Search |
| 27 | 3 | Dynamic Programming Basics |
| 28 | 4 | Generics Deep Dive |
| 29 | 4 | Lambda and Functional Interfaces |
| 30 | 4 | Streams API |
| 31 | 4 | Optional and Modern Java APIs |
| 32 | 4 | Java 17 Records and Sealed Classes |
| 33 | 4 | Pattern Matching and Switch Expressions |
| 34 | 4 | Concurrency Foundations |
| 35 | 4 | Advanced Concurrency |
| 36 | 4 | CompletableFuture and Virtual Threads |
| 37 | 4 | JVM Internals and GC |
| 38 | 5 | Spring Core — IoC and DI |
| 39 | 5 | Spring Bean Lifecycle and Advanced DI |
| 40 | 5 | Spring AOP |
| 41 | 5 | Spring MVC and REST |
| 42 | 5 | Spring Boot Internals |
| 43 | 5 | Spring Boot Config and Actuator |
| 44 | 5 | Spring Data JPA and Hibernate |
| 45 | 5 | Spring Data Transactions and Locking |
| 46 | 5 | Spring Security — Authentication |
| 47 | 5 | Spring Security — OAuth2 and Authorisation |
| 48 | 5 | Spring WebFlux and Reactive |
| 49 | 6 | REST API Design Principles ← GOLD STANDARD |
| 50 | 6 | REST Best Practices and OpenAPI |
| 51 | 6 | Microservices Principles and DDD |
| 52 | 6 | Service Discovery and API Gateway |
| 53 | 6 | Feign, WebClient and Resilience |
| 54 | 6 | gRPC and GraphQL |
| 55 | 6 | Inter-Service Communication Patterns |
| 56 | 6 | Saga Pattern and Distributed Transactions |
| 57 | 6 | CQRS and Event Sourcing |
| 58 | 6 | Advanced Microservices Patterns |
| 59 | 7 | Kafka Architecture |
| 60 | 7 | Kafka Producers Deep Dive |
| 61 | 7 | Kafka Consumers Deep Dive |
| 62 | 7 | Delivery Semantics and EOS |
| 63 | 7 | Kafka Streams |
| 64 | 7 | Schema Registry and Kafka Connect |
| 65 | 7 | Spring Kafka |
| 66 | 7 | RabbitMQ and AWS Messaging |
| 67 | 7 | Distributed Systems Theory |
| 68 | 8 | Advanced SQL |
| 69 | 8 | Transactions and Connection Pooling |
| 70 | 8 | NoSQL — MongoDB and Cassandra |
| 71 | 8 | Redis — Caching and Advanced Patterns |
| 72 | 8 | Docker for Java Applications |
| 73 | 8 | Kubernetes Core |
| 74 | 8 | Kubernetes Advanced and Helm |
| 75 | 8 | AWS for Java Developers |
| 76 | 8 | CI/CD and Observability |
| 77 | 9 | SOLID and Clean Architecture |
| 78 | 9 | Design Patterns — Creational |
| 79 | 9 | Design Patterns — Structural |
| 80 | 9 | Design Patterns — Behavioral |
| 81 | 9 | System Design Fundamentals |
| 82 | 9 | System Design — URL Shortener |
| 83 | 9 | System Design — Notification Service |
| 84 | 9 | System Design — E-commerce Order Service |
| 85 | 10 | JUnit 5 and Mockito |
| 86 | 10 | Spring Testing and Testcontainers |
| 87 | 10 | Contract Testing and Advanced Testing |
| 88 | 10 | JVM Performance and Profiling |
| 89 | 10 | System Design Case Study and Behavioral |
| 90 | 10 | Full Mock Interview Simulation |

---

## Difficulty by Phase

| Phase | Days | Difficulty level for Q/A |
|-------|------|--------------------------|
| 1 | 1–9 | Beginner |
| 2 | 10–18 | Beginner → Intermediate |
| 3 | 19–27 | Intermediate |
| 4 | 28–37 | Intermediate → Advanced |
| 5 | 38–48 | Advanced |
| 6 | 49–58 | Advanced |
| 7 | 59–67 | Advanced |
| 8 | 68–76 | Advanced |
| 9 | 77–84 | Expert |
| 10 | 85–90 | Expert |

---

## Instructions

You will rewrite **two existing files** for a given day.
The files already have placeholder content — **replace everything** inside them.
Keep the exact same JSON key names and section order.

### Step 1 — Read the gold standard
Read `public/data/days/phase6-day49.json` and `public/data/days/scenarioDrill-day49.json`.
Match that depth exactly.

### Step 2 — Read the existing file
Read `public/data/days/phase{N}-day{D}.json` to get the current `title`, `tags`, `prerequisites`, `learningObjectives`, and any existing section content worth keeping.

### Step 3 — Rewrite both files

---

## phase{N}-day{D}.json — Section-by-Section Rules

### `"type": "why"` (1 section)
- 4–5 flowing paragraphs, NO bullet points
- Cover: what real production failures happen when this is done badly, what interviewers are actually testing (not just "do you know the API"), what a 4-step strong answer looks like for this topic

### `"type": "theory"` (1 section)
- Deep markdown, minimum 8 `###` numbered sections
- Include: formal definition/spec, internals, the 3–4 most-probed interview angles, Java/Spring practical mapping, a 60-second story you can tell in an interview
- Use tables where a comparison matrix helps

### `"type": "code"` — exactly 3 sections (basic, intermediate, advanced)

**All code rules:**
- Standalone `main()`, compiles without Spring on classpath
- Spring patterns shown as `//` comments with the annotation visible, but the `main()` simulates the same behavior using plain Java
- `"output"` must be the **exact** stdout — trace through the code character by character before writing it
- No `Math.random()`, `System.currentTimeMillis()`, `hashCode()`, or any non-deterministic output

**Basic** (40–60 lines):
- Prints a reference table, comparison matrix, or named examples
- All output is static strings — zero runtime computation needed to verify

**Intermediate** (70–100 lines):
- Simulates a real mechanism: a dedup store, cache, event log, state machine, connection pool, etc.
- `main()` covers 4 scenarios: happy path, retry/replay/edge case, failure case, summary rules
- Label each scenario with `--- Scenario N: label ---` or `=== Section ===` lines

**Advanced** (100–130 lines):
- A `record` or inner class for a standard format relevant to the topic
- A method that simulates a real algorithm from this topic
- A decision reference table printed at the end
- Output clearly structured in 3 distinct blocks

### `"type": "diagram"` (1 section)
- PlantUML showing the request/data flow through real infrastructure for this topic
- `"description"`: 1–2 sentences on what the diagram shows

### `"type": "pitfalls"` (1 section)
- Exactly 8 items
- Each item: one full sentence starting with the mistake, followed by why it breaks in production
- Must be things real engineers actually hit on real projects

### `"type": "exercise"` (1 section)
- `"problem"`: real-world scenario, 4+ numbered requirements, directly about today's topic
- `"hints"`: exactly 3 hints, each a single actionable clue
- `"solution"`: full Java code using `package arch.day{D};`, compiles and runs, directly solves the exercise problem, comments explain design decisions

### `"type": "interview"` (1 section)

**`"conceptual"` — 15 items:**
- Each answer: minimum 3 sentences, bold key terms, explains WHY not just WHAT, includes Java/Spring practical angle

**`"codeBased"` — 10 items:**
- Each answer: actual Spring code as `//` comment lines (8–15 lines), shows annotation + method signature + response headers + HTTP output

**`"seniorScenario"` — 6 items:**
- Each answer: minimum 150 words, structured as: (1) immediate response, (2) root cause, (3) fix, (4) prevention. Bold the labels.

**`"wrongAnswers"` — 8 strings:**
- Format: `"Wrong claim — correction"`
- Claims that sound plausible but are wrong, specific to this topic

### `"type": "cheatsheet"` (1 section)
- Markdown table with 10 rows
- Columns: `Topic | Rule of thumb | Interview one-liner`

---

## scenarioDrill-day{D}.json — Rules

Exactly **10 scenario objects**.

Each scenario:
```
{
  "id": "d{D}-s{1–10}",
  "question": "...",
  "signals": [ 4–6 technical keywords ],
  "answer": "...",          // minimum 100 words
  "followUps": [
    { "question": "...", "answer": "..." },   // minimum 60 words
    { "question": "...", "answer": "..." }
  ]
}
```

Distribute the 10 scenarios across these types:
1. Code review critique — "This code does X, what's wrong?"
2. Production incident — "Users report Y, diagnose and fix"
3. Design choice — "Choose between A and B for use case Z"
4. Internal deep dive — "Explain how X works internally"
5. Trade-off analysis — "Pros/cons of approach X vs Y"
6. Gotcha — "Works in tests, fails in prod — why?"
7. Senior architectural — "Design system X for 10M users"
8. Security/correctness implication most engineers miss
9. Scale/performance angle
10. Misconception a new engineer might have

**Answer quality bar:**
- Name the root cause before the fix
- Explain WHY the fix works
- Bold key terms
- For incidents: mention what monitoring surfaces the problem
- For design choices: give a recommendation AND justify it AND name the trade-off

---

## JSON Rules
- Valid JSON only, no markdown fences
- Escape `"` inside strings as `\"`
- Newlines in strings as `\n`
- No trailing commas

---

## Generate for Day: ___

Fill in:
- **Day number:** 
- **File to write:** `public/data/days/phase{N}-day{D}.json`
- **scenarioDrill file:** `public/data/days/scenarioDrill-day{D}.json`
- **Topic:**
- **Phase:** 
- **Difficulty:**
- **Key concepts to cover:** (4–6 bullets)
- **What the intermediate code should simulate:** 
- **What the advanced code should combine:**
- **Production failure story for the "why" section:**
- **Exercise problem scenario:**
