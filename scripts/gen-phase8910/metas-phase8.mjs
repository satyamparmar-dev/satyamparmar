/** Phase 8 — days 68–76 (Cloud, Databases & DevOps) */

function LO(title) {
  return [
    `Explain **${title}** with production trade-offs, SLO thinking, and failure modes`,
    `Implement small **Java** snippets that anchor interview whiteboard discussions`,
    `Connect **observability** and **capacity** signals to real operational decisions`,
    `Identify common **pitfalls** that cause incidents or cost surprises at scale`,
    `Compare alternatives using **constraints** (latency, cost, team skills, compliance)`,
    `Present answers with **structure**: problem, options, decision, verification`,
  ];
}

export const METAS_8 = [
  {
    day: 68,
    phaseNum: 8,
    phaseId: 'phase8',
    title: 'Advanced SQL',
    T: 'Advanced SQL',
    prereqs: ['Day 67', 'Day 66'],
    drillTags: ['SQL', 'indexes', 'EXPLAIN', 'joins', 'window'],
    extraTags: ['SQL'],
    E: ['Implemented: Advanced SQL', 'Focus: Tune pending orders query on 10M rows.'],
    learningObjectives: LO('Advanced SQL'),
    conceptualExtra: [
      ['What is a **covering** **index** and when does it win?', 'Index includes all selected columns so the engine avoids heap lookups for that query pattern.'],
      ['Explain **SARGable** predicates.', 'Predicates that allow index use—avoid wrapping indexed columns in functions.'],
      ['**Window** **functions** vs **GROUP** **BY** for “latest row per key”?', 'Windows keep detail rows; group-by collapses—pick based on whether you need ties or ranking.'],
      ['How do **isolation** **levels** change **locking** and **anomalies**?', 'Higher isolation reduces anomalies but increases blocking or retries—match to business tolerance.'],
      ['What signals suggest **N+1** **queries** from an ORM?', 'High query count per request, repeated similar SQL, and missing batch fetch or join strategies.'],
    ],
    codeExtra: [
      ['Print a **JOIN** shape you would whiteboard', '// users u join orders o on u.id = o.user_id'],
      ['**Index** **seek** vs **scan** one-liner comment', '// seek when selective predicate; scan when most rows match'],
      ['**ROW_NUMBER** partition sketch', '// partition by user_id order by created_at desc'],
      ['**EXPLAIN** purpose in one line', '// compare estimated vs actual rows in Postgres ANALYZE'],
      ['**Deadlock** mitigation pattern', '// consistent lock ordering; smaller transactions'],
    ],
    why: `**SQL** is still how **money** and **truth** meet in most systems. Senior interviews reward **EXPLAIN** discipline, **index** reasoning, and honest talk about **isolation** trade-offs—not memorized joins alone.`,
    theory: `### Day 68 — **Advanced** **SQL**\n\n### 1. Access paths\n**Seek**, **scan**, **bitmap**, **index-only** plans.\n\n### 2. Join algorithms\n**Nested** loops vs **hash** vs **merge**—cardinality matters.\n\n### 3. Windows\n**Ranking** and **running** aggregates without losing row detail.\n\n### 4. Transactions\n**Isolation**, **locks**, **deadlocks**, **retries**.\n\n### 5. ORM reality\n**N+1**, **batching**, **fetch** joins.\n\n### 6. Story\n**10M** **rows** pending orders—composite **index** on **(status, created_at)** plus **covering** includes for hot columns.`,
    basic: {
      title: 'Basic — JOIN printed as discussion anchor',
      filename: 'Day68Basic.java',
      description: 'Whiteboard-friendly SQL string.',
      code: `package arch.day68;

public class Day68Basic {
    public static void main(String[] args) {
        System.out.println("SELECT u.name, o.id FROM users u JOIN orders o ON u.id = o.user_id");
    }
}
`,
      output: `SELECT u.name, o.id FROM users u JOIN orders o ON u.id = o.user_id\n`,
    },
    intermediate: {
      title: 'Intermediate — Selectivity toy',
      filename: 'Day68Intermediate.java',
      description: 'Print seek vs scan hint.',
      code: `package arch.day68;

public class Day68Intermediate {
    public static void main(String[] args) {
        boolean selective = true;
        System.out.println(selective ? "seek" : "seq");
    }
}
`,
      output: `seek\n`,
    },
    advanced: {
      title: 'Advanced — Window clause string',
      filename: 'Day68Advanced.java',
      description: 'ROW_NUMBER pattern for latest-per-group discussion.',
      code: `package arch.day68;

public class Day68Advanced {
    public static void main(String[] args) {
        System.out.println("ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC)");
    }
}
`,
      output: `ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC)\n`,
    },
    diagram: {
      title: 'Query planner path',
      description: 'Predicate pushes into index seek when selective.',
      plantuml: `@startuml
title Day 68 — SQL plan
database Table
Table -> Index : seek on (status, created_at)
Index -> Table : optional heap fetch
@enduml`,
    },
    pitfalls: [
      '**Indexes** without **workload** evidence.',
      '**Functions** on **indexed** columns breaking **SARGability**.',
      '**SELECT** ***** in **hot** paths increasing **IO**.',
      '**Long** **transactions** holding **locks**.',
      '**Ignoring** **EXPLAIN** **ANALYZE** after **schema** change.',
      '**ORM** **defaults** causing **N+1**.',
      '**Missing** **monitoring** on **slow** **query** log.',
      '**Wrong** **isolation** for **payment** flows.',
    ],
    cheatsheet: `| Topic | Recall |
|---|---|
| Covering index | Avoid heap fetch |
| SARGable | Predicate shape |
| Window | Rank without collapse |
| Isolation | Anomalies vs locks |
| N+1 | ORM batching |
| Deadlock | Lock order |
| EXPLAIN | Estimates vs actual |
| Seek vs scan | Selectivity |
| Composite index | Leading column rules |
| Vacuum/analyze | Planner stats |`,
  },
  {
    day: 69,
    phaseNum: 8,
    phaseId: 'phase8',
    title: 'Transactions & Connection Pooling',
    T: 'transactions and pooling',
    prereqs: ['Day 68', 'Day 67'],
    drillTags: ['HikariCP', 'JDBC', 'transactions', 'pool', 'timeouts'],
    extraTags: ['JDBC', 'HikariCP'],
    E: ['Implemented: Transactions & Connection Pooling', 'Focus: HikariCP tuning for high concurrency.'],
    learningObjectives: LO('Transactions & Connection Pooling'),
    conceptualExtra: [
      ['What does **HikariCP** optimize for?', 'Fast handoff, minimal overhead, and predictable pool metrics under load.'],
      ['**maxPoolSize** vs **database** **connection** **limits**?', 'Pool must stay below DB max connections across all instances combined.'],
      ['Why **leakDetectionThreshold**?', 'Surfaces borrowed connections not returned—common production footgun.'],
      ['**Read** **committed** vs **repeatable** **read** in practice?', 'Phantom vs non-repeatable read trade-offs; pick with business rules.'],
      ['What is **connection** **validation** **query** cost?', 'Health checks add latency—tune frequency and prefer lightweight validation when supported.'],
    ],
    codeExtra: [
      ['**DataSource** bean pseudo', '// HikariConfig setJdbcUrl setMaximumPoolSize'],
      ['**@Transactional** boundary comment', '// proxy applies to public methods on Spring beans'],
      ['**setAutoCommit(false)** meaning', '// batch work in explicit transaction'],
      ['**connectionTimeout** vs **socket** timeout', '// wait for pool vs wait on network'],
      ['**PreparedStatement** pooling note', '// driver/server caches differ'],
    ],
    why: `Pools and transactions decide whether your service **fails** gracefully or **collapses** the database. Interviewers expect **HikariCP** knobs and **isolation** honesty.`,
    theory: `### Day 69 — **Transactions** & **pooling**\n\n### 1. Pool sizing\n**Little’s law** intuition; **CPU** vs **wait** dominated workloads.\n\n### 2. Timeouts\n**Connection**, **socket**, **statement** layers.\n\n### 3. Spring @Transactional\n**Proxy** semantics, **rollback** rules, **self-invocation** pitfalls.\n\n### 4. JDBC basics\n**AutoCommit**, **batch** updates.\n\n### 5. Observability\n**Active**, **idle**, **pending** threads; **wait** metrics.\n\n### 6. Story\n**Pool** **exhaustion** during sale—raise **pool** only after proving DB **headroom** and fixing **slow** queries.`,
    basic: {
      title: 'Basic — Pool vocabulary',
      filename: 'Day69Basic.java',
      description: 'Print core terms.',
      code: `package arch.day69;

public class Day69Basic {
    public static void main(String[] args) {
        System.out.println("pool: reuse connections; cap total concurrency to DB");
        System.out.println("transaction: atomic unit of work with ACID expectations");
    }
}
`,
      output: `pool: reuse connections; cap total concurrency to DB
transaction: atomic unit of work with ACID expectations
`,
    },
    intermediate: {
      title: 'Intermediate — Pool size toy',
      filename: 'Day69Intermediate.java',
      description: 'Simple max pool print.',
      code: `package arch.day69;

public class Day69Intermediate {
    public static void main(String[] args) {
        int maxPool = 20;
        System.out.println("maxPoolSize=" + maxPool);
    }
}
`,
      output: `maxPoolSize=20\n`,
    },
    advanced: {
      title: 'Advanced — Timeout ordering reminder',
      filename: 'Day69Advanced.java',
      description: 'Outer timeout longer than inner.',
      code: `package arch.day69;

public class Day69Advanced {
    public static void main(String[] args) {
        System.out.println("socketTimeoutMs < statementTimeoutMs < transactionTimeoutMs (typical nesting)");
    }
}
`,
      output: `socketTimeoutMs < statementTimeoutMs < transactionTimeoutMs (typical nesting)
`,
    },
    diagram: {
      title: 'App to pool to DB',
      description: 'Many threads borrow few connections.',
      plantuml: `@startuml
title Day 69 — Pooling
participant App
participant Pool
database DB
App -> Pool : getConnection
Pool -> DB : physical conn cap
@enduml`,
    },
    pitfalls: [
      '**maxPoolSize** **per** **pod** **times** **replicas** **> DB max**.',
      '**Swallowing** **exceptions** inside **@Transactional**.',
      '**No** **leak** detection in **staging**.',
      '**Huge** **transactions** **holding** **connections**.',
      '**Default** **isolation** **assumed** **safe** for **money**.',
      '**Ignoring** **statement** **cache** and **prepared** **statement** costs.',
      '**No** **metrics** on **pool** **wait** time.',
      '**Retry** storms on **deadlocks** without **jitter**.',
    ],
    cheatsheet: `| Knob | Recall |
|---|---|
| maxPoolSize | Per service budget |
| connectionTimeout | Wait for free conn |
| leakDetectionThreshold | Find leaks |
| validationTimeout | Health check cost |
| autoCommit | false for tx |
| isolation | Business choice |
| rollbackFor | checked exceptions |
| batch | reduce round trips |
| socket timeout | network bound |
| statement timeout | query bound |`,
  },
  {
    day: 70,
    phaseNum: 8,
    phaseId: 'phase8',
    title: 'NoSQL — MongoDB and Cassandra',
    T: 'MongoDB and Cassandra',
    prereqs: ['Day 69', 'Day 68'],
    drillTags: ['MongoDB', 'Cassandra', 'CAP', 'modeling', 'partition'],
    extraTags: ['NoSQL'],
    E: ['Implemented: NoSQL - MongoDB & Cassandra', 'Focus: Modeling and CAP-driven selection.'],
    learningObjectives: LO('NoSQL data stores'),
    conceptualExtra: [
      ['When **MongoDB** **document** model fits?', 'Flexible schema, nested aggregates, and workload shaped as documents—not every relation maps cleanly to SQL.'],
      ['**Cassandra** **partition** **key** role?', 'Defines data locality; wrong key causes hot partitions and impossible queries.'],
      ['**CAP** shorthand for **Cassandra** vs **Mongo** in interviews?', 'Discuss **tunable** consistency, replication, and what your app truly needs for reads/writes.'],
      ['What is **wide** **row** thinking in Cassandra?', 'Clustering columns order on disk; queries must match partition key constraints.'],
      ['**TTL** in Cassandra/Mongo use cases?', 'Time-series eviction, cache-like collections, compliance-driven expiry—watch compaction impact.'],
    ],
    codeExtra: [
      ['Mongo **find** filter pseudo', '// db.orders.find({ userId: x, status: "PENDING" })'],
      ['Cassandra **PRIMARY** **KEY** comment', '// (partition_key, clustering_cols)'],
      ['**Denormalization** trade note', '// faster reads; write amplification'],
      ['**Secondary** index caution Cassandra', '// not a SQL index; locality limits'],
      ['**Change** streams Mongo mention', '// event-like consumption from oplog'],
    ],
    why: `**NoSQL** wins when your **access** **patterns** are clear and your **team** can operate **replication** and **compaction**. Interviews test **partition** keys and **honest** **CAP** talk.`,
    theory: `### Day 70 — **MongoDB** & **Cassandra**\n\n### 1. Document vs wide-column\n**Shape** data for **queries** you actually run.\n\n### 2. Partitioning\nHot keys, **skew**, **bounded** queries.\n\n### 3. Consistency\n**Read**/**write** concerns, **quorum**-style ideas.\n\n### 4. Operations\n**Compaction**, **backups**, **upgrades**.\n\n### 5. Anti-patterns\nRelational modeling bolted onto wrong store.\n\n### 6. Story\nOrders by **user**—partition by **userId** in Cassandra; embed line items in Mongo when **fetch** is always whole cart.`,
    basic: {
      title: 'Basic — Store headline',
      filename: 'Day70Basic.java',
      description: 'Print store names.',
      code: `package arch.day70;

public class Day70Basic {
    public static void main(String[] args) {
        System.out.println("MongoDB: flexible documents + rich query API");
        System.out.println("Cassandra: partition-first wide rows + linear scale-out");
    }
}
`,
      output: `MongoDB: flexible documents + rich query API
Cassandra: partition-first wide rows + linear scale-out
`,
    },
    intermediate: {
      title: 'Intermediate — Partition key reminder',
      filename: 'Day70Intermediate.java',
      description: 'Toy partition string.',
      code: `package arch.day70;

public class Day70Intermediate {
    public static void main(String[] args) {
        System.out.println("partitionKey=userId for per-user order queries");
    }
}
`,
      output: `partitionKey=userId for per-user order queries\n`,
    },
    advanced: {
      title: 'Advanced — CAP line',
      filename: 'Day70Advanced.java',
      description: 'Trade-off headline.',
      code: `package arch.day70;

public class Day70Advanced {
    public static void main(String[] args) {
        System.out.println("during partition: choose consistency vs availability per product tier");
    }
}
`,
      output: `during partition: choose consistency vs availability per product tier\n`,
    },
    diagram: {
      title: 'Partitioned data flow',
      description: 'Clients route to owning partition.',
      plantuml: `@startuml
title Day 70 — Partitions
actor Client
Client -> NodeA : user partition A
Client -> NodeB : user partition B
@enduml`,
    },
    pitfalls: [
      '**Cassandra** **JOIN** expectations from **SQL** habits.',
      '**Hot** **partition** keys.',
      '**Unbounded** **collections** inside Mongo documents.',
      '**Ignoring** **write** **amplification**.',
      '**Global** **secondary** **indexes** without understanding cost.',
      '**No** **backup**/**restore** drills.',
      '**Treating** **eventual** **consistency** as **zero** **surprise**.',
      '**Wrong** tool for **strong** **multi-row** **invariants**.',
    ],
    cheatsheet: `| Topic | Recall |
|---|---|
| Mongo document | Embed vs reference |
| Cassandra PK | partition + clustering |
| TTL | Expiry + compaction |
| LWT | Lightweight transactions limits |
| Read repair | Eventual hygiene |
| Tombstones | Delete costs |
| Change streams | CDC-like |
| Denorm | Read fast write heavy |
| Skew | Hot key detection |
| Backup | Ops discipline |`,
  },
  {
    day: 71,
    phaseNum: 8,
    phaseId: 'phase8',
    title: 'Redis — Caching and Advanced Patterns',
    T: 'Redis caching',
    prereqs: ['Day 70', 'Day 69'],
    drillTags: ['Redis', 'cache', 'TTL', 'stampede', 'eviction'],
    extraTags: ['Redis'],
    E: ['Implemented: Redis - Caching & Advanced Patterns', 'Focus: Cache stampede prevention design.'],
    learningObjectives: LO('Redis caching'),
    conceptualExtra: [
      ['What is **cache** **stampede**?', 'Many requests miss together and thunder on origin—needs coordination or probabilistic early refresh.'],
      ['**TTL** **jitter** why?', 'Avoid synchronized expiry waves across keys.'],
      ['**Cache-aside** vs **read-through**?', 'Who loads on miss—app code vs integrated layer.'],
      ['Redis **single-threaded** implication?', 'CPU-bound commands block—watch big O operations on hot keys.'],
      ['**Pub/Sub** vs **Streams** rough distinction?', 'Pub/sub best-effort fan-out; streams retain messages for consumer groups.'],
    ],
    codeExtra: [
      ['SET with **NX** **EX** pseudo', '// set if absent with ttl'],
      ['**INCR** rate limit sketch', '// sliding window approximations'],
      ['**Lua** script mention', '// atomic multi-key ops'],
      ['**Redisson** lock caveat', '// fencing tokens in interviews'],
      ['Eviction **policy** comment', '// allkeys-lru vs volatile-ttl'],
    ],
    why: `**Redis** is the **fast** **mutable** tier—misused it becomes **data** **loss**, **stale** reads, or **outage** **multipliers**. Senior answers include **TTL**, **stampede** control, and **memory** limits.`,
    theory: `### Day 71 — **Redis**\n\n### 1. Patterns\n**Cache-aside**, **write-through**, **rate** limiting.\n\n### 2. Consistency\n**TTL**, **invalidation**, **eventual** **staleness** UX.\n\n### 3. Data structures\n**Hash**, **ZSET**, **HyperLogLog** use cases.\n\n### 4. Ops\n**Persistence** modes, **memory** pressure, **slowlog**.\n\n### 5. Failure\nOrigin overload on mass miss.\n\n### 6. Story\nProduct **detail** cache—**jittered** TTL + **singleflight** style lock to stop stampede.`,
    basic: {
      title: 'Basic — Redis roles',
      filename: 'Day71Basic.java',
      description: 'Cache vs primary store.',
      code: `package arch.day71;

public class Day71Basic {
    public static void main(String[] args) {
        System.out.println("Redis: in-memory data structure server");
        System.out.println("cache: faster reads; not source of truth alone for money");
    }
}
`,
      output: `Redis: in-memory data structure server
cache: faster reads; not source of truth alone for money
`,
    },
    intermediate: {
      title: 'Intermediate — TTL jitter toy',
      filename: 'Day71Intermediate.java',
      description: 'Print jitter intent.',
      code: `package arch.day71;

public class Day71Intermediate {
    public static void main(String[] args) {
        System.out.println("ttlWithJitter spreads expirations across time");
    }
}
`,
      output: `ttlWithJitter spreads expirations across time\n`,
    },
    advanced: {
      title: 'Advanced — Stampede guard phrase',
      filename: 'Day71Advanced.java',
      description: 'Single-flight style mitigation label.',
      code: `package arch.day71;

public class Day71Advanced {
    public static void main(String[] args) {
        System.out.println("stampede: mutex per key or request coalescing to origin");
    }
}
`,
      output: `stampede: mutex per key or request coalescing to origin\n`,
    },
    diagram: {
      title: 'Cache-aside sequence',
      description: 'App reads cache then DB on miss.',
      plantuml: `@startuml
title Day 71 — Cache-aside
App -> Cache : get
Cache --> App : miss
App -> DB : load
App -> Cache : set TTL
@enduml`,
    },
    pitfalls: [
      '**No** **TTL** on **ephemeral** cache entries.',
      '**Cache** as **only** **source** of **truth** for **payments**.',
      '**Huge** **values** in **Redis** **blowing** **memory**.',
      '**KEYS** command in **prod**.',
      '**Ignoring** **eviction** **policy** behavior.',
      '**Race** between **write** **DB** and **invalidate**.',
      '**Pub/sub** for **critical** **delivery** without **persistence**.',
      '**No** **monitoring** on **memory** **fragmentation**.',
    ],
    cheatsheet: `| Pattern | Recall |
|---|---|
| Cache-aside | App manages load |
| TTL jitter | Avoid thunder |
| Singleflight | One origin load |
| NX EX | Lock + expire |
| Rate limit | INCR windows |
| Streams | Log-like consume |
| Persistence | RDB/AOF trade |
| Hot key | Shard or replica read |
| Memory | maxmemory policy |
| Slowlog | Find bad commands |`,
  },
  {
    day: 72,
    phaseNum: 8,
    phaseId: 'phase8',
    title: 'Docker for Java Applications',
    T: 'Docker for Java',
    prereqs: ['Day 71', 'Day 70'],
    drillTags: ['Docker', 'JVM', 'layers', 'multi-stage', 'image'],
    extraTags: ['Docker'],
    E: ['Implemented: Docker for Java Applications', 'Focus: Multi-stage Dockerfile for Spring Boot JAR.'],
    learningObjectives: LO('Docker for Java'),
    conceptualExtra: [
      ['Why **multi-stage** **build** for **Spring** **Boot**?', 'Compile in builder image; ship slim runtime with only JAR—smaller attack surface.'],
      ['**distroless** vs **slim** **JRE** images?', 'Less shell tooling vs easier debugging—trade-off per environment.'],
      ['What is **layer** **caching** for Maven/Gradle?', 'Copy dependency descriptors first so dependency layers cache when code changes.'],
      ['**JVM** **container** awareness flags?', 'Respect **cgroup** memory/CPU limits—use modern JDK defaults and verify ergonomics.'],
      ['**.dockerignore** purpose?', 'Shrink build context; avoid leaking secrets and speeding COPY.'],
    ],
    codeExtra: [
      ['**FROM** eclipse-temurin:21-jre comment', '// pick pinned digest in prod'],
      ['**COPY** **--from=build** pattern', '// artifact from builder stage'],
      ['**USER** non-root note', '// security baseline'],
      ['**HEALTHCHECK** caveat', '// align with app readiness'],
      ['**ENTRYPOINT** vs **CMD**', '// exec form vs shell form pitfalls'],
    ],
    why: `Containers package **your** **JVM** assumptions. Interviewers want **multi-stage** builds, **non-root**, and **resource** awareness—not a fat image that happens to run.`,
    theory: `### Day 72 — **Docker** for **Java**\n\n### 1. Images\n**Layers**, **caching**, **pinning** digests.\n\n### 2. Multi-stage\n**Build** vs **runtime** separation.\n\n### 3. JVM in containers\n**Memory** and **CPU** flags vs **cgroups**.\n\n### 4. Security\n**Non-root**, **read-only** rootfs where possible.\n\n### 5. Debugging\n**distroless** trade-offs.\n\n### 6. Story\n**90%** smaller image after multi-stage + **jlink** discussion for specialized runtimes.`,
    basic: {
      title: 'Basic — Container vocabulary',
      filename: 'Day72Basic.java',
      description: 'Image vs container.',
      code: `package arch.day72;

public class Day72Basic {
    public static void main(String[] args) {
        System.out.println("image: immutable template");
        System.out.println("container: running instance with writable layer");
    }
}
`,
      output: `image: immutable template
container: running instance with writable layer
`,
    },
    intermediate: {
      title: 'Intermediate — Layer order principle',
      filename: 'Day72Intermediate.java',
      description: 'Stability for cache.',
      code: `package arch.day72;

public class Day72Intermediate {
    public static void main(String[] args) {
        System.out.println("copy pom before source for better docker layer cache");
    }
}
`,
      output: `copy pom before source for better docker layer cache\n`,
    },
    advanced: {
      title: 'Advanced — Multi-stage headline',
      filename: 'Day72Advanced.java',
      description: 'Interview phrase.',
      code: `package arch.day72;

public class Day72Advanced {
    public static void main(String[] args) {
        System.out.println("multi-stage: build JDK image -> ship slim JRE runtime only");
    }
}
`,
      output: `multi-stage: build JDK image -> ship slim JRE runtime only\n`,
    },
    diagram: {
      title: 'Multi-stage build',
      description: 'Builder produces JAR; runtime copies artifact.',
      plantuml: `@startuml
title Day 72 — Multi-stage
participant Builder
participant Runtime
Builder -> Builder : mvn package
Builder -> Runtime : copy jar
@enduml`,
    },
    pitfalls: [
      '**Secrets** in **image** **layers**.',
      '**Root** **user** by default.',
      '**Fat** **images** slowing deploys.',
      '**Ignoring** **JVM** **heap** vs **container** **limit**.',
      '**No** **health** checks aligned to **app**.',
      '**latest** tag in **production**.',
      '**Huge** **build** **context**.',
      '**Missing** **.dockerignore**.',
    ],
    cheatsheet: `| Topic | Recall |
|---|---|
| Multi-stage | Slim runtime |
| Layer cache | Order matters |
| Non-root | USER directive |
| Pin digest | Reproducible |
| cgroup | JVM ergonomics |
| distroless | Small attack surface |
| .dockerignore | Context size |
| HEALTHCHECK | Probe alignment |
| ENTRYPOINT | Exec form |
| jlink | Custom JRE |`,
  },
  {
    day: 73,
    phaseNum: 8,
    phaseId: 'phase8',
    title: 'Kubernetes Core',
    T: 'Kubernetes core',
    prereqs: ['Day 72', 'Day 71'],
    drillTags: ['Kubernetes', 'pods', 'deployments', 'services', 'probes'],
    extraTags: ['Kubernetes'],
    E: ['Implemented: Kubernetes Core', 'Focus: Diagnose crash-looping pod quickly.'],
    learningObjectives: LO('Kubernetes core'),
    conceptualExtra: [
      ['**Pod** vs **Deployment**?', 'Pod is atomic schedulable unit; Deployment manages replicas and rollouts.'],
      ['**Service** **ClusterIP** vs **NodePort**?', 'Internal stable VIP vs exposing on node ports—ingress usually preferred externally.'],
      ['**readiness** vs **liveness**?', 'Readiness removes from service endpoints; liveness restarts unhealthy container.'],
      ['What is **CrashLoopBackOff** triage order?', 'Events, logs, previous logs, image command, resource limits, config mounts.'],
      ['**ConfigMap** vs **Secret** mounting?', 'Both inject files/env; secrets need RBAC + encryption at rest policies.'],
    ],
    codeExtra: [
      ['kubectl **describe** **pod** comment', '// events section first'],
      ['kubectl **logs** --previous', '// last crashed container'],
      ['**resource** requests/limits pseudo', '// cpu memory in pod spec'],
      ['**label** **selector** on Service', '// ties endpoints to pods'],
      ['**namespace** isolation note', '// rbac boundaries'],
    ],
    why: `**Kubernetes** is the **default** **deployment** **substrate**. You must sound fluent in **pods**, **services**, **deployments**, and **probe** semantics under pressure.`,
    theory: `### Day 73 — **Kubernetes** **core**\n\n### 1. Objects\n**Pod**, **Deployment**, **Service**, **ConfigMap**.\n\n### 2. Networking\n**Cluster** DNS, **Service** VIP, **Ingress** entry.\n\n### 3. Scheduling\n**Requests/limits**, **QoS** classes.\n\n### 4. Observability\n**kubectl** **events**, **metrics** **server** basics.\n\n### 5. Failure\nImage pull backoff, probe failure loops.\n\n### 6. Story\n**CrashLoop**—bad **CMD**, **missing** env, **OOMKilled**—tell the **evidence** path.`,
    basic: {
      title: 'Basic — K8s objects',
      filename: 'Day73Basic.java',
      description: 'Pod and Deployment.',
      code: `package arch.day73;

public class Day73Basic {
    public static void main(String[] args) {
        System.out.println("Pod: smallest deployable unit (containers share net/volumes)");
        System.out.println("Deployment: desired replicas + rolling updates");
    }
}
`,
      output: `Pod: smallest deployable unit (containers share net/volumes)
Deployment: desired replicas + rolling updates
`,
    },
    intermediate: {
      title: 'Intermediate — Probe types',
      filename: 'Day73Intermediate.java',
      description: 'Readiness vs liveness.',
      code: `package arch.day73;

public class Day73Intermediate {
    public static void main(String[] args) {
        System.out.println("readiness=traffic gate; liveness=restart unhealthy");
    }
}
`,
      output: `readiness=traffic gate; liveness=restart unhealthy\n`,
    },
    advanced: {
      title: 'Advanced — Crash loop triage',
      filename: 'Day73Advanced.java',
      description: 'Command sequence as string.',
      code: `package arch.day73;

public class Day73Advanced {
    public static void main(String[] args) {
        System.out.println("kubectl describe pod -> events -> logs --previous -> check probes -> limits");
    }
}
`,
      output: `kubectl describe pod -> events -> logs --previous -> check probes -> limits\n`,
    },
    diagram: {
      title: 'Service to Pod endpoints',
      description: 'kube-proxy routes Service to ready pods.',
      plantuml: `@startuml
title Day 73 — Service
Ingress -> Service : cluster DNS
Service -> Pod : endpoints subset ready
@enduml`,
    },
    pitfalls: [
      '**Liveness** probes too aggressive killing slow starts.',
      '**readiness** missing causing **502** during rollout.',
      '**No** **requests/limits** causing **noisy** neighbor.',
      '**latest** image tags.',
      '**Cluster** **wide** **RBAC** **overgrant**.',
      '**Ignoring** **imagePullSecrets** failures.',
      '**Stateful** workloads on **Deployment** without thought.',
      '**Missing** **PodDisruptionBudget** for HA services.',
    ],
    cheatsheet: `| Topic | Recall |
|---|---|
| Pod | Share network |
| Deployment | Rollout controller |
| Service | Stable VIP |
| Ingress | HTTP routing |
| ConfigMap | Non-secret config |
| Secret | Sensitive bytes |
| probe | startup/live/ready |
| QoS | requests/limits |
| events | describe first |
| PDB | voluntary disruption |`,
  },
  {
    day: 74,
    phaseNum: 8,
    phaseId: 'phase8',
    title: 'Kubernetes Advanced and Helm',
    T: 'Kubernetes advanced',
    prereqs: ['Day 73', 'Day 72'],
    drillTags: ['Helm', 'HPA', 'ingress', 'GitOps', 'charts'],
    extraTags: ['Helm', 'Kubernetes'],
    E: ['Implemented: Kubernetes Advanced & Helm', 'Focus: Readiness/liveness/HPA and Helm values strategy.'],
    learningObjectives: LO('Kubernetes advanced and Helm'),
    conceptualExtra: [
      ['What is **Helm** **chart** **values** layering?', 'defaults.yaml + environment overrides + secrets injection patterns.'],
      ['How **HPA** chooses **replicas**?', 'Metrics like CPU/memory/custom; needs sane requests and cooldown tuning.'],
      ['**NetworkPolicy** value?', 'Default-allow clusters need explicit policies for zero-trust segments.'],
      ['**Ingress** controller responsibilities?', 'TLS termination, routing rules, sometimes auth integration.'],
      ['**GitOps** (high level) benefit?', 'Declarative desired state, audit trail, controlled promotions.'],
    ],
    codeExtra: [
      ['helm **upgrade** **--install** comment', '// idempotent release'],
      ['values **dev**/ **prod** split', '// reduce drift'],
      ['**HorizontalPodAutoscaler** metric pseudo', '// targetCPUUtilizationPercentage'],
      ['**PodDisruptionBudget** minAvailable', '// HA during node drains'],
      ['**cert-manager** mention', '// TLS for ingress'],
    ],
    why: `Advanced **Kubernetes** is **operational** **engineering**: **Helm** values discipline, **autoscaling** that does not flapping, and **network** policies that match reality.`,
    theory: `### Day 74 — **Advanced** **K8s** & **Helm**\n\n### 1. Helm\n**Charts**, **values**, **hooks**, **rollbacks**.\n\n### 2. Autoscaling\n**HPA**, **VPA** awareness, **custom** metrics.\n\n### 3. Networking\n**Ingress**, **NetworkPolicy**.\n\n### 4. GitOps\n**Argo CD** / **Flux** patterns at high level.\n\n### 5. Upgrades\n**CRD** versioning, **compatibility** matrices.\n\n### 6. Story\n**HPA** thrash—widen **cooldown**, fix **CPU** **requests** fantasy numbers.`,
    basic: {
      title: 'Basic — Helm vocabulary',
      filename: 'Day74Basic.java',
      description: 'Chart and release.',
      code: `package arch.day74;

public class Day74Basic {
    public static void main(String[] args) {
        System.out.println("Helm chart: templated Kubernetes manifests");
        System.out.println("release: installed instance with values");
    }
}
`,
      output: `Helm chart: templated Kubernetes manifests
release: installed instance with values
`,
    },
    intermediate: {
      title: 'Intermediate — HPA intent',
      filename: 'Day74Intermediate.java',
      description: 'Scale metric headline.',
      code: `package arch.day74;

public class Day74Intermediate {
    public static void main(String[] args) {
        System.out.println("HPA: adjust replicas from metrics vs targets");
    }
}
`,
      output: `HPA: adjust replicas from metrics vs targets\n`,
    },
    advanced: {
      title: 'Advanced — Probe + values strategy',
      filename: 'Day74Advanced.java',
      description: 'Combined interview phrase.',
      code: `package arch.day74;

public class Day74Advanced {
    public static void main(String[] args) {
        System.out.println("align probes with startup time; split values per env; watch HPA cooldown");
    }
}
`,
      output: `align probes with startup time; split values per env; watch HPA cooldown\n`,
    },
    diagram: {
      title: 'Helm release pipeline',
      description: 'Values render into manifests applied to cluster.',
      plantuml: `@startuml
title Day 74 — Helm
folder Chart
folder Values
Chart -> Cluster : rendered manifests
Values -> Chart : inject
@enduml`,
    },
    pitfalls: [
      '**Templating** **secrets** into **git**.',
      '**HPA** without **correct** **requests**.',
      '**Ingress** **misrouting** **TLS** **SNI**.',
      '**Flapping** **replicas** from tight thresholds.',
      '**Ignoring** **CRD** **upgrade** order.',
      '**NetworkPolicy** that blocks **DNS** accidentally.',
      '**Helm** **hooks** misused breaking rollouts.',
      '**No** **limit** on **maxReplicas** cost risk.',
    ],
    cheatsheet: `| Topic | Recall |
|---|---|
| Helm values | Env layering |
| HPA | Metric targets |
| PDB | HA drains |
| Ingress | TLS + rules |
| NetworkPolicy | Default deny |
| GitOps | Declarative sync |
| CRD | Version skew |
| VPA | Right-size caution |
| Chart hooks | Job ordering |
| Rollback | helm history |`,
  },
  {
    day: 75,
    phaseNum: 8,
    phaseId: 'phase8',
    title: 'AWS for Java Developers',
    T: 'AWS for Java',
    prereqs: ['Day 74', 'Day 73'],
    drillTags: ['AWS', 'EC2', 'S3', 'RDS', 'Lambda', 'EKS'],
    extraTags: ['AWS'],
    E: ['Implemented: AWS for Java Developers', 'Focus: Choose EC2/S3/RDS/Lambda/EKS for workload.'],
    learningObjectives: LO('AWS for Java developers'),
    conceptualExtra: [
      ['When **Lambda** fits a **Java** service?', 'Spiky short workloads with manageable cold start; avoid huge JVM footguns without tuning.'],
      ['**RDS** vs self-managed **Postgres**?', 'Ops offload vs control; patch windows, extensions, performance insights.'],
      ['**S3** **consistency** model headline?', 'Strong read-after-write for new objects; understand listing semantics for apps.'],
      ['**EKS** when vs **ECS**?', 'Kubernetes ecosystem portability vs simpler AWS-native ops—team skill dependent.'],
      ['**IAM** **least** **privilege** for apps?', 'Task roles, instance profiles, scoped policies—not long-lived keys in code.'],
    ],
    codeExtra: [
      ['AWS SDK **client** builder pseudo', '// region + credentials provider chain'],
      ['**S3** **presigned** URL idea', '// time-bounded access'],
      ['**RDS** **proxy** mention', '// connection pooling to DB'],
      ['**CloudWatch** metric filter', '// structured logs to metrics'],
      ['**STS** **AssumeRole** comment', '// cross-account access'],
    ],
    why: `**AWS** interviews for **Java** devs blend **service** selection, **IAM**, and **cost**/**egress** awareness—plus knowing when **not** to use **Lambda**.`,
    theory: `### Day 75 — **AWS** for **Java**\n\n### 1. Compute\n**EC2**, **Lambda**, **ECS/EKS** decision grid.\n\n### 2. Data\n**S3**, **RDS**, **DynamoDB** positioning.\n\n### 3. Security\n**IAM**, **VPC**, **KMS**.\n\n### 4. Observability\n**CloudWatch**, **X-Ray**.\n\n### 5. Cost\n**Savings** plans, **egress** traps.\n\n### 6. Story\n**Java** **Lambda** cold start—**SnapStart** or **smaller** **JDK** footprint discussion.`,
    basic: {
      title: 'Basic — Service map',
      filename: 'Day75Basic.java',
      description: 'One-line roles.',
      code: `package arch.day75;

public class Day75Basic {
    public static void main(String[] args) {
        System.out.println("S3: object storage; RDS: managed relational; Lambda: event compute; EKS: managed Kubernetes");
    }
}
`,
      output: `S3: object storage; RDS: managed relational; Lambda: event compute; EKS: managed Kubernetes\n`,
    },
    intermediate: {
      title: 'Intermediate — IAM principle',
      filename: 'Day75Intermediate.java',
      description: 'Least privilege.',
      code: `package arch.day75;

public class Day75Intermediate {
    public static void main(String[] args) {
        System.out.println("prefer task roles and scoped policies over static keys");
    }
}
`,
      output: `prefer task roles and scoped policies over static keys\n`,
    },
    advanced: {
      title: 'Advanced — Selection headline',
      filename: 'Day75Advanced.java',
      description: 'Workload fit.',
      code: `package arch.day75;

public class Day75Advanced {
    public static void main(String[] args) {
        System.out.println("pick by latency, burst, ops budget, data locality, and team skills");
    }
}
`,
      output: `pick by latency, burst, ops budget, data locality, and team skills\n`,
    },
    diagram: {
      title: 'VPC sketch',
      description: 'Private subnets for data; public edge for ingress.',
      plantuml: `@startuml
title Day 75 — VPC
cloud AWS {
  rectangle PublicSubnet
  rectangle PrivateSubnet
}
PublicSubnet -> PrivateSubnet : controlled access
@enduml`,
    },
    pitfalls: [
      '**Public** **S3** buckets.',
      '**Long-lived** **IAM** **keys** in **repos**.',
      '**Ignoring** **egress** **cost**.',
      '**Lambda** for **long** **CPU** jobs.',
      '**Wide** **security** **groups** **0.0.0.0/0**.',
      '**No** **backups** on **RDS** **PITR** planning.',
      '**Mystery** **NAT** **gateway** **costs**.',
      '**Under** **provisioned** **Dynamo** **capacity** modes mismatch.',
    ],
    cheatsheet: `| Service | Recall |
|---|---|
| S3 | Objects + policies |
| RDS | Managed SQL |
| Lambda | Event short work |
| EKS | K8s control plane |
| IAM | Roles not keys |
| VPC | Subnet isolation |
| KMS | Key management |
| CW | Logs metrics |
| X-Ray | Distributed trace |
| Cost | Egress + tiering |`,
  },
  {
    day: 76,
    phaseNum: 8,
    phaseId: 'phase8',
    title: 'CI/CD and Observability',
    T: 'CI/CD and observability',
    prereqs: ['Day 75', 'Day 74'],
    drillTags: ['CI/CD', 'pipeline', 'metrics', 'traces', 'logs', 'SLO'],
    extraTags: ['DevOps'],
    E: ['Implemented: CI/CD & Observability', 'Focus: Pipeline plus metrics/traces/logs rollout checks.'],
    learningObjectives: LO('CI/CD and observability'),
    conceptualExtra: [
      ['What makes a **pipeline** **production** grade?', 'Tests, artifacts, signing, progressive rollout, rollback, audit trail.'],
      ['**SLO** vs **monitoring** dashboard pretty charts?', 'SLO ties alerts to customer impact and error budgets.'],
      ['**RED** / **USE** methods quick meaning?', 'Rate errors duration for services; utilization saturation errors for resources.'],
      ['How **tracing** helps **Java** **microservices**?', 'Connect Feign/WebClient spans across hops; find slow dependency.'],
      ['**Canary** analysis metrics?', 'Compare golden signals between baseline and candidate with automatic promotion gates.'],
    ],
    codeExtra: [
      ['GitHub Actions **workflow** step pseudo', '// build test scan deploy'],
      ['**OTel** exporter comment', '// traces to collector'],
      ['**Micrometer** timer tag', '// outcome=success|error'],
      ['**structured** JSON log field', '// trace_id span_id'],
      ['**feature** flag in pipeline', '// gate risky paths'],
    ],
    why: `Shipping safely is **CI/CD**; understanding incidents is **observability**. Senior engineers connect **pipelines**, **SLOs**, and **tracing** into one coherent reliability story.`,
    theory: `### Day 76 — **CI/CD** & **observability**\n\n### 1. Pipeline stages\n**Build**, **test**, **security** scan, **deploy**, **verify**.\n\n### 2. Progressive delivery\n**Canary**, **blue/green**, **feature** flags.\n\n### 3. Telemetry\n**Metrics**, **logs**, **traces** correlation.\n\n### 4. SLO culture\n**Error** budgets drive prioritization.\n\n### 5. Developer experience\nFast feedback without skipping gates.\n\n### 6. Story\nDeploy **ok** but **SLO** burn—rollback via **automated** canary analysis.`,
    basic: {
      title: 'Basic — Three pillars',
      filename: 'Day76Basic.java',
      description: 'Metrics logs traces.',
      code: `package arch.day76;

public class Day76Basic {
    public static void main(String[] args) {
        System.out.println("metrics: aggregates; logs: events; traces: request causality");
    }
}
`,
      output: `metrics: aggregates; logs: events; traces: request causality\n`,
    },
    intermediate: {
      title: 'Intermediate — Pipeline checks',
      filename: 'Day76Intermediate.java',
      description: 'Rollout verification.',
      code: `package arch.day76;

public class Day76Intermediate {
    public static void main(String[] args) {
        System.out.println("after deploy: compare error rate latency saturation vs pre-deploy baseline");
    }
}
`,
      output: `after deploy: compare error rate latency saturation vs pre-deploy baseline\n`,
    },
    advanced: {
      title: 'Advanced — SLO one-liner',
      filename: 'Day76Advanced.java',
      description: 'Budget concept.',
      code: `package arch.day76;

public class Day76Advanced {
    public static void main(String[] args) {
        System.out.println("SLO error budget: allowed unreliability before freeze features");
    }
}
`,
      output: `SLO error budget: allowed unreliability before freeze features\n`,
    },
    diagram: {
      title: 'Trace across services',
      description: 'W3C trace context propagation.',
      plantuml: `@startuml
title Day 76 — Trace
Gateway -> ServiceA : traceparent
ServiceA -> ServiceB : traceparent
@enduml`,
    },
    pitfalls: [
      '**Deploy** without **automated** **rollback** criteria.',
      '**High** **cardinality** **metrics** exploding **cost**.',
      '**Logs** without **correlation** **IDs**.',
      '**Tracing** **sampling** misconfigured (all or nothing).',
      '**Skipping** **supply** **chain** **checks**.',
      '**Manual** **kubectl** **only** **pipelines**.',
      '**Alert** **fatigue** without **SLO** grounding.',
      '**Secrets** printed in **CI** logs.',
    ],
    cheatsheet: `| Topic | Recall |
|---|---|
| CI | Fast feedback |
| CD | Safe promote |
| Canary | Risk reduction |
| SLO | Customer centric |
| RED | Microservice signals |
| USE | Resource signals |
| OTel | Vendor neutral |
| Structured logs | Query speed |
| Feature flags | Progressive enable |
| Error budget | Prioritization |`,
  },
];
