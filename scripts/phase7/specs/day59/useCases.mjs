export default `## Use cases — **Kafka architecture**

### 1) E-commerce **order** **events** backbone
**Context:** Checkout emits **order.created**, **payment.captured**, **shipment.ready** for analytics, search, and fraud.
**Why Day 59:** Partition and **consumer-group** design decides **per-order** ordering vs **fan-out** throughput.
**Implementation outline:**
1. Choose **partition key** = \`orderId\` for order-scoped ordering.
2. Size **partition count** for peak **write** TPS and **consumer** parallelism.
3. Run **three** consumer groups (analytics, search, fraud) — each reads the **same** topic independently.
4. Dashboard **consumer lag** per **partition** + **under-replicated partitions**.
**Failure hook:** **Hot** **merchant** keys → one **partition** lags while others are idle.

### 2) **Microservice** **changelog** **fan-out**
**Context:** A **core** service publishes **entity** updates to many downstreams.
**Why Day 59:** Brokers + **replication** must survive **AZ** loss without silent **durability** loss.
**Implementation outline:**
1. Set **replication.factor** and **min.insync.replicas** for **money** paths (\`acks=all\`).
2. Enable **rack awareness** so replicas span **AZs**.
3. Document **unclean leader election** policy per **topic tier**.
**Failure hook:** **ISR** shrink → producers **block**; alert on **min ISR** breaches.

### 3) **Data** **platform** **ingestion** **SLA**
**Context:** Thousands of **topics** owned by product teams feeding the **warehouse**.
**Why Day 59:** **Metadata** storms and **rebalance** churn show up as **p99** **lag** spikes.
**Implementation outline:**
1. Standardize **consumer** configs: **max.poll.interval.ms**, **session.timeout.ms**, **fetch.max.wait.ms**.
2. Cap **per-topic** **throughput** in **ADR**; **reject** unbounded **retention** on **shared** clusters.
3. Run **game days**: **broker** **bounce**, **consumer** **crash**, **network** **partition**.
**Failure hook:** **Rebalance** storm after deploy → **handler** time exceeded **max.poll.interval**.

### 4) **Platform** **on-call** **playbook**
**Context:** Pager fires on **lag** and **offline** **log** **directories**.
**Why Day 59:** You must read **cluster** topology faster than tailing random logs.
**Implementation outline:**
1. First chart: **lag** by **partition**; second: **ISR** and **leader** **election** rate.
2. Correlate with **deploy** times and **consumer** **generation** changes.
3. Escalate **broker** **disk** / **controller** issues with **runbook** links.
**Failure hook:** Mis-blaming **“Kafka slow”** when **downstream** **DB** is the **bottleneck**.
`;
