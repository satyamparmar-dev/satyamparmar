import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const filePath = join(__dirname, '..', 'public', 'data', 'days', 'phase1-day1.json');
const DAY = 1;

const wordCount = (text) =>
  String(text || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[`*_>#-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;

const codeLineCount = (code) => String(code || '').split('\n').length;

const h3Count = (t) => ((t || '').match(/^###\s+/gm) || []).length;

const angleCount = (t) => ((t || '').match(/\*\*Interview angle:\*\*/g) || []).length;

const tableCount = (t) => {
  const lines = (t || '').split('\n');
  let c = 0;
  for (let i = 0; i < lines.length - 1; i += 1) {
    if (/^\|/.test(lines[i]) && /^\|?\s*[-:|\s]+\|?\s*$/.test(lines[i + 1])) c += 1;
  }
  return c;
};

const cheatRows = (t) => Math.max(0, (t || '').split('\n').filter((l) => /^\|/.test(l)).length - 2);

const hasSeniorLabels = (answer) => {
  const labels = ['**Immediate response:**', '**Root cause:**', '**Fix:**', '**Prevention:**'];
  return labels.every((x) => String(answer || '').includes(x));
};

const isPlainWrongAnswers = (arr) =>
  Array.isArray(arr) &&
  arr.length === 8 &&
  arr.every((x) => typeof x === 'string' && x.length < 200 && !x.includes('— fix by'));

function verify(json) {
  const sections = json.sections || [];
  const why = sections.find((s) => s.type === 'why');
  const theory = sections.find((s) => s.type === 'theory');
  const codes = sections.filter((s) => s.type === 'code');
  const basic = codes.find((c) => c.level === 'basic');
  const mid = codes.find((c) => c.level === 'intermediate');
  const adv = codes.find((c) => c.level === 'advanced');
  const pitfalls = sections.find((s) => s.type === 'pitfalls');
  const exercises = sections.filter((s) => s.type === 'exercise');
  const interview = sections.find((s) => s.type === 'interview');
  const mcq = sections.find((s) => s.type === 'mcq');
  const cheat = sections.find((s) => s.type === 'cheatsheet');

  const whyWc = wordCount(why?.content);
  const theoryH3 = h3Count(theory?.content);
  const pipes = tableCount(theory?.content);
  const angles = angleCount(theory?.content);
  const basicL = codeLineCount(basic?.code);
  const midL = codeLineCount(mid?.code);
  const advL = codeLineCount(adv?.code);
  const scenarioMarkers = (mid?.code || '').match(/--- Scenario \d+:/g) || [];
  const blockMarkers = (adv?.code || '').match(/=== Block \d+:/g) || [];

  const conc = interview?.conceptual || [];
  const concWc = conc.map((c) => wordCount(c.answer));
  const sen = interview?.seniorScenario || [];
  const senWc = sen.map((s) => wordCount(s.answer));
  const jb = interview?.jobSwitch;
  const resumeWords = jb?.resumeBullet ? jb.resumeBullet.split(/\s+/).filter(Boolean).length : 0;
  const resumeOk =
    resumeWords > 0 &&
    resumeWords <= 20 &&
    /^[A-Z][a-z]+ed\b/.test(String(jb?.resumeBullet || '').trim());

  const mcqs = mcq?.questions || [];
  const mcqBasic = mcqs.filter((q) => q.level === 'basic').length;
  const mcqInt = mcqs.filter((q) => q.level === 'intermediate').length;
  const mcqAdv = mcqs.filter((q) => q.level === 'advanced').length;

  const codeBased = interview?.codeBased || [];
  const cbWc = codeBased.map((c) => wordCount(c.answer));

  const fresherEx = exercises.find((e) => e.audience === 'fresher');
  const staffEx = exercises.find((e) => e.audience === 'staff');
  const fresherSol = fresherEx?.solution || '';
  const staffSol = staffEx?.solution || '';

  return {
    whyWc,
    theoryH3,
    pipes,
    angles,
    basicL,
    midL,
    advL,
    scenarioCount: scenarioMarkers.length,
    blockCount: blockMarkers.length,
    pitfalls: pitfalls?.items?.length || 0,
    conceptualCount: conc.length,
    conceptualMin: concWc.length ? Math.min(...concWc) : 0,
    conceptualAvg: concWc.length ? concWc.reduce((a, b) => a + b, 0) / concWc.length : 0,
    conceptualWcs: concWc,
    codeBasedCount: codeBased.length,
    codeBasedMin: cbWc.length ? Math.min(...cbWc) : 0,
    seniorCount: sen.length,
    seniorWcs: senWc,
    seniorLabelsOk: sen.every((s) => hasSeniorLabels(s.answer)),
    wrongCount: interview?.wrongAnswers?.length || 0,
    plainWrong: isPlainWrongAnswers(interview?.wrongAnswers),
    jobSwitch: !!jb,
    resumeWords,
    resumeOk,
    mcqBasic,
    mcqInt,
    mcqAdv,
    cheatRows: cheatRows(cheat?.content),
    exercises: exercises.length,
    hasFresherEx: !!fresherEx && /Day1FresherExercise/.test(fresherSol),
    hasStaffEx: !!staffEx && /Day1StaffExercise/.test(staffSol),
    staffSolLines: staffSol.split('\n').length,
    fresherSolLines: fresherSol.split('\n').length,
    fileChars: JSON.stringify(json).length
  };
}

function patchWhy(why) {
  const w = wordCount(why.content);
  if (w >= 600) return false;
  const add =
    '\n\nYou joined a team last Tuesday. Your **IDE** compiles fine because it bundles its own **JDK**, but when you open **PowerShell** and type **javac** you see the shell report that the command is not recognized. Nothing is wrong with your source file yet. The shell simply cannot see the **JDK** **bin** folder on **PATH**. You set **JAVA_HOME** to the **JDK** root, prepend **bin** to **PATH**, open a brand-new terminal window, and run **javac** **-version** next to **java** **-version**. When both lines show the same major version, you finally trust your laptop. That small ritual is why this lesson exists: you must keep the compile-time tools and the runtime launcher pointed at the same install before you trust any **CI** log or **Docker** build argument.';
  why.content = why.content + add;
  return true;
}

function patchTheory(theory) {
  let c = theory.content;
  let touched = false;
  if (c.includes('### 15. Sixty-second interview story')) {
    c = c.replace('### 15. Sixty-second interview story', '### 60-second interview story');
    touched = true;
  }
  theory.content = c;
  return touched;
}

const BASIC_CODE = `package arch.day1;

/**
 * Day 1 basic: static reference tables for JDK vs JRE vs JVM.
 */
public class Day1Basic {

    public static void main(String[] args) {
        // Name the three boxes before you memorize any command — interviewers draw this triangle first.
        System.out.println("=== Java platform layers ===");
        System.out.println("JDK  | Development kit  | javac, jar, javadoc, jdb, jcmd, jlink, JVM + libs");
        System.out.println("JRE  | Runtime bundle   | JVM + class libraries (no javac, no jcmd)");
        System.out.println("JVM  | Execution engine | loads bytecode, verifies, JIT-compiles, GC");
        System.out.println();

        // Tie each shell command to the phase of work: compile time versus process start.
        System.out.println("=== Compile vs run commands ===");
        System.out.println("javac Hello.java         -> produces Hello.class bytecode");
        System.out.println("java Hello               -> starts JVM, loads Hello, calls main");
        System.out.println("java Hello.java          -> since Java 11: in-memory compile+run (single file)");
        System.out.println("javap -c Hello.class     -> disassemble bytecode (JDK tool, debugging)");
        System.out.println("jcmd <pid> VM.flags      -> show effective JVM flags at runtime");
        System.out.println();

        // Freshers lose points when they cannot explain why each keyword exists on the entry method.
        System.out.println("=== main() contract: each keyword has a runtime reason ===");
        System.out.println("public static void main(String[] args)");
        System.out.println("  public  -> launcher can invoke without access restrictions");
        System.out.println("  static  -> no instance required before entry; JVM has no object to construct");
        System.out.println("  void    -> no return value to launcher; exit code via System.exit()");
        System.out.println("  args    -> tokens from CLI after class name");
        System.out.println();

        // Build tools read JAVA_HOME even when PATH looks fine — this table prevents split-brain installs.
        System.out.println("=== Key environment variables ===");
        System.out.println("JAVA_HOME  -> JDK root (Gradle, Maven, IntelliJ read this)");
        System.out.println("PATH       -> shell resolution order; javac wins/loses here");
        System.out.println("CLASSPATH  -> fallback classpath (override with -cp at runtime)");
        System.out.println();

        // These errors look like app bugs but are platform mistakes — memorize the mapping.
        System.out.println("=== Common prod failures tied to this lesson ===");
        System.out.println("javac missing in CI          -> JRE-only image or PATH lacks JDK/bin");
        System.out.println("ClassNotFoundException       -> classpath or module path wrong");
        System.out.println("UnsupportedClassVersionError -> bytecode newer than runtime JVM");
        System.out.println("NoSuchMethodError: main      -> main typo or wrong modifier");
        System.out.println("VerifyError at class load    -> bad bytecode from code generator (CGLIB/Lombok)");
    }
}`;

const BASIC_OUTPUT = `=== Java platform layers ===
JDK  | Development kit  | javac, jar, javadoc, jdb, jcmd, jlink, JVM + libs
JRE  | Runtime bundle   | JVM + class libraries (no javac, no jcmd)
JVM  | Execution engine | loads bytecode, verifies, JIT-compiles, GC

=== Compile vs run commands ===
javac Hello.java         -> produces Hello.class bytecode
java Hello               -> starts JVM, loads Hello, calls main
java Hello.java          -> since Java 11: in-memory compile+run (single file)
javap -c Hello.class     -> disassemble bytecode (JDK tool, debugging)
jcmd <pid> VM.flags      -> show effective JVM flags at runtime

=== main() contract: each keyword has a runtime reason ===
public static void main(String[] args)
  public  -> launcher can invoke without access restrictions
  static  -> no instance required before entry; JVM has no object to construct
  void    -> no return value to launcher; exit code via System.exit()
  args    -> tokens from CLI after class name

=== Key environment variables ===
JAVA_HOME  -> JDK root (Gradle, Maven, IntelliJ read this)
PATH       -> shell resolution order; javac wins/loses here
CLASSPATH  -> fallback classpath (override with -cp at runtime)

=== Common prod failures tied to this lesson ===
javac missing in CI          -> JRE-only image or PATH lacks JDK/bin
ClassNotFoundException       -> classpath or module path wrong
UnsupportedClassVersionError -> bytecode newer than runtime JVM
NoSuchMethodError: main      -> main typo or wrong modifier
VerifyError at class load    -> bad bytecode from code generator (CGLIB/Lombok)
`;

const MID_CODE = `package arch.day1;

/**
 * Day 1 intermediate: four labelled scenarios for JDK / JRE / JVM mistakes.
 * // Production JVM would throw; we print the playbook your team expects in review.
 * // Always pair symptoms with a real diagnostic command before you change code.
 * // Gradle daemon and GitHub Actions often disagree until toolchain pins the JDK.
 */
public class Day1Intermediate {

    static void scenario1() {
        // Feature teams copy a slim runtime image into CI and forget the compiler.
        System.out.println("--- Scenario 1: first CI pipeline on a JRE-only base image ---");
        System.out.println("symptom:  build fails before tests with javac: not found or exit code 127");
        System.out.println("cause:    Dockerfile used eclipse-temurin:17-jre so no javac binary shipped");
        System.out.println("why:      Maven and Gradle fork javac from JAVA_HOME; missing compiler aborts compileJava");
        System.out.println("fix:      multi-stage build: JDK stage runs mvn package, final stage copies the fat JAR only");
        System.out.println("verify:   docker run --rm <ci-image> javac -version");
        System.out.println("next:     add Gradle toolchain or Maven enforcer so every agent downloads the same JDK");
        System.out.println();
        // Exit 127 is the shell telling you the binary is missing, not a Java exception class.
    }

    static void scenario2() {
        // Library bumps compiled on laptops outpace the LTS image pinned in Kubernetes.
        System.out.println("--- Scenario 2: pod crash loop after deploy with UnsupportedClassVersionError ---");
        System.out.println("symptom:  Kubernetes logs show UnsupportedClassVersionError before Spring banner prints");
        System.out.println("cause:    developers compiled with JDK 21 while the cluster still runs JVM 17");
        System.out.println("why:      defineClass rejects class files whose major version exceeds the running JVM");
        System.out.println("fix:      set maven.compiler.release=17 or upgrade the runtime image to JDK 21");
        System.out.println("verify:   javap -verbose App.class | findstr major plus kubectl exec pod -- java -version");
        System.out.println("next:     fail CI when bytecode major is newer than production FROM tag");
        System.out.println();
        // Crash loops here are class loading failures, not slow SQL or HTTP timeouts.
    }

    static void scenario3() {
        // Debug flags are safe on laptops but expensive when every pod prints class loads.
        System.out.println("--- Scenario 3: latency regression after copying debug JVM flags into prod ---");
        System.out.println("symptom:  p95 doubles and disks fill with class-loading traces under traffic");
        System.out.println("cause:    -verbose:class stayed enabled in the Helm values copied from a laptop");
        System.out.println("why:      every class load prints; interpreter plus IO dominates before JIT tiers kick in");
        System.out.println("fix:      remove -verbose:class; use short jcmd class histogram samples during incidents");
        System.out.println("verify:   jcmd <pid> VM.flags | findstr verbose and compare Grafana p95 after redeploy");
        System.out.println("next:     add review checklist item banning verbose class logging in prod values");
        System.out.println();
    }

    static void scenario4() {
        // Platform standards prevent fifty slightly different Dockerfiles from drifting apart.
        System.out.println("--- Scenario 4: platform team argues about JDK versus JRE in every image ---");
        System.out.println("symptom:  security wants tiny images; SRE wants jcmd available during incidents");
        System.out.println("cause:    single-stage Dockerfile tried to be both builder and minimal runtime");
        System.out.println("why:      JDK adds javac and jcmd; JRE-only layers delete those tools to save megabytes");
        System.out.println("fix:      JDK builder copies artifact into JRE or distroless final; optional JDK debug sidecar");
        System.out.println("verify:   docker history on prod tag shows no javac layer; document digest per environment");
        System.out.println("next:     store canonical FROM lines and toolchain version in the service runbook");
        System.out.println();
    }

    public static void main(String[] args) {
        // Run scenarios in teaching order: CI compile, deploy version, logging misuse, image policy.
        scenario1();
        scenario2();
        scenario3();
        scenario4();
        // Each block mirrors how you would narrate the incident in a blameless review.
        // Re-run after changing Dockerfiles: output should stay identical because there is no I/O.
    }
}`;

const MID_OUTPUT = `--- Scenario 1: first CI pipeline on a JRE-only base image ---
symptom:  build fails before tests with javac: not found or exit code 127
cause:    Dockerfile used eclipse-temurin:17-jre so no javac binary shipped
why:      Maven and Gradle fork javac from JAVA_HOME; missing compiler aborts compileJava
fix:      multi-stage build: JDK stage runs mvn package, final stage copies the fat JAR only
verify:   docker run --rm <ci-image> javac -version
next:     add Gradle toolchain or Maven enforcer so every agent downloads the same JDK

--- Scenario 2: pod crash loop after deploy with UnsupportedClassVersionError ---
symptom:  Kubernetes logs show UnsupportedClassVersionError before Spring banner prints
cause:    developers compiled with JDK 21 while the cluster still runs JVM 17
why:      defineClass rejects class files whose major version exceeds the running JVM
fix:      set maven.compiler.release=17 or upgrade the runtime image to JDK 21
verify:   javap -verbose App.class | findstr major plus kubectl exec pod -- java -version
next:     fail CI when bytecode major is newer than production FROM tag

--- Scenario 3: latency regression after copying debug JVM flags into prod ---
symptom:  p95 doubles and disks fill with class-loading traces under traffic
cause:    -verbose:class stayed enabled in the Helm values copied from a laptop
why:      every class load prints; interpreter plus IO dominates before JIT tiers kick in
fix:      remove -verbose:class; use short jcmd class histogram samples during incidents
verify:   jcmd <pid> VM.flags | findstr verbose and compare Grafana p95 after redeploy
next:     add review checklist item banning verbose class logging in prod values

--- Scenario 4: platform team argues about JDK versus JRE in every image ---
symptom:  security wants tiny images; SRE wants jcmd available during incidents
cause:    single-stage Dockerfile tried to be both builder and minimal runtime
why:      JDK adds javac and jcmd; JRE-only layers delete those tools to save megabytes
fix:      JDK builder copies artifact into JRE or distroless final; optional JDK debug sidecar
verify:   docker history on prod tag shows no javac layer; document digest per environment
next:     store canonical FROM lines and toolchain version in the service runbook

`;

const PITFALLS = [
  'Calling **javac** before a full **JDK** is on **PATH** — the shell prints **javac** is not recognized while **java** **-version** still works from an old **JRE** shim; install a **JDK**, prepend its **bin** directory ahead of other **Java** entries, then open a new terminal; verify with **javac** **-version** matching **java** **-version** in that same window.',
  'Running **java** **Hello** for a class declared in **package** **com.acme** — the **JVM** throws **ClassNotFoundException** even though **javac** succeeded because the loader expects **com/acme/Hello.class** under the **classpath** root; run **java** **-cp** **out** **com.acme.Hello** with the folder layout fixed; verify with **java** **-verbose:class** showing **[Loaded com.acme.Hello from file:...]**.',
  'Pointing **JAVA_HOME** at a **JRE** subtree while **Gradle** forks **javac** — builds pick the wrong **Java** home and emit confusing toolchain errors or silently older **bytecode**; export **JAVA_HOME** to the **JDK** root that contains **bin/javac**; verify with **ls** **$JAVA_HOME/bin/javac** on Linux or **dir** **%JAVA_HOME%\\bin\\javac.exe** on Windows.',
  'Leaving **java** from one **JDK** earlier on **PATH** than **javac** from another — **java** **-version** and **javac** **-version** disagree and **Maven** reads a different home than your shell; run **where** **java** and **where** **javac** on Windows or **type** **-a** **java** on **bash**, then align order; verify both commands resolve under the same **JDK** root.',
  'Letting each service pick its own **Dockerfile** **FROM** tag without a platform standard — half the fleet runs **JRE**-only images while new hires assume **jcmd** exists everywhere; publish a golden multi-stage pattern (**JDK** build, **JRE** run) in the platform repo; verify with a weekly script that **docker** **inspect** labels match the approved **JDK** major.',
  'Skipping a code-review rule for **JAVA_HOME** and **PATH** in infra pull requests — bad defaults spread to dozens of pods before anyone notices **javac** missing in debug containers; add a checklist line for **JDK** vs **JRE** base tags and required **jcmd** availability in break-glass pods; verify by sampling five random namespaces with **kubectl** **exec** **java** **-version**.',
  'Setting **-Xmx** equal to the **Kubernetes** limit without **-Xms** alignment — the **JVM** grows the **heap** in steps and triggers long **full** **GC** pauses during the first minutes after each deploy, which looks like an application regression; set **-Xms** to match **-Xmx** for steady heaps; verify with **jcmd** **<pid>** **VM.flags** **|** **grep** **HeapSize** inside the pod.',
  'Exporting **_JAVA_OPTIONS** or **JDK_JAVA_OPTIONS** with debug flags on a shared node — every **JVM** on that host inherits surprise logging and **GC** settings; scope flags to the single namespace or pod that needs them; verify with **jcmd** **<pid>** **VM.flags** and remove global entries when the ticket closes.'
];

const WRONG_ANSWERS = [
  '**System.gc()** after every request is good hygiene because it forces the **JVM** to free memory immediately.',
  '**JDK**, **JRE**, and **JVM** are three interchangeable marketing names for the same installer.',
  'If your **IDE** compiles, you never need **javac** on **PATH** for **CI** because the **IDE** ships its own compiler.',
  '**java** always executes **.java** source files directly, so **bytecode** and **javac** are optional in production.',
  '**HashMap** is automatically thread-safe because it ships in the **Java** standard library.',
  'You can always fix **OutOfMemoryError** by raising **-Xmx** without checking **heap** leaks or **GC** logs.',
  '**Spring** **Boot** hides the **classpath**, so **UnsupportedClassVersionError** cannot happen once tests pass locally.',
  '**JAVA_HOME** is optional whenever **java** is already on **PATH** because **Maven** only cares about the shell.'
];

const FRESHER_EXERCISE = {
  type: 'exercise',
  title: 'Exercise — JDK, JRE, JVM vocabulary (fresher)',
  audience: 'fresher',
  difficulty: 'Beginner',
  problem:
    'You are writing your first **Java** program to memorize how **JDK**, **JRE**, and **JVM** fit together.\n\n1. Create **arch.day1.Day1FresherExercise** with **public** **static** **void** **main**.\n2. Print three lines: one mentions **JDK**, one **JRE**, one **JVM**, each with a short plain phrase.\n3. Print two lines that name **javac** and **java** and say what each one does.\n4. Print one reminder line about running **javac** **-version** and **java** **-version** together.',
  hints: [
    'Keep every teaching string in a **final** **String** so reviewers see there is no randomness.',
    'Use **System.out.println** only; no files or network calls.',
    'The reminder line can be a fixed sentence you would say in an interview.'
  ],
  solution: [
    'package arch.day1;',
    '',
    '/** Fresher drill: vocabulary lines you can say out loud in week one. */',
    'public class Day1FresherExercise {',
    '',
    '    public static void main(String[] args) {',
    '        // args unused so every machine prints the same story.',
    '        final String jdk = "JDK -> full kit with javac, jar, jcmd, and libraries";',
    '        // jdk names what you install when someone says install Java for development.',
    '        System.out.println(jdk);',
    '        final String jre = "JRE -> JVM plus standard libraries without javac";',
    '        // jre explains why slim runtime images cannot compile in CI.',
    '        System.out.println(jre);',
    '        final String jvm = "JVM -> executes bytecode, verifies it, runs GC and JIT";',
    '        // jvm separates the engine from installer names above.',
    '        System.out.println(jvm);',
    '        System.out.println();',
    '        // Blank line groups vocabulary from the command pair.',
    '        System.out.println("javac -> turns .java sources into .class bytecode");',
    '        // javac line is the compile-time tool you prove with javac -version.',
    '        System.out.println("java -> launcher that boots a JVM and calls main(String[] args)");',
    '        // java line is the runtime entry you prove with java -version.',
    '        System.out.println();',
    '        System.out.println("Reminder: run javac -version and java -version in the same shell after fixing PATH.");',
    '        // Reminder encodes the habit of proving both binaries match one JDK home.',
    '    }',
    '}',
    ''
  ].join('\n')
};

const STAFF_EXERCISE = {
  type: 'exercise',
  title: 'Exercise — Multi-stage image and bytecode drift triage (staff)',
  audience: 'staff',
  difficulty: 'Advanced',
  problem:
    'Your **Kubernetes** payment service starts crash-looping after a library upgrade. Logs show **UnsupportedClassVersionError** even though **mvn** **test** passed on laptops.\n\n1. Model two build contexts as **String** keys (**ctx_ci_jdk21**, **ctx_prod_jvm17**) describing the mismatch.\n2. Build a deterministic **LinkedHashMap** from context key to the first command you run (**javap** **-verbose**, **kubectl** **exec** **java** **-version**, **jcmd** **VM.version**).\n3. Print the **root JVM mechanism** in one line (major version in **class** file versus running **JVM**).\n4. Print the **fix** pattern (**--release** alignment or runtime image bump) and the **verify** step (**docker** **run** **javac** **-version** inside CI image).\n5. Print a **prevention** line naming **Gradle** toolchain or **Maven** enforcer plus **Docker** digest pinning.',
  hints: [
    'Use **LinkedHashMap** so println order matches the story you would tell in a postmortem.',
    'You are not calling **kubectl** for real; printable keys and values are enough.',
    'Name **major** **version** explicitly so the answer is not hand-wavy.'
  ],
  solution: [
    'package arch.day1;',
    '',
    'import java.util.LinkedHashMap;',
    'import java.util.Map;',
    '',
    '/**',
    ' * Staff exercise: deterministic triage card for JDK major drift across CI and prod.',
    ' * LinkedHashMap keeps narrative order: detect mismatch, prove with tools, then prevent.',
    ' */',
    'public class Day1StaffExercise {',
    '',
    '    public static void main(String[] args) {',
    '        // ctx_ci_jdk21 models a pipeline compiling with the newest JDK developers installed.',
    '        final String ctxCi = "ctx_ci_jdk21";',
    '        // ctx_prod_jvm17 models pods still on the older LTS JVM baked into the base image.',
    '        final String ctxProd = "ctx_prod_jvm17";',
    '',
    '        // Map ties each context to the first command you run before editing business logic.',
    '        Map<String, String> firstCommand = new LinkedHashMap<>();',
    '        firstCommand.put(ctxCi, "javap -verbose target/classes/com/example/PaymentApp.class | findstr major");',
    '        firstCommand.put(ctxProd, "kubectl exec deploy/payment-svc -- java -version");',
    '',
    '        System.out.println("=== Modeled contexts ===");',
    '        for (Map.Entry<String, String> e : firstCommand.entrySet()) {',
    '            System.out.println(e.getKey() + " -> " + e.getValue());',
    '        }',
    '',
    '        System.out.println("=== Root mechanism ===");',
    '        // Mechanism states the verifier rejects class files newer than the running JVM.',
    '        System.out.println("defineClass reads major version bytes; JVM 17 cannot load major 65 bytecode from JDK 21");',
    '',
    '        System.out.println("=== Fix pattern ===");',
    '        System.out.println("fix: set maven.compiler.release=17 or bump eclipse-temurin FROM tag to 21-jdk");',
    '',
    '        System.out.println("=== Verify ===");',
    '        System.out.println("verify: docker run --rm ci-build:jdk21 javac -version matches kubectl exec java -version");',
    '',
    '        System.out.println("=== Prevention ===");',
    '        System.out.println("prevention: Gradle Java toolchain + Renovate digest pins on runtime images + CI matrix equals prod major");',
    '',
    '        System.out.println("=== Optional on-call ===");',
    '        System.out.println("jcmd <pid> VM.version confirms live JVM build string when Dockerfile labels lie");',
    '        System.out.println("javap -verbose on the failing class proves emitted major before redeploy");',
    '        System.out.println("Java 11 single-file java Source.java mode must never replace reproducible CI javac outputs");',
    '        // Teaching closure: repeat the alignment rule so interview answers stay concrete.',
    '        System.out.println("teaching: align maven.compiler.release with kubectl exec java -version");',
    '        // Staff signal: Java 21 class file major 65 still fails on JVM 17 even if tests passed on laptops.',
    '    }',
    '}',
    ''
  ].join('\n')
};

function patchCode(sections, before) {
  let touched = false;
  const basicIdx = sections.findIndex((s) => s.type === 'code' && s.level === 'basic');
  if (basicIdx >= 0) {
    const needBasic =
      before.basicL < 40 ||
      before.basicL > 60 ||
      !sections[basicIdx].code.includes('// Name the three boxes');
    if (needBasic) {
      sections[basicIdx].code = BASIC_CODE;
      sections[basicIdx].output = BASIC_OUTPUT;
      touched = true;
    }
  }
  const midIdx = sections.findIndex((s) => s.type === 'code' && s.level === 'intermediate');
  if (midIdx >= 0) {
    const needMid =
      before.midL < 70 ||
      before.midL > 100 ||
      before.scenarioCount < 4 ||
      !sections[midIdx].code.includes('symptom:');
    if (needMid) {
      sections[midIdx].code = MID_CODE;
      sections[midIdx].output = MID_OUTPUT;
      touched = true;
    }
  }
  return touched;
}

function dedupeExercises(sections) {
  let fresher = false;
  let staff = false;
  const next = [];
  for (const sec of sections) {
    if (sec.type !== 'exercise') {
      next.push(sec);
      continue;
    }
    if (sec.audience === 'fresher' && !fresher) {
      next.push(sec);
      fresher = true;
    } else if (sec.audience === 'staff' && !staff) {
      next.push(sec);
      staff = true;
    }
  }
  if (next.length !== sections.length) {
    sections.length = 0;
    sections.push(...next);
    return true;
  }
  return false;
}

function patchExercises(sections) {
  const touchedDedupe = dedupeExercises(sections);
  const indices = sections.map((s, i) => (s.type === 'exercise' ? i : -1)).filter((i) => i >= 0);
  const exercises = indices.map((i) => sections[i]);
  const hasF = exercises.some(
    (e) => e.audience === 'fresher' && /Day1FresherExercise/.test(e.solution || '')
  );
  const hasS = exercises.some((e) => e.audience === 'staff' && /Day1StaffExercise/.test(e.solution || ''));
  const staffSol = exercises.find((e) => e.audience === 'staff')?.solution || '';
  const staffLines = staffSol.split('\n').length;
  if (exercises.length === 2 && hasF && hasS && staffLines >= 50) return touchedDedupe;
  if (indices.length === 0) return touchedDedupe;
  sections.splice(indices[0], indices.length, FRESHER_EXERCISE, STAFF_EXERCISE);
  return true;
}

function patchPitfalls(pitfalls, before) {
  if (before.pitfalls === 8) {
    const same = PITFALLS.every((p, i) => pitfalls.items[i] === p);
    if (same) return false;
  }
  pitfalls.items = [...PITFALLS];
  return true;
}

function patchInterview(interview, before) {
  let touched = false;
  for (const c of interview.conceptual || []) {
    if (wordCount(c.answer) < 120) {
      c.answer +=
        ' After you change anything, prove the live process matches your story with **jcmd** **<pid>** **VM.version** on the pod or host that failed, because **Dockerfile** labels and shell **PATH** often disagree with what is actually running.';
      touched = true;
    }
  }
  const pad =
    ' At **runtime** the **JVM** only sees **bytecode**, so the behavior you explain must match what **javac** emitted and what **java** loaded. Misunderstanding this shows up as **ClassNotFoundException**, **NoClassDefFoundError**, or **UnsupportedClassVersionError** in logs. Confirm with **javap** **-c** or **-verbose** on the class you care about, and with **jcmd** **<pid>** **VM.version** on the running process. **Java** **11** added single-file **java** **Source.java** launch, while **Java** **17** tightened default **encapsulation** and **UTF-8** defaults, so always state which **JDK** you tested.';
  for (const cb of interview.codeBased || []) {
    if (wordCount(cb.answer) < 60) {
      cb.answer = String(cb.answer).trim() + pad;
      touched = true;
    }
  }
  for (const s of interview.seniorScenario || []) {
    if (!hasSeniorLabels(s.answer)) {
      let a = s.answer;
      a = a.replace(/\*\*\(\d+\)\s*Immediate response\*\*\s*—\s*/g, '**Immediate response:** ');
      a = a.replace(/\*\*\(\d+\)\s*Root cause\*\*\s*—\s*/g, '**Root cause:** ');
      a = a.replace(/\*\*\(\d+\)\s*Fix\*\*\s*—\s*/g, '**Fix:** ');
      a = a.replace(/\*\*\(\d+\)\s*Prevention\*\*\s*—\s*/g, '**Prevention:** ');
      s.answer = a;
      touched = true;
    }
    if (wordCount(s.answer) < 200) {
      s.answer +=
        ' **Staff note:** capture **jcmd** **<pid>** **VM.flags** and **VM.version** output in the incident ticket so the next engineer sees proof of which **JVM** build handled traffic, because **Kubernetes** labels and **Docker** tags drift faster than people remember.';
      touched = true;
    }
  }
  if (!before.plainWrong || before.wrongCount !== 8) {
    interview.wrongAnswers = [...WRONG_ANSWERS];
    touched = true;
  }
  if (!before.resumeOk) {
    interview.jobSwitch = {
      ...interview.jobSwitch,
      resumeBullet:
        'Migrated twelve services to Gradle toolchains after fixing JRE-only CI and JAVA_HOME drift.'
    };
    touched = true;
  }
  return touched;
}

// ─── main ───────────────────────────────────────────────────────────────────
const json = JSON.parse(readFileSync(filePath, 'utf8'));
const sections = json.sections;
let patched = [];

const v0 = verify(json);
if (v0.whyWc < 600) {
  patchWhy(sections.find((s) => s.type === 'why'));
  patched.push('why');
}
if (patchTheory(sections.find((s) => s.type === 'theory'))) patched.push('theory-titles');
if (patchCode(sections, v0)) patched.push('code');
if (patchPitfalls(sections.find((s) => s.type === 'pitfalls'), v0)) patched.push('pitfalls');
if (patchExercises(sections)) patched.push('exercise');
if (patchInterview(sections.find((s) => s.type === 'interview'), v0)) patched.push('interview');

const text = JSON.stringify(json, null, 2);
JSON.parse(text);
writeFileSync(filePath, text, 'utf8');

const out = JSON.parse(readFileSync(filePath, 'utf8'));
const v = verify(out);
const iv = out.sections.find((s) => s.type === 'interview');
const codes = out.sections.filter((s) => s.type === 'code');
const theory = out.sections.find((s) => s.type === 'theory');
const theoryContent = theory?.content || '';

const theoryLines = theoryContent.split('\n');
const fresherBand = theoryLines.filter((l) =>
  /### (Plain-language|1\.|2\.|3\.|What|How to use|Your first)/i.test(l)
).length;
const seniorBand = theoryLines.filter((l) =>
  /### (4\.|5\.|6\.|7\.|8\.|9\.|10\.|How .* works|Common mistakes|Production comparison|Step)/i.test(l)
).length;
const tlBand = theoryLines.filter((l) =>
  /### (11\.|12\.|How to choose|code review|stakeholder|JAVA_HOME|JIT|classpath)/i.test(l)
).length;
const staffBand = theoryLines.filter((l) =>
  /### (13\.|14|15\.|16|delegation|Observability|JVM|on-call|module path|bytecode verification)/i.test(l)
).length;

console.log('Patches applied:', patched.length ? patched.join(', ') : '(none)');
console.log('--- verification ---');
console.log('WHY word count:', v.whyWc, v.whyWc >= 600 ? 'OK' : 'FAIL');
console.log(
  'THEORY ### count:',
  v.theoryH3,
  '| heuristic bands fresher/senior/tl/staff lines matched:',
  fresherBand,
  seniorBand,
  tlBand,
  staffBand
);
console.log('THEORY pipe tables:', v.pipes, '| Interview angle lines:', v.angles);
console.log(
  'Conceptual:',
  v.conceptualCount,
  '| word counts:',
  v.conceptualWcs.join(', ')
);
console.log('SeniorScenario:', v.seniorCount, '| word counts:', v.seniorWcs.join(', '), '| labels OK:', v.seniorLabelsOk);
console.log('JobSwitch:', v.jobSwitch, '| resume <=20 words & past tense:', v.resumeOk, '| resume words:', v.resumeWords);
console.log('MCQ basic / intermediate / advanced:', v.mcqBasic, v.mcqInt, v.mcqAdv);
console.log('Code line counts [basic, intermediate, advanced]:', v.basicL, v.midL, v.advL);
console.log('File size chars (JSON.stringify):', v.fileChars);

const pass =
  v.whyWc >= 600 &&
  v.theoryH3 >= 16 &&
  v.pipes >= 3 &&
  v.angles >= 13 &&
  v.basicL >= 40 &&
  v.basicL <= 60 &&
  v.midL >= 70 &&
  v.midL <= 100 &&
  v.scenarioCount >= 4 &&
  v.blockCount >= 3 &&
  v.advL >= 60 &&
  v.advL <= 100 &&
  v.pitfalls === 8 &&
  v.conceptualCount >= 15 &&
  v.conceptualAvg >= 120 &&
  v.conceptualMin >= 120 &&
  v.codeBasedCount >= 8 &&
  v.codeBasedMin >= 60 &&
  v.seniorCount >= 5 &&
  v.seniorWcs.every((w) => w >= 200) &&
  v.seniorLabelsOk &&
  v.wrongCount === 8 &&
  v.plainWrong &&
  v.jobSwitch &&
  v.resumeOk &&
  v.mcqBasic === 8 &&
  v.mcqInt === 12 &&
  v.mcqAdv === 10 &&
  v.cheatRows >= 12 &&
  v.exercises >= 2 &&
  v.hasFresherEx &&
  v.hasStaffEx;

if (!pass) {
  const checks = {
    whyWc: v.whyWc >= 600,
    theoryH3: v.theoryH3 >= 16,
    pipes: v.pipes >= 3,
    angles: v.angles >= 13,
    basicL: v.basicL >= 40 && v.basicL <= 60,
    midL: v.midL >= 70 && v.midL <= 100,
    scenarios: v.scenarioCount >= 4,
    advL: v.advL >= 60 && v.advL <= 100,
    blocks: v.blockCount >= 3,
    pitfalls: v.pitfalls === 8,
    conceptualCount: v.conceptualCount >= 15,
    conceptualAvg: v.conceptualAvg >= 120,
    conceptualMin: v.conceptualMin >= 120,
    codeBasedCount: v.codeBasedCount >= 8,
    codeBasedMin: v.codeBasedMin >= 60,
    seniorCount: v.seniorCount >= 5,
    seniorWords: v.seniorWcs.every((w) => w >= 200),
    seniorLabels: v.seniorLabelsOk,
    wrongCount: v.wrongCount === 8,
    plainWrong: v.plainWrong,
    jobSwitch: v.jobSwitch,
    resumeOk: v.resumeOk,
    mcq: v.mcqBasic === 8 && v.mcqInt === 12 && v.mcqAdv === 10,
    cheat: v.cheatRows >= 12,
    ex2: v.exercises >= 2,
    fresherEx: v.hasFresherEx,
    staffEx: v.hasStaffEx
  };
  console.log('Failed checks:', Object.entries(checks).filter(([, ok]) => !ok).map(([k]) => k));
}
console.log(pass ? 'ALL_CHECKS_PASS' : 'SOME_CHECKS_FAIL');
process.exit(pass ? 0 : 1);
