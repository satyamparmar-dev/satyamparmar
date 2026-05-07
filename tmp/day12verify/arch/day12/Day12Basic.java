package arch.day12;

/**
 * Day 12 basic: println-only encapsulation and immutability reference card.
 */
public class Day12Basic {

    public static void main(String[] args) {
        // Core concept: how fields live on the heap and what private actually buys.
        System.out.println("=== Encapsulation - heap fields and access ===");
        System.out.println("private field   | javac blocks external compile-time access | heap slot still mutated via reflection");
        System.out.println("getter/setter   | centralize validation + invariants          | useless if returned mutable object aliases");
        System.out.println("package-private | wider visibility for tests                   | breaks module boundaries under JPMS");
        System.out.println("final field     | assign-once after ctor definite assignment   | does not deep-freeze mutable referent");
        System.out.println();

        // Commands that prove accessor behaviour and contention.
        System.out.println("=== Command reference - attach to Jira ===");
        System.out.println("javap -c LedgerDto.class       -> see getfield/areturn without copyOf on collections");
        System.out.println("jcmd <pid> Thread.print        -> show concurrent Iterator.remove vs mutator stacks");
        System.out.println("jmap -dump:live,format=b,file=heap.bin <pid>  -> MAT hunt duplicate cache keys");
        System.out.println("jstack <pid>                   -> sample ConcurrentModificationException frames");
        System.out.println("javac -Xlint:unchecked         -> surface raw collection escapes in legacy beans");
        System.out.println();

        // Failure signatures tied to broken invariants.
        System.out.println("=== Failure modes - invariants and aliases ===");
        System.out.println("ConcurrentModificationException | structurally modified list during iteration");
        System.out.println("IllegalStateException           | iterator remove after illegal sequence");
        System.out.println("Cache miss storm                | mutable key changed after HashMap put");
        System.out.println("Silent double count             | shared mutable list mutated between threads");
        System.out.println("Data race metrics               | non-volatile reads of partially published fields");
        System.out.println();

        // Build and runtime posture.
        System.out.println("=== Environment / configuration cues ===");
        System.out.println("Prefer List.copyOf / Map.copyOf snapshots at DTO boundaries on Java 10+");
        System.out.println("Ban public mutable fields in style guide except generated protobuf internals");
        System.out.println("Enable Error Prone ImmutableChecker or ArchUnit rules in CI");
        System.out.println("Document thread-safety policy per package - encapsulation is not enough");
        System.out.println("Spot-check record compact constructors for List.copyOf on mutable components");
        System.out.println();

        System.out.println("=== Review cue ===");
        System.out.println("staff cue: every getter returning collection must show copyOf in javap");
        System.out.println("staff cue: freeze cache keys as records with immutable components");
        System.out.println("staff cue: run jdeps on modules after removing public fields");
        System.out.println("done");
    }
}
