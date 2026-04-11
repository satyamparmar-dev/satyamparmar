/** Phase 8 — Cloud, DB, DevOps (Days 68–76) */
export default {
  68: `**Cloud models:** IaaS vs PaaS vs SaaS — where you draw the line on control vs velocity; managed services reduce toil.

**Regions / AZs** — deploy multi-AZ for HA; cross-region for DR with RPO/RTO targets.

**Cost pillars:** compute, storage, egress — egress surprises; use VPC endpoints/private links.

**Well-Architected** pillars — reliability, security, cost, performance, sustainability — interview framework.`,

  69: `**IAM least privilege** — short-lived credentials, roles not keys on VMs, attribute-based access where available.

**Network segmentation** — private subnets for data tier; bastion or SSM for access; no public DBs.

**Encryption:** at rest (KMS) and in transit (TLS); customer-managed keys for compliance.

**Audit trails** — CloudTrail / admin activity logs; immutable storage for forensics.`,

  70: `**SQL vs NoSQL** — normalize OLTP; denormalize for read models; document DB for flexible schema with index discipline.

**Indexes:** B-tree default; covering indexes reduce lookups; watch write amplification.

**Transactions:** isolation levels — phantom reads under RR; optimistic locking with version column.

**Query plans** — EXPLAIN ANALYZE habit; fix statistics drift and bad parameter sniffing.`,

  71: `**Connection pools** — size = f(CPU, latency); too large hurts DB; monitor wait times.

**Migrations** — expand/contract for zero-downtime; backfill jobs with batching; feature flags gate code paths.

**Read replicas** — eventual lag; sticky read-your-writes or use primary for critical reads.

**Sharding** — key choice determines hotspot risk; resharding is expensive — plan early only when needed.`,

  72: `**Docker images:** multi-stage builds, non-root user, minimal base (distroless/alpine with caveats), pin digests in prod.

**Layer caching** — order Dockerfile lines dependency-first; \`.dockerignore\` reduces context.

**Health in containers** — align with app readiness; not just "JVM started".

**Image scanning** in CI — block critical CVEs; update base images regularly.`,

  73: `**Kubernetes basics:** Pod, Deployment, Service, Ingress — declarative desired state; controllers reconcile.

**Probes:** startup vs liveness vs readiness — wrong probe kills pods randomly.

**Resources and QoS:** requests/limits; Burstable vs Guaranteed; avoid CPU throttling surprises.

**ConfigMaps / Secrets** — mount vs env; rotate secrets without pod restart where supported.`,

  74: `**Helm / Kustomize** — templating vs patching; environment overlays; values files per cluster.

**GitOps:** Argo CD / Flux — reconcile cluster to git; PR-based promotions.

**Namespaces** isolate teams — network policies enforce east-west segmentation.

**Upgrades:** cluster version skew policy; test CRD upgrades; backup etcd / state before major jumps.`,

  75: `**CI/CD pipeline stages:** build, test, scan, sign, deploy — fail fast on unit tests; integration nightly or per main.

**Trunk-based** with feature flags vs long-lived branches — merge pain vs release risk tradeoff.

**Deployment strategies:** rolling, blue/green, canary — choose based on blast radius.

**Rollback:** automated on metrics; database backward compatibility first.`,

  76: `**SLIs → SLOs → error budgets** — product and engineering share reliability goals.

**Alerting on symptoms** (user-visible) not only causes (CPU high) — reduce pager fatigue.

**Runbooks** linked from alerts — on-call should not debug from scratch at 3am.

**Post-incidents:** blameless, action items with owners — learning culture signal in senior interviews.`,
};
