import { readFileSync, writeFileSync } from 'fs';
const FILE = 'public/data/scenarioInterviewThemes.json';
const F = '```';

const answers = {

'th-db-index-login': `
## 🔥 The situation

Your login endpoint is getting slow — users report it takes 3-4 seconds to sign in. The endpoint queries the \`users\` table by email address. The table has 2 million rows and no index on the \`email\` column. Every login triggers a full table scan through all 2 million users to find one.

---

## 🧠 Understand this first

| Concept | What it means |
|---|---|
| **Full table scan** | DB reads every row — fine for small tables, catastrophic at 2M+ rows |
| **B-tree index** | Sorted data structure — allows O(log n) lookup instead of O(n) |
| **Unique index** | Index + uniqueness constraint combined — emails must be unique anyway |
| **Index selectivity** | Email is highly selective (each value is unique) — perfect for an index |
| **CONCURRENTLY** | PostgreSQL flag to build index without locking the table — safe in production |

---

## Step 1 — Confirm the problem with EXPLAIN ANALYZE

${F}sql
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'alice@example.com';
${F}

**What you see (no index):**
${F}
Seq Scan on users  (cost=0.00..54832.00 rows=1 width=312)
                   (actual time=234.120..3421.567 rows=1 loops=1)
  Filter: ((email)::text = 'alice@example.com')
  Rows Removed by Filter: 1999999   ← read all 2M rows to find 1!
Planning Time: 0.089 ms
Execution Time: 3421.234 ms         ← 3.4 seconds for a login!
${F}

---

## Step 2 — Add a unique index on email

${F}sql
-- CONCURRENTLY = builds the index without locking the table
-- Safe to run on a live production database
CREATE UNIQUE INDEX CONCURRENTLY idx_users_email
    ON users(email);
${F}

If email is case-insensitive (common for login):

${F}sql
-- Case-insensitive index using lower()
CREATE UNIQUE INDEX CONCURRENTLY idx_users_email_lower
    ON users(lower(email));
-- Now: WHERE lower(email) = lower('Alice@Example.com') uses the index
${F}

---

## Step 3 — Verify the fix

${F}sql
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'alice@example.com';
${F}

**What you see after index:**
${F}
Index Scan using idx_users_email on users
  (actual time=0.042..0.043 rows=1 loops=1)
  Index Cond: ((email)::text = 'alice@example.com')
Planning Time: 0.234 ms
Execution Time: 0.089 ms    ← 3421ms → 0.09ms!
${F}

---

## Step 4 — Add the index in your Flyway migration

${F}sql
-- V3__add_users_email_index.sql
CREATE UNIQUE INDEX CONCURRENTLY idx_users_email ON users(email);
${F}

And declare it on the JPA entity:

${F}java
@Entity
@Table(name = "users",
    uniqueConstraints = @UniqueConstraint(columnNames = "email"),
    indexes = @Index(name = "idx_users_email", columnList = "email"))
public class User {
    @Column(unique = true, nullable = false)
    private String email;
}
${F}

---

## 💡 Interview answer

**Open:** "Login was taking 3.4 seconds. EXPLAIN ANALYZE showed a Seq Scan removing 1,999,999 rows — it was reading all 2 million users to find one by email."

**Then:** "Added \`CREATE UNIQUE INDEX CONCURRENTLY idx_users_email ON users(email)\`. CONCURRENTLY prevents table locking — it builds the index in the background, safe for production. Login time dropped to 0.09ms."

**End:** "The lesson: any column used in a \`WHERE\` clause for a login, lookup, or unique-check query needs an index. Email and username are almost always lookup keys — they should be indexed and constrained unique at table creation time, not discovered missing after scaling."
`.trim(),

'th-db-unread-notifications': `
## 🔥 The situation

Your app has a notifications feature — a bell icon showing unread count. The query \`SELECT COUNT(*) FROM notifications WHERE user_id = ? AND read = false\` runs on every page load for every logged-in user. With 10 million notification rows, this becomes a performance bottleneck — even with an index on \`user_id\`, it's scanning all notifications for that user to count unread ones.

---

## 🧠 Understand this first

| Concept | What it means |
|---|---|
| **Partial index** | An index that only includes rows matching a WHERE condition |
| **Composite index** | Index on multiple columns — order matters |
| **Covering index** | Index includes all columns in the query — no table access needed |
| **Denormalization** | Store a pre-computed value (unread_count) to avoid expensive aggregation |
| **Cache** | Store the count in Redis — serve from cache instead of querying DB every time |

---

## Step 1 — Diagnose the current query

${F}sql
EXPLAIN ANALYZE
SELECT COUNT(*) FROM notifications WHERE user_id = 42 AND read = false;
${F}

**What you see:**
${F}
Aggregate (actual time=45.234..45.234 rows=1 loops=1)
  ->  Index Scan using idx_notifications_user on notifications
        Index Cond: (user_id = 42)
        Filter: (read = false)
        Rows Removed by Filter: 8934   ← scanning all 9000 notifications for user 42
                                           to find 23 unread
Execution Time: 45.234 ms
${F}

The index on \`user_id\` helps but still scans all notifications for this user (read + unread).

---

## Step 2 — Add a partial composite index

${F}sql
-- Only index unread notifications — much smaller, more selective
CREATE INDEX CONCURRENTLY idx_notifications_unread
    ON notifications(user_id)
    WHERE read = false;
    -- Only rows where read=false are in this index
    -- As notifications are marked read, they drop out of the index
${F}

**After fix:**
${F}
Index Only Scan using idx_notifications_unread on notifications
  Index Cond: (user_id = 42) AND (read = false)
  (actual rows=23 loops=1)    ← directly found 23 unread, no filtering!
Execution Time: 0.234 ms
${F}

---

## Step 3 — Cache the unread count in Redis

For very high-traffic apps (millions of users, notifications tab loads on every page):

${F}java
@Service
public class NotificationService {

    @Autowired
    private StringRedisTemplate redis;

    @Autowired
    private NotificationRepository repository;

    public long getUnreadCount(Long userId) {
        String key = "unread:" + userId;
        String cached = redis.opsForValue().get(key);

        if (cached != null) return Long.parseLong(cached);

        long count = repository.countByUserIdAndReadFalse(userId);
        redis.opsForValue().set(key, String.valueOf(count), 5, TimeUnit.MINUTES);
        return count;
    }

    public void markAsRead(Long notificationId, Long userId) {
        notificationRepository.markRead(notificationId);
        redis.delete("unread:" + userId); // invalidate cache
    }
}
${F}

---

## Step 4 — Denormalize with a counter column (highest scale)

${F}sql
-- Add an unread_count column to the users table
ALTER TABLE users ADD COLUMN unread_notification_count INTEGER DEFAULT 0;

-- Update via trigger or application code when notifications change
UPDATE users SET unread_notification_count = unread_notification_count - 1
WHERE id = :userId;
-- Query becomes: SELECT unread_notification_count FROM users WHERE id = ?
-- Single row lookup — sub-millisecond, no aggregation
${F}

---

## 💡 Interview answer

**Open:** "The notification count query was running on every page load for all users — with 10M notifications and only a \`user_id\` index, it was scanning all notifications per user to count unread ones."

**Then:** "I added a partial index: \`CREATE INDEX ON notifications(user_id) WHERE read = false\`. This index only contains unread notifications — it's much smaller and more selective. As notifications are marked read, they automatically drop out of the index. Query time dropped from 45ms to 0.2ms."

**End:** "For truly high-scale (millions of concurrent users), I'd add Redis caching of the count with 5-minute TTL and invalidate on mark-read. The partial index is the right first fix — it keeps the database as the source of truth without the complexity of cache invalidation. Add caching only when database load actually becomes a problem."
`.trim(),

'th-db-unbounded-pagination': `
## 🔥 The situation

Your admin API exports orders: \`SELECT * FROM orders ORDER BY created_at DESC\`. No limit. The table has 5 million rows. When someone calls this endpoint, it tries to load all 5 million rows into memory, serializes them to JSON, and sends a 2GB response. The server runs out of memory and crashes — or the request times out after 5 minutes.

---

## 🧠 Understand this first

| Concept | What it means |
|---|---|
| **Unbounded query** | No LIMIT clause — returns everything, regardless of table size |
| **Streaming** | Process one row at a time instead of loading all into memory |
| **Cursor** | DB-level cursor allows fetching rows in batches without offset overhead |
| **\`setFetchSize\`** | JDBC hint to stream rows from DB instead of loading all at once |
| **Keyset pagination** | \`WHERE id > last_id LIMIT 1000\` — faster than OFFSET for large datasets |

---

## Step 1 — Identify unbounded queries in your code

${F}java
// BUG: loads everything into memory at once
@GetMapping("/admin/export")
public List<Order> exportAllOrders() {
    return orderRepository.findAll(); // 5 million rows → OutOfMemoryError!
}

// BUG: even with a Pageable, Spring's findAll() fetches everything first
List<Order> orders = orderRepository.findAll(Sort.by("createdAt").descending());
${F}

---

## Step 2 — Fix with streaming (process one row at a time)

${F}java
@GetMapping("/admin/export")
public void exportOrders(HttpServletResponse response) throws IOException {
    response.setContentType("application/json");
    response.setHeader("Content-Disposition", "attachment; filename=orders.json");

    try (PrintWriter writer = response.getWriter();
         Stream<Order> orderStream = orderRepository.streamAllByOrderByCreatedAtDesc()) {

        writer.write("[");
        long[] count = {0};

        orderStream.forEach(order -> {
            if (count[0]++ > 0) writer.write(",");
            writer.write(toJson(order)); // write one order at a time
            writer.flush();             // flush to client, don't buffer
        });

        writer.write("]");
    }
}
${F}

${F}java
// Repository — uses @QueryHints for JDBC streaming
public interface OrderRepository extends JpaRepository<Order, Long> {

    @QueryHints(value = @QueryHint(name = HINT_FETCH_SIZE, value = "1000"))
    @Query("SELECT o FROM Order o ORDER BY o.createdAt DESC")
    Stream<Order> streamAllByOrderByCreatedAtDesc();
}
${F}

With \`FETCH_SIZE=1000\`, JDBC fetches 1000 rows at a time from the DB — only 1000 rows in memory at any point.

---

## Step 3 — Add mandatory pagination to public APIs

${F}java
@GetMapping("/orders")
public Page<OrderSummary> getOrders(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size) {

    // Enforce maximum page size — never let clients request 1M rows
    int safeSise = Math.min(size, 100);

    return orderRepository.findAllSummaries(
        PageRequest.of(page, safeSise, Sort.by("createdAt").descending()));
}
${F}

---

## Step 4 — Use keyset pagination for large exports

${F}java
@GetMapping("/admin/export-batch")
public List<Order> exportBatch(
        @RequestParam(required = false) Long afterId,
        @RequestParam(defaultValue = "1000") int size) {

    int safeSise = Math.min(size, 1000);

    if (afterId == null) {
        return orderRepository.findTopNOrderByIdDesc(safeSise);
    }
    return orderRepository.findByIdLessThanOrderByIdDesc(afterId, safeSise);
}
// Client calls repeatedly: /export-batch, /export-batch?afterId=9999000, etc.
// Each call: O(log n) index seek — constant time regardless of depth
${F}

---

## 💡 Interview answer

**Open:** "Our export endpoint was crashing the server — \`orderRepository.findAll()\` on a 5M row table caused an OOM error as Spring tried to load all rows into a \`List\`."

**Then:** "I switched to repository streaming with \`Stream<Order> streamAllBy...\` and set \`HINT_FETCH_SIZE=1000\`. This uses a JDBC cursor — only 1000 rows are in memory at once. The HTTP response is streamed JSON, written and flushed row by row. Memory usage stayed flat at ~50MB regardless of export size."

**End:** "I also added a hard cap on page size for all public APIs: \`Math.min(size, 100)\`. No matter what the client sends, they get at most 100 rows. For the bulk export use case, keyset pagination with \`WHERE id < last_id\` gives constant-time batching. The rule: every query that touches a large table needs either a LIMIT or a streaming cursor — never \`findAll()\` on a table that grows."
`.trim(),

'th-db-explain-stats': `
## 🔥 The situation

You added an index, but the query is still slow. Or a query that was fast last month is now slow. The database's query planner makes decisions based on statistics — how many rows are in the table, how many distinct values a column has, how data is distributed. When statistics are stale (the table grew significantly since the last stats update), the planner makes bad decisions and chooses a slow plan.

---

## 🧠 Understand this first

| Concept | What it means |
|---|---|
| **Query planner** | PostgreSQL's component that decides HOW to execute a query (which index, which join method) |
| **Statistics** | Sampled information about tables: row count, distinct values, histograms |
| **ANALYZE** | PostgreSQL command to update statistics for a table |
| **autovacuum** | PostgreSQL background process that auto-analyzes — but can be slow to trigger |
| **Bad estimate** | Planner estimated 50 rows, got 500,000 — chose wrong join method as a result |
| **Planner hint** | Forcing a specific plan — usually a workaround, not a real fix |

---

## Step 1 — Spot bad estimates in EXPLAIN ANALYZE

${F}sql
EXPLAIN ANALYZE
SELECT * FROM orders o
JOIN order_items oi ON oi.order_id = o.id
WHERE o.status = 'SHIPPED'
  AND oi.product_id = 999;
${F}

**What you see (bad estimate — planner chose wrong plan):**
${F}
Nested Loop  (cost=0.00..450.00 rows=12 ...)    ← planner estimated 12 rows
             (actual time=0.021..8934.234 rows=89234 loops=1)  ← got 89,234!
  ->  Seq Scan on orders o
        Filter: (status = 'SHIPPED')
        Rows Removed: 4800000    ← scanning 5M rows!
  ->  Index Scan on order_items oi
        Index Cond: (order_id = o.id) AND (product_id = 999)
Execution Time: 8934.456 ms
${F}

**What's happening:** The planner thought only 12 rows would match \`status = 'SHIPPED'\`. If it knew there were 89,234, it would have chosen a Hash Join instead of Nested Loop. The estimate is wrong because statistics are stale.

---

## Step 2 — Update statistics

${F}sql
-- Update statistics for the table
ANALYZE orders;
ANALYZE order_items;

-- Or analyze all tables at once
ANALYZE VERBOSE;  -- VERBOSE shows what's being analyzed
${F}

**What you see:**
${F}
INFO:  analyzing "public.orders"
INFO:  "orders": scanned 30000 of 500000 pages, containing 6000000 live rows
       and 0 dead rows; 30000 rows in sample, 6120000 estimated total rows
ANALYZE
${F}

---

## Step 3 — Increase statistics target for skewed data

By default, PostgreSQL samples ~300 rows per column for statistics. For columns with complex distributions (many distinct values or high skew), sample more:

${F}sql
-- Check current statistics target
SELECT attname, attstattarget
FROM pg_attribute
WHERE attrelid = 'orders'::regclass AND attstattarget != 0;

-- Increase statistics target for a column with many distinct values
ALTER TABLE orders ALTER COLUMN status SET STATISTICS 500;
-- Then re-analyze to apply
ANALYZE orders;
${F}

---

## Step 4 — Verify the fix with EXPLAIN ANALYZE

${F}sql
EXPLAIN ANALYZE
SELECT * FROM orders o
JOIN order_items oi ON oi.order_id = o.id
WHERE o.status = 'SHIPPED' AND oi.product_id = 999;
${F}

**What you see after ANALYZE:**
${F}
Hash Join  (cost=12834.00..18934.00 rows=87000 ...)  ← now estimates 87,000 ✅
           (actual time=234.120..1234.567 rows=89234 loops=1)
  ->  Seq Scan on orders o
        Filter: (status = 'SHIPPED')
        Rows Removed: 4800000
  ->  Hash on order_items oi
        (actual rows=92000 loops=1)
Execution Time: 1234.567 ms   ← 8934ms → 1234ms with same data, just better plan
${F}

The planner now chooses Hash Join because it knows there are 87,000 rows, not 12.

---

## Step 5 — Force autovacuum to run more aggressively

${F}sql
-- See when a table was last analyzed
SELECT schemaname, relname, last_analyze, last_autoanalyze, n_live_tup, n_dead_tup
FROM pg_stat_user_tables
WHERE relname = 'orders';
${F}

**What you see:**
${F}
relname | last_analyze | last_autoanalyze | n_live_tup | n_dead_tup
orders  | 3 days ago   | 2 days ago       | 5,200,000  | 890,000    ← lots of dead rows!
${F}

If autovacuum isn't running fast enough:

${F}sql
-- Trigger manual VACUUM ANALYZE for both cleanup and stats
VACUUM ANALYZE orders;

-- Or tune autovacuum aggressiveness for high-traffic tables
ALTER TABLE orders SET (
    autovacuum_analyze_scale_factor = 0.01,  -- analyze after 1% of rows change (default 20%)
    autovacuum_vacuum_scale_factor = 0.01    -- vacuum after 1% dead rows (default 20%)
);
${F}

---

## 💡 Interview answer

**Open:** "A query that was fast with an index started taking 9 seconds after the table tripled in size. EXPLAIN ANALYZE showed the planner estimated 12 matching rows but got 89,234 — it chose Nested Loop instead of Hash Join because of stale statistics."

**Then:** "Running \`ANALYZE orders\` updated the statistics. The planner immediately chose Hash Join and query time dropped from 8.9s to 1.2s — same data, same index, just a correct query plan. I also increased the statistics target for the \`status\` column from default 100 to 500 since it has a complex distribution."

**End:** "The diagnostic: when EXPLAIN ANALYZE shows \`rows=X\` (estimated) wildly different from \`actual rows=Y\`, it's a statistics problem. The fix is ANALYZE. For tables that change rapidly, tune autovacuum thresholds with \`autovacuum_analyze_scale_factor = 0.01\` so statistics stay fresh automatically. I also added a Grafana alert on \`pg_stat_user_tables.last_autoanalyze > 1 day\` for busy tables."
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
