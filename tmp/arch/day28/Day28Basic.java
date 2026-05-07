package arch.day28;

/**
 * Day 28 basic: println-only reference for fresher through staff readers.
 */
public class Day28Basic {

    public static void main(String[] args) {
        // Core idea: javac proves List<String>; JVM still loads erased List descriptors.
        System.out.println("=== Core concept table ===");
        System.out.println("scope    | this file is println-only — no collections or loops");
        System.out.println("List<String> compile | javac rejects list.add(Integer.valueOf(1))");
        System.out.println("List.add bytecode   | descriptor still takes java.lang.Object");
        System.out.println("getClass runtime    | same ArrayList class for String and Integer lists");
        System.out.println("covariant return    | triggers ACC_BRIDGE synthetic methods");
        System.out.println();

        // Terminal tools you will actually run when generics explode in prod.
        System.out.println("=== Command reference ===");
        System.out.println("javap -p Service.class       list ACC_BRIDGE synthetic methods");
        System.out.println("javap -c Service.class       inspect checkcast after erased calls");
        System.out.println("javac -Xlint:unchecked       surface unchecked warnings in modules");
        System.out.println("jcmd <pid> Thread.print      frame context around ClassCastException");
        System.out.println("java -version                confirm JDK family for bridge expectations");
        System.out.println();

        // Errors beginners blame on data but seniors tie to erased boundaries.
        System.out.println("=== Common beginner mistakes (symptoms) ===");
        System.out.println("ClassCastException        heap saw Long where String was promised");
        System.out.println("ArrayStoreException       varargs generic array took wrong runtime type");
        System.out.println("ClassCastException gson   LinkedTreeMap cast to Row without TypeToken");
        System.out.println("AbstractMethodError shade bridge pair missing after jar relocation");
        System.out.println();

        // Remember-this block before interview or on-call.
        System.out.println("=== Remember this ===");
        System.out.println("PECS     | producer extends | consumer super");
        System.out.println("Raw List | strips compile proofs | ban in new public APIs");
        System.out.println("Erasure  | Class<T> or TypeToken carries lost nested shapes");
        System.out.println("staff cue| grep 'List ' without angle brackets before blaming Jackson");
        System.out.println("staff cue| diff javap -p after MapStruct upgrades");
        System.out.println("staff cue| require TypeReference for nested JSON in code review");
        System.out.println("eof");
    }
}
