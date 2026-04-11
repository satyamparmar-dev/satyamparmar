export const basicCode = String.raw`package arch.day35;

import java.util.concurrent.atomic.*;

public class Day35Basic {

    public static void main(String[] args) {
        AtomicInteger a = new AtomicInteger();
        a.incrementAndGet();
        a.addAndGet(4);
        System.out.println(a.get());
    }
}
`;

export const basicOutput = `5
`;

export const intermediateCode = String.raw`package arch.day35;

import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.concurrent.locks.*;

public class Day35Intermediate {

    public static void main(String[] args) throws Exception {
        // --- Scenario 1: AtomicInteger race-free ---
        System.out.println("--- Scenario 1 ---");
        AtomicInteger ai = new AtomicInteger();
        Runnable inc = () -> {
            for (int i = 0; i < 1000; ai.incrementAndGet(), i++) {}
        };
        Thread a = new Thread(inc);
        Thread b = new Thread(inc);
        a.start();
        b.start();
        a.join();
        b.join();
        System.out.println(ai.get());
        System.out.println();

        // --- Scenario 2: synchronized int ---
        System.out.println("--- Scenario 2 ---");
        final Object lock = new Object();
        int[] box = { 0 };
        Runnable inc2 =
                () -> {
                    for (int i = 0; i < 1000; i++) {
                        synchronized (lock) {
                            box[0]++;
                        }
                    }
                };
        Thread c = new Thread(inc2);
        Thread d = new Thread(inc2);
        c.start();
        d.start();
        c.join();
        d.join();
        System.out.println(box[0]);
        System.out.println();

        // --- Scenario 3: ReentrantLock tryLock ---
        System.out.println("--- Scenario 3 ---");
        ReentrantLock rl = new ReentrantLock();
        rl.lock();
        try {
            System.out.println("held");
        } finally {
            rl.unlock();
        }
        System.out.println();

        // --- Scenario 4: Semaphore ---
        System.out.println("--- Scenario 4 ---");
        Semaphore s = new Semaphore(1);
        s.acquire();
        System.out.println(s.availablePermits());
        s.release();
    }
}
`;

export const intermediateOutput = `--- Scenario 1 ---
2000

--- Scenario 2 ---
2000

--- Scenario 3 ---
held

--- Scenario 4 ---
0
`;

export const advancedCode = String.raw`package arch.day35;

import java.util.concurrent.*;

public class Day35Advanced {

    public static void main(String[] args) throws Exception {
        // === Block 1: LongAdder ===
        System.out.println("=== Block 1 ===");
        LongAdder adder = new LongAdder();
        adder.increment();
        adder.add(2);
        System.out.println(adder.sum());
        System.out.println();

        // === Block 2: ConcurrentHashMap ===
        System.out.println("=== Block 2 ===");
        ConcurrentHashMap<String, Integer> m = new ConcurrentHashMap<>();
        m.merge("k", 1, Integer::sum);
        m.merge("k", 2, Integer::sum);
        System.out.println(m.get("k"));
        System.out.println();

        // === Block 3: table ===
        System.out.println("=== Block 3 ===");
        System.out.println("CAS: compareAndSet loop");
        System.out.println("RWLock: many readers");
        System.out.println("StampedLock: optimistic read");
    }
}
`;

export const advancedOutput = `=== Block 1 ===
3

=== Block 2 ===
3

=== Block 3 ===
CAS: compareAndSet loop
RWLock: many readers
StampedLock: optimistic read
`;
