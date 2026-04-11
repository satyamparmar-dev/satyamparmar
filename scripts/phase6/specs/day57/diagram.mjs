export default {
  title: "CQRS write path vs projection consumers",
  diagramType: "component",
  description: "Command persists events; projector updates read store asynchronously.",
  plantuml: "@startuml\ntitle Day 57 — CQRS flow\nactor User\nparticipant CommandAPI\ndatabase EventStore\nqueue Bus\nparticipant Projector\ndatabase ReadDB\n\nUser -> CommandAPI : PlaceOrder command\nCommandAPI -> EventStore : append OrderPlaced\nCommandAPI -> User : 202 Accepted\nBus -> Projector : OrderPlaced\nProjector -> ReadDB : upsert order_view\n@enduml",
};
