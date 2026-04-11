export const basicCode = String.raw`package arch.day28;

public class Day28Basic {

    static final class Pair<A, B> {
        private final A left;
        private final B right;

        Pair(A left, B right) {
            this.left = left;
            this.right = right;
        }

        A left() {
            return left;
        }

        B right() {
            return right;
        }

        Pair<B, A> swap() {
            return new Pair<>(right, left);
        }
    }

    static <A, B> String fmt(Pair<A, B> p) {
        return p.left() + "|" + p.right();
    }

    public static void main(String[] args) {
        Pair<String, Integer> p = new Pair<>("x", 2);
        System.out.println(fmt(p));
        System.out.println(p.swap().left());
    }
}
`;

export const basicOutput = `x|2
2
`;

export const intermediateCode = String.raw`package arch.day28;

import java.util.*;

public class Day28Intermediate {

    static double sumNumbers(List<? extends Number> xs) {
        double t = 0;
        for (Number n : xs) t += n.doubleValue();
        return t;
    }

    static void addIntegers(List<? super Integer> dst, Iterable<Integer> src) {
        for (Integer x : src) dst.add(x);
    }

    public static void main(String[] args) {
        // --- Scenario 1: extends for read ---
        System.out.println("--- Scenario 1: sumNumbers ---");
        System.out.println(sumNumbers(List.of(1, 2.5, 3)));
        System.out.println();

        // --- Scenario 2: super for write ---
        System.out.println("--- Scenario 2: addIntegers ---");
        List<Number> buf = new ArrayList<>();
        addIntegers(buf, List.of(4, 5));
        System.out.println(buf);
        System.out.println();

        // --- Scenario 3: generic method max ---
        System.out.println("--- Scenario 3: max ---");
        System.out.println(max(List.of("a", "z", "m")));
        System.out.println();

        // --- Scenario 4: copy with wildcard ---
        System.out.println("--- Scenario 4: copy list ---");
        List<Integer> a = new ArrayList<>(List.of(1, 2));
        List<Integer> b = new ArrayList<>();
        copy(a, b);
        System.out.println(b);
    }

    static <T extends Comparable<T>> T max(List<T> xs) {
        T m = xs.get(0);
        for (T x : xs) if (x.compareTo(m) > 0) m = x;
        return m;
    }

    static <T> void copy(List<? extends T> src, List<? super T> dst) {
        for (T x : src) dst.add(x);
    }
}
`;

export const intermediateOutput = `--- Scenario 1: sumNumbers ---
6.5

--- Scenario 2: addIntegers ---
[4, 5]

--- Scenario 3: max ---
z

--- Scenario 4: copy list ---
[1, 2]
`;

export const advancedCode = String.raw`package arch.day28;

import java.util.*;

public class Day28Advanced {

    interface Mapper<T, R> {
        R apply(T t);
    }

    static <T, R> List<R> map(List<T> xs, Mapper<T, R> f) {
        List<R> out = new ArrayList<>();
        for (T x : xs) out.add(f.apply(x));
        return out;
    }

    public static void main(String[] args) {
        // === Block 1: PECS cheat sheet ===
        System.out.println("=== Block 1: PECS ===");
        System.out.println("Producer extends: read T from structure");
        System.out.println("Consumer super: write T into structure");
        System.out.println();

        // === Block 2: erasure reminder ===
        System.out.println("=== Block 2: runtime ===");
        System.out.println("List<String> and List<Integer> share same class List");
        System.out.println("Cannot new List<String>[1]");
        System.out.println();

        // === Block 3: API choice ===
        System.out.println("=== Block 3: API table ===");
        System.out.println("Public return: prefer ? extends T when read-only");
        System.out.println("Public param: prefer ? super T when consuming");
        List<Integer> nums = List.of(1, 2, 3);
        System.out.println(map(nums, n -> n * 2));
    }
}
`;

export const advancedOutput = `=== Block 1: PECS ===
Producer extends: read T from structure
Consumer super: write T into structure

=== Block 2: runtime ===
List<String> and List<Integer> share same class List
Cannot new List<String>[1]

=== Block 3: API table ===
Public return: prefer ? extends T when read-only
Public param: prefer ? super T when consuming
[2, 4, 6]
`;
