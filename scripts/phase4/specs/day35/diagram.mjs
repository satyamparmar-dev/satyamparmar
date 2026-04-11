export default {
  title: "CAS update on AtomicInteger",
  diagramType: "sequence",
  description: "compareAndSet loop retries on conflict; hardware provides atomic word CAS.",
  plantuml: String.raw`@startuml
title Day 35 — AtomicInteger CAS

participant Thread1 as A
participant Thread2 as B
participant "AtomicInteger\nvalue" as V
participant CPU as C

A -> V : read 5
B -> V : read 5
A -> C : CAS 5->6 ok
B -> C : CAS 5->6 fail
B -> V : read 6
B -> C : CAS 6->7 ok
note over A,B : Retry loop until success
@enduml`,
};
