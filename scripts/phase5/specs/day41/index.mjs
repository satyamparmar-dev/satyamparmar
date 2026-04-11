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

const why = "This day covers Spring MVC & REST in the Spring ecosystem. Teams ship faster when the framework is understood as a set of contracts: defaults help until they do not, and production rewards engineers who can explain how requests, transactions, or tokens move through the stack. Interviews probe whether you can move beyond annotations to failure modes and verification.\n\nConfiguration and auto-configuration reduce boilerplate but hide assumptions. When those assumptions clash with your environment, you need a mental model of conditions, profiles, and bean ordering rather than random property toggles from search results.\n\nCross-cutting concerns such as security, persistence, and observability intersect here. Strong answers connect framework features to metrics you would watch, tests you would write, and rollbacks you would plan.\n\nOperational maturity means you can read stack traces involving proxies, filters, and repository machinery without freezing. You should be able to bisect whether a defect is application logic, framework misuse, or infrastructure.\n\nLibraries evolve; Spring Boot major versions move configuration keys and security DSLs. Senior engineers budget time for upgrades and validate critical paths with focused integration tests instead of hoping compilation success equals correctness.\n\nOn call, incidents in this area often look like elevated 500s, auth loops, or database storms. Your story should include narrowing blast radius, capturing logs, reproducing in a test, and shipping a backward-compatible fix with clear monitoring.";

const pitfalls = ["**Misconfigured defaults** — prod symptom; detect with tests; fix explicit config.","**Wrong proxy assumptions** — subtle bugs; detect logs; fix injection/self-call.","**Missing integration tests** — regressions; detect CI; add @SpringBootTest slice.","**Security too open** — exposure; detect scan; fix matchers.","**N+1 or blocking** — latency; detect metrics; fix fetch/schedulers.","**Profile drift** — config skew; detect env audit; align properties.","**Upgrade breaking change** — failures; detect release notes; pin/adapt.","**Operational blind spots** — on-call pain; detect actuator; add health."];

const exercise = {
  title: "Practice exercise",
  difficulty: "Advanced",
  problem: "**Day 41 — Spring MVC & REST (assignment alignment)**\n\n1. Simulate a **REST decision table**: path **/api/users** method **GET** prints **handler=UserController.list**.\n2. Invalid method prints **405**.\n3. Missing auth header prints **401**.\n4. **arch.day41**, **Day41Exercise**.",
  hints: [
    "Keep output deterministic and minimal.",
    "Tie logic to the assignment coding prompt for this day.",
    "Package arch.day41, class Day41Exercise.",
  ],
  solution: String.raw`package arch.day41;

public class Day41Exercise {

    static String dispatch(String path, String method, String auth) {
        if (auth == null || auth.isEmpty()) return "401";
        if (!"/api/users".equals(path)) return "404";
        if (!"GET".equals(method)) return "405";
        return "handler=UserController.list";
    }

    public static void main(String[] args) {
        System.out.println(dispatch("/api/users", "GET", "Bearer x"));
        System.out.println(dispatch("/api/users", "POST", "Bearer x"));
        System.out.println(dispatch("/api/users", "GET", ""));
    }
}
`,
};

const cheatsheetRows = [["DispatcherServlet","front controller","entry"],["@RestController","@Controller+@ResponseBody","JSON"],["@PathVariable","URI segment","bind"],["@RequestParam","query","bind"],["@Valid","JSR-380","validate"],["BindingResult","errors","form"],["@ControllerAdvice","global @ExceptionHandler","errors"],["ResponseEntity","status+body","explicit"],["HttpMessageConverter","serialize","Jackson"],["HandlerInterceptor","pre/post","MVC"],["CORS","Cross-Origin","browser"],["404 vs 405","not found/method","semantics"],["Content-Type","negotiation","headers"],["Flash attributes","redirect","PRG"],["HiddenHttpMethodFilter","method override","legacy"]];

export default {
  title: "Spring MVC & REST",
  tags: ["Mid-Level", "Advanced", "Phase 5", "Interview Prep", "Spring", "Satyverse(Satyam Parmar)"],
  prerequisites: ["Day 40", "Day 39"],
  learningObjectives: [
    "Explain Spring MVC & REST with production-oriented clarity",
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
  mcqLabel: "Spring MVC & REST",
  mcqDescription: "Thirty questions on controllers, validation, HTTP, and error handling.",
  mcqQuestions,
  cheatsheetRows,
};
