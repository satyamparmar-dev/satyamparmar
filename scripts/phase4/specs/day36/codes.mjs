export const basicCode = String.raw`package arch.day36;

import java.util.concurrent.*;

public class Day36Basic {

    public static void main(String[] args) throws Exception {
        CompletableFuture<Integer> f = CompletableFuture.supplyAsync(() -> 2);
        System.out.println(f.thenApply(x -> x * 3).get());
    }
}
`;

export const basicOutput = `6
`;

export const intermediateCode = String.raw`package arch.day36;

import java.util.concurrent.*;

public class Day36Intermediate {

    public static void main(String[] args) throws Exception {
        ExecutorService ex = Executors.newSingleThreadExecutor();

        // --- Scenario 1: supplyAsync ---
        System.out.println("--- Scenario 1 ---");
        CompletableFuture<String> a = CompletableFuture.supplyAsync(() -> "x", ex);
        System.out.println(a.get());
        System.out.println();

        // --- Scenario 2: thenApply ---
        System.out.println("--- Scenario 2 ---");
        System.out.println(CompletableFuture.completedFuture(1).thenApply(i -> i + 1).get());
        System.out.println();

        // --- Scenario 3: exceptionally ---
        System.out.println("--- Scenario 3 ---");
        String v =
                CompletableFuture.<String>failedFuture(new RuntimeException("e"))
                        .exceptionally(t -> "fallback")
                        .get();
        System.out.println(v);
        System.out.println();

        // --- Scenario 4: allOf ---
        System.out.println("--- Scenario 4 ---");
        CompletableFuture<Void> all =
                CompletableFuture.allOf(
                        CompletableFuture.completedFuture("a"),
                        CompletableFuture.completedFuture("b"));
        all.join();
        System.out.println("done");
        ex.shutdown();
    }
}
`;

export const intermediateOutput = `--- Scenario 1 ---
x

--- Scenario 2 ---
2

--- Scenario 3 ---
fallback

--- Scenario 4 ---
done
`;

export const advancedCode = String.raw`package arch.day36;

import java.util.concurrent.*;

public class Day36Advanced {

    public static void main(String[] args) throws Exception {
        // === Block 1: thenCompose ===
        System.out.println("=== Block 1 ===");
        CompletableFuture<Integer> f =
                CompletableFuture.completedFuture(2)
                        .thenCompose(v -> CompletableFuture.completedFuture(v * 5));
        System.out.println(f.get());
        System.out.println();

        // === Block 2: handle ===
        System.out.println("=== Block 2 ===");
        String h =
                CompletableFuture.<String>failedFuture(new IllegalStateException())
                        .handle((ok, err) -> err == null ? ok : "err")
                        .get();
        System.out.println(h);
        System.out.println();

        // === Block 3: vt note ===
        System.out.println("=== Block 3 ===");
        System.out.println("virtual threads: cheap; avoid pinning");
    }
}
`;

export const advancedOutput = `=== Block 1 ===
10

=== Block 2 ===
err

=== Block 3 ===
virtual threads: cheap; avoid pinning
`;
