export const theoryTitle = "CompletableFuture and virtual threads";

export const theoryBase = `### Plain-language overview

**CompletableFuture** composes async work with **thenApply**, **thenCompose**, **allOf**, **anyOf**, and error routes **exceptionally/handle**. Default **async** uses **ForkJoinPool.commonPool** unless you pass an **Executor**.

**Interview angle:** async methods are not magic parallelism; they shift work to another thread.

### Composition

**thenCompose** flattens nested futures; **thenCombine** joins two independent futures.

### Error handling

**exceptionally** maps failure; **handle** sees both outcomes.

### allOf / anyOf

**allOf** completes when all complete (void aggregate); combine results manually.

### Virtual threads

**lightweight** threads; good for blocking IO; **pinning** if synchronized/native blocks carrier.

### Structured concurrency

**StructuredTaskScope** (preview/stable per JDK) groups related tasks with cancellation.

### Production angle

Always pass a **bounded executor** for isolation from common pool.

### 60-second story

“I compose futures with explicit executors. I flatten with thenCompose. I handle errors with handle. I avoid blocking in callbacks. I understand virtual thread pinning risks.”
`;
