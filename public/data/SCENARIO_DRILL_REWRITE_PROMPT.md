# Scenario Drill Rewrite — Cursor AI Prompt

## How to use

1. Open Cursor → Composer (`Ctrl+I`)
2. Copy everything inside the triple-backtick block below
3. Fill in the **three fields** in the `TARGET` section at the bottom
4. Send — Cursor reads the gold standard and rewrites the target file directly

---

## Cursor Prompt

```
════════════════════════════════════════════════════════
⛔  ABSOLUTE RULES — READ BEFORE ANYTHING ELSE
════════════════════════════════════════════════════════

OUTPUT = exactly ONE file, nothing else:
  • public/data/days/scenarioDrill-day{D}.json

FORBIDDEN:
  ✗  Do not create any other file
  ✗  Do not create any folder
  ✗  Do not print the JSON to chat — write it directly to the file
  ✗  Do not add markdown fences around the JSON output

You are done when the single JSON file is saved. That is all.

════════════════════════════════════════════════════════


You are rewriting a scenario drill file for the Satyverse Java Interview Mastery app.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1 — READ THESE FILES FIRST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@public/data/days/scenarioDrill-day38.json   ← GOLD STANDARD — read this completely
@public/data/days/phase{N}-day{D}.json       ← source of truth for the day's topic and subtopics
@public/data/phase{N}.json                   ← get the day's title, tags, learningObjectives

Read all three files before writing a single character.
Every scenario you write must match or exceed scenarioDrill-day38.json in depth,
length, and language quality. That file is your minimum bar, not your ceiling.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 2 — UNDERSTAND THE GOLD STANDARD (day 38)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Study exactly what makes day 38 the gold standard:

QUESTION PATTERN:
  • Written as a real situation, not an abstract question
  • Always names a character (engineer, team, you are on-call, etc.)
  • Contains a specific, concrete problem — not "explain X"
  • Feels like something that actually happened on a project

ANSWER PATTERN:
  • Minimum 150 words — most answers are 200–300 words
  • Opens by naming what is actually happening (root cause first)
  • Uses **bold** for every key technical term on first use
  • Has clear structure: problem → mechanism → concrete fix → validation
  • Includes code snippets inline as markdown code blocks where relevant
  • Named numbered steps (Step 1, Step 2…) for diagnostic sequences
  • Ends with a production consequence or a strong closing statement
  • Plain English sentences — one idea per sentence
  • Never says "this is important" — always says what breaks if you skip it

FOLLOW-UP PATTERN (exactly 2 per scenario):
  • Each follow-up is a real deeper question the interviewer would ask next
  • Each follow-up answer: minimum 80 words
  • Follow-up 1 pushes on a variant, edge case, or failure mode of the main scenario
  • Follow-up 2 pushes on a related concept, trade-off, or "what would you do next"
  • Neither follow-up is a summary of the main answer
  • Both feel like genuine second-round interview pressure

SIGNALS PATTERN:
  • Exactly 4 keyword strings per scenario
  • These are the technical terms an interviewer listens for
  • They must appear (bolded) somewhere in the answer


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 3 — WRITING VOICE (apply everywhere)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Target reader: a strong intermediate Java/Spring developer preparing for senior roles.

DO:
  • Short sentences. One main idea per sentence.
  • Name the production failure before naming the concept.
  • Bold every key interview term on first use in each answer.
  • For operational topics: include numbered steps and real CLI commands
    (curl, kubectl, jcmd, kafka-consumer-groups.sh, redis-cli, psql, etc.)
    only when they fit naturally — not forced.
  • Teach the mechanism, then state the fix, then state how to verify it worked.
  • Code snippets: use Java or relevant config — keep them short and purposeful.

DON'T:
  • Do not say "this is important" without saying what breaks.
  • Do not stack three abstract nouns without a concrete example.
  • Do not use passive voice when you can say who does what.
  • Do not pad answers with filler phrases ("In conclusion", "As we can see").
  • Do not repeat the question in the answer.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 4 — REQUIRED JSON STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Top-level shape (no extra keys, same key order as gold standard):
{
  "day": {D},
  "title": "...",
  "phaseId": "phase{N}",
  "tags": ["...", "...", "...", "...", "...", "...", "...", "..."],
  "scenarios": [ ...10 objects... ]
}

Each scenario object:
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

Rules:
  • "tags": 6–8 strings covering the main technical concepts of the day
  • "id": d{day number}-s{1 through 10}
  • "signals": exactly 4 strings — technical keywords the interviewer expects to hear
  • "answer": minimum 150 words, bold key terms, structured
  • "followUps": exactly 2 objects, each answer minimum 80 words
  • No trailing commas anywhere
  • Escape all " inside strings as \"
  • Newlines inside strings as \n


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 5 — THE 10 SCENARIO TYPES (one each, in this order)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Write exactly one scenario for each type. The scenario must be specific to today's topic.
Do not use generic placeholders. Every scenario is about a real situation this engineer would face.

TYPE 1 — CODE REVIEW CRITIQUE
  Question shape: "You are reviewing this code: [specific bad pattern from today's topic]. 
                   A colleague says it works fine. What is wrong?"
  Answer must: name exactly what breaks in production, explain the mechanism, 
               show the fix with a code snippet, state how to verify.

TYPE 2 — PRODUCTION INCIDENT
  Question shape: "You are on-call. [Specific symptom] is happening. Walk me through 
                   exactly how you diagnose and fix this."
  Answer must: open with stabilization step, then give numbered diagnostic steps,
               name specific tools/commands used, identify root cause, apply fix, verify.
  Commands: always include at least one real command (kubectl, jcmd, curl, etc.)

TYPE 3 — DESIGN CHOICE
  Question shape: "Your team is choosing between [Option A] and [Option B] for [specific 
                   use case]. What are the real trade-offs and which do you recommend?"
  Answer must: explain both options fairly, name the real production trade-offs for each,
               give a clear recommendation, name the conditions that would flip the recommendation.

TYPE 4 — INTERNAL DEEP DIVE
  Question shape: "Walk me through exactly what happens inside [Spring/JVM/Kafka/etc.] 
                   when [specific mechanism from today's topic] runs."
  Answer must: explain the internal phases/steps in order, use exact class/interface names
               where relevant, connect internals to observable production behavior.

TYPE 5 — TRADE-OFF ANALYSIS
  Question shape: "Pros and cons of [specific approach from today's topic] at scale — 
                   when does it break down?"
  Answer must: give at least 3 genuine pros and 3 genuine cons with specific numbers or
               thresholds where possible, state the scale/load point where the trade-off flips.

TYPE 6 — GOTCHA
  Question shape: "This code passes all tests but fails in production under [specific condition].
                   Why?"
  Answer must: identify the exact gap between test and production conditions,
               explain why the test could not catch it, give the fix and a test that would
               have caught it.

TYPE 7 — SENIOR ARCHITECTURAL
  Question shape: "Design [specific system or component] that handles [scale/constraint] 
                   using today's topic as the core mechanism."
  Answer must: give a concrete architecture with named components, explain the key design
               decisions, address the stated scale/constraint explicitly, name one thing that
               would change if the scale increased 10x.

TYPE 8 — SECURITY OR CORRECTNESS
  Question shape: "What security or correctness problem does [specific pattern from today's 
                   topic] introduce that most engineers miss?"
  Answer must: name the exact vulnerability or bug, explain the attack vector or failure
               condition, give a code-level fix, name a real CVE or incident type if one
               exists for this class of problem.

TYPE 9 — SCALE AND PERFORMANCE
  Question shape: "Your service is handling 50k requests/second and [specific bottleneck 
                   related to today's topic] is the limiting factor. What do you do?"
  Answer must: quantify the bottleneck, give at least two distinct optimizations with
               expected impact, name the measurement that confirms improvement,
               name what you would monitor in production.

TYPE 10 — MISCONCEPTION
  Question shape: "A new engineer on your team believes [specific wrong belief about 
                   today's topic]. How do you correct this and what is the right mental model?"
  Answer must: state the wrong belief clearly, explain exactly why it is wrong with a
               concrete counter-example, give the correct mental model in plain language,
               name a real bug this misconception causes.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 6 — QUALITY CHECKLIST (run through before saving)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  □  Did I read scenarioDrill-day38.json fully before writing?
  □  Exactly 10 scenarios, one per type listed in Step 5?
  □  Every scenario question is specific to today's topic — no generic placeholders?
  □  Every answer is minimum 150 words?
  □  Every answer has bold key terms on first use?
  □  Every answer names a production consequence or failure mode?
  □  Production incident (Type 2) includes at least one real CLI command?
  □  Every scenario has exactly 4 signals?
  □  Every scenario has exactly 2 followUps?
  □  Every followUp answer is minimum 80 words?
  □  No followUp is a summary of the main answer?
  □  Valid JSON — no trailing commas, all " escaped as \"?
  □  Only ONE file created or modified?


════════════════════════════════════════════════════════
TARGET  ← fill in the three fields below, then send
════════════════════════════════════════════════════════

Day number   :
Phase number :
Topic        :
Day file     : @public/data/days/phase{N}-day{D}.json
Phase file   : @public/data/phase{N}.json
Output file  : public/data/days/scenarioDrill-day{D}.json
```

---

## Quick reference — scenario type order

Always write scenarios in this exact order so the file is consistent across all days:

| # | Type | What makes a strong answer |
|---|------|---------------------------|
| 1 | Code review critique | Name the exact production failure + show the fix |
| 2 | Production incident | Numbered steps + real commands + verify the fix |
| 3 | Design choice | Both options fairly + recommendation + flip condition |
| 4 | Internal deep dive | Phase-by-phase + exact class names + observable behavior |
| 5 | Trade-off analysis | 3 pros + 3 cons + scale threshold where it flips |
| 6 | Gotcha | Test gap explained + fix + test that would have caught it |
| 7 | Senior architectural | Named components + design decisions + 10x scale answer |
| 8 | Security/correctness | Exact vulnerability + attack vector + code fix |
| 9 | Scale/performance | Quantified bottleneck + 2 optimizations + monitoring metric |
| 10 | Misconception | Wrong belief + counter-example + correct mental model + real bug |

## Word count targets

| Field | Minimum | Aim for |
|-------|---------|---------|
| scenario `answer` | 150 words | 200–300 words |
| followUp `answer` | 80 words | 100–150 words |
| total file | ~3 000 words | ~4 000–5 000 words |

## Language rules (non-negotiable)

| Rule | Example of wrong | Example of right |
|------|-----------------|-----------------|
| Name the failure | "This is bad practice" | "The pod restarts with OOMKilled because thread stacks exhaust container memory" |
| Bold on first use | `the cache grows unbounded` | `the **cache** grows unbounded` |
| One idea per sentence | "This causes issues because GC cannot free objects and heap fills up and OOM occurs" | "GC cannot free the objects. Heap fills up. OOM follows." |
| No filler | "As we can see from the above..." | *(just say the next thing)* |
| Production anchor | "This can cause problems" | "On-call gets paged when the 5xx rate crosses 1%" |

## Day → Phase reference

| Days | Phase file | scenarioDrill prefix |
|------|-----------|----------------------|
| 1–9 | `phase1.json` | `scenarioDrill-day{D}` |
| 10–18 | `phase2.json` | `scenarioDrill-day{D}` |
| 19–27 | `phase3.json` | `scenarioDrill-day{D}` |
| 28–37 | `phase4.json` | `scenarioDrill-day{D}` |
| 38–48 | `phase5.json` | `scenarioDrill-day{D}` |
| 49–58 | `phase6.json` | `scenarioDrill-day{D}` |
| 59–67 | `phase7.json` | `scenarioDrill-day{D}` |
| 68–76 | `phase8.json` | `scenarioDrill-day{D}` |
| 77–84 | `phase9.json` | `scenarioDrill-day{D}` |
| 85–90 | `phase10.json` | `scenarioDrill-day{D}` |
