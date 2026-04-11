# -*- coding: utf-8 -*-
"""One-off: write enriched phase1-day1.json and scenarioDrill-day1.json."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DAYS = ROOT / "public" / "data" / "days"

phase1_day1 = {
    "day": 1,
    "title": "Introduction to Java - JDK vs JRE vs JVM",
    "estimatedHours": 2,
    "difficulty": "Beginner",
    "level": "Beginner",
    "track": "Fresher",
    "tags": [
        "Fresher",
        "Beginner",
        "Phase 1",
        "Interview Prep",
        "Satyverse(Satyam Parmar)",
    ],
    "prerequisites": [
        "Computer basics",
        "Install JDK 17+",
        "Terminal basics (cd, listing files)",
    ],
    "learningObjectives": [
        "Explain how **JDK**, **JRE**, and **JVM** relate and which tools live in each layer",
        "Run **`javac`** and **`java`** from the terminal and trace **source → bytecode → execution**",
        "Interpret **`public static void main(String[] args)`** and how **classpath** affects class loading",
        "Diagnose **`java`/`javac` version skew**, missing **`javac`**, and **`ClassNotFoundException`** using **PATH** and **JAVA_HOME**",
        "Describe **bytecode verification**, **JIT**, and why **platform independence** is a JVM contract—not magic",
        "Relate JDK layout to **Spring Boot / Maven / Gradle** toolchains so interviews sound operational, not textbook",
    ],
    "sections": [],
}

why_content = """If you treat **JDK**, **JRE**, and **JVM** as interchangeable buzzwords, you will burn hours on problems that are mechanically simple: CI compiles on **Java 21** but containers run **Java 17**, **`java -version` works** while **`javac` is missing**, or a teammate runs **`java Hello`** from the wrong directory and blames the language. In production-adjacent environments, the same confusion shows up as **wrong base images**, **fat JARs built with the wrong toolchain**, and **NoSuchMethodError** when bytecode targets a newer class file version than the runtime understands.

Interviewers are not grading whether you can recite a diagram from a slide. They are listening for whether you can **tie the platform stack to failure modes**: what happens when the **classpath** is wrong, why **retries and classloading order** matter for static initializers, and how **OpenJDK distributions** differ from **vendor support**. A crisp answer names the **compile boundary** (**`javac`**) and the **execution boundary** (**`java` launcher + JVM**), then explains **why** separating them buys portability.

When this topic is done badly, teams ship **non-reproducible builds** because **JAVA_HOME** points at one JDK while **PATH** picks another, or they "fix" a bug by installing three JDKs and never knowing which one Gradle used. The operational cost is slow onboarding, flaky tutorials, and noisy Slack threads that should be one checklist.

A strong Day 1 answer usually does four things in order: (1) define **JDK / JRE / JVM** with **one sentence each** and state **what ships together today**; (2) walk **`.java` → `.class` → JVM** including **who reads `args`** and **where**; (3) name **one realistic incident**—for example **`java`/`javac` mismatch** or **package + classpath**—with the **symptom** you would see in a terminal; (4) give **concrete mitigation**: align **PATH + JAVA_HOME**, use **`javac --release`**, pin **Docker base image digest**, and document **how to run** a packaged class with **`-cp`**.

Finally, remember that **"write once, run anywhere"** is a **compatibility promise for bytecode on a spec-compliant JVM**, not a guarantee that every native library or file path works on every OS. Interviewers reward candidates who acknowledge **limits** while still explaining **the engineering trade-off** correctly."""

theory_content = """### Day 1 — JDK, JRE, JVM (deep dive)

This day is about **the platform contract**: where compilation ends, where execution begins, and which knobs (**PATH**, **JAVA_HOME**, **classpath**, **module path**) determine what actually runs on a machine.

---

### 1. Formal stack: JDK ⊇ JRE ⊇ JVM (modern packaging)

**JDK (Java Development Kit)** is the **developer distribution**: it includes **`javac`** (and other tools such as **`jar`**, **`javadoc`**, **`jcmd`**, **`jfr`**) **plus** a **runtime** sufficient to execute the bytecode you compile. **JRE (Java Runtime Environment)** historically meant **runtime-only** consumer installs; since **Java 11**, many vendors no longer ship a separate public JRE—teams install a **JDK** everywhere and use the embedded runtime for servers. **JVM (Java Virtual Machine)** is the **execution engine** that loads **`.class`** files (and modules), **verifies** bytecode, executes it (via **interpreter + JIT**), and manages **heap memory** and **garbage collection**.

| Layer | You get… | Typical interview trap |
|------|----------|------------------------|
| **JDK** | compile + run + tools | "I installed Java" but only a **JRE shim** is on PATH → **`javac` missing** |
| **JRE** (runtime bundle) | run bytecode | cannot compile new sources without **`javac`** |
| **JVM** | executes bytecode | not the same as the **language** or the **standard library** |

---

### 2. The compile-run pipeline (what happens after you hit Enter)

**Authoring**: you write **`src/com/example/App.java`**. **Compilation**: **`javac`** parses the language, type-checks, emits **bytecode** into **`com/example/App.class`**. **Launch**: the **`java`** launcher starts a JVM, loads **`com.example.App`**, initializes the class, then calls **`main`**. **`main` is not magic**—it is simply a **public static** entry point the launcher can invoke **without constructing an object first**.

**Spring mapping (mental model)**: Spring Boot still ends up as **JVM bytecode** on disk. **`mvn package`** / **`gradle bootJar`** orchestrate **`javac`** (directly or via the compiler API) and dependency packaging. When interviews mention **`JAVA_HOME`**, they are pointing at the same root your build tool uses to pick the **compiler** and **system modules**.

---

### 3. Classpath, packages, and the "Could not find or load main class" family

The JVM resolves types using a **classpath** (classic) and/or **module path** (Java 9+). For Day 1, internalize this rule: **the fully qualified class name (`com.example.App`) must map to a directory tree (`com/example/App.class`) under a classpath root**. If you run **`java App`** but the file declares **`package com.example;`**, you will fail class resolution even if **`App.class` exists**, because the JVM expects **`com.example.App`**.

**Interview angles**: explain **why** **`java -cp out com.example.App`** differs from **`java com.example.App`** with default **`.`**; explain **`-d out`** for **`javac`** to preserve packages; mention **`ClassNotFoundException` vs `NoClassDefFoundError`** at a high level (missing on load vs present at compile but missing at runtime).

---

### 4. `public static void main(String[] args)` — field guide

| Part | Meaning | Why the JVM cares |
|------|---------|-------------------|
| **`public`** | accessible outside the class | launcher must invoke it from outside |
| **`static`** | no instance required | no object graph exists yet at startup |
| **`void`** | no return value to caller | launcher does not consume a result |
| **`String[] args`** | command-line tokens after class name | **`args[0]`** is the first user argument |

---

### 5. Bytecode, verification, JIT — "compiled or interpreted?"

**Accurate interview answer**: Java source is **compiled to bytecode** by **`javac`**. The JVM **starts execution by interpreting** bytecode and **JIT-compiles hot methods** to native code for throughput. This is **not** "interpreted like Bash source each line"; it is a **mixed-mode runtime** with **tiered compilation** in modern JVMs.

**Bytecode verification** rejects illegal programs (unsafe stack operations, illegal casts) before they execute—part of Java's safety story. **JIT** is why microbenchmarks talk about **warmup**: performance changes after the JVM profiles your workload.

---

### 6. `PATH`, `JAVA_HOME`, and the two-Java problem

**PATH** decides which **`java`** / **`javac`** binaries your shell executes first. **`JAVA_HOME`** should point at the **JDK installation root** so Maven/Gradle/IDEs resolve tools consistently. **Failure mode**: **`java -version` shows 21** while **`javac -version` shows 17** because two JDKs are installed and ordering differs—this is a **real support ticket** pattern.

**Fix culture**: pick **one** JDK per repo, pin it in **toolchains**, and make CI print **`java -version` + `javac -version`** in build logs.

---

### 7. Java distributions (Temurin, Corretto, Azul, …)

**OpenJDK** is the **open-source reference**; vendors ship **TCK-certified builds** with support SLAs. For interviews, the point is not memorizing brands—it is knowing you must standardize **major version + patch cadence + crypto/timezone packaging** across environments.

---

### 8. Story you can tell in 60 seconds

**Symptom**: new service fails in staging with **`UnsupportedClassVersionError`**. **Root cause**: developers built with **JDK 21** default, but Kubernetes image used **JDK 17** runtime. **Mitigation**: pin **`maven.compiler.release=17`**, align **CI + Dockerfile + `JAVA_HOME`**, and add a **startup check** that logs **`Runtime.version()`**. That story shows you connect **tooling** to **shipping**."""

basic_code = r"""package arch.day1;

public class Day1Basic {
    public static void main(String[] args) {
        System.out.println("=== JDK / JRE / JVM — responsibilities ===");
        System.out.println("JDK   | javac, jar, jlink, javadoc, jcmd… + bundled runtime");
        System.out.println("JRE   | JVM + core libraries + launcher (runtime-only bundles)");
        System.out.println("JVM   | loads .class, verifies bytecode, executes (interpreter + JIT)");
        System.out.println();
        System.out.println("=== Typical terminal commands ===");
        System.out.println("javac -d out src/com/example/App.java");
        System.out.println("java -cp out com.example.App arg1 arg2");
        System.out.println("java --version");
        System.out.println("javac --version");
        System.out.println();
        System.out.println("=== main(String[] args) — keyword roles ===");
        System.out.println("public  -> JVM entry visible from outside the class");
        System.out.println("static  -> no object instance required at startup");
        System.out.println("void    -> no return value consumed by launcher");
        System.out.println("args    -> tokens AFTER the class name on the command line");
        System.out.println();
        System.out.println("=== Write once, run anywhere (accurate wording) ===");
        System.out.println("Same .class runs on any spec-compatible JVM for that major bytecode.");
    }
}"""

basic_output = """=== JDK / JRE / JVM — responsibilities ===
JDK   | javac, jar, jlink, javadoc, jcmd… + bundled runtime
JRE   | JVM + core libraries + launcher (runtime-only bundles)
JVM   | loads .class, verifies bytecode, executes (interpreter + JIT)

=== Typical terminal commands ===
javac -d out src/com/example/App.java
java -cp out com.example.App arg1 arg2
java --version
javac --version

=== main(String[] args) — keyword roles ===
public  -> JVM entry visible from outside the class
static  -> no object instance required at startup
void    -> no return value consumed by launcher
args    -> tokens AFTER the class name on the command line

=== Write once, run anywhere (accurate wording) ===
Same .class runs on any spec-compatible JVM for that major bytecode.
"""

intermediate_code = r"""package arch.day1;

import java.util.*;

/**
 * Simulates JVM class resolution: classpath roots + fully qualified name.
 * Spring Boot still relies on the same rules when the embedded launcher builds the classpath for your fat JAR.
 */
public class Day1Intermediate {

    static String tryLoad(List<String> classpathRoots, String fqn) {
        String path = fqn.replace('.', '/') + ".class";
        for (String root : classpathRoots) {
            String key = root + "/" + path;
            if (SimulatedDisk.CLASSES.containsKey(key))
                return "LOADED from " + key;
        }
        return "ClassNotFoundException: " + fqn + " (not found under given -cp roots)";
    }

    static final class SimulatedDisk {
        static final Map<String, Boolean> CLASSES = new LinkedHashMap<>();
        static {
            CLASSES.put("out/com/example/App.class", true);
            CLASSES.put("build/classes/java/main/com/example/App.class", true);
        }
    }

    public static void main(String[] args) {
        System.out.println("=== JVM class resolution simulation (-cp + FQN) ===");
        System.out.println();

        System.out.println("--- Scenario 1: happy path ---");
        System.out.println(tryLoad(List.of("out"), "com.example.App"));
        System.out.println();

        System.out.println("--- Scenario 2: wrong simple name (package ignored) ---");
        System.out.println(tryLoad(List.of("out"), "App"));
        System.out.println();

        System.out.println("--- Scenario 3: correct FQN but wrong classpath root ---");
        System.out.println(tryLoad(List.of("wrongRoot"), "com.example.App"));
        System.out.println();

        System.out.println("--- Scenario 4: alternate build output directory ---");
        System.out.println(tryLoad(List.of("build/classes/java/main"), "com.example.App"));
        System.out.println();

        System.out.println("=== Rules ===");
        System.out.println("Rule 1: FQN com.example.App maps to com/example/App.class under a classpath root.");
        System.out.println("Rule 2: java -cp <roots> <fqn> — roots must contain the package parent folder.");
        System.out.println("Rule 3: javac -d <out> preserves package directories; default is CWD flattening risk.");
        System.out.println("Rule 4: Module path (Java 9+) adds stronger encapsulation — different switch, same discipline.");
    }
}"""

intermediate_output = """=== JVM class resolution simulation (-cp + FQN) ===

--- Scenario 1: happy path ---
LOADED from out/com/example/App.class

--- Scenario 2: wrong simple name (package ignored) ---
ClassNotFoundException: App (not found under given -cp roots)

--- Scenario 3: correct FQN but wrong classpath root ---
ClassNotFoundException: com.example.App (not found under given -cp roots)

--- Scenario 4: alternate build output directory ---
LOADED from build/classes/java/main/com/example/App.class

=== Rules ===
Rule 1: FQN com.example.App maps to com/example/App.class under a classpath root.
Rule 2: java -cp <roots> <fqn> — roots must contain the package parent folder.
Rule 3: javac -d <out> preserves package directories; default is CWD flattening risk.
Rule 4: Module path (Java 9+) adds stronger encapsulation — different switch, same discipline.
"""

advanced_code = r"""package arch.day1;

import java.util.*;

/**
 * Deterministic "release targeting" + JDK layout probe (curated; no randomness).
 * Mirrors what teams enforce with maven.compiler.release / Gradle toolchain.
 */
public class Day1Advanced {

    record ReleaseTarget(int javaFeatureVersion, String description) {}

    record ToolchainReport(ReleaseTarget target, boolean javacMeets, boolean javaMeets, String recommendation) {
        @Override public String toString() {
            return String.format(
                "target=Java %d (%s) | javac_ok=%s java_ok=%s | %s",
                target().javaFeatureVersion(), target().description(), javacMeets(), javaMeets(), recommendation());
        }
    }

    static ToolchainReport check(ReleaseTarget target, int javacMajor, int javaRuntimeMajor) {
        int need = target.javaFeatureVersion();
        boolean jc = javacMajor >= need;
        boolean jr = javaRuntimeMajor >= need;
        String rec;
        if (jc && jr) rec = "Aligned: compile and run at or above target.";
        else if (!jc) rec = "Upgrade JDK used by compiler (javac too old for target).";
        else rec = "Upgrade runtime image (runtime older than compiled bytecode).";
        return new ToolchainReport(target, jc, jr, rec);
    }

    static void printLayout() {
        System.out.println("=== Curated JDK layout (example paths) ===");
        System.out.println("JAVA_HOME/bin/java");
        System.out.println("JAVA_HOME/bin/javac");
        System.out.println("JAVA_HOME/lib/modules  (runtime image modules)");
        System.out.println();
    }

    static void printBytecodeTable() {
        System.out.println("=== class file major version (selected) ===");
        System.out.println("55 -> Java 11");
        System.out.println("61 -> Java 17");
        System.out.println("65 -> Java 21");
        System.out.println();
    }

    public static void main(String[] args) {
        printLayout();

        ReleaseTarget prod = new ReleaseTarget(17, "service baseline");
        System.out.println("=== Toolchain compatibility check (simulated JDK versions) ===");
        System.out.println(check(prod, 21, 17));
        System.out.println(check(prod, 11, 21));
        System.out.println(check(prod, 21, 11));
        System.out.println();

        printBytecodeTable();

        System.out.println("=== Decision reference: terminal triage ===");
        System.out.println("javac missing        -> JDK not installed or JDK bin not on PATH");
        System.out.println("java != javac majors -> two JDK installs; fix PATH order + JAVA_HOME");
        System.out.println("UnsupportedClassVersionError -> runtime older than bytecode; bump image");
        System.out.println("NoClassDefFoundError   -> compiled dep missing at runtime classpath");
        System.out.println("ClassNotFoundException -> wrong FQN, wrong -cp, or missing JAR on classpath");
    }
}"""

advanced_output = """=== Curated JDK layout (example paths) ===
JAVA_HOME/bin/java
JAVA_HOME/bin/javac
JAVA_HOME/lib/modules  (runtime image modules)

=== Toolchain compatibility check (simulated JDK versions) ===
target=Java 17 (service baseline) | javac_ok=true java_ok=true | Aligned: compile and run at or above target.
target=Java 17 (service baseline) | javac_ok=false java_ok=true | Upgrade JDK used by compiler (javac too old for target).
target=Java 17 (service baseline) | javac_ok=true java_ok=false | Upgrade runtime image (runtime older than compiled bytecode).

=== class file major version (selected) ===
55 -> Java 11
61 -> Java 17
65 -> Java 21

=== Decision reference: terminal triage ===
javac missing        -> JDK not installed or JDK bin not on PATH
java != javac majors -> two JDK installs; fix PATH order + JAVA_HOME
UnsupportedClassVersionError -> runtime older than bytecode; bump image
NoClassDefFoundError   -> compiled dep missing at runtime classpath
ClassNotFoundException -> wrong FQN, wrong -cp, or missing JAR on classpath
"""

Wait - the check() output for the three cases - I need to trace:
- check(prod, 21, 17): javac 21 >= 61? NO - bytecode major 61 is Java 17, but javacMajor is the JDK major version not bytecode. I messed up the semantics.

Let me fix the advanced code. The `ReleaseTarget.bytecodeMajor` should be Java language version (17), and javacMajor/javaRuntimeMajor are also Java versions (21, 17, etc.)

check: javacMeets = javacMajor >= target.bytecodeMajor() for API availability - actually for "can compile for 17" you need javac at least 17. javaMeets = javaRuntimeMajor >= target.bytecodeMajor() for running bytecode that targets 17.

check(prod, 21, 17): javac 21 >= 17 true, java 17 >= 17 true -> aligned
check(prod, 17, 21): both true
check(prod, 11, 21): javac 11 >= 17 false -> Upgrade compiler

Let me use:
1. check(prod, 21, 17) -> both true
2. check(prod, 11, 21) -> javac false
3. check(prod, 21, 11) -> java false

I'll update the script.

Also fix ReleaseTarget - use 17 as bytecodeMajor with description "Java 17 baseline"

```python
ReleaseTarget prod = new ReleaseTarget(17, "Java 17 service baseline");
check(prod, 21, 17) -> javac 21>=17, java 17>=17 -> both true
check(prod, 11, 21) -> javac false
check(prod, 21, 11) -> java false
```

Update advanced_code string in the script.
</think>
Fixing the advanced code logic: correcting the simulated toolchain check outputs.

<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>
StrReplace