export default {
  title: "Request path — REST semantics in production",
  diagramType: "component",
  description: "How a REST request flows through gateway and service; where idempotency, status codes, and tracing matter.",
  plantuml: "@startuml\ntitle Day 49 — REST request path\nactor Client\nparticipant Gateway\nparticipant \"Order API\" as API\ndatabase \"Store\" as DB\n\nClient -> Gateway : POST /orders + Idempotency-Key + traceparent\nGateway -> API : auth, rate limit, route\nAPI -> DB : dedup key? persist resource\nAPI --> Gateway : 201 Location / 409 / ProblemDetail\nGateway --> Client : stable status + body\n\nnote right of API\n  Correct 4xx/5xx + headers\n  enable retries & caches\nend note\n@enduml",
};
