export default `## Use cases — **Spring Kafka**

### 1) **Order** **service** **@KafkaListener**
**Context:** **Spring** **Boot** **microservice** **consumes** **order** **events** and **writes** **DB**.
**Why Day 65:** **Container** **concurrency** vs **partition** count; **error** **handlers**.
**Implementation outline:**
1. Set **concurrency** ≤ meaningful **partition** **parallelism**.
2. Use **DefaultErrorHandler** + **backoff** + **DLQ** **publisher** for **poison** **messages**.
3. **AckMode** **MANUAL** when **commit** must follow **DB** **txn**.
**Failure hook:** **Infinite** **retry** on **deserialization** **error** **blocks** **partition**.

### 2) **KafkaTemplate** **for** **command** **topics**
**Context:** **REST** **controller** **triggers** **async** **workflow** **via** **Kafka**.
**Why Day 65:** **Producer** **config** in **Spring** **must** **mirror** **platform** **standards**.
**Implementation outline:**
1. Externalize **acks**, **retries**, ** linger**, **compression** in **config** **server**.
2. **Micrometer** **metrics** for **send** **failures** and **latency**.
3. **Integration** **test** with **EmbeddedKafka** + **Testcontainers** for **realism**.
**Failure hook:** **Blocking** **send** on **metadata** **outage** **exhausts** **tomcat** **threads**.

### 3) **Batch** **listener** **for** **bulk** **indexing**
**Context:** **Elasticsearch** **bulk** **API** prefers **batches** of **records**.
**Why Day 65:** **Batch** **error** **handling** and **partial** **failure** **semantics**.
**Implementation outline:**
1. **Parse** **batch**; **ack** **offsets** only after **successful** **bulk** **response**.
2. **Split** **failures** into **retry** vs **DLQ** per **record** **key**.
**Failure hook:** **One** **bad** **JSON** **record** **fails** **entire** **batch** without **splitting**.

### 4) **Transactional** **outbox** **relay**
**Context:** **@Transactional** **DB** **write** + **relay** **to** **Kafka** **same** **process**.
**Why Day 65:** **KafkaTransactionManager** + **DB** **tx** **ordering** **must** **match** **design**.
**Implementation outline:**
1. **Chained** **transaction** **manager** only if **ops** **approved** **latency** **cost**.
2. **Idempotent** **producer** as **baseline** even **without** **full** **transactions**.
**Failure hook:** **Partial** **commit** **ordering** → **lost** **events** or **orphan** **rows**.
`;
