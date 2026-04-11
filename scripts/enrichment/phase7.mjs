/** Phase 7 — Kafka & Messaging (Days 59–67) */
export default {
  59: `**Broker / topic / partition** — partitions enable parallelism; key hashing assigns partition; ordering per partition only.

**Producer acks:** trade durability vs latency — \`all\` with min.in.sync.replicas for critical data.

**Consumer groups** scale read throughput — one consumer per partition max in group.

**Offsets:** auto vs manual commit — at-least-once by default; transactional outbox pairs with DB writes.`,

  60: `**Replication factor** ≥ 2 in prod; \`min.insync.replicas\` prevents silent loss on single broker.

**Leader election** — unclean leader election risks data loss — understand broker config tradeoffs.

**Retention** bytes/time — compacted topics for changelog (\`__consumer_offsets\`, CDC).

**Monitoring:** under-replicated partitions, ISR shrink, request latency — alert before data loss.`,

  61: `**Serializers:** Avro + Schema Registry for evolution; JSON for prototyping — compatibility modes (BACKWARD/FORWARD).

**Schema change rules:** optional fields safer than renames without compatibility shim.

**Poison messages** — DLQ pattern, retry budgets, classifier for bad payloads.

**Message size limits** — chunk large blobs to object store, send reference in event.`,

  62: `**Exactly-once** in Kafka streams / transactions — overhead and complexity; often at-least-once + idempotent sink suffices.

**Transactional producer** + read_committed consumers — end-to-end semantics with caveats.

**Wall-clock vs event time** — stream processing watermarks for late data.

**State stores** changelog-backed — sizing RocksDB and restore time on rebalance.`,

  63: `**RabbitMQ vs Kafka:** queue semantics vs log; push consumers vs pull; great for task queues and complex routing (exchanges).

**Ack modes:** manual ack after processing; prefetch tuning for fair work distribution.

**TTL / DLX** — dead-letter exchanges for failed deliveries; redrive tooling for ops.

**Clustering** — mirrored queues classic; quorum queues for modern HA.`,

  64: `**JMS in enterprise** — still present in banks; Spring JMS bridges to ActiveMQ/Artemis; understand message selectors and durability.

**Request-reply** over queues — temporary reply queues / correlation IDs — pattern for RPC-ish async.

**XA transactions** — avoid if possible; outbox + local transaction simpler and more reliable.

**Bridge patterns** — Kafka Connect for system integration without bespoke glue code everywhere.`,

  65: `**Ordering guarantees:** single partition + single consumer instance preserves order; scale partitions only when order scope is sharded by key.

**Fan-out:** multiple consumer groups read same topic independently — cache invalidation + analytics from one publish.

**Backpressure:** slow consumer increases lag — scale consumers or optimize processing; pause partitions intentionally if needed.

**Reprocessing:** reset offsets with operational runbook — idempotent sinks mandatory.`,

  66: `**Event-driven pitfalls:** cyclic dependencies, chatty events, missing correlationId — design event contracts like public APIs.

**Choreography vs orchestration** — debuggability vs coupling; use workflow engine (Temporal) for long business processes.

**Sagas via events** — each step publishes outcome; compensations explicit in docs and code.

**Testing:** contract tests for producers; embedded Kafka or Testcontainers for integration.`,

  67: `**Observability for messaging:** trace context propagation headers (W3C traceparent) in producers/consumers.

**Lag alerts** per consumer group — SLO on max lag minutes.

**Replay strategies** — new consumer group id vs reset offsets — legal/compliance implications for PII topics.

**Capacity planning:** peak publish rate, retention size, network egress — cost model includes cross-AZ traffic.`,
};
