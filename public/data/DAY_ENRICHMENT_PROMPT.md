# Day Content Enrichment — Cursor AI Prompt

## How to use

1. Open Cursor → Composer (`Ctrl+I`)
2. Copy everything inside the triple-backtick block below
3. Fill in **Day number** and **Phase number** in the `NOW ENRICH DAY` section and substitute `{N}` / `{D}` in the paths
4. Send — Cursor reads the gold-standard files and writes both JSON files directly

---

## Cursor Prompt

```
════════════════════════════════════════════════════════
⛔  ABSOLUTE RULES — READ THIS BLOCK BEFORE ANYTHING ELSE
════════════════════════════════════════════════════════

OUTPUT = exactly TWO files, nothing else:
  • public/data/days/phase{N}-day{D}.json
  • public/data/days/scenarioDrill-day{D}.json

FORBIDDEN — do not create any of these:
  ✗  Python / shell / Node scripts  (.py  .sh  .mjs)
  ✗  Java source or class files      (.java  .class)
  ✗  Any folder, pipeline, or helper of any kind
  ✗  _verify/ or any other directory

For code "output" fields:
  → Trace the Java code line by line in your head
  → Write the exact stdout string directly into the JSON "output" field
  → Do NOT compile, run, or shell out

If you are tempted to create any file other than the two JSON targets — STOP.
You are done when both JSON files are saved. That is all.

════════════════════════════════════════════════════════


You are enriching the Java Interview Mastery app (Satyverse by Satyam Parmar).


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1 — READ THESE FILES FIRST (before writing a single character)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@public/data/days/phase6-day49.json          ← GOLD STANDARD — day file structure & depth
@public/data/days/scenarioDrill-day49.json   ← GOLD STANDARD — scenario drill structure & depth
@public/data/assignments_phase{N}.json       ← find assignments["{D}"] → drives the exercise section
@public/data/phase{N}.json                   ← get title / tags / prerequisites / learningObjectives

Read all four files completely. Every section you write must match Day 49's depth and length.
Your output must be at least as long and detailed as the gold-standard files.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 2 — WRITING VOICE (apply to every prose field)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Target reader: a strong intermediate Java developer preparing for senior interviews.

DO:
  • Short sentences. One main idea per sentence.
  • Name the real thing that breaks in production before naming the concept.
  • Bold key interview terms on first use and pair with a plain-English definition or tiny example.
  • For operational topics (HTTP, DB, Kafka, K8s, cloud) include numbered steps and/or real
    CLI commands (curl, kubectl, kafka-console-consumer, redis-cli, psql, etc.) where they fit.
  • Teach first, then be precise — clarity beats clever wording.

DON'T:
  • Three abstract nouns in a row without a concrete hook (symptom, fix, tool, story).
  • Vague conclusions like "this is important" — always say what breaks if you skip it.
  • Jargon that isn't needed for the interview angle being covered.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 3 — WRITE phase{N}-day{D}.json
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Top-level keys (same order and names as `phase6-day49.json`, no extra keys):
  day · title · estimatedHours · difficulty · level · track · tags · prerequisites · learningObjectives · sections

Note: `phase{N}-day{D}.json` does **not** use top-level `phaseId` (that field lives on `scenarioDrill-day{D}.json` only).

Interview extension vs gold day-49 file: preserve every other shape from the gold file; each object in
`interview.conceptual`, `interview.codeBased`, and `interview.seniorScenario` **adds** a `followUps` array
(exactly 2 items) as specified in SECTION 7 — legacy JSON may omit these until a day is refreshed.


── SECTION 1  type: "why" ──────────────────────────────

4–5 flowing paragraphs. NO bullet lists.

  Para 1 — Production failure: what breaks when this topic is handled badly (real incident, real symptom)
  Para 2 — What the interviewer is actually testing (not just API recall)
  Para 3 — The 4-step strong answer pattern for this specific topic
  Para 4 — Why this matters at scale and across teams
  Para 5 — The one thing that separates a senior answer from a mid-level answer

Voice: concrete and readable; name symptoms and fixes before naming abstractions.


── SECTION 2  type: "theory" ───────────────────────────

Minimum 8 numbered ### sections in Markdown.

Required coverage:
  • Formal definition (plain English + precise)
  • Internal mechanism (how it actually works)
  • 3–4 most-probed interview angles, each with an **Interview angle:** callout
  • Java/Spring practical mapping
  • Comparison table where relevant (use Markdown pipe tables)
  • "60-second story" — one paragraph you can say out loud in an interview

Voice: teach each idea in plain language, then sharpen with precision; table rows must be scannable.


── SECTION 3  type: "code"  (exactly 3 entries) ────────

Rules for ALL 3 code blocks:
  • "language": "java"
  • Standalone main() — compiles without Spring on the classpath
  • Spring/framework patterns shown as // comment lines only
  • "output" = exact stdout — trace it mentally, write it as a string, never run it
  • NO Math.random(), System.currentTimeMillis(), hashCode(), UUID.randomUUID()
    (output must be 100% reproducible)

BASIC (40–60 lines):
  Purpose: print a reference table, property matrix, or option comparison
  Output: static strings only — easy to trace by eye

INTERMEDIATE (70–100 lines):
  Purpose: simulate a real mechanism from this topic (cache, state machine, event log, pool, etc.)
  Structure: main() runs exactly 4 labelled scenarios
  Output labels: "--- Scenario N: description ---" or "=== SECTION ===" headers

ADVANCED (100–130 lines):
  Purpose: implement real algorithm or decision logic from this topic
  Structure: define a record or inner class; end with a printed decision reference table
  Output: 3 clearly separated blocks


── SECTION 4  type: "diagram" ──────────────────────────

PlantUML (@startuml … @enduml) showing request/data flow through real infrastructure
components for this topic.
"description": 1–2 sentences explaining what the diagram shows.


── SECTION 5  type: "pitfalls" ─────────────────────────

Exactly 8 strings (array).
Each string: one full sentence — the mistake + why it breaks in production.
Real engineering mistakes from real projects; not textbook bullet points.


── SECTION 6  type: "exercise"  ← MUST align with assignments file ──

Source of truth: open @public/data/assignments_phase{N}.json,
find assignments["{D}"] (string key), read its questions array.
The exercise must implement the coding or primary scenario question from that entry.

  "problem":   Real-world scenario with 4+ numbered requirements.
               Must match the assignment's scenario, constraints, and deliverable.
               Not a generic stub. Not just the topic name printed.

  "hints":     Exactly 3 strings. Each is one actionable clue that does NOT give away the answer.

  "solution":  Full Java code, package arch.day{D};
               main() runs with deterministic output.
               Comments explain every design decision.
               Opening class Javadoc references the assignment goal.


── SECTION 7  type: "interview" ────────────────────────

Every object in conceptual / codeBased / seniorScenario includes:
  question  ·  answer  ·  followUps  (array of exactly 2 objects, each with question + answer)

▸ "conceptual"  — 15 objects

  answer:    Minimum 3 sentences. Bold key terms. Explains WHY not just WHAT.
             Java/Spring angle where relevant. Real production consequence named.
  followUps: 2 objects. Each answer: minimum 60 words.
             Deepen the topic — edge case, failure mode, comparison, "what next in prod?".
  Commands:  For operational topics include numbered steps and/or example CLI commands
             (curl, kubectl, kafka-console-consumer, redis-cli, psql, aws CLI, JVM flags,
             header names, metric names) in the main answer OR at least one follow-up —
             only when they fit the day's topic naturally.

▸ "codeBased"  — 10 objects

  answer:    8–15 // comment lines showing annotation + method signature + response/output.
  followUps: 2 objects. At least one pushes a variant (error handling, security,
             idempotency, performance). Answers may use more // code lines and/or
             a curl / httpie one-liner as comments.

▸ "seniorScenario"  — 6 objects

  answer:    Minimum 150 words.
             Structured as: **(1) Immediate response  (2) Root cause  (3) Fix  (4) Prevention**
             Bold all four labels.
             Under (3) and/or (4) include numbered steps or example commands a senior
             would actually run (canary, rollback, migration order, verification query)
             where the scenario warrants it.
  followUps: 2 objects. Each answer: minimum 60 words.
             Second-order effects — rollback plan, SLO impact, cost, team process.

▸ "wrongAnswers"  — 8 strings

  Format: "Wrong claim — correction explaining why it is wrong"
  Must be topic-specific misconceptions that sound plausible to a candidate.


── SECTION 8  type: "cheatsheet" ───────────────────────

Markdown pipe table, exactly 10 rows.
Columns: Topic | Rule of thumb | Interview one-liner


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 4 — WRITE scenarioDrill-day{D}.json
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Top-level keys: day · title · phaseId · tags · scenarios

Exactly 10 scenario objects. Each object:
  {
    "id":       "d{D}-s{N}",
    "question": "...",
    "signals":  ["keyword1", "keyword2", "keyword3", "keyword4"],
    "answer":   "...",
    "followUps": [
      { "question": "...", "answer": "..." },
      { "question": "...", "answer": "..." }
    ]
  }

Distribute one scenario per type:
  1  Code review critique     — "This code does X — what's wrong?"
  2  Production incident      — "Users report Y — diagnose and fix"
  3  Design choice            — "Choose between A and B for use case Z"
  4  Internal deep dive       — "Explain how X works internally"
  5  Trade-off analysis       — "Pros/cons of X vs Y"
  6  Gotcha                   — "This passes tests but fails in prod — why?"
  7  Senior architectural     — "Design system X for 10M users"
  8  Security / correctness   — implication most engineers miss
  9  Scale / performance      — specific bottleneck or optimisation
  10 Misconception            — wrong belief a new engineer might hold

Quality bar:
  • scenario answer:   minimum 100 words; name root cause before fix; bold key terms
  • followUp answer:   minimum 60 words; genuinely deepens the scenario (not a summary)
  • Production incident: name the specific monitoring tool / metric / log that surfaces it
  • Design choice:       give a recommendation + justification + at least one trade-off named
  • Operational scenarios: include numbered steps and/or example commands where they fit


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 5 — JSON FORMATTING RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  • Pure JSON — no markdown fences around the output
  • Escape all " inside strings as \"
  • Newlines inside strings as \n
  • No trailing commas anywhere
  • Write the complete file content directly to the target path — do not print to chat


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRE-FLIGHT CHECKLIST (run through this before saving)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  □  Did I read phase6-day49.json fully before writing?
  □  Did I read assignments_phase{N}.json and use assignments["{D}"] for the exercise?
  □  Every interview Q&A has exactly 2 followUps objects?
  □  All 3 code sections have a non-empty "output" field traced by hand?
  □  No Math.random / currentTimeMillis / hashCode / UUID.randomUUID in any code section?
  □  Exactly 8 pitfalls?
  □  Exactly 10 scenarios in the drill file?
  □  exercise.solution is a real implementation (not a stub that just prints the topic name)?
  □  Only 2 files created or modified?


════════════════════════════════════════════════════════
NOW ENRICH DAY  ← fill in day / phase, replace {N} and {D} in paths, then send
════════════════════════════════════════════════════════

Day number   :
Phase number :
Phase file   : @public/data/phase{N}.json
Assignments  : @public/data/assignments_phase{N}.json
Day file     : public/data/days/phase{N}-day{D}.json
Scenario file: public/data/days/scenarioDrill-day{D}.json
```

---

## Quick reference — Day → Phase file

| Days | Phase file | Day file prefix |
|------|-----------|-----------------|
| 1–9 | `phase1.json` | `phase1-day{D}` |
| 10–18 | `phase2.json` | `phase2-day{D}` |
| 19–27 | `phase3.json` | `phase3-day{D}` |
| 28–37 | `phase4.json` | `phase4-day{D}` |
| 38–48 | `phase5.json` | `phase5-day{D}` |
| 49–58 | `phase6.json` | `phase6-day{D}` |
| 59–67 | `phase7.json` | `phase7-day{D}` |
| 68–76 | `phase8.json` | `phase8-day{D}` |
| 77–84 | `phase9.json` | `phase9-day{D}` |
| 85–90 | `phase10.json` | `phase10-day{D}` |

## Day → Topic map

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
