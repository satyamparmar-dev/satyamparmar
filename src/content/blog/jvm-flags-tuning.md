# JVM flags & tuning reference

*Heap size, GC selection, GC logging, thread dumps, heap dumps, container-aware flags — the flags that matter in production and what each one actually does.*

*All flags apply to `java` CLI, Docker/Kubernetes JVM args, and Spring Boot `JAVA_OPTS`.*

---

## Why flags matter

The JVM ships with defaults designed for a generic workload. Production applications — especially Spring Boot microservices, batch processors, or high-throughput APIs — need intentional tuning. Wrong heap sizing causes `OutOfMemoryError`. Wrong GC causes latency spikes. Missing logging makes debugging impossible when something goes wrong at 2 AM.

---

## Memory: heap and metaspace

```bash
# Set initial and maximum heap size
-Xms512m -Xmx2g

# Rule of thumb:
# Set Xms = Xmx to avoid heap resizing pauses (important for low-latency services)
-Xms1g -Xmx1g

# Metaspace (class metadata — replaces PermGen in Java 8+)
# Default: unlimited (bounded only by native memory)
-XX:MaxMetaspaceSize=256m

# If you see metaspace OOM errors, add this and monitor:
-XX:MetaspaceSize=128m -XX:MaxMetaspaceSize=256m

# Thread stack size (default 512k–1m depending on OS)
# Reduce if you create many threads:
-Xss256k
```

**Container sizing rule:** Set `-Xmx` to ~75% of the container's memory limit. Leave the rest for metaspace, thread stacks, direct buffers, and the OS.

```bash
# Container with 2GB limit → safe JVM settings:
-Xms512m -Xmx1536m -XX:MaxMetaspaceSize=256m
```

---

## Container-aware flags (critical for Docker/Kubernetes)

Before Java 10, the JVM did not respect container CPU/memory limits — it saw the host machine. Always set these for containerised workloads.

```bash
# Respect container memory limits (on by default Java 10+, add for Java 8u191+)
-XX:+UseContainerSupport

# Set heap as a percentage of container memory (Java 10+)
-XX:MaxRAMPercentage=75.0
-XX:InitialRAMPercentage=50.0

# Limit GC threads to container CPU quota (default: uses host CPU count)
-XX:ActiveProcessorCount=2

# Kubernetes recommended baseline for a Spring Boot microservice:
-XX:+UseContainerSupport
-XX:MaxRAMPercentage=75.0
-XX:+ExitOnOutOfMemoryError
```

---

## GC selection

| GC | Flag | Use when |
|---|---|---|
| G1GC | `-XX:+UseG1GC` | Default Java 9+. General purpose. Good balance of throughput and latency. |
| ZGC | `-XX:+UseZGC` | Ultra-low latency (sub-millisecond pauses). Java 15+ production-ready. |
| Shenandoah | `-XX:+UseShenandoahGC` | Low latency. GraalVM/OpenJDK. Good alternative to ZGC. |
| Parallel GC | `-XX:+UseParallelGC` | Maximum throughput, latency not critical. Batch jobs. |
| Serial GC | `-XX:+UseSerialGC` | Single-threaded, minimal memory. Very small containers (<256MB heap). |

```bash
# G1GC — tune the pause target (milliseconds)
-XX:+UseG1GC -XX:MaxGCPauseMillis=200

# ZGC — for services where latency matters more than throughput
-XX:+UseZGC

# ZGC with generational GC (Java 21+, recommended over standard ZGC)
-XX:+UseZGC -XX:+ZGenerational
```

---

## GC logging (always enable in production)

GC logs are your most important diagnostic tool. They are low overhead and tell you exactly what the GC is doing.

```bash
# Java 9+ unified logging (preferred)
-Xlog:gc*:file=/var/log/app/gc.log:time,uptime,level,tags:filecount=5,filesize=20m

# Explanation:
# gc*               — all GC-related log topics
# file=...          — write to rotating log file
# time,uptime,...   — log decorators (timestamps)
# filecount=5       — keep 5 rotated files
# filesize=20m      — rotate at 20MB

# Minimal GC logging (just see pauses):
-Xlog:gc:file=/var/log/app/gc.log

# Java 8 (legacy flags):
-XX:+PrintGCDetails -XX:+PrintGCDateStamps -Xloggc:/var/log/app/gc.log
-XX:+UseGCLogFileRotation -XX:NumberOfGCLogFiles=5 -XX:GCLogFileSize=20m
```

---

## Thread dumps

A thread dump shows what every thread is doing at a point in time. Essential for diagnosing deadlocks, thread pool exhaustion, and "why is my app stuck?"

```bash
# Get the PID of your Java process
jps -l
# Or: ps aux | grep java

# Send SIGQUIT — dumps threads to stdout/console
kill -3 <pid>

# Use jstack (part of JDK — more reliable)
jstack <pid>

# Write to a file
jstack <pid> > /tmp/threaddump-$(date +%Y%m%d-%H%M%S).txt

# Thread dump every 5 seconds, 3 times (for intermittent issues)
for i in 1 2 3; do jstack <pid> > /tmp/td-$i.txt; sleep 5; done
```

**In a container (no jstack access):**

```bash
# Docker: exec into container and run jstack
docker exec -it <container> /bin/sh
jstack $(pgrep java)

# Or use kill -3 from inside the container
kill -3 $(pgrep java)
# Appears in docker logs
```

**Flags to enable JMX for remote thread dumps:**

```bash
-Dcom.sun.management.jmxremote
-Dcom.sun.management.jmxremote.port=9010
-Dcom.sun.management.jmxremote.authenticate=false
-Dcom.sun.management.jmxremote.ssl=false
```

---

## Heap dumps

A heap dump captures the entire contents of heap memory at a point in time. Essential for diagnosing `OutOfMemoryError` and memory leaks.

```bash
# Automatically dump on OOM (always enable in production)
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=/var/log/app/heapdump.hprof

# Dump on OOM and exit (prevents the app limping along in a broken state)
-XX:+HeapDumpOnOutOfMemoryError
-XX:+ExitOnOutOfMemoryError
-XX:HeapDumpPath=/tmp/

# Manual heap dump with jmap
jmap -dump:format=b,file=/tmp/heap-$(date +%Y%m%d-%H%M%S).hprof <pid>

# Live objects only (smaller file — excludes GC candidates)
jmap -dump:live,format=b,file=/tmp/heap-live.hprof <pid>
```

**Analysing heap dumps:** Use Eclipse Memory Analyzer (MAT) or IntelliJ's heap dump viewer (`File → Open` a `.hprof`).

---

## Startup and compilation flags

```bash
# Disable bytecode verification (only in trusted, closed environments — speeds startup)
-Xverify:none

# Tiered compilation (default Java 8+): interpreter → C1 → C2
-XX:+TieredCompilation

# GraalVM native image (compile once, run instantly — no JVM warmup)
native-image -jar myapp.jar

# Spring Boot AOT (Ahead-of-Time) mode with GraalVM
mvn -Pnative native:compile
```

---

## Diagnostic and monitoring flags

```bash
# Print JVM version and all active flags
java -XX:+PrintFlagsFinal -version

# Print only non-default flags
java -XX:+PrintFlagsFinal -version | grep -v " false " | grep -v " 0 "

# Enable JFR (Java Flight Recorder) — low overhead profiling
-XX:+FlightRecorder
-XX:StartFlightRecording=filename=/tmp/app.jfr,duration=60s,settings=profile

# Start JFR on a running process
jcmd <pid> JFR.start duration=60s filename=/tmp/recording.jfr

# Dump JFR recording
jcmd <pid> JFR.dump filename=/tmp/recording.jfr

# View JFR: JDK Mission Control (JMC) — GUI tool from Oracle/OpenJDK
```

---

## Production-ready Spring Boot baseline

```bash
# JAVA_OPTS for a Spring Boot microservice in Kubernetes:

JAVA_OPTS="\
  -XX:+UseContainerSupport \
  -XX:MaxRAMPercentage=75.0 \
  -XX:+UseG1GC \
  -XX:MaxGCPauseMillis=200 \
  -XX:+HeapDumpOnOutOfMemoryError \
  -XX:HeapDumpPath=/tmp/heapdump.hprof \
  -XX:+ExitOnOutOfMemoryError \
  -Xlog:gc*:file=/var/log/app/gc.log:time,uptime:filecount=5,filesize=10m \
  -Djava.security.egd=file:/dev/./urandom"

# -Djava.security.egd: speeds up SecureRandom on Linux (important for Tomcat startup)
```

---

## Quick reference card

| I want to... | Flag |
|---|---|
| Set max heap | `-Xmx2g` |
| Fix heap in containers | `-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0` |
| Use low-latency GC (Java 21) | `-XX:+UseZGC -XX:+ZGenerational` |
| Enable GC logs | `-Xlog:gc*:file=/var/log/gc.log:time:filecount=5,filesize=20m` |
| Dump heap on OOM | `-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/tmp/` |
| Exit cleanly on OOM | `-XX:+ExitOnOutOfMemoryError` |
| Take a thread dump | `jstack <pid>` |
| Take a heap dump manually | `jmap -dump:live,format=b,file=/tmp/heap.hprof <pid>` |
| Profile with low overhead | `-XX:+FlightRecorder` + JDK Mission Control |
| See all active JVM flags | `java -XX:+PrintFlagsFinal -version` |
