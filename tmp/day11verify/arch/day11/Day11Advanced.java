package arch.day11;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Day 11 advanced: opcode routing + contract budget + readiness matrix.
 */
public class Day11Advanced {

    record ContractSignal(String surface, String opcode, boolean allowsFields) {}

    static List<ContractSignal> catalog() {
        List<ContractSignal> list = new ArrayList<>();
        list.add(new ContractSignal("abstract class template", "invokevirtual", true));
        list.add(new ContractSignal("interface default body", "invokeinterface", false));
        list.add(new ContractSignal("interface static helper", "invokestatic", false));
        list.add(new ContractSignal("lambda SAM", "invokedynamic", false));
        return list;
    }

    static Map<String, Integer> evolutionDebt() {
        Map<String, Integer> m = new LinkedHashMap<>();
        m.put("default methods added last quarter", 3);
        m.put("FunctionalInterface regressions caught in CI", 1);
        m.put("sealed permits mismatches between artifacts", 0);
        m.put("duplicate SPI files caught in staging", 1);
        return m;
    }

    public static void main(String[] args) {
        System.out.println("banner: Day11 advanced contract guardrails");
        System.out.println();
        System.out.println();

        System.out.println("=== Block 1: dispatch catalog ===");
        for (ContractSignal c : catalog()) {
            System.out.println(c.surface() + " | opcode=" + c.opcode() + " | fields=" + c.allowsFields());
        }
        System.out.println();

        System.out.println("=== Block 2: evolution debt scoreboard ===");
        int total = 0;
        for (Map.Entry<String, Integer> e : evolutionDebt().entrySet()) {
            total += e.getValue();
            System.out.println(e.getKey() + " = " + e.getValue());
        }
        System.out.println("total debt points = " + total);
        System.out.println();

        System.out.println("=== Block 3: release readiness matrix ===");
        Map<String, Boolean> checks = new LinkedHashMap<>();
        checks.put("javap diff clean for shared interfaces", true);
        checks.put("SPI provider files unique", true);
        checks.put("second abstract method blocked on FunctionalInterface", false);
        int pass = 0;
        for (Map.Entry<String, Boolean> e : checks.entrySet()) {
            if (Boolean.TRUE.equals(e.getValue())) {
                pass++;
            }
            System.out.println(e.getKey() + " | " + e.getValue());
        }
        System.out.println("pass count = " + pass + " / " + checks.size());
        System.out.println("summary: block models Staff gate for interface-heavy releases");
        System.out.println("eof");
    }
}
