export const theoryTitle = "JVM internals and garbage collection";

export const theoryBase = `### Plain-language overview

The **JVM** runs bytecode with **JIT** compilation, **class loading**, and **GC**. Interviews expect high-level knowledge of **heap vs stack**, **young/old generations** (logical in generational collectors), and **stop-the-world** vs **concurrent** phases.

**Interview angle:** GC choice trades latency vs throughput; no single best collector.

### Runtime memory

**maxMemory**, **totalMemory**, **freeMemory** from **Runtime** are coarse; use **NMT** and **JFR** for depth.

### JIT tiers

C1 fast compile, C2 optimized; **tiered compilation** balances startup and peak.

### Class loading

**delegation model**; layers/modules affect visibility.

### GC families

**G1** default in many services; **ZGC/Shenandoah** target low latency; **Parallel** throughput.

### Safepoints

Threads pause at coordination points; long safepoint times hurt latency.

### Metaspace

Class metadata off-heap; leaks possible with dynamic proxies.

### Production angle

Set **Xmx** realistic; avoid huge heaps without profiling; log **GC cause**.

### 60-second story

“I know heap vs stack. I read GC logs for pause and allocation rate. I size heap from metrics. I watch Metaspace. I profile before tuning flags.”
`;
