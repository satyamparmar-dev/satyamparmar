# Cursor Fix Prompt — Full Codebase Audit Remediation

Paste everything between the triple-backtick blocks into Cursor Composer.
Fill in the ONE env var before running.

---

```
You are a senior software engineer fixing a full security and quality audit for the Satyverse Java preparation app.
Work through every task below in order. For each task: read the file, apply the fix, save.
Do NOT skip any task. Do NOT refactor anything not listed. Confirm each fix before moving to the next.

---

## CONTEXT FILES — read these first

@src/services/api.ts
@src/auth/authConfig.ts
@src/auth/authUtils.ts
@src/auth/ContentAccessContext.tsx
@src/auth/allowlistCrypto.ts
@src/App.tsx
@src/routes/index.tsx
@src/pages/Learn.tsx
@src/pages/EmailLoginRoute.tsx
@src/components/AccessEnquiryNotice.tsx
@src/components/SignInToContinueCallout.tsx
@public/data/phase1.json
@public/data/phase2.json
@public/data/phase3.json
@public/data/phase4.json
@public/data/phase5.json
@public/data/phase7.json
@public/data/phase8.json
@public/data/phase9.json
@public/data/phase10.json
@.gitignore
@wrangler.toml
@package.json
@src/utils/markdown.ts

---

## TASK 1 — Fix Promise.all → Promise.allSettled in fetchPhase (CRITICAL)

File: @src/services/api.ts

Find this block:
```ts
const loaded = await Promise.all(
  extraDayNums.map((n) => api.get<LessonDay>(`days/${base}-day${n}.json`).then((r) => r.data))
);
```

Replace with:
```ts
const results = await Promise.allSettled(
  extraDayNums.map((n) =>
    api.get<LessonDay>(`days/${base}-day${n}.json`).then((r) => r.data)
  )
);
const loaded = results
  .filter((r): r is PromiseFulfilledResult<LessonDay> => r.status === 'fulfilled')
  .map((r) => r.value);
if (results.some((r) => r.status === 'rejected')) {
  console.warn('[fetchPhase] Some external day files failed to load — skipping missing days');
}
```

This ensures one missing day file never crashes the entire phase.

---

## TASK 2 — Move hardcoded secrets to environment variables

### 2a. Create .env file (development)
Create file: `.env`
Content:
```
VITE_APP_SECRET=satyverse-satyam-parmar-v1-2026
VITE_ALLOWLIST_CRYPTO_SECRET=satyverse-allowlist-v1-rotate-me-then-npm-run-build-allowlist
```

### 2b. Create .env.example (committed reference — no real values)
Create file: `.env.example`
Content:
```
# Copy to .env and fill in values before running locally
# NEVER commit .env to git
VITE_APP_SECRET=your-random-secret-min-32-chars
VITE_ALLOWLIST_CRYPTO_SECRET=your-allowlist-secret-then-run-npm-run-build-allowlist
```

### 2c. Update authConfig.ts
File: @src/auth/authConfig.ts

Replace the ALLOWLIST_CRYPTO_SECRET line:
```ts
// BEFORE
export const ALLOWLIST_CRYPTO_SECRET = 'satyverse-allowlist-v1-rotate-me-then-npm-run-build-allowlist';

// AFTER
export const ALLOWLIST_CRYPTO_SECRET =
  (import.meta as unknown as { env: Record<string, string> }).env.VITE_ALLOWLIST_CRYPTO_SECRET ||
  'satyverse-allowlist-v1-fallback-dev-only';
```

### 2d. Update authUtils.ts
File: @src/auth/authUtils.ts

Replace the APP_SECRET line:
```ts
// BEFORE
const APP_SECRET = 'satyverse-satyam-parmar-v1-2026';

// AFTER
const APP_SECRET =
  (import.meta as unknown as { env: Record<string, string> }).env.VITE_APP_SECRET ||
  'satyverse-dev-fallback-secret-v1';
```

### 2e. Verify .gitignore already has .env
File: @.gitignore
Confirm `.env` is listed. If not, add it on its own line.

---

## TASK 3 — Replace custom SHA-256 HMAC with Web Crypto HMAC-SHA-256

File: @src/auth/authUtils.ts

Find the `createSessionToken` and `validateSessionToken` functions that use:
```ts
const signature = await sha256(payload + passwordHash + APP_SECRET);
```

Replace the signature generation with proper HMAC-SHA-256:
```ts
async function hmacSign(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hmacVerify(message: string, signature: string, secret: string): Promise<boolean> {
  const expected = await hmacSign(message, secret);
  // Constant-time comparison to prevent timing attacks
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}
```

Replace all calls to `sha256(payload + passwordHash + APP_SECRET)` in token creation with:
```ts
const signature = await hmacSign(payload + passwordHash, APP_SECRET);
```

Replace all calls to token signature verification with:
```ts
const valid = await hmacVerify(payload + passwordHash, storedSignature, APP_SECRET);
```

---

## TASK 4 — Add security response headers to Cloudflare Workers

File: @wrangler.toml

Add or merge this section (if `[headers]` block already exists, merge into it):
```toml
[[headers]]
  for = "/*"
  [headers.values]
  X-Frame-Options = "DENY"
  X-Content-Type-Options = "nosniff"
  Referrer-Policy = "strict-origin-when-cross-origin"
  Permissions-Policy = "camera=(), microphone=(), geolocation=()"
  Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://api.emailjs.com; img-src 'self' data:; font-src 'self' data:"

[[headers]]
  for = "/data/*"
  [headers.values]
  Cache-Control = "public, max-age=300, stale-while-revalidate=600"
```

Note: `unsafe-inline` is needed for MUI's CSS-in-JS. If you later add a nonce-based CSP, remove it.

---

## TASK 5 — Fix markdown rendering with DOMPurify sanitization

File: @src/utils/markdown.ts

Add DOMPurify sanitization. First install the package — add to package.json devDependencies check, then update the file:

At the top of the file, add:
```ts
// Install: npm install dompurify && npm install --save-dev @types/dompurify
import DOMPurify from 'dompurify';
```

Find the place where `marked.parse()` output is returned (usually assigned to a variable or returned directly). Wrap it:
```ts
// BEFORE
return marked.parse(content) as string;

// AFTER
const raw = marked.parse(content) as string;
return DOMPurify.sanitize(raw, {
  ALLOWED_TAGS: ['h1','h2','h3','h4','h5','h6','p','br','strong','em','code',
                 'pre','blockquote','ul','ol','li','a','table','thead','tbody',
                 'tr','th','td','hr','span','div'],
  ALLOWED_ATTR: ['href','class','id','target','rel'],
  FORCE_BODY: true,
});
```

---

## TASK 6 — Swap highlight.js full bundle for Java-only core

Find where highlight.js is imported in the codebase (likely @src/utils/markdown.ts or a CodeBlock component).

Replace:
```ts
// BEFORE
import hljs from 'highlight.js';
```

With:
```ts
// AFTER — only register languages actually used in this app
import hljs from 'highlight.js/lib/core';
import java from 'highlight.js/lib/languages/java';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import json from 'highlight.js/lib/languages/json';
import yaml from 'highlight.js/lib/languages/yaml';
import sql from 'highlight.js/lib/languages/sql';
import bash from 'highlight.js/lib/languages/bash';
import xml from 'highlight.js/lib/languages/xml';

hljs.registerLanguage('java', java);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('json', json);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('xml', xml);
```

---

## TASK 7 — Add per-route ErrorBoundary

### 7a. Create ErrorBoundary component
Create file: `src/components/RouteErrorBoundary.tsx`
```tsx
import React from 'react';
import { Box, Typography, Button } from '@mui/material';

interface Props {
  children: React.ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class RouteErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[RouteErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            {this.props.fallbackMessage || 'This page failed to load'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {this.state.error?.message}
          </Typography>
          <Button variant="outlined" onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </Button>
          <Button variant="text" onClick={() => window.location.reload()} sx={{ ml: 1 }}>
            Reload page
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}
```

### 7b. Wrap routes in RouteErrorBoundary
File: @src/routes/index.tsx

Import the component:
```ts
import { RouteErrorBoundary } from '../components/RouteErrorBoundary';
```

Wrap the Learn, ScenarioDrill, and Quiz routes:
```tsx
// Learn route
<Route
  path="/learn/:dayNumber"
  element={
    <RouteErrorBoundary fallbackMessage="This day failed to load — the content file may be missing.">
      <Learn />
    </RouteErrorBoundary>
  }
/>

// ScenarioDrill route
<Route
  path="/scenarios"
  element={
    <RouteErrorBoundary fallbackMessage="Scenario drill failed to load.">
      <ScenarioDrill />
    </RouteErrorBoundary>
  }
/>

// Quiz route (if present)
<Route
  path="/quiz"
  element={
    <RouteErrorBoundary fallbackMessage="Quiz failed to load.">
      <Quiz />
    </RouteErrorBoundary>
  }
/>
```

---

## TASK 8 — Fix allowlist fallback cache on transient fetch errors

File: @src/auth/ContentAccessContext.tsx

Find the `fetchAllowlist` function or the `useEffect` that fetches and decrypts the allowlist.

Add sessionStorage fallback so authenticated users don't lose access on a transient 503:

```ts
const SESSION_CACHE_KEY = 'satyverse-allowlist-cache';

// After successful decrypt, cache the result:
const emails = await decryptAllowlistEmails(bundle, ALLOWLIST_CRYPTO_SECRET);
try {
  sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(emails));
} catch (_) { /* storage full — ignore */ }

// On fetch/decrypt error, try the sessionStorage fallback:
} catch (err) {
  console.error('[ContentAccess] allowlist load failed:', err);
  const cached = sessionStorage.getItem(SESSION_CACHE_KEY);
  if (cached) {
    console.warn('[ContentAccess] Using cached allowlist from sessionStorage');
    const cachedEmails: string[] = JSON.parse(cached);
    setAllowedEmails(cachedEmails);
    setAllowlistReady(true);
    // Do NOT setAllowlistError — cached data is valid
    return;
  }
  setAllowlistError(String(err));
  setAllowlistReady(true);
}
```

---

## TASK 9 — Add progress export / backup feature

File: @src/pages/Progress.tsx (or wherever the Progress page is)

At the top of the Progress component, add an export button:

```tsx
const handleExport = () => {
  const state = {
    exportedAt: new Date().toISOString(),
    progress: useAppStore.getState().progress,
    bookmarks: useAppStore.getState().bookmarks,
    notes: useAppStore.getState().notes,
  };
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `satyverse-progress-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
```

Add a button in the Progress page UI:
```tsx
<Button variant="outlined" size="small" onClick={handleExport}>
  Export Progress Backup
</Button>
```

---

## TASK 10 — Add PHASE_FOR_DAY comment to prevent silent desync

File: @src/services/api.ts

Find the `PHASE_FOR_DAY` function and add a comment above it:

```ts
/**
 * Maps a day number to its phase number.
 * ⚠️  MUST stay in sync with the phase day ranges in public/data/curriculum.json
 * If the curriculum changes, update both this function AND curriculum.json.
 * Days:  1–9  → Phase 1
 *       10–18 → Phase 2
 *       19–27 → Phase 3
 *       28–37 → Phase 4
 *       38–48 → Phase 5
 *       49–58 → Phase 6
 *       59–67 → Phase 7
 *       68–76 → Phase 8
 *       77–84 → Phase 9
 *       85–90 → Phase 10
 */
```

---

## TASK 11 — Add JSON schema validation script

Create file: `scripts/validate-day-files.mjs`

```js
#!/usr/bin/env node
/**
 * Validates all public/data/days/*.json files against the expected schema.
 * Run: node scripts/validate-day-files.mjs
 * Add to CI: npm run validate:days
 */
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DAYS_DIR = join(__dirname, '../public/data/days');

const REQUIRED_TOP_LEVEL = ['day', 'title', 'sections'];
const REQUIRED_SECTION_TYPES = ['why', 'theory', 'code', 'diagram', 'pitfalls', 'exercise', 'interview', 'cheatsheet'];
const CODE_LEVELS = ['basic', 'intermediate', 'advanced'];

let errors = 0;
let checked = 0;

const files = readdirSync(DAYS_DIR).filter(f => f.endsWith('.json') && f.startsWith('phase'));

for (const file of files) {
  const path = join(DAYS_DIR, file);
  let data;
  try {
    data = JSON.parse(readFileSync(path, 'utf8'));
  } catch (e) {
    console.error(`❌ ${file}: Invalid JSON — ${e.message}`);
    errors++;
    continue;
  }

  // Check top-level fields
  for (const key of REQUIRED_TOP_LEVEL) {
    if (data[key] === undefined) {
      console.error(`❌ ${file}: Missing top-level field "${key}"`);
      errors++;
    }
  }

  if (!Array.isArray(data.sections)) continue;

  // Check required section types exist
  const sectionTypes = data.sections.map(s => s.type);
  for (const type of REQUIRED_SECTION_TYPES) {
    if (type === 'code') continue; // checked separately
    if (!sectionTypes.includes(type)) {
      console.warn(`⚠️  ${file}: Missing section type "${type}"`);
    }
  }

  // Check 3 code sections with correct levels
  const codeSections = data.sections.filter(s => s.type === 'code');
  if (codeSections.length !== 3) {
    console.warn(`⚠️  ${file}: Expected 3 code sections, found ${codeSections.length}`);
  }
  for (const cs of codeSections) {
    if (!cs.output || cs.output.trim() === '') {
      console.error(`❌ ${file}: Code section "${cs.level}" has empty output field`);
      errors++;
    }
    if (!cs.code || cs.code.trim() === '') {
      console.error(`❌ ${file}: Code section "${cs.level}" has empty code field`);
      errors++;
    }
  }

  // Check interview section
  const interview = data.sections.find(s => s.type === 'interview');
  if (interview) {
    if (!interview.conceptual || interview.conceptual.length < 10) {
      console.warn(`⚠️  ${file}: interview.conceptual has fewer than 10 items (${interview.conceptual?.length ?? 0})`);
    }
    if (!interview.codeBased || interview.codeBased.length < 5) {
      console.warn(`⚠️  ${file}: interview.codeBased has fewer than 5 items (${interview.codeBased?.length ?? 0})`);
    }
  }

  checked++;
}

console.log(`\nValidated ${checked} day files. Errors: ${errors}`);
if (errors > 0) process.exit(1);
```

Add the script to `package.json` scripts section:
```json
"validate:days": "node scripts/validate-day-files.mjs"
```

---

## TASK 12 — Add .dev.vars for Cloudflare Workers local development

Create file: `.dev.vars`  (already in .gitignore — safe to create)

```
VITE_APP_SECRET=satyverse-satyam-parmar-v1-2026
VITE_ALLOWLIST_CRYPTO_SECRET=satyverse-allowlist-v1-rotate-me-then-npm-run-build-allowlist
```

---

## TASK 13 — Document dead legacy auth code

File: @src/auth/authUtils.ts and @src/pages/LoginPage.tsx

Add a banner comment at the top of each file:

```ts
/**
 * ⚠️  LEGACY AUTH — Currently disabled (AUTH_LOGIN_ENABLED = false in authConfig.ts)
 * This file is kept for potential future re-enablement.
 * To re-activate: set AUTH_LOGIN_ENABLED = true and PBKDF2-upgrade the password hashing.
 * Do NOT remove without also removing: LoginPage.tsx, emailService.ts, useAuthStore.ts
 */
```

---

## TASK 14 — Fix scroll listener cleanup in Learn page

File: @src/pages/Learn.tsx

Find any `window.addEventListener('scroll', ...)` calls.
Ensure every one has a corresponding cleanup in the useEffect return:

```ts
useEffect(() => {
  const handler = () => { /* ... reading progress logic ... */ };
  window.addEventListener('scroll', handler, { passive: true });
  return () => window.removeEventListener('scroll', handler); // ← this must exist
}, []);
```

If the listener is missing the `passive: true` option, add it (prevents scroll jank).
If the cleanup return is missing, add it.

---

## TASK 15 — Final: verify all phase JSON files do not have externalDayNumbers pointing to missing files

For each of these files:
@public/data/phase1.json
@public/data/phase2.json
@public/data/phase3.json
@public/data/phase4.json
@public/data/phase5.json
@public/data/phase7.json
@public/data/phase8.json
@public/data/phase9.json
@public/data/phase10.json

For each file:
1. Read it
2. Find the `externalDayNumbers` array (if present)
3. For each number N in that array, confirm the file `public/data/days/phase{X}-day{N}.json` exists in the filesystem
4. If ANY file is missing, report it as: "MISSING: public/data/days/phase{X}-day{N}.json — referenced in phase{X}.json but not on disk"
5. List all missing files at the end

---

## AFTER ALL TASKS — Summary report

After completing all 15 tasks, output:
1. A list of every file that was modified
2. A list of every file that was created
3. Any tasks that could not be completed and why
4. The command to run to install any new npm packages added: `npm install dompurify && npm install --save-dev @types/dompurify`
5. Remind to run: `npm run validate:days` to confirm all day files pass schema validation
```
