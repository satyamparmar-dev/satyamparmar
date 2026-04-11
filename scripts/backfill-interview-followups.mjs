/**
 * Adds `followUps` (2 items) to interview conceptual / codeBased / seniorScenario
 * entries that are missing them — aligns with DAY_ENRICHMENT_PROMPT.md.
 * Idempotent: skips entries that already have at least 2 followUps.
 *
 * Uses neutral padding (not microservice-specific) so early-phase days stay on-topic.
 *
 * Options:
 *   --force-phase1-5   Rebuild followUps for phase 1–5 day files (fixes bad padding if any).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const daysDir = path.join(__dirname, '../public/data/days');

const FORCE_PHASE1_5 = process.argv.includes('--force-phase1-5');

/** Generic pads — avoid Spring Cloud / K8s jargon on beginner days */
const NEUTRAL_PADS = [
  'Connect the idea to something you can **observe** in **logs**, **tests**, or a **local run**.',
  'Mention **one edge case** or **follow-up** an interviewer might ask next.',
  'Keep **constraints** explicit: **JDK version**, **threading**, **memory**, or **API** contract.',
  'Prefer **concrete commands** (`javac`, `java`, `mvn test`) over vague theory.',
  'Close with **how you would verify** the answer still holds after a change.',
  'Relate the answer to **maintainability** and how a **teammate** would read your code.',
  'When unsure, say what you would **measure** or **breakpoint-debug** before optimizing.',
  'Separate **compile-time** rules from **runtime** behavior in your explanation.',
  'Name **one failure mode** that looks like a bug but is really a misunderstanding.',
  'Tie the answer to **interview structure**: clarify, answer, then **one** concrete example.',
];

function wc(s) {
  return String(s)
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function padNeutral(text, minWords) {
  let out = String(text).trim();
  let i = 0;
  const h = [...out].reduce((x, c) => x + c.charCodeAt(0), 0);
  while (wc(out) < minWords && i < 80) {
    out = `${out} ${NEUTRAL_PADS[(h + i) % NEUTRAL_PADS.length]}`;
    i += 1;
  }
  return out;
}

function fuNeutral(question, answerCore, minWords = 62) {
  return { question, answer: padNeutral(answerCore, minWords) };
}

function clip(s, n) {
  const t = String(s ?? '');
  return t.length <= n ? t : t.slice(0, n) + '…';
}

function isPhase1to5(filename) {
  const m = filename.match(/^phase(\d+)-day/);
  return m && Number(m[1]) >= 1 && Number(m[1]) <= 5;
}

function hasEnoughFollowUps(item, filename) {
  if (FORCE_PHASE1_5 && isPhase1to5(filename)) return false;
  return Array.isArray(item.followUps) && item.followUps.length >= 2;
}

function enrichConceptual(item, topic, filename) {
  if (hasEnoughFollowUps(item, filename)) return item;
  const a = item.answer;
  return {
    ...item,
    followUps: [
      fuNeutral(
        `Interview follow-up: how does **${topic}** show up in **production** debugging or **on-call**?`,
        `Tie **logs**, **metrics**, **repro** steps, and **ownership** to what you already said. **Interviewers** reward **symptom → cause → fix → verification**, not textbook **definitions** alone. ${clip(a, 140)}`,
      ),
      fuNeutral(
        `What is a **common trap** or **follow-up** question on **${topic}**?`,
        `Name **one** misconception and **correct** it with a **concrete** check, **command**, or **test**. **Senior** answers stay **specific** and **calm** under pressure. ${clip(a, 120)}`,
      ),
    ],
  };
}

function enrichCodeBased(item, topic, filename) {
  if (hasEnoughFollowUps(item, filename)) return item;
  const a = item.answer;
  return {
    ...item,
    followUps: [
      fuNeutral(
        `What breaks if this **${topic}** approach, snippet, or config is wrong?`,
        `**Compile** errors, **wrong** runtime behavior, or **silent** bugs often appear only under **load**, **concurrency**, or **bad** inputs. **Anchor** fixes to **tests** and **code review** gates. ${clip(a, 130)}`,
      ),
      fuNeutral(
        `How do you **test** or **review** this in **CI** or before merge?`,
        `**Unit** / **integration** tests, **static** analysis, **minimal** **repro** in the **PR**, and **pair** review for subtle **API** or **JVM** issues. ${clip(a, 110)}`,
      ),
    ],
  };
}

function enrichSenior(item, topic, filename) {
  if (hasEnoughFollowUps(item, filename)) return item;
  const a = item.answer;
  return {
    ...item,
    followUps: [
      fuNeutral(
        `How do you **communicate** **impact**, **ETA**, and **unknowns** in this **${topic}** situation?`,
        `State **customer-visible** symptoms, **business** or **SLO** impact, **mitigation** in flight, and **rollback** criteria. Avoid **blame**; cite **dashboards** and **owners**. Context: ${clip(a, 160)}`,
      ),
      fuNeutral(
        `Which **post-incident** or **preventive** **actions** do you require before closing?`,
        `At minimum: **runbook** update, **test** or **guard** that failed, **owner** with **deadline**, and **theme** on the **roadmap**. Tie to **error budget** or **team** policy when relevant. ${clip(a, 140)}`,
      ),
    ],
  };
}

function processFile(filepath) {
  const fname = path.basename(filepath);
  const raw = fs.readFileSync(filepath, 'utf8');
  const data = JSON.parse(raw);
  const interview = data.sections?.find((s) => s.type === 'interview');
  if (!interview) return false;

  const topic = (data.title || 'this topic').replace(/\s+/g, ' ').trim();

  let changed = false;
  const mapIf = (arr, fn) => {
    if (!Array.isArray(arr)) return;
    const out = arr.map((it) => {
      const n = fn(it, topic, fname);
      if (n !== it) changed = true;
      return n;
    });
    return out;
  };

  const c = mapIf(interview.conceptual, enrichConceptual);
  const cb = mapIf(interview.codeBased, enrichCodeBased);
  const s = mapIf(interview.seniorScenario, enrichSenior);
  if (c) interview.conceptual = c;
  if (cb) interview.codeBased = cb;
  if (s) interview.seniorScenario = s;

  if (changed) {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
  }
  return changed;
}

const files = fs
  .readdirSync(daysDir)
  .filter((f) => f.startsWith('phase') && f.endsWith('.json') && !f.includes('scenarioDrill'))
  .sort();

let updated = 0;
for (const f of files) {
  const fp = path.join(daysDir, f);
  if (processFile(fp)) {
    updated++;
    console.log('Updated', f);
  }
}
console.log(`Done. Updated ${updated} / ${files.length} day files.`);
