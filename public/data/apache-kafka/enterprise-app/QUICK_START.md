# Enterprise Application - Quick Start

## 🚀 Get the Enterprise App Running in 5 Minutes

### Prerequisites
- Docker and Docker Compose
- Java 17
- Maven 3.6+

### Step 1: Start Infrastructure

```bash
# Navigate to enterprise-app directory
cd enterprise-app

# Start Kafka, PostgreSQL, and monitoring tools
docker-compose up -d

# Wait for services to be ready (30 seconds)
sleep 30
```

### Step 2: Create Kafka Topics

```bash
# Create required topics
docker exec -it kafka kafka-topics --create \
  --bootstrap-server localhost:9092 \
  --topic order-created \
  --partitions 3 \
  --replication-factor 1

docker exec -it kafka kafka-topics --create \
  --bootstrap-server localhost:9092 \
  --topic payment-processed \
  --partitions 3 \
  --replication-factor 1

docker exec -it kafka kafka-topics --create \
  --bootstrap-server localhost:9092 \
  --topic inventory-reserved \
  --partitions 3 \
  --replication-factor 1

docker exec -it kafka kafka-topics --create \
  --bootstrap-server localhost:9092 \
  --topic order-confirmed \
  --partitions 3 \
  --replication-factor 1

docker exec -it kafka kafka-topics --create \
  --bootstrap-server localhost:9092 \
  --topic order-cancelled \
  --partitions 3 \
  --replication-factor 1
```

### Step 3: Build and Run Order Service

```bash
# Build Order Service
cd order-service
mvn clean package

# Run Order Service
mvn spring-boot:run
```

Order Service will start on `http://localhost:8081`

### Step 4: Verify Services

```bash
# Check Order Service health
curl http://localhost:8081/actuator/health

# Should return: {"status":"UP"}
```

### Step 5: Create Test Order

```bash
curl -X POST http://localhost:8081/api/orders \
  -H "Content-Type: application/json" \
  -H "X-User-Id: user-123" \
  -d '{
    "userId": "user-123",
    "items": [
      {
        "productId": "prod-1",
        "quantity": 2,
        "price": 29.99
      },
      {
        "productId": "prod-2",
        "quantity": 1,
        "price": 49.99
      }
    ],
    "shippingAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    }
  }'
```

### Step 6: Monitor Events

**Option 1: Kafka UI**
- Open browser: http://localhost:8080
- Browse topics
- View messages in real-time

**Option 2: Kafka Console Consumer**
```bash
docker exec -it kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic order-created \
  --from-beginning
```

### Step 7: Check Logs

```bash
# View Order Service logs
# (In the terminal where you ran mvn spring-boot:run)

# You should see:
# - Order created
# - Event published: order-created
# - Event consumed: payment-processed (when Payment Service is running)
# - Event consumed: inventory-reserved (when Inventory Service is running)
```

---

## 📊 Monitoring Dashboards

### Kafka UI
- URL: http://localhost:8080
- View topics, messages, consumer groups
- Monitor Kafka cluster

### Prometheus
- URL: http://localhost:9090
- Metrics collection
- Query metrics

### Grafana
- URL: http://localhost:3000
- Username: admin
- Password: admin
- Create dashboards for visualization

---

## 🔍 Understanding the Flow

### What Happens When You Create an Order?

1. **Order Service:**
   - Receives POST request
   - Validates order data
   - Saves order to database
   - Publishes `order-created` event
   - Returns response immediately

2. **Kafka:**
   - Stores `order-created` event
   - Distributes to consumers

3. **Payment Service** (when running):
   - Consumes `order-created` event
   - Processes payment
   - Publishes `payment-processed` event

4. **Inventory Service** (when running):
   - Consumes `order-created` event
   - Reserves items
   - Publishes `inventory-reserved` event

5. **Order Service:**
   - Consumes `payment-processed` event
   - Consumes `inventory-reserved` event
   - When both received: Confirms order
   - Publishes `order-confirmed` event

6. **Notification Service** (when running):
   - Consumes `order-confirmed` event
   - Sends confirmation email

---

## 🐛 Troubleshooting

### Order Service Won't Start

**Check:**
1. Is Kafka running? `docker-compose ps`
2. Is database running? `docker-compose ps`
3. Check logs: `docker-compose logs kafka`
4. Check port 8081 is available

### No Events in Kafka

**Check:**
1. Topics created? `docker exec -it kafka kafka-topics --list --bootstrap-server localhost:9092`
2. Kafka UI: http://localhost:8080
3. Order Service logs for errors

### Database Connection Error

**Check:**
1. Database running: `docker-compose ps order-db`
2. Connection string in `application.yml`
3. Database credentials

---

## 📚 Next Steps

1. **Study the Code:**
   - Read `OrderService.java`
   - Understand event publishing
   - Understand event consumption

2. **Read Documentation:**
   - [Enterprise App Explanation](./ENTERPRISE_APP_EXPLANATION.md)
   - [Architecture Explained](./ARCHITECTURE_EXPLAINED.md)
   - [Main Documentation](../docs/06-enterprise-application.md)

3. **Experiment:**
   - Modify order creation logic
   - Add new events
   - Test failure scenarios

4. **Add More Services:**
   - Implement Payment Service
   - Implement Inventory Service
   - Implement Notification Service

---

## 🎯 Learning Objectives

After running this application, you should understand:
- ✅ How microservices communicate via events
- ✅ How Kafka distributes events
- ✅ How Saga pattern works
- ✅ How to handle failures
- ✅ How to monitor event flow

**Happy Learning!** 🚀
