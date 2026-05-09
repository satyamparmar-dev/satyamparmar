import { readFileSync, writeFileSync } from 'fs';
const FILE = 'public/data/scenarioInterviewThemes.json';
const F = '```';

const answers = {

'th-sr-filter-order': `
## 🔥 The situation

You added a new security filter — maybe for JWT auth or request logging. It works in isolation, but in production, filters run in the wrong order. Your auth filter fires *after* the rate-limiter, or the logging filter runs *before* the JWT is validated, so it logs garbage.

Spring Security uses a **filter chain** — dozens of filters wired in a strict order. If you insert yours in the wrong slot, things silently break.

---

## 🧠 Understand this first

| Concept | What it means |
|---|---|
| **Filter chain** | A linked list of filters; each one calls \`chain.doFilter()\` to pass control to the next |
| **SecurityFilterChain** | Spring Security's own chain — distinct from the generic servlet filter chain |
| **Filter order** | Controlled by \`@Order\` or \`FilterRegistrationBean.setOrder()\` or \`addFilterBefore/After\` |
| **OncePerRequestFilter** | Ensures your filter runs exactly once per HTTP request (handles async/forwarding edge cases) |
| **UsernamePasswordAuthenticationFilter** | The default form-login filter; JWT filters usually go before \`SecurityContextPersistenceFilter\` |

Spring Security has a fixed internal ordering for its own filters (defined in \`FilterOrderRegistration\`). Your custom filter slots into this using position constants.

---

## Step 1 — List the current filter order

Add this line temporarily to your main class or a \`@Bean\` method:

${F}java
@Autowired
private FilterChainProxy springSecurityFilterChain;

@PostConstruct
public void printFilters() {
    springSecurityFilterChain.getFilterChains().forEach(chain -> {
        System.out.println("=== Security Filter Chain ===");
        chain.getFilters().forEach(f -> System.out.println(f.getClass().getSimpleName()));
    });
}
${F}

**What you see:**
${F}
=== Security Filter Chain ===
DisableEncodeUrlFilter
WebAsyncManagerIntegrationFilter
SecurityContextHolderFilter
HeaderWriterFilter
CorsFilter
LogoutFilter
JwtAuthFilter          ← your filter, check its position
UsernamePasswordAuthenticationFilter
...
${F}

**What this means:** You can see exactly where your filter sits relative to Spring's built-in ones.

---

## Step 2 — Register your filter in the right slot

**Option A — Using \`addFilterBefore\` / \`addFilterAfter\` in SecurityFilterChain:**

${F}java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .addFilterBefore(new JwtAuthFilter(jwtUtil), UsernamePasswordAuthenticationFilter.class)
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/public/**").permitAll()
            .anyRequest().authenticated()
        );
    return http.build();
}
${F}

This inserts \`JwtAuthFilter\` **before** Spring's \`UsernamePasswordAuthenticationFilter\`.

**Option B — Using \`@Order\` on a \`FilterRegistrationBean\` (for non-security servlet filters):**

${F}java
@Bean
public FilterRegistrationBean<RequestLoggingFilter> loggingFilter() {
    FilterRegistrationBean<RequestLoggingFilter> reg = new FilterRegistrationBean<>();
    reg.setFilter(new RequestLoggingFilter());
    reg.setOrder(Ordered.HIGHEST_PRECEDENCE + 10); // runs very early
    reg.addUrlPatterns("/*");
    return reg;
}
${F}

**What you see:**
${F}
2024-01-15 RequestLoggingFilter: GET /api/users - started
2024-01-15 JwtAuthFilter: token validated for user=alice
${F}

---

## Step 3 — Write your filter as OncePerRequestFilter

${F}java
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                String username = jwtUtil.extractUsername(token);
                UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(username, null,
                        jwtUtil.getAuthorities(token));
                SecurityContextHolder.getContext().setAuthentication(auth);
            } catch (JwtException e) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid token");
                return; // stop the chain
            }
        }

        filterChain.doFilter(request, response); // always call next
    }
}
${F}

**Key rule:** Always call \`filterChain.doFilter()\` unless you intentionally stop the request (like on auth failure).

---

## Step 4 — Test filter order with a debug log

Add to your \`application.yml\`:

${F}yaml
logging:
  level:
    org.springframework.security: DEBUG
    org.springframework.security.web.FilterChainProxy: DEBUG
${F}

**What you see:**
${F}
Security filter chain: [
  DisableEncodeUrlFilter
  WebAsyncManagerIntegrationFilter
  SecurityContextHolderFilter
  HeaderWriterFilter
  CorsFilter
  LogoutFilter
  JwtAuthFilter                      ← confirmed position
  UsernamePasswordAuthenticationFilter
  DefaultLoginPageGeneratingFilter
  ...
]
${F}

---

## 💡 Interview answer

**Open:** "We had a security filter executing after authentication instead of before — it was silently receiving unauthenticated requests and logging junk."

**Then:** "I used \`FilterChainProxy\` to print the full filter chain order at startup. Found our \`JwtAuthFilter\` was registered as a plain \`@Component\`, so Spring Boot auto-registered it outside the security chain. I moved it inside \`SecurityFilterChain\` using \`http.addFilterBefore(new JwtAuthFilter(), UsernamePasswordAuthenticationFilter.class)\`. I also extended \`OncePerRequestFilter\` to prevent it running twice on async dispatches."

**End:** "Now the order is deterministic and visible. Security DEBUG logs confirm position at startup. Filter-level integration tests verify 401 is returned before reaching the business layer."
`.trim(),

'th-sr-csrf-spa': `
## 🔥 The situation

You have a React SPA (Single Page App) talking to a Spring Boot API. Someone reports that CSRF protection is broken — either your AJAX calls fail with 403 Forbidden, or worse, CSRF is completely disabled without understanding why.

CSRF (Cross-Site Request Forgery) is a real attack, but how you handle it depends entirely on whether you're using cookies vs tokens for auth.

---

## 🧠 Understand this first

| Concept | What it means |
|---|---|
| **CSRF attack** | A malicious site tricks your logged-in browser into sending a request to your API using your session cookie |
| **Why CSRF exists** | Browsers automatically attach cookies to every request — attackers exploit this |
| **JWT in Authorization header** | Cannot be auto-sent by attackers — CSRF doesn't apply |
| **Session cookie** | Auto-sent by browsers — CSRF protection IS needed |
| **SameSite cookie** | Modern browser attribute that blocks cross-site cookie sending |
| **CSRF token** | A secret value the server gives your SPA; attackers can't read it (same-origin policy) |

**The golden rule:**
- Cookie-based auth (session) → need CSRF protection
- Header-based auth (JWT Bearer) → CSRF is unnecessary, disable it

---

## Step 1 — Diagnose: why are you getting 403?

Check what auth mechanism you're using:

${F}bash
# Check if your API uses session cookies
curl -v http://localhost:8080/api/protected 2>&1 | grep -i "set-cookie"

# Check if your SPA sends Authorization header
# Look at browser DevTools → Network → request headers
${F}

**If using JWT (Bearer token):**
Your 403 is because CSRF is enabled but you're not sending a CSRF token.
Fix: disable CSRF since JWT in headers is not vulnerable.

**If using session cookies:**
You need to properly implement the CSRF token flow.

---

## Step 2A — JWT-based SPA: disable CSRF correctly

${F}java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .csrf(csrf -> csrf.disable())          // safe when using JWT in Authorization header
        .sessionManagement(session -> session
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS)  // no server-side session
        )
        .addFilterBefore(new JwtAuthFilter(jwtUtil),
            UsernamePasswordAuthenticationFilter.class)
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/**").permitAll()
            .anyRequest().authenticated()
        );
    return http.build();
}
${F}

**Why stateless matters:** With \`STATELESS\`, Spring won't create or use \`HttpSession\` — so there's nothing for CSRF to protect.

---

## Step 2B — Cookie-based SPA: implement CSRF token correctly

${F}java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .csrf(csrf -> csrf
            .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
            // withHttpOnlyFalse → JS can read the XSRF-TOKEN cookie
        )
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/public/**").permitAll()
            .anyRequest().authenticated()
        );
    return http.build();
}
${F}

Spring sets a cookie \`XSRF-TOKEN\`. Your React app must:

${F}javascript
// React: read CSRF cookie and send it as a header
function getCsrfToken() {
    return document.cookie.split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];
}

// Attach to every mutating request
async function apiPost(url, body) {
    const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',         // send cookies
        headers: {
            'Content-Type': 'application/json',
            'X-XSRF-TOKEN': getCsrfToken()  // Spring validates this
        },
        body: JSON.stringify(body)
    });
    return response.json();
}
${F}

**What you see (success):**
${F}
HTTP/1.1 200 OK
Set-Cookie: XSRF-TOKEN=abc123; Path=/; SameSite=Strict
${F}

**What you see (failure — missing CSRF token):**
${F}
HTTP/1.1 403 Forbidden
{"error": "Forbidden", "message": "CSRF token mismatch"}
${F}

---

## Step 3 — Add SameSite protection as an extra layer

${F}java
@Bean
public CookieSameSiteSupplier cookieSameSiteSupplier() {
    return CookieSameSiteSupplier.ofStrict(); // blocks cross-site requests at browser level
}
${F}

Or in \`application.yml\`:

${F}yaml
server:
  servlet:
    session:
      cookie:
        same-site: strict   # modern browsers won't send cookie cross-site
        secure: true        # HTTPS only
        http-only: true     # JS cannot read session cookie (only XSRF-TOKEN is readable)
${F}

---

## Step 4 — Test CSRF protection

${F}java
@SpringBootTest
@AutoConfigureMockMvc
class CsrfTest {

    @Autowired
    private MockMvc mvc;

    @Test
    void postWithoutCsrfToken_returns403() throws Exception {
        mvc.perform(post("/api/transfer")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\\"amount\\": 1000}"))
            .andExpect(status().isForbidden());
    }

    @Test
    void postWithCsrfToken_returns200() throws Exception {
        mvc.perform(post("/api/transfer")
                .with(csrf())                   // Spring Security test support
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\\"amount\\": 1000}"))
            .andExpect(status().isOk());
    }
}
${F}

---

## 💡 Interview answer

**Open:** "Our React SPA was getting 403 errors on POST requests because Spring Security's CSRF protection was enabled, but our SPA was sending JWT tokens in the Authorization header, not cookies."

**Then:** "I diagnosed the setup: since we use stateless JWT auth with no server-side session, CSRF attacks don't apply — an attacker's site can't inject our Authorization header. The fix was \`csrf.disable()\` paired with \`SessionCreationPolicy.STATELESS\`. I also added this as an explicit comment in the config so no one accidentally re-enables it thinking it's a security gap."

**End:** "For teams using cookie-based sessions instead, I documented the \`CookieCsrfTokenRepository.withHttpOnlyFalse()\` pattern with the corresponding React fetch wrapper using \`X-XSRF-TOKEN\`. Tests cover both the happy path and the 403-without-token case."
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
