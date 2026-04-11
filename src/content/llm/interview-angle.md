# Interview angles

## System design talking points

- **Latency budget**: model API round-trip, retrieval, token generation; caching embeddings and frequent queries.
- **Cost**: token usage, model tier choice, batch vs real-time.
- **Safety**: PII redaction, prompt injection (treat retrieved text as untrusted), output filtering, audit logs.
- **Observability**: trace IDs, log prompts and completions where policy allows, quality metrics.

## Java / Spring specifics you might mention

- Expose LLM features via **REST** or **WebFlux** with timeouts and circuit breakers.
- Isolate provider clients behind an interface for **vendor swap** (OpenAI, Azure, Bedrock, local).
- Use **structured output** parsing (Jackson) for tool arguments and API contracts.
- **Async** execution for long runs; **idempotency** for user actions that trigger generation.

## Good short answers

- *"How do you reduce hallucinations?"* — RAG with citations, tool use for facts, smaller well-scoped prompts, eval suites, human review for critical paths.
- *"How do you evaluate quality?"* — Golden questions, LLM-as-judge (with care), user feedback, offline metrics on retrieval precision/recall.
