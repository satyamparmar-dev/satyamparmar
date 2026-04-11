import { conceptualItem, codeBasedItem, seniorItem, scenarioDrillItem } from './lib.mjs';

const T = 'gRPC and GraphQL';

const conceptual = [
  conceptualItem('What is **gRPC** and why use **HTTP/2** with **protobuf**?', '**gRPC** is a **RPC** framework using **protobuf** **IDL** for **compact** **binary** contracts and **HTTP/2** **multiplexing**. Teams pick it for **low** **latency** **internal** **east-west** traffic where **browser** **compatibility** is not required.', T),
  conceptualItem('How does **GraphQL** differ from **REST** for **mobile** clients?', '**GraphQL** lets clients **fetch** **exact** **field** **graphs** in **one** **round** **trip**, reducing **over-fetching**. The **server** must **protect** against **deep** **queries** and **N+1** **resolver** **issues**.', T),
  conceptualItem('What is the **GraphQL N+1** problem?', 'Each **parent** **object** **resolver** may **trigger** **per-row** **database** **queries** without **batching**. **DataLoader** **batches** and **caches** within a **request** scope to collapse **queries**.', T),
  conceptualItem('Explain **protobuf** **schema** **evolution** rules.', 'Add **optional** **fields** with **new** **numbers**; never **reuse** **field** **numbers**; **unknown** **fields** are **preserved** in **binary** **wire** format. **Breaking** changes require **careful** **versioning** or **dual** **services**.', T),
  conceptualItem('When is **REST** still better at the **public** **edge**?', '**REST** **JSON** is **easy** for **browsers**, **CDNs**, and **caching** **semantics** **everyone** **understands**. **gRPC** typically needs **grpc-web** and **gateways** for **public** **internet** **clients**.', T),
  conceptualItem('What are **gRPC** **streaming** modes?', '**Unary**, **server** **streaming**, **client** **streaming**, and **bidirectional** **streams** map to **protobuf** **RPC** **definitions**. Pick **streams** for **long-lived** **feeds**; keep **unary** for **request/response** **CRUD**.', T),
  conceptualItem('How do **GraphQL** **errors** differ from **REST**?', '**GraphQL** may return **200** **HTTP** with **`errors`** **array** alongside **`data`** **partials**—clients must **inspect** **both**. **REST** usually maps **status** **codes** directly.', T),
  conceptualItem('What is **schema** **stitching** / **federation**?', '**Federation** lets **multiple** **services** **own** **types** in **one** **supergraph** **gateway** that **plans** **queries** across **subgraphs**. **Governance** of **schema** **changes** becomes **critical**.', T),
  conceptualItem('What **security** concerns affect **GraphQL** **public** APIs?', '**Introspection** **leaks** **schema** **details**; **complexity** **limits** and **depth** **limits** stop **DoS**; **rate** **limit** by **query** **cost** not just **HTTP** **QPS**.', T),
  conceptualItem('How does **gRPC** **status** model work?', '**`io.grpc.Status`** carries **canonical** **codes** plus **details** **protobufs** for **rich** **errors**. Map them **consistently** to **client** **exceptions**.', T),
  conceptualItem('What tooling generates **Java** from **protobuf**?', '**protoc** with **grpc-java** **plugin** emits **stubs** and **service** **base** **classes**. **Gradle** **plugins** integrate **codegen** into **CI**.', T),
  conceptualItem('Compare **GraphQL** **subscriptions** to **Kafka** **events**.', '**Subscriptions** suit **push** **updates** to **clients** over **WebSocket**; **Kafka** suits **durable** **event** **backbones** between **services**. **Hybrid** patterns **bridge** **both**.', T),
  conceptualItem('What is **grpc-gateway** / **gRPC-Gateway** pattern?', 'It **translates** **REST** **JSON** **HTTP** to **gRPC** **backend** calls so **legacy** **clients** integrate without **native** **gRPC**.', T),
  conceptualItem('How do you **version** **GraphQL** **schemas** safely?', '**Deprecation** **directives**, **additive** **fields**, **consumer** **tests** for **breaking** **selection** **sets**, and **federated** **composition** **checks** in **CI**.', T),
  conceptualItem('What **observability** hooks matter for **gRPC**?', '**OpenTelemetry** **grpc** **instrumentation**, **per-method** **latency** **histograms**, and **message** **size** **metrics** help **debug** **binary** **protocols**.', T),
];

const codeBased = [
  codeBasedItem('**protobuf** service definition sketch', '// service Payments { rpc Charge(ChargeRequest) returns (ChargeReply); }\n// message ChargeRequest { string idempotency_key = 1; int64 amount_cents = 2; }'),
  codeBasedItem('**GraphQL** schema type + query', '// type Order { id: ID! lines: [Line!]! }\n// query { order(id: \"1\") { lines { sku qty } } }'),
  codeBasedItem('**Spring** **grpc** server stub override (conceptual)', '// @GrpcService\n// public class PayGrpc extends PaymentsGrpc.PaymentsImplBase { ... }'),
  codeBasedItem('**DataLoader** pattern (pseudo)', '// loadMany(keys) -> batch load from DB where id in keys'),
  codeBasedItem('**GraphQL** complexity directive', '// directive @cost(value: Int!) on FIELD_DEFINITION'),
  codeBasedItem('**gRPC** **deadline** propagation', '// Metadata deadlines; ClientCall with deadline after duration'),
  codeBasedItem('**grpcurl** one-liner comment', '// grpcurl -plaintext localhost:9090 list'),
  codeBasedItem('**Apollo** / **Federation** `@key` directive', '// extend type Order @key(fields: \"id\") { id: ID! @external }'),
  codeBasedItem('**GraphQL** mutation idempotency', '// mutation with Idempotency-Key HTTP header at gateway'),
  codeBasedItem('**protobuf** **oneof** for polymorphism', '// oneof payload { Card card = 3; Wallet wallet = 4; }'),
];

const seniorScenario = [
  seniorItem('**Production:** **GraphQL** **gateway** **CPU** **spikes** on **single** **query** **pattern**.', 'Throttle **traffic**, capture **query** **text** **hash**.', '**Unbounded** **resolver** **depth** or **missing** **DataLoader** **batching**.', '1) Add **complexity** **limits**. 2) **Batch** **DB** **access**. 3) **Cache** **hot** **entities**.', '**CI** **performance** **budget** per **query** **pattern**.'),
  seniorItem('**Design:** **Partner** wants **gRPC** **directly** from **browser**.', 'Offer **REST** **BFF** or **grpc-web** **with** **Envoy**.', 'Browsers **lack** **native** **HTTP/2** **trailers** **support** needed for **pure** **gRPC**.', 'Deploy **gateway** **transcoding**; **document** **limits**.', '**ADR** **per** **edge** **protocol** **choice**.'),
  seniorItem('**Migration:** **Monolith** **REST** to **gRPC** **internal** **mesh**.', '**Strangler** **per** **bounded** **context**.', '**Dual** **write** **compatibility** and **schema** **skew**.', 'Run **side-by-side** **services**; **feature** **flag** **clients**.', '**Contract** **tests** on **protobuf** **compat** **matrix**.'),
  seniorItem('**Incident:** **protobuf** **breaking** **change** **shipped** **accidentally**.', '**Rollback** **client** **libraries** **first**.', '**Field** **number** **reuse** or **wrong** **wire** **type**.', 'Add **buf** **breaking** **checks** in **CI**; **hotfix** **server** **to** **accept** **both**.', '**Buf** / **protolock** **mandatory** on **main**.'),
  seniorItem('**Scale:** **Federated** **GraphQL** **composition** **errors** in **deploy**.', 'Block **deploy**; **rollback** **subgraph**.', '**Type** **mismatch** across **subgraphs**.', 'Run **`rover subgraph check`** in **CI**.', '**Schema** **registry** **with** **approval** **workflow**.'),
  seniorItem('**Security:** **GraphQL** **introspection** **enabled** in **prod**.', 'Disable or **auth-gate** **introspection**.', 'Attackers **map** **mutations** for **abuse**.', 'Use **allowlist** **plugins**; **complexity** **limits**.', '**Pen** **test** **quarterly** on **public** **GraphQL**.'),
];

const wrongAnswers = [
  '**GraphQL** always prevents **over-fetching** without trade-offs — **Correction:** **Resolvers** can still **hit** **DB** **heavily** if **poorly** **designed**.',
  '**gRPC** is **human** **debuggable** with **curl** alone — **Correction:** You need **grpcurl** or **proxies**; **binary** **payloads** are **opaque**.',
  '**Protobuf** **requires** **JSON** **for** **compatibility** — **Correction:** **JSON** **mapping** exists but **wire** format is **binary**.',
  '**GraphQL** **subscriptions** **replace** **Kafka** — **Correction:** Different **durability** and **fan-out** **semantics**.',
  '**HTTP/2** **alone** means **gRPC** — **Correction:** **gRPC** adds **framing** and **contracts** atop **HTTP/2**.',
  '**Federation** **removes** **need** for **domain** **ownership** — **Correction:** **Governance** becomes **harder** not **easier**.',
  '**gRPC** **streaming** **always** **simpler** than **REST** — **Correction:** **Backpressure** and **cancellation** **complexity** **increases**.',
  '**GraphQL** **errors** always map to **4xx** **HTTP** — **Correction:** Often **200** with **`errors`** **payload**.',
];

const why = `**gRPC** and **GraphQL** change how **teams** **negotiate** **contracts** between **services** and **clients**. Interviewers want **protocol** **choices** tied to **latency**, **evolution**, and **operational** **risk**, not **trend** **keywords**.\n\n**Mistakes** include **exposing** **raw** **gRPC** to **browsers**, **unbounded** **GraphQL** **queries**, and **breaking** **protobuf** **wires** without **detection**.\n\nStrong answers compare **REST** **edge** vs **gRPC** **internal**, and **GraphQL** **BFF** **aggregation** vs **chattiness** **costs**.\n\nYou should **name** **N+1**, **DataLoader**, **federation** **checks**, and **grpc-web** **gateways** as **tools**, not **buzzwords**.\n\nFinally, **schema** **boundaries** are **ownership** **boundaries**—**who** **approves** **breaking** **changes** matters as much as **syntax**.`;

const theory = `### Day 54 — **gRPC** and **GraphQL**\n\n### 1. **gRPC** core\n**IDL-first** **protobuf** contracts, **codegen**, **HTTP/2**, **flow-control**, **deadlines**, **metadata** **headers**.\n\n### 2. **GraphQL** core\n**Schema**, **resolvers**, **queries** vs **mutations**, **introspection**, **subscriptions**.\n\n### 3. **N+1** and **DataLoader**\n**Batch** **per** **request**; **cache** **within** **request** **scope**.\n\n### 4. **Evolution**\n**Protobuf** **field** **numbers**; **GraphQL** **deprecations**.\n\n### 5. **Edge** vs **internal**\n**REST**/**JSON** **public**; **gRPC** **service** **mesh** **common**.\n\n### 6. **Federation**\n**Supergraph**, **subgraphs**, **composition** **CI**.\n\n### 7. **Security**\n**Complexity** **limits**, **depth** **limits**, **authz** **per** **field**.\n\n### 8. **Story**\n**Mobile** **GraphQL** **query** **spiked** **CPU**—**added** **complexity** **budget** and **DataLoader**—**p99** **recovered**.`;

const basic = {
  title: 'Basic — Protocol comparison tables',
  filename: 'Day54Basic.java',
  description: 'REST vs gRPC vs GraphQL traits; tooling row.',
  code: `package arch.day54;

public class Day54Basic {
    public static void main(String[] args) {
        System.out.println("=== Protocol traits (interview frame) ===");
        System.out.println("REST+JSON  | Cache-friendly edge, human debugging, verbose on wire");
        System.out.println("gRPC       | Binary protobuf, HTTP/2, great internal RPC");
        System.out.println("GraphQL    | Client-shaped reads, schema + resolvers, watch N+1");
        System.out.println();
        System.out.println("=== Schema boundary rules ===");
        System.out.println("1. One owning team per protobuf package / federated type");
        System.out.println("2. Additive changes first; breaking changes need dual-publish plan");
        System.out.println("3. Public edge avoids leaking internal grpc service names");
        System.out.println("4. GraphQL limits: depth + complexity + pagination caps");
        System.out.println("5. gRPC deadlines propagated across every hop");
    }
}
`,
  output: `=== Protocol traits (interview frame) ===
REST+JSON  | Cache-friendly edge, human debugging, verbose on wire
gRPC       | Binary protobuf, HTTP/2, great internal RPC
GraphQL    | Client-shaped reads, schema + resolvers, watch N+1

=== Schema boundary rules ===
1. One owning team per protobuf package / federated type
2. Additive changes first; breaking changes need dual-publish plan
3. Public edge avoids leaking internal grpc service names
4. GraphQL limits: depth + complexity + pagination caps
5. gRPC deadlines propagated across every hop
`,
};

const intermediate = {
  title: 'Intermediate — Schema boundary decisions (4 scenarios)',
  filename: 'Day54Intermediate.java',
  description: 'Deterministic routing rules for which protocol handles which API shape.',
  code: `package arch.day54;

public class Day54Intermediate {

    static String pickProtocol(boolean browserClient, boolean needsStream, boolean strictContract) {
        if (browserClient && needsStream) {
            return "GraphQL subscription or SSE/WS gateway — not raw gRPC to browser";
        }
        if (browserClient) {
            return "REST/JSON or GraphQL over HTTPS at edge";
        }
        if (strictContract && needsStream) {
            return "gRPC streaming between services";
        }
        if (strictContract) {
            return "gRPC unary internal east-west";
        }
        return "REST acceptable when debugging and cache semantics matter";
    }

    static String boundaryRule(String ownerA, String ownerB) {
        if (ownerA.equals(ownerB)) {
            return "SHARED_CONTEXT: protobuf package evolves together";
        }
        return "BOUNDARY: expose DTO via ACL — no leaking internal entity messages";
    }

    public static void main(String[] args) {
        System.out.println("=== Day 54 scenarios ===\\n");
        System.out.println("S1 mobile app read shape flexible -> " + pickProtocol(true, false, false));
        System.out.println("S2 service-to-service ledger RPC -> " + pickProtocol(false, false, true));
        System.out.println("S3 internal live audit stream -> " + pickProtocol(false, true, true));
        System.out.println("S4 same-team aggregates -> " + boundaryRule("billing", "billing"));
        System.out.println("S5 cross-team legacy monolith -> " + boundaryRule("billing", "legacy"));
    }
}
`,
  output: `=== Day 54 scenarios ===

S1 mobile app read shape flexible -> REST/JSON or GraphQL over HTTPS at edge
S2 service-to-service ledger RPC -> gRPC unary internal east-west
S3 internal live audit stream -> gRPC streaming between services
S4 same-team aggregates -> SHARED_CONTEXT: protobuf package evolves together
S5 cross-team legacy monolith -> BOUNDARY: expose DTO via ACL — no leaking internal entity messages
`,
};

const advanced = {
  title: 'Advanced — Query cost scoring (deterministic)',
  filename: 'Day54Advanced.java',
  description: 'Scores GraphQL-style field selections to demonstrate complexity budgeting.',
  code: `package arch.day54;

import java.util.*;

public class Day54Advanced {

    static int fieldCost(String name) {
        return switch (name) {
            case "user" -> 1;
            case "orders" -> 3;
            case "lines" -> 2;
            default -> 1;
        };
    }

    public static void main(String[] args) {
        List<String> selection = List.of("user", "orders", "lines");
        int depth = selection.size();
        int sum = 0;
        for (String f : selection) {
            sum += fieldCost(f);
        }
        int score = sum * depth;
        System.out.println("=== GraphQL-style cost estimate ===");
        System.out.println("selection=" + selection);
        System.out.println("depthFactor=" + depth + " baseSum=" + sum + " score=" + score);
        System.out.println(score > 18 ? "REJECT: over budget" : "ALLOW: within budget");
    }
}
`,
  output: `=== GraphQL-style cost estimate ===
selection=[user, orders, lines]
depthFactor=3 baseSum=6 score=18
ALLOW: within budget
`,
};

const diagram = {
  title: 'gRPC and GraphQL in a typical platform',
  description: 'Public GraphQL/REST edge, internal gRPC mesh, federation gateway optional.',
  plantuml: `@startuml
title Day 54 — Edge vs internal protocols
actor Mobile
participant "API Gateway" as GW
participant "GraphQL" as GQL
participant "gRPC Payments" as PAY
Mobile -> GW : HTTPS JSON / GraphQL
GW -> GQL : /graphql
GQL -> PAY : gRPC Charge unary
PAY --> GQL : protobuf reply
GQL --> Mobile : JSON data + errors[]
@enduml`,
};

const pitfalls = [
  'Serving **unbounded** **GraphQL** **depth** to **internet** **users**, enabling **cheap** **DoS** with **deep** **nested** **queries**.',
  'Publishing **internal** **gRPC** **package** **names** and **ports** to **mobile** **apps**, **bypassing** **auth** and **WAF** **protections**.',
  '**Reusing** **protobuf** **field** **numbers** after **deprecation**, **corrupting** **wire** **compatibility** **silently**.',
  'Returning **massive** **GraphQL** **lists** without **pagination** **keys**, **OOMing** **gateway** **pods**.',
  'Treating **GraphQL** **`errors`** as **optional** **niceties** while **partial** **data** **breaks** **invariants**.',
  'Running **gRPC** **without** **deadlines**, letting **cascading** **queues** **stall** **the** **mesh**.',
  '**Federated** **subgraphs** **deploying** **without** **composition** **checks**, **breaking** **supergraph** **at** **runtime**.',
  'Using **GraphQL** **mutations** for **long** **running** **jobs** without **async** **task** **pattern**, **timing** **out** **clients**.',
];

const exerciseSolution = `package arch.day54;

import java.util.*;

/**
 * Day 54 assignment: protocol choice + schema boundary table (deterministic).
 */
public class Day54Exercise {

    static String protocolForUseCase(String uc) {
        return switch (uc) {
            case "public-mobile-read" -> "GraphQL-or-REST-edge";
            case "service-stream" -> "gRPC-stream-internal";
            case "partner-webhook-callback" -> "REST-JSON-signed";
            case "high-throughput-internal-rpc" -> "gRPC-unary";
            default -> "undecided";
        };
    }

    static String boundary(String consumer, String producer) {
        if (!consumer.equals(producer)) {
            return "ACL-DTO-required";
        }
        return "shared-schema-ok";
    }

    public static void main(String[] args) {
        System.out.println("=== Day 54: protocol choices & schema boundaries ===\\n");
        for (String uc : List.of("public-mobile-read", "service-stream", "partner-webhook-callback", "high-throughput-internal-rpc")) {
            System.out.println(uc + " -> " + protocolForUseCase(uc));
        }
        System.out.println();
        System.out.println("orders->payments boundary: " + boundary("orders", "payments"));
        System.out.println("billing->billing boundary: " + boundary("billing", "billing"));
    }
}
`;

const exercise = {
  titleSuffix: 'Protocol choices and schema boundaries (Day 54 assignment)',
  problem:
    'Align with **Day 54 Assignment**: **Protocol choices and schema boundaries**.\n\n1. Implement **`protocolForUseCase(String)`** returning a **fixed** string for each of: **`public-mobile-read`**, **`service-stream`**, **`partner-webhook-callback`**, **`high-throughput-internal-rpc`** (use the **exact** strings shown in the reference **`main()`** output).\n2. Implement **`boundary(String consumer, String producer)`** returning **`ACL-DTO-required`** when teams differ, else **`shared-schema-ok`**.\n3. **`main()`** prints a **header**, **four** protocol lines, a **blank** line, then **two** boundary lines (**orders→payments**, **billing→billing**) **exactly** as in the model output.\n4. **No** randomness, **`UUID`**, **`currentTimeMillis`**, or **`hashCode`** decisions.',
  hints: [
    'Use **`switch` expressions** or **`Map`** for the **use-case** table.',
    'Compare **consumer** and **producer** with **`String.equals`**.',
    'Match **reference** output **verbatim** for autograding-style checks.',
  ],
  solution: exerciseSolution,
  difficulty: 'Advanced',
};

const cheatsheet = `| Topic | Rule | One-liner |
|---|---|---|
| gRPC | Protobuf + HTTP/2 | Internal RPC default for JVM fleets |
| GraphQL | Schema + resolvers | Add complexity + depth limits |
| N+1 | Per-row fetches | DataLoader batch per request |
| Federation | Subgraphs + gateway | CI composition checks mandatory |
| Evolution | Field numbers sacred | Buf breaking checks on main |
| grpc-web | Envoy/gateway | Browsers need translation layer |
| Errors | gRPC status / GraphQL errors | Partial data still needs authz |
| Deadlines | Propagate metadata | Stops silent queue growth |
| REST edge | Cache semantics | Still king for public JSON |
| ACL | Anti-corruption DTO | Cross-team protobuf needs translation |`;

const drillSeeds = [
  { question: 'Code review: **GraphQL** **resolver** hits **database** **inside** **loop** over **order** **lines** without **DataLoader**.', signals: ['N+1', 'batch', 'resolver', 'latency'], core: { root: 'Classic **N+1** **resolver** **pattern**.', breaks: '**p99** **blows** **up** with **catalog** **size**.', fix: '**DataLoader** **batch** **+** **cache**; **dataloader** **per** **request** **scope**.', angle: 'Show **EXPLAIN** **count** **before**/**after**.', fq1q: 'How **verify** in **staging**?', fq1a: '**Trace** **SQL** **statement** **count** per **GraphQL** **operation** **hash**.', fq2q: 'What **metric** **alerts**?', fq2a: '**Resolver** **time** **p95** and **DB** **query** **count** **per** **operation**.' } },
  { question: '**Incident:** **gRPC** **DEADLINE_EXCEEDED** **spike** after **network** **blip**.', signals: ['deadline', 'retry', 'backoff', 'cascade'], core: { root: '**Too** **short** **deadlines** or **retry** **storms** **on** **transient** **errors**.', breaks: '**Clients** **fail** **fast** while **server** **still** **works**.', fix: 'Tune **SLO-based** **timeouts**, **jittered** **retry** **budget**.', angle: 'Compare **outer** **gateway** **vs** **inner** **stub** **deadlines**.', fq1q: 'Rollback **plan**?', fq1a: '**Feature** **flag** **client** **deadline** **multiplier** **until** **stable**.', fq2q: 'Prevention?', fq2a: '**Chaos** **latency** **injection** **on** **grpc** **mesh**.' } },
  { question: '**Design:** **Partner** **API** **shape** **changes** weekly — **GraphQL** vs **versioned** **REST**.', signals: ['evolution', 'contract', 'mobile', 'coupling'], core: { root: '**GraphQL** **helps** **additive** **fields** but **requires** **discipline**.', breaks: '**Breaking** **renames** **still** **hurt** **clients**.', fix: '**@deprecated** **fields**, **consumer** **tests**, **BFF** **layer**.', angle: 'Discuss **mobile** **release** **train** **constraints**.', fq1q: 'When **REST** **version** **better**?', fq1a: '**Binary** **partners** **prefer** **explicit** **v2** **paths** **+** **OpenAPI**.', fq2q: 'GraphQL **win**?', fq2a: '**Many** **screen-specific** **shapes** **without** **explosion** of **endpoints**.' } },
  { question: 'Explain **protobuf** **unknown** **fields** and **forwards** **compatibility**.', signals: ['wire', 'evolution', 'proto3', 'compat'], core: { root: '**Parsers** **preserve** **unknown** **fields** **for** **round** **trip**.', breaks: '**Removing** **fields** **reusing** **numbers** **corrupts** **data**.', fix: '**Reserve** **numbers**; **never** **reuse**.', angle: 'Mention **proto** **lint** **rules**.', fq1q: 'JSON **interop**?', fq1a: '**Proto** **JSON** **mapping** **differs** from **wire**—test **both**.', fq2q: 'CI **tooling**?', fq2a: '**buf** **breaking** **against** **main** **branch** **image**.' } },
  { question: '**Trade-off:** **gRPC** **streaming** vs **Kafka** for **audit** **events**.', signals: ['durability', 'ordering', 'ops', 'scale'], core: { root: '**Streams** **lack** **durable** **replay** **unless** **built** **in**.', breaks: '**Consumer** **offline** **loses** **events**.', fix: '**Kafka** **for** **log**; **gRPC** **stream** **for** **live** **tap** **only**.', angle: 'Map **RPO**/**RTO** **needs**.', fq1q: 'Hybrid?', fq1a: '**Stream** **pointer** **backed** by **log** **offset**.', fq2q: 'Ops **cost**?', fq2a: '**Kafka** **clusters** **vs** **managed** **mesh** **observability**.' } },
  { question: '**Gotcha:** **GraphQL** **returns** **200** with **`errors`** **but** **mobile** **crashes** parsing **`data`**.', signals: ['partial', 'null', 'client', 'contract'], core: { root: '**Partial** **success** **with** **null** **branches** **not** **handled**.', breaks: '**NPE** on **assumed** **non-null**.', fix: '**Client** **defensive** **parsing**; **server** **document** **error** **policy**.', angle: 'Contrast **REST** **4xx** **clarity**.', fq1q: 'Server **fix**?', fq1a: '**Avoid** **partial** **mutations** **without** **transaction** **boundary**.', fq2q: 'Testing?', fq2a: '**Contract** tests with **forced** **resolver** **errors**.' } },
  { question: '**Senior:** **Federation** **governance** across **30** **teams**.', signals: ['schema', 'review', 'CI', 'ownership'], core: { root: '**Ad-hoc** **schema** **changes** **break** **supergraph**.', breaks: '**Friday** **deploy** **outages**.', fix: '**Rover** **checks**, **schema** **review** **board**, **SLA** **for** **approvals**.', angle: '**Ownership** **matrix** **per** **type**.', fq1q: 'Metrics?', fq1a: '**Composition** **error** **rate** **near** **zero**.', fq2q: 'Escalation?', fq2a: '**Architecture** **council** **for** **shared** **types**.' } },
  { question: '**Security:** **GraphQL** **introspection** **leaks** **admin** **mutations**.', signals: ['introspection', 'authz', 'exposure', 'prod'], core: { root: '**Public** **schema** **reveals** **attack** **surface**.', breaks: '**Automated** **abuse** **scripts**.', fix: '**Disable** **or** **role-gate** **introspection**; **field** **authz**.', angle: '**OWASP** **GraphQL** **guidance**.', fq1q: 'Detect?', fq1a: '**WAF** **signatures** for **`__schema`** **queries**.', fq2q: 'Safer **dev** **UX**?', fq2a: '**Separate** **dev** **endpoint** **with** **auth**.' } },
  { question: '**Scale:** **Supergraph** **query** **plan** **fans** **out** **50** **subgraphs**.', signals: ['fanout', 'latency', 'gateway', 'cost'], core: { root: '**Over** **granular** **types** **explode** **plan** **complexity**.', breaks: '**Gateway** **CPU** **OOM**.', fix: '**Merge** **hot** **paths**, **cache** **entities**, **limit** **parallelism**.', angle: '**Query** **plan** **metrics**.', fq1q: 'SLO?', fq1a: '**p99** **gateway** **plan** **time** **budget**.', fq2q: 'Architecture?', fq2a: '**BFF** **per** **domain** **instead** of **one** **god** **graph**.' } },
  { question: '**Misconception:** "**gRPC** **always** **faster** therefore **use** **everywhere**."', signals: ['edge', 'cache', 'debug', 'human'], core: { root: '**Edge** **constraints** and **human** **debuggability** **matter**.', breaks: '**Partner** **integration** **cost** **explodes**.', fix: '**REST** **at** **edge**, **gRPC** **internal**.', angle: 'Measure **end-to-end** not **microbench**.', fq1q: 'Counterexample?', fq1a: '**Highly** **cachable** **GET** **JSON** **beats** **grpc** **for** **CDN** **hits**.', fq2q: 'When **grpc** **wins**?', fq2a: '**High** **QPS** **tight** **coupled** **services** **with** **streaming** **needs**.' } },
];

export const drill54 = {
  day: 54,
  title: 'gRPC & GraphQL',
  phaseId: 'phase6',
  tags: ['gRPC', 'GraphQL', 'protobuf', 'federation', 'DataLoader', 'HTTP/2', 'schema', 'gateway'],
  scenarios: drillSeeds.map((s, i) => scenarioDrillItem(54, i + 1, s.question, s.signals, s.core)),
};

export default {
  day: 54,
  title: 'gRPC & GraphQL',
  tags: ['Mid-Level', 'Advanced', 'Phase 6', 'Interview Prep', 'Satyverse(Satyam Parmar)', 'gRPC', 'GraphQL'],
  prerequisites: ['Day 53', 'Day 52'],
  learningObjectives: [
    'Contrast **gRPC** **protobuf** contracts with **REST** **JSON** for **edge** vs **internal** traffic',
    'Explain **GraphQL** **N+1** and how **DataLoader** **batching** protects **database** **capacity**',
    'Describe **schema** **evolution** for **protobuf** **field** **numbers** and **GraphQL** **deprecations**',
    'Compare **GraphQL** **federation** **governance** with **monolithic** **schema** **ownership**',
    'Map **gRPC** **deadlines** and **status** **codes** to **client** **retry** **policies**',
    'Choose **protocols** using **latency**, **tooling**, **security**, and **team** **boundary** **criteria**',
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
