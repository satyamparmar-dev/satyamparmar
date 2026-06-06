/**
 * Generates src/content/claudeCourse/courseData.ts
 * Run: node scripts/generate-claude-course-data.mjs
 */
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, '../src/content/claudeCourse/courseData.ts');

const header = `// ─── Claude for Developers: Essentials — Java Developer's Guide ───────────────
// 4 phases · 12 lessons · ~16 hours

export type SectionType = 'why' | 'analogy' | 'concept' | 'code' | 'task' | 'summary';
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

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
  difficulty: Difficulty;
  tags: string[];
  sections: CourseSection[];
  checkpoints: string[];
}

export interface CoursePhase {
  number: number;
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  totalDuration: string;
}

export const COURSE_PHASES: CoursePhase[] = [
  {
    number: 1,
    id: 'phase-1',
    title: 'Foundations',
    subtitle: 'Week 1 — first API call in Java',
    description: 'Understand what Claude is, set up Maven or Gradle, store your API key safely, and make your first working call from Java.',
    icon: '☕',
    color: '#d97757',
    gradient: 'linear-gradient(135deg, #d97757 0%, #c45c3e 100%)',
    totalDuration: '3 hours',
  },
  {
    number: 2,
    id: 'phase-2',
    title: 'Core Skills',
    subtitle: 'Weeks 2–3 — prompts, history, streaming',
    description: 'Master tokens, system prompts, multi-turn history, streaming, and prompt engineering for reliable answers.',
    icon: '💬',
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0369a1 100%)',
    totalDuration: '5 hours',
  },
  {
    number: 3,
    id: 'phase-3',
    title: 'Advanced Capabilities',
    subtitle: 'Week 4 — tool use and production safety',
    description: 'Let Claude call your Java methods, handle rate limits with backoff, and apply a production checklist.',
    icon: '⚙️',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    totalDuration: '4 hours',
  },
  {
    number: 4,
    id: 'phase-4',
    title: 'Real Project & Next Steps',
    subtitle: 'Week 5 — CLI project and wrap-up',
    description: 'Build a Java CLI code review assistant, then map your next learning path: agents, vision, embeddings.',
    icon: '🚀',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    totalDuration: '4 hours',
  },
];

`;

const lessons = [
  {
    id: 'p1-l1', phase: 1, lesson: 1,
    title: 'What is Claude and Why Should Java Developers Care?',
    subtitle: 'REST APIs you already know — intelligent text in the response',
    duration: '12 min', difficulty: 'Beginner',
    tags: ['claude', 'anthropic', 'java', 'introduction'],
    checkpoints: [
      'Explain Claude in one sentence using the REST API analogy.',
      'Name two differences between ChatGPT (OpenAI) and Claude (Anthropic) for developers.',
      'List three concrete use cases for Claude in a Java backend team.',
    ],
    sections: [
      { id: 'p1-l1-why', type: 'why', title: 'Why This Matters', content: `If you build Spring Boot services, you already integrate third-party APIs daily. Claude is another HTTP API — except the response is **intelligent text** that understands context.

Java teams use Claude to summarize documents, answer questions about code, generate boilerplate, review pull requests, and power in-app chatbots. This course teaches the **Anthropic Java SDK** so you can ship those features yourself — not only use a chat UI.` },
      { id: 'p1-l1-analogy', type: 'analogy', title: 'You Already Know How to Talk to APIs', content: `**Your app today:** \`RestTemplate\` / \`WebClient\` → HTTP POST → JSON response (orders, users, weather).

**With Claude:** Same shape — HTTP POST with JSON body → JSON response — but the payload is natural language and the body is Claude's answer.

> Think of Claude like JDBC: you do not need to know how the model works internally to write good integration code. You need the **interface**: client, request builder, response parser.` },
      { id: 'p1-l1-concept', type: 'concept', title: 'What is Claude?', content: `**Claude** is an AI assistant from **Anthropic**. You send text (a *prompt*); Claude returns relevant text.

| | ChatGPT (OpenAI) | Claude (Anthropic) |
|---|---|---|
| Maker | OpenAI | Anthropic |
| Developer API | OpenAI SDK | Anthropic Java SDK |
| Typical strength | Mature ecosystem, plugins | Long context, instruction following, careful reasoning |

**Five use cases for Java developers:**
1. Summarize long PDFs or specs
2. Q&A over your codebase or docs
3. Generate boilerplate (DTOs, tests, OpenAPI stubs)
4. Review PRs with consistent criteria
5. Embed a support or internal chatbot in your app

**This course roadmap:** Foundations → Core Skills → Advanced (tool use) → Real CLI project.` },
      { id: 'p1-l1-task', type: 'task', title: 'Warm-Up (No Code)', content: `On paper, draw: **Java App** → **HTTP** → **Claude API** → **text response**.

Write one sentence: *What would you ask Claude about in your current job?* (e.g. "Explain this legacy class" or "Draft release notes from these commits.")

Save the drawing — every later module extends this diagram.` },
      { id: 'p1-l1-summary', type: 'summary', title: 'What You Just Learned', content: `Claude is Anthropic's API for intelligent text. For Java developers it is a familiar REST-style integration with a different response type. You have a four-phase roadmap ending in a real CLI code review tool.` },
    ],
  },
  {
    id: 'p1-l2', phase: 1, lesson: 2,
    title: 'Setting Up: Maven, Gradle, and Your First API Key',
    subtitle: 'Account, env var, dependency, sanity check',
    duration: '15 min', difficulty: 'Beginner',
    tags: ['maven', 'gradle', 'api-key', 'anthropic-sdk'],
    checkpoints: [
      'Why must the API key never live in source code?',
      'How do you read the key in Java?',
      'What three things do you need before the first API call?',
    ],
    sections: [
      { id: 'p1-l2-why', type: 'why', title: 'Why This Matters', content: `A leaked API key on GitHub can be scraped in minutes and billed to your account. Setting up Maven/Gradle and env-based secrets is the same discipline you use for DB passwords and OAuth client secrets.` },
      { id: 'p1-l2-concept', type: 'concept', title: 'Three Ingredients', content: `1. **Anthropic account** + API key at [console.anthropic.com](https://console.anthropic.com)
2. **Java 11+** project (Maven or Gradle)
3. **Anthropic Java SDK** dependency

> Copy the key once when created — you may not see the full value again.

**Store the key safely:**
- Environment variable: \`ANTHROPIC_API_KEY\`
- Optional local: \`.env\` with dotenv-java (never commit \`.env\`)
- Production: AWS Secrets Manager, Vault, or your platform's secret store` },
      { id: 'p1-l2-code', type: 'code', title: 'Maven, Gradle, Sanity Check', content: `**Maven** (\`pom.xml\`):

\`\`\`xml
<dependency>
  <groupId>com.anthropic</groupId>
  <artifactId>anthropic-java</artifactId>
  <version>CHECK_GITHUB_FOR_LATEST</version>
</dependency>
\`\`\`

**Gradle (Kotlin DSL):**

\`\`\`kotlin
implementation("com.anthropic:anthropic-java:CHECK_GITHUB_FOR_LATEST")
\`\`\`

**Gradle (Groovy):**

\`\`\`groovy
implementation 'com.anthropic:anthropic-java:CHECK_GITHUB_FOR_LATEST'
\`\`\`

> Always verify artifact coordinates and version on the official Anthropic Java SDK repository — names may differ slightly from tutorials.

**Read key in Java:**

\`\`\`java
String apiKey = System.getenv("ANTHROPIC_API_KEY");
\`\`\`

**Sanity check:**

\`\`\`java
public class Main {
    public static void main(String[] args) {
        String key = System.getenv("ANTHROPIC_API_KEY");
        System.out.println("Key loaded: " + (key != null && !key.isBlank() ? "YES" : "NO"));
    }
}
\`\`\`` },
      { id: 'p1-l2-task', type: 'task', title: 'Do This Now', content: `1. Create an API key named \`java-dev-learning\`
2. Set \`ANTHROPIC_API_KEY\` in your OS environment
3. Add the SDK dependency and run the sanity check
4. Confirm output: \`Key loaded: YES\`` },
      { id: 'p1-l2-summary', type: 'summary', title: 'What You Just Learned', content: `Never hardcode API keys. Use env vars, add the Anthropic Java SDK via Maven or Gradle, and verify setup before writing Claude calls.` },
    ],
  },
  {
    id: 'p1-l3', phase: 1, lesson: 3,
    title: 'Your First API Call — Hello, Claude!',
    subtitle: 'AnthropicClient, MessageCreateParams, parsing the response',
    duration: '18 min', difficulty: 'Beginner',
    tags: ['messages-api', 'hello-world', 'java-sdk'],
    checkpoints: [
      'Name the three objects used in every Claude API call.',
      'What does maxTokens control?',
      'How do you extract plain text from the response?',
    ],
    sections: [
      { id: 'p1-l3-analogy', type: 'analogy', title: 'The Request Flow', content: `**Java app** builds a request object → **HTTP POST** → Claude processes → **JSON response** → Java parses → you read text.

The SDK hides HTTP; you work with \`AnthropicClient\`, \`MessageCreateParams\`, and \`Message\`.` },
      { id: 'p1-l3-concept', type: 'concept', title: 'Key Objects', content: `| Object | Role |
|--------|------|
| \`AnthropicClient\` | Connection to the API (reuse one instance) |
| \`MessageCreateParams\` | Model, max tokens, system prompt, messages |
| \`Message\` | Response — content blocks, usage, stop reason |

Claude returns a **content** array (text, tool_use, etc.). For a simple reply you read the first **text** block.` },
      { id: 'p1-l3-code', type: 'code', title: 'HelloClaude.java', content: `\`\`\`java
import com.anthropic.client.AnthropicClient;
import com.anthropic.client.okhttp.AnthropicOkHttpClient;
import com.anthropic.models.*;

public class HelloClaude {
    public static void main(String[] args) {
        AnthropicClient client = AnthropicOkHttpClient.builder()
            .apiKey(System.getenv("ANTHROPIC_API_KEY"))
            .build();

        MessageCreateParams params = MessageCreateParams.builder()
            .model(Model.CLAUDE_SONNET_4_5) // verify enum on your SDK version
            .maxTokens(256L)
            .addUserMessage("Say hello and tell me one fun fact about Java!")
            .build();

        Message response = client.messages().create(params);

        // First text block — handle Optional in production
        System.out.println(response.content().get(0).text().get().text());
    }
}
\`\`\`

> SDK package names (\`Model.CLAUDE_SONNET_4_5\`, \`.text().get().text()\`) may vary by version — check your IDE autocomplete and Anthropic Java docs.` },
      { id: 'p1-l3-task', type: 'task', title: 'Run It', content: `Run \`HelloClaude\`. Change the user message to ask about \`Optional\` or \`records\`. Log \`response.usage()\` if your SDK exposes it.` },
      { id: 'p1-l3-summary', type: 'summary', title: 'What You Just Learned', content: `Your first AI call from Java: build client → params → \`messages().create()\` → read text from \`content\`. Everything else in this course wraps more structure around this flow.` },
    ],
  },
  {
    id: 'p2-l1', phase: 2, lesson: 4,
    title: 'Tokens and Context Windows — The Rules of the Game',
    subtitle: 'Cost, limits, maxTokens, and usage logging',
    duration: '14 min', difficulty: 'Beginner',
    tags: ['tokens', 'context-window', 'pricing'],
    checkpoints: [
      'Roughly how many tokens is 100 words of English?',
      'What fits inside the context window?',
      'What happens when maxTokens is too low?',
    ],
    sections: [
      { id: 'p2-l1-analogy', type: 'analogy', title: 'Lego Bricks and Heap Size', content: `**Tokens** ≈ small text chunks (~¾ of a word). "Hello" ≈ 1 token; ~100 words ≈ 130–150 tokens.

**Context window** ≈ Java **heap**: fixed size; **input + output** must fit. Sonnet-class models often offer very large windows (e.g. 200K tokens) — still worth designing for long chats.` },
      { id: 'p2-l1-concept', type: 'concept', title: 'Why Tokens Matter', content: `**1. Cost** — billed per input and output token.

**2. Limits** — too much text in one request → API error.

**maxTokens** = maximum length of Claude's **reply**. If Claude finishes early, it stops. If the answer needs more space, it truncates mid-sentence — set 1024+ unless you need brevity.` },
      { id: 'p2-l1-code', type: 'code', title: 'Log Usage', content: `\`\`\`java
Message response = client.messages().create(params);
Usage usage = response.usage();
System.out.println("Input tokens: " + usage.inputTokens());
System.out.println("Output tokens: " + usage.outputTokens());
\`\`\`

Log these in development; aggregate in production to catch cost spikes.` },
      { id: 'p2-l1-summary', type: 'summary', title: 'What You Just Learned', content: `Tokens are the API's currency and size unit. Monitor \`usage\`, size prompts deliberately, and set \`maxTokens\` generously for complete answers.` },
    ],
  },
  {
    id: 'p2-l2', phase: 2, lesson: 5,
    title: 'System Prompts — Teaching Claude How to Behave',
    subtitle: 'The constructor for your Claude session',
    duration: '16 min', difficulty: 'Beginner',
    tags: ['system-prompt', 'prompting'],
    checkpoints: [
      'What is a system prompt in one sentence?',
      'How is it like a Java constructor?',
      'Give an example of a weak vs strong system prompt.',
    ],
    sections: [
      { id: 'p2-l2-analogy', type: 'analogy', title: 'Constructor Analogy', content: `**Java constructor** sets \`role\`, \`tone\`, rules once when the object is created.

**System prompt** sets Claude's role, tone, output format, and constraints **before** the user messages — invisible to end users, shapes every reply.` },
      { id: 'p2-l2-concept', type: 'concept', title: 'What You Can Control', content: `- **Role** — "You are a senior Java code reviewer"
- **Tone** — formal vs casual
- **Format** — "Respond in JSON" or numbered list
- **Constraints** — "Java only, no Python examples"
- **Focus** — scope of allowed topics

**Weak:** "Be helpful."

**Strong:** "You are a code review assistant for Java. Identify up to 3 issues. For each: Problem | Why it matters | Fix with code. If none, say 'Looks good' and why."` },
      { id: 'p2-l2-code', type: 'code', title: 'Add .system()', content: `\`\`\`java
MessageCreateParams params = MessageCreateParams.builder()
    .model(Model.CLAUDE_SONNET_4_5)
    .maxTokens(1024L)
    .system("You are a Java code review assistant. " +
            "Identify up to 3 issues. Format: Issue | Why | Fix.")
    .addUserMessage("Review: public int add(int a, int b) { return a - b; }")
    .build();
\`\`\`` },
      { id: 'p2-l2-task', type: 'task', title: 'Compare', content: `Run the same user message **with** and **without** a system prompt. Note differences in structure and depth.` },
      { id: 'p2-l2-summary', type: 'summary', title: 'What You Just Learned', content: `System prompts are product requirements for AI behavior. Be specific, include format and "do not" rules, and add them with one \`.system()\` call.` },
    ],
  },
  {
    id: 'p2-l3', phase: 2, lesson: 6,
    title: 'Multi-Turn Conversations — Remembering What Was Said',
    subtitle: 'Stateless API — you own the message history',
    duration: '17 min', difficulty: 'Intermediate',
    tags: ['multi-turn', 'message-history'],
    checkpoints: [
      'Does Claude remember previous API calls automatically?',
      'What two fields does each message have?',
      'Why cap history length in production?',
    ],
    sections: [
      { id: 'p2-l3-why', type: 'why', title: 'Why This Matters', content: `Chat UIs feel continuous; the API is **stateless**. Each call is fresh — you must resend full history for follow-ups like "show me a code example" to make sense.` },
      { id: 'p2-l3-analogy', type: 'analogy', title: 'ArrayList of Messages', content: `Maintain \`List<MessageParam>\` like a conversation log. Turn 1: add user message → call API → add assistant reply. Turn 2: add new user message → send **entire list** again.

Like a git log: Claude needs the full log to understand context.` },
      { id: 'p2-l3-code', type: 'code', title: 'MultiTurnChat', content: `\`\`\`java
List<MessageParam> history = new ArrayList<>();

history.add(MessageParam.builder()
    .role(MessageParam.Role.USER)
    .content("What is a Java Optional?")
    .build());

Message response1 = client.messages().create(
    MessageCreateParams.builder()
        .model(Model.CLAUDE_SONNET_4_5)
        .maxTokens(512L)
        .messages(history)
        .build());

String reply1 = response1.content().get(0).text().get().text();
history.add(MessageParam.builder()
    .role(MessageParam.Role.ASSISTANT)
    .content(reply1)
    .build());

history.add(MessageParam.builder()
    .role(MessageParam.Role.USER)
    .content("Can you show me a code example?")
    .build());

Message response2 = client.messages().create(
    MessageCreateParams.builder()
        .model(Model.CLAUDE_SONNET_4_5)
        .maxTokens(512L)
        .messages(history)
        .build());
\`\`\`` },
      { id: 'p2-l3-concept', type: 'concept', title: 'Managing History Size', content: `Unbounded history eventually exceeds the context window. Strategies:
- Keep last **N** user/assistant pairs
- Periodically **summarize** older turns into one system note
- Start a **new session** for unrelated topics` },
      { id: 'p2-l3-summary', type: 'summary', title: 'What You Just Learned', content: `You own conversation state. Append user and assistant messages; send the full list every turn; cap or summarize history in production.` },
    ],
  },
  {
    id: 'p2-l4', phase: 2, lesson: 7,
    title: 'Streaming Responses — Real-Time Output in Java',
    subtitle: 'Server-Sent Events and better CLI UX',
    duration: '15 min', difficulty: 'Intermediate',
    tags: ['streaming', 'sse'],
    checkpoints: [
      'Why does streaming improve UX?',
      'When should you avoid streaming?',
      'What API method replaces create() for streaming?',
    ],
    sections: [
      { id: 'p2-l4-why', type: 'why', title: 'Why Stream?', content: `Without streaming, users stare at a blank screen for seconds. With streaming, text appears token-by-token — same feel as ChatGPT.` },
      { id: 'p2-l4-concept', type: 'concept', title: 'How It Works', content: `Anthropic uses **Server-Sent Events (SSE)**. The SDK exposes a stream; each event may carry a **text delta**. Print with System.out.print (no newline) and flush.

**Use streaming when:** a human is watching (CLI, WebSocket UI).

**Use batch create()** when: background jobs or you need the full JSON before parsing.` },
      { id: 'p2-l4-code', type: 'code', title: 'StreamingExample', content: `\`\`\`java
client.messages().stream(params)
    .on(ContentBlockDeltaEvent.class, event -> {
        if (event.delta() instanceof TextDelta textDelta) {
            System.out.print(textDelta.text());
            System.out.flush();
        }
    })
    .join();
System.out.println();
\`\`\`

**Buffer pattern:** append chunks to \`StringBuilder\`, return full text when the stream completes — useful before \`json.loads\` on the full body.` },
      { id: 'p2-l4-summary', type: 'summary', title: 'What You Just Learned', content: `Replace \`create()\` with \`stream()\` for live output; buffer when you need the complete string.` },
    ],
  },
  {
    id: 'p2-l5', phase: 2, lesson: 8,
    title: 'Prompt Engineering — Getting Better Answers',
    subtitle: 'Context, task, format, constraints',
    duration: '16 min', difficulty: 'Intermediate',
    tags: ['prompt-engineering'],
    checkpoints: [
      'What four parts make a good prompt?',
      'Complete the template: You are [role]. Your task is…',
      'Why test multiple prompt variants?',
    ],
    sections: [
      { id: 'p2-l5-why', type: 'why', title: 'Not Magic — Clear Specs', content: `Vague prompts get vague answers. Prompt engineering is the same skill as writing clear Javadoc, Jira tickets, or test case descriptions.` },
      { id: 'p2-l5-concept', type: 'concept', title: 'Anatomy of a Good Prompt', content: `1. **Context** — situation (production review? junior tutorial?)
2. **Task** — exact deliverable ("three bullet points, one sentence each")
3. **Format** — list, JSON, table
4. **Constraints** — what NOT to do

**Template:**
\`\`\`
You are [role]. Your task is [task]. Respond in [format]. [Constraints.]
\`\`\`` },
      { id: 'p2-l5-task', type: 'task', title: 'A/B Your Prompts', content: `Write "Review my code" vs a structured review prompt. Send both to Claude on the same snippet. Log inputs and outputs; keep the better prompt in a team wiki.` },
      { id: 'p2-l5-summary', type: 'summary', title: 'What You Just Learned', content: `Treat prompts like API contracts: context, task, format, constraints — then iterate and measure.` },
    ],
  },
  {
    id: 'p3-l1', phase: 3, lesson: 9,
    title: 'Tool Use — Letting Claude Call Your Java Methods',
    subtitle: 'Close the loop: tool_use → your code → tool_result',
    duration: '20 min', difficulty: 'Advanced',
    tags: ['tool-use', 'function-calling'],
    checkpoints: [
      'What problem does tool use solve?',
      'Describe the four-step tool loop.',
      'Why is the tool description critical?',
    ],
    sections: [
      { id: 'p3-l1-why', type: 'why', title: 'Claude Does Not Know Your Live Data', content: `Claude cannot call your database or weather API. **Tool use** lets Claude request \`get_current_weather(city)\` — your Java runs it and returns facts Claude weaves into the answer.` },
      { id: 'p3-l1-concept', type: 'concept', title: 'The Loop', content: `1. Send message + **tool definitions**
2. Claude returns \`tool_use\` (name + arguments) instead of final text
3. Your Java executes the method
4. Send **tool_result** back with history → Claude's final answer

Write tool **descriptions** like API docs — Claude uses them to decide when to call.` },
      { id: 'p3-l1-code', type: 'code', title: 'Define Tool and Handle tool_use', content: `\`\`\`java
Tool weatherTool = Tool.builder()
    .name("get_current_weather")
    .description("Returns current weather for a city. Use when user asks about live weather.")
    .inputSchema(/* JSON schema: city string */)
    .build();

Message response = client.messages().create(
    MessageCreateParams.builder()
        .model(Model.CLAUDE_SONNET_4_5)
        .maxTokens(1024L)
        .tools(List.of(weatherTool))
        .addUserMessage("What's the weather in Mumbai?")
        .build());

// If ToolUseBlock: run getWeatherForCity(city), append assistant + tool_result
// messages, call create() again for final text
\`\`\`

> Exact \`Tool\`, \`ToolUseBlock\`, and \`ToolResultBlock\` types depend on SDK version — follow Anthropic Java tool-use examples.` },
      { id: 'p3-l1-summary', type: 'summary', title: 'What You Just Learned', content: `Tools ground Claude in your systems. Define schema + description, detect \`tool_use\`, execute Java, return \`tool_result\`, then get the final reply.` },
    ],
  },
  {
    id: 'p3-l2', phase: 3, lesson: 10,
    title: 'Safety, Rate Limits, and Production Best Practices',
    subtitle: '429 backoff, error categories, eight-point checklist',
    duration: '14 min', difficulty: 'Advanced',
    tags: ['rate-limits', 'production', 'safety'],
    checkpoints: [
      'What HTTP status means rate limited?',
      'Name three error categories and how to handle each.',
      'List four items from the production checklist.',
    ],
    sections: [
      { id: 'p3-l2-concept', type: 'concept', title: 'Safety and Rate Limits', content: `Claude has built-in safety refusals. You still validate user input, filter outputs for your domain, and avoid sending unnecessary PII.

**Rate limits** → HTTP **429**. Limits apply per requests/minute and tokens/minute.

**Error categories:**
| Type | Action |
|------|--------|
| Network | Retry with backoff |
| 400/422 bad request | Fix code — do not blind retry |
| 429 rate limit | Wait and retry (exponential backoff) |` },
      { id: 'p3-l2-code', type: 'code', title: 'Exponential Backoff', content: `\`\`\`java
public Message callWithRetry(AnthropicClient client,
                              MessageCreateParams params,
                              int maxRetries) throws InterruptedException {
    int attempt = 0;
    long waitMs = 1000;
    while (attempt < maxRetries) {
        try {
            return client.messages().create(params);
        } catch (RateLimitException e) {
            attempt++;
            if (attempt >= maxRetries) throw e;
            Thread.sleep(waitMs);
            waitMs *= 2;
        }
    }
    throw new RuntimeException("Max retries exceeded");
}
\`\`\`` },
      { id: 'p3-l2-summary', type: 'summary', title: 'Production Checklist', content: `1. API key in env var — never in repo
2. Log token usage
3. Set reasonable maxTokens
4. Catch and log errors
5. Validate/sanitize user input (prompt injection)
6. Do not log sensitive prompts/responses
7. Monitor monthly API cost
8. Test edge cases (empty response, refusal)

Consider **Resilience4j** for retries in Spring services.` },
    ],
  },
  {
    id: 'p4-l1', phase: 4, lesson: 11,
    title: 'Mini-Project: Build a Java CLI Code Review Assistant',
    subtitle: 'File read, system prompt, stream, follow-up chat',
    duration: '22 min', difficulty: 'Advanced',
    tags: ['mini-project', 'cli'],
    checkpoints: [
      'What four components make up the architecture?',
      'How does the system prompt shape reviews?',
      'How do you combine streaming with message history?',
    ],
    sections: [
      { id: 'p4-l1-concept', type: 'concept', title: 'What We Build', content: `CLI tool: \`java CodeReviewAssistant path/to/File.java\`

1. Read \`.java\` file from disk
2. Send to Claude with a **code review system prompt**
3. **Stream** review to terminal
4. **Scanner loop** for follow-up questions until \`exit\`

**Architecture:** File reader | Claude client | Conversation manager (\`List<MessageParam>\`) | CLI loop` },
      { id: 'p4-l1-code', type: 'code', title: 'System Prompt + Review', content: `\`\`\`java
private static final String SYSTEM_PROMPT =
    "You are an expert Java code reviewer. Identify up to 5 issues " +
    "(bugs to style). For each: Problem | Why it matters | Fix with code. " +
    "End with one-sentence assessment. Available for follow-up questions.";

public void reviewFile(String filePath) throws Exception {
    String code = Files.readString(Path.of(filePath));
    String userMessage = "Review:\\n\\n\`\`\`java\\n" + code + "\\n\`\`\`";
    history.add(MessageParam.builder()
        .role(MessageParam.Role.USER)
        .content(userMessage)
        .build());
    String review = streamAndCapture();
    history.add(MessageParam.builder()
        .role(MessageParam.Role.ASSISTANT)
        .content(review)
        .build());
}
\`\`\`` },
      { id: 'p4-l1-code2', type: 'code', title: 'Stream + Chat Loop', content: `\`\`\`java
private String streamAndCapture() {
    StringBuilder full = new StringBuilder();
    client.messages().stream(
        MessageCreateParams.builder()
            .model(Model.CLAUDE_SONNET_4_5)
            .maxTokens(2048L)
            .system(SYSTEM_PROMPT)
            .messages(history)
            .build())
        .on(ContentBlockDeltaEvent.class, event -> {
            if (event.delta() instanceof TextDelta td) {
                System.out.print(td.text());
                System.out.flush();
                full.append(td.text());
            }
        })
        .join();
    System.out.println();
    return full.toString();
}

// main: reviewFile(args[0]); startChat() with Scanner until "exit"
\`\`\`` },
      { id: 'p4-l1-task', type: 'task', title: 'Ship It', content: `Create a Java class with a deliberate bug (\`add\` returns \`a - b\`). Run the assistant. Ask: "Show a corrected version of the second issue."` },
      { id: 'p4-l1-summary', type: 'summary', title: 'What You Just Learned', content: `You combined system prompts, history, and streaming into a tool you can demo in interviews or use on real PRs locally.` },
    ],
  },
  {
    id: 'p4-l2', phase: 4, lesson: 12,
    title: 'Where to Go Next',
    subtitle: 'Agents, vision, embeddings, and project ideas',
    duration: '10 min', difficulty: 'Beginner',
    tags: ['roadmap', 'next-steps'],
    checkpoints: [],
    sections: [
      { id: 'p4-l2-summary', type: 'summary', title: 'What You Accomplished', content: `You can: call Claude from Java, manage tokens, write system prompts, hold multi-turn chats, stream output, engineer prompts, use tools, handle production concerns, and ship a **CLI code review assistant**.` },
      { id: 'p4-l2-concept', type: 'concept', title: 'Advanced Paths', content: `**Agents** — chained tool calls and workflows

**Vision** — send images (screenshots, diagrams) in message content

**Embeddings** — semantic search over your docs

Pick one path for a week-long side project.` },
      { id: 'p4-l2-concept2', type: 'concept', title: 'Resources', content: `- [docs.anthropic.com](https://docs.anthropic.com)
- Anthropic Cookbook (GitHub)
- Official Anthropic Java SDK repository
- Anthropic developer Discord` },
      { id: 'p4-l2-task', type: 'task', title: 'Project Ideas', content: `1. **Document Q&A** — PDF in, questions out
2. **Commit message generator** — diff in, message out
3. **JUnit from Javadoc** — method docs → tests
4. **Slack bot** — internal FAQ over Confluence export
5. **Support chatbot** — FAQ first, escalate to human

Pick one. Start small. Ship a v0.` },
    ],
  },
];

function escapeTemplate(s) {
  return s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

function formatLesson(l) {
  const sections = l.sections
    .map(
      (s) => `      {
        id: '${s.id}',
        type: '${s.type}',
        title: '${s.title.replace(/'/g, "\\'")}',
        content: \`${escapeTemplate(s.content)}\`,
      }`,
    )
    .join(',\n');

  const cps =
    l.checkpoints.length === 0
      ? '    checkpoints: [],'
      : `    checkpoints: [\n${l.checkpoints.map((q) => `      '${q.replace(/'/g, "\\'")}',`).join('\n')}\n    ],`;

  return `  {
    id: '${l.id}',
    phase: ${l.phase},
    lesson: ${l.lesson},
    title: '${l.title.replace(/'/g, "\\'")}',
    subtitle: '${l.subtitle.replace(/'/g, "\\'")}',
    duration: '${l.duration}',
    difficulty: '${l.difficulty}',
    tags: [${l.tags.map((t) => `'${t}'`).join(', ')}],
${cps}
    sections: [
${sections}
    ],
  }`;
}

const footer = `
// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getLessonsForPhase(phaseNumber: number): CourseLesson[] {
  return COURSE_LESSONS.filter((l) => l.phase === phaseNumber);
}

export function getLessonById(id: string): CourseLesson | undefined {
  return COURSE_LESSONS.find((l) => l.id === id);
}

export function getNextLesson(id: string): CourseLesson | undefined {
  const idx = COURSE_LESSONS.findIndex((l) => l.id === id);
  return idx >= 0 && idx < COURSE_LESSONS.length - 1 ? COURSE_LESSONS[idx + 1] : undefined;
}

export function getPrevLesson(id: string): CourseLesson | undefined {
  const idx = COURSE_LESSONS.findIndex((l) => l.id === id);
  return idx > 0 ? COURSE_LESSONS[idx - 1] : undefined;
}

export function getTotalLessons(): number {
  return COURSE_LESSONS.length;
}

export function getTotalHours(): string {
  return '16';
}

export const CLAUDE_COURSE_STORAGE_KEY = 'claude-course-completed-lessons';

export function getCompletedLessons(): Set<string> {
  try {
    const stored = localStorage.getItem(CLAUDE_COURSE_STORAGE_KEY);
    return stored ? new Set<string>(JSON.parse(stored)) : new Set<string>();
  } catch {
    return new Set<string>();
  }
}

export function markLessonComplete(id: string): void {
  const completed = getCompletedLessons();
  completed.add(id);
  localStorage.setItem(CLAUDE_COURSE_STORAGE_KEY, JSON.stringify([...completed]));
}

export function markLessonIncomplete(id: string): void {
  const completed = getCompletedLessons();
  completed.delete(id);
  localStorage.setItem(CLAUDE_COURSE_STORAGE_KEY, JSON.stringify([...completed]));
}
`;

const body = `export const COURSE_LESSONS: CourseLesson[] = [\n${lessons.map(formatLesson).join(',\n\n')}\n];\n`;

writeFileSync(outPath, header + body + footer, 'utf8');
console.log('Wrote', outPath, '—', lessons.length, 'lessons');
