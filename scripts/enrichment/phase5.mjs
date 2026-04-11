/** Phase 5 — Spring Ecosystem (Days 38–48) */
export default {
  38: `**Spring Core:** IoC container owns object graphs — prefer constructor injection for required dependencies; \`@Autowired\` field injection hides test pain.

**Bean scopes:** singleton default; prototype when stateful; request/session in web apps — wrong scope causes subtle bugs.

**\`@Configuration\` + \`@Bean\`** vs component scanning — explicit beans for third-party types.

**Interview:** explain lifecycle: instantiate → populate → pre-init → init → ready → destroy callbacks.`,

  39: `**\`@SpringBootApplication\`** combines configuration, scanning, autoconfig — \`exclude\` when auto-config clashes.

**Externalized config:** \`application.yml\` profiles (\`dev\`, \`prod\`) + env vars override — 12-factor readiness.

**Actuator** exposes health/metrics — secure endpoints in production; customize \`HealthIndicator\` for dependencies.

**Fat JAR** vs layered images — buildpacks optimize Docker layers for dependencies vs code.`,

  40: `**Spring MVC flow:** DispatcherServlet → handler mapping → controller → view resolver / message converters.

**\`@RestController\`** = \`@Controller\` + \`@ResponseBody\` — JSON via Jackson defaults.

**Validation:** \`@Valid\` on \`@RequestBody\` + \`BindingResult\` or global \`@ControllerAdvice\` — consistent 400 responses.

**Content negotiation:** \`Accept\` header vs file extension — prefer explicit produces/consumes for APIs.`,

  41: `**JPA entity state:** transient, managed, detached, removed — understand persistence context flush timing.

**LazyInitializationException** — access lazy relations inside transaction or fetch join / \`@EntityGraph\`.

**N+1 queries:** \`@BatchSize\`, join fetch, or projections — profile with \`show-sql\` / Hibernate stats.

**Migrations:** Flyway/Liquibase version schema — never hand-edit applied migration files in shared envs.`,

  42: `**Transaction boundaries:** \`@Transactional\` on service layer; default rollback on RuntimeException only — configure for checked if needed.

**Propagation:** \`REQUIRED\` default; \`REQUIRES_NEW\` for audit logging separate from main rollback.

**Read-only transactions** hint DB for optimization — \`readOnly=true\`.

**Self-invocation trap:** internal calls skip proxy — refactor or use \`ApplicationContext\` / split class.`,

  43: `**Spring Security filter chain** runs before servlet — custom filters must be ordered correctly.

**JWT vs session:** stateless scales horizontally; rotation and revocation need design (denylist, short TTL).

**Method security:** \`@PreAuthorize\` for fine-grained rules — keep expressions simple or use custom \`PermissionEvaluator\`.

**CORS** is browser-enforced — configure at gateway or Spring; preflight OPTIONS handled explicitly.`,

  44: `**Spring Data repositories** reduce boilerplate — derived query names hit limits; use \`@Query\` for complex JPQL.

**Paging:** \`Pageable\` + \`Page\` — sort stable with tie-breaker column.

**Projections:** interface or DTO closed projection — avoid selecting full entities for list screens.

**Auditing:** \`@CreatedDate\` with \`@EntityListeners\` — consistent metadata without manual setters.`,

  45: `**Events:** \`ApplicationEventPublisher\` decouples modules — synchronous by default; async with \`@Async\` + executor.

**Domain events** should carry minimal payload — id references over huge graphs.

**Transactional events:** \`@TransactionalEventListener\` phases (after commit) — avoid reading uncommitted data.

**Testing:** \`ApplicationEvents\` capture in tests — assert side effects without mocking internals deeply.`,

  46: `**Caching:** \`@Cacheable\` key generation, \`unless\`, \`condition\` — eviction (\`@CacheEvict\`) on writes.

**Distributed cache:** Redis TTL, stampede protection, cache-aside vs read-through — choose per consistency needs.

**Serialization of cache values** — version DTOs; incompatible changes invalidate namespace.

**Metrics:** cache hit ratio monitoring — alert when drops (cold cache or key churn).`,

  47: `**Spring Boot testing slices:** \`@WebMvcTest\`, \`@DataJpaTest\` — fast tests with minimal context.

**\`@MockBean\`** overrides production beans — document why test differs from prod wiring.

**Testcontainers** for integration tests — real DB/Kafka closer to production than H2 alone.

**Contract tests** at API boundary — consumer-driven contracts catch breaking JSON changes.`,

  48: `**Observability triad:** structured logs (traceId), metrics (RED/USE), traces (OpenTelemetry).

**Micrometer** registry → Prometheus / OTLP — naming conventions and cardinality control (avoid high-cardinality tags).

**Correlation IDs** propagate MDC → logs and downstream headers — essential for support.

**SLO thinking:** measure p99 latency and error budget — tie Spring Actuator health to dependency checks.`,
};
