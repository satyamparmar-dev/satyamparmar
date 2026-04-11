export default {
  title: "JWT validation flow",
  diagramType: "sequence",
  description: "Framework flow for day 47.",
  plantuml: String.raw`@startuml
title Day 47 — JWT

participant Client as C
participant RS as R
participant Jwt as J

C -> R : Bearer token
R -> J : decode/validate
J --> R : claims
R --> C : authorized response
@enduml`,
};
