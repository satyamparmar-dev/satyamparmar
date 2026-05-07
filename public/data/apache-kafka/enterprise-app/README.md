# Enterprise E-Commerce Order Processing System

> ### What will you learn?
> - How an enterprise Kafka-based order system is organized.
> - How events move across services in success and failure paths.
> - How to run, verify, secure, and observe the application.

## 🏗️ Complete Enterprise Application

This is a **production-ready, enterprise-level application** demonstrating Apache Kafka with Spring Boot in a real-world scenario.

**Quick Check:** What makes this app "enterprise-level" compared to a basic producer-consumer demo?

---

## 📋 Application Overview

### Business Domain
E-Commerce Order Processing System that handles:
- Order creation and management
- Payment processing
- Inventory management
- Customer notifications

### Architecture Pattern
- **Event-Driven Microservices**
- **Saga Pattern** (Choreography-based)
- **CQRS** (Command Query Responsibility Segregation)
- **API Gateway** pattern

In plain English: each service has a focused responsibility and they coordinate through Kafka events.

**Quick Check:** Which pattern here is responsible for distributed transaction flow?

---

## 🏛️ Architecture

```
┌──────────────┐
│ API Gateway  │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────┐
│      Kafka Event Bus                │
│  • order-created                    │
│  • payment-processed                │
│  • inventory-reserved               │
│  • order-confirmed                  │
└─────────────────────────────────────┘
       │
       ├──────────┬──────────┬──────────┐
       ▼          ▼          ▼          ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│  Order   │ │ Payment  │ │Inventory │ │Notification│
│ Service  │ │ Service  │ │ Service  │ │ Service  │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
```

**Quick Check:** In this architecture, what role does the Kafka Event Bus play?

---

## 🚀 Quick Start

In plain English: these commands launch infrastructure, build services, run them, and verify everything is alive.

### Prerequisites
- Docker and Docker Compose
- Java 17
- Maven 3.6+

### Step 1: Start Infrastructure

```bash
# Start Kafka, PostgreSQL, Redis
docker-compose -f docker-compose-infra.yml up -d

# Wait for services to be ready (30 seconds)
sleep 30
```
What this does: Starts shared infrastructure services and gives them time to initialize.

### Step 2: Build All Services

```bash
# Build all services
./build-all.sh

# Or build individually
cd order-service && mvn clean package
cd payment-service && mvn clean package
cd inventory-service && mvn clean package
cd notification-service && mvn clean package
```
What this does: Compiles service artifacts so each service can be started.

### Step 3: Start All Services

```bash
# Start all services
docker-compose up -d

# Or start individually
cd order-service && mvn spring-boot:run
```
What this does: Launches application services either together or one-by-one.

### Step 4: Verify Services

```bash
# Check service health
curl http://localhost:8080/actuator/health  # API Gateway
curl http://localhost:8081/actuator/health  # Order Service
curl http://localhost:8082/actuator/health  # Payment Service
curl http://localhost:8083/actuator/health  # Inventory Service
curl http://localhost:8084/actuator/health  # Notification Service
```
What this does: Checks health endpoints to confirm each service is reachable.

### Step 5: Create Test Order

```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d '{
    "userId": "user-123",
    "items": [
      {
        "productId": "prod-1",
        "quantity": 2,
        "price": 29.99
      }
    ],
    "shippingAddress": {
      "street": "123 Main St",
      "city": "New York",
      "zipCode": "10001"
    }
  }'
```
What this does: Sends a full sample order request through the API Gateway to trigger the event flow.

**Quick Check:** Which command in Quick Start confirms service health most directly?

---

## 📁 Project Structure

```
enterprise-app/
├── README.md                    # This file
├── docker-compose.yml           # All services
├── docker-compose-infra.yml    # Infrastructure only
├── build-all.sh                # Build script
│
├── api-gateway/                # API Gateway Service
│   ├── pom.xml
│   └── src/main/
│
├── order-service/              # Order Management Service
│   ├── pom.xml
│   └── src/main/
│       ├── java/.../order/
│       │   ├── OrderServiceApplication.java
│       │   ├── controller/
│       │   ├── service/
│       │   ├── repository/
│       │   ├── dto/
│       │   ├── event/
│       │   └── config/
│       └── resources/
│           └── application.yml
│
├── payment-service/            # Payment Processing Service
│   ├── pom.xml
│   └── src/main/
│
├── inventory-service/          # Inventory Management Service
│   ├── pom.xml
│   └── src/main/
│
└── notification-service/       # Notification Service
    ├── pom.xml
    └── src/main/
```

**Quick Check:** Which folder should you open to inspect the Order service implementation?

---

## 🔄 Event Flow

In plain English: this section explains who reacts to which event at each step.

### Successful Order Flow

1. **Client** → **API Gateway** → **Order Service**
   - Creates order
   - Publishes `order-created` event

2. **Payment Service** (consumes `order-created`)
   - Processes payment
   - Publishes `payment-processed` (success)

3. **Inventory Service** (consumes `order-created`)
   - Reserves items
   - Publishes `inventory-reserved`

4. **Order Service** (consumes both events)
   - Confirms order
   - Publishes `order-confirmed`

5. **Notification Service** (consumes `order-confirmed`)
   - Sends confirmation email

### Failure Flow (Payment Fails)

1. **Payment Service** publishes `payment-failed`

2. **Inventory Service** (consumes `payment-failed`)
   - Releases reservation
   - Publishes `inventory-released`

3. **Order Service** (consumes `payment-failed`)
   - Cancels order
   - Publishes `order-cancelled`

4. **Notification Service** (consumes `order-cancelled`)
   - Sends cancellation email

**Quick Check:** Which event starts the compensation path when payment fails?

---

## 🛠️ Technology Stack

### Services
- **Java 17**
- **Spring Boot 3.1.0**
- **Spring Kafka**
- **Spring Data JPA**
- **PostgreSQL** (per service)
- **Redis** (caching)

### Infrastructure
- **Apache Kafka 3.0+**
- **Docker & Docker Compose**
- **Prometheus** (metrics)
- **Grafana** (dashboards)

### Security
- **Spring Security**
- **JWT** (authentication)
- **SSL/TLS** (encryption)

**Quick Check:** Which category includes tools for dashboards and metrics?

---

## 📊 Monitoring

### Health Checks
All services expose health endpoints:
- `/actuator/health`
- `/actuator/info`
- `/actuator/metrics`

### Metrics
- Business metrics (orders, payments)
- Technical metrics (latency, throughput)
- Kafka metrics (consumer lag, producer rate)

### Logging
- Structured JSON logging
- Correlation IDs
- Centralized logging (optional: ELK)

**Quick Check:** Why are correlation IDs useful in a multi-service flow?

---

## 🔒 Security

### Authentication
- JWT tokens
- API Gateway validates tokens
- Services trust gateway

### Authorization
- Role-based access control
- Service-to-service authentication

### Encryption
- SSL/TLS for Kafka
- Encrypted database connections
- Secure API endpoints (HTTPS)

**Quick Check:** Which security section ensures requests come from valid users?

---

## 🧪 Testing

### Unit Tests
```bash
mvn test
```

### Integration Tests
```bash
mvn verify
```

### End-to-End Tests
```bash
./e2e-tests.sh
```
What this does: Runs full workflow tests across multiple services.

**Quick Check:** Which test level checks complete cross-service behavior?

---

## 📚 Documentation

- [Architecture Documentation](../docs/06-enterprise-application.md)
- [API Documentation](./api-docs/)
- [Deployment Guide](./DEPLOYMENT.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)

**Quick Check:** Which linked document explains enterprise architecture in detail?

---

## 🚀 Production Deployment

### Prerequisites
- Kubernetes cluster
- Helm charts
- CI/CD pipeline

### Steps
1. Build Docker images
2. Push to container registry
3. Deploy using Helm
4. Configure monitoring
5. Set up alerts

See [DEPLOYMENT.md](./DEPLOYMENT.md) for details.

**Quick Check:** Which deployment step comes immediately before monitoring setup?

---

## 🤝 Contributing

This is a learning project. Feel free to:
- Add more features
- Improve error handling
- Enhance monitoring
- Add more tests

**Quick Check:** Which contribution area would most improve reliability?

---

## 📝 License

Educational purposes only.

**Quick Check:** What is the intended use of this repository according to the license note?

---

## 🎯 Learning Outcomes

After studying this application, you'll understand:
- ✅ Event-driven microservices architecture
- ✅ Saga pattern implementation
- ✅ Production-ready error handling
- ✅ Distributed system design
- ✅ Kafka best practices
- ✅ Service communication patterns
- ✅ Monitoring and observability

**Happy Learning!** 🚀

**Quick Check:** Which learning outcome do you want to demonstrate in your own mini project?

What's next? Read [Architecture Documentation](../docs/06-enterprise-application.md).
