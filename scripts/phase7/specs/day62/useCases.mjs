export default `## Use cases — **Delivery semantics & EOS**

### 1) **Inventory** **reservation** **service**
**Context:** **Reserve** stock on **event**; **cancel** on **timeout**; **no** **double** **reserve**.
**Why Day 62:** **At-least-once** + **retries** need **idempotent** **commands**.
**Implementation outline:**
1. **Dedupe** table keyed by **reservation** **request** **id**.
2. **Outbox** for **Kafka** + **DB** **atomicity** where needed.
3. Define **exactly-once** **scope** (partition? **service**? **end-to-end**?).
**Failure hook:** **Duplicate** **reservation** after **consumer** **retry**.

### 2) **Payment** **settlement** **worker**
**Context:** **Read** **Kafka** → **call** **PSP** → **emit** **result**.
**Why Day 62:** **Side** **effects** **outside** **Kafka** break naive **EOS** claims.
**Implementation outline:**
1. **Idempotent** **PSP** **keys** + **reconciliation** **job**.
2. **Transactional** **read-process-write** only if **all** **parts** support it.
3. **DLQ** + **manual** **replay** playbook for **poison** **messages**.
**Failure hook:** **PSP** **timeout** → **duplicate** **capture** without **keys**.

### 3) **Stream** **join** **billing** **with** **usage**
**Context:** Join **subscription** **events** with **metering** **stream**.
**Why Day 62:** **Time** **alignment** and **reprocessing** semantics.
**Implementation outline:**
1. **Watermarks** / **grace** for **late** **data** policy.
2. **Version** **state** **stores** for **replay** after **bug** **fix**.
**Failure hook:** **Duplicate** **join** **output** after **changelog** **replay**.

### 4) **GDPR** **delete** **propagation**
**Context:** **Right** **to** **erasure** must **reach** **derived** **stores**.
**Why Day 62:** **Tombstones** + **compaction** + **consumer** **handling**.
**Implementation outline:**
1. Emit **tombstone** on **PII** **delete** **topic**.
2. **Consumers** **purge** **downstream** **indexes**.
3. Validate **retention** vs **legal** **hold**.
**Failure hook:** **Compacted** **topic** **replay** **resurrects** **deleted** **rows** if **consumers** **skip** **nulls**.
`;
