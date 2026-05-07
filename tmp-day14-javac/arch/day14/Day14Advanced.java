package arch.day14;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Day 14 advanced: workload routing + concurrency posture + checklist.
 */
public class Day14Advanced {

    record WorkloadPick(String signal, String pick, String reason) {}

    static List<WorkloadPick> workloadTable() {
        List<WorkloadPick> rows = new ArrayList<>();
        rows.add(new WorkloadPick("random index hot", "ArrayList", "cache-friendly array backing"));
        rows.add(new WorkloadPick("sorted range scans", "TreeMap", "NavigableMap red-black order"));
        rows.add(new WorkloadPick("shared read-heavy cache", "ConcurrentHashMap", "striped CAS not one lock"));
        rows.add(new WorkloadPick("stable audit iteration", "LinkedHashMap", "predictable encounter order"));
        return rows;
    }

    static Map<String, Integer> riskWeights() {
        Map<String, Integer> m = new LinkedHashMap<>();
        m.put("mutable HashMap keys in prod", 5);
        m.put("getter returns internal ArrayList", 4);
        m.put("PriorityQueue foreach for ordering", 3);
        m.put("bounded ArrayDeque task queue", 0);
        return m;
    }

    public static void main(String[] args) {
        System.out.println("banner: Day14 advanced collection guardrails");
        System.out.println("scope: arch.day14 workload + concurrency matrix");
        System.out.println();
        System.out.println();

        System.out.println("=== Block 1: list and map workload picker ===");
        for (WorkloadPick w : workloadTable()) {
            System.out.println(w.signal() + " | " + w.pick() + " | " + w.reason());
        }
        System.out.println();

        System.out.println("=== Block 2: risk weight board ===");
        int sum = 0;
        for (Map.Entry<String, Integer> e : riskWeights().entrySet()) {
            sum += e.getValue();
            System.out.println(e.getKey() + " = " + e.getValue());
        }
        System.out.println("total risk = " + sum);
        System.out.println();

        System.out.println("=== Block 3: PR checklist ===");
        Map<String, Boolean> checks = new LinkedHashMap<>();
        checks.put("DTO getters return copyOf or unmodifiable snapshots", false);
        checks.put("HashMap keys immutable or stable String ids", true);
        checks.put("Concurrent reads migrated off synchronizedMap hotspots", true);
        int pass = 0;
        for (Map.Entry<String, Boolean> c : checks.entrySet()) {
            if (Boolean.TRUE.equals(c.getValue())) {
                pass++;
            }
            System.out.println(c.getKey() + " | " + c.getValue());
        }
        System.out.println("pass count = " + pass + " / " + checks.size());
        System.out.println("eof");
    }
}
