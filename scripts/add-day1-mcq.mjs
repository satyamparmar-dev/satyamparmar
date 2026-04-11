import { readFileSync, writeFileSync } from 'fs';

const FILE = 'public/data/days/phase1-day1.json';
const day = JSON.parse(readFileSync(FILE, 'utf8'));

const mcqSection = {
  type: 'mcq',
  title: 'MCQ — Introduction to Java: JDK vs JRE vs JVM',
  description: '30 questions across Basic, Intermediate, and Advanced levels covering JDK components, JVM internals, class loading, JIT, bytecode, and production diagnostics.',
  questions: [
    // ─── BASIC (8) ───────────────────────────────────────────
    {
      id: 1,
      level: 'basic',
      category: 'theory',
      question: 'Which component do you need to **compile** a Java source file into bytecode?',
      options: {
        A: 'JRE (Java Runtime Environment)',
        B: 'JVM (Java Virtual Machine)',
        C: 'JDK (Java Development Kit)',
        D: 'JLink'
      },
      answer: 'C',
      explanation: 'The JDK bundles `javac` (the compiler). JRE and JVM only provide a runtime; they cannot compile `.java` files. JLink is a JDK tool for creating custom runtime images, not for compiling.'
    },
    {
      id: 2,
      level: 'basic',
      category: 'theory',
      question: 'What file extension does `javac` produce from a `.java` source file?',
      options: {
        A: '.exe',
        B: '.class',
        C: '.jar',
        D: '.obj'
      },
      answer: 'B',
      explanation: '`javac` compiles Java source into `.class` files containing platform-independent bytecode. `.jar` files are ZIP archives of many `.class` files, not the direct output of a single compilation.'
    },
    {
      id: 3,
      level: 'basic',
      category: 'theory',
      question: 'Which command checks the version of the Java runtime installed on your machine?',
      options: {
        A: 'javac -version',
        B: 'java --check',
        C: 'java -version',
        D: 'jvm -version'
      },
      answer: 'C',
      explanation: '`java -version` prints the runtime version. `javac -version` prints the compiler version — both should match. There is no `jvm` binary; `java` is the launcher that starts the JVM.'
    },
    {
      id: 4,
      level: 'basic',
      category: 'theory',
      question: 'What is the purpose of `JAVA_HOME`?',
      options: {
        A: 'Stores compiled class files',
        B: 'Points to the JDK installation directory used by build tools',
        C: 'Specifies the main class to run',
        D: 'Sets the heap size for the JVM'
      },
      answer: 'B',
      explanation: '`JAVA_HOME` is an environment variable that Maven, Gradle, and many IDEs read to locate the JDK. Setting it incorrectly causes build failures even when `java` appears on PATH from a different installation.'
    },
    {
      id: 5,
      level: 'basic',
      category: 'theory',
      question: 'Why must a public class named `Calculator` be saved in a file called `Calculator.java`?',
      options: {
        A: 'It is a convention but not enforced by the compiler',
        B: 'The JVM requires it at runtime for class loading',
        C: 'The compiler enforces that the file name matches the public class name',
        D: 'Only Maven enforces this, not `javac`'
      },
      answer: 'C',
      explanation: '`javac` enforces that the file name matches the public class name — mismatches produce a compile error: "class Calculator is public, should be declared in a file named Calculator.java". This is a compiler rule, not just a convention.'
    },
    {
      id: 6,
      level: 'basic',
      category: 'theory',
      question: 'Which statement about the JRE is correct?',
      options: {
        A: 'JRE includes `javac` so you can compile Java code',
        B: 'JRE provides a runtime to execute Java programs but not a compiler',
        C: 'JRE and JDK are identical; only the name differs',
        D: 'JRE is only available on Windows'
      },
      answer: 'B',
      explanation: 'JRE = JVM + standard libraries. It lets users run compiled Java applications but lacks developer tools like `javac`, `jdb`, or `jcmd`. From JDK 11+ Oracle no longer ships a separate JRE download; the JDK is the baseline.'
    },
    {
      id: 7,
      level: 'basic',
      category: 'code',
      question: 'What does this command do?\n```bash\njavac Hello.java && java Hello\n```',
      options: {
        A: 'Compiles Hello.java, then runs the compiled bytecode',
        B: 'Compiles and runs in a single pass without creating a .class file',
        C: 'Only compiles — `java Hello` opens a GUI',
        D: 'Creates a JAR and then executes it'
      },
      answer: 'A',
      explanation: '`javac Hello.java` creates `Hello.class`. `java Hello` launches the JVM and calls the `main` method in `Hello.class`. From Java 11+, `java Hello.java` (source-file mode) can skip the explicit `javac` step, but the two-command form still creates the `.class` file explicitly.'
    },
    {
      id: 8,
      level: 'basic',
      category: 'theory',
      question: 'What does "platform independence" mean for Java bytecode?',
      options: {
        A: 'Java programs never need OS-specific system calls',
        B: 'The same .class file can run on any OS with a compatible JVM without recompilation',
        C: 'Java programs run equally fast on every platform',
        D: 'Bytecode is converted to JavaScript to run in browsers'
      },
      answer: 'B',
      explanation: 'Bytecode is an OS-neutral instruction set; any JVM that implements the JVM Specification can execute the same `.class` file on Windows, Linux, or macOS. Caveats: JNI native libraries and OS-specific APIs break portability. Performance varies by JVM and hardware.'
    },

    // ─── INTERMEDIATE (12) ───────────────────────────────────
    {
      id: 9,
      level: 'intermediate',
      category: 'theory',
      question: 'In the JVM class-loader hierarchy, which loader loads `java.lang.String`?',
      options: {
        A: 'Application ClassLoader',
        B: 'Platform (Extension) ClassLoader',
        C: 'Bootstrap ClassLoader',
        D: 'Custom ClassLoader'
      },
      answer: 'C',
      explanation: 'The Bootstrap ClassLoader (implemented in native code, not Java) loads core Java API classes from `rt.jar` / `java.base` module — including `java.lang.String`. Parent-delegation ensures your class can never shadow `java.lang.String` because Bootstrap always wins.'
    },
    {
      id: 10,
      level: 'intermediate',
      category: 'theory',
      question: 'What is the "parent-delegation model" in class loading?',
      options: {
        A: 'Child loaders load classes first, then fall back to parents',
        B: 'Each loader delegates loading to its parent before trying itself',
        C: 'Bootstrap loader delegates everything to the Application loader',
        D: 'Every class is loaded by all loaders simultaneously'
      },
      answer: 'B',
      explanation: 'Before a ClassLoader attempts to load a class, it asks its parent. If the parent succeeds, the child is never involved. This guarantees that core JDK classes cannot be replaced by user code, preventing security exploits like shadowing `java.security.SecureRandom`.'
    },
    {
      id: 11,
      level: 'intermediate',
      category: 'theory',
      question: 'What does the JVM\'s bytecode verifier check when loading a class?',
      options: {
        A: 'That the source code follows Google Java Style Guide',
        B: 'That the bytecode is structurally valid: no stack overflows, legal type casts, no uninitialized reads',
        C: 'That the .class file was compiled with the same `javac` version as the JVM',
        D: 'That all methods have Javadoc comments'
      },
      answer: 'B',
      explanation: 'The verifier enforces JVM Specification safety rules on the bytecode itself — not source-level style. It checks stack depth consistency (StackMapTable), that every field access is type-compatible, and that no uninitialized references are used. `VerifyError` at runtime means a framework (e.g., CGLIB, Lombok) generated invalid bytecode.'
    },
    {
      id: 12,
      level: 'intermediate',
      category: 'code',
      question: 'What error does the JVM throw when a class compiled against Java 17 is run on a Java 11 JVM?',
      options: {
        A: 'ClassNotFoundException',
        B: 'UnsupportedClassVersionError',
        C: 'VerifyError',
        D: 'LinkageError'
      },
      answer: 'B',
      explanation: '`UnsupportedClassVersionError` is thrown when the `.class` major version number (61 for Java 17, 55 for Java 11) exceeds what the running JVM supports. Fix: align the compile `--release` flag with the JVM version, or upgrade the JVM. `ClassNotFoundException` means the file is missing, not version-mismatched.'
    },
    {
      id: 13,
      level: 'intermediate',
      category: 'theory',
      question: 'Which two JIT compiler tiers does HotSpot use, and what is each optimised for?',
      options: {
        A: 'C0 (interpreter) and C1 (native code) — both optimise for throughput',
        B: 'C1 (fast compilation, quick start) and C2 (heavy optimisation, peak throughput)',
        C: 'C1 (garbage collection) and C2 (memory allocation)',
        D: 'C1 (server mode) and C2 (client mode)'
      },
      answer: 'B',
      explanation: 'C1 (Client compiler) compiles quickly with basic optimisations — good for startup. C2 (Server compiler) applies aggressive optimisations (loop unrolling, escape analysis, inlining) after profiling hot paths — good for peak throughput. Tiered Compilation (default since Java 8) uses C1 first, then promotes to C2.'
    },
    {
      id: 14,
      level: 'intermediate',
      category: 'code',
      question: 'What does `javap -c Hello` show?',
      options: {
        A: 'Java source code of Hello.java',
        B: 'JVM bytecode instructions for Hello.class',
        C: 'The runtime heap contents of a running Hello process',
        D: 'Compilation errors from Hello.java'
      },
      answer: 'B',
      explanation: '`javap -c` disassembles `.class` files into human-readable JVM bytecode mnemonics (e.g., `iconst_1`, `iadd`, `invokevirtual`). Staff engineers use it to verify that compiler optimisations (e.g., string concatenation strategy, switch table vs lookup) occurred as expected.'
    },
    {
      id: 15,
      level: 'intermediate',
      category: 'theory',
      question: 'What memory region stores class metadata (method names, field types, constant pool) in Java 8+?',
      options: {
        A: 'Young Generation heap',
        B: 'PermGen (Permanent Generation)',
        C: 'Metaspace (native memory)',
        D: 'Code Cache'
      },
      answer: 'C',
      explanation: 'Java 8 replaced PermGen with Metaspace, which grows in native (off-heap) memory by default. PermGen had a fixed upper bound causing `OutOfMemoryError: PermGen space` on large deployments. Metaspace is bounded by `-XX:MaxMetaspaceSize`; without it, a classloader leak will consume all native memory.'
    },
    {
      id: 16,
      level: 'intermediate',
      category: 'theory',
      question: 'What is the classpath and when does it matter?',
      options: {
        A: 'The directory where `.java` source files are stored',
        B: 'A list of directories and JARs where the JVM looks for `.class` files at runtime',
        C: 'The path to the JDK installation on disk',
        D: 'An environment variable only used by Maven'
      },
      answer: 'B',
      explanation: 'Classpath tells both `javac` and `java` where to find compiled classes and library JARs. A missing classpath entry causes `ClassNotFoundException` at runtime. Maven/Gradle manage classpath automatically; manual `-cp` is needed for one-off runs or legacy scripts.'
    },
    {
      id: 17,
      level: 'intermediate',
      category: 'code',
      question: 'A CI pipeline compiles with `javac --release 17` but the Docker image runs `java 11`. What happens at startup?',
      options: {
        A: 'The app starts but prints a deprecation warning',
        B: 'Java 11 automatically down-compiles the bytecode at startup',
        C: 'The JVM throws `UnsupportedClassVersionError` before `main()` runs',
        D: 'Only the classes that use Java 17 features fail; others load fine'
      },
      answer: 'C',
      explanation: 'The JVM checks the `.class` major version at load time, before executing any user code. Version 61 (Java 17) > 55 (Java 11), so the JVM immediately throws `UnsupportedClassVersionError`. There is no automatic downgrade; you must align the compile target and runtime version.'
    },
    {
      id: 18,
      level: 'intermediate',
      category: 'theory',
      question: 'What is the difference between the module path (`--module-path`) and the classpath?',
      options: {
        A: 'They are identical; `--module-path` is just an alias introduced in Java 9',
        B: 'Module path is for JPMS modules that declare `module-info.class`; classpath is for unnamed-module JARs',
        C: 'Module path is faster because the JVM skips bytecode verification for modules',
        D: 'Classpath only works on Windows; module path works cross-platform'
      },
      answer: 'B',
      explanation: 'Java Platform Module System (Java 9+) introduced `--module-path` for JARs containing `module-info.class`. These modules declare explicit `requires`/`exports`, giving strong encapsulation. Regular JARs without `module-info` go on the classpath as the "unnamed module". Most Spring Boot / Jakarta EE apps still use the classpath.'
    },
    {
      id: 19,
      level: 'intermediate',
      category: 'code',
      question: 'Which Gradle build file snippet ensures the project always compiles and runs with JDK 17, regardless of `JAVA_HOME`?',
      options: {
        A: '```groovy\nsourceCompatibility = "17"\n```',
        B: '```groovy\njava { toolchain { languageVersion = JavaLanguageVersion.of(17) } }\n```',
        C: '```groovy\ncompileJava.options.release = 17\n```',
        D: '```groovy\nsystem.setProperty("java.version", "17")\n```'
      },
      answer: 'B',
      explanation: 'Gradle toolchain declaration (`java { toolchain { ... } }`) tells Gradle to download or locate the correct JDK version, completely overriding `JAVA_HOME`. `sourceCompatibility` only controls language-level syntax, not the actual JDK binary used, so JAVA_HOME drift still silently causes problems.'
    },
    {
      id: 20,
      level: 'intermediate',
      category: 'theory',
      question: 'What does `jcmd <pid> VM.flags` output?',
      options: {
        A: 'All Java source files loaded by the JVM',
        B: 'Active JVM flags — both those set via command line and defaults chosen by ergonomics',
        C: 'A thread dump of all running threads',
        D: 'The classpath used by the running process'
      },
      answer: 'B',
      explanation: '`jcmd VM.flags` is a Staff-level first step during on-call: it reveals the heap sizes, GC algorithm, and any non-default flags the JVM chose via ergonomics. Many JVM flags differ between JDK 11 and 17 defaults (G1GC became default in Java 9). Compare `VM.flags` on a broken pod vs a healthy one to find configuration drift.'
    },

    // ─── ADVANCED (10) ───────────────────────────────────────
    {
      id: 21,
      level: 'advanced',
      category: 'scenario',
      question: 'After a library upgrade, tests pass locally (Java 17) but fail in CI (Java 11) with `VerifyError: Bad type on operand stack`. What is the most likely root cause?',
      options: {
        A: 'The library uses a Java 17 preview feature not available in Java 11',
        B: 'A bytecode-manipulation library (CGLIB, Lombok, ByteBuddy) generated class files that are valid per Java 17 rules but fail Java 11\'s stricter verifier',
        C: 'The `.class` files are corrupt because of a file-system encoding difference',
        D: 'Java 11 does not support generics'
      },
      answer: 'B',
      explanation: '`VerifyError` at runtime means the bytecode failed the JVM verifier — not a compile-time issue. Bytecode manipulation libraries sometimes generate code that passes newer verifier implementations but fails older ones. Fix: align Java version across all environments via Gradle toolchain or add the specific library version that fixed the verifier-compatible generation.'
    },
    {
      id: 22,
      level: 'advanced',
      category: 'scenario',
      question: 'A containerised Spring Boot app (Alpine-based, JDK 17) starts 40% slower in production than locally. The only flag set is `-Xmx512m`. What is the most likely JVM cause?',
      options: {
        A: 'The JIT compiler is disabled in Docker',
        B: 'JVM ergonomics calculated a smaller heap based on the container CPU/memory limit, leaving too little room for JIT code cache, causing repeated deoptimisation',
        C: 'Alpine\'s musl libc causes `javac` to recompile all classes on startup',
        D: 'Docker networking latency delays class loading from the registry'
      },
      answer: 'B',
      explanation: 'JVM ergonomics inspect available CPUs and memory. In a container with limits, the JVM may pick a small Code Cache (`-XX:ReservedCodeCacheSize`) causing the JIT to evict compiled code — the so-called "code cache full" deoptimisation loop. Add `-XX:+UseContainerSupport` (default on Java 10+) and set explicit `-XX:InitialCodeCacheSize` / `-XX:ReservedCodeCacheSize`. Check with `jcmd <pid> VM.flags | grep CodeCache`.'
    },
    {
      id: 23,
      level: 'advanced',
      category: 'scenario',
      question: 'You run `java -version` → 17.0.9, but `javac -version` → 11.0.21. Which consequence is most likely?',
      options: {
        A: 'No consequence — the runtime version is what matters',
        B: 'Projects will compile against Java 11 API but run on Java 17, which may cause `NoSuchMethodError` if code depends on Java 17 APIs added after Java 11',
        C: 'The JVM will auto-select the matching `javac` version',
        D: 'Source files compile to Java 17 bytecode major version regardless of `javac` version'
      },
      answer: 'B',
      explanation: 'A split `java`/`javac` version means PATH resolves them from different JDK installations. Code that uses Java 12–17 APIs (e.g., `String.isBlank()` added in Java 11, `Map.copyOf()`) will compile only if `javac` sees those APIs — with Java 11 `javac` you cannot even call Java 17-only methods. If somehow it compiles (via classpath tricks), you get `NoSuchMethodError` or `ClassNotFoundException` at runtime.'
    },
    {
      id: 24,
      level: 'advanced',
      category: 'code',
      question: 'What does `java -verbose:class MyApp 2>&1 | grep "java.lang.String"` help you diagnose?',
      options: {
        A: 'Whether String pool is being used efficiently',
        B: 'Which ClassLoader and from which JAR/module `java.lang.String` was loaded',
        C: 'Whether String concatenation uses `StringBuilder` or `invokedynamic`',
        D: 'The number of String instances on the heap'
      },
      answer: 'B',
      explanation: '`-verbose:class` prints a line for every class load: `[Loaded java.lang.String from /path/to/jdk/jmods/java.base.jmod]`. If you see String loaded from an unexpected JAR in your classpath, you have a classpath pollution or shading conflict. A Staff engineer adds this flag to a failing startup to confirm the class loader source before filing a bug.'
    },
    {
      id: 25,
      level: 'advanced',
      category: 'theory',
      question: 'What is JIT deoptimisation and when does it occur?',
      options: {
        A: 'The JVM discards the JIT and falls back to interpretation when a profiling assumption is violated',
        B: 'The JIT downgrades from C2 to C1 when memory is low',
        C: 'Deoptimisation means the JVM disables GC to speed up a hot path',
        D: 'It occurs when `System.gc()` is called during JIT compilation'
      },
      answer: 'A',
      explanation: 'C2 makes speculative optimisations based on runtime profiling (e.g., "this virtual call always goes to SubclassA"). When the assumption breaks (a second subclass is loaded), the JVM "deoptimises" — discards the native code, restores the interpreter state, and re-profiles. Frequent deoptimisations appear as `@deopt` in `-XX:+PrintCompilation` output and cause JIT warm-up latency spikes in production.'
    },
    {
      id: 26,
      level: 'advanced',
      category: 'theory',
      question: 'Why does the JVM store class metadata in Metaspace (native memory) rather than the heap after Java 8?',
      options: {
        A: 'Native memory is faster than heap memory',
        B: 'PermGen had a fixed upper bound causing `OutOfMemoryError`; Metaspace grows dynamically in native memory bounded only by the OS, eliminating a common tuning pain point',
        C: 'The GC cannot collect objects in native memory, which keeps metadata stable',
        D: 'Metaspace allows class metadata to be shared across JVM processes'
      },
      answer: 'B',
      explanation: 'PermGen size was configured with `-XX:MaxPermSize` and commonly exhausted during hot-deploys of large applications (e.g., servlet containers redeploying WARs). Metaspace defaults to unlimited native memory growth, which shifts the failure mode from `PermGen OOM` to native memory exhaustion — easier to monitor with `-XX:MaxMetaspaceSize`. Note: classloader leaks still cause Metaspace to grow unboundedly.'
    },
    {
      id: 27,
      level: 'advanced',
      category: 'scenario',
      question: 'A multi-stage Dockerfile uses `openjdk:17-jdk` to build and `openjdk:17-jre` to run. A security scan flags the runtime image for JDK tools. What is the recommended Staff-level fix?',
      options: {
        A: 'Use a single stage with the full JDK to avoid version mismatch',
        B: 'Switch the runtime stage to `eclipse-temurin:17-jre-alpine` or `gcr.io/distroless/java17` which contain only the JRE or a minimal runtime without shell or package manager',
        C: 'Add `-Dsecurity.scan=false` to the JVM flags',
        D: 'Copy only the `.class` files from the build stage to a scratch image'
      },
      answer: 'B',
      explanation: 'Distroless and Alpine-JRE images drastically reduce attack surface: no shell, no package manager, no JDK tools like `jshell` or `jcmd`. A scratch image with raw `.class` files (option D) breaks because Spring Boot needs the full classpath and `java` launcher. Distroless images still include the JVM and standard library but nothing else — the right balance between security and functionality.'
    },
    {
      id: 28,
      level: 'advanced',
      category: 'code',
      question: 'Which `jcmd` subcommand shows heap memory breakdown (Eden, Survivor, Old Gen) without triggering a full GC?',
      options: {
        A: '`jcmd <pid> GC.run`',
        B: '`jcmd <pid> GC.heap_info`',
        C: '`jcmd <pid> VM.native_memory`',
        D: '`jcmd <pid> Thread.print`'
      },
      answer: 'B',
      explanation: '`jcmd <pid> GC.heap_info` prints current heap region usage (Young/Old sizes, used vs capacity) without forcing a collection. `GC.run` triggers a full GC — dangerous in production if the heap is large (long pause). `VM.native_memory` tracks off-heap allocations. `Thread.print` produces a thread dump.'
    },
    {
      id: 29,
      level: 'advanced',
      category: 'scenario',
      question: 'On a new project, Gradle builds succeed locally but fail on CI with `error: package com.google.common.collect does not exist`. `JAVA_HOME` is correct. What is the most likely cause?',
      options: {
        A: 'The JDK version differs between local and CI',
        B: 'The Guava dependency is in the `compileOnly` scope but needed at compile time — the CI cache is stale, causing the JAR to be absent',
        C: 'Guava is a JDK module that must be enabled with `--add-modules`',
        D: '`JAVA_HOME` points to JRE; Guava requires the full JDK'
      },
      answer: 'B',
      explanation: 'If a dependency is correctly declared but absent on CI, the Gradle dependency cache is typically the culprit — CI machines often use clean caches per build. Less commonly, the dependency is scope-mismatched (`runtimeOnly` instead of `implementation`). Guava is a third-party JAR, not a JDK module, so `--add-modules` and JDK version differences are red herrings.'
    },
    {
      id: 30,
      level: 'advanced',
      category: 'scenario',
      question: 'You are Staff engineer joining a new team. In week 1 you find `java -version` reports 11 on CI but `17` locally, and no Gradle toolchain is declared. What is your first move?',
      options: {
        A: 'Upgrade CI agents to Java 17 immediately',
        B: 'Add a Gradle toolchain declaration pinning Java 17 with Foojay resolver, commit it, verify CI downloads and uses Java 17 — then decide whether to upgrade CI agent base images',
        C: 'Add `-source 11 -target 11` to `compileJava` options to match CI',
        D: 'Set `JAVA_HOME` in the CI environment variable to point to Java 17'
      },
      answer: 'B',
      explanation: 'A Gradle toolchain declaration is the durable fix: it is version-controlled, reproducible, and removes dependence on machine-level `JAVA_HOME`. Hardcoding `-source 11` downgrades the compiler and masks the real problem. Setting `JAVA_HOME` in CI is fragile — it drifts as agents are re-imaged. Upgrading CI agents immediately without a toolchain declaration means the next agent image update reintroduces the mismatch.'
    }
  ]
};

// Insert MCQ before cheatsheet (second to last)
const cheatsheetIdx = day.sections.findIndex(s => s.type === 'cheatsheet');
if (cheatsheetIdx === -1) {
  day.sections.push(mcqSection);
} else {
  day.sections.splice(cheatsheetIdx, 0, mcqSection);
}

writeFileSync(FILE, JSON.stringify(day, null, 2), 'utf8');

const counts = { basic: 0, intermediate: 0, advanced: 0 };
mcqSection.questions.forEach(q => counts[q.level]++);
console.log('MCQ added:', mcqSection.questions.length, 'questions');
console.log('By level:', counts);
console.log('Section order:', day.sections.map(s => s.type));
console.log('File size:', JSON.stringify(day).length, 'chars');
