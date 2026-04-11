/** Theory appendices for Phase 1 — Java Foundations (Days 1–9) */
export default {
  1: `**From zero to first run.** Walk through once on your machine: create a folder, add \`Hello.java\`, run \`javac\` then \`java\`, and confirm the \`.class\` file appears. That muscle memory beats memorizing definitions.

**What the JVM actually does first:** it finds your class, runs static initializers, then calls \`main\`. Classpath tells it *where* to look; wrong directory → \`ClassNotFoundException\` even with perfect code.

**JAVA_HOME vs PATH:** PATH is for shells to find \`java\`/\`javac\`; JAVA_HOME is the JDK root for Maven, Gradle, and CI. Point both at the *same* JDK version to avoid “compiled with 21, ran with 17” surprises.

**Practice drill:** print \`args\` from the command line (\`java MyApp a b c\`) and explain why \`args[0]\` is \`"a"\` — interviewers use this to check you understand launch semantics, not only syntax.`,

  2: `**Primitives live on the stack (locals) or inside objects; wrappers are heap objects.** That is why \`Integer\` caches small values but \`new Integer(500)\` behaves differently in identity comparisons — prefer \`Integer.valueOf\` and always use \`equals\` for content.

**Choosing types in real specs:** counts in UI → \`int\`; database bigserial / analytics volumes → \`long\`; money → \`BigDecimal\` with string constructors; measurements / ML features → \`double\` with awareness of epsilon.

**Widening vs narrowing:** widening is silent and safe; narrowing casts are a code smell — log or validate before \`(int) bigValue\` in business logic.

**Exercise habit:** for every arithmetic chain, ask “can this exceed \`Integer.MAX_VALUE\`?” If yes, promote to \`long\` *before* the multiply, not after.`,

  3: `**Control flow is about expressing intent.** Prefer \`switch\` (Java 17+ patterns) when mapping discrete values; use \`if\` for ranges and compound business rules so the next reader sees the *why*.

**Loops:** \`for-each\` when you only read; indexed \`for\` when you need the index or mutate positions; \`while\` when the exit condition is not a simple counter (streams, iterators).

**Ternary vs if:** ternaries for short assignments; never nest three levels — that is a maintenance trap.

**Debugging tip:** when a condition “should” fire but does not, print the *types* and values of operands (\`==\` on \`Integer\` vs \`int\` is a classic silent bug).`,

  4: `**Arrays are fixed-size; lists are the default API surface in apps.** Know when zero-based indexing bites (off-by-one in \`substring\`, loop \`< length\`).

**Multi-dimensional arrays:** in Java they are “arrays of arrays”; ragged rows are legal — useful in graph adjacency lists, wasteful if you assumed a matrix.

**\`Arrays.*\` utilities:** \`copyOf\`, \`fill\`, \`sort\`, \`binarySearch\` — learn one method deeply per week and use them in exercises instead of hand-rolling.

**Memory picture:** a large \`byte[]\` for I/O buffers; an \`int[]\` for competitive-style problems; \`Object[]\` for heterogeneous legacy — prefer generics collections for new code.`,

  5: `**Immutability contract:** \`String\` methods return *new* strings; chaining ten calls creates ten intermediates — fine for small text, wrong for tight loops building HTTP bodies.

**When to use \`StringBuilder\`:** loops that append; log message assembly in hot paths; CSV/JSON fragments before parsing. Still not thread-safe — one builder per thread.

**Locale and case:** \`toLowerCase(Locale.ROOT)\` for stable keys (IDs, enums); locale-sensitive for user-visible UI only.

**Regex and \`split\`:** remember \`split\` takes a regex; dot must be escaped. For file paths use \`Path\` API, not string \`split\`.

**Interview story:** “I use \`equals\` for value, \`==\` only for enum constants or intentional reference checks; I know literals may intern but \`new String\` does not.”`,

  6: `**Method design:** small methods with names that read like sentences; extract when you copy-paste three lines twice.

**Recursion vs iteration:** recursion for tree-shaped data and divide-and-conquer clarity; iteration when depth could blow the stack (tail recursion is not optimized in Java).

**Overloading:** same name, different parameter lists — resolution uses compile-time types; varargs must be last.

**Javadoc habit:** document *preconditions* (\`@param\` ranges) and *throws* for public APIs — this is how teams scale without tribal knowledge.

**Practice:** implement \`max(int a, int b)\`, then overload for \`long\`, then extract a generic \`Comparator\` flow — feel the progression from syntax to API design.`,

  7: `**Class = blueprint; object = instance.** Constructors establish invariants; if you allow partial construction, bugs leak into every method.

**\`this\` and chaining:** fluent setters return \`this\` for readability — used in builders and test fixtures.

**Packages:** mirror directory structure; \`public\` types are your module boundary for other JARs.

**Inheritance preview:** prefer composition for “has-a”; use “is-a” sparingly — you will formalize this on Day 10.

**Practical OOP drill:** model a \`BankAccount\` with deposit/withdraw that cannot go negative — encapsulate balance as \`private\` and validate in one place.`,

  8: `**Access control is documentation enforced by the compiler.** \`private\` for fields almost always; \`protected\` when subclasses are part of your design (frameworks); package-private for same-module tests.

**JAR boundaries:** once code ships in another module, only \`public\` API is callable — design packages as you would design REST resources.

**Static imports:** use sparingly for constants (\`import static java.lang.Math.PI\`); avoid for methods that harm readability.

**No wildcards in production APIs:** \`import java.util.*\` is fine while learning; explicit imports help code review diffs.

**Interview angle:** explain *why* hiding fields matters — concurrent updates, invariants, and the ability to change representation without breaking callers.`,

  9: `**Exceptions are for exceptional paths, not flow control.** Checked exceptions document recoverable failures (\`IOException\`); \`RuntimeException\` for programmer bugs — do not catch \`Exception\` broadly unless you are at a framework boundary.

**try-with-resources:** always use for \`Closeable\` — it suppresses exceptions correctly and reads cleaner than manual \`finally\`.

**Cause chains:** when wrapping, use \`initCause\` or constructor that accepts cause — operations teams rely on stack traces.

**Custom exceptions:** domain-specific types (\`PaymentDeclinedException\`) beat string messages alone for handling in higher layers.

**Practice scenario:** read a file line by line; on missing file, print user-friendly message; on malformed line, skip with log — three distinct handling strategies in one exercise.`,
};
