/** Spring / Spring Boot interview follow-ups (Phase 5). */
export function followSpring(ctx) {
  return [
    {
      question: "Interview follow-up: how would you **prove** this in a running Spring app?",
      answer: `For ${ctx}, you describe actuator endpoints, conditional debug logging for bean creation, integration tests with @SpringBootTest slices, and metrics (HTTP errors, transaction rollbacks, security denies). You tie claims to Spring Boot version and cite which auto-configuration backs the behavior.`,
    },
    {
      question: "What **follow-up trap** might the interviewer set?",
      answer:
        "They may push on proxy types (JDK vs CGLIB), transaction self-invocation, filter order vs @Order, reactive threading, or OAuth2 resource server vs authorization server. You separate what the framework guarantees from what your configuration must explicitly declare.",
    },
  ];
}
