# Satyverse Java Mastery — Claude Execution Prompt
## This prompt is written FOR Claude to execute directly (not for Cursor)

> Claude reads files with its Read tool, writes JSON with Write/Bash, and validates with node.
> This is a self-contained execution guide — not a Cursor Composer prompt.

---

## How to execute

Tell Claude: "Execute this prompt for Day {D}"
Claude will:
1. Read this file to understand the rules
2. Read the three reference files
3. Generate the full JSON content in a Node.js script
4. Run the script to write the file
5. Validate the output counts

---

## What makes this different from the Cursor prompt

This prompt adds two dimensions the Cursor version lacks:

### JOB-READY content requirements

Each day file must include content that prepares the learner for real daily work — not just interviews.
Job-ready means: you can open IntelliJ tomorrow and write this pattern without googling.

Every theory section must cover, where relevant:
- Which real frameworks use this pattern (Spring, Hibernate, Jackson, Guava, Kafka client)
- How IDEs (IntelliJ IDEA) warn you about violations — exact warning name
- How to detect the problem in production (log pattern, JFR event, heap dump signature, JVM flag)
- The migration pattern from the wrong approach to the right one
- The code-review checklist item: "In PR review, reject if you see X because Y"

### INTERVIEW-READY content requirements

Every conceptual Q&A must be written as if the candidate is being coached the night before:
- The answer starts with the 1-sentence definition (what you say in the first 5 seconds)
- Then the mechanism (what you say in the next 20 seconds)
- Then the production consequence (what you say to prove you've lived it)
- No filler — every sentence earns its place
- seniorScenario answers must include real commands/configs/flags the interviewer expects

---

## ABSOLUTE RULES

OUTPUT = exactly ONE file: `public/data/days/phase{N}-day{D}.json`

FORBIDDEN IN CODE SECTIONS:
  ✗ Math.random(), System.currentTimeMillis(), hashCode(), UUID.randomUUID()
  ✗ External library imports (no Spring, Jackson, Guava annotations in runnable code)
  ✗ Unverified output fields — trace every println by hand

JSON ENCODING:
  → Straight ASCII double-quotes only (U+0022) — never curly quotes
  → All " inside string values escaped as \"
  → All newlines in string values as \n
  → No trailing commas

---

## STEP 1 — READ BEFORE WRITING

Read these three files completely before writing a single line of content:

1. `public/data/days/phase5-day38.json` — gold standard for depth and structure
2. `public/data/assignments_phase{N}.json` — use assignments["{D}"] for the exercise
3. `public/data/phase{N}.json` — title, tags, prerequisites, learningObjectives

---

## STEP 2 — COURSE PHILOSOPHY

Every day file must answer four questions. Check each section against these:

  WHAT    — Plain-English definition first. No jargon until the plain version is solid.
  WHY     — What breaks without it? Name the real production failure, symptom, on-call page.
  HOW     — What happens inside the JVM/framework/OS? Step by step. Not "it just works."
  HOW-TO  — Code that runs. Output that is verified. Pattern I can use in a PR tomorrow.

Write like a staff engineer mentoring a junior at their desk.
Direct. Specific. Zero padding.

TONE:
  • Short sentences. One idea. Full stop.
  • Name the failure before the fix.
  • Bold the term the first time you use it in each section.
  • Never: "it's important to note", "in conclusion", "as we can see"
  • Never write a definition that only restates the word being defined.
  • Treat the reader as smart — never condescending, never over-explaining basics

---

## STEP 3 — LEVEL CALIBRATION

### BEGINNER (Days 1–18 · Fresher)
- WHY: Start with everyday analogy. "Without this, you would..."
- THEORY: Define every term before using it. Show syntax → correct example → wrong example.
- CODE: No imports except java.util.*. Output is dead simple static strings.
- INTERVIEW: 15 conceptual + 10 codeBased + 4 seniorScenario + 8 wrongAnswers + 10-row cheatsheet

### INTERMEDIATE (Days 19–37 · Mid-Level transition)
- WHY: Lead with real bug they'd encounter at work. Para 1 = the symptom.
- THEORY: Algorithm/mechanism step by step. Big-O tables. "Common interview trap" callouts.
- CODE: Intermediate shows 4 scenarios; Advanced implements the algorithm from scratch.
- INTERVIEW: 15 conceptual + 10 codeBased + 5 seniorScenario + 8 wrongAnswers + 12-row cheatsheet

### ADVANCED (Days 38–67 · Mid-Level/Senior)
- WHY: 6 paragraphs, 600+ words, production failures lead every paragraph.
- THEORY: 13+ sections, 2600+ words, 8+ Interview angle callouts, 3+ tables.
- INTERVIEW: 17 conceptual + 12 codeBased + 6 seniorScenario + 8 wrongAnswers + 15-row cheatsheet

### EXPERT (Days 68–90 · Senior)
- WHY: Architecture trade-offs and org impact. "The incident that taught the industry..."
- THEORY: 13+ sections, first-principles reasoning, "When to choose" column in tables, capacity math.
- CODE: Intermediate = multi-component scenario. Advanced = implements the distributed algorithm.
- INTERVIEW: 17 conceptual + 12 codeBased + 6 seniorScenario + 8 wrongAnswers + 15-row cheatsheet

---

## STEP 4 — SECTION REQUIREMENTS

### SECTION 1 · WHY (flowing prose only — NO bullets)

Required paragraph structure:

  Para 1 — The failure: What goes wrong in prod when this is misunderstood?
            Symptom. Environment. When it surfaces. Make it visceral.
  Para 2 — What the interviewer tests: Not API recall — what mental model?
            What do 80% of candidates miss that the top 20% get right?
  Para 3 — 4-step answer pattern: How to structure any strong answer on this topic.
            Coaching the learner HOW to think, not just WHAT to say.
  Para 4 — Scale: What breaks when team grows from 3 to 30 engineers?
            What fails at 10× traffic that works fine on a laptop?
  Para 5 — Senior signal: The one insight that marks senior vs mid-level.
            Version number, class name, failure mode, capacity threshold — be specific.
  Para 6 — Daily-job angle: Code review? On-call? Architecture review?
            "In your first 3 months at a new job, you will see this when..."

  (Beginner: 4–5 paragraphs · Intermediate: 5–6 · Advanced/Expert: all 6)

### SECTION 2 · THEORY (numbered ### sections — teach mechanism, not usage)

Structure across sections:
  Opening §: Plain-English definition → precise definition → mechanism step by step
  Mid §: Production behaviors, failures at scale, configuration mistakes
         Every claim has a consequence: "Skip this and X breaks."
         At least one pipe table comparing options, behaviors, or trade-offs
  Advanced § internals: JVM bytecode level, framework source level, OS level
                        Real Java class names (not paraphrased)
                        Short code snippets (under 15 lines) to show mechanism
  JOB-READY § (at least 1 section): Real framework interactions, IDE warning names,
              production detection (log pattern / JFR event / heap dump), migration path,
              code-review checklist item
  Final §: "60-second story" — one paragraph, 100–150 words
            WHAT → HOW → WHY → production failure → fix
            This is what the learner says out loud in the interview

Required callout patterns (use these exact bold formats):
  **Interview angle:** — what the interviewer looks for here
  **Common mistake:** — what devs get wrong and why it breaks
  **Behind the scenes:** — what the JVM/framework/OS actually does
  **At scale:** — what changes at 10× team or traffic size
  **In practice:** — real library/framework that uses this pattern

Count targets:
  Beginner:      8+ sections · 1000–1500 words · 1+ table · 3+ callouts
  Intermediate: 12+ sections · 1800–2500 words · 2+ tables · 5+ callouts
  Advanced:     13+ sections · 2600–3500 words · 3+ tables · 8+ callouts
  Expert:       13+ sections · 2600–3500 words · 4+ tables · 10+ callouts

### SECTIONS 3–5 · CODE (basic / intermediate / advanced)

Universal rules:
  ✓ Standalone public class with public static void main(String[] args)
  ✓ Compiles with JDK only — no external dependencies
  ✓ Package: package arch.day{D};
  ✓ Framework patterns shown as // comments, not real annotations
  ✓ "output" field = exact stdout traced line by line — never guessed
  ✗ No Math.random(), currentTimeMillis(), hashCode(), UUID.randomUUID()
  ✗ No external imports (only java.util.*, java.util.function.*, java.util.concurrent.*)

BASIC:
  Purpose: print a reference table or comparison matrix for this topic
  All output is hardcoded static strings — trace with a finger
  Line counts: Beginner 30–50 · Intermediate 40–60 · Advanced 40–60 · Expert 50–70

INTERMEDIATE:
  Purpose: simulate the REAL mechanism this topic describes
  Structure: exactly 4 labelled scenarios ("--- Scenario N: description ---")
  Story arc: 1=normal case → 2=variant → 3=bug/trap → 4=fix
  Each scenario: 3–8 printed lines showing the mechanism
  Line counts: Beginner 50–80 · Intermediate 70–100 · Advanced 70–100 · Expert 80–110

ADVANCED:
  Purpose: implement the core algorithm that this topic is built on
  NOT just using the API — implement what it does internally
  Structure: at least one inner class/record + 3 separated blocks + decision table at end
  Line counts: Beginner 70–100 · Intermediate 90–120 · Advanced 80–130 · Expert 100–140

### SECTION 6 · DIAGRAM (PlantUML only)

  • @startuml … @enduml
  • 1–2 sentence description of exactly what it shows and why it matters
  • Sequence diagram for request/response flows; activity for algorithms
  • Minimum 6 participants/components
  • Include alt/loop/group block if flow has conditional or retry

### SECTION 7 · PITFALLS (exactly 8 strings)

Each string: "MISTAKE — PRODUCTION SYMPTOM — HOW TO DETECT OR FIX IT."
  ✓ Mistake: real engineering mistake not a textbook warning
  ✓ Symptom: specific observable failure — not "issues" or "problems"
  ✓ Fix: names the actual change or command to run
  ✗ Never: "this can cause issues", "be careful with", "may lead to problems"

### SECTION 8 · EXERCISE

  • problem: from assignments_phase{N}.json → assignments["{D}"] → use the primary scenario
             Real-world framing. 4+ numbered requirements. Not a stub.
  • hints: exactly 3 strings — actionable nudges, not giveaways
           Hint 1: right approach, Hint 2: main trap, Hint 3: fix pattern
  • solution: package arch.day{D}; main() with deterministic output
              Javadoc at top referencing the assignment goal
              Inline comments explain every non-obvious decision
              solution.output traced line by line

### SECTION 9 · INTERVIEW

INTERVIEW-READY FORMAT for conceptual answers:
  Line 1: 1-sentence definition (say this in the first 5 seconds of the answer)
  Lines 2–4: mechanism explanation (what the JVM/framework does)
  Lines 5–7: production consequence ("if you get this wrong, X breaks in prod")
  Lines 8+: Java/Spring class names, comparison, or edge case

▸ conceptual — WHAT and WHY and HOW it works
  question: "How does X behave when Y?" — specific, not "What is X?"
  answer: Bold key terms on first use. Mechanism, not definition. Production consequence.
          Min words: Beginner 80 · Intermediate 100 · Advanced 120 · Expert 150
  followUps: exactly 2. Deeper — edge case, failure mode, comparison. Min 60 words each.

▸ codeBased — HOW TO USE it in code
  question: "Show me...", "What does this code do?", "What's wrong with this?"
  answer: 8–15 // comment lines. Annotation + method + behavior/output.
  followUps: exactly 2. At least one = variant (error case, security, performance).

▸ seniorScenario — production incidents and architectural decisions
  question: "Your service is doing X and Y is happening — what do you do?"
  answer: Structure MUST be:
            **(1) Immediate response** — first action when incident hits
            **(2) Root cause** — mechanism that caused this
            **(3) Fix** — numbered steps, real CLI commands (curl, kubectl, jcmd, psql, etc.)
            **(4) Prevention** — config or process change so it never recurs
          Bold all four labels. Min words: Beginner 100 · Intermediate 150 · Advanced 200 · Expert 250
  followUps: exactly 2. SLO impact, rollback, cost, team process. Min 80 words each.

▸ wrongAnswers — exactly 8 strings
  "Wrong claim — correction with actual mechanism."
  Topic-specific. Sounds plausible to a candidate at that level.
  Both the wrong belief AND the correct mechanism in the string.

COUNT TABLE:
  Level          conceptual   codeBased   seniorScenario   wrongAnswers
  Beginner            15          10              4               8
  Intermediate        15          10              5               8
  Advanced            17          12              6               8
  Expert              17          12              6               8

### SECTION 10 · CHEATSHEET (Markdown pipe table)

Columns: | Topic | Rule of thumb | Interview one-liner |
  • "Topic": specific concept, class, or annotation name
  • "Rule of thumb": one practical decision rule — NOT a definition
  • "Interview one-liner": a sentence you say verbatim in an answer
  • Rows span full topic — basics through advanced sub-topics
  • No duplicates

Row counts: Beginner 10 · Intermediate 12 · Advanced 15 · Expert 15

---

## STEP 5 — JSON STRUCTURE

```json
{
  "day": D,
  "title": "...",
  "estimatedHours": N,
  "difficulty": "Beginner|Intermediate|Advanced|Expert",
  "level": "Beginner|Intermediate|Advanced|Expert",
  "track": "Fresher|Mid-Level|Senior",
  "tags": ["..."],
  "prerequisites": ["Day N — Topic Name"],
  "learningObjectives": ["..."],
  "sections": [
    { "type": "why",      "title": "Why [Topic] matters",              "content": "..." },
    { "type": "theory",   "title": "Theory and Internals — [Topic]",   "content": "..." },
    { "type": "code",     "level": "basic",        "title": "Basic — ...",
      "language": "java", "filename": "Day{D}Basic.java",
      "description": "...", "code": "...", "output": "..." },
    { "type": "code",     "level": "intermediate", "title": "Intermediate — ...",
      "language": "java", "filename": "Day{D}Intermediate.java",
      "description": "...", "code": "...", "output": "..." },
    { "type": "code",     "level": "advanced",     "title": "Advanced — ...",
      "language": "java", "filename": "Day{D}Advanced.java",
      "description": "...", "code": "...", "output": "..." },
    { "type": "diagram",  "title": "...", "diagramType": "sequence",
      "description": "...", "plantuml": "@startuml\n...\n@enduml" },
    { "type": "pitfalls", "title": "Common Pitfalls", "items": ["...", "...", "...", "...", "...", "...", "...", "..."] },
    { "type": "exercise", "title": "Exercise — ...",
      "problem": "...", "hints": ["...", "...", "..."],
      "solution": { "language": "java", "filename": "Day{D}Exercise.java", "code": "...", "output": "..." } },
    { "type": "interview",
      "conceptual":     [ { "question": "...", "answer": "...", "followUps": [{"question":"...","answer":"..."}, {"question":"...","answer":"..."}] } ],
      "codeBased":      [ ... ],
      "seniorScenario": [ ... ],
      "wrongAnswers":   [ "Wrong claim — correction.", ... ]
    },
    { "type": "cheatsheet", "title": "Cheatsheet",
      "content": "| Topic | Rule of thumb | Interview one-liner |\n|---|---|---|\n| ... |" }
  ]
}
```

---

## STEP 6 — QUALITY CHECKLIST

  □ Read phase5-day38.json completely?
  □ Used assignments["{D}"] from assignments file for exercise?
  □ WHY: production failure in Para 1? No bullet lists? Word count met?
  □ WHY: Para 6 covers daily-job / code-review / on-call?
  □ THEORY: section count met for level? Tables? Interview angle callouts?
  □ THEORY: "Behind the scenes" for JVM/framework? "In practice" for real library?
  □ THEORY: Final "60-second story" section?
  □ CODE: 3 entries? All standalone main()? Output traced by hand?
  □ CODE: Intermediate has exactly 4 labelled scenarios?
  □ CODE: Advanced has 3 separated blocks + decision table?
  □ PITFALLS: Exactly 8? Each has mistake + symptom + detect/fix?
  □ EXERCISE: 4+ requirements? Full solution (not stub)?
  □ INTERVIEW: Q&A counts match level? Every seniorScenario has 4 bold labels?
  □ INTERVIEW: Every conceptual answer names a production consequence?
  □ CHEATSHEET: Row count matches level?
  □ JSON valid? No trailing commas? No smart quotes?
  □ Only ONE file written?

---

## LEVEL → COUNT REFERENCE

| Metric | Beginner | Intermediate | Advanced | Expert |
|---|---|---|---|---|
| Why paragraphs | 4–5 | 5–6 | 6 | 6 |
| Why words | 350–500 | 500–650 | 600–800 | 700–900 |
| Theory sections | 8+ | 12+ | 13+ | 13+ |
| Theory words | 1000–1500 | 1800–2500 | 2600–3500 | 2600–3500 |
| Interview angle callouts | 3+ | 5+ | 8+ | 10+ |
| Pipe tables in theory | 1+ | 2+ | 3+ | 4+ |
| conceptual Q&As | 15 | 15 | 17 | 17 |
| codeBased Q&As | 10 | 10 | 12 | 12 |
| seniorScenario Q&As | 4 | 5 | 6 | 6 |
| wrongAnswers | 8 | 8 | 8 | 8 |
| Cheatsheet rows | 10 | 12 | 15 | 15 |

---

## DAY → PHASE → LEVEL → TRACK

| Days | Phase | Level | Track |
|---|---|---|---|
| 1–9 | phase1 — Java Foundations | Beginner | Fresher |
| 10–18 | phase2 — Java OOP & Core APIs | Beginner | Fresher |
| 19–27 | phase3 — Data Structures & Algorithms | Intermediate | Fresher |
| 28–37 | phase4 — Java Advanced & Java 17+ | Intermediate | Mid-Level |
| 38–48 | phase5 — Spring Ecosystem | Advanced | Mid-Level |
| 49–58 | phase6 — REST API & Microservices | Advanced | Mid-Level |
| 59–67 | phase7 — Kafka & Messaging | Advanced | Senior |
| 68–76 | phase8 — Cloud, Databases & DevOps | Advanced | Senior |
| 77–84 | phase9 — Architecture & System Design | Expert | Senior |
| 85–90 | phase10 — Testing, Performance & Mock Interviews | Expert | Senior |
