export default `## Use cases — **Kafka Streams**

### 1) **Session** **window** **fraud** **rules**
**Context:** **5-minute** **inactivity** **windows** per **user** **session**.
**Why Day 63:** **Grace** period and **late** **events** change **counts**.
**Implementation outline:**
1. Pick **window** + **grace** from **SLO** and **source** **clock** **skew**.
2. Size **state** **store** **changelog** **replication** for **AZ** loss.
3. Monitor **restore** **time** after **restarts**.
**Failure hook:** **Repartition** **storm** when **key** **schema** **changes**.

### 2) **Inventory** **KTable** **lookup**
**Context:** **Stream** of **orders** **enriched** with **product** **master** **data**.
**Why Day 63:** **Join** **semantics** and **changelog** **compaction**.
**Implementation outline:**
1. Materialize **table** with **correct** **retention** / **cleanup** policy.
2. Plan **repartition** topics for **foreign-key** joins.
3. **IQ** endpoints only with **read** **replicas** / **standbys** for **HA**.
**Failure hook:** **Stale** **join** after **restore** lag.

### 3) **Anomaly** **detection** **aggregate**
**Context:** **Rolling** **sum** of **errors** per **service**.
**Why Day 63:** **State** **size** and **rocksdb** **tuning**.
**Implementation outline:**
1. **Sliding** vs **tumbling** based on **alert** **semantics**.
2. **Suppress** **until** **window** **closes** for **stable** **outputs**.
3. **Chaos** **restart** **streams** app during **load** **test**.
**Failure hook:** **Duplicate** **aggregates** if **EOS** **disabled** during **failover**.

### 4) **Multi-tenant** **fairness**
**Context:** One **cluster**; **noisy** **tenant** can **blow** **state** **size**.
**Why Day 63:** **Topology** **per** **tenant** tier vs **shared** **with** **quotas**.
**Implementation outline:**
1. **Isolate** **hot** **tenants** to **dedicated** **application** **instances**.
2. **Cap** **per-tenant** **keys** in **operator** **review**.
**Failure hook:** **Single** **tenant** **skew** **fills** **disk** on **streams** **node**.
`;
