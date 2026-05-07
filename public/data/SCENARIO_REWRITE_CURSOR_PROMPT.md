# Cursor AI — Scenario Drill Rewrite Prompt
# Java Prep App | Enterprise-Standard Answer Format

---

## HOW TO USE
- Paste this entire prompt into Cursor once.
- It processes the scenario in **CURRENT TARGET** below.
- When the user types **"continue"**, move to the next scenario in the file.
- Never ask the user a question. Never suggest alternatives. Never truncate code. Just execute.

---

## CURRENT TARGET

```
File     : public/data/scenarioInterviewThemes.json
Question : Why the Saga pattern fits distributed transactions
```

You can put either the **question/title** (as shown above) or the IDs — both work.
If you use a title, find the theme whose `title` field matches it (case-insensitive, partial match is fine).

---

## BEFORE YOU WRITE ANYTHING

1. Read `public/data/scenarioInterviewThemes.json` fully.
2. Find the theme whose `title` matches the question in CURRENT TARGET (search by `title` field, not by ID).
3. Take the first scenario inside that theme's `scenarios` array.
4. Read the existing `answer` field completely — understand what is already there.
5. Read the idempotency theme (`"Why idempotency is the most underrated backend skill"`) as your quality reference — that is the bar you must meet or exceed.
6. The title, subtitle, and tags are already in the JSON — never guess them.

---

## THE ENTERPRISE ANSWER STRUCTURE

Every rewritten answer must follow this exact section order, every time, without skipping:

```
1. The Problem  (real story)
2. What Is [Topic]?  (plain definition + analogy)
3. Why [Problem] Happens  (behind the scenes — network, JVM, system level)
4. Solution Step 1  (most important pattern)
5. Solution Step 2  (second layer of protection)
6. Solution Step 3  (advanced / event-driven pattern if applicable)
7. Solution Step 4+ (additional patterns as needed)
8. Enterprise Architecture  (text diagram showing the full system)
9. Common Pitfalls Table  (markdown table, 6–8 rows)
10. Interview-Ready Summary  (4–6 bullet points a Staff engineer would say)
```

Strictly follow this structure. Do not swap sections. Do not merge sections. Do not skip sections.

---

## HOW TO WRITE EACH SECTION

### Section 1 — The Problem

- Open with a real, relatable incident. Name a time (3am, Black Friday, during a deploy).
- Say what the symptom was — what the customer or engineer saw.
- Say why the system did this — in one plain sentence.
- Close with: "This is the problem [topic] solves."
- Length: 3–5 short paragraphs.
- No bullet lists. No definitions. Pure narrative.
- Write in second person ("you", "your team") or first/third person for the story.

### Section 2 — What Is [Topic]? (Plain Language)

- One sentence definition. Then one analogy from real life (not a computer analogy).
- Then show: WITHOUT this concept → what happens. WITH this concept → what happens.
- Every technical term must be explained in the same sentence where it first appears.
- Length: 2–3 short paragraphs or a before/after comparison.

### Section 3 — Why [Problem] Happens (Behind the Scenes)

- Explain the system-level or infrastructure-level reason.
- Use a plain ASCII diagram or a numbered step sequence to show the failure path.
- Show at least 2 different trigger scenarios (e.g. HTTP retry AND Kafka redelivery).
- Include a markdown table listing all the places where this problem can occur and why.
- Write as if the reader is seeing inside the network or JVM for the first time.
- Short sentences. No assumed knowledge.

### Sections 4+ — Solution Steps

Each step is one complete, self-contained pattern.

**Format for every step:**

```
## Solution Step N — [Pattern Name]

One sentence explaining what this step does and why it is needed.

**How it works:**
Numbered list of the exact steps the pattern takes (not code steps — design steps).

[Production-quality Java code block]

[Why this works] — 2–3 sentences in plain language explaining the mechanism.

[Production tip] — one real tip from production experience (not a generic tip).
```

**Code quality rules (strictly follow these):**
- Every code block must be production-ready and enterprise-grade.
- Use real Spring Boot annotations (`@RestController`, `@Transactional`, `@KafkaListener`, `@Scheduled`, etc.).
- Use real class and method names that a real Java codebase would have.
- Include the package / import level context where it helps.
- Use `@Valid` for request validation, `@AuthenticationPrincipal` for user context, proper HTTP status codes.
- Add inline `//` comments that explain WHY each line exists — not what it does.
- No `// TODO`, no placeholder logic, no `System.out.println` in production code.
- Every code block must be runnable as-is (no missing method bodies, no fake method calls).
- Minimum 20 lines per code block for any non-trivial step.
- SQL blocks must include the real DDL (CREATE INDEX, ALTER TABLE, ON CONFLICT, etc.).

**What each code block must show:**
- The happy path (it works correctly)
- The edge case (what happens on retry / duplicate / failure)
- How the engineer knows it worked (the verification step — a log line, header, or assertion)

### Section — Enterprise Architecture

- A plain ASCII text diagram showing the entire system flow from client to final consumer.
- Show every layer: client → gateway → service → Redis → database → Kafka → consumer.
- Mark each deduplication or protection point with a numbered label (e.g. `[1]`, `[2]`).
- Below the diagram, write one sentence per label explaining what it does.
- This section alone should tell someone how the whole system fits together.

### Section — Common Pitfalls Table

Format (markdown pipe table, 3 columns):

```
| Pitfall | What Goes Wrong | Fix |
|---|---|---|
```

- 6–8 rows minimum.
- Each pitfall is a real mistake made by real engineers.
- "What Goes Wrong" must name the exact symptom (error message, duplicate, latency spike, etc.).
- "Fix" must be one actionable thing — a specific code change, flag, annotation, or design decision.
- Cover all levels: Fresher mistakes, Senior mistakes, Tech Lead mistakes.

### Section — Interview-Ready Summary

- Bold heading: `## Interview-Ready Summary`
- 4–6 bullet points.
- Each bullet is one sentence a Staff/Architect would say in an interview.
- Use the structure: "**[Key term]:** [one sentence that shows real understanding]"
- The last bullet must be a "the interview signal" — what separates a Staff-level answer from a Senior-level one.

---

## FOLLOW-UP QUESTIONS

Write exactly 3 follow-up questions for the scenario.

**Format:**
```json
{
  "question": "The follow-up question — a specific, hard, production-level question",
  "answer": "150–250 words. Structured: diagnosis first, root cause, then fix with code snippet. Plain language."
}
```

**Rules:**
- Each follow-up digs deeper than the main answer.
- Question 1: A race condition or edge case the main answer glossed over.
- Question 2: A failure recovery scenario (what if step X fails mid-way?).
- Question 3: How this pattern interacts with another system or pattern.
- Every answer must include a short Java or SQL code snippet.
- No generic questions. No "what is X" questions. Always situational.

---

## SIGNALS / KEYWORDS

Update the `signals` array to include 10–14 keywords.

Rules:
- Every signal must be something an interviewer would listen for in a strong answer.
- Include exact Java class names, JVM flags, error names, and pattern names.
- No generic words ("performance", "reliability", "microservices" alone are too vague).
- Good examples: `setIfAbsent / SETNX`, `ON CONFLICT (idempotency_key)`, `DataIntegrityViolationException`, `compensating transaction`, `Axon Framework`, `@SagaOrchestrator`.

---

## STEP 1 — READ AND GAP CHECK

Read the existing answer. Fill in this table with actual numbers:

| Check | Required | Current | Fix? |
|---|---|---|---|
| Section 1: The Problem | exists, 3–5 paragraphs, no bullets | ? | ? |
| Section 2: What Is It? | exists, analogy present | ? | ? |
| Section 3: Behind the Scenes | exists, ASCII diagram or step sequence | ? | ? |
| Solution Steps | ≥ 3 numbered steps | ? | ? |
| Code blocks | ≥ 3, each ≥ 20 lines, enterprise-grade | ? | ? |
| Architecture diagram | exists, shows all layers | ? | ? |
| Pitfalls table | 6–8 rows, 3 columns | ? | ? |
| Interview Summary | 4–6 bullets, Staff-level | ? | ? |
| Follow-ups | exactly 3, with code | ? | ? |
| Signals | 10–14 terms | ? | ? |
| Total answer length | ≥ 12,000 chars | ? | ? |

---

## STEP 2 — WRITE THE PATCH SCRIPT

Name the script after a short slug of the question title, e.g.:
- "Why the Saga pattern fits distributed transactions" → `scripts/patch-scenario-saga-pattern.mjs`
- "Why event-driven architecture is hard in production" → `scripts/patch-scenario-event-driven.mjs`

```javascript
/**
 * Patch script — rewrite the [{question title}] scenario
 * File: public/data/scenarioInterviewThemes.json
 * Lookup: by theme title (case-insensitive contains match)
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TARGET = resolve(__dirname, '../public/data/scenarioInterviewThemes.json');

// ── Replace with the full rewritten answer ──────────────────────────────────
const answer = `[FULL REWRITTEN ANSWER — NO TRUNCATION]`;

const followUps = [
  { question: "...", answer: "..." },
  { question: "...", answer: "..." },
  { question: "...", answer: "..." }
];

// ── Lookup by title (copy the exact title from CURRENT TARGET) ──────────────
const QUESTION_TITLE = '{paste the exact title from CURRENT TARGET here}';

const raw = readFileSync(TARGET, 'utf-8');
const data = JSON.parse(raw);

// Find theme by title — case-insensitive, partial match
const themeIdx = data.themes.findIndex(t =>
  t.title.toLowerCase().includes(QUESTION_TITLE.toLowerCase())
);
if (themeIdx === -1) throw new Error(`Theme not found for title: "${QUESTION_TITLE}"`);

// Always update the first scenario in that theme
const theme = data.themes[themeIdx];
if (!theme.scenarios || theme.scenarios.length === 0) {
  throw new Error(`No scenarios in theme: "${theme.title}"`);
}

theme.scenarios[0] = {
  ...theme.scenarios[0],
  signals: [ /* 10–14 updated signal strings */ ],
  answer,
  followUps
};

const updated = JSON.stringify(data, null, 2);

// Validate JSON before writing — never write broken JSON
JSON.parse(updated);

writeFileSync(TARGET, updated, 'utf-8');

// Sync dist/ in the same script
writeFileSync(
  resolve(__dirname, '../dist/data/scenarioInterviewThemes.json'),
  updated,
  'utf-8'
);

// Verification output
const verify = JSON.parse(readFileSync(TARGET, 'utf-8'));
const s = verify.themes[themeIdx].scenarios[0];
console.log('✓ Scenario updated successfully');
console.log(`  Theme          : {theme-id}`);
console.log(`  Scenario       : {scenario-id}`);
console.log(`  Answer length  : ${s.answer.length.toLocaleString()} chars`);
console.log(`  Signals count  : ${s.signals.length}`);
console.log(`  Follow-ups     : ${s.followUps.length}`);
console.log(`  File size      : ${updated.length.toLocaleString()} chars`);
```

**Script rules — strictly follow:**
- The `answer` variable must contain the complete answer — no `// ... rest of content`, no truncation.
- Run `JSON.parse(updated)` before writing to catch any JSON syntax errors.
- Always sync `dist/data/scenarioInterviewThemes.json` in the same script.
- Print verification output at the end showing all key metrics.
- If JSON.parse throws, fix the string escaping and do not write the file.

---

## STEP 3 — RUN IT

Name the script after a short slug of the question title and run it:

```bash
node scripts/patch-scenario-saga-pattern.mjs
```

If the script throws a JSON error, fix the string escaping in the answer and run again.

---

## STEP 4 — VERIFY

After running, confirm:
- Answer length ≥ 12,000 chars
- Signals count 10–14
- Follow-ups = 3
- No JSON parse error
- dist/ file is updated

---

## RESPOND IN THIS EXACT ORDER

1. Gap table with actual numbers filled in
2. Full patch script — no truncation anywhere
3. Script run output
4. Verification summary
5. One final line:
   `✓ [Question title] complete. Answer: X chars, Signals: N, Follow-ups: 3.`
   or
   `✗ [Question title] — [what failed] — fixing now.` then fix and run again.

Do not announce what you are about to do. Do not ask anything. Do not offer alternatives. Just execute.

---

## WHEN USER SAYS "CONTINUE"

Move to the next theme in `scenarioInterviewThemes.json`.
Read it fully. Run the gap check. Write the script. Run it.
Always look up the theme by its `title` field — never hardcode an ID.

The structure to navigate in the file:
```json
{
  "themes": [
    {
      "title": "Why the Saga pattern fits distributed transactions",
      "scenarios": [{ "question": "...", "answer": "...", "signals": [], "followUps": [] }]
    }
  ]
}
```

When you say "continue", Cursor reads the NEXT theme's `title`, uses it as the lookup key, and repeats the whole process.

---

## QUALITY BAR — NON-NEGOTIABLE

Your output must match or exceed the idempotency scenario (`th-idempotency-deep-plain-full`) in:

| Metric | Minimum |
|---|---|
| Total answer length | 12,000 characters |
| Number of code blocks | ≥ 3 |
| Lines per code block | ≥ 20 |
| Architecture diagram | Required |
| Pitfalls table rows | ≥ 6 |
| Follow-up questions | Exactly 3 |
| Follow-up has code | Required for all 3 |
| Signals | 10–14 |
| Plain language | Every sentence — even Staff-level |
| No jargon without explanation | Required |
| Production-grade code | Required — no placeholders |

If any metric fails, fix it before finishing.
