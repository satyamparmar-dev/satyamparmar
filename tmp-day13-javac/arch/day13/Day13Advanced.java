package arch.day13;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Day 13 advanced: nest pattern catalog + leak score + refactor checklist.
 */
public class Day13Advanced {

    record NestPattern(String kind, boolean holdsOuter) {}

    static List<NestPattern> catalog() {
        List<NestPattern> list = new ArrayList<>();
        list.add(new NestPattern("static nested builder", false));
        list.add(new NestPattern("inner iterator", true));
        list.add(new NestPattern("anonymous listener", true));
        list.add(new NestPattern("lambda capturing this", true));
        return list;
    }

    static Map<String, Integer> leakWeights() {
        Map<String, Integer> m = new LinkedHashMap<>();
        m.put("singleton outer + inner handler", 5);
        m.put("per-request anonymous", 3);
        m.put("static nested utility", 0);
        m.put("local class in tight loop", 2);
        return m;
    }

    public static void main(String[] args) {
        System.out.println("banner: Day13 advanced nested-class guardrails");
        System.out.println("scope: arch.day13 bytecode + heap coupling model");
        System.out.println();
        System.out.println();

        System.out.println("=== Block 1: pattern catalog ===");
        for (NestPattern n : catalog()) {
            System.out.println(n.kind() + " | holdsOuter=" + n.holdsOuter());
        }
        System.out.println();

        System.out.println("=== Block 2: leak weight board ===");
        int sum = 0;
        for (Map.Entry<String, Integer> e : leakWeights().entrySet()) {
            sum += e.getValue();
            System.out.println(e.getKey() + " = " + e.getValue());
        }
        System.out.println("total weight = " + sum);
        System.out.println();

        System.out.println("=== Block 3: refactor checklist ===");
        Map<String, Boolean> checks = new LinkedHashMap<>();
        checks.put("javap shows no this$0 on hot path handlers", false);
        checks.put("shade verified for Outer$Inner pairs", true);
        checks.put("tests cover outer.new Inner construction", true);
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
