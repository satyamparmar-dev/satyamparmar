import { theoryTitle, theoryBase } from "./theory.mjs";
import {
  basicCode,
  basicOutput,
  intermediateCode,
  intermediateOutput,
  advancedCode,
  advancedOutput,
} from "./codes.mjs";
import diagram from "./diagram.mjs";
import mcqQuestions from "./mcq.mjs";
import interview from "./interview.mjs";

const why = "This day covers Spring AOP in the Spring ecosystem. Teams ship faster when the framework is understood as a set of contracts: defaults help until they do not, and production rewards engineers who can explain how requests, transactions, or tokens move through the stack. Interviews probe whether you can move beyond annotations to failure modes and verification.\n\nConfiguration and auto-configuration reduce boilerplate but hide assumptions. When those assumptions clash with your environment, you need a mental model of conditions, profiles, and bean ordering rather than random property toggles from search results.\n\nCross-cutting concerns such as security, persistence, and observability intersect here. Strong answers connect framework features to metrics you would watch, tests you would write, and rollbacks you would plan.\n\nOperational maturity means you can read stack traces involving proxies, filters, and repository machinery without freezing. You should be able to bisect whether a defect is application logic, framework misuse, or infrastructure.\n\nLibraries evolve; Spring Boot major versions move configuration keys and security DSLs. Senior engineers budget time for upgrades and validate critical paths with focused integration tests instead of hoping compilation success equals correctness.\n\nOn call, incidents in this area often look like elevated 500s, auth loops, or database storms. Your story should include narrowing blast radius, capturing logs, reproducing in a test, and shipping a backward-compatible fix with clear monitoring.";

const pitfalls = ["**Misconfigured defaults** — prod symptom; detect with tests; fix explicit config.","**Wrong proxy assumptions** — subtle bugs; detect logs; fix injection/self-call.","**Missing integration tests** — regressions; detect CI; add @SpringBootTest slice.","**Security too open** — exposure; detect scan; fix matchers.","**N+1 or blocking** — latency; detect metrics; fix fetch/schedulers.","**Profile drift** — config skew; detect env audit; align properties.","**Upgrade breaking change** — failures; detect release notes; pin/adapt.","**Operational blind spots** — on-call pain; detect actuator; add health."];

const exercise = {
  title: "Practice exercise",
  difficulty: "Advanced",
  problem: "**Day 40 — Spring AOP (assignment alignment)**\n\n1. Simulate **@Around** by wrapping a **Runnable task** with **start/end timestamps** (use **System.nanoTime()**).\n2. Print **elapsed_ms=** followed by integer milliseconds (divide nanos by 1_000_000).\n3. Task body prints **done** once.\n4. Use **arch.day40** and **Day40Exercise**.",
  hints: [
    "Keep output deterministic and minimal.",
    "Tie logic to the assignment coding prompt for this day.",
    "Package arch.day40, class Day40Exercise.",
  ],
  solution: String.raw`package arch.day40;

public class Day40Exercise {

    public static void main(String[] args) {
        Runnable task = () -> System.out.println("done");
        long t0 = System.nanoTime();
        task.run();
        long t1 = System.nanoTime();
        System.out.println("elapsed_ms=" + (t1 - t0) / 1_000_000);
    }
}
`,
};

const cheatsheetRows = [["Around","proceed()","must call"],["Pointcut","expression","matches"],["Advice","cross-cut","aspect"],["Proxy","JDK/CGLIB","interface"],["@Order","chain","sequence"],["Join point","method exec","hook"],["Introduction","mixin","rare"],["Within","type scope","types"],["execution","method pattern","fine"],["@annotation","marker","select"],["Self-invoke","no proxy","inject self"],["@Transactional","AOP","proxy"],["AspectJ","weave","compile/load"],["@EnableAspectJAutoProxy","config","Boot auto"],["Performance","keep thin","advice"]];

export default {
  title: "Spring AOP",
  tags: ["Mid-Level", "Advanced", "Phase 5", "Interview Prep", "Spring", "Satyverse(Satyam Parmar)"],
  prerequisites: ["Day 39", "Day 38"],
  learningObjectives: [
    "Explain Spring AOP with production-oriented clarity",
    "Apply core Spring configuration and testing strategies",
    "Avoid common pitfalls and security footguns",
    "Relate this topic to observability and on-call response",
    "Compare alternatives and choose trade-offs deliberately",
    "Prepare concise interview stories with verification steps",
  ],
  why,
  theoryTitle,
  theoryBase,
  basicCode,
  basicOutput,
  intermediateCode,
  intermediateOutput,
  advancedCode,
  advancedOutput,
  diagram,
  pitfalls,
  exercise,
  interview,
  mcqLabel: "Spring AOP",
  mcqDescription: "Thirty questions on advice types, pointcuts, proxies, ordering, and pitfalls.",
  mcqQuestions,
  cheatsheetRows,
};
