export default {
  title: "HashMap put — hash, bucket, resolve",
  diagramType: "sequence",
  description: "Caller, key object, hash function, bucket array, collision chain, and map API.",
  plantuml: String.raw`@startuml
title HashMap put flow (conceptual)

participant "Caller" as C
participant "key" as K
participant "hashCode()\n& spread" as H
participant "bucket[]\ntable" as T
participant "Entry\nchain/tree" as E
participant "Map API" as M

C -> M : put(k,v)
M -> K : hashCode()
K -> H : mix bits
H -> T : index = (n-1) & hash
alt bucket empty
  T -> E : new node
else collision
  T -> E : equals scan / treeify
end
E -> M : assign value
M -> C : previous value / null

note right of E : Worst case long chains\ndegrade unless treeified
@enduml`,
};
