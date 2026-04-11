# Satyverse Java Mastery — Cursor AI Course Day Prompt

## How to use

1. Open Cursor → Composer (`Ctrl+I`)
2. Copy everything between `=== PROMPT START ===` and `=== PROMPT END ===`
3. Fill in the **TARGET** section at the bottom with the day number
4. Send — Cursor reads the gold standard and writes the file directly

---

```
=== PROMPT START ===

════════════════════════════════════════════════════════════════
⛔  ABSOLUTE RULES — READ BEFORE ANYTHING ELSE
════════════════════════════════════════════════════════════════

OUTPUT = exactly ONE file, nothing else:
  • public/data/days/phase{N}-day{D}.json

FORBIDDEN:
  ✗  Do NOT create .py / .sh / .mjs / .java / .class files
  ✗  Do NOT create any folder, README, or helper file
  ✗  Do NOT print the JSON to chat — write it directly to the file
  ✗  Do NOT wrap the JSON in markdown fences
  ✗  Do NOT use Math.random(), System.currentTimeMillis(), hashCode(), UUID.randomUUID()
     in any code section — output must be 100% reproducible on every run

JSON encoding (critical — get this wrong and the app breaks):
  → All structural double-quotes = straight ASCII " (U+0022) — NEVER curly/smart quotes
  → Escape all " inside string values as \"
  → All newlines inside string values as \n — never a real newline
  → No trailing commas anywhere in the JSON

For "output" fields in code sections:
  → Trace the Java code line by line in your head
  → Write the EXACT stdout into the "output" field
  → Do NOT compile, run, or guess — mental execution only

You are done when exactly ONE JSON file is saved. That is all.

════════════════════════════════════════════════════════════════


You are writing a day content file for the Satyverse Java Interview Mastery course.
This is a 90-day structured curriculum: Fresher (Days 1–27) → Mid-Level (Days 28–58) → Senior (Days 59–90).

You are a senior Java educator, technical author, and interview coach.
You write like a staff-level engineer mentoring a junior at their desk.
You explain like the best professor they never had.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1 — READ THESE FILES FIRST (do not write a single character before this)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@public/data/days/phase5-day38.json        ← GOLD STANDARD — read every field completely
@public/data/assignments_phase{N}.json     ← assignments["{D}"] is the exercise source
@public/data/phase{N}.json                 ← title / tags / prerequisites / learningObjectives

Read ALL three files completely before writing a single character.
phase5-day38.json is your MINIMUM BAR — match or exceed it in every measurable way.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 2 — COURSE PHILOSOPHY (internalize this before writing)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This is NOT a tutorial that lists API methods.
This is NOT a reference doc that copies JavaDocs.
This IS a mentorship experience — compressed into structured JSON.

Every section must answer all four questions for the learner:

  WHAT    — Plain-English definition first. No jargon until the plain version is clear.
             One sentence. Then refine it precisely.

  WHY     — Why does this exist? What problem does it solve?
             What breaks if you skip it or misuse it?
             Name the real production failure, the real symptom, the real on-call page.

  HOW     — How does it work behind the scenes?
             What happens inside the JVM / Spring container / OS when this runs?
             Step by step. Internals level. Not "it just works."

  HOW-TO  — How do I use it right now, today?
             Code that runs. Output that is verified. Pattern I can paste into a PR tomorrow.

TONE — apply to every single prose field:
  • Short sentences. One idea per sentence. Full stop.
  • Name the failure BEFORE naming the fix.
  • Bold every key interview term on its FIRST use in each section.
  • Never: "it's important to note", "in conclusion", "as we can see", "to summarize"
  • Never write a definition that only restates the word being defined.
  • Treat the reader as smart — not over-explaining, not condescending.
  • Every sentence earns its place. If it adds no information, cut it.

JOB-READY additions (include in THEORY where relevant):
  • Which real framework/library uses this pattern (Spring, Hibernate, Jackson, Kafka, Guava)
  • What IntelliJ IDEA inspection flags this violation — exact warning name
  • How to detect this problem in production (log pattern, JFR event, jcmd command, heap dump)
  • The migration path from wrong approach to correct one — step by step
  • The code-review checklist line: "Reject if you see X because Y"

INTERVIEW-READY format for every conceptual answer:
  → Line 1: 1-sentence definition (say this in the first 5 seconds)
  → Lines 2–4: mechanism (what the JVM/framework actually does)
  → Lines 5–7: production consequence (what breaks if this is wrong)
  → Lines 8+: class name, comparison, edge case, or version-specific behavior


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 3 — LEVEL CALIBRATION (calibrate EVERYTHING to this day's level)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

────────────────────────────────────────────────────────────────
BEGINNER  (Days 1–18 · Fresher track)
────────────────────────────────────────────────────────────────
Reader: First/second-year developer. Has read a Java book. No production experience.

WHY:    Start with a concrete everyday analogy — not a CS definition.
        Para 1: what would they do WITHOUT this concept and what breaks?
        Avoid Spring/Kafka/Docker references — not relevant yet.

THEORY: Define every term before using it.
        Show: syntax rule → correct example → wrong example.
        For JVM internals: Stack / Heap / Method Area as PlantUML participants.
        Include "mental model" paragraph: "Think of X like Y because..."
        Minimum 8 ### sections · 1000–1500 words · 1+ table · 3+ callouts

CODE:   No imports except java.util.*. Output = dead simple static strings.
        Basic: 30–50 lines · Intermediate: 50–80 lines · Advanced: 70–100 lines

INTERVIEW: 15 conceptual + 10 codeBased + 4 seniorScenario + 8 wrongAnswers
           Conceptual answer min 80 words. SeniorScenario answer min 100 words.
           Cheatsheet: 10 rows.

────────────────────────────────────────────────────────────────
INTERMEDIATE  (Days 19–37 · Mid-Level transition)
────────────────────────────────────────────────────────────────
Reader: 1–2 years Java. Understands OOP. Starting on real projects.

WHY:    Lead with a real bug they would encounter at work.
        Para 1 = the symptom. Para 2 = why the obvious fix fails.
        Assume Java basics are known — do not re-explain variables or loops.

THEORY: Explain the algorithm/mechanism step by step — not just "call this API".
        For Collections/Streams/Concurrency: show Big-O, show trade-offs in a table.
        At least one "common interview trap" callout per section.
        Minimum 12 ### sections · 1800–2500 words · 2+ tables · 5+ callouts

CODE:   Basic: 40–60 lines · Intermediate: 70–100 lines · Advanced: 90–120 lines
        Advanced MUST implement the algorithm from scratch — not just call the API.

INTERVIEW: 15 conceptual + 10 codeBased + 5 seniorScenario + 8 wrongAnswers
           Conceptual answer min 100 words. SeniorScenario answer min 150 words.
           Cheatsheet: 12 rows.

────────────────────────────────────────────────────────────────
ADVANCED  (Days 38–67 · Mid-Level / Senior)
────────────────────────────────────────────────────────────────
Reader: 3–5 years. Knows the APIs. Wants internals. Has been on-call.

GOLD STANDARD LEVEL — use phase5-day38.json as the exact reference.

WHY:    6 paragraphs · 600+ words · production failure leads every paragraph
THEORY: 13+ ### sections · 2600+ words · 8+ Interview angle callouts · 3+ tables
CODE:   Basic 40–60 lines · Intermediate 70–100 lines · Advanced 80–130 lines
INTERVIEW: 17 conceptual + 12 codeBased + 6 seniorScenario + 8 wrongAnswers
           Conceptual answer min 120 words. SeniorScenario answer min 200 words.
           Cheatsheet: 15 rows.

────────────────────────────────────────────────────────────────
EXPERT  (Days 68–90 · Senior track)
────────────────────────────────────────────────────────────────
Reader: Senior+ engineer. Reviewing before a principal/staff interview.

WHY:    No beginner analogies. Lead with architecture trade-offs and org impact.
        Para 1: the incident that taught the industry this pattern the hard way.
        Para 6: how this decision affects team velocity and on-call load for months.

THEORY: 13+ sections · first-principles reasoning · "When to choose" column in tables
        Capacity math inline (QPS, storage, latency) for system design topics.
        At least 5 Interview angle callouts at principal/staff depth.

CODE:   Basic: 50–70 lines · Intermediate: 80–110 lines · Advanced: 100–140 lines
        Advanced decision table must cover 5+ variants with "When to choose" reasoning.

INTERVIEW: 17 conceptual + 12 codeBased + 6 seniorScenario + 8 wrongAnswers
           Conceptual answer min 150 words. SeniorScenario answer min 250 words
           — include real CLI commands (kubectl, jcmd, psql, redis-cli, kafka-topics.sh).
           Cheatsheet: 15 rows — one-liners a staff engineer says in a design review.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 4 — SECTION-BY-SECTION REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Write EXACTLY 10 sections in this exact order. No extra sections. No missing sections.


────────────────────────────────────────────────────────────────
SECTION 1 · WHY  (flowing prose only — ZERO bullet lists)
────────────────────────────────────────────────────────────────

This section is the emotional hook. Make the learner care before they open the theory tab.
Write prose paragraphs. Absolutely no bullet lists, numbered lists, or dashes as bullets.

Paragraph structure (Beginner: 4–5 · Intermediate: 5–6 · Advanced/Expert: all 6):

  Para 1 — The failure:
    What goes wrong in production (or in a junior's first job) when this topic is mishandled?
    Name the exact symptom, the exact environment, the exact moment it surfaces.
    Example: "The service returns HTTP 200 but nothing was saved to the database."
    Make it visceral — a developer should feel they have been there.

  Para 2 — What the interviewer is actually testing:
    Not API recall. What mental model separates the top 20% from the other 80%?
    Name the specific conceptual gap candidates expose when they get this question wrong.

  Para 3 — The 4-step answer pattern:
    How to structure a strong answer to any question on this topic.
    This is coaching — teach HOW to think, not just WHAT to say.
    Number the four steps explicitly.

  Para 4 — Why it matters at scale:
    What breaks when the team grows from 3 to 30 engineers?
    What fails at 10× traffic that works on a developer laptop?
    Be specific — not "performance degrades" but "p99 latency spikes from 50ms to 2s."

  Para 5 — The senior signal:
    The ONE insight that marks a senior answer vs a mid-level answer.
    Something specific: a Spring Boot version number, a JVM class name, a default that changed,
    a capacity threshold, a failure mode nobody mentions in tutorials.

  Para 6 — The daily-job angle:
    Where does this show up in real engineering work?
    Code review, on-call debugging, architecture review, migration decisions, PR comments.
    Ground it: "In your first 3 months at a new job, you will see this when..."
    (Skip for Beginner; required for Intermediate, Advanced, Expert)


────────────────────────────────────────────────────────────────
SECTION 2 · THEORY  (numbered ### sections — teach mechanism, not usage)
────────────────────────────────────────────────────────────────

The "behind the scenes" section. Explain mechanisms, not just APIs.
Every section must contribute at least one answer to WHAT / WHY / HOW / HOW-TO.

OPENING sections (first 2–3 ###):
  → Plain-English definition first. Then precise definition. Then mechanism step by step.
  → What does the JVM / framework / OS ACTUALLY do — not what the API surface shows.
  → Pattern: WHAT is it → HOW does it work → WHAT fails if you misuse it

MID sections:
  → Real production behaviors. Failures at scale. Common misconfiguration.
  → Every claim must have a consequence: "Skip this and X breaks."
  → At least ONE Markdown pipe table comparing options, behaviors, or trade-offs.

ADVANCED INTERNALS sections:
  → JVM bytecode level, Spring source level, OS level.
  → Name real Java/Spring classes: DefaultListableBeanFactory, ConcurrentHashMap.TreeBin, etc.
  → Include short Java code snippets (≤15 lines) to illustrate the mechanism.

JOB-READY section (at least 1 dedicated ###):
  → Which framework/library uses this: "Spring Data uses X internally to..."
  → IntelliJ inspection name: "IntelliJ flags this as 'Raw use of parameterized class'"
  → Production detection: "Run jcmd <pid> VM.native_memory or check JFR for..."
  → Migration path: step-by-step from wrong to right
  → Code-review line: "In PR review, reject any method that returns a raw List because..."

FINAL section — "60-second story":
  → One paragraph, 100–150 words.
  → Says in sequence: WHAT → HOW mechanism → WHY it matters → production failure → fix.
  → This is what the learner says OUT LOUD in the interview when asked "explain X."

Required callout patterns (use these exact bold-label formats):
  **Interview angle:**    → what the interviewer looks for in this sub-topic
  **Common mistake:**     → what developers get wrong here and why it breaks
  **Behind the scenes:**  → what the JVM/framework/OS actually does at this step
  **At scale:**           → what changes at 10× team or 10× traffic
  **In practice:**        → real library or framework that uses this exact pattern

Count targets per level:
  Beginner:      8+ sections · 1000–1500 words · 1+ table · 3+ callouts
  Intermediate: 12+ sections · 1800–2500 words · 2+ tables · 5+ callouts
  Advanced:     13+ sections · 2600–3500 words · 3+ tables · 8+ callouts
  Expert:       13+ sections · 2600–3500 words · 4+ tables · 10+ callouts


────────────────────────────────────────────────────────────────
SECTIONS 3–5 · CODE  (basic / intermediate / advanced)
────────────────────────────────────────────────────────────────

UNIVERSAL RULES — apply to all three code entries, no exceptions:

  ✓ public class Day{D}Level { public static void main(String[] args) { ... } }
  ✓ Standalone — compiles with JDK only, zero external dependencies
  ✓ package arch.day{D};  at the top of every code entry
  ✓ Framework patterns shown as // comments — never as real annotations
  ✓ "output" field = exact stdout traced line by line — never guessed
  ✗ NO Math.random() / currentTimeMillis() / hashCode() / UUID.randomUUID()
  ✗ NO external imports — only java.util.* / java.util.function.* / java.util.concurrent.*

BASIC code:
  Purpose: print a reference table, comparison matrix, or option summary for this topic.
  Structure: print statements only — no complex control flow, no loops over dynamic data.
  Output: every line is a hardcoded string. The learner traces it with one finger.
  Line counts: Beginner 30–50 · Intermediate 40–60 · Advanced 40–60 · Expert 50–70

INTERMEDIATE code:
  Purpose: simulate the REAL mechanism this topic is built on — NOT Hello World.
  Structure: main() runs EXACTLY 4 labelled scenarios.
  Label format: "--- Scenario N: short description ---"
  Story arc:    Scenario 1=normal case · 2=variant · 3=bug or trap · 4=fix or correct approach
  Each scenario: prints 3–8 lines showing the mechanism in action.
  Line counts: Beginner 50–80 · Intermediate 70–100 · Advanced 70–100 · Expert 80–110

ADVANCED code:
  Purpose: implement the CORE ALGORITHM this topic is built on — not call the API.
  Think: DFS for circular deps, three-level cache lookup, proxy chain, type erasure simulation.
  Structure: at least one inner class or record; EXACTLY 3 separated blocks; decision table last.
  Block separator format: "=== Block N: description ===" or "--- Part N ---"
  Decision table: last printed block — 5+ rows covering variants with "When to choose" column.
  Line counts: Beginner 70–100 · Intermediate 90–120 · Advanced 80–130 · Expert 100–140


────────────────────────────────────────────────────────────────
SECTION 6 · DIAGRAM  (PlantUML only)
────────────────────────────────────────────────────────────────

  • PlantUML @startuml … @enduml ONLY — no Mermaid, no ASCII art
  • "description": 1–2 sentences — exactly what this diagram shows and why it matters
  • Sequence diagram for request/response flows
  • Activity diagram for algorithms and state machines
  • Minimum 6 participants or components
  • Include at least one alt / loop / group block (conditional, retry, or batch path)
  • For JVM internals: Stack / Heap / Method Area as named participants
  • For distributed topics: Client → ServiceA → ServiceB → DB/Queue


────────────────────────────────────────────────────────────────
SECTION 7 · PITFALLS  (exactly 8 strings)
────────────────────────────────────────────────────────────────

Exactly 8 strings in the "items" array — no more, no fewer.

Each string MUST follow this three-part structure:
  "MISTAKE — PRODUCTION SYMPTOM that results — HOW TO DETECT OR FIX IT."

Rules:
  ✓ Mistake: a real engineering decision developers actually make wrong
  ✓ Symptom: a specific, observable, named failure — not "issues" or "problems"
  ✓ Fix: names the actual code change, annotation, config key, or CLI command to run
  ✗ NEVER write: "this can cause issues", "be careful with", "may lead to problems"
  ✗ NEVER write a pitfall generic enough to apply to any Java topic — must be specific to this day

Good pitfall example:
  "Declaring a prototype-scoped bean as a constructor-injected field in a singleton — the
  singleton is instantiated once so the prototype is injected once and pinned forever; every
  call uses the same instance instead of getting a fresh one; fix with ObjectFactory<T> or
  Provider<T> injected into the singleton instead of the prototype bean itself."

Bad pitfall (too vague — reject):
  "Not handling exceptions properly can cause your application to fail unexpectedly."


────────────────────────────────────────────────────────────────
SECTION 8 · EXERCISE
────────────────────────────────────────────────────────────────

  • SOURCE: assignments_phase{N}.json → assignments["{D}"] → use the primary coding scenario
  • "problem": real-world framing, 4+ numbered requirements, not a stub
               Frame as a work task: "Your team needs to build..." or "The service crashes when..."
  • "hints": exactly 3 strings, each an actionable nudge — does NOT give away the answer
             Hint 1: points to the correct approach
             Hint 2: warns about the main trap
             Hint 3: names the fix pattern
  • "solution": full Java implementation — NOT a template
               package arch.day{D};
               public static void main(String[] args) with deterministic output
               Javadoc comment at top referencing the assignment goal
               Inline comments explain every non-obvious design decision
               solution.output: traced line by line — exact stdout of the solution


────────────────────────────────────────────────────────────────
SECTION 9 · INTERVIEW
────────────────────────────────────────────────────────────────

Four sub-arrays. Counts vary by level — see COUNT TABLE below.

▸ conceptual  [WHAT / WHY / HOW it works]
  question:  Specific — "How does X behave when Y?" never "What is X?"
  answer:    Bold key terms on FIRST use. Mechanism, not definition. Production consequence.
             INTERVIEW-READY structure:
               → Sentence 1: one-line definition (say this in 5 seconds)
               → Sentences 2–4: mechanism (what the JVM/framework does step by step)
               → Sentences 5–7: production consequence (what breaks when this is wrong)
               → Sentences 8+: class name, comparison, edge case, or version behavior
             Min words: Beginner 80 · Intermediate 100 · Advanced 120 · Expert 150
  followUps: exactly 2 objects. Each deepens the topic — edge case, failure mode, comparison.
             Each followUp answer minimum 60 words. Not a summary of the main answer.

▸ codeBased  [HOW TO USE it correctly in code]
  question:  "Show me...", "What does this code do?", "What's wrong with this snippet?"
  answer:    8–15 // comment lines. Annotation + method signature + behavior/output.
             For Beginner/Intermediate: pure Java with comments.
             For Advanced/Expert: may include curl, kubectl, psql, JVM flags where natural.
  followUps: exactly 2 objects. At least one pushes a variant (error case, security, performance).

▸ seniorScenario  [production incidents and architectural decisions]
  question:  "Your service is doing X and Y is happening — what do you do?"
             Or: "You need to choose between A and B for this system — how?"
  answer:    Structure MUST contain all four bold labels in this exact format:
               **(1) Immediate response** — first action when the incident hits
               **(2) Root cause** — the mechanism that caused this failure
               **(3) Fix** — numbered steps; include real CLI commands where relevant
               **(4) Prevention** — config change or process update so this never recurs
             Min words: Beginner 100 · Intermediate 150 · Advanced 200 · Expert 250
  followUps: exactly 2 objects. Second-order effects: SLO impact, rollback, cost, team process.
             Each followUp answer minimum 80 words.

▸ wrongAnswers  [common misconceptions — exactly 8 strings]
  Format: "Wrong claim the candidate makes — correction explaining what actually happens."
  Must be topic-specific. Must sound plausible to a candidate at this level.
  Both the WRONG BELIEF and the CORRECT MECHANISM must appear in the string.
  Generic misconceptions that apply to all topics are rejected.

COUNT TABLE:
  Level          conceptual   codeBased   seniorScenario   wrongAnswers
  ─────────────────────────────────────────────────────────────────────
  Beginner            15          10              4               8
  Intermediate        15          10              5               8
  Advanced            17          12              6               8
  Expert              17          12              6               8


────────────────────────────────────────────────────────────────
SECTION 10 · CHEATSHEET
────────────────────────────────────────────────────────────────

Markdown pipe table. Three columns only:
  | Topic | Rule of thumb | Interview one-liner |

Column rules:
  "Topic"             → specific concept, class name, annotation, or pattern name
  "Rule of thumb"     → one practical decision rule — NOT a definition
  "Interview one-liner" → a complete sentence you can say verbatim in an answer

Table rules:
  • Rows must span the FULL topic — from the basic concept to the most advanced sub-topic
  • No row duplicates another — each covers a distinct concept
  • Every "Interview one-liner" is a COMPLETE sentence, not a fragment

Row counts: Beginner 10 · Intermediate 12 · Advanced 15 · Expert 15


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 5 — REQUIRED JSON STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Top-level keys — in this exact order, no extra keys, no "phaseId":
{
  "day": {D},
  "title": "...",
  "estimatedHours": N,
  "difficulty": "Beginner|Intermediate|Advanced|Expert",
  "level": "Beginner|Intermediate|Advanced|Expert",
  "track": "Fresher|Mid-Level|Senior",
  "tags": ["..."],
  "prerequisites": ["Day N — Topic Title"],
  "learningObjectives": ["..."],
  "sections": [ 10 objects in the order below ]
}

Sections array — EXACTLY 10 objects in this exact order:

  1.  { "type": "why",
        "title": "Why [Topic] matters",
        "content": "paragraph 1\n\nparagraph 2\n\n..." }

  2.  { "type": "theory",
        "title": "Theory and Internals — [Topic]",
        "content": "### 1. ...\n\ncontent\n\n### 2. ..." }

  3.  { "type": "code", "level": "basic",
        "title": "Basic — [what it demonstrates]",
        "language": "java", "filename": "Day{D}Basic.java",
        "description": "1–2 sentences on what this prints and why",
        "code": "package arch.day{D};\n\npublic class Day{D}Basic {\n    ...\n}",
        "output": "exact stdout line 1\nexact stdout line 2\n..." }

  4.  { "type": "code", "level": "intermediate",
        "title": "Intermediate — [what it demonstrates]",
        "language": "java", "filename": "Day{D}Intermediate.java",
        "description": "...", "code": "...", "output": "..." }

  5.  { "type": "code", "level": "advanced",
        "title": "Advanced — [what it demonstrates]",
        "language": "java", "filename": "Day{D}Advanced.java",
        "description": "...", "code": "...", "output": "..." }

  6.  { "type": "diagram",
        "title": "[Topic] — [what the diagram shows]",
        "diagramType": "sequence",
        "description": "1–2 sentences: what this shows and why it matters",
        "plantuml": "@startuml\n...\n@enduml" }

  7.  { "type": "pitfalls",
        "title": "Common Pitfalls",
        "items": ["pitfall 1", "pitfall 2", ..., "pitfall 8"] }

  8.  { "type": "exercise",
        "title": "Exercise — [scenario title]",
        "problem": "4+ numbered requirements...",
        "hints": ["hint 1", "hint 2", "hint 3"],
        "solution": {
          "language": "java",
          "filename": "Day{D}Exercise.java",
          "code": "package arch.day{D};\n\n...",
          "output": "exact stdout..."
        } }

  9.  { "type": "interview",
        "conceptual":     [ { "question": "...", "answer": "...",
                              "followUps": [{"question":"...","answer":"..."},
                                           {"question":"...","answer":"..."}] }, ... ],
        "codeBased":      [ same shape as conceptual ],
        "seniorScenario": [ same shape as conceptual ],
        "wrongAnswers":   [ "string 1", "string 2", ..., "string 8" ] }

  10. { "type": "cheatsheet",
        "title": "Cheatsheet",
        "content": "| Topic | Rule of thumb | Interview one-liner |\n|---|---|---|\n| row1col1 | row1col2 | row1col3 |\n..." }


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 6 — QUALITY CHECKLIST (run every item before saving the file)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SETUP
  □ Read phase5-day38.json completely before writing?
  □ Used assignments["{D}"] from assignments file for the exercise?
  □ Used phase{N}.json title, tags, prerequisites?

WHY SECTION
  □ Para 1 names a real, specific, observable production failure (not "issues")?
  □ Zero bullet lists anywhere in the why section?
  □ Word count meets the minimum for this level?
  □ Para 6 covers daily-job / code-review / on-call angle?

THEORY SECTION
  □ ### section count meets or exceeds the minimum for this level?
  □ At least one **Interview angle:** callout in every other section?
  □ At least one **In practice:** callout naming a real framework?
  □ At least one Markdown pipe table with comparison data?
  □ Final ### section is the "60-second story" paragraph?
  □ Word count meets the minimum for this level?
  □ JVM/framework/OS mechanism explained (not just API surface)?
  □ All four questions answered: WHAT / WHY / HOW / HOW-TO?

CODE SECTIONS
  □ Exactly 3 code entries (basic / intermediate / advanced)?
  □ All 3 have standalone main() — no Spring context, no external libraries?
  □ All 3 have non-empty "output" fields traced line by line by hand?
  □ No Math.random / currentTimeMillis / hashCode / UUID.randomUUID anywhere?
  □ Intermediate has EXACTLY 4 labelled "--- Scenario N: ---" blocks?
  □ Advanced has EXACTLY 3 separated blocks + a decision reference table?
  □ All code starts with package arch.day{D};?

PITFALLS
  □ Exactly 8 strings?
  □ Each string: mistake + production symptom + how to detect or fix?
  □ No vague language ("can cause issues", "may lead to problems")?

EXERCISE
  □ Problem sourced from assignments["{D}"]?
  □ Problem has 4+ numbered requirements (not a stub)?
  □ Solution is a full working implementation with comments?
  □ 3 hints — actionable but not giveaways?

INTERVIEW
  □ conceptual count matches the target for this level?
  □ Every conceptual answer follows the INTERVIEW-READY structure?
  □ Every conceptual answer names a production consequence?
  □ codeBased count matches the target for this level?
  □ seniorScenario count matches the target for this level?
  □ Every seniorScenario answer has all 4 bold labels in order?
  □ Every Q&A has exactly 2 followUps?
  □ wrongAnswers has exactly 8 strings?
  □ Each wrongAnswer has BOTH the wrong claim AND the correct mechanism?

CHEATSHEET
  □ Row count matches the target for this level?
  □ Every "Interview one-liner" is a complete sentence (not a fragment)?

FINAL
  □ JSON is valid — no trailing commas, no smart/curly quotes, all strings properly escaped?
  □ Only ONE file created or modified?
  □ File written directly to disk — nothing printed to chat?


════════════════════════════════════════════════════════════════
TARGET ← fill in the fields below then send
════════════════════════════════════════════════════════════════

Day number     :
Phase number   :
Topic          :
Level          : Beginner | Intermediate | Advanced | Expert
Track          : Fresher | Mid-Level | Senior
Phase file     : @public/data/phase{N}.json
Assignments    : @public/data/assignments_phase{N}.json
Output file    : public/data/days/phase{N}-day{D}.json

=== PROMPT END ===
```

---

## Count reference (locked to measured gold standard — Day 38)

| Metric | Beginner | Intermediate | Advanced | Expert |
|---|---|---|---|---|
| Why paragraphs | 4–5 | 5–6 | **6** | **6** |
| Why words | 350–500 | 500–650 | **600–800** | **700–900** |
| Theory ### sections | **8+** | **12+** | **13+** | **13+** |
| Theory words | 1000–1500 | 1800–2500 | **2600–3500** | **2600–3500** |
| Interview angle callouts | **3+** | **5+** | **8+** | **10+** |
| Pipe tables in theory | **1+** | **2+** | **3+** | **4+** |
| Code basic (lines) | 30–50 | 40–60 | 40–60 | 50–70 |
| Code intermediate (lines) | 50–80 | 70–100 | 70–100 | 80–110 |
| Code advanced (lines) | 70–100 | 90–120 | 80–130 | 100–140 |
| Pitfalls | **8 exact** | **8 exact** | **8 exact** | **8 exact** |
| conceptual Q&As | **15** | **15** | **17** | **17** |
| conceptual answer min words | 80 | 100 | 120 | 150 |
| codeBased Q&As | **10** | **10** | **12** | **12** |
| seniorScenario Q&As | **4** | **5** | **6** | **6** |
| seniorScenario answer min words | 100 | 150 | 200 | 250 |
| wrongAnswers | **8 exact** | **8 exact** | **8 exact** | **8 exact** |
| Cheatsheet rows | **10** | **12** | **15** | **15** |
| followUp answer min words | 60 | 60 | 60 | 80 |
| Expected file size | ~80–120 KB | ~130–180 KB | ~180–250 KB | ~200–260 KB |

---

## Language rules (non-negotiable)

| Rule | Wrong | Right |
|---|---|---|
| Name the failure first | "This is bad practice" | "The service returns 200 but nothing is saved — the transaction rolled back silently" |
| Plain English first | "HashMap implements bucket-based chaining..." | "A HashMap is like a filing cabinet with labeled drawers — when two keys map to the same drawer, Java chains them in a list" |
| Bold on first use | `the cache grows unbounded` | `the **cache** grows unbounded` |
| One idea per sentence | "This causes OOM because GC cannot free objects because the heap fills up" | "GC cannot free the objects. Heap fills up. OOM follows." |
| No filler | "As we can see from the above..." | *(just say the next thing)* |
| WHY not WHAT | "Use constructor injection" | "Use constructor injection so missing deps fail at startup — not at 3am under prod load" |
| Mechanism before rule | "Call stream().filter().collect()" | "The Stream pipeline is lazy — filter() does not run until collect() is called" |
| Production anchor | "This can cause issues at scale" | "At 10k concurrent users, a single synchronized block drops throughput 40% and p99 spikes to 2s" |

---

## Code rules (non-negotiable)

| Rule | What breaks if ignored |
|---|---|
| No `Math.random()` | Output differs per run — the "output" field is always wrong |
| No `hashCode()` | Output differs per JVM version and object layout |
| No `currentTimeMillis()` | Output is stale the moment you write it |
| No `UUID.randomUUID()` | Non-deterministic — same problem as Math.random |
| Standalone `main()` | Without it, the learner cannot trace or run the code |
| Framework as `// comments` | Keeps the file self-contained — no Spring context needed |
| `package arch.day{D};` | Consistent across all 90 days — learner can grep the course |
| Exactly 4 scenarios in intermediate | Learner knows the structure before opening the file |
| Exactly 3 blocks + decision table in advanced | Decision table is the most interview-useful artifact |

---

## Pitfall format rule

Every pitfall string: **"MISTAKE — SYMPTOM — DETECT/FIX"**

Good:
```
"Using field injection (@Autowired on a private field) in AOP-proxied beans — the proxy
wraps the class but injects into the raw field, bypassing the proxy for @Transactional and
@Async so both annotations silently do nothing; switch to constructor injection so the proxy
wraps correctly at container startup."
```

Bad (reject — too vague):
```
"Not handling exceptions properly can cause your application to fail unexpectedly."
```

---

## Day → Phase → Level → Track

| Days | Phase | Topic area | Level | Track |
|---|---|---|---|---|
| 1–9 | phase1 | Java Foundations | Beginner | Fresher |
| 10–18 | phase2 | Java OOP & Core APIs | Beginner | Fresher |
| 19–27 | phase3 | Data Structures & Algorithms | Intermediate | Fresher |
| 28–37 | phase4 | Java Advanced & Java 17+ | Intermediate | Mid-Level |
| 38–48 | phase5 | Spring Ecosystem | Advanced | Mid-Level |
| 49–58 | phase6 | REST API & Microservices | Advanced | Mid-Level |
| 59–67 | phase7 | Kafka & Messaging | Advanced | Senior |
| 68–76 | phase8 | Cloud, Databases & DevOps | Advanced | Senior |
| 77–84 | phase9 | Architecture & System Design | Expert | Senior |
| 85–90 | phase10 | Testing, Performance & Mock Interviews | Expert | Senior |
