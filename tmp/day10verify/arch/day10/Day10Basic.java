package arch.day10;

/**
 * Day 10 basic: inheritance + polymorphism reference card (println only).
 */
public class Day10Basic {

    static void sep() {
        System.out.println("----------------------------------------");
    }

    public static void main(String[] args) {
        // Core vocabulary for JVM dispatch reviews and interview narration.
        System.out.println("=== Inheritance vs polymorphism - definitions ===");
        System.out.println("extends  | single superclass contract | is-a for classes");
        System.out.println("implements | many interfaces | protocol composition");
        System.out.println("virtual instance call | invokevirtual + vtable | runtime receiver wins");
        System.out.println("static call  | invokestatic + declared type | not polymorphic");
        sep();

        // Commands reviewers expect when inheritance bugs ship to prod.
        System.out.println("=== Command reference ===");
        System.out.println("javap -c -p Service.class | show invokevirtual targets + synthetic bridges");
        System.out.println("javap -verbose Child.class | read major version + superclass index");
        System.out.println("jcmd <pid> Thread.print     | capture stack proving receiver class");
        System.out.println("java -verbose:class Demo    | log ClassLoader provenance for duplicates");
        sep();

        // Failure modes that masquerade as business logic regressions.
        System.out.println("=== Failure modes table ===");
        System.out.println("ClassCastException          | illegal downcast after polymorphic collection");
        System.out.println("AbstractMethodError         | subclass missing new abstract/default");
        System.out.println("IncompatibleClassChangeError| two jars disagree on superclass layout");
        System.out.println("NoSuchMethodError           | shade/fat jar pinned stale override");
        sep();

        // Environment and build hygiene tied to hierarchy refactors.
        System.out.println("=== Environment / configuration cues ===");
        System.out.println("Align java --release with runtime image to avoid verify errors");
        System.out.println("Gradle enforce platform BOM so Customer v2 never shadows v3");
        System.out.println("JPMS split packages break reflective subclasses - watch module-info");
        System.out.println("Canary + javap diff gates catch accidental overload-not-override");
        sep();

        System.out.println("=== Review cue ===");
        System.out.println("@Override on every intentional override - compiler catches typos");
        // Staff diff discipline: bytecode receipts beat hallway assertions during outages.
        System.out.println("staff cue: diff javap output whenever inheritance touches pricing");
        System.out.println("staff cue: log runtime class names before casting kafka payloads");
        System.out.println("done");
    }
}

