export default {
  title: "Lambda capture and SAM invocation",
  diagramType: "sequence",
  description: "Compiler captures values, bootstrap builds CallSite, target method invoked.",
  plantuml: String.raw`@startuml
title Day 29 — lambda runtime path

participant Dev as D
participant "javac" as C
participant "Bytecode\ninvokedynamic" as B
participant "LambdaMetafactory" as M
participant "CallSite" as S
participant "JVM" as J

D -> C : lambda in stream pipeline
C -> B : invokedynamic\nfunctional interface
B -> M : bootstrap linkage
M -> S : install target
loop pipeline ops
  J -> S : invoke SAM
  S -> J : forwarded to\ninstance/static method
end
note over M,S : Captured locals\nstored in synthetic fields
@enduml`,
};
