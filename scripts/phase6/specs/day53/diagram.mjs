export default {
  title: "Client resilience — Feign/WebClient to downstream",
  diagramType: "component",
  description: "Shows declarative client, optional circuit breaker, and dependency service with metrics.",
  plantuml: "@startuml\ntitle Day 53 — Outbound call with resilience\nparticipant \"Order Service\" as OS\nparticipant \"Feign / WebClient\" as C\nparticipant \"CircuitBreaker\" as CB\nparticipant \"Payments API\" as P\n\nOS -> C : GET /payments/{id}\nC -> CB : acquire permit\nCB -> P : HTTP\nP --> CB : 200 / 503 / timeout\nCB --> C : result / fail fast\nC --> OS : DTO / exception\nnote right of CB\n  Resilience4j tracks sliding window;\n  bulkhead limits concurrent calls\nend note\n@enduml",
};
