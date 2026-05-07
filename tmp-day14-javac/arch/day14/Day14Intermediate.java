package arch.day14;

/**
 * Day 14 intermediate: four collections production narratives (println only).
 */
public class Day14Intermediate {

    /*
     * Context: shared ArrayList field mutated while Jackson iterator walks DTO graph.
     */
    static void scenario1() {
        System.out.println("--- Scenario 1: ConcurrentModificationException during JSON walk ---");
        System.out.println("symptom: billing worker 500s only after Kafka rebalance bursts");
        System.out.println("cause:    thread A iterates shared ArrayList while thread B calls add");
        System.out.println("why:      ArrayList$Itr expectedModCount lags parent modCount");
        System.out.println("fix:      return List.copyOf from getter or synchronize mutation boundary");
        System.out.println("verify:   jcmd <pid> Thread.print shows Iterator.next colliding with add");
        System.out.println("staff:    jstack during spike must list checkForComodification frames");
        System.out.println("metric:  Spliterator.forEachRemaining in stack ties to Jackson walk");
        System.out.println("echo:    repro requires two executor tasks touching same list identity");
        System.out.println();
    }

    /*
     * Context: mutable HashMap key mutates hashCode after insert so get returns null.
     */
    static void scenario2() {
        System.out.println("--- Scenario 2: silent cache miss from mutable map keys ---");
        System.out.println("symptom: Redis fallback misses even though entry was put minutes ago");
        System.out.println("cause:    AccountKey hashCode changed after fields mutated post-put");
        System.out.println("why:      HashMap bucket index derived from original hash at insert time");
        System.out.println("fix:      switch to record key or String id; forbid setters after put");
        System.out.println("verify:   jmap -dump:live then MAT HashMap inspector for stranded entries");
        System.out.println("staff:    unit test mutates key after put and asserts get nullability");
        System.out.println("note:    symptom mimics flaky cache not data loss");
        System.out.println();
    }

    /*
     * Context: massive HashMap resize copies tables and lengthens STW under load.
     */
    static void scenario3() {
        System.out.println("--- Scenario 3: GC pause spike from HashMap resize storm ---");
        System.out.println("symptom: p99 latency doubles right after cold start ingestion");
        System.out.println("cause:    default capacity HashMap grows through power-of-two resizes");
        System.out.println("why:      each resize rehashes every Node into a new table array");
        System.out.println("fix:      presize new HashMap(expectedElements) using load factor math");
        System.out.println("verify:   jstat -gc <pid> 1s correlates FGC with ingestion phase");
        System.out.println("staff:    jcmd GC.heap_info shows humongous int[] backing tables");
        System.out.println("context: Java 8 treeify still pays resize copy before trees help");
        System.out.println();
    }

    /*
     * Context: synchronizedMap still allows ConcurrentModificationException during iteration.
     */
    static void scenario4() {
        System.out.println("--- Scenario 4: synchronizedMap iterator versus reader/writer myth ---");
        System.out.println("symptom: occasional CME despite Collections.synchronizedMap wrapper");
        System.out.println("cause:    manual iterator loop outside synchronized(map) monitor");
        System.out.println("why:      synchronizedMap only guards individual mutator methods");
        System.out.println("fix:      synchronize on map during iteration or migrate to CHM views");
        System.out.println("verify:   javap -c on caller shows monitorenter missing around iterator");
        System.out.println("staff:    jstack captures one thread in next while another in put");
        System.out.println("note:    ConcurrentHashMap iterators are weakly consistent not fail-fast");
        System.out.println("metric: read-heavy services drop lock contention after CHM migration");
        System.out.println();
    }

    static void banner() {
        System.out.println("banner: Day14 intermediate collections lab");
    }

    public static void main(String[] args) {
        banner();
        scenario1();
        scenario2();
        scenario3();
        scenario4();
    }
}
