// ─── Auth Zustand Store ───────────────────────────────────────────────────────
// Persisted to localStorage. Passwords stored as SHA-256 hashes only.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PersistStorage } from 'zustand/middleware';
import { encryptedPersistStorage } from './encryptedStorage';
import { isPermanentUserEmail, mergePermanentUsers } from './ensurePermanentUsers';
import {
  generateSalt,
  hashPassword,
  createSessionToken,
  verifySessionToken,
  checkRateLimit,
  recordFailedAttempt,
  clearFailedAttempts,
  TokenPayload,
} from './authUtils';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserRecord {
  userId: string;
  email: string;
  displayName: string;
  passwordHash: string;
  salt: string;
  createdAt: number;
  avatarInitials: string;
  emailVerified: boolean;  // must be true before login is allowed
}

export interface AuthState {
  // Stored data
  users: Record<string, UserRecord>; // keyed by email (lowercase)
  sessionToken: string | null;
  currentUser: TokenPayload | null;
  isAuthenticated: boolean;

  // Auth actions
  register: (
    email: string,
    displayName: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;

  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;

  logout: () => void;

  validateSession: () => Promise<boolean>;

  updateDisplayName: (name: string) => Promise<void>;

  deleteAccount: (password: string) => Promise<{ success: boolean; error?: string }>;

  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<{ success: boolean; error?: string }>;

  // Called after OTP verified — creates account and logs user in
  markEmailVerified: (email: string) => Promise<{ success: boolean; error?: string }>;

  // Pre-register: stores credentials but doesn't set isAuthenticated
  preRegister: (
    email: string,
    displayName: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
}

type AuthPersistedSlice = Pick<AuthState, 'users' | 'sessionToken' | 'currentUser'>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

function generateUserId(): string {
  const arr = new Uint8Array(12);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: {},
      sessionToken: null,
      currentUser: null,
      isAuthenticated: false,

      // ── Register (legacy — now delegates to preRegister) ─────────────────────
      register: async (email, displayName, password) => {
        return get().preRegister(email, displayName, password);
      },

      // ── Pre-Register: store unverified user, no session created ───────────────
      preRegister: async (email, displayName, password) => {
        const key = email.toLowerCase().trim();

        if (isPermanentUserEmail(key)) {
          return {
            success: false,
            error: 'This account is already set up. Use Sign In with your password.',
          };
        }

        if (!key || !displayName.trim() || !password) {
          return { success: false, error: 'All fields are required.' };
        }

        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(key)) {
          return { success: false, error: 'Enter a valid email address.' };
        }

        if (password.length < 8) {
          return { success: false, error: 'Password must be at least 8 characters.' };
        }

        if (!/[A-Z]/.test(password)) {
          return { success: false, error: 'Password must contain at least one uppercase letter.' };
        }

        if (!/[0-9]/.test(password)) {
          return { success: false, error: 'Password must contain at least one number.' };
        }

        const { users } = get();
        // Allow re-registering an unverified account (e.g., user wants to resend OTP)
        if (users[key]?.emailVerified) {
          return { success: false, error: 'An account with this email already exists.' };
        }

        const salt = generateSalt();
        const passwordHash = await hashPassword(password, salt);
        const userId = generateUserId();

        const newUser: UserRecord = {
          userId,
          email: key,
          displayName: displayName.trim(),
          passwordHash,
          salt,
          createdAt: Date.now(),
          avatarInitials: getInitials(displayName),
          emailVerified: false,   // ← blocked until OTP confirmed
        };

        // Save the record but do NOT create a session — not authenticated yet
        set((s) => ({ users: { ...s.users, [key]: newUser } }));
        return { success: true };
      },

      // ── Mark Email Verified: flip flag and issue session ──────────────────────
      markEmailVerified: async (email) => {
        const key = email.toLowerCase().trim();
        const { users } = get();
        const user = users[key];
        if (!user) return { success: false, error: 'User not found.' };

        const verifiedUser: UserRecord = { ...user, emailVerified: true };

        const token = await createSessionToken(
          { userId: user.userId, email: key, displayName: user.displayName },
          user.passwordHash
        );

        const payload: TokenPayload = {
          userId: user.userId,
          email: key,
          displayName: user.displayName,
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        };

        set((s) => ({
          users: { ...s.users, [key]: verifiedUser },
          sessionToken: token,
          currentUser: payload,
          isAuthenticated: true,
        }));

        return { success: true };
      },

      // ── Login ─────────────────────────────────────────────────────────────────
      login: async (email, password) => {
        const key = email.toLowerCase().trim();

        // Restore built-in accounts (Register tab may have overwritten them this session)
        set((s) => ({ users: mergePermanentUsers(s.users) }));

        const rateCheck = checkRateLimit(key);
        if (!rateCheck.allowed) {
          const mins = Math.ceil(rateCheck.remainingMs / 60000);
          return {
            success: false,
            error: `Too many failed attempts. Try again in ${mins} minute${mins > 1 ? 's' : ''}.`,
          };
        }

        const { users } = get();
        const user = users[key];
        if (!user) {
          recordFailedAttempt(key);
          return { success: false, error: 'Invalid email or password.' };
        }

        const hash = await hashPassword(password, user.salt);
        if (hash !== user.passwordHash) {
          recordFailedAttempt(key);
          return { success: false, error: 'Invalid email or password.' };
        }

        // Block login for unverified accounts
        if (!user.emailVerified) {
          return {
            success: false,
            error: 'Email not verified. Please complete registration by verifying your email.',
          };
        }

        clearFailedAttempts(key);

        const token = await createSessionToken(
          { userId: user.userId, email: key, displayName: user.displayName },
          user.passwordHash
        );

        const payload: TokenPayload = {
          userId: user.userId,
          email: key,
          displayName: user.displayName,
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        };

        set({ sessionToken: token, currentUser: payload, isAuthenticated: true });
        return { success: true };
      },

      // ── Logout ────────────────────────────────────────────────────────────────
      logout: () => {
        set({ sessionToken: null, currentUser: null, isAuthenticated: false });
      },

      // ── Validate Session ──────────────────────────────────────────────────────
      validateSession: async () => {
        set((s) => ({ users: mergePermanentUsers(s.users) }));

        const { sessionToken, currentUser, users } = get();
        if (!sessionToken || !currentUser) {
          set({ isAuthenticated: false });
          return false;
        }

        const user = users[currentUser.email];
        if (!user) {
          set({ sessionToken: null, currentUser: null, isAuthenticated: false });
          return false;
        }

        const payload = await verifySessionToken(sessionToken, user.passwordHash);
        if (!payload) {
          set({ sessionToken: null, currentUser: null, isAuthenticated: false });
          return false;
        }

        // Refresh the currentUser from verified payload
        set({ currentUser: payload, isAuthenticated: true });
        return true;
      },

      // ── Update Display Name ───────────────────────────────────────────────────
      updateDisplayName: async (name) => {
        const { currentUser, users } = get();
        if (!currentUser) return;
        const key = currentUser.email;
        const user = users[key];
        if (!user) return;

        const updated: UserRecord = {
          ...user,
          displayName: name.trim(),
          avatarInitials: getInitials(name),
        };

        // Re-issue token (display name changed)
        const token = await createSessionToken(
          { userId: user.userId, email: key, displayName: name.trim() },
          user.passwordHash
        );

        set((s) => ({
          users: { ...s.users, [key]: updated },
          sessionToken: token,
          currentUser: { ...s.currentUser!, displayName: name.trim() },
        }));
      },

      // ── Change Password ───────────────────────────────────────────────────────
      changePassword: async (currentPassword, newPassword) => {
        const { currentUser, users } = get();
        if (!currentUser) return { success: false, error: 'Not authenticated.' };

        const key = currentUser.email;
        const user = users[key];
        if (!user) return { success: false, error: 'User not found.' };

        const currentHash = await hashPassword(currentPassword, user.salt);
        if (currentHash !== user.passwordHash) {
          return { success: false, error: 'Current password is incorrect.' };
        }

        if (newPassword.length < 8) {
          return { success: false, error: 'New password must be at least 8 characters.' };
        }
        if (!/[A-Z]/.test(newPassword)) {
          return { success: false, error: 'New password must contain an uppercase letter.' };
        }
        if (!/[0-9]/.test(newPassword)) {
          return { success: false, error: 'New password must contain a number.' };
        }

        const newSalt = generateSalt();
        const newHash = await hashPassword(newPassword, newSalt);

        const updated: UserRecord = {
          ...user,
          passwordHash: newHash,
          salt: newSalt,
        };

        // Re-issue token with new hash
        const token = await createSessionToken(
          { userId: user.userId, email: key, displayName: user.displayName },
          newHash
        );

        set((s) => ({
          users: { ...s.users, [key]: updated },
          sessionToken: token,
        }));

        return { success: true };
      },

      // ── Delete Account ────────────────────────────────────────────────────────
      deleteAccount: async (password) => {
        const { currentUser, users } = get();
        if (!currentUser) return { success: false, error: 'Not authenticated.' };

        const key = currentUser.email;
        const user = users[key];
        if (!user) return { success: false, error: 'User not found.' };

        const hash = await hashPassword(password, user.salt);
        if (hash !== user.passwordHash) {
          return { success: false, error: 'Password incorrect. Account not deleted.' };
        }

        const remaining = { ...users };
        delete remaining[key];

        set({
          users: remaining,
          sessionToken: null,
          currentUser: null,
          isAuthenticated: false,
        });

        return { success: true };
      },
    }),
    {
      name: 'satyverse-satyam-parmar-auth-store',
      storage: encryptedPersistStorage as PersistStorage<AuthPersistedSlice>,
      // Persist users and token only — NOT isAuthenticated (revalidated on load)
      partialize: (state) => ({
        users: state.users,
        sessionToken: state.sessionToken,
        currentUser: state.currentUser,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<AuthPersistedSlice>;
        return {
          ...current,
          users: mergePermanentUsers(p.users ?? {}),
          sessionToken: p.sessionToken ?? null,
          currentUser: p.currentUser ?? null,
        };
      },
    }
  )
);
