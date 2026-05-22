import type { CourseLesson } from './courseData';

// ─── Phase 5: 90-Day Production Roadmap ──────────────────────────────────────
// 5 lessons implementing the complete post-course plan

export const PHASE_5_LESSONS: CourseLesson[] = [

  // ── Days 1-30 ──────────────────────────────────────────────────────────────
  {
    id: 'p5-l1',
    phase: 5,
    lesson: 13,
    title: 'Days 1–30: Ship a Real Feature and Track Everything',
    subtitle: 'Your first 30 days — from course graduate to someone who actually shipped something',
    duration: '40 min',
    difficulty: 'Intermediate',
    tags: ['ship-feature', 'token-tracking', 'grafana', 'cloudwatch', 'anthropic-cookbook', 'real-world'],
    checkpoints: [
      'What is the simplest Claude-powered feature you could demo to a teammate this week?',
      'Write the Java code that logs input tokens, output tokens, and cost after every Claude call.',
      'What does "translate a Python Cookbook recipe to Java" mean in practice? Do it for one recipe.',
      'What are the three things the Anthropic Discord community is useful for?',
    ],
    sections: [
      {
        id: 'p5-l1-why',
        type: 'why',
        title: 'Why the First 30 Days Are the Most Important',
        content: `Most developers finish a course, bookmark the docs, and move on. The knowledge fades because it was never connected to a real problem.

The first 30 days after finishing this course are the most important window. Your understanding is fresh. Your motivation is high. And the gap between "I know how to use the API" and "I actually use it to solve real problems" is smaller now than it will ever be again.

This lesson is not theory. Every item has a concrete action, a code snippet, and a way to know you actually did it.

> **The rule for these 30 days:** If something you build does not get used by at least one other human being, it does not count. Build for real people, not for your own satisfaction.`,
      },
      {
        id: 'p5-l1-analogy',
        type: 'analogy',
        title: 'Think of It Like a Gym Membership',
        content: `You just finished a personal training programme. You know every exercise, every technique, every muscle group. Now you need to actually show up to the gym.

**Week 1** is when most people either build the habit or lose it. Same here.

The difference between developers who build AI expertise and those who do not is not intelligence or talent — it is whether they shipped something real in the first week. The feature can be small. It can be imperfect. But it has to be real.

A CLI tool you run once a week on your own code is real. A notebook demo you show nobody is not.`,
      },
      {
        id: 'p5-l1-concept-ship',
        type: 'concept',
        title: 'Week 1 — Ship One Real Feature',
        content: `### What "real" means

A real feature has all three of these:
- It **runs outside your IDE** (packaged as a JAR, deployed to a server, available via command line)
- At least **one other person** has used it and found it useful
- You have **at least 5 real usage logs** showing it was called with real input

### What to build — pick the simplest one

| Feature idea | Time to build | Who uses it |
|---|---|---|
| "Explain this stack trace" CLI | 2 hours | You, any teammate |
| "Summarise this PR" script | 3 hours | Your team during code review |
| "Write the commit message" git hook | 4 hours | Your team on every commit |
| "Review this method" Slack command | 6 hours | Your whole team |
| "Classify this support ticket" REST endpoint | 4 hours | Your support team |

### Recommended starter: Stack Trace Explainer CLI

This is the best first real feature because:
- Every developer encounters stack traces daily
- The output is immediately, obviously valuable
- It requires everything from the course (system prompt + user input + streaming)
- You can use it yourself and show it to teammates on day one

\`\`\`java
// StackTraceExplainer.java — complete working feature
public class StackTraceExplainer {

    private static final String SYSTEM = """
        You are a senior Java developer explaining exceptions to a junior developer.
        When given a stack trace:
        1. Name the exception type and what it means in plain English (one sentence)
        2. Identify the exact line in the USER's code that caused it (not library internals)
        3. Explain the most common cause of this specific error
        4. Give a concrete fix with a code snippet
        5. Mention one way to prevent this class of error in future

        Be direct. No preamble. The developer is staring at a broken build.
        """;

    public static void main(String[] args) throws Exception {
        AnthropicClient client = AnthropicOkHttpClient.builder().fromEnv().build();

        System.out.println("Paste your stack trace. Press Enter twice when done:");
        StringBuilder sb = new StringBuilder();
        Scanner scanner = new Scanner(System.in);
        String line;
        int emptyCount = 0;
        while (scanner.hasNextLine()) {
            line = scanner.nextLine();
            if (line.isBlank()) {
                emptyCount++;
                if (emptyCount >= 2) break;
            } else {
                emptyCount = 0;
            }
            sb.append(line).append("\\n");
        }

        String stackTrace = sb.toString().trim();
        if (stackTrace.isBlank()) {
            System.out.println("No stack trace provided.");
            return;
        }

        System.out.println("\\nAnalysing...\\n");

        // Stream the response so output appears immediately
        client.messages().stream(
            MessageCreateParams.builder()
                .model(Model.CLAUDE_HAIKU_4_5) // Haiku is fast and cheap — perfect for this
                .maxTokens(600L)
                .system(SYSTEM)
                .addUserMessage(stackTrace)
                .build()
        ).on(MessageStreamEvent.Visitor.builder()
            .onContentBlockDelta(delta -> {
                if (delta.delta() instanceof TextDelta td) {
                    System.out.print(td.text());
                    System.out.flush();
                }
            })
            .build()
        ).finalMessage();

        System.out.println("\\n");
    }
}
\`\`\`

### Run it in one command after packaging

\`\`\`bash
# Build
mvn package -q

# Use it — paste a stack trace, press Enter twice
java -jar target/stack-explainer.jar

# Or pipe directly from clipboard (macOS)
pbpaste | java -jar target/stack-explainer.jar
\`\`\`

**Day 1 goal:** This tool runs. You have used it on one real stack trace from your own project.
**Day 3 goal:** One teammate has used it and given you feedback.
**Day 7 goal:** You have used it at least 5 times on real problems.`,
      },
      {
        id: 'p5-l1-concept-tracking',
        type: 'concept',
        title: 'Week 2 — Add Token Tracking (One Week of Real Data)',
        content: `### Why tracking before expanding

Before you add a second feature, instrument the first one. One week of token data from a real feature teaches you more about cost management than any tutorial.

### The minimum viable tracking setup

Add this wrapper to every Claude call you make:

\`\`\`java
// ClaudeUsageTracker.java — drop this into any project
public class ClaudeUsageTracker {

    private static final Logger log = LoggerFactory.getLogger(ClaudeUsageTracker.class);

    public record UsageRecord(
        String feature,
        String model,
        long inputTokens,
        long outputTokens,
        double estimatedCostUsd,
        LocalDateTime calledAt
    ) {}

    // Call this after every Claude response
    public static UsageRecord track(String featureName, String model, Usage usage) {
        // Approximate pricing — verify at console.anthropic.com for exact rates
        double costUsd = switch (model) {
            case "claude-haiku-4-5"   -> (usage.inputTokens() * 0.25 + usage.outputTokens() * 1.25) / 1_000_000;
            case "claude-sonnet-4-6"  -> (usage.inputTokens() * 3.0  + usage.outputTokens() * 15.0) / 1_000_000;
            case "claude-opus-4-7"    -> (usage.inputTokens() * 15.0 + usage.outputTokens() * 75.0) / 1_000_000;
            default -> 0.0;
        };

        UsageRecord record = new UsageRecord(
            featureName, model,
            usage.inputTokens(), usage.outputTokens(),
            costUsd, LocalDateTime.now()
        );

        // Log in a format that's easy to grep, parse, or feed to CloudWatch
        log.info("CLAUDE_USAGE feature={} model={} input_tokens={} output_tokens={} cost_usd={:.6f}",
            record.feature(), record.model(),
            record.inputTokens(), record.outputTokens(),
            record.estimatedCostUsd());

        return record;
    }
}
\`\`\`

### Use it in your feature

\`\`\`java
// In your Claude service, after every call:
Message response = client.messages().create(params);
ClaudeUsageTracker.track("stack-trace-explainer", params.model().toString(), response.usage());
return extractText(response);
\`\`\`

### Send to CloudWatch (AWS) if your team uses it

\`\`\`java
// Optional: ship metrics to CloudWatch
// Add dependency: software.amazon.awssdk:cloudwatch

CloudWatchClient cw = CloudWatchClient.create();

public void sendToCloudWatch(UsageRecord record) {
    cw.putMetricData(r -> r
        .namespace("MyApp/Claude")
        .metricData(
            MetricDatum.builder()
                .metricName("InputTokens")
                .value((double) record.inputTokens())
                .dimensions(Dimension.builder()
                    .name("Feature").value(record.feature()).build())
                .build(),
            MetricDatum.builder()
                .metricName("EstimatedCostUsd")
                .value(record.estimatedCostUsd())
                .dimensions(Dimension.builder()
                    .name("Feature").value(record.feature()).build())
                .build()
        )
    );
}
\`\`\`

### Grafana setup (if your team already uses it)

Your logs are already structured — add Loki or a log shipper. Then query:

\`\`\`
# Grafana LogQL — total estimated cost this week
sum by (feature) (
  sum_over_time({job="my-app"} |= "CLAUDE_USAGE" | logfmt | unwrap cost_usd [7d])
)
\`\`\`

### Questions to answer after one week of data

After 7 days, open your logs and answer these three questions:

1. **What is my average input token count per call?**
   If it is > 3,000 tokens for a simple feature, your system prompt or context is too long.

2. **Which calls cost the most per day?**
   These are where optimisation has the biggest impact (switch to Haiku? Reduce context? Cache responses?)

3. **What is my total weekly cost?**
   Multiply by 52 — that is your annual AI budget at current usage. Is it acceptable? Does the value justify it?`,
      },
      {
        id: 'p5-l1-concept-cookbook',
        type: 'concept',
        title: 'Week 3 — The Anthropic Cookbook: Translating Python to Java',
        content: `### What the Anthropic Cookbook is

The [Anthropic Cookbook](https://github.com/anthropics/anthropic-cookbook) is a public GitHub repository of practical, runnable examples. Everything is in Python. This is not a problem — the patterns translate directly to Java, and learning to do that translation is itself a valuable skill.

### How to use it (3 recipes per day)

Open the repository. Every recipe is a Jupyter notebook. Read the full notebook once, then translate the key parts to Java.

### Translation guide: Python SDK → Java SDK

\`\`\`python
# Python Cookbook recipe (typical pattern)
import anthropic
client = anthropic.Anthropic()

message = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello!"}]
)
print(message.content[0].text)
\`\`\`

\`\`\`java
// Same recipe translated to Java
AnthropicClient client = AnthropicOkHttpClient.builder().fromEnv().build();

Message message = client.messages().create(
    MessageCreateParams.builder()
        .model(Model.CLAUDE_SONNET_4_6)
        .maxTokens(1024L)
        .addUserMessage("Hello!")
        .build()
);
System.out.println(message.content().get(0).text().orElse(""));
\`\`\`

### Five recipes to start with (in this order)

| Recipe name in Cookbook | What it teaches | Java difficulty |
|---|---|---|
| \`basic_api_usage\` | Patterns you already know — use for translation practice | Easy |
| \`classification\` | Structured output for category labels | Easy |
| \`summarisation\` | Long document handling, chunking | Easy |
| \`tool_use_basics\` | Multi-tool use patterns | Medium |
| \`rag_with_chroma\` | Full RAG pipeline (you will build yours with pgvector in lesson 2) | Medium |

### The translation exercise that teaches the most

Pick one recipe per day. Do this in order:
1. Read the full Python notebook — understand what it builds
2. Write the Java version from scratch without looking at the Java SDK docs
3. Compare to the Java SDK docs to check your instincts
4. Run it and fix errors

After 7 days of this, you will be fluent in the Java SDK. The errors you get and fix are the actual learning.`,
      },
      {
        id: 'p5-l1-concept-community',
        type: 'concept',
        title: 'Week 4 — Join the Community and Get Unstuck Faster',
        content: `### The Anthropic Developer Discord

The Anthropic Developer Discord is where the people who build with Claude — from individual developers to teams at large companies — hang out and share what they are learning.

**How to find it:** Log into console.anthropic.com → look for the "Developer Discord" link in the sidebar or footer.

### What to do there (concrete actions, not vague "engage")

**Day 1: Read before you post**
Spend 30 minutes reading the \`#show-and-tell\` and \`#help\` channels. Notice the kinds of questions that get good answers vs the ones that get ignored.

A question that gets a good answer:
> "I'm getting inconsistent JSON output from Claude even with clear instructions. Here is my system prompt [paste it]. Here is what I get [example output]. I've tried adding 'always respond with valid JSON' but it doesn't always work. Any suggestions?"

A question that gets ignored:
> "How do I make Claude give better responses?"

**Week 1: Post one thing you learned**
Find something specific from your Week 1 feature that surprised you — a behaviour you did not expect, a token usage number that was higher or lower than expected, a prompt pattern that worked well.

Post it in \`#show-and-tell\`. Format:
> "Built [feature]. Surprising finding: [specific observation]. Here's what I did about it: [action you took]."

**Ongoing: The "what broke in production" threads**

These are gold. Real teams sharing real failures. You learn more from one "we shipped this and it broke because..." post than from ten tutorials. Read every one.

### What to do when you are stuck

Before posting, follow this order:
1. Check the [official docs](https://docs.anthropic.com) — most answers are there
2. Search the Discord history — it has been asked before
3. Read the relevant Cookbook example
4. Post with: what you tried, what you expected, what actually happened, your exact code

This order gets you unstuck faster and makes you a better engineer in the process.`,
      },
      {
        id: 'p5-l1-task',
        type: 'task',
        title: 'Days 1–30 Checklist — Do Not Move to Day 31 Without These',
        content: `Work through this list in order. Each item builds on the previous one.

**Week 1**
- [ ] Pick one feature from the list above (or your own idea)
- [ ] Build it — running as a JAR or deployed endpoint, not just in IDE
- [ ] Use it yourself on a real input (not test data)
- [ ] Show it to one teammate and watch them use it
- [ ] Write down one piece of feedback they gave you

**Week 2**
- [ ] Add \`ClaudeUsageTracker.track()\` to every Claude call you make
- [ ] Run your feature at least 10 times with real inputs
- [ ] Export your usage logs and answer: avg input tokens? Most expensive call? Weekly cost?
- [ ] Make one optimisation based on what you found (simpler prompt? Switch to Haiku?)

**Week 3**
- [ ] Open the Anthropic Cookbook repository
- [ ] Read 3 recipes
- [ ] Translate one complete recipe to working Java
- [ ] Run it successfully

**Week 4**
- [ ] Join the Anthropic Developer Discord
- [ ] Read the \`#show-and-tell\` channel for 20 minutes
- [ ] Post one thing you learned or built this month

**Your 30-day review (answer these honestly)**

\`\`\`
Feature I shipped: _________________________________
At least one other person used it: YES / NO
Total tokens used in 30 days: _____________________
Average cost per call: ____________________________
One thing that surprised me: ______________________
One thing I would do differently: _________________
\`\`\`

If you can fill in all of these, you are ready for Days 31–60.`,
      },
      {
        id: 'p5-l1-summary',
        type: 'summary',
        title: 'What This Month Builds',
        content: `After 30 days of following this plan, you will have:

- **One real feature** used by at least one real person (not a demo — something that solved a real problem)
- **One week of token usage data** that tells you exactly what your AI integration costs and how efficient your prompts are
- **Familiarity with the Cookbook** so you can find and adapt patterns when you need them
- **Community connections** so when you hit a wall, you know where to get unstuck

These are the foundations that make Days 31–60 possible. Skip them and you will be building advanced features on a shaky base. Do them and you will have the instincts that make the advanced work feel natural.`,
      },
    ],
  },

  // ── Days 31-60: RAG ────────────────────────────────────────────────────────
  {
    id: 'p5-l2',
    phase: 5,
    lesson: 14,
    title: 'Days 31–45: Build a RAG Knowledge Base With pgvector and Spring Boot',
    subtitle: 'Make Claude answer from your own documents — wiki, runbooks, Confluence, anything',
    duration: '60 min',
    difficulty: 'Advanced',
    tags: ['rag', 'pgvector', 'spring-data-jpa', 'embeddings', 'openai', 'ollama', 'knowledge-base', 'retrieval'],
    checkpoints: [
      'Explain RAG in plain English — what problem does it solve that Claude alone cannot?',
      'What are the three steps of a RAG pipeline? Write a sentence for each.',
      'Write the Spring Data JPA entity for storing a document chunk with its embedding vector.',
      'When should you use Ollama instead of OpenAI for embeddings?',
    ],
    sections: [
      {
        id: 'p5-l2-why',
        type: 'why',
        title: 'Why RAG Is the Most In-Demand AI Feature in Enterprise Java Teams',
        content: `Every company has internal knowledge that Claude does not know: your architecture decision records, your deployment runbooks, your team's coding standards, your product specifications, your internal APIs.

A junior developer joining your team cannot ask Claude "how do we run database migrations here?" and get a correct answer — because Claude was not trained on your internal Confluence pages.

RAG fixes this. It is the technique that makes Claude into a Q&A system over YOUR documents. You do not fine-tune the model (expensive, complex, requires ML expertise). You retrieve the relevant documents at query time and include them in Claude's context (cheap, simple, works with the same Java SDK you already know).

This is the single most requested feature in enterprise AI projects. After this lesson you can build it from scratch.`,
      },
      {
        id: 'p5-l2-analogy',
        type: 'analogy',
        title: 'The Open-Book Exam Analogy',
        content: `Imagine a very smart intern who just joined your team. They know software engineering deeply — but they have never read your internal wiki.

**Without RAG:** You ask them "How do we deploy to production here?" They give you a generic answer about CI/CD best practices. Correct in general, useless for your specific situation.

**With RAG:** Before answering, the intern looks up "deploy production" in your internal wiki, finds the relevant runbook pages, reads them, then answers your question based on YOUR process. They are still the same smart intern — but now they have your docs as context.

Claude is the intern. Your wiki is the open book. RAG is the act of looking up the right pages before answering.

The three parts:
- **R**etrieval — finding the right pages in your wiki
- **A**ugmented — adding those pages to the prompt (augmenting Claude's context)
- **G**eneration — Claude generates the answer from the retrieved pages`,
      },
      {
        id: 'p5-l2-concept-arch',
        type: 'concept',
        title: 'The RAG Architecture — Three Steps You Will Implement',
        content: `### Step 1: Indexing (run once, then nightly)

Read all your documents → split each into chunks → convert each chunk to a vector → store (text, vector) in the database.

\`\`\`
Your Confluence page (5,000 words)
    ↓ split into 10 chunks (~500 words each)
    ↓ embed each chunk → list of 1,536 numbers
    ↓ store in PostgreSQL with pgvector
\`\`\`

A "vector" is just a list of numbers that represents the meaning of the text. Similar meaning → similar numbers → close together in vector space. This is what makes search work.

### Step 2: Retrieval (every user question)

Convert user's question to a vector → find the 5 most similar vectors in the database → return those 5 chunks.

\`\`\`
"How do we run migrations?" → [0.23, -0.45, 0.89, ...]
    ↓ search database for nearest 5 vectors
    ↓ return the 5 most relevant doc chunks
\`\`\`

### Step 3: Generation (Claude's job)

Build a prompt containing those 5 chunks + the user's question → send to Claude → Claude answers from the chunks.

\`\`\`
Prompt = "Using only this documentation: [chunk1] [chunk2] ... Answer: How do we run migrations?"
Claude → reads the chunks → gives a specific answer based on YOUR process
\`\`\`

### Why this beats alternatives

| Approach | Problem |
|---|---|
| Paste entire wiki into context | 500 pages doesn't fit. Even 50 pages costs thousands of tokens per question. |
| Fine-tune Claude on your docs | Requires ML expertise, GPU time, ongoing maintenance as docs change |
| Use Claude's training data | Claude was not trained on your internal docs |
| RAG | Only send the 3-5 relevant chunks per question. Cheap, accurate, always up-to-date. |`,
      },
      {
        id: 'p5-l2-concept-setup',
        type: 'concept',
        title: 'Project Setup — Dependencies and Database',
        content: `### pom.xml dependencies

\`\`\`xml
<!-- Spring Boot + JPA (you already have these) -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
</dependency>

<!-- pgvector — Java types for vector columns -->
<dependency>
    <groupId>com.pgvector</groupId>
    <artifactId>pgvector</artifactId>
    <version>0.1.6</version>
</dependency>

<!-- OpenAI Java SDK for embeddings (Anthropic does not offer embeddings) -->
<dependency>
    <groupId>com.openai</groupId>
    <artifactId>openai-java</artifactId>
    <version>1.5.0</version>
</dependency>

<!-- Anthropic SDK — you already have this -->
<dependency>
    <groupId>com.anthropic</groupId>
    <artifactId>anthropic-java</artifactId>
    <version>0.8.0</version>
</dependency>
\`\`\`

### Enable pgvector in PostgreSQL

Run once on your database:
\`\`\`sql
CREATE EXTENSION IF NOT EXISTS vector;
\`\`\`

With Docker for local development:
\`\`\`yaml
# docker-compose.yml
services:
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: rag_demo
      POSTGRES_USER: app
      POSTGRES_PASSWORD: secret
    ports:
      - "5432:5432"
\`\`\`

### application.yml

\`\`\`yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/rag_demo
    username: app
    password: secret
  jpa:
    hibernate:
      ddl-auto: update  # auto-creates tables from entities
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect

anthropic:
  api-key: \${ANTHROPIC_API_KEY}

openai:
  api-key: \${OPENAI_API_KEY}  # for embeddings only
\`\`\``,
      },
      {
        id: 'p5-l2-code-entity',
        type: 'code',
        title: 'The DocumentChunk Entity and Repository',
        content: `\`\`\`java
// DocumentChunk.java — stores one piece of a document + its vector
@Entity
@Table(name = "document_chunks")
public class DocumentChunk {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, columnDefinition = "text")
    private String content;               // the actual text

    @Column(nullable = false)
    private String sourceLabel;           // e.g. "confluence/deployment-runbook"

    // pgvector column — 1536 dimensions matches OpenAI text-embedding-3-small
    @Column(columnDefinition = "vector(1536)", nullable = false)
    private float[] embedding;

    @CreationTimestamp
    private LocalDateTime indexedAt;

    // constructors, getters, setters
    public DocumentChunk() {}
    public DocumentChunk(String content, String sourceLabel, float[] embedding) {
        this.content = content;
        this.sourceLabel = sourceLabel;
        this.embedding = embedding;
    }
    // ... getters
}
\`\`\`

\`\`\`java
// DocumentChunkRepository.java
@Repository
public interface DocumentChunkRepository extends JpaRepository<DocumentChunk, UUID> {

    // Cosine similarity search — returns the 5 most similar chunks
    // pgvector syntax: <=> is cosine distance operator
    @Query(value = """
        SELECT *, 1 - (embedding <=> CAST(:queryVector AS vector)) AS similarity
        FROM document_chunks
        ORDER BY embedding <=> CAST(:queryVector AS vector)
        LIMIT :topK
        """, nativeQuery = true)
    List<DocumentChunk> findTopKSimilar(
        @Param("queryVector") String queryVector,   // pgvector format: "[0.1,0.2,...]"
        @Param("topK") int topK
    );
}
\`\`\`

\`\`\`java
// Helper: convert float[] to pgvector string format
public static String toVectorString(float[] embedding) {
    StringBuilder sb = new StringBuilder("[");
    for (int i = 0; i < embedding.length; i++) {
        sb.append(embedding[i]);
        if (i < embedding.length - 1) sb.append(",");
    }
    return sb.append("]").toString();
}
\`\`\``,
      },
      {
        id: 'p5-l2-code-embedding',
        type: 'code',
        title: 'Embedding Service — Converting Text to Vectors',
        content: `The embedding model turns text into a vector (list of numbers). You need this for both indexing (documents) and retrieval (questions).

\`\`\`java
// EmbeddingService.java — wraps OpenAI embeddings API
@Service
public class EmbeddingService {

    private final OpenAIClient openAiClient;

    public EmbeddingService(@Value("\${openai.api-key}") String apiKey) {
        this.openAiClient = OpenAIOkHttpClient.builder()
            .apiKey(apiKey)
            .build();
    }

    public float[] embed(String text) {
        EmbeddingCreateResponse response = openAiClient.embeddings().create(
            EmbeddingCreateParams.builder()
                .model(EmbeddingModel.TEXT_EMBEDDING_3_SMALL)  // 1536 dimensions, cheap
                .input(EmbeddingCreateParams.Input.ofString(text))
                .build()
        );
        List<Double> doubles = response.data().get(0).embedding();
        float[] floats = new float[doubles.size()];
        for (int i = 0; i < doubles.size(); i++) {
            floats[i] = doubles.get(i).floatValue();
        }
        return floats;
    }
}
\`\`\`

### Alternative: Ollama (free, runs locally, no API key needed)

If you cannot get an OpenAI API key, or want to keep all data on your own servers:

\`\`\`bash
# Install Ollama — https://ollama.ai
ollama pull nomic-embed-text  # a good free embedding model
\`\`\`

\`\`\`java
// OllamaEmbeddingService.java — calls Ollama's local REST API
@Service
public class OllamaEmbeddingService {

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String OLLAMA_URL = "http://localhost:11434/api/embeddings";

    public float[] embed(String text) {
        Map<String, String> request = Map.of(
            "model", "nomic-embed-text",
            "prompt", text
        );
        Map response = restTemplate.postForObject(OLLAMA_URL, request, Map.class);
        List<Double> embedding = (List<Double>) response.get("embedding");
        float[] result = new float[embedding.size()];
        for (int i = 0; i < embedding.size(); i++) {
            result[i] = embedding.get(i).floatValue();
        }
        return result;
    }
}
\`\`\`

> **nomic-embed-text produces 768-dimensional vectors.** If you switch to Ollama, change the \`vector(1536)\` column to \`vector(768)\` in your entity.`,
      },
      {
        id: 'p5-l2-code-indexing',
        type: 'code',
        title: 'Indexing Service — From Raw Documents to Searchable Chunks',
        content: `\`\`\`java
// DocumentIndexingService.java
@Service
@Slf4j
public class DocumentIndexingService {

    private final EmbeddingService embeddingService;
    private final DocumentChunkRepository chunkRepo;

    public DocumentIndexingService(EmbeddingService embeddingService,
                                   DocumentChunkRepository chunkRepo) {
        this.embeddingService = embeddingService;
        this.chunkRepo = chunkRepo;
    }

    // Index a single document (call this for each file/page you want searchable)
    public int indexDocument(String content, String sourceLabel) {
        List<String> chunks = splitIntoChunks(content, 400); // ~400 words per chunk
        log.info("Indexing '{}' → {} chunks", sourceLabel, chunks.size());

        int indexed = 0;
        for (String chunk : chunks) {
            try {
                float[] embedding = embeddingService.embed(chunk);
                chunkRepo.save(new DocumentChunk(chunk, sourceLabel, embedding));
                indexed++;
                Thread.sleep(50); // avoid rate limiting the embedding API
            } catch (Exception e) {
                log.warn("Failed to embed chunk from {}: {}", sourceLabel, e.getMessage());
            }
        }
        log.info("Indexed {} / {} chunks for '{}'", indexed, chunks.size(), sourceLabel);
        return indexed;
    }

    // Index an entire directory of .txt or .md files
    public void indexDirectory(Path directory) throws IOException {
        Files.walk(directory)
            .filter(p -> p.toString().endsWith(".txt") || p.toString().endsWith(".md"))
            .forEach(file -> {
                try {
                    String content = Files.readString(file);
                    String label = directory.relativize(file).toString();
                    indexDocument(content, label);
                } catch (IOException e) {
                    log.error("Could not read file {}: {}", file, e.getMessage());
                }
            });
    }

    // Split text into overlapping chunks
    // Overlap ensures a sentence that spans a chunk boundary is not missed
    private List<String> splitIntoChunks(String text, int targetWordsPerChunk) {
        String[] words = text.split("\\s+");
        List<String> chunks = new ArrayList<>();
        int overlap = 50; // words of overlap between chunks

        for (int i = 0; i < words.length; i += targetWordsPerChunk - overlap) {
            int end = Math.min(i + targetWordsPerChunk, words.length);
            String chunk = String.join(" ", Arrays.copyOfRange(words, i, end));
            if (chunk.length() > 50) { // skip very short fragments
                chunks.add(chunk);
            }
            if (end == words.length) break;
        }
        return chunks;
    }
}
\`\`\``,
      },
      {
        id: 'p5-l2-code-qa',
        type: 'code',
        title: 'Q&A Service — The Complete RAG Pipeline Tied Together',
        content: `\`\`\`java
// RagQaService.java — retrieves relevant chunks and asks Claude
@Service
public class RagQaService {

    private final EmbeddingService embeddingService;
    private final DocumentChunkRepository chunkRepo;
    private final AnthropicClient claude;

    private static final String SYSTEM_PROMPT = """
        You are a helpful assistant answering questions about our internal company documentation.

        Rules:
        - Answer ONLY based on the documentation provided in the user message
        - If the answer is not in the documentation, say exactly: "I don't have that information in our internal docs. Try asking in the team Slack or checking Confluence directly."
        - Quote the relevant part of the documentation when it helps
        - Be specific and direct — the person asking has a real task to complete
        - If documentation seems outdated (e.g. old version numbers), mention it
        """;

    public RagQaService(EmbeddingService embeddingService,
                        DocumentChunkRepository chunkRepo,
                        AnthropicClient claude) {
        this.embeddingService = embeddingService;
        this.chunkRepo = chunkRepo;
        this.claude = claude;
    }

    public String answer(String question) {
        // Step 1: Embed the question
        float[] questionVector = embeddingService.embed(question);
        String vectorString = toVectorString(questionVector);

        // Step 2: Retrieve top-5 most relevant chunks
        List<DocumentChunk> relevantChunks = chunkRepo.findTopKSimilar(vectorString, 5);

        if (relevantChunks.isEmpty()) {
            return "No relevant documentation found. Make sure documents are indexed.";
        }

        // Step 3: Build context string from retrieved chunks
        String context = IntStream.range(0, relevantChunks.size())
            .mapToObj(i -> {
                DocumentChunk chunk = relevantChunks.get(i);
                return "--- Source: " + chunk.getSourceLabel() + " ---\\n" + chunk.getContent();
            })
            .collect(Collectors.joining("\\n\\n"));

        // Step 4: Ask Claude with the retrieved context
        String prompt = """
            Answer the following question using ONLY the documentation below.

            Documentation:
            %s

            Question: %s
            """.formatted(context, question);

        Message response = claude.messages().create(
            MessageCreateParams.builder()
                .model(Model.CLAUDE_SONNET_4_6)
                .maxTokens(1024L)
                .system(SYSTEM_PROMPT)
                .addUserMessage(prompt)
                .build()
        );

        return response.content().get(0).text().orElse("No response generated.");
    }

    private String toVectorString(float[] embedding) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < embedding.length; i++) {
            if (i > 0) sb.append(",");
            sb.append(embedding[i]);
        }
        return sb.append("]").toString();
    }
}
\`\`\`

### Wire it up with a simple REST endpoint

\`\`\`java
@RestController
@RequestMapping("/api/docs")
public class RagController {

    private final RagQaService qaService;
    private final DocumentIndexingService indexingService;

    @PostMapping("/ask")
    public Map<String, String> ask(@RequestBody Map<String, String> body) {
        String question = body.get("question");
        String answer = qaService.answer(question);
        return Map.of("question", question, "answer", answer);
    }

    @PostMapping("/index")
    public Map<String, Object> indexFile(@RequestBody Map<String, String> body) throws IOException {
        Path filePath = Path.of(body.get("path"));
        String content = Files.readString(filePath);
        int chunks = indexingService.indexDocument(content, filePath.getFileName().toString());
        return Map.of("indexed_chunks", chunks, "source", filePath.toString());
    }
}
\`\`\`

### Test it

\`\`\`bash
# 1. Index a document
curl -X POST http://localhost:8080/api/docs/index \\
  -H "Content-Type: application/json" \\
  -d '{"path": "/path/to/your/runbook.md"}'

# 2. Ask a question
curl -X POST http://localhost:8080/api/docs/ask \\
  -H "Content-Type: application/json" \\
  -d '{"question": "How do we deploy to production?"}'
\`\`\``,
      },
      {
        id: 'p5-l2-task',
        type: 'task',
        title: 'Days 31–45 Deliverable — A Working RAG System',
        content: `Work through these steps. Do not move to the next step until the current one works.

**Step 1: Database up (Day 31)**
\`\`\`bash
docker-compose up -d postgres
# Connect and verify pgvector is enabled
psql -h localhost -U app -d rag_demo -c "SELECT * FROM pg_extension WHERE extname='vector';"
# Should return one row
\`\`\`

**Step 2: Embedding works (Day 32)**
Write a simple test that embeds one sentence and prints the first 5 numbers of the vector:
\`\`\`java
float[] vector = embeddingService.embed("How do I run database migrations?");
System.out.println("Dimension: " + vector.length);  // should be 1536 for OpenAI
System.out.println("First 5: " + Arrays.toString(Arrays.copyOfRange(vector, 0, 5)));
\`\`\`

**Step 3: Index one document (Day 33)**
Find one document your team actually uses (a runbook, a README, a Confluence page you exported). Index it. Verify chunks appear in your database:
\`\`\`sql
SELECT id, source_label, LEFT(content, 100), indexed_at FROM document_chunks LIMIT 10;
\`\`\`

**Step 4: Search works (Day 34)**
Query your database for a question related to the document you indexed:
\`\`\`bash
curl -X POST http://localhost:8080/api/docs/ask \\
  -d '{"question": "one question the document definitely answers"}'
\`\`\`
Verify the answer is based on your document, not Claude's general knowledge.

**Step 5: Index 5 documents (Days 35–38)**
Add four more documents. Test questions that span multiple documents.

**Step 6: Show it to someone (Day 40)**
Have a teammate ask three questions without telling them what documents are indexed. Were the answers correct? Were any answers wrong (hallucinated)? Write down the failures — they are your v2 backlog.

**Days 31–45 review questions:**

\`\`\`
Documents indexed: _______ (target: at least 5)
Average retrieval time: _______ ms
One question it answered correctly: _______________________
One question it got wrong: ____________________________
Why it got it wrong: ________________________________
\`\`\``,
      },
      {
        id: 'p5-l2-summary',
        type: 'summary',
        title: 'What You Just Built',
        content: `You built a retrieval-augmented generation system from scratch in Spring Boot. The full pipeline: document chunking → embedding → pgvector storage → cosine similarity search → Claude generation. This is the same architecture used in enterprise internal chatbots, customer support tools, and knowledge management systems at scale.

The key insight: Claude did not get smarter. You gave it better context. That is all RAG is — better context management. The same technique works for any documents: code repositories, API documentation, legal contracts, customer support history.

Next: Days 46–60 add two more advanced capabilities — multi-agent workflows and the Vision API.`,
      },
    ],
  },

  // ── Days 46-60: Multi-Agent + Vision ──────────────────────────────────────
  {
    id: 'p5-l3',
    phase: 5,
    lesson: 15,
    title: 'Days 46–60: Multi-Agent Workflows and the Vision API',
    subtitle: 'Two tools working together, and making Claude see and understand images',
    duration: '50 min',
    difficulty: 'Advanced',
    tags: ['multi-agent', 'agent-loop', 'vision-api', 'tool-use', 'receipt-scanning', 'diagram-analysis', 'orchestration'],
    checkpoints: [
      'Draw on paper: how does the two-agent "researcher + writer" workflow move data?',
      'What is the maximum number of steps you should allow in an agent loop and why?',
      'Write the Java code to send a PNG image to Claude with a question.',
      'Name three real Java team use cases for the Vision API.',
    ],
    sections: [
      {
        id: 'p5-l3-why',
        type: 'why',
        title: 'Why One Claude Call Is Not Always Enough',
        content: `You have been making single Claude calls: one prompt in, one response out. For most features, this is correct and sufficient.

But some tasks are too complex for one call to handle well:
- A task that requires research, then synthesis, then formatting — three genuinely different jobs
- A task where Claude needs to check whether its own answer is correct before returning it
- A task where the output of one step determines what the next step should be

Multi-agent workflows split a complex task into focused subtasks, each handled by a separate Claude call with a specific role. This produces better results than one overloaded prompt trying to do everything.

And separately: sometimes the most important information is in an image. A screenshot of a failing CI build. A whiteboard diagram from a planning session. A receipt from an expense report. The Vision API lets Claude read and reason about these.`,
      },
      {
        id: 'p5-l3-concept-multiagent',
        type: 'concept',
        title: 'Multi-Agent: Two Claude Calls Working Together',
        content: `### The core pattern

Instead of one Claude call trying to research AND write AND format, you split it:

\`\`\`
Call 1 — Researcher Agent
  Role: "Find all relevant information about X"
  Input: the original task
  Output: raw facts, data, notes — NOT polished prose

Call 2 — Writer Agent
  Role: "Take this raw research and write a clear summary for a technical audience"
  Input: the output of Call 1
  Output: the final polished answer
\`\`\`

Your Java code passes the researcher's output as the writer's input. The agents do not communicate directly — you are the orchestrator.

### Why this is better than one call

**One call trying to do both:**
> "Research the performance implications of using HashMap vs TreeMap in Java and write a clear explanation for a junior developer."

The model has to switch mental modes mid-response. The research and the explanation bleed together. Quality suffers.

**Two focused calls:**
> Call 1 system: "You are a Java performance researcher. List every measurable performance difference between HashMap and TreeMap with time complexities and memory considerations. Raw notes format — no explanation yet."
> Call 2 system: "You are a technical writer. Take the following research notes and write a clear, beginner-friendly explanation with one code example. Audience: junior Java developer."

Each call has one job. The quality of each is higher. The combination is better than the single-call attempt.`,
      },
      {
        id: 'p5-l3-code-multiagent',
        type: 'code',
        title: 'Complete Two-Agent Orchestrator in Java',
        content: `\`\`\`java
// MultiAgentOrchestrator.java
@Service
public class MultiAgentOrchestrator {

    private final AnthropicClient client;

    private static final String RESEARCHER_SYSTEM = """
        You are a technical researcher. Your job is to gather and organise raw information.
        Output format: structured bullet points and facts. Do NOT write prose explanations.
        Be thorough. Include specifics: numbers, version names, API names.
        Audience for your notes: another expert who will use them to write an explanation.
        """;

    private static final String WRITER_SYSTEM = """
        You are a technical writer for a team of Java developers.
        Your job: take raw research notes and write a clear, direct explanation.
        Format: short paragraphs + one practical code example in Java.
        Length: 300-500 words maximum.
        Audience: intermediate Java developers who need to understand something quickly.
        """;

    public MultiAgentOrchestrator(AnthropicClient client) {
        this.client = client;
    }

    // The two-agent pipeline
    public String researchAndExplain(String topic) {
        System.out.println("Step 1/2: Researcher agent working...");

        // Agent 1: Researcher — gathers raw facts
        Message researchResponse = client.messages().create(
            MessageCreateParams.builder()
                .model(Model.CLAUDE_HAIKU_4_5)    // Haiku is fine for structured research
                .maxTokens(1024L)
                .system(RESEARCHER_SYSTEM)
                .addUserMessage("Research this topic thoroughly: " + topic)
                .build()
        );
        String rawResearch = researchResponse.content().get(0).text().orElse("");
        System.out.println("Research complete. Passing to writer...");

        // Agent 2: Writer — takes the research, produces the explanation
        Message writerResponse = client.messages().create(
            MessageCreateParams.builder()
                .model(Model.CLAUDE_SONNET_4_6)   // Sonnet for better prose quality
                .maxTokens(800L)
                .system(WRITER_SYSTEM)
                .addUserMessage("Write a clear explanation based on these research notes:\\n\\n"
                    + rawResearch)
                .build()
        );
        return writerResponse.content().get(0).text().orElse("No output generated.");
    }
}
\`\`\`

### More complex example: Research + Write + Self-Check

\`\`\`java
// Three-agent pipeline with a quality-check step
public String researchWriteAndVerify(String topic) {
    // Agent 1: Research
    String rawNotes = callClaude(RESEARCHER_SYSTEM, "Research: " + topic, Model.CLAUDE_HAIKU_4_5);

    // Agent 2: Write
    String draft = callClaude(WRITER_SYSTEM, "Write explanation from:\\n" + rawNotes, Model.CLAUDE_SONNET_4_6);

    // Agent 3: Self-check — does the explanation match the research?
    String checkSystem = """
        You are a fact-checker. Compare the explanation to the research notes.
        If everything in the explanation is supported by the notes, respond: APPROVED
        If anything is incorrect or missing, respond: REVISION NEEDED: [specific issue]
        """;
    String verification = callClaude(checkSystem,
        "Research notes:\\n" + rawNotes + "\\n\\nExplanation:\\n" + draft, Model.CLAUDE_HAIKU_4_5);

    if (verification.contains("APPROVED")) {
        return draft;
    }
    // If not approved, revise with the checker's feedback
    return callClaude(WRITER_SYSTEM,
        "Revise this explanation based on this feedback. Original:\\n" + draft
        + "\\n\\nFeedback:\\n" + verification, Model.CLAUDE_SONNET_4_6);
}

private String callClaude(String system, String userMessage, Model model) {
    Message response = client.messages().create(
        MessageCreateParams.builder()
            .model(model).maxTokens(1024L)
            .system(system).addUserMessage(userMessage)
            .build()
    );
    return response.content().get(0).text().orElse("");
}
\`\`\``,
      },
      {
        id: 'p5-l3-concept-vision',
        type: 'concept',
        title: 'Vision API — Claude Can See Your Screenshots and Diagrams',
        content: `### What it is

You can send images to Claude alongside your text question. Claude reads the image and answers based on what it sees.

Same SDK, same \`client.messages().create()\` call — you just add an image block to the message content.

### What Claude can see and reason about

| Image type | What you ask | What Claude does |
|---|---|---|
| Screenshot of stack trace | "What caused this exception?" | Reads the error, identifies the class and line, explains the cause |
| JProfiler flame graph | "Where is the bottleneck?" | Identifies the hot method, suggests optimization |
| Whiteboard architecture diagram | "What are the risks?" | Spots single points of failure, suggests improvements |
| Database ERD | "What indexes are missing?" | Reads relationships, identifies query patterns, suggests indexes |
| Expense receipt (photo) | "Extract total, date, vendor, category" | Returns structured JSON with the extracted data |
| Gantt chart or roadmap | "What are the dependencies?" | Reads the timeline, identifies blockers and critical path |
| UI screenshot | "What accessibility issues?" | Spots missing labels, contrast problems, keyboard traps |

### Real enterprise use cases for Java teams

1. **Receipt scanner for expense reports** — employee photos a receipt → your Spring Boot app sends it to Claude → Claude extracts total, date, vendor, and category → pre-fills the expense form
2. **CI failure analyzer** — take a screenshot of a failed CI pipeline → ask Claude what failed and why → include in the automated failure notification
3. **Whiteboard to architecture doc** — developer photos a planning session whiteboard → Claude describes the architecture → auto-generates a draft ADR`,
      },
      {
        id: 'p5-l3-code-vision',
        type: 'code',
        title: 'Vision API — Complete Java Implementation',
        content: `\`\`\`java
// VisionService.java — send images to Claude
@Service
public class VisionService {

    private final AnthropicClient client;

    public VisionService(AnthropicClient client) {
        this.client = client;
    }

    // Core method: send an image file + question, get answer
    public String analyzeImage(Path imagePath, String question) throws IOException {
        byte[] imageBytes = Files.readAllBytes(imagePath);
        String base64Image = Base64.getEncoder().encodeToString(imageBytes);
        var mediaType = detectMediaType(imagePath);

        MessageCreateParams params = MessageCreateParams.builder()
            .model(Model.CLAUDE_SONNET_4_6)
            .maxTokens(1024L)
            .addUserMessageOfBlockParams(List.of(
                ContentBlockParam.ofImage(
                    ImageBlockParam.builder()
                        .source(ImageBlockParam.Source.ofBase64(
                            Base64ImageSource.builder()
                                .data(base64Image)
                                .mediaType(mediaType)
                                .build()))
                        .build()),
                ContentBlockParam.ofText(
                    TextBlockParam.builder().text(question).build())
            ))
            .build();

        Message response = client.messages().create(params);
        return response.content().get(0).text().orElse("No response.");
    }

    // Overload for byte[] — useful for screenshots taken in memory
    public String analyzeImageBytes(byte[] imageBytes, String mimeType, String question) {
        String base64Image = Base64.getEncoder().encodeToString(imageBytes);
        var mediaType = mimeType.contains("png")
            ? Base64ImageSource.MediaType.IMAGE_PNG
            : Base64ImageSource.MediaType.IMAGE_JPEG;

        MessageCreateParams params = MessageCreateParams.builder()
            .model(Model.CLAUDE_SONNET_4_6)
            .maxTokens(1024L)
            .addUserMessageOfBlockParams(List.of(
                ContentBlockParam.ofImage(
                    ImageBlockParam.builder()
                        .source(ImageBlockParam.Source.ofBase64(
                            Base64ImageSource.builder()
                                .data(base64Image).mediaType(mediaType).build()))
                        .build()),
                ContentBlockParam.ofText(TextBlockParam.builder().text(question).build())
            ))
            .build();

        return client.messages().create(params)
            .content().get(0).text().orElse("No response.");
    }

    private Base64ImageSource.MediaType detectMediaType(Path path) {
        String name = path.getFileName().toString().toLowerCase();
        if (name.endsWith(".png")) return Base64ImageSource.MediaType.IMAGE_PNG;
        if (name.endsWith(".gif")) return Base64ImageSource.MediaType.IMAGE_GIF;
        if (name.endsWith(".webp")) return Base64ImageSource.MediaType.IMAGE_WEBP;
        return Base64ImageSource.MediaType.IMAGE_JPEG; // default
    }
}
\`\`\`

### Real use case 1: Receipt scanner (returns structured JSON)

\`\`\`java
@PostMapping("/receipts/scan")
public ReceiptData scanReceipt(@RequestParam MultipartFile file) throws IOException {
    String prompt = """
        Extract the following from this receipt image.
        Return ONLY valid JSON, no explanation:
        {
          "vendor": "store or restaurant name",
          "total": 0.00,
          "date": "YYYY-MM-DD",
          "category": "one of: meals, transport, accommodation, office, other",
          "currency": "INR/USD/GBP/etc",
          "items": ["list of items if visible"]
        }
        If any field is not visible, use null.
        """;

    String json = visionService.analyzeImageBytes(
        file.getBytes(), file.getContentType(), prompt);

    // Parse Claude's JSON response into your ReceiptData object
    return objectMapper.readValue(json, ReceiptData.class);
}
\`\`\`

### Real use case 2: Stack trace screenshot explainer

\`\`\`java
@PostMapping("/debug/explain-screenshot")
public Map<String, String> explainScreenshot(@RequestParam MultipartFile screenshot)
        throws IOException {

    String explanation = visionService.analyzeImageBytes(
        screenshot.getBytes(),
        screenshot.getContentType(),
        """
        This is a screenshot of a Java exception or error.
        1. What is the exception type?
        2. What line in the user's code (not library code) caused it?
        3. What is the most likely cause?
        4. What is the fix?
        Keep it under 150 words. Be direct.
        """
    );

    return Map.of("explanation", explanation);
}
\`\`\``,
      },
      {
        id: 'p5-l3-task',
        type: 'task',
        title: 'Days 46–60 Deliverables',
        content: `**Multi-agent deliverable (Days 46–52)**

Implement the \`researchAndExplain\` orchestrator and call it with 5 different technical topics your team discusses. For each topic:
- Compare the multi-agent output to a single-call output on the same topic
- Write down: Is the multi-agent version noticeably better? By how much?
- What were the token costs? (Research call + Write call vs single call)

**Topics to test:**
1. "HashMap vs TreeMap vs LinkedHashMap — when to use each"
2. "Spring Boot @Transactional — how it works and common mistakes"
3. "CompletableFuture vs Project Reactor — which to use for async Java"
4. "REST vs GraphQL vs gRPC — when to choose each"
5. A topic specific to your team's current work

---

**Vision API deliverable (Days 53–60)**

Build one of these based on what your team actually needs:

**Option A — Receipt Scanner**
Build the \`/receipts/scan\` endpoint. Test it with 5 real receipts (photos from your phone are fine). Measure accuracy: how many fields does it extract correctly?

**Option B — Stack Trace Explainer**
Take 5 real stack traces from your team's Slack or JIRA. Screenshot them. Run through the explainer. Share the results with your team.

**Option C — Architecture Diagram Reviewer**
Take a photo of your most complex system's architecture diagram (whiteboard, Miro, Lucidchart screenshot). Ask: "What are the single points of failure and what should we fix first?" Share the output with your tech lead.

**Your Days 46–60 review:**
\`\`\`
Multi-agent: did it produce better output than single call? YES / NO / SOMETIMES
Multi-agent: token cost comparison: single=___ multi=___
Vision API feature built: ______________________
Vision accuracy on 5 real inputs: ___/5 correct
One surprising thing Claude saw in the image: ________________
\`\`\``,
      },
      {
        id: 'p5-l3-summary',
        type: 'summary',
        title: 'What You Just Added to Your Skillset',
        content: `Multi-agent workflows give you the ability to decompose complex tasks into focused subtasks — each Claude call doing one job well. The orchestrator pattern (your Java code passing outputs between agents) scales to any number of steps.

The Vision API removes the text-only limitation. Your users can now interact with Claude using screenshots, photos, and diagrams — inputs that were previously impossible to process automatically.

Days 61–90 take everything you have built and make it production-grade: circuit breakers, A/B testing, cost controls, and the documentation that turns your work into something others can maintain and extend.`,
      },
    ],
  },

  // ── Days 61-90: Production Hardening ──────────────────────────────────────
  {
    id: 'p5-l4',
    phase: 5,
    lesson: 16,
    title: 'Days 61–75: Production Hardening — Circuit Breakers, A/B Testing, and Cost Control',
    subtitle: 'Make your AI features as reliable as the rest of your backend',
    duration: '55 min',
    difficulty: 'Advanced',
    tags: ['resilience4j', 'circuit-breaker', 'ab-testing', 'cost-alerts', 'production-safety', 'fallbacks'],
    checkpoints: [
      'What does a circuit breaker do when it "opens"? What happens to Claude calls while it is open?',
      'Write the Resilience4j circuit breaker configuration for a Claude integration.',
      'Describe how to run a prompt A/B test — what do you randomise, what do you measure?',
      'What is an ADR and what are the five sections it should cover for your AI integration?',
    ],
    sections: [
      {
        id: 'p5-l4-why',
        type: 'why',
        title: 'Why "It Works" Is Not the Same as "It Is Production Ready"',
        content: `Your AI feature works. You have used it. Teammates have used it. It is time to deploy it properly.

Here is what happens to unprotected Claude integrations in production:
- **Claude has an outage** (rare but real — all external services go down) → your feature throws exceptions → your entire endpoint fails → users see 500 errors → your on-call gets paged
- **A prompt injection attack** floods your API with crafted inputs that generate thousands of tokens → your monthly bill spikes overnight → Anthropic suspends your account
- **A well-intentioned engineer** changes the system prompt "just slightly" → quality drops → you notice two weeks later when users complain
- **Your rate limit is hit** at peak traffic → every call fails until the limit resets

Production hardening means: when things go wrong (and they will), your feature degrades gracefully instead of failing catastrophically. This is the same discipline you apply to databases, external APIs, and message queues.`,
      },
      {
        id: 'p5-l4-concept-cb',
        type: 'concept',
        title: 'Circuit Breakers With Resilience4j — Stop Calling a Failing Service',
        content: `### What a circuit breaker does

The name comes from electrical engineering. A circuit breaker in a building cuts power when it detects dangerous conditions — protecting the wiring. A software circuit breaker cuts calls to a failing service — protecting your application.

**Three states:**

**CLOSED (normal):** Calls go through. The circuit breaker counts failures.

**OPEN (tripped):** Too many failures. All calls fail immediately without hitting Claude — your fallback runs instead. This gives Claude time to recover without being hammered.

**HALF_OPEN (testing):** After a cooldown period, let a few calls through. If they succeed, return to CLOSED. If they fail, go back to OPEN.

### Why this matters for Claude specifically

Without a circuit breaker, when Claude is slow or down:
- Every call blocks for 30+ seconds before timing out
- Thread pool fills up with waiting calls
- Your whole service slows down
- Users see everything as slow, not just the AI feature

With a circuit breaker:
- After 5 failures, all calls fail immediately (< 1ms) with a fallback response
- Users get "AI review temporarily unavailable" instead of a 30-second hang
- The rest of your service runs normally
- Claude calls resume automatically when the service recovers`,
      },
      {
        id: 'p5-l4-code-cb',
        type: 'code',
        title: 'Resilience4j Circuit Breaker — Complete Spring Boot Setup',
        content: `\`\`\`xml
<!-- Add to pom.xml -->
<dependency>
    <groupId>io.github.resilience4j</groupId>
    <artifactId>resilience4j-spring-boot3</artifactId>
    <version>2.2.0</version>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-aop</artifactId>
</dependency>
\`\`\`

\`\`\`yaml
# application.yml — configure the circuit breaker
resilience4j:
  circuitbreaker:
    instances:
      claude-api:
        # When to open the circuit
        failure-rate-threshold: 50          # open if 50% of calls fail
        slow-call-rate-threshold: 80        # open if 80% of calls take > slow-call-duration
        slow-call-duration-threshold: 30s   # calls taking > 30s count as "slow"
        sliding-window-size: 10             # measure over the last 10 calls
        minimum-number-of-calls: 5          # need at least 5 calls before evaluating

        # How long to stay open
        wait-duration-in-open-state: 30s    # wait 30s before trying half-open

        # Half-open configuration
        permitted-number-of-calls-in-half-open-state: 3  # test with 3 calls

  timelimiter:
    instances:
      claude-api:
        timeout-duration: 45s               # fail if Claude takes > 45s
\`\`\`

\`\`\`java
// ResilientClaudeService.java — wraps your Claude calls
@Service
public class ResilientClaudeService {

    private final AnthropicClient client;
    private final CircuitBreakerRegistry cbRegistry;

    public ResilientClaudeService(AnthropicClient client, CircuitBreakerRegistry cbRegistry) {
        this.client = client;
        this.cbRegistry = cbRegistry;
    }

    public String callWithFallback(MessageCreateParams params, String featureName) {
        CircuitBreaker cb = cbRegistry.circuitBreaker("claude-api");

        try {
            // Wrap the call — throws CallNotPermittedException if circuit is OPEN
            return cb.executeSupplier(() -> {
                Message response = client.messages().create(params);
                return response.content().get(0).text().orElse("");
            });
        } catch (CallNotPermittedException e) {
            // Circuit is OPEN — Claude is having issues, return fallback immediately
            return fallbackResponse(featureName, "Service temporarily unavailable");
        } catch (Exception e) {
            // Actual call failed — circuit breaker records this failure
            return fallbackResponse(featureName, "Error: " + e.getMessage());
        }
    }

    private String fallbackResponse(String featureName, String reason) {
        // Design your fallback based on what makes sense for your feature:
        return switch (featureName) {
            case "code-review" ->
                "Automated review temporarily unavailable. Please request a manual review.";
            case "stack-explainer" ->
                "AI explanation unavailable. Check the error message and stack trace directly.";
            case "rag-qa" ->
                "Knowledge base search unavailable. Please search Confluence directly.";
            default ->
                "AI feature temporarily unavailable. Please try again in a few minutes.";
        };
    }
}
\`\`\`

### Monitor the circuit breaker state

\`\`\`java
// Log circuit breaker events so you know when and why it trips
@EventListener
public void onCircuitBreakerEvent(CircuitBreakerOnStateTransitionEvent event) {
    log.warn("Circuit breaker {} transitioned: {} → {}",
        event.getCircuitBreakerName(),
        event.getStateTransition().getFromState(),
        event.getStateTransition().getToState());

    if (event.getStateTransition().getToState() == CircuitBreaker.State.OPEN) {
        // Alert your team — Claude API is having issues
        alertService.send("Claude circuit breaker OPENED — check Anthropic status page");
    }
}
\`\`\``,
      },
      {
        id: 'p5-l4-concept-ab',
        type: 'concept',
        title: 'Prompt A/B Testing — How to Know If Your Prompts Actually Improved',
        content: `### Why A/B test prompts

You have been running one system prompt for weeks. A colleague suggests a "better" version. How do you know which is actually better?

**Without A/B testing:** You guess. Or you switch and watch for complaints.

**With A/B testing:** You assign different users (or requests) to different prompt versions, measure a quality signal, and pick the winner with data.

### What to measure

The hardest part of prompt A/B testing is defining what "better" means. Options:

| Signal | How to collect | What it tells you |
|---|---|---|
| Output token count | From usage.outputTokens() | Shorter = more concise (usually better) |
| Format compliance | Regex or JSON parse success rate | Does the prompt produce structured output reliably? |
| User acceptance | Did the user ask a follow-up? | Implicit signal: follow-up = answer was incomplete |
| Explicit rating | Add a thumbs up/down API | Direct signal (needs UI change) |
| Business outcome | Did the suggested fix resolve the bug? | Best signal, hardest to collect |

### Implementation

\`\`\`java
// PromptExperiment.java — simple A/B assignment and tracking
@Service
public class PromptExperiment {

    private static final String PROMPT_V1 = """
        You are an expert Java code reviewer. Review the submitted code for bugs,
        performance issues, and style problems. List up to 5 issues by severity.
        """;

    private static final String PROMPT_V2 = """
        You are an expert Java code reviewer with 15 years of experience in high-scale systems.
        Review the submitted code. For each issue found:
        - State the severity: CRITICAL / WARNING / SUGGESTION
        - Quote the exact problematic line
        - Explain why it is a problem
        - Provide a corrected version

        Focus on: null safety, resource leaks, thread safety, and performance. Max 5 issues.
        """;

    private final Random random = new Random();

    public record ExperimentResult(String version, String prompt, String output,
                                   long inputTokens, long outputTokens) {}

    public ExperimentResult runReview(String javaCode, String sessionId) {
        // Assign version based on session ID hash — same user always gets same version
        // (use random for fully random assignment)
        String version = (Math.abs(sessionId.hashCode()) % 2 == 0) ? "v1" : "v2";
        String systemPrompt = "v1".equals(version) ? PROMPT_V1 : PROMPT_V2;

        Message response = client.messages().create(
            MessageCreateParams.builder()
                .model(Model.CLAUDE_SONNET_4_6)
                .maxTokens(1024L)
                .system(systemPrompt)
                .addUserMessage(javaCode)
                .build()
        );

        String output = response.content().get(0).text().orElse("");

        // Log for analysis — query these logs after 2 weeks
        log.info("EXPERIMENT feature=code-review version={} session={} " +
                 "input_tokens={} output_tokens={} has_critical={}",
            version, sessionId,
            response.usage().inputTokens(),
            response.usage().outputTokens(),
            output.contains("CRITICAL"));

        return new ExperimentResult(version, systemPrompt, output,
            response.usage().inputTokens(), response.usage().outputTokens());
    }
}
\`\`\`

### Reading your experiment results (after 2 weeks)

\`\`\`bash
# Query your logs for the experiment data
grep "EXPERIMENT feature=code-review" application.log | \\
    awk '{print $NF}' | \\
    sort | \\
    uniq -c

# Or if you stored to a DB table:
SELECT
    version,
    COUNT(*) as calls,
    AVG(output_tokens) as avg_output_tokens,
    AVG(CASE WHEN has_critical THEN 1 ELSE 0 END) as critical_rate
FROM experiment_log
WHERE feature = 'code-review'
  AND created_at > NOW() - INTERVAL '14 days'
GROUP BY version;
\`\`\`

Pick the version that: finds more critical issues (the real goal), uses fewer tokens, and produces output that developers actually act on.`,
      },
      {
        id: 'p5-l4-concept-costs',
        type: 'concept',
        title: 'Cost Alerts and the ADR — The Last Two Production Steps',
        content: `### Setting Cost Alerts in the Anthropic Console

**Step 1:** Go to [console.anthropic.com](https://console.anthropic.com) → Billing → Usage → Set alert.

**Step 2:** Set your monthly alert threshold. Recommendation: start at 2× your average monthly spend.

Example: You have been spending ~₹4,000/month for 60 days. Set an alert at ₹8,000. This gives you room for normal growth but catches runaway costs before they become painful.

**What causes unexpected cost spikes (common mistakes):**
- A retry loop that does not have a maximum retry count — one bad request retries 1,000 times
- A batch job that accidentally runs in a tight loop — 10,000 calls instead of 10
- A user who has discovered how to craft inputs that generate very long outputs (prompt injection)
- A new feature added without token tracking — you do not notice until the bill arrives

**Response to a cost spike:**
1. Pull your token usage logs — which \`feature\` tag accounts for the spike?
2. Check the timestamp — when did it start? What deployment happened around that time?
3. If it is a runaway loop, kill the process immediately
4. Add a circuit breaker on that feature
5. Add a per-user or per-session call rate limit

---

### Writing the ADR (Architecture Decision Record)

An ADR documents why you made a technical choice. It costs 1 hour to write and saves 10 hours of future confusion when a new team member asks "why do we use Claude and not GPT-4?" or "why is the system prompt stored in a file and not the database?"

**Template — fill this in for your integration:**

\`\`\`markdown
# ADR-001: Claude API Integration for [Feature Name]

**Date:** [today]
**Status:** Accepted
**Authors:** [your name]

## Context
[One paragraph: what problem does this solve? Why did we need AI here?
What alternatives did we consider?]

## Decision
We use Anthropic Claude ([model name]) via the official Java SDK for [feature].
The integration follows the [pattern: single call / RAG / multi-agent] architecture.

## Rationale
- **Why Claude over GPT-4:** [your reason — e.g. better Java code understanding in testing, 200K context window for long files]
- **Why [model] over others in the Claude family:** [e.g. Haiku: cost and speed acceptable for classification; Sonnet: needed for complex reasoning]
- **Why [architecture pattern]:** [e.g. RAG: docs too large for direct context; single call: task is simple enough]

## Implementation
- System prompt: stored in [location] and versioned in git
- API key: stored in [AWS Secrets Manager / env var / Vault]
- Circuit breaker: Resilience4j, configured in application.yml
- Fallback: [describe the fallback behaviour]
- Token tracking: logged via [ClaudeUsageTracker / Micrometer / CloudWatch]

## Cost Model
- Average tokens per call: input=X output=Y
- Estimated monthly cost at [N] calls/day: ₹[amount]
- Cost alert set at: ₹[threshold]

## Consequences
- Positive: [list the benefits you expect]
- Risks: [list the risks and how you mitigate them]
- Future: [what would you change for v2?]
\`\`\``,
      },
      {
        id: 'p5-l4-task',
        type: 'task',
        title: 'Days 61–75 Checklist — Production Hardening',
        content: `**Circuit breaker (Days 61–64)**
- [ ] Add Resilience4j dependency to pom.xml
- [ ] Configure \`claude-api\` circuit breaker in application.yml
- [ ] Wrap all Claude calls in \`ResilientClaudeService.callWithFallback()\`
- [ ] Write a test: call Claude with an invalid API key → verify fallback response is returned
- [ ] Add circuit breaker state logging

**Prompt A/B test (Days 65–70)**
- [ ] Write PROMPT_V2 for one of your existing features
- [ ] Implement version assignment (hash-based or random)
- [ ] Add experiment logging
- [ ] Run for one week with real traffic
- [ ] Pull the data — which version won?

**Cost alert (Day 71)**
- [ ] Open console.anthropic.com
- [ ] Find your average monthly spend from the usage dashboard
- [ ] Set an alert at 2× that amount
- [ ] Done — this takes 5 minutes and saves potential nightmares

**ADR (Days 72–75)**
- [ ] Copy the ADR template above
- [ ] Fill in every section for your main Claude integration
- [ ] Share it with one teammate — ask: "Does this explain why we made these choices?"
- [ ] Commit it to your git repository under \`docs/adr/\`

**Present to your team (Day 75)**
Book 15 minutes in your next team meeting. Show:
1. The feature — a live demo
2. The cost — real numbers from your token tracking
3. One thing that went wrong and how you fixed it
4. What's next (your Days 76–90 plan)

The act of presenting forces you to understand your work at a deeper level. Their questions become your v2 backlog.`,
      },
      {
        id: 'p5-l4-summary',
        type: 'summary',
        title: 'What Production Hardening Actually Means',
        content: `Production hardening is not about making your code perfect. It is about making your feature fail gracefully, recover automatically, and give you the data to improve it.

After Days 61–75 you have:
- A circuit breaker that prevents Claude's issues from cascading into your service
- A fallback that users see instead of error messages
- An A/B test with real data showing which prompt version performs better
- A cost alert that catches runaway spend before it becomes a problem
- An ADR that means any future team member can understand your decisions in 10 minutes

One more phase to go: the production metrics that tell you whether all of this is actually working.`,
      },
    ],
  },

  // ── Days 76-90: Metrics + Final Checklist ─────────────────────────────────
  {
    id: 'p5-l5',
    phase: 5,
    lesson: 17,
    title: 'Days 76–90: Production Metrics, the CEO Conversation, and Your Final Checklist',
    subtitle: 'Four metrics that prove your AI feature works — and an honest accounting of what you built',
    duration: '40 min',
    difficulty: 'Intermediate',
    tags: ['metrics', 'micrometer', 'grafana', 'roi', 'production-checklist', 'p99-latency', 'cost-per-call'],
    checkpoints: [
      'Write the Java code that tracks P99 latency for Claude calls using Micrometer.',
      'Calculate the ROI for your AI feature using the cost-vs-value template.',
      'What does a high error rate on "rate_limit" errors tell you, and what is the fix?',
      'Go through the production checklist — how many items can you check off right now?',
    ],
    sections: [
      {
        id: 'p5-l5-why',
        type: 'why',
        title: 'Why Metrics Are the Last Step, Not an Afterthought',
        content: `You have built features. You have hardened them for production. Now you need to prove they work.

Not "I think it works." Not "the tests pass." Prove it with numbers that a non-technical stakeholder can read and understand.

The four metrics in this lesson are the difference between:
- "The AI review feature is working great" (no one can verify this)
- "The AI review feature has a P99 latency of 8 seconds, processes 200 reviews/day, costs ₹4,500/month, and saves the team approximately 50 hours/month of manual review time" (everyone can evaluate this)

The second version gets budget approved, gets the feature maintained, and gets you recognised for building something that has real business value.`,
      },
      {
        id: 'p5-l5-concept-latency',
        type: 'concept',
        title: 'Metric 1: P99 Latency — Is Your Feature Fast Enough?',
        content: `### What P99 latency means

P99 = the 99th percentile of your response times. 99% of your calls complete within this time.

If your P99 is 15 seconds, 1 in every 100 users waits 15+ seconds. That user thinks the feature is broken. How many users is "1 in 100" for your scale?

### How to measure with Micrometer

\`\`\`java
// Add to pom.xml
// io.micrometer:micrometer-registry-prometheus or micrometer-registry-cloudwatch

// In your Claude service wrapper
@Service
public class MeteredClaudeService {

    private final AnthropicClient client;
    private final MeterRegistry meterRegistry;

    public MeteredClaudeService(AnthropicClient client, MeterRegistry meterRegistry) {
        this.client = client;
        this.meterRegistry = meterRegistry;
    }

    public String callAndMeasure(MessageCreateParams params, String featureName) {
        Timer.Sample sample = Timer.start(meterRegistry);

        try {
            Message response = client.messages().create(params);
            String text = response.content().get(0).text().orElse("");

            // Record success timing
            sample.stop(Timer.builder("claude.request.duration")
                .tag("feature", featureName)
                .tag("model", params.model().toString())
                .tag("status", "success")
                .publishPercentiles(0.5, 0.95, 0.99) // P50, P95, P99
                .register(meterRegistry));

            // Record token usage
            meterRegistry.summary("claude.tokens.input",
                "feature", featureName).record(response.usage().inputTokens());
            meterRegistry.summary("claude.tokens.output",
                "feature", featureName).record(response.usage().outputTokens());

            return text;

        } catch (Exception e) {
            // Record failure timing
            sample.stop(Timer.builder("claude.request.duration")
                .tag("feature", featureName)
                .tag("status", "error")
                .tag("error_type", e.getClass().getSimpleName())
                .register(meterRegistry));
            throw e;
        }
    }
}
\`\`\`

### Targets to aim for

| Feature type | Acceptable P99 | Fix if worse |
|---|---|---|
| User-facing, interactive | < 5 seconds | Add streaming so first token appears in < 1s |
| Background processing | < 60 seconds | Acceptable if user is not waiting |
| Batch jobs | < 5 minutes per item | Use Batches API instead |

### Why streaming changes the UX completely

Even if your total P99 is 12 seconds, streaming makes the experience feel instant because the user sees text arriving within 1–2 seconds. Measure both:
- **Time to first token** (user perception) → target < 2 seconds
- **Total response time** (your cost) → separate concern`,
      },
      {
        id: 'p5-l5-concept-errors',
        type: 'concept',
        title: 'Metric 2: Error Rate by Type — What Is Actually Going Wrong?',
        content: `Not all errors are equal. The error type tells you the fix.

\`\`\`java
// Categorise every error — do not just log "something failed"
public String callWithErrorTracking(MessageCreateParams params, String featureName) {
    try {
        Message response = client.messages().create(params);
        meterRegistry.counter("claude.calls",
            "feature", featureName, "status", "success").increment();
        return response.content().get(0).text().orElse("");

    } catch (RateLimitException e) {
        meterRegistry.counter("claude.errors",
            "feature", featureName, "type", "rate_limit").increment();
        log.warn("Rate limit hit for feature={}", featureName);
        throw e;   // Resilience4j retry will handle this

    } catch (TimeoutException e) {
        meterRegistry.counter("claude.errors",
            "feature", featureName, "type", "timeout").increment();
        log.warn("Claude timeout for feature={}", featureName);
        throw e;   // Circuit breaker will track this

    } catch (AnthropicApiException e) {
        String errorType = "api_" + e.statusCode();
        meterRegistry.counter("claude.errors",
            "feature", featureName, "type", errorType).increment();
        log.error("Claude API error: status={} feature={}", e.statusCode(), featureName);
        throw e;

    } catch (Exception e) {
        meterRegistry.counter("claude.errors",
            "feature", featureName, "type", "unexpected").increment();
        log.error("Unexpected Claude error for feature={}: {}", featureName, e.getMessage(), e);
        throw e;
    }
}
\`\`\`

### What each error type tells you

| Error type | What it means | Fix |
|---|---|---|
| \`rate_limit\` > 1% | You are hitting your rate limit regularly | Add exponential backoff; request a rate limit increase from Anthropic |
| \`timeout\` > 0.5% | Claude is slow or your timeout is too aggressive | Add streaming; increase timeout; check if prompt is too long |
| \`api_400\` | Your request is malformed | Log the full params; fix the prompt or parameter |
| \`api_500\` > 0.1% | Anthropic server issue | Ensure circuit breaker is open; check Anthropic status page |
| \`unexpected\` > 0.1% | Bug in your code | Log full stack trace; fix the bug |

### Production target

Total error rate < 1%. If any single error type exceeds 0.5%, investigate and fix before moving on.`,
      },
      {
        id: 'p5-l5-concept-roi',
        type: 'concept',
        title: 'Metric 3 and 4: Tokens Per Call + The ROI Calculation',
        content: `### Metric 3: Average tokens per call

\`\`\`java
// Grafana query for average tokens (if using Prometheus + Micrometer)
// rate(claude_tokens_input_sum[7d]) / rate(claude_tokens_input_count[7d])
// This gives you average input tokens per call over the last 7 days
\`\`\`

**What the numbers tell you:**

- **Input tokens steadily increasing week-over-week:** Your prompts or context are growing. Audit what you are adding. Is it necessary?
- **Input tokens > 10× output tokens:** You may be sending too much context. Try retrieving fewer RAG chunks, shortening your system prompt.
- **Output tokens consistently at your maxTokens limit:** Claude is hitting your cap and truncating. Increase maxTokens or redesign the prompt to ask for shorter output.

---

### Metric 4: The ROI Calculation — The CEO Conversation

This is the metric that determines whether your feature gets budget, gets maintained, and gets you recognised for building something valuable.

**The template:**

\`\`\`
Feature name:           [one sentence]
Monthly Claude cost:    ₹ [from your token tracking × 30 days]
What it replaces:       [the manual work it eliminates]
Volume per month:       [number of times the feature runs]
Time saved per use:     [minutes] × [developer hourly rate ₹]
                        = ₹[value per use]
Total monthly value:    [volume] × [value per use] = ₹[total]

ROI:                    ₹[total value] ÷ ₹[cost] = [X]× return
\`\`\`

**Example 1 — Code review assistant:**
\`\`\`
Monthly Claude cost:    ₹6,000
Feature:                Automated Java code review on every PR
Volume:                 150 PRs reviewed per month
Time saved per PR:      45 min × senior developer ₹2,000/hr = ₹1,500/PR
Total monthly value:    150 × ₹1,500 = ₹2,25,000
ROI:                    ₹2,25,000 ÷ ₹6,000 = 37.5× return
\`\`\`

**Example 2 — Internal knowledge base (RAG):**
\`\`\`
Monthly Claude cost:    ₹3,500
Feature:                Q&A over internal wiki — "how do we do X here?"
Volume:                 200 questions answered per month
Time saved per question: 20 min search + 10 min reading = 30 min × ₹1,500/hr = ₹750
Total monthly value:    200 × ₹750 = ₹1,50,000
ROI:                    ₹1,50,000 ÷ ₹3,500 = 43× return
\`\`\`

**What to do if your ROI is low (< 5×):**
- The feature may not be saving enough time — is it actually being used?
- The prompts may be too expensive — can you switch to Haiku?
- The use case may not be the right one — try a different feature

**What to do when your ROI is high:**
- Document it (the ADR you already wrote)
- Present it to your manager or tech lead
- Propose expansion: more features, more documents indexed, more team members using it`,
      },
      {
        id: 'p5-l5-code-dashboard',
        type: 'code',
        title: 'Complete Metrics Dashboard — Everything in One Place',
        content: `### Spring Boot Actuator + Micrometer setup

\`\`\`yaml
# application.yml — expose metrics endpoint
management:
  endpoints:
    web:
      exposure:
        include: health,metrics,prometheus
  metrics:
    export:
      prometheus:
        enabled: true  # if using Grafana + Prometheus
\`\`\`

### One-stop service that combines all metrics

\`\`\`java
// ClaudeMetricsService.java — production-ready wrapper for all Claude calls
@Service
public class ClaudeMetricsService {

    private final AnthropicClient client;
    private final MeterRegistry registry;
    private final CircuitBreaker circuitBreaker;

    public ClaudeMetricsService(AnthropicClient client, MeterRegistry registry,
                                CircuitBreakerRegistry cbRegistry) {
        this.client = client;
        this.registry = registry;
        this.circuitBreaker = cbRegistry.circuitBreaker("claude-api");
    }

    public record CallResult(String text, long inputTokens, long outputTokens,
                              long latencyMs, boolean fromFallback) {}

    public CallResult call(MessageCreateParams params, String featureName, String fallback) {
        long start = System.currentTimeMillis();

        try {
            CallResult result = circuitBreaker.executeSupplier(() -> {
                Message response = client.messages().create(params);
                String text = response.content().get(0).text().orElse("");
                long latency = System.currentTimeMillis() - start;

                // Record all metrics
                Timer.builder("claude.latency")
                    .tag("feature", featureName)
                    .tag("model", params.model().toString())
                    .publishPercentiles(0.5, 0.95, 0.99)
                    .register(registry)
                    .record(latency, TimeUnit.MILLISECONDS);

                registry.summary("claude.tokens.input", "feature", featureName)
                    .record(response.usage().inputTokens());
                registry.summary("claude.tokens.output", "feature", featureName)
                    .record(response.usage().outputTokens());

                registry.counter("claude.calls", "feature", featureName, "status", "success")
                    .increment();

                return new CallResult(text, response.usage().inputTokens(),
                    response.usage().outputTokens(), latency, false);
            });

            return result;

        } catch (CallNotPermittedException e) {
            registry.counter("claude.calls", "feature", featureName, "status", "circuit_open")
                .increment();
            return new CallResult(fallback, 0, 0, 0, true);

        } catch (Exception e) {
            long latency = System.currentTimeMillis() - start;
            registry.counter("claude.errors",
                "feature", featureName,
                "type", e.getClass().getSimpleName())
                .increment();
            return new CallResult(fallback, 0, 0, latency, true);
        }
    }
}
\`\`\`

### Grafana dashboard panels to create

\`\`\`
Panel 1: Request volume by feature (bar chart, 24h)
  Metric: rate(claude_calls_total[1h])
  Group by: feature

Panel 2: P99 latency by feature (time series)
  Metric: histogram_quantile(0.99, rate(claude_latency_seconds_bucket[5m]))
  Group by: feature

Panel 3: Error rate by type (pie chart, 24h)
  Metric: rate(claude_errors_total[24h])
  Group by: type

Panel 4: Average tokens per call (time series)
  Metric: rate(claude_tokens_input_sum[1h]) / rate(claude_tokens_input_count[1h])
  Group by: feature

Panel 5: Estimated daily cost (stat panel)
  Metric: (sum(increase(claude_tokens_input_total[24h])) * 3 +
           sum(increase(claude_tokens_output_total[24h])) * 15) / 1000000
  Unit: USD
\`\`\``,
      },
      {
        id: 'p5-l5-checklist',
        type: 'task',
        title: 'The Production Checklist — Your 90-Day Final Review',
        content: `Go through this checklist honestly. Every unchecked item is a known risk.

**Security**
- [ ] API key stored in env var or Secrets Manager — never in source code or committed config files
- [ ] API key is a dedicated key for this app — not shared with other projects
- [ ] Input validation: max length enforced before sending to Claude
- [ ] Prompt injection prevention: user input is clearly separated from system instructions

**Reliability**
- [ ] Circuit breaker configured (Resilience4j or equivalent)
- [ ] Fallback response defined for every Claude call
- [ ] Retry with exponential backoff (Resilience4j retry or custom)
- [ ] Timeout set (Claude calls should not block indefinitely)

**Observability**
- [ ] Every Claude call logs: feature name, model, input tokens, output tokens
- [ ] Estimated cost logged per call
- [ ] Error type tracked and counted by category
- [ ] P99 latency tracked via Micrometer or equivalent
- [ ] At least one dashboard panel showing daily/weekly cost

**Cost control**
- [ ] Monthly budget alert set in Anthropic console
- [ ] Maximum retry count set (not infinite retries)
- [ ] Model tier appropriate for the task (Haiku for simple tasks, not Sonnet)
- [ ] MaxTokens set conservatively for each feature

**Quality**
- [ ] System prompt versioned in git (not hardcoded in Java class)
- [ ] At least one A/B test run — you have data about what works
- [ ] At least one teammate has reviewed the system prompt

**Documentation**
- [ ] ADR written and committed to the repository
- [ ] README explains how to run, configure, and test the AI feature
- [ ] Runbook: what to do if the circuit breaker opens

**Presented to team**
- [ ] Live demo to at least 2 teammates
- [ ] Cost and ROI numbers shared
- [ ] Their feedback has been written down

---

**Your 90-day final numbers:**

\`\`\`
Features shipped:                    _______________
Total Claude calls made:             _______________
Average cost per call:               ₹______________
Estimated monthly cost:              ₹______________
Estimated monthly value (ROI):       ₹______________
ROI multiple:                        ___× return
Teammates who used your features:    _______________
Biggest surprise:                    _______________
One thing you would do differently:  _______________
\`\`\`

If you can fill in every line of this, you did not just finish a course. You became an AI developer.`,
      },
      {
        id: 'p5-l5-summary',
        type: 'summary',
        title: 'What 90 Days of Focused Work Builds',
        content: `You started this course not knowing how to call the Claude API. You finish the 90-day plan with:

**Technical skills:**
- Claude API integration in Java with the official SDK
- System prompts, multi-turn conversations, streaming
- Tool use and multi-agent orchestration
- RAG with pgvector and Spring Boot
- Vision API for image understanding
- Circuit breakers, fallbacks, and production resilience
- Token tracking, latency metrics, cost calculation

**Process skills:**
- Shipping real features used by real people
- Measuring what matters (not just "does it work" but "how well and at what cost")
- A/B testing prompts with data, not intuition
- Writing ADRs that make your decisions understandable to future team members
- Presenting AI work to stakeholders with numbers that justify the investment

**The most important thing:**

Throughout these 90 days, the constant theme was *ship something real*. Not because demos and toy projects are worthless — they are how you learn. But because real features, used by real people, on real problems, reveal things that no tutorial can teach.

The production error that happens at 3am. The user who does something with your feature you never imagined. The prompt that works perfectly in testing and catastrophically on some edge case in production. The ROI calculation that makes your manager want to fund three more AI features.

Those experiences are what separate "I know the API" from "I ship AI products." You now have the foundation. What you build on it is up to you.`,
      },
    ],
  },
];
