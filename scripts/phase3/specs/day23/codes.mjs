export const basicCode = String.raw`package arch.day23;

import java.util.*;

public class Day23Basic {

    public static void main(String[] args) {
        Map<String, Integer> m = new HashMap<>();
        m.put("a", 1);
        m.put("b", 2);
        m.put("a", m.get("a") + 1);
        System.out.println("=== HashMap basic ===");
        System.out.println(m);
        System.out.println("size=" + m.size());
    }
}
`;

export const basicOutput = `=== HashMap basic ===
{a=2, b=2}
size=2
`;

export const intermediateCode = String.raw`package arch.day23;

import java.util.*;

public class Day23Intermediate {

    static Map<Character, Integer> freq(String s) {
        Map<Character, Integer> m = new HashMap<>();
        for (char c : s.toCharArray()) {
            m.put(c, m.getOrDefault(c, 0) + 1);
        }
        return m;
    }

    public static void main(String[] args) {
        // --- Scenario 1: frequency map ---
        System.out.println("--- Scenario 1: frequencies ---");
        System.out.println(freq("abracadabra"));
        System.out.println();

        // --- Scenario 2: first non-repeating linear scan ---
        System.out.println("--- Scenario 2: first unique char ---");
        String w = "leetcode";
        Map<Character, Integer> f = freq(w);
        char ans = '_';
        for (char c : w.toCharArray()) {
            if (f.get(c) == 1) {
                ans = c;
                break;
            }
        }
        System.out.println("char=" + ans);
        System.out.println();

        // --- Scenario 3: grouping by first letter ---
        System.out.println("--- Scenario 3: group by bucket ---");
        String[] xs = { "apple", "apricot", "banana", "cherry" };
        Map<Character, List<String>> g = new TreeMap<>();
        for (String x : xs) {
            g.computeIfAbsent(x.charAt(0), k -> new ArrayList<>()).add(x);
        }
        System.out.println(g);
        System.out.println();

        // --- Scenario 4: LinkedHashMap insertion order ---
        System.out.println("--- Scenario 4: LinkedHashMap order ---");
        Map<Integer, String> ord = new LinkedHashMap<>();
        ord.put(3, "c");
        ord.put(1, "a");
        ord.put(2, "b");
        System.out.println(ord.keySet());
    }
}
`;

export const intermediateOutput = `--- Scenario 1: frequencies ---
{a=5, b=2, r=2, c=1, d=1}

--- Scenario 2: first unique char ---
char=l

--- Scenario 3: group by bucket ---
{a=[apple, apricot], b=[banana], c=[cherry]}

--- Scenario 4: LinkedHashMap order ---
[3, 1, 2]
`;

export const advancedCode = String.raw`package arch.day23;

import java.util.*;

public class Day23Advanced {

    record Key(String a, int b) {
        @Override public boolean equals(Object o) {
            return o instanceof Key k && a.equals(k.a) && b == k.b;
        }
        @Override public int hashCode() {
            return Objects.hash(a, b);
        }
    }

    public static void main(String[] args) {
        // === Block 1: custom key with contract ===
        System.out.println("=== Block 1: record key equals/hashCode ===");
        Map<Key, String> m = new HashMap<>();
        m.put(new Key("x", 1), "found");
        System.out.println(m.get(new Key("x", 1)));
        System.out.println();

        // === Block 2: choose map table ===
        System.out.println("=== Block 2: pick your map ===");
        System.out.println("Need sorted keys        -> TreeMap");
        System.out.println("Need insertion order    -> LinkedHashMap");
        System.out.println("Need max throughput     -> HashMap + good hash");
        System.out.println("Need concurrent updates -> ConcurrentHashMap");
        System.out.println();

        // === Block 3: load factor intuition ===
        System.out.println("=== Block 3: resizing cost ===");
        System.out.println("When entries > capacity * loadFactor, capacity doubles and entries rehash.");
        System.out.println("Amortized O(1) insert despite rare O(n) resize.");
    }
}
`;

export const advancedOutput = `=== Block 1: record key equals/hashCode ===
found

=== Block 2: pick your map ===
Need sorted keys        -> TreeMap
Need insertion order    -> LinkedHashMap
Need max throughput     -> HashMap + good hash
Need concurrent updates -> ConcurrentHashMap

=== Block 3: resizing cost ===
When entries > capacity * loadFactor, capacity doubles and entries rehash.
Amortized O(1) insert despite rare O(n) resize.
`;
