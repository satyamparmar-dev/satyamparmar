// Prompt Engineering for Java Developers — Course Data

import { applyPromptEngineeringEnhancements } from './lessonEnhancements';

const STORAGE_KEY = 'pe_completed_lessons';

export type SectionType = 'why' | 'analogy' | 'concept' | 'code' | 'task' | 'summary';

export interface CourseSection {
  id: string;
  type: SectionType;
  title: string;
  content: string;
}

export interface CourseLesson {
  id: string;
  phase: number;
  lesson: number;
  title: string;
  subtitle: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  tags: string[];
  sections: CourseSection[];
  checkpoints: string[];
}

export interface CoursePhase {
  id: string;
  number: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  totalDuration: string;
}

export const COURSE_PHASES: CoursePhase[] = [
  {
    id: 'pe-phase-1',
    number: 1,
    title: 'Prompt Fundamentals',
    description: 'The mental model, anatomy of a great prompt, zero/few-shot patterns, and how model parameters shape output.',
    icon: '🧱',
    color: '#7c3aed',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
    totalDuration: '4h',
  },
  {
    id: 'pe-phase-2',
    number: 2,
    title: 'Core Techniques',
    description: 'Chain-of-Thought reasoning, structured output, reusable Java-dev templates, and iterative refinement.',
    icon: '⚙️',
    color: '#0891b2',
    gradient: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
    totalDuration: '5h',
  },
  {
    id: 'pe-phase-3',
    number: 3,
    title: 'Advanced Patterns',
    description: 'System prompts, multi-step decomposition, RAG-aware prompting, and tool-use prompt design for seniors.',
    icon: '🔬',
    color: '#d97706',
    gradient: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
    totalDuration: '5h',
  },
  {
    id: 'pe-phase-4',
    number: 4,
    title: 'Team Lead & Architect',
    description: 'Prompt versioning, automated evaluation, enterprise safety patterns, and building team prompt libraries.',
    icon: '🏗️',
    color: '#dc2626',
    gradient: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
    totalDuration: '4h',
  },
];

const RAW_COURSE_LESSONS: CourseLesson[] = [

  // ─── PHASE 1 ───────────────────────────────────────────────────────────────

  {
    id: 'pe-p1-l1',
    phase: 1,
    lesson: 1,
    title: 'What Is Prompt Engineering?',
    subtitle: 'The mental model every Java developer needs before writing a single prompt.',
    duration: '45 min',
    difficulty: 'Beginner',
    tags: ['fundamentals', 'mental model', 'LLM basics'],
    sections: [
      {
        id: 'pe-p1-l1-why',
        type: 'why',
        title: 'Why This Matters',
        content: `You already use AI tools every day — GitHub Copilot, Claude, ChatGPT. But most developers use them like a search engine: type a vague question, get a vague answer, shrug, move on.

**Prompt engineering changes that.** It turns AI from a lucky-sometimes toy into a reliable engineering tool.

Real numbers from enterprise Java teams:
- Code review time: 45 min → 4 min per PR
- Bug investigation first-pass: 60% accuracy → 91% with structured prompts
- Onboarding doc writing: 3 hours → 20 minutes

The difference between those before/after numbers is almost entirely **how the prompt was written** — not which model was used.`,
      },
      {
        id: 'pe-p1-l1-analogy',
        type: 'analogy',
        title: 'The SQL Analogy',
        content: `Think about how you talk to a database.

You don't just say *"give me users"*. You write:
\`\`\`sql
SELECT id, name, email
FROM users
WHERE status = 'active' AND created_at > '2024-01-01'
ORDER BY name ASC
LIMIT 100;
\`\`\`

You specify **what table**, **which columns**, **what conditions**, and **what order**. The database doesn't guess — you tell it exactly what you want.

**An LLM is the same.** It's a function that maps your input to output. The more precisely you define the input, the more useful the output. Prompt engineering is learning the "query language" for AI models.

| SQL | Prompt Engineering |
|---|---|
| SELECT columns | Specify output format |
| WHERE conditions | Add constraints |
| FROM table | Give context/role |
| ORDER BY | Set priority/style |
| LIMIT | Set length/scope |`,
      },
      {
        id: 'pe-p1-l1-concept',
        type: 'concept',
        title: 'The AI Input-Output Model',
        content: `An LLM is a **stateless function**: \`f(prompt) → completion\`.

Every time you call it, it has no memory of past calls (unless you include history). The entire context for the answer must be in the prompt.

**Three things determine output quality:**

1. **Prompt quality** — what you write (your control)
2. **Model capability** — what the model knows (model's limit)
3. **Temperature/parameters** — randomness dial (your control)

You control 2 out of 3. That's why prompt engineering matters.

**Where Java developers use prompts daily:**

| Task | Bad prompt | Good prompt result |
|---|---|---|
| Debug NPE | "fix my bug" | Root cause + fix in 30 sec |
| Write unit test | "write tests" | Full JUnit5 test class with edge cases |
| Review PR | "review this" | Structured review: bugs, style, security |
| Write Javadoc | "document this" | Complete @param/@return with examples |
| Explain legacy code | "what does this do" | Line-by-line explanation + diagram |
| Architecture advice | "best approach?" | Trade-off analysis with Spring Boot context |

**The key insight:** The AI already knows how to do all of these tasks. Your prompt is the **instructions file** that tells it *which* version of that knowledge to use and *how* to format it for you.`,
      },
      {
        id: 'pe-p1-l1-code',
        type: 'code',
        title: 'Bad vs Good Prompts — Real Java Dev Examples',
        content: `**Example 1: Debugging a NullPointerException**

BAD (vague, zero context):
\`\`\`
fix my NullPointerException
\`\`\`

GOOD (role + context + exact error + code):
\`\`\`
You are a senior Spring Boot developer.

I have a NullPointerException in my service layer. Here is the full stack trace:

java.lang.NullPointerException: Cannot invoke "String.length()" because "str" is null
  at com.myapp.service.OrderService.processOrder(OrderService.java:47)
  at com.myapp.controller.OrderController.createOrder(OrderController.java:23)

Here is OrderService.java line 40–55:

\`\`\`java
public void processOrder(OrderRequest request) {
    String orderId = request.getOrderId();  // line 47: NPE here
    int len = orderId.length();
    // ... rest of method
}
\`\`\`

The OrderRequest object comes from a REST endpoint accepting JSON.

Task: Identify the root cause, explain why it happens, and provide a fix with null-safety best practices.
\`\`\`

**Why the good prompt wins:**
- "Senior Spring Boot developer" → activates enterprise Java knowledge
- Stack trace → AI knows exactly which line
- The actual code → AI can see what's wrong
- "Null-safety best practices" → gets Optional/validation advice, not just an if-null check

---

**Example 2: Generating a unit test**

BAD:
\`\`\`
write tests for my service
\`\`\`

GOOD:
\`\`\`
You are a Java testing expert using JUnit 5 and Mockito.

Write unit tests for this Spring Boot service method:

\`\`\`java
@Service
public class PaymentService {
    private final PaymentGateway gateway;
    private final OrderRepository orderRepo;

    public PaymentResult processPayment(String orderId, BigDecimal amount) {
        Order order = orderRepo.findById(orderId)
            .orElseThrow(() -> new OrderNotFoundException(orderId));
        return gateway.charge(order.getCustomerId(), amount);
    }
}
\`\`\`

Requirements:
- Use @ExtendWith(MockitoExtension.class)
- Cover: happy path, order not found, gateway throws exception
- Use given/when/then structure with descriptive method names
- Mock PaymentGateway and OrderRepository
\`\`\``,
      },
      {
        id: 'pe-p1-l1-task',
        type: 'task',
        title: 'Upgrade 3 Real Prompts',
        content: `**Task:** Take 3 prompts you've used this week with any AI tool and upgrade them.

**Template to fill in:**

\`\`\`
Original prompt: [what you wrote]
Problem with it: [why it was vague]
Upgraded prompt:
  - Role: You are a [specific expert]...
  - Context: [relevant background]
  - Task: [exact ask]
  - Format: [how you want the output]
  - Constraints: [what to avoid/include]
\`\`\`

**Common daily Java dev prompts to upgrade:**
1. "Explain this code" → add the code, the language version, ask for an analogy
2. "Write a Spring Boot endpoint" → add your existing code style, entity classes, what the endpoint should do
3. "Review my code" → add the code, what it does, specific concerns (performance? security? style?)

After the upgrade, test both versions side-by-side. The quality difference will be obvious.`,
      },
      {
        id: 'pe-p1-l1-summary',
        type: 'summary',
        title: 'What You Just Learned',
        content: `- **Prompt engineering** is the skill of writing instructions that reliably extract useful output from LLMs
- An LLM is a **stateless function** — your prompt must contain all context it needs
- You control 2 of 3 output quality factors: **prompt quality** and **parameters**
- Vague prompts get vague answers. Specific prompts (role + context + task + format) get precise, actionable answers
- The same model gives dramatically different results depending on how you prompt it — you've seen the before/after examples`,
      },
    ],
    checkpoints: [
      'Why is an LLM called "stateless"? What does that mean for how you write prompts?',
      'Name the 3 factors that determine LLM output quality. Which 2 do you control?',
      'What is the difference between a zero-context prompt and a structured prompt? Give a Java example.',
    ],
  },

  {
    id: 'pe-p1-l2',
    phase: 1,
    lesson: 2,
    title: 'Anatomy of a Great Prompt',
    subtitle: 'The RCTFC model: Role, Context, Task, Format, Constraints — with real Java enterprise examples.',
    duration: '50 min',
    difficulty: 'Beginner',
    tags: ['prompt anatomy', 'RCTFC', 'templates'],
    sections: [
      {
        id: 'pe-p1-l2-why',
        type: 'why',
        title: 'Why This Matters',
        content: `Most developers write prompts the same way they write Google searches — one or two words, hoping the AI figures out the rest.

The result: generic, half-useful answers that need 3 rounds of "no, I meant..." follow-ups.

**The RCTFC model** (Role, Context, Task, Format, Constraints) is a 5-part mental checklist. Fill in all 5, and you'll get a usable answer on the first try — nearly every time.

This isn't theory. Senior engineers at banks and e-commerce companies use prompt templates in their CI/CD pipelines that follow exactly this structure.`,
      },
      {
        id: 'pe-p1-l2-concept',
        type: 'concept',
        title: 'The RCTFC Model',
        content: `Each part of a prompt does a specific job:

**R — Role**
Tell the AI *who to be*. This activates a specific knowledge domain and writing style.
- "You are a senior Java architect" → enterprise patterns, trade-offs
- "You are a Spring Security expert" → auth, JWT, OAuth2 focus
- "You are a technical writer for Java docs" → clear prose, @param style

**C — Context**
Give the AI the background it needs. What is the code for? What is the existing stack?
- Stack: Spring Boot 3.2, Java 21, PostgreSQL, Kafka
- Situation: "We are migrating from monolith to microservices"
- Existing code: paste relevant classes

**T — Task**
State *exactly* what you want done. Use action verbs: Review, Generate, Explain, Refactor, Debug, Compare.
Avoid: "look at this" or "what do you think?"

**F — Format**
Tell it how to structure the answer.
- "Reply with a numbered list"
- "Reply as a JSON object with fields: issue, severity, fix"
- "Use bullet points, max 5"
- "Give a before/after code comparison"

**C — Constraints**
Set limits and guard rails:
- "Do not use external libraries, only Java stdlib"
- "Keep the answer under 300 words"
- "Use Java 17+ features only"
- "Do not rewrite the entire class — only the affected method"

| Part | Question it answers | If you skip it... |
|---|---|---|
| Role | Who is answering? | Generic, unfocused response |
| Context | What's the situation? | Wrong assumptions, hallucinations |
| Task | What should be done? | Vague or off-topic answer |
| Format | How to present it? | Wall of text, hard to use |
| Constraints | What are the limits? | Violates your requirements |`,
      },
      {
        id: 'pe-p1-l2-code',
        type: 'code',
        title: 'RCTFC Applied — 4 Java Dev Scenarios',
        content: `**Scenario 1: Code Review**
\`\`\`
[Role] You are a senior Java engineer with expertise in Spring Boot and clean code principles.

[Context] I'm working on a payment processing service at a fintech company.
Stack: Java 21, Spring Boot 3.2, JPA/Hibernate, PostgreSQL.
This method processes refunds.

[Task] Review the following method for correctness, security risks, and maintainability issues:

\`\`\`java
public void processRefund(String txnId, double amount) {
    Transaction txn = repo.findById(txnId).get();
    txn.setAmount(txn.getAmount() - amount);
    txn.setStatus("refunded");
    repo.save(txn);
    emailService.send(txn.getUserEmail(), "Refund processed: " + amount);
}
\`\`\`

[Format] Reply as a structured list:
1. Critical bugs (must fix)
2. Security issues
3. Code quality improvements
For each issue: problem description + suggested fix with code.

[Constraints] Java 21 idiomatic style. Do not suggest switching to reactive/WebFlux.
\`\`\`

---

**Scenario 2: Writing Javadoc**
\`\`\`
[Role] You are a technical documentation writer for Java enterprise software.

[Context] This is a public API method in a banking SDK used by client developers.
Method: transfers funds between accounts.

[Task] Write complete Javadoc for this method:

\`\`\`java
public TransferResult transfer(String fromAccountId, String toAccountId,
                                BigDecimal amount, Currency currency)
                                throws InsufficientFundsException, AccountNotFoundException
\`\`\`

[Format] Standard Javadoc format with @param, @return, @throws, and one usage example in @code block.

[Constraints] Assume the reader is an external developer who hasn't seen the source code.
Max 15 lines.
\`\`\`

---

**Scenario 3: Architecture Decision**
\`\`\`
[Role] You are a Java solutions architect with 10+ years of microservices experience.

[Context] We have a Spring Boot monolith serving 50k daily users.
We need to extract the "notifications" feature (email + SMS + push) into its own service.
Current notification volume: ~200k events/day.

[Task] Compare two approaches:
A) Direct HTTP call from monolith to new notification microservice
B) Event-driven via Apache Kafka topic

[Format] A comparison table with columns: Criteria, Option A, Option B, Recommendation.
Then 3-5 bullet points on the recommended approach and why.

[Constraints] We already run Kafka in our stack. Focus on operational complexity and reliability trade-offs.
\`\`\`

---

**Scenario 4: Explain Legacy Code**
\`\`\`
[Role] You are a senior developer doing a code walkthrough for a junior team member.

[Context] This is a 5-year-old batch processing class in a logistics platform.
The junior developer has 1 year of Java experience.

[Task] Explain what this class does, line by line, in plain English:

[paste the class here]

[Format]
1. One paragraph: what the class does overall
2. Then section-by-section explanation with the actual code snippet quoted
3. Flag any "gotchas" or non-obvious behaviours

[Constraints] No jargon without explanation. Relate concepts to things a junior would know (loops, if statements, etc.).
\`\`\``,
      },
      {
        id: 'pe-p1-l2-task',
        type: 'task',
        title: 'Build Your Personal Prompt Template File',
        content: `**Task:** Create a \`prompt-templates.md\` file in your project repo with at least 4 templates you'll actually use.

**Starter templates to customize:**

\`\`\`markdown
## Code Review Template
[Role] You are a senior Java engineer reviewing production code.
[Context] Stack: [your stack here]. This code does: [description].
[Task] Review for: correctness, edge cases, security, and performance.
[Code] \`\`\`java [paste code] \`\`\`
[Format] Numbered list: Critical → Major → Minor issues. Each with: problem + fix.
[Constraints] Java [version]. Keep fixes within the existing design pattern.

---

## Unit Test Generator
[Role] Java testing expert using JUnit 5 and Mockito.
[Task] Write unit tests for this method: [paste method]
[Context] Class: [class name], Purpose: [what it does], Dependencies: [list them]
[Format] One @Test method per case. Cover: happy path, boundary, exceptions.
[Constraints] @ExtendWith(MockitoExtension.class). Given/when/then structure.

---

## PR Description Generator
[Role] Technical writer for software engineering teams.
[Task] Write a PR description for these changes: [paste git diff or summary]
[Format] Markdown with sections: Summary (2 sentences), Changes (bulleted), Testing done, How to test.
[Constraints] Max 300 words. Link to JIRA ticket if present.

---

## Exception Investigation
[Role] Senior Java debugger specializing in production incidents.
[Context] Production environment, Spring Boot [version], [brief feature context].
[Task] Analyze this exception and stack trace: [paste exception]
[Format] 1) Root cause in plain English. 2) Why it happens. 3) Fix. 4) How to prevent recurrence.
[Constraints] Fix must be backward-compatible.
\`\`\``,
      },
      {
        id: 'pe-p1-l2-summary',
        type: 'summary',
        title: 'What You Just Learned',
        content: `- **RCTFC** (Role, Context, Task, Format, Constraints) is your 5-part checklist for every prompt
- Each part eliminates a different class of bad responses: wrong expertise, wrong assumptions, vague output, unusable format, or constraint violations
- Skipping even one part reduces response quality — context is the most commonly skipped and most costly to omit
- Storing your prompt templates as markdown files in your repo is a professional practice that saves hours per week`,
      },
    ],
    checkpoints: [
      'What does each letter of RCTFC stand for? What "failure mode" does each part prevent?',
      'Write a RCTFC prompt from scratch to ask an AI to refactor a slow SQL query in a Spring Data JPA repository.',
      'Why is "Context" the most critical part to include when debugging production issues?',
    ],
  },

  {
    id: 'pe-p1-l3',
    phase: 1,
    lesson: 3,
    title: 'Zero-Shot, One-Shot & Few-Shot',
    subtitle: 'When to use examples in your prompts — and how many — with Java-specific patterns.',
    duration: '40 min',
    difficulty: 'Beginner',
    tags: ['few-shot', 'zero-shot', 'examples', 'in-context learning'],
    sections: [
      {
        id: 'pe-p1-l3-analogy',
        type: 'analogy',
        title: 'The New Employee Analogy',
        content: `Imagine you hire a brilliant new developer. They're extremely capable but unfamiliar with your team's conventions.

**Zero-shot:** "Write a controller for the users endpoint."
They'll write *something* valid, but maybe not following your team's conventions.

**One-shot:** "Here's an example of how we write controllers: [shows OrderController]. Now write one for users."
They copy the pattern — same structure, same annotations, same error handling style.

**Few-shot:** "Here are 3 controllers from our codebase. Now write the users one."
They internalize the pattern more deeply and handle edge cases they saw in the examples.

**This is exactly how LLMs work** — they learn the pattern *from context*, not from training. That's why it's called "in-context learning."`,
      },
      {
        id: 'pe-p1-l3-concept',
        type: 'concept',
        title: 'The Three Shot Types',
        content: `**Zero-shot:** No examples. Just the task.
- Use when: the task is standard and unambiguous (e.g., "Explain what a HashMap is")
- Risk: output format varies, tone varies, assumptions vary

**One-shot:** One example of input → output.
- Use when: you have a specific output format or style to match
- Great for: PR descriptions, commit messages, ticket summaries

**Few-shot (2–5 examples):** Multiple examples showing the pattern.
- Use when: the task has a non-obvious output pattern, or classification/extraction tasks
- Most powerful for: classification (bug severity, ticket type), data extraction, custom code patterns

**When to use which — Java dev cheat sheet:**

| Task | Shot type | Reason |
|---|---|---|
| Explain a Java concept | Zero-shot | LLM knows Java well enough |
| Write Javadoc in your team's style | One-shot | Shows the exact format once |
| Classify bug severity (P1/P2/P3) | Few-shot | Needs examples of each class |
| Generate controller following your architecture | Few-shot | Your architecture is not standard |
| Extract fields from log lines | Few-shot | Input/output pattern needs demos |
| Write a unit test in your team's style | One or few-shot | Testing conventions vary by team |`,
      },
      {
        id: 'pe-p1-l3-code',
        type: 'code',
        title: 'Few-Shot in Practice',
        content: `**Example: Classifying a bug ticket (few-shot)**

Without examples, the AI guesses what "P1/P2/P3" means. With examples, it matches your team's definitions exactly.

\`\`\`
You are a triage engineer. Classify the following bug ticket as P1, P2, or P3 using these definitions:

Examples:
Input: "Payment processing fails for all users — checkout page broken"
Output: P1 — reason: revenue-impacting, all users affected, core feature broken

Input: "Export to CSV produces wrong date format for EU locale users"
Output: P2 — reason: data integrity issue, subset of users, workaround exists (manual fix)

Input: "Button hover colour is slightly off on the Settings page"
Output: P3 — reason: cosmetic only, no functional impact

Now classify this ticket:
Input: "Login fails for users with special characters (@, +) in their email address"
Output:
\`\`\`

The AI will now output in your exact format and apply your team's definitions.

---

**Example: Generating code in your team's style (few-shot)**

\`\`\`
You are a Java developer on our team. Follow these patterns exactly:

Example 1 — Repository method:
\`\`\`java
// Our pattern: Optional return, method name format: findByXxxAndYyy
public Optional<Order> findByIdAndStatus(String id, OrderStatus status) {
    return orderRepository.findByIdAndStatus(id, status);
}
\`\`\`

Example 2 — Service method:
\`\`\`java
// Our pattern: throws BusinessException (not RuntimeException),
// logs at entry with INFO, logs errors with ERROR + context map
public Order getActiveOrder(String customerId) {
    log.info("Fetching active order for customer={}", customerId);
    return orderRepository.findByCustomerIdAndStatus(customerId, ACTIVE)
        .orElseThrow(() -> new BusinessException("NO_ACTIVE_ORDER", customerId));
}
\`\`\`

Now write a service method to:
- Find all pending payments for a given merchant
- Throw BusinessException if none found
- Follow our logging and naming pattern
\`\`\``,
      },
      {
        id: 'pe-p1-l3-summary',
        type: 'summary',
        title: 'What You Just Learned',
        content: `- **Zero-shot** works for well-known tasks; **one-shot** locks in format; **few-shot** teaches complex patterns
- LLMs do **in-context learning** — examples in the prompt teach them your specific conventions
- Use few-shot for classification, extraction, and code generation that must match your team's conventions
- 2–5 examples is the sweet spot; more than 5 usually doesn't help and wastes token budget`,
      },
    ],
    checkpoints: [
      'Explain in-context learning in one sentence.',
      'When would you choose few-shot over zero-shot for a Java dev task? Give a concrete example.',
      'What is the risk of using zero-shot for code generation on a team with non-standard conventions?',
    ],
  },

  {
    id: 'pe-p1-l4',
    phase: 1,
    lesson: 4,
    title: 'Temperature, Tokens & Model Parameters',
    subtitle: 'Control the randomness dial — know when to use 0.0 vs 0.7 vs 1.0 and why it matters for Java tasks.',
    duration: '35 min',
    difficulty: 'Beginner',
    tags: ['temperature', 'tokens', 'parameters', 'determinism'],
    sections: [
      {
        id: 'pe-p1-l4-analogy',
        type: 'analogy',
        title: 'The Thermostat Analogy',
        content: `Temperature in an LLM is literally like a thermostat for creativity.

**Temperature 0.0** = Ice cold. The model picks the single most probable next word every time. Like a machine printing the same result repeatedly — perfect for when you need reproducible output.

**Temperature 0.5** = Room temperature. A little variation, but stays sensible. Good for conversation and documentation.

**Temperature 1.0+** = Hot. The model considers less-probable options too. Output gets creative, diverse — sometimes brilliant, sometimes nonsensical.

For a Java developer: when you're debugging or generating boilerplate, you want cold. When you're brainstorming architecture alternatives or writing blog posts, you want warm.`,
      },
      {
        id: 'pe-p1-l4-concept',
        type: 'concept',
        title: 'Key Parameters Explained',
        content: `**Temperature (0.0 – 1.0+)**
Controls randomness of token selection.

| Task type | Recommended temperature | Why |
|---|---|---|
| Bug fix / code generation | 0.0 – 0.1 | Deterministic, correct, reproducible |
| JSON/structured data extraction | 0.0 | Must be exact, no variation |
| Classification (severity, type) | 0.0 | Pick the right class, no creativity |
| Code explanation / Javadoc | 0.2 – 0.4 | Slight variation OK, stays factual |
| PR descriptions / commit messages | 0.3 – 0.5 | Some natural language variety |
| Architecture brainstorming | 0.6 – 0.8 | Want diverse options |
| Creative naming / copywriting | 0.8 – 1.0 | Full creative range |

---

**Max tokens (max_tokens)**
The hard limit on output length. Set this to avoid runaway responses and control cost.

- Code review → 500–1000 tokens (enough for a structured list)
- Full class generation → 2000–4000 tokens
- Quick explanation → 200–400 tokens

*Tip: Always set max_tokens explicitly in production code. Never leave it at default.*

---

**Stop sequences**
Tell the model to stop generating when it hits a specific string.
Useful for: extracting specific sections, stopping after code blocks, controlling list length.

Example: \`stop_sequences: ["---", "END_OF_REVIEW"]\` — the model stops when it writes that string.

---

**Top-p (nucleus sampling)**
An alternative to temperature. Controls what % of probable tokens are considered.
- top_p = 0.1 → only top 10% most likely tokens
- top_p = 0.9 → top 90% (more variety)

*In practice: use temperature OR top_p, not both. Temperature is simpler to reason about for most tasks.*`,
      },
      {
        id: 'pe-p1-l4-code',
        type: 'code',
        title: 'Setting Parameters in Java (Anthropic SDK)',
        content: `**Rule: set parameters explicitly in production code. Never rely on defaults.**

\`\`\`java
// For a code review task — deterministic output needed
MessageCreateParams reviewParams = MessageCreateParams.builder()
    .model("claude-sonnet-4-5")
    .maxTokens(1000)           // enough for a structured review
    // temperature defaults to 1.0 — override to 0.1 for code tasks
    .addUserMessage(buildReviewPrompt(code))
    .build();

// For architecture brainstorming — want diverse ideas
MessageCreateParams brainstormParams = MessageCreateParams.builder()
    .model("claude-sonnet-4-5")
    .maxTokens(2000)
    // higher temperature → more creative, diverse options
    .addUserMessage(buildBrainstormPrompt(problem))
    .build();
\`\`\`

**Practical temperature settings by task type:**
\`\`\`java
public enum PromptTask {
    CODE_REVIEW,    // temp: 0.1
    BUG_FIX,        // temp: 0.0
    DOCUMENTATION,  // temp: 0.3
    BRAINSTORM,     // temp: 0.7
    CREATIVE_NAMING // temp: 0.9
}

public double getTemperature(PromptTask task) {
    return switch (task) {
        case BUG_FIX        -> 0.0;
        case CODE_REVIEW    -> 0.1;
        case DOCUMENTATION  -> 0.3;
        case BRAINSTORM     -> 0.7;
        case CREATIVE_NAMING -> 0.9;
    };
}
\`\`\``,
      },
      {
        id: 'pe-p1-l4-summary',
        type: 'summary',
        title: 'What You Just Learned',
        content: `- **Temperature** controls the randomness/creativity dial: 0.0 = deterministic, 1.0 = creative
- For Java code tasks (debug, fix, generate), use **temperature 0.0–0.1** — you want correct, not creative
- Always set **max_tokens** explicitly in production code to control cost and response length
- **Stop sequences** let you control where the model stops — useful for structured extraction
- Never use temperature and top_p together; temperature is simpler and sufficient for most tasks`,
      },
    ],
    checkpoints: [
      'What temperature should you use for generating a bug fix? For brainstorming architecture options? Explain why.',
      'What happens if you leave max_tokens at default in a production system?',
      'Explain what a stop sequence does. Give a practical Java dev use case.',
    ],
  },

  // ─── PHASE 2 ───────────────────────────────────────────────────────────────

  {
    id: 'pe-p2-l5',
    phase: 2,
    lesson: 5,
    title: 'Chain-of-Thought Prompting',
    subtitle: 'Make AI reason step-by-step through complex problems — debugging, design decisions, algorithm choice.',
    duration: '50 min',
    difficulty: 'Intermediate',
    tags: ['chain-of-thought', 'CoT', 'reasoning', 'step-by-step'],
    sections: [
      {
        id: 'pe-p2-l5-why',
        type: 'why',
        title: 'Why This Matters',
        content: `**Without CoT:** Ask an AI "what's the best database for this use case?" — you get an answer, but no reasoning. You can't tell if it's right.

**With CoT:** You get the thought process: "First, let's look at the read/write ratio. Then consistency requirements. Then scale..." — and now you can evaluate whether the reasoning is sound.

Chain-of-Thought is essential when:
- Debugging complex issues where the cause isn't obvious
- Making architecture decisions that have trade-offs
- Analyzing performance problems
- Any task where **correctness of reasoning matters** as much as the answer`,
      },
      {
        id: 'pe-p2-l5-concept',
        type: 'concept',
        title: 'How Chain-of-Thought Works',
        content: `CoT works by adding reasoning instructions to your prompt. You're telling the model: "Don't just give me the answer — show your work."

**Three CoT techniques:**

**1. Simple trigger phrase**
Add "Let's think step by step" or "Walk me through your reasoning" to any prompt.
Works surprisingly well for a 5-word addition.

**2. Explicit step instructions**
Tell the model exactly what steps to follow:
\`\`\`
First, identify all possible causes of this issue.
Then, for each cause, check if it matches the evidence.
Then, propose a fix for the most likely cause.
Finally, suggest how to verify the fix.
\`\`\`

**3. Structured reasoning template**
Pre-fill the thinking structure, letting the model fill in the content:
\`\`\`
Observations: [model fills this]
Hypotheses: [model fills this]
Evidence for each: [model fills this]
Conclusion: [model fills this]
\`\`\`

**When CoT is most valuable for Java devs:**

| Scenario | CoT benefit |
|---|---|
| Production incident investigation | Forces elimination of red herrings |
| Choosing between Spring patterns | Surfaces trade-offs explicitly |
| Optimizing a slow query/algorithm | Steps through complexity analysis |
| Architecture review | Considers each dimension systematically |
| Explaining why something is a bug | Traces the execution path |`,
      },
      {
        id: 'pe-p2-l5-code',
        type: 'code',
        title: 'CoT Prompts for Java Debugging',
        content: `**Example 1: Production incident investigation (CoT)**
\`\`\`
You are a senior Java SRE investigating a production incident.

[Context]
- Spring Boot 3.2 microservice: OrderService
- Symptom: Response times spiked from 50ms to 8000ms at 14:32 UTC
- No deployment around that time
- CPU and memory are normal
- Database connection pool: 10/10 connections in use (was 2/10 before spike)

[Stack trace from logs]
HikariPool-1 - Connection is not available, request timed out after 30000ms
  at com.zaxxer.hikari.pool.HikariPool.getConnection(HikariPool.java:213)
  at com.myapp.service.OrderService.findOrder(OrderService.java:78)

[Task] Diagnose this step by step.

Work through these steps:
Step 1: What does the "Connection is not available" error tell us?
Step 2: Why would all 10 connections be in use suddenly?
Step 3: What changed at 14:32 if no deployment happened?
Step 4: What is the most likely root cause?
Step 5: What are 3 things to check immediately?
Step 6: What is the fix?
\`\`\`

---

**Example 2: Algorithm selection with reasoning**
\`\`\`
You are a senior Java developer helping with algorithm selection.

[Context]
We have a list of 10 million product records. We need to find all products
that match a customer's search query by name prefix (e.g., "iph" should match
"iPhone", "iPhone 15", "iPhone case").

[Task] Walk me through selecting the best data structure and algorithm.

Use this reasoning chain:
1. What are the performance requirements? (search latency, indexing time, memory)
2. What operations do we need? (prefix match, fuzzy match, exact match)
3. Compare: ArrayList linear scan vs HashMap vs Trie vs inverted index
4. Consider: is this in-memory or will it use a database?
5. Final recommendation with trade-offs
\`\`\``,
      },
      {
        id: 'pe-p2-l5-summary',
        type: 'summary',
        title: 'What You Just Learned',
        content: `- Chain-of-Thought forces the model to **show its work**, which makes the answer verifiable and trustworthy
- Three techniques: simple trigger phrase, explicit step instructions, structured template
- Most valuable for debugging, architecture decisions, and algorithm analysis — tasks where reasoning correctness matters
- CoT prompts are longer but produce dramatically better results for complex multi-step problems`,
      },
    ],
    checkpoints: [
      'What is the simplest CoT trigger you can add to any prompt?',
      'For a production incident with a HikariCP connection timeout, what investigation steps would you ask the AI to work through?',
      'When is CoT NOT necessary? (When would a simple zero-shot prompt suffice?)',
    ],
  },

  {
    id: 'pe-p2-l6',
    phase: 2,
    lesson: 6,
    title: 'Structured Output Prompting',
    subtitle: 'Get JSON, tables, and typed data from AI every time — essential for integrating AI into Java systems.',
    duration: '55 min',
    difficulty: 'Intermediate',
    tags: ['JSON', 'structured output', 'parsing', 'extraction'],
    sections: [
      {
        id: 'pe-p2-l6-why',
        type: 'why',
        title: 'Why This Matters',
        content: `Every time you integrate AI output into a Java application, you need to **parse** that output. If the output is free text, parsing is fragile and will break.

Structured output prompting solves this: you tell the AI exactly what JSON shape to produce, and you get back something \`ObjectMapper.readValue()\` can handle reliably.

This is how production AI integrations work at companies like Stripe, Shopify, and Atlassian — the AI is a structured data extraction and generation engine, not a chatbot.`,
      },
      {
        id: 'pe-p2-l6-concept',
        type: 'concept',
        title: 'Three Structured Output Techniques',
        content: `**1. Schema-in-prompt**
Tell the model the exact JSON schema you want.
Best for: custom shapes specific to your domain.

**2. Prefill technique**
Start the AI's answer with \`{\` or the opening of a JSON object — the model is forced to complete it.
Best for: when the model keeps wrapping JSON in prose.

**3. Few-shot structured output**
Show example input→output pairs in the format you want.
Best for: extraction tasks from unstructured text (log lines, error messages, customer feedback).

**Key rules for reliable structured output:**
- Always say "Respond ONLY with valid JSON. No explanation, no markdown fences."
- Define the schema explicitly (field names, types, allowed values for enums)
- For nested objects, show the full structure
- Validate the output with Jackson before using it — AI can still make mistakes`,
      },
      {
        id: 'pe-p2-l6-code',
        type: 'code',
        title: 'JSON Extraction in a Java Service',
        content: `**Prompt for structured code review output:**
\`\`\`
You are a code review tool. Analyze the following Java method and return ONLY a valid JSON array.
No explanation. No markdown. Pure JSON only.

Schema:
[
  {
    "severity": "CRITICAL" | "MAJOR" | "MINOR",
    "category": "bug" | "security" | "performance" | "style",
    "line": <line number or null>,
    "issue": "<description of the problem>",
    "suggestion": "<concrete fix>"
  }
]

Java method to review:
\`\`\`java
[paste method here]
\`\`\`
\`\`\`

---

**Java service to call this and parse the result:**
\`\`\`java
public record ReviewIssue(
    String severity,
    String category,
    Integer line,
    String issue,
    String suggestion
) {}

@Service
public class AiCodeReviewService {
    private final AnthropicOkHttpClient client;
    private final ObjectMapper mapper;

    public List<ReviewIssue> review(String javaCode) throws Exception {
        String prompt = buildReviewPrompt(javaCode);

        Message response = client.messages().create(
            MessageCreateParams.builder()
                .model("claude-haiku-4-5")
                .maxTokens(1500)
                .addUserMessage(prompt)
                .build()
        );

        String raw = extractText(response);
        // Strip markdown fences if model adds them despite instructions
        String json = raw.replaceAll("(?s)\`\`\`json\\s*|\\s*\`\`\`", "").trim();

        return mapper.readValue(json,
            mapper.getTypeFactory().constructCollectionType(List.class, ReviewIssue.class));
    }

    private String extractText(Message msg) {
        return msg.content().stream()
            .filter(b -> b instanceof ContentBlock.TextBlock)
            .map(b -> ((ContentBlock.TextBlock) b).text())
            .findFirst().orElse("[]");
    }
}
\`\`\`

**Always validate before using:**
\`\`\`java
List<ReviewIssue> issues = reviewService.review(code);
// Guard: if AI returns empty or malformed JSON, fail gracefully
if (issues == null || issues.isEmpty()) {
    log.warn("AI review returned no issues — check prompt or model response");
    return Collections.emptyList();
}
\`\`\``,
      },
      {
        id: 'pe-p2-l6-summary',
        type: 'summary',
        title: 'What You Just Learned',
        content: `- Structured output = tell the AI the exact JSON schema and say "respond ONLY with valid JSON"
- Three techniques: schema-in-prompt, prefill (start the response with \`{\`), few-shot examples
- Always strip markdown fences (\`\`\`json ... \`\`\`) before parsing — models add them despite instructions
- Validate/parse output with Jackson before using it — AI is not 100% reliable for structure`,
      },
    ],
    checkpoints: [
      'What does "prefill technique" mean and when should you use it?',
      'Write a prompt that asks AI to extract bug severity, file name, and line number from a stack trace as JSON.',
      'What Java code do you need to strip before passing AI output to ObjectMapper?',
    ],
  },

  {
    id: 'pe-p2-l7',
    phase: 2,
    lesson: 7,
    title: 'Prompt Templates for Java Developers',
    subtitle: '10 ready-to-use prompt templates for the tasks you do every day: code review, debugging, docs, tests.',
    duration: '60 min',
    difficulty: 'Intermediate',
    tags: ['templates', 'code review', 'debugging', 'documentation', 'tests'],
    sections: [
      {
        id: 'pe-p2-l7-why',
        type: 'why',
        title: 'Why Templates Beat Ad-Hoc Prompts',
        content: `Every time you write an ad-hoc prompt from scratch, you lose 2–5 minutes and get inconsistent results. Templates solve both problems:

- **Speed:** 30 seconds to fill in a template vs 2 minutes to craft a prompt from scratch
- **Consistency:** Same quality every time, not dependent on your current mental state
- **Sharing:** Team members use the same prompts → same quality review, same coding style, same doc standards

Think of prompt templates as **reusable tools in your IDE**, just like live templates (intelliJ \`sout\`, \`psvm\`) — but for AI.`,
      },
      {
        id: 'pe-p2-l7-concept',
        type: 'concept',
        title: '10 Essential Java Dev Prompt Templates',
        content: `**Template categories:**

1. Code Review (general)
2. Security Review
3. Performance Analysis
4. Unit Test Generator
5. Integration Test Generator
6. Javadoc Writer
7. Exception Debugger
8. Refactoring Assistant
9. PR Description Generator
10. Architecture Decision Record (ADR) Writer

Each follows RCTFC structure. You'll see them all in the Code section below.`,
      },
      {
        id: 'pe-p2-l7-code',
        type: 'code',
        title: 'The 10 Templates',
        content: `\`\`\`markdown
## Template 1: General Code Review
Role: Senior Java engineer with clean code expertise.
Context: [stack], [feature context], [code purpose]
Task: Review for correctness, maintainability, and edge cases.
Format: Critical → Major → Minor. Each: issue + fix with code snippet.
Constraints: [Java version]. Stay within existing design. Max 10 issues.

## Template 2: Security Review
Role: Java application security engineer (OWASP expertise).
Context: [feature], [data sensitivity: PII/financial/internal]
Task: Identify OWASP Top 10 vulnerabilities in this code.
Format: For each: vulnerability type, CWE ID, affected lines, remediation.
Constraints: Focus on injection, auth, sensitive data exposure, access control.

## Template 3: Performance Analysis
Role: Java performance engineer.
Context: [stack], [load: N requests/sec], [current metrics if known]
Task: Identify performance bottlenecks.
Format: List by impact (High/Med/Low). Each: problem + profiling evidence + fix.
Constraints: Assume standard JVM tuning already done. Focus on code-level fixes.

## Template 4: Unit Test Generator
Role: Java testing expert (JUnit 5, Mockito).
Context: Class: [name], Purpose: [desc], Dependencies: [list]
Task: Write unit tests for: [method name(s)]
Format: @ExtendWith(MockitoExtension.class). One test per case. Given/when/then.
Constraints: Cover: happy path, null inputs, boundary values, exceptions. No Spring context.

## Template 5: Integration Test Generator
Role: Spring Boot integration testing expert.
Context: [service name], Dependencies: [DB/queue/external services]
Task: Write @SpringBootTest integration tests for [feature].
Format: @Testcontainers for DB. @MockBean for external services. Assert on DB state.
Constraints: Use TestRestTemplate or MockMvc. Include test data setup and teardown.

## Template 6: Javadoc Writer
Role: Technical writer for Java enterprise APIs.
Context: [is this public API / internal / SDK?], audience: [internal / external devs]
Task: Write complete Javadoc for: [paste method signature]
Format: @param for each param, @return, @throws for each exception, @code example.
Constraints: Assume reader hasn't seen source. No jargon without explanation. Max 20 lines.

## Template 7: Exception Debugger
Role: Senior Java SRE with 10+ years debugging production issues.
Context: Service: [name], Environment: [prod/staging], Stack: [Spring Boot version]
Task: Diagnose this exception: [paste full stack trace]
Format: 1) Root cause (plain English). 2) Why it happens. 3) Immediate fix. 4) Prevention.
Constraints: Check for thread safety, resource leaks, and misconfiguration patterns.

## Template 8: Refactoring Assistant
Role: Senior Java architect specializing in clean code and SOLID principles.
Context: This code handles [feature]. It was written [timeframe]. Pain point: [describe]
Task: Refactor for [goal: readability / testability / performance / maintainability].
Format: Explain each change and why. Show before/after for each refactoring.
Constraints: [Java version]. Preserve existing behavior. No breaking changes to public API.

## Template 9: PR Description Generator
Role: Technical writer for engineering teams.
Context: This PR [what it does]. JIRA: [ticket]. Review focus: [main concern]
Task: Write a PR description from these changes: [paste git diff summary or list of changes]
Format: ## Summary (2 sentences), ## Changes (bulleted), ## Testing done, ## How to test.
Constraints: Max 300 words. Link JIRA. Flag breaking changes.

## Template 10: Architecture Decision Record
Role: Java solutions architect with enterprise microservices experience.
Context: System: [brief description], Current problem: [what you're deciding]
Task: Write an ADR for this decision: [decision title]
Format: ## Context, ## Decision, ## Alternatives considered, ## Consequences (positive + negative).
Constraints: Be opinionated. State the decision clearly. List real trade-offs.
\`\`\``,
      },
      {
        id: 'pe-p2-l7-task',
        type: 'task',
        title: 'Build a Prompt Template Registry',
        content: `**Task:** Create a \`PromptTemplateRegistry.java\` class in your project that stores these templates as constants and can fill them in programmatically.

\`\`\`java
@Component
public class PromptTemplateRegistry {

    private static final String CODE_REVIEW = """
        You are a senior Java engineer with clean code expertise.
        Context: Stack: %s. Code purpose: %s
        Task: Review the following Java code for correctness, maintainability, edge cases, and code smells.
        Format: Critical → Major → Minor issues. Each: issue description + fix with code snippet.
        Constraints: Java 21. Stay within existing design. Max 10 issues.

        Code to review:
        \`\`\`java
        %s
        \`\`\`
        """;

    private static final String UNIT_TEST = """
        You are a Java testing expert using JUnit 5 and Mockito.
        Context: Class: %s. Purpose: %s. Dependencies: %s
        Task: Write unit tests for the method: %s
        Format: @ExtendWith(MockitoExtension.class). One @Test per case. Given/when/then.
        Constraints: Cover happy path, nulls, boundary values, exceptions. No Spring context.

        Method to test:
        \`\`\`java
        %s
        \`\`\`
        """;

    public String codeReview(String stack, String purpose, String code) {
        return CODE_REVIEW.formatted(stack, purpose, code);
    }

    public String unitTest(String className, String purpose, String deps,
                           String methodName, String methodCode) {
        return UNIT_TEST.formatted(className, purpose, deps, methodName, methodCode);
    }
}
\`\`\``,
      },
      {
        id: 'pe-p2-l7-summary',
        type: 'summary',
        title: 'What You Just Learned',
        content: `- Templates turn 2-minute ad-hoc prompting into 30-second fill-in-the-blank tasks
- The 10 most valuable Java dev templates: review, security, performance, test gen (unit + integration), Javadoc, exception debug, refactor, PR description, ADR
- Store templates as constants in a \`PromptTemplateRegistry\` class for programmatic use
- Sharing templates with your team standardizes AI output quality across the team`,
      },
    ],
    checkpoints: [
      'What is the difference between Template 4 (Unit Test) and Template 5 (Integration Test) in terms of what they test and how?',
      'When would you use Template 10 (ADR) vs Template 3 (Performance Analysis)?',
      'Add a new template to the PromptTemplateRegistry for generating Spring Boot exception handler (@ControllerAdvice) classes.',
    ],
  },

  {
    id: 'pe-p2-l8',
    phase: 2,
    lesson: 8,
    title: 'Iterative Prompt Refinement',
    subtitle: 'From first draft to production-quality prompt — the 3-pass method and how to diagnose bad outputs.',
    duration: '45 min',
    difficulty: 'Intermediate',
    tags: ['refinement', 'iteration', 'debugging prompts', 'quality'],
    sections: [
      {
        id: 'pe-p2-l8-concept',
        type: 'concept',
        title: 'The 3-Pass Refinement Method',
        content: `Even experienced prompt engineers don't write perfect prompts on the first try. The skill is in *diagnosing* what went wrong and fixing it efficiently.

**Pass 1 — Draft:** Write the RCTFC prompt and run it. Note what's wrong.

**Pass 2 — Diagnose:** Identify the failure category:

| Failure | Symptom | Fix |
|---|---|---|
| Wrong expertise | Answer feels generic / misses your stack | Improve Role — be more specific |
| Wrong assumptions | AI made up context | Add more Context — be explicit |
| Vague output | Answer doesn't address what you needed | Tighten Task — use action verb |
| Wrong format | Wall of text, wrong structure | Add explicit Format instruction |
| Constraint violation | Too long, uses wrong library | Add Constraints |
| Hallucination | Invented API or method | Add "if unsure, say so" |

**Pass 3 — Refine and Test:** Make one change at a time. Test again. Repeat.

**The golden rule:** Change one thing per iteration. If you change 5 things at once, you don't know which fix worked.`,
      },
      {
        id: 'pe-p2-l8-code',
        type: 'code',
        title: 'Live Refinement Example',
        content: `**Starting prompt (bad):**
\`\`\`
write a spring boot filter
\`\`\`
Output: Generic \`OncePerRequestFilter\` with TODO comments. Not useful.

---

**Pass 1 — Add Role + Task:**
\`\`\`
You are a Spring Boot security engineer.
Write a servlet filter that validates JWT tokens on every request.
\`\`\`
Output: Basic JWT filter, but no error handling, no Spring Security integration. Still generic.

---

**Pass 2 — Add Context + Constraints:**
\`\`\`
You are a Spring Boot security engineer.

Context:
- Spring Boot 3.2, Spring Security 6
- JWT signed with RS256 (RSA private/public key pair)
- Token is in the Authorization header: "Bearer <token>"
- We use JJWT library (0.11.x) for parsing

Write a filter that:
1. Extracts the JWT from the Authorization header
2. Validates signature and expiry using JJWT
3. Sets the SecurityContext if valid
4. Returns 401 JSON response if invalid (not redirect)

Constraints: Extend OncePerRequestFilter. Do not use deprecated JJWT APIs. Handle expired vs invalid token differently in the error response.
\`\`\`
Output: Clean, production-ready filter with proper error handling.

---

**Pass 3 — Add Format for code reuse:**
\`\`\`
[same as pass 2, plus:]
Format:
1. The filter class (complete, no TODOs)
2. The @Bean registration in SecurityConfig
3. One unit test for the happy path
Provide each as a separate code block with filename as header.
\`\`\`
Output: Copy-paste ready code with all 3 files.

---

**What changed across 3 passes:**
- Pass 1: Removed wrong expertise (added specific security role)
- Pass 2: Added Context (specific library, token location) + Constraints (error format)
- Pass 3: Added Format (multiple files, filenames) for usability`,
      },
      {
        id: 'pe-p2-l8-summary',
        type: 'summary',
        title: 'What You Just Learned',
        content: `- Perfect prompts require iteration — expect 2–3 passes for complex tasks
- The 3-pass method: Draft → Diagnose failure category → Targeted fix
- Change ONE thing per iteration so you know what improved the result
- Six failure categories: wrong expertise, wrong assumptions, vague task, wrong format, constraint violation, hallucination
- Each failure has a specific fix in the RCTFC framework`,
      },
    ],
    checkpoints: [
      'What are the 6 failure categories for bad prompts? Give one example of each.',
      'Why should you change only one thing per refinement iteration?',
      'A prompt generates code that uses a library you explicitly said not to use. Which failure category is this and how do you fix it?',
    ],
  },

  // ─── PHASE 3 ───────────────────────────────────────────────────────────────

  {
    id: 'pe-p3-l9',
    phase: 3,
    lesson: 9,
    title: 'System Prompts & Persona Design',
    subtitle: 'Build specialized AI assistants for your team — the Spring Boot expert, the code reviewer, the doc writer.',
    duration: '55 min',
    difficulty: 'Advanced',
    tags: ['system prompt', 'persona', 'AI assistant', 'specialization'],
    sections: [
      {
        id: 'pe-p3-l9-concept',
        type: 'concept',
        title: 'System Prompts vs User Prompts',
        content: `Every Claude/OpenAI API call has two layers:

**System prompt:** Persistent instructions set once for the session. Defines who the AI is, what it knows, how it behaves, and what it refuses.

**User prompt:** Per-request instructions. What to do with this specific input.

Think of it as:
- System prompt = **job description** for the AI assistant
- User prompt = **today's task** for that assistant

**Why this matters:** A well-designed system prompt means your user prompts can be shorter and more focused. You set the expertise, constraints, and output style once — not on every call.

**Four components of a production system prompt:**

1. **Role definition** — specific expertise and perspective
2. **Scope** — what it handles and what it declines
3. **Output style** — format defaults, verbosity, code style
4. **Safety/guardrails** — what it won't do or say`,
      },
      {
        id: 'pe-p3-l9-code',
        type: 'code',
        title: 'Production System Prompts for Java Teams',
        content: `**Spring Boot Code Reviewer:**
\`\`\`
You are a senior Spring Boot code reviewer at a financial technology company.

Expertise:
- Spring Boot 3.x, Spring Security 6, Spring Data JPA
- Java 21 features (records, sealed classes, pattern matching)
- Clean Architecture and SOLID principles
- OWASP Top 10 for Java web applications
- Performance patterns: connection pooling, caching, async processing

When reviewing code:
1. Start with a one-line verdict: APPROVE / REQUEST CHANGES / NEEDS DISCUSSION
2. List Critical issues first (security vulnerabilities, data corruption risks)
3. Then Major issues (correctness bugs, performance problems)
4. Then Minor issues (style, naming, minor improvements)
5. For each issue: quote the problematic code, explain why it's a problem, show the fix

Output format: Use headers (##), code blocks for all code snippets.

Decline requests unrelated to Java/Spring code review.
Do not praise code excessively — be direct and constructive.
\`\`\`

---

**Java Documentation Writer:**
\`\`\`
You are a technical documentation writer for enterprise Java APIs.

Your audience is professional Java developers consuming this API or library.

Standards:
- Follow Javadoc conventions strictly: @param, @return, @throws, @since, @see
- Every public method gets complete Javadoc — no exceptions
- Include at least one @code usage example for non-trivial methods
- Use precise language: avoid "this method gets the..." — say what it does and why

Tone: Professional, precise, no filler words.

When given a class or method without context, ask one clarifying question about the business domain before writing.

Do not generate documentation for private or package-private methods unless explicitly asked.
\`\`\`

---

**Java in your codebase:**
\`\`\`java
@Configuration
public class AiAssistantConfig {

    @Value("classpath:prompts/code-reviewer.txt")
    private Resource codeReviewerPrompt;

    @Bean("codeReviewerClient")
    public AnthropicOkHttpClient codeReviewerClient() throws IOException {
        // System prompt loaded from classpath file — version-controlled
        String systemPrompt = codeReviewerPrompt.getContentAsString(StandardCharsets.UTF_8);

        // Note: system prompt is passed per-request in the Messages API
        // Store it here and inject it into each MessageCreateParams
        return AnthropicOkHttpClient.builder()
            .fromEnv()
            .build();
    }
}
\`\`\``,
      },
      {
        id: 'pe-p3-l9-summary',
        type: 'summary',
        title: 'What You Just Learned',
        content: `- System prompts set **persistent behavior** — role, scope, style, guardrails
- User prompts contain **per-request tasks** — they can be shorter when the system prompt is well-designed
- A production system prompt has 4 parts: role, scope, output style, safety guardrails
- Store system prompts as classpath text files — version-control them like code
- Build specialized assistants for your team's recurring tasks: reviewer, doc writer, debugger`,
      },
    ],
    checkpoints: [
      'What is the difference between a system prompt and a user prompt in API terms?',
      'Design a system prompt for a "Spring Data JPA Query Optimizer" assistant for your team.',
      'Why store system prompts as classpath files rather than Java string constants?',
    ],
  },

  {
    id: 'pe-p3-l10',
    phase: 3,
    lesson: 10,
    title: 'Multi-Step & Decomposed Prompts',
    subtitle: 'Break complex tasks into chained prompts — design reviews, migrations, and end-to-end code generation.',
    duration: '55 min',
    difficulty: 'Advanced',
    tags: ['prompt chaining', 'decomposition', 'multi-step', 'pipelines'],
    sections: [
      {
        id: 'pe-p3-l10-concept',
        type: 'concept',
        title: 'When to Decompose a Prompt',
        content: `**Single-step prompt:** Works for tasks that can be answered in one shot.
- "Write a Javadoc for this method" — one step, done.

**Multi-step prompt chain:** Required when:
1. The task has distinct phases that build on each other
2. The intermediate output needs validation before the next step
3. The total context needed exceeds what fits in one prompt
4. Different steps benefit from different temperatures or personas

**Classic Java dev multi-step scenarios:**

| Scenario | Step 1 | Step 2 | Step 3 |
|---|---|---|---|
| Feature planning | Requirements analysis | Technical design | Task breakdown |
| Code migration | Understand old code | Identify risks | Write new code |
| Bug investigation | Reproduce/understand | Root cause | Fix + test |
| API design | Use cases | Endpoint design | Contract/schema |

**The pipeline pattern:** Output of step N is input of step N+1. Each step refines or builds on the previous.`,
      },
      {
        id: 'pe-p3-l10-code',
        type: 'code',
        title: 'Prompt Chain: Legacy Code Migration',
        content: `**Use case:** Migrate a legacy Java 8 DAO class to Spring Data JPA (Java 21 style).

**Step 1 — Understand the existing code:**
\`\`\`
You are a senior Java architect.
Task: Analyze this legacy DAO class and list:
1. Every database operation it performs (with SQL if visible)
2. The domain entities it reads/writes
3. Any business logic that is NOT just CRUD (flag these — they must be preserved)
4. Dependencies it has (DataSource, Connection, etc.)

Output as structured JSON:
{
  "operations": [...],
  "entities": [...],
  "businessLogic": [...],
  "dependencies": [...]
}

[paste legacy DAO]
\`\`\`

**Step 2 — Generate the JPA entities (using Step 1 output):**
\`\`\`
You are a Spring Data JPA expert.

Here is the analysis of the legacy DAO I need to migrate:
[paste Step 1 JSON output]

Task: Generate the JPA entity classes for these entities.
- Use Java 21 records for value objects
- @Entity, @Table, @Column with correct nullable/length constraints
- One file per entity

Format: Each entity as a separate code block with filename.
Constraints: Java 21, Spring Boot 3.2, Hibernate 6.
\`\`\`

**Step 3 — Generate the JPA Repository (using Step 1 + 2 output):**
\`\`\`
You are a Spring Data JPA expert.

Entities created in Step 2: [paste entity list]
Operations needed from Step 1: [paste operations list]
Business logic to preserve: [paste business logic list]

Task: Generate the Spring Data JPA repository interfaces and any required @Query methods.

Rules:
- Use JPA derived query methods where the name is self-documenting
- Use @Query with JPQL (not native SQL) for complex queries
- For business logic: create a separate @Service class (do not put logic in the repository)

Constraints: No native queries. No \`@Transactional\` in repository layer.
\`\`\`

**Java orchestration code:**
\`\`\`java
@Service
public class MigrationAssistantService {

    public MigrationResult migrate(String legacyDaoCode) {
        // Step 1: Analyze
        String analysisPrompt = buildAnalysisPrompt(legacyDaoCode);
        String analysisJson = callAi(analysisPrompt, 0.0);  // deterministic

        // Validate before proceeding
        DaoAnalysis analysis = parseAnalysis(analysisJson);

        // Step 2: Generate entities
        String entityPrompt = buildEntityPrompt(analysis);
        String entities = callAi(entityPrompt, 0.1);

        // Step 3: Generate repository
        String repoPrompt = buildRepoPrompt(analysis, entities);
        String repository = callAi(repoPrompt, 0.1);

        return new MigrationResult(analysis, entities, repository);
    }
}
\`\`\``,
      },
      {
        id: 'pe-p3-l10-summary',
        type: 'summary',
        title: 'What You Just Learned',
        content: `- Decompose complex tasks when phases are distinct, build on each other, or need validation between steps
- The pipeline pattern: each step's output becomes the next step's input
- Validate intermediate JSON output before passing to the next step — don't let errors cascade
- Different steps can have different temperatures (0.0 for analysis, 0.1 for code gen, 0.7 for brainstorm)
- Orchestrate multi-step chains in a Spring Service with clear step methods`,
      },
    ],
    checkpoints: [
      'Name 3 Java dev scenarios that require multi-step prompt chains rather than single prompts.',
      'Why validate intermediate output before passing it to the next step?',
      'In the migration example, why use temperature 0.0 for Step 1 but 0.1 for Steps 2–3?',
    ],
  },

  {
    id: 'pe-p3-l11',
    phase: 3,
    lesson: 11,
    title: 'RAG-Aware Prompting',
    subtitle: 'Write prompts that work with retrieved context — citations, conflicting info, and length management.',
    duration: '50 min',
    difficulty: 'Advanced',
    tags: ['RAG', 'retrieval', 'context injection', 'citations'],
    sections: [
      {
        id: 'pe-p3-l11-concept',
        type: 'concept',
        title: 'Prompting When You Inject Retrieved Context',
        content: `In RAG (Retrieval-Augmented Generation), you retrieve relevant documents and inject them into the prompt before sending to the AI. The AI then answers based on those documents.

This changes how you write prompts:

**Standard prompt:** "What is the deployment process for our app?"
→ AI answers from training data (may be wrong for your specific setup)

**RAG prompt:** "Based on ONLY the following deployment docs, what is the deployment process?"
→ AI answers from your actual docs (correct for your setup)

**Five RAG prompt rules:**

1. **"Based ONLY on the following context"** — prevent the AI from mixing in training data knowledge
2. **"If the answer is not in the context, say 'I don't have that information'"** — prevent hallucination
3. **"Cite the source for each fact (document name / section)"** — make answers verifiable
4. **Separate context from question clearly** — use XML tags or headers
5. **Include context quality instructions** — "If context is outdated (before 2022), note that"`,
      },
      {
        id: 'pe-p3-l11-code',
        type: 'code',
        title: 'RAG Prompt Templates for Java Teams',
        content: `**Template: Internal docs Q&A (e.g., Confluence, internal wikis)**
\`\`\`
You are a helpful assistant for the engineering team at [Company].

Answer questions ONLY using the context documents provided below.
Rules:
- Do not use knowledge from outside the provided context
- If the answer is not in the context: say "I don't have that information in the provided docs"
- Cite sources: after each factual claim, add [Doc: <title>, Section: <heading>]
- If two documents contradict each other: note the conflict and cite both

<context>
[Document 1: Deployment Guide v3.2]
[content...]

[Document 2: Infrastructure FAQ]
[content...]
</context>

<question>
[user question]
</question>
\`\`\`

---

**Template: Code-aware RAG (injecting your codebase context)**
\`\`\`
You are a senior developer familiar with our codebase.

You have been given the following relevant source files:

<codebase_context>
// File: src/main/java/com/app/service/PaymentService.java
[file contents]

// File: src/main/java/com/app/model/Payment.java
[file contents]
</codebase_context>

Based ONLY on the above code:
[question about the code]

If you cannot answer from the provided files, say "This is not covered by the provided files."
\`\`\`

---

**Java service for RAG prompting:**
\`\`\`java
@Service
public class RagPromptBuilder {

    public String buildRagPrompt(List<RetrievedDocument> docs, String userQuestion) {
        StringBuilder ctx = new StringBuilder("<context>\\n");
        for (RetrievedDocument doc : docs) {
            ctx.append("[").append(doc.title()).append("]\\n");
            ctx.append(doc.content()).append("\\n\\n");
        }
        ctx.append("</context>\\n\\n");

        return """
            Answer the question using ONLY the context below.
            If the answer is not in the context, say "I don't have that information."
            Cite sources after each fact as [Doc: title].

            %s

            <question>%s</question>
            """.formatted(ctx.toString(), userQuestion);
    }
}
\`\`\``,
      },
      {
        id: 'pe-p3-l11-summary',
        type: 'summary',
        title: 'What You Just Learned',
        content: `- RAG prompts must explicitly instruct the AI to use ONLY the provided context — otherwise it blends training knowledge in
- Always include a "say I don't know if not in context" instruction to prevent hallucination
- Citations make RAG answers verifiable — critical for enterprise/compliance use cases
- Use XML tags (\`<context>\`, \`<question>\`) to clearly separate context from the question
- Handle conflicting documents explicitly: "if docs contradict, note the conflict and cite both"`,
      },
    ],
    checkpoints: [
      'What happens if you forget "use ONLY the following context" in a RAG prompt?',
      'Why are citations important in RAG-powered internal documentation assistants?',
      'How do you handle the case where two retrieved documents give conflicting information?',
    ],
  },

  {
    id: 'pe-p3-l12',
    phase: 3,
    lesson: 12,
    title: 'Tool Use Prompt Design',
    subtitle: 'Write prompts that describe Java methods as AI tools — from function signatures to error handling.',
    duration: '55 min',
    difficulty: 'Advanced',
    tags: ['tool use', 'function calling', 'agents', 'API design'],
    sections: [
      {
        id: 'pe-p3-l12-concept',
        type: 'concept',
        title: 'Prompting for Tool Use',
        content: `When you define tools (functions the AI can call), the **description** you write for each tool is itself a prompt. The quality of tool descriptions determines whether the AI calls the right tool, with the right parameters, at the right time.

**Tool description anatomy:**

1. **Tool name** — verb + noun, self-documenting: \`getOrderStatus\`, \`cancelOrder\`, \`searchProducts\`
2. **Tool description** — what it does, when to use it, what it returns
3. **Parameter descriptions** — exactly what each parameter should contain
4. **Usage hints** — when NOT to use this tool (helps the AI make better routing decisions)

**Common mistakes in tool descriptions:**

| Mistake | Example | Fix |
|---|---|---|
| Vague description | "Gets order info" | "Returns current order status, items, and shipping details for a given order ID" |
| No parameter guidance | param: orderId | "The 8-character alphanumeric order ID (format: ORD-XXXXX). Found in order confirmation emails." |
| Missing negative examples | — | "Use ONLY when the customer asks about an existing order. Do NOT use for order creation." |
| No return type hint | — | "Returns JSON with fields: status, estimatedDelivery, trackingNumber, or null if not yet shipped" |`,
      },
      {
        id: 'pe-p3-l12-code',
        type: 'code',
        title: 'Tool Descriptions in Java',
        content: `**Using Anthropic Java SDK annotations:**

\`\`\`java
// The @JsonClassDescription and @JsonPropertyDescription ARE your tool prompts
// Write them as carefully as you'd write any prompt

@JsonClassDescription(
    "Retrieve the current status and details of a customer order. " +
    "Use when the customer asks about an existing order, shipment, or delivery. " +
    "Do NOT use for order creation or cancellation."
)
public record GetOrderParams(
    @JsonPropertyDescription(
        "The unique order identifier. Format: ORD-XXXXX (8 alphanumeric chars). " +
        "Found in order confirmation emails and account order history."
    )
    String orderId
) {}

@JsonClassDescription(
    "Search the product catalog by keyword or category. " +
    "Use when customer is browsing products or asking about availability. " +
    "Returns up to 10 matching products with price and stock status. " +
    "Do NOT use if customer has already chosen a specific product — use getProductDetails instead."
)
public record SearchProductsParams(
    @JsonPropertyDescription(
        "Search keyword or phrase. Can be product name, brand, or category. " +
        "Examples: 'wireless headphones', 'Nike running shoes', 'laptop under 1000'"
    )
    String query,

    @JsonPropertyDescription(
        "Optional: filter by category. " +
        "Valid values: electronics, clothing, sports, home, books. " +
        "Omit for cross-category search."
    )
    @Nullable String category,

    @JsonPropertyDescription(
        "Optional: maximum price in USD as integer. Omit if customer didn't specify a budget."
    )
    @Nullable Integer maxPriceUsd
) {}
\`\`\`

---

**The system prompt when tools are defined:**
\`\`\`
You are a customer support assistant for ShopCo, an e-commerce platform.

You have access to the following tools. Use them to answer customer questions accurately.

Tool selection rules:
- Use getOrderStatus for order tracking questions
- Use searchProducts for browsing/discovery questions
- Use getProductDetails when the customer asks about a specific product
- Use submitReturnRequest ONLY after confirming the customer wants to initiate a return
- If uncertain which tool applies, ask one clarifying question before calling

NEVER make up information. If a tool returns no results, tell the customer honestly.
\`\`\``,
      },
      {
        id: 'pe-p3-l12-summary',
        type: 'summary',
        title: 'What You Just Learned',
        content: `- Tool descriptions ARE prompts — write them with the same care as user-facing prompts
- A good tool description: what it does, when to use it, what each parameter is, what it returns
- Include negative examples ("do NOT use when...") — helps the AI choose the right tool
- The system prompt should have tool routing rules: when to use which tool, what to do when uncertain
- Parameter descriptions are mini-prompts: include format hints, valid values, and examples`,
      },
    ],
    checkpoints: [
      'What are the 4 components of a well-described tool?',
      'Write a tool description for a \`getAccountBalance\` function in a banking chatbot.',
      'Why include "do NOT use when..." in a tool description?',
    ],
  },

  // ─── PHASE 4 ───────────────────────────────────────────────────────────────

  {
    id: 'pe-p4-l13',
    phase: 4,
    lesson: 13,
    title: 'Prompt Versioning & Governance',
    subtitle: 'Manage prompts like code — version control, A/B testing, and change management for team leads.',
    duration: '50 min',
    difficulty: 'Expert',
    tags: ['versioning', 'governance', 'A/B testing', 'team management'],
    sections: [
      {
        id: 'pe-p4-l13-concept',
        type: 'concept',
        title: 'Why Prompts Need Version Control',
        content: `A prompt is production code. Changing a prompt in a production system can silently break behavior — output format, tone, accuracy — without any compile error or test failure.

**What happens without prompt versioning:**
- Developer changes a prompt → behavior changes → users complain → nobody knows what changed
- Two developers edit the same prompt → one overwrites the other → regression
- You improve a prompt, it gets worse for some edge cases — no way to roll back

**Treat prompts exactly like code:**
- Store them in version control (Git)
- Use semantic versioning: \`code-reviewer-v1.2.3\`
- Review prompt changes in PRs
- Tag releases
- Keep a changelog

**Three storage strategies:**

| Strategy | When to use | Pros | Cons |
|---|---|---|---|
| Classpath files (.txt/.md) | Simple apps | Easy to review in PR | Needs redeploy to change |
| Database table | Dynamic, business-owned | Change without deploy | Needs UI/admin panel |
| Feature flag service | A/B testing | Gradual rollout | Most complexity |`,
      },
      {
        id: 'pe-p4-l13-code',
        type: 'code',
        title: 'Prompt Version Management in Spring Boot',
        content: `**Database-backed prompt registry:**
\`\`\`java
@Entity
@Table(name = "prompt_versions")
public class PromptVersion {
    @Id @GeneratedValue
    private Long id;

    private String promptKey;    // "code-reviewer", "doc-writer"
    private String version;      // "1.2.3"
    private String content;      // the actual prompt text
    private boolean active;      // only one active per promptKey

    @CreatedDate
    private Instant createdAt;
    private String createdBy;
    private String changeReason; // "improved security review instructions"
}

@Repository
public interface PromptVersionRepository extends JpaRepository<PromptVersion, Long> {
    Optional<PromptVersion> findByPromptKeyAndActiveTrue(String promptKey);
    List<PromptVersion> findByPromptKeyOrderByCreatedAtDesc(String promptKey);
}

@Service
public class PromptRegistry {
    private final PromptVersionRepository repo;
    private final ConcurrentHashMap<String, String> cache = new ConcurrentHashMap<>();

    public String getPrompt(String key) {
        return cache.computeIfAbsent(key, k ->
            repo.findByPromptKeyAndActiveTrue(k)
                .map(PromptVersion::getContent)
                .orElseThrow(() -> new IllegalStateException("No active prompt for: " + k))
        );
    }

    @CacheEvict  // call this after activating a new prompt version
    public void invalidateCache(String key) {
        cache.remove(key);
    }
}
\`\`\`

**Prompt changelog in Git (prompts/CHANGELOG.md):**
\`\`\`markdown
## code-reviewer v1.3.0 — 2026-04-10
Changed: Added OWASP injection check instructions
Reason: Missing SQL injection review in v1.2.x
Tested by: @sarah (20 PRs, 3 security issues found vs 1 in v1.2.x)

## code-reviewer v1.2.0 — 2026-03-01
Changed: Added Java 21 pattern matching guidance
Reason: Team migrated to Java 21 in Q1

## code-reviewer v1.1.0 — 2026-01-15
Changed: Added "max 10 issues" constraint
Reason: v1.0 returned 25+ issues per review — too noisy
\`\`\``,
      },
      {
        id: 'pe-p4-l13-summary',
        type: 'summary',
        title: 'What You Just Learned',
        content: `- Prompts are production code — they need version control, changelogs, and rollback capability
- Three storage strategies: classpath files (simple), database (dynamic), feature flags (A/B)
- Every prompt change needs: what changed, why it changed, and evidence it's better
- Review prompt changes in PRs just like code changes
- Cache active prompts in-memory — DB lookups on every AI call add unnecessary latency`,
      },
    ],
    checkpoints: [
      'What are 3 things that go wrong in production without prompt versioning?',
      'When would you choose database storage for prompts over classpath files?',
      'Design a schema for a prompt_versions table that supports A/B testing (two active versions simultaneously).',
    ],
  },

  {
    id: 'pe-p4-l14',
    phase: 4,
    lesson: 14,
    title: 'Prompt Testing & Evaluation',
    subtitle: 'Measure and improve prompt quality systematically — test cases, metrics, and automated evaluation.',
    duration: '55 min',
    difficulty: 'Expert',
    tags: ['evaluation', 'testing', 'metrics', 'LLM evaluation', 'evals'],
    sections: [
      {
        id: 'pe-p4-l14-concept',
        type: 'concept',
        title: 'What Makes a Good Prompt? Measuring It.',
        content: `You can't improve what you can't measure. Prompt evaluation is the discipline of measuring whether a prompt produces good outputs.

**Evaluation dimensions:**

| Dimension | What it measures | How to measure |
|---|---|---|
| Correctness | Is the answer factually right? | Test against known-answer cases |
| Format compliance | Does output match the schema? | Parse JSON, check required fields |
| Consistency | Same input → same output class? | Run 5x, check variation |
| Completeness | Does it cover all required points? | Rubric checklist |
| Latency | How fast? | p50/p95 response time |
| Token efficiency | Output tokens / usefulness ratio | Manual scoring per task |

**Building a prompt test suite:**

A prompt eval is essentially a unit test:
- **Input:** a sample input (e.g., a code snippet to review)
- **Expected:** the property you expect in the output (severity = CRITICAL for this SQL injection)
- **Assertion:** check the output has that property

*You can't assert exact text equality (AI is probabilistic) — but you CAN assert structural properties.*`,
      },
      {
        id: 'pe-p4-l14-code',
        type: 'code',
        title: 'Automated Prompt Evaluation in Java',
        content: `**Prompt test case structure:**
\`\`\`java
public record PromptTestCase(
    String name,
    String input,
    List<String> requiredKeywords,    // output must contain these
    List<String> forbiddenKeywords,   // output must NOT contain these
    String expectedJsonField,          // if structured output, check this field
    String expectedJsonValue           // expected value for that field
) {}

@SpringBootTest
public class CodeReviewPromptTest {
    @Autowired AiCodeReviewService reviewService;

    private static final List<PromptTestCase> TEST_CASES = List.of(
        new PromptTestCase(
            "SQL injection detection",
            """
            public User getUser(String username) {
                String sql = "SELECT * FROM users WHERE name = '" + username + "'";
                return jdbcTemplate.queryForObject(sql, User.class);
            }
            """,
            List.of("SQL injection", "CRITICAL", "PreparedStatement", "parameterized"),
            List.of("APPROVED", "no issues"),
            "severity", "CRITICAL"
        ),
        new PromptTestCase(
            "NPE risk detection",
            """
            public String getCity(User user) {
                return user.getAddress().getCity();
            }
            """,
            List.of("NullPointerException", "null"),
            List.of("APPROVED"),
            null, null
        )
    );

    @ParameterizedTest
    @MethodSource("testCases")
    void promptProducesCorrectReview(PromptTestCase tc) throws Exception {
        List<ReviewIssue> issues = reviewService.review(tc.input());
        String output = issues.toString().toLowerCase();

        tc.requiredKeywords().forEach(kw ->
            assertThat(output).containsIgnoringCase(kw)
        );
        tc.forbiddenKeywords().forEach(kw ->
            assertThat(output).doesNotContainIgnoringCase(kw)
        );
    }

    static Stream<PromptTestCase> testCases() {
        return TEST_CASES.stream();
    }
}
\`\`\`

**Regression test on prompt changes:**
\`\`\`java
@Test
void newPromptVersionNotWorseThanPrevious() {
    // Run same test cases against old and new prompt
    // New version must not fail any test case that old version passed
    int oldPassed = runEvals(OLD_PROMPT, TEST_CASES);
    int newPassed = runEvals(NEW_PROMPT, TEST_CASES);

    assertThat(newPassed).isGreaterThanOrEqualTo(oldPassed);
}
\`\`\``,
      },
      {
        id: 'pe-p4-l14-summary',
        type: 'summary',
        title: 'What You Just Learned',
        content: `- Prompt testing measures 5 dimensions: correctness, format compliance, consistency, completeness, token efficiency
- Assert structural properties (fields present, keywords in output) — not exact text equality
- Build a test suite with known-answer cases that runs against every prompt version change
- The new prompt version must not fail cases the old version passed — regression testing for prompts
- Automate eval runs in CI — treat prompt quality like code quality`,
      },
    ],
    checkpoints: [
      'Why can\'t you use exact string equality assertions for prompt test cases?',
      'Write a test case for a "detect hardcoded credentials" prompt that checks Java code.',
      'What is prompt regression testing and why does it matter when you release v2 of a prompt?',
    ],
  },

  {
    id: 'pe-p4-l15',
    phase: 4,
    lesson: 15,
    title: 'Enterprise Prompt Safety Patterns',
    subtitle: 'Input validation, PII scrubbing, output sanitization, and compliance guardrails for production systems.',
    duration: '55 min',
    difficulty: 'Expert',
    tags: ['safety', 'PII', 'compliance', 'GDPR', 'input validation', 'enterprise'],
    sections: [
      {
        id: 'pe-p4-l15-concept',
        type: 'concept',
        title: 'The 5-Layer Safety Model',
        content: `Any enterprise AI feature needs 5 layers of safety. No single layer is sufficient on its own.

**Layer 1 — Input Gate**
Validate and sanitize user input before building the prompt.
- Reject inputs over a size limit (prevent context stuffing attacks)
- Detect and block prompt injection attempts
- Strip or mask PII before it enters the prompt

**Layer 2 — Prompt Architecture**
Design the prompt to resist manipulation.
- Use XML tags to clearly separate context from instructions
- Use system prompts for persistent constraints (not user-editable)
- Never interpolate raw user input into system prompts

**Layer 3 — Output Validation**
Parse and validate AI output before returning it to users or using it in business logic.
- Validate JSON schema
- Check for PII in output (AI may repeat PII from context)
- Check for inappropriate content if the system handles public users

**Layer 4 — Observability**
Log enough to detect and investigate incidents.
- Log input hash + metadata (not raw PII)
- Log model used, token count, latency, stop_reason
- Alert on anomalies: unusually high token counts, high error rates

**Layer 5 — Resilience**
Handle AI service failures gracefully.
- Circuit breaker: stop calling AI if error rate is high
- Fallback: deterministic response for critical paths
- Rate limiting per user/tenant`,
      },
      {
        id: 'pe-p4-l15-code',
        type: 'code',
        title: 'PII Scrubbing & Prompt Injection Guard',
        content: `**PII scrubber (GDPR-compliant):**
\`\`\`java
@Component
public class PiiScrubber {
    // Patterns for common PII in enterprise Java apps
    private static final Pattern CREDIT_CARD = Pattern.compile(
        "\\\\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})\\\\b"
    );
    private static final Pattern EMAIL = Pattern.compile(
        "[a-zA-Z0-9._%+\\\\-]+@[a-zA-Z0-9.\\\\-]+\\\\.[a-zA-Z]{2,}"
    );
    private static final Pattern PHONE = Pattern.compile(
        "\\\\b(?:\\\\+?1[-.]?)?\\\\(?\\\\d{3}\\\\)?[-.]?\\\\d{3}[-.]?\\\\d{4}\\\\b"
    );
    private static final Pattern PAN = Pattern.compile(     // Indian PAN number
        "[A-Z]{5}[0-9]{4}[A-Z]{1}"
    );

    public String scrub(String input) {
        return input
            .replaceAll(CREDIT_CARD.pattern(), "[CARD_REDACTED]")
            .replaceAll(EMAIL.pattern(),       "[EMAIL_REDACTED]")
            .replaceAll(PHONE.pattern(),       "[PHONE_REDACTED]")
            .replaceAll(PAN.pattern(),         "[PAN_REDACTED]");
    }
}
\`\`\`

**Prompt injection guard:**
\`\`\`java
@Component
public class PromptInjectionGuard {
    private static final List<Pattern> INJECTION_PATTERNS = List.of(
        Pattern.compile("ignore (previous|all|above) instructions", CASE_INSENSITIVE),
        Pattern.compile("you are now", CASE_INSENSITIVE),
        Pattern.compile("new persona:", CASE_INSENSITIVE),
        Pattern.compile("system:", CASE_INSENSITIVE),
        Pattern.compile("\\\\[INST\\\\]|\\\\[/INST\\\\]"),           // Llama-style injection
        Pattern.compile("</?(system|user|assistant)>")      // XML tag injection
    );

    public enum InputVerdict { SAFE, SUSPICIOUS, BLOCKED }

    public InputVerdict check(String userInput) {
        long matches = INJECTION_PATTERNS.stream()
            .filter(p -> p.matcher(userInput).find())
            .count();
        if (matches >= 2) return InputVerdict.BLOCKED;
        if (matches == 1) return InputVerdict.SUSPICIOUS;
        return InputVerdict.SAFE;
    }
}
\`\`\`

**Service wiring all safety layers:**
\`\`\`java
@Service
public class SafeAiService {
    private final PiiScrubber scrubber;
    private final PromptInjectionGuard guard;
    private final AnthropicOkHttpClient client;

    public String ask(String userInput) {
        // Layer 1: Input gate
        if (userInput.length() > 10_000) throw new InputTooLargeException();

        InputVerdict verdict = guard.check(userInput);
        if (verdict == BLOCKED) throw new PromptInjectionException();

        String safeInput = scrubber.scrub(userInput);

        // Layer 2: Build prompt with safe input
        String prompt = buildPrompt(safeInput);

        // Layer 3: Call AI with circuit breaker (see Resilience4j)
        Message response = callWithCircuitBreaker(prompt);

        String output = extractText(response);

        // Layer 3: Validate output
        String safeOutput = scrubber.scrub(output);  // AI may echo PII from context

        return safeOutput;
    }
}
\`\`\``,
      },
      {
        id: 'pe-p4-l15-summary',
        type: 'summary',
        title: 'What You Just Learned',
        content: `- The 5-layer safety model: Input Gate → Prompt Architecture → Output Validation → Observability → Resilience
- PII scrubbing with regex is the minimum requirement for GDPR compliance before sending data to external AI APIs
- Prompt injection is a real threat — detect and block manipulation attempts at the input layer
- Always scrub output too — AI may echo PII from context documents back in its response
- Never interpolate raw user input directly into system prompts — always through structured user message slots`,
      },
    ],
    checkpoints: [
      'What is prompt injection? Give a Java enterprise example of how it could be exploited.',
      'Why scrub AI output, not just AI input?',
      'Which of the 5 safety layers would catch a user sending a 50,000-word input to stuff the context window?',
    ],
  },

  {
    id: 'pe-p4-l16',
    phase: 4,
    lesson: 16,
    title: 'Building a Team Prompt Library',
    subtitle: 'Architect a shared prompt library for your team — registry, review process, and quality standards.',
    duration: '50 min',
    difficulty: 'Expert',
    tags: ['prompt library', 'team standards', 'architecture', 'developer experience'],
    sections: [
      {
        id: 'pe-p4-l16-why',
        type: 'why',
        title: 'Why This Matters at Architect Level',
        content: `When you're a team lead or architect, the question shifts from "how do I write a good prompt?" to "how do I ensure my whole team writes good prompts consistently?"

Without a prompt library:
- Each developer reinvents the same prompts independently
- Quality varies wildly — one dev's prompts are excellent, another's get useless output
- Same task (code review) behaves differently depending on who triggers it
- Prompt improvements don't benefit the whole team

With a shared prompt library:
- One improved prompt benefits everyone
- Standards are enforced at the library level, not per-developer
- New team members get working prompts on day 1
- You can measure and improve prompt quality at a team level`,
      },
      {
        id: 'pe-p4-l16-concept',
        type: 'concept',
        title: 'Prompt Library Architecture',
        content: `**Three-layer architecture:**

\`\`\`
┌─────────────────────────────────────────┐
│           Prompt Registry               │
│  (storage + versioning + retrieval)     │
├─────────────────────────────────────────┤
│        Prompt Catalog API               │
│  (what's available, what it does)       │
├─────────────────────────────────────────┤
│      Developer Interface               │
│  (IDE plugin, CLI, API endpoint)        │
└─────────────────────────────────────────┘
\`\`\`

**The Prompt Registry** stores prompts with metadata:
- Key (unique identifier)
- Version + changelog
- Author, review date
- Performance metrics (token count, eval score)
- Tags for discoverability

**The Catalog API** lets developers discover what's available:
\`GET /prompts\` — list all prompts
\`GET /prompts/{key}\` — get current version
\`GET /prompts/{key}/history\` — version history

**Team workflow for new prompts:**

1. Draft → add to PR with prompt file + test cases
2. Review: does it follow RCTFC? Does it have test cases?
3. Eval run: test cases must pass before merge
4. Merge → auto-deployed to prompt registry
5. Monitor: track token usage and quality metrics post-merge`,
      },
      {
        id: 'pe-p4-l16-code',
        type: 'code',
        title: 'Prompt Library Spring Service',
        content: `**Prompt catalog endpoint:**
\`\`\`java
@RestController
@RequestMapping("/internal/prompts")
public class PromptCatalogController {
    private final PromptRegistry registry;

    @GetMapping
    public List<PromptSummary> listPrompts() {
        return registry.getAll().stream()
            .map(p -> new PromptSummary(
                p.getKey(), p.getVersion(), p.getDescription(),
                p.getTags(), p.getAvgTokens(), p.getEvalScore()
            ))
            .toList();
    }

    @GetMapping("/{key}")
    public PromptDetail getPrompt(@PathVariable String key) {
        return registry.get(key)
            .map(p -> new PromptDetail(p.getKey(), p.getVersion(),
                p.getContent(), p.getUsageExample()))
            .orElseThrow(() -> new NotFoundException("Prompt not found: " + key));
    }
}
\`\`\`

**Prompt quality standards — enforce in CI:**
\`\`\`java
@Component
public class PromptQualityChecker {
    // Run before merging a new prompt to the library
    public List<String> check(String promptContent) {
        List<String> violations = new ArrayList<>();

        if (!promptContent.contains("You are") && !promptContent.contains("Role:"))
            violations.add("MISSING_ROLE: Prompt must have a role definition");

        if (promptContent.length() < 100)
            violations.add("TOO_SHORT: Prompt under 100 chars is likely missing context");

        if (!promptContent.contains("Format") && !promptContent.contains("Output:"))
            violations.add("MISSING_FORMAT: Specify output format to ensure parseable output");

        if (promptContent.contains("\${") && !promptContent.contains("Constraints"))
            violations.add("MISSING_CONSTRAINTS: Prompt has variables but no constraints");

        return violations; // empty = passes quality gate
    }
}
\`\`\`

**Team README for prompt contribution:**
\`\`\`markdown
# Contributing a Prompt

## Required files
- \`prompts/<category>/<key>.txt\` — the prompt (use RCTFC structure)
- \`prompts/<category>/<key>.test.json\` — at least 3 test cases
- \`prompts/<category>/<key>.md\` — usage documentation

## PR checklist
- [ ] Prompt follows RCTFC structure
- [ ] Has at least 3 test cases (happy path + 2 edge cases)
- [ ] Test cases pass in CI
- [ ] Includes token usage estimate in docs
- [ ] Changelog entry added

## Quality gate
CI runs the quality checker on all prompt files.
Your PR cannot merge if violations exist.
\`\`\``,
      },
      {
        id: 'pe-p4-l16-summary',
        type: 'summary',
        title: 'What You Just Learned — and the Full Course',
        content: `**This lesson:**
- A team prompt library is infrastructure — it needs the same rigor as any internal library
- Three-layer architecture: Registry (storage) → Catalog API (discovery) → Developer interface
- Enforce quality standards in CI: role present, format specified, test cases pass
- New prompt workflow: Draft → PR Review → Eval run → Merge → Monitor

**The full course in one page:**

| Phase | What you learned |
|---|---|
| P1: Fundamentals | Mental model, RCTFC anatomy, zero/few-shot, temperature |
| P2: Core Techniques | Chain-of-Thought, structured output, 10 templates, refinement |
| P3: Advanced Patterns | System prompts, prompt chains, RAG-aware, tool descriptions |
| P4: Architect Level | Versioning, evaluation, enterprise safety, team prompt library |

**Your prompt engineering checklist:**
1. Every prompt follows RCTFC
2. Temperature set explicitly for the task type
3. Structured output for any AI-to-code integration
4. System prompts for repeated expert personas
5. Multi-step chains for complex tasks
6. RAG prompts prevent hallucination with "context only" instructions
7. Tool descriptions are as carefully written as any API doc
8. Prompts are version-controlled with changelogs
9. Test suite runs on every prompt change
10. PII scrubbed before every external API call`,
      },
    ],
    checkpoints: [
      'What 3 layers make up a team prompt library architecture?',
      'What 4 files should every prompt contribution to the team library include?',
      'As a team lead, what are the 3 most important prompt quality gates to enforce in CI?',
    ],
  },
];

export const COURSE_LESSONS: CourseLesson[] = applyPromptEngineeringEnhancements(RAW_COURSE_LESSONS);

// ─── Helpers ───────────────────────────────────────────────────────────────────

export function getLessonsForPhase(phaseNumber: number): CourseLesson[] {
  return COURSE_LESSONS.filter((l) => l.phase === phaseNumber);
}

export function getLessonById(id: string): CourseLesson | undefined {
  return COURSE_LESSONS.find((l) => l.id === id);
}

export function getNextLesson(currentId: string): CourseLesson | undefined {
  const idx = COURSE_LESSONS.findIndex((l) => l.id === currentId);
  return idx >= 0 && idx < COURSE_LESSONS.length - 1 ? COURSE_LESSONS[idx + 1] : undefined;
}

export function getPrevLesson(currentId: string): CourseLesson | undefined {
  const idx = COURSE_LESSONS.findIndex((l) => l.id === currentId);
  return idx > 0 ? COURSE_LESSONS[idx - 1] : undefined;
}

export function getTotalLessons(): number {
  return COURSE_LESSONS.length;
}

export function getTotalHours(): string {
  return '18';
}

export function getCompletedLessons(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set<string>(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function markLessonComplete(id: string): void {
  const set = getCompletedLessons();
  set.add(id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
}

export function markLessonIncomplete(id: string): void {
  const set = getCompletedLessons();
  set.delete(id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
}
