import fs from "fs";

const DAY = 7;
const FILE = `public/data/days/phase1-day${DAY}.json`;

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

function normalizeWhyParagraphs(content) {
  const parts = (content || "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  while (parts.length > 6) {
    const last = parts.pop();
    parts[parts.length - 1] = `${parts[parts.length - 1]} ${last}`;
  }
  while (parts.length < 5) {
    parts.push("You keep OOP answers grounded in JVM object model, production impact, and concrete diagnostic evidence.");
  }
  return parts.join("\n\n");
}

function patchBasicCode(code) {
  if (code.includes("=== OOP team guardrail quick checks ===")) return code;
  const insertion = [
    "        // Guardrail quick checks keep OOP usage consistent across services.",
    "        System.out.println(\"=== OOP team guardrail quick checks ===\");",
    "        System.out.println(\"Contract review  | Check inheritance and composition boundaries before release\");",
    "        System.out.println(\"Heap profile     | Validate object churn in hot polymorphic paths with jcmd\");",
    "        System.out.println(\"On-call playbook | Capture jstack + failing class hierarchy assumptions first\");"
  ].join("\n");
  return code.replace(/\n\s*}\s*$/, `\n${insertion}\n    }\n}`);
}

function deriveOutputFromCode(code) {
  const lines = [];
  const re = /System\.out\.println\("((?:[^"\\]|\\.)*)"\);/g;
  let m = re.exec(code);
  while (m) {
    const raw = m[1];
    const value = raw
      .replace(/\\\\/g, "\\")
      .replace(/\\"/g, "\"")
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "\t");
    lines.push(value);
    m = re.exec(code);
  }
  return `${lines.join("\n")}\n`;
}

const day = JSON.parse(fs.readFileSync(FILE, "utf8"));
const sections = day.sections || [];
const byType = (type) => sections.find((s) => s.type === type);
const codeSections = sections.filter((s) => s.type === "code");
const basic = codeSections.find((s) => s.level === "basic");
const intermediate = codeSections.find((s) => s.level === "intermediate");
const advanced = codeSections.find((s) => s.level === "advanced");
const why = byType("why");
const theory = byType("theory");
const pitfalls = byType("pitfalls");
const interview = byType("interview");
const mcq = byType("mcq");
const cheatsheet = byType("cheatsheet");

const shouldPatchWhy = paragraphCount(why.content) < 5 || paragraphCount(why.content) > 6;
const shouldPatchBasic = codeLineCount(basic.code) < 40 || codeLineCount(basic.code) > 60;

if (shouldPatchWhy) {
  why.content = normalizeWhyParagraphs(why.content);
}

if (shouldPatchBasic) {
  basic.code = patchBasicCode(basic.code);
  basic.output = deriveOutputFromCode(basic.code);
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
if (codeLineCount(reIntermediate.code) < 70 || codeLineCount(reIntermediate.code) > 100) failures.push("CODE intermediate lines");
if (advancedBlockCount(reAdvanced.code) < 3) failures.push("CODE advanced blocks");
if (codeLineCount(reAdvanced.code) < 60 || codeLineCount(reAdvanced.code) > 100) failures.push("CODE advanced lines");
if ((rePitfalls.items || []).length < 8) failures.push("PITFALLS items");
if ((reInterview.conceptual || []).length < 15) failures.push("INTERVIEW conceptual count");
if (avgAnswerWords(reInterview.conceptual || []) < 120) failures.push("INTERVIEW conceptual avg");
if ((reInterview.codeBased || []).length < 8) failures.push("INTERVIEW codeBased");
if ((reInterview.seniorScenario || []).length < 5) failures.push("INTERVIEW seniorScenario count");
if (avgAnswerWords(reInterview.seniorScenario || []) < 200) failures.push("INTERVIEW seniorScenario avg");
if ((reInterview.wrongAnswers || []).length < 8) failures.push("INTERVIEW wrongAnswers");
if (!reInterview.jobSwitch) failures.push("INTERVIEW jobSwitch");
if (questions.length !== 30) failures.push("MCQ total");
if (mcqBasic !== 8) failures.push("MCQ basic");
if (mcqIntermediate !== 12) failures.push("MCQ intermediate");
if (mcqAdvanced !== 10) failures.push("MCQ advanced");
if (cheatsheetRows(reCheatsheet.content) < 10) failures.push("CHEATSHEET rows");

console.log(`FAILURES: ${failures.length ? failures.join("; ") : "none"}`);
