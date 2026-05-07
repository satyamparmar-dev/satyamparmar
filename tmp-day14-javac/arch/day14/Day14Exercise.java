package arch.day14;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Day 14 exercise: HashMap.merge aggregation + immutable snapshot surface.
 */
public class Day14Exercise {

    static final class TokenHistogram {
        private final Map<String, Integer> counts;

        private TokenHistogram(Map<String, Integer> counts) {
            this.counts = Collections.unmodifiableMap(new LinkedHashMap<>(counts));
        }

        static TokenHistogram compute(List<String> tokens) {
            Map<String, Integer> m = new LinkedHashMap<>();
            for (String t : tokens) {
                m.merge(t, 1, Integer::sum);
            }
            return new TokenHistogram(m);
        }

        int distinct() {
            return counts.size();
        }

        int totalTokens() {
            int sum = 0;
            for (int v : counts.values()) {
                sum += v;
            }
            return sum;
        }

        List<String> keysSnapshot() {
            return List.copyOf(counts.keySet());
        }

        String formatCounts() {
            StringBuilder sb = new StringBuilder();
            for (Map.Entry<String, Integer> e : counts.entrySet()) {
                sb.append(e.getKey()).append('=').append(e.getValue()).append(';');
            }
            return sb.toString();
        }
    }

    public static void main(String[] args) {
        final String a = "copyOf: List.copyOf exposes an unmodifiable snapshot decoupled from later mutations.";
        final String b = "merge: HashMap.merge combines values for duplicate keys on the aggregating thread.";
        final List<String> tokens = List.of("east", "west", "east", "north", "east");
        System.out.println(a);
        System.out.println(b);
        TokenHistogram hist = TokenHistogram.compute(new ArrayList<>(tokens));
        System.out.println("distinct=" + hist.distinct() + " total=" + hist.totalTokens());
        System.out.println("keys=" + hist.keysSnapshot());
        System.out.println("fmt=" + hist.formatCounts());
        System.out.println("done");
    }
}
