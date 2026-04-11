export default {
  title: "Sealed hierarchy and exhaustive switch",
  diagramType: "sequence",
  description: "Compiler knows permitted subtypes; switch covers all; refactor breaks compile if new subtype missing.",
  plantuml: String.raw`@startuml
title Day 32 — sealed + switch check

participant Dev as D
participant "javac\nsealed graph" as C
participant "Switch\ncoverage" as S
participant "New subtype" as N
participant Review as R
participant CI as I

D -> C : declare permits A,B
C -> S : verify patterns
D -> S : switch cases
alt missing case when adding C
  N -> C : add permits C
  C -> I : compile fails
  I -> R : fix switch
else complete
  S -> I : green build
end
@enduml`,
};
