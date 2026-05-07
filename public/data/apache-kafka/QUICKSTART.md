# Quick Start Guide

Get up and running with Kafka and Spring Boot in 5 minutes!

> ### What will you learn?
> - How to start Kafka and create a topic quickly.
> - How to run producer and consumer Spring Boot services.
> - How to test, monitor, and troubleshoot the full basic flow.

## Prerequisites

- Docker and Docker Compose installed
- Java 17+ installed
- Maven 3.6+ installed

**Quick Check:** Do you have all three prerequisites ready before continuing?

## Step 1: Start Kafka

```bash
# Start Kafka cluster
docker-compose up -d

# Verify Kafka is running
docker-compose ps

# Check Kafka logs
docker-compose logs kafka
```
What this does: Starts Kafka containers, confirms they are running, and shows broker logs for quick validation.

## Step 2: Create Topics

```bash
# Create user-events topic
docker exec -it kafka kafka-topics --create \
  --bootstrap-server localhost:9092 \
  --topic user-events \
  --partitions 3 \
  --replication-factor 1

# List topics
docker exec -it kafka kafka-topics --list \
  --bootstrap-server localhost:9092
```
What this does: Creates the `user-events` topic and verifies it exists in the cluster.

## Step 3: Run Producer Service

```bash
cd examples/kafka-producer-service
mvn clean package
mvn spring-boot:run
```
What this does: Builds and starts the producer service that publishes events to Kafka.

The producer service will start on `http://localhost:8080`

**Quick Check:** Which URL indicates that the producer API is running?

## Step 4: Run Consumer Service

Open a new terminal:

```bash
cd examples/kafka-consumer-service
mvn clean package
mvn spring-boot:run
```
What this does: Builds and starts the consumer service that reads events from Kafka.

The consumer service will start on `http://localhost:8081`

**Quick Check:** Why is a new terminal needed for the consumer service?

## Step 5: Test the System

### Send a Test Event

```bash
curl -X POST http://localhost:8080/api/events/user \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "eventType": "LOGIN",
    "data": {"ip": "192.168.1.1", "browser": "Chrome"}
  }'
```
What this does: Sends a sample user event to the producer API so Kafka processing can be tested.

### Verify Consumer Received Message

Check the consumer service logs - you should see:
```
Received message: topic=user-events, partition=X, offset=Y, userId=user-123, eventType=LOGIN
Processing event: userId=user-123, eventType=LOGIN
```
What this does: Confirms the consumer received and processed the event.

### View Messages in Kafka UI

Open your browser and navigate to:
```
http://localhost:8080
```
What this does: Opens Kafka UI so you can inspect topics, messages, and consumer groups visually.

You can browse topics, view messages, and monitor consumer groups.

**Quick Check:** Which output proves end-to-end flow worked: API response, consumer logs, or both?

## Step 6: Monitor with Kafka Console Tools

### Consume Messages Directly

```bash
docker exec -it kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic user-events \
  --from-beginning
```
What this does: Reads topic messages directly from Kafka for low-level verification.

### Check Consumer Groups

```bash
docker exec -it kafka kafka-consumer-groups \
  --bootstrap-server localhost:9092 \
  --list
```
What this does: Lists all consumer groups currently registered in Kafka.

**Quick Check:** Which command helps you verify that consumers are grouped correctly?

## Common Commands

### Stop Kafka

```bash
docker-compose down
```
What this does: Stops and removes Kafka containers started by Docker Compose.

### Restart Kafka

```bash
docker-compose restart
```
What this does: Restarts the running Kafka Docker services.

### View Kafka Logs

```bash
docker-compose logs -f kafka
```
What this does: Streams Kafka logs continuously for live debugging.

### Describe Topic

```bash
docker exec -it kafka kafka-topics --describe \
  --topic user-events \
  --bootstrap-server localhost:9092
```
What this does: Shows topic metadata like partitions, replicas, and leaders.

**Quick Check:** Which common command would you run first when debugging topic partition issues?

## Troubleshooting

In plain English: use this section to quickly isolate setup, connection, and configuration problems.

### Kafka Not Starting

1. Check if ports 9092, 2181 are available
2. Check Docker logs: `docker-compose logs kafka`
3. Verify Docker is running: `docker ps`

### Producer Can't Connect

1. Verify Kafka is running: `docker-compose ps`
2. Check bootstrap servers in `application.yml`
3. Test connection: `telnet localhost 9092`

### Consumer Not Receiving Messages

1. Check consumer group ID matches
2. Verify topic name is correct
3. Check auto-offset-reset setting (earliest/latest)
4. Verify consumer is subscribed to correct topic

### Port Already in Use

If port 8080 or 8081 is in use:
- Change port in `application.yml`: `server.port: 8082`
- Or stop the service using the port

**Quick Check:** If producer fails to start, what should you check first: Kafka logs or local port conflicts?

## Next Steps

1. Read [Kafka Core Concepts](./docs/01-kafka-core-concepts.md)
2. Explore [Spring Boot Integration](./docs/02-spring-boot-integration.md)
3. Review [Architecture Diagrams](./docs/diagrams/)
4. Follow [Step-by-Step Guide](./docs/05-step-by-step-guide.md)

**Quick Check:** Which next step should a fresher do immediately after this quick run?

## Learning Path

### Day 1: Basics
- ✅ Start Kafka cluster
- ✅ Run producer and consumer
- ✅ Understand topics and partitions
- ✅ Read core concepts documentation

### Day 2: Spring Boot Integration
- ✅ Configure KafkaTemplate
- ✅ Implement @KafkaListener
- ✅ Handle errors and retries
- ✅ Test with multiple consumers

### Day 3: Advanced Features
- ✅ Implement Kafka Streams
- ✅ Add monitoring and metrics
- ✅ Configure security
- ✅ Optimize performance

### Day 4: Enterprise Patterns
- ✅ Build event-driven microservices
- ✅ Implement CQRS pattern
- ✅ Add transaction support
- ✅ Deploy to production

**Quick Check:** Which day in this mini path introduces enterprise patterns?

## Resources

- [Official Kafka Documentation](https://kafka.apache.org/documentation/)
- [Spring Kafka Documentation](https://docs.spring.io/spring-kafka/docs/current/reference/html/)
- [Kafka Best Practices](https://kafka.apache.org/documentation/#bestpractices)

Happy Learning! 🚀

**Quick Check:** Which resource would you use if you need deeper Spring Kafka API details?

What's next? Continue with [Kafka Core Concepts](./docs/01-kafka-core-concepts.md).
