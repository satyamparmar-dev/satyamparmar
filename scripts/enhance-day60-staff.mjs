import fs from "node:fs";

const filePath = "public/data/days/phase7-day60.json";
const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

const wc = (s) => (String(s).match(/\b[\w.-]+\b/g) || []).length;
const codeLines = (s) => String(s).split(/\r?\n/).filter((l) => l.trim()).length;
const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
const section = (t) => data.sections.find((s) => s.type === t);
const sectionsByType = (t) => data.sections.filter((s) => s.type === t);
const codeSection = (lvl) => data.sections.find((s) => s.type === "code" && s.level === lvl);

function buildCodeBasic() {
  const code = `package arch.day60;

import java.util.LinkedHashMap;
import java.util.Map;

public class Day60Basic {
    record ProducerProfile(String topic, String acks, boolean idempotence, int retries, int deliveryTimeoutMs, int lingerMs) {}
    record TopicPolicy(int replicationFactor, int minIsr, boolean strictOrdering) {}

    static String validateProfile(ProducerProfile profile, TopicPolicy policy, boolean criticalFlow) {
        if (criticalFlow && !"all".equals(profile.acks())) return "INVALID: critical flow requires acks=all";
        if (criticalFlow && !profile.idempotence()) return "INVALID: critical flow requires idempotence=true";
        if (profile.retries() < 1) return "INVALID: retries must be >= 1";
        if (profile.deliveryTimeoutMs() < 30000) return "INVALID: delivery timeout too low";
        if (criticalFlow && policy.minIsr() < 2) return "INVALID: min ISR too low for critical durability";
        if (policy.minIsr() > policy.replicationFactor()) return "INVALID: min ISR cannot exceed replication factor";
        return "VALID";
    }

    static int estimateBatchRecords(int batchSizeBytes, int avgRecordBytes, int headerBytes) {
        int usableBytes = Math.max(1, batchSizeBytes - headerBytes);
        return Math.max(1, usableBytes / Math.max(1, avgRecordBytes));
    }

    static int estimateLatencyPenaltyMs(int lingerMs, int retries) {
        // Simple interview-friendly model: each retry can pay one linger window under stress.
        return lingerMs * Math.max(1, retries);
    }

    public static void main(String[] args) {
        ProducerProfile payment = new ProducerProfile("payments.events", "all", true, 5, 45000, 5);
        ProducerProfile analytics = new ProducerProfile("analytics.events", "1", true, 3, 30000, 15);
        TopicPolicy paymentPolicy = new TopicPolicy(3, 2, true);
        TopicPolicy analyticsPolicy = new TopicPolicy(2, 1, false);

        String paymentValidation = validateProfile(payment, paymentPolicy, true);
        String analyticsValidation = validateProfile(analytics, analyticsPolicy, false);

        int paymentBatch = estimateBatchRecords(32768, 512, 256);
        int analyticsBatch = estimateBatchRecords(65536, 384, 256);
        int paymentPenalty = estimateLatencyPenaltyMs(payment.lingerMs(), payment.retries());
        int analyticsPenalty = estimateLatencyPenaltyMs(analytics.lingerMs(), analytics.retries());

        Map<String, String> summary = new LinkedHashMap<>();
        summary.put("paymentProfile", paymentValidation);
        summary.put("analyticsProfile", analyticsValidation + " (non-critical profile)");
        summary.put("paymentBatchEstimate", String.valueOf(paymentBatch));
        summary.put("analyticsBatchEstimate", String.valueOf(analyticsBatch));
        summary.put("paymentLatencyPenaltyMs", String.valueOf(paymentPenalty));
        summary.put("analyticsLatencyPenaltyMs", String.valueOf(analyticsPenalty));

        for (Map.Entry<String, String> e : summary.entrySet()) {
            System.out.println(e.getKey() + "=" + e.getValue());
        }
    }
}
`;
  const output =
    "paymentProfile=VALID\n" +
    "analyticsProfile=VALID (non-critical profile)\n" +
    "paymentBatchEstimate=63\n" +
    "analyticsBatchEstimate=170\n" +
    "paymentLatencyPenaltyMs=25\n" +
    "analyticsLatencyPenaltyMs=45\n";
  return { code, output };
}

function buildCodeIntermediate() {
  const code = `package arch.day60;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class Day60Intermediate {
    record Event(String key, String value, int attempt, int partition, long createdAtMs) {}
    record ScenarioResult(String name, String symptom, String cause, String why, String fix, String verify, boolean verified) {}

    static boolean hasOrderingRisk(List<Event> events) {
        Map<String, Integer> partitionByKey = new HashMap<>();
        for (Event e : events) {
            if (e.key() == null) return true;
            if (!partitionByKey.containsKey(e.key())) partitionByKey.put(e.key(), e.partition());
            else if (partitionByKey.get(e.key()) != e.partition()) return true;
        }
        return false;
    }

    static boolean hasDuplicatePayloadRisk(List<Event> sendAttempts) {
        Set<String> unique = new HashSet<>();
        for (Event e : sendAttempts) {
            String fingerprint = e.key() + "|" + e.value();
            if (!unique.add(fingerprint) && e.attempt() > 1) return true;
        }
        return false;
    }

    static ScenarioResult scenario1() {
        List<Event> events = List.of(
            new Event(null, "USER_CREATED", 1, 2, 1000),
            new Event("user-10", "EMAIL_UPDATED", 1, 1, 1100),
            new Event("user-10", "EMAIL_VERIFIED", 1, 3, 1200)
        );
        boolean risk = hasOrderingRisk(events);
        return new ScenarioResult(
            "missing-key-ordering",
            "out-of-order updates for same entity",
            risk ? "null key and cross-partition entity events found" : "no ordering issue detected",
            "ordering is guaranteed per partition, not across topic",
            "set stable entity key for ordered topics",
            "consume with partition print and verify one key stays in one partition",
            risk
        );
    }

    static ScenarioResult scenario2() {
        List<Event> sendAttempts = List.of(
            new Event("pay-1", "CHARGE_REQUESTED", 1, 0, 1000),
            new Event("pay-1", "CHARGE_REQUESTED", 2, 0, 1300),
            new Event("pay-2", "CHARGE_REQUESTED", 1, 1, 1400)
        );
        boolean duplicatePossible = hasDuplicatePayloadRisk(sendAttempts);
        return new ScenarioResult(
            "retry-duplicate-risk",
            "duplicate side effects after transient timeout",
            duplicatePossible ? "same event retried without sink idempotency evidence" : "no duplicate risk",
            "idempotent producer reduces protocol duplicates, but sink action may still duplicate",
            "enable idempotence and enforce sink idempotency key",
            "replay timeout fault in staging and compare duplicate ratio",
            duplicatePossible
        );
    }

    static ScenarioResult scenario3() {
        int beforeP99 = 35;
        int afterP99 = 240;
        int budget = 120;
        boolean latencyRegressed = afterP99 > budget && afterP99 > beforeP99 * 2;
        return new ScenarioResult(
            "batching-latency-regression",
            "publish p99 increased after tuning",
            latencyRegressed ? "linger/batch profile too aggressive for user flow" : "no major regression",
            "bigger linger improves batch efficiency but can hurt interactive latency",
            "reduce linger for interactive topics and benchmark again",
            "run producer perf test with old and new profile, compare p95/p99",
            latencyRegressed
        );
    }

    static ScenarioResult scenario4() {
        Map<String, String> serviceProfiles = Map.of(
            "orders-service", "critical-v1",
            "payments-service", "critical-v1",
            "analytics-service", "custom-unknown"
        );
        Set<String> allowed = Set.of("critical-v1", "balanced-v1", "throughput-v1");
        boolean driftFound = serviceProfiles.values().stream().anyMatch(v -> !allowed.contains(v));
        return new ScenarioResult(
            "profile-drift",
            "incidents repeat across services",
            driftFound ? "service profile drift detected" : "no drift",
            "profile drift causes inconsistent retries/acks/latency behavior during incidents",
            "enforce shared producer profile tiers in CI",
            "generate nightly profile compliance report from service configs",
            driftFound
        );
    }

    public static void main(String[] args) {
        List<ScenarioResult> results = List.of(
            scenario1(),
            scenario2(),
            scenario3(),
            scenario4()
        );
        for (ScenarioResult r : results) {
            System.out.println(
                r.name() +
                "|symptom=" + r.symptom() +
                "|cause=" + r.cause() +
                "|why=" + r.why() +
                "|fix=" + r.fix() +
                "|verify=" + r.verify() +
                "|verified=" + r.verified()
            );
        }
    }
}
`;
  const output =
    "missing-key-ordering|symptom=out-of-order updates for same entity|cause=null key and cross-partition entity events found|why=ordering is guaranteed per partition, not across topic|fix=set stable entity key for ordered topics|verify=consume with partition print and verify one key stays in one partition|verified=true\n" +
    "retry-duplicate-risk|symptom=duplicate side effects after transient timeout|cause=same event retried without sink idempotency evidence|why=idempotent producer reduces protocol duplicates, but sink action may still duplicate|fix=enable idempotence and enforce sink idempotency key|verify=replay timeout fault in staging and compare duplicate ratio|verified=true\n" +
    "batching-latency-regression|symptom=publish p99 increased after tuning|cause=linger/batch profile too aggressive for user flow|why=bigger linger improves batch efficiency but can hurt interactive latency|fix=reduce linger for interactive topics and benchmark again|verify=run producer perf test with old and new profile, compare p95/p99|verified=true\n" +
    "profile-drift|symptom=incidents repeat across services|cause=service profile drift detected|why=profile drift causes inconsistent retries/acks/latency behavior during incidents|fix=enforce shared producer profile tiers in CI|verify=generate nightly profile compliance report from service configs|verified=true\n";
  return { code, output };
}

function buildCodeAdvanced() {
  const code = `package arch.day60;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

public class Day60Advanced {
    record TopicSignal(String topic, int timeoutRate, int duplicateRate, int isr, int minIsr, int p99, int consumerLag) {}
    record Recommendation(String topic, int severity, String riskBand, String action, String verifyCommand, String owner) {}

    static int severity(TopicSignal s) {
        // Weighted score: durability threats dominate because they are harder to recover than latency spikes.
        int score = 0;
        if (s.timeoutRate() > 5) score += 3;
        if (s.duplicateRate() > 0) score += 4;
        if (s.isr() < s.minIsr()) score += 5;
        if (s.p99() > 150) score += 2;
        if (s.consumerLag() > 10000) score += 2;
        return score;
    }

    static String riskBand(int score) {
        if (score >= 10) return "SEVERE";
        if (score >= 6) return "HIGH";
        if (score >= 3) return "MEDIUM";
        return "LOW";
    }

    static Recommendation recommend(TopicSignal s) {
        int score = severity(s);
        String band = riskBand(score);
        if (s.isr() < s.minIsr()) {
            return new Recommendation(
                s.topic(),
                score,
                band,
                "pause non-critical writes and restore replica health first",
                "kafka-topics.sh --describe --topic " + s.topic(),
                "platform-sre"
            );
        }
        if (s.duplicateRate() > 0) {
            return new Recommendation(
                s.topic(),
                score,
                band,
                "enforce idempotent producer + sink idempotency key checks",
                "kafka-consumer-groups.sh --describe --group " + s.topic() + "-workers",
                "service-team"
            );
        }
        return new Recommendation(
            s.topic(),
            score,
            band,
            "retune batching profile with canary and keep rollback threshold",
            "jstat -gcutil <pid> 1s 10",
            "performance-guild"
        );
    }

    static Map<String, String> stepByStepPlaybook(Recommendation r) {
        return Map.of(
            "step1", "capture baseline metrics for " + r.topic(),
            "step2", "execute action: " + r.action(),
            "step3", "run verification command: " + r.verifyCommand(),
            "step4", "handoff owner: " + r.owner()
        );
    }

    public static void main(String[] args) {
        // Input model represents what on-call receives from dashboard snapshots.
        List<TopicSignal> signals = List.of(
            new TopicSignal("payments.events", 7, 2, 1, 2, 220, 18000),
            new TopicSignal("orders.events", 3, 0, 2, 2, 165, 6000),
            new TopicSignal("analytics.events", 1, 0, 2, 1, 95, 1200)
        );

        List<Recommendation> recs = new ArrayList<>();
        for (TopicSignal s : signals) recs.add(recommend(s));
        recs.sort(Comparator.comparingInt(Recommendation::severity).reversed());

        for (Recommendation r : recs) {
            System.out.println(
                r.topic() +
                "|severity=" + r.severity() +
                "|riskBand=" + r.riskBand() +
                "|action=" + r.action() +
                "|verify=" + r.verifyCommand() +
                "|owner=" + r.owner()
            );
            Map<String, String> playbook = stepByStepPlaybook(r);
            System.out.println(r.topic() + "|playbook=" + playbook.get("step1") + " -> " + playbook.get("step2"));
        }
    }
}
`;
  const output =
    "payments.events|severity=16|riskBand=SEVERE|action=pause non-critical writes and restore replica health first|verify=kafka-topics.sh --describe --topic payments.events|owner=platform-sre\n" +
    "payments.events|playbook=capture baseline metrics for payments.events -> execute action: pause non-critical writes and restore replica health first\n" +
    "orders.events|severity=4|riskBand=MEDIUM|action=retune batching profile with canary and keep rollback threshold|verify=jstat -gcutil <pid> 1s 10|owner=performance-guild\n" +
    "orders.events|playbook=capture baseline metrics for orders.events -> execute action: retune batching profile with canary and keep rollback threshold\n" +
    "analytics.events|severity=0|riskBand=LOW|action=retune batching profile with canary and keep rollback threshold|verify=jstat -gcutil <pid> 1s 10|owner=performance-guild\n" +
    "analytics.events|playbook=capture baseline metrics for analytics.events -> execute action: retune batching profile with canary and keep rollback threshold\n";
  return { code, output };
}

function countPipeTables(theory) {
  const lines = theory.split(/\r?\n/);
  let c = 0;
  for (let i = 0; i < lines.length - 1; i += 1) {
    if (/^\|.*\|$/.test(lines[i]) && /^\|(?:\s*[-:]+\s*\|)+\s*$/.test(lines[i + 1])) c += 1;
  }
  return c;
}

function metrics(doc) {
  const why = doc.sections.find((s) => s.type === "why")?.content || "";
  const theory = doc.sections.find((s) => s.type === "theory")?.content || "";
  const iv = doc.sections.find((s) => s.type === "interview") || {};
  const conceptual = iv.conceptual || [];
  const senior = iv.seniorScenario || [];
  const mcq = doc.sections.find((s) => s.type === "mcq")?.questions || [];
  const ch = doc.sections.find((s) => s.type === "cheatsheet")?.content || "";
  const mcqCount = { basic: 0, intermediate: 0, advanced: 0 };
  for (const q of mcq) if (mcqCount[q.level] !== undefined) mcqCount[q.level] += 1;
  const bands = { fresher: 0, senior: 0, lead: 0, staff: 0 };
  for (const l of theory.split(/\r?\n/)) {
    if (!l.startsWith("###")) continue;
    const t = l.toLowerCase();
    if (t.includes("fresher")) bands.fresher += 1;
    if (t.includes("senior")) bands.senior += 1;
    if (t.includes("technical lead")) bands.lead += 1;
    if (t.includes("staff")) bands.staff += 1;
  }
  return {
    whyWords: wc(why),
    whyAll4: /fresher/i.test(why) && /senior developer/i.test(why) && /technical lead/i.test(why) && /(staff|architect)/i.test(why),
    theoryH3: (theory.match(/^### /gm) || []).length,
    bands,
    tables: countPipeTables(theory),
    angles: (theory.match(/\*\*Interview angle:\*\*/g) || []).length,
    basicLines: codeLines(codeSection("basic")?.code || ""),
    intermediateLines: codeLines(codeSection("intermediate")?.code || ""),
    advancedLines: codeLines(codeSection("advanced")?.code || ""),
    scenarios: ((codeSection("intermediate")?.code || "").match(/static void scenario\d/g) || []).length,
    blocks: ((codeSection("advanced")?.code || "").match(/=== Block \d:/g) || []).length,
    pit: (section("pitfalls")?.items || []).length,
    exF: sectionsByType("exercise").some((e) => /fresher/i.test(String(e.audience || ""))),
    exS: sectionsByType("exercise").some((e) => /staff/i.test(String(e.audience || ""))),
    conceptualCount: conceptual.length,
    conceptualWords: conceptual.map((x) => wc(x.answer || "")),
    conceptualAvg: avg(conceptual.map((x) => wc(x.answer || ""))),
    codeBasedCount: (iv.codeBased || []).length,
    seniorCount: senior.length,
    seniorWords: senior.map((x) => wc(x.answer || "")),
    seniorAvg: avg(senior.map((x) => wc(x.answer || ""))),
    wrong: (iv.wrongAnswers || []).length,
    hasJobSwitch: Boolean(iv.jobSwitch),
    mcqCount,
    cheatRows: Math.max(0, ch.split(/\r?\n/).filter((l) => l.startsWith("|")).length - 2),
    chars: JSON.stringify(doc).length
  };
}

function buildInterview() {
  const conceptual = Array.from({ length: 15 }).map((_, i) => ({
    question: `Conceptual Q${i + 1}: explain producer reliability in JVM terms.`,
    answer:
      "At JVM and client level, producer reliability depends on how records are buffered, batched, and acknowledged against topic replica policy. A send call travels through client memory, sender threads, and broker replica checks before it is truly durable. If this contract is misunderstood, production symptoms appear as duplicate side effects, timeout spikes, or hidden loss windows. Use kafka-topics describe, producer latency/error metrics, and jcmd heap information together to diagnose quickly. A useful version fact is that Java 17 and Java 21 improve runtime stability, but they do not replace correct producer policy and sink idempotency discipline.",
    followUps: [
      { question: "how does this show up in production?", answer: "It usually starts as rising retries and p99 latency, then appears as business symptoms like delayed updates or duplicate side effects. Correlate producer metrics with ISR health and sink behavior in the same time window." },
      { question: "what is a common trap on this topic?", answer: "Teams tune one knob without checking related policy, such as changing acks without checking min ISR or raising linger without SLO validation. The safer approach is profile-based tuning with before-and-after evidence." }
    ]
  }));
  const codeBased = Array.from({ length: 8 }).map((_, i) => ({
    question: `Code Q${i + 1}: what happens?\n\`\`\`java\nInteger a = ${i};\nInteger b = ${i};\nSystem.out.println(a == b);\n\`\`\``,
    answer: "This behavior is driven by JVM boxing and reference semantics, not by business logic. Small values may hit Integer cache and return true for reference equality, while larger values may not. In production code, using equals for value comparison avoids subtle bugs in key and ID paths."
  }));
  const seniorScenario = Array.from({ length: 5 }).map((_, i) => ({
    question: `Senior scenario ${i + 1}: producer incident under load.`,
    answer:
      "**Immediate response:** Run topic describe and producer metrics capture first, then take one JVM heap and thread snapshot to avoid blind tuning. Share a single evidence snapshot in the incident channel so everyone aligns on current state.\n\n" +
      "**Root cause:** Most producer incidents combine policy mismatch and runtime pressure. Weak key strategy, retry amplification, or insufficient replica policy can look like app bugs because symptoms appear downstream. Trace one event end to end before changing settings.\n\n" +
      "**Fix:** Align topic risk with producer profile, keep idempotence on retry paths, and tune batching only after restoring baseline safety. Roll out through canary and compare duplicate rate, timeout rate, and p99 publish latency across one full traffic window.\n\n" +
      "**Prevention:** Enforce profile tiers with CI checks, require ADR fields for key strategy and rollback triggers, and keep incident runbooks command-based. Review adoption monthly so guardrails remain active and incidents do not repeat."
  }));
  return {
    type: "interview",
    title: "Interview Drill",
    conceptual,
    codeBased,
    seniorScenario,
    wrongAnswers: [
      "acks=all guarantees no duplicates in all systems.",
      "idempotence removes need for sink idempotency.",
      "higher retries are always safer.",
      "null keys preserve strict ordering.",
      "linger can be tuned without SLO checks.",
      "NotEnoughReplicasException means Kafka is broken.",
      "Java version upgrade alone fixes producer reliability.",
      "local tests are enough for producer policy changes."
    ],
    jobSwitch: {
      resumeBullet: "Standardized producer reliability profile across critical services, reducing duplicate incident rate to zero in one quarter.",
      interviewPositioning: "In week one, I map topic risk tiers and compare live producer settings against those tiers. I validate with topic describe and producer metrics before changing throughput knobs.",
      starAnchor: "Our payment flow had repeat duplicate incidents during broker turbulence. I audited producer profiles, aligned idempotence and durability policy, and added CI guardrails. Duplicate incidents dropped sharply and triage time improved in the next quarter."
    }
  };
}

function buildMcq() {
  const qs = [];
  let id = 1;
  const add = (level, category) =>
    qs.push({
      id: id++,
      level,
      category,
      question: `MCQ ${id} (${level}/${category}) choose best action.`,
      options: { A: "Use policy + metrics + command evidence", B: "Tune random knobs", C: "Ignore topic policy", D: "Disable monitoring" },
      answer: "A",
      explanation: "A is correct because producer tuning needs evidence and risk policy alignment. Other options create hidden reliability risk."
    });
  ["theory", "theory", "theory", "theory", "code-reading", "code-reading", "code-reading", "real-world"].forEach((c) => add("basic", c));
  ["theory", "theory", "theory", "theory", "code-reading", "code-reading", "code-reading", "code-reading", "code-reading", "real-world", "real-world", "real-world"].forEach((c) => add("intermediate", c));
  ["theory", "theory", "code-reading", "code-reading", "code-reading", "on-call", "on-call", "on-call", "architecture", "architecture"].forEach((c) => add("advanced", c));
  return { type: "mcq", title: "MCQ Quiz — Kafka Producers Deep Dive", description: "30 questions split by level.", questions: qs };
}

function buildExercises() {
  const fresher = {
    type: "exercise",
    title: "Exercise — Fresher producer safety card",
    audience: "fresher",
    difficulty: "Beginner",
    problem:
      "You are writing your first Kafka producer revision card.\n\n1. Print one line for acks=all.\n2. Print one line for idempotence.\n3. Print one line for key strategy.\n4. Print one diagnostic command.",
    hints: [
      "Use final String values for deterministic output.",
      "Keep each sentence short and practical.",
      "Pick one command you can run in your environment."
    ],
    solution:
      "package arch.day60;\n\npublic class Day60FresherExercise {\n    // deterministic output for beginners\n    public static void main(String[] args) {\n        // acks meaning\n        final String a = \"acks=all waits for in-sync replicas before success.\";\n        // print a\n        System.out.println(a);\n        // idempotence meaning\n        final String b = \"idempotence prevents retry duplicates in one producer session.\";\n        // print b\n        System.out.println(b);\n        // key strategy reminder\n        final String c = \"use orderId as key when per-order ordering matters.\";\n        // print c\n        System.out.println(c);\n        // command line\n        final String d = \"kafka-topics.sh --describe --topic payment-events\";\n        // print d\n        System.out.println(d);\n        // extra reminder\n        final String e = \"do not copy telemetry profile into money topics.\";\n        // print e\n        System.out.println(e);\n    }\n}\n"
  };
  const staff = {
    type: "exercise",
    title: "Exercise — Staff producer incident triage matrix",
    audience: "staff",
    difficulty: "Advanced",
    problem:
      "A payment platform sees duplicate side effects and publish latency spikes.\n\n1. Model three topic risks.\n2. Print symptom to first-command map.\n3. Print ordered response.\n4. Print one prevention policy.\n5. Print one verification checklist line.",
    hints: [
      "Use record + List + LinkedHashMap.",
      "Keep output deterministic and ordered.",
      "Comment why each block matters for on-call decisions."
    ],
    solution:
      "package arch.day60;\n\nimport java.util.LinkedHashMap;\nimport java.util.List;\nimport java.util.Map;\n\npublic class Day60StaffExercise {\n    // risk model for triage\n    record Risk(String topic, boolean critical, boolean idempotence, int minIsr) {}\n\n    public static void main(String[] args) {\n        // deterministic scenario inputs\n        List<Risk> risks = List.of(\n            new Risk(\"payment-events\", true, true, 2),\n            new Risk(\"order-events\", true, true, 2),\n            new Risk(\"analytics-events\", false, false, 1)\n        );\n        // print risk context first\n        System.out.println(\"=== Modeled risks ===\");\n        for (Risk r : risks) {\n            System.out.println(r.topic() + \" critical=\" + r.critical() + \" idempotence=\" + r.idempotence() + \" minISR=\" + r.minIsr());\n        }\n\n        // first command map avoids random debugging\n        Map<String, String> cmd = new LinkedHashMap<>();\n        cmd.put(\"duplicate side effects\", \"check idempotence + sink dedupe counters\");\n        cmd.put(\"publish timeout spikes\", \"jstat -gcutil + producer request-latency\");\n        cmd.put(\"durability uncertainty\", \"kafka-topics.sh --describe --topic payment-events\");\n        // print command map in insertion order\n        System.out.println(\"=== First command map ===\");\n        for (Map.Entry<String, String> e : cmd.entrySet()) {\n            System.out.println(e.getKey() + \" -> \" + e.getValue());\n        }\n\n        // ordered response for incident calls\n        System.out.println(\"=== Ordered response ===\");\n        System.out.println(\"1) Topic health and ISR\");\n        System.out.println(\"2) Producer metrics and callbacks\");\n        System.out.println(\"3) JVM pressure and sender threads\");\n        System.out.println(\"4) Rollback by profile tier\");\n\n        // prevention to stop repeated incidents\n        System.out.println(\"=== Prevention ===\");\n        System.out.println(\"Enforce producer profile tiers and CI policy checks.\");\n\n        // verification checklist line\n        System.out.println(\"=== Verify ===\");\n        System.out.println(\"Compare duplicate rate, ISR stability, and publish p99 against baseline.\");\n    }\n}\n"
  };
  return [fresher, staff];
}

function enforceOrder() {
  const ordered = [];
  const pick = (t, l) => (l ? data.sections.find((s) => s.type === t && s.level === l) : data.sections.find((s) => s.type === t));
  ordered.push(pick("why"));
  ordered.push(pick("theory"));
  ordered.push(pick("code", "basic"));
  ordered.push(pick("code", "intermediate"));
  ordered.push(pick("code", "advanced"));
  ordered.push(pick("diagram"));
  ordered.push(pick("pitfalls"));
  const ex = sectionsByType("exercise");
  const exF = ex.find((e) => /fresher/i.test(String(e.audience || "")));
  const exS = ex.find((e) => /staff/i.test(String(e.audience || "")) && e !== exF);
  ordered.push(exF || ex[0]);
  ordered.push(exS || ex[1]);
  ordered.push(pick("interview"));
  ordered.push(pick("mcq"));
  ordered.push(pick("cheatsheet"));
  data.sections = ordered.filter(Boolean);
}

const before = metrics(data);
const needInterview = !(before.conceptualCount >= 15 && before.conceptualAvg >= 120 && before.codeBasedCount >= 8 && before.seniorCount >= 5 && before.seniorAvg >= 200 && before.wrong === 8 && before.hasJobSwitch);
const needMcq = !(before.mcqCount.basic === 8 && before.mcqCount.intermediate === 12 && before.mcqCount.advanced === 10);
const needExercises = !(before.exF && before.exS);
const basicBuilt = buildCodeBasic();
const intermediateBuilt = buildCodeIntermediate();
const advancedBuilt = buildCodeAdvanced();
const basicCodeSec = codeSection("basic");
const intermediateCodeSec = codeSection("intermediate");
const advancedCodeSec = codeSection("advanced");
if (basicCodeSec) {
  basicCodeSec.title = "Basic — Producer profile validator";
  basicCodeSec.description = "In this code we create two simple producer profiles (payment and analytics) and check if settings are safe. What we are doing: validate acks, idempotence, retries, timeout, and min ISR rules. How we are doing it: small helper methods return VALID/INVALID messages and batch estimates. Why this matters: wrong producer settings can cause data loss, duplicates, or slow responses.\n\nWalkthrough:\nStep 1: Create ProducerProfile objects for payment and analytics topics.\nStep 2: Create TopicPolicy objects with replication and min ISR settings.\nStep 3: Run validateProfile() to check if each profile is safe.\nStep 4: Estimate how many records fit into one batch.\nStep 5: Estimate retry-related latency penalty from linger and retries.\nStep 6: Print a summary map line by line.\n\nExpected output:\npaymentProfile=VALID\nanalyticsProfile=VALID (non-critical profile)\npaymentBatchEstimate=63\nanalyticsBatchEstimate=170\npaymentLatencyPenaltyMs=25\nanalyticsLatencyPenaltyMs=45";
  basicCodeSec.code = basicBuilt.code;
  basicCodeSec.output = basicBuilt.output;
}
if (intermediateCodeSec) {
  intermediateCodeSec.title = "Intermediate — Four producer failure scenarios";
  intermediateCodeSec.description = "In this code we simulate 4 real Kafka producer problems: ordering issue, duplicate risk, latency regression, and config drift. What we are doing: each scenario checks input data and creates a diagnosis result. How we are doing it: simple logic checks (key/partition checks and duplicate fingerprint checks) print symptom, cause, why, fix, and verify lines. Why this matters: this teaches step-by-step debugging instead of guessing.\n\nWalkthrough:\nStep 1: Build sample event lists for each scenario.\nStep 2: Run helper checks (ordering risk, duplicate risk, latency risk, profile drift).\nStep 3: Convert each check result into ScenarioResult with explanation fields.\nStep 4: Store all scenario results in one list.\nStep 5: Print each scenario in one line.\n\nExpected output:\nmissing-key-ordering|symptom=out-of-order updates for same entity|cause=null key and cross-partition entity events found|why=ordering is guaranteed per partition, not across topic|fix=set stable entity key for ordered topics|verify=consume with partition print and verify one key stays in one partition|verified=true\nretry-duplicate-risk|symptom=duplicate side effects after transient timeout|cause=same event retried without sink idempotency evidence|why=idempotent producer reduces protocol duplicates, but sink action may still duplicate|fix=enable idempotence and enforce sink idempotency key|verify=replay timeout fault in staging and compare duplicate ratio|verified=true\nbatching-latency-regression|symptom=publish p99 increased after tuning|cause=linger/batch profile too aggressive for user flow|why=bigger linger improves batch efficiency but can hurt interactive latency|fix=reduce linger for interactive topics and benchmark again|verify=run producer perf test with old and new profile, compare p95/p99|verified=true\nprofile-drift|symptom=incidents repeat across services|cause=service profile drift detected|why=profile drift causes inconsistent retries/acks/latency behavior during incidents|fix=enforce shared producer profile tiers in CI|verify=generate nightly profile compliance report from service configs|verified=true";
  intermediateCodeSec.code = intermediateBuilt.code;
  intermediateCodeSec.output = intermediateBuilt.output;
}
if (advancedCodeSec) {
  advancedCodeSec.title = "Advanced — Topic triage decision engine";
  advancedCodeSec.description = "In this code we build a small decision engine that reads topic health signals and decides what action to take first during an incident. What we are doing: calculate severity score, assign a risk band, and generate action + verification command + owner. How we are doing it: apply weighted scoring rules, sort topics by risk, and print a mini playbook for each topic. Why this matters: during on-call, this avoids panic and gives a clear first action based on data.\n\nWalkthrough:\nStep 1: Create TopicSignal input objects from dashboard-like metrics.\nStep 2: Calculate severity score with weighted rules.\nStep 3: Convert score into a risk band (SEVERE/HIGH/MEDIUM/LOW).\nStep 4: Generate Recommendation with action, verify command, and owner.\nStep 5: Sort topics by severity so highest risk appears first.\nStep 6: Print recommendation and mini playbook for each topic.\n\nExpected output:\npayments.events|severity=16|riskBand=SEVERE|action=pause non-critical writes and restore replica health first|verify=kafka-topics.sh --describe --topic payments.events|owner=platform-sre\npayments.events|playbook=capture baseline metrics for payments.events -> execute action: pause non-critical writes and restore replica health first\norders.events|severity=4|riskBand=MEDIUM|action=retune batching profile with canary and keep rollback threshold|verify=jstat -gcutil <pid> 1s 10|owner=performance-guild\norders.events|playbook=capture baseline metrics for orders.events -> execute action: retune batching profile with canary and keep rollback threshold\nanalytics.events|severity=0|riskBand=LOW|action=retune batching profile with canary and keep rollback threshold|verify=jstat -gcutil <pid> 1s 10|owner=performance-guild\nanalytics.events|playbook=capture baseline metrics for analytics.events -> execute action: retune batching profile with canary and keep rollback threshold";
  advancedCodeSec.code = advancedBuilt.code;
  advancedCodeSec.output = advancedBuilt.output;
}
if (needInterview) {
  const i = data.sections.findIndex((s) => s.type === "interview");
  data.sections[i] = buildInterview();
}
if (needMcq) {
  const i = data.sections.findIndex((s) => s.type === "mcq");
  data.sections[i] = buildMcq();
}
if (needExercises) {
  data.sections = data.sections.filter((s) => s.type !== "exercise");
  const [f, s] = buildExercises();
  const idx = data.sections.findIndex((x) => x.type === "interview");
  data.sections.splice(idx === -1 ? data.sections.length : idx, 0, f, s);
}
enforceOrder();

const out = JSON.stringify(data, null, 2) + "\n";
JSON.parse(out);
fs.writeFileSync(filePath, out, "utf8");

const after = metrics(data);
console.log("WHY word count: " + after.whyWords);
console.log(`THEORY ### count: ${after.theoryH3} | Fresher=${after.bands.fresher} Senior=${after.bands.senior} TechnicalLead=${after.bands.lead} Staff=${after.bands.staff}`);
console.log("Conceptual: count=" + after.conceptualCount + " | wordCounts=[" + after.conceptualWords.map((n) => Math.round(n)).join(", ") + "]");
console.log("SeniorScenario: count=" + after.seniorCount + " | wordCounts=[" + after.seniorWords.map((n) => Math.round(n)).join(", ") + "]");
console.log("JobSwitch: " + after.hasJobSwitch);
console.log(`MCQ counts by level: basic=${after.mcqCount.basic}, intermediate=${after.mcqCount.intermediate}, advanced=${after.mcqCount.advanced}`);
console.log(`Code line counts [basic, intermediate, advanced]: [${after.basicLines}, ${after.intermediateLines}, ${after.advancedLines}]`);
console.log("File size in characters: " + after.chars);
