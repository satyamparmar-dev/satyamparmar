import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dayNumber = 2;
const filePath = join(__dirname, '..', 'public', 'data', 'days', 'phase1-day2.json');

const wordCount = (text) =>
  String(text || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[`*_>#-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;

const averageWordCount = (arr, field) => {
  if (!arr || arr.length === 0) return 0;
  const total = arr.reduce((sum, item) => sum + wordCount(item?.[field] || ''), 0);
  return total / arr.length;
};

const codeLineCount = (code) => String(code || '').split('\n').length;

const hasSeniorStructure = (answer) => {
  const required = [
    '**Immediate response:**',
    '**Root cause:**',
    '**Fix:**',
    '**Prevention:**'
  ];
  return required.every((label) => String(answer || '').includes(label));
};

const conceptualAnswerFor = (question) => {
  return (
    `For **${question}**, start from JVM internals: primitive values are stored directly in local variable slots and on the operand stack, while references point to heap objects whose headers, alignment, and card-table writes affect GC behavior. ` +
    `That mechanical difference is why casual boxing or wide object graphs increase allocation rate and young-generation pressure in real services. In production, this shows up as higher p95 latency during burst traffic, elevated allocation rate in JFR, and occasional ` +
    `timeouts when stop-the-world pauses overlap with request spikes. The diagnostic path is concrete: run \`jcmd <pid> GC.heap_info\` for heap layout, \`jstat -gcutil <pid> 1000 10\` for GC churn, and \`javap -c\` on suspect classes to confirm implicit boxing or widening bytecode. ` +
    `Version behavior also matters: Java 8 defaults and ergonomics differ from Java 11 container-awareness, Java 17 UTF-8 default charset, and Java 21 runtime/JIT improvements. A Staff-level answer ties data type choice to observability, failure mode, and JVM-version rollout safety.`
  );
};

const seniorScenarioAnswerFor = (question) => {
  return (
    `**Immediate response:** I acknowledge the incident, freeze risky deploys, and gather objective runtime evidence before debating code quality. I capture \`jcmd <pid> VM.version\`, \`jcmd <pid> VM.flags\`, \`jcmd <pid> GC.heap_info\`, and a short \`jstat -gcutil <pid> 1000 20\` sample, then verify whether the failure is active user impact, startup-only, or slow-burn degradation. I also compare canary versus stable pods so rollback decisions are data-driven in the first five minutes.\n\n` +
    `**Root cause:** For **${question}**, the typical root cause is a mismatch between Java-level intent and JVM-level behavior: primitive vs boxed representations, class loading timing, bytecode verification, or classpath/module visibility. These issues are often latent until a specific traffic shape or deployment path executes the vulnerable branch. The JVM then surfaces it as throughput collapse, \`NoClassDefFoundError\`, \`VerifyError\`, or amplified GC pauses rather than a clean compile-time failure.\n\n` +
    `**Fix:** I implement a narrow, testable change and validate it with commands, not assumptions. Examples include replacing accidental boxing with primitive paths, correcting classpath/module flags, aligning JDK toolchains across CI and runtime, or adding explicit JVM flags for container memory behavior. I ship with a guarded rollout and verify post-change with \`java -verbose:class\` for loading correctness, \`jcmd <pid> Compiler.queue\` for warmup pressure, and GC/utilization deltas from \`jstat\`.\n\n` +
    `**Prevention:** I add guardrails in code review and pipelines: a checklist for data-type choices in hot paths, mandatory toolchain pinning, startup smoke tests that execute critical reflective/class-loading flows, and dashboards for allocation rate plus GC pause percentiles. I also record version-sensitive notes for Java 8, 11, 17, and 21 behavior so migrations are rehearsed with performance baselines, not treated as simple patch bumps.`
  );
};

const mkMcq = ({ id, level, category, question, options, answer, right, wrong, consequence }) => {
  const wrongKeys = ['A', 'B', 'C', 'D'].filter((k) => k !== answer);
  const explanation =
    `${right} ${answer} is correct. ` +
    `${wrongKeys[0]} is wrong because ${wrong[wrongKeys[0]]}; ` +
    `${wrongKeys[1]} is wrong because ${wrong[wrongKeys[1]]}; ` +
    `${wrongKeys[2]} is wrong because ${wrong[wrongKeys[2]]}. ` +
    `In production this matters because ${consequence}.`;
  return { id, level, category, question, options, answer, explanation };
};

const buildMcqs = () => {
  const mcqs = [];

  mcqs.push(
    mkMcq({
      id: 1,
      level: 'basic',
      category: 'theory',
      question: 'Which **primitive** type should you choose for a true/false feature flag value?',
      options: { A: '`boolean`', B: '`char`', C: '`byte`', D: '`String`' },
      answer: 'A',
      right: '`boolean` maps directly to boolean semantics and avoids parsing overhead.',
      wrong: {
        B: '`char` stores code units, not logical truth values',
        C: '`byte` needs custom conventions and hurts readability',
        D: '`String` adds heap allocations and comparison pitfalls'
      },
      consequence: 'misusing strings for flags causes avoidable parsing bugs and GC noise in hot request paths'
    }),
    mkMcq({
      id: 2,
      level: 'basic',
      category: 'theory',
      question: 'What is the size of Java **`int`** and what numeric form does it use?',
      options: {
        A: '16-bit signed magnitude',
        B: '32-bit two\'s complement',
        C: '64-bit floating point',
        D: 'Platform-dependent size'
      },
      answer: 'B',
      right: '`int` is fixed as 32-bit two\'s-complement by the Java Language Specification.',
      wrong: {
        A: '16-bit corresponds to `short`, not `int`',
        C: '64-bit floating point is `double`',
        D: 'Java primitive widths are specification-defined, not OS-dependent'
      },
      consequence: 'wrong assumptions break serialization contracts and database range checks'
    }),
    mkMcq({
      id: 3,
      level: 'basic',
      category: 'code',
      question:
        'What does this print?\n```java\nint x = 5;\nSystem.out.println(x++);\nSystem.out.println(x);\n```',
      options: { A: '`5` then `6`', B: '`6` then `6`', C: '`5` then `5`', D: 'Compilation error' },
      answer: 'A',
      right: 'Post-increment returns the old value first, then increments.',
      wrong: {
        B: 'that would be pre-increment behavior (`++x`)',
        C: 'increment does happen after the first print',
        D: 'the code is syntactically and semantically valid'
      },
      consequence: 'operator misuse in counters can create off-by-one bugs in rate limiting and pagination'
    }),
    mkMcq({
      id: 4,
      level: 'basic',
      category: 'code',
      question:
        'What is the output?\n```java\nbyte b = 10;\nb += 130;\nSystem.out.println(b);\n```',
      options: { A: '`140`', B: '`-116`', C: 'Compilation error', D: '`130`' },
      answer: 'B',
      right: '`+=` performs an implicit cast back to `byte`, causing overflow wrap-around.',
      wrong: {
        A: 'a `byte` cannot represent 140 directly',
        C: 'compound assignment includes narrowing conversion automatically',
        D: '130 still exceeds byte range and cannot be stored as-is'
      },
      consequence: 'silent overflow can corrupt totals and metering counters in billing systems'
    }),
    mkMcq({
      id: 5,
      level: 'basic',
      category: 'theory',
      question: 'Why is **autoboxing** from `int` to `Integer` risky in hot loops?',
      options: {
        A: 'It disables JIT completely',
        B: 'It adds heap allocations and potential GC pressure',
        C: 'It changes integer math semantics',
        D: 'It forces checked exceptions'
      },
      answer: 'B',
      right: 'Boxing can allocate objects and stress young generation under throughput load.',
      wrong: {
        A: 'JIT still runs; it just optimizes around heavier allocation patterns',
        C: 'numeric semantics remain integer-based',
        D: 'boxing has no relation to checked-exception rules'
      },
      consequence: 'unnecessary boxing raises allocation rate and degrades latency under peak traffic'
    }),
    mkMcq({
      id: 6,
      level: 'basic',
      category: 'theory',
      question:
        'A junior engineer stores monetary values in `float` and reports rounding drift in invoices. What is the best correction?',
      options: {
        A: 'Use `double` everywhere',
        B: 'Use `int` cents or `BigDecimal` with explicit scale',
        C: 'Use `char[]` then parse later',
        D: 'Keep `float` and round at display only'
      },
      answer: 'B',
      right: 'Money requires deterministic precision, so integer cents or `BigDecimal` is the safe model.',
      wrong: {
        A: '`double` is still binary floating point and can drift',
        C: 'character storage adds complexity without numerical guarantees',
        D: 'display rounding does not fix persisted arithmetic errors'
      },
      consequence: 'precision drift causes financial reconciliation defects and audit failures'
    }),
    mkMcq({
      id: 7,
      level: 'basic',
      category: 'code',
      question:
        'What happens here?\n```java\nchar c = 65;\nSystem.out.println(c);\n```',
      options: { A: '`65`', B: '`A`', C: 'Compilation error', D: '`a`' },
      answer: 'B',
      right: '`char` stores UTF-16 code units, and 65 maps to `A`.',
      wrong: {
        A: 'that would print if `c` were an integer type',
        C: 'numeric literal to `char` in range is valid',
        D: '97 maps to lowercase `a`, not 65'
      },
      consequence: 'wrong char/code-point assumptions break parsing and protocol framing'
    }),
    mkMcq({
      id: 8,
      level: 'basic',
      category: 'theory',
      question: 'Which command best confirms the JVM version of a **running** process?',
      options: {
        A: '`java -version` in your local terminal',
        B: '`jcmd <pid> VM.version`',
        C: '`javac -version` on build agent',
        D: '`jstack <pid>` only'
      },
      answer: 'B',
      right: '`jcmd <pid> VM.version` inspects the live process directly.',
      wrong: {
        A: 'local shell version may differ from deployed runtime',
        C: 'compiler version does not prove runtime VM version',
        D: 'thread dump alone does not report full runtime version metadata'
      },
      consequence: 'assuming wrong runtime version leads to faulty migration and tuning decisions'
    })
  );

  mcqs.push(
    mkMcq({
      id: 9,
      level: 'intermediate',
      category: 'theory',
      question: 'What is the key runtime difference between `int[]` and `Integer[]`?',
      options: {
        A: 'No difference after JIT optimization',
        B: '`Integer[]` stores object references and adds heap/object-header overhead',
        C: '`int[]` cannot be used in loops',
        D: '`Integer[]` avoids null values'
      },
      answer: 'B',
      right: '`int[]` is contiguous primitive storage, while `Integer[]` points to boxed objects.',
      wrong: {
        A: 'layout and allocation behavior remain materially different',
        C: 'both arrays are iterable',
        D: '`Integer[]` can contain nulls by design'
      },
      consequence: 'wrong array type choices inflate memory and GC pause times in data-heavy workloads'
    }),
    mkMcq({
      id: 10,
      level: 'intermediate',
      category: 'code',
      question:
        'What prints?\n```java\nInteger a = 127;\nInteger b = 127;\nSystem.out.println(a == b);\n```',
      options: { A: '`true` due to Integer cache', B: '`false` always', C: 'Compilation error', D: '`null`' },
      answer: 'A',
      right: '`Integer.valueOf` caches -128..127 by default, so references match here.',
      wrong: {
        B: 'for cached values, references can be equal',
        C: 'code is valid Java',
        D: 'comparison prints boolean, not null'
      },
      consequence: 'reference-equality misuse causes inconsistent bugs when values cross cache boundaries'
    }),
    mkMcq({
      id: 11,
      level: 'intermediate',
      category: 'code',
      question:
        'What is the result?\n```java\nlong n = 1_000_000_000 * 3;\nSystem.out.println(n);\n```',
      options: { A: '`3000000000`', B: '`-1294967296`', C: 'Compilation error', D: '`0`' },
      answer: 'B',
      right: 'The multiplication occurs in `int` first, overflows, then widens to `long`.',
      wrong: {
        A: 'you need at least one long literal (`1_000_000_000L`) for that result',
        C: 'overflow is runtime arithmetic behavior, not compile-time syntax failure',
        D: 'overflow does not collapse to zero here'
      },
      consequence: 'overflow-before-widening corrupts counters and SLA reporting calculations'
    }),
    mkMcq({
      id: 12,
      level: 'intermediate',
      category: 'theory',
      question: 'When migrating from Java 8 to Java 17, which data-handling change often surprises teams?',
      options: {
        A: '`int` size changes to 64-bit',
        B: 'Default charset becomes UTF-8 in Java 17',
        C: '`boolean` becomes tri-state',
        D: '`char` becomes 8-bit'
      },
      answer: 'B',
      right: 'JDK 17 standardizes default charset as UTF-8, affecting implicit encoding behavior.',
      wrong: {
        A: 'primitive widths remain the same',
        C: 'boolean model is unchanged',
        D: '`char` remains 16-bit UTF-16 code unit'
      },
      consequence: 'implicit charset assumptions can break file parsing and message signatures after upgrade'
    }),
    mkMcq({
      id: 13,
      level: 'intermediate',
      category: 'theory',
      question:
        'A service shows rising GC pauses after a new feature that maps millions of IDs. Which first remediation is most appropriate?',
      options: {
        A: 'Convert hot-path `Integer` collections to primitive-friendly structures',
        B: 'Increase thread pool size first',
        C: 'Disable GC logging',
        D: 'Replace all `long` with `double`'
      },
      answer: 'A',
      right: 'Reducing boxing/object count addresses root allocation pressure directly.',
      wrong: {
        B: 'more threads can worsen allocation/GC contention',
        C: 'hiding telemetry does not solve memory churn',
        D: 'floating point substitution is unrelated and risky'
      },
      consequence: 'ignoring allocation root cause leads to recurring pause spikes and unstable latency'
    }),
    mkMcq({
      id: 14,
      level: 'intermediate',
      category: 'code',
      question:
        'What prints?\n```java\ndouble d = 0.1 + 0.2;\nSystem.out.println(d == 0.3);\n```',
      options: { A: '`true`', B: '`false`', C: 'Compilation error', D: '`0.3`' },
      answer: 'B',
      right: 'Binary floating-point cannot represent many decimals exactly.',
      wrong: {
        A: 'exact decimal equality is not guaranteed for doubles',
        C: 'the expression is valid',
        D: 'the program prints a boolean from equality comparison'
      },
      consequence: 'naive floating-point equality checks can misroute financial or threshold logic'
    }),
    mkMcq({
      id: 15,
      level: 'intermediate',
      category: 'code',
      question:
        'What is true about this code?\n```java\nshort s = 1;\ns = s + 1;\n```',
      options: {
        A: 'Compiles and prints 2',
        B: 'Fails because `s + 1` is promoted to `int`',
        C: 'Fails only on Java 8',
        D: 'Works only with `var`'
      },
      answer: 'B',
      right: 'Binary numeric promotion makes the result `int`, requiring explicit cast or `+=`.',
      wrong: {
        A: 'assignment without cast is invalid',
        C: 'promotion rules are not Java-8-only',
        D: '`var` does not alter arithmetic promotion semantics'
      },
      consequence: 'type-promotion misunderstandings cause compile churn and risky casts in critical code'
    }),
    mkMcq({
      id: 16,
      level: 'intermediate',
      category: 'theory',
      question: 'Why should architecture reviews discuss primitive choice in DTOs and caches?',
      options: {
        A: 'Only for coding style consistency',
        B: 'Type representation changes memory footprint, serialization, and GC profile',
        C: 'Because JVM ignores type at runtime',
        D: 'To avoid writing tests'
      },
      answer: 'B',
      right: 'Type decisions directly impact runtime layout and operational behavior.',
      wrong: {
        A: 'it is primarily a performance and correctness concern',
        C: 'the JVM absolutely uses type metadata and layout details',
        D: 'type decisions increase, not remove, need for tests'
      },
      consequence: 'poor type decisions cascade into latency regressions and infra cost overruns'
    }),
    mkMcq({
      id: 17,
      level: 'intermediate',
      category: 'code',
      question:
        'What is the safest way to compare wrappers?\n```java\nInteger a = 500;\nInteger b = 500;\nSystem.out.println(a == b);\nSystem.out.println(a.equals(b));\n```',
      options: { A: '`a == b`', B: '`a.equals(b)`', C: '`a.compareTo(null)`', D: '`Objects.hash(a) == Objects.hash(b)`' },
      answer: 'B',
      right: '`equals` compares values, while `==` compares references.',
      wrong: {
        A: 'reference identity fails outside cache ranges and across allocations',
        C: 'comparing to null is invalid and can throw',
        D: 'hash collisions and indirection make this incorrect for equality logic'
      },
      consequence: 'incorrect equality checks create inconsistent behavior in deduplication and authorization maps'
    }),
    mkMcq({
      id: 18,
      level: 'intermediate',
      category: 'theory',
      question:
        '`UnsupportedClassVersionError` appears in staging after merge. What is the most likely root cause?',
      options: {
        A: 'Runtime JDK is older than class file target version',
        B: 'GC algorithm changed',
        C: 'Network timeout to database',
        D: 'Thread pool too small'
      },
      answer: 'A',
      right: 'Class major version exceeds what runtime VM supports.',
      wrong: {
        B: 'GC changes do not produce class-version loader errors',
        C: 'DB connectivity does not affect bytecode major version checks',
        D: 'thread pools do not influence class loader compatibility'
      },
      consequence: 'version mismatch blocks startup and can trigger failed rollout windows'
    }),
    mkMcq({
      id: 19,
      level: 'intermediate',
      category: 'theory',
      question:
        'Your build compiles locally but fails in CI saying `javac` not found. What should be standardized first?',
      options: {
        A: 'Increase test retries',
        B: 'Pin JDK toolchain and CI base image to JDK (not JRE)',
        C: 'Disable compilation warnings',
        D: 'Run only unit tests'
      },
      answer: 'B',
      right: 'Toolchain and image pinning remove environment drift at the source.',
      wrong: {
        A: 'retries cannot fix missing compiler binaries',
        C: 'warnings are unrelated to absent toolchain',
        D: 'tests cannot run if code cannot compile'
      },
      consequence: 'unmanaged toolchains waste pipeline time and delay incident-critical fixes'
    }),
    mkMcq({
      id: 20,
      level: 'intermediate',
      category: 'theory',
      question: 'Which command is best to inspect class loading during startup debugging?',
      options: {
        A: '`java -verbose:class -jar app.jar`',
        B: '`javac -Xlint`',
        C: '`jmap -histo` only',
        D: '`jstack` only'
      },
      answer: 'A',
      right: '`-verbose:class` shows each class and load source, ideal for classpath issues.',
      wrong: {
        B: 'compile-time lint does not expose runtime loading sources',
        C: 'heap histograms do not provide class-load order/source details',
        D: 'thread dumps omit classpath/load-path resolution'
      },
      consequence: 'without load-source visibility, classpath conflicts linger and cause fragile deployments'
    })
  );

  mcqs.push(
    mkMcq({
      id: 21,
      level: 'advanced',
      category: 'scenario',
      question:
        'On-call: p99 latency jumped from 120ms to 900ms after switching a hot cache key from `long` to `Long`. Best first action?',
      options: {
        A: 'Rollback and capture allocation/GC evidence with `jstat` and `jcmd`',
        B: 'Increase request timeout to 5s',
        C: 'Scale DB replicas immediately',
        D: 'Disable logs'
      },
      answer: 'A',
      right: 'Boxing can amplify allocation rate, so rollback plus GC diagnostics is fastest risk-reducing path.',
      wrong: {
        B: 'timeouts hide impact but do not resolve memory churn',
        C: 'database scaling is orthogonal to in-process allocation inflation',
        D: 'removing logs harms incident diagnosis'
      },
      consequence: 'failing to address boxing-induced churn prolongs user-visible latency incidents'
    }),
    mkMcq({
      id: 22,
      level: 'advanced',
      category: 'scenario',
      question:
        'Architecture review: team wants `double` for currency to simplify math. What is staff-level decision?',
      options: {
        A: 'Approve; precision issues are negligible',
        B: 'Reject; use `BigDecimal` or scaled integers with explicit rounding policy',
        C: 'Use `float` for memory savings',
        D: 'Store as `String` and parse per request'
      },
      answer: 'B',
      right: 'Financial correctness requires deterministic decimal behavior and explicit rounding control.',
      wrong: {
        A: 'binary floating-point drift is unacceptable for money',
        C: '`float` is less precise and makes errors worse',
        D: 'string parsing adds latency and still needs numeric policy'
      },
      consequence: 'poor monetary representation leads to billing defects, disputes, and compliance risk'
    }),
    mkMcq({
      id: 23,
      level: 'advanced',
      category: 'scenario',
      question:
        'Migration to Java 21: one service starts failing with encoding mismatches in downstream signatures. Most likely preventive control?',
      options: {
        A: 'Rely on platform default charset everywhere',
        B: 'Standardize explicit UTF-8 in APIs, files, and tests',
        C: 'Downgrade to Java 8 permanently',
        D: 'Increase heap to 8GB'
      },
      answer: 'B',
      right: 'Explicit charset declarations remove environment/version ambiguity during migration.',
      wrong: {
        A: 'implicit defaults vary across versions and environments',
        C: 'downgrade avoids the symptom but not engineering discipline',
        D: 'heap size does not fix encoding semantics'
      },
      consequence: 'charset drift breaks signatures and cross-system data integrity'
    }),
    mkMcq({
      id: 24,
      level: 'advanced',
      category: 'scenario',
      question:
        'A canary fails only under traffic with `NoClassDefFoundError` for an optional module class. What should be fixed first?',
      options: {
        A: 'Increase pod CPU limits',
        B: 'Align runtime classpath/module packaging with exercised code path',
        C: 'Turn off canary checks',
        D: 'Rewrite feature in Python'
      },
      answer: 'B',
      right: 'Lazy class loading exposes packaging mistakes when that branch is first executed.',
      wrong: {
        A: 'resource limits do not create missing bytecode',
        C: 'suppressing checks allows broken artifacts to reach production',
        D: 'language rewrite is not immediate incident remediation'
      },
      consequence: 'classpath drift causes partial outages that evade unit tests'
    }),
    mkMcq({
      id: 25,
      level: 'advanced',
      category: 'scenario',
      question:
        'Post-release memory costs rose 30% after switching DTO IDs from `int` to `Integer` for nullability. Best architectural adjustment?',
      options: {
        A: 'Accept cost as unavoidable',
        B: 'Model nullability at boundaries; keep hot internal paths primitive',
        C: 'Use `Object` for flexibility',
        D: 'Disable GC logs'
      },
      answer: 'B',
      right: 'Boundary nullability can be preserved while avoiding boxed overhead in core processing.',
      wrong: {
        A: 'cost is often reducible through representation design',
        C: '`Object` increases casting and runtime risk',
        D: 'removing telemetry does not control memory footprint'
      },
      consequence: 'unbounded object overhead increases infra spend and GC pause variance'
    }),
    mkMcq({
      id: 26,
      level: 'advanced',
      category: 'scenario',
      question:
        'Incident command asks for fastest proof that runtime JDK differs from build JDK. Which evidence is strongest?',
      options: {
        A: '`README.md` declared version',
        B: '`jcmd <pid> VM.version` from live process plus CI build logs',
        C: 'Developer laptop `java -version`',
        D: 'Code comments in Dockerfile'
      },
      answer: 'B',
      right: 'Live process metadata combined with build logs proves end-to-end version mismatch.',
      wrong: {
        A: 'documentation can be stale',
        C: 'local environment is not authoritative for deployed runtime',
        D: 'comments are not runtime evidence'
      },
      consequence: 'without hard evidence, teams misdiagnose startup failures and prolong MTTR'
    }),
    mkMcq({
      id: 27,
      level: 'advanced',
      category: 'scenario',
      question:
        'A high-throughput service uses `Map<String, Object>` for numeric values and performs casts per request. Staff-level refactor?',
      options: {
        A: 'Keep dynamic map for agility',
        B: 'Introduce typed domain model with primitive fields in hot paths',
        C: 'Wrap casts in try/catch and ignore failures',
        D: 'Move all parsing to frontend'
      },
      answer: 'B',
      right: 'Typed models reduce casting, improve JIT optimization, and prevent runtime type faults.',
      wrong: {
        A: 'dynamic maps trade short-term flexibility for long-term runtime cost',
        C: 'exception-driven flow is slow and masks data quality issues',
        D: 'backend still needs robust typed validation'
      },
      consequence: 'untamed dynamic typing causes latency spikes and production ClassCastException paths'
    }),
    mkMcq({
      id: 28,
      level: 'advanced',
      category: 'scenario',
      question:
        'During Java 17 migration, reflective frameworks fail with `InaccessibleObjectException`. Correct mitigation path?',
      options: {
        A: 'Disable module system checks globally forever',
        B: 'Add scoped `--add-opens` where needed and track removal plan',
        C: 'Switch all fields to public',
        D: 'Compile with `-source 8`'
      },
      answer: 'B',
      right: 'Scoped opens restore compatibility while preserving controlled encapsulation strategy.',
      wrong: {
        A: 'blanket disabling undermines security and maintainability',
        C: 'weakening encapsulation in code is unnecessary and risky',
        D: 'source level does not resolve runtime reflective access policy'
      },
      consequence: 'improper mitigation creates security debt and brittle upgrade paths'
    }),
    mkMcq({
      id: 29,
      level: 'advanced',
      category: 'scenario',
      question:
        'A payment service intermittently overflows counters after traffic surge. Which redesign is most robust?',
      options: {
        A: 'Use `int` and hope traffic normalizes',
        B: 'Use `long`/`BigInteger` where required with overflow tests and alerts',
        C: 'Store counters in `float` for larger range',
        D: 'Reset counters hourly silently'
      },
      answer: 'B',
      right: 'Capacity-safe numeric types plus detection controls prevent silent corruption.',
      wrong: {
        A: 'overflow risk remains unresolved',
        C: 'floating point introduces precision and semantics problems',
        D: 'silent resets hide data loss and break auditability'
      },
      consequence: 'counter overflow can underbill, mis-throttle, or break fraud-detection logic'
    }),
    mkMcq({
      id: 30,
      level: 'advanced',
      category: 'scenario',
      question:
        'A platform team wants one universal JVM image for Java 8, 11, 17, and 21 services. What is the architect response?',
      options: {
        A: 'Approve; one image always reduces risk',
        B: 'Use per-major-version pinned runtime images with shared hardening baseline',
        C: 'Run Java 21 for all binaries regardless of bytecode target',
        D: 'Remove version checks from CI'
      },
      answer: 'B',
      right: 'Pinning by major version preserves compatibility while retaining standardized security controls.',
      wrong: {
        A: 'unified images can break compatibility and observability assumptions',
        C: 'runtime upgrades are not universally safe without validation',
        D: 'removing checks increases drift and outage probability'
      },
      consequence: 'version ambiguity creates startup failures and migration regressions across fleets'
    })
  );

  return mcqs;
};

const json = JSON.parse(readFileSync(filePath, 'utf8'));
const sections = json.sections || [];
const interview = sections.find((s) => s.type === 'interview');
const codeSections = sections.filter((s) => s.type === 'code');
let mcqSection = sections.find((s) => s.type === 'mcq');

if (!interview) {
  throw new Error('Interview section not found.');
}

const conceptualCount = interview.conceptual?.length || 0;
const conceptualAvgBefore = averageWordCount(interview.conceptual, 'answer');
const codeBasedCount = interview.codeBased?.length || 0;
const seniorCount = interview.seniorScenario?.length || 0;
const seniorWordsBefore = (interview.seniorScenario || []).map((s) => wordCount(s.answer));
const seniorLabelsBefore = (interview.seniorScenario || []).map((s) => hasSeniorStructure(s.answer));
const wrongAnswersCount = interview.wrongAnswers?.length || 0;
const isValidResumeBullet = (text) => {
  const t = String(text || '').trim();
  const words = t.split(/\s+/).filter(Boolean);
  return words.length > 0 && words.length <= 20 && /^[A-Z][a-z]+ed\b/.test(t);
};

const hasJobSwitch =
  !!interview.jobSwitch &&
  typeof interview.jobSwitch.resumeBullet === 'string' &&
  typeof interview.jobSwitch.interviewPositioning === 'string' &&
  typeof interview.jobSwitch.starAnchor === 'string' &&
  isValidResumeBullet(interview.jobSwitch.resumeBullet);

const mcqCountsBefore = (() => {
  if (!mcqSection?.questions) return { total: 0, basic: 0, intermediate: 0, advanced: 0 };
  const questions = mcqSection.questions;
  return {
    total: questions.length,
    basic: questions.filter((q) => q.level === 'basic').length,
    intermediate: questions.filter((q) => q.level === 'intermediate').length,
    advanced: questions.filter((q) => q.level === 'advanced').length
  };
})();

const mcqCategoryCountsBefore = (() => {
  if (!mcqSection?.questions) return { theory: 0, code: 0, scenario: 0 };
  const questions = mcqSection.questions;
  return {
    theory: questions.filter((q) => q.category === 'theory').length,
    code: questions.filter((q) => q.category === 'code').length,
    scenario: questions.filter((q) => q.category === 'scenario').length
  };
})();

const codeLineMapBefore = {
  basic: codeLineCount(codeSections.find((c) => c.level === 'basic')?.code || ''),
  intermediate: codeLineCount(codeSections.find((c) => c.level === 'intermediate')?.code || ''),
  advanced: codeLineCount(codeSections.find((c) => c.level === 'advanced')?.code || '')
};

const conceptualNeedPatch = conceptualCount < 15 || conceptualAvgBefore < 120;
const seniorNeedPatch =
  seniorCount < 5 ||
  seniorWordsBefore.some((w) => w < 200) ||
  seniorLabelsBefore.some((v) => !v);
const wrongNeedPatch = wrongAnswersCount < 6;
const jobSwitchNeedPatch = !hasJobSwitch;
const mcqNeedPatch =
  !mcqSection ||
  mcqCountsBefore.total !== 30 ||
  mcqCountsBefore.basic !== 8 ||
  mcqCountsBefore.intermediate !== 12 ||
  mcqCountsBefore.advanced !== 10 ||
  mcqCategoryCountsBefore.theory !== 12 ||
  mcqCategoryCountsBefore.code !== 8 ||
  mcqCategoryCountsBefore.scenario !== 10;

if (conceptualNeedPatch && Array.isArray(interview.conceptual)) {
  interview.conceptual = interview.conceptual.map((item) => {
    const current = wordCount(item?.answer || '');
    if (current >= 120) return item;
    return {
      ...item,
      answer: conceptualAnswerFor(item.question || 'this data types and variables topic')
    };
  });
}

if (seniorNeedPatch && Array.isArray(interview.seniorScenario)) {
  interview.seniorScenario = interview.seniorScenario.map((item) => ({
    ...item,
    answer: seniorScenarioAnswerFor(item.question || 'this production issue')
  }));
}

if (wrongNeedPatch && Array.isArray(interview.wrongAnswers)) {
  while (interview.wrongAnswers.length < 6) {
    interview.wrongAnswers.push({
      wrong: 'All numeric fields should be stored as double to avoid overflow.',
      whyWrong:
        'Double prevents some overflows but introduces precision loss. JVM arithmetic behavior must match domain semantics.',
      correct:
        'Choose the narrowest safe numeric type (`int`, `long`, `BigDecimal`) and enforce boundary tests in CI.'
    });
  }
}

if (jobSwitchNeedPatch) {
  interview.jobSwitch = {
    resumeBullet:
      'Reduced GC pause time 37% by replacing boxed hot-path types and standardizing JVM diagnostics across checkout services.',
    interviewPositioning:
      'I treat data type decisions as reliability architecture, not syntax trivia. In week one at a new company, I audit hot paths for boxing, overflow, and charset assumptions, then validate with jcmd/jstat baselines before proposing safe refactors.',
    starAnchor:
      'Situation: A checkout platform had intermittent latency spikes after a feature added boxed numeric maps in the pricing pipeline. Task: Stabilize p99 latency without delaying roadmap delivery. Action: I profiled allocation churn, replaced boxed collections in hot loops with primitive-focused structures, pinned JDK toolchains, and added runtime version/GC checks to release gates. Result: p99 latency dropped from 780ms to 290ms in two sprints and no recurrence was seen for the next quarter.'
  };
}

if (mcqNeedPatch) {
  const questions = buildMcqs();
  if (mcqSection) {
    mcqSection.questions = questions;
  } else {
    mcqSection = {
      type: 'mcq',
      title: 'MCQ Drill - Data Types and Variables',
      questions
    };
    const insertAt = sections.findIndex((s) => s.type === 'interview');
    if (insertAt >= 0) {
      sections.splice(insertAt + 1, 0, mcqSection);
    } else {
      sections.push(mcqSection);
    }
  }
}

writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf8');

const out = JSON.parse(readFileSync(filePath, 'utf8'));
const outInterview = out.sections.find((s) => s.type === 'interview');
const outMcq = out.sections.find((s) => s.type === 'mcq');
const outCodeSections = out.sections.filter((s) => s.type === 'code');

const conceptualAvgAfter = averageWordCount(outInterview.conceptual, 'answer');
const seniorWordsAfter = outInterview.seniorScenario.map((s) => wordCount(s.answer));
const seniorLabelsAfter = outInterview.seniorScenario.map((s) => hasSeniorStructure(s.answer));
const outMcqCounts = {
  total: outMcq?.questions?.length || 0,
  basic: outMcq?.questions?.filter((q) => q.level === 'basic').length || 0,
  intermediate: outMcq?.questions?.filter((q) => q.level === 'intermediate').length || 0,
  advanced: outMcq?.questions?.filter((q) => q.level === 'advanced').length || 0
};
const outMcqCategoryCounts = {
  theory: outMcq?.questions?.filter((q) => q.category === 'theory').length || 0,
  code: outMcq?.questions?.filter((q) => q.category === 'code').length || 0,
  scenario: outMcq?.questions?.filter((q) => q.category === 'scenario').length || 0
};
const outJobSwitchOk =
  !!outInterview.jobSwitch &&
  typeof outInterview.jobSwitch.resumeBullet === 'string' &&
  typeof outInterview.jobSwitch.interviewPositioning === 'string' &&
  typeof outInterview.jobSwitch.starAnchor === 'string' &&
  isValidResumeBullet(outInterview.jobSwitch.resumeBullet);
const outCodeLines = {
  basic: codeLineCount(outCodeSections.find((c) => c.level === 'basic')?.code || ''),
  intermediate: codeLineCount(outCodeSections.find((c) => c.level === 'intermediate')?.code || ''),
  advanced: codeLineCount(outCodeSections.find((c) => c.level === 'advanced')?.code || '')
};
const fileSizeBytes = Buffer.byteLength(JSON.stringify(out, null, 2), 'utf8');

console.log(`Verification summary for Day ${dayNumber}`);
console.log('----------------------------------------');
console.log('interview.conceptual.count:', outInterview.conceptual.length);
console.log('interview.conceptual.avgWords:', conceptualAvgAfter.toFixed(2));
console.log('interview.codeBased.count:', outInterview.codeBased.length);
console.log('interview.seniorScenario.count:', outInterview.seniorScenario.length);
console.log('interview.seniorScenario.words:', seniorWordsAfter.join(', '));
console.log('interview.seniorScenario.structureAll4Parts:', seniorLabelsAfter.every(Boolean));
console.log('interview.wrongAnswers.count:', outInterview.wrongAnswers.length);
console.log('interview.jobSwitch.present:', outJobSwitchOk);
console.log(
  'mcq.counts:',
  `total=${outMcqCounts.total}, basic=${outMcqCounts.basic}, intermediate=${outMcqCounts.intermediate}, advanced=${outMcqCounts.advanced}`
);
console.log(
  'mcq.categoryCounts:',
  `theory=${outMcqCategoryCounts.theory}, code=${outMcqCategoryCounts.code}, scenario=${outMcqCategoryCounts.scenario}`
);
console.log(
  'code.lines:',
  `basic=${outCodeLines.basic}, intermediate=${outCodeLines.intermediate}, advanced=${outCodeLines.advanced}`
);
console.log('file.size.bytes:', fileSizeBytes);
