import { readFileSync, writeFileSync } from 'fs';
const FILE = 'public/data/scenarioInterviewThemes.json';
const F = '```';
const answers = {
  'th-mob-double-tap': `
## 🔥 The situation

A user taps the "Pay" button. The network is slow — 3G on a crowded train. The button does not go grey immediately. They tap again. Two POST /payments requests hit your server at nearly the same moment. Both succeed. The user is charged twice. Support tickets arrive.

This is not a user error. It is an API design error. Your server was not ready for a world where buttons get tapped twice and networks lose acknowledgements.

## 🧠 Understand this first — why duplicate requests happen

| Cause | What the user sees | What actually happened |
|---|---|---|
| Slow network | Button feels unresponsive | First request is in-flight, not failed |
| No button disable | Nothing stops a second tap | Two requests sent |
| Server gets both | Both look new | Two charges created |
| ACK lost | Client thinks first one failed | Server already processed it |

The root problem: **HTTP timeouts are ambiguous**. A timeout does not mean the server failed. It means the client gave up waiting. The server may have already processed the request and the response got lost in transit.

## Step 1: Disable the button immediately on first tap

**Run this (JavaScript — add to your Pay button):**
\`\`\`javascript
const payButton = document.getElementById('pay-btn');

payButton.addEventListener('click', async () => {
  // Disable instantly — before any network call
  payButton.disabled = true;
  payButton.textContent = 'Processing…';

  try {
    const response = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 1999, currency: 'INR' }),
    });
    const result = await response.json();

    if (response.ok) {
      payButton.textContent = 'Paid ✓';
    } else {
      payButton.disabled = false;
      payButton.textContent = 'Pay';
      alert('Payment failed: ' + result.message);
    }
  } catch (err) {
    // Network error — re-enable so user can retry
    payButton.disabled = false;
    payButton.textContent = 'Pay';
    alert('Network error. Please try again.');
  }
});
\`\`\`

**What you see:** Button goes grey and says "Processing…" after the first click. Second click does nothing.

**What this means (simple):**
- Frontend debounce stops 90% of accidental double-taps
- But it does NOT protect you if the user opens two tabs, or if the first request times out and they retry
- Frontend protection alone is not enough — you also need backend protection

## Step 2: Create the deduplication table in the database

**Run this (SQL — run once during setup):**
\`\`\`sql
CREATE TABLE payment_requests (
  idempotency_key   VARCHAR(64)    NOT NULL,
  user_id           BIGINT         NOT NULL,
  amount_paise      INT            NOT NULL,
  currency          CHAR(3)        NOT NULL,
  status            VARCHAR(20)    NOT NULL DEFAULT 'PENDING',
  response_body     TEXT,
  created_at        TIMESTAMP      NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_idempotency_key UNIQUE (idempotency_key)
);

CREATE INDEX idx_payment_requests_user ON payment_requests(user_id, created_at);
\`\`\`

**What you see:** Table created. The UNIQUE constraint on \`idempotency_key\` is the critical part.

**What this means (simple):**
- When the same key arrives twice, the database throws a unique constraint violation
- Your code catches that and returns the stored response from the first request
- The user gets the same result both times — no double charge

## Step 3: Generate and send an idempotency key from the client

**Run this (JavaScript — generate the key before the request):**
\`\`\`javascript
function generateIdempotencyKey() {
  // UUID v4 — unique per payment attempt
  return crypto.randomUUID();
}

// Store the key for this payment attempt
// If the user retries the SAME failed payment, reuse the SAME key
const paymentKey = generateIdempotencyKey();
sessionStorage.setItem('current-payment-key', paymentKey);

const response = await fetch('/api/payments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Idempotency-Key': paymentKey,   // ← send on every attempt
  },
  body: JSON.stringify({ amount: 1999, currency: 'INR' }),
});
\`\`\`

**What you see:** Every request now carries a header like:
\`\`\`
Idempotency-Key: 7f3a9c2d-1234-4abc-8def-000011112222
\`\`\`

**What this means (simple):**
- The client generates the key once per payment attempt (not per HTTP call)
- If the network drops and the client retries with the same key, the server recognises it as a duplicate
- A genuine new payment gets a brand-new key

## Step 4: Check the idempotency key in your Java controller

**Run this (Java — Spring Boot controller):**
\`\`\`java
@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentRequestRepository repo;
    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<PaymentResponse> createPayment(
            @RequestHeader("Idempotency-Key") String idempotencyKey,
            @RequestBody PaymentRequest request,
            @AuthenticationPrincipal UserDetails user) {

        // Step A: Check if we already processed this key
        Optional<PaymentRequest> existing = repo.findByIdempotencyKey(idempotencyKey);

        if (existing.isPresent()) {
            // Duplicate request — return the stored response, do NOT charge again
            log.info("Duplicate payment request detected: key={} userId={}",
                     idempotencyKey, user.getUsername());
            PaymentResponse stored = objectMapper.readValue(
                existing.get().getResponseBody(), PaymentResponse.class);
            return ResponseEntity.ok(stored);
        }

        // Step B: Reserve the key BEFORE processing (prevents race condition)
        PaymentRequest record = new PaymentRequest();
        record.setIdempotencyKey(idempotencyKey);
        record.setUserId(Long.parseLong(user.getUsername()));
        record.setAmountPaise(request.getAmountPaise());
        record.setCurrency(request.getCurrency());
        record.setStatus("PENDING");

        try {
            repo.save(record);  // unique constraint fires here if duplicate
        } catch (DataIntegrityViolationException e) {
            // Race condition: another thread saved the same key a millisecond ago
            // Fetch and return that result
            existing = repo.findByIdempotencyKey(idempotencyKey);
            if (existing.isPresent() && existing.get().getResponseBody() != null) {
                PaymentResponse stored = objectMapper.readValue(
                    existing.get().getResponseBody(), PaymentResponse.class);
                return ResponseEntity.ok(stored);
            }
            return ResponseEntity.status(409).body(null);  // still processing
        }

        // Step C: Process the payment for real
        PaymentResponse result = paymentService.charge(request);

        // Step D: Store the response so we can replay it for duplicates
        record.setStatus("COMPLETED");
        record.setResponseBody(objectMapper.writeValueAsString(result));
        repo.save(record);

        return ResponseEntity.status(201).body(result);
    }
}
\`\`\`

**What you see in the application log:**
\`\`\`
2026-05-08 10:23:41 INFO  PaymentController - Processing payment: key=7f3a9c2d-1234-4abc-8def-000011112222 userId=42
2026-05-08 10:23:41 INFO  PaymentService    - Charging ₹19.99 for userId=42
2026-05-08 10:23:41 INFO  PaymentController - Payment COMPLETED: key=7f3a9c2d-1234-4abc-8def-000011112222

2026-05-08 10:23:42 INFO  PaymentController - Duplicate payment request detected: key=7f3a9c2d-1234-4abc-8def-000011112222 userId=42
2026-05-08 10:23:42 INFO  PaymentController - Returning stored response — no charge made
\`\`\`

**What this means (simple):**
- First request: processed and stored
- Second request (same key, 1 second later): duplicate detected, stored result returned, no charge
- User sees success both times — but is only charged once

## Step 5: Test that deduplication actually works

**Run this (test scenario using curl):**
\`\`\`bash
# Simulate the first request
curl -X POST http://localhost:8080/api/payments \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: test-key-abc123" \
  -H "Authorization: Bearer <token>" \
  -d '{"amountPaise": 1999, "currency": "INR"}'

# Simulate the duplicate (same key, fired immediately after)
curl -X POST http://localhost:8080/api/payments \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: test-key-abc123" \
  -H "Authorization: Bearer <token>" \
  -d '{"amountPaise": 1999, "currency": "INR"}'
\`\`\`

**What you see:**
\`\`\`
# First response:
HTTP 201 Created
{"paymentId":"pay_789","status":"COMPLETED","amount":1999}

# Second response (duplicate key):
HTTP 200 OK
{"paymentId":"pay_789","status":"COMPLETED","amount":1999}

# Payment provider dashboard: only ONE charge for ₹19.99
# Database: only ONE row in payment_requests
\`\`\`

**What this means (simple):**
- Different HTTP status codes (201 vs 200) tell the client whether it is a new or replayed response
- Same payment ID in both responses — client can verify it is the same transaction
- Only one charge ever appears

## Your interview answer

**Open:** "The root cause is that HTTP timeouts are ambiguous — a timeout means the client gave up, not that the server failed, so the first request may have already been processed when the second arrives."

**Then:** "I fix this at two layers — the frontend disables the Pay button immediately on first click, and the backend checks an idempotency key sent in the request header. The key is stored in a table with a unique constraint, so the database itself rejects duplicates at the insert level. If a duplicate arrives, I return the stored response from the first request without charging again."

**End:** "I test it by firing two requests with the same key in quick succession and verifying the payment provider shows only one charge and the database has only one row."
`.trim(),

  'th-mob-offline': `
## 🔥 The situation

A delivery worker opens your app in the basement of a warehouse — no network signal. They tap "Create Order" for a ₹4,500 shipment. The app shows "Order placed!" The worker leaves. When they reach the street and the phone reconnects, your app tries to sync. But the server already has a conflicting state — someone else created an order with the same reference number, or the server's inventory count has changed. What do you do?

This is the offline-first problem. It is extremely common in mobile apps for field workers, delivery apps, and low-connectivity regions.

## 🧠 Understand this first — three strategies compared

| Strategy | What it means | When to use | Risk |
|---|---|---|---|
| Online-only | Block all actions without network | Simplest | App is useless offline |
| Optimistic UI | Show success immediately, sync later | Best UX | Must handle sync failures |
| Offline queue | Store operations locally, replay when online | Field apps, delivery | Conflicts possible |

| Conflict resolution | Who wins | When to use |
|---|---|---|
| Last-write-wins (LWW) | Whoever synced last | Simple fields, low-stakes |
| Server-wins | Server state always authoritative | Inventory, money |
| Client-wins | Client state always wins | User preferences |
| Manual merge | Show conflict to user | Documents, rich content |

## Step 1: Store the operation locally when offline (the offline queue)

**Run this (JavaScript — IndexedDB queue):**
\`\`\`javascript
// Check network status
const isOnline = navigator.onLine;

async function createOrder(orderData) {
  if (isOnline) {
    // Normal path — send directly
    return await sendToServer(orderData);
  } else {
    // Offline path — save to local queue
    const operation = {
      id: crypto.randomUUID(),          // unique ID for this operation
      type: 'CREATE_ORDER',
      payload: orderData,
      localTimestamp: Date.now(),
      retryCount: 0,
      status: 'PENDING',
    };

    await saveToOfflineQueue(operation);

    // Show optimistic success to the user
    return {
      orderId: operation.id,            // local ID until server confirms
      status: 'PENDING_SYNC',
      message: 'Order saved. Will sync when you go online.',
    };
  }
}

async function saveToOfflineQueue(operation) {
  const db = await openIndexedDB();
  const tx = db.transaction('offline_queue', 'readwrite');
  await tx.objectStore('offline_queue').add(operation);
  console.log(\`[Offline] Queued operation: \${operation.id} type=\${operation.type}\`);
}
\`\`\`

**What you see in the browser console:**
\`\`\`
[Offline] Queued operation: a1b2c3d4-5678-90ab-cdef-111122223333 type=CREATE_ORDER
App UI: "Order placed! (syncing when online)"
\`\`\`

**What this means (simple):**
- The operation is saved in IndexedDB — this survives app restarts and browser refreshes
- The user sees success immediately — this is called **optimistic UI**
- The actual sync happens later when the network comes back

## Step 2: Sync the queue when the device comes back online

**Run this (JavaScript — sync-on-reconnect listener):**
\`\`\`javascript
window.addEventListener('online', async () => {
  console.log('[Sync] Network restored — starting sync');
  await syncOfflineQueue();
});

async function syncOfflineQueue() {
  const db = await openIndexedDB();
  const tx = db.transaction('offline_queue', 'readonly');
  const pendingOps = await tx.objectStore('offline_queue').getAll();

  console.log(\`[Sync] Found \${pendingOps.length} pending operations\`);

  for (const op of pendingOps) {
    try {
      const result = await sendToServer(op);

      if (result.conflict) {
        await handleConflict(op, result);
      } else {
        await removeFromQueue(op.id);
        console.log(\`[Sync] ✅ Operation synced: \${op.id}\`);
      }
    } catch (err) {
      op.retryCount += 1;
      await updateQueueItem(op);
      console.warn(\`[Sync] ❌ Failed to sync: \${op.id} retries=\${op.retryCount}\`);
    }
  }
}
\`\`\`

**What you see:**
\`\`\`
[Sync] Network restored — starting sync
[Sync] Found 3 pending operations
[Sync] ✅ Operation synced: a1b2c3d4-5678-90ab-cdef-111122223333
[Sync] ✅ Operation synced: b2c3d4e5-6789-01bc-def0-222233334444
[Sync] ❌ Failed to sync: c3d4e5f6-7890-12cd-ef01-333344445555 retries=1
\`\`\`

**What this means (simple):**
- Operations are sent to the server one by one in the order they were created
- If sync succeeds, the operation is removed from the local queue
- If sync fails, the retry count increases — after a max retries threshold, show the user an error

## Step 3: Send the batch to the server — Java endpoint

**Run this (Java — Spring Boot batch sync endpoint):**
\`\`\`java
@RestController
@RequestMapping("/api/sync")
public class SyncController {

    @PostMapping("/batch")
    public ResponseEntity<SyncResponse> batchSync(
            @RequestBody List<SyncOperation> operations,
            @AuthenticationPrincipal UserDetails user) {

        List<SyncResult> results = new ArrayList<>();

        for (SyncOperation op : operations) {
            try {
                SyncResult result = processOperation(op, user);
                results.add(result);
            } catch (ConflictException e) {
                results.add(SyncResult.conflict(op.getId(), e.getServerVersion()));
            } catch (Exception e) {
                results.add(SyncResult.failed(op.getId(), e.getMessage()));
            }
        }

        return ResponseEntity.ok(new SyncResponse(results));
    }

    private SyncResult processOperation(SyncOperation op, UserDetails user) {
        switch (op.getType()) {
            case "CREATE_ORDER":
                // Check idempotency — did we already process this local ID?
                if (orderRepo.existsByClientOperationId(op.getId())) {
                    Order existing = orderRepo.findByClientOperationId(op.getId());
                    return SyncResult.alreadySynced(op.getId(), existing.getId());
                }

                // Check for version conflict — has server state changed?
                if (op.getBaseVersion() != null) {
                    long serverVersion = inventoryRepo.getCurrentVersion(op.getPayload().getItemId());
                    if (serverVersion != op.getBaseVersion()) {
                        throw new ConflictException(
                            "Inventory changed since offline edit", serverVersion);
                    }
                }

                Order created = orderService.create(op.getPayload(), op.getId());
                return SyncResult.success(op.getId(), created.getId());

            default:
                return SyncResult.failed(op.getId(), "Unknown operation type");
        }
    }
}
\`\`\`

**What you see in the server log:**
\`\`\`
2026-05-08 11:45:02 INFO  SyncController - Batch sync received: 3 operations from userId=42
2026-05-08 11:45:02 INFO  SyncController - op=a1b2c3d4 type=CREATE_ORDER → SUCCESS orderId=ORD-9001
2026-05-08 11:45:02 INFO  SyncController - op=b2c3d4e5 type=CREATE_ORDER → ALREADY_SYNCED orderId=ORD-9000
2026-05-08 11:45:02 WARN  SyncController - op=c3d4e5f6 type=CREATE_ORDER → CONFLICT serverVersion=15 clientVersion=12
\`\`\`

**What this means (simple):**
- Each operation gets a result: SUCCESS, ALREADY_SYNCED, or CONFLICT
- ALREADY_SYNCED means the server already has this — safe to remove from local queue
- CONFLICT means the server state changed while you were offline — needs resolution

## Step 4: Handle conflicts — what shape the conflict response takes

**Run this (the conflict response the server sends back):**
\`\`\`json
{
  "operationId": "c3d4e5f6-7890-12cd-ef01-333344445555",
  "status": "CONFLICT",
  "clientVersion": 12,
  "serverVersion": 15,
  "serverState": {
    "itemId": "ITEM-55",
    "availableQty": 2,
    "lastModifiedBy": "user_99",
    "lastModifiedAt": "2026-05-08T11:30:00Z"
  },
  "conflictResolution": "SERVER_WINS",
  "message": "Inventory reduced by another user while you were offline. Only 2 units available."
}
\`\`\`

**What you see on the client after receiving this:**
\`\`\`
[Sync] ⚠️ Conflict for operation c3d4e5f6
       Your order requested qty=5, server now shows availableQty=2
       Resolution: SERVER_WINS
       Action: Showing user a conflict dialog
\`\`\`

**What this means (simple):**
- For inventory and money: **server-wins** is the safest choice — you cannot ship more than you have
- For user preferences or notes: **client-wins** or **last-write-wins** is fine
- For rich content like documents: show the user both versions and let them merge
- The version numbers (12 vs 15) tell you exactly how far apart the two states are

## Your interview answer

**Open:** "I solve this at two layers — optimistic UI shows the user immediate success so the app feels responsive offline, and a local operation queue in IndexedDB stores the intent so nothing is lost when the connection drops."

**Then:** "When the network comes back, a sync-on-reconnect listener replays the queue to the server. The server checks an idempotency key per operation to avoid processing the same operation twice, and it checks a version number to detect conflicts. For money and inventory I use server-wins because I cannot trust client-side data for financial correctness. For user preferences I can safely use last-write-wins."

**End:** "I test this by putting the device in airplane mode, creating several orders, switching airplane mode off, and verifying all operations sync correctly — including checking that a conflict on inventory shows the user a clear error message rather than silently losing their order."
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
