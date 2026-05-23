# SQL joins & window functions visual guide

*INNER, LEFT, RIGHT, FULL, CROSS joins with diagrams — plus ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD, and SUM OVER with real examples. The SQL that trips up backend developers in interviews.*

*Examples use PostgreSQL syntax (compatible with MySQL/H2 for basic queries).*

---

## Setup: the tables used in this guide

```sql
-- orders: one row per order
CREATE TABLE orders (
    id          BIGINT PRIMARY KEY,
    customer_id BIGINT,
    status      VARCHAR(20),
    total       DECIMAL(10,2),
    created_at  TIMESTAMP
);

-- customers: one row per customer
CREATE TABLE customers (
    id    BIGINT PRIMARY KEY,
    name  VARCHAR(100),
    email VARCHAR(100)
);

-- Sample data:
-- customers: 1=Alice, 2=Bob, 3=Carol (no orders), 4=Dave (no record but has orders)
-- orders: 101 (Alice), 102 (Alice), 103 (Bob), 104 (customer_id=999 — orphaned)
```

---

## JOIN types — what each one returns

```
       customers                orders
    ┌───┬────────┐         ┌─────┬────────────┐
    │ 1 │ Alice  │         │ 101 │ customer=1 │
    │ 2 │ Bob    │         │ 102 │ customer=1 │
    │ 3 │ Carol  │         │ 103 │ customer=2 │
    └───┴────────┘         │ 104 │ customer=999│
                           └─────┴────────────┘
```

### INNER JOIN — only matching rows from both tables

Returns rows where the join condition matches in BOTH tables.

```sql
SELECT c.name, o.id AS order_id, o.total
FROM customers c
INNER JOIN orders o ON o.customer_id = c.id;
-- or just: JOIN orders o ON ...

-- Result: Alice/101, Alice/102, Bob/103
-- Carol (no orders) is excluded.
-- Order 104 (customer=999, no customer row) is excluded.
```

**Use when:** You only want data that exists on both sides.

---

### LEFT JOIN — all from the left table, matched from the right

Returns all rows from the LEFT table, with `NULL` for right-side columns when there is no match.

```sql
SELECT c.name, o.id AS order_id, o.total
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id;

-- Result:
-- Alice  | 101 | 99.50
-- Alice  | 102 | 149.00
-- Bob    | 103 | 50.00
-- Carol  | NULL | NULL    ← Carol included, no match on right

-- Find customers with NO orders:
SELECT c.name
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.id IS NULL;
-- Result: Carol
```

**Use when:** You want all records from the "main" table, even without matches. The most commonly used JOIN after INNER.

---

### RIGHT JOIN — all from the right table, matched from the left

Opposite of LEFT JOIN. Less common — you can always rewrite as a LEFT JOIN by swapping table order.

```sql
SELECT c.name, o.id AS order_id
FROM customers c
RIGHT JOIN orders o ON o.customer_id = c.id;

-- Result:
-- Alice  | 101
-- Alice  | 102
-- Bob    | 103
-- NULL   | 104   ← order 104 included, no matching customer

-- Equivalent LEFT JOIN (preferred):
SELECT c.name, o.id AS order_id
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id;
```

---

### FULL OUTER JOIN — all rows from both tables

Returns all rows from both tables. `NULL` fills where there is no match on the other side.

```sql
SELECT c.name, o.id AS order_id
FROM customers c
FULL OUTER JOIN orders o ON o.customer_id = c.id;

-- Result:
-- Alice  | 101      ← matched
-- Alice  | 102      ← matched
-- Bob    | 103      ← matched
-- Carol  | NULL     ← customer without order
-- NULL   | 104      ← order without customer
```

**Use when:** You need to find unmatched rows on EITHER side — reconciliation, data quality checks.

---

### CROSS JOIN — every row from left with every row from right

Returns the Cartesian product: M rows × N rows = M×N results. No join condition.

```sql
SELECT c.name, p.name AS product
FROM customers c
CROSS JOIN products p;

-- If 3 customers and 10 products → 30 rows
-- Use for: generating combinations, test data, calendar dates × events
```

---

### SELF JOIN — join a table to itself

```sql
-- Find pairs of orders from the same customer on the same day:
SELECT a.id AS order1, b.id AS order2, a.customer_id
FROM orders a
JOIN orders b ON a.customer_id = b.customer_id
             AND a.created_at::date = b.created_at::date
             AND a.id < b.id;  -- avoid duplicates (A,B) and (B,A)
```

---

## Multiple JOINs

```sql
-- Orders with customer name and product details:
SELECT
    c.name       AS customer,
    o.id         AS order_id,
    p.name       AS product,
    oi.quantity,
    oi.quantity * p.price AS line_total
FROM orders o
JOIN customers c       ON c.id = o.customer_id
JOIN order_items oi    ON oi.order_id = o.id
JOIN products p        ON p.id = oi.product_id
WHERE o.status = 'ACTIVE';
```

---

## Window functions — aggregate without collapsing rows

Regular aggregates (`GROUP BY`) collapse rows. Window functions run a calculation over a "window" of rows but keep every row in the output.

```sql
-- GROUP BY collapses:
SELECT customer_id, SUM(total) FROM orders GROUP BY customer_id;
-- 3 customers → 3 rows

-- Window function keeps all rows:
SELECT id, customer_id, total,
       SUM(total) OVER (PARTITION BY customer_id) AS customer_total
FROM orders;
-- 4 orders → 4 rows, each showing the customer's total
```

### ROW_NUMBER, RANK, DENSE_RANK

```sql
SELECT
    id,
    customer_id,
    total,
    ROW_NUMBER()  OVER (PARTITION BY customer_id ORDER BY total DESC) AS row_num,
    RANK()        OVER (PARTITION BY customer_id ORDER BY total DESC) AS rank,
    DENSE_RANK()  OVER (PARTITION BY customer_id ORDER BY total DESC) AS dense_rank
FROM orders;

-- For customer Alice with orders: 149.00, 99.50
-- ROW_NUMBER: 1, 2          (unique, no gaps ever)
-- RANK:       1, 2          (same as ROW_NUMBER here — no ties)
-- DENSE_RANK: 1, 2

-- If two orders tie at 149.00:
-- ROW_NUMBER: 1, 2, 3       (arbitrary tiebreak)
-- RANK:       1, 1, 3       (skips 2 after tie)
-- DENSE_RANK: 1, 1, 2       (never skips)
```

**Interview question: "Get the most recent order per customer."**

```sql
-- Method 1: ROW_NUMBER (most flexible)
SELECT customer_id, id AS order_id, total, created_at
FROM (
    SELECT *,
           ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC) AS rn
    FROM orders
) ranked
WHERE rn = 1;

-- Method 2: DISTINCT ON (PostgreSQL only — simpler)
SELECT DISTINCT ON (customer_id)
    customer_id, id AS order_id, total, created_at
FROM orders
ORDER BY customer_id, created_at DESC;
```

---

### LAG and LEAD — compare to adjacent rows

```sql
-- Show each order and the previous order amount for the same customer:
SELECT
    id,
    customer_id,
    total,
    created_at,
    LAG(total)  OVER (PARTITION BY customer_id ORDER BY created_at) AS prev_order_total,
    LEAD(total) OVER (PARTITION BY customer_id ORDER BY created_at) AS next_order_total
FROM orders;

-- Calculate change from previous order:
SELECT
    id,
    customer_id,
    total,
    total - LAG(total, 1, 0) OVER (PARTITION BY customer_id ORDER BY created_at) AS delta
FROM orders;
-- LAG(total, 1, 0): go back 1 row, default to 0 if no previous row
```

---

### SUM OVER — running totals and moving averages

```sql
-- Running total of orders per customer (cumulative sum):
SELECT
    id,
    customer_id,
    total,
    created_at,
    SUM(total) OVER (
        PARTITION BY customer_id
        ORDER BY created_at
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS running_total
FROM orders;

-- 7-day moving average of daily revenue:
SELECT
    created_at::date AS day,
    SUM(total)       AS daily_revenue,
    AVG(SUM(total))  OVER (
        ORDER BY created_at::date
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) AS moving_avg_7d
FROM orders
GROUP BY created_at::date
ORDER BY day;
```

---

### NTILE — divide rows into buckets

```sql
-- Divide customers into 4 spending quartiles:
SELECT
    customer_id,
    SUM(total) AS total_spent,
    NTILE(4) OVER (ORDER BY SUM(total) DESC) AS spending_quartile
FROM orders
GROUP BY customer_id;
-- quartile 1 = top 25% spenders
```

---

### FIRST_VALUE and LAST_VALUE

```sql
-- Show the highest order total for each customer alongside every row:
SELECT
    id,
    customer_id,
    total,
    FIRST_VALUE(total) OVER (
        PARTITION BY customer_id
        ORDER BY total DESC
    ) AS max_order_total
FROM orders;

-- LAST_VALUE requires explicit frame (default frame excludes later rows):
SELECT
    id,
    customer_id,
    total,
    LAST_VALUE(total) OVER (
        PARTITION BY customer_id
        ORDER BY total DESC
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS min_order_total
FROM orders;
```

---

## Common interview patterns

### Top N per group (the most asked SQL question)

```sql
-- Top 3 orders by value per customer:
SELECT customer_id, id, total
FROM (
    SELECT *,
           ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total DESC) AS rn
    FROM orders
) t
WHERE rn <= 3;
```

### Month-over-month growth

```sql
SELECT
    DATE_TRUNC('month', created_at) AS month,
    SUM(total)                       AS revenue,
    LAG(SUM(total)) OVER (ORDER BY DATE_TRUNC('month', created_at)) AS prev_month,
    ROUND(
        100.0 * (SUM(total) - LAG(SUM(total)) OVER (ORDER BY DATE_TRUNC('month', created_at)))
            / NULLIF(LAG(SUM(total)) OVER (ORDER BY DATE_TRUNC('month', created_at)), 0),
        2
    ) AS growth_pct
FROM orders
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month;
```

### Gaps and islands (find consecutive sequences)

```sql
-- Find consecutive days with orders (islands):
SELECT
    MIN(order_date) AS island_start,
    MAX(order_date) AS island_end,
    COUNT(*)        AS days
FROM (
    SELECT
        order_date,
        order_date - ROW_NUMBER() OVER (ORDER BY order_date) * INTERVAL '1 day' AS grp
    FROM (SELECT DISTINCT created_at::date AS order_date FROM orders) d
) grouped
GROUP BY grp
ORDER BY island_start;
```

---

## Quick reference

| Need | SQL |
|---|---|
| Only matched rows | `INNER JOIN` |
| All from left, null for unmatched right | `LEFT JOIN` |
| All from both, null for unmatched | `FULL OUTER JOIN` |
| Cartesian product | `CROSS JOIN` |
| Unique row number per partition | `ROW_NUMBER() OVER (PARTITION BY ... ORDER BY ...)` |
| Rank with gaps on ties | `RANK()` |
| Rank without gaps on ties | `DENSE_RANK()` |
| Previous row's value | `LAG(col) OVER (...)` |
| Next row's value | `LEAD(col) OVER (...)` |
| Running total | `SUM(col) OVER (ORDER BY ... ROWS UNBOUNDED PRECEDING)` |
| Top N per group | `ROW_NUMBER() OVER (...) <= N` |
| Latest row per group | `ROW_NUMBER() OVER (PARTITION BY ... ORDER BY ... DESC) = 1` |
