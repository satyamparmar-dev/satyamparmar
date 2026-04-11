/**
 * Generates MCQ sections for phase2-day10..18 and writes public/data/phase2-mcq-bundle.json
 * Run: node scripts/gen-phase2-mcq.mjs
 */
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { DAYS_12_18 } from "./phase2-mcq-days12-18.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, "../public/data/phase2-mcq-bundle.json");

/** @param {Array<{L:string,C:string,q:string,o:string[],a:string,e:string}>} stems */
function expand(stems) {
  return stems.map((s, i) => ({
    id: i + 1,
    level: s.L,
    category: s.C,
    question: s.q,
    options: { A: s.o[0], B: s.o[1], C: s.o[2], D: s.o[3] },
    answer: s.a,
    explanation: s.e,
  }));
}

/** @type {Record<string, { title: string; description: string; stems: any[] }>} */
const DAYS = {
  "10": {
    title: "MCQ Quiz — Inheritance and polymorphism",
    description:
      "Thirty questions from basic to advanced on extends, super, dynamic dispatch, @Override, covariant returns, and Liskov-safe design.",
    stems: [
      { L: "basic", C: "theory", q: "Java class inheritance uses which keyword?", o: ["implements", "extends", "inherits", "superclass"], a: "B", e: "A class extends one superclass; implements is for interfaces." },
      { L: "basic", C: "theory", q: "`super()` in a subclass constructor must be", o: ["last statement", "first statement when explicit", "optional anywhere", "forbidden"], a: "B", e: "Constructor chaining rule." },
      { L: "basic", C: "code", q: "`Animal a = new Dog(); a.speak()` uses", o: ["static binding", "dynamic dispatch on instance methods", "compile-time only", "macro expansion"], a: "B", e: "Runtime type Dog selects overridden speak." },
      { L: "basic", C: "theory", q: "`@Override` on a method helps", o: ["make methods static", "catch accidental overloads", "disable polymorphism", "remove generics"], a: "B", e: "Compiler verifies true override." },
      { L: "basic", C: "theory", q: "A subclass may override an instance method with access", o: ["more restrictive only", "same or wider", "private always", "package-only always"], a: "B", e: "Cannot narrow visibility when overriding." },
      { L: "intermediate", C: "theory", q: "Liskov Substitution Principle means", o: ["subclasses may break parent contracts", "subtypes work wherever supertypes are expected", "only interfaces matter", "final classes exempt"], a: "B", e: "Substitutability without surprises." },
      { L: "intermediate", C: "code", q: "`super.method()` in subclass calls", o: ["static superclass method only", "superclass version of instance method", "interface default always", "private subclass helper"], a: "B", e: "Explicit parent implementation." },
      { L: "intermediate", C: "theory", q: "Covariant return on override allows", o: ["void to int", "subtype of original return type", "unrelated class", "primitive to wrapper swap"], a: "B", e: "Narrower reference return OK." },
      { L: "intermediate", C: "theory", q: "Hiding static methods differs from overriding because", o: ["both use dynamic dispatch", "static resolves by declared type", "static cannot exist in subclass", "JVM forbids static"], a: "B", e: "No virtual static calls." },
      { L: "intermediate", C: "code", q: "If parent has no no-arg constructor and only `Parent(int x)`, subclass must", o: ["omit constructors", "call `super(...)` explicitly with args", "add default silently", "use implements"], a: "B", e: "Compiler cannot insert `super()`." },
      { L: "intermediate", C: "theory", q: "Composition over inheritance helps when", o: ["behaviour reuse is not true is-a", "you need multiple class extends", "primitives must widen", "all methods static"], a: "A", e: "Avoid fragile deep trees." },
      { L: "intermediate", C: "theory", q: "Abstract class can", o: ["be instantiated with new always", "hold concrete and abstract methods", "never have constructors", "replace interfaces entirely"], a: "B", e: "Template for subclasses." },
      { L: "advanced", C: "theory", q: "Double dispatch in plain Java single dispatch means", o: ["two threads run one method", "visitor pattern emulates second dispatch", "only static calls chain", "generics erase dispatch"], a: "B", e: "Classic OOP interview follow-up." },
      { L: "advanced", C: "code", q: "Calling an overridable instance method from superclass constructor risks", o: ["faster init", "subclass fields not yet initialized", "better encapsulation", "automatic final fields"], a: "B", e: "Fragile construction." },
      { L: "basic", C: "theory", q: "`final` method means", o: ["cannot override in subclass", "must be static", "inline only", "slower dispatch"], a: "A", e: "Closed override point." },
      { L: "intermediate", C: "code", q: "`instanceof` before cast avoids", o: ["compilation", "ClassCastException at runtime", "garbage collection", "boxing"], a: "B", e: "Type safety pattern." },
      { L: "intermediate", C: "theory", q: "Polymorphic collection `List<Animal>` with Dog/Cat relies on", o: ["recompilation per element", "shared vtable dispatch", "only static methods", "String pool"], a: "B", e: "Virtual calls per element." },
      { L: "basic", C: "theory", q: "`this(...)` calls", o: ["superclass constructor", "another constructor same class", "finalize", "clone"], a: "B", e: "Constructor chaining within class." },
      { L: "advanced", C: "theory", q: "Fragile base class problem refers to", o: ["secure coding only", "subclass breaks when superclass changes internals", "GC pauses", "JIT deoptimization"], a: "B", e: "Inheritance coupling risk." },
      { L: "intermediate", C: "code", q: "Subclass adds overloaded `void m(int)` while super has `void m(long)` — overload resolution uses", o: ["runtime type only", "compile-time types of args", "random", "import order"], a: "B", e: "Overload vs override." },
      { L: "basic", C: "theory", q: "Single inheritance for classes means", o: ["one extends + many implements", "many extends", "no interfaces", "only nested classes"], a: "A", e: "Class extends one; implements many." },
      { L: "intermediate", C: "theory", q: "Which typically signals preferring composition?", o: ["clear is-a across lifecycle", "only behaviour shared not identity", "need protected fields everywhere", "require multiple class extends"], a: "B", e: "Has-a vs is-a judgement." },
      { L: "advanced", C: "code", q: "Bridge method (synthetic) may appear when overriding with", o: ["identical erasure", "covariant return after generics erasure", "static import", "var args only"], a: "B", e: "Compiler bridge for JVM." },
      { L: "basic", C: "code", q: "`class Dog extends Animal` — Dog is-a", o: ["Animal", "Object only", "String", "Comparable always"], a: "A", e: "Transitive subclassing." },
      { L: "intermediate", C: "theory", q: "Protected member visible to", o: ["only same class", "subclasses + package", "world", "nobody"], a: "B", e: "Modifier review tied to inheritance." },
      { L: "advanced", C: "theory", q: "Anti-pattern: subclass throws on method allowed in superclass violates", o: ["compilation always", "Liskov expectations", "String interning", "UTF-8"], a: "B", e: "Strengthening pre/post improperly." },
      { L: "intermediate", C: "code", q: "`((Dog) animal).wag()` requires", o: ["Animal always has wag", "cast because reference type narrower", "no cast ever", "only static methods"], a: "B", e: "Downcast for subtype API." },
      { L: "basic", C: "theory", q: "Runtime polymorphism applies to", o: ["static methods primarily", "instance methods", "fields", "primitive assignments"], a: "B", e: "Virtual instance calls." },
      { L: "intermediate", C: "theory", q: "Sealed classes help inheritance by", o: ["allowing unlimited subclasses", "restricting permitted subclasses", "removing final", "disabling instanceof"], a: "B", e: "Controlled hierarchies." },
      { L: "advanced", C: "code", q: "Template method pattern keeps `final void execute()` calling abstract `step()` to", o: ["prevent overriding algorithm skeleton", "force static binding", "delete polymorphism", "avoid compilation"], a: "A", e: "Skeleton non-overridable, steps are." },
    ],
  },
  "11": {
    title: "MCQ Quiz — Abstract classes and interfaces",
    description:
      "Thirty questions on abstract types, Java 8+ defaults, static interface methods, diamond conflicts, and when to choose each.",
    stems: [
      { L: "basic", C: "theory", q: "Interface before Java 8: abstract methods are implicitly", o: ["private", "public abstract", "protected", "package"], a: "B", e: "Public abstraction." },
      { L: "basic", C: "theory", q: "A class implements interfaces with", o: ["extends", "implements", "uses", "requires"], a: "B", e: "Keyword implements." },
      { L: "basic", C: "theory", q: "Abstract class cannot be instantiated if", o: ["it has static methods", "it is abstract", "it has fields", "it is public"], a: "B", e: "new on abstract is illegal." },
      { L: "intermediate", C: "theory", q: "Default method on interface provides", o: ["mandatory state fields", "instance behaviour with body on implementing classes", "only static helpers", "primitive storage"], a: "B", e: "Java 8 evolution." },
      { L: "intermediate", C: "code", q: "Two interfaces both `default void greet()` — implementing class must", o: ["pick neither", "override and resolve, optionally Interface.super", "fail JVM", "delete interfaces"], a: "B", e: "Diamond resolution." },
      { L: "intermediate", C: "theory", q: "Interface static methods are", o: ["inherited to implementing instances", "called via InterfaceName.method", "virtual on this", "always abstract"], a: "B", e: "Not inherited instance-wise." },
      { L: "basic", C: "theory", q: "Choose abstract class over interface when you need", o: ["multiple inheritance of type only", "shared non-public state/constructors among related types", "no methods", "primitive roots"], a: "B", e: "Shared skeletal code." },
      { L: "intermediate", C: "theory", q: "Private methods in interfaces (Java 9+) help", o: ["expose API", "factor default method helpers", "replace classes", "store per-instance state"], a: "B", e: "Internal reuse." },
      { L: "intermediate", C: "code", q: "`A.super.m()` in class implementing A and B refers to", o: ["superclass Object", "chosen interface default", "static import", "abstract error"], a: "B", e: "Qualified super call." },
      { L: "basic", C: "theory", q: "Interface fields are implicitly", o: ["mutable instance", "public static final", "protected", "volatile instance"], a: "B", e: "Constants only." },
      { L: "intermediate", C: "theory", q: "Functional interface has", o: ["many abstract methods", "exactly one abstract method (SAM)", "no defaults", "only static methods"], a: "B", e: "Lambda target typing." },
      { L: "advanced", C: "theory", q: "Marker interface like Serializable typically", o: ["adds many methods", "has no methods—metadata for JVM/tools", "replaces records", "forces sealed"], a: "B", e: "Tagging contract." },
      { L: "intermediate", C: "code", q: "Class extends AbstractX — must", o: ["implement all abstract methods or stay abstract", "ignore abstracts", "delete superclass", "add main"], a: "A", e: "Concrete completes contract." },
      { L: "basic", C: "theory", q: "`implements` can list", o: ["one interface only", "multiple interfaces", "classes", "packages"], a: "B", e: "Multiple interface inheritance." },
      { L: "intermediate", C: "theory", q: "Sealed interface directs", o: ["all implementors unknown", "permitted implementors enumerated", "removes pattern matching", "disables records"], a: "B", e: "Exhaustive switches possible." },
      { L: "advanced", C: "code", q: "Default method cannot override `Object` methods because", o: ["Object is final", "equivalence to java.lang.Object methods forbidden on interfaces", "defaults are static", "JVM bug"], a: "B", e: "Language rule." },
      { L: "intermediate", C: "theory", q: "Abstract method has", o: ["body required", "no body in declare type", "private default", "final modifier always"], a: "B", e: "Subclass supplies implementation." },
      { L: "basic", C: "code", q: "`interface Runnable { void run(); }` — run is", o: ["static", "abstract instance method", "default", "final"], a: "B", e: "Implicit abstract." },
      { L: "intermediate", C: "theory", q: "Prefer interface for API dependency when", o: ["you need constructors", "many unrelated types share capability", "only one class ever exists", "all state private"], a: "B", e: "Can-do across types." },
      { L: "advanced", C: "theory", q: "Evolution of interfaces with defaults risks", o: ["no compile impact", "silent binary incompatibility if implementors had same signature instance method", "removing Object", "disabling lambdas"], a: "B", e: "Care when adding defaults." },
      { L: "intermediate", C: "code", q: "`Comparator.comparing(Person::getName)` returns", o: ["int", "Comparator", "Person", "Stream"], a: "B", e: "Factory on Comparator interface." },
      { L: "basic", C: "theory", q: "Abstract class may contain", o: ["only abstract methods", "concrete methods and fields", "main forbidden", "no constructors"], a: "B", e: "Partial implementation." },
      { L: "intermediate", C: "theory", q: "`default` methods help backward compatibility by", o: ["breaking old implementors", "adding methods without forcing immediate implementation everywhere", "removing generics", "making fields public"], a: "B", e: "Library evolution." },
      { L: "advanced", C: "code", q: "Interface `private static void helper()` is callable from", o: ["implementing class instances directly", "other static/default methods in same interface", "subclasses via super", "main only"], a: "B", e: "Scoped helper." },
      { L: "intermediate", C: "theory", q: "Diamond problem name refers to", o: ["single interface", "multiple inheritance paths to same default", "only generics", "only enums"], a: "B", e: "Ambiguity shape." },
      { L: "basic", C: "theory", q: "A concrete class `implements Serializable` primarily", o: ["adds serialize methods automatically", "marks type for serialization system", "encrypts fields", "replaces JSON"], a: "B", e: "Marker contract." },
      { L: "intermediate", C: "code", q: "`List.of()` returns", o: ["mutable ArrayList always", "unmodifiable list implementation", "LinkedList", "Vector"], a: "B", e: "Immutable factory." },
      { L: "advanced", C: "theory", q: "Interface inheritance `extends A, B` allowed when", o: ["never", "A and B compatible—compiler checks for clashes", "only one method total", "only in enums"], a: "B", e: "Interface extends multiple." },
      { L: "intermediate", C: "theory", q: "Choosing interface + default vs abstract class: defaults suit", o: ["large shared mutable state", "optional extension points on wide type surface", "primitive-only APIs", "no implementors"], a: "B", e: "Mixin-style evolution." },
      { L: "basic", C: "code", q: "`@FunctionalInterface` documents", o: ["any interface", "SAM intent and compiler check", "only streams", "serialVersionUID"], a: "B", e: "Optional annotation." },
    ],
  },
};

Object.assign(DAYS, DAYS_12_18);

const bundle = {};
for (const [k, v] of Object.entries(DAYS)) {
  if (v.stems.length !== 30) {
    throw new Error(`Day ${k}: expected 30 stems, got ${v.stems.length}`);
  }
  bundle[k] = {
    type: "mcq",
    title: v.title,
    description: v.description,
    questions: expand(v.stems),
  };
}

fs.writeFileSync(outPath, JSON.stringify(bundle, null, 2) + "\n");
console.log("Wrote", outPath, Object.keys(bundle).sort((a, b) => Number(a) - Number(b)).join(", "));
