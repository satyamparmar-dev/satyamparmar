export default `## Use cases — **Kafka consumers**

### 1) **Fraud** **scoring** **pipeline**
**Context:** **Sub-second** **latency** with **CPU**-heavy **models** per message.
**Why Day 61:** **max.poll.interval.ms** vs **handler** runtime causes **rebalance** storms.
**Implementation outline:**
1. **Offload** work to **workers**; keep **poll** loop **non-blocking**.
2. Tune **max.poll.records** with **processing** SLA.
3. Use **pause**/**resume** when **downstream** is **unhealthy**.
**Failure hook:** **Lag** **jumps** after **model** deploy → **poll** **timeout**.

### 2) **Billing** **usage** **aggregation**
**Context:** **At-least-once** delivery; **duplicates** must not **double**-count.
**Why Day 61:** **Offset** **commit** order vs **side** **effects**.
**Implementation outline:**
1. **Idempotent** **upsert** keyed by **event** **id**.
2. **Commit** **after** **successful** **write** (or use **transactions** where justified).
3. Track **consumer** **lag** per **partition** for **tenant** fairness.
**Failure hook:** **Rebalance** → **reprocess** **window** without **idempotency**.

### 3) **CDC** **fan-out** **consumer**
**Context:** **High** **throughput** **changelog** from **database** **capture**.
**Why Day 61:** **fetch** tuning and **partition** **assignment** stability matter.
**Implementation outline:**
1. Prefer **cooperative** rebalance to reduce **stop-the-world**.
2. Size **threads** to **partition** count; avoid **idle** **consumers**.
3. **Dead-letter** **tombstone** or **schema** errors.
**Failure hook:** **Single** **poison** **partition** blocks **ordering** for a **shard**.

### 4) **Multi-region** **drill**
**Context:** **Failover** **consumers** to **secondary** cluster.
**Why Day 61:** **Group** **generation**, **offsets**, and **mirror** lag must be **rehearsed**.
**Implementation outline:**
1. Document **offset** **mapping** or **timestamp** **reset** policy.
2. Run **dry-run** **failover** quarterly with **lag** **SLO** checks.
**Failure hook:** **Dual** **active** **consumers** after **DNS** **flap**.
`;
