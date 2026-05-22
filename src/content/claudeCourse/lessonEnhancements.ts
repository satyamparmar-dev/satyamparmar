/**
 * Additional course sections (official Anthropic docs reference).
 * Appended before each lesson's first "summary" section — existing content is untouched.
 * @see https://platform.claude.com/docs/en/api/sdks/java
 * @see https://platform.claude.com/docs/en/build-with-claude/working-with-messages
 */

export type EnhancementSectionType = 'why' | 'analogy' | 'concept' | 'code' | 'task' | 'summary';

export interface LessonEnhancementSection {
  id: string;
  type: EnhancementSectionType;
  title: string;
  content: string;
}

export const CLAUDE_LESSON_ENHANCEMENTS: Record<string, LessonEnhancementSection[]> = {
  'p1-l1': [
    {
      id: 'p1-l1-extra-concept-official',
      type: 'concept',
      title: 'Official docs: Messages API vs Claude Managed Agents',
      content: `Anthropic documents two ways to build ([Working with Messages](https://platform.claude.com/docs/en/build-with-claude/working-with-messages)):

| | **Messages API** | **Claude Managed Agents** |
|---|---|---|
| What | Direct model access from your code | Pre-built agent harness on Anthropic infra |
| Control | Full — you own the loop | Delegated to Anthropic infra |
| Best for | Custom loops, fine control (this course) | Long-running / async agent workloads |
| State | You manage history | Managed for you |

**This course uses the Messages API** — you own the Java app, HTTP calls, and conversation state. This gives you maximum flexibility and is what most production Java integrations use.

**The raw HTTP shape** (useful for debugging Postman or gateway logs):
\`\`\`
POST https://api.anthropic.com/v1/messages
Headers:
  x-api-key: $ANTHROPIC_API_KEY
  anthropic-version: 2023-06-01
  content-type: application/json
Body:
  { "model": "claude-sonnet-4-6", "max_tokens": 256,
    "messages": [{"role": "user", "content": "Hello"}] }
\`\`\`

The Java SDK builds this for you — no manual header setting needed.`,
    },
    {
      id: 'p1-l1-extra-code-curl',
      type: 'code',
      title: 'See the Same Request Without the SDK (Debugging Aid)',
      content: `When something breaks, knowing the raw API helps you diagnose it in Postman or \`curl\`:

\`\`\`bash
curl https://api.anthropic.com/v1/messages \\
  --header "x-api-key: $ANTHROPIC_API_KEY" \\
  --header "anthropic-version: 2023-06-01" \\
  --header "content-type: application/json" \\
  --data '{
    "model": "claude-sonnet-4-6",
    "max_tokens": 256,
    "messages": [{"role": "user", "content": "Say hello in one sentence."}]
  }'
\`\`\`

Your Java code is exactly equivalent to this. The SDK handles the header serialization so you do not have to. If your Java call fails and the same curl works, the problem is your Java client config. If both fail, the problem is your API key or network.`,
    },
    {
      id: 'p1-l1-extra-task',
      type: 'task',
      title: 'Lab: Map Your Use Case to the API Shape',
      content: `Fill in this table for **your** team (this forces you to think through the integration before writing code):

| Use case | Input you would send | System prompt role | Who consumes the output |
|----------|----------------------|-------------------|------------------------|
| Example: PR review | Java file + commit message | "Senior Java reviewer" | Developer in IDE |
| Your idea 1 | | | |
| Your idea 2 | | | |
| Your idea 3 | | | |

Share one row with a colleague. If you cannot describe the input clearly, the integration design is not ready to build yet. Ambiguous inputs lead to ambiguous prompts lead to bad outputs.`,
    },
  ],

  'p1-l2': [
    {
      id: 'p1-l2-extra-concept-official',
      type: 'concept',
      title: 'Official Java SDK Install (Verify Latest on GitHub)',
      content: `From [Java SDK docs](https://platform.claude.com/docs/en/api/sdks/java) — always verify the latest version on [github.com/anthropics/anthropic-sdk-java](https://github.com/anthropics/anthropic-sdk-java):

**Requirements:** Java 8+ minimum (this course uses Java 11+ features like \`Files.readString\`, text blocks).

**Auth env vars (system properties override env):**

| Builder method | Environment variable | Default |
|----------------|---------------------|---------|
| \`.apiKey()\` | \`ANTHROPIC_API_KEY\` | required |
| \`.authToken()\` | \`ANTHROPIC_AUTH_TOKEN\` | optional |
| \`.baseUrl()\` | \`ANTHROPIC_BASE_URL\` | \`https://api.anthropic.com\` |

The \`baseUrl\` override is useful for testing against a mock server or proxy.

> **Official guidance:** Do not create more than one \`AnthropicClient\` per application — share one instance. It manages HTTP connection pools and thread pools internally.`,
    },
    {
      id: 'p1-l2-extra-code-fromenv',
      type: 'code',
      title: 'Recommended: AnthropicOkHttpClient.fromEnv()',
      content: `The official quick start uses environment-based configuration:

\`\`\`java
import com.anthropic.client.AnthropicClient;
import com.anthropic.client.okhttp.AnthropicOkHttpClient;

// Reads ANTHROPIC_API_KEY (and optional ANTHROPIC_BASE_URL) from environment
AnthropicClient client = AnthropicOkHttpClient.fromEnv();
\`\`\`

**Manual override** (useful for integration tests with a mock server):
\`\`\`java
AnthropicClient testClient = AnthropicOkHttpClient.builder()
    .fromEnv()                            // picks up any env vars first
    .baseUrl("http://localhost:8080")     // override for mock
    .apiKey("test-key")                   // override for test
    .maxRetries(0)                        // no retries in tests
    .build();
\`\`\`

**Spring Boot — register as a @Bean:**
\`\`\`java
@Configuration
public class AnthropicConfig {
    @Bean
    public AnthropicClient anthropicClient() {
        // In production: @Value("\${anthropic.api-key}") bound to env var in application.yml
        return AnthropicOkHttpClient.fromEnv();
    }
}
\`\`\`

**application.yml pattern (never commit the value):**
\`\`\`yaml
anthropic:
  api-key: \${ANTHROPIC_API_KEY}  # reads from OS env var
\`\`\``,
    },
    {
      id: 'p1-l2-extra-task',
      type: 'task',
      title: 'Lab: Verify Dependency and Client Creation',
      content: `1. Add \`anthropic-java\` at the version shown on the [GitHub releases page](https://github.com/anthropics/anthropic-sdk-java/releases)
2. Verify dependency resolved — run one of:
   - Maven: \`mvn dependency:tree | findstr anthropic\`
   - Gradle: \`./gradlew dependencies | grep anthropic\`
3. Confirm exactly **one** \`anthropic-java\` artifact (no duplicates, no version conflicts)
4. Add this to your \`SetupCheck\` class and run it:

\`\`\`java
AnthropicClient client = AnthropicOkHttpClient.fromEnv();
System.out.println("Client created: " + client.getClass().getSimpleName());
\`\`\`

If this line runs without exception, your SDK is correctly installed and configured.`,
    },
  ],

  'p1-l3': [
    {
      id: 'p1-l3-extra-code-official',
      type: 'code',
      title: 'Official Quick Start (Verbatim Baseline)',
      content: `From the Anthropic Java SDK documentation — the canonical starting point:

\`\`\`java
import com.anthropic.client.AnthropicClient;
import com.anthropic.client.okhttp.AnthropicOkHttpClient;
import com.anthropic.models.messages.Message;
import com.anthropic.models.messages.MessageCreateParams;
import com.anthropic.models.messages.Model;

public class OfficialQuickStart {
    public static void main(String[] args) {
        AnthropicClient client = AnthropicOkHttpClient.fromEnv();

        MessageCreateParams params = MessageCreateParams.builder()
            .maxTokens(1024L)
            .addUserMessage("Hello, Claude")
            .model(Model.CLAUDE_OPUS_4_7)
            .build();

        Message message = client.messages().create(params);
        System.out.println(message);  // prints full Message object for debugging
    }
}
\`\`\`

Compare with your \`HelloClaude\` — same three-step flow, different model and message. In your version you also extract the text content; here \`println(message)\` dumps the full JSON-like object (useful for debugging).`,
    },
    {
      id: 'p1-l3-extra-concept-response',
      type: 'concept',
      title: 'Read the Full Message Object Safely',
      content: `Production code should inspect \`stopReason\` and handle content safely. Never call \`.get()\` on an Optional without checking \`isPresent()\` first:

\`\`\`java
Message response = client.messages().create(params);

// Always check why Claude stopped
String stopReason = response.stopReason().toString();
if ("max_tokens".equals(stopReason)) {
    log.warn("Response was truncated! Increase maxTokens or split the task.");
}

// Safe content extraction
String text = response.content().stream()
    .flatMap(block -> block.text().stream())   // only text blocks
    .map(TextBlock::text)                       // get the string
    .collect(Collectors.joining("\\n"));         // join if multiple blocks

if (text.isBlank()) {
    log.warn("Empty response - stopReason={}", stopReason);
    // handle gracefully: return default, retry, or throw
}

// Log usage on every call during development
response.usage().ifPresent(u ->
    log.info("tokens in={} out={} model={}", u.inputTokens(), u.outputTokens(), response.model()));
\`\`\`

| stop_reason | Meaning | Action |
|-------------|---------|--------|
| \`end_turn\` | Normal completion | None |
| \`max_tokens\` | Reply truncated | Increase maxTokens or split task |
| \`stop_sequence\` | Hit configured stop word | Usually intentional |`,
    },
    {
      id: 'p1-l3-extra-task',
      type: 'task',
      title: 'Lab: Break It On Purpose (Learn the Error Types)',
      content: `Run these broken scenarios — knowing what errors look like saves hours of debugging in CI:

**Break 1: No API key**
\`\`\`java
AnthropicClient client = AnthropicOkHttpClient.builder()
    .apiKey("invalid-key-12345")
    .build();
\`\`\`
Note the exception type and message.

**Break 2: maxTokens too small**
\`\`\`java
.maxTokens(3L).addUserMessage("Explain the entire Java Memory Model in detail")
\`\`\`
Observe: \`stopReason\` = \`max_tokens\`. Reply ends mid-sentence.

**Break 3: Empty user message**
\`\`\`java
.addUserMessage("")
\`\`\`
What error does the SDK throw? Does it validate on your side or the server side?

Write down what you observed for each. This is your personal "known issues" log for debugging Claude integrations.`,
    },
  ],

  'p2-l1': [
    {
      id: 'p2-l1-extra-concept-models',
      type: 'concept',
      title: 'Official Model IDs and the Model Enum',
      content: `Pick model based on latency, cost, and task difficulty. Current model tiers ([Models overview](https://platform.claude.com/docs/en/docs/about-claude/models)):

| Model family | Java SDK enum | Best for |
|--------------|--------------|---------|
| Haiku 4.5 | \`Model.CLAUDE_HAIKU_4_5\` | Routing, classification, quick extraction |
| Sonnet 4.6 | \`Model.CLAUDE_SONNET_4_6\` | Code review, Q&A, most dev tasks |
| Opus 4.7 | \`Model.CLAUDE_OPUS_4_7\` | Complex reasoning, architecture review |

> **Check the \`Model\` enum in your SDK version** — new models are added frequently. Use IDE autocomplete on \`Model.\` to see all available options.

**Fallback strategy for resilience:**
\`\`\`java
// Try Sonnet first; fall back to Haiku if rate limited
try {
    return callClaude(client, params, Model.CLAUDE_SONNET_4_6);
} catch (Exception e) {
    if (isRateLimited(e)) {
        log.warn("Sonnet rate limited, falling back to Haiku");
        return callClaude(client, params, Model.CLAUDE_HAIKU_4_5);
    }
    throw e;
}
\`\`\``,
    },
    {
      id: 'p2-l1-extra-code-usage',
      type: 'code',
      title: 'Structured Usage Logging — Cost Dashboard Starter',
      content: `Build a cost-tracking foundation from day one. This prevents surprise bills:

\`\`\`java
public record ApiCall(
    String callId,
    String model,
    String stopReason,
    long inputTokens,
    long outputTokens,
    double estimatedCostUsd,
    Instant timestamp
) {
    // Approximate Sonnet pricing — update per console.anthropic.com
    private static final double INPUT_COST_PER_M = 3.0;
    private static final double OUTPUT_COST_PER_M = 15.0;

    public static ApiCall from(Message response) {
        long in = response.usage().map(u -> u.inputTokens()).orElse(0L);
        long out = response.usage().map(u -> u.outputTokens()).orElse(0L);
        double cost = (in * INPUT_COST_PER_M + out * OUTPUT_COST_PER_M) / 1_000_000.0;
        return new ApiCall(
            response.id(),
            response.model().toString(),
            response.stopReason().toString(),
            in, out, cost, Instant.now()
        );
    }
}

// Usage:
Message response = client.messages().create(params);
ApiCall call = ApiCall.from(response);
log.info("claude call={}", call);  // structured log — queryable in Grafana / CloudWatch
\`\`\`

Collect one week of logs and sum \`estimatedCostUsd\`. That is your daily cost baseline before you add Grafana dashboards or billing alerts.`,
    },
  ],

  'p2-l2': [
    {
      id: 'p2-l2-extra-concept-params',
      type: 'concept',
      title: 'All MessageCreateParams Knobs — Know What You Can Set',
      content: `The \`MessageCreateParams\` builder exposes every API parameter. Here is a reference:

| Parameter | Type | Default | Purpose |
|-----------|------|---------|---------|
| \`model\` | \`Model\` | required | Which Claude model to use |
| \`maxTokens\` | \`long\` | required | Max length of reply |
| \`system\` | \`String\` | optional | System-level instructions |
| \`messages\` | \`List<MessageParam>\` | required | Conversation history |
| \`temperature\` | \`double\` | 1.0 | Randomness (0.0 = deterministic) |
| \`topP\` | \`double\` | none | Nucleus sampling (use OR temperature, not both) |
| \`topK\` | \`int\` | none | Top-K sampling |
| \`stopSequences\` | \`List<String>\` | none | Stop generating at these strings |
| \`metadata\` | object | none | User ID for audit logging |

\`\`\`java
MessageCreateParams.builder()
    .model(Model.CLAUDE_SONNET_4_6)
    .maxTokens(1024L)
    .temperature(0.0)          // deterministic for CI
    .stopSequences(List.of("\`\`\`"))  // stop at end of first code block
    .system("You are a Java reviewer.")
    .addUserMessage(code)
    .build();
\`\`\`

**Stop sequences tip:** If you want Claude to generate exactly one code block and stop, use \`stopSequences(List.of("\`\`\`"))\` — Claude stops when it would close the fence.`,
    },
    {
      id: 'p2-l2-extra-code-spring',
      type: 'code',
      title: 'Externalize Prompts as Versioned Config Files',
      content: `Treat prompts like application config — versioned in git, loaded from classpath:

\`\`\`
src/main/resources/prompts/
  code-review-system.txt        ← main code review prompt
  code-review-security.txt      ← security-focused variant
  doc-summary-system.txt        ← document summarization prompt
\`\`\`

\`\`\`java
// Prompts.java — centralized loader
public final class Prompts {

    private static String load(String filename) {
        try (var stream = Prompts.class.getResourceAsStream("/prompts/" + filename)) {
            if (stream == null) throw new IllegalStateException("Prompt not found: " + filename);
            return new String(stream.readAllBytes(), StandardCharsets.UTF_8).strip();
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to load prompt: " + filename, e);
        }
    }

    public static final String CODE_REVIEW = load("code-review-system.txt");
    public static final String SECURITY_REVIEW = load("code-review-security.txt");
    public static final String DOC_SUMMARY = load("doc-summary-system.txt");

    private Prompts() {}
}
\`\`\`

**Why this matters:** When you change a prompt, the git diff shows exactly what changed. PR reviewers can review your prompt changes just like code changes. Bad prompts cause regressions — treat them with the same discipline.`,
    },
  ],

  'p2-l3': [
    {
      id: 'p2-l3-extra-concept-official',
      type: 'concept',
      title: 'Official Rule: Alternating User / Assistant Roles',
      content: `From [Working with Messages](https://platform.claude.com/docs/en/build-with-claude/working-with-messages):

- Messages are an **ordered list** with alternating \`user\` and \`assistant\` roles
- **First message must be \`user\`** (after optional system at top level)
- You maintain this alternating list in Java

**Common bugs in conversation history:**

\`\`\`java
// BUG: Two consecutive user messages — causes undefined behavior
history.add(userMessage("What is Optional?"));
history.add(userMessage("Give me an example"));  // WRONG — no assistant reply between
\`\`\`

\`\`\`java
// CORRECT: Always interleave
history.add(userMessage("What is Optional?"));
String reply = callClaude(history);
history.add(assistantMessage(reply));      // append Claude's reply first
history.add(userMessage("Give me an example"));  // then next user message
\`\`\`

**Prefill trick — steer Claude's reply format:**

You can end the messages list with an **incomplete assistant message** to force Claude to continue in a specific format:

\`\`\`java
// Force JSON output by starting Claude's reply with "{"
history.add(MessageParam.builder()
    .role(MessageParam.Role.ASSISTANT)
    .content("{\\"issues\\": [")
    .build());
// Claude will continue from where the prefill left off
\`\`\`

Use prefill sparingly. It is most useful for JSON output before you adopt full structured outputs.`,
    },
    {
      id: 'p2-l3-extra-code-service',
      type: 'code',
      title: 'Production-Ready ConversationService with Summarization',
      content: `An enhanced version with automatic summarization when history gets long:

\`\`\`java
public class ConversationService {
    private static final int MAX_TURNS_BEFORE_SUMMARY = 20;
    private final AnthropicClient client;
    private final List<MessageParam> history = new ArrayList<>();
    private final String system;
    private final Model model;

    public ConversationService(AnthropicClient client, String system, Model model) {
        this.client = client;
        this.system = system;
        this.model = model;
    }

    public String send(String userText) {
        // Auto-summarize if history is getting long
        if (history.size() >= MAX_TURNS_BEFORE_SUMMARY * 2) {
            summarizeOldHistory();
        }

        history.add(MessageParam.builder()
            .role(MessageParam.Role.USER).content(userText).build());

        Message response = client.messages().create(
            MessageCreateParams.builder()
                .model(model).maxTokens(1024L).system(system).messages(history).build());

        String reply = extractText(response);

        history.add(MessageParam.builder()
            .role(MessageParam.Role.ASSISTANT).content(reply).build());

        return reply;
    }

    private void summarizeOldHistory() {
        // Take first 80% of history, summarize it, replace with one message
        int cutAt = (int)(history.size() * 0.8);
        List<MessageParam> old = new ArrayList<>(history.subList(0, cutAt));
        history.subList(0, cutAt).clear();

        String summaryPrompt = "Summarize this conversation in 2–3 sentences: " +
            old.stream().map(m -> m.role() + ": " + m.content()).collect(Collectors.joining("\\n"));

        Message summaryMsg = client.messages().create(
            MessageCreateParams.builder()
                .model(Model.CLAUDE_HAIKU_4_5)  // use cheap model for summaries
                .maxTokens(256L)
                .addUserMessage(summaryPrompt)
                .build());

        String summary = extractText(summaryMsg);
        history.add(0, MessageParam.builder()
            .role(MessageParam.Role.USER)
            .content("[Earlier conversation summary: " + summary + "]")
            .build());
    }

    private String extractText(Message m) {
        return m.content().stream()
            .flatMap(b -> b.text().stream())
            .map(TextBlock::text)
            .findFirst().orElse("");
    }
}
\`\`\``,
    },
    {
      id: 'p2-l3-extra-task',
      type: 'task',
      title: 'Lab: Three-Turn Interview Drill',
      content: `Using \`ConversationService\`, run these three turns and verify context carries forward:

**Turn 1:** "What is Java Optional and why was it introduced?"
**Turn 2:** "Show me three practical usage examples" *(must reference Optional from turn 1)*
**Turn 3:** "What are the most common mistakes developers make with it?" *(must reference the examples)*

Then:
1. Call \`trimToLastTurns(1)\` — removes turns 1 and 2
2. Ask: "What was my first question?"
3. Observe: Claude no longer knows (history was trimmed)

This demonstrates that **you control what Claude knows** — and the user experience implications of trimming too aggressively.`,
    },
  ],

  'p2-l4': [
    {
      id: 'p2-l4-extra-code-official-stream',
      type: 'code',
      title: 'Official Streaming Pattern — createStreaming + try-with-resources',
      content: `From [Java SDK — Streaming](https://platform.claude.com/docs/en/api/sdks/java):

\`\`\`java
import com.anthropic.core.http.StreamResponse;
import com.anthropic.models.messages.RawMessageStreamEvent;

MessageCreateParams params = MessageCreateParams.builder()
    .model(Model.CLAUDE_SONNET_4_6)
    .maxTokens(1024L)
    .addUserMessage("Explain Java streams in 3 bullet points.")
    .build();

// try-with-resources: HTTP connection closes automatically when done or on exception
try (StreamResponse<RawMessageStreamEvent> stream =
        client.messages().createStreaming(params)) {

    stream.stream()
        .flatMap(e -> e.contentBlockDelta().stream())
        .flatMap(d -> d.delta().text().stream())
        .forEach(t -> {
            System.out.print(t.text());
            System.out.flush();  // critical: flush each chunk for real-time output
        });
}

System.out.println(); // add newline after stream completes
\`\`\`

**Why try-with-resources?** The streaming HTTP response keeps the TCP connection open until you close it. Forgetting to close it leaks connections, eventually exhausting the pool.`,
    },
    {
      id: 'p2-l4-extra-code-accumulator',
      type: 'code',
      title: 'MessageAccumulator — Stream AND Get Full Message',
      content: `Use \`MessageAccumulator\` when you need **both** live streaming output AND the complete \`Message\` at the end (for logging, DB save, or next API call):

\`\`\`java
import com.anthropic.helpers.MessageAccumulator;

MessageAccumulator accumulator = MessageAccumulator.create();

try (StreamResponse<RawMessageStreamEvent> stream =
        client.messages().createStreaming(params)) {

    stream.stream()
        .peek(accumulator::accumulate)   // collect each event for the final Message
        .flatMap(e -> e.contentBlockDelta().stream())
        .flatMap(d -> d.delta().text().stream())
        .forEach(t -> {
            System.out.print(t.text());  // show to user in real time
            System.out.flush();
        });
}

// After stream: full Message with stopReason, usage, model, id
Message fullMessage = accumulator.message();

// Save to conversation history (needed for multi-turn)
history.add(MessageParam.builder()
    .role(MessageParam.Role.ASSISTANT)
    .content(/* full text from accumulator */)
    .build());

// Log cost
fullMessage.usage().ifPresent(u ->
    log.info("Streamed: in={} out={}", u.inputTokens(), u.outputTokens()));
\`\`\`

**Rule:** Always use \`MessageAccumulator\` in production streaming — you need the final \`Message\` for logging and history.`,
    },
    {
      id: 'p2-l4-extra-code-async',
      type: 'code',
      title: 'Spring WebFlux SSE — Stream to Browser in Real Time',
      content: `The ultimate streaming pattern: user clicks a button, text streams from Claude directly to their browser:

\`\`\`java
// Spring WebFlux controller
@RestController
@RequestMapping("/api/review")
public class ReviewController {

    private final AnthropicClientAsync asyncClient =
        AnthropicOkHttpClientAsync.fromEnv();

    // Returns a Server-Sent Events stream — browser receives text chunks in real time
    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> streamReview(@RequestBody ReviewRequest req) {
        MessageCreateParams params = MessageCreateParams.builder()
            .model(Model.CLAUDE_SONNET_4_6)
            .maxTokens(2048L)
            .system("You are a Java code reviewer.")
            .addUserMessage("Review:\\n\\n\`\`\`java\\n" + req.code() + "\\n\`\`\`")
            .build();

        // Return a Flux<String> — Spring WebFlux streams it as SSE
        return Flux.create(sink ->
            asyncClient.messages().createStreaming(params)
                .thenAccept(stream -> {
                    stream.stream()
                        .flatMap(e -> e.contentBlockDelta().stream())
                        .flatMap(d -> d.delta().text().stream())
                        .forEach(t -> sink.next(t.text()));
                    sink.complete();
                })
                .exceptionally(e -> { sink.error(e); return null; })
        );
    }
}
\`\`\`

The browser connects with \`EventSource\` and receives each text chunk as it arrives — same experience as Claude.ai.`,
    },
  ],

  'p2-l5': [
    {
      id: 'p2-l5-extra-concept-prefill',
      type: 'concept',
      title: 'Advanced Technique: Assistant Prefill for Strict Output Formats',
      content: `You can end your \`messages\` list with an incomplete **assistant** message to force Claude to continue in a specific format:

\`\`\`java
// The messages list ends with an assistant message that starts with "{"
// Claude will continue from where the prefill left off
List<MessageParam> messages = new ArrayList<>();
messages.add(MessageParam.builder()
    .role(MessageParam.Role.USER)
    .content("Review this code and return JSON: " + code)
    .build());
messages.add(MessageParam.builder()
    .role(MessageParam.Role.ASSISTANT)
    .content("{")  // prefill — Claude continues from here
    .build());

MessageCreateParams params = MessageCreateParams.builder()
    .model(Model.CLAUDE_SONNET_4_6)
    .maxTokens(1024L)
    .temperature(0.0)
    .messages(messages)
    .build();
// Response text starts from after the "{" — prepend it yourself when parsing
\`\`\`

**When to use prefill:**
- When system + system prompt is not enough to guarantee JSON
- When you need output to start with a specific prefix

**Better alternative for JSON:** Use the **structured outputs** / tool use pattern where you define a JSON schema and Claude is forced to return valid JSON matching it.`,
    },
    {
      id: 'p2-l5-extra-code-json',
      type: 'code',
      title: 'Practical: JSON Review Output Parsed with Jackson',
      content: `A complete pattern for getting structured JSON from Claude and parsing it reliably:

\`\`\`java
// ReviewIssue.java (Jackson POJO)
public record ReviewIssue(String title, String severity, String line, String fix) {}

// ReviewResult.java
public record ReviewResult(List<ReviewIssue> issues, String summary) {}

// ClaudeReviewService.java
public class ClaudeReviewService {
    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final String SYSTEM = """
        You are a Java code reviewer.
        Respond ONLY with valid JSON matching this schema exactly:
        {
          "issues": [
            {"title": "string", "severity": "high|medium|low", "line": "string", "fix": "string"}
          ],
          "summary": "one sentence overall assessment"
        }
        No markdown. No prose. No code fences. Pure JSON only.
        """;

    public ReviewResult review(AnthropicClient client, String code) throws Exception {
        MessageCreateParams params = MessageCreateParams.builder()
            .model(Model.CLAUDE_SONNET_4_6)
            .maxTokens(1024L)
            .temperature(0.0)  // deterministic = more consistent JSON
            .system(SYSTEM)
            .addUserMessage("Review:\\n\\n\`\`\`java\\n" + code + "\\n\`\`\`")
            .build();

        Message response = client.messages().create(params);
        String json = response.content().stream()
            .flatMap(b -> b.text().stream())
            .map(TextBlock::text)
            .findFirst()
            .orElse("{}");

        try {
            return MAPPER.readValue(json, ReviewResult.class);
        } catch (JsonProcessingException e) {
            // Retry once with explicit fix request
            log.warn("JSON parse failed, retrying with fix request");
            return retryWithJsonFix(client, json);
        }
    }
}
\`\`\`

Parse with Jackson, handle parse failures with a retry that asks Claude to fix its own JSON — works ~95% of the time.`,
    },
  ],

  'p3-l1': [
    {
      id: 'p3-l1-extra-concept-official',
      type: 'concept',
      title: 'Official Tool Use Overview and SDK Patterns',
      content: `[Tool use](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview) lets Claude return **tool_use** content blocks instead of (or mixed with) text. Your app executes Java code and sends **tool_result** back in a second request.

**The Java SDK supports two tool definition styles:**

**Style 1: Annotated Java classes (recommended for simple tools)**
\`\`\`java
@JsonClassDescription("Get the active order count for a customer")
public static class GetOrderCount {
    @JsonPropertyDescription("Customer ID")
    public String customerId;
}
// Register: .addTool(GetOrderCount.class)
\`\`\`

**Style 2: Manual JSON schema (for complex tools)**
\`\`\`java
Tool manualTool = Tool.builder()
    .name("get_order_count")
    .description("Returns active order count for a customer")
    .inputSchema(Tool.InputSchema.builder()
        .properties(Map.of(
            "customerId", JsonValue.from(Map.of("type", "string", "description", "Customer ID"))
        ))
        .required(List.of("customerId"))
        .build())
    .build();
// Register: .addTool(manualTool)
\`\`\`

> **Requirements for annotated classes:** Must be **top-level** or **static nested** classes. Jackson cannot instantiate non-static inner classes — a common gotcha.`,
    },
    {
      id: 'p3-l1-extra-code-annotations',
      type: 'code',
      title: 'Complete Tool Use Loop — Both Round Trips',
      content: `The full two-round-trip flow with proper tool_result handling:

\`\`\`java
public class ToolUseLoop {

    // Tool definition
    @JsonClassDescription("Get active order count. Use when user asks about current orders.")
    public static class GetOrderCount {
        @JsonPropertyDescription("Customer ID as string")
        public String customerId;
    }

    // Tool execution (your real Java code)
    private static String executeGetOrderCount(String customerId) {
        // Real implementation: orderRepository.countActive(customerId)
        return "7"; // stub
    }

    public static String runWithTools(AnthropicClient client, String userQuestion) {
        List<MessageParam> messages = new ArrayList<>();
        messages.add(MessageParam.builder()
            .role(MessageParam.Role.USER).content(userQuestion).build());

        while (true) {
            MessageCreateParams params = MessageCreateParams.builder()
                .model(Model.CLAUDE_SONNET_4_6)
                .maxTokens(1024L)
                .addTool(GetOrderCount.class)
                .messages(messages)
                .build();

            Message response = client.messages().create(params);
            messages.add(MessageParam.builder()
                .role(MessageParam.Role.ASSISTANT)
                .content(response.contentJson())  // preserve full content including tool_use blocks
                .build());

            if (!"tool_use".equals(response.stopReason().toString())) {
                // No more tools needed — return final text
                return response.content().stream()
                    .flatMap(b -> b.text().stream())
                    .map(TextBlock::text)
                    .findFirst().orElse("");
            }

            // Process tool calls and build tool_result message
            // Exact API varies by SDK version — see GitHub examples for current shape
            for (var block : response.content()) {
                block.toolUse().ifPresent(toolUse -> {
                    log.info("Tool called: {} args={}", toolUse.name(), toolUse.input());
                    if ("get_order_count".equals(toolUse.name())) {
                        String customerId = toolUse.input().get("customerId").asText();
                        String result = executeGetOrderCount(customerId);
                        // append tool_result to messages — check SDK docs for exact builder
                    }
                });
            }
        }
    }
}
\`\`\`

> Always **log tool calls** with name + input before executing — this is your audit trail in production.`,
    },
    {
      id: 'p3-l1-extra-task',
      type: 'task',
      title: 'Lab: JVM Heap Tool End-to-End',
      content: `Build a tool that lets Claude answer questions about your live JVM:

\`\`\`java
@JsonClassDescription(
    "Get current JVM memory statistics in megabytes. " +
    "Use when user asks about memory, heap, JVM stats, or performance.")
public static class GetJvmStats {
    // No parameters — reads local JVM runtime

    public static String execute() {
        Runtime rt = Runtime.getRuntime();
        long total = rt.totalMemory() / (1024 * 1024);
        long free = rt.freeMemory() / (1024 * 1024);
        long used = total - free;
        long max = rt.maxMemory() / (1024 * 1024);
        return String.format(
            "Used: %dMB, Free: %dMB, Total: %dMB, Max: %dMB", used, free, total, max);
    }
}
\`\`\`

Ask Claude: "How much heap memory am I using and is it a problem?"

Observe the complete tool use loop:
1. Claude detects "live data" question → returns \`tool_use\`
2. Your Java calls \`GetJvmStats.execute()\`
3. Claude receives result and gives a contextualized answer ("You are using X MB out of Y MB max — that is Z% utilization, which is [fine/concerning].")`,
    },
  ],

  'p3-l2': [
    {
      id: 'p3-l2-extra-concept-errors',
      type: 'concept',
      title: 'SDK-Level Retries + Structured Error Handling',
      content: `Configure retries on the client builder ([Java SDK](https://platform.claude.com/docs/en/api/sdks/java)):

\`\`\`java
AnthropicClient client = AnthropicOkHttpClient.builder()
    .fromEnv()
    .maxRetries(2)   // auto-retry 429 and 529 twice with backoff
    .build();
\`\`\`

With \`maxRetries(2)\` the SDK handles transient failures for you. Implement your own retry wrapper only for additional control (custom jitter, logging, circuit breaking).

**Error handling decision tree:**
\`\`\`
Exception received
├─ Contains "401" → API key invalid → fix secret, alert ops, do NOT retry
├─ Contains "400" → Bad request → fix your code, do NOT retry same params
├─ Contains "403" → Content policy → log, notify, do NOT retry same content
├─ Contains "429" → Rate limit → retry with exponential backoff (SDK does this)
├─ Contains "529" → Overloaded → retry with longer backoff + jitter
└─ Network/timeout → retry up to maxRetries, then circuit break
\`\`\`

**Resilience4j circuit breaker for Spring Boot:**
\`\`\`java
@Bean
public CircuitBreaker claudeCircuitBreaker(CircuitBreakerRegistry registry) {
    return registry.circuitBreaker("claude",
        CircuitBreakerConfig.custom()
            .failureRateThreshold(50)         // open if 50% of calls fail
            .waitDurationInOpenState(Duration.ofSeconds(30))
            .slidingWindowSize(10)
            .build());
}
\`\`\``,
    },
    {
      id: 'p3-l2-extra-code-spring-filter',
      type: 'code',
      title: 'Complete Input Guard + Content Filter',
      content: `Defense-in-depth: validate before Claude, check output after Claude:

\`\`\`java
public final class ClaudeGuard {
    private static final int MAX_INPUT_CHARS = 50_000;
    private static final int MAX_CODE_CHARS = 100_000;
    // Detect "ignore all previous instructions" style injection attempts
    private static final Pattern INJECTION = Pattern.compile(
        "(?i)(ignore|disregard|forget|override).{0,50}(instructions|prompt|rules|guidelines)",
        Pattern.CASE_INSENSITIVE | Pattern.DOTALL
    );

    /** Validate user-provided text before sending to Claude */
    public static String validateUserInput(String input) {
        if (input == null || input.isBlank())
            throw new IllegalArgumentException("Input must not be empty");
        if (input.length() > MAX_INPUT_CHARS)
            throw new IllegalArgumentException("Input too long: " + input.length() + " chars (max " + MAX_INPUT_CHARS + ")");
        if (INJECTION.matcher(input).find())
            throw new SecurityException("Disallowed content detected in input");
        return input.strip();
    }

    /** Validate code files specifically */
    public static String validateCodeInput(String code) {
        if (code == null || code.isBlank())
            throw new IllegalArgumentException("Code must not be empty");
        if (code.length() > MAX_CODE_CHARS)
            throw new IllegalArgumentException("Code file too large: " + code.length() + " chars");
        return code;
    }

    /** Check Claude's output — domain-specific (Claude handles ethical safety) */
    public static String validateOutput(String output, Set<String> requiredKeywords) {
        if (output == null || output.isBlank())
            throw new ClaudeOutputException("Empty response from Claude");
        // Your domain validation: e.g. confirm review contains "Issue" or "Looks good"
        return output;
    }
}

// Usage before every Claude call:
String safeInput = ClaudeGuard.validateUserInput(request.getUserCode());
\`\`\``,
    },
  ],

  'p4-l1': [
    {
      id: 'p4-l1-extra-code-structure',
      type: 'code',
      title: 'Production Project Layout',
      content: `\`\`\`
src/main/java/com/example/review/
  Main.java                 ← CLI entry (arg parsing, exits cleanly)
  ClaudeClientFactory.java  ← singleton AnthropicClient with maxRetries
  CodeReviewService.java    ← reviewFile() + chat() + streamAndCapture()
  Prompts.java              ← constants + classpath loaders
  ClaudeGuard.java          ← input validation + injection detection

src/main/resources/
  prompts/
    code-review-system.txt  ← versioned system prompt

src/test/java/
  CodeReviewServiceTest.java  ← unit tests with mock client
\`\`\`

**Why this structure:**
- \`ClaudeClientFactory\` is a singleton — one connection pool for the entire app
- Prompts in \`resources/\` are versioned in git and get PR reviews
- \`ClaudeGuard\` is tested independently of Claude (pure Java, no API calls)
- \`CodeReviewService\` is the only class that talks to the API

This is the same structure you would use in a Spring Boot service — just replace \`ClaudeClientFactory\` with a \`@Bean\`.`,
    },
    {
      id: 'p4-l1-extra-task',
      type: 'task',
      title: 'Lab: Extend the CLI with Real Flags',
      content: `Extend \`Main.java\` with useful flags that make it production-ready:

**Flag 1: \`--model <haiku|sonnet|opus>\`**
\`\`\`java
Model model = switch (getFlag(args, "--model", "sonnet")) {
    case "haiku" -> Model.CLAUDE_HAIKU_4_5;
    case "opus" -> Model.CLAUDE_OPUS_4_7;
    default -> Model.CLAUDE_SONNET_4_6;
};
\`\`\`

**Flag 2: \`--no-stream\`** (batch mode for scripts that pipe output)
\`\`\`java
boolean streaming = !Arrays.asList(args).contains("--no-stream");
\`\`\`

**Flag 3: \`--max-tokens <N>\`**
\`\`\`java
long maxTokens = Long.parseLong(getFlag(args, "--max-tokens", "2048"));
\`\`\`

**Test with:**
\`\`\`bash
java -jar target/review.jar BadExample.java --model opus --max-tokens 4096
java -jar target/review.jar BadExample.java --no-stream > review.txt
\`\`\`

This mirrors how real CLI tools (like the \`anthropic\` CLI) expose API knobs.`,
    },
    {
      id: 'p4-l1-extra-concept-demo',
      type: 'concept',
      title: 'Interview Demo Script — Show Real Understanding',
      content: `When you demo this tool in an interview or to your team, do not just show it working. Show **that you understand what is happening underneath**.

**Suggested demo sequence:**
1. Run on \`BadExample.java\` with the obvious bugs
2. Ask: "Which issue would you fix first in production?" — shows you know severity matters
3. Ask: "Can you show me the fix for issue 2 as a complete method?" — shows multi-turn works
4. Run again with \`--model haiku\` — "Faster, cheaper, but notice the difference in depth"

**Talking points while it runs:**
- "The system prompt is loaded from \`resources/prompts/\` — it's versioned in git just like code"
- "Each chunk you see appearing is a Server-Sent Event delta — same tech as Claude.ai's UI"
- "The history list grows with each turn — Claude has context from the initial review when answering follow-ups"
- "In production I'd add Resilience4j circuit breaker and log each call's token count to Grafana"

**This shows:** You built it, you understand the architecture, and you know how to make it production-ready.`,
    },
  ],

  'p4-l2': [
    {
      id: 'p4-l2-extra-concept-links',
      type: 'concept',
      title: 'Official Docs Bookmarks — Everything You Will Need Next',
      content: `Bookmark these. They will be your primary reference as you go deeper:

| Topic | Official doc |
|-------|-------------|
| Java SDK | https://platform.claude.com/docs/en/api/sdks/java |
| Messages API | https://platform.claude.com/docs/en/build-with-claude/working-with-messages |
| Tool use | https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview |
| Structured outputs | https://platform.claude.com/docs/en/build-with-claude/structured-outputs |
| Prompt engineering guide | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview |
| Vision (image input) | https://platform.claude.com/docs/en/build-with-claude/vision |
| Batches API | https://platform.claude.com/docs/en/build-with-claude/batch-processing |
| All models + context windows | https://docs.anthropic.com/en/docs/about-claude/models |
| SDK source + runnable examples | https://github.com/anthropics/anthropic-sdk-java |
| Anthropic Cookbook (Python but portable) | https://github.com/anthropics/anthropic-cookbook |

> The Anthropic Cookbook examples are in Python but the concepts are identical. Read the Python and translate to Java — good practice and the patterns are the same.`,
    },
    {
      id: 'p4-l2-extra-task',
      type: 'task',
      title: 'Two-Week Capstone — Ship Something Real',
      content: `Pick one. Ship v0 in two weeks. Then share it with your team.

**Option A: Git Pre-Commit Hook**
- On \`git commit\`, scan staged \`.java\` files with your review assistant
- If severity "high" issues found: block commit, show review, ask to confirm
- Tooling: shell script calling your JAR, \`--no-stream\` flag for piping output

**Option B: Spring Boot Review API with SSE**
- \`POST /api/review\` receives Java code, streams review as Server-Sent Events
- Frontend: simple HTML page with \`EventSource\` showing streaming text
- Add: rate limiting per user (token bucket), input validation, usage dashboard

**Option C: JUnit Test Generator**
- Input: Java class source code
- Output: complete JUnit 5 test class with happy path + edge cases
- Few-shot prompt: show 2–3 examples of input/output in system prompt

**Option D: Batch Nightly Review**
- Every night: find all \`.java\` files modified in the last 24 hours
- Batch API call (50% discount) for all reviews
- Write results to \`reports/review-YYYY-MM-DD.md\`
- Slack notification with summary

**One-week plan any option:**
- Days 1–2: Core API call working
- Days 3–4: Error handling, validation, logging
- Days 5–7: Polish, test edge cases, write a README

> Track token usage daily. You will be surprised how cheap good AI tooling actually is.`,
    },
  ],
};

/** Extra checkpoint questions keyed by lesson id (appended, not replacing originals). */
export const CLAUDE_LESSON_EXTRA_CHECKPOINTS: Record<string, string[]> = {
  'p1-l1': [
    'Open the Anthropic console — where would you create and rotate an API key?',
    'Which Claude model tier would you choose for a high-volume message classification task?',
  ],
  'p1-l2': [
    'What happens if you create a new AnthropicClient on every HTTP request in Spring Boot?',
  ],
  'p1-l3': [
    'What does stop_reason end_turn tell you compared to max_tokens?',
    'Why should you never use bare .get() on Optional in production code that calls Claude?',
  ],
  'p2-l1': [
    'Calculate the approximate cost of 1,000 Sonnet calls with 500 input tokens and 300 output tokens each.',
  ],
  'p2-l2': [
    'If a teammate changes the system prompt and the CI review pipeline starts giving different results, how would you track that?',
  ],
  'p2-l3': [
    'What happens if you send two consecutive user messages without an assistant message between them?',
  ],
  'p2-l4': [
    'When would you use MessageAccumulator instead of only printing stream deltas to the console?',
  ],
  'p2-l5': [
    'You need Claude to always return valid JSON. Name two techniques to enforce this.',
  ],
  'p3-l1': [
    'Why must tool classes be static or top-level for the Anthropic Java SDK?',
    'What would you log before executing a tool call and why?',
  ],
  'p3-l2': [
    'Your Claude calls start returning 429 in production at 9 AM every day. What is the likely cause and fix?',
  ],
  'p4-l1': [
    'Name one flag you would add to your CLI for production use and why.',
    'How would you modify the CLI to review all .java files in a directory?',
  ],
  'p4-l2': [
    'What is the difference between a simple tool use loop (Phase 3) and a full agent?',
    'When would you use the Batches API instead of real-time individual requests?',
  ],
};

/**
 * Inserts enhancement sections before each lesson's first summary block.
 * Original sections are never modified or removed.
 */
export function applyClaudeLessonEnhancements<
  L extends { id: string; sections: { type: string }[]; checkpoints: string[] },
>(lessons: L[], enhancements: Record<string, LessonEnhancementSection[]>): void {
  for (const lesson of lessons) {
    const extra = enhancements[lesson.id];
    if (extra?.length) {
      const summaryIdx = lesson.sections.findIndex((s) => s.type === 'summary');
      const at = summaryIdx >= 0 ? summaryIdx : lesson.sections.length;
      lesson.sections.splice(at, 0, ...(extra as L['sections'][number][]));
    }
    const extraCp = CLAUDE_LESSON_EXTRA_CHECKPOINTS[lesson.id];
    if (extraCp?.length) {
      lesson.checkpoints.push(...extraCp);
    }
  }
}
