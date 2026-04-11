export default `## Use cases — **Schema Registry & Kafka Connect**

### 1) **Contract** **CI** for **events**
**Context:** **Hundreds** of **schemas** owned by **services**; **breaking** changes **slip** **out**.
**Why Day 64:** **Compatibility** **mode** + **subject** **strategy** is **governance**.
**Implementation outline:**
1. **CI** **check** **BACKWARD** for **consumers** still on **old** **code**.
2. **Subject** naming per **topic** **strategy** (**TopicNameStrategy** vs **RecordNameStrategy**).
3. **Pin** **schema** **id** in **incident** **runbooks** for **replay**.
**Failure hook:** **Deserializer** **error** **poisons** **partition** after **schema** **push**.

### 2) **Postgres** → **Kafka** **CDC** **connector**
**Context:** **Operational** **store** **feeds** **analytics** **lake**.
**Why Day 64:** **Tasks**, **offsets**, and **SMT** **pipelines** need **ops** **ownership**.
**Implementation outline:**
1. **SingleMessageTransform** for **PII** **masking** — **review** in **PR**.
2. **errors.tolerance** + **DLQ** **topic** for **bad** **rows**.
3. **Restart** **policy** with **alert** on **task** **FAILED**.
**Failure hook:** **Silent** **drop** from **over-aggressive** **SMT**.

### 3) **Snowflake** **sink** **connector**
**Context:** **Warehouse** **load** **must** **keep** **up** with **peak** **Kafka** **throughput**.
**Why Day 64:** **Tasks** **scale** with **partitions** and **worker** **count**.
**Implementation outline:**
1. Match **tasks.max** to **throughput** and **Snowflake** **ingest** **limits**.
2. Monitor **consumer** **lag** on **connector** **internal** **topics**.
**Failure hook:** **Schema** **evolution** **breaks** **flatten** **SMT** **mapping**.

### 4) **Partner** **integration** **with** **Avro**
**Context:** **External** **team** **consumes** **your** **topics**.
**Why Day 64:** **Forward** compatibility for **their** **release** **cadence**.
**Implementation outline:**
1. Document **compatibility** **mode** and **allowed** **evolution** **patterns**.
2. Provide **example** **records** + **schema** **diff** in **release** **notes**.
**Failure hook:** **Field** **removal** **without** **default** **breaks** **older** **readers**.
`;
