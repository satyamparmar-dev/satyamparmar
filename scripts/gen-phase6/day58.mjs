import { conceptualItem, codeBasedItem, seniorItem, scenarioDrillItem } from './lib.mjs';

const T = 'strangler fig and ACL';

const conceptual = [
  conceptualItem('What is the **Strangler** **Fig** **pattern**?', 'Incrementally **route** **traffic** **from** **legacy** **to** **new** **services** until **the** **old** **system** **can** **be** **retired**—**like** **vines** **replacing** **a** **tree**.', T),
  conceptualItem('What is an **Anti-Corruption** **Layer** **(ACL)**?', 'A **translation** **boundary** **that** **maps** **foreign** **models** **to** **your** **domain** **so** **legacy** **concepts** **do** **not** **leak** **in**.', T),
  conceptualItem('How **route** **traffic** **in** **Strangler**?', '**Feature** **flags**, **proxy** **rules**, **API** **gateway** **percentage** **splits**, **URL** **prefix** **migrations**.', T),
  conceptualItem('What **data** **sync** **strategies** **during** **strangle**?', '**Dual** **write**, **CDC**, **batch** **ETL**, **event** **carried** **state** **transfer**—each **has** **consistency** **trade-offs**.', T),
  conceptualItem('When **ACL** **vs** **shared** **database** **integration**?', '**ACL** **preferred** **when** **models** **diverge**; **shared** **DB** **creates** **tight** **coupling** **hard** **to** **cut**.', T),
  conceptualItem('What **metrics** **prove** **strangler** **progress**?', '**Percentage** **requests** **served** **by** **new** **stack**, **error** **rate** **parity**, **latency** **SLO** **match**.', T),
  conceptualItem('What **risk** **cutover** **weekend** **big** **bang**?', '**Unknown** **integration** **surprises** **with** **no** **rollback** **ramp**.', T),
  conceptualItem('How **test** **ACL** **translations**?', '**Contract** **tests** **with** **golden** **fixtures** **from** **legacy** **payloads**.', T),
  conceptualItem('What **organizational** **challenge**?', '**Two** **teams** **maintaining** **dual** **systems** **during** **long** **migration**.', T),
  conceptualItem('What **security** **during** **strangle**?', '**Consistent** **auth** **at** **edge**; **do** **not** **duplicate** **authz** **logic** **differently** **per** **route** **slice**.', T),
  conceptualItem('What **decomposing** **monolith** **by** **domain**?', 'Identify **bounded** **contexts**, **strangle** **hottest** **paths** **first** **with** **clear** **ownership**.', T),
  conceptualItem('How **handle** **sessions** **during** **routing** **split**?', '**Sticky** **sessions** **or** **central** **session** **store**; **JWT** **stateless** **often** **simpler**.', T),
  conceptualItem('What **rollback** **plan**?', '**Toggle** **traffic** **back** **to** **legacy** **with** **feature** **flag** **and** **verify** **data** **reconciliation**.', T),
  conceptualItem('What **observability** **across** **old** **and** **new**?', '**Unified** **trace** **ids** **across** **proxy** **hops** **into** **both** **codebases**.', T),
  conceptualItem('When **stop** **strangler**?', 'When **legacy** **handles** **zero** **production** **traffic** **and** **data** **drained** **or** **archived**.', T),
];

const codeBased = [
  codeBasedItem('**Spring** **@Profile("legacy")** bean', '// Route implementation behind interface'),
  codeBasedItem('**ACL** **mapper** **MapStruct** comment', '// LegacyOrderDTO -> domain.Order'),
  codeBasedItem('**nginx** **split** **traffic** comment', '// weight=80 legacy; weight=20 new'),
  codeBasedItem('**Feature** **flag** **pseudo', '// if (flags.useNewPricing()) return newModule.quote();'),
  codeBasedItem('**Kafka** **CDC** **to** **new** **read** **model**', '// Debezium capture pricing table changes'),
  codeBasedItem('**API** **gateway** **route** **predicate**', '// Path=/v2/payments/** -> new cluster'),
  codeBasedItem('**Database** **view** **facade** **anti-pattern** note', '// Thin views still couple schema—prefer ACL service'),
  codeBasedItem('**Contract** **test** **pact** **provider**', '// verify legacy JSON shapes'),
  codeBasedItem('**Spring** **RestTemplate** **adapter** **in** **ACL**', '// call legacy HTTP, translate exceptions'),
  codeBasedItem('**OpenRewrite** **mention** for **Java** **migrations**', '// automated refactor helpers'),
];

const seniorScenario = [
  seniorItem('**Program:** **5-year** **mainframe** **strangle** **stalled** **at** **30%** **traffic**.', '**Executive** **review**; **re-scope** **domains**.', '**Underestimated** **data** **reconciliation**.', '**Narrow** **slice** **with** **clear** **ROI**; **hire** **integration** **SMEs**.', '**Quarterly** **milestone** **metrics** **on** **dashboard**.'),
  seniorItem('**Incident:** **ACL** **throws** **on** **new** **legacy** **field** **breaking** **JSON**.', '**Rollback** **flag**; **add** **tolerant** **parser**.', '**Unknown** **field** **policy** **too** **strict**.', '**Forward-compatible** **DTOs** **ignore** **unknowns**.', '**Sample** **production** **payloads** **in** **CI**.'),
  seniorItem('**Design:** **shared** **DB** **vs** **ACL** **service** **for** **inventory**.', 'Recommend **ACL** **with** **events**.', '**Shared** **DB** **blocks** **team** **autonomy**.', '**CDC** **out** **to** **new** **service** **read** **model**.', '**ADR** **documented** **with** **cost** **estimate**.'),
  seniorItem('**Security:** **legacy** **uses** **clear** **passwords** **in** **config**.', '**Rotate** **secrets**; **vault** **integration**.', '**ACL** **copied** **config** **to** **repo**.', '**Secret** **manager** **+** **audit**.', '**Scanner** **blocks** **commits**.'),
  seniorItem('**Scale:** **dual** **write** **overload** **database**.', '**Throttle** **migration** **jobs**.', '**Write** **amplification** **2x**.', '**Switch** **to** **CDC** **or** **async** **outbox**.', '**Capacity** **plan** **before** **cutover**.'),
  seniorItem('**Compliance:** **retain** **legacy** **audit** **logs** **10y** **while** **new** **stack** **different** **format**.', '**Archive** **immutable** **blob** **store**.', '**Lost** **chain** **of** **custody** **risk**.', '**Normalized** **export** **pipeline** **with** **checksums**.', '**Legal** **sign-off** **on** **format** **change**.'),
];

const wrongAnswers = [
  '**Strangler** **means** **rewrite** **everything** **first** — **Correction:** **Incremental** **slice** **by** **slice**.',
  '**ACL** **is** **only** **for** **external** **vendors** — **Correction:** **Use** **between** **any** **foreign** **model** **and** **your** **domain**.',
  '**Feature** **flags** **remove** **need** **for** **tests** — **Correction:** **Automate** **checks** **per** **flag** **state**.',
  '**100%** **traffic** **flip** **is** **lowest** **risk** — **Correction:** **Gradual** **ramps** **reduce** **blast** **radius**.',
  '**Shared** **DB** **fastest** **therefore** **best** — **Correction:** **Coupling** **cost** **hits** **later** **hard**.',
  '**ACL** **should** **expose** **legacy** **tables** **directly** — **Correction:** **Translate** **to** **domain** **types**.',
  '**Strangler** **ends** **when** **code** **deleted** **only** — **Correction:** **Data** **and** **observability** **also** **migrate**.',
  '**Monolith** **always** **bad** — **Correction:** **Right** **size** **for** **team** **and** **scale**.',
];

const why = `**Legacy** **systems** **pay** **the** **bills** **but** **block** **velocity**. The **Strangler** **Fig** **pattern** **is** **how** **adults** **migrate** **without** **betting** **the** **company** **on** **a** **big** **bang**. **ACLs** **keep** **your** **new** **domain** **model** **clean** **when** **the** **old** **world** **is** **messy**.\n\nInterviewers **listen** **for** **traffic** **shaping**, **data** **reconciliation**, **rollback** **plans**, and **honest** **trade-offs** **about** **dual** **write** **pain**.\n\nThis **day** **caps** **Phase** **6** **microservices** **topics** **before** **messaging** **deep** **dives** **in** **Phase** **7**.\n\nYou **should** **connect** **strangler** **milestones** **to** **business** **KPIs**, **not** **only** **engineering** **tasks**.\n\nFinally, **governance** **of** **feature** **flags** **and** **observability** **parity** **separates** **successful** **migrations** **from** **fire** **drills**.`;

const theory = `### Day 58 — **Advanced** **microservices** **patterns**\n\n### 1. Strangler Fig\nIncremental **routing** **and** **capability** **replacement**.\n\n### 2. ACL\nTranslate **foreign** **models** **to** **ubiquitous** **language**.\n\n### 3. Routing\n**Proxy**, **gateway**, **flags**.\n\n### 4. Data migration\n**Dual** **write**, **CDC**, **reconciliation** **jobs**.\n\n### 5. Testing\n**Contract** **tests** **on** **ACL** **edges**.\n\n### 6. Ops\n**Unified** **dashboards** **per** **user** **journey**.\n\n### 7. Security\n**Consistent** **auth** **during** **split**.\n\n### 8. Story\n**Pricing** **slice** **moved** **to** **new** **service** **behind** **ACL** **with** **0.1%** **canary** **ramp**.`;

const basic = {
  title: 'Basic — Strangler + ACL vocabulary',
  filename: 'Day58Basic.java',
  description: 'Definitions and routing ideas.',
  code: `package arch.day58;

public class Day58Basic {
    public static void main(String[] args) {
        System.out.println("=== Strangler Fig ===");
        System.out.println("Gradually route traffic from legacy to new implementation behind a facade");
        System.out.println("Measure parity: errors, latency, business KPIs per slice");
        System.out.println();
        System.out.println("=== Anti-Corruption Layer ===");
        System.out.println("Translate legacy DTOs / XML / odd enums into your domain model");
        System.out.println("Keep foreign concepts from leaking past the boundary");
        System.out.println();
        System.out.println("=== Common routing mechanisms ===");
        System.out.println("API gateway weights, feature flags, reverse proxy path rules");
    }
}
`,
  output: `=== Strangler Fig ===
Gradually route traffic from legacy to new implementation behind a facade
Measure parity: errors, latency, business KPIs per slice

=== Anti-Corruption Layer ===
Translate legacy DTOs / XML / odd enums into your domain model
Keep foreign concepts from leaking past the boundary

=== Common routing mechanisms ===
API gateway weights, feature flags, reverse proxy path rules
`,
};

const intermediate = {
  title: 'Intermediate — Traffic split simulation',
  filename: 'Day58Intermediate.java',
  description: 'Deterministic routing by percentage bucket.',
  code: `package arch.day58;

public class Day58Intermediate {

    static String route(int bucketPercent, int cutoff) {
        if (bucketPercent < cutoff) {
            return "LEGACY";
        }
        return "NEW_STACK";
    }

    public static void main(String[] args) {
        System.out.println("=== Traffic split demo ===");
        System.out.println("bucket=5 -> " + route(5, 10));
        System.out.println("bucket=50 -> " + route(50, 10));
        System.out.println("bucket=9 -> " + route(9, 10));
    }
}
`,
  output: `=== Traffic split demo ===
bucket=5 -> LEGACY
bucket=50 -> NEW_STACK
bucket=9 -> LEGACY
`,
};

const advanced = {
  title: 'Advanced — ACL translation table',
  filename: 'Day58Advanced.java',
  description: 'Maps legacy status codes to domain enums.',
  code: `package arch.day58;

import java.util.*;

public class Day58Advanced {

    static String toDomain(String legacyCode) {
        return switch (legacyCode) {
            case "A1" -> "OrderPending";
            case "Z9" -> "OrderCancelled";
            case "X7" -> "OrderShipped";
            default -> "OrderUnknown";
        };
    }

    public static void main(String[] args) {
        List<String> codes = List.of("A1", "X7", "ZZ");
        System.out.println("=== ACL translation ===");
        for (String c : codes) {
            System.out.println(c + " -> " + toDomain(c));
        }
    }
}
`,
  output: `=== ACL translation ===
A1 -> OrderPending
X7 -> OrderShipped
ZZ -> OrderUnknown
`,
};

const diagram = {
  title: 'Strangler with ACL in front of legacy',
  description: 'New service receives traffic slice; ACL adapts legacy when needed.',
  plantuml: `@startuml
title Day 58 — Strangler + ACL
actor Client
participant Gateway
participant "New Service" as NS
participant ACL
participant "Legacy Monolith" as L

Client -> Gateway : /orders
Gateway -> NS : 10% traffic
Gateway -> L : 90% traffic
NS -> ACL : needs legacy pricing
ACL -> L : SOAP/REST legacy call
ACL --> NS : domain PriceQuote
@enduml`,
};

const pitfalls = [
  '**Big** **bang** **cutover** **without** **canary** **or** **rollback** **flag**, **causing** **multi-hour** **outages**.',
  '**Translating** **legacy** **errors** **into** **domain** **exceptions** **without** **mapping** **table**, **breaking** **client** **contracts**.',
  '**Dual** **write** **without** **reconciliation** **job**, **diverging** **inventory** **counts** **silently**.',
  '**Copy-pasting** **legacy** **field** **names** **into** **new** **database** **schema**, **cementing** **corruption** **forever**.',
  '**Feature** **flags** **sprawl** **without** **ownership**, **leaving** **mystery** **toggles** **nobody** **dares** **remove**.',
  '**ACL** **that** **grows** **into** **god** **service** **with** **all** **domains** **mixed** **together**.',
  '**Ignoring** **session** **affinity** **during** **split**, **random** **401s** **for** **users**.',
  '**Decommissioning** **legacy** **before** **archiving** **audit** **data**, **violating** **retention** **policy**.',
];

const exerciseSolution = `package arch.day58;

import java.util.*;

/**
 * Day 58 assignment: strangler routing + ACL decision (deterministic).
 */
public class Day58Exercise {

    static String chooseBackend(String path, int userBucket) {
        if (path.startsWith("/v2/")) {
            return "NEW";
        }
        if (path.startsWith("/legacy/") && userBucket < 20) {
            return "NEW";
        }
        return "LEGACY";
    }

    static String aclTranslate(String legacyStatus) {
        if ("OLD_OPEN".equals(legacyStatus)) {
            return "ShipmentOpen";
        }
        if ("OLD_CLOSED".equals(legacyStatus)) {
            return "ShipmentClosed";
        }
        return "ShipmentUnknown";
    }

    public static void main(String[] args) {
        System.out.println("=== Strangler + ACL assignment ===");
        System.out.println("path=/v2/orders b=5 -> " + chooseBackend("/v2/orders", 5));
        System.out.println("path=/legacy/orders b=10 -> " + chooseBackend("/legacy/orders", 10));
        System.out.println("path=/legacy/orders b=50 -> " + chooseBackend("/legacy/orders", 50));
        System.out.println("ACL OLD_OPEN -> " + aclTranslate("OLD_OPEN"));
        System.out.println("ACL UNKNOWN -> " + aclTranslate("WEIRD"));
    }
}
`;

const exercise = {
  titleSuffix: 'Strangler migration and anti-corruption layer (Day 58 assignment)',
  problem:
    'Align with **Day 58 Assignment**: **Strangler migration and anti-corruption layer**.\n\n1. Implement **`chooseBackend(String path, int userBucket)`** with **rules**: paths **starting** **`/v2/`** → **`NEW`**; paths **`/legacy/`** with **`userBucket < 20`** → **`NEW`**; **else** **`LEGACY`**.\n2. Implement **`aclTranslate(String legacyStatus)`**: **`OLD_OPEN`** → **`ShipmentOpen`**, **`OLD_CLOSED`** → **`ShipmentClosed`**, **else** **`ShipmentUnknown`**.\n3. **`main()`** prints **five** **lines** **exactly** as the **reference** output **(header** **+** **four** **cases**).\n4. **Deterministic** **only**.',
  hints: [
    'Use **`String.startsWith`** for **path** **rules**.',
    'Compare **bucket** **with** **20** **for** **canary** **slice**.',
    'Match **output** **strings** **verbatim**.',
  ],
  solution: exerciseSolution,
  difficulty: 'Advanced',
};

const cheatsheet = `| Topic | Rule | One-liner |
|---|---|---|
| Strangler | Slice by route | Canary with metrics |
| ACL | Translate only | Stop legacy nouns leaking |
| Feature flag | Owned + TTL | Remove after migration |
| Dual write | Reconcile | Detect drift early |
| CDC | Log-based | Decouple from legacy code |
| Gateway | Weighted routes | Roll back with config |
| Contract test | Golden legacy payloads | ACL safe refactors |
| Session | Sticky or JWT | Avoid random logouts |
| Decommission | Zero traffic + archive | Legal retention satisfied |
| ADR | Document trade-offs | Future teams understand why |`;

const drillSeeds = [
  { question: 'Code review: **new** **service** **reads** **legacy** **ORDER** **table** **directly** **with** **SELECT** **\***.', signals: ['coupling', 'schema', 'ACL', 'bounded'], core: { root: '**Bypasses** **ACL** **and** **couples** **schemas**.', breaks: '**Cannot** **change** **legacy** **without** **breaking** **new**.', fix: '**ACL** **API** **or** **CDC** **event**.', angle: '**Bounded** **context** **ownership**.', fq1q: 'Exception?', fq1a: '**Read-only** **reporting** **with** **frozen** **view** **sometimes** **ok** **short** **term**.', fq2q: 'Long-term?', fq2a: '**Extract** **data** **to** **owned** **store**.' } },
  { question: '**Incident:** **10%** **canary** **shows** **higher** **revenue** **discrepancy**.', signals: ['reconciliation', 'bug', 'money', 'rollback'], core: { root: '**Tax** **rounding** **differs** **between** **stacks**.', breaks: '**Finance** **blocks** **rollout**.', fix: '**Halt** **canary**; **align** **precision** **rules**.', angle: '**Property** **tests** **on** **money** **math**.', fq1q: 'Comms?', fq1a: '**Transparent** **memo** **to** **finance** **with** **timeline**.', fq2q: 'Prevention?', fq2a: '**Shadow** **traffic** **compare** **totals** **daily**.' } },
  { question: '**Design:** **mobile** **still** **calls** **legacy** **host** **directly** **during** **strangle**.', signals: ['edge', 'gateway', 'DNS', 'security'], core: { root: '**Clients** **bypass** **routing** **controls**.', breaks: '**Cannot** **shift** **traffic** **safely**.', fix: '**Stable** **DNS** **to** **gateway** **only**.', angle: '**App** **config** **remote** **update**.', fq1q: 'Timeline?', fq1a: '**Force** **upgrade** **with** **min** **version** **banner**.', fq2q: 'Risk?', fq2a: '**Long** **tail** **old** **apps** **in** **wild**.' } },
  { question: 'Explain **ACL** **vs** **adapter** **in** **ports** **&** **adapters**.', signals: ['hexagonal', 'domain', 'interface', 'clean'], core: { root: '**ACL** **focuses** **on** **model** **translation** **across** **contexts**.', breaks: '**Confusing** **them** **creates** **fat** **adapters**.', fix: '**Keep** **ACL** **at** **boundary** **only**.', angle: '**Domain** **language** **stays** **pure** **inside**.', fq1q: 'Test?', fq1a: '**Table** **tests** **legacy** **→** **domain**.', fq2q: 'Refactor?', fq2a: '**Replace** **legacy** **behind** **same** **ACL** **interface**.' } },
  { question: '**Trade-off:** **feature** **flag** **vs** **blue/green** **deploy** **for** **strangler** **slice**.', signals: ['rollback', 'infra', 'risk', 'speed'], core: { root: '**Flags** **fine-grained**; **blue/green** **whole** **stack**.', breaks: '**Wrong** **tool** **slows** **team**.', fix: '**Use** **flags** **for** **user** **percent**; **blue/green** **for** **binary** **releases**.', angle: '**Cost** **of** **double** **infra**.', fq1q: 'Ops?', fq1a: '**Flag** **service** **SLO** **must** **match** **payment** **tier**.', fq2q: 'Cleanup?', fq2a: '**Flag** **removal** **tickets** **in** **same** **epic**.' } },
  { question: '**Gotcha:** **ACL** **caches** **legacy** **responses** **forever** **without** **TTL**.', signals: ['stale', 'cache', 'consistency', 'bug'], core: { root: '**Users** **see** **wrong** **prices** **after** **promo** **ends**.', breaks: '**Revenue** **loss** **or** **legal** **risk**.', fix: '**TTL** **+** **invalidation** **webhook** **from** **legacy** **if** **possible**.', angle: '**Event** **driven** **cache** **bust**.', fq1q: 'Metric?', fq1a: '**Stale** **read** **age** **histogram**.', fq2q: 'UX?', fq2a: '**Show** **as-of** **timestamp** **on** **quotes**.' } },
  { question: '**Senior:** **enterprise** **strangler** **governance** **across** **200** **teams**.', signals: ['standards', 'review', 'platform', 'metrics'], core: { root: '**Inconsistent** **patterns** **per** **team**.', breaks: '**No** **executive** **trust** **in** **migration**.', fix: '**Reference** **architecture** **+** **approved** **starters**.', angle: '**Migration** **OKRs** **per** **VP**.', fq1q: 'Metric?', fq1a: '**%** **traffic** **on** **modern** **stack** **per** **domain**.', fq2q: 'Risk?', fq2a: '**Shadow** **IT** **bypassing** **ACL**.' } },
  { question: '**Security:** **ACL** **stores** **legacy** **basic** **auth** **in** **config** **repo**.', signals: ['secret', 'vault', 'git', 'leak'], core: { root: '**Secrets** **in** **git** **history**.', breaks: '**Credential** **stuffing** **risk**.', fix: '**Vault** **integration** **+** **rotate**.', angle: '**Short-lived** **tokens** **to** **legacy** **if** **supported**.', fq1q: 'Response?', fq1a: '**Incident** **response** **rotate** **all** **legacy** **passwords**.', fq2q: 'Prevention?', fq2a: '**Pre-commit** **hooks** **block** **patterns**.' } },
  { question: '**Scale:** **ACL** **instance** **CPU** **high** **XML** **parsing**.', signals: ['cpu', 'parsing', 'batch', 'cache'], core: { root: '**Synchronous** **heavy** **parsing** **per** **request**.', breaks: '**p99** **latency** **up**.', fix: '**Batch** **calls** **to** **legacy** **or** **cache** **normalized** **DTO**.', angle: '**Streaming** **parser** **vs** **DOM**.', fq1q: 'Architecture?', fq1a: '**Sidecar** **pool** **for** **CPU** **heavy** **ACL** **only**.', fq2q: 'Cost?', fq2a: '**Right-size** **pods** **after** **profiling**.' } },
  { question: '**Misconception:** "**Strangler** **finished** **when** **new** **code** **deployed**."', signals: ['traffic', 'data', 'legacy', 'done'], core: { root: '**Legacy** **still** **serves** **traffic** **or** **holds** **data**.', breaks: '**False** **sense** **of** **completion**.', fix: '**Definition** **of** **done** **includes** **traffic** **and** **data** **migration**.', angle: '**Executive** **dashboard** **green** **criteria**.', fq1q: 'Example?', fq1a: '**0** **RPM** **on** **legacy** **LB** **for** **30** **days**.', fq2q: 'Data?', fq2a: '**Archive** **cold** **storage** **with** **retrieval** **runbook**.' } },
];

export const drill58 = {
  day: 58,
  title: 'Advanced Microservices Patterns',
  phaseId: 'phase6',
  tags: ['Strangler Fig', 'ACL', 'migration', 'feature flags', 'legacy', 'dual write', 'CDC'],
  scenarios: drillSeeds.map((s, i) => scenarioDrillItem(58, i + 1, s.question, s.signals, s.core)),
};

export default {
  day: 58,
  title: 'Advanced Microservices Patterns',
  tags: ['Mid-Level', 'Advanced', 'Phase 6', 'Interview Prep', 'Satyverse(Satyam Parmar)', 'Strangler', 'ACL'],
  prerequisites: ['Day 57', 'Day 56'],
  learningObjectives: [
    'Apply the **Strangler** **Fig** **pattern** with **routing**, **canaries**, and **rollback** **plans**',
    'Design an **Anti-Corruption** **Layer** that **maps** **legacy** **models** **to** **your** **domain**',
    'Compare **dual** **write**, **CDC**, and **ACL-backed** **APIs** **for** **data** **migration** **trade-offs**',
    'Instrument **traffic** **splits** **and** **business** **KPI** **parity** **during** **modernization**',
    'Govern **feature** **flags** **and** **decommission** **criteria** **so** **migrations** **actually** **finish**',
    'Align **security** **and** **compliance** **(audit**, **secrets**)** **across** **old** **and** **new** **stacks**',
  ],
  why,
  theory,
  codes: [basic, intermediate, advanced],
  diagram,
  pitfalls,
  exercise,
  cheatsheet,
  interview: { conceptual, codeBased, seniorScenario, wrongAnswers },
};
