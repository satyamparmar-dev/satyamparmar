package arch.day11;

/**
 * Day 11 exercise: abstract base + interface default + template describe.
 */
public class Day11Exercise {

    interface LedgerPort {
        void post(int cents);

        default void postPositive(int cents) {
            if (cents < 0) {
                throw new IllegalArgumentException("negative posting");
            }
            post(cents);
        }
    }

    abstract static class AbstractLedger {
        protected final String id;

        AbstractLedger(String id) {
            this.id = id;
        }

        abstract String channel();

        final String describe() {
            return id + ":" + channel();
        }
    }

    static class FileLedger extends AbstractLedger implements LedgerPort {
        FileLedger(String id) {
            super(id);
        }

        @Override
        String channel() {
            return "FILE";
        }

        @Override
        public void post(int cents) {
            System.out.println("post:" + cents);
        }
    }

    public static void main(String[] args) {
        final String a = "abstract: ACC_ABSTRACT bases share state and ctor chains while forcing overrides.";
        final String i = "interface: contracts stack via implements with invokeinterface dispatch sites.";
        final String d = "default: Java 8 interface bodies evolve APIs without breaking every implementor.";
        System.out.println(a);
        System.out.println(i);
        System.out.println(d);
        FileLedger ledger = new FileLedger("L1");
        System.out.println(ledger.describe());
        ledger.postPositive(10);
        System.out.println("done");
    }
}
