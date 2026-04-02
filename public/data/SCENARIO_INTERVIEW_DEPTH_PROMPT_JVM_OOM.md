# Prompt: Deep interview scenario — JVM OOM, heap, GC, profiling, containers

**App / project name:** **Satyverse(Satyam Parmar)**.

Use this prompt with an LLM (or as a checklist when authoring) to turn a **short signal/answer outline** into **scenario-style interview Q&A** with commands, tools, flags, and step-by-step runbooks.

---

## Target output shape (match app data)

Produce one or more **scenario items** suitable for:

- `public/data/scenarioInterviewThemes.json` (interview theme packs), or  
- `public/data/scenarioDrill.json` (per-day bundles),

Each item must include:

| Field | Requirement |
|--------|-------------|
| `id` | Stable string, e.g. `oom-heap-1` |
| `question` | Realistic scenario (production / on-call / system design interview) |
| `signals` | String array of keywords the candidate should hit |
| `answer` | **Markdown** with the depth rules below |
| `followUps` | Optional `{ "question", "answer" }[]` — short but causal |

**Answer structure (required sections, in order):**

1. **What’s going wrong** — Symptom, how it surfaces (logs, metrics, user impact).
2. **Why this happens** — Root-cause categories (retention vs spike vs sizing vs cgroup kill vs wrong memory kind).
3. **What to check (and why)** — Tied to evidence, not guesswork.
4. **Behind the scenes** — Heap vs Metaspace vs direct/native vs threads; GC intuition.
5. **What you’d do in production** — Stabilize → observe → fix → prevent → alert.
6. **Interview tip** — One sentence on how to stand out.
7. **Deep dive: commands & steps** — See “Depth requirements” below (mandatory for this prompt).

---

## Depth requirements (expand every scenario with these)

For **each** major checklist item, include **at least one** of:

- **Exact JVM flags** (e.g. `-XX:+HeapDumpOnOutOfMemoryError`, `-XX:HeapDumpPath=…`, `-Xlog:gc*:file=…`, `-XX:MaxMetaspaceSize`, `-XX:MaxDirectMemorySize`, `-XX:NativeMemoryTracking=…`).
- **CLI commands** with realistic paths/host context: `jcmd <pid> VM.native_memory summary`, `jcmd <pid> GC.heap_info`, `jmap -dump`, `jhsdb jmap` (if applicable).
- **Kubernetes / container steps**: `kubectl top pod`, `kubectl describe pod` (OOMKilled, limits), `kubectl exec` into pod, copying tools, writable volume for dumps, `dmesg` / node-level OOM hints where relevant.
- **Analysis tools**: Eclipse MAT (dominator tree, path to GC roots, histogram), **or** equivalent steps in another tool; mention **what you click / what report** answers which question.
- **GC log reading**: What lines prove allocation rate vs promotion vs full GC loop; mention **JDK version** differences if material (e.g. unified `-Xlog:gc*` vs pre-9 flags).
- **Profiling**: `async-profiler`, JFR (`jcmd JFR.*`), `jstack` sampling — **when** each is appropriate vs misleading under OOM pressure.
- **Code-level patterns**: 1–3 short **anti-pattern snippets** (static cache, unbounded queue, session map) and the **fix** (eviction, batching, streaming).

Use **numbered runbooks** where it helps, e.g.:

```text
Step 1 — Confirm which memory failed …
Step 2 — Capture evidence …
Step 3 — Correlate with deploy/config …
```

---

## Source material (must be preserved and enriched)

**Signals / keywords to weave into `signals` and the narrative:**

`heap dump`, `GC logs`, `leak suspects`, `profiling`, `container limits`

**Core answer (expand, do not replace with generic advice):**

- **What’s going wrong:** JVM throws `OutOfMemoryError` when allocation cannot be satisfied — often **Java heap**, but also **Metaspace**, **direct memory** (NIO/Netty), or **native** limits; Linux **OOM killer** may kill the container before a clean Java stack trace.
- **Why:** Retention (caches, sessions, listeners, thread-locals, ORM L1); allocation spikes (large file/result set/JSON); wrong sizing (heap vs cgroup); GC cannot reclaim fast enough → full GC thrash → OOM.
- **What to check:** OOM message/cause; heap dump + **dominator tree**; GC logs; recent deploy/config; **pod memory vs JVM flags** alignment; off-heap/direct when heap looks “fine” but RSS grows.
- **Behind the scenes:** Reachability vs garbage; Metaspace and classloaders; DirectByteBuffers and cgroup accounting.
- **Production:** Stabilize/restart if needed; enable dump-on-OOM + GC logging; fix retention/allocation; right-size heap + K8s requests/limits with non-heap headroom; alert on heap, GC time, restarts.
- **Interview tip:** Distinguish **leak vs sizing vs container kill**; use **dump + GC evidence** before only raising `-Xmx`.

**Follow-up questions (must appear as `followUps`, with expanded answers):**

1. **“Should we just increase heap?”** — No: first prove no leak/unbounded structures; bigger heap can worsen pauses and hide bugs.
2. **“Leak vs high usage?”** — Leak = unexpected reachability; high usage can be legitimate peak — still needs sizing, batching, or back-pressure.
3. **“How do you get a heap dump in K8s?”** — Ephemeral JDK tools, `jcmd`, dump-on-OOM flags, writable volume, PII/policy constraints.

Each follow-up answer should add **at least one concrete command, flag, or kubectl snippet** where applicable.

---

## Style constraints

- Prefer **senior/staff** depth: tradeoffs, false positives, and what **not** to do.
- Use **fenced code blocks** for commands, flags, log excerpts, and short Java snippets.
- Keep the main `answer` long enough to be interview-useful (roughly **800–2000 words** for a single heavy scenario, or split into multiple scenario items with narrower scope).
- Do **not** invent vendor-specific metrics names without labeling them as examples.

---

## Example instruction line to paste into the LLM

> You are a senior Java performance engineer and interview coach. Using the schema and source material in this document, generate **[N]** scenario item(s) about **[JVM OOM / heap / GC / profiling / Kubernetes memory limits]**. Each item must include `id`, `question`, `signals`, `answer` (Markdown with all required sections including **Deep dive: commands & steps**), and `followUps` with enriched answers. Ground every recommendation in observable evidence (logs, dumps, metrics, cgroup behavior).

---

## Optional: split into multiple scenario cards

If one topic gets too long, split into:

1. **Diagnose OOM type** from message + metrics + cgroup.  
2. **Heap leak vs sizing** — MAT + GC logs + code patterns.  
3. **Off-heap / direct / Metaspace** — NMT, Netty, classloaders.  
4. **Kubernetes** — requests/limits, OOMKilled, JVM flag alignment, dump path.

Cross-link scenarios with a one-line “See also” in the answer if useful.
