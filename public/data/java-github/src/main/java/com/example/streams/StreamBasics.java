package com.example.streams;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Basic Stream Operations Examples
 * Demonstrates fundamental stream operations for beginners
 */
public class StreamBasics {

    public static void main(String[] args) {
        System.out.println("=== Stream Basics Examples ===\n");
        
        // Example 1: Creating Streams
        createStreams();
        
        // Example 2: Filter Operation
        filterExamples();
        
        // Example 3: Map Operation
        mapExamples();
        
        // Example 4: FlatMap Operation
        flatMapExamples();
        
        // Example 5: Terminal Operations
        terminalOperations();
        
        // Example 6: Chaining Operations
        chainingExamples();
    }

    /**
     * Example 1: Different ways to create streams
     */
    private static void createStreams() {
        System.out.println("1. Creating Streams:");
        
        // From Collection
        List<String> list = Arrays.asList("apple", "banana", "cherry");
        Stream<String> stream1 = list.stream();
        System.out.println("   From List: " + stream1.collect(Collectors.toList()));
        
        // From Array
        String[] array = {"dog", "cat", "bird"};
        Stream<String> stream2 = Arrays.stream(array);
        System.out.println("   From Array: " + stream2.collect(Collectors.toList()));
        
        // Using Stream.of()
        Stream<String> stream3 = Stream.of("one", "two", "three");
        System.out.println("   Using Stream.of(): " + stream3.collect(Collectors.toList()));
        
        // Infinite stream
        Stream<Integer> infinite = Stream.iterate(0, n -> n + 2);
        List<Integer> first5 = infinite.limit(5).collect(Collectors.toList());
        System.out.println("   Infinite stream (first 5): " + first5);
        
        System.out.println();
    }

    /**
     * Example 2: Filter operation - selecting elements based on condition
     */
    private static void filterExamples() {
        System.out.println("2. Filter Examples:");
        
        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
        
        // Filter even numbers
        List<Integer> evens = numbers.stream()
            .filter(n -> n % 2 == 0)
            .collect(Collectors.toList());
        System.out.println("   Even numbers: " + evens);
        
        // Filter numbers greater than 5
        List<Integer> greaterThan5 = numbers.stream()
            .filter(n -> n > 5)
            .collect(Collectors.toList());
        System.out.println("   Numbers > 5: " + greaterThan5);
        
        // Multiple filters
        List<Integer> filtered = numbers.stream()
            .filter(n -> n % 2 == 0)
            .filter(n -> n > 5)
            .collect(Collectors.toList());
        System.out.println("   Even numbers > 5: " + filtered);
        
        System.out.println();
    }

    /**
     * Example 3: Map operation - transforming elements
     */
    private static void mapExamples() {
        System.out.println("3. Map Examples:");
        
        // Convert to uppercase
        List<String> words = Arrays.asList("hello", "world", "java", "streams");
        List<String> upper = words.stream()
            .map(String::toUpperCase)
            .collect(Collectors.toList());
        System.out.println("   Uppercase: " + upper);
        
        // Get lengths
        List<Integer> lengths = words.stream()
            .map(String::length)
            .collect(Collectors.toList());
        System.out.println("   Lengths: " + lengths);
        
        // Square numbers
        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
        List<Integer> squares = numbers.stream()
            .map(n -> n * n)
            .collect(Collectors.toList());
        System.out.println("   Squares: " + squares);
        
        System.out.println();
    }

    /**
     * Example 4: FlatMap operation - flattening nested structures
     */
    private static void flatMapExamples() {
        System.out.println("4. FlatMap Examples:");
        
        // Flatten list of lists
        List<List<Integer>> nested = Arrays.asList(
            Arrays.asList(1, 2, 3),
            Arrays.asList(4, 5),
            Arrays.asList(6, 7, 8, 9)
        );
        
        List<Integer> flattened = nested.stream()
            .flatMap(List::stream)
            .collect(Collectors.toList());
        System.out.println("   Flattened: " + flattened);
        
        // Split strings into characters
        List<String> words = Arrays.asList("hello", "world");
        List<String> chars = words.stream()
            .flatMap(word -> Arrays.stream(word.split("")))
            .collect(Collectors.toList());
        System.out.println("   Characters: " + chars);
        
        System.out.println();
    }

    /**
     * Example 5: Terminal operations
     */
    private static void terminalOperations() {
        System.out.println("5. Terminal Operations:");
        
        List<String> names = Arrays.asList("Alice", "Bob", "Charlie", "David", "Eve");
        
        // Collect to List
        List<String> collected = names.stream()
            .filter(s -> s.length() > 4)
            .collect(Collectors.toList());
        System.out.println("   Collected (length > 4): " + collected);
        
        // Count
        long count = names.stream()
            .filter(s -> s.startsWith("C"))
            .count();
        System.out.println("   Count (starts with 'C'): " + count);
        
        // Find first
        Optional<String> first = names.stream()
            .filter(s -> s.length() > 5)
            .findFirst();
        System.out.println("   First (length > 5): " + first.orElse("Not found"));
        
        // Any match
        boolean hasLongName = names.stream()
            .anyMatch(s -> s.length() > 6);
        System.out.println("   Has name length > 6: " + hasLongName);
        
        // All match
        boolean allLong = names.stream()
            .allMatch(s -> s.length() > 3);
        System.out.println("   All names length > 3: " + allLong);
        
        System.out.println();
    }

    /**
     * Example 6: Chaining multiple operations
     */
    private static void chainingExamples() {
        System.out.println("6. Chaining Operations:");
        
        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
        
        // Complex pipeline
        List<Integer> result = numbers.stream()
            .filter(n -> n % 2 == 0)      // Keep even numbers
            .map(n -> n * n)              // Square them
            .filter(n -> n > 20)          // Keep squares > 20
            .sorted()                     // Sort
            .collect(Collectors.toList()); // Collect
        
        System.out.println("   Even numbers squared and > 20: " + result);
        
        // Another example: process strings
        List<String> words = Arrays.asList("apple", "banana", "cherry", "date", "elderberry");
        List<String> processed = words.stream()
            .filter(s -> s.length() > 5)      // Length > 5
            .map(String::toUpperCase)          // Uppercase
            .sorted(Comparator.reverseOrder()) // Reverse sort
            .collect(Collectors.toList());
        
        System.out.println("   Words (length > 5, uppercase, reverse sorted): " + processed);
        
        System.out.println();
    }
}
