export default {
  title: "Orchestrated saga with compensations",
  diagramType: "component",
  description: "Coordinator drives forward steps; failures trigger reverse compensations.",
  plantuml: "@startuml\ntitle Day 56 — Saga compensation\nparticipant Orchestrator\nparticipant Inventory\nparticipant Payments\n\nOrchestrator -> Inventory : reserve\nInventory --> Orchestrator : ok\nOrchestrator -> Payments : capture\nPayments --> Orchestrator : ok\nOrchestrator -> Inventory : ship\nInventory --> Orchestrator : fail\nOrchestrator -> Payments : refund (compensate)\nOrchestrator -> Inventory : release (compensate)\n@enduml",
};
