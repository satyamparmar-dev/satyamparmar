package arch.day11;

/**
 * Day 11 intermediate: four interface + abstract contract incidents (println only).
 */
public class Day11Intermediate {

    /*
     * Context: shared SDK adds abstract method; half the pool ships old adapter JARs.
     */
    static void scenario1() {
        System.out.println("--- Scenario 1: AbstractMethodError after SDK interface bump ---");
        System.out.println("symptom: REST worker dies before controller logs with AbstractMethodError");
        System.out.println("cause:    canary loads PricingPort v3 with new abstract settleTax()");
        System.out.println("why:      old AbstractStripeAdapter bytecode never implemented settleTax");
        System.out.println("fix:      roll adapters forward or add default body then migrate");
        System.out.println("verify:   javap -p com.acme.PricingPort from both JARs side by side");
        System.out.println("staff:    attach jcmd Thread.print snippet to incident ticket");
        System.out.println("note:     AbstractMethodError is linkage, not a thrown business exception");
        System.out.println();
    }

    /*
     * Context: two defaults collide; build breaks until explicit super qualifier.
     */
    static void scenario2() {
        System.out.println("--- Scenario 2: diamond default merge compile failure ---");
        System.out.println("symptom: javac error class inherits unrelated defaults for audit()");
        System.out.println("cause:    AuditA and AuditB both define default void audit()");
        System.out.println("fix:      override audit() and call AuditA.super.audit() or merge manually");
        System.out.println("verify:   javap -c Reporter.class after fix shows resolved super chain");
        System.out.println("staff:    ban copy-paste defaults across sibling interfaces in style guide");
        System.out.println("echo:     reproduce locally with javac -verbose on failing module");
        System.out.println("note:     compiler refuses silent picks - ambiguity is compile-time");
        System.out.println();
    }

    /*
     * Context: dev calls Logger.warn via implementation type but static lives on interface.
     */
    static void scenario3() {
        System.out.println("--- Scenario 3: interface static hides behind subtype reference ---");
        System.out.println("symptom: metrics show wrong log tag despite new JsonLogger class");
        System.out.println("cause:    code calls JsonLogger.configure() but static sits on LogFacet");
        System.out.println("why:      invokestatic binds to declared reference type not runtime class");
        System.out.println("fix:      call LogFacet.configure() or remove static from inheritance story");
        System.out.println("verify:   javap -c Caller.class and read Methodref owner for configure");
        System.out.println("staff:    forbid static import from subclasses in code review checklist");
        System.out.println("metric:   log volume mismatch correlates with wrong static binding");
        System.out.println("note:     same trap as class static hide but on interfaces since Java 8");
        System.out.println();
    }

    static void scenario4() {
        System.out.println("--- Scenario 4: ServiceLoader duplicate PaymentGateway providers ---");
        System.out.println("symptom: boot fails with ServiceConfigurationError during module scan");
        System.out.println("cause:    two JARs register same provider class name in META-INF/services");
        System.out.println("fix:      shade one copy away or merge module provides clauses cleanly");
        System.out.println("verify:   jar tf payment-stub.jar | findstr META-INF/services");
        System.out.println("staff:    add ArchUnit rule banning duplicate provider resource paths");
        System.out.println("context: JVM loads SPI lists before Spring context finishes wiring");
        System.out.println("note:     interface-only SPI still needs single canonical provider entry");
        System.out.println();
    }

    static void printBanner() {
        System.out.println("banner: Day11 intermediate abstract + interface lab");
    }

    public static void main(String[] args) {
        printBanner();
        scenario1();
        scenario2();
        scenario3();
        scenario4();
    }
}
