# Maven & Gradle commands every Java developer needs

*The commands you Google every time until you don't. Build lifecycle, dependency management, skipping tests, profiles, multi-module builds — with what each one actually does.*

---

## Maven essentials

### Lifecycle and build

```bash
# Clean build output and compile
mvn clean compile

# Run tests only
mvn test

# Package into a JAR (runs tests first)
mvn package

# Package without running tests
mvn package -DskipTests

# Compile-only skip (skips compilation of test classes too — faster)
mvn package -Dmaven.test.skip=true

# Install to local ~/.m2 repository (needed for multi-module interdependencies)
mvn install

# Install without tests
mvn install -DskipTests

# Run a specific test class
mvn test -Dtest=OrderServiceTest

# Run a specific test method
mvn test -Dtest=OrderServiceTest#shouldReturnActiveOrders

# Run tests matching a pattern
mvn test -Dtest="Order*Test"

# Run Spring Boot app
mvn spring-boot:run

# Run with a specific profile
mvn spring-boot:run -Dspring-boot.run.profiles=local

# Build and run in one step (Spring Boot Maven Plugin)
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Xmx512m"
```

### Dependency management

```bash
# Print the full dependency tree
mvn dependency:tree

# Filter tree to show one dependency and why it was pulled in
mvn dependency:tree -Dincludes=com.fasterxml.jackson.core:jackson-databind

# Resolve and copy all dependencies to target/dependency/
mvn dependency:copy-dependencies

# List available updates for your dependencies
mvn versions:display-dependency-updates

# List available updates for Maven plugins
mvn versions:display-plugin-updates

# Check for dependency conflicts (same artifact, multiple versions)
mvn dependency:analyze

# Force re-download all dependencies (when local cache is corrupt)
mvn dependency:resolve -U

# Or: update snapshots and force refresh
mvn clean install -U
```

### Multi-module builds

```bash
# Build from the root (builds all modules in order)
mvn clean install

# Build only a specific module and its dependencies
mvn clean install -pl order-service -am

# Build a specific module without building dependencies (-am)
mvn clean install -pl order-service

# Skip a specific module
mvn clean install -pl !order-service

# Build modules in parallel (careful with interdependencies)
mvn clean install -T 4          # 4 threads
mvn clean install -T 1C         # 1 thread per CPU core
```

### Profiles

```bash
# Activate a profile
mvn package -P production

# Activate multiple profiles
mvn package -P production,metrics

# List all available profiles
mvn help:all-profiles

# Show effective POM (what Maven actually uses after profile + parent resolution)
mvn help:effective-pom

# Show effective settings
mvn help:effective-settings
```

### Debugging Maven itself

```bash
# Debug mode — prints every decision Maven makes
mvn clean install -X 2>&1 | head -200

# Quiet mode — only errors
mvn clean install -q

# Show plugin details
mvn help:describe -Dplugin=spring-boot

# Offline mode (use only local cache — useful on a plane)
mvn clean install -o
```

---

## Gradle essentials

### Tasks and builds

```bash
# List all available tasks
./gradlew tasks

# List tasks with descriptions
./gradlew tasks --all

# Clean build output
./gradlew clean

# Compile (without tests)
./gradlew compileJava

# Run tests
./gradlew test

# Build JAR (runs tests)
./gradlew build

# Build without tests
./gradlew build -x test

# Run a specific test class
./gradlew test --tests "com.example.OrderServiceTest"

# Run a specific test method
./gradlew test --tests "com.example.OrderServiceTest.shouldReturnActiveOrders"

# Run Spring Boot app
./gradlew bootRun

# Run with Spring profile
./gradlew bootRun --args='--spring.profiles.active=local'

# Build the bootJar (executable JAR)
./gradlew bootJar
```

### Dependency management

```bash
# Print dependency tree (all configurations)
./gradlew dependencies

# Print for a specific configuration
./gradlew dependencies --configuration runtimeClasspath

# Print for a specific subproject
./gradlew :order-service:dependencies

# Check for dependency updates (requires versions plugin)
./gradlew dependencyUpdates

# Force re-download (delete caches)
./gradlew --refresh-dependencies clean build

# Display dependency insight (why is this version used?)
./gradlew dependencyInsight --dependency jackson-databind --configuration runtimeClasspath
```

### Multi-project builds

```bash
# Build all subprojects from root
./gradlew build

# Build a specific subproject
./gradlew :order-service:build

# Run a task in all subprojects
./gradlew subprojects { task -> }

# Build and skip a specific subproject
./gradlew build -x :legacy-module:build

# List all subprojects
./gradlew projects
```

### Performance flags

```bash
# Run in parallel (set in gradle.properties for permanent effect)
./gradlew build --parallel

# Use Gradle daemon (default in modern Gradle, run in background)
./gradlew build --daemon

# Stop the daemon (if something is stuck)
./gradlew --stop

# Use build cache (skip unchanged tasks)
./gradlew build --build-cache

# Dry run — show what would execute without executing
./gradlew build --dry-run

# Profile — generate an HTML build scan
./gradlew build --profile
# Report saved to build/reports/profile/

# Gradle Build Scan (requires Gradle Enterprise or free account)
./gradlew build --scan
```

### gradle.properties — permanent settings

```properties
# src: gradle.properties in project root

# Memory for the Gradle daemon
org.gradle.jvmargs=-Xmx2g -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8

# Enable parallel builds
org.gradle.parallel=true

# Enable build cache
org.gradle.caching=true

# Configuration cache (Gradle 7+, still incubating)
org.gradle.configuration-cache=true

# Kotlin DSL compiler daemon memory
kotlin.daemon.jvm.options=-Xmx1g
```

---

## Maven vs Gradle: quick reference

| Task | Maven | Gradle |
|---|---|---|
| Build (no tests) | `mvn package -DskipTests` | `./gradlew build -x test` |
| Run tests | `mvn test` | `./gradlew test` |
| Specific test | `mvn test -Dtest=ClassName` | `./gradlew test --tests "...ClassName"` |
| Dependency tree | `mvn dependency:tree` | `./gradlew dependencies` |
| Force refresh | `mvn install -U` | `./gradlew build --refresh-dependencies` |
| Effective config | `mvn help:effective-pom` | `./gradlew :project:dependencies` |
| Parallel build | `mvn install -T 4` | `./gradlew build --parallel` |
| Run app | `mvn spring-boot:run` | `./gradlew bootRun` |
| Profile/env | `mvn package -P prod` | `./gradlew bootRun --args='--spring.profiles.active=prod'` |

---

## Wrapper setup (always commit the wrapper)

```bash
# Maven: generate wrapper
mvn wrapper:wrapper

# Gradle: generate wrapper (specify version)
gradle wrapper --gradle-version 8.6

# Use wrapper — platform-independent, no local install required
./mvnw clean install    # Maven
./gradlew build         # Gradle
```

**Rule:** Always commit `mvnw`, `gradlew`, and their wrapper jars. Any developer or CI machine can then build without installing Maven/Gradle globally.

---

## Common problems and fixes

| Problem | Fix |
|---|---|
| `Could not resolve dependency` | `mvn install -U` or `./gradlew build --refresh-dependencies` |
| Tests pass locally, fail in CI | Check for hardcoded file paths, timezone assumptions, or port conflicts |
| Build slow | `mvn install -T 4 -DskipTests` or `./gradlew build --parallel --build-cache` |
| `BUILD FAILURE` — no useful message | `mvn install -X` or `./gradlew build --stacktrace` |
| Snapshot version not updating | `mvn install -U` forces snapshot refresh |
| Wrong Java version used | `JAVA_HOME` env var or `toolchain` in pom/build.gradle |
