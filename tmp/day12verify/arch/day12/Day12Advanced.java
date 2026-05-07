package arch.day12;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Day 12 advanced: alias risk scoring + immutability checklist + publication matrix.
 */
public class Day12Advanced {

    record RiskRule(String pattern, int score) {}

    static List<RiskRule> rules() {
        List<RiskRule> list = new ArrayList<>();
        list.add(new RiskRule("getter returns internal ArrayList", 5));
        list.add(new RiskRule("ctor stores caller array without copy", 4));
        list.add(new RiskRule("record wraps mutable Date", 3));
        list.add(new RiskRule("public non-final fields on DTO", 2));
        return list;
    }

    static Map<String, Boolean> immutabilityGate() {
        Map<String, Boolean> m = new LinkedHashMap<>();
        m.put("all fields private final", true);
        m.put("no setters on value type", true);
        m.put("collections use copyOf on ingress", false);
        m.put("cache keys are records or primitives", true);
        return m;
    }

    public static void main(String[] args) {
        System.out.println("banner: Day12 advanced encapsulation guardrails");
        System.out.println();
        System.out.println();

        System.out.println("=== Block 1: alias risk scoreboard ===");
        int total = 0;
        for (RiskRule r : rules()) {
            total += r.score();
            System.out.println(r.pattern() + " | score=" + r.score());
        }
        System.out.println("total risk = " + total);
        System.out.println();

        System.out.println("=== Block 2: immutability checklist ===");
        Map<String, Boolean> gate = immutabilityGate();
        int pass = 0;
        for (Map.Entry<String, Boolean> e : gate.entrySet()) {
            if (Boolean.TRUE.equals(e.getValue())) {
                pass++;
            }
            System.out.println(e.getKey() + " | " + e.getValue());
        }
        System.out.println("pass count = " + pass + " / " + gate.size());
        System.out.println();

        System.out.println("=== Block 3: publication posture matrix ===");
        Map<String, String> pub = new LinkedHashMap<>();
        pub.put("immutable snapshot", "safe handoff across threads without extra locks");
        pub.put("mutable bean", "requires explicit synchronization or confinement");
        pub.put("leaked collection", "ConcurrentModificationException or silent corruption");
        for (Map.Entry<String, String> e : pub.entrySet()) {
            System.out.println(e.getKey() + " -> " + e.getValue());
        }
        System.out.println("eof");
    }
}
