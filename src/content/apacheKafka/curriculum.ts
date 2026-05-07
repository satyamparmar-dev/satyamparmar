/**
 * Sequential curriculum mirroring Satyverse-Satyam-Parmar/Apache-Kafka (main).
 * Display titles are repo basenames; paths are relative to public/data/apache-kafka/.
 * Order: root docs & compose → docs → diagrams → producer example → consumer example → enterprise → order-service.
 */

export const KAFKA_PUBLIC_PREFIX = 'data/apache-kafka';

export type KafkaContentKind = 'raw' | 'java' | 'yaml' | 'xml' | 'plaintext';

export type KafkaCurriculumStep = {
  step: number;
  /** Basename exactly as in the repo (for UI). */
  displayName: string;
  /** Path under apache-kafka/. */
  repoPath: string;
  kind: KafkaContentKind;
};

export const KAFKA_CURRICULUM: KafkaCurriculumStep[] = [
  { step: 1, displayName: 'README.md', repoPath: 'README.md', kind: 'raw' },
  { step: 2, displayName: 'INDEX.md', repoPath: 'INDEX.md', kind: 'raw' },
  { step: 3, displayName: 'LEARNING_PATH.md', repoPath: 'LEARNING_PATH.md', kind: 'raw' },
  { step: 4, displayName: 'PROJECT_SUMMARY.md', repoPath: 'PROJECT_SUMMARY.md', kind: 'raw' },
  { step: 5, displayName: 'QUICKSTART.md', repoPath: 'QUICKSTART.md', kind: 'raw' },
  { step: 6, displayName: 'docker-compose.yml', repoPath: 'docker-compose.yml', kind: 'yaml' },
  { step: 7, displayName: '01-kafka-core-concepts.md', repoPath: 'docs/01-kafka-core-concepts.md', kind: 'raw' },
  { step: 8, displayName: '02-spring-boot-integration.md', repoPath: 'docs/02-spring-boot-integration.md', kind: 'raw' },
  { step: 9, displayName: '03-advanced-features.md', repoPath: 'docs/03-advanced-features.md', kind: 'raw' },
  { step: 10, displayName: '04-enterprise-patterns.md', repoPath: 'docs/04-enterprise-patterns.md', kind: 'raw' },
  { step: 11, displayName: '05-step-by-step-guide.md', repoPath: 'docs/05-step-by-step-guide.md', kind: 'raw' },
  { step: 12, displayName: '06-enterprise-application.md', repoPath: 'docs/06-enterprise-application.md', kind: 'raw' },
  { step: 13, displayName: '07-kafka-interview-qa.md', repoPath: 'docs/07-kafka-interview-qa.md', kind: 'raw' },
  { step: 14, displayName: 'README.md', repoPath: 'docs/diagrams/README.md', kind: 'raw' },
  { step: 15, displayName: 'error-handling-retry.puml', repoPath: 'docs/diagrams/error-handling-retry.puml', kind: 'plaintext' },
  { step: 16, displayName: 'event-driven-microservices.puml', repoPath: 'docs/diagrams/event-driven-microservices.puml', kind: 'plaintext' },
  { step: 17, displayName: 'kafka-architecture.puml', repoPath: 'docs/diagrams/kafka-architecture.puml', kind: 'plaintext' },
  { step: 18, displayName: 'producer-consumer-flow.puml', repoPath: 'docs/diagrams/producer-consumer-flow.puml', kind: 'plaintext' },
  { step: 19, displayName: 'replication-model.puml', repoPath: 'docs/diagrams/replication-model.puml', kind: 'plaintext' },
  { step: 20, displayName: 'transaction-flow.puml', repoPath: 'docs/diagrams/transaction-flow.puml', kind: 'plaintext' },
  { step: 21, displayName: 'pom.xml', repoPath: 'examples/kafka-producer-service/pom.xml', kind: 'xml' },
  {
    step: 22,
    displayName: 'KafkaProducerServiceApplication.java',
    repoPath: 'examples/kafka-producer-service/src/main/java/com/example/kafka/KafkaProducerServiceApplication.java',
    kind: 'java',
  },
  {
    step: 23,
    displayName: 'EventController.java',
    repoPath: 'examples/kafka-producer-service/src/main/java/com/example/kafka/controller/EventController.java',
    kind: 'java',
  },
  {
    step: 24,
    displayName: 'UserEvent.java',
    repoPath: 'examples/kafka-producer-service/src/main/java/com/example/kafka/dto/UserEvent.java',
    kind: 'java',
  },
  {
    step: 25,
    displayName: 'ProducerService.java',
    repoPath: 'examples/kafka-producer-service/src/main/java/com/example/kafka/service/ProducerService.java',
    kind: 'java',
  },
  {
    step: 26,
    displayName: 'application.yml',
    repoPath: 'examples/kafka-producer-service/src/main/resources/application.yml',
    kind: 'yaml',
  },
  { step: 27, displayName: 'pom.xml', repoPath: 'examples/kafka-consumer-service/pom.xml', kind: 'xml' },
  {
    step: 28,
    displayName: 'KafkaConsumerServiceApplication.java',
    repoPath: 'examples/kafka-consumer-service/src/main/java/com/example/kafka/KafkaConsumerServiceApplication.java',
    kind: 'java',
  },
  {
    step: 29,
    displayName: 'KafkaConsumerConfig.java',
    repoPath: 'examples/kafka-consumer-service/src/main/java/com/example/kafka/config/KafkaConsumerConfig.java',
    kind: 'java',
  },
  {
    step: 30,
    displayName: 'UserEvent.java',
    repoPath: 'examples/kafka-consumer-service/src/main/java/com/example/kafka/dto/UserEvent.java',
    kind: 'java',
  },
  {
    step: 31,
    displayName: 'ConsumerService.java',
    repoPath: 'examples/kafka-consumer-service/src/main/java/com/example/kafka/service/ConsumerService.java',
    kind: 'java',
  },
  {
    step: 32,
    displayName: 'application.yml',
    repoPath: 'examples/kafka-consumer-service/src/main/resources/application.yml',
    kind: 'yaml',
  },
  { step: 33, displayName: 'README.md', repoPath: 'enterprise-app/README.md', kind: 'raw' },
  { step: 34, displayName: 'ARCHITECTURE_EXPLAINED.md', repoPath: 'enterprise-app/ARCHITECTURE_EXPLAINED.md', kind: 'raw' },
  { step: 35, displayName: 'ENTERPRISE_APP_EXPLANATION.md', repoPath: 'enterprise-app/ENTERPRISE_APP_EXPLANATION.md', kind: 'raw' },
  { step: 36, displayName: 'QUICK_START.md', repoPath: 'enterprise-app/QUICK_START.md', kind: 'raw' },
  { step: 37, displayName: 'docker-compose.yml', repoPath: 'enterprise-app/docker-compose.yml', kind: 'yaml' },
  { step: 38, displayName: 'pom.xml', repoPath: 'enterprise-app/order-service/pom.xml', kind: 'xml' },
  {
    step: 39,
    displayName: 'application.yml',
    repoPath: 'enterprise-app/order-service/src/main/resources/application.yml',
    kind: 'yaml',
  },
  {
    step: 40,
    displayName: 'OrderServiceApplication.java',
    repoPath: 'enterprise-app/order-service/src/main/java/com/enterprise/ecommerce/order/OrderServiceApplication.java',
    kind: 'java',
  },
  {
    step: 41,
    displayName: 'OrderController.java',
    repoPath: 'enterprise-app/order-service/src/main/java/com/enterprise/ecommerce/order/controller/OrderController.java',
    kind: 'java',
  },
  {
    step: 42,
    displayName: 'CreateOrderRequest.java',
    repoPath: 'enterprise-app/order-service/src/main/java/com/enterprise/ecommerce/order/dto/CreateOrderRequest.java',
    kind: 'java',
  },
  {
    step: 43,
    displayName: 'OrderItemRequest.java',
    repoPath: 'enterprise-app/order-service/src/main/java/com/enterprise/ecommerce/order/dto/OrderItemRequest.java',
    kind: 'java',
  },
  {
    step: 44,
    displayName: 'OrderItemResponse.java',
    repoPath: 'enterprise-app/order-service/src/main/java/com/enterprise/ecommerce/order/dto/OrderItemResponse.java',
    kind: 'java',
  },
  {
    step: 45,
    displayName: 'OrderResponse.java',
    repoPath: 'enterprise-app/order-service/src/main/java/com/enterprise/ecommerce/order/dto/OrderResponse.java',
    kind: 'java',
  },
  {
    step: 46,
    displayName: 'ShippingAddressRequest.java',
    repoPath: 'enterprise-app/order-service/src/main/java/com/enterprise/ecommerce/order/dto/ShippingAddressRequest.java',
    kind: 'java',
  },
  {
    step: 47,
    displayName: 'ShippingAddressResponse.java',
    repoPath: 'enterprise-app/order-service/src/main/java/com/enterprise/ecommerce/order/dto/ShippingAddressResponse.java',
    kind: 'java',
  },
  {
    step: 48,
    displayName: 'Order.java',
    repoPath: 'enterprise-app/order-service/src/main/java/com/enterprise/ecommerce/order/entity/Order.java',
    kind: 'java',
  },
  {
    step: 49,
    displayName: 'OrderItem.java',
    repoPath: 'enterprise-app/order-service/src/main/java/com/enterprise/ecommerce/order/entity/OrderItem.java',
    kind: 'java',
  },
  {
    step: 50,
    displayName: 'OrderStatus.java',
    repoPath: 'enterprise-app/order-service/src/main/java/com/enterprise/ecommerce/order/entity/OrderStatus.java',
    kind: 'java',
  },
  {
    step: 51,
    displayName: 'ShippingAddress.java',
    repoPath: 'enterprise-app/order-service/src/main/java/com/enterprise/ecommerce/order/entity/ShippingAddress.java',
    kind: 'java',
  },
  {
    step: 52,
    displayName: 'BaseEvent.java',
    repoPath: 'enterprise-app/order-service/src/main/java/com/enterprise/ecommerce/order/event/BaseEvent.java',
    kind: 'java',
  },
  {
    step: 53,
    displayName: 'InventoryReservedEvent.java',
    repoPath: 'enterprise-app/order-service/src/main/java/com/enterprise/ecommerce/order/event/InventoryReservedEvent.java',
    kind: 'java',
  },
  {
    step: 54,
    displayName: 'OrderCancelledEvent.java',
    repoPath: 'enterprise-app/order-service/src/main/java/com/enterprise/ecommerce/order/event/OrderCancelledEvent.java',
    kind: 'java',
  },
  {
    step: 55,
    displayName: 'OrderConfirmedEvent.java',
    repoPath: 'enterprise-app/order-service/src/main/java/com/enterprise/ecommerce/order/event/OrderConfirmedEvent.java',
    kind: 'java',
  },
  {
    step: 56,
    displayName: 'OrderCreatedEvent.java',
    repoPath: 'enterprise-app/order-service/src/main/java/com/enterprise/ecommerce/order/event/OrderCreatedEvent.java',
    kind: 'java',
  },
  {
    step: 57,
    displayName: 'PaymentProcessedEvent.java',
    repoPath: 'enterprise-app/order-service/src/main/java/com/enterprise/ecommerce/order/event/PaymentProcessedEvent.java',
    kind: 'java',
  },
  {
    step: 58,
    displayName: 'OrderRepository.java',
    repoPath: 'enterprise-app/order-service/src/main/java/com/enterprise/ecommerce/order/repository/OrderRepository.java',
    kind: 'java',
  },
  {
    step: 59,
    displayName: 'OrderEventConsumer.java',
    repoPath: 'enterprise-app/order-service/src/main/java/com/enterprise/ecommerce/order/consumer/OrderEventConsumer.java',
    kind: 'java',
  },
  {
    step: 60,
    displayName: 'OrderService.java',
    repoPath: 'enterprise-app/order-service/src/main/java/com/enterprise/ecommerce/order/service/OrderService.java',
    kind: 'java',
  },
];

/** Referenced by enterprise-app/docker-compose.yml but not present in the repo tree (Phase 5 note). */
export const KAFKA_REFERENCED_MISSING_PATHS = ['enterprise-app/prometheus.yml'];

export function kafkaAssetUrl(repoPath: string): string {
  const base = import.meta.env.BASE_URL || './';
  const normalized = base.endsWith('/') ? base : `${base}/`;
  const segments = repoPath.split('/').map(encodeURIComponent);
  return `${normalized}${KAFKA_PUBLIC_PREFIX}/${segments.join('/')}`;
}

export function getKafkaStepByParam(stepParam: string | undefined): KafkaCurriculumStep | null {
  const n = Number(stepParam);
  if (!Number.isInteger(n) || n < 1 || n > KAFKA_CURRICULUM.length) return null;
  return KAFKA_CURRICULUM[n - 1] ?? null;
}

export function kafkaKindLabel(kind: KafkaContentKind): string {
  switch (kind) {
    case 'java':
      return 'Java';
    case 'yaml':
      return 'YAML';
    case 'xml':
      return 'XML';
    case 'plaintext':
      return 'PlantUML';
    default:
      return 'Text';
  }
}
