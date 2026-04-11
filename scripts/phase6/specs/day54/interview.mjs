export default {
  "conceptual": [
    {
      "question": "What is **gRPC** and why use **HTTP/2** with **protobuf**?",
      "answer": "**gRPC** is a **RPC** framework using **protobuf** **IDL** for **compact** **binary** contracts and **HTTP/2** **multiplexing**. Teams pick it for **low** **latency** **internal** **east-west** traffic where **browser** **compatibility** is not required. For **gateway** and **service** stacks, emphasize **timeout** ordering (**outer > inner**), **bulkheads** per **tenant**, and **JWT** **cache** **TTL** during **issuer** rotations."
    },
    {
      "question": "How does **GraphQL** differ from **REST** for **mobile** clients?",
      "answer": "**GraphQL** lets clients **fetch** **exact** **field** **graphs** in **one** **round** **trip**, reducing **over-fetching**. The **server** must **protect** against **deep** **queries** and **N+1** **resolver** **issues**. Reference **security**: **mTLS** **service** identity, **OAuth2** **scopes**, **audit** logs at **edge**, and why **secrets** never belong in **Feign** **URL** query strings."
    },
    {
      "question": "What is the **GraphQL N+1** problem?",
      "answer": "Each **parent** **object** **resolver** may **trigger** **per-row** **database** **queries** without **batching**. **DataLoader** **batches** and **caches** within a **request** scope to collapse **queries**. Explain **second-order** effects: **retry** amplification, **queue** growth, **thread** **pool** exhaustion, and **cost** of extra **hops** when **edge** dependencies like **Redis** rate-limit stores fail."
    },
    {
      "question": "Explain **protobuf** **schema** **evolution** rules.",
      "answer": "Add **optional** **fields** with **new** **numbers**; never **reuse** **field** **numbers**; **unknown** **fields** are **preserved** in **binary** **wire** format. **Breaking** changes require **careful** **versioning** or **dual** **services**. Call out **ownership**: **platform** **SRE** for **mesh**/**certs**, **service** teams for **timeout** policy, **SRE** for **SLO** **burn** **alerts**—and how those teams **coordinate** during **sev-1** calls."
    },
    {
      "question": "When is **REST** still better at the **public** **edge**?",
      "answer": "**REST** **JSON** is **easy** for **browsers**, **CDNs**, and **caching** **semantics** **everyone** **understands**. **gRPC** typically needs **grpc-web** and **gateways** for **public** **internet** **clients**. Tie answers to **Spring** reality: **Feign** + **LoadBalancer**, **WebClient** + **`ExchangeFilterFunction`**, **Resilience4j** registries, and **Micrometer** tags that make **on-call** searches fast. Explain **second-order** effects: **retry** amplification, **queue** growth, **thread** **pool** exhaustion, and **cost** of extra **hops** when **edge** dependencies like **Redis** rate-limit stores fail."
    },
    {
      "question": "What are **gRPC** **streaming** modes?",
      "answer": "**Unary**, **server** **streaming**, **client** **streaming**, and **bidirectional** **streams** map to **protobuf** **RPC** **definitions**. Pick **streams** for **long-lived** **feeds**; keep **unary** for **request/response** **CRUD**. Close with **prevention**: **contract** tests for **clients**, **SLO** alerts on **client-side** **error** rates, **game** days that **kill** **pods** during **business** hours in **staging**, and **lint** rules banning **blocking** calls on **reactor** threads."
    },
    {
      "question": "How do **GraphQL** **errors** differ from **REST**?",
      "answer": "**GraphQL** may return **200** **HTTP** with **`errors`** **array** alongside **`data`** **partials**—clients must **inspect** **both**. **REST** usually maps **status** **codes** directly. Communicate **executive**-friendly **impact**: **customer** **minutes** degraded, **error** **budget** burn, **mitigation** **ETA**, and **post-incident** **themes** mapped to **roadmap** work. Reference **security**: **mTLS** **service** identity, **OAuth2** **scopes**, **audit** logs at **edge**, and why **secrets** never belong in **Feign** **URL** query strings."
    },
    {
      "question": "What is **schema** **stitching** / **federation**?",
      "answer": "**Federation** lets **multiple** **services** **own** **types** in **one** **supergraph** **gateway** that **plans** **queries** across **subgraphs**. **Governance** of **schema** **changes** becomes **critical**. Mention **verification**: **`curl -v`** through **gateway**, **`kubectl logs`**, **APM** **waterfall** **spans**, and **dashboards** that slice **p99** by **downstream** **service** **name**. Senior answers separate **symptom** from **root** **cause**: **502** at **edge** can be **empty** **Endpoints**, **stale** **pool**, or **upstream** **panic**—each needs different **first** **commands**."
    },
    {
      "question": "What **security** concerns affect **GraphQL** **public** APIs?",
      "answer": "**Introspection** **leaks** **schema** **details**; **complexity** **limits** and **depth** **limits** stop **DoS**; **rate** **limit** by **query** **cost** not just **HTTP** **QPS**. Communicate **executive**-friendly **impact**: **customer** **minutes** degraded, **error** **budget** burn, **mitigation** **ETA**, and **post-incident** **themes** mapped to **roadmap** work. Reference **security**: **mTLS** **service** identity, **OAuth2** **scopes**, **audit** logs at **edge**, and why **secrets** never belong in **Feign** **URL** query strings."
    },
    {
      "question": "How does **gRPC** **status** model work?",
      "answer": "**`io.grpc.Status`** carries **canonical** **codes** plus **details** **protobufs** for **rich** **errors**. Map them **consistently** to **client** **exceptions**. Communicate **executive**-friendly **impact**: **customer** **minutes** degraded, **error** **budget** burn, **mitigation** **ETA**, and **post-incident** **themes** mapped to **roadmap** work. Reference **security**: **mTLS** **service** identity, **OAuth2** **scopes**, **audit** logs at **edge**, and why **secrets** never belong in **Feign** **URL** query strings."
    },
    {
      "question": "What tooling generates **Java** from **protobuf**?",
      "answer": "**protoc** with **grpc-java** **plugin** emits **stubs** and **service** **base** **classes**. **Gradle** **plugins** integrate **codegen** into **CI**. Contrast **happy** **path** docs with **partition** behavior: **split** **retries**, **half-open** **probes**, **degraded** **read** modes, and **idempotency** keys that prevent **duplicate** **writes**. Mention **verification**: **`curl -v`** through **gateway**, **`kubectl logs`**, **APM** **waterfall** **spans**, and **dashboards** that slice **p99** by **downstream** **service** **name**."
    },
    {
      "question": "Compare **GraphQL** **subscriptions** to **Kafka** **events**.",
      "answer": "**Subscriptions** suit **push** **updates** to **clients** over **WebSocket**; **Kafka** suits **durable** **event** **backbones** between **services**. **Hybrid** patterns **bridge** **both**. Contrast **happy** **path** docs with **partition** behavior: **split** **retries**, **half-open** **probes**, **degraded** **read** modes, and **idempotency** keys that prevent **duplicate** **writes**. Mention **verification**: **`curl -v`** through **gateway**, **`kubectl logs`**, **APM** **waterfall** **spans**, and **dashboards** that slice **p99** by **downstream** **service** **name**."
    },
    {
      "question": "What is **grpc-gateway** / **gRPC-Gateway** pattern?",
      "answer": "It **translates** **REST** **JSON** **HTTP** to **gRPC** **backend** calls so **legacy** **clients** integrate without **native** **gRPC**. Tie answers to **Spring** reality: **Feign** + **LoadBalancer**, **WebClient** + **`ExchangeFilterFunction`**, **Resilience4j** registries, and **Micrometer** tags that make **on-call** searches fast. Explain **second-order** effects: **retry** amplification, **queue** growth, **thread** **pool** exhaustion, and **cost** of extra **hops** when **edge** dependencies like **Redis** rate-limit stores fail."
    },
    {
      "question": "How do you **version** **GraphQL** **schemas** safely?",
      "answer": "**Deprecation** **directives**, **additive** **fields**, **consumer** **tests** for **breaking** **selection** **sets**, and **federated** **composition** **checks** in **CI**. When **Kubernetes** is involved, cite **readiness**, **HPA**, **NetworkPolicy**, and **Service** **DNS** as factors that change **latency** independent of **Java** **code**. For **gateway** and **service** stacks, emphasize **timeout** ordering (**outer > inner**), **bulkheads** per **tenant**, and **JWT** **cache** **TTL** during **issuer** rotations."
    },
    {
      "question": "What **observability** hooks matter for **gRPC**?",
      "answer": "**OpenTelemetry** **grpc** **instrumentation**, **per-method** **latency** **histograms**, and **message** **size** **metrics** help **debug** **binary** **protocols**. Tie answers to **Spring** reality: **Feign** + **LoadBalancer**, **WebClient** + **`ExchangeFilterFunction`**, **Resilience4j** registries, and **Micrometer** tags that make **on-call** searches fast. Explain **second-order** effects: **retry** amplification, **queue** growth, **thread** **pool** exhaustion, and **cost** of extra **hops** when **edge** dependencies like **Redis** rate-limit stores fail."
    },
    {
      "question": "When is **gRPC** a better default than REST between internal services?",
      "answer": "Strong **typing** with Protobuf, **efficient** binary framing, **streaming** (client/server/bidi), and good code generation for many languages. Trade-offs: harder browser consumption, need for **proto evolution** discipline, and L7 proxies must understand HTTP/2 features."
    },
    {
      "question": "What is the **N+1** problem in GraphQL, and how do teams mitigate it?",
      "answer": "One GraphQL query can trigger many resolver round-trips to the DB. Mitigate with **DataLoader** batching, **query cost** limits, **persisted queries** for public APIs, and depth/complexity analysis. Monitor field-level resolver latency."
    }
  ],
  "codeBased": [
    {
      "question": "**protobuf** service definition sketch",
      "answer": "// service Payments { rpc Charge(ChargeRequest) returns (ChargeReply); }\n// message ChargeRequest { string idempotency_key = 1; int64 amount_cents = 2; }"
    },
    {
      "question": "**GraphQL** schema type + query",
      "answer": "// type Order { id: ID! lines: [Line!]! }\n// query { order(id: \"1\") { lines { sku qty } } }"
    },
    {
      "question": "**Spring** **grpc** server stub override (conceptual)",
      "answer": "// @GrpcService\n// public class PayGrpc extends PaymentsGrpc.PaymentsImplBase { ... }"
    },
    {
      "question": "**DataLoader** pattern (pseudo)",
      "answer": "// loadMany(keys) -> batch load from DB where id in keys"
    },
    {
      "question": "**GraphQL** complexity directive",
      "answer": "// directive @cost(value: Int!) on FIELD_DEFINITION"
    },
    {
      "question": "**gRPC** **deadline** propagation",
      "answer": "// Metadata deadlines; ClientCall with deadline after duration"
    },
    {
      "question": "**grpcurl** one-liner comment",
      "answer": "// grpcurl -plaintext localhost:9090 list"
    },
    {
      "question": "**Apollo** / **Federation** `@key` directive",
      "answer": "// extend type Order @key(fields: \"id\") { id: ID! @external }"
    },
    {
      "question": "**GraphQL** mutation idempotency",
      "answer": "// mutation with Idempotency-Key HTTP header at gateway"
    },
    {
      "question": "**protobuf** **oneof** for polymorphism",
      "answer": "// oneof payload { Card card = 3; Wallet wallet = 4; }"
    },
    {
      "question": "How do you evolve a **protobuf** field without breaking old clients?",
      "answer": "Add new fields with **new field numbers**; never reuse numbers. Optional new fields are backward compatible if unknown fields are ignored. Avoid changing wire types. Use **oneof** carefully; deprecate with `reserved` when removing fields after a migration window."
    },
    {
      "question": "Name one **GraphQL** risk specific to **public** APIs vs internal.",
      "answer": "**Query complexity attacks** — arbitrary deep queries can DoS your server. Use max depth, pagination on lists, timeouts, and authenticated persisted queries. Internal APIs still need batching but trust boundaries differ."
    }
  ],
  "seniorScenario": [
    {
      "question": "**Production:** **GraphQL** **gateway** **CPU** **spikes** on **single** **query** **pattern**.",
      "answer": "**(1) Immediate response** Throttle **traffic**, capture **query** **text** **hash**.\n\n**(2) Root cause** **Unbounded** **resolver** **depth** or **missing** **DataLoader** **batching**.\n\n**(3) Fix** 1) Add **complexity** **limits**. 2) **Batch** **DB** **access**. 3) **Cache** **hot** **entities**.\n\n**(4) Prevention** **CI** **performance** **budget** per **query** **pattern**. Tie answers to **Spring** reality: **Feign** + **LoadBalancer**, **WebClient** + **`ExchangeFilterFunction`**, **Resilience4j** registries, and **Micrometer** tags that make **on-call** searches fast. Explain **second-order** effects: **retry** amplification, **queue** growth, **thread** **pool** exhaustion, and **cost** of extra **hops** when **edge** dependencies like **Redis** rate-limit stores fail. Close with **prevention**: **contract** tests for **clients**, **SLO** alerts on **client-side** **error** rates, **game** days that **kill** **pods** during **business** hours in **staging**, and **lint** rules banning **blocking** calls on **reactor** threads. When **Kubernetes** is involved, cite **readiness**, **HPA**, **NetworkPolicy**, and **Service** **DNS** as factors that change **latency** independent of **Java** **code**. For **gateway** and **service** stacks, emphasize **timeout** ordering (**outer > inner**), **bulkheads** per **tenant**, and **JWT** **cache** **TTL** during **issuer** rotations."
    },
    {
      "question": "**Design:** **Partner** wants **gRPC** **directly** from **browser**.",
      "answer": "**(1) Immediate response** Offer **REST** **BFF** or **grpc-web** **with** **Envoy**.\n\n**(2) Root cause** Browsers **lack** **native** **HTTP/2** **trailers** **support** needed for **pure** **gRPC**.\n\n**(3) Fix** Deploy **gateway** **transcoding**; **document** **limits**.\n\n**(4) Prevention** **ADR** **per** **edge** **protocol** **choice**. For **gateway** and **service** stacks, emphasize **timeout** ordering (**outer > inner**), **bulkheads** per **tenant**, and **JWT** **cache** **TTL** during **issuer** rotations. Communicate **executive**-friendly **impact**: **customer** **minutes** degraded, **error** **budget** burn, **mitigation** **ETA**, and **post-incident** **themes** mapped to **roadmap** work. Reference **security**: **mTLS** **service** identity, **OAuth2** **scopes**, **audit** logs at **edge**, and why **secrets** never belong in **Feign** **URL** query strings. Contrast **happy** **path** docs with **partition** behavior: **split** **retries**, **half-open** **probes**, **degraded** **read** modes, and **idempotency** keys that prevent **duplicate** **writes**. Mention **verification**: **`curl -v`** through **gateway**, **`kubectl logs`**, **APM** **waterfall** **spans**, and **dashboards** that slice **p99** by **downstream** **service** **name**. Senior answers separate **symptom** from **root** **cause**: **502** at **edge** can be **empty** **Endpoints**, **stale** **pool**, or **upstream** **panic**—each needs different **first** **commands**."
    },
    {
      "question": "**Migration:** **Monolith** **REST** to **gRPC** **internal** **mesh**.",
      "answer": "**(1) Immediate response** **Strangler** **per** **bounded** **context**.\n\n**(2) Root cause** **Dual** **write** **compatibility** and **schema** **skew**.\n\n**(3) Fix** Run **side-by-side** **services**; **feature** **flag** **clients**.\n\n**(4) Prevention** **Contract** **tests** on **protobuf** **compat** **matrix**. For **gateway** and **service** stacks, emphasize **timeout** ordering (**outer > inner**), **bulkheads** per **tenant**, and **JWT** **cache** **TTL** during **issuer** rotations. Communicate **executive**-friendly **impact**: **customer** **minutes** degraded, **error** **budget** burn, **mitigation** **ETA**, and **post-incident** **themes** mapped to **roadmap** work. Reference **security**: **mTLS** **service** identity, **OAuth2** **scopes**, **audit** logs at **edge**, and why **secrets** never belong in **Feign** **URL** query strings. Contrast **happy** **path** docs with **partition** behavior: **split** **retries**, **half-open** **probes**, **degraded** **read** modes, and **idempotency** keys that prevent **duplicate** **writes**. Mention **verification**: **`curl -v`** through **gateway**, **`kubectl logs`**, **APM** **waterfall** **spans**, and **dashboards** that slice **p99** by **downstream** **service** **name**. Senior answers separate **symptom** from **root** **cause**: **502** at **edge** can be **empty** **Endpoints**, **stale** **pool**, or **upstream** **panic**—each needs different **first** **commands**."
    },
    {
      "question": "**Incident:** **protobuf** **breaking** **change** **shipped** **accidentally**.",
      "answer": "**(1) Immediate response** **Rollback** **client** **libraries** **first**.\n\n**(2) Root cause** **Field** **number** **reuse** or **wrong** **wire** **type**.\n\n**(3) Fix** Add **buf** **breaking** **checks** in **CI**; **hotfix** **server** **to** **accept** **both**.\n\n**(4) Prevention** **Buf** / **protolock** **mandatory** on **main**. Reference **security**: **mTLS** **service** identity, **OAuth2** **scopes**, **audit** logs at **edge**, and why **secrets** never belong in **Feign** **URL** query strings. Contrast **happy** **path** docs with **partition** behavior: **split** **retries**, **half-open** **probes**, **degraded** **read** modes, and **idempotency** keys that prevent **duplicate** **writes**. Mention **verification**: **`curl -v`** through **gateway**, **`kubectl logs`**, **APM** **waterfall** **spans**, and **dashboards** that slice **p99** by **downstream** **service** **name**. Senior answers separate **symptom** from **root** **cause**: **502** at **edge** can be **empty** **Endpoints**, **stale** **pool**, or **upstream** **panic**—each needs different **first** **commands**. Call out **ownership**: **platform** **SRE** for **mesh**/**certs**, **service** teams for **timeout** policy, **SRE** for **SLO** **burn** **alerts**—and how those teams **coordinate** during **sev-1** calls. Interviewers reward naming **metrics** (`http_client_requests_seconds`, `resilience4j_circuitbreaker_state`), **trace** correlation IDs, and **rollback** criteria rather than hand-wavy resilience claims."
    },
    {
      "question": "**Scale:** **Federated** **GraphQL** **composition** **errors** in **deploy**.",
      "answer": "**(1) Immediate response** Block **deploy**; **rollback** **subgraph**.\n\n**(2) Root cause** **Type** **mismatch** across **subgraphs**.\n\n**(3) Fix** Run **`rover subgraph check`** in **CI**.\n\n**(4) Prevention** **Schema** **registry** **with** **approval** **workflow**. Close with **prevention**: **contract** tests for **clients**, **SLO** alerts on **client-side** **error** rates, **game** days that **kill** **pods** during **business** hours in **staging**, and **lint** rules banning **blocking** calls on **reactor** threads. When **Kubernetes** is involved, cite **readiness**, **HPA**, **NetworkPolicy**, and **Service** **DNS** as factors that change **latency** independent of **Java** **code**. For **gateway** and **service** stacks, emphasize **timeout** ordering (**outer > inner**), **bulkheads** per **tenant**, and **JWT** **cache** **TTL** during **issuer** rotations. Communicate **executive**-friendly **impact**: **customer** **minutes** degraded, **error** **budget** burn, **mitigation** **ETA**, and **post-incident** **themes** mapped to **roadmap** work. Reference **security**: **mTLS** **service** identity, **OAuth2** **scopes**, **audit** logs at **edge**, and why **secrets** never belong in **Feign** **URL** query strings. Contrast **happy** **path** docs with **partition** behavior: **split** **retries**, **half-open** **probes**, **degraded** **read** modes, and **idempotency** keys that prevent **duplicate** **writes**."
    },
    {
      "question": "**Security:** **GraphQL** **introspection** **enabled** in **prod**.",
      "answer": "**(1) Immediate response** Disable or **auth-gate** **introspection**.\n\n**(2) Root cause** Attackers **map** **mutations** for **abuse**.\n\n**(3) Fix** Use **allowlist** **plugins**; **complexity** **limits**.\n\n**(4) Prevention** **Pen** **test** **quarterly** on **public** **GraphQL**. Reference **security**: **mTLS** **service** identity, **OAuth2** **scopes**, **audit** logs at **edge**, and why **secrets** never belong in **Feign** **URL** query strings. Contrast **happy** **path** docs with **partition** behavior: **split** **retries**, **half-open** **probes**, **degraded** **read** modes, and **idempotency** keys that prevent **duplicate** **writes**. Mention **verification**: **`curl -v`** through **gateway**, **`kubectl logs`**, **APM** **waterfall** **spans**, and **dashboards** that slice **p99** by **downstream** **service** **name**. Senior answers separate **symptom** from **root** **cause**: **502** at **edge** can be **empty** **Endpoints**, **stale** **pool**, or **upstream** **panic**—each needs different **first** **commands**. Call out **ownership**: **platform** **SRE** for **mesh**/**certs**, **service** teams for **timeout** policy, **SRE** for **SLO** **burn** **alerts**—and how those teams **coordinate** during **sev-1** calls. Interviewers reward naming **metrics** (`http_client_requests_seconds`, `resilience4j_circuitbreaker_state`), **trace** correlation IDs, and **rollback** criteria rather than hand-wavy resilience claims."
    }
  ],
  "wrongAnswers": [
    "**GraphQL** always prevents **over-fetching** without trade-offs — **Correction:** **Resolvers** can still **hit** **DB** **heavily** if **poorly** **designed**.",
    "**gRPC** is **human** **debuggable** with **curl** alone — **Correction:** You need **grpcurl** or **proxies**; **binary** **payloads** are **opaque**.",
    "**Protobuf** **requires** **JSON** **for** **compatibility** — **Correction:** **JSON** **mapping** exists but **wire** format is **binary**.",
    "**GraphQL** **subscriptions** **replace** **Kafka** — **Correction:** Different **durability** and **fan-out** **semantics**.",
    "**HTTP/2** **alone** means **gRPC** — **Correction:** **gRPC** adds **framing** and **contracts** atop **HTTP/2**.",
    "**Federation** **removes** **need** for **domain** **ownership** — **Correction:** **Governance** becomes **harder** not **easier**.",
    "**gRPC** **streaming** **always** **simpler** than **REST** — **Correction:** **Backpressure** and **cancellation** **complexity** **increases**.",
    "**GraphQL** **errors** always map to **4xx** **HTTP** — **Correction:** Often **200** with **`errors`** **payload**."
  ]
};
