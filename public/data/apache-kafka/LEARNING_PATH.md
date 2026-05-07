# Learning Path: Apache Kafka with Spring Boot

> ### What will you learn?
> - A week-by-week path to learn Kafka with Spring Boot from zero.
> - What to study, practice, and deliver each week.
> - How to self-check progress before moving to advanced topics.

## 🎯 Overview

This learning path is designed for **freshers** to master Apache Kafka with Java Spring Boot, progressing from basics to enterprise-grade implementations.

**Estimated Time**: 4-6 weeks (depending on pace)  
**Prerequisites**: Basic Java, Spring Boot fundamentals  
**Goal**: Build production-ready Kafka applications

**Quick Check:** What is your target completion timeline from this overview?

---

## 📅 Week-by-Week Plan

In plain English: follow this in order so your basics are strong before advanced patterns.

### Week 1: Kafka Fundamentals

#### Day 1-2: Core Concepts
- [ ] Read [Kafka Core Concepts](./docs/01-kafka-core-concepts.md)
- [ ] Understand: Brokers, Topics, Partitions
- [ ] Learn: Producers, Consumers, Consumer Groups
- [ ] Study: Replication and High Availability
- [ ] Review: [Kafka Architecture Diagram](./docs/diagrams/kafka-architecture.puml)

**Key Concepts to Master:**
- What is Kafka and why use it?
- Topic vs Partition
- Producer vs Consumer
- Consumer Groups and load distribution
- Offset management

**Practice:**
- Start Kafka using Docker Compose
- Create topics manually
- Use Kafka console tools to produce/consume messages

#### Day 3-4: Message Delivery Semantics
- [ ] Understand: At-most-once, At-least-once, Exactly-once
- [ ] Learn: When to use each semantics
- [ ] Study: Idempotent producers
- [ ] Review: [Producer-Consumer Flow Diagram](./docs/diagrams/producer-consumer-flow.puml)

**Key Concepts:**
- Delivery guarantees
- Idempotence
- Transactional producers
- Consumer isolation levels

**Practice:**
- Configure producer with different ack levels
- Test message delivery scenarios
- Understand offset commits

#### Day 5-7: Hands-On Setup
- [ ] Follow [Quick Start Guide](./QUICKSTART.md)
- [ ] Run producer and consumer services
- [ ] Send test messages
- [ ] Monitor with Kafka UI
- [ ] Experiment with partitions and consumer groups

**Deliverable:**
- Working Kafka cluster
- Basic producer and consumer running
- Understanding of message flow

**Quick Check:** Before Week 2, can you create topics and verify message flow end to end?

---

### Week 2: Spring Boot Integration

#### Day 1-2: Producer Implementation
- [ ] Read [Spring Boot Integration Guide](./docs/02-spring-boot-integration.md) - Producer section
- [ ] Study: KafkaTemplate usage
- [ ] Learn: Configuration properties
- [ ] Implement: Basic producer service
- [ ] Practice: Send different message types

**Key Topics:**
- KafkaTemplate API
- Producer configuration
- Serialization (JSON)
- Async vs Sync sending
- Error handling

**Practice:**
- Build producer service from examples
- Configure different serializers
- Test with various message formats

#### Day 3-4: Consumer Implementation
- [ ] Read [Spring Boot Integration Guide](./docs/02-spring-boot-integration.md) - Consumer section
- [ ] Study: @KafkaListener annotation
- [ ] Learn: Manual acknowledgment
- [ ] Implement: Consumer service
- [ ] Practice: Batch processing

**Key Topics:**
- @KafkaListener configuration
- Consumer groups
- Offset management
- Batch vs single message processing
- Consumer configuration tuning

**Practice:**
- Build consumer service
- Implement different acknowledgment modes
- Test with multiple consumers in same group

#### Day 5-7: Error Handling and Retries
- [ ] Study: Error handling patterns
- [ ] Learn: Retry mechanisms
- [ ] Implement: Dead letter queues
- [ ] Review: [Error Handling Diagram](./docs/diagrams/error-handling-retry.puml)

**Key Topics:**
- Retry strategies
- Exponential backoff
- Dead letter queues
- Error classification
- Recovery mechanisms

**Practice:**
- Implement retry logic
- Create dead letter queue handler
- Test failure scenarios

**Deliverable:**
- Complete producer service with error handling
- Complete consumer service with retries
- Understanding of Spring Kafka APIs

**Quick Check:** Can you explain when to use manual acknowledgment in your consumer?

---

### Week 3: Advanced Features

#### Day 1-2: Kafka Streams
- [ ] Read [Advanced Features Guide](./docs/03-advanced-features.md) - Kafka Streams
- [ ] Understand: KStream vs KTable
- [ ] Learn: Stream processing operations
- [ ] Implement: Simple stream processing

**Key Topics:**
- Stream processing concepts
- KStream and KTable
- Stateful operations
- Windowed aggregations
- Joins

**Practice:**
- Build stream processing application
- Implement aggregations
- Test with real-time data

#### Day 3: Kafka Connect
- [ ] Study: Kafka Connect framework
- [ ] Learn: Source and Sink connectors
- [ ] Understand: Connector configuration

**Key Topics:**
- Connect architecture
- Source connectors
- Sink connectors
- Connector configuration

#### Day 4-5: Security
- [ ] Read [Advanced Features Guide](./docs/03-advanced-features.md) - Security
- [ ] Learn: SASL authentication
- [ ] Understand: SSL/TLS encryption
- [ ] Study: ACLs (Access Control Lists)

**Key Topics:**
- SASL/PLAIN authentication
- SSL/TLS setup
- Certificate management
- ACL configuration

**Practice:**
- Configure SASL authentication
- Set up SSL (optional, can use plaintext for learning)
- Test secure connections

#### Day 6-7: Monitoring and Performance
- [ ] Study: Monitoring with JMX
- [ ] Learn: Micrometer and Prometheus
- [ ] Understand: Performance tuning
- [ ] Review: [Replication Model Diagram](./docs/diagrams/replication-model.puml)

**Key Topics:**
- JMX metrics
- Prometheus integration
- Performance optimization
- Batch size tuning
- Compression

**Practice:**
- Set up monitoring
- Configure Prometheus
- Tune producer/consumer settings

**Deliverable:**
- Stream processing application
- Monitoring setup
- Understanding of advanced features

**Quick Check:** Which Week 3 topic is most directly related to production observability?

---

### Week 4: Enterprise Patterns

#### Day 1-2: Event-Driven Microservices
- [ ] Read [Enterprise Patterns Guide](./docs/04-enterprise-patterns.md) - Event-Driven
- [ ] Understand: Microservices communication
- [ ] Learn: Event-driven architecture
- [ ] Review: [Event-Driven Microservices Diagram](./docs/diagrams/event-driven-microservices.puml)

**Key Topics:**
- Event-driven architecture
- Service decoupling
- Event schemas
- Service independence

**Practice:**
- Build multiple microservices
- Implement event communication
- Test service interactions

#### Day 3: CQRS and Event Sourcing
- [ ] Study: CQRS pattern
- [ ] Learn: Event sourcing
- [ ] Understand: Command vs Query separation

**Key Topics:**
- CQRS architecture
- Event store
- Read models
- Event replay

#### Day 4: Saga Pattern
- [ ] Study: Distributed transactions
- [ ] Learn: Saga orchestration
- [ ] Understand: Compensation logic

**Key Topics:**
- Saga pattern
- Orchestration vs Choreography
- Compensating transactions
- Distributed transaction management

#### Day 5-6: Complete Application
- [ ] Follow [Step-by-Step Guide](./docs/05-step-by-step-guide.md)
- [ ] Build end-to-end application
- [ ] Implement all patterns learned
- [ ] Review: [Transaction Flow Diagram](./docs/diagrams/transaction-flow.puml)

**Practice:**
- Build order processing system
- Implement payment flow
- Add inventory management
- Integrate all services

#### Day 7: Deployment and CI/CD
- [ ] Study: Docker containerization
- [ ] Learn: CI/CD pipeline setup
- [ ] Understand: Production deployment

**Key Topics:**
- Docker configuration
- CI/CD pipelines
- Production considerations
- Monitoring in production

**Deliverable:**
- Complete enterprise application
- Understanding of patterns
- Deployment-ready code

**Quick Check:** Can you describe orchestration vs choreography after this week?

---

## 🎓 Learning Resources

### Documentation
1. [Kafka Core Concepts](./docs/01-kafka-core-concepts.md)
2. [Spring Boot Integration](./docs/02-spring-boot-integration.md)
3. [Advanced Features](./docs/03-advanced-features.md)
4. [Enterprise Patterns](./docs/04-enterprise-patterns.md)
5. [Step-by-Step Guide](./docs/05-step-by-step-guide.md)

### Diagrams
- [Kafka Architecture](./docs/diagrams/kafka-architecture.puml)
- [Producer-Consumer Flow](./docs/diagrams/producer-consumer-flow.puml)
- [Replication Model](./docs/diagrams/replication-model.puml)
- [Event-Driven Microservices](./docs/diagrams/event-driven-microservices.puml)
- [Transaction Flow](./docs/diagrams/transaction-flow.puml)
- [Error Handling](./docs/diagrams/error-handling-retry.puml)

### Code Examples
- [Producer Service](./examples/kafka-producer-service/)
- [Consumer Service](./examples/kafka-consumer-service/)

### External Resources
- [Apache Kafka Documentation](https://kafka.apache.org/documentation/)
- [Spring Kafka Documentation](https://docs.spring.io/spring-kafka/)
- [Kafka Best Practices](https://kafka.apache.org/documentation/#bestpractices)

**Quick Check:** Which resource type should you use first when stuck: docs, diagram, or code example?

---

## ✅ Assessment Checklist

### Fundamentals (Week 1)
- [ ] Can explain Kafka architecture
- [ ] Understands topics and partitions
- [ ] Knows producer vs consumer
- [ ] Understands consumer groups
- [ ] Can set up Kafka cluster

### Spring Boot Integration (Week 2)
- [ ] Can implement KafkaTemplate
- [ ] Knows @KafkaListener usage
- [ ] Understands configuration properties
- [ ] Can handle errors and retries
- [ ] Implements dead letter queues

### Advanced Features (Week 3)
- [ ] Can use Kafka Streams
- [ ] Understands security (SASL/SSL)
- [ ] Sets up monitoring
- [ ] Tunes performance
- [ ] Understands transactions

### Enterprise Patterns (Week 4)
- [ ] Builds event-driven microservices
- [ ] Implements CQRS pattern
- [ ] Uses Saga pattern
- [ ] Deploys to production
- [ ] Sets up CI/CD

**Quick Check:** Which unchecked item currently blocks your progress the most?

---

## 🚀 Next Steps After Completion

1. **Build Real Projects**: Apply knowledge to real-world scenarios
2. **Contribute to Open Source**: Kafka ecosystem projects
3. **Advanced Topics**: 
   - Kafka Streams advanced operations
   - Schema Registry
   - Kafka Connect deep dive
   - Multi-region deployments
4. **Certification**: Consider Confluent or Apache Kafka certifications

**Quick Check:** Which next step gives you the fastest practical growth right after this course?

---

## 💡 Tips for Success

1. **Practice Daily**: Code every day, even if just 30 minutes
2. **Build Projects**: Don't just read, build something
3. **Ask Questions**: Use forums, Stack Overflow, community
4. **Review Diagrams**: Visual learning helps understand concepts
5. **Experiment**: Try different configurations, break things, learn
6. **Document**: Write notes, create your own examples
7. **Teach Others**: Explaining concepts reinforces learning

**Quick Check:** Which tip can you apply immediately this week?

---

## 🎯 Success Criteria

You've successfully learned Kafka when you can:

1. ✅ Explain Kafka architecture to someone else
2. ✅ Build producer and consumer services from scratch
3. ✅ Handle errors and implement retries
4. ✅ Set up monitoring and tune performance
5. ✅ Design event-driven microservices architecture
6. ✅ Deploy Kafka applications to production
7. ✅ Troubleshoot common Kafka issues

---

**Remember**: Learning is a journey, not a destination. Take your time, practice regularly, and don't hesitate to revisit concepts. Good luck! 🚀

**Quick Check:** Which success criterion are you closest to completing today?

What's next? Re-open [README.md](./README.md) and continue with the next unchecked week task.
