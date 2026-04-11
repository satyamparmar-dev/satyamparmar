export default {
  title: "Request flow — edge gateway to Kubernetes Service",
  diagramType: "component",
  description: "Shows TLS and JWT at the gateway, routing to a cluster Service name, and kube-proxy fan-out to ready pod IPs.",
  plantuml: "@startuml\ntitle Day 52 — Internet client through gateway to pods\nactor Client\nparticipant \"API Gateway\\n(L7)\" as GW\nparticipant \"CoreDNS\" as DNS\nparticipant \"payments Service\" as SVC\nparticipant \"Pod A\" as P1\nparticipant \"Pod B\" as P2\n\nClient -> GW : HTTPS /api/payments/42 + Bearer JWT\nGW -> GW : validate JWT, rate limit, add trace headers\nGW -> DNS : resolve payments.prod.svc.cluster.local\nDNS --> GW : ClusterIP\nGW -> SVC : HTTP to ClusterIP:8080\nSVC -> P1 : kube-proxy / CNI picks Ready endpoint\nP1 --> GW : 200 JSON\nGW --> Client : 200 JSON\n\nnote right of GW\n  Gateway owns edge policy;\n  Kubernetes owns endpoint set\nend note\n@enduml",
};
