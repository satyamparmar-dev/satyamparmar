export default {
  title: "Reactive stream request",
  diagramType: "sequence",
  description: "Framework flow for day 48.",
  plantuml: String.raw`@startuml
title Day 48 — backpressure

participant Subscriber as S
participant Publisher as P
participant Op as O

S -> P : subscribe
P --> S : onSubscribe(sub)
S -> P : request(n)
P -> O : emit bounded
O --> S : onNext
@enduml`,
};
