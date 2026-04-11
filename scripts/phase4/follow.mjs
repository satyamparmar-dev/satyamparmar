/** Java / JDK interview follow-ups (Phase 4). */
export function followJava(ctx) {
  return [
    {
      question: "Interview follow-up: how would you **verify** this in a running service?",
      answer: `For ${ctx}, you name concrete signals: thread dumps for lock ordering, JFR for allocation hot spots, logs for suppressed warnings, and metrics for pool saturation. You describe a minimal reproducer or integration test that encodes the invariant, and you avoid hand-wavy claims by tying behaviour to JDK version and documented semantics.`,
    },
    {
      question: "What **follow-up trap** might the interviewer set?",
      answer:
        "They may push on binary compatibility, preview features, migration from older JDKs, or subtle happens-before edges. You respond with scope: what is guaranteed by the JLS or JVM spec versus what is implementation detail, and when to prefer explicit, boring code over clever syntax.",
    },
  ];
}
