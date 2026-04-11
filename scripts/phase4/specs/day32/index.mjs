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

const why = `Records and sealed types are the most practical language features for modeling closed sets of data in enterprise Java. They reduce the kilobytes of boilerplate that used to hide bugs in hand-written equals methods, and they give the compiler enough structure to keep switch statements honest when new variants appear.

Interviews increasingly assume you can explain why a record is not a bean with getters and setters, and when immutability is a real guarantee versus a shallow promise because a component still references a mutable collection. That distinction matters in concurrent systems and in caching layers where defensive copies decide correctness.

Sealed hierarchies are not only a syntax feature. They are a communication tool: this set of outcomes is complete, and any extension is an explicit design decision. That maps cleanly to payment states, parsing results, and domain events where exhaustive handling is a safety property, not a style preference.

The combination of records with pattern matching makes business rules easier to read than nested instanceof chains, but it also raises the bar for testing. You need cases for every permitted subtype, and your CI should treat compiler errors as the first line of defense when someone adds a new variant.

Frameworks are still catching up. Persistence, deserialization, and reflection-heavy libraries require explicit configuration for sealed polymorphism. Production maturity means you can describe how you would map these types to JSON or database rows without losing type information at the boundary.

On call, subtle bugs from mutable components inside immutable-looking records still happen. Your story should include verifying deep immutability, reviewing serialization formats, and ensuring new sealed subtypes did not bypass validation in compact constructors.`;

const pitfalls = [
  "**Mutable component references** — record looks immutable but internal list mutates; copy defensively.",
  "**Synchronizing on record** — value-based warning; use explicit locks.",
  "**JPA lazy proxies vs records** — mapping mismatch; use entities as classes.",
  "**Sealed permits incomplete** — compile errors; coordinate module boundaries.",
  "**Forgotten switch case** — when not total; enable exhaustive switches.",
  "**Assuming JSON auto polymorphism** — configure type ids for sealed trees.",
  "**Huge record tuples** — unreadable; refactor to nested value types.",
  "**Public API binary compat** — changing components breaks clients; version carefully.",
];

const exercise = {
  title: "Practice exercise",
  difficulty: "Intermediate",
  problem: `**Day 32 — Records and sealed classes (assignment alignment)**

1. Declare a **sealed interface Shape** with **permits** exactly **Circle** and **Rectangle** (nested or package-private types in the same compilation unit).
2. Implement **record Circle(double radius)** and **record Rectangle(double width, double height)** implementing **Shape** with **area()** using **Math.PI** for circles.
3. Add a **total switch expression** (or statement) that returns **area** for each shape type.
4. In **main**, print **integer cast** areas for **Circle(1)** and **Rectangle(2,3)** on separate lines.`,
  hints: [
    "Use switch (s) { case Circle c -> ... case Rectangle r -> ... } with return type double.",
    "Circle area Math.PI * r * r; Rectangle w*h.",
    "Package arch.day32, class Day32Exercise.",
  ],
  solution: String.raw`package arch.day32;

public class Day32Exercise {

    sealed interface Shape permits Circle, Rectangle {
        double area();
    }

    record Circle(double radius) implements Shape {

        @Override
        public double area() {
            return Math.PI * radius * radius;
        }
    }

    record Rectangle(double width, double height) implements Shape {

        @Override
        public double area() {
            return width * height;
        }
    }

    static int areaInt(Shape s) {
        return (int) switch (s) {
            case Circle c -> c.area();
            case Rectangle r -> r.area();
        };
    }

    public static void main(String[] args) {
        System.out.println(areaInt(new Circle(1)));
        System.out.println(areaInt(new Rectangle(2, 3)));
    }
}
`,
};

const cheatsheetRows = [
  ["record", "immutable carrier", "no setters"],
  ["compact ctor", "validate", "before fields"],
  ["sealed", "permits", "closed hierarchy"],
  ["permits", "allowed subtypes", "compile enforced"],
  ["non-sealed", "open again", "escape hatch"],
  ["exhaustive switch", "all cases", "sealed help"],
  ["accessor", "x()", "not getX"],
  ["equals/hash", "components", "generated"],
  ["implements", "interfaces ok", "multiple"],
  ["extends", "Record only", "no other class"],
  ["pattern switch", "case Circle c", "destructure"],
  ["DTO use", "API payloads", "great fit"],
  ["JPA entity", "usually class", "mutability"],
  ["reflection", "RecordComponent", "frameworks"],
  ["serialization", "evolve carefully", "compat"],
];

export default {
  title: "Java 17 Records and Sealed Classes",
  tags: ["Mid-Level", "Intermediate", "Phase 4", "Interview Prep", "Satyverse(Satyam Parmar)"],
  prerequisites: ["Day 31", "Day 30"],
  learningObjectives: [
    "Model immutable data with records and validation",
    "Design sealed hierarchies with explicit permits",
    "Use exhaustive switches safely across variants",
    "Compare records to beans, Lombok, and entities",
    "Plan serialization and API evolution for sealed types",
    "Avoid shallow immutability and framework mismatches",
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
  mcqLabel: "Records and Sealed Classes",
  mcqDescription: "Thirty questions on records, sealed types, permits, and exhaustive switches.",
  mcqQuestions,
  cheatsheetRows,
};
