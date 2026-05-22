export type CourseDifficultyLabel =
  | 'Beginner → Advanced'
  | 'Beginner → Intermediate'
  | 'Fresher → Senior'
  | 'Intermediate → Expert';

export interface CourseDefinition {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  price: number;
  color: string;
  gradient: string;
  features: string[];
  difficulty: CourseDifficultyLabel;
  lessons: number;
  hours: number;
  route: string;
  isAvailable: boolean;
}

export const BUNDLE_PRICE = 2999;

const LIST_SUM = 799 + 799 + 799 + 1499 + 1499;

export const BUNDLE_SAVINGS = LIST_SUM - BUNDLE_PRICE;

export const COURSE_CATALOG: CourseDefinition[] = [
  {
    id: 'apache-kafka',
    name: 'Apache Kafka Complete Course',
    tagline: 'From zero to enterprise Kafka in 5 phases',
    icon: '📨',
    price: 799,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    features: [
      'Brokers, topics, partitions explained with analogies',
      'Spring Boot producer & consumer from scratch',
      'Consumer groups, offsets, retries, dead-letter topics',
      'Saga pattern & Outbox pattern for production',
      'Top 10 Kafka interview questions answered',
    ],
    difficulty: 'Beginner → Advanced',
    lessons: 19,
    hours: 18,
    route: '/kafka-course',
    isAvailable: true,
  },
  {
    id: 'claude-for-developers',
    name: 'Claude for developers',
    tagline: 'Claude API essentials for Java — from first call to CLI code review',
    icon: '✳️',
    price: 799,
    color: '#d97757',
    gradient: 'linear-gradient(135deg, #d97757 0%, #c45c3e 100%)',
    features: [
      'Anthropic Java SDK setup with Maven and Gradle',
      'System prompts, multi-turn history, and streaming',
      'Tool use — Claude calls your Java methods',
      'Rate limits, safety, and production checklist',
      'Mini-project: CLI code review assistant',
    ],
    difficulty: 'Beginner → Advanced',
    lessons: 12,
    hours: 16,
    route: '/claude-course',
    isAvailable: true,
  },
  {
    id: 'prompt-engineering',
    name: 'Prompt Engineering for Java Developers',
    tagline: 'Every prompting technique from RCTFC basics to enterprise governance — with real Java examples',
    icon: '🎯',
    price: 799,
    color: '#7c3aed',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
    features: [
      'RCTFC model: Role, Context, Task, Format, Constraints',
      'Chain-of-Thought, few-shot, structured JSON output',
      '10 ready-to-use templates for daily Java dev tasks',
      'System prompts, RAG-aware prompting, tool descriptions',
      'Enterprise: versioning, testing, PII safety, team library',
    ],
    difficulty: 'Fresher → Senior',
    lessons: 16,
    hours: 18,
    route: '/prompt-course',
    isAvailable: true,
  },
  {
    id: 'java-modern',
    name: 'Java Modern Features Course',
    tagline: 'Java 8–17: lambdas, streams, records, sealed classes',
    icon: '☕',
    price: 799,
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    features: [
      'Lambdas & functional interfaces with analogies',
      'Streams API: filter, map, flatMap, collectors',
      'Optional — stop null from crashing your code',
      'Java 9-17: var, Records, pattern matching, switch',
      'Enterprise pipeline + 20 interview Q&As',
    ],
    difficulty: 'Beginner → Intermediate',
    lessons: 19,
    hours: 20,
    route: '/java-course',
    isAvailable: true,
  },
  {
    id: 'java-roadmap',
    name: 'Complete Java Roadmap',
    tagline: 'Everything a Java backend engineer needs — from OOP to microservices',
    icon: '🗺️',
    price: 1499,
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    features: [
      'Core Java → Collections → Concurrency',
      'Spring Boot: REST, JPA, Security, Actuator',
      'Design patterns with real-world code',
      'Microservices, Docker, CI/CD basics',
      '90-day structured learning plan',
    ],
    difficulty: 'Fresher → Senior',
    lessons: 90,
    hours: 120,
    route: '/java-repo',
    isAvailable: true,
  },
  {
    id: 'genai-roadmap',
    name: 'Complete GenAI Roadmap',
    tagline: 'From LLM basics to production RAG pipelines',
    icon: '🤖',
    price: 1499,
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    features: [
      'LLM fundamentals: transformers, embeddings, RAG',
      'Prompt engineering: zero-shot, chain-of-thought, agents',
      'LangChain, vector databases, semantic search',
      'Build and deploy a production AI assistant',
      'GenAI interview preparation',
    ],
    difficulty: 'Intermediate → Expert',
    lessons: 60,
    hours: 80,
    route: '/llm',
    isAvailable: true,
  },
];

export function getCourseDef(id: string): CourseDefinition | undefined {
  return COURSE_CATALOG.find((c) => c.id === id);
}
