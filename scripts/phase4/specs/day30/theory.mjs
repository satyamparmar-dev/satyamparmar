export const theoryTitle = "Streams API";

export const theoryBase = `### Plain-language overview

The **Streams API** processes sequences with **declarative** pipelines: source, zero or more **intermediate** operations, one **terminal**. Interviews focus on **lazy evaluation**, **stateless vs stateful** ops, and correct **Collector** use.

**Interview angle:** intermediate ops build pipeline; nothing runs until terminal.

### Sources and characteristics

| Source | Notes |
| --- | --- |
| collection.stream() | Ordered if collection ordered |
| Stream.of / iterate / generate | Finite or infinite care |

**Interview angle:** **parallelStream** only when safe and profiled.

### Intermediate operations

map, filter, flatMap, distinct, sorted, peek—lazy and fused by spliterator.

### Terminal operations

collect, reduce, forEach, count, min/max—trigger execution and often consume stream.

### Collectors

**groupingBy** partitions; **mapping** nested; **averagingDouble** for numeric mean; **joining** strings.

### Optional in streams

**findFirst** returns Optional; avoid get() without isPresent—use orElse.

### Primitive streams

**IntStream** avoids boxing; **mapToObj** when boxing needed.

### Error handling

Checked exceptions inside lambdas need wrapping—design helpers.

### Production angle

Large datasets: mind memory with **toList** materialization; consider batching I/O.

### 60-second story

“I pick sequential streams for clarity. I know lazy fusion. I use groupingBy + downstream collectors for aggregates. I avoid parallel unless thread-safe and measured. I handle Optional from find* carefully.”
`;
