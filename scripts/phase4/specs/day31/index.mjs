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

const why = `Optional is one of the most misunderstood APIs in modern Java. Used well, it makes absence explicit in return types and encourages compositional null-safe logic. Used poorly, it becomes a second kind of null wrapped in ceremony, especially when it leaks into fields, serialization formats, and framework annotations that were designed around nullable references.

Interviewers want to hear that you understand the difference between a value that might be missing in normal operation and a programming mistake. Optional fits the first case in APIs; it is a poor substitute for validation errors, security failures, or illegal states that deserve exceptions with context.

The chain of map and flatMap is where senior candidates separate themselves from tutorial readers. flatMap exists specifically to avoid nested Optional instances when each step in a pipeline might fail. orElse versus orElseGet is a small detail with real performance implications when the default is expensive.

Modern Java APIs around strings, files, and immutable collections reduce boilerplate alongside Optional. Knowing when to combine these features versus when to keep code boring and explicit is part of production judgment.

Frameworks like JPA and JSON mappers historically stumbled on Optional fields. You should be able to explain why teams often prefer nullable columns and explicit DTO mapping rules, and how you would document API contracts at system boundaries.

On call, confusing null versus empty in logs and metrics often traces back to inconsistent Optional usage at service edges. Your remediation story should standardize representation, add tests for absent paths, and align client expectations without breaking compatibility.`;

const pitfalls = [
  "**Optional.of(null)** — immediate NPE; use ofNullable at boundaries.",
  "**Optional field on entity** — JPA/serialization pain; prefer nullable column.",
  "**get() without isPresent** — NoSuchElement; use orElse/orElseThrow.",
  "**orElse with heavy default** — wasted work; use orElseGet.",
  "**Nested Optional from map** — wrong; use flatMap when inner is Optional.",
  "**Optional parameter** — double optional confusion; prefer overloads.",
  "**Serializing Optional poorly** — weird JSON; configure mapper or unwrap.",
  "**Confusing empty with failure** — use exceptions or Result for errors.",
];

const exercise = {
  title: "Practice exercise",
  difficulty: "Intermediate",
  problem: `**Day 31 — Optional and modern Java APIs (assignment alignment)**

1. Define **record Address(Optional<String> city)** (city may be absent).
2. Define **record User(String name, Optional<Address> address)**.
3. Implement **static Optional<String> cityName(User u)** that returns the city **only** if both user address and city string are present (use **flatMap** / **map**).
4. In **main**, print **cityName** for one full chain and one missing chain using **orElse(\"unknown\")**.`,
  hints: [
    "Start from u.address().flatMap(addr -> addr.city().filter(s -> !s.isBlank())) or map city Optional.",
    "If Address holds Optional<String> city, flatMap Address::city then filter non-blank.",
    "Package arch.day31, class Day31Exercise.",
  ],
  solution: String.raw`package arch.day31;

import java.util.*;

public class Day31Exercise {

    record Address(Optional<String> city) {}

    record User(String name, Optional<Address> address) {}

    static Optional<String> cityName(User u) {
        return u.address().flatMap(Address::city).filter(s -> !s.isBlank());
    }

    public static void main(String[] args) {
        User ok = new User("A", Optional.of(new Address(Optional.of("Oslo"))));
        User miss = new User("B", Optional.of(new Address(Optional.empty())));
        System.out.println(cityName(ok).orElse("unknown"));
        System.out.println(cityName(miss).orElse("unknown"));
    }
}
`,
};

const cheatsheetRows = [
  ["of", "non-null", "throws on null"],
  ["ofNullable", "maybe null", "empty if null"],
  ["map", "transform value", "empty stays"],
  ["flatMap", "Optional mapper", "no nest"],
  ["filter", "predicate", "else empty"],
  ["orElse", "default eager", "simple"],
  ["orElseGet", "Supplier", "lazy default"],
  ["orElseThrow", "exception", "fail fast"],
  ["ifPresent", "Consumer", "side effect"],
  ["stream", "0/1", "flatten lists"],
  ["empty", "singleton absent", "compare with isEmpty"],
  ["OptionalInt", "primitive", "no box"],
  ["or", "alternative Optional", "Java 9+"],
  ["isPresent", "boolean", "guard legacy"],
  ["ifPresentOrElse", "both paths", "Java 9+"],
];

export default {
  title: "Optional and Modern Java APIs",
  tags: ["Mid-Level", "Intermediate", "Phase 4", "Interview Prep", "Satyverse(Satyam Parmar)"],
  prerequisites: ["Day 30", "Day 29"],
  learningObjectives: [
    "Chain Optional with map, flatMap, and filter safely",
    "Choose orElse vs orElseGet and exception paths deliberately",
    "Avoid anti-patterns for fields, parameters, and persistence",
    "Bridge Optional with streams for collection processing",
    "Relate Optional to API design and framework constraints",
    "Use adjacent modern APIs for strings and collections",
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
  mcqLabel: "Optional and Modern Java APIs",
  mcqDescription: "Thirty questions on chaining, factories, laziness, and API design.",
  mcqQuestions,
  cheatsheetRows,
};
