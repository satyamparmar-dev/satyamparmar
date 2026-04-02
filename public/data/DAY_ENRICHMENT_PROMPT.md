# Day Content Enrichment — Cursor AI Prompt

## How to use this in Cursor

1. Open Cursor in this repo root
2. Open the Composer panel (`Ctrl+I` or `Cmd+I`)
3. Paste the **"Cursor Prompt"** section below
4. Fill in the Day number at the bottom
5. Cursor will read the referenced files and rewrite both day files in-place

---

## Cursor Prompt

```
You are enriching the Java Interview Mastery app (Satyverse by Satyam Parmar).

## Files to read first (context)

@public/data/days/phase6-day49.json          ← GOLD STANDARD for phase/day files
@public/data/days/scenarioDrill-day49.json   ← GOLD STANDARD for scenarioDrill files

Read both files completely before writing anything. Every section you produce
must match that depth, length, and quality.

## Phase source files — read the one for your target day

These contain the official topic list and existing shallow content per day:

@public/data/phase1.json    ← Days 1–9
@public/data/phase2.json    ← Days 10–18
@public/data/phase3.json    ← Days 19–27
@public/data/phase4.json    ← Days 28–37
@public/data/phase5.json    ← Days 38–48
@public/data/phase6.json    ← Days 49–58
@public/data/phase7.json    ← Days 59–67
@public/data/phase8.json    ← Days 68–76
@public/data/phase9.json    ← Days 77–84
@public/data/phase10.json   ← Days 85–90

From the phase file for your target day, read:
- The day's `title`, `tags`, `prerequisites`, `learningObjectives`
- Any existing section content worth preserving or building on

## Target day files to REWRITE (overwrite completely)

@public/data/days/phase{N}-day{D}.json
@public/data/days/scenarioDrill-day{D}.json

Replace ALL content in both files. Keep the same JSON key names and section order
as the gold standard. Do not add new top-level keys.

---

## phase{N}-day{D}.json — required sections in order

### 1. type: "why"
- 4–5 flowing paragraphs, NO bullet lists
- Paragraph 1: what goes wrong in production when this topic is mishandled (real failure)
- Paragraph 2: what interviewers are actually testing (not just API knowledge)
- Paragraph 3: what a 4-step strong answer looks like for this specific topic
- Paragraph 4: why this topic matters at scale / across teams
- Paragraph 5: the operational behavior that distinguishes a senior answer

### 2. type: "theory"
- Minimum 8 numbered `###` sections in markdown
- Must include: formal definition, internals/mechanism, 3–4 most-probed interview angles,
  Java/Spring practical mapping, comparison table where relevant, 60-second story to tell in interview
- Include `**Interview angle:**` callouts inside relevant sections

### 3. type: "code" — exactly 3 entries

**Rules for all 3 code sections:**
- `"language": "java"`, standalone `main()`, compiles without Spring on classpath
- Spring/framework patterns shown as `//` comment lines in the code
- `"output"` field = exact stdout the code prints — trace it yourself before writing
- NEVER use Math.random(), System.currentTimeMillis(), hashCode(), UUID.randomUUID(),
  or any non-deterministic value — output must be 100% reproducible

**Basic (40–60 lines):**
- Prints a reference table, property matrix, or comparison of named options
- All output is static strings — no computation needed to verify

**Intermediate (70–100 lines):**
- Simulates a real mechanism from this topic (cache, state machine, event log, pool, etc.)
- main() runs 4 labelled scenarios: happy path, retry/replay, failure/edge case, summary rules
- Label with `--- Scenario N: description ---` or `=== SECTION ===` headers in output

**Advanced (100–130 lines):**
- Defines a `record` or inner class for a standard format from this topic
- Implements a real algorithm or decision logic from this topic
- Ends with a decision reference table printed via System.out.println
- Output structured in 3 clearly separated blocks

### 4. type: "diagram"
- PlantUML (`@startuml` ... `@enduml`) showing the data/request flow through
  real infrastructure components relevant to this topic
- `"description"`: 1–2 sentences explaining what the diagram shows

### 5. type: "pitfalls"
- Exactly 8 items (array of strings)
- Each string: one full sentence naming the mistake + why it breaks in production
- Must be real mistakes engineers hit on real projects, not textbook warnings

### 6. type: "exercise"
- `"problem"`: real-world scenario with 4+ numbered requirements, directly about today's topic
- `"hints"`: exactly 3 strings, each a single actionable clue (does not give away the answer)
- `"solution"`: full Java code, `package arch.day{D};`, compiles and runs,
  directly solves the exercise problem, comments explain every design decision

### 7. type: "interview"

`"conceptual"` — 15 Q&A objects:
- answer: minimum 3 sentences, bold key terms, explains WHY not just WHAT,
  includes Java/Spring practical angle, real production consequence

`"codeBased"` — 10 Q&A objects:
- answer: actual Spring/Java code as `//` comment lines (8–15 lines per answer),
  showing annotation + method signature + response/output

`"seniorScenario"` — 6 Q&A objects:
- answer: minimum 150 words, structured as **(1) Immediate response, (2) Root cause,
  (3) Fix, (4) Prevention**. Bold those labels.

`"wrongAnswers"` — 8 strings:
- Format: `"Wrong claim — correction explaining why it is wrong"`
- Must be topic-specific misconceptions that sound plausible

### 8. type: "cheatsheet"
- Markdown table, 10 rows
- Columns: `Topic | Rule of thumb | Interview one-liner`

---

## scenarioDrill-day{D}.json — required structure

Top-level fields: `"day"`, `"title"`, `"phaseId"`, `"tags"`, `"scenarios"`

Exactly 10 scenario objects. Each:
```json
{
  "id": "d{D}-s{N}",
  "question": "...",
  "signals": ["keyword1", "keyword2", "keyword3", "keyword4"],
  "answer": "...",
  "followUps": [
    { "question": "...", "answer": "..." },
    { "question": "...", "answer": "..." }
  ]
}
```

Distribute 10 scenarios across these types (one each):
1. Code review critique — "This code does X — what's wrong?"
2. Production incident — "Users report Y — diagnose and fix"
3. Design choice — "Choose between A and B for use case Z"
4. Internal deep dive — "Explain how X works internally"
5. Trade-off analysis — "Pros/cons of X vs Y"
6. Gotcha — "This passes tests but fails in prod — why?"
7. Senior architectural — "Design system X for 10M users"
8. Security or correctness implication most engineers miss
9. Scale or performance angle
10. Misconception a new engineer might have

Quality bar:
- scenario answer: minimum 100 words, name root cause before fix, bold key terms
- followUp answer: minimum 60 words, genuinely deepens the scenario
- For incidents: name the monitoring/tooling that surfaces the problem
- For design choices: give a recommendation + justification + trade-off named

---

## JSON output rules
- Pure JSON only — no markdown fences around the output
- Escape all `"` inside string values as `\"`
- Newlines inside strings as `\n`
- No trailing commas anywhere

---

## NOW ENRICH DAY: ___

Day number   : 
Phase file   : @public/data/phase{N}.json
Day file     : @public/data/days/phase{N}-day{D}.json
Scenario file: @public/data/days/scenarioDrill-day{D}.json
```

---

## Quick reference — Day → File map

| Day | Read this phase file | Rewrite these day files |
|-----|----------------------|-------------------------|
| 1–9 | `@public/data/phase1.json` | `phase1-day{D}.json` + `scenarioDrill-day{D}.json` |
| 10–18 | `@public/data/phase2.json` | `phase2-day{D}.json` + `scenarioDrill-day{D}.json` |
| 19–27 | `@public/data/phase3.json` | `phase3-day{D}.json` + `scenarioDrill-day{D}.json` |
| 28–37 | `@public/data/phase4.json` | `phase4-day{D}.json` + `scenarioDrill-day{D}.json` |
| 38–48 | `@public/data/phase5.json` | `phase5-day{D}.json` + `scenarioDrill-day{D}.json` |
| 49–58 | `@public/data/phase6.json` | `phase6-day{D}.json` + `scenarioDrill-day{D}.json` |
| 59–67 | `@public/data/phase7.json` | `phase7-day{D}.json` + `scenarioDrill-day{D}.json` |
| 68–76 | `@public/data/phase8.json` | `phase8-day{D}.json` + `scenarioDrill-day{D}.json` |
| 77–84 | `@public/data/phase9.json` | `phase9-day{D}.json` + `scenarioDrill-day{D}.json` |
| 85–90 | `@public/data/phase10.json` | `phase10-day{D}.json` + `scenarioDrill-day{D}.json` |

## Full day → topic map

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

## Difficulty by phase

| Phase | Days | Difficulty |
|-------|------|------------|
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
