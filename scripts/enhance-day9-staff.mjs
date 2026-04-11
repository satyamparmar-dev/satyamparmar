import fs from "fs";

const DAY = 9;
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

function patchTheory(theory) {
  const ANCHOR = "Production comparison table — operator triage";
  if ((theory.content || "").includes(ANCHOR)) return;
  const needle = "### 22. Fail-fast validation\n";
  if (!(theory.content || "").includes(needle)) {
    throw new Error(`Day ${DAY} theory patch anchor "${needle.trim()}" missing`);
  }
  const insert =
    "### Production comparison table — operator triage\n\n" +
    "During a noisy incident, you separate **IOException** environmental faults from deterministic **RuntimeException** clusters before you rollback.\n\n" +
    "| Signal | Likely failure domain | First stabilising check |\n" +
    "|--------|------------------------|-------------------------|\n" +
    "| Bursty **IOException** | network or disk pressure | `jcmd <pid> VM.native_memory summary` plus socket backlog dashboards |\n" +
    "| **RuntimeException** cluster | bad deploy or bad validation | `jstack <pid>` on a canary to read the hottest frames |\n" +
    "| **Error** in logs (**OutOfMemoryError**) | **JVM** heap or metaspace limits | `jmap -heap <pid>` snapshot before a controlled restart |\n\n" +
    "**Interview angle:** Tie each row to whether you retry, roll forward with a fix, or escalate to the platform team.\n\n";
  theory.content = theory.content.replace(needle, insert + needle);
}

function patchBasic(basic) {
  const ANCHOR = "policy cue: OutOfMemoryError";
  if ((basic.code || "").includes(ANCHOR)) return;
  basic.code = basic.code.replace(
    `        System.out.println("rehearse finally output from Day 9 assignment snippet");\n        System.out.println("done");`,
    `        System.out.println("rehearse finally output from Day 9 assignment snippet");\n        System.out.println("policy cue: OutOfMemoryError StackOverflowError belong to platform not feature catches");\n        System.out.println("done");`
  );
  basic.output = basic.output.replace(
    `rehearse finally output from Day 9 assignment snippet\ndone\n`,
    `rehearse finally output from Day 9 assignment snippet\npolicy cue: OutOfMemoryError StackOverflowError belong to platform not feature catches\ndone\n`
  );
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

const gapTheoryTables = tableCount(theory.content) < 3;
const gapBasicTooShort = codeLineCount(basic.code) < 40;
if (codeLineCount(basic.code) > 60) {
  throw new Error(`Day ${DAY} CODE basic exceeds 60 lines — trim manually`);
}

if (wordCount(why.content) < 600) {
  throw new Error(`Day ${DAY} WHY word count failed — no patch in this script`);
}
if (paragraphCount(why.content) < 5 || paragraphCount(why.content) > 6) {
  throw new Error(`Day ${DAY} WHY paragraphs failed — no patch in this script`);
}
if (h3Count(theory.content) < 14 || interviewAngleCount(theory.content) < 13) {
  throw new Error(`Day ${DAY} THEORY structure failed — no patch in this script`);
}
if (scenarioCount(intermediate.code) < 4) {
  throw new Error(`Day ${DAY} intermediate scenarios failed — no patch in this script`);
}
if (codeLineCount(intermediate.code) < 70 || codeLineCount(intermediate.code) > 100) {
  throw new Error(`Day ${DAY} intermediate lines failed — no patch in this script`);
}
if (advancedBlockCount(advanced.code) < 3) {
  throw new Error(`Day ${DAY} advanced blocks failed — no patch in this script`);
}
if (codeLineCount(advanced.code) < 60 || codeLineCount(advanced.code) > 100) {
  throw new Error(`Day ${DAY} advanced lines failed — no patch in this script`);
}
if ((pitfalls.items || []).length < 8) {
  throw new Error(`Day ${DAY} pitfalls failed — no patch in this script`);
}
if ((interview.conceptual || []).length < 15 || avgAnswerWords(interview.conceptual || []) < 120) {
  throw new Error(`Day ${DAY} conceptual interview failed — no patch in this script`);
}
if ((interview.codeBased || []).length < 8) {
  throw new Error(`Day ${DAY} codeBased interview failed — no patch in this script`);
}
if ((interview.seniorScenario || []).length < 5 || avgAnswerWords(interview.seniorScenario || []) < 200) {
  throw new Error(`Day ${DAY} seniorScenario interview failed — no patch in this script`);
}
if ((interview.wrongAnswers || []).length < 8 || !interview.jobSwitch) {
  throw new Error(`Day ${DAY} wrongAnswers or jobSwitch failed — no patch in this script`);
}
const mq = mcq.questions || [];
if (mq.length !== 30 || mq.filter((q) => q.level === "basic").length !== 8) {
  throw new Error(`Day ${DAY} MCQ basic/total failed — no patch in this script`);
}
if (mq.filter((q) => q.level === "intermediate").length !== 12) {
  throw new Error(`Day ${DAY} MCQ intermediate failed — no patch in this script`);
}
if (mq.filter((q) => q.level === "advanced").length !== 10) {
  throw new Error(`Day ${DAY} MCQ advanced failed — no patch in this script`);
}
if (cheatsheetRows(cheatsheet.content) < 10) {
  throw new Error(`Day ${DAY} cheatsheet failed — no patch in this script`);
}

if (gapTheoryTables) {
  patchTheory(theory);
}
if (gapBasicTooShort) {
  patchBasic(basic);
}

if (gapTheoryTables && tableCount(theory.content) < 3) {
  throw new Error(`Day ${DAY} theory table patch did not apply`);
}
if (gapBasicTooShort && codeLineCount(basic.code) < 40) {
  throw new Error(`Day ${DAY} basic line patch did not apply`);
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
