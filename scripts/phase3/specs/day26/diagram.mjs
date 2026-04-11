export default {
  title: "Binary search — invariant on [lo, hi]",
  diagramType: "sequence",
  description: "Engineer, sorted array, mid computation, three-way compare, loop until convergence.",
  plantuml: String.raw`@startuml
title Binary search for exact target

participant "Engineer" as E
participant "sorted\nint[] a" as A
participant "lo/hi\nbounds" as B
participant "mid\nindex" as M
participant "compare\na[mid]:target" as C

E -> B : lo=0 hi=n-1
loop lo <= hi
  E -> M : mid = lo + (hi-lo)/2
  M -> C : read a[mid]
  alt a[mid] == target
    C -> E : return mid
  else a[mid] < target
    C -> B : lo = mid+1
  else
    C -> B : hi = mid-1
  end
end
E -> E : return -1
@enduml`,
};
