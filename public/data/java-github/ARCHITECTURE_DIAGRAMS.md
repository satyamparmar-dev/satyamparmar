# Architecture Diagrams - PlantUML

> **Visual representations of Java 8+ concepts, patterns, and enterprise architectures**

---

## Table of Contents

1. [Stream Processing Flow](#stream-processing-flow)
2. [Enterprise Application Architecture](#enterprise-application-architecture)
3. [Module Dependencies](#module-dependencies)
4. [Data Flow Patterns](#data-flow-patterns)
5. [Functional Pipeline Architecture](#functional-pipeline-architecture)
6. [Concurrency Patterns](#concurrency-patterns)

---

## Stream Processing Flow

### Basic Stream Pipeline

```plantuml
@startuml Stream Pipeline
!theme plain
skinparam backgroundColor #FFFFFF

title Stream Processing Pipeline

package "Source" {
    [Collection/Array] as Source
}

package "Intermediate Operations" {
    [filter()] as Filter
    [map()] as Map
    [flatMap()] as FlatMap
    [distinct()] as Distinct
    [sorted()] as Sorted
    [limit()] as Limit
}

package "Terminal Operations" {
    [collect()] as Collect
    [forEach()] as ForEach
    [reduce()] as Reduce
    [findFirst()] as FindFirst
}

package "Result" {
    [Collection/Value] as Result
}

Source --> Filter : stream()
Filter --> Map : filter()
Map --> FlatMap : map()
FlatMap --> Distinct : flatMap()
Distinct --> Sorted : distinct()
Sorted --> Limit : sorted()
Limit --> Collect : limit()
Collect --> Result : collect()

note right of Source
  Collections, Arrays,
  Stream.of(), etc.
end note

note right of Filter
  Lazy evaluation:
  Operations execute
  only when terminal
  operation is called
end note

note right of Collect
  Terminal operation:
  Triggers execution
  of entire pipeline
end note

@enduml
```

### Stream with Parallel Processing

```plantuml
@startuml Parallel Stream
!theme plain
skinparam backgroundColor #FFFFFF

title Parallel Stream Processing

package "Source" {
    [Large Collection] as Source
}

Source --> [Split into Chunks] : parallelStream()

package "Parallel Processing" {
    [Thread 1\nChunk 1] as T1
    [Thread 2\nChunk 2] as T2
    [Thread 3\nChunk 3] as T3
    [Thread N\nChunk N] as TN
}

[Split into Chunks] --> T1
[Split into Chunks] --> T2
[Split into Chunks] --> T3
[Split into Chunks] --> TN

T1 --> [Intermediate\nOperations]
T2 --> [Intermediate\nOperations]
T3 --> [Intermediate\nOperations]
TN --> [Intermediate\nOperations]

[Intermediate\nOperations] --> [Combine Results]
[Combine Results] --> [Final Result]

note right of Source
  Large datasets
  (millions of elements)
end note

note right of [Split into Chunks]
  ForkJoinPool
  splits work
end note

note right of [Combine Results]
  Results are combined
  in order (if needed)
end note

@enduml
```

---

## Enterprise Application Architecture

### Layered Architecture with Java 8

```plantuml
@startuml Enterprise Architecture
!theme plain
skinparam backgroundColor #FFFFFF

title Enterprise Application Architecture

package "Presentation Layer" {
    [REST Controllers] as Controllers
    [DTOs] as DTOs
}

package "Service Layer" {
    [Business Logic] as Services
    [Stream Processing] as Streams
    [Validation] as Validation
}

package "Repository Layer" {
    [Data Access] as Repositories
    [JPA/Hibernate] as ORM
}

package "Database" {
    database [PostgreSQL/MySQL] as DB
}

package "External Services" {
    [API Clients] as APIs
    [Message Queue] as MQ
}

Controllers --> Services : Uses
Controllers --> DTOs : Returns
Services --> Streams : Processes data
Services --> Validation : Validates
Services --> Repositories : Fetches data
Repositories --> ORM : Uses
ORM --> DB : Queries
Services --> APIs : Calls external
Services --> MQ : Publishes messages

note right of Streams
  Java 8 Streams for:
  - Data transformation
  - Filtering
  - Aggregation
  - Parallel processing
end note

note right of Services
  Functional programming
  patterns with lambdas
  and method references
end note

@enduml
```

### Microservices Architecture

```plantuml
@startuml Microservices
!theme plain
skinparam backgroundColor #FFFFFF

title Microservices Architecture with Java 8

package "API Gateway" {
    [Gateway] as Gateway
}

package "Service 1: Order Service" {
    [Order Controller] as OrderCtrl
    [Order Service] as OrderSvc
    [Order Repository] as OrderRepo
    database [Order DB] as OrderDB
}

package "Service 2: Payment Service" {
    [Payment Controller] as PaymentCtrl
    [Payment Service] as PaymentSvc
    [Payment Repository] as PaymentRepo
    database [Payment DB] as PaymentDB
}

package "Service 3: Inventory Service" {
    [Inventory Controller] as InventoryCtrl
    [Inventory Service] as InventorySvc
    [Inventory Repository] as InventoryRepo
    database [Inventory DB] as InventoryDB
}

package "Message Broker" {
    queue [Kafka/RabbitMQ] as MQ
}

package "Service Discovery" {
    [Eureka/Consul] as Discovery
}

Gateway --> OrderCtrl
Gateway --> PaymentCtrl
Gateway --> InventoryCtrl

OrderCtrl --> OrderSvc
OrderSvc --> OrderRepo
OrderRepo --> OrderDB

PaymentCtrl --> PaymentSvc
PaymentSvc --> PaymentRepo
PaymentRepo --> PaymentDB

InventoryCtrl --> InventorySvc
InventorySvc --> InventoryRepo
InventoryRepo --> InventoryDB

OrderSvc --> PaymentSvc : HTTP/REST
OrderSvc --> InventorySvc : HTTP/REST
OrderSvc --> MQ : Publishes events
PaymentSvc --> MQ : Publishes events
InventorySvc --> MQ : Publishes events

OrderSvc --> Discovery : Registers
PaymentSvc --> Discovery : Registers
InventorySvc --> Discovery : Registers

note right of OrderSvc
  Uses Java 8 Streams:
  - Process order items
  - Calculate totals
  - Validate inventory
  - Parallel processing
end note

note right of MQ
  Async communication
  using CompletableFuture
end note

@enduml
```

---

## Module Dependencies

### Java 9 Module System

```plantuml
@startuml Java Modules
!theme plain
skinparam backgroundColor #FFFFFF

title Java 9 Module Dependencies

package "com.example.app" {
    [App Module] as App
}

package "com.example.api" {
    [API Module] as API
}

package "com.example.service" {
    [Service Module] as Service
}

package "com.example.repository" {
    [Repository Module] as Repo
}

package "com.example.model" {
    [Model Module] as Model
}

package "java.base" {
    [Java Base] as Base
}

package "java.logging" {
    [Java Logging] as Logging
}

App --> API : requires
App --> Service : requires
App --> Base : requires
App --> Logging : requires

API --> Model : requires
Service --> Model : requires
Service --> Repo : requires
Service --> API : requires
Repo --> Model : requires

note right of App
  Main application module
  Exports: com.example.app
end note

note right of API
  Public API
  Exports: com.example.api
end note

note right of Service
  Business logic
  Uses streams and
  functional interfaces
end note

@enduml
```

---

## Data Flow Patterns

### Order Processing Pipeline

```plantuml
@startuml Order Processing
!theme plain
skinparam backgroundColor #FFFFFF

title Order Processing Data Flow

[Raw Orders] as Input

Input --> [Filter Valid Orders] : stream()

[Filter Valid Orders] --> [Enrich with Customer Data] : filter()

[Enrich with Customer Data] --> [Check Inventory] : map()

[Check Inventory] --> [Calculate Pricing] : filter()

[Calculate Pricing] --> [Apply Discounts] : map()

[Apply Discounts] --> [Validate Payment] : map()

[Validate Payment] --> [Create Shipment] : filter()

[Create Shipment] --> [Processed Orders] : map()

[Processed Orders] --> [Database] : collect()
[Processed Orders] --> [Notification Service] : forEach()

note right of [Filter Valid Orders]
  Intermediate operation:
  filter(isValidOrder)
end note

note right of [Enrich with Customer Data]
  Intermediate operation:
  map(enrichOrder)
end note

note right of [Calculate Pricing]
  Intermediate operation:
  map(calculateTotal)
  Uses: mapToDouble, sum
end note

note right of [Processed Orders]
  Terminal operation:
  collect(Collectors.toList())
end note

@enduml
```

### Data Aggregation Flow

```plantuml
@startuml Data Aggregation
!theme plain
skinparam backgroundColor #FFFFFF

title Data Aggregation with Streams

[Transaction Data] as Transactions

Transactions --> [Filter by Date Range] : stream()

[Filter by Date Range] --> [Group by Category] : filter()

[Group by Category] --> [Calculate Statistics] : groupingBy()

[Calculate Statistics] --> [Aggregate Results] : summarizingDouble()

[Aggregate Results] --> [Format Output] : map()

[Format Output] --> [Report] : collect()

note right of [Group by Category]
  Collector:
  Collectors.groupingBy(
    Transaction::getCategory
  )
end note

note right of [Calculate Statistics]
  Collector:
  Collectors.summarizingDouble(
    Transaction::getAmount
  )
  Returns: count, sum, min, max, avg
end note

@enduml
```

---

## Functional Pipeline Architecture

### Functional Processing Pipeline

```plantuml
@startuml Functional Pipeline
!theme plain
skinparam backgroundColor #FFFFFF

title Functional Processing Pipeline

package "Input Layer" {
    [Data Source] as Source
}

package "Transformation Layer" {
    [Function<T,R>] as Function1
    [Function<R,S>] as Function2
    [Function<S,T>] as Function3
}

package "Filtering Layer" {
    [Predicate<T>] as Predicate1
    [Predicate<R>] as Predicate2
}

package "Aggregation Layer" {
    [Collector] as Collector
    [Reducer] as Reducer
}

package "Output Layer" {
    [Result] as Result
}

Source --> Function1 : apply()
Function1 --> Predicate1 : test()
Predicate1 --> Function2 : apply()
Function2 --> Predicate2 : test()
Predicate2 --> Function3 : apply()
Function3 --> Collector : collect()
Collector --> Result

note right of Function1
  map() operation
  Transforms data
end note

note right of Predicate1
  filter() operation
  Filters data
end note

note right of Collector
  Terminal operation
  Collects results
end note

@enduml
```

### Strategy Pattern with Functional Interfaces

```plantuml
@startuml Strategy Pattern
!theme plain
skinparam backgroundColor #FFFFFF

title Strategy Pattern using Functional Interfaces

package "Context" {
    [PaymentProcessor] as Processor
}

package "Strategies" {
    [Function<Double, PaymentResult>] as Strategy
}

package "Concrete Strategies" {
    [CreditCardPayment] as CreditCard
    [PayPalPayment] as PayPal
    [BankTransferPayment] as BankTransfer
}

package "Client" {
    [Order Service] as Client
}

Client --> Processor : process(paymentMethod, amount)
Processor --> Strategy : apply(amount)
Strategy --> CreditCard : if "CREDIT_CARD"
Strategy --> PayPal : if "PAYPAL"
Strategy --> BankTransfer : if "BANK_TRANSFER"

CreditCard --> [Payment Result]
PayPal --> [Payment Result]
BankTransfer --> [Payment Result]

note right of Processor
  Uses Map<String, Function<Double, PaymentResult>>
  to store strategies
end note

note right of Strategy
  Functional interface
  replaces traditional
  strategy classes
end note

@enduml
```

---

## Concurrency Patterns

### CompletableFuture Chain

```plantuml
@startuml CompletableFuture
!theme plain
skinparam backgroundColor #FFFFFF

title CompletableFuture Execution Chain

[Initial Task] as Task1

Task1 --> [CompletableFuture 1] : supplyAsync()

[CompletableFuture 1] --> [Task 2] : thenApply()
[Task 2] --> [CompletableFuture 2]

[CompletableFuture 2] --> [Task 3] : thenApply()
[Task 3] --> [CompletableFuture 3]

[CompletableFuture 3] --> [Task 4] : thenCompose()
[Task 4] --> [CompletableFuture 4]

[CompletableFuture 4] --> [Final Result] : join()

package "Error Handling" {
    [Exception Handler] as Handler
}

[CompletableFuture 1] --> Handler : exceptionally()
[CompletableFuture 2] --> Handler : exceptionally()
[CompletableFuture 3] --> Handler : exceptionally()
[CompletableFuture 4] --> Handler : exceptionally()

Handler --> [Default Value]

note right of Task1
  Async execution
  in thread pool
end note

note right of [Task 2]
  Sequential chaining
  with thenApply()
end note

note right of [Task 4]
  Async chaining
  with thenCompose()
end note

@enduml
```

### Parallel Processing with ExecutorService

```plantuml
@startuml Parallel Processing
!theme plain
skinparam backgroundColor #FFFFFF

title Parallel Processing Architecture

[Main Thread] as Main

Main --> [ExecutorService] : Creates pool

package "Thread Pool" {
    [Thread 1] as T1
    [Thread 2] as T2
    [Thread 3] as T3
    [Thread N] as TN
}

[ExecutorService] --> T1 : submit()
[ExecutorService] --> T2 : submit()
[ExecutorService] --> T3 : submit()
[ExecutorService] --> TN : submit()

T1 --> [Task 1] : execute()
T2 --> [Task 2] : execute()
T3 --> [Task 3] : execute()
TN --> [Task N] : execute()

[Task 1] --> [Result 1]
[Task 2] --> [Result 2]
[Task 3] --> [Result 3]
[Task N] --> [Result N]

[Result 1] --> [Combine Results]
[Result 2] --> [Combine Results]
[Result 3] --> [Combine Results]
[Result N] --> [Combine Results]

[Combine Results] --> [Final Result]

Main --> [Final Result] : await completion

note right of [ExecutorService]
  FixedThreadPool(10)
  or
  ForkJoinPool
end note

note right of [Combine Results]
  Uses CompletableFuture.allOf()
  or
  Stream.collect()
end note

@enduml
```

### Stream Processing with Parallel Execution

```plantuml
@startuml Parallel Stream Processing
!theme plain
skinparam backgroundColor #FFFFFF

title Parallel Stream Processing Flow

[Large Dataset] as Data

Data --> [Split] : parallelStream()

package "Parallel Execution" {
    [Chunk 1] --> [Thread 1] : filter() + map()
    [Chunk 2] --> [Thread 2] : filter() + map()
    [Chunk 3] --> [Thread 3] : filter() + map()
    [Chunk N] --> [Thread N] : filter() + map()
}

[Split] --> [Chunk 1]
[Split] --> [Chunk 2]
[Split] --> [Chunk 3]
[Split] --> [Chunk N]

[Thread 1] --> [Partial Result 1]
[Thread 2] --> [Partial Result 2]
[Thread 3] --> [Partial Result 3]
[Thread N] --> [Partial Result N]

[Partial Result 1] --> [Merge]
[Partial Result 2] --> [Merge]
[Partial Result 3] --> [Merge]
[Partial Result N] --> [Merge]

[Merge] --> [Final Result] : collect()

note right of [Split]
  ForkJoinPool
  automatically splits
  work into chunks
end note

note right of [Merge]
  Results are merged
  using collector's
  combiner function
end note

@enduml
```

---

## Component Interaction

### Service Layer with Streams

```plantuml
@startuml Service Layer
!theme plain
skinparam backgroundColor #FFFFFF

title Service Layer Component Interaction

package "Controller" {
    [REST Controller] as Controller
}

package "Service Layer" {
    [Order Service] as OrderService
    [Validation Service] as ValidationService
    [Pricing Service] as PricingService
    [Notification Service] as NotificationService
}

package "Repository Layer" {
    [Order Repository] as OrderRepo
    [Customer Repository] as CustomerRepo
    [Product Repository] as ProductRepo
}

package "External Services" {
    [Payment Gateway] as PaymentGateway
    [Shipping Service] as ShippingService
}

Controller --> OrderService : createOrder(orderDTO)

OrderService --> ValidationService : validate(order)
ValidationService --> OrderService : isValid

OrderService --> OrderRepo : findById()
OrderService --> CustomerRepo : findById()
OrderService --> ProductRepo : findAllById()

OrderService --> PricingService : calculateTotal(order)
PricingService --> OrderService : total

OrderService --> PaymentGateway : processPayment()
PaymentGateway --> OrderService : paymentResult

OrderService --> ShippingService : createShipment()
ShippingService --> OrderService : shipmentId

OrderService --> NotificationService : sendNotification()
NotificationService --> OrderService : sent

OrderService --> OrderRepo : save(order)

note right of OrderService
  Uses Java 8 Streams:
  - Process order items
  - Filter valid items
  - Calculate totals
  - Group by category
  - Parallel processing
end note

note right of PricingService
  Functional pipeline:
  items.stream()
    .map(calculateItemPrice)
    .reduce(sum)
end note

@enduml
```

---

## Summary

These PlantUML diagrams illustrate:

1. **Stream Processing**: How data flows through stream pipelines
2. **Enterprise Architecture**: Layered and microservices patterns
3. **Module Dependencies**: Java 9+ module system
4. **Data Flow**: Real-world processing patterns
5. **Functional Pipelines**: Functional programming patterns
6. **Concurrency**: Parallel processing and async execution

**How to Use:**

1. Install PlantUML plugin in your IDE or use online editor
2. Copy diagram code into `.puml` file
3. Generate diagrams for documentation
4. Use in presentations and architecture documents

**Tools:**
- [PlantUML Online](http://www.plantuml.com/plantuml/uml/)
- IntelliJ IDEA: PlantUML plugin
- VS Code: PlantUML extension
- Maven/Gradle: PlantUML plugin

---

**Visual learning helps understand complex concepts! 📊**
