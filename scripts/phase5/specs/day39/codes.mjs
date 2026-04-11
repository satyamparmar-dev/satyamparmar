export const basicCode = String.raw`package arch.day39;

import java.util.*;

public class Day39Basic {

    static class Bean {
        void postConstruct() {
            System.out.println("postConstruct");
        }

        void init() {
            System.out.println("initMethod");
        }
    }

    public static void main(String[] args) {
        Bean b = new Bean();
        System.out.println("constructed");
        b.postConstruct();
        b.init();
    }
}
`;

export const basicOutput = `constructed
postConstruct
initMethod
`;

export const intermediateCode = String.raw`package arch.day39;

import java.util.*;

public class Day39Intermediate {

    interface Notifier {
        void send();
    }

    static class Email implements Notifier {
        public void send() {
            System.out.println("email");
        }
    }

    static class Sms implements Notifier {
        public void send() {
            System.out.println("sms");
        }
    }

    static class PrimaryEmail extends Email {}

    static void inject(Map<String, Notifier> all, String qualifier, boolean usePrimary) {
        // --- Scenario 1: @Qualifier by name ---
        System.out.println("--- Scenario 1 ---");
        System.out.println(all.get(qualifier) != null);
        System.out.println();

        // --- Scenario 2: @Primary default ---
        System.out.println("--- Scenario 2 ---");
        Notifier chosen = usePrimary ? new PrimaryEmail() : new Sms();
        chosen.send();
        System.out.println();

        // --- Scenario 3: dependsOn order ---
        System.out.println("--- Scenario 3 ---");
        List<String> order = new ArrayList<>();
        order.add("flyway");
        order.add("dataSource");
        System.out.println(order);
        System.out.println();

        // --- Scenario 4: prototype no container destroy ---
        System.out.println("--- Scenario 4 ---");
        System.out.println("prototype_destroy_manual");
    }

    public static void main(String[] args) {
        Map<String, Notifier> m = new HashMap<>();
        m.put("email", new Email());
        m.put("sms", new Sms());
        inject(m, "sms", true);
    }
}
`;

export const intermediateOutput = `--- Scenario 1 ---
true

--- Scenario 2 ---
email

--- Scenario 3 ---
[flyway, dataSource]

--- Scenario 4 ---
prototype_destroy_manual
`;

export const advancedCode = String.raw`package arch.day39;

public class Day39Advanced {

    public static void main(String[] args) {
        // === Block 1: lifecycle order cheat ===
        System.out.println("=== Block 1 ===");
        System.out.println("1 BPP before init");
        System.out.println("2 @PostConstruct");
        System.out.println("3 InitializingBean");
        System.out.println("4 custom init");
        System.out.println("5 BPP after init -> proxy");
        System.out.println();

        // === Block 2: aware smell ===
        System.out.println("=== Block 2 ===");
        System.out.println("ApplicationContextAware hides deps");
        System.out.println("prefer constructor injection");
        System.out.println();

        // === Block 3: FactoryBean note ===
        System.out.println("=== Block 3 ===");
        System.out.println("FactoryBean.getObject() is the bean");
        System.out.println("& prefix for factory itself");
    }
}
`;

export const advancedOutput = `=== Block 1 ===
1 BPP before init
2 @PostConstruct
3 InitializingBean
4 custom init
5 BPP after init -> proxy

=== Block 2 ===
ApplicationContextAware hides deps
prefer constructor injection

=== Block 3 ===
FactoryBean.getObject() is the bean
& prefix for factory itself
`;
