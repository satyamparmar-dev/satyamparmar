# HTTP status codes reference for REST API design

*Which 2xx / 3xx / 4xx / 5xx to return and when — the decisions that come up in every API design discussion, with examples and common mistakes Java teams make.*

---

## Why status codes matter

Status codes are part of your API contract. A client — mobile app, frontend, another microservice — uses your status code to decide what to do next: retry, show an error, redirect, or continue. Using the wrong code breaks that contract. Using `200 OK` for everything and hiding errors in the body forces every client to parse your JSON to know if a call succeeded.

---

## 2xx — Success

| Code | Name | Use when |
|---|---|---|
| **200 OK** | OK | The request succeeded and there is a body to return. `GET`, `PUT`, `PATCH`. |
| **201 Created** | Created | A resource was created. Return with a `Location` header pointing to the new resource. Used after `POST`. |
| **202 Accepted** | Accepted | The request was accepted for async processing. It is not done yet. Return a job ID or polling URL. |
| **204 No Content** | No Content | The request succeeded but there is no body to return. `DELETE`, `PUT` when you do not return the updated resource. |

```java
// 200 — GET, successful update:
@GetMapping("/{id}")
public OrderDto getOrder(@PathVariable Long id) {
    return orderService.findById(id);  // Spring returns 200 automatically
}

// 201 — resource created:
@PostMapping
@ResponseStatus(HttpStatus.CREATED)
public ResponseEntity<OrderDto> createOrder(@RequestBody @Valid CreateOrderRequest req,
                                             UriComponentsBuilder uriBuilder) {
    OrderDto created = orderService.create(req);
    URI location = uriBuilder.path("/api/orders/{id}").buildAndExpand(created.id()).toUri();
    return ResponseEntity.created(location).body(created);
}

// 202 — async operation:
@PostMapping("/{id}/export")
@ResponseStatus(HttpStatus.ACCEPTED)
public Map<String, String> startExport(@PathVariable Long id) {
    String jobId = exportService.startAsync(id);
    return Map.of("jobId", jobId, "statusUrl", "/api/jobs/" + jobId);
}

// 204 — delete or update without returning body:
@DeleteMapping("/{id}")
@ResponseStatus(HttpStatus.NO_CONTENT)
public void deleteOrder(@PathVariable Long id) {
    orderService.delete(id);
}
```

---

## 3xx — Redirection

| Code | Name | Use when |
|---|---|---|
| **301 Moved Permanently** | Moved Permanently | The resource has permanently moved to a new URL. Clients and search engines should update their bookmarks. |
| **302 Found** | Found | Temporary redirect. Client should use the `Location` URL for this request but keep the original URL. |
| **304 Not Modified** | Not Modified | The resource has not changed since `If-Modified-Since` or `ETag` match. Client should use its cached copy. |
| **307 Temporary Redirect** | Temporary Redirect | Like 302 but guarantees the method is preserved (POST stays POST). |
| **308 Permanent Redirect** | Permanent Redirect | Like 301 but preserves the method. |

```java
// 301 — API version migration:
@GetMapping("/api/v1/orders")
public ResponseEntity<Void> redirectToV2() {
    return ResponseEntity.status(HttpStatus.MOVED_PERMANENTLY)
                         .location(URI.create("/api/v2/orders"))
                         .build();
}

// 304 — conditional GET with ETag:
@GetMapping("/{id}")
public ResponseEntity<OrderDto> getOrder(@PathVariable Long id,
                                          @RequestHeader(value = "If-None-Match", required = false) String ifNoneMatch) {
    OrderDto order = orderService.findById(id);
    String etag = "\"" + order.version() + "\"";
    if (etag.equals(ifNoneMatch)) {
        return ResponseEntity.status(HttpStatus.NOT_MODIFIED).build();
    }
    return ResponseEntity.ok().eTag(etag).body(order);
}
```

---

## 4xx — Client errors

These mean the client did something wrong. Do NOT retry automatically.

| Code | Name | Use when |
|---|---|---|
| **400 Bad Request** | Bad Request | The request is malformed: invalid JSON, wrong field type, missing required field. |
| **401 Unauthorized** | Unauthorized | The client is not authenticated. Token missing, expired, or invalid. Despite the name, this is an *authentication* failure. |
| **403 Forbidden** | Forbidden | The client is authenticated but not authorised to perform this action. This is an *authorisation* failure. |
| **404 Not Found** | Not Found | The resource does not exist. Also use for security-sensitive cases where you do not want to reveal existence (instead of 403). |
| **405 Method Not Allowed** | Method Not Allowed | The HTTP method is not supported for this endpoint (e.g. `DELETE` on a read-only resource). |
| **409 Conflict** | Conflict | The request conflicts with current state. Duplicate resource, optimistic lock failure, invalid state transition. |
| **410 Gone** | Gone | The resource existed but has been permanently deleted. Use when deletion is important for clients to know. Otherwise 404 is fine. |
| **415 Unsupported Media Type** | Unsupported Media Type | `Content-Type` is not what the server accepts (e.g. sent XML when only JSON is accepted). |
| **422 Unprocessable Entity** | Unprocessable Entity | The request is syntactically correct (valid JSON) but semantically invalid (business rule violation). |
| **429 Too Many Requests** | Too Many Requests | Rate limit exceeded. Include `Retry-After` header. |

```java
// 400 vs 422 — the distinction that matters:
// 400: "I can't even parse your request"
// 422: "I can parse it, but the data breaks a business rule"

@ExceptionHandler(MethodArgumentNotValidException.class)
@ResponseStatus(HttpStatus.BAD_REQUEST)          // 400 — invalid JSON shape
public ProblemDetail handleValidation(MethodArgumentNotValidException ex) { ... }

@ExceptionHandler(BusinessRuleException.class)
@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY) // 422 — business constraint
public ProblemDetail handleBusinessRule(BusinessRuleException ex) { ... }

// Example: "order must have at least one item" → 422, not 400
// "customerId is not a number" → 400


// 401 vs 403:
// 401: "Who are you? I don't know you." → Client should prompt for login
// 403: "I know who you are, but you can't do this." → Client should not retry or redirect to login

@ExceptionHandler(AuthenticationException.class)
@ResponseStatus(HttpStatus.UNAUTHORIZED)  // 401
public ProblemDetail handleAuth(AuthenticationException ex) { ... }

@ExceptionHandler(AccessDeniedException.class)
@ResponseStatus(HttpStatus.FORBIDDEN)     // 403
public ProblemDetail handleForbidden(AccessDeniedException ex) { ... }


// 409 — optimistic locking conflict:
@ExceptionHandler(OptimisticLockException.class)
@ResponseStatus(HttpStatus.CONFLICT)      // 409
public ProblemDetail handleConflict(OptimisticLockException ex) {
    return ProblemDetail.forStatus(409); // include message: "Resource was modified, retry"
}

// 429 — rate limiting:
@ExceptionHandler(RateLimitExceededException.class)
public ResponseEntity<ProblemDetail> handleRateLimit(RateLimitExceededException ex) {
    return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                         .header("Retry-After", String.valueOf(ex.getRetryAfterSeconds()))
                         .body(ProblemDetail.forStatus(429));
}
```

---

## 5xx — Server errors

These mean something went wrong on your side. Clients may retry with backoff.

| Code | Name | Use when |
|---|---|---|
| **500 Internal Server Error** | Internal Server Error | Unexpected exception — your code crashed. Never return this intentionally. |
| **501 Not Implemented** | Not Implemented | The endpoint exists but the feature is not implemented yet. |
| **502 Bad Gateway** | Bad Gateway | Your service is a proxy and the upstream returned an invalid response. |
| **503 Service Unavailable** | Service Unavailable | Server is overloaded or down for maintenance. Include `Retry-After`. |
| **504 Gateway Timeout** | Gateway Timeout | Your service is a proxy and the upstream timed out. |

```java
// 503 during graceful shutdown:
@GetMapping("/actuator/health")
public ResponseEntity<Map<String, String>> health() {
    if (shuttingDown.get()) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                             .header("Retry-After", "30")
                             .body(Map.of("status", "SHUTTING_DOWN"));
    }
    return ResponseEntity.ok(Map.of("status", "UP"));
}
```

---

## Problem Details (RFC 9457 / RFC 7807) — the modern error response format

Use this instead of inventing your own error JSON. Spring 6 / Spring Boot 3 supports it natively.

```json
{
  "type": "https://yourapi.com/errors/order-not-found",
  "title": "Order Not Found",
  "status": 404,
  "detail": "Order with ID 42 does not exist.",
  "instance": "/api/orders/42"
}
```

```java
// Spring Boot 3 — enable Problem Details globally:
// application.properties:
// spring.mvc.problemdetails.enabled=true

// Or build manually:
@ExceptionHandler(OrderNotFoundException.class)
public ResponseEntity<ProblemDetail> handleNotFound(OrderNotFoundException ex) {
    ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
    problem.setTitle("Order Not Found");
    problem.setType(URI.create("https://yourapi.com/errors/order-not-found"));
    return ResponseEntity.status(404).body(problem);
}
```

---

## The most common mistakes

| Mistake | What to do instead |
|---|---|
| Return `200` with `{"success": false, "error": "Not found"}` | Return `404` — do not hide errors in 200 bodies |
| Return `500` for `not found` (uncaught exception) | Catch `EntityNotFoundException`, return `404` |
| Return `403` when the resource doesn't exist | Return `404` — don't reveal existence to unauthorised clients |
| Return `400` for business rule violations | Return `422 Unprocessable Entity` |
| Return `200` after `POST` that created something | Return `201 Created` with `Location` header |
| Return `200` after `DELETE` with empty body | Return `204 No Content` |
| No `Retry-After` header on `429` | Always add `Retry-After` — clients need to know when to retry |
| Swallow `OptimisticLockException` and return `200` | Return `409 Conflict` and let the client retry |

---

## Quick reference

| Situation | Code |
|---|---|
| `GET` / successful `PUT` / successful `PATCH` | 200 |
| Resource just created (`POST`) | 201 + `Location` header |
| Async operation started | 202 + job status URL |
| `DELETE` or `PUT` with no response body | 204 |
| Malformed request / invalid field type | 400 |
| Not authenticated (no / bad token) | 401 |
| Authenticated but not authorised | 403 |
| Resource does not exist | 404 |
| Method not supported on this endpoint | 405 |
| Duplicate / state conflict / optimistic lock | 409 |
| Valid JSON but breaks business rules | 422 |
| Rate limit exceeded | 429 + `Retry-After` |
| Unexpected server crash | 500 |
| Upstream service returned garbage | 502 |
| Overloaded / maintenance mode | 503 + `Retry-After` |
| Upstream service timed out | 504 |
