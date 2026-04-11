export default {
  title: "Singleton bean creation and init pipeline",
  diagramType: "sequence",
  description: "Container instantiates, injects, runs BPP and init callbacks, exposes proxy.",
  plantuml: String.raw`@startuml
title Day 39 — bean lifecycle

participant Client as C
participant Container as T
participant Bean as B
participant BPP as P
participant Injector as I
participant Init as N

C -> T : getBean
T -> B : instantiate
T -> I : autowire deps
I -> B : populate fields/setters
T -> P : postProcessBeforeInitialization
P -> B : wrap optional
T -> N : @PostConstruct
N -> B : callback
T -> N : InitializingBean
T -> N : initMethod
T -> P : postProcessAfterInitialization
P -> B : AOP proxy
T --> C : singleton ready
@enduml`,
};
