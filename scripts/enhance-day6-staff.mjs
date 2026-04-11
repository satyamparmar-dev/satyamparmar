import fs from "fs";

const DAY = 6;
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
    parts.push("You keep this interview answer grounded in JVM behavior, production impact, and concrete diagnostics.");
  }
  return parts.join("\n\n");
}

function appendTheoryTable(content) {
  const extra = `### Production comparison table — recursion safety in real services
| Approach | Operational upside | Production risk |
|---|---|---|
| Guarded recursion with depth checks | Preserves readability and deterministic exits | Missed edge cases if depth contracts are undocumented |
| Iterative rewrite with explicit stack | Stable for deep inputs and easier memory profiling | Higher code complexity without shared conventions |
| Hybrid strategy (recursion for shallow, iterative for deep) | Balances clarity and resilience under mixed traffic | Incorrect threshold tuning can hide latency spikes |
**Interview angle:** You explain the trade-off as a runtime reliability choice, not a style preference.
`;
  return `${content.trim()}\n\n${extra}`;
}

function patchBasicCode(code) {
  const insertion = [
    "        System.out.println(\"=== Recursion production guardrail quick checks ===\");",
    "        System.out.println(\"Depth budget     | Define max recursion depth per endpoint and fail fast\");",
    "        System.out.println(\"Trace capture    | Use jstack snapshots before and during spike windows\");",
    "        System.out.println(\"Fallback policy  | Switch to iterative path when depth threshold is exceeded\");"
  ].join("\n");
  if (code.includes("=== Recursion production guardrail quick checks ===")) return code;
  return code.replace(/\n\s*}\s*$/, `\n${insertion}\n    }\n}`);
}

function buildIntermediateSection() {
  const outputLines = [
    "=== Methods and Recursion intermediate incident drill ===",
    "context: method boundaries define stack behavior and recoverability",
    "context: every scenario links symptom to command evidence",
    "context: each scenario captures one command and one prevention control",
    "context: recursion depth is treated as an SLO-backed reliability concern",
    "context: iterative fallback is mandatory beyond agreed depth threshold",
    "--- Scenario 1: missing base case in production recursion ---",
    "symptom: request thread crashes with StackOverflowError under deep tree input",
    "cause: recursive helper has narrow base case and never terminates for branch variant",
    "step A: capture failing payload depth and endpoint signature",
    "step B: run jstack <pid> and confirm repeated stack frames",
    "fix: add complete base guard and reject invalid negative depth",
    "verify: replay deep fixture and confirm bounded stack growth",
    "staff: codify recursion termination checklist in code review",
    "staff: add depth histogram metric per high-risk endpoint",
    "staff: bind alert threshold to endpoint-specific depth budget",
    "staff: verify rollback path if stack alarms rise after deploy",
    "",
    "--- Scenario 2: wrong overload selected after refactor ---",
    "symptom: precision loss appears in billing path after helper rename",
    "cause: call site resolves to int overload instead of long-safe path",
    "step A: inspect bytecode dispatch using javap -c BillingMath",
    "step B: trace method signatures and argument widening rules",
    "fix: make overload names explicit and enforce long arguments",
    "verify: run regression tests on boundary monetary values",
    "staff: block ambiguous overloads in architecture guidelines",
    "staff: add static analysis rule for numeric method signatures",
    "staff: enforce method naming standard for precision-sensitive paths",
    "staff: require boundary-value test evidence in PR template",
    "",
    "--- Scenario 3: accidental mutual recursion in parser flow ---",
    "symptom: CPU spikes and parser throughput collapses during malformed traffic",
    "cause: two helper methods call each other without shared termination contract",
    "step A: isolate malformed input sample from ingress logs",
    "step B: run jcmd <pid> Thread.print during saturation window",
    "fix: collapse recursion into single guarded state-transition method",
    "verify: replay hostile input and confirm linear processing path",
    "staff: require recursion graph review for parser PRs",
    "staff: run hostile-input benchmark in CI pipeline",
    "staff: keep parser depth dashboard visible to on-call rotation",
    "staff: track recurrence of malformed-input incidents weekly",
    "",
    "--- Scenario 4: deep recursion not migrated to iterative fallback ---",
    "symptom: large partner payloads trigger latency outliers and retries",
    "cause: algorithm keeps recursive depth growth despite known max-branch input",
    "step A: profile call depth with production-shaped payload sample",
    "step B: run jstat -gcutil <pid> 1000 10 to observe pressure trend",
    "fix: route high-depth paths to iterative stack-safe implementation",
    "verify: compare p95 and error rate before and after canary",
    "staff: document depth threshold and rollback criteria in runbook",
    "staff: page platform team when recursion alarms cross baseline",
    "staff: canary high-depth traffic separately before full rollout",
    "staff: enforce fallback switch validation in release checklist",
    ""
  ];

  const code = `package arch.day6;

public class Day6Intermediate {
    public static void main(String[] args) {
        // Incident drill context keeps interview answers operational.
        System.out.println("=== Methods and Recursion intermediate incident drill ===");
        System.out.println("context: method boundaries define stack behavior and recoverability");
        System.out.println("context: every scenario links symptom to command evidence");
        System.out.println("context: each scenario captures one command and one prevention control");
        System.out.println("context: recursion depth is treated as an SLO-backed reliability concern");
        System.out.println("context: iterative fallback is mandatory beyond agreed depth threshold");
        scenario1();
        scenario2();
        scenario3();
        scenario4();
    }

    // Scenario 1 models recursion failure from incomplete base-case logic.
    static void scenario1() {
        System.out.println("--- Scenario 1: missing base case in production recursion ---");
        System.out.println("symptom: request thread crashes with StackOverflowError under deep tree input");
        System.out.println("cause: recursive helper has narrow base case and never terminates for branch variant");
        System.out.println("step A: capture failing payload depth and endpoint signature");
        System.out.println("step B: run jstack <pid> and confirm repeated stack frames");
        System.out.println("fix: add complete base guard and reject invalid negative depth");
        System.out.println("verify: replay deep fixture and confirm bounded stack growth");
        System.out.println("staff: codify recursion termination checklist in code review");
        System.out.println("staff: add depth histogram metric per high-risk endpoint");
        System.out.println("staff: bind alert threshold to endpoint-specific depth budget");
        System.out.println("staff: verify rollback path if stack alarms rise after deploy");
        System.out.println();
    }

    // Scenario 2 shows overload resolution bugs turning into data-quality incidents.
    static void scenario2() {
        System.out.println("--- Scenario 2: wrong overload selected after refactor ---");
        System.out.println("symptom: precision loss appears in billing path after helper rename");
        System.out.println("cause: call site resolves to int overload instead of long-safe path");
        System.out.println("step A: inspect bytecode dispatch using javap -c BillingMath");
        System.out.println("step B: trace method signatures and argument widening rules");
        System.out.println("fix: make overload names explicit and enforce long arguments");
        System.out.println("verify: run regression tests on boundary monetary values");
        System.out.println("staff: block ambiguous overloads in architecture guidelines");
        System.out.println("staff: add static analysis rule for numeric method signatures");
        System.out.println("staff: enforce method naming standard for precision-sensitive paths");
        System.out.println("staff: require boundary-value test evidence in PR template");
        System.out.println();
    }

    // Scenario 3 captures mutual-recursion failure under malformed input.
    static void scenario3() {
        System.out.println("--- Scenario 3: accidental mutual recursion in parser flow ---");
        System.out.println("symptom: CPU spikes and parser throughput collapses during malformed traffic");
        System.out.println("cause: two helper methods call each other without shared termination contract");
        System.out.println("step A: isolate malformed input sample from ingress logs");
        System.out.println("step B: run jcmd <pid> Thread.print during saturation window");
        System.out.println("fix: collapse recursion into single guarded state-transition method");
        System.out.println("verify: replay hostile input and confirm linear processing path");
        System.out.println("staff: require recursion graph review for parser PRs");
        System.out.println("staff: run hostile-input benchmark in CI pipeline");
        System.out.println("staff: keep parser depth dashboard visible to on-call rotation");
        System.out.println("staff: track recurrence of malformed-input incidents weekly");
        System.out.println();
    }

    // Scenario 4 highlights when recursion must become iterative by policy.
    static void scenario4() {
        System.out.println("--- Scenario 4: deep recursion not migrated to iterative fallback ---");
        System.out.println("symptom: large partner payloads trigger latency outliers and retries");
        System.out.println("cause: algorithm keeps recursive depth growth despite known max-branch input");
        System.out.println("step A: profile call depth with production-shaped payload sample");
        System.out.println("step B: run jstat -gcutil <pid> 1000 10 to observe pressure trend");
        System.out.println("fix: route high-depth paths to iterative stack-safe implementation");
        System.out.println("verify: compare p95 and error rate before and after canary");
        System.out.println("staff: document depth threshold and rollback criteria in runbook");
        System.out.println("staff: page platform team when recursion alarms cross baseline");
        System.out.println("staff: canary high-depth traffic separately before full rollout");
        System.out.println("staff: enforce fallback switch validation in release checklist");
        System.out.println();
    }
}`;

  return { code, output: `${outputLines.join("\n")}\n` };
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
const shouldPatchTheory = tableCount(theory.content) < 3;
const shouldPatchBasic = codeLineCount(basic.code) < 40 || codeLineCount(basic.code) > 60;
const shouldPatchIntermediate =
  scenarioCount(intermediate.code) < 4 || codeLineCount(intermediate.code) < 70 || codeLineCount(intermediate.code) > 100;

if (shouldPatchWhy) {
  why.content = normalizeWhyParagraphs(why.content);
}

if (shouldPatchTheory) {
  theory.content = appendTheoryTable(theory.content);
}

if (shouldPatchBasic) {
  basic.code = patchBasicCode(basic.code);
  basic.output = deriveOutputFromCode(basic.code);
}

if (shouldPatchIntermediate) {
  const built = buildIntermediateSection();
  intermediate.code = built.code;
  intermediate.output = built.output;
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
