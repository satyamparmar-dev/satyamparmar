export const basicCode = String.raw`package arch.day30;

import java.util.*;
import java.util.stream.*;

public class Day30Basic {

    public static void main(String[] args) {
        int sum = IntStream.rangeClosed(1, 5).sum();
        long cnt = Stream.of("a", "bb", "ccc").filter(s -> s.length() > 1).count();
        System.out.println(sum);
        System.out.println(cnt);
    }
}
`;

export const basicOutput = `15
2
`;

export const intermediateCode = String.raw`package arch.day30;

import java.util.*;
import java.util.stream.*;

public class Day30Intermediate {

    record Employee(String name, String dept, double salary) {}

    public static void main(String[] args) {
        List<Employee> staff =
                List.of(
                        new Employee("A", "eng", 100),
                        new Employee("B", "eng", 200),
                        new Employee("C", "sales", 150),
                        new Employee("D", "sales", 250));

        // --- Scenario 1: filter eng ---
        System.out.println("--- Scenario 1: eng count ---");
        System.out.println(staff.stream().filter(e -> e.dept().equals("eng")).count());
        System.out.println();

        // --- Scenario 2: map names ---
        System.out.println("--- Scenario 2: names ---");
        staff.stream().map(Employee::name).sorted().forEach(s -> System.out.print(s));
        System.out.println();
        System.out.println();

        // --- Scenario 3: avg salary by dept ---
        System.out.println("--- Scenario 3: avg by dept ---");
        Map<String, Double> avg =
                staff.stream()
                        .collect(
                                Collectors.groupingBy(
                                        Employee::dept, Collectors.averagingDouble(Employee::salary)));
        avg.entrySet().stream().sorted(Map.Entry.comparingByKey()).forEach(e -> System.out.println(e.getKey() + "=" + e.getValue()));
        System.out.println();

        // --- Scenario 4: max salary ---
        System.out.println("--- Scenario 4: max ---");
        System.out.println(staff.stream().mapToDouble(Employee::salary).max().orElse(0));
    }
}
`;

export const intermediateOutput = `--- Scenario 1: eng count ---
2

--- Scenario 2: names ---
ABCD

--- Scenario 3: avg by dept ---
eng=150.0
sales=200.0

--- Scenario 4: max ---
250.0
`;

export const advancedCode = String.raw`package arch.day30;

import java.util.*;
import java.util.stream.*;

public class Day30Advanced {

    public static void main(String[] args) {
        // === Block 1: flatMap words ===
        System.out.println("=== Block 1: flatMap ===");
        List<List<String>> nested = List.of(List.of("a", "b"), List.of("c"));
        System.out.println(nested.stream().flatMap(Collection::stream).count());
        System.out.println();

        // === Block 2: reduce ===
        System.out.println("=== Block 2: reduce ===");
        System.out.println(Stream.of(1, 2, 3).reduce(0, Integer::sum));
        System.out.println();

        // === Block 3: collector cheat ===
        System.out.println("=== Block 3: collectors ===");
        System.out.println("groupingBy + averagingDouble for means");
        System.out.println("partitioningBy for boolean split");
        System.out.println("teeing for two aggregates");
    }
}
`;

export const advancedOutput = `=== Block 1: flatMap ===
3

=== Block 2: reduce ===
6

=== Block 3: collectors ===
groupingBy + averagingDouble for means
partitioningBy for boolean split
teeing for two aggregates
`;
