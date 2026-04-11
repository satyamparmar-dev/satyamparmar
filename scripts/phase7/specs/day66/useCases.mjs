export default `## Use cases — **RabbitMQ & AWS messaging**

### 1) **Job** **queue** with **SQS** **standard** **queue**
**Context:** **Worker** **fleet** **pulls** **tasks**; **bursty** **load**.
**Why Day 66:** **Visibility** **timeout** vs **processing** **p99**.
**Implementation outline:**
1. Set **VisibilityTimeout** > **p99** **handler**; **heartbeat** **extend** for **long** **jobs**.
2. **Dead-letter** **queue** + **redrive** **policy** for **inspection**.
3. **Idempotent** **workers** for **at-least-once** **delivery**.
**Failure hook:** **Duplicate** **work** when **visibility** **expires** **early**.

### 2) **SNS** **fan-out** to **Lambda** + **SQS**
**Context:** **Domain** **events** trigger **multiple** **subscribers**.
**Why Day 66:** **Fan-out** **latency** and **failure** **isolation** per **subscriber**.
**Implementation outline:**
1. **Per** **subscriber** **queue** so **one** **bad** **consumer** **does** **not** **block** **others**.
2. **Filter** **policies** on **SNS** to **cut** **cost** and **noise**.
**Failure hook:** **Lambda** **throttle** → **backlog** on **one** **queue** only.

### 3) **RabbitMQ** **for** **low-latency** **commands**
**Context:** **Internal** **tooling** needs **push** **semantics** and **per-message** **ack**.
**Why Day 66:** **Prefetch** and **DLX** **patterns** differ from **Kafka** **logs**.
**Implementation outline:**
1. Tune **prefetch** for **fair** **work** **distribution**.
2. **Dead-letter** **exchange** + **TTL** **for** **timeouts**.
3. Do **not** **assume** **replay** **history** like **Kafka** **retention**.
**Failure hook:** **Memory** **pressure** when **consumers** **stall** with **high** **prefetch**.

### 4) **Hybrid** **Kafka** + **SQS** **edge**
**Context:** **Kafka** **inside** **VPC**; **SQS** at **edge** for **partner** **callbacks**.
**Why Day 66:** **Contract** and **ordering** **differ**; **translate** **explicitly**.
**Implementation outline:**
1. **Bridge** **service** **maps** **keys** to **SQS** **message** **groups** (**FIFO**) if **needed**.
2. Document **ordering** **guarantees** **per** **integration**.
**Failure hook:** **Partners** **assume** **Kafka**-style **replay** on **SQS**.
`;
