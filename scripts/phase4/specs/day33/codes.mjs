export const basicCode = String.raw`package arch.day33;

public class Day33Basic {

    static int len(Object o) {
        if (o instanceof String s) return s.length();
        return -1;
    }

    public static void main(String[] args) {
        System.out.println(len("ab"));
        System.out.println(len(1));
    }
}
`;

export const basicOutput = `2
-1
`;

export const intermediateCode = String.raw`package arch.day33;

import java.util.*;

public class Day33Intermediate {

    static String kind(Object o) {
        if (o == null) {
            return "null";
        }
        return switch (o) {
            case Integer i -> "int:" + i;
            case String s -> "str:" + s.length();
            case List<?> l -> "list:" + l.size();
            default -> "other";
        };
    }

    public static void main(String[] args) {
        // --- Scenario 1: integer ---
        System.out.println("--- Scenario 1 ---");
        System.out.println(kind(7));
        System.out.println();

        // --- Scenario 2: string ---
        System.out.println("--- Scenario 2 ---");
        System.out.println(kind("hey"));
        System.out.println();

        // --- Scenario 3: list ---
        System.out.println("--- Scenario 3 ---");
        System.out.println(kind(List.of(1, 2)));
        System.out.println();

        // --- Scenario 4: null ---
        System.out.println("--- Scenario 4 ---");
        System.out.println(kind(null));
    }
}
`;

export const intermediateOutput = `--- Scenario 1 ---
int:7

--- Scenario 2 ---
str:3

--- Scenario 3 ---
list:2

--- Scenario 4 ---
null
`;

export const advancedCode = String.raw`package arch.day33;

public class Day33Advanced {

    enum Coin {
        HEAD,
        TAIL
    }

    static String flip(Coin c) {
        return switch (c) {
            case HEAD -> "H";
            case TAIL -> "T";
        };
    }

    public static void main(String[] args) {
        // === Block 1: enum exhaustive ===
        System.out.println("=== Block 1 ===");
        System.out.println(flip(Coin.HEAD));
        System.out.println();

        // === Block 2: style ===
        System.out.println("=== Block 2 ===");
        System.out.println("arrow cases: no fall-through");
        System.out.println("switch expr: yields value");
        System.out.println();

        // === Block 3: instanceof table ===
        System.out.println("=== Block 3 ===");
        System.out.println("old: cast after instanceof");
        System.out.println("new: bind in pattern");
    }
}
`;

export const advancedOutput = `=== Block 1 ===
H

=== Block 2 ===
arrow cases: no fall-through
switch expr: yields value

=== Block 3 ===
old: cast after instanceof
new: bind in pattern
`;
