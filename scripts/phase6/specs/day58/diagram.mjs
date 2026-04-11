export default {
  title: "Strangler with ACL in front of legacy",
  diagramType: "component",
  description: "New service receives traffic slice; ACL adapts legacy when needed.",
  plantuml: "@startuml\ntitle Day 58 — Strangler + ACL\nactor Client\nparticipant Gateway\nparticipant \"New Service\" as NS\nparticipant ACL\nparticipant \"Legacy Monolith\" as L\n\nClient -> Gateway : /orders\nGateway -> NS : 10% traffic\nGateway -> L : 90% traffic\nNS -> ACL : needs legacy pricing\nACL -> L : SOAP/REST legacy call\nACL --> NS : domain PriceQuote\n@enduml",
};
