export const basicCode = String.raw`package arch.day32;

public class Day32Basic {

    record Point(int x, int y) {}

    public static void main(String[] args) {
        Point p = new Point(2, 3);
        System.out.println(p.x() + p.y());
        System.out.println(p);
    }
}
`;

export const basicOutput = `5
Point[x=2, y=3]
`;

export const intermediateCode = String.raw`package arch.day32;

public class Day32Intermediate {

    public sealed interface Shape permits Circle, Rectangle {
        double area();
    }

    public record Circle(double r) implements Shape {

        public Circle {
            if (r < 0) throw new IllegalArgumentException("r");
        }

        @Override
        public double area() {
            return Math.PI * r * r;
        }
    }

    public record Rectangle(double w, double h) implements Shape {

        public Rectangle {
            if (w < 0 || h < 0) throw new IllegalArgumentException("dim");
        }

        @Override
        public double area() {
            return w * h;
        }
    }

    static String label(Shape s) {
        return switch (s) {
            case Circle c -> "circle:" + (int) c.area();
            case Rectangle r -> "rect:" + (int) r.area();
        };
    }

    public static void main(String[] args) {
        // --- Scenario 1: circle ---
        System.out.println("--- Scenario 1 ---");
        System.out.println(label(new Circle(1)));
        System.out.println();

        // --- Scenario 2: rectangle ---
        System.out.println("--- Scenario 2 ---");
        System.out.println(label(new Rectangle(3, 4)));
        System.out.println();

        // --- Scenario 3: record equals ---
        System.out.println("--- Scenario 3 ---");
        System.out.println(new Circle(2).equals(new Circle(2)));
        System.out.println();

        // --- Scenario 4: compact ctor ---
        System.out.println("--- Scenario 4 ---");
        try {
            new Rectangle(-1, 2);
            System.out.println("bad");
        } catch (IllegalArgumentException e) {
            System.out.println("caught");
        }
    }
}
`;

export const intermediateOutput = `--- Scenario 1 ---
circle:3

--- Scenario 2 ---
rect:12

--- Scenario 3 ---
true

--- Scenario 4 ---
caught
`;

export const advancedCode = String.raw`package arch.day32;

public class Day32Advanced {

    record Range(int lo, int hi) {
        Range {
            if (lo > hi) throw new IllegalArgumentException("lo>hi");
        }
    }

    public static void main(String[] args) {
        // === Block 1: sealed benefit ===
        System.out.println("=== Block 1 ===");
        System.out.println("Exhaustive switch over sealed hierarchy");
        System.out.println();

        // === Block 2: table ===
        System.out.println("=== Block 2 ===");
        System.out.println("record: data carrier");
        System.out.println("sealed: closed hierarchy");
        System.out.println("non-sealed: open extension");
        System.out.println();

        // === Block 3: Range ===
        System.out.println("=== Block 3 ===");
        Range r = new Range(1, 5);
        System.out.println(r.lo() + "-" + r.hi());
    }
}
`;

export const advancedOutput = `=== Block 1 ===
Exhaustive switch over sealed hierarchy

=== Block 2 ===
record: data carrier
sealed: closed hierarchy
non-sealed: open extension

=== Block 3 ===
1-5
`;
