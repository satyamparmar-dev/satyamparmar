export default {
  "conceptual": [
    {
      "question": "What is **service discovery** in microservices, and what breaks when it lies?",
      "answer": "**Service discovery** answers *which backend addresses are valid right now* for a logical service name. **Kubernetes** implements this with **Service** objects, **CoreDNS** names, and **Endpoints** built only from **Ready** pods. When discovery is **stale** or **empty**, gateways and clients still open connections to **drained** or **broken** instances, so you see **502** spikes that line up with **rollouts** instead of steady load."
    },
    {
      "question": "Walk through **Kubernetes Service DNS** from a Java pod to a **Ready** upstream.",
      "answer": "A pod resolves `payments.prod.svc.cluster.local` via **CoreDNS**, receiving the **ClusterIP** for the **payments** **Service**. **kube-proxy** or the **CNI** dataplane maps that **VIP** to **pod IPs** listed in **Endpoints** that passed **readiness**. Your **Java** process then opens a TCP connection to that **ClusterIP:port**, and the dataplane picks a **healthy** backend. If **readiness** is wrong, **DNS** still resolves but traffic lands on **bad** pods."
    },
    {
      "question": "Contrast **client-side** discovery with **server-side** discovery for HTTP microservices.",
      "answer": "**Client-side** means the caller library (**Spring Cloud LoadBalancer**, **Ribbon** successors, mesh **sidecar**) chooses an instance from a **registry** or **Endpoint** list. **Server-side** means a **load balancer** or **API gateway** picks upstreams while clients only know a **stable** edge name. **Client-side** adds flexibility and can save a hop, but spreads **policy** and **TLS** concerns across many binaries. **Server-side** centralizes **auth** and **quotas** but adds **capacity planning** for the middle tier."
    },
    {
      "question": "What responsibilities belong in an **API gateway** versus inside domain services?",
      "answer": "Gateways should terminate **TLS**, validate **OAuth2/JWT**, apply **coarse rate limits**, **route** paths, inject **trace** headers, and sometimes **terminate** **mTLS** to the mesh. **Domain services** own **business invariants**, **transactions**, and **data ownership**. When gateways start encoding **pricing rules** or **multi-service sagas**, deploys become **coupled** and **blast radius** grows because every team shares one **release train** for the edge."
    },
    {
      "question": "Explain **readiness** versus **liveness** in the context of **Service Endpoints**.",
      "answer": "**Readiness** decides whether a pod receives **Service** traffic. Failing readiness removes the pod from **Endpoints**, which is what **kube-proxy** uses for routing. **Liveness** decides whether **kubelet** should **restart** the container. Putting **expensive dependency checks** on **liveness** causes **restart flapping**, while putting **no dependency checks** on **readiness** advertises pods that **500** real requests."
    },
    {
      "question": "Why do teams see **502 from the gateway** right after a **rolling update**?",
      "answer": "Common pattern: **new** pods are **Running** but not yet **Ready**, while **old** pods were already **terminated**, yielding **empty** or **undersized** **Endpoints** for a window. Another pattern: **gateways** or **Envoy** clusters cache **prior** upstream IPs until **health checks** fail. Less obvious: **maxUnavailable** set too aggressively drains **all** backends simultaneously."
    },
    {
      "question": "How does **Spring Cloud Gateway** route a request from **predicate** to **filter** to **URI**?",
      "answer": "**RouteLocator** builds **Route** objects with ordered **GatewayFilter** chains and **AsyncPredicate** tests such as **Path**, **Host**, or **Header**. Incoming requests evaluate **predicates**; the first matching **route** wins unless you configure **ordered** routes explicitly. **Filters** can run **pre** and **post** logic—**AddRequestHeader**, **StripPrefix**, **RequestRateLimiter**, **OAuth2** resource server integration—and the **URI** may be `lb://payments` to integrate with **LoadBalancerClient**."
    },
    {
      "question": "What is the difference between **Ingress**, **Gateway API**, and a **Spring Cloud Gateway** deployment?",
      "answer": "**Ingress** (Kubernetes) is a **north-south** HTTP/S routing resource implemented by controllers like **nginx** or **ALB**. **Gateway API** is the successor CRD model with richer **role-oriented** APIs. **Spring Cloud Gateway** is an **application-level** gateway you operate as **pods** with **Java** filters—often sitting **behind** cloud **L4/L7** load balancers. Teams combine **cloud LB** + **Ingress/Gateway API** + **Spring** gateway when they need **Java** ecosystem filters."
    },
    {
      "question": "How do **connection pools** interact with **pod churn** and **service discovery**?",
      "answer": "Clients and gateways **reuse** TCP connections to upstream IPs for efficiency. When **Kubernetes** replaces pods, old **IPs** disappear while pools may still hand out **stale** sockets until **errors** trigger **eviction**. Without **timeouts** and **max idle** tuning, you observe **502** or **connection reset** bursts that clear when processes restart."
    },
    {
      "question": "What role does **Consul** play compared to **Kubernetes** discovery for **hybrid** estates?",
      "answer": "**Consul** offers a **multi-datacenter** service catalog with **health checks** that can span **VMs** and **containers**, useful when **not everything** runs on **Kubernetes**. **Kubernetes** discovery is **authoritative** inside a cluster but awkward for **legacy** subnets. Teams sometimes run **Consul** sidecars or **sync** **Kubernetes** services into **Consul** for a **unified** graph."
    },
    {
      "question": "Explain **mutual TLS** between **gateway** and **upstream** versus **mesh mTLS**.",
      "answer": "**Gateway-to-service mTLS** proves the **edge** component’s identity to **backends**, often using **platform-issued** certificates. **Mesh mTLS** encrypts **east-west** traffic between **many** services via **sidecar** proxies with **SPIFFE**-style identities. They solve different **trust boundaries**: **north-south** versus **east-west**. **JWT** for **end users** is orthogonal—**mTLS** is about **service** identity."
    },
    {
      "question": "How can **DNS TTL** misconfiguration hurt **mobile clients** after deploys?",
      "answer": "Mobile OSes and **HTTP** stacks **cache** DNS answers according to **TTL**. If you point **public DNS** directly at **ephemeral** pod IPs with **short** TTL, resolvers **hammer** DNS; if TTL is **long**, users **stick** to **dead** IPs after incidents. Stable **edge** names should target **load balancers** or **gateways**, not raw **pod** addresses."
    },
    {
      "question": "What does **`lb://serviceId`** mean in **Spring Cloud Gateway** `uri` fields?",
      "answer": "It tells the gateway to resolve **`serviceId`** through **Spring Cloud LoadBalancer** rather than using a **static** host. The effective **HTTP** client targets instances from **DiscoveryClient** or **Kubernetes** discovery modules. Misconfigured **serviceId** strings that do not match **registration** names yield **503** with **no healthy upstream** messages in logs."
    },
    {
      "question": "How do **global** deployments handle **service discovery** across **regions**?",
      "answer": "Options include **geo-DNS** with **health-checked** endpoints, **multi-cluster gateways** that **federate** routes, or **mesh** multi-cluster **secrets** sharing **trust**. **Data residency** rules may forbid **automatic** cross-region failover for certain **tenants**. Discovery must respect **latency** and **compliance** simultaneously."
    },
    {
      "question": "Why is **idempotency** a gateway concern when **retries** are enabled?",
      "answer": "Gateways and **Envoy** may **retry** **5xx** or **connect** failures automatically. **POST** without **idempotency keys** can **duplicate** side effects—double **charges**, duplicate **orders**. **Safe** retries require **bounded** budgets, **retryable** methods, and **deduplication** at **domain** services."
    },
    {
      "question": "What problem does **service discovery** solve in Kubernetes vs a static config file?",
      "answer": "Pods are ephemeral — IPs change on reschedule. Discovery (DNS, K8s Services, Consul) maps **logical names** to current instances. Static files cause stale routes and failed calls after rollouts. Health-aware discovery avoids routing to not-ready pods."
    },
    {
      "question": "What belongs in an **API gateway** vs inside each microservice?",
      "answer": "**Gateway**: TLS termination, authn at edge, rate limits, WAF, request routing, some A/B and canary splits. **Service**: business rules, authz on resources, domain validation. Avoid putting domain logic in the gateway — it becomes a distributed monolith."
    }
  ],
  "codeBased": [
    {
      "question": "What does this **Spring Cloud** client setup imply for discovery?",
      "answer": "// @Configuration\n// @Bean\n// @LoadBalanced\n// WebClient.Builder webClientBuilder() { return WebClient.builder(); }\n// // Usage: webClientBuilder.build().get().uri(\"http://payments/api/health\").retrieve().toBodilessEntity();\n// Resolves \"payments\" via LoadBalancer + DiscoveryClient (Kubernetes or Eureka).\n// Misconfiguration shows 503 when no instances registered or wrong serviceId."
    },
    {
      "question": "Annotate this **Gateway** route for **`/api/payments/**` to **`lb://payments-service`**.",
      "answer": "// spring.cloud.gateway.routes[0].id=payments\n// spring.cloud.gateway.routes[0].uri=lb://payments-service\n// spring.cloud.gateway.routes[0].predicates[0]=Path=/api/payments/**\n// spring.cloud.gateway.routes[0].filters[0]=StripPrefix=2\n// // StripPrefix removes /api/payments leaving downstream path\n// // Add filters for OAuth2 Resource Server or RequestRateLimiter as needed"
    },
    {
      "question": "Show **Kubernetes** **readiness** and **liveness** probes for **Spring Boot** on port **8080**.",
      "answer": "// readinessProbe:\n//   httpGet: { path: /actuator/health/readiness, port: 8080 }\n//   initialDelaySeconds: 20\n//   periodSeconds: 5\n// livenessProbe:\n//   httpGet: { path: /actuator/health/liveness, port: 8080 }\n//   initialDelaySeconds: 60\n//   periodSeconds: 10\n// // Readiness gates Endpoints; liveness restarts on wedge"
    },
    {
      "question": "Write **Eureka client** properties for **serviceId** `orders` registering on **port 8080**.",
      "answer": "// spring.application.name=orders\n// eureka.client.service-url.defaultZone=http://eureka:8761/eureka/\n// eureka.instance.prefer-ip-address=true\n// server.port=8080\n// // prefer-ip-address affects how peers call this instance on LAN/K8s"
    },
    {
      "question": "Demonstrate **GatewayFilter** that adds **`X-Trace-Id`** header for downstream services.",
      "answer": "// @Bean\n// public RouteLocator customRoutes(RouteLocatorBuilder builder) {\n//   return builder.routes()\n//     .route(\"trace\", r -> r.path(\"/api/**\")\n//       .filters(f -> f.addRequestHeader(\"X-Trace-Id\", UUID_PLACEHOLDER))\n//       .uri(\"lb://backend\"))\n//     .build();\n// }\n// // Replace UUID_PLACEHOLDER with Tracer.currentSpan().context().traceId() in real code"
    },
    {
      "question": "Show **`curl`** through a gateway with **Bearer** token and **API key** header.",
      "answer": "// curl -v https://api.example.com/api/payments/42 \\\n//   -H \"Authorization: Bearer eyJhbGciOi...\" \\\n//   -H \"X-Api-Key: partner-live-key\" \\\n//   -H \"Accept: application/json\"\n// // Gateway validates JWT + maps API key to tenant before routing"
    },
    {
      "question": "Illustrate **`application.yml`** enabling **Kubernetes discovery** in **Spring Cloud**.",
      "answer": "// spring.cloud.kubernetes.discovery.enabled=true\n// spring.cloud.kubernetes.discovery.all-namespaces=false\n// spring.main.cloud-platform=KUBERNETES\n// // Requires RBAC Role to watch Endpoints/EndpointSlices in the pod namespace"
    },
    {
      "question": "Write a **Resilience4j** **CircuitBreaker** config snippet for **WebClient** calls.",
      "answer": "// resilience4j.circuitbreaker.instances.payments.failureRateThreshold=50\n// resilience4j.circuitbreaker.instances.payments.waitDurationInOpenState=30s\n// resilience4j.circuitbreaker.instances.payments.slidingWindowSize=20\n// // Combine with TimeLimiter for end-to-end timeouts on reactive chains"
    },
    {
      "question": "Show **`@Bean` `ReactiveJwtDecoder`** usage conceptually for **gateway** resource server.",
      "answer": "// @Bean\n// ReactiveJwtDecoder jwtDecoder() {\n//   return NimbusReactiveJwtDecoder.withJwkSetUri(\"https://issuer/.well-known/jwks.json\")\n//       .build();\n// }\n// // Cache JWKS keys with TTL; handle rotation by refreshing on unknown kid"
    },
    {
      "question": "Demonstrate **Envoy**-style **cluster** health check pseudo-config for upstream **payments**.",
      "answer": "// clusters:\n// - name: payments\n//   connect_timeout: 0.25s\n//   type: STRICT_DNS\n//   load_assignment:\n//     cluster_name: payments\n//     endpoints: [{ lb_endpoints: [{ endpoint: { address: { socket_address: { address: payments.prod.svc.cluster.local, port_value: 8080 }}}}] }]\n//   health_checks: [{ timeout: 1s, interval: 5s, http_health_check: { path: /actuator/health }}]"
    },
    {
      "question": "How would you configure **retries** at the gateway for **GET** vs **POST** to a downstream?",
      "answer": "**GET** (idempotent): retry on connect timeout or 503 with backoff and **Retry-After** respect. **POST**: default **no retry** to the body unless you know the downstream is idempotent or you carry **Idempotency-Key** end-to-end. Prefer client or service-level retry policies with budgets."
    },
    {
      "question": "Give a **health check** pattern that avoids lying **Ready** when dependencies are down.",
      "answer": "**Liveness** = process up. **Readiness** = can serve traffic (DB reachable, critical deps OK). If Redis is required for login, failing readiness pulls the pod from Service endpoints. Do not put slow checks on liveness — you will get restart loops."
    }
  ],
  "seniorScenario": [
    {
      "question": "**Production:** After a **payments** deploy, **checkout** shows **30% 502** from the **API gateway** while **`kubectl get pods`** is all **Running**. Walk your response.",
      "answer": "**(1) Immediate response** Page **payments** and **platform** on-call, freeze **progressive** delivery if active, open **gateway** **502** rate by **routeId** and **payments** **golden signals** (success rate, latency). Announce status referencing **customer-visible** impact and **ETA** for first hypothesis.\n\n**(2) Root cause** Most often **Endpoints** are **empty** or **partial** because **readiness** fails while containers stay **Running**, or **rolling** parameters briefly drain all **Ready** backends. Secondary: **gateway** **upstream** cache or **Envoy** **EDS** lag keeps **drained** **IPs**.\n\n**(3) Fix** 1) `kubectl get endpoints payments -n prod -o yaml` and **`kubectl get endpointslices`**. 2) `kubectl describe pod` on newest pods for **probe** failures. 3) If strategy caused gap, patch **Deployment** **`maxUnavailable`/`maxSurge`** and **rollback** if needed. 4) Bounce **gateway** pods only after confirming **data plane** staleness. 5) Validate with **synthetic** **canary** through gateway before closing.\n\n**(4) Prevention** Align **readiness** with **DB migration** gates, add **minReadySeconds**, run **pre-prod** **load** tests on **rollouts**, and alert on **Endpoints** **subset** size dropping below **2** during **business hours**."
    },
    {
      "question": "**Design review:** A partner wants the **mobile** app to call **`http://payments.prod.svc.cluster.local`** directly to “reduce latency.” Your response?",
      "answer": "**(1) Immediate response** Reject for **production**; offer **public** **gateway** **hostname** with **JWT** + **API key** and optional **HTTP/3** **edge** tuning for latency. Schedule a **design** workshop with **security** and **mobile** leads the same week so the partner hears a **unified** platform stance rather than ad-hoc debate.\n\n**(2) Root cause** The request confuses **in-cluster** **DNS** with **Internet** **reachability** and skips **security** **controls** **WAF**, **audit**, **rotation**, and **DDoS** protection. **`svc.cluster.local`** is not routable from the **public** Internet, and even **VPN** clients should not depend on **volatile** **pod** naming. **Latency** claims rarely survive **tracing** once you separate **TLS**, **payload**, and **device** **radio** effects.\n\n**(3) Fix** 1) Publish **stable** **api.example.com** via **cloud** **LB** to **gateway**. 2) Issue **mTLS** or **JWT** **per partner** with **scoped** **audiences**. 3) Document **SLO**, **rate limits**, and **deprecation** policy in **OpenAPI**. 4) Provide **staging** **curl** **examples** that mirror **production** **headers**. 5) Add **WAF** rules and **bot** protections at the **edge**. 6) Run **load** tests proving **gateway** overhead is not the dominant **p99** term.\n\n**(4) Prevention** Add **architecture decision record** banning **ClusterIP** **leakage**, **CI** checks for **hardcoded** **internal** **DNS** in **mobile** repos, **quarterly** **penetration** tests on **public** **surface**, and **executive** **review** for any **exception** that bypasses **central** **policy**."
    },
    {
      "question": "**Migration:** You move **200** **Spring Boot** services from **Eureka** to **Kubernetes** native discovery in **six months**. Outline the plan.",
      "answer": "**(1) Immediate response** Stand up **staging** **clusters** with **`spring-cloud-kubernetes`**, **RBAC** templates, and **golden** **Helm** charts for **probes** and **Service** naming. Publish a **migration** **playbook** with **office hours** so teams know how **serviceId** strings map to **DNS** names and which **dashboards** validate **instance** lists.\n\n**(2) Root cause** Risk is **dual-truth** registries and **inconsistent** **health** semantics causing **flapping** **routes** during **cutover**. **Eureka** **self-preservation** and **Kubernetes** **readiness** are not equivalent; **JVM** apps may register before **Endpoints** would consider them **Ready**, or the reverse if **probes** are mis-tuned.\n\n**(3) Fix** 1) Inventory **serviceId** mapping to **Kubernetes** **Service** names. 2) Pilot **low-risk** **stateless** APIs with **shadow** traffic comparisons. 3) Run **parallel** discovery with **feature** **flag** to switch **`lb://`** resolution source per **namespace**. 4) Decommission **Eureka** **AZ** by **AZ** after **metrics** prove **parity** on **registration** count and **5xx**. 5) Train **teams** on **`kubectl`** **Endpoints** debugging and **Spring** **Actuator** **groups**. 6) Automate **rollback** of the **flag** if **SLO** **burn** spikes during **cutover** windows.\n\n**(4) Prevention** **Lint** **bootstrap** YAML for forbidden **Eureka** properties post-cutover, **dashboard** **discovery** **lag**, **game** days for **registry** **outage**, and **quarterly** audits ensuring **no** **new** **Eureka** **dependencies** sneak in via **copy-paste** templates."
    },
    {
      "question": "**Incident:** **JWT** validation at the **gateway** suddenly returns **401** for all **tenants** after an **issuer** cert rotation. What do you do?",
      "answer": "**(1) Immediate response** Trigger **severity** **1**, open **status** page if **customer** **auth** blocked, and **rollback** **gateway** **deployment** if a **bad** **config** change shipped; otherwise coordinate with **identity** team. Preserve **verbose** **logs** with **redacted** tokens for **post-incident** review while **support** communicates **workarounds** such as **temporary** **maintenance** pages if needed.\n\n**(2) Root cause** **JWKS** fetch **failures**, **clock** **skew**, wrong **`issuer` URI**, or **stale** **cache** after **key** rotation **kid** changes. **Firewall** egress rules or **SPIFFE** **proxy** misconfiguration can block **JWKS** pulls even when **tokens** are valid. **Multi-tenant** gateways may point at the wrong **issuer** per **route** after a **bad** **merge**.\n\n**(3) Fix** 1) `curl -v https://issuer/.well-known/openid-configuration` from **gateway** pod. 2) Inspect **gateway** logs for **`JwtException`** **signatures** and **kid** values. 3) Tune **`cacheDuration`** or **force** **refresh** after **identity** confirms **key** promotion. 4) Verify **NTP** on **nodes** and **pod** **clocks**. 5) Deploy **hotfix** with **relaxed** **cache** only if **security** accepts risk and **overlap** keys exist. 6) Validate **JWKS** **signature** **algorithm** allowlists match **issuer** policy.\n\n**(4) Prevention** **Canary** **gateway** **config** changes, **synthetic** **login** **checks** every **minute**, **runbook** tying **issuer** **maintenance** to **platform** **calendar**, and **automated** tests that **fetch** **JWKS** from **staging** **before** **prod** **promotion** completes."
    },
    {
      "question": "**Scale:** **Gateway** **CPU** is fine but **p99** latency doubled after adding a **synchronous** **fraud** **check** filter. Explain and remediate.",
      "answer": "**(1) Immediate response** **Feature** **flag** off the **filter** for **non-fraud** **critical** paths or **raise** **replicas** temporarily while **isolating** **hot** **routes**. Capture **before/after** **p99** **histograms** tagged by **routeId** so **leadership** sees objective **impact** and approves **engineering** time for a proper **async** rewrite.\n\n**(2) Root cause** **Blocking** **I/O** on **Netty** **event** **loop** threads serializes **requests**, inflating **queueing** **delay** even when **CPU** looks **low**. **Event-loop** starvation shows up as **growing** **pending** tasks while **GC** and **CPU** remain calm. **Synchronous** **HTTP** clients inside **GatewayFilter** are a classic **foot-gun** during **Black Friday** scale.\n\n**(3) Fix** 1) Move **fraud** call to **async** **WebClient** with **bounded** **concurrency** and **timeouts**. 2) **Offload** to **sidecar** or **external** **policy** **service** with **dedicated** **pool**. 3) Split **gateway** **deployment** for **heavy** **routes** so **blast** **radius** shrinks. 4) Add **metrics** for **`reactor`** **event-loop** **pending** tasks and **Netty** **eventloop** **pending** **queues**. 5) Add **bulkhead** limits per **tenant** if **fraud** **provider** slows down.\n\n**(4) Prevention** **Architecture** **review** **checklist** bans **blocking** **filters**, **load** **test** **gateway** with **k6** **per** **route**, **alert** on **scheduling** **delay** in **Micrometer**, and **profile** **gateway** **releases** on **hardware** similar to **prod** **nodes**."
    },
    {
      "question": "**Chaos:** During an **AZ** **failure**, **discovery** shows **healthy** **pods** in **surviving** **AZ** but **clients** still **timeout**. Diagnose.",
      "answer": "**(1) Immediate response** Shift **traffic** at **global** **load** **balancer** to **healthy** **region**, drain **bad** **AZ** in **DNS** **weights**, and **collect** **packet** **traces** from **failing** **clients**. Engage **cloud** **network** **support** early if **BGP** or **transit** anomalies appear on **provider** **status** pages.\n\n**(2) Root cause** **Subnet** **routing** **blackholes**, **stale** **security** **group** rules, **cross-AZ** **NAT** **exhaustion**, or **clients** **caching** **old** **gateway** **IPs**. **Discovery** can be **truthful** while **data** **plane** **paths** are broken, so **symptoms** look like **timeouts** rather than **502**. **Stateful** **connections** pinned to **bad** **AZ** **ENIs** exacerbate the pain.\n\n**(3) Fix** 1) Verify **cloud** **health** **checks** for **NLB** **targets** and **target** **deregistration** delays. 2) **Revoke** **routes** advertising **dead** **AZ** and **confirm** **propagation** in **route** tables. 3) **Recycle** **connection** **pools** on **gateways** and **Envoy** **clusters** if **EDS** lag suspected. 4) **Lower** **TTL** temporarily with **ops** approval and **communicate** **client** **cache** risk. 5) **Failover** **databases** if **writes** **stuck** and **RPO** allows. 6) Validate **security** **groups** allow **surviving** **subnets** to reach **NAT** gateways.\n\n**(4) Prevention** **Multi-AZ** **integration** tests, **quarterly** **AZ** **drain** drills, **SLO** on **regional** **failover** **minutes**, **dashboards** for **NAT** **port** **allocation**, and **documented** **RTO** **targets** per **tier** so **executives** know expected **customer** **impact** windows."
    }
  ],
  "wrongAnswers": [
    "**The API gateway should own all business rules** — **Correction:** Gateways excel at **TLS**, **auth**, **rate limits**, and **routing**. Pushing **domain joins** into the gateway creates a **distributed monolith** that is hard to test and deploy independently.",
    "**Kubernetes DNS TTL alone keeps routing fresh during pod churn** — **Correction:** **TTL** is coarse; clients and resolvers **cache** aggressively. **Truth** for membership lives in **Endpoints** / **EndpointSlices** updated by the **API server**, not DNS record churn speed.",
    "**If pods are Running, traffic must be healthy** — **Correction:** **Running** only means containers started. **Readiness** gates **Service** membership; misconfigured probes yield **empty Endpoints** while pods look fine, producing **502** at the **gateway**.",
    "**Eureka and Kubernetes discovery are interchangeable with zero migration work** — **Correction:** **Eureka** is a **JVM-centric registry** with **self-preservation** semantics; **Kubernetes** uses **API server** watches. Clients, **health** models, and **partition** behavior differ; expect **config and library** upgrades.",
    "**Client-side discovery always reduces latency versus a gateway** — **Correction:** You may save a hop, but you pay in **library coupling**, **key rotation**, and **policy** sprawl. Many teams prefer a **gateway** for **edge consistency** even if **p99** adds a millisecond.",
    "**mTLS at the gateway removes the need for service-level security** — **Correction:** **Gateway mTLS** to upstreams is one hop. **Mesh mTLS** covers **east-west** between many services. You still need **authorization** and **data protection** inside services.",
    "**Spring Cloud LoadBalancer caches forever for performance** — **Correction:** **Infinite TTL** yields **stale instances** after incidents. Tune **spring.cloud.loadbalancer.cache.ttl** and prefer sources that reflect **Kubernetes** **Endpoint** changes quickly.",
    "**Global DNS geolocation alone implements active-active failover** — **Correction:** **DNS failover** is slow and **cache-dependent**. Real **active-active** pairs **health checks**, **traffic weights**, and often **multi-cluster gateways** or **mesh** with explicit **failover policy**."
  ]
};
