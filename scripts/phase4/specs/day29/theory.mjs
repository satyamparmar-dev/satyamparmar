export const theoryTitle = "Lambda and functional interfaces";

export const theoryBase = `### Plain-language overview

**Lambdas** are syntactic sugar for instances of **functional interfaces** (single abstract method). **Method references** shorten lambdas when you already have a matching method. Interviews test whether you know **SAM**, **capturing variables**, and **effectively final** rules.

**Interview angle:** lambda desugars to invokedynamic + generated functional object.

### Functional interface

| Concept | Rule |
| --- | --- |
| SAM | Exactly one abstract method |
| @FunctionalInterface | Documents intent; compiler checks |

**Interview angle:** default/static methods on interface do not break SAM if one abstract remains.

### Variable capture

Lambdas capture **effectively final** locals. Mutation after capture is illegal. Instance captures hold implicit **this**.

### Method reference kinds

| Kind | Example | When |
| --- | --- | --- |
| Static | String::valueOf | Args match |
| Bound instance | s::length | Receiver fixed |
| Unbound | String::compareTo | First arg is receiver |
| Constructor | ArrayList::new | New instance |

### Composition

\`Comparator\` and \`Predicate\` offer **andThen**, **compose**, **negate** for fluent pipelines.

### Exceptions

Checked exceptions in lambdas force try/catch or wrapper—design APIs with unchecked or **Callable**.

### Serialization / frameworks

Lambdas are not always serialization-friendly; be careful with session-scoped beans.

### Performance

Mostly same as anonymous classes after JIT; allocation still happens.

### Interop with streams

Lambdas are the default syntax inside stream operations.

### Production angle

Readable lambdas beat clever one-liners—name methods when logic grows.

### 60-second story

“I use lambdas for SAM types only. I prefer method references when they read cleaner. I respect effectively final. I know checked exceptions pain and I extract methods. I compose comparators and predicates instead of duplicating logic.”
`;
