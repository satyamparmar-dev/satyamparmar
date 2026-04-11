export const theoryTitle = "Advanced concurrency";

export const theoryBase = `### Plain-language overview

Beyond synchronized, **java.util.concurrent** offers **locks**, **atomics**, and **concurrent collections**. Prefer higher-level structures before building your own spin locks.

**Interview angle:** ReentrantLock adds tryLock/lockInterruptibly vs synchronized.

### ReentrantLock

Explicit lock with **Condition** queues; must unlock in finally.

### ReadWriteLock

Scales read-heavy workloads; writers exclusive.

### Atomics and LongAdder

**CAS** loops; **LongAdder** reduces contention for frequent increments.

### ConcurrentHashMap

Segmented/binned structure; avoid computeIfAbsent recursion traps.

### BlockingDeque

Work-stealing friendly patterns with dual queues.

### StampedLock

Optimistic reads; tricky; measure before adopting.

### ForkJoin

Divide conquer; **common pool** shared—avoid blocking inside.

### Production angle

Instrument pool queues; cap tasks; separate IO and CPU pools.

### 60-second story

“I pick juc primitives. I use tryLock for timeouts. I understand CAS failures. I avoid blocking in ForkJoin. I monitor queue depth. I document interrupt policy.”
`;
