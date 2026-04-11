export const basicCode = String.raw`package arch.day34;

public class Day34Basic {

    static int x = 0;

    static synchronized void inc() {
        x++;
    }

    public static void main(String[] args) throws Exception {
        Thread t = new Thread(() -> inc());
        t.start();
        t.join();
        inc();
        System.out.println(x);
    }
}
`;

export const basicOutput = `2
`;

export const intermediateCode = String.raw`package arch.day34;

import java.util.concurrent.*;

public class Day34Intermediate {

    static volatile boolean ready = false;
    static int data = 0;

    public static void main(String[] args) throws Exception {
        // --- Scenario 1: volatile publish ---
        System.out.println("--- Scenario 1 ---");
        Thread w =
                new Thread(
                        () -> {
                            data = 42;
                            ready = true;
                        });
        w.start();
        w.join();
        System.out.println(ready && data == 42);
        System.out.println();

        // --- Scenario 2: synchronized sum ---
        System.out.println("--- Scenario 2 ---");
        final Object lock = new Object();
        int[] sum = { 0 };
        Runnable r =
                () -> {
                    for (int i = 0; i < 1000; i++) {
                        synchronized (lock) {
                            sum[0]++;
                        }
                    }
                };
        Thread a = new Thread(r);
        Thread b = new Thread(r);
        a.start();
        b.start();
        a.join();
        b.join();
        System.out.println(sum[0]);
        System.out.println();

        // --- Scenario 3: executor ---
        System.out.println("--- Scenario 3 ---");
        ExecutorService ex = Executors.newSingleThreadExecutor();
        Future<Integer> f = ex.submit(() -> 7);
        System.out.println(f.get());
        ex.shutdown();
        System.out.println();

        // --- Scenario 4: deadlock note ---
        System.out.println("--- Scenario 4 ---");
        System.out.println("AB-BA ordering unsafe; use global lock order");
    }
}
`;

export const intermediateOutput = `--- Scenario 1 ---
true

--- Scenario 2 ---
2000

--- Scenario 3 ---
7

--- Scenario 4 ---
AB-BA ordering unsafe; use global lock order
`;

export const advancedCode = String.raw`package arch.day34;

public class Day34Advanced {

    public static void main(String[] args) {
        // === Block 1: hb rules ===
        System.out.println("=== Block 1 ===");
        System.out.println("volatile write hb volatile read");
        System.out.println("unlock hb lock same monitor");
        System.out.println();

        // === Block 2: interrupt ===
        System.out.println("=== Block 2 ===");
        Thread t = new Thread(() -> {});
        t.start();
        t.interrupt();
        System.out.println(t.isInterrupted());
        System.out.println();

        // === Block 3: table ===
        System.out.println("=== Block 3 ===");
        System.out.println("race: unsynchronized rw");
        System.out.println("fix: lock or atomic or immutability");
    }
}
`;

export const advancedOutput = `=== Block 1 ===
volatile write hb volatile read
unlock hb lock same monitor

=== Block 2 ===
true

=== Block 3 ===
race: unsynchronized rw
fix: lock or atomic or immutability
`;
