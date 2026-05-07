# Architecture Diagrams

This directory contains PlantUML (PUML) diagrams illustrating various Kafka concepts and architectures.

## How to View Diagrams

### Option 1: Online Viewers
- **PlantUML Online**: https://www.plantuml.com/plantuml/uml/
- **PlantText**: https://www.planttext.com/
- Copy the `.puml` file content and paste into the online viewer

### Option 2: VS Code Extension
1. Install "PlantUML" extension in VS Code
2. Open any `.puml` file
3. Press `Alt+D` to preview

### Option 3: Command Line
```bash
# Install PlantUML
# On Windows (with Chocolatey):
choco install plantuml

# On Mac:
brew install plantuml

# On Linux:
sudo apt-get install plantuml

# Generate PNG
plantuml diagram.puml
```

## Available Diagrams

### 1. Kafka Architecture (`kafka-architecture.puml`)
- Shows Kafka cluster with brokers
- Topic partitions distribution
- Producer and consumer groups
- Zookeeper coordination

### 2. Producer-Consumer Flow (`producer-consumer-flow.puml`)
- Message production flow
- Message consumption flow
- Offset management
- Acknowledgment process

### 3. Replication Model (`replication-model.puml`)
- Leader-follower model
- In-Sync Replicas (ISR)
- Replication across brokers
- Fault tolerance

### 4. Event-Driven Microservices (`event-driven-microservices.puml`)
- Microservices architecture
- Event-driven communication
- Topic-based integration
- Service independence

### 5. Transaction Flow (`transaction-flow.puml`)
- Transactional producer flow
- Transaction commit/abort
- Exactly-once semantics
- Consumer isolation

### 6. Error Handling and Retry (`error-handling-retry.puml`)
- Retry mechanism
- Dead letter queue
- Error classification
- Recovery strategies

## Diagram Descriptions

### Kafka Architecture
Illustrates the fundamental components of a Kafka cluster:
- Multiple brokers working together
- Topic partitions distributed across brokers
- Producer writing to partitions
- Consumer groups reading from partitions
- Zookeeper for coordination

### Producer-Consumer Flow
Shows the complete lifecycle of a message:
1. Application sends message to producer
2. Producer serializes and sends to broker
3. Broker stores in partition with offset
4. Consumer polls for messages
5. Consumer processes and commits offset

### Replication Model
Demonstrates how Kafka ensures data durability:
- Each partition has a leader and followers
- All replicas must acknowledge writes (acks=all)
- Followers stay in sync with leader
- Automatic leader election on failure

### Event-Driven Microservices
Architecture pattern for building scalable systems:
- Services communicate via events
- Loose coupling between services
- Independent scaling
- Event sourcing support

### Transaction Flow
Ensures exactly-once semantics:
- Transaction coordinator manages transactions
- Messages written but not visible until commit
- Rollback on failure
- Consumer isolation (read_committed)

### Error Handling and Retry
Production-grade error handling:
- Retry with exponential backoff
- Dead letter queue for failed messages
- Classification of retryable vs permanent errors
- Offset management during failures

## Customization

You can modify these diagrams by:
1. Opening the `.puml` file
2. Editing the PlantUML syntax
3. Regenerating the diagram

## Best Practices

1. **Keep diagrams simple**: Focus on key concepts
2. **Use consistent colors**: Green for leaders, blue for consumers
3. **Add notes**: Explain complex interactions
4. **Update regularly**: Keep diagrams in sync with code

## Contributing

When adding new diagrams:
1. Use PlantUML syntax
2. Follow naming convention: `kebab-case.puml`
3. Add description to this README
4. Include notes for complex flows
