package arch.day28;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Day 28 advanced: wildcard posture + erasure flags + checklist.
 */
public class Day28Advanced {

    record ApiPosture(String surface, String wildcardRule, int safetyScore) {}

    static List<ApiPosture> postureRows() {
        List<ApiPosture> rows = new ArrayList<>();
        rows.add(new ApiPosture("read-only return", "extends producer", 2));
        rows.add(new ApiPosture("sink parameter", "super consumer", 2));
        rows.add(new ApiPosture("internal algorithm", "named type param", 3));
        rows.add(new ApiPosture("JSON edge", "TypeToken or JavaType", 1));
        return rows;
    }

    static Map<String, Boolean> erasureFlags() {
        Map<String, Boolean> m = new LinkedHashMap<>();
        m.put("runtime instanceof List<String>", false);
        m.put("need Class<T> for reflection newInstance", true);
        m.put("bridges appear on covariant returns", true);
        m.put("raw types strip compiler proofs", true);
        return m;
    }

    public static void main(String[] args) {
        System.out.println("banner: Day28 advanced generics guardrails");
        System.out.println("scope: arch.day28 erasure + boundary matrix");
        System.out.println();
        System.out.println();

        System.out.println("=== Block 1: API posture table ===");
        for (ApiPosture r : postureRows()) {
            System.out.println(r.surface() + " | " + r.wildcardRule() + " | score=" + r.safetyScore());
        }
        System.out.println();

        System.out.println("=== Block 2: erasure truth board ===");
        int trueCount = 0;
        for (Map.Entry<String, Boolean> e : erasureFlags().entrySet()) {
            if (Boolean.TRUE.equals(e.getValue())) {
                trueCount++;
            }
            System.out.println(e.getKey() + " -> " + e.getValue());
        }
        System.out.println("trueStatements=" + trueCount);
        System.out.println();

        System.out.println("=== Block 3: merge checklist ===");
        Map<String, Boolean> checks = new LinkedHashMap<>();
        checks.put("shared modules compile with -Xlint:unchecked", false);
        checks.put("public APIs avoid raw types in signatures", true);
        checks.put("covariant services have javap bridge notes in PR", true);
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
