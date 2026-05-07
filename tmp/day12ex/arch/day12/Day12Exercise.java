package arch.day12;

import java.util.ArrayList;
import java.util.List;

/**
 * Day 12 exercise: PositionSnapshot with List.copyOf boundary.
 */
public class Day12Exercise {

    static final class PositionSnapshot {
        private final String symbol;
        private final long qty;
        private final List<String> deskTags;

        PositionSnapshot(String symbol, long qty, List<String> deskTags) {
            this.symbol = symbol;
            this.qty = qty;
            this.deskTags = List.copyOf(deskTags);
        }

        List<String> tags() {
            return deskTags;
        }
    }

    public static void main(String[] args) {
        final String e =
                "encapsulate: private fields plus ctor validation keep invariants inside the object boundary.";
        final String i = "immutable: final references and copyOf snapshots stop post-construct surprise mutations.";
        final String a = "alias: returning internal mutable collections without copyOf shares heap arrays with callers.";
        System.out.println(e);
        System.out.println(i);
        System.out.println(a);
        List<String> raw = new ArrayList<>();
        raw.add("EU");
        PositionSnapshot snap = new PositionSnapshot("FX", 10L, raw);
        System.out.println("tags=" + snap.tags());
        raw.add("US");
        int afterMutate = snap.tags().size();
        System.out.println("size_after_caller_mutate=" + afterMutate);
        boolean hasEu = snap.tags().contains("EU");
        System.out.println("symbol_check=" + hasEu);
        System.out.println("done");
    }
}
