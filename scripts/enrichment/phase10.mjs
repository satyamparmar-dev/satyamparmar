/** Phase 10 — Testing, Performance, Mocks (Days 85–90) */
export default {
  85: `**Test pyramid** — many fast unit tests, fewer integration, rare E2E — invert only with strong contract coverage.

**AAA structure** — arrange, act, assert — readable tests are documentation.

**Test doubles:** dummy, fake, stub, spy, mock — use the right term in interviews (Martin Fowler).

**Flaky tests** — quarantine policy; root cause (time, async, shared state) before retry hacks.`,

  86: `**JUnit 5** — parameterized tests, nested, lifecycle; extensions for timing and resources.

**AssertJ** fluent assertions — readable failures; avoid assertTrue mega-expressions.

**Test naming** — behaviour-focused (\`shouldRejectWhenBalanceNegative\`) not method names only.

**Coverage:** line coverage is weak signal; branch and mutation testing find blind spots.`,

  87: `**Spring test slices** — fast feedback; do not spin whole context for every test.

**Testcontainers** — real Postgres/Kafka; CI parallelism and reuse to control time.

**WireMock / MockWebServer** — stub HTTP dependencies; verify call counts and payloads.

**Database fixtures** — flyway test schema; transactional rollback per test where supported.`,

  88: `**Profiling workflow:** measure → hypothesize → change one thing → re-measure — avoid random micro-optimizations.

**CPU vs allocation profiling** — async-profiler, JFR — GC pressure often dominates “slow logic”.

**Hot methods** — algorithmic fix beats tuning 5% micro-opts; Big-O first.

**Benchmark pitfalls:** JVM warmup, dead code elimination — use JMH for serious numbers.`,

  89: `**JMH basics** — forked JVMs, blackholes, mode selection; run on dedicated hardware for publishing numbers.

**Microbench skepticism** — real apps dominated by I/O and locks; still useful for library primitives.

**Allocation rate** — young GC frequency; reduce object churn in tight loops.

**Lock contention** — profile with thread dumps and JFR lock events — bigger wins than nano-tweaks.`,

  90: `**Mock interview structure:** clarify → think aloud → sketch → tradeoffs → tests — timebox each phase.

**STAR for behavioural** — situation, task, action, result — tie stories to metrics.

**Communication beats silence** — interviewers help if they see your reasoning.

**Continuous learning:** revisit weak days on this roadmap; ship small projects that force integration of multiple phases — depth comes from spaced repetition and practice, not one pass.`,
};
