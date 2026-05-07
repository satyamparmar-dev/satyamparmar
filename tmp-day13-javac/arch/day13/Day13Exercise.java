package arch.day13;

/**
 * Day 13 exercise: static nested builder + local class capture.
 */
public class Day13Exercise {

    static final class Hull {
        private final String id;

        private Hull(String id) {
            this.id = id;
        }

        String label() {
            return id;
        }

        public static final class Builder {
            private String id;

            public Builder id(String v) {
                this.id = v;
                return this;
            }

            public Hull build() {
                return new Hull(id);
            }
        }
    }

    static void demoLocal() {
        final String prefix = "L:";
        class Tag {
            String mk(String s) {
                return prefix + s;
            }
        }
        System.out.println("local=" + new Tag().mk("oop"));
    }

    public static void main(String[] args) {
        final String a = "static: Outer$Nested bytecode has no synthetic outer this field.";
        final String b = "inner: non-static nested ctor receives implicit outer instance slot.";
        final String c = "local: method-scoped class captures effectively final locals as fields.";
        System.out.println(a);
        System.out.println(b);
        System.out.println(c);
        Hull h = new Hull.Builder().id("H1").build();
        System.out.println("hull=" + h.label());
        demoLocal();
        System.out.println("done");
    }
}
