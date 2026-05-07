package arch.day12;

/**
 * Day 12 intermediate: four encapsulation / immutability incidents (println only).
 */
public class Day12Intermediate {

    /*
     * Context: finance DTO returns internal ArrayList; Kafka thread clears during pagination.
     */
    static void scenario1() {
        System.out.println("--- Scenario 1: leaked List getter concurrent corruption ---");
        System.out.println("symptom: ConcurrentModificationException during Jackson serialization");
        System.out.println("cause:    getter returned this.lines without copy or unmodifiable wrap");
        System.out.println("why:      two threads share same backing array via alias");
        System.out.println("fix:      return List.copyOf(lines) or unmodifiable snapshot");
        System.out.println("verify:   javap -c InvoiceDto.class and search for copyOf before areturn");
        System.out.println("staff:    add concurrent stress test mutating caller-held list");
        System.out.println("note:    unit tests pass when single-threaded reuse hides alias");
        System.out.println();
    }

    /*
     * Context: legacy Date field mutated after cache insert breaks HashMap lookup.
     */
    static void scenario2() {
        System.out.println("--- Scenario 2: mutable Date key poisons settlement cache ---");
        System.out.println("symptom: cache miss rate climbs; settlements re-fetch constantly");
        System.out.println("cause:    SettlementKey used java.util.Date mutated after HashMap put");
        System.out.println("fix:      replace with Instant or immutable record key");
        System.out.println("verify:   jmap -dump then MAT HashMap histogram + key equals audit");
        System.out.println("staff:    ban Date in new code via ArchUnit import ban");
        System.out.println("echo:     reproduce with tiny main mutating key field post-put");
        System.out.println("note:    hashCode drift strands entries in wrong buckets silently");
        System.out.println();
    }

    /*
     * Context: record exposes MutableTag list; caller sorts in place breaking invariants.
     */
    static void scenario3() {
        System.out.println("--- Scenario 3: shallow record immutability broken ---");
        System.out.println("symptom: tag order flips in audit log without setter calls");
        System.out.println("cause:    record OrderEvent(List<MutableTag> tags) stored caller list ref");
        System.out.println("fix:      List.copyOf in compact constructor or wrap immutable tags");
        System.out.println("verify:   javap -c OrderEvent.class for invokespecial copyOf");
        System.out.println("staff:    code review checklist: record components must be immutable");
        System.out.println("metric:   audit diff noise correlates with caller-side sort()");
        System.out.println("note:    record accessors still return same list reference");
        System.out.println();
    }

    static void scenario4() {
        System.out.println("--- Scenario 4: racy read of partially constructed bean ---");
        System.out.println("symptom: sporadic zero balance in metrics exporter");
        System.out.println("cause:    another thread reads fields before ctor finishes publishing");
        System.out.println("fix:      final fields + safe publication or synchronized factory");
        System.out.println("verify:   jstack captures racing ctor vs reader frames");
        System.out.println("staff:    document @Immutable on types actually safe for cross-thread");
        System.out.println("context: encapsulation without JMM edge still allows torn reads");
        System.out.println("note:    use volatile holder or var handles only when measured");
        System.out.println("echo:    jcmd VM.flags confirms if experimental publication helpers enabled");
        System.out.println();
    }

    static void printBanner() {
        System.out.println("banner: Day12 intermediate encapsulation + immutability lab");
    }

    public static void main(String[] args) {
        printBanner();
        scenario1();
        scenario2();
        scenario3();
        scenario4();
    }
}
