package arch.day10;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Day 10 advanced: dispatch budget + policy map (records + collections).
 */
public class Day10Advanced {

    record ShapeBudget(String layer, int maxDepth, boolean sealedHint) {}

    static List<ShapeBudget> tiers() {
        List<ShapeBudget> list = new ArrayList<>();
        list.add(new ShapeBudget("domain", 3, true));
        list.add(new ShapeBudget("service", 2, false));
        list.add(new ShapeBudget("adapter", 1, true));
        return list;
    }

    static Map<String, String> violationPlaybook() {
        Map<String, String> m = new LinkedHashMap<>();
        m.put("ClassCastException", "downcast after raw list - tighten generics + instanceof");
        m.put("AbstractMethodError", "lagging child jar - align deploy or add default hook");
        m.put("IncompatibleClassChangeError", "two shapes of superclass - kill duplicate loaders");
        return m;
    }

    public static void main(String[] args) {
        System.out.println("banner: Day10 advanced polymorphism guardrails");

        System.out.println("=== Block 1: inheritance depth budget ===");
        int penalized = 0;
        for (ShapeBudget b : tiers()) {
            int score = b.maxDepth() + (b.sealedHint() ? 0 : 1);
            System.out.println(b.layer() + " | budget=" + b.maxDepth() + " | score=" + score);
            if (score > 3) {
                penalized++;
            }
        }
        System.out.println("tiers over budget = " + penalized);
        System.out.println();

        System.out.println("=== Block 2: playbook lookup order ===");
        Map<String, String> book = violationPlaybook();
        List<String> keys = List.of("ClassCastException", "AbstractMethodError", "Unknown");
        for (String k : keys) {
            String fix = book.getOrDefault(k, "fallback: jstack + javap both classpath sides");
            System.out.println(k + " -> " + fix);
        }
        System.out.println();

        System.out.println("=== Block 3: virtual readiness matrix ===");
        Map<String, Boolean> checks = new LinkedHashMap<>();
        checks.put("@Override present", true);
        checks.put("covariant return documented", true);
        checks.put("static helpers renamed away from override names", false);
        int pass = 0;
        for (Map.Entry<String, Boolean> e : checks.entrySet()) {
            if (Boolean.TRUE.equals(e.getValue())) {
                pass++;
            }
            System.out.println(e.getKey() + " | " + e.getValue());
        }
        System.out.println("pass count = " + pass + " / " + checks.size());
        System.out.println("eof");
    }
}

