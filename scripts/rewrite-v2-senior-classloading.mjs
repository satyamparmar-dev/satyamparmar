import { readFileSync, writeFileSync } from 'fs';
const FILE = 'public/data/scenarioInterviewThemes.json';
const F = '```';

const answers = {

'th-sr-duplicate-jars': `
## 🔥 The situation

Your app starts and immediately throws \`ClassCastException\` or \`NoSuchMethodError\` — even though the class and method clearly exist in the code. Or worse, a class behaves differently at runtime than what you see in your IDE. The culprit is usually **duplicate JARs** — two versions of the same library loaded by different classloaders.

---

## 🧠 Understand this first

| Concept | What it means |
|---|---|
| **Classloader** | The JVM component that loads \`.class\` files into memory |
| **Parent delegation** | Classloaders first ask their parent before loading — prevents duplicate loads from the same source |
| **Classpath conflict** | Two JARs provide the same class (e.g., \`com.fasterxml.jackson.core.ObjectMapper\`) — only one wins, unpredictably |
| **ClassCastException** | \`(SomeClass) obj\` fails because \`obj\` was loaded by a different classloader than \`SomeClass\` — they're different types to the JVM |
| **NoSuchMethodError** | Method exists in your code but the older JAR version on the classpath doesn't have it |
| **Fat JAR** | Spring Boot's executable JAR — has a nested classloader that handles its own isolation |

---

## Step 1 — Reproduce and identify the conflict

Run your app and look for the exact error:

${F}bash
# NoSuchMethodError example
java.lang.NoSuchMethodError:
  com.fasterxml.jackson.databind.ObjectMapper.findAndRegisterModules()
  at com.example.MyService.serialize(MyService.java:42)
${F}

This means the JAR version loaded at runtime doesn't have \`findAndRegisterModules()\` — you're running an older Jackson than you think.

**Find what's on the classpath:**

${F}bash
# Maven — show the full dependency tree
mvn dependency:tree | grep jackson

# Look for duplicate versions
mvn dependency:tree | grep -E "jackson.*:(2\\.)"
${F}

**What you see:**
${F}
[INFO] +- org.springframework.boot:spring-boot-starter-web:jar:3.1.0
[INFO] |  \- com.fasterxml.jackson.core:jackson-databind:jar:2.15.2
[INFO] \- com.legacy:old-library:jar:1.0.0
[INFO]    \- com.fasterxml.jackson.core:jackson-databind:jar:2.9.10  ← conflict!
${F}

**What this means:** Two Jackson versions — Maven picks one (usually the nearest/first), but if the order differs between build and deployment, you get different behavior.

---

## Step 2 — Force the correct version

**Option A — Exclude the transitive dependency:**

${F}xml
<dependency>
    <groupId>com.legacy</groupId>
    <artifactId>old-library</artifactId>
    <version>1.0.0</version>
    <exclusions>
        <exclusion>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
        </exclusion>
    </exclusions>
</dependency>
${F}

**Option B — Use \`<dependencyManagement>\` to pin the version globally:**

${F}xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
            <version>2.15.2</version>  <!-- always use this version, regardless of what transitive deps request -->
        </dependency>
    </dependencies>
</dependencyManagement>
${F}

**Verify the fix:**

${F}bash
mvn dependency:tree | grep jackson-databind
# Should now show only ONE version
${F}

**What you see:**
${F}
[INFO] +- com.fasterxml.jackson.core:jackson-databind:jar:2.15.2:compile
${F}

---

## Step 3 — Find which classloader loaded the class at runtime

Add this diagnostic temporarily:

${F}java
// In your problematic service
Class<?> clazz = ObjectMapper.class;
System.out.println("Loaded from: " + clazz.getProtectionDomain().getCodeSource().getLocation());
System.out.println("By classloader: " + clazz.getClassLoader());
${F}

**What you see:**
${F}
Loaded from: file:/home/app/lib/jackson-databind-2.9.10.jar  ← old version!
By classloader: sun.misc.Launcher$AppClassLoader@1b6d3586
${F}

This tells you the physical JAR file being used — if it's not what you expect, the classpath is wrong.

---

## Step 4 — Use Maven Enforcer to prevent future conflicts

${F}xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-enforcer-plugin</artifactId>
    <executions>
        <execution>
            <id>enforce-no-duplicate-dependencies</id>
            <goals><goal>enforce</goal></goals>
            <configuration>
                <rules>
                    <dependencyConvergence/>  <!-- fails build if same artifact has multiple versions -->
                    <bannedDependencies>
                        <excludes>
                            <!-- Block known-vulnerable old versions -->
                            <exclude>com.fasterxml.jackson.core:jackson-databind:[,2.14)</exclude>
                        </excludes>
                    </bannedDependencies>
                </rules>
            </configuration>
        </execution>
    </executions>
</plugin>
${F}

**What you see when it catches a conflict:**
${F}
[ERROR] Rule 0: org.apache.maven.plugins.enforcer.DependencyConvergence failed with message:
Failed while enforcing relying on the following issues:
Dependency convergence error for com.fasterxml.jackson.core:jackson-databind:2.9.10
  Include only one version of this dependency
BUILD FAILURE
${F}

---

## 💡 Interview answer

**Open:** "We hit a \`NoSuchMethodError\` in production after upgrading Spring Boot — the method existed in the new Jackson but an old transitive dependency was pulling in Jackson 2.9 which didn't have it."

**Then:** "I ran \`mvn dependency:tree | grep jackson-databind\` and found two versions coexisting. The old version was winning because it was declared earlier in the classpath. I excluded the old version from the transitive dependency and pinned Jackson 2.15 in \`<dependencyManagement>\`. I also added the Maven Enforcer \`dependencyConvergence\` rule to fail the build if this ever recurs."

**End:** "The diagnostic I now always reach for is \`clazz.getProtectionDomain().getCodeSource().getLocation()\` — it tells you exactly which physical JAR a class came from at runtime, which is invaluable when classpath conflicts are subtle."
`.trim(),

'th-sr-jdk-upgrade': `
## 🔥 The situation

Your team needs to upgrade from Java 11 (or 8) to Java 17 or 21. The build works, but runtime is broken — illegal access warnings become errors, frameworks fail to inject, and Kotlin/Lombok might have issues. Java upgrades are not just a version bump; the module system (JPMS), strong encapsulation, and removed APIs create real breaking changes.

---

## 🧠 Understand this first

| Concept | What it means |
|---|---|
| **JPMS (Java Platform Module System)** | Java 9+ modules — internal JDK APIs (\`sun.*\`, \`com.sun.*\`) are now encapsulated |
| **--add-opens** | Flag to re-open a sealed module package for reflective access (a temporary escape hatch) |
| **InaccessibleObjectException** | Thrown when code tries to reflect into a sealed module without \`--add-opens\` |
| **Removed APIs** | Java 11 removed \`javax.*\` SOAP/XML APIs; Java 17 removed Nashorn JS engine |
| **LTS releases** | Java 8, 11, 17, 21 are Long-Term Support — production targets; skip 12–16, 18–20 |
| **Spring Boot 3.x** | Requires Java 17+; migrated from \`javax.\` to \`jakarta.\` namespace |

---

## Step 1 — Audit what will break before upgrading

${F}bash
# Run jdeps to find usages of internal/removed APIs
jdeps --jdk-internals --multi-release 17 target/myapp.jar 2>&1 | head -50
${F}

**What you see:**
${F}
myapp.jar -> JDK removed internal API
   com.example.MyReflectionUtil -> sun.reflect.ReflectionFactory (JDK internal)
   com.example.XmlUtil -> com.sun.xml.bind.v2.ContextFactory (removed in JDK 11)
${F}

**What this means:** These classes use internal JDK APIs that are sealed or removed — they'll fail at runtime on Java 17+.

---

## Step 2 — Update the JVM flags for reflection access

If you use libraries that reflect into JDK internals (Hibernate, Spring, ByteBuddy, Lombok, etc.), add \`--add-opens\` flags:

${F}bash
# In your startup script or Dockerfile CMD
java \
  --add-opens java.base/java.lang=ALL-UNNAMED \
  --add-opens java.base/java.util=ALL-UNNAMED \
  --add-opens java.base/java.lang.reflect=ALL-UNNAMED \
  --add-opens java.base/java.io=ALL-UNNAMED \
  -jar myapp.jar
${F}

Or in Maven Surefire for tests:

${F}xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <configuration>
        <argLine>
            --add-opens java.base/java.lang=ALL-UNNAMED
            --add-opens java.base/java.util=ALL-UNNAMED
        </argLine>
    </configuration>
</plugin>
${F}

**What you see (without --add-opens):**
${F}
java.lang.reflect.InaccessibleObjectException:
  Unable to make field private final java.lang.String accessible:
  module java.base does not "opens java.lang" to unnamed module
${F}

**What you see (with --add-opens):** App starts normally.

---

## Step 3 — Migrate javax.* to jakarta.* (for Spring Boot 3 upgrade)

Spring Boot 3 migrated from Java EE (\`javax.*\`) to Jakarta EE (\`jakarta.*\`).

${F}bash
# Find all javax. imports in your code
grep -r "import javax\." src/main/java/ | grep -v "javax.swing\|javax.crypto"

# Common ones that changed:
# javax.persistence.*  →  jakarta.persistence.*
# javax.validation.*   →  jakarta.validation.*
# javax.servlet.*      →  jakarta.servlet.*
# javax.transaction.*  →  jakarta.transaction.*
${F}

**Automated migration with OpenRewrite:**

${F}xml
<plugin>
    <groupId>org.openrewrite.maven</groupId>
    <artifactId>rewrite-maven-plugin</artifactId>
    <version>5.2.2</version>
    <configuration>
        <activeRecipes>
            <recipe>org.openrewrite.java.spring.boot3.UpgradeSpringBoot_3_0</recipe>
        </activeRecipes>
    </configuration>
</plugin>
${F}

${F}bash
mvn rewrite:run  # auto-migrates javax → jakarta, updates dependencies
${F}

---

## Step 4 — Check removed/deprecated APIs

${F}bash
# Java 11 removed these from the JDK (add them back as explicit Maven deps if needed)
# javax.xml.bind (JAXB) → com.sun.xml.bind:jaxb-impl
# javax.xml.ws (JAX-WS) → com.sun.xml.ws:jaxws-ri
# javax.activation → com.sun.activation:javax.activation
${F}

${F}xml
<!-- Add missing JAXB for Java 11+ -->
<dependency>
    <groupId>com.sun.xml.bind</groupId>
    <artifactId>jaxb-impl</artifactId>
    <version>3.0.2</version>
</dependency>
${F}

---

## Step 5 — Run your test suite targeting Java 17

${F}xml
<!-- In pom.xml — set compiler to Java 17 -->
<properties>
    <maven.compiler.source>17</maven.compiler.source>
    <maven.compiler.target>17</maven.compiler.target>
    <maven.compiler.release>17</maven.compiler.release>  <!-- preferred over source/target -->
</properties>
${F}

${F}bash
# Check with a specific JDK
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
mvn clean test -Djava.version=17 2>&1 | grep -E "ERROR|FAIL|WARNING.*illegal"
${F}

**What you see (success):**
${F}
[INFO] Tests run: 142, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
${F}

---

## 💡 Interview answer

**Open:** "We upgraded from Java 11 to Java 17 and hit \`InaccessibleObjectException\` at startup — Hibernate's bytecode enhancer was trying to reflect into \`java.lang\` which is sealed in Java 17."

**Then:** "I used \`jdeps --jdk-internals\` to audit all illegal internal API usages before upgrading. For the reflection issue, I added \`--add-opens java.base/java.lang=ALL-UNNAMED\` to our startup flags. I also ran the OpenRewrite migration recipe to batch-rename all \`javax.persistence\` → \`jakarta.persistence\` imports for the Spring Boot 3 switch. The Maven Enforcer plugin was extended to ban older Hibernate versions that still used internal APIs."

**End:** "The key insight is: treat a JDK major version upgrade like a dependency upgrade with breaking changes — audit first with \`jdeps\`, migrate incrementally, and run the full test suite on the target JDK before cutting over. LTS → LTS (11→17→21) skips a lot of short-lived API churn."
`.trim(),

};

const data = JSON.parse(readFileSync(FILE, 'utf8'));
let count = 0;
for (const theme of data.themes) {
  for (const scenario of theme.scenarios) {
    if (answers[scenario.id]) {
      scenario.answer = answers[scenario.id];
      console.log(`✅ ${scenario.id}`);
      count++;
    }
  }
}
writeFileSync(FILE, JSON.stringify(data, null, 2));
console.log(`\nDone — ${count} scenarios rewritten.`);
