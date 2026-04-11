export default {
  title: "Complexity analysis — from code change to latency review",
  diagramType: "sequence",
  description:
    "Six participants: engineer ships a change, CI runs tests, staging observes latency, profiler confirms hot path, reviewer demands complexity proof, production SLO guard checks p99.",
  plantuml: String.raw`@startuml
title Complexity regression — sequence (review + prod signal)

participant "Engineer" as Dev
participant "CI\nUnit tests" as CI
participant "Staging\nmetrics" as St
participant "CPU\nProfiler" as Pr
participant "Code\nReviewer" as Rev
participant "Prod\nSLO monitor" as Slo

Dev -> CI : push diff (nested loop in hot path)
CI -> CI : tests pass (small n only)

Dev -> St : deploy to staging
loop each load step
  St -> St : record p50/p99 vs batch size
end

St -> Pr : p99 superlinear vs batch
Pr -> Rev : flame graph shows O(n^2) merge

alt reviewer accepts fix
  Rev -> Dev : require complexity note + guard test
  Dev -> CI : add max batch + property test
else reviewer misses it
  Rev -> Dev : approve (risk)
  Slo -> Dev : page: p99 SLO breach
end

Slo -> Dev : rollback / feature flag off
@enduml`,
};
