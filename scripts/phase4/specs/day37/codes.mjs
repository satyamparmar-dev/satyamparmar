export const basicCode = String.raw`package arch.day37;

public class Day37Basic {

    public static void main(String[] args) {
        Runtime rt = Runtime.getRuntime();
        System.out.println(rt.maxMemory() > 0);
        System.out.println(rt.availableProcessors() > 0);
    }
}
`;

export const basicOutput = `true
true
`;

export const intermediateCode = String.raw`package arch.day37;

public class Day37Intermediate {

    public static void main(String[] args) {
        Runtime rt = Runtime.getRuntime();

        // --- Scenario 1: memory flags ---
        System.out.println("--- Scenario 1 ---");
        System.out.println("max>0=" + (rt.maxMemory() > 0));
        System.out.println("total>0=" + (rt.totalMemory() > 0));
        System.out.println();

        // --- Scenario 2: used non-negative ---
        System.out.println("--- Scenario 2 ---");
        long used = rt.totalMemory() - rt.freeMemory();
        System.out.println("used_nonneg=" + (used >= 0));
        System.out.println();

        // --- Scenario 3: allocation ---
        System.out.println("--- Scenario 3 ---");
        byte[] b = new byte[256 * 1024];
        System.out.println("buf=" + b.length);
        System.out.println();

        // --- Scenario 4: processors ---
        System.out.println("--- Scenario 4 ---");
        System.out.println("procs_ok=" + (rt.availableProcessors() > 0));
    }
}
`;

export const intermediateOutput = `--- Scenario 1 ---
max>0=true
total>0=true

--- Scenario 2 ---
used_nonneg=true

--- Scenario 3 ---
buf=262144

--- Scenario 4 ---
procs_ok=true
`;

export const advancedCode = String.raw`package arch.day37;

public class Day37Advanced {

    public static void main(String[] args) {
        // === Block 1: heap vs stack concept ===
        System.out.println("=== Block 1 ===");
        System.out.println("heap: objects arrays");
        System.out.println("stack: frames primitives refs");
        System.out.println();

        // === Block 2: GC axes ===
        System.out.println("=== Block 2 ===");
        System.out.println("throughput vs latency");
        System.out.println("STW vs concurrent phases");
        System.out.println();

        // === Block 3: tuning table ===
        System.out.println("=== Block 3 ===");
        System.out.println("Xmx cap heap");
        System.out.println("UseGCLog flags JDK version dependent");
        System.out.println("NMT/JFR for deep dives");
    }
}
`;

export const advancedOutput = `=== Block 1 ===
heap: objects arrays
stack: frames primitives refs

=== Block 2 ===
throughput vs latency
STW vs concurrent phases

=== Block 3 ===
Xmx cap heap
UseGCLog flags JDK version dependent
NMT/JFR for deep dives
`;
