import { readFileSync, writeFileSync } from 'fs';
const FILE = 'public/data/scenarioInterviewThemes.json';
const F = '```';

const answers = {

'th-sli-slo-budget': `
## 🔥 The situation

Your ops team gets paged at 3am because CPU hit 80%. But the service was actually fine — users weren't impacted at all. Meanwhile, a real problem (slow API responses) goes undetected for 2 hours because no one was watching latency. The problem is alerting on the wrong things: **resource metrics** instead of **user-facing metrics**.

SLIs and SLOs shift alerting to what actually matters to users.

---

## 🧠 Understand this first

| Concept | What it means |
|---|---|
| **SLI (Service Level Indicator)** | A metric that measures user experience — latency, error rate, availability |
| **SLO (Service Level Objective)** | A target for your SLI — "99.9% of requests < 500ms" |
| **Error budget** | The allowable amount of SLO violations — if SLO=99.9%, you have 0.1% "budget" to burn |
| **Burn rate** | How fast you're consuming error budget — high burn rate → alert before budget is gone |
| **SLA (Service Level Agreement)** | Legal/contractual commitment to users — SLOs protect the SLA |

**Error budget example:**
- SLO: 99.9% availability per month
- Month has 43,200 minutes
- Error budget: 0.1% × 43,200 = 43 minutes of allowed downtime per month
- If you're burning at 10× the normal rate, you'll exhaust budget in ~4 minutes

---

## Step 1 — Define your SLIs in Prometheus

${F}yaml
# SLI 1: Request success rate (availability)
# Numerator: successful requests; Denominator: total requests
- record: sli:http_request_success_rate:5m
  expr: |
    sum(rate(http_server_requests_total{status!~"5.."}[5m]))
    / sum(rate(http_server_requests_total[5m]))

# SLI 2: Request latency (p99 < 500ms)
- record: sli:http_p99_latency:5m
  expr: |
    histogram_quantile(0.99,
      rate(http_server_requests_seconds_bucket[5m]))
${F}

---

## Step 2 — Set SLO targets and calculate error budget

${F}yaml
# SLO: 99.9% of requests succeed (availability)
# SLO: p99 latency < 500ms

# Error budget remaining (0 = all used up)
- record: slo:error_budget_remaining:availability
  expr: |
    (
      sum(rate(http_server_requests_total{status!~"5.."}[30d]))
      / sum(rate(http_server_requests_total[30d]))
      - 0.999
    ) / (1 - 0.999)
    # Result: 1.0 = full budget, 0 = exhausted, negative = violated SLO
${F}

---

## Step 3 — Alert on burn rate (not just raw SLI)

Don't alert when you cross the SLO — by then it's too late. Alert when you're **burning budget too fast**:

${F}yaml
# Fast burn alert: consuming 14x normal rate → budget gone in ~2 hours
- alert: HighErrorBudgetBurnRate
  expr: |
    (
      1 - sum(rate(http_server_requests_total{status!~"5.."}[1h]))
          / sum(rate(http_server_requests_total[1h]))
    ) / (1 - 0.999) > 14
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "Burning error budget at 14x rate — page on-call"
    description: "At current rate, monthly error budget exhausted in ~2h"

# Slow burn alert: consuming 3x rate → budget gone in ~5 days
- alert: MediumErrorBudgetBurnRate
  expr: |
    (
      1 - sum(rate(http_server_requests_total{status!~"5.."}[6h]))
          / sum(rate(http_server_requests_total[6h]))
    ) / (1 - 0.999) > 3
  for: 30m
  labels:
    severity: warning
  annotations:
    summary: "Elevated error rate — address soon to protect monthly budget"
${F}

**What you see when burn rate alert fires:**
${F}
🔴 FIRING: HighErrorBudgetBurnRate
  Summary: Burning error budget at 14x rate — page on-call
  Description: At current rate, monthly error budget exhausted in ~2h
  Current error rate: 1.4% (SLO: 0.1%)
${F}

---

## Step 4 — Track budget on a Grafana dashboard

${F}
Grafana panel: "Error Budget Status"
├── Budget remaining this month: 67% ✅
├── Current error rate: 0.03% (SLO: 0.1%) ✅
├── p99 latency: 312ms (SLO: 500ms) ✅
└── Burn rate (1h): 0.3x (normal) ✅
${F}

---

## 💡 Interview answer

**Open:** "We were getting paged for high CPU and disk usage but missing actual user impact — slow response times went undetected for hours. Our alerts were on the wrong things."

**Then:** "I defined two SLIs: availability (% successful requests) and latency (p99 < 500ms). The SLO was 99.9% availability. Instead of alerting when the SLO was violated, I implemented burn rate alerting — we page at 14× burn rate (budget gone in 2 hours) and create a ticket at 3× burn rate (5 days)."

**End:** "The key insight from Google's SRE book: alerting on SLO violation is too late — the damage is done. Alerting on burn rate gives you time to react. It also means we never page on CPU spikes that don't affect users — CPU at 90% with zero error budget impact is just fine."
`.trim(),

'th-golden-signals': `
## 🔥 The situation

Your monitoring dashboard has 50 graphs — CPU, disk I/O, JVM heap, GC count, connection pools, thread counts... It's overwhelming. When an incident happens, nobody knows where to look first. Google's Site Reliability Engineering book identified just **4 golden signals** that together tell you everything you need to know about a service's health.

---

## 🧠 Understand this first

| Golden Signal | What it measures | Typical tool |
|---|---|---|
| **Latency** | How long requests take — split by success vs error | Histogram, p50/p95/p99 |
| **Traffic** | How many requests/second — the load on the system | Counter / rate() |
| **Errors** | What fraction of requests fail | Counter, error rate |
| **Saturation** | How "full" the service is — thread pool, connection pool, CPU queue | Gauge |

These 4 answer: "Is it slow? Is it broken? Is it busy? Is it about to break?"

---

## Step 1 — Instrument latency (histogram)

${F}java
// Spring Boot Actuator does this automatically for @RestController
// Or add custom timing:
@Service
public class OrderService {

    private final MeterRegistry meterRegistry;

    public Order createOrder(OrderRequest request) {
        Timer.Sample sample = Timer.start(meterRegistry);
        try {
            Order order = doCreateOrder(request);
            sample.stop(meterRegistry.timer("order.create.duration",
                "status", "success",
                "region", "us-east"));
            return order;
        } catch (Exception e) {
            sample.stop(meterRegistry.timer("order.create.duration",
                "status", "error",
                "error.type", e.getClass().getSimpleName()));
            throw e;
        }
    }
}
${F}

**Prometheus query for p99 latency:**
${F}
histogram_quantile(0.99,
  rate(http_server_requests_seconds_bucket{uri="/api/orders"}[5m]))
${F}

---

## Step 2 — Instrument traffic and error rate

${F}yaml
# Spring Boot Actuator auto-exposes these — just enable Prometheus endpoint
management:
  endpoints:
    web:
      exposure:
        include: prometheus,health,info
  metrics:
    export:
      prometheus:
        enabled: true
${F}

**Prometheus queries:**
${F}
# Traffic: requests per second
rate(http_server_requests_total[5m])

# Error rate: % of 5xx responses
sum(rate(http_server_requests_total{status=~"5.."}[5m]))
/ sum(rate(http_server_requests_total[5m])) * 100

# Error count by type
sum by (status, uri) (rate(http_server_requests_total{status=~"4..|5.."}[5m]))
${F}

---

## Step 3 — Instrument saturation

${F}java
@Component
public class SaturationMetrics {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private ThreadPoolTaskExecutor threadPool;

    @PostConstruct
    public void registerMetrics(MeterRegistry registry) {
        // Connection pool saturation
        HikariPool pool = (HikariPool) ((HikariDataSource) dataSource).getHikariPoolMXBean();
        Gauge.builder("db.pool.utilization", pool,
            p -> (double) p.getActiveConnections() / p.getTotalConnections())
            .description("Database connection pool utilization (0-1)")
            .register(registry);

        // Thread pool saturation
        Gauge.builder("thread.pool.utilization", threadPool,
            tp -> (double) tp.getActiveCount() / tp.getMaxPoolSize())
            .description("Thread pool utilization (0-1)")
            .register(registry);
    }
}
${F}

**What you see in Grafana:**
${F}
db.pool.utilization: 0.45  (45% used — healthy)
thread.pool.utilization: 0.92  (92% used — WARNING, near saturation!)
${F}

---

## Step 4 — Build the golden signals dashboard

${F}
Grafana dashboard layout:
┌─────────────────────┬─────────────────────┐
│  LATENCY            │  TRAFFIC            │
│  p50: 45ms ✅       │  450 req/s          │
│  p95: 180ms ✅      │  ▁▃▅▇█▇▅▃▁          │
│  p99: 420ms ⚠️      │                     │
├─────────────────────┼─────────────────────┤
│  ERRORS             │  SATURATION         │
│  Error rate: 0.02%  │  DB pool: 45% ✅    │
│  400s: 12/min       │  Threads: 92% ⚠️    │
│  500s: 0/min ✅     │  CPU queue: 0.3 ✅  │
└─────────────────────┴─────────────────────┘
${F}

---

## 💡 Interview answer

**Open:** "Our monitoring had 50+ graphs that nobody looked at during incidents because there was too much to parse. We were missing real problems while getting distracted by normal resource fluctuations."

**Then:** "I reorganized around Google's four golden signals. One Grafana dashboard, four panels: latency (p50/p95/p99), traffic (req/s), error rate, and saturation (thread pool and DB pool utilization %). Spring Boot Actuator and Micrometer give you latency, traffic, and errors for free — saturation needed two custom gauges for the pools."

**End:** "The impact was measurable: MTTR went from 45 minutes to 12 minutes because on-call engineers now start in the same place. High saturation with rising latency = we're overwhelmed, scale out. High errors with normal saturation = bug or config change. High latency with low saturation = downstream slow. The four signals narrow the search space immediately."
`.trim(),

'th-alert-fatigue': `
## 🔥 The situation

Your team gets 200 Slack alerts per day. Half are noise — CPU warnings that auto-resolve, disk alerts from log rotation, test environment alerts polluting the production channel. Nobody reads them anymore, so when a real alert fires, it's missed. This is **alert fatigue** — the monitoring system has cried wolf so often that engineers have stopped listening.

---

## 🧠 Understand this first

| Concept | What it means |
|---|---|
| **Alert fatigue** | So many alerts that engineers start ignoring them — dangerous for real incidents |
| **Actionable alert** | An alert where a human must act — it can't auto-resolve and requires intervention |
| **Symptom-based alerting** | Alert on user impact (high error rate) not cause (high CPU) |
| **Flapping alert** | An alert that fires and resolves repeatedly — usually a noisy threshold |
| **Alert inhibition** | Suppress child alerts when a parent alert is active |
| **for: duration** | Alert must be true for this duration before firing — prevents transient spikes |

---

## Step 1 — Audit and classify existing alerts

${F}bash
# In Alertmanager — see which alerts fire most often
curl http://alertmanager:9093/api/v2/alerts | jq '.[].labels.alertname' | sort | uniq -c | sort -rn
${F}

**What you see:**
${F}
  847  HighCpuUsage          ← fires constantly, never leads to action
  312  DiskSpaceWarning      ← log rotation, always resolves itself
   89  HighMemoryUsage       ← also auto-resolves
   12  PaymentServiceDown    ← actually important!
    3  DatabaseConnectionFail ← actually important!
${F}

**Decision:** If an alert fires 800 times and never requires human action, delete it or convert it to a dashboard metric.

---

## Step 2 — Raise thresholds and add duration requirements

${F}yaml
# BEFORE: fires on any spike
- alert: HighCpuUsage
  expr: cpu_usage_percent > 80
  # no duration = fires on any 1-second spike

# AFTER: only fires if it's sustained AND severe
- alert: HighCpuUsage
  expr: cpu_usage_percent > 95   # raised threshold
  for: 15m                       # must be sustained 15 minutes
  annotations:
    summary: "CPU > 95% for 15 minutes — likely a real problem"
    runbook: "https://wiki/runbooks/high-cpu"
${F}

---

## Step 3 — Alert on symptoms, not causes

${F}yaml
# BAD: alerting on cause (CPU)
- alert: HighCpuUsage
  expr: cpu_usage_percent > 80

# GOOD: alerting on user-visible symptom
- alert: HighRequestLatency
  expr: |
    histogram_quantile(0.99, rate(http_server_requests_seconds_bucket[5m])) > 0.5
  for: 5m
  annotations:
    summary: "p99 latency > 500ms for 5 minutes — users impacted"

# BAD: alerting on disk usage
- alert: DiskSpaceWarning
  expr: disk_used_percent > 70

# GOOD: alert when disk will fill up soon
- alert: DiskFillingSoon
  expr: predict_linear(node_filesystem_avail_bytes[6h], 4*3600) < 0
  for: 30m
  annotations:
    summary: "Disk predicted to fill in <4 hours based on current rate"
${F}

---

## Step 4 — Route alerts by severity and silence noisy ones

${F}yaml
# alertmanager.yml
route:
  group_by: ['alertname', 'environment']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h           # don't repeat same alert for 4 hours
  receiver: 'default'
  routes:
    - match:
        severity: critical
      receiver: pagerduty       # pages on-call
      repeat_interval: 1h

    - match:
        severity: warning
      receiver: slack-warnings  # posts to Slack, no page
      repeat_interval: 24h      # only repeat once/day

    - match:
        environment: staging
      receiver: 'dev-slack'     # separate channel — never pages
      inhibit_rules: []

inhibit_rules:
  # If the whole cluster is down, suppress individual service alerts
  - source_match:
      alertname: 'ClusterDown'
    target_match:
      severity: 'warning'
    equal: ['environment']
${F}

---

## Step 5 — Track alert quality metrics

${F}bash
# How often does each alert fire and get silenced?
# In Grafana:
# alertmanager_alerts_total → count of alerts
# alertmanager_silences_active → count of active silences
# High silences = alerts you're manually suppressing = noise

# Weekly review: any alert fired > 10x and had zero Jira tickets created? Delete it.
${F}

---

## 💡 Interview answer

**Open:** "Our team averaged 200 alert notifications per day. Engineers had stopped reading them because 90% were noise — CPU spikes from batch jobs, disk warnings from log rotation. When a real payment outage started, the alert sat unread for 20 minutes."

**Then:** "I ran a 2-week audit: for every alert, I tracked whether it resulted in human action. 85% never did. I deleted or converted them to dashboard-only metrics. The remaining alerts got: higher thresholds, \`for: 15m\` duration requirements, and routing changes — critical to PagerDuty, warnings to a low-noise Slack channel."

**End:** "Alert count dropped from 200/day to 8/day. MTTR improved because on-call engineers now treat every alert as real. The key principle I follow: an alert that doesn't require human action within 5 minutes of firing is a false alert — either raise the threshold or delete it."
`.trim(),

'th-canary-metrics': `
## 🔥 The situation

You deploy a new version of your service. It looks fine in staging. You release it to 100% of production and 30 minutes later, users start complaining. You roll back, but the damage is done. Canary deployments send a small % of traffic (e.g., 5%) to the new version and automatically compare metrics — if the canary looks bad, stop the rollout before it reaches everyone.

---

## 🧠 Understand this first

| Concept | What it means |
|---|---|
| **Canary deployment** | Send N% of traffic to new version, rest to stable version |
| **Baseline** | The stable version — what "normal" looks like |
| **Canary analysis** | Statistical comparison of canary vs baseline metrics |
| **Auto-rollback trigger** | If canary metrics exceed threshold vs baseline, rollout stops automatically |
| **Argo Rollouts** | Kubernetes controller that manages canary deployment + analysis |
| **Kayenta** | Netflix's open-source canary analysis service |

---

## Step 1 — Define canary metrics in Spring Boot

First, ensure your service emits the right metrics with a version tag:

${F}java
@Bean
public MeterRegistryCustomizer<MeterRegistry> metricsCommonTags(
        @Value("\${app.version}") String version) {
    return registry -> registry.config()
        .commonTags("version", version,  // "canary" or "stable"
                    "app", "order-service");
}
${F}

Now every metric automatically includes \`version="canary"\` or \`version="stable"\`.

---

## Step 2 — Configure Argo Rollouts canary strategy

${F}yaml
# k8s/rollout.yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: order-service
spec:
  replicas: 10
  strategy:
    canary:
      steps:
        - setWeight: 5          # Step 1: send 5% to canary
        - pause: {duration: 5m} # wait 5 minutes
        - analysis:             # run analysis
            templates:
              - templateName: order-service-analysis
        - setWeight: 25         # Step 2: promote to 25%
        - pause: {duration: 10m}
        - analysis:
            templates:
              - templateName: order-service-analysis
        - setWeight: 100        # Step 3: full rollout
${F}

---

## Step 3 — Define AnalysisTemplate (what to compare)

${F}yaml
apiVersion: argoproj.io/v1alpha1
kind: AnalysisTemplate
metadata:
  name: order-service-analysis
spec:
  metrics:
    - name: error-rate
      interval: 1m
      count: 5           # evaluate 5 times
      failureLimit: 1    # fail if error metric fails once
      provider:
        prometheus:
          address: http://prometheus:9090
          query: |
            sum(rate(http_server_requests_total{status=~"5..",version="canary"}[2m]))
            / sum(rate(http_server_requests_total{version="canary"}[2m]))
      successCondition: result[0] < 0.01    # canary error rate < 1%

    - name: p99-latency
      interval: 1m
      count: 5
      provider:
        prometheus:
          address: http://prometheus:9090
          query: |
            histogram_quantile(0.99,
              rate(http_server_requests_seconds_bucket{version="canary"}[2m]))
      successCondition: result[0] < 0.5     # p99 < 500ms
${F}

---

## Step 4 — Watch the rollout and auto-rollback

${F}bash
# Watch rollout progress
kubectl argo rollouts get rollout order-service --watch
${F}

**What you see (healthy canary):**
${F}
Name:            order-service
Status:          ॥ Paused
Strategy:        Canary
  Step:          2/6
  SetWeight:     5
  ActualWeight:  5

Canary pods: 1/10 (5%)
  Ready: 1
  Available: 1

Analysis Run:  order-service-analysis-abc123 ✅ Successful
  error-rate:  0.002 (threshold: < 0.01) ✅
  p99-latency: 0.234s (threshold: < 0.5s) ✅

Promoting to 25%...
${F}

**What you see (bad canary — auto-rollback):**
${F}
Analysis Run:  order-service-analysis-xyz789 ❌ Failed
  error-rate:  0.045 (threshold: < 0.01) ❌ FAILED

ROLLING BACK: canary weight set to 0%
All traffic routed back to stable version.
${F}

---

## 💡 Interview answer

**Open:** "We had a deploy that looked fine in staging but had a subtle bug causing 5% of orders to fail with a NullPointerException in a new code path. We only caught it 30 minutes after 100% rollout."

**Then:** "I implemented Argo Rollouts with a canary strategy. The first step sends 5% of traffic to the new version for 5 minutes. An AnalysisTemplate queries Prometheus: if canary error rate exceeds 1% or p99 latency exceeds 500ms compared to baseline, the rollout is automatically aborted and all traffic reverts to stable."

**End:** "The key metric design: version tags on every metric mean Prometheus can compare canary vs stable in the same query. With 5% of traffic, we get statistically significant signal within minutes — the bad deploy would have been caught with 50 failed orders instead of 1000. Canary analysis is now a required gate in our CD pipeline for any service handling user data."
`.trim(),

};

const data = JSON.parse(readFileSync(FILE, 'utf8'));
let count = 0;
for (const theme of data.themes) {
  for (const scenario of theme.scenarios) {
    if (answers[scenario.id]) {
      scenario.answer = answers[scenario.id];
      console.log(`✅ ${scenario.id}`);
      count++;
    }
  }
}
writeFileSync(FILE, JSON.stringify(data, null, 2));
console.log(`\nDone — ${count} scenarios rewritten.`);
