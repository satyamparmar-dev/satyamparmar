export default {
  title: "gRPC and GraphQL in a typical platform",
  diagramType: "component",
  description: "Public GraphQL/REST edge, internal gRPC mesh, federation gateway optional.",
  plantuml: "@startuml\ntitle Day 54 — Edge vs internal protocols\nactor Mobile\nparticipant \"API Gateway\" as GW\nparticipant \"GraphQL\" as GQL\nparticipant \"gRPC Payments\" as PAY\nMobile -> GW : HTTPS JSON / GraphQL\nGW -> GQL : /graphql\nGQL -> PAY : gRPC Charge unary\nPAY --> GQL : protobuf reply\nGQL --> Mobile : JSON data + errors[]\n@enduml",
};
