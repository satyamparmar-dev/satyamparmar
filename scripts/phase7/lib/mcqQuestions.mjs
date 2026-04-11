/** Thirty MCQs per Phase 7 day — topic-tagged stems (validator + learning). */

const O = (A, B, C, D) => ({ A, B, C, D });

const DAY_META = {
  59: {
    label: "Kafka Architecture",
    terms: [
      "broker cluster",
      "partition ordering",
      "consumer group",
      "ISR",
      "replication factor",
      "controller failover",
      "unclean leader election",
      "rack awareness",
      "metadata refresh",
      "hot partition",
      "consumer lag",
      "rebalance",
      "log segment",
      "retention vs compaction",
      "KRaft metadata",
      "topic throughput",
      "follower replication",
      "leader epoch",
      "partition count",
      "cross-AZ traffic",
    ],
  },
  60: {
    label: "Kafka Producers",
    terms: [
      "acks=all",
      "idempotent producer",
      "retries",
      "linger.ms",
      "batch.size",
      "compression",
      "partitioner",
      "max.in.flight.requests",
      "delivery.timeout.ms",
      "buffer memory",
      "sticky partitioner",
      "record headers",
      "transactional producer",
      "metadata fetch",
      "NOT_LEADER",
      "serialization",
      "key vs null key",
      "producer epoch",
      "retry storm",
      "backpressure",
    ],
  },
  61: {
    label: "Kafka Consumers",
    terms: [
      "poll loop",
      "max.poll.interval.ms",
      "session.timeout.ms",
      "heartbeat.interval.ms",
      "auto offset commit",
      "manual commit",
      "subscribe vs assign",
      "cooperative rebalance",
      "partition revocation",
      "fetch.max.wait.ms",
      "fetch.min.bytes",
      "isolation.level",
      "static membership",
      "consumer lag",
      "pause resume",
      "retry backoff",
      "deserialization error",
      "max.poll.records",
      "position vs committed",
      "group coordinator",
    ],
  },
  62: {
    label: "Delivery Semantics & EOS",
    terms: [
      "at-most-once",
      "at-least-once",
      "exactly-once",
      "idempotent sink",
      "outbox pattern",
      "dedupe key",
      "transactional read-process-write",
      "zombie fencing",
      "producer sequence",
      "offset commit order",
      "duplicate delivery",
      "two-phase commit",
      "side effect boundary",
      "read committed",
      "end-to-end EOS",
      "retry idempotency",
      "watermark",
      "changelog",
      "poison message",
      "dead letter queue",
    ],
  },
  63: {
    label: "Kafka Streams",
    terms: [
      "topology",
      "KTable vs KStream",
      "state store",
      "changelog topic",
      "rocksdb",
      "windowing",
      "join",
      "repartition topic",
      "task assignment",
      "standby replica",
      "grace period",
      "punctuator",
      "interactive query",
      "processing guarantee",
      "stream thread",
      "internal topics",
      "serialization",
      "suppress",
      "aggregate",
      "restore consumer",
    ],
  },
  64: {
    label: "Schema Registry & Connect",
    terms: [
      "Avro schema",
      "BACKWARD compatibility",
      "FORWARD compatibility",
      "FULL compatibility",
      "subject naming",
      "Schema Registry",
      "connector task",
      "SMT",
      "dead letter queue",
      "converter",
      "sink vs source",
      "errors.tolerance",
      "restart task",
      "config provider",
      "internal topics",
      "Protobuf",
      "JSON Schema",
      "schema evolution",
      "connector version",
      "worker rebalance",
    ],
  },
  65: {
    label: "Spring Kafka",
    terms: [
      "@KafkaListener",
      "ConcurrentKafkaListenerContainerFactory",
      "ErrorHandlingDeserializer",
      "SeekToCurrentErrorHandler",
      "DefaultErrorHandler",
      "KafkaTemplate",
      "ProducerFactory",
      "ConsumerFactory",
      "retry topic",
      "DeadLetterPublishingRecoverer",
      "ackMode",
      "MANUAL_IMMEDIATE",
      "batch listener",
      "KafkaTransactionManager",
      "EmbeddedKafkaBroker",
      "test @SpringBootTest",
      "JsonDeserializer",
      "common error handler",
      "listener concurrency",
      "replying template",
    ],
  },
  66: {
    label: "RabbitMQ & AWS Messaging",
    terms: [
      "SQS visibility timeout",
      "SNS fan-out",
      "FIFO queue",
      "deduplication ID",
      "RabbitMQ exchange",
      "routing key",
      "dead letter exchange",
      "prefetch",
      "competing consumers",
      "message TTL",
      "quorum queue",
      "classic queue",
      "SQS long polling",
      "Lambda consumer",
      "redrive policy",
      "Kafka vs SQS",
      "ordering guarantee",
      "poison message",
      "backpressure",
      "cross-region",
    ],
  },
  67: {
    label: "Distributed Systems Theory",
    terms: [
      "CAP theorem",
      "linearizability",
      "eventual consistency",
      "quorum read/write",
      "vector clock",
      "happens-before",
      "split brain",
      "Byzantine failure",
      "partial failure",
      "idempotency",
      "consensus",
      "Raft basics",
      "gossip protocol",
      "hinted handoff",
      "read repair",
      "anti-entropy",
      "SLA vs SLO",
      "error budget",
      "exactly-once illusion",
      "network partition",
    ],
  },
};

function levelFor(i) {
  if (i < 10) return "basic";
  if (i < 20) return "intermediate";
  return "advanced";
}

function categoryFor(i) {
  const r = i % 3;
  if (r === 0) return "theory";
  if (r === 1) return "code";
  return "scenario";
}

function buildQuestions(day) {
  const meta = DAY_META[day];
  if (!meta) throw new Error(`No MCQ meta for day ${day}`);
  const { label, terms } = meta;
  const ctx = day === 67 ? "distributed systems" : "production Kafka/messaging contexts";
  const qs = [];
  for (let i = 0; i < 30; i += 1) {
    const term = terms[i % terms.length];
    const lv = levelFor(i);
    const cat = categoryFor(i);
    const prefix = `[${label}]`;
    let question;
    let options;
    let answer;
    let explanation;

    if (cat === "theory") {
      question = `${prefix} Which statement best describes **${term}** in ${ctx}?`;
      options = O(
        `It is a core lever teams tune with metrics, failure modes, and SLOs in mind.`,
        `It is purely a UI concern unrelated to brokers or clients.`,
        `It disables all replication automatically.`,
        `It guarantees global total order for every topic.`,
      );
      answer = "A";
      explanation = `**${term}** belongs to the operational model for **${label}**—tie it to trade-offs and measurements, not absolutes.`;
    } else if (cat === "code") {
      question = `${prefix} You see misconfiguration around **${term}** in a code review. What is the best first response?`;
      options = O(
        `Map settings to infrastructure policy, then reproduce under load in a controlled environment.`,
        `Delete the topic and recreate it with fewer partitions.`,
        `Set all timeouts to 1ms for safety.`,
        `Disable metrics to reduce noise.`,
      );
      answer = "A";
      explanation = `Validate **${term}** against defaults, workload, and symptoms (lag, errors, consistency) before changing code.`;
    } else {
      question = `${prefix} Incident: user-visible delay worsens after a deploy touching **${term}**. What is a credible first hypothesis?`;
      options = O(
        `The deploy changed timing, batching, retries, or resource limits along the critical path.`,
        `The system randomly deleted all state.`,
        `DNS always causes delay; ignore application logic.`,
        `You always need fewer threads when latency grows.`,
      );
      answer = "A";
      explanation = `Tie **${term}** to measurable regressions: compare golden signals before/after and narrow to the changed surface.`;
    }

    if (i % 7 === 1) {
      question = `${prefix} Which option is a **plausible distractor** interviewers use about **${term}**?`;
      options = O(
        `A precise, bounded statement tied to ordering, ISR, or consumer groups.`,
        `A blanket claim that ignores partition boundaries or client semantics.`,
        `A metric-backed troubleshooting step.`,
        `A configuration paired with a failure mode.`,
      );
      answer = "B";
      explanation = `Watch for absolutes on **${term}** that ignore **per-partition** semantics and client responsibilities.`;
    }

    qs.push({
      level: lv,
      category: cat,
      question,
      options,
      answer,
      explanation,
    });
  }
  return qs;
}

const cache = new Map();

export function getMcqQuestionsForDay(day) {
  if (!cache.has(day)) {
    cache.set(day, buildQuestions(day));
  }
  return cache.get(day);
}
