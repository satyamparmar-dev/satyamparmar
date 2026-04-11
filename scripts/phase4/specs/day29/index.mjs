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

const why = `Lambdas and method references are the default vocabulary of modern Java libraries. Once streams, optional callbacks, and asynchronous APIs became mainstream, interviewers stopped asking whether you like functional style and started asking whether you can use it without hiding bugs. Readable pipelines and small pure functions signal senior discipline; clever one-liners that capture mutable state signal risk.

Functional interfaces are not a buzzword. They are contracts: one abstract method, clear intent, composable behavior. When you understand how lambdas are linked at runtime and what variables they close over, you can explain flaky tests caused by shared mutable counters and thread safety mistakes in parallel streams.

Method references are more than syntax sugar. They communicate intent when a method already exists with the right shape. Interviewers often watch whether you reach for String::compareTo versus a lambda that reimplements comparison badly, or whether you know the difference between bound and unbound references.

Checked exceptions inside lambdas remain a design pressure point. Production services that expose SAM-based APIs need a strategy: wrapper exceptions, Result types, or narrower signatures. Being able to articulate that trade-off separates tutorial knowledge from shipping experience.

Teams migrating from older Java versions had to retrofit anonymous inner classes. The durable lesson is not nostalgia for verbosity but clarity about object identity, serialization, and debugging stack frames when something goes wrong in a lambda body.

On call, obscure stack traces involving generated lambda classes or bootstrap failures after bytecode manipulation point back to this layer. You should be able to map a failure to either business logic inside the lambda or linkage/version skew, then fix the smallest surface that restores safety.`;

const pitfalls = [
  "**Mutating captured variables** — race or illegal reassignment; use Atomic* or holder object consciously.",
  "**Throwing checked exceptions raw in lambdas** — compile errors or wrapped sneaky; design API.",
  "**Parallel stream on wrong data** — ordering bugs; use sequential unless profiled safe.",
  "**Method ref wrong overload** — ambiguous compile; specify cast or lambda.",
  "**Serializable lambdas in sessions** — upgrade breaks; prefer named classes.",
  "**Using peek for business logic** — side effects hidden; use map/forEach intentionally.",
  "**Comparator nulls** — NPE; use nullsFirst/Last.",
  "**Capturing heavy objects** — memory leak in long-lived callbacks; narrow capture.",
];

const exercise = {
  title: "Practice exercise",
  difficulty: "Intermediate",
  problem: `**Day 29 — Lambda and functional interfaces (assignment alignment)**

1. Build a **List<String>** with at least **4** mixed-case tokens including one empty or blank after trim should drop.
2. Use **streams** with **method references** where possible: trim, filter non-empty, **map to uppercase**, **sorted** natural order.
3. **Collect** to a single comma-separated **String** (no trailing comma) and print it.
4. Also print the **count** of non-empty tokens as a second line.`,
  hints: [
    "Use String::trim, String::toUpperCase, filter(s -> !s.isEmpty()), sorted(), Collectors.joining(\",\")",
    "count() on the filtered stream for the second line.",
    "Package arch.day29, class Day29Exercise.",
  ],
  solution: String.raw`package arch.day29;

import java.util.*;
import java.util.stream.*;

public class Day29Exercise {

    public static void main(String[] args) {
        List<String> words = Arrays.asList("  java", "Lambda", "", "stream", "Day");
        Stream<String> cleaned =
                words.stream().map(String::trim).filter(s -> !s.isEmpty());
        long count = cleaned.count();
        String joined =
                words.stream()
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .map(String::toUpperCase)
                        .sorted()
                        .collect(Collectors.joining(","));
        System.out.println(joined);
        System.out.println(count);
    }
}
`,
};

const cheatsheetRows = [
  ["SAM", "one abstract", "lambda target"],
  ["Effectively final", "no reassignment", "capture rule"],
  ["Method ref static", "Class::meth", "matches args"],
  ["Unbound instance", "String::length", "first arg receiver"],
  ["Constructor ref", "ArrayList::new", "Supplier"],
  ["Predicate", "test", "filter"],
  ["Function", "apply", "map"],
  ["Consumer", "accept", "forEach"],
  ["Supplier", "get", "defer"],
  ["Comparator", "compare", "sort"],
  ["comparing", "key extractor", "readable"],
  ["thenComparing", "tie-break", "chain"],
  ["invokedynamic", "lambda link", "metafactory"],
  ["peek", "debug only", "side effect smell"],
  ["Stream lazy", "terminal runs", "once consumed"],
];

export default {
  title: "Lambda and Functional Interfaces",
  tags: ["Mid-Level", "Intermediate", "Phase 4", "Interview Prep", "Satyverse(Satyam Parmar)"],
  prerequisites: ["Day 28", "Day 27"],
  learningObjectives: [
    "Use lambdas and method references with correct target typing",
    "Explain SAM, capture rules, and invokedynamic at a high level",
    "Compose Comparator, Predicate, and Function APIs safely",
    "Avoid common parallel stream and serialization pitfalls",
    "Relate functional style to readability and review standards",
    "Debug stack traces involving synthetic lambda classes",
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
  mcqLabel: "Lambda and Functional Interfaces",
  mcqDescription: "Thirty questions on SAM, captures, method references, composition, and streams entry.",
  mcqQuestions,
  cheatsheetRows,
};
