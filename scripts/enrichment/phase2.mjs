/** Phase 2 — Java OOP & Core APIs (Days 10–18) */
export default {
  10: `**Inheritance models shared behaviour; polymorphism lets callers depend on supertypes.** Prefer abstract or interface types in method signatures so you can swap implementations (testing, feature flags).

**Override rules:** \`@Override\` catches signature typos; covariant return types are allowed; widening access is allowed, narrowing is not.

**super vs this:** \`super.method()\` to extend parent behaviour in \`@Override\` methods — template method pattern starts here.

**Avoid deep hierarchies:** more than 3–4 levels usually signals missing composition — extract policies or strategies instead.

**Interview:** explain dynamic dispatch: JVM selects the implementation at runtime based on the *actual* object type, not the reference type.`,

  11: `**Abstract class = shared state + partial implementation; interface = capability contract.** Java allows multiple interfaces, single inheritance — design APIs as small interfaces (\`Serializable\`, \`Comparable\`).

**Default methods:** bridge evolution of libraries without breaking implementors — know when they cause diamond ambiguity (resolve with explicit \`InterfaceName.super.m()\`).

**When to use which:** if two concepts share a lot of concrete code, abstract base; if only behaviour name matters, interface.

**sealed types (Java 17+):** model closed hierarchies (AST nodes, payment types) for exhaustive \`switch\` — mention in senior interviews.`,

  12: `**Encapsulation = invariants live inside the object.** Expose getters; avoid public mutable fields unless simple DTOs in trusted packages.

**Immutability:** \`final\` fields + defensive copies for mutable components (\`Date\`, collections) — \`List.copyOf\` / \`Collections.unmodifiableList\` for returning internal state.

**JavaBeans vs records:** beans for frameworks; \`record\` for transparent data carriers (DTOs, events) with less boilerplate.

**Thread-safety note:** encapsulation alone does not imply thread safety — document concurrency expectations on public types.`,

  13: `**Static nested class** is like a top-level class with name scoping — use for builders tied to outer API.

**Inner (non-static) class** holds implicit reference to outer instance — memory leak risk if you pass it to long-lived callbacks.

**Local / anonymous classes:** rare in modern code; lambdas replaced most anonymous \`Runnable\` usages — still appear in legacy frameworks.

**Practice:** convert an anonymous \`new Listener()\` to lambda + extract interface when behaviour grows beyond one method.`,

  14: `**Pick the right collection:** \`ArrayList\` default for indexed access; \`LinkedList\` rarely wins; \`HashMap\` average O(1); \`TreeMap\` for sorted keys.

**Equals/hashCode contract:** if you use objects as \`HashMap\` keys, both must be consistent — break one and lookups fail mysteriously.

**ConcurrentHashMap vs Collections.synchronizedMap:** prefer CHM for read-heavy concurrent maps; understand \`compute\` methods for atomic updates.

**Memory:** iterators are fail-fast by design — do not modify collection while iterating except via iterator \`remove\` or concurrent variants.`,

  15: `**Iterator pattern decouples traversal from structure.** Enhanced for-loop compiles to iterator under the hood.

**Spliterator:** backbone of parallel streams — understand \`trySplit\` conceptually for data-heavy pipelines.

**Removing while iterating:** use \`Iterator.remove()\` or collect-then-remove pattern — \`ConcurrentModificationException\` is a feature, not a bug.

**Legacy Enumeration:** still in \`Vector\` / \`Hashtable\` — know it exists for maintenance reading only.`,

  16: `**\`Comparable\` = natural ordering; \`Comparator\` = external or multiple orderings.** Implement \`compareTo\` consistent with \`equals\` or document why not (e.g. \`BigDecimal\`).

**Comparator composition:** \`Comparator.comparing\`.thenComparing\` reads declaratively — prefer over manual nested ifs.

**Sorting stability:** \`Collections.sort\` / \`List.sort\` are stable — equal elements keep relative order (important for multi-key sorts).

**Interview trap:** \`compareTo\` returning \`a - b\` on large ints can overflow — use \`Integer.compare\`.`,

  17: `**\`Path\` + \`Files\` API (NIO.2)** is the modern default — \`Paths.get\`, \`Files.readString\`, \`Files.lines\` with try-with-resources.

**Charsets:** always specify \`StandardCharsets.UTF_8\` when converting bytes — platform default charset breaks on different servers.

**Buffered I/O:** wrap streams for large files; \`InputStream\` / \`Reader\` distinction — bytes vs characters.

**Serialization caveat:** Java serialization is brittle for long-lived APIs — prefer JSON/Protobuf for service boundaries; know \`Serializable\` for caches and legacy only.`,

  18: `**\`enum\` is a full class** — can have fields, constructors (private), and methods; use for fixed sets of constants with behaviour (\`Operation.PLUS.apply\`).

**Records:** immutable data carriers; canonical constructor can be compact; watch nested mutable fields.

**Pattern matching on types:** \`switch (o)\` with \`case String s\` reduces casts — practice with sealed hierarchies.

**Migration story:** replace stringly-typed status fields with enums + DB mapping layer — fewer invalid states at runtime.`,
};
