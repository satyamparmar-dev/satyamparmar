// ─── Email Service — OTP via EmailJS ─────────────────────────────────────────
// OTP is generated using crypto.getRandomValues (CSPRNG).
// Only a SHA-256 hash of the OTP is stored in component state — never the raw code.
// Max 3 attempts per OTP, 10-minute expiry, 60-second resend cooldown.

import emailjs from '@emailjs/browser';
import { EMAIL_CONFIG, isEmailConfigured } from './emailConfig';
import { sha256 } from './authUtils';

// Popular email provider domains — only these are accepted for registration
export const ALLOWED_PROVIDERS = new Set([
  // Google
  'gmail.com', 'googlemail.com',
  // Microsoft
  'outlook.com', 'hotmail.com', 'hotmail.co.uk', 'hotmail.fr',
  'live.com', 'live.co.uk', 'live.fr', 'live.in', 'msn.com',
  // Yahoo
  'yahoo.com', 'yahoo.co.uk', 'yahoo.co.in', 'yahoo.fr',
  'yahoo.de', 'yahoo.com.br', 'yahoo.com.au', 'ymail.com',
  // Apple
  'icloud.com', 'me.com', 'mac.com',
  // Proton
  'proton.me', 'protonmail.com', 'pm.me',
  // Other popular
  'aol.com', 'zoho.com', 'tutanota.com', 'fastmail.com',
  'gmx.com', 'gmx.net',
]);

export function getEmailDomain(email: string): string {
  return email.toLowerCase().trim().split('@')[1] ?? '';
}

export function isAllowedProvider(email: string): boolean {
  return ALLOWED_PROVIDERS.has(getEmailDomain(email));
}

export function getProviderName(email: string): string {
  const domain = getEmailDomain(email);
  const map: Record<string, string> = {
    'gmail.com': 'Gmail', 'googlemail.com': 'Gmail',
    'outlook.com': 'Outlook', 'hotmail.com': 'Hotmail', 'live.com': 'Live',
    'yahoo.com': 'Yahoo', 'ymail.com': 'Yahoo',
    'icloud.com': 'iCloud', 'me.com': 'iCloud', 'mac.com': 'iCloud',
    'proton.me': 'Proton Mail', 'protonmail.com': 'Proton Mail', 'pm.me': 'Proton Mail',
    'aol.com': 'AOL', 'zoho.com': 'Zoho', 'fastmail.com': 'Fastmail',
  };
  return map[domain] ?? domain;
}

// ─── OTP Generation ───────────────────────────────────────────────────────────

/** Generates a cryptographically random 6-digit code (100000–999999) */
function generateRawOTP(): string {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  // Map to [100000, 999999]
  const code = (buf[0] % 900000) + 100000;
  return String(code);
}

export interface PendingOTP {
  otpHash: string;       // SHA-256 of raw OTP — never store raw
  email: string;
  expiresAt: number;     // unix ms
  attempts: number;      // wrong guesses so far
  sentAt: number;        // for resend cooldown
}

export const OTP_EXPIRY_MS   = 10 * 60 * 1000; // 10 minutes
export const OTP_MAX_ATTEMPTS = 3;
export const RESEND_COOLDOWN_MS = 60 * 1000;    // 60 seconds

/** Generate a new OTP and return the pending record + raw code for email delivery */
export async function createOTP(email: string): Promise<{ pending: PendingOTP; raw: string }> {
  const raw = generateRawOTP();
  const otpHash = await sha256(raw + email.toLowerCase());
  const pending: PendingOTP = {
    otpHash,
    email: email.toLowerCase(),
    expiresAt: Date.now() + OTP_EXPIRY_MS,
    attempts: 0,
    sentAt: Date.now(),
  };
  return { pending, raw };
}

export type OTPCheckResult =
  | { valid: true }
  | { valid: false; reason: 'expired' | 'max_attempts' | 'wrong' };

/** Verify a user-entered code against the pending OTP record */
export async function checkOTP(
  entered: string,
  pending: PendingOTP
): Promise<{ result: OTPCheckResult; updatedPending: PendingOTP }> {
  if (Date.now() > pending.expiresAt) {
    return { result: { valid: false, reason: 'expired' }, updatedPending: pending };
  }

  if (pending.attempts >= OTP_MAX_ATTEMPTS) {
    return { result: { valid: false, reason: 'max_attempts' }, updatedPending: pending };
  }

  const enteredHash = await sha256(entered.trim() + pending.email);
  if (enteredHash === pending.otpHash) {
    return { result: { valid: true }, updatedPending: pending };
  }

  const updatedPending: PendingOTP = { ...pending, attempts: pending.attempts + 1 };
  return { result: { valid: false, reason: 'wrong' }, updatedPending };
}

// ─── Email Sending ────────────────────────────────────────────────────────────

export interface SendOTPResult {
  success: boolean;
  error?: string;
  isDemoMode?: boolean;  // true when EmailJS not configured — shows code in UI
}

/**
 * Sends the OTP to the user's email via EmailJS.
 * If EmailJS is not yet configured, falls back to "demo mode"
 * which surfaces the code directly in the UI.
 */
export async function sendOTPEmail(
  email: string,
  displayName: string,
  otp: string
): Promise<SendOTPResult> {
  if (!isEmailConfigured()) {
    // Demo mode: caller will display the code on-screen
    console.info('[Satyverse(Satyam Parmar) Auth] EmailJS not configured — running in demo mode. OTP:', otp);
    return { success: true, isDemoMode: true };
  }

  try {
    await emailjs.send(
      EMAIL_CONFIG.SERVICE_ID,
      EMAIL_CONFIG.TEMPLATE_ID,
      {
        email: email,
        to_name: displayName,
        passcode: otp,
        time: new Date(Date.now() + OTP_EXPIRY_MS).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
      { publicKey: EMAIL_CONFIG.PUBLIC_KEY }
    );
    return { success: true };
  } catch (err: unknown) {
    // EmailJS throws { status: number, text: string } — not a standard Error
    console.error('[Satyverse(Satyam Parmar) Auth] EmailJS error:', err);
    let msg = 'Unknown error';
    if (err && typeof err === 'object') {
      const e = err as Record<string, unknown>;
      if (typeof e.text === 'string')        msg = `${e.text} (status ${e.status ?? '?'})`;
      else if (typeof e.message === 'string') msg = e.message;
      else                                    msg = JSON.stringify(e);
    } else if (typeof err === 'string') {
      msg = err;
    }
    return { success: false, error: `Email send failed: ${msg}` };
  }
}
