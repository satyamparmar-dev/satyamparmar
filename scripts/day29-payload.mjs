/**
 * Content bundle for enhance-day29-staff.mjs (Lambda + functional interfaces).
 * Avoid nested backticks: this file joins segments instead of nesting ``` inside templates.
 */

export const WHY_CONTENT = [
  `At 02:18 a **Spring Boot** payment worker pages you because **IllegalStateException: stream has already been operated upon or closed** bubbles out of a **forEach** that ran twice on the same **Stream** reference. The author copied a clever **lambda** from Stack Overflow, chained **filter** **map** **collect**, then tried to log another pass with the same variable for a metrics badge. CI never failed: the branch only parsed empty files in tests. The pod hits real CSV rows, the second pass explodes, and finance thinks payouts stalled because of a bad file when the bug is simply **Stream** reuse.`,

  `If you are newer to **Java**, think of a **lambda** as a tiny anonymous **method** you hand to an **interface** that has exactly one abstract **method**. That contract is the **SAM** shape. **javac** checks that your shorthand matches the abstract **accept**, **apply**, **test**, or **run** methods you are implementing. You are not typing magic; you are building a small **implementation** object without naming a **class**.`,

  `When you already ship features, interviewers care what breaks after you ship. Weak answer: "**Streams** are lazy." Strong answer: "We leaked a **parallelStream** on a non-thread-safe **ArrayList**; **ForkJoinPool** races produced **ArrayIndexOutOfBoundsException**; I reproduced with **jcmd** Thread.print, switched to **sequential** or wrapped the list, proved the fix with concurrent integration tests." Another favorite failure is **lambda** capturing a counter you mutate in a loop so **javac** shouts about **local variables referenced from a lambda expression must be final or effectively final**. Teams blame the **IDE** quick fix instead of rewriting the accumulator.`,

  `When you lead a squad, memorize the four-step pattern: Step one, name the **functional** **interface** target so nobody confuses **Consumer** with **Function**. Step two, write whether locals are **effectively final** before you paste another **lambda**; if not, promote state to **AtomicInteger** or a holder **record**. Step three, decide **parallel** versus **sequential** only after you prove the source is thread-safe and ordering does not matter; verify contention with **jcmd** JFR.start or **async-profiler**. Step four, paste **javap -v** bootstrap output into the ticket whenever **LinkageError** after a shaded **JAR** makes **invokedynamic** targets disappear. Fifty microservices mean one bad copy-paste **Stream** pattern becomes fifty silent double-processing bugs.`,

  `At Staff depth you anchor the story on **HotSpot** reality: **Java 8** introduced **LambdaMetafactory** so **invokedynamic** can bind lambdas without eager **anonymous** **class** classfiles for every site. **Java 11** tightened **NestHost** diagnostics so **jstack** across inner **lambdas** reads cleaner. **Java 17** kept the same model but warns harder when frameworks reflect into JDK internals. **Java 21** **virtual** threads make it easier to fire thousands of **Runnable** lambdas, which shifts pressure to pinning: a **synchronized** block inside a **lambda** can pin a carrier and spike latency—watch carrier stalls with **jcmd** Thread.print.`,

  `In your first six months somewhere new you will see this topic constantly. You review a PR that stores a **Stream** in a field: you demand **terminal** in one place or a **Supplier** of **Stream**. You chase **OutOfMemoryError** **Metaspace** after a hot reload feature keeps recreating **MethodHandles**: you capture **jcmd** VM.metaspace before and after. You explain to product why a **Serializable** **lambda** in a session bean is brittle: you swap to a named **class** and add a regression test that round-trips the session.`,

  `The emotional arc matters too. **Lambda** syntax made **Java** feel lighter, so teams overuse it where a boring **for** loop would be obvious. You are the engineer who steers people back to clarity when a pipeline spans three screens. That habit is what interviewers call senior judgement: you know when sugar helps and when it hides a mistake that only shows up under tenant scale.`,

  `Quiet confidence beats buzzwords: you rehearse naming the **SAM**, the **terminal** you used, and the command that proved your story before you walk into the room.`,
].join("\n\n");

const THEORY_HEAD = `### Plain-language overview

A **lambda** is a short block of code you pass where **Java** expects an object with one main action. Think: "when you are ready, run this." The **interface** that receives it is called **functional** because it has exactly one abstract **method** (**SAM**). **Method references** are even shorter when an existing **method** already matches that shape.

**Interview angle:** If the candidate cannot name the **SAM** before describing syntax, they are still at tutorial depth.

### What a lambda is on day one (Fresher band)

You already used **SAM** types without slang: **Runnable**, **Comparator**, **FileFilter**. A **lambda** fills that slot without **new Runnable** plus brace noise. **javac** checks types the same way; the difference is readability.

**Interview angle:** Ask which **interface** receives the **lambda** before debating syntactic sugar.

### Your first lambda program (Fresher band)

`;

const THEORY_SNIPPET = ["```java", "import java.util.function.Predicate;", "", "public class Demo {", "    public static void main(String[] args) {", '        Predicate<String> ok = s -> !s.isBlank();', '        System.out.println(ok.test("ready"));', "    }", "}", "```", ""].join("\n");

const THEORY_TAIL = `You just implemented **Predicate.test** without writing a **class** file by hand.

**Interview angle:** Watch for confusion between **method** body braces and **anonymous** **class** syntax.

### When the JVM runs your lambda (Fresher band)

At runtime you still invoke **test**, **apply**, or **accept** on some object implementing the **interface**. The **JVM** does not keep your **lambda** text around; it links a tiny adapter through **invokedynamic** machinery the first time the call site warms up.

**Interview angle:** Freshers should say "there is still an object" even if they skip **LambdaMetafactory** details.

### How lambdas compile to invokedynamic (Senior Developer band)

**javac** does not always emit a dedicated **Lambda$0.class** file anymore. It plants an **invokedynamic** instruction whose **bootstrap** method calls **LambdaMetafactory.metafactory** with **MethodHandles** describing the real body. The **CallSite** targets a **generated** **lambda** **method** inside your **class**. **javap -v Demo.class** exposes **BootstrapMethods** and **RuntimeInvisibleAnnotations** showing which **interface** was requested.

**Interview angle:** Strong seniors can point at **invokedynamic** line numbers instead of hand-waving about sugar.

### Production comparison — functional shapes (Senior Developer band)

| Shape | When to use it | What breaks if you pick the wrong one |
| --- | --- | --- |
| **Predicate** | **filter** tests | You try to **map** with it and lose type clarity |
| **Function** | **map** transforms | **void** results belong to **Consumer** |
| **Consumer** | **forEach** side effects | You hide IO or mutations and surprise teammates |
| **Supplier** | lazy creation | Calling **get** in a hot loop without caching explodes allocation |

**Interview angle:** Mapping symptoms to the wrong **java.util.function** type is a common mid-level slip.

### Common stream mistakes that look like data bugs (Senior Developer band)

Reusing a **Stream** triggers **IllegalStateException** about already closed pipelines. **parallelStream** on a **HashMap** value view races with writers unless the map is **ConcurrentHashMap**. **peek** for business rules hides side effects until someone refactors the pipeline and deletes the **peek**.

**Interview angle:** Ask how they would prove ordering bugs with deterministic fixtures before blaming upstream CSV quality.

### Step-by-step: from lambda text to CallSite (Senior Developer band)

Step 1: Write the **lambda** against the **SAM** you truly need. Step 2: **javac** the module with **-parameters** if frameworks reflect names. Step 3: Run **javap -v -p Target.class** and note **invokedynamic** entries plus **bootstrap_methods**. Step 4: On failures, diff **LinkageError** stack traces after dependency upgrades. Step 5: Capture **java -version** and **javac -version** because toolchain skew changes **MethodHandle** accessibility. Step 6: Add a regression test around the **Stream** **terminal** you rely on.

**Interview angle:** Staff candidates attach **javap** snippets to PR evidence; juniors only paste stack traces.

### Lambda versus method reference in API design (Technical Lead band)

Use **method** **references** when they read like English (**String::trim**). Reach for a **lambda** when you must close over locals or guard nulls. For **public** SDK surfaces, prefer named **static** helpers when logic exceeds three lines so stack traces stay human.

**Interview angle:** Tech Leads defend readability metrics, not line-count golf.

### Code review checklist for functional style (Technical Lead band)

| Review focus | Green flag | Red flag |
| --- | --- | --- |
| **Stream** lifetime | Single **terminal** or **Supplier** | **Stream** stored in fields |
| Thread safety | **parallel** only on thread-safe sources | **parallelStream** on **ArrayList** under writers |
| Side effects | **forEach** for IO | **peek** changing shared state |
| Serialization | Named **class** | Anonymous **lambda** in **Serializable** beans |

**Interview angle:** Checklists stop clever **peek** from shipping unnoticed.

### How you explain stream cost to a stakeholder (Technical Lead band)

Say **pipelines** allocate intermediate objects and may spin **ForkJoinPool** threads when marked **parallel**. Tie cost to dollars by showing **CPU** profiles (**JFR** or **async-profiler**) before rewriting **SQL**. Promise you will revert **parallel** if metrics regress.

**Interview angle:** Leaders translate bytecode choices into observability charts, not jargon duels.

### What **LambdaMetafactory** really does (Staff band)

**LambdaMetafactory** builds **CallSite** objects that wire **invokedynamic** call sites to **private** **lambda** bodies encoded as **static** **synthetic** methods. The **JVM** reuses adapters when signatures match, which is why **Metaspace** is usually fine but can churn if class loaders reload bytecode constantly (devtools, dynamic plugins). **javap -v** shows **BootstrapMethods** referencing **java.lang.invoke.LambdaMetafactory**.

**Interview angle:** Staff engineers explain **Metaspace** regressions with class loader + **lambda** linkage context.

### On-call commands for scary lambda stack frames (Staff band)

| Command | What it reveals | When to run it |
| --- | --- | --- |
| **javap -v -p Service.class** | **invokedynamic** targets + **NestMembers** | **LinkageError** after shading |
| **jcmd** Thread.print | pinned threads inside **lambda** bodies | latency spikes on **virtual** threads |
| **jcmd** JFR.start | allocation + fork join stalls | **parallelStream** regressions |
| **jcmd** VM.metaspace | class metadata pressure | hot reload environments |

**Interview angle:** If they only know **jstack** but never **javap -v**, they lack linkage literacy.

### How lambda linkage evolved across **Java 8**, **11**, **17**, and **21** (Staff band)

**Java 8** introduced **LambdaMetafactory** + **invokedynamic** lambdas. **Java 11** improved **Nest-based** access control so reflective stacks around **lambdas** align with source nests. **Java 17** removes **SecurityManager** workflows teams abused and makes illegal reflective opens fail loudly—important for frameworks wrapping **MethodHandles**. **Java 21** couples with **virtual** threads: **Runnable** lambdas explode in count, so pinning diagnostics matter more than micro-optimizing **lambda** allocation.

**Interview angle:** Tie on-call stories to an LTS fact, not podcast trivia.

### 60-second interview story

You define **lambdas** as **SAM** implementations linked with **invokedynamic**, prefer **method** **references** when they read cleaner, enforce **effectively final** capture rules, and treat **Stream** pipelines like single-use rituals. You close with **javap -v** proof whenever **LinkageError** strikes after shading. You practice **jcmd** Thread.print when **virtual** thread latency spikes flag **synchronized** inside callbacks.

**Interview angle:** Story must mention **SAM** plus one diagnostic (**javap** or **jcmd**).

### Satyverse drill — tie-down

Compile any small **class** with two **lambdas** today, then run **javap -v** on that classfile. Highlight the **BootstrapMethods** block and the **synthetic** **lambda** methods. Re-run after replacing one **lambda** with **String::trim** and note how the bootstrap arguments change.

**Interview angle:** Drill is done only when you can narrate the output without reading jargon off the slide.
`;

export const THEORY_CONTENT = THEORY_HEAD + THEORY_SNIPPET + THEORY_TAIL;
