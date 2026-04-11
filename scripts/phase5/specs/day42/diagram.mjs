export default {
  title: "Spring Boot startup",
  diagramType: "sequence",
  description: "Framework flow for day 42.",
  plantuml: String.raw`@startuml
title Day 42 — Boot startup

participant Main as M
participant SpringApp as S
participant Env as E
participant Ctx as C
participant Auto as A

M -> S : run
S -> E : prepareEnvironment
S -> C : refreshContext
C -> A : load auto-config
A --> C : register beans
C --> S : started
@enduml`,
};
