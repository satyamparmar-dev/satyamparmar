# Java 8+ Interview Questions & Answers

> **Comprehensive Interview Preparation Guide**

---

## Table of Contents

1. [Practical Coding Questions](#practical-coding-questions)
2. [Theoretical Questions](#theoretical-questions)
3. [Scenario-Based Questions](#scenario-based-questions)
4. [Java 8 Streams Questions](#java-8-streams-questions)
5. [Functional Programming Questions](#functional-programming-questions)
6. [Concurrency & Multi-threading](#concurrency--multi-threading)
7. [Enterprise Patterns & Best Practices](#enterprise-patterns--best-practices)

---

## Practical Coding Questions

### Q1: Find the second highest salary from a list of employees

**Answer:**

```java
public class Employee {
    private String name;
    private double salary;
    // constructors, getters, setters
}

// Solution 1: Using streams
public Optional<Double> findSecondHighestSalary(List<Employee> employees) {
    return employees.stream()
        .map(Employee::getSalary)
        .distinct()
        .sorted(Comparator.reverseOrder())
        .skip(1)
        .findFirst();
}

// Solution 2: More efficient (single pass)
public Optional<Double> findSecondHighestSalaryEfficient(List<Employee> employees) {
    return employees.stream()
        .map(Employee::getSalary)
        .collect(Collectors.collectingAndThen(
            Collectors.toSet(),
            set -> set.stream()
                .sorted(Comparator.reverseOrder())
                .skip(1)
                .findFirst()
        ));
}
```

**Explanation:**
- `distinct()` removes duplicates
- `sorted(Comparator.reverseOrder())` sorts in descending order
- `skip(1)` skips the first (highest) element
- `findFirst()` gets the second highest

---

### Q2: Group employees by department and find average salary per department

**Answer:**

```java
public Map<String, Double> averageSalaryByDepartment(List<Employee> employees) {
    return employees.stream()
        .collect(Collectors.groupingBy(
            Employee::getDepartment,
            Collectors.averagingDouble(Employee::getSalary)
        ));
}

// With additional statistics
public Map<String, DoubleSummaryStatistics> salaryStatsByDepartment(
        List<Employee> employees) {
    return employees.stream()
        .collect(Collectors.groupingBy(
            Employee::getDepartment,
            Collectors.summarizingDouble(Employee::getSalary)
        ));
}
```

---

### Q3: Find all employees who have salary greater than average salary

**Answer:**

```java
public List<Employee> employeesAboveAverage(List<Employee> employees) {
    double average = employees.stream()
        .mapToDouble(Employee::getSalary)
        .average()
        .orElse(0.0);
    
    return employees.stream()
        .filter(e -> e.getSalary() > average)
        .collect(Collectors.toList());
}

// More efficient: single pass
public List<Employee> employeesAboveAverageEfficient(List<Employee> employees) {
    DoubleSummaryStatistics stats = employees.stream()
        .collect(Collectors.summarizingDouble(Employee::getSalary));
    
    return employees.stream()
        .filter(e -> e.getSalary() > stats.getAverage())
        .collect(Collectors.toList());
}
```

---

### Q4: Count frequency of each word in a list

**Answer:**

```java
public Map<String, Long> wordFrequency(List<String> words) {
    return words.stream()
        .collect(Collectors.groupingBy(
            Function.identity(),
            Collectors.counting()
        ));
}

// Case-insensitive version
public Map<String, Long> wordFrequencyCaseInsensitive(List<String> words) {
    return words.stream()
        .map(String::toLowerCase)
        .collect(Collectors.groupingBy(
            Function.identity(),
            Collectors.counting()
        ));
}
```

---

### Q5: Find the longest string in a list

**Answer:**

```java
public Optional<String> longestString(List<String> strings) {
    return strings.stream()
        .max(Comparator.comparingInt(String::length));
}

// Alternative: using reduce
public Optional<String> longestStringReduce(List<String> strings) {
    return strings.stream()
        .reduce((s1, s2) -> s1.length() > s2.length() ? s1 : s2);
}
```

---

### Q6: Check if all strings in a list are non-empty

**Answer:**

```java
public boolean allNonEmpty(List<String> strings) {
    return strings.stream()
        .allMatch(s -> s != null && !s.isEmpty());
}

// Using Optional
public boolean allNonEmptyOptional(List<String> strings) {
    return strings.stream()
        .map(Optional::ofNullable)
        .allMatch(opt -> opt.filter(s -> !s.isEmpty()).isPresent());
}
```

---

### Q7: Convert list of strings to uppercase and remove duplicates

**Answer:**

```java
public List<String> uppercaseUnique(List<String> strings) {
    return strings.stream()
        .map(String::toUpperCase)
        .distinct()
        .collect(Collectors.toList());
}

// Preserve order and use LinkedHashSet
public List<String> uppercaseUniqueOrdered(List<String> strings) {
    return strings.stream()
        .map(String::toUpperCase)
        .collect(Collectors.toCollection(LinkedHashSet::new))
        .stream()
        .collect(Collectors.toList());
}
```

---

### Q8: Find the first non-repeated character in a string

**Answer:**

```java
public Optional<Character> firstNonRepeated(String str) {
    Map<Character, Long> frequency = str.chars()
        .mapToObj(c -> (char) c)
        .collect(Collectors.groupingBy(
            Function.identity(),
            LinkedHashMap::new,  // Preserve insertion order
            Collectors.counting()
        ));
    
    return frequency.entrySet().stream()
        .filter(entry -> entry.getValue() == 1)
        .map(Map.Entry::getKey)
        .findFirst();
}
```

---

### Q9: Partition list into even and odd numbers

**Answer:**

```java
public Map<Boolean, List<Integer>> partitionEvenOdd(List<Integer> numbers) {
    return numbers.stream()
        .collect(Collectors.partitioningBy(n -> n % 2 == 0));
}

// With additional processing
public Map<Boolean, Long> countEvenOdd(List<Integer> numbers) {
    return numbers.stream()
        .collect(Collectors.partitioningBy(
            n -> n % 2 == 0,
            Collectors.counting()
        ));
}
```

---

### Q10: Flatten a list of lists

**Answer:**

```java
public <T> List<T> flatten(List<List<T>> listOfLists) {
    return listOfLists.stream()
        .flatMap(List::stream)
        .collect(Collectors.toList());
}

// With filtering
public <T> List<T> flattenAndFilter(List<List<T>> listOfLists, 
                                     Predicate<T> predicate) {
    return listOfLists.stream()
        .flatMap(List::stream)
        .filter(predicate)
        .collect(Collectors.toList());
}
```

---

## Theoretical Questions

### Q1: What is a Stream in Java 8? How is it different from a Collection?

**Answer:**

**Stream:**
- A sequence of elements supporting sequential and parallel aggregate operations
- Not a data structure; doesn't store elements
- Functional in nature; operations don't modify the source
- Lazy evaluation; operations execute only when terminal operation is called
- Can be unbounded (infinite)
- Consumable; can only be traversed once

**Collection:**
- Data structure that stores elements
- Can be modified
- Eager evaluation
- Bounded (finite)
- Can be traversed multiple times

**Key Differences:**
1. **Storage**: Collections store data; Streams don't
2. **Modification**: Collections can be modified; Streams are immutable
3. **Traversal**: Collections can be traversed multiple times; Streams only once
4. **Evaluation**: Collections are eager; Streams are lazy
5. **Purpose**: Collections for data storage; Streams for data processing

---

### Q2: Explain the difference between map() and flatMap()

**Answer:**

**map():**
- Transforms each element to another element
- One-to-one mapping
- Input: Stream<T>, Output: Stream<R>

```java
List<String> names = Arrays.asList("John", "Jane");
List<Integer> lengths = names.stream()
    .map(String::length)  // "John" -> 4, "Jane" -> 4
    .collect(Collectors.toList());
// Result: [4, 4]
```

**flatMap():**
- Transforms each element to a stream, then flattens all streams into one
- One-to-many mapping
- Input: Stream<T>, Output: Stream<R> (flattened)

```java
List<List<String>> nested = Arrays.asList(
    Arrays.asList("John", "Jane"),
    Arrays.asList("Bob", "Alice")
);
List<String> flattened = nested.stream()
    .flatMap(List::stream)  // Flattens nested lists
    .collect(Collectors.toList());
// Result: [John, Jane, Bob, Alice]
```

**When to use:**
- `map()`: When transforming each element to a single new element
- `flatMap()`: When each element maps to multiple elements or needs flattening

---

### Q3: What are Functional Interfaces? Name the important ones in Java 8.

**Answer:**

**Functional Interface:**
- An interface with exactly one abstract method
- Can have multiple default and static methods
- Can be annotated with `@FunctionalInterface` (optional but recommended)

**Important Functional Interfaces:**

1. **Predicate<T>**: `boolean test(T t)` - Boolean function
2. **Function<T, R>**: `R apply(T t)` - Transform function
3. **Consumer<T>**: `void accept(T t)` - Consume without return
4. **Supplier<T>**: `T get()` - Provide value
5. **BiFunction<T, U, R>**: `R apply(T t, U u)` - Two-argument function
6. **UnaryOperator<T>**: `T apply(T t)` - Function where input = output
7. **BinaryOperator<T>**: `T apply(T t1, T t2)` - Binary operation
8. **BiPredicate<T, U>**: `boolean test(T t, U u)` - Two-argument predicate
9. **BiConsumer<T, U>**: `void accept(T t, U u)` - Two-argument consumer

**Example:**
```java
@FunctionalInterface
public interface MyFunctionalInterface {
    void doSomething(String input);
    
    // Can have default methods
    default void doSomethingElse() {
        System.out.println("Default implementation");
    }
    
    // Can have static methods
    static void staticMethod() {
        System.out.println("Static method");
    }
}
```

---

### Q4: Explain Optional class. When should it be used?

**Answer:**

**Optional:**
- A container object that may or may not contain a non-null value
- Introduced to handle null values more explicitly
- Forces developers to handle absence of value

**When to use:**
- ✅ Return types of methods that may not return a value
- ✅ To avoid NullPointerException
- ✅ To make API contracts explicit
- ❌ NOT for fields, method parameters, or in collections

**Best Practices:**
```java
// ✅ GOOD: Return type
public Optional<User> findUser(String id) {
    // ...
}

// ❌ BAD: Field
private Optional<String> name;  // Don't do this!

// ❌ BAD: Parameter
public void process(Optional<String> input) {  // Don't do this!
    // ...
}

// ✅ GOOD: Usage
Optional<String> name = findName();
String result = name.orElse("Unknown");
name.ifPresent(System.out::println);
```

---

### Q5: What is the difference between intermediate and terminal operations?

**Answer:**

**Intermediate Operations:**
- Return a new Stream
- Lazy evaluation (not executed until terminal operation)
- Can be chained
- Examples: `filter()`, `map()`, `flatMap()`, `distinct()`, `sorted()`, `peek()`, `limit()`, `skip()`

**Terminal Operations:**
- Trigger execution of the stream pipeline
- Return a non-stream result (or void)
- Stream is consumed after terminal operation
- Examples: `collect()`, `forEach()`, `reduce()`, `findFirst()`, `anyMatch()`, `count()`, `min()`, `max()`

**Example:**
```java
List<Integer> result = numbers.stream()        // Source
    .filter(n -> n > 5)                        // Intermediate (lazy)
    .map(n -> n * 2)                           // Intermediate (lazy)
    .sorted()                                  // Intermediate (lazy)
    .collect(Collectors.toList());             // Terminal (executes pipeline)
```

---

### Q6: Explain parallel streams. When should they be used?

**Answer:**

**Parallel Streams:**
- Streams that can process elements concurrently using multiple threads
- Use ForkJoinPool.commonPool() by default
- Elements are split and processed in parallel, then combined

**When to use:**
- ✅ Large datasets (millions of elements)
- ✅ CPU-intensive operations
- ✅ Independent operations (no shared state)
- ✅ Source is easily splittable (ArrayList, arrays)

**When NOT to use:**
- ❌ Small datasets (overhead > benefit)
- ❌ Operations depend on order
- ❌ Shared mutable state
- ❌ I/O bound operations

**Example:**
```java
// Sequential
long sum = numbers.stream()
    .mapToLong(Long::longValue)
    .sum();

// Parallel
long sum = numbers.parallelStream()
    .mapToLong(Long::longValue)
    .sum();
```

**Pitfalls:**
1. Thread safety: Ensure operations are thread-safe
2. Ordering: May not preserve order
3. Overhead: Small datasets may be slower
4. Blocking: Can block common pool, affecting other tasks

---

### Q7: What are Method References? Explain different types.

**Answer:**

**Method References:**
- Shorthand syntax for lambda expressions
- More readable when lambda just calls a method
- Types: Static, Instance, Arbitrary Object, Constructor

**Types:**

1. **Static Method Reference**: `ClassName::staticMethod`
```java
Function<String, Integer> parseInt = Integer::parseInt;
```

2. **Instance Method Reference**: `instance::instanceMethod`
```java
String str = "Hello";
Supplier<Integer> length = str::length;
```

3. **Arbitrary Object Method Reference**: `ClassName::instanceMethod`
```java
List<String> names = Arrays.asList("John", "Jane");
names.forEach(String::toUpperCase);  // Equivalent to: s -> s.toUpperCase()
```

4. **Constructor Reference**: `ClassName::new`
```java
Supplier<List<String>> listSupplier = ArrayList::new;
```

**When to use:**
- When lambda just calls an existing method
- For better readability
- When method signature matches functional interface

---

### Q8: Explain the difference between findFirst() and findAny()

**Answer:**

**findFirst():**
- Returns the first element of the stream
- Deterministic (always returns same element for same stream)
- Works well with sequential streams
- May be slower with parallel streams (needs to coordinate)

**findAny():**
- Returns any element from the stream
- Non-deterministic (may return different elements)
- Optimized for parallel streams
- Faster with parallel streams (no coordination needed)

**Example:**
```java
// Sequential - both behave similarly
Optional<String> first = names.stream()
    .filter(s -> s.startsWith("J"))
    .findFirst();

// Parallel - findAny is faster
Optional<String> any = names.parallelStream()
    .filter(s -> s.startsWith("J"))
    .findAny();  // May return any matching element
```

**When to use:**
- `findFirst()`: When you need the first element (order matters)
- `findAny()`: When any element is fine (parallel streams, performance)

---

## Scenario-Based Questions

### Q1: Design a system to process orders with validation, enrichment, and pricing

**Answer:**

```java
public class OrderProcessingService {
    
    public ProcessingResult processOrders(List<Order> orders) {
        return orders.stream()
            .filter(this::isValidOrder)
            .peek(this::logOrder)
            .map(this::enrichOrder)
            .filter(this::hasSufficientInventory)
            .map(this::calculatePricing)
            .map(this::applyDiscounts)
            .collect(Collectors.collectingAndThen(
                Collectors.toList(),
                this::createResult
            ));
    }
    
    private boolean isValidOrder(Order order) {
        return order != null 
            && order.getItems() != null 
            && !order.getItems().isEmpty()
            && order.getCustomerId() != null;
    }
    
    private Order enrichOrder(Order order) {
        Customer customer = customerService.findById(order.getCustomerId());
        order.setCustomer(customer);
        order.setShippingAddress(customer.getDefaultAddress());
        return order;
    }
    
    private boolean hasSufficientInventory(Order order) {
        return order.getItems().stream()
            .allMatch(item -> inventoryService.hasStock(
                item.getProductId(), 
                item.getQuantity()
            ));
    }
    
    private Order calculatePricing(Order order) {
        double subtotal = order.getItems().stream()
            .mapToDouble(item -> {
                Product product = productService.findById(item.getProductId());
                return product.getPrice() * item.getQuantity();
            })
            .sum();
        
        order.setSubtotal(subtotal);
        order.setTax(subtotal * 0.1); // 10% tax
        order.setTotal(subtotal + order.getTax());
        return order;
    }
    
    private Order applyDiscounts(Order order) {
        // Apply customer-specific discounts
        double discount = discountService.calculateDiscount(order);
        order.setDiscount(discount);
        order.setTotal(order.getTotal() - discount);
        return order;
    }
    
    private ProcessingResult createResult(List<Order> processedOrders) {
        return ProcessingResult.builder()
            .processedCount(processedOrders.size())
            .totalValue(processedOrders.stream()
                .mapToDouble(Order::getTotal)
                .sum())
            .orders(processedOrders)
            .build();
    }
}
```

---

### Q2: How would you handle exceptions in a stream pipeline?

**Answer:**

**Option 1: Wrapper Function**
```java
public class StreamUtils {
    public static <T, R> Function<T, Optional<R>> safe(
            Function<T, R> function) {
        return t -> {
            try {
                return Optional.ofNullable(function.apply(t));
            } catch (Exception e) {
                log.error("Error processing: " + t, e);
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

**Option 2: Custom Collector**
```java
public class ExceptionHandlingCollector {
    public static <T> Collector<T, ?, List<T>> collectingWithErrorHandling(
            Consumer<T> processor) {
        return Collector.of(
            ArrayList::new,
            (list, item) -> {
                try {
                    processor.accept(item);
                    list.add(item);
                } catch (Exception e) {
                    log.error("Error processing item: " + item, e);
                }
            },
            (list1, list2) -> {
                list1.addAll(list2);
                return list1;
            }
        );
    }
}
```

**Option 3: Try-Catch in Lambda (Not Recommended)**
```java
List<String> results = inputs.stream()
    .map(input -> {
        try {
            return riskyOperation(input);
        } catch (Exception e) {
            log.error("Error", e);
            return null;
        }
    })
    .filter(Objects::nonNull)
    .collect(Collectors.toList());
```

---

### Q3: Design a caching mechanism using Java 8 features

**Answer:**

```java
public class Cache<K, V> {
    private final Map<K, V> cache = new ConcurrentHashMap<>();
    private final Function<K, V> loader;
    private final long ttlMillis;
    private final Map<K, Long> timestamps = new ConcurrentHashMap<>();
    
    public Cache(Function<K, V> loader, long ttlMillis) {
        this.loader = loader;
        this.ttlMillis = ttlMillis;
    }
    
    public V get(K key) {
        return cache.computeIfAbsent(key, k -> {
            timestamps.put(k, System.currentTimeMillis());
            return loader.apply(k);
        });
    }
    
    public void evictExpired() {
        long now = System.currentTimeMillis();
        timestamps.entrySet().stream()
            .filter(entry -> now - entry.getValue() > ttlMillis)
            .map(Map.Entry::getKey)
            .forEach(key -> {
                cache.remove(key);
                timestamps.remove(key);
            });
    }
    
    public void clear() {
        cache.clear();
        timestamps.clear();
    }
}

// Usage
Cache<String, User> userCache = new Cache<>(
    userId -> userService.findById(userId),
    Duration.ofMinutes(10).toMillis()
);

User user = userCache.get("123");
```

---

### Q4: How would you optimize a slow stream operation?

**Answer:**

**Optimization Strategies:**

1. **Use Parallel Streams (for large datasets)**
```java
List<Result> results = largeList.parallelStream()
    .map(this::expensiveOperation)
    .collect(Collectors.toList());
```

2. **Filter Early**
```java
// ❌ BAD: Expensive operation on all elements
List<Result> results = items.stream()
    .map(this::expensiveOperation)
    .filter(this::isValid)
    .collect(Collectors.toList());

// ✅ GOOD: Filter first
List<Result> results = items.stream()
    .filter(this::isValid)
    .map(this::expensiveOperation)
    .collect(Collectors.toList());
```

3. **Use Primitive Streams**
```java
// ❌ BAD: Boxing overhead
int sum = numbers.stream()
    .mapToInt(Integer::intValue)
    .sum();

// ✅ GOOD: Direct primitive stream
int sum = numbers.stream()
    .mapToInt(i -> i)
    .sum();
```

4. **Limit Early**
```java
List<Result> results = items.stream()
    .filter(this::isValid)
    .limit(100)  // Stop processing after 100
    .map(this::expensiveOperation)
    .collect(Collectors.toList());
```

5. **Avoid Multiple Terminal Operations**
```java
// ❌ BAD: Multiple passes
long count = items.stream().count();
List<Item> filtered = items.stream()
    .filter(this::isValid)
    .collect(Collectors.toList());

// ✅ GOOD: Single pass
List<Item> filtered = items.stream()
    .filter(this::isValid)
    .collect(Collectors.toList());
long count = filtered.size();
```

---

## Java 8 Streams Questions

### Q1: Write a stream operation to find the employee with maximum salary

**Answer:**

```java
Optional<Employee> maxSalaryEmployee = employees.stream()
    .max(Comparator.comparing(Employee::getSalary));

// With null handling
Employee maxEmployee = employees.stream()
    .max(Comparator.comparing(Employee::getSalary))
    .orElseThrow(() -> new NoSuchElementException("No employees found"));
```

---

### Q2: How to convert a Map to a List using streams?

**Answer:**

```java
// Convert Map entries to List
Map<String, Integer> map = new HashMap<>();
List<Map.Entry<String, Integer>> entries = map.entrySet().stream()
    .collect(Collectors.toList());

// Convert keys to List
List<String> keys = map.keySet().stream()
    .collect(Collectors.toList());

// Convert values to List
List<Integer> values = map.values().stream()
    .collect(Collectors.toList());

// Convert to custom objects
List<KeyValuePair> pairs = map.entrySet().stream()
    .map(entry -> new KeyValuePair(entry.getKey(), entry.getValue()))
    .collect(Collectors.toList());
```

---

### Q3: How to sort a list of objects by multiple fields?

**Answer:**

```java
// Sort by name, then by age
List<Person> sorted = people.stream()
    .sorted(Comparator
        .comparing(Person::getName)
        .thenComparing(Person::getAge))
    .collect(Collectors.toList());

// Sort by name (descending), then by age (ascending)
List<Person> sorted = people.stream()
    .sorted(Comparator
        .comparing(Person::getName, Comparator.reverseOrder())
        .thenComparing(Person::getAge))
    .collect(Collectors.toList());

// Custom comparator
List<Person> sorted = people.stream()
    .sorted((p1, p2) -> {
        int nameCompare = p1.getName().compareTo(p2.getName());
        if (nameCompare != 0) return nameCompare;
        return Integer.compare(p1.getAge(), p2.getAge());
    })
    .collect(Collectors.toList());
```

---

## Functional Programming Questions

### Q1: Explain the difference between imperative and functional programming in Java 8

**Answer:**

**Imperative (Traditional Java):**
```java
List<Integer> evens = new ArrayList<>();
for (Integer num : numbers) {
    if (num % 2 == 0) {
        evens.add(num);
    }
}
```

**Functional (Java 8):**
```java
List<Integer> evens = numbers.stream()
    .filter(n -> n % 2 == 0)
    .collect(Collectors.toList());
```

**Key Differences:**
- **Imperative**: How to do (step-by-step instructions)
- **Functional**: What to do (declarative)
- **Mutability**: Imperative often uses mutable state; Functional prefers immutability
- **Side Effects**: Imperative allows side effects; Functional minimizes them

---

### Q2: What is a pure function? Give an example.

**Answer:**

**Pure Function:**
- Always returns the same output for the same input
- Has no side effects (doesn't modify external state)
- Doesn't depend on external mutable state

**Example:**
```java
// ✅ Pure function
public int add(int a, int b) {
    return a + b;
}

// ❌ Not pure (depends on external state)
private int counter = 0;
public int increment() {
    return ++counter;  // Side effect: modifies counter
}

// ❌ Not pure (depends on external state)
public int getCurrentTime() {
    return System.currentTimeMillis();  // Different output each time
}
```

---

## Concurrency & Multi-threading

### Q1: How does CompletableFuture work? Give examples.

**Answer:**

**CompletableFuture:**
- Represents a future result of an asynchronous computation
- Can be chained and combined
- Introduced in Java 8

**Examples:**

```java
// Basic usage
CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
    return "Hello";
});

// Chain operations
CompletableFuture<String> result = CompletableFuture
    .supplyAsync(() -> fetchData())
    .thenApply(data -> processData(data))
    .thenApply(processed -> formatData(processed));

// Handle exceptions
CompletableFuture<String> result = CompletableFuture
    .supplyAsync(() -> riskyOperation())
    .exceptionally(ex -> {
        log.error("Error", ex);
        return "Default value";
    });

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

---

### Q2: Explain the difference between parallel streams and CompletableFuture

**Answer:**

**Parallel Streams:**
- Process data in parallel
- Best for: Data processing pipelines
- Uses: ForkJoinPool.commonPool()
- Suited for: CPU-intensive operations on collections

**CompletableFuture:**
- Execute tasks asynchronously
- Best for: Independent async tasks
- Uses: Custom ExecutorService or common pool
- Suited for: I/O operations, independent tasks

**When to use:**
- **Parallel Streams**: Processing large collections with CPU-intensive operations
- **CompletableFuture**: Independent async tasks, I/O operations, combining results from multiple sources

---

## Enterprise Patterns & Best Practices

### Q1: How would you implement a retry mechanism using Java 8?

**Answer:**

```java
public class RetryUtil {
    public static <T> T retry(Supplier<T> operation, int maxRetries) {
        int attempts = 0;
        Exception lastException = null;
        
        while (attempts < maxRetries) {
            try {
                return operation.get();
            } catch (Exception e) {
                lastException = e;
                attempts++;
                if (attempts < maxRetries) {
                    try {
                        Thread.sleep(1000 * attempts); // Exponential backoff
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new RuntimeException(ie);
                    }
                }
            }
        }
        
        throw new RuntimeException("Operation failed after " + maxRetries + " attempts", 
                                  lastException);
    }
}

// Usage
String result = RetryUtil.retry(
    () -> apiService.call(),
    3
);
```

---

### Q2: Design a service that processes data in batches

**Answer:**

```java
public class BatchProcessor<T> {
    private final int batchSize;
    private final Function<List<T>, List<Result>> processor;
    
    public BatchProcessor(int batchSize, Function<List<T>, List<Result>> processor) {
        this.batchSize = batchSize;
        this.processor = processor;
    }
    
    public List<Result> process(List<T> items) {
        return IntStream.range(0, (items.size() + batchSize - 1) / batchSize)
            .mapToObj(i -> items.subList(
                i * batchSize,
                Math.min((i + 1) * batchSize, items.size())
            ))
            .map(processor)
            .flatMap(List::stream)
            .collect(Collectors.toList());
    }
    
    // Parallel processing
    public List<Result> processParallel(List<T> items) {
        return IntStream.range(0, (items.size() + batchSize - 1) / batchSize)
            .parallel()
            .mapToObj(i -> items.subList(
                i * batchSize,
                Math.min((i + 1) * batchSize, items.size())
            ))
            .map(processor)
            .flatMap(List::stream)
            .collect(Collectors.toList());
    }
}

// Usage
BatchProcessor<Order> processor = new BatchProcessor<>(
    100,
    orders -> orderService.processBatch(orders)
);

List<Result> results = processor.process(allOrders);
```

---

## Summary

This guide covers:
- ✅ Practical coding problems with solutions
- ✅ Theoretical concepts explained in detail
- ✅ Real-world scenario-based questions
- ✅ Best practices and patterns
- ✅ Enterprise application examples

**Key Takeaways:**
1. Master streams, lambdas, and functional interfaces
2. Understand when to use parallel streams
3. Practice with real-world scenarios
4. Learn design patterns and best practices
5. Prepare for both coding and theoretical questions

**Next Steps:**
- Practice all coding questions
- Experiment with different approaches
- Build small projects using these concepts
- Review Java documentation
- Join coding communities for practice

---

**Good luck with your interviews! 🚀**
