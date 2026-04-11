export default {
  title: "Optional chain short-circuits on empty",
  diagramType: "sequence",
  description: "map/flatMap skip when empty; terminal orElse resolves value.",
  plantuml: String.raw`@startuml
title Day 31 — Optional pipeline

participant Client as C
participant "Optional\nUser" as U
participant "Optional\nAddress" as A
participant "Optional\nString" as S

C -> U : flatMap address
alt empty user
  U --> C : empty
else present
  U -> A : flatMap city
  alt empty address
    A --> C : empty
  else present
    A -> S : map city
    S --> C : value or empty
  end
end
C -> C : orElse default
@enduml`,
};
