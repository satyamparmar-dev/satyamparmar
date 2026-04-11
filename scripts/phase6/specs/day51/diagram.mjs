export default {
  title: "Flow — bounded contexts, outbox, and async integration",
  diagramType: "component",
  description: "Shows one area saving its own database and writing an outbox row, then a message fan-out updating another area’s database without sharing tables.",
  plantuml: "@startuml\ntitle Day 51 — One area saves, outbox sends, another area catches up\nactor Client\nparticipant \"Order API\\n(one business area)\" as Orders\nparticipant \"Inventory API\\n(another area)\" as Inv\ndatabase \"Orders DB\" as ODB\nqueue \"Message Bus\" as Bus\nparticipant \"Shipping\\n(read/update)\" as Ship\ndatabase \"Shipping DB\" as SDB\n\nClient -> Orders : POST /orders\nOrders -> Inv : reserve (sync call + timeout)\nInv --> Orders : OK\nOrders -> ODB : save order + insert outbox row\nOrders --> Client : 201 Created\n\nOrders -> Bus : publisher sends OrderPlaced\nBus -> Ship : message may arrive more than once\nShip -> SDB : safe upsert (idempotent)\n\nnote right of Orders\n  No shared JPA entities\n  across areas\nend note\nnote bottom of Bus\n  Consumers must ignore\n  duplicates safely\nend note\n@enduml",
};
