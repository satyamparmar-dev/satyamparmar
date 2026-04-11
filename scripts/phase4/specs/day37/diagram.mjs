export default {
  title: "Stop-the-world GC pause",
  diagramType: "sequence",
  description: "Mutator threads reach safepoint; GC runs; mutators resume.",
  plantuml: String.raw`@startuml
title Day 37 — STW pause concept

participant AppThread1 as A1
participant AppThread2 as A2
participant Safepoint as S
participant GC as G
participant JVM as J
participant Heap as H

A1 -> S : reach safepoint
A2 -> S : reach safepoint
S -> G : begin collection
G -> H : mark/sweep/compact
G -> J : update metadata
G -> S : end pause
S -> A1 : resume
S -> A2 : resume
note over G,H : Duration drives\np99 latency risk
@enduml`,
};
