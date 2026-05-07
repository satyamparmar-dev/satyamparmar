# Java 8 to Latest: Comprehensive Learning & Interview Guide

> **A Senior Technical Architect's Guide for Freshers**  
> *25+ Years of Enterprise Java Experience*

## Table of Contents

1. [Introduction](#introduction)
2. [Java 8 Fundamentals](#java-8-fundamentals)
3. [Java 8 Streams - Deep Dive](#java-8-streams-deep-dive)
4. [Functional Interfaces & Method References](#functional-interfaces--method-references)
5. [Optional Class](#optional-class)
6. [Java 9+ Features](#java-9-features)
7. [Enterprise Patterns & Best Practices](#enterprise-patterns--best-practices)
8. [Multi-threading & Concurrency](#multi-threading--concurrency)
9. [Interview Questions](#interview-questions)
10. [Architecture Diagrams](#architecture-diagrams)

---

## Introduction

Welcome! This guide is designed to take you from Java basics to enterprise-level proficiency, with a **strong emphasis on Java 8 functional programming**. We'll cover:

- **Java 8 Core Features**: Streams, Lambdas, Functional Interfaces, Method References
- **Advanced Collectors**: groupingBy, partitioningBy, custom collectors
- **Enterprise Patterns**: Production-ready code, error handling, design patterns
- **Interview Preparation**: Practical, theoretical, and scenario-based questions

### Prerequisites
- Basic understanding of Java syntax
- Familiarity with OOP concepts
- Eagerness to learn and experiment!

---

## Java 8 Fundamentals

### What Changed in Java 8?

Java 8 introduced **functional programming** capabilities to Java, making code:
- More **concise** and **readable**
- More **maintainable** and **testable**
- Better suited for **parallel processing**

### Key Features Overview

1. **Lambda Expressions** - Anonymous functions
2. **Streams API** - Functional-style data processing
3. **Functional Interfaces** - Single abstract method interfaces
4. **Method References** - Shorthand for lambdas
5. **Optional** - Null-safe container
6. **Default Methods** - Interface evolution
7. **Date/Time API** - Modern date handling

---

## Java 8 Streams - Deep Dive

### What is a Stream?

A **Stream** is a sequence of elements supporting sequential and parallel aggregate operations. Think of it as a pipeline for data transformation.

```
Source → Intermediate Operations → Terminal Operation → Result
```

### Stream Characteristics

- **Non-mutating**: Operations don't modify the source
- **Lazy evaluation**: Operations execute only when terminal operation is called
- **Functional**: Operations are stateless and side-effect free (ideally)
- **Potentially unbounded**: Can work with infinite streams

### Creating Streams

```java
// From Collection
List<String> list = Arrays.asList("a", "b", "c");
Stream<String> stream = list.stream();

// From Array
String[] array = {"a", "b", "c"};
Stream<String> stream = Arrays.stream(array);

// Using Stream.of()
Stream<String> stream = Stream.of("a", "b", "c");

// Using Stream.builder()
Stream<String> stream = Stream.<String>builder()
    .add("a").add("b").add("c").build();

// Infinite streams
Stream<Integer> infinite = Stream.iterate(0, n -> n + 2);
Stream<Double> random = Stream.generate(Math::random);
```

### Intermediate Operations

#### 1. filter() - Filter elements based on condition

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

// Filter even numbers
List<Integer> evens = numbers.stream()
    .filter(n -> n % 2 == 0)
    .collect(Collectors.toList());
// Result: [2, 4, 6, 8, 10]

// Filter with complex condition
List<String> names = Arrays.asList("John", "Jane", "Bob", "Alice");
List<String> longNames = names.stream()
    .filter(name -> name.length() > 3)
    .filter(name -> name.startsWith("J"))
    .collect(Collectors.toList());
// Result: [John, Jane]
```

#### 2. map() - Transform each element

```java
// Convert to uppercase
List<String> names = Arrays.asList("john", "jane", "bob");
List<String> upper = names.stream()
    .map(String::toUpperCase)
    .collect(Collectors.toList());
// Result: [JOHN, JANE, BOB]

// Extract property
List<Person> people = getPeople();
List<String> names = people.stream()
    .map(Person::getName)
    .collect(Collectors.toList());

// Transform to different type
List<String> numbers = Arrays.asList("1", "2", "3");
List<Integer> integers = numbers.stream()
    .map(Integer::parseInt)
    .collect(Collectors.toList());
```

#### 3. flatMap() - Flatten nested structures

```java
// Flatten list of lists
List<List<Integer>> nested = Arrays.asList(
    Arrays.asList(1, 2, 3),
    Arrays.asList(4, 5),
    Arrays.asList(6, 7, 8)
);

List<Integer> flattened = nested.stream()
    .flatMap(List::stream)
    .collect(Collectors.toList());
// Result: [1, 2, 3, 4, 5, 6, 7, 8]

// Extract and flatten
List<Order> orders = getOrders();
List<OrderItem> allItems = orders.stream()
    .flatMap(order -> order.getItems().stream())
    .collect(Collectors.toList());
```

#### 4. distinct() - Remove duplicates

```java
List<Integer> numbers = Arrays.asList(1, 2, 2, 3, 3, 3, 4);
List<Integer> unique = numbers.stream()
    .distinct()
    .collect(Collectors.toList());
// Result: [1, 2, 3, 4]
```

#### 5. sorted() - Sort elements

```java
// Natural order
List<String> names = Arrays.asList("Bob", "Alice", "Charlie");
List<String> sorted = names.stream()
    .sorted()
    .collect(Collectors.toList());
// Result: [Alice, Bob, Charlie]

// Custom comparator
List<Person> people = getPeople();
List<Person> sortedByAge = people.stream()
    .sorted(Comparator.comparing(Person::getAge).reversed())
    .collect(Collectors.toList());
```

#### 6. peek() - Debug/observe elements (use carefully!)

```java
List<String> names = Arrays.asList("John", "Jane", "Bob");
List<String> result = names.stream()
    .peek(System.out::println)  // Debug: see each element
    .map(String::toUpperCase)
    .peek(System.out::println)  // Debug: see transformed element
    .collect(Collectors.toList());
```

#### 7. limit() & skip() - Pagination

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

// First 5 elements
List<Integer> first5 = numbers.stream()
    .limit(5)
    .collect(Collectors.toList());
// Result: [1, 2, 3, 4, 5]

// Skip first 3, take next 5
List<Integer> page = numbers.stream()
    .skip(3)
    .limit(5)
    .collect(Collectors.toList());
// Result: [4, 5, 6, 7, 8]
```

### Terminal Operations

#### 1. collect() - Collect to Collection

```java
// To List
List<String> list = stream.collect(Collectors.toList());

// To Set
Set<String> set = stream.collect(Collectors.toSet());

// To Map
Map<String, Integer> map = people.stream()
    .collect(Collectors.toMap(
        Person::getName,
        Person::getAge
    ));
```

#### 2. forEach() - Perform action on each element

```java
names.stream()
    .forEach(System.out::println);

// Prefer method reference
names.forEach(System.out::println);
```

#### 3. reduce() - Reduce to single value

```java
// Sum of numbers
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
Integer sum = numbers.stream()
    .reduce(0, Integer::sum);
// Result: 15

// Find maximum
Optional<Integer> max = numbers.stream()
    .reduce(Integer::max);

// Concatenate strings
List<String> words = Arrays.asList("Hello", "World", "Java");
String result = words.stream()
    .reduce("", (a, b) -> a + " " + b);
```

#### 4. findFirst() & findAny() - Find element

```java
Optional<String> first = names.stream()
    .filter(name -> name.startsWith("J"))
    .findFirst();

Optional<String> any = names.parallelStream()
    .filter(name -> name.startsWith("J"))
    .findAny();  // Better for parallel streams
```

#### 5. anyMatch(), allMatch(), noneMatch() - Boolean checks

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);

boolean hasEven = numbers.stream()
    .anyMatch(n -> n % 2 == 0);  // true

boolean allPositive = numbers.stream()
    .allMatch(n -> n > 0);  // true

boolean noneNegative = numbers.stream()
    .noneMatch(n -> n < 0);  // true
```

#### 6. count() - Count elements

```java
long count = names.stream()
    .filter(name -> name.length() > 3)
    .count();
```

---

## Advanced Collectors

### groupingBy() - Group by key

```java
// Group by category
List<Product> products = getProducts();
Map<String, List<Product>> byCategory = products.stream()
    .collect(Collectors.groupingBy(Product::getCategory));

// Group and count
Map<String, Long> countByCategory = products.stream()
    .collect(Collectors.groupingBy(
        Product::getCategory,
        Collectors.counting()
    ));

// Group and sum
Map<String, Double> totalByCategory = products.stream()
    .collect(Collectors.groupingBy(
        Product::getCategory,
        Collectors.summingDouble(Product::getPrice)
    ));

// Multi-level grouping
Map<String, Map<String, List<Product>>> nested = products.stream()
    .collect(Collectors.groupingBy(
        Product::getCategory,
        Collectors.groupingBy(Product::getBrand)
    ));
```

### partitioningBy() - Partition into two groups

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

// Partition into even and odd
Map<Boolean, List<Integer>> partitioned = numbers.stream()
    .collect(Collectors.partitioningBy(n -> n % 2 == 0));
// Result: {true=[2,4,6,8,10], false=[1,3,5,7,9]}

// Partition and count
Map<Boolean, Long> count = numbers.stream()
    .collect(Collectors.partitioningBy(
        n -> n % 2 == 0,
        Collectors.counting()
    ));
```

### summarizingInt/Double/Long - Statistics

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);

IntSummaryStatistics stats = numbers.stream()
    .collect(Collectors.summarizingInt(Integer::intValue));

System.out.println("Count: " + stats.getCount());
System.out.println("Sum: " + stats.getSum());
System.out.println("Min: " + stats.getMin());
System.out.println("Max: " + stats.getMax());
System.out.println("Average: " + stats.getAverage());
```

### mapping() - Transform before collecting

```java
// Group and map to different type
Map<String, List<String>> namesByCategory = products.stream()
    .collect(Collectors.groupingBy(
        Product::getCategory,
        Collectors.mapping(Product::getName, Collectors.toList())
    ));
```

### reducing() - Custom reduction

```java
// Find product with max price
Optional<Product> maxPrice = products.stream()
    .collect(Collectors.reducing(
        (p1, p2) -> p1.getPrice() > p2.getPrice() ? p1 : p2
    ));
```

### joining() - Concatenate strings

```java
List<String> names = Arrays.asList("John", "Jane", "Bob");
String joined = names.stream()
    .collect(Collectors.joining(", ", "[", "]"));
// Result: [John, Jane, Bob]
```

### Custom Collector

```java
public class CustomCollector {
    public static Collector<String, ?, List<String>> toSortedList() {
        return Collector.of(
            ArrayList::new,                    // Supplier
            List::add,                         // Accumulator
            (list1, list2) -> {               // Combiner
                list1.addAll(list2);
                return list1;
            },
            list -> {                          // Finisher
                list.sort(String::compareTo);
                return list;
            }
        );
    }
}

// Usage
List<String> sorted = names.stream()
    .collect(CustomCollector.toSortedList());
```

---

## Parallel Streams

### When to Use Parallel Streams?

**Use when:**
- Large datasets (millions of elements)
- CPU-intensive operations
- Independent operations (no shared state)
- Source is easily splittable (ArrayList, arrays)

**Avoid when:**
- Small datasets (overhead > benefit)
- Operations depend on order
- Shared mutable state
- I/O bound operations

### Example

```java
List<Integer> numbers = IntStream.range(0, 10_000_000)
    .boxed()
    .collect(Collectors.toList());

// Sequential
long start = System.currentTimeMillis();
long sum = numbers.stream()
    .mapToLong(Integer::longValue)
    .sum();
long sequentialTime = System.currentTimeMillis() - start;

// Parallel
start = System.currentTimeMillis();
sum = numbers.parallelStream()
    .mapToLong(Integer::longValue)
    .sum();
long parallelTime = System.currentTimeMillis() - start;

System.out.println("Sequential: " + sequentialTime + "ms");
System.out.println("Parallel: " + parallelTime + "ms");
```

### Pitfalls

1. **Thread Safety**: Ensure operations are thread-safe
2. **Ordering**: Parallel streams may not preserve order
3. **ForkJoinPool**: Uses common pool (can affect other tasks)
4. **Overhead**: Small datasets may be slower

---

## Functional Interfaces & Method References

### Built-in Functional Interfaces

#### Predicate<T> - Boolean function

```java
Predicate<String> isLong = s -> s.length() > 5;
Predicate<String> startsWithA = s -> s.startsWith("A");

// Chaining
Predicate<String> combined = isLong.and(startsWithA);

// Usage
List<String> filtered = names.stream()
    .filter(combined)
    .collect(Collectors.toList());
```

#### Function<T, R> - Transform function

```java
Function<String, Integer> length = String::length;
Function<Integer, Integer> square = n -> n * n;

// Chaining
Function<String, Integer> lengthSquared = length.andThen(square);

// Usage
Integer result = lengthSquared.apply("Hello");  // 25
```

#### Consumer<T> - Consume without return

```java
Consumer<String> printer = System.out::println;
Consumer<String> logger = s -> log.info(s);

// Chaining
Consumer<String> both = printer.andThen(logger);
```

#### Supplier<T> - Provide value

```java
Supplier<String> greeting = () -> "Hello";
Supplier<LocalDateTime> now = LocalDateTime::now;
Supplier<List<String>> emptyList = ArrayList::new;
```

#### BiFunction<T, U, R> - Two-argument function

```java
BiFunction<Integer, Integer, Integer> add = Integer::sum;
BiFunction<String, String, String> concat = String::concat;
```

### Method References

**Types:**
1. **Static**: `ClassName::staticMethod`
2. **Instance**: `instance::instanceMethod`
3. **Arbitrary Object**: `ClassName::instanceMethod`
4. **Constructor**: `ClassName::new`

```java
// Static method reference
Function<String, Integer> parseInt = Integer::parseInt;

// Instance method reference
String str = "Hello";
Supplier<Integer> length = str::length;

// Arbitrary object method reference
List<String> names = Arrays.asList("John", "Jane");
names.forEach(String::toUpperCase);  // Equivalent to: s -> s.toUpperCase()

// Constructor reference
Supplier<List<String>> listSupplier = ArrayList::new;
Function<Integer, List<String>> listFunction = ArrayList::new;  // Wrong!
Function<Integer, List<String>> listFunction = size -> new ArrayList<>(size);
```

---

## Optional Class

### Why Optional?

- **Explicit null handling**
- **Prevent NullPointerException**
- **API clarity** (method may return no value)

### Creating Optional

```java
// Empty
Optional<String> empty = Optional.empty();

// Non-null value
Optional<String> value = Optional.of("Hello");

// Nullable (may be null)
Optional<String> nullable = Optional.ofNullable(getString());
```

### Using Optional

```java
Optional<String> name = Optional.of("John");

// Check if present
if (name.isPresent()) {
    System.out.println(name.get());
}

// Functional style (preferred)
name.ifPresent(System.out::println);

// Default value
String result = name.orElse("Unknown");
String result2 = name.orElseGet(() -> getDefaultName());

// Throw exception if empty
String result3 = name.orElseThrow(() -> new IllegalArgumentException("Name required"));

// Transform
Optional<Integer> length = name.map(String::length);
Optional<String> upper = name.map(String::toUpperCase);

// FlatMap (when transformation returns Optional)
Optional<String> flatMapped = name.flatMap(this::findByName);
```

### Best Practices

```java
// ❌ BAD: Using Optional.get() without check
String name = optional.get();  // NPE if empty!

// ✅ GOOD: Use orElse/orElseGet
String name = optional.orElse("Default");

// ❌ BAD: Using Optional for fields/parameters
class Person {
    private Optional<String> name;  // Don't do this!
}

// ✅ GOOD: Use Optional for return types
public Optional<String> findName() {
    // ...
}

// ❌ BAD: Nested Optionals
Optional<Optional<String>> nested;  // Use flatMap!

// ✅ GOOD: Chain with flatMap
Optional<String> result = optional
    .flatMap(this::methodReturningOptional);
```

---

## Java 9+ Features

### Java 9

#### Modules (Project Jigsaw)

```java
// module-info.java
module com.example.app {
    requires java.base;
    requires java.logging;
    exports com.example.api;
}
```

#### Stream Improvements

```java
// takeWhile / dropWhile
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

List<Integer> taken = numbers.stream()
    .takeWhile(n -> n < 5)
    .collect(Collectors.toList());
// Result: [1, 2, 3, 4]

List<Integer> dropped = numbers.stream()
    .dropWhile(n -> n < 5)
    .collect(Collectors.toList());
// Result: [5, 6, 7, 8, 9, 10]

// iterate with predicate
Stream.iterate(0, n -> n < 10, n -> n + 1)
    .forEach(System.out::println);
```

#### Optional Improvements

```java
Optional<String> name = Optional.of("John");

// ifPresentOrElse
name.ifPresentOrElse(
    System.out::println,
    () -> System.out.println("Not found")
);

// or
Optional<String> result = name.or(() -> Optional.of("Default"));
```

### Java 10

#### var Keyword (Local Variable Type Inference)

```java
// Instead of
List<String> names = new ArrayList<>();
Map<String, Integer> map = new HashMap<>();

// Can write
var names = new ArrayList<String>();
var map = new HashMap<String, Integer>();

// But NOT for:
// - Fields
// - Method parameters
// - Return types
// - Lambda parameters
```

### Java 11

#### String Methods

```java
String str = "  Hello World  ";

str.isBlank();        // true if empty or whitespace
str.strip();          // trim Unicode whitespace
str.stripLeading();
str.stripTrailing();
str.repeat(3);        // "  Hello World    Hello World    Hello World  "
str.lines();          // Stream<String> of lines
```

#### Files Methods

```java
String content = Files.readString(path);
Files.writeString(path, content);
```

### Java 14

#### Switch Expressions

```java
// Old way
int day = 1;
String dayName;
switch (day) {
    case 1: dayName = "Monday"; break;
    case 2: dayName = "Tuesday"; break;
    default: dayName = "Unknown";
}

// New way
String dayName = switch (day) {
    case 1 -> "Monday";
    case 2 -> "Tuesday";
    default -> "Unknown";
};

// With yield
int result = switch (day) {
    case 1, 2, 3, 4, 5 -> {
        System.out.println("Weekday");
        yield day * 2;
    }
    case 6, 7 -> {
        System.out.println("Weekend");
        yield day * 3;
    }
    default -> 0;
};
```

### Java 16

#### Records

```java
// Instead of verbose class
public record Person(String name, int age) {
    // Compact constructor
    public Person {
        if (age < 0) throw new IllegalArgumentException("Age must be positive");
    }
    
    // Custom methods
    public boolean isAdult() {
        return age >= 18;
    }
}

// Usage
Person person = new Person("John", 25);
System.out.println(person.name());  // Accessor methods
System.out.println(person.age());
```

#### Pattern Matching for instanceof

```java
// Old way
if (obj instanceof String) {
    String str = (String) obj;
    System.out.println(str.length());
}

// New way
if (obj instanceof String str) {
    System.out.println(str.length());  // str is automatically cast
}
```

### Java 17

#### Sealed Classes

```java
public sealed class Shape
    permits Circle, Rectangle, Triangle {
    // ...
}

public final class Circle extends Shape {
    private final double radius;
    // ...
}

public final class Rectangle extends Shape {
    private final double width, height;
    // ...
}
```

---

## Enterprise Patterns & Best Practices

### 1. Builder Pattern

```java
public class User {
    private final String name;
    private final String email;
    private final int age;
    private final List<String> roles;
    
    private User(Builder builder) {
        this.name = builder.name;
        this.email = builder.email;
        this.age = builder.age;
        this.roles = builder.roles;
    }
    
    public static class Builder {
        private String name;
        private String email;
        private int age;
        private List<String> roles = new ArrayList<>();
        
        public Builder name(String name) {
            this.name = name;
            return this;
        }
        
        public Builder email(String email) {
            this.email = email;
            return this;
        }
        
        public Builder age(int age) {
            this.age = age;
            return this;
        }
        
        public Builder role(String role) {
            this.roles.add(role);
            return this;
        }
        
        public User build() {
            validate();
            return new User(this);
        }
        
        private void validate() {
            if (name == null || name.isEmpty()) {
                throw new IllegalArgumentException("Name required");
            }
            // ... other validations
        }
    }
}

// Usage
User user = new User.Builder()
    .name("John Doe")
    .email("john@example.com")
    .age(30)
    .role("ADMIN")
    .role("USER")
    .build();
```

### 2. Strategy Pattern with Lambdas

```java
// Traditional way
interface PaymentStrategy {
    void pay(double amount);
}

class CreditCardPayment implements PaymentStrategy {
    public void pay(double amount) { /* ... */ }
}

// Modern way with lambdas
public class PaymentProcessor {
    private final Map<String, Function<Double, PaymentResult>> strategies;
    
    public PaymentProcessor() {
        strategies = Map.of(
            "CREDIT_CARD", amount -> processCreditCard(amount),
            "PAYPAL", amount -> processPayPal(amount),
            "BANK_TRANSFER", amount -> processBankTransfer(amount)
        );
    }
    
    public PaymentResult process(String method, double amount) {
        return strategies.getOrDefault(method, this::defaultPayment)
            .apply(amount);
    }
}
```

### 3. Error Handling in Streams

```java
// Wrapper for exception handling
public class StreamUtils {
    public static <T, R> Function<T, Optional<R>> safe(Function<T, R> function) {
        return t -> {
            try {
                return Optional.ofNullable(function.apply(t));
            } catch (Exception e) {
                log.error("Error processing element: " + t, e);
                return Optional.empty();
            }
        };
    }
}

// Usage
List<String> results = inputs.stream()
    .map(StreamUtils.safe(this::riskyOperation))
    .filter(Optional::isPresent)
    .map(Optional::get)
    .collect(Collectors.toList());
```

### 4. Data Processing Pipeline

```java
public class OrderProcessor {
    public ProcessingResult processOrders(List<Order> orders) {
        return orders.stream()
            .filter(this::isValidOrder)
            .peek(this::logOrder)
            .map(this::enrichOrder)
            .filter(this::hasSufficientInventory)
            .map(this::calculateTotal)
            .collect(Collectors.collectingAndThen(
                Collectors.toList(),
                this::createResult
            ));
    }
    
    private boolean isValidOrder(Order order) {
        return order != null 
            && order.getItems() != null 
            && !order.getItems().isEmpty();
    }
    
    private Order enrichOrder(Order order) {
        // Add customer info, pricing, etc.
        return order;
    }
    
    private boolean hasSufficientInventory(Order order) {
        return order.getItems().stream()
            .allMatch(item -> inventoryService.hasStock(item));
    }
    
    private Order calculateTotal(Order order) {
        double total = order.getItems().stream()
            .mapToDouble(item -> item.getPrice() * item.getQuantity())
            .sum();
        order.setTotal(total);
        return order;
    }
}
```

### 5. Immutable Collections

```java
// Java 9+ immutable collections
List<String> immutable = List.of("a", "b", "c");
Set<String> immutableSet = Set.of("a", "b", "c");
Map<String, Integer> immutableMap = Map.of("a", 1, "b", 2);

// For larger maps
Map<String, Integer> map = Map.ofEntries(
    entry("key1", 1),
    entry("key2", 2),
    entry("key3", 3)
);

// Unmodifiable wrapper
List<String> unmodifiable = Collections.unmodifiableList(new ArrayList<>());
```

---

## Multi-threading & Concurrency

### CompletableFuture (Java 8)

```java
// Async execution
CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
    // Long-running task
    return "Result";
});

// Chain operations
CompletableFuture<String> result = CompletableFuture
    .supplyAsync(() -> fetchData())
    .thenApply(data -> processData(data))
    .thenApply(processed -> formatData(processed))
    .exceptionally(ex -> handleError(ex));

// Combine futures
CompletableFuture<String> future1 = CompletableFuture.supplyAsync(() -> "Hello");
CompletableFuture<String> future2 = CompletableFuture.supplyAsync(() -> "World");

CompletableFuture<String> combined = future1.thenCombine(
    future2,
    (s1, s2) -> s1 + " " + s2
);

// Wait for all
CompletableFuture<Void> all = CompletableFuture.allOf(future1, future2);
all.join();
```

### ExecutorService with Streams

```java
ExecutorService executor = Executors.newFixedThreadPool(10);

List<CompletableFuture<String>> futures = urls.stream()
    .map(url -> CompletableFuture.supplyAsync(
        () -> fetchUrl(url),
        executor
    ))
    .collect(Collectors.toList());

List<String> results = futures.stream()
    .map(CompletableFuture::join)
    .collect(Collectors.toList());

executor.shutdown();
```

---

## Interview Questions

See [INTERVIEW_QUESTIONS.md](./INTERVIEW_QUESTIONS.md) for comprehensive interview questions with detailed answers.

---

## Scenario-Based Questions & Answers

See [SCENARIO_BASED_QA_INDEX.md](./SCENARIO_BASED_QA_INDEX.md) for **real-world production scenarios** with step-by-step solutions:

### Part 1: Core Java & JVM
- OutOfMemoryError diagnosis and resolution
- High CPU usage optimization
- Deadlock detection and prevention
- Garbage collection tuning
- Memory leak identification

**File**: [SCENARIO_BASED_QA_PART1.md](./SCENARIO_BASED_QA_PART1.md)

### Part 2: Spring Boot & Enterprise
- Application startup optimization
- Transaction management issues
- REST API error handling
- Database query optimization
- Connection pool management

**File**: [SCENARIO_BASED_QA_PART2.md](./SCENARIO_BASED_QA_PART2.md)

### Part 3: Concurrency, Design Patterns & Production
- Race condition fixes
- Thread pool configuration
- Scalable system design
- Performance debugging
- Application crash diagnosis

**File**: [SCENARIO_BASED_QA_PART3.md](./SCENARIO_BASED_QA_PART3.md)

Each scenario includes:
- ✅ Step-by-step diagnostic approach
- ✅ Code examples with best practices
- ✅ Common pitfalls and solutions
- ✅ Follow-up questions for deeper learning
- ✅ Tools and techniques for production debugging

---

## Architecture Diagrams

See [ARCHITECTURE_DIAGRAMS.md](./ARCHITECTURE_DIAGRAMS.md) for PlantUML diagrams illustrating:
- Stream processing flow
- Enterprise application architecture
- Module dependencies
- Data flow patterns

---

## Next Steps

1. **Practice**: Try all code examples
2. **Experiment**: Modify examples and see what happens
3. **Build**: Create a small project using these concepts
4. **Review**: Go through interview questions
5. **Read**: Java documentation and best practices

---

## Resources

- [Oracle Java Documentation](https://docs.oracle.com/javase/)
- [Baeldung Java Tutorials](https://www.baeldung.com/java-tutorial)
- [Java Streams Tutorial](https://www.baeldung.com/java-8-streams)

---

**Happy Learning! 🚀**

*Remember: Understanding comes from practice. Code, experiment, and don't hesitate to make mistakes!*
