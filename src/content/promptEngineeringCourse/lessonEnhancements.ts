// Prompt Engineering Course — Lesson Enhancements
// Real-world scenarios, filled-in templates, and copy-paste prompts for every lesson.

import type { CourseLesson, CourseSection } from './courseData';

type EnhancementSection = Omit<CourseSection, never>;

export const PE_LESSON_ENHANCEMENTS: Record<string, EnhancementSection[]> = {

  // ─── PHASE 1 LESSON 1 ──────────────────────────────────────────────────────
  'pe-p1-l1': [
    {
      id: 'pe-p1-l1-industry',
      type: 'concept',
      title: 'What Java Developers at Real Companies Prompt For',
      content: `Here is what prompt engineering actually looks like across different Java developer roles and industries. These are real tasks, not toy examples.

**Fresher Java Developer (0–1 year)**

| Task | What they prompt for daily |
|---|---|
| Learning | "Explain Spring Boot @Transactional with a real example" |
| Debugging | Paste NPE stack trace, ask for root cause |
| Boilerplate | "Write a Spring Data JPA repository for my User entity" |
| Understanding | "What is the difference between @RestController and @Controller?" |

**Mid-level Developer (2–4 years)**

| Task | What they prompt for daily |
|---|---|
| Code review prep | Generate review checklist for their own PR before submitting |
| Refactoring | "Refactor this legacy service to use Java records and streams" |
| Test writing | Generate JUnit 5 + Mockito tests for a service class |
| Technical design | "Compare RestTemplate vs WebClient for our Spring Boot 3 app" |

**Senior Developer (5+ years)**

| Task | What they prompt for daily |
|---|---|
| Architecture | "Design a Saga pattern for our distributed payment transaction" |
| Performance | "Analyze this Hibernate query for N+1 problems and fix it" |
| Code migration | "Migrate this Java 8 forEach to Java 21 streams with collectors" |
| Incident response | Paste exception + context, ask for root cause + prevention |

**Team Lead / Architect**

| Task | What they prompt for daily |
|---|---|
| System design docs | Generate ADR for switching from monolith to microservices |
| PR descriptions | Auto-generate from git diff |
| Onboarding docs | "Write an onboarding guide for a new developer joining our Kafka pipeline team" |
| Interview questions | "Write 5 technical interview questions for a senior Spring Boot developer" |

---

**Three real enterprise stories:**

**Story 1 — Banking (HDFC / SBI-style backend)**
A backend Java developer at a payments company gets a production alert: transaction processing latency spiked 10x. They paste the Micrometer metrics, HikariCP connection pool stats, and the service code into a CoT prompt. In 45 seconds they have the root cause: a missing \`@Transactional(readOnly = true)\` annotation causing Hibernate to acquire write locks unnecessarily.

**Story 2 — E-commerce (Flipkart/Amazon-style)**
A developer needs to add a product recommendation API. Instead of writing 200 lines of boilerplate, they prompt: "Write a Spring Boot 3.2 REST endpoint that accepts a productId, calls a recommendation engine at \`http://reco-service/recommend\` with a WebClient, maps the response to a \`RecommendationResponse\` record, and handles timeout with a fallback empty list." Full working code in 30 seconds.

**Story 3 — Healthcare (Hospital Management System)**
A developer is writing intake form processing. GDPR requires that patient data never leaves the company. They use a locally-hosted LLM and craft prompts that extract structured fields (name, DOB, symptoms) from free-text intake forms — returning JSON that feeds into their Spring Batch pipeline. Zero human data entry.`,
    },
    {
      id: 'pe-p1-l1-template-gallery',
      type: 'task',
      title: 'Copy-Paste Starter Kit — 5 Prompts for Your First Week',
      content: `Use these exactly as-is. They are calibrated for Java developers starting out with AI tools.

**Prompt 1 — Explain any Java concept**
\`\`\`
You are a senior Java developer explaining concepts to a junior developer.

Explain [CONCEPT] in plain English.
Then show a realistic Spring Boot example (not "Hello World" — use an Order or User scenario).
Then tell me one common mistake developers make with this concept and how to avoid it.

Format: 3 sections — explanation, code example, common mistake.
\`\`\`
→ Replace [CONCEPT] with: @Transactional, Optional, Stream.collect(), CompletableFuture, etc.

---

**Prompt 2 — Debug any exception**
\`\`\`
You are a senior Spring Boot developer debugging production issues.

I have this exception in my [SERVICE_NAME]:

[PASTE FULL STACK TRACE HERE]

Relevant code (line mentioned in stack trace):
[PASTE CODE HERE]

Tell me:
1. Root cause in one sentence
2. Why it happens (explain the mechanism)
3. The fix (show the code change)
4. How to prevent this class of error in the future
\`\`\`

---

**Prompt 3 — Write a unit test**
\`\`\`
You are a Java testing expert using JUnit 5 and Mockito.

Write unit tests for this method. Class: [CLASS_NAME].

[PASTE METHOD HERE]

Rules:
- Use @ExtendWith(MockitoExtension.class)
- One @Test per scenario. Use given/when/then comments.
- Cover: success case, null/empty inputs, and exception thrown
- Method names: should_[expected]_when_[condition]
\`\`\`

---

**Prompt 4 — Generate Javadoc**
\`\`\`
You are a technical writer for Java enterprise APIs.

Write complete Javadoc for this method:
[PASTE METHOD SIGNATURE AND BODY]

Include: one-line summary, @param for each parameter, @return, @throws for each exception, @code usage example.
Audience: another Java developer who hasn't read this class.
\`\`\`

---

**Prompt 5 — Review your own code before committing**
\`\`\`
You are a senior Java code reviewer. I am about to commit this code.

Stack: Spring Boot 3.2, Java 21, PostgreSQL.
Feature: [WHAT THIS CODE DOES]

[PASTE YOUR CODE]

Before I commit, tell me:
1. Any bugs or logic errors (be blunt)
2. Security risks (even small ones)
3. Performance issues I might not have noticed
4. One improvement to make the code cleaner

Max 10 points total. Prioritize Critical > Major > Minor.
\`\`\``,
    },
  ],

  // ─── PHASE 1 LESSON 2 ──────────────────────────────────────────────────────
  'pe-p1-l2': [
    {
      id: 'pe-p1-l2-filled-examples',
      type: 'concept',
      title: 'RCTFC Filled In — 3 Real Scenarios Side by Side',
      content: `The best way to learn RCTFC is to see it fully filled in for tasks you actually do. Here are 3 complete examples.

---

**Scenario A: Spring Boot to Kafka Migration Decision**

\`\`\`
[R] You are a senior Java architect who has migrated 10+ Spring Boot
    applications to event-driven architectures using Apache Kafka.

[C] We have a Spring Boot 3.2 monolith serving an e-commerce platform.
    Current stack: Spring Boot, Spring Data JPA, PostgreSQL.
    We want to add real-time order status updates to a mobile app.
    Our team has 3 developers. None have used Kafka before.
    Expected message volume: 5,000 order updates/day initially, 50,000 in 6 months.

[T] Compare two approaches for delivering real-time order updates:
    A) Server-Sent Events (SSE) from our existing Spring Boot app
    B) Apache Kafka + Spring Kafka consumer pushing to SSE

[F] A comparison table with columns: Complexity, Ops overhead,
    Learning curve, Scalability, When to choose.
    Then a recommendation with 3 bullet-point reasons.

[C] Assume we do not have DevOps capacity to run Kafka ourselves (use Confluent Cloud).
    Team must be able to implement the chosen approach in 2 sprints.
    Cost sensitivity is medium — not free, not enterprise budget.
\`\`\`

---

**Scenario B: Hibernate N+1 Query Fix**

\`\`\`
[R] You are a Java performance engineer specialising in Hibernate and JPA optimisation.

[C] Spring Boot 3.2, Hibernate 6, PostgreSQL.
    This is a product listing page in an e-commerce app.
    The page loads 20 products with their categories and prices.
    Page load time: 4.2 seconds (SLA is 500ms).
    Database query count per page load: 41 (I ran Hibernate Statistics).

[T] Diagnose the N+1 query problem in this repository and service code,
    and rewrite it to load all data in 1–2 queries:

\`\`\`java
// ProductRepository.java
List<Product> findByActiveTrue();

// ProductService.java
public List<ProductDto> getActiveProducts() {
    return productRepo.findByActiveTrue().stream()
        .map(p -> new ProductDto(p.getName(), p.getCategory().getName(), p.getPrice()))
        .toList();
}
\`\`\`

[F] Show:
    1. Why 41 queries are happening (explain N+1 clearly)
    2. The fixed repository method using @EntityGraph or JOIN FETCH
    3. The Hibernate Statistics output BEFORE vs AFTER the fix
    4. A rule of thumb for when to use @EntityGraph vs JOIN FETCH

[C] Java 21 idioms. Use Spring Data JPA, not EntityManager directly.
    The Product entity has a ManyToOne to Category.
    Do not suggest native SQL queries.
\`\`\`

---

**Scenario C: API Contract Design Review**

\`\`\`
[R] You are a senior API designer with REST and Spring Boot expertise.
    You think in terms of client developer experience first.

[C] We are building a payment processing API for merchant partners.
    Merchants are external Java developers who will consume this API.
    This is a public-facing REST API (not internal).
    It will handle transaction creation, status lookup, and refunds.

[T] Review this proposed endpoint design and tell me what is wrong with it
    from a REST API design perspective:

\`\`\`
POST /api/doPayment
Body: { "from": "ACC001", "to": "ACC002", "amount": 500, "curr": "INR", "flag": 1 }
Response: { "res": "ok", "txnId": "TXN123", "err": null }
\`\`\`

[F] For each issue:
    - What the problem is
    - Why it matters to API consumers
    - The corrected version

    Then: show the corrected endpoint design with proper HTTP method,
    URL, request body field names, and response structure.

[C] RESTful conventions. Standard HTTP status codes.
    Error response must include both a machine-readable code and a human message.
    Field names: snake_case (we use Jackson with snake_case config).
\`\`\``,
    },
    {
      id: 'pe-p1-l2-builder',
      type: 'task',
      title: 'Build Your RCTFC in 5 Minutes — Fill-in Template',
      content: `Use this worksheet every time you start a new prompt. Fill in all 5 boxes before you type anything to an AI.

\`\`\`
┌────────────────────────────────────────────────────────────┐
│  RCTFC PROMPT BUILDER                                       │
├────────────────────────────────────────────────────────────┤
│  R — ROLE                                                   │
│  Who should answer this? Be specific about:                 │
│  • Domain (Spring Boot / Kafka / Security / Database...)    │
│  • Level (senior / architect / specialist...)               │
│  • Industry context if needed (fintech / healthcare...)     │
│                                                             │
│  "You are a ________________________________"               │
│                                                             │
├────────────────────────────────────────────────────────────┤
│  C — CONTEXT                                                │
│  What background does the AI need?                          │
│  • Your tech stack (versions matter!)                       │
│  • What the code/feature does                               │
│  • Any relevant constraints or history                      │
│  • Paste code, stack trace, or error here                   │
│                                                             │
├────────────────────────────────────────────────────────────┤
│  T — TASK                                                   │
│  What exactly should be done? Use an action verb:           │
│  Review / Generate / Explain / Fix / Compare / Refactor     │
│  Design / Migrate / Analyse / Write / Optimize              │
│                                                             │
│  "[ACTION VERB] ___________________________________"        │
│                                                             │
├────────────────────────────────────────────────────────────┤
│  F — FORMAT                                                 │
│  How should the output look?                                │
│  • Structure (numbered list / table / code + explanation)   │
│  • Length (max X words / lines / issues)                    │
│  • Sections (header names to use)                           │
│                                                             │
├────────────────────────────────────────────────────────────┤
│  C — CONSTRAINTS                                            │
│  What limits apply?                                         │
│  • Java version / framework version                         │
│  • Libraries to use or avoid                                │
│  • What NOT to change (preserve public API / tests / etc.)  │
│  • "If you don't know, say so" (anti-hallucination)         │
│                                                             │
└────────────────────────────────────────────────────────────┘
\`\`\`

**Practice: fill this in for a task you have today**

Pick one of these real tasks and complete the RCTFC worksheet:
1. A piece of code in your repo that needs a unit test
2. An exception you saw in the logs this week
3. A feature you are about to implement
4. A PR you are about to review

The 5 minutes you spend filling this in saves 20 minutes of back-and-forth follow-up prompts.`,
    },
  ],

  // ─── PHASE 1 LESSON 3 ──────────────────────────────────────────────────────
  'pe-p1-l3': [
    {
      id: 'pe-p1-l3-industry-scenarios',
      type: 'concept',
      title: 'Shot Type Decision Guide — Real Java Dev Decisions',
      content: `Here is how to choose the right shot type for the exact tasks you will encounter. Each row is a real scenario with a recommendation and the reason.

| Scenario | Shot Type | Why |
|---|---|---|
| "Explain what a Java record is" | Zero-shot | LLM knows Java records thoroughly |
| "Explain our internal EventBus design" | Zero-shot + context | Internal design isn't in training data — provide it |
| "Write Javadoc in our team's style" | One-shot | Show one example of your style, it copies it |
| "Classify support tickets as BILLING/TECH/ACCOUNT" | Few-shot (3 examples) | Your category definitions need demonstration |
| "Generate a Spring Boot controller following our patterns" | Few-shot (2 examples) | Your patterns differ from defaults |
| "Review this PR for security issues" | Zero-shot with constraints | Security review is well-defined |
| "Assign ticket priority (P1/P2/P3/P4)" | Few-shot (1 per level) | Your priority definitions need anchoring |
| "Parse log lines into structured JSON" | Few-shot (3–5 lines) | Log format is unique to your system |

---

**The "style injection" technique (one-shot for team conventions)**

When your team has specific coding conventions, inject one or two examples to "train" the AI on your style. This is the most common enterprise use of one-shot prompting.

**Without style injection** (zero-shot):
\`\`\`
Write a Spring Boot service method to cancel an order.
\`\`\`
→ AI writes valid code but ignores your team's patterns: exception types, logging style, return types.

**With style injection** (one-shot):
\`\`\`
You are a developer on our team. Match our coding style exactly.

Our style example:
\`\`\`java
// Pattern: return Optional, throw DomainException (not RuntimeException),
// log at INFO entry, log at ERROR with MDC context on failure
public Optional<Order> findActiveOrder(String customerId) {
    log.info("Fetching active order, customerId={}", customerId);
    try {
        return orderRepo.findByCustomerIdAndStatus(customerId, ACTIVE);
    } catch (DataAccessException e) {
        MDC.put("customerId", customerId);
        log.error("Database error fetching order", e);
        throw new DomainException("ORDER_FETCH_FAILED", customerId);
    }
}
\`\`\`

Now write a method to cancel an order by ID. Follow the exact same pattern.
\`\`\``,
    },
    {
      id: 'pe-p1-l3-log-parser',
      type: 'code',
      title: 'Complete Few-Shot Example: Log Line Parser',
      content: `**Real-world use case:** Your Spring Boot app writes custom log lines. You need to extract structured data from them for an alerting system. This is the perfect few-shot task.

**The log format (your system-specific format):**
\`\`\`
2026-01-15 14:23:01 [OrderService] WARN  orderId=ORD-8821 customerId=C-441 status=PAYMENT_TIMEOUT duration=30012ms
2026-01-15 14:23:05 [PaymentGateway] ERROR txnId=TXN-9901 amount=5000 currency=INR error=GATEWAY_TIMEOUT retries=3
2026-01-15 14:23:10 [OrderService] INFO  orderId=ORD-8822 customerId=C-442 status=CONFIRMED duration=245ms
\`\`\`

**The few-shot prompt:**
\`\`\`
You are a log parser. Extract structured data from Spring Boot application log lines.
Return ONLY valid JSON. No explanation. No markdown.

Examples:
Input: "2026-01-15 14:23:01 [OrderService] WARN  orderId=ORD-8821 customerId=C-441 status=PAYMENT_TIMEOUT duration=30012ms"
Output: {"timestamp":"2026-01-15T14:23:01","service":"OrderService","level":"WARN","orderId":"ORD-8821","customerId":"C-441","status":"PAYMENT_TIMEOUT","durationMs":30012}

Input: "2026-01-15 14:23:05 [PaymentGateway] ERROR txnId=TXN-9901 amount=5000 currency=INR error=GATEWAY_TIMEOUT retries=3"
Output: {"timestamp":"2026-01-15T14:23:05","service":"PaymentGateway","level":"ERROR","txnId":"TXN-9901","amount":5000,"currency":"INR","error":"GATEWAY_TIMEOUT","retries":3}

Now parse this log line:
Input: "2026-01-15 14:25:30 [InventoryService] WARN  productId=PROD-551 warehouseId=WH-3 stockLevel=2 threshold=10 action=REORDER_TRIGGERED"
Output:
\`\`\`

**Why few-shot is required here:**
- Your log format has custom field names (orderId, txnId, productId) — not in LLM training
- The field types (string vs integer vs boolean) can only be inferred from examples
- Without examples, the AI might wrap integers in quotes or miss fields

**Java integration:**
\`\`\`java
@Service
public class LogParserService {
    private final AiClient ai;
    private static final String FEW_SHOT_PROMPT = """
        You are a log parser. Extract structured data from Spring Boot log lines.
        Return ONLY valid JSON. No explanation. No markdown.

        Examples:
        Input: "%s"
        Output: %s

        Input: "%s"
        Output: %s

        Now parse this log line:
        Input: "%s"
        Output:
        """;

    public Map<String, Object> parse(String logLine) {
        String prompt = FEW_SHOT_PROMPT.formatted(
            EXAMPLE_1_INPUT, EXAMPLE_1_OUTPUT,
            EXAMPLE_2_INPUT, EXAMPLE_2_OUTPUT,
            logLine
        );
        String json = ai.call(prompt, 0.0); // temperature 0 — deterministic
        return objectMapper.readValue(json, Map.class);
    }
}
\`\`\``,
    },
  ],

  // ─── PHASE 1 LESSON 4 ──────────────────────────────────────────────────────
  'pe-p1-l4': [
    {
      id: 'pe-p1-l4-enterprise-params',
      type: 'concept',
      title: 'Production Parameter Presets — Copy These Into Your Config',
      content: `In production, you should never hardcode temperature and token values inline. Define them as named presets that reflect the task type. Here are the 5 presets every Java AI service needs.

| Preset name | Temp | Max tokens | Stop seq | Use for |
|---|---|---|---|---|
| \`DETERMINISTIC\` | 0.0 | 500 | — | JSON extraction, classification, bug fix |
| \`PRECISE\` | 0.1 | 1500 | — | Code generation, structured review |
| \`BALANCED\` | 0.3 | 2000 | — | Documentation, explanation, Javadoc |
| \`CONVERSATIONAL\` | 0.5 | 1000 | — | Chatbot, Q&A, support assistant |
| \`CREATIVE\` | 0.8 | 2000 | — | Naming, brainstorming, alternatives |

**Why token limits matter for cost:**
At 1M tokens/day (medium enterprise):
- Max 500 tokens → $X/day
- Max 2000 tokens → ~4X/day (same request count, 4x cost)
- Always use the smallest token limit that fits your task

**Runaway token scenario:** A developer forgets to set maxTokens on a code generation prompt. The model generates a 10,000-token response (entire microservice). At scale, this silently 20x's your AI bill. Always set it explicitly.`,
    },
    {
      id: 'pe-p1-l4-spring-config',
      type: 'code',
      title: 'Spring Boot Parameter Configuration — Production-Ready',
      content: `**application.yml — all AI parameters externalized:**
\`\`\`yaml
ai:
  presets:
    deterministic:
      temperature: 0.0
      max-tokens: 500
    precise:
      temperature: 0.1
      max-tokens: 1500
    balanced:
      temperature: 0.3
      max-tokens: 2000
    conversational:
      temperature: 0.5
      max-tokens: 1000
    creative:
      temperature: 0.8
      max-tokens: 2000
\`\`\`

**AiPreset.java — type-safe preset:**
\`\`\`java
public record AiPreset(double temperature, int maxTokens) {

    public static final AiPreset DETERMINISTIC  = new AiPreset(0.0, 500);
    public static final AiPreset PRECISE        = new AiPreset(0.1, 1500);
    public static final AiPreset BALANCED       = new AiPreset(0.3, 2000);
    public static final AiPreset CONVERSATIONAL = new AiPreset(0.5, 1000);
    public static final AiPreset CREATIVE       = new AiPreset(0.8, 2000);
}
\`\`\`

**Usage in a service — always explicit, never inline magic numbers:**
\`\`\`java
@Service
public class CodeReviewService {

    public ReviewResult review(String code) {
        // PRECISE preset: code gen / structured output
        return callClaude(buildPrompt(code), AiPreset.PRECISE);
    }

    public String explainCode(String code) {
        // BALANCED preset: documentation / explanation
        return callClaude(buildExplainPrompt(code), AiPreset.BALANCED);
    }

    public List<String> brainstormAlternatives(String design) {
        // CREATIVE preset: generate diverse options
        return callClaude(buildBrainstormPrompt(design), AiPreset.CREATIVE);
    }

    private String callClaude(String prompt, AiPreset preset) {
        MessageCreateParams params = MessageCreateParams.builder()
            .model("claude-sonnet-4-5")
            .maxTokens(preset.maxTokens())
            // Note: Anthropic SDK uses temperature in MessageCreateParams
            .addUserMessage(prompt)
            .build();
        // ...
    }
}
\`\`\`

**Cost estimation formula:**
\`\`\`java
// Quick estimate before deploying a new AI feature
public class CostEstimator {
    // Claude Sonnet pricing (approximate, check current pricing)
    static final double INPUT_COST_PER_1K  = 0.003;   // $ per 1K input tokens
    static final double OUTPUT_COST_PER_1K = 0.015;   // $ per 1K output tokens

    public double estimateDailyCost(
            int dailyRequests,
            int avgInputTokens,
            int maxOutputTokens) {
        double inputCost  = (dailyRequests * avgInputTokens  / 1000.0) * INPUT_COST_PER_1K;
        double outputCost = (dailyRequests * maxOutputTokens / 1000.0) * OUTPUT_COST_PER_1K;
        return inputCost + outputCost;
    }
}
// 1000 code reviews/day × 800 input tokens × 1500 output tokens
// ≈ $24/day = ~$720/month — validate before launch
\`\`\``,
    },
  ],

  // ─── PHASE 2 LESSON 5 ──────────────────────────────────────────────────────
  'pe-p2-l5': [
    {
      id: 'pe-p2-l5-incident-cot',
      type: 'code',
      title: '3 Complete CoT Prompts for Real Production Incidents',
      content: `These are production-grade CoT prompts you can use immediately. Paste your actual data where indicated.

---

**Incident 1: OOMKilled Pod (Kubernetes + Spring Boot)**
\`\`\`
You are a senior Java SRE and JVM memory expert.

Symptom: Our Spring Boot microservice pod is OOMKilled every 4–6 hours.
Environment: Kubernetes, JVM heap limit: 512m, container limit: 768m.
Heap dump shows large char[] arrays from an internal cache.

Work through this step by step:
Step 1: What is the difference between JVM heap limit and container memory limit? Why does the gap matter?
Step 2: Given char[] arrays are dominating — what Spring/Java components typically create large char[] caches?
Step 3: What off-heap memory consumers exist in a typical Spring Boot app (besides heap)?
Step 4: If the cache is the culprit, what are 3 ways to bound it?
Step 5: What JVM flags and configuration changes should I try first?
Step 6: Write the optimized JVM startup flags for a 768MB container.
\`\`\`

---

**Incident 2: Kafka Consumer Lag Spike**
\`\`\`
You are a senior Kafka and Spring Kafka expert.

Symptom: Kafka consumer group "order-processor" has 50,000 messages of lag on topic "orders",
growing at 5,000/minute. It was keeping up 2 hours ago.
Nothing was deployed. Consumer count: 3 pods, 3 partitions.

Micrometer metric: kafka.consumer.fetch.latency.avg = 8200ms (was 120ms before the spike)
Heap usage: 70% (normal)
CPU: 40% (normal)

\`\`\`java
@KafkaListener(topics = "orders", groupId = "order-processor")
public void processOrder(ConsumerRecord<String, OrderEvent> record) {
    Order order = orderService.findById(record.value().orderId());
    enrichmentService.enrichWithCustomerData(order);  // calls external REST API
    inventoryService.checkAndReserve(order);           // DB write
    notificationService.send(order);                   // DB write + email
    orderRepo.save(order.withStatus(PROCESSING));
}
\`\`\`

Diagnose this step by step:
Step 1: What does kafka.consumer.fetch.latency.avg = 8200ms tell us? Is the consumer slow or the broker?
Step 2: Look at the processOrder method — which call is most likely to have gotten slow?
Step 3: If enrichmentService is the culprit (external REST API), what changed would cause it to slow down?
Step 4: How can we verify it's the enrichment service without adding more code?
Step 5: What is the immediate mitigation to reduce consumer lag right now?
Step 6: What is the proper fix to prevent this class of problem?
\`\`\`

---

**Incident 3: Database Deadlock**
\`\`\`
You are a senior Java developer and database expert (PostgreSQL).

We have intermittent deadlock errors in our order management service.
Frequency: ~50 per hour during peak load.
Stack trace:
\`\`\`
PSQLException: ERROR: deadlock detected
  Detail: Process 17284 waits for ShareLock on transaction 7291;
          Process 7291 waits for ShareLock on transaction 17284.
  at com.myapp.service.OrderService.updateInventoryAndStatus(OrderService.java:142)
\`\`\`

Relevant code:
\`\`\`java
@Transactional
public void processPaymentSuccess(String orderId, String productId) {
    inventoryRepo.decrementStock(productId, 1);   // UPDATE inventory SET stock = stock - 1
    orderRepo.updateStatus(orderId, "PAID");        // UPDATE orders SET status = 'PAID'
}

@Transactional
public void handleInventoryRefresh(String productId, String orderId) {
    orderRepo.updateStatus(orderId, "PROCESSING");  // UPDATE orders SET status
    inventoryRepo.decrementStock(productId, 1);     // UPDATE inventory SET stock
}
\`\`\`

Work through the deadlock diagnosis:
Step 1: Explain exactly what a deadlock is using these two methods as the example.
Step 2: Draw the lock acquisition order for each method (which table is locked first).
Step 3: Explain under what timing condition this deadlock occurs.
Step 4: What is the standard fix for lock-ordering deadlocks?
Step 5: Show the corrected code.
Step 6: Should there be a @Transactional timeout? What value and why?
\`\`\``,
    },
  ],

  // ─── PHASE 2 LESSON 6 ──────────────────────────────────────────────────────
  'pe-p2-l6': [
    {
      id: 'pe-p2-l6-schemas',
      type: 'code',
      title: '5 Production JSON Schemas for Java Systems',
      content: `These are copy-paste JSON schemas for the 5 most common structured output tasks in Java backends. Use these directly in your prompts.

---

**Schema 1: CI/CD Pipeline Error Classifier**
\`\`\`
Return ONLY valid JSON. Schema:
{
  "errorType": "COMPILATION" | "TEST_FAILURE" | "DEPENDENCY" | "INFRASTRUCTURE" | "CONFIG",
  "severity": "BLOCKING" | "DEGRADED" | "WARNING",
  "failingStep": "<name of the pipeline stage that failed>",
  "rootCause": "<one-sentence plain English explanation>",
  "suggestedFix": "<concrete action to fix it>",
  "estimatedFixTime": "MINUTES" | "HOURS" | "DAYS",
  "canAutoFix": true | false
}
\`\`\`

---

**Schema 2: Spring Boot PR Review Result**
\`\`\`
Return ONLY valid JSON. Schema:
{
  "verdict": "APPROVE" | "REQUEST_CHANGES" | "NEEDS_DISCUSSION",
  "issues": [
    {
      "severity": "CRITICAL" | "MAJOR" | "MINOR",
      "type": "BUG" | "SECURITY" | "PERFORMANCE" | "STYLE" | "TEST_COVERAGE",
      "file": "<filename>",
      "line": <line number or null>,
      "description": "<what is wrong>",
      "fix": "<concrete code change>"
    }
  ],
  "positives": ["<things done well>"],
  "summary": "<2-sentence overall assessment>"
}
\`\`\`

---

**Schema 3: API Endpoint Specification Extractor**
Given free-text requirements, extract a structured API spec:
\`\`\`
Return ONLY valid JSON. Schema:
{
  "endpoints": [
    {
      "method": "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
      "path": "<REST path with path variables>",
      "summary": "<what it does>",
      "requestBody": { "<field>": "<type>" } | null,
      "pathParams": [{ "name": "<name>", "type": "<type>", "description": "<desc>" }],
      "queryParams": [{ "name": "<name>", "type": "<type>", "required": true | false }],
      "responses": [
        { "status": <HTTP code>, "description": "<when this is returned>", "body": "<shape>" }
      ]
    }
  ]
}
\`\`\`

---

**Schema 4: Dependency Vulnerability Report**
\`\`\`
Return ONLY valid JSON. Schema:
{
  "vulnerabilities": [
    {
      "dependency": "<groupId:artifactId:version>",
      "cveId": "<CVE-YYYY-NNNNN or null>",
      "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "description": "<what the vulnerability allows>",
      "fixedInVersion": "<version string>",
      "upgradeCommand": "<Maven or Gradle command to upgrade>"
    }
  ],
  "totalCritical": <count>,
  "totalHigh": <count>,
  "recommendation": "<overall action: update now / schedule / monitor>"
}
\`\`\`

---

**Schema 5: Kafka Consumer Health Assessment**
\`\`\`
Return ONLY valid JSON. Schema:
{
  "status": "HEALTHY" | "DEGRADED" | "CRITICAL",
  "issues": [
    {
      "issueType": "LAG_GROWING" | "PARTITION_IMBALANCE" | "SLOW_PROCESSING" | "REBALANCING_LOOP",
      "affectedGroup": "<consumer group name>",
      "metrics": { "<metric name>": "<value>" },
      "impact": "<business impact of this issue>",
      "remediation": "<action to take>"
    }
  ],
  "immediateActions": ["<action 1>", "<action 2>"],
  "estimatedRecoveryTime": "<time estimate>"
}
\`\`\`

---

**Java retry-on-parse-failure pattern:**
\`\`\`java
public <T> T callWithRetry(String prompt, Class<T> type, int maxAttempts) {
    String lastError = null;
    for (int attempt = 1; attempt <= maxAttempts; attempt++) {
        String fullPrompt = attempt == 1 ? prompt
            : prompt + "\\n\\nPrevious attempt failed JSON parsing: " + lastError
            + "\\nReturn ONLY valid JSON matching the schema. No prose. No markdown.";

        String raw = callAi(fullPrompt);
        String json = raw.replaceAll("(?s)\`\`\`json\\s*|\\s*\`\`\`", "").trim();

        try {
            return mapper.readValue(json, type);
        } catch (JsonProcessingException e) {
            lastError = e.getMessage();
            log.warn("JSON parse failed attempt {}/{}: {}", attempt, maxAttempts, lastError);
        }
    }
    throw new AiParseException("Failed to parse AI response after " + maxAttempts + " attempts");
}
\`\`\``,
    },
  ],

  // ─── PHASE 2 LESSON 7 ──────────────────────────────────────────────────────
  'pe-p2-l7': [
    {
      id: 'pe-p2-l7-extra-templates',
      type: 'code',
      title: '5 More Domain-Specific Templates (Kafka, DB, Security, Ops)',
      content: `Beyond the standard 10 templates, here are 5 more for specific Java backend scenarios you will encounter.

---

**Template 11: Kafka Consumer Debug**
\`\`\`
You are a senior Kafka and Spring Kafka engineer.

Context:
- Spring Boot [VERSION], spring-kafka [VERSION]
- Topic: [TOPIC NAME], partitions: [N], consumer group: [GROUP NAME]
- Symptom: [DESCRIBE: lag growing / messages skipped / rebalancing loop / duplicate processing]
- Consumer metrics: lag=[N], fetch-latency=[Nms], poll-rate=[N/s]

\`\`\`java
[PASTE YOUR @KafkaListener METHOD]
\`\`\`

Task: Diagnose the consumer behaviour issue and recommend fixes.
Format:
1. Most likely root cause (1 sentence)
2. Why it causes this symptom (explain the mechanism)
3. Immediate action (what to do now to stabilize)
4. Permanent fix (code change + configuration)
5. Monitoring: which Kafka metric to watch to confirm resolution

Constraints: Spring Kafka 3.x patterns. No manual offset management unless necessary. Prefer idempotent consumer design.
\`\`\`

---

**Template 12: Slow JPA Query Optimizer**
\`\`\`
You are a Spring Data JPA and PostgreSQL performance expert.

Context:
- Spring Boot [VERSION], Hibernate 6, PostgreSQL [VERSION]
- This query runs [N] times/second, taking [Nms] average
- Table sizes: [entity A]: ~[N] rows, [entity B]: ~[N] rows
- Relevant indexes: [list existing indexes or "unknown"]

Slow query (from Hibernate Statistics or slow query log):
[PASTE THE JPQL OR SQL QUERY]

Entity relationship: [describe: OneToMany / ManyToMany / etc.]

Task: Identify why this query is slow and rewrite it to run in under [TARGET]ms.
Format:
1. Performance diagnosis (what makes it slow: missing index, N+1, full table scan, etc.)
2. Optimized query using Spring Data JPA (JPQL + @Query or @EntityGraph)
3. Index recommendation (exact CREATE INDEX statement)
4. Expected query plan after the fix (describe, don't need EXPLAIN output)

Constraints: Use JPQL, not native SQL unless no JPQL equivalent exists. Preserve pagination support.
\`\`\`

---

**Template 13: Spring Security Audit**
\`\`\`
You are a Spring Security 6 expert with OWASP and OAuth2 specialization.

Context:
- Spring Boot [VERSION], Spring Security 6, [authentication type: JWT / OAuth2 / Session-based]
- This is a [internal tool / public API / customer-facing app]
- Data sensitivity: [low / medium / high — contains PII / financial data]

\`\`\`java
[PASTE SecurityConfig or relevant security filter code]
\`\`\`

Task: Audit this security configuration for vulnerabilities and misconfigurations.
Format:
1. Critical vulnerabilities (exploitable immediately)
2. Security misconfigurations (wrong but not immediately exploitable)
3. Hardening recommendations (best practice improvements)
For each: describe the risk, show the fix, cite the OWASP category.

Constraints: Spring Security 6 patterns (not deprecated WebSecurityConfigurerAdapter).
Focus on: authentication, authorization, session management, CSRF, CORS, and header security.
\`\`\`

---

**Template 14: Docker/Kubernetes Deployment Readiness**
\`\`\`
You are a Java DevOps engineer specialising in containerizing Spring Boot applications.

Context:
- Spring Boot [VERSION], Java [VERSION]
- Target: Kubernetes [VERSION], container registry: [ECR / GCR / Docker Hub]
- Current Dockerfile/deployment: [paste or "not yet created"]
- Observed issue: [describe: OOMKilled / slow startup / health check failing / etc.]

Task: Review and improve the deployment configuration for production readiness.
Format:
1. Issues in current config (if provided)
2. Optimal Dockerfile (multi-stage build, non-root user, correct base image)
3. Kubernetes Deployment spec (with resource limits, liveness/readiness probes)
4. JVM flags for container (heap sizing, GC tuning for container awareness)

Constraints: Java 21 base image (eclipse-temurin:21-jre-alpine). Container memory: [N]Mi.
GC: G1 or ZGC. Spring Boot actuator health endpoints must be used for probes.
\`\`\`

---

**Template 15: Release Notes Generator**
\`\`\`
You are a technical writer for engineering teams who writes clear, developer-friendly release notes.

Context:
- Project: [PROJECT NAME], version: [X.Y.Z]
- Audience: [internal developers / external API consumers / business stakeholders]
- Jira project: [KEY] (tickets listed below)

Changes included in this release:
[PASTE: git log --oneline output OR list of JIRA tickets with titles]

Task: Write release notes for version [X.Y.Z].
Format (adapt based on audience):
## What's New (features)
## Bug Fixes
## Breaking Changes (if any — flag these prominently)
## Migration Guide (if breaking changes exist)
## Known Issues

Constraints:
- Non-technical stakeholders read this too — avoid internal jargon
- Breaking changes section is MANDATORY if any API contracts changed
- Each item: one sentence max, link to JIRA ticket
- Flag security fixes with [SECURITY] tag
\`\`\``,
    },
  ],

  // ─── PHASE 2 LESSON 8 ──────────────────────────────────────────────────────
  'pe-p2-l8': [
    {
      id: 'pe-p2-l8-full-refinement',
      type: 'concept',
      title: 'Complete 3-Pass Refinement: Kafka Lag Investigation',
      content: `Here is a fully worked example of the 3-pass method applied to a real production scenario. Watch how each pass addresses a specific failure.

---

**PASS 0 — The original bad prompt:**
\`\`\`
my kafka consumer is slow
\`\`\`
**Output:** 3 paragraphs of generic advice about Kafka consumers. Mentions increasing partitions, adjusting poll interval, and checking network. None of this is actionable without knowing your specific setup.

**Failure diagnosis:** Missing everything — Role, Context, Task, Format, Constraints.

---

**PASS 1 — Add Role + Task (most impactful fixes first):**
\`\`\`
You are a Spring Kafka expert.
My consumer group "order-processor" has 50,000 messages of lag. Diagnose it.
\`\`\`
**Output:** Better — mentions common causes (slow processing, too few consumers, partition imbalance). But it's still generic. It doesn't know our code or metrics.

**Failure diagnosis:** Context missing — AI is guessing at causes.

---

**PASS 2 — Add Context (metrics + code):**
\`\`\`
You are a senior Spring Kafka performance engineer.

Context:
- Spring Boot 3.2, spring-kafka 3.1
- Consumer group: "order-processor", topic: "orders", 6 partitions, 3 pods
- Lag: 50,000 messages, growing at 3,000/minute for the last 20 minutes
- No recent deployment
- Kafka metric: consumer.records.lag.max = 50000 (was < 100 before)
- Spring metric: kafka.consumer.fetch.latency.avg = 7800ms (was 95ms)

Our consumer:
\`\`\`java
@KafkaListener(topics = "orders", groupId = "order-processor")
public void process(OrderEvent event) {
    Order order = orderService.enrich(event);     // calls 3 external REST APIs
    inventoryService.reserve(order);               // DB write
    orderRepo.save(order);
}
\`\`\`

Diagnose the lag spike.
\`\`\`
**Output:** Identifies the enrich() call as the likely culprit based on fetch latency spike. But the format is a wall of text — hard to act on.

**Failure diagnosis:** Format unspecified — output is hard to scan and prioritize.

---

**PASS 3 — Add Format + Constraints:**
\`\`\`
[same as Pass 2, plus:]

Format:
1. Most likely root cause (1 sentence)
2. Evidence from the metrics that supports it
3. Immediate mitigation (what to do right now — no code changes)
4. Permanent fix (code change — show the before/after)
5. How to confirm the fix worked (which metric to watch)

Constraints: Immediate mitigation must be possible without a deployment.
Permanent fix must use Spring Kafka patterns (no Kafka admin API changes).
\`\`\`
**Output:** Structured, actionable 5-point response. Root cause: enrich() is calling a slow external API synchronously. Immediate mitigation: temporarily reduce topic consumption rate by reducing max.poll.records. Permanent fix: make enrich() async with CompletableFuture.allOf(). Confirmation metric: consumer.fetch.latency.avg returns to < 200ms.

---

**What each pass fixed:**
| Pass | Change | Failure addressed |
|---|---|---|
| 0 → 1 | Added Role + Task | Wrong expertise (generic advice) |
| 1 → 2 | Added Context (metrics + code) | Wrong assumptions (AI guessing) |
| 2 → 3 | Added Format + Constraints | Wall of text, unusable output |`,
    },
  ],

  // ─── PHASE 3 LESSON 9 ──────────────────────────────────────────────────────
  'pe-p3-l9': [
    {
      id: 'pe-p3-l9-more-prompts',
      type: 'code',
      title: '4 More Production System Prompts — Copy and Deploy',
      content: `These 4 system prompts are production-ready for specific enterprise Java use cases. Store each in its own classpath file.

---

**System Prompt: On-Call Incident Responder**
\`\`\`
You are an on-call incident responder for a Java microservices platform running on Kubernetes.
You have deep expertise in Spring Boot, Kafka, PostgreSQL, Redis, and distributed systems debugging.

Your role during an incident:
1. Triage: assess severity in 30 seconds based on symptoms + metrics
2. Immediate actions: what to do RIGHT NOW to reduce customer impact
3. Investigation: step-by-step diagnosis to find root cause
4. Resolution: specific code or configuration fix
5. Post-incident: one-sentence prevention recommendation

Format for all responses:
## Severity: [P1 / P2 / P3]
## Immediate Action
## Investigation Steps
## Root Cause (once identified)
## Fix
## Prevention

Rules:
- Never say "it might be..." — be definitive based on the evidence
- If more information is needed, ask exactly one specific question
- Escalate to P1 if: data loss risk, revenue impact, >500 users affected, security breach
- Keep responses under 400 words — incidents require clarity, not essays
\`\`\`

---

**System Prompt: Sprint Planning Assistant**
\`\`\`
You are a technical lead helping a Java backend team plan sprint work.
You understand story point estimation, task decomposition, and risk identification for Spring Boot microservices projects.

When given a user story or feature request, you:
1. Decompose it into technical tasks (max 1 day each)
2. Assign story point estimates (Fibonacci: 1, 2, 3, 5, 8, 13)
3. Identify dependencies between tasks
4. Flag risks and unknowns that could delay completion
5. Suggest the optimal task order

Output format: A sprint planning table with columns:
Task | Story Points | Dependencies | Risk | Notes

Rules:
- If a task is > 5 points, decompose it further
- Flag API integration tasks as high-risk by default (external dependencies)
- Database schema changes always come before code changes in task order
- Include "Write tests" as a separate task — not bundled into coding tasks
- If the story is vague, ask one clarifying question before estimating
\`\`\`

---

**System Prompt: Database Migration Advisor**
\`\`\`
You are a PostgreSQL and Liquibase/Flyway expert specialising in zero-downtime database migrations for Spring Boot applications.

You review migration scripts for:
- Correctness: will this run without errors?
- Safety: can this run on a live production database without downtime?
- Compatibility: does this work with existing Java entities and queries?
- Performance: will this lock tables or cause timeouts at production scale?

For every migration you review:
1. Identify risks (table locks, data loss, breaking changes)
2. Classify: safe/unsafe for zero-downtime deployment
3. Suggest safe alternatives for any unsafe operations
4. Estimate execution time for tables with >1M rows

Critical rules:
- ADD COLUMN is safe (no lock). ADD COLUMN NOT NULL without DEFAULT is UNSAFE.
- RENAME COLUMN requires a 3-phase migration (add new, migrate, drop old).
- DROP COLUMN is irreversible — always flag as HIGH RISK.
- Always ask: "Is there any Java code that reads this column by position, not name?"

Never approve a migration that could cause a production outage without flagging it.
\`\`\`

---

**System Prompt: Customer Support Triage (Internal Tool)**
\`\`\`
You are a first-line support triage assistant for a SaaS platform backend team.
You help support engineers classify incoming tickets, find relevant documentation, and suggest initial responses.

For each incoming support ticket you:
1. Classify: BUG / FEATURE_REQUEST / USAGE_QUESTION / CONFIGURATION / DATA_ISSUE / BILLING
2. Assign priority: URGENT (data loss, security) / HIGH (feature broken) / MEDIUM (workaround exists) / LOW (cosmetic)
3. Identify the affected component: API / UI / Database / Integration / Auth / Billing
4. Suggest: which team to route to
5. Draft: a short empathetic initial response to the customer (2–3 sentences max)

Output format:
Classification: ...
Priority: ...
Component: ...
Route to: ...
Initial response draft: "..."

Rules:
- NEVER confirm a bug is fixed without checking the engineering team has resolved it
- Any mention of data loss or security automatically escalates to URGENT
- Billing issues route to the finance team, not engineering
- If the ticket is a duplicate of a known issue, flag it as KNOWN_ISSUE and provide the issue number if you have it in context
\`\`\``,
    },
  ],

  // ─── PHASE 3 LESSON 10 ─────────────────────────────────────────────────────
  'pe-p3-l10': [
    {
      id: 'pe-p3-l10-feature-chain',
      type: 'code',
      title: 'Complete 4-Step Feature Development Chain',
      content: `**Real use case:** Implement a "bulk order import" feature in an e-commerce Spring Boot backend.
This is a real 4-step chain from requirements to production-ready code.

---

**Step 1 — Requirements Analysis**
\`\`\`
You are a senior Java developer analyzing a feature request.

Feature request: "Allow merchants to import up to 1,000 orders at once via CSV file upload."

Analyze this request and output JSON:
{
  "functionalRequirements": ["<what the system must do>"],
  "nonFunctionalRequirements": {
    "performance": "<latency / throughput targets>",
    "reliability": "<what happens if it fails mid-import>",
    "security": "<access control, file validation needs>"
  },
  "risks": ["<technical risks or unknowns>"],
  "questions": ["<questions that must be answered before implementation>"],
  "estimatedComplexity": "LOW" | "MEDIUM" | "HIGH"
}

System context: Spring Boot 3.2, PostgreSQL, current order creation takes 50ms per order.
\`\`\`

---

**Step 2 — Technical Design** (uses Step 1 output)
\`\`\`
You are a Spring Boot architect designing a bulk import feature.

Requirements from analysis:
[PASTE STEP 1 JSON]

Design the technical approach. Output JSON:
{
  "approach": "<synchronous vs async, why>",
  "apiContract": {
    "endpoint": "<HTTP method + path>",
    "request": "<multipart/JSON shape>",
    "response": "<immediate response + async result polling>",
    "errorResponse": "<validation error shape>"
  },
  "processingStrategy": "<batch size, transaction scope, retry logic>",
  "components": [
    {"name": "<class name>", "responsibility": "<what it does>", "type": "Controller/Service/Repository/..."}
  ],
  "databaseChanges": ["<any new tables or columns needed>"]
}
\`\`\`

---

**Step 3 — Code Generation** (uses Step 2 output)
\`\`\`
You are a senior Spring Boot developer.

Technical design:
[PASTE STEP 2 JSON]

Generate production-ready Java code for the bulk order import feature.

Requirements:
- Java 21, Spring Boot 3.2
- Async processing with @Async or CompletableFuture
- Validation: file size < 5MB, CSV format, max 1000 rows
- Each batch of 50 orders in one @Transactional call
- Return jobId immediately; client polls /import/{jobId}/status

Generate:
1. BulkImportController (file upload endpoint + status endpoint)
2. BulkImportService (async processing with progress tracking)
3. CsvOrderValidator (validates format + business rules)
4. BulkImportJob entity (tracks status: QUEUED/PROCESSING/DONE/FAILED)

Constraints: Each file is a separate code block with filename header.
Complete implementations — no TODO or placeholder comments.
\`\`\`

---

**Step 4 — Test Generation** (uses Step 3 output)
\`\`\`
You are a Spring Boot testing expert (JUnit 5, Mockito, Testcontainers).

Implementation to test:
[PASTE STEP 3 CODE for BulkImportService]

Write comprehensive tests:

Unit tests (BulkImportServiceTest):
- CSV parsing: valid file, missing columns, wrong format
- Validation: file too large, too many rows, invalid order data
- Batch processing: success, partial failure, full failure
- Transaction: verify rollback on batch failure

Integration test (BulkImportIntegrationTest):
- Full flow: upload valid CSV → poll status → verify orders in DB
- Use Testcontainers for PostgreSQL
- Use MockMvc for HTTP layer

Constraints: @ExtendWith(MockitoExtension.class) for unit tests.
Use @SpringBootTest + Testcontainers for integration test.
Real CSV file fixtures — not mocked byte arrays.
\`\`\`

---

**Java orchestration:**
\`\`\`java
@Service
public class FeatureDevelopmentOrchestrator {
    private final AiClient ai;
    private final ObjectMapper mapper;

    public FeatureImplementation develop(String featureRequest, String systemContext) {
        // Step 1: Analyze
        RequirementsAnalysis analysis = callJson(
            buildAnalysisPrompt(featureRequest, systemContext),
            RequirementsAnalysis.class,
            AiPreset.DETERMINISTIC
        );
        validateAnalysis(analysis); // throw if estimatedComplexity == HIGH and no approval

        // Step 2: Design
        TechnicalDesign design = callJson(
            buildDesignPrompt(analysis),
            TechnicalDesign.class,
            AiPreset.PRECISE
        );

        // Step 3: Code
        String code = callText(buildCodePrompt(design), AiPreset.PRECISE);

        // Step 4: Tests
        String tests = callText(buildTestPrompt(code), AiPreset.PRECISE);

        return new FeatureImplementation(analysis, design, code, tests);
    }
}
\`\`\``,
    },
  ],

  // ─── PHASE 3 LESSON 11 ─────────────────────────────────────────────────────
  'pe-p3-l11': [
    {
      id: 'pe-p3-l11-three-systems',
      type: 'concept',
      title: '3 Real RAG Setups Java Teams Build',
      content: `RAG is not just one pattern — it manifests differently depending on the knowledge source. Here are the 3 most common RAG setups Java developers build.

---

**RAG Setup 1: Internal Confluence Documentation Bot**

Use case: Developers ask "how do we deploy to production?" and get answers from the internal wiki instead of asking a colleague.

Knowledge source: Confluence pages exported as text
Retrieval: Elasticsearch or pgvector with cosine similarity
Chunk strategy: 500 tokens per chunk, 50-token overlap

System prompt:
\`\`\`
You are an internal knowledge assistant for the engineering team at [Company].
You answer technical questions using ONLY the provided Confluence documentation.

When you answer:
- Cite the source page title after each factual claim: [Page: "Deployment Runbook v3"]
- If documentation is unclear or conflicting, state that explicitly
- If the answer is not in the provided docs: say "This isn't covered in our current documentation. Please ask in #engineering-help Slack."
- If the documentation refers to a ticket number, include it

Never guess or fill in gaps from general knowledge. Our processes are specific to our systems.
\`\`\`

User prompt pattern:
\`\`\`java
public String askConfluence(String question, List<ConfluencePage> relevantPages) {
    return """
        Based ONLY on the following Confluence pages, answer this question.

        <documentation>
        %s
        </documentation>

        <question>%s</question>
        """.formatted(formatPages(relevantPages), question);
}
\`\`\`

---

**RAG Setup 2: Codebase Assistant ("Ask our codebase")**

Use case: New developer asks "how does our payment retry logic work?" — AI reads the actual source files and explains.

Knowledge source: Java source files indexed by class/package
Retrieval: Grep + semantic search over code embeddings
Chunk strategy: One method per chunk (preserve logical units)

Prompt:
\`\`\`
You are a developer mentor who explains our codebase to new team members.

You have been given these source files relevant to the question:
<codebase>
// [filename]
[file content]

// [filename]
[file content]
</codebase>

Answer based ONLY on the provided code. If the code doesn't have the answer, say so.
When explaining, quote the relevant code line and explain what it does.
Reference method names and class names from the actual code.
\`\`\`

---

**RAG Setup 3: Incident Runbook Lookup**

Use case: On-call engineer gets a PagerDuty alert and asks "what do I do for a HikariCP timeout alert?"

Knowledge source: Markdown runbooks in Git repo
Retrieval: Vector search on runbook sections
Chunk strategy: One section per chunk (##-level headings)

Prompt:
\`\`\`
You are an on-call assistant. The engineer has received an alert and needs immediate guidance.

Relevant runbooks:
<runbooks>
[retrieved runbook sections]
</runbooks>

Alert received: [ALERT TITLE AND DETAILS]

Based on the runbooks:
1. Immediate check: what to look at first (30 seconds)
2. Triage steps: commands to run to diagnose
3. Resolution: the fix from the runbook
4. Escalation: when to escalate and to whom

If the runbooks don't cover this alert, say: "No runbook found for this alert. Escalate to [team] immediately."
Response must be under 200 words — the engineer is in an active incident.
\`\`\``,
    },
  ],

  // ─── PHASE 3 LESSON 12 ─────────────────────────────────────────────────────
  'pe-p3-l12': [
    {
      id: 'pe-p3-l12-banking-tools',
      type: 'code',
      title: 'Complete Banking Assistant — 4 Tools with Full Descriptions',
      content: `Here is a complete, production-quality tool set for a banking customer support chatbot. Every description is written as a prompt.

\`\`\`java
// Tool 1: Account Balance
@JsonClassDescription(
    "Retrieve the current balance and account details for a customer's bank account. " +
    "Use when the customer asks about their balance, available funds, or account status. " +
    "Returns current balance, available balance (excluding pending), and account status. " +
    "Do NOT use for transaction history — use getTransactionHistory instead."
)
public record GetAccountBalanceParams(
    @JsonPropertyDescription(
        "The customer's account number. Format: 10-digit numeric string (e.g., '1234567890'). " +
        "If the customer says 'my account', use their authenticated account number from session context. " +
        "If they have multiple accounts (savings/current), ask which account before calling."
    )
    String accountNumber
) {}

// Tool 2: Transaction History
@JsonClassDescription(
    "Retrieve recent transactions for a bank account. " +
    "Use when customer asks about transactions, recent activity, charges, or credits. " +
    "Returns last N transactions sorted by date descending. " +
    "Do NOT use for balance — use getAccountBalance instead. " +
    "Do NOT use for pending transactions — they appear in balance but not history."
)
public record GetTransactionHistoryParams(
    @JsonPropertyDescription(
        "10-digit account number. Same format as getAccountBalance."
    )
    String accountNumber,

    @JsonPropertyDescription(
        "Number of transactions to retrieve. Default: 10. Maximum: 50. " +
        "If customer asks for 'last month', calculate the count based on average of ~30 transactions/month."
    )
    int limit,

    @JsonPropertyDescription(
        "Optional: filter transactions from this date. ISO 8601 format: YYYY-MM-DD. " +
        "Omit to get the most recent transactions regardless of date."
    )
    @Nullable String fromDate
) {}

// Tool 3: Fund Transfer
@JsonClassDescription(
    "Initiate a fund transfer between two accounts. " +
    "CRITICAL: Always confirm ALL details with the customer before calling this tool. " +
    "Say: 'You are transferring ₹[amount] from account [from] to [to]. Confirm?' " +
    "NEVER call this tool speculatively or without explicit customer confirmation. " +
    "Returns a transaction ID and status (PENDING/SUCCESS/FAILED)."
)
public record TransferFundsParams(
    @JsonPropertyDescription(
        "Source account number (debit account). Must belong to the authenticated customer. " +
        "10-digit format."
    )
    String fromAccountNumber,

    @JsonPropertyDescription(
        "Destination account number (credit account). Can be any valid bank account. " +
        "10-digit format. Validate format before calling."
    )
    String toAccountNumber,

    @JsonPropertyDescription(
        "Transfer amount in INR as integer paise (smallest unit). " +
        "Example: ₹500.00 = 50000 paise. " +
        "Minimum: 100 paise (₹1). Maximum: 100000000 paise (₹10 lakh). " +
        "Never accept and pass a float — convert to integer paise."
    )
    long amountInPaise
) {}

// Tool 4: Flag Suspicious Activity
@JsonClassDescription(
    "Report a suspected fraudulent transaction or security concern to the fraud team. " +
    "Use when customer reports: unrecognized transaction, account access they didn't initiate, " +
    "phishing attempt, or lost/stolen card. " +
    "This does NOT block the account — it only creates a fraud report ticket. " +
    "For immediate account block, redirect to the 24/7 fraud hotline: 1800-XXX-XXXX."
)
public record FlagSuspiciousActivityParams(
    @JsonPropertyDescription(
        "The account number in question. 10-digit format."
    )
    String accountNumber,

    @JsonPropertyDescription(
        "Type of concern. One of: UNRECOGNIZED_TRANSACTION / UNAUTHORIZED_ACCESS / " +
        "PHISHING_ATTEMPT / LOST_CARD / STOLEN_CARD / SUSPECTED_FRAUD."
    )
    String concernType,

    @JsonPropertyDescription(
        "Customer's description of the issue in their own words. " +
        "Include: transaction date/amount if known, how they discovered the issue. " +
        "Do NOT clean up or summarize — preserve their exact words for fraud analysis."
    )
    String customerDescription
) {}
\`\`\`

**System prompt for this banking assistant:**
\`\`\`
You are a customer support assistant for SafeBank. You help customers with account inquiries.

Tool usage rules:
1. Verify the customer's intent before calling any tool. If ambiguous, ask one question.
2. For getAccountBalance and getTransactionHistory: call immediately once you understand the request.
3. For transferFunds: ALWAYS summarize the transfer details and ask for explicit confirmation first.
   Never call transferFunds without: "You want to transfer ₹X from account NNNN to NNNN. Is that correct?"
4. For flagSuspiciousActivity: express empathy first, then gather details, then call the tool.

Prohibited:
- Never share one customer's account details with another customer
- Never discuss competitors' products
- Never make promises about fraud refund outcomes
- Never ask for passwords, PINs, or OTPs — SafeBank never asks for these

Tone: Professional, calm, empathetic. Use customer's name if available.
\`\`\``,
    },
  ],

  // ─── PHASE 4 LESSON 13 ─────────────────────────────────────────────────────
  'pe-p4-l13': [
    {
      id: 'pe-p4-l13-git-workflow',
      type: 'code',
      title: 'Complete Git-Based Prompt Workflow with PR Template',
      content: `Here is a complete, team-ready workflow for managing prompts in Git. Copy this into your team's repo.

**Repository structure:**
\`\`\`
prompts/
├── CHANGELOG.md
├── README.md
├── code-review/
│   ├── general-review.txt       ← the prompt
│   ├── general-review.test.json ← test cases
│   ├── general-review.md        ← usage docs
│   └── security-review.txt
├── documentation/
│   ├── javadoc-writer.txt
│   └── adr-writer.txt
└── support/
    ├── ticket-triage.txt
    └── customer-response.txt
\`\`\`

**general-review.txt (version-controlled prompt):**
\`\`\`
# Version: 1.4.2
# Last updated: 2026-05-01
# Owner: @dev-platform-team

You are a senior Java engineer at [COMPANY] reviewing production code.

[CONTEXT]
Stack: Spring Boot 3.2, Java 21, PostgreSQL, Kafka.
Feature context: {FEATURE_CONTEXT}

[TASK]
Review the following code for correctness, security, and maintainability:

{CODE}

[FORMAT]
Verdict: APPROVE | REQUEST CHANGES | NEEDS DISCUSSION
Then list issues:
## Critical (must fix before merge)
## Major (should fix, can create follow-up ticket)
## Minor (optional improvements)
For each: quote the problematic code + explain why + show the fix.

[CONSTRAINTS]
Java 21 idioms. Max 10 issues total. Flag Spring Boot 3.x deprecations.
\`\`\`

**general-review.test.json:**
\`\`\`json
{
  "version": "1.4.2",
  "testCases": [
    {
      "name": "SQL injection detection",
      "input": {
        "CODE": "public User find(String name) { return jdbc.queryForObject(\\"SELECT * FROM users WHERE name = '\\" + name + \\"'\\", User.class); }",
        "FEATURE_CONTEXT": "User lookup endpoint"
      },
      "assertions": {
        "mustContain": ["CRITICAL", "SQL injection", "PreparedStatement"],
        "mustNotContain": ["APPROVE"],
        "jsonField": null
      }
    },
    {
      "name": "Clean code passes without critical issues",
      "input": {
        "CODE": "public Optional<User> findById(Long id) { return userRepo.findById(id); }",
        "FEATURE_CONTEXT": "User repository wrapper"
      },
      "assertions": {
        "mustContain": ["APPROVE"],
        "mustNotContain": ["CRITICAL", "SQL injection"],
        "jsonField": null
      }
    }
  ]
}
\`\`\`

**PR template for prompt changes (.github/PULL_REQUEST_TEMPLATE/prompt_change.md):**
\`\`\`markdown
## Prompt Change PR

**Prompt:** \`prompts/[category]/[name].txt\`
**Version:** [old] → [new]

### What changed
<!-- Describe the exact change to the prompt text -->

### Why this change was needed
<!-- What problem did the old version have? Include examples of bad output if possible -->

### Evidence the new version is better
<!-- Test results, example outputs, A/B comparison -->
- [ ] All existing test cases still pass
- [ ] New test case added for the issue being fixed
- [ ] Tested on at least 10 real inputs
- [ ] Token count change: [old avg] → [new avg] tokens

### Rollback plan
<!-- If this breaks production, how do we roll back? -->
The previous version is at commit [SHA]. Rollback: \`git revert [SHA]\` and redeploy.
\`\`\``,
    },
  ],

  // ─── PHASE 4 LESSON 14 ─────────────────────────────────────────────────────
  'pe-p4-l14': [
    {
      id: 'pe-p4-l14-ci-pipeline',
      type: 'code',
      title: 'GitHub Actions CI Pipeline for Prompt Evals',
      content: `Run your prompt test suite automatically on every PR that changes a prompt file. Here is a complete setup.

**GitHub Actions workflow (.github/workflows/prompt-eval.yml):**
\`\`\`yaml
name: Prompt Evaluation

on:
  pull_request:
    paths:
      - 'prompts/**'         # only run when prompt files change

jobs:
  eval:
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - uses: actions/checkout@v4

      - name: Set up Java 21
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'

      - name: Cache Maven dependencies
        uses: actions/cache@v4
        with:
          path: ~/.m2
          key: \${{ runner.os }}-maven-\${{ hashFiles('**/pom.xml') }}

      - name: Run prompt evaluations
        env:
          ANTHROPIC_API_KEY: \${{ secrets.ANTHROPIC_API_KEY }}
          PROMPT_EVAL_MODE: "ci"    # use cheaper model for evals
        run: mvn test -Dtest=PromptEvalSuite -pl prompt-eval-module

      - name: Comment eval results on PR
        uses: actions/github-script@v7
        if: always()
        with:
          script: |
            const fs = require('fs');
            const results = JSON.parse(fs.readFileSync('target/eval-results.json'));
            const passed = results.filter(r => r.passed).length;
            const failed = results.filter(r => !r.passed).length;
            const body = \`## Prompt Eval Results
            ✅ Passed: \${passed} | ❌ Failed: \${failed}
            \${failed > 0 ? '\\n### Failed cases:\\n' + results.filter(r => !r.passed).map(r => \`- \${r.name}: \${r.failureReason}\`).join('\\n') : ''}
            \`;
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body
            });
\`\`\`

**PromptEvalSuite.java — the JUnit test that CI runs:**
\`\`\`java
@SpringBootTest
@Tag("prompt-eval")
public class PromptEvalSuite {
    @Autowired AiClient ai;
    @Autowired ObjectMapper mapper;

    @Test
    void allPromptTestCasesPass() throws IOException {
        List<EvalResult> results = new ArrayList<>();

        // Load all .test.json files from prompts/ directory
        ResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        Resource[] testFiles = resolver.getResources("classpath:prompts/**/*.test.json");

        for (Resource testFile : testFiles) {
            PromptTestSuite suite = mapper.readValue(testFile.getInputStream(), PromptTestSuite.class);
            String promptContent = loadPrompt(testFile.getFilename().replace(".test.json", ".txt"));

            for (PromptTestCase tc : suite.testCases()) {
                String filledPrompt = fillTemplate(promptContent, tc.input());
                String response = ai.call(filledPrompt, AiPreset.DETERMINISTIC);
                EvalResult result = evaluate(tc, response);
                results.add(result);
                log.info("[{}] {} - {}", suite.version(), tc.name(), result.passed() ? "PASS" : "FAIL");
            }
        }

        // Write results for GitHub Actions comment
        mapper.writeValue(new File("target/eval-results.json"), results);

        long failed = results.stream().filter(r -> !r.passed()).count();
        assertThat(failed)
            .as("Prompt eval failures:\n" + formatFailures(results))
            .isZero();
    }
}
\`\`\``,
    },
  ],

  // ─── PHASE 4 LESSON 15 ─────────────────────────────────────────────────────
  'pe-p4-l15': [
    {
      id: 'pe-p4-l15-healthcare',
      type: 'concept',
      title: 'Complete Safety Implementation: Healthcare Patient Intake',
      content: `Healthcare is the most demanding domain for AI safety. Here is a complete 5-layer implementation for a patient intake chatbot — a real use case where each safety layer is not optional.

**The scenario:**
A Spring Boot service processes patient intake forms. Patients type free-text responses describing their symptoms. The AI extracts structured fields and flags urgent cases for fast-track triage.

**Why each safety layer is mandatory here:**
- Layer 1 (Input Gate): Patient might accidentally include another patient's ID number
- Layer 2 (Prompt Architecture): Injection could cause AI to misclassify severity (life safety risk)
- Layer 3 (Output Validation): AI must never invent symptoms or medications the patient didn't mention
- Layer 4 (Observability): HIPAA audit trail required for every AI access
- Layer 5 (Resilience): Fallback must route patient to human, never silently fail

**Layer-by-layer implementation for this scenario:**

**Layer 1 — Input Gate (healthcare-specific):**
\`\`\`java
@Component
public class PatientInputGate {
    // Healthcare-specific PII patterns (beyond standard PII)
    private static final Pattern AADHAAR = Pattern.compile("\\\\b[2-9]{1}[0-9]{3}\\\\s[0-9]{4}\\\\s[0-9]{4}\\\\b");
    private static final Pattern ABHA_ID = Pattern.compile("\\\\b[0-9]{2}-[0-9]{4}-[0-9]{4}-[0-9]{4}\\\\b");

    public IntakeInput validate(String rawInput) {
        if (rawInput.length() > 3000) throw new IntakeTooLongException();
        if (rawInput.length() < 10)  throw new IntakeTooShortException();

        String scrubbed = scrubHealthcarePii(rawInput);
        InputVerdict verdict = injectionGuard.check(scrubbed);

        return new IntakeInput(scrubbed, verdict, Instant.now());
    }
}
\`\`\`

**Layer 2 — Prompt Architecture (no hallucination, no severity invention):**
\`\`\`
You are a medical intake assistant. Extract structured information ONLY.

CRITICAL RULES:
1. Extract ONLY symptoms the patient explicitly mentioned — never infer or add symptoms
2. If a symptom is unclear, include it verbatim with an "unclear" flag — never interpret
3. Never suggest diagnoses — only extract what the patient described
4. If patient mentions chest pain, difficulty breathing, or loss of consciousness: immediately set urgencyLevel = "EMERGENCY"
5. If you are uncertain about urgency: default to URGENT, not LOW

<patient_intake>
{SCRUBBED_PATIENT_TEXT}
</patient_intake>

Return ONLY valid JSON:
{
  "symptoms": [{"symptom": "<exact words patient used>", "duration": "<if mentioned>", "severity": "<patient's words>"}],
  "urgencyLevel": "EMERGENCY" | "URGENT" | "ROUTINE",
  "urgencyReason": "<why this level — quote the patient's words>",
  "requiresImmediateHumanReview": true | false,
  "flaggedKeywords": ["<terms that triggered urgency assessment>"]
}
\`\`\`

**Layer 3 — Output Validation (medical data integrity):**
\`\`\`java
@Component
public class IntakeOutputValidator {
    public void validate(IntakeResult result, String originalInput) {
        // Verify: every extracted symptom must appear in original input
        for (Symptom symptom : result.symptoms()) {
            boolean appearsInInput = originalInput.toLowerCase()
                .contains(symptom.symptom().toLowerCase().split(" ")[0]);
            if (!appearsInInput) {
                throw new HallucinatedSymptomException(symptom.symptom());
            }
        }
        // Verify: EMERGENCY level requires a flagged keyword
        if (result.urgencyLevel() == EMERGENCY && result.flaggedKeywords().isEmpty()) {
            throw new InvalidUrgencyClassificationException();
        }
    }
}
\`\`\`

**Layer 4 — HIPAA Observability (audit log, NOT the patient data):**
\`\`\`java
@Service
public class HipaaAuditLogger {
    public void logIntake(String sessionId, IntakeInput input, IntakeResult result) {
        AuditEntry entry = new AuditEntry(
            sessionId,
            Instant.now(),
            sha256(input.scrubbedText()),  // hash, never store PII
            result.urgencyLevel(),
            result.symptoms().size(),
            result.requiresImmediateHumanReview(),
            AI_MODEL_USED,
            result.processingTimeMs()
        );
        auditRepo.save(entry); // immutable append-only table
    }
}
\`\`\`

**Layer 5 — Resilience (patient safety fallback):**
\`\`\`java
@Service
public class IntakeResilienceService {
    @CircuitBreaker(name = "intake-ai", fallbackMethod = "humanTriage")
    public IntakeResult processIntake(IntakeInput input) {
        return aiIntakeService.process(input);
    }

    // Fallback: if AI is unavailable, route to human triage
    public IntakeResult humanTriage(IntakeInput input, Throwable ex) {
        log.error("AI intake failed, routing to human triage: {}", ex.getMessage());
        notificationService.alertTriageNurse(input.sessionId(), "AI unavailable — manual review needed");
        return IntakeResult.requiresHumanReview("AI service temporarily unavailable");
    }
}
\`\`\``,
    },
  ],

  // ─── PHASE 4 LESSON 16 ─────────────────────────────────────────────────────
  'pe-p4-l16': [
    {
      id: 'pe-p4-l16-onboarding-scenario',
      type: 'concept',
      title: 'Day-1 Onboarding: How a New Hire Uses the Prompt Library',
      content: `Here is how a well-built team prompt library transforms a new hire's first week. This is the UX story your library should be able to tell.

---

**Without a prompt library (what typically happens):**
> Day 1: Aarav joins the backend team. He wants to understand the codebase.
> He opens Claude and types: "explain this code to me" — pastes 300 lines of OrderService.
> Gets a generic explanation. No mention of the team's specific patterns.
> Spends 2 hours going back and forth asking follow-up questions.
> Day 3: He needs to write tests. Asks a colleague "how do we test services here?"
> Gets a verbal explanation, then spends 30 min recreating the test setup.
> Day 5: Writes his first PR. Description is written from memory — doesn't match team's format.

**With a prompt library (what it should look like):**
> Day 1: Aarav is shown the prompt library at \`/internal/prompts\`.
> He finds \`codebase/explain-class.txt\` — a prompt pre-loaded with the team's tech stack and conventions.
> Pastes OrderService, gets a team-context explanation including "notice how we use DomainException — that's our standard."
> 20 minutes to understand the class.
> Day 3: Finds \`testing/service-unit-test.txt\` — generates tests matching the team's given/when/then convention in one call.
> Day 5: Uses \`git/pr-description.txt\` with his git diff — perfect PR description in 30 seconds.

---

**The prompt library interface developers should see:**

\`\`\`
$ curl -s http://internal-tools/prompts | jq '.[] | {key, description, tags}'

{
  "key": "code-review/general-review",
  "description": "Review Java code for correctness, security, and maintainability",
  "tags": ["code-review", "java", "spring-boot"]
}
{
  "key": "testing/service-unit-test",
  "description": "Generate JUnit 5 + Mockito unit tests for a Spring Boot service method",
  "tags": ["testing", "junit5", "mockito"]
}
{
  "key": "debugging/exception-diagnosis",
  "description": "Diagnose a Java exception with root cause and fix",
  "tags": ["debugging", "exceptions", "production"]
}
{
  "key": "documentation/javadoc-writer",
  "description": "Write complete Javadoc for a Java method or class",
  "tags": ["documentation", "javadoc", "api"]
}
\`\`\`

---

**Team prompt library KPIs — measure these monthly:**

| Metric | How to measure | Target |
|---|---|---|
| Adoption rate | Unique users / total devs | > 80% of team |
| Most-used prompts | API call count per prompt key | Know your top 5 |
| Avg time to first useful output | Measure in dev survey | < 60 seconds |
| Prompt failure rate | Parse errors + bad output reports | < 5% |
| Prompt improvement velocity | PRs to /prompts per month | > 2/month |
| Onboarding improvement | New hire ramp time (survey) | 20% faster than baseline |

---

**The architecture team lead checklist — is your prompt library production-ready?**

- [ ] All prompts follow RCTFC structure (enforced by CI quality checker)
- [ ] Every prompt has at least 3 test cases
- [ ] Eval suite runs on every PR to /prompts
- [ ] Prompts are versioned with changelogs
- [ ] New hire documentation includes prompt library as a day-1 resource
- [ ] Monthly prompt quality review meeting on the calendar
- [ ] Token usage tracked per prompt (cost visibility)
- [ ] PII scrubbing confirmed active before every external AI call
- [ ] Circuit breaker configured (AI service is not infallible)
- [ ] On-call runbook updated with "what to do if AI service is down"`,
    },
  ],
};

// ─── Apply function ─────────────────────────────────────────────────────────

export function applyPromptEngineeringEnhancements<L extends {
  id: string;
  sections: Array<{ id: string; type: string; title: string; content: string }>;
  checkpoints: string[];
}>(lessons: L[]): L[] {
  return lessons.map((lesson) => {
    const extra = PE_LESSON_ENHANCEMENTS[lesson.id];
    if (!extra || extra.length === 0) return lesson;

    // Insert enhancement sections before the last summary section
    const summaryIdx = lesson.sections.findIndex((s) => s.type === 'summary');
    const insertAt = summaryIdx >= 0 ? summaryIdx : lesson.sections.length;

    const newSections = [
      ...lesson.sections.slice(0, insertAt),
      ...extra,
      ...lesson.sections.slice(insertAt),
    ];

    return { ...lesson, sections: newSections };
  });
}
