package arch.day13;

/**
 * Day 13 intermediate: four nested-class production narratives (println only).
 */
public class Day13Intermediate {

    /*
     * Context: Vert.x / Netty style handler holds non-static inner per connection.
     */
    static void scenario1() {
        System.out.println("--- Scenario 1: inner handler pins outer service graph ---");
        System.out.println("symptom: metaspace and old gen grow while connection count flat");
        System.out.println("cause:    anonymous inner implements Handler capturing OrderService.this");
        System.out.println("why:      synthetic this$0 keeps whole service reachable from handler");
        System.out.println("fix:      convert to static nested with explicit OrderService param");
        System.out.println("verify:   javap -p OrderService$1.class lists synthetic outer field");
        System.out.println("staff:    jcmd <pid> GC.class_histogram | find OrderService$");
        System.out.println("note:    profilers show innocent handler retaining giant spring context");
        System.out.println("echo:    MAT path to GC roots often lists this$0 before you expect it");
        System.out.println();
    }

    /*
     * Context: shade plugin relocates Outer but Inner ConstantPool stale.
     */
    static void scenario2() {
        System.out.println("--- Scenario 2: NoClassDefFoundError after shaded deploy ---");
        System.out.println("symptom: canary pod crash loop on first user request");
        System.out.println("cause:    Inner still references old com.acme.Outer name in bytecode");
        System.out.println("fix:      align shade rules or stop relocating nested companions");
        System.out.println("verify:   javap -verbose Outer$Inner.class | grep class name");
        System.out.println("staff:    java -verbose:class on canary to see failing load");
        System.out.println("echo:     diff fat jar against baseline with jar tf | grep Outer");
        System.out.println("note:    IncompatibleClassChangeError also appears on split nests");
        System.out.println("verify2: jdeps --multi-release 21 fat.jar surfaces split nest edges");
        System.out.println();
    }

    static void scenario3() {
        System.out.println("--- Scenario 3: reflection tries to new inner without outer ---");
        System.out.println("symptom: IllegalArgumentException no enclosing instance");
        System.out.println("cause:    Class.getDeclaredConstructor().newInstance on non-static inner");
        System.out.println("fix:      use Constructor outer.new Inner or switch to static nested");
        System.out.println("verify:   javap -p Service$Builder.class for static modifier");
        System.out.println("staff:    add integration test constructing nested via public API");
        System.out.println("metric:   support tickets spike after codegen upgrade");
        System.out.println("note:    Jackson sometimes needs JsonCreator static factory");
        System.out.println();
    }

    static void scenario4() {
        System.out.println("--- Scenario 4: lambda versus anonymous bytecode debate ---");
        System.out.println("symptom: profiler shows unexpected private static lambda bodies on outer");
        System.out.println("cause:    lambda capture desugared to LambdaMetafactory indy sites");
        System.out.println("fix:      read javap -c and accept or replace with method reference");
        System.out.println("verify:   javap -c -p Outer.class | grep invokedynamic");
        System.out.println("staff:    compare against old anonymous inner class profile");
        System.out.println("context: Java 8 moved hot SAM paths to indy for metaspace wins");
        System.out.println("note:    capture lists still retain outer this when referenced");
        System.out.println("metric:  indy count rises when migrating anonymous to lambda");
        System.out.println("echo:    jstack still shows nested frames even with lambda sugar");
        System.out.println();
    }

    static void printBanner() {
        System.out.println("banner: Day13 intermediate nested + inner lab");
    }

    public static void main(String[] args) {
        printBanner();
        scenario1();
        scenario2();
        scenario3();
        scenario4();
    }
}
