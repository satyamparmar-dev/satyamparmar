/** Phase 4 — Java Advanced & 17+ (Days 28–37) */
export default {
  28: `**Modern Java features reduce noise:** \`var\` for locals when type is obvious; \`record\` for DTOs; pattern matching in \`instanceof\` and \`switch\`.

**Preview features** require explicit \`--enable-preview\` — avoid in libraries until finalized.

**Migration path:** upgrade JDK first, then adopt syntax module by module — binary compatibility is strong but behavioural changes exist (strong encapsulation).`,

  29: `**Generics erase to raw types at runtime** — type parameters are compile-time checks; reflection and arrays need care (\`GenericArrayCreation\` errors).

**Wildcards:** \`PECS\` — producer extends, consumer super — guides API signatures for collections.

**Bounded type parameters** capture constraints (\`T extends Comparable<T>\`) — enables generic algorithms.

**Practice:** write a generic \`Pair<L,R>\` and a static factory — feel erasure in arrays vs lists.`,

  30: `**Lambda = functional interface instance** — target type inferred from context; effectively final variables captured.

**Method references** shorten code when signature matches (\`String::length\`).

**Streams are not always faster** — overhead for tiny collections; parallel streams need CPU-bound work and thread-safe operations.

**Avoid side effects** in \`map\` — use \`peek\` only for debugging; collect with clear combiners for parallel.`,

  31: `**\`Optional\`** models absence without null — do not use as fields or collections elements; use for return types.

**\`orElse\` vs \`orElseGet\`** — supplier avoids cost when default is expensive.

**Exceptions:** \`orElseThrow\` with supplier message — clearer than bare \`get()\`.

**Interoperability:** legacy APIs return null — wrap at boundary, not everywhere internally.`,

  32: `**Time API (java.time)** replaces \`Date\`/\`Calendar\` — \`Instant\` for machine timeline, \`ZonedDateTime\` for human zones.

**Persist as ISO-8601** strings or epoch + zone ID — never mix local and zoned without conversion.

**Period vs Duration** — date-based vs time-based — using wrong one breaks DST math.

**Formatting:** \`DateTimeFormatter\` is immutable and thread-safe — reuse predefined constants.`,

  33: `**Reflection** breaks encapsulation — use for frameworks (DI, serialization), not business logic.

**\`MethodHandle\` / \`VarHandle\`** — faster, more controlled than raw reflection for advanced libraries.

**Security:** module system restricts deep reflection — \`opens\` in \`module-info\` for libraries.

**Performance:** cache \`Class\` / \`Method\` objects; reflection in hot loops hurts.`,

  34: `**Annotation processing** powers Lombok, MapStruct, validation — compile-time code generation vs runtime scanning.

**Retention policies:** SOURCE, CLASS, RUNTIME — choose based on who reads them.

**Constraints:** annotations cannot extend other annotations — compose multiple markers instead.

**Testing:** verify generated behaviour with bytecode viewers only when debugging processors — usually trust integration tests.`,

  35: `**Module boundaries** enforce strong encapsulation — \`exports\` vs \`opens\`; unnamed module for classpath chaos during migration.

**ServiceLoader** discovers implementations — lightweight alternative to full DI containers for plugins.

**JPMS vs Maven coordinates** — module name != Maven artifact; document both in libraries.

**Gradual migration:** automatic modules from JAR names — temporary bridge, not end state.`,

  36: `**JVM tuning starts with metrics:** GC logs, heap dumps, async profiler — guesswork wastes time.

**Generational hypothesis:** most objects die young — tune young gen for allocation rate.

**GC algorithms:** throughput vs latency collectors — choose based on SLA (p99 latency vs batch jobs).

**Off-heap / direct buffers** for NIO — understand when OOME is native memory, not heap.`,

  37: `**Security manager** deprecated/removal trajectory — understand policy files historically; modern apps use OS/container boundaries + library hardening.

**TLS:** prefer TLS 1.2+; certificate pinning for mobile; never disable verification in prod.

**Secrets:** not in source — env + vaults; rotate keys; least privilege IAM.

**Dependency scanning:** OWASP dependency-check / Snyk in CI — supply chain attacks are real interview topics.`,
};
