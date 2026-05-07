# Plain-language script (2 minutes)

Use this when someone non-technical asks what your LLM feature does.

---

**One-liner:** We use an AI model that reads your question plus the most relevant internal documents, then writes a clear answer in plain English - like a fast assistant that always checks the same approved materials your team would check.

**Slightly longer:** The model does not automatically know our private company data. Each time you ask a question, our system first searches trusted sources (wikis, tickets, runbooks, policies), picks the most relevant snippets, and sends those snippets with your question to the model. The model's job is then to explain, summarize, or draft an answer using that supplied context. This is called retrieval-augmented generation (RAG), and it helps keep answers grounded in real company knowledge instead of guesswork.

**What this gives the business:** Teams get faster answers, more consistent explanations, and less time spent hunting through scattered docs. New joiners ramp up faster, support gets reusable responses, and product teams can ship AI features without exposing raw internal systems directly to end users.

**Safety and trust controls:** We enforce identity and permissions before retrieval, so users only get information they are already allowed to access. We log prompts and responses for auditability, redact sensitive fields where needed, and keep provider integration behind a thin service layer so we can switch model vendors with minimal product rewrites.

**If they ask about mistakes:** It can still be wrong or incomplete, especially when context is missing or ambiguous. For high-stakes use cases, we show source citations, use confidence or policy checks, add human approval paths, and continuously evaluate quality with offline test sets and production feedback.

## 2-minute talk track (ready to speak)

"Our AI feature is basically a smart assistant for company knowledge. It does not magically know all our internal data. Instead, when you ask a question, we first fetch the most relevant approved documents, then ask the model to answer using only that context.

That means the model is acting more like a writer and explainer than a source of truth by itself. This gives users quick answers in natural language while still grounding responses in internal documentation.

On the engineering side, we put guardrails around the system: access control before retrieval, logging for traceability, and provider abstraction so we're not locked to one model vendor. And because AI can still make mistakes, we add citations and human review for critical workflows, then measure quality over time to keep improving."

## Common follow-up answers (non-technical)

- **"Is this replacing people?"** No. It reduces repetitive searching and drafting work so people can spend more time on decisions and problem-solving.
- **"Does the model see everything?"** No. It only gets the specific snippets retrieved for that request, after permission checks.
- **"Can we trust every answer?"** Not fully. We treat it like a strong first draft, then add checks and human review where accuracy is critical.
- **"What if we change AI providers?"** Our architecture keeps model providers behind an internal API, so switching vendors is manageable.
- **"How do you improve it?"** We track bad answers, refine retrieval and prompts, and run regular evaluations against representative questions.

## Real-world scenarios (what teams actually build)

### 1) Internal support copilot (HR/IT/Finance policies)
- **User asks:** "Can I claim this travel expense?"
- **System does:** Retrieves policy clauses + recent exception notes; model answers in plain language with source links.
- **Common issue:** Policies are updated but indexing lags by a few hours, so answers reference outdated rules.
- **Mitigation:** Incremental re-index jobs, freshness timestamps in responses, and fallback message when fresh docs are unavailable.

### 2) Engineering runbook assistant (incident response)
- **User asks:** "API latency is spiking - what should I check first?"
- **System does:** Pulls service runbooks, past incident notes, and dashboard glossary; returns step-by-step triage checklist.
- **Common issue:** Model generates generic advice instead of environment-specific steps.
- **Mitigation:** Strong prompt constraints ("use only retrieved runbooks"), service-aware retrieval filters, and mandatory citations.

### 3) Customer support draft replies
- **User asks:** "Draft a response for failed payment ticket."
- **System does:** Uses KB articles + account status metadata to draft response; agent reviews before sending.
- **Common issue:** Draft sounds correct but misses account-specific edge case.
- **Mitigation:** Keep human-in-the-loop for outbound messaging, pre-send validation rules, and "missing data" alerts in UI.

### 4) Enterprise search + summarize (legal/compliance docs)
- **User asks:** "Summarize key obligations in this vendor contract."
- **System does:** Retrieves relevant clauses, summarizes obligations, and flags uncertain language.
- **Common issue:** Long documents exceed context window and critical clauses are dropped.
- **Mitigation:** Chunking strategy tuned for legal text, map-reduce summarization, and clause-level extraction before synthesis.

### 5) Product analytics explainer for PMs
- **User asks:** "Why did conversion drop last week?"
- **System does:** Combines metric definitions, release notes, and known incidents to produce an explanation draft.
- **Common issue:** Correlation is presented as causation.
- **Mitigation:** Force uncertainty language, show evidence trail, and separate "observed facts" from "possible causes."

## Production issues you should expect

### Hallucination despite RAG
- **Symptom:** Confident answer with weak or irrelevant citations.
- **Typical root cause:** Retrieved chunks are loosely related or prompt allows free-form speculation.
- **What experienced teams do:** Tighten retrieval thresholds, add re-ranker, enforce citation grounding checks, and abstain when evidence is weak.

### Permission leakage risk
- **Symptom:** User sees hints of content they should not access.
- **Typical root cause:** Retrieval happens before auth filter or cached results are reused across tenants.
- **What experienced teams do:** Apply ACL filtering at query time, tenant-aware vector indexes, and red-team tests for cross-tenant leakage.

### Retrieval quality drift over time
- **Symptom:** Answer quality degrades even though model is unchanged.
- **Typical root cause:** Knowledge base structure changes, new jargon appears, embeddings become stale.
- **What experienced teams do:** Monitor retrieval hit-rate, re-embed on schedule, and maintain evaluation sets per domain/team.

### Latency and timeout spikes
- **Symptom:** Good answers but too slow for real workflows.
- **Typical root cause:** Multi-step retrieval + large prompt context + provider tail latency.
- **What experienced teams do:** Cache frequent queries, trim context aggressively, stream partial responses, and use tiered model routing.

### Cost blowouts
- **Symptom:** Token spend rises faster than usage growth.
- **Typical root cause:** Oversized prompts, repeated context, expensive model on low-value tasks.
- **What experienced teams do:** Prompt/token budgeting, response length controls, semantic cache, and smaller model for first-pass tasks.

### Prompt injection via untrusted documents
- **Symptom:** Model follows malicious instructions embedded in retrieved text.
- **Typical root cause:** System prompt does not clearly prioritize trust boundaries.
- **What experienced teams do:** Sanitize/label untrusted content, isolate instructions from context, and add policy classifier before generation.

### Evaluation gap (looks good in demo, fails in production)
- **Symptom:** Stakeholders see random failures not caught before launch.
- **Typical root cause:** Testing on happy-path examples only.
- **What experienced teams do:** Build realistic eval datasets (ambiguous, adversarial, incomplete queries), track precision/recall for retrieval, and add task-level success KPIs.

## Interview-ready "mature team" talking points

- We do not evaluate only final answer quality; we separately measure retrieval quality, grounding quality, latency, and cost.
- We define abstention behavior ("I don't have enough context") as a feature, not a failure.
- We keep model/provider access behind a service layer to avoid vendor lock-in and simplify compliance controls.
- We treat prompts, retrieval settings, and eval datasets as versioned artifacts with rollout and rollback.
- High-risk workflows (finance, legal, medical, production ops) include human review and stricter policy checks.
