package arch.day28;

/**
 * Day 28 intermediate: four on-call style generics narratives (println only).
 * Real prod teams blame Jackson or Gradle when JDBC raw Lists or wildcards are the real fault.
 * MapStruct bumps rename synthetic bridges—always diff javap before rollback.
 *
 * Mid-level readers should rehearse each scenario as a ticket narrative:
 * capture the command that proved root cause, paste javap snippets, and link the PR.
 * Generics incidents rarely throw during unit tests—they appear under mixed tenant data.
 * Keep scenario titles aligned with log lines your lead will search in Splunk or ELK.
 *
 * When you escalate, attach JVM version (java -version) because bridge behavior is stable
 * across LTS lines but warning text differs between javac releases and IDE inspectors.
 *
 * Remember: flipped PECS is cheaper to fix at compile time than rewriting APIs later.
 */
public class Day28Intermediate {

    // Scenario 1 hook: raw JDBC Lists are the silent author of Jackson ClassCastException stacks.
    static void scenario1() {
        System.out.println("--- Scenario 1: DTO hydration blows up after raw JDBC List ---");
        System.out.println("symptom:  HTTP 500 only for tenants with mixed numeric SKU identifiers");
        System.out.println("cause:    DAO returned raw List and caller treated it as List<String>");
        System.out.println("why:      erasure skipped checkcasts until Jackson readValue enforced String");
        System.out.println("fix:      JdbcTemplate.query with RowMapper<List<String>> or parser at JDBC edge");
        System.out.println("verify:   jcmd <pid> Thread.print shows checkcast to java.lang.String after Object");
        System.out.println("staff:    javac -Xlint:unchecked -Werror on shared-data until raw List is gone");
        System.out.println();
    }

    // Scenario 2 hook: diff javap before rolling back a MapStruct upgrade.
    static void scenario2() {
        System.out.println("--- Scenario 2: Lombok bump lit up Repository$$Bridge in profiler ---");
        System.out.println("symptom:  jstack shows CovariantClient$$Bridge during MapStruct-heavy requests");
        System.out.println("cause:    narrowed generic return forced javac to synthesize ACC_BRIDGE methods");
        System.out.println("why:      JVM calls erased signature then bridges cast to specialized return type");
        System.out.println("fix:      keep upgrade when javap diff only adds expected synthetic bridges");
        System.out.println("verify:   javap -p ClientImpl.class and scan method flags for ACC_BRIDGE");
        System.out.println("staff:    jcmd <pid> JFR.start duration=300s if CPU regression must be quantified");
        System.out.println();
    }

    // Scenario 3 hook: nested JSON always needs a TypeToken or JavaType witness.
    static void scenario3() {
        System.out.println("--- Scenario 3: Gson drops nested List<Row> inside ApiEnvelope JSON ---");
        System.out.println("symptom:  ClassCastException: LinkedTreeMap cannot be cast to Row in IT suite");
        System.out.println("cause:    gson.fromJson(payload, ApiEnvelope.class) erases nested List<Row>");
        System.out.println("why:      Class literal cannot carry ParameterizedType for inner generics");
        System.out.println("fix:      new TypeToken<ApiEnvelope<List<Row>>>(){}.getType() for HTTP client read");
        System.out.println("verify:   javap -v EnvelopeParser$1.class shows Signature attribute intact");
        System.out.println("staff:    forbid Class-based fromJson when static type nests generics in review bot");
        System.out.println();
    }

    // Scenario 4 hook: flipped PECS belongs in API review, not midnight paging.
    static void scenario4() {
        System.out.println("--- Scenario 4: ingest API used List<? super Number> for a read-only aggregator ---");
        System.out.println("symptom:  Gradle compileJava fails when clients pass List<Integer> to mergeTotals");
        System.out.println("cause:    ? super Number marks a consumer sink but method never called add");
        System.out.println("why:      capture of ? cannot prove List<Integer> is valid argument type");
        System.out.println("fix:      read-only parameters should be List<? extends Number> per PECS");
        System.out.println("verify:   ./gradlew compileJava --info and confirm capture#1 error disappeared");
        System.out.println("staff:    publish internal PECS cheatsheet beside every public Collection parameter");
        System.out.println();
    }

    public static void main(String[] args) {
        System.out.println("banner: Day28 intermediate arch.day28");
        System.out.println();
        scenario1();
        scenario2();
        scenario3();
        scenario4();
    }
}
