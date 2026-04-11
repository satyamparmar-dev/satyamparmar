export default {
  title: "N+1 select problem",
  diagramType: "sequence",
  description: "Framework flow for day 44.",
  plantuml: String.raw`@startuml
title Day 44 — N+1

participant App as A
participant Repo as R
participant DB as D

A -> R : findAll users
R -> D : SELECT users
loop each user
  A -> R : getOrders
  R -> D : SELECT orders
end
@enduml`,
};
