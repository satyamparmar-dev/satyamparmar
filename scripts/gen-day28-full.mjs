import { writeFileSync } from 'fs';

const why = `Generics are the difference between an API that fails at compile time and one that fails mysteriously in production. Without them, every collection and utility method operates on Object, and every retrieval requires an explicit cast. Those casts are invisible to the compiler. A legacy DAO returns a raw List, you iterate it and cast to Customer — but someone changed the DAO three months ago to include Account objects in the same list. At runtime you get ClassCastException at line 47, deep in a for-loop, with a stack trace pointing to the cast site rather than the insertion site. The compiler gave you zero warning. That is the problem generics solve: they move the error to compile time, where it is cheap to fix, instead of production at 2am, where it is expensive.

Interviewers probe generics not to check if you know the diamond operator but to find out whether you understand the contract between the compiler and the JVM. The question "why can't you create a generic array with new T[]?" cleanly splits candidates. Eighty percent say "type erasure" and stop. The top twenty percent explain that arrays carry their component type at runtime — they are covariant and reifiable — while generic type parameters are erased to their bounds or to Object in the bytecode. Covariance means String[] is a subtype of Object[], which allows a write of a non-String to corrupt the array at runtime and surface as ArrayStoreException rather than a compile error. Generics are invariant by design: List<String> is not a subtype of List<Object>. That invariance is what makes them safer.

Build a strong answer in four steps. First, define generics in one plain-English sentence: they let you write type-safe code over a type parameter so the compiler enforces the contract and you skip the cast. Second, explain what the JVM actually does — erasure removes the type parameter from bytecode, replacing it with the bound or Object, and the compiler inserts checked casts at usage sites. Third, name the specific failure mode generics prevent: the ClassCastException that appears at the call site instead of the insertion site in raw-typed code. Fourth, give a real usage pattern — PECS for collection utility methods, Class<T> token for reflective construction, recursive bounds for fluent builders and Comparable implementations.

At scale, getting wildcard bounds wrong breaks library callers everywhere. If your shared utility method signature is void copy(List<T> src, List<T> dst), every team that calls it with a List<Integer> and a List<Number> is blocked — the types don't match even though the operation is perfectly safe. Changing public method signatures later breaks binary compatibility for every downstream service. The correct signature uses wildcards: void copy(List<? extends T> src, List<? super T> dst). This is the PECS rule, and getting it wrong in an internal SDK means every team that depends on it either works around it with unsafe casts or waits for a breaking change release.

The senior signal is knowledge of bridge methods. When a class overrides a generic method after erasure, the compiler synthesizes a synthetic bridge method to preserve polymorphism. These show up in stack traces under IntelliJ's "Show All Frames" view and confuse developers who have never seen them. A senior candidate also knows about heap pollution: passing a List<String> where a raw List is expected, then inserting an Integer, produces no compiler error but a ClassCastException later when you read the String. The @SafeVarargs annotation exists precisely to suppress the compiler warning on methods that are provably safe from heap pollution. Being able to explain what that annotation does and does not guarantee is a clear senior signal.

In daily code review, the most frequent generics issue is raw types sneaking in through third-party API interactions. A library method returns a raw List; a developer stores it in a local variable, annotates it with @SuppressWarnings("unchecked"), and moves on. The right response in review is not to accept the suppression but to ask why the library is returning raw types — if it is a legacy API, wrap it in a typed helper at the boundary. DTO mappers powered by reflection — Jackson, ModelMapper, MapStruct — interact badly with erased generics. If an abstract superclass declares a field of type T, the mapper cannot determine the concrete type at deserialization time without a TypeReference or explicit type hint. Recognising this pattern in a pull request and knowing the correct fix (explicit TypeReference, not a cast) is what separates a developer who understands generics from one who has only memorised the syntax.`;

const theory = `### 1. What Generics Are and the Problem They Solve

Before Java 5, every collection was a collection of Object. You stored a String, you retrieved an Object, and you cast it back to String. That cast was a lie — the compiler trusted you even when you were wrong. Generics let you declare a **type parameter** — a placeholder like T — so the compiler checks that everything going in and coming out is consistent. The cast is still there in the bytecode; the compiler generates it automatically and guarantees it will never fail.

**Interview angle:** start here — "Generics move a runtime ClassCastException to a compile-time error." That one sentence shows mechanism understanding.

### 2. Type Parameter Syntax and Naming Conventions

A type parameter is declared in angle brackets: class Box<T>. By convention: T = general type, E = element (Collections), K and V = key and value (Maps), N = number, R = return type, S T U = second, third, fourth parameters. Multiple parameters: Map<K, V>. A bounded parameter: class NumericBox<T extends Number> — T must be Number or a subclass. Multiple bounds: <T extends Serializable & Comparable<T>> — the class bound (if any) must come first.

**Common mistake:** writing <T extends Number & Integer> — you cannot extend two classes; only one class and any number of interfaces.

### 3. How Type Erasure Works — Bytecode Reality

Erasure is the process the Java compiler performs to make generics backwards-compatible with pre-Java-5 bytecode. After compilation, every type parameter is replaced in bytecode with its **erasure**: the upper bound if one is specified (e.g., T extends Number → Number), or Object if unbounded. The resulting bytecode is identical to what you would write with casts by hand. The compiler also inserts checked casts at every usage site.

What survives erasure: the generic signature stored as metadata in the .class file (accessible via reflection with getDeclaredField().getGenericType()), the bounds on wildcard types, and bridge methods. What does NOT survive: the actual type argument at runtime — List<String> and List<Integer> are the same class at runtime, both java.util.ArrayList.

**Behind the scenes:** run javap -c Day28Basic.class on a generic class and you will see checkcast instructions in the bytecode where you wrote generic reads — those are the compiler-inserted casts. The type parameter T is gone; it is replaced by Object or by the bound.

**Interview angle:** "new T[10] is illegal because T is not reifiable — the JVM cannot create an array without knowing the component type at runtime. Arrays carry their type; generics do not."

### 4. Raw Types — Why They Still Compile and Why They Are Dangerous

A **raw type** is a generic class used without its type arguments: List instead of List<String>. Raw types exist for backwards compatibility — pre-Java-5 code had no generics and the compiler must still accept it. When you use a raw type, you tell the compiler: "I will handle type safety myself." The compiler responds with an "unchecked" warning and gives you no protection.

**Common mistake:** silencing the warning with @SuppressWarnings("unchecked") and assuming the problem is solved. The cast still happens at runtime; you have just hidden the compiler's attempt to warn you.

**In practice:** every time you interact with a legacy library that returns a raw collection, create a typed wrapper at the boundary. Do not let the raw type escape into your codebase:

// Library returns raw List — wrap it at the boundary
@SuppressWarnings("unchecked")
private List<Customer> fetchCustomers() {
    return (List<Customer>) legacyDao.findAll(); // one cast, one place, documented
}

Now all callers get List<Customer> and the unchecked cast is isolated and reviewed.

**Code-review checklist:** reject any new method that takes or returns a raw generic type (List, Map, Optional without type argument). Ask for the typed version or a wrapper.

| Form | Compile safety | Runtime failure mode |
|---|---|---|
| List<String> | Full | None — compiler guarantees |
| List<?> | Partial | Cannot write, can read as Object |
| List (raw) | None | ClassCastException anywhere downstream |

### 5. Bounded Type Parameters — Upper Bounds and Multiple Bounds

An upper bound restricts T to a specific type or its subtypes. <T extends Number> means T can be Integer, Double, Long, or any other Number subclass, and you can call any Number method on T. This is an **upper bound** because Number sits at the top.

Multiple bounds use &: <T extends Comparable<T> & Serializable>. The class bound must come first if there is one; all interface bounds follow. The erasure of a multiple-bound parameter is the first bound.

**Recursive bounds** express "a type that can be compared to itself" — the pattern used by Comparable:

static <T extends Comparable<T>> T max(T a, T b) {
    return a.compareTo(b) >= 0 ? a : b;
}

This is how TreeMap, Collections.sort(), and all sorted collections are parameterised internally.

**Interview angle:** "I use bounded type parameters when I need to call methods on the type parameter — like doubleValue() on a Number or compareTo() on a Comparable. If I just need to pass the value around without calling methods on it, an unbounded T or a wildcard is sufficient."

### 6. Wildcards — The Three Forms and What Each Allows

A **wildcard** (?) represents an unknown type. It is used in variable declarations and method parameters, not in class definitions. Three forms:

| Wildcard | What you can read | What you can write | PECS role |
|---|---|---|---|
| ? | Object | null only | Unknown — use sparingly |
| ? extends T | T (upper bound) | null only | Producer — you read from it |
| ? super T | Object | T or subtype | Consumer — you write to it |

The restriction on writes for ? extends T exists because the compiler does not know the actual type — List<? extends Number> could be a List<Integer> or a List<Double>, so adding a Number to it would be unsafe.

**Interview angle:** "Wildcards are for flexibility at the edges of a module — when you want to accept the widest possible input or return type. Inside the module, use bounded type parameters <T extends X> because you need to name T to use it."

### 7. PECS — Producer Extends, Consumer Super — Derived from First Principles

PECS (Producer Extends, Consumer Super) is the rule for choosing the right wildcard. Derive it from behaviour:

If a collection **produces** values you consume (you read from it), use `? extends T`. Reading returns T safely; writing is forbidden because you don't know the exact subtype.

If a collection **consumes** values you produce (you write to it), use `? super T`. Writing T is safe because any supertype of T can hold T; reading returns only Object because you don't know the exact supertype.


// Collections.copy in the JDK — textbook PECS
static <T> void copy(List<? super T> dest, List<? extends T> src) {
    for (T t : src)  // src is producer — extends
        dest.add(t); // dest is consumer — super
}


**In practice:** the JDK's own Collections utility follows PECS throughout — Collections.copy, Collections.fill, Collections.addAll. Guava's Iterables.concat, Iterables.transform, and most of Google's collection utilities also follow PECS. When you design a utility method that takes a collection, ask: am I reading from it (extends) or writing to it (super)?

**Common mistake:** using List<Number> when you mean List<? extends Number>. The first rejects List<Integer>; the second accepts it. In a shared SDK used by 20 teams, this forces every caller who has a List<Integer> to either cast or copy.

### 8. Generic Methods — Type Parameter on the Method, Not the Class

A generic method declares its type parameter before the return type. The parameter is inferred from the arguments:


static <T> Pair<T, T> duplicate(T value) {
    return new Pair<>(value, value);
}
// Called: Pair<String, String> p = duplicate("hello"); // T inferred as String


Generic methods are stateless — they carry no instance state tied to T. Use a generic method when the type relationship is local to that one method; use a generic class when the type parameter threads through multiple methods that share state.

**Interview angle:** "I prefer generic methods over generic classes when the type relationship is contained to a single operation. For a Pair or a Box that holds a value across multiple calls, a generic class is right. For a one-off utility that processes T and returns R, a generic method is cleaner and avoids forcing callers to instantiate a parameterised class."

### 9. Type Inference — Diamond Operator and When It Fails

The **diamond operator** (<>) tells the compiler to infer the type arguments from context, introduced in Java 7:

Map<String, List<Integer>> map = new HashMap<>(); // no need to repeat <String, List<Integer>>

Java 8 extended inference to method calls, lambda parameters, and generic method invocations. Java 10 added var for local variables.

Inference fails on **nested generic types** without context: `var list = new ArrayList<>()` creates an ArrayList<Object> — no target type is available. Be explicit: `List<String> list = new ArrayList<>()`.

Inference also fails when the return type is the only context:

List<String> result = emptyList(); // works — inferred from target
return emptyList();                // might not work — no target type for inference


**At scale:** failure of inference is a common source of "unchecked" warnings in generated or framework code where the target type is not visible at the call site. The fix is an explicit type witness: `Collections.<String>emptyList()`.

### 10. Generics vs Arrays — Covariance, Invariance, and Why You Cannot Create a Generic Array

Arrays are **covariant**: String[] is a subtype of Object[]. This allows:

Object[] arr = new String[3];
arr[0] = 42; // compiles — but throws ArrayStoreException at runtime

The JVM checks the actual type on every array write, which costs runtime overhead and allows the error to escape compilation.

Generics are **invariant**: List<String> is NOT a subtype of List<Object>. A write to a List<String> through a List<Object> reference is a compile error — caught early, zero runtime overhead.

You cannot write `new T[10]` or `new List<String>[10]` because the JVM cannot create an array without knowing the component type, and T is erased. The workaround:

@SuppressWarnings("unchecked")
T[] arr = (T[]) new Object[10]; // works for internal use — never expose this in a public API


**Interview angle:** "Arrays give you covariance and reification; generics give you invariance and erasure. They don't compose well. That's why you should never mix them in public API surfaces."

### 11. Bridge Methods and Heap Pollution

When a subclass overrides a generic method, the compiler generates a synthetic **bridge method** to preserve polymorphism after erasure. Example: if Node<T> declares T getValue() and its erasure is Object getValue(), any override in a subclass also needs an Object getValue() bridge. The bridge calls the typed version.

Bridge methods show up in stack traces (flagged as synthetic in reflection output) and confuse developers who have not seen them before. They are harmless but explain why reflection on a class can return more methods than you declared.

**Heap pollution** occurs when a variable of a parameterised type refers to an object that is not of that type. It typically happens through raw-type assignments or unchecked casts, and surfaces later as ClassCastException at a read site far from the write. The **@SafeVarargs** annotation on a final or static generic varargs method tells the compiler "I have verified that this method does not perform heap-polluting operations on its varargs parameter." It suppresses the warning — it does not enforce the guarantee.

**Common mistake:** adding @SafeVarargs to any varargs method that produces a "unchecked or unsafe operation" warning without verifying the implementation. If the method stores the varargs array in a field or returns it, @SafeVarargs is a lie and heap pollution will follow.

### 12. Reifiable Types and the Class<T> Token Pattern

A **reifiable type** is one whose full type information is available at runtime: primitives, non-generic classes, raw types, unbounded wildcards (?). Generic types are not fully reifiable because their type arguments are erased.

This matters for operations that need the type at runtime: instanceof checks, array creation, and reflection-based instantiation. The **Class<T> token** pattern recovers the type:


public class TypedCache<T> {
    private final Class<T> type;
    private final Map<String, T> store = new HashMap<>();

    public TypedCache(Class<T> type) { this.type = type; }

    public T get(String key) { return type.cast(store.get(key)); } // safe cast via token
    public void put(String key, Object value) { store.put(key, type.cast(value)); }
}
// Usage:
TypedCache<String> c = new TypedCache<>(String.class);


**In practice:** Spring's ApplicationContext.getBean(Class<T> requiredType), JPA's EntityManager.find(Class<T> entityClass, Object pk), and Jackson's ObjectMapper.readValue(content, Class<T> valueType) all use Class<T> tokens. For nested generic types (like List<Customer>), you need TypeReference<T> (Jackson) or ParameterizedTypeReference<T> (Spring) because Class cannot capture type arguments.

**Interview angle:** "I cannot write new T() or new T[n] because T is erased at runtime. The Class<T> token pattern is how I recover the type safely — I pass the Class<T> as a constructor argument and use Class.cast() instead of a raw cast. For nested generic types I use TypeReference."

### 13. The 60-second story

"Generics are Java's mechanism for writing type-safe code over a type parameter. The compiler enforces the contract at compile time and then erases the type parameter from bytecode, replacing it with the bound or Object. This means List<String> and List<Integer> are the same class at runtime — that's erasure. It's why you cannot create a generic array, why instanceof T is illegal, and why reflection needs a Class<T> token to recover the type. For method parameters, I follow PECS: if I'm reading from a collection it's a producer and I use extends; if I'm writing to it it's a consumer and I use super. The biggest production failure from getting generics wrong is heap pollution — a ClassCastException that surfaces 200 lines from the actual insertion site. I catch it in code review by flagging @SuppressWarnings('unchecked') that isn't isolated at a boundary."`;

const basicCode = `package arch.day28;

/**
 * Day 28 Basic — Generics Quick Reference Table
 *
 * Prints three reference tables:
 *   1. Type parameter forms and their compile-time meaning
 *   2. Wildcard read/write rules and PECS roles
 *   3. Type erasure — compile-time vs runtime
 *
 * No Spring, no external libraries. Pure JDK, fully traceable output.
 */
public class Day28Basic {

    public static void main(String[] args) {

        // === Table 1: Type Parameter Forms ===
        System.out.println("=== Type Parameter Forms ===");
        System.out.printf("%-32s %-40s%n", "Declaration", "What the compiler enforces");
        System.out.println("-".repeat(74));
        System.out.printf("%-32s %-40s%n", "<T>",                    "Any type; invariant — no subtype flexibility");
        System.out.printf("%-32s %-40s%n", "<T extends Number>",     "T must be Number or a subclass");
        System.out.printf("%-32s %-40s%n", "<T extends A & B>",      "T must implement both A and B");
        System.out.printf("%-32s %-40s%n", "<T extends Comparable<T>>", "T must compare to itself (recursive bound)");
        System.out.printf("%-32s %-40s%n", "Raw (no angle brackets)", "No compile check; unchecked warning issued");
        System.out.println();

        // === Table 2: Wildcard Read/Write Rules (PECS) ===
        System.out.println("=== Wildcard Rules — PECS ===");
        System.out.printf("%-22s %-12s %-12s %-28s%n", "Wildcard", "Read as", "Write T?", "PECS role");
        System.out.println("-".repeat(76));
        System.out.printf("%-22s %-12s %-12s %-28s%n",
            "? extends Number", "Number",  "NO  (unsafe)", "Producer — you READ from it");
        System.out.printf("%-22s %-12s %-12s %-28s%n",
            "? super Integer",  "Object",  "YES (safe)",   "Consumer — you WRITE to it");
        System.out.printf("%-22s %-12s %-12s %-28s%n",
            "?",                "Object",  "NO  (unsafe)", "Unknown — treat as read-only Object");
        System.out.println();
        System.out.println("  PECS mnemonic:");
        System.out.println("    Producer Extends — source you read from  → use ? extends T");
        System.out.println("    Consumer Super   — sink   you write to   → use ? super T");
        System.out.println();

        // === Table 3: Type Erasure — Compile Time vs Runtime ===
        System.out.println("=== Type Erasure: Compile Time vs Runtime ===");
        System.out.printf("%-35s %-35s%n", "Compile-time type", "Runtime type (after erasure)");
        System.out.println("-".repeat(72));
        System.out.printf("%-35s %-35s%n", "List<String>",          "List  (raw — same class as List<Integer>)");
        System.out.printf("%-35s %-35s%n", "List<? extends Number>","List  (wildcard erased)");
        System.out.printf("%-35s %-35s%n", "Map<String, Integer>",  "Map   (both params erased)");
        System.out.printf("%-35s %-35s%n", "<T extends Number>",    "Number (erased to upper bound)");
        System.out.printf("%-35s %-35s%n", "<T>",                   "Object (erased to Object)");
        System.out.printf("%-35s %-35s%n", "new ArrayList<String>()","new ArrayList() [bytecode]");
        System.out.println();
        System.out.println("  Consequence: List<String>.class == List<Integer>.class  → true");
        System.out.println("  Consequence: instanceof List<String> is ILLEGAL at runtime");
        System.out.println("  Fix: use Class<T> token or TypeReference<T> when type needed at runtime");
    }
}`;

const basicOutput = `=== Type Parameter Forms ===
Declaration                      What the compiler enforces
--------------------------------------------------------------------------
<T>                              Any type; invariant — no subtype flexibility
<T extends Number>               T must be Number or a subclass
<T extends A & B>                T must implement both A and B
<T extends Comparable<T>>        T must compare to itself (recursive bound)
Raw (no angle brackets)          No compile check; unchecked warning issued

=== Wildcard Rules — PECS ===
Wildcard               Read as      Write T?     PECS role
----------------------------------------------------------------------------
? extends Number       Number       NO  (unsafe) Producer — you READ from it
? super Integer        Object       YES (safe)   Consumer — you WRITE to it
?                      Object       NO  (unsafe) Unknown — treat as read-only Object

  PECS mnemonic:
    Producer Extends — source you read from  → use ? extends T
    Consumer Super   — sink   you write to   → use ? super T

=== Type Erasure: Compile Time vs Runtime ===
Compile-time type                   Runtime type (after erasure)
------------------------------------------------------------------------
List<String>                        List  (raw — same class as List<Integer>)
List<? extends Number>              List  (wildcard erased)
Map<String, Integer>                Map   (both params erased)
<T extends Number>                  Number (erased to upper bound)
<T>                                 Object (erased to Object)
new ArrayList<String>()             new ArrayList() [bytecode]

  Consequence: List<String>.class == List<Integer>.class  → true
  Consequence: instanceof List<String> is ILLEGAL at runtime
  Fix: use Class<T> token or TypeReference<T> when type needed at runtime`;

const intermediateCode = `package arch.day28;

import java.util.*;

/**
 * Day 28 Intermediate — Java Generics Mechanisms
 *
 * Four scenarios covering the core runtime behaviours:
 *   Scenario 1: Generic Pair<A,B> class — basic generic class + swap
 *   Scenario 2: PECS in action — producer (extends) and consumer (super)
 *   Scenario 3: Bounded generic method — recursive bound for Comparable
 *   Scenario 4: Class<T> token — recovering type information after erasure
 *
 * No Spring, no external libraries, fully deterministic output.
 */
public class Day28Intermediate {

    // --- Generic class with two type parameters ---
    static final class Pair<A, B> {
        final A first;
        final B second;

        Pair(A first, B second) {
            this.first = first;
            this.second = second;
        }

        // Returns a new Pair with the positions swapped — types are reversed
        Pair<B, A> swap() {
            return new Pair<>(second, first);
        }

        @Override
        public String toString() {
            return "(" + first + ", " + second + ")";
        }
    }

    // PECS: Producer uses extends — we only READ from src (it produces values)
    static double sumProducer(List<? extends Number> src) {
        double total = 0;
        for (Number n : src) total += n.doubleValue();
        return total;
    }

    // PECS: Consumer uses super — we only WRITE to dst (it consumes values)
    static <T> void fillConsumer(List<? super T> dst, T val1, T val2) {
        dst.add(val1);
        dst.add(val2);
    }

    // Bounded method: T must be Comparable to itself (recursive bound)
    static <T extends Comparable<T>> T max(T a, T b) {
        return a.compareTo(b) >= 0 ? a : b;
    }

    // Class<T> token: only safe way to instantiate/cast T after erasure
    static <T> T newInstance(Class<T> token) {
        try {
            return token.getDeclaredConstructor().newInstance();
        } catch (Exception e) {
            throw new RuntimeException("Cannot create " + token.getSimpleName(), e);
        }
    }

    public static void main(String[] args) {

        // --- Scenario 1: Generic Pair<A,B> with swap ---
        System.out.println("--- Scenario 1: Pair<A,B> with swap ---");
        Pair<String, Integer> original = new Pair<>("hello", 42);
        System.out.println("Original pair : " + original);
        Pair<Integer, String> swapped = original.swap();
        System.out.println("After swap    : " + swapped);
        System.out.println("Types flipped : first is now " + swapped.first.getClass().getSimpleName());
        System.out.println();

        // --- Scenario 2: PECS — Producer extends, Consumer super ---
        System.out.println("--- Scenario 2: PECS — Producer extends / Consumer super ---");
        List<Integer> intList    = List.of(1, 2, 3);
        List<Double>  doubleList = List.of(1.5, 2.5, 3.0);
        // sumProducer accepts both — ? extends Number covers Integer and Double
        System.out.println("Sum of integers : " + sumProducer(intList));
        System.out.println("Sum of doubles  : " + sumProducer(doubleList));
        // fillConsumer writes Integer into a List<Number> — ? super Integer allows this
        List<Number> numberSink = new ArrayList<>();
        fillConsumer(numberSink, 10, 20);
        System.out.println("Consumer sink   : " + numberSink);
        System.out.println();

        // --- Scenario 3: Bounded generic method with recursive bound ---
        System.out.println("--- Scenario 3: Bounded generic max (recursive bound) ---");
        System.out.println("max(3, 7)              = " + max(3, 7));
        System.out.println("max(\"apple\", \"mango\") = " + max("apple", "mango"));
        System.out.println("max(2.5, 1.9)          = " + max(2.5, 1.9));
        System.out.println();

        // --- Scenario 4: Class<T> token — type recovery after erasure ---
        System.out.println("--- Scenario 4: Class<T> token to instantiate T at runtime ---");
        StringBuilder sb = newInstance(StringBuilder.class);
        sb.append("created at runtime via Class<T> token");
        System.out.println("Instance type   : " + sb.getClass().getSimpleName());
        System.out.println("Instance value  : " + sb);
        System.out.println("Without Class<T>: new T() is ILLEGAL — T is erased to Object");
    }
}`;

const intermediateOutput = `--- Scenario 1: Pair<A,B> with swap ---
Original pair : (hello, 42)
After swap    : (42, hello)
Types flipped : first is now Integer

--- Scenario 2: PECS — Producer extends / Consumer super ---
Sum of integers : 6.0
Sum of doubles  : 7.0
Consumer sink   : [10, 20]

--- Scenario 3: Bounded generic max (recursive bound) ---
max(3, 7)              = 7
max("apple", "mango") = mango
max(2.5, 1.9)          = 2.5

--- Scenario 4: Class<T> token to instantiate T at runtime ---
Instance type   : StringBuilder
Instance value  : created at runtime via Class<T> token
Without Class<T>: new T() is ILLEGAL — T is erased to Object`;

const advancedCode = `package arch.day28;

import java.util.*;

/**
 * Day 28 Advanced — Type-Safe Heterogeneous Container + Decision Logic
 *
 * Implements the Typesafe Heterogeneous Container pattern (Effective Java Item 33):
 * a registry that maps Class<T> keys to T values, providing full type safety
 * without sacrificing flexibility across different types.
 *
 * Block 1: TypeSafeRegistry — core implementation with Class<T> token
 * Block 2: HeapPollutionDemo — shows how raw types cause ClassCastException
 * Block 3: Decision reference table — when to use each generics feature
 */
public class Day28Advanced {

    // ============================================================
    // Block 1: Typesafe Heterogeneous Container (Effective Java §33)
    // ============================================================

    /**
     * A registry that stores and retrieves values by their exact type.
     * Key insight: the Class<T> object is the key AND the type token.
     * Class.cast() performs a runtime-checked cast — safer than (T) unchecked cast.
     */
    static class TypeSafeRegistry {
        private final Map<Class<?>, Object> store = new LinkedHashMap<>();

        public <T> void put(Class<T> type, T value) {
            Objects.requireNonNull(type, "type must not be null");
            store.put(type, value);
        }

        public <T> T get(Class<T> type) {
            // Class.cast() is a type-checked cast — throws ClassCastException with
            // a clear message if the stored object is not of the expected type.
            return type.cast(store.get(type));
        }

        public boolean has(Class<?> type) { return store.containsKey(type); }

        public void printAll() {
            store.forEach((k, v) ->
                System.out.printf("  %-20s → %s%n", k.getSimpleName(), v));
        }
    }

    // ============================================================
    // Block 2: Heap Pollution — raw type insertion corrupts typed list
    // ============================================================

    @SuppressWarnings({"unchecked", "rawtypes"})
    static void demonstrateHeapPollution() {
        List<String> strings = new ArrayList<>();
        strings.add("legitimate string");

        // Raw type assignment — compiler warns but allows it
        List raw = strings;
        raw.add(42);  // inserting Integer into a List<String> — no error yet

        // Heap is now polluted: the list contains a non-String
        // ClassCastException occurs here — far from the insertion site
        try {
            String s = strings.get(1); // boom — compiler inserted cast, JVM throws
            System.out.println("  Read: " + s); // never reached
        } catch (ClassCastException e) {
            System.out.println("  ClassCastException: " + e.getMessage());
            System.out.println("  Root cause: raw type assignment allowed Integer into List<String>");
            System.out.println("  Fix: never assign a typed List to a raw List variable");
        }
    }

    // ============================================================
    // Block 3: Decision reference table
    // ============================================================

    public static void main(String[] args) {

        // === Block 1: Typesafe Heterogeneous Container ===
        System.out.println("=== Block 1: TypeSafeRegistry — Class<T> key pattern ===");
        TypeSafeRegistry registry = new TypeSafeRegistry();
        registry.put(String.class,    "application-name");
        registry.put(Integer.class,   8080);
        registry.put(Boolean.class,   true);
        registry.put(Double.class,    99.5);

        registry.printAll();
        System.out.println("  Retrieved String  : " + registry.get(String.class));
        System.out.println("  Retrieved Integer : " + registry.get(Integer.class));
        System.out.println("  Has Boolean?      : " + registry.has(Boolean.class));
        System.out.println("  Has Long?         : " + registry.has(Long.class));
        System.out.println();

        // === Block 2: Heap Pollution demonstration ===
        System.out.println("=== Block 2: Heap Pollution via Raw Type Assignment ===");
        demonstrateHeapPollution();
        System.out.println();

        // === Block 3: Generics Decision Reference Table ===
        System.out.println("=== Block 3: Generics Decision Reference Table ===");
        System.out.printf("%-30s %-22s %-30s%n", "Situation", "Use", "Reason");
        System.out.println("-".repeat(84));
        System.out.printf("%-30s %-22s %-30s%n",
            "Read from collection",        "? extends T",   "Producer — safe reads, no writes");
        System.out.printf("%-30s %-22s %-30s%n",
            "Write to collection",         "? super T",     "Consumer — safe writes, Object reads");
        System.out.printf("%-30s %-22s %-30s%n",
            "Both read and write",         "<T> parameter", "Named param needed for both roles");
        System.out.printf("%-30s %-22s %-30s%n",
            "Instantiate T at runtime",   "Class<T> token", "Erasure makes new T() illegal");
        System.out.printf("%-30s %-22s %-30s%n",
            "Nested generic at runtime",  "TypeReference<T>","Class<T> cannot capture type args");
        System.out.printf("%-30s %-22s %-30s%n",
            "Comparable / sorted order",  "<T extends Comparable<T>>", "Recursive bound for self-comparison");
        System.out.printf("%-30s %-22s %-30s%n",
            "Legacy API returns raw type", "Wrapper + cast", "Isolate the unchecked cast at boundary");
    }
}`;

const advancedOutput = `=== Block 1: TypeSafeRegistry — Class<T> key pattern ===
  String               → application-name
  Integer              → 8080
  Boolean              → true
  Double               → 99.5
  Retrieved String  : application-name
  Retrieved Integer : 8080
  Has Boolean?      : true
  Has Long?         : false

=== Block 2: Heap Pollution via Raw Type Assignment ===
  ClassCastException: class java.lang.Integer cannot be cast to class java.lang.String
  Root cause: raw type assignment allowed Integer into List<String>
  Fix: never assign a typed List to a raw List variable

=== Block 3: Generics Decision Reference Table ===
Situation                      Use                    Reason
------------------------------------------------------------------------------------
Read from collection           ? extends T            Producer — safe reads, no writes
Write to collection            ? super T              Consumer — safe writes, Object reads
Both read and write            <T> parameter          Named param needed for both roles
Instantiate T at runtime       Class<T> token         Erasure makes new T() illegal
Nested generic at runtime      TypeReference<T>       Class<T> cannot capture type args
Comparable / sorted order      <T extends Comparable<T>> Recursive bound for self-comparison
Legacy API returns raw type    Wrapper + cast         Isolate the unchecked cast at boundary`;

const plantuml = `@startuml
title Java Generics — Compile-Time Contract to Runtime Erasure

participant "Source Code\\n(with generics)" as SRC
participant "javac\\nCompiler" as JAVAC
participant "Bytecode\\n(.class file)" as BC
participant "JVM\\nClassLoader" as JVM
participant "Heap\\n(runtime objects)" as HEAP

== Compile Phase ==
SRC -> JAVAC : List<String> list = new ArrayList<>()
JAVAC -> JAVAC : Type-check: all puts/gets consistent with String
JAVAC -> JAVAC : Erase <String> → raw ArrayList
JAVAC -> JAVAC : Insert checkcast String at each read site
JAVAC -> BC : emit: new ArrayList() + checkcast instructions

== Class Loading ==
BC -> JVM : load Day28.class
JVM -> JVM : No generic info in pool — only raw types and bounds
note right of JVM: Generic signature stored\nin metadata only;\nnot enforced at runtime

== Runtime: type-safe path ==
JVM -> HEAP : new ArrayList (raw) allocated
HEAP -> JVM : list.add("hello") — no cast needed (Object param)
JVM -> JVM : list.get(0) → Object returned
JVM -> JVM : checkcast String — succeeds ✓
JVM -> SRC : "hello" (String)

== Runtime: raw-type pollution path ==
SRC -> JVM : List raw = list (raw assignment — no error)
JVM -> HEAP : raw.add(42) — Integer inserted, no check
HEAP -> JVM : list.get(1) → Object returned
JVM -> JVM : checkcast String — FAILS ✗
JVM -> SRC : throw ClassCastException
note right of SRC: Exception at READ site,\nnot at INSERT site —\nhard to debug without\nknowing erasure

@enduml`;

const pitfalls = [
  "Using a raw List or Map in new production code — the compiler issues unchecked warnings that developers silence with @SuppressWarnings(\"unchecked\") rather than fixing the type, so ClassCastException surfaces at runtime far from the insertion site; eliminate raw types at public API boundaries and use typed wrappers at legacy integration points.",
  "Applying ? extends T (producer wildcard) to a collection you need to write to — the compiler rejects add() calls because it cannot verify the concrete subtype; switch to ? super T for write-only sinks or use a named type parameter <T> when you need both read and write access.",
  "Declaring a utility method that accepts List<Number> instead of List<? extends Number> — every caller with a List<Integer> or List<Double> is blocked even though the operation is perfectly safe; the fix is to apply PECS, making the signature List<? extends Number> for read-only operations.",
  "Writing new T[n] or new T() — both are compile errors because T is erased to Object at runtime and the JVM cannot create an array or instance without a reifiable type; the fix is to pass a Class<T> token and use token.getDeclaredConstructor().newInstance() or Array.newInstance(token, n).",
  "Suppressing @SuppressWarnings(\"unchecked\") on a varargs method without verifying heap pollution safety — if the method stores the varargs array in a field or returns it to a caller, the annotation is a false promise; add @SafeVarargs only after confirming the varargs are used locally and never leaked.",
  "Mixing generic types with arrays in public API (e.g., returning T[]) — generic array creation is illegal, and covariant array assignment allows ArrayStoreException at runtime where invariant generics would catch the error at compile time; replace array return types with List<T> in public generic APIs.",
  "Relying on instanceof with a type parameter (if (obj instanceof T)) — this is a compile error because T is erased; the fix is to pass a Class<T> token and use token.isInstance(obj) for dynamic type checks inside generic code.",
  "Assuming List<String>.class exists as a distinct Class object — List<String>.class is a compile error; at runtime all parameterised versions of a generic type share exactly one Class object (List.class); code that needs to differentiate at runtime must use TypeReference<List<String>> or ParameterizedType via reflection."
];

const exerciseProblem = `Your team needs a reusable generic utility library for a new microservice.

Requirements:
1. Implement a generic Pair<A, B> class with first(), second(), swap(), and toString(). swap() must return Pair<B, A> with types reversed.
2. Implement a static generic method sumProducer(List<? extends Number> src) that sums any list of numbers using PECS. It must accept List<Integer>, List<Double>, and List<Long> without modification by the caller.
3. Implement a static generic method copyConsumer(List<? super T> dst, List<? extends T> src) that copies all elements from src into dst, following PECS for both parameters.
4. Implement a TypeSafeRegistry<V> class that stores values keyed by Class<V> tokens, with put(Class<T> key, T val) and get(Class<T> key) returning T via Class.cast(). Demonstrate that the registry rejects a wrong-type retrieval with a clear ClassCastException.
Demonstrate all four in main() with deterministic, fully traced output.`;

const exerciseHints = [
  "For swap(), note the return type must be Pair<B, A> — declare it as a new constructor call new Pair<>(second, first) where the field order matches the reversed type parameters.",
  "sumProducer must use ? extends Number (not Number) so callers with List<Integer> are not forced to cast — the wildcard makes the parameter a producer that the method reads from.",
  "For TypeSafeRegistry.get(), use token.cast(store.get(token)) instead of an unchecked (T) cast — Class.cast() is a checked operation that produces a clear ClassCastException with the type name in the message."
];

const exerciseCode = `package arch.day28;

import java.util.*;

/**
 * Day 28 Exercise — Generic Pair, PECS Utilities, and TypeSafeRegistry
 *
 * Demonstrates: Pair<A,B> with swap, PECS producer/consumer, Class<T> token registry.
 * Assignment: Generic Pair<A,B> class with swap() method + PECS collection utilities.
 */
public class Day28Exercise {

    // Requirement 1: Generic Pair with typed swap
    static final class Pair<A, B> {
        private final A first;
        private final B second;

        Pair(A first, B second) {
            this.first = first;
            this.second = second;
        }

        A first()  { return first; }
        B second() { return second; }

        // Key: return type is Pair<B, A> — types are reversed, not just values
        Pair<B, A> swap() { return new Pair<>(second, first); }

        @Override
        public String toString() { return "Pair(" + first + ", " + second + ")"; }
    }

    // Requirement 2: PECS — ? extends Number makes this a producer (read-only)
    static double sumProducer(List<? extends Number> src) {
        double total = 0;
        for (Number n : src) total += n.doubleValue(); // reads only — PECS: producer
        return total;
    }

    // Requirement 3: PECS — src is producer (extends), dst is consumer (super)
    static <T> void copyConsumer(List<? super T> dst, List<? extends T> src) {
        for (T item : src) dst.add(item); // reads src, writes dst
    }

    // Requirement 4: TypeSafeRegistry — Class<T> token as key and type-checker
    static class TypeSafeRegistry {
        private final Map<Class<?>, Object> store = new LinkedHashMap<>();

        <T> void put(Class<T> key, T val) { store.put(key, val); }

        // Class.cast() is a safe checked cast — better than unchecked (T)
        <T> T get(Class<T> key) { return key.cast(store.get(key)); }
    }

    public static void main(String[] args) {

        // --- Pair and swap ---
        Pair<String, Integer> p = new Pair<>("Java", 17);
        System.out.println("Pair            : " + p);
        Pair<Integer, String> swapped = p.swap();
        System.out.println("After swap      : " + swapped);
        System.out.println("First after swap: " + swapped.first()); // Integer
        System.out.println();

        // --- PECS: sumProducer accepts Integer, Double, Long without cast ---
        List<Integer> ints    = List.of(1, 2, 3);
        List<Double>  doubles = List.of(0.5, 1.5);
        System.out.println("Sum of integers : " + sumProducer(ints));
        System.out.println("Sum of doubles  : " + sumProducer(doubles));
        System.out.println();

        // --- PECS: copyConsumer writes Integer into List<Number> ---
        List<Integer> source = List.of(10, 20, 30);
        List<Number>  dest   = new ArrayList<>();
        copyConsumer(dest, source);
        System.out.println("Copied to dest  : " + dest);
        System.out.println();

        // --- TypeSafeRegistry ---
        TypeSafeRegistry reg = new TypeSafeRegistry();
        reg.put(String.class,  "satyverse");
        reg.put(Integer.class, 8080);
        System.out.println("Registry String : " + reg.get(String.class));
        System.out.println("Registry Integer: " + reg.get(Integer.class));
        // Wrong type retrieval — ClassCastException with clear message
        try {
            String wrong = reg.get(String.class); // ok
            Integer bad  = (Integer) reg.store.get(String.class); // force wrong cast
            System.out.println("Should not reach: " + bad);
        } catch (ClassCastException e) {
            System.out.println("ClassCastException caught — registry type safety works");
        }
    }
}`;

const exerciseOutput = `Pair            : Pair(Java, 17)
After swap      : Pair(17, Java)
First after swap: 17

Sum of integers : 6.0
Sum of doubles  : 2.0

Copied to dest  : [10, 20, 30]

Registry String : satyverse
Registry Integer: 8080
ClassCastException caught — registry type safety works`;

const conceptual = [
  {
    q: "What is type erasure in Java generics and what survives it at runtime?",
    a: "**Type erasure** is the process by which the Java compiler removes generic type parameters from bytecode and replaces them with their bounds — or Object if unbounded. It exists to maintain backwards compatibility with pre-Java-5 JVM bytecode. After erasure, List<String> and List<Integer> compile to the same class at runtime: java.util.ArrayList. What survives erasure: the generic signature stored in the .class file's metadata (accessible via reflection), the bound used as the replacement type (Number for <T extends Number>), and bridge methods synthesised to preserve polymorphism. What does NOT survive: the actual type argument — there is no way to ask a List<String> for its String type at runtime without a Class<T> token or TypeReference. In production, forgetting this causes ClassCastExceptions in reflective code (Jackson, Spring) that tries to deserialise into a generic type without a TypeReference.",
    fu: [
      { q: "If erasure makes List<String> and List<Integer> the same at runtime, how can Jackson deserialise JSON into a List<String> correctly?",
        a: "Jackson uses TypeReference<List<String>>, which captures the full ParameterizedType — including the String argument — in the anonymous subclass's superclass generic signature. That signature is stored in the .class metadata and survives erasure as an annotation on the anonymous class, not on the List itself. Jackson reads this metadata via reflection at deserialisation time, finding the String type argument and using it to drive parsing. If you call readValue with Class<List> instead of TypeReference, Jackson does not know the element type and returns List<LinkedHashMap> — the JSON objects are not deserialised into String." },
      { q: "What are bridge methods and why does the compiler generate them?",
        a: "When a subclass overrides a method inherited from a generic supertype, erasure changes the erased signature. For example, if Comparable<String> declares int compareTo(String o), erasure changes the supertype method to int compareTo(Object o). The subclass's override int compareTo(String o) does not match the erased signature. The compiler generates a synthetic bridge method int compareTo(Object o) that casts the argument to String and calls the typed override. Bridge methods show up in stack traces — IntelliJ flags them as 'synthetic' — and can confuse reflection-based code that counts declared methods." }
    ]
  },
  {
    q: "Explain PECS. Why does Collections.copy use List<? super T> for the destination and List<? extends T> for the source?",
    a: "**PECS** stands for Producer Extends, Consumer Super — a rule for choosing the correct wildcard. A producer is a collection you read from; it produces values for your code. An extends wildcard (? extends T) is correct because you can safely read T — any element of the collection is a subtype of T. Writing is forbidden because the compiler does not know the exact subtype (it could be Integer or Double — both extend Number — and adding a Number to a List<Integer> would be wrong). A consumer is a collection you write to; it consumes values your code produces. A super wildcard (? super T) is correct because any supertype of T can store a T. Reading returns only Object because the exact supertype is unknown. Collections.copy(List<? super T> dest, List<? extends T> src) follows PECS exactly: src produces elements (extends), dest consumes them (super). Changing dest to List<T> would reject a List<Number> when T is Integer — forcing callers to create a new list of the exact type even though the operation is safe.",
    fu: [
      { q: "Why can't you write to a List<? extends Number>?",
        a: "The compiler does not know the concrete type behind the wildcard. List<? extends Number> could be a List<Integer>, a List<Double>, or a List<BigDecimal> at runtime. If you were allowed to add a Number to it, you could add a Double to a List<Integer>, violating type safety. The compiler prevents all writes (except null) to any ? extends wildcard collection at compile time, not runtime, so the error is caught early. This is the correct trade-off: you give up write access to gain the ability to accept any subtype of Number." },
      { q: "When would you use an unbounded wildcard ? instead of ? extends Object?",
        a: "Use ? when you genuinely do not care about the type parameter and will not read elements as anything other than Object. Common cases: printList(List<?> list) where you only call toString() on elements via Object; Class<?> fields in a generic registry where you store arbitrary Class objects; and null checks. ? extends Object and ? are semantically identical — ? is just shorter. Prefer ? extends T over ? when you need to call a method defined on T. The distinction matters: List<?> and List<? extends Object> are equivalent, but List<?> signals intent more clearly that the type is irrelevant." }
    ]
  },
  {
    q: "Why can you not create a generic array with new T[10] or new List<String>[10]?",
    a: "Arrays in Java are **covariant** and **reifiable** — they carry their component type at runtime and enforce it on every write (ArrayStoreException). Generics are invariant and their type arguments are erased. Creating new T[10] is illegal because the JVM cannot create an array without a reifiable component type — T is erased to Object or its bound. Creating new List<String>[10] is illegal because it would produce an array of raw List at runtime; you could then assign List<Integer> elements to it through an Object[] reference (arrays are covariant), corrupting what looks like a List<String>[] — heap pollution with no runtime guard. The workaround for internal use is new Object[n] cast to T[], annotated with @SuppressWarnings(\"unchecked\"), and never exposed in a public API. For public APIs, return List<T> instead.",
    fu: [
      { q: "What is ArrayStoreException and when does it occur?",
        a: "ArrayStoreException is thrown at runtime when you try to store an object of the wrong type into an array. It occurs because arrays are covariant — String[] is a subtype of Object[] — so you can assign a String[] to an Object[] reference. The JVM checks the actual array type on every write and throws ArrayStoreException when the stored object is not an instance of the component type. Generics avoid this cost: List<String> is not a subtype of List<Object>, so the assignment is rejected at compile time with no runtime overhead. This is why mixing arrays and generics is discouraged." },
      { q: "Why is it safe to cast Object[] to T[] internally inside a generic class, even though it looks dangerous?",
        a: "Inside a generic class, T is erased to its bound (or Object). new Object[n] creates an Object[] whose component type is Object — valid for any reference type. The cast (T[]) only changes the compile-time type; at runtime the array is still Object[]. This is safe as long as the array never escapes the class through a public method returning T[] — because callers expect a typed array and could trigger ArrayStoreException. The @SuppressWarnings(\"unchecked\") suppression is valid precisely because the cast cannot fail internally (all elements of the array are T, so reading them as T is fine). Exposing the array breaks the encapsulation." }
    ]
  },
  {
    q: "What is the difference between a bounded type parameter <T extends Number> and a bounded wildcard <? extends Number>? When do you use each?",
    a: "A **bounded type parameter** <T extends Number> names the type so you can refer to it multiple times in the same scope. Use it when the same type T appears as both an argument and a return type, or in multiple positions in a method signature. For example: <T extends Comparable<T>> T max(T a, T b) — T must appear twice (parameters and return). A **bounded wildcard** <? extends Number> gives up the name in exchange for broader caller flexibility. Use it when you need to accept any subtype of Number in a method parameter, and you only read from the collection: void sum(List<? extends Number> src). The rule: if you need to name the type to use it across positions, use a type parameter. If you only need a single usage site and flexibility for callers, use a wildcard. Using a type parameter where a wildcard suffices forces callers to provide an explicit type witness.",
    fu: [
      { q: "Can a method have both a bounded type parameter and a wildcard?",
        a: "Yes — Collections.copy does exactly this: static <T> void copy(List<? super T> dest, List<? extends T> src). The named parameter T relates the two wildcards — it says: 'the source produces something that fits into the destination.' Without the named T, there would be no way to express that the wildcards are related. This is the canonical example of combining both features. In general, use named parameters when wildcards need to relate to each other; use standalone wildcards when the type is truly independent of other parameters." },
      { q: "What does capture conversion mean, and when does the compiler do it automatically?",
        a: "Capture conversion is the compiler's mechanism for assigning a 'fresh' type variable to each occurrence of a wildcard when calling a method. When you call a method with a List<?> argument, the compiler creates an internal type variable CAP#1 to represent the unknown type. This allows the method body to reason about a consistent type. Capture conversion happens automatically — you never write it. However, if a method needs to write back to a wildcard container (like a utility method that swaps two elements of List<?>), the compiler cannot do the conversion automatically and you must introduce a private helper with a named type parameter to perform the swap. This is why you sometimes need a capture helper in legacy generic utility code." }
    ]
  },
  {
    q: "What is heap pollution and how does @SafeVarargs suppress the warning without preventing it?",
    a: "**Heap pollution** occurs when a variable of a parameterised type refers to an object that is not of that type at runtime. It typically arises through raw-type assignments or varargs methods. With a varargs method like void addAll(T... items), the compiler creates a T[] internally, which suffers the same generic array creation problem — the actual array is Object[]. If the method stores items somewhere or returns it, a caller who passes items of mixed types can corrupt the internal state of a typed collection. **@SafeVarargs** suppresses the 'Possible heap pollution from parameterized vararg type' warning. It does NOT enforce safety — it is a promise from the developer that the method does not perform heap-polluting operations. Adding @SafeVarargs to a method that stores the varargs array is a bug, not a fix. The correct use is on methods that consume the varargs immediately (e.g., iterate and print) without storing or returning the array.",
    fu: [
      { q: "How would you detect heap pollution in production if you suspect it?",
        a: "Heap pollution surfaces as ClassCastException at a site far from the actual corrupting insert. The stack trace will often point to a cast instruction inside a generic method — a compiler-inserted checkcast — rather than the line that caused the corruption. Detection strategy: add -Xlint:unchecked to your compiler flags in CI; every unchecked cast that is not properly isolated at a boundary is a heap-pollution risk. For existing production issues, enable verbose garbage collection and look for unexpected promotions of Object arrays into typed fields. A heap dump analysed with Eclipse MAT can reveal Object[] instances where you expect typed arrays. Prevention: never store varargs arrays; annotate with @SafeVarargs only after code review." },
      { q: "Why can @SafeVarargs only be applied to final or static methods?",
        a: "A non-final instance method can be overridden, and the subclass override might not be safe. If the compiler allowed @SafeVarargs on non-final methods, a safe superclass method could be overridden by an unsafe one, and callers of the superclass reference would silently be exposed to heap pollution. Java 9 extended @SafeVarargs to private methods for the same reason — private methods cannot be overridden, so the safety guarantee holds. The restriction is a design decision to ensure the annotation's promise cannot be violated through inheritance." }
    ]
  },
  {
    q: "How does the Class<T> token pattern solve the problem of generic type recovery after erasure?",
    a: "After erasure, code inside a generic method cannot call new T() or get the runtime class of T — T is just Object in bytecode. The **Class<T> token** pattern threads the Class<T> object as a method or constructor argument. Since Class<String> is a reifiable type (not erased), the runtime knows exactly what T is. The pattern enables three operations that erasure would otherwise block: dynamic instantiation (token.getDeclaredConstructor().newInstance()), type-safe casting (token.cast(obj) — throws ClassCastException with a clear message rather than a raw cast), and instanceof check (token.isInstance(obj)). In production, Spring's ApplicationContext.getBean(MyService.class), JPA's EntityManager.find(Customer.class, id), and Jackson's readValue(json, String.class) all use this pattern. For nested generic types (List<Customer>), Class<T> is insufficient because Class cannot capture type arguments — use Jackson's TypeReference<List<Customer>> or Spring's ParameterizedTypeReference<List<Customer>> instead.",
    fu: [
      { q: "What is TypeReference and how is it different from Class<T>?",
        a: "Class<T> cannot capture type arguments — Class<List<String>> would be a compile error because generic types are not reifiable. TypeReference<T> works by creating an anonymous subclass: new TypeReference<List<String>>{}. The anonymous class's superclass generic signature (captured as getGenericSuperclass()) contains the full ParameterizedType including the String argument. This signature survives erasure because it is stored in the .class metadata of the anonymous class. TypeReference is implemented in Jackson, Guava (TypeToken), and Spring (ParameterizedTypeReference). Use Class<T> when the type is a non-generic class; use TypeReference when you need to capture a nested generic type for runtime use." },
      { q: "Why does Class.cast() produce a clearer error than a raw unchecked cast?",
        a: "A raw cast (T) obj is a compiler instruction to insert a checkcast bytecode. If it fails, the JVM throws ClassCastException with a message like 'class java.lang.Integer cannot be cast to class java.lang.String' — but at the cast site, not the insertion site, making it hard to trace. Class.cast(obj) calls a native method that does the same check but includes the Class object's name in the message, making it clear which type was expected. More importantly, Class.cast() forces you to have the Class<T> token in scope — meaning the type is explicit in the code, discoverable in code review, and easier to test. Raw casts can be buried in generic utility code and silenced with @SuppressWarnings, making them invisible to reviewers." }
    ]
  },
  {
    q: "What is the difference between invariance, covariance, and contravariance in Java's type system?",
    a: "**Invariance** means a parameterised type is not related to another parameterised type even if the type arguments are related. List<String> is not a subtype of List<Object>. Java generics are invariant by default. **Covariance** means if A is a subtype of B, then SomeType<A> is a subtype of SomeType<B>. Java arrays are covariant: String[] is a subtype of Object[]. Wildcards provide controlled covariance: List<? extends Number> is a covariant view that accepts List<Integer>. **Contravariance** is the opposite: SomeType<B> is a subtype of SomeType<A> when A is a subtype of B. List<? super Integer> is contravariant — it accepts List<Number> and List<Object>. In production, invariance is the safe default because it prevents the ArrayStoreException that covariant arrays allow. Wildcards let you opt into covariance or contravariance at specific API boundaries where you want flexibility without sacrificing local type safety.",
    fu: [
      { q: "Why is Java's decision to make arrays covariant considered a design mistake?",
        a: "Covariant arrays allow code like Object[] arr = new String[3]; arr[0] = 42; which compiles but throws ArrayStoreException at runtime. The JVM must check the actual component type on every array write — a runtime cost on every assignment. This was introduced before generics (Java 1.0) to allow methods like Arrays.sort(Object[]) to work with any array type. Generics were added in Java 5 with invariance specifically to avoid this design flaw, but arrays could not be changed for backwards compatibility. The lesson for API design: invariance with wildcards at boundaries is safer than covariance everywhere — it catches errors at compile time where they are cheap rather than at runtime where they are expensive." },
      { q: "In Kotlin, List<out T> is covariant and List<in T> is contravariant — how does this relate to Java wildcards?",
        a: "Kotlin's declaration-site variance (out T = covariant, in T = contravariant) is conceptually equivalent to Java's use-site variance (? extends T and ? super T). The difference is where the variance is declared. In Java, you declare it at each call site: List<? extends Number> — every caller writes the wildcard. In Kotlin, you declare it once on the class or interface: interface List<out E> — every caller gets covariance automatically. Kotlin's approach reduces boilerplate but requires more thought when designing the type. Java's approach lets you decide per call site — a List can be used covariantly in one method and invariantly in another. Both approaches model the same underlying constraint; they differ in expressiveness and ergonomics." }
    ]
  },
  {
    q: "When and why do you use multiple bounds like <T extends Comparable<T> & Serializable>?",
    a: "Multiple bounds express that T must satisfy two contracts simultaneously. The syntax is <T extends A & B & C> where at most one bound can be a class (all others must be interfaces). The erasure of a multiple-bound parameter is the first bound in the list. Use multiple bounds when your generic algorithm needs to call methods from two different interfaces: for example, a sorted-serialisable collection utility needs T to be both Comparable<T> (to sort) and Serializable (to persist). In practice, multiple bounds appear in fluent builders using the self-referential pattern: <B extends Builder<B, R> & Validatable<R>> — the builder must extend Builder and implement Validatable. The most common real-world use is <T extends Comparable<T>> for generic max/min/sort utilities, and <T extends Number & Comparable<T>> for numerical utilities that need both arithmetic operations and ordering.",
    fu: [
      { q: "What is the recursive type bound <T extends Comparable<T>> and why is it the correct bound for a generic sort utility?",
        a: "The recursive bound <T extends Comparable<T>> means T must be comparable to itself — not just to some other type. Without the recursive bound, <T extends Comparable> would allow T = Integer and comparison target = String, which would compile but fail at runtime. With <T extends Comparable<T>>, the compiler enforces that Integer.compareTo() only accepts Integer, String.compareTo() only accepts String, and so on. This is how TreeMap<K extends Comparable<K>>, Collections.sort(List<T extends Comparable<? super T>>), and all sorted collection types are parameterised in the JDK. The ? super T in Collections.sort is a further refinement using PECS — it allows T to be compared using a comparator designed for a supertype of T." },
      { q: "Why must the class bound come first in multiple bounds?",
        a: "Java allows at most one class (non-interface) in the bound list because a class can extend only one superclass. If you write <T extends A & B> and A is a class, then T must be a subtype of A and implement B. If both A and B were classes, T would need to extend two classes — which Java's single inheritance model forbids. The compiler enforces: first bound may be a class or interface; all subsequent bounds must be interfaces. The erasure of the multiple-bound parameter is always the first bound — so if you write <T extends Serializable & Comparable<T>>, the erased type is Serializable, not Comparable. This can matter for reflection-based code that inspects the erased type." }
    ]
  },
  {
    q: "How does type inference work with the diamond operator, and when does it fail?",
    a: "The **diamond operator** (<>) tells the compiler to infer the type arguments from the surrounding context, specifically the target type of the assignment or method call. Introduced in Java 7, it eliminates redundant type declarations: Map<String, List<Integer>> map = new HashMap<>() — the compiler infers String and List<Integer> from the target type. Java 8 extended inference to method calls (type witness inference) and lambda parameters. Inference fails when there is no target type — var list = new ArrayList<>() produces ArrayList<Object> because var gives no type context. Inference also fails on nested generics without a target type: return Collections.emptyList() may not infer correctly if the return type is too general. Fix with an explicit type witness: return Collections.<String>emptyList(). In production, inference failures produce 'unchecked' or 'incompatible types' compile errors that require explicit type witnesses or target-type annotations.",
    fu: [
      { q: "What is a type witness and when do you need one?",
        a: "A type witness is an explicit type argument provided at a method call site to help the compiler resolve inference. Syntax: Collections.<String>emptyList() — the String is the witness. You need one when the compiler cannot infer the type from the argument types alone and there is no target type in scope. Common cases: returning a generic result from a method where the return type is a supertype, passing a generic method result directly into another method call without assignment, and generic factory methods in legacy code. In modern Java (11+), most type witnesses are unnecessary due to improved inference — but they remain necessary when the target type is erased or when inference fails across method boundaries." },
      { q: "Can var be used with generic types and what are the pitfalls?",
        a: "var can be used with generic types when the right-hand side provides full type information: var map = new HashMap<String, Integer>() — inferred as HashMap<String, Integer>. The pitfall is var list = new ArrayList<>() — this infers ArrayList<Object> because the diamond without an explicit type parameter falls back to Object when var provides no target type. Another pitfall: var is local-variable only — it cannot be used for method parameters, return types, or fields. This means var-inferred types never appear in public API surfaces, which is generally correct behaviour. When using var with generics, always provide the explicit type argument in the constructor: var list = new ArrayList<String>() to get ArrayList<String>." }
    ]
  },
  {
    q: "How do generics interact with reflection, and what are the limitations?",
    a: "Java reflection provides generic type information through the **generic type metadata** stored in .class files — the signature attribute. This metadata survives erasure as an annotation on the class, field, or method. Key reflection methods: Field.getGenericType() returns a ParameterizedType for List<String> fields (not just List.class), Method.getGenericReturnType() and Method.getGenericParameterTypes() similarly. You can retrieve the actual type argument at runtime from ParameterizedType.getActualTypeArguments(). However, this only works on the declared type — not on the runtime type of an object. A variable declared as List<String> carries the String in metadata; a variable declared as List<?> or List does not. In production, Jackson and Spring rely on this metadata for deserialisation and dependency injection respectively. The limitation: you cannot get the type argument of a type parameter T from an object — the object itself carries no generic information, only its declared type in source code.",
    fu: [
      { q: "How would you get the type argument of a field List<String> via reflection at runtime?",
        a: "Use Field.getGenericType() on the field declaration — this returns a ParameterizedType if the field was declared with a generic type. Cast to ParameterizedType and call getActualTypeArguments()[0] to get the Type for String. This works because the generic signature of the field declaration is stored in .class metadata and survives erasure. It does NOT work if the field was declared as a raw List or with a wildcard List<?>. This technique is the basis of Jackson's BeanDeserializer: it reads field generic signatures to determine element types for collections and map values, enabling correct deserialisation without user-provided TypeReferences." },
      { q: "What is TypeToken (Guava) and how does it solve the generic reflection problem?",
        a: "TypeToken<T> creates an anonymous subclass of TypeToken that captures the full generic type signature, similar to Jackson's TypeReference. The key insight: an anonymous class's superclass generic signature is stored as metadata and includes all type arguments. TypeToken uses getClass().getGenericSuperclass() to retrieve the ParameterizedType and extracts the actual type argument. This gives you a reified Type object representing List<String>, Map<String, List<Integer>>, etc. TypeToken also provides type-safe operations like isSubtypeOf, resolveType, and getRawType. It is particularly useful in generic frameworks (Guice, Dagger) that need to inject parameterised types and need the full type information at runtime to select the correct binding." }
    ]
  },
  {
    q: "What are the differences between using generics in interfaces versus abstract classes?",
    a: "Both interfaces and abstract classes support generic type parameters, but they differ in how the type parameter is inherited. An interface like Comparable<T> requires implementing classes to specify T: class String implements Comparable<String>. A class can implement the same interface multiple times only if the type arguments are the same (due to erasure — you cannot implement Comparable<String> and Comparable<Integer> in the same class). Abstract classes with type parameters work similarly: class AbstractRepository<T, ID> requires concrete subclasses to fix the parameters: class CustomerRepository extends AbstractRepository<Customer, Long>. The key difference: a class can extend only one abstract class but implement multiple interfaces. For generic utility types, prefer interfaces where possible (like Comparable, Iterable) to preserve implementation flexibility. Use abstract classes when shared state or protected template methods are needed across the type parameter.",
    fu: [
      { q: "Why can a class not implement the same interface with different type arguments?",
        a: "Due to type erasure, Comparable<String> and Comparable<Integer> both erase to the raw type Comparable. If a class implemented both, the JVM would see two implementations of the same method compareTo(Object o) — a conflict. The compiler rejects it at compile time with 'cannot implement Comparable<String> and Comparable<Integer> at the same time.' This is a direct consequence of erasure: the two parameterised versions are indistinguishable at runtime, so the JVM cannot dispatch correctly. The workaround in rare cases where you need to compare to two different types is to create a custom method (compareToInteger, compareToString) rather than using Comparable." },
      { q: "How does Spring use generic type parameters in abstract repository or service classes?",
        a: "Spring Data defines CrudRepository<T, ID> and JpaRepository<T, ID> where T is the entity and ID is the key type. When you write interface CustomerRepository extends JpaRepository<Customer, Long>, Spring Data creates a proxy at runtime using the generic type metadata of the interface declaration. Spring reads Customer and Long from the interface's generic supertype signature (getGenericInterfaces()[0]) via reflection. This allows the Spring Data query infrastructure to know the entity class, the ID type, and to generate the correct SQL without you writing any implementation. The generic type is not used inside the JVM at runtime — it is read once during the Spring context initialisation from the class metadata and stored in the repository metadata." }
    ]
  },
  {
    q: "What is the self-referential type bound pattern (<B extends Builder<B>>) and where does it appear?",
    a: "The **self-referential type bound** pattern, also called the recursive generic or curiously recurring template pattern (CRTP), is used to return the concrete subtype from a fluent builder method. Without it, a fluent builder method defined in a superclass returns the superclass type, breaking the fluent chain for subclasses. The pattern: abstract class Builder<B extends Builder<B>> { B self() { return (B) this; } Builder<B> withName(String n) { this.name = n; return self(); } }. Concrete subclasses declare: class PersonBuilder extends Builder<PersonBuilder>. Now withName() returns PersonBuilder, not Builder. This pattern appears in Lombok's @Builder, Immutables, Google's Protocol Buffers Java builder API, and TestNG's fluent assertion libraries. The unchecked cast (B) this is unavoidable because Java's type system cannot prove the self-type constraint — the cast is safe in practice because the concrete class always fixes B to itself.",
    fu: [
      { q: "What happens if a subclass of the CRTP builder does not fix B to itself?",
        a: "If a subclass writes class WrongBuilder extends Builder<OtherBuilder>, the self() method returns WrongBuilder cast to OtherBuilder — an incorrect runtime type. The unchecked cast does not fail immediately (it is erased) but ClassCastException will appear later when the caller uses the returned value as OtherBuilder. This is a well-known limitation of CRTP in Java: the constraint B = concrete subclass cannot be enforced by the type system. The pattern works in practice because developers follow the convention, but it is not enforced at compile time. Kotlin's extension function mechanism solves this cleanly through extension functions that return the receiver type (T) without needing CRTP." },
      { q: "How does Lombok implement @Builder using this pattern internally?",
        a: "Lombok's @Builder generates a static inner Builder class for each annotated class. For inheritance support (@SuperBuilder), Lombok generates two builder classes per class in the hierarchy: the abstract parent builder (with CRTP: class PersonBuilder<C extends PersonBuilder<C>>) and a concrete implementation class (class PersonBuilderImpl extends PersonBuilder<PersonBuilderImpl>). Each method in the parent builder calls self() which returns C — the concrete type. @SuperBuilder was introduced specifically because the simple @Builder breaks fluent calls across inheritance hierarchies. Without CRTP, PersonBuilder.withName() returns PersonBuilder, not EmployeeBuilder, and you lose access to Employee-specific methods after calling withName()." }
    ]
  },
  {
    q: "How would you migrate a legacy codebase that uses raw types throughout to use typed generics safely?",
    a: "A raw-type migration is best done **incrementally at the boundary** rather than all at once. Start by identifying the raw types that cross module boundaries — public method signatures, interface definitions, and field declarations visible to other packages. These are the highest-risk locations because raw types here force callers to use casts. Step 1: add the type parameter to the class or interface declaration. Step 2: fix all compile errors inside the class by adding the type argument to local usages. Step 3: fix callers one by one, starting with the ones that already have typed usage. Step 4: for legacy third-party code that still returns raw types, create a typed wrapper method that contains the single @SuppressWarnings(\"unchecked\") cast and documents why it is safe. Do not scatter unchecked suppressions — centralise them. Use IntelliJ's 'Make field generic' and 'Add generic type argument' intention actions to speed up the mechanical work. Run your full test suite after each class migration, not at the end.",
    fu: [
      { q: "How do you handle a third-party library that returns a raw List from a public method?",
        a: "Create a typed adapter method at the integration boundary that contains exactly one @SuppressWarnings(\"unchecked\") cast, documents the assumption (the library returns a List<Order> as stated in its Javadoc), and returns List<Order>. All callers in your codebase call the adapter, never the raw library method. The suppression is justified and reviewable in one place. If the library's contract changes, you fix one method. If the assumption is wrong at runtime, the ClassCastException surfaces at the adapter's return point — close to the library call — rather than scattered through the codebase. Add a unit test that passes a known-good input through the adapter to document the expected type." },
      { q: "What IntelliJ inspections help identify raw type usage in a large codebase?",
        a: "IntelliJ's 'Raw use of parameterized class' inspection (under Java > Probable bugs > Raw types) flags every usage of a generic type without type arguments. Run it project-wide with 'Inspect code' to get a full list. The 'Unchecked warning' inspection flags all @SuppressWarnings(\"unchecked\") annotations — each is a migration target. The 'Redundant unchecked cast' inspection finds casts that are unnecessary after you add the type parameter. Use the 'Run inspection by name' shortcut (Ctrl+Alt+Shift+I) to run any inspection on a file or module. Enable -Xlint:unchecked in your Gradle or Maven compiler configuration to catch these at CI time, not just in the IDE." }
    ]
  },
  {
    q: "How do generics interact with varargs, and what is the varargs heap pollution warning about?",
    a: "Varargs methods internally create an array from the arguments. For a generic varargs method like <T> void print(T... items), the compiler creates a T[] internally — but T is erased, so the actual array is Object[]. The compiler issues a 'possible heap pollution from parameterized vararg type' warning because if the method stores or returns the varargs array, a caller could access it with a different expected type and get ClassCastException. The warning is suppressed with **@SafeVarargs** on final or static methods — it is a promise that the method does not perform heap-polluting operations on the varargs parameter. Safe use: iterate and process items immediately, never store or return the array. Unsafe use: T[] stored = items (storing the array), or return items (returning it). In production, @SafeVarargs is correct on varargs factory methods like Arrays.asList(T... a) — it iterates the array immediately and returns a typed List.",
    fu: [
      { q: "Why is Arrays.asList annotated with @SafeVarargs?",
        a: "Arrays.asList(T... a) stores the varargs array as the backing store of the returned List — which sounds unsafe, but is safe because the returned List is of type List<T> and the compiler ensures all elements inserted by the caller are T. The potential pollution would occur if someone got a reference to the backing array and inserted a non-T — but Arrays.asList returns a fixed-size List that does not expose the array, and set() also accepts T only. So while the method stores the array, the encapsulation of the List prevents external heap pollution. The @SafeVarargs is legitimate here. This contrasts with a method that returns the raw array or passes it to an untyped container." },
      { q: "How would you write a safe varargs method that collects elements into a List?",
        a: "Declare it as @SafeVarargs static <T> List<T> listOf(T... items) { List<T> result = new ArrayList<>(items.length); for (T item : items) result.add(item); return result; }. This is safe: the array is never stored, returned, or passed to an untyped method — it is iterated immediately and each element added individually to a typed List. The @SafeVarargs suppression is valid. You can confirm this by checking: (1) the array is never stored in a field, (2) the array is never returned, (3) the array is never passed to a method that accepts Object[] or a wider type. If any of these conditions fail, the method is not safe and the annotation would be a lie." }
    ]
  },
  {
    q: "What are reifiable types and why does instanceof with a generic type parameter not compile?",
    a: "A **reifiable type** is one whose complete type information is available at runtime. Primitives are reifiable. Non-generic class types are reifiable (String.class). Raw types are reifiable. Unbounded wildcards are reifiable (List<?> is reifiable — it means 'any List'). Parameterised generic types are NOT reifiable — List<String> loses the String at runtime. instanceof requires a reifiable type on its right-hand side. T is not reifiable (erased to Object), so if (obj instanceof T) is a compile error. List<String> is not reifiable, so if (x instanceof List<String>) is a compile error (though Java 16+ pattern matching allows instanceof List<?> with an unbounded wildcard). The fix for dynamic type checks on a type parameter T: use Class<T> token and call token.isInstance(obj). In production, this matters for generic deserialisers, type-safe caches, and any code that needs to branch on the type at runtime.",
    fu: [
      { q: "Java 16 introduced pattern matching for instanceof — how does it interact with generics?",
        a: "Java 16's instanceof pattern matching (if (obj instanceof String s)) works with reifiable types only — non-reifiable parameterised types like List<String> are still illegal. However, unbounded wildcard types are reifiable: if (obj instanceof List<?> list) is legal and binds list as List<?>. You can then use list.size() and list.get(0) (returning Object). To work with the actual element type, you still need a Class<T> token or TypeReference. Java 21's sealed classes and pattern matching for switch partially address this by allowing exhaustive checks over sealed hierarchies — if the sealed subtypes are reifiable, the patterns are exhaustive and type-safe without needing instanceof on parameterised types." },
      { q: "What is the difference between a non-reifiable type and an abstract type?",
        a: "A non-reifiable type (like List<String>) has full type information at compile time but loses it at runtime — it is a generic instantiation. An abstract type (like an abstract class or interface without a specific generic instantiation, like Number or Collection<E>) is a concrete erasure target — the type parameter E may still be present in the declaration but the abstract class itself is reifiable as Number.class or Collection.class. The distinction matters for reflection: Collection.class is valid and isAssignableFrom works normally. List<String>.class does not exist — you must use List.class and accept the raw type. The terms are orthogonal: abstract types can be reifiable (AbstractList.class), and non-abstract types can be non-reifiable (new ArrayList<String>() is of type ArrayList<String> which is non-reifiable)." }
    ]
  }
];

const codeBased = [
  {
    q: "Show how to implement a generic Pair<A,B> class with a swap() method that returns Pair<B,A> with types reversed.",
    a: `// Generic class: A and B are independent type parameters
package arch.day28;

class Pair<A, B> {
    final A first;
    final B second;

    Pair(A first, B second) {
        this.first = first;
        this.second = second;
    }

    // Return type is Pair<B, A> — types are flipped, not just values
    Pair<B, A> swap() {
        return new Pair<>(second, first); // diamond infers <B, A> from field types
    }

    @Override
    public String toString() { return "(" + first + ", " + second + ")"; }
}

// Usage:
Pair<String, Integer> p = new Pair<>("hello", 42);
// p.first  is String, p.second is Integer
Pair<Integer, String> swapped = p.swap();
// swapped.first is Integer (42), swapped.second is String ("hello")
System.out.println(p);       // (hello, 42)
System.out.println(swapped); // (42, hello)`,
    fu: [
      { q: "How would you add a map() method to Pair that transforms both values independently?",
        a: "Declare: <C, D> Pair<C, D> map(Function<A, C> fa, Function<B, D> fb) { return new Pair<>(fa.apply(first), fb.apply(second)); }. The method introduces two new type parameters C and D, independent of the class parameters A and B. Usage: Pair<String, Integer> p = new Pair<>(\"hello\", 3); Pair<Integer, String> mapped = p.map(String::length, Object::toString); // (5, \"3\"). This shows that a generic method on a generic class can introduce additional type parameters, and the diamond operator infers C and D from the Function return types." },
      { q: "How would you make Pair comparable when both elements are Comparable?",
        a: "Declare the class with bounded parameters: class ComparablePair<A extends Comparable<A>, B extends Comparable<B>> extends Pair<A, B> implements Comparable<ComparablePair<A, B>>. Implement: public int compareTo(ComparablePair<A, B> other) { int cmp = this.first.compareTo(other.first); return cmp != 0 ? cmp : this.second.compareTo(other.second); }. This uses the recursive bound pattern — A must be comparable to itself, B must be comparable to itself. The unbounded Pair<A, B> is not comparable because A and B might not implement Comparable." }
    ]
  },
  {
    q: "What does this code do, and what would the compiler say about it?\nList<Integer> ints = new ArrayList<>();\nList<Number> nums = ints;",
    a: `// This code does NOT compile. Error: incompatible types
// List<Integer> cannot be assigned to List<Number>

// Why: generics are INVARIANT — even though Integer extends Number,
// List<Integer> is NOT a subtype of List<Number>

// If it compiled, this would be legal:
nums.add(3.14); // adding Double to what is actually a List<Integer>
// Then:
Integer i = ints.get(0); // ClassCastException — it's a Double!

// The correct fix depends on what you need:
// READ-ONLY — use wildcard (covariant view):
List<? extends Number> readOnly = ints; // OK — can read Number, cannot write
// WRITE-ONLY — use super wildcard (contravariant):
List<? super Integer> writeOnly = new ArrayList<Number>(); // OK — can write Integer
writeOnly.add(42); // allowed

// Arrays would compile (covariant) but fail at runtime:
Number[] arr = new Integer[3]; // compiles
arr[0] = 3.14; // ArrayStoreException at runtime`,
    fu: [
      { q: "How would you write a method that accepts both List<Integer> and List<Double> for reading?",
        a: "Declare: static double sum(List<? extends Number> numbers). The ? extends Number wildcard makes the parameter covariant — it accepts List<Integer>, List<Double>, List<BigDecimal>, and any other List<? extends Number>. Inside the method, all reads return Number (the upper bound), so you call n.doubleValue(). You cannot call numbers.add(anything) except null — the wildcard prevents writes. This is the PECS producer pattern: the list is a producer of Number values. If you declared double sum(List<Number> numbers), it would reject List<Integer> entirely." },
      { q: "What is the difference between List<?> and List<Object>?",
        a: "List<Object> is a List whose elements are declared as Object — you can add any Object to it, and you read Object back. List<?> is a wildcard List of unknown element type — you can read Object, but you cannot add anything (except null). Critically, List<String> is NOT a subtype of List<Object> (invariance), so passing a List<String> where List<Object> is expected is a compile error. But List<String> IS a subtype of List<?>, so passing a List<String> where List<?> is expected compiles fine. Use List<Object> when you need a heterogeneous list you can add to. Use List<?> when you need to accept any list for read-only operations." }
    ]
  },
  {
    q: "Show the PECS pattern: write a sumProducer method that accepts List<Integer> and List<Double>, and a copyConsumer method that writes from a typed source into a wider destination.",
    a: `// PECS: Producer Extends, Consumer Super

// Producer: we READ from the list → use extends
// Accepts List<Integer>, List<Double>, List<Long> — any subtype of Number
static double sumProducer(List<? extends Number> src) {
    double total = 0;
    for (Number n : src) total += n.doubleValue(); // reads only
    return total;
}
// src.add(1.5) ← COMPILE ERROR — cannot write to producer wildcard

// Consumer: we WRITE to the list → use super
// Accepts List<Integer>, List<Number>, List<Object> as destination
static <T> void copyConsumer(List<? super T> dst, List<? extends T> src) {
    for (T item : src) dst.add(item); // writes to dst, reads from src
}

// Usage:
List<Integer> ints   = List.of(1, 2, 3);
List<Double>  dubs   = List.of(1.5, 2.0);
System.out.println(sumProducer(ints));  // 6.0
System.out.println(sumProducer(dubs));  // 3.5

List<Number> dest = new ArrayList<>();
copyConsumer(dest, ints);   // copies List<Integer> into List<Number> — safe
System.out.println(dest);   // [1, 2, 3]`,
    fu: [
      { q: "Why does Collections.sort use <T extends Comparable<? super T>> instead of <T extends Comparable<T>>?",
        a: "The ? super T in Comparable<? super T> allows an element T to be sorted using a comparator defined on a supertype of T. For example, if Apple extends Fruit and Fruit implements Comparable<Fruit>, then Apple is Comparable<? super Apple> but not Comparable<Apple>. With <T extends Comparable<T>>, Apple would be rejected because Apple.class does not implement Comparable<Apple>. With <T extends Comparable<? super T>>, Apple is accepted because it inherits Comparable<Fruit> which is Comparable<? super Apple>. This is a more permissive bound that allows sorting subtypes using a supertype's comparison logic, which is the common real-world case with entity hierarchies." },
      { q: "How would you write a merge method that merges two producer lists into a consumer list?",
        a: "Declare: static <T> void merge(List<? super T> dst, List<? extends T> src1, List<? extends T> src2). Both source lists are producers (extends), the destination is a consumer (super). Implementation: dst.addAll(src1); dst.addAll(src2); — or iterate manually for filtering. Usage: List<Number> result = new ArrayList<>(); merge(result, List.of(1, 2), List.of(3.5, 4.5)); — this accepts List<Integer> and List<Double> as sources and List<Number> as destination. The type T is inferred as Number from the destination's super bound. This is exactly how Collections.copy and Stream.concat work conceptually." }
    ]
  },
  {
    q: "What is wrong with this generic method and how do you fix it?\nstatic <T> T firstOrDefault(List<T> list) {\n    if (list.isEmpty()) return null;\n    return list.get(0);\n}",
    a: `// The method compiles and works, but has a subtle API design problem:
// returning null from a method with return type T is legal but dangerous.
// Callers get T back, assume it's non-null, and get NullPointerException.

// Modern fix 1: return Optional<T>
static <T> Optional<T> firstOrDefault(List<T> list) {
    return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
}
// Caller must handle empty explicitly: firstOrDefault(list).orElse(default)

// Modern fix 2: accept a default value (avoids Optional boxing cost)
static <T> T firstOrDefault(List<T> list, T defaultValue) {
    return list.isEmpty() ? defaultValue : list.get(0);
}
// Usage: String result = firstOrDefault(names, "unknown");

// Fix 3: annotate with @Nullable if null is intentional (in @NonNull-by-default codebase)
// @Nullable static <T> T firstOrNull(List<T> list) { ... }

// Root cause: T is a reference type — null is always assignable to T
// but callers often forget this when the type parameter looks concrete.
// Returning null from generic code is a design smell — prefer Optional<T>.`,
    fu: [
      { q: "How would you write a type-safe firstOrElseGet that accepts a Supplier<T> for the default?",
        a: "Declare: static <T> T firstOrElseGet(List<T> list, Supplier<T> defaultSupplier) { return list.isEmpty() ? defaultSupplier.get() : list.get(0); }. The Supplier<T> is lazy — it is only called when the list is empty, avoiding unnecessary computation. Usage: firstOrElseGet(names, () -> loadDefaultName()). The type T is inferred from both the list and the Supplier, so no explicit type witness is needed. This is the pattern used in Optional.orElseGet() — prefer it over Optional.orElse() when the default is expensive to compute." },
      { q: "Why cannot you write return (T) null in a generic method without an unchecked warning?",
        a: "return null is fine — null is assignable to any reference type and requires no cast. return (T) null would generate an unchecked warning because the compiler cannot verify the cast — T is erased. The cast is also unnecessary and confusing. The warning comes from the cast, not the null. In practice, never cast null — just return null or an empty Optional. If you see (T) null in code, it indicates the developer was confused about how null and generics interact. The only legitimate use of (T) cast on null would be to disambiguate overloaded methods, which is a code smell suggesting the overloads should be renamed." }
    ]
  },
  {
    q: "Show how to implement a type-safe heterogeneous container that stores and retrieves values by their Class<T> key.",
    a: `// Typesafe Heterogeneous Container — Effective Java Item 33
// Key: Class<T> is both the key and the type token for the stored value.

import java.util.*;

class TypeSafeRegistry {
    private final Map<Class<?>, Object> store = new HashMap<>();

    // put: type safety guaranteed — the compiler ensures val is T
    public <T> void put(Class<T> key, T val) {
        Objects.requireNonNull(key, "key");
        store.put(key, val);
    }

    // get: Class.cast() performs a CHECKED cast — better than (T) unchecked cast
    // If the stored value is not T, ClassCastException with a clear message
    public <T> T get(Class<T> key) {
        return key.cast(store.get(key)); // safe — put() enforced T at insertion
    }
}

TypeSafeRegistry reg = new TypeSafeRegistry();
reg.put(String.class,  "hello");
reg.put(Integer.class, 42);
reg.put(Double.class,  3.14);

String s  = reg.get(String.class);  // "hello" — no cast needed by caller
Integer i = reg.get(Integer.class); // 42
// reg.get(Long.class) returns null — Long was never stored`,
    fu: [
      { q: "How would you add a getOrDefault method to TypeSafeRegistry?",
        a: "Declare: public <T> T getOrDefault(Class<T> key, T defaultVal) { Object stored = store.get(key); return stored == null ? defaultVal : key.cast(stored); }. The default value is of type T, enforced by the compiler. This is safer than returning null — callers provide a meaningful default at the call site rather than checking for null everywhere. Usage: String name = reg.getOrDefault(String.class, \"anonymous\"). The Class.cast() on the stored value is still needed because store.get() returns Object — the cast is checked and will throw ClassCastException if somehow a wrong type was stored (which should not happen if put() was used correctly)." },
      { q: "What happens if you try to use a generic Class token like Class<List<String>> with this registry?",
        a: "Class<List<String>> does not exist as a distinct Class object — due to erasure, List<String>.class is a compile error. The closest you can get is List.class (of type Class<List>), which loses the String type argument. Storing reg.put(List.class, new ArrayList<String>()) and retrieving reg.get(List.class) gives you a raw List — the String is gone. For nested generic types, you need a ParameterizedTypeReference or TypeToken approach (Guava's TypeToken, Jackson's TypeReference) that captures the full generic signature using anonymous subclassing. This is a fundamental limitation of the Class<T> token pattern — it works perfectly for non-generic types but not for parameterised types." }
    ]
  },
  {
    q: "What is wrong with this code and what ClassCastException will occur?\nList strings = new ArrayList();\nstrings.add(\"hello\");\nstrings.add(42); // Integer added to raw List\nfor (Object o : strings) {\n    String s = (String) o; // explicit cast\n}",
    a: `// This compiles with 'unchecked or unsafe' warnings — and WILL throw at runtime.

// Problem: 'strings' is a raw List — no type parameter.
// The compiler allows adding Integer to it (no type check on raw types).
// The ClassCastException occurs when (String) o tries to cast 42 (Integer) to String.

// Execution trace:
// strings = [hello, 42]
// Iteration 1: o = "hello" → (String) "hello" → OK → s = "hello"
// Iteration 2: o = 42 (Integer) → (String) 42 → THROWS ClassCastException
// Exception: class java.lang.Integer cannot be cast to class java.lang.String

// The exception site is the CAST — not the strings.add(42) line.
// This is heap pollution: the list contains non-String elements.

// Fix 1: use typed List
List<String> typed = new ArrayList<>();
typed.add("hello");
// typed.add(42); // COMPILE ERROR — caught before runtime

// Fix 2: use instanceof check before cast (defensive, for legacy raw code)
for (Object o : strings) {
    if (o instanceof String s) { // Java 16+ pattern matching
        System.out.println(s);
    } else {
        System.err.println("Unexpected element type: " + o.getClass().getSimpleName());
    }
}`,
    fu: [
      { q: "How would you safely convert a legacy raw List into a typed List<String>?",
        a: "Create a typed copy with validation: static List<String> toStringList(List<?> raw) { List<String> result = new ArrayList<>(raw.size()); for (Object item : raw) { if (!(item instanceof String)) throw new IllegalArgumentException(\"Expected String, got: \" + (item == null ? \"null\" : item.getClass().getSimpleName())); result.add((String) item); } return result; }. This performs a checked conversion at the boundary — one @SuppressWarnings is not needed because we cast after instanceof. The error message names the actual type, making debugging far easier than a bare ClassCastException. Alternatively, use Guava's Lists.transform() with a type-safe mapping function." },
      { q: "Why does the ClassCastException mention 'class java.lang.Integer cannot be cast to class java.lang.String' rather than listing the variable name?",
        a: "The ClassCastException message is generated by the JVM's checkcast instruction, which knows the source class (Integer) and the target class (String) from the bytecode. It does not know the variable name because variable names are debug symbols — available in .class metadata if compiled with -g but not available to the runtime cast operation. This is why debugging ClassCastExceptions in generic code requires correlating the exception with the source line number (from the stack trace) and manually identifying which variable holds the Integer. Modern JVMs (Java 14+) with JVM option -XX:+ShowCodeDetailsInExceptionMessages include the variable name in the message." }
    ]
  },
  {
    q: "Show how a generic method with a recursive bound sorts a list in place and returns the max element.",
    a: `// Recursive bound <T extends Comparable<T>> means T can compare to itself.
// This is how Collections.sort, TreeMap, PriorityQueue are all parameterised.

import java.util.*;

// Sort in place — T must be Comparable to itself
static <T extends Comparable<T>> void sort(List<T> list) {
    // Delegates to Collections.sort — which also uses <T extends Comparable<? super T>>
    // Our version is simpler — good enough for most cases
    list.sort(Comparator.naturalOrder());
}

// Find max without modifying the list
static <T extends Comparable<T>> T max(List<T> list) {
    if (list.isEmpty()) throw new NoSuchElementException("Empty list");
    T result = list.get(0);
    for (T item : list) {
        if (item.compareTo(result) > 0) result = item;
    }
    return result;
}

// Works with any Comparable type:
List<Integer> ints = new ArrayList<>(List.of(3, 1, 4, 1, 5, 9));
sort(ints);
System.out.println(ints);    // [1, 1, 3, 4, 5, 9]
System.out.println(max(ints)); // 9

List<String> words = new ArrayList<>(List.of("banana", "apple", "mango"));
sort(words);
System.out.println(words);   // [apple, banana, mango]
System.out.println(max(words)); // mango`,
    fu: [
      { q: "Why does the JDK use <T extends Comparable<? super T>> instead of <T extends Comparable<T>>?",
        a: "The ? super T version is more permissive. If Apple extends Fruit and Fruit implements Comparable<Fruit>, then Apple does not implement Comparable<Apple> — it only implements Comparable<Fruit>. With <T extends Comparable<T>>, Apple would be rejected because Comparable<Fruit> does not match Comparable<Apple>. With <T extends Comparable<? super T>>, Apple is accepted because Comparable<Fruit> satisfies Comparable<? super Apple> — Fruit is a supertype of Apple. In practice, most entity hierarchies implement comparison at a parent level, so the ? super T form is necessary to allow sorting of subtype lists using inherited comparison logic." },
      { q: "How would you write a generic minMax method that returns both minimum and maximum in a single pass?",
        a: "Declare: static <T extends Comparable<T>> Pair<T, T> minMax(List<T> list) { if (list.isEmpty()) throw new NoSuchElementException(); T min = list.get(0), max = list.get(0); for (T item : list) { if (item.compareTo(min) < 0) min = item; if (item.compareTo(max) > 0) max = item; } return new Pair<>(min, max); }. Single pass O(n), returns a Pair<T,T> with min and max. The Pair class requires no additional bounds — it just holds two T values. The recursive bound ensures T can compare to itself. Usage: Pair<Integer, Integer> mm = minMax(List.of(3, 1, 4, 1, 5)); mm.first() is 1, mm.second() is 5." }
    ]
  },
  {
    q: "Demonstrate how to create a generic stack that rejects null elements and provides a type-safe pop-or-default operation.",
    a: `// Generic stack with null rejection and type-safe fallback pop

import java.util.*;

class TypedStack<E> {
    private final Deque<E> storage = new ArrayDeque<>();

    // push: reject null explicitly — null in generic collections is a common bug
    void push(E element) {
        Objects.requireNonNull(element, "TypedStack does not accept null");
        storage.push(element);
    }

    // pop: throws if empty — caller must check isEmpty() first
    E pop() {
        if (storage.isEmpty()) throw new NoSuchElementException("Stack is empty");
        return storage.pop();
    }

    // Type-safe pop with default — avoids null return
    E popOrDefault(E defaultValue) {
        return storage.isEmpty() ? defaultValue : storage.pop();
    }

    // peek without removal
    Optional<E> peek() {
        return storage.isEmpty() ? Optional.empty() : Optional.of(storage.peek());
    }

    int size() { return storage.size(); }
    boolean isEmpty() { return storage.isEmpty(); }
}

// Usage:
TypedStack<String> stack = new TypedStack<>();
stack.push("first");
stack.push("second");
System.out.println(stack.pop());            // "second"
System.out.println(stack.popOrDefault("fallback")); // "first"
System.out.println(stack.popOrDefault("fallback")); // "fallback" — stack empty
// stack.push(null); // throws NullPointerException with clear message`,
    fu: [
      { q: "How would you add a map operation that transforms all elements and returns a new TypedStack<R>?",
        a: "Declare: <R> TypedStack<R> map(Function<E, R> transform) { TypedStack<R> result = new TypedStack<>(); List<E> elements = new ArrayList<>(storage); Collections.reverse(elements); for (E e : elements) result.push(transform.apply(e)); return result; }. The reversal preserves stack order — elements are stored in LIFO order internally, so iterating and pushing in reverse order recreates the stack with transformed elements in the same logical order. The method introduces a new type parameter R on the method (not the class), so it does not change the class signature." },
      { q: "Why prefer Deque<E> over Stack<E> as the backing structure?",
        a: "Stack<E> extends Vector<E>, which synchronises every operation including iteration. In single-threaded code, this is unnecessary overhead. Vector was a legacy Java 1.0 class; its thread-safety comes from synchronized methods — too coarse-grained for modern concurrent use anyway. ArrayDeque<E> is the recommended replacement: it is resizable, not synchronised (correct for single-threaded use), and faster than Stack for most operations. For concurrent use, use ConcurrentLinkedDeque or LinkedBlockingDeque — not Stack. The Java documentation explicitly recommends Deque over Stack: 'A more complete and consistent set of LIFO stack operations is provided by the Deque interface.'" }
    ]
  },
  {
    q: "Show how to use a Comparator with generic type parameters to sort a list of custom objects by multiple fields.",
    a: `// Generic multi-field Comparator using Comparator.comparing and thenComparing

record Employee(String name, String department, int salary) {}

// Build a comparator: sort by department, then by salary descending, then by name
Comparator<Employee> byDeptThenSalaryDesc =
    Comparator.comparing(Employee::department)       // primary: department ASC
              .thenComparingInt(Employee::salary)    // secondary: salary ASC
              .reversed()                            // reverses BOTH fields
              .thenComparing(Employee::name);        // tertiary: name ASC after reversal

// Note: reversed() reverses the entire chain so far.
// Better approach for mixed directions:
Comparator<Employee> mixed =
    Comparator.comparing(Employee::department)            // department ASC
              .thenComparing(Comparator.comparingInt(Employee::salary).reversed()) // salary DESC
              .thenComparing(Employee::name);             // name ASC

List<Employee> staff = new ArrayList<>(List.of(
    new Employee("Alice",   "Engineering", 90000),
    new Employee("Bob",     "Engineering", 85000),
    new Employee("Carol",   "Marketing",   75000),
    new Employee("Dave",    "Engineering", 90000)
));
staff.sort(mixed);
// Result: Engineering-Alice-90000 and Engineering-Dave-90000 first (tied dept+salary),
//         then Engineering-Bob-85000, then Marketing-Carol-75000`,
    fu: [
      { q: "How does Comparator.comparing know the type parameters automatically?",
        a: "Comparator.comparing(Employee::department) is a generic static method: static <T, U extends Comparable<U>> Comparator<T> comparing(Function<? super T, ? extends U> keyExtractor). The type T is inferred from the method reference target — Employee::department maps Employee to String, so T = Employee and U = String. The compiler infers both type parameters from the lambda/method reference without explicit witnesses. This is Java 8's improved type inference at work — method references carry enough information for the compiler to resolve the full generic signature. The returned Comparator<Employee> is fully typed, so subsequent thenComparing calls also know T = Employee." },
      { q: "What is the difference between Comparator.comparingInt and Comparator.comparing with an Integer key?",
        a: "Comparator.comparingInt uses a ToIntFunction — a functional interface that returns a primitive int, avoiding autoboxing. Comparator.comparing with Employee::salary (returning int) would autobox to Integer. For large sort operations on primitive fields, comparingInt, comparingLong, and comparingDouble avoid the boxing overhead — each element comparison would box and unbox the int otherwise. In microbenchmarks on large lists (100k+ elements), the difference is measurable. In practice, prefer comparingInt for any Comparator on int/long/double fields. The JDK sort algorithms perform many comparisons per sort — reducing per-comparison allocations matters." }
    ]
  },
  {
    q: "Show the difference between List.copyOf(), Collections.unmodifiableList(), and Collections.checkedList() with respect to generics and type safety.",
    a: `// Three ways to wrap a List — different type-safety and mutability guarantees

import java.util.*;

List<String> source = new ArrayList<>(List.of("a", "b", "c"));

// 1. List.copyOf() — immutable snapshot, rejects null, separate backing array
List<String> copy = List.copyOf(source);
// copy is a separate object — changes to source do NOT affect copy
source.add("d");
System.out.println(copy);   // [a, b, c] — unchanged
// copy.add("e"); // UnsupportedOperationException

// 2. Collections.unmodifiableList() — immutable VIEW of the same list
List<String> view = Collections.unmodifiableList(source);
source.add("e");
System.out.println(view);   // [a, b, c, d, e] — reflects source changes!
// view.add("f"); // UnsupportedOperationException — but source.add() still works

// 3. Collections.checkedList() — runtime type-check on every add
// Useful when passing a List<String> to legacy raw-typed code that might insert wrong type
List<String> checked = Collections.checkedList(new ArrayList<>(), String.class);
checked.add("ok");         // fine
List raw = checked;        // assign to raw type (simulating legacy code)
try {
    raw.add(42);           // ClassCastException HERE — not at read time!
} catch (ClassCastException e) {
    System.out.println("checkedList caught: " + e.getMessage());
}
// Heap pollution prevented — the ClassCastException is at the insert site`,
    fu: [
      { q: "When would you use Collections.checkedList in production?",
        a: "Use checkedList when you must pass a typed List to a legacy API that accepts a raw List and might insert wrong-typed elements — and you need the ClassCastException to occur at the insert site (in the legacy code) rather than at your read site (in your code). Without checkedList, heap pollution occurs silently and the error surfaces far from the source. With checkedList, the ClassCastException names the attempted type in the message, and the stack trace points to the legacy code. This is a defensive wrapper for integration boundaries with untrusted or uncontrolled code. In modern pure-generic codebases it is rarely needed." },
      { q: "What is the difference between List.of() and Collections.unmodifiableList(new ArrayList<>())?",
        a: "List.of() (Java 9+) creates a truly immutable list backed by an array — it rejects nulls at creation time, throws NullPointerException on null elements, and throws UnsupportedOperationException on all mutating operations including set() and sort(). Collections.unmodifiableList() creates an unmodifiable view over an existing modifiable list — changes to the backing list are reflected in the view. List.of() is preferred for truly immutable data because it has no hidden mutable backing structure. unmodifiableList is useful when you need to expose a mutable internal list as read-only to external callers while retaining internal mutation capability." }
    ]
  }
];

const seniorScenarios = [
  {
    q: "Your team is migrating a 200k-line codebase from Java 8 to Java 17. The codebase has over 400 raw-type usages flagged by -Xlint:unchecked. The team lead wants to finish in two weeks. How do you plan and execute this safely?",
    a: `**(1) Immediate response**

Do not attempt a big-bang migration. A 400-location change in two weeks across a 200k-line codebase has high probability of introducing regressions if done unsafely. First action: classify the 400 locations by blast radius — public API boundaries (method signatures visible to other packages) are highest priority; private local variables are lowest. Run javac -Xlint:unchecked to get the complete list and pipe to a CSV.

**(2) Root cause**

Raw types accumulate through two channels: legacy third-party libraries that return raw collections, and developers who copy-paste old code or silence warnings with @SuppressWarnings without fixing the root cause. In both cases the type information is lost at the boundary and must be recovered with an unchecked cast. The migration is not just syntactic — it requires understanding where the type contract is actually broken versus where it is technically broken but safe.

**(3) Fix**

Week 1 — Public API boundaries first:
1. Add -Xlint:unchecked to Maven/Gradle compiler config in CI so every new raw type fails the build.
2. Classify all 400 locations into: (a) fixable — add type parameter, (b) boundary — needs a typed wrapper, (c) third-party — needs an adapter.
3. Fix all (a) locations in small, reviewable PRs grouped by package. Each PR has a test that verifies no raw-type usage in the changed files.
4. For (b) and (c) locations, create typed wrapper methods with a single isolated @SuppressWarnings and a comment explaining the assumption.

Week 2 — Internal usages:
5. Fix remaining private/local usages. These are lower risk but large in number.
6. Add a ArchUnit test: noClasses().that().haveModifier(PACKAGE).should().useRawTypeOf(Collection.class) to enforce the rule permanently.

**(4) Prevention**

Enforce zero raw-type tolerance in CI permanently with -Xlint:unchecked -Werror on compiler configuration. Add a code review checklist item: "No raw generic types in method signatures." Add the ArchUnit test to the test suite. Schedule a 30-minute retro after the migration to document the wrapper patterns created so future integrations use the same pattern.`,
    fu: [
      { q: "How would you handle a third-party library that returns a raw Map with no way to parameterise it?",
        a: "Create a single typed adapter class in your codebase: class LegacyAdapter { @SuppressWarnings(\"unchecked\") static Map<String, Order> getOrders(LegacyClient client) { return (Map<String, Order>) client.getRawOrders(); } }. Document the assumption explicitly — include a reference to the library Javadoc or issue tracker confirming the contract. Write an integration test that verifies the returned map contains Order values. All code in your codebase calls LegacyAdapter.getOrders(), never the raw method directly. When the library is eventually updated to return a typed map, there is exactly one place to remove the cast. This isolation strategy is the correct answer for any legacy boundary — never let the unchecked cast spread across the codebase." },
      { q: "What ArchUnit rule would enforce that all @SuppressWarnings(unchecked) annotations are only on methods in adapter classes?",
        a: "ArchUnit rule: noClasses().that().resideOutsideOfPackage(\"..adapter..\").should().beAnnotatedWith(SuppressWarnings.class).withAnnotationValue(\"unchecked\"). Refine with: methods().that().areAnnotatedWith(SuppressWarnings.class).and().haveAnnotationParameter(\"value\").containing(\"unchecked\").should().beDeclaredInClassesThat().resideInAPackage(\"..adapter..\"). This enforces that unchecked suppressions live only in adapter packages, making them discoverable in code review and preventing the pattern from spreading. Run this test in CI as part of the architecture fitness test suite." }
    ]
  },
  {
    q: "A production incident: a Jackson deserialisation call is returning List<LinkedHashMap<String, Object>> instead of List<Order>. Orders are stored in Kafka as JSON. The team is confused why Spring is not converting the maps to Order objects. How do you diagnose and fix this?",
    a: `**(1) Immediate response**

This is a classic type erasure / missing TypeReference incident — not a Kafka or serialisation library bug. The service is probably running, but downstream code that casts LinkedHashMap to Order is throwing ClassCastException. Immediate action: check the error logs for ClassCastException with LinkedHashMap in the message. If the service is throwing and dropping messages, check the dead-letter topic in Kafka for the volume of failed messages. Do NOT restart — the issue will recur on every message.

**(2) Root cause**

Jackson's ObjectMapper.readValue(json, List.class) or readValue(json, List.class) erases the type argument at runtime. Jackson sees List — a raw type — and defaults to List<LinkedHashMap<String, Object>> because that is the natural JSON representation without a target type. The developer used a Class<List> token (e.g., List.class) which cannot carry the Order type argument due to erasure. The fix requires TypeReference<List<Order>> which captures the full ParameterizedType through anonymous subclassing — this survives erasure as metadata.

**(3) Fix**

Immediate code fix — change the deserialisation call:
\`\`\`java
// WRONG — type argument erased, returns List<LinkedHashMap>:
List<Order> orders = mapper.readValue(json, List.class);

// CORRECT — TypeReference captures the full generic type:
List<Order> orders = mapper.readValue(json,
    new TypeReference<List<Order>>() {});
\`\`\`
If using Spring Kafka's KafkaListener with automatic deserialisation, configure the deserialiser:
\`\`\`java
factory.setValueDeserializer(new JsonDeserializer<>(Order.class));
// For List<Order> — provide TypeReference:
factory.setValueDeserializer(new JsonDeserializer<>(
    new TypeReference<List<Order>>() {}));
\`\`\`
Deploy the fix. Replay the failed messages from the dead-letter topic.

**(4) Prevention**

Add a unit test that deserialises a List<Order> JSON and asserts that the result is not a List<LinkedHashMap>: assertThat(result.get(0)).isInstanceOf(Order.class). Add this to the PR template for any code that uses ObjectMapper. Document the correct TypeReference pattern in the team wiki's "Jackson patterns" page. Add SonarQube or IntelliJ inspection rules that flag readValue(json, List.class) — raw class token for collection types.`,
    fu: [
      { q: "If the Order class has generic fields itself (like List<LineItem>), what additional consideration is needed?",
        a: "Nested generics require TypeReference to capture all levels. TypeReference<List<Order>> captures List<Order> correctly, and Jackson will then deserialise each Order object by reading Order.class. If Order has fields like List<LineItem> items, Jackson reads the field's declared generic type (List<LineItem>) from the class metadata using reflection on the field. This works as long as the field is declared with the full generic type in the source — not as a raw List. If Order were a generic class (Order<T>), the situation is harder: Jackson cannot infer T without explicit configuration, and you would need a JavaType built from TypeFactory.constructParametricType(Order.class, LineItem.class). Always use concrete (non-generic) entity classes for Kafka message types." },
      { q: "How would you write a generic deserialiser utility method that accepts a TypeReference and handles the checked exception?",
        a: "Declare: static <T> T deserialise(ObjectMapper mapper, String json, TypeReference<T> type) { try { return mapper.readValue(json, type); } catch (JsonProcessingException e) { throw new IllegalArgumentException(\"Failed to deserialise: \" + e.getOriginalMessage(), e); } }. Wrapping the checked exception in IllegalArgumentException is appropriate here because the JSON content violation is a programming error (wrong format), not a recoverable runtime condition. Usage: List<Order> orders = deserialise(mapper, json, new TypeReference<>() {}). Java 11+ can infer the TypeReference type argument from context, so new TypeReference<>() {} is valid without repeating List<Order>." }
    ]
  },
  {
    q: "You are reviewing a PR that adds a new generic repository pattern to the shared platform library. The developer has implemented <T> T save(T entity). A principal engineer raises concerns about the API design. What are the concerns and how do you improve it?",
    a: `**(1) Immediate response**

The immediate concern is that <T> T save(T entity) is an unrestricted generic method — T has no bound, so the compiler will accept any type. save(\"hello\") and save(42) both compile, and the implementation must handle arbitrary types at runtime with unchecked casts or instanceof checks. This is poor generic API design. Call it out in the PR with a concrete suggestion before it merges.

**(2) Root cause**

The developer confused "generic" (flexible) with "correct generic design" (flexible within a defined contract). An unbounded T means: "I promise nothing about what this method does with the argument." The correct pattern bounds T to a marker interface or abstract class that defines the entity contract — for example, <T extends Entity> T save(T entity) where Entity defines getId(), getVersion(), etc. Better still: the repository itself should be generic, not just the method: class Repository<T extends Entity<ID>, ID> with T save(T entity) — this way, the repository and its operations are all tied to the same type.

**(3) Fix**

1. Define an Entity marker interface: interface Entity<ID> { ID getId(); }
2. Redesign the repository as a generic class: class Repository<T extends Entity<ID>, ID> { T save(T entity) { ... } Optional<T> findById(ID id) { ... } }
3. Concrete repositories extend it: class OrderRepository extends Repository<Order, Long> — no generics needed at the call site.
4. The save() return type remains T — allowing callers to use fluent patterns: Order saved = orderRepo.save(new Order(...)).
5. Add a bounded type witness check in tests: verify that Repository<String, Long> does not compile — String does not extend Entity<Long>.

**(4) Prevention**

Add a generic API design section to the platform library's contributing guide: "Generic type parameters must have bounds that reflect the contract of the generic operation. Unbounded type parameters (<T>) are acceptable only for pure pass-through utilities (copy, swap, identity). All entity-facing generic methods must bound T to the entity supertype." Schedule a 30-minute architecture review for all new generic types added to the shared platform library — generic public APIs are permanent once published.`,
    fu: [
      { q: "How would you enforce at compile time that only Entity subtypes can be used with Repository?",
        a: "The bound <T extends Entity<ID>> in the class declaration is the enforcement — any attempt to instantiate Repository<String, Long> fails to compile because String does not extend Entity<Long>. For additional runtime enforcement (defending against reflective instantiation or raw types), add a guard in the constructor: if (!Entity.class.isAssignableFrom(entityClass)) throw new IllegalArgumentException(entityClass + \" is not an Entity\"). Pass Class<T> as a constructor parameter for the Class.cast() pattern and this guard. ArchUnit can enforce: genericClasses().that().areAssignableTo(Repository.class).should().haveTypeParameter(\"T\").withBound(Entity.class) — run this in CI to prevent future developers from adding Repository subclasses with wrong bounds." },
      { q: "What are the binary compatibility implications of changing a generic method signature in a shared library?",
        a: "Changing <T> T save(T entity) to <T extends Entity<ID>, ID> T save(T entity) is a binary-incompatible change — the method signature changes, so compiled callers that linked against the old binary will throw NoSuchMethodError at runtime. The correct approach is: (1) deprecate the old method, (2) add the new bounded method with a different name or in a new version of the library, (3) require callers to upgrade. Semantic versioning: this is a major version change (breaking the API). If the library is internal (one organisation, monorepo), coordinate migration across all callers before merging. If the library is external (published to Maven), a new major version is mandatory. Never silently change method signatures in published libraries." }
    ]
  },
  {
    q: "Your team's REST API uses Jackson for serialisation. A new developer added a field of type Object to a response DTO, and now consumers are getting LinkedHashMap instead of the expected CustomerProfile. Stakeholders want it fixed without a breaking API change. How do you approach this?",
    a: `**(1) Immediate response**

A field typed as Object in a JSON-serialised DTO is a Jackson type erasure problem: during deserialisation, Jackson does not know the concrete type, defaults to LinkedHashMap for JSON objects, and produces Map<String, Object> — not CustomerProfile. The API is live and consumers cannot be broken. Immediate action: identify all consumers (check API gateway logs) and the exact field names causing the issue. A temporary fix is to annotate the field with @JsonTypeInfo to embed type metadata — but this changes the JSON format, so coordinate with consumers first.

**(2) Root cause**

The developer used Object as the field type to make the DTO "flexible" — a classic mistake. Object fields in JSON DTOs break consumer deserialisation because Jackson has no type hint. The real design problem is that the DTO should model the domain precisely: if the field is always CustomerProfile, it should be CustomerProfile. If it can be different types (CustomerProfile, BusinessProfile), use a sealed interface hierarchy with @JsonSubTypes.

**(3) Fix**

Without breaking existing consumers:
1. Change Object to CustomerProfile if the field is always that type — this is backward-compatible for consumers receiving JSON (the JSON shape does not change; they already get the right fields, they just could not deserialise cleanly).
2. If the field is polymorphic, add @JsonTypeInfo and @JsonSubTypes with use = EXISTING_PROPERTY and an existing field as the discriminator — this avoids adding a new type field to the JSON.
3. Annotate with @JsonDeserialize(as = CustomerProfile.class) on the field as a quick fix if changing the declared type is blocked by other constraints.
4. Deploy to staging, run consumer integration tests, verify shape has not changed.
5. Add a Jackson serialisation round-trip test to CI: serialise → deserialise → assert(result instanceof CustomerProfile).

**(4) Prevention**

Ban Object, Map<String, Object>, and raw JSON (JsonNode as fields) in DTO classes through a custom ArchUnit rule: noFields().that().areDeclaredInClassesThat().haveNameEndingWith("DTO").should().haveRawType(Object.class). Require a typed DTO review in the PR template: "Confirm all DTO fields have concrete types or sealed hierarchy with @JsonSubTypes."`,
    fu: [
      { q: "How does @JsonTypeInfo work and what are the trade-offs between NAME and CLASS type inclusion?",
        a: "@JsonTypeInfo configures how Jackson embeds and reads type information in JSON. With use = NAME and include = PROPERTY, Jackson adds a type discriminator field (e.g., \"type\": \"customer\") to the JSON — consumers must include this field and register all subtypes with @JsonSubTypes. This is explicit and human-readable but requires maintaining the mapping. With use = CLASS and include = PROPERTY, Jackson embeds the fully qualified class name — no @JsonSubTypes needed but the JSON is tied to your package structure, breaking if you refactor. For public APIs, prefer NAME — it decouples the JSON contract from your internal class names. For internal services in a monorepo, CLASS is acceptable with the understanding that class names must not change without coordinating consumer updates." },
      { q: "If you cannot change the DTO because it is a contract used by 50 consumers, how do you handle the type information problem?",
        a: "Add a custom Jackson deserialiser for the DTO field: @JsonDeserialize(using = ProfileDeserialiser.class) class ProfileDeserialiser extends StdDeserialiser<Object>. Inside deserialise(), use a discriminator field already present in the JSON (a 'profileType' or 'accountType' field) to instantiate the correct type: if (\"CUSTOMER\".equals(node.get(\"profileType\").asText())) return mapper.treeToValue(node, CustomerProfile.class). This approach adds zero new fields to the JSON — it uses an existing discriminator — and all existing consumers continue working. The 50 consumers only need to update if they themselves need to deserialise the polymorphic field correctly; consumers that only forward the JSON are unaffected." }
    ]
  },
  {
    q: "A team member claims that generics add no runtime overhead and the team should use them everywhere freely. How do you respond in a design review?",
    a: `**(1) Immediate response**

Partially correct, but incomplete. Generics add no overhead for the type-checking operations themselves — erasure means no runtime type dispatch cost for generic reads. However, claiming "no overhead at all" is wrong in two important ways: autoboxing and bridge methods. Correct the framing in the design review and provide the nuanced picture.

**(2) Root cause**

The team member is conflating "generics are erased at runtime" (true) with "generics have no runtime cost" (false under certain conditions). The common misunderstanding: because List<String> and List<Integer> are the same class at runtime, there is no dispatch overhead comparing the two. That is true. But the generic container still boxes primitives — storing an int in a List<Integer> allocates an Integer object on the heap for every element. This is the dominant cost that developers overlook.

**(3) Fix**

Correct framing for the design review:
- Generic type-checking: zero runtime cost — erased.
- Autoboxing for primitive type parameters: real allocation cost. List<Integer>, Map<String, Integer>, Optional<Integer> all box on every insertion and unbox on every read.
- Bridge methods: real but negligible — one extra virtual dispatch per polymorphic call through a generic supertype.
- TypeReference anonymous subclasses: one extra class per type token — negligible.

Guidance: use generics freely for reference types. For hot paths that process large arrays of primitives (financial calculations, image processing, numerical simulation), prefer primitive arrays or specialised collections (Eclipse Collections, Trove, Vavr) over List<Integer>. Java's Project Valhalla (planned) will address this with value types and specialised generics.

**(4) Prevention**

Add a performance design review guideline: "For collections expected to contain more than 1000 primitive numeric elements in a hot path, benchmark boxed generic collections vs primitive arrays before committing to the generic API." Reference JMH for benchmarks. This does not mean avoiding generics — it means knowing when they cost something.`,
    fu: [
      { q: "How would you benchmark the cost of boxed vs unboxed collection operations in Java?",
        a: "Use JMH (Java Microbenchmark Harness). Write two benchmarks: @Benchmark int sumBoxed() — iterates a List<Integer> with 10,000 elements and sums them; @Benchmark int sumPrimitive() — iterates an int[] of the same size. Run with throughput mode, 5 warm-up iterations, 10 measurement iterations. On typical JVM configurations, primitive arrays are 2–5× faster for numerical summation due to no unboxing and better cache locality (no pointer chasing to heap-allocated Integer objects). The JIT can sometimes eliminate boxing for small arrays through escape analysis — to get realistic numbers, use arrays larger than the JIT's threshold (typically 64 elements for loop unrolling)." },
      { q: "What is Project Valhalla and how does it change the generics overhead picture?",
        a: "Project Valhalla (ongoing, partially available in Java 22+ previews) introduces value classes — types that behave like primitives: no identity, allocated on the stack or inline in arrays, no object header overhead. With Valhalla's universal generics, List<int> (primitive int, not Integer) would be possible — the JVM would specialise the generic container for the primitive type, eliminating boxing. This is the fundamental architectural change that addresses the autoboxing overhead of current Java generics. Until Valhalla ships as a stable feature, the practical workaround remains: use int[] for hot primitive arrays, consider Eclipse Collections' IntList, and accept that generic collections of primitives have boxed overhead. Watch JEP 401 (Value Classes and Objects) for the timeline." }
    ]
  }
];

const wrongAnswers = [
  "Generics are checked at runtime by the JVM — the JVM enforces that a List<String> only contains Strings at runtime, which is why ClassCastException happens immediately when you insert the wrong type. In reality, generics are erased at runtime; the JVM has no knowledge of the String type argument. ClassCastException occurs at the READ site where the compiler inserted a checkcast instruction, not at the insert site.",
  "You can use instanceof with generic type parameters: if (obj instanceof T) is valid Java that works correctly. This is false — instanceof requires a reifiable type, and T is not reifiable (it is erased to its bound or Object). The correct approach is to pass a Class<T> token and use token.isInstance(obj) for dynamic type checks inside generic code.",
  "List<String> is a subtype of List<Object> because String extends Object, just like String[] is a subtype of Object[]. This is wrong — generics are invariant. List<String> is NOT a subtype of List<Object>. Arrays are covariant (String[] extends Object[]), which is a Java design flaw. Generics were made invariant to avoid the ArrayStoreException problem that covariant arrays allow.",
  "A wildcard List<?> is the same as List<Object> — both accept any type and both allow adding any object. This is wrong. List<Object> allows add() — you can insert any Object. List<?> does not allow add() of anything except null — the wildcard means the element type is unknown and the compiler cannot verify type safety for writes. List<String> is not a subtype of List<Object> (invariance), but it IS a subtype of List<?> (wildcard covariance).",
  "@SafeVarargs prevents heap pollution from occurring — the annotation makes the varargs method safe by adding a runtime check. This is false. @SafeVarargs is a compile-time annotation that suppresses the 'possible heap pollution' warning. It adds zero runtime checking. It is a promise from the developer to the compiler that the method is safe — the JVM does nothing differently. If the promise is wrong (the method stores or returns the varargs array), heap pollution still occurs.",
  "new T() is legal inside a generic class — you can instantiate the type parameter directly. This is false. T is erased to Object (or its bound) at runtime, so new T() would be equivalent to new Object() — not the concrete type. This is a compile error: 'Cannot instantiate the type T'. The fix is to pass a Class<T> token and use token.getDeclaredConstructor().newInstance().",
  "Wildcards and type parameters are interchangeable — wherever you write <? extends Number> you can also write <T extends Number> with the same result. This is wrong. A wildcard <? extends Number> is anonymous — you cannot refer to the type again in the same scope. A named type parameter <T extends Number> lets you use T in the return type, in other parameters, and in the method body. Use wildcards when one-time flexibility at a single position is needed; use named parameters when the type must appear in multiple positions.",
  "Raw types cause ClassCastException immediately when you insert the wrong type — the JVM detects the type mismatch at the insertion point. This is wrong. Raw types suppress all compile-time type checking. Wrong-typed insertions compile and succeed at runtime — no immediate exception. The ClassCastException occurs later, at the read site where code attempts to cast the Object back to the expected type. The distance between the insertion and the failure is why raw-type bugs are hard to debug."
];

const cheatsheet = `| Topic | Rule of thumb | Interview one-liner |
|---|---|---|
| Generics purpose | Use generics to eliminate unchecked casts at the cost of type argument verbosity | Generics move ClassCastException from runtime to compile time — catch it early when it's cheap. |
| Type erasure | Generic types lose their type argument at runtime — List<String> and List<Integer> are the same class | Erasure is why you cannot write instanceof List<String> or new T[] — the JVM does not know the type. |
| Raw types | Never use raw types in new code — always add the type argument | Raw types exist for backwards compatibility only — using them in new code is opting out of all compile-time type safety. |
| Invariance | List<String> is NOT a subtype of List<Object> — use wildcards for flexibility | Generics are invariant by design — it is what prevents you from adding a Double to a List<String> through a List<Number> reference. |
| ? extends T | Use extends when you read from a collection (it's a producer) | Producer Extends — if I only read from the collection, ? extends T accepts the widest range of subtypes. |
| ? super T | Use super when you write to a collection (it's a consumer) | Consumer Super — if I only write to the collection, ? super T lets me insert T into a List<Number> or List<Object>. |
| PECS | Collections.copy follows PECS exactly: dest is ? super T, src is ? extends T | PECS: Producer Extends, Consumer Super — if you remember only one generics rule, make it this one. |
| Bounded type parameter | Use <T extends X> when you need to call X's methods on T inside the method body | Bounded type parameters name the type so you can use it in multiple positions — wildcards are anonymous and single-use. |
| Recursive bound | <T extends Comparable<T>> is the correct bound for any sort/max/min utility | Recursive bound means T can compare to itself — it is how TreeMap and Collections.sort are parameterised. |
| Class<T> token | Pass Class<T> as a constructor parameter when you need to instantiate or cast T at runtime | new T() is illegal because T is erased — pass Class<T> and call token.newInstance() or token.cast(obj) instead. |
| TypeReference<T> | Use TypeReference<List<Order>> when Class<T> cannot capture the nested generic type | Class<T> cannot carry type arguments — use TypeReference when you need List<Order> or Map<String, Customer> at runtime. |
| Heap pollution | Heap pollution occurs when a wrong-typed object is inserted through a raw type — ClassCastException surfaces far from the insertion | Heap pollution from raw-type assignments is why @SuppressWarnings(unchecked) should be isolated at one boundary, not scattered. |`;

// Build the full JSON object
const json = {
  day: 28,
  title: "Generics Deep Dive",
  estimatedHours: 3,
  difficulty: "Intermediate",
  level: "Intermediate",
  track: "Mid-Level",
  tags: ["Generics", "Type Erasure", "PECS", "Wildcards", "Type Safety", "Mid-Level", "Phase 4", "Interview Prep"],
  prerequisites: [
    "Day 27 — Dynamic Programming Basics",
    "Day 14 — Java Collections Framework",
    "Day 10 — Inheritance and Polymorphism"
  ],
  learningObjectives: [
    "Explain type erasure and what survives it at runtime with interview clarity",
    "Apply PECS (Producer Extends, Consumer Super) to collection utility method signatures",
    "Implement generic classes and methods with correct bounds without raw types",
    "Distinguish bounded type parameters from wildcards and know when to use each",
    "Use Class<T> tokens and TypeReference<T> to recover generic type information at runtime",
    "Diagnose heap pollution, bridge methods, and the ClassCastException that surfaces at the read site"
  ],
  sections: [
    {
      type: "why",
      title: "Why Generics matter in every Java codebase",
      content: why
    },
    {
      type: "theory",
      title: "Theory and Internals — Java Generics Deep Dive",
      content: theory
    },
    {
      type: "code",
      level: "basic",
      title: "Basic — Generics Quick Reference Tables",
      language: "java",
      filename: "Day28Basic.java",
      description: "Three reference tables: type parameter forms, wildcard read/write rules with PECS roles, and type erasure compile-time vs runtime mapping. All output is hardcoded — trace every line by eye.",
      code: basicCode,
      output: basicOutput
    },
    {
      type: "code",
      level: "intermediate",
      title: "Intermediate — Four Core Generics Mechanisms",
      language: "java",
      filename: "Day28Intermediate.java",
      description: "Four labelled scenarios: Pair<A,B> with typed swap, PECS in action (producer extends, consumer super), bounded generic max with recursive bound, and Class<T> token for runtime type recovery after erasure.",
      code: intermediateCode,
      output: intermediateOutput
    },
    {
      type: "code",
      level: "advanced",
      title: "Advanced — Typesafe Heterogeneous Container + Heap Pollution",
      language: "java",
      filename: "Day28Advanced.java",
      description: "Three blocks: Typesafe Heterogeneous Container (Effective Java Item 33) using Class<T> as key and Class.cast() for type-safe retrieval; heap pollution demonstration showing ClassCastException at the read site from raw-type insertion; generics decision reference table.",
      code: advancedCode,
      output: advancedOutput
    },
    {
      type: "diagram",
      title: "Java Generics: Compile-Time Contract to Runtime Erasure",
      diagramType: "sequence",
      description: "Shows how the javac compiler type-checks generic code, erases type parameters to produce raw bytecode, inserts checkcast instructions at read sites, and how the JVM executes those casts at runtime — including the heap pollution path where raw-type insertion causes ClassCastException far from the insertion site.",
      plantuml: plantuml
    },
    {
      type: "pitfalls",
      title: "Common Pitfalls",
      items: pitfalls
    },
    {
      type: "exercise",
      title: "Exercise — Generic Pair, PECS Utilities, and TypeSafeRegistry",
      problem: exerciseProblem,
      hints: exerciseHints,
      solution: {
        language: "java",
        filename: "Day28Exercise.java",
        code: exerciseCode,
        output: exerciseOutput
      }
    },
    {
      type: "interview",
      conceptual: conceptual.map(c => ({
        question: c.q,
        answer: c.a,
        followUps: c.fu.map(f => ({ question: f.q, answer: f.a }))
      })),
      codeBased: codeBased.map(c => ({
        question: c.q,
        answer: c.a,
        followUps: c.fu.map(f => ({ question: f.q, answer: f.a }))
      })),
      seniorScenario: seniorScenarios.map(s => ({
        question: s.q,
        answer: s.a,
        followUps: s.fu.map(f => ({ question: f.q, answer: f.a }))
      })),
      wrongAnswers: wrongAnswers
    },
    {
      type: "cheatsheet",
      title: "Cheatsheet",
      content: cheatsheet
    }
  ]
};

const out = JSON.stringify(json, null, 2);
writeFileSync('public/data/days/phase4-day28.json', out, 'utf8');
console.log('Written:', out.length, 'chars');

// Validate counts
const s = json.sections;
const interview = s.find(x => x.type === 'interview');
const theory = s.find(x => x.type === 'theory');
const why = s.find(x => x.type === 'why');
const pitfalls2 = s.find(x => x.type === 'pitfalls');
const cs = s.find(x => x.type === 'cheatsheet');

console.log('Why words:', why.content.split(/\s+/).length);
console.log('Theory ### sections:', (theory.content.match(/^###/gm)||[]).length);
console.log('Theory words:', theory.content.split(/\s+/).length);
console.log('Conceptual Q&As:', interview.conceptual.length);
console.log('CodeBased Q&As:', interview.codeBased.length);
console.log('SeniorScenario Q&As:', interview.seniorScenario.length);
console.log('WrongAnswers:', interview.wrongAnswers.length);
console.log('Pitfalls:', pitfalls2.items.length);
console.log('Cheatsheet rows:', (cs.content.match(/^\|[^-]/gm)||[]).length - 1);
console.log('Code basic lines:', s.find(x=>x.type==='code'&&x.level==='basic').code.split('\n').length);
console.log('Code intermediate lines:', s.find(x=>x.type==='code'&&x.level==='intermediate').code.split('\n').length);
console.log('Code advanced lines:', s.find(x=>x.type==='code'&&x.level==='advanced').code.split('\n').length);
