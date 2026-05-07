package arch.day13;

/**
 * Day 13 basic: println-only nested vs inner reference card.
 */
public class Day13Basic {

    public static void main(String[] args) {
        // Binary names and loader resolution for nested types.
        System.out.println("=== Nested types - class file layout ===");
        System.out.println("static nested  | Outer$Nested.class | no implicit outer field");
        System.out.println("inner instance | Outer$Inner.class  | synthetic this$0 to enclosing");
        System.out.println("anonymous      | Outer$1.class      | numbered sibling classes");
        System.out.println("local          | Outer$1Local.class | method-scoped, captures finals");
        System.out.println();

        System.out.println("=== Command reference - bytecode and heap ===");
        System.out.println("javap -p Outer$Inner.class     -> show synthetic this$0 and NestHost");
        System.out.println("javap -c Outer$Inner.class     -> see outer receiver passed to <init>");
        System.out.println("jcmd <pid> GC.class_histogram  -> count Outer$* instances under load");
        System.out.println("jmap -histo:live <pid>         -> spot explosion of $1 $2 callbacks");
        System.out.println("java -verbose:class            -> trace duplicate nested loads from jars");
        System.out.println();

        System.out.println("=== Failure modes tied to nested types ===");
        System.out.println("NoClassDefFoundError       | shaded jar renamed Outer but not Inner");
        System.out.println("IllegalArgumentException   | reflection new inner without outer instance");
        System.out.println("Heap retention             | inner handler pins outer singleton graph");
        System.out.println("IncompatibleClassChangeError | nest split across mismatched jars");
        System.out.println("Metaspace churn            | anonymous per request without reuse");
        System.out.println();

        System.out.println("=== Environment / CI cues ===");
        System.out.println("Diff javap NestHost/NestMembers after every shade relocation");
        System.out.println("Ban non-static nested DTOs in JSON modules via ArchUnit");
        System.out.println("Prefer lambdas or static nested for SAM callbacks on hot paths");
        System.out.println("Document binary names for OpenAPI generators touching nested models");
        System.out.println("Count dollar classes in jcmd histogram after every perf regression");
        System.out.println();

        System.out.println("=== Review cue ===");
        System.out.println("staff cue: grep new Outer.Inner versus new Inner on outer.new");
        System.out.println("staff cue: histogram Outer dollar classes after soak tests");
        System.out.println("staff cue: diff NestMembers attributes when shade relocates packages");
        System.out.println("done");
    }
}
