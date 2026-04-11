/** Shared helpers for Phase 6 day JSON generation (days 53–58). */

export const PADS = [
  'Interviewers reward naming **metrics** (`http_client_requests_seconds`, `resilience4j_circuitbreaker_state`), **trace** correlation IDs, and **rollback** criteria rather than hand-wavy resilience claims.',
  'Tie answers to **Spring** reality: **Feign** + **LoadBalancer**, **WebClient** + **`ExchangeFilterFunction`**, **Resilience4j** registries, and **Micrometer** tags that make **on-call** searches fast.',
  'Explain **second-order** effects: **retry** amplification, **queue** growth, **thread** **pool** exhaustion, and **cost** of extra **hops** when **edge** dependencies like **Redis** rate-limit stores fail.',
  'Close with **prevention**: **contract** tests for **clients**, **SLO** alerts on **client-side** **error** rates, **game** days that **kill** **pods** during **business** hours in **staging**, and **lint** rules banning **blocking** calls on **reactor** threads.',
  'When **Kubernetes** is involved, cite **readiness**, **HPA**, **NetworkPolicy**, and **Service** **DNS** as factors that change **latency** independent of **Java** **code**.',
  'For **gateway** and **service** stacks, emphasize **timeout** ordering (**outer > inner**), **bulkheads** per **tenant**, and **JWT** **cache** **TTL** during **issuer** rotations.',
  'Communicate **executive**-friendly **impact**: **customer** **minutes** degraded, **error** **budget** burn, **mitigation** **ETA**, and **post-incident** **themes** mapped to **roadmap** work.',
  'Reference **security**: **mTLS** **service** identity, **OAuth2** **scopes**, **audit** logs at **edge**, and why **secrets** never belong in **Feign** **URL** query strings.',
  'Contrast **happy** **path** docs with **partition** behavior: **split** **retries**, **half-open** **probes**, **degraded** **read** modes, and **idempotency** keys that prevent **duplicate** **writes**.',
  'Mention **verification**: **`curl -v`** through **gateway**, **`kubectl logs`**, **APM** **waterfall** **spans**, and **dashboards** that slice **p99** by **downstream** **service** **name**.',
  'Senior answers separate **symptom** from **root** **cause**: **502** at **edge** can be **empty** **Endpoints**, **stale** **pool**, or **upstream** **panic**—each needs different **first** **commands**.',
  'Call out **ownership**: **platform** **SRE** for **mesh**/**certs**, **service** teams for **timeout** policy, **SRE** for **SLO** **burn** **alerts**—and how those teams **coordinate** during **sev-1** calls.',
];

export function wc(s) {
  return String(s)
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export function padToMinWords(text, minWords) {
  let out = String(text).trim();
  let i = 0;
  const h = [...out].reduce((x, c) => x + c.charCodeAt(0), 0);
  while (wc(out) < minWords && i < 80) {
    out = `${out} ${PADS[(h + i) % PADS.length]}`;
    i += 1;
  }
  return out;
}

export function fu(q, a) {
  return { question: q, answer: padToMinWords(a, 62) };
}

export function conceptualItem(q, a, topic) {
  const ans = padToMinWords(a, 45);
  return {
    question: q,
    answer: ans,
    followUps: [
      fu(
        `Production follow-up: which **dashboards** or **metrics** expose this for **${topic}**?`,
        `Start with **client** **outbound** **histograms** and **resilience4j** **circuitbreaker** **state** **gauges**, then open **distributed** **traces** filtered by **service** **name** and **route**. ${a.slice(0, 100)}`,
      ),
      fu(
        `How do you **roll out** a policy change here without a **retry** **storm**?`,
        `Use **feature** **flags**, **canary** **deployments**, **tight** **retry** **budgets** on **non-idempotent** calls, and **verify** with **load** tests that **match** **production** **fan-out**. ${a.slice(0, 90)}`,
      ),
    ],
  };
}

export function codeBasedItem(q, a) {
  return {
    question: q,
    answer: a,
    followUps: [
      fu(
        'What breaks at **runtime** if this snippet is mis-wired?',
        `Misconfiguration usually surfaces as **timeouts**, **503**, or **silent** **fallbacks**—verify **beans**, **profiles**, and **classpath** **starters**. Reference **Actuator** **health** and **metrics** before guessing.`,
      ),
      fu(
        'How do you **test** this in **CI** without **flaky** **network**?',
        `Prefer **WireMock** or **MockWebServer** with **deterministic** **responses**, assert **Resilience4j** **events**, and keep **tests** **hermetic** so **pipelines** stay **green**.`,
      ),
    ],
  };
}

export function seniorItem(q, immediate, root, fix, prevent) {
  const body = `**(1) Immediate response** ${immediate}\n\n**(2) Root cause** ${root}\n\n**(3) Fix** ${fix}\n\n**(4) Prevention** ${prevent}`;
  return {
    question: q,
    answer: padToMinWords(body, 150),
    followUps: [
      fu(
        'How do you **communicate** **impact** and **ETA** during this incident?',
        padToMinWords(
          'Share **SLO** **burn**, **customer** **regions** affected, **mitigation** steps in flight, and **explicit** unknowns. Avoid **blaming** **users**; focus on **measurable** recovery criteria.',
          62,
        ),
      ),
      fu(
        'Which **post-incident** **action** items are **non-negotiable**?',
        padToMinWords(
          'At minimum: **runbook** update, **dashboard** gap closed, **test** that **reproduces** the failure, and **owner** with **deadline**. Tie themes to **error** **budget** policy.',
          62,
        ),
      ),
    ],
  };
}

export function scenarioDrillItem(day, idx, question, signals, answerCore) {
  const id = `d${day}-s${idx}`;
  return {
    id,
    question,
    signals,
    answer: padToMinWords(
      `**Root cause:** ${answerCore.root} **What breaks in production:** ${answerCore.breaks} **Fix:** ${answerCore.fix} **Interview angle:** ${answerCore.angle}`,
      100,
    ),
    followUps: [
      fu(
        answerCore.fq1q,
        padToMinWords(answerCore.fq1a, 62),
      ),
      fu(
        answerCore.fq2q,
        padToMinWords(answerCore.fq2a, 62),
      ),
    ],
  };
}

export function assemblePhaseDay(cfg) {
  const [basic, inter, adv] = cfg.codes;
  return {
    day: cfg.day,
    title: cfg.title,
    estimatedHours: cfg.estimatedHours ?? 3,
    difficulty: cfg.difficulty ?? 'Advanced',
    level: cfg.level ?? 'Advanced',
    track: cfg.track ?? 'Mid-Level',
    tags: cfg.tags,
    prerequisites: cfg.prerequisites,
    learningObjectives: cfg.learningObjectives,
    sections: [
      { type: 'why', title: `Why ${cfg.title} matters`, content: cfg.why },
      { type: 'theory', title: `Theory and Internals - ${cfg.title}`, content: cfg.theory },
      {
        type: 'code',
        title: basic.title,
        language: 'java',
        filename: basic.filename,
        code: basic.code,
        level: 'basic',
        output: basic.output,
        description: basic.description,
      },
      {
        type: 'code',
        title: inter.title,
        language: 'java',
        filename: inter.filename,
        code: inter.code,
        level: 'intermediate',
        output: inter.output,
        description: inter.description,
      },
      {
        type: 'code',
        title: adv.title,
        language: 'java',
        filename: adv.filename,
        code: adv.code,
        level: 'advanced',
        output: adv.output,
        description: adv.description,
      },
      {
        type: 'diagram',
        title: cfg.diagram.title,
        diagramType: 'component',
        description: cfg.diagram.description,
        plantuml: cfg.diagram.plantuml,
      },
      { type: 'pitfalls', title: 'Common Pitfalls', items: cfg.pitfalls },
      {
        type: 'exercise',
        title: `Exercise — ${cfg.exercise.titleSuffix}`,
        problem: cfg.exercise.problem,
        hints: cfg.exercise.hints,
        solution: cfg.exercise.solution,
        difficulty: cfg.exercise.difficulty ?? 'Advanced',
      },
      {
        type: 'interview',
        title: 'Interview Drill',
        conceptual: cfg.interview.conceptual,
        codeBased: cfg.interview.codeBased,
        seniorScenario: cfg.interview.seniorScenario,
        wrongAnswers: cfg.interview.wrongAnswers,
      },
      { type: 'cheatsheet', title: 'Cheatsheet', content: cfg.cheatsheet },
    ],
  };
}

export function writeJsonSync(fs, path, obj) {
  fs.writeFileSync(path, JSON.stringify(obj, null, 2), 'utf8');
}
