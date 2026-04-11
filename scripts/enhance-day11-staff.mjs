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
  CHEATSHEET_CONTENT,
} from "./day11-staff-bundle.mjs";
import { CONCEPTUAL, CODE_BASED, SENIOR_SCENARIO } from "./day11-interview-data.mjs";

const FILE = "public/data/days/phase2-day11.json";

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

function reorderMcqLevels(questions) {
  const basicIds = new Set([1, 2, 3, 4, 5, 15, 18, 21]);
  const advancedIds = new Set([13, 14, 19, 22, 23, 25, 26, 27, 29, 30]);
  for (const q of questions) {
    if (basicIds.has(q.id)) q.level = "basic";
    else if (advancedIds.has(q.id)) q.level = "advanced";
    else q.level = "intermediate";
  }
}

function conceptualFails(iv) {
  const arr = iv.conceptual || [];
  if (arr.length < 15) return true;
  for (const q of arr) {
    if (wordCount(q.answer || "") < 120) return true;
  }
  return false;
}

function seniorFails(iv) {
  const arr = iv.seniorScenario || [];
  if (arr.length < 5) return true;
  for (const q of arr) {
    if (wordCount(q.answer || "") < 200) return true;
  }
  return false;
}

function applySelectivePatches(day) {
  const sections = day.sections || [];
  const byType = (t) => sections.find((s) => s.type === t);
  const codes = sections.filter((s) => s.type === "code");
  const basic = codes.find((s) => s.level === "basic");
  const inter = codes.find((s) => s.level === "intermediate");
  const adv = codes.find((s) => s.level === "advanced");
  const why = byType("why");
  const theory = byType("theory");
  const pit = byType("pitfalls");
  const ex = byType("exercise");
  const iv = byType("interview");
  const cs = byType("cheatsheet");
  const mcq = byType("mcq");

  if (wordCount(why.content) < 600 || paragraphCount(why.content) < 5 || paragraphCount(why.content) > 6) {
    why.title = "Why abstract contracts and interfaces decide linkage, evolution, and on-call noise";
    why.content = WHY_CONTENT;
  }

  if (
    h3Count(theory.content) < 14 ||
    tableCount(theory.content) < 3 ||
    interviewAngleCount(theory.content) < 13
  ) {
    theory.title = "Theory and Internals — abstract types, interfaces, defaults, sealed graphs, and Staff tooling";
    theory.content = THEORY_CONTENT;
  }

  if (
    codeLineCount(basic.code) < 40 ||
    codeLineCount(basic.code) > 60 ||
    (basic.code || "").includes("\u2014") ||
    (basic.output || "").includes("\u2014")
  ) {
    Object.assign(basic, {
      title: "Basic — abstract vs interface matrix, javap checklist, linkage failures, BOM posture",
      description:
        "Static **println**-only reference aligning **ACC_ABSTRACT** templates with **invokeinterface** vocabulary for production reviews.",
      code: BASIC_CODE,
      output: BASIC_OUTPUT,
      filename: "Day11Basic.java",
    });
  }

  if (
    scenarioCount(inter.code) < 4 ||
    codeLineCount(inter.code) < 70 ||
    codeLineCount(inter.code) > 100
  ) {
    Object.assign(inter, {
      title: "Intermediate — four scenarios: AbstractMethodError, diamond defaults, static bind, SPI dupes",
      description:
        "Each scenario names **javap** or **jcmd** because **interface** skew shows up as **linkage** faults, not stack traces you can grep casually.",
      code: INTERMEDIATE_CODE,
      output: INTERMEDIATE_OUTPUT,
      filename: "Day11Intermediate.java",
    });
  }

  if (
    advancedBlockCount(adv.code) < 3 ||
    codeLineCount(adv.code) < 60 ||
    codeLineCount(adv.code) > 100
  ) {
    Object.assign(adv, {
      title: "Advanced — opcode catalog, evolution debt board, release readiness matrix",
      description:
        "Deterministic **Map**/**List**/**record** model mirroring Staff guardrails when **interfaces** evolve across dozens of services.",
      code: ADVANCED_CODE,
      output: ADVANCED_OUTPUT,
      filename: "Day11Advanced.java",
    });
  }

  if ((pit.items || []).length !== 8) {
    pit.title = "Common Pitfalls — abstract and interface linkage";
    pit.items = PITFALLS;
  }

  const solLines = codeLineCount(EXERCISE_SOLUTION);
  if (
    solLines < 40 ||
    !ex.problem ||
    wordCount(ex.problem) < 50 ||
    (ex.hints || []).length !== 3
  ) {
    ex.title = "Exercise — LedgerPort defaults, abstract ledger template, and describe() contract";
    ex.problem = EXERCISE_PROBLEM;
    ex.hints = EXERCISE_HINTS;
    ex.solution = EXERCISE_SOLUTION;
    delete ex.difficulty;
  }

  if (conceptualFails(iv) || (iv.codeBased || []).length < 8 || seniorFails(iv) || (iv.wrongAnswers || []).length !== 8 || !iv.jobSwitch) {
    iv.title = "Interview Drill — Abstract Classes and Interfaces";
    if (conceptualFails(iv)) iv.conceptual = CONCEPTUAL;
    if ((iv.codeBased || []).length < 8) iv.codeBased = CODE_BASED;
    if (seniorFails(iv)) iv.seniorScenario = SENIOR_SCENARIO;
    if ((iv.wrongAnswers || []).length !== 8) iv.wrongAnswers = WRONG_ANSWERS;
    if (!iv.jobSwitch) iv.jobSwitch = JOB_SWITCH;
  }

  if (cheatsheetRows(cs.content) < 10) {
    cs.title = "Cheatsheet — abstract classes and interfaces";
    cs.content = CHEATSHEET_CONTENT;
  }

  reorderMcqLevels(mcq.questions || []);
}

const day = JSON.parse(fs.readFileSync(FILE, "utf8"));
applySelectivePatches(day);

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
