export default [
  {
    "level": "basic",
    "category": "theory",
    "question": "[Microservices & DDD] A **bounded context** defines:",
    "options": {
      "A": "A model boundary with one ubiquitous language",
      "B": "A JVM package only",
      "C": "A K8s namespace only",
      "D": "A CSS file"
    },
    "answer": "A",
    "explanation": "Terms mean one thing inside the context."
  },
  {
    "level": "basic",
    "category": "code",
    "question": "[Microservices & DDD] An **aggregate root** enforces:",
    "options": {
      "A": "Invariants for a cluster of entities",
      "B": "HTTP caching",
      "C": "TLS handshakes",
      "D": "DNS TTL"
    },
    "answer": "A",
    "explanation": "External updates go through the root."
  },
  {
    "level": "basic",
    "category": "scenario",
    "question": "[Microservices & DDD] A **domain event** represents:",
    "options": {
      "A": "Something that happened in the domain",
      "B": "A JVM GC event",
      "C": "A log4j line",
      "D": "A CSS transition"
    },
    "answer": "A",
    "explanation": "Past tense facts for integration."
  },
  {
    "level": "basic",
    "category": "theory",
    "question": "[Microservices & DDD] **Ubiquitous language** should appear in:",
    "options": {
      "A": "Code, conversations, and docs consistently",
      "B": "Only marketing",
      "C": "Only DB column names without code",
      "D": "Comments only"
    },
    "answer": "A",
    "explanation": "Aligns business and engineering."
  },
  {
    "level": "basic",
    "category": "code",
    "question": "[Microservices & DDD] **Anti-Corruption Layer** protects:",
    "options": {
      "A": "Your domain from foreign models",
      "B": "Only TLS certs",
      "C": "Only Redis keys",
      "D": "Only Maven repos"
    },
    "answer": "A",
    "explanation": "Translate legacy/partner models inward."
  },
  {
    "level": "basic",
    "category": "scenario",
    "question": "[Microservices & DDD] **Context mapping** describes:",
    "options": {
      "A": "Relationships between bounded contexts",
      "B": "TCP window size",
      "C": "JWT expiry math",
      "D": "CSS grid"
    },
    "answer": "A",
    "explanation": "Partnership, customer/supplier, etc."
  },
  {
    "level": "basic",
    "category": "theory",
    "question": "[Microservices & DDD] **Entity** vs **value object**:",
    "options": {
      "A": "Entity has identity; VO is defined by attributes",
      "B": "Same thing",
      "C": "VO must be mutable",
      "D": "Entity cannot change"
    },
    "answer": "A",
    "explanation": "Classic DDD distinction."
  },
  {
    "level": "basic",
    "category": "code",
    "question": "[Microservices & DDD] **Repository** abstracts:",
    "options": {
      "A": "Aggregate persistence",
      "B": "HTTP status codes",
      "C": "Thread pools",
      "D": "YAML indentation"
    },
    "answer": "A",
    "explanation": "Domain speaks to persistence through repository."
  },
  {
    "level": "basic",
    "category": "scenario",
    "question": "[Microservices & DDD] **Domain service** fits when:",
    "options": {
      "A": "Logic spans multiple aggregates",
      "B": "Simple CRUD on one table",
      "C": "Rendering HTML",
      "D": "Configuring logback"
    },
    "answer": "A",
    "explanation": "Not naturally on one entity."
  },
  {
    "level": "basic",
    "category": "theory",
    "question": "[Microservices & DDD] **Application service** orchestrates:",
    "options": {
      "A": "Use cases and transactions",
      "B": "CPU scheduling",
      "C": "SSL stapling",
      "D": "Git merges"
    },
    "answer": "A",
    "explanation": "Thin layer over domain."
  },
  {
    "level": "intermediate",
    "category": "code",
    "question": "[Microservices & DDD] Splitting services by **team boundary** follows:",
    "options": {
      "A": "Conway alignment",
      "B": "RFC 4180",
      "C": "ACID only",
      "D": "JPEG"
    },
    "answer": "A",
    "explanation": "Autonomy should match org structure."
  },
  {
    "level": "intermediate",
    "category": "scenario",
    "question": "[Microservices & DDD] **Shared kernel** means:",
    "options": {
      "A": "Explicitly shared subset between contexts",
      "B": "Copy-paste all code",
      "C": "One giant DB for everyone",
      "D": "No tests"
    },
    "answer": "A",
    "explanation": "Tightly coordinated shared model slice."
  },
  {
    "level": "intermediate",
    "category": "theory",
    "question": "[Microservices & DDD] **Customer/supplier** context relation:",
    "options": {
      "A": "Upstream prioritizes downstream needs",
      "B": "No communication",
      "C": "Random coupling",
      "D": "Same database always"
    },
    "answer": "A",
    "explanation": "Directed dependency with negotiation."
  },
  {
    "level": "intermediate",
    "category": "code",
    "question": "[Microservices & DDD] **Conformist** pattern accepts:",
    "options": {
      "A": "Upstream model as-is",
      "B": "Infinite retry without DLQ",
      "C": "HTTP/0.9",
      "D": "Lossy UDP for money"
    },
    "answer": "A",
    "explanation": "When influence is low; avoid fighting their model."
  },
  {
    "level": "intermediate",
    "category": "scenario",
    "question": "[Microservices & DDD] **ACL** translation belongs at:",
    "options": {
      "A": "Boundary of the integrating context",
      "B": "Every controller",
      "C": "Database trigger only",
      "D": "CDN edge only"
    },
    "answer": "A",
    "explanation": "Contain foreign concepts at the edge."
  },
  {
    "level": "intermediate",
    "category": "theory",
    "question": "[Microservices & DDD] **Strategic design** focuses on:",
    "options": {
      "A": "Context boundaries and relationships",
      "B": "Indentation style",
      "C": "Logo colors",
      "D": "CPU GHz"
    },
    "answer": "A",
    "explanation": "Before tactical patterns."
  },
  {
    "level": "intermediate",
    "category": "code",
    "question": "[Microservices & DDD] **Tactical patterns** include:",
    "options": {
      "A": "Aggregates, entities, VOs, factories",
      "B": "Only REST verbs",
      "C": "Only Kafka",
      "D": "Only GraphQL"
    },
    "answer": "A",
    "explanation": "Building blocks inside a context."
  },
  {
    "level": "intermediate",
    "category": "scenario",
    "question": "[Microservices & DDD] **Factory** in DDD helps when:",
    "options": {
      "A": "Aggregate creation is non-trivial",
      "B": "You deploy to factory hardware",
      "C": "You use Spring @Bean only",
      "D": "You parse CSV"
    },
    "answer": "A",
    "explanation": "Encapsulate complex construction."
  },
  {
    "level": "intermediate",
    "category": "theory",
    "question": "[Microservices & DDD] **Invariant** is:",
    "options": {
      "A": "A rule that must always hold for the model",
      "B": "A JVM flag",
      "C": "A HTTP header",
      "D": "A CSS variable"
    },
    "answer": "A",
    "explanation": "Enforced inside aggregate boundaries."
  },
  {
    "level": "intermediate",
    "category": "code",
    "question": "[Microservices & DDD] **Event storming** is a workshop technique to:",
    "options": {
      "A": "Discover domains and events quickly",
      "B": "Tune GC",
      "C": "Design PCBs",
      "D": "Write protobuf by hand"
    },
    "answer": "A",
    "explanation": "Collaborative exploration."
  },
  {
    "level": "advanced",
    "category": "scenario",
    "question": "[Microservices & DDD] **Read model** in CQRS-style split:",
    "options": {
      "A": "Optimized for queries",
      "B": "Same as write always",
      "C": "Forbidden",
      "D": "Only for batch"
    },
    "answer": "A",
    "explanation": "Can diverge from write schema."
  },
  {
    "level": "advanced",
    "category": "theory",
    "question": "[Microservices & DDD] **Domain experts** should:",
    "options": {
      "A": "Validate language and rules",
      "B": "Never talk to engineers",
      "C": "Write all code",
      "D": "Skip reviews"
    },
    "answer": "A",
    "explanation": "Partnership in modeling."
  },
  {
    "level": "advanced",
    "category": "code",
    "question": "[Microservices & DDD] **Anemic domain model** anti-pattern:",
    "options": {
      "A": "Entities are data bags; logic elsewhere",
      "B": "Rich behavior everywhere",
      "C": "Too many events",
      "D": "Too many aggregates"
    },
    "answer": "A",
    "explanation": "Behavior scattered in services."
  },
  {
    "level": "advanced",
    "category": "scenario",
    "question": "[Microservices & DDD] **Published language** is:",
    "options": {
      "A": "A well-defined interchange between contexts",
      "B": "Random JSON",
      "C": "Private class fields",
      "D": "TCP MSS"
    },
    "answer": "A",
    "explanation": "Contract for integration."
  },
  {
    "level": "advanced",
    "category": "theory",
    "question": "[Microservices & DDD] **Open host service** exposes:",
    "options": {
      "A": "A generic API for many consumers",
      "B": "Internal only RPC",
      "C": "Raw SQL port",
      "D": "Git protocol"
    },
    "answer": "A",
    "explanation": "Optional integration point."
  },
  {
    "level": "advanced",
    "category": "code",
    "question": "[Microservices & DDD] **Big ball of mud** signals:",
    "options": {
      "A": "Unclear boundaries and coupling",
      "B": "Clean architecture",
      "C": "Perfect DDD",
      "D": "No database"
    },
    "answer": "A",
    "explanation": "Candidate for refactoring/strangulation."
  },
  {
    "level": "advanced",
    "category": "scenario",
    "question": "[Microservices & DDD] **Core domain** deserves:",
    "options": {
      "A": "Best people and careful design",
      "B": "Lowest attention",
      "C": "No tests",
      "D": "Copy from blog"
    },
    "answer": "A",
    "explanation": "Competitive differentiator."
  },
  {
    "level": "advanced",
    "category": "theory",
    "question": "[Microservices & DDD] **Supporting subdomain** is:",
    "options": {
      "A": "Important but not differentiating",
      "B": "Core always",
      "C": "Generic always",
      "D": "Ignored"
    },
    "answer": "A",
    "explanation": "May buy vs build."
  },
  {
    "level": "advanced",
    "category": "code",
    "question": "[Microservices & DDD] **Generic subdomain** often:",
    "options": {
      "A": "Uses off-the-shelf solutions",
      "B": "Is the secret sauce",
      "C": "Needs event sourcing always",
      "D": "Avoids APIs"
    },
    "answer": "A",
    "explanation": "CRUD HR, auth vendor, etc."
  },
  {
    "level": "advanced",
    "category": "scenario",
    "question": "[Microservices & DDD] **Context boundary** in microservices:",
    "options": {
      "A": "Prefer service per context when autonomy warrants",
      "B": "Always 1 service globally",
      "C": "Never split",
      "D": "Same as JVM"
    },
    "answer": "A",
    "explanation": "Match deployment to boundaries deliberately."
  }
];
