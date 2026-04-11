import fs from "fs";
import {
  WHY_CONTENT,
  THEORY_CONTENT,
  BASIC_CODE,
  BASIC_OUTPUT,
  INTERMEDIATE_CODE,
  INTERMEDIATE_OUTPUT,
  ADVANCED_CODE,
  ADVANCED_OUTPUT,
  PITFALLS,
  EXERCISE_PROBLEM,
  EXERCISE_HINTS,
  EXERCISE_SOLUTION,
  JOB_SWITCH,
  WRONG_ANSWERS,
} from "./day10-staff-bundle.mjs";
import { CONCEPTUAL, CODE_BASED, SENIOR_SCENARIO } from "./day10-interview-data.mjs";

const DAY = 10;
const FILE = "public/data/days/phase2-day10.json";

const wordCount = (text) => (text || "").trim().split(/\s+/).filter(Boolean).length;
const paragraphCount = (text) => (text || "").split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
const h3Count = (text) => ((text || "").match(/^###\s+/gm) || []).length;
const interviewAngleCount = (text) => ((text || "").match(/\*\*Interview angle:\*\*/g) || []).length;
const scenarioCount = (text) => ((text || "").match(/--- Scenario \d+:/g) || []).length;
const advancedBlockCount = (text) => ((text || "").match(/=== Block \d+:/g) || []).length;
const codeLineCount = (code) =>
  (code || "")
    .split("\n")
    .filter((line) => {
      const t = line.trim();
      return t.length > 0 && !t.startsWith("//");
    }).length;
const tableCount = (text) => {
  const lines = (text || "").split("\n");
  let count = 0;
  for (let i = 0; i < lines.length - 1; i += 1) {
    if (/^\|/.test(lines[i]) && /^\|?\s*[-:|\s]+\|?\s*$/.test(lines[i + 1])) count += 1;
  }
  return count;
};
const cheatsheetRows = (text) => Math.max(0, (text || "").split("\n").filter((l) => /^\|/.test(l)).length - 2);
const avgAnswerWords = (arr) =>
  arr.length ? Math.round(arr.reduce((sum, item) => sum + wordCount(item.answer || ""), 0) / arr.length) : 0;

function needsMajorPatch(day) {
  const sections = day.sections || [];
  const why = sections.find((s) => s.type === "why");
  const theory = sections.find((s) => s.type === "theory");
  const codes = sections.filter((s) => s.type === "code");
  const basic = codes.find((s) => s.level === "basic");
  const staleAscii =
    (basic?.code || "").includes("\u2014") ||
    (basic?.output || "").includes("\u2014");
  return (
    wordCount(why?.content) < 600 ||
    h3Count(theory?.content) < 14 ||
    tableCount(theory?.content) < 3 ||
    staleAscii
  );
}

function applyFullPatch(day) {
  const sections = day.sections || [];
  const byType = (t) => sections.find((s) => s.type === t);
  const codes = sections.filter((s) => s.type === "code");
  const basic = codes.find((s) => s.level === "basic");
  const inter = codes.find((s) => s.level === "intermediate");
  const adv = codes.find((s) => s.level === "advanced");

  byType("why").title = "Why inheritance and polymorphism decide dispatch, wiring, and on-call fate";
  byType("why").content = WHY_CONTENT;

  byType("theory").title = "Theory and Internals — extends, invokevirtual, constructors, and Staff tooling";
  byType("theory").content = THEORY_CONTENT;

  Object.assign(basic, {
    title: "Basic — inheritance vocabulary, command reference, failure modes, build posture",
    description: "Static println-only reference aligning with production dispatch triage.",
    code: BASIC_CODE,
    output: BASIC_OUTPUT,
  });

  Object.assign(inter, {
    title: "Intermediate — four on-call scenarios: overload trap, cast storm, partial deploy, ctor chain",
    description:
      "Each scenario names **javap** or **jcmd** because bytecode evidence beats guessing when polymorphism misbehaves.",
    code: INTERMEDIATE_CODE,
    output: INTERMEDIATE_OUTPUT,
  });

  Object.assign(adv, {
    title: "Advanced — depth budget, playbook lookup, virtual readiness matrix",
    description: "Deterministic **Map**/**List**/**record** model mirroring Staff guardrails for inheritance graphs.",
    code: ADVANCED_CODE,
    output: ADVANCED_OUTPUT,
  });

  const ex = byType("exercise");
  ex.title = "Exercise — template method promotions, polymorphic iteration, static hiding narration";
  ex.problem = EXERCISE_PROBLEM;
  ex.hints = EXERCISE_HINTS;
  ex.solution = EXERCISE_SOLUTION;
  delete ex.difficulty;

  const pit = byType("pitfalls");
  pit.items = PITFALLS;

  const iv = byType("interview");
  Object.assign(iv, {
    conceptual: CONCEPTUAL,
    codeBased: CODE_BASED,
    seniorScenario: SENIOR_SCENARIO,
    wrongAnswers: WRONG_ANSWERS,
    jobSwitch: JOB_SWITCH,
  });

  const cs = byType("cheatsheet");
  cs.content = `| Concept | Quick rule | Example / Command |
|---------|------------|---------------------|
| Dynamic dispatch | **invokevirtual** uses **receiver** **vtable** | **javap -c** shows Methodref target |
| Static hiding | **invokestatic** binds to **reference** type | Same-name **static** in **child** still picks **parent** |
| Constructor chain | **super(...)** or **this(...)** must be first | **javac** error if logging precedes **super** |
| **@Override** | Compiler proves real override | Prevents silent overload accidents |
| Covariant returns | Narrower reference return allowed | **javap -p** may show **synthetic** bridge |
| **final** method | Seals **vtable** slot | Template method safety |
| **sealed** class | Allowed **extends** list is closed | Exhaustive **switch** on **Java 21** |
| **Liskov** | Subtype must honor contracts | Bad **equals** breaks **HashMap** |
| **ClassCastException** | Bad downcast after raw collections | Guard with **instanceof** |
| **AbstractMethodError** | Child **JAR** missing new abstract | **javap -p** diff across nodes |`;

  reorderMcqLevels(byType("mcq").questions);
}

/** Target 8 basic / 12 intermediate / 10 advanced (ids stable). */
function reorderMcqLevels(questions) {
  const basicIds = new Set([1, 2, 3, 4, 5, 15, 18, 21]);
  const advancedIds = new Set([13, 14, 19, 22, 23, 25, 26, 27, 29, 30]);
  for (const q of questions) {
    if (basicIds.has(q.id)) q.level = "basic";
    else if (advancedIds.has(q.id)) q.level = "advanced";
    else q.level = "intermediate";
  }
}

const day = JSON.parse(fs.readFileSync(FILE, "utf8"));

if (needsMajorPatch(day)) {
  applyFullPatch(day);
} else {
  reorderMcqLevels(day.sections.find((s) => s.type === "mcq").questions || []);
}

const text = `${JSON.stringify(day, null, 2)}\n`;
JSON.parse(text);
fs.writeFileSync(FILE, text, "utf8");

const reloaded = JSON.parse(fs.readFileSync(FILE, "utf8"));
const reSections = reloaded.sections || [];
const reByType = (type) => reSections.find((s) => s.type === type);
const reCode = reSections.filter((s) => s.type === "code");
const reBasic = reCode.find((s) => s.level === "basic");
const reIntermediate = reCode.find((s) => s.level === "intermediate");
const reAdvanced = reCode.find((s) => s.level === "advanced");
const reWhy = reByType("why");
const reTheory = reByType("theory");
const rePitfalls = reByType("pitfalls");
const reInterview = reByType("interview");
const reMcq = reByType("mcq");
const reCheatsheet = reByType("cheatsheet");

const conceptualWordCounts = (reInterview.conceptual || []).map((q) => wordCount(q.answer || ""));
const seniorWordCounts = (reInterview.seniorScenario || []).map((q) => wordCount(q.answer || ""));
const questions = reMcq.questions || [];
const mcqBasic = questions.filter((q) => q.level === "basic").length;
const mcqIntermediate = questions.filter((q) => q.level === "intermediate").length;
const mcqAdvanced = questions.filter((q) => q.level === "advanced").length;

console.log(`WHY word count: ${wordCount(reWhy.content)}`);
console.log(`THEORY ### count: ${h3Count(reTheory.content)}`);
console.log(`Conceptual count: ${(reInterview.conceptual || []).length}`);
console.log(`Conceptual word counts: ${conceptualWordCounts.join(", ")}`);
console.log(`SeniorScenario count: ${(reInterview.seniorScenario || []).length}`);
console.log(`SeniorScenario word counts: ${seniorWordCounts.join(", ")}`);
console.log(`JobSwitch: ${Boolean(reInterview.jobSwitch)}`);
console.log(`MCQ counts by level: basic=${mcqBasic}, intermediate=${mcqIntermediate}, advanced=${mcqAdvanced}, total=${questions.length}`);
console.log(`Code line counts [basic, intermediate, advanced]: [${codeLineCount(reBasic.code)}, ${codeLineCount(reIntermediate.code)}, ${codeLineCount(reAdvanced.code)}]`);
console.log(`File size in chars: ${fs.readFileSync(FILE, "utf8").length}`);

const failures = [];
if (wordCount(reWhy.content) < 600) failures.push("WHY word count");
if (paragraphCount(reWhy.content) < 5 || paragraphCount(reWhy.content) > 6) failures.push("WHY paragraphs");
if (h3Count(reTheory.content) < 14) failures.push("THEORY sections");
if (tableCount(reTheory.content) < 3) failures.push("THEORY tables");
if (interviewAngleCount(reTheory.content) < 13) failures.push("THEORY interview angles");
if (codeLineCount(reBasic.code) < 40 || codeLineCount(reBasic.code) > 60) failures.push("CODE basic lines");
if (scenarioCount(reIntermediate.code) < 4) failures.push("CODE intermediate scenarios");
if (codeLineCount(reIntermediate.code) < 70 || codeLineCount(reIntermediate.code) > 100)
  failures.push("CODE intermediate lines");
if (advancedBlockCount(reAdvanced.code) < 3) failures.push("CODE advanced blocks");
if (codeLineCount(reAdvanced.code) < 60 || codeLineCount(reAdvanced.code) > 100) failures.push("CODE advanced lines");
if ((rePitfalls.items || []).length !== 8) failures.push("PITFALLS items");
if ((reInterview.conceptual || []).length < 15) failures.push("INTERVIEW conceptual count");
for (const w of conceptualWordCounts) {
  if (w < 120) failures.push(`INTERVIEW conceptual word ${w}`);
}
if ((reInterview.codeBased || []).length < 8) failures.push("INTERVIEW codeBased");
if ((reInterview.seniorScenario || []).length < 5) failures.push("INTERVIEW seniorScenario count");
for (const w of seniorWordCounts) {
  if (w < 200) failures.push(`INTERVIEW seniorScenario word ${w}`);
}
if ((reInterview.wrongAnswers || []).length !== 8) failures.push("INTERVIEW wrongAnswers");
if (!reInterview.jobSwitch) failures.push("INTERVIEW jobSwitch");
if (questions.length !== 30) failures.push("MCQ total");
if (mcqBasic !== 8) failures.push("MCQ basic");
if (mcqIntermediate !== 12) failures.push("MCQ intermediate");
if (mcqAdvanced !== 10) failures.push("MCQ advanced");
if (cheatsheetRows(reCheatsheet.content) < 10) failures.push("CHEATSHEET rows");

console.log(`FAILURES: ${failures.length ? failures.join("; ") : "none"}`);
