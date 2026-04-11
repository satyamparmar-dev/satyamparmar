export default {
  title: "Reverse linked list — pointer rewiring",
  diagramType: "sequence",
  description: "Engineer, curr node, prev, next, and heap illustrate three-pointer iterative reverse.",
  plantuml: String.raw`@startuml
title Iterative reverse — pointer discipline

participant "Engineer" as E
participant "curr" as C
participant "prev" as P
participant "next" as N
participant "heap\n(Node objects)" as H
participant "Interviewer" as I

E -> C : start at head
E -> P : prev = null

loop while curr != null
  E -> N : nxt = curr.next
  E -> C : curr.next = prev
  E -> P : prev = curr
  E -> C : curr = nxt
  H -> H : no new nodes; relink only
end

E -> I : return prev as new head
I -> E : follow-up: recursion stack cost?
@enduml`,
};
