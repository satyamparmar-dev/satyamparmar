package arch.day28;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Staff exercise: printable triage card for generic heap pollution behind Jackson frames.
 *
 * Rows are symbolic—real JDBC would query ResultSet, but println keeps CI deterministic.
 * Ordered LinkedHashMap preserves the teaching narrative from healthy to noisy tenants.
 * Each command string names a tool you would run before proposing a rollback.
 * The mechanism line restates erasure + heap pollution without blaming product data.
 * Fix/verify/prevention mirror what you would document in a blameless postmortem.
 */
public class Day28StaffExercise {

    public static void main(String[] args) {
        final String rowOk = "row_ok:string_sku";
        final String rowBad = "row_bad:long_sku_pollutes_List_String";
        final String rowNoise = "row_noise:tenant_toggle";

        Map<String, String> symptomToCommand = new LinkedHashMap<>();
        symptomToCommand.put(rowOk, "jcmd <pid> Thread.print (baseline healthy tenant)");
        symptomToCommand.put(rowBad, "javac -Xlint:unchecked on shared-data + jcmd Thread.print on failing tenant");
        symptomToCommand.put(rowNoise, "javap -p CatalogMapper.class to diff bridges after processor bump");

        System.out.println("=== Modeled JDBC rows ===");
        for (Map.Entry<String, String> e : symptomToCommand.entrySet()) {
            System.out.println(e.getKey() + " -> first tool: " + e.getValue());
        }

        System.out.println("=== Triage for row_bad ===");
        System.out.println("mechanism: erasure let raw List from JdbcTemplate land in List<String> DTO field until Jackson readValue emitted checkcast to String");

        System.out.println("=== Fix pattern ===");
        System.out.println("fix: replace Map row extract with RowMapper<List<String>> or parse Object cells to String before DTO");

        System.out.println("=== Verify ===");
        System.out.println("verify: ./gradlew compileJava with -Werror on unchecked in shared modules + rerun canary tenant suite");

        System.out.println("=== Prevention ===");
        System.out.println("prevention: ArchUnit rule banning raw List/Map in arch.catalog public packages + PR template checklist");

        // Staff extension: name the JVM mechanism once more for interview drills.
        System.out.println("=== JVM recap ===");
        System.out.println("javac erased List element type at JDBC boundary; Jackson enforced String with checkcast");
        System.out.println("see also: Java SE 17 Language Specification sections on erasure and synthetic bridges");
        System.out.println("see also: jcmd Man page for Thread.print usage on Linux and Windows JDK builds");
    }
}
