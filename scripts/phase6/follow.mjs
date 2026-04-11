/** REST / API / microservices interview follow-ups (Phase 6). */
export function followApi(ctx) {
  return [
    {
      question: "Interview follow-up: how would you **verify** this contract in CI and production?",
      answer: `For ${ctx}, you cite OpenAPI diff gates, consumer contract tests (Pact), gateway access logs with trace IDs, and SLO dashboards (p95 latency, error rate by route). You separate what HTTP semantics guarantee from what your gateway and clients must implement.`,
    },
    {
      question: "What **trap** might the interviewer set next?",
      answer:
        "They may conflate idempotency with safety, push on cache invalidation vs eventual consistency, or ask about breaking vs additive schema changes. You give precise status-code and retry semantics and name one operational metric you would watch.",
    },
  ];
}
