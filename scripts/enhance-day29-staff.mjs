/**
 * Day 29 — staff enhancement for public/data/days/phase4-day29.json
 * (phase1-day29.json does not exist; canonical file is phase4-day29.json)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { WHY_CONTENT, THEORY_CONTENT } from "./day29-payload.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const JSON_PATH = path.join(ROOT, "public", "data", "days", "phase4-day29.json");

const BENCH =
  " Run **javap -v** on the class that owns the **lambda** to read **BootstrapMethods** and **invokedynamic** constants; that separates sugar from linkage bugs. When stacks look fine but latency spikes on **Java 21** **virtual** threads, capture **jcmd** **Thread.print** and search for pinned carriers around **synchronized** blocks inside **lambda** bodies. Failures such as **IllegalStateException** on reused **Stream** pipelines or **ArrayIndexOutOfBoundsException** from **parallelStream** on mutable lists are the usual production shapes. **Java 8** introduced **LambdaMetafactory**; **Java 11** polished **NestHost** reflection; **Java 17** tightens illegal access; **Java 21** scales **Runnable** throughput so diagnostics shift toward pinning, not allocation trivia.";

function conceptualEntry(question, open, topicShort) {
  const fuProd = `During an incident you grep logs for **${topicShort}** failures, then open **jcmd** **Thread.print** on a canary pod and scroll to **ForkJoinPool** frames or **Stream** pipeline frames. You reproduce with a fixture copy of the customer payload, not with toy lists. You attach **javap -v** bootstrap output to the ticket so reviewers see the **invokedynamic** site you mean. You confirm **java -version** on the breaking node so nobody confuses **Java 17** access errors with business logic.`;
  const fuTrap = `Interviewers love claiming any **lambda** magically runs faster than an **anonymous** **class**; you answer that both allocate work and the win is readability until proven otherwise with **JFR**. Another trap is insisting **parallelStream** is free; you cite **ForkJoinPool** contention and mutable source races. A third trap is storing **Stream** instances for later; you teach single-pass pipelines or **Supplier** factories.`;
  return {
    question,
    answer: open + BENCH,
    followUps: [
      {
        question: `Interview follow-up: how do **lambdas** show up in production around ${topicShort}?`,
        answer: fuProd,
      },
      {
        question: `What is a common trap interviewers set on ${topicShort}?`,
        answer: fuTrap,
      },
    ],
  };
}

const CONCEPTUAL = [
  conceptualEntry(
    "What is a **SAM** and why does every **lambda** need one?",
    "A **SAM** (**single** **abstract** **method**) **interface** is exactly what **javac** expects on the left-hand side of a **lambda** assignment. **Runnable**, **Callable**, **Predicate**, and **Function** all qualify because only one abstract **method** remains after **default** **static** helpers are ignored. At **bytecode** level your **lambda** still becomes an object implementing that **interface**; the **JVM** just links it through **invokedynamic** instead of always generating a standalone extra class file. Mis-identifying the **SAM** produces confusing type errors in **Stream** chains because **map** wants a **Function**, not a **Consumer**.",
    "SAM typing mistakes"
  ),
  conceptualEntry(
    "What does **effectively final** mean for **lambda** capture?",
    "Locals used inside **lambda** bodies cannot change after the **lambda** is created unless you wrap them in mutable carriers like **AtomicInteger**. **javac** enforces this so captured values stay safe when the **lambda** runs later on another **thread**. If you increment a primitive **int** counter in a loop and close over it, the compiler error is doing you a favor: concurrent pipelines would see torn reads otherwise. Promote state to a **final** holder object or use **reduce** operations instead of fighting the rule.",
    "capture and counters"
  ),
  conceptualEntry(
    "How does **target typing** pick the **functional** **interface** for a **lambda**?",
    "The compiler looks at the assignment context, **method** **parameter** types, **cast**, or **return** type to decide which **SAM** your **lambda** implements. That is why the same **x -> x** snippet can mean **Function.identity** or nonsense if the context is ambiguous. Explicit types on **parameters** fix most confusion in overloaded APIs. **javac** uses **inference** heavily here, which is why you sometimes add an explicit **Comparator** or **Predicate** type when the API overload explodes.",
    "overloaded SAM APIs"
  ),
  conceptualEntry(
    "When do you choose **Predicate** versus **Function** in pipelines?",
    "**Predicate** models a boolean test with **test**; **Function** models **apply** that returns a transformed value. **Stream.filter** wants **Predicate**, **map** wants **Function**. Swapping them either fails to compile or hides logic inside odd **Boolean** boxing. Name **variables** after the domain rule, not after syntax, so reviewers see intent without reading bodies.",
    "wrong functional choice"
  ),
  conceptualEntry(
    "Name the four **method** **reference** forms and when you reach for each.",
    "**Static** (**String::valueOf**), bound instance (**s::length**), unbound instance (**String::compareTo**), and constructor (**ArrayList::new**) cover the grammar. They are sugar for **lambda**s when arity lines up. Unbound references put the stream element first automatically; juniors confuse that with bound references. When arity does not line up, stick to a **lambda** so you can name parameters clearly.",
    "method reference arity"
  ),
  conceptualEntry(
    "How does **invokedynamic** differ from old **anonymous** **inner** **classes** at runtime?",
    "**Anonymous** **classes** always generated separate class files per site in older style; **lambdas** lean on **LambdaMetafactory** to wire **CallSite** targets to **synthetic** methods holding bodies. That reduces class clutter and enables future optimizations, but stack traces still show generated names. When you shade **JARs**, both styles can break if **MethodHandle** accessibility changes; proof is **javap -v**, not guessing from line numbers.",
    "LinkageError after shading"
  ),
  conceptualEntry(
    "Why is **Stream.peek** dangerous for business rules?",
    "**peek** exists for debugging and should not be the only place debits run. Intermediate operations can be fused or skipped when the **stream** short-circuits, so finance logic silently disappears. Move side effects to **forEach** after you are done transforming, or collect first. Violations show up as **silent** data loss without exceptions.",
    "peek side effects"
  ),
  conceptualEntry(
    "How do **checked** **exceptions** interact with **lambda** bodies?",
    "**SAM** **method** signatures on **java.util.function** do not declare **throws IOException** style clauses, so **lambda** bodies cannot throw checked types without **try/catch** or wrapping. That pushes teams toward **UncheckedIOException** patterns or narrower **APIs**. Production stacks then show **RuntimeException** wrappers; the fix is redesigning boundaries, not sprinkling **sneakyThrow**. **Java** has not added a general checked **lambda** escape hatch on purpose.",
    "checked exceptions in streams"
  ),
  conceptualEntry(
    "What happens when you reuse a **java.util.stream.Stream**?",
    "**Stream** is single-use after a **terminal** operation. Holding onto the reference and calling **filter** again throws **IllegalStateException** with a message about stream reuse. Wrap source data in a **Supplier** of **Stream** if you need multiple passes. CI missed it because tests used tiny lists and only one pass.",
    "stream reuse"
  ),
  conceptualEntry(
    "Why can **parallelStream** corrupt results on an **ArrayList**?",
    "**ArrayList** is not thread-safe for writers while readers iterate. **parallelStream** splits work across **ForkJoinPool** threads; concurrent mutation triggers **ArrayIndexOutOfBoundsException** or silent corruption. Use **ConcurrentHashMap** values or copy the list first. Proof is a stress test plus **jcmd** **Thread.print** showing **ForkJoinPool** worker frames.",
    "parallel streams and lists"
  ),
  conceptualEntry(
    "How does **Comparator.comparing** improve readability?",
    "It packages key extractors and **null** handling helpers so sort logic reads like product language. Chaining **thenComparing** encodes tie-breakers without nested ternaries. Production bugs from manual **compareTo** often come from forgotten **null** cases; **nullsFirst** fixes that story. Mixing **comparingInt** avoids boxing surprises in hot sorts.",
    "Comparator chains"
  ),
  conceptualEntry(
    "When should you prefer a named **class** over a **lambda** in **Spring** beans?",
    "Framework proxies and **serialization** sometimes need stable types. **Serializable** **lambdas** embed unstable names across releases. **Spring** scoped beans carrying **lambda** state risk **ClassCastException** after redeploys. Replace with a small **class** implementing **Function** and document thread safety.",
    "framework lambdas"
  ),
  conceptualEntry(
    "How do **Optional** methods use **lambdas** safely?",
    "**map**, **flatMap**, and **ifPresent** take **Function** or **Consumer** implementations. Avoid **Optional.get** without **isPresent**; prefer **final** mapping chains that return new **Optional** values. Misuse surfaces as **NoSuchElementException** in edge cases that only hit certain tenants.",
    "Optional chains"
  ),
  conceptualEntry(
    "What does **Function.compose** versus **andThen** express?",
    "**compose** applies the argument **Function** before the outer one; **andThen** applies after. They encode data-flow direction without extra variables. Confusing the order yields subtle **DTO** mapping bugs that unit tests miss when fixtures are symmetric. Draw arrows on a whiteboard during design reviews.",
    "function composition order"
  ),
  conceptualEntry(
    "Why do **virtual** threads change how you audit **lambda** bodies?",
    "**Virtual** threads are cheap, so teams fire **Runnable** **lambdas** by the million. Any **synchronized** block inside those bodies can pin a carrier **thread**, spiking latency without classic thread-pool exhaustion. **Java 21** guidance is to replace **synchronized** with **ReentrantLock** on hot paths or narrow critical sections. Diagnose with **jcmd** thread dumps that mention pinned stacks.",
    "virtual thread pinning"
  ),
  conceptualEntry(
    "How do you defend **Metaspace** investigations tied to **lambda** linkage?",
    "Each unique **lambda** shape contributes to class metadata until classes unload. Dev servers with hot reload generate many **MethodHandle** graphs; **Metaspace** grows slowly then fails with **OutOfMemoryError**. Capture **jcmd** **VM.metaspace** before and after reload cycles. Production fix is class loader hygiene or disabling reckless reload plugins.",
    "Metaspace churn"
  ),
  conceptualEntry(
    "What is your **Staff**-level story for **LinkageError** after a **fat** **JAR** upgrade?",
    "**LinkageError** means the **JVM** could not resolve a **method** handle target your **lambda** expects, often because relocation renamed packages or stripped **NestMembers** metadata. You diff **javap -v** between releases and search **BootstrapMethods** for dangling constants. You fix shade rules or split modules so **invoke** packages stay intact. This is not a **lambda** syntax bug; it is packaging hygiene.",
    "shaded fat jars"
  ),
];

const CODE_BASED = [
  {
    question:
      "What does this print?\n```java\nimport java.util.function.*;\npublic class A {\n  static void run(Consumer<Integer> c, Supplier<Integer> s) {\n    c.accept(s.get());\n  }\n  public static void main(String[] a) {\n    int[] box = { 1 };\n    run(x -> box[0] += x, () -> 2);\n    System.out.println(box[0]);\n  }\n}\n```",
    answer:
      "Prints 3 because **Consumer** runs after **Supplier** supplies 2, mutating the **int** array through the captured reference. **Lambda** capture copies the array reference, not the primitive slot, so mutation is legal. At **bytecode** level the **lambda** is a **synthetic** method that loads **box** and updates index 0. There is no **autoboxing** trick here, just shared mutable state.",
    followUps: [],
  },
  {
    question:
      "What does this print?\n```java\nimport java.util.*;\npublic class B {\n  public static void main(String[] a) {\n    List<String> xs = Arrays.asList(\"b\",\"a\");\n    xs.sort(String::compareTo);\n    System.out.println(xs);\n  }\n}\n```",
    answer:
      "Prints **[a, b]** because **String::compareTo** is an unbound **instance** **method** **reference** feeding **Comparator**. **sort** uses merge/tim sort with that ordering. No new **String** objects are allocated; only reordering happens. This pattern is preferred over manual **compareTo** lambdas for readability.",
    followUps: [],
  },
  {
    question:
      "What does this print?\n```java\ninterface I { int get(); }\npublic class C {\n  static I twice(I i) { return () -> i.get() * 2; }\n  public static void main(String[] a) {\n    int[] v = { 3 };\n    I base = () -> v[0];\n    System.out.println(twice(base).get());\n    v[0] = 5;\n    System.out.println(base.get());\n  }\n}\n```",
    answer:
      "**twice** builds a new **SAM** that closes over **base**, not over the current **int** value. First line prints 6, second prints 5 because **base** still reads **v[0]** each call. This shows **lambda** capture is by reference to effective values, not deep snapshots of primitives inside arrays. Misreading that causes flaky pipeline math.",
    followUps: [],
  },
  {
    question:
      "Does this compile?\n```java\nimport java.util.function.*;\npublic class D {\n  public static void main(String[] a) {\n    int x = 1;\n    Runnable r = () -> System.out.println(x);\n    x = 2;\n    r.run();\n  }\n}\n```",
    answer:
      "No. **x** is not **effectively final** because it is reassigned after the **lambda** is created; **javac** rejects it. If **x** stayed final, the program would compile and print **1** at capture time versus print time depending on whether the body reads **x** directly—here it would read the final value. Teams fix this with **final int** copy or **AtomicInteger**.",
    followUps: [],
  },
  {
    question:
      "What does this print?\n```java\nimport java.util.stream.*;\npublic class E {\n  public static void main(String[] a) {\n    Stream<Integer> s = Stream.of(1,2,3);\n    System.out.println(s.count() + s.count());\n  }\n}\n```",
    answer:
      "Throws **IllegalStateException: stream has already been operated upon or closed** because **count** is **terminal** and the second call reuses the spent **Stream**. Fix with **Stream.of(...)** twice or **Arrays.stream** inside a **Supplier**. This is a classic production footgun when metrics code logs mid-pipeline.",
    followUps: [],
  },
  {
    question:
      "What does this print?\n```java\npublic class F {\n  public static void main(String[] a) {\n    java.util.function.Function<String,String> f = String::toUpperCase;\n    System.out.println(f.apply(\"java\"));\n  }\n}\n```",
    answer:
      "Prints **JAVA** using an unbound **instance** **method** **reference** interpreted as **Function**. **apply** passes the argument as the receiver. **HotSpot** still allocates nothing beyond the **Functional** wrapper already created by **invokedynamic** linkage.",
    followUps: [],
  },
  {
    question:
      "What does this print?\n```java\nimport java.util.*;\nimport java.util.function.*;\npublic class G {\n  public static void main(String[] a) {\n    Predicate<String> p = s -> s.length() > 0;\n    p = p.negate().or(x -> x.equals(\"!\"));\n    System.out.println(p.test(\"\") + \" \" + p.test(\"!\"));\n  }\n}\n```",
    answer:
      "Prints **true false** roughly: negated predicate is false only on non-empty unless **or** allows \"!\". Work through **negate** then **or**: empty string fails original (**false** length), negated is **true**. For \"!\", length >0 so base true, negate false, **or** with equals \"!\" -> true? Careful: actually empty: length>0 false, negate true -> **true**; for \"!\": length>0 true, negate false, second clause true => **true**. Recalculate: \"\" => base false, neg true => true. \"!\" => base true, neg false, or with equals -> true. Adjusted answer prints **true true** — verify manually; if wrong fix in JSON after run. (Script author: simplify question in MCQ; for JSON we need correct output.)",
    followUps: [],
  },
  {
    question:
      "What does this print?\n```java\nimport java.util.*;\npublic class H {\n  public static void main(String[] a) {\n    List<Integer> xs = Arrays.asList(2,1,3);\n    xs.sort(Comparator.naturalOrder());\n    System.out.println(xs);\n  }\n}\n```",
    answer:
      "Prints **[1, 2, 3]** because **naturalOrder** builds a **Comparator** using **compareTo** on **Integer**. **Arrays.asList** supports **sort** by delegating to **Array** merge sort. Autoboxing already happened when the list was built.",
    followUps: [],
  },
];

// Fix G answer - replace with simpler codeBased question to avoid error
CODE_BASED[6] = {
  question:
    "What does this print?\n```java\nimport java.util.function.*;\npublic class G2 {\n  public static void main(String[] a) {\n    Function<Integer, Integer> f = x -> x + 1;\n    Function<Integer, Integer> g = f.compose(y -> y * 2);\n    System.out.println(g.apply(3));\n  }\n}\n```",
  answer:
    "**compose** applies the inner **Function** first: **3 * 2 = 6**, then **6 + 1 = 7**, so it prints **7**. Order matters: **andThen** would add before multiply. **bytecode** still uses **invokedynamic** for both **lambda** bodies.",
  followUps: [],
};

const SENIOR_SCENARIO = [
  {
    question:
      "Payments staging throws **IllegalStateException: stream has already been operated upon** after you add a metrics **peek**; only EU tenants hit it.",
    answer: `**Immediate response:** Reproduce with the EU CSV in a **main** harness locally, then capture **jcmd** **Thread.print** on a staging pod to confirm the faulting frame is **java.util.stream** and not JDBC. Save the thread dump beside **java -version** from the pod so reviewers know whether you are on **Java 17** or **Java 21** **virtual** thread carriers.

**Root cause:** A **Stream** reference from the ingestion pipeline is being **counted** for metrics and then reused for transformation. **Terminal** operations close the pipeline; the second pass throws **IllegalStateException** once real data crosses two terminals. The **JVM** is behaving exactly as **java.util.stream** documents; the defect is object lifetime in application code.

**Fix:** Build the **Stream** twice from the **Supplier** \`() -> Files.lines(path)\` or materialize to **List** once if memory allows. Add an integration test that calls the service method twice with the same payload. If you need proof for leadership, run **javap -v** on the service class only when you suspect a generated **spliterator**, otherwise skip bytecode theatre.

**Prevention:** Code review checklist bans stored **Stream** fields. Add **ArchUnit** or simple regex checks that fail when **Stream** is assigned to **instance** fields without **Supplier** wrappers. Document the decision in the service README so new hires do not resurrect the double-**count** pattern.

Closing the loop at Staff depth means you treat **Stream** like a disposable iterator, not a reusable collection. When finance asks why tests missed it, you show that fixtures never exercised the million-row path and you ship a load test budget tied to that tenant profile. You also verify **Metaspace** remained stable because this bug class is unrelated to **lambda** **linkage**, which prevents the team from chasing the wrong **JVM** flag during panic tuning.`,
    followUps: [],
  },
  {
    question:
      "**jstack** on **Java 21** shows carrier threads blocked while **virtual** threads multiply during a **parallelStream** on a shared **ArrayList**.",
    answer: `**Immediate response:** Capture **jcmd** **Thread.print -e** output and diff **ForkJoinPool** worker stacks against **virtual** thread carriers; screenshot frames with **ArrayList** **add** next to **Spliterator**.

**Root cause:** **parallelStream** assumes a **thread-safe** source or read-only data. Writers concurrently modify **ArrayList** internals while the spliterator walks backing storage, causing torn index updates that surface as **ArrayIndexOutOfBoundsException** or silent corruption.

**Fix:** Switch to **CopyOnWriteArrayList**, synchronize mutations, or copy the list under lock before **parallel** processing. Prefer **IntStream.range** over parallelizing tiny lists. Prove with a **jcstress**-style hammer test.

**Prevention:** Document **parallelStream** policy in the service README and block PRs that call it on DAO results without immutability proof.

Staff closure: once the list is immutable or copied, re-run **jcmd** **JFR.start** to prove **ForkJoinPool** steal rates justify the complexity. If steals stay flat, you just paid for threads that shuffle corrupted indexes. Tie the postmortem to **Java 21** **virtual** thread adoption so leadership sees why carrier pinning and **ArrayList** races are different failure classes that share noisy dashboards. Publish a one-page decision tree: **parallel** only when source is **Concurrent** or snapshot-isolated, otherwise sequential pipelines win on clarity and safety.

Carrier noise can mislead you: **Java 21** carriers may look busy while mounts of **virtual** threads queue behind a **synchronized** block, and that pattern is not the same root cause as **ArrayList** internal corruption. Keep both hypotheses on the whiteboard until **jcmd** **Thread.print** shows whether hot frames are **ForkJoinPool** steal loops, **ArrayList** growth, or pinned carriers. After the list is safe, re-benchmark **sequential** versus **parallel** on production-sized inputs; modest lists often favor **sequential** clarity over tiny wall-clock wins, which is an easy story for stakeholders who fear another race.`,
    followUps: [],
  },
  {
    question:
      "After a **Maven Shade** upgrade, **LinkageError: bad receiver type** appears only in **lambda** heavy modules.",
    answer: `**Immediate response:** Download the fat **JAR** from artifactory and run **javap -v -p** on the class cited in the stack; paste **BootstrapMethods** into the incident channel. Compare the same class from the last known good build so the diff is obvious to every reviewer, not just bytecode specialists.

**Root cause:** Relocation rules rewrote packages referenced by **invokedynamic** bootstrap arguments but did not update **NestHost** or **MethodHandle** constants consistently, so **LambdaMetafactory** cannot link. This is packaging interacting with **Java 8+** **lambda** machinery, not a business rule regression.

**Fix:** Exclude **invoke** or **lambda** generating packages from relocation, or stop shading that module. Rebuild thin **JARs** for library consumers. Redeploy to staging with **java -verbose:class** smoke tests to catch early **LinkageError** before touching production traffic.

**Prevention:** CI diff of **javap -v** bootstrap sections between releases for every shaded artifact. Add a release checklist item: "Shade diff reviewed by engineer who understands **invokedynamic**."

Longer lesson: teams assume shading only hurts reflection-heavy frameworks, but **lambda** call sites are equally sensitive because **MethodHandle** constants embed descriptors. A Staff answer names **LambdaMetafactory** explicitly and ties the failure to **ConstantPool** entries, which stops endless rollbacks of innocent library bumps. After the fix ships, you run the same **javap** diff in **staging** and **production** canaries so release management sees objective evidence, not tribal memory. You also log **java -version** beside every fat **JAR** filename so support can tell which artifact regressed when multiple trains overlap.`,
    followUps: [],
  },
  {
    question:
      "Profiler shows hot spots in **LambdaForm** frames after upgrading to **Java 17**; CPU is flat but latency grows.",
    answer: `**Immediate response:** Run **async-profiler** or **jcmd** **JFR.start** for sixty seconds on a canary, then open flame graphs filtered to **java.lang.invoke** packages. Capture **java -version** and **VM.flags** so **GC** differences do not pollute your comparison across pods.

**Root cause:** Extra reflective checks or defensive **MethodHandle** guards triggered by **strong encapsulation** can increase linkage overhead when frameworks generate many distinct **lambdas** per request. **Java 17** tightened illegal access compared with **Java 11**, so frameworks that probe JDK internals pay more per request even when **bytecode** looks unchanged.

**Fix:** Cache **Function** instances, reuse **MethodHandles**, or upgrade the framework version that adopted **Java 17** friendly patterns. Add **--add-opens** only with security review and on-call owners. Compare request latency with and without the upgrade on identical traffic replay.

**Prevention:** Cap dynamic **lambda** generation in hot paths; prefer static **MethodReferences** where possible. Require load tests that mirror login storms where per-request **lambda** counts spike.

**Stakeholder story:** this is not random slowness; it is **invokedynamic** amplification from framework reflection. Proof is flame graphs, not finger-pointing at **G1**.

Runbook note: archive the before-and-after flame graphs in the ticket, link the **Gradle** or **Maven** dependency diff, and schedule a follow-up to remove temporary **--add-opens** lines with a tracked deadline so security stays satisfied.`,
    followUps: [],
  },
  {
    question:
      "Session replication fails on **Tomcat** after developers store **Serializable** **lambdas** in **Spring** **session** attributes.",
    answer: `**Immediate response:** Turn on **session** serialization logging, capture **NotSerializableException** with the synthetic **lambda** class name, and identify the attribute key from stack frames. Pair that with **jcmd** **Thread.print** if the failure only happens during concurrent session migration across **Tomcat** nodes.

**Root cause:** **Synthetic** **lambda** classes are not a stable **serialization** contract across **JDK** minor versions; **readResolve** expectations fail after restart. **Java** does not promise that **lambda** bodies survive cluster round-trips the way normal **DTO** classes do.

**Fix:** Replace **lambda** fields with named **static** **classes** implementing **Serializable** **Function** or store plain **DTO** snapshots. Add a **session** migration checklist and regression test that serializes a mock **HttpSession** map in CI.

**Prevention:** Ban anonymous **lambdas** in **Serializable** **Spring** beans via **Error Prone** or custom **ArchUnit** checks. Document why in the wiki so product understands this is not arbitrary dogma.

Longer Staff angle: whenever you see **NotSerializableException** referencing **$$Lambda**, assume the fix is a named **class** with a **serialVersionUID** and explicit fields. Attach **javap -p** of the replacement class to the ticket so reviewers see a stable type on disk. Run a blue-green fail-over test that serializes sessions on **Java 17** nodes and hydrates them on **Java 21** nodes, because minor behavioral differences still appear in edge **readObject** paths. Keep a spreadsheet of **session** attribute keys allowed for replication so product cannot stash ad-hoc callbacks without review.`,
    followUps: [],
  },
  {
    question:
      "Finance demands **deterministic** nightly totals but engineers added **parallelStream** 'for speed' on ledger lines.",
    answer: `**Immediate response:** Pause the deploy, rerun the job with **ForkJoinPool.commonPool** parallelism set to **1** in staging, and compare totals to sequential output. Log **java -version** on the batch host because **Java 17** **Math** tweaks can magnify tiny ordering differences.

**Root cause:** **Floating** point combine order changed with parallel splits, or side effects inside **forEach** raced, producing non-deterministic accumulation even without exceptions. Auditors do not care about your **lambda** elegance; they care that debits equal credits every night.

**Fix:** Remove **parallel**, or switch to **Long** accumulators with **reduce** that is associative and side-effect free. Document numeric tolerances if **BigDecimal** rounding must differ, and get finance sign-off in writing.

**Prevention:** Require **property-based** tests that compare parallel vs sequential results for aggregation nightly jobs. Add alerts when totals diverge beyond a single cent.

Teaching beat: **parallelStream** is not a free speed button for money math. If you need Staff credibility, quote the **JLS** associativity requirement and show **jcmd** **JFR** evidence that **parallel** saved fewer CPU seconds than it risked in reconciliation errors. Roll the deterministic job back to **stream** sequential in **prod**, then schedule a performance office hours where engineers learn to prove speedups before merging. Finally, add a finance sign-off checklist so nobody re-enables **parallel** during release freeze week without CFO awareness.`,
    followUps: [],
  },
];

const WRONG_ANSWERS = [
  "You should always use **parallelStream** because it makes every pipeline faster on modern CPUs.",
  "**Lambda** bodies are guaranteed **thread-safe** because the syntax is modern.",
  "Storing a **Stream** in a **field** for reuse is fine as long as you never call **close** yourself.",
  "**Method** **references** never allocate, so they are free at runtime.",
  "You can throw any **checked** **exception** out of a **java.util.function.Consumer** **lambda** without wrapping.",
  "**peek** is the right place to charge customers because it runs for every element exactly once.",
  "**invokedynamic** means lambdas are interpreted slowly like **JavaScript**.",
  "**Serializable** **lambdas** are stable across **JDK** upgrades and safe for **Hibernate** entities.",
];

const JOB_SWITCH = {
  resumeBullet:
    "Replaced unsafe parallelStream usage on mutable DTO lists across 6 services, eliminating race crashes and restoring deterministic totals.",
  interviewPositioning:
    "When I join a team I map every **Stream** **terminal** in payment modules in week one, then align on a **Supplier** pattern where reuse is needed. I show **javap -v** bootstrap diffs when linkage regressions appear so nobody blames business rules first.",
  starAnchor:
    "Our invoicing job started throwing **IllegalStateException** after a metrics PR double-passed **Stream** pipelines whenever European files exceeded 50k lines. I reproduced in isolation, split pipelines with a **List** materialization step, and added CI tests that call the extractor twice. Incidents dropped to zero for three quarters and finance signed off on latency unchanged at p95 1.8s.",
};

const MCQ_QUESTIONS = []; // filled below
let mid = 1;
function mq(id, level, category, question, opts, ans, expl) {
  MCQ_QUESTIONS.push({ id, level, category, question, options: opts, answer: ans, explanation: expl });
}

mq(
  mid++,
  "basic",
  "theory",
  "What does a **functional** **interface** require?",
  { A: "Two abstract methods", B: "Exactly one abstract method", C: "Only default methods", D: "No methods" },
  "B",
  "SAM types power **lambda** target typing. Extra abstract methods break **lambda** assignment unless **Intersection** tricks appear, which is rare in interviews."
);
mq(
  mid++,
  "basic",
  "theory",
  "Which API typically takes a **Predicate**?",
  { A: "**Stream.map**", B: "**Stream.filter**", C: "**Stream.flatMap**", D: "**Collectors.joining**" },
  "B",
  "**filter** tests elements; **map** needs **Function**."
);
mq(
  mid++,
  "basic",
  "theory",
  "What does **String::trim** represent?",
  { A: "A **Supplier**", B: "An unbound **instance** **method** **reference** used as **Function**", C: "A **Constructor** reference", D: "A **Comparator**" },
  "B",
  "First argument becomes receiver for **trim**."
);
mq(
  mid++,
  "basic",
  "theory",
  "Why must captured locals be **effectively final**?",
  { A: "To help GC", B: "So concurrent bodies see stable values", C: "Because **JVM** forbids ints", D: "No reason; it is stylistic" },
  "B",
  "**javac** enforces safe capture semantics across threads."
);
mq(
  mid++,
  "basic",
  "code-reading",
  "What prints?\n```java\nRunnable r = () -> System.out.print(\"x\");\nr.run();\n```",
  { A: "Compile error", B: "x", C: "y", D: "Throws **NullPointerException**" },
  "B",
  "**Runnable** **run** invokes **lambda** body."
);
mq(
  mid++,
  "basic",
  "code-reading",
  "What prints?\n```java\njava.util.function.Supplier<Double> s = () -> 2.0;\nSystem.out.println(s.get() + 1);\n```",
  { A: "21", B: "3.0", C: "31", D: "Compile error" },
  "B",
  "**Double** autobox adds with **int** promotes to **double**."
);
mq(
  mid++,
  "basic",
  "code-reading",
  "Does **Arrays.asList(1,2).stream().count()** compile?",
  { A: "No", B: "Yes", C: "Only on **Java 7**", D: "Only inside **enum**" },
  "B",
  "**List** exposes **stream** since **Java 8**."
);
mq(
  mid++,
  "basic",
  "real-world",
  "You need a no-arg factory for **ArrayList**; best **Supplier** usage?",
  { A: "**ArrayList::new**", B: "**new ArrayList** without **Supplier**", C: "**System::gc**", D: "**String::new**" },
  "A",
  "Constructor reference matches **Supplier** shape."
);
const codeQ = (id, lvl, cat, q, a) => mq(id, lvl, cat, q, { A: "0", B: "1", C: "2", D: "Compile error" }, a, "Work it mechanically; watch generics and **SAM** fit.");

codeQ(mid++, "intermediate", "code-reading", "What prints?\n```java\nimport java.util.*;\npublic class X {\n public static void main(String[] a){\n  List<String> xs = Arrays.asList(\"a\",\"b\");\n  Collections.sort(xs, String::compareToIgnoreCase);\n  System.out.println(xs.get(0));\n }\n}\n```", "A");
codeQ(mid++, "intermediate", "code-reading", "Value of **Comparator.comparing(String::length).compare(\"aa\",\"bbb\")**?", { A: "Negative", B: "Positive", C: "Zero", D: "Error" }, "A", "Shorter string sorts first with natural **Integer** compare.");

// Fix codeQ misuse - the function was wrong. Replace with proper intermediate batch manually
MCQ_QUESTIONS.pop();
MCQ_QUESTIONS.pop();

mq(
  mid++,
  "intermediate",
  "code-reading",
  "What prints?\n```java\nimport java.util.*;\npublic class X {\n public static void main(String[] a){\n  List<String> xs = Arrays.asList(\"b\",\"A\");\n  xs.sort(String.CASE_INSENSITIVE_ORDER);\n  System.out.println(xs.get(0));\n }\n}\n```",
  { A: "A", B: "b", C: "Compile error", D: "Throws" },
  "A",
  "**CASE_INSENSITIVE_ORDER** treats **A** before **b**."
);
mq(
  mid++,
  "intermediate",
  "code-reading",
  "Does this compile?\n```java\nimport java.util.function.*;\nclass Y { static Function<String,String> f = s -> s + s; }\n```",
  { A: "Yes", B: "No", C: "Only with **var**", D: "Only in **enum**" },
  "A",
  "**static** field **lambda** is allowed with **target** type **Function**."
);
mq(
  mid++,
  "intermediate",
  "theory",
  "Which is true about **invokedynamic** and **lambdas**?",
  {
    A: "Every **lambda** becomes its own **class** file on disk every time",
    B: "**LambdaMetafactory** participates in linkage",
    C: "**invokedynamic** is only for dynamic languages",
    D: "**javac** ignores **lambda** types",
  },
  "B",
  "**Bootstrap** methods wire **CallSite** objects."
);
mq(
  mid++,
  "intermediate",
  "theory",
  "Best fix for **checked** **IOException** inside **Stream.map**?",
  { A: "Add **throws** on **lambda**", B: "Wrap with **UncheckedIOException** or refactor IO boundary", C: "Use **parallelStream**", D: "Call **System.exit**" },
  "B",
  "**Function** cannot declare checked throws."
);
mq(
  mid++,
  "intermediate",
  "theory",
  "**Method** **reference** **System.out::println** has which **functional** type in **forEach**?",
  { A: "**Consumer**", B: "**Function**", C: "**Supplier**", D: "**Runnable**" },
  "A",
  "**forEach** expects **Consumer**."
);
mq(
  mid++,
  "intermediate",
  "real-world",
  "Team stores **Stream\<String\>** in a **Spring** bean field for reuse. Risk?",
  { A: "None", B: "**IllegalStateException** on second pass", C: "Faster startup", D: "**GC** stops" },
  "B",
  "**Stream** is single-use."
);
mq(
  mid++,
  "intermediate",
  "real-world",
  "You need stable ordering under nulls. Best **Comparator** helper?",
  { A: "**Comparator.reverseOrder** alone", B: "**Comparator.nullsFirst** combined with another **Comparator**", C: "**parallelStream**", D: "**Object::hashCode**" },
  "B",
  "Null unsafe sorts throw **NPE**."
);
mq(
  mid++,
  "intermediate",
  "code-reading",
  "Output?\n```java\nimport java.util.stream.*;\npublic class Z {\n public static void main(String[] a){\n  System.out.println(Stream.of(1,2,3).map(i->i+1).findFirst().orElse(0));\n }\n}\n```",
  { A: "1", B: "2", C: "3", D: "0" },
  "B",
  "First mapped element is **2**."
);
mq(
  mid++,
  "intermediate",
  "code-reading",
  "Output?\n```java\nimport java.util.function.*;\npublic class W {\n public static void main(String[] a){\n  Predicate<String> p = String::isEmpty;\n  System.out.println(p.negate().test(\"\"));\n }\n}\n```",
  { A: "true", B: "false", C: "error", D: "throws" },
  "B",
  "Empty string tests true, negate makes **false**."
);
mq(
  mid++,
  "intermediate",
  "theory",
  "Which **BiFunction** signature fits **Map.compute** style lambdas?",
  {
    A: "(T,U) -> R using **BiFunction**",
    B: "() -> void",
    C: "boolean test(T)",
    D: "Supplier only",
  },
  "A",
  "**BiFunction** accepts two arguments and returns a value."
);
mq(
  mid++,
  "intermediate",
  "code-reading",
  "Output?\n```java\nimport java.util.function.*;\npublic class BB {\n public static void main(String[] a){\n  IntUnaryOperator f = x -> x * 2;\n  System.out.println(f.applyAsInt(3));\n }\n}\n```",
  { A: "6", B: "9", C: "33", D: "Compile error" },
  "A",
  "**IntUnaryOperator** avoids **Integer** boxing in simple math."
);
mq(
  mid++,
  "intermediate",
  "real-world",
  "You need idempotent HTTP callbacks; storing **Runnable** lambdas in a DB column is risky because?",
  {
    A: "It always works",
    B: "**Runnable** cannot be serialized safely as ad-hoc lambdas",
    C: "**GC** deletes lambdas instantly",
    D: "**JVM** forbids **Runnable**",
  },
  "B",
  "Persist command names or stable classes, not captured bytecode."
);

for (let i = 0; i < 10; i++) {
  const id = mid++;
  const adv = [
    {
      lvl: "advanced",
      cat: "theory",
      q: "Your **fat** **JAR** job fails with **LinkageError** referencing **LambdaMetafactory** after shade relocation. First suspect?",
      o: { A: "Bad CSV", B: "**MethodHandle** constants broken by relocation", C: "Need more **Xmx**", D: "Timezone bug" },
      a: "B",
      e: "Fix relocation excludes for **invoke** packages.",
    },
    {
      lvl: "advanced",
      cat: "theory",
      q: "**Java 21** **virtual** threads show carrier pinning. Likely **lambda** pattern?",
      o: { A: "**synchronized** inside hot **lambda**", B: "Using **String** concat", C: "**final** locals", D: "**Comparator.naturalOrder**" },
      a: "A",
      e: "Replace with **ReentrantLock** or narrow lock.",
    },
    {
      lvl: "advanced",
      cat: "code-reading",
      q: "Behavior?\n```java\nimport java.util.concurrent.*;\nimport java.util.function.*;\npublic class AA {\n public static void main(String[] a) throws Exception {\n  ExecutorService ex = Executors.newSingleThreadExecutor();\n  Supplier<Integer> sup = () -> 1;\n  ex.submit(() -> System.out.println(sup.get()));\n  ex.shutdown(); ex.awaitTermination(1, TimeUnit.SECONDS);\n }\n}\n```",
      o: { A: "Prints 1", B: "Hangs forever", C: "**RejectedExecutionException**", D: "Compile error" },
      a: "A",
      e: "**lambda** captures **Supplier** and runs on pool thread.",
    },
    {
      lvl: "advanced",
      cat: "code-reading",
      q: "Danger in **list.parallelStream().forEach(i -> shared.add(i))** with **ArrayList** **shared**?",
      o: { A: "Safe", B: "Race corrupts **ArrayList**", C: "Only on **Java 11**", D: "Only if list empty" },
      a: "B",
      e: "Use **synchronized** collection or collector.",
    },
    {
      lvl: "advanced",
      cat: "on-call or architecture",
      q: "After deploy **Metaspace** grows until **OOM** on dev servers with hot reload. Best mitigation?",
      o: { A: "Add more **-Xmx** only", B: "Disable reckless reload or fix class loaders", C: "**System.gc** hourly", D: "Use **parallelStream**" },
      a: "B",
      e: "Class metadata leaks from reloaders.",
    },
    {
      lvl: "advanced",
      cat: "on-call or architecture",
      q: "Finance job non-deterministic after **parallelStream** **reduce** on **double** sums. Fix?",
      o: { A: "Increase pool size", B: "Go sequential or use **BigDecimal** associative folding with order docs", C: "Add **Thread.sleep**", D: "Ignore" },
      a: "B",
      e: "**Floating** point addition order matters.",
    },
    {
      lvl: "advanced",
      cat: "on-call or architecture",
      q: "Synthetic **lambda** class inside **session** serialization fails after patch Tuesday. Policy?",
      o: { A: "Store more **lambdas**", B: "Named **Serializable** classes for callbacks", C: "Disable HTTPS", D: "Use **Raw** types" },
      a: "B",
      e: "**Lambda** classes are not a stable contract.",
    },
    {
      lvl: "advanced",
      cat: "on-call or architecture",
      q: "**Profiler** shows **ForkJoinPool** hot under CSV ingest. First isolation step?",
      o: { A: "Buy bigger hosts", B: "Temporarily force **sequential** and compare throughput", C: "Delete unit tests", D: "Downgrade **JDK**" },
      a: "B",
      e: "Prove excess **parallel** is the cause.",
    },
    {
      lvl: "advanced",
      cat: "on-call or architecture",
      q: "API exposes **Function** returning **DTO** built with IO inside **lambda**. Review comment?",
      o: { A: "Ship faster", B: "Move IO to service layer; keep **lambda** pure", C: "Add **@Transactional** on **lambda**", D: "Use **peek**" },
      a: "B",
      e: "Side effects belong at boundaries.",
    },
    {
      lvl: "advanced",
      cat: "on-call or architecture",
      q: "Choosing between **method** **reference** **this::helper** versus **static** helper for **public** API?",
      o: { A: "**this::** always", B: "**static** helper when you need stable stack traces and test seams", C: "Always nest five **lambdas**", D: "Use reflection" },
      a: "B",
      e: "Clarity beats golf on shared surfaces.",
    },
  ][i];
  mq(id, adv.lvl, adv.cat, adv.q, adv.o, adv.a, adv.e);
}

const BASIC_CODE =
  [
    "package arch.day29;",
    "",
    "/** println-only lambda + SAM reference card */",
    "public class Day29Basic {",
    "",
    "    public static void main(String[] args) {",
    "        // Table: you must know which SAM you are implementing before syntax helps.",
    "        System.out.println(\"=== Core SAM table ===\");",
    "        System.out.println(\"Runnable      | run()          | side-effect, no IO return\");",
    "        System.out.println(\"Supplier<T>   | get()          | lazy factory\");",
    "        System.out.println(\"Consumer<T>   | accept(T)      | forEach / sinks\");",
    "        System.out.println(\"Function<T,R> | apply(T)->R    | map transforms\");",
    "        System.out.println(\"UnaryOperator<T> | apply(T)->T   | replaceAll style maps\");",
    "        System.out.println(\"Predicate<T>  | test(T) boolean| filter\");",
    "        System.out.println(\"BinaryOperator<T> | apply two Ts | reduce combiners\");",
    "        System.out.println();",
    "        // Week-one commands: prove sugar is linked, not magic.",
    "        System.out.println(\"=== How to use it (commands) ===\");",
    "        System.out.println(\"javap -v MyClass.class    see BootstrapMethods / invokedynamic\");",
    "        System.out.println(\"javap -p MyClass.class    list lambda synthetics\");",
    "        System.out.println(\"java -version             LTS behavior for virtual threads\");",
    "        System.out.println(\"jcmd <pid> Thread.print   peel lambda frames / pinning\");",
    "        System.out.println(\"javac --release 17        match CI SAM APIs\");",
    "        System.out.println(\"jshell                    quick SAM experiments\");",
    "        System.out.println(\"jcmd <pid> VM.flags     quick heap flag sanity on batch JVMs\");",
    "        System.out.println();",
    "        // Symptoms seniors recognize before blaming data feeds.",
    "        System.out.println(\"=== Beginner mistakes (symptoms) ===\");",
    "        System.out.println(\"IllegalStateException   | stream reused after terminal\");",
    "        System.out.println(\"effectively final error | mutated capture variable\");",
    "        System.out.println(\"ArrayIndexOutOfBounds   | parallelStream on mutating ArrayList\");",
    "        System.out.println(\"LinkageError            | broken MethodHandle after shade\");",
    "        System.out.println(\"NotSerializableException| session stored synthetic lambda\");",
    "        System.out.println(\"LambdaForm in flames     | churned MethodHandles | cache Function\");",
    "        System.out.println();",
    "        System.out.println(\"=== Remember this ===\");",
    "        System.out.println(\"one Stream terminal per object | use Supplier for replays\");",
    "        System.out.println(\"method refs need arity match  | else use lambda\");",
    "        System.out.println(\"parallel needs safe sources  | else sequential\");",
    "        System.out.println(\"eof\");",
    "    }",
    "}",
    "",
  ].join("\n");

const BASIC_OUTPUT = [
  "=== Core SAM table ===",
  "Runnable      | run()          | side-effect, no IO return",
  "Supplier<T>   | get()          | lazy factory",
  "Consumer<T>   | accept(T)      | forEach / sinks",
  "Function<T,R> | apply(T)->R    | map transforms",
  "UnaryOperator<T> | apply(T)->T   | replaceAll style maps",
  "Predicate<T>  | test(T) boolean| filter",
  "BinaryOperator<T> | apply two Ts | reduce combiners",
  "",
  "=== How to use it (commands) ===",
  "javap -v MyClass.class    see BootstrapMethods / invokedynamic",
  "javap -p MyClass.class    list lambda synthetics",
  "java -version             LTS behavior for virtual threads",
  "jcmd <pid> Thread.print   peel lambda frames / pinning",
  "javac --release 17        match CI SAM APIs",
  "jshell                    quick SAM experiments",
  "jcmd <pid> VM.flags     quick heap flag sanity on batch JVMs",
  "",
  "=== Beginner mistakes (symptoms) ===",
  "IllegalStateException   | stream reused after terminal",
  "effectively final error | mutated capture variable",
  "ArrayIndexOutOfBounds   | parallelStream on mutating ArrayList",
  "LinkageError            | broken MethodHandle after shade",
  "NotSerializableException| session stored synthetic lambda",
  "LambdaForm in flames     | churned MethodHandles | cache Function",
  "",
  "=== Remember this ===",
  "one Stream terminal per object | use Supplier for replays",
  "method refs need arity match  | else use lambda",
  "parallel needs safe sources  | else sequential",
  "eof",
  "",
].join("\n");

const INTERMEDIATE_CODE = [
  "package arch.day29;",
  "",
  "/** Four println scenarios for senior readers; every path names a diagnostic tool. */",
  "public class Day29Intermediate {",
  "",
  "    // Production teams often multiply terminals after adding observability; watch CI gap on big files.",
  "    // Dev velocity + streams: double terminal on same stream reference.",
  "    static void scenario1() {",
  "        System.out.println(\"--- Scenario 1: metrics lambda reuses Stream twice ---\");",
  "        System.out.println(\"symptom:  IllegalStateException stream already operated upon during nightly batch\");",
  "        System.out.println(\"cause:    second terminal on same java.util.stream.Stream reference\");",
  "        System.out.println(\"why:      terminals close pipelines; Stream is single-use by design\");",
  "        System.out.println(\"fix:      wrap source with Supplier<Stream> or collect to List once\");",
  "        System.out.println(\"lesson:   terminal closes stream — metrics need Supplier replay\");",
  "        System.out.println(\"context:  observability PR added count() before main map pass on same field\");",
  "        System.out.println(\"verify:   integration test that mirrors production CSV size\");",
  "        System.out.println(\"next:     grep for Stream fields stored in Spring beans\");",
  "        System.out.println();",
  "    }",
  "",
  "    // ForkJoinPool hides races until load; jcmd proves whether spliterator walked during mutation.",
  "    // Production: parallel + mutable ArrayList under concurrent writers.",
  "    static void scenario2() {",
  "        System.out.println(\"--- Scenario 2: parallel pipeline races shared ArrayList ---\");",
  "        System.out.println(\"symptom:  flaky ArrayIndexOutOfBoundsException in ForkJoinPool worker\");",
  "        System.out.println(\"cause:    parallelStream walked ArrayList while another thread resized backing array\");",
  "        System.out.println(\"why:     Spliterator assumes stable source during split iteration\");",
  "        System.out.println(\"fix:      copy-under-lock or use ConcurrentHashMap newKeySet style structures\");",
  "        System.out.println(\"lesson:   ArrayList buckets move under writers; spliterator assumes stability\");",
  "        System.out.println(\"diag:     jstack -e often noisy; prefer jcmd Thread.print -e for carrier vs worker\");",
  "        System.out.println(\"verify:   jcmd <pid> Thread.print shows ForkJoinPool next to ArrayList.add\");",
  "        System.out.println(\"next:     jcstress hammer on DAO results before enabling parallel\");",
  "        System.out.println();",
  "    }",
  "",
  "    // invoke/LambdaForm spikes are allocation + linkage; async-profiler differentiates them from GC pauses.",
  "    // Perf myth: nested lambdas allocating in hot JSON mapping loop.",
  "    static void scenario3() {",
  "        System.out.println(\"--- Scenario 3: profiler shows java.lang.invoke.LambdaForm hot ---\");",
  "        System.out.println(\"symptom:  CPU flat but p99 grows after microservice adds per-row lambdas\");",
  "        System.out.println(\"cause:    millions of distinct functional objects per request\");",
  "        System.out.println(\"why:      each captures unlike locals forcing new bootstrap linkage\");",
  "        System.out.println(\"fix:      hoist Function instances to static final fields reuse MethodHandles\");",
  "        System.out.println(\"lesson:   distinct captures defeat hotspot inlining for lambdas\");",
  "        System.out.println(\"context:  JSON row mapper allocates fresh Function per cell in nested loops\");",
  "        System.out.println(\"verify:   async-profiler flame graph collapsed to user packages\");",
  "        System.out.println(\"next:     compare javap -v bootstrap counts before/after refactor\");",
  "        System.out.println();",
  "    }",
  "",
  "    // Session replication turns language sugar into serialization contracts—use explicit types.",
  "    // Architecture: ban Serializable lambdas in HTTP session",
  "    static void scenario4() {",
  "        System.out.println(\"--- Scenario 4: session refresh blows after lambda stored in HttpSession ---\");",
  "        System.out.println(\"symptom:  NotSerializableException naming synthetic lambda class\");",
  "        System.out.println(\"cause:    cluster replication tries to serialize ad-hoc callbacks\");",
  "        System.out.println(\"why:      lambda classes lack stable serial forms across JDK builds\");",
  "        System.out.println(\"fix:      named static class implements Serializable Function\");",
  "        System.out.println(\"lesson:   synthetic lambda names are not a serialization ABI\");",
  "        System.out.println(\"diag:     grep HttpSession attribute keys for $$Lambda class names in logs\");",
  "        System.out.println(\"verify:   session serialization integration test in CI\");",
  "        System.out.println(\"next:     ArchUnit rule banning Serializable fields typed as lambdas\");",
  "        System.out.println();",
  "    }",
  "",
  "    public static void main(String[] args) {",
  "        System.out.println(\"banner: Day29Intermediate arch.day29\");",
  "        System.out.println(\"mode: println-only triage card — compile with javac --release 17\");",
  "        System.out.println();",
  "        scenario1();",
  "        scenario2();",
  "        scenario3();",
  "        scenario4();",
  "        System.out.println(\"eof: four scenarios complete — paste output beside jcmd captures\");",
  "    }",
  "}",
  "",
].join("\n");

const INTERMEDIATE_OUTPUT = [
  "banner: Day29Intermediate arch.day29",
  "mode: println-only triage card — compile with javac --release 17",
  "",
  "--- Scenario 1: metrics lambda reuses Stream twice ---",
  "symptom:  IllegalStateException stream already operated upon during nightly batch",
  "cause:    second terminal on same java.util.stream.Stream reference",
  "why:      terminals close pipelines; Stream is single-use by design",
  "fix:      wrap source with Supplier<Stream> or collect to List once",
  "lesson:   terminal closes stream — metrics need Supplier replay",
  "context:  observability PR added count() before main map pass on same field",
  "verify:   integration test that mirrors production CSV size",
  "next:     grep for Stream fields stored in Spring beans",
  "",
  "--- Scenario 2: parallel pipeline races shared ArrayList ---",
  "symptom:  flaky ArrayIndexOutOfBoundsException in ForkJoinPool worker",
  "cause:    parallelStream walked ArrayList while another thread resized backing array",
  "why:      Spliterator assumes stable source during split iteration",
  "fix:      copy-under-lock or use ConcurrentHashMap newKeySet style structures",
  "lesson:   ArrayList buckets move under writers; spliterator assumes stability",
  "diag:     jstack -e often noisy; prefer jcmd Thread.print -e for carrier vs worker",
  "verify:   jcmd <pid> Thread.print shows ForkJoinPool next to ArrayList.add",
  "next:     jcstress hammer on DAO results before enabling parallel",
  "",
  "--- Scenario 3: profiler shows java.lang.invoke.LambdaForm hot ---",
  "symptom:  CPU flat but p99 grows after microservice adds per-row lambdas",
  "cause:    millions of distinct functional objects per request",
  "why:      each captures unlike locals forcing new bootstrap linkage",
  "fix:      hoist Function instances to static final fields reuse MethodHandles",
  "lesson:   distinct captures defeat hotspot inlining for lambdas",
  "context:  JSON row mapper allocates fresh Function per cell in nested loops",
  "verify:   async-profiler flame graph collapsed to user packages",
  "next:     compare javap -v bootstrap counts before/after refactor",
  "",
  "--- Scenario 4: session refresh blows after lambda stored in HttpSession ---",
  "symptom:  NotSerializableException naming synthetic lambda class",
  "cause:    cluster replication tries to serialize ad-hoc callbacks",
  "why:      lambda classes lack stable serial forms across JDK builds",
  "fix:      named static class implements Serializable Function",
  "lesson:   synthetic lambda names are not a serialization ABI",
  "diag:     grep HttpSession attribute keys for $$Lambda class names in logs",
  "verify:   session serialization integration test in CI",
  "next:     ArchUnit rule banning Serializable fields typed as lambdas",
  "",
  "eof: four scenarios complete — paste output beside jcmd captures",
  "",
].join("\n");

const ADVANCED_CODE = [
  "package arch.day29;",
  "",
  "import java.util.*;",
  "import java.util.function.*;",
  "",
  "/** Lead/Staff triage matrix for lambda adoption */",
  "public class Day29Advanced {",
  "",
  "    record Posture(String topic, String rule, int riskScore) {}",
  "",
  "    public static void main(String[] args) {",
  "        System.out.println(\"=== Block 1: risk model ===\");",
  "        List<Posture> rows = new ArrayList<>();",
  "        rows.add(new Posture(\"Stream reuse\", \"one terminal\", 3));",
  "        rows.add(new Posture(\"parallel source\", \"immutable or concurrent\", 3));",
  "        rows.add(new Posture(\"session lambda\", \"named class\", 2));",
  "        rows.add(new Posture(\"invokedynamic shade\", \"exclude invoke pkgs\", 3));",
  "        rows.add(new Posture(\"virtual pin\", \"narrow synchronized\", 2));",
  "        rows.add(new Posture(\"checked IO in map\", \"lift IO boundary\", 3));",
  "        rows.add(new Posture(\"per-row lambda factory\", \"cache Function\", 3));",
  "        rows.sort(Comparator.comparingInt(Posture::riskScore));",
  "        for (Posture p : rows) {",
  "            System.out.println(p.topic() + \" | \" + p.rule() + \" | risk=\" + p.riskScore());",
  "        }",
  "        System.out.println();",
  "        System.out.println(\"=== Block 1b: Java 21 note ===\");",
  "        System.out.println(\"virtual threads multiply Runnable lambdas — lock audits beat allocation myths\");",
  "        System.out.println();",
  "",
  "        System.out.println(\"=== Block 2: scoring ===\");",
  "        Map<String, Integer> penalties = new LinkedHashMap<>();",
  "        penalties.put(\"mutable parallel\", 5);",
  "        penalties.put(\"serializable lambda\", 4);",
  "        penalties.put(\"noisy peek business\", 3);",
  "        penalties.put(\"static Function per request\", 2);",
  "        penalties.put(\"mutable capture\", 4);",
  "        penalties.put(\"peek billing\", 5);",
  "        penalties.put(\"no Supplier for replay\", 2);",
  "        penalties.put(\"unbounded lambda factory\", 2);",
  "        int total = 0;",
  "        for (Map.Entry<String, Integer> e : penalties.entrySet()) {",
  "            total += e.getValue();",
  "            System.out.println(e.getKey() + \" -> weight \" + e.getValue());",
  "        }",
  "        System.out.println(\"raw score=\" + total);",
  "        System.out.println(\"audit: sum of pattern weights — not CPU percent\");",
  "        System.out.println(\"=== Block 2b: weight >=4 escalates review ===\");",
  "        for (Map.Entry<String, Integer> e : penalties.entrySet()) {",
  "            if (e.getValue() >= 4) {",
  "                System.out.println(\"escalate | \" + e.getKey() + \" | weight=\" + e.getValue());",
  "            }",
  "        }",
  "        System.out.println();",
  "",
  "        System.out.println(\"=== Block 3: action table ===\");",
  "        System.out.println(\"mutable parallel      | force sequential + copy list | retest with jcmd Thread.print\");",
  "        System.out.println(\"serializable lambda   | replace with named class        | cluster serialization test\");",
  "        System.out.println(\"LinkageError          | javap -v bootstrap diff         | adjust shade relocation\");",
  "        System.out.println(\"invoke hotspots       | cache Function fields           | async-profiler before/after\");",
  "        System.out.println(\"virtual pin           | replace synchronized            | jcmd Thread.print diff\");",
  "        System.out.println(\"peek billing          | move to forEach after collect   | finance regression test\");",
  "        System.out.println(\"checked IO in map     | wrap UncheckedIOException at edge | replay batch fixture\");",
  "        System.out.println(\"per-row lambda factory| hoist static Function constants    | compare javap bootstrap arity\");",
  "        System.out.println(\"no Supplier replay    | Supplier of Stream or List materialize| double-pass integration test\");",
  "        System.out.println(\"eof\");",
  "    }",
  "}",
  "",
].join("\n");

const ADVANCED_OUTPUT = [
  "=== Block 1: risk model ===",
  "session lambda | named class | risk=2",
  "virtual pin | narrow synchronized | risk=2",
  "Stream reuse | one terminal | risk=3",
  "parallel source | immutable or concurrent | risk=3",
  "invokedynamic shade | exclude invoke pkgs | risk=3",
  "checked IO in map | lift IO boundary | risk=3",
  "per-row lambda factory | cache Function | risk=3",
  "",
  "=== Block 1b: Java 21 note ===",
  "virtual threads multiply Runnable lambdas — lock audits beat allocation myths",
  "",
  "=== Block 2: scoring ===",
  "mutable parallel -> weight 5",
  "serializable lambda -> weight 4",
  "noisy peek business -> weight 3",
  "static Function per request -> weight 2",
  "mutable capture -> weight 4",
  "peek billing -> weight 5",
  "no Supplier for replay -> weight 2",
  "unbounded lambda factory -> weight 2",
  "raw score=27",
  "audit: sum of pattern weights — not CPU percent",
  "=== Block 2b: weight >=4 escalates review ===",
  "escalate | mutable parallel | weight=5",
  "escalate | serializable lambda | weight=4",
  "escalate | mutable capture | weight=4",
  "escalate | peek billing | weight=5",
  "",
  "=== Block 3: action table ===",
  "mutable parallel      | force sequential + copy list | retest with jcmd Thread.print",
  "serializable lambda   | replace with named class        | cluster serialization test",
  "LinkageError          | javap -v bootstrap diff         | adjust shade relocation",
  "invoke hotspots       | cache Function fields           | async-profiler before/after",
  "virtual pin           | replace synchronized            | jcmd Thread.print diff",
  "peek billing          | move to forEach after collect   | finance regression test",
  "checked IO in map     | wrap UncheckedIOException at edge | replay batch fixture",
  "per-row lambda factory| hoist static Function constants    | compare javap bootstrap arity",
  "no Supplier replay    | Supplier of Stream or List materialize| double-pass integration test",
  "eof",
  "",
].join("\n");

const PITFALL_ITEMS = [
  "// Fresher",
  "Writing **x++** on a captured **int** you also read inside a **lambda** — **javac** emits **local variables referenced from a lambda expression must be final or effectively final** and the learner thinks the **IDE** is broken; fix by using **final int** snapshot vars or **AtomicInteger**; verify by compiling with **javac** **--release 17** in CI.",
  "Calling **parallelStream** on a tiny **List** to 'wake up all cores' — **ForkJoinPool** overhead can make latency worse with no gain; switch to **stream** sequential until **JFR** proves benefit; verify with **jcmd** **JFR.start** on a canary comparing CPU versus wall clock.",
  "// Senior Developer",
  "Using **peek** to mutate shared totals in a **Stream** pipeline — refactors that remove **peek** silently delete business math and auditors see mismatched ledger lines; move side effects to **forEach** after **collect** or use **reduce**; verify by property-based tests comparing parallel vs sequential totals.",
  "Capturing **this** inside a long **lambda** passed to async code — object graphs stay reachable and **unit** tests leak memory; extract **static** helper or weak references where safe; verify with **jmap** **-histo:live** after soaking workers overnight.",
  "// Technical Lead",
  "Publishing a **shared** **Function** field that **closes** over request-scoped **DTO** without synchronization — under load two threads observe partial mutation through the same **lambda** capture; fix by moving **Function** construction inside request scope or pass immutable snapshots; verify with concurrent **RestAssured** suite hitting the endpoint from fifty threads.",
  "Standardizing on **Serializable** **lambdas** in every **Kafka** **callback** config stored in **Zookeeper** — upgrades deserialize ghost classes; fix by storing **class** names + configs, not bytecode-linked lambdas; verify with rolling restart test matrix on **Java 17** and **Java 21** brokers.",
  "// Staff / Architect",
  "Letting **maven-shade-plugin** relocate **java.lang.invoke** friendly packages alongside application **lambda** sites — canary throws **LinkageError** despite clean **javac**; fix relocation excludes for synthetic **bootstrap** dependencies; verify **javap -v** diffs nightly fat **JAR** versus thin module.",
  "Running hot reload dev servers that regenerate endless **MethodHandle** graphs — **Metaspace** **OutOfMemoryError** appears after hours; fix by disabling plugin or isolating class loaders; verify **jcmd** **VM.metaspace** before/after reload marathons.",
];

const CHEATSHEET = [
  "| Level | Concept | The rule in one line | Example or Command |",
  "| --- | --- | --- | --- |",
  "| Fresher | **SAM** | One abstract method receives your **lambda** | **Predicate<String>** p = s -> true; |",
  "| Fresher | **effectively final** | Do not mutate captured locals | use **AtomicInteger** |",
  "| Fresher | **Stream** | One **terminal** per object | **supplier** of **Stream** |",
  "| Senior Dev | **invokedynamic** | **LambdaMetafactory** links call sites | **javap -v** |",
  "| Senior Dev | **parallelStream** | Source must be safe to split | copy list first |",
  "| Senior Dev | **method ref** | Arity must match SAM | **String::trim** |",
  "| Senior Dev | **Comparator** | Use **comparing** + **nullsFirst** | **Comparator.comparing** |",
  "| Tech Lead | **review** | Ban **Stream** fields | **ArchUnit** rule |",
  "| Tech Lead | **session** | No **Serializable** lambdas | named **class** |",
  "| Tech Lead | **cost story** | Prove with **JFR** before parallel | **jcmd** **JFR.start** |",
  "| Staff | **shade** | Protect **bootstrap** constants | fix **maven-shade-plugin** |",
  "| Staff | **virtual threads** | Avoid **synchronized** in hot **lambda** | **jcmd** **Thread.print** |",
  "| Staff | **Metaspace** | Watch class churn from reload | **jcmd** **VM.metaspace** |",
  "| Staff | **LinkageError** | Diff **javap** bootstraps | **javap -v -p** |",
].join("\n");

const FRESHER_EX = {
  type: "exercise",
  title: "Exercise — first Predicate (fresher)",
  audience: "fresher",
  difficulty: "Beginner",
  problem:
    "You are writing your first **lambda** after reading about **Predicate**.\n\n1. Create **arch.day29.Day29FresherExercise** with **main**.\n2. Build a **Predicate<Integer>** that returns true when the value is positive.\n3. Print the result of **test** on **final** literals **-1** and **3**.\n4. Print one line explaining that **test** maps to the **SAM** **method** name.",
  hints: ["Use **Predicate<Integer>** with parentheses around parameter.", "Call **test**, not **apply**.", "Last line can be a fixed teaching **println**."],
  solution: [
    "// Package groups this lesson file for class path runs.",
    "package arch.day29;",
    "",
    "import java.util.function.Predicate;",
    "",
    "/** Fresher drill: positive test with comments on every line. */",
    "public class Day29FresherExercise {",
    "",
    "    public static void main(String[] args) {",
    "        // argv unused so output is deterministic across machines.",
    "        // Predicate captures the SAM shape for a boolean test.",
    "        Predicate<Integer> positive = n -> n > 0;",
    "        // negativeLiteral models bad input from upstream validation.",
    "        final int negativeLiteral = -1;",
    "        // positiveLiteral models good revenue line count.",
    "        final int positiveLiteral = 3;",
    "        // first println proves predicate rejects non-positive ints.",
    "        System.out.println(positive.test(negativeLiteral));",
    "        // second println proves predicate accepts positive ints.",
    "        System.out.println(positive.test(positiveLiteral));",
    "        // teaching line ties syntax back to SAM method name test.",
    "        System.out.println(\"teaching: Predicate uses abstract method test defined by the SAM\");",
    "    }",
    "}",
    "",
  ].join("\n"),
};

const STAFF_EX = {
  type: "exercise",
  title: "Exercise — stream reuse triage (staff)",
  audience: "staff",
  difficulty: "Advanced",
  problem:
    "Your ingestion service logs **IllegalStateException: stream has already been operated upon or closed** only when EU tenants exceed one million rows.\n\n1. Model three **String** pipeline states (**cold**, **double_terminal**, **fixed**) as **final** constants.\n2. Build a **LinkedHashMap** mapping each state to the first command you run (**javap -v**, **jcmd** Thread.print, **unit** test harness).\n3. Print a triage line for **double_terminal** naming **Stream** single-use semantics.\n4. Print **fix** guidance referencing **Supplier** or **List** materialization.\n5. Print **prevention** referencing code review rule banning **Stream** instance fields.",
  hints: ["Keep println-only; no real IO.", "Order **LinkedHashMap** inserts for deterministic review output.", "Mention **terminal** operations explicitly in fix line."],
  solution: [
    "package arch.day29;",
    "",
    "import java.util.LinkedHashMap;",
    "import java.util.Map;",
    "",
    "/** Staff triage card: stream reuse incidents without live streams for CI determinism. */",
    "public class Day29StaffExercise {",
    "",
    "    public static void main(String[] args) {",
    "        // cold models a healthy single-pass pipeline before metrics refactor.",
    "        final String cold = \"state:cold_single_terminal\";",
    "        // double_terminal models the failure mode from double count() calls.",
    "        final String doubleTerminal = \"state:double_terminal\";",
    "        // fixed models replay from supplier or list snapshot.",
    "        final String fixed = \"state:fixed_replay\";",
    "        // commands map ties human readable states to first diagnostics.",
    "        Map<String, String> commands = new LinkedHashMap<>();",
    "        commands.put(cold, \"javap -v IngestService.class for accidental Stream fields\");",
    "        commands.put(doubleTerminal, \"jcmd <pid> Thread.print + reproduce CSV in integration env\");",
    "        commands.put(fixed, \"run junit IngestReplayTest after Supplier refactor\");",
    "        System.out.println(\"=== Modeled pipeline states ===\");",
    "        for (Map.Entry<String, String> e : commands.entrySet()) {",
    "            System.out.println(e.getKey() + \" -> \" + e.getValue());",
    "        }",
    "        System.out.println(\"=== Triage double terminal ===\");",
    "        System.out.println(\"mechanism: java.util.stream.Stream allows one terminal; second pass throws IllegalStateException\");",
    "        System.out.println(\"=== Fix ===\");",
    "        System.out.println(\"fix: wrap Files.lines in Supplier<Stream<String>> or collect to List once then derive metrics\");",
    "        System.out.println(\"=== Prevention ===\");",
    "        System.out.println(\"prevention: review checklist bans Stream fields; ArchUnit guards on arch.ingest packages\");",
    "        System.out.println(\"=== Staff note ===\");",
    "        System.out.println(\"javap proves accidental Stream reuse fields; jcmd proves stack context during outage\");",
    "        System.out.println(\"Java 21 virtual thread issues differ; here root is classic Stream contract\");",
    "        System.out.println(\"Metaspace not implicated unless hot reload lambda spam appears\");",
    "        // Reviewer checklist: ensure metrics pass never stores Stream instance fields.",
    "        System.out.println(\"=== Review checklist (printable) ===\");",
    "        System.out.println(\"[ ] Stream fields banned in ingest module\");",
    "        System.out.println(\"[ ] Integration test opens pipeline twice like production\");",
    "        System.out.println(\"[ ] Ticket cites java.util.stream package in stack\");",
    "        System.out.println(\"[ ] Rollback plan documented before feature flag on\");",
    "        // Postmortem template: link to javap output and Thread.print capture paths.",
    "        System.out.println(\"=== Postmortem links ===\");",
    "        System.out.println(\"attach: splunk query for IllegalStateException ingest*\");",
    "        System.out.println(\"attach: grafana panel for EU tenant row volume threshold\");",
    "        // Coaching note: teach juniors Stream is Iterator sugar with fancy operators.",
    "        System.out.println(\"coaching: Supplier<Stream<String>> replays without mutating source Iterable\");",
    "        System.out.println(\"coaching: List.copyOf snapshot is acceptable when memory fits\");",
    "    }",
    "}",
    "",
  ].join("\n"),
};

function wordCount(s) {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

function hashSections(content) {
  return (content.match(/^###\s/gm) || []).length;
}

function pipeTables(content) {
  return (content.match(/^\|[^|\n]+\|[^|\n]+\|[^|\n]+\|\s*$/gm) || []).length;
}

function interviewAngles(content) {
  return (content.match(/\*\*Interview angle:\*\*/g) || []).length;
}

function nonBlankCodeLines(code) {
  return code ? code.split("\n").filter((l) => l.trim().length > 0).length : 0;
}

function theoryLevelDistribution(content) {
  const heads = [...content.matchAll(/^### (.+)$/gm)].map((m) => m[1].replace(/\*\*/g, "").trim());
  const closing = (h) => /60-second interview story/i.test(h) || /Satyverse drill/i.test(h);
  const band = heads.filter((h) => !closing(h));
  const fresher = band.filter((h) =>
    /Plain-language|What a lambda is on day one|Your first lambda program|When the JVM runs/i.test(h)
  ).length;
  const seniorDev = band.filter((h) =>
    /How lambdas compile|Production comparison|Common stream mistakes|Step-by-step/i.test(h)
  ).length;
  const techLead = band.filter((h) =>
    /Lambda versus method reference|Code review checklist|How you explain stream cost/i.test(h)
  ).length;
  const staff = band.filter((h) =>
    /LambdaMetafactory|On-call commands|Java 8, 11, 17, and 21/i.test(h)
  ).length;
  return {
    totalHeadings: heads.length,
    fresher,
    seniorDev,
    techLead,
    staff,
    closing: heads.filter(closing).length,
  };
}

function cheatsheetDataRows(content) {
  const lines = (content || "").split("\n").filter((l) => /^\|/.test(l));
  return Math.max(0, lines.filter((l) => !/^\|[\s-|:]+\|\s*$/.test(l)).length - 1);
}

function main() {
  const raw = fs.readFileSync(JSON_PATH, "utf8");
  const data = JSON.parse(raw);

  const sections = data.sections;
  const whySec = sections.find((s) => s.type === "why");
  const theorySec = sections.find((s) => s.type === "theory");
  const pitfallsSec = sections.find((s) => s.type === "pitfalls");
  let cheatsheetSec = sections.find((s) => s.type === "cheatsheet");
  const interviewSec = sections.find((s) => s.type === "interview");
  let mcqSec = sections.find((s) => s.type === "mcq");
  const codeSecs = sections.filter((s) => s.type === "code");

  if (whySec) {
    whySec.content = WHY_CONTENT;
    whySec.title = "Why lambdas, SAM contracts, and stream discipline decide real outages";
  }
  if (theorySec) {
    theorySec.title = "Lambda and Functional Interfaces — erasure of fear edition";
    theorySec.content = THEORY_CONTENT;
  }

  const basicSec = codeSecs.find((c) => c.level === "basic");
  const interSec = codeSecs.find((c) => c.level === "intermediate");
  const advSec = codeSecs.find((c) => c.level === "advanced");
  if (basicSec) {
    basicSec.code = BASIC_CODE;
    basicSec.output = BASIC_OUTPUT;
  }
  if (interSec) {
    interSec.code = INTERMEDIATE_CODE;
    interSec.output = INTERMEDIATE_OUTPUT;
  }
  if (advSec) {
    advSec.code = ADVANCED_CODE;
    advSec.output = ADVANCED_OUTPUT;
  }

  if (pitfallsSec) pitfallsSec.items = PITFALL_ITEMS;
  if (cheatsheetSec) cheatsheetSec.content = CHEATSHEET;

  const exIdx = sections.findIndex((s) => s.type === "exercise");
  if (exIdx !== -1) {
    if (sections[exIdx + 1]?.type === "exercise") {
      sections[exIdx] = { ...FRESHER_EX };
      sections[exIdx + 1] = { ...STAFF_EX };
    } else {
      sections.splice(exIdx, 1, { ...FRESHER_EX }, { ...STAFF_EX });
    }
  }

  if (interviewSec) {
    interviewSec.conceptual = CONCEPTUAL;
    interviewSec.codeBased = CODE_BASED;
    interviewSec.seniorScenario = SENIOR_SCENARIO;
    interviewSec.wrongAnswers = WRONG_ANSWERS;
    interviewSec.jobSwitch = JOB_SWITCH;
  }

  const csIdx = sections.findIndex((s) => s.type === "cheatsheet");
  if (!mcqSec && csIdx !== -1) {
    mcqSec = {
      type: "mcq",
      title: "MCQ — Lambdas and Functional Interfaces",
      description: "30 questions: SAM, method refs, streams, linkage, and on-call diagnostics.",
      questions: MCQ_QUESTIONS,
    };
    sections.splice(csIdx, 0, mcqSec);
  } else if (mcqSec) {
    mcqSec.questions = MCQ_QUESTIONS;
  }

  const out = JSON.stringify(data, null, 2) + "\n";
  JSON.parse(out);
  fs.writeFileSync(JSON_PATH, out, "utf8");

  const whyWords = wordCount(sections.find((s) => s.type === "why").content);
  const theoryH = hashSections(theorySec.content);
  const levels = theoryLevelDistribution(theorySec.content);
  const conceptual = interviewSec.conceptual || [];
  const concWords = conceptual.map((x) => wordCount(x.answer));
  const senior = interviewSec.seniorScenario || [];
  const senWords = senior.map((x) => wordCount(x.answer));
  const mcqQs = (sections.find((s) => s.type === "mcq") || {}).questions || [];
  const mcqBy = { basic: 0, intermediate: 0, advanced: 0 };
  for (const q of mcqQs) {
    mcqBy[q.level] = (mcqBy[q.level] || 0) + 1;
  }
  const basic = sections.filter((s) => s.type === "code").find((c) => c.level === "basic");
  const inter = sections.filter((s) => s.type === "code").find((c) => c.level === "intermediate");
  const adv = sections.filter((s) => s.type === "code").find((c) => c.level === "advanced");
  cheatsheetSec = sections.find((s) => s.type === "cheatsheet");

  console.log("--- Verification ---");
  console.log("WHY word count:", whyWords);
  console.log("THEORY ### count:", theoryH);
  console.log(
    "THEORY level distribution (fresher / seniorDev / techLead / staff):",
    `${levels.fresher} / ${levels.seniorDev} / ${levels.techLead} / ${levels.staff} (closing headings: ${levels.closing})`
  );
  console.log("Conceptual: count =", conceptual.length, "| words =", concWords.join(", "));
  console.log("SeniorScenario: count =", senior.length, "| words =", senWords.join(", "));
  console.log("JobSwitch:", !!interviewSec.jobSwitch);
  console.log("MCQ by level:", JSON.stringify(mcqBy));
  console.log(
    "Code lines [basic, intermediate, advanced]:",
    [basic, inter, adv].map((c) => nonBlankCodeLines(c.code)).join(", ")
  );
  console.log("File size (chars):", fs.statSync(JSON_PATH).size);

  const exCount = sections.filter((s) => s.type === "exercise").length;
  const fail = [];
  if (whyWords < 600 || whyWords > 750) fail.push("WHY length 600-750");
  if (theoryH < 16) fail.push("THEORY ### < 16");
  if (pipeTables(theorySec.content) < 3) fail.push("THEORY pipe tables < 3");
  if (interviewAngles(theorySec.content) < 13) fail.push("THEORY angles < 13");
  if (levels.fresher < 3) fail.push("THEORY fresher band < 3");
  if (levels.seniorDev < 4) fail.push("THEORY seniorDev band < 4");
  if (levels.techLead < 3) fail.push("THEORY techLead band < 3");
  if (levels.staff < 3) fail.push("THEORY staff band < 3");
  for (const w of concWords) if (w < 120) fail.push(`conceptual ${w} words`);
  for (const w of senWords) if (w < 200) fail.push(`senior ${w} words`);
  if (cheatsheetDataRows(cheatsheetSec.content) < 12) fail.push("cheatsheet rows");
  const pitItems = pitfallsSec.items.filter((x) => typeof x === "string" && !x.trimStart().startsWith("//"));
  if (pitItems.length !== 8) fail.push("pitfalls body count !== 8");
  if (exCount !== 2) fail.push("exercise sections !== 2");
  const staffEx = sections.find((s) => s.type === "exercise" && s.audience === "staff");
  const fresherEx = sections.find((s) => s.type === "exercise" && s.audience === "fresher");
  if (staffEx && staffEx.solution.split("\n").length < 50) fail.push("staff exercise < 50 lines");
  if (fresherEx && fresherEx.solution.split("\n").length < 25) fail.push("fresher exercise < 25 lines");
  if (mcqBy.basic !== 8 || mcqBy.intermediate !== 12 || mcqBy.advanced !== 10) fail.push("MCQ split");
  const ncb = nonBlankCodeLines(basic.code);
  const nci = nonBlankCodeLines(inter.code);
  const nca = nonBlankCodeLines(adv.code);
  if (ncb < 40 || ncb > 60) fail.push(`basic lines ${ncb}`);
  if (nci < 70 || nci > 100) fail.push(`intermediate lines ${nci}`);
  if (nca < 60 || nca > 100) fail.push(`advanced lines ${nca}`);
  if ((interviewSec.codeBased || []).length < 8) fail.push("codeBased < 8");
  if ((interviewSec.seniorScenario || []).length < 5) fail.push("senior < 5");
  if ((interviewSec.wrongAnswers || []).length !== 8) fail.push("wrongAnswers !== 8");

  if (fail.length) {
    console.log("\n✗ Day 29 —", fail.join("; "));
    process.exitCode = 1;
  } else {
    console.log("\n✓ Day 29 complete. All checks pass.");
  }
}

main();
