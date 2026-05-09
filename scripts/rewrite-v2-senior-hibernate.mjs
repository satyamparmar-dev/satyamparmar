/**
 * V2 rewrite — senior-hibernate-jpa (3 scenarios)
 * Run: node scripts/rewrite-v2-senior-hibernate.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
const FILE = 'public/data/scenarioInterviewThemes.json';
const F = '```';

const answers = {

'th-sr-n-plus-one': `
## 🔥 The situation
Your \`GET /orders\` endpoint loads 100 orders. Hibernate silently makes 101 SQL queries — 1 to fetch the orders, then 1 per order to fetch its items. On 100,000 orders this becomes 100,001 queries. The endpoint takes 30 seconds and kills your DB.

## 🧠 Why N+1 happens — lazy loading

${F}text
@Entity Order {
    @OneToMany(fetch = FetchType.LAZY)  ← default for collections
    List<Item> items;
}

What happens:
  Query 1:  SELECT * FROM orders                  ← fetches 100 orders
  Query 2:  SELECT * FROM items WHERE order_id=1  ← accessing order.getItems() for order 1
  Query 3:  SELECT * FROM items WHERE order_id=2  ← accessing order.getItems() for order 2
  ...
  Query 101: SELECT * FROM items WHERE order_id=100

= 101 queries. N+1 problem.

Why is it LAZY? Because eagerly loading every collection on every query would be
even worse — you'd always load items even when you don't need them.
The solution is to load eagerly ONLY WHEN YOU KNOW YOU NEED IT.
${F}

## Step 1: Detect N+1 — enable SQL logging and count queries

${F}yaml
# application.yml
logging:
  level:
    org.hibernate.SQL: DEBUG               # shows every SQL query
    org.hibernate.type.descriptor.sql: TRACE  # shows bind parameters
    org.hibernate.stat: DEBUG              # shows query count per session
spring:
  jpa:
    properties:
      hibernate:
        generate_statistics: true          # enables session-level query count
${F}

**What you see in logs (N+1 confirmed):**
${F}text
DEBUG SQL - select o.id, o.status, o.total from orders o
DEBUG SQL - select i.id, i.name, i.price from items i where i.order_id=1
DEBUG SQL - select i.id, i.name, i.price from items i where i.order_id=2
DEBUG SQL - select i.id, i.name, i.price from items i where i.order_id=3
... (97 more lines)
DEBUG Statistics - Session Metrics: 101 queries executed in 4230ms
${F}
**What this means (simple):** You can literally count the lines. If you see the same SQL repeated with different IDs — that's N+1. The Hibernate Statistics line at the end shows exactly how many queries ran.

## Step 2: Fix with JOIN FETCH — one query for everything

${F}java
// Repository — add a JOIN FETCH query
public interface OrderRepository extends JpaRepository<Order, Long> {

    // BAD: default findAll() — triggers N+1 lazy loads
    // List<Order> findAll();

    // GOOD: JOIN FETCH loads orders AND items in a single SQL JOIN
    @Query("SELECT DISTINCT o FROM Order o JOIN FETCH o.items")
    List<Order> findAllWithItems();
}
${F}

**What you see in logs after fix (1 query):**
${F}text
DEBUG SQL - select distinct o.id, o.status, o.total, i.id, i.name, i.price
            from orders o
            inner join items i on i.order_id = o.id
DEBUG Statistics - Session Metrics: 1 query executed in 45ms
${F}
**What this means (simple):** One SQL JOIN brings everything back at once. 4230ms → 45ms. The database does one read instead of 101.

## Step 3: Fix with @EntityGraph — cleaner than @Query for simple cases

${F}java
public interface OrderRepository extends JpaRepository<Order, Long> {

    // @EntityGraph tells Spring Data which associations to eagerly load
    // without writing raw JPQL — cleaner for simple cases
    @EntityGraph(attributePaths = {"items", "items.product"})
    List<Order> findByStatus(String status);
    // Generates: SELECT o, i, p FROM Order o
    //            LEFT JOIN FETCH o.items i
    //            LEFT JOIN FETCH i.product p
    //            WHERE o.status = ?
}
${F}

${F}java
// Or define the graph on the entity:
@Entity
@NamedEntityGraph(
    name = "Order.withItems",
    attributeNodes = @NamedAttributeNode("items")
)
public class Order { ... }

// Use it in repository:
@EntityGraph("Order.withItems")
List<Order> findAll();
${F}

## Step 4: Fix with @BatchSize — for cases where JOIN FETCH isn't suitable

${F}java
// @BatchSize loads related entities in batches of N instead of one-by-one
// Useful when JOIN FETCH would cause Cartesian product issues (multiple collections)

@Entity
public class Order {

    @OneToMany(fetch = FetchType.LAZY)
    @BatchSize(size = 50)  // load items for 50 orders at once, not 1 at a time
    private List<Item> items;

    @OneToMany(fetch = FetchType.LAZY)
    @BatchSize(size = 50)
    private List<Payment> payments;
}
${F}

**What you see with @BatchSize(size=50) on 100 orders:**
${F}text
DEBUG SQL - select * from orders                              ← 1 query
DEBUG SQL - select * from items where order_id IN (?,?,?...) ← batch of 50 IDs
DEBUG SQL - select * from items where order_id IN (?,?,?...) ← batch of 50 IDs
Total: 3 queries instead of 101
${F}
**What this means (simple):** Instead of 100 individual queries (\`WHERE order_id = 1\`, \`WHERE order_id = 2\`...), Hibernate makes 2 IN queries (\`WHERE order_id IN (1, 2, ..., 50)\`). 101 queries becomes 3.

## Step 5: Detect N+1 in tests with Hypersistence Utils

${F}java
// Automatically fail the test if too many queries are executed
@Test
void testGetOrders_shouldUseOneQuery() {
    // Using hypersistence-utils library
    SQLStatementCountValidator.reset();

    orderService.getOrdersWithItems(); // the method under test

    assertSelectCount(1);  // fails if more than 1 SELECT was executed
    // assertSelectCount(3); // allow exactly 3 (for @BatchSize case)
}
${F}

**What you see when the test catches N+1:**
${F}text
org.junit.ComparisonFailure:
Expected: 1 SELECT statement(s)
Actual:   101 SELECT statement(s)
${F}

## Your interview answer
**Open:** "N+1 happens because Hibernate lazily loads collections — one extra query per entity. For 100 orders, that's 101 queries. I detect it by enabling SQL logging and counting repeated queries, or using Hibernate Statistics."
**Then:** "The fix depends on the case. JOIN FETCH (or @EntityGraph) loads everything in one SQL JOIN — best when you always need the related data. @BatchSize groups the lazy loads into IN queries — best when JOIN FETCH would cause Cartesian products with multiple collections."
**End:** "I'd also add a query count assertion in tests using Hypersistence Utils — fails the test automatically if the method makes more queries than expected. This prevents N+1 from sneaking back in future PRs."
`.trim(),

'th-sr-lazy-session': `
## 🔥 The situation
You load an Order entity in a service layer method. The transaction closes when the method returns. You access \`order.getItems()\` in the controller (or a template). Hibernate throws \`LazyInitializationException: could not initialize proxy — no Session\`. The entity is detached.

## 🧠 Why LazyInitializationException happens

${F}text
Hibernate Session lifecycle:

@Transactional method starts
   → Session opens
   → Entity loaded: Order with items=LAZY (not fetched yet)
   → Hibernate creates a PROXY for items — placeholder, not the real data

@Transactional method ends
   → Session closes
   → Entity is now DETACHED — no connection to the database

Later, in the controller:
   order.getItems()  ← tries to fetch from DB, but Session is CLOSED
   → LazyInitializationException!
${F}

**The full exception:**
${F}text
org.hibernate.LazyInitializationException:
  failed to lazily initialize a collection of role: com.example.Order.items,
  could not initialize proxy — no Session
    at org.hibernate.collection.internal.AbstractPersistentCollection.throwLazyInitializationException(...)
    at com.example.OrderController.getOrderDetails(OrderController.java:45)
${F}

## Step 1: Load what you need INSIDE the transaction

${F}java
// BAD: load entity in service, access lazy collection outside in controller
@Service
public class OrderService {
    @Transactional
    public Order getOrder(Long id) {
        return orderRepo.findById(id).orElseThrow(); // items not loaded — LAZY
    }
}

@RestController
public class OrderController {
    @GetMapping("/orders/{id}")
    public OrderResponse getOrder(@PathVariable Long id) {
        Order order = orderService.getOrder(id);
        order.getItems().size(); // ← LazyInitializationException! Session is closed.
    }
}

// GOOD: load with JOIN FETCH inside the transaction
@Service
public class OrderService {
    @Transactional
    public Order getOrderWithItems(Long id) {
        return orderRepo.findByIdWithItems(id); // JOIN FETCH items — all loaded in session
    }
}

public interface OrderRepository extends JpaRepository<Order, Long> {
    @Query("SELECT o FROM Order o JOIN FETCH o.items WHERE o.id = :id")
    Optional<Order> findByIdWithItems(@Param("id") Long id);
}
${F}

**What you see in logs (fix working — one query, no exception):**
${F}text
DEBUG SQL - select o.id, o.status, i.id, i.name
            from orders o inner join items i on i.order_id = o.id
            where o.id = 99
// All items loaded inside the transaction — no LazyInitializationException
${F}

## Step 2: Use DTOs — the cleanest approach

${F}java
// Project to a DTO inside the transaction — no entity leaves the service layer
@Service
public class OrderService {

    @Transactional(readOnly = true) // readOnly = no dirty checking overhead
    public OrderResponse getOrder(Long id) {
        Order order = orderRepo.findByIdWithItems(id);

        // Map to DTO inside transaction — entity never escapes the service layer
        return new OrderResponse(
            order.getId(),
            order.getStatus(),
            order.getItems().stream()           // safe — inside transaction, session open
                .map(item -> new ItemResponse(item.getId(), item.getName(), item.getPrice()))
                .toList()
        );
        // DTO contains only plain data — no Hibernate proxy, no session needed
    }
}

// Controller receives a plain DTO — can't trigger LazyInitializationException
@RestController
public class OrderController {
    @GetMapping("/orders/{id}")
    public OrderResponse getOrder(@PathVariable Long id) {
        return orderService.getOrder(id); // ← DTO, not entity
    }
}
${F}

**What this means (simple):** The entity stays inside the service layer — it's like nuclear material that needs to be processed before it can leave containment. The DTO is safe to pass around anywhere because it's just a plain Java object with no Hibernate magic.

## Step 3: What NOT to do — Open Session in View (OSIV)

${F}java
// OSIV: Spring Boot keeps the Hibernate Session open for the ENTIRE HTTP request
// (not just for the @Transactional method)
// application.yml:
// spring.jpa.open-in-view=true  ← Spring Boot default!

// With OSIV: LazyInitializationException never happens — BUT N+1 becomes invisible
// Controller accidentally triggers lazy loads → N+1 queries → slow responses
// You don't notice because it "just works"
${F}

**Disable OSIV and fix properly:**
${F}yaml
# application.yml
spring:
  jpa:
    open-in-view: false   # disable OSIV — forces proper loading in transactions
${F}

**What you see when OSIV is disabled and lazy load happens:**
${F}text
WARN  OpenEntityManagerInViewInterceptor - OpenEntityManagerInViewFilter not active
LazyInitializationException at OrderController.java:45
// This is good! It forces you to fix the root cause (load properly in transaction)
// instead of hiding it behind OSIV's session extension
${F}

## Your interview answer
**Open:** "LazyInitializationException means Hibernate tried to load a collection after the Hibernate Session was closed — typically when an entity loaded in a @Transactional service method is accessed outside that transaction in the controller."
**Then:** "The fix is to load everything you need inside the transaction using JOIN FETCH or @EntityGraph. Better yet, map to a DTO inside the service method — DTOs are plain objects with no Hibernate proxy, so they can be passed anywhere safely."
**End:** "I'd also disable Open Session in View (spring.jpa.open-in-view=false). OSIV makes LazyInitializationException disappear by keeping the session open for the whole HTTP request — but it hides N+1 problems. Disabling it forces proper loading strategies from the start."
`.trim(),

'th-sr-flush-order': `
## 🔥 The situation
You save an entity and then query for it in the same transaction. The query returns the OLD data — your save doesn't appear. Or you get a foreign key constraint violation even though you're creating the parent before the child. Hibernate's flush order is surprising you.

## 🧠 How Hibernate's Persistence Context works

${F}text
Hibernate doesn't write to the DB on every save() call.
It accumulates changes in the Persistence Context (first-level cache)
and writes them all at once during a FLUSH.

When does flush happen? (FlushMode.AUTO — the default)
  → Before executing a JPQL/HQL query (to ensure the query sees your changes)
  → Before transaction commit

When does flush NOT happen?
  → Before a native SQL query (Hibernate can't know if it needs flushing)
  → Manually with saveAndFlush() or entityManager.flush()
${F}

## Step 1: Scenario A — query after save, but query doesn't see the save

${F}java
// Problem: native SQL query doesn't trigger auto-flush
@Transactional
public void processDepartment(Long deptId) {
    Department dept = departmentRepo.findById(deptId).orElseThrow();
    dept.setName("Engineering");
    departmentRepo.save(dept); // change stored in Persistence Context, NOT in DB yet

    // JPQL query — Hibernate flushes before this → sees your change ✓
    List<Department> updated = departmentRepo.findByName("Engineering"); // works!

    // Native SQL query — Hibernate does NOT auto-flush before this → sees OLD data!
    List<Map<String, Object>> nativeResult = jdbcTemplate.queryForList(
        "SELECT * FROM departments WHERE name = 'Engineering'"
    );
    // nativeResult is EMPTY — DB still has old name
}
${F}

**Fix: force flush before native query**
${F}java
@Transactional
public void processDepartment(Long deptId) {
    Department dept = departmentRepo.findById(deptId).orElseThrow();
    dept.setName("Engineering");

    // Option A: saveAndFlush — flushes this entity immediately
    departmentRepo.saveAndFlush(dept); // NOW in the DB

    // Option B: entityManager.flush() — flushes everything in the Persistence Context
    entityManager.flush();

    // Now native query sees the change:
    List<Map<String, Object>> result = jdbcTemplate.queryForList(
        "SELECT * FROM departments WHERE name = 'Engineering'"
    );
    // result has 1 row ✓
}
${F}

**What you see in logs:**
${F}text
// Without saveAndFlush:
DEBUG SQL - update departments set name=? where id=?   ← appears AFTER the native query!
DEBUG Native - SELECT * FROM departments WHERE name='Engineering' → 0 rows (stale read)

// With saveAndFlush:
DEBUG SQL - update departments set name=? where id=?   ← flushed immediately!
DEBUG Native - SELECT * FROM departments WHERE name='Engineering' → 1 row ✓
${F}

## Step 2: Scenario B — constraint violation because flush happens in wrong order

${F}java
// Problem: saving child before parent causes FK violation IF Hibernate flushes in wrong order
@Transactional
public void createDepartmentWithEmployees() {
    Employee emp = new Employee("Alice");
    employeeRepo.save(emp); // Hibernate queues this INSERT

    Department dept = new Department("Engineering");
    dept.addEmployee(emp); // emp.department_id = dept.id (dept not saved yet!)
    departmentRepo.save(dept); // Hibernate queues this INSERT

    // When flush happens: Hibernate may insert Employee FIRST (emp has no dept_id yet)
    // → FK constraint on employees.department_id → violation!
}
${F}

**Fix A: use CascadeType.PERSIST — let Hibernate manage the order**
${F}java
@Entity
public class Department {
    @OneToMany(cascade = CascadeType.PERSIST, mappedBy = "department")
    private List<Employee> employees = new ArrayList<>();

    public void addEmployee(Employee emp) {
        emp.setDepartment(this);
        this.employees.add(emp);
    }
}

@Transactional
public void createDepartmentWithEmployees() {
    Department dept = new Department("Engineering");
    dept.addEmployee(new Employee("Alice")); // set up relationship BEFORE saving
    dept.addEmployee(new Employee("Bob"));

    departmentRepo.save(dept); // Hibernate inserts Department FIRST, then Employees
    // Hibernate knows the dependency order from the mapping — no FK violation
}
${F}

**Fix B: flush explicitly at the right moment**
${F}java
@Transactional
public void createDepartmentWithEmployees() {
    Department dept = new Department("Engineering");
    departmentRepo.saveAndFlush(dept); // Department INSERT committed to DB NOW

    Employee emp = new Employee("Alice");
    emp.setDepartment(dept); // dept.id is now set (flushed)
    employeeRepo.save(emp); // Employee INSERT — dept_id is valid FK
}
${F}

**What you see in logs:**
${F}text
// Without proper order — FK violation:
DEBUG SQL - insert into employees (name, department_id) values (?, NULL)  ← no dept yet!
ERROR Hibernate - ERROR: insert or update on table "employees" violates
                 foreign key constraint "fk_employees_department"
                 Detail: Key (department_id)=(null) is not present in table "departments".

// With saveAndFlush:
DEBUG SQL - insert into departments (name) values (?)     ← dept saved first
DEBUG SQL - insert into employees (name, department_id) values (?, 1)  ← FK valid ✓
${F}

## Step 3: Flush modes explained

${F}java
// Change flush mode when needed:
@PersistenceContext
private EntityManager em;

// Manual flush — you control when writes go to DB
em.setFlushMode(FlushModeType.COMMIT);
// Now Hibernate ONLY flushes on transaction commit
// Use for bulk imports where you don't want flush on every query

@Transactional
public void bulkImport(List<ProductData> data) {
    em.setFlushMode(FlushModeType.COMMIT); // no mid-batch flushes

    for (int i = 0; i < data.size(); i++) {
        productRepo.save(new Product(data.get(i)));

        if (i % 500 == 0) {
            em.flush();         // manual flush every 500 rows
            em.clear();         // clear PC to free memory (avoid OutOfMemory on large batches)
        }
    }
    // Final commit flushes remaining
}
${F}

## Your interview answer
**Open:** "Hibernate's Persistence Context buffers changes and only flushes to the database before JPQL queries (auto-flush) and at commit. This surprises developers when a native SQL query runs after a save and doesn't see the change — because native queries don't trigger auto-flush."
**Then:** "The fix is saveAndFlush() to force an immediate write, or entityManager.flush() to flush the entire context. For ordering issues — child saved before parent — the cleaner fix is CascadeType.PERSIST with the relationship set up before saving, so Hibernate can figure out the correct INSERT order itself."
**End:** "For bulk imports, I'd set FlushMode to COMMIT and manually call flush()+clear() every 500 rows. This prevents the Persistence Context from growing huge in memory while also controlling when DB writes happen."
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
