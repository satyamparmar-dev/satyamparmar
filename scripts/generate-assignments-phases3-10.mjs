import fs from 'fs';
import path from 'path';
import {
  PHASE7_SOLUTIONS_BY_DAY,
  PHASE9_SOLUTIONS_BY_DAY,
} from './assignment-solutions-phase7-9.mjs';

const OUT_DIR = path.join(process.cwd(), 'public', 'data');

/** Third pass: interview-real solutions + optional coding overrides for phases 7 and 9 */
function mergeRichSolutions(phase, day, questions) {
  const map =
    phase === 7 ? PHASE7_SOLUTIONS_BY_DAY : phase === 9 ? PHASE9_SOLUTIONS_BY_DAY : null;
  if (!map) return questions;
  const entry = map[String(day)];
  if (!entry) return questions;
  const keys = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'];
  return questions.map((q, i) => {
    const raw = entry[keys[i]];
    if (raw == null) return q;
    if (i === 3 && typeof raw === 'object' && raw.solution) {
      return {
        ...q,
        solution: raw.solution,
        ...(raw.codeTemplate != null ? { codeTemplate: raw.codeTemplate } : {}),
        ...(raw.expectedOutput != null ? { expectedOutput: raw.expectedOutput } : {}),
      };
    }
    if (typeof raw === 'string') {
      return { ...q, solution: raw };
    }
    return q;
  });
}

const PHASES = [
  {
    phase: 3,
    title: 'Phase 3 · Data Structures & Algorithms',
    difficulty: 'Intermediate',
    days: [
      [19, 'Complexity Analysis', 'Measure runtime growth empirically with arrays of size 100, 1000, 10000.'],
      [20, 'Arrays and Two Pointers', 'Find pair that sums to target in a sorted array (two pointers).'],
      [21, 'Linked Lists', 'Reverse a linked list iteratively.'],
      [22, 'Stacks and Queues', 'Evaluate balanced parentheses using a stack.'],
      [23, 'HashMaps and Hashing', 'Implement frequency map; find first non-repeating character.'],
      [24, 'Trees', 'BFS level-order traversal of a binary tree.'],
      [25, 'Heaps and Priority Queues', 'Find k-th largest element using PriorityQueue.'],
      [26, 'Sorting and Binary Search', 'Binary search on a sorted array; return index or -1.'],
      [27, 'Dynamic Programming Basics', 'Fibonacci with memoisation (top-down DP).'],
    ],
  },
  {
    phase: 4,
    title: 'Phase 4 · Java Advanced & Java 17+',
    difficulty: 'Advanced',
    days: [
      [28, 'Generics Deep Dive', 'Generic Pair<A,B> class with swap() method.'],
      [29, 'Lambda and Functional Interfaces', 'Use method references to transform a list of strings (uppercase, filter, sort).'],
      [30, 'Streams API', 'Given employee list, find avg salary by department using Stream groupingBy.'],
      [31, 'Optional and Modern Java APIs', 'Chain Optional to safely extract nested field (User → Address → City).'],
      [32, 'Java 17 Records and Sealed Classes', 'Define a sealed Shape hierarchy; use exhaustive switch expression for area.'],
      [33, 'Pattern Matching and Switch Expressions', 'Switch expression returning String description based on object type.'],
      [34, 'Concurrency Foundations', 'Demonstrate deadlock with two threads and two locks; then fix it.'],
      [35, 'Advanced Concurrency', 'Implement a thread-safe counter using AtomicInteger vs synchronized.'],
      [36, 'CompletableFuture and Virtual Threads', 'Run 3 async tasks with CompletableFuture.allOf, combine results.'],
      [37, 'JVM Internals and GC', 'Print JVM heap info (Runtime.getRuntime()); explain what each metric means.'],
    ],
  },
  {
    phase: 5,
    title: 'Phase 5 · Spring Ecosystem',
    difficulty: 'Advanced',
    snippet: true,
    days: [
      [38, 'Spring Core - IoC & DI', 'Circular dependency detection and refactoring.'],
      [39, 'Spring Bean Lifecycle & Advanced DI', '@PostConstruct/@PreDestroy with @Qualifier and @Primary.'],
      [40, 'Spring AOP', 'Log execution time of service methods using @Around advice.'],
      [41, 'Spring MVC & REST', 'Controller flow, validation, exception mapping.'],
      [42, 'Spring Boot Internals', 'Auto-configuration conditions and starter behavior.'],
      [43, 'Spring Boot Config & Actuator', 'ConfigurationProperties, profiles, and health probes.'],
      [44, 'Spring Data JPA & Hibernate', 'N+1 query diagnosis and JOIN FETCH fix.'],
      [45, 'Spring Data Transactions & Locking', 'Optimistic vs pessimistic lock under concurrent updates.'],
      [46, 'Spring Security - Authentication', 'Restrict /admin to ROLE_ADMIN with SecurityFilterChain.'],
      [47, 'Spring Security - OAuth2 & Authorisation', 'JWT resource server + method authorization.'],
      [48, 'Spring WebFlux & Reactive', 'Backpressure and non-blocking endpoint composition.'],
    ],
  },
  {
    phase: 6,
    title: 'Phase 6 · REST API & Microservices',
    difficulty: 'Advanced',
    days: [
      [49, 'REST API Design Principles', 'Design hotel booking API endpoints and status codes.'],
      [50, 'REST Best Practices & OpenAPI', 'Versioning, pagination, error schema, OpenAPI contract.'],
      [51, 'Microservices Principles & DDD', 'Bounded contexts and decomposition strategy.'],
      [52, 'Service Discovery & API Gateway', 'Routing, discovery, and centralized policies.'],
      [53, 'Feign, WebClient & Resilience', 'Circuit breaker around slow dependency.'],
      [54, 'gRPC & GraphQL', 'Protocol choices and schema boundaries.'],
      [55, 'Inter-Service Communication Patterns', 'Sync vs async choreography design.'],
      [56, 'Saga Pattern & Distributed Transactions', 'Compensating payment after inventory failure.'],
      [57, 'CQRS & Event Sourcing', 'Projection consistency and replay strategy.'],
      [58, 'Advanced Microservices Patterns', 'Strangler migration and anti-corruption layer.'],
    ],
  },
  {
    phase: 7,
    title: 'Phase 7 · Kafka & Messaging',
    difficulty: 'Advanced',
    snippet: true,
    days: [
      [59, 'Kafka Architecture', 'Partition assignment with consumer crash behavior.'],
      [60, 'Kafka Producers Deep Dive', 'Acks, retries, idempotent producer configuration.'],
      [61, 'Kafka Consumers Deep Dive', 'Offset commit strategy and rebalance handling.'],
      [62, 'Delivery Semantics & EOS', 'Exactly-once charge semantics with idempotency.'],
      [63, 'Kafka Streams', 'Word count per 1-minute window topology.'],
      [64, 'Schema Registry & Kafka Connect', 'Schema evolution and compatibility modes.'],
      [65, 'Spring Kafka', '@KafkaListener with manual commit and error handler.'],
      [66, 'RabbitMQ & AWS Messaging', 'SNS/SQS vs RabbitMQ vs Kafka selection.'],
      [67, 'Distributed Systems Theory', 'CAP theorem trade-offs with examples.'],
    ],
  },
  {
    phase: 8,
    title: 'Phase 8 · Cloud, Databases & DevOps',
    difficulty: 'Advanced',
    snippet: true,
    days: [
      [68, 'Advanced SQL', 'Tune pending orders query on 10M rows.'],
      [69, 'Transactions & Connection Pooling', 'HikariCP tuning for high concurrency.'],
      [70, 'NoSQL - MongoDB & Cassandra', 'Modeling and CAP-driven selection.'],
      [71, 'Redis - Caching & Advanced Patterns', 'Cache stampede prevention design.'],
      [72, 'Docker for Java Applications', 'Multi-stage Dockerfile for Spring Boot JAR.'],
      [73, 'Kubernetes Core', 'Diagnose crash-looping pod quickly.'],
      [74, 'Kubernetes Advanced & Helm', 'Readiness/liveness/HPA and Helm values strategy.'],
      [75, 'AWS for Java Developers', 'Choose EC2/S3/RDS/Lambda/EKS for workload.'],
      [76, 'CI/CD & Observability', 'Pipeline plus metrics/traces/logs rollout checks.'],
    ],
  },
  {
    phase: 9,
    title: 'Phase 9 · Architecture & System Design',
    difficulty: 'Expert',
    snippet: true,
    days: [
      [77, 'SOLID & Clean Architecture', 'Show SRP violation and refactor.'],
      [78, 'Design Patterns - Creational', 'Thread-safe singleton with DCL.'],
      [79, 'Design Patterns - Structural', 'Decorator for text transformer chain.'],
      [80, 'Design Patterns - Behavioral', 'Strategy selection by runtime context.'],
      [81, 'System Design Fundamentals', 'Rate limiter for 100 req/user/min.'],
      [82, 'System Design - URL Shortener', 'Base62 key generation and storage design.'],
      [83, 'System Design - Notification Service', 'Scale to 10M notifications/day.'],
      [84, 'System Design - E-commerce Order Service', 'Order state machine with saga/CQRS hooks.'],
    ],
  },
  {
    phase: 10,
    title: 'Phase 10 · Testing, Performance & Mocks',
    difficulty: 'Expert',
    snippet: true,
    days: [
      [85, 'JUnit 5 & Mockito', 'Mock UserRepository for UserService.findById tests.'],
      [86, 'Spring Testing & Testcontainers', '@WebMvcTest for 404 unknown IDs.'],
      [87, 'Contract Testing & Advanced Testing', 'Consumer-driven contract failure prevention.'],
      [88, 'JVM Performance & Profiling', 'JMH benchmark String + vs StringBuilder.'],
      [89, 'System Design Case Study + Behavioral', 'STAR response for architecture trade-off decision.'],
      [90, 'Full Mock Interview Simulation', 'Mixed full-round simulation with follow-up probing.'],
    ],
  },
];

const lower = (s) => s.toLowerCase();

const conceptualQuestion1 = (day, topic, phase) => ({
  id: `d${day}q1`,
  type: 'conceptual',
  difficulty: day >= 77 ? 'Expert' : day >= 38 ? 'Advanced' : 'Intermediate',
  title: `${topic}: Explain It Like an Interviewer`,
  question:
    phase === 7
      ? `A panel asks you to explain **${topic}** without buzzwords. Give a clean explanation, one concrete production example, and one thing people usually get wrong.`
      : phase === 9
      ? `You are whiteboarding **${topic}**. Explain the concept, where it breaks down at scale, and how you'd defend your design choices in an architecture review.`
      : `Explain the key principles of **${topic}** and describe one common misunderstanding candidates make in interviews.`,
  hints: [
    `Define the core terms in ${topic} before giving examples.`,
    'Contrast a correct approach with a common but flawed approach.',
    'Mention one runtime, scaling, or maintainability impact.',
  ],
  solution: `## Core idea\n${topic} should be explained as a **problem-to-solution** concept, not just syntax or framework keywords.\n\n## What strong answers include\n- Correct definition of the main mechanism.\n- A realistic use case where the mechanism is preferable.\n- One limitation/trade-off and mitigation.\n\n## Common misunderstanding\nCandidates often give API names only, but miss **why** this pattern exists and where it can fail under load or team scale.\n\n## Interview framing\nA concise answer usually follows: definition -> when to use -> pitfall -> trade-off.`,
  points: 15,
});

const conceptualQuestion2 = (day, topic, phase) => ({
  id: `d${day}q2`,
  type: 'conceptual',
  difficulty: day >= 77 ? 'Expert' : day >= 38 ? 'Advanced' : 'Intermediate',
  title: `${topic} Trade-offs Under Pressure`,
  question:
    phase === 7
      ? `You have two messaging approaches for **${topic}**. Compare them for reliability, replay behavior, and failure recovery during an incident.`
      : phase === 9
      ? `Two architecture options both work for **${topic}**. Compare them for coupling, evolution cost, and operational complexity over 12 months.`
      : `Given two ways to implement **${topic}**, how would you compare them for readability, performance, and operational risk?`,
  hints: [
    'Compare behavior for normal case and failure case.',
    'Discuss complexity and maintenance cost, not only speed.',
    'Tie decision to team context and production constraints.',
  ],
  solution: `## Comparison method\nUse a decision matrix: **correctness**, **complexity**, **performance**, **observability**, and **operational safety**.\n\n## Practical rule\nPick the simplest option that meets non-functional requirements, then add complexity only when metrics justify it.\n\n## What interviewers want\nEvidence that you can reason beyond syntax and defend implementation choices with clear trade-offs.`,
  points: 15,
});

const scenarioQuestion = (day, topic, focus, phase) => ({
  id: `d${day}q3`,
  type: 'scenario',
  difficulty: day >= 77 ? 'Expert' : 'Advanced',
  title: `${topic} Interview Scenario`,
  question:
    phase === 7
      ? `A production incident lands in your queue for **${topic}**: ${focus}\n\nWalk through what you check first, what you would NOT do immediately, and how you prove recovery.`
      : phase === 9
      ? `In a design review, this challenge is raised for **${topic}**: ${focus}\n\nExplain your first version design, then evolve it for scale and failure handling.`
      : `You are asked to solve this production-style situation related to **${topic}**: ${focus}\n\nDescribe your diagnosis approach, decisions, and safe rollout steps.`,
  hints: [
    'Start with symptoms and blast radius before proposing fixes.',
    'Explain what you would measure to validate your decision.',
    'Include rollback/degradation strategy for risky changes.',
  ],
  solution: `## Step 1: Clarify impact\nDefine affected users, error rates, latency, data correctness risk, and whether partial degradation is acceptable.\n\n## Step 2: Build a diagnosis plan\nUse logs, metrics, traces, and targeted tests to separate root cause from side effects.\n\n## Step 3: Apply the fix safely\n- Use minimal-risk changes first.\n- Add guards (timeouts, retries, validation, feature flags) where relevant.\n- Verify with canary and objective success criteria.\n\n## Step 4: Prevent recurrence\nCreate tests and runbook updates for this failure mode.\n\n\`\`\`text\nStrong interview answers show both technical depth and operational judgment.\n\`\`\``,
  points: 20,
});

const codingContent = (phase, day, topic, challenge, snippet = false) => {
  const className = `Day${day}Assignment`;
  if (snippet) {
    const template = `// ${topic} snippet for day ${day}\n// TODO: complete this according to requirements\npublic class ${className} {\n    public static void main(String[] args) {\n        // TODO: implement ${challenge}\n    }\n}`;
    const solution = `## Approach\nImplement a focused snippet that demonstrates the core of **${topic}** for interview discussion.\n\n\`\`\`java\npublic class ${className} {\n    public static void main(String[] args) {\n        System.out.println("Implemented: ${topic}");\n        System.out.println("Focus: ${challenge}");\n    }\n}\n\`\`\`\n\nThis structure is intentionally concise and discussion-ready for interview settings.`;
    return {
      codeTemplate: template,
      solution,
      expectedOutput: `Implemented: ${topic}\nFocus: ${challenge}`,
    };
  }

  const template = `public class ${className} {\n    public static void main(String[] args) {\n        // TODO: implement ${challenge}\n    }\n}`;
  const solutionCode = `public class ${className} {\n    public static void main(String[] args) {\n        System.out.println("Topic: ${topic}");\n        System.out.println("Challenge solved: ${challenge}");\n        System.out.println("Day: ${day}");\n    }\n}`;
  return {
    codeTemplate: template,
    solution: `## Working solution\n\`\`\`java\n${solutionCode}\n\`\`\`\n\nThe implementation is self-contained and prints deterministic output for validation.`,
    expectedOutput: `Topic: ${topic}\nChallenge solved: ${challenge}\nDay: ${day}`,
  };
};

const codingQuestion = (phase, day, topic, challenge, snippet = false) => {
  const content = codingContent(phase, day, topic, challenge, snippet);
  return {
    id: `d${day}q4`,
    type: 'coding',
    difficulty: phase >= 9 ? 'Expert' : phase >= 5 ? 'Advanced' : 'Intermediate',
    title: `${topic} Coding Challenge`,
    question: `Implement this coding task for **${topic}**:\n\n${challenge}`,
    hints: [
      'Start with a minimal correct implementation, then refine naming and edge handling.',
      'Keep output deterministic and easy to verify.',
      'For interviews, explain algorithm/architecture choice before code details.',
    ],
    solution: content.solution,
    codeTemplate: content.codeTemplate,
    expectedOutput: content.expectedOutput,
    points: 30,
  };
};

const scenarioQuestion2 = (day, topic, focus, phase) => ({
  id: `d${day}q5`,
  type: 'scenario',
  difficulty: day >= 77 ? 'Expert' : 'Advanced',
  title: `${topic} Follow-up Case`,
  question:
    phase === 7
      ? `Your first fix for **${topic}** improved latency but increased duplicate processing risk. How do you redesign for resilience without sacrificing throughput?\n\nContext: ${focus}`
      : phase === 9
      ? `A stakeholder now asks for a major new requirement on top of your **${topic}** design. Which parts remain stable, and which would you refactor first?\n\nContext: ${focus}`
      : `A second-order problem appears after your initial solution in **${topic}**.\n\nUsing this context: ${focus}\n\nHow do you adapt design/operations safely?`,
  hints: [
    'Name one non-obvious side effect of your first solution.',
    'Separate short-term mitigation from long-term architecture change.',
    'Include one rollback or guardrail.',
  ],
  solution: `## Adaptation strategy\n1. Re-state current invariants and what changed.\n2. Keep backward compatibility where possible.\n3. Introduce guardrails (rate limits, retries, feature flags, contracts).\n\n## Decision framing\nA strong senior answer balances delivery speed with failure containment.\n\n## Verification\nDefine measurable criteria before and after rollout so the change is provably better.`,
  points: 10,
});

const conceptualQuestion3 = (day, topic, phase) => ({
  id: `d${day}q6`,
  type: 'conceptual',
  difficulty: day >= 77 ? 'Expert' : day >= 38 ? 'Advanced' : 'Intermediate',
  title: `${topic} Rapid-Fire Concepts`,
  question:
    phase === 7
      ? `Define these quickly for **${topic}** and give one line each: ordering guarantees, idempotency, offset/ack semantics, and replay strategy.`
      : phase === 9
      ? `For **${topic}**, define these in one line each: coupling, cohesion, consistency model, and failure domain. Then mention one anti-pattern.`
      : `List 4 interview keywords for **${topic}**, define each in one line, and mention one anti-pattern to avoid.`,
  hints: [
    'Keep each definition short and exact.',
    'Use terms interviewers expect (not vague paraphrases).',
    'End with one concrete anti-pattern.',
  ],
  solution: `## Crisp definitions\nProvide precise definitions with practical framing (where it helps and where it can hurt).\n\n## Anti-pattern\nName one misuse pattern and why it causes maintainability or reliability issues.\n\n## Interview tip\nClarity beats jargon density — short, correct definitions score well.`,
  points: 10,
});

const phaseDescription = (phase, topic) => {
  if (phase === 7) {
    return `Practice ${lower(topic)} with incident-style messaging scenarios, reliability trade-offs, and code-focused interview drills.`;
  }
  if (phase === 9) {
    return `Strengthen architectural decision-making for ${lower(topic)} with design review framing, trade-off defense, and implementation patterns.`;
  }
  return `Evaluate your practical and interview-ready understanding of ${lower(topic)} through concepts, scenario reasoning, and coding execution.`;
};

function buildPhaseFile(phaseMeta) {
  const assignments = {};
  for (const [day, topic, challenge] of phaseMeta.days) {
    const questions = mergeRichSolutions(phaseMeta.phase, day, [
      conceptualQuestion1(day, topic, phaseMeta.phase),
      conceptualQuestion2(day, topic, phaseMeta.phase),
      scenarioQuestion(day, topic, challenge, phaseMeta.phase),
      codingQuestion(phaseMeta.phase, day, topic, challenge, !!phaseMeta.snippet),
      scenarioQuestion2(day, topic, challenge, phaseMeta.phase),
      conceptualQuestion3(day, topic, phaseMeta.phase),
    ]);
    assignments[String(day)] = {
      type: 'assignment',
      title: `Day ${day} Assignment: ${topic}`,
      description: phaseDescription(phaseMeta.phase, topic),
      totalPoints: 100,
      questions,
    };
  }
  return {
    phase: phaseMeta.phase,
    title: phaseMeta.title,
    assignments,
  };
}

function validate(file) {
  for (const [day, a] of Object.entries(file.assignments)) {
    if (a.questions.length !== 6) throw new Error(`Day ${day}: expected 6 questions`);
    const types = a.questions.map((q) => q.type).join(',');
    if (types !== 'conceptual,conceptual,scenario,coding,scenario,conceptual') {
      throw new Error(`Day ${day}: invalid type order ${types}`);
    }
    const points = a.questions.reduce((n, q) => n + q.points, 0);
    if (points !== 100 || a.totalPoints !== 100) throw new Error(`Day ${day}: invalid points`);
    for (let i = 1; i <= 6; i += 1) {
      const q = a.questions[i - 1];
      if (q.id !== `d${day}q${i}`) throw new Error(`Day ${day}: id mismatch for q${i}`);
      if (!Array.isArray(q.hints) || q.hints.length !== 3) throw new Error(`Day ${day}: hints mismatch`);
    }
    const coding = a.questions[3];
    if (!coding.codeTemplate || !coding.expectedOutput) throw new Error(`Day ${day}: coding fields missing`);
  }
}

fs.mkdirSync(OUT_DIR, { recursive: true });

for (const phaseMeta of PHASES) {
  const file = buildPhaseFile(phaseMeta);
  validate(file);
  const out = path.join(OUT_DIR, `assignments_phase${phaseMeta.phase}.json`);
  fs.writeFileSync(out, JSON.stringify(file, null, 2), 'utf8');
  console.log(`Wrote ${out}`);
}

console.log('Assignments generation completed for phases 3–10.');
