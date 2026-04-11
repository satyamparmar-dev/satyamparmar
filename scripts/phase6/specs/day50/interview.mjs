export default {
  "conceptual": [
    {
      "question": "What is OpenAPI 3.x and how does it relate to Swagger?",
      "answer": "**OpenAPI** is the **machine-readable contract** (YAML/JSON) describing paths, operations, schemas, and security. **Swagger** was the original name of the ecosystem; today **Swagger UI** is a renderer, while tools like **springdoc-openapi** **emit** OpenAPI from Spring code. In interviews, clarify that **the spec is the API product** for consumers and automation — not just pretty docs. **Production consequence:** without a spec, gateways cannot validate shapes, SDK generation is ad hoc, and partner onboarding drags."
    },
    {
      "question": "What is code-first vs contract-first API design?",
      "answer": "**Code-first** makes Java controllers/DTOs authoritative; **springdoc** scans annotations and publishes `/v3/api-docs`. **Contract-first** stores `openapi.yaml` in git and uses **openapi-generator** to create interfaces that teams implement. **Code-first** optimises delivery speed inside a Spring monolith; **contract-first** optimises **multi-language consumers** and explicit review of every field. **Why it matters:** the failure mode of code-first is **annotation rot** — the spec becomes incomplete unless CI enforces it."
    },
    {
      "question": "What is springdoc-openapi and how does it differ from Springfox?",
      "answer": "**springdoc-openapi** is the modern **Spring Boot 3 / Jakarta** integration that natively targets **OpenAPI 3** and uses runtime introspection of controllers. **Springfox** historically supported older Spring and Swagger 2; most new projects choose **springdoc** for maintenance and compatibility. In production, you standardise on one starter (**webmvc-ui** vs **webflux-ui**) and pin versions with your **Spring Boot BOM**. **Interview tip:** mention **`GroupedOpenApi`** for splitting internal vs partner surfaces."
    },
    {
      "question": "How do you detect breaking changes in an OpenAPI spec?",
      "answer": "Use a **structural diff** tuned for compatibility: removing properties, adding **required** fields, changing types, narrowing enums, or tightening security are **breaking**. Tools like **openapi-diff**, **Optic**, or **Bump.sh** encode these rules; add **Spectral** for style. **Why:** human YAML review misses the same rename that breaks **TypeScript** clients. **Java angle:** fail the build before merge, attach the diff to the PR, and require a **semver major** label when breaking."
    },
    {
      "question": "What is Spectral and what kinds of rules do teams enforce?",
      "answer": "**Spectral** is an **OpenAPI/AsyncAPI linter** with customisable rules: require **`operationId`**, forbid anonymous objects without `$ref`, enforce `info.contact`, require documented **error responses**, cap pagination sizes, or ban internal hostnames. **Why:** consistent specs make **gateway policies** and **SDK generation** predictable. **Production consequence:** lint rules stop **one-off** `5xx`-only documents that teach clients the wrong retry behaviour."
    },
    {
      "question": "What is OpenAPI Generator and when do you regenerate clients?",
      "answer": "**OpenAPI Generator** turns a spec into **Java**, Kotlin, TypeScript, and other clients or server stubs. Regenerate on every **intentional** spec change in the same PR, pin the **generator version**, and commit or publish artefacts from CI. **Why:** floating versions cause non-reproducible diffs. **Senior point:** separate **human-facing changelog** from **machine semver** for the SDK package."
    },
    {
      "question": "How should error responses be documented in OpenAPI?",
      "answer": "Declare **`4xx`/`5xx`** on each operation with **`content.application/problem+json`** referencing a shared **Problem Details** component (`type`, `title`, `status`, `detail`, `instance`). **Why:** clients and **Observability** pipelines classify failures consistently. **Spring 6** maps exceptions to **`ProblemDetail`** — mirror that in OAS so docs match runtime. **Anti-pattern:** documenting only `200` forces integrators to guess failure shapes."
    },
    {
      "question": "What is `operationId` and why must it be stable?",
      "answer": "**`operationId`** uniquely names an operation for codegen (`getOrder`, `createOrder`). Generators map it to **method names**; renaming breaks **Feign** interfaces and mobile SDKs even when URLs stay the same. **Rule:** treat `operationId` like a **public Java method** — change only with a **major** SDK bump or alias strategy. **Interview angle:** connect to **API review checklist**."
    },
    {
      "question": "How do you document pagination and filtering in OpenAPI?",
      "answer": "Use **`parameters`** with explicit `name`, `in=query`, `schema`, `description`, and **`example`** values: `cursor`, `limit`, `sort`. State **max** limits in description or `maximum` on schema. **Why:** undocumented pagination invites **unbounded queries** that torch the database. Tie docs to actual **controller** validation (`@Max(100)`). **Senior:** document **keyset** semantics — opaque cursor, stable sort."
    },
    {
      "question": "What are `tags` and `servers` used for in real projects?",
      "answer": "**`tags`** group operations in **Swagger UI** navigation — align with **bounded contexts** (`Orders`, `Payments`). **`servers`** list base URLs per environment (dev/stage/prod) so Try-it-out targets the right place. **Why:** wrong `servers` sends QA traffic to prod. **Production:** some teams strip prod `servers` from **public** bundles and inject them at publish time."
    },
    {
      "question": "What is discriminator + oneOf used for?",
      "answer": "They model **polymorphic** payloads — e.g. `Notification` with `type` discriminating `EmailNotification` vs `SmsNotification`. **`discriminator.propertyName`** tells codegen which subtype to instantiate. **Trade-off:** polymorphism complicates **JSON Schema** validation and client code; use sparingly. **Interview:** mention **backward compatibility** when adding subtypes."
    },
    {
      "question": "How do you version an API represented in OpenAPI?",
      "answer": "Express the same **versioning strategy** as runtime: **URL prefix** `/v2`, **header** vendor media type, or separate **documents** per version. In OAS, duplicate paths or use **multiple files** merged in CI. **Why:** the spec must not claim `/v1` fields while the server actually serves `/v2`. **Senior:** add **`deprecated: true`** on old operations with linked migration guide in `description`."
    },
    {
      "question": "What security schemes belong in OpenAPI for Spring apps?",
      "answer": "Declare **`bearerAuth`** (HTTP bearer JWT), **`oauth2`** flows, or **mutual TLS** metadata under **`components.securitySchemes`**, then **`security`** globally or per operation. **Why:** documentation portals and **API gateways** reuse the same model. **Critical:** documenting auth does **not** implement it — **Spring Security** + gateway must still enforce. **Interview:** call out **scopes** per operation."
    },
    {
      "question": "How do consumer-driven contracts relate to OpenAPI?",
      "answer": "**Pact** captures **examples** of what a consumer actually needs; provider verification ensures the running service matches. **OpenAPI** is the **broad contract**; **Pact** is the **evidence** that critical consumers are safe. **Why:** OAS might allow optional fields consumers never send; Pact fails when you remove a field a mobile app reads. **Senior:** run **Pact** in provider CI alongside **openapi-diff**."
    },
    {
      "question": "What is the difference between `example` and `examples` in OAS?",
      "answer": "**`example`** is a single inline sample; **`examples`** is a map of named examples (per media type) useful when multiple valid shapes exist (success vs edge). **Why:** support and QA reproduce bugs faster with **copy-paste** payloads. **Springdoc** can pull examples from **`@Schema(example=...)`**. **Production:** keep examples **synthetic** — never real PII or tokens."
    },
    {
      "question": "What makes an OpenAPI change **breaking** vs **additive** for JSON responses?",
      "answer": "**Breaking**: removing fields, renaming fields, tightening required arrays, changing a field's type, or narrowing enum values. **Additive**: new optional fields, new endpoints, loosening validation (careful with security). CI should diff OpenAPI and fail on breaking changes unless the major version bumps."
    },
    {
      "question": "Why store an **OpenAPI baseline artifact per release** instead of only generating docs in Swagger UI?",
      "answer": "Partner and internal clients compile against a **frozen** contract. Baseline JSON/YAML in artifact storage lets pipelines diff PRs against `main`, run Spectral, and gate merges. Swagger UI is helpful but not a durable contract artifact."
    }
  ],
  "codeBased": [
    {
      "question": "Show springdoc Maven dependencies for Spring Boot 3 (WebMVC + Swagger UI).",
      "answer": "// pom.xml (conceptual coordinates — use BOM aligned with your Boot version)\n// <dependency>\n//   <groupId>org.springdoc</groupId>\n//   <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>\n//   <version>2.x.x</version>\n// </dependency>\n// Provides:\n//   /v3/api-docs        -> OpenAPI JSON\n//   /swagger-ui.html    -> redirects to Swagger UI\n//   /swagger-ui/index.html\n// Disable UI in prod:\n// springdoc.swagger-ui.enabled=false"
    },
    {
      "question": "Show `@Operation` and `@ApiResponse` on a GET controller method.",
      "answer": "// @RestController\n// @RequestMapping(\"/orders\")\n// @Tag(name = \"Orders\")\n// public class OrderController {\n//   @GetMapping(\"/{orderId}\")\n//   @Operation(operationId = \"getOrder\", summary = \"Fetch order by id\")\n//   @ApiResponse(responseCode = \"200\", description = \"Found\",\n//       content = @Content(schema = @Schema(implementation = Order.class)))\n//   @ApiResponse(responseCode = \"404\", description = \"Not found\",\n//       content = @Content(schema = @Schema(implementation = ProblemDetail.class)))\n//   public Order getOrder(@PathVariable String orderId) { ... }\n// }\n// Emitted OpenAPI includes documented 200/404 bodies for codegen."
    },
    {
      "question": "Show a `GroupedOpenApi` bean splitting internal vs public endpoints.",
      "answer": "// @Configuration\n// public class OpenApiGroups {\n//   @Bean\n//   public GroupedOpenApi publicApi() {\n//     return GroupedOpenApi.builder()\n//         .group(\"public\")\n//         .pathsToMatch(\"/public/**\")\n//         .build();\n//   }\n//   @Bean\n//   public GroupedOpenApi internalApi() {\n//     return GroupedOpenApi.builder()\n//         .group(\"internal\")\n//         .pathsToMatch(\"/internal/**\")\n//         .build();\n//   }\n// }\n// URLs:\n//   /v3/api-docs/public\n//   /v3/api-docs/internal\n// Publish only `public` bundle to partners."
    },
    {
      "question": "Show programmatic `OpenAPI` bean customisation with security scheme.",
      "answer": "// @Bean\n// public OpenAPI ordersOpenAPI() {\n//   return new OpenAPI()\n//       .info(new Info().title(\"Orders API\").version(\"1.2.0\"))\n//       .addServersItem(new Server().url(\"https://api.example.com\"))\n//       .components(new Components()\n//           .addSecuritySchemes(\"bearerAuth\",\n//               new SecurityScheme()\n//                   .type(SecurityScheme.Type.HTTP)\n//                   .scheme(\"bearer\")\n//                   .bearerFormat(\"JWT\")))\n//       .addSecurityItem(new SecurityRequirement().addList(\"bearerAuth\"));\n// }\n// Merges with springdoc scanning output for global security documentation."
    },
    {
      "question": "Show `@Schema` on a DTO field with description, example, and required mode.",
      "answer": "// public record Order(\n//     @Schema(description = \"Opaque order id\", example = \"ord-1001\", requiredMode = Schema.RequiredMode.REQUIRED)\n//     String orderId,\n//     @Schema(description = \"Lifecycle status\", allowableValues = {\"PENDING\",\"PAID\",\"CANCELLED\"})\n//     String status,\n//     @Schema(description = \"Total charged\", example = \"99.99\")\n//     BigDecimal total\n// ) {}\n// springdoc maps requiredMode -> OpenAPI `required` array on schema."
    },
    {
      "question": "Show WebMvcTest snapshot testing of `/v3/api-docs` (conceptual).",
      "answer": "// @WebMvcTest(controllers = OrderController.class)\n// @Import({SecurityConfig.class}) // if security filters apply\n// class OpenApiDocTest {\n//   @Autowired MockMvc mvc;\n//   @Test\n//   void openapiContainsGetOrder() throws Exception {\n//     mvc.perform(get(\"/v3/api-docs\"))\n//         .andExpect(status().isOk())\n//         .andExpect(jsonPath(\"$.paths['/orders/{orderId}'].get.operationId\")\n//             .value(\"getOrder\"));\n//   }\n// }\n// Extend with JSON file `equals` for full golden-master diff in CI."
    },
    {
      "question": "Show disabling Swagger UI in production using Spring profiles.",
      "answer": "// application-prod.yml\n// springdoc:\n//   swagger-ui:\n//     enabled: false\n//   api-docs:\n//     enabled: false   # also hide raw OpenAPI if policy requires\n//\n// Keep enabled in dev/stage behind VPN; expose docs portal via OAuth2 proxy."
    },
    {
      "question": "Show global exception handler returning `ProblemDetail` that appears in OAS.",
      "answer": "// @RestControllerAdvice\n// class ApiExceptionHandler {\n//   @ExceptionHandler(OrderNotFoundException.class)\n//   ProblemDetail notFound(OrderNotFoundException ex) {\n//     ProblemDetail pd = ProblemDetail.forStatusAndDetail(\n//         HttpStatus.NOT_FOUND, ex.getMessage());\n//     pd.setType(URI.create(\"https://api.example.com/problems/order-not-found\"));\n//     return pd;\n//   }\n// }\n// Document matching 404 response component in @ApiResponse on the controller."
    },
    {
      "question": "Show Feign client name aligning with documented server URL (conceptual).",
      "answer": "// @FeignClient(name = \"orders\", url = \"${orders.api.base-url}\")\n// public interface OrderClient {\n//   @GetMapping(\"/orders/{orderId}\")\n//   Order getOrder(@PathVariable(\"orderId\") String orderId);\n// }\n// Method name `getOrder` should stay aligned with stable `operationId`\n// when generating Feign from OpenAPI; otherwise regenerate interfaces."
    },
    {
      "question": "Show `RouterOperation` annotation for Spring WebFlux functional endpoints (springdoc).",
      "answer": "// @Bean\n// @RouterOperation(operationId = \"listOrders\", method = RequestMethod.GET,\n//     path = \"/orders\", beanClass = OrderHandler.class, beanMethod = \"list\")\n// public RouterFunction<ServerResponse> orderRoutes(OrderHandler h) {\n//   return route(GET(\"/orders\"), h::list);\n// }\n// Without @RouterOperation, springdoc may miss functional routes — explicit metadata fixes docs."
    },
    {
      "question": "In OpenAPI 3, how do you model **pagination** so both **offset** and **cursor** styles stay documented?",
      "answer": "Use **parameters** on the list operation: `limit`, `offset` or `cursor`, `page_size`. Document defaults, max limits, and stability guarantees (offset can skip/duplicate under concurrent writes; cursor is preferred at scale). Add examples in `examples` for each style your API supports."
    },
    {
      "question": "Your CI runs **Spectral**. Give one rule that catches a common OpenAPI footgun.",
      "answer": "Example: **`operation-operationId-unique`** — duplicate `operationId` values break code generators and gateway routing. Another: flag **unused schemas** so dead components do not mislead consumers. Tie rules to team style guide."
    }
  ],
  "seniorScenario": [
    {
      "question": "Swagger UI is reachable on the public internet for your staging cluster. Security files a P0. What do you do?",
      "answer": "**(1) Immediate response:** Treat this as **exposed attack surface**, not a documentation bug. Within hours, disable **Swagger UI** and raw **`/v3/api-docs`** on any **public ingress** (feature flag, gateway route removal, or emergency config push). Redirect legitimate testers to a **VPN-only** hostname or an **OAuth2-protected** developer portal. Force-rotate any **Bearer tokens** that may have been pasted into Try-it-out or captured in shared browser profiles. Page **SRE** and **security** with the exact URLs that were reachable and capture **access logs** for forensic review. **(2) Root cause:** **springdoc** defaults shipped on the same **Spring profile** as external traffic; no **defence in depth** at the edge; teams conflated \"we require auth on APIs\" with \"docs are harmless.\" Often **staging** mirrors **prod** config poorly, so internal-only annotations never landed. **(3) Fix:** **Network segmentation** first — docs on **management port**, internal **load balancer**, or separate **docs** microservice. Enforce **SSO** or **mTLS** for readers. In **application-prod.yml** (and **staging** if internet-facing), set **`springdoc.swagger-ui.enabled=false`** unless explicitly approved. Add **WAF** rules blocking anonymous **`/swagger-ui/**`** on public listeners. **(4) Prevention:** **Architecture decision record** for API documentation; **CI policy check** that fails if a public chart exposes docs paths; **scheduled ZAP** or **OWASP** baseline against staging; **on-call runbook** for \"docs exposure\" modeled after secret leak."
    },
    {
      "question": "A PR removes a response field; all unit tests pass but partners break. How do you harden the process?",
      "answer": "**(1) Immediate response:** **Rollback** the deploy or **forward-fix** by restoring the field (nullable or marked **deprecated** in OpenAPI) and issuing a **hotfix** SDK if you publish one. Send a **partner comms** note with timeline. Open a **blameless post-mortem** focused on why **HTTP 200** still flowed while **client parsers** failed — this class of bug evades naive **APM** error-rate alerts. **(2) Root cause:** **Code-first** teams changed a **Java record** or **DTO**; **unit tests** used **builders** that never asserted **JSON** shape; **OpenAPI** was not **diffed** against the **release** artifact, so the PR looked \"small.\" **Consumer** expectations were never encoded in **Pact** or **contract tests**. **(3) Fix:** On every PR, emit **`openapi.json`** and run **openapi-diff** (or vendor equivalent) against **`main`** baseline; fail on **breaking** without an explicit **`semver-major`** label and **changelog** entry. Add **provider verification** for top consumers. Store **immutable** spec per **git tag** in **artifact storage** for forensic diff. **(4) Prevention:** **API review** checklist: field removal needs **deprecation window** + **`Sunset`** header; **telemetry** on field usage via **analytics** or **access logs**; **platform** mandate that **mobile** and **billing** services are in the **Pact** registry."
    },
    {
      "question": "Your OpenAPI Generator upgrade reorders model properties and creates a massive noisy PR. How do you manage?",
      "answer": "**(1) Immediate response:** **Stop** the rolling upgrade — pin **`openapi-generator-maven-plugin`** (or Gradle) to the **previous working version** in the **parent BOM** so **CI** is green again. Create a **single intentional PR** titled \"Regenerate SDK @ generator X→Y\" with no hand-edits mixed in, so reviewers can trust the diff. If the noise blocks review, split **runtime service** changes from **generated client** publication. **(2) Root cause:** **Floating** plugin version (`2.latest`) or **BOM** drift; upstream **mustache** templates changed **property order** or **Jackson** annotations; Java **record** vs **class** output toggled. Without a **lockfile** for codegen, **reproducible builds** break. **(3) Fix:** **Pin** exact generator version; commit **`.openapi-generator-ignore`** for files teams customise; prefer **publishing the SDK** from a **dedicated pipeline** artifact rather than giant PRs into every service. Add **JSONassert** or **snapshot** tests that compare **parsed JSON** trees, ignoring key order where irrelevant. **(4) Prevention:** **Renovate/Dependabot** with **grouped** generator upgrades; **canary** regenerate on one **low-risk** client first; document **upgrade playbook**; enforce that **semantic compatibility** is validated by **tests**, not eyeballing **diff** line count."
    },
    {
      "question": "Platform asks for one Spectral ruleset for 40 teams. What rules do you standardise first?",
      "answer": "**(1) Immediate response:** Ship a **v1 ruleset** that fits on one page — **errors** only for rules that prevent **incidents** or **legal** exposure: every operation has **`operationId`**, **`info.contact`**, **`servers`** for non-prod, every **public** path documents **401/403/429** and a **`problem+json`** reference, and **securitySchemes** exist if **`security`** is declared. Defer **aesthetic** rules (description length, alphabetised tags) to **warnings** so teams adopt without mutiny. **(2) Root cause:** **Federated** teams each invented **YAML** style; no **CI** gate; **on-call** paid the price when **partners** integrated against **wrong base URLs** or **undocumented errors**. **(3) Fix:** Host **`spectral.yaml`** in a **platform** repo, version with **tags**, consume via **shared GitHub Action** or **Gradle** plugin. Allow **`extends`** for team-specific **warning** rules but not **error** overrides without **ADR**. Publish **HTML** reports on PRs. **(4) Prevention:** **Service scorecard** (docs lint green, Pact verify green); **quarterly** review of **ignored** rules; **training** for new hires on **why** `operationId` stability matters for **Java** **Feign** clients."
    },
    {
      "question": "Mobile wants sparse fieldsets; backend refuses new query params. Resolve using OpenAPI.",
      "answer": "**(1) Immediate response:** Schedule a **30-minute design** session with **mobile** and **platform** — pick one **backward-compatible** approach and document it in **OpenAPI** the same sprint. The fastest win is often a **`fields=`** sparse fieldset on **GET** reads (comma-separated **allowlist**), with **`schema`** + **examples** in the spec so **codegen** clients see the parameter. Prototype on **one** endpoint (`GET /products/{id}`) before mandating platform-wide. **(2) Root cause:** **Domain** teams own **rich** aggregates; **mobile** needs **thin** projections to save **battery** and **bandwidth**; **backend** fears **unbounded** complexity and **cache fragmentation**. Without a **written contract**, **ad-hoc** `?include=` params appear per team. **(3) Fix:** Implement **server-side** projection with a **strict allowlist** per resource (no arbitrary JSON paths). Mirror **validation** in **Spring** (`@Pattern` or custom **`HandlerMethodArgumentResolver`**) and in **Spectral** (`maxLength` on `fields`). If **multiple** clients need **incompatible** shapes, introduce a **BFF** and keep **core** OpenAPI **stable**. **(4) Prevention:** **Performance SLO** on **p95** payload size; **deprecate** fat responses only after **BFF** or **fieldsets** exist; **consumer** tests that fail if **unexpected** large payloads return."
    },
    {
      "question": "Gateway team wants OpenAPI to auto-configure rate limits. Feasible?",
      "answer": "**(1) Immediate response:** Say **yes, as a pipeline concern**, not as magic inside **springdoc**. Pick **one pilot service** and add **namespaced** extensions such as **`x-gateway-rate-limit`** (requests per second per **API key**) on selected operations. Build a **CI** step that reads the **bundled** OpenAPI and emits **Kong** declarative YAML or **Envoy** **ratelimit** config. Validate in **staging** under **load test** before **prod**. **(2) Root cause:** **Rate limits** lived only in **tickets** and **wiki**; **SRE** hand-edited **gateway** JSON; **docs** lied about **429** semantics; **OpenAPI** was never treated as **config input**. **(3) Fix:** **Single source of truth** in OAS; **Spectral** rule that every **public** `POST` documents **429** + **`Retry-After`**. **PR** must include **generated** gateway fragment diff. **Alert** when **deployed** limits diverge from **spec** hash. **(4) Prevention:** Treat **lowering** limits as **breaking** for **SLAs** — require **partner** notice; **version** the extension schema; **runbook** linking **Prometheus** **429** metrics to **OpenAPI** **operationId** for **triage**; document rollback when misconfiguration causes **customer-visible** throttling."
    }
  ],
  "wrongAnswers": [
    "OpenAPI replaces the need for Spring Security — OpenAPI documents auth; it does not enforce tokens, scopes, or TLS; the gateway and Spring Security filters still do the real work.",
    "`operationId` is only for human readers in Swagger UI — generators map `operationId` to client method names; changing it breaks Feign and mobile SDKs even when URLs are unchanged.",
    "If springdoc starts, Swagger UI must be public — UI and `/v3/api-docs` can be disabled or network-restricted while the app serves traffic; docs can live on a separate internal host.",
    "Contract testing and OpenAPI diff measure the same thing — OpenAPI diff checks schema compatibility; Pact checks consumer examples; both are needed for different failure modes.",
    "Examples in OpenAPI are validated automatically by all gateways — examples are documentation; runtime validation requires explicit JSON Schema or bean validation on the server.",
    "OpenAPI 3.1 and 3.0 are interchangeable for all Java tools — some generators and Spectral rules differ; upgrading requires checking plugin compatibility and nullable handling.",
    "Code-first means the YAML file in git is always accurate — emitted spec can omit undescribed errors or parameters unless CI snapshots and fails on drift.",
    "Disabling Swagger UI hides the API from attackers — endpoints remain callable if routing exists; security is enforced by authentication and authorisation, not by hiding docs."
  ]
};
