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

const why = `Streams changed how Java developers express data processing, but they did not change the hard parts: correctness under nulls, performance under large data, and thread safety under parallelism. Interviews reward candidates who can describe the pipeline model clearly and who know when a for-loop is still the better tool for readability or debugging.

Collectors such as groupingBy with downstream averagingDouble show up constantly in service code that aggregates metrics, builds reports, or prepares DTO maps. Understanding downstream collectors separates someone who memorized stream syntax from someone who can design maintainable aggregation logic.

Parallel streams are a recurring footgun. Production incidents have come from mutating shared structures inside forEach or from assuming parallelStream is a free performance boost. You should articulate fork-join overhead, spliterator characteristics, and when to prefer explicit ExecutorService models instead.

Short-circuiting operations and lazy fusion are not trivia. They explain why order of operations matters, why infinite streams need limits, and why some pipelines allocate less than a naive reading would suggest. That mental model helps when profiling unexpected allocations.

Teams also wrestle with API evolution: collectors that return unmodifiable collections, changes in default immutability, and migration away from mutable shared lists. Being able to discuss backward compatibility shows maturity beyond tutorial examples.

On call, high CPU in stream-heavy batch jobs often points to accidental quadratic behavior, parallel misuse, or accidental boxing in hot loops. Your story should connect metrics to pipeline shape and to a concrete fix: different collector, primitive stream, or batching strategy.`;

const pitfalls = [
  "**Modifying source during stream** — ConcurrentModificationException; collect first or use concurrent structures.",
  "**parallelStream on non-thread-safe collections** — silent corruption; use concurrent sources or sequential.",
  "**Infinite stream without limit** — hung thread; add limit/short-circuit.",
  "**Heavy work in peek** — hidden side effects; extract explicit loop.",
  "**Boxed streams in hot paths** — GC pressure; mapToInt/Double/Long.",
  "**Wrong collector merge for toMap** — IllegalStateException; supply merge function.",
  "**Assuming encounter order in parallel findFirst** — nondeterminism; use findAny or sequential.",
  "**Logging PII inside map** — compliance risk; redact outside pipeline.",
];

const exercise = {
  title: "Practice exercise",
  difficulty: "Intermediate",
  problem: `**Day 30 — Streams API (assignment alignment)**

1. Define **record Employee(String name, String department, double salary)** (or equivalent fields).
2. Build a **List<Employee>** with at least **4** rows spanning **two departments** with different salaries.
3. Use **Collectors.groupingBy** on department with **Collectors.averagingDouble(Employee::salary)**.
4. Print each **department** and **average salary** on its own line, **sorted by department name**.`,
  hints: [
    "entrySet().stream().sorted(Map.Entry.comparingByKey()).forEach(...)",
    "Use String.format or println with key + '=' + value for clarity.",
    "Package arch.day30, class Day30Exercise.",
  ],
  solution: String.raw`package arch.day30;

import java.util.*;
import java.util.stream.*;

public class Day30Exercise {

    record Employee(String name, String department, double salary) {}

    public static void main(String[] args) {
        List<Employee> staff =
                List.of(
                        new Employee("A", "eng", 100),
                        new Employee("B", "eng", 200),
                        new Employee("C", "sales", 150),
                        new Employee("D", "sales", 250));
        Map<String, Double> avg =
                staff.stream()
                        .collect(
                                Collectors.groupingBy(
                                        Employee::department, Collectors.averagingDouble(Employee::salary)));
        avg.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .forEach(e -> System.out.println(e.getKey() + "=" + e.getValue()));
    }
}
`,
};

const cheatsheetRows = [
  ["Intermediate", "lazy", "no work until terminal"],
  ["Terminal", "collect reduce", "executes"],
  ["map", "transform", "Function"],
  ["filter", "Predicate", "subset"],
  ["flatMap", "flatten", "nested"],
  ["groupingBy", "Map<K,List<T>>", "partition"],
  ["averagingDouble", "mean", "downstream"],
  ["joining", "delimiter", "String"],
  ["partitioningBy", "boolean key", "two buckets"],
  ["reduce", "associative", "parallel safe"],
  ["findFirst", "Optional", "short-circuit"],
  ["parallelStream", "ForkJoin", "careful"],
  ["mapToInt", "unboxed", "performance"],
  ["distinct", "equals/hash", "stateful"],
  ["peek", "debug", "not logic"],
];

export default {
  title: "Streams API",
  tags: ["Mid-Level", "Intermediate", "Phase 4", "Interview Prep", "Satyverse(Satyam Parmar)"],
  prerequisites: ["Day 29", "Day 28"],
  learningObjectives: [
    "Build lazy stream pipelines with correct terminal operations",
    "Use groupingBy and downstream collectors for aggregates",
    "Choose primitive streams and short-circuiting where appropriate",
    "Explain parallel stream risks and spliterator basics",
    "Avoid common mutability and performance pitfalls",
    "Relate stream design to observability and batch jobs",
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
  mcqLabel: "Streams API",
  mcqDescription: "Thirty questions on pipelines, collectors, grouping, parallelism, and pitfalls.",
  mcqQuestions,
  cheatsheetRows,
};
