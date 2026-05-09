import { readFileSync, writeFileSync } from 'fs';
const FILE = 'public/data/scenarioInterviewThemes.json';
const F = '```';

const answers = {

'th-incident-blast': `
## 🔥 The situation

A bug makes it to production. Maybe it's corrupting data, returning wrong results, or crashing for 10% of users. How do you contain the damage — *right now* — before you even understand the root cause? This is **blast radius reduction**: stop the bleeding first, investigate second.

---

## 🧠 Understand this first

| Concept | What it means |
|---|---|
| **Blast radius** | How many users / services / data records are affected |
| **Containment** | Actions to stop damage from spreading — before fixing the root cause |
| **Feature flag** | Runtime switch to enable/disable a code path without deploying |
| **Kill switch** | Emergency feature flag that disables a specific risky feature |
| **Traffic shifting** | Route traffic away from a bad pod/region without a code deploy |
| **Read replica** | Database read traffic can be shifted to replicas to protect the primary |

---

## Step 1 — Identify and confirm the blast radius

${F}bash
# Check error rate and which endpoints are affected
curl http://localhost:8080/actuator/metrics/http.server.requests | jq '.'

# Check Prometheus for affected users
sum by (uri, status) (
  rate(http_server_requests_total{status=~"5.."}[5m])
)

# Check if it's isolated to one pod or all pods
kubectl top pods -l app=order-service
kubectl logs -l app=order-service --tail=50 | grep -i "error\|exception"
${F}

**What you see:**
${F}
Pod order-service-abc: 0 errors ✅
Pod order-service-def: 0 errors ✅
Pod order-service-xyz: 450 errors/min ← the bad pod!
${F}

If it's one pod — remove it from the load balancer. If it's all pods — you need a feature flag or rollback.

---

## Step 2 — Remove the bad pod immediately

${F}bash
# Remove from load balancer by removing the ready label
kubectl label pod order-service-xyz app- ready=false

# Or cordon the node it's on (prevents new scheduling)
kubectl cordon <node-name>

# Or delete the pod — it'll be replaced by a healthy one
kubectl delete pod order-service-xyz
${F}

---

## Step 3 — Toggle a feature flag (if the bug is in a feature)

${F}java
// In your code — gate the risky feature
@RestController
public class OrderController {

    @Value("\${features.new-pricing-engine:false}")
    private boolean newPricingEngineEnabled;

    @PostMapping("/orders")
    public Order createOrder(@RequestBody OrderRequest request) {
        if (newPricingEngineEnabled) {
            return orderService.createOrderWithNewPricing(request);  // the buggy path
        }
        return orderService.createOrder(request); // the safe path
    }
}
${F}

**Disable without a deploy:**
${F}bash
# Kubernetes ConfigMap update — no redeploy needed
kubectl create configmap app-features \
  --from-literal=features.new-pricing-engine=false \
  --dry-run=client -o yaml | kubectl apply -f -

# Or via your feature flag service (LaunchDarkly, Unleash, etc.)
curl -X PUT http://unleash/api/client/features/new-pricing-engine \
  -d '{"enabled": false}'
${F}

---

## Step 4 — Traffic shifting for geographic isolation

${F}bash
# If the bug only affects EU traffic — shift EU to US region
# Update Nginx/Envoy upstream weights
kubectl patch svc order-service --type=json \
  -p='[{"op": "replace", "path": "/spec/selector/region", "value": "us-east"}]'

# Or at the Istio level
kubectl apply -f - <<EOF
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: order-service
spec:
  http:
  - match:
    - headers:
        x-region:
          exact: eu-west
    route:
    - destination:
        host: order-service-us  # redirect EU traffic to US temporarily
EOF
${F}

---

## Step 5 — Communicate during the incident

${F}
Incident timeline (write as you go):
14:00 - Alert fired: 450 errors/min on order creation
14:02 - Confirmed: isolated to order-service-xyz pod
14:03 - Containment: deleted bad pod, errors dropped to 0
14:05 - Root cause investigation started
14:30 - Root cause found: null pointer in new pricing engine
14:35 - Fix deployed, monitoring 10 min
14:45 - Incident resolved. 450 orders affected. No data corruption.
${F}

---

## 💡 Interview answer

**Open:** "A bad deploy caused the new pricing engine to null-pointer on 10% of orders. The code path was live for 450 orders before we noticed."

**Then:** "My first action was containment, not diagnosis — I deleted the bad pod immediately (3 minutes after alert), which stopped the errors instantly since the new version was only on that pod during a partial rollout. Then I disabled the new-pricing-engine feature flag in the ConfigMap — a zero-deploy change — so even if it redeployed, the bad code path was off."

**End:** "We then investigated safely with the blast radius at zero. The postmortem identified two gaps: no canary analysis on the rollout, and the null case wasn't covered in tests. Now every rollout goes through Argo Rollouts with analysis, and the feature flag pattern is standard for any new code paths touching the order flow."
`.trim(),

'th-rollback-forward': `
## 🔥 The situation

A deploy is causing errors. The natural instinct is to roll back immediately. But rollback isn't always safe — what if the deploy ran a database migration? Rolling back the code without reverting the migration can break the old version. Sometimes **rolling forward** (fixing the bug and deploying again) is safer than rolling back.

---

## 🧠 Understand this first

| Concept | What it means |
|---|---|
| **Rollback** | Deploy the previous version of the code |
| **Roll forward** | Deploy a new version with a hotfix — don't go back |
| **Expand/Contract** | Migration pattern: add new schema, migrate, remove old — compatible with both versions |
| **Blue/green deployment** | Two environments; switch traffic between them — trivial rollback |
| **Immutable artifacts** | Docker images with Git SHA tags — exact rollback, no surprises |
| **Data migration risk** | If new code ran a destructive migration, old code may not understand the new schema |

---

## Step 1 — Check: is rollback safe?

Before rolling back, answer these questions:

${F}bash
# 1. Did the deploy include a database migration?
git log v1.2.3..v1.2.4 -- src/main/resources/db/migration/

# 2. Is the migration reversible?
# - Added a column (nullable) → safe to rollback (old code ignores the column)
# - Dropped a column → DANGEROUS to rollback (old code queries missing column)
# - Renamed a column → DANGEROUS
# - Added a NOT NULL column without default → old code can't INSERT

# 3. Was data written in the new format?
# Count records created since deploy
SELECT count(*) FROM orders WHERE created_at > '2024-01-15 14:00:00';
${F}

---

## Step 2A — Safe rollback (no schema changes)

${F}bash
# Kubernetes — rollback to previous deployment
kubectl rollout undo deployment/order-service

# Or to a specific revision
kubectl rollout history deployment/order-service
kubectl rollout undo deployment/order-service --to-revision=5

# Verify rollback
kubectl rollout status deployment/order-service
kubectl get pods -l app=order-service
${F}

**What you see:**
${F}
deployment.apps/order-service rolled back
Waiting for deployment "order-service" rollback to finish:
  2 out of 3 new replicas have been updated...
deployment "order-service" successfully rolled out
${F}

---

## Step 2B — Unsafe to rollback → roll forward with a hotfix

${F}bash
# If the migration can't be undone safely, fix forward
# 1. Revert ONLY the bug in code (not the migration)
git revert HEAD --no-commit
# or fix the specific bug:
git checkout feature-branch -- src/main/java/com/example/PricingService.java

# 2. Tag and build
git commit -m "hotfix: fix null pointer in new pricing engine"
git tag v1.2.5

# 3. Deploy the hotfix
kubectl set image deployment/order-service \
  order-service=myregistry/order-service:v1.2.5

# 4. Monitor
kubectl rollout status deployment/order-service
${F}

---

## Step 3 — Write schema migrations for safe rollback (expand/contract)

**Instead of renaming a column (dangerous):**

${F}sql
-- V1: Expand — add new column alongside old one
ALTER TABLE orders ADD COLUMN customer_id BIGINT;

-- V2: Migrate data — run in batches to avoid locking
UPDATE orders SET customer_id = user_id WHERE customer_id IS NULL;

-- V3: Contract — remove old column (only after all code uses new name)
-- This step waits until you're confident, NOT in the same deploy
ALTER TABLE orders DROP COLUMN user_id;
${F}

During the V1 deploy, both old code (using \`user_id\`) and new code (using \`customer_id\`) work. This means rollback is always safe.

---

## Step 4 — Use immutable Docker tags for exact rollback

${F}bash
# Always tag with Git SHA, never just "latest"
docker build -t myregistry/order-service:$(git rev-parse --short HEAD) .
docker push myregistry/order-service:$(git rev-parse --short HEAD)

# In Kubernetes deployment
kubectl set image deployment/order-service \
  order-service=myregistry/order-service:abc1234  # exact SHA

# Rollback is exact — you know exactly what you're getting
kubectl set image deployment/order-service \
  order-service=myregistry/order-service:def5678  # previous SHA
${F}

---

## 💡 Interview answer

**Open:** "A deploy had a bug and the instinct was to immediately roll back. But the deploy included a database migration that added a NOT NULL column with application-layer defaulting — old code couldn't INSERT without providing that column."

**Then:** "I evaluated the rollback safety: the migration was not reversible without data loss. So instead of rolling back, I rolled forward with a hotfix: reverted only the buggy code change, kept the migration in place, tagged it as v1.2.5, and deployed. Down for 8 minutes total — faster than a complex rollback would have been."

**End:** "This incident pushed us to adopt the expand/contract migration pattern — every schema change is a multi-step process where both old and new code work simultaneously. Rollback is now always safe because schema changes are backward-compatible by design. We also switched to Git-SHA-tagged Docker images so 'the previous version' is always unambiguous."
`.trim(),

'th-postmortem': `
## 🔥 The situation

An incident happened. Services were down, users were affected, data might have been impacted. The on-call engineer fixed it at 3am. Now what? Without a structured postmortem, the same incident will happen again in 6 months. With a good postmortem, you find the root cause and prevent recurrence.

---

## 🧠 Understand this first

| Concept | What it means |
|---|---|
| **Postmortem** | Structured document analyzing what happened, why, and how to prevent it |
| **Blameless** | Focus on system failures, not individual mistakes — blame kills candor |
| **5 Whys** | Repeatedly asking "why" to find root cause, not just surface symptoms |
| **Contributing factors** | Multiple causes usually combine — don't stop at the first "why" |
| **Action items** | Specific, assigned, time-bound tasks to prevent recurrence |
| **MTTR** | Mean Time To Recover — how long from incident start to full resolution |

---

## Step 1 — Gather the timeline (within 24 hours while memory is fresh)

${F}
Incident: Order Service Outage — 2024-01-15

Impact:
- Duration: 14:00 - 14:45 (45 minutes)
- Users affected: ~3,200 orders failed (10% of traffic)
- Data impact: No data corruption; failed orders can be retried

Timeline:
- 14:00 Deploy of v1.2.4 to production (25% canary)
- 14:03 Alert: error rate > 5% (PagerDuty)
- 14:07 On-call engineer @alice acknowledged
- 14:12 Identified: NullPointerException in PricingService.calculateDiscount()
- 14:18 Feature flag disabled (errors dropped to 0%)
- 14:35 Root cause found: new discount engine returns null for products with no category
- 14:42 Hotfix deployed (v1.2.5)
- 14:45 Incident resolved, monitoring 30 min
${F}

---

## Step 2 — 5 Whys analysis

${F}
Problem: 3200 orders failed with NullPointerException

Why 1: PricingService.calculateDiscount() threw NPE
  → product.getCategory() returned null for uncategorized products

Why 2: The new discount engine didn't handle null category
  → Developer assumed all products have categories (incorrect assumption)

Why 3: This assumption wasn't caught in tests
  → Unit tests only used products with categories; no null/edge case tests

Why 4: No integration tests with the actual product catalog
  → Test data was hand-crafted, not sampled from production data patterns

Why 5: No canary analysis gate in the deployment
  → The deploy went to 25% immediately without traffic-based metrics check

Root causes (there are usually multiple):
1. Missing null check (code quality)
2. Incomplete test data (testing gap)
3. No canary analysis (deployment safety gap)
${F}

---

## Step 3 — Write blameless action items

${F}
Action Items (NOT: "Alice needs to write better tests"):

1. [code] Add null-safe handling in PricingService for products with no category
   Owner: @alice | Due: 2024-01-17 | PR: #1234

2. [testing] Generate test fixtures from a sample of production product catalog
   Owner: @bob | Due: 2024-01-22 | Ticket: ENG-567

3. [testing] Add required test: PricingService handles null category gracefully
   Owner: @alice | Due: 2024-01-17 | Part of PR #1234

4. [deployment] Enable Argo Rollouts canary analysis for order-service
   Owner: @charlie | Due: 2024-01-31 | Ticket: ENG-568
   → Error rate threshold: 1%, p99 latency threshold: 500ms

5. [process] Update deployment runbook: check canary metrics before promoting past 25%
   Owner: @dave | Due: 2024-01-20
${F}

---

## Step 4 — Share the postmortem

${F}bash
# Share with the team, not just the on-call engineer
# Good postmortems are:
# - Shared company-wide (or team-wide)
# - Written in plain language non-engineers can understand
# - Focused on what the SYSTEM failed to prevent, not who made a mistake
# - Tracked: action items have owners and due dates, reviewed in sprint planning
${F}

---

## 💡 Interview answer

**Open:** "After a 45-minute payment outage, I ran the postmortem within 24 hours while the timeline was still clear in everyone's heads."

**Then:** "The 5 Whys analysis found three root causes, not one: a missing null check, test data that didn't reflect production patterns, and no canary analysis gate in our deployment pipeline. Each became a tracked action item with an owner and deadline. Critical insight: we never blame the person — the postmortem's job is to make the system resilient against human mistakes, not to identify a guilty party."

**End:** "Four weeks later, we reviewed all 5 action items: 4 were completed, 1 was descoped because canary analysis covered it better. Postmortems only work if the action items actually get done — I treat them like sprint tickets, not suggestions. Since implementing proper canary analysis (action item 4), we've caught 2 other issues in the canary stage before they reached full traffic."
`.trim(),

'th-data-repair': `
## 🔥 The situation

A bug ran in production for 2 hours before you caught it. During that time, it corrupted or incorrectly modified data for some users. Now you need to figure out: what data was affected, what the correct values should be, and how to fix it — without making things worse or violating ACID guarantees.

---

## 🧠 Understand this first

| Concept | What it means |
|---|---|
| **Audit log** | A record of every data change — who changed what, when, from what to what |
| **Soft delete** | Mark records as deleted instead of hard DELETE — recoverable |
| **Point-in-time recovery** | Restore DB to any point in time using WAL/binlog — requires DB-level support |
| **Idempotent repair** | The repair script can be run multiple times safely — same result each time |
| **Dry run** | Run the repair script in read-only mode first to see what it *would* change |
| **Transaction** | Wrap all repair writes in a single DB transaction — commit or rollback atomically |

---

## Step 1 — Identify the affected records

First, establish the time window and the bug's logic:

${F}sql
-- Find orders created during the bug window with signs of corruption
-- (example: discount_amount > order_total, which shouldn't be possible)
SELECT id, user_id, total_amount, discount_amount, created_at
FROM orders
WHERE created_at BETWEEN '2024-01-15 14:00:00' AND '2024-01-15 16:00:00'
  AND discount_amount > total_amount  -- the corruption signature
ORDER BY created_at;
${F}

**What you see:**
${F}
  id  | user_id | total_amount | discount_amount | created_at
------+---------+--------------+-----------------+---------------------
 1234 |     456 |        99.00 |          999.00 | 2024-01-15 14:03:00 ← corrupted
 1235 |     789 |        49.00 |          490.00 | 2024-01-15 14:07:00 ← corrupted
...
(847 rows)
${F}

---

## Step 2 — Find the correct values from audit log or source

${F}sql
-- If you have an audit log table
SELECT entity_id, old_value, new_value, changed_at, changed_by
FROM audit_log
WHERE entity_type = 'ORDER'
  AND entity_id IN (1234, 1235, ...)
  AND changed_at >= '2024-01-15 14:00:00'
ORDER BY changed_at;

-- Or find the correct value from another source
-- (product catalog had the real price, order_items has line item subtotals)
SELECT o.id,
       SUM(oi.quantity * oi.unit_price) AS correct_total
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
WHERE o.id IN (SELECT id FROM orders WHERE discount_amount > total_amount)
GROUP BY o.id;
${F}

---

## Step 3 — Write and dry-run the repair script

${F}sql
-- STEP 1: DRY RUN — see what would change without changing anything
BEGIN;

WITH correct_values AS (
    SELECT o.id,
           SUM(oi.quantity * oi.unit_price) AS correct_total,
           0.00 AS correct_discount  -- bug inflated discounts; correct is no discount
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    WHERE o.discount_amount > o.total_amount
      AND o.created_at BETWEEN '2024-01-15 14:00:00' AND '2024-01-15 16:00:00'
    GROUP BY o.id
)
SELECT
    o.id,
    o.total_amount AS current_total,
    cv.correct_total AS will_set_to_total,
    o.discount_amount AS current_discount,
    cv.correct_discount AS will_set_to_discount
FROM orders o
JOIN correct_values cv ON cv.id = o.id;

ROLLBACK; -- don't actually change anything yet
${F}

---

## Step 4 — Run the repair in a transaction with logging

${F}sql
BEGIN;

-- Log what we're about to repair (write to audit table first)
INSERT INTO repair_log (repair_id, order_id, old_total, old_discount, repaired_at)
SELECT
    'repair-2024-01-15-discount-bug',
    o.id,
    o.total_amount,
    o.discount_amount,
    NOW()
FROM orders o
WHERE o.discount_amount > o.total_amount
  AND o.created_at BETWEEN '2024-01-15 14:00:00' AND '2024-01-15 16:00:00';

-- Apply the fix
UPDATE orders o
SET
    discount_amount = 0.00,
    total_amount = (
        SELECT SUM(oi.quantity * oi.unit_price)
        FROM order_items oi WHERE oi.order_id = o.id
    ),
    repaired_by = 'repair-2024-01-15-discount-bug',
    repaired_at = NOW()
WHERE o.discount_amount > o.total_amount
  AND o.created_at BETWEEN '2024-01-15 14:00:00' AND '2024-01-15 16:00:00';

-- Verify the count matches expectation before committing
SELECT count(*) FROM orders WHERE repaired_by = 'repair-2024-01-15-discount-bug';
-- Should be 847

COMMIT; -- only if count looks right; otherwise ROLLBACK
${F}

---

## Step 5 — Notify affected users

${F}java
@Service
public class DataRepairNotificationService {

    @Transactional(readOnly = true)
    public void notifyAffectedUsers(String repairId) {
        List<Order> repairedOrders = orderRepository
            .findByRepairedBy(repairId);

        repairedOrders.stream()
            .collect(groupingBy(Order::getUserId))
            .forEach((userId, orders) -> {
                notificationService.send(userId, NotificationType.ORDER_CORRECTED,
                    Map.of("orderIds", orders.stream().map(Order::getId).collect(toList())));
            });

        log.info("Notified {} users about {} repaired orders",
            repairedOrders.stream().map(Order::getUserId).distinct().count(),
            repairedOrders.size());
    }
}
${F}

---

## 💡 Interview answer

**Open:** "A discount calculation bug ran for 2 hours and incorrectly overcharged 847 orders — discounts were being applied as 10× multipliers instead of percentages."

**Then:** "First I scoped the affected records by querying orders where \`discount_amount > total_amount\` in the bug window. I wrote a repair SQL wrapped in a transaction: log the before-state to a repair_log table, compute correct totals from order_items, update. I ran it first as a dry-run SELECT to verify the expected 847 rows, then committed. The repair_log means we can always prove what was changed and restore if needed."

**End:** "After repair, I triggered notifications to affected users. The big lesson: having an audit log and soft-delete is the difference between a recoverable incident and a data disaster. Now every critical table has \`created_at\`, \`updated_at\`, \`updated_by\` columns, and we use Flyway versioned migrations so we can trace what schema state existed at any point in time."
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
