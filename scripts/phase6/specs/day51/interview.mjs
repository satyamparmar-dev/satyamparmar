export default {
  "conceptual": [
    {
      "question": "What is a bounded context in DDD, and why is it more important than package naming?",
      "answer": "A **bounded context** is a line around a part of the business where **words and rules stay consistent**. Package names alone do not stop teams from sharing one database or calling each other’s tables. In production, the real question is **who owns the data** and **who can deploy alone**. Interviewers want you to talk about **contracts** (APIs, events) and **ownership**, not folder trees."
    },
    {
      "question": "What is ubiquitous language, and how does it prevent production bugs?",
      "answer": "**Ubiquitous language** means developers and business experts use the **same words** for the same ideas, in code, APIs, and UI. When words drift, two services can both use `total` but mean **different things** — local tests still pass, but month-end reports disagree. A small **glossary** and **contract tests** on important fields catch drift before customers do."
    },
    {
      "question": "What is an aggregate root, and why should other aggregates reference it by id?",
      "answer": "The **aggregate root** is the **only supported way** to change a cluster of objects so **rules cannot be skipped**. Other aggregates should point with **ids** so you do not accidentally load giant graphs or pretend two services share one database transaction. In Spring, deep JPA links across areas often hide **coupling** — explicit ports and queries keep boundaries clear."
    },
    {
      "question": "What is a domain event, and when should you publish it versus calling another service synchronously?",
      "answer": "A **domain event** records **something that already happened** (`OrderPlaced`). Use **messages** when the next step can happen **a moment later** and you want **looser coupling**. Use **sync HTTP** when the user or the next step **must know the answer now** — but always add **timeouts** and failure handling. To avoid “saved in DB but message lost,” many teams use a **transactional outbox** in the same database transaction as the save."
    },
    {
      "question": "Explain the anti-corruption layer (ACL) with a concrete integration example.",
      "answer": "An **anti-corruption layer** is a **translator** at the edge of your system. Example: a legacy CRM sends `cust_status=GOLD`. Your app maps that to `LoyaltyTier.PREMIUM` with clear rules. Without a translator, foreign field names leak into your core code and **every vendor change** breaks your service. The ACL keeps your **core language** clean."
    },
    {
      "question": "What is a context map, and name two relationship types you would use in an interview.",
      "answer": "A **context map** is a simple picture of **business areas** and **how they depend on each other**. Two common names: **Customer–Supplier** (downstream can ask upstream for changes) and **Anti-corruption layer** (downstream translates a foreign model). Saying “we call REST” is not enough — say **who leads the model** and **how translation happens**."
    },
    {
      "question": "How does DDD relate to microservices — mandatory, optional, or orthogonal?",
      "answer": "They are **related but not the same**. **DDD** helps you **draw good boundaries** and **name things well**. **Microservices** are **how you deploy**. You can use DDD inside **one modular app** (often smart early). You can split microservices **without** DDD and get a messy distributed system. Strong answers pick microservices when **independence** is worth the **extra ops work**."
    },
    {
      "question": "What is the difference between an entity and a value object?",
      "answer": "An **entity** has **identity** that stays the same even when fields change (`Customer`, `Order`). A **value object** is a **small immutable bundle** of data (`Money`, `Address`) compared by value. Mixing them causes bugs like sharing one `Money` object and mutating it from two places. Java **records** often fit value objects well."
    },
    {
      "question": "What is a repository in DDD, and what should not be inside it?",
      "answer": "A **repository** **loads and saves aggregates** and hides SQL or JPA details. It should **not** own core business decisions like “should we refund?” — those belong in the **domain model**. If repositories grow huge if-else blocks, you likely slid back to a **transaction script** style."
    },
    {
      "question": "What is a domain service versus an application service?",
      "answer": "A **domain service** holds a rule that does not fit one entity cleanly (for example, moving value between two accounts with joint rules). An **application service** is the **thin coordinator** for a use case: load aggregates, call domain code, save, publish integration messages. It should not become a **god class** with every rule inside."
    },
    {
      "question": "Why is 'anemic domain model' criticized, and when might it still be acceptable?",
      "answer": "**Anemic domain model** means entities are mostly getters/setters and all logic sits in services — it often becomes hard-to-follow procedural code. For **simple CRUD** with almost no rules, that can be fine. For **money, risk, or compliance**, you usually want **richer domain objects** so rules stay in one obvious place."
    },
    {
      "question": "How do you handle cross-aggregate workflows without a distributed transaction?",
      "answer": "Finish **one commit**, then **tell others with an event** (often via **outbox**). The next step runs in **another transaction**. Long flows use **sagas**: forward steps plus **undo steps** when something fails. In Java services, test that **duplicate messages** do not break the flow — because message systems usually deliver **at least once**."
    },
    {
      "question": "What is strategic design versus tactical design in DDD?",
      "answer": "**Strategic** work answers **where the lines are** between business areas and teams (context map, workshops). **Tactical** work answers **how to code** inside one area (aggregates, events, repositories). Mixing them up gives either perfect diagrams with **messy code**, or pretty low-level code in the **wrong boundaries**."
    },
    {
      "question": "What is Conway’s Law, and how does it affect microservice decomposition?",
      "answer": "**Conway’s Law** says software structure tends to match **how people communicate**. If communication is messy, boundaries will be messy too. Good splits align **service ownership** with **real teams**. Some teams also cite **Team Topologies** for platform vs stream-aligned teams — same idea in modern words."
    },
    {
      "question": "Where does CQRS fit relative to DDD and microservices?",
      "answer": "**CQRS** means **separate models for reads and writes** when reads are heavy or very different from writes. DDD does **not** require it. In microservices, you often see **read databases** or **search indexes** filled from **events** or **CDC**. **Trade-off:** reads may be **slightly stale** — measure lag and agree with product what is acceptable."
    },
    {
      "question": "What is a **bounded context** in DDD, and why does it matter for microservices?",
      "answer": "A bounded context is a **linguistic and model boundary** where terms have one consistent meaning. Aligning one service per context reduces ambiguous shared models. **Anti-pattern**: one giant “Customer” entity shared everywhere — contexts should exchange DTOs or events, not one shared table model."
    },
    {
      "question": "When is **two services** worse than **one modular monolith**?",
      "answer": "When teams, deployment cadence, and data ownership are not independent — distributed boundaries add **network, consistency, and ops** cost without autonomy benefits. Start modular inside one deployable unit; extract when **SLO, scale, or org** boundaries justify the split."
    }
  ],
  "codeBased": [
    {
      "question": "Show Spring-style module boundaries preventing cross-context entity imports (conceptual).",
      "answer": "// orders/domain module: only domain code\n// orders/infrastructure: JPA implements OrderRepository\n//\n// ArchUnit rule (idea):\n// no classes in ..orders.domain.. may depend on ..catalog.domain..\n//\n// CI fails if someone @Autowired a Catalog entity into Orders code.\n// This turns \"please do not couple\" into a build error."
    },
    {
      "question": "Show a port interface for inventory and an adapter sketch in Spring.",
      "answer": "// domain/InventoryPort.java\n// public interface InventoryPort {\n//     boolean reserve(String sku, int qty);\n// }\n//\n// infra/InventoryRestAdapter.java\n// @Component\n// class InventoryRestAdapter implements InventoryPort {\n//     private final WebClient client;\n//     public boolean reserve(String sku, int qty) {\n//         return client.post()\n//             .uri(\"/internal/inventory/reserve\")\n//             .bodyValue(new ReserveRequest(sku, qty))\n//             .retrieve()\n//             .bodyToMono(ReserveResponse.class)\n//             .block(Duration.ofMillis(200));\n//     }\n// }\n//\n// Put timeouts and circuit breakers here — not inside pure domain math."
    },
    {
      "question": "Show transactional outbox insert alongside aggregate save (pseudocode comments).",
      "answer": "// @Transactional\n// public void placeOrder(PlaceOrderCommand cmd) {\n//     Order order = ... build and validate ...\n//     orderRepository.save(order);\n//     for (DomainEvent e : order.pullDomainEvents()) {\n//         outboxRepository.insert(new OutboxRecord(e.type(), e.payloadJson()));\n//     }\n// }\n// A small worker reads outbox and publishes to Kafka, then marks rows sent.\n// Same DB transaction => no \"saved order but no message\" gap."
    },
    {
      "question": "Show idempotent consumer handling for PaymentCaptured events in Spring Kafka style (comments).",
      "answer": "// @KafkaListener(topics = \"payments\")\n// void onCaptured(@Payload PaymentCaptured evt) {\n//     String dedup = evt.orderId() + \":\" + evt.processorRef();\n//     if (processedRepository.existsById(dedup)) return;\n//     ledgerService.applyCapture(evt);\n//     processedRepository.save(new ProcessedKey(dedup));\n// }\n//\n// Add a unique DB constraint on dedup. Count how often duplicates arrive — should be normal."
    },
    {
      "question": "Show ACL translating a legacy DTO into a domain object (comments).",
      "answer": "// LegacyCrmCustomer dto = crmClient.fetch(id);\n// Customer customer = new Customer(\n//     new CustomerId(dto.getLegacyId()),\n//     mapTier(dto.getStatusCode()),\n//     new Email(dto.getContactEmail())\n// );\n// private static LoyaltyTier mapTier(String code) {\n//     return switch (code) {\n//         case \"GOLD\" -> LoyaltyTier.PREMIUM;\n//         case \"SILVER\" -> LoyaltyTier.STANDARD;\n//         default -> LoyaltyTier.BASIC;\n//     };\n// }\n//\n// Core Customer type never exposes raw CRM field names."
    },
    {
      "question": "Show aggregate-friendly REST resource for order commands (comments).",
      "answer": "// @PostMapping(\"/orders\")\n// ResponseEntity<Void> create(@Valid @RequestBody CreateOrderRequest req) {\n//     String id = orderApplicationService.openDraft(req.customerId());\n//     return ResponseEntity.created(URI.create(\"/orders/\" + id)).build();\n// }\n//\n// @PostMapping(\"/orders/{id}/submit\")\n// OrderResponse submit(@PathVariable String id) {\n//     return orderApplicationService.submit(id);\n// }\n//\n// URLs follow the order lifecycle — not dozens of tiny internal entity endpoints."
    },
    {
      "question": "Show a domain event as a Java record and handler registration (comments).",
      "answer": "// public record OrderPlaced(String orderId, int totalMinor, Instant at) {}\n//\n// Inside OrderAggregate after a successful submit:\n// recordThat(new OrderPlaced(this.id, this.totalMinor, clock.instant()));\n//\n// Application service drains pending events to outbox or bus:\n// for (DomainEvent e : order.pullDomainEvents()) { outbox.save(e); }\n//\n// Records are immutable — good match for \"something happened\" facts."
    },
    {
      "question": "Show @Transactional read model update for a projector (comments).",
      "answer": "// @Component\n// class OrderSummaryProjector {\n//   @Transactional\n//   @KafkaListener(topics = \"orders\")\n//   void on(OrderPlaced e) {\n//     if (summaryDao.existsById(e.orderId())) return;\n//     summaryDao.insert(new OrderSummaryRow(e.orderId(), e.totalMinor(), e.at()));\n//   }\n// }\n//\n// Fast read table for the UI; canonical order still lives in Orders service."
    },
    {
      "question": "Show Spring Validation at boundary vs domain invariants (comments).",
      "answer": "// @Valid on REST DTO: required fields, basic types (@NotNull, @Positive)\n//\n// Inside OrderAggregate.addLine:\n// if (catalogPolicy.isProhibited(sku)) throw new DomainRuleException(\"banned sku\");\n//\n// Edge checks shape; domain enforces real business rules."
    },
    {
      "question": "Show configuration for resilience on cross-context client (comments).",
      "answer": "// inventoryWebClient.post()\n//   .uri(...)\n//   .retrieve()\n//   .bodyToMono(Boolean.class)\n//   .timeout(Duration.ofMillis(150))\n//   .transformDeferred(CircuitBreakerOperator.of(inventoryCb));\n//\n// If inventory is sick, fail fast with a clear business error — do not block threads forever."
    },
    {
      "question": "How does **aggregate root** rule affect what you expose on a REST resource?",
      "answer": "External updates should target the **aggregate root** URI; nested entities mutate **through** the root to enforce invariants. Exposing direct CRUD on every child table invites invariant violations. Document commands as sub-resources or domain actions when needed."
    },
    {
      "question": "Name a **domain event** you might publish when an order is **paid**, and one consumer.",
      "answer": "Event: `OrderPaid` with order id, amount, timestamp. Consumer: **shipping** service reserves courier, **analytics** updates funnel metrics, **search** projection updates status. Keep payload minimal and versioned; avoid leaking internal entity graphs."
    }
  ],
  "seniorScenario": [
    {
      "question": "Teams split into microservices but still share one Postgres schema. Deployments are coupled and incidents require three on-call rotations. What do you do?",
      "answer": "**(1) Immediate response:** Slow down changes that make coupling worse. Agree **one owner** for each table or start a **short freeze** on cross-team schema edits until there is a plan. **(2) Root cause:** Services are split on paper, but **one database** means **one big system** with network glue. Releases and rollbacks still touch the same tables. **(3) Fix:** Pick the **clearest business boundary** and move toward **separate data** step by step: stricter APIs, **read copies**, **events**, and an **anti-corruption** translator at the edge. Add **module rules** (ArchUnit) inside Java so illegal imports fail in CI. **(4) Prevention:** Write short **ADRs** per integration, add **contract tests**, and track metrics when two teams collide on migrations. The goal is **real ownership**, not more repos."
    },
    {
      "question": "Finance reports mismatched totals after introducing a Pricing microservice. How do you investigate and resolve?",
      "answer": "**(1) Immediate response:** Stop risky deploys, open a channel, and run a **reconciliation** between stored order amounts and invoice lines. **(2) Root cause:** Two areas both “own” **tax or rounding** with small differences. Each team tested alone, so the bug hid until real money moved. **(3) Fix:** Choose **one upstream owner** for pricing/tax rules, **version** the policy, and store **frozen line amounts** on submit. Add **consumer contract tests** on money fields. **(4) Prevention:** Keep a **glossary** for money words, dashboard **max daily drift**, and **feature flags** for policy changes. This is a **language and ownership** fix, not only “use BigDecimal.”"
    },
    {
      "question": "Kafka consumers sometimes double-credit loyalty points on redelivery. Your handler logs look idempotent — but duplicates persist. What happened?",
      "answer": "**(1) Immediate response:** If money is involved, **pause payouts** or use a flag, then fix dedup before large replays. **(2) Root cause:** Kafka may deliver **more than once**. Idempotency that lives **only in memory**, or **ack before the database commit**, means a retry can **run the business logic twice**. **(3) Fix:** Use a **stable business key** in a **database unique constraint**, update ledger and mark processed in **one transaction**, then ack. Prefer **outbox** from the writer service so publishing matches the DB commit. **(4) Prevention:** Chaos-style tests with **forced duplicates**, metrics counting **ignored duplicates**, and alerts on **dead-letter** growth. Model the rule **credit once per order** inside the domain, not only in logs."
    },
    {
      "question": "Product demands a synchronous 12-service chain to render a dashboard. Latency SLO is missed weekly. Your proposal?",
      "answer": "**(1) Immediate response:** Add **timeouts** and **resource limits** so one slow service cannot stall everything; cache stable pieces. **(2) Root cause:** The dashboard is really a **read problem**, but it was built as a **live chain of writes services**. Boundaries were ignored for speed of feature work. **(3) Fix:** Build a **read model** (materialized view or search index) updated by **events** or **CDC**, optionally behind a **BFF** for the UI. Accept **small staleness** and show it honestly. **(4) Prevention:** **SLO per hop**, design review for deep chains, and platform help for **standard projection** patterns. CQRS here is a **tool**, not a religion — use it where reads hurt."
    },
    {
      "question": "A startup with 6 engineers wants microservices 'for scalability.' How do you steer the conversation?",
      "answer": "**(1) Immediate response:** Agree on the **real goal** (speed, hiring, compliance) without assuming microservices are the only path. **(2) Root cause:** Microservices add **deploy pipelines, monitoring, and failure modes** early. A tiny team often pays that cost before they get product clarity. **(3) Fix:** Use **one app with clear modules** and **strict import rules**, measure traffic and pain, then extract **one** service when data proves it (scale, compliance, or release conflict). **(4) Prevention:** Simple **decision records** before new services, and **templates** for tracing and auth when services appear. Pragmatic DDD beats **resume-driven** splitting."
    },
    {
      "question": "Legacy ERP forces ugly data shapes into your clean domain. Teams start copying ERP columns into core entities. How do you stop the bleed?",
      "answer": "**(1) Immediate response:** Stop new **ERP field copy-paste** into core models; route changes through a **translator** layer. **(2) Root cause:** Shortcuts feel faster until every ERP upgrade **breaks production** because your core model is secretly their model. **(3) Fix:** A focused **integration module or service** maps ERP rows to **your types**, with tests and versioned mappings; use **flags** for risky mapping changes. **(4) Prevention:** Mark ERP as **upstream** on the context map, test adapters in CI, and never use ERP tables as your core **`@Entity`** graph. Keep **your words** inside, **their words** outside."
    }
  ],
  "wrongAnswers": [
    "DDD requires microservices — Wrong: DDD is about modeling; many teams use it inside one modular application.",
    "One microservice per database table — Wrong: that creates tiny chatty services; split by business area and team ownership instead.",
    "Make aggregates as big as possible for strong consistency — Wrong: huge aggregates hurt performance; cross-area consistency is usually eventual with events.",
    "Domain events must use Kafka — Wrong: events are an idea; delivery can be outbox, queue, log, or even sync while you are small.",
    "Repositories should hold core business rules — Wrong: rules belong in the domain model; repositories should mostly load and save.",
    "Anti-corruption layer means blocking external data — Wrong: it **translates** data into your model; it still accepts valid input.",
    "Retry every REST call blindly — Wrong: retries on non-idempotent work duplicate side effects; use keys, sagas, and clear policies.",
    "Same database but separate deploys equals microservices — Wrong: shared schema usually means a distributed monolith with extra pain."
  ]
};
