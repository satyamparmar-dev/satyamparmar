export default {
  title: "Around advice wraps join point",
  diagramType: "sequence",
  description: "Framework flow for day 40.",
  plantuml: String.raw`@startuml
title Day 40 — @Around

participant Client as C
participant Proxy as P
participant Aspect as A
participant Target as T

C -> P : call
P -> A : before
A -> T : proceed to method
T --> A : return
A --> P : after
P --> C : result
@enduml`,
};
