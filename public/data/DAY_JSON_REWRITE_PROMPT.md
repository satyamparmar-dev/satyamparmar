# Day JSON Rewrite — Cursor AI Prompt

## How to use

1. Open Cursor → Composer (`Ctrl+I`)
2. Copy everything inside the triple-backtick block below
3. Fill in the **six fields** in the `TARGET` section at the bottom
4. Send — Cursor reads the gold standard and writes the target file directly

> **Gold standard**: `public/data/days/phase5-day38.json` — the enhanced version.
> Every count, word target, and rule below is derived from measuring that file.
> Your output must match or exceed it.

---

## Cursor Prompt

```
════════════════════════════════════════════════════════════════
⛔  ABSOLUTE RULES — READ BEFORE ANYTHING ELSE
════════════════════════════════════════════════════════════════

OUTPUT = exactly ONE file, nothing else:
  • public/data/days/phase{N}-day{D}.json

FORBIDDEN:
  ✗  Do NOT create any Python / shell / Node scripts (.py .sh .mjs)
  ✗  Do NOT create any Java source or class files (.java .class)
  ✗  Do NOT create any folder, pipeline, helper, or README of any kind
  ✗  Do NOT print the JSON to chat — write it directly to the file
  ✗  Do NOT add markdown fences around the JSON output
  ✗  Do NOT use Math.random(), System.currentTimeMillis(), hashCode(), UUID.randomUUID()
     in any code section — output must be 100% reproducible on every run

For code "output" fields:
  → Trace the Java code line by line in your head
  → Write the exact stdout string directly into the JSON "output" field
  → Do NOT compile, run, or shell out — mental execution only

You are done when the single JSON file is saved. That is all.

════════════════════════════════════════════════════════════════


You are writing a day content file for the Satyverse Java Interview Mastery app.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1 — READ THESE FILES FIRST (before writing a single character)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@public/data/days/phase5-day38.json        ← GOLD STANDARD — read this completely
@public/data/assignments_phase{N}.json     ← find assignments["{D}"] → drives the exercise
@public/data/phase{N}.json                 ← get title / tags / prerequisites / learningObjectives

Read ALL three files completely before writing a single character.
phase5-day38.json is your minimum bar, not your ceiling.
Every section you write must match or exceed it in depth, length, and language quality.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 2 — UNDERSTAND THE GOLD STANDARD (phase5-day38.json)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Study what makes phase5-day38.json the gold standard.
Exact measured counts from that file are shown in [brackets].
These are the minimum counts for your output — match or exceed every one.


────────────────────────────────────────────────────────────────
WHY SECTION  [6 paragraphs · 610+ words · zero bullet lists]
────────────────────────────────────────────────────────────────

Write exactly 6 flowing prose paragraphs. NO bullet lists anywhere in this section.

  Para 1 — Production failure:
    Name a real symptom that surfaces in prod when this topic is mishandled.
    State the environment (microservice, batch job, monolith, distributed system).
    State when in the lifecycle the failure appears (startup, first request, peak load, deploy).

  Para 2 — What the interviewer is testing:
    Not API recall. The interviewer wants mechanism understanding.
    Name the specific mental model gap that separates a strong answer from a weak one.

  Para 3 — 4-step pattern for a strong answer:
    Numbered or inline four steps specific to this day's topic.
    This is a coaching note to the learner, not a definition.

  Para 4 — Why it matters at scale:
    Describe what breaks across teams of 10+ engineers or 50+ microservices.
    Name concrete failure modes — not abstract "scalability concerns".

  Para 5 — What marks a senior answer:
    One specific thing a senior says that a mid-level candidate omits.
    Example: mentions the three-level singleton cache, names a specific JVM behavior, quotes a Spring Boot version change.

  Para 6 — Daily-job angle:
    How this topic shows up in normal engineering work — code review, on-call debugging, PR feedback, migration decisions.
    Ground it in a realistic scenario a developer encounters in the first 6 months at a new job.

Minimum: 600 words. Aim for 700–800.


────────────────────────────────────────────────────────────────
THEORY SECTION  [15 ### sections · 2600+ words · 8+ Interview angle callouts · 3+ tables]
────────────────────────────────────────────────────────────────

Write at least 13 numbered ### sections. Day 38 has 15; match it.

Required structure across those sections:

  §1–§3:  Core definitions and mechanisms.
          Formal definition (plain English + precise). Internal step-by-step mechanism.
          At least one section shows what happens inside the JVM or framework source.

  §4–§6:  Real production behaviors.
          What changes at scale, what fails, what's misconfigured.
          At least one Markdown pipe table comparing options, variants, or behaviors.

  §7–§9:  Advanced internals.
          Deep mechanism — Spring source code level. Algorithm, cache, proxy chain.
          At least one more Markdown pipe table.

  §10–§13: Topic-specific extensions.
          Cover the 3–4 advanced sub-topics that distinguish senior candidates.
          Examples for Spring IoC/DI day: three-level singleton cache, FactoryBean<T>,
          @Import variants, @DependsOn and SmartInitializingSingleton.
          Each of these sections has at least one **Interview angle:** callout paragraph.

  Final §: "60-second story"
          One paragraph you can say out loud in an interview.
          Covers: what it is → mechanism → production consequence → fix → verification.

Rules:
  • Bold every key term on its FIRST use in the theory section
  • At least 8 **Interview angle:** callout paragraphs across all sections [day38 has 8]
  • At least 3 Markdown pipe tables [day38 has tables across 3 different sections]
  • Use exact Java/Spring class names (e.g., DefaultListableBeanFactory, SmartInitializingSingleton)
  • Include short Java snippets inside theory where they clarify mechanism — keep each under 15 lines
  • Minimum 2600 words. Aim for 3000–3500.


────────────────────────────────────────────────────────────────
CODE SECTION  [3 entries: basic · intermediate · advanced]
────────────────────────────────────────────────────────────────

All three entries:
  • Standalone main() — compiles without Spring, Spring patterns shown as // comments
  • "output" field = exact stdout traced mentally, verified line by line
  • No Math.random(), currentTimeMillis(), hashCode(), UUID.randomUUID() anywhere
  • Package: package arch.day{D};
  • Filename: Day{D}Basic.java / Day{D}Intermediate.java / Day{D}Advanced.java

BASIC  [40–60 lines]
  Purpose: print a reference table, property matrix, or comparison of options for this topic.
  Output: static strings only — trivial to trace by eye.
  No loops over collections with dynamic state. Every printed line is hardcoded.

INTERMEDIATE  [70–100 lines]
  Purpose: simulate a real mechanism from this topic (not Hello World — a real scenario).
  Structure: main() runs exactly 4 labelled scenarios.
  Label format: "--- Scenario N: short description ---"
  Output: each scenario produces 3–6 printed lines showing the mechanism in action.
  The 4 scenarios must tell a story: normal case → variant → bug/mismatch → fix.

ADVANCED  [80–130 lines]
  Purpose: implement the core algorithm or decision logic from this topic.
  Structure: at least one inner class or record; ends with a printed decision reference table.
  Output: 3 clearly separated blocks with === or --- headers.
  The algorithm must be the one that the Spring framework or JVM actually runs
  (e.g., DFS cycle detection for circular deps, three-level cache lookup for singletons).


────────────────────────────────────────────────────────────────
DIAGRAM SECTION
────────────────────────────────────────────────────────────────

  • PlantUML @startuml … @enduml only — no Mermaid
  • Shows the request/data flow through real infrastructure components for this topic
  • "description": 1–2 sentences stating exactly what the diagram shows and why it matters
  • Sequence diagram preferred; activity diagram acceptable for non-request flows
  • At least 6 participants or components
  • Include at least one alt/loop block if the flow has a conditional or retry path


────────────────────────────────────────────────────────────────
PITFALLS SECTION  [exactly 8 strings]
────────────────────────────────────────────────────────────────

  • Exactly 8 strings — no more, no fewer
  • Format each string as: "Mistake — what breaks in production because of it — how to detect or fix it."
  • Real engineering mistakes from real projects — not textbook warnings
  • Never use vague phrases: "this can cause issues", "be careful with", "may lead to problems"
  • Always name: the specific symptom, the production impact, and the detection/fix hint
  • Example pattern: "Using field injection in @Component classes — the Spring proxy wraps
    the object but field injection bypasses the proxy, so @Transactional and @Async annotations
    silently do nothing; switch to constructor injection and the proxy wraps correctly."


────────────────────────────────────────────────────────────────
EXERCISE SECTION
────────────────────────────────────────────────────────────────

  • Source of truth: assignments_phase{N}.json → assignments["{D}"] → questions array
  • The problem must implement the coding or primary scenario from that entry — not a stub
  • "problem": real-world scenario with 4+ numbered requirements
  • "hints": exactly 3 strings, each an actionable clue that does not give away the answer
  • "solution": full Java code — package arch.day{D}; main() with deterministic output
                Javadoc comment references the assignment goal
                Inline comments explain every non-obvious design decision
                Output field traced line by line — exact stdout


────────────────────────────────────────────────────────────────
INTERVIEW SECTION  [17 conceptual · 12 codeBased · 6 seniorScenario · 8 wrongAnswers]
────────────────────────────────────────────────────────────────

▸ conceptual  [exactly 17 objects]  ← day38 has 17
  question:  Clear, specific question — not "what is X?" but "how does X work when Y?"
  answer:    Minimum 5 sentences. Bold key terms on first use. Explains WHY not just WHAT.
             Names a production consequence. Java/Spring class or annotation where relevant.
             Minimum 100 words per answer. [day38 avg: ~150 words]
  followUps: exactly 2 objects, each answer minimum 60 words
             Each deepens the topic — edge case, failure mode, comparison, production implication.
             Neither is a summary of the main answer.

▸ codeBased  [exactly 12 objects]  ← day38 has 12
  question:  "Show me how to..." or "What does this code do?" style
  answer:    8–15 // comment lines showing annotation + method signature + output/behavior
             Minimum 60 words of comment text
  followUps: exactly 2 objects
             At least one pushes a variant (error case, security, performance, idempotency, prod behavior)
             Answers may use // comment lines and/or a curl one-liner

▸ seniorScenario  [exactly 6 objects]
  question:  Production incident or architecture decision framing — not a definition question
  answer:    Minimum 200 words. [day38 avg: ~265 words]
             Structure MUST be:
               **(1) Immediate response** — what you do first when the incident hits
               **(2) Root cause** — the actual mechanism that caused the failure
               **(3) Fix** — numbered steps or real commands a senior would run
               **(4) Prevention** — process or config change so it never happens again
             Bold all four labels exactly as shown above.
  followUps: exactly 2 objects, each answer minimum 80 words [day38: ~112 words]
             Second-order effects — rollback plan, SLO impact, cost, org process change

▸ wrongAnswers  [exactly 8 strings]
  Format: "Wrong claim — correction explaining exactly why it is wrong and what actually happens."
  Must be topic-specific misconceptions that sound plausible to a mid-level candidate.
  Each string must contain both the wrong belief AND the correct mechanism.


────────────────────────────────────────────────────────────────
CHEATSHEET SECTION  [exactly 15 rows]  ← day38 has 15
────────────────────────────────────────────────────────────────

  • Markdown pipe table, exactly 15 data rows (plus 1 header + 1 separator = 17 lines total)
  • Columns: | Topic | Rule of thumb | Interview one-liner |
  • Each row covers one key concept from the day
  • "Interview one-liner": a single sentence you can say verbatim in an answer
  • The 15 rows must cover the breadth of the topic — basics through advanced sub-topics


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 3 — WRITING VOICE (apply to every prose field)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Target reader: a strong intermediate Java/Spring developer preparing for senior roles.

DO:
  • Short sentences. One main idea per sentence.
  • Name the production failure BEFORE naming the concept.
  • Bold every key interview term on its first use in each section.
  • For operational topics: include numbered steps and real CLI commands
    (curl, kubectl, jcmd, kafka-consumer-groups.sh, redis-cli, psql, aws CLI, JVM flags)
    in theory and interview answers — only where they fit naturally, never forced.
  • Teach the mechanism, then state the fix, then state how to verify it worked.
  • Code snippets in theory: Java or relevant config — keep each under 15 lines and purposeful.

DON'T:
  • Do not say "this is important" without saying what breaks.
  • Do not stack three abstract nouns without a concrete example.
  • Do not use passive voice when you can say who does what.
  • Do not pad answers: no "In conclusion", "As we can see", "To summarize", "It's worth noting".
  • Do not repeat the question in the answer.
  • Do not write a conceptual answer that is only a definition — always include a production consequence.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 4 — REQUIRED JSON STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Top-level keys (same order as gold standard, no extra keys):
{
  "day": {D},
  "title": "...",
  "estimatedHours": N,
  "difficulty": "...",
  "level": "...",
  "track": "...",
  "tags": ["...", ...],
  "prerequisites": ["Day N", ...],
  "learningObjectives": ["...", ...],
  "sections": [ ...10 objects in exact order below... ]
}

Note: phase{N}-day{D}.json does NOT have a top-level "phaseId" field.
      That field belongs only on scenarioDrill-day{D}.json.

Sections array — exactly 10 objects in this exact order:

  1. { "type": "why",      "title": "Why [Topic] matters",                "content": "..." }
  2. { "type": "theory",   "title": "Theory and Internals — [Topic]",     "content": "..." }
  3. { "type": "code",     "title": "Basic — ...",   "language": "java",  "filename": "Day{D}Basic.java",
       "level": "basic",   "description": "...", "code": "...", "output": "..." }
  4. { "type": "code",     "title": "Intermediate — ...", "language": "java", "filename": "Day{D}Intermediate.java",
       "level": "intermediate", "description": "...", "code": "...", "output": "..." }
  5. { "type": "code",     "title": "Advanced — ...", "language": "java", "filename": "Day{D}Advanced.java",
       "level": "advanced", "description": "...", "code": "...", "output": "..." }
  6. { "type": "diagram",  "title": "...", "diagramType": "sequence", "description": "...", "plantuml": "..." }
  7. { "type": "pitfalls", "title": "Common Pitfalls", "items": ["...", ...8 items...] }
  8. { "type": "exercise", "title": "Exercise — ...",
       "problem": "...", "hints": ["...", "...", "..."],
       "solution": { "language": "java", "filename": "Day{D}Exercise.java", "code": "...", "output": "..." } }
  9. { "type": "interview",
       "conceptual":     [ ...17 objects: question + answer + followUps(2)... ],
       "codeBased":      [ ...12 objects: question + answer + followUps(2)... ],
       "seniorScenario": [ ...6  objects: question + answer + followUps(2)... ],
       "wrongAnswers":   [ ...8  strings... ]
     }
  10. { "type": "cheatsheet", "title": "Cheatsheet", "content": "| Topic | Rule of thumb | Interview one-liner |\n|---|---|---|\n| ...15 rows... |" }

JSON rules:
  • Pure JSON — no markdown fences around the output
  • All structural double-quotes must be straight ASCII " (U+0022) — never curly/smart quotes
  • Escape all " inside string values as \"
  • Newlines inside string values as \n
  • No trailing commas anywhere
  • Write the complete file content directly to the target path — never print to chat


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 5 — QUALITY CHECKLIST (run through every item before saving)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  □  Did I read phase5-day38.json fully before writing?
  □  Did I read assignments_phase{N}.json and use assignments["{D}"] for the exercise?
  □  Did I read phase{N}.json and use the title, tags, prerequisites?

  WHY
  □  Exactly 6 paragraphs? No bullet lists?
  □  Minimum 600 words?
  □  Para 6 covers the daily-job / code-review / on-call angle?

  THEORY
  □  At least 13 numbered ### sections?
  □  At least 8 **Interview angle:** callout paragraphs?
  □  At least 3 Markdown pipe tables?
  □  Final section is a "60-second story" paragraph?
  □  Minimum 2600 words?

  CODE
  □  Exactly 3 code entries (basic / intermediate / advanced)?
  □  All 3 have a non-empty "output" field traced by hand?
  □  No Math.random / currentTimeMillis / hashCode / UUID.randomUUID anywhere?
  □  Intermediate has exactly 4 labelled scenarios ("--- Scenario N: ... ---")?
  □  Advanced has exactly 3 separated blocks + a decision reference table?

  PITFALLS
  □  Exactly 8 pitfall strings?
  □  Each string names the mistake + production symptom + detection/fix hint?

  EXERCISE
  □  Problem has 4+ numbered requirements (not a stub)?
  □  Solution is a full implementation in package arch.day{D} with comments?
  □  Solution output field traced line by line?

  INTERVIEW
  □  Exactly 17 conceptual Q&As, each with exactly 2 followUps?
  □  Every conceptual answer minimum 100 words, names a production consequence?
  □  Exactly 12 codeBased Q&As, each with exactly 2 followUps?
  □  Exactly 6 seniorScenario Q&As, each answer minimum 200 words with 4 bold labels?
  □  Exactly 8 wrongAnswers strings (wrong claim + correction)?

  CHEATSHEET
  □  Exactly 15 data rows in the pipe table?

  FINAL
  □  JSON is valid — no trailing commas, no smart/curly quotes, all strings escaped?
  □  Only ONE file created or modified?
  □  File written directly to disk — nothing printed to chat?


════════════════════════════════════════════════════════════════
TARGET  ← fill in the six fields below, then send
════════════════════════════════════════════════════════════════

Day number   :
Phase number :
Topic        :
Phase file   : @public/data/phase{N}.json
Assignments  : @public/data/assignments_phase{N}.json
Output file  : public/data/days/phase{N}-day{D}.json
```

---

## Quick reference — exact count targets (from measured phase5-day38.json)

| Section | Exact count / minimum | Aim for |
|---|---|---|
| `why` paragraphs | **6** | 6 (exact) |
| `why` words | **600** | 700–800 |
| `theory` ### sections | **13+** | 15 |
| `theory` Interview angle callouts | **8+** | 10 |
| `theory` pipe tables | **3+** | 4–5 |
| `theory` words | **2600** | 3000–3500 |
| `code` basic (lines) | **40–60** | 50 |
| `code` intermediate (lines) | **70–100** | 90 |
| `code` advanced (lines) | **80–130** | 100 |
| `pitfalls` items | **8** (exact) | 8 |
| `interview.conceptual` Q&As | **17** (exact) | 17 |
| `interview.conceptual` answer | **100 words** | 150 words |
| `interview.codeBased` Q&As | **12** (exact) | 12 |
| `interview.seniorScenario` Q&As | **6** (exact) | 6 |
| `interview.seniorScenario` answer | **200 words** | 265 words |
| `interview.wrongAnswers` strings | **8** (exact) | 8 |
| `cheatsheet` rows | **15** (exact) | 15 |
| followUp answer | **60 words** | 80–120 words |
| total file size | **~180 KB** | 200–250 KB |

---

## Language rules (non-negotiable)

| Rule | Wrong | Right |
|---|---|---|
| Name the failure first | "This is bad practice" | "The pod restarts with OOMKilled because thread stacks exhaust container memory" |
| Bold on first use | `the cache grows unbounded` | `the **cache** grows unbounded` |
| One idea per sentence | "This causes issues because GC cannot free objects and heap fills up and OOM occurs" | "GC cannot free the objects. Heap fills up. OOM follows." |
| No filler | "As we can see from the above..." | *(just say the next thing)* |
| Production anchor | "This can cause problems" | "On-call gets paged when the 5xx rate crosses 1%" |
| WHY not WHAT | "Use constructor injection" | "Use constructor injection so missing deps fail at startup, not under production load" |
| No vague danger | "This is important to remember" | "Skip this and your @Transactional annotation silently does nothing" |
| Senior signal | Definition only | Definition + mechanism + failure mode + version-specific behavior |

---

## Code section rules (non-negotiable)

| Rule | What breaks if ignored |
|---|---|
| No `Math.random()` | Output differs per run — impossible to verify "output" field |
| No `hashCode()` | Output differs per JVM version and object layout |
| No `currentTimeMillis()` | Output is always wrong when run later |
| No `UUID.randomUUID()` | Same as Math.random — non-deterministic |
| Standalone `main()` | Without this, code cannot be mentally traced without a full project |
| Spring as `// comments` | Keeps file self-contained; readers see pattern without running Spring |
| Intermediate: exactly 4 labelled scenarios | Consistency across all days — learner always knows the file structure |
| Advanced: exactly 3 blocks + decision table | Same consistency; decision table is the highest-value interview artifact |
| `package arch.day{D};` | All solution code uses this package — consistent across all 90 days |

---

## Pitfall format rule

Each pitfall string must follow this pattern:
```
"Mistake description — production symptom that results — how to detect or fix it."
```
Example:
```
"Using field injection (@Autowired on a private field) in AOP-proxied beans — the proxy
wraps the class but Spring injects into the raw field on the target, bypassing the proxy for
@Transactional and @Async, so those annotations silently do nothing; switch to constructor
injection and the proxy wraps correctly at container startup."
```

---

## Section order (must match exactly)

| # | type | Key requirement |
|---|---|---|
| 1 | `why` | 6 paragraphs, no bullets, production failure first, daily-job angle last |
| 2 | `theory` | 13+ ### sections, 3+ tables, 8+ Interview angle callouts, 60-second story |
| 3 | `code` basic | Reference/comparison table, static strings, 40–60 lines |
| 4 | `code` intermediate | Mechanism simulator, exactly 4 scenarios, 70–100 lines |
| 5 | `code` advanced | Core algorithm, 3 blocks + decision table, 80–130 lines |
| 6 | `diagram` | PlantUML sequence/activity, 6+ participants, alt/loop block if applicable |
| 7 | `pitfalls` | Exactly 8 strings, each names mistake + symptom + detect/fix |
| 8 | `exercise` | Aligned to assignments file, full solution with package arch.day{D} |
| 9 | `interview` | 17 conceptual + 12 codeBased + 6 seniorScenario + 8 wrongAnswers |
| 10 | `cheatsheet` | Exactly 15-row pipe table: Topic / Rule of thumb / Interview one-liner |

---

## Day → Phase reference

| Days | Phase file | Day file prefix |
|---|---|---|
| 1–9 | `phase1.json` | `phase1-day{D}` |
| 10–18 | `phase2.json` | `phase2-day{D}` |
| 19–27 | `phase3.json` | `phase3-day{D}` |
| 28–37 | `phase4.json` | `phase4-day{D}` |
| 38–48 | `phase5.json` | `phase5-day{D}` ← gold standard day lives here |
| 49–58 | `phase6.json` | `phase6-day{D}` |
| 59–67 | `phase7.json` | `phase7-day{D}` |
| 68–76 | `phase8.json` | `phase8-day{D}` |
| 77–84 | `phase9.json` | `phase9-day{D}` |
| 85–90 | `phase10.json` | `phase10-day{D}` |
