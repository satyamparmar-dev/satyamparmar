export default {
  title: "Stream pipeline execution",
  diagramType: "sequence",
  description: "Spliterator splits; ops fused; terminal pulls or short-circuits.",
  plantuml: String.raw`@startuml
title Day 30 — stream terminal triggers work

participant App as A
participant "Stream\npipeline" as P
participant Spliterator as S
participant Op as O
participant Collector as C

A -> P : build intermediate chain
A -> P : terminal collect
loop pull while not done
  P -> S : tryAdvance
  S -> O : accept element
  O -> O : map/filter fuse
end
P -> C : supplier/accumulator/combiner/finisher
C -> A : result Map/List
alt short-circuit
  P -> S : stop early\nfindFirst
end
@enduml`,
};
