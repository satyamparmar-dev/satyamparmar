# Scenario interview drill (`scenarioDrill.json`)

## File location

`public/data/scenarioDrill.json`

## Schema (summary)

- `version` — number, bump when you make breaking shape changes (v2+ answers use “In simple terms”, step-by-step fixes, interview tips, and multiple follow-ups per scenario).
- `days` — array of bundles:
  - `day` — 1–90 (matches curriculum day).
  - `title` — same as the lesson day title (for display).
  - `phaseId` — e.g. `phase1`, `phase2` (matches `curriculum.json` `phases[].id`).
  - `tags` — optional string chips.
  - `scenarios` — array of:
    - `id` — stable id, e.g. `d1-s1`.
    - `question` — scenario prompt.
    - `signals` — optional string array (“keywords to mention”).
    - `answer` — **Markdown** (headings, lists, fenced code blocks work).
    - `followUps` — optional `{ question, answer }[]` (Markdown answers).

## UI

- Route: **`/scenarios`**
- Linked from **Dashboard**, **Progress**, **Sidebar**, and **Learn** (banner when this day has content).

## Coverage check

```bash
node scripts/check-scenario-drill.mjs
```

By default the script **always exits 0** (informational). Set `STRICT_SCENARIO_DRILL=1` to exit `1` when any day is missing a bundle or has an empty `scenarios` array (useful in CI once all days are authored).

## Interview theme packs (optional)

- **File:** `public/data/scenarioInterviewThemes.json`
- **Shape:** `{ "version": 1, "themes": [ { "id", "title", "subtitle?", "tags?", "scenarios": [ ScenarioItem ] } ] }`
- **Merge:** `fetchScenarioDrill()` loads this file (if present) and attaches `interviewThemes` to the in-memory `ScenarioDrillData`.
- **UI:** On `/scenarios`, use **Interview themes** when the file exists; URL query `?view=themes&theme=<id>` deep-links a pack.
- **Authoring:** Edit `scripts/scenario-interview-themes-data.mjs`, then run:

```bash
node scripts/build-interview-themes.mjs
```

Scenario items use the same fields as day bundles (`id`, `question`, `signals?`, `answer` markdown, `followUps?`).

**Interview theme answer depth:** theme `answer` text aims for **symptom → why it happens → what to check (and why) → behind the scenes → production actions → interview tip**, so learners see causes and reasoning—not only a fix list. Follow-ups stay short but causal.

**Senior add-on packs (themes):** Kafka/messaging, JFR + tracing + logs, resilience (circuit breaker, bulkhead, retries), monitoring/SLOs + alerting, production incidents + postmortems, Kubernetes + JVM (probes, OOM, CPU throttle, graceful shutdown).

## Adding content

1. Copy an existing day object in `scenarioDrill.json`.
2. Update `day`, `title`, `phaseId`, and `scenarios`.
3. Run `npm run build` to ensure TypeScript still passes.
4. Run `node scripts/check-scenario-drill.mjs` to see remaining gaps.
5. For LinkedIn-style topic packs, regenerate `scenarioInterviewThemes.json` (see above).
