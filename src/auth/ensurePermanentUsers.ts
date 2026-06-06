import type { UserRecord } from './useAuthStore';
import { PERMANENT_USER_SEEDS } from './permanentUserSeed';

const PERMANENT_EMAIL_KEYS = new Set(
  PERMANENT_USER_SEEDS.map((s) => s.email.toLowerCase().trim())
);

export function isPermanentUserEmail(email: string): boolean {
  return PERMANENT_EMAIL_KEYS.has(email.toLowerCase().trim());
}

/**
 * Merges built-in permanent accounts into persisted users (add or replace by email).
 */
export function mergePermanentUsers(
  users: Record<string, UserRecord>
): Record<string, UserRecord> {
  const next = { ...users };
  for (const seed of PERMANENT_USER_SEEDS) {
    const key = seed.email.toLowerCase().trim();
    next[key] = { ...seed, email: key };
  }
  return next;
}
