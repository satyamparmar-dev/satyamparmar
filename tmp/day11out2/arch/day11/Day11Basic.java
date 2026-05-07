package arch.day11;

/**
 * Day 11 basic: println-only abstract vs interface reference card.
 * // Staff use this layout in onboarding docs so new hires pair vocabulary with javap.
 */
public class Day11Basic {

    public static void main(String[] args) {
        // Core concept table: how contracts differ in bytecode and design.
        System.out.println("=== Abstract class vs interface - contract shape ===");
        System.out.println("abstract class | ACC_ABSTRACT class | single extends | fields + ctor + abstract + concrete");
        System.out.println("interface      | interface type     | multi implements | abstract + default + static + private");
        System.out.println("instantiation  | new forbidden on abstract | new forbidden on interface | concrete class supplies new");
        System.out.println("state          | protected fields common | only public static final constants historically");
        System.out.println();

        // Command reference: prove contracts from class files, not slides.
        System.out.println("=== Command reference - attach to Jira ===");
        System.out.println("javap -p PaymentPort.class        -> list abstract/default/static methods + flags");
        System.out.println("javap -c Adapter.class            -> show invokevirtual vs invokeinterface sites");
        System.out.println("jcmd <pid> Thread.print           -> anchor AbstractMethodError stack to receiver class");
        System.out.println("java -verbose:class               -> trace duplicate providers during SPI load");
        System.out.println("javac -Xlint:deprecation          -> surface default method override drift in CI");
        System.out.println();

        // Failure modes table: what ops sees when bytecode skew exists.
        System.out.println("=== Failure modes - linkage not business logic ===");
        System.out.println("AbstractMethodError        | child JAR missing new interface abstract hook");
        System.out.println("IncompatibleClassChangeError | interface default removed between canary and baseline");
        System.out.println("IllegalAccessError         | module does not export package to implementor");
        System.out.println("VerifyError                | bad bytecode from generator after interface edit");
        System.out.println("ServiceConfigurationError  | duplicate META-INF/services entries for same type");
        System.out.println();

        // Environment posture: keep compiler and runtime agreeing on contract versions.
        System.out.println("=== Environment / configuration cues ===");
        System.out.println("Align Gradle BOM so shared interface JAR revs atomically across services");
        System.out.println("Use javap diff in CI when libraries expose sealed permits lists");
        System.out.println("Pin Java release flag to LTS line your pods actually run");
        System.out.println("Document FunctionalInterface count - second abstract method breaks lambdas");
        System.out.println("Run jdeps -summary on modules after interface edits to catch split-package drift");
        System.out.println();

        System.out.println("=== Review cue ===");
        System.out.println("staff cue: diff javap -p on interface before every rolling deploy");
        System.out.println("staff cue: grep @FunctionalInterface before adding new abstract methods");
        System.out.println("done");
    }
}
