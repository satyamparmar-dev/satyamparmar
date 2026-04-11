export default {
  title: "CompletableFuture composition",
  diagramType: "sequence",
  description: "supplyAsync schedules task; thenApply chains transform; executor isolates work.",
  plantuml: String.raw`@startuml
title Day 36 — async pipeline

participant App as A
participant CF as C
participant Executor as E
participant Stage as S
participant Callback as K

A -> C : supplyAsync(task)
C -> E : submit
E -> S : run supplier
S -> K : complete value
K -> C : thenApply(map)
C -> E : maybe async
E -> S : map fn
S --> A : join/get result
@enduml`,
};
