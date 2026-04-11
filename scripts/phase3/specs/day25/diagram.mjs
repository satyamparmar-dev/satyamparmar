export default {
  title: "PriorityQueue offer — bubble up",
  diagramType: "sequence",
  description: "Caller, heap array, parent index math, comparator, and poll sink.",
  plantuml: String.raw`@startuml
title Min-heap offer (conceptual)

participant "Caller" as C
participant "PriorityQueue" as P
participant "heap[]\nstorage" as A
participant "parent/\nchild idx" as I
participant "Comparator" as Cmp
participant "size" as S

C -> P : offer(x)
P -> S : size++
P -> I : child = size-1
loop while child > 0
  I -> I : parent = (child-1)/2
  P -> Cmp : compare(heap[child], heap[parent])
  alt child < parent (min-heap)
    P -> A : swap child/parent
    I -> I : child = parent
  else stop
end
@enduml`,
};
