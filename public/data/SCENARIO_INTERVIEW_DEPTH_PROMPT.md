# Prompt: Deep interview scenario (generic template)

**App / project name:** **Satyverse(Satyam Parmar)** (learning platform content lives under `public/data/`).

Use this with an LLM (or as a checklist when authoring) to turn a **short outline** (signals + bullet answers + follow-ups) into **scenario-style interview Q&A** with commands, tools, configs, and step-by-step runbooks.

**How to use:** Paste this whole document, then add your **topic-specific source material** under [Fill in: source material](#fill-in-source-material-for-your-topic). Swap the examples in the depth section for whatever domain applies (JVM, DB, Kafka, HTTP, K8s networking, etc.).

**Ready-made topic prompt:** For **JVM OOM / heap / GC / profiling / containers**, use the full bundled source + depth rules in [`SCENARIO_INTERVIEW_DEPTH_PROMPT_JVM_OOM.md`](./SCENARIO_INTERVIEW_DEPTH_PROMPT_JVM_OOM.md) (same app JSON shape; JVM-specific signals and follow-ups included).

---

## Target output shape (match app data)

Produce one or more **scenario items** suitable for:

- `public/data/scenarioInterviewThemes.json` (interview theme packs), or  
- `public/data/scenarioDrill.json` (per-day bundles),

Each item must include:

| Field | Requirement |
|--------|-------------|
| `id` | Stable string, e.g. `<topic>-<short-slug>-1` |
| `question` | Realistic scenario (production / on-call / system design interview) |
| `signals` | String array of keywords the candidate should hit |
| `answer` | **Markdown** with the sections below |
| `followUps` | Optional `{ "question", "answer" }[]` — short but causal |

**Answer structure (required sections, in order):**

1. **What’s going wrong** — Symptoms; how they surface (logs, metrics, user impact).
2. **Why this happens** — Root-cause **categories** for *this domain* (e.g. misconfiguration vs load vs bug vs resource limits vs wrong tool).
3. **What to check (and why)** — Evidence-first; tie checks to conclusions.
4. **Behind the scenes** — Mechanism-level intuition for *this topic* (how the system works under the hood).
5. **What you’d do in production** — Stabilize → observe → fix → prevent → alert/monitor.
6. **Interview tip** — One sentence on how to stand out.
7. **Deep dive: commands, configs & steps** — See [Depth requirements](#depth-requirements); mandatory for this prompt.

---

## Depth requirements

For **each** major point in “What to check” or “Deep dive”, include **at least one** concrete artifact, chosen to fit the domain:

| Category | What to include (pick what applies) |
|----------|-------------------------------------|
| **Runtime / platform flags** | Exact flags, env vars, or config keys (with names and example values). |
| **CLI / API** | Commands or API calls with **placeholders** for host/namespace/id, e.g. `<pid>`, `<pod>`, `<topic>`. |
| **Infrastructure** | Steps for the platform where the issue shows up (e.g. `kubectl`, Docker, cloud console, load balancer), including **what field in the output** to read. |
| **Analysis tools** | Named tool(s); **what view or report** answers which question (not just “use X”). |
| **Logs / metrics** | What **patterns or series** prove the hypothesis; optional short log/metric excerpts (label as examples). |
| **Profiling / tracing** | When sampling vs tracing vs logging is appropriate; pitfalls (e.g. observer overhead). |
| **Code / schema** | 1–3 minimal **anti-pattern** snippets and the **fix** (language-agnostic if possible). |

Use **numbered runbooks** where helpful:

```text
Step 1 — Confirm …
Step 2 — Capture evidence …
Step 3 — Correlate with change/deploy/config …
```

### Example depth (JVM memory — swap for your topic)

If the topic is **Java heap / OOM / GC / containers**, typical artifacts include: JVM flags (`-XX:+HeapDumpOnOutOfMemoryError`, `-Xlog:gc*`, NMT), `jcmd`/`jmap`, MAT dominator tree, GC log interpretation, `kubectl` memory limits vs JVM heap, async-profiler / JFR.

If the topic is **something else**, replace this block with the **equivalent** tools and flags for that stack (e.g. DB `EXPLAIN`, Kafka consumer lag, HTTP timeouts, connection pool metrics).

---

## Fill in: source material for your topic

*Paste or write your short outline here before invoking the LLM.*

**Signals / keywords** (for `signals` and the narrative):

`…`

**Core bullets (expand; do not replace with vague advice):**

- **What’s going wrong:** …
- **Why:** …
- **What to check:** …
- **Behind the scenes:** …
- **Production:** …
- **Interview tip:** …

**Follow-up questions** (must appear as `followUps`, with **expanded** answers):

1. …  
2. …  
3. …

**Rules for follow-ups:** Each answer should add **at least one** concrete command, flag, query, config key, or metric — where applicable — not only prose.

---

## Style constraints

- Prefer **senior/staff** depth: tradeoffs, false positives, what **not** to do.
- Use **fenced code blocks** for commands, configs, log excerpts, and short code.
- Target length: **~800–2000 words** for one heavy scenario, or **split** into multiple narrower scenario items.
- Do **not** invent vendor-specific metric names without labeling them as examples.

---

## Generic instruction line (paste into the LLM)

> You are a senior software engineer and interview coach. Using the schema in this document and the **[Fill in: source material]** section, generate **[N]** scenario item(s) about **[TOPIC]**. Each item must include `id`, `question`, `signals`, `answer` (Markdown with all required sections, including **Deep dive: commands, configs & steps**), and `followUps` with enriched answers. Ground recommendations in observable evidence (logs, metrics, dumps, traces, platform output).

---

## Optional: split into multiple scenario cards

If one topic is too long, split by **sub-problem**, for example:

1. **Classify** the failure mode from signals + platform output.  
2. **Isolate** the layer (app vs library vs infra).  
3. **Prove** root cause with evidence.  
4. **Remediate** and **prevent** (config, code, alerts).

Cross-link items with a one-line “See also” where useful.

---

## Appendix: JVM OOM / heap / GC / containers

Use the dedicated prompt **[`SCENARIO_INTERVIEW_DEPTH_PROMPT_JVM_OOM.md`](./SCENARIO_INTERVIEW_DEPTH_PROMPT_JVM_OOM.md)** — it includes the full schema, JVM depth checklist, preserved source material, follow-ups, and optional scenario splits. This generic file stays domain-neutral.
