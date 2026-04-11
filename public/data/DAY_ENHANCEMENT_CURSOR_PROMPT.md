# Cursor AI — Day Enhancement Prompt
# Java Prep App | Fresher → Senior Developer → Technical Lead → Staff/Architect

---

## HOW TO USE
- Paste this entire prompt into Cursor once.
- It processes the day in CURRENT TARGET below.
- When the user types **"continue"**, move to the next day.
- Never ask the user a question. Never suggest alternatives. Just execute.

---

## CURRENT TARGET
```
File : public/data/days/phase1-day28.json
Day  : 28
```

---

## BEFORE YOU WRITE ANYTHING

Read `public/data/days/phase1-day28.json` fully.
Read `public/data/days/phase1-day1.json` as your quality reference.
The title and topic are already inside the JSON — read them, never guess.

---

## THE FOUR LEARNER LEVELS

Every section of every day must be organised in this exact progression.
Go in this order every time, without skipping any level:

```
Fresher  →  Senior Developer  →  Technical Lead  →  Staff / Architect
```

| Level | Who | What they need from this content |
|-------|-----|----------------------------------|
| **Fresher** | Just started, 0–1 yr | What is this thing? Why does it exist? Show me the simplest working example |
| **Senior Developer** | Writing features, 1–3 yr | How does it really work? What goes wrong? What pattern should I follow? |
| **Technical Lead** | Owns a service or team, 3–5 yr | How do I make the right design decision? How do I explain this to my team? |
| **Staff / Architect** | System-level ownership, 5+ yr | What breaks at scale? What does the JVM do internally? How do I diagnose it on-call? |

**Language rule for all levels:**
Write every single paragraph — even the Staff/Architect ones — in simple, plain,
easy-to-read language. Deep knowledge does not need complicated sentences.
If a 16-year-old who is smart but new to Java cannot follow the sentence, rewrite it.
Use short sentences. Use "you". Avoid jargon unless you immediately explain it.

---

## STEP 1 — GAP CHECK

Print this table with actual numbers filled in:

| Section | Need | Have | Fix? |
|---------|------|------|------|
| WHY — word count | ≥ 600 | ? | ? |
| WHY — all 4 levels covered | yes | ? | ? |
| THEORY — ### sections total | ≥ 16 | ? | ? |
| THEORY — Fresher subsections | ≥ 3 | ? | ? |
| THEORY — Senior Dev subsections | ≥ 4 | ? | ? |
| THEORY — Tech Lead subsections | ≥ 3 | ? | ? |
| THEORY — Staff subsections | ≥ 3 | ? | ? |
| THEORY — pipe tables | ≥ 3 | ? | ? |
| THEORY — interview angle lines | ≥ 13 | ? | ? |
| CODE basic (Fresher) — lines | 40–60 | ? | ? |
| CODE intermediate (Senior Dev) — scenarios | ≥ 4 | ? | ? |
| CODE intermediate (Senior Dev) — lines | 70–100 | ? | ? |
| CODE advanced (Tech Lead + Staff) — blocks | ≥ 3 | ? | ? |
| CODE advanced (Tech Lead + Staff) — lines | 60–100 | ? | ? |
| PITFALLS — Fresher items | 2 | ? | ? |
| PITFALLS — Senior Dev items | 2 | ? | ? |
| PITFALLS — Tech Lead items | 2 | ? | ? |
| PITFALLS — Staff items | 2 | ? | ? |
| EXERCISE — Fresher task | exists | ? | ? |
| EXERCISE — Staff task | exists | ? | ? |
| INTERVIEW conceptual — count | ≥ 15 | ? | ? |
| INTERVIEW conceptual — avg words | ≥ 120 | ? | ? |
| INTERVIEW codeBased — count | ≥ 8 | ? | ? |
| INTERVIEW seniorScenario — count | ≥ 5 | ? | ? |
| INTERVIEW seniorScenario — avg words | ≥ 200 | ? | ? |
| INTERVIEW wrongAnswers — count | 8 | ? | ? |
| INTERVIEW jobSwitch | must exist | ? | ? |
| MCQ basic — count | 8 | ? | ? |
| MCQ intermediate — count | 12 | ? | ? |
| MCQ advanced — count | 10 | ? | ? |
| CHEATSHEET — rows | ≥ 12 | ? | ? |

---

## STEP 2 — WRITE THE SCRIPT

Write `scripts/enhance-day{N}-staff.mjs`:
- Read the JSON file
- Fix only the sections that failed above
- Write the result back
- Print this verification at the end:
  - WHY word count
  - THEORY ### count + how many per level band
  - Conceptual: count + every word count listed
  - SeniorScenario: count + every word count listed
  - JobSwitch: true or false
  - MCQ counts by level
  - Code line counts [basic, intermediate, advanced]
  - File size in characters

Leave any section that already passes completely untouched.

---

## STEP 3 — RUN IT

```bash
node scripts/enhance-day{N}-staff.mjs
```

If any check still fails, fix it and run again.
Only mark the day complete when every single row in the gap table passes.

---
---

# HOW TO WRITE EACH SECTION

---

## SECTION 1 — WHY

**Length:** 600–750 words. 6–7 paragraphs. No bullet lists anywhere.

**Purpose:** When someone reads this, they should feel motivated to learn the
topic — not because an exam is coming, but because they can see exactly where
it matters in a real job. Every level of reader should find something for them.

**How to write it — follow this progression naturally:**

**For the Fresher reader** — open with a short, relatable story of something
going wrong. Not a definition. Not "in this lesson". A real situation. Maybe a
developer gets an error at 2am, or a deployment breaks, or a test passes locally
but fails in CI. Name the time, the system, what the error message said.
Keep it simple. The fresher should think "oh, so that is why this concept exists."
One or two paragraphs.

**For the Senior Developer reader** — after the story, explain what interviewers
actually look for when they ask about this topic. Most people think interviewers
want a definition. They do not. They want to know if you understand consequences.
Show the difference between a weak answer and a strong one at this level.
Also explain what goes wrong when a team of 10 engineers gets this wrong — name
two real error messages or failure modes, and explain why they look like
application bugs but are actually a misunderstanding of the concept.
One or two paragraphs.

**For the Technical Lead reader** — give a 4-step pattern they can use when
answering questions about this topic, and also when explaining it to their team.
Steps should be clear and numbered. Each step is one actionable thing: name the
thing, say what it does, say what breaks if it is wrong, say how to check.
Also talk about what happens at team scale — 50 services, rolling deploys,
version mismatches across environments.
One paragraph.

**For the Staff / Architect reader** — give one specific production fact that
separates a Staff-level answer from a Senior Developer answer. Something tied to
a JVM version, a GC algorithm, a config flag, or a tool. Make it real and precise.
Then close with 3 short situations from the first six months at a new company
where this topic will come up. Two sentences each: the context, and what you do.
One or two paragraphs.

**Tone:** Write in second person — "you", "your team", "when you join a company".
Bold every Java keyword, error name, and tool name on first use.
Never use numbered paragraphs in the output. It should read like one flowing piece.
Every sentence should be something a real person would say, not a textbook.

---

## SECTION 2 — THEORY

**Total: at least 16 `###` subsections.** Organised into 4 level bands.

Always open with this exact subsection:
`### Plain-language overview`
One paragraph. No jargon. No assumed knowledge. Explain the concept the way you
would to a smart person who has never heard of it. Short sentences.

---

**Fresher band — at least 3 subsections:**

These cover what the concept is, how to use it in its simplest form, and what it
looks like when you first run it. Use everyday words. If you use a technical term,
explain it in the same sentence. Include one short fenced Java code snippet
(5–10 lines) showing the basic usage. The fresher should be able to copy this
snippet, run it, and understand what happened.

Example subsection names: "What is X and why does it exist", "How to use X in
your first program", "What does X look like when it runs".

---

**Senior Developer band — at least 4 subsections:**

These cover how the concept actually works under the hood, what patterns to follow,
what edge cases exist, and what common mistakes look like. Include at least one
production comparison table (pipe table, 3 columns — what it is, when to use it,
what breaks if you use the wrong one). Include at least one numbered step sequence
showing a process from start to finish.

Write this band as if you are a Senior Developer explaining something to a junior
who asked "but how does it really work?" Use simple language — but do not skip the
depth. Short sentences are fine for complex ideas.

Example subsection names: "How X works inside the JVM", "The right pattern to
follow", "Common mistakes and how to avoid them", "When X goes wrong in production".

---

**Technical Lead band — at least 3 subsections:**

These cover design decisions, trade-offs, and how to make the right choice at
system level. When should you use X versus Y? What do you put in a code review
checklist about this topic? How do you explain the trade-off to a stakeholder?
Include a second pipe table for comparing options or listing tool commands.

Write this band as if you are a Tech Lead preparing for a design discussion.
Plain language, but more specific. Name real tools, real frameworks, real flags.

Example subsection names: "How to choose between X and Y", "What to check in a
code review", "How to explain this to your team or stakeholder".

---

**Staff / Architect band — at least 3 subsections:**

These cover JVM internals, production diagnostics, version-specific behaviour,
and system-scale consequences. Name the exact JVM region, GC phase, or bytecode
behavior involved. Give the exact `jcmd`, `jstat`, `jmap`, or `javap` command
that surfaces the problem. Include a third pipe table if needed for version
comparison or command reference.

Write this band in plain, simple language — but do not leave out the depth.
A Staff engineer should find this useful. A fresher should still be able to
follow the sentences even if they do not understand all the terms yet.

Example subsection names: "What happens inside the JVM", "The command you run
on-call", "How this changed between Java 8, 11, 17, and 21", "The architecture
decision that avoids this problem".

---

**Two closing subsections — always present:**

`### 60-second interview story`
A short practiced answer — 3–5 sentences — that covers all four levels.
The fresher learns the concept. The Senior Dev adds the consequence.
The Tech Lead adds the decision. The Staff adds the diagnostic.
The learner should be able to read this out loud and sound credible at
any level of interview.

`### Satyverse drill — tie-down`
One specific hands-on task the learner does right now on their machine.
Should take 5–10 minutes. Connects directly to the day's topic.
Tells them exactly what to run and what to look for in the output.

---

**Rules for every subsection:**
- End with one sentence starting `**Interview angle:**` — what specifically an
  interviewer listens for on this sub-topic. Minimum 13 across the whole section.
- Bold every Java keyword, class name, method name, error name, and tool name
  on first use in that subsection.
- Explain the simple version before the deep version. Always.

---

## SECTION 3 — CODE

Three code sections per day, each targeting a level.
Package: `arch.day{N}`. Output field: exact stdout, always filled in.

---

### Code 1 — Fresher

**What this is:** A printed reference card. Nothing computes — just
`System.out.println` statements that show tables, rules, and commands.
A fresher should be able to read it top to bottom and understand everything.

**Lines:** 40–60.

Split into at least 4 named sections using:
```java
System.out.println("=== Section name ===");
```

Sections to include:
- Core concept table (the thing, its variants, what each one means)
- How to use it (basic commands or method calls)
- Beginner mistakes and their error messages
- A "remember this" block — one key fact to never forget

Above each group of prints, write a `//` comment explaining why this
matters to a fresher in week 1. Simple English. Not what it is — why it matters.

Bad:
```java
System.out.println("String is immutable");
```

Good:
```java
// Freshers often try to change a String and wonder why nothing happened.
// This table shows what String actually does behind the scenes.
System.out.println("=== String — what immutable really means ===");
System.out.println("s = \"hello\"        | 'hello' object created in string pool");
System.out.println("s = s + \" world\"   | new object created, old one left behind");
System.out.println("s.replace('h','H') | returns new String, s is unchanged");
```

---

### Code 2 — Senior Developer

**What this is:** 4 labelled scenarios. Each one is a real situation a Senior
Developer has seen or will see. Something went wrong, they figured out why,
they fixed it. Written as static methods called from main.

**Lines:** 70–100.

Each scenario:
```java
static void scenario1() {
    System.out.println("--- Scenario 1: short plain title of what went wrong ---");
    System.out.println("symptom:  what the developer or user saw");
    System.out.println("cause:    the Java reason this happened (plain words)");
    System.out.println("why:      deeper explanation — what is going on inside");
    System.out.println("fix:      the exact change to code, config, or flag");
    System.out.println("verify:   the command or test that proves it is fixed");
    System.out.println("next:     one more thing a careful engineer checks after");
    System.out.println();
}
```

Scenario topics to cover in order:
- A mistake a Senior Dev makes writing a feature for the first time
- A bug that appeared in production and was hard to trace back to this concept
- A performance problem caused by misusing this concept
- An architecture decision made at team level that uses this concept

Each scenario must name at least one real diagnostic command.
Write at least 3 `//` comments across the file explaining the production context.

---

### Code 3 — Technical Lead + Staff / Architect

**What this is:** A program that shows how a Tech Lead or Staff engineer
thinks about this topic. A decision table, a triage matrix, an ordered model,
or a state machine. Uses Java structures like Map, List, and Record.
No randomness. No real I/O. Everything is deterministic and readable.

**Lines:** 60–100.

Three labelled blocks that build on each other:
```java
System.out.println("=== Block 1: title — build the model or context ===");
// logic that sets up the scenario

System.out.println("=== Block 2: title — apply the decision or analysis ===");
// logic that reasons through the options

System.out.println("=== Block 3: title — the triage table or recommendation ===");
// prints what a Tech Lead or Staff engineer decides and why
```

Block 1 sets up the data or model being reasoned about.
Block 2 applies a decision, ordered search, or state change.
Block 3 prints the recommendation or diagnostic table — what you would
actually act on during a production incident or design review.

---

## SECTION 4 — PITFALLS

**Total: 8 items. 2 per level.**

Order them exactly like this inside the JSON array:
2 Fresher pitfalls → 2 Senior Developer pitfalls → 2 Technical Lead pitfalls → 2 Staff pitfalls

---

**Fresher (2):** Mistakes from not knowing the concept yet.
The kind of thing you make in your first week.
Wrong method call, null reference, misunderstanding what a keyword does.
The fix is a one-line change. The symptom is an obvious error.

**Senior Developer (2):** Mistakes from knowing the concept but applying it
wrong in a real system. Pattern-level errors. Wrong class for the situation.
Using something that works fine in a single thread but breaks with two.
These take longer to find because they do not always produce an obvious error.

**Technical Lead (2):** Mistakes that affect a whole team or service.
A design decision that seemed fine in testing but causes problems at load.
A missing code review checklist item that lets a bad pattern spread across
many services. Often the symptom is gradual — not an immediate crash.

**Staff / Architect (2):** Mistakes that only appear at production scale,
often weeks after the code shipped. Silent data corruption, JVM configuration
that interacts badly with container limits, GC behaviour that only shows under
peak load. The fix is a flag, a configuration change, or an architectural guardrail.

---

**Every pitfall is one sentence.** This is the structure:
what went wrong → what appeared in production → how to fix it → how to verify the fix is working

Length: 40–80 words. Bold the key error name or tool name. No sub-bullets.

---

Fresher example:
```
"Calling `.equals()` on a variable that could be null — the code throws
**NullPointerException** the first time a null value reaches that line;
fix it by putting the known non-null value first, like `\"expected\".equals(userInput)`,
so the literal is the receiver and null input just returns false;
verify by writing a unit test that passes null and confirms no exception is thrown."
```

Senior Developer example:
```
"Using `HashMap` in code that two threads both write to at the same time —
the internal array can get corrupted silently, causing `get()` to loop forever
and spike one CPU core to 100% with no exception or log message to help you;
replace it with `ConcurrentHashMap` which handles concurrent writes safely;
verify by running a stress test with 10 threads writing simultaneously and
checking that CPU stays below 20% and all values are present afterward."
```

Technical Lead example:
```
"Choosing a single shared `ObjectMapper` instance and calling `configure()`
on it from multiple request threads — Jackson's mapper is thread-safe for
reading but its configuration methods are not, causing intermittent serialisation
errors that appear randomly under load and are almost impossible to reproduce
locally; make the mapper a final field configured once at startup and never
touch it again; verify by adding a concurrent integration test that serialises
1000 objects from 20 threads and asserts all results are identical."
```

Staff example:
```
"Setting `-Xmx2g` in a Kubernetes pod with a 2GB memory limit without also
setting `-Xms2g` — the JVM starts at a small heap, grows it one GC cycle at a
time under load, and triggers repeated full GC pauses during the growth phase,
causing p99 latency to spike to 5–10 seconds for the first few minutes after
every deploy; set `-Xms` equal to `-Xmx` to pre-allocate the full heap at startup;
verify with `jcmd <pid> VM.flags | grep HeapSize` inside the running pod and
confirm both values are the same."
```

---

## SECTION 5 — EXERCISE

**Two exercises per day.**

---

### Fresher Exercise

A short, simple task. The fresher should be able to finish it after reading
the basic code section and the Fresher theory band.

**problem field:**
One sentence giving context (e.g. "You are writing your first Java program
to explore how Strings work"). Then 3–4 numbered requirements — each one
asks them to write or print one specific thing. No production scenario.
Just the concept in its simplest form.

**hints:** 3 hints. Written simply, like a friend helping. Nudges toward the
approach, not toward the answer.

**solution:** A complete runnable Java program.
- Package `arch.day{N}`, class `Day{N}FresherExercise`
- At least 25 lines
- Uses `final String` literals — same output every run, no randomness
- Every line of code has a comment explaining what it does and why
  (because a fresher will read this solution to understand the concept,
  not just to check their answer)

---

### Staff Exercise

A realistic production scenario that needs system-level thinking.
A Senior Developer will find it hard. A Tech Lead or Staff engineer will find it familiar.

**problem field:**
One sentence describing a real production situation — a bug, a performance
problem, or an architecture decision. Then 4–5 numbered requirements, each one
asking them to either diagnose, fix, or design something specific.

**hints:** 3 hints. Point toward diagnostic commands, JVM flags, or design
patterns. Written to someone who already understands the basics.

**solution:** A complete runnable Java program.
- Package `arch.day{N}`, class `Day{N}StaffExercise`
- At least 50 lines
- Uses Java data structures and deterministic logic to model the scenario
- Comments explain the Staff-level thinking behind each block — not the syntax,
  but the reasoning: why this choice, what would break if you did it differently

---

## SECTION 6 — INTERVIEW

Five sub-sections, each targeting a specific level.

---

### Conceptual Questions — Fresher → Senior Developer

**Count:** At least 15 (17 preferred).
**Answer length:** 120–200 words each. Count before finishing. Never below 120.

Organise the questions in level order:
- First 5 questions: things a Fresher should know cold after studying the topic
- Next 5–6 questions: things a Senior Developer knows from real experience
- Last 4–5 questions: things that show a Senior Dev is ready to move up to Lead

**Every answer must naturally include all four of these — not as a checklist,
but woven into the explanation:**
1. What the concept actually is at the Java or JVM level — not just the surface definition
2. What breaks in production when someone gets it wrong — the exact error name or symptom
3. A real command that helps diagnose or verify it — `jcmd`, `javap`, `jstat`, etc.
4. One fact tied to a specific Java version — something that changed in Java 11, 17, or 21

**How to write each answer — in plain language:**
Start by explaining what the thing is at the JVM level. Use simple words.
Then explain how it works inside — what the JVM actually does when this happens.
Then say what goes wrong in production if you misunderstand it. Name the exact error.
Then give one command and say what to look for in its output.
Close with one version-specific fact that shows real experience.

Each question has 2 follow-up objects:
- Follow-up 1: "how does [topic] show up in production?" — 60–100 words, a specific story
- Follow-up 2: "what is a common trap on [topic]?" — 60–100 words, one misconception fixed

Bold every type name, error name, JVM term, and tool name.

---

**Bad answer (do not write this):**
```
"HashMap stores key-value pairs using a hash table."
```

**Good answer — plain language, but deep:**
```
"HashMap stores key-value pairs by turning each key into a number called a hash code.
It uses that number to pick a slot in an internal array called a bucket.
If two keys produce the same bucket number — which is called a hash collision —
HashMap stores them in a linked list inside that bucket.
In Java 8 and above, if that list gets longer than 8 items, the JVM switches it
to a balanced tree so lookups stay fast instead of slowing down to O(n).
The real production risk is using a mutable object as a key — if you change the
object after inserting it, the hash code changes, and HashMap can never find
that entry again, causing silent data loss with no exception.
To check if HashMap is causing slowdowns in production, run
`jcmd <pid> GC.heap_info` and look for unexpected heap growth from many
short-lived Entry objects — a sign that keys are being created in a tight loop."
```

---

### Code-Based Questions — Senior Developer level

**Count:** At least 8.

Each question has a short Java code block inside the `question` field.
The answer (60–100 words) explains WHY the output is what it is — in plain words.
Name the specific JVM behaviour: silent wrap, autoboxing, string pool,
lazy class loading, reference equality vs value equality, etc.

These catch Senior Developers who know the API but have not thought about
what the JVM actually does when that line runs.

---

### Senior Scenarios — Technical Lead + Staff / Architect level

**Count:** At least 5, prefer 6.
**Answer length:** 200–350 words. Never below 200.

Each question describes a real situation: an on-call incident, an architecture
decision, or a post-mortem conversation. Not "what is X" — always
"your system is doing Y, what do you do."

Every answer uses exactly these four bold labels in this order:

**Immediate response:** The first thing you do — one specific action or command.
Not "I would look into it." Something real, like
"run `jcmd <pid> GC.heap_info` and check if Old Gen is above 90%."

**Root cause:** Why this happened — in plain words, but at the JVM or Java
internal level. Which memory region? Which GC behaviour? Which class loading rule?
2–3 sentences.

**Fix:** The exact code change, JVM flag, or config update that resolves it.
Include the actual command or snippet. 2–3 sentences.

**Prevention:** The one thing that stops this whole class of problem
from happening again. A tool rule, code review item, or architecture decision.
2 sentences.

---

### Wrong Answers — all levels mixed

**Count:** Exactly 8.

These are statements that sound correct but are wrong.
The kind of thing someone says confidently in an interview and loses points for.
Include a mix of Fresher-level, Senior Dev-level, and Tech Lead-level wrong beliefs.
Each is one plain sentence. No explanation — just the wrong statement.

Fresher example:
```
"You should always call System.gc() after creating many objects to free up memory faster"
```

Senior Developer example:
```
"HashMap is thread-safe — Java's standard library classes handle concurrency automatically"
```

Technical Lead example:
```
"You can always add more heap with -Xmx to fix an OutOfMemoryError in production"
```

---

### Job Switch Block — Staff / Architect career positioning

Add this at the same level as `conceptual`, `codeBased`, `seniorScenario` in the JSON.
This helps someone use today's topic to position themselves when changing jobs.

```json
"jobSwitch": {
  "resumeBullet": "One line for a CV. Past-tense verb, what you did, one number or result. Max 20 words. Example: 'Replaced int-based payment accumulators across 8 services with long and Math.addExact, eliminating silent overflow bugs in production.'",

  "interviewPositioning": "2–3 sentences the learner can say to an interviewer at a new company. Should sound like a real person talking — not a rehearsed script. Include one concrete thing they would do in their first week to show they know this topic. Example: 'When I join a new team I always check how financial calculations handle overflow — it is one of those things that looks fine in testing but silently corrupts data at scale. I add Math.addExact to critical paths in week 1 and document the reasoning so the team knows the pattern.'",

  "starAnchor": "STAR story in 4–6 sentences. Situation, Task, Action, Result. Result must include a number or a specific timeframe. Write in first person, past tense. Should sound like something the person actually lived through, not a made-up example. Example: 'Our payment service started generating negative invoice totals once monthly order volumes passed 21 million items. I had to find the root cause without taking the service offline. I used jcmd heap dumps to trace it to an int field accumulating past MAX_VALUE, replaced 14 fields with long, and deployed behind a feature flag. We had zero overflow incidents in the eight months after, and on-call escalations for billing errors went to zero.'"
}
```

---

## SECTION 7 — MCQ

**Total: 30 questions. Split: 8 basic, 12 intermediate, 10 advanced.**

Each level maps to a learner:
- **Basic (8):** Fresher level — concept recognition, simple code reading, "which of these is true"
- **Intermediate (12):** Senior Developer level — code output prediction, spotting mistakes, pattern recognition
- **Advanced (10):** Technical Lead + Staff level — on-call decisions, architecture trade-offs, version migration choices

Spread each level across categories:
- Basic: 4 theory, 3 code-reading, 1 real-world
- Intermediate: 4 theory, 5 code-reading, 3 real-world
- Advanced: 2 theory, 3 code-reading, 5 on-call or architecture

Every question object:
```json
{
  "id": 1,
  "level": "basic",
  "category": "theory",
  "question": "Write in plain language. Use **bold** for key terms. Use `backticks` for code.",
  "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
  "answer": "A",
  "explanation": "2–4 sentences in plain English. Say why the right answer is right. Say why each wrong answer is wrong. Connect it to something that actually matters in production."
}
```

Code questions must include a fenced Java block in the question:
```
"question": "What does this print?\n```java\nint x = 127;\nInteger a = x;\nInteger b = x;\nSystem.out.println(a == b);\n```"
```

Advanced questions must describe a real situation — not a definition quiz.
Pattern: "Your service starts doing X after a deploy. What is the most likely cause?"
All three wrong options must be plausible. No obviously silly choices.

---

## SECTION 8 — CHEATSHEET

**Count:** At least 12 rows. Minimum 3 per level.
**Format:** 4-column markdown table in the `content` field:

```
| Level | Concept | The rule in one line | Example or Command |
|-------|---------|----------------------|--------------------|
| Fresher | ... | ... | ... |
| Fresher | ... | ... | ... |
| Fresher | ... | ... | ... |
| Senior Dev | ... | ... | ... |
| Senior Dev | ... | ... | ... |
| Senior Dev | ... | ... | ... |
| Senior Dev | ... | ... | ... |
| Tech Lead | ... | ... | ... |
| Tech Lead | ... | ... | ... |
| Tech Lead | ... | ... | ... |
| Staff | ... | ... | ... |
| Staff | ... | ... | ... |
```

Keep every cell short. This is a quick reference, not a paragraph.
The "rule in one line" column should be something the learner can memorise.
The "Example or Command" column should be something they can copy and run.

---

## SECTION ORDER IN JSON

The `sections` array must always follow this order:

```
1.  why
2.  theory
3.  code  (basic — Fresher)
4.  code  (intermediate — Senior Developer)
5.  code  (advanced — Technical Lead + Staff)
6.  diagram
7.  pitfalls
8.  exercise
9.  interview
10. mcq
11. cheatsheet
```

---

## JSON RULES

- Run `JSON.parse` on the result before writing the file — if it fails, fix it
- Never use unescaped double quotes inside a string value
- Never truncate any string to save space — every string must be complete
- Backtick characters inside JSON string values are fine as-is

---

## HOW TO BEHAVE

Respond in this exact order every time:
1. Gap table with actual numbers filled in
2. Full script — no truncation, no `// ... rest of code`, no skipped sections
3. Script run output
4. Verification summary from the script
5. One final line: `✓ Day N complete. All checks pass.`
   or `✗ Day N — [list what failed] — fixing now.` then fix and run again

Do not announce what you are about to do — just do it.
Do not truncate any code. Do not ask anything. Do not offer alternatives.

---

## WHEN USER SAYS "CONTINUE"

Move to the next file. Read it fully. Run the gap check. Write the script. Run it.
The topic is in the JSON `title` field — always read it before writing anything.

Day file naming pattern:
- `phase1-day2.json`, `phase1-day3.json` ... `phase1-day9.json`
- `phase2-day10.json`, `phase2-day11.json` ... and so on
- Always check the actual filename in the directory — never guess the phase number
