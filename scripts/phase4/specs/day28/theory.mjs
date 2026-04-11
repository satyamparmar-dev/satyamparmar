export const theoryTitle = "Generics deep dive";

export const theoryBase = `### Plain-language overview

**Generics** let you write typesafe APIs over many concrete types without duplicating classes. The compiler enforces constraints at compile time; at runtime most type parameters are **erased** to their bounds or **Object**. Interviews probe whether you understand **erasure**, **wildcards**, **PECS**, and why raw types are a footgun.

**Interview angle:** explain **type erasure** in one sentence: compile-time checks, runtime mostly raw.

### Type parameters vs raw types

| Form | Compile safety | Typical failure |
| --- | --- | --- |
| Generic class Foo<T> | Strong | None if consistent |
| Raw Foo | Weak | ClassCastException later |

**Interview angle:** raw types exist for migration only—never in new code.

### Bounded type parameters

\`<T extends Number>\` lets you call **doubleValue()** on T. Multiple bounds use \`&\`: \`<T extends A & B>\`.

### Wildcards

| Wildcard | Reads | Writes |
| --- | --- | --- |
| ? extends T | Producer | Limited |
| ? super T | Consumer | Allows T |
| ? | Unknown | Very limited |

**Interview angle:** **PECS** — Producer **extends**, Consumer **super**.

### Erasure and bridges

The compiler synthesizes **bridge methods** to preserve overriding after erasure. Confusing stack traces can mention bridges.

### Generic methods

\`static <T> void swap(T[] a, int i, int j)\` — type parameter on method, not class.

### Type inference

Diamond operator \`<>\` and \`var\` reduce noise; inference can fail on nested generics—then be explicit.

### Generics vs arrays

You cannot create \`new T[]\` or \`new List<String>[10]\` safely—arrays are covariant, generics invariant.

### Reifiable types

Some operations need reifiable types at runtime (instanceof arrays, primitive class literals). Generics complicate reflection.

### Intersection with collections

\`List<? extends Number>\` is not a \`List<Integer>\`—you read **Number**, you cannot **add Integer** safely.

### Migration and libraries

Public APIs should avoid exposing raw types; use bounded wildcards in return types when flexibility matters.

### Production angle

Serialization frameworks, ORMs, and JSON mappers interact badly with erased generics—document expected concrete types and test edge cases.

### 60-second story

“I use generics for compile-time contracts. I default to bounded type parameters for internal APIs and wildcards at boundaries following PECS. I avoid raw types and arrays of parameterized types. I know erasure means I cannot rely on T.class at runtime without Class<T> tokens or pattern matching on sealed shapes.”
`;
