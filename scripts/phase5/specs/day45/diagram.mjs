export default {
  title: "Transactional proxy boundary",
  diagramType: "sequence",
  description: "Framework flow for day 45.",
  plantuml: String.raw`@startuml
title Day 45 — @Transactional

participant Caller as C
participant Proxy as P
participant Service as S
participant Tx as T
participant DB as D

C -> P : method()
P -> T : begin
P -> S : joinPoint
S -> D : SQL
D --> S : ok
S --> P : return
P -> T : commit
P --> C : result
@enduml`,
};
