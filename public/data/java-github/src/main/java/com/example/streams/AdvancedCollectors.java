package com.example.streams;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

/**
 * Advanced Collectors Examples
 * Demonstrates groupingBy, partitioningBy, summarizing, and custom collectors
 */
public class AdvancedCollectors {

    public static void main(String[] args) {
        System.out.println("=== Advanced Collectors Examples ===\n");
        
        // Example 1: groupingBy
        groupingByExamples();
        
        // Example 2: partitioningBy
        partitioningByExamples();
        
        // Example 3: Summarizing Statistics
        summarizingExamples();
        
        // Example 4: Mapping Collector
        mappingExamples();
        
        // Example 5: Reducing Collector
        reducingExamples();
        
        // Example 6: Joining Strings
        joiningExamples();
        
        // Example 7: Multi-level Grouping
        multiLevelGrouping();
    }

    /**
     * Employee class for examples
     */
    static class Employee {
        private String name;
        private String department;
        private double salary;
        private int age;

        public Employee(String name, String department, double salary, int age) {
            this.name = name;
            this.department = department;
            this.salary = salary;
            this.age = age;
        }

        public String getName() { return name; }
        public String getDepartment() { return department; }
        public double getSalary() { return salary; }
        public int getAge() { return age; }

        @Override
        public String toString() {
            return name + " (" + department + ", $" + salary + ")";
        }
    }

    private static List<Employee> getEmployees() {
        return Arrays.asList(
            new Employee("Alice", "IT", 75000, 28),
            new Employee("Bob", "IT", 80000, 32),
            new Employee("Charlie", "HR", 60000, 25),
            new Employee("David", "HR", 65000, 30),
            new Employee("Eve", "IT", 90000, 35),
            new Employee("Frank", "Finance", 70000, 29),
            new Employee("Grace", "Finance", 75000, 31),
            new Employee("Henry", "IT", 85000, 33)
        );
    }

    /**
     * Example 1: Grouping by department
     */
    private static void groupingByExamples() {
        System.out.println("1. GroupingBy Examples:");
        
        List<Employee> employees = getEmployees();
        
        // Simple grouping
        Map<String, List<Employee>> byDept = employees.stream()
            .collect(Collectors.groupingBy(Employee::getDepartment));
        
        System.out.println("   Grouped by department:");
        byDept.forEach((dept, emps) -> 
            System.out.println("     " + dept + ": " + emps));
        
        // Group and count
        Map<String, Long> countByDept = employees.stream()
            .collect(Collectors.groupingBy(
                Employee::getDepartment,
                Collectors.counting()
            ));
        System.out.println("\n   Count by department: " + countByDept);
        
        // Group and calculate average salary
        Map<String, Double> avgSalaryByDept = employees.stream()
            .collect(Collectors.groupingBy(
                Employee::getDepartment,
                Collectors.averagingDouble(Employee::getSalary)
            ));
        System.out.println("   Average salary by department: " + avgSalaryByDept);
        
        // Group and sum
        Map<String, Double> totalSalaryByDept = employees.stream()
            .collect(Collectors.groupingBy(
                Employee::getDepartment,
                Collectors.summingDouble(Employee::getSalary)
            ));
        System.out.println("   Total salary by department: " + totalSalaryByDept);
        
        System.out.println();
    }

    /**
     * Example 2: Partitioning into two groups
     */
    private static void partitioningByExamples() {
        System.out.println("2. PartitioningBy Examples:");
        
        List<Employee> employees = getEmployees();
        
        // Partition by salary threshold
        Map<Boolean, List<Employee>> partitioned = employees.stream()
            .collect(Collectors.partitioningBy(e -> e.getSalary() > 75000));
        
        System.out.println("   Partitioned by salary > $75,000:");
        System.out.println("     High salary: " + partitioned.get(true));
        System.out.println("     Low salary: " + partitioned.get(false));
        
        // Partition and count
        Map<Boolean, Long> count = employees.stream()
            .collect(Collectors.partitioningBy(
                e -> e.getSalary() > 75000,
                Collectors.counting()
            ));
        System.out.println("   Count: " + count);
        
        // Partition and calculate average
        Map<Boolean, Double> avgAge = employees.stream()
            .collect(Collectors.partitioningBy(
                e -> e.getSalary() > 75000,
                Collectors.averagingInt(Employee::getAge)
            ));
        System.out.println("   Average age: " + avgAge);
        
        System.out.println();
    }

    /**
     * Example 3: Summarizing statistics
     */
    private static void summarizingExamples() {
        System.out.println("3. Summarizing Examples:");
        
        List<Employee> employees = getEmployees();
        
        // IntSummaryStatistics
        IntSummaryStatistics ageStats = employees.stream()
            .collect(Collectors.summarizingInt(Employee::getAge));
        System.out.println("   Age Statistics:");
        System.out.println("     Count: " + ageStats.getCount());
        System.out.println("     Sum: " + ageStats.getSum());
        System.out.println("     Min: " + ageStats.getMin());
        System.out.println("     Max: " + ageStats.getMax());
        System.out.println("     Average: " + ageStats.getAverage());
        
        // DoubleSummaryStatistics
        DoubleSummaryStatistics salaryStats = employees.stream()
            .collect(Collectors.summarizingDouble(Employee::getSalary));
        System.out.println("\n   Salary Statistics:");
        System.out.println("     Count: " + salaryStats.getCount());
        System.out.println("     Sum: $" + salaryStats.getSum());
        System.out.println("     Min: $" + salaryStats.getMin());
        System.out.println("     Max: $" + salaryStats.getMax());
        System.out.println("     Average: $" + salaryStats.getAverage());
        
        // By department
        Map<String, DoubleSummaryStatistics> statsByDept = employees.stream()
            .collect(Collectors.groupingBy(
                Employee::getDepartment,
                Collectors.summarizingDouble(Employee::getSalary)
            ));
        System.out.println("\n   Salary stats by department:");
        statsByDept.forEach((dept, stats) -> 
            System.out.println("     " + dept + ": avg=$" + stats.getAverage() + 
                             ", max=$" + stats.getMax()));
        
        System.out.println();
    }

    /**
     * Example 4: Mapping collector
     */
    private static void mappingExamples() {
        System.out.println("4. Mapping Collector Examples:");
        
        List<Employee> employees = getEmployees();
        
        // Group and map to names only
        Map<String, List<String>> namesByDept = employees.stream()
            .collect(Collectors.groupingBy(
                Employee::getDepartment,
                Collectors.mapping(Employee::getName, Collectors.toList())
            ));
        System.out.println("   Names by department: " + namesByDept);
        
        // Group and map to set of names
        Map<String, Set<String>> uniqueNamesByDept = employees.stream()
            .collect(Collectors.groupingBy(
                Employee::getDepartment,
                Collectors.mapping(Employee::getName, Collectors.toSet())
            ));
        System.out.println("   Unique names by department: " + uniqueNamesByDept);
        
        System.out.println();
    }

    /**
     * Example 5: Reducing collector
     */
    private static void reducingExamples() {
        System.out.println("5. Reducing Collector Examples:");
        
        List<Employee> employees = getEmployees();
        
        // Find employee with max salary
        Optional<Employee> maxSalary = employees.stream()
            .collect(Collectors.reducing((e1, e2) -> 
                e1.getSalary() > e2.getSalary() ? e1 : e2));
        System.out.println("   Employee with max salary: " + 
            maxSalary.map(Employee::getName).orElse("Not found"));
        
        // Sum of salaries
        Double totalSalary = employees.stream()
            .collect(Collectors.reducing(0.0, Employee::getSalary, Double::sum));
        System.out.println("   Total salary: $" + totalSalary);
        
        System.out.println();
    }

    /**
     * Example 6: Joining strings
     */
    private static void joiningExamples() {
        System.out.println("6. Joining Examples:");
        
        List<String> names = Arrays.asList("Alice", "Bob", "Charlie", "David");
        
        // Simple join
        String joined = names.stream()
            .collect(Collectors.joining());
        System.out.println("   Joined (no separator): " + joined);
        
        // Join with delimiter
        String joinedWithComma = names.stream()
            .collect(Collectors.joining(", "));
        System.out.println("   Joined with comma: " + joinedWithComma);
        
        // Join with prefix and suffix
        String joinedWithBrackets = names.stream()
            .collect(Collectors.joining(", ", "[", "]"));
        System.out.println("   Joined with brackets: " + joinedWithBrackets);
        
        System.out.println();
    }

    /**
     * Example 7: Multi-level grouping
     */
    private static void multiLevelGrouping() {
        System.out.println("7. Multi-level Grouping:");
        
        // Create employees with more attributes
        List<Employee> employees = Arrays.asList(
            new Employee("Alice", "IT", 75000, 28),
            new Employee("Bob", "IT", 80000, 32),
            new Employee("Charlie", "HR", 60000, 25),
            new Employee("David", "HR", 65000, 30),
            new Employee("Eve", "IT", 90000, 35)
        );
        
        // Group by department, then by age range
        Map<String, Map<String, List<Employee>>> nested = employees.stream()
            .collect(Collectors.groupingBy(
                Employee::getDepartment,
                Collectors.groupingBy(e -> 
                    e.getAge() < 30 ? "Young" : "Senior")
            ));
        
        System.out.println("   Grouped by department and age:");
        nested.forEach((dept, ageGroups) -> {
            System.out.println("     " + dept + ":");
            ageGroups.forEach((ageGroup, emps) -> 
                System.out.println("       " + ageGroup + ": " + emps));
        });
        
        System.out.println();
    }
}
