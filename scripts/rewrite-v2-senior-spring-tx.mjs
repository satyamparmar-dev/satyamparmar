/**
 * V2 rewrite — senior-spring-transactions (3 scenarios)
 * Run: node scripts/rewrite-v2-senior-spring-tx.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
const FILE = 'public/data/scenarioInterviewThemes.json';
const F = '```';

const answers = {

'th-sr-self-invoke': `
## 🔥 The situation
You have a service class. Method A calls method B in the SAME class. Method B is annotated with \`@Transactional\`. You expect B to run in a transaction. But it doesn't. Data gets saved without a transaction. No error is thrown. The bug is silent.

## 🧠 Why self-invocation bypasses @Transactional — the proxy model

${F}text
How Spring @Transactional works:

When you @Autowire a bean, Spring doesn't give you the actual object.
It gives you a PROXY that wraps the object:

Your code → Proxy → begin transaction → Real object method → commit/rollback

The proxy is what intercepts @Transactional and adds transaction logic.

The problem with self-invocation:

public class OrderService {
    public void methodA() {
        this.methodB();  ← "this" is the REAL object, NOT the proxy!
    }

    @Transactional
    public void methodB() { ... }  // transaction NEVER starts — proxy was bypassed
}

The proxy only wraps external calls. Internal calls via "this" go straight to the real
object — the proxy has no chance to intercept and start a transaction.
${F}

| Scenario | Does @Transactional work? |
|---|---|
| External caller → @Transactional method | ✅ Yes — goes through proxy |
| Same class method → @Transactional method (self-invoke) | ❌ No — bypasses proxy |
| Same class method → @Transactional method via injected self | ✅ Yes — goes through proxy |
| Method A and B both @Transactional, same class, A calls B | ❌ B's annotation has no effect |

## Step 1: Confirm the bug — enable transaction logging

${F}yaml
# application.yml
logging:
  level:
    org.springframework.transaction: DEBUG
    org.springframework.transaction.interceptor: TRACE
${F}

**What you see when @Transactional works (external call):**
${F}text
DEBUG TransactionInterceptor - Getting transaction for OrderService.placeOrder
DEBUG DataSourceTransactionManager - Creating new transaction for OrderService.placeOrder
DEBUG DataSourceTransactionManager - Acquired connection
DEBUG DataSourceTransactionManager - Committing JDBC transaction
${F}

**What you see when self-invocation bypasses it (method A calls method B internally):**
${F}text
DEBUG TransactionInterceptor - Getting transaction for OrderService.methodA
// methodA starts a transaction...
// methodB is called via "this" — no interceptor fires for methodB
// No "Getting transaction for methodB" log appears at all
${F}

## Step 2: Fix A — extract method B into a separate Spring bean

${F}java
// BEFORE (broken — self-invoke):
@Service
public class OrderService {

    @Autowired private OrderRepository orderRepo;

    public void processOrders(List<String> orderIds) {
        for (String id : orderIds) {
            this.processOneOrder(id); // self-invocation — @Transactional on processOneOrder is ignored!
        }
    }

    @Transactional
    public void processOneOrder(String orderId) {
        Order order = orderRepo.findById(orderId).orElseThrow();
        order.setStatus("PROCESSED");
        orderRepo.save(order);
    }
}

// AFTER (fixed — separate bean):
@Service
public class OrderService {

    @Autowired private OrderProcessor orderProcessor; // injected separately

    public void processOrders(List<String> orderIds) {
        for (String id : orderIds) {
            orderProcessor.processOneOrder(id); // goes through proxy → transaction starts!
        }
    }
}

@Service
public class OrderProcessor {

    @Autowired private OrderRepository orderRepo;

    @Transactional // works now — called from external bean (through proxy)
    public void processOneOrder(String orderId) {
        Order order = orderRepo.findById(orderId).orElseThrow();
        order.setStatus("PROCESSED");
        orderRepo.save(order);
    }
}
${F}

## Step 3: Fix B — inject self (quick fix, less clean)

${F}java
@Service
public class OrderService {

    @Autowired
    @Lazy // @Lazy prevents circular dependency error
    private OrderService self; // inject the PROXY of this bean into itself

    public void processOrders(List<String> orderIds) {
        for (String id : orderIds) {
            self.processOneOrder(id); // calls via proxy → @Transactional intercepts!
        }
    }

    @Transactional
    public void processOneOrder(String orderId) {
        Order order = orderRepo.findById(orderId).orElseThrow();
        order.setStatus("PROCESSED");
        orderRepo.save(order);
    }
}
${F}

**What you see after fix — transaction logs for EACH order:**
${F}text
DEBUG TransactionInterceptor - Getting transaction for OrderProcessor.processOneOrder
DEBUG DataSourceTransactionManager - Creating new transaction
// ... processes order ...
DEBUG DataSourceTransactionManager - Committing JDBC transaction

DEBUG TransactionInterceptor - Getting transaction for OrderProcessor.processOneOrder
DEBUG DataSourceTransactionManager - Creating new transaction
// ... processes next order ...
DEBUG DataSourceTransactionManager - Committing JDBC transaction
${F}

## Step 4: Understand rollback — when does @Transactional roll back?

${F}java
@Transactional
public void placeOrder(OrderRequest request) {
    orderRepo.save(new Order(request));
    inventoryService.reserve(request.getItems()); // if this throws → rollback?

    // Spring rolls back on UNCHECKED exceptions (RuntimeException and its subclasses)
    // Spring does NOT roll back on CHECKED exceptions (IOException, SQLException)
    // by default!
}

// To rollback on a checked exception:
@Transactional(rollbackFor = Exception.class) // roll back on ANY exception
public void placeOrder(OrderRequest request) throws IOException { ... }

// To NOT rollback on a specific unchecked exception:
@Transactional(noRollbackFor = OptimisticLockingFailureException.class)
public void placeOrder(OrderRequest request) { ... }
${F}

## Your interview answer
**Open:** "Spring @Transactional works through a proxy — when you call a @Transactional method from OUTSIDE the bean, the call goes through the proxy which starts a transaction. When you call it from WITHIN the same class using 'this', the proxy is bypassed entirely and no transaction starts."
**Then:** "The fix is to extract the transactional method into a separate Spring bean and inject it. The call then goes through the proxy again. Alternatively, inject the bean into itself with @Lazy to avoid circular dependency."
**End:** "Worth knowing: @Transactional only rolls back on unchecked exceptions (RuntimeException) by default. For checked exceptions, you need rollbackFor = Exception.class explicitly."
`.trim(),

'th-sr-propagation': `
## 🔥 The situation
You have a service that creates an audit log AND does a business operation. If the business operation fails, you want to roll it back — but you still want the audit log saved (so you know what was attempted). With the default \`@Transactional\`, both roll back together. You need to understand transaction propagation.

## 🧠 Transaction propagation types

| Propagation | What it means | Use when |
|---|---|---|
| REQUIRED (default) | Join existing transaction, or create new if none | Most methods — standard |
| REQUIRES_NEW | Always create a NEW transaction, suspend the outer one | Audit log, notifications — must save even if outer rolls back |
| NESTED | Create a savepoint inside the outer transaction | Partial rollback — outer can continue from the savepoint |
| MANDATORY | Must be called within an existing transaction, else exception | Helper methods that should never be the transaction root |
| NOT_SUPPORTED | Suspend any existing transaction, run without one | Read-only operations that should not be part of a transaction |
| NEVER | Throw exception if called within a transaction | Methods that must never run inside a transaction |
| SUPPORTS | Use existing transaction if present, else run without | Optional participation |

## Step 1: The default REQUIRED — inner and outer are the same transaction

${F}java
@Service
public class OrderService {

    @Autowired private OrderRepository orderRepo;
    @Autowired private AuditService auditService;

    @Transactional // REQUIRED — creates the outer transaction
    public void placeOrder(OrderRequest request) {
        auditService.log("PLACE_ORDER_ATTEMPT", request.getUserId()); // REQUIRED — joins outer tx
        Order order = orderRepo.save(new Order(request));
        inventoryService.reserve(order); // throws InsufficientStockException!

        // InsufficientStockException rolls back the ENTIRE transaction
        // Both the order AND the audit log are rolled back
        // Audit log is lost — you don't know anyone tried to place an order
    }
}

@Service
public class AuditService {

    @Transactional // REQUIRED = joins caller's transaction (the outer one)
    public void log(String action, String userId) {
        auditRepo.save(new AuditLog(action, userId)); // part of outer tx — rolls back with it!
    }
}
${F}

## Step 2: Fix — use REQUIRES_NEW for the audit log

${F}java
@Service
public class AuditService {

    @Transactional(propagation = Propagation.REQUIRES_NEW) // independent transaction
    public void log(String action, String userId) {
        auditRepo.save(new AuditLog(action, userId));
        // This is its OWN transaction — commits BEFORE returning to the caller
        // If the outer transaction later rolls back, this commit is permanent
    }
}
${F}

**What you see in logs with REQUIRES_NEW:**
${F}text
DEBUG TransactionManager - Creating new transaction for OrderService.placeOrder   (Tx-1)
DEBUG TransactionManager - Suspending current transaction (Tx-1) for AuditService.log
DEBUG TransactionManager - Creating new transaction for AuditService.log          (Tx-2)
DEBUG TransactionManager - Committing JDBC transaction (Tx-2)  ← audit log saved!
DEBUG TransactionManager - Resuming suspended transaction (Tx-1)
ERROR InventoryService   - Insufficient stock
DEBUG TransactionManager - Rolling back JDBC transaction (Tx-1) ← order rolled back
// Audit log is SAVED. Order is NOT saved. Exactly what we wanted.
${F}
**What this means (simple):** REQUIRES_NEW suspends Tx-1, opens Tx-2, commits Tx-2, then resumes Tx-1. Even if Tx-1 later rolls back, Tx-2 already committed — it cannot be undone.

## Step 3: NESTED — partial rollback (savepoints)

${F}java
// Use NESTED when: outer should continue even if inner fails, but inner failure
// should undo inner's own work (not outer's work done before the inner call)

@Service
public class BatchOrderProcessor {

    @Transactional // outer transaction
    public BatchResult processBatch(List<OrderRequest> requests) {
        BatchResult result = new BatchResult();

        for (OrderRequest request : requests) {
            try {
                processOneWithSavepoint(request); // NESTED — savepoint created
                result.addSuccess(request.getId());
            } catch (Exception e) {
                // The savepoint is rolled back — only THIS order's work undone
                // The outer transaction (other successful orders) continues!
                result.addFailure(request.getId(), e.getMessage());
                log.warn("Order {} failed, rolled back to savepoint: {}", request.getId(), e.getMessage());
            }
        }
        return result; // outer transaction commits all successful orders
    }

    @Transactional(propagation = Propagation.NESTED)
    public void processOneWithSavepoint(OrderRequest request) {
        orderRepo.save(new Order(request));
        inventoryService.reserve(request); // may throw
        // If throws: rolled back to savepoint — only this order's writes undone
        // Outer transaction can still continue and commit other orders
    }
}
${F}

**What you see with NESTED during a partial failure:**
${F}text
DEBUG TransactionManager - Creating new transaction for BatchOrderProcessor.processBatch
DEBUG TransactionManager - Creating savepoint for BatchOrderProcessor.processOneWithSavepoint
DEBUG TransactionManager - Committing to savepoint (order-1 succeeded)
DEBUG TransactionManager - Creating savepoint for BatchOrderProcessor.processOneWithSavepoint
ERROR InventoryService - Insufficient stock for order-2
DEBUG TransactionManager - Rolling back to savepoint (order-2 only)
DEBUG TransactionManager - Committing JDBC transaction (order-1 and order-3 saved, order-2 not saved)
${F}

## Your interview answer
**Open:** "Transaction propagation controls what happens when a @Transactional method is called from another @Transactional method. REQUIRED (default) joins the outer transaction — if the outer rolls back, everything rolls back including the inner call."
**Then:** "REQUIRES_NEW is for things that MUST be saved regardless — like audit logs or notifications. It suspends the outer transaction, commits its own independently, then resumes the outer. Even if the outer later rolls back, REQUIRES_NEW's commit stands."
**End:** "NESTED uses savepoints for partial batch rollback — individual items can fail and roll back just their own work, while the outer transaction continues and commits successful items. Use REQUIRED for normal business logic, REQUIRES_NEW for audit/notification, NESTED for batch processing with partial failure tolerance."
`.trim(),

'th-sr-isolation': `
## 🔥 The situation
Your financial report runs a query twice in the same transaction. The first run returns 1,000 rows. Between the two runs, another transaction inserts 50 new rows. The second run returns 1,050 rows. Your report is inconsistent — you saw different data in the same transaction. This is a phantom read.

## 🧠 Transaction isolation levels — what problems each solves

${F}text
Read phenomena (concurrency bugs that can happen):
1. Dirty Read:        Reading data written by a transaction that hasn't committed yet
2. Non-repeatable:   Reading same row twice, getting different values (row was updated between reads)
3. Phantom Read:     Reading same query twice, getting different rows (rows were inserted/deleted)
${F}

| Isolation Level | Dirty Read | Non-Repeatable | Phantom Read | Performance |
|---|---|---|---|---|
| READ_UNCOMMITTED | Can happen | Can happen | Can happen | Fastest |
| READ_COMMITTED | Prevented | Can happen | Can happen | Fast (PostgreSQL default) |
| REPEATABLE_READ | Prevented | Prevented | Can happen | Medium (MySQL InnoDB default) |
| SERIALIZABLE | Prevented | Prevented | Prevented | Slowest |

**PostgreSQL default is READ_COMMITTED. MySQL InnoDB default is REPEATABLE_READ.**

## Step 1: See the phantom read problem in code

${F}java
// Report service — two queries in the same transaction
@Transactional(isolation = Isolation.READ_COMMITTED) // default in Spring + PostgreSQL
public FinancialReport generateReport() {
    long totalOrders = orderRepo.countByStatus("COMPLETED");  // Query 1: returns 1000

    // Meanwhile, another transaction inserts 50 more COMPLETED orders and commits...

    BigDecimal totalRevenue = orderRepo.sumRevenue("COMPLETED"); // Query 2: sees 1050 orders!
    // Revenue calculation uses 1050 orders, count used 1000 — INCONSISTENT REPORT
    return new FinancialReport(totalOrders, totalRevenue);
}
${F}

**What you see in logs (phantom read):**
${F}text
INFO  ReportService - Counting completed orders: 1000
INFO  ReportService - Summing revenue for completed orders
// (another tx inserts 50 orders between these two lines)
INFO  ReportService - Revenue calculated for 1050 orders
WARN  ReportService - Mismatch: count=1000 but revenue computed for 1050 — phantom read!
${F}

## Step 2: Fix phantom read — use REPEATABLE_READ or SERIALIZABLE

${F}java
// REPEATABLE_READ: same rows stay the same, but new rows CAN appear
// (MySQL prevents phantom reads with gap locks, PostgreSQL does NOT)

// SERIALIZABLE: prevents phantoms — same result set for the same query
// every time in the same transaction — even if others insert new rows

@Transactional(isolation = Isolation.SERIALIZABLE)
public FinancialReport generateReport() {
    long totalOrders = orderRepo.countByStatus("COMPLETED");    // Query 1: returns 1000
    // Other tx inserts 50 orders and commits...
    BigDecimal totalRevenue = orderRepo.sumRevenue("COMPLETED"); // Query 2: still sees 1000!
    // SERIALIZABLE ensures our transaction saw a consistent snapshot from the start
    return new FinancialReport(totalOrders, totalRevenue);
}
${F}

**What you see in logs (with SERIALIZABLE):**
${F}text
DEBUG TransactionManager - Beginning SERIALIZABLE transaction
INFO  ReportService - Counting completed orders: 1000
// other tx inserts 50 orders — blocked until our transaction commits, OR PostgreSQL
// uses MVCC: our transaction reads from its snapshot, sees only data that existed at tx start
INFO  ReportService - Revenue calculated for 1000 orders
INFO  ReportService - Report generated: orders=1000, revenue=consistent ✓
DEBUG TransactionManager - Committing SERIALIZABLE transaction
${F}

## Step 3: The SERIALIZABLE cost — deadlocks and throughput

${F}java
// SERIALIZABLE can cause serialization failures under high concurrency:
@Transactional(isolation = Isolation.SERIALIZABLE)
public void updateOrder(Long orderId) {
    Order order = orderRepo.findById(orderId).orElseThrow();
    order.setStatus("SHIPPED");
    orderRepo.save(order);
    // May throw: org.springframework.dao.CannotSerializeTransactionException
    // PostgreSQL detected that serializing this transaction would change the outcome
}

// Handle serialization failure with retry:
@Retryable(retryFor = CannotSerializeTransactionException.class, maxAttempts = 3)
@Transactional(isolation = Isolation.SERIALIZABLE)
public void updateOrderWithRetry(Long orderId) {
    Order order = orderRepo.findById(orderId).orElseThrow();
    order.setStatus("SHIPPED");
    orderRepo.save(order);
}
${F}

**What you see when serialization fails:**
${F}text
WARN  TransactionManager - Could not serialize access due to concurrent update
org.springframework.dao.CannotSerializeTransactionException:
  could not serialize access due to concurrent update; nested exception is ...
// @Retryable retries up to 3 times — usually succeeds on second attempt
INFO  OrderService - Order 99 updated on attempt 2/3
${F}

## Step 4: Practical advice — when to use each level

${F}java
// Most CRUD operations: READ_COMMITTED (default)
// Fast, allows concurrent reads, only prevents dirty reads
@Transactional // READ_COMMITTED by default with PostgreSQL
public void updateOrder(OrderRequest req) { ... }

// Reports / aggregations that must be consistent:
@Transactional(isolation = Isolation.REPEATABLE_READ)
public SalesReport getDailySales(LocalDate date) { ... }

// Financial operations requiring strict consistency:
@Transactional(isolation = Isolation.SERIALIZABLE)
public void transferMoney(String fromAccount, String toAccount, BigDecimal amount) { ... }

// For high-traffic write paths: use OPTIMISTIC LOCKING instead of SERIALIZABLE
// Optimistic locking = @Version in JPA — detects conflicts at save time without locking rows
@Transactional // READ_COMMITTED — fast
public void updateInventory(Long skuId, int delta) {
    Inventory inv = inventoryRepo.findById(skuId).orElseThrow();
    inv.setQuantity(inv.getQuantity() + delta); // @Version field ensures no lost updates
    inventoryRepo.save(inv); // throws OptimisticLockingFailureException on conflict
}
${F}

## Your interview answer
**Open:** "Isolation levels control what concurrent transactions can see of each other's work. The default READ_COMMITTED prevents dirty reads but allows phantom reads — the same query in the same transaction can return different rows if another transaction inserts data between the two queries."
**Then:** "For reports that need a consistent view of the data, I'd use SERIALIZABLE — the transaction sees a snapshot from when it started, regardless of what other transactions commit during it. The cost is potential serialization failures that need retry logic."
**End:** "For most high-throughput write operations, SERIALIZABLE is too expensive. I'd use the default READ_COMMITTED plus optimistic locking (@Version) instead — it detects conflicts at commit time without holding locks, letting concurrent reads proceed freely."
`.trim(),

};

const data = JSON.parse(readFileSync(FILE, 'utf8'));
let count = 0;
for (const theme of data.themes) {
  for (const scenario of theme.scenarios) {
    if (answers[scenario.id]) { scenario.answer = answers[scenario.id]; console.log(`✅ ${scenario.id}`); count++; }
  }
}
writeFileSync(FILE, JSON.stringify(data, null, 2));
console.log(`\nDone — ${count} scenarios rewritten.`);
