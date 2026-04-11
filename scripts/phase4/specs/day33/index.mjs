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

const why = `Pattern matching and modern switch expressions are the bridge between classic Java verbosity and languages that treat algebraic data types as first-class citizens. They do not replace good object-oriented design, but they remove enough noise that reviewers can see the actual decision tree instead of a forest of casts and temporary variables.

Interviews use these features as a signal that you stay current with the language and that you understand compiler guarantees like exhaustiveness. When you can articulate why a switch on a sealed type is safer than a stringly-typed status field, you are speaking the language of maintainable domain models.

The dominance and ordering rules for patterns are not pedantic trivia. They prevent subtle unreachable cases and keep refactors honest when someone adds a new subtype or a new string token. Teams that ignore those compiler errors pay later with logic bugs that only appear in production traffic.

Null handling remains a cultural fault line. Pattern switches encourage explicit branches, but they do not remove the need for discipline about where null is a valid state versus where it indicates a defect. Your production story should include API contracts and validation at boundaries, not null checks scattered randomly.

Performance is rarely the primary reason to adopt these features, but readability and safer refactors reduce defect rates. That is the argument that matters to engineering managers and to interviewers evaluating how you think about long-term code health.

On call, deserialization bugs and bad downcasts still happen when external data bypasses your sealed model. Your mitigation should combine schema validation, explicit mapping layers, and tests that exercise every switch branch whenever payloads evolve.`;

const pitfalls = [
  "**Null switch surprise** — guard null before switch or explicit null case; avoid NPE.",
  "**Dominance ordering wrong** — unreachable pattern compile error; reorder specific first.",
  "**Giant switches** — unmaintainable; extract handlers.",
  "**Erased generic patterns** — cannot distinguish type args; redesign.",
  "**Mixing business + routing** — hard to test; separate policy.",
  "**Missing default on non-total** — compile error; add or seal type.",
  "**Fall-through colon mistakes** — prefer arrows.",
  "**Reflection bypass** — malicious inputs; validate before dispatch.",
];

const exercise = {
  title: "Practice exercise",
  difficulty: "Intermediate",
  problem: `**Day 33 — Pattern matching and switch (assignment alignment)**

1. Write **static String describe(Object o)** using a **switch expression** on **o**.
2. Handle at least: **Integer** (prefix **int:**), **String** (prefix **str:** + length), **null** (return **null**).
3. Include **default** returning **other**.
4. Print **describe** for **Integer.valueOf(5)**, **\"hi\"**, and **null** on separate lines.`,
  hints: [
    "Use if (o == null) return \"null\"; before switch for broad JDK compatibility.",
    "case Integer i -> \"int:\" + i; case String s -> \"str:\" + s.length();",
    "Package arch.day33, class Day33Exercise.",
  ],
  solution: String.raw`package arch.day33;

public class Day33Exercise {

    static String describe(Object o) {
        if (o == null) {
            return "null";
        }
        return switch (o) {
            case Integer i -> "int:" + i;
            case String s -> "str:" + s.length();
            default -> "other";
        };
    }

    public static void main(String[] args) {
        System.out.println(describe(Integer.valueOf(5)));
        System.out.println(describe("hi"));
        System.out.println(describe(null));
    }
}
`,
};

const cheatsheetRows = [
  ["instanceof pat", "bind var", "no cast"],
  ["switch expr", "yields value", "assign"],
  ["arrow case", "no fall", "clear"],
  ["yield", "block return", "expression"],
  ["when guard", "boolean", "extra test"],
  ["exhaustive", "all paths", "sealed help"],
  ["default", "catch-all", "required sometimes"],
  ["enum switch", "constants", "compiler"],
  ["String switch", "equals", "hash dispatch"],
  ["dominance", "order patterns", "specific first"],
  ["null", "guard out", "explicit case"],
  ["record case", "destructure", "when enabled"],
  ["if chain", "sometimes clearer", "small"],
  ["sealed", "total switch", "safe"],
  ["refactor", "compiler finds", "missing case"],
];

export default {
  title: "Pattern Matching and Switch Expressions",
  tags: ["Mid-Level", "Intermediate", "Phase 4", "Interview Prep", "Satyverse(Satyam Parmar)"],
  prerequisites: ["Day 32", "Day 31"],
  learningObjectives: [
    "Use instanceof patterns and switch expressions fluently",
    "Explain exhaustiveness, dominance, and null handling",
    "Replace verbose instanceof chains with readable switches",
    "Combine sealed types with total switches safely",
    "Recognize erasure limits with generic patterns",
    "Keep dispatch layers thin and testable",
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
  mcqLabel: "Pattern Matching and Switch",
  mcqDescription: "Thirty questions on instanceof patterns, switch expressions, guards, and exhaustiveness.",
  mcqQuestions,
  cheatsheetRows,
};
