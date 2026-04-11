export const basicCode = String.raw`package arch.day19;

public class Day19Basic {

    static void printRow(String name, String time, String example) {
        System.out.printf("%-14s | %-10s | %s%n", name, time, example);
    }

    public static void main(String[] args) {
        System.out.println("=== Complexity classes — quick reference ===");
        System.out.println();
        printRow("Pattern", "Typical", "Example");
        System.out.println("---------------+------------+--------------------------------");
        printRow("single stmt", "O(1)", "array index a[i]");
        printRow("one loop n", "O(n)", "linear scan");
        printRow("loop * loop", "O(n^2)", "all pairs i<j");
        printRow("halve each step", "O(log n)", "binary search");
        printRow("sort (compare)", "O(n log n)", "Arrays.sort int[]");
        System.out.println();
        System.out.println("Rule: keep the largest growing term; drop constants.");
        System.out.println("Rule: nested independent sizes n*m are not automatically n^2.");
    }
}
`;

export const basicOutput = `=== Complexity classes — quick reference ===

Pattern        | Typical    | Example
---------------+------------+--------------------------------
single stmt    | O(1)       | array index a[i]
one loop n     | O(n)       | linear scan
loop * loop    | O(n^2)     | all pairs i<j
halve each step| O(log n)   | binary search
sort (compare) | O(n log n) | Arrays.sort int[]

Rule: keep the largest growing term; drop constants.
Rule: nested independent sizes n*m are not automatically n^2.
`;

export const intermediateCode = String.raw`package arch.day19;

public class Day19Intermediate {

    static long pairComparisons(int n) {
        return (long) n * (n - 1) / 2;
    }

    static long linearScanOps(int n) {
        return n;
    }

    static long sortCost(int n) {
        // model comparison-based upper bound as n log2 n (ceiled) for traceability
        if (n <= 1) return 0;
        double v = n * (Math.log(n) / Math.log(2));
        return (long) Math.ceil(v);
    }

    public static void main(String[] args) {
        int n = 8;

        // --- Scenario 1: duplicate check with nested loops ---
        System.out.println("--- Scenario 1: duplicate check (nested loops) ---");
        System.out.println("dominant_comparisons=" + pairComparisons(n));
        System.out.println("class=O(n^2)");
        System.out.println();

        // --- Scenario 2: sort then linear scan (distinct check style) ---
        System.out.println("--- Scenario 2: sort + adjacent scan ---");
        System.out.println("sort_comparisons_model=" + sortCost(n));
        System.out.println("scan_ops=" + (n - 1));
        System.out.println("class=O(n log n)");
        System.out.println();

        // --- Scenario 3: hash-set single pass ---
        System.out.println("--- Scenario 3: hash set single pass ---");
        System.out.println("expected_probes_on_unique_input=" + linearScanOps(n));
        System.out.println("class=O(n) time average; O(n) space");
        System.out.println();

        // --- Scenario 4: binary search — halving steps ---
        System.out.println("--- Scenario 4: binary search (halving model) ---");
        int span = n;
        int steps = 0;
        while (span > 1) {
            span = (span + 1) / 2;
            steps++;
        }
        System.out.println("halving_steps_for_n=" + n + " -> " + steps);
        System.out.println("class=O(log n)");
    }
}
`;

export const intermediateOutput = `--- Scenario 1: duplicate check (nested loops) ---
dominant_comparisons=28
class=O(n^2)

--- Scenario 2: sort + adjacent scan ---
sort_comparisons_model=24
scan_ops=7
class=O(n log n)

--- Scenario 3: hash set single pass ---
expected_probes_on_unique_input=8
class=O(n) time average; O(n) space

--- Scenario 4: binary search (halving model) ---
halving_steps_for_n=8 -> 3
class=O(log n)
`;

export const advancedCode = String.raw`package arch.day19;

public class Day19Advanced {

    static long nestedLoopInner(int n) {
        long c = 0;
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                c++;
            }
        }
        return c;
    }

    static long singleLoop(int n) {
        long c = 0;
        for (int i = 0; i < n; i++) c++;
        return c;
    }

    public static void main(String[] args) {
        // === Block 1: empirical operation counts for growing n ===
        System.out.println("=== Block 1: operation counts vs n ===");
        for (int n : new int[] { 100, 1000, 10000 }) {
            long dup = nestedLoopInner(n);
            long lin = singleLoop(n);
            System.out.println("n=" + n + " nested_pair_ops=" + dup + " linear_ops=" + lin);
        }
        System.out.println();

        // === Block 2: ratio check (nested ~ n^2/2) ===
        System.out.println("=== Block 2: growth sanity (nested / n) ===");
        for (int n : new int[] { 100, 1000, 10000 }) {
            long dup = nestedLoopInner(n);
            double ratio = dup / (double) n;
            System.out.println("n=" + n + " nested_over_n=" + String.format("%.2f", ratio));
        }
        System.out.println();

        // === Block 3: recurrence cheat sheet (printed) ===
        System.out.println("=== Block 3: recurrence → class (interview table) ===");
        System.out.println("T(n)=T(n/2)+O(1)   -> O(log n)");
        System.out.println("T(n)=2T(n/2)+O(n)  -> O(n log n)");
        System.out.println("T(n)=T(n-1)+O(n)   -> O(n^2)");
        System.out.println("T(n)=T(n/2)+O(n)   -> O(n) total (levels * per-level)");
    }
}
`;

export const advancedOutput = `=== Block 1: operation counts vs n ===
n=100 nested_pair_ops=4950 linear_ops=100
n=1000 nested_pair_ops=499500 linear_ops=1000
n=10000 nested_pair_ops=49995000 linear_ops=10000

=== Block 2: growth sanity (nested / n) ===
n=100 nested_over_n=49.50
n=1000 nested_over_n=499.50
n=10000 nested_over_n=4999.50

=== Block 3: recurrence → class (interview table) ===
T(n)=T(n/2)+O(1)   -> O(log n)
T(n)=2T(n/2)+O(n)  -> O(n log n)
T(n)=T(n-1)+O(n)   -> O(n^2)
T(n)=T(n/2)+O(n)   -> O(n) total (levels * per-level)
`;
