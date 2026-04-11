export default {
  title: "Two pointers — sorted array pair search",
  diagramType: "sequence",
  description:
    "Engineer, array buffer, left pointer, right pointer, sum comparator, and interviewer trace a monotone walk.",
  plantuml: String.raw`@startuml
title Two pointers on sorted data

participant "Engineer" as E
participant "Sorted\nint[] a" as A
participant "left\nindex i" as L
participant "right\nindex j" as R
participant "sum\ncompare" as S
participant "Interviewer" as I

E -> A : read length n, empty check
E -> L : i = 0
E -> R : j = n-1

loop while i < j
  E -> S : s = a[i]+a[j]
  alt s < target
    S -> L : i++ (need larger sum)
  else s > target
    S -> R : j-- (need smaller sum)
  else s == target
    S -> I : report pair (i,j)
  end
end

I -> E : follow-up: duplicates? overflow?
@enduml`,
};
