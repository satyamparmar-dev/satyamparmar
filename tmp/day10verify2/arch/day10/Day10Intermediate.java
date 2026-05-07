package arch.day10;

/**
 * Day 10 intermediate: four dispatch + constructor scenarios (println narrative).
 */
public class Day10Intermediate {

    // Multi-line comment policy: always pair on-call stories with a concrete JVM command.
    /*
     * Context: teams confuse overloaded helpers with overrides when IntelliJ
     * quick-fixes method names — javap proves which body runs.
     */
    static void scenario1() {
        System.out.println("--- Scenario 1: wrong body after rename (overload trap) ---");
        System.out.println("symptom: totals unchanged after subclass 'fix'");
        System.out.println("cause:    new method overload hides intended override");
        System.out.println("why:      compiler bound call to superclass static type path");
        System.out.println("fix:      add @Override and match signature exactly");
        System.out.println("verify:   javap -c -p PricingService.class");
        System.out.println("staff:    diff disassembly across release tag SHAs");
        System.out.println("note:    overload accidents hide in review without @Override");
        System.out.println();
    }

    /*
     * Context: Kotlin / Java interop callers cast blindly after JSON joins.
     */
    static void scenario2() {
        System.out.println("--- Scenario 2: ClassCastException on polymorphic list ---");
        System.out.println("symptom: Kafka handler dies with ClassCastException");
        System.out.println("cause:    Promotion pulled as Customer but payload is Vendor");
        System.out.println("fix:      guard with instanceof or pattern switch (Java 17+)");
        System.out.println("verify:   jcmd <pid> Thread.print");
        System.out.println("staff:    log canonical type names before cast");
        System.out.println("echo:     reproduce with java -verbose:class loader trace");
        System.out.println("note:    pattern switch or sealed sums catch unknown subtype early");
        System.out.println();
    }

    /*
     * Context: parent adds abstract method; one microservice shard lags deploy.
     */
    static void scenario3() {
        System.out.println("--- Scenario 3: partial deploy AbstractMethodError ---");
        System.out.println("symptom: canary pod churn with AbstractMethodError");
        System.out.println("cause:    old child JAR lacks new abstract hook method");
        System.out.println("fix:      roll forward together or add temp default in base");
        System.out.println("verify:   javap -p BaseProcessor.class child jar on node");
        System.out.println("staff:    enforce atomic BOM + contract tests per tier");
        System.out.println("metric:   spike in restart count correlates with skew");
        System.out.println("note:    compare helm chart sha with jar manifest build stamp");
        System.out.println();
    }

    static void scenario4() {
        System.out.println("--- Scenario 4: constructor chain mis-order ---");
        System.out.println("symptom: compile error: call to super must be first");
        System.out.println("cause:    attempted logging before super(...) in ctor");
        System.out.println("fix:      move super(...) or this(...) to line one, log after");
        System.out.println("verify:   javac -Xlint:all DiscountOffer.java");
        System.out.println("staff:    teach builders when ctor side-effects required");
        System.out.println("context: invokespecial enforces definite assignment rules");
        System.out.println("note:    builder pattern avoids ctor side-effect ordering drama");
        System.out.println();
    }

    static void printBanner() {
        System.out.println("banner: Day10 intermediate inheritance + dispatch lab");
    }

    public static void main(String[] args) {
        printBanner();
        scenario1();
        scenario2();
        scenario3();
        scenario4();
    }
}
