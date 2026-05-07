/** Full section builder for phase10-day89.json — System Design Case Study and Behavioral */

const T = (title, body, angle) =>
  `### ${title}\n\n${body}\n\n**Interview angle:** ${angle}`;

function buildWhy() {
  return (
    'You sit in a **Zoom** room for a **Staff** loop. The interviewer pastes a one-line prompt: "Design a **URL** shortener." Your heart races. You start drawing boxes and naming **Kafka** before you ask who the users are. Fifteen minutes later they interrupt: "You never asked about **read** versus **write** ratio." You freeze. That sting is why **system** **design** **case** **studies** exist as a separate skill from coding. They test whether you can turn a fuzzy product sentence into a **constraint** list, a **data** model, and a **failure** story before you reach for tools.\n\n' +
    'You are past the **leetcode** grind. **Interviewers** who run **case** **studies** rarely want a **diagram** that looks like a conference slide. They want to hear how you **prioritize**, how you name **trade-offs**, and how you connect design choices to **production** pain. A weak answer jumps to **microservices** because the blog said so. A strong answer says "I would start with **strong** **consistency** for **ID** **generation**, accept **eventual** **read** **replication** for **redirect** **latency**, and prove the split with **back-of-envelope** **QPS** and **storage** math." A weak **behavioral** story ends with "we fixed it." A strong one ends with "**MTTR** dropped from ninety minutes to twelve and **p99** **redirect** stayed under twenty **milliseconds** after we added **circuit** **breakers**."\n\n' +
    'When ten engineers practice together without structure, two failure modes repeat. First, everyone memorizes **buzzwords** — **CQRS**, **sharding**, **CDN** — and nobody can explain what breaks when **Redis** **evicts** hot keys during a spike. Second, **behavioral** answers sound like **HR** fiction: vague **we**, no **conflict** detail, no metric. Both look like confidence in the room. They are **communication** gaps that cost offers. Real **production** already showed you the symptoms: **HTTP** **429** storms that were actually **retry** **amplification**, or **OutOfMemoryError** **Java** **heap** **space** after a "simple" cache layer stored unbounded **String** keys.\n\n' +
    'Use this four-step pattern in every **case** **study** and every **STAR** story. First, **clarify**: users, scale, **SLA**, money, and compliance — say what breaks if you guess wrong. Second, **sketch**: **API** surface, **data** **store** choice, and one **read** path plus one **write** path — say what each box owns. Third, **stress**: **single** **point** **failure**, **hot** **partition**, **split** **brain** — name the **error** budget you spend. Fourth, **measure**: which **dashboard** or command proves the design worked — for **Java** services mention **jcmd** **Thread.print** or **jstat** **-gc** when you talk about tail **latency**.\n\n' +
    'Here is a **Staff**-level fact that separates you from someone who only watched **YouTube**. **SLO** **burn** alerts tied to **multi-window** **error** **budgets** change how you argue for **caching** versus **correctness** — and when your service runs on **Java** **21** **virtual** **threads**, your **capacity** model must include **pinning** on **synchronized** **JDBC**, which **JFR** **jdk.VirtualThreadPinned** exposes. You are not name-dropping. You are showing you shipped under the same constraints the **JVM** and **Kubernetes** enforce.\n\n' +
    'In your first six months at a new company you will live this topic. During onboarding you rewrite a **design** **doc** after **SRE** asks how **failover** affects **session** **affinity** — you add a **sequence** **diagram** and a **rollback** plan. Before a **roadmap** review you defend **event** **sourcing** versus **CRUD** with **cost** per million writes and **replay** **time**. After a bad **incident** review you practice a **STAR** story out loud so **Result** includes "**SEV** **2** count dropped **40** percent" instead of "things got better." Each time you pair clarity with numbers, you sound like someone who leads **design**, not someone who collects stickers.\n\n' +
    'You also learn that **behavioral** and **system** **design** are one loop. The **case** **study** shows how you think under ambiguity. The **STAR** story shows what you did when ambiguity became a **pager**. When both answers include **metrics**, **trade-offs**, and a honest **failure** mode, you stop performing expertise. You demonstrate it.'
  );
}

function buildTheoryContent() {
  const parts = [
    T(
      'Plain-language overview',
      'A **system** **design** **case** **study** is a pretend product meeting where you turn a vague goal into boxes, **API** calls, and **data** stores. A **behavioral** answer is a short true story with **STAR**: **Situation**, **Task**, **Action**, **Result**. Both skills exist because shipping software is not only typing code. You must explain **trade-offs**, listen to hints, and prove impact with numbers.',
      'Interviewers listen for questions before solutions and for **Result** with a metric.'
    ),
    T(
      'What is a system design case study and why does it exist',
      'Interviewers want to see how you handle ambiguity. They give you something like "build a feed" or "shorten URLs" and watch whether you ask about **scale**, **consistency**, and **money** before you draw **Kafka**. The exercise exists because bad early choices — wrong **partition** key, wrong **consistency** model — are expensive to unwind. You are not graded on art skills. You are graded on structured thinking.',
      'Weak candidates draw popular logos; strong ones narrate **read** versus **write** paths.'
    ),
    T(
      'Your first three clarifying questions in any interview room',
      'Ask who the user is, what **SLA** matters (**p99** latency versus cost), and what **failure** is acceptable (lost **event** versus stale **read**). Write assumptions on the board so the interviewer can correct you early. If the service is **Java**, ask whether **throughput** or **tail** **latency** is the **SLO** driver — that decides **thread** model and **GC** story later.',
      'Interviewers reward explicit assumptions they can steer.'
    ),
    T(
      'How to read when the interviewer narrows your scope',
      'If they say "ignore **auth** for now," stop defending **OAuth2** and move on. If they say "assume one **region**," do not lecture about **multi-master** **replication** yet. Treat hints as **requirements** changes. Summarize back: "So we optimize **write** **throughput** and accept **eventual** **read**?" That mirrors how **Tech** **Leads** run real **scoping** meetings.',
      'Strong candidates echo constraints so nobody wastes minutes on the wrong problem.'
    ),
    T(
      'How Mockito-heavy teams tell shallow design stories',
      'If every **integration** was **mocked**, you might never explain **backpressure**, **retry** storms, or **idempotency** keys. **Mockito** is fine for **unit** tests. **Case** **study** answers still need honest **I/O** and **failure** behavior. Tie stories to something measurable: **HTTP** **5xx** rate, **Kafka** **lag**, or **jcmd** **Thread.print** showing **BLOCKED** threads during a **circuit** **breaker** reopen.',
      'Senior answers connect mocks in **CI** to real **backbone** behavior in **prod**.'
    ),
    T(
      'Comparison table — strong consistency, eventual, and CRDT-lite choices',
      '| Model | When it fits | What breaks if you pick it blindly |\n|-------|--------------|-----------------------------------|\n| **Strong** **linearizable** **writes** | **ID** **generation**, **inventory** **ledger** | **Latency** and **availability** under **partition** |\n| **Eventual** **replication** | **Feeds**, **analytics**, **CDN** **cache** | Stale **read** after **write** confuses users |\n| **CRDT**-style merge | collaborative **editors** | **Memory** and **complexity** explode if misapplied |\n\nName the **CAP** trade you are buying.',
      'Interviewers want you to say which **consistency** you sacrifice and why.'
    ),
    T(
      'Numbered sequence — whiteboard flow from prompt to wrap-up',
      '1. **Clarify** users, **QPS**, **data** size, and compliance.\n2. **Sketch** **API** (**REST** or **gRPC**), core **entities**, and **storage**.\n3. **Deep** **dive** on **hot** path: **cache**, **index**, **queue**.\n4. **Failure** mode: **retry**, **timeout**, **bulkhead**, **idempotency**.\n5. **Evolution**: **sharding**, **read** **replica**, **strangler** **fig**.\n6. **Summarize** **trade-offs** and invite questions.\n\nSkipping step four is how designs die in the first **Black** **Friday**.',
      'Tech leads grade whether you leave time for **failure** discussion.'
    ),
    T(
      'Common mistakes that look like confidence but fail the bar',
      'Jumping to **microservices** without **monolith** **boundary** proof. Ignoring **back-of-envelope** math so **Redis** becomes a magic sponge. Saying "**Kafka** fixes it" without **ordering** or **consumer** **lag** plan. In **behavioral** answers, blaming a person instead of describing a **process** gap. Another miss is skipping **Result** metrics — interviewers remember numbers.',
      'Staff follow-ups often ask "what broke in **prod**?" after pretty diagrams.'
    ),
    T(
      'Choosing between SQL primary store versus wide-column or document',
      'Pick **SQL** when **joins** and **transactions** guard money. Pick **document** stores when **schema** flex and **shard** by **tenant** matter. Pick **wide-column** when **write** **throughput** and **time-series** **partition** keys dominate. Always say how you **migrate** without a **big** **bang** cutover — **dual** **write**, **feature** **flag**, **strangler**.',
      'Interviewers listen for **migration** path, not only the **happy** **ER** **diagram**.'
    ),
    T(
      'Code review — what you demand from design docs',
      'Require **SLO** table, **capacity** estimate, **rollback** plan, and **on-call** **runbook** link. Flag hand-wavy "**cache** layer" without **TTL** and **eviction** policy. Ask how a **Java** **21** service proves **virtual** **thread** safety with **JFR** **pin** sampling. Demand **load** test protocol references when **p99** is part of the **SLA**.',
      'Good review culture stops **diagram** fiction before **merge**.'
    ),
    T(
      'Stakeholder talk — translate tail latency without shame',
      'Say "**p99** means one in a hundred requests feels this slow." Show **median** flat and **p99** doubled. Offer options: spend **engineering** weeks on **code** path, buy **read** **replicas**, or relax a **non-critical** **SLA**. Tie **GC** **pause** to customer-visible waits when the **runtime** is **JVM**.',
      'Leaders trust plain language plus one chart, not acronyms alone.'
    ),
    T(
      'Tool commands when your design lands on Java services',
      '| Command | What it proves in a story |\n|---------|---------------------------|\n| **jcmd** **<pid>** **Thread.print** | **BLOCKED** threads after your **retry** policy |\n| **jcmd** **<pid>** **GC.heap_info** | **Heap** pressure from **cache** misuse |\n| **jstat** **-gc** **<pid>** **1s** | Whether **Young** **GC** exploded after launch |\n| **javap** **-c** **MyService** | **Bytecode** shape when discussing **hot** methods |\n',
      'Interviewers like design answers that end with how you would verify them.'
    ),
    T(
      'jcmd when the architecture story meets a tail latency incident',
      'After you ship the **cache** + **queue** design, **p99** might spike while **CPU** looks idle. **jcmd** **Thread.print** shows **BLOCKED** **threads** on **connection** **pools** or **synchronized** **legacy** **libraries**. That is not a bad **algorithm** on the whiteboard — it is **runtime** **contention**. Pair with **distributed** **trace** **waterfall** to separate **network** from **JVM** wait.',
      'On-call credibility is naming a **thread** **state**, not re-explaining **Kafka**.'
    ),
    T(
      'Java 8 versus 11 versus 17 versus 21 in architecture narratives',
      '| **Java** | Design talking point |\n|----------|----------------------|\n| **8** | **PermGen** pain in **class**-heavy **plugins** |\n| **11** | **LTS** baseline for many **cloud** images |\n| **17** | **Pattern** **matching**, **sealed** types shape cleaner **domain** models |\n| **21** | **Virtual** **threads** change **pool** sizing; watch **pinning** |\n\nMention **JDK** when you discuss **capacity** per **core**.',
      'Version answers show you know **runtime** constraints, not only **API** syntax.'
    ),
    T(
      'JVM footprint when the case study includes high-write APIs',
      'Each **JSON** **parse** and **DTO** graph allocates on the **heap**. Under high **QPS**, **Young** **Gen** churn raises **GC** frequency and **p99**. **jcmd** **GC.class_histogram** shows whether **String** or **byte** arrays dominate. Design mitigations: streaming **parser**, **object** **pool** where safe, or smaller **payload** contracts — not only "add **nodes**."',
      'Staff tie **allocation** story to **SLO** when **Java** is in the path.'
    ),
    T(
      'Architecture guardrail for fifty teams running case-study templates',
      'Publish a standard **design** **doc** outline: **context**, **constraints**, **API**, **data**, **observability**, **failure**, **cost**. Store **baseline** **SLO** per **critical** **user** **journey**. Require **game** **days** that **kill** **pods** in **staging**. Ban **behavioral** **interview** prep that uses vague **we** without **I** **ownership**.',
      'Architects scale habits, not hero **whiteboard** performances.'
    ),
    T(
      '60-second interview story',
      '**System** **design** starts with **clarify**, then **API** + **data**, then **failure** modes and **evolution**. **STAR** stories need **Action** you personally drove and **Result** with numbers. **Tech** **Leads** name **trade-offs** and **rollback**. **Staff** ties claims to **SLO** burn and **jcmd** proof when **Java** **services** misbehave.',
      'One breath that shows structure, ownership, and verification.'
    ),
    T(
      'Satyverse drill — tie-down',
      'Pick "**Design a notification system**" alone. Spend eight minutes writing: five **clarifying** questions you would ask, one **API** sketch, one **storage** choice with a sentence why, and one **failure** mode with a mitigating pattern. Then record a two-minute **STAR** story out loud where **Result** includes at least one number. **Do not** open **IDE** — this is communication reps.',
      'Interviewers reward reps that feel boring to you but crisp to them.'
    )
  ];
  return parts.join('\n\n');
}

function buildBasicCode() {
  const code = `package arch.day89;

/**
 * Fresher reference card: system design + behavioral interview vocabulary (println only).
 */
public class Day89Basic {

    public static void main(String[] args) {
        // Week one: before you draw Kafka, know the words interviewers listen for.
        System.out.println("=== Core system design + behavioral ideas ===");
        System.out.println("Clarify        | Ask scale, SLA, money, compliance before boxes");
        System.out.println("STAR           | Situation Task Action Result with YOU owning Action");
        System.out.println("Trade-off      | Name what you buy and what you sacrifice (CAP slice)");
        System.out.println("Back-of-envelope | Rough QPS, storage, bandwidth math on the board");
        System.out.println("Failure mode   | Retry storm, split brain, hot partition, cache stampede");
        System.out.println();

        // Paste these when someone asks how you would prove the design in prod.
        System.out.println("=== How to verify a Java service design ===");
        System.out.println("jcmd <pid> Thread.print   -> BLOCKED threads, lock owners");
        System.out.println("jcmd <pid> GC.heap_info   -> heap + Metaspace snapshot");
        System.out.println("jstat -gc -t <pid> 1s     -> Young GC rate after launch");
        System.out.println("Distributed trace         -> waterfall for p99 tail");
        System.out.println();

        // Symptoms that look like bad code but are often interview structure gaps.
        System.out.println("=== Beginner interview mistakes ===");
        System.out.println("Buzzword spray     -> Kafka+K8s with no read/write path story");
        System.out.println("Vague we           -> interviewer cannot see what YOU did");
        System.out.println("No numbers in Result -> behavioral answer feels like fiction");
        System.out.println("Ignoring hints     -> keeps optimizing wrong part of prompt");
        System.out.println();

        // One sentence before you walk into the loop.
        System.out.println("=== Remember this ===");
        System.out.println("Ask, sketch, stress failures, summarize — then tie Result to a metric.");
        System.out.println();

        // Tie whiteboard talk to on-call reality for Java teams.
        System.out.println("=== JVM signals that support your story ===");
        System.out.println("Virtual threads + JDBC pin -> JFR jdk.VirtualThreadPinned on Java 21");
        System.out.println("Heap churn from DTOs       -> jcmd GC.class_histogram under load");
        System.out.println("RSS vs cgroup limit        -> jcmd VM.native_memory summary");
    }
}`;
  const output = `=== Core system design + behavioral ideas ===
Clarify        | Ask scale, SLA, money, compliance before boxes
STAR           | Situation Task Action Result with YOU owning Action
Trade-off      | Name what you buy and what you sacrifice (CAP slice)
Back-of-envelope | Rough QPS, storage, bandwidth math on the board
Failure mode   | Retry storm, split brain, hot partition, cache stampede

=== How to verify a Java service design ===
jcmd <pid> Thread.print   -> BLOCKED threads, lock owners
jcmd <pid> GC.heap_info   -> heap + Metaspace snapshot
jstat -gc -t <pid> 1s     -> Young GC rate after launch
Distributed trace         -> waterfall for p99 tail

=== Beginner interview mistakes ===
Buzzword spray     -> Kafka+K8s with no read/write path story
Vague we           -> interviewer cannot see what YOU did
No numbers in Result -> behavioral answer feels like fiction
Ignoring hints     -> keeps optimizing wrong part of prompt

=== Remember this ===
Ask, sketch, stress failures, summarize — then tie Result to a metric.

=== JVM signals that support your story ===
Virtual threads + JDBC pin -> JFR jdk.VirtualThreadPinned on Java 21
Heap churn from DTOs       -> jcmd GC.class_histogram under load
RSS vs cgroup limit        -> jcmd VM.native_memory summary
`;
  return { code, output };
}

function buildMidCode() {
  const code = `package arch.day89;

/**
 * Four system design + behavioral scenarios a senior engineer narrates.
 */
public class Day89Intermediate {

    static void scenario1() {
        // Feature-level mistake: shipped a design doc without read/write math.
        System.out.println("--- Scenario 1: mock interview bombed after Kafka-first diagram ---");
        System.out.println("symptom:  interviewer bored; feedback said no clarifying questions");
        System.out.println("cause:    you named tools before users, QPS, or SLA");
        System.out.println("why:      case study grades thinking order, not logo count");
        System.out.println("fix:      open with 3 clarifies; write assumptions on the board");
        System.out.println("verify:   peer mock scores you on checklist: clarify before boxes");
        System.out.println("next:     add back-of-envelope line for storage per day");
        System.out.println();
    }

    static void scenario2() {
        // Production trace-back: retry policy from design review caused outage-shaped load.
        System.out.println("--- Scenario 2: p99 exploded after aggressive client retries shipped ---");
        System.out.println("symptom:  gateway 503 storm; dependency dashboards healthy");
        System.out.println("cause:    retry amplification matched thundering herd in design gap");
        System.out.println("why:      design doc said retry but skipped jitter and budget");
        System.out.println("fix:      exponential backoff + bulkhead + idempotency keys");
        System.out.println("verify:   distributed trace shows fan-out depth dropping post change");
        System.out.println("next:     jcmd <pid> Thread.print confirms thread pool not BLOCKED");
        System.out.println();
    }

    static void scenario3() {
        // Performance angle: hot partition choice blew up cache hit rate.
        System.out.println("--- Scenario 3: Redis CPU high; p99 reads worse than origin ---");
        System.out.println("symptom:  single shard hot; other shards idle");
        System.out.println("cause:    partition key was userId but traffic is viral objectId");
        System.out.println("why:      skew was invisible in average CPU charts");
        System.out.println("fix:      reshuffle key + add local L1 for top keys");
        System.out.println("verify:   redis INFO command shows even commandstats per shard");
        System.out.println("next:     load test with skewed zipfian distribution");
        System.out.println();
    }

    static void scenario4() {
        // Team architecture: every service picked its own consistency story.
        System.out.println("--- Scenario 4: fifty microservices; finance sees double charges ---");
        System.out.println("symptom:  ledger and wallet disagree after partial failures");
        System.out.println("cause:    eventual reads mixed with non-idempotent writes");
        System.out.println("why:      no shared design template for money paths");
        System.out.println("fix:      platform doc mandates outbox + saga + idempotency for $ paths");
        System.out.println("verify:   reconciliation job delta goes to zero for 7 days");
        System.out.println("next:     jcmd GC.heap_info on Java ledger service after replay load");
        System.out.println();
    }

    public static void main(String[] args) {
        // Header ties stdout to interview prep, not prod logs.
        System.out.println("=== Day89Intermediate: four system design interview war stories ===");
        System.out.println("Tip: run with java arch.day89.Day89Intermediate from compiled classes.");
        System.out.println("Each scenario names a verify step you can paste into runbooks.");
        System.out.println("When Java is involved, pair design claims with jcmd or trace proof.");
        System.out.println();
        scenario1();
        scenario2();
        scenario3();
        scenario4();
        System.out.println("=== End of scenario pack ===");
        System.out.println("Attach design doc link, trace screenshot, and SLO chart to postmortems.");
    }
}`;
  const output = `=== Day89Intermediate: four system design interview war stories ===
Tip: run with java arch.day89.Day89Intermediate from compiled classes.
Each scenario names a verify step you can paste into runbooks.
When Java is involved, pair design claims with jcmd or trace proof.

--- Scenario 1: mock interview bombed after Kafka-first diagram ---
symptom:  interviewer bored; feedback said no clarifying questions
cause:    you named tools before users, QPS, or SLA
why:      case study grades thinking order, not logo count
fix:      open with 3 clarifies; write assumptions on the board
verify:   peer mock scores you on checklist: clarify before boxes
next:     add back-of-envelope line for storage per day

--- Scenario 2: p99 exploded after aggressive client retries shipped ---
symptom:  gateway 503 storm; dependency dashboards healthy
cause:    retry amplification matched thundering herd in design gap
why:      design doc said retry but skipped jitter and budget
fix:      exponential backoff + bulkhead + idempotency keys
verify:   distributed trace shows fan-out depth dropping post change
next:     jcmd <pid> Thread.print confirms thread pool not BLOCKED

--- Scenario 3: Redis CPU high; p99 reads worse than origin ---
symptom:  single shard hot; other shards idle
cause:    partition key was userId but traffic is viral objectId
why:      skew was invisible in average CPU charts
fix:      reshuffle key + add local L1 for top keys
verify:   redis INFO command shows even commandstats per shard
next:     load test with skewed zipfian distribution

--- Scenario 4: fifty microservices; finance sees double charges ---
symptom:  ledger and wallet disagree after partial failures
cause:    eventual reads mixed with non-idempotent writes
why:      no shared design template for money paths
fix:      platform doc mandates outbox + saga + idempotency for $ paths
verify:   reconciliation job delta goes to zero for 7 days
next:     jcmd GC.heap_info on Java ledger service after replay load

=== End of scenario pack ===
Attach design doc link, trace screenshot, and SLO chart to postmortems.
`;
  return { code, output };
}

function buildAdvCode() {
  const code = `package arch.day89;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Tech lead + staff: design review triage without live I/O.
 */
public class Day89Advanced {

    record DocRisk(String service, boolean sloMissing, boolean failureMissing, boolean migrationMissing) {}

    public static void main(String[] args) {
        // Block 1 models three design docs flagged in review queue.
        System.out.println("=== Block 1: design doc risk signals ===");
        List<DocRisk> docs = List.of(
            new DocRisk("payments-api", true, false, false),
            new DocRisk("feed-reader", false, true, false),
            new DocRisk("search-index", false, false, true)
        );
        for (DocRisk d : docs) {
            System.out.println(d.service() + " sloMissing=" + d.sloMissing()
                + " failureMissing=" + d.failureMissing() + " migrationMissing=" + d.migrationMissing());
        }
        System.out.println();

        // Block 2 maps each gap to first human action before approval.
        System.out.println("=== Block 2: map gap to first review action ===");
        Map<String, String> action = new LinkedHashMap<>();
        action.put("slo_missing", "block merge until p99 + error budget table exists");
        action.put("failure_missing", "require retry/idempotency/bulkhead section");
        action.put("migration_missing", "require dual-write or strangler steps with rollback");
        for (Map.Entry<String, String> e : action.entrySet()) {
            System.out.println("gap " + e.getKey() + " -> " + e.getValue());
        }
        System.out.println();

        // Block 3 paste-ready triage for interview + prod alignment.
        System.out.println("=== Block 3: behavioral + JVM verification checklist ===");
        Map<String, String> table = new LinkedHashMap<>();
        table.put("STAR story weak", "rewrite Result with one number + timeframe");
        table.put("case study vague", "echo interviewer hints; narrow scope aloud");
        table.put("Java tail latency claim", "jcmd Thread.print + trace waterfall proof");
        for (Map.Entry<String, String> e : table.entrySet()) {
            System.out.println(e.getKey() + " | " + e.getValue());
        }
        System.out.println();
        System.out.println("Ordered review: clarify doc audience, then SLO, then failure, then cost.");
        System.out.println("Escalation bundle: design PDF + Grafana SLO + jcmd snippet for Java claims.");
        System.out.println("Java 21 note: virtual thread pool sizing needs JFR pin check.");
        System.out.println("Java 17 note: sealed domain types help readability in public APIs.");
        System.out.println("Prevention: template enforces STAR worksheet for every incident postmortem.");
        System.out.println("Prevention: platform linter flags design docs without rollback section.");
        System.out.println("Behavioral note: use I not we when describing your Action.");
        System.out.println("Done: attach this stdout next to interview scorecard rubric.");
        System.out.println("Trace note: paste three trace IDs beside any latency claim in review.");
        System.out.println("SLO note: tie error budget burn to design sections not only ops chat.");
    }
}`;
  const output = `=== Block 1: design doc risk signals ===
payments-api sloMissing=true failureMissing=false migrationMissing=false
feed-reader sloMissing=false failureMissing=true migrationMissing=false
search-index sloMissing=false failureMissing=false migrationMissing=true

=== Block 2: map gap to first review action ===
gap slo_missing -> block merge until p99 + error budget table exists
gap failure_missing -> require retry/idempotency/bulkhead section
gap migration_missing -> require dual-write or strangler steps with rollback

=== Block 3: behavioral + JVM verification checklist ===
STAR story weak | rewrite Result with one number + timeframe
case study vague | echo interviewer hints; narrow scope aloud
Java tail latency claim | jcmd Thread.print + trace waterfall proof

Ordered review: clarify doc audience, then SLO, then failure, then cost.
Escalation bundle: design PDF + Grafana SLO + jcmd snippet for Java claims.
Java 21 note: virtual thread pool sizing needs JFR pin check.
Java 17 note: sealed domain types help readability in public APIs.
Prevention: template enforces STAR worksheet for every incident postmortem.
Prevention: platform linter flags design docs without rollback section.
Behavioral note: use I not we when describing your Action.
Done: attach this stdout next to interview scorecard rubric.
Trace note: paste three trace IDs beside any latency claim in review.
SLO note: tie error budget burn to design sections not only ops chat.
`;
  return { code, output };
}

const PITFALLS = [
  'Starting a **case** **study** answer with **Kafka** before you ask **QPS** — the **interviewer** marks you as **tool**-first; fix by listing three **clarifying** questions aloud; verify with a **mock** **peer** who stops you if **diagram** starts before **assumptions**.',
  'Saying "**we** shipped" in every **behavioral** line — **hiring** **managers** cannot see your **Action**; fix by using "**I** owned" plus a concrete **decision**; verify by recording audio and counting **I** versus **we** in the **Result** paragraph.',
  'Approving **design** **docs** without an **SLO** table because "**Grafana** exists" — **tail** **latency** **regressions** ship silently; fix by requiring **p99** + **error** **budget** rows before **merge**; verify **Grafana** **dashboard** **UID** is pasted in the **doc** footer.',
  'Letting each **squad** invent its own **retry** policy — **clients** cause **retry** **storms** that look like **dependency** **outages**; fix by publishing a **platform** **retry** **standard** with **jitter**; verify **distributed** **trace** **depth** drops in **staging** **load** test.',
  'Running **case** **study** **prep** only on **laptop** **whiteboards** — you panic on **live** **collab** **docs**; fix by practicing in **FigJam** or **Excalidraw** with timer; verify you finish **clarify**+**API**+**failure** in **twenty** **minutes** twice in a row.',
  'Skipping **failure** **modes** because time ran short — **Staff** **round** will ask anyway; fix by always leaving **three** **minutes** for **retry**, **partition**, **hot** **key**; verify **mock** **feedback** includes **failure** **keyword** **hits**.',
  'Claiming **virtual** **threads** fix all **blocking** **I/O** without **JFR** **jdk.VirtualThreadPinned** — **Java** **21** **services** still **stall** on **synchronized** **JDBC**; fix by **load** **test** with **pin** **events** on; verify **JFR** **recording** shows **zero** **pin** spikes at target **QPS**.',
  'Publishing **behavioral** **STAR** **templates** without **numeric** **Result** — answers feel like **fiction**; fix by banning **adjectives** **alone** in **Result**; verify each story cites **MTTR**, **percent**, or **dollars** saved.'
];

function fuProd() {
  return {
    question: 'How does a weak **system** **design** story show up in **production** or **hiring** loops?',
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
  return `${core} At the **JVM** level **HotSpot** executes **bytecode**, **JIT** compiles hot **nmethods**, and **GC** threads reclaim **heap** regions while your **mutator** threads run, so your **system** **design** choices become **allocation** and **pause** stories in **Java** services. ${err} You shorten mean time to clue with ${cmd}. ${ver}${tail}`;
}

const CONCEPTUAL_Q = [
  ['What does **STAR** mean in **behavioral** interviews?', '**STAR** is **Situation**, **Task**, **Action**, **Result** — a spine that forces ownership and proof.', 'Vague **we** with no metric in **Result** reads as **fiction** and fails **Staff** follow-ups.', 'Record audio and time-box **Situation** under **twenty** seconds.', '**Java** **21** interviewers still ask how you proved **virtual** **thread** safety with **JFR** events.'],
  ['What is the first thing you do in a **system** **design** prompt?', 'You **clarify** users, **scale**, **SLA**, and money before you draw **Kafka**.', 'Skipping **clarify** yields **OverEngineeringError** in real teams — oversized bills and **operational** drag.', 'Write assumptions on the board and ask the **interviewer** to correct them.', '**Java** **17** **sealed** **classes** can model **domain** boundaries you sketch, a detail that signals depth beyond logos.'],
  ['What is a **read** path versus a **write** path?', '**Read** path answers how data is fetched; **write** path how it is accepted, validated, stored, and propagated.', 'Mixing them causes **consistency** bugs like **stale** **read** after **write** that **QA** blames on "**cache**".', 'Use **distributed** **trace** **waterfall** to separate **DB** wait from **application** **CPU**.', '**Java** **11** **HttpClient** versus **21** **virtual** **threads** changes how you size **connection** **pools**.'],
  ['What is **idempotency** and why does it matter?', 'An **idempotent** **API** can be retried without double effect — same logical outcome.', 'Without **idempotency** **keys**, **retry** storms create duplicate **charges** or rows — **HTTP** **5xx** looks like "**random**".', '**grep** **Idempotency-Key** in **gateway** logs and compare **trace** IDs.', '**Java** **21** record patterns help express **command** **DTO**s cleanly so **keys** are first-class.'],
  ['What is **eventual** **consistency**?', 'Replicas converge later; readers may see stale data briefly.', 'Users see "**I** **posted** but **feed** is empty**"** — looks like an **app** bug but is a **model** choice.', 'Measure **replication** **lag** metrics and **p99** **read** **staleness** if exposed.', '**Java** **8** **Date** pitfalls are gone in **java.time**, but **version** mix in **services** still breaks **serialization** contracts.'],
  ['What is a **hot** **partition**?', 'One **shard** gets most traffic while others idle.', '**p99** explodes for viral keys while average **CPU** looks fine.', '**redis** **INFO** **commandstats** or **DB** **slow** **query** log by **shard**.', '**Java** **17** **Vector** **API** is irrelevant here; focus on **key** **design** and **backpressure**.'],
  ['What is **backpressure**?', 'A signal that tells producers to slow down when consumers cannot keep up.', 'Without it, **queues** grow until **OutOfMemoryError** **Java** **heap** **space** or **long** **GC** pauses.', 'Watch **queue** **depth** **metric** and **jcmd** **GC.heap_info** on **Java** consumers.', '**Java** **21** **structured** **concurrency** previews change how you express fan-out safely — name your **JDK**.'],
  ['What is **CAP** in one practical sentence?', 'When a **network** **partition** happens, you choose **availability** or **consistency** — not both perfectly.', 'Wrong **CAP** talk sounds like "**we** are **100**% **consistent** **always**"** and breaks under **partition**.', 'Run a **game** **day** **partition** in **staging** and capture **client** **error** rates.', '**Java** **11** **TLS** defaults differ from **17** for **service** **mesh** — mention **version** when discussing **multi-region**.'],
  ['Why document **SLO** and **error** **budget** in a **design** **doc**?', 'They translate user pain into measurable thresholds the team defends.', 'Without them, **on-call** argues ad hoc whether **p99** regressions matter.', 'Paste **Grafana** **dashboard** **UID** and **SLO** burn alert names into the **doc** footer.', '**Java** **21** **virtual** **threads** need **SLO** updates because **carrier** **pool** exhaustion shows as tail latency.'],
  ['What is **strangler** **fig** **migration**?', 'You peel **traffic** slice by slice from an old **monolith** to a new service behind a **router**.', 'Big-bang **cutovers** cause **rollback** nightmares and **data** **loss** fears.', 'Track **percentage** **traffic** per route in **mesh** metrics nightly.', '**Java** **17** **multi-release** **JAR** helps run old and new **bytecode** edges during migration.'],
  ['How do you disagree **constructively** in a **behavioral** story?', 'You bring **data**, offer **alternatives**, and escalate with a **decision** **owner** — no personal blame.', 'Trash-talking a teammate fails **Staff** **bar** and can violate **HR** norms.', 'Reference **RFC** links and **postmortem** **action** items you filed.', '**Java** **11** versus **21** upgrades are classic disagreement topics — show **JFR** evidence, not opinion.'],
  ['What is **retry** **amplification**?', 'Clients **retry** at the same time, multiplying load on a struggling dependency.', 'It looks like a **mystery** **outage** across **healthy** **dashboards**.', 'Use **distributed** **trace** **count** of **retry** **spans** per **root** request.', 'Pair with **jcmd** **Thread.print** to see **thread** **pool** exhaustion in **Java** gateways.'],
  ['What belongs in **deep** **dive** of a **case** **study**?', '**Index** choice, **cache** **policy**, **queue** **ordering**, **idempotency**, **failure** **detection**.', 'Skipping **deep** **dive** leaves **interviewer** asking "**what** if **Redis** dies**?"** with no answer.', 'Sketch **happy** path plus one **partition** path on the board.', 'If **Java** is the **runtime**, mention **heap** sizing versus **pod** limit using **jcmd** **VM.native_memory** **summary**.'],
  ['How do you end a **system** **design** answer cleanly?', 'You summarize **trade-offs**, restate **assumptions**, and invite questions — watch the clock.', 'Rambling past **time** signals poor **communication** even if ideas are good.', 'Practice **twenty**-minute **timer** mocks twice weekly.', '**Java** **21** **preview** features should be labeled **preview** so **interviewer** trusts your **version** awareness.'],
  ['What is an **outbox** **pattern**?', 'You write **domain** **events** to an **outbox** table in the same **DB** **transaction** as business data.', 'Without it, **dual** **writes** to **DB** and **broker** can diverge silently.', '**Reconciliation** job compares **outbox** **pending** count to **broker** **lag**.', '**Java** **17** **records** help model **OutboxRow** immutably for reviewers.'],
  ['What is **chaos** **testing** in design conversations?', 'You deliberately **inject** **failure** in **staging** to prove **timeouts** and **bulkheads** work.', 'Teams that never **chaos** **test** discover **retry** bugs only on **Black** **Friday**.', 'Run **game** **day** **kill** **pod** script and capture **SLO** burn.', '**Java** **11** **FlightRecorder** can run during **chaos** to correlate **GC** with **injected** **latency**.'],
  ['What does a **Staff** engineer add to **behavioral** **+** **design** answers?', 'They tie **architecture** to **SLO** **burn**, **cost**, **security**, and **verification** commands like **jcmd** and **trace** IDs.', 'Stopping at **diagram** beauty without **metric** proof fails **Staff** **loop**.', 'Attach **before**/**after** **Grafana** screenshots and **java** **-version** to **postmortems**.', '**Java** **21** **Generational** **ZGC** changes how you discuss **pause** budgets versus **Java** **17** **ZGC**.'],
  ['What is **second**-order thinking in **trade-offs**?', 'You ask what happens after your fix — **retry** storms, **cache** **stampede**, **cost** **spike**.', 'First-order "**add** **cache**"** without **TTL** causes **stale** data incidents.', 'Model **load** **test** with **skewed** keys.', '**Java** **heap** **pressure** from giant **cached** **JSON** shows in **jcmd** **GC.class_histogram** under **load**.']
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
  'You should start every **system** **design** answer by naming **Kafka** and **Kubernetes** to sound senior.',
  '**Behavioral** **STAR** stories are better when **Situation** takes most of the time because context is everything.',
  '**Eventual** **consistency** means users never see stale data if you use a **CDN**.',
  '**Microservices** always reduce **complexity** compared to a **monolith** for any team size.',
  'You never need **idempotency** **keys** if your **HTTP** **clients** only **retry** on **GET** requests.',
  '**Virtual** **threads** in **Java** **21** remove the need to profile **blocking** **calls** or **JDBC** drivers.',
  '**Design** **docs** are optional if the team already has **Grafana** **dashboards**.',
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
    'What does **STAR** stand for in **behavioral** interviews?',
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
    'What should you do first in most **system** **design** prompts?',
    {
      A: '**Clarify** users, **scale**, and **SLA** before drawing components',
      B: 'Pick **Kafka** immediately',
      C: 'Draw **Kubernetes** clusters',
      D: 'Discuss your favorite **IDE**'
    },
    'A',
    '**Clarify** grounds the **case** **study** in real **constraints**.'
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
| Fresher | **STAR** | **Situation** **Task** **Action** **Result** with **I** in **Action** | timer **twenty** **s** on **Situation** |
| Fresher | **Clarify** | Ask **QPS**, **SLA**, money before boxes | write **assumptions** on board |
| Fresher | **Trade-off** | Say what you buy and sacrifice | **CAP** slice in one sentence |
| Senior Dev | **Idempotency** | Retries safe on **writes** | **Idempotency-Key** header |
| Senior Dev | **Hot** **partition** | One shard burns | **redis** **INFO** **commandstats** |
| Senior Dev | **Retry** **amplification** | Clients multiply pain | **jitter** + **bulkhead** |
| Senior Dev | **Backpressure** | Slow producers when consumers lag | **queue** **depth** alert |
| Tech Lead | **SLO** **doc** | **p99** + **error** **budget** in **design** | paste **Grafana** **UID** |
| Tech Lead | **Outbox** | Same **TX** for row + **event** | **reconciliation** job |
| Tech Lead | **Chaos** | **Kill** **pod** in **staging** weekly | **game** **day** runbook |
| Staff | **JFR** **pin** | **Virtual** **thread** reality check | **jdk.VirtualThreadPinned** **Java** **21** |
| Staff | **jcmd** **proof** | **BLOCKED** vs **I/O** wait | **Thread.print** + **trace** |
| Staff | **JDK** story | **Capacity** claims need **version** | **java** **-version** in **postmortem** |`;

export function buildDay89Sections() {
  const basic = buildBasicCode();
  const mid = buildMidCode();
  const adv = buildAdvCode();
  return [
    { type: 'why', title: 'Why System Design Case Study and Behavioral matters', content: buildWhy() },
    { type: 'theory', title: 'Theory and Internals — System Design Case Study and Behavioral', content: buildTheoryContent() },
    {
      type: 'code',
      title: 'Basic — System design + behavioral reference card',
      language: 'java',
      filename: 'Day89Basic.java',
      level: 'basic',
      description: 'Print-only: STAR, clarify, trade-offs, JVM proof commands.',
      code: basic.code,
      output: basic.output
    },
    {
      type: 'code',
      title: 'Intermediate — Four case-study and behavioral war stories',
      language: 'java',
      filename: 'Day89Intermediate.java',
      level: 'intermediate',
      description: 'Senior narration: clarify order, retries, hot keys, money paths.',
      code: mid.code,
      output: mid.output
    },
    {
      type: 'code',
      title: 'Advanced — Design review + interview triage matrix',
      language: 'java',
      filename: 'Day89Advanced.java',
      level: 'advanced',
      description: 'Doc risk signals, review actions, STAR and jcmd checklist.',
      code: adv.code,
      output: adv.output
    },
    {
      type: 'diagram',
      title: 'Case study + behavioral interview arc',
      diagramType: 'component',
      description: 'Clarify, sketch API and data, stress failures, STAR with metrics.',
      plantuml:
        '@startuml\ntitle Day 89 — Case study + behavioral\nactor Candidate\nparticipant Interviewer\nCandidate -> Interviewer : clarify scale SLA\nCandidate -> Interviewer : sketch read write paths\nCandidate -> Interviewer : failure + trade-offs\nCandidate -> Interviewer : STAR with numbers\nInterviewer -> Candidate : deep dive + hints\n@enduml'
    },
    { type: 'pitfalls', title: 'Common Pitfalls', items: PITFALLS },
    {
      type: 'exercise',
      title: 'Exercise — STAR + clarify vocabulary (fresher)',
      audience: 'fresher',
      difficulty: 'Beginner',
      problem:
        'You are writing your first **Java** program to memorize **system** **design** **interview** words and **STAR** pieces.\n\n1. Create **arch.day89.Day89FresherExercise** with **main**.\n2. Print one line explaining **STAR** letters in plain words.\n3. Print one line explaining why you **clarify** before you draw boxes.\n4. Print one line explaining **idempotency** in plain words.',
      hints: [
        'Keep every teaching line in a **final** **String** constant.',
        'Use only **System.out.println** so the exercise stays copy-safe.',
        'Mention **Result** needing a **number** somewhere in your printouts.'
      ],
      solution: `package arch.day89;

/** Fresher drill: say STAR and clarify out loud before any whiteboard. */
public class Day89FresherExercise {

    public static void main(String[] args) {
        // args ignored so classmates get identical stdout when they run your jar.
        final String starLine = "STAR is Situation Task Action Result; Action uses I and Result needs a metric.";
        // starLine stops vague we stories that fail behavioral bars.
        System.out.println(starLine);
        final String clarifyLine = "Clarify means ask QPS, SLA, and money before you name Kafka or Kubernetes.";
        // clarifyLine is the habit interviewers grade before your art skills.
        System.out.println(clarifyLine);
        final String idemLine = "Idempotency means retries do not double-charge or double-write the same effect.";
        // idemLine links API design to the retry storms you will debug later.
        System.out.println(idemLine);
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
      title: 'Exercise — Design review gate + behavioral rubric (staff)',
      audience: 'staff',
      difficulty: 'Advanced',
      problem:
        'Platform **engineering** asks you to model how you **block** bad **design** **docs** and weak **behavioral** **signals** before they reach **production**.\n\n1. Define three **record** values **payments**, **feed**, **search** each with booleans **sloMissing**, **failureMissing**, **migrationMissing** (mix true/false so each doc has at least one gap).\n2. Print one summary line per **doc** showing the three flags.\n3. Build a **LinkedHashMap** from gap key **slo_missing**, **failure_missing**, **migration_missing** to the first **String** **review** **action** you require.\n4. Print the map in insertion order.\n5. Print one line linking **Java** **service** claims to **jcmd** **Thread.print** plus **distributed** **trace** **IDs**.',
      hints: [
        'Actions are human policy strings, not **ProcessBuilder** calls.',
        '**LinkedHashMap** preserves the escalation story for auditors.',
        'Mention **STAR** **Result** metrics in at least one printed line.'
      ],
      solution: `package arch.day89;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Staff exercise: deterministic model for design-doc gates and interview rubric alignment.
 * Reasoning: without explicit gates, teams ship pretty diagrams that fail SLO and retry reality.
 */
public class Day89StaffExercise {

    record DocGap(String name, boolean sloMissing, boolean failureMissing, boolean migrationMissing) {}

    public static void main(String[] args) {
        // Three docs mirror common services that hit Staff review queues.
        DocGap payments = new DocGap("payments", true, false, false);
        DocGap feed = new DocGap("feed", false, true, false);
        DocGap search = new DocGap("search", false, false, true);

        // Printing flags first forces reviewers to see missing sections before debating Kafka logos.
        System.out.println("=== Design doc gaps ===");
        System.out.println(
            payments.name() + " sloMissing=" + payments.sloMissing() + " failureMissing="
                + payments.failureMissing() + " migrationMissing=" + payments.migrationMissing());
        System.out.println(
            feed.name() + " sloMissing=" + feed.sloMissing() + " failureMissing="
                + feed.failureMissing() + " migrationMissing=" + feed.migrationMissing());
        System.out.println(
            search.name() + " sloMissing=" + search.sloMissing() + " failureMissing="
                + search.failureMissing() + " migrationMissing=" + search.migrationMissing());

        // LinkedHashMap encodes mandatory first actions — order matters for runbook copy-paste.
        Map<String, String> gate = new LinkedHashMap<>();
        gate.put("slo_missing", "block merge until p99 and error budget rows exist with Grafana UID");
        gate.put("failure_missing", "require retry budget, idempotency, and bulkhead section signed by TL");
        gate.put("migration_missing", "require strangler or dual-write steps plus rollback test evidence");

        System.out.println("=== First gate action per gap ===");
        for (Map.Entry<String, String> e : gate.entrySet()) {
            System.out.println(e.getKey() + " -> " + e.getValue());
        }

        // Behavioral rubric note: numbers beat adjectives in panel scoring.
        System.out.println("=== Behavioral rubric note ===");
        System.out.println("Reject STAR stories whose Result lacks MTTR, percent, dollars, or incident count.");

        // JVM proof ties Java-heavy designs to thread states, not folklore.
        System.out.println("=== Java verification tie-in ===");
        System.out.println(
            "For Java services attach jcmd Thread.print plus trace IDs whenever tail latency is claimed.");

        // Virtual thread caveat prevents overselling Loom without JFR.
        System.out.println("=== Java 21 note ===");
        System.out.println("Enable JFR jdk.VirtualThreadPinned in staging soak before approving carrier math.");

        // Retry policy governance stops fifty teams from inventing fifty storms.
        System.out.println("=== Retry governance ===");
        System.out.println("Platform mesh policy must match design doc retry section or block deploy.");

        // Outbox pattern reminder for money paths.
        System.out.println("=== Ledger paths ===");
        System.out.println("Payments docs without outbox or saga pattern need explicit waiver from finance SRE.");

        // Prevention elevates one incident into template update.
        System.out.println("=== Prevention ===");
        System.out.println("File postmortem STAR worksheet with numeric Result and link revised design template.");

        // Audit bundle reduces leadership ping-pong during escalations.
        System.out.println("=== Audit bundle ===");
        System.out.println("Attach design PDF, SLO screenshot, jcmd snippet, and java -version for Java claims.");
    }
}
`
    },
    {
      type: 'interview',
      title: 'Interview Drill — System Design Case Study and Behavioral',
      conceptual: buildConceptual(),
      codeBased: buildCodeBased(),
      seniorScenario: buildSenior(),
      wrongAnswers: WRONG,
      jobSwitch: {
        resumeBullet:
          'Documented SLO-backed design templates across twelve teams and cut vague hire rejects forty percent.',
        interviewPositioning:
          'When I join a platform group I read how **design** **docs** and **interview** **rubrics** line up — weak **STAR** **Result** lines and missing **failure** sections are the same class of bug as missing **SLO** tables. In week one I run a **timed** **mock** **clarify**-first drill with the **Tech** **Leads** and I add **jcmd** **Thread.print** plus **trace** **ID** examples to the **Java** **service** **runbook** so **tail** **latency** stories have proof.',
        starAnchor:
          'Situation: our **hiring** **bar** **raiser** kept rejecting "**strong** **system** **thinkers**" who drew **Kafka** first. Task: fix **signals** without lowering the **technical** **bar**. Action: I rewrote the **rubric** to weight **clarify**, **failure** depth, and **numeric** **STAR** **Result**, coached **panelists** on **hint** **echo**, and linked **Java** **21** **virtual** **thread** **pin** checks to **JFR** in the **staging** **checklist**. Result: **offer** **rate** for **senior** **loops** rose **twenty** **percent** in **ninety** days and **postmortem** **STAR** **worksheets** with metrics became mandatory.'
      }
    },
    {
      type: 'mcq',
      title: 'MCQ — System Design Case Study and Behavioral',
      description: 'Thirty questions across basic, intermediate, and advanced design and behavioral levels.',
      questions: buildMcq()
    },
    { type: 'cheatsheet', title: 'Cheatsheet — System Design Case Study and Behavioral', content: CHEATSHEET }
  ];
}

