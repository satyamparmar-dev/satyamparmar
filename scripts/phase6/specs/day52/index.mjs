import { theoryTitle, theoryBase } from "./theory.mjs";
import {
  basicCode,
  basicOutput,
  intermediateCode,
  intermediateOutput,
  advancedCode,
  advancedOutput,
} from "./codes.mjs";
import diagram from "./diagram.mjs";
import mcqQuestions from "./mcq.mjs";
import interview from "./interview.mjs";

const why = "When discovery and gateways are mishandled, production looks like random **502 Bad Gateway** waves right after a **rolling deploy**, even though **`kubectl get pods`** shows green. The real failure is often **empty or stale Endpoints**, **readiness** that does not match real dependencies, or a **gateway** still pointing at **draining IPs** while DNS and caches lag. Customers see timeouts; on-call chases ghosts because each layer thinks someone else owns routing truth.\n\nInterviewers are not testing whether you memorized **Eureka** class names. They want to hear **where the truth lives** for **which backends are safe to call**, how **health** gates membership in the pool, and how **edge policy** differs from **domain logic**. Strong answers name **symptoms** (spiky 502, regional-only failures) and **signals** (**Endpoints** YAML, **upstream_rq_5xx**, **CoreDNS** QPS).\n\nA crisp four-step answer usually covers: (1) **stable edge** DNS or VIP versus **volatile** instance sets, (2) **discovery mechanism** (registry, **kube-proxy**, mesh **EDS**), (3) **gateway responsibilities** (**TLS**, **JWT**, **rate limit**, **routing**), (4) **failure handling** (**timeouts**, **retries** on safe reads, **circuit breaking**) with **one command** you would run first (`kubectl get endpoints`).\n\nAt scale, this topic is how **fifty teams** share a **platform contract**. Bad defaults multiply: one service bypasses the **gateway** and invents **mTLS** rules another team cannot audit; another publishes **pod IPs** to mobile clients and turns every deploy into a **cache TTL** incident. Good platforms make **golden paths** obvious and measure **SLO** per route.\n\nSenior answers sound **operational**: you discuss **watch churn** on huge **EndpointSlices**, **connection pool** reuse across **pod churn**, **JWKS** cache TTL at the gateway, and **canary** promotion tied to **error budget** — not only class diagrams.";

const pitfalls = [
  "Using **liveness** probes for dependency checks so slow databases restart every pod in a loop while **readiness** should have removed them from traffic.",
  "Publishing **pod IPs** or internal **ClusterIP DNS** to external partners, bypassing **auth**, **audit**, and **WAF** you would have enforced at a **gateway**.",
  "Treating **DNS TTL** like a real-time registry so mobile clients cache **dead** backends for minutes after a deploy.",
  "Running **gateway filters** that block the **reactive event loop** with synchronous JDBC calls, exploding **p99** under load.",
  "Enabling **blind retries** from the gateway on **POST** without **idempotency keys**, doubling writes during upstream timeouts.",
  "Letting **Spring Cloud LoadBalancer** cache stale instances forever after **TTL** misconfiguration while **Kubernetes** already moved **Endpoints**.",
  "Putting **domain pricing rules** and **joins across ten services** inside the **gateway**, creating a **distributed monolith** front door.",
  "Skipping **Endpoint** verification during incidents and only staring at **pod Running**, missing **empty subsets** that cause **502**."
];

const exercise = {
  "title": "Exercise — Routing, discovery, and centralized policies (Day 52 assignment)",
  "difficulty": "Advanced",
  "problem": "Align this exercise with **Day 52 Assignment**: **Routing, discovery, and centralized policies**.\n\n1. Build an in-memory **registry** that maps **logical service id** (`payments`, `orders`) to **instances** (`host:port` + **healthy** flag).\n2. Build a **path routing table**: `/api/payments` → `payments`, `/api/orders` → `orders` (prefix match).\n3. Implement a **gateway policy**: requests without a non-blank **API key** string must be rejected before routing (print a clear `403` style message).\n4. For a matching route, print `ROUTE <path> -> <service> -> <chosen host:port>` choosing the **first healthy** instance, or a clear error if none.\n5. Demonstrate in `main()` at least: **happy payment route**, **policy rejection**, **orders before registration** (error), then **register healthy orders** and show success.\n\nUse only deterministic strings; no randomness.",
  "hints": [
    "Keep route matching as simple prefix checks in a `LinkedHashMap` iteration order.",
    "Separate **policy** from **discovery** so you can test each gate independently.",
    "Register two **payments** instances with one unhealthy to prove **first healthy** selection."
  ],
  "solution": "package arch.day52;\n\nimport java.util.*;\n\n/**\n * Day 52 assignment: routing table + service registry + gateway API-key policy.\n * Mirrors \"Routing, discovery, and centralized policies\" from assignments_phase6.json.\n */\npublic class Day52Exercise {\n\n    static final class Instance {\n        final String hostPort;\n        final boolean healthy;\n\n        Instance(String hostPort, boolean healthy) {\n            this.hostPort = hostPort;\n            this.healthy = healthy;\n        }\n    }\n\n    static final class Registry {\n        private final Map<String, List<Instance>> byService = new LinkedHashMap<>();\n\n        void register(String serviceId, Instance instance) {\n            byService.computeIfAbsent(serviceId, k -> new ArrayList<>()).add(instance);\n        }\n\n        String pickFirstHealthy(String serviceId) {\n            List<Instance> list = byService.get(serviceId);\n            if (list == null || list.isEmpty()) {\n                return \"NO_INSTANCES_REGISTERED\";\n            }\n            for (Instance i : list) {\n                if (i.healthy) {\n                    return i.hostPort;\n                }\n            }\n            return \"NO_HEALTHY_INSTANCE\";\n        }\n    }\n\n    static String handleRequest(Registry reg,\n                                LinkedHashMap<String, String> routes,\n                                String apiKey,\n                                String path) {\n        if (apiKey == null || apiKey.isBlank()) {\n            return \"403 policy: missing X-Api-Key\";\n        }\n        for (Map.Entry<String, String> e : routes.entrySet()) {\n            if (path.startsWith(e.getKey())) {\n                String svc = e.getValue();\n                String upstream = reg.pickFirstHealthy(svc);\n                return \"ROUTE \" + path + \" -> \" + svc + \" -> \" + upstream;\n            }\n        }\n        return \"404 no route\";\n    }\n\n    public static void main(String[] args) {\n        Registry reg = new Registry();\n        reg.register(\"payments\", new Instance(\"10.2.0.1:8081\", true));\n        reg.register(\"payments\", new Instance(\"10.2.0.2:8081\", false));\n\n        LinkedHashMap<String, String> routes = new LinkedHashMap<>();\n        routes.put(\"/api/payments\", \"payments\");\n        routes.put(\"/api/orders\", \"orders\");\n\n        System.out.println(\"=== Assignment: routing + discovery + gateway policy ===\\n\");\n        System.out.println(handleRequest(reg, routes, \"key-001\", \"/api/payments/42\"));\n        System.out.println(handleRequest(reg, routes, \"\", \"/api/payments/42\"));\n        System.out.println(handleRequest(reg, routes, \"key-001\", \"/api/orders/1\"));\n        reg.register(\"orders\", new Instance(\"10.3.0.1:8090\", true));\n        System.out.println(handleRequest(reg, routes, \"key-001\", \"/api/orders/1\"));\n    }\n}\n"
};

const cheatsheetRows = [
  [
    "Service discovery",
    "Truth for live backends",
    "Stale registry = post-deploy 502"
  ],
  [
    "Kubernetes Service",
    "VIP + Endpoints from readiness",
    "describe pod vs get endpoints"
  ],
  [
    "API gateway",
    "L7 edge policy",
    "TLS + JWT + rate limit live here"
  ],
  [
    "Client-side LB",
    "Library picks instance",
    "Great flexibility, fleet-wide upgrades"
  ],
  [
    "Readiness",
    "Gate traffic membership",
    "Wrong probe = empty or bad pool"
  ],
  [
    "Eureka",
    "JVM registry history",
    "Know self-preservation + migration"
  ],
  [
    "Spring Cloud Gateway",
    "Predicate + filter chain",
    "Order matters; keep filters non-blocking"
  ],
  [
    "CoreDNS",
    "In-cluster name resolution",
    "Debug with nslookup from debug pod"
  ],
  [
    "mTLS",
    "Service identity",
    "Complements JWT for users"
  ],
  [
    "Canary",
    "Weighted routes + metrics",
    "Roll back weights, not hope"
  ],
  [
    "Trace id",
    "Propagate on every hop",
    "Debug 502/504 with correlation"
  ],
  [
    "Timeouts",
    "Client < gateway < server",
    "Cancel work; avoid retry storms"
  ],
  [
    "Payload size",
    "Cap upload; stream large",
    "Protect memory and threads"
  ],
  [
    "Deprecation",
    "Sunset header + docs",
    "Give consumers a calendar"
  ],
  [
    "Security",
    "Authn at edge; authz in service",
    "Do not trust gateway alone"
  ]
];

export default {
  title: "Service Discovery & API Gateway",
  tags: ["Mid-Level","Advanced","Phase 6","Interview Prep","Satyverse(Satyam Parmar)"],
  prerequisites: ["Day 51","Day 50"],
  learningObjectives: ["Explain **service discovery** (registry, DNS, Kubernetes Endpoints) and why **stale routing** causes post-deploy 502s","Contrast **client-side** vs **server-side** discovery and where an **API gateway** adds **TLS, auth, and rate limits**","Map **Spring Cloud Gateway**, **Spring Cloud LoadBalancer**, and **Kubernetes Service** DNS to a concrete request path","Diagnose **readiness vs liveness** mistakes and **empty Endpoints** using **kubectl** and **gateway upstream** metrics","Describe **mTLS**, **JWT validation at the edge**, and **partner-facing** APIs without leaking **internal Service** DNS","Choose discovery patterns for **greenfield K8s** vs **hybrid VM** estates and name one **measurable trade-off**"],
  why,
  theoryTitle,
  theoryBase,
  basicCode,
  basicOutput,
  intermediateCode,
  intermediateOutput,
  advancedCode,
  advancedOutput,
  diagram,
  pitfalls,
  exercise,
  interview,
  mcqLabel: "Service Discovery & API Gateway",
  mcqDescription: "Thirty questions from basic to advanced — Service Discovery & API Gateway. Read every option; distractors are plausible but wrong for a precise reason.",
  mcqQuestions,
  cheatsheetRows,
};
