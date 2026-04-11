export default {
  title: "Top-down DP — memoized Fibonacci call graph",
  diagramType: "sequence",
  description: "Initial call, cache table, repeated subcalls short-circuit, stack unwinding returns sum.",
  plantuml: String.raw`@startuml
title fib(5) memoized (conceptual)

participant "fib(5)" as F5
participant "memo[]" as M
participant "fib(4)" as F4
participant "fib(3)" as F3
participant "fib(2)" as F2
participant "base\n<=1" as B

F5 -> M : miss -> compute
F5 -> F4 : need fib(4)
F4 -> M : miss
F4 -> F3 : need fib(3)
F3 -> F2 : ...
F2 -> B : return 1/0
F2 -> M : store
F3 -> M : store
F4 -> M : store
F5 -> M : store final

note over M : Second calls hit cache\nno duplicate subtree work
@enduml`,
};
