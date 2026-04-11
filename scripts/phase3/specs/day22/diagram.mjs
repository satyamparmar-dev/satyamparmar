export default {
  title: "Balanced parentheses — stack protocol",
  diagramType: "sequence",
  description: "Parser, char stream, stack store, matcher, and error reporter for bracket protocol.",
  plantuml: String.raw`@startuml
title Parentheses validation with stack

participant "Parser" as P
participant "char[]\ninput" as I
participant "ArrayDeque\nstack" as S
participant "match()\nrules" as M
participant "Result" as R
participant "Caller" as C

C -> P : validate(s)
loop each char c
  P -> I : read c
  alt c is opener
    P -> S : push(c)
  else c is closer
    P -> S : pop() ? empty
    S -> M : check pairs
    alt mismatch / empty
      M -> R : false
    end
  end
end
P -> S : must be empty
S -> R : true/false
R -> C : balanced?
@enduml`,
};
