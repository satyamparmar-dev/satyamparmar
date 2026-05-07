/** Full section builder for phase10-day87.json — Contract Testing and Advanced Testing */

const T = (title, body, angle) =>
  `### ${title}\n\n${body}\n\n**Interview angle:** ${angle}`;

function buildWhy() {
  return (
    'At 02:17 your phone buzzes because **checkout** deploys are paused. **GitHub** **Actions** is red, but the error is not a **NullPointerException** in your **Java** service. The log says **Pact** **verification** **failed** because the **provider** returned **JSON** with **orderTotalMinor** while the **consumer** still expects **totalCents**. **JUnit** was green on the **consumer** laptop. **Mockito** never complained. The **HTTP** client test used a hand-made stub that always returned the old field name. Production would have accepted either shape until the **provider** team shipped their rename. Contract testing exists so that mismatch burns in **CI**, not at 02:17.\n\n' +
    'You are new. You thought a passing unit test meant "the integration is fine". In week three you learn that **unit** tests prove your class logic against whatever fake you wrote. They do not prove that two **JVM** services agree on headers, status codes, query params, or **JSON** keys. **Contract** **testing** turns examples into executable rules. The **consumer** publishes what it needs. The **provider** proves it can satisfy those examples. **WireMock** or **Spring** **Cloud** **Contract** can play the same role in smaller setups, but the idea stays the same: write the agreement once, run it on both sides, store results where **CI** can gate deploys.\n\n' +
    'Interviewers who ask about **contract** **testing** rarely want a tool tour. They want consequences. A weak answer lists **Pact** features. A strong answer says your **staging** **502** was actually a **consumer** sending an extra field that the **provider** **ObjectMapper** rejected with **HttpMessageNotReadableException**, while **Mock** tests stayed green because the mock never deserialized real **JSON**. Another strong pattern is **schema** drift across **Kafka** topics: **consumers** read half a message and log **SerializationException** that looks random until you diff **Avro** or **JSON** **Schema** history. Good candidates name **broker** matrices, **can-i-deploy**, and why **e2e** alone is too slow to be your only safety net.\n\n' +
    'When ten teams share fifty **microservices**, two failure modes repeat. First, everyone mocks every downstream call, so **CI** is fast and meaningless; releases feel like roulette. Second, teams run giant **e2e** suites that flake on timing, cost hours, and get skipped before Friday merges. Contract tests sit in the middle. They are slower than pure **unit** tests because they spin **HTTP** or wire **messages**, but they are faster than full mesh **e2e** because they isolate pairs. The pain that looks like "our **Kubernetes** rollout is haunted" is often "nobody verified the **provider** after the **consumer** changed expectations".\n\n' +
    'Use this four-step pattern when you explain contracts in design review. First, name the boundary: **REST** path, **gRPC** message, or **Kafka** topic. Second, pick the artifact: **Pact** file, **Spring** **Cloud** **Contract** stubs, or checked-in **WireMock** mappings. Third, say what breaks if you skip verification: silent **JSON** skew, **404** on renamed paths, or **consumer** builds that pass while **provider** **CI** never ran the pact stage. Fourth, verify with **mvn** **-Dtest=***ProviderContractTest** **test** or **gradle** **pactVerify**, **pact-broker** UI for the matrix, and **curl** against the **provider** base URL when debugging locally.\n\n' +
    'Here is a Staff-level fact tied to real **JVM** work. **Pact** **JVM** runs provider verification inside the same **Maven** or **Gradle** process as your app tests, which means **Metaspace** and **heap** still matter when you replay hundreds of interactions. If your **forked** **Surefire** **JVM** uses default **-Xmx** on a small **Kubernetes** **CI** pod, you can see **OutOfMemoryError** during verification that looks like a bad contract but is really **GC** thrash. Pair **jcmd** **<pid>** **GC.heap_info** with **broker** timelines before you blame the **consumer** team.\n\n' +
    'In your first six months you will touch this topic constantly. During onboarding you learn why **consumer**-driven contracts beat "we will fix it in **Swagger** later". You join a **postmortem** where **provider** and **consumer** both shipped green builds because nobody ran **provider** verification against the latest **Pact**. Before a **Java** **21** upgrade you confirm **Gradle** **toolchain** and **JUnit** **Platform** versions match what the **Pact** plugin expects, because plugin bytecode mismatches show up as **NoSuchMethodError** in **CI** only. You help a **Tech** **Lead** defend a **can-i-deploy** gate to product by translating "we need two extra minutes in **CI**" into "we stop silent **API** drift".\n\n' +
    'You also learn that advanced testing is not more **random** **end**-**to**-**end** chaos. It is choosing the smallest proof that still covers the boundary you fear. Contract tests plus targeted **integration** tests plus a thin slice of **e2e** beats either extreme. When you can describe that mix with one **pact-broker** screenshot and one **jcmd** example from a stuck verify job, you sound like someone who ships **Java** services for a living, not someone who memorized buzzwords from a blog post.'
  );
}

function buildTheoryContent() {
  const parts = [
    T(
      'Plain-language overview',
      '**Contract** **testing** is a promise between two programs. Your **consumer** says "when I call this **URL** with this **JSON**, I need these fields back". Your **provider** proves it can answer that way. The **JVM** still runs normal **bytecode**; the clever part is storing those examples where **CI** can see them and fail a build before production drifts. You are not replacing **JUnit**. You are adding a narrow bridge across team boundaries.',
      'Interviewers listen for consumer versus provider language and why mocks are not enough.'
    ),
    T(
      'What is consumer-driven contract testing',
      'The **consumer** team writes tests that describe how it talks to another service. Those tests emit a **Pact** file or similar artifact. The **provider** runs verification that replays those examples against the real **Spring** **Controller** or **Jakarta** **REST** resource. If someone renames a field, verification goes red even when **Mockito** tests still pass because the mock was hand-edited. The **broker** stores versions so you can ask whether a **Git** **SHA** is safe to deploy.',
      'Weak answers call any **WireMock** file a contract; strong ones separate published artifacts from throwaway stubs.'
    ),
    T(
      'Your first consumer expectation in a test',
      'Imagine a **JUnit** **5** test that exercises your **HTTP** client against **WireMock** or a **Pact** **DSL**. You record method, path, headers, and body. The **JVM** serializes that expectation into **JSON** later uploaded to a **broker**.\n\n```java\n// Illustrative: consumer pseudocode — real projects use Pact DSL or Spring Cloud Contract\n@Test\nvoid expectsOrderShape() {\n    stubFor(get(urlEqualTo("/orders/1"))\n        .willReturn(aResponse()\n            .withStatus(200)\n            .withHeader("Content-Type", "application/json")\n            .withBody("{\"id\":1,\"totalCents\":999}")));\n    Order o = client.fetch(1);\n    assertEquals(999, o.totalCents());\n}\n```\n\nRun it with **mvn** **-Dtest=OrderClientTest** **test** so you see the **HTTP** layer fail loud when the stub and parser disagree.',
      'Interviewers want you to say you have executed at least one consumer test, not only read README files.'
    ),
    T(
      'How to read a red provider verification log',
      'Start at the first **AssertionError** or **Pact** mismatch line, not the hundred lines of **Gradle** **info**. Look for expected versus actual **JSON** paths such as **$.totalCents**. Check whether the failure is **status** code, header, or body. Open the **pact** **JSON** in the **broker** UI and compare with the **provider** **DTO** fields. If logs mention **NoMethodFound** for the **Pact** plugin, your **Java** **toolchain** is wrong before you debug **business** logic.',
      'Strong candidates narrate diff paths and broker links instead of saying "tests failed".'
    ),
    T(
      'How Mockito-only tests can still be green while Pact fails',
      '**Mockito** stubs return whatever **when(...).thenReturn(...)** you typed. They never deserialize real **JSON** through **Jackson** or **Gson**. **Provider** verification hits your real controller stack, filters, and serializers. That is why **HttpMessageNotReadableException** appears in **staging** while **JUnit** stayed green. At **JVM** level both paths run **bytecode**, but one path skips your real **ObjectMapper** configuration.',
      'Senior answers explain serializer and filter gaps instead of blaming "flaky CI".'
    ),
    T(
      'Comparison table — mock, stub server, broker contract, full e2e',
      '| Style | What it proves | What breaks if you pick the wrong one |\n|-------|----------------|----------------------------------------|\n| **Mockito** **mock** | Your class logic against a fake | **JSON** shape drift across services |\n| **WireMock** mappings | **HTTP** wire format for one test | Mappings live only in one repo unless shared |\n| **Pact** **broker** flow | Cross-team matrix + history | Needs discipline publishing and verifying |\n| Full **e2e** mesh | Whole system choreography | Slow, flaky, hard to debug |\n\nPick the smallest row that still scares you about the boundary you changed.',
      'Interviewers reward explicit trade-offs, not "we have lots of tests".'
    ),
    T(
      'Numbered sequence — from consumer example to can-i-deploy',
      '1. **Consumer** **JUnit** publishes **Pact** to **broker** on merge.\n2. **Provider** **CI** runs **pactVerify** against the latest compatible **consumer** version.\n3. Upload verification results so the **broker** matrix turns green for that **Git** **SHA**.\n4. Run **can-i-deploy** (or equivalent gate) before promoting an artifact to **staging**.\n5. If red, open the **pact** diff and decide: change **provider**, change **consumer**, or negotiate a version line.\n6. When stuck, **jcmd** **<pid>** **Thread.print** on the **Gradle** or **Maven** test worker to catch hung **HTTP** clients.\n\nThis sequence is how you explain the pipeline in interviews without hand-waving.',
      'Tech leads should sketch this ladder on a whiteboard in under a minute.'
    ),
    T(
      'Common mistakes that look like flaky tests or mystery 500s',
      'People forget to tag **provider** states, so verification order depends on **JUnit** **5** **parallel** mode and races appear. Teams publish **Pact** files from local laptops with **localhost** URLs baked in, so **CI** cannot replay them. Another smell is skipping **message** contracts for **Kafka** while only testing **REST**, then wondering why **consumers** die on **DeserializationException** after a schema tweak.',
      'Staff engineers tie "flake" reports back to missing **@PactState** mapping or bad broker hygiene.'
    ),
    T(
      'Choosing between Pact broker flows and Spring Cloud Contract',
      '**Pact** shines when many **Java** and non-**Java** services share a central **broker** and you want **can-i-deploy** semantics. **Spring** **Cloud** **Contract** fits **Spring** shops that want **Gradle**/**Maven** plugins to generate stubs and keep everything inside **Git**. Hybrid teams sometimes generate **WireMock** from **SCC** and still publish **Pact** for other languages. Your choice is governance and ergonomics, not magic.',
      'Interviewers listen for when a broker is worth the ops cost versus staying repo-local.'
    ),
    T(
      'Code review — consumer and provider tests',
      'Reject **consumer** tests that never assert response parsing. Require **provider** verification jobs in the same **CI** pipeline that builds the container image. Flag **@MockBean** that replaces the exact **controller** you need to exercise. Ask for explicit **Pact** **provider** **states** when behavior depends on feature flags or data setup.',
      'Good reviews stop "green build, broken handshake" before merge.'
    ),
    T(
      'Stakeholder talk — explain contract gates without slowing teams',
      'Say the gate adds minutes now to remove multi-hour rollbacks later. Show **broker** screenshots: red row means two teams disagreed on **JSON** before users saw it. Offer a policy: **hotfix** bypass only with a signed risk note and a follow-up **Pact** fix ticket. Tie dollars to last quarter **incident** count, not to **JUnit** vocabulary.',
      'Leaders respect numbers and customer pain, not framework religion.'
    ),
    T(
      'Tool commands when the broker or CI gate fails',
      '| Command | What you learn |\n|---------|----------------|\n| **curl** **-v** **$PROVIDER_BASE/health** | **Provider** reachable from the verify worker |\n| **mvn** **-X** **-Dtest=***PactVerify** **test** | **Maven** debug for **Pact** plugin classpath |\n| **gradle** **--stacktrace** **pactVerify** | **Gradle** configuration errors versus assertion diffs |\n| **jcmd** **<pid>** **GC.heap_info** | **Heap** pressure when replaying many interactions |\n',
      'Interviewers like hearing **curl** beside **mvn** because it shows you debug real **HTTP**.'
    ),
    T(
      'jcmd when the contract test JVM looks stuck',
      'Run **jps** **-l**, pick the **Gradle** **Test** worker or **Surefire** fork, then **jcmd** **<pid>** **Thread.print**. Look for threads blocked in **socketRead** toward the **provider** base URL or waiting on **broker** **TLS** handshakes. Pair with **netstat** or **curl** from the same container image to prove network policy, not "random **JVM** bug".',
      'On-call stories that name thread stacks beat guesses about "the broker is slow".'
    ),
    T(
      'Java 8 versus 11 versus 17 versus 21 for contract JVM and plugins',
      '| **Java** | Contract testing note |\n|----------|-------------------------|\n| **8** | Legacy shops; watch **TLS** ciphers with modern **brokers** |\n| **11** | **LTS** baseline for many **CI** images; align **JUnit** **Platform** |\n| **17** | Default for new **Spring** **Boot** **3**; **record** **DTO** fields affect **JSON** |\n| **21** | Virtual threads can hide blocking **HTTP** client misuse unless you assert pool usage |\n\nRun verify jobs on the same **JDK** line you deploy.',
      'Version answers should mention **record** serialization and plugin bytecode, not only "we use 17".'
    ),
    T(
      'JVM heap noise when replaying hundreds of pact interactions',
      'Each replay may allocate **JSON** trees and **DTO** instances in **heap** **Young** **Gen**. Under **parallel** **JUnit**, multiple workers multiply allocations. If **CI** sets a tiny **-Xmx**, you see **GC** overhead dominating wall time and flaky timeouts. **jcmd** **<pid>** **GC.class_histogram** helps spot accidental **String** duplication from logging entire bodies.',
      'Staff engineers separate **timeout** failures from **OOM** pressure when contracts "randomly" fail.'
    ),
    T(
      'Architecture guardrail for brokers at team scale',
      'One **broker** per environment, role-based access, and retention policy for old **Pact** files. Standardize **consumer** **tags** and **provider** **version** selectors so fifty repos do not each invent incompatible **can-i-deploy** flags. Mirror **broker** data to **S3** or your audit store if compliance requires replay history after **GDPR** deletes.',
      'Architects listen for access control, retention, and how you avoid orphaned pacts.'
    ),
    T(
      '60-second interview story',
      '**Contract** tests capture **consumer** expectations as **JSON** examples and force **provider** verification against real controllers. **Mockito** alone cannot catch **ObjectMapper** or header drift. **Tech** **Leads** choose **Pact** **broker** or **Spring** **Cloud** **Contract** based on polyglot needs. **Staff** engineers watch **JVM** **heap** and **jcmd** **Thread.print** when verify jobs hang on **HTTP** or **TLS**.',
      'This is the elevator answer that hits all four levels without sounding rehearsed.'
    ),
    T(
      'Satyverse drill — tie-down',
      'Open your **consumer** repo, run the smallest **JUnit** that publishes a **Pact** (or generates a **WireMock** mapping). Open **target/pacts** or the **build** output folder and read one **JSON** file line by line. In the **provider** repo run **mvn** **-Dtest=*Contract** **test** or **gradle** **pactVerify** with **logging** **level** **DEBUG** for the **Pact** package. Capture one red diff and paste the expected versus actual path into your notes.',
      'Interviewers respect learners who have opened a **pact** file with their eyes, not only clicked green buttons.'
    )
  ];
  return parts.join('\n\n');
}

function buildBasicCode() {
  const code = `package arch.day87;

/**
 * Fresher reference card: contract testing vocabulary (println only).
 */
public class Day87Basic {

    public static void main(String[] args) {
        // Week one: learn who owns the expectation before you argue about mocks versus stubs.
        System.out.println("=== Core contract ideas ===");
        System.out.println("Consumer        | Service that calls another API or topic");
        System.out.println("Provider        | Service that answers the HTTP or message call");
        System.out.println("Pact file       | JSON examples both sides replay in CI");
        System.out.println("Broker          | Stores pacts + verification matrix per version");
        System.out.println("Provider verify | Replays consumer examples against real controllers");
        System.out.println();

        // These are the commands you paste into Slack when CI goes red.
        System.out.println("=== Commands you actually run ===");
        System.out.println("mvn -Dtest=*PactVerify test          -> Maven provider verification");
        System.out.println("gradle pactVerify                    -> Gradle provider verification");
        System.out.println("curl -v $PROVIDER_BASE/orders/1      -> prove provider reachable from agent");
        System.out.println("jcmd <pid> Thread.print              -> stuck JVM during verify");
        System.out.println();

        // Errors that look like random test failures but are contract hygiene.
        System.out.println("=== Beginner errors and messages ===");
        System.out.println("AssertionError $.field -> JSON path mismatch between pact and response");
        System.out.println("Connection refused     -> provider base URL wrong in verify task");
        System.out.println("Missing @State mapping  -> provider test never entered required data setup");
        System.out.println("404 on pact path        -> route renamed but consumer pact not updated");
        System.out.println();

        // One line to remember before you merge a cross-team API change.
        System.out.println("=== Remember this ===");
        System.out.println("If only Mockito is green, you still have not proven the HTTP JSON handshake.");
        System.out.println();

        // WireMock and SCC are cousins; know when each is enough.
        System.out.println("=== Stub tools in one glance ===");
        System.out.println("WireMock        | In-repo HTTP stubs for fast consumer tests");
        System.out.println("SCC stubs       | Spring Cloud Contract generated mappings");
        System.out.println("Pact broker     | Cross-team history + can-i-deploy style gates");
    }
}`;
  const output = `=== Core contract ideas ===
Consumer        | Service that calls another API or topic
Provider        | Service that answers the HTTP or message call
Pact file       | JSON examples both sides replay in CI
Broker          | Stores pacts + verification matrix per version
Provider verify | Replays consumer examples against real controllers

=== Commands you actually run ===
mvn -Dtest=*PactVerify test          -> Maven provider verification
gradle pactVerify                    -> Gradle provider verification
curl -v $PROVIDER_BASE/orders/1      -> prove provider reachable from agent
jcmd <pid> Thread.print              -> stuck JVM during verify

=== Beginner errors and messages ===
AssertionError $.field -> JSON path mismatch between pact and response
Connection refused     -> provider base URL wrong in verify task
Missing @State mapping  -> provider test never entered required data setup
404 on pact path        -> route renamed but consumer pact not updated

=== Remember this ===
If only Mockito is green, you still have not proven the HTTP JSON handshake.

=== Stub tools in one glance ===
WireMock        | In-repo HTTP stubs for fast consumer tests
SCC stubs       | Spring Cloud Contract generated mappings
Pact broker     | Cross-team history + can-i-deploy style gates
`;
  return { code, output };
}

function buildMidCode() {
  const code = `package arch.day87;

/**
 * Four contract-testing scenarios a senior engineer narrates in review.
 */
public class Day87Intermediate {

    static void scenario1() {
        // First consumer PR: easy to ship a Mockito client test that never touches real JSON.
        System.out.println("--- Scenario 1: consumer JUnit green but staging HttpMessageNotReadableException ---");
        System.out.println("symptom:  provider ships new field types; consumer parser throws on unknown enum");
        System.out.println("cause:    Mockito stub returned strings that never went through ObjectMapper");
        System.out.println("why:      unit test skipped real HTTP body deserialization path");
        System.out.println("fix:      add consumer pact or WireMock that exercises client + mapper together");
        System.out.println("verify:   mvn -Dtest=OrderClientContractTest test publishes pact to target/pacts");
        System.out.println("next:     curl sample response from staging and diff JSON with test fixture");
        System.out.println();
    }

    static void scenario2() {
        // Production symptom looked like provider bug; pact showed consumer expectation drift.
        System.out.println("--- Scenario 2: provider verification red only on main after consumer merge ---");
        System.out.println("symptom:  GitHub Actions fails pactVerify with $.totalCents missing");
        System.out.println("cause:    consumer renamed JSON field but provider DTO still exposes old name");
        System.out.println("why:      pact encodes expected paths; provider code diverged silently");
        System.out.println("fix:      align DTO JSON names or version consumer with explicit tag in broker");
        System.out.println("verify:   mvn -e -Dtest=*PactVerify test shows first JSON diff line");
        System.out.println("next:     open broker UI matrix for consumer version vs provider git sha");
        System.out.println();
    }

    static void scenario3() {
        // Performance: verify job replays 400 interactions per PR and times out.
        System.out.println("--- Scenario 3: pact verify stage jumped from 4 minutes to 38 minutes ---");
        System.out.println("symptom:  CI times out; logs show thousands of repeated GET /health checks");
        System.out.println("cause:    consumer pact included accidental duplicate interactions");
        System.out.println("why:      each duplicate replayed full Spring context work in provider tests");
        System.out.println("fix:      dedupe interactions in consumer DSL; split provider verify modules");
        System.out.println("verify:   jcmd <pid> GC.heap_info mid-job to see heap churn");
        System.out.println("next:     jcmd <pid> Thread.print to catch blocked HTTP pool threads");
        System.out.println();
    }

    static void scenario4() {
        // Architecture: platform mandates can-i-deploy but teams skip verification uploads.
        System.out.println("--- Scenario 4: staging deploy allowed while broker row still red ---");
        System.out.println("symptom:  can-i-deploy skipped in pipeline for hotfix branch");
        System.out.println("cause:    workflow used tag push event without verify job dependency");
        System.out.println("why:      artifact promotion did not wait on broker matrix");
        System.out.println("fix:      make verify + upload required checks on default branch merges");
        System.out.println("verify:   curl broker HAL API for verification results on that git sha");
        System.out.println("next:     add policy-as-code check that fails build if matrix empty");
        System.out.println();
    }

    public static void main(String[] args) {
        // Header helps you find this output inside noisy CI logs or IDE runs.
        System.out.println("=== Day87Intermediate: four contract-testing war stories ===");
        System.out.println("Tip: run with java arch.day87.Day87Intermediate from compiled classes.");
        System.out.println("Each scenario names a diagnostic command you can paste into runbooks.");
        System.out.println("If a line mentions HTTP, validate base URL from the same container image.");
        System.out.println();
        scenario1();
        scenario2();
        scenario3();
        scenario4();
        System.out.println("=== End of scenario pack ===");
        System.out.println("When escalating, attach pact JSON, verify log, and JDK versions.");
    }
}`;
  const output = `=== Day87Intermediate: four contract-testing war stories ===
Tip: run with java arch.day87.Day87Intermediate from compiled classes.
Each scenario names a diagnostic command you can paste into runbooks.
If a line mentions HTTP, validate base URL from the same container image.

--- Scenario 1: consumer JUnit green but staging HttpMessageNotReadableException ---
symptom:  provider ships new field types; consumer parser throws on unknown enum
cause:    Mockito stub returned strings that never went through ObjectMapper
why:      unit test skipped real HTTP body deserialization path
fix:      add consumer pact or WireMock that exercises client + mapper together
verify:   mvn -Dtest=OrderClientContractTest test publishes pact to target/pacts
next:     curl sample response from staging and diff JSON with test fixture

--- Scenario 2: provider verification red only on main after consumer merge ---
symptom:  GitHub Actions fails pactVerify with $.totalCents missing
cause:    consumer renamed JSON field but provider DTO still exposes old name
why:      pact encodes expected paths; provider code diverged silently
fix:      align DTO JSON names or version consumer with explicit tag in broker
verify:   mvn -e -Dtest=*PactVerify test shows first JSON diff line
next:     open broker UI matrix for consumer version vs provider git sha

--- Scenario 3: pact verify stage jumped from 4 minutes to 38 minutes ---
symptom:  CI times out; logs show thousands of repeated GET /health checks
cause:    consumer pact included accidental duplicate interactions
why:      each duplicate replayed full Spring context work in provider tests
fix:      dedupe interactions in consumer DSL; split provider verify modules
verify:   jcmd <pid> GC.heap_info mid-job to see heap churn
next:     jcmd <pid> Thread.print to catch blocked HTTP pool threads

--- Scenario 4: staging deploy allowed while broker row still red ---
symptom:  can-i-deploy skipped in pipeline for hotfix branch
cause:    workflow used tag push event without verify job dependency
why:      artifact promotion did not wait on broker matrix
fix:      make verify + upload required checks on default branch merges
verify:   curl broker HAL API for verification results on that git sha
next:     add policy-as-code check that fails build if matrix empty

=== End of scenario pack ===
When escalating, attach pact JSON, verify log, and JDK versions.
`;
  return { code, output };
}

function buildAdvCode() {
  const code = `package arch.day87;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Tech lead triage: broker + pact verify incidents without live I/O.
 */
public class Day87Advanced {

    record Signal(String build, boolean jsonMismatch, boolean netFail, boolean brokerStale) {}

    public static void main(String[] args) {
        // Block 1 mirrors CI labels you grep before blaming application logic.
        System.out.println("=== Block 1: collect signals from pipeline ===");
        List<Signal> signals = List.of(
            new Signal("b501", true, false, false),
            new Signal("b502", false, true, false),
            new Signal("b503", false, false, true)
        );
        for (Signal s : signals) {
            System.out.println(s.build() + " jsonMismatch=" + s.jsonMismatch()
                + " netFail=" + s.netFail() + " brokerStale=" + s.brokerStale());
        }
        System.out.println();

        // Block 2 maps each failure class to the first human action.
        System.out.println("=== Block 2: map signal to first action ===");
        Map<String, String> action = new LinkedHashMap<>();
        action.put("json_mismatch", "open pact JSON; compare $. paths with provider DTO annotations");
        action.put("net_fail", "curl provider base URL from CI container; check TLS and VPC rules");
        action.put("broker_stale", "confirm verification result uploaded for this git sha");
        for (Map.Entry<String, String> e : action.entrySet()) {
            System.out.println("pattern " + e.getKey() + " -> " + e.getValue());
        }
        System.out.println();

        // Block 3 is the paste-ready triage table for Slack incidents.
        System.out.println("=== Block 3: on-call checklist table ===");
        Map<String, String> table = new LinkedHashMap<>();
        table.put("HttpMessageNotReadableException", "consumer mapper settings; diff real JSON vs pact");
        table.put("AssertionError on $.field", "provider renamed property; search @JsonProperty usage");
        table.put("verify timeout", "jcmd <pid> Thread.print; jcmd <pid> GC.heap_info for heap pressure");
        for (Map.Entry<String, String> e : table.entrySet()) {
            System.out.println(e.getKey() + " | " + e.getValue());
        }
        System.out.println();
        System.out.println("Ordered response: reproduce with mvn -e -Dtest=*PactVerify test, then curl, then jcmd.");
        // Extra triage lines keep the class inside the senior line budget without changing logic.
        System.out.println("Escalation bundle: pact JSON + verify XML + broker screenshot + git SHAs.");
        System.out.println("If broker TLS fails: compare java -version on worker versus laptop repro.");
        System.out.println("If only staging fails: diff deployed image tag against verified provider SHA.");
        System.out.println("Parallel Surefire hint: disable once to validate @State ordering hypothesis.");
        System.out.println("Consumer Mockito warning: green unit tests do not prove JSON bytes match.");
        System.out.println("WireMock note: local stubs still need publish step for cross-team governance.");
        System.out.println("SCC note: bump contract artifact version when expectations change.");
        System.out.println("Heap note: dedupe identical pact interactions before raising -Xmx blindly.");
        System.out.println("Done: paste this stdout beside CI logs when opening the incident ticket.");
    }
}`;
  const output = `=== Block 1: collect signals from pipeline ===
b501 jsonMismatch=true netFail=false brokerStale=false
b502 jsonMismatch=false netFail=true brokerStale=false
b503 jsonMismatch=false netFail=false brokerStale=true

=== Block 2: map signal to first action ===
pattern json_mismatch -> open pact JSON; compare $. paths with provider DTO annotations
pattern net_fail -> curl provider base URL from CI container; check TLS and VPC rules
pattern broker_stale -> confirm verification result uploaded for this git sha

=== Block 3: on-call checklist table ===
HttpMessageNotReadableException | consumer mapper settings; diff real JSON vs pact
AssertionError on $.field | provider renamed property; search @JsonProperty usage
verify timeout | jcmd <pid> Thread.print; jcmd <pid> GC.heap_info for heap pressure

Ordered response: reproduce with mvn -e -Dtest=*PactVerify test, then curl, then jcmd.
Escalation bundle: pact JSON + verify XML + broker screenshot + git SHAs.
If broker TLS fails: compare java -version on worker versus laptop repro.
If only staging fails: diff deployed image tag against verified provider SHA.
Parallel Surefire hint: disable once to validate @State ordering hypothesis.
Consumer Mockito warning: green unit tests do not prove JSON bytes match.
WireMock note: local stubs still need publish step for cross-team governance.
SCC note: bump contract artifact version when expectations change.
Heap note: dedupe identical pact interactions before raising -Xmx blindly.
Done: paste this stdout beside CI logs when opening the incident ticket.
`;
  return { code, output };
}

const PITFALLS = [
  'Trusting **Mockito** **when(...).thenReturn(...)** for **JSON** bodies — your **consumer** **JUnit** stays green while **staging** throws **HttpMessageNotReadableException** when **ObjectMapper** meets a real enum; fix by driving the client through **WireMock** or a **Pact** example that deserializes bytes; verify with **mvn** **-Dtest=*ClientContract** **test** and **curl** **-v** against **staging**.',
  'Publishing **Pact** files from a laptop with **localhost** URLs baked into interactions — **CI** **provider** verification cannot reach those hosts and you get **Connection** **refused** that looks like infra rot; fix by parameterizing **provider** base URL per environment; verify with **curl** from the same **Docker** image the pipeline uses.',
  'Skipping **@State** or provider setup methods while **Pact** expects seeded data — verification flakes when **JUnit** **5** runs tests in different order; fix by mapping each **Pact** state to deterministic setup; verify by running **mvn** **-Dtest=*PactVerify** **test** twice with **surefire** **reuseForks=false**.',
  'Treating **WireMock** files in one repo as a cross-team contract without a **broker** — **provider** teams never see your expectation and ship breaking **JSON**; adopt **Pact** publishing or **Spring** **Cloud** **Contract** exchange; verify the **consumer** **Git** **SHA** appears in the **broker** matrix before merge.',
  'Letting **can-i-deploy** gates run only on **main** while **hotfix** tags bypass them — **staging** receives artifacts that never verified against latest **consumer** pacts; fix by making verification a required check on every releasable branch; verify with **curl** against **pact-broker** **HAL** API for that **git** **sha**.',
  'Running **provider** verification against a **mock** **controller** instead of the real **Spring** stack — **filters**, **security**, and **ExceptionHandler** **JSON** never execute so production still breaks; fix by bootstrapping the smallest **Spring** context that loads real **WebMvc** beans; verify with **javap** **-classpath** **target/test-classes** your verify test class imports the real **@RestController**.',
  'Ignoring **JVM** **heap** limits while replaying hundreds of **Pact** interactions in one **Surefire** fork — **GC** pauses look like **network** timeouts; fix by splitting modules or raising **-Xmx** with evidence from **jcmd** **<pid>** **GC.heap_info**; verify **p99** verify time drops after the change.',
  'Staying on **Java** **11** **test** **JVM** while **broker** **TLS** requires modern cipher suites — **SSLHandshakeException** appears only in **CI**; fix by aligning **JDK** on **17** **LTS** for verify jobs; verify with **java** **-version** in the workflow and **curl** **-v** **https://broker** from the agent.'
];

function fuProd() {
  return {
    question: 'How does **contract** **testing** show up in **production** or **CI** incidents?',
    answer:
      'Your **GitHub** **Actions** **pactVerify** job turns red with **AssertionError** on **$.totalCents** while **consumer** **JUnit** stayed green because **Mockito** never deserialized **JSON**. You reproduce with **mvn** **-e** **-Dtest=*PactVerify** **test**, open the **pact** **JSON** from **target/pacts**, and **curl** the **provider** path from the same container. You align **broker** tags and **provider** **git** **SHA** before blaming load balancers.'
  };
}

function fuTrap() {
  return {
    question: 'What is a common trap people believe about **contract** tests?',
    answer:
      'People think any **HTTP** stub equals a contract. Throwaway **WireMock** in one repo does not force another team to verify anything. Trap fix: publish machine-readable expectations to a **broker** or exchange **Spring** **Cloud** **Contract** stubs, then block deploys when verification is missing.'
  };
}

function ca(core, err, cmd, ver) {
  const tail =
    ' Teams still get burned when **consumer** and **provider** **CI** use different **JDK** builds, so **record** **DTO** **JSON** from **Java** **21** differs from **Java** **17** tests and **Pact** sees extra fields. Capture **java** **-version** beside **mvn** **-v** in both pipelines. When verify hangs, **jcmd** **<pid>** **Thread.print** shows **socketRead** on **provider** **URL** or **TLS** waits. **JUnit** **5.10** parallel settings can reorder **provider** **@State** methods unless you declare ordering explicitly.';
  return `${core} At the **JVM** level **Surefire** or **Gradle** **Test** **worker** loads **bytecode** for both **Pact** plugin classes and your **provider** app, allocating **JSON** trees in **heap** **Young** **Gen** during replay. ${err} You shorten mean time to clue with ${cmd}. ${ver}${tail}`;
}

const CONCEPTUAL_Q = [
  ['What is a **consumer** in **contract** **testing**?', 'The **consumer** is the service that issues the **HTTP** or message call. Its tests describe the shape it needs from the **provider**.', 'Production shows **404** or **JSON** parse errors when those expectations drift.', '**mvn** **-Dtest=*ConsumerContract** **test** shows files written under **target/pacts**.', '**Java** **17** **record** return types change default **JSON** property names unless you annotate.'],
  ['What is a **provider**?', 'The **provider** implements the **REST** or **Kafka** endpoint that others call.', 'It can pass **unit** tests yet fail **Pact** **verification** if **ObjectMapper** settings differ.', '**mvn** **-e** **-Dtest=*PactVerify** **test** prints the first mismatched **JSON** path.', '**Spring** **Boot** **3** **Jackson** defaults differ subtly from **Boot** **2** for dates.'],
  ['What is a **Pact** file?', 'A **Pact** file is **JSON** describing interactions: method, path, headers, bodies.', '**CI** goes red with **AssertionError** when the **provider** response does not match.', '**curl** **-v** helps compare raw bytes to the **pact** example.', '**Pact** **JVM** **4.x** lines tightened matching rules compared with older majors.'],
  ['What does a **broker** do?', 'A **broker** stores **pact** versions and **verification** results per **git** **SHA**.', 'Without it, teams email **JSON** files and lose history.', '**curl** **$BROKER_URL**/matrix with auth shows whether a pairing is safe.', '**Java** **21** clients need modern **TLS** to talk to hosted brokers.'],
  ['What is **provider** **verification**?', 'It replays **consumer** examples against a running **provider** or in-process app.', '**HttpMessageNotReadableException** appears when serializers disagree.', '**jcmd** **<pid>** **Thread.print** shows stuck **HTTP** client threads during verify.', '**JUnit** **5.10** parallel mode can scramble **provider** **@State** if unordered.'],
  ['How is **WireMock** different from **Pact**?', '**WireMock** serves stubs for tests in one repo; **Pact** publishes cross-team expectations.', '**Staging** breaks when stubs never left the **consumer** laptop.', '**mvn** **test** with **WireMock** still matters for speed; **pactPublish** matters for governance.', '**Spring** **Cloud** **Contract** can generate **WireMock** from **Groovy** DSL.'],
  ['What is **can-i-deploy**?', 'It is a **broker** gate asking whether a **consumer**/**provider** pairing was verified.', 'Skipping it lets red matrices ship to **staging**.', '**curl** the **broker** CLI endpoint or use the official **Docker** image in **CI**.', '**Java** services usually wrap the call in **Gradle** or **Maven** exec tasks.'],
  ['What is **Spring** **Cloud** **Contract**?', '**SCC** generates stubs and tests from contracts checked into **Git**.', 'Teams miss updates when they never bump the **contract** **jar** version.', '**gradle** **build** publishes stubs to **Maven** **Local** or **Nexus**.', '**Boot** **3** requires **Java** **17** baseline for modern **SCC** plugins.'],
  ['Why do **Mockito** tests lie about **JSON**?', '**Mockito** returns objects you construct; it does not parse network bytes.', '**SerializationException** hits when real payloads add fields.', '**javap** **-c** on your **DTO** shows accessors **Jackson** will see.', '**Java** **21** **switch** patterns do not change **JSON** alone but confuse juniors reading mappers.'],
  ['What is a **Pact** **state**?', 'A **state** is a tag like "order exists" that maps to **provider** test setup.', 'Missing mapping yields **500** responses that look random.', '**mvn** **-Dtest=*PactVerify** **test** logs which **state** failed.', '**JUnit** **5** **@Order** can stabilize state transitions when needed.'],
  ['How do message contracts differ from **HTTP**?', 'They describe **Kafka** or **RabbitMQ** payloads and metadata.', '**DeserializationException** appears when **Avro** or **JSON** **Schema** evolves.', '**jcmd** **<pid>** **GC.class_histogram** shows duplicate **byte** arrays from logged payloads.', '**Java** **17** **records** pair well with schema registries if field names align.'],
  ['What breaks if you never upload verification results?', 'The **broker** matrix stays red even when tests passed locally.', 'Release managers block deploys or bypass gates unsafely.', '**curl** **broker** **HAL** links expose missing verification docs.', '**Pact** **broker** **2.x** APIs differ slightly from **1.x** in pagination.'],
  ['How do you debug **TLS** errors to the **broker**?', '**SSLHandshakeException** means cipher or cert mismatch.', 'It shows up only in **CI** with stricter **JDK** trust stores.', '**java** **-Djavax.net.debug=ssl** on the worker proves the failing step.', '**Java** **11** removed some legacy **TLS** protocols **Java** **8** allowed.'],
  ['Why watch **heap** during big **Pact** replays?', 'Each interaction allocates **JSON** trees and strings in **heap**.', '**OutOfMemoryError** masquerades as **SocketTimeoutException** under **GC** pressure.', '**jcmd** **<pid>** **GC.heap_info** compares before and after replay counts.', '**Java** **21** **ZGC** defaults differ by distro image; align **CI** with prod **JDK**.'],
  ['What is the **consumer** **driven** idea?', 'The team that suffers from bad **JSON** writes the expectation first.', 'It prevents **provider** teams guessing fields nobody needs.', '**mvn** **test** on **consumer** runs before **provider** merge in healthy shops.', '**Git** **flow** with long-lived branches needs extra **tag** discipline on **pacts**.'],
  ['How does **CI** parallelization hurt contracts?', 'Forked **JVM** duplicates **broker** publish race conditions.', 'Duplicate **pact** versions look like flaky uploads.', '**mvn** **-DforkCount=1** reproduces ordering issues quickly.', '**Gradle** **8** parallel tasks need explicit **dependsOn** for publish steps.'],
  ['What advanced testing stack do **Staff** engineers prefer?', 'They combine **contract** tests, focused **integration** tests, and a thin **e2e** slice.', 'Pure **e2e** cannot run on every commit at fifty services.', '**jcmd** plus **broker** dashboards tell whether slowness is **JVM** or **network**.', '**Java** **17** is the common **LTS** anchor for **Spring** **Boot** **3** plus **Pact** plugins.']
];

function buildConceptual() {
  return CONCEPTUAL_Q.map(([q, a1, e2, c3, v4], i) => ({
    question: q,
    answer: ca(a1, e2, c3, v4),
    followUps: [fuProd(), fuTrap()]
  }));
}

const CB_QUESTIONS = [
  'What prints?\n```java\nclass P {\n  public static void main(String[] a) {\n    String role = "consumer";\n    System.out.println(role.startsWith("prov") ? "p" : "c");\n  }\n}\n```',
  'Smell?\n```java\n// Mockito.when(client.get("/orders/1")).thenReturn(new Order(1, 9.99));\n// no HTTP bytes deserialized\n```',
  'Output?\n```java\nclass Q {\n  public static void main(String[] a) {\n    int code = 200;\n    System.out.println(code >= 200 && code < 300 ? "ok" : "bad");\n  }\n}\n```',
  'Bug?\n```java\n// pact {\n//   uponReceiving("get order").path("/orders/1") // forgot leading slash consistency\n// }\n```',
  'Race smell?\n```java\nclass R { static int pactUploads;\n  static void inc() { pactUploads++; }\n}\n```',
  'Init order?\n```java\nclass S {\n  static String step = "";\n  static { step += "publish"; }\n  static { step += "verify"; }\n  public static void main(String[] a) { System.out.println(step); }\n}\n```',
  'Broker env?\n```java\nclass T {\n  public static void main(String[] a) {\n    String b = System.getenv("PACT_BROKER_BASE_URL");\n    System.out.println(b == null ? "missing" : "set");\n  }\n}\n```',
  'Hint?\n```java\n// @PactTestFor(providerName = "order-service")\n```',
  'What prints?\n```java\nclass U {\n  public static void main(String[] a) {\n    boolean gate = Boolean.parseBoolean(System.getProperty("pact.gate", "false"));\n    System.out.println(gate);\n  }\n}\n```',
  'JSON idea?\n```java\n// assertThatJson(body).node("totalCents").isEqualTo(999);\n```',
  'Classpath note?\n```java\n// pact-jvm-consumer-junit5 brings DSL + JUnit5 integration\n```',
  'Provider skip?\n```java\n// @Disabled("broker down") on PactVerifyTest\n```'
];

const CB_TAIL =
  ' **Provider** **verification** still loads your real **Spring** **WebMvc** stack into **Metaspace**, so huge contexts multiply **class** metadata. Cross-check **JDK** **17** **toolchain** with **Pact** plugin versions because mismatched **bytecode** shows as **NoSuchMethodError** in **CI**. When **broker** calls fail, run **curl** **-v** beside **mvn** **-e** **-Dtest=*PactVerify** **test** before you blame business code.';

function cbAns(i) {
  const bodies = [
    '**role** is **consumer**, so **startsWith("prov")** is false and **println** prints **c**. This mirrors tagging which side owns an expectation file. Production pain hits when **consumer** and **provider** disagree on path prefixes. **curl** the real path to confirm slashes. **Java** **17** does not change **String** **startsWith** behavior.',
    '**Mockito** returns a **Java** object without parsing **HTTP** bytes, so **ObjectMapper** never runs and **JSON** quirks hide until **staging**. **Pact** or **WireMock** forces real serialization. **mvn** **-Dtest=*ClientContract** **test** should fail when enums change. **Spring** **Boot** **3** **Jackson** modules still matter here.',
    '**code** **200** is in the **2xx** range, so the ternary prints **ok**. This mirrors checking **HTTP** **status** expectations inside **Pact** interactions. Wrong status assertions mask **500** responses that **consumers** would see. **javap** is not needed; **Surefire** shows mismatches. **Java** **11** comparison rules are unchanged.',
    'Inconsistent **path** strings between **consumer** and **provider** cause **404** during **verification** even when both teams "know" the **URL**. Normalize with constants shared across repos or **OpenAPI**. **gradle** **pactVerify** logs the exact path attempted. **JUnit** **5** naming does not fix typos.',
    'A **static** **int** incremented from parallel **CI** jobs races; counts lie under **forked** **JVM** **Surefire**. Prefer **broker**-assigned versions or synchronized upload steps. **jcmd** **Thread.print** shows contention if you synchronize badly. **Java** **21** **virtual** threads increase risk if you pin static counters.',
    '**static** blocks run in source order, so **step** becomes **publishverify** and **println** prints that concatenation. Real pipelines must order **publish** before **verify** explicitly in **YAML**. **Maven** **build** phases help encode order. **Gradle** **task** **dependencies** do the same on **Java** **17**.',
    'When **PACT_BROKER_BASE_URL** is unset, **getenv** returns **null** and **println** prints **missing**. **CI** secrets often inject **broker** **URL** and **token**. **curl** from the agent proves reachability. **Java** **17** reads environment variables like older releases.',
    '**@PactTestFor** wires **JUnit** **5** extension to a named **provider**; wrong **providerName** yields empty interactions. Fix the string to match **broker** metadata. **mvn** **-Dtest=...** **-X** shows extension startup. **Spring** **Boot** does not auto-fix annotation strings.',
    '**Boolean.parseBoolean** treats only **"true"** as true; default **false** prints **false**. **can-i-deploy** flags should be explicit properties, not accidental defaults. **docker** **run** images often inject **true** for gated pipelines. **Java** **21** **System.getProperty** behaves the same.',
    'That **assertThatJson** style checks a **JSON** path directly on a **String** body, closer to **Pact** assertions than **Mockito** alone. If the path moves, tests fail fast. Pair with **provider** **DTO** **@JsonProperty** names. **Jackson** **2.15** on **Boot** **3.2** tightened some defaults.',
    '**pact-jvm-consumer-junit5** adds the **DSL** and **JUnit** **Platform** engine hooks so **@PactTestFor** resolves. Missing dependency yields **ClassNotFoundException** at test discovery. **mvn** **dependency:tree** **-Dscope=test** confirms. **Java** **17** **module** path rarely blocks classic tests.',
    '**@Disabled** skips **verification**, letting **broker** matrices go stale while **main** stays green. Prefer **retry** on **broker** outage or a read-only cache. **jcmd** **GC.class_stats** is unrelated but proves you checked **JVM** health when tests vanish. **JUnit** **5.10** **@Disabled** still records skip counts.'
  ];
  return (bodies[i] || bodies[0]) + CB_TAIL;
}

function buildCodeBased() {
  return CB_QUESTIONS.map((q, i) => ({
    question: q,
    answer: cbAns(i),
    followUps: [
      { question: 'What breaks in **CI** if you ignore this behavior?', answer: fuProd().answer },
      { question: 'What **contract** trap does this expose?', answer: fuTrap().answer }
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
  '\n\nDeeper runbook: stash **target/pacts** ***.json** next to **provider** **Surefire** **XML** because release auditors compare machine-readable artifacts. When **parallel** **Surefire** is on, reproduce once with **-Djunit.jupiter.execution.parallel.enabled=false** to prove **@State** methods reordered, then fix **provider** setup instead of leaving the flag forever. If **heap** climbs only during **pactVerify**, compare **jcmd** **GC.class_histogram** before and after replay to spot duplicate **String** retention from logging bodies. Record **pact-jvm** and **spring-boot** **BOM** versions in the incident timeline so the next **Java** **21** bump does not reopen the same ticket.';

const SENIOR_BLOCK = (a, b, c, d) =>
  `**Immediate response:** ${a}\n\n**Root cause:** ${b}\n\n**Fix:** ${c}\n\n**Prevention:** ${d}\n\nStaff note: capture **mvn** **-e** **-X** **-Dtest=*PactVerify** **test** output, **curl** **-v** against the **provider** **base** **URL** from the same image, and **jcmd** **<pid>** **Thread.print** from the stuck worker; attach **pact** **JSON** to the ticket. Compare **heap** before and after replay with **jcmd** **GC.heap_info** when **SocketTimeoutException** clusters during verify. Document **broker** **TLS** versions and **JDK** trust stores on agents because they decide whether uploads succeed.${SENIOR_TAIL}`;

function buildSenior() {
  return [
    senior(
      '**Provider** **pactVerify** fails on **CI** with **Connection** **refused** to **localhost** while laptops pass.',
      SENIOR_BLOCK(
        'Print **PACT_PROVIDER_BASE_URL** in the workflow, then **curl** **-v** that exact value from a debug step on the runner.',
        '**Consumer** **pact** captured **localhost** interactions; **CI** tries to hit the test writer laptop, not the **provider** container.',
        'Parameterize **provider** host with **service** **DNS** inside **docker** **compose** or **Kubernetes** **ClusterIP**; rerun **mvn** **-e** **-Dtest=*PactVerify** **test**.',
        'Add a lint that rejects **pact** files containing **127.0.0.1** unless documented for local-only profiles.'
      )
    ),
    senior(
      '**Staging** shows **HttpMessageNotReadableException** after **provider** ships, yet **consumer** **JUnit** stayed green.',
      SENIOR_BLOCK(
        'Pull the latest **pact** from **broker** for that **consumer** version and diff **JSON** against a **staging** **curl** capture.',
        '**Mockito** stubs returned **Java** objects without exercising **ObjectMapper** rules for unknown enums or strict **JSON** shapes.',
        'Add **consumer** tests that parse bytes through the real **HTTP** client stack; publish updated **pact**; verify with **mvn** **-Dtest=*ClientContract** **test**.',
        'Ban **Mockito**-only tests for cross-service **DTO** mapping without at least one contract-level check in review.'
      )
    ),
    senior(
      '**Broker** matrix is red because **verification** **result** never uploaded after a green **CI** job.',
      SENIOR_BLOCK(
        'Open **GitHub** **Actions** log for **pactVerify** and search for **publish** step exit code, then **curl** **broker** **HAL** API for that **git** **sha**.',
        'The **Gradle** task succeeded but **pactPublish** was skipped on forked workers or missing credentials.',
        'Wire **PACT_BROKER_TOKEN** as a secret, make publish a hard dependency of the deploy job, rerun **gradle** **pactPublish** with **--info**.',
        'Add a policy check that fails the pipeline when **broker** shows no verification for the built artifact tag.'
      )
    ),
    senior(
      '**can-i-deploy** passes locally but **staging** still receives a **consumer** artifact incompatible with **provider** **main**.',
      SENIOR_BLOCK(
        'Run the exact **can-i-deploy** command with **--retry** **0** in **CI** logs and capture **consumer**/**provider** version selectors.',
        'Someone pinned an old **consumer** **tag** while **provider** verified only the newest **main** **SHA**, leaving a hole in the matrix.',
        'Align **broker** selectors to **git** **SHA** for both sides; block **hotfix** tags that skip verify stages.',
        'Document version matrix rules in **README** and enforce them with **Terraform** for **broker** webhooks.'
      )
    ),
    senior(
      '**Pact** **verify** **job** **timeouts** after you added two hundred interactions from a noisy **consumer** test.',
      SENIOR_BLOCK(
        'Run **jcmd** **<pid>** **GC.heap_info** mid-job on a repro agent and note **Old** **Gen** usage trend.',
        'Duplicate **GET** **/health** interactions replay full **Spring** context work per interaction.',
        'Dedupe interactions in **consumer** **DSL**, split **provider** verify modules, raise **-Xmx** with evidence.',
        'Add **ArchUnit**-style review item: no unconditional health checks inside **pact** builders.'
      )
    ),
    senior(
      '**SSLHandshakeException** talking to **broker** only on **Java** **11** **CI** images.',
      SENIOR_BLOCK(
        'Run **java** **-version** on failing and passing agents side by side, then **curl** **-v** **https://broker** from each.',
        '**Broker** upgraded **TLS** ciphers; **Java** **11** image lacked default trust for the new chain.',
        'Move verify jobs to **Java** **17** **LTS** image or import **corp** **CA** into truststore with **keytool**; rerun pipeline.',
        'Pin **JDK** image digests per environment and test **broker** connectivity in a five-second **smoke** step.'
      )
    )
  ];
}

const WRONG = [
  'If **Mockito** tests pass, the **HTTP** **JSON** contract with other services is guaranteed safe.',
  '**Pact** files are only documentation, so you can delete them after the **provider** ships.',
  '**WireMock** in one repository is always enough governance for fifty **microservices**.',
  '**can-i-deploy** is optional because **staging** **e2e** tests always catch **API** drift first.',
  '**Provider** **verification** should mock the **controller** layer to keep tests fast.',
  '**Consumer** teams should never publish **pacts** until **provider** code is finished.',
  '**Broker** **TLS** errors mean the **Pact** **DSL** is wrong, not the **JDK** trust store.',
  '**JUnit** **5** parallel mode never affects **provider** **@State** setup order.'
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
    'Who usually writes the first **consumer**-driven expectation?',
    { A: 'Only the **DBA** team', B: 'The **consumer** team that depends on the **API**', C: 'Only **QA** manual testers', D: 'The **load** **balancer** vendor' },
    'B',
    'Consumer-driven means the caller encodes what it needs before **provider** guesses.'
  );
  B(
    'theory',
    'What is a **Pact** file primarily?',
    { A: 'A **Docker** image tag', B: '**JSON** describing **HTTP** or message interactions', C: 'A **Kubernetes** manifest', D: 'A **Gradle** daemon flag' },
    'B',
    '**Pact** stores examples both sides replay in **CI**.'
  );
  B(
    'theory',
    'What does a **broker** store?',
    { A: 'Only **Git** objects', B: '**Pact** versions and **verification** results', C: 'Only **Docker** layers', D: '**IDE** settings' },
    'B',
    'Brokers power matrices and **can-i-deploy** style gates.'
  );
  B(
    'theory',
    'What is **provider** **verification**?',
    { A: 'Deleting **unit** tests', B: 'Replaying **consumer** examples against the real **provider** stack', C: 'Running **SQL** **EXPLAIN** only', D: 'Disabling **CI**' },
    'B',
    'Verification proves the **provider** satisfies published expectations.'
  );
  B(
    'code',
    'What prints?\n```java\nclass X {\n  public static void main(String[] a) {\n    String u = "https://broker/pacts";\n    System.out.println(u.contains("broker") ? "remote" : "local");\n  }\n}\n```',
    { A: 'local', B: 'remote', C: 'throws', D: 'null' },
    'B',
    '**contains("broker")** is true so **println** prints **remote**.'
  );
  B(
    'code',
    'Smell?\n```java\nwhen(client.fetch(1)).thenReturn(new Order(1, 99));\n```',
    { A: 'Perfect contract coverage', B: '**Mockito** bypasses real **HTTP** **JSON** parsing', C: 'Required by **Pact**', D: 'Forces **broker** upload' },
    'B',
    'You still need **Pact**/**WireMock** to exercise bytes.'
  );
  B(
    'code',
    'Status check?\n```java\nint s = 404;\nSystem.out.println(s == 200 ? "ok" : "miss");\n```',
    { A: 'ok', B: 'miss', C: 'throws', D: 'loop' },
    'B',
    'Ternary chooses **miss** when status is not **200**.'
  );
  B(
    'real-world',
    'Your teammate says **Swagger** alone prevents **JSON** drift. Best response?',
    { A: 'Docs do not execute; contracts should be machine-verified', B: '**Swagger** deletes the need for tests', C: '**JSON** never changes in prod', D: '**Brokers** are illegal' },
    'A',
    'Human docs help; **Pact**/**SCC** enforces examples in **CI**.'
  );
  I(
    'theory',
    'Which failure often means **JSON** path mismatch in **Pact**?',
    { A: '**ClassCastException** on **int**', B: '**AssertionError** mentioning **$.** paths', C: '**ZipException** always', D: '**OutOfMemoryError** on **boolean**' },
    'B',
    '**Pact** asserts body fragments using **JSON** paths.'
  );
  I(
    'theory',
    'Why is **Spring** **Cloud** **Contract** attractive to **Spring** shops?',
    { A: 'It removes **JUnit**', B: 'Contracts live in **Git** and generate stubs/tests via plugins', C: 'It bans **Maven**', D: 'It replaces **TCP**' },
    'B',
    '**SCC** keeps workflows inside familiar **Gradle**/**Maven** flows.'
  );
  I(
    'theory',
    'What is **can-i-deploy** trying to answer?',
    { A: 'Which coffee to buy', B: 'Whether a **consumer**/**provider** pairing is verified for promotion', C: 'Whether **Git** is installed', D: 'Whether **IDE** theme is dark' },
    'B',
    'It gates environments using **broker** data.'
  );
  I(
    'theory',
    'What does a **Pact** **state** map to on the **provider** side?',
    { A: 'A **Docker** volume driver', B: 'Setup steps like seeded data before an interaction', C: 'A **Kubernetes** **Ingress** class', D: 'A **CSS** theme' },
    'B',
    'States align preconditions between **consumer** examples and **provider** data.'
  );
  I(
    'code',
    'Bug?\n```java\nString base = "http://127.0.0.1:1234";\n// used as provider base in CI verify\n```',
    { A: 'Always correct', B: '**localhost** in **CI** rarely points at the real **provider** pod', C: 'Required by **Kafka**', D: 'Fixes **TLS**' },
    'B',
    'Parameterize **provider** hosts per environment.'
  );
  I(
    'code',
    'Parallel smell?\n```java\nstatic int uploads;\nvoid publish() { uploads++; }\n```',
    { A: 'Safe by definition', B: 'Shared **static** counters race under parallel **CI** forks', C: 'Mandated by **Pact**', D: 'Replaces **broker**' },
    'B',
    'Use **broker** versioning instead of naive counters.'
  );
  I(
    'code',
    'Missing piece?\n```java\n// @PactTestFor(providerName = "???")\n```',
    { A: 'Provider name must match **broker** metadata', B: 'Annotation is optional always', C: 'Use **@Entity** instead', D: 'Delete **JUnit**' },
    'A',
    'Wrong **providerName** yields empty interactions.'
  );
  I(
    'code',
    'Tooling?\n```java\n// mvn -Dtest=*PactVerify test\n```',
    { A: 'Runs **provider** verification in **Maven**', B: 'Formats **USB** drives', C: 'Compiles **C++** only', D: 'Disables **TLS**' },
    'A',
    '**Maven** **Surefire** pattern targets verify tests.'
  );
  I(
    'code',
    'Broker env?\n```java\nSystem.getenv("PACT_BROKER_TOKEN") == null\n```',
    { A: 'Means publish will always succeed', B: 'Likely blocks authenticated upload to **broker**', C: 'Proves **JDK** **8**', D: 'Starts **Kafka**' },
    'B',
    'Secrets must exist in **CI** for uploads.'
  );
  I(
    'theory',
    'Why dedupe **Pact** interactions?',
    { A: 'Duplicates speed **CI** linearly', B: 'Repeating identical calls bloats verify time and **heap**', C: '**Broker** forbids unique calls', D: '**JUnit** requires duplicates' },
    'B',
    'Huge interaction lists stress **provider** tests.'
  );
  I(
    'theory',
    'What should you check when **SSLHandshakeException** hits the **broker** only in **CI**?',
    { A: 'Rewrite all **Java** syntax', B: '**JDK** trust store and **TLS** cipher alignment', C: 'Delete **pacts**', D: 'Disable **HTTP**' },
    'B',
    'Cipher mismatches are common across **Java** **11** vs **17** images.'
  );
  I(
    'theory',
    'Why pair **curl** with **pactVerify** logs?',
    { A: '**curl** deletes tests', B: 'Prove **network** path and **TLS** outside the **JVM**', C: '**curl** compiles **bytecode**', D: 'Required by **checkstyle** only' },
    'B',
    'Separates infra from **application** bugs.'
  );
  A(
    'theory',
    'Your org has polyglot services. Which default is most reasonable?',
    { A: 'Only **Spring** **Cloud** **Contract** with no **broker**', B: '**Pact** **broker** as neutral contract hub', C: 'Email **JSON** files', D: 'Avoid all tests' },
    'B',
    '**Pact** ecosystem spans languages; **broker** centralizes history.'
  );
  A(
    'theory',
    'Hotfix pipeline skips **pactPublish**. Biggest risk?',
    { A: 'Faster merges with zero downside', B: '**Staging** promotes artifacts with stale **broker** matrix', C: '**JUnit** stops working', D: '**Docker** vanishes' },
    'B',
    'Gates become meaningless without up-to-date verification.'
  );
  A(
    'code',
    'Green **Mockito** **consumer** tests but **staging** **HttpMessageNotReadableException**. Next step?',
    { A: 'Blame **Kubernetes**', B: 'Add **consumer** contract coverage that parses real **JSON** bytes', C: 'Delete **logs**', D: 'Downgrade to **Java** **8** only' },
    'B',
    'Force deserialization paths to run in **test**.'
  );
  A(
    'code',
    '**Provider** verify **timeouts** after adding hundreds of **/health** interactions. Best fix?',
    { A: 'Ignore timeouts', B: 'Remove duplicate health checks from **pact** builders', C: 'Disable **TLS** globally', D: 'Remove **broker** entirely' },
    'B',
    'Trim interactions to meaningful **API** surface area.'
  );
  A(
    'on-call',
    'After deploy, **consumer** sees **404** on renamed path. **Broker** was green. Most likely gap?',
    { A: '**Moon** phase', B: '**Provider** verified a different **branch** than what shipped', C: '**JSON** never used in prod', D: '**Git** deleted' },
    'B',
    'Align **verification** **git** **SHA** with container image labels.'
  );
  A(
    'on-call',
    '**can-i-deploy** red but teams swear tests passed. First check?',
    { A: 'Reboot laptop', B: 'Confirm **verification** **result** uploaded for the exact artifact **SHA**', C: 'Delete **database**', D: 'Change **DNS** randomly' },
    'B',
    'Green local without publish leaves **broker** red.'
  );
  A(
    'on-call',
    '**pactVerify** workers **OOM** mid-run. First data point?',
    { A: '**jcmd** **<pid>** **GC.heap_info** on worker', B: 'Buy new keyboards', C: 'Disable **unit** tests globally', D: 'Remove **JSON**' },
    'A',
    'Quantify **heap** before guessing **network**.'
  );
  A(
    'on-call',
    'Flaky **provider** **@State** setup under **JUnit** **parallel**. First isolation step?',
    { A: 'Run with parallelism disabled once to confirm ordering hypothesis', B: 'Always ignore failures', C: 'Delete **provider**', D: 'Turn off **CI**' },
    'A',
    'Prove ordering before redesigning states.'
  );
  A(
    'on-call',
    '**Broker** reachable via **curl** but **Java** upload fails **SSLHandshakeException**. Most plausible fix?',
    { A: 'Update **JDK** image or import **corp** **CA** with **keytool**', B: 'Remove **HTTPS**', C: 'Use **HTTP** **1.0** only', D: 'Delete **consumer**' },
    'A',
    'Trust store drift is common across **CI** images.'
  );
  A(
    'on-call',
    '**Consumer** publishes **pact** from laptop with **localhost** URLs. **CI** **provider** verify fails **Connection** **refused**. Best fix?',
    { A: 'Parameterize **provider** **base** **URL** per environment and regenerate interactions', B: 'Always ignore verify', C: 'Delete **broker**', D: 'Ship without tests' },
    'A',
    'Never bake laptop-only hosts into shared **pact** files.'
  );

  return q;
}

const CHEATSHEET = `| Level | Concept | The rule in one line | Example or Command |
|-------|---------|----------------------|--------------------|
| Fresher | **Consumer** | Team that calls the **API** | publishes **pact** expectations |
| Fresher | **Provider** | Team that answers the **HTTP** call | runs **pactVerify** |
| Fresher | **Pact** file | Executable examples in **JSON** | **target/pacts/*.json** |
| Senior Dev | **Mockito** vs contract | Mocks skip real **JSON** bytes | add **WireMock** or **Pact** |
| Senior Dev | **Broker** | Stores matrix + verification | **curl** **$BROKER/hal** |
| Senior Dev | **Provider** **verify** | Replays **consumer** examples | **mvn** **-Dtest=*PactVerify** **test** |
| Senior Dev | **Pact** **state** | Maps to setup data | **@State** handler in **provider** test |
| Tech Lead | **can-i-deploy** | Gate using **broker** data | broker CLI in **CI** |
| Tech Lead | **SCC** | **Git**-native **Spring** contracts | **gradle** **generateContractTests** |
| Tech Lead | **Review** rule | No cross-service change without artifact | block **PR** without **pact** |
| Staff | **jcmd** | Stuck verify worker threads | **jcmd** **<pid>** **Thread.print** |
| Staff | **Heap** during replay | Too many interactions hurt **GC** | **jcmd** **GC.heap_info** |
| Staff | **TLS** to **broker** | **JDK** trust store drift | **java** **-version** vs **curl** **-v** |`;

export function buildDay87Sections() {
  const basic = buildBasicCode();
  const mid = buildMidCode();
  const adv = buildAdvCode();
  return [
    { type: 'why', title: 'Why Contract Testing and Advanced Testing matters', content: buildWhy() },
    { type: 'theory', title: 'Theory and Internals — Contract Testing and Advanced Testing', content: buildTheoryContent() },
    {
      type: 'code',
      title: 'Basic — Contract testing reference card',
      language: 'java',
      filename: 'Day87Basic.java',
      level: 'basic',
      description: 'Print-only vocabulary for week-one learners.',
      code: basic.code,
      output: basic.output
    },
    {
      type: 'code',
      title: 'Intermediate — Four contract-testing incidents',
      language: 'java',
      filename: 'Day87Intermediate.java',
      level: 'intermediate',
      description: 'Senior narration with diagnostic commands.',
      code: mid.code,
      output: mid.output
    },
    {
      type: 'code',
      title: 'Advanced — Broker + pact verify triage matrix',
      language: 'java',
      filename: 'Day87Advanced.java',
      level: 'advanced',
      description: 'Tech lead printable checklist.',
      code: adv.code,
      output: adv.output
    },
    {
      type: 'diagram',
      title: 'Consumer–provider contract flow',
      diagramType: 'component',
      description: 'Consumer publishes pacts; provider verifies against broker matrix.',
      plantuml:
        '@startuml\ntitle Day 87 — Contract flow\nparticipant ConsumerCI\nparticipant Broker\nparticipant ProviderCI\nConsumerCI -> Broker : publish pact\nProviderCI -> Broker : fetch pacts\nProviderCI -> ProviderCI : pactVerify\nProviderCI -> Broker : upload verification\n@enduml'
    },
    { type: 'pitfalls', title: 'Common Pitfalls', items: PITFALLS },
    {
      type: 'exercise',
      title: 'Exercise — Contract vocabulary (fresher)',
      audience: 'fresher',
      difficulty: 'Beginner',
      problem:
        'You are writing your first **Java** drill class to memorize **contract** **testing** words.\n\n1. Create **arch.day87.Day87FresherExercise** with **main**.\n2. Print one line explaining what a **consumer** is.\n3. Print one line explaining what a **provider** is.\n4. Print one line explaining what a **Pact** file stores.',
      hints: [
        'Keep strings in **final** **String** constants.',
        'Use only **System.out.println**.',
        'You do not need **Pact** on the **classpath** if you only print teaching text.'
      ],
      solution: `package arch.day87;

/** Fresher drill: say contract words before you touch broker UIs. */
public class Day87FresherExercise {

    public static void main(String[] args) {
        // args unused so output is identical on every machine.
        final String consumerLine = "Consumer is the service that calls another API and owns the expectation.";
        // consumerLine anchors who writes the pact first in consumer-driven flows.
        System.out.println(consumerLine);
        final String providerLine = "Provider is the service that answers the HTTP call and must verify pacts.";
        // providerLine reminds you verification runs on the callee side in CI.
        System.out.println(providerLine);
        final String pactFileLine = "Pact file stores JSON examples of requests and responses for replay.";
        // pactFileLine connects artifacts under target/pacts to human language.
        System.out.println(pactFileLine);
        final String brokerLine = "Broker stores pact versions and verification results per git commit.";
        // brokerLine explains why URLs are not thrown away after mvn test.
        System.out.println(brokerLine);
        final String verifyLine = "Provider verification replays consumer examples against real controllers.";
        // verifyLine states the difference versus Mockito-only unit tests.
        System.out.println(verifyLine);
        final String wiremockLine = "WireMock helps local consumer tests but is not automatically cross-team.";
        // wiremockLine prevents confusing local stubs with published governance.
        System.out.println(wiremockLine);
        final String sccLine = "Spring Cloud Contract keeps contracts in Git and generates stubs via plugins.";
        // sccLine gives the Spring-native alternative name in interviews.
        System.out.println(sccLine);
        final String gateLine = "can-i-deploy asks the broker if a consumer-provider pairing is safe to ship.";
        // gateLine ties product release anxiety to a concrete command concept.
        System.out.println(gateLine);
        final String stateLine = "Pact states tag provider setup like seeded data before each interaction.";
        // stateLine warns that missing @State mappings look like flaky 500s.
        System.out.println(stateLine);
        final String jsonLine = "JSON path assertions fail when field names drift between services.";
        // jsonLine links HttpMessageNotReadableException stories to contracts.
        System.out.println(jsonLine);
        final String curlLine = "curl proves TLS and routing outside the JVM when verify logs look impossible.";
        // curlLine gives a habit Staff engineers expect juniors to learn early.
        System.out.println(curlLine);
        final String jcmdLine = "jcmd Thread.print shows stuck HTTP threads during long pact replays.";
        // jcmdLine is the JVM tool hook requested in advanced interviews.
        System.out.println(jcmdLine);
    }
}
`
    },
    {
      type: 'exercise',
      title: 'Exercise — Broker gate triage (staff)',
      audience: 'staff',
      difficulty: 'Advanced',
      problem:
        'Your **staging** deploy pipeline is green, but **SRE** reports **JSON** field mismatches between **checkout** and **pricing**. **Broker** matrix for the **pricing** **SHA** looks incomplete.\n\n1. Model three risk keys **r1**, **r2**, **r3** in a **LinkedHashMap** mapping to first diagnostic **String** commands.\n2. Print each key and command on its own line under a header.\n3. Print one line stating why **Mockito**-only **consumer** tests could hide the bug.\n4. Print one line recommending **jcmd** **<pid>** **GC.heap_info** if verify jobs time out.\n5. Print one **prevention** line requiring **can-i-deploy** (or equivalent) on every releasable branch.',
      hints: [
        'Use **LinkedHashMap** so print order matches your incident timeline.',
        'Commands are literals; you are not executing shell commands from Java.',
        'Map **r3** to **curl** **broker** **HAL** when uploads look missing.'
      ],
      solution: `package arch.day87;

import java.util.LinkedHashMap;
import java.util.Map;

/** Staff triage: broker matrix gaps without calling live network APIs. */
public class Day87StaffExercise {

    record Risk(String id, boolean verifyUploaded, boolean consumerMockOnly) {}

    public static void main(String[] args) {
        // LinkedHashMap keeps escalation narrative stable for auditors reading stdout.
        Map<String, String> firstCmd = new LinkedHashMap<>();
        firstCmd.put("r1", "mvn -e -Dtest=*PactVerify test on provider SHA that shipped");
        firstCmd.put("r2", "curl -v $BROKER/hal/path for verification documents");
        firstCmd.put("r3", "jcmd <pid> Thread.print on stuck verify worker");

        // Records model booleans parsed from CI YAML without external libraries.
        Risk a = new Risk("r1", false, true);
        Risk b = new Risk("r2", true, false);
        Risk c = new Risk("r3", true, true);

        // Header block orients readers skimming long CI logs.
        System.out.println("=== Modeled risks ===");
        System.out.println(a.id() + " verifyUploaded=" + a.verifyUploaded() + " mockOnly=" + a.consumerMockOnly());
        System.out.println(b.id() + " verifyUploaded=" + b.verifyUploaded() + " mockOnly=" + b.consumerMockOnly());
        System.out.println(c.id() + " verifyUploaded=" + c.verifyUploaded() + " mockOnly=" + c.consumerMockOnly());

        // Iterate map entries for deterministic command list.
        System.out.println("=== First command per risk key ===");
        for (Map.Entry<String, String> e : firstCmd.entrySet()) {
            System.out.println(e.getKey() + " -> " + e.getValue());
        }

        // Mockito note explains why green unit tests lied in the incident story.
        System.out.println("=== Mockito warning ===");
        System.out.println("Mockito stubs skip real JSON bytes so ObjectMapper never fails in tests.");

        // Heap note connects timeouts to JVM resources, not mystic network ghosts.
        System.out.println("=== JVM heap follow-up ===");
        System.out.println("If verify times out: jcmd <pid> GC.heap_info to catch GC thrash.");

        // Prevention ties process to release governance requested by leadership.
        System.out.println("=== Prevention ===");
        System.out.println("Block promote if broker lacks verification for exact consumer-provider SHA pair.");

        // curl reminder splits infra TLS trust from application stack traces.
        System.out.println("=== Network proof ===");
        System.out.println("curl broker from the same CI image to isolate trust store issues.");

        // Consumer publish discipline stops localhost pacts leaking into shared CI.
        System.out.println("=== Publish hygiene ===");
        System.out.println("Reject pact files containing 127.0.0.1 unless profile-local is explicit.");

        // State mapping note addresses flaky provider tests under parallel Surefire.
        System.out.println("=== State hygiene ===");
        System.out.println("Document @State handlers; parallel JUnit can reorder provider setup.");

        // Version alignment note closes common Java 11 vs 17 TLS broker failures.
        System.out.println("=== JDK alignment ===");
        System.out.println("Align verify JDK with broker TLS requirements; log java -version in workflow.");

        // Audit path note tells postmortem readers which artifacts to attach.
        System.out.println("=== Audit bundle ===");
        System.out.println("Attach pact JSON, verify XML, broker matrix screenshot, and git SHAs.");

        // Ownership clarifies who fixes broker tokens versus who fixes DTO names.
        System.out.println("=== Ownership split ===");
        System.out.println("Platform owns broker auth; product teams own pact content and verify jobs.");
    }
}
`
    },
    {
      type: 'interview',
      title: 'Interview Drill — Contract Testing and Advanced Testing',
      conceptual: buildConceptual(),
      codeBased: buildCodeBased(),
      seniorScenario: buildSenior(),
      wrongAnswers: WRONG,
      jobSwitch: {
        resumeBullet: 'Implemented Pact broker gates across seven services and cut integration defects ninety percent.',
        interviewPositioning:
          'When I join a team I read the **broker** matrix and **CI** verify stages before I trust green **JUnit** bars. In week one I add a failing-fast check that **localhost** never appears in published **pacts**, and I document whether **Spring** **Cloud** **Contract** or **Pact** owns each boundary.',
        starAnchor:
          'Situation: our **checkout** service started throwing **HttpMessageNotReadableException** against **pricing** after a field rename. Task: stop silent **API** drift without a week-long **e2e** suite. Action: I wired **consumer** **pact** publish on merge, added **provider** **pactVerify** on image build, and enforced **can-i-deploy** before **staging**. Result: **zero** handshake incidents for nine months and **p99** **CI** contract stage stayed under six minutes.'
      }
    },
    {
      type: 'mcq',
      title: 'MCQ — Contract Testing and Advanced Testing',
      description: 'Thirty questions across basic, intermediate, and advanced levels.',
      questions: buildMcq()
    },
    { type: 'cheatsheet', title: 'Cheatsheet — Contract Testing and Advanced Testing', content: CHEATSHEET }
  ];
}

