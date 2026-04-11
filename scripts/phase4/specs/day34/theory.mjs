export const theoryTitle = "Concurrency foundations";

export const theoryBase = `### Plain-language overview

Threads share memory; without synchronization, **data races** produce undefined behavior. **happens-before** orders actions: synchronized unlock/lock, volatile write/read, thread start/join.

**Interview angle:** volatile gives visibility, not atomicity of compound actions.

### Thread lifecycle

**start**, **run** ends, **join** waits completion, **interrupt** cooperative cancellation.

### synchronized

Mutual exclusion on monitor; reentrant for same thread.

### volatile

Fresh read/write visibility; no compound atomicity.

### Deadlock

Circular wait for locks; fix with **lock ordering** or timeout tryLock.

### ExecutorService

Prefer thread pools over raw thread per task.

### Production angle

Bound queues; backpressure; avoid unbounded work growth.

### 60-second story

“I reason with happens-before. I use synchronized for invariants. I order locks to prevent deadlock. I prefer executors. I know volatile limits. I test concurrency.”
`;
