import fs from "fs";

const DAY = 5;
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

function buildWhy() {
  return `At 02:17 your **Spring Boot** notification pipeline fails mid-rollout because a hot path concatenates user-visible templates with naive **String** operations, and the symptom appears as sudden p99 latency inflation plus intermittent **OutOfMemoryError** during peak campaign bursts. You first suspect network issues because downstream calls become slower, but **jstack** shows worker threads spending time in string-heavy formatting methods while GC pressure climbs. The artifact is the slim CI image that passed functional tests but never ran a realistic payload-size profile, so the production incident is not a logic bug in one endpoint; it is a platform-level text-processing cost explosion that only appears under sustained traffic.

Interviewers ask about strings to evaluate whether you understand runtime behavior, not whether you can recite API names. They are not checking whether you memorized **String**, **StringBuilder**, and **StringBuffer** method lists. They want evidence that you know how immutable **String** objects interact with heap allocation, how concatenation lowers to builder patterns in bytecode, and how encoding and pooling decisions affect memory and latency in production services. The weak answer says strings are immutable and stops there. The strong answer explains where objects allocate, how temporary objects accumulate, what commands prove the diagnosis, and how version-specific JVM behavior changes practical trade-offs.

First, start with the JVM mechanism: define immutability, object allocation path, and constant-pool interactions for literals and runtime concatenation. Second, connect that mechanism to a production metric such as GC pause spikes, allocation rate growth, or slow request rendering in one service boundary. Third, name a concrete diagnostic command such as **jcmd**, **jmap**, or **javap -c** and state exactly what evidence you inspect in output. Fourth, conclude with a design decision that is version-aware, for example using structured formatting boundaries in **Java 17** and validating memory behavior under realistic payload size before release.

At scale, with 10 engineers shipping into 50 services under rolling deploys, string mistakes multiply into cross-team incidents because each service formats, parses, and normalizes text differently. One team introduces repeated concatenation in a loop and triggers **OutOfMemoryError** under campaign traffic, while another team misuses regex-heavy parsing and causes **StackOverflowError** from pathological input handling in recursive text rules. Both failures look like ordinary application bugs in controllers or transformers, but the real platform mistake is missing shared conventions for text processing, absent payload-size testing, and no performance budget for string allocation in service contracts.

A senior candidate states that in **Java 9** and later, **String** stores characters using compact byte arrays with an internal coder flag, which changes memory footprint relative to pre-Java-9 layouts and affects heap behavior in text-heavy services. Another senior signal is knowing that modern compilers and JVMs optimize some concatenation patterns, but they do not rescue unbounded dynamic concatenation in loops where allocation still explodes under load. In your first six months on a new job this topic shows up weekly. You review a templating service that builds messages with repeated concatenation; you replace hot loops with bounded builder strategy and verify reduced allocation using **jcmd**. You debug a CSV ingestion bug where malformed separators generate huge intermediate strings; you add strict validation and deterministic failure handling before parsing. You triage an on-call alert where response bodies balloon after a feature toggle; you compare heap histograms, isolate string duplication, and ship a contract-level limit that protects all downstream services. You also add a measurable budget for bytes allocated per request, wire that metric into release gates, and require one synthetic load profile in CI so teams cannot merge text-heavy changes without proving stable memory and latency behavior under representative production inputs across peak traffic windows in monthly peak seasons.
`;
}

function buildIntermediate() {
  const outputLines = [
    "--- Scenario 1: template concatenation hotspot ---",
    "symptom: notification endpoint latency jumps from 60ms to 740ms",
    "cause: repeated String concatenation inside per-recipient loop",
    "step A: capture representative payload and loop size",
    "step B: run jstack <pid> and locate formatting call path",
    "fix: replace repeated concatenation with scoped StringBuilder usage",
    "verify: compare p95 latency before and after canary",
    "staff: publish text-formatting guideline for all outbound services",
    "staff: enforce max template size in API contract",
    "",
    "--- Scenario 2: duplicated string payload in cache layer ---",
    "symptom: heap usage climbs linearly during campaign traffic window",
    "cause: same normalized string duplicated across tenant-specific maps",
    "step A: sample top consumers with jmap -histo:live <pid>",
    "step B: confirm duplicate key patterns in memory snapshot",
    "fix: normalize once and reuse shared canonical values",
    "verify: observe flatter old-gen growth after deployment",
    "staff: add memory-budget review for text-heavy cache features",
    "staff: track duplicate ratio in cache diagnostics",
    "",
    "--- Scenario 3: regex parser backtracking meltdown ---",
    "symptom: worker CPU spikes and throughput drops under malformed input",
    "cause: catastrophic regex backtracking in nested optional groups",
    "step A: isolate failing payload from ingress logs",
    "step B: run jcmd <pid> Thread.print during spike",
    "fix: simplify pattern and enforce input length guardrails",
    "verify: replay bad payload and confirm stable processing time",
    "staff: require parser benchmark with hostile input in CI",
    "staff: publish safe-regex checklist for reviewers",
    "",
    "--- Scenario 4: encoding mismatch in integration boundary ---",
    "symptom: downstream reports corrupted text and failed signatures",
    "cause: producer defaults to platform charset instead of UTF-8",
    "step A: inspect startup flags and charset assumptions",
    "step B: run java -verbose:class for text codec loading context",
    "fix: pin explicit UTF-8 encode/decode at all boundaries",
    "verify: run cross-service contract tests with multilingual samples",
    "staff: add encoding checklist item to integration reviews",
    "staff: add charset conformance test in pipeline",
    ""
  ];

  const code = `package arch.day5;

public class Day5Intermediate {
  public static void main(String[] args) {
    // Each scenario models a realistic on-call string incident.
    System.out.println("--- Day 5 intermediate string incident drill ---");
    System.out.println("context: string behavior is allocation plus latency behavior");
    System.out.println("context: each fix must include one command and one verification step");
    System.out.println("context: every scenario ends with one prevention control");
    System.out.println("context: outputs are deterministic for interview practice");
    System.out.println("context: labels stay consistent for runbook copy-paste");
    System.out.println("context: this mirrors a staff on-call narrative");
    scenario1();
    scenario2();
    scenario3();
    scenario4();
  }

  // Scenario 1: classic concatenation hotspot under real traffic.
  static void scenario1() {
    System.out.println("--- Scenario 1: template concatenation hotspot ---");
    System.out.println("symptom: notification endpoint latency jumps from 60ms to 740ms");
    System.out.println("cause: repeated String concatenation inside per-recipient loop");
    System.out.println("step A: capture representative payload and loop size");
    System.out.println("step B: run jstack <pid> and locate formatting call path");
    System.out.println("step C: measure allocated bytes per request in profiler");
    System.out.println("fix: replace repeated concatenation with scoped StringBuilder usage");
    System.out.println("verify: compare p95 latency before and after canary");
    System.out.println("staff: publish text-formatting guideline for all outbound services");
    System.out.println("staff: enforce max template size in API contract");
    System.out.println();
  }

  // Scenario 2: duplicated string values causing heap pressure.
  static void scenario2() {
    System.out.println("--- Scenario 2: duplicated string payload in cache layer ---");
    System.out.println("symptom: heap usage climbs linearly during campaign traffic window");
    System.out.println("cause: same normalized string duplicated across tenant-specific maps");
    System.out.println("step A: sample top consumers with jmap -histo:live <pid>");
    System.out.println("step B: confirm duplicate key patterns in memory snapshot");
    System.out.println("step C: trace canonicalization boundaries in cache writes");
    System.out.println("fix: normalize once and reuse shared canonical values");
    System.out.println("verify: observe flatter old-gen growth after deployment");
    System.out.println("staff: add memory-budget review for text-heavy cache features");
    System.out.println("staff: track duplicate ratio in cache diagnostics");
    System.out.println();
  }

  // Scenario 3: parser instability from expensive regex backtracking.
  static void scenario3() {
    System.out.println("--- Scenario 3: regex parser backtracking meltdown ---");
    System.out.println("symptom: worker CPU spikes and throughput drops under malformed input");
    System.out.println("cause: catastrophic regex backtracking in nested optional groups");
    System.out.println("step A: isolate failing payload from ingress logs");
    System.out.println("step B: run jcmd <pid> Thread.print during spike");
    System.out.println("step C: isolate regex branch with highest backtracking cost");
    System.out.println("fix: simplify pattern and enforce input length guardrails");
    System.out.println("verify: replay bad payload and confirm stable processing time");
    System.out.println("staff: require parser benchmark with hostile input in CI");
    System.out.println("staff: publish safe-regex checklist for reviewers");
    System.out.println();
  }

  // Scenario 4: integration failure from implicit charset behavior.
  static void scenario4() {
    System.out.println("--- Scenario 4: encoding mismatch in integration boundary ---");
    System.out.println("symptom: downstream reports corrupted text and failed signatures");
    System.out.println("cause: producer defaults to platform charset instead of UTF-8");
    System.out.println("step A: inspect startup flags and charset assumptions");
    System.out.println("step B: run java -verbose:class for text codec loading context");
    System.out.println("step C: capture byte-length deltas for multilingual payloads");
    System.out.println("fix: pin explicit UTF-8 encode/decode at all boundaries");
    System.out.println("verify: run cross-service contract tests with multilingual samples");
    System.out.println("staff: add encoding checklist item to integration reviews");
    System.out.println("staff: add charset conformance test in pipeline");
    System.out.println("staff: pin charset defaults in shared bootstrap module");
    System.out.println("staff: alert on non-UTF8 boundary conversion attempts");
    System.out.println();
  }
}`;

  return { code, output: `${outputLines.join("\n")}\n` };
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

const shouldPatchWhy = wordCount(why.content) < 600 || paragraphCount(why.content) < 5 || paragraphCount(why.content) > 6;
const shouldPatchIntermediate =
  scenarioCount(intermediate.code) < 4 || codeLineCount(intermediate.code) < 70 || codeLineCount(intermediate.code) > 100;

if (shouldPatchWhy) {
  why.content = buildWhy();
}

if (shouldPatchIntermediate) {
  const built = buildIntermediate();
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
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { enhanceDay } from './enhance-day-staff-lib.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = dirname(__dirname);

enhanceDay({ workspaceRoot, dayNumber: 5 });
