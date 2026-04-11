export default {
  title: "Lock ordering prevents deadlock",
  diagramType: "sequence",
  description: "Threads acquire lockA then lockB in same order; no cycle.",
  plantuml: String.raw`@startuml
title Day 34 — ordered locks

participant T1 as A
participant T2 as B
participant lockA as LA
participant lockB as LB
participant Counter as C

A -> LA : acquire A
A -> LB : acquire B
A -> C : work
A -> LB : release B
A -> LA : release A
B -> LA : acquire A
B -> LB : acquire B
B -> C : work
B -> LB : release B
B -> LA : release A
note over A,B : Same global order\nprevents AB-BA cycle
@enduml`,
};
