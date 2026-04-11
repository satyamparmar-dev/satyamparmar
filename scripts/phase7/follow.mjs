/** Kafka / messaging–oriented interview follow-ups (replaces Spring-only templates). */

function fu(question, answer) {
  return { question, answer };
}

export function followConceptual(seed) {
  const hint = typeof seed === "string" && seed.length > 0 ? seed.slice(0, 120) : "this concept";
  return [
    fu(
      "What production metric would you watch first to validate that answer?",
      `For **${hint}**, pair **consumer lag per partition**, **under-replicated partitions**, and **request/queue time on brokers** with **traces** from producing services. Alert on sustained lag growth and ISR shrinkage, not only error rates.`,
    ),
    fu(
      "Which configuration or cluster policy most often invalidates a textbook answer?",
      "**min.insync.replicas** vs **replication.factor**, **unclean leader election**, **retention/compaction** on money topics, and **max.poll.interval.ms** vs handler runtime usually surface gaps between slides and production.",
    ),
  ];
}

export function followCode(seed) {
  const hint = typeof seed === "string" && seed.length > 0 ? seed.slice(0, 100) : "this API";
  return [
    fu(
      "What failure mode shows up first when this is misconfigured under load?",
      `Typical symptoms: **rebalance storms**, **duplicate delivery** after retries, **metadata refresh loops** (**NOT_LEADER**), or **producer buffer exhaustion**. Tie **${hint}** to observable signals before jumping to code changes.`,
    ),
    fu(
      "How would you prove correctness in staging without flaky integration tests?",
      "Use **deterministic** workloads: fixed keys, controlled partition counts, inject broker pause/leader movement in a test cluster, and assert **offset** progress + **exactly-once** expectations with idempotent sinks or test harnesses.",
    ),
  ];
}

export function followSenior(seed) {
  const hint = typeof seed === "string" && seed.length > 0 ? seed.slice(0, 100) : "this scenario";
  return [
    fu(
      "How do you communicate blast radius and ETA to stakeholders during the incident?",
      `For **${hint}**, report **which topics/partitions** lag, **whether writes are still accepted**, **data-loss risk** (ISR), and **consumer backlog time**. Give a **bounded** ETA tied to a concrete mitigation (scale, pause traffic, fail over).`,
    ),
    fu(
      "What permanent guardrails prevent a repeat in six months?",
      "Add **SLOs** on lag and ISR, **game days** for AZ loss and broker restarts, **capacity models** for partitions, and **review gates** for retention/compaction and ACL changes.",
    ),
  ];
}
