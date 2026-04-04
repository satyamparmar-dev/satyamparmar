/** Legacy password + OTP flow (LoginPage). Disabled when using email allowlist gate. */
export const AUTH_LOGIN_ENABLED = false;

/**
 * Email allowlist for **full** content (solutions, full theory, quiz answers, scenario drill
 * answers, etc.). When `true`, the app and lesson **previews** (day header, objectives,
 * “Why” tab, theory excerpt, assignment questions without solutions) stay public; sign-in
 * is via `/login`. Replaces `AUTH_LOGIN_ENABLED` when both would apply.
 */
export const EMAIL_ALLOWLIST_GATE_ENABLED = true;

/**
 * Secret for PBKDF2 + AES-256-GCM over the allowlist payload. Set
 * `VITE_ALLOWLIST_CRYPTO_SECRET` in `.env` (see `.env.example`). The script
 * `scripts/encrypt-allowlist.mjs` uses the same env var (or parses the fallback below),
 * then run `npm run build:allowlist` to regenerate `public/data/allowlist.enc.json`.
 *
 * Note: With a static SPA, this string ships in the JS bundle, so the list is not
 * secret from a determined user; encryption mainly keeps plaintext emails out of Git
 * and the repo’s static files.
 */
export const ALLOWLIST_CRYPTO_SECRET =
  (import.meta as unknown as { env: Record<string, string> }).env
    .VITE_ALLOWLIST_CRYPTO_SECRET || 'satyverse-allowlist-v1-fallback-dev-only';
