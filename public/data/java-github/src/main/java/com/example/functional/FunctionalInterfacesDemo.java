package com.example.functional;

import java.util.*;
import java.util.function.*;
import java.util.stream.Collectors;

/**
 * Functional Interfaces and Method References Examples
 * Demonstrates Predicate, Function, Consumer, Supplier, and method references
 */
public class FunctionalInterfacesDemo {

    public static void main(String[] args) {
        System.out.println("=== Functional Interfaces Examples ===\n");
        
        // Example 1: Predicate
        predicateExamples();
        
        // Example 2: Function
        functionExamples();
        
        // Example 3: Consumer
        consumerExamples();
        
        // Example 4: Supplier
        supplierExamples();
        
        // Example 5: BiFunction and BiPredicate
        biFunctionExamples();
        
        // Example 6: Method References
        methodReferenceExamples();
        
        // Example 7: Chaining Functional Interfaces
        chainingExamples();
    }

    /**
     * Example 1: Predicate - boolean function
     */
    private static void predicateExamples() {
        System.out.println("1. Predicate Examples:");
        
        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
        
        // Simple predicate
        Predicate<Integer> isEven = n -> n % 2 == 0;
        List<Integer> evens = numbers.stream()
            .filter(isEven)
            .collect(Collectors.toList());
        System.out.println("   Even numbers: " + evens);
        
        // Predicate chaining
        Predicate<Integer> isGreaterThan5 = n -> n > 5;
        Predicate<Integer> isEvenAndGreaterThan5 = isEven.and(isGreaterThan5);
        
        List<Integer> result = numbers.stream()
            .filter(isEvenAndGreaterThan5)
            .collect(Collectors.toList());
        System.out.println("   Even and > 5: " + result);
        
        // Negate predicate
        Predicate<Integer> isOdd = isEven.negate();
        List<Integer> odds = numbers.stream()
            .filter(isOdd)
            .collect(Collectors.toList());
        System.out.println("   Odd numbers: " + odds);
        
        // Or predicate
        Predicate<Integer> isLessThan3 = n -> n < 3;
        Predicate<Integer> isLessThan3OrGreaterThan8 = isLessThan3.or(n -> n > 8);
        List<Integer> result2 = numbers.stream()
            .filter(isLessThan3OrGreaterThan8)
            .collect(Collectors.toList());
        System.out.println("   < 3 or > 8: " + result2);
        
        System.out.println();
    }

    /**
     * Example 2: Function - transform function
     */
    private static void functionExamples() {
        System.out.println("2. Function Examples:");
        
        // Simple function
        Function<String, Integer> length = String::length;
        System.out.println("   Length of 'Hello': " + length.apply("Hello"));
        
        // Function chaining
        Function<Integer, Integer> square = n -> n * n;
        Function<String, Integer> lengthSquared = length.andThen(square);
        System.out.println("   Length squared of 'Hello': " + lengthSquared.apply("Hello"));
        
        // Compose functions
        Function<Integer, Integer> multiplyBy2 = n -> n * 2;
        Function<Integer, Integer> add3 = n -> n + 3;
        Function<Integer, Integer> multiplyThenAdd = multiplyBy2.andThen(add3);
        Function<Integer, Integer> addThenMultiply = multiplyBy2.compose(add3);
        
        System.out.println("   (5 * 2) + 3 = " + multiplyThenAdd.apply(5));
        System.out.println("   (5 + 3) * 2 = " + addThenMultiply.apply(5));
        
        // Use in stream
        List<String> words = Arrays.asList("apple", "banana", "cherry");
        List<Integer> lengths = words.stream()
            .map(length)
            .collect(Collectors.toList());
        System.out.println("   Word lengths: " + lengths);
        
        System.out.println();
    }

    /**
     * Example 3: Consumer - consume without return
     */
    private static void consumerExamples() {
        System.out.println("3. Consumer Examples:");
        
        // Simple consumer
        Consumer<String> printer = System.out::println;
        System.out.println("   Printing with consumer:");
        printer.accept("Hello, World!");
        
        // Consumer chaining
        Consumer<String> logger = s -> System.out.println("LOG: " + s);
        Consumer<String> both = printer.andThen(logger);
        System.out.println("\n   Chained consumers:");
        both.accept("Test message");
        
        // Use in stream
        List<String> names = Arrays.asList("Alice", "Bob", "Charlie");
        System.out.println("\n   Processing list:");
        names.forEach(printer);
        
        // Custom consumer
        Consumer<List<String>> listProcessor = list -> {
            System.out.println("   Processing list of size: " + list.size());
            list.forEach(s -> System.out.println("     - " + s));
        };
        listProcessor.accept(names);
        
        System.out.println();
    }

    /**
     * Example 4: Supplier - provide value
     */
    private static void supplierExamples() {
        System.out.println("4. Supplier Examples:");
        
        // Simple supplier
        Supplier<String> greeting = () -> "Hello, World!";
        System.out.println("   Greeting: " + greeting.get());
        
        // Supplier for current time
        Supplier<Long> currentTime = System::currentTimeMillis;
        System.out.println("   Current time: " + currentTime.get());
        
        // Supplier for random number
        Supplier<Double> random = Math::random;
        System.out.println("   Random number: " + random.get());
        
        // Supplier for empty list
        Supplier<List<String>> emptyList = ArrayList::new;
        List<String> list = emptyList.get();
        System.out.println("   Empty list: " + list);
        
        // Use with Optional
        Optional<String> optional = Optional.empty();
        String value = optional.orElseGet(() -> "Default value");
        System.out.println("   Optional with supplier: " + value);
        
        System.out.println();
    }

    /**
     * Example 5: BiFunction and BiPredicate
     */
    private static void biFunctionExamples() {
        System.out.println("5. BiFunction and BiPredicate Examples:");
        
        // BiFunction - two arguments
        BiFunction<Integer, Integer, Integer> add = Integer::sum;
        System.out.println("   5 + 3 = " + add.apply(5, 3));
        
        BiFunction<String, String, String> concat = String::concat;
        System.out.println("   'Hello' + 'World' = " + concat.apply("Hello", "World"));
        
        // BiPredicate - two arguments
        BiPredicate<Integer, Integer> isGreater = (a, b) -> a > b;
        System.out.println("   5 > 3: " + isGreater.test(5, 3));
        
        BiPredicate<String, String> equalsIgnoreCase = String::equalsIgnoreCase;
        System.out.println("   'Hello' equals 'HELLO': " + 
            equalsIgnoreCase.test("Hello", "HELLO"));
        
        // BiConsumer
        BiConsumer<String, Integer> printPair = (name, age) -> 
            System.out.println("   " + name + " is " + age + " years old");
        printPair.accept("Alice", 25);
        
        System.out.println();
    }

    /**
     * Example 6: Method References
     */
    private static void methodReferenceExamples() {
        System.out.println("6. Method Reference Examples:");
        
        List<String> names = Arrays.asList("alice", "bob", "charlie");
        
        // Static method reference
        Function<String, Integer> parseInt = Integer::parseInt;
        System.out.println("   Parse '123': " + parseInt.apply("123"));
        
        // Instance method reference (arbitrary object)
        List<String> upper = names.stream()
            .map(String::toUpperCase)
            .collect(Collectors.toList());
        System.out.println("   Uppercase: " + upper);
        
        // Instance method reference (specific object)
        String prefix = "Hello, ";
        Function<String, String> addPrefix = prefix::concat;
        System.out.println("   Add prefix: " + addPrefix.apply("World"));
        
        // Constructor reference
        Supplier<List<String>> listSupplier = ArrayList::new;
        List<String> newList = listSupplier.get();
        System.out.println("   New list: " + newList);
        
        // Method reference in forEach
        System.out.println("   Printing names:");
        names.forEach(System.out::println);
        
        System.out.println();
    }

    /**
     * Example 7: Chaining functional interfaces
     */
    private static void chainingExamples() {
        System.out.println("7. Chaining Functional Interfaces:");
        
        List<String> words = Arrays.asList("apple", "banana", "cherry", "date");
        
        // Complex pipeline with functional interfaces
        Predicate<String> isLong = s -> s.length() > 5;
        Function<String, String> toUpper = String::toUpperCase;
        Consumer<String> printer = System.out::println;
        
        System.out.println("   Processing pipeline:");
        words.stream()
            .filter(isLong)
            .map(toUpper)
            .forEach(printer);
        
        // Combining multiple functions
        Function<String, Integer> length = String::length;
        Function<Integer, Integer> square = n -> n * n;
        Function<String, Integer> lengthSquared = length.andThen(square);
        
        System.out.println("\n   Length squared:");
        words.stream()
            .map(lengthSquared)
            .forEach(n -> System.out.println("     " + n));
        
        System.out.println();
    }
}
