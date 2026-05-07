package arch.day28;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Staff exercise: printable triage card for generic heap pollution behind Jackson frames.
 */
public class Day28StaffExercise {

    public static void main(String[] args) {
        final String rowOk = \"row_ok:string_sku\";
        final String rowBad = \"row_bad:long_sku_pollutes_List_String\";
        final String rowNoise = \"row_noise:tenant_toggle\";

        Map<String, String> symptomToCommand = new LinkedHashMap<>();
        symptomToCommand.put(rowOk, \"jcmd <pid> Thread.print (baseline healthy tenant)\");
        symptomToCommand.put(rowBad, \"javac -Xlint:unchecked on shared-data + jcmd Thread.print on failing tenant\");
        symptomToCommand.put(rowNoise, \"javap -p CatalogMapper.class to diff bridges after processor bump\");

        System.out.println(\"=== Modeled JDBC rows ===\");
        for (Map.Entry<String, String> e : symptomToCommand.entrySet()) {
            System.out.println(e.getKey() + \" -> first tool: \" + e.getValue());
        }

        System.out.println(\"=== Triage for row_bad ===\");
        System.out.println(\"mechanism: erasure let raw List from JdbcTemplate land in List<String> DTO field until Jackson readValue emitted checkcast to String\");

        System.out.println(\"=== Fix pattern ===\");
        System.out.println(\"fix: replace Map row extract with RowMapper<List<String>> or parse Object cells to String before DTO\");

        System.out.println(\"=== Verify ===\");
        System.out.println(\"verify: ./gradlew compileJava with -Werror on unchecked in shared modules + rerun canary tenant suite\");

        System.out.println(\"=== Prevention ===\");
        System.out.println(\"prevention: ArchUnit rule banning raw List/Map in arch.catalog public packages + PR template checklist\");
    }
}
