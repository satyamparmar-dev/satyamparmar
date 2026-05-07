package com.example.optional;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Optional Class Examples
 * Demonstrates proper usage of Optional for null-safe programming
 */
public class OptionalExamples {

    public static void main(String[] args) {
        System.out.println("=== Optional Examples ===\n");
        
        // Example 1: Creating Optional
        creatingOptional();
        
        // Example 2: Basic Operations
        basicOperations();
        
        // Example 3: Map and FlatMap
        mapAndFlatMap();
        
        // Example 4: Filter
        filterExamples();
        
        // Example 5: orElse vs orElseGet
        orElseExamples();
        
        // Example 6: Practical Use Cases
        practicalUseCases();
        
        // Example 7: Common Mistakes
        commonMistakes();
    }

    /**
     * Example 1: Creating Optional
     */
    private static void creatingOptional() {
        System.out.println("1. Creating Optional:");
        
        // Empty Optional
        Optional<String> empty = Optional.empty();
        System.out.println("   Empty Optional: " + empty);
        System.out.println("   Is present: " + empty.isPresent());
        
        // Optional with value
        Optional<String> value = Optional.of("Hello");
        System.out.println("   Optional with value: " + value);
        System.out.println("   Value: " + value.get());
        
        // Optional from nullable
        String nullable = null;
        Optional<String> fromNullable = Optional.ofNullable(nullable);
        System.out.println("   From nullable (null): " + fromNullable);
        
        String notNull = "World";
        Optional<String> fromNotNull = Optional.ofNullable(notNull);
        System.out.println("   From nullable (not null): " + fromNotNull);
        
        System.out.println();
    }

    /**
     * Example 2: Basic Operations
     */
    private static void basicOperations() {
        System.out.println("2. Basic Operations:");
        
        Optional<String> name = Optional.of("Alice");
        
        // isPresent
        if (name.isPresent()) {
            System.out.println("   Name is present: " + name.get());
        }
        
        // ifPresent (preferred way)
        name.ifPresent(n -> System.out.println("   Name (ifPresent): " + n));
        
        // isEmpty (Java 11+)
        Optional<String> empty = Optional.empty();
        System.out.println("   Is empty: " + empty.isEmpty());
        
        System.out.println();
    }

    /**
     * Example 3: Map and FlatMap
     */
    private static void mapAndFlatMap() {
        System.out.println("3. Map and FlatMap:");
        
        Optional<String> name = Optional.of("Alice");
        
        // Map - transforms value if present
        Optional<Integer> length = name.map(String::length);
        System.out.println("   Length: " + length.orElse(0));
        
        Optional<String> upper = name.map(String::toUpperCase);
        System.out.println("   Uppercase: " + upper.orElse("N/A"));
        
        // FlatMap - when transformation returns Optional
        Optional<String> result = name.flatMap(n -> findByName(n));
        System.out.println("   FlatMap result: " + result.orElse("Not found"));
        
        // Chaining
        Optional<String> chained = name
            .map(String::toUpperCase)
            .flatMap(this::findByName);
        System.out.println("   Chained: " + chained.orElse("Not found"));
        
        System.out.println();
    }

    private Optional<String> findByName(String name) {
        // Simulate lookup
        if (name.equals("ALICE")) {
            return Optional.of("Found: " + name);
        }
        return Optional.empty();
    }

    /**
     * Example 4: Filter
     */
    private static void filterExamples() {
        System.out.println("4. Filter Examples:");
        
        Optional<String> name = Optional.of("Alice");
        
        // Filter - keeps value if condition is true
        Optional<String> longName = name.filter(n -> n.length() > 4);
        System.out.println("   Long name (>4): " + longName.orElse("Not long"));
        
        Optional<String> shortName = name.filter(n -> n.length() < 3);
        System.out.println("   Short name (<3): " + shortName.orElse("Not short"));
        
        // Chaining with filter
        Optional<String> result = name
            .filter(n -> n.startsWith("A"))
            .map(String::toUpperCase);
        System.out.println("   Starts with 'A' and uppercase: " + result.orElse("N/A"));
        
        System.out.println();
    }

    /**
     * Example 5: orElse vs orElseGet
     */
    private static void orElseExamples() {
        System.out.println("5. orElse vs orElseGet:");
        
        Optional<String> empty = Optional.empty();
        
        // orElse - always evaluates
        String value1 = empty.orElse(getDefaultValue());
        System.out.println("   orElse: " + value1);
        
        // orElseGet - lazy evaluation (only if empty)
        String value2 = empty.orElseGet(() -> getDefaultValue());
        System.out.println("   orElseGet: " + value2);
        
        // orElseThrow
        try {
            String value3 = empty.orElseThrow(() -> 
                new IllegalArgumentException("Value required"));
        } catch (IllegalArgumentException e) {
            System.out.println("   orElseThrow: " + e.getMessage());
        }
        
        System.out.println();
    }

    private String getDefaultValue() {
        System.out.println("     (Default value computed)");
        return "Default";
    }

    /**
     * Example 6: Practical Use Cases
     */
    private static void practicalUseCases() {
        System.out.println("6. Practical Use Cases:");
        
        // Use case 1: Safe method return
        Optional<String> result = findUser(1);
        result.ifPresentOrElse(
            user -> System.out.println("   User found: " + user),
            () -> System.out.println("   User not found")
        );
        
        // Use case 2: Chain of operations
        Optional<String> processed = findUser(1)
            .map(String::toUpperCase)
            .filter(s -> s.length() > 3);
        System.out.println("   Processed: " + processed.orElse("N/A"));
        
        // Use case 3: In streams
        List<String> names = Arrays.asList("Alice", null, "Bob", null, "Charlie");
        List<String> validNames = names.stream()
            .map(Optional::ofNullable)
            .filter(Optional::isPresent)
            .map(Optional::get)
            .collect(Collectors.toList());
        System.out.println("   Valid names: " + validNames);
        
        // Better way with filter
        List<String> validNames2 = names.stream()
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
        System.out.println("   Valid names (better): " + validNames2);
        
        System.out.println();
    }

    private Optional<String> findUser(int id) {
        // Simulate database lookup
        if (id == 1) {
            return Optional.of("Alice");
        }
        return Optional.empty();
    }

    /**
     * Example 7: Common Mistakes
     */
    private static void commonMistakes() {
        System.out.println("7. Common Mistakes to Avoid:");
        
        // ❌ MISTAKE 1: Using get() without check
        Optional<String> optional = Optional.empty();
        try {
            String value = optional.get(); // Throws NoSuchElementException
        } catch (NoSuchElementException e) {
            System.out.println("   ❌ Mistake 1: get() without check - " + e.getClass().getSimpleName());
        }
        
        // ✅ CORRECT: Use orElse/orElseGet
        String value = optional.orElse("Default");
        System.out.println("   ✅ Correct: " + value);
        
        // ❌ MISTAKE 2: Using Optional for fields
        System.out.println("   ❌ Mistake 2: Don't use Optional as field type");
        System.out.println("      private Optional<String> name; // BAD!");
        
        // ✅ CORRECT: Use Optional for return types
        System.out.println("   ✅ Correct: Use Optional for return types");
        System.out.println("      public Optional<String> findName() { ... }");
        
        // ❌ MISTAKE 3: Nested Optionals
        Optional<Optional<String>> nested = Optional.of(Optional.of("Nested"));
        System.out.println("   ❌ Mistake 3: Nested Optionals - " + nested);
        
        // ✅ CORRECT: Use flatMap
        Optional<String> flattened = nested.flatMap(Function.identity());
        System.out.println("   ✅ Correct: Flattened - " + flattened);
        
        System.out.println();
    }
}
