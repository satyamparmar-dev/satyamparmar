# Java Stream API cheat sheet

*Every Stream method with a one-liner example — filter, map, flatMap, collect, groupingBy, partitioningBy, reduce, and the ones that trip people up in code review and interviews.*

*Requires Java 8+. Examples use `List<Order>` and `List<String>` for concreteness.*

---

## Why Streams matter in production Java

Streams let you express data transformations as a readable pipeline instead of nested loops. They do not replace all loops — use them where the intent is clearer, not just to be "modern". Performance is usually comparable to loops; parallelStream() adds overhead and is rarely the right default.

---

## Creating a Stream

```java
// From a Collection
Stream<String> s1 = list.stream();

// From an array
Stream<String> s2 = Arrays.stream(array);

// Inline values
Stream<String> s3 = Stream.of("a", "b", "c");

// Empty stream (good for null-safe returns)
Stream<String> s4 = Stream.empty();

// Infinite stream — limit() is required
Stream<Integer> naturals = Stream.iterate(1, n -> n + 1);
Stream<Double> randoms = Stream.generate(Math::random);

// IntStream / LongStream / DoubleStream (avoid boxing overhead)
IntStream range = IntStream.range(0, 10);       // 0..9
IntStream rangeC = IntStream.rangeClosed(1, 10); // 1..10
```

---

## Filtering and transforming (intermediate operations)

These are lazy — nothing executes until a terminal operation is called.

```java
List<Order> orders = getOrders();

// filter — keep elements matching a predicate
orders.stream()
      .filter(o -> o.getStatus() == ACTIVE)

// map — transform each element
orders.stream()
      .map(Order::getCustomerId)           // Stream<Long>

// mapToInt / mapToLong / mapToDouble — avoid boxing
orders.stream()
      .mapToInt(Order::getItemCount)       // IntStream

// flatMap — flatten one-to-many
// Each order has a list of items — flatten to a single item stream
orders.stream()
      .flatMap(o -> o.getItems().stream()) // Stream<Item>

// flatMapToInt
orders.stream()
      .flatMapToInt(o -> o.getItems().stream().mapToInt(Item::getQuantity))

// distinct — remove duplicates (uses equals/hashCode)
orders.stream()
      .map(Order::getCustomerId)
      .distinct()

// sorted — natural order
orders.stream()
      .sorted(Comparator.comparing(Order::getCreatedAt).reversed())

// peek — for debugging only — do NOT use for side effects
orders.stream()
      .peek(o -> log.debug("Processing: {}", o.getId()))
      .filter(...)

// limit / skip — pagination or truncation
orders.stream()
      .skip(20)
      .limit(10)  // page 3 of 10
```

---

## Collecting results (terminal operations)

```java
// toList() — Java 16+  (unmodifiable)
List<Long> ids = orders.stream()
                        .map(Order::getId)
                        .toList();

// Collectors.toList() — Java 8+ (modifiable)
List<Long> ids = orders.stream()
                        .map(Order::getId)
                        .collect(Collectors.toList());

// toSet()
Set<Long> customerIds = orders.stream()
                               .map(Order::getCustomerId)
                               .collect(Collectors.toSet());

// toUnmodifiableList / toUnmodifiableSet (Java 10+)
List<Order> snapshot = orders.stream()
                              .collect(Collectors.toUnmodifiableList());

// toMap — keys must be unique or you get IllegalStateException
Map<Long, Order> byId = orders.stream()
                               .collect(Collectors.toMap(Order::getId, o -> o));

// toMap with merge function — handle duplicate keys
Map<Long, Order> byCustomer = orders.stream()
    .collect(Collectors.toMap(
        Order::getCustomerId,
        o -> o,
        (existing, replacement) -> existing  // keep first
    ));

// joining — concatenate strings
String csv = orders.stream()
                   .map(Order::getReference)
                   .collect(Collectors.joining(", "));

// joining with prefix/suffix
String result = orders.stream()
                      .map(Order::getReference)
                      .collect(Collectors.joining(", ", "[", "]"));
// Output: [ORD-001, ORD-002, ORD-003]
```

---

## Grouping and partitioning

These are the most interview-relevant collectors.

```java
// groupingBy — group into Map<K, List<V>>
Map<OrderStatus, List<Order>> byStatus =
    orders.stream()
          .collect(Collectors.groupingBy(Order::getStatus));

// groupingBy with downstream collector
Map<OrderStatus, Long> countByStatus =
    orders.stream()
          .collect(Collectors.groupingBy(
              Order::getStatus,
              Collectors.counting()
          ));

Map<OrderStatus, Double> avgValueByStatus =
    orders.stream()
          .collect(Collectors.groupingBy(
              Order::getStatus,
              Collectors.averagingDouble(Order::getTotalValue)
          ));

Map<Long, List<String>> refsByCustomer =
    orders.stream()
          .collect(Collectors.groupingBy(
              Order::getCustomerId,
              Collectors.mapping(Order::getReference, Collectors.toList())
          ));

// partitioningBy — splits into Map<Boolean, List<V>>
Map<Boolean, List<Order>> partition =
    orders.stream()
          .collect(Collectors.partitioningBy(o -> o.getTotalValue() > 1000));

List<Order> highValue = partition.get(true);
List<Order> lowValue  = partition.get(false);

// Nested groupingBy (group by customer, then by status)
Map<Long, Map<OrderStatus, List<Order>>> nested =
    orders.stream()
          .collect(Collectors.groupingBy(
              Order::getCustomerId,
              Collectors.groupingBy(Order::getStatus)
          ));
```

---

## Reducing and summarising

```java
// count
long active = orders.stream()
                    .filter(o -> o.getStatus() == ACTIVE)
                    .count();

// sum / average / min / max on primitives (prefer these over reduce)
int totalItems = orders.stream()
                       .mapToInt(Order::getItemCount)
                       .sum();

OptionalDouble avg = orders.stream()
                           .mapToDouble(Order::getTotalValue)
                           .average();

OptionalInt max = orders.stream()
                        .mapToInt(Order::getItemCount)
                        .max();

// summingInt / summingDouble (as downstream collector)
Map<Long, Integer> itemsByCustomer =
    orders.stream()
          .collect(Collectors.groupingBy(
              Order::getCustomerId,
              Collectors.summingInt(Order::getItemCount)
          ));

// summarizingInt — mean, min, max, count, sum in one pass
IntSummaryStatistics stats = orders.stream()
                                   .mapToInt(Order::getItemCount)
                                   .summaryStatistics();
System.out.println("avg=" + stats.getAverage() + " max=" + stats.getMax());

// reduce — general purpose (use sum/count/etc when available)
Optional<Double> total = orders.stream()
                               .map(Order::getTotalValue)
                               .reduce(Double::sum);

// reduce with identity (returns T, not Optional)
double total = orders.stream()
                     .mapToDouble(Order::getTotalValue)
                     .reduce(0.0, Double::sum);
```

---

## Finding elements (short-circuit terminal operations)

```java
// findFirst — Optional of first matching element
Optional<Order> first = orders.stream()
                              .filter(o -> o.getStatus() == ACTIVE)
                              .findFirst();

// findAny — any match (useful in parallel streams)
Optional<Order> any = orders.parallelStream()
                            .filter(o -> o.getTotalValue() > 10_000)
                            .findAny();

// anyMatch / allMatch / noneMatch — return boolean (short-circuit)
boolean hasActive   = orders.stream().anyMatch(o -> o.getStatus() == ACTIVE);
boolean allValid    = orders.stream().allMatch(o -> o.getCustomerId() != null);
boolean noneDeleted = orders.stream().noneMatch(o -> o.getStatus() == DELETED);

// min / max
Optional<Order> mostExpensive = orders.stream()
                                      .max(Comparator.comparing(Order::getTotalValue));
```

---

## Optional — the companion to Stream terminals

```java
Optional<Order> opt = orders.stream().filter(...).findFirst();

// Get or throw
Order o = opt.orElseThrow(() -> new NotFoundException("No active order"));

// Get or default
Order o = opt.orElse(Order.empty());

// Get or compute lazily
Order o = opt.orElseGet(() -> orderRepository.findDefault());

// Transform if present
Optional<String> ref = opt.map(Order::getReference);

// Chain Optionals
Optional<Customer> customer = opt
    .filter(o -> o.getStatus() == ACTIVE)
    .map(Order::getCustomerId)
    .flatMap(customerRepository::findById);

// ifPresent (side effects — use sparingly)
opt.ifPresent(o -> log.info("Found order {}", o.getId()));

// ifPresentOrElse (Java 9+)
opt.ifPresentOrElse(
    o -> process(o),
    () -> log.warn("No order found")
);
```

---

## Common mistakes and how to fix them

| Mistake | Problem | Fix |
|---|---|---|
| `stream.forEach(list::add)` | Side effects in stream — not thread-safe, defeats the purpose | `.collect(Collectors.toList())` |
| Reusing a stream | Stream can only be consumed once — second terminal throws `IllegalStateException` | Call `stream()` fresh each time |
| `parallelStream()` everywhere | Adds thread pool overhead — slower for small collections | Only use when processing is CPU-intensive AND collection is large (10k+ elements) |
| `Optional.get()` without `isPresent()` | Throws `NoSuchElementException` | Use `orElseThrow()`, `orElse()`, or `ifPresent()` |
| `map()` returning null | Downstream NPE | Return `Optional` or filter nulls with `.filter(Objects::nonNull)` |
| `Collectors.toMap()` with duplicate keys | `IllegalStateException` | Add a merge function as the third argument |

---

## Quick reference: which collector to reach for

| I want... | Use |
|---|---|
| A List | `.toList()` or `Collectors.toList()` |
| A Set | `Collectors.toSet()` |
| A Map by key | `Collectors.toMap(keyFn, valueFn)` |
| Groups (Map of Lists) | `Collectors.groupingBy(fn)` |
| Count per group | `groupingBy(fn, Collectors.counting())` |
| Sum per group | `groupingBy(fn, Collectors.summingInt(fn2))` |
| True/false split | `Collectors.partitioningBy(predicate)` |
| A joined String | `Collectors.joining(", ")` |
| Statistics (avg/min/max) | `.mapToInt(...).summaryStatistics()` |
