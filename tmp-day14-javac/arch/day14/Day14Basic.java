package arch.day14;

/**
 * Day 14 basic: println-only collections reference card.
 */
public class Day14Basic {

    public static void main(String[] args) {
        // Core interfaces vs concrete types teams actually deploy.
        System.out.println("=== Collections — interface to implementation map ===");
        System.out.println("List       | ordered sequence | ArrayList default, LinkedList rare");
        System.out.println("Set        | unique by equals | HashSet, LinkedHashSet, TreeSet");
        System.out.println("Map        | key to value     | HashMap, LinkedHashMap, TreeMap");
        System.out.println("Queue      | FIFO discipline  | ArrayDeque, LinkedList as deque");
        System.out.println("Deque      | double-ended     | ArrayDeque preferred over Stack");
        System.out.println();

        System.out.println("=== Command reference — heap, threads, bytecode ===");
        System.out.println("jcmd <pid> Thread.print        -> see Iterator.next vs List.add races");
        System.out.println("jstack <pid>                   -> capture CME stack cheaply on Linux");
        System.out.println("jmap -histo:live <pid>         -> spot ArrayList/Node allocation churn");
        System.out.println("jstat -gc <pid> 1s             -> correlate HashMap resize with GC");
        System.out.println("javap -c java.util.ArrayList   -> read iterator checkForComodification");
        System.out.println();

        System.out.println("=== Failure modes tied to collections ===");
        System.out.println("ConcurrentModificationException | fail-fast iterator vs mutating thread");
        System.out.println("OutOfMemoryError heap space     | unbounded HashMap cache growth");
        System.out.println("ClassCastException              | raw types mixing in legacy APIs");
        System.out.println("IllegalArgumentException        | null key to ConcurrentHashMap.compute");
        System.out.println("UnsupportedOperationException   | Arrays.asList then add/remove");
        System.out.println();

        System.out.println("=== Environment / CI / review cues ===");
        System.out.println("Ban returning internal mutable lists from getters without copyOf");
        System.out.println("Load-test any synchronizedMap on read-heavy metrics dashboards");
        System.out.println("Document equals/hashCode invariants for every HashMap key DTO");
        System.out.println("Prefer ConcurrentHashMap for shared Spring @Singleton caches");
        System.out.println("Add ArchUnit rules blocking Hashtable in new modules");
        System.out.println();

        System.out.println("=== Review cue ===");
        System.out.println("staff cue: grep synchronizedMap in services with >1k RPS reads");
        System.out.println("staff cue: assert modCount storms with stress test plus jstack");
        System.out.println("staff cue: verify PriorityQueue workloads use poll not foreach order");
        System.out.println("done");
    }
}
