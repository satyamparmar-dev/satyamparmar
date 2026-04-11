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

const why = "This day covers Spring Boot Internals in the Spring ecosystem. Teams ship faster when the framework is understood as a set of contracts: defaults help until they do not, and production rewards engineers who can explain how requests, transactions, or tokens move through the stack. Interviews probe whether you can move beyond annotations to failure modes and verification.\n\nConfiguration and auto-configuration reduce boilerplate but hide assumptions. When those assumptions clash with your environment, you need a mental model of conditions, profiles, and bean ordering rather than random property toggles from search results.\n\nCross-cutting concerns such as security, persistence, and observability intersect here. Strong answers connect framework features to metrics you would watch, tests you would write, and rollbacks you would plan.\n\nOperational maturity means you can read stack traces involving proxies, filters, and repository machinery without freezing. You should be able to bisect whether a defect is application logic, framework misuse, or infrastructure.\n\nLibraries evolve; Spring Boot major versions move configuration keys and security DSLs. Senior engineers budget time for upgrades and validate critical paths with focused integration tests instead of hoping compilation success equals correctness.\n\nOn call, incidents in this area often look like elevated 500s, auth loops, or database storms. Your story should include narrowing blast radius, capturing logs, reproducing in a test, and shipping a backward-compatible fix with clear monitoring.";

const pitfalls = ["**Misconfigured defaults** — prod symptom; detect with tests; fix explicit config.","**Wrong proxy assumptions** — subtle bugs; detect logs; fix injection/self-call.","**Missing integration tests** — regressions; detect CI; add @SpringBootTest slice.","**Security too open** — exposure; detect scan; fix matchers.","**N+1 or blocking** — latency; detect metrics; fix fetch/schedulers.","**Profile drift** — config skew; detect env audit; align properties.","**Upgrade breaking change** — failures; detect release notes; pin/adapt.","**Operational blind spots** — on-call pain; detect actuator; add health."];

const exercise = {
  title: "Practice exercise",
  difficulty: "Advanced",
  problem: "**Day 42**\n\n1. Print **auto_config=conditional_on_class**.\n2. Print **starter=opinionated_deps**.\n3. Print **main=SpringApplication.run**.\n4. **arch.day42** **Day42Exercise**.",
  hints: [
    "Keep output deterministic and minimal.",
    "Tie logic to the assignment coding prompt for this day.",
    "Package arch.day42, class Day42Exercise.",
  ],
  solution: String.raw`package arch.day42;

public class Day42Exercise {

    public static void main(String[] args) {
        System.out.println("auto_config=conditional_on_class");
        System.out.println("starter=opinionated_deps");
        System.out.println("main=SpringApplication.run");
    }
}
`,
};

const cheatsheetRows = [["SpringApplication","bootstrap","run"],["@SpringBootApplication","meta","3-in-1"],["@EnableAutoConfiguration","auto beans","on"],["@ConditionalOnClass","classpath","gate"],["@ConditionalOnProperty","config","gate"],["spring.factories","legacy","imports now"],["Starter","BOM deps","convenience"],["Fat jar","nested libs","launcher"],["devtools","restart","local"],["exclude","auto skip","property"],["FailureAnalyzer","error help","Boot"],["Banner","startup","cosmetic"],["LoggingSystem","logback","bridge"],["ApplicationRunner","startup hook","ordered"],["CommandLineRunner","args","startup"]];

export default {
  title: "Spring Boot Internals",
  tags: ["Mid-Level", "Advanced", "Phase 5", "Interview Prep", "Spring", "Satyverse(Satyam Parmar)"],
  prerequisites: ["Day 41", "Day 40"],
  learningObjectives: [
    "Explain Spring Boot Internals with production-oriented clarity",
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
  mcqLabel: "Spring Boot Internals",
  mcqDescription: "Thirty questions on auto-configuration, starters, and application bootstrap.",
  mcqQuestions,
  cheatsheetRows,
};
