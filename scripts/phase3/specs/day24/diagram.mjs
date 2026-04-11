export default {
  title: "Binary tree BFS — queue of frontier",
  diagramType: "sequence",
  description: "Root enqueues children; queue drains level sizes; interviewer asks space O(width).",
  plantuml: String.raw`@startuml
title Level-order traversal

participant "main" as M
participant "Queue<Node>" as Q
participant "current\nnode" as C
participant "result\nlists" as R
participant "left child" as L
participant "right child" as Rt

M -> Q : offer root
loop while queue not empty
  M -> Q : snapshot size = level width
  loop for each in level
    Q -> C : poll
    C -> R : append value
    alt left exists
      C -> L : enqueue left
    end
    alt right exists
      C -> Rt : enqueue right
    end
  end
end
@enduml`,
};
