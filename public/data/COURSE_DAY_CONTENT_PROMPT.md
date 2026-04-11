# Satyverse Java Mastery — Course Day Content Prompt
## For Cursor AI Composer (`Ctrl+I`)

> **Who writes this**: You are a senior Java educator, technical author, and interview coach.
> You write like a staff-level engineer mentoring a junior.
> You explain like the best professor your student never had.

---

## How to use

1. Open Cursor → Composer (`Ctrl+I`)
2. Copy the entire block between the `=== PROMPT START ===` and `=== PROMPT END ===` markers
3. Fill in the `TARGET` section at the bottom
4. Send

---

```
=== PROMPT START ===

════════════════════════════════════════════════════════════════
⛔  ABSOLUTE RULES — READ BEFORE ANYTHING ELSE
════════════════════════════════════════════════════════════════

OUTPUT = exactly ONE file, nothing else:
  • public/data/days/phase{N}-day{D}.json

FORBIDDEN:
  ✗  Do NOT create any Python / shell / Node scripts (.py .sh .mjs)
  ✗  Do NOT create any Java source or class files (.java .class)
  ✗  Do NOT create any folder, README, or helper file of any kind
  ✗  Do NOT print the JSON to chat — write it directly to the file
  ✗  Do NOT add markdown fences around the JSON output
  ✗  Do NOT use Math.random(), System.currentTimeMillis(), hashCode(), UUID.randomUUID()
     in any code section — output must be 100% reproducible on every run

For code "output" fields:
  → Trace the Java code line by line in your head
  → Write the exact stdout string directly into the JSON "output" field
  → Do NOT compile, run, or shell out — mental execution only

JSON encoding:
  → All structural double-quotes must be straight ASCII " (U+0022) — never curly/smart quotes
  → Escape all " inside string values as \"
  → Newlines inside string values as \n
  → No trailing commas anywhere

You are done when the single JSON file is saved. That is all.

════════════════════════════════════════════════════════════════


You are writing a day content file for the Satyverse Java Interview Mastery course.
This is a 90-day structured curriculum: Fresher (Days 1–27) → Mid-Level (Days 28–58) → Senior (Days 59–90).


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1 — READ THESE FILES FIRST (before writing a single character)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@public/data/days/phase5-day38.json        ← GOLD STANDARD — read this completely
@public/data/assignments_phase{N}.json     ← assignments["{D}"] drives the exercise section
@public/data/phase{N}.json                 ← title / tags / prerequisites / learningObjectives

Read ALL three files completely before writing a single character.
phase5-day38.json is your minimum bar for depth, length, and quality.
The content must match or exceed it in every measurable way.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 2 — COURSE PHILOSOPHY (what makes this course different)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This is NOT a tutorial that lists API methods.
This is NOT a reference doc that copies from JavaDocs.
This IS a mentorship experience compressed into structured JSON.

Every day file must answer four questions for the learner:

  WHAT    — What is this concept? Define it in plain English first, then precisely.
             No jargon until the plain-English version is solid.

  WHY     — Why does this exist? What problem does it solve?
             What breaks if you skip it or do it wrong?
             Name the real production failure, the real symptom, the real on-call page.

  HOW     — How does it work behind the scenes?
             What happens inside the JVM / Spring container / OS when this runs?
             Step by step. Internals level. Not "it just works."

  HOW-TO  — How do I use it today, right now?
             Code that runs. Output that is verified. Pattern I can copy into a PR tomorrow.

The learner reads this on their lunch break or commute.
Write like a senior engineer sitting next to them — direct, specific, zero padding.

TONE RULES:
  • Short sentences. One idea. Full stop.
  • Name the failure before the fix.
  • Bold the term the first time you use it.
  • Never say "it's important to note" — just say the thing.
  • Never say "in conclusion" or "to summarize".
  • Never write a definition that only restates the word being defined.
  • Explain like the reader is smart but has not seen this topic before.
  • Never talk down. Never over-explain what they already know.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 3 — LEVEL CALIBRATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Calibrate every section to the level of this specific day.
The level determines vocabulary, code complexity, interview depth, and assumed prior knowledge.

────────────────────────────────────────────────────────────────
BEGINNER (Days 1–18 · Fresher track)
────────────────────────────────────────────────────────────────

Reader profile: First or second year developer. Has read a Java book or done a MOOC.
               Has NOT deployed anything to production. Has NOT done a real interview.

WHY section:
  → Start with a concrete, everyday analogy — not a computer science definition.
  → Para 1: What would a beginner do WITHOUT this concept, and what goes wrong?
  → Avoid references to frameworks (Spring, Kafka, Docker) — not yet relevant.
  → Production failures → frame as "you would hit this bug in your first job"

THEORY section:
  → Define every term before using it, even if it seems obvious.
  → Show the Java syntax rule, then show a correct example, then show the wrong version.
  → For JVM internals: use Stack/Heap/Method Area diagrams in PlantUML.
  → Include a "mental model" paragraph: "Think of X like a Y because..."
  → Minimum 8 ### sections. At least 2 comparison tables.

CODE section:
  → Basic: 30–50 lines. Absolutely no external imports except java.util.*.
  → Intermediate: 50–80 lines. Shows the concept applied to a realistic mini-problem.
  → Advanced: 70–100 lines. Shows a common beginner mistake and the correct fix side by side.
  → Output: Dead simple. Every line is obvious. Learner can trace it with a finger.

INTERVIEW section:
  → conceptual: 15 Q&As focused on definitions, mechanics, and "what happens when..."
  → codeBased: 10 Q&As — "spot the bug" or "trace the output" style
  → seniorScenario: 4 Q&As (not 6) — entry-level scenario questions from real fresher interviews
  → wrongAnswers: 8 strings — classic beginner misconceptions

────────────────────────────────────────────────────────────────
INTERMEDIATE (Days 19–37 · Fresher → Mid-Level transition)
────────────────────────────────────────────────────────────────

Reader profile: Has written Java for 1–2 years. Understands OOP basics.
               Starting to work on real projects. Preparing for mid-level interviews.

WHY section:
  → Lead with a real bug or performance issue they would encounter at work.
  → Para 1: The production symptom. Para 2: Why the obvious solution fails.
  → Assume they know Java basics — do not re-explain variables or loops.

THEORY section:
  → Explain the algorithm or mechanism step by step, not just "use this API".
  → For Collections/Streams/Concurrency: show Big-O, show trade-offs in a table.
  → Include at least one "common interview trap" callout.
  → Minimum 10 ### sections. At least 2 tables. At least 3 Interview angle callouts.

CODE section:
  → Basic: 40–60 lines. Shows the standard pattern correctly.
  → Intermediate: 70–100 lines. Runs 4 scenarios: correct → trap → variant → fix.
  → Advanced: 90–120 lines. Implements the algorithm from scratch (not just calls the API).
  → Output: Each scenario clearly labelled. Deterministic.

INTERVIEW section:
  → conceptual: 15 Q&As — mechanism + "why this over that" comparisons
  → codeBased: 10 Q&As — code that looks correct but has a subtle bug
  → seniorScenario: 5 Q&As — "how would you debug this in prod?"
  → wrongAnswers: 8 strings

────────────────────────────────────────────────────────────────
ADVANCED (Days 38–67 · Mid-Level track)
────────────────────────────────────────────────────────────────

Reader profile: 3–5 years experience. Knows the APIs. Wants to understand internals.
               Preparing for senior roles. Has been in on-call rotations.

This is the GOLD STANDARD level. Use phase5-day38.json as the exact reference.
Match or exceed every count shown in Step 4 below.

WHY section:      6 paragraphs. 600+ words. Production failures lead every paragraph.
THEORY section:   13+ ### sections. 2600+ words. 8+ Interview angle callouts. 3+ tables.
CODE section:     Basic 40–60 / Intermediate 70–100 / Advanced 80–130 lines.
INTERVIEW:        17 conceptual + 12 codeBased + 6 seniorScenario + 8 wrongAnswers.
CHEATSHEET:       15 rows.

────────────────────────────────────────────────────────────────
EXPERT (Days 68–90 · Senior track)
────────────────────────────────────────────────────────────────

Reader profile: Senior+ engineer. Reviewing concepts before a principal/staff interview.
               Cares about trade-offs, scale, org impact, and architectural decisions.

WHY section:
  → No beginner analogies. Lead with architecture trade-offs and org impact.
  → Para 1: The incident that taught the industry this pattern the hard way.
  → Para 6: How this decision affects team velocity and on-call load for months.

THEORY section:
  → Minimum 13 ### sections. Lead with first-principles reasoning, not API surface.
  → Every table must have a "When to choose" column — not just feature comparison.
  → At least 5 Interview angle callouts — these are principal/staff-level callouts.
  → For system design topics: include capacity math inline (QPS, storage, latency).
  → Include a "common architectural mistake at scale" section.

CODE section:
  → Basic: 50–70 lines. A reference/comparison table for the most common configs.
  → Intermediate: 80–110 lines. Simulates a distributed or multi-component scenario.
  → Advanced: 100–140 lines. Implements the algorithm/pattern from scratch.
                Must include a decision table at the end covering 5+ variants.

INTERVIEW section:
  → conceptual: 17 Q&As — architecture decisions, trade-offs, failure modes
  → codeBased: 12 Q&As — system-level code (not just syntax): configs, Dockerfiles, k8s yamls, SQL
  → seniorScenario: 6 Q&As — "you're the on-call for a P0" style
                   Each answer: 250+ words, 4 bold labels, numbered steps and real CLI commands
  → wrongAnswers: 8 strings — senior-level misconceptions (not beginner mistakes)
  → CHEATSHEET: 15 rows — one-liners a staff engineer says in a design review


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 4 — SECTION-BY-SECTION REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Write 10 sections in this exact order. No extra sections. No missing sections.


────────────────────────────────────────────────────────────────
SECTION 1 · WHY
────────────────────────────────────────────────────────────────

Flowing prose paragraphs only. Absolutely NO bullet lists in this section.
This section is the emotional hook. It must make the learner care before they learn.

Required paragraph structure (adapt count to level — see Step 3):

  Para 1 — The failure without this concept:
    What goes wrong in production (or in an interview) if you skip or misunderstand this topic?
    Name the symptom. Name the environment. Name when it surfaces.
    Make it visceral: "The service returns 200 but nothing was saved."

  Para 2 — What the interviewer is really testing:
    Not API recall. What mental model are they looking for?
    What do 80% of candidates get wrong that the top 20% get right?

  Para 3 — The 4-step answer pattern:
    How to structure a strong answer to any question on this topic.
    This is coaching, not content. Teach the learner HOW to think, not just WHAT to say.

  Para 4 — Why it matters at scale:
    How does this problem compound as the team grows from 3 to 30 engineers?
    What breaks at 10× traffic that works fine on a laptop?

  Para 5 — The senior signal:
    The one insight that marks a senior answer vs a mid-level answer.
    Something specific: a version number, a class name, a failure mode, a capacity threshold.

  Para 6 — The daily-job angle:
    Where does this come up in normal work? Code review? On-call? Architecture review?
    Ground it: "In your first 3 months at a new job, you will see this when..."

Word counts by level:
  Beginner: 350–500 words   Intermediate: 450–600 words
  Advanced: 600–800 words   Expert: 600–900 words


────────────────────────────────────────────────────────────────
SECTION 2 · THEORY
────────────────────────────────────────────────────────────────

Numbered ### sections. Each section covers one concept at a time.
This is the "behind the scenes" section. Teach mechanisms, not just usage.

Required structure across all ### sections:

  § Opening sections (first 2–3):
    Plain-English definition first. Then precise definition. Then mechanism step by step.
    Include: what the JVM / framework / OS actually does, not just what the API does.
    Pattern: WHAT is it → HOW does it work → WHAT fails if you misuse it

  § Mid sections:
    Real production behaviors. What changes at scale. What fails. What's misconfigured.
    Every claim must have a concrete consequence: "Skip this and X breaks."
    At least one Markdown pipe table comparing options, behaviors, or use cases.

  § Advanced internals sections:
    Go one level deeper than the API. JVM bytecode level, Spring source level, OS level.
    Name real Java classes: DefaultListableBeanFactory, ConcurrentHashMap.TreeBin, etc.
    Include short Java code snippets (under 15 lines) to illustrate the mechanism.

  § Closing section ("60-second story"):
    One paragraph, 100–150 words.
    Covers in sequence: WHAT → HOW mechanism → WHY it matters → production failure → fix.
    This is what the learner says out loud in the interview when asked to explain the topic.

Required callouts — use these exact Markdown bold patterns:
  **Interview angle:** paragraph → what the interviewer looks for in this sub-topic
  **Common mistake:** paragraph → what developers get wrong here and why it breaks
  **Behind the scenes:** paragraph → what the JVM/framework/OS actually does here
  **At scale:** paragraph → what changes when traffic or team size increases

Count targets by level:
  Beginner:      8+ ### sections · 1000–1500 words · 1+ table · 3+ callouts
  Intermediate: 10+ ### sections · 1500–2000 words · 2+ tables · 5+ callouts
  Advanced:     13+ ### sections · 2600–3500 words · 3+ tables · 8+ callouts
  Expert:       13+ ### sections · 2600–3500 words · 4+ tables · 10+ callouts


────────────────────────────────────────────────────────────────
SECTION 3–5 · CODE (basic / intermediate / advanced)
────────────────────────────────────────────────────────────────

Three entries. All three entries follow these universal rules:

  ✓ Standalone public class with public static void main(String[] args) — no Spring needed
  ✓ Compiles with only JDK standard library — no external dependencies
  ✓ Package: package arch.day{D};
  ✓ Filename: Day{D}Basic.java / Day{D}Intermediate.java / Day{D}Advanced.java
  ✓ Spring / framework patterns shown as // comments, not as real annotations
  ✓ "output" field = exact stdout, traced line by line in your head, never guessed
  ✗ No Math.random(), currentTimeMillis(), hashCode(), UUID.randomUUID() — ever
  ✗ No external library imports — only java.util.*, java.util.function.*, java.util.concurrent.*

BASIC code:
  Purpose: print a reference table, comparison matrix, or property summary for this topic.
  Structure: just print statements — no complex control flow.
  Output: dead simple static strings. The learner can trace every line with a finger.
  Line count by level: Beginner 30–50 · Intermediate 40–60 · Advanced 40–60 · Expert 50–70

INTERMEDIATE code:
  Purpose: simulate the REAL mechanism this topic describes — not a Hello World.
  Structure: main() runs exactly 4 labelled scenarios.
  Label format: "--- Scenario N: short description ---"
  Scenario story arc: 1=normal case  2=variant  3=bug/trap/edge case  4=fix/correct approach
  Output: each scenario prints 3–8 lines showing the mechanism working.
  Line count by level: Beginner 50–80 · Intermediate 70–100 · Advanced 70–100 · Expert 80–110

ADVANCED code:
  Purpose: implement the core algorithm or decision logic that this topic is built on.
  NOT "use the API" — implement what the API does internally (DFS, cache lookup, proxy chain, etc.)
  Structure: at least one inner class or record; 3 clearly separated blocks; ends with a decision table.
  Output: 3 blocks separated by === headers; decision table last.
  Line count by level: Beginner 70–100 · Intermediate 90–120 · Advanced 80–130 · Expert 100–140


────────────────────────────────────────────────────────────────
SECTION 6 · DIAGRAM
────────────────────────────────────────────────────────────────

  • PlantUML @startuml … @enduml only — no Mermaid, no ASCII art
  • Shows the data/request flow through real components for this topic
  • "description": 1–2 sentences — exactly what the diagram shows and why it matters
  • Sequence diagram for request/response flows; activity diagram for algorithms
  • Minimum 6 participants or components
  • Include an alt/loop/group block if the flow has a conditional, retry, or batch path
  • For JVM internals topics: show Stack / Heap / Method Area as participants
  • For distributed topics: show Client → Service A → Service B → DB / Queue


────────────────────────────────────────────────────────────────
SECTION 7 · PITFALLS
────────────────────────────────────────────────────────────────

Exactly 8 strings. No more. No fewer.

Each string MUST follow this three-part structure in one or two sentences:
  "MISTAKE — PRODUCTION SYMPTOM — HOW TO DETECT OR FIX IT."

Rules:
  ✓ The mistake must be something a real engineer actually does wrong
  ✓ The symptom must be a specific, observable failure (not "issues" or "problems")
  ✓ The detect/fix must name the actual change to make or command to run
  ✗ Never write: "this can cause issues", "be careful with", "may lead to problems"
  ✗ Never write a pitfall that applies to every Java topic — must be specific to this day

Example of a GOOD pitfall:
  "Declaring a prototype-scoped bean as a field in a singleton — the singleton is created once,
  the prototype field is injected once, and every call shares the same prototype instance instead
  of getting a fresh one; fix with ObjectFactory<T> or Provider<T> injected into the singleton."

Example of a BAD pitfall (too vague):
  "Not handling exceptions properly can cause your application to fail unexpectedly."


────────────────────────────────────────────────────────────────
SECTION 8 · EXERCISE
────────────────────────────────────────────────────────────────

  • Source of truth: assignments_phase{N}.json → assignments["{D}"] → use the primary question
  • "problem": real-world scenario, not a stub. Minimum 4 numbered requirements.
              Frame it as a work task: "Your team needs you to build..." or "The service crashes when..."
  • "hints": exactly 3 strings. Each hint is an actionable nudge — does NOT give away the answer.
              Hint 1: points to the right approach. Hint 2: warns about the main trap. Hint 3: points to the fix pattern.
  • "solution": full Java code
              - package arch.day{D};
              - public static void main(String[] args) with deterministic output
              - Javadoc comment at the top referencing the assignment goal
              - Inline comments explain every non-obvious design decision
              - Not a template — the solution actually solves the problem completely
  • "solution.output": traced line by line — exact stdout of the solution


────────────────────────────────────────────────────────────────
SECTION 9 · INTERVIEW
────────────────────────────────────────────────────────────────

Four sub-sections. Counts vary by level (see count table below).

▸ conceptual — questions about WHAT and WHY and HOW it works
  question:  Specific, not generic. "How does X behave when Y?" not "What is X?"
  answer:    Bold key terms on first use. Explains mechanism, not just definition.
             Names a production consequence. No padding.
             Minimum words by level: Beginner 80 · Intermediate 100 · Advanced 120 · Expert 150
  followUps: exactly 2. Each deepens the topic — edge case, failure mode, comparison.
             Each followUp answer minimum 60 words. Not a summary of the main answer.

▸ codeBased — questions about HOW TO USE it in code
  question:  "Show me...", "What does this code do?", "What's wrong with this?"
  answer:    8–15 // comment lines showing annotation + method + behavior/output.
             For Beginner/Intermediate: simple Java snippet with explanation.
             For Advanced/Expert: may include curl, kubectl, psql, JVM flags where natural.
  followUps: exactly 2. At least one pushes a variant (error case, security, performance).

▸ seniorScenario — production incidents and architectural decisions
  question:  "Your service is doing X and Y starts happening — what do you do?"
             Or: "You need to choose between A and B for this system — how do you decide?"
  answer:    Structure MUST be:
               **(1) Immediate response** — first action when the incident hits
               **(2) Root cause** — the mechanism that caused this
               **(3) Fix** — numbered steps, real commands
               **(4) Prevention** — config or process change so it never recurs
             Bold all four labels exactly as shown.
             Minimum words by level: Beginner 100 · Intermediate 150 · Advanced 200 · Expert 250
  followUps: exactly 2. Second-order effects — SLO, rollback, cost, team process.
             Each minimum 80 words.

▸ wrongAnswers — common misconceptions
  Format: "Wrong claim — correction explaining what actually happens."
  Must be topic-specific. Must sound plausible to the candidate at that level.
  Both the wrong claim AND the correct mechanism must appear in the string.

COUNT TABLE by level:
  Level          conceptual   codeBased   seniorScenario   wrongAnswers
  ─────────────────────────────────────────────────────────────────────
  Beginner            15          10              4               8
  Intermediate        15          10              5               8
  Advanced            17          12              6               8
  Expert              17          12              6               8


────────────────────────────────────────────────────────────────
SECTION 10 · CHEATSHEET
────────────────────────────────────────────────────────────────

Markdown pipe table format.

Count by level:
  Beginner: 10 rows  ·  Intermediate: 12 rows  ·  Advanced: 15 rows  ·  Expert: 15 rows

Columns: | Topic | Rule of thumb | Interview one-liner |

Rules:
  • "Topic" column: the specific concept, class, or annotation name
  • "Rule of thumb" column: one practical decision rule — not a definition
  • "Interview one-liner" column: a sentence you can say verbatim in an answer
  • Rows must span the full topic — basics through the most advanced sub-topic of the day
  • No row should duplicate another — each covers a distinct concept


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 5 — REQUIRED JSON STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Top-level (no extra keys, no "phaseId" field):
{
  "day": {D},
  "title": "...",
  "estimatedHours": N,
  "difficulty": "Beginner" | "Intermediate" | "Advanced" | "Expert",
  "level": "Beginner" | "Intermediate" | "Advanced" | "Expert",
  "track": "Fresher" | "Mid-Level" | "Senior",
  "tags": ["...", ...],
  "prerequisites": ["Day N — Topic", ...],
  "learningObjectives": ["...", ...],
  "sections": [ ...10 objects in the order below... ]
}

Sections array — exactly 10 objects in this exact order:
  1.  { "type": "why",      "title": "Why [Topic] matters",               "content": "..." }
  2.  { "type": "theory",   "title": "Theory and Internals — [Topic]",    "content": "..." }
  3.  { "type": "code",     "level": "basic",        "title": "Basic — ...",
        "language": "java", "filename": "Day{D}Basic.java",
        "description": "...", "code": "...", "output": "..." }
  4.  { "type": "code",     "level": "intermediate", "title": "Intermediate — ...",
        "language": "java", "filename": "Day{D}Intermediate.java",
        "description": "...", "code": "...", "output": "..." }
  5.  { "type": "code",     "level": "advanced",     "title": "Advanced — ...",
        "language": "java", "filename": "Day{D}Advanced.java",
        "description": "...", "code": "...", "output": "..." }
  6.  { "type": "diagram",  "title": "...", "diagramType": "sequence",
        "description": "...", "plantuml": "@startuml\n...\n@enduml" }
  7.  { "type": "pitfalls", "title": "Common Pitfalls", "items": ["...", ...8 items...] }
  8.  { "type": "exercise", "title": "Exercise — ...",
        "problem": "...", "hints": ["...", "...", "..."],
        "solution": { "language": "java", "filename": "Day{D}Exercise.java",
                      "code": "...", "output": "..." } }
  9.  { "type": "interview",
        "conceptual":     [ ...objects: { "question": "...", "answer": "...", "followUps": [{"question":"...","answer":"..."}, {"question":"...","answer":"..."}] }... ],
        "codeBased":      [ ...same shape... ],
        "seniorScenario": [ ...same shape... ],
        "wrongAnswers":   [ ...strings... ]
      }
  10. { "type": "cheatsheet", "title": "Cheatsheet",
        "content": "| Topic | Rule of thumb | Interview one-liner |\n|---|---|---|\n| ... |" }


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 6 — QUALITY CHECKLIST (run through every item before saving)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILES
  □  Read phase5-day38.json completely before writing?
  □  Read assignments_phase{N}.json and used assignments["{D}"] for the exercise?
  □  Read phase{N}.json and used its title, tags, and prerequisites?

WHY SECTION
  □  Para 1 names a real, specific, observable production failure?
  □  No bullet lists anywhere in this section?
  □  Word count meets the minimum for this level?
  □  Para 6 covers daily-job / code-review / on-call scenario?

THEORY SECTION
  □  ### section count meets the minimum for this level?
  □  Has **Interview angle:** callouts (minimum count per level)?
  □  Has at least one Markdown pipe table?
  □  Final section is a "60-second story" paragraph?
  □  Word count meets the minimum for this level?
  □  Behind-the-scenes mechanism explained (JVM / framework internals)?
  □  "WHAT → WHY → HOW → HOW-TO" answered for the core concept?

CODE SECTIONS
  □  Exactly 3 code entries (basic / intermediate / advanced)?
  □  All 3 are standalone main() — no Spring, no external libraries?
  □  All 3 have non-empty "output" fields traced line by line?
  □  No Math.random / currentTimeMillis / hashCode / UUID.randomUUID?
  □  Intermediate has exactly 4 labelled scenarios with "--- Scenario N: ---" format?
  □  Advanced has exactly 3 separated blocks + a decision reference table?
  □  Package is arch.day{D}; in all code?

PITFALLS
  □  Exactly 8 strings?
  □  Each string has: mistake + production symptom + detection/fix hint?
  □  No vague language ("can cause issues", "may lead to problems")?

EXERCISE
  □  Problem text taken from assignments_phase{N}.json → assignments["{D}"]?
  □  Problem has 4+ numbered requirements?
  □  Solution is a full implementation (not a stub)?
  □  Hints are actionable nudges (not giveaways)?

INTERVIEW
  □  conceptual count matches the target for this level?
  □  Every conceptual answer names a production consequence?
  □  codeBased count matches the target for this level?
  □  seniorScenario count matches the target for this level?
  □  Every seniorScenario answer has all 4 bold labels?
  □  Every Q&A has exactly 2 followUps?
  □  wrongAnswers has exactly 8 strings, each with wrong claim + correction?

CHEATSHEET
  □  Row count matches the target for this level?
  □  Every "Interview one-liner" is a full sentence you can say in an answer?

FINAL
  □  JSON is valid — no trailing commas, no smart/curly quotes, all strings escaped?
  □  Only ONE file created or modified?
  □  Nothing printed to chat — written directly to disk?


════════════════════════════════════════════════════════════════
TARGET ← fill in these fields, then send
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

## Level → Count reference table

| Metric | Beginner | Intermediate | Advanced | Expert |
|---|---|---|---|---|
| Why paragraphs | 4–5 | 5–6 | **6** | **6** |
| Why words | 350–500 | 450–600 | **600–800** | **600–900** |
| Theory ### sections | **8+** | **10+** | **13+** | **13+** |
| Theory words | 1000–1500 | 1500–2000 | **2600–3500** | **2600–3500** |
| Interview angle callouts | **3+** | **5+** | **8+** | **10+** |
| Pipe tables in theory | **1+** | **2+** | **3+** | **4+** |
| Code basic (lines) | 30–50 | 40–60 | 40–60 | 50–70 |
| Code intermediate (lines) | 50–80 | 70–100 | 70–100 | 80–110 |
| Code advanced (lines) | 70–100 | 90–120 | 80–130 | 100–140 |
| Pitfalls | **8** | **8** | **8** | **8** |
| conceptual Q&As | **15** | **15** | **17** | **17** |
| conceptual answer (words) | 80 | 100 | 120 | 150 |
| codeBased Q&As | **10** | **10** | **12** | **12** |
| seniorScenario Q&As | **4** | **5** | **6** | **6** |
| seniorScenario answer (words) | 100 | 150 | 200 | 250 |
| wrongAnswers | **8** | **8** | **8** | **8** |
| Cheatsheet rows | **10** | **12** | **15** | **15** |
| followUp answer (words) | 60 | 60 | 60 | 80 |
| Total file size | ~80–120 KB | ~130–180 KB | ~180–250 KB | ~200–260 KB |

---

## The four questions — check every section answers them

Every section contributes to answering these four questions.
Before saving, scan each section and ask: *does this teach WHAT, WHY, HOW, and HOW-TO?*

| Question | Where it's answered |
|---|---|
| **WHAT** is this concept? | Theory §1–§2, Cheatsheet "Topic" column |
| **WHY** does it exist / what breaks without it? | Why section, Pitfalls, Interview conceptual |
| **HOW** does it work behind the scenes? | Theory internals sections, Advanced code |
| **HOW-TO** use it right now? | Basic + Intermediate code, Exercise solution, codeBased Q&As |

---

## Day → Phase → Level → Track reference

| Days | Phase | Phase title | Level | Track |
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

---

## Full 90-day topic list (for context when writing prerequisites)

**Phase 1 — Java Foundations (Days 1–9)**
Day 1: Introduction to Java — JDK vs JRE vs JVM
Day 2: Data Types and Variables
Day 3: Operators, Control Flow, and Defensive Branching
Day 4: Arrays
Day 5: Strings and String Methods
Day 6: Methods and Recursion
Day 7: Introduction to OOP
Day 8: Packages and Access Modifiers
Day 9: Exception Handling Basics

**Phase 2 — Java OOP & Core APIs (Days 10–18)**
Day 10: Inheritance and Polymorphism
Day 11: Abstract Classes and Interfaces
Day 12: Encapsulation and Immutability
Day 13: Nested and Inner Classes
Day 14: Java Collections Framework
Day 15: Iterators and Enhanced For Loop
Day 16: Comparable and Comparator
Day 17: File I/O and NIO.2
Day 18: Enums and Records

**Phase 3 — Data Structures & Algorithms (Days 19–27)**
Day 19: Complexity Analysis
Day 20: Arrays and Two Pointers
Day 21: Linked Lists
Day 22: Stacks and Queues
Day 23: HashMaps and Hashing
Day 24: Trees
Day 25: Heaps and Priority Queues
Day 26: Sorting and Binary Search
Day 27: Dynamic Programming Basics

**Phase 4 — Java Advanced & Java 17+ (Days 28–37)**
Day 28: Generics Deep Dive
Day 29: Lambda and Functional Interfaces
Day 30: Streams API
Day 31: Optional and Modern Java APIs
Day 32: Java 17 Records and Sealed Classes
Day 33: Pattern Matching and Switch Expressions
Day 34: Concurrency Foundations
Day 35: Advanced Concurrency
Day 36: CompletableFuture and Virtual Threads
Day 37: JVM Internals and GC

**Phase 5 — Spring Ecosystem (Days 38–48)**
Day 38: Spring Core — IoC and Dependency Injection ← GOLD STANDARD
Day 39: Spring Bean Lifecycle and Advanced DI
Day 40: Spring AOP
Day 41: Spring MVC and REST
Day 42: Spring Boot Internals
Day 43: Spring Boot Config and Actuator
Day 44: Spring Data JPA and Hibernate
Day 45: Spring Data Transactions and Locking
Day 46: Spring Security — Authentication
Day 47: Spring Security — OAuth2 and Authorisation
Day 48: Spring WebFlux and Reactive

**Phase 6 — REST API & Microservices (Days 49–58)**
Day 49: REST API Design Principles
Day 50: REST Best Practices and OpenAPI
Day 51: Microservices Principles and DDD
Day 52: Service Discovery and API Gateway
Day 53: Feign, WebClient, and Resilience
Day 54: gRPC and GraphQL
Day 55: Inter-Service Communication Patterns
Day 56: Saga Pattern and Distributed Transactions
Day 57: CQRS and Event Sourcing
Day 58: Advanced Microservices Patterns

**Phase 7 — Kafka & Messaging (Days 59–67)**
Day 59: Kafka Architecture
Day 60: Kafka Producers Deep Dive
Day 61: Kafka Consumers Deep Dive
Day 62: Delivery Semantics and EOS
Day 63: Kafka Streams
Day 64: Schema Registry and Kafka Connect
Day 65: Spring Kafka
Day 66: RabbitMQ and AWS Messaging
Day 67: Distributed Systems Theory

**Phase 8 — Cloud, Databases & DevOps (Days 68–76)**
Day 68: Advanced SQL
Day 69: Transactions and Connection Pooling
Day 70: NoSQL — MongoDB and Cassandra
Day 71: Redis — Caching and Advanced Patterns
Day 72: Docker for Java Applications
Day 73: Kubernetes Core
Day 74: Kubernetes Advanced and Helm
Day 75: AWS for Java Developers
Day 76: CI/CD and Observability

**Phase 9 — Architecture & System Design (Days 77–84)**
Day 77: SOLID and Clean Architecture
Day 78: Design Patterns — Creational
Day 79: Design Patterns — Structural
Day 80: Design Patterns — Behavioral
Day 81: System Design Fundamentals
Day 82: System Design — URL Shortener
Day 83: System Design — Notification Service
Day 84: System Design — E-commerce Order Service

**Phase 10 — Testing, Performance & Mock Interviews (Days 85–90)**
Day 85: JUnit 5 and Mockito
Day 86: Spring Testing and Testcontainers
Day 87: Contract Testing and Advanced Testing
Day 88: JVM Performance and Profiling
Day 89: System Design Case Study and Behavioral
Day 90: Full Mock Interview Simulation

---

## Language rules (non-negotiable across all levels)

| Rule | Wrong | Right |
|---|---|---|
| Name the failure first | "This is bad practice" | "The service returns 200 but nothing is saved — the transaction rolled back silently" |
| Plain English first | "The HashMap implements bucket-based chaining..." | "A HashMap is like a filing cabinet with labeled drawers. When two keys hash to the same drawer, Java chains them as a list." |
| Bold on first use | `the cache grows unbounded` | `the **cache** grows unbounded` |
| One idea per sentence | "This causes OOM because GC can't free objects because heap fills up" | "GC cannot free the objects. Heap fills up. OOM follows." |
| No filler | "As we can see from the above example..." | *(just say the next thing)* |
| WHY not WHAT | "Use constructor injection" | "Use constructor injection so missing deps fail at startup, not at 3am under production load" |
| Mechanism first | "Call stream().filter().collect()" | "The Stream pipeline is lazy — filter() doesn't run until collect() is called. Call it on an empty source and you get no NPE, just an empty list." |
| Production anchor | "This can cause issues at scale" | "At 10k concurrent users, a single synchronized block becomes a bottleneck — throughput drops 40% and latency p99 spikes to 2s" |

---

## Code rules (non-negotiable)

| Rule | What breaks if ignored |
|---|---|
| No `Math.random()` | Output differs per run — the "output" field is always wrong |
| No `hashCode()` | Output differs per JVM version and object layout |
| No `currentTimeMillis()` | Output is stale the moment you write it |
| No `UUID.randomUUID()` | Non-deterministic — same as Math.random |
| Standalone `main()` | Without this, learner cannot run or trace the code without a full project |
| Spring as `// comments` | Keeps the file self-contained — no Spring context needed to understand the pattern |
| `package arch.day{D};` | Consistent across all 90 days — learner can grep the whole course |
| 4 labelled scenarios in intermediate | Learner knows the structure immediately — no surprises across 90 days |
| 3 blocks + decision table in advanced | Decision table is the single most useful artifact in an interview setting |
