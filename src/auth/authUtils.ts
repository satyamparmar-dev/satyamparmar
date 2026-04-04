/**
 * ⚠️  LEGACY AUTH — Currently disabled (AUTH_LOGIN_ENABLED = false in authConfig.ts)
 * This file is kept for potential future re-enablement.
 * To re-activate: set AUTH_LOGIN_ENABLED = true and PBKDF2-upgrade the password hashing.
 * Do NOT remove without also removing: LoginPage.tsx, emailService.ts, useAuthStore.ts
 */
// ─── Auth Utilities ───────────────────────────────────────────────────────────
// Uses Web Crypto API — never stores plaintext passwords.
// Session tokens are HMAC-SHA-256-signed with APP_SECRET; payload binds passwordHash.

const APP_SECRET =
  (import.meta as unknown as { env: Record<string, string> }).env.VITE_APP_SECRET ||
  'satyverse-dev-fallback-secret-v1';

// ─── Hashing ──────────────────────────────────────────────────────────────────

/** Converts an ArrayBuffer to a lowercase hex string */
function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Generates a cryptographically random hex salt */
export function generateSalt(): string {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return bufToHex(arr.buffer);
}

/** SHA-256 hash of any string → hex */
export async function sha256(input: string): Promise<string> {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(input));
  return bufToHex(buf);
}

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
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function hmacVerify(
  message: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const expected = await hmacSign(message, secret);
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}

/** Hash a password with its salt using SHA-256 (two rounds for extra hardness) */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const round1 = await sha256(password + salt);
  const round2 = await sha256(round1 + salt + APP_SECRET);
  return round2;
}

// ─── Session Tokens ───────────────────────────────────────────────────────────
// Token format:  base64url(payload) + "." + signature
// payload = JSON { userId, email, expiresAt }
// signature = HMAC-SHA-256(key=APP_SECRET, message=payload + passwordHash)
// → forging requires knowing the user's passwordHash, which is in localStorage
//   but changing the passwordHash invalidates all old tokens

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function b64Encode(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function b64Decode(str: string): string {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  return decodeURIComponent(escape(atob(base64)));
}

export interface TokenPayload {
  userId: string;
  email: string;
  displayName: string;
  expiresAt: number;
}

export async function createSessionToken(
  payload: Omit<TokenPayload, 'expiresAt'>,
  passwordHash: string
): Promise<string> {
  const fullPayload: TokenPayload = {
    ...payload,
    expiresAt: Date.now() + SESSION_TTL_MS,
  };
  const encodedPayload = b64Encode(JSON.stringify(fullPayload));
  const signature = await hmacSign(encodedPayload + passwordHash, APP_SECRET);
  return `${encodedPayload}.${signature}`;
}

export async function verifySessionToken(
  token: string,
  passwordHash: string
): Promise<TokenPayload | null> {
  try {
    const dot = token.lastIndexOf('.');
    if (dot === -1) return null;

    const encodedPayload = token.slice(0, dot);
    const signature = token.slice(dot + 1);

    const valid = await hmacVerify(
      encodedPayload + passwordHash,
      signature,
      APP_SECRET
    );
    if (!valid) return null;

    const payload: TokenPayload = JSON.parse(b64Decode(encodedPayload));
    if (Date.now() > payload.expiresAt) return null;

    return payload;
  } catch {
    return null;
  }
}

// ─── Rate Limiting ────────────────────────────────────────────────────────────

const RATE_KEY = 'arch-login-attempts';
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60 * 1000; // 5 minutes

interface RateRecord {
  count: number;
  lockedUntil: number;
}

export function checkRateLimit(email: string): { allowed: boolean; remainingMs: number } {
  try {
    const raw = localStorage.getItem(RATE_KEY);
    const records: Record<string, RateRecord> = raw ? JSON.parse(raw) : {};
    const rec = records[email.toLowerCase()];
    if (!rec) return { allowed: true, remainingMs: 0 };
    if (rec.lockedUntil > Date.now()) {
      return { allowed: false, remainingMs: rec.lockedUntil - Date.now() };
    }
    return { allowed: true, remainingMs: 0 };
  } catch {
    return { allowed: true, remainingMs: 0 };
  }
}

export function recordFailedAttempt(email: string): void {
  try {
    const raw = localStorage.getItem(RATE_KEY);
    const records: Record<string, RateRecord> = raw ? JSON.parse(raw) : {};
    const key = email.toLowerCase();
    const rec = records[key] ?? { count: 0, lockedUntil: 0 };

    rec.count += 1;
    if (rec.count >= MAX_ATTEMPTS) {
      rec.lockedUntil = Date.now() + LOCKOUT_MS;
      rec.count = 0; // reset counter after lock
    }
    records[key] = rec;
    localStorage.setItem(RATE_KEY, JSON.stringify(records));
  } catch {
    // ignore storage errors
  }
}

export function clearFailedAttempts(email: string): void {
  try {
    const raw = localStorage.getItem(RATE_KEY);
    if (!raw) return;
    const records: Record<string, RateRecord> = JSON.parse(raw);
    delete records[email.toLowerCase()];
    localStorage.setItem(RATE_KEY, JSON.stringify(records));
  } catch {
    // ignore
  }
}

export function getRemainingAttempts(email: string): number {
  try {
    const raw = localStorage.getItem(RATE_KEY);
    const records: Record<string, RateRecord> = raw ? JSON.parse(raw) : {};
    const rec = records[email.toLowerCase()];
    if (!rec) return MAX_ATTEMPTS;
    return Math.max(0, MAX_ATTEMPTS - rec.count);
  } catch {
    return MAX_ATTEMPTS;
  }
}
