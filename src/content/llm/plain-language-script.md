# Plain-language script (2 minutes)

Use this when someone non-technical asks what your LLM feature does.

---

**One-liner:** We use an AI model that reads your question and relevant internal documents, then writes an answer in plain English—like a very fast assistant that always checks the same reference materials you would.

**Slightly longer:** The model does not "know" our private data by itself. When you ask something, our system pulls the right snippets from our knowledge base—wikis, tickets, or policies—and passes them to the model with your question. The model's job is to summarize and explain using only that context. We log requests, enforce access rules so you only see what you're allowed to see, and we can turn the feature off or change providers without rewriting the whole product.

**If they ask about mistakes:** It can still get things wrong, so we treat high-stakes answers carefully—show sources, add human review where needed, and measure quality over time.
