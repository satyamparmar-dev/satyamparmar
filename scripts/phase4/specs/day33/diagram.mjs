export default {
  title: "Switch type dispatch with patterns",
  diagramType: "sequence",
  description: "Runtime selects matching case; pattern binds variables; result returned.",
  plantuml: String.raw`@startuml
title Day 33 — switch on object

participant Client as C
participant "Switch\nselector" as S
participant "Pattern\nInteger" as I
participant "Pattern\nString" as T
participant "Pattern\nList" as L
participant Default as D

C -> S : value
alt Integer
  S -> I : bind i
  I --> C : branch A
else String
  S -> T : bind s
  T --> C : branch B
else List
  S -> L : bind list
  L --> C : branch C
else
  S -> D : default
  D --> C : branch D
end
@enduml`,
};
