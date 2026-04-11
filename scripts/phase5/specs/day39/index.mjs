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

const why = `Spring bean lifecycle is where tutorials end and production begins. A container that wires dependencies for you is convenient until two beans initialize in an order that flips between laptops and Kubernetes, or until a prototype-scoped component leaks connections because destruction never ran the way the team assumed. Interviewers who care about Spring beyond annotations want to hear that you can reason about initialization stages, not that you memorized a single blog diagram.

Advanced dependency injection is not academic. Qualifiers and primary beans exist because real applications ship multiple implementations of the same interface: feature flags, regional providers, test doubles, and migration paths. Getting the default bean wrong in one profile can route payments to a stub implementation in production. Explaining how you would detect and prevent that shows operational maturity.

Bean post processors and proxy creation are the bridge to AOP and security. If you do not know that many cross-cutting concerns wrap your bean after initialization, you will misread stack traces, misunderstand transaction boundaries on self-invocation, and misconfigure filter chains. Lifecycle knowledge turns mysterious framework magic into a checklist you can debug under pressure.

Factory beans, object providers, and scoped proxies solve real integration problems but introduce their own failure modes. Scoped proxies fail in unit tests without context. Factory beans confuse people who expect the injected type to match the declared class directly. Senior answers acknowledge trade-offs instead of treating every pattern as free.

Documentation and team conventions matter as much as framework behavior. When every bean mixes @PostConstruct, InitializingBean, and XML init methods, the next engineer cannot predict order without spelunking. Production readiness reviews should treat inconsistent lifecycle usage as technical debt with measurable risk.

On call, strange startup failures after upgrades often trace back to bean ordering, conditional configuration, or a missing depends-on edge. Your narrative should include how you bisect with logging, reproduce in a minimal @SpringBootTest, and ship a fix that preserves backward compatibility for other profiles.`;

const pitfalls = [
  "**Stacking lifecycle callbacks undocumented** — nondeterministic perception; pick one style per bean.",
  "**Prototype with @PreDestroy expectation** — resource leak; document manual close.",
  "**Missing @DependsOn for infra side effects** — flaky startup; declare explicit order.",
  "**@Primary clash across profiles** — wrong default bean; use profile-specific primaries.",
  "**Field injection in large services** — hard to test; prefer constructor.",
  "**Ignoring BPP order for security** — filters/advice wrong; use @Order explicitly.",
  "**Scoped bean without proxy in singleton** — scope errors; enable TARGET_CLASS/INTERFACE.",
  "**ApplicationContextAware everywhere** — hidden coupling; refactor to injection.",
];

const exercise = {
  title: "Practice exercise",
  difficulty: "Advanced",
  problem: `**Day 39 — Spring Bean Lifecycle & Advanced DI (assignment alignment)**

1. Model two **Notifier** implementations (**Email**, **Sms**) implementing a common interface with **void notifyUser()** printing distinct labels.
2. Simulate a **container** choice: when **primary** flag is true select **Email** implementation else **Sms** (stand in for **@Primary** + **@Qualifier(\"sms\")** override path) and call **notifyUser()**.
3. Print lifecycle lines **init_post_construct** then **destroy_pre_destroy** in **main** to show **@PostConstruct/@PreDestroy** ordering concept (plain Java methods).
4. Use **package arch.day39** and class **Day39Exercise** with **deterministic** output.`,
  hints: [
    "Use boolean primary and String qualifier \"sms\" to branch which implementation runs.",
    "Call init() and destroy() methods explicitly after construction to simulate callbacks.",
    "Keep prints one token per line for easy diff.",
  ],
  solution: String.raw`package arch.day39;

public class Day39Exercise {

    interface Notifier {
        void notifyUser();
    }

    static class Email implements Notifier {
        public void notifyUser() {
            System.out.println("email");
        }
    }

    static class Sms implements Notifier {
        public void notifyUser() {
            System.out.println("sms");
        }
    }

    static class NotifierBean {
        private final Notifier delegate;

        NotifierBean(boolean primary, String qualifier) {
            if ("sms".equals(qualifier)) {
                delegate = new Sms();
            } else if (primary) {
                delegate = new Email();
            } else {
                delegate = new Sms();
            }
        }

        void postConstruct() {
            System.out.println("init_post_construct");
        }

        void preDestroy() {
            System.out.println("destroy_pre_destroy");
        }

        void work() {
            delegate.notifyUser();
        }
    }

    public static void main(String[] args) {
        NotifierBean bean = new NotifierBean(true, "sms");
        bean.postConstruct();
        bean.work();
        bean.preDestroy();
    }
}
`,
};

const cheatsheetRows = [
  ["@PostConstruct", "after inject", "init callback"],
  ["@PreDestroy", "singleton shutdown", "cleanup"],
  ["InitializingBean", "afterPropertiesSet", "interface init"],
  ["BPP before", "pre init", "proxy prep"],
  ["BPP after", "post init", "AOP proxy"],
  ["@DependsOn", "order beans", "infra"],
  ["@Qualifier", "name bean", "disambiguate"],
  ["@Primary", "default pick", "multi beans"],
  ["Prototype", "new each time", "manual destroy"],
  ["Singleton", "one container", "default"],
  ["FactoryBean", "getObject", "indirection"],
  ["ObjectProvider", "lazy get", "defer"],
  ["Scoped proxy", "singleton inject", "request scope"],
  ["Constructor inj", "required deps", "immutable"],
  ["@Configuration", "CGLIB proxy", "@Bean methods"],
];

export default {
  title: "Spring Bean Lifecycle & Advanced DI",
  tags: [
    "Mid-Level",
    "Advanced",
    "Phase 5",
    "Interview Prep",
    "Spring",
    "Bean lifecycle",
    "DI",
    "Satyverse(Satyam Parmar)",
  ],
  prerequisites: ["Day 38", "Day 37"],
  learningObjectives: [
    "Describe Spring bean initialization and destruction order precisely",
    "Apply @Qualifier, @Primary, and @DependsOn for correct wiring",
    "Explain prototype vs singleton lifecycle and resource risks",
    "Use FactoryBean, ObjectProvider, and scoped proxies appropriately",
    "Relate BeanPostProcessor ordering to AOP and cross-cutting concerns",
    "Debug lifecycle and DI issues using tests and actuator-style reasoning",
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
  mcqLabel: "Spring Bean Lifecycle & DI",
  mcqDescription: "Thirty questions on lifecycle callbacks, scoping, wiring, and advanced DI patterns.",
  mcqQuestions,
  cheatsheetRows,
};
