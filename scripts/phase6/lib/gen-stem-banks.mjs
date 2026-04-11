import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GW, RES, RPC, MSG, SAGA, CQRS, ACL } from "./stemBanksTopic.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function Q(q, A, B, C, D, ans, e) {
  return { q, A, B, C, D, ans, e };
}

const OPENAPI = [
  Q("OpenAPI **operationId** should be:", "Unique per document", "Shared across paths", "Optional always", "Same as path", "A", "Duplicate operationIds break generators and gateway routing."),
  Q("**components.schemas** holds:", "Reusable schema definitions", "Only paths", "Server URLs", "Security only", "A", "Schemas are referenced by $ref from request/response models."),
  Q("Adding a **new optional** JSON field is usually:", "Non-breaking", "Breaking", "Illegal in OpenAPI", "Requires new protocol", "A", "Optional additive fields preserve compatibility."),
  Q("Removing a **required** response field is:", "Breaking", "Always safe", "Ignored by clients", "Only cosmetic", "A", "Consumers may depend on required fields."),
  Q("**nullable: true** means:", "Value may be null", "Field must be absent", "Same as required false", "Forbidden in JSON", "A", "Nullability is explicit in OpenAPI 3."),
  Q("**Spectral** is often used to:", "Lint OpenAPI for style and errors", "Run JVM bytecode", "Compile protobuf", "Replace HTTP", "A", "Spectral enforces API design rules in CI."),
  Q("**openapi-diff** in CI helps catch:", "Breaking contract changes", "CSS issues", "Kubernetes versions", "JWT signing only", "A", "Compare baselines to PR artifacts."),
  Q("**examples** on schemas help:", "Client understanding and tests", "Hide endpoints", "Disable auth", "Remove versioning", "A", "Examples document realistic payloads."),
  Q("**servers** array documents:", "Base URLs per environment", "Java packages", "DB indexes", "Thread pools", "A", "Clients know where to call."),
  Q("**securitySchemes** describe:", "Auth mechanisms (Bearer, OAuth2, etc.)", "CPU limits", "Pagination cursors", "SQL plans", "A", "Apply via security requirements on operations."),
  Q("**tags** group operations for:", "Documentation navigation", "TLS ciphers", "Heap dumps", "GC tuning", "A", "Swagger UI and team ownership."),
  Q("**$ref** to another file enables:", "Modular spec splitting", "Faster DNS", "UDP transport", "Binary only APIs", "A", "Split domains while composing one doc."),
  Q("**deprecated: true** on an operation signals:", "Consumers should migrate", "Immediate removal", "404 always", "Server crash", "A", "Pair with sunset policy and comms."),
  Q("**oneOf** in schema means:", "Exactly one variant matches", "All variants required", "No JSON allowed", "Unlimited any", "A", "Discriminated unions need clear mapping."),
  Q("**format: uuid** on string suggests:", "UUID-shaped strings", "16-bit int", "Base64 blob mandatory", "XML only", "A", "Validation hint; still a string type."),
  Q("**responses.default** captures:", "Unlisted status codes", "Only 200", "Only 5xx", "CORS", "A", "Fallback documentation for unexpected codes."),
  Q("**requestBody** **required: true** means:", "Client must send body", "Body forbidden", "Body ignored", "Only GET", "A", "Missing body fails validation."),
  Q("**parameters** **in: path** are:", "Substituted into the path template", "Always query strings", "Headers only", "Cookies only", "A", "Path params are part of the URL."),
  Q("**content** map under responses keys:", "Media types (application/json)", "SQL dialects", "JVM flags", "File inode", "A", "Each media type can have its own schema."),
  Q("**allOf** composes schemas by:", "Merging constraints", "Picking random fields", "Deleting properties", "Disabling TLS", "A", "Used for composition and inheritance patterns."),
  Q("**enum** on string restricts:", "Allowed string values", "HTTP version", "TCP port", "Thread count", "A", "Invalid enum values fail validation."),
  Q("**minLength** / **maxLength** validate:", "String lengths", "Array capacity only", "CPU usage", "Latency SLO", "A", "String constraints for inputs."),
  Q("**additionalProperties: false** means:", "No extra properties beyond defined", "Any property allowed", "Only XML", "Disable caching", "A", "Strict object shape for clients."),
  Q("**callbacks** describe:", "Async out-of-band requests the API may initiate", "Sync JDBC", "Heap snapshots", "DNS TTL", "A", "Webhook-style contracts."),
  Q("**links** (OpenAPI links) help with:", "Discovering related calls", "Packet fragmentation", "Kernel modules", "ZIP compression", "A", "Hypermedia-lite navigation in docs."),
  Q("**API first** design means:", "Spec agreed before implementation drift", "Code then never document", "No reviews", "Only SOAP", "A", "Contract drives parallel client/server work."),
  Q("**GroupedOpenApi** (springdoc) can:", "Split docs by paths/packages", "Disable TLS", "Replace Feign", "Compile C++", "A", "Multiple OpenAPI groups per app."),
  Q("**version** field in **info** is:", "Semantic API version string", "JVM major only", "Git hash required", "Random token", "A", "Communicates release to consumers."),
  Q("**contact** and **license** in **info** aid:", "Governance and support", "Packet routing", "Thread pinning", "SQL hints", "A", "Ownership and legal clarity."),
  Q("**externalDocs** points to:", "More documentation outside the spec", "Internal heap dump", "Binary plist", "Kernel log", "A", "Deep links for human readers."),
];

const DDD = [
  Q("A **bounded context** defines:", "A model boundary with one ubiquitous language", "A JVM package only", "A K8s namespace only", "A CSS file", "A", "Terms mean one thing inside the context."),
  Q("An **aggregate root** enforces:", "Invariants for a cluster of entities", "HTTP caching", "TLS handshakes", "DNS TTL", "A", "External updates go through the root."),
  Q("A **domain event** represents:", "Something that happened in the domain", "A JVM GC event", "A log4j line", "A CSS transition", "A", "Past tense facts for integration."),
  Q("**Ubiquitous language** should appear in:", "Code, conversations, and docs consistently", "Only marketing", "Only DB column names without code", "Comments only", "A", "Aligns business and engineering."),
  Q("**Anti-Corruption Layer** protects:", "Your domain from foreign models", "Only TLS certs", "Only Redis keys", "Only Maven repos", "A", "Translate legacy/partner models inward."),
  Q("**Context mapping** describes:", "Relationships between bounded contexts", "TCP window size", "JWT expiry math", "CSS grid", "A", "Partnership, customer/supplier, etc."),
  Q("**Entity** vs **value object**:", "Entity has identity; VO is defined by attributes", "Same thing", "VO must be mutable", "Entity cannot change", "A", "Classic DDD distinction."),
  Q("**Repository** abstracts:", "Aggregate persistence", "HTTP status codes", "Thread pools", "YAML indentation", "A", "Domain speaks to persistence through repository."),
  Q("**Domain service** fits when:", "Logic spans multiple aggregates", "Simple CRUD on one table", "Rendering HTML", "Configuring logback", "A", "Not naturally on one entity."),
  Q("**Application service** orchestrates:", "Use cases and transactions", "CPU scheduling", "SSL stapling", "Git merges", "A", "Thin layer over domain."),
  Q("Splitting services by **team boundary** follows:", "Conway alignment", "RFC 4180", "ACID only", "JPEG", "A", "Autonomy should match org structure."),
  Q("**Shared kernel** means:", "Explicitly shared subset between contexts", "Copy-paste all code", "One giant DB for everyone", "No tests", "A", "Tightly coordinated shared model slice."),
  Q("**Customer/supplier** context relation:", "Upstream prioritizes downstream needs", "No communication", "Random coupling", "Same database always", "A", "Directed dependency with negotiation."),
  Q("**Conformist** pattern accepts:", "Upstream model as-is", "Infinite retry without DLQ", "HTTP/0.9", "Lossy UDP for money", "A", "When influence is low; avoid fighting their model."),
  Q("**ACL** translation belongs at:", "Boundary of the integrating context", "Every controller", "Database trigger only", "CDN edge only", "A", "Contain foreign concepts at the edge."),
  Q("**Strategic design** focuses on:", "Context boundaries and relationships", "Indentation style", "Logo colors", "CPU GHz", "A", "Before tactical patterns."),
  Q("**Tactical patterns** include:", "Aggregates, entities, VOs, factories", "Only REST verbs", "Only Kafka", "Only GraphQL", "A", "Building blocks inside a context."),
  Q("**Factory** in DDD helps when:", "Aggregate creation is non-trivial", "You deploy to factory hardware", "You use Spring @Bean only", "You parse CSV", "A", "Encapsulate complex construction."),
  Q("**Invariant** is:", "A rule that must always hold for the model", "A JVM flag", "A HTTP header", "A CSS variable", "A", "Enforced inside aggregate boundaries."),
  Q("**Event storming** is a workshop technique to:", "Discover domains and events quickly", "Tune GC", "Design PCBs", "Write protobuf by hand", "A", "Collaborative exploration."),
  Q("**Read model** in CQRS-style split:", "Optimized for queries", "Same as write always", "Forbidden", "Only for batch", "A", "Can diverge from write schema."),
  Q("**Domain experts** should:", "Validate language and rules", "Never talk to engineers", "Write all code", "Skip reviews", "A", "Partnership in modeling."),
  Q("**Anemic domain model** anti-pattern:", "Entities are data bags; logic elsewhere", "Rich behavior everywhere", "Too many events", "Too many aggregates", "A", "Behavior scattered in services."),
  Q("**Published language** is:", "A well-defined interchange between contexts", "Random JSON", "Private class fields", "TCP MSS", "A", "Contract for integration."),
  Q("**Open host service** exposes:", "A generic API for many consumers", "Internal only RPC", "Raw SQL port", "Git protocol", "A", "Optional integration point."),
  Q("**Big ball of mud** signals:", "Unclear boundaries and coupling", "Clean architecture", "Perfect DDD", "No database", "A", "Candidate for refactoring/strangulation."),
  Q("**Core domain** deserves:", "Best people and careful design", "Lowest attention", "No tests", "Copy from blog", "A", "Competitive differentiator."),
  Q("**Supporting subdomain** is:", "Important but not differentiating", "Core always", "Generic always", "Ignored", "A", "May buy vs build."),
  Q("**Generic subdomain** often:", "Uses off-the-shelf solutions", "Is the secret sauce", "Needs event sourcing always", "Avoids APIs", "A", "CRUD HR, auth vendor, etc."),
  Q("**Context boundary** in microservices:", "Prefer service per context when autonomy warrants", "Always 1 service globally", "Never split", "Same as JVM", "A", "Match deployment to boundaries deliberately."),
];

const BANK = { openapi: OPENAPI, ddd: DDD, gw: GW, res: RES, rpc: RPC, msg: MSG, saga: SAGA, cqrs: CQRS, acl: ACL };
fs.writeFileSync(path.join(__dirname, "mcqStemBanks.json"), JSON.stringify(BANK, null, 2));
console.log("wrote mcqStemBanks.json", Object.keys(BANK));
