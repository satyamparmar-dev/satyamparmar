export default `## Use cases — **Distributed systems theory**

### 1) **Multi-region** **active-active** **product** **catalog**
**Context:** **Low** **read** **latency** **globally**; **writes** **from** **many** **regions**.
**Why Day 67:** **CAP** **partition** **behavior** and **conflict** **resolution**.
**Implementation outline:**
1. Classify **data** as **strong** **consistency** vs **eventually** **consistent**.
2. Pick **CRDTs**, **last-write-wins**, or **operator** **merge** per **field** **type**.
3. **Exercise** **partition** **drills** between **regions**.
**Failure hook:** **Split-brain** **inventory** **counts** during **network** **cut**.

### 2) **Wallet** **balance** **service**
**Context:** **Financial** **correctness** **trumps** **raw** **availability**.
**Why Day 67:** **Linearizability** **expectations** for **single** **account** **ledger**.
**Implementation outline:**
1. **Single** **writer** **per** **account** **partition** / **shard**.
2. **Quorum** **or** **consensus** **where** **shared** **state** **cannot** **shard**.
3. **Reconciliation** **jobs** for **external** **PSP** **truth**.
**Failure hook:** **Stale** **reads** **expose** **phantom** **balance** after **failover**.

### 3) **Search** **index** **eventually** **consistent** **with** **OLTP**
**Context:** **Postgres** **source** **of** **truth**; **Elasticsearch** **for** **query**.
**Why Day 67:** **Eventual** **consistency** **windows** **visible** **to** **users**.
**Implementation outline:**
1. **Expose** **revision** **tokens** or **timestamps** in **UI** **where** **needed**.
2. **Backfill** **and** **replay** **pipelines** for **repair**.
**Failure hook:** **User** **sees** **deleted** **row** **still** **searchable** **minutes** **later**.

### 4) **Incident** **communication** **under** **partial** **failure**
**Context:** **Checkout** **degraded**; **some** **shards** **healthy**, **others** **not**.
**Why Day 67:** **Blast** **radius** **language** uses **quorum** / **shard** **facts**.
**Implementation outline:**
1. **Status** **page** ties to **error** **budget** and **shard** **map**.
2. **Runbook** **lists** **which** **invariants** **are** **relaxed** **during** **degrade** **mode**.
**Failure hook:** **Over-promising** **“fixed”** when **only** **one** **AZ** **recovered**.
`;
