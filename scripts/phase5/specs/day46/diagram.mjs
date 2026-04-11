export default {
  title: "Security filter chain",
  diagramType: "sequence",
  description: "Framework flow for day 46.",
  plantuml: String.raw`@startuml
title Day 46 — filters

participant Client as C
participant Chain as F
participant Auth as A
participant Authz as Z

C -> F : request
F -> A : authenticate
A --> F : SecurityContext
F -> Z : authorize
Z --> C : 200/403
@enduml`,
};
