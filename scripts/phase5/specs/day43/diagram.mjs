export default {
  title: "Health contributor aggregation",
  diagramType: "sequence",
  description: "Framework flow for day 43.",
  plantuml: String.raw`@startuml
title Day 43 — health

participant Actuator as A
participant Db as D
participant Disk as K
participant Agg as G

A -> D : ping
A -> K : space
D --> G : up/down
K --> G : up/down
G --> A : aggregate
@enduml`,
};
