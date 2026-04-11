export default {
  title: "OpenAPI artefacts through CI, gateway, and consumers",
  diagramType: "component",
  description: "Shows how emitted or hand-written OpenAPI flows through CI lint/diff gates, release artefact storage, gateway-enforced traffic, and consumer SDKs.",
  plantuml: "@startuml\ntitle Day 50 - OpenAPI in CI/CD and runtime\nactor Developer\nparticipant \"Git / PR\" as Git\nparticipant \"CI (Spectral + diff)\" as CI\nartifact \"openapi.json\n(release baseline)\" as Art\nparticipant \"Artifact repo\" as AR\nparticipant \"API Gateway\" as GW\nparticipant \"Spring Boot\n+ springdoc\" as App\nactor \"Consumer / SDK\" as Client\n\nDeveloper -> Git : commit controller + DTO changes\nGit -> CI : run build\nCI -> App : emit /v3/api-docs (or use static OAS)\nCI -> Art : diff vs baseline from AR\nCI -> Developer : fail on breaking change or style violations\nDeveloper -> AR : publish tagged spec on release\nClient -> GW : OAuth2 + rate limits\nGW -> App : routed traffic\nApp --> Client : JSON + Problem Details\nnote right of CI\n  Spectral rules + openapi-diff + optional Pact verify\nend note\n@enduml",
};
