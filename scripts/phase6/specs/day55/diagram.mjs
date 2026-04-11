export default {
  title: "Outbox to broker to consumers",
  diagramType: "component",
  description: "Order service writes DB+outbox; relay publishes; consumers process idempotently.",
  plantuml: "@startuml\ntitle Day 55 — Reliable async emission\ndatabase MonolithDB\nparticipant OrderSvc\nparticipant OutboxRelay\nqueue Broker\nparticipant Inventory\n\nOrderSvc -> MonolithDB : TX: insert order + outbox row\nOutboxRelay -> MonolithDB : poll unpublished rows\nOutboxRelay -> Broker : publish OrderPlaced\nInventory -> Broker : consume + idempotent reserve\n@enduml",
};
