export default {
  title: "Generic method invocation — compiler vs JVM",
  diagramType: "sequence",
  description: "Source with type parameters, javac checks and erasure, JVM executes raw-compatible bytecode.",
  plantuml: String.raw`@startuml
title Day 28 — generics compile-time vs runtime

actor Dev as D
participant "javac" as C
participant "Bytecode\n(erased)" as B
participant "JVM" as J
participant "ClassLoader" as L
participant "Verifier" as V

D -> C : submit List<String> source
C -> C : type check bounds\nwildcards
alt erasure applied
  C -> B : generate List\nadd(Object)
else bridge needed
  C -> B : emit bridge method
end
C -> B : write class file
D -> L : load class
L -> V : verify bytecode
V -> J : ready
J -> J : invoke interface\nno String at runtime
note over C,J : Reified checks use\nClass<?> tokens
@enduml`,
};
