export default {
  title: "DispatcherServlet dispatch",
  diagramType: "sequence",
  description: "Framework flow for day 41.",
  plantuml: String.raw`@startuml
title Day 41 — MVC dispatch

participant Browser as B
participant DS as D
participant HM as H
participant Ctrl as C
participant View as V

B -> D : HTTP
D -> H : lookup handler
H -> C : invoke
C --> D : model/entity
D -> V : optional view
D --> B : response
@enduml`,
};
