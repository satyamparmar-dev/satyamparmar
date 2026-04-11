# RAG, tools, and prompting

## Retrieval-augmented generation (RAG)

**RAG** retrieves relevant documents (or rows) and injects them into the prompt so the model answers from **your** data.

Typical pipeline:

1. **Chunk** documents with overlap; store **embeddings** in a vector DB or search index.
2. At query time, embed the user question, **retrieve** top-k chunks.
3. **Augment** the prompt: system instructions + retrieved context + user message.
4. **Generate** the answer; optionally require citations to chunk IDs.

Trade-offs: chunk size, reranking, freshness, access control (multi-tenant), and evaluation.

## Tool / function calling

Models can emit structured calls (e.g. JSON) to **tools**: search, calculators, ticket APIs, or your own Java services. Your backend executes the tool and returns results to the model. This reduces hallucination for factual or transactional steps.

## Prompt engineering (practical)

- Clear **role** and **output format** (JSON schema, bullet list, etc.).
- Few-shot **examples** for edge cases.
- **Chain-of-thought** only when you need reasoning and can tolerate longer outputs; watch token cost.
- Version prompts like code; track changes with evals.

## Streaming

For chat UIs, **SSE** or WebSockets stream tokens as they are generated. In Spring, this maps well to reactive types or chunked responses; handle backpressure and client disconnects.
