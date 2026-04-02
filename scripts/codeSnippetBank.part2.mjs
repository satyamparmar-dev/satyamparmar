/** Days 46–90 — topic-specific Code tab snippets */

function B(pkg, body) {
  return `package ${pkg};\n\n${body}`;
}

export const SNIPPETS_46_90 = {
  46: {
    basic: {
      description: 'Principal + GrantedAuthority model (Spring Security concepts in plain Java).',
      code: B(
        'arch.day46',
        `import java.util.*;

public class Day46Basic {
    interface Principal { String getName(); }
    record User(String name, Set<String> roles) implements Principal {
        public String getName() { return name; }
    }

    public static void main(String[] args) {
        Principal p = new User("ada", Set.of("USER", "ADMIN"));
        System.out.println(p.getName() + " roles=" + ((User)p).roles());
    }
}`,
      ),
      output: 'ada roles=[USER, ADMIN]\n',
    },
    intermediate: {
      description: 'Password hash verification sketch: never store plaintext; compare hash strings.',
      code: B(
        'arch.day46',
        `public class Day46Intermediate {
    static boolean matches(String raw, String bcryptLike) {
        return bcryptLike != null && !raw.isBlank() && bcryptLike.contains("$2a$");
    }

    public static void main(String[] args) {
        System.out.println(matches("secret", "$2a$10$xxxxxxxx"));
    }
}`,
      ),
      output: 'true\n',
    },
    advanced: {
      description: 'Filter chain: each filter returns 401/403 or passes to next (servlet filter idea).',
      code: B(
        'arch.day46',
        `import java.util.*;

public class Day46Advanced {
    interface Filter { Optional<Integer> apply(String auth); }

    public static void main(String[] args) {
        List<Filter> chain = List.of(
            a -> a == null || a.isBlank() ? Optional.of(401) : Optional.empty(),
            a -> !a.startsWith("Bearer ") ? Optional.of(400) : Optional.empty(),
            a -> Optional.of(200));
        String token = "Bearer abc";
        int code = 500;
        for (Filter f : chain) {
            Optional<Integer> o = f.apply(token);
            if (o.isPresent()) { code = o.get(); break; }
        }
        System.out.println(code);
    }
}`,
      ),
      output: '200\n',
    },
  },

  47: {
    basic: {
      description: 'OAuth2 roles: resource owner, client, authorization server, resource server.',
      code: B(
        'arch.day47',
        `public class Day47Basic {
    enum Role { OWNER, CLIENT, AS, RS }

    public static void main(String[] args) {
        System.out.println(Role.CLIENT + " requests token from " + Role.AS);
    }
}`,
      ),
      output: 'CLIENT requests token from AS\n',
    },
    intermediate: {
      description: 'JWT three segments (header.payload.sig) separated by dots — parse parts.',
      code: B(
        'arch.day47',
        `public class Day47Intermediate {
    public static void main(String[] args) {
        String jwt = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1MSJ9.sig";
        String[] p = jwt.split("\\\\.");
        System.out.println("parts=" + p.length);
    }
}`,
      ),
      output: 'parts=3\n',
    },
    advanced: {
      description: 'Scope check: token must contain required scope for the operation.',
      code: B(
        'arch.day47',
        `import java.util.*;

public class Day47Advanced {
    public static void main(String[] args) {
        Set<String> tokenScopes = Set.of("read:profile", "write:orders");
        boolean canWrite = tokenScopes.contains("write:orders");
        System.out.println(canWrite);
    }
}`,
      ),
      output: 'true\n',
    },
  },

  48: {
    basic: {
      description: 'Publisher/Subscriber push model — core of reactive streams (conceptual).',
      code: B(
        'arch.day48',
        `import java.util.concurrent.*;

public class Day48Basic {
    interface Pub { void subscribe(Sub s); }
    interface Sub { void onNext(String x); }

    public static void main(String[] args) {
        Pub p = sub -> sub.onNext("event");
        p.subscribe(x -> System.out.println(x));
    }
}`,
      ),
      output: 'event\n',
    },
    intermediate: {
      description: 'Backpressure idea: bounded queue drops or blocks when producer is faster.',
      code: B(
        'arch.day48',
        `import java.util.concurrent.*;

public class Day48Intermediate {
    public static void main(String[] args) throws Exception {
        ArrayBlockingQueue<Integer> q = new ArrayBlockingQueue<>(2);
        q.put(1);
        q.put(2);
        System.out.println("size=" + q.size());
    }
}`,
      ),
      output: 'size=2\n',
    },
    advanced: {
      description: 'Mono-style lazy supplier: value computed once on subscribe.',
      code: B(
        'arch.day48',
        `import java.util.function.*;

public class Day48Advanced {
    static <T> Supplier<T> lazy(Supplier<T> s) {
        return new Supplier<>() {
            T cache;
            boolean done;
            public T get() {
                if (!done) { cache = s.get(); done = true; }
                return cache;
            }
        };
    }

    public static void main(String[] args) {
        Supplier<String> once = lazy(() -> {
            System.out.println("compute");
            return "x";
        });
        System.out.println(once.get() + once.get());
    }
}`,
      ),
      output: 'compute\nxx\n',
    },
  },

  49: {
    basic: {
      description: 'Resource naming: plural nouns, stable IDs in paths (/users/{id}).',
      code: B(
        'arch.day49',
        `public class Day49Basic {
    public static void main(String[] args) {
        String base = "https://api.example.com";
        long userId = 42L;
        System.out.println(base + "/users/" + userId + "/orders");
    }
}`,
      ),
      output: 'https://api.example.com/users/42/orders\n',
    },
    intermediate: {
      description: 'Idempotency-Key header: duplicate POST retries should not double-charge.',
      code: B(
        'arch.day49',
        `import java.util.*;

public class Day49Intermediate {
    public static void main(String[] args) {
        Map<String, String> seen = new HashMap<>();
        String key = "pay-123";
        if (seen.putIfAbsent(key, "ok") == null) {
            System.out.println("processed");
        } else {
            System.out.println("duplicate");
        }
    }
}`,
      ),
      output: 'processed\n',
    },
    advanced: {
      description: 'HATEOAS-style links map: response includes next actions.',
      code: B(
        'arch.day49',
        `import java.util.*;

public class Day49Advanced {
    public static void main(String[] args) {
        Map<String, String> links = Map.of(
            "self", "/orders/1",
            "cancel", "/orders/1/cancel");
        System.out.println(links);
    }
}`,
      ),
      output: '{self=/orders/1, cancel=/orders/1/cancel}\n',
    },
  },

  50: {
    basic: {
      description: 'OpenAPI-style schema: object with required fields list.',
      code: B(
        'arch.day50',
        `import java.util.*;

public class Day50Basic {
    public static void main(String[] args) {
        Map<String, Object> schema = Map.of(
            "type", "object",
            "required", List.of("email", "age"));
        System.out.println(schema.get("required"));
    }
}`,
      ),
      output: '[email, age]\n',
    },
    intermediate: {
      description: 'Response code choice: 201 + Location header after create.',
      code: B(
        'arch.day50',
        `public class Day50Intermediate {
    record Response(int status, String location) {}

    public static void main(String[] args) {
        Response r = new Response(201, "/users/7");
        System.out.println(r.status + " " + r.location);
    }
}`,
      ),
      output: '201 /users/7\n',
    },
    advanced: {
      description: 'Pagination: limit/offset query parameters with validation.',
      code: B(
        'arch.day50',
        `public class Day50Advanced {
    static String page(int limit, int offset) {
        if (limit <= 0 || limit > 100) throw new IllegalArgumentException("limit");
        if (offset < 0) throw new IllegalArgumentException("offset");
        return "limit=" + limit + "&offset=" + offset;
    }

    public static void main(String[] args) {
        System.out.println(page(20, 40));
    }
}`,
      ),
      output: 'limit=20&offset=40\n',
    },
  },

  51: {
    basic: {
      description: 'DDD: aggregate root wraps invariants; only root is referenced externally.',
      code: B(
        'arch.day51',
        `import java.util.*;

public class Day51Basic {
    static class Order {
        private final List<String> lines = new ArrayList<>();
        void addLine(String sku) {
            if (sku == null || sku.isBlank()) throw new IllegalArgumentException();
            lines.add(sku);
        }
        int size() { return lines.size(); }
    }

    public static void main(String[] args) {
        Order o = new Order();
        o.addLine("A");
        System.out.println(o.size());
    }
}`,
      ),
      output: '1\n',
    },
    intermediate: {
      description: 'Bounded context: separate modules with explicit anti-corruption translation.',
      code: B(
        'arch.day51',
        `public class Day51Intermediate {
    record LegacyId(String v) {}
    record DomainId(String v) {}

    static DomainId translate(LegacyId id) { return new DomainId("D-" + id.v()); }

    public static void main(String[] args) {
        System.out.println(translate(new LegacyId("99")));
    }
}`,
      ),
      output: 'DomainId[v=D-99]\n',
    },
    advanced: {
      description: 'Domain event: immutable past fact emitted after state change.',
      code: B(
        'arch.day51',
        `import java.time.*;

public class Day51Advanced {
    record OrderPlaced(String orderId, Instant at) {}

    public static void main(String[] args) {
        System.out.println(new OrderPlaced("o1", Instant.parse("2024-01-01T00:00:00Z")));
    }
}`,
      ),
      output: 'OrderPlaced[orderId=o1, at=2024-01-01T00:00:00Z]\n',
    },
  },

  52: {
    basic: {
      description: 'Service registry: name -> list of host:port instances.',
      code: B(
        'arch.day52',
        `import java.util.*;

public class Day52Basic {
    public static void main(String[] args) {
        Map<String, List<String>> reg = new HashMap<>();
        reg.put("payments", List.of("10.0.0.1:8081", "10.0.0.2:8081"));
        System.out.println(reg.get("payments").get(0));
    }
}`,
      ),
      output: '10.0.0.1:8081\n',
    },
    intermediate: {
      description: 'Round-robin pick next instance from a list.',
      code: B(
        'arch.day52',
        `import java.util.*;
import java.util.concurrent.atomic.*;

public class Day52Intermediate {
    public static void main(String[] args) {
        List<String> nodes = List.of("a", "b", "c");
        AtomicInteger i = new AtomicInteger();
        for (int k = 0; k < 5; k++) {
            String n = nodes.get(Math.floorMod(i.getAndIncrement(), nodes.size()));
            System.out.print(n + " ");
        }
        System.out.println();
    }
}`,
      ),
      output: 'a b c a b \n',
    },
    advanced: {
      description: 'API Gateway routes: path prefix -> downstream service name.',
      code: B(
        'arch.day52',
        `import java.util.*;

public class Day52Advanced {
    public static void main(String[] args) {
        Map<String, String> routes = Map.of(
            "/pay", "payments",
            "/acct", "accounts");
        System.out.println(routes.get("/pay"));
    }
}`,
      ),
      output: 'payments\n',
    },
  },

  53: {
    basic: {
      description: 'HTTP GET with HttpClient (Java 11+) — WebClient/Feign build on same idea.',
      code: B(
        'arch.day53',
        `import java.net.URI;
import java.net.http.*;

public class Day53Basic {
    public static void main(String[] args) throws Exception {
        HttpClient c = HttpClient.newHttpClient();
        HttpRequest req = HttpRequest.newBuilder(URI.create("https://httpbin.org/get")).GET().build();
        HttpResponse<String> res = c.send(req, HttpResponse.BodyHandlers.ofString());
        System.out.println(res.statusCode());
    }
}`,
      ),
      output: '200\n',
    },
    intermediate: {
      description: 'Retry with exponential backoff on 503.',
      code: B(
        'arch.day53',
        `public class Day53Intermediate {
    static int attempt = 0;
    static int call() {
        attempt++;
        return attempt < 3 ? 503 : 200;
    }

    public static void main(String[] args) throws Exception {
        int code;
        int delay = 10;
        do {
            code = call();
            if (code == 503) Thread.sleep(delay);
            delay *= 2;
        } while (code == 503);
        System.out.println(code);
    }
}`,
      ),
      output: '200\n',
    },
    advanced: {
      description: 'Circuit breaker states: CLOSED -> OPEN after failures, half-open probe.',
      code: B(
        'arch.day53',
        `public class Day53Advanced {
    enum State { CLOSED, OPEN }
    static int failures = 0;
    static State st = State.CLOSED;

    static String invoke() {
        if (st == State.OPEN) return "fast-fail";
        failures++;
        if (failures >= 3) st = State.OPEN;
        return "ok";
    }

    public static void main(String[] args) {
        for (int i = 0; i < 5; i++) System.out.println(invoke());
    }
}`,
      ),
      output: 'ok\nok\nok\nfast-fail\nfast-fail\n',
    },
  },

  54: {
    basic: {
      description: 'gRPC: protobuf-style IDL compiles to stubs; here we show a simple request message record.',
      code: B(
        'arch.day54',
        `public class Day54Basic {
    record SearchRequest(String query, int page) {}

    public static void main(String[] args) {
        System.out.println(new SearchRequest("java", 1));
    }
}`,
      ),
      output: 'SearchRequest[query=java, page=1]\n',
    },
    intermediate: {
      description: 'GraphQL: single endpoint; query selects fields (simulated as map).',
      code: B(
        'arch.day54',
        `import java.util.*;

public class Day54Intermediate {
    public static void main(String[] args) {
        Map<String, Object> user = Map.of("id", 1, "name", "Ada", "email", "a@b.com");
        List<String> fields = List.of("id", "name");
        for (String f : fields) System.out.println(f + "=" + user.get(f));
    }
}`,
      ),
      output: 'id=1\nname=Ada\n',
    },
    advanced: {
      description: 'IDL versioning: add optional field with default for old clients.',
      code: B(
        'arch.day54',
        `public class Day54Advanced {
    record UserV1(String name) {}
    record UserV2(String name, String locale) {
        UserV2 { locale = locale == null ? "en" : locale; }
    }

    public static void main(String[] args) {
        System.out.println(new UserV2("Bo", null));
    }
}`,
      ),
      output: 'UserV2[name=Bo, locale=en]\n',
    },
  },

  55: {
    basic: {
      description: 'Sync vs async: blocking call vs CompletableFuture for inter-service.',
      code: B(
        'arch.day55',
        `import java.util.concurrent.*;

public class Day55Basic {
    public static void main(String[] args) throws Exception {
        String sync = "data";
        CompletableFuture<String> async = CompletableFuture.completedFuture("data");
        System.out.println(sync.equals(async.get()));
    }
}`,
      ),
      output: 'true\n',
    },
    intermediate: {
      description: 'Fan-out parallel calls then combine (scatter-gather).',
      code: B(
        'arch.day55',
        `import java.util.concurrent.*;

public class Day55Intermediate {
    public static void main(String[] args) throws Exception {
        CompletableFuture<Integer> a = CompletableFuture.supplyAsync(() -> 10);
        CompletableFuture<Integer> b = CompletableFuture.supplyAsync(() -> 20);
        System.out.println(a.get() + b.get());
    }
}`,
      ),
      output: '30\n',
    },
    advanced: {
      description: 'Timeout on external dependency: orElseThrow after delay.',
      code: B(
        'arch.day55',
        `import java.util.concurrent.*;

public class Day55Advanced {
    public static void main(String[] args) throws Exception {
        CompletableFuture<String> f = new CompletableFuture<>();
        ScheduledExecutorService ex = Executors.newSingleThreadScheduledExecutor();
        ex.schedule(() -> f.complete("late"), 50, TimeUnit.MILLISECONDS);
        try {
            System.out.println(f.get(10, TimeUnit.MILLISECONDS));
        } catch (TimeoutException e) {
            System.out.println("timeout");
        }
        ex.shutdown();
    }
}`,
      ),
      output: 'timeout\n',
    },
  },

  56: {
    basic: {
      description: 'Saga steps: each has compensating action for rollback.',
      code: B(
        'arch.day56',
        `import java.util.*;

public class Day56Basic {
    public static void main(String[] args) {
        List<String> forward = List.of("reserve", "charge", "ship");
        List<String> compensate = List.of("unship", "refund", "release");
        Collections.reverse(compensate);
        System.out.println(compensate);
    }
}`,
      ),
      output: '[release, refund, unship]\n',
    },
    intermediate: {
      description: '2PC sketch: prepare phase all vote commit or abort.',
      code: B(
        'arch.day56',
        `import java.util.*;

public class Day56Intermediate {
    public static void main(String[] args) {
        List<Boolean> votes = List.of(true, true, false);
        boolean commit = votes.stream().allMatch(Boolean::booleanValue);
        System.out.println(commit ? "COMMIT" : "ABORT");
    }
}`,
      ),
      output: 'ABORT\n',
    },
    advanced: {
      description: 'Outbox pattern: write business row + outbox event in same DB transaction.',
      code: B(
        'arch.day56',
        `import java.util.*;

public class Day56Advanced {
    public static void main(String[] args) {
        List<String> tx = new ArrayList<>();
        tx.add("INSERT order");
        tx.add("INSERT outbox(event)");
        System.out.println(tx);
    }
}`,
      ),
      output: '[INSERT order, INSERT outbox(event)]\n',
    },
  },

  57: {
    basic: {
      description: 'CQRS: separate command to write model vs query from read model.',
      code: B(
        'arch.day57',
        `public class Day57Basic {
    record PlaceOrder(String id) {}
    record OrderView(String id, String status) {}

    public static void main(String[] args) {
        System.out.println(new OrderView("1", "PLACED"));
    }
}`,
      ),
      output: 'OrderView[id=1, status=PLACED]\n',
    },
    intermediate: {
      description: 'Event store append-only log: each revision increments version.',
      code: B(
        'arch.day57',
        `import java.util.*;

public class Day57Intermediate {
    public static void main(String[] args) {
        List<String> events = new ArrayList<>();
        events.add("Created");
        events.add("Paid");
        System.out.println(events.size());
    }
}`,
      ),
      output: '2\n',
    },
    advanced: {
      description: 'Projection rebuild: replay events to build read model.',
      code: B(
        'arch.day57',
        `import java.util.*;

public class Day57Advanced {
    public static void main(String[] args) {
        List<String> ev = List.of("+100", "-30", "+5");
        int balance = 0;
        for (String e : ev) balance += Integer.parseInt(e);
        System.out.println(balance);
    }
}`,
      ),
      output: '75\n',
    },
  },

  58: {
    basic: {
      description: 'Strangler fig: route increasing traffic to new implementation by percentage.',
      code: B(
        'arch.day58',
        `public class Day58Basic {
    public static void main(String[] args) {
        int percentToNew = 30;
        int bucket = 42 % 100;
        boolean useNew = bucket < percentToNew;
        System.out.println(useNew);
    }
}`,
      ),
      output: 'false\n',
    },
    intermediate: {
      description: 'Bulkhead: separate thread pools so one slow dependency does not starve all.',
      code: B(
        'arch.day58',
        `import java.util.concurrent.*;

public class Day58Intermediate {
    public static void main(String[] args) {
        ExecutorService pay = Executors.newFixedThreadPool(4);
        ExecutorService inv = Executors.newFixedThreadPool(4);
        System.out.println(pay != inv);
        pay.shutdown();
        inv.shutdown();
    }
}`,
      ),
      output: 'true\n',
    },
    advanced: {
      description: 'Sidecar pattern: auxiliary process alongside main (logging/mTLS) — two lifecycles.',
      code: B(
        'arch.day58',
        `public class Day58Advanced {
    static class MainApp { String run() { return "app"; } }
    static class Sidecar { String observe() { return "proxy"; } }

    public static void main(String[] args) {
        System.out.println(new MainApp().run() + "+" + new Sidecar().observe());
    }
}`,
      ),
      output: 'app+proxy\n',
    },
  },

  59: {
    basic: {
      description: 'Kafka topic = ordered log; partition = unit of parallelism.',
      code: B(
        'arch.day59',
        `public class Day59Basic {
    public static void main(String[] args) {
        String topic = "orders";
        int partitions = 12;
        System.out.println(topic + " p=" + partitions);
    }
}`,
      ),
      output: 'orders p=12\n',
    },
    intermediate: {
      description: 'Key-based partition: same key goes to same partition for ordering.',
      code: B(
        'arch.day59',
        `public class Day59Intermediate {
    static int partitionFor(String key, int numParts) {
        return Math.floorMod(key.hashCode(), numParts);
    }

    public static void main(String[] args) {
        System.out.println(partitionFor("user-7", 8));
    }
}`,
      ),
      output: '(depends on hash)\n',
    },
    advanced: {
      description: 'Consumer group: partitions assigned across members — rebalance on join/leave.',
      code: B(
        'arch.day59',
        `import java.util.*;

public class Day59Advanced {
    public static void main(String[] args) {
        int partitions = 6;
        List<String> members = List.of("c1", "c2", "c3");
        for (int p = 0; p < partitions; p++) {
            String m = members.get(p % members.size());
            System.out.println("p" + p + "->" + m);
        }
    }
}`,
      ),
      output: 'p0->c1\np1->c2\np2->c3\np3->c1\np4->c2\np5->c3\n',
    },
  },

  60: {
    basic: {
      description: 'Producer batching: accumulate records before send to improve throughput.',
      code: B(
        'arch.day60',
        `import java.util.*;

public class Day60Basic {
    public static void main(String[] args) {
        List<String> batch = new ArrayList<>();
        for (int i = 0; i < 5; i++) batch.add("m" + i);
        System.out.println("send " + batch.size());
    }
}`,
      ),
      output: 'send 5\n',
    },
    intermediate: {
      description: 'Idempotent producer: sequence numbers detect duplicates.',
      code: B(
        'arch.day60',
        `import java.util.concurrent.atomic.*;

public class Day60Intermediate {
    public static void main(String[] args) {
        AtomicLong seq = new AtomicLong();
        System.out.println(seq.incrementAndGet());
        System.out.println(seq.incrementAndGet());
    }
}`,
      ),
      output: '1\n2\n',
    },
    advanced: {
      description: 'Compression trade-off: smaller network vs CPU — config flag.',
      code: B(
        'arch.day60',
        `public class Day60Advanced {
    public static void main(String[] args) {
        String compression = "lz4";
        boolean enabled = !"none".equals(compression);
        System.out.println(enabled);
    }
}`,
      ),
      output: 'true\n',
    },
  },

  61: {
    basic: {
      description: 'Consumer offset: commit after processing to avoid data loss on crash.',
      code: B(
        'arch.day61',
        `public class Day61Basic {
    public static void main(String[] args) {
        long processedOffset = 100L;
        long commitOffset = processedOffset + 1;
        System.out.println(commitOffset);
    }
}`,
      ),
      output: '101\n',
    },
    intermediate: {
      description: 'At-least-once: duplicate delivery possible — make handler idempotent.',
      code: B(
        'arch.day61',
        `import java.util.*;

public class Day61Intermediate {
    public static void main(String[] args) {
        Set<String> seen = new HashSet<>();
        List<String> msgs = List.of("id1", "id1", "id2");
        for (String m : msgs) {
            if (seen.add(m)) System.out.println("apply " + m);
        }
    }
}`,
      ),
      output: 'apply id1\napply id2\n',
    },
    advanced: {
      description: 'Consumer lag: high-water offset minus current position.',
      code: B(
        'arch.day61',
        `public class Day61Advanced {
    public static void main(String[] args) {
        long hw = 1000L, pos = 970L;
        System.out.println("lag=" + (hw - pos));
    }
}`,
      ),
      output: 'lag=30\n',
    },
  },

  62: {
    basic: {
      description: 'Delivery semantics: at-most-once vs at-least-once vs exactly-once (EOS).',
      code: B(
        'arch.day62',
        `public class Day62Basic {
    enum Sem { ATMOST, ATLEAST, EXACTLY }

    public static void main(String[] args) {
        System.out.println(Sem.EXACTLY);
    }
}`,
      ),
      output: 'EXACTLY\n',
    },
    intermediate: {
      description: 'Transactional id + epoch for EOS with Kafka (conceptual fields).',
      code: B(
        'arch.day62',
        `public class Day62Intermediate {
    public static void main(String[] args) {
        String txnId = "p42-1";
        long epoch = 7L;
        System.out.println(txnId + "@" + epoch);
    }
}`,
      ),
      output: 'p42-1@7\n',
    },
    advanced: {
      description: 'End-to-end idempotency key spanning producer and consumer.',
      code: B(
        'arch.day62',
        `import java.util.*;

public class Day62Advanced {
    public static void main(String[] args) {
        Map<String, Boolean> done = new HashMap<>();
        String key = "pay-99";
        System.out.println(done.putIfAbsent(key, true) == null);
        System.out.println(done.putIfAbsent(key, true) == null);
    }
}`,
      ),
      output: 'true\nfalse\n',
    },
  },

  63: {
    basic: {
      description: 'Kafka Streams: KStream map/filter/stateful operations on changelog.',
      code: B(
        'arch.day63',
        `import java.util.stream.*;

public class Day63Basic {
    public static void main(String[] args) {
        Stream.of("a", "bb", "ccc").map(String::length).forEach(System.out::println);
    }
}`,
      ),
      output: '1\n2\n3\n',
    },
    intermediate: {
      description: 'Windowed aggregation: tumbling window by time bucket.',
      code: B(
        'arch.day63',
        `import java.util.*;

public class Day63Intermediate {
    public static void main(String[] args) {
        long eventTime = 3_600_000L;
        long windowSize = 1_000L;
        long bucket = eventTime / windowSize;
        System.out.println(bucket);
    }
}`,
      ),
      output: '3600\n',
    },
    advanced: {
      description: 'Join two streams by key within time window (sketch).',
      code: B(
        'arch.day63',
        `import java.util.*;

public class Day63Advanced {
    public static void main(String[] args) {
        Map<String, String> left = Map.of("k1", "L");
        Map<String, String> right = Map.of("k1", "R");
        for (String k : left.keySet()) {
            if (right.containsKey(k)) System.out.println(k + "=" + left.get(k) + right.get(k));
        }
    }
}`,
      ),
      output: 'k1=LR\n',
    },
  },

  64: {
    basic: {
      description: 'Schema evolution: add field with default; Avro/Protobuf compatibility rules.',
      code: B(
        'arch.day64',
        `public class Day64Basic {
    record V1(int id) {}
    record V2(int id, String name) {
        V2(int id) { this(id, "unknown"); }
    }

    public static void main(String[] args) {
        System.out.println(new V2(1));
    }
}`,
      ),
      output: 'V2[id=1, name=unknown]\n',
    },
    intermediate: {
      description: 'Schema Registry subject naming: topic-value vs topic-key.',
      code: B(
        'arch.day64',
        `public class Day64Intermediate {
    public static void main(String[] args) {
        String topic = "orders";
        System.out.println(topic + "-value");
    }
}`,
      ),
      output: 'orders-value\n',
    },
    advanced: {
      description: 'Kafka Connect: source connector polls DB; sink connector writes to store.',
      code: B(
        'arch.day64',
        `public class Day64Advanced {
    enum Mode { SOURCE, SINK }

    public static void main(String[] args) {
        System.out.println(Mode.SOURCE + "->" + Mode.SINK);
    }
}`,
      ),
      output: 'SOURCE->SINK\n',
    },
  },

  65: {
    basic: {
      description: '@KafkaListener method signature: topic + groupId (Spring Kafka idea).',
      code: B(
        'arch.day65',
        `public class Day65Basic {
    public static void main(String[] args) {
        String topic = "orders";
        String group = "order-service";
        System.out.println(topic + " " + group);
    }
}`,
      ),
      output: 'orders order-service\n',
    },
    intermediate: {
      description: 'Error handler: send to DLT after N failures.',
      code: B(
        'arch.day65',
        `public class Day65Intermediate {
    public static void main(String[] args) {
        int failures = 0, max = 3;
        while (failures < max) {
            failures++;
        }
        System.out.println("DLT");
    }
}`,
      ),
      output: 'DLT\n',
    },
    advanced: {
      description: 'Manual ack: commit offset only after downstream DB commit.',
      code: B(
        'arch.day65',
        `public class Day65Advanced {
    public static void main(String[] args) {
        boolean dbOk = true;
        boolean acked = false;
        if (dbOk) acked = true;
        System.out.println(acked);
    }
}`,
      ),
      output: 'true\n',
    },
  },

  66: {
    basic: {
      description: 'RabbitMQ queue routing key vs Kafka partition — different models.',
      code: B(
        'arch.day66',
        `public class Day66Basic {
    public static void main(String[] args) {
        String exchange = "orders.topic";
        String routingKey = "order.created";
        System.out.println(exchange + " " + routingKey);
    }
}`,
      ),
      output: 'orders.topic order.created\n',
    },
    intermediate: {
      description: 'SQS-style visibility timeout: message invisible while consumer processes.',
      code: B(
        'arch.day66',
        `public class Day66Intermediate {
    public static void main(String[] args) {
        int visibilitySec = 30;
        System.out.println("lease=" + visibilitySec + "s");
    }
}`,
      ),
      output: 'lease=30s\n',
    },
    advanced: {
      description: 'Fan-out SNS + SQS subscriptions: one event many queues.',
      code: B(
        'arch.day66',
        `import java.util.*;

public class Day66Advanced {
    public static void main(String[] args) {
        List<String> subs = List.of("q-a", "q-b", "q-c");
        System.out.println(subs.size());
    }
}`,
      ),
      output: '3\n',
    },
  },

  67: {
    basic: {
      description: 'CAP reminder: partition tolerance forces C vs A choice during network split.',
      code: B(
        'arch.day67',
        `public class Day67Basic {
    public static void main(String[] args) {
        System.out.println("CP vs AP trade-off during partition");
    }
}`,
      ),
      output: 'CP vs AP trade-off during partition\n',
    },
    intermediate: {
      description: 'Quorum: majority votes for leader election (Raft idea).',
      code: B(
        'arch.day67',
        `public class Day67Intermediate {
    public static void main(String[] args) {
        int nodes = 5;
        int quorum = nodes / 2 + 1;
        System.out.println(quorum);
    }
}`,
      ),
      output: '3\n',
    },
    advanced: {
      description: 'Vector clocks: (node,counter) pairs detect concurrent updates (simplified).',
      code: B(
        'arch.day67',
        `import java.util.*;

public class Day67Advanced {
    public static void main(String[] args) {
        Map<String, Integer> vc = new HashMap<>();
        vc.merge("a", 1, Integer::sum);
        vc.merge("b", 1, Integer::sum);
        System.out.println(vc);
    }
}`,
      ),
      output: '{a=1, b=1}\n',
    },
  },

  68: {
    basic: {
      description: 'SQL JOIN: combine rows matching key relationship.',
      code: B(
        'arch.day68',
        `public class Day68Basic {
    public static void main(String[] args) {
        System.out.println("SELECT u.name, o.id FROM users u JOIN orders o ON u.id = o.user_id");
    }
}`,
      ),
      output: 'SELECT u.name, o.id FROM users u JOIN orders o ON u.id = o.user_id\n',
    },
    intermediate: {
      description: 'Index seek vs full table scan: explain plan awareness.',
      code: B(
        'arch.day68',
        `public class Day68Intermediate {
    public static void main(String[] args) {
        boolean indexOnUserId = true;
        System.out.println(indexOnUserId ? "seek" : "seq");
    }
}`,
      ),
      output: 'seek\n',
    },
    advanced: {
      description: 'Window function ROW_NUMBER for deduplicating latest row per group.',
      code: B(
        'arch.day68',
        `public class Day68Advanced {
    public static void main(String[] args) {
        System.out.println("ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC)");
    }
}`,
      ),
      output: 'ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC)\n',
    },
  },

  69: {
    basic: {
      description: 'ACID: transaction commits all statements or rolls back.',
      code: B(
        'arch.day69',
        `public class Day69Basic {
    public static void main(String[] args) {
        System.out.println("BEGIN; INSERT; UPDATE; COMMIT;");
    }
}`,
      ),
      output: 'BEGIN; INSERT; UPDATE; COMMIT;\n',
    },
    intermediate: {
      description: 'Connection pool: reuse TCP connections instead of per-request connect.',
      code: B(
        'arch.day69',
        `public class Day69Intermediate {
    static class Pool {
        int free = 10;
        String borrow() { return free-- > 0 ? "conn" : null; }
    }

    public static void main(String[] args) {
        Pool p = new Pool();
        System.out.println(p.borrow());
    }
}`,
      ),
      output: 'conn\n',
    },
    advanced: {
      description: 'Isolation levels: READ_COMMITTED vs REPEATABLE_READ phantom reads.',
      code: B(
        'arch.day69',
        `public class Day69Advanced {
    enum Iso { RC, RR, SERIALIZABLE }

    public static void main(String[] args) {
        System.out.println(Iso.RR);
    }
}`,
      ),
      output: 'RR\n',
    },
  },

  70: {
    basic: {
      description: 'Document vs wide-column: nested JSON vs partition key + clustering.',
      code: B(
        'arch.day70',
        `public class Day70Basic {
    public static void main(String[] args) {
        System.out.println("MongoDB: flexible schema; Cassandra: partition key design critical");
    }
}`,
      ),
      output: 'MongoDB: flexible schema; Cassandra: partition key design critical\n',
    },
    intermediate: {
      description: 'Cassandra token ring: partition key hashed to token for replica placement.',
      code: B(
        'arch.day70',
        `public class Day70Intermediate {
    public static void main(String[] args) {
        String pk = "user-42";
        int token = Math.floorMod(pk.hashCode(), 128);
        System.out.println(token);
    }
}`,
      ),
      output: '(depends on hash)\n',
    },
    advanced: {
      description: 'MongoDB aggregation pipeline stages: $match, $group, $sort.',
      code: B(
        'arch.day70',
        `import java.util.*;

public class Day70Advanced {
    public static void main(String[] args) {
        List<String> pipe = List.of("$match", "$group", "$sort");
        System.out.println(pipe);
    }
}`,
      ),
      output: '[$match, $group, $sort]\n',
    },
  },

  71: {
    basic: {
      description: 'Redis GET/SET strings; TTL for cache expiry.',
      code: B(
        'arch.day71',
        `import java.util.*;

public class Day71Basic {
    public static void main(String[] args) {
        Map<String, String> redis = new HashMap<>();
        redis.put("session:1", "token");
        System.out.println(redis.get("session:1"));
    }
}`,
      ),
      output: 'token\n',
    },
    intermediate: {
      description: 'Cache-aside: read cache miss -> load DB -> populate cache.',
      code: B(
        'arch.day71',
        `import java.util.*;

public class Day71Intermediate {
    public static void main(String[] args) {
        Map<String, String> cache = new HashMap<>();
        String key = "u:1";
        String v = cache.get(key);
        if (v == null) {
            v = "from-db";
            cache.put(key, v);
        }
        System.out.println(v);
    }
}`,
      ),
      output: 'from-db\n',
    },
    advanced: {
      description: 'Lua script for compare-and-set atomicity in Redis (simulated).',
      code: B(
        'arch.day71',
        `import java.util.concurrent.atomic.*;

public class Day71Advanced {
    public static void main(String[] args) {
        AtomicInteger x = new AtomicInteger(5);
        int expect = 5, update = 6;
        System.out.println(x.compareAndSet(expect, update));
    }
}`,
      ),
      output: 'true\n',
    },
  },

  72: {
    basic: {
      description: 'Dockerfile stages: slim JRE image + copied fat JAR.',
      code: B(
        'arch.day72',
        `public class Day72Basic {
    public static void main(String[] args) {
        System.out.println("FROM eclipse-temurin:17-jre\\nCOPY app.jar /app.jar");
    }
}`,
      ),
      output: 'FROM eclipse-temurin:17-jre\nCOPY app.jar /app.jar\n',
    },
    intermediate: {
      description: 'Multi-stage build: compile in JDK image, run in JRE-only image.',
      code: B(
        'arch.day72',
        `public class Day72Intermediate {
    public static void main(String[] args) {
        System.out.println("stage build -> stage runtime");
    }
}`,
      ),
      output: 'stage build -> stage runtime\n',
    },
    advanced: {
      description: 'JAVA_TOOL_OPTIONS / container memory limits — JVM must respect cgroup.',
      code: B(
        'arch.day72',
        `public class Day72Advanced {
    public static void main(String[] args) {
        System.out.println("-XX:MaxRAMPercentage=75.0");
    }
}`,
      ),
      output: '-XX:MaxRAMPercentage=75.0\n',
    },
  },

  73: {
    basic: {
      description: 'Pod = one-or-more containers sharing network namespace.',
      code: B(
        'arch.day73',
        `public class Day73Basic {
    public static void main(String[] args) {
        System.out.println("Pod: app container + sidecar");
    }
}`,
      ),
      output: 'Pod: app container + sidecar\n',
    },
    intermediate: {
      description: 'Deployment desired replicas vs actual status.',
      code: B(
        'arch.day73',
        `public class Day73Intermediate {
    public static void main(String[] args) {
        int desired = 3, ready = 2;
        System.out.println("ready=" + ready + "/" + desired);
    }
}`,
      ),
      output: 'ready=2/3\n',
    },
    advanced: {
      description: 'Liveness vs readiness probes: restart unhealthy vs remove from Service endpoints.',
      code: B(
        'arch.day73',
        `public class Day73Advanced {
    public static void main(String[] args) {
        boolean live = true, ready = false;
        System.out.println("live=" + live + " ready=" + ready);
    }
}`,
      ),
      output: 'live=true ready=false\n',
    },
  },

  74: {
    basic: {
      description: 'Helm values.yaml overrides chart defaults for environment.',
      code: B(
        'arch.day74',
        `import java.util.*;

public class Day74Basic {
    public static void main(String[] args) {
        Map<String, String> defaults = Map.of("replicas", "1");
        Map<String, String> env = new HashMap<>(defaults);
        env.put("replicas", "3");
        System.out.println(env.get("replicas"));
    }
}`,
      ),
      output: '3\n',
    },
    intermediate: {
      description: 'Rolling update: maxUnavailable / maxSurge tuning.',
      code: B(
        'arch.day74',
        `public class Day74Intermediate {
    public static void main(String[] args) {
        int maxSurge = 1, maxUnavail = 0;
        System.out.println(maxSurge + "/" + maxUnavail);
    }
}`,
      ),
      output: '1/0\n',
    },
    advanced: {
      description: 'Helm hook: pre-install Job for DB migration.',
      code: B(
        'arch.day74',
        `public class Day74Advanced {
    public static void main(String[] args) {
        System.out.println("helm.sh/hook: pre-install");
    }
}`,
      ),
      output: 'helm.sh/hook: pre-install\n',
    },
  },

  75: {
    basic: {
      description: 'AWS SDK region selection: same API, different endpoint.',
      code: B(
        'arch.day75',
        `public class Day75Basic {
    public static void main(String[] args) {
        String region = "eu-west-1";
        System.out.println("s3." + region + ".amazonaws.com");
    }
}`,
      ),
      output: 's3.eu-west-1.amazonaws.com\n',
    },
    intermediate: {
      description: 'IAM role for service account: short-lived creds vs static keys.',
      code: B(
        'arch.day75',
        `public class Day75Intermediate {
    public static void main(String[] args) {
        System.out.println("AssumeRoleWithWebIdentity -> temp creds");
    }
}`,
      ),
      output: 'AssumeRoleWithWebIdentity -> temp creds\n',
    },
    advanced: {
      description: 'S3 pre-signed URL: time-limited GET without exposing bucket keys.',
      code: B(
        'arch.day75',
        `public class Day75Advanced {
    public static void main(String[] args) {
        long exp = System.currentTimeMillis() / 1000 + 300;
        System.out.println("sig&Expires=" + exp);
    }
}`,
      ),
      output: '(sig&Expires=...)\n',
    },
  },

  76: {
    basic: {
      description: 'CI pipeline stages: build -> test -> scan -> deploy.',
      code: B(
        'arch.day76',
        `import java.util.*;

public class Day76Basic {
    public static void main(String[] args) {
        List<String> stages = List.of("build", "test", "deploy");
        System.out.println(stages);
    }
}`,
      ),
      output: '[build, test, deploy]\n',
    },
    intermediate: {
      description: 'Structured logging JSON: traceId field for correlation.',
      code: B(
        'arch.day76',
        `public class Day76Intermediate {
    public static void main(String[] args) {
        String trace = "4bf92f3577b34da6";
        System.out.println("{\\"traceId\\":\\"" + trace + "\\"}");
    }
}`,
      ),
      output: '{"traceId":"4bf92f3577b34da6"}\n',
    },
    advanced: {
      description: 'RED metrics: rate, errors, duration for service health.',
      code: B(
        'arch.day76',
        `public class Day76Advanced {
    public static void main(String[] args) {
        double rps = 120, err = 0.5, p99ms = 45;
        System.out.println("rps=" + rps + " err%=" + err + " p99=" + p99ms + "ms");
    }
}`,
      ),
      output: 'rps=120.0 err%=0.5 p99=45.0ms\n',
    },
  },

  77: {
    basic: {
      description: 'Single Responsibility: one class, one reason to change.',
      code: B(
        'arch.day77',
        `public class Day77Basic {
    static class PriceCalculator {
        int cents(int qty, int unit) { return qty * unit; }
    }

    public static void main(String[] args) {
        System.out.println(new PriceCalculator().cents(3, 1000));
    }
}`,
      ),
      output: '3000\n',
    },
    intermediate: {
      description: 'Dependency Inversion: depend on PaymentGateway interface, not concrete PSP.',
      code: B(
        'arch.day77',
        `public class Day77Intermediate {
    interface PaymentGateway { String pay(int cents); }
    static class Stripe implements PaymentGateway {
        public String pay(int cents) { return "stripe:" + cents; }
    }

    public static void main(String[] args) {
        PaymentGateway pg = new Stripe();
        System.out.println(pg.pay(999));
    }
}`,
      ),
      output: 'stripe:999\n',
    },
    advanced: {
      description: 'Clean Architecture: domain core has no framework imports.',
      code: B(
        'arch.day77',
        `public class Day77Advanced {
    static class Order { /* pure domain */ }

    public static void main(String[] args) {
        System.out.println(new Order().getClass().getSimpleName());
    }
}`,
      ),
      output: 'Order\n',
    },
  },

  78: {
    basic: {
      description: 'Factory Method: subclass chooses which Product to instantiate.',
      code: B(
        'arch.day78',
        `public class Day78Basic {
    interface Product { String name(); }
    static class A implements Product { public String name() { return "A"; } }
    static class Factory { Product make() { return new A(); } }

    public static void main(String[] args) {
        System.out.println(new Factory().make().name());
    }
}`,
      ),
      output: 'A\n',
    },
    intermediate: {
      description: 'Singleton (use sparingly): one instance for shared config.',
      code: B(
        'arch.day78',
        `public class Day78Intermediate {
    static class Config {
        private static final Config INSTANCE = new Config();
        static Config get() { return INSTANCE; }
    }

    public static void main(String[] args) {
        System.out.println(Config.get() == Config.get());
    }
}`,
      ),
      output: 'true\n',
    },
    advanced: {
      description: 'Builder pattern: fluent construction of complex objects.',
      code: B(
        'arch.day78',
        `public class Day78Advanced {
    static class HttpReq {
        final String url;
        final String method;
        HttpReq(String u, String m) { url = u; method = m; }
        static class B {
            String u, m = "GET";
            B url(String x) { u = x; return this; }
            B method(String x) { m = x; return this; }
            HttpReq build() { return new HttpReq(u, m); }
        }
    }

    public static void main(String[] args) {
        HttpReq r = new HttpReq.B().url("/api").method("POST").build();
        System.out.println(r.method + " " + r.url);
    }
}`,
      ),
      output: 'POST /api\n',
    },
  },

  79: {
    basic: {
      description: 'Adapter: wrap legacy API to match Target interface.',
      code: B(
        'arch.day79',
        `public class Day79Basic {
    interface Target { int twice(int x); }
    static class Legacy { int mul2(int x) { return x * 2; } }
    static class Adp implements Target {
        Legacy l = new Legacy();
        public int twice(int x) { return l.mul2(x); }
    }

    public static void main(String[] args) {
        System.out.println(new Adp().twice(21));
    }
}`,
      ),
      output: '42\n',
    },
    intermediate: {
      description: 'Decorator: add logging without changing Core.',
      code: B(
        'arch.day79',
        `public class Day79Intermediate {
    interface Svc { String run(); }
    static class Core implements Svc { public String run() { return "x"; } }
    static class Log implements Svc {
        Svc s;
        Log(Svc s) { this.s = s; }
        public String run() { return "log:" + s.run(); }
    }

    public static void main(String[] args) {
        System.out.println(new Log(new Core()).run());
    }
}`,
      ),
      output: 'log:x\n',
    },
    advanced: {
      description: 'Composite: tree of nodes with uniform operation.',
      code: B(
        'arch.day79',
        `import java.util.*;

public class Day79Advanced {
    interface Node { int sum(); }
    record Leaf(int v) implements Node { public int sum() { return v; } }
    record Branch(List<Node> ch) implements Node {
        public int sum() { return ch.stream().mapToInt(Node::sum).sum(); }
    }

    public static void main(String[] args) {
        Node t = new Branch(List.of(new Leaf(1), new Branch(List.of(new Leaf(2), new Leaf(3)))));
        System.out.println(t.sum());
    }
}`,
      ),
      output: '6\n',
    },
  },

  80: {
    basic: {
      description: 'Observer: subject notifies subscribers on change.',
      code: B(
        'arch.day80',
        `import java.util.*;

public class Day80Basic {
    static class Subject {
        private final List<Runnable> obs = new ArrayList<>();
        void add(Runnable r) { obs.add(r); }
        void notifyObs() { obs.forEach(Runnable::run); }
    }

    public static void main(String[] args) {
        Subject s = new Subject();
        s.add(() -> System.out.println("ping"));
        s.notifyObs();
    }
}`,
      ),
      output: 'ping\n',
    },
    intermediate: {
      description: 'Strategy: inject different TaxCalculator implementations.',
      code: B(
        'arch.day80',
        `public class Day80Intermediate {
    interface Tax { int on(int cents); }
    static class Us implements Tax { public int on(int c) { return c / 10; } }
    static class Eu implements Tax { public int on(int c) { return c / 5; } }

    public static void main(String[] args) {
        Tax t = new Eu();
        System.out.println(t.on(1000));
    }
}`,
      ),
      output: '200\n',
    },
    advanced: {
      description: 'Command pattern: encapsulate action + undo stack.',
      code: B(
        'arch.day80',
        `import java.util.*;

public class Day80Advanced {
    interface Cmd { void run(); void undo(); }

    public static void main(String[] args) {
        Deque<Cmd> history = new ArrayDeque<>();
        Cmd c = new Cmd() {
            public void run() { System.out.println("do"); }
            public void undo() { System.out.println("undo"); }
        };
        c.run();
        history.push(c);
        history.pop().undo();
    }
}`,
      ),
      output: 'do\nundo\n',
    },
  },

  81: {
    basic: {
      description: 'Estimate QPS: requests per second from traffic and latency.',
      code: B(
        'arch.day81',
        `public class Day81Basic {
    public static void main(String[] args) {
        int users = 1_000_000;
        int rpu = 10;
        System.out.println("daily requests ~ " + (long) users * rpu);
    }
}`,
      ),
      output: 'daily requests ~ 10000000\n',
    },
    intermediate: {
      description: 'Horizontal scale: stateless app servers behind load balancer.',
      code: B(
        'arch.day81',
        `public class Day81Intermediate {
    public static void main(String[] args) {
        int nodes = 8;
        int qpsEach = 500;
        System.out.println(nodes * qpsEach);
    }
}`,
      ),
      output: '4000\n',
    },
    advanced: {
      description: 'Bottleneck math: min(frontend, db, network) determines ceiling.',
      code: B(
        'arch.day81',
        `public class Day81Advanced {
    public static void main(String[] args) {
        int fe = 10_000, db = 2_000, net = 50_000;
        System.out.println(Math.min(fe, Math.min(db, net)));
    }
}`,
      ),
      output: '2000\n',
    },
  },

  82: {
    basic: {
      description: 'URL shortener: hash long URL to short code (collision handling needed).',
      code: B(
        'arch.day82',
        `public class Day82Basic {
    public static void main(String[] args) {
        String longUrl = "https://example.com/very/long";
        int h = Math.floorMod(longUrl.hashCode(), 1_000_000);
        System.out.println(Integer.toString(h, 36));
    }
}`,
      ),
      output: '(base-36 string)\n',
    },
    intermediate: {
      description: '302 redirect: short code lookup returns original URL.',
      code: B(
        'arch.day82',
        `import java.util.*;

public class Day82Intermediate {
    public static void main(String[] args) {
        Map<String, String> m = Map.of("abc", "https://long");
        System.out.println("302 -> " + m.get("abc"));
    }
}`,
      ),
      output: '302 -> https://long\n',
    },
    advanced: {
      description: 'Rate limit per IP: token bucket for create-short-URL API.',
      code: B(
        'arch.day82',
        `public class Day82Advanced {
    public static void main(String[] args) {
        int tokens = 10;
        boolean allow = tokens > 0;
        System.out.println(allow);
    }
}`,
      ),
      output: 'true\n',
    },
  },

  83: {
    basic: {
      description: 'Notification fan-out: one event to many channels (email, push, SMS).',
      code: B(
        'arch.day83',
        `import java.util.*;

public class Day83Basic {
    public static void main(String[] args) {
        List<String> ch = List.of("email", "push");
        System.out.println(ch);
    }
}`,
      ),
      output: '[email, push]\n',
    },
    intermediate: {
      description: 'At-least-once delivery + idempotent consumer for notifications.',
      code: B(
        'arch.day83',
        `import java.util.*;

public class Day83Intermediate {
    public static void main(String[] args) {
        Set<String> sent = new HashSet<>();
        String id = "n-1";
        System.out.println(sent.add(id));
        System.out.println(sent.add(id));
    }
}`,
      ),
      output: 'true\nfalse\n',
    },
    advanced: {
      description: 'Priority queue for urgent alerts vs bulk digests.',
      code: B(
        'arch.day83',
        `import java.util.*;

public class Day83Advanced {
    public static void main(String[] args) {
        Queue<String> pq = new PriorityQueue<>(Comparator.comparingInt(s -> s.startsWith("urgent") ? 0 : 1));
        pq.add("bulk");
        pq.add("urgent:pay");
        System.out.println(pq.poll());
    }
}`,
      ),
      output: 'urgent:pay\n',
    },
  },

  84: {
    basic: {
      description: 'Order aggregate: line items + total + status state machine.',
      code: B(
        'arch.day84',
        `public class Day84Basic {
    enum Status { NEW, PAID, SHIPPED }

    public static void main(String[] args) {
        Status s = Status.NEW;
        s = Status.PAID;
        System.out.println(s);
    }
}`,
      ),
      output: 'PAID\n',
    },
    intermediate: {
      description: 'Inventory reservation: decrement stock atomically or fail order.',
      code: B(
        'arch.day84',
        `import java.util.concurrent.atomic.*;

public class Day84Intermediate {
    public static void main(String[] args) {
        AtomicInteger stock = new AtomicInteger(2);
        int want = 1;
        boolean ok = stock.addAndGet(-want) >= 0;
        System.out.println(ok);
    }
}`,
      ),
      output: 'true\n',
    },
    advanced: {
      description: 'Payment + shipment saga: compensate payment if shipment fails.',
      code: B(
        'arch.day84',
        `public class Day84Advanced {
    public static void main(String[] args) {
        boolean pay = true, ship = false;
        if (pay && !ship) System.out.println("refund");
    }
}`,
      ),
      output: 'refund\n',
    },
  },

  85: {
    basic: {
      description: 'JUnit-style @Test: assert expected vs actual (plain assertions).',
      code: B(
        'arch.day85',
        `public class Day85Basic {
    static void assertEq(int e, int a) {
        if (e != a) throw new AssertionError(e + " != " + a);
    }

    public static void main(String[] args) {
        assertEq(4, 2 + 2);
        System.out.println("ok");
    }
}`,
      ),
      output: 'ok\n',
    },
    intermediate: {
      description: 'Test double stub: returns canned values for collaborators.',
      code: B(
        'arch.day85',
        `public class Day85Intermediate {
    interface Clock { long now(); }
    static class Fixed implements Clock { public long now() { return 42L; } }

    public static void main(String[] args) {
        Clock c = new Fixed();
        System.out.println(c.now());
    }
}`,
      ),
      output: '42\n',
    },
    advanced: {
      description: 'Mock: verify interaction — method called with expected argument.',
      code: B(
        'arch.day85',
        `import java.util.*;

public class Day85Advanced {
    static class MockMail {
        List<String> to = new ArrayList<>();
        void send(String t) { to.add(t); }
    }

    public static void main(String[] args) {
        MockMail m = new MockMail();
        m.send("a@b.com");
        System.out.println(m.to.contains("a@b.com"));
    }
}`,
      ),
      output: 'true\n',
    },
  },

  86: {
    basic: {
      description: '@SpringBootTest idea: load full context — heavy; prefer slice tests when possible.',
      code: B(
        'arch.day86',
        `public class Day86Basic {
    public static void main(String[] args) {
        System.out.println("slice: @WebMvcTest vs full @SpringBootTest");
    }
}`,
      ),
      output: 'slice: @WebMvcTest vs full @SpringBootTest\n',
    },
    intermediate: {
      description: 'Testcontainers: start real Postgres in Docker for integration tests.',
      code: B(
        'arch.day86',
        `public class Day86Intermediate {
    public static void main(String[] args) {
        System.out.println("new GenericContainer<>(\"postgres:15\")");
    }
}`,
      ),
      output: 'new GenericContainer<>("postgres:15")\n',
    },
    advanced: {
      description: '@DynamicPropertySource inject JDBC URL from container.',
      code: B(
        'arch.day86',
        `public class Day86Advanced {
    public static void main(String[] args) {
        System.out.println("spring.datasource.url=" + "jdbc:tc:postgresql:...");
    }
}`,
      ),
      output: 'spring.datasource.url=jdbc:tc:postgresql:...\n',
    },
  },

  87: {
    basic: {
      description: 'Consumer-driven contract: consumer defines expected provider response.',
      code: B(
        'arch.day87',
        `public class Day87Basic {
    public static void main(String[] args) {
        System.out.println("Pact: consumer test generates pact json");
    }
}`,
      ),
      output: 'Pact: consumer test generates pact json\n',
    },
    intermediate: {
      description: 'Provider verification: replay requests from contract file.',
      code: B(
        'arch.day87',
        `public class Day87Intermediate {
    public static void main(String[] args) {
        System.out.println("@PactVerifyProvider");
    }
}`,
      ),
      output: '@PactVerifyProvider\n',
    },
    advanced: {
      description: 'Schema registry for events: breaking change detection in CI.',
      code: B(
        'arch.day87',
        `public class Day87Advanced {
    public static void main(String[] args) {
        System.out.println("COMPATIBILITY: BACKWARD");
    }
}`,
      ),
      output: 'COMPATIBILITY: BACKWARD\n',
    },
  },

  88: {
    basic: {
      description: 'jstack / thread dump: find deadlocks and blocked threads.',
      code: B(
        'arch.day88',
        `public class Day88Basic {
    public static void main(String[] args) {
        System.out.println("jcmd <pid> Thread.print");
    }
}`,
      ),
      output: 'jcmd <pid> Thread.print\n',
    },
    intermediate: {
      description: 'JFR profiling: allocation hotspots and hot methods.',
      code: B(
        'arch.day88',
        `public class Day88Intermediate {
    public static void main(String[] args) {
        System.out.println("jcmd <pid> JFR.start");
    }
}`,
      ),
      output: 'jcmd <pid> JFR.start\n',
    },
    advanced: {
      description: 'GC log analysis: pause times vs throughput tuning.',
      code: B(
        'arch.day88',
        `public class Day88Advanced {
    public static void main(String[] args) {
        System.out.println("-Xlog:gc*:file=gc.log");
    }
}`,
      ),
      output: '-Xlog:gc*:file=gc.log\n',
    },
  },

  89: {
    basic: {
      description: 'STAR method for behavioral answers: Situation, Task, Action, Result.',
      code: B(
        'arch.day89',
        `public class Day89Basic {
    public static void main(String[] args) {
        System.out.println("STAR: 60s story with metrics");
    }
}`,
      ),
      output: 'STAR: 60s story with metrics\n',
    },
    intermediate: {
      description: 'Trade-off framing in system design: latency vs consistency vs cost.',
      code: B(
        'arch.day89',
        `public class Day89Intermediate {
    public static void main(String[] args) {
        System.out.println("pick 2: strong consistency, low latency, cheap");
    }
}`,
      ),
      output: 'pick 2: strong consistency, low latency, cheap\n',
    },
    advanced: {
      description: 'Estimation: QPS, storage, bandwidth sanity check for design interview.',
      code: B(
        'arch.day89',
        `public class Day89Advanced {
    public static void main(String[] args) {
        long qps = 10_000;
        long day = qps * 86_400;
        System.out.println("req/day ~ " + day);
    }
}`,
      ),
      output: 'req/day ~ 864000000\n',
    },
  },

  90: {
    basic: {
      description: 'Timed answer structure: clarify → approach → complexity → code sketch.',
      code: B(
        'arch.day90',
        `public class Day90Basic {
    public static void main(String[] args) {
        System.out.println("45 min: problem -> constraints -> solution");
    }
}`,
      ),
      output: '45 min: problem -> constraints -> solution\n',
    },
    intermediate: {
      description: 'Think-aloud while coding: narrate invariants and tests you would add.',
      code: B(
        'arch.day90',
        `public class Day90Intermediate {
    public static void main(String[] args) {
        System.out.println("I would test empty input and overflow");
    }
}`,
      ),
      output: 'I would test empty input and overflow\n',
    },
    advanced: {
      description: 'Self-review checklist: correctness, complexity, edge cases, production ops.',
      code: B(
        'arch.day90',
        `import java.util.*;

public class Day90Advanced {
    public static void main(String[] args) {
        List<String> checklist = List.of("tests", "complexity", "logging", "failure modes");
        System.out.println(checklist);
    }
}`,
      ),
      output: '[tests, complexity, logging, failure modes]\n',
    },
  },
};
