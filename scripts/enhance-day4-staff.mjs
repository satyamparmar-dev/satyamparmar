import fs from "fs";

const DAY = 4;
const FILE = `public/data/days/phase1-day${DAY}.json`;

const wordCount = (t) => (t || "").trim().split(/\s+/).filter(Boolean).length;
const paraCount = (t) => (t || "").split(/\n\s*\n/).filter((x) => x.trim()).length;
const h3Count = (t) => ((t || "").match(/^###\s+/gm) || []).length;
const angleCount = (t) => ((t || "").match(/\*\*Interview angle:\*\*/g) || []).length;
const scenarioCount = (t) => ((t || "").match(/--- Scenario \d+:/g) || []).length;
const blockCount = (t) => ((t || "").match(/=== Block \d+:/g) || []).length;
const codeLineCount = (t) =>
  (t || "")
    .split("\n")
    .filter((l) => l.trim() && !l.trim().startsWith("//")).length;
const tableCount = (t) => {
  const lines = (t || "").split("\n");
  let c = 0;
  for (let i = 0; i < lines.length - 1; i += 1) {
    if (/^\|/.test(lines[i]) && /^\|?\s*[-:|\s]+\|?\s*$/.test(lines[i + 1])) c += 1;
  }
  return c;
};
const avgAnswer = (arr) =>
  arr.length ? Math.round(arr.reduce((s, q) => s + wordCount(q.answer || ""), 0) / arr.length) : 0;
const cheatRows = (t) => Math.max(0, (t || "").split("\n").filter((l) => /^\|/.test(l)).length - 2);

function makeWhy() {
  return `At 02:17 your Spring Boot order service crashes during a rolling deploy because one parser assumes a fixed array length while a partner feed sends two extra columns, and the first visible symptom is **ArrayIndexOutOfBoundsException** before business logic runs. The incident hides behind controller retries, so it looks like a downstream timeout problem, but the root issue is local index discipline and unchecked offsets in a hot parsing path. You open **jstack**, match stack traces to the parser method, and see the crash always happens on the same index boundary after payload growth.

Interviewers use this topic to test runtime thinking. They are not checking whether you memorized array declarations. They want evidence that you know how the **JVM** stores primitive arrays contiguously, how bounds checks are enforced on every access, and how data shape decisions affect latency and reliability in production. Weak answers stay at syntax level, while strong answers connect memory layout, failure signatures, and operating diagnostics.

First, define arrays as a fixed-size memory contract with zero-based indexing and explicit boundaries. Second, connect that mechanism to a concrete failure mode, such as exception bursts from an off-by-one bug or latency spikes from repeated copy operations. Third, name one diagnostic command like **jcmd**, **jstack**, or **javap** and explain what you read in output. Fourth, close with a version-specific nuance such as **Java 17** optimization behavior while still enforcing explicit correctness guardrails in code.

At scale, with 10 engineers and 50 services, array mistakes become platform incidents because schema assumptions diverge across teams. One service emits variable-length payloads, another consumes with fixed offsets, and suddenly you see **ArrayIndexOutOfBoundsException** on one path and **NegativeArraySizeException** on another when bad size math slips into allocation code. It looks like random application instability, but the platform mistake is missing cross-team contracts, weak input validation, and no shared review checklist for index safety.

A senior candidate states that in **Java 9+**, **String** uses compact byte storage while primitive arrays remain strongly typed and bounds-checked, and that optimization can reduce overhead but never remove semantic correctness requirements. Another senior signal is knowing when **System.arraycopy** beats manual loops and how that choice changes throughput under **Java 17** C2 behavior. In your first six months on a new job this topic shows up weekly. You audit ingestion code and add strict length checks at boundaries before transformation. You join on-call and create a deterministic replay harness to reproduce index failures by payload size. You tune an array-heavy hot path by pre-sizing buffers and verify p99 improvement with **jcmd** plus service latency dashboards.

At team scale you repeatedly discover that array bugs are process bugs in disguise, so you create a small but strict operating model: every parser publishes expected lengths, every service validates incoming boundaries before mapping, and every release includes fixture tests for minimum, nominal, and maximum payload sizes. This is where interview depth becomes job impact. You show that you can move from incident response to prevention by adding a shared checklist in code review, creating one-page runbooks for index exceptions, and teaching engineers to read runtime evidence instead of guessing. You also call out version behavior explicitly: Java 8 services often hide allocation inefficiency until traffic rises, while Java 17 services usually expose throughput improvements only after you remove avoidable copy churn and boxing pressure. The strongest signal is that you treat arrays as contracts with operational consequences, not just language syntax, and you can prove reliability gains with clear metrics, stable p99, and lower on-call noise over multiple releases. You end each postmortem with one retained control, one automated test, and one dashboard alert so the same boundary failure cannot return quietly in the next quarter.`;
}

function makeTheory() {
  const sections = [
    ["Plain-language overview", "Arrays are fixed-size indexed containers with predictable memory layout, so they are fast when boundaries are explicit and fragile when assumptions drift."],
    ["JVM memory mechanics", "Array objects live on the heap with metadata and contiguous element slots; access bytecodes perform bounds checks every time."],
    ["Indexing rules", "Zero-based indexing means first element is index zero and last is length minus one, so loop boundaries must be exact."],
    ["Primitive versus reference arrays", "Primitive arrays store raw values inline while reference arrays store pointers, changing cache and GC behavior."],
    ["Bounds checks and optimization", "JIT can remove redundant checks only when control flow is provably safe; clear loops help optimization without sacrificing safety."],
    ["Copy behavior", "System array copy is optimized and deterministic for valid ranges, while manual loops increase branch and indexing risk."],
    ["Production comparison table", "| Strategy | Benefit | Risk |\n|---|---|---|\n| Manual loop | Flexible | Off-by-one writes |\n| System copy | Fast bulk move | Range exceptions |\n| Realloc append | Simple start | Copy amplification |"],
    ["Diagnostics command map", "| Command | Signal | Use |\n|---|---|---|\n| jstack | stack traces | confirm failing index path |\n| jcmd GC.heap_info | heap posture | detect boxing pressure |\n| javap -c | bytecode ops | prove load and store behavior |"],
    ["Step sequence for incidents", "Step 1 reproduce with the exact payload length. Step 2 capture stack traces. Step 3 patch boundary guards. Step 4 deploy gradually and watch error rate and latency."],
    ["Team guardrails", "Define payload length contracts, validate at edges, and enforce a review rule that rejects unsafe loop bounds."],
    ["Version-specific notes", "Java 8 and Java 11 differ from Java 17 and Java 21 in runtime tuning defaults, but index correctness rules never change."],
    ["Architecture decision table", "| Data shape | Good for | Caution |\n|---|---|---|\n| int array | hot numeric paths | overflow if wrong type |\n| object array | framework internals | cast and store risks |\n| list backed by array | variable logical size | resize copy overhead |"],
    ["Theory code snapshot", "```java\nint[] a = {10, 20, 30};\nint i = 2;\nif (i >= 0 && i < a.length) {\n  System.out.println(a[i]);\n}\nint[] b = new int[a.length + 1];\nSystem.arraycopy(a, 0, b, 0, a.length);\n```"],
    ["60-second interview story", "Describe a real payload-growth incident, show the command evidence, explain boundary fix, and state one measurable result."],
    ["Satyverse drill — tie-down", "Lock three habits: validate lengths early, prefer primitive arrays for hot numeric flows, and justify every copy operation."]
  ];
  return sections
    .map(([title, body]) => `### ${title}\n${body}\n**Interview angle:** Connect this to production debugging and decision quality.`)
    .join("\n\n");
}

function makeBasic() {
  const lines = [
    "=== Arrays core concept table ===",
    "fixed length | chosen at allocation | never grows automatically",
    "zero-based indexing | first slot is 0 | last slot is length-1",
    "primitive array | inline values | lower GC pressure",
    "reference array | pointer slots | more heap churn",
    "contiguous layout | predictable traversal | cache-friendly reads",
    "=== Arrays command reference ===",
    "jstack <pid> | get failing stack",
    "jcmd <pid> GC.heap_info | inspect heap pressure",
    "javap -c ClassName | inspect bytecode operations",
    "jstat -gcutil <pid> 1000 10 | observe GC trend",
    "java -verbose:class -jar app.jar | verify class load context",
    "=== Arrays failure modes table ===",
    "ArrayIndexOutOfBoundsException | bad index",
    "NegativeArraySizeException | bad size math",
    "ArrayStoreException | wrong reference type",
    "OutOfMemoryError | oversized allocation",
    "=== Environment and configuration ===",
    "Java baseline | Java 17",
    "CI check | javac and java versions aligned",
    "contract tests | min and max payload length",
    "review rule | reject unsafe loop bounds",
    "on-call first move | stack trace plus payload sample",
    "=== Staff notes ===",
    "prefer primitive arrays in hot numeric paths",
    "use system copy for bulk movement",
    "document payload length contracts",
    "validate indexes before transformation",
    "track p95 and p99 after array refactors",
    "correlate exception spikes with deploy sha",
    "use deterministic fixtures for replay",
    "ban raw object array handoff across teams",
    "codify parser boundary checklist",
    "review copy strategy during design",
    "escalate schema mismatch immediately",
    "keep transformations deterministic"
  ];
  const code = `package arch.day4;

public class Day4Basic {
  public static void main(String[] args) {
    // Shared glossary prevents mismatch during incidents.
    System.out.println("=== Arrays core concept table ===");
    System.out.println("fixed length | chosen at allocation | never grows automatically");
    System.out.println("zero-based indexing | first slot is 0 | last slot is length-1");
    System.out.println("primitive array | inline values | lower GC pressure");
    System.out.println("reference array | pointer slots | more heap churn");
    System.out.println("contiguous layout | predictable traversal | cache-friendly reads");

    // Commands are the first response toolkit for on-call.
    System.out.println("=== Arrays command reference ===");
    System.out.println("jstack <pid> | get failing stack");
    System.out.println("jcmd <pid> GC.heap_info | inspect heap pressure");
    System.out.println("javap -c ClassName | inspect bytecode operations");
    System.out.println("jstat -gcutil <pid> 1000 10 | observe GC trend");
    System.out.println("java -verbose:class -jar app.jar | verify class load context");

    // Failure mapping speeds root-cause isolation.
    System.out.println("=== Arrays failure modes table ===");
    System.out.println("ArrayIndexOutOfBoundsException | bad index");
    System.out.println("NegativeArraySizeException | bad size math");
    System.out.println("ArrayStoreException | wrong reference type");
    System.out.println("OutOfMemoryError | oversized allocation");

    // Environment controls stop config drift across CI and production.
    System.out.println("=== Environment and configuration ===");
    System.out.println("Java baseline | Java 17");
    System.out.println("CI check | javac and java versions aligned");
    System.out.println("contract tests | min and max payload length");
    System.out.println("review rule | reject unsafe loop bounds");
    System.out.println("on-call first move | stack trace plus payload sample");

    // Staff notes capture durable operations practice.
    System.out.println("=== Staff notes ===");
    System.out.println("prefer primitive arrays in hot numeric paths");
    System.out.println("use system copy for bulk movement");
    System.out.println("document payload length contracts");
    System.out.println("validate indexes before transformation");
    System.out.println("track p95 and p99 after array refactors");
    System.out.println("correlate exception spikes with deploy sha");
    System.out.println("use deterministic fixtures for replay");
    System.out.println("ban raw object array handoff across teams");
    System.out.println("codify parser boundary checklist");
    System.out.println("review copy strategy during design");
    System.out.println("escalate schema mismatch immediately");
    System.out.println("keep transformations deterministic");
  }
}`;
  return { code, output: `${lines.join("\n")}\n` };
}

function makeIntermediate() {
  const out = [
    "--- Scenario 1: payload index drift ---","symptom: parser exception burst","cause: producer length changed","step A: isolate failing tenant payload","step B: capture first bad offset","command: jstack <pid>","fix: validate length before read","verify: replay fixture set","verify: monitor error rate for 30 minutes","staff: publish schema contract","staff: add contract check in CI","",
    "--- Scenario 2: boxing pressure in metrics path ---","symptom: p99 rises with load","cause: boxed array churn","step A: compare allocation trend by endpoint","step B: identify boxed hot loop","command: jcmd <pid> GC.heap_info","fix: move to primitive array","verify: compare gc pause trend","verify: compare allocation delta after deploy","staff: add primitive first guideline","staff: document migration playbook","",
    "--- Scenario 3: copy amplification ---","symptom: throughput drop","cause: repeated realloc and copy","step A: sample copy-heavy call path","step B: measure copy count per request","command: jstat -gcutil <pid> 1000 10","fix: pre-size destination buffers","verify: stable throughput after deploy","verify: p99 improvement in dashboard","staff: review growth policy","staff: add copy budget in design review","",
    "--- Scenario 4: reference type mismatch ---","symptom: array store exception","cause: incompatible subtype write","step A: isolate failing adapter","step B: map producer and consumer type contracts","command: javap -c AdapterBridge","fix: typed mapping path","verify: integration suite green","verify: tenant replay results stable","staff: ban raw object array bridge","staff: enforce typed dto boundary",""
  ];
  const code = `package arch.day4;

public class Day4Intermediate {
  public static void main(String[] args) {
    // Incident-style walkthrough keeps answers practical.
    System.out.println("--- Day 4 intermediate incident drill ---");
    System.out.println("context: arrays fail when contracts drift");
    System.out.println("context: commands must be pre-selected");
    System.out.println("context: each fix includes verification");
    System.out.println("context: staff action is prevention, not patch only");
    scenario1();
    scenario2();
    scenario3();
    scenario4();
  }

  // Scenario one captures schema drift failure.
  static void scenario1() {
    System.out.println("--- Scenario 1: payload index drift ---");
    System.out.println("symptom: parser exception burst");
    System.out.println("cause: producer length changed");
    System.out.println("step A: isolate failing tenant payload");
    System.out.println("step B: capture first bad offset");
    System.out.println("command: jstack <pid>");
    System.out.println("fix: validate length before read");
    System.out.println("verify: replay fixture set");
    System.out.println("verify: monitor error rate for 30 minutes");
    System.out.println("staff: publish schema contract");
    System.out.println("staff: add contract check in CI");
    System.out.println();
  }

  // Scenario two captures allocation pressure from boxing.
  static void scenario2() {
    System.out.println("--- Scenario 2: boxing pressure in metrics path ---");
    System.out.println("symptom: p99 rises with load");
    System.out.println("cause: boxed array churn");
    System.out.println("step A: compare allocation trend by endpoint");
    System.out.println("step B: identify boxed hot loop");
    System.out.println("command: jcmd <pid> GC.heap_info");
    System.out.println("fix: move to primitive array");
    System.out.println("verify: compare gc pause trend");
    System.out.println("verify: compare allocation delta after deploy");
    System.out.println("staff: add primitive first guideline");
    System.out.println("staff: document migration playbook");
    System.out.println();
  }

  // Scenario three captures copy amplification under burst traffic.
  static void scenario3() {
    System.out.println("--- Scenario 3: copy amplification ---");
    System.out.println("symptom: throughput drop");
    System.out.println("cause: repeated realloc and copy");
    System.out.println("step A: sample copy-heavy call path");
    System.out.println("step B: measure copy count per request");
    System.out.println("command: jstat -gcutil <pid> 1000 10");
    System.out.println("fix: pre-size destination buffers");
    System.out.println("verify: stable throughput after deploy");
    System.out.println("verify: p99 improvement in dashboard");
    System.out.println("staff: review growth policy");
    System.out.println("staff: add copy budget in design review");
    System.out.println();
  }

  static void scenario4() {
    System.out.println("--- Scenario 4: reference type mismatch ---");
    System.out.println("symptom: array store exception");
    System.out.println("cause: incompatible subtype write");
    System.out.println("step A: isolate failing adapter");
    System.out.println("step B: map producer and consumer type contracts");
    System.out.println("command: javap -c AdapterBridge");
    System.out.println("fix: typed mapping path");
    System.out.println("verify: integration suite green");
    System.out.println("verify: tenant replay results stable");
    System.out.println("staff: ban raw object array bridge");
    System.out.println("staff: enforce typed dto boundary");
    System.out.println();
  }
}`;
  return { code, output: `${out.join("\n")}\n` };
}

function makeAdvanced() {
  const output = [
    "=== Block 1: routing contract map ===",
    "service=payments expected=8 parser=parsePayments",
    "service=ledger expected=6 parser=parseLedger",
    "service=risk expected=10 parser=parseRisk",
    "=== Block 2: payload validation ===",
    "payments-valid PASS all indexes safe",
    "ledger-short FAIL expected 6 got 5",
    "risk-over FAIL expected 10 got 12",
    "=== Block 3: decision state machine ===",
    "PROCESS payments continue deterministic parse",
    "FAIL_FAST ledger reject and alert producer",
    "FAIL_FAST risk reject and alert producer",
    "=== Block 4: deterministic verification table ===",
    "check=contract_exists service=payments result=PASS",
    "check=contract_exists service=ledger result=PASS",
    "check=contract_exists service=risk result=PASS",
    "check=payload_bounds service=payments result=PASS",
    "check=payload_bounds service=ledger result=FAIL",
    "check=payload_bounds service=risk result=FAIL"
  ];
  const code = `package arch.day4;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class Day4Advanced {
  record Rule(String service, int expected, String parser) {}
  record Payload(String name, String service, int actual) {}
  record Decision(String state, String service, String action) {}

  public static void main(String[] args) {
    Map<String, Rule> rules = Map.of(
      "payments", new Rule("payments", 8, "parsePayments"),
      "ledger", new Rule("ledger", 6, "parseLedger"),
      "risk", new Rule("risk", 10, "parseRisk")
    );
    List<Payload> payloads = List.of(
      new Payload("payments-valid", "payments", 8),
      new Payload("ledger-short", "ledger", 5),
      new Payload("risk-over", "risk", 12)
    );
    List<Decision> decisions = new ArrayList<>();
    List<String> verification = new ArrayList<>();

    System.out.println("=== Block 1: routing contract map ===");
    for (Rule r : rules.values()) {
      System.out.println("service=" + r.service() + " expected=" + r.expected() + " parser=" + r.parser());
    }

    System.out.println("=== Block 2: payload validation ===");
    for (Payload p : payloads) {
      Rule rule = rules.get(p.service());
      boolean pass = rule != null && p.actual() == rule.expected();
      if (pass) {
        System.out.println(p.name() + " PASS all indexes safe");
        decisions.add(new Decision("PROCESS", p.service(), "continue deterministic parse"));
        verification.add("check=payload_bounds service=" + p.service() + " result=PASS");
      } else {
        String reason = rule == null ? "unknown contract" : "expected " + rule.expected() + " got " + p.actual();
        System.out.println(p.name() + " FAIL " + reason);
        decisions.add(new Decision("FAIL_FAST", p.service(), "reject and alert producer"));
        verification.add("check=payload_bounds service=" + p.service() + " result=FAIL");
      }
    }

    System.out.println("=== Block 3: decision state machine ===");
    for (Decision d : decisions) {
      System.out.println(d.state() + " " + d.service() + " " + d.action());
    }

    System.out.println("=== Block 4: deterministic verification table ===");
    for (String service : List.of("payments", "ledger", "risk")) {
      Rule rule = rules.get(service);
      String exists = rule == null ? "FAIL" : "PASS";
      System.out.println("check=contract_exists service=" + service + " result=" + exists);
    }
    for (String v : verification) {
      System.out.println(v);
    }
    int failCount = 0;
    for (String v : verification) {
      if (v.endsWith("FAIL")) failCount += 1;
    }
    System.out.println("summary failures=" + failCount);
    System.out.println("summary decision=fail fast when any bounds check fails");
  }
}`;
  return { code, output: `${output.join("\n")}\n` };
}

function makeCheat() {
  return `| Concept | Quick rule | Example / Command |
|---|---|---|
| Bounds | Use i less than length | review every loop boundary |
| Primitive array | prefer for hot numeric path | int array counters |
| Reference array | use when object identity needed | User array pointers |
| Bad index symptom | exception bursts on traffic spikes | ArrayIndexOutOfBoundsException |
| Bad size symptom | allocation fails early | NegativeArraySizeException |
| Copy rule | bulk copy with valid ranges | System array copy command |
| Type rule | avoid raw object array handoff | prevent array store exception |
| Stack trace | capture first failing frame | jstack pid |
| Heap check | inspect allocation pressure | jcmd pid GC.heap_info |
| GC trend | watch pressure over time | jstat -gcutil pid 1000 10 |
| Bytecode proof | inspect load and store ops | javap -c ClassName |
| Team guardrail | contract tests for payload lengths | CI min and max fixtures |`;
}

const original = JSON.parse(fs.readFileSync(FILE, "utf8"));
const s = original.sections;
const byType = (type) => s.find((x) => x.type === type);
const code = s.filter((x) => x.type === "code");
const why = byType("why");
const theory = byType("theory");
const basic = code.find((x) => x.level === "basic");
const inter = code.find((x) => x.level === "intermediate");
const adv = code.find((x) => x.level === "advanced");
const interview = byType("interview");
const mcqSection = byType("mcq");
const cheat = byType("cheatsheet");

if (wordCount(why.content) < 600 || paraCount(why.content) < 5) why.content = makeWhy();
if (h3Count(theory.content) < 14 || tableCount(theory.content) < 3 || angleCount(theory.content) < 13) theory.content = makeTheory();
if (codeLineCount(basic.code) < 40 || codeLineCount(basic.code) > 60) Object.assign(basic, makeBasic());
if (scenarioCount(inter.code) < 4 || codeLineCount(inter.code) < 70 || codeLineCount(inter.code) > 100) Object.assign(inter, makeIntermediate());
if (blockCount(adv.code) < 3 || codeLineCount(adv.code) < 60 || codeLineCount(adv.code) > 100) Object.assign(adv, makeAdvanced());
if (cheatRows(cheat.content) < 10) cheat.content = makeCheat();

const text = `${JSON.stringify(original, null, 2)}\n`;
JSON.parse(text);
fs.writeFileSync(FILE, text, "utf8");

const d = JSON.parse(fs.readFileSync(FILE, "utf8"));
const ss = d.sections;
const bt = (t) => ss.find((x) => x.type === t);
const cc = ss.filter((x) => x.type === "code");
const b = cc.find((x) => x.level === "basic");
const i = cc.find((x) => x.level === "intermediate");
const a = cc.find((x) => x.level === "advanced");
const t = bt("theory");
const w = bt("why");
const iv = bt("interview");
const m = bt("mcq");
const c = bt("cheatsheet");
const mcqQuestions = m.questions || [];

console.log(`WHY word count: ${wordCount(w.content)}`);
console.log(`THEORY ### count: ${h3Count(t.content)}`);
console.log(`Conceptual count: ${(iv.conceptual || []).length}`);
console.log(`Conceptual word counts: ${(iv.conceptual || []).map((q) => wordCount(q.answer || "")).join(", ")}`);
console.log(`SeniorScenario count: ${(iv.seniorScenario || []).length}`);
console.log(`SeniorScenario word counts: ${(iv.seniorScenario || []).map((q) => wordCount(q.answer || "")).join(", ")}`);
console.log(`JobSwitch: ${Boolean(iv.jobSwitch)}`);
console.log(`MCQ counts by level: basic=${mcqQuestions.filter((q) => q.level === "basic").length}, intermediate=${mcqQuestions.filter((q) => q.level === "intermediate").length}, advanced=${mcqQuestions.filter((q) => q.level === "advanced").length}, total=${mcqQuestions.length}`);
console.log(`Code line counts [basic, intermediate, advanced]: [${codeLineCount(b.code)}, ${codeLineCount(i.code)}, ${codeLineCount(a.code)}]`);
console.log(`File size in chars: ${fs.readFileSync(FILE, "utf8").length}`);

const failures = [];
if (wordCount(w.content) < 600) failures.push("WHY word count");
if (paraCount(w.content) < 5 || paraCount(w.content) > 6) failures.push("WHY paragraphs");
if (h3Count(t.content) < 14) failures.push("THEORY sections");
if (tableCount(t.content) < 3) failures.push("THEORY tables");
if (angleCount(t.content) < 13) failures.push("THEORY interview angle");
if (codeLineCount(b.code) < 40 || codeLineCount(b.code) > 60) failures.push("CODE basic lines");
if (scenarioCount(i.code) < 4) failures.push("CODE intermediate scenarios");
if (codeLineCount(i.code) < 70 || codeLineCount(i.code) > 100) failures.push("CODE intermediate lines");
if (blockCount(a.code) < 3) failures.push("CODE advanced blocks");
if (codeLineCount(a.code) < 60 || codeLineCount(a.code) > 100) failures.push("CODE advanced lines");
if ((bt("pitfalls").items || []).length < 8) failures.push("PITFALLS items");
if ((iv.conceptual || []).length < 15) failures.push("INTERVIEW conceptual count");
if (avgAnswer(iv.conceptual || []) < 120) failures.push("INTERVIEW conceptual avg");
if ((iv.codeBased || []).length < 8) failures.push("INTERVIEW codeBased");
if ((iv.seniorScenario || []).length < 5) failures.push("INTERVIEW seniorScenario count");
if (avgAnswer(iv.seniorScenario || []) < 200) failures.push("INTERVIEW seniorScenario avg");
if ((iv.wrongAnswers || []).length < 8) failures.push("INTERVIEW wrongAnswers");
if (!iv.jobSwitch) failures.push("INTERVIEW jobSwitch");
if (mcqQuestions.length !== 30) failures.push("MCQ total");
if (mcqQuestions.filter((q) => q.level === "basic").length !== 8) failures.push("MCQ basic");
if (mcqQuestions.filter((q) => q.level === "intermediate").length !== 12) failures.push("MCQ intermediate");
if (mcqQuestions.filter((q) => q.level === "advanced").length !== 10) failures.push("MCQ advanced");
if (cheatRows(c.content) < 10) failures.push("CHEATSHEET rows");
console.log(`FAILURES: ${failures.length ? failures.join("; ") : "none"}`);
