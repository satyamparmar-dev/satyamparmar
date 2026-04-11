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

const why = `Generics are the difference between APIs that fail fast at compile time and APIs that fail mysteriously in production with ClassCastException buried under framework stack frames. When you declare a typed collection or a reusable algorithm over a type parameter, you are encoding invariants your teammates and your future self will rely on. Interviewers care because generics touch almost every modern Java codebase and reveal whether you understand compile-time reasoning versus runtime reality.

Most teams eventually hit erasure head-on: a mapper cannot instantiate T, a framework cannot infer nested generics, or a reflective call drops type information. The durable skill is not memorizing wildcard syntax but explaining what the compiler guarantees, what it erases, and how you recover type information safely when you must.

Wildcards and the PECS mnemonic are not academic. They show up in public library boundaries where you want to accept the widest possible input without breaking callers. Getting PECS wrong produces APIs that are either unusable because you cannot pass the lists you have, or unsafe because you allowed writes that corrupt type assumptions.

Bounded type parameters and recursive bounds appear in comparators, graph nodes, and fluent builders. Understanding how to express multiple bounds and when to prefer a wildcard at the edge of your module keeps code readable without sacrificing flexibility.

Raw types are a migration escape hatch from the early 2000s, not a style choice. Shipping new raw-typed public methods signals either ignorance or intentional technical debt, and either reading hurts in a senior interview. You should be able to articulate why raw types still compile and why your default is always to eliminate them.

On call, weird ClassCastExceptions after an upgrade often trace back to unchecked casts sneaking through generic boundaries, or third-party code returning raw collections into typed pipelines. Your debugging story should include turning on lint, reproducing with minimal generics, and fixing the contract at the source rather than sprinkling casts at the sink.`;

const pitfalls = [
  "**Raw types in new code** — latent ClassCastException in prod; enable -Xlint:unchecked; replace with typed APIs.",
  "**Wildcard misuse (PECS flipped)** — APIs reject valid calls or allow unsafe writes; review producer/consumer direction.",
  "**Generic arrays** — compiler error or unchecked warnings; use ArrayList or reflection tokens carefully.",
  "**Assuming runtime List<String>** — reflection sees List; fix with Class tokens or TypeReference patterns.",
  "**Unbounded wildcards everywhere** — code becomes unreadable; use named type params internally.",
  "**Ignoring bridge methods in stack traces** — confusion during overrides; know compiler synthesizes bridges.",
  "**Casting away generics** — suppresses truth; narrow scope and add tests.",
  "**JSON/XML mappers without type info** — subtle map-to-wrong-type bugs; document concrete types.",
];

const exercise = {
  title: "Practice exercise",
  difficulty: "Intermediate",
  problem: `**Day 28 — Generics deep dive (assignment alignment)**

1. Define a **generic class** \`Pair<A, B>\` with fields (or record components) **first** and **second**, constructor or canonical ctor, getters **getFirst()** / **getSecond()** (or accessors).
2. Add method **swap()** returning \`Pair<B, A>\` with components reversed.
3. In \`main\`, build \`Pair<String, Integer>\` for \`"hi"\` and \`42\`, print **getFirst()**, then print **getFirst()** after **swap()** (expect **42** as string or integer per your accessor types).
4. Keep **deterministic** output: one line per print, no randomness.`,
  hints: [
    "Use a static nested generic class or a record Pair<A,B>(A first, B second) with swap returning new Pair<>(second, first).",
    "If you use Integer, println after swap shows 42 without quotes.",
    "Package must be arch.day28 and class name Day28Exercise for consistency.",
  ],
  solution: String.raw`package arch.day28;

public class Day28Exercise {

    static final class Pair<A, B> {
        private final A first;
        private final B second;

        Pair(A first, B second) {
            this.first = first;
            this.second = second;
        }

        A getFirst() {
            return first;
        }

        B getSecond() {
            return second;
        }

        Pair<B, A> swap() {
            return new Pair<>(second, first);
        }
    }

    public static void main(String[] args) {
        Pair<String, Integer> p = new Pair<>("hi", 42);
        System.out.println(p.getFirst());
        System.out.println(p.swap().getFirst());
    }
}
`,
};

const cheatsheetRows = [
  ["Erasure", "compile checks, runtime raw-ish", "javac not JVM tracks T"],
  ["PECS", "producer extends", "consumer super"],
  ["Wildcard ?", "unknown type", "flexible API"],
  ["Raw type", "legacy", "avoid new code"],
  ["Bounded T", "extends class & ifaces", "T extends Number & Closeable"],
  ["Bridge", "synthetic override", "stack traces"],
  ["Invariant", "List<Integer>≠List<Number>", "not like arrays"],
  ["Generic array", "illegal new T[]", "use List"],
  ["Class<T> token", "reflection", "TypeLiteral patterns"],
  ["Diamond", "<> infer", "less noise"],
  ["Copy pattern", "extends src super dst", "PECS classic"],
  ["Comparable bound", "<T extends Comparable<T>>", "max/min APIs"],
  ["Method generic", "static <T> T id", "utility"],
  ["Heap pollution", "varargs generic", "@SafeVarargs"],
  ["Capture", "helper generic", "fix ? compile"],
];

export default {
  title: "Generics Deep Dive",
  tags: ["Mid-Level", "Intermediate", "Phase 4", "Interview Prep", "Satyverse(Satyam Parmar)"],
  prerequisites: ["Day 27", "Day 26"],
  learningObjectives: [
    "Explain type erasure, bounds, and wildcards with interview clarity",
    "Apply PECS to read/write APIs and collection utilities",
    "Implement generic classes and methods without raw types",
    "Diagnose bridge methods, heap pollution, and reflection limits",
    "Design type-safe boundaries for libraries and DTO mappers",
    "Relate generics to real migration and on-call debugging stories",
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
  mcqLabel: "Generics Deep Dive",
  mcqDescription: "Thirty questions on erasure, wildcards, PECS, bridges, and API design.",
  mcqQuestions,
  cheatsheetRows,
};
