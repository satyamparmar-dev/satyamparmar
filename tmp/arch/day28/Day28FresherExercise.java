package arch.day28;

/**
 * Fresher exercise: smallest generic holder so erasure feels concrete.
 */
public class Day28FresherExercise {

    static final class Holder<T> {
        private final T value;

        Holder(T value) {
            this.value = value;
        }

        T get() {
            return value;
        }
    }

    public static void main(String[] args) {
        Holder<String> sku = new Holder<>("sku");
        System.out.println(sku.get());

        Holder<Integer> qty = new Holder<>(42);
        System.out.println(qty.get());

        System.out.println("teaching: unbounded T erases to java.lang.Object in bytecode for Holder.get");
    }
}
