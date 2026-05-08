/**
 * V2 rewrite of all 6 oauth-real-world scenario answers.
 * Run: node scripts/rewrite-v2-oauth.mjs
 */
import { readFileSync, writeFileSync } from 'fs';

const FILE = 'public/data/scenarioInterviewThemes.json';
const F = '```';

const answers = {

// ─────────────────────────────────────────────────────────────────────────────
'th-oauth-random-logout': `
## 🔥 The situation
Users complain they get randomly logged out — sometimes after 15 minutes, sometimes after hours. No error shown. They just land on the login page again.

## 🧠 Understand this first

| Token type | What it is | Typical lifetime |
|---|---|---|
| Access token | Short-lived — used for API calls | 5–60 minutes |
| Refresh token | Long-lived — used to get new access tokens silently | Hours to days |
| ID token | Contains user info (name, email) | Same as access token |
| Session cookie | Browser-side — stores session state | Configurable |

**The flow when done correctly:**
${F}text
User logs in
  → gets access token (expires in 15 min) + refresh token (expires in 7 days)

15 min later: access token expires
  → app silently calls /token with refresh token
  → gets a new access token — user never notices

7 days later: refresh token expires
  → can no longer get new tokens
  → user must log in again (expected behavior)
${F}

**Random logouts = something breaking the silent refresh.**

## Step 1: Check if the refresh token call is even happening
${F}bash
# In browser DevTools → Network tab → filter by "token"
# Reproduce the logout. Look for a POST to your token endpoint.
${F}

**What you see (no refresh call — bug):**
${F}text
(nothing — the app never called /token before logging the user out)
${F}
**What this means (simple):** The app is not attempting to refresh. The frontend code that handles "access token expired" → "call refresh" is missing or broken.

**What you see (refresh call failed):**
${F}text
POST /oauth/token  400 Bad Request
{ "error": "invalid_grant", "error_description": "Refresh token expired or revoked" }
${F}
**What this means (simple):** The refresh token itself expired. This is expected after 7 days but random if it happens after 15 minutes — means refresh token lifetime is misconfigured, OR the refresh token is being rotated and the old one stored in the browser is already invalid.

## Step 2: Check refresh token rotation settings
${F}bash
# In your OAuth provider dashboard (Okta, Auth0, Keycloak, etc.) look for:
# "Refresh Token Rotation" setting
# If enabled: every time you use a refresh token, you get a NEW one back.
# The old one is immediately invalidated.
${F}

**What happens with rotation + multiple tabs:**
${F}text
Tab 1: access token expires → calls /token with refresh_token=ABC → gets new access_token + refresh_token=XYZ
Tab 2: access token expires (same moment) → calls /token with refresh_token=ABC
         → 400 invalid_grant — ABC was already consumed by Tab 1!
         → Tab 2 triggers logout
${F}
**What this means (simple):** Two browser tabs racing to refresh causes one to win and one to get logged out. The fix is to coordinate refresh across tabs.

**Fix — use a mutex/lock for refresh:**
${F}javascript
// Shared lock across tabs using BroadcastChannel or localStorage
let isRefreshing = false;
let refreshSubscribers = [];

async function refreshToken() {
  if (isRefreshing) {
    // Someone else is already refreshing — wait for their result
    return new Promise((resolve) => refreshSubscribers.push(resolve));
  }
  isRefreshing = true;
  try {
    const response = await fetch('/oauth/token', {
      method: 'POST',
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: getStoredRefreshToken(),
      }),
    });
    const tokens = await response.json();
    storeTokens(tokens);
    refreshSubscribers.forEach(cb => cb(tokens.access_token));
    refreshSubscribers = [];
    return tokens.access_token;
  } finally {
    isRefreshing = false;
  }
}
${F}

## Step 3: Check clock skew (very common cause)
**Why:** Access tokens have an \`exp\` (expiry) field. Your server checks \`exp\` against its own clock. If server clock is 5 minutes ahead of the issuer, it rejects tokens that are still valid.

${F}bash
# Check server clock vs real time
date -u
curl -s http://worldtimeapi.org/api/ip | grep utc_datetime
${F}

**What you see (skew problem):**
${F}text
Server: 10:32:00 UTC
Real:   10:27:00 UTC
Difference: 5 minutes — tokens expire 5 min early on this server
${F}

**Fix — add a clock skew leeway in your JWT validation:**
${F}java
// With Nimbus JOSE (Spring Security uses this internally)
JWTClaimsSet claims = signedJWT.getJWTClaimsSet();
Date expiry = claims.getExpirationTime();
long leewaySeconds = 60; // allow 60 seconds of clock drift
if (expiry.getTime() + leewaySeconds * 1000 < System.currentTimeMillis()) {
    throw new BadJOSEException("Token expired");
}

// With Spring Security OAuth2:
// application.yml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          jws-algorithms: RS256
# Spring auto-handles leeway via NimbusJwtDecoder — set it explicitly:
@Bean
NimbusJwtDecoder jwtDecoder() {
    NimbusJwtDecoder decoder = NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build();
    decoder.setClockSkew(Duration.ofSeconds(60)); // accept tokens 60s past expiry
    return decoder;
}
${F}

## Step 4: Check where refresh tokens are stored
${F}javascript
// BAD: localStorage — survives page close, but accessible by any JS (XSS risk)
localStorage.setItem('refresh_token', token);

// BAD: sessionStorage — lost when tab closes → logout on tab close
sessionStorage.setItem('refresh_token', token);

// GOOD: HttpOnly cookie — JS cannot read it, sent automatically, survives tab close
// Server sets it:
// Set-Cookie: refresh_token=XYZ; HttpOnly; Secure; SameSite=Strict; Path=/oauth/token
${F}
**What this means (simple):** If refresh token is in sessionStorage, closing a tab = logout. If in localStorage, an XSS attack can steal it. HttpOnly cookies are safest — the browser sends them automatically, JS can never read them.

## Your interview answer
**Open:** "I'd check three things: whether the frontend is even attempting a token refresh, whether refresh token rotation is causing multi-tab race conditions, and whether there's clock skew between the token issuer and the resource server."
**Then:** "For multi-tab races, I'd add a refresh lock so only one tab refreshes at a time. For clock skew, I'd add a 60-second leeway to JWT validation. For storage, I'd move refresh tokens to HttpOnly cookies."
**End:** "Random logouts almost always trace back to one of these three root causes — the fix is identifying which one using browser network logs and server-side JWT validation logs."
`.trim(),

// ─────────────────────────────────────────────────────────────────────────────
'th-oauth-401-prod': `
## 🔥 The situation
Your API returns 401 Unauthorized in production, but the same request works fine in staging. The token looks valid. What do you investigate?

## 🧠 Understand this first

| Root cause | What it means | How to detect |
|---|---|---|
| Wrong \`aud\` (audience) | Token issued for staging, rejected by prod | Decode the JWT, check \`aud\` field |
| Wrong \`iss\` (issuer) | Prod server validates against wrong issuer URL | Check resource server config |
| Wrong JWK Set URL | Prod fetches wrong public keys to verify signature | Check \`spring.security.oauth2.resourceserver.jwt.jwk-set-uri\` |
| Wrong client secret | Prod client secret doesn't match what's in the provider | Compare provider dashboard vs app config |
| Clock skew | Prod server clock is ahead, token looks expired | Compare \`date -u\` on server vs real time |
| CORS rejection | Preflight blocked, looks like 401 to the app | Check browser console for CORS errors |

## Step 1: Decode the token and read the claims
${F}bash
# Paste the JWT at jwt.io, or decode it locally:
# A JWT is 3 base64 parts split by dots: header.payload.signature

# Decode just the payload (middle part):
echo "eyJpc3MiOiJodHRwczovL3N0YWdpbmcuYXV0aC5leGFtcGxlLmNvbSIsImF1ZCI6InN0YWdpbmctYXBpIn0" \
  | base64 -d 2>/dev/null || base64 --decode
${F}

**What you see:**
${F}json
{
  "iss": "https://staging.auth.example.com",
  "aud": "staging-api",
  "sub": "user-123",
  "exp": 1710000000,
  "iat": 1709996400
}
${F}
**What this means (simple):**
- \`iss\` = who issued this token — staging issuer
- \`aud\` = who this token is FOR — says "staging-api"
- Your prod server checks: "is \`aud\` == 'prod-api'?" — it's not, so 401.
- The frontend is sending a staging token to the prod API. Config bug.

## Step 2: Check what your resource server expects
${F}yaml
# application-production.yml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: https://prod.auth.example.com           # ← must match iss in token
          jwk-set-uri: https://prod.auth.example.com/.well-known/jwks.json
${F}

${F}java
// OR configured in code — check audiences:
@Bean
JwtDecoder jwtDecoder() {
    NimbusJwtDecoder decoder = NimbusJwtDecoder
        .withJwkSetUri("https://prod.auth.example.com/.well-known/jwks.json")
        .build();

    OAuth2TokenValidator<Jwt> audienceValidator = token -> {
        if (token.getAudience().contains("prod-api")) {
            return OAuth2TokenValidatorResult.success();
        }
        return OAuth2TokenValidatorResult.failure(
            new OAuth2Error("invalid_token", "Wrong audience", null)
        );
    };

    decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(
        JwtValidators.createDefault(),
        audienceValidator
    ));
    return decoder;
}
${F}

**What you see in server logs when audience is wrong:**
${F}text
WARN  o.s.s.o.s.r.a.JwtAuthenticationProvider - Failed to authenticate since the JWT was invalid
Caused by: org.springframework.security.oauth2.core.OAuth2TokenValidationException:
  An error occurred while attempting to decode the Jwt: The aud claim is not valid
${F}
**What this means (simple):** The server decoded the token successfully (signature is valid), but the \`aud\` claim doesn't match what the server expects. This is a config mismatch, not a code bug.

## Step 3: Check the JWK Set (public key) is being fetched from the right place
${F}bash
# See what keys the prod server is using to verify tokens
curl https://prod.auth.example.com/.well-known/jwks.json
${F}

**What you see:**
${F}json
{
  "keys": [
    {
      "kty": "RSA",
      "kid": "prod-key-2024-01",
      "use": "sig",
      "n": "0vx7agoebGcQSuu...",
      "e": "AQAB"
    }
  ]
}
${F}
**What this means (simple):** \`kid\` = key ID. Your JWT header also has a \`kid\`. If they don't match, signature verification fails → 401. This happens when prod and staging use different signing keys (they should).

${F}bash
# Decode the JWT header (first part before the first dot):
echo "eyJhbGciOiJSUzI1NiIsImtpZCI6InN0YWdpbmcta2V5LTIwMjQifQ" | base64 -d 2>/dev/null
${F}

**What you see:**
${F}json
{ "alg": "RS256", "kid": "staging-key-2024" }
${F}
**What this means (simple):** Token was signed with \`staging-key-2024\` but prod's JWKS only has \`prod-key-2024-01\`. No matching key → can't verify signature → 401. Confirm the frontend is getting tokens from the prod OAuth provider, not staging.

## Step 4: Check the clock skew quickly
${F}bash
# On the production server
date -u && echo "---" && cat /proc/uptime

# Decode the exp from the JWT (convert epoch to readable):
date -d @1710000000
# → Mon Mar 10 00:00:00 UTC 2024
# Compare with: date -u on the server
${F}

**What you see (skew problem):**
${F}text
Server time:  2024-03-09 23:55:00 UTC   → but actually it's 2024-03-10 00:01:00 UTC
Token exp:    2024-03-10 00:00:00 UTC   → token still valid for 5 more real minutes
Server says:  EXPIRED (because server clock is 6 min ahead)
${F}

**Fix:**
${F}bash
# Sync server clock (Linux)
sudo timedatectl set-ntp true
sudo systemctl restart systemd-timesyncd
timedatectl status
# → NTP service: active, System clock synchronized: yes
${F}

## Your interview answer
**Open:** "I'd start by decoding the JWT and reading its \`iss\`, \`aud\`, and \`kid\` claims — these three fields explain almost every prod-only 401."
**Then:** "If \`aud\` says 'staging-api', the frontend is fetching tokens from the wrong provider. If \`kid\` doesn't match the prod JWKS, signature verification fails. I'd also compare the server clock — a 5-minute skew makes valid tokens look expired."
**End:** "The fix is almost always an environment config bug: wrong issuer URI, wrong audience in the OAuth client config, or wrong JWKS URL in the resource server config."
`.trim(),

// ─────────────────────────────────────────────────────────────────────────────
'th-oauth-m2m': `
## 🔥 The situation
Service A needs to call Service B's API without a user being involved. There is no login screen. How do services authenticate to each other securely?

## 🧠 Understand this first

| Flow | Used when | Has a user? |
|---|---|---|
| Authorization Code | User logs into a web app | Yes — user grants consent |
| Client Credentials | Service calls another service | No — machine-to-machine (M2M) |
| Password | Legacy apps (avoid) | Yes — but dangerous |
| PKCE | Mobile/SPA apps | Yes |

**Client Credentials flow (M2M):**
${F}text
Service A                         Auth Server                    Service B
    │                                 │                              │
    │── POST /token ──────────────────▶│                              │
    │   client_id=svc-a               │                              │
    │   client_secret=abc123          │                              │
    │   grant_type=client_credentials │                              │
    │                                 │                              │
    │◀── access_token (JWT) ──────────│                              │
    │                                 │                              │
    │── GET /api/data ────────────────────────────────────────────▶│
    │   Authorization: Bearer <JWT>   │                              │
    │                                 │                              │
    │◀── 200 OK ──────────────────────────────────────────────────│
${F}

## Step 1: Register a client in your OAuth provider

**In Keycloak (or any provider):**
${F}bash
# Using Keycloak admin REST API
curl -X POST http://keycloak:8080/admin/realms/myrealm/clients \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "service-a",
    "secret": "super-secret-value",
    "serviceAccountsEnabled": true,   ← enables client credentials grant
    "directAccessGrantsEnabled": false,
    "standardFlowEnabled": false       ← disable user-facing flows
  }'
${F}

**What you see:**
${F}text
HTTP 201 Created
{ "id": "3fa2b1c4-...", "clientId": "service-a" }
${F}

## Step 2: Fetch a token from Service A (the caller)
${F}bash
curl -X POST http://keycloak:8080/realms/myrealm/protocol/openid-connect/token \
  -d "grant_type=client_credentials" \
  -d "client_id=service-a" \
  -d "client_secret=super-secret-value" \
  -d "scope=inventory:read"
${F}

**What you see:**
${F}json
{
  "access_token": "eyJhbGci...",
  "token_type": "Bearer",
  "expires_in": 300,
  "scope": "inventory:read"
}
${F}
**What this means (simple):** You got a JWT valid for 300 seconds (5 minutes). Use it as the Bearer token for all calls to Service B during those 5 minutes, then fetch a new one.

## Step 3: Implement token caching so you don't fetch on every request
${F}java
@Service
public class TokenProvider {

    private String cachedToken;
    private Instant expiresAt;

    public String getToken() {
        // Refresh 30 seconds early to avoid edge-case expiry mid-request
        if (cachedToken == null || Instant.now().isAfter(expiresAt.minusSeconds(30))) {
            refreshToken();
        }
        return cachedToken;
    }

    private synchronized void refreshToken() {
        // Double-check inside synchronized block (another thread may have refreshed)
        if (cachedToken != null && Instant.now().isBefore(expiresAt.minusSeconds(30))) {
            return;
        }
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "client_credentials");
        body.add("client_id", "service-a");
        body.add("client_secret", clientSecret); // injected from env/secret

        TokenResponse resp = restTemplate.postForObject(tokenUrl, body, TokenResponse.class);
        this.cachedToken = resp.getAccessToken();
        this.expiresAt = Instant.now().plusSeconds(resp.getExpiresIn());
        log.info("Token refreshed, expires at {}", expiresAt);
    }
}
${F}

**What you see in logs:**
${F}text
INFO  TokenProvider - Token refreshed, expires at 2024-03-10T10:05:30Z
INFO  TokenProvider - Token refreshed, expires at 2024-03-10T10:10:30Z
(every ~4.5 minutes — not on every request)
${F}
**What this means (simple):** Without caching, every API call to Service B would first call the auth server — adding 50–100ms latency and hammering the auth server. Caching means one token fetch per 5-minute window.

## Step 4: Validate the token on Service B (the receiver)
${F}java
// Service B — Spring Security config
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/inventory/**").hasAuthority("SCOPE_inventory:read")
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt
                    .jwkSetUri("http://keycloak:8080/realms/myrealm/protocol/openid-connect/certs")
                )
            );
        return http.build();
    }
}
${F}

**What you see in Service B logs when token is valid:**
${F}text
DEBUG o.s.s.o.s.r.a.JwtAuthenticationProvider - Authenticated token for service-a
DEBUG o.s.s.w.a.i.FilterSecurityInterceptor - Authorized service-a for /api/inventory/items
${F}

**What you see when scope is missing:**
${F}text
WARN  o.s.s.w.a.AccessDeniedHandlerImpl - Access is denied
→ HTTP 403 Forbidden (token is valid but lacks the required scope)
${F}
**What this means (simple):** 401 = bad token (expired, wrong signature). 403 = valid token but missing permission (scope). Different problem, different fix.

## Step 5: Store the client secret safely — never in code
${F}bash
# In Kubernetes: store as a Secret, inject as env variable
kubectl create secret generic service-a-oauth \
  --from-literal=CLIENT_SECRET=super-secret-value \
  -n production
${F}

${F}yaml
# deployment.yaml
env:
- name: OAUTH_CLIENT_SECRET
  valueFrom:
    secretKeyRef:
      name: service-a-oauth
      key: CLIENT_SECRET
${F}

${F}yaml
# application.yml — read from env
oauth:
  client-secret: \${OAUTH_CLIENT_SECRET}
${F}

## Your interview answer
**Open:** "For service-to-service calls, I'd use the OAuth Client Credentials flow — no user involved, just a client ID and secret exchanged for an access token."
**Then:** "Service A fetches a token at startup and caches it, refreshing it 30 seconds before expiry. Service B validates the JWT signature using the provider's JWK Set and checks that the required scope is present."
**End:** "Client secret lives in a Kubernetes Secret, injected as an env variable — never in code or git. The key insight: Client Credentials is just like a username+password for services, but token-based and short-lived."
`.trim(),

// ─────────────────────────────────────────────────────────────────────────────
'th-oauth-leak-mobile': `
## 🔥 The situation
A user reports their account was accessed from a different country minutes after they logged in on their phone. Tokens may have been stolen. How did it happen, and how do you prevent it?

## 🧠 Understand this first

| Attack vector | How token leaks | Prevention |
|---|---|---|
| Token in URL | \`?access_token=XYZ\` in redirect URL — logged by servers, proxies, browser history | Use Authorization Code flow, never implicit flow |
| Insecure storage | Token in SharedPreferences (Android) or NSUserDefaults (iOS) — other apps can read | Use Keystore (Android) or Keychain (iOS) |
| No PKCE | Malicious app intercepts the auth code | Use PKCE (Proof Key for Code Exchange) |
| Cleartext HTTP | Token sent over HTTP — captured by network sniffers | HTTPS everywhere, HSTS |
| Long-lived tokens | Stolen token valid for hours | Short access tokens (5 min) + refresh token in secure storage |
| No token binding | Stolen token reused from different device | Refresh token rotation + device fingerprinting |

## Step 1: Use Authorization Code flow with PKCE on mobile
**Why:** The old "Implicit Flow" put the access token directly in the URL. Malicious apps on the device could intercept it. PKCE fixes this without needing a client secret (mobile apps can't safely keep secrets).

**How PKCE works:**
${F}text
Step 1: App generates a random string → code_verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p..."
Step 2: App hashes it → code_challenge = SHA256(code_verifier) → base64url encode
Step 3: App opens browser with:
        GET /authorize?response_type=code
                       &client_id=mobile-app
                       &redirect_uri=myapp://callback
                       &code_challenge=abc123hash
                       &code_challenge_method=S256

Step 4: User logs in, auth server gives back an auth CODE (not token) via redirect
Step 5: App sends: POST /token
                   code=AUTH_CODE_HERE
                   code_verifier=dBjftJeZ4CVP-mB92K27uhbUJU1p...
Step 6: Auth server hashes the verifier, checks it matches the challenge
        → If match: issues access token
        → If stolen code used without verifier: REJECTED
${F}

**What this means (simple):** Even if a malicious app intercepts the auth code in step 4, it cannot exchange it for a token because it doesn't know the \`code_verifier\` that only the real app generated.

## Step 2: Implement PKCE in Android (Java/Kotlin)
${F}java
// Generate PKCE code verifier
public String generateCodeVerifier() {
    SecureRandom secureRandom = new SecureRandom();
    byte[] bytes = new byte[32];
    secureRandom.nextBytes(bytes);
    return Base64.encodeToString(bytes, Base64.URL_SAFE | Base64.NO_PADDING | Base64.NO_WRAP);
}

// Generate code challenge from verifier
public String generateCodeChallenge(String codeVerifier) throws Exception {
    MessageDigest digest = MessageDigest.getInstance("SHA-256");
    byte[] hash = digest.digest(codeVerifier.getBytes(StandardCharsets.US_ASCII));
    return Base64.encodeToString(hash, Base64.URL_SAFE | Base64.NO_PADDING | Base64.NO_WRAP);
}

// Store verifier securely (in memory or EncryptedSharedPreferences — NOT plain SharedPreferences)
// Then open the authorization URL with the challenge
String verifier = generateCodeVerifier();
String challenge = generateCodeChallenge(verifier);
String authUrl = "https://auth.example.com/authorize"
    + "?response_type=code"
    + "&client_id=mobile-app"
    + "&redirect_uri=" + Uri.encode("myapp://callback")
    + "&code_challenge=" + challenge
    + "&code_challenge_method=S256";

// Open in Chrome Custom Tabs (NOT WebView — WebView can be hooked by malware)
CustomTabsIntent intent = new CustomTabsIntent.Builder().build();
intent.launchUrl(context, Uri.parse(authUrl));
${F}

## Step 3: Store tokens securely on device
${F}java
// ANDROID — use EncryptedSharedPreferences (backed by Android Keystore)
MasterKey masterKey = new MasterKey.Builder(context)
    .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
    .build();

SharedPreferences encryptedPrefs = EncryptedSharedPreferences.create(
    context,
    "secure_prefs",
    masterKey,
    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
);

// Store
encryptedPrefs.edit().putString("refresh_token", token).apply();

// Retrieve
String refreshToken = encryptedPrefs.getString("refresh_token", null);
${F}

**What this means (simple):** Plain \`SharedPreferences\` stores values as readable XML on the device — any app with root access can read it. \`EncryptedSharedPreferences\` encrypts with a key stored in the Android Keystore hardware chip — even root access can't extract it.

## Step 4: Enable refresh token rotation + detect reuse
${F}bash
# In Keycloak — enable rotation and reuse detection
# Admin Console → Realm Settings → Tokens → Refresh Token → Revoke Refresh Token: ON
# This means: each refresh token can only be used ONCE.
# If attacker steals refresh token and uses it AFTER the real user already used it:
# → auth server detects reuse → revokes ENTIRE token family → user must log in again
${F}

**What you see in auth server logs when reuse is detected:**
${F}text
WARN  RefreshTokenService - Refresh token reuse detected for user user-123
WARN  RefreshTokenService - Revoking all tokens in family token-family-abc
INFO  RefreshTokenService - User user-123 will need to re-authenticate
${F}
**What this means (simple):** Even if an attacker stole the refresh token and used it, the moment the real user's app tries to use the (now-invalidated) old token, the server sees reuse and revokes everything. Attacker gets kicked out too.

## Step 5: Use short-lived access tokens
${F}yaml
# In auth server config — access tokens expire fast
access-token-lifetime: 300       # 5 minutes
refresh-token-lifetime: 86400    # 24 hours
refresh-token-rotation: enabled
${F}

**What this means (simple):** Even if an access token is stolen, it's useless after 5 minutes. Compare to a 1-hour token — attacker has 60 minutes of access vs 5 minutes.

## Your interview answer
**Open:** "Token leaks on mobile usually come from three places: the old Implicit Flow that put tokens in URLs, insecure storage like plain SharedPreferences, or no PKCE allowing code interception."
**Then:** "I'd switch to Authorization Code + PKCE, open the auth URL in a Chrome Custom Tab (not WebView), store tokens in EncryptedSharedPreferences backed by Android Keystore, and set short access token lifetimes with refresh token rotation."
**End:** "Rotation is key — if an attacker steals a refresh token and uses it after the real user already refreshed, the server detects the reuse and revokes all tokens for that session. The attacker is kicked out."
`.trim(),

// ─────────────────────────────────────────────────────────────────────────────
'th-oauth-scopes-break': `
## 🔥 The situation
Your team added a new required scope to an API endpoint. Now some clients are getting 403 Forbidden. Some work fine. You need to understand why and how to roll out scope changes safely.

## 🧠 Understand this first

| Concept | What it means | Example |
|---|---|---|
| Scope | Permission a client requests | \`inventory:read\`, \`orders:write\` |
| Token scopes | Scopes included IN the issued token | Set when token is requested |
| Required scope | What the API endpoint checks for | Configured in Spring Security |
| Consent | User approves which scopes the app can use | Only relevant for user-facing flows |
| Client scope | Default scopes for a given client registration | Configured per client in auth server |

**Why some clients break and some don't:**
${F}text
Client A token: { scopes: ["orders:read", "inventory:read"] }     ← has new scope → works
Client B token: { scopes: ["orders:read"] }                       ← missing new scope → 403
Client C token: { scopes: ["orders:read", "inventory:read"] }     ← cached token (old) → may or may not have it
${F}

## Step 1: Decode tokens from working and broken clients to compare scopes
${F}bash
# Decode the JWT from the broken client (paste into jwt.io or decode locally)
# Check the "scope" or "scp" claim in the payload
${F}

**What you see (broken client token):**
${F}json
{
  "sub": "service-client-b",
  "scope": "orders:read",
  "exp": 1710000000
}
${F}

**What you see (working client token):**
${F}json
{
  "sub": "service-client-a",
  "scope": "orders:read inventory:read",
  "exp": 1710000000
}
${F}
**What this means (simple):** \`inventory:read\` is missing from Client B's token. This is a client configuration problem — Client B never asked for (or was never granted) the \`inventory:read\` scope.

## Step 2: Update the broken client's token request
${F}bash
# Client B needs to request the new scope:
curl -X POST http://auth-server/token \
  -d "grant_type=client_credentials" \
  -d "client_id=service-client-b" \
  -d "client_secret=secret" \
  -d "scope=orders:read inventory:read"    ← add the new scope here
${F}

**What you see (if the client isn't allowed the scope yet):**
${F}json
{
  "error": "invalid_scope",
  "error_description": "Client is not authorized to request scope: inventory:read"
}
${F}
**What this means (simple):** The auth server also has a list of scopes each client is ALLOWED to request. If you added a new scope but didn't add it to the client's allowed scopes in the auth server dashboard, the request is rejected here.

## Step 3: Add the scope to the client in the auth server
${F}bash
# In Keycloak — add scope to client via API
curl -X PUT http://keycloak:8080/admin/realms/myrealm/clients/{client-uuid}/optional-client-scopes/{scope-uuid} \
  -H "Authorization: Bearer <admin-token>"

# OR via Admin Console:
# Clients → service-client-b → Client Scopes → Add "inventory:read" as Optional
${F}

**What you see after re-fetching the token:**
${F}json
{
  "sub": "service-client-b",
  "scope": "orders:read inventory:read",
  "exp": 1710000000
}
${F}

## Step 4: How to roll out scope changes safely (avoid breaking clients)

**Strategy: add the scope check AFTER all clients have been updated**
${F}text
Week 1: Add the new scope "inventory:read" to auth server (available but not required yet)
Week 1: Update all clients to request "inventory:read" in their token requests
Week 1: Monitor — all tokens should now have the scope
Week 2: Add the scope check to the API endpoint
Week 2: Any client without the scope now gets 403 (should be zero if Week 1 done correctly)
${F}

**Or use a graceful fallback during migration:**
${F}java
@RestController
public class InventoryController {

    @GetMapping("/inventory")
    @PreAuthorize("hasAuthority('SCOPE_inventory:read') or hasAuthority('SCOPE_orders:admin')")
    public List<Item> getInventory() {
        // Accept EITHER the new specific scope OR the existing admin scope
        // This lets old tokens with broad scope still work during migration
        return inventoryService.getAll();
    }
}
${F}

## Step 5: Check for cached tokens that are stale
${F}bash
# If client is caching tokens, it may be using an old token that was issued before the scope was available.
# Force a refresh:
curl -X POST http://auth-server/token \
  -d "grant_type=client_credentials" \
  -d "client_id=service-client-b" \
  -d "client_secret=secret" \
  -d "scope=orders:read inventory:read"
# If the client code caches the token for 300 seconds, old tokens may be used for up to 5 minutes
# after the scope configuration change.
${F}

**What this means (simple):** If tokens are cached and the client doesn't refresh, it keeps using the old token that was issued without the new scope. Wait for the cache to expire, or restart the service to force a new token fetch.

## Your interview answer
**Open:** "I'd decode the JWT from a broken client to confirm the required scope is missing from the token — that's almost always why it's 403 and not 401."
**Then:** "Then I'd check two things: does the client's code request the new scope, and does the auth server's client registration allow the scope. Both must be true for the scope to appear in the token."
**End:** "For rollout, I'd add the scope as available first, update all clients to request it, monitor that tokens contain it, then add the enforcement on the API. Never add the API-side check before the clients are updated."
`.trim(),

// ─────────────────────────────────────────────────────────────────────────────
'th-oauth-provider-down': `
## 🔥 The situation
Your OAuth provider (Okta, Auth0, Keycloak, etc.) is down. Users cannot log in. But they are already logged in — should they be able to keep using the app? How do you design for auth provider outages?

## 🧠 Understand this first

| Scenario | What happens without prep | What happens with prep |
|---|---|---|
| Provider down, user already logged in | JWT validation calls provider → fails → user kicked out | Token validated locally from cached JWK → user stays logged in |
| Provider down, user tries to log in | Login page hangs → user can't access | Show maintenance message immediately |
| Provider down, service-to-service token expired | Cannot fetch new token → all M2M calls fail | Cached token still valid for remaining 5 min window |
| Provider returns JWK keys slowly | Every request waits for slow JWK fetch → latency spike | JWK keys cached locally for hours |
| Provider back up | Everything works again | Same |

## Step 1: Cache JWK keys locally (most important fix)
**Why:** By default, Spring Security fetches the JWK Set (public keys) from the provider on each request or at intervals. If provider is down → can't fetch keys → can't validate tokens → 401 for all users.

${F}java
@Bean
NimbusJwtDecoder jwtDecoder() {
    // This caches the JWK Set in memory
    // Spring Security does this by default with a 5-minute refresh interval
    return NimbusJwtDecoder
        .withJwkSetUri("https://auth.example.com/.well-known/jwks.json")
        .cache(Duration.ofHours(1))   // ← cache keys for 1 hour
        .build();
}
${F}

**What this means (simple):** JWT validation only needs the public key. Public keys almost never change (key rotation happens rarely). Caching them for 1 hour means if the provider goes down for 30 minutes, your existing JWTs are still validated successfully from the cache.

**What you see in logs during outage (with cache — good):**
${F}text
DEBUG NimbusJwtDecoder - Using cached JWK set (expires in 47 minutes)
DEBUG JwtAuthenticationProvider - Authenticated user-123 from cached keys
// Users stay logged in — no provider contact needed
${F}

**What you see in logs during outage (without cache — bad):**
${F}text
ERROR NimbusJwtDecoder - Failed to fetch JWK Set from https://auth.example.com/.well-known/jwks.json
ERROR JwtAuthenticationProvider - Unable to validate token — returning 401
// All users kicked out
${F}

## Step 2: Don't call the provider's introspection endpoint on every request
${F}java
// BAD: calling introspection on every request (provider down = every request fails)
@Bean
OpaqueTokenIntrospector introspector() {
    return new NimbusOpaqueTokenIntrospector(
        "https://auth.example.com/introspect",  // remote call every time
        "client-id",
        "client-secret"
    );
}

// GOOD: use JWTs — validate locally with cached public key
// No remote call per request — just local signature verification
@Bean
SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http.oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()));
    return http.build();
}
${F}
**What this means (simple):** Opaque tokens are random strings — the server must call the provider to ask "is this token valid?" every time. JWTs contain their own claims and can be verified locally with the cached public key. JWTs are resilient to provider outages; opaque tokens are not.

## Step 3: Handle login failures gracefully
${F}java
// In your login controller or security config — catch provider connection errors
@GetMapping("/login/callback")
public ResponseEntity<?> handleCallback(@RequestParam String code, HttpServletResponse resp) {
    try {
        TokenResponse tokens = oauthClient.exchangeCode(code);
        // ... set session
        return ResponseEntity.status(302).header("Location", "/dashboard").build();

    } catch (HttpClientErrorException | ResourceAccessException e) {
        // Provider is down or returning errors
        log.error("OAuth provider unavailable during login: {}", e.getMessage());
        return ResponseEntity.status(302)
            .header("Location", "/error?reason=auth_unavailable")
            .build();
    }
}
${F}

**What the user sees (good):**
${F}text
We're having trouble reaching our login provider. Please try again in a few minutes.
[Status page link]
${F}

**What the user sees (bad — no handling):**
${F}text
(browser spinner for 30 seconds, then generic "something went wrong" error)
${F}

## Step 4: Circuit breaker for OAuth provider calls
${F}java
// Wrap the token endpoint call in a circuit breaker
@CircuitBreaker(name = "authProvider", fallbackMethod = "loginFallback")
public TokenResponse fetchToken(String code) {
    return oauthClient.exchangeCode(code);
}

public TokenResponse loginFallback(String code, Exception e) {
    log.warn("Auth provider circuit open — login unavailable");
    throw new AuthProviderUnavailableException("Login temporarily unavailable");
}
${F}

${F}yaml
resilience4j:
  circuitbreaker:
    instances:
      authProvider:
        slidingWindowSize: 5
        failureRateThreshold: 60     # open if 60% of 5 calls fail
        waitDurationInOpenState: 30s # wait 30s before trying again
${F}

**What you see in logs during outage:**
${F}text
INFO  CircuitBreaker - authProvider: CLOSED → OPEN (failure rate 80%)
WARN  AuthService - Auth provider circuit open — login unavailable
INFO  CircuitBreaker - authProvider: OPEN → HALF_OPEN (after 30s)
INFO  CircuitBreaker - authProvider: HALF_OPEN → CLOSED (provider recovered)
${F}

## Step 5: Have a status check endpoint
${F}java
// Add a health indicator for the auth provider
@Component
public class AuthProviderHealthIndicator implements HealthIndicator {

    @Override
    public Health health() {
        try {
            // Simple GET to the OIDC discovery endpoint
            restTemplate.getForObject(providerDiscoveryUrl, String.class);
            return Health.up().withDetail("provider", "reachable").build();
        } catch (Exception e) {
            return Health.down()
                .withDetail("provider", "unreachable")
                .withDetail("error", e.getMessage())
                .build();
        }
    }
}
${F}

${F}bash
curl http://your-service:8080/actuator/health
${F}

**What you see:**
${F}json
{
  "status": "DOWN",
  "components": {
    "authProvider": {
      "status": "DOWN",
      "details": { "provider": "unreachable", "error": "Connection refused" }
    }
  }
}
${F}

## Your interview answer
**Open:** "The most important thing is to not call the provider on every request. Use JWTs validated locally with cached public keys — that way, an auth provider outage doesn't immediately affect already-logged-in users."
**Then:** "I'd cache the JWK Set for at least an hour so token validation works during provider downtime. For new logins, I'd add a circuit breaker that fails fast and shows a clear 'login temporarily unavailable' message instead of a 30-second timeout."
**End:** "The design principle is: token validation must be offline-capable. Use JWTs, cache keys, and treat the provider as a dependency that can fail — just like a database."
`.trim(),

};

// ── Apply rewrites ────────────────────────────────────────────────────────────
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
