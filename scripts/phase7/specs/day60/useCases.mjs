export default `## Use cases — **Kafka producers**

### 1) **Payment** **authorization** **events**
**Context:** High-value **records** must survive **broker** **failures** without **duplicate** **charges** on retry.
**Why Day 60:** **acks**, **idempotency**, and **retries** interact with **ISR** policy.
**Implementation outline:**
1. Use **idempotent** producer + **acks=all** with **min.insync.replicas** aligned to **tier**.
2. Set **delivery.timeout.ms** and **retries** so clients **fail** visibly instead of **hanging**.
3. Monitor **record error rate** and **metadata** refresh spikes.
**Failure hook:** **Retry** storm after **NOT_LEADER** misconfiguration.

### 2) **Telemetry** **firehose**
**Context:** Millions of **small** events per second; **cost** sensitive.
**Why Day 60:** **batch.size**, **linger.ms**, and **compression** dominate **efficiency**.
**Implementation outline:**
1. Tune **linger** vs **p99** produce **latency** SLO.
2. Pick **compression** codec with CPU vs **bandwidth** trade-off.
3. Use **null** keys only when **ordering** is irrelevant; watch **sticky** **partitioner** skew.
**Failure hook:** **Buffer** **exhaustion** when **downstream** **backpressure** returns.

### 3) **Outbox** → **Kafka** **bridge**
**Context:** **DB** transaction commits must **match** **published** events.
**Why Day 60:** Producer **ordering** per partition pairs with **outbox** **relay** design.
**Implementation outline:**
1. Single **partition** key per **aggregate** for **ordered** **relay**.
2. **Transactional** producer only if **end-to-end** story includes **consumers** and **sinks**.
3. **DLQ** invalid **payloads** at **schema** boundary.
**Failure hook:** **Partial** publish → **dual** **write** bugs without **idempotent** **consumers**.

### 4) **Mobile** **client** **analytics**
**Context:** **Bursty** traffic from app **sessions**; occasional **massive** spikes.
**Why Day 60:** **max.in.flight** and **ordering** trade-offs when **retries** happen.
**Implementation outline:**
1. Cap **in-flight** when **ordering** must hold with **retries**.
2. **Rate-limit** at **gateway** before **Kafka** to protect **shared** clusters.
**Failure hook:** **Reordering** visible to **real-time** **dashboards** after **retry**.
`;
