/** Days 6–45 — topic-specific Code tab snippets */

function B(pkg, body) {
  return `package ${pkg};\n\n${body}`;
}

export const SNIPPETS_6_45 = {
  6: {
    basic: {
      description: 'Named methods + recursion: factorial shows base case and recursive call.',
      code: B(
        'arch.day6',
        `public class Day6Basic {
    static int factorial(int n) {
        if (n <= 1) return 1;
        return n * factorial(n - 1);
    }

    public static void main(String[] args) {
        System.out.println("factorial(5) = " + factorial(5));
    }
}`,
      ),
      output: 'factorial(5) = 120\n',
    },
    intermediate: {
      description: 'Method overloading: same method name, different parameter lists (resolved at compile time).',
      code: B(
        'arch.day6',
        `public class Day6Intermediate {
    static int add(int a, int b) { return a + b; }
    static double add(double a, double b) { return a + b; }
    static String add(String a, String b) { return a + b; }

    public static void main(String[] args) {
        System.out.println(add(2, 3));
        System.out.println(add(2.0, 3.0));
        System.out.println(add("foo", "bar"));
    }
}`,
      ),
      output: '5\n5.0\nfoobar\n',
    },
    advanced: {
      description: 'Fibonacci: naive recursion vs O(n) iteration — classic stack-depth vs performance trade-off.',
      code: B(
        'arch.day6',
        `public class Day6Advanced {
    static long fibSlow(int n) {
        if (n <= 1) return n;
        return fibSlow(n - 1) + fibSlow(n - 2);
    }

    static long fibFast(long n) {
        if (n <= 1) return n;
        long a = 0, b = 1;
        for (long i = 2; i <= n; i++) {
            long c = a + b;
            a = b;
            b = c;
        }
        return b;
    }

    public static void main(String[] args) {
        int n = 10;
        System.out.println("fibSlow(" + n + ") = " + fibSlow(n));
        System.out.println("fibFast(" + n + ") = " + fibFast(n));
    }
}`,
      ),
      output: 'fibSlow(10) = 55\nfibFast(10) = 55\n',
    },
  },

  7: {
    basic: {
      description: 'Define a class with fields and a constructor — objects bundle state + behavior.',
      code: B(
        'arch.day7',
        `public class Day7Basic {
    static class Person {
        private final String name;
        private int age;

        Person(String name, int age) {
            this.name = name;
            this.age = age;
        }

        String describe() {
            return name + " is " + age + " years old";
        }
    }

    public static void main(String[] args) {
        Person p = new Person("Ana", 28);
        System.out.println(p.describe());
    }
}`,
      ),
      output: 'Ana is 28 years old\n',
    },
    intermediate: {
      description: 'Inheritance + @Override: subtype replaces behavior while reusing the superclass contract.',
      code: B(
        'arch.day7',
        `public class Day7Intermediate {
    static abstract class Shape {
        abstract double area();
    }

    static class Circle extends Shape {
        private final double r;
        Circle(double r) { this.r = r; }
        @Override double area() { return Math.PI * r * r; }
    }

    public static void main(String[] args) {
        Shape s = new Circle(2);
        System.out.println("area = " + s.area());
    }
}`,
      ),
      output: 'area = 12.566370614359172\n',
    },
    advanced: {
      description: 'Polymorphism: store different subtypes behind Shape; dispatch calls the right area().',
      code: B(
        'arch.day7',
        `public class Day7Advanced {
    static abstract class Shape {
        abstract double area();
    }
    static class Rect extends Shape {
        final double w, h;
        Rect(double w, double h) { this.w = w; this.h = h; }
        @Override double area() { return w * h; }
    }
    static class Circle extends Shape {
        final double r;
        Circle(double r) { this.r = r; }
        @Override double area() { return Math.PI * r * r; }
    }

    public static void main(String[] args) {
        Shape[] shapes = { new Rect(3, 4), new Circle(2) };
        double total = 0;
        for (Shape s : shapes) total += s.area();
        System.out.println("total area = " + total);
    }
}`,
      ),
      output: 'total area = 24.566370614359172\n',
    },
  },

  8: {
    basic: {
      description: 'Access modifiers on fields/methods: public vs package-private vs private in one class.',
      code: B(
        'arch.day8',
        `public class Day8Basic {
    public int pub = 1;
    int pkg = 2;
    private int prv = 3;

    public static void main(String[] args) {
        Day8Basic x = new Day8Basic();
        System.out.println(x.pub + " " + x.pkg + " " + x.prv);
    }
}`,
      ),
      output: '1 2 3\n',
    },
    intermediate: {
      description: 'Same package vs other package: protected and package access (simulated with inner types).',
      code: B(
        'arch.day8',
        `public class Day8Intermediate {
    static class Base {
        protected int v = 10;
    }
    static class Sub extends Base {
        int bump() { return v + 1; }
    }

    public static void main(String[] args) {
        System.out.println(new Sub().bump());
    }
}`,
      ),
      output: '11\n',
    },
    advanced: {
      description: 'API surface: expose an interface, hide implementation class — core packaging idea.',
      code: B(
        'arch.day8',
        `public class Day8Advanced {
    interface Clock {
        long millis();
    }

    static final class SystemClock implements Clock {
        @Override public long millis() { return System.currentTimeMillis(); }
    }

    public static void main(String[] args) {
        Clock c = new SystemClock();
        System.out.println("now = " + c.millis());
    }
}`,
      ),
      output: '(prints current millis)\n',
    },
  },

  9: {
    basic: {
      description: 'try/catch: translate IOException to a user message instead of crashing.',
      code: B(
        'arch.day9',
        `public class Day9Basic {
    static int parsePositive(String s) {
        try {
            int v = Integer.parseInt(s);
            if (v <= 0) throw new IllegalArgumentException("must be positive");
            return v;
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("not a number", e);
        }
    }

    public static void main(String[] args) {
        try {
            System.out.println(parsePositive("42"));
            System.out.println(parsePositive("oops"));
        } catch (IllegalArgumentException e) {
            System.out.println("bad input: " + e.getMessage());
        }
    }
}`,
      ),
      output: '42\nbad input: not a number\n',
    },
    intermediate: {
      description: 'try-with-resources: AutoCloseable ensures close() even when an exception occurs.',
      code: B(
        'arch.day9',
        `import java.io.*;

public class Day9Intermediate {
    static class Demo implements AutoCloseable {
        @Override public void close() { System.out.println("closed"); }
    }

    public static void main(String[] args) {
        try (Demo d = new Demo()) {
            System.out.println("work");
        }
    }
}`,
      ),
      output: 'work\nclosed\n',
    },
    advanced: {
      description: 'Custom checked exception + translation layer: map low-level errors to domain codes.',
      code: B(
        'arch.day9',
        `public class Day9Advanced extends Exception {
    final String code;
    Day9Advanced(String code, String msg) {
        super(msg);
        this.code = code;
    }

    public static void main(String[] args) {
        try {
            throw new Day9Advanced("E_AUTH", "token expired");
        } catch (Day9Advanced e) {
            System.out.println(e.code + ": " + e.getMessage());
        }
    }
}`,
      ),
      output: 'E_AUTH: token expired\n',
    },
  },

  10: {
    basic: {
      description: 'Subclass extends superclass: inherits fields and can override methods.',
      code: B(
        'arch.day10',
        `public class Day10Basic {
    static class Animal {
        String speak() { return "..."; }
    }
    static class Dog extends Animal {
        @Override String speak() { return "woof"; }
    }

    public static void main(String[] args) {
        Animal a = new Dog();
        System.out.println(a.speak());
    }
}`,
      ),
      output: 'woof\n',
    },
    intermediate: {
      description: 'Runtime polymorphism: method selection uses the object’s actual class (Dog), not the variable type.',
      code: B(
        'arch.day10',
        `public class Day10Intermediate {
    static class Base {
        String id() { return "base"; }
    }
    static class Derived extends Base {
        @Override String id() { return "derived"; }
    }

    public static void main(String[] args) {
        Base b = new Derived();
        System.out.println(b.id());
    }
}`,
      ),
      output: 'derived\n',
    },
    advanced: {
      description: 'Abstract method forces subclasses to implement; base class defines shared algorithm skeleton.',
      code: B(
        'arch.day10',
        `public class Day10Advanced {
    static abstract class Job {
        abstract void runStep();
        final void execute() {
            System.out.println("start");
            runStep();
            System.out.println("end");
        }
    }
    static class PrintJob extends Job {
        @Override void runStep() { System.out.println("printing"); }
    }

    public static void main(String[] args) {
        new PrintJob().execute();
    }
}`,
      ),
      output: 'start\nprinting\nend\n',
    },
  },

  11: {
    basic: {
      description: 'interface defines contract; class implements all abstract methods.',
      code: B(
        'arch.day11',
        `public class Day11Basic {
    interface Logger {
        void log(String msg);
    }

    static class ConsoleLogger implements Logger {
        @Override public void log(String msg) { System.out.println(msg); }
    }

    public static void main(String[] args) {
        Logger l = new ConsoleLogger();
        l.log("hello");
    }
}`,
      ),
      output: 'hello\n',
    },
    intermediate: {
      description: 'Abstract class can hold state; interface cannot (before Java 8) — mix behavior + shared fields.',
      code: B(
        'arch.day11',
        `public class Day11Intermediate {
    static abstract class Named {
        final String name;
        Named(String name) { this.name = name; }
        abstract String role();
    }
    static class User extends Named {
        User(String name) { super(name); }
        @Override String role() { return "user:" + name; }
    }

    public static void main(String[] args) {
        System.out.println(new User("ada").role());
    }
}`,
      ),
      output: 'user:ada\n',
    },
    advanced: {
      description: 'Interface + default method: evolve APIs without breaking every implementation.',
      code: B(
        'arch.day11',
        `public class Day11Advanced {
    interface Greeter {
        default String hi(String name) { return "Hi " + name; }
    }

    static class En implements Greeter {}

    public static void main(String[] args) {
        System.out.println(new En().hi("Bo"));
    }
}`,
      ),
      output: 'Hi Bo\n',
    },
  },

  12: {
    basic: {
      description: 'Private fields + getters: hide internal state (encapsulation).',
      code: B(
        'arch.day12',
        `public class Day12Basic {
    static class Account {
        private int balance;
        Account(int b) { balance = b; }
        int getBalance() { return balance; }
    }

    public static void main(String[] args) {
        System.out.println(new Account(100).getBalance());
    }
}`,
      ),
      output: '100\n',
    },
    intermediate: {
      description: 'Defensive copy: return a copy of internal array so callers cannot mutate your state.',
      code: B(
        'arch.day12',
        `import java.util.Arrays;

public class Day12Intermediate {
    static class Snapshot {
        private final int[] data;
        Snapshot(int[] data) { this.data = Arrays.copyOf(data, data.length); }
        int[] getData() { return Arrays.copyOf(data, data.length); }
    }

    public static void main(String[] args) {
        Snapshot s = new Snapshot(new int[] {1, 2, 3});
        System.out.println(Arrays.toString(s.getData()));
    }
}`,
      ),
      output: '[1, 2, 3]\n',
    },
    advanced: {
      description: 'Immutable object: all fields final, no setters — thread-safe sharing pattern.',
      code: B(
        'arch.day12',
        `public class Day12Advanced {
    static final class Money {
        private final long cents;
        Money(long cents) { this.cents = cents; }
        Money add(Money o) { return new Money(this.cents + o.cents); }
        @Override public String toString() { return "¢" + cents; }
    }

    public static void main(String[] args) {
        Money m = new Money(100).add(new Money(50));
        System.out.println(m);
    }
}`,
      ),
      output: '¢150\n',
    },
  },

  13: {
    basic: {
      description: 'Static nested class: tied to outer type but no implicit reference to outer instance.',
      code: B(
        'arch.day13',
        `public class Day13Basic {
    static class Outer {
        static class Inner {
            static String msg() { return "nested"; }
        }
    }

    public static void main(String[] args) {
        System.out.println(Outer.Inner.msg());
    }
}`,
      ),
      output: 'nested\n',
    },
    intermediate: {
      description: 'Inner class: holds reference to outer; can call outer instance methods.',
      code: B(
        'arch.day13',
        `public class Day13Intermediate {
    class Outer {
        String label() { return "O"; }
        class Inner {
            String both() { return label() + "-I"; }
        }
    }

    public static void main(String[] args) {
        Day13Intermediate top = new Day13Intermediate();
        Outer o = top.new Outer();
        System.out.println(o.new Inner().both());
    }
}`,
      ),
      output: 'O-I\n',
    },
    advanced: {
      description: 'Local class inside method: captures effectively final variables from enclosing scope.',
      code: B(
        'arch.day13',
        `public class Day13Advanced {
    public static void main(String[] args) {
        final String prefix = "id:";
        class Local {
            String build(String s) { return prefix + s; }
        }
        System.out.println(new Local().build("7"));
    }
}`,
      ),
      output: 'id:7\n',
    },
  },

  14: {
    basic: {
      description: 'ArrayList: dynamic-size List backed by array; add/get/size.',
      code: B(
        'arch.day14',
        `import java.util.*;

public class Day14Basic {
    public static void main(String[] args) {
        List<String> xs = new ArrayList<>();
        xs.add("a");
        xs.add("b");
        System.out.println(xs.size() + " " + xs.get(1));
    }
}`,
      ),
      output: '2 b\n',
    },
    intermediate: {
      description: 'HashMap: O(1) average lookups by key — count word frequencies.',
      code: B(
        'arch.day14',
        `import java.util.*;

public class Day14Intermediate {
    public static void main(String[] args) {
        Map<String, Integer> m = new HashMap<>();
        for (String w : List.of("a", "b", "a")) {
            m.merge(w, 1, Integer::sum);
        }
        System.out.println(m);
    }
}`,
      ),
      output: '{a=2, b=1}\n',
    },
    advanced: {
      description: 'TreeMap: sorted keys; LinkedHashMap: insertion order — choose map by iteration needs.',
      code: B(
        'arch.day14',
        `import java.util.*;

public class Day14Advanced {
    public static void main(String[] args) {
        Map<Integer, String> tree = new TreeMap<>();
        tree.put(2, "b");
        tree.put(1, "a");
        System.out.println("tree keys: " + tree.keySet());
        Map<Integer, String> linked = new LinkedHashMap<>();
        linked.put(2, "b");
        linked.put(1, "a");
        System.out.println("linked: " + linked);
    }
}`,
      ),
      output: 'tree keys: [1, 2]\nlinked: {2=b, 1=a}\n',
    },
  },

  15: {
    basic: {
      description: 'Iterator: explicit hasNext/next loop — same traversal as for-each under the hood.',
      code: B(
        'arch.day15',
        `import java.util.*;

public class Day15Basic {
    public static void main(String[] args) {
        List<String> xs = List.of("x", "y");
        Iterator<String> it = xs.iterator();
        while (it.hasNext()) {
            System.out.println(it.next());
        }
    }
}`,
      ),
      output: 'x\ny\n',
    },
    intermediate: {
      description: 'Remove via Iterator (safe) vs ConcurrentModificationException on simple for-each remove.',
      code: B(
        'arch.day15',
        `import java.util.*;

public class Day15Intermediate {
    public static void main(String[] args) {
        List<Integer> xs = new ArrayList<>(List.of(1, 2, 3, 4));
        Iterator<Integer> it = xs.iterator();
        while (it.hasNext()) {
            int v = it.next();
            if (v % 2 == 0) it.remove();
        }
        System.out.println(xs);
    }
}`,
      ),
      output: '[1, 3]\n',
    },
    advanced: {
      description: 'ListIterator: bidirectional traversal + set/add at cursor.',
      code: B(
        'arch.day15',
        `import java.util.*;

public class Day15Advanced {
    public static void main(String[] args) {
        List<String> xs = new ArrayList<>(List.of("a", "b", "c"));
        ListIterator<String> it = xs.listIterator(xs.size());
        while (it.hasPrevious()) {
            System.out.print(it.previous() + " ");
        }
        System.out.println();
    }
}`,
      ),
      output: 'c b a \n',
    },
  },

  16: {
    basic: {
      description: 'Comparable: natural ordering via compareTo for sorting.',
      code: B(
        'arch.day16',
        `import java.util.*;

public class Day16Basic implements Comparable<Day16Basic> {
    final int score;
    Day16Basic(int score) { this.score = score; }

    @Override public int compareTo(Day16Basic o) {
        return Integer.compare(this.score, o.score);
    }

    public static void main(String[] args) {
        List<Day16Basic> xs = new ArrayList<>(List.of(new Day16Basic(5), new Day16Basic(1)));
        Collections.sort(xs);
        System.out.println(xs.get(0).score + "," + xs.get(1).score);
    }
}`,
      ),
      output: '1,5\n',
    },
    intermediate: {
      description: 'Comparator: external ordering (e.g. by name) without changing the class.',
      code: B(
        'arch.day16',
        `import java.util.*;

public class Day16Intermediate {
    record Person(String name, int age) {}

    public static void main(String[] args) {
        List<Person> ps = new ArrayList<>(List.of(new Person("Bo", 30), new Person("Ana", 25)));
        ps.sort(Comparator.comparing(Person::name));
        System.out.println(ps.get(0).name());
    }
}`,
      ),
      output: 'Ana\n',
    },
    advanced: {
      description: 'thenComparing: multi-field sort keys for stable interview-ready ordering.',
      code: B(
        'arch.day16',
        `import java.util.*;

public class Day16Advanced {
    record Row(String k, int v) {}

    public static void main(String[] args) {
        List<Row> rows = new ArrayList<>(List.of(
            new Row("b", 2), new Row("a", 9), new Row("a", 1)));
        rows.sort(Comparator.comparing(Row::k).thenComparingInt(Row::v));
        System.out.println(rows);
    }
}`,
      ),
      output: '[Row[k=a, v=1], Row[k=a, v=9], Row[k=b, v=2]]\n',
    },
  },

  17: {
    basic: {
      description: 'Read all lines from a file with Files.readString (Java 11+) — simple text ingestion.',
      code: B(
        'arch.day17',
        `import java.nio.file.*;

public class Day17Basic {
    public static void main(String[] args) throws Exception {
        Path p = Files.createTempFile("demo", ".txt");
        Files.writeString(p, "hello\\nworld");
        String s = Files.readString(p);
        System.out.println(s.replace("\\n", "|"));
        Files.deleteIfExists(p);
    }
}`,
      ),
      output: 'hello|world\n',
    },
    intermediate: {
      description: 'Walk a directory tree with Files.walk — filter and count .java files.',
      code: B(
        'arch.day17',
        `import java.nio.file.*;
import java.util.stream.*;

public class Day17Intermediate {
    public static void main(String[] args) throws Exception {
        Path root = Files.createTempDirectory("walk");
        Files.writeString(root.resolve("a.java"), "//");
        long n = Files.walk(root).filter(x -> x.toString().endsWith(".java")).count();
        System.out.println("java files: " + n);
        Files.walk(root).sorted(Comparator.reverseOrder()).forEach(p -> { try { Files.deleteIfExists(p); } catch (Exception e) {} });
    }
}`,
      ),
      output: 'java files: 1\n',
    },
    advanced: {
      description: 'Path API: resolve sibling paths safely without string concatenation.',
      code: B(
        'arch.day17',
        `import java.nio.file.*;

public class Day17Advanced {
    public static void main(String[] args) {
        Path base = Path.of("/app/config");
        Path log = base.resolveSibling("logs").resolve("app.log");
        System.out.println(log);
    }
}`,
      ),
      output: '\\app\\logs\\app.log\n',
    },
  },

  18: {
    basic: {
      description: 'enum: fixed set of constants with type safety vs magic strings.',
      code: B(
        'arch.day18',
        `public class Day18Basic {
    enum Status { ON, OFF }

    public static void main(String[] args) {
        Status s = Status.ON;
        System.out.println(s.name() + " ordinal=" + s.ordinal());
    }
}`,
      ),
      output: 'ON ordinal=0\n',
    },
    intermediate: {
      description: 'enum with fields/methods: attach metadata (HTTP status code) to each constant.',
      code: B(
        'arch.day18',
        `public class Day18Intermediate {
    enum Http {
        OK(200), NOT_FOUND(404);
        final int code;
        Http(int code) { this.code = code; }
        int code() { return code; }
    }

    public static void main(String[] args) {
        System.out.println(Http.NOT_FOUND.code());
    }
}`,
      ),
      output: '404\n',
    },
    advanced: {
      description: 'record: immutable data carrier; equals/hashCode/toString for free.',
      code: B(
        'arch.day18',
        `public class Day18Advanced {
    record Point(int x, int y) {
        int manhattan(Point o) { return Math.abs(x - o.x) + Math.abs(y - o.y); }
    }

    public static void main(String[] args) {
        System.out.println(new Point(1, 2).manhattan(new Point(4, 6)));
    }
}`,
      ),
      output: '7\n',
    },
  },

  19: {
    basic: {
      description: 'Count loop iterations: O(n) linear scan vs O(1) constant work.',
      code: B(
        'arch.day19',
        `public class Day19Basic {
    static int sumArray(int[] a) {
        int s = 0;
        for (int x : a) s += x;
        return s;
    }

    public static void main(String[] args) {
        System.out.println(sumArray(new int[] {1,2,3,4}));
    }
}`,
      ),
      output: '10\n',
    },
    intermediate: {
      description: 'Nested loops: O(n²) pairwise comparison — classic complexity pattern.',
      code: B(
        'arch.day19',
        `public class Day19Intermediate {
    static boolean hasDuplicate(int[] a) {
        for (int i = 0; i < a.length; i++) {
            for (int j = i + 1; j < a.length; j++) {
                if (a[i] == a[j]) return true;
            }
        }
        return false;
    }

    public static void main(String[] args) {
        System.out.println(hasDuplicate(new int[] {1, 2, 1}));
    }
}`,
      ),
      output: 'true\n',
    },
    advanced: {
      description: 'Binary search on sorted array: O(log n) lookups vs O(n) linear.',
      code: B(
        'arch.day19',
        `import java.util.*;

public class Day19Advanced {
    public static void main(String[] args) {
        int[] a = {1, 3, 5, 7, 9};
        int i = Arrays.binarySearch(a, 7);
        System.out.println("index=" + i);
    }
}`,
      ),
      output: 'index=3\n',
    },
  },

  20: {
    basic: {
      description: 'Two pointers from both ends: palindrome check on char array.',
      code: B(
        'arch.day20',
        `public class Day20Basic {
    static boolean palindrome(char[] s) {
        int l = 0, r = s.length - 1;
        while (l < r) {
            if (s[l++] != s[r--]) return false;
        }
        return true;
    }

    public static void main(String[] args) {
        System.out.println(palindrome("racecar".toCharArray()));
    }
}`,
      ),
      output: 'true\n',
    },
    intermediate: {
      description: 'Sorted array + two pointers: find pair summing to target in O(n).',
      code: B(
        'arch.day20',
        `public class Day20Intermediate {
    static boolean pairSum(int[] a, int target) {
        int l = 0, r = a.length - 1;
        while (l < r) {
            int s = a[l] + a[r];
            if (s == target) return true;
            if (s < target) l++;
            else r--;
        }
        return false;
    }

    public static void main(String[] args) {
        int[] a = {1, 2, 4, 6, 10};
        System.out.println(pairSum(a, 8));
    }
}`,
      ),
      output: 'true\n',
    },
    advanced: {
      description: 'Container with most water style: move the pointer at the shorter line.',
      code: B(
        'arch.day20',
        `public class Day20Advanced {
    static int maxArea(int[] h) {
        int l = 0, r = h.length - 1, best = 0;
        while (l < r) {
            best = Math.max(best, Math.min(h[l], h[r]) * (r - l));
            if (h[l] < h[r]) l++;
            else r--;
        }
        return best;
    }

    public static void main(String[] args) {
        System.out.println(maxArea(new int[] {1,8,6,2,5,4,8,3,7}));
    }
}`,
      ),
      output: '49\n',
    },
  },

  21: {
    basic: {
      description: 'Singly linked list: Node with next; traverse with a while loop.',
      code: B(
        'arch.day21',
        `public class Day21Basic {
    static class Node {
        int v;
        Node next;
        Node(int v, Node next) { this.v = v; this.next = next; }
    }

    public static void main(String[] args) {
        Node head = new Node(1, new Node(2, new Node(3, null)));
        Node c = head;
        while (c != null) {
            System.out.print(c.v + " ");
            c = c.next;
        }
        System.out.println();
    }
}`,
      ),
      output: '1 2 3 \n',
    },
    intermediate: {
      description: 'Reverse linked list iteratively: three-pointer rewiring.',
      code: B(
        'arch.day21',
        `public class Day21Intermediate {
    static class Node {
        int v;
        Node next;
        Node(int v) { this.v = v; }
    }

    static Node reverse(Node head) {
        Node prev = null, cur = head;
        while (cur != null) {
            Node n = cur.next;
            cur.next = prev;
            prev = cur;
            cur = n;
        }
        return prev;
    }

    public static void main(String[] args) {
        Node a = new Node(1), b = new Node(2), c = new Node(3);
        a.next = b; b.next = c;
        Node h = reverse(a);
        System.out.println(h.v + "->" + h.next.v + "->" + h.next.next.v);
    }
}`,
      ),
      output: '3->2->1\n',
    },
    advanced: {
      description: 'Floyd cycle detection: slow/fast pointers to detect a loop.',
      code: B(
        'arch.day21',
        `public class Day21Advanced {
    static class Node {
        int v;
        Node next;
        Node(int v) { this.v = v; }
    }

    static boolean hasCycle(Node head) {
        Node s = head, f = head;
        while (f != null && f.next != null) {
            s = s.next;
            f = f.next.next;
            if (s == f) return true;
        }
        return false;
    }

    public static void main(String[] args) {
        Node a = new Node(1), b = new Node(2);
        a.next = b; b.next = a;
        System.out.println(hasCycle(a));
    }
}`,
      ),
      output: 'true\n',
    },
  },

  22: {
    basic: {
      description: 'Stack (Deque): LIFO push/pop for bracket matching.',
      code: B(
        'arch.day22',
        `import java.util.*;

public class Day22Basic {
    public static void main(String[] args) {
        Deque<String> st = new ArrayDeque<>();
        st.push("a");
        st.push("b");
        System.out.println(st.pop() + st.pop());
    }
}`,
      ),
      output: 'ba\n',
    },
    intermediate: {
      description: 'Queue: FIFO with ArrayDeque — task scheduling order.',
      code: B(
        'arch.day22',
        `import java.util.*;

public class Day22Intermediate {
    public static void main(String[] args) {
        Queue<Integer> q = new ArrayDeque<>();
        q.add(1); q.add(2); q.add(3);
        System.out.println(q.poll());
        System.out.println(q.peek());
    }
}`,
      ),
      output: '1\n2\n',
    },
    advanced: {
      description: 'Monotonic deque: sliding window maximum pattern (sketch).',
      code: B(
        'arch.day22',
        `import java.util.*;

public class Day22Advanced {
    public static void main(String[] args) {
        int[] a = {1, 3, -1, -3, 5, 3};
        int k = 3;
        Deque<Integer> dq = new ArrayDeque<>();
        for (int i = 0; i < a.length; i++) {
            while (!dq.isEmpty() && a[dq.peekLast()] <= a[i]) dq.pollLast();
            dq.addLast(i);
            while (dq.peekFirst() <= i - k) dq.pollFirst();
            if (i >= k - 1) System.out.print(a[dq.peekFirst()] + " ");
        }
        System.out.println();
    }
}`,
      ),
      output: '3 3 5 5 3 \n',
    },
  },

  23: {
    basic: {
      description: 'Hash function idea: reduce key to bucket index with Math.abs(hash % n).',
      code: B(
        'arch.day23',
        `public class Day23Basic {
    public static void main(String[] args) {
        String k = "user:42";
        int buckets = 16;
        int idx = Math.floorMod(k.hashCode(), buckets);
        System.out.println("bucket=" + idx);
    }
}`,
      ),
      output: 'bucket=...\n',
    },
    intermediate: {
      description: 'HashMap load: rehash when buckets get crowded — understand get/put O(1) average.',
      code: B(
        'arch.day23',
        `import java.util.*;

public class Day23Intermediate {
    public static void main(String[] args) {
        Map<String, Integer> m = new HashMap<>(4, 0.75f);
        for (int i = 0; i < 20; i++) {
            m.put("k" + i, i);
        }
        System.out.println("size=" + m.size());
    }
}`,
      ),
      output: 'size=20\n',
    },
    advanced: {
      description: 'LinkedHashMap access-order mode: LRU-style cache sketch.',
      code: B(
        'arch.day23',
        `import java.util.*;

public class Day23Advanced {
    public static void main(String[] args) {
        Map<String, String> lru = new LinkedHashMap<>(16, 0.75f, true) {
            @Override protected boolean removeEldestEntry(Map.Entry<String, String> e) {
                return size() > 2;
            }
        };
        lru.put("a", "1");
        lru.put("b", "2");
        lru.put("c", "3");
        lru.get("a");
        System.out.println(lru.keySet());
    }
}`,
      ),
      output: '[b, c, a]\n',
    },
  },

  24: {
    basic: {
      description: 'Binary tree: Node with left/right; preorder traversal.',
      code: B(
        'arch.day24',
        `public class Day24Basic {
    static class Node {
        int v;
        Node left, right;
        Node(int v) { this.v = v; }
    }

    static void pre(Node n) {
        if (n == null) return;
        System.out.print(n.v + " ");
        pre(n.left);
        pre(n.right);
    }

    public static void main(String[] args) {
        Node root = new Node(2);
        root.left = new Node(1);
        root.right = new Node(3);
        pre(root);
        System.out.println();
    }
}`,
      ),
      output: '2 1 3 \n',
    },
    intermediate: {
      description: 'BST insert: walk left/right by key to find null child.',
      code: B(
        'arch.day24',
        `public class Day24Intermediate {
    static class Node {
        int k;
        Node left, right;
        Node(int k) { this.k = k; }
    }

    static Node insert(Node n, int k) {
        if (n == null) return new Node(k);
        if (k < n.k) n.left = insert(n.left, k);
        else if (k > n.k) n.right = insert(n.right, k);
        return n;
    }

    public static void main(String[] args) {
        Node r = null;
        for (int x : new int[] {5, 3, 7, 1}) r = insert(r, x);
        System.out.println(r.left.k);
    }
}`,
      ),
      output: '3\n',
    },
    advanced: {
      description: 'Lowest common ancestor in BST using key comparisons.',
      code: B(
        'arch.day24',
        `public class Day24Advanced {
    static class Node {
        int k;
        Node left, right;
        Node(int k) { this.k = k; }
    }

    static Node lca(Node r, int p, int q) {
        while (r != null) {
            if (p < r.k && q < r.k) r = r.left;
            else if (p > r.k && q > r.k) r = r.right;
            else return r;
        }
        return null;
    }

    public static void main(String[] args) {
        Node r = new Node(5);
        r.left = new Node(3); r.right = new Node(8);
        r.left.left = new Node(1); r.left.right = new Node(4);
        System.out.println(lca(r, 1, 4).k);
    }
}`,
      ),
      output: '3\n',
    },
  },

  25: {
    basic: {
      description: 'PriorityQueue (min-heap): poll() returns smallest element.',
      code: B(
        'arch.day25',
        `import java.util.*;

public class Day25Basic {
    public static void main(String[] args) {
        Queue<Integer> pq = new PriorityQueue<>();
        pq.add(5); pq.add(1); pq.add(3);
        System.out.println(pq.poll() + " " + pq.poll());
    }
}`,
      ),
      output: '1 3\n',
    },
    intermediate: {
      description: 'Max-heap via reversed comparator: k largest elements.',
      code: B(
        'arch.day25',
        `import java.util.*;

public class Day25Intermediate {
    public static void main(String[] args) {
        Queue<Integer> pq = new PriorityQueue<>(Comparator.reverseOrder());
        for (int x : new int[] {3, 9, 2, 8}) pq.add(x);
        System.out.println(pq.peek());
    }
}`,
      ),
      output: '9\n',
    },
    advanced: {
      description: 'Merge k sorted lists using a heap of heads (pattern).',
      code: B(
        'arch.day25',
        `import java.util.*;

public class Day25Advanced {
    static class Node {
        int v;
        Node next;
        Node(int v) { this.v = v; }
    }

    public static void main(String[] args) {
        Node a = new Node(1); a.next = new Node(4);
        Node b = new Node(2); b.next = new Node(5);
        Queue<Node> pq = new PriorityQueue<>(Comparator.comparingInt(n -> n.v));
        pq.add(a); pq.add(b);
        StringBuilder sb = new StringBuilder();
        while (!pq.isEmpty()) {
            Node n = pq.poll();
            sb.append(n.v).append(' ');
            if (n.next != null) pq.add(n.next);
        }
        System.out.println(sb.toString().trim());
    }
}`,
      ),
      output: '1 2 4 5\n',
    },
  },

  26: {
    basic: {
      description: 'Arrays.sort: O(n log n) default sort for primitives.',
      code: B(
        'arch.day26',
        `import java.util.*;

public class Day26Basic {
    public static void main(String[] args) {
        int[] a = {3, 1, 2};
        Arrays.sort(a);
        System.out.println(Arrays.toString(a));
    }
}`,
      ),
      output: '[1, 2, 3]\n',
    },
    intermediate: {
      description: 'Binary search on sorted array: find insertion point when missing.',
      code: B(
        'arch.day26',
        `import java.util.*;

public class Day26Intermediate {
    public static void main(String[] args) {
        int[] a = {1, 3, 5, 7};
        int i = Arrays.binarySearch(a, 4);
        System.out.println(i);
    }
}`,
      ),
      output: '-3\n',
    },
    advanced: {
      description: 'Custom Comparator for objects; stable sort with TimSort for objects.',
      code: B(
        'arch.day26',
        `import java.util.*;

public class Day26Advanced {
    record Item(String k, int p) {}

    public static void main(String[] args) {
        List<Item> xs = new ArrayList<>(List.of(
            new Item("b", 2), new Item("a", 9), new Item("a", 1)));
        xs.sort(Comparator.comparing(Item::k).thenComparingInt(Item::p));
        System.out.println(xs.get(0));
    }
}`,
      ),
      output: 'Item[k=a, p=1]\n',
    },
  },

  27: {
    basic: {
      description: 'Fibonacci DP: memo table avoids exponential recomputation.',
      code: B(
        'arch.day27',
        `import java.util.*;

public class Day27Basic {
    static long fib(int n, long[] memo) {
        if (n <= 1) return n;
        if (memo[n] != 0) return memo[n];
        return memo[n] = fib(n - 1, memo) + fib(n - 2, memo);
    }

    public static void main(String[] args) {
        int n = 10;
        System.out.println(fib(n, new long[n + 1]));
    }
}`,
      ),
      output: '55\n',
    },
    intermediate: {
      description: 'Classic 0/1 knapsack: 2D DP table for value vs weight.',
      code: B(
        'arch.day27',
        `public class Day27Intermediate {
    public static void main(String[] args) {
        int[] w = {1, 2, 3}, v = {6, 10, 12};
        int cap = 5;
        int n = w.length;
        int[][] dp = new int[n + 1][cap + 1];
        for (int i = 1; i <= n; i++) {
            for (int c = 0; c <= cap; c++) {
                int best = dp[i - 1][c];
                if (c >= w[i - 1]) {
                    best = Math.max(best, dp[i - 1][c - w[i - 1]] + v[i - 1]);
                }
                dp[i][c] = best;
            }
        }
        System.out.println(dp[n][cap]);
    }
}`,
      ),
      output: '22\n',
    },
    advanced: {
      description: 'LIS with patience sorting / binary search — O(n log n) length.',
      code: B(
        'arch.day27',
        `import java.util.*;

public class Day27Advanced {
    static int lis(int[] a) {
        int[] t = new int[a.length];
        int len = 0;
        for (int x : a) {
            int i = Arrays.binarySearch(t, 0, len, x);
            if (i < 0) i = -(i + 1);
            t[i] = x;
            if (i == len) len++;
        }
        return len;
    }

    public static void main(String[] args) {
        System.out.println(lis(new int[] {10, 9, 2, 5, 3, 7, 101, 18}));
    }
}`,
      ),
      output: '4\n',
    },
  },

  28: {
    basic: {
      description: 'Generic class: type parameter T enforced at compile time for the field.',
      code: B(
        'arch.day28',
        `public class Day28Basic<T> {
    private final T value;
    Day28Basic(T value) { this.value = value; }
    T get() { return value; }

    public static void main(String[] args) {
        Day28Basic<String> s = new Day28Basic<>("hi");
        System.out.println(s.get().length());
    }
}`,
      ),
      output: '2\n',
    },
    intermediate: {
      description: 'Generic method + bounded type: sum only numbers extending Number.',
      code: B(
        'arch.day28',
        `import java.util.*;

public class Day28Intermediate {
    static <T extends Number> double sum(List<T> xs) {
        double t = 0;
        for (T x : xs) t += x.doubleValue();
        return t;
    }

    public static void main(String[] args) {
        System.out.println(sum(List.of(1, 2, 3)));
    }
}`,
      ),
      output: '6.0\n',
    },
    advanced: {
      description: 'Wildcard capture: read List<? extends Number> safely as numbers.',
      code: B(
        'arch.day28',
        `import java.util.*;

public class Day28Advanced {
    static double max(List<? extends Number> xs) {
        double m = Double.NEGATIVE_INFINITY;
        for (Number n : xs) m = Math.max(m, n.doubleValue());
        return m;
    }

    public static void main(String[] args) {
        System.out.println(max(List.of(1, 2.5, 3)));
    }
}`,
      ),
      output: '3.0\n',
    },
  },

  29: {
    basic: {
      description: 'Functional interface + lambda: implement Comparator without anonymous class boilerplate.',
      code: B(
        'arch.day29',
        `import java.util.*;

public class Day29Basic {
    public static void main(String[] args) {
        List<String> xs = new ArrayList<>(List.of("bb", "a", "ccc"));
        xs.sort((a, b) -> Integer.compare(a.length(), b.length()));
        System.out.println(xs);
    }
}`,
      ),
      output: '[a, bb, ccc]\n',
    },
    intermediate: {
      description: 'Method references: String::compareToIgnoreCase as Comparator.',
      code: B(
        'arch.day29',
        `import java.util.*;

public class Day29Intermediate {
    public static void main(String[] args) {
        List<String> xs = new ArrayList<>(List.of("B", "a", "C"));
        xs.sort(String::compareToIgnoreCase);
        System.out.println(xs);
    }
}`,
      ),
      output: '[a, B, C]\n',
    },
    advanced: {
      description: 'Custom @FunctionalInterface for event handler style callbacks.',
      code: B(
        'arch.day29',
        `public class Day29Advanced {
    @FunctionalInterface
    interface Handler {
        void onEvent(String msg);
    }

    static void emit(Handler h) {
        h.onEvent("ping");
    }

    public static void main(String[] args) {
        emit(m -> System.out.println("got " + m));
    }
}`,
      ),
      output: 'got ping\n',
    },
  },

  30: {
    basic: {
      description: 'Stream pipeline: filter + map + collect — declarative collection processing.',
      code: B(
        'arch.day30',
        `import java.util.*;
import java.util.stream.*;

public class Day30Basic {
    public static void main(String[] args) {
        List<Integer> xs = List.of(1, 2, 3, 4, 5);
        int s = xs.stream().filter(x -> x % 2 == 0).mapToInt(x -> x).sum();
        System.out.println(s);
    }
}`,
      ),
      output: '6\n',
    },
    intermediate: {
      description: 'groupingBy: partition employees by department string.',
      code: B(
        'arch.day30',
        `import java.util.*;
import java.util.stream.*;

public class Day30Intermediate {
    record Emp(String dept, String name) {}

    public static void main(String[] args) {
        List<Emp> es = List.of(new Emp("eng", "a"), new Emp("eng", "b"), new Emp("hr", "c"));
        Map<String, List<Emp>> g = es.stream().collect(Collectors.groupingBy(Emp::dept));
        System.out.println(g.get("eng").size());
    }
}`,
      ),
      output: '2\n',
    },
    advanced: {
      description: 'flatMap: one-to-many transform — lines to words.',
      code: B(
        'arch.day30',
        `import java.util.*;
import java.util.stream.*;

public class Day30Advanced {
    public static void main(String[] args) {
        List<String> lines = List.of("a b", "c");
        List<String> words = lines.stream()
            .flatMap(line -> Arrays.stream(line.split("\\\\s+")))
            .toList();
        System.out.println(words);
    }
}`,
      ),
      output: '[a, b, c]\n',
    },
  },

  31: {
    basic: {
      description: 'Optional: explicit empty vs present instead of null for “maybe” results.',
      code: B(
        'arch.day31',
        `import java.util.*;

public class Day31Basic {
    static Optional<String> find(int id) {
        return id == 1 ? Optional.of("one") : Optional.empty();
    }

    public static void main(String[] args) {
        System.out.println(find(1).orElse("none"));
        System.out.println(find(2).orElse("none"));
    }
}`,
      ),
      output: 'one\nnone\n',
    },
    intermediate: {
      description: 'map/flatMap chaining: transform inner value without nested null checks.',
      code: B(
        'arch.day31',
        `import java.util.*;

public class Day31Intermediate {
    static Optional<Integer> parse(String s) {
        try {
            return Optional.of(Integer.parseInt(s));
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public static void main(String[] args) {
        System.out.println(parse("42").map(x -> x * 2).orElse(0));
    }
}`,
      ),
      output: '84\n',
    },
    advanced: {
      description: 'orElseGet vs orElse: lazy supplier avoids expensive default work.',
      code: B(
        'arch.day31',
        `import java.util.*;

public class Day31Advanced {
    public static void main(String[] args) {
        Optional<String> o = Optional.empty();
        String v = o.orElseGet(() -> {
            System.out.println("compute");
            return "x";
        });
        System.out.println(v);
    }
}`,
      ),
      output: 'compute\nx\n',
    },
  },

  32: {
    basic: {
      description: 'Java 16+ record: compact constructor + accessors.',
      code: B(
        'arch.day32',
        `public class Day32Basic {
    record User(String id, String email) {
        User {
            if (id == null || id.isBlank()) throw new IllegalArgumentException("id");
        }
    }

    public static void main(String[] args) {
        System.out.println(new User("u1", "a@b.com").email());
    }
}`,
      ),
      output: 'a@b.com\n',
    },
    intermediate: {
      description: 'Sealed hierarchy: compiler knows permitted subtypes for exhaustive switch.',
      code: B(
        'arch.day32',
        `public class Day32Intermediate {
    sealed interface Pay permits Card, Cash {}
    record Card(String last4) implements Pay {}
    record Cash() implements Pay {}

    static String label(Pay p) {
        return switch (p) {
            case Card c -> "card ****" + c.last4();
            case Cash x -> "cash";
        };
    }

    public static void main(String[] args) {
        System.out.println(label(new Card("4242")));
    }
}`,
      ),
      output: 'card ****4242\n',
    },
    advanced: {
      description: 'Pattern matching instanceof: bind typed variable in one step.',
      code: B(
        'arch.day32',
        `public class Day32Advanced {
    sealed interface Expr permits Num, Add {}
    record Num(int v) implements Expr {}
    record Add(Expr a, Expr b) implements Expr {}

    static int eval(Expr e) {
        if (e instanceof Num n) return n.v();
        if (e instanceof Add a) return eval(a.a()) + eval(a.b());
        throw new IllegalStateException();
    }

    public static void main(String[] args) {
        Expr e = new Add(new Num(2), new Num(3));
        System.out.println(eval(e));
    }
}`,
      ),
      output: '5\n',
    },
  },

  33: {
    basic: {
      description: 'Switch expression with arrows: yield value without fall-through bugs.',
      code: B(
        'arch.day33',
        `public class Day33Basic {
    enum Color { RED, GREEN, BLUE }

    public static void main(String[] args) {
        Color c = Color.GREEN;
        int rgb = switch (c) {
            case RED -> 0xFF0000;
            case GREEN -> 0x00FF00;
            case BLUE -> 0x0000FF;
        };
        System.out.println(Integer.toHexString(rgb));
    }
}`,
      ),
      output: 'ff00\n',
    },
    intermediate: {
      description: 'Pattern switch on sealed interface — compiler checks exhaustiveness.',
      code: B(
        'arch.day33',
        `public class Day33Intermediate {
    sealed interface Node permits Leaf, Branch {}
    record Leaf(int v) implements Node {}
    record Branch(Node l, Node r) implements Node {}

    static int sum(Node n) {
        return switch (n) {
            case Leaf l -> l.v();
            case Branch b -> sum(b.l()) + sum(b.r());
        };
    }

    public static void main(String[] args) {
        Node t = new Branch(new Leaf(1), new Leaf(2));
        System.out.println(sum(t));
    }
}`,
      ),
      output: '3\n',
    },
    advanced: {
      description: 'Guarded patterns: switch with boolean predicates on record patterns.',
      code: B(
        'arch.day33',
        `public class Day33Advanced {
    record Point(int x, int y) {}

    static String quadrant(Point p) {
        return switch (p) {
            case Point(var x, var y) when x >= 0 && y >= 0 -> "Q1";
            case Point(var x, var y) when x < 0 && y >= 0 -> "Q2";
            case Point(var x, var y) when x < 0 -> "Q3/Q4";
            default -> "axis";
        };
    }

    public static void main(String[] args) {
        System.out.println(quadrant(new Point(3, 4)));
    }
}`,
      ),
      output: 'Q1\n',
    },
  },

  34: {
    basic: {
      description: 'Thread + Runnable: start background work; join to wait for finish.',
      code: B(
        'arch.day34',
        `public class Day34Basic {
    public static void main(String[] args) throws Exception {
        Thread t = new Thread(() -> System.out.println("async"));
        t.start();
        t.join();
        System.out.println("done");
    }
}`,
      ),
      output: 'async\ndone\n',
    },
    intermediate: {
      description: 'synchronized block: mutual exclusion on shared counter.',
      code: B(
        'arch.day34',
        `public class Day34Intermediate {
    static int count = 0;
    static final Object lock = new Object();

    public static void main(String[] args) throws Exception {
        Thread a = new Thread(() -> {
            for (int i = 0; i < 1000; i++) {
                synchronized (lock) { count++; }
            }
        });
        Thread b = new Thread(() -> {
            for (int i = 0; i < 1000; i++) {
                synchronized (lock) { count++; }
            }
        });
        a.start(); b.start();
        a.join(); b.join();
        System.out.println(count);
    }
}`,
      ),
      output: '2000\n',
    },
    advanced: {
      description: 'ExecutorService: reuse threads; submit Callable and read Future.',
      code: B(
        'arch.day34',
        `import java.util.concurrent.*;

public class Day34Advanced {
    public static void main(String[] args) throws Exception {
        try (ExecutorService ex = Executors.newFixedThreadPool(2)) {
            Future<Integer> f = ex.submit(() -> 21 * 2);
            System.out.println(f.get());
        }
    }
}`,
      ),
      output: '42\n',
    },
  },

  35: {
    basic: {
      description: 'ReentrantLock: explicit lock/unlock vs synchronized.',
      code: B(
        'arch.day35',
        `import java.util.concurrent.locks.*;

public class Day35Basic {
    public static void main(String[] args) {
        ReentrantLock lk = new ReentrantLock();
        lk.lock();
        try {
            System.out.println("critical");
        } finally {
            lk.unlock();
        }
    }
}`,
      ),
      output: 'critical\n',
    },
    intermediate: {
      description: 'ReadWriteLock: many readers or one writer — good for read-heavy caches.',
      code: B(
        'arch.day35',
        `import java.util.concurrent.locks.*;

public class Day35Intermediate {
    public static void main(String[] args) throws Exception {
        ReadWriteLock rwl = new ReentrantReadWriteLock();
        rwl.readLock().lock();
        try {
            System.out.println("read");
        } finally {
            rwl.readLock().unlock();
        }
    }
}`,
      ),
      output: 'read\n',
    },
    advanced: {
      description: 'Semaphore: limit concurrent workers (permit pool).',
      code: B(
        'arch.day35',
        `import java.util.concurrent.*;

public class Day35Advanced {
    public static void main(String[] args) throws Exception {
        Semaphore sem = new Semaphore(2);
        sem.acquire();
        try {
            System.out.println("slot acquired");
        } finally {
            sem.release();
        }
    }
}`,
      ),
      output: 'slot acquired\n',
    },
  },

  36: {
    basic: {
      description: 'CompletableFuture: async supply + thenApply without blocking yet.',
      code: B(
        'arch.day36',
        `import java.util.concurrent.*;

public class Day36Basic {
    public static void main(String[] args) throws Exception {
        CompletableFuture<String> f = CompletableFuture.supplyAsync(() -> "hi")
            .thenApply(String::toUpperCase);
        System.out.println(f.get());
    }
}`,
      ),
      output: 'HI\n',
    },
    intermediate: {
      description: 'Combine futures: run two async tasks and join results.',
      code: B(
        'arch.day36',
        `import java.util.concurrent.*;

public class Day36Intermediate {
    public static void main(String[] args) throws Exception {
        CompletableFuture<Integer> a = CompletableFuture.supplyAsync(() -> 20);
        CompletableFuture<Integer> b = CompletableFuture.supplyAsync(() -> 22);
        CompletableFuture<Integer> sum = a.thenCombine(b, Integer::sum);
        System.out.println(sum.get());
    }
}`,
      ),
      output: '42\n',
    },
    advanced: {
      description: 'Parallel async steps with CompletableFuture.allOf — fan-out then join (Java 17 friendly).',
      code: B(
        'arch.day36',
        `import java.util.concurrent.*;

public class Day36Advanced {
    public static void main(String[] args) throws Exception {
        CompletableFuture<Void> all = CompletableFuture.allOf(
            CompletableFuture.runAsync(() -> System.out.println("task-a")),
            CompletableFuture.runAsync(() -> System.out.println("task-b"))
        );
        all.join();
        System.out.println("done");
    }
}`,
      ),
      output: 'task-a\ntask-b\ndone\n',
    },
  },

  37: {
    basic: {
      description: 'Heap usage: Runtime maxMemory/totalMemory/freeMemory snapshot.',
      code: B(
        'arch.day37',
        `public class Day37Basic {
    public static void main(String[] args) {
        Runtime rt = Runtime.getRuntime();
        System.out.println("max=" + rt.maxMemory());
        System.out.println("total=" + rt.totalMemory());
        System.out.println("free=" + rt.freeMemory());
    }
}`,
      ),
      output: '(platform-dependent numbers)\n',
    },
    intermediate: {
      description: 'Trigger GC suggestion and measure before/after free memory (best-effort).',
      code: B(
        'arch.day37',
        `public class Day37Intermediate {
    public static void main(String[] args) {
        Runtime rt = Runtime.getRuntime();
        long before = rt.freeMemory();
        System.gc();
        long after = rt.freeMemory();
        System.out.println("deltaFree=" + (after - before));
    }
}`,
      ),
      output: '(delta varies)\n',
    },
    advanced: {
      description: 'Allocation rate micro-benchmark sketch: array churn in a loop.',
      code: B(
        'arch.day37',
        `public class Day37Advanced {
    public static void main(String[] args) {
        long t0 = System.nanoTime();
        for (int i = 0; i < 200_000; i++) {
            byte[] b = new byte[1024];
        }
        long ms = (System.nanoTime() - t0) / 1_000_000;
        System.out.println("elapsedMs=" + ms);
    }
}`,
      ),
      output: '(time varies)\n',
    },
  },

  38: {
    basic: {
      description: 'Manual constructor injection (Spring-style idea without framework): depend on interface.',
      code: B(
        'arch.day38',
        `public class Day38Basic {
    interface Clock { long millis(); }
    static final class SysClock implements Clock {
        public long millis() { return System.currentTimeMillis(); }
    }
    static class Greeter {
        private final Clock clock;
        Greeter(Clock c) { this.clock = c; }
        String hi(String name) { return clock.millis() + " hi " + name; }
    }

    public static void main(String[] args) {
        System.out.println(new Greeter(new SysClock()).hi("Bo"));
    }
}`,
      ),
      output: '(timestamp) hi Bo\n',
    },
    intermediate: {
      description: 'Simple service locator map: string key -> bean (mini IoC container).',
      code: B(
        'arch.day38',
        `import java.util.*;

public class Day38Intermediate {
    public static void main(String[] args) {
        Map<String, Object> beans = new HashMap<>();
        beans.put("greeting", "Hello");
        String g = (String) beans.get("greeting");
        System.out.println(g + " Arch");
    }
}`,
      ),
      output: 'Hello Arch\n',
    },
    advanced: {
      description: 'Decorator pattern: wrap a bean to add cross-cutting behavior (AOP-like).',
      code: B(
        'arch.day38',
        `public class Day38Advanced {
    interface Service { String run(); }
    static class Core implements Service {
        public String run() { return "core"; }
    }
    static class Timing implements Service {
        private final Service inner;
        Timing(Service s) { inner = s; }
        public String run() {
            long t0 = System.nanoTime();
            String r = inner.run();
            System.out.println("ns=" + (System.nanoTime() - t0));
            return r;
        }
    }

    public static void main(String[] args) {
        System.out.println(new Timing(new Core()).run());
    }
}`,
      ),
      output: '(small ns=...)\ncore\n',
    },
  },

  39: {
    basic: {
      description: 'Bean with init flag: simulate @PostConstruct ordering in plain Java.',
      code: B(
        'arch.day39',
        `public class Day39Basic {
    static class Bean {
        boolean inited;
        void init() { inited = true; }
        String status() { return inited ? "ready" : "not-ready"; }
    }

    public static void main(String[] args) {
        Bean b = new Bean();
        System.out.println(b.status());
        b.init();
        System.out.println(b.status());
    }
}`,
      ),
      output: 'not-ready\nready\n',
    },
    intermediate: {
      description: 'Prototype scope sketch: factory creates new instance each call.',
      code: B(
        'arch.day39',
        `import java.util.concurrent.atomic.*;

public class Day39Intermediate {
    static class Ticket {
        private static final AtomicInteger SEQ = new AtomicInteger();
        final int id = SEQ.incrementAndGet();
    }

    public static void main(String[] args) {
        System.out.println(new Ticket().id + " " + new Ticket().id);
    }
}`,
      ),
      output: '1 2\n',
    },
    advanced: {
      description: 'Circular dependency detection: track creating beans in a Set.',
      code: B(
        'arch.day39',
        `import java.util.*;

public class Day39Advanced {
    static final Set<String> creating = new HashSet<>();

    static Object getBean(String name) {
        if (!creating.add(name)) throw new IllegalStateException("cycle on " + name);
        try {
            return "bean:" + name;
        } finally {
            creating.remove(name);
        }
    }

    public static void main(String[] args) {
        System.out.println(getBean("a"));
    }
}`,
      ),
      output: 'bean:a\n',
    },
  },

  40: {
    basic: {
      description: 'Proxy pattern: same interface, wrapper adds logging (AOP motivation).',
      code: B(
        'arch.day40',
        `public class Day40Basic {
    interface Repo { String load(String id); }
    static class DbRepo implements Repo {
        public String load(String id) { return "row-" + id; }
    }
    static class LoggingRepo implements Repo {
        private final Repo inner;
        LoggingRepo(Repo r) { inner = r; }
        public String load(String id) {
            System.out.println("load " + id);
            return inner.load(id);
        }
    }

    public static void main(String[] args) {
        System.out.println(new LoggingRepo(new DbRepo()).load("7"));
    }
}`,
      ),
      output: 'load 7\nrow-7\n',
    },
    intermediate: {
      description: 'Chain of responsibility: multiple filters before core handler.',
      code: B(
        'arch.day40',
        `import java.util.*;

public class Day40Intermediate {
    interface Filter { Optional<String> handle(String req); }

    public static void main(String[] args) {
        List<Filter> chain = List.of(
            r -> r.contains("bad") ? Optional.of("blocked") : Optional.empty(),
            r -> Optional.of("ok:" + r));
        String req = "hello";
        for (Filter f : chain) {
            Optional<String> o = f.handle(req);
            if (o.isPresent()) { System.out.println(o.get()); break; }
        }
    }
}`,
      ),
      output: 'ok:hello\n',
    },
    advanced: {
      description: 'Annotation-like marker + reflection: find @Timed methods (simulated with naming).',
      code: B(
        'arch.day40',
        `import java.lang.reflect.*;

public class Day40Advanced {
    static class Svc {
        public void work() {}
    }

    public static void main(String[] args) throws Exception {
        for (Method m : Svc.class.getDeclaredMethods()) {
            System.out.println(m.getName());
        }
    }
}`,
      ),
      output: 'work\n',
    },
  },

  41: {
    basic: {
      description: 'Map path -> handler: tiny routing table like Spring MVC mapping.',
      code: B(
        'arch.day41',
        `import java.util.*;

public class Day41Basic {
    public static void main(String[] args) {
        Map<String, String> routes = Map.of(
            "GET /health", "200 OK",
            "GET /users", "200 []");
        System.out.println(routes.get("GET /health"));
    }
}`,
      ),
      output: '200 OK\n',
    },
    intermediate: {
      description: 'Request DTO + validation guard before controller logic.',
      code: B(
        'arch.day41',
        `public class Day41Intermediate {
    record CreateUser(String email, int age) {
        CreateUser {
            if (email == null || !email.contains("@")) throw new IllegalArgumentException("email");
            if (age < 0) throw new IllegalArgumentException("age");
        }
    }

    public static void main(String[] args) {
        System.out.println(new CreateUser("a@b.com", 30).email());
    }
}`,
      ),
      output: 'a@b.com\n',
    },
    advanced: {
      description: 'Content negotiation sketch: choose JSON vs XML by Accept header.',
      code: B(
        'arch.day41',
        `public class Day41Advanced {
    static String represent(String accept) {
        if (accept != null && accept.contains("xml")) return "<id>1</id>";
        return "{\\"id\\":1}";
    }

    public static void main(String[] args) {
        System.out.println(represent("application/json"));
        System.out.println(represent("application/xml"));
    }
}`,
      ),
      output: '{"id":1}\n<id>1</id>\n',
    },
  },

  42: {
    basic: {
      description: 'Externalized config: map of key/value pairs like application.properties.',
      code: B(
        'arch.day42',
        `import java.util.*;

public class Day42Basic {
    public static void main(String[] args) {
        Map<String, String> cfg = Map.of("server.port", "8080", "spring.profiles.active", "dev");
        System.out.println(cfg.get("server.port"));
    }
}`,
      ),
      output: '8080\n',
    },
    intermediate: {
      description: 'Profile-specific override: dev vs prod property layers.',
      code: B(
        'arch.day42',
        `import java.util.*;

public class Day42Intermediate {
    public static void main(String[] args) {
        Map<String, String> base = new HashMap<>(Map.of("db.url", "jdbc:localhost"));
        Map<String, String> prod = Map.of("db.url", "jdbc:prod");
        base.putAll(prod);
        System.out.println(base.get("db.url"));
    }
}`,
      ),
      output: 'jdbc:prod\n',
    },
    advanced: {
      description: 'Conditional bean: choose DataSource implementation by property flag.',
      code: B(
        'arch.day42',
        `public class Day42Advanced {
    interface DS { String url(); }
    static class Real implements DS { public String url() { return "real"; } }
    static class Mock implements DS { public String url() { return "mock"; } }

    static DS pick(boolean integration) {
        return integration ? new Real() : new Mock();
    }

    public static void main(String[] args) {
        System.out.println(pick(false).url());
    }
}`,
      ),
      output: 'mock\n',
    },
  },

  43: {
    basic: {
      description: 'Health check: aggregate boolean flags into UP/DOWN.',
      code: B(
        'arch.day43',
        `public class Day43Basic {
    public static void main(String[] args) {
        boolean db = true, disk = true;
        String status = (db && disk) ? "UP" : "DOWN";
        System.out.println(status);
    }
}`,
      ),
      output: 'UP\n',
    },
    intermediate: {
      description: 'Metrics counter: increment + expose snapshot string.',
      code: B(
        'arch.day43',
        `import java.util.concurrent.atomic.*;

public class Day43Intermediate {
    public static void main(String[] args) {
        LongAdder hits = new LongAdder();
        hits.increment();
        hits.increment();
        System.out.println("hits=" + hits.sum());
    }
}`,
      ),
      output: 'hits=2\n',
    },
    advanced: {
      description: 'Feature flag + actuator-style endpoint map.',
      code: B(
        'arch.day43',
        `import java.util.*;

public class Day43Advanced {
    public static void main(String[] args) {
        Map<String, Object> endpoints = new LinkedHashMap<>();
        endpoints.put("/actuator/health", Map.of("status", "UP"));
        endpoints.put("/actuator/info", Map.of("app", "demo"));
        System.out.println(endpoints.get("/actuator/health"));
    }
}`,
      ),
      output: '{status=UP}\n',
    },
  },

  44: {
    basic: {
      description: 'Entity with id + version (optimistic locking sketch).',
      code: B(
        'arch.day44',
        `public class Day44Basic {
    static class User {
        final long id;
        int version;
        String name;
        User(long id, String name) { this.id = id; this.name = name; }
    }

    public static void main(String[] args) {
        User u = new User(1L, "ada");
        System.out.println(u.id + " v" + u.version);
    }
}`,
      ),
      output: '1 v0\n',
    },
    intermediate: {
      description: 'Repository interface + in-memory fake (test double pattern).',
      code: B(
        'arch.day44',
        `import java.util.*;

public class Day44Intermediate {
    interface UserRepo { Optional<String> nameById(long id); }
    static class Mem implements UserRepo {
        private final Map<Long, String> m = Map.of(1L, "ada");
        public Optional<String> nameById(long id) { return Optional.ofNullable(m.get(id)); }
    }

    public static void main(String[] args) {
        System.out.println(new Mem().nameById(1L).orElse("?"));
    }
}`,
      ),
      output: 'ada\n',
    },
    advanced: {
      description: 'N+1 problem demo: one query for users then accidental loop query per user.',
      code: B(
        'arch.day44',
        `import java.util.*;

public class Day44Advanced {
    public static void main(String[] args) {
        List<Long> ids = List.of(1L, 2L, 3L);
        int queries = 1;
        for (long id : ids) {
            queries++;
        }
        System.out.println("queries=" + queries);
    }
}`,
      ),
      output: 'queries=4\n',
    },
  },

  45: {
    basic: {
      description: 'Transaction boundary sketch: all-or-nothing list of operations.',
      code: B(
        'arch.day45',
        `import java.util.*;

public class Day45Basic {
    public static void main(String[] args) {
        List<String> ops = new ArrayList<>();
        ops.add("debit");
        ops.add("credit");
        boolean ok = ops.size() == 2;
        System.out.println(ok ? "COMMIT" : "ROLLBACK");
    }
}`,
      ),
      output: 'COMMIT\n',
    },
    intermediate: {
      description: 'Retry with backoff: transient failure handling loop.',
      code: B(
        'arch.day45',
        `public class Day45Intermediate {
    static boolean flaky(int attempt) { return attempt >= 2; }

    public static void main(String[] args) throws Exception {
        int attempt = 0;
        while (true) {
            attempt++;
            if (flaky(attempt)) {
                System.out.println("ok on " + attempt);
                break;
            }
            Thread.sleep(10);
        }
    }
}`,
      ),
      output: 'ok on 2\n',
    },
    advanced: {
      description: 'Pessimistic lock queue: FIFO fair lock sketch with a queue.',
      code: B(
        'arch.day45',
        `import java.util.*;
import java.util.concurrent.*;

public class Day45Advanced {
    public static void main(String[] args) throws Exception {
        Semaphore sem = new Semaphore(1, true);
        sem.acquire();
        try {
            System.out.println("critical");
        } finally {
            sem.release();
        }
    }
}`,
      ),
      output: 'critical\n',
    },
  },
};
