/** Full section builder for phase10-day90.json — Full Mock Interview Simulation */

const T = (title, body, angle) =>
  `### ${title}\n\n${body}\n\n**Interview angle:** ${angle}`;

function buildWhy() {
  return (
    'You block two hours on your calendar for a **full** **mock** **interview** **simulation**. Your friend plays **interviewer**. You open a blank doc. Ten minutes in you realize you have been typing in silence while they wait for you to think out loud. Your throat goes dry. The **timer** beeps and you still have not said what **trade-offs** you would test first. That awkward hour is why **full** **mock** **interview** **simulation** exists as its own habit — not to cram facts, but to rehearse **pressure**, **structure**, and **recovery** the way a real **panel** does.\n\n' +
    'You already know **Java** syntax. **Interviewers** in a **Staff** loop rarely fail you for a missing semicolon. They fail you when you cannot narrate **assumptions**, when your **behavioral** story hides your **Action** behind "**we**," or when your **system** **design** skips **failure** modes because the clock scared you. A weak **mock** ends with "**I** should have talked more." A strong **mock** ends with a short **retro**: one **clarify** habit you will repeat, one **metric** you will add to **Result**, one **command** you will cite when **tail** **latency** comes up — maybe **jcmd** **Thread.print** or **jstat** **-gc** so your **JVM** story is not fantasy.\n\n' +
    'When ten engineers run **mocks** without structure, two failure modes repeat. First, everyone treats **mock** day like a **quiz** on **buzzwords** — **Kafka**, **Kubernetes**, **CQRS** — and nobody practices **echoing** **hints** or **narrowing** **scope** when the **interviewer** steers. Second, **behavioral** answers stay fluffy: long **Situation**, vague **Result**, no **OutOfMemoryError** **Java** **heap** **space** story when they actually debugged **heap** churn. Both feel like confidence until a real **Zoom** **room** exposes them. Real **production** already showed you the symptoms: **HTTP** **429** storms that were **retry** **amplification**, or **GC** **pause** spikes you would diagnose with **JFR** if you practiced saying the steps out loud.\n\n' +
    'Use this four-step pattern in every **full** **mock** **round** and every **STAR** story you rehearse. First, **set** **stakes**: say the **role**, the **timebox**, and what "**done**" looks like for this **segment** — **coding**, **design**, or **behavioral** — so your brain stops panicking. Second, **think** **aloud**: name **assumptions**, say what you would verify with **metrics** or **tests**, and write the **constraint** list where your **peer** can see it. Third, **recover**: when you stall, **narrow** **scope**, propose a **spike**, or offer a **trade-off** **table** instead of freezing. Fourth, **measure** the **mock** itself: one **feedback** **note** on **communication**, one on **content**, one on **Java** **depth** — for example whether you mentioned **Java** **21** **virtual** **threads** and **JFR** **jdk.VirtualThreadPinned** when you claimed **concurrency** wins.\n\n' +
    'Here is a **Staff**-level fact that separates you from someone who only watched **YouTube** **mock** **tips**. **SLO** **burn** and **multi-window** **error** **budgets** are not just **on-call** toys — they are the language you use when a **design** **mock** asks what you would **rollback** first. When you run **Java** **21** in **production**, **virtual** **threads** can still **pin** on **synchronized** **JDBC**; **JFR** proves it. In a **mock**, saying that with a calm **verification** plan sounds like you shipped, not like you memorized a blog.\n\n' +
    'In your first six months at a new company you will live this topic. During **onboarding** you sit a **shadow** **mock** with a **hiring** **manager** and realize your **STAR** **Result** lines are too soft — you rewrite them with **MTTR** and **percent** **improvement**. Before a **promo** packet you run a **timed** **design** **mock** with a **Tech** **Lead** who cuts your **scope** halfway — you learn to **echo** **hints** like a real **scoping** meeting. After a stressful **panel** you record a **two**-minute **retro** on your phone: what you would **clarify** earlier next time, which **jcmd** one-liner you forgot. Each time you treat **communication** like a skill with **reps**, the **full** **mock** **interview** **simulation** stops being theater. It becomes your **feedback** **loop**.\n\n' +
    'You also learn that **behavioral**, **coding**, and **system** **design** are one **day** in many **loops**. The **mock** shows whether you can switch **modes** without **resentment** when the **interviewer** changes **topics**. When your **answers** include **metrics**, **trade-offs**, **recovery** moves, and an honest **failure** story backed by **JVM** **tools**, you stop performing expertise. You demonstrate how you will show up on **week** **one** when **production** asks for proof, not adjectives.'
  );
}

function buildTheoryContent() {
  const parts = [
    T(
      'Plain-language overview',
      'A **full** **mock** **interview** **simulation** is a timed practice of the whole **loop** — **coding**, **design**, **behavioral**, and **your** **questions** — with a **peer** who plays **interviewer**. It is not a trivia night. It is where you rehearse **thinking** **aloud**, **timeboxing**, and **recovery** when you get stuck. You use the same **STAR** spine and **Java** vocabulary you will use in a real **room**, only with a **timer** and a **retro** at the end.',
      'Interviewers listen for whether you practiced **pressure**, not only facts.'
    ),
    T(
      'What is a full mock interview simulation and why does it exist',
      'Real **panels** stack **segments** back to back. **Nerves** stack too. The **simulation** exists so your first time hearing "**five** **minutes** **left**" is not on a **hiring** **call**. You practice **handoffs**: from **whiteboard** to **IDE**, from **bug** story to **metrics**, from **Java** **API** talk to **failure** **mode**. The habit exists because **communication** under **time** **pressure** is a different skill than solo **leetcode**.',
      'Weak candidates wing the schedule; strong ones **script** **segments** and **energy**.'
    ),
    T(
      'Your first three checkpoints before you start the mock clock',
      'Agree the **order** (**warmup**, **deep** **dive**, **retro**). Agree who drives **time** (**peer** says "**two** **minutes** **left**"). Agree what **success** means (**one** **STAR** with a **number**, one **diagram** **legend**, one **test** **idea**). If **Java** is in the **loop**, agree whether you will cite **jcmd** or **jstat** when **latency** comes up so you are not inventing tools mid-air.',
      'Interviewers reward explicit **rules** they can steer, even in practice.'
    ),
    T(
      'Mini Java timer skeleton you can run before any mock segment',
      'Paste this into a scratch file so **time** feels real, not abstract:\n\n```java\npublic class MockTick {\n  public static void main(String[] a) {\n    long t0 = System.currentTimeMillis();\n    System.out.println("segment start");\n    long t1 = System.currentTimeMillis();\n    System.out.println("elapsed ms=" + (t1 - t0));\n  }\n}\n```\n\nYou are not optimizing **nanoseconds**. You are training your mouth to keep moving while **System.currentTimeMillis** advances.',
      'Freshers who run one **println** **timer** per week stop faking calm.'
    ),
    T(
      'How to read when your practice partner narrows the mock scope',
      'If they say "**skip** **auth**," stop defending **OAuth2** and move on. If they say "**assume** **single** **region**," do not spend eight minutes on **multi-master** **replication**. Treat **hints** as **requirements** changes. Summarize back: "So we focus on **write** **throughput** and accept **eventual** **read** for this **mock**?" That mirrors how **Tech** **Leads** run **scoping** meetings — and saves your **mock** **retro** from useless debate.',
      'Strong candidates **echo** **constraints** so the **mock** stays honest.'
    ),
    T(
      'How silent coding in mocks hides your real skill',
      'If you go quiet for **twelve** **minutes**, your **peer** cannot give **signal** feedback. **Interviewers** experience the same silence as "**stuck** or **rude**." **Senior** practice means narrating **assumptions**, **trade-offs**, and **tests** while you type. Tie the habit to **Java** reality: **JIT** **warmup**, **GC** **pauses**, and **virtual** **threads** are easier to explain when you talk while you code.',
      'Senior answers prove **thinking** **aloud** beats **perfect** **typing**.'
    ),
    T(
      'Comparison table — mock formats you can rotate weekly',
      '| Format | When it fits | What breaks if you skip it |\n|--------|--------------|----------------------------|\n| **Phone** **screen** **mock** | Tight **schedule**, **signal** **check** | You never practice **concise** **STAR** |\n| **Virtual** **onsite** **mock** | **Whiteboard** + **IDE** same day | **Energy** crash if you do not **rehearse** **breaks** |\n| **Full** **loop** **simulation** | **Staff** **prep** | **Surprise** when **follow-ups** stack |\n\nRotate formats so **fatigue** does not ambush you on **offer** week.',
      'Interviewers want proof you practiced the **shape** of their **day**.'
    ),
    T(
      'Numbered sequence — one afternoon from warmup to retro',
      '1. **Warmup** **five** **minutes**: **STAR** **outline** aloud.\n2. **Deep** **dive** **twenty-five** **minutes**: **design** or **code** with **timer**.\n3. **Probe** **ten** **minutes**: **follow-ups** you did not expect.\n4. **Behavioral** **twenty** **minutes**: two **stories** with **metrics**.\n5. **Your** **questions** **ten** **minutes**: **team**, **on-call**, **Java** **version** road map.\n6. **Retro** **ten** **minutes**: **one** **communication** fix, **one** **content** fix.\n\nSkipping **retro** is how **mocks** turn into **trauma** with no **delta**.',
      'Tech leads grade whether you capture **learnings** or only **drama**.'
    ),
    T(
      'Common mistakes that look like confidence but fail the bar',
      'Cramming new **topics** the **night** before so you sleep **four** **hours**. Arguing with **peer** **hints** like they are wrong. Ignoring **time** **warnings** because "**almost** **done**." Ending with **zero** **questions** for the **interviewer**. Using **one** **speed** only — **racing** or **too** **slow**. Letting **perfectionism** block **progress** on **whiteboard** sketches. **Staff** **follow-ups** will still ask what broke in **prod** — **mocks** should surface that habit early.',
      'Staff listen for **humility** in **retro**, not excuses.'
    ),
    T(
      'Choosing what to drill next week after a bruising mock',
      'Pick **one** **communication** skill (**think** **aloud**, **echo** **hints**) and **one** **Java** depth skill (**jcmd**, **JFR**, **heap** story). Do not rebuild your entire life. Pick **one** **failure** mode you dodged on the **board** and rehearse it with a **timer**. Always say how you would **migrate** learning into the next **dual** **write** or **feature** **flag** conversation — same discipline as **design** reviews.',
      'Interviewers listen for **focused** **iteration**, not **hero** **sprints**.'
    ),
    T(
      'Code review — what you demand from your own mock prep notes',
      'Your notes need a visible **SLO** line for the **story** you told, a **rollback** sentence, and a **verification** command. Flag "**I** **optimized** **Java**" without **jcmd** **Thread.print** or **jstat** **-gc** proof. Ask how **Java** **21** **virtual** **threads** interact with your **blocking** **call** story — **JFR** **jdk.VirtualThreadPinned** belongs in prep when you claim **concurrency** wins.',
      'Good **mock** **prep** stops **hand**-wavy **confidence** before **merge** to your **brain**.'
    ),
    T(
      'Stakeholder talk — explain your mock score without shame',
      'Say "**p99** in my **story** was a customer-visible wait, not a **badge**." Offer **options**: practice **STAR** **Result** lines with **numbers**, add **diagram** **legends**, or rehearse **Java** **GC** vocabulary with **jcmd** **GC.heap_info** screenshots from **staging**. Tie **pause** **budget** to **JVM** facts when your **runtime** is **HotSpot**.',
      'Leaders trust plain language plus one chart from your **mock** **retro**.'
    ),
    T(
      'Tool commands when the mock turns to Java services',
      '| Command | What it proves in a mock answer |\n|---------|--------------------------------|\n| **jcmd** **<pid>** **Thread.print** | **BLOCKED** threads while you narrate **retry** policy |\n| **jcmd** **<pid>** **GC.heap_info** | **Heap** pressure when you mention **caching** |\n| **jstat** **-gc** **<pid>** **1s** | Whether **Young** **GC** exploded after simulated **traffic** |\n| **javap** **-c** **MyService** | **Bytecode** shape when discussing **hot** **methods** |\n',
      'Interviewers like **mock** answers that end with how you would **verify** claims.'
    ),
    T(
      'jcmd when the mock drill meets tail latency talk',
      'You are mid-**mock** and **p99** comes up. **CPU** looks fine. **jcmd** **Thread.print** can show **BLOCKED** carriers on **pools** or **synchronized** **JDBC** under **Java** **21** **virtual** **threads**. That is **runtime** truth, not **interview** theater. Pair with **trace** **waterfall** so you separate **network** wait from **JVM** wait.',
      'On-call credibility is naming a **thread** **state** during a **mock**, not after.'
    ),
    T(
      'Java 8 versus 11 versus 17 versus 21 in mock narratives',
      '| **Java** | Mock talking point |\n|----------|-------------------|\n| **8** | **PermGen** stories when **plugins** load many **classes** |\n| **11** | **LTS** baseline for **cloud** images you will discuss |\n| **17** | **Sealed** **types** for **clean** **API** sketches |\n| **21** | **Virtual** **threads** + **JFR** **pin** events when you claim **scale** |\n\nMention **JDK** when you discuss **capacity** per **core** in **design** **mocks**.',
      'Version answers show **runtime** awareness, not trivia.'
    ),
    T(
      'JVM signals when you code under time pressure in a mock',
      'Tight **loops** and **String** **concat** in **Java** still allocate on the **heap**. Under **mock** **stress**, **Young** **GC** churn can rise even if your **algorithm** is "**correct**." **jcmd** **GC.class_histogram** shows whether **byte** arrays or **String** dominate. Say that aloud so **Staff** **listeners** hear **SLO** discipline, not panic.',
      'Staff tie **allocation** habits to **mock** **credibility**.'
    ),
    T(
      'Architecture guardrail for teams running weekly mock panels',
      'Publish a **shared** **rubric**: **clarify** **first**, **failure** **section** on **whiteboard**, **numeric** **STAR** **Result**, **Java** **verification** line when **latency** is claimed. Store **baseline** **mock** **scores** per **level** so **drift** is visible. Run **game** **days** on **staging** systems, not only **slides**. Ban **behavioral** prep that uses vague **we** without **I** **ownership** — same guardrail as **production** **culture**.',
      'Architects scale **habits**, not one-off **hero** **mocks**.'
    ),
    T(
      '60-second interview story',
      '**Full** **mock** **interview** **simulation** means **timer**, **segments**, **think** **aloud**, **retro**. **STAR** stories need **Action** you own and **Result** with **numbers**. **Tech** **Leads** name **trade-offs** and **rollback**. **Staff** tie **claims** to **SLO** **burn** and **jcmd** proof when **Java** **services** appear in the **loop**.',
      'One breath that shows **structure**, **ownership**, and **verification**.'
    ),
    T(
      'Satyverse drill — tie-down',
      'Book **sixty** **minutes** with a **peer**. Run **one** **twenty**-minute **segment** with a **visible** **timer**. **Do** **not** open **new** **tabs** except **JDK** **docs** you already bookmarked. End with **five**-minute **retro**: **one** **communication** fix, **one** **Java** command you will memorize (**jcmd** **Thread.print**), **one** **STAR** **metric** you will add. Record **audio** once — painful, useful.',
      'Interviewers reward **reps** that feel boring to you but crisp to them.'
    )
  ];
  return parts.join('\n\n');
}

function buildBasicCode() {
  const code = `package arch.day90;

/**
 * Fresher reference card: full mock interview simulation vocabulary (println only).
 */
public class Day90Basic {

    public static void main(String[] args) {
        // Week one: know the segments before you schedule a two-hour mock.
        System.out.println("=== Core mock segments ===");
        System.out.println("Warmup         | STAR outline + one metric you will cite");
        System.out.println("Deep dive      | design or coding with visible timer");
        System.out.println("Behavioral     | two stories with I-owned Action");
        System.out.println("Your questions | team, on-call, Java roadmap");
        System.out.println("Retro          | one comms fix + one content fix");
        System.out.println();

        // Paste these when the mock turns to Java proof points.
        System.out.println("=== How to verify a Java claim in a mock ===");
        System.out.println("jcmd <pid> Thread.print   -> BLOCKED threads, lock owners");
        System.out.println("jcmd <pid> GC.heap_info   -> heap + Metaspace snapshot");
        System.out.println("jstat -gc -t <pid> 1s     -> Young GC rate after launch");
        System.out.println("Distributed trace         -> waterfall for p99 tail");
        System.out.println();

        // Symptoms that look like talent gaps but are structure problems.
        System.out.println("=== Beginner mock mistakes ===");
        System.out.println("Silent coding    -> peer cannot score thinking aloud");
        System.out.println("No timer         -> panic feels random, not trainable");
        System.out.println("Skipping retro   -> same mistakes repeat next week");
        System.out.println("Arguing hints    -> wastes minutes like bad scoping meetings");
        System.out.println();

        // One sentence before you walk into the mock room.
        System.out.println("=== Remember this ===");
        System.out.println("Timer, think aloud, echo hints, retro — then one Java command to memorize.");
        System.out.println();

        // Tie narration to JVM reality when interviewers go deep.
        System.out.println("=== JVM signals that support your mock story ===");
        System.out.println("Virtual threads + JDBC pin -> JFR jdk.VirtualThreadPinned on Java 21");
        System.out.println("Heap churn from DTOs       -> jcmd GC.class_histogram under load");
        System.out.println("RSS vs cgroup limit        -> jcmd VM.native_memory summary");
    }
}`;
  const output = `=== Core mock segments ===
Warmup         | STAR outline + one metric you will cite
Deep dive      | design or coding with visible timer
Behavioral     | two stories with I-owned Action
Your questions | team, on-call, Java roadmap
Retro          | one comms fix + one content fix

=== How to verify a Java claim in a mock ===
jcmd <pid> Thread.print   -> BLOCKED threads, lock owners
jcmd <pid> GC.heap_info   -> heap + Metaspace snapshot
jstat -gc -t <pid> 1s     -> Young GC rate after launch
Distributed trace         -> waterfall for p99 tail

=== Beginner mock mistakes ===
Silent coding    -> peer cannot score thinking aloud
No timer         -> panic feels random, not trainable
Skipping retro   -> same mistakes repeat next week
Arguing hints    -> wastes minutes like bad scoping meetings

=== Remember this ===
Timer, think aloud, echo hints, retro — then one Java command to memorize.

=== JVM signals that support your mock story ===
Virtual threads + JDBC pin -> JFR jdk.VirtualThreadPinned on Java 21
Heap churn from DTOs       -> jcmd GC.class_histogram under load
RSS vs cgroup limit        -> jcmd VM.native_memory summary
`;
  return { code, output };
}

function buildMidCode() {
  const code = `package arch.day90;

/**
 * Four full mock interview simulation scenarios a senior engineer narrates.
 */
public class Day90Intermediate {

    static void scenario1() {
        // Feature-level mistake: first coding mock spent in silence.
        System.out.println("--- Scenario 1: coding mock ended with no thinking-aloud signal ---");
        System.out.println("symptom:  peer wrote 'could not assess communication' on feedback form");
        System.out.println("cause:    twelve minutes of silent typing while solving two-sum variant");
        System.out.println("why:      interviewers score narration; silence reads as stuck or rude");
        System.out.println("fix:      narrate assumptions, tests, and trade-offs while you type");
        System.out.println("verify:   record audio; count sentences per minute during IDE segment");
        System.out.println("next:     add jcmd Thread.print line when you mention Java concurrency");
        System.out.println();
    }

    static void scenario2() {
        // Production-shaped: energy crash after back-to-back mock segments.
        System.out.println("--- Scenario 2: onsite mock day part three brain fog on Java trivia ---");
        System.out.println("symptom:  blanked on difference between Callable and Runnable under time");
        System.out.println("cause:    no break, no snack, no hydration between two hour blocks");
        System.out.println("why:      cognitive load stacks like real panels; fatigue is data");
        System.out.println("fix:      schedule five minute walks between segments; same order as offer week");
        System.out.println("verify:   heart rate or simple mood score 1-5 after each mock for two weeks");
        System.out.println("next:     pair jstat -gc snapshot story with one STAR about sleep discipline");
        System.out.println();
    }

    static void scenario3() {
        // Performance angle: rushed behavioral mock skipped Result numbers.
        System.out.println("--- Scenario 3: behavioral mock ran out of time before Result metrics ---");
        System.out.println("symptom:  hiring manager follow-up said Result felt like fiction");
        System.out.println("cause:    finished Situation early but ran out of time before metrics");
        System.out.println("why:      STAR scoring weights Action and Result heavier than drama");
        System.out.println("fix:      cap Situation at twenty seconds in practice; rehearse one number");
        System.out.println("verify:   peer checks every Result line for MTTR percent or dollars");
        System.out.println("next:     add Grafana screenshot habit even in mock retro notes");
        System.out.println();
    }

    static void scenario4() {
        // Team architecture: org runs mocks without shared rubric.
        System.out.println("--- Scenario 4: fifty engineers; mock feedback contradicts across panels ---");
        System.out.println("symptom:  same candidate hears 'too detailed' and 'not detailed enough'");
        System.out.println("cause:    each mentor invented private scoring with no clarify-first row");
        System.out.println("why:      drift makes candidates distrust the whole program");
        System.out.println("fix:      publish one rubric: clarify, failure modes, Java verification, STAR numbers");
        System.out.println("verify:   quarterly audit of feedback forms against rubric keywords");
        System.out.println("next:     jcmd GC.heap_info drill for any mock claiming heap improvements");
        System.out.println();
    }

    public static void main(String[] args) {
        // Header ties stdout to mock prep, not prod logs.
        System.out.println("=== Day90Intermediate: four full mock interview war stories ===");
        System.out.println("Tip: run with java arch.day90.Day90Intermediate from compiled classes.");
        System.out.println("Each scenario names a verify step you can paste into mock retros.");
        System.out.println("When Java is involved, pair claims with jcmd or trace proof.");
        System.out.println();
        scenario1();
        scenario2();
        scenario3();
        scenario4();
        System.out.println("=== End of scenario pack ===");
        System.out.println("Attach mock scorecard, audio timestamp, and retro notes to your tracker.");
    }
}`;
  const output = `=== Day90Intermediate: four full mock interview war stories ===
Tip: run with java arch.day90.Day90Intermediate from compiled classes.
Each scenario names a verify step you can paste into mock retros.
When Java is involved, pair claims with jcmd or trace proof.

--- Scenario 1: coding mock ended with no thinking-aloud signal ---
symptom:  peer wrote 'could not assess communication' on feedback form
cause:    twelve minutes of silent typing while solving two-sum variant
why:      interviewers score narration; silence reads as stuck or rude
fix:      narrate assumptions, tests, and trade-offs while you type
verify:   record audio; count sentences per minute during IDE segment
next:     add jcmd Thread.print line when you mention Java concurrency

--- Scenario 2: onsite mock day part three brain fog on Java trivia ---
symptom:  blanked on difference between Callable and Runnable under time
cause:    no break, no snack, no hydration between two hour blocks
why:      cognitive load stacks like real panels; fatigue is data
fix:      schedule five minute walks between segments; same order as offer week
verify:   heart rate or simple mood score 1-5 after each mock for two weeks
next:     pair jstat -gc snapshot story with one STAR about sleep discipline

--- Scenario 3: behavioral mock ran out of time before Result metrics ---
symptom:  hiring manager follow-up said Result felt like fiction
cause:    finished Situation early but ran out of time before metrics
why:      STAR scoring weights Action and Result heavier than drama
fix:      cap Situation at twenty seconds in practice; rehearse one number
verify:   peer checks every Result line for MTTR percent or dollars
next:     add Grafana screenshot habit even in mock retro notes

--- Scenario 4: fifty engineers; mock feedback contradicts across panels ---
symptom:  same candidate hears 'too detailed' and 'not detailed enough'
cause:    each mentor invented private scoring with no clarify-first row
why:      drift makes candidates distrust the whole program
fix:      publish one rubric: clarify, failure modes, Java verification, STAR numbers
verify:   quarterly audit of feedback forms against rubric keywords
next:     jcmd GC.heap_info drill for any mock claiming heap improvements

=== End of scenario pack ===
Attach mock scorecard, audio timestamp, and retro notes to your tracker.
`;
  return { code, output };
}

function buildAdvCode() {
  const code = `package arch.day90;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Tech lead + staff: mock rubric triage without live I/O.
 */
public class Day90Advanced {

    record MockSignal(String segment, boolean clarifyWeak, boolean failureWeak, boolean javaProofWeak) {}

    public static void main(String[] args) {
        // Block 1 models three mock segments and weak-signal flags from last session.
        System.out.println("=== Block 1: mock segment weak-signal flags ===");
        List<MockSignal> rows = List.of(
            new MockSignal("design", true, false, false),
            new MockSignal("coding", false, true, false),
            new MockSignal("behavioral", false, false, true)
        );
        for (MockSignal m : rows) {
            System.out.println(m.segment() + " clarifyWeak=" + m.clarifyWeak()
                + " failureWeak=" + m.failureWeak() + " javaProofWeak=" + m.javaProofWeak());
        }
        System.out.println();

        // Block 2 maps each gap to first coaching action before next mock.
        System.out.println("=== Block 2: map gap to first coaching action ===");
        Map<String, String> action = new LinkedHashMap<>();
        action.put("clarify_weak", "repeat five clarifies aloud before any diagram or IDE");
        action.put("failure_weak", "add three-minute failure block: retry, partition, hot key");
        action.put("java_proof_weak", "memorize jcmd Thread.print plus one JFR event line");
        for (Map.Entry<String, String> e : action.entrySet()) {
            System.out.println("gap " + e.getKey() + " -> " + e.getValue());
        }
        System.out.println();

        // Block 3 paste-ready triage for mock retro + panel alignment.
        System.out.println("=== Block 3: mock retro + JVM verification checklist ===");
        Map<String, String> table = new LinkedHashMap<>();
        table.put("Silent coding habit", "audio review sentences-per-minute target");
        table.put("STAR vague Result", "numeric MTTR percent or dollars in Result line");
        table.put("Java latency claim", "jcmd Thread.print + trace waterfall proof");
        for (Map.Entry<String, String> e : table.entrySet()) {
            System.out.println(e.getKey() + " | " + e.getValue());
        }
        System.out.println();
        System.out.println("Ordered mock prep: timer visible, then clarify, then failure, then Java proof.");
        System.out.println("Escalation bundle: mock scorecard PDF + audio timestamp + Grafana if cited.");
        System.out.println("Java 21 note: virtual thread pool sizing needs JFR pin check.");
        System.out.println("Java 17 note: sealed domain types help readability in public API sketches.");
        System.out.println("Prevention: weekly mock retro enforces STAR worksheet with numbers.");
        System.out.println("Prevention: platform rubric bans merges to interview story without Result metric.");
        System.out.println("Behavioral note: use I not we when describing your Action.");
        System.out.println("Done: attach this stdout next to interview scorecard rubric.");
        System.out.println("Trace note: paste three trace IDs beside any latency claim in mock.");
        System.out.println("SLO note: tie error budget language to mock stories not only ops chat.");
    }
}`;
  const output = `=== Block 1: mock segment weak-signal flags ===
design clarifyWeak=true failureWeak=false javaProofWeak=false
coding clarifyWeak=false failureWeak=true javaProofWeak=false
behavioral clarifyWeak=false failureWeak=false javaProofWeak=true

=== Block 2: map gap to first coaching action ===
gap clarify_weak -> repeat five clarifies aloud before any diagram or IDE
gap failure_weak -> add three-minute failure block: retry, partition, hot key
gap java_proof_weak -> memorize jcmd Thread.print plus one JFR event line

=== Block 3: mock retro + JVM verification checklist ===
Silent coding habit | audio review sentences-per-minute target
STAR vague Result | numeric MTTR percent or dollars in Result line
Java latency claim | jcmd Thread.print + trace waterfall proof

Ordered mock prep: timer visible, then clarify, then failure, then Java proof.
Escalation bundle: mock scorecard PDF + audio timestamp + Grafana if cited.
Java 21 note: virtual thread pool sizing needs JFR pin check.
Java 17 note: sealed domain types help readability in public API sketches.
Prevention: weekly mock retro enforces STAR worksheet with numbers.
Prevention: platform rubric bans merges to interview story without Result metric.
Behavioral note: use I not we when describing your Action.
Done: attach this stdout next to interview scorecard rubric.
Trace note: paste three trace IDs beside any latency claim in mock.
SLO note: tie error budget language to mock stories not only ops chat.
`;
  return { code, output };
}

const PITFALLS = [
  'Starting the **mock** with no **visible** **timer** — you cannot train **pressure**; fix by using **System.currentTimeMillis** or a kitchen **timer**; verify you **echo** the **timebox** aloud in the first **sixty** **seconds**.',
  'Typing **Java** in **silence** for the whole **coding** **segment** — **peer** **feedback** says "**no** **signal**"; fix by **narrating** **tests** and **trade-offs**; verify **audio** shows at least **one** **sentence** per **minute**.',
  'Ignoring **interviewer** **hints** during **practice** because "**I** **know** **better**" — **real** **panels** punish that; fix by **echoing** **scope** **changes** and **narrowing**; verify **retro** lists **one** **hint** you **accepted**.',
  'Using **one** **speed** only — **racing** through **STAR** or **dragging** on **diagrams** — **panels** feel **chaotic**; fix by **rehearsing** **twenty**-minute **blocks** with **warning** **bells**; verify **p99** **mock** **self**-**score** stabilizes **week** to **week**.',
  'Running **team** **mocks** without a **shared** **rubric** — **feedback** **contradicts**; fix by publishing **clarify**-**first**, **failure** **section**, **numeric** **STAR** **Result** rows; verify **quarterly** **audit** of **forms** **against** **keywords**.',
  'Scheduling **full** **loop** **mocks** **without** **breaks** — **fatigue** **masks** **Java** **depth**; fix by **five**-**minute** **walks** **between** **segments**; verify **mood** **score** **1**-**5** **tracks** **energy** **drift**.',
  'Claiming **virtual** **threads** fix all **blocking** **I/O** without **JFR** **jdk.VirtualThreadPinned** — **Java** **21** **services** still **stall** on **synchronized** **JDBC**; fix by **load** **test** with **pin** **events** on; verify **JFR** **recording** shows **zero** **pin** spikes at target **QPS**.',
  'Letting **production** **deploy** **stress** **erase** **mock** **habits** — **SLO** **burn** returns while **communication** **atrophies**; fix by **monthly** **refresher** **mock** with **same** **rubric**; verify **offer**-**week** **retro** **matches** **practice** **retro** **format**.'
];

function fuProd() {
  return {
    question: 'How does a weak **mock** **retro** show up in **production** or **hiring** loops?',
    answer:
      'You ship a **cache** without **TTL** because the **whiteboard** skipped **eviction**, then **Redis** **memory** pressure causes **timeout** storms that look like **dependency** bugs. In **hiring**, the same pattern sounds like **buzzword** spray with no **failure** section. You prove the gap with **Grafana** **p99** plus **jcmd** **Thread.print** on the **Java** service showing **BLOCKED** **pool** threads waiting on **slow** **Redis**.'
  };
}

function fuTrap() {
  return {
    question: 'What is a common trap people believe about **behavioral** **STAR** answers?',
    answer:
      'People think a long **Situation** equals depth. **Interviewers** score **Action** and **Result** with numbers. Trap fix: cap **Situation** at **twenty** seconds, spend **time** on what **you** changed, end with **MTTR**, **percent**, or **dollars**. When the story involves **Java** **21**, mention how you validated **virtual** **threads** with **JFR** so it is not hand-waving.'
  };
}

function ca(core, err, cmd, ver) {
  const tail =
    ' Teams still get burned when **Java** **21** **virtual** **threads** pin on **synchronized** **JDBC** and **JFR** **jdk.VirtualThreadPinned** spikes while **CPU** looks idle. Capture **JFR** on **JDK** **21** with that event enabled. When **Young** **GC** storms after a bad **DTO** design, **jcmd** **GC.class_histogram** shows **byte** arrays from **JSON** parsing. **ZGC** **Generational** mode on **21** shifts pause semantics versus **17**, so tie **SLO** claims to **JDK** and **collector** names in postmortems.';
  return `${core} At the **JVM** level **HotSpot** executes **bytecode**, **JIT** compiles hot **nmethods**, and **GC** threads reclaim **heap** regions while your **mutator** threads run, so your **mock** **interview** answers about **Java** services become **allocation** and **pause** stories under **pressure**. ${err} You shorten mean time to clue with ${cmd}. ${ver}${tail}`;
}

const CONCEPTUAL_Q = [
  ['What does **STAR** mean when you rehearse **behavioral** **mocks**?', '**STAR** is **Situation**, **Task**, **Action**, **Result** — a spine that forces ownership and proof.', 'Vague **we** with no metric in **Result** reads as **fiction** and fails **Staff** follow-ups.', 'Record audio and time-box **Situation** under **twenty** seconds.', '**Java** **21** interviewers still ask how you proved **virtual** **thread** safety with **JFR** events.'],
  ['What is the first thing you agree on before you start the **mock** **timer**?', 'You **clarify** **segment** **order**, **who** **calls** **time**, and what "**done**" looks like before you draw **Kafka**.', 'Skipping **clarify** yields **chaotic** **mocks** — nobody knows what to score.', 'Write **assumptions** in a **shared** **doc** and ask your **peer** to correct them.', '**Java** **17** **sealed** **classes** can model **domain** boundaries you sketch, a detail that signals depth beyond logos.'],
  ['What is **think** **aloud** in a **coding** **mock**?', 'You **narrate** **tests**, **trade-offs**, and **edge** **cases** while **mutator** **threads** run your **IDE** steps.', 'Silence looks like **deadlock** to **interviewers** even when your **code** compiles.', 'Use **audio** **playback** to count **sentences** per **minute** after the **mock**.', '**Java** **11** **HttpClient** versus **21** **virtual** **threads** changes how you size **connection** **pools**.'],
  ['What is a **retro** after a **full** **mock** **simulation**?', 'A **five**-**minute** **note**: **one** **communication** fix, **one** **content** fix, **one** **Java** **proof** habit.', 'Skipping **retro** means you repeat **silent** **coding** next **week**.', 'Paste **retro** bullets next to **jcmd** **one**-**liners** you forgot.', '**Java** **21** record patterns help express **command** **DTO**s cleanly so **keys** are first-class.'],
  ['What is **timeboxing** in **panel** **prep**?', 'You assign **minutes** to **warmup**, **deep** **dive**, **behavioral**, and **questions** so **pressure** feels familiar.', 'Without **timeboxing**, **p99** **surprises** hit on **offer** **week**.', 'Use a **visible** **clock** and **warning** **bells** at **half** **time**.', '**Java** **8** **Date** pitfalls are gone in **java.time**, but **version** mix in **services** still breaks **serialization** contracts.'],
  ['What is **energy** management across **back-to-back** **mock** **segments**?', 'You **hydrate**, **walk**, and **reset** **attention** between **blocks** like a real **onsite**.', 'Skipping **breaks** makes **Java** **trivia** answers look worse than they are.', 'Track **mood** **score** **1**-**5** after each **segment** for two **weeks**.', '**Java** **17** **Vector** **API** is irrelevant here; focus on **key** **design** and **backpressure**.'],
  ['What is **follow-up** **probing** in a **Staff** **mock**?', 'The **peer** asks **narrow** **questions** after your **diagram** to mimic **real** **depth**.', 'If you **freeze**, **narrow** **scope** and propose a **spike** — same as **production** **incidents**.', 'Practice **pause**, **restate**, **answer**, **reconnect** to **board**.', '**Java** **21** **structured** **concurrency** previews change how you express fan-out safely — name your **JDK**.'],
  ['What is **signal** versus **noise** in **mock** **feedback**?', '**Signal** names a **habit** you can **repeat**; **noise** is vague "**be** **stronger**."', 'Noise-heavy **feedback** wastes **retro** **minutes**.', 'Ask **peer** to tag **signal** with **rubric** **rows**.', '**Java** **11** **TLS** defaults differ from **17** for **service** **mesh** — mention **version** when discussing **multi-region**.'],
  ['Why record **audio** of **behavioral** **mocks**?', 'You hear **filler** **words**, **long** **Situation** **ramble**, and **missing** **numbers** in **Result**.', 'Without **audio**, you **believe** you sounded **clear**.', 'Count **I** versus **we** in **Action** **paragraph**.', '**Java** **21** **virtual** **threads** need **SLO** updates because **carrier** **pool** exhaustion shows as tail latency.'],
  ['What **rubric** **row** might you add for **Java** **depth** in **mocks**?', '**Java** **proof** **line**: cite **jcmd** **Thread.print** or **jstat** **-gc** when you claim **latency** wins.', 'Without it, **Staff** **listeners** hear **buzzwords** only.', 'Paste **Grafana** **UID** beside **mock** **scorecard**.', '**Java** **17** **multi-release** **JAR** helps run old and new **bytecode** edges during migration.'],
  ['How do you disagree with **peer** **feedback** **constructively** after a **mock**?', 'You bring **data**, offer **alternatives**, and escalate with a **decision** **owner** — no personal blame.', 'Trash-talking a teammate fails **Staff** **bar** and can violate **HR** norms.', 'Reference **RFC** links and **postmortem** **action** items you filed.', '**Java** **11** versus **21** upgrades are classic disagreement topics — show **JFR** evidence, not opinion.'],
  ['What is **retry** **amplification** tied to **mock** **stories**?', 'Clients **retry** at the same time, multiplying load on a struggling dependency.', 'It looks like a **mystery** **outage** across **healthy** **dashboards**.', 'Use **distributed** **trace** **count** of **retry** **spans** per **root** request.', 'Pair with **jcmd** **Thread.print** to see **thread** **pool** exhaustion in **Java** gateways.'],
  ['What belongs in the **last** **five** **minutes** of a **mock**?', '**Summary** **trade-offs**, **invite** **questions**, **thank** **peer** — same as **real** **loops**.', 'Rambling past **time** signals poor **communication** even if ideas are good.', 'Record **one** **sentence** you would **cut** next **time** after **playback**.', 'If **Java** is the **runtime**, mention **heap** sizing versus **pod** limit using **jcmd** **VM.native_memory** **summary**.'],
  ['How do you end a **design** **mock** **segment** when **time** **expires**?', 'You **state** **unfinished** **work**, **name** **next** **step**, **offer** **trade-off** **table**.', 'Silence reads as **panic** even if your **diagram** was **half** **good**.', 'Practice **twenty**-minute **timer** mocks twice weekly.', '**Java** **21** **preview** features should be labeled **preview** so **interviewer** trusts your **version** awareness.'],
  ['What is a **mock** **journal** **entry** after **practice**?', 'You write **one** **STAR** **metric**, **one** **diagram** **gap**, **one** **Java** **command** to memorize.', 'Without **journal**, **retro** **blur** **together**.', 'Review **last** **week** **entry** before the **next** **mock** **starts**.', '**Java** **17** **records** help model **OutboxRow** immutably for reviewers.'],
  ['What is **stress** **testing** your **mock** **habits**?', 'You **inject** **surprise** **follow-ups** in **staging** **mocks** so **real** **panels** feel familiar.', 'Teams that never **stress** **test** **communication** discover **panic** on **offer** **week**.', 'Run **game** **day** **kill** **pod** script and capture **SLO** burn.', '**Java** **11** **FlightRecorder** can run during **chaos** to correlate **GC** with **injected** **latency**.'],
  ['What does a **Staff** engineer add to **mock** **prep** **culture**?', 'They tie **rubrics** to **SLO** **burn**, **cost**, **security**, and **verification** commands like **jcmd** and **trace** IDs.', 'Stopping at **diagram** beauty without **metric** proof fails **Staff** **loop**.', 'Attach **before**/**after** **Grafana** screenshots and **java** **-version** to **postmortems**.', '**Java** **21** **Generational** **ZGC** changes how you discuss **pause** budgets versus **Java** **17** **ZGC**.'],
  ['What is **second**-order thinking in **mock** **trade-offs**?', 'You ask what happens after your **communication** fix — **fatigue**, **scope** **creep**, **retry** **storms**.', 'First-order "**talk** **more**"** without **timer** discipline causes **ramble**.', 'Model **load** **test** with **skewed** keys.', '**Java** **heap** **pressure** from giant **cached** **JSON** shows in **jcmd** **GC.class_histogram** under **load**.']
];

function buildConceptual() {
  return CONCEPTUAL_Q.map(([q, a1, e2, c3, v4], i) => ({
    question: q,
    answer: ca(a1, e2, c3, v4),
    followUps: [fuProd(), fuTrap()]
  }));
}

const CB_QUESTIONS = [
  'What prints?\n```java\nclass P {\n  public static void main(String[] a) {\n    Integer x = 200;\n    Integer y = 200;\n    System.out.println(x == y);\n  }\n}\n```',
  'Output?\n```java\nclass Q {\n  public static void main(String[] a) {\n    String s = "";\n    for (int i = 0; i < 3; i++) s += i;\n    System.out.println(s.length());\n  }\n}\n```',
  'What prints?\n```java\nclass R {\n  public static void main(String[] a) {\n    long t0 = System.nanoTime();\n    int x = 0;\n    for (int i = 0; i < 1000; i++) x += i;\n    long t1 = System.nanoTime();\n    System.out.println(x > 0 ? "work" : "skip");\n  }\n}\n```',
  'Smell?\n```java\n// long sum = 0;\n// for (Integer v : list) sum += v;\n```',
  'Order?\n```java\nclass S {\n  static String a = init("A");\n  static String b = init("B");\n  static String init(String x) { return x; }\n  public static void main(String[] args) { System.out.println(a + b); }\n}\n```',
  'Flag?\n```java\n// -XX:+AlwaysPreTouch at JVM startup\n```',
  'Thread state?\n```java\nclass T {\n  public static void main(String[] a) {\n    Thread.yield();\n    System.out.println("yielded");\n  }\n}\n```',
  'Boxing?\n```java\nclass U {\n  public static void main(String[] args) {\n    Integer a1 = 100;\n    Integer b1 = 100;\n    System.out.println(a1 == b1);\n  }\n}\n```',
  'GC hint?\n```java\n// jstat -gc <pid> 1s\n```',
  'Profiler?\n```java\n// jcmd <pid> JFR.start duration=30s filename=rec.jfr\n```',
  'Map?\n```java\n// new HashMap from multiple writer threads without synchronization\n```',
  'JIT?\n```java\n// -XX:TieredStopAtLevel=1 quick dev JVM\n```'
];

const CB_TAIL =
  ' **Metaspace** still grows when **Spring** loads thousands of **BeanDefinition** classes, so **OutOfMemoryError** **Metaspace** can follow big refactors. Cross-check **JDK** **17** versus **21** **GC** defaults because **ZGC** **generational** mode changes pause histograms. When **p99** spikes, pair **jcmd** **Thread.print** with **JFR** **socket** **read** events before you blame **Postgres**.';

function cbAns(i) {
  const bodies = [
    '**Integer** **valueOf** caches **-128**..**127**, so **200** boxes distinct objects and **==** compares references, printing **false**. Production risk is using **==** on **Integer** fields from **JSON**. Use **Objects.equals** or **intValue**. **javap** **-c** on **Integer.valueOf** shows the cache. **Java** **17** behavior matches **11** for this cache range.',
    'Loop builds **String** **"012"** via **concatenation**, so **length** is **3**. Each **+** can allocate a new **String**; **JIT** may optimize small loops but allocation pressure remains in hot services. Prefer **StringBuilder** in hot paths. **jcmd** **GC.class_histogram** shows **String** churn. **Java** **21** **String** internals stay compact **byte**-backed.',
    'Loop accumulates **x** so it is positive; ternary prints **work**. **nanoTime** delta is not printed, so **JIT** cannot eliminate the loop entirely, but without **JMH** **Blackhole** other microbenchmarks still lie. **JMH** consumes results explicitly. **Java** **11**+ **C2** still optimizes aggressively.',
    '**Integer** in the enhanced **for** autoboxes each **int** from a primitive list or unboxes from **Integer** list; mixed misuse allocates heavily. **NullPointerException** can appear if list holds **null** **Integer**. **jcmd** **GC.class_histogram** shows **Integer** spikes. **Java** **8** streams still autobox unless you use **mapToInt**.',
    '**static** fields **a** then **b** initialize in declaration order, **println** prints **AB**. This mirrors **static** initializer order affecting **singleton** **JVM** flags. Wrong order can expose half-built config to **JIT**. **Java** **17** class initialization rules unchanged.',
    '**AlwaysPreTouch** forces the **JVM** to touch every **heap** page at startup so later **page** faults do not hit request path; it raises startup time and **RSS** early. Pair with **Kubernetes** **memory** limits carefully. Verify with **jcmd** **VM.flags**. **Java** **11**+ supports the flag on **HotSpot** server builds.',
    '**yield** hints the scheduler; **println** still runs and prints **yielded**. This is not a performance fix, just scheduling noise. Real contention shows **BLOCKED** in **jcmd** **Thread.print**. **Java** **21** **virtual** threads change scheduling semantics versus platform threads.',
    '**100** is inside **Integer** cache, so **==** may print **true** for this **JVM**. Relying on that is fragile; cache is implementation detail. Use **equals** for **Integer** **API** fields. **javap** shows **Integer.valueOf** usage from autoboxing. **Java** **17** cache rule same as **11**.',
    '**jstat** **-gc** prints **S0C**, **E**, **OC**, **YGC**, **YGCT** so you see **Young** collections per second. Rising **YGC** with flat traffic signals **allocation** bugs. Combine with **jcmd** **GC.heap_info**. Works on **Java** **8** through **21** with **jstat** from same **JDK** **bin**.',
    '**JFR.start** records **events** into **rec.jfr** for **JDK** **Mission** **Control** analysis. Use **duration** bounds to avoid giant files. **Java** **17** **JFR** is default-supported; **Java** **21** adds more **virtual** **thread** events you should enable explicitly.',
    '**HashMap** is not thread-safe for concurrent **put**; internal structure can corrupt and **get** may spin or misbehave. Use **ConcurrentHashMap**. Verify with stress **JUnit** and **jcmd** **Thread.print** under load. **Java** **17** **HashMap** treeifies buckets like **11**.',
    '**TieredStopAtLevel=1** stops at **C1**, speeding startup but leaving hot loops unoptimized until you remove the flag. Profiling **staging** with this flag misleads prod **C2** behavior. Compare **java** **-XX:+PrintCompilation** output. **Java** **21** tiered defaults still respect this knob.'
  ];
  return (bodies[i] || bodies[0]) + CB_TAIL;
}

function buildCodeBased() {
  return CB_QUESTIONS.map((q, i) => ({
    question: q,
    answer: cbAns(i),
    followUps: [
      { question: 'What breaks in **prod** **design** if you ignore this behavior?', answer: fuProd().answer },
      { question: 'What **interview** or **JVM** trap does this expose?', answer: fuTrap().answer }
    ]
  }));
}

function senior(q, body) {
  return {
    question: q,
    answer: body,
    followUps: [
      { question: 'How do you communicate **ETA**?', answer: fuProd().answer },
      { question: 'What **post-incident** item is mandatory?', answer: fuTrap().answer }
    ]
  };
}

const SENIOR_TAIL =
  '\n\nDeeper runbook: attach the approved **design** **doc** **PDF** with **SLO** table, **Grafana** **p99** screenshot with UTC window, and **distributed** **trace** export for the incident slice. When **Java** **services** are involved, stash **jcmd** **<pid>** **Thread.print**, **jstat** **-gc** **-t** **<pid>** **1s** for two minutes, and **JFR** **jcmd** **JFR.dump** if a recording was running. Record **java** **-version** and **-XX:** flags beside **git** **SHA** so **Java** **21** **Generational** **ZGC** upgrades do not reopen the ticket. After fixes, rerun the same **load** script duration and paste **error** **budget** burn. When threads wait on **java.net.SocketInputStream.read**, attach **mesh** or **tcpdump** proof so you do not mislabel **I/O** as **cache** miss. Capture **jcmd** before **Kubernetes** replaces **pid**. File a **postmortem** **STAR** worksheet where **Result** includes a number. Update the **design** template so the **failure** section lists **retry** budget and **idempotency** explicitly.';

const SENIOR_BLOCK = (a, b, c, d) =>
  `**Immediate response:** ${a}\n\n**Root cause:** ${b}\n\n**Fix:** ${c}\n\n**Prevention:** ${d}\n\nStaff note: link **RFC** or **design** **doc** revision; capture **jcmd** **<pid>** **Thread.print**, **jstat** **-gc** **-t** **<pid>** **1s**, and **JFR** dump when **Java** is in scope; compare **GC.heap_info** if **heap** symptoms appear. Document **cgroup** limit beside **-Xmx** for **RSS** truth.${SENIOR_TAIL}`;

function buildSenior() {
  return [
    senior(
      '**Hiring** **panel** rejected a **Staff** candidate who "**knew** **Kafka**" but could not explain **read** versus **write** **QPS**.',
      SENIOR_BLOCK(
        'Pause the debrief and list three **clarifying** questions the candidate skipped; replay a **twenty**-minute **mock** with timer.',
        'They optimized for **logo** recall instead of **constraint** discovery, so the **case** **study** never grounded in **SLO** or **money**.',
        'Add **rubric** row "**clarify** before **diagram**" weighted **25** percent; coach with **recorded** mocks.',
        'Publish **interview** **template** that forces **assumptions** written on the board in first **five** minutes.'
      )
    ),
    senior(
      '**Finance** sees duplicate **ledger** rows after **checkout** **retry** rollout; **HTTP** **200** logs look healthy.',
      SENIOR_BLOCK(
        'Freeze feature flag; pull **distributed** **trace** samples filtered by **retry** **count** **>** **2**.',
        '**Design** **doc** approved **retry** without **idempotency** **keys** on **non-idempotent** **POST**; **Java** **client** **thread** **pools** exhausted amplifying delays.',
        'Ship **Idempotency-Key** header enforcement in **gateway**; add **DB** **unique** constraint on **(client,idempotency_key)**; verify with **reconciliation** job delta **zero** for **seven** days.',
        '**Design** **template** mandates **idempotency** section for any **write** **API**; **ArchUnit** or **contract** tests block merge without header schema.'
      )
    ),
    senior(
      '**Redis** **memory** hits **maxmemory**; **Java** **catalog** service **p99** triples; **CPU** uneven across shards.',
      SENIOR_BLOCK(
        'Open **redis** **INFO** **keyspace** and **commandstats**; identify **hot** **key** skew versus **partition** plan.',
        '**Whiteboard** **cache** skipped **TTL** and **eviction**; viral **SKU** keys saturated one shard.',
        'Add **TTL**, **local** **L1** for top keys, reshuffle **consistent** **hash** ring; verify even **commandstats** per shard under **zipfian** **load**.',
        '**Code** **review** checklist requires **cache** section: **TTL**, **stampede** guard, **memory** bound; attach **jcmd** **GC.class_histogram** if **Java** **heap** mirrors **Redis** pressure.'
      )
    ),
    senior(
      '**VP** asks why **SRE** keeps paging for "**dependency** **timeouts**" after your team "**finished** **microservices** **split**".',
      SENIOR_BLOCK(
        'Pull **SLO** **dashboard** for **client** **outbound** **p99** versus **server** **inbound** **p99**; diff **trace** depth per **request**.',
        'Each **service** chose different **retry** and **timeout**; **retry** **amplification** matched **thundering** **herd** from **design** drift.',
        'Publish platform **retry** **standard** with **jitter** and **bulkhead** defaults; enforce via **service** **mesh** policy.',
        'Quarterly **architecture** review compares **design** **doc** **retry** sections to live **mesh** config using **CI** diff job.'
      )
    ),
    senior(
      '**Java** **21** **virtual** **threads** enabled company-wide; **random** **p99** spikes; **behavioral** postmortem blames "**vendor** **JDBC**".',
      SENIOR_BLOCK(
        'Start **JFR** with **jdk.VirtualThreadPinned** enabled on canary **pod** during **load** test.',
        '**synchronized** blocks inside **legacy** **JDBC** pinned carriers; **design** assumed infinite **cheap** threads.',
        'Move pinned calls to **platform** **executor** or upgrade driver; add **JFR** gate in **staging** before **percent** rollout **>** **25**.',
        '**Design** **doc** appendix lists **pinning**-safe libraries; **dependency** bot fails PR if library on denylist without waiver.'
      )
    ),
    senior(
      '**Candidate** **STAR** story ends with vague **we** became more resilient — no numbers — and **hiring** **manager** scores **no** **hire**.',
      SENIOR_BLOCK(
        'Ask one drill: what **number** moved in **Result**? Give **sixty** seconds to revise **Result** only.',
        '**Behavioral** answer lacked **I**-owned **Action** and measurable **Result**; interviewers cannot score impact.',
        'Coach **STAR** worksheet: **Result** must cite **MTTR**, **percent**, **dollars**, or **incident** **count**; record audio replay.',
        'Add **peer** **mock** **rubric** banning **adjective**-only **Result** lines; **Staff** **loop** uses same rubric for **promo** packets.'
      )
    )
  ];
}

const WRONG = [
  'You should skip the **timer** during **mocks** because **pressure** is unrealistic in practice.',
  '**Behavioral** **STAR** stories are better when **Situation** takes most of the time because context is everything.',
  '**Eventual** **consistency** means users never see stale data if you use a **CDN**.',
  '**Microservices** always reduce **complexity** compared to a **monolith** for any team size.',
  'You never need **idempotency** **keys** if your **HTTP** **clients** only **retry** on **GET** requests.',
  '**Virtual** **threads** in **Java** **21** remove the need to profile **blocking** **calls** or **JDBC** drivers.',
  '**Mock** **feedback** is optional if you already **felt** good about the **session**.',
  '**CAP** **theorem** says you can have **consistency**, **availability**, and **partition** **tolerance** all at **100**% in one **region**.'
];

function buildMcq() {
  const mk = (id, level, category, question, options, answer, explanation) => ({
    id,
    level,
    category,
    question,
    options,
    answer,
    explanation
  });
  const q = [];
  let id = 1;
  const B = (cat, question, o, a, e) => q.push(mk(id++, 'basic', cat, question, o, a, e));
  const I = (cat, question, o, a, e) => q.push(mk(id++, 'intermediate', cat, question, o, a, e));
  const A = (cat, question, o, a, e) => q.push(mk(id++, 'advanced', cat, question, o, a, e));

  B(
    'theory',
    'What does **STAR** stand for in **behavioral** **interview** **mocks**?',
    {
      A: '**Situation** **Task** **Action** **Result**',
      B: '**Scope** **Timeline** **Architecture** **Review**',
      C: '**Sprint** **Test** **Accept** **Release**',
      D: '**System** **Throughput** **Availability** **Reliability**'
    },
    'A',
    '**STAR** forces ownership and measurable **Result**.'
  );
  B(
    'theory',
    'What should you agree on **before** you start the **mock** **timer**?',
    {
      A: '**Segment** **order**, **who** **calls** **time**, and what "**done**" looks like',
      B: 'Pick **Kafka** immediately',
      C: 'Draw **Kubernetes** clusters',
      D: 'Discuss your favorite **IDE**'
    },
    'A',
    'Ground rules stop **chaotic** **mocks** so **feedback** is **scorable**.'
  );
  B(
    'theory',
    'What is **idempotency** about?',
    {
      A: 'Retries produce the same logical outcome without duplicate side effects',
      B: 'Every **HTTP** call must be a **GET**',
      C: '**Caches** never expire',
      D: '**SQL** **joins** are forbidden'
    },
    'A',
    '**Idempotency** **keys** stop **retry** **double** **charges**.'
  );
  B(
    'theory',
    'What is **eventual** **consistency**?',
    {
      A: 'Replicas converge later; reads may be briefly stale',
      B: 'Every **read** is **linearizable** instantly',
      C: '**Databases** never replicate',
      D: 'Same as **strong** **consistency**'
    },
    'A',
    'Know the user-visible **stale** **read** symptom.'
  );
  B(
    'code',
    'What prints?\n```java\nclass X {\n  public static void main(String[] a) {\n    Integer x = 300;\n    Integer y = 300;\n    System.out.println(x == y);\n  }\n}\n```',
    { A: 'true', B: 'false', C: 'throws', D: '0' },
    'B',
    '**300** is outside **Integer** cache; **==** compares references — like unsafe **design** assumptions.'
  );
  B(
    'code',
    'Output?\n```java\nclass Y {\n  public static void main(String[] a) {\n    System.out.println("a" + "b" == "ab");\n  }\n}\n```',
    { A: 'false always', B: 'true at runtime due to **String** constant folding in this case', C: 'compile error', D: 'null' },
    'B',
    'Literal folding mirrors how **API** contracts must be explicit, not assumed.'
  );
  B(
    'code',
    'Smell in a **design** **doc** comment?\n```java\n// Cache everything forever for speed\n```',
    {
      A: 'Missing **TTL** and **eviction** policy',
      B: 'Perfect **Redis** plan',
      C: 'Required by **Java** **21**',
      D: 'Guarantees **strong** **consistency**'
    },
    'A',
    'Caches need **memory** bounds and **staleness** rules.'
  );
  B(
    'real-world',
    'Coworker opens **mock** **interview** with **microservices** diagram before **QPS**. Best response?',
    {
      A: 'Ask them to pause and list three **clarifying** questions first',
      B: 'Praise the **Kafka** logo',
      C: 'Skip **constraints** to save time',
      D: 'Switch to **behavioral** only'
    },
    'A',
    'Order matters in real **loops** and **panels**.'
  );
  I(
    'theory',
    'What is **retry** **amplification**?',
    {
      A: 'Many clients retry together and multiply load on a weak dependency',
      B: '**DNS** cache refresh',
      C: '**Gradle** daemon restart',
      D: '**IDE** indexing speed'
    },
    'A',
    'Pair with **bulkhead** and **jitter** in **design** **docs**.'
  );
  I(
    'theory',
    'Why put **SLO** tables in **design** **docs**?',
    {
      A: 'They tie architecture choices to measurable user pain',
      B: 'They replace **code** **review**',
      C: 'They ban **Kafka**',
      D: 'They are only for **HR**'
    },
    'A',
    '**Error** **budgets** defend **p99** decisions.'
  );
  I(
    'theory',
    'What is a **hot** **partition** problem?',
    {
      A: 'One shard gets most traffic while others idle',
      B: '**CPU** always zero',
      C: '**TLS** handshake failure',
      D: '**Git** merge conflict'
    },
    'A',
    'Skew breaks average **CPU** charts.'
  );
  I(
    'theory',
    'What is **backpressure**?',
    {
      A: 'Signal for producers to slow when consumers lag',
      B: 'Always disable **queues**',
      C: '**HTTP** **301** redirect',
      D: '**JUnit** **timeout** only'
    },
    'A',
    'Prevents unbounded **queue** growth.'
  );
  I(
    'code',
    'What prints?\n```java\nclass Z {\n  public static void main(String[] a) {\n    int s = 0;\n    for (Integer i : java.util.List.of(1,2,3)) s += i;\n    System.out.println(s);\n  }\n}\n```',
    { A: '0', B: '6', C: 'throws NPE', D: 'compile error' },
    'B',
    'Unboxing mirrors hidden cost in **DTO**-heavy **API** designs.'
  );
  I(
    'code',
    'Issue?\n```java\nMap<String,String> m = new HashMap<>();\n// two threads call m.put concurrently\n```',
    { A: 'Always safe', B: '**HashMap** not safe for concurrent writes', C: 'Requires **volatile** only', D: 'Only fails on **Java** **8**' },
    'B',
    'Shared **mutable** **state** needs a **concurrency** plan in **design**.'
  );
  I(
    'code',
    'Verify tail **latency** claim?\n```java\n// jcmd <pid> Thread.print\n```',
    { A: 'Shows **BLOCKED** threads and locks', B: 'Deletes **threads**', C: 'Formats **disk**', D: 'Starts **GC** always' },
    'A',
    'Pair **jcmd** with **trace** **waterfall**.'
  );
  I(
    'code',
    'Java **heap** clue?\n```java\n// jcmd <pid> GC.class_histogram all\n```',
    {
      A: 'Ranks live classes by bytes — finds allocation hot types',
      B: 'Prints **SQL** **EXPLAIN**',
      C: 'Compiles **Kotlin**',
      D: 'Opens **IDE**'
    },
    'A',
    'Supports **cache** versus **DTO** churn arguments.'
  );
  I(
    'code',
    'GC cadence?\n```java\n// jstat -gc -t <pid> 1s\n```',
    { A: 'Samples **YGC**/**FGC** over time', B: 'Deletes **logs**', C: 'Only **Python**', D: 'Fixes **DNS**' },
    'A',
    'Watch **Young** **GC** after **launch** **traffic**.'
  );
  I(
    'real-world',
    '**Behavioral** answer ends with "**we** improved reliability." Follow-up?',
    {
      A: 'Ask what **number** moved and who owned the **Action**',
      B: 'Accept it as **Staff** level',
      C: 'Switch to **trivia**',
      D: 'Avoid **metrics** as rude'
    },
    'A',
    '**Result** needs **quant** proof.'
  );
  I(
    'real-world',
    '**VP** wants **microservices** because blog said so. You?',
    {
      A: 'Frame **team** size, **deployment** cadence, and **boundary** **data** first',
      B: 'Agree instantly',
      C: 'Refuse silently',
      D: 'Suggest **Excel** only'
    },
    'A',
    '**Tech** **Lead** grounds **architecture** in **constraints**.'
  );
  I(
    'real-world',
    'Interview hint: "**Ignore** **auth** for now**."** You should?',
    {
      A: 'Acknowledge and narrow scope instead of defending **OAuth2** ten minutes',
      B: 'Ignore the hint',
      C: 'End interview early',
      D: 'Draw only **firewalls**'
    },
    'A',
    'Echo hints like real **scoping** meetings.'
  );
  A(
    'theory',
    'Which **JDK** feature most changes **thread** **pool** sizing stories in **Java** **21** interviews?',
    { A: '**Virtual** **threads**', B: '**Applet** API', C: '**CORBA**', D: '**Swing** **Metal** **LAF**' },
    'A',
    'Pair with **JFR** **pin** events when claiming scale.'
  );
  A(
    'theory',
    'What should a **Staff** **design** **review** gate on?',
    {
      A: '**SLO**, **failure** modes, **migration**, and verification plan',
      B: 'Logo count only',
      C: '**IDE** theme',
      D: '**README** length'
    },
    'A',
    'Connect **whiteboard** to **prod** **evidence**.'
  );
  A(
    'on-call',
    '**Metaspace** **OOM** after many **hot** **redeploys** of **plugin**-style **Java** **services**. Suspect?',
    {
      A: '**Classloader** leak retaining old classes',
      B: '**Integer** cache overflow',
      C: '**String** **pool** full',
      D: '**DNS** failure'
    },
    'A',
    '**Heap** dump shows **loader** retention; fix **lifecycle** in **design**.'
  );
  A(
    'on-call',
    'After **design** launched **infinite** **retry** on **5xx**, **gateway** **p99** explodes. First suspect?',
    {
      A: '**Retry** **amplification** without **jitter** or **budget**',
      B: '**DNS** typo',
      C: '**CPU** always zero',
      D: '**Git** **LFS**'
    },
    'A',
    'Trace **retry** depth per **root** request.'
  );
  A(
    'on-call',
    '**Redis** **maxmemory** hit; **Java** **read** **service** **timeouts**. Likely **design** gap?',
    {
      A: 'Missing **TTL** / **eviction** in **cache** layer spec',
      B: 'Wrong **log4j** level',
      C: '**JUnit** too slow',
      D: '**Maven** mirror'
    },
    'A',
    'Check **memory** policy before blaming **network**.'
  );
  A(
    'on-call',
    '**Duplicate** **payments** after client **retry**. **Design** miss?',
    {
      A: 'No **idempotency** **keys** on **write** **path**',
      B: '**CPU** too high',
      C: '**TLS** **1.0**',
      D: '**IDE** font size'
    },
    'A',
    'Add **unique** **constraint** plus **gateway** enforcement.'
  );
  A(
    'on-call',
    '**Java** **21** **virtual** **threads** enabled; **p99** random; **CPU** low. First data?',
    {
      A: '**JFR** **jdk.VirtualThreadPinned** sample under load',
      B: 'Delete **metrics**',
      C: '**format** **C:**',
      D: '**ping** only'
    },
    'A',
    'Pinning breaks cheap **thread** story.'
  );
  A(
    'code',
    'Concurrency bug?\n```java\nMap<String,String> cache = new HashMap<>();\n// many virtual threads mutate cache concurrently\n```',
    {
      A: 'Use **ConcurrentHashMap** or external **synchronization**',
      B: '**HashMap** is always safe on **Java** **21**',
      C: '**virtual** **threads** remove **race** **conditions**',
      D: 'Add **volatile** on **Map** reference only'
    },
    'A',
    '**Design** **doc** must name **shared** **mutable** **state** rules.'
  );
  A(
    'code',
    '**Java** **21** **virtual** **thread** risk?\n```java\nsynchronized (lock) { legacyJdbc.query(); }\n// runs on virtual thread carrier\n```',
    {
      A: 'Can **pin** **carrier**; hurts **scalability** claims until driver fixed',
      B: 'Always safe because **virtual** threads are magic',
      C: '**JIT** removes **synchronized**',
      D: 'Forces **ZGC** off'
    },
    'A',
    'Validate with **JFR** **jdk.VirtualThreadPinned**.'
  );
  A(
    'code',
    'Risk?\n```java\n// Production JVM opts: -XX:TieredStopAtLevel=1 -Xmx512m\n// Load test uses same jar against 4 vCPU prod-like host.\n```',
    {
      A: '**Profiling** may mis-rank hot methods versus prod **C2** after warm **JIT**',
      B: 'Guarantees identical **SLO** forever',
      C: 'Fixes **retry** storms',
      D: 'Disables **design** **reviews**'
    },
    'A',
    'Match **JVM** **OPTIONS** to **prod** before proving **architecture** tweaks.'
  );

  return q;
}

const CHEATSHEET = `| Level | Concept | The rule in one line | Example or Command |
|-------|---------|----------------------|--------------------|
| Fresher | **Timer** | Visible **clock** every **mock** | **System.currentTimeMillis** diff |
| Fresher | **Think** **aloud** | **Narrate** while you **type** | **audio** **playback** count |
| Fresher | **Retro** | **One** **comms** fix + **one** **content** fix | **mock** **journal** line |
| Senior Dev | **Signal** **feedback** | Name **habit**, not vibe | **rubric** **row** **tag** |
| Senior Dev | **Energy** | **Breaks** **between** **segments** | **walk** **five** **minutes** |
| Senior Dev | **Hint** **echo** | **Restate** **scope** **changes** | "**So** we **skip** **auth**?" |
| Senior Dev | **Audio** **STAR** | **Hear** **we** versus **I** | **count** **pronouns** |
| Tech Lead | **Shared** **rubric** | **One** **scorecard** **org**-wide | **audit** **quarterly** |
| Tech Lead | **Panel** **order** | **Warmup** **before** **deep** **dive** | **schedule** **doc** |
| Tech Lead | **Break** **policy** | **Hydrate** **before** **Java** **deep** | **water** + **snack** |
| Staff | **JFR** **pin** | **Virtual** **thread** **mock** proof | **jdk.VirtualThreadPinned** **Java** **21** |
| Staff | **jcmd** **proof** | **BLOCKED** vs **I/O** wait | **Thread.print** + **trace** |
| Staff | **JDK** story | **Capacity** claims need **version** | **java** **-version** in **retro** |`;

export function buildDay90Sections() {
  const basic = buildBasicCode();
  const mid = buildMidCode();
  const adv = buildAdvCode();
  return [
    { type: 'why', title: 'Why Full Mock Interview Simulation matters', content: buildWhy() },
    { type: 'theory', title: 'Theory and Internals — Full Mock Interview Simulation', content: buildTheoryContent() },
    {
      type: 'code',
      title: 'Basic — Full mock interview reference card',
      language: 'java',
      filename: 'Day90Basic.java',
      level: 'basic',
      description: 'Print-only: mock segments, timer habits, retro, JVM proof commands.',
      code: basic.code,
      output: basic.output
    },
    {
      type: 'code',
      title: 'Intermediate — Four full mock interview war stories',
      language: 'java',
      filename: 'Day90Intermediate.java',
      level: 'intermediate',
      description: 'Senior narration: think-aloud, energy, STAR metrics, shared rubric.',
      code: mid.code,
      output: mid.output
    },
    {
      type: 'code',
      title: 'Advanced — Mock rubric + coaching triage matrix',
      language: 'java',
      filename: 'Day90Advanced.java',
      level: 'advanced',
      description: 'Mock segment flags, coaching actions, retro and jcmd checklist.',
      code: adv.code,
      output: adv.output
    },
    {
      type: 'diagram',
      title: 'Full mock interview day arc',
      diagramType: 'component',
      description: 'Warmup, deep dive, behavioral, your questions, retro.',
      plantuml:
        '@startuml\ntitle Day 90 — Full mock interview simulation\nactor Candidate\nparticipant Interviewer\nCandidate -> Interviewer : warmup STAR outline\nCandidate -> Interviewer : timed deep dive segment\nCandidate -> Interviewer : behavioral with metrics\nCandidate -> Interviewer : your questions\nCandidate -> Interviewer : retro one comms one content fix\nInterviewer -> Candidate : probes + hints\n@enduml'
    },
    { type: 'pitfalls', title: 'Common Pitfalls', items: PITFALLS },
    {
      type: 'exercise',
      title: 'Exercise — Mock vocabulary (fresher)',
      audience: 'fresher',
      difficulty: 'Beginner',
      problem:
        'You are writing your first **Java** program to memorize **full** **mock** **interview** **simulation** words and **STAR** pieces.\n\n1. Create **arch.day90.Day90FresherExercise** with **main**.\n2. Print one line explaining **STAR** letters in plain words.\n3. Print one line explaining why a **visible** **timer** matters in a **mock**.\n4. Print one line explaining **think** **aloud** in plain words.',
      hints: [
        'Keep every teaching line in a **final** **String** constant.',
        'Use only **System.out.println** so the exercise stays copy-safe.',
        'Mention **Result** needing a **number** somewhere in your printouts.'
      ],
      solution: `package arch.day90;

/** Fresher drill: say STAR and mock habits out loud before any panel. */
public class Day90FresherExercise {

    public static void main(String[] args) {
        // args ignored so classmates get identical stdout when they run your jar.
        final String starLine = "STAR is Situation Task Action Result; Action uses I and Result needs a metric.";
        // starLine stops vague we stories that fail behavioral bars.
        System.out.println(starLine);
        final String timerLine = "Visible timer trains pressure so mock day feels familiar not chaotic.";
        // timerLine reminds you interviews score how you handle the clock.
        System.out.println(timerLine);
        final String thinkLine = "Think aloud means narrate tests and trade-offs while you type Java.";
        // thinkLine is what peers score during coding mocks.
        System.out.println(thinkLine);
        final String tradeLine = "Trade-off means you say what you buy and what you sacrifice, like CAP slices.";
        // tradeLine reminds you interviews reward honesty about consistency versus latency.
        System.out.println(tradeLine);
        final String readWriteLine = "Read path fetches data; write path validates, stores, and publishes events.";
        // readWriteLine separates concerns before you draw duplicate arrows on the board.
        System.out.println(readWriteLine);
        final String failLine = "Failure mode is what breaks when Redis dies, network partitions, or retries amplify.";
        // failLine is the section seniors skip at their own risk.
        System.out.println(failLine);
        final String sloLine = "SLO ties user pain to numbers like p99 under two hundred milliseconds.";
        // sloLine connects design docs to Grafana dashboards leaders understand.
        System.out.println(sloLine);
        final String backpressureLine = "Backpressure tells producers to slow down when consumers fall behind.";
        // backpressureLine prevents infinite queue fairy tales.
        System.out.println(backpressureLine);
        final String hotKeyLine = "Hot partition means one shard burns while others idle — skewed traffic.";
        // hotKeyLine explains Redis CPU charts that look confusing at first glance.
        System.out.println(hotKeyLine);
        final String outboxLine = "Outbox writes business rows and event rows in one database transaction.";
        // outboxLine stops dual-write lies between Postgres and Kafka.
        System.out.println(outboxLine);
        final String stranglerLine = "Strangler fig shifts traffic slice by slice instead of one scary cutover.";
        // stranglerLine is how real migrations survive payroll weekend.
        System.out.println(stranglerLine);
        final String jcmdLine = "jcmd Thread.print proves BLOCKED threads when your design hits Java services.";
        // jcmdLine ties whiteboard talk to JVM evidence you can paste in Slack.
        System.out.println(jcmdLine);
        final String jfrLine = "JFR jdk.VirtualThreadPinned catches Java 21 virtual thread pinning on JDBC.";
        // jfrLine is the footnote after you promise infinite cheap threads.
        System.out.println(jfrLine);
    }
}
`
    },
    {
      type: 'exercise',
      title: 'Exercise — Mock rubric gate + coaching actions (staff)',
      audience: 'staff',
      difficulty: 'Advanced',
      problem:
        'Platform **engineering** asks you to model how you **flag** weak **mock** **signals** and **coaching** **actions** before **candidates** reach **real** **panels**.\n\n1. Define three **record** values **design**, **coding**, **behavioral** each with booleans **clarifyWeak**, **failureWeak**, **javaProofWeak** (mix true/false so each **segment** has at least one gap).\n2. Print one summary line per **segment** showing the three flags.\n3. Build a **LinkedHashMap** from gap key **clarify_weak**, **failure_weak**, **java_proof_weak** to the first **String** **coaching** **action** you require.\n4. Print the map in insertion order.\n5. Print one line linking **Java** **service** claims to **jcmd** **Thread.print** plus **distributed** **trace** **IDs**.',
      hints: [
        'Actions are human policy strings, not **ProcessBuilder** calls.',
        '**LinkedHashMap** preserves the escalation story for auditors.',
        'Mention **STAR** **Result** metrics in at least one printed line.'
      ],
      solution: `package arch.day90;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Staff exercise: deterministic model for mock rubric gates and coaching alignment.
 * Reasoning: without explicit mock signals, teams ship confident candidates who fail communication bars.
 */
public class Day90StaffExercise {

    record MockGap(String segment, boolean clarifyWeak, boolean failureWeak, boolean javaProofWeak) {}

    public static void main(String[] args) {
        // Three segments mirror common mock scorecard rows.
        MockGap design = new MockGap("design", true, false, false);
        MockGap coding = new MockGap("coding", false, true, false);
        MockGap behavioral = new MockGap("behavioral", false, false, true);

        // Printing flags first forces coaches to see weak signals before debating trivia.
        System.out.println("=== Mock segment weak-signal flags ===");
        System.out.println(
            design.segment() + " clarifyWeak=" + design.clarifyWeak() + " failureWeak="
                + design.failureWeak() + " javaProofWeak=" + design.javaProofWeak());
        System.out.println(
            coding.segment() + " clarifyWeak=" + coding.clarifyWeak() + " failureWeak="
                + coding.failureWeak() + " javaProofWeak=" + coding.javaProofWeak());
        System.out.println(
            behavioral.segment() + " clarifyWeak=" + behavioral.clarifyWeak() + " failureWeak="
                + behavioral.failureWeak() + " javaProofWeak=" + behavioral.javaProofWeak());

        // LinkedHashMap encodes mandatory first coaching actions — order matters for runbook copy-paste.
        Map<String, String> gate = new LinkedHashMap<>();
        gate.put("clarify_weak", "repeat five clarifies aloud before any diagram or IDE");
        gate.put("failure_weak", "add three-minute failure block: retry, partition, hot key");
        gate.put("java_proof_weak", "memorize jcmd Thread.print plus one JFR event line");

        System.out.println("=== First coaching action per gap ===");
        for (Map.Entry<String, String> e : gate.entrySet()) {
            System.out.println(e.getKey() + " -> " + e.getValue());
        }

        // Behavioral rubric note: numbers beat adjectives in panel scoring.
        System.out.println("=== Behavioral rubric note ===");
        System.out.println("Reject STAR stories whose Result lacks MTTR, percent, dollars, or incident count.");

        // JVM proof ties Java-heavy mock claims to thread states, not folklore.
        System.out.println("=== Java verification tie-in ===");
        System.out.println(
            "For Java services attach jcmd Thread.print plus trace IDs whenever tail latency is claimed.");

        // Virtual thread caveat prevents overselling Loom without JFR.
        System.out.println("=== Java 21 note ===");
        System.out.println("Enable JFR jdk.VirtualThreadPinned in staging soak before approving carrier math.");

        // Mock program governance stops fifty mentors from inventing fifty rubrics.
        System.out.println("=== Mock governance ===");
        System.out.println("Platform mock policy must match scorecard rows or block promotion to real panel.");

        // Shared rubric reminder for org-wide programs.
        System.out.println("=== Shared rubric ===");
        System.out.println("Quarterly audit compares feedback forms to clarify-first and numeric-Result keywords.");

        // Prevention elevates one retro into template update.
        System.out.println("=== Prevention ===");
        System.out.println("File mock retro STAR worksheet with numeric Result and link revised rubric template.");

        // Audit bundle reduces leadership ping-pong during escalations.
        System.out.println("=== Audit bundle ===");
        System.out.println("Attach mock scorecard PDF, audio timestamp, jcmd snippet, and java -version for Java claims.");
    }
}
`
    },
    {
      type: 'interview',
      title: 'Interview Drill — Full Mock Interview Simulation',
      conceptual: buildConceptual(),
      codeBased: buildCodeBased(),
      seniorScenario: buildSenior(),
      wrongAnswers: WRONG,
      jobSwitch: {
        resumeBullet:
          'Documented weekly full mock interview simulations with shared rubrics and cut vague hire rejects forty percent.',
        interviewPositioning:
          'When I join a platform group I read how **mock** **rubrics** and **real** **panels** line up — weak **STAR** **Result** lines and missing **think**-**aloud** habits are the same class of bug as missing **SLO** tables. In week one I run a **timed** **mock** **clarify**-first drill with the **Tech** **Leads** and I add **jcmd** **Thread.print** plus **trace** **ID** examples to the **Java** **service** **runbook** so **tail** **latency** stories have proof.',
        starAnchor:
          'Situation: our **hiring** **bar** **raiser** kept rejecting "**strong** **system** **thinkers**" who went **silent** in **coding** **mocks**. Task: fix **signals** without lowering the **technical** **bar**. Action: I rewrote the **rubric** to weight **clarify**, **failure** depth, and **numeric** **STAR** **Result**, coached **panelists** on **hint** **echo**, and linked **Java** **21** **virtual** **thread** **pin** checks to **JFR** in the **staging** **checklist**. Result: **offer** **rate** for **senior** **loops** rose **twenty** **percent** in **ninety** days and **postmortem** **STAR** **worksheets** with metrics became mandatory.'
      }
    },
    {
      type: 'mcq',
      title: 'MCQ — Full Mock Interview Simulation',
      description: 'Thirty questions across basic, intermediate, and advanced mock interview and Java levels.',
      questions: buildMcq()
    },
    { type: 'cheatsheet', title: 'Cheatsheet — Full Mock Interview Simulation', content: CHEATSHEET }
  ];
}

