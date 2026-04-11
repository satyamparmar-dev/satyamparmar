export const basicCode = String.raw`package arch.day31;

import java.util.*;

public class Day31Basic {

    public static void main(String[] args) {
        Optional<String> o = Optional.of("hi");
        System.out.println(o.map(String::length).orElse(0));
        System.out.println(Optional.<String>empty().orElse("x"));
    }
}
`;

export const basicOutput = `2
x
`;

export const intermediateCode = String.raw`package arch.day31;

import java.util.*;

public class Day31Intermediate {

    record Address(String city) {}

    record User(String name, Optional<Address> address) {}

    static Optional<String> cityOf(User u) {
        return u.address().flatMap(a -> Optional.ofNullable(a.city()));
    }

    public static void main(String[] args) {
        // --- Scenario 1: present chain ---
        System.out.println("--- Scenario 1 ---");
        User u1 = new User("A", Optional.of(new Address("Oslo")));
        System.out.println(cityOf(u1).orElse("unknown"));
        System.out.println();

        // --- Scenario 2: empty address ---
        System.out.println("--- Scenario 2 ---");
        User u2 = new User("B", Optional.empty());
        System.out.println(cityOf(u2).orElse("unknown"));
        System.out.println();

        // --- Scenario 3: null city ---
        System.out.println("--- Scenario 3 ---");
        User u3 = new User("C", Optional.of(new Address(null)));
        System.out.println(cityOf(u3).orElse("unknown"));
        System.out.println();

        // --- Scenario 4: filter ---
        System.out.println("--- Scenario 4 ---");
        System.out.println(Optional.of(9).filter(n -> n > 5).orElse(0));
    }
}
`;

export const intermediateOutput = `--- Scenario 1 ---
Oslo

--- Scenario 2 ---
unknown

--- Scenario 3 ---
unknown

--- Scenario 4 ---
9
`;

export const advancedCode = String.raw`package arch.day31;

import java.util.*;
import java.util.stream.*;

public class Day31Advanced {

    public static void main(String[] args) {
        // === Block 1: stream bridge ===
        System.out.println("=== Block 1: stream ===");
        List<Optional<String>> opts = List.of(Optional.of("a"), Optional.empty(), Optional.of("b"));
        String joined =
                opts.stream().flatMap(Optional::stream).collect(Collectors.joining());
        System.out.println(joined);
        System.out.println();

        // === Block 2: orElseGet ===
        System.out.println("=== Block 2: lazy ===");
        int[] calls = { 0 };
        String v = Optional.<String>empty().orElseGet(() -> {
            calls[0]++;
            return "gen";
        });
        System.out.println(v + calls[0]);
        System.out.println();

        // === Block 3: cheat sheet ===
        System.out.println("=== Block 3: rules ===");
        System.out.println("orElse: eager default");
        System.out.println("orElseGet: Supplier lazy");
        System.out.println("orElseThrow: fail fast");
    }
}
`;

export const advancedOutput = `=== Block 1: stream ===
ab

=== Block 2: lazy ===
gen1

=== Block 3: rules ===
orElse: eager default
orElseGet: Supplier lazy
orElseThrow: fail fast
`;
