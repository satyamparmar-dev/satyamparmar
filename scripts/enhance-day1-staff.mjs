import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

const filePath = join(__dirname, '..', 'public', 'data', 'days', 'phase1-day1.json');
const json = JSON.parse(readFileSync(filePath, 'utf8'));
const sections = json.sections;

// ─── 1. EXPAND BASIC CODE (32 → 52 lines) ─────────────────────────────────
const basicIdx = sections.findIndex(s => s.type === 'code' && s.level === 'basic');
sections[basicIdx].code =
  'package arch.day1;\n' +
  '\n' +
  '/**\n' +
  ' * Day 1 basic: static reference tables for JDK vs JRE vs JVM.\n' +
  ' * // In real projects javac lives in JDK; java launches HotSpot.\n' +
  ' * // Staff signal: jcmd and javap also live in the JDK — without them\n' +
  ' * //   you cannot attach to a running JVM for GC diagnostics.\n' +
  ' */\n' +
  'public class Day1Basic {\n' +
  '\n' +
  '    public static void main(String[] args) {\n' +
  '        System.out.println("=== Java platform layers ===");\n' +
  '        System.out.println("JDK  | Development kit  | javac, jar, javadoc, jdb, jcmd, jlink, JVM + libs");\n' +
  '        System.out.println("JRE  | Runtime bundle   | JVM + class libraries (no javac, no jcmd)");\n' +
  '        System.out.println("JVM  | Execution engine | loads bytecode, verifies, JIT-compiles, GC");\n' +
  '        System.out.println();\n' +
  '\n' +
  '        System.out.println("=== Compile vs run commands ===");\n' +
  '        System.out.println("javac Hello.java         -> produces Hello.class bytecode");\n' +
  '        System.out.println("java Hello               -> starts JVM, loads Hello, calls main");\n' +
  '        System.out.println("java Hello.java          -> since Java 11: in-memory compile+run (single file)");\n' +
  '        System.out.println("javap -c Hello.class     -> disassemble bytecode (JDK tool, debugging)");\n' +
  '        System.out.println("jcmd <pid> VM.flags      -> show effective JVM flags at runtime");\n' +
  '        System.out.println();\n' +
  '\n' +
  '        System.out.println("=== main() contract: each keyword has a runtime reason ===");\n' +
  '        System.out.println("public static void main(String[] args)");\n' +
  '        System.out.println("  public  -> launcher can invoke without access restrictions");\n' +
  '        System.out.println("  static  -> no instance required before entry; JVM has no object to construct");\n' +
  '        System.out.println("  void    -> no return value to launcher; exit code via System.exit()");\n' +
  '        System.out.println("  args    -> tokens from CLI after class name");\n' +
  '        System.out.println();\n' +
  '\n' +
  '        System.out.println("=== Key environment variables ===");\n' +
  '        System.out.println("JAVA_HOME  -> JDK root (Gradle, Maven, IntelliJ read this)");\n' +
  '        System.out.println("PATH       -> shell resolution order; javac wins/loses here");\n' +
  '        System.out.println("CLASSPATH  -> fallback classpath (override with -cp at runtime)");\n' +
  '        System.out.println();\n' +
  '\n' +
  '        System.out.println("=== Common prod failures tied to this lesson ===");\n' +
  '        System.out.println("javac missing in CI          -> JRE-only image or PATH lacks JDK/bin");\n' +
  '        System.out.println("ClassNotFoundException       -> classpath or module path wrong");\n' +
  '        System.out.println("UnsupportedClassVersionError -> bytecode newer than runtime JVM");\n' +
  '        System.out.println("NoSuchMethodError: main      -> main typo or wrong modifier");\n' +
  '        System.out.println("VerifyError at class load    -> bad bytecode from code generator (CGLIB/Lombok)");\n' +
  '    }\n' +
  '}';

sections[basicIdx].output =
  '=== Java platform layers ===\n' +
  'JDK  | Development kit  | javac, jar, javadoc, jdb, jcmd, jlink, JVM + libs\n' +
  'JRE  | Runtime bundle   | JVM + class libraries (no javac, no jcmd)\n' +
  'JVM  | Execution engine | loads bytecode, verifies, JIT-compiles, GC\n' +
  '\n' +
  '=== Compile vs run commands ===\n' +
  'javac Hello.java         -> produces Hello.class bytecode\n' +
  'java Hello               -> starts JVM, loads Hello, calls main\n' +
  'java Hello.java          -> since Java 11: in-memory compile+run (single file)\n' +
  'javap -c Hello.class     -> disassemble bytecode (JDK tool, debugging)\n' +
  'jcmd <pid> VM.flags      -> show effective JVM flags at runtime\n' +
  '\n' +
  '=== main() contract: each keyword has a runtime reason ===\n' +
  'public static void main(String[] args)\n' +
  '  public  -> launcher can invoke without access restrictions\n' +
  '  static  -> no instance required before entry; JVM has no object to construct\n' +
  '  void    -> no return value to launcher; exit code via System.exit()\n' +
  '  args    -> tokens from CLI after class name\n' +
  '\n' +
  '=== Key environment variables ===\n' +
  'JAVA_HOME  -> JDK root (Gradle, Maven, IntelliJ read this)\n' +
  'PATH       -> shell resolution order; javac wins/loses here\n' +
  'CLASSPATH  -> fallback classpath (override with -cp at runtime)\n' +
  '\n' +
  '=== Common prod failures tied to this lesson ===\n' +
  'javac missing in CI          -> JRE-only image or PATH lacks JDK/bin\n' +
  'ClassNotFoundException       -> classpath or module path wrong\n' +
  'UnsupportedClassVersionError -> bytecode newer than runtime JVM\n' +
  'NoSuchMethodError: main      -> main typo or wrong modifier\n' +
  'VerifyError at class load    -> bad bytecode from code generator (CGLIB/Lombok)\n';

// ─── 2. EXPAND INTERMEDIATE CODE (48 → 88 lines) ──────────────────────────
const midIdx = sections.findIndex(s => s.type === 'code' && s.level === 'intermediate');
sections[midIdx].code =
  'package arch.day1;\n' +
  '\n' +
  '/**\n' +
  ' * Day 1 intermediate: four labelled scenarios a Staff engineer narrates.\n' +
  ' * // Real JVM would throw; here we print expected exception class names.\n' +
  ' * // Multi-stage Docker builds use JDK for compile and JRE for the final image.\n' +
  ' */\n' +
  'public class Day1Intermediate {\n' +
  '\n' +
  '    static void scenario1() {\n' +
  '        System.out.println("--- Scenario 1: clean compile-and-run narrative ---");\n' +
  '        System.out.println("step A: javac reads .java, resolves types, emits .class bytecode");\n' +
  '        System.out.println("step B: java -cp out Demo starts a new OS process (HotSpot JVM)");\n' +
  '        System.out.println("step C: bytecode verifier accepts stack maps -> no VerifyError");\n' +
  '        System.out.println("step D: static initializers run before main() body");\n' +
  '        System.out.println("step E: main() executes; JIT promotes hot code to native after warmup");\n' +
  '        System.out.println("staff signal: jcmd <pid> VM.flags shows active GC and heap flags");\n' +
  '        System.out.println();\n' +
  '    }\n' +
  '\n' +
  '    static void scenario2() {\n' +
  '        System.out.println("--- Scenario 2: wrong working directory (missing classpath root) ---");\n' +
  '        System.out.println("command:  java com.acme.Demo   (cwd does not contain com/acme tree)");\n' +
  '        System.out.println("result:   ClassNotFoundException or NoClassDefFoundError at launch");\n' +
  '        System.out.println("why:      application class loader searches classpath left-to-right");\n' +
  '        System.out.println("          it cannot find com/acme/Demo.class under any entry");\n' +
  '        System.out.println("fix:      cd to classpath root   OR   pass -cp target/classes");\n' +
  '        System.out.println("verify:   java -verbose:class -cp target/classes com.acme.Demo");\n' +
  '        System.out.println("          look for [Loaded com.acme.Demo from ...] in output");\n' +
  '        System.out.println();\n' +
  '    }\n' +
  '\n' +
  '    static void scenario3() {\n' +
  '        System.out.println("--- Scenario 3: JRE-only CI image (build fails before tests) ---");\n' +
  '        System.out.println("symptom:  mvnw compile exits 127; log says javac not found in PATH");\n' +
  '        System.out.println("cause:    Dockerfile FROM eclipse-temurin:17-jre (no javac binary)");\n' +
  '        System.out.println("fix:      change to eclipse-temurin:17-jdk for build stage");\n' +
  '        System.out.println("          use multi-stage: JDK for compile, JRE for final image");\n' +
  '        System.out.println("verify:   docker run <image> javac -version  ->  javac 17.x.x");\n' +
  '        System.out.println("staff:    ls $JAVA_HOME/bin | grep javac  inside the container");\n' +
  '        System.out.println();\n' +
  '    }\n' +
  '\n' +
  '    static void scenario4() {\n' +
  '        System.out.println("--- Scenario 4: java and javac disagree (JAVA_HOME vs PATH) ---");\n' +
  '        System.out.println("symptom:  java -version prints 21, javac -version prints 17");\n' +
  '        System.out.println("cause:    PATH resolves two JDK installs; Gradle reads JAVA_HOME");\n' +
  '        System.out.println("          Gradle daemon compiled with 17, shell runs 21 launcher");\n' +
  '        System.out.println("fix step 1: type -a java   (bash)  or  where java  (Windows)");\n' +
  '        System.out.println("fix step 2: align JAVA_HOME=<17-root>; export to shell profile");\n' +
  '        System.out.println("fix step 3: reopen terminal; verify both commands agree");\n' +
  '        System.out.println("prevention: Gradle toolchain block pins JDK version in build.gradle");\n' +
  '        System.out.println();\n' +
  '    }\n' +
  '\n' +
  '    public static void main(String[] args) {\n' +
  '        scenario1();\n' +
  '        scenario2();\n' +
  '        scenario3();\n' +
  '        scenario4();\n' +
  '    }\n' +
  '}';

sections[midIdx].output =
  '--- Scenario 1: clean compile-and-run narrative ---\n' +
  'step A: javac reads .java, resolves types, emits .class bytecode\n' +
  'step B: java -cp out Demo starts a new OS process (HotSpot JVM)\n' +
  'step C: bytecode verifier accepts stack maps -> no VerifyError\n' +
  'step D: static initializers run before main() body\n' +
  'step E: main() executes; JIT promotes hot code to native after warmup\n' +
  'staff signal: jcmd <pid> VM.flags shows active GC and heap flags\n' +
  '\n' +
  '--- Scenario 2: wrong working directory (missing classpath root) ---\n' +
  'command:  java com.acme.Demo   (cwd does not contain com/acme tree)\n' +
  'result:   ClassNotFoundException or NoClassDefFoundError at launch\n' +
  'why:      application class loader searches classpath left-to-right\n' +
  '          it cannot find com/acme/Demo.class under any entry\n' +
  'fix:      cd to classpath root   OR   pass -cp target/classes\n' +
  'verify:   java -verbose:class -cp target/classes com.acme.Demo\n' +
  '          look for [Loaded com.acme.Demo from ...] in output\n' +
  '\n' +
  '--- Scenario 3: JRE-only CI image (build fails before tests) ---\n' +
  'symptom:  mvnw compile exits 127; log says javac not found in PATH\n' +
  'cause:    Dockerfile FROM eclipse-temurin:17-jre (no javac binary)\n' +
  'fix:      change to eclipse-temurin:17-jdk for build stage\n' +
  '          use multi-stage: JDK for compile, JRE for final image\n' +
  'verify:   docker run <image> javac -version  ->  javac 17.x.x\n' +
  'staff:    ls $JAVA_HOME/bin | grep javac  inside the container\n' +
  '\n' +
  '--- Scenario 4: java and javac disagree (JAVA_HOME vs PATH) ---\n' +
  'symptom:  java -version prints 21, javac -version prints 17\n' +
  'cause:    PATH resolves two JDK installs; Gradle reads JAVA_HOME\n' +
  '          Gradle daemon compiled with 17, shell runs 21 launcher\n' +
  'fix step 1: type -a java   (bash)  or  where java  (Windows)\n' +
  'fix step 2: align JAVA_HOME=<17-root>; export to shell profile\n' +
  'fix step 3: reopen terminal; verify both commands agree\n' +
  'prevention: Gradle toolchain block pins JDK version in build.gradle\n' +
  '\n';

// ─── 3. EXPAND CONCEPTUAL ANSWERS 1–15 ─────────────────────────────────────
const interview = sections.find(s => s.type === 'interview');

const expanded = [
  {
    q: 'What is the JDK and what tools does it include?',
    a: 'The **JDK** (**Java Development Kit**) is the complete development bundle. It contains `javac` (compiler), `java` (launcher), `jar` (archiver), `javadoc` (documentation generator), `jdb` (debugger), `jcmd` (diagnostic command tool), `jlink` (custom JRE builder), `javap` (bytecode disassembler), `jstat` (GC statistics), and the full standard library. In production, `jcmd` and `javap` are critical diagnostic tools — without the JDK installed on or accessible from a pod, you cannot attach to a running JVM for GC heap inspection or bytecode-level debugging. A CI pipeline built on a JRE-only base image fails at the `javac` step with exit code 127 before any test runs. The fix is switching to a `-jdk` tagged base image (e.g. `eclipse-temurin:17-jdk`). The Staff signal: Gradle 8+ supports toolchain declarations that download and cache the exact JDK version, making builds reproducible independently of the local `JAVA_HOME` setting.',
    fu0a: 'On-call at 2am, you pull `jcmd <pid> GC.heap_info` and `jcmd <pid> VM.flags` to understand heap state and active GC flags. Both commands live in the **JDK**. If the production image is JRE-only, these tools are absent and you are debugging blind. The Staff-level instinct is to always ship a JDK diagnostic layer — either by including the JDK in the debug sidecar or by using a profiling agent that bundles its own diagnostic capabilities.',
    fu1a: 'A common trap: a developer sets `JAVA_HOME` to a JRE path because the full JDK is installed elsewhere on PATH. Maven and Gradle both read `JAVA_HOME` for compiler forks. Maven `mvn compile` succeeds if it falls back to the PATH `javac`, but `-Djava.home` in the compiler fork points to the JRE, causing subtle classpath resolution differences. Check with `mvn --version` — it prints which Java home it is using.'
  },
  {
    q: 'What is the JRE and can you compile Java with only the JRE?',
    a: 'The **JRE** (**Java Runtime Environment**) contains the **JVM**, core class libraries (rt.jar in Java 8, or equivalent modules in Java 9+), property files, and runtime configuration. It does NOT include `javac`, `jcmd`, `javap`, or other development tools. You cannot compile `.java` files with only the JRE. In practice, Docker images tagged `eclipse-temurin:17-jre` are roughly 150MB smaller than `-jdk` equivalents and are suitable for running Spring Boot JARs in production, but any build step that invokes `javac` inside that container fails immediately. The Staff-level pattern is **multi-stage Dockerfiles**: compile in a JDK stage, copy the fat JAR or custom JRE into a JRE or distroless final stage. This reduces the final image size by 40–70% and shrinks the attack surface. Since Java 9, JDK distributions effectively ship what used to be called the JRE — the separate JRE download was discontinued for most vendors. Interviewers still use the JDK/JRE distinction to test conceptual clarity.',
    fu0a: 'In Kubernetes, a JRE-only pod cannot run `jcmd` or `jmap` for heap dumps. The Staff mitigation is attaching a **debug sidecar** with a JDK image sharing the process namespace (`shareProcessNamespace: true` in the pod spec), or using async-profiler as a shared-memory profiler that does not require `jcmd`. Alternatively, set `-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/dumps/` in the application JVM flags so the heap dump is written automatically on OOM.',
    fu1a: 'The most common JRE vs JDK confusion in production: a developer pins `eclipse-temurin:17-jre` in the Dockerfile to save image size, but the application uses a Groovy script engine that compiles Groovy at runtime. Groovy compilation requires `javax.tools.JavaCompiler` which is absent from JRE distributions. The symptom is a runtime `ToolProvider.getSystemJavaCompiler()` returning null. Fix: switch to the JDK image or use Groovy bytecode compilation path that does not need `javax.tools`.'
  },
  {
    q: "What is the JVM's role?",
    a: 'The **JVM** (**Java Virtual Machine**) is the runtime execution engine. It loads `.class` bytecode, runs it through the **bytecode verifier** (which rejects illegal stack shapes before any business logic executes), manages heap and stack memory through a **Garbage Collector**, runs cold code through an **interpreter**, and promotes hot methods to native machine code via **JIT** (C1 then C2 tiers in HotSpot). The JVM is not a black box. `jcmd <pid> VM.flags` shows effective flags at runtime. `jcmd <pid> GC.heap_info` shows current heap state. `jstat -gcutil <pid> 2000 10` streams GC utilization every 2 seconds. These tools matter in production because JVM misconfiguration — wrong GC algorithm, undersized heap, missing `-XX:+UseContainerSupport` in Kubernetes — causes OOMKilled pods or 800ms GC Stop-The-World pauses that appear as p99 latency spikes in Grafana. The JVM is both the correctness guarantee and the first thing to tune when performance degrades.',
    fu0a: 'The bytecode verifier catches malformed `.class` files before execution. A `VerifyError` at class load time almost always comes from a code generator — **CGLIB** (used by Spring AOP), **Lombok**, or a custom annotation processor that emits incorrect stack maps. The symptom is a Spring `ApplicationContext` failing to start with `VerifyError` after a library version upgrade. Debug by temporarily running with `-Xverify:all` (verbose verification) to identify which class fails.',
    fu1a: 'JVM startup involves: parsing flags, creating the heap, loading bootstrap classes, running static initializers for `java.lang` classes, then loading your application class and calling `main`. This is why a Spring Boot application that prints "Starting Application" has already run hundreds of static initializers before you see the first log line. `java -Xlog:class+load*:stdout` traces every class load event during startup — useful when diagnosing why startup is slow.'
  },
  {
    q: 'What is the relationship between .java, .class, and running a program?',
    a: '`.java` is the human-readable source file that `javac` reads. `javac` performs type checking, resolves imports, erases generics, generates bridge methods, and emits one `.class` file per type. The `.class` file contains a **constant pool** (string and type literals), **method bytecode** (JVM instruction sequences), **attribute tables** (stack map frames, debug info, annotations), and a **magic number** (`0xCAFEBABE`) that the JVM verifier checks first. The `java` launcher loads `.class` files via the **application class loader**, runs the **bytecode verifier**, runs **static initializers**, and then invokes `main`. Class loading is **lazy**: only classes actually referenced during execution are loaded. This means a path in production code that references a missing dependency will compile and deploy successfully but throw `NoClassDefFoundError` only when that path is first executed — potentially weeks after deploy. Use `javap -c MyClass.class` to disassemble bytecode and inspect what `javac` actually produced.',
    fu0a: 'In Spring Boot fat JARs, your `Application.class` lives at `BOOT-INF/classes/com/example/Application.class`. Spring Boot\'s `LaunchedURLClassLoader` handles this nesting. If you try to run the JAR with `java -cp app.jar com.example.Application` (bypassing the Spring Boot launcher), you get `ClassNotFoundException` because the nested classpath structure is not visible to the standard application class loader.',
    fu1a: 'Generics erasure means the `.class` file contains `List`, not `List<String>`. Type information is stored as annotations (`@ParameterizedType`) accessible via reflection. Frameworks like Spring and Jackson use reflection to reconstruct generic types from `TypeToken` or `ParameterizedTypeReference` patterns. This is why `objectMapper.readValue(json, List.class)` loses type and produces `List<LinkedHashMap>` instead of `List<MyDto>`, while `objectMapper.readValue(json, new TypeReference<List<MyDto>>(){})` works correctly.'
  },
  {
    q: 'Why is main() declared public static void main(String[] args)?',
    a: 'Each keyword in `public static void main(String[] args)` serves a specific purpose enforced by the **JVM launcher**, not by `javac`. `public` means the launcher can invoke the method without access restrictions across package boundaries. `static` means the JVM can call the method without constructing an instance of the class — the JVM has no mechanism to select a constructor or inject dependencies before entry. `void` means no return value is passed back to the launcher — process exit code is communicated via `System.exit(int)` or process termination. `String[] args` receives command-line tokens. Critically, `javac` does NOT validate that `main` exists on any class — only the `java` launcher does at runtime. A typo like `Main` instead of `main`, or `private` modifier, produces `NoSuchMethodError: main` after the class loads successfully. Since Java 21 (JEP 445, preview), unnamed classes can use `void main()` for single-file programs, but production Spring Boot services still require the canonical signature for compatibility.',
    fu0a: 'A `NoSuchMethodError: main` after a refactor usually means the `main` method signature changed. A common mistake is `public static void main(String args)` (missing array brackets). `javac` accepts this — it is a valid method. The launcher rejects it at runtime. Catch it with a `ProcessBuilder` smoke test in CI that launches the class and checks exit code 0.',
    fu1a: 'Static initializers in the class run before `main`. If a static field initializer throws an `ExceptionInInitializerError`, it propagates as `NoClassDefFoundError` on every subsequent attempt to load the class. This is why database connection pool initialization inside static fields is dangerous: a transient network error at startup permanently prevents the class from loading until the JVM process restarts.'
  },
  {
    q: 'What does "platform independence" mean for Java?',
    a: '**Platform independence** means the same `.class` bytecode file runs on any OS and CPU architecture that has a compatible **JVM** — Linux aarch64, Windows x86, macOS — without recompilation. `javac` compiles once; the JVM handles OS-specific execution through **JIT** compilation to native instructions. The contract is enforced by the **class file format**: every `.class` starts with `0xCAFEBABE`, includes a **major version number** (Java 17 = 61, Java 21 = 65), and the JVM rejects files whose major version exceeds its supported maximum with `UnsupportedClassVersionError`. Platform independence does NOT guarantee identical behavior. File paths differ (Windows uses `\\`), default charset changed to **UTF-8** from Java 17 (previously platform-dependent), locale-sensitive operations differ per OS. Bugs that appear only in Linux CI from Mac development often trace to `Paths.get("a/b")` on Mac versus `Paths.get("a\\b")` assumptions, or `String.getBytes()` without an explicit charset.',
    fu0a: 'GraalVM **native image** breaks platform independence intentionally — it compiles Java bytecode ahead-of-time (AOT) to a single native binary for a specific OS and architecture. The binary starts in milliseconds (no JVM warmup) and uses less memory, but it cannot run on a different OS. This is the trade-off behind Spring Boot native image support: fast startup for serverless/container environments at the cost of portability.',
    fu1a: 'Platform independence interacts with reflection. Reflective field access order is not guaranteed by the JVM specification. Code that iterates `getDeclaredFields()` and assumes a consistent order may work on JDK 8 but produce different field order on JDK 17 because HotSpot changed how it lays out class metadata. Serialization frameworks that depend on field order (some custom binary formats) are affected. The safe approach is to annotate order explicitly or sort fields deterministically.'
  },
  {
    q: 'How do you check that JDK (not only JRE) is installed correctly?',
    a: 'Run `javac -version` and `java -version` from the same shell. If `javac` is missing, either only a JRE is installed or the JDK `bin` directory is not on PATH. Also run `echo $JAVA_HOME` (Linux/Mac) or `echo %JAVA_HOME%` (Windows) and verify that `$JAVA_HOME/bin/javac` exists. The single-command check: `ls $JAVA_HOME/bin | grep -E "javac|jar|jcmd|javap"` — if all four appear, the full JDK toolset is present. On Windows: `dir "%JAVA_HOME%\\bin\\" | findstr "javac jcmd javap"`. A CI agent that passes `java -version` but fails `javac -version` wastes 15–20 minutes of pipeline time before the team discovers the base image is wrong. The fix: switch the Dockerfile `FROM` tag from `-jre` to `-jdk`. After fixing, verify inside the running container with `docker exec <container> javac -version` before merging to main.',
    fu0a: 'Gradle toolchain declarations (Java 8+) eliminate manual JAVA_HOME verification. In `build.gradle`: `java { toolchain { languageVersion = JavaLanguageVersion.of(17) } }`. Gradle downloads and caches the correct JDK automatically from Foojay or a configured toolchain resolver. This makes the build reproducible regardless of what is installed locally or in CI. When toolchain resolution fails, the error message names the exact JDK version that was expected — far more actionable than a missing `javac`.',
    fu1a: 'Some enterprise environments install multiple JDKs via SDKMAN, Homebrew, or system package managers. `type -a java` (bash) lists all `java` executables on PATH in order. The first one wins. When `java -version` and `javac -version` disagree, the cause is usually that one binary comes from a JDK install earlier on PATH while the other is a wrapper from a different install. Fix: reorder PATH or set JAVA_HOME explicitly and source it in `.bashrc`/`.zshrc`.'
  },
  {
    q: 'What is JAVA_HOME and why do build tools use it?',
    a: '**JAVA_HOME** is an environment variable that points to the root directory of a JDK installation — the directory that contains `bin/`, `lib/`, `conf/`, and `include/`. Build tools like **Gradle**, **Maven**, and **Ant** read `JAVA_HOME` to locate the JDK toolchain for compiler forks, rather than relying on PATH ordering, because PATH can change per shell session. If `JAVA_HOME` points to a JRE root while PATH resolves to a JDK `javac`, Gradle uses the JRE fork for compilation and the builds produce bytecode at a lower class file version or fail when JDK-specific APIs are accessed. `mvn --version` prints `Java home:` on the second line — use that to confirm which Java home Maven is actually using. The Staff-level production fix: declare a **Gradle toolchain** in `build.gradle` (`java { toolchain { languageVersion = JavaLanguageVersion.of(17) } }`) — this makes the JDK version explicit and independent of `JAVA_HOME`, ensuring reproducible builds across all developer machines and CI agents.',
    fu0a: '`JDK_JAVA_OPTIONS` is an environment variable that the JVM launcher reads automatically on startup (since Java 9), similar to `JAVA_TOOL_OPTIONS`. If a developer or ops team sets `JDK_JAVA_OPTIONS=-Xmx512m` globally on a server, every `java` invocation on that machine is affected — including short-lived diagnostic tools. Detect with `jcmd <pid> VM.flags | grep MaxHeapSize` on a running process, or `java -XshowSettings:all -version` to see all resolved settings.',
    fu1a: 'On macOS, `/usr/libexec/java_home -v 17` prints the canonical path to the Java 17 JDK home. This is how `brew`-installed JDKs and system JDKs co-exist. Scripts should call `export JAVA_HOME=$(/usr/libexec/java_home -v 17)` rather than hardcoding a path, because Homebrew paths change across major versions. CI workflows on GitHub Actions use `setup-java` action which sets both `JAVA_HOME` and `PATH` correctly for the declared Java version.'
  },
  {
    q: 'What happens if the public class name does not match the file name?',
    a: '`javac` enforces that a `public` class named `Foo` must be in a file named `Foo.java`. If they differ, `javac` exits with `class Foo is public, should be declared in a file named Foo.java` before producing any `.class` output. This is a compile-time rule, not a runtime rule. The JVM itself has no such restriction — it loads `.class` by binary name without caring about the source file. Non-public classes in the same file can have any name. A file `Util.java` may contain `class Helper {}` (package-private) alongside `public class Util {}` without issue. In practice, this error surfaces in batch code generation tools (template engines, annotation processors, or AI code generators) that emit `.java` files with mismatched names. The symptom in CI is an immediate `javac` failure with a clear error, not a runtime crash. Catch it early: most IDEs flag this instantly, and checkstyle rules enforce class-filename alignment for public types.',
    fu0a: 'Inner classes produce `Outer$Inner.class` files. Anonymous classes produce `Outer$1.class`, `Outer$2.class`. Lambda classes produce `Outer$$Lambda$1.class` (HotSpot) or similar synthetic names. This is why fat JARs sometimes contain hundreds of `$` files — they are all valid class files. `javap -c Outer.class` does not show inner class bytecode; you need `javap -c "Outer\\$Inner.class"`.',
    fu1a: 'When refactoring a class to a different package, the file must move to the matching directory. `javac` does not care about directory structure for non-public types, but the `java` launcher requires directory structure to match the package name when loading from a directory-based classpath. A class `com.example.Foo` must be at `com/example/Foo.class` relative to the classpath root. Build tools like Gradle handle this automatically by outputting to `build/classes/java/main`.'
  },
  {
    q: 'What is the difference between compiling with javac and running with java?',
    a: '`javac` is a **static analysis and translation** tool. It reads `.java` source, builds an AST, resolves symbol references against the compile classpath, checks types, erases generics, generates bridge methods, and emits `.class` bytecode. No application code runs during compilation. `java` is the **launcher** that starts a JVM process, loads bytecode via class loaders, verifies it, and executes method instructions. A critical difference: `javac` resolves all import symbols at compile time, but the JVM resolves class dependencies **lazily** at the moment each class is first referenced at runtime. This means a class that compiles cleanly against a JAR dependency can deploy to production and throw `NoClassDefFoundError` only when the first request reaches the code path that references the missing class — potentially weeks after deploy. This lazy loading behavior makes comprehensive integration tests critical: `ClassNotFoundException` at a unit test boundary during CI is far better than `NoClassDefFoundError` under production load at 3am.',
    fu0a: '`java -verbose:class 2>&1 | grep "Loaded com.example"` traces which JAR provided each class. This is the correct first tool when `ClassNotFoundException` appears but the class is believed to be on the classpath. The output shows `[Loaded com.example.Foo from file:/path/to/app.jar]`. If the class is loaded from an unexpected JAR (classpath shadowing), this reveals the conflict immediately.',
    fu1a: 'The compile classpath and the runtime classpath are conceptually separate in Maven and Gradle. A class present on the compile classpath (e.g. `compileOnly` in Gradle) is available during `javac` but absent at runtime. If the code path that references it executes in production, `NoClassDefFoundError` follows. Gradle\'s `compileOnly` is intended for compile-time annotation processors and provided APIs (servlet containers provide `javax.servlet` at runtime). Using it for non-provided dependencies is a correctness bug that survives compilation and unit testing.'
  },
  {
    q: 'Can two JVM versions behave differently for the same bytecode?',
    a: 'Yes. **Bytecode** is a specification, not a guarantee of identical behavior across JVM versions or vendors. JVM implementations differ in: **GC pause behavior** (G1 in Java 8 vs Java 17 has different default region sizes and tuning), **JIT optimization decisions** (code that runs faster on Java 11 may be slower on Java 21 if deoptimization occurs on a new optimization path), **default charset** (changed to **UTF-8** from Java 17; before that, it was the platform default), **thread stack sizes**, and **security policy defaults**. JVM vendor differences (OpenJDK, GraalVM, Amazon Corretto, Azul Zulu) can produce different performance characteristics under identical load. The production implication: migrating from Java 17 to Java 21 requires performance regression testing under realistic load, not just correctness tests. Use `jcmd <pid> VM.version` to confirm which JVM version is running in production — not what is in the Dockerfile, which may be overridden by a sidecar or init container.',
    fu0a: 'String formatting changed subtly between JDK versions. Java 9+ uses `invokedynamic` for string concatenation instead of `StringBuilder` chains. This is a JIT-level change: same bytecode major version, different performance profile. Microbenchmarks that measure string concatenation must be run on the target JVM version. JMH (Java Microbenchmark Harness) with the correct JVM fork policy is the only reliable tool for this.',
    fu1a: '`-XX:+UseContainerSupport` behavior differs between Java 8u191+ and Java 11. Before 8u191, the JVM read host memory from `/proc/meminfo` and calculated heap as 25% of host RAM — ignoring Kubernetes container limits. A 64GB node with a 2GB container limit would get a 16GB heap, causing OOMKill. After 8u191, container support is on by default but must be verified with `jcmd <pid> VM.flags | grep UseContainerSupport` inside the actual running pod.'
  },
  {
    q: 'What is classpath and when does it matter?',
    a: '**Classpath** is an ordered list of directories, JAR files, and ZIP archives that the **application class loader** searches when loading a class by binary name. It is specified via `-cp` or `-classpath` flag on the `java` command, or via the `CLASSPATH` environment variable (the flag overrides the variable). The loader searches entries **left to right** and returns the first match — duplicate classes shadow later entries silently. Spring Boot fat JARs use a custom `LaunchedURLClassLoader` that handles nested JARs to prevent classpath shadowing across dependencies. Classpath matters in production when: (1) dependency JARs contain the same class (logging framework conflicts — `log4j-over-slf4j` and `slf4j-over-log4j` on the same classpath create infinite delegation loops); (2) WAR deployments mix container-provided JARs with application JARs; (3) agent JARs are injected via `-javaagent` and need to see application classes. Use `java -verbose:class 2>&1 | grep <className>` to trace exactly which entry provided a class.',
    fu0a: 'The `CLASSPATH` environment variable is a global default that affects every `java` invocation on the host. Leaving it set with old paths causes confusing `NoClassDefFoundError` in new projects. Best practice: never rely on `CLASSPATH`; always pass `-cp` explicitly in scripts and Dockerfiles. CI pipelines inherit the agent environment, so a stale `CLASSPATH` from a previous job can poison the next job on the same agent.',
    fu1a: 'Shadow classpath conflicts are notoriously hard to debug. `java -verbose:class` is too verbose for production. A better approach: `jar tf app.jar | grep ClassName` to find which JARs inside the fat JAR contain a class. For Maven projects, `mvn dependency:tree` reveals transitive dependencies. For Gradle: `gradle dependencies --configuration runtimeClasspath`. If two JARs provide `org/slf4j/LoggerFactory.class`, the one listed first on the classpath wins.'
  },
  {
    q: 'What is JIT compilation in the JVM?',
    a: '**JIT** (**Just-In-Time**) compilation is HotSpot\'s adaptive optimization layer. The JVM starts by **interpreting** bytecode. It tracks **invocation counters** and **loop back-edges** per method. When a method\'s counter exceeds a threshold (default ~10,000 for C2), HotSpot queues it for compilation. **C1** (client compiler) compiles quickly with moderate optimization. **C2** (server compiler) compiles slowly with aggressive inlining, loop unrolling, and escape analysis — this is the tier that produces JVM performance comparable to C++. Deoptimization returns a method to the interpreter if a speculative assumption breaks (e.g., the class hierarchy changes after a monomorphic call site optimization). **Production consequence**: a freshly deployed service under load shows elevated CPU for 3–5 minutes while JIT compiles hot paths — this is normal **JVM warmup**. Load tests run before warmup completes measure interpreter performance, not steady-state. p50 latency during warmup can be 3–5x higher. **Staff signal**: async-profiler in JFR mode captures JIT compilation events and flamegraphs of both interpreter and native frames without significant overhead.',
    fu0a: 'Deoptimization causes a brief performance dip visible as a spike in async-profiler flamegraphs labeled `Deoptimization`. Common causes: a `@Override` method is added to a class hierarchy that HotSpot had already optimized as monomorphic (single-type dispatch). Spring\'s CGLIB proxies add subclasses at runtime — if a class was optimized before the proxy was registered, deoptimization occurs at proxy creation. This is one reason Spring Boot startup emits a brief CPU spike before the context is fully initialized.',
    fu1a: '`-XX:+PrintCompilation` logs every JIT compilation event with method name and compilation tier. This flag is production-safe but verbose. In JFR, enable the `jdk.Compilation` event to capture the same data with timestamps. Use `jcmd <pid> Compiler.queue` to inspect the pending compilation queue. If the queue is long at startup, it means the service receives traffic before JIT has warmed up — consider preloading common code paths with a warmup endpoint before shifting traffic in a canary deployment.'
  },
  {
    q: 'What does bytecode verification do?',
    a: '**Bytecode verification** is a safety gate inside the JVM that runs before any method executes. The **verifier** checks that: operand stack types match the expected types for each instruction, no stack overflow or underflow occurs at any reachable branch, local variables are assigned before use with the correct type, and all branch targets point to valid instruction offsets. This prevents malformed `.class` files — from a compromised JAR, a buggy code generator, or a corrupted download — from corrupting JVM memory or bypassing type safety. The verifier runs using **StackMapTable** attributes introduced in Java 6 (class file major version 50). Without stack maps, verification uses the older expensive algorithm; with them, it is an O(n) single pass. **Production consequence**: a `VerifyError` at class load time almost always comes from a code generator — CGLIB (Spring AOP proxies), Lombok, a custom annotation processor, or a bytecode manipulation library like ASM or Byte Buddy — emitting incorrect stack maps after a version upgrade.',
    fu0a: '`-Xverify:none` disables bytecode verification entirely. Some JVM startup optimization guides recommend this for trusted codebases, claiming ~5% faster startup. This is never acceptable in production — it removes the safety gate that prevents corrupted bytecode from reaching the interpreter. GraalVM native image applies verification offline during `native-image` compilation and can produce unverified native code safely, because the output is not dynamically loaded.',
    fu1a: '`javap -verbose MyClass.class` prints the `StackMapTable` for each method. Each frame describes the expected type state at a branch target. A mismatch between what the code generator wrote and what the verifier expects causes `VerifyError: bad type on operand stack`. Debugging: run with `-Xverify:all` (full verification even for trusted code) and enable `-Xlog:verification*:stdout` to see which class fails and why. Then file an issue against the code generator library with the javap output.'
  },
  {
    q: 'What is the difference between classpath and module path (Java 9+)?',
    a: 'The **classpath** provides weak encapsulation: every public class in every JAR is reachable from every other JAR, regardless of intent. The **module path** enforces module-level encapsulation via `module-info.java`: a module must explicitly `exports` packages for other modules to access them, and must `requires` the modules it depends on. Unexported packages are inaccessible via reflection by default — `InaccessibleObjectException` is thrown. The module path also enables `jlink` to produce minimal custom JRE images containing only the required modules. **Production consequence**: migrating a large Spring Boot application from classpath to module path requires auditing all reflective access, because Spring heavily uses reflection to create beans, set fields, and invoke lifecycle methods. Without `opens` declarations, Spring fails at context startup. **Staff signal**: the practical migration path for most enterprise services is to keep classpath mode and add `--add-opens` JVM flags where needed, rather than a full JPMS migration. Spring Boot 3 supports both modes.',
    fu0a: 'The `--add-opens` flag grants reflective access to a specific package from a specific module without adding a module dependency. Format: `--add-opens java.base/java.lang=ALL-UNNAMED` grants reflective access to `java.lang` for all unnamed module (classpath) code. Spring Boot\'s fat JAR launcher adds these flags automatically for known Spring modules. When you see `InaccessibleObjectException` in a Spring app, check whether the `--add-opens` for the affected module is missing from the JVM flags.',
    fu1a: 'ServiceLoader with the module system enables a clean plugin architecture. A service interface is `exports`-ed from a module. Implementations are in separate modules that `provides` the interface. `ServiceLoader.load(MyService.class)` discovers all registered implementations at runtime. This replaces the old `META-INF/services/` SPI mechanism with compile-time-checked declarations. Spring Boot auto-configuration uses the old SPI via `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports` — this is a classpath-mode mechanism, not JPMS-aware.'
  }
];

// Apply expanded answers
expanded.forEach(({ q, a, fu0a, fu1a }) => {
  const match = interview.conceptual.find(c => c.question === q);
  if (match) {
    match.answer = a;
    if (match.followUps && match.followUps.length >= 2) {
      match.followUps[0].answer = fu0a;
      match.followUps[1].answer = fu1a;
    }
  }
});

// ─── 4. EXPAND SENIOR SCENARIO ANSWERS ─────────────────────────────────────
const ssExpanded = [
  {
    q: 'CI builds with Java 11 but developers use Java 17 locally. What do you standardize?',
    extra: '\n\nAt scale this mismatch creates two classes of bugs. First, Java 17 enables stricter reflective access by default — code that uses `Field.setAccessible(true)` without `--add-opens` works on Java 11 but fails with `InaccessibleObjectException` on Java 17. Developers do not see this because their IDEs and local builds run Java 17 correctly, but CI on Java 11 also does not catch it — the bug surfaces only when a Java 17 production deploy exposes a code path that Java 11 never hit. Second, Java 17 changes the default `String.getBytes()` charset to UTF-8. On a Java 11 CI agent running on a non-UTF-8 locale, byte arrays differ, breaking serialization assumptions silently. The Gradle toolchain declaration is the correct fix: it makes the JDK version explicit in the build script (`java { toolchain { languageVersion = JavaLanguageVersion.of(17) } }`) and downloads the exact version automatically. This eliminates JAVA_HOME drift across agents and developer machines permanently.'
  },
  {
    q: 'A service fails at startup: "Error: Could not find or load main class". What do you check?',
    extra: '\n\nThe full diagnostic checklist at Staff level: (1) Confirm the fully-qualified class name matches the package declaration — `java com.example.App` requires the class to be in `com/example/App.class` relative to the classpath root. (2) Run `jar tf app.jar | grep App.class` to confirm the class is inside the JAR. (3) Check the `MANIFEST.MF` Main-Class attribute with `jar xf app.jar META-INF/MANIFEST.MF && cat META-INF/MANIFEST.MF`. (4) For Spring Boot fat JARs, the Main-Class is `org.springframework.boot.loader.JarLauncher`, not your application class — your class is in `Start-Class`. Running with `java -cp` instead of `java -jar` bypasses the Spring Boot launcher entirely, making `BOOT-INF/classes` invisible. This is the most common cause of "Could not find or load main class" when the JAR was built correctly but launched incorrectly.'
  },
  {
    q: "Someone installed JDK but terminal still says javac is not recognized (Windows). Walk through your diagnosis.",
    extra: '\n\nAt Staff level, PATH debugging on Windows has a known subtlety: user PATH and system PATH are separate, and the Windows installer sometimes adds JDK to system PATH only. A terminal opened before the install does not inherit the new PATH. A terminal opened in a non-admin context may not see system PATH additions. The full diagnostic: (1) Open a new terminal as administrator and run `javac -version`. (2) Run `where java` and `where javac` — if they resolve to different paths, there are conflicting installs. (3) Check `echo %PATH%` for path entries containing Java, and check `echo %JAVA_HOME%`. (4) If SDKMAN, Chocolatey, or scoop installed a JDK alongside the manual install, the package manager\'s shim may intercept `javac`. Remove or reorder. The prevention: use a single JDK install managed by SDKMAN (bash on WSL) or Scoop (PowerShell) and declare toolchains in Gradle rather than relying on PATH.'
  },
  {
    q: 'You need to run the same JAR on Linux servers with different Java patch versions. What risks do you evaluate?',
    extra: '\n\nThe evaluation framework at Principal level covers three risk dimensions. First, **API risk**: patch versions within the same major version (17.0.x) are ABI-compatible — no new APIs, no removals. The risk is zero for standard library usage. Second, **behavior risk**: GC bug fixes and JIT changes ship in patch releases. A patch that fixes a GC correctness bug may change pause timing, exposing a latency regression. Run a 30-minute load test on the new patch before full rollout. Third, **security risk**: patch releases contain CVE fixes. Running older patches exposes known vulnerabilities. The Staff recommendation: always run the latest patch for a given LTS major version in production. Use `jcmd <pid> VM.version` (not the Dockerfile) to confirm the exact patch version running in each pod. Kubernetes node pool upgrades may not update JVM patch versions inside containers — the container image is the source of truth.'
  },
  {
    q: "How do you explain JVM vs JDK to a non-technical stakeholder?",
    extra: '\n\nThe extended stakeholder framing that wins budget and credibility: connect each component to a business outcome the stakeholder cares about. The JVM is not an abstract concept — it is what determines whether the payment service can handle 50,000 orders per minute without 3am outages. Tuning the JVM (correct GC algorithm, container-aware heap sizing, enabling UseContainerSupport) reduced our p99 latency from 800ms to under 100ms without new hardware. The JDK is not just developer tooling — without the diagnostic tools it contains (jcmd, javap, jstat), the team cannot diagnose a memory leak in production without restarting the service. Budget the JDK. For Kubernetes teams that want to minimize image size, the correct answer is "JDK for the debug sidecar, JRE or distroless for the production container" — not "remove the JDK from everything."'
  },
  {
    q: 'Several JDKs are installed; `java -version` differs from `javac -version` on a dev machine. What is the root cause and fix?',
    extra: '\n\nThe root cause at Staff level is almost always one of three patterns. Pattern A: a package manager (Homebrew, Chocolatey, SDKMAN) manages one JDK while another was installed manually and appears earlier on PATH. Fix: `type -a java` (bash) lists all `java` on PATH in order; identify and remove or reorder the conflicting entry. Pattern B: JAVA_HOME points to a different JDK than PATH resolves. Build tools (Gradle, Maven) use JAVA_HOME for compiler forks; the interactive shell uses PATH. Fix: `export JAVA_HOME=$(type -a java | head -1 | cut -d" " -f3 | xargs dirname | xargs dirname)`. Pattern C: IntelliJ or another IDE set its own JAVA_HOME in a launch script. Verify with `ps aux | grep java` on a running Gradle daemon — the process environment shows the actual JAVA_HOME the daemon used. Prevention: Gradle toolchain in `build.gradle` is the only production-grade fix because it makes the JDK version explicit and downloaded reproducibly.'
  }
];

ssExpanded.forEach(({ q, extra }) => {
  const match = interview.seniorScenario.find(s => s.question.startsWith(q.substring(0, 40)));
  if (match) {
    match.answer += extra;
  }
});

// ─── 5. ADD JOB SWITCH BLOCK ────────────────────────────────────────────────
interview.jobSwitch = {
  resumeBullet:
    'Audited JVM configuration across 12 production services in week 2 at a new company; ' +
    'identified JRE-only CI images causing compile failures and misaligned JAVA_HOME causing ' +
    'silent version drift; migrated all services to Gradle toolchain declarations, eliminating ' +
    'cross-environment JDK mismatch incidents.',
  interviewPositioning:
    'In your first week, run `javac -version` and `java -version` on every CI agent and production pod — ' +
    'mismatches are common and fixing them in week 2 signals Staff-level instincts. ' +
    'Frame it as observability: "I cannot reason about production without knowing exactly which JVM version ' +
    'and flags are active; `jcmd <pid> VM.version` and `jcmd <pid> VM.flags` are the first tools I check."',
  starAnchor:
    'Situation: CI pipeline on a monorepo failed intermittently with UnsupportedClassVersionError ' +
    'after library updates compiled against Java 17 while CI agents ran Java 11. ' +
    'Task: eliminate the version mismatch and prevent recurrence across 40 developer machines and 6 CI agents. ' +
    'Action: added Gradle toolchain declarations to all 12 service build files, pointed Gradle to Foojay ' +
    'resolver for JDK downloads, removed hardcoded JAVA_HOME from CI agent configuration. ' +
    'Result: zero JDK version mismatch incidents in 6 months post-migration; onboarding time for new ' +
    'developers reduced from 2 hours to 15 minutes.'
};

// ─── 6. WRITE FILE ─────────────────────────────────────────────────────────
writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf8');
console.log('Written:', filePath);

// Verify
const out = JSON.parse(readFileSync(filePath, 'utf8'));
const iv = out.sections.find(s => s.type === 'interview');
const codes = out.sections.filter(s => s.type === 'code');
console.log('Conceptual answers word counts (first 5):',
  iv.conceptual.slice(0,5).map(c => c.answer.split(/\s+/).length));
console.log('SeniorScenario word counts:',
  iv.seniorScenario.map(s => s.answer.split(/\s+/).length));
console.log('JobSwitch:', !!iv.jobSwitch);
console.log('Code lines:', codes.map(c => c.code.split('\n').length));
console.log('File size:', JSON.stringify(out).length, 'chars');
