export const basicCode = String.raw`package arch.day29;

import java.util.function.*;

public class Day29Basic {

    public static void main(String[] args) {
        Predicate<String> nonEmpty = s -> !s.isEmpty();
        Function<String, Integer> len = String::length;
        System.out.println(nonEmpty.test("x"));
        System.out.println(len.apply("abc"));
    }
}
`;

export const basicOutput = `true
3
`;

export const intermediateCode = String.raw`package arch.day29;

import java.util.*;
import java.util.stream.*;

public class Day29Intermediate {

    public static void main(String[] args) {
        List<String> words = Arrays.asList("  java", "Lambda", "", "stream");

        // --- Scenario 1: trim map ---
        System.out.println("--- Scenario 1: trim ---");
        words.stream().map(String::trim).forEach(s -> System.out.print(s + ";"));
        System.out.println();

        // --- Scenario 2: filter empty ---
        System.out.println("--- Scenario 2: nonempty ---");
        long c = words.stream().map(String::trim).filter(s -> !s.isEmpty()).count();
        System.out.println(c);
        System.out.println();

        // --- Scenario 3: uppercase sorted ---
        System.out.println("--- Scenario 3: upper sort ---");
        words.stream()
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(String::toUpperCase)
                .sorted()
                .forEach(s -> System.out.print(s + ","));
        System.out.println();
        System.out.println();

        // --- Scenario 4: method ref sort natural ---
        System.out.println("--- Scenario 4: ref sort ---");
        List<String> xs = new ArrayList<>(List.of("b", "a", "c"));
        xs.sort(String::compareTo);
        System.out.println(xs);
    }
}
`;

export const intermediateOutput = `--- Scenario 1: trim ---
java;Lambda;;stream;

--- Scenario 2: nonempty ---
3

--- Scenario 3: upper sort ---
JAVA,LAMBDA,STREAM,

--- Scenario 4: ref sort ---
[a, b, c]
`;

export const advancedCode = String.raw`package arch.day29;

import java.util.*;
import java.util.function.*;

public class Day29Advanced {

    public static void main(String[] args) {
        // === Block 1: comparator chain ===
        System.out.println("=== Block 1: comparator ===");
        Comparator<String> byLen = Comparator.comparing(String::length);
        Comparator<String> byLenThenAlpha = byLen.thenComparing(Comparator.naturalOrder());
        List<String> xs = new ArrayList<>(List.of("bb", "a", "ccc", "dd"));
        xs.sort(byLenThenAlpha);
        System.out.println(xs);
        System.out.println();

        // === Block 2: predicate compose ===
        System.out.println("=== Block 2: predicate ===");
        Predicate<String> longEnough = s -> s.length() > 1;
        Predicate<String> p = longEnough.and(s -> Character.isUpperCase(s.charAt(0)));
        System.out.println(p.test("Hi"));
        System.out.println(p.test("I"));
        System.out.println();

        // === Block 3: table ===
        System.out.println("=== Block 3: refs ===");
        System.out.println("Static:    String::valueOf");
        System.out.println("Instance:  s::length");
        System.out.println("Unbound:   String::compareTo");
    }
}
`;

export const advancedOutput = `=== Block 1: comparator ===
[a, bb, dd, ccc]

=== Block 2: predicate ===
true
false

=== Block 3: refs ===
Static:    String::valueOf
Instance:  s::length
Unbound:   String::compareTo
`;
