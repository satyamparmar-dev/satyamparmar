/** DSA-focused interview follow-ups (Phase 3). */
export function followDsa(ctx) {
  return [
    {
      question: "Interview follow-up: how would you **prove** this in production?",
      answer: `For ${ctx}, you describe a minimal reproducer, a stable workload, and a before/after measurement plan (CPU, latency percentiles, allocations). You avoid hand-wavy Big-O claims by naming the dominant term, the hidden constants, and the dataset shape that triggers worst case. You close with guardrails: budgets, canaries, and a regression test that fails if complexity regresses.`,
    },
    {
      question: "What **trap** might follow your answer?",
      answer:
        "Interviewers may push on amortized costs, cache effects, or JIT warmup invalidating micro-benchmarks. You respond with methodology: warm up, fixed seeds, isolate the algorithm, and interpret results as directional—not marketing. You mention when to escalate to profilers versus paper analysis.",
    },
  ];
}
