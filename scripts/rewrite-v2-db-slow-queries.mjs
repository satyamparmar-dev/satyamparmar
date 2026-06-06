import { readFileSync, writeFileSync } from 'fs';
const FILE = 'public/data/scenarioInterviewThemes.json';
const F = '```';

const answers = {

'th-db-n1-symptom': `
## 🔥 The situation

Your API endpoint suddenly gets slow — not because the database is down, but because a single request is firing 100+ SQL queries behind the scenes. Your ORM (Hibernate/JPA) loads a parent entity, then for each child in the collection, fires a separate query. This is the **N+1 problem**: 1 query for the list, then N queries for each element.

---

## 🧠 Understand this first

| Concept | What it means |
|---|---|
| **N+1 queries** | 1 query loads N parents; then N separate queries load each child collection |
| **Lazy loading** | Hibernate's default — child collections are loaded only when accessed |
| **EAGER loading** | Children loaded in the same query — but causes issues if always loaded |
| **JOIN FETCH** | JPQL keyword to load associations in one SQL JOIN query |
| **@EntityGraph** | Spring Data JPA annotation to declare which associations to JOIN FETCH |
| **@BatchSize** | Hibernate loads N lazy collections in batches instead of 1-by-1 |

---

## Step 1 — Detect N+1 in logs

${F}yaml
# application.yml — enable SQL logging
logging:
  level:
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql.BasicBinder: TRACE
spring:
  jpa:
    show-sql: true
    properties:
      hibernate:
        format_sql: true
        generate_statistics: true
${F}

**What you see (N+1 problem — 101 queries for 100 orders):**
${F}
Hibernate: select * from orders limit 100          -- 1 query
Hibernate: select * from order_items where order_id=1  -- N queries
Hibernate: select * from order_items where order_id=2
Hibernate: select * from order_items where order_id=3
...
Hibernate: select * from order_items where order_id=100
${F}

---

## Step 2 — Measure with Hibernate Statistics

${F}java
// In a test or diagnostic endpoint
SessionFactory sf = entityManager.getEntityManagerFactory()
    .unwrap(SessionFactory.class);

Statistics stats = sf.getStatistics();
stats.setStatisticsEnabled(true);
stats.clear();

List<Order> orders = orderRepository.findAll(); // trigger the queries
orders.forEach(o -> o.getItems().size()); // trigger lazy loading

System.out.printf("Query count: %d%n", stats.getQueryExecutionCount());
System.out.printf("Entity loads: %d%n", stats.getEntityLoadCount());
${F}

**What you see:**
${F}
Query count: 101
Entity loads: 100
${F}

101 queries for 100 orders = classic N+1.

---

## Step 3 — Fix with JOIN FETCH

${F}java
// In your repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // JPQL with JOIN FETCH — loads orders AND items in one query
    @Query("SELECT o FROM Order o JOIN FETCH o.items WHERE o.status = :status")
    List<Order> findByStatusWithItems(@Param("status") OrderStatus status);
}
${F}

**What you see after fix (1 query instead of 101):**
${F}
Hibernate: select o.*, oi.* from orders o
           inner join order_items oi on oi.order_id = o.id
           where o.status = ?
${F}

**Fix with @EntityGraph (Spring Data style):**

${F}java
@EntityGraph(attributePaths = {"items", "items.product"})
List<Order> findByStatus(OrderStatus status);
${F}

---

## 💡 Interview answer

**Open:** "Our orders API was taking 3 seconds. SQL logging showed 101 queries for a 100-order list — classic N+1."

**Then:** "I added \`generate_statistics: true\` to confirm the query count. The fix was a \`JOIN FETCH\` in the JPQL query, loading orders and items in one query. I also added a test using Hibernate Statistics asserting query count < 3 for any list endpoint — this catches future N+1 regressions in CI."

**End:** "The test is the real win — a passing test with N+1 today is a slow API 6 months from now after the team grows. Make the constraint explicit."
`.trim(),

'th-db-missing-index': `
## 🔥 The situation

A query that used to run in 10ms suddenly takes 8 seconds. Nothing changed in the code — but the table grew from 10,000 to 5 million rows. Without an index, the database does a **full table scan** — reading every single row to find the matching ones. The fix is adding an index, but understanding *which* column to index and *why* requires reading the query execution plan.

---

## 🧠 Understand this first

| Concept | What it means |
|---|---|
| **Full table scan** | DB reads every row — fine for small tables, catastrophic for millions of rows |
| **B-tree index** | Default index type — sorted structure enabling O(log n) lookups |
| **EXPLAIN / EXPLAIN ANALYZE** | PostgreSQL commands to show the query execution plan |
| **Seq Scan** | PostgreSQL's name for full table scan — bad for large tables |
| **Index Scan** | Using an index — what you want |
| **Selectivity** | How much an index narrows down the rows — high selectivity = better index |

---

## Step 1 — Find slow queries

${F}sql
-- In PostgreSQL: find queries taking > 1 second
SELECT query, mean_exec_time, calls, total_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 1000
ORDER BY mean_exec_time DESC
LIMIT 10;
${F}

**What you see:**
${F}
query                                           | mean_exec_time | calls
SELECT * FROM orders WHERE customer_id = $1     |    8421.3 ms   | 15234
SELECT * FROM orders WHERE created_at > $1      |    4521.1 ms   | 8901
${F}

---

## Step 2 — EXPLAIN ANALYZE the slow query

${F}sql
EXPLAIN ANALYZE
SELECT * FROM orders WHERE customer_id = 12345;
${F}

**What you see (missing index — full scan):**
${F}
Seq Scan on orders  (cost=0.00..125847.00 rows=1 width=248)
                     (actual time=0.021..8421.234 rows=47 loops=1)
  Filter: (customer_id = 12345)
  Rows Removed by Filter: 4999953   ← scanned 5M rows to find 47!
Planning Time: 0.123 ms
Execution Time: 8421.456 ms
${F}

**After adding the index — what you see:**
${F}
Index Scan using idx_orders_customer_id on orders
                     (actual time=0.042..0.891 rows=47 loops=1)
  Index Cond: (customer_id = 12345)
Planning Time: 0.234 ms
Execution Time: 0.923 ms         ← 8421ms → 0.9ms!
${F}

---

## Step 3 — Add the index

**Via SQL migration (Flyway):**
${F}sql
-- V5__add_orders_customer_index.sql
CREATE INDEX CONCURRENTLY idx_orders_customer_id ON orders(customer_id);
-- CONCURRENTLY = no table lock — safe to run on live production table
${F}

**Via Hibernate/JPA entity:**
${F}java
@Entity
@Table(name = "orders",
    indexes = {
        @Index(name = "idx_orders_customer_id", columnList = "customer_id"),
        @Index(name = "idx_orders_created_at", columnList = "created_at DESC")
    })
public class Order {
    @Column(name = "customer_id")
    private Long customerId;

    @Column(name = "created_at")
    private Instant createdAt;
}
${F}

---

## Step 4 — Add a composite index for multi-column queries

${F}sql
-- If your query filters on multiple columns:
-- WHERE status = 'PENDING' AND customer_id = 12345

-- Single index on status alone has low selectivity (few distinct values)
-- Composite index is better:
CREATE INDEX idx_orders_status_customer ON orders(status, customer_id);

-- Order matters: put the most selective column first,
-- or the column you filter with = (not range) first
${F}

---

## 💡 Interview answer

**Open:** "Our orders list API slowed from 10ms to 8 seconds after the table hit 5 million rows. EXPLAIN ANALYZE showed a full table scan — reading all 5M rows to find 47 matching ones."

**Then:** "I added \`CREATE INDEX CONCURRENTLY idx_orders_customer_id ON orders(customer_id)\`. CONCURRENTLY means it builds without locking the table — safe to run on live production. Query time dropped from 8421ms to 0.9ms."

**End:** "The key habit: always run EXPLAIN ANALYZE when a query is slow — not just EXPLAIN. EXPLAIN shows the plan; EXPLAIN ANALYZE actually runs it and shows real timings. Seq Scan + large row count = missing index. I also set up \`pg_stat_statements\` to surface slow queries automatically so we catch this before users report it."
`.trim(),

'th-db-select-star': `
## 🔥 The situation

Your service queries a table and returns data to the API. Over time, the table grows new columns — BLOB fields, audit timestamps, large JSON columns. Your \`SELECT *\` query now fetches megabytes of data per row that your API never uses. Network bandwidth, memory, and serialization time all suffer — and you can't even add an efficient covering index because \`SELECT *\` needs every column.

---

## 🧠 Understand this first

| Concept | What it means |
|---|---|
| **SELECT *** | Fetches every column — even ones your code doesn't use |
| **Covering index** | An index that contains all columns in the query — no table fetch needed |
| **Index-only scan** | Query satisfied entirely from the index — fastest possible |
| **Projection** | Selecting only the columns you need — reduces I/O and network |
| **DTO projection** | Spring Data JPA feature to map query results to a DTO with only needed fields |

---

## Step 1 — Identify the cost

${F}sql
-- See how wide your table is
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- See average row size
SELECT pg_size_pretty(AVG(pg_column_size(orders.*))) as avg_row_size
FROM orders LIMIT 1000;
${F}

**What you see:**
${F}
column_name        | data_type | size
id                 | bigint    | 8 bytes
customer_id        | bigint    | 8 bytes
status             | varchar   | ~20 bytes
order_details_json | jsonb     | ~4000 bytes  ← 4KB per row!
audit_trail        | text      | ~2000 bytes  ← 2KB per row!
created_at         | timestamp | 8 bytes

avg_row_size: 6.2 kB

-- If you're fetching 1000 orders: 6.2MB transferred but you only need id + status + created_at (36 bytes/row = 36KB)
${F}

---

## Step 2 — Fix in Spring Data JPA with interface projections

${F}java
// Define what you actually need
public interface OrderSummary {
    Long getId();
    String getStatus();
    Instant getCreatedAt();
    Long getCustomerId();
    // NOT: getOrderDetailsJson(), getAuditTrail()
}

// Repository returns only those columns
public interface OrderRepository extends JpaRepository<Order, Long> {

    // Spring Data generates: SELECT id, status, created_at, customer_id FROM orders WHERE ...
    List<OrderSummary> findByCustomerId(Long customerId);
}
${F}

---

## Step 3 — Fix with JPQL DTO projection

${F}java
// DTO class
public record OrderDTO(Long id, String status, Instant createdAt) {}

// In repository
@Query("SELECT new com.example.dto.OrderDTO(o.id, o.status, o.createdAt) " +
       "FROM Order o WHERE o.customerId = :customerId")
List<OrderDTO> findSummariesByCustomerId(@Param("customerId") Long customerId);
${F}

**What Hibernate generates (explicit columns only):**
${F}sql
SELECT o.id, o.status, o.created_at
FROM orders o
WHERE o.customer_id = ?
${F}

---

## Step 4 — Add a covering index for the projected query

${F}sql
-- Query: WHERE customer_id = ? SELECT id, status, created_at
-- Covering index: includes all 4 columns
CREATE INDEX idx_orders_customer_covering
    ON orders(customer_id)
    INCLUDE (id, status, created_at);
-- PostgreSQL can satisfy this query entirely from the index — no table access
${F}

**EXPLAIN ANALYZE with covering index:**
${F}
Index Only Scan using idx_orders_customer_covering on orders
  (actual time=0.021..0.134 rows=47 loops=1)
  Heap Fetches: 0     ← zero table accesses! pure index
${F}

---

## 💡 Interview answer

**Open:** "Our order list endpoint was transferring 6MB per request — each row had a \`jsonb\` detail column and audit text that the API never returned to the client."

**Then:** "I switched from a \`findAll()\` returning full \`Order\` entities to interface projections: \`List<OrderSummary> findByCustomerId()\` where \`OrderSummary\` is an interface with only the 4 fields we needed. Hibernate generated \`SELECT id, status, created_at, customer_id\` instead of \`SELECT *\`. Then I added a covering index with \`INCLUDE (id, status, created_at)\` so PostgreSQL could do index-only scans."

**End:** "Transfer per request dropped from 6MB to 36KB — a 99% reduction. The rule: only fetch what you need. \`SELECT *\` is fine for ad-hoc queries but never in production code paths. Spring Data interface projections are the easiest way to enforce this — the return type defines the contract."
`.trim(),

'th-db-pagination': `
## 🔥 The situation

Your API has a \`/orders\` endpoint that pages through results. The request is \`GET /orders?page=500&size=20\`. The database does an \`OFFSET 10000 LIMIT 20\` — which means it reads 10,020 rows, throws away the first 10,000, and returns 20. The further into the dataset you go, the slower it gets. This is the **OFFSET pagination problem**.

---

## 🧠 Understand this first

| Concept | What it means |
|---|---|
| **OFFSET pagination** | \`LIMIT 20 OFFSET 10000\` — reads 10,020 rows, discards 10,000 |
| **Keyset pagination** | \`WHERE id > last_seen_id LIMIT 20\` — seeks directly to the right place |
| **Cursor** | An opaque value the client sends back to get the next page |
| **Deep pagination** | Pages > 100 — \`OFFSET\` gets progressively slower, keyset stays constant |
| **Unbounded query** | \`SELECT * FROM orders\` with no LIMIT — returns the whole table |

---

## Step 1 — See the problem with EXPLAIN

${F}sql
-- Page 500, 20 items per page
EXPLAIN ANALYZE SELECT * FROM orders ORDER BY created_at DESC LIMIT 20 OFFSET 10000;
${F}

**What you see:**
${F}
Limit  (rows=20)
  ->  Index Scan Backward using idx_orders_created_at on orders
        (actual time=0.023..4521.234 rows=10020 loops=1)
        ← read 10,020 rows just to return 20!
Execution Time: 4521.456 ms
${F}

---

## Step 2 — Switch to keyset (cursor) pagination

**Old approach (OFFSET):**
${F}java
// SLOW: offset grows with page number
@GetMapping("/orders")
public Page<Order> getOrders(@RequestParam int page, @RequestParam int size) {
    return orderRepository.findAll(PageRequest.of(page, size, Sort.by("createdAt").descending()));
    // Generates: SELECT ... ORDER BY created_at DESC LIMIT 20 OFFSET (page*size)
}
${F}

**New approach (keyset):**
${F}java
@GetMapping("/orders")
public CursorPage<Order> getOrders(
        @RequestParam(required = false) String cursor,
        @RequestParam(defaultValue = "20") int size) {

    Instant afterTime = cursor != null
        ? decodeCursor(cursor)  // decode the opaque cursor
        : Instant.now();

    List<Order> orders = orderRepository.findByCreatedAtBefore(afterTime,
        PageRequest.of(0, size + 1, Sort.by("createdAt").descending()));

    boolean hasMore = orders.size() > size;
    if (hasMore) orders = orders.subList(0, size);

    String nextCursor = hasMore
        ? encodeCursor(orders.get(orders.size() - 1).getCreatedAt())
        : null;

    return new CursorPage<>(orders, nextCursor);
}

private String encodeCursor(Instant time) {
    return Base64.getEncoder().encodeToString(time.toString().getBytes());
}

private Instant decodeCursor(String cursor) {
    return Instant.parse(new String(Base64.getDecoder().decode(cursor)));
}
${F}

**Repository method:**
${F}java
@Query("SELECT o FROM Order o WHERE o.createdAt < :before ORDER BY o.createdAt DESC")
List<Order> findByCreatedAtBefore(
    @Param("before") Instant before,
    Pageable pageable);
${F}

**SQL generated:**
${F}sql
-- Page 1: cursor = now
SELECT * FROM orders WHERE created_at < '2024-01-15T14:00:00' ORDER BY created_at DESC LIMIT 21

-- Page 500: cursor = time of last item on page 499
SELECT * FROM orders WHERE created_at < '2024-01-10T08:23:11' ORDER BY created_at DESC LIMIT 21
-- Same performance as page 1! Index seek directly to the right row
${F}

**EXPLAIN ANALYZE after fix:**
${F}
Limit  (rows=20)
  ->  Index Scan Backward using idx_orders_created_at on orders
        Index Cond: (created_at < '2024-01-10 08:23:11')
        (actual time=0.021..0.456 rows=21 loops=1)  ← 4521ms → 0.5ms!
${F}

---

## Step 3 — Spring Data JPA Window / Slice for simple cases

${F}java
// Slice loads page+1 to know if there's a next page — no COUNT query
Slice<Order> slice = orderRepository.findByCustomerId(customerId,
    PageRequest.of(page, size));

slice.hasNext(); // true if more results
slice.getContent(); // the actual items
${F}

---

## 💡 Interview answer

**Open:** "Our admin panel's order history was timing out at page 500 — EXPLAIN showed reading 10,020 rows to return 20, taking 4.5 seconds."

**Then:** "I replaced OFFSET pagination with keyset pagination. Instead of \`OFFSET 10000\`, the query uses \`WHERE created_at < :lastSeen\` — it seeks directly to the right position using the index. The cursor is the timestamp of the last item, base64-encoded so it's opaque to the client."

**End:** "Performance is now constant regardless of page depth — page 1 and page 10,000 both take 0.5ms because they're both index seeks. The tradeoff: keyset pagination doesn't support 'jump to page N' — you can only go forward/backward. For admin UIs that need arbitrary page jumps, I keep OFFSET but cap it at page 100; anything deeper uses a search/filter instead."
`.trim(),

'th-db-lock-wait': `
## 🔥 The situation

Your API calls are piling up and eventually timing out. Not because of slow queries — because queries are waiting for locks held by other transactions. A long-running transaction is blocking all writes to a table. Or two transactions are deadlocked — each waiting for the other to release a lock.

---

## 🧠 Understand this first

| Concept | What it means |
|---|---|
| **Row lock** | \`SELECT ... FOR UPDATE\` — locks specific rows, other writers must wait |
| **Table lock** | \`ALTER TABLE\`, \`TRUNCATE\` — locks the entire table |
| **Deadlock** | Transaction A waits for B, B waits for A — PostgreSQL detects and kills one |
| **Lock wait timeout** | After this duration, the waiting query fails with a timeout error |
| **Long-running transaction** | A transaction that holds locks for seconds/minutes — blocks everything behind it |
| **Advisory lock** | Application-level lock not tied to rows/tables — used for distributed mutex |

---

## Step 1 — Find blocking queries in PostgreSQL

${F}sql
-- See all locks and what's blocking what
SELECT
    blocked.pid AS blocked_pid,
    blocked.query AS blocked_query,
    blocking.pid AS blocking_pid,
    blocking.query AS blocking_query,
    blocking.query_start AS blocking_started_at,
    NOW() - blocking.query_start AS blocking_duration
FROM pg_stat_activity blocked
JOIN pg_stat_activity blocking
    ON blocking.pid = ANY(pg_blocking_pids(blocked.pid))
WHERE cardinality(pg_blocking_pids(blocked.pid)) > 0;
${F}

**What you see:**
${F}
blocked_pid | blocked_query                    | blocking_pid | blocking_query         | blocking_duration
  1234      | UPDATE orders SET status='DONE'  |   5678       | BEGIN; SELECT * FROM   | 00:04:23
            | WHERE id = 42                    |              | orders FOR UPDATE      |
${F}

**What this means:** Transaction 5678 has been running for 4 minutes with a \`SELECT FOR UPDATE\` lock on orders row 42. Transaction 1234 is waiting to update that same row.

---

## Step 2 — Kill the blocking query (emergency fix)

${F}sql
-- Soft kill: send cancellation signal (transaction stays open but query stops)
SELECT pg_cancel_backend(5678);

-- Hard kill: terminate the entire connection
SELECT pg_terminate_backend(5678);
${F}

---

## Step 3 — Set lock timeouts to prevent indefinite waits

${F}sql
-- Set in your application's connection configuration
SET lock_timeout = '5s';      -- fail after 5s waiting for a lock
SET statement_timeout = '30s'; -- fail after 30s for any query
${F}

In Spring Boot / HikariCP:
${F}yaml
spring:
  datasource:
    hikari:
      connection-init-sql: "SET lock_timeout = '5s'; SET statement_timeout = '30s';"
${F}

Now instead of waiting indefinitely, blocked queries fail fast:
${F}
ERROR: canceling statement due to lock timeout
  DETAIL: Process 1234 waited too long for ShareLock on transaction 5678
${F}

---

## Step 4 — Fix the root cause: shorten transaction scope

**Bad (long transaction holding lock):**
${F}java
@Transactional
public void processOrder(Long orderId) {
    Order order = orderRepository.findByIdForUpdate(orderId); // acquires lock

    // Business logic that calls external APIs — can take seconds!
    PaymentResult result = paymentService.charge(order); // EXTERNAL CALL while holding lock!
    notificationService.send(order); // ANOTHER EXTERNAL CALL

    order.setStatus(result.isSuccess() ? COMPLETED : FAILED);
    orderRepository.save(order); // finally releases lock
}
${F}

**Good (minimize lock hold time):**
${F}java
public void processOrder(Long orderId) {
    // Do external work OUTSIDE the transaction
    Order order = orderRepository.findById(orderId).orElseThrow();
    PaymentResult result = paymentService.charge(order);  // no lock held here
    NotificationResult notification = notificationService.prepare(order);

    // Lock held only for the final write — milliseconds, not seconds
    updateOrderStatus(orderId, result, notification);
}

@Transactional
private void updateOrderStatus(Long orderId, PaymentResult result,
        NotificationResult notification) {
    Order order = orderRepository.findByIdWithLock(orderId); // lock acquired here
    order.setStatus(result.isSuccess() ? COMPLETED : FAILED);
    // transaction ends immediately — lock released
}
${F}

---

## 💡 Interview answer

**Open:** "Orders API was timing out — not slow queries, but requests queuing behind a single stuck transaction. \`pg_blocking_pids\` showed a transaction that had been running 4 minutes holding a \`SELECT FOR UPDATE\` lock."

**Then:** "Immediate fix: \`pg_terminate_backend()\` to kill the stuck transaction. Root cause fix: our \`processOrder\` method was \`@Transactional\` and made two external HTTP calls while holding the row lock — every payment API hiccup held the lock for seconds. I moved the external calls outside the transaction boundary and only acquired the lock for the final status update — lock hold time dropped from seconds to milliseconds."

**End:** "I also added \`lock_timeout = '5s'\` in HikariCP init SQL — now blocked queries fail fast with a clear error instead of piling up. The rule: never make external calls inside a database transaction. Hold locks for the minimum possible time."
`.trim(),

'th-db-explain-analyze': `
## 🔥 The situation

A query is slow. You know it's slow because users are complaining and your APM shows high DB time. But you don't know *why* it's slow. Is it missing an index? A bad join order? Too many rows scanned? \`EXPLAIN ANALYZE\` is PostgreSQL's query X-ray — it shows you exactly what the database does to execute your query, step by step, with real timings.

---

## 🧠 Understand this first

| EXPLAIN term | What it means |
|---|---|
| **Seq Scan** | Full table scan — reads every row |
| **Index Scan** | Uses an index, then fetches matching rows from the table |
| **Index Only Scan** | Entire result from index — no table access needed (fastest) |
| **Hash Join** | Builds a hash table for one input, probes it with the other |
| **Nested Loop** | For each row in outer set, scan inner table — good for small sets |
| **cost=X..Y** | Estimated startup..total cost (arbitrary units) |
| **actual time=X..Y** | Real time in milliseconds: startup..total |
| **rows=N** | Estimated rows; \`actual rows\` is the truth |

---

## Step 1 — Basic EXPLAIN ANALYZE

${F}sql
EXPLAIN ANALYZE
SELECT o.id, o.status, c.email
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.status = 'PENDING'
  AND o.created_at > NOW() - INTERVAL '7 days';
${F}

**What you see:**
${F}
Hash Join  (cost=1247.00..8934.56 rows=1423 width=48)
           (actual time=23.456..4521.234 rows=1423 loops=1)
  Hash Cond: (o.customer_id = c.id)
  ->  Seq Scan on orders o       ← PROBLEM: full scan
        (actual time=0.021..4489.234 rows=87234 loops=1)
        Filter: ((status = 'PENDING') AND (created_at > ...))
        Rows Removed by Filter: 4912766   ← scanned 5M, kept 87K
  ->  Hash  (cost=834.00..834.00 rows=33000 width=36)
        Buckets: 32768  Batches: 1
        ->  Seq Scan on customers c
              (actual time=0.012..12.456 rows=33000 loops=1)
Planning Time: 1.234 ms
Execution Time: 4521.456 ms      ← 4.5 seconds!
${F}

**Reading this:** The \`orders\` table is doing a Seq Scan and removing 4.9M rows — it needs an index on \`(status, created_at)\`.

---

## Step 2 — Add the index and re-check

${F}sql
CREATE INDEX CONCURRENTLY idx_orders_status_created
    ON orders(status, created_at DESC)
    WHERE status = 'PENDING';  -- partial index: only indexes PENDING rows
${F}

${F}sql
EXPLAIN ANALYZE
SELECT o.id, o.status, c.email
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.status = 'PENDING'
  AND o.created_at > NOW() - INTERVAL '7 days';
${F}

**What you see after index:**
${F}
Hash Join  (cost=892.00..1034.56 rows=1423 width=48)
           (actual time=8.234..12.456 rows=1423 loops=1)
  ->  Index Scan using idx_orders_status_created on orders o
        (actual time=0.021..2.345 rows=1423 loops=1)
        Index Cond: (status = 'PENDING') AND (created_at > ...)
        ← no rows removed! index returned exactly what we need
  ->  Hash on customers
        (actual time=5.234..5.234 rows=33000 loops=1)
Execution Time: 12.456 ms    ← 4521ms → 12ms!
${F}

---

## Step 3 — Read actual vs estimated rows (bad estimates = bad plans)

${F}sql
EXPLAIN ANALYZE
SELECT * FROM orders WHERE category = 'ELECTRONICS';
${F}

**What you see (bad estimate):**
${F}
Seq Scan on orders  (cost=0.00..25000.00 rows=50 ...)   ← estimated 50 rows
                    (actual time=0.021..234.567 rows=450000 ...)  ← actually 450K rows!
${F}

PostgreSQL's planner estimated 50 rows but got 450,000. This causes it to choose a bad plan (e.g., Nested Loop when Hash Join would be better).

**Fix: update statistics:**
${F}sql
ANALYZE orders;  -- updates planner statistics for this table
-- Or update the statistics target for this column (sample more rows)
ALTER TABLE orders ALTER COLUMN category SET STATISTICS 500;
ANALYZE orders;
${F}

---

## Step 4 — Use EXPLAIN (BUFFERS) to find I/O bottlenecks

${F}sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM orders WHERE customer_id = 12345;
${F}

**What you see:**
${F}
Index Scan using idx_orders_customer on orders
  (actual time=0.021..45.234 rows=1234 loops=1)
  Buffers: shared hit=45 read=892    ← read=892 means 892 blocks not in cache
                                        (each block = 8KB = 7MB of disk I/O)
Execution Time: 45.234 ms
${F}

High \`read\` count = data not in PostgreSQL's shared_buffers cache — either the table is too large for the cache, or this data is rarely accessed.

---

## 💡 Interview answer

**Open:** "An order history query was taking 4.5 seconds. I ran EXPLAIN ANALYZE and immediately saw \`Seq Scan on orders: Rows Removed by Filter: 4,912,766\` — it was reading 5M rows to find 87K."

**Then:** "The WHERE clause used \`status\` and \`created_at\` but there was no index covering both. I created a partial composite index: \`CREATE INDEX CONCURRENTLY ON orders(status, created_at DESC) WHERE status = 'PENDING'\` — a partial index only covers PENDING rows, so it's smaller and more selective. Query time dropped from 4521ms to 12ms."

**End:** "The habit I recommend: any query taking > 100ms in production should have its EXPLAIN ANALYZE output reviewed. Pay attention to three things: Seq Scan on large tables (missing index), estimated vs actual rows differing by 10x+ (stale statistics), and \`Rows Removed by Filter\` being much larger than actual rows returned (index needed)."
`.trim(),

'th-slowq-plain-lang-full': `
## 🔥 The situation — in plain language

Your app talks to a database. Most of the time it's fine. But sometimes — usually when the system gets busy or the data grows — queries slow down and users start seeing timeouts. You're asked in an interview: "How do you find and fix slow queries?" Here's how to think about it step by step, even if you're just starting out.

---

## 🧠 The big picture — why do queries get slow?

Think of a database like a library. Finding a book when you know the shelf number is instant. But if you have to read every book to find one about "dragons" — that takes forever. Indexes are like the library's catalog: they let the database find data without reading everything.

**The most common reasons a query is slow:**

| Problem | Simple explanation | Fix |
|---|---|---|
| **Missing index** | DB reads every row to find matches | Add an index |
| **Too much data fetched** | \`SELECT *\` grabs unused columns | Select only needed columns |
| **N+1 queries** | 1 query for a list, then N more for each item | JOIN FETCH / @EntityGraph |
| **Bad pagination** | \`OFFSET 10000\` reads 10,020 rows to return 20 | Use cursor pagination |
| **Lock waiting** | Query waits for another transaction to finish | Shorten transactions |
| **Stale statistics** | DB makes wrong plan decisions | Run ANALYZE |

---

## Step 1 — Find the slow query

Before you can fix something, you need to know what's slow.

**In PostgreSQL — find queries taking > 1 second:**

${F}sql
-- Enable pg_stat_statements first (in postgresql.conf):
-- shared_preload_libraries = 'pg_stat_statements'

SELECT
    left(query, 80) AS query_preview,
    round(mean_exec_time::numeric, 0) AS avg_ms,
    calls,
    round(total_exec_time::numeric, 0) AS total_ms
FROM pg_stat_statements
WHERE mean_exec_time > 1000
ORDER BY mean_exec_time DESC
LIMIT 10;
${F}

**What this shows you:**
${F}
query_preview                                  | avg_ms | calls | total_ms
SELECT * FROM orders WHERE customer_id = $1    |  8421  | 15234 | 128,459,514
SELECT * FROM orders WHERE created_at > $1     |  4521  |  8901 |  40,237,921
${F}

The first query runs 15,234 times per day and averages 8 seconds. That's your priority.

---

## Step 2 — Understand EXPLAIN ANALYZE (the DB's X-ray)

EXPLAIN ANALYZE shows you *exactly* what the database does:

${F}sql
EXPLAIN ANALYZE SELECT * FROM orders WHERE customer_id = 12345;
${F}

**What you see (slow — no index):**
${F}
Seq Scan on orders  ← "Seq Scan" = reading EVERY row (slow for big tables)
  Filter: (customer_id = 12345)
  Rows Removed by Filter: 4,999,953  ← read 5M rows, kept 47
Execution Time: 8421 ms
${F}

The words to worry about:
- **Seq Scan** on a big table = probably missing an index
- **Rows Removed** being much bigger than the result = bad filtering

**After adding an index:**
${F}
Index Scan using idx_orders_customer_id ← "Index Scan" = using the catalog
  Index Cond: (customer_id = 12345)
  (actual rows=47)
Execution Time: 0.9 ms   ← 8421ms → 0.9ms!
${F}

---

## Step 3 — Add an index (the most common fix)

An index is like bookmarks in a giant book. Instead of reading every page, you jump straight to the right page.

${F}sql
-- Add an index — CONCURRENTLY means it won't lock the table (safe in production)
CREATE INDEX CONCURRENTLY idx_orders_customer_id
    ON orders(customer_id);
${F}

**When to add an index:**
- Columns you filter by: \`WHERE customer_id = ?\`
- Columns you join on: \`JOIN customers ON customer_id = c.id\`
- Columns you sort by: \`ORDER BY created_at DESC\`

**When NOT to add an index:**
- Columns with very few distinct values (e.g., \`is_deleted\` — only true/false)
- Columns you rarely query
- Tables you write to very frequently (indexes slow down writes)

---

## Step 4 — Check your app code for common problems

**N+1 problem (the most common Java/Spring issue):**
${F}java
// BAD: this loads orders (1 query), then for EACH order, loads items (N queries)
List<Order> orders = orderRepository.findAll();
orders.forEach(o -> System.out.println(o.getItems().size())); // triggers N queries!

// GOOD: load everything in one query
List<Order> orders = orderRepository.findAllWithItems(); // JOIN FETCH
${F}

**SELECT * problem:**
${F}java
// BAD: loads every column even if you only need 3
List<Order> orders = orderRepository.findAll();

// GOOD: only fetch what you need
List<OrderSummary> summaries = orderRepository.findSummariesByCustomerId(id);
// OrderSummary interface: getId(), getStatus(), getCreatedAt()
${F}

---

## Step 5 — The debugging checklist

When a query is slow, check these in order:

${F}
1. ✅ Run EXPLAIN ANALYZE — look for "Seq Scan" on large tables
2. ✅ Check if there's an index on the WHERE/JOIN columns
3. ✅ Check if SELECT * is fetching unused columns
4. ✅ Count SQL queries per request — is N+1 happening?
5. ✅ Check pagination — is OFFSET very large?
6. ✅ Check for long-running transactions blocking other queries
7. ✅ Run ANALYZE to refresh database statistics
${F}

---

## 💡 Interview answer

**Open:** "When I see a slow query, my first stop is EXPLAIN ANALYZE — it shows the execution plan and real timings. I look for Seq Scan on large tables with many rows removed — that's a missing index."

**Then:** "The most common fix is adding an index on the filtered column with \`CREATE INDEX CONCURRENTLY\` — CONCURRENTLY is important in production because it doesn't lock the table. For Java apps, I also check for N+1 problems using Hibernate's \`generate_statistics\` — if query count for one request is more than 5-10, something is fetching lazily in a loop."

**End:** "The checklist I follow: EXPLAIN first, then fix the biggest bottleneck (usually missing index or N+1), then verify with EXPLAIN again. Pg_stat_statements gives you a leaderboard of slowest queries so you always know where to look next."
`.trim(),

};

const data = JSON.parse(readFileSync(FILE, 'utf8'));
let count = 0;
for (const theme of data.themes) {
  for (const scenario of theme.scenarios) {
    if (answers[scenario.id]) {
      scenario.answer = answers[scenario.id];
      console.log(`✅ ${scenario.id}`);
      count++;
    }
  }
}
writeFileSync(FILE, JSON.stringify(data, null, 2));
console.log(`\nDone — ${count} scenarios rewritten.`);
