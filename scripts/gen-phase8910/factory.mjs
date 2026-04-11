/**
 * Builds enriched day + scenario drill JSON for phases 8–10 (days 68–90).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  assemblePhaseDay,
  writeJsonSync,
  conceptualItem,
  codeBasedItem,
  seniorItem,
  scenarioDrillItem,
} from '../gen-phase6/lib.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const daysDir = path.join(__dirname, '../../public/data/days');

function genericConceptual(T) {
  const pairs = [
    [
      `What **production** **metrics** do you watch first for **${T}**?`,
      `**Latency** **histograms**, **error** **rates**, **saturation** (**CPU**, **connections**, **pool** **wait**), and **business** **KPIs** tied to the same **release** **train**.`,
    ],
    [
      `How do you **validate** a **${T}** change before **full** **rollout**?`,
      `**Canary** or **feature** **flag**, **shadow** **traffic** where possible, **compare** **SLOs**, and **define** **rollback** **triggers** with **owners**.`,
    ],
    [
      `What **failure** **mode** is most **common** in **${T}** **interviews**?`,
      `**Mis-stated** **trade-offs** (**latency** vs **correctness**), **missing** **observability**, or **configs** that **work** in **demo** but **collapse** under **load**.`,
    ],
    [
      `How does **${T}** interact with **on-call** **runbooks**?`,
      `Runbooks should list **first** **commands**, **dashboard** **links**, **safe** **knobs**, and **escalation** **criteria**—not only **textbook** **definitions**.`,
    ],
    [
      `What **security** angle applies to **${T}**?`,
      `**Least** **privilege**, **secret** **rotation**, **audit** **logs**, and **avoiding** **credential** **sprawl** in **repos** and **container** **layers**.`,
    ],
    [
      `Name a **cost** **surprise** related to **${T}**.`,
      `**Egress**, **over-provisioned** **tiers**, **idle** **clusters**, or **expensive** **logs** **retention** without **SLO**-aligned **sampling**.`,
    ],
    [
      `How do you **debug** a **${T}** issue under **time** **pressure**?`,
      `Narrow **blast** **radius**, capture **scoped** **evidence** (**traces**, **plans**, **events**), **reproduce** in **staging**, then **fix** with a **verifiable** **metric**.`,
    ],
    [
      `What **documentation** makes **${T}** maintainable for the **next** **team**?`,
      `**ADRs**, **SLO** **targets**, **capacity** **assumptions**, **known** **limits**, and **upgrade** **playbooks** tied to **versions**.`,
    ],
    [
      `How does **${T}** fit **multi-environment** **promotion** (**dev→stage→prod**)?`,
      `**Parity** **goals**, **data** **sanitization**, **config** **separation**, and **preventing** **prod-only** **surprises**.`,
    ],
    [
      `What **load** **test** would you run for **${T}**?`,
      `A **soak** **test** at **expected** **peak**, **fault** **injection** on **dependencies**, and **assertions** on **p99** and **error** **budget** **burn**.`,
    ],
  ];
  return pairs.map(([q, a]) => conceptualItem(q, a, T));
}

function genericCodeExtra(title) {
  const T = title;
  return [
    codeBasedItem(`**${T}**: show a **config** **snippet** you would **not** ship to prod`, '// placeholders for secrets; missing timeouts'),
    codeBasedItem(`**${T}**: **health** vs **readiness** distinction (conceptual)`, '// readiness gates traffic; health may be liveness'),
    codeBasedItem(`**${T}**: **idempotency** hook in a handler (comment)`, '// dedupe key or unique constraint'),
    codeBasedItem(`**${T}**: **structured** log fields (pseudo)`, '// trace_id, tenant_id, outcome, duration_ms'),
    codeBasedItem(`**${T}**: **feature** **flag** guard pseudo`, '// if (flags.newPath()) return v2; return v1;'),
  ];
}

function genericSeniorPack(title) {
  return [
    seniorItem(
      `**Incident:** **${title}** deploy correlates with **5xx** spike.`,
      'Freeze risky changes; open **SLO** dashboard.',
      '**Config** regression or **dependency** **saturation**.',
      'Rollback or **toggle** **flag**; restore **SLO** then root-cause.',
      'Add **canary** gate and **diff** **alerts** on **golden** metrics.',
    ),
    seniorItem(
      `**Design:** Team wants **shortcuts** that weaken **${title}** reliability.`,
      'Align on **non-negotiable** **SLOs**.',
      'Velocity chosen over **correctness** or **observability**.',
      'ADR with **trade-off** table; phased delivery with **guardrails**.',
      'Quarterly **review** of **debt** introduced by shortcuts.',
    ),
    seniorItem(
      `**Ops:** **On-call** cannot find **${title}** **dashboards** during sev-2.`,
      'Page **platform** owner; assemble **temporary** **view**.',
      '**Observability** **gaps** and **tribal** **knowledge**.',
      'Publish **standard** **dashboard** template per service tier.',
      'Game-day drill validates **discovery** time **SLA**.',
    ),
    seniorItem(
      `**Scale:** **${title}** works in **staging** but **fails** at **10×** traffic.`,
      'Capture **profiles**, **queues**, **pool** metrics.',
      '**Wrong** **capacity** model or **missing** **backpressure**.',
      'Scale **correct** **bottleneck**; add **limits** and **bulkheads**.',
      'Continuous **load** **harness** tied to **release** cadence.',
    ),
    seniorItem(
      `**Security:** **${title}** **credentials** discovered in **container** **image** history.`,
      'Rotate **secrets**; block deploy pipeline.',
      'Build-time **args** leaked layers.',
      'Move to **runtime** **secret** injection; **scan** images in CI.',
      'Policy-as-code forbids **secret** patterns in **Dockerfile**.',
    ),
    seniorItem(
      `**Cost:** **${title}** footprint doubles **cloud** bill after **migration**.`,
      'Finance escalation with **evidence**.',
      '**Over-provisioned** **tiers** and **unused** resources.',
      'Right-size with **metrics**; **autoscaling** tuned to **SLO**.',
      'Monthly **cost** review tied to **service** **owner**.',
    ),
  ];
}

function genericWrong(title) {
  return [
    `**${title}** is **only** a **theory** topic — **Correction:** Tie to **metrics**, **runbooks**, and **trade-offs**.`,
    '**Strong** answers avoid **numbers** — **Correction:** Use **concrete** **SLOs**, **RPS**, **latency** targets.',
    '**One** **tool** solves **everything** for **${title}** — **Correction:** **Context** and **constraints** decide.',
    '**Staging** parity does not matter — **Correction:** Reduce **unknowns** before **prod** **risk**.',
    '**Observability** is **optional** for **${title}** — **Correction:** It is how you **pay** down **incident** **tax**.',
    '**Rollback** is always **instant** — **Correction:** **Schema**, **cache**, and **clients** complicate **revert**.',
    '**Experts** never **misconfigure** **${title}** — **Correction:** **Guardrails** and **reviews** exist for humans.',
    '**Documentation** replaces **automation** — **Correction:** **Both**; **tests** and **pipelines** enforce reality.',
  ];
}

function exerciseBlock(day, title, line1, line2) {
  const pkg = `arch.day${day}`;
  const cls = `Day${day}Exercise`;
  return {
    titleSuffix: `${title} (Day ${day} assignment)`,
    problem: `Print **exactly** two lines matching **assignments** **expectedOutput**:\n1. ${line1}\n2. ${line2}`,
    hints: ['Use **two** **System.out.println** calls with **verbatim** strings.'],
    solution: `package ${pkg};

public class ${cls} {
    public static void main(String[] args) {
        System.out.println("${line1}");
        System.out.println("${line2}");
    }
}
`,
    difficulty: day >= 77 ? 'Expert' : 'Advanced',
  };
}

/** @param {string[]} lines one or two lines (verbatim assignment output) */
export function exerciseFromAssignment(day, title, lines) {
  const diff = day >= 77 ? 'Expert' : 'Advanced';
  const pkg = `arch.day${day}`;
  const cls = `Day${day}Exercise`;
  if (lines.length === 1) {
    const line = lines[0].replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return {
      titleSuffix: `${title} (Day ${day} assignment)`,
      problem: `Print **exactly** one line: ${lines[0]}`,
      hints: ['Single **println** with **verbatim** string.'],
      solution: `package ${pkg};

public class ${cls} {
    public static void main(String[] args) {
        System.out.println("${line}");
    }
}
`,
      difficulty: diff,
    };
  }
  const [a, b] = lines;
  const e1 = a.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const e2 = b.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return {
    titleSuffix: `${title} (Day ${day} assignment)`,
    problem: `Print **exactly** two lines:\n1. ${a}\n2. ${b}`,
    hints: ['Use **two** **println** calls with **verbatim** strings.'],
    solution: `package ${pkg};

public class ${cls} {
    public static void main(String[] args) {
        System.out.println("${e1}");
        System.out.println("${e2}");
    }
}
`,
    difficulty: diff,
  };
}

function defaultDrills(day, title, topic) {
  const T = topic;
  return [
    {
      question: `Code review: **${title}** change ships without **rollback** or **feature** **flag**.`,
      signals: ['deploy', 'risk', 'rollback'],
      core: {
        root: `**Big** **bang** **${T}** rollout without **guardrails**.`,
        breaks: '**Long** **MTTR** and **customer** **impact**.',
        fix: '**Canary**, **flag**, **automated** **rollback** triggers.',
        angle: 'Interview: cite **error** **budget** policy.',
        fq1q: 'Metric?',
        fq1a: '**Error** **rate** and **latency** **SLO** **burn** post-deploy.',
        fq2q: 'Owner?',
        fq2a: '**Service** owner signs **checklist** with **platform** **SRE**.',
      },
    },
    {
      question: `**Incident:** **${title}** **p99** doubled; **CPU** flat.`,
      signals: ['latency', 'queue', 'wait'],
      core: {
        root: '**Lock** **contention**, **pool** **wait**, or **remote** **dependency** slowdown.',
        breaks: '**Cascading** **timeouts** upstream.',
        fix: '**Trace** **waterfalls**, **tune** **pools**, **cache** hot reads, **bulkhead**.',
        angle: 'Separate **saturation** from **efficiency** problems.',
        fq1q: 'First chart?',
        fq1a: '**Pool** **active** vs **idle** and **wait** time histogram.',
        fq2q: 'Prevention?',
        fq2a: '**Load** test with **dependency** **fault** injection.',
      },
    },
    {
      question: `**Design:** **${title}** vs **managed** **alternative** for same workload.`,
      signals: ['trade-off', 'toil', 'cost'],
      core: {
        root: '**Build** vs **buy** decision missing **TCO** and **team** **skills**.',
        breaks: '**Operational** **surprise** after **launch**.',
        fix: '**Decision** **record** with **SLO**, **cost**, **risk**, **exit** plan.',
        fq1q: 'Metric?',
        fq1a: '**Toil** hours per month and **MTTR** comparison.',
        fq2q: 'Security?',
        fq2a: '**Shared** **responsibility** boundaries documented.',
      },
    },
    {
      question: `**Gotcha:** **${title}** **defaults** looked fine in **demo** **traffic** only.`,
      signals: ['load', 'demo', 'prod'],
      core: {
        root: '**Workload** **shape** in **prod** differs (**skew**, **burst**).',
        breaks: '**Incidents** weeks after **launch**.',
        fix: '**Representative** **load** tests and **SLO**-driven **limits**.',
        fq1q: 'Signal?',
        fq1a: '**Tail** **latency** growth while **median** flat.',
        fq2q: 'Culture?',
        fq2a: '**No** **launch** without **capacity** **story**.',
      },
    },
    {
      question: `**Senior:** Standardize **${title}** patterns across **fifty** **services**.`,
      signals: ['platform', 'governance', 'golden'],
      core: {
        root: '**Ad-hoc** configs create **inconsistent** **failure** modes.',
        breaks: '**On-call** cannot compare **incidents**.',
        fix: '**Golden** **path** **starter**, **lint** rules, **review** **gate**.',
        fq1q: 'Metric?',
        fq1a: '**Conformance** score per **service** **tier**.',
        fq2q: 'Migration?',
        fq2a: '**Strangler** per **domain** with **dual** **metrics** window.',
      },
    },
    {
      question: `**Security:** **${title}** exposes **internal** **endpoints** to **internet** by mistake.`,
      signals: ['network', 'exposure', 'acl'],
      core: {
        root: '**Mis-scoped** **security** **groups** or **ingress** rules.',
        breaks: '**Data** **exfiltration** or **abuse**.',
        fix: '**Deny-by-default**, **private** **networks**, **mTLS** where needed.',
        fq1q: 'Detect?',
        fq1a: '**Egress** anomalies and **auth** **failure** spikes.',
        fq2q: 'Process?',
        fq2a: '**Terraform** **policy** checks on **public** **bindings**.',
      },
    },
    {
      question: `**Scale:** **${title}** **single** **tenant** noisy neighbor affects **shared** **platform**.`,
      signals: ['fairness', 'quota', 'noisy'],
      core: {
        root: '**No** **quotas** or **isolation** between **customers**.',
        breaks: '**Multi-tenant** **SLO** miss for **everyone**.',
        fix: '**Rate** **limits**, **dedicated** **pools** for **VIP**, **chargeback**.',
        fq1q: 'Metric?',
        fq1a: '**Per-tenant** **p99** and **saturation** **signals**.',
        fq2q: 'Product?',
        fq2a: '**Tiered** **plans** mapped to **architecture**.',
      },
    },
    {
      question: `**Misconception:** "**${title}** is solved once **tutorials** compile."`,
      signals: ['maturity', 'production'],
      core: {
        root: '**Prod** requires **observability**, **upgrades**, **failure** design.',
        breaks: '**False** **confidence** during **incidents**.',
        fix: '**SLOs**, **runbooks**, **game** days, **postmortems** without **blame**.',
        fq1q: 'Interview tip?',
        fq1a: 'Tell a **war** **story** with **metrics** and **outcome**.',
        fq2q: 'Anti-pattern?',
        fq2a: '**Resume-driven** **complexity** without **need**.',
      },
    },
    {
      question: `**Chaos:** **Dependency** **brownout** during **${title}** peak window.`,
      signals: ['brownout', 'retry', 'storm'],
      core: {
        root: '**Retries** amplify **load** on **weak** **dependency**.',
        breaks: '**Metastable** **failure**.',
        fix: '**Jitter**, **bulkheads**, **timeouts**, **degrade** gracefully.',
        fq1q: 'Test?',
        fq1a: '**Fault** injection on **staging** **weekly**.',
        fq2q: 'Comms?',
        fq2a: '**Status** page with **honest** **ETAs**.',
      },
    },
    {
      question: `**Compliance:** **${title}** change touches **PII** **without** **data** **classification** review.`,
      signals: ['pii', 'governance', 'audit'],
      core: {
        root: '**Shadow** **pipelines** and **logs** capture sensitive fields.',
        breaks: '**Audit** finding and **fines** risk.',
        fix: '**Classification**, **masking**, **retention** policy, **DLP** scans.',
        fq1q: 'Owner?',
        fq1a: '**Data** **governance** + **legal** sign-off path.',
        fq2q: 'Technical?',
        fq2a: '**Column-level** **encryption** or **tokenization** where required.',
      },
    },
  ];
}

export function materialize(m) {
  const conceptual = [...m.conceptualExtra.map(([q, a]) => conceptualItem(q, a, m.T)), ...genericConceptual(m.T)].slice(
    0,
    15,
  );
  const codeBased = [...genericCodeExtra(m.title), ...m.codeExtra.map(([q, a]) => codeBasedItem(q, a))].slice(0, 10);
  const seniorScenario = genericSeniorPack(m.title);
  const drillSeeds = m.drillSeeds ?? defaultDrills(m.day, m.title, m.T);
  const exercise = m.exercise ?? exerciseFromAssignment(m.day, m.title, m.E);

  const tier = m.day >= 77 ? 'Expert' : 'Advanced';
  const cfg = {
    day: m.day,
    title: m.title,
    estimatedHours: 4,
    difficulty: m.difficulty ?? tier,
    level: m.level ?? tier,
    track: 'Senior',
    tags: ['Senior', tier, `Phase ${m.phaseNum}`, 'Interview Prep', 'Satyverse(Satyam Parmar)', ...(m.extraTags ?? [])],
    prerequisites: m.prereqs,
    learningObjectives: m.learningObjectives,
    why: m.why,
    theory: m.theory,
    codes: [m.basic, m.intermediate, m.advanced],
    diagram: m.diagram,
    pitfalls: m.pitfalls,
    exercise,
    cheatsheet: m.cheatsheet,
    interview: { conceptual, codeBased, seniorScenario, wrongAnswers: genericWrong(m.title) },
  };

  const drill = {
    day: m.day,
    title: m.title,
    phaseId: m.phaseId,
    tags: m.drillTags,
    scenarios: drillSeeds.map((s, i) => scenarioDrillItem(m.day, i + 1, s.question, s.signals, s.core)),
  };

  return [cfg, drill];
}

export function writeDay(m) {
  const [cfg, drill] = materialize(m);
  const phaseNum = m.phaseNum;
  writeJsonSync(fs, path.join(daysDir, `phase${phaseNum}-day${m.day}.json`), assemblePhaseDay(cfg));
  writeJsonSync(fs, path.join(daysDir, `scenarioDrill-day${m.day}.json`), drill);
}

export { exerciseBlock };
