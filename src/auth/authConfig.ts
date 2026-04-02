/** Legacy password + OTP flow (LoginPage). Disabled when using email allowlist gate. */
export const AUTH_LOGIN_ENABLED = false;

/**
 * Single-page email gate: entered email must match an entry in the encrypted allowlist
 * (`public/data/allowlist.enc.json`). When `true`, it replaces `AUTH_LOGIN_ENABLED`.
 */
export const EMAIL_ALLOWLIST_GATE_ENABLED = true;

/**
 * Secret for PBKDF2 + AES-256-GCM over the allowlist payload. The build script
 * `scripts/encrypt-allowlist.mjs` reads this constant from this file — change it here,
 * then run `npm run build:allowlist` to regenerate `public/data/allowlist.enc.json`.
 *
 * Note: With a static SPA, this string ships in the JS bundle, so the list is not
 * secret from a determined user; encryption mainly keeps plaintext emails out of Git
 * and the repo’s static files.
 */
export const ALLOWLIST_CRYPTO_SECRET =
  'satyverse-allowlist-v1-rotate-me-then-npm-run-build-allowlist';
